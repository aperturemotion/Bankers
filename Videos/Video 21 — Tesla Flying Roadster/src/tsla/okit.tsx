import React from "react";
import { figure } from "./kit";
import { mixHex, alpha } from "./anim";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// VIDEO 8's shared drawing helpers — the Bankers oblique (a point at depth z is drawn at x + K·z, y − KY·z: the Solid's up-right
// vector, side d, cap 0.7·d) and the pieces several places draw with. Primitives only, never a scene (no visual repeats).
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const K = 0.5, KY = 0.35;
export type V3 = readonly [number, number, number];
export const P = ([x, y, z]: V3) => [x + K * z, y - KY * z] as const;
export const pathOf = (pts: V3[]) => "M" + pts.map((p) => P(p).map((v) => v.toFixed(2)).join(" ")).join("L") + "Z";
export const poly = (pts: (readonly [number, number])[]) => "M" + pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L") + "Z";

/** the stone/steel finishes on the white and the dark stage (STYLE §6.3's ramp) */
export const PALE = { face: "#F5F9FD", mid: "#D7E3F2", shade: "#7AA6DC", side: "#3F80CC", sideDk: "#2860A0", cap: "#FFFFFF" } as const;
export const DEEP = { face: "#2D6AB1", mid: "#154178", shade: "#0A3469", side: "#072F63", sideDk: "#001C3C", cap: "#6599D5" } as const;

/** an SVG box in the oblique: its right side and its top behind its front, each closed with a hairline of its own fill */
export const SBox: React.FC<{ x0: number; x1: number; y0: number; y1: number; z0?: number; z1: number; front: string; side: string; cap: string; arris?: number; noCap?: boolean }> = ({
  x0, x1, y0, y1, z0 = 0, z1, front, side, cap, arris = 0.9, noCap,
}) => (
  <g>
    <path d={pathOf([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]])} fill={side} stroke={side} strokeWidth={0.8} strokeLinejoin="round" />
    {!noCap && <path d={pathOf([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]])} fill={cap} stroke={cap} strokeWidth={0.8} strokeLinejoin="round" />}
    <path d={pathOf([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]])} fill={front} stroke={front} strokeWidth={0.8} strokeLinejoin="round" />
    {arris > 0 && <path d={`M${P([x0, y0, z0]).join(" ")}L${P([x1, y0, z0]).join(" ")}`} stroke={alpha("#FFFFFF", arris)} strokeWidth={1.6} />}
  </g>
);

