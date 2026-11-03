// ══ BANKERS CLONE of Style 3 Video 26 — the Bankers pass applied (Bankers/CLAUDE.md §2): greys → the blue
// family by Resources/apply-palette.mjs, every face Anton 400, the outro carries the Bankers logo.

import React from "react";
import { useCurrentFrame } from "remotion";
import { theme, LAYOUT } from "./theme";
import { DATA, SHOUT, SHOUT_SQUEEZE, VOICE } from "./fonts";
import { rOut, rIn, rInOut, alpha, clamp01, mixHex } from "./anim";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// THE 3D KIT — the material language the reference set actually renders in.
//
// Measured targets (STEP0_DIAGNOSIS.md): frame 44–90% PURE BLACK · saturation near zero ·
// ONE glowing green source · red only for negative states · something always moving.
//
// So: every solid here is GREYSCALE chrome/glass/matte, and colour enters only as (a) the single
// green key raking across a surface and (b) red on a genuinely negative state. Depth comes from
// real perspective transforms, edge highlights, contact shadows and a floor reflection — never a
// flat card with a drop shadow.
//
// ★ THE KEY LIGHT IS AT ONE PLACE IN THE WORLD. `KEY` below is that direction; every surface's
//   highlight and rim is derived from it, so the whole video is lit by one source.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const CX = LAYOUT.W / 2;
/** the single key: upper-left, raking across. Everything derives its highlight from this. */
export const KEY = { x: -0.62, y: -0.78 };

/** greyscale chrome — a machined face lit from the key, with a green rim where the light grazes */
export const chromeFace = (v = 1): React.CSSProperties => ({
  background:
    `linear-gradient(146deg, ${mixHex("#003A7C", "#ffffff", 0.30 * v)} 0%, ` +
    `${mixHex("#002A5A", "#ffffff", 0.10 * v)} 26%, #001731 52%, #000E1D 78%, #001834 100%)`,
});
/** matte plastic — darker, no specular, for objects that must recede */
export const matteFace: React.CSSProperties = {
  background: "linear-gradient(150deg, #002651 0%, #001A38 48%, #001023 100%)",
};
/** glass — present but not real: near-transparent with a bright edge */
export const glassFace = (v = 1): React.CSSProperties => ({
  background: `linear-gradient(150deg, rgba(255,255,255,${0.07 * v}) 0%, rgba(255,255,255,${0.02 * v}) 50%, rgba(255,255,255,${0.05 * v}) 100%)`,
});

/** the platinum rim the key throws along an edge — the ONE light in the frame */
export const rim = (v: number) => `inset 0 1px 0 ${alpha(theme.accent, 0.55 * v)}, inset 1px 0 0 ${alpha(theme.accent, 0.30 * v)}`;
export const keyGlow = (v: number, r = 60) =>
  v <= 0.01 ? undefined : `drop-shadow(0 0 ${r * v}px ${alpha(theme.accent, 0.30 * v)})`;

/** ★ CONTINUOUS LIFE — a slow orbit that never stops. Wraps any group; the whole video sits in
 *  one of these so no frame is ever identical two seconds later. */
export const Orbit: React.FC<{
  children: React.ReactNode; amp?: number; period?: number; tilt?: number; z?: number; phase?: number;
}> = ({ children, amp = 7, period = 260, tilt = 0.42, z = 1500, phase = 0 }) => {
  const f = useCurrentFrame();
  const a = Math.sin((f / period) * Math.PI * 2 + phase) * amp;
  const b = Math.cos((f / (period * 1.37)) * Math.PI * 2 + phase) * amp * tilt;
  return (
    <div style={{ position: "absolute", inset: 0, perspective: z, perspectiveOrigin: "50% 44%" }}>
      <div style={{
        position: "absolute", inset: 0, transformStyle: "preserve-3d",
        transform: `rotateY(${a.toFixed(3)}deg) rotateX(${b.toFixed(3)}deg)`,
      }}>{children}</div>
    </div>
  );
};

