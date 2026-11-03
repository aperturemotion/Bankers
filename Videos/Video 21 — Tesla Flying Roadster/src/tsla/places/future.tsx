import React from "react";
import { useCurrentFrame } from "remotion";
import { rInOut, clamp01, alpha, mixHex } from "../anim";
import { Turn } from "../kit";
import { Pool3D } from "../s3";
import { FlatDefs, rrect } from "../flat";
import { SENTENCES } from "../captions";
import { SPXW_D, SPXW_VIEW } from "../spxwordmark";
import { Faces, seen, depthOf, lightOf, metal, mix, affine, P, swing, type Face, type V } from "../p3";
import { type Rig } from "../rig";
import { cybercabFaces, CB } from "../cybercab3d";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// teachD / teachD2 — "Investors aren't paying for the cars Tesla sells today. They're paying for what Musk says comes next: robotaxis,
// robots, and maybe SpaceX." ONE WIDE SHOWROOM FLOOR, in two halves the camera travels between (FUTURE.travel, at teachD2 — the film's ONE
// light frame floods during that travel):
//   · LEFT (teachD, navy) — THE CARS TESLA SELLS TODAY, in the house 2-D construction (STYLE §6.1a: side-on cars read face-on): a Model Y
//     and a Model 3 parked under the showroom's light. On "cars" their lamps come on; on "today" the light over them DIMS.
//   · RIGHT (teachD2, the white stage) — WHAT COMES NEXT, ★ IN REAL DEPTH (Timur, 2026-10-29: "make them more 3D"; STYLE §16 2026-10-29):
//     three showroom TURNTABLES (real drums set in the floor, an LED rim, etched brushed tops) are there with the camera; their rims light
//     along the row on "next"; then, on their words —
//       a CYBERCAB (Tesla's two-seat robotaxi: a lofted body of flat planes, a wrap-round glasshouse and glass roof, two butterfly doors,
//       full-width light bars, aero wheel covers on real tyres) DRIVES IN from the left on "robotaxis", its wheels turning with the ground
//       it covers (blurred when too fast to read), braking to a stop centred on its turntable, which then turns it slowly;
//       a ROBOT HAND (articulated fingers with real thickness, axle knuckles, a palm with a pad, a ribbed wrist actuator on its post) is
//       LOWERED onto the centre of its turntable on "robots" — on its axis for the whole entrance (STYLE §16 2026-10-29: an object arrives
//       ON its stand, never beside it);
//       a STARSHIP model (a stainless cylinder lit round its curve, weld rings, black heat tiles on its shaded side, the forward and aft
//       flaps standing out in depth, SpaceX's wordmark) is LOWERED onto its stand's turntable on "maybe SpaceX", as the real one lands.
// Inks follow the stage (`light`, 0 navy … 1 white; the lead passes it — a fallback ramp follows the travel when it does not).
// KIND object.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const KIND = "object";

type C = { arrive: number; investors: number; paying: number; today: number; next: number; robotaxis: number; robots: number; maybe: number; spacexB: number; end: number; light?: number };

/** the travel onto the right half (registry.tsx teachD2: "They're paying" − 12) and the next place's first frame (teachE) — the fallback
 *  light ramp follows them */
const sentAt = (re: RegExp) => { const s = SENTENCES.find((x) => re.test(x.text)); if (!s) throw new Error(`future: no sentence ${re}`); return s.at; };
const D2 = sentAt(/^They're paying/) - 12;
const NEXT_PLACE = sentAt(/^Musk has said both/) - 12;

export const futureTimes = (c: C) => ({
  /** the parked cars' lamps come on, on "cars" (a soft click) */
  lamps: [c.paying + 13, c.paying + 31] as [number, number],
  /** the light over the cars dims, on "today" (a soft low whoosh, or nothing — the travel's own airwoosh follows at once) */
  dim: [c.today - 12, c.today + 22] as [number, number],
  /** the three turntables' rim lights come on along the row, on "next" (a tick each) */
  rims: [0, 1, 2].map((i) => [c.next - 4 + 5 * i, c.next + 12 + 5 * i] as [number, number]),
  /** the Cybercab drives in from beyond the left edge and brakes to a stop on its turntable (a whooshsoft peaking as it enters; a soft
   *  click as it stops). ★ 2026-10-29: starts 6 f earlier (was robotaxis − 28) so it enters from off-frame at a car's speed. */
  cab: [c.robotaxis - 34, c.robotaxis + 8] as [number, number],
  /** the robot hand is lowered onto its turntable (a swoosh; a soft click as it seats) */
  hand: [c.robots - 14, c.robots + 12] as [number, number],
  /** the Starship model is lowered onto its stand (a swoosh; a low sub as it settles) */
  ship: [c.maybe - 9, c.spacexB + 12] as [number, number],
  /** the frame the place's LAST action ends (the next place waits for it) */
  done: c.spacexB + 12,
});

// ── layout (the place's own frame: the left half centred on x 540, the right half on 540 + TRAVEL) ──
const TRAVEL = 1020;
const G = 1250;   // the showroom floor (tyres and stands stand on it)
/** the cars, staggered as a showroom parks them: the Model Y a row behind (its floor line higher, a touch smaller), the Model 3 in front.
 *  Rear x, length, height (px), wheel radius, the axles' places along the body (u), the floor line g. Proportions from the real cars
 *  (Model Y 4,751 × 1,624 mm, Model 3 4,720 × 1,441 mm). */
const MY = { x0: 26, L: 490, H: 168, wr: 37, uf: 0.825, ur: 0.205, g: G - 58 };
const M3 = { x0: 410, L: 530, H: 162, wr: 39, uf: 0.822, ur: 0.213, g: G };
/** ★ the right half's three turntables, in that half's OWN frame (x 0..1080; the floor at G; z toward the viewer): centre x, radius */
const TT_X = [300, 668, 890], TT_R = [206, 86, 92];
/** a turntable is set FLUSH in the floor, its disc TT_H proud (the Cybercab drives onto it; the objects stand on its top) */
const TT_H = 4;
/** where the Cybercab starts its drive (its centre this far left of its turntable's: wholly beyond the frame's left edge) */
const CAB_RUN = 540;
/** ★★ THE CAMERA AIMS. `today` is in the left half's frame. ★ `cab`, `hand`, `ship` and `next` are in the RIGHT half's OWN frame
 *  (Video.tsx applies a key as an offset from where the place has ARRIVED, and teachD2 arrives after the travel): until 2026-10-29 they
 *  carried + TRAVEL, so every key pushed the camera ~200–360 px the WRONG way and the Cybercab sat cut by the frame's left edge the whole
 *  scene (the "glitched" Cybercab at 52 s). `ship` aims between the three (the move's framing is ~1.1× in: aimed at the ship itself, it cut the Cybercab at the left edge). */
export const FUTURE = {
  x: 540 + TRAVEL / 2, y: 1060,
  today: { x: 480, y: G - 130 }, next: { x: 540, y: 1030 }, travel: TRAVEL,
  cab: { x: 430, y: G - 80 }, hand: { x: TT_X[1], y: G - 240 }, ship: { x: 560, y: G - 300 },
} as const;

// ── drawing helpers ──
type XY = [number, number];
/** a smooth open curve through the points (Catmull-Rom as cubic Béziers), continuing an existing path */
const smooth = (p: XY[]) => {
  let d = "";
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], e = p[Math.min(p.length - 1, i + 2)];
    const c1: XY = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6], c2: XY = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
  }
  return d;
};
const closedSmooth = (p: XY[]) => `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}${smooth([...p, p[0]])} Z`;

