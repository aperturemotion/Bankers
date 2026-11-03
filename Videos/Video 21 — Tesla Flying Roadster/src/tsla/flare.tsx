import React from "react";
import { useCurrentFrame } from "remotion";
import { rInOut, clamp01 } from "./anim";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// ★ THE LENS BLOOM (Timur, 2026-10-10, Video 8: the hook's bloom transition at 9 s gets the house lens-bloom effect of the Style 3
// films — his words are in Bankers/CLAUDE.md). Style 3's lens-flare transition's OPTICS and TIMING, rebuilt for Bankers (the
// technique crosses; that account's palette and branding never do — root CLAUDE.md). In order, as its references run:
//   1 ONSET    a point opens on a real thing in the outgoing shot; the frame lifts to a cool haze around it; the "little circles"
//              (lens ghosts) appear on the line from the source THROUGH THE FRAME CENTRE
//   2 GROWTH   a white bloom with a cool blue edge swells from the source — a BELL of light with no edge anywhere, whose reach
//              grows with √L so the lit area (and the frame's brightness) grows evenly; the picture under it softens
//   3 PEAK     the frame is white, with a faint cool fall-off at the edges — the cut hides here, in the pause
//   4 RECEDE   the next scene is revealed as the bloom shrinks toward a NEW point, a real thing in the incoming shot; the ghosts
//              swing to the other side of centre, because they are reflections: every ghost sits at C + k·(C − S)
// Timing is Style 3's (41 swell / 4 white / 32 reveal = 77 f, the "35% slower" rule), and so is the level curve (ONE S on a linear
// clock, smoothstep^1.4 — "smoother, and a little bit better looking"). Rendered ABOVE the world and BELOW the captions and the
// watermark; the composition turns the caption ink dark on the combined light, 1 − (1 − stage)(1 − flare).
// BANKERS' DIFFERENCES, deliberately:
//   · the ghosts are coated in the logo blue's family and white (STYLE §2.2: no other hue) — not Style 3's amber and green;
//   · no CSS filter on any ghost (a filter is pixel-aligned and zig-zags on a moving element — root CLAUDE.md): each dot's glow is
//     a larger, fainter copy of it, and the ring and disk are soft in their own gradients;
//   · the peak's edge fall-off cools to the white stage's own #EBF2FB, so the recede lands on the stage without a seam.
// ══════════════════════════════════════════════════════════════════════════════════════════════