/** a horizontal ellipse (a disc seen from above) in screen space */
export const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${(cx - rx).toFixed(2)} ${cy.toFixed(2)}a${rx.toFixed(2)} ${ry.toFixed(2)} 0 1 0 ${(2 * rx).toFixed(2)} 0a${rx.toFixed(2)} ${ry.toFixed(2)} 0 1 0 ${(-2 * rx).toFixed(2)} 0Z`;

/** ★ THE SERIES' SOLID, FOR ANY SHAPE (Video 6's suitcase, counting machine and buoy): the shape's depth is stepped copies of its
 *  OWN outline receding up-right, darkest at the back with a rim on the last, then the face in its gradient with a white bevel.
 *  `back`/`front` are the depth's two ends (back = farthest). Wrap a group of these in an <svg> carrying the house shadow
 *  (SHADOW below) — one soft shadow under the object, as the series' objects have. */
export const Ext: React.FC<{ d: string; dx?: number; dy?: number; steps?: number; face: string; back?: string; front?: string; bevel?: number; rim?: number; stroke?: string; sw?: number }> = ({
  d, dx = 40, dy = -28, steps = 14, face, back = "#0A3164", front = "#2D6AB1", bevel = 0.6, rim = 0.5, stroke, sw = 2,
}) => (
  <g>
    {[...Array(steps)].map((_, k) => {
      const t = (steps - k) / steps;
      return <path key={k} data-probe-skip d={d} transform={`translate(${(dx * t).toFixed(2)} ${(dy * t).toFixed(2)})`} fill={mixHex(back, front, 1 - t)}
        stroke={k === 0 && rim > 0 ? alpha("#6599D5", rim) : undefined} strokeWidth={k === 0 && rim > 0 ? 2.5 : undefined} />;
    })}
    <path d={d} fill={face} stroke={stroke} strokeWidth={stroke ? sw : undefined} />
    {bevel > 0 && <path data-probe-skip d={d} fill="none" stroke={alpha("#FFFFFF", bevel)} strokeWidth={2.5} transform="translate(0.8 0.8)" />}
  </g>
);
/** the house shadow under an object (Video 6: drop-shadow 0 30 48, navy at 0.72 on dark; lighter on the white stage) */
export const SHADOW = (white = 0) => `drop-shadow(0 30px 48px rgba(0,${8 + 20 * white},${20 + 40 * white},${(0.72 - 0.45 * white).toFixed(2)}))`;
/** a rounded rectangle as a path */
export const rrect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
/** the lit blue body finishes the series paints its objects in (STYLE §2.3's ramp, light from the upper left) */
export const LIT = {
  body: ["#3F80CC", "#19457A", "#0A3164"], pale: ["#FFFFFF", "#D7E3F2", "#7AA6DC"], deep: ["#2D6AB1", "#154178", "#072E5F"],
  steel: ["#D7E3F2", "#6599D5", "#265B98"], glass: ["#99BBE4", "#2D6AB1", "#0A3164"],
} as const;
/** a linear gradient element from a 3-stop finish (x1,y1 → x2,y2 in the object's bounding box) */
export const Grad: React.FC<{ id: string; c: readonly string[]; x2?: number; y2?: number; x1?: number; y1?: number }> = ({ id, c, x1 = 0, y1 = 0, x2 = 0.35, y2 = 1 }) => (
  <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>{c.map((col, i) => <stop key={i} offset={i / (c.length - 1)} stopColor={col} />)}</linearGradient>
);

/** ★ THE RESERVE'S CYLINDER (the 2026-10-09 vocabulary: "a plain glass cylinder" with "a solid darker block inside it" — no liquid,
 *  no surface, no pipes, no cutaway). One primitive for the hook's backdrop, the fill/release scene and THEN / NOW, so the viewer
 *  meets the same object each time. The glass is a quiet shell (its back wall, its rim, two soft speculars); the block is a solid
 *  inner cylinder in the series' blue, its cap lit from the upper left. `level` is the block's share of the height (0..1);
 *  `lost` (≥ level) adds the share it no longer has as a see-through red extension (STYLE §6.3), at `lostOn`. */
export const Cylinder: React.FC<{ id: string; cx: number; top: number; base: number; rx: number; ry?: number; level: number; lost?: number; lostOn?: number; white?: number;
  /** graduations on the glass: tick shares of the full height (0..1), majors longer — the reserve read as an instrument */
  ticks?: { at: number; major?: boolean }[]; tickOn?: number }> = ({
  id, cx, top, base, rx, ry = rx * 0.17, level, lost = 0, lostOn = 0, white = 0, ticks = [], tickOn = 1,
}) => {
  const rxi = rx - 16, ryi = ry * (rxi / rx), H = base - top;
  const yb = base - Math.max(0.001, level) * H, yl = base - Math.max(level, lost) * H;
  const edge = mixHex("#99BBE4", "#2860A0", white), rimA = 0.55 - 0.15 * white;
  const body = (yTop: number) => `M${cx - rxi} ${yTop.toFixed(2)} V${base} A${rxi} ${ryi} 0 0 0 ${cx + rxi} ${base} V${yTop.toFixed(2)} Z`;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}Glass`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={mixHex("#0A3469", "#D7E3F2", white)} stopOpacity="0.42" /><stop offset="0.5" stopColor={mixHex("#02234A", "#F5F9FD", white)} stopOpacity="0.28" /><stop offset="1" stopColor={mixHex("#001C3C", "#99BBE4", white)} stopOpacity="0.5" /></linearGradient>
        <linearGradient id={`${id}Body`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0A3164" /><stop offset="0.3" stopColor="#2860A0" /><stop offset="0.62" stopColor="#154178" /><stop offset="1" stopColor="#031F42" /></linearGradient>
        <linearGradient id={`${id}Cap`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#D7E3F2" /><stop offset="0.55" stopColor="#3F80CC" /><stop offset="1" stopColor="#19457A" /></linearGradient>
        <linearGradient id={`${id}Spec`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.2" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></linearGradient>
      </defs>
      {/* the glass: its whole silhouette, then the back half of its rim */}
      <path d={`M${cx - rx} ${top} A${rx} ${ry} 0 0 1 ${cx + rx} ${top} V${base} A${rx} ${ry} 0 0 1 ${cx - rx} ${base} Z`} fill={`url(#${id}Glass)`} />
      <path data-probe-skip d={`M${cx - rx} ${top} A${rx} ${ry} 0 0 1 ${cx + rx} ${top}`} fill="none" stroke={alpha(edge, rimA * 0.6)} strokeWidth={2} />
      {/* the share it no longer has: see-through red, from the block up to `lost` */}
      {lost > level && lostOn > 0.001 && (
        <g opacity={lostOn}>
          <path d={`M${cx - rxi} ${yl.toFixed(2)} V${yb.toFixed(2)} A${rxi} ${ryi} 0 0 0 ${cx + rxi} ${yb.toFixed(2)} V${yl.toFixed(2)} Z`} fill={alpha("#ef2b3d", 0.13)} />
          <path data-probe-skip d={ellipse(cx, yl, rxi, ryi)} fill={alpha("#ff6a5e", 0.1)} stroke={alpha("#FF8A80", 0.75)} strokeWidth={2.5} strokeDasharray="12 8" />
        </g>
      )}
      {/* the block: a solid inner cylinder, its cap lit */}
      <path d={body(yb)} fill={`url(#${id}Body)`} />
      <path d={ellipse(cx, yb, rxi, ryi)} fill={`url(#${id}Cap)`} />
      <path data-probe-skip d={`M${cx - rxi} ${yb.toFixed(2)} A${rxi} ${ryi} 0 0 0 ${cx + rxi} ${yb.toFixed(2)}`} fill="none" stroke={alpha("#FFFFFF", 0.7)} strokeWidth={1.6} />
      {/* the graduations, etched on the front of the glass along its left edge (they curve with it: a short arc each) */}
      {ticks.length > 0 && tickOn > 0.001 && (
        <path data-probe-skip d={ticks.map((t) => { const y = base - t.at * H, w = t.major ? 34 : 18; return `M${(cx - rx + 10).toFixed(1)} ${(y + 3).toFixed(1)} Q${(cx - rx + 10 + w / 2).toFixed(1)} ${(y + 6).toFixed(1)} ${(cx - rx + 10 + w).toFixed(1)} ${(y + 7).toFixed(1)}`; }).join(" ")}
          fill="none" stroke={alpha(edge, 0.75 * tickOn)} strokeWidth={2} strokeLinecap="round" />
      )}
      {/* the glass in front: two soft speculars down its left, a rim light down its right, its edges, the front of its rim */}
      <rect data-probe-skip x={cx - rx + 26} y={top + 14} width={44} height={H - 28} fill={`url(#${id}Spec)`} />
      <rect data-probe-skip x={cx - rx + 84} y={top + 14} width={10} height={H - 28} fill={`url(#${id}Spec)`} />
      <rect data-probe-skip x={cx + rx - 22} y={top + 14} width={10} height={H - 28} fill={alpha("#99BBE4", 0.08)} />
      <path data-probe-skip d={`M${cx - rx} ${top} V${base} M${cx + rx} ${top} V${base}`} stroke={alpha(edge, rimA)} strokeWidth={2} />
      <path data-probe-skip d={`M${cx - rx} ${top} A${rx} ${ry} 0 0 0 ${cx + rx} ${top}`} fill="none" stroke={alpha(edge, rimA + 0.2)} strokeWidth={2.5} />
      <path data-probe-skip d={`M${cx - rx} ${base} A${rx} ${ry} 0 0 0 ${cx + rx} ${base}`} fill="none" stroke={alpha(edge, rimA)} strokeWidth={2} />
    </g>
  );
};

/** BIG TYPE WITH DEPTH: stepped copies down-left of the face, darkest at the back (the hook's S&P 500 in Video 7) — the depth is
 *  thin (STYLE §6.3: ≈ 12 steps of +1 / −0.85) and carries its own soft shadow when `shadow` is set */
export const Extruded: React.FC<{ text: string; size: number; color?: string; depth?: number; deep?: [string, string] }> = ({
  text, size, color = "#FFFFFF", depth = 12, deep = ["#0A3164", "#19457A"],
}) => (
  <div style={{ position: "relative" }}>
    {[...Array(depth)].map((_, k) => (
      <div key={k} data-probe-skip style={{ position: "absolute", left: depth - k, top: -depth * 0.85 + k * 0.85, ...figure(size, mixHex(deep[0], deep[1], k / depth)) }}>{text}</div>
    ))}
    <div style={{ position: "relative", ...figure(size, color) }}>{text}</div>
  </div>
);