type CarSpec = { x0: number; L: number; H: number; wr: number; uf: number; ur: number; g: number };
type Profile = { upper: XY[]; dlo: XY[]; sill: number; seams: [number, number, number, number][]; handles: XY[]; mirror: XY; head: XY[]; tail: XY[]; belt: XY[] };

/** ★ the body's side outline: the upper line (rear bumper → roof → nose, smooth), then the sill with the two wheel arches cut in it */
const bodyPath = (s: CarSpec, pr: Profile, ox = 0, oy = 0) => {
  const X = (u: number) => s.x0 + u * s.L + ox, Y = (h: number) => s.g - h * s.H + oy;
  const up = pr.upper.map(([u, h]) => [X(u), Y(h)] as XY);
  const ys = Y(pr.sill), R = s.wr + 7;
  const arch = (u: number) => {
    const cx = X(u), cy = s.g - s.wr + oy, dy = ys - cy, dx = Math.sqrt(Math.max(0, R * R - dy * dy));
    return { a: [cx + dx, ys] as XY, b: [cx - dx, ys] as XY, large: dy > 0 ? 1 : 0 };
  };
  const fa = arch(s.uf), ra = arch(s.ur);
  return `M${up[0][0].toFixed(1)} ${up[0][1].toFixed(1)}${smooth(up)}` +
    ` L${fa.a[0].toFixed(1)} ${fa.a[1].toFixed(1)} A${R} ${R} 0 ${fa.large} 0 ${fa.b[0].toFixed(1)} ${fa.b[1].toFixed(1)}` +
    ` L${ra.a[0].toFixed(1)} ${ra.a[1].toFixed(1)} A${R} ${R} 0 ${ra.large} 0 ${ra.b[0].toFixed(1)} ${ra.b[1].toFixed(1)} Z`;
};

/** one wheel: the tyre, the rim (five twin spokes, or an aero cover with five slots), the hub; `spin` in radians */
const Wheel: React.FC<{ cx: number; cy: number; r: number; spin: number; aero?: boolean; far?: boolean }> = ({ cx, cy, r, spin, aero, far }) => {
  const deg = (spin * 180) / Math.PI;
  if (far) return <circle data-probe-skip cx={cx} cy={cy} r={r} fill="#010A16" />;
  return (
    <g data-probe-skip>
      <circle cx={cx} cy={cy} r={r} fill="#040D1A" />
      <circle cx={cx} cy={cy} r={r - 2} fill="none" stroke={alpha("#4D8ED9", 0.28)} strokeWidth={1.4} />
      <circle cx={cx} cy={cy} r={r * 0.7} fill="url(#fuRim)" />
      <g transform={`translate(${cx} ${cy}) rotate(${deg.toFixed(2)})`}>
        {aero
          ? [0, 1, 2, 3, 4].map((i) => (
            <path key={i} transform={`rotate(${i * 72})`} d={`M${r * 0.3} ${-r * 0.06} L${r * 0.6} ${-r * 0.1} L${r * 0.6} ${r * 0.02} L${r * 0.3} ${r * 0.04} Z`} fill={alpha("#011A38", 0.6)} />
          ))
          : <>
            <circle r={r * 0.62} fill="#06152B" />
            {[0, 1, 2, 3, 4].map((i) => (
              <path key={i} transform={`rotate(${i * 72})`} d={`M${-r * 0.06} ${-r * 0.12} L${-r * 0.09} ${-r * 0.63} L${r * 0.09} ${-r * 0.63} L${r * 0.06} ${-r * 0.12} Z`} fill="url(#fuRim)" />
            ))}
          </>}
        <circle r={r * 0.17} fill="#0B3F82" stroke={alpha("#DCE8F6", 0.6)} strokeWidth={1.2} />
      </g>
      {/* the rim's lip catching the key at its top left */}
      <path d={`M${cx - r * 0.66} ${cy - r * 0.18} A${r * 0.69} ${r * 0.69} 0 0 1 ${cx + r * 0.2} ${cy - r * 0.66}`} fill="none" stroke={alpha("#FFFFFF", 0.55)} strokeWidth={1.4} />
    </g>
  );
};

/** ★ A CAR, SIDE-ON, nose to the right, in the house 2-D build: its far wheels and its body's depth swept up-right behind the face, the wheel
 *  wells, the painted side (one gradient: lit shoulder, a reflected band, dark sills), the glasshouse, door cuts, handles, mirror, lamps,
 *  the near wheels. `lamp` lights the head lamp 0..1; `spin` turns the wheels; `inside` draws what is seen through the glass. */