// ══ THE CAMERA ════════════════════════════════════════════════════════════════════════════════
/** ★ A KEYFRAMED CAMERA. The stage is a WORLD that can be taller than the frame; the camera
 *  pans and zooms to whatever the voice is talking about, and every move lands on the house
 *  curve — quick off the mark, then a long settle. Nothing arrives abruptly. */
/** ★ `ease: "io"` runs a key on the S-curve instead of the house OUT curve. OUT is right for a
 *  settle; a TRAVEL from rest over real distance on OUT moves ~13% of the way in its first frame,
 *  which the pop scan measures as a one-frame spike (V25: a 215 px pull-back at f768 — the V21
 *  smoothness law, "anything that covers real distance from rest uses rInOut"). */
export type CamKey = { at: number; x?: number; y?: number; z?: number; dur?: number; ease?: "out" | "io" };
/**
 * ⚠⚠ KEYS MUST BE IN ASCENDING TIME ORDER, and this is enforced rather than assumed.
 *
 * The accumulator below walks the array IN ARRAY ORDER and breaks at the first key the playhead
 * has not reached. A key placed out of order therefore does two bad things at once: it terminates
 * the walk early, so every later key is dead; and when the playhead finally does reach the key
 * before it, that later key's easing is ALREADY PART-ELAPSED and applies most of its move in a
 * single frame. The result is a camera that sits still and then lurches — which is exactly what
 * Video 9's lost-decade beat did on "ten years, negative" (2026-08-28), because the shortfall is
 * spoken before the low but was cued after it.
 *
 * It is a silent failure: nothing throws, the types are fine, and it only shows up as a glitch on
 * one specific frame range. So it throws now.
 */
const assertOrdered = (keys: CamKey[]) => {
  for (let i = 1; i < keys.length; i++) {
    if (keys[i].at < keys[i - 1].at) {
      throw new Error(
        `Cam keys out of order: key ${i} is at frame ${keys[i].at} but key ${i - 1} is at ` +
        `${keys[i - 1].at}. Camera keyframes must ascend in time — sort them, and check you have ` +
        `not cued a later-spoken moment before an earlier one.`,
      );
    }
  }
};

export const camAt = (f: number, keys: CamKey[]) => {
  assertOrdered(keys);
  let cur = { x: 0, y: 0, z: 1 };
  for (const k of keys) {
    const p = (k.ease === "io" ? rInOut : rOut)(f, k.at, k.at + (k.dur ?? 46));
    if (p <= 0.0001) break;
    const t = { x: k.x ?? cur.x, y: k.y ?? cur.y, z: k.z ?? cur.z };
    cur = {
      x: cur.x + (t.x - cur.x) * p,
      y: cur.y + (t.y - cur.y) * p,
      z: cur.z + (t.z - cur.z) * p,
    };
  }
  return cur;
};
export const Cam: React.FC<{ keys: CamKey[]; children: React.ReactNode }> = ({ keys, children }) => {
  const f = useCurrentFrame();
  const c = camAt(f, keys);
  return (
    <div style={{
      position: "absolute", inset: 0, transformOrigin: "50% 46%",
      transform: `scale(${c.z.toFixed(4)}) translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`,
    }}>{children}</div>
  );
};

// ══ THE BEAT TRANSITION ═══════════════════════════════════════════════════════════════════════
type Dir = "left" | "right" | "up" | "down";
const vec = (d?: Dir): [number, number] =>
  d === "left" ? [-1, 0] : d === "right" ? [1, 0] : d === "up" ? [0, -1] : d === "down" ? [0, 1] : [0, 0];
/** ★ EVERY BEAT ENTERS AND LEAVES ON MOVEMENT, NEVER ON OPACITY ALONE. It slides in from one
 *  side while zooming up from 0.86, takes a long time to settle the last few percent, and then
 *  pushes away and out. A plain cross-fade between two objects in one slot reads as a smear —
 *  this is what replaces it. */
