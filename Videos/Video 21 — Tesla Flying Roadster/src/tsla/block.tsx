import React from "react";
import { alpha, mixHex, clamp01 } from "./anim";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// ★ THE GLOSSY BLOCK — Video 11's one primitive for "a billion dollars" (the hook's wall of fifty, the honest part's wall, the
// hierarchy's slabs, the shelf's weights). The demo's satin solid (visual-vocabulary.md, DEMO ANCHOR): a light top face, deep sides
// and a soft rim, its depth stepped up-right (STYLE §6.3), built with the parts a machined block has (STYLE §6.8a): a chamfered front
// with its lit top arris and shaded lower lip, a satin sheen across the upper-left, a specular streak, the cap and the side each with
// their own gradient. `lit` 0..1 blends it from the deep navy finish to the pale lit one (never a switch — STYLE §9.4); `glow` adds a
// soft light round it (a larger, fainter painted copy — no CSS filter on anything that moves). Drawn in SVG, in its own coordinates.
// ══════════════════════════════════════════════════════════════════════════════════════════════

type Pt = { x: number; y: number };
const P = (pts: Pt[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
/** the depth vector for a depth of d px (the series' oblique: up and to the right) */
export const depthVec = (d: number) => ({ x: d * 0.8, y: -d * 0.62 });

/** ★ SMOOTH BLUE METAL (Timur, 2026-10-15: "the colors of visuals are a little too bright and cartoony, make them look more like the
 *  smooth metallic [Style 3] texture but keep the blue color" — STYLE §2.1/§6): the face is a CHROME ramp in steel blues — a light top, the
 *  mid, a dark reflected band, then light again from below — not a pale satin fade; the cap catches the key light; the side is deep */
//  (the same day, "a bit too gray … make it a little more dark blue": the steel keeps the series' saturated navy-to-logo-blue)
export const BLOCK_DIM = { face: ["#2B5F9F", "#123C74", "#031A40", "#1A4B88"], cap: ["#4E80BE", "#173F72"], side: ["#0F3466", "#02132E"] } as const;
export const BLOCK_LIT = { face: ["#CFE0F6", "#5288CC", "#0B2F66", "#3F75BB"], cap: ["#F1F6FC", "#8DB2E0"], side: ["#2F67AE", "#06224D"] } as const;
/** ★ PAPER — the first build's pale satin finish, kept for paper money (Timur, 2026-10-15: "no keep the stacks that were on the pie chart
 *  the same, they were good"): a pale face fading to the logo blue, three stops, the soft satin sheen */
export const PAPER_DIM = { face: ["#3C83D5", "#0F4C98", "#032856"], cap: ["#7FAEE3", "#2A6CBD"], side: ["#0A3C7C", "#011A38"] } as const;
export const PAPER_LIT = { face: ["#F5F9FD", "#9DC0EA", "#3C83D5"], cap: ["#FFFFFF", "#C4DAF2"], side: ["#5D97DB", "#0B3F82"] } as const;

/** one block: front face (x, y, w, h), depth d up-right */
export const GlossyBlock: React.FC<{ id: string; x: number; y: number; w: number; h: number; d?: number; lit?: number; glow?: number; r?: number; finish?: "metal" | "paper"; children?: React.ReactNode }> = ({
  id, x, y, w, h, d = 22, lit = 0, glow = 0, r = 5, finish = "metal", children,
}) => {
  const v = depthVec(d), l = clamp01(lit), paper = finish === "paper";
  const DIM = paper ? PAPER_DIM : BLOCK_DIM, LIT = paper ? PAPER_LIT : BLOCK_LIT;
  // ★ STATIC GRADIENTS (2026-10-15, Video 11: "the glitch only happens in the rendered version"). The stops used to be mixHex'd by
  // `lit` every frame; the sequential render can keep a gradient's OLD stops (the stale-paint class, root CLAUDE.md), so a block lighting
  // up could lag in the MP4. Now each finish is its own fixed gradient and the lit one is painted OVER the dim one at opacity `lit`.
  const g = (P0: typeof DIM | typeof LIT, k: "face" | "cap" | "side", i: number) => P0[k][i] as string;
  const cap = [{ x, y }, { x: x + v.x, y: y + v.y }, { x: x + w + v.x, y: y + v.y }, { x: x + w, y }];
  const side = [{ x: x + w, y }, { x: x + w + v.x, y: y + v.y }, { x: x + w + v.x, y: y + h + v.y }, { x: x + w, y: y + h }];
  const face = `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
  // the satin sheen: a soft band across the face's upper-left, as the key light from the upper left falls on a polished face
  const sheen = `M${x + r} ${y}H${x + w * 0.58}L${x + w * 0.3} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
  return (
    <g>
      <defs>
        {([["0", DIM], ["1", LIT]] as const).map(([n, P0]) => (
          <React.Fragment key={n}>
            <linearGradient id={`${id}F${n}`} x1="0" y1="0" x2="0.3" y2="1">
              {paper
                ? <><stop offset="0" stopColor={g(P0, "face", 0)} /><stop offset="0.5" stopColor={g(P0, "face", 1)} /><stop offset="1" stopColor={g(P0, "face", 2)} /></>
                : <><stop offset="0" stopColor={g(P0, "face", 0)} /><stop offset="0.42" stopColor={g(P0, "face", 1)} /><stop offset="0.66" stopColor={g(P0, "face", 2)} /><stop offset="1" stopColor={g(P0, "face", 3)} /></>}
            </linearGradient>
            <linearGradient id={`${id}C${n}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={g(P0, "cap", 0)} /><stop offset="1" stopColor={g(P0, "cap", 1)} /></linearGradient>
            <linearGradient id={`${id}S${n}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={g(P0, "side", 0)} /><stop offset="1" stopColor={g(P0, "side", 1)} /></linearGradient>
          </React.Fragment>
        ))}
      </defs>
      {glow > 0.001 && (
        <g data-probe-skip opacity={glow}>
          <rect x={x - 26} y={y - 26 + v.y * 0.5} width={w + v.x + 52} height={h - v.y + 52} rx={30} fill={alpha("#2D6AB1", 0.16)} />
          <rect x={x - 12} y={y - 12 + v.y * 0.5} width={w + v.x + 24} height={h - v.y + 24} rx={18} fill={alpha("#6599D5", 0.18)} />
        </g>
      )}
      {/* the dim finish (skipped when fully lit), then the lit one over it at opacity `lit` (skipped when dark) */}
      <polygon points={P(side)} fill={`url(#${id}S${l >= 0.999 ? 1 : 0})`} />
      {l > 0.001 && l < 0.999 && <polygon data-probe-skip points={P(side)} fill={`url(#${id}S1)`} opacity={l} />}
      <polygon points={P(cap)} fill={`url(#${id}C${l >= 0.999 ? 1 : 0})`} />
      {l > 0.001 && l < 0.999 && <polygon data-probe-skip points={P(cap)} fill={`url(#${id}C1)`} opacity={l} />}
      <path d={face} fill={`url(#${id}F${l >= 0.999 ? 1 : 0})`} />
      {l > 0.001 && l < 0.999 && <path data-probe-skip d={face} fill={`url(#${id}F1)`} opacity={l} />}
      <g data-probe-skip>
        <path d={sheen} fill={alpha("#FFFFFF", paper ? 0.08 + 0.1 * l : 0.04 + 0.06 * l)} />
        {/* the chamfer: the lit top arris, the shaded lower lip, a specular streak along the top */}
        <line x1={x + r} x2={x + w - r} y1={y + 1.2} y2={y + 1.2} stroke={alpha("#FFFFFF", paper ? 0.55 + 0.35 * l : 0.7 + 0.3 * l)} strokeWidth={paper ? 2 : 1.6} strokeLinecap="round" />
        <line x1={x + r} x2={x + w - r} y1={y + h - 1.5} y2={y + h - 1.5} stroke={alpha("#001C3C", 0.35)} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={x + w * 0.12} x2={x + w * 0.42} y1={y + h * 0.2} y2={y + h * 0.2} stroke={alpha("#FFFFFF", 0.22 + 0.25 * l)} strokeWidth={Math.max(2, h * 0.05)} strokeLinecap="round" />
        <line x1={x + w} x2={x + w + v.x} y1={y} y2={y + v.y} stroke={alpha("#FFFFFF", 0.35 + 0.3 * l)} strokeWidth={1.5} />
      </g>
      {children}
    </g>
  );
};

/** an EMPTY SLOT where a block was, seen into: the depth runs up-right, so through the opening show the slot's BOTTOM inner face
 *  (it faces up, toward the key light: lit) and its LEFT inner face (it faces right, away from the light: in shade), with the dark
 *  back wall beyond — all clipped to the opening — and a faint rim light round its mouth (`rim` brightens it) */
export const EmptySlot: React.FC<{ id: string; x: number; y: number; w: number; h: number; d?: number; on?: number; rim?: number }> = ({ id, x, y, w, h, d = 22, on = 1, rim = 0 }) => {
  const v = depthVec(d * 1.6);
  return (
    <g opacity={on}>
      <defs data-probe-skip><clipPath id={`${id}O`}><rect x={x} y={y} width={w} height={h} /></clipPath></defs>
      <g clipPath={`url(#${id}O)`}>
        <rect x={x} y={y} width={w} height={h} fill="#000A18" />
        <polygon points={P([{ x, y: y + h }, { x: x + w, y: y + h }, { x: x + w + v.x, y: y + h + v.y }, { x: x + v.x, y: y + h + v.y }])} fill="#0A3164" />
        <polygon points={P([{ x, y }, { x: x + v.x, y: y + v.y }, { x: x + v.x, y: y + h + v.y }, { x, y: y + h }])} fill="#021630" />
      </g>
      <rect data-probe-skip x={x - 1} y={y - 1} width={w + 2} height={h + 2} rx={3} fill="none" stroke={alpha("#6599D5", 0.2 + 0.55 * rim)} strokeWidth={2} />
    </g>
  );
};