const Car: React.FC<{ s: CarSpec; pr: Profile; lamp: number; spin: number; aero?: boolean; inside?: React.ReactNode; tailBar?: boolean }> = ({ s, pr, lamp, spin, aero, inside, tailBar }) => {
  const X = (u: number) => s.x0 + u * s.L, Y = (h: number) => s.g - h * s.H;
  const DX = 1.9, DY = -1.35, N = 8;   // the body's depth: 8 copies up and to the right
  const wf = { x: X(s.uf), y: s.g - s.wr }, wr = { x: X(s.ur), y: s.g - s.wr };
  const body = bodyPath(s, pr);
  return (
    <g>
      {/* the far side's wheels, behind, offset by the body's depth */}
      <Wheel cx={wf.x + DX * N} cy={wf.y + DY * N} r={s.wr} spin={spin} far />
      <Wheel cx={wr.x + DX * N} cy={wr.y + DY * N} r={s.wr} spin={spin} far />
      {/* the depth: stepped copies of the body, darkest at the back */}
      {Array.from({ length: N }, (_, i) => N - i).map((k) => (
        <path key={k} data-probe-skip d={bodyPath(s, pr, DX * k, DY * k)} fill={k === N ? "#0B2F5E" : "#164A88"} stroke={k === N ? "#021A3A" : "none"} strokeWidth={1.2} />
      ))}
      {/* the wheel wells (dark, seen through the arches) */}
      <circle data-probe-skip cx={wf.x} cy={wf.y} r={s.wr + 6} fill="#010A16" />
      <circle data-probe-skip cx={wr.x} cy={wr.y} r={s.wr + 6} fill="#010A16" />
      {/* the painted side */}
      <path d={body} fill="url(#fuBody)" />
      <path data-probe-skip d={body} fill="url(#fuSheen)" />
      {/* the glasshouse and what is seen through it */}
      <path data-probe-skip d={closedSmooth(pr.dlo.map(([u, h]) => [X(u), Y(h)] as XY))} fill="url(#fuGlass)" stroke="#010E1E" strokeWidth={2.4} strokeLinejoin="round" />
      {inside}
      <path data-probe-skip d={closedSmooth(pr.dlo.map(([u, h]) => [X(u), Y(h)] as XY))} fill="url(#fuGlassSheen)" />
      {/* the shoulder line catching the key, and the beltline under the glass */}
      <path data-probe-skip d={`M${X(pr.belt[0][0]).toFixed(1)} ${Y(pr.belt[0][1]).toFixed(1)}${smooth(pr.belt.map(([u, h]) => [X(u), Y(h)] as XY))}`} fill="none" stroke={alpha("#DCE8F6", 0.5)} strokeWidth={2.2} strokeLinecap="round" />
      {/* door cuts and flush handles */}
      {pr.seams.map(([u0, h0, u1, h1], i) => (
        <line key={i} data-probe-skip x1={X(u0)} y1={Y(h0)} x2={X(u1)} y2={Y(h1)} stroke={alpha("#011A38", 0.75)} strokeWidth={1.8} />
      ))}
      {pr.handles.map(([u, h], i) => (
        <g key={i} data-probe-skip>
          <rect x={X(u) - 13} y={Y(h) - 2.6} width={26} height={5.2} rx={2.6} fill={alpha("#011A38", 0.55)} />
          <rect x={X(u) - 12} y={Y(h) - 2.6} width={24} height={2} rx={1} fill={alpha("#DCE8F6", 0.45)} />
        </g>
      ))}
      {/* the mirror on its stalk at the front of the side glass */}
      <g data-probe-skip>
        <line x1={X(pr.mirror[0]) - 4} y1={Y(pr.mirror[1]) + 5} x2={X(pr.mirror[0]) + 2} y2={Y(pr.mirror[1]) - 2} stroke="#0B2F5E" strokeWidth={4} strokeLinecap="round" />
        <ellipse cx={X(pr.mirror[0]) + 6} cy={Y(pr.mirror[1]) - 5} rx={s.L * 0.024} ry={s.H * 0.045} transform={`rotate(-12 ${X(pr.mirror[0]) + 6} ${Y(pr.mirror[1]) - 5})`} fill="url(#fuBody)" stroke="#011A38" strokeWidth={1} />
        <ellipse cx={X(pr.mirror[0]) + 3} cy={Y(pr.mirror[1]) - 8} rx={s.L * 0.012} ry={s.H * 0.016} fill={alpha("#FFFFFF", 0.45)} />
      </g>
      {/* the lamps: the head lamp's slim sliver (it lights on "cars"), the tail lamp (a full-width bar on the Cybercab) */}
      <path data-probe-skip d={closedSmooth(pr.head.map(([u, h]) => [X(u), Y(h)] as XY))} fill={mixHex("#2D6AB1", "#F5F9FD", lamp)} stroke="#011A38" strokeWidth={1} />
      <path data-probe-skip d={closedSmooth(pr.tail.map(([u, h]) => [X(u), Y(h)] as XY))} fill={tailBar ? mixHex("#4D8ED9", "#DCE8F6", lamp) : "#4D8ED9"} stroke="#011A38" strokeWidth={1} />
      {/* the near wheels */}
      <Wheel cx={wf.x} cy={wf.y} r={s.wr} spin={spin} aero={aero} />
      <Wheel cx={wr.x} cy={wr.y} r={s.wr} spin={spin} aero={aero} />
    </g>
  );
};

// ── the three profiles (u 0 rear bumper … 1 nose; h 0 floor … 1 roof) ──
const P_MY: Profile = {
  upper: [[0.005, 0.2], [0.0, 0.42], [0.012, 0.56], [0.03, 0.64], [0.065, 0.71], [0.13, 0.8], [0.22, 0.9], [0.32, 0.97], [0.45, 1.0], [0.57, 0.985], [0.63, 0.95], [0.75, 0.68], [0.87, 0.59], [0.95, 0.52], [0.99, 0.43], [1.0, 0.33], [0.985, 0.2], [0.955, 0.14]],
  dlo: [[0.125, 0.68], [0.2, 0.81], [0.31, 0.91], [0.45, 0.94], [0.57, 0.925], [0.63, 0.88], [0.72, 0.69], [0.45, 0.675]],
  sill: 0.17,
  seams: [[0.705, 0.66, 0.69, 0.2], [0.5, 0.92, 0.5, 0.18], [0.3, 0.9, 0.31, 0.38], [0.31, 0.38, 0.27, 0.2]],
  handles: [[0.585, 0.6], [0.37, 0.6]],
  mirror: [0.705, 0.74], belt: [[0.04, 0.645], [0.3, 0.66], [0.6, 0.665], [0.88, 0.6]],
  head: [[0.95, 0.5], [0.99, 0.47], [0.975, 0.445], [0.93, 0.47]], tail: [[0.02, 0.6], [0.07, 0.655], [0.08, 0.62], [0.025, 0.565]],
};
const P_M3: Profile = {
  upper: [[0.004, 0.19], [0.0, 0.42], [0.015, 0.62], [0.04, 0.685], [0.13, 0.705], [0.2, 0.73], [0.3, 0.89], [0.42, 0.985], [0.5, 1.0], [0.58, 0.985], [0.63, 0.95], [0.76, 0.71], [0.88, 0.62], [0.95, 0.55], [0.99, 0.45], [1.0, 0.35], [0.985, 0.21], [0.955, 0.14]],
  dlo: [[0.225, 0.72], [0.31, 0.86], [0.42, 0.94], [0.52, 0.95], [0.6, 0.93], [0.66, 0.87], [0.735, 0.71], [0.47, 0.705]],
  sill: 0.17,
  seams: [[0.715, 0.69, 0.7, 0.2], [0.5, 0.94, 0.5, 0.18], [0.33, 0.85, 0.335, 0.38], [0.335, 0.38, 0.29, 0.2]],
  handles: [[0.6, 0.64], [0.39, 0.64]],
  mirror: [0.72, 0.76], belt: [[0.05, 0.66], [0.3, 0.68], [0.6, 0.69], [0.9, 0.61]],
  head: [[0.95, 0.52], [0.99, 0.48], [0.975, 0.455], [0.93, 0.48]], tail: [[0.003, 0.6], [0.055, 0.635], [0.065, 0.6], [0.005, 0.57]],
};


/** a soft contact shadow on the floor: the footprint, darkest in a thin line at its base, leaning right (away from the key) */
const Shadow: React.FC<{ x0: number; x1: number; a: number; g?: number }> = ({ x0, x1, a, g = G }) => (
  <g data-probe-skip>
    <ellipse cx={(x0 + x1) / 2 + 18} cy={g + 1} rx={(x1 - x0) / 2 + 34} ry={13} fill="url(#fuShadow)" opacity={a} />
    <rect x={x0 + 8} y={g - 1.5} width={x1 - x0 - 16} height={3.5} rx={1.75} fill="#000814" opacity={0.5 * a} />
  </g>
);

