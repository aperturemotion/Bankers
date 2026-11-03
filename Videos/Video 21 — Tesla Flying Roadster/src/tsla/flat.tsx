import React from "react";
import { alpha } from "./anim";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// THE HOUSE 2-D SOLID, IN SVG (STYLE §6.1a, §6.2 — Timur, 2026-10-16: "something that would be better visualized using a 3d visual should
// be 3d, but otherwise scenes should stay 2d"). A flat front face, its side and its cap painted as facets UP AND TO THE RIGHT (the cap
// 0.7·d tall), in Video 11's buybars `Pillar` finishes: face 168° #92B8E2 → #265B98 → #002A5A, cap 120° #E3ECF7 → #357BCA, side 180°
// #033671 → #001731, a 1-px white inset along the face's top. Gradients are STATIC (<defs> never change per frame — the stale-paint
// class, Bankers/CLAUDE.md Video 11), one set per SVG under its own id prefix.
// ══════════════════════════════════════════════════════════════════════════════════════════════

/** the defs one SVG needs: `${id}Face`, `${id}Lit` (a lit face), `${id}Cap`, `${id}Side` */
export const FlatDefs: React.FC<{ id: string }> = ({ id }) => (
  <defs data-probe-skip>
    <linearGradient id={`${id}Face`} x1="0.62" y1="0" x2="0.38" y2="1">
      <stop offset="0" stopColor="#92B8E2" /><stop offset="0.42" stopColor="#265B98" /><stop offset="1" stopColor="#002A5A" />
    </linearGradient>
    <linearGradient id={`${id}Lit`} x1="0.62" y1="0" x2="0.38" y2="1">
      <stop offset="0" stopColor="#F1F6FC" /><stop offset="0.4" stopColor="#6599D5" /><stop offset="1" stopColor="#234F84" />
    </linearGradient>
    <linearGradient id={`${id}Cap`} x1="0" y1="0.25" x2="1" y2="0.75">
      <stop offset="0" stopColor="#E3ECF7" /><stop offset="1" stopColor="#357BCA" />
    </linearGradient>
    <linearGradient id={`${id}Side`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#033671" /><stop offset="1" stopColor="#001731" />
    </linearGradient>
  </defs>
);

const pts = (q: [number, number][]) => q.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

type Fill = { face?: string; cap?: string; side?: string };
/** an extruded box: front face x0–x1 × y0–y1, depth d drawn up-right. `skipBack` leaves the cap and side unmeasured (print on something
 *  standing in front of them would read as crossing them: the probe has no depth). */
export const FBox: React.FC<{ id: string; x0: number; y0: number; x1: number; y1: number; d: number; fill?: Fill; lit?: boolean; op?: number;
  skip?: boolean; skipBack?: boolean; skipCap?: boolean; noInset?: boolean }> = ({ id, x0, y0, x1, y1, d, fill = {}, lit, op = 1, skip, skipBack, skipCap, noInset }) => {
  if (op <= 0.001 || x1 - x0 <= 0.5 || y1 - y0 <= 0.5) return null;
  const c = d * 0.7;
  const sk = skip ? { "data-probe-skip": true } : {}, bk = skip || skipBack ? { "data-probe-skip": true } : {};
  // `skipCap`: a cap hidden under something drawn over it (the pump's header on its cabinet) is not measured
  return (
    <g opacity={op}>
      {d > 0.5 && <polygon {...bk} points={pts([[x1, y0], [x1 + d, y0 - c], [x1 + d, y1 - c], [x1, y1]])} fill={fill.side ?? `url(#${id}Side)`} />}
      {d > 0.5 && <polygon {...(skipCap ? { "data-probe-skip": true } : bk)} points={pts([[x0, y0], [x0 + d, y0 - c], [x1 + d, y0 - c], [x1, y0]])} fill={fill.cap ?? `url(#${id}Cap)`} />}
      <rect {...sk} x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={fill.face ?? `url(#${id}${lit ? "Lit" : "Face"})`} />
      {!noInset && <line data-probe-skip x1={x0} y1={y0 + 0.5} x2={x1} y2={y0 + 0.5} stroke={alpha("#ffffff", 0.5)} strokeWidth={1} />}
    </g>
  );
};

/** an extruded prism from any convex front outline (listed clockwise from the top-left): its side and cap are swept up-right from the
 *  outline's right-facing and top-facing edges */
export const FPrism: React.FC<{ id: string; outline: [number, number][]; d: number; lit?: boolean; op?: number; skipBack?: boolean }> = ({ id, outline, d, lit, op = 1, skipBack }) => {
  if (op <= 0.001) return null;
  const c = d * 0.7, n = outline.length, bk = skipBack ? { "data-probe-skip": true } : {};
  const sweeps: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = outline[i], b = outline[(i + 1) % n];
    // an edge faces the extrusion when its outward normal (clockwise outline, y down: (dy, −dx)) points up or right
    const nx = b[1] - a[1], ny = -(b[0] - a[0]);
    const dot = nx * d - ny * c;   // the extrusion is (+d, −c)
    if (dot <= 0) continue;
    const up = Math.abs(ny) > Math.abs(nx);
    sweeps.push(<polygon key={i} {...bk} points={pts([a, [a[0] + d, a[1] - c], [b[0] + d, b[1] - c], b])} fill={up ? `url(#${id}Cap)` : `url(#${id}Side)`} />);
  }
  return (
    <g opacity={op}>
      {sweeps}
      <polygon points={pts(outline)} fill={`url(#${id}${lit ? "Lit" : "Face"})`} />
    </g>
  );
};

