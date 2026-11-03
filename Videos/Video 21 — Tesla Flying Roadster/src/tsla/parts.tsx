import React from "react";
import { BRAND_SVG } from "./brandsvg";
import { alpha, mixHex, clamp01 } from "./anim";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// SHARED PARTS for Video 1 — an extruded solid, the four company logos, and two real flags.
// ══════════════════════════════════════════════════════════════════════════════════════════════

/** an extruded solid block — lit face, raked side, lit cap (V12's pillar recipe). ★ NO POP (Bankers/CLAUDE.md
 *  §2.5.1): pass `grow` 0..1 and the extrusion grows with the block and the whole fades up over its first 12%. */
export const Solid: React.FC<{
  x: number; y: number; w: number; h: number; d?: number; grow?: number;
  face: string; side: string; cap: string; shadow?: string; glow?: string; children?: React.ReactNode;
}> = ({ x, y, w, h, d = 30, grow = 1, face, side, cap, shadow = "rgba(0,8,20,0.7)", glow, children }) => {
  if (h <= 0.5 || w <= 0.5) return null;
  const dd = Math.min(d, h * 0.5, w * 0.5);
  return (
    <div style={{ position: "absolute", left: x, top: y - dd * 0.7, width: w + dd, height: h + dd * 0.7,
      opacity: clamp01(grow / 0.12), filter: `drop-shadow(0 26px 44px ${shadow})${glow ? ` drop-shadow(0 0 30px ${glow})` : ""}` }}>
      <div style={{ position: "absolute", inset: 0, background: side,
        clipPath: `polygon(${w - 1}px ${dd * 0.7}px, ${w + dd}px 0px, ${w + dd}px ${h}px, ${w - 1}px ${h + dd * 0.7}px)` }} />
      <div style={{ position: "absolute", inset: 0, background: cap,
        clipPath: `polygon(0px ${dd * 0.7 + 1}px, ${dd}px 0px, ${w + dd}px 0px, ${w}px ${dd * 0.7 + 1}px)` }} />
      <div style={{ position: "absolute", left: 0, top: dd * 0.7 - 1, width: w + 1, height: h + 1, background: face,
        boxShadow: `inset 0 1px 0 ${alpha("#ffffff", 0.5)}` }}>{children}</div>
    </div>
  );
};

/** the blue-family finishes the solids use (V12's greys through the Bankers mapping) */
export const FIN = {
  lit: { face: "linear-gradient(168deg, #E3EDF9 0%, #8DB6E6 30%, #347ED3 70%, #0B4691 100%)", side: "linear-gradient(180deg, #1E63B4 0%, #02234A 100%)", cap: "linear-gradient(120deg, #FFFFFF 0%, #A9C9ED 100%)" },
  deep: { face: "linear-gradient(168deg, #6FA3DF 0%, #1A5DB0 40%, #01295A 100%)", side: "linear-gradient(180deg, #06397A 0%, #000E1F 100%)", cap: "linear-gradient(120deg, #9DC0EA 0%, #1F62B3 100%)" },
  pale: { face: "linear-gradient(168deg, #FFFFFF 0%, #DCE8F6 45%, #9DC0EA 100%)", side: "linear-gradient(180deg, #8DB6E6 0%, #3C83D5 100%)", cap: "linear-gradient(120deg, #FFFFFF 0%, #DCE8F6 100%)" },
  chip: { face: "linear-gradient(168deg, #2A3F5E 0%, #101B2C 55%, #060B14 100%)", side: "linear-gradient(180deg, #0B1524 0%, #02060C 100%)", cap: "linear-gradient(120deg, #4A6284 0%, #1B2A40 100%)" },
};