// ══════════════════════════════════════════════════════════════════════════════════════════════
// ★ A SMALL MESH KIT (Builder D, 2026-10-29): real-depth parts under ANY turn — a part is local corners carried through a matrix chain
// (translate · rotate …), each polygon lit by its own normal (p3 `lightOf`), culled exactly (p3 `seen`), outlined in its own colour, with
// NO per-facet sheen (chrome 0, fall 0: the sheen is never a grid). Exported: committee.tsx and unsigned.tsx build with it too.
// Object space as p3's: x right, y DOWN, z toward the viewer.
// ══════════════════════════════════════════════════════════════════════════════════════════════
export type Mx = { m: number[]; t: V };
const I3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
const mm = (A: number[], B: number[]) => [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]));
const mv = (A: number[], [x, y, z]: V): V => [A[0] * x + A[1] * y + A[2] * z, A[3] * x + A[4] * y + A[5] * z, A[6] * x + A[7] * y + A[8] * z];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const nrm = (v: V): V => { const l = Math.hypot(...v); return l > 1e-12 ? [v[0] / l, v[1] / l, v[2] / l] : [0, 0, 0]; };
const rad = (d: number) => (d * Math.PI) / 180;
export const MI: Mx = { m: I3, t: [0, 0, 0] };
export const tr = (x: number, y: number, z: number): Mx => ({ m: I3, t: [x, y, z] });
/** turns (degrees): rx tips +y toward +z, ry turns +z toward +x… (CSS-free, right-handed in p3's y-down space) */
export const rx = (d: number): Mx => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return { m: [1, 0, 0, 0, c, -s, 0, s, c], t: [0, 0, 0] }; };
export const ry = (d: number): Mx => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return { m: [c, 0, s, 0, 1, 0, -s, 0, c], t: [0, 0, 0] }; };
export const rz = (d: number): Mx => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return { m: [c, -s, 0, s, c, 0, 0, 0, 1], t: [0, 0, 0] }; };
/** A ∘ B ∘ … : the last is applied first (a chain reads parent → child) */
export const cat = (...ms: Mx[]): Mx => ms.reduce((A, B) => ({ m: mm(A.m, B.m), t: add(mv(A.m, B.t), A.t) }));
export const xp = (M: Mx, v: V): V => add(mv(M.m, v), M.t);
const newell = (c: V[]): V => {
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < c.length; i++) {
    const a = c[i], b = c[(i + 1) % c.length];
    x += (a[1] - b[1]) * (a[2] + b[2]); y += (a[2] - b[2]) * (a[0] + b[0]); z += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return nrm([x, y, z]);
};
const dedupe = (c: V[]) => c.filter((p, i) => { const q = c[(i + c.length - 1) % c.length]; return Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]) > 1e-6; });
export type Mat = (n: V) => string;
/** ONE polygon of a part: local corners in order; its normal from its winding, or turned outward from `inside` (a local point within) */
export const pface = (r: Rig, k: string, M: Mx, loc: V[], mat: Mat, o: Partial<Face> = {}, inside?: V): Face | null => {
  let w = dedupe(loc.map((p) => xp(M, p)));
  if (w.length < 3) return null;
  let n = newell(w);
  if (n[0] === 0 && n[1] === 0 && n[2] === 0) return null;
  if (inside) {
    const ci = xp(M, inside), fc = w.reduce((a, q) => add(a, [q[0] / w.length, q[1] / w.length, q[2] / w.length]), [0, 0, 0] as V);
    if (dot(n, sub(fc, ci)) < 0) { w = w.slice().reverse(); n = [-n[0], -n[1], -n[2]]; }
  }
  const v = seen(r, w, n);
  if (!v.ok) return null;
  const col = mat(n);
  return { k, p: v.p, z: w.reduce((s, q) => s + depthOf(r, q), 0) / w.length, fill: col, stroke: col, sw: 0.7, chrome: 0, fall: 0, skip: true, ...o };
};
/** an outline (x, y; any winding) extruded from z0 to z1: its front (z1), back and every side, each lit by its own normal */
export const prism = (r: Rig, k: string, M: Mx, ol: [number, number][], z0: number, z1: number, mat: Mat, o: Partial<Face> = {}, front?: Mat): Face[] => {
  const cx = ol.reduce((s, p) => s + p[0], 0) / ol.length, cy = ol.reduce((s, p) => s + p[1], 0) / ol.length, ins: V = [cx, cy, (z0 + z1) / 2];
  const out: (Face | null)[] = [
    pface(r, `${k}F`, M, ol.map(([x, y]) => [x, y, z1] as V), front ?? mat, o, ins),
    pface(r, `${k}B`, M, ol.map(([x, y]) => [x, y, z0] as V), mat, o, ins),
  ];
  for (let i = 0; i < ol.length; i++) {
    const a = ol[i], b = ol[(i + 1) % ol.length];
    out.push(pface(r, `${k}S${i}`, M, [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]], mat, o, ins));
  }
  return out.filter(Boolean) as Face[];
};
/** a box [x0,x1]×[y0,y1]×[z0,z1] in a part's own frame */
export const mbox = (r: Rig, k: string, M: Mx, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, mat: Mat, o: Partial<Face> = {}) =>
  prism(r, k, M, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], z0, z1, mat, o);
/** a SOLID OF REVOLUTION about the part's own y axis: the profile listed top → bottom (y increasing), going round outward, down and back
 *  in (start and end at R 0 to close it). `mat(n, a, j)` may restyle a facet by its angle a (0 = +x, π/2 = +z) and profile step j. */
export type Ring = { y: number; R: number };
export const lathe = (r: Rig, k: string, M: Mx, prof: Ring[], mat: (n: V, a: number, j: number) => string, N = 32, o: Partial<Face> = {}): Face[] => {
  const out: Face[] = [];
  for (let j = 0; j < prof.length - 1; j++) {
    const A = prof[j], B = prof[j + 1];
    if (A.R < 1e-6 && B.R < 1e-6) continue;
    for (let i = 0; i < N; i++) {
      const t0 = (i / N) * Math.PI * 2, t1 = ((i + 1) / N) * Math.PI * 2, tm = (t0 + t1) / 2;
      const at = (S: Ring, t: number): V => [S.R * Math.cos(t), S.y, S.R * Math.sin(t)];
      const q = pface(r, `${k}${j}_${i}`, M, [at(A, t0), at(B, t0), at(B, t1), at(A, t1)], (n) => mat(n, tm, j), o);
      if (q) out.push(q);
    }
  }
  return out;
};
/** ★ THE BANKERS METALLIC (the satin brushed steel of the house solids, REVISION_BRIEF): a pale lit face (#FFFFFF → #B3CEEF → #6FA3DF)
 *  going deep blue (#174C8E → #02234A) as it turns from the key */