const W = 1080, H = 1920, C = { x: W / 2, y: H / 2 };
export type Pt = { x: number; y: number };
const lerp = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${clamp01(a).toFixed(3)})`;
};
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

/** the ghosts — k is the reflection factor (C + k·(C − S)); r in px at 1080 wide (Style 3's set, recoated in the ramp) */
type Ghost = { k: number; r: number; kind: "dot" | "disk" | "ring"; c: string; core?: string; op: number; sy?: number };
const GHOSTS: Ghost[] = [
  { k: 0.35, r: 5, kind: "dot", c: "#FFFFFF", op: 0.55 },
  { k: 1.1, r: 12, kind: "dot", c: "#8DB6E6", core: "#F4F8FD", op: 0.95 },
  { k: 1.3, r: 11, kind: "dot", c: "#3C83D5", core: "#D5E4F6", op: 0.9, sy: 1.5 },
  { k: 1.25, r: 235, kind: "ring", c: "#6FA3DF", op: 0.12 },
  { k: 1.9, r: 58, kind: "disk", c: "#4D8ED9", op: 0.26 },
  { k: 2.4, r: 8, kind: "dot", c: "#B3CEEF", op: 0.65 },
];

/** the bloom's profile: a bell with ZERO slope at both ends, I(s) = (1 − s²)^2.4, as 13 stops, cooling from white at the core to
 *  the hot-core blue #B3CEEF at its reach (Style 3 cools to lavender; Bankers' light is the logo blue's) */
const bloomBg = (at: string, R: number, a: number) => {
  const stops: string[] = [];
  for (let i = 0; i <= 12; i++) {
    const s = i / 12;
    const I = Math.pow(1 - s * s, 2.4);
    const cool = smooth(0.15, 0.95, s);
    const c = [255 - 76 * cool, 255 - 49 * cool, 255 - 16 * cool].map((v) => v.toFixed(0)).join(",");
    stops.push(`rgba(${c},${clamp01(a * I).toFixed(3)}) ${(s * 100).toFixed(1)}%`);
  }
  return `radial-gradient(circle ${R.toFixed(0)}px at ${at}, ${stops.join(", ")})`;
};

const ghostBg = (g: Ghost) =>
  g.kind === "dot"
    ? `radial-gradient(circle, ${g.core ?? g.c} 0%, ${g.core ?? g.c} 22%, ${g.c} 42%, ${rgba(g.c, 0.45)} 62%, transparent 78%)`
    : g.kind === "disk"
      ? `radial-gradient(circle, ${rgba(g.c, 0.45)} 0%, ${rgba(g.c, 0.5)} 60%, ${rgba(g.c, 0.9)} 80%, ${rgba(g.c, 0.4)} 88%, transparent 97%)`
      : `radial-gradient(circle, transparent 48%, ${rgba(g.c, 0.35)} 60%, ${rgba(g.c, 0.7)} 70%, ${rgba(g.c, 0.4)} 81%, ${rgba(g.c, 0.12)} 90%, transparent 98%)`;
/** a dot's glow: a larger, fainter copy of it (never a filter) */
const haloBg = (g: Ghost) => `radial-gradient(circle, ${rgba(g.c, 0.55)} 0%, ${rgba(g.c, 0.22)} 35%, ${rgba(g.c, 0.06)} 65%, transparent 100%)`;

/** the timing — Style 3's FLARE_T exactly: a 41-frame swell (the onset's point, haze and ghosts, then the bloom), 4 frames of white
 *  ON the cut, a 32-frame reveal = 77 frames */
export const FLARE_T = { grow: 41, hold: 4, recede: 32 } as const;
/** the bloom's level at frame f — ONE function, drawn by LensBloom and read by the composition's caption ink and watermark */
export const flareLevel = (f: number, peak: number, grow: number = FLARE_T.grow, hold: number = FLARE_T.hold, recede: number = FLARE_T.recede) => {
  const u = clamp01((f - (peak - grow)) / grow);
  const v = clamp01((f - (peak + hold)) / recede);
  return Math.max(0, Math.min(Math.pow(smooth(0, 1, u), 1.4), Math.pow(1 - smooth(0, 1, v), 1.2)));
};

/**
 * @param peak   the frame the screen is fully white — ON the cut, in the pause between sentences
 * @param from   where the light starts, in screen px, AT THIS FRAME (a real thing in the outgoing shot; it may move with the camera)
 * @param to     where it recedes to (a real thing in the incoming shot)
 * @param stage  0 dark … 1 white: on a white stage the ghosts, haze and scatter stand down (the recede into a white scene is the
 *               stage itself)
 */
export const LensBloom: React.FC<{ peak: number; from: Pt; to: Pt; stage?: number }> = ({ peak, from, to, stage = 0 }) => {
  const f = useCurrentFrame();
  const { grow, hold, recede } = FLARE_T;
  if (f < peak - grow - 1 || f > peak + hold + recede + 1) return null;
  // TWO STAGES: `g` opens the point, the haze and the ghosts first; the bloom `L` holds off through that onset, then swells to white
  const g = rInOut(f, peak - grow, peak);
  const q = rInOut(f, peak + hold, peak + hold + recede);
  const L = flareLevel(f, peak);
  const on = Math.min(g, 1 - q);
  if (on <= 0.002) return null;
  // the ONSET runs on a linear clock: the point and its ghosts glimmer from the swell's first frame
  const u = clamp01((f - (peak - grow)) / grow);
  const onset = Math.min(smooth(0, 0.3, u), 1 - q);
  // the source drifts toward centre as it swells, jumps to its new point UNDER the white, and settles there as it recedes
  const swap = rInOut(f, peak - 1, peak + hold + 1);
  const S = lerp(lerp(from, C, 0.12 * g), lerp(to, C, 0.15 * (1 - q)), swap);
  const R = 20 + 2400 * Math.sqrt(L);   // the bell's reach — at L = 1 it overhangs every corner
  const a = smooth(0, 0.05, L);         // full strength from the first glimmer: the AREA carries the swell
  const white = smooth(0.6, 1, L);
  const st = clamp01(stage);
  const ghostEnv = onset * (1 - smooth(0.62, 0.9, L)) * (1 - 0.85 * st);
  const haze = 0.5 * (1 - 0.7 * st) * (0.3 * smooth(0, 1, on) + 0.7 * L);
  // the light scatters: the picture under it softens as it brightens (a lens's own bloom), and comes back sharp as it recedes
  const scatter = 5 * smooth(0.05, 0.8, L) * (1 - st);
  const at = `${S.x.toFixed(1)}px ${S.y.toFixed(1)}px`;
  const pr = 16 + 46 * Math.sqrt(L);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {scatter > 0.05 && <div style={{ position: "absolute", inset: 0, backdropFilter: `blur(${scatter.toFixed(2)}px)` }} />}
      {/* the veil — the frame lifts to a cool haze around the light */}
      <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen",
        background: `radial-gradient(circle ${(R * 1.6 + 60).toFixed(0)}px at ${at}, rgba(213,228,246,${(0.5 * haze).toFixed(3)}) 0%, rgba(111,163,223,${(0.3 * haze).toFixed(3)}) 45%, rgba(11,63,130,${(0.2 * haze).toFixed(3)}) 100%)` }} />
      {/* the bloom — a bell of light cooling to the hot-core blue at its reach */}
      <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", background: bloomBg(at, R, a) }} />
      {/* the point — where it starts shining */}
      <div style={{ position: "absolute", left: S.x, top: S.y, width: 0, height: 0 }}>
        <div style={{ position: "absolute", left: -pr, top: -pr, width: 2 * pr, height: 2 * pr, borderRadius: "50%", opacity: onset, mixBlendMode: "screen",
          background: "radial-gradient(circle, #FFFFFF 0%, rgba(255,255,255,0.95) 22%, rgba(220,232,246,0.5) 50%, rgba(179,206,239,0.15) 72%, transparent 100%)" }} />
      </div>
      {/* the ghosts — reflections through the frame centre */}
      {ghostEnv > 0.004 && GHOSTS.map((gh, i) => {
        const P = { x: C.x + gh.k * (C.x - S.x), y: C.y + gh.k * (C.y - S.y) };
        const sy = gh.sy ?? 1, o = gh.op * ghostEnv;
        return (
          <React.Fragment key={i}>
            {gh.kind === "dot" && (
              <div style={{ position: "absolute", left: P.x - gh.r * 2.6, top: P.y - gh.r * 2.6 * sy, width: 5.2 * gh.r, height: 5.2 * gh.r * sy, borderRadius: "50%", opacity: o * 0.8, mixBlendMode: "screen", background: haloBg(gh) }} />
            )}
            <div style={{ position: "absolute", left: P.x - gh.r, top: P.y - gh.r * sy, width: 2 * gh.r, height: 2 * gh.r * sy, borderRadius: "50%", opacity: o, mixBlendMode: "screen", background: ghostBg(gh) }} />
          </React.Fragment>
        );
      })}
      {/* the peak — the frame white, with a faint cool fall-off at the edges to the white stage's own colour */}
      {white > 0.002 && (
        <div style={{ position: "absolute", inset: 0, opacity: white, background: `radial-gradient(circle 1500px at ${at}, #FFFFFF 0%, #FFFFFF 68%, #EBF2FB 100%)` }} />
      )}
    </div>
  );
};