const mixc = (a: string, b: string, t: number) => {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = h(a), B = h(b), u = Math.max(0, Math.min(1, t));
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, "0")).join("");
};

/** ★ a ROUNDED outline, clockwise from the top-left (y down): a rectangle whose corners are arcs of radius `rad`, the top-right corner
 *  optionally CHAMFERED by `cut` (a jerry can's spout corner) with its own small rounding. Arcs in 7 steps: smooth at any framing. */
export const rrect = (x0: number, y0: number, x1: number, y1: number, rad: number, cut = 0): [number, number][] => {
  const out: [number, number][] = [];
  const arc = (cx: number, cy: number, R: number, a0: number, a1: number) => { for (let i = 0; i <= 7; i++) { const a = a0 + ((a1 - a0) * i) / 7; out.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); } };
  const r = Math.min(rad, (x1 - x0) / 2, (y1 - y0) / 2);
  arc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5);
  if (cut > 0) { const s = Math.min(r, 10); out.push([x1 - cut - s, y0]); out.push([x1 - cut + s * 0.4, y0 + s * 0.4]); out.push([x1 - s * 0.4, y0 + cut - s * 0.4]); out.push([x1, y0 + cut + s]); }
  else arc(x1 - r, y0 + r, r, Math.PI * 1.5, Math.PI * 2);
  arc(x1 - r, y1 - r, r, 0, Math.PI * 0.5);
  arc(x0 + r, y1 - r, r, Math.PI * 0.5, Math.PI);
  return out;
};

/** ★★ A HOUSE 2-D SOLID THAT READS AS RENDERED (Timur, 2026-10-18: the gas objects "look blocky… make it more realistic"): the same
 *  construction as FBox/FPrism — a flat front face, its depth swept UP AND TO THE RIGHT (cap 0.7·d) — but every swept facet takes its OWN
 *  flat shade from its outward normal, from the lit cap (facing up) round to the deep side (facing right), so a rounded corner turns
 *  smoothly from light to shade like a real one; each facet is outlined in its own colour (no seams). The front face keeps the house
 *  gradient; a CATCHLIGHT runs along its up- and left-facing edges and a dark line along its lower right (the bevel). Convex outlines only. */
export const FSolid: React.FC<{ id: string; outline: [number, number][]; d: number; lit?: boolean; face?: string; op?: number; skip?: boolean; skipBack?: boolean;
  tone?: [string, string]; rim?: number }> = ({ id, outline, d, lit, face, op = 1, skip, skipBack, tone = ["#A9C8EC", "#022B5C"], rim = 0.55 }) => {
  if (op <= 0.001) return null;
  const c = d * 0.7, n = outline.length, bk = skip || skipBack ? { "data-probe-skip": true } : {}, sk = skip ? { "data-probe-skip": true } : {};
  const sweeps: React.ReactNode[] = [];
  let hi = "", lo = "";
  for (let i = 0; i < n; i++) {
    const a = outline[i], b = outline[(i + 1) % n];
    const ex = b[0] - a[0], ey = b[1] - a[1], len = Math.hypot(ex, ey) || 1;
    const nx = ey / len, ny = -ex / len;   // outward normal of a clockwise outline, y down
    if (nx * d - ny * c > 0) {
      // the facet's turn from facing UP (t 0) to facing RIGHT (t 1)
      const t = Math.max(0, Math.min(1, Math.atan2(nx, -ny) / (Math.PI / 2)));
      const col = mixc(tone[0], tone[1], t * t * (3 - 2 * t));
      sweeps.push(<polygon key={i} {...bk} points={pts([a, [a[0] + d, a[1] - c], [b[0] + d, b[1] - c], b])} fill={col} stroke={col} strokeWidth={0.8} strokeLinejoin="round" />);
    }
    // the bevel: up- or left-facing front edges catch the key; down- or right-facing ones fall into a thin shade
    if (-ny > 0.3 || -nx > 0.3) hi += `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)} `;
    else if (ny > 0.3 || nx > 0.3) lo += `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)} `;
  }
  return (
    <g opacity={op < 1 ? op : undefined}>
      {sweeps}
      <polygon {...sk} points={pts(outline)} fill={face ?? `url(#${id}${lit ? "Lit" : "Face"})`} />
      {rim > 0 && hi && <path data-probe-skip d={hi} fill="none" stroke={alpha("#FFFFFF", rim)} strokeWidth={1.6} strokeLinecap="round" />}
      {rim > 0 && lo && <path data-probe-skip d={lo} fill="none" stroke={alpha("#000814", rim * 0.6)} strokeWidth={1.4} strokeLinecap="round" />}
    </g>
  );
};

/** a soft contact shadow under an object (painted, never a CSS filter: STYLE §6.2) */
export const Contact: React.FC<{ x0: number; x1: number; y: number; a?: number }> = ({ x0, x1, y, a = 0.55 }) => (
  <div data-probe-skip style={{ position: "absolute", left: x0 - (x1 - x0) * 0.1, top: y - 14, width: (x1 - x0) * 1.2, height: 34, borderRadius: "50%",
    background: `radial-gradient(ellipse, rgba(0,8,20,${a}) 0%, transparent 70%)` }} />
);