const SAT: [number, string][] = [[0, "#02234A"], [0.3, "#174C8E"], [0.56, "#6FA3DF"], [0.8, "#B3CEEF"], [1, "#FFFFFF"]];
export const satin = (r: Rig, n: V, lift = 0) => {
  const L0 = lightOf(r, n), L = Math.max(0, Math.min(1, L0 + lift * (0.4 + 0.6 * L0)));
  for (let i = 1; i < SAT.length; i++) if (L <= SAT[i][0]) return mix(SAT[i - 1][1], SAT[i][1], (L - SAT[i - 1][0]) / (SAT[i][0] - SAT[i - 1][0]));
  return SAT[SAT.length - 1][1];
};
/** a soft contact shadow on a plane (local y) of a part, its footprint [x0,x1]×[z0,z1] in the part's own frame, so it turns with the part */
export const softShadow = (r: Rig, k: string, M: Mx, x0: number, x1: number, z0: number, z1: number, y: number, strength = 1, lean = 18): Face[] => {
  const out: Face[] = [];
  const RINGS = 12, N = 28;
  for (let i = 0; i < RINGS; i++) {
    const g = i / (RINGS - 1), spread = 2 + g * 30, rr0 = 8 + g * 26;
    const ax0 = x0 - spread + lean * g * 0.5, ax1 = x1 + spread + lean * g, az0 = z0 - spread - lean * g, az1 = z1 + spread * 0.5;
    const cx = (ax0 + ax1) / 2, cz = (az0 + az1) / 2, hx = (ax1 - ax0) / 2, hz = (az1 - az0) / 2, rr = Math.min(rr0, hx, hz);
    const ring: V[] = [];
    for (let j = 0; j < N; j++) {
      const a = (j / N) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      ring.push(xp(M, [cx + Math.sign(c) * (hx - rr) + rr * c, y, cz + Math.sign(s) * (hz - rr) + rr * s]));
    }
    out.push({ k: `${k}sh${i}`, p: ring.map((q) => P(r, q)), z: -1e6 + i, fill: "#000814", op: 0.07 * strength * (1 - 0.4 * g), chrome: 0, fall: 0, skip: true, sw: 0 });
  }
  return out.reverse();
};
/** a part's faces in the order they are listed, each list sorted far → near within itself (parts sort as UNITS — p3 lessons) */
export const units = (...lists: (Face | null | undefined)[][]): Face[] => {
  const out: Face[] = [];
  for (const l of lists) out.push(...(l.filter(Boolean) as Face[]).sort((a, b) => a.z - b.z));
  return out.map((f, i) => ({ ...f, z: i }));
};
/** print laid ON a plane of a part: the local square (o, o + ex, o + ey) ↦ the screen, for an SVG group of w × h units */
export const onPart = (r: Rig, M: Mx, o: V, ex: V, ey: V, w: number, h: number) => affine(P(r, xp(M, o)), P(r, xp(M, ex)), P(r, xp(M, ey)), w, h);
/** an "after" slot drawn in a unit's order (print, a light bar, a door cut) */
const slot = (k: string, el: React.ReactNode): Face => ({ k, p: [], z: 0, fill: "none", skip: true, sw: 0, chrome: 0, fall: 0, after: el });

// ── the right half's objects ──
/** ★ A SHOWROOM TURNTABLE set in the floor: the dark recess round it, the drum (its satin side, an LED band near its foot that lights on
 *  "next", a bevelled lip) and its brushed top, whose etched rings and spokes turn with it (`ang`, degrees) */
const turntable = (r: Rig, k: string, cx: number, R: number, rim: number, ang: number, L: number): Face[] => {
  const M = tr(cx, G, 0);
  const ledLit = "#4FA0FF", top = (n: V) => mix("#4D7FBE", "#EDF3FB", lightOf(r, n));
  // the floor's recess round the disc (a dark gap), the LED ring set in the floor round it (it lights on "next"), the disc and its bevel
  const recess = lathe(r, `${k}rc`, M, [{ y: 0.3, R: R - 2 }, { y: 0.3, R: R + 3.5 }], () => mixHex("#011A38", "#5E82B4", L * 0.6), 64);
  const led = lathe(r, `${k}led`, M, [{ y: 0.25, R: R + 3.5 }, { y: 0.25, R: R + 8 }], () => mixHex(mixHex("#0B2F5E", "#9FB8D8", L), ledLit, 0.15 + 0.85 * rim), 64);
  const drum = lathe(r, `${k}d`, M, [
    { y: -TT_H, R: 0 }, { y: -TT_H, R: R - 5 }, { y: -TT_H + 1.2, R: R - 1 }, { y: -TT_H + 2.4, R: R }, { y: 0, R: R }, { y: 0, R: 0 },
  ], (n, _a, j) => (j === 0 ? top(n) : j <= 2 ? satin(r, n, 0.3) : metal(r, n, 0.15)), 64);
  // the top's print: brushed rings, two etched rings and twelve spokes that turn with it; the LED's glow on the floor round it
  const T = -TT_H - 0.3, print = (
    <g data-probe-skip transform={onPart(r, M, [-R, T, -R], [R, T, -R], [-R, T, R], 2 * R, 2 * R)}>
      <g transform={`translate(${R} ${R}) rotate(${ang.toFixed(3)})`}>
        {Array.from({ length: 9 }, (_, i) => <circle key={i} r={R * (0.14 + i * 0.095)} fill="none" stroke={alpha("#FFFFFF", 0.22)} strokeWidth={R * 0.012} />)}
        <circle r={R * 0.4} fill="none" stroke={alpha("#0B3F82", 0.28)} strokeWidth={R * 0.014} />
        <circle r={R * 0.86} fill="none" stroke={alpha("#0B3F82", 0.3)} strokeWidth={R * 0.016} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} transform={`rotate(${i * 30})`} x1={R * 0.46} x2={R * 0.82} y1={0} y2={0} stroke={alpha("#0B3F82", 0.18)} strokeWidth={R * 0.012} />)}
        <circle r={R * 0.07} fill={alpha("#0B3F82", 0.22)} />
      </g>
    </g>
  );
  const glow = rim > 0.001 ? (
    <g data-probe-skip transform={onPart(r, M, [-R - 30, 0, -R - 30], [R + 30, 0, -R - 30], [-R - 30, 0, R + 30], 2 * R + 60, 2 * R + 60)} opacity={rim}>
      <circle cx={R + 30} cy={R + 30} r={R + 12} fill="none" stroke={alpha(ledLit, 0.28)} strokeWidth={14} />
      <circle cx={R + 30} cy={R + 30} r={R + 6} fill="none" stroke={alpha(ledLit, 0.35)} strokeWidth={5} />
    </g>
  ) : null;
  const drumTop = drum.filter((q) => q.k.startsWith(`${k}d0_`)), drumRest = drum.filter((q) => !q.k.startsWith(`${k}d0_`));
  // (the top is measured by the sweep: the turntable's one probe shape)
  const topOne: Face | null = drumTop.length ? { ...drumTop[0], skip: false } : null;
  return units(recess, led, [slot(`${k}glow`, glow)], drumRest, drumTop.slice(1), [topOne], [slot(`${k}print`, print)]);
};

/** ★ THE CYBERCAB is cybercab3d.tsx (2026-10-29, Timur: "replace it with the car model at 22 seconds … or make a similar detailed model"):
 *  the Roadster's construction — a smooth loft with crease rows, the wraparound canopy, butterfly doors, light bars, real wheels with aero
 *  covers (turning, blurred when fast, clipped to their arches), the underside — in the line-up's blue metal. Its wheel radius drives the
 *  turn of its wheels here. */
const CAB_WR = CB.wheelR;

