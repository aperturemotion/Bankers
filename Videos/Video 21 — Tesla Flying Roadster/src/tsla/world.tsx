import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import { rInOut, rOut, drift2, clamp01 } from "./anim";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// ★ THE JOURNEY CAMERA (Timur, 2026-09-26 — Bankers/CLAUDE.md §2.5): "The video is one continuous
// journey. A virtual camera travels from point A to point B to point C; every scene is a place the
// camera arrives at, never a cut."
//
// The model is a pinhole camera over a world of flat LAYERS:
//   · the camera is a position {x, y, z}: x/y in px measured at unit distance, z along the lens axis;
//   · every scene has a STATION — the camera position it is authored for — and layers at a rest
//     distance R from it: FG 0.5 (sharp, large, cropped by the frame edge) and MID 1 (sharp — the
//     construction). ★ NO BACKGROUND LAYER (Timur, 2026-09-26: "I don't want those blurred shapes in the
//     background. Remove that completely") — behind the MID there is only the field and its key light;
//   · a layer at distance D = station.z + R − camera.z draws at scale R/D, shifted by −Δxy/D.
// So one camera move moves every layer at its own speed — the parallax is geometry, not a per-layer
// hand-tuned number, and a FG layer always travels twice as fast as the MID.
//
// ★ NOTHING EVER SITS BLURRED BEHIND. A layer defocuses ONLY as it rushes PAST the lens (below 60% of its
// own rest distance). Going FAR it does not blur, it FADES: a place the camera is arriving at fades in as
// it comes within 1.5× → 1.25× of its rest distance, and a place the camera zooms out of fades away the
// same way (Timur, 2026-09-26: "when the camera is zooming out fade the pillars and valve out").
// ⚠ A CSS blur is applied in the layer's LOCAL space and then scaled, so the screen blur is divided
// by the layer's scale before it is written.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export type V3 = { x: number; y: number; z: number };
/** `zoom` (Timur, 2026-09-28: "the transitions with the zooming in feel a little linear, make sure to smooth out the
 *  camera movement when it starts moving and when it approaches the final destination" — Bankers/CLAUDE.md §2.5.1d).
 *  A layer's size is R / distance, so an ease on the camera's z still makes the arriving place grow fastest in the LAST
 *  frames (1/D² is 5× steeper at the end of a 1.25 push): the arrival slams. A `zoom` move instead interpolates the
 *  arriving layer's DISTANCE geometrically — D = Ds·(De/Ds)^e, a constant zoom RATE — shaped by a smootherstep e (zero
 *  speed and acceleration at both ends). `endD` is that layer's distance when the move ends (a MID at its station: 1). */
export type Move = {
  t0: number; t1: number; d: Partial<V3>; ease: "io" | "out" | "zoom" | "arc"; endD?: number;
  /** ★ the progress curve (Video 11 on; omitted = SETTLE, so every earlier film runs exactly as it did): "fast" is the Style 3
   *  films' own in-out for their faster hand-overs (Timur, 2026-10-15: "overall the style needs to be faster, use [the Style 3 films’] speed and
   *  camera movement amounts as a reference"); "glide" a gentle sine in-out for a long hold's focus move ("the scenes stay still for
   *  too long, there needs to be camera movement zooming in on the main objects") */
  curve?: "fast" | "glide";
};

export const FG = 0.5;
export const MID = 1;
const ORIGIN = { x: 540, y: 960 };

/** ★ SETTLE (Timur, 2026-09-29: "as the camera approaches the new scene, it needs to smooth into it more rather than
 *  abruptly stopping at the final point" — Style 3: "the last few percent of every animation takes the longest"). The
 *  smootherstep it replaces peaked mid-move and braked over its last third. SETTLE starts softly, peaks ~29% in, and the
 *  whole second half is one long deceleration: the last 30% of the time covers 5% of the move (Bankers/STYLE.md §8.2). */
export const SETTLE = Easing.bezier(0.45, 0.05, 0.12, 1);
/** ★ FAST — the Style 3 films' in-out (their anim.ts INOUT), for their 32–36 f hand-overs: it peaks ~39% in and reaches 95% at 77%,
 *  so it still smooths into its stop; at 32 f over 1,224 px it accelerates ≤ 9.3 px/f² (SETTLE: 23.9, a jolt — STYLE §8.2) */
