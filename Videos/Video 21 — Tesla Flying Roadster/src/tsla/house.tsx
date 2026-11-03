import React from "react";
import { alpha, mixHex, clamp01 } from "./anim";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// ★ THE GLOSSY HOUSE — Video 10's ONE deliberate recurring spine (the brief: "The glossy house is the ONE deliberate recurring spine;
// it must look different each time it returns (size, angle, what's attached to it)"). Built in the DEMO's material (Bankers/Demo
// scenery.tsx FgHouse: the gable front in a light-top satin gradient, the receding wall deep, the roof planes in the blue ramp, white
// fascia as the rim light, lit glass), as a SOLID on the house oblique (depth up-right, STYLE §6.3): a gable front, its right wall
// receding, both roof planes, a chimney on the near plane, a door, the big lit front window, an attic roundel, two side windows,
// and a satin sheen. Few, large parts (STYLE §6.8a).
//   cx, gy  — the front face's bottom centre;  w — its width;  k — how far round we see it (0.18 near-front … 0.62 three-quarter)
//   s       — a scale about (cx, gy) (the hook's honest shrink);  lit — the windows' glow, 0..1
// ══════════════════════════════════════════════════════════════════════════════════════════════

export type HouseGeom = ReturnType<typeof houseGeom>;
export const houseGeom = (cx: number, gy: number, w: number, k = 0.3) => {
  const H = w * 0.6, R = w * 0.42, ov = w * 0.07;
  const L = cx - w / 2, Rx = cx + w / 2, top = gy - H, peak = { x: cx, y: top - R };
  const d = { x: w * k, y: -w * k * 0.62 };
  const slope = R / (w / 2);
  const eL = { x: L - ov, y: top + ov * slope }, eR = { x: Rx + ov, y: top + ov * slope };
  // the big front window (the one the hook's camera dives into) and the door
  const win = { x: cx + w * 0.06, y: top + H * 0.2, w: w * 0.3, h: H * 0.42 };
  const door = { x: cx - w * 0.36, y: top + H * 0.34, w: w * 0.18, h: H * 0.66 };
  const attic = { x: cx, y: top - R * 0.42, r: w * 0.065 };
  return { w, H, R, ov, L, Rx, top, gy, cx, peak, d, eL, eR, win, door, attic };
};
/** the centre of the lit front window — where the hook's dive aims and the lens bloom starts (in the house's own space) */
export const windowCentre = (g: HouseGeom) => ({ x: g.win.x + g.win.w / 2, y: g.win.y + g.win.h / 2 });