/** ★ THE ROBOT HAND on its display post: a round foot, a polished post, a ribbed wrist actuator, the wrist's axle, a palm with real thickness
 *  and a pressed pad, four fingers of three phalanges each on axle knuckles, curling a little toward the palm, and a two-joint thumb.
 *  Local origin: the foot's centre on the turntable's top; y up is negative; the palm faces +z. */
const FINGERS: { x: number; w: number; segs: number[]; sp: number }[] = [
  { x: -44, w: 22, segs: [50, 36, 28], sp: -7 }, { x: -15, w: 24, segs: [58, 42, 32], sp: -2 },
  { x: 15, w: 23, segs: [55, 40, 30], sp: 3 }, { x: 43, w: 20, segs: [43, 32, 25], sp: 9 },
];
const robotHand = (r: Rig, k: string, M: Mx): Face[] => {
  const steel = (l: number) => (n: V) => metal(r, n, l), sat = (l: number) => (n: V) => satin(r, n, l);
  const foot = lathe(r, `${k}ft`, M, [{ y: -12, R: 0 }, { y: -12, R: 41 }, { y: -10, R: 45.5 }, { y: -4, R: 48 }, { y: 0, R: 48 }, { y: 0, R: 0 }], (n, _a, j) => (j === 0 ? metal(r, n, 0.2) : metal(r, n, 0.05)), 40);
  const post = lathe(r, `${k}po`, M, [{ y: -150, R: 0 }, { y: -150, R: 11 }, { y: -12, R: 11 }, { y: -12, R: 0 }], (n) => satin(r, n, -0.05), 24);
  const collar = lathe(r, `${k}co`, M, [{ y: -162, R: 0 }, { y: -162, R: 19 }, { y: -148, R: 19 }, { y: -146, R: 15 }, { y: -146, R: 0 }], (n) => metal(r, n, 0.1), 28);
  const act = prism(r, `${k}ac`, M, rrect(-36, -248, 36, -160, 12), -26, 26, steel(0.1));
  const ribs = [-226, -208, -190].flatMap((y, i) => prism(r, `${k}rb${i}`, M, rrect(-37.6, y, 37.6, y + 5, 2.2), -27.6, 27.6, steel(-0.25)));
  const bolts = [[-24, -236], [24, -236], [-24, -172], [24, -172]].flatMap(([x, y], i) => lathe(r, `${k}bt${i}`, cat(M, tr(x, y, 26), rx(-90)), [{ y: -3, R: 0 }, { y: -3, R: 3.6 }, { y: 0, R: 4.2 }, { y: 0, R: 0 }], (n) => satin(r, n, 0.2), 12));
  const wrist = lathe(r, `${k}wr`, cat(M, tr(0, -258, 0), rz(90)), [{ y: -34, R: 0 }, { y: -34, R: 15 }, { y: -31, R: 17 }, { y: 31, R: 17 }, { y: 34, R: 15 }, { y: 34, R: 0 }], (n) => satin(r, n, 0.05), 28);
  const palm = prism(r, `${k}pm`, M, rrect(-60, -390, 60, -266, 20), -17, 17, steel(0.12));
  const pad = prism(r, `${k}pd`, M, rrect(-45, -362, 45, -286, 15), 16, 19.5, steel(-0.2));
  const heel = prism(r, `${k}hl`, M, rrect(-30, -282, 30, -270, 5), 16, 18.5, steel(-0.1));
  // (the palm's front face is the hand's measured shape)
  const pf = palm.find((q) => q.k === `${k}pmF`); if (pf) pf.skip = false;
  const fingers: Face[][] = [];
  FINGERS.forEach((fg, i) => {
    let Mf = cat(M, tr(fg.x, -392, 0), rz(fg.sp), rx(-6));
    const curl = [-6, -12, -13];
    const parts: Face[] = [];
    parts.push(...lathe(r, `${k}k${i}`, cat(Mf, rz(90)), [{ y: -fg.w / 2 - 2.5, R: 0 }, { y: -fg.w / 2 - 2.5, R: fg.w * 0.4 }, { y: fg.w / 2 + 2.5, R: fg.w * 0.4 }, { y: fg.w / 2 + 2.5, R: 0 }], (n) => satin(r, n, 0.1), 18));
    fg.segs.forEach((len, j) => {
      const w = fg.w - j * 2, th = w * 0.44;
      parts.push(...prism(r, `${k}f${i}${j}`, Mf, rrect(-w / 2, -len, w / 2, -3, j === 2 ? w / 2 - 1 : w * 0.3), -th, th, steel(j === 2 ? 0.15 : 0.08)));
      // a joint axle at the next knuckle
      Mf = cat(Mf, tr(0, -len, 0), rx(curl[j]));
      if (j < 2) parts.push(...lathe(r, `${k}j${i}${j}`, cat(Mf, rz(90)), [{ y: -w / 2 - 2, R: 0 }, { y: -w / 2 - 2, R: w * 0.36 }, { y: w / 2 + 2, R: w * 0.36 }, { y: w / 2 + 2, R: 0 }], (n) => satin(r, n, 0.1), 16));
    });
    fingers.push(parts);
  });
  // the thumb: from the palm's lower left, out and forward, two phalanges on their joints
  let Mt = cat(M, tr(-58, -300, 6), rz(-52), rx(-22));
  const thumb: Face[] = [];
  thumb.push(...lathe(r, `${k}tk`, cat(Mt, rz(90)), [{ y: -15, R: 0 }, { y: -15, R: 11 }, { y: 15, R: 11 }, { y: 15, R: 0 }], (n) => satin(r, n, 0.1), 16));
  [46, 34].forEach((len, j) => {
    const w = 25 - j * 3, th = w * 0.45;
    thumb.push(...prism(r, `${k}t${j}`, Mt, rrect(-w / 2, -len, w / 2, -3, j === 1 ? w / 2 - 1 : w * 0.3), -th, th, steel(0.1)));
    Mt = cat(Mt, tr(0, -len, 0), rx(-14), rz(10));
    if (j === 0) thumb.push(...lathe(r, `${k}tj`, cat(Mt, rz(90)), [{ y: -14, R: 0 }, { y: -14, R: 9 }, { y: 14, R: 9 }, { y: 14, R: 0 }], (n) => satin(r, n, 0.1), 16));
  });
  return units(foot, post, collar, act, ribs, bolts, wrist, palm, pad, heel, ...fingers, thumb);
};

/** ★ THE STARSHIP MODEL on its stand: a stainless cylinder lit round its curve (36 facets, one smooth gradient), raised WELD RINGS every
 *  ~34 px, the black HEAT TILES over its shaded (+x) side with a stepped edge, the aft and forward FLAPS standing out in depth, the ogive
 *  nose, the aft skirt, SpaceX's wordmark down its side. Local origin: the stand's foot on the turntable's top; y up is negative. */