export const FAST = Easing.bezier(0.45, 0.05, 0.35, 1);
/** ★ GLIDE — a sine in-out: a long, even, gentle move (a hold's focus), moving through most of its span rather than braking early */
export const GLIDE = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(t));
const curveOf = (c?: Move["curve"]) => (c === "fast" ? FAST : c === "glide" ? GLIDE : SETTLE);
export const zoomT = (f: number, a: number, b: number, curve?: Move["curve"]) => curveOf(curve)(clamp01((f - a) / (b - a)));
/** the share of a zoom move done at eased progress e: the distance goes Ds → De geometrically */
export const zoomFrac = (e: number, dz: number, De = MID) => {
  const Ds = De + dz;
  if (Math.abs(dz) < 1e-6 || Ds <= 0) return e;
  return (Ds - Ds * Math.pow(De / Ds, e)) / (Ds - De);
};
const easeOf = (m: Move, f: number) =>
  // ★ "io" (slides, flat travels) runs on SETTLE too (Timur, 2026-09-29: "the camera movement should always be smooth no
  // matter what"); only ARRIVE keeps "out", on the film's first frame. ★ "arc" rises and returns (sin π·progress): a slide's
  // depth arc, the Style 3 films' pull-back mid-pan (their ARC 0.08) — it ends where it began, so no station moves
  m.ease === "zoom" ? zoomFrac(zoomT(f, m.t0, m.t1, m.curve), m.d.z ?? 0, m.endD ?? MID)
    : m.ease === "io" ? zoomT(f, m.t0, m.t1, m.curve)
    : m.ease === "arc" ? Math.sin(Math.PI * zoomT(f, m.t0, m.t1, m.curve))
    : rOut(f, m.t0, m.t1);

/** the camera on its path — the sum of every move so far (each eased), plus the idle drift that keeps
 *  every layer parallaxing even while the camera "holds" (Style 3: nothing is ever still) */
export const camPath = (start: V3, moves: Move[], f: number, drift = true): V3 => {
  const c = { ...start };
  for (const m of moves) {
    const e = easeOf(m, f);
    c.x += (m.d.x ?? 0) * e;
    c.y += (m.d.y ?? 0) * e;
    c.z += (m.d.z ?? 0) * e;
  }
  if (drift) {
    c.x += drift2(f, 231, 97, 6);
    c.y += drift2(f, 173, 79, 4);
    c.z += drift2(f, 211, 89, 0.008);
  }
  return c;
};

/** screen-space blur for a layer at distance D with rest distance R */
/** `nearAt`: the fraction of its rest distance at which a layer starts to defocus as it nears the lens. 0.6 by
 *  default, so a deliberate push-in (the record push takes the tape to 0.68) stays sharp; a layer the camera is
 *  about to push PAST sets it higher (0.85), so it defocuses before it can cross a sharp caption (B's figures
 *  crossed "A year ago, 6.26%." at frame 206 in the first build). */
export const dof = (D: number, R: number, nearAt = 0.6, gain = 1) => {
  const k = D / R;
  return k < nearAt ? 22 * gain * (nearAt - k) / nearAt : 0;
};

/** how visible a layer is by DISTANCE: 1 up to far[0] × its rest distance, 0 beyond far[1], eased between */
export const farFade = (k: number, far: [number, number] = [1.25, 1.5]) =>
  1 - rInOut(k, far[0], far[1]);

export type LayerSpec = {
  id: string;              // probe group, e.g. "A:fg"
  st: V3;                  // the scene's station
  R: number;               // rest distance (FG / MID)
  op: number;              // time-window opacity (0 → not mounted)
  nearAt?: number;         // see dof()
  /** ★ how hard a layer defocuses once it nears the lens (dof()'s gain). The push-PAST layer sets 1.8 (full sweep,
   *  2026-09-26): at 1 its figures were still ~8 px soft when they crossed the pinned caption — the race's "$1.22T" and
   *  "3.8×" read as letters behind "Micron almost quadrupled." for ~12 frames. At 1.8 they pass as a glow. */
  blurGain?: number;
  far?: [number, number];  // see farFade()
  /** the distance fade is an ENTRANCE only: after this frame it no longer applies, so a place never fades OUT — it
   *  leaves by moving (Timur, 2026-09-26: "no fade out transitions make them seemless directional ones instead") */
  farUntil?: number;
  /** the camera this layer is projected by, when not the World's: an FG piece ENTERING on a push is pinned to the camera
   *  as if the push had already landed (Video.tsx), so it glides into its corner (FgEnter) instead of swelling out of
   *  the vanishing point and fading up mid-push (Timur, 2026-09-29: "they appear in a sudden manner") */
  cam?: V3;
  node: React.ReactNode;
};