const P = (pts: { x: number; y: number }[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
const add = (a: { x: number; y: number }, b: { x: number; y: number }, t = 1) => ({ x: a.x + b.x * t, y: a.y + b.y * t });

/** the house's outline only (the hook's "thin outline of its old size") — the gable front and the roof's near edges */
export const HouseOutline: React.FC<{ g: HouseGeom; op: number; ink?: string }> = ({ g, op, ink = "#B3CEEF" }) => (
  <g opacity={op} fill="none" stroke={alpha(ink, 0.6)} strokeWidth={3} strokeLinejoin="round" strokeDasharray="14 10">
    <polygon points={P([{ x: g.L, y: g.gy }, { x: g.L, y: g.top }, g.peak, { x: g.Rx, y: g.top }, { x: g.Rx, y: g.gy }])} />
    <polyline points={P([{ x: g.Rx, y: g.gy }, add({ x: g.Rx, y: g.gy }, g.d), add({ x: g.Rx, y: g.top }, g.d), add(g.peak, g.d), g.peak])} />
  </g>
);

/** ★ THE HOUSE, BUILT WITH ITS PARTS (Timur, 2026-10-13: "in general, the visuals should be more detailed, like in the Style 3 films — I
 *  mean the 3d visuals"). Every part a real house has, in the demo's satin, all on the one oblique: a darker FOUNDATION band under the
 *  front and the side; LAP SIDING on both walls (one course per ~30 px, never finer — STYLE §6.9a); light CORNER TRIM; SHINGLE COURSES
 *  on the near roof plane and the ridge board along its top; a GUTTER along the side eave with its DOWNSPOUT at the far corner; the
 *  window FRAMED, with its sill, shuttered both sides; the door PANELLED, with its lintel, a STEP in front and a porch LAMP beside it;
 *  the attic roundel in its trim ring; the chimney with its CAP and flue; the side windows framed and divided. */
export const GlossyHouse: React.FC<{ id: string; g: HouseGeom; lit?: number; light?: number }> = ({ id, g, lit = 1, light = 0 }) => {
  const { w, H, L, Rx, top, gy, peak, d, eL, eR, win, door, attic } = g;
  const fr = (c: string, cl: string) => mixHex(c, cl, light);
  const sw = Math.max(2, w * 0.006);                      // a hairline that scales with the house
  const fh = H * 0.07;                                    // the foundation's height
  const courses = Math.max(3, Math.floor((H - fh) / 30)); // lap siding, one course per ~30 px
  const at = (u: number, v: number) => ({ x: Rx + d.x * u, y: top + (gy - top) * v + d.y * u });   // a point on the side wall
  // window panes: lit glass, its mullions, the frame's inner shadow along each pane's top and left
  const pane = (x: number, y: number, pw: number, ph: number, k: string) => (
    <g key={k}>
      <rect x={x} y={y} width={pw} height={ph} fill={`url(#${id}Glass)`} />
      <rect x={x} y={y} width={pw} height={ph} fill={alpha("#FFFFFF", 0.35 * lit)} />
      <rect x={x} y={y} width={pw} height={Math.max(3, ph * 0.07)} fill={alpha("#0B3F82", 0.28)} />
      <rect x={x} y={y} width={Math.max(3, pw * 0.07)} height={ph} fill={alpha("#0B3F82", 0.18)} />
    </g>
  );
  const sideWin = (t0: number, t1: number, v0: number, v1: number, k: string) => (
    <g key={k}>
      <polygon points={P([at(t0, v0), at(t1, v0), at(t1, v1), at(t0, v1)])} fill={`url(#${id}SideGlass)`} stroke={alpha("#DCE8F6", 0.65)} strokeWidth={sw * 1.4} />
      <line x1={at((t0 + t1) / 2, v0).x} y1={at((t0 + t1) / 2, v0).y} x2={at((t0 + t1) / 2, v1).x} y2={at((t0 + t1) / 2, v1).y} stroke={alpha("#DCE8F6", 0.55)} strokeWidth={sw} />
      <line x1={at(t0, (v0 + v1) / 2).x} y1={at(t0, (v0 + v1) / 2).y} x2={at(t1, (v0 + v1) / 2).x} y2={at(t1, (v0 + v1) / 2).y} stroke={alpha("#DCE8F6", 0.55)} strokeWidth={sw} />
      {/* its sill, a light ledge under it */}
      <line x1={at(t0 - 0.02, v1 + 0.02).x} y1={at(t0 - 0.02, v1 + 0.02).y} x2={at(t1 + 0.02, v1 + 0.02).x} y2={at(t1 + 0.02, v1 + 0.02).y} stroke={alpha("#DCE8F6", 0.7)} strokeWidth={sw * 2} strokeLinecap="round" />
    </g>
  );
  // the near roof plane's corners, and a point along it (t: down the slope from the ridge, u: back along the depth)
  const roofN = (t: number, u: number) => add(add(peak, { x: (eR.x - peak.x) * t, y: (eR.y - peak.y) * t }), d, u);
  const shutterW = win.w * 0.2, gapW = w * 0.018;
  const shutter = (x: number, k: string) => (
    <g key={k}>
      <rect x={x} y={win.y - 4} width={shutterW} height={win.h + 8} rx={2} fill={`url(#${id}Shutter)`} />
      {[1, 2, 3].map((i) => <line key={i} x1={x + 3} x2={x + shutterW - 3} y1={win.y - 4 + ((win.h + 8) * i) / 4} y2={win.y - 4 + ((win.h + 8) * i) / 4} stroke={alpha("#DCE8F6", 0.32)} strokeWidth={sw} />)}
    </g>
  );
  const step = { x: door.x - w * 0.025, w: door.w + w * 0.05, h: Math.max(6, H * 0.035), dd: { x: d.x * 0.1, y: d.y * 0.1 } };
  const lamp = { x: door.x + door.w + w * 0.04, y: door.y + door.h * 0.22, r: Math.max(4, w * 0.012) };
  return (
    <g>
      <defs>
        <linearGradient id={`${id}Front`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor={fr("#D7E6F7", "#FFFFFF")} /><stop offset="0.38" stopColor={fr("#6FA3DF", "#DCE8F6")} /><stop offset="1" stopColor={fr("#0A4590", "#8DB6E6")} />
        </linearGradient>
        <linearGradient id={`${id}Side`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={fr("#0F57AA", "#9DC0EA")} /><stop offset="1" stopColor={fr("#01193A", "#4D8ED9")} />
        </linearGradient>
        <linearGradient id={`${id}Found`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={fr("#0A3E80", "#6FA3DF")} /><stop offset="1" stopColor={fr("#021E44", "#3C83D5")} />
        </linearGradient>
        <linearGradient id={`${id}RoofN`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={fr("#022A5B", "#6FA3DF")} /><stop offset="0.65" stopColor={fr("#0D55A8", "#9DC0EA")} /><stop offset="1" stopColor={fr("#6FA3DF", "#E3EDF9")} />
        </linearGradient>
        <linearGradient id={`${id}RoofF`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={fr("#8DB6E6", "#FFFFFF")} /><stop offset="1" stopColor={fr("#1F62B3", "#B3CEEF")} />
        </linearGradient>
        <linearGradient id={`${id}Glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" /><stop offset="0.5" stopColor={mixHex("#6FA3DF", "#DCE8F6", lit)} /><stop offset="1" stopColor={mixHex("#1F62B3", "#8DB6E6", lit)} />
        </linearGradient>
        <linearGradient id={`${id}SideGlass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={mixHex("#3C83D5", "#DCE8F6", lit * 0.8)} /><stop offset="1" stopColor={mixHex("#0B3F82", "#6FA3DF", lit * 0.8)} />
        </linearGradient>
        <linearGradient id={`${id}Shutter`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={fr("#2D6FC0", "#8DB6E6")} /><stop offset="1" stopColor={fr("#06397A", "#3C83D5")} />
        </linearGradient>
        <linearGradient id={`${id}Door`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={fr("#1A5DB0", "#8DB6E6")} /><stop offset="1" stopColor={fr("#062E66", "#4D8ED9")} />
        </linearGradient>
        <linearGradient id={`${id}Sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.32" /><stop offset="0.3" stopColor="#FFFFFF" stopOpacity="0.06" /><stop offset="0.31" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}Glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#DCE8F6" stopOpacity={0.55 * lit} /><stop offset="1" stopColor="#4D8ED9" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* ── the far roof plane (the left slope, receding), then the side wall with its foundation, siding and windows ── */}
      <polygon points={P([peak, eL, add(eL, d), add(peak, d)])} fill={`url(#${id}RoofF)`} />
      <polygon points={P([{ x: Rx, y: gy }, { x: Rx, y: top }, add({ x: Rx, y: top }, d), add({ x: Rx, y: gy }, d)])} fill={`url(#${id}Side)`} />
      {[...Array(courses)].map((_, i) => {
        const v = (i + 1) / (courses + 1) * (1 - fh / H);
        return <line key={`ss${i}`} x1={at(0, v).x} y1={at(0, v).y} x2={at(1, v).x} y2={at(1, v).y} stroke={alpha("#000814", 0.2)} strokeWidth={sw} />;
      })}
      <polygon points={P([at(0, 1 - fh / H), at(1, 1 - fh / H), at(1, 1), at(0, 1)])} fill={`url(#${id}Found)`} opacity={0.9} />
      {sideWin(0.2, 0.42, 0.28, 0.62, "s1")}
      {sideWin(0.58, 0.8, 0.28, 0.62, "s2")}
      {/* the downspout down the far corner */}
      <line x1={at(1, 0.02).x - sw * 2} y1={at(1, 0.02).y} x2={at(1, 1).x - sw * 2} y2={at(1, 1).y - 2} stroke={alpha("#B3CEEF", 0.55)} strokeWidth={sw * 2.2} strokeLinecap="round" />
      {/* ── the near roof plane, its shingle courses (along the depth, one per sixth of the slope), the ridge board ── */}
      <polygon points={P([peak, eR, add(eR, d), add(peak, d)])} fill={`url(#${id}RoofN)`} />
      {[1, 2, 3, 4, 5].map((i) => {
        const a = roofN(i / 6, 0), b = roofN(i / 6, 1);
        return (
          <g key={`sh${i}`}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={alpha("#000814", 0.24)} strokeWidth={sw * 1.2} />
            <line x1={a.x} y1={a.y - sw * 1.4} x2={b.x} y2={b.y - sw * 1.4} stroke={alpha("#FFFFFF", 0.1)} strokeWidth={sw} />
          </g>
        );
      })}
      {/* the chimney on the near roof plane: its shaft (front, side), its cap overhanging, the dark flue */}
      {(() => {
        const base = add(roofN(0.42, 0), d, 0.55), cw = w * 0.09, ch = g.R * 0.62, cd = { x: d.x * 0.2, y: d.y * 0.2 };
        const f0 = { x: base.x - cw / 2, y: base.y }, f1 = { x: base.x + cw / 2, y: base.y + cw * 0.4 };
        const t0 = { x: f0.x - cw * 0.12, y: f0.y - ch }, t1 = { x: f1.x + cw * 0.12, y: f1.y - ch }, capH = cw * 0.22;
        return (
          <g>
            <polygon points={P([{ x: f1.x, y: f1.y - ch }, add({ x: f1.x, y: f1.y - ch }, cd), add(f1, cd), f1])} fill={`url(#${id}Side)`} />
            <polygon points={P([{ x: f0.x, y: f0.y - ch }, { x: f1.x, y: f1.y - ch }, f1, f0])} fill={`url(#${id}Front)`} />
            <polygon points={P([t0, t1, { x: t1.x, y: t1.y - capH }, { x: t0.x, y: t0.y - capH }])} fill="#B3CEEF" />
            <polygon points={P([{ x: t1.x, y: t1.y - capH }, add({ x: t1.x, y: t1.y - capH }, cd, 1.2), add(t1, cd, 1.2), t1])} fill={`url(#${id}Side)`} />
            <polygon points={P([{ x: t0.x, y: t0.y - capH }, add({ x: t0.x, y: t0.y - capH }, cd, 1.2), add({ x: t1.x, y: t1.y - capH }, cd, 1.2), { x: t1.x, y: t1.y - capH }])} fill="#E3EDF9" />
            <polygon points={P([add({ x: t0.x + cw * 0.3, y: t0.y - capH - 1 }, cd, 0.3), add({ x: t1.x - cw * 0.3, y: t1.y - capH - 1 }, cd, 0.3), add({ x: t1.x - cw * 0.3, y: t1.y - capH - 1 }, cd, 0.9), add({ x: t0.x + cw * 0.3, y: t0.y - capH - 1 }, cd, 0.9)])} fill="#021E44" />
          </g>
        );
      })()}
      <polyline points={P([peak, add(peak, d)])} fill="none" stroke={alpha("#FFFFFF", 0.8)} strokeWidth={Math.max(4, w * 0.012)} strokeLinecap="round" />
      {/* the gutter along the side eave (a light half-pipe and its shadow line) */}
      <polyline points={P([eR, add(eR, d)])} fill="none" stroke={alpha("#000814", 0.35)} strokeWidth={sw * 2} transform={`translate(0 ${sw * 2.2})`} />
      <polyline points={P([eR, add(eR, d)])} fill="none" stroke="#DCE8F6" strokeWidth={Math.max(4, w * 0.013)} strokeLinecap="round" />
      {/* ── the gable front: its face, lap siding, the foundation band, corner trim ── */}
      <polygon points={P([{ x: L, y: gy }, { x: L, y: top }, peak, { x: Rx, y: top }, { x: Rx, y: gy }])} fill={`url(#${id}Front)`} />
      {[...Array(courses)].map((_, i) => {
        const y = top + ((i + 1) / (courses + 1)) * (H - fh);
        return (
          <g key={`fs${i}`}>
            <line x1={L} x2={Rx} y1={y} y2={y} stroke={alpha("#FFFFFF", 0.12)} strokeWidth={sw} />
            <line x1={L} x2={Rx} y1={y + sw * 1.3} y2={y + sw * 1.3} stroke={alpha("#002A5A", 0.16)} strokeWidth={sw} />
          </g>
        );
      })}
      <rect x={L} y={gy - fh} width={w} height={fh} fill={`url(#${id}Found)`} />
      <line x1={L} x2={Rx} y1={gy - fh} y2={gy - fh} stroke={alpha("#DCE8F6", 0.5)} strokeWidth={sw} />
      <rect x={L} y={top} width={w * 0.028} height={H - fh} fill={alpha("#E3EDF9", 0.5)} />
      <rect x={Rx - w * 0.028} y={top} width={w * 0.028} height={H - fh} fill={alpha("#DCE8F6", 0.3)} />
      {/* ── the window: its glow on the wall, shutters, frame, four lit panes, the sill ── */}
      <ellipse cx={win.x + win.w / 2} cy={win.y + win.h / 2} rx={win.w * 1.1} ry={win.h * 0.95} fill={`url(#${id}Glow)`} />
      {shutter(win.x - 7 - gapW - shutterW, "shL")}
      {shutter(win.x + win.w + 7 + gapW, "shR")}
      <rect x={win.x - 7} y={win.y - 7} width={win.w + 14} height={win.h + 14} rx={4} fill="#EEF5FB" />
      {pane(win.x, win.y, win.w / 2 - 3, win.h / 2 - 3, "p1")}
      {pane(win.x + win.w / 2 + 3, win.y, win.w / 2 - 3, win.h / 2 - 3, "p2")}
      {pane(win.x, win.y + win.h / 2 + 3, win.w / 2 - 3, win.h / 2 - 3, "p3")}
      {pane(win.x + win.w / 2 + 3, win.y + win.h / 2 + 3, win.w / 2 - 3, win.h / 2 - 3, "p4")}
      <rect x={win.x - 14} y={win.y + win.h + 6} width={win.w + 28} height={Math.max(8, H * 0.03)} rx={2} fill="#DCE8F6" />
      <rect x={win.x - 14} y={win.y + win.h + 6 + Math.max(8, H * 0.03)} width={win.w + 28} height={3} fill={alpha("#000814", 0.3)} />
      {/* ── the door: lintel, frame, two inset panels, its knob; the step in front; the porch lamp ── */}
      <rect x={door.x - 10} y={door.y - 14} width={door.w + 20} height={Math.max(8, H * 0.035)} rx={2} fill="#DCE8F6" />
      <rect x={door.x} y={door.y} width={door.w} height={door.h} rx={door.w * 0.08} fill={`url(#${id}Door)`} stroke="#EEF5FB" strokeWidth={Math.max(4, w * 0.012)} />
      <rect x={door.x + door.w * 0.18} y={door.y + door.h * 0.1} width={door.w * 0.64} height={door.h * 0.34} rx={3} fill="none" stroke={alpha("#B3CEEF", 0.45)} strokeWidth={sw} />
      <rect x={door.x + door.w * 0.18} y={door.y + door.h * 0.52} width={door.w * 0.64} height={door.h * 0.38} rx={3} fill="none" stroke={alpha("#B3CEEF", 0.45)} strokeWidth={sw} />
      <circle cx={door.x + door.w * 0.8} cy={door.y + door.h * 0.55} r={Math.max(3, w * 0.008)} fill="#EEF5FB" />
      <polygon points={P([{ x: step.x, y: gy - step.h }, add({ x: step.x, y: gy - step.h }, step.dd), add({ x: step.x + step.w, y: gy - step.h }, step.dd), { x: step.x + step.w, y: gy - step.h }])} fill="#E3EDF9" />
      <rect x={step.x} y={gy - step.h} width={step.w} height={step.h} fill={`url(#${id}Found)`} />
      <circle cx={lamp.x} cy={lamp.y} r={lamp.r * 3.2} fill={`url(#${id}Glow)`} />
      <rect x={lamp.x - lamp.r} y={lamp.y - lamp.r * 1.4} width={lamp.r * 2} height={lamp.r * 2.8} rx={lamp.r * 0.6} fill={mixHex("#8DB6E6", "#FFFFFF", lit)} stroke="#DCE8F6" strokeWidth={sw * 0.8} />
      {/* ── the attic roundel in its trim ring ── */}
      <circle cx={attic.x} cy={attic.y} r={attic.r * 1.22} fill="none" stroke={alpha("#DCE8F6", 0.55)} strokeWidth={sw * 1.4} />
      <circle cx={attic.x} cy={attic.y} r={attic.r} fill={`url(#${id}Glass)`} stroke="#EEF5FB" strokeWidth={Math.max(3, w * 0.01)} />
      <line x1={attic.x} x2={attic.x} y1={attic.y - attic.r} y2={attic.y + attic.r} stroke="#0B4B9A" strokeWidth={sw * 1.2} />
      <line x1={attic.x - attic.r} x2={attic.x + attic.r} y1={attic.y} y2={attic.y} stroke="#0B4B9A" strokeWidth={sw * 1.2} />
      {/* the satin sheen across the front, and the fascia as the rim light along the gable */}
      <polygon points={P([{ x: L, y: gy }, { x: L, y: top }, peak, { x: Rx, y: top }, { x: Rx, y: gy }])} fill={`url(#${id}Sheen)`} />
      <polyline points={P([eL, peak, eR])} fill="none" stroke="#EEF5FB" strokeWidth={Math.max(6, w * 0.024)} strokeLinejoin="round" strokeLinecap="round" />
      <line x1={L} x2={Rx} y1={gy} y2={gy} stroke={alpha("#000814", 0.35)} strokeWidth={3} />
    </g>
  );
};

/** ★ THE GROUND UNDER A HOUSE, IN THE HOUSE'S OWN PROJECTION (Timur, 2026-10-13: "make sure the house properly sits on the circular
 *  surface"). The house is drawn on an oblique: its depth runs up and to the right by `d` for a real depth of `depth` × its width.
 *  A circle on that same ground is therefore a SHEARED ellipse — `matrix(1 0 sx sy cx cy)` applied to a circle, where one unit of
 *  ground depth lands at (sx, sy) on screen — and it is centred under the FOOTPRINT's middle (the front's middle plus half of `d`),
 *  not under the front face. A flat axis-aligned ellipse under the front (the first build) left the back of every house hanging past
 *  the rim. `rho` is the circle's radius on the ground; it must exceed the footprint's half-diagonal (`reach`) for the house to stand
 *  inside it. */
export type Floor = { c: { x: number; y: number }; rho: number; sx: number; sy: number; m: string; reach: number };
export const floorOf = (g: HouseGeom, rho: number, depth = 0.75): Floor => {
  const D = g.w * depth;
  const sx = g.d.x / D, sy = g.d.y / D;
  const c = { x: g.cx + g.d.x / 2, y: g.gy + g.d.y / 2 };
  const reach = Math.hypot(g.w / 2, D / 2);
  if (rho < reach * 1.04) throw new Error(`house floor: radius ${rho} does not hold the footprint (half-diagonal ${reach.toFixed(0)})`);
  return { c, rho, sx, sy, reach, m: `matrix(1 0 ${sx.toFixed(5)} ${sy.toFixed(5)} ${c.x.toFixed(2)} ${c.y.toFixed(2)})` };
};
/** the floor circle's outline on screen, as a path (for clip paths): the sheared circle sampled round */
export const floorPath = (fl: Floor, inset = 0) => {
  const r = fl.rho - inset, pts: string[] = [];
  for (let k = 0; k < 72; k++) {
    const a = (k / 72) * Math.PI * 2, u = r * Math.cos(a), v = r * Math.sin(a);
    pts.push(`${(fl.c.x + u + fl.sx * v).toFixed(1)} ${(fl.c.y + fl.sy * v).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
};

/** a thin reflective platform: the floor circle (floorOf) as a satin slab — its edge (the same circle, dropped by its thickness, showing
 *  as the front crescent), its top, a rim highlight — and the house's CONTACT SHADOW on it, a soft pool under the footprint, so the
 *  house stands ON the slab. The shadow sits in the house's own scale group when the house scales (pass `shadow={false}` here then). */
export const Platform: React.FC<{ id: string; floor: Floor; on: number; thick?: number; shadow?: boolean }> = ({ id, floor, on, thick = 12, shadow = true }) => (
  <g opacity={clamp01(on)}>
    <defs>
      <linearGradient id={`${id}PTop`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#0B3F82" stopOpacity="0.32" /><stop offset="0.45" stopColor="#4D8ED9" stopOpacity="0.55" /><stop offset="0.55" stopColor="#6FA3DF" stopOpacity="0.6" /><stop offset="1" stopColor="#0B3F82" stopOpacity="0.32" />
      </linearGradient>
      <linearGradient id={`${id}PEdge`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#1F62B3" /><stop offset="0.5" stopColor="#B3CEEF" /><stop offset="1" stopColor="#0B3F82" />
      </linearGradient>
    </defs>
    {/* the slab's edge: the floor's outline dropped by its thickness, behind the top — its front crescent is the visible edge. Drawn as
        PATHS (floorPath), never a sheared <circle>: the probe boxes a transformed circle by its unsheared square (1,300 px wide) */}
    <path d={floorPath(floor)} transform={`translate(0 ${thick})`} fill={`url(#${id}PEdge)`} opacity={0.9} />
    <path d={floorPath(floor)} fill="#04234A" />
    <path d={floorPath(floor)} fill={`url(#${id}PTop)`} />
    {/* an inlaid ring a little inside the rim, and the rim's highlight */}
    <path d={floorPath(floor, floor.rho * 0.1)} fill="none" stroke={alpha("#B3CEEF", 0.18)} strokeWidth={2} />
    <path d={floorPath(floor)} fill="none" stroke={alpha("#DCE8F6", 0.6)} strokeWidth={2} />
    {shadow && <ContactShadow id={id} floor={floor} />}
  </g>
);
/** the house's soft contact shadow on its floor: a pool under the footprint, darkest at its middle (a radial gradient — no filter) */
export const ContactShadow: React.FC<{ id: string; floor: Floor }> = ({ id, floor }) => (
  <g transform={floor.m} data-probe-skip>
    <defs>
      <radialGradient id={`${id}Sh`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#000814" stopOpacity="0.62" /><stop offset="0.62" stopColor="#000814" stopOpacity="0.38" /><stop offset="1" stopColor="#000814" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx={0} cy={0} r={floor.reach * 1.12} fill={`url(#${id}Sh)`} />
  </g>
);