const SR = 46, SB = -52, ST = -452, SN = 124;
const starship = (r: Rig, k: string, M: Mx): Face[] => {
  const stand = lathe(r, `${k}sf`, M, [{ y: -10, R: 0 }, { y: -10, R: 56 }, { y: -8, R: 60 }, { y: -3, R: 62 }, { y: 0, R: 62 }, { y: 0, R: 0 }], (n, _a, j) => metal(r, n, j === 0 ? 0.2 : 0.05), 40);
  const post = lathe(r, `${k}sp`, M, [{ y: -46, R: 0 }, { y: -46, R: 16 }, { y: -10, R: 16 }, { y: -10, R: 0 }], (n) => satin(r, n, -0.05), 24);
  const cradle = lathe(r, `${k}sc`, M, [{ y: SB + 2, R: 0 }, { y: SB + 2, R: 38 }, { y: -46, R: 40 }, { y: -45, R: 38 }, { y: -45, R: 0 }], (n) => metal(r, n, 0.12), 32);
  // the body's profile, top → bottom: the nose (an ogive), the barrel with its weld rings, the aft skirt
  const prof: Ring[] = [{ y: ST - SN, R: 0 }];
  for (let i = 1; i <= 12; i++) { const t = 1 - i / 12; prof.push({ y: ST - SN * t, R: SR * Math.pow(1 - Math.pow(t, 1.8), 0.62) }); }
  const welds: number[] = [];
  for (let y = ST + 30; y < SB - 24; y += 34) welds.push(y);
  for (const y of welds) prof.push({ y: y - 1.8, R: SR }, { y: y - 1.8, R: SR + 0.9 }, { y: y + 1.2, R: SR + 0.9 }, { y: y + 1.2, R: SR });
  prof.push({ y: SB - 14, R: SR }, { y: SB - 8, R: SR - 2 }, { y: SB, R: SR - 6 }, { y: SB, R: 0 });
  const tiled = (a: number, j: number) => { const e = 1.22 + (j % 2 ? 0.07 : -0.05); const d = Math.atan2(Math.sin(a), Math.cos(a)); return Math.abs(d) < e; };
  const body = lathe(r, `${k}b`, M, prof, (n, a, j) => {
    const L = lightOf(r, n);
    if (tiled(a, j) && j > 6) return mix("#040B16", "#2A3E5C", L * 0.75 + ((Math.round(a * 7.6) + j) % 2 ? 0.05 : 0));
    // a weld ring's own lip: a little darker band
    return satin(r, n, -0.04);
  }, 40);
  const bf = body.find((q) => q.k.startsWith(`${k}b${prof.length - 6}_9`)); if (bf) bf.skip = false;
  // the four flaps, as plates standing out at the limbs (their windward faces tiled black, their edges steel)
  const flapM = (n: V) => mix("#071223", "#4A6890", lightOf(r, n) * 0.85), flapE = (n: V) => satin(r, n, 0.1);
  // (each flap swung 28° round the barrel toward the viewer, so its face and its thickness both read)
  const flaps = [1, -1].flatMap((s) => [
    ...prism(r, `${k}fa${s}`, cat(M, ry(-28 * s)), ([[SR - 2, SB - 18], [SR + 52, SB - 40], [SR + 52, SB - 140], [SR - 2, SB - 172]] as [number, number][]).map(([x, y]) => [x * s, y] as [number, number]), -4.5, 4.5, flapE, {}, flapM),
    ...prism(r, `${k}ff${s}`, cat(M, ry(-28 * s)), ([[SR - 3, ST + 14], [SR + 30, ST + 2], [SR + 26, ST - 48], [SR - 10, ST - 66]] as [number, number][]).map(([x, y]) => [x * s, y] as [number, number]), -4, 4, flapE, {}, flapM),
  ]);
  // SpaceX's wordmark down the side, reading upward, on the steel just in front of the barrel's face
  const WL = 250, h = WL * (SPXW_VIEW.h / SPXW_VIEW.w), z = SR - 1.2;
  const mark = (
    <g data-probe-skip transform={onPart(r, M, [-h / 2 - 8, SB - 70, z], [-h / 2 - 8, SB - 70 - WL, z], [h / 2 - 8, SB - 70, z], SPXW_VIEW.w, SPXW_VIEW.h)}>
      {SPXW_D.map((d, i) => <path key={i} d={d} fill="#0A2A55" opacity={0.88} />)}
    </g>
  );
  const flapBack = flaps.filter((q) => q.k.includes("fa") || q.k.includes("ff"));
  return units(stand, post, cradle, flapBack.filter((q) => q.z < depthOf(r, xp(M, [0, -250, 0]))), body, [slot(`${k}mk`, mark)], flapBack.filter((q) => q.z >= depthOf(r, xp(M, [0, -250, 0]))));
};

/** a turntable's turn, degrees: still until `t0`, easing up to `rate` °/f over `ramp` frames, then steady */
const turnAfter = (f: number, t0: number, rate: number, ramp = 30) => (f < t0 ? 0 : f < t0 + ramp ? (rate * (f - t0) ** 2) / (2 * ramp) : rate * (f - t0 - ramp / 2));