export const Beat: React.FC<{
  at: number; end: number; from?: Dir; toward?: Dir; dist?: number; zoom?: number;
  inDur?: number; outDur?: number; children: React.ReactNode;
}> = ({
  at, end, from = "right", toward, dist = 420, zoom = 0.14, inDur = 46, outDur = 24, children,
}) => {
  const f = useCurrentFrame();
  const pin = rOut(f, at, at + inDur);
  const pout = rIn(f, end - outDur, end);
  const o = clamp01(pin * 2.4) * (1 - clamp01(pout * 1.35));
  if (o <= 0.001) return null;
  const [ix, iy] = vec(from);
  const [ox, oy] = vec(toward ?? from);
  const tx = ix * dist * (1 - pin) - ox * dist * 0.5 * pout;
  const ty = iy * dist * (1 - pin) - oy * dist * 0.5 * pout;
  const s = (1 - zoom + zoom * pin) * (1 + 0.1 * pout);
  return (
    <div style={{
      position: "absolute", inset: 0, opacity: o, transformOrigin: "50% 46%",
      transform: `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(4)})`,
    }}>{children}</div>
  );
};

/** an EXTRUDED block: front face + a lit top bevel + a dark right side + contact shadow +
 *  floor reflection. The depth is real geometry, not a shadow. */