// ── the four company logos (Wikimedia Commons, public-domain text logos; Samsung from simple-icons) ────────
// Each is the company's own file, never redrawn. On the dark stage it is used as a MASK filled white — the standard
// reversed version of a one-colour wordmark; on the white stage it shows in its own colours.
export type Brand = "micron" | "jpm" | "skhynix" | "samsung";
const BRAND: Record<Brand, { file: string; aspect: number; name: string }> = {
  micron: { file: "brand/micron.svg", aspect: 288 / 61.704, name: "Micron" },
  jpm: { file: "brand/jpmorganchase.svg", aspect: 1000 / 141.83, name: "JPMorganChase" },
  skhynix: { file: "brand/skhynix.svg", aspect: 28.452518 / 15.028476, name: "SK hynix" },
  samsung: { file: "brand/samsung_wordmark.svg", aspect: 24 / 4.1, name: "Samsung" },
};
export const brandAspect = (b: Brand) => BRAND[b].aspect;

export const Logo: React.FC<{ brand: Brand; w: number; x: number; y: number; knockout?: string; opacity?: number; anchor?: "center" | "left" }> = ({
  brand, w, x, y, knockout, opacity = 1, anchor = "center",
}) => {
  const b = BRAND[brand], h = w / b.aspect;
  const left = anchor === "center" ? x - w / 2 : x;
  // ★ VECTOR, not a bitmap (Timur, 2026-09-26: "the jpmorgan text is jittering a little bit"). A CSS mask or an <img> is
  // rasterised and SNAPPED to the pixel grid, so under the camera's sub-pixel drift the thin JPMorganChase serifs jumped
  // 0.5–2 px at irregular frames; inline paths are painted at the exact position every frame. The paths are the files'
  // own (brandsvg.ts, generated from public/brand/ by scratchpad/mkbrand.mjs). A knockout colour is a scoped fill override.
  const svg = BRAND_SVG[brand];
  const k = knockout ? `lk${brand}${knockout.replace(/[^a-zA-Z0-9]/g, "")}` : undefined;
  return (
    <svg aria-label={b.name} viewBox={svg.viewBox} width={w} height={h}
      style={{ position: "absolute", left, top: y - h / 2, width: w, height: h, opacity, overflow: "hidden" }}>
      {k && <style>{`.${k} *{fill:${knockout} !important;stroke:none !important}`}</style>}
      <g className={k} dangerouslySetInnerHTML={{ __html: svg.inner }} />
    </svg>
  );
};

/** the same vector logo INSIDE an <svg> (a nested svg placed by x/y attributes) — for pieces drawn wholly in SVG, e.g.
 *  a tilted FG piece, whose texts the probe then measures in their own rotated space (Probe.tsx svgInk) */
export const LogoInSvg: React.FC<{ brand: Brand; w: number; x: number; y: number; knockout?: string; opacity?: number; anchor?: "center" | "left" }> = ({
  brand, w, x, y, knockout, opacity = 1, anchor = "center",
}) => {
  const b = BRAND[brand], h = w / b.aspect, svg = BRAND_SVG[brand];
  const k = knockout ? `lk${brand}${knockout.replace(/[^a-zA-Z0-9]/g, "")}` : undefined;
  return (
    <svg aria-label={b.name} x={anchor === "center" ? x - w / 2 : x} y={y - h / 2} width={w} height={h} viewBox={svg.viewBox} opacity={opacity}>
      {k && <style>{`.${k} *{fill:${knockout} !important;stroke:none !important}`}</style>}
      <g className={k} dangerouslySetInnerHTML={{ __html: svg.inner }} />
    </svg>
  );
};