export const Future: React.FC<C> = (c) => {
  const f = useCurrentFrame();
  const T = futureTimes(c);
  // the white stage's strength: the lead's, or a fallback that floods through the travel and drains with the next place's slide
  const L = clamp01(c.light ?? rInOut(f, D2 + 4, D2 + 34) * (1 - rInOut(f, NEXT_PLACE, NEXT_PLACE + 30)));
  const lamp = rInOut(f, ...T.lamps) * (1 - 0.6 * rInOut(f, ...T.dim));
  const dim = rInOut(f, ...T.dim);
  const rims = T.rims.map((w) => rInOut(f, ...w));
  const shadowA = 1 - 0.45 * L;
  const defs = (
    <defs data-probe-skip>
      <linearGradient id="fuBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9DC0EA" /><stop offset="0.16" stopColor="#4D8ED9" /><stop offset="0.38" stopColor="#1F5596" />
        <stop offset="0.47" stopColor="#3C7CC6" /><stop offset="0.56" stopColor="#174C8E" /><stop offset="0.84" stopColor="#0B3466" /><stop offset="1" stopColor="#021A3A" />
      </linearGradient>
      <linearGradient id="fuSheen" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="0.3" stopColor="#FFFFFF" stopOpacity="0.12" /><stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="0.75" stopColor="#000814" stopOpacity="0.1" /><stop offset="1" stopColor="#000814" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="fuGlass" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#0B2F5E" /><stop offset="1" stopColor="#020E1E" /></linearGradient>
      <linearGradient id="fuGlassSheen" x1="0" y1="0" x2="1" y2="0.6">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="0.42" stopColor="#B3CEEF" stopOpacity="0.3" />
        <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="fuRim" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#E3EDF9" /><stop offset="0.45" stopColor="#6FA3DF" /><stop offset="1" stopColor="#0B3F82" /></radialGradient>
      <radialGradient id="fuShadow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#001C3C" stopOpacity="0.6" /><stop offset="0.6" stopColor="#001C3C" stopOpacity="0.2" /><stop offset="1" stopColor="#001C3C" stopOpacity="0" /></radialGradient>
      <radialGradient id="fuFloor" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#4D8ED9" stopOpacity="0.16" /><stop offset="1" stopColor="#4D8ED9" stopOpacity="0" /></radialGradient>
      <radialGradient id="fuFloorW" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#1F62B3" stopOpacity="0.08" /><stop offset="1" stopColor="#1F62B3" stopOpacity="0" /></radialGradient>
    </defs>
  );

  // ═══ the right half, in real depth: one rig (a slow turn of its own, looking a little down onto the floor) ═══
  const r: Rig = { cx: 540, cy: G, persp: 2600, yaw: swing(f, c.arrive, c.end, 3, -2, 0.4), pitch: -11 };
  const top = G - TT_H;
  // the Cybercab: a drive whose speed falls smoothly to rest (v ∝ 1 − smoothstep): it enters at speed from beyond the frame's left edge,
  // brakes (the body dives a little under the braking, and comes back level as it stops), and stands centred on its turntable
  const cabT = (g: number) => { const t = clamp01((g - T.cab[0]) / (T.cab[1] - T.cab[0])); return 2 * (t - t ** 3 + t ** 4 / 2); };
  const dist = (g: number) => CAB_RUN * cabT(g);
  const tc = clamp01((f - T.cab[0]) / (T.cab[1] - T.cab[0]));
  const cabOn = f >= T.cab[0] - 1;
  const cabOp = clamp01((f - T.cab[0] + 1) / 6);
  const cabTurn = turnAfter(f, T.cab[1] + 4, 0.26);
  const omega = Math.abs(dist(f) - dist(f - 1)) / CAB_WR;
  const blur = clamp01((omega - 0.28) / 0.3);
  const dive = 1.7 * (6 * tc - 6 * tc * tc) / 1.5;
  const cabX0 = TT_X[0] - CAB_RUN + dist(f), onDisc = clamp01((cabX0 - (TT_X[0] - TT_R[0] - 100)) / 200), cabY = G - TT_H * onDisc * onDisc * (3 - 2 * onDisc);
  const Mcab = cat(tr(cabX0, cabY, 0), ry(-cabTurn));
  // the hand and the ship: LOWERED onto the centre of their turntables, on the axis the whole way (fading in over their first 10 frames)
  const he = rInOut(f, ...T.hand), hOp = clamp01((f - T.hand[0]) / 10), handTurn = turnAfter(f, T.hand[1] + 2, 0.22);
  const se = rInOut(f, ...T.ship), sOp = clamp01((f - T.ship[0]) / 10);
  const Mhand = cat(tr(TT_X[1], top - 110 * (1 - he), 0), ry(22 - handTurn));
  const Mship = cat(tr(TT_X[2], top - 150 * (1 - se), 0), ry(-6));
  const tables = TT_X.map((x, i) => turntable(r, `tt${i}`, x, TT_R[i], rims[i], i === 0 ? cabTurn : i === 1 ? handTurn : 0, L));
  // each object's contact shadow on its turntable's top, deepening as it lands
  const shCab = softShadow(r, "cabsh", cat(tr(cabX0, cabY, 0), ry(-cabTurn)), -196, 196, -84, 84, -0.4, 1.4 * shadowA);
  const shHand = softShadow(r, "hdsh", cat(tr(TT_X[1], top, 0), ry(22 - handTurn)), -44, 44, -44, 44, -0.4, 1.2 * shadowA * he * he);
  const shShip = softShadow(r, "spsh", cat(tr(TT_X[2], top, 0)), -58, 58, -58, 58, -0.4, 1.2 * shadowA * se * se);
  const objs: { d: number; el: React.ReactNode }[] = [];
  if (cabOn) objs.push({ d: depthOf(r, xp(Mcab, [0, -50, 0])), el: <g key="cab" opacity={cabOp < 1 ? cabOp : undefined}><Faces list={shCab} /><Faces list={cybercabFaces(r, { x: cabX0, y: cabY, z: 0, yaw: -cabTurn, spin: dist(f) / CAB_WR, spinBlur: blur, dive, sweep: 0.2 + 0.5 * tc }, "cab")} /></g> });
  if (hOp > 0.001) objs.push({ d: depthOf(r, xp(Mhand, [0, -200, 0])), el: <g key="hand" opacity={hOp < 1 ? hOp : undefined}><Faces list={shHand} /><Faces list={robotHand(r, "hd", Mhand)} /></g> });
  if (sOp > 0.001) objs.push({ d: depthOf(r, xp(Mship, [0, -250, 0])), el: <g key="ship" opacity={sOp < 1 ? sOp : undefined}><Faces list={shShip} /><Faces list={starship(r, "sp", Mship)} /></g> });
  objs.sort((a, b) => a.d - b.d);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* ═══ LEFT: the cars Tesla sells today ═══ */}
      <Turn at={c.arrive} end={c.end} from={-4} to={3} amp={0.6}>
        <Pool3D x={540} y={G} w={1080} on={(0.6 - 0.42 * dim) * (1 - L)} />
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <FlatDefs id="fuH" />
          {defs}
          {/* the showroom floor's sheen under the light (it never shows an edge: a soft ellipse fading into the ground) */}
          <ellipse data-probe-skip cx={540} cy={G + 8} rx={620} ry={90} fill="url(#fuFloor)" opacity={(1 - 0.6 * dim) * (1 - L)} />
          <ellipse data-probe-skip cx={540} cy={G + 8} rx={620} ry={90} fill="url(#fuFloorW)" opacity={L} />
          {/* the Model Y a row back, then the Model 3 in front; ★ as the light over them dims, each car's own silhouette is veiled (no box
              round it), right after the car, so the front car's veil never darkens the one behind twice */}
          {([[MY, P_MY, 0.3], [M3, P_M3, 1.1]] as [CarSpec, Profile, number][]).map(([s, pr, sp], i) => (
            <g key={i}>
              <Shadow x0={s.x0} x1={s.x0 + s.L} a={shadowA} g={s.g} />
              <Car s={s} pr={pr} lamp={lamp} spin={sp} />
              {dim > 0.001 && (
                <g data-probe-skip opacity={0.55 * dim}>
                  <path d={bodyPath(s, pr)} fill="#001C3C" />
                  <circle cx={s.x0 + s.uf * s.L} cy={s.g - s.wr} r={s.wr} fill="#001C3C" />
                  <circle cx={s.x0 + s.ur * s.L} cy={s.g - s.wr} r={s.wr} fill="#001C3C" />
                </g>
              )}
            </g>
          ))}
        </svg>
      </Turn>

      {/* ═══ RIGHT: what comes next (the white stage), in real depth ═══ */}
      <div style={{ position: "absolute", left: TRAVEL, top: 0, width: 1080, height: 1920 }}>
        <Pool3D x={540} y={G} w={1080} on={0.5 * (1 - L)} />
        <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <ellipse data-probe-skip cx={540} cy={G + 8} rx={640} ry={110} fill="url(#fuFloor)" opacity={1 - L} />
          <ellipse data-probe-skip cx={540} cy={G + 8} rx={640} ry={110} fill="url(#fuFloorW)" opacity={L} />
          {tables.map((t, i) => <Faces key={i} list={t} />)}
          {objs.map((o) => o.el)}
        </svg>
      </div>
    </div>
  );
};