export const Slab: React.FC<{
  x: number; y: number; w: number; h: number; d?: number; on?: number;
  glass?: number; lit?: number; rotY?: number; rotX?: number; children?: React.ReactNode;
  reflect?: boolean; scale?: number;
  /** 0..1 — how heavy the cast shadow is. Dialled down where it distracts. */
  shadow?: number;
}> = ({
  x, y, w, h, d = 34, on = 1, glass = 0, lit = 0, rotY = 0, rotX = 0, children,
  reflect = true, scale = 1, shadow = 1,
}) => {
  if (on <= 0.001) return null;
  // ★ `glass` is CONTINUOUS and the two materials CROSS-FADE. It used to switch at glass > 0.5,
  // which turned the hook's 2028 block from chrome to glass in a single frame — an eased driver
  // feeding a hard threshold, the defect class this project keeps re-learning.
  const g = clamp01(glass);
  const border = `${(1 + 0.5 * g).toFixed(2)}px solid ${alpha("#ffffff", 0.10 + 0.20 * g)}`;
  const body = (mirror: boolean) => (
    <div style={{
      position: "absolute", left: -w / 2, top: -h / 2, width: w, height: h,
      transformStyle: "preserve-3d",
      transform: mirror ? "scaleY(-1)" : undefined,
      opacity: mirror ? 0.20 * on : on,
      WebkitMaskImage: mirror ? "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 62%)" : undefined,
      filter: mirror ? "blur(3px)" : undefined,
    }}>
      {/* the extrusion — a slice stack reads as solid depth and takes the key on its top edge */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          // a hollow object loses its solid interior as it turns to glass
          position: "absolute", inset: 0, borderRadius: 10, opacity: 1 - 0.8 * g,
          transform: `translateZ(${(-d * (i + 1)) / 6}px)`,
          background: `rgba(${8 + i * 2},${8 + i * 2},${10 + i * 2},1)`,
          boxShadow: i === 5 ? `0 0 0 1px ${alpha("#ffffff", 0.06)}` : undefined,
        }} />
      ))}
      {/* the front face — the two materials are stacked and cross-faded */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 10, border,
        boxShadow: `${rim((0.5 + 0.5 * lit) * (1 - 0.5 * g))}, 0 26px 60px rgba(0,0,0,${(0.9 * shadow * (1 - 0.6 * g)).toFixed(2)})`,
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, ...chromeFace(1), opacity: 1 - g }} />
        <div style={{ position: "absolute", inset: 0, ...glassFace(1), opacity: g }} />
        {/* the key raking across the surface — a WHITE specular over a wider, cooler second
            rake in the source's own colour. In the green build the second rake had to be held
            down hard or the frame read green; a PLATINUM source is already near-neutral, so it
            runs a little stronger here and does what a real studio strip does — widens the
            highlight and cools its shoulder. The metal still stays metal. */}
        <div style={{
          position: "absolute", inset: 0,
          background:
            `linear-gradient(${118 + rotY * 0.6}deg, transparent 34%, ${alpha("#ffffff", 0.09 + 0.13 * lit)} 50%, transparent 66%),` +
            `linear-gradient(${118 + rotY * 0.6}deg, transparent 38%, ${alpha(theme.accent, 0.09 + 0.15 * lit)} 50%, transparent 62%)`,
        }} />
        {/* ⚠⚠ THE FACE CONTENT MUST BE POSITIONED, AND MUST FILL THE FACE. Two traps in one line:
            (1) within a stacking context CSS paints positioned descendants ABOVE non-positioned
            block boxes — so once the material became two absolute layers, every plain <span>
            child was painted OVER and every slab label vanished; (2) a bare `position:relative`
            wrapper is a zero-size flex item, so any ABSOLUTE child (the memo's page) then
            positions against a point and collapses. The wrapper is absolute, fills the face, and
            does the centring itself. */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{children}</div>
      </div>
    </div>
  );
  return (
    <div style={{
      position: "absolute", left: x, top: y, transformStyle: "preserve-3d",
      transform: `scale(${scale}) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
      filter: keyGlow(lit * 0.8, 70),
    }}>
      {body(false)}
      {reflect && (
        <div style={{ position: "absolute", left: 0, top: h + 16, transformStyle: "preserve-3d" }}>
          {body(true)}
        </div>
      )}
    </div>
  );
};

/** an extruded COLUMN growing from a floor line — the crash's collapse and the twist's pair */
export const Column: React.FC<{
  x: number; baseY: number; w: number; h: number; on?: number; down?: boolean;
  /** 0 = the up-state colour, 1 = fully negative. CONTINUOUS — a column must never flip colour
   *  in one frame off an eased driver (the crash column used to snap green→red at fall > 0.06). */
  red?: number | boolean; lit?: number;
}> = ({ x, baseY, w, h, on = 1, down = false, red = 0, lit = 0.4 }) => {
  if (on <= 0.001 || h <= 0.5) return null;
  const rv = clamp01(typeof red === "boolean" ? (red ? 1 : 0) : red);
  const col = mixHex(theme.accent, theme.red, rv);
  const top = down ? baseY : baseY - h;
  return (
    <div style={{
      position: "absolute", left: x - w / 2, top, width: w, height: h, opacity: on,
      transformStyle: "preserve-3d",
    }}>
      {/* depth slices */}
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          position: "absolute", inset: 0, borderRadius: 4,
          transform: `translate(${(i + 1) * 3}px, ${-(i + 1) * 3}px) translateZ(${-(i + 1) * 5}px)`,
          background: mixHex("#000C1A", col, 0.10),
        }} />
      ))}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 4,
        background: `linear-gradient(158deg, ${mixHex(col, "#ffffff", 0.35)} 0%, ${col} 44%, ${mixHex(col, "#000000", 0.45)} 100%)`,
        boxShadow: `0 0 ${34 * lit}px ${alpha(col, 0.42)}, inset 0 1px 0 ${alpha("#ffffff", 0.35)}`,
      }} />
    </div>
  );
};

/** the floor the objects sit on — a single soft platinum pool, the key's spill */
export const Pool3D: React.FC<{ x?: number; y: number; w: number; on: number }> = ({
  x = CX, y, w, on,
}) => {
  const f = useCurrentFrame();
  if (on <= 0.001) return null;
  const b = 0.85 + 0.15 * Math.sin(f / 84);
  return (
    <div style={{
      position: "absolute", left: x - w / 2, top: y - w * 0.12, width: w, height: w * 0.24,
      // ★ 0.34 → 0.26: a neutral pool at the green build's alpha reads as a grey WASH on black,
      // where the green one read as coloured light. The spill is dimmer and the floor stays dark.
      opacity: on * 0.55 * b, borderRadius: "50%",
      background: `radial-gradient(ellipse, ${alpha(theme.accent, 0.26)} 0%, ${alpha(theme.accent, 0.06)} 45%, transparent 72%)`,
      filter: "blur(26px)", mixBlendMode: "screen",
    }} />
  );
};

/** ★ THE SECTION BREAK — a full-bleed off-white frame. Structural punctuation, not decoration:
 *  it fires ONLY at the three major boundaries and is gone in under half a second. */
export const LightBreak: React.FC<{ at: number; hold?: number }> = ({ at, hold = 5 }) => {
  const f = useCurrentFrame();
  // ★ SMOOTH BOTH WAYS (ported from V24 per the Style 3 spec §0 — user, 2026-09-13). V12's fall
  // out of white was a front-loaded rOut that dropped ~76 levels of luma in one frame. Both are
  // S-curves now (11 in, 16 out). ⚠ Composition.tsx's caption-ink mirror (`brk`) must match.
  const v = f < at + hold ? rInOut(f, at - 11, at) : 1 - rInOut(f, at + hold, at + hold + 16);
  if (v <= 0.002) return null;
  return <div style={{ position: "absolute", inset: 0, background: "#DDE9F8", opacity: clamp01(v) }} />;
};

/** ★ DISPLAY TIER — heavy condensed grotesque at ~8% of frame height, one word bright and the
 *  rest of the line dimmed. The reference's shock-line device. */
export const Shock: React.FC<{
  words: string[]; bright: number; at: number; y: number; size?: number; red?: boolean;
  on?: number;
}> = ({ words, bright, at, y, size = 154, red = false, on = 1 }) => {
  const f = useCurrentFrame();
  const g = rOut(f, at, at + 18) * on;
  if (g <= 0.001) return null;
  return (
    <div style={{
      position: "absolute", left: 0, width: "100%", top: y, textAlign: "center",
      opacity: g, transform: `translateY(${((1 - g) * 22).toFixed(1)}px)`,
    }}>
      <div style={{
        display: "inline-block", transform: `scaleX(${SHOUT_SQUEEZE})`,
        fontFamily: SHOUT, fontWeight: 400, fontSize: size, lineHeight: 0.94, letterSpacing: -1,
        whiteSpace: "nowrap",
      }}>
        {words.map((w, i) => (
          <span key={i} style={{
            color: i === bright ? (red ? theme.red : "#ffffff") : "#00499E",
            textShadow: i === bright && red ? `0 0 40px ${alpha(theme.red, 0.5)}` : undefined,
            marginRight: i < words.length - 1 ? size * 0.22 : 0,
          }}>{w}</span>
        ))}
      </div>
    </div>
  );
};

/** a big figure in the lighter sans — used for counters, never for the shock lines */
export const Figure: React.FC<{
  text: string; at: number; y: number; size?: number; red?: boolean; on?: number;
}> = ({ text, at, y, size = 168, red = false, on = 1 }) => {
  const f = useCurrentFrame();
  const g = rOut(f, at, at + 20) * on;
  if (g <= 0.001) return null;
  return (
    <div style={{
      position: "absolute", left: 0, width: "100%", top: y, textAlign: "center", opacity: g,
      fontFamily: VOICE, fontWeight: 400, fontSize: size, lineHeight: 1, letterSpacing: -4,
      color: red ? theme.red : "#ffffff",
      textShadow: red ? `0 0 60px ${alpha(theme.red, 0.42)}` : `0 0 60px ${alpha("#ffffff", 0.18)}`,
      transform: `scale(${(0.94 + 0.06 * g).toFixed(3)})`,
    }}>{text}</div>
  );
};

/** a small machined label etched into the scene — mono, dim, never a floating chip */
export const Etch: React.FC<{
  text: string; x: number; y: number; on: number; size?: number; align?: "left" | "center";
}> = ({ text, x, y, on, size = 20, align = "center" }) => {
  if (on <= 0.001) return null;
  return (
    <div style={{
      position: "absolute", left: align === "center" ? x - 300 : x, top: y,
      width: align === "center" ? 600 : undefined, textAlign: align, opacity: on * 0.8,
      fontFamily: DATA, fontWeight: 400, fontSize: size, letterSpacing: 3, color: "#1A6DCE",
      whiteSpace: "nowrap",
    }}>{text}</div>
  );
};