/** ★ ONE LAYER, projected. Nearer layers paint over farther ones (zIndex from D). */
export const Layer: React.FC<{ cam: V3; spec: LayerSpec }> = ({ cam: worldCam, spec }) => {
  const { st, R, op, node, id } = spec;
  const cam = spec.cam ?? worldCam;
  const f = useCurrentFrame();
  if (op <= 0.002) return null;
  const D = st.z + R - cam.z;
  if (D <= 0.03) return null;                        // behind the lens
  const k = D / R;
  const near = clamp01((k - 0.1) / 0.22);            // it has passed the lens
  const o = op * near * (spec.farUntil !== undefined && f > spec.farUntil ? 1 : farFade(k, spec.far));
  if (o <= 0.002) return null;
  const s = R / D;
  const tx = -(cam.x - st.x) / D;
  const ty = -(cam.y - st.y) / D;
  const blur = dof(D, R, spec.nearAt, spec.blurGain);
  return (
    <div
      data-probe-group={id}
      data-blur={blur.toFixed(2)}
      style={{
        position: "absolute", inset: 0, opacity: o,
        zIndex: Math.max(1, Math.round(6000 - D * 1000)),
        transformOrigin: `${ORIGIN.x}px ${ORIGIN.y}px`,
        transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(5)})`,
        // local-space blur: the screen blur divided by the scale it is about to be drawn at
        filter: blur > 0.25 ? `blur(${(blur / s).toFixed(2)}px)` : undefined,
      }}
    >
      {node}
    </div>
  );
};

export const World: React.FC<{ cam: V3; layers: LayerSpec[] }> = ({ cam, layers }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    {layers.map((l) => <Layer key={l.id} cam={cam} spec={l} />)}
  </div>
);

/** ★ AN ELEMENT ENTERING FROM DEPTH (§2.5: "every asset enters from an edge or from depth … eased,
 *  never linear, never snapping"): it comes forward out of the distance — smaller, soft, transparent —
 *  and settles. Pass an eased 0..1; `origin` keeps the scale anchored where the element is aligned. */
export const fromDepth = (p: number, origin = "50% 50%", pre = ""): React.CSSProperties => {
  const q = clamp01(p);
  return {
    opacity: clamp01(q * 1.7),
    transform: `${pre} scale(${(0.8 + 0.2 * q).toFixed(4)})`.trim(),
    transformOrigin: origin,
    filter: q < 0.995 ? `blur(${((1 - q) * 7).toFixed(2)}px)` : undefined,
  };
};

/** ★ AN FG PIECE ENTERING ON A PUSH (Timur, 2026-09-29: the corner objects "appear in a sudden manner. I need them to
 *  have more of a smooth seamless transition", the way Style 3 enters things — its rule E4: fade while
 *  moving into place on the out curve). Its layer is pinned to the landed camera (LayerSpec.cam), and it RISES into its
 *  corner from below the frame edge, drifting in from its own side: FG_ENTER.rise / .side px over FG_ENTER.dur frames
 *  on OUT (the long settle), opaque by FG_ENTER.fade frames. Bankers/STYLE.md §7.8. */
export const FG_ENTER = { rise: 150, side: 60, dur: 30, fade: 12 } as const;
export const FgEnter: React.FC<{ at: number; side: "left" | "right"; children: React.ReactNode }> = ({ at, side, children }) => {
  const f = useCurrentFrame();
  const e = rOut(f, at, at + FG_ENTER.dur);
  const o = rInOut(f, at, at + FG_ENTER.fade);
  if (o <= 0.001) return null;
  const dx = (side === "left" ? -1 : 1) * FG_ENTER.side * (1 - e), dy = FG_ENTER.rise * (1 - e);
  return <div style={{ position: "absolute", inset: 0, opacity: o, transform: e < 0.9995 ? `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)` : undefined }}>{children}</div>;
};

/** the idle life of a held element — each one on its own periods, so no two drift in step */
export const useIdle = (seed: number, amp = 6) => {
  const f = useCurrentFrame();
  return {
    x: drift2(f + seed * 37, 197 + seed * 11, 83 + seed * 5, amp * 0.6),
    y: drift2(f + seed * 53, 151 + seed * 13, 71 + seed * 7, amp),
  };
};