// ── flags, drawn to their official construction ────────────────────────────────────────────
/** the United States flag, 19:10 — 13 stripes, the canton over 7 stripes with 50 stars (9 rows of 6 and 5) */
export const FlagUS: React.FC<{ w: number }> = ({ w }) => {
  const h = w / 1.9, sh = h / 13, cw = w * 0.4, ch = sh * 7;
  const stars: [number, number][] = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < (r % 2 ? 5 : 6); c++) {
    stars.push([cw * ((r % 2 ? 2 : 1) + c * 2) / 12, ch * (r + 1) / 10]);
  }
  const star = (cx: number, cy: number, R: number) => {
    const p: string[] = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? R * 0.382 : R; p.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`); }
    return p.join(" ");
  };
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <rect width={w} height={h} fill="#FFFFFF" />
      {[...Array(7)].map((_, i) => <rect key={i} y={i * 2 * sh} width={w} height={sh} fill="#B22234" />)}
      <rect width={cw} height={ch} fill="#3C3B6E" />
      {stars.map(([x, y], i) => <polygon key={i} points={star(x, y, sh * 0.4)} fill="#FFFFFF" />)}
    </svg>
  );
};

/** the flag of South Korea (Taegukgi), 3:2 — the red-and-blue taegeuk and the four black trigrams on white */
export const FlagKR: React.FC<{ w: number }> = ({ w }) => {
  const h = (w * 2) / 3, cx = w / 2, cy = h / 2, R = h / 4;   // taegeuk diameter = half the height
  const ang = Math.atan2(2, 3);                              // the flag's diagonal: 2:3
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const bar = h / 24, gap = h / 48, len = h / 4;
  // trigram lines: 1 = solid, 0 = broken; listed from the centre outward
  const tri = (dist: number, dir: [number, number], lines: number[], rot: number) => (
    <g transform={`translate(${cx + dir[0] * dist} ${cy + dir[1] * dist}) rotate(${rot})`}>
      {lines.map((solid, i) => {
        const y = (i - 1) * (bar + gap);
        return solid
          ? <rect key={i} x={-len / 2} y={y - bar / 2} width={len} height={bar} fill="#000000" />
          : <g key={i}><rect x={-len / 2} y={y - bar / 2} width={len * 0.46} height={bar} fill="#000000" /><rect x={len * 0.04} y={y - bar / 2} width={len * 0.46} height={bar} fill="#000000" /></g>;
      })}
    </g>
  );
  const deg = (ang * 180) / Math.PI;
  const D = R + h / 4 + (3 * bar + 2 * gap) / 2 - h / 48;   // trigram centre distance from the flag's centre
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <rect width={w} height={h} fill="#FFFFFF" stroke="#D5E4F6" strokeWidth={1} />
      <g transform={`translate(${cx} ${cy}) rotate(${deg})`}>
        {/* the taegeuk: red above, blue below, divided by an S of two half-circles */}
        <path d={`M ${-R} 0 A ${R} ${R} 0 0 1 ${R} 0 A ${R / 2} ${R / 2} 0 0 1 0 0 A ${R / 2} ${R / 2} 0 0 0 ${-R} 0 Z`} fill="#CD2E3A" />
        <path d={`M ${-R} 0 A ${R} ${R} 0 0 0 ${R} 0 A ${R / 2} ${R / 2} 0 0 1 0 0 A ${R / 2} ${R / 2} 0 0 0 ${-R} 0 Z`} fill="#0047A0" />
      </g>
      {/* geon ☰ (top-left), gon ☷ (bottom-right), gam ☵ (top-right), ri ☲ (bottom-left) */}
      {tri(D, [-ca, -sa], [1, 1, 1], deg - 90 + 90)}
      {tri(D, [ca, sa], [0, 0, 0], deg)}
      {tri(D, [ca, -sa], [0, 1, 0], -deg)}
      {tri(D, [-ca, sa], [1, 0, 1], -deg)}
    </svg>
  );
};

/** a soft floor light under an object (radial; skipped by the probe as a glow) */
export const floorGlow = (x: number, y: number, w: number, a = 0.35, color = "#4D8ED9"): React.CSSProperties => ({
  position: "absolute", left: x - w / 2, top: y - w * 0.12, width: w, height: w * 0.24, borderRadius: "50%",
  background: `radial-gradient(ellipse, ${alpha(color, a)} 0%, transparent 70%)`, filter: "blur(18px)",
});

export { mixHex };
