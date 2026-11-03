import React from "react";
import { useCurrentFrame } from "remotion";
import { rInOut, clamp01, alpha, mixHex } from "../anim";
import { Turn } from "../kit";
import { Pool3D } from "../s3";
import { FlatDefs, FSolid, FBox, rrect } from "../flat";
import { SENTENCES } from "../captions";
import { SPXW_D, SPXW_VIEW } from "../spxwordmark";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// teachD / teachD2 — "Investors aren't paying for the cars Tesla sells today. They're paying for what Musk says comes next: robotaxis,
// robots, and maybe SpaceX." ONE WIDE SHOWROOM FLOOR in the house 2-D construction (STYLE §6.1a: side-on cars and a standing model read
// face-on), in two halves the camera travels between (FUTURE.travel, at teachD2 — the film's ONE light frame floods during that travel):
//   · LEFT (teachD, navy) — THE CARS TESLA SELLS TODAY: a Model Y and a Model 3, side-on, parked under the showroom's light (the dark-blue
//     metal: body, glasshouse, door cuts and flush handles, mirror, lamps, wheels on their arches, the far wheels and the body's depth
//     up-right). On "cars" their lamps come on; on "today" the light over them DIMS (they stay, quieter) as the camera's attention leaves.
//   · RIGHT (teachD2, the white stage) — WHAT COMES NEXT: three flush showroom TURNTABLES set in the floor are there with the camera; their
//     rim lights come on along the row on "next"; then, in turn on their words, a CYBERCAB (Tesla's two-seat robotaxi: low, one sweeping
//     roofline, a full-width tail light, aero wheel covers, an EMPTY cabin — a seat, a dash screen and no steering wheel) GLIDES IN on
//     "robotaxis"; a ROBOT HAND (articulated metal fingers on a wrist actuator, on its display post; no figure) RISES out of depth on
//     "robots"; and on "maybe SpaceX" a STARSHIP model on its display stand (the stainless cylinder, the dark heat-shield edges at both
//     limbs, the forward and aft flaps, weld rings, SpaceX's wordmark down its side) rises out of depth. Each has its own shadow.
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
  /** the Cybercab glides in (a whooshsoft peaking mid-glide; a soft click as it stops) */
  cab: [c.robotaxis - 28, c.robotaxis + 8] as [number, number],
  /** the robot hand rises out of depth (a swoosh) */
  hand: [c.robots - 14, c.robots + 12] as [number, number],
  /** the Starship model rises out of depth (a swoosh; a low sub as it settles) */
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
/** the right half's three objects, in that half's own frame */
const CAB = { x0: 64, L: 416, H: 130, wr: 37, uf: 0.8, ur: 0.2, g: G };
const HAND = { x: 600 };
const SHIP = { x: 852 };
const TT = [CAB.x0 + CAB.L / 2, HAND.x, SHIP.x];
const TT_RX = [218, 94, 100];
/** where the Cybercab starts its glide (in from the left, out of frame at the right framing) */
const CAB_RUN = 360;
export const FUTURE = {
  x: 540 + TRAVEL / 2, y: 1060,
  today: { x: 480, y: G - 130 }, next: { x: 540 + TRAVEL, y: 1030 }, travel: TRAVEL,
  cab: { x: TRAVEL + CAB.x0 + CAB.L / 2, y: G - 60 }, hand: { x: TRAVEL + HAND.x, y: G - 330 }, ship: { x: TRAVEL + SHIP.x, y: G - 300 },
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
const P_CAB: Profile = {
  upper: [[0.006, 0.22], [0.0, 0.5], [0.012, 0.66], [0.06, 0.75], [0.15, 0.86], [0.27, 0.955], [0.42, 1.0], [0.56, 0.98], [0.68, 0.88], [0.78, 0.7], [0.88, 0.58], [0.96, 0.49], [1.0, 0.38], [0.99, 0.23], [0.955, 0.15]],
  dlo: [[0.17, 0.7], [0.27, 0.86], [0.41, 0.935], [0.55, 0.92], [0.66, 0.83], [0.745, 0.69], [0.45, 0.67]],
  sill: 0.19,
  seams: [[0.69, 0.68, 0.645, 0.21], [0.27, 0.69, 0.3, 0.22]],
  handles: [],
  mirror: [0.73, 0.73], belt: [[0.03, 0.64], [0.3, 0.665], [0.6, 0.665], [0.86, 0.57]],
  head: [[0.94, 0.5], [0.995, 0.43], [0.985, 0.405], [0.92, 0.46]], tail: [[0.0, 0.66], [0.04, 0.72], [0.05, 0.69], [0.004, 0.62]],
};

/** what is seen through the Cybercab's glass: ONE seat (empty), the dash with its screen — and no steering wheel */
const CabInside: React.FC = () => {
  const X = (u: number) => CAB.x0 + u * CAB.L, Y = (h: number) => CAB.g - h * CAB.H;
  return (
    <g data-probe-skip opacity={0.9}>
      {/* the seat back, leaning back, its headrest */}
      <path d={`M${X(0.42)} ${Y(0.68)} C${X(0.39)} ${Y(0.76)} ${X(0.36)} ${Y(0.82)} ${X(0.355)} ${Y(0.865)} C${X(0.355)} ${Y(0.9)} ${X(0.42)} ${Y(0.905)} ${X(0.425)} ${Y(0.87)} C${X(0.435)} ${Y(0.8)} ${X(0.45)} ${Y(0.74)} ${X(0.48)} ${Y(0.68)} Z`} fill="#1F5596" />
      <path d={`M${X(0.355)} ${Y(0.865)} C${X(0.355)} ${Y(0.9)} ${X(0.42)} ${Y(0.905)} ${X(0.425)} ${Y(0.87)}`} fill="none" stroke={alpha("#B3CEEF", 0.6)} strokeWidth={1.8} />
      <path d={`M${X(0.43)} ${Y(0.7)} L${X(0.53)} ${Y(0.71)}`} stroke="#1F5596" strokeWidth={6} strokeLinecap="round" />
      {/* the dash and its screen (no wheel in front of the seat) */}
      <path d={`M${X(0.6)} ${Y(0.7)} L${X(0.63)} ${Y(0.76)} L${X(0.7)} ${Y(0.74)} L${X(0.72)} ${Y(0.69)} Z`} fill="#174C8E" />
      <rect x={X(0.6)} y={Y(0.79)} width={X(0.65) - X(0.6)} height={5} rx={2} fill="#6FA3DF" transform={`rotate(-12 ${X(0.62)} ${Y(0.78)})`} />
    </g>
  );
};

/** a flush showroom TURNTABLE set in the floor: its brushed disc, a bevelled rim, its rim light, the slow turn of its etched rings */
const Turntable: React.FC<{ cx: number; rx: number; rim: number; turn: number; L: number }> = ({ cx, rx, rim, turn, L }) => {
  const ry = rx * 0.16;
  const ledDark = mixHex("#0B2F5E", "#8DB6E6", L), ledLit = mixHex("#B3CEEF", "#1F62B3", L);
  return (
    <g data-probe-skip>
      <ellipse cx={cx} cy={G} rx={rx + 8} ry={ry + 2.5} fill={mixHex("#011A38", "#6F96C6", L)} />
      <ellipse cx={cx} cy={G} rx={rx} ry={ry} fill="url(#fuDisc)" />
      {L > 0.001 && <ellipse cx={cx} cy={G} rx={rx} ry={ry} fill="url(#fuDiscW)" opacity={L} />}
      {Array.from({ length: 8 }, (_, i) => {
        const a = turn + (i * Math.PI) / 4;
        return <line key={i} x1={cx + rx * 0.5 * Math.cos(a)} y1={G + ry * 0.5 * Math.sin(a)} x2={cx + rx * 0.9 * Math.cos(a)} y2={G + ry * 0.9 * Math.sin(a)} stroke={alpha("#011A38", 0.22)} strokeWidth={1.5} />;
      })}
      <ellipse cx={cx} cy={G} rx={rx * 0.42} ry={ry * 0.42} fill="none" stroke={alpha("#DCE8F6", 0.3)} strokeWidth={1.2} />
      <ellipse cx={cx} cy={G} rx={rx + 4} ry={ry + 1.2} fill="none" stroke={mixHex(ledDark, ledLit, rim)} strokeWidth={2.4} />
      {rim > 0.001 && <ellipse cx={cx} cy={G} rx={rx + 6} ry={ry + 2} fill="none" stroke={alpha(ledLit, 0.3 * rim)} strokeWidth={7} />}
    </g>
  );
};

/** a soft contact shadow on the floor: the footprint, darkest in a thin line at its base, leaning right (away from the key) */
const Shadow: React.FC<{ x0: number; x1: number; a: number; g?: number }> = ({ x0, x1, a, g = G }) => (
  <g data-probe-skip>
    <ellipse cx={(x0 + x1) / 2 + 18} cy={g + 1} rx={(x1 - x0) / 2 + 34} ry={13} fill="url(#fuShadow)" opacity={a} />
    <rect x={x0 + 8} y={g - 1.5} width={x1 - x0 - 16} height={3.5} rx={1.75} fill="#000814" opacity={0.5 * a} />
  </g>
);

/** ★ THE ROBOT HAND, palm to us, fingers up, on its wrist actuator and display post (origin: the post's foot on the floor) */
const seg = (x: number, y: number, ang: number, len: number, w: number): [number, number][] => {
  const a = (ang * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  // a capsule from (x, y) up along `ang` (0 = straight up, + = leaning right)
  return rrect(-w / 2, -len, w / 2, 0, w / 2 - 1).map(([px, py]) => [x + px * c - py * s, y + px * s + py * c] as [number, number]);
};
const tip = (x: number, y: number, ang: number, len: number): XY => { const a = (ang * Math.PI) / 180; return [x + len * Math.sin(a), y - len * Math.cos(a)]; };
const FINGERS: { x: number; w: number; segs: number[]; ang: number }[] = [
  { x: -45, w: 22, segs: [56, 40, 30], ang: -9 }, { x: -15, w: 24, segs: [64, 46, 34], ang: -3 },
  { x: 15, w: 23, segs: [60, 43, 32], ang: 3 }, { x: 43, w: 20, segs: [46, 34, 26], ang: 10 },
];
const RobotHand: React.FC = () => {
  const PY = -300;   // the palm's centre above the floor
  const parts: React.ReactNode[] = [], joints: XY[] = [];
  FINGERS.forEach((fg, i) => {
    let [x, y] = [fg.x, PY - 58], ang = fg.ang;
    fg.segs.forEach((len, j) => {
      const w = fg.w - j * 2;
      joints.push([x, y]);
      parts.push(<FSolid key={`f${i}${j}`} id="fuH" outline={seg(x, y, ang, len, w)} d={7} lit={j === 2} skip />);
      [x, y] = tip(x, y, ang, len - 4);
      ang += 2.5 * (i - 1.5) * 0.4;
    });
  });
  // the thumb, from the palm's lower left, up and out
  let [tx, ty] = [-56, PY + 22], ta = -52;
  [50, 38].forEach((len, j) => {
    joints.push([tx, ty]);
    parts.push(<FSolid key={`t${j}`} id="fuH" outline={seg(tx, ty, ta, len, 25 - j * 3)} d={7} lit={j === 1} skip />);
    [tx, ty] = tip(tx, ty, ta, len - 4); ta += 12;
  });
  return (
    <g>
      {/* the display post and its round foot */}
      <ellipse data-probe-skip cx={0} cy={-6} rx={64} ry={11} fill="#0B3F82" />
      <path data-probe-skip d="M-64 -6 V2 A64 11 0 0 0 64 2 V-6 Z" fill="#021A3A" />
      <ellipse data-probe-skip cx={0} cy={-6} rx={64} ry={11} fill="none" stroke={alpha("#B3CEEF", 0.45)} strokeWidth={1.4} />
      <FBox id="fuH" x0={-15} y0={PY + 150} x1={15} y1={-8} d={9} skipBack />
      {/* the wrist actuator: a ribbed block with its cable channel */}
      <FSolid id="fuH" outline={rrect(-40, PY + 58, 40, PY + 150, 14)} d={11} skip />
      <g data-probe-skip>
        {[PY + 82, PY + 106, PY + 130].map((y) => <line key={y} x1={-32} x2={32} y1={y} y2={y} stroke={alpha("#011A38", 0.45)} strokeWidth={2} />)}
        {[PY + 84, PY + 108, PY + 132].map((y) => <line key={y} x1={-32} x2={32} y1={y} y2={y} stroke={alpha("#B3CEEF", 0.25)} strokeWidth={1} />)}
      </g>
      {/* the palm */}
      <FSolid id="fuH" outline={rrect(-64, PY - 62, 64, PY + 62, 24)} d={13} lit skip />
      <g data-probe-skip>
        {/* the palm's pads: a heel pad and the four knuckle pads, as pressed panels */}
        <path d={`M-40 ${PY + 50} Q-44 ${PY + 8} -20 ${PY - 4} H24 Q44 ${PY + 8} 40 ${PY + 50} Z`} fill={alpha("#011A38", 0.14)} stroke={alpha("#000814", 0.22)} strokeWidth={1.4} />
        {FINGERS.map((fg, i) => <rect key={i} x={fg.x - fg.w / 2 + 1} y={PY - 50} width={fg.w - 2} height={30} rx={9} fill={alpha("#011A38", 0.13)} stroke={alpha("#000814", 0.2)} strokeWidth={1.2} />)}
      </g>
      {parts}
      {/* the joints: an axle cap at each knuckle */}
      {joints.map(([x, y], i) => (
        <g key={i} data-probe-skip>
          <circle cx={x} cy={y} r={6.5} fill="#0B3F82" stroke={alpha("#011A38", 0.6)} strokeWidth={1.1} />
          <circle cx={x - 1.2} cy={y - 1.2} r={2.6} fill={alpha("#DCE8F6", 0.8)} />
        </g>
      ))}
    </g>
  );
};

/** ★ THE STARSHIP MODEL on its display stand (origin: the stand's foot on the floor). Seen from its leeward side: the stainless body, the
 *  black heat-shield tiles showing as dark bands at both limbs, weld rings, the forward and aft flaps, SpaceX's wordmark down its side. */
const ShipModel: React.FC = () => {
  const R = 48, YB = -30, YT = YB - 420, NOSE = 132;
  const nose = `M${-R} ${YT} C${-R} ${YT - 74} ${-R * 0.42} ${YT - NOSE + 8} 0 ${YT - NOSE} C${R * 0.42} ${YT - NOSE + 8} ${R} ${YT - 74} ${R} ${YT} Z`;
  const ws = 300 / SPXW_VIEW.w;
  return (
    <g>
      {/* the display stand: a round foot and the short post the ship stands on */}
      <ellipse data-probe-skip cx={0} cy={-8} rx={92} ry={14} fill="#0B3F82" />
      <path data-probe-skip d="M-92 -8 V2 A92 14 0 0 0 92 2 V-8 Z" fill="#021A3A" />
      <ellipse data-probe-skip cx={0} cy={-8} rx={92} ry={14} fill="none" stroke={alpha("#B3CEEF", 0.45)} strokeWidth={1.4} />
      <FBox id="fuH" x0={-16} y0={YB - 2} x1={16} y1={-12} d={8} skipBack />
      {/* the aft flaps (behind the body's limbs) */}
      <path data-probe-skip d={`M${-R + 2} ${YB - 156} L${-R - 46} ${YB - 118} L${-R - 46} ${YB - 6} L${-R + 2} ${YB - 2} Z`} fill="url(#fuFlap)" stroke={alpha("#011A38", 0.6)} strokeWidth={1.2} />
      <path data-probe-skip d={`M${R - 2} ${YB - 156} L${R + 46} ${YB - 118} L${R + 46} ${YB - 6} L${R - 2} ${YB - 2} Z`} fill="url(#fuFlap)" stroke={alpha("#011A38", 0.6)} strokeWidth={1.2} />
      {/* the forward flaps, under the nose */}
      <path data-probe-skip d={`M${-R + 2} ${YT - 46} L${-R - 30} ${YT - 18} L${-R - 30} ${YT + 44} L${-R + 2} ${YT + 60} Z`} fill="url(#fuFlap)" stroke={alpha("#011A38", 0.6)} strokeWidth={1.2} />
      <path data-probe-skip d={`M${R - 2} ${YT - 46} L${R + 30} ${YT - 18} L${R + 30} ${YT + 44} L${R - 2} ${YT + 60} Z`} fill="url(#fuFlap)" stroke={alpha("#011A38", 0.6)} strokeWidth={1.2} />
      {/* the body and the nose: one turned steel surface (STYLE §16 2026-10-22: smooth, one gradient round the curve) */}
      <rect x={-R} y={YT} width={2 * R} height={YB - YT} fill="url(#fuSteel)" />
      <path d={nose} fill="url(#fuSteel)" />
      {/* the weld rings, every ~36 px, a shade line with a catchlight under it */}
      <g data-probe-skip>
        {Array.from({ length: 11 }, (_, i) => YT + 26 + i * 36).map((y) => (
          <g key={y}>
            <line x1={-R + 5} x2={R - 5} y1={y} y2={y} stroke={alpha("#011A38", 0.22)} strokeWidth={1.4} />
            <line x1={-R + 8} x2={R - 8} y1={y + 1.6} y2={y + 1.6} stroke={alpha("#FFFFFF", 0.22)} strokeWidth={1} />
          </g>
        ))}
        {/* the aft skirt's ring at the foot, and the nose's tip catching the key */}
        <rect x={-R} y={YB - 14} width={2 * R} height={14} fill={alpha("#011A38", 0.25)} />
        <ellipse cx={-6} cy={YT - NOSE + 14} rx={6} ry={10} fill={alpha("#FFFFFF", 0.5)} />
      </g>
      {/* SpaceX's wordmark down the side, reading upward, as the vehicle carries it */}
      <g data-probe-skip transform={`translate(${-12} ${YB - 70}) rotate(-90) scale(${ws})`}>
        {SPXW_D.map((d, i) => <path key={i} d={d} fill="#0A2A55" opacity={0.85} />)}
      </g>
    </g>
  );
};

export const Future: React.FC<C> = (c) => {
  const f = useCurrentFrame();
  const T = futureTimes(c);
  // the white stage's strength: the lead's, or a fallback that floods through the travel and drains with the next place's slide
  const L = clamp01(c.light ?? rInOut(f, D2 + 4, D2 + 34) * (1 - rInOut(f, NEXT_PLACE, NEXT_PLACE + 30)));
  const lamp = rInOut(f, ...T.lamps) * (1 - 0.6 * rInOut(f, ...T.dim));
  const dim = rInOut(f, ...T.dim);
  const rims = T.rims.map((w) => rInOut(f, ...w));
  const turn = (f - c.arrive) * 0.006;
  // ── the arrivals: each by moving, faded over its first 10–12 frames (time, not a slice of the ease) ──
  const ce = rInOut(f, ...T.cab), co = clamp01((f - T.cab[0]) / 12);
  const cabDx = -CAB_RUN * (1 - ce);
  const he = rInOut(f, ...T.hand), ho = clamp01((f - T.hand[0]) / 10);
  const se = rInOut(f, ...T.ship), so = clamp01((f - T.ship[0]) / 10);
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
      <linearGradient id="fuDisc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6FA3DF" /><stop offset="0.5" stopColor="#2D6AB1" /><stop offset="1" stopColor="#0B3F82" /></linearGradient>
      <linearGradient id="fuDiscW" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F5F9FD" /><stop offset="0.5" stopColor="#C9DCF2" /><stop offset="1" stopColor="#8DB6E6" /></linearGradient>
      <radialGradient id="fuShadow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#001C3C" stopOpacity="0.6" /><stop offset="0.6" stopColor="#001C3C" stopOpacity="0.2" /><stop offset="1" stopColor="#001C3C" stopOpacity="0" /></radialGradient>
      <linearGradient id="fuSteel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#061428" /><stop offset="0.07" stopColor="#0B2246" /><stop offset="0.1" stopColor="#3C7CC6" /><stop offset="0.26" stopColor="#DCE8F6" />
        <stop offset="0.36" stopColor="#F5F9FD" /><stop offset="0.5" stopColor="#9DC0EA" /><stop offset="0.72" stopColor="#4D8ED9" /><stop offset="0.89" stopColor="#1F5596" />
        <stop offset="0.92" stopColor="#0A1C38" /><stop offset="1" stopColor="#061428" />
      </linearGradient>
      <linearGradient id="fuFlap" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6FA3DF" /><stop offset="0.5" stopColor="#2D6AB1" /><stop offset="1" stopColor="#0B3466" /></linearGradient>
      <radialGradient id="fuFloor" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#4D8ED9" stopOpacity="0.16" /><stop offset="1" stopColor="#4D8ED9" stopOpacity="0" /></radialGradient>
      <radialGradient id="fuFloorW" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#1F62B3" stopOpacity="0.08" /><stop offset="1" stopColor="#1F62B3" stopOpacity="0" /></radialGradient>
    </defs>
  );
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

      {/* ═══ RIGHT: what comes next (the white stage) ═══ */}
      <div style={{ position: "absolute", left: TRAVEL, top: 0, width: 1080, height: 1920 }}>
        <Turn at={c.arrive} end={c.end} from={4} to={-3} amp={0.6}>
          <Pool3D x={540} y={G} w={1080} on={0.5 * (1 - L)} />
          <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <ellipse data-probe-skip cx={540} cy={G + 8} rx={620} ry={90} fill="url(#fuFloor)" opacity={1 - L} />
            <ellipse data-probe-skip cx={540} cy={G + 8} rx={620} ry={90} fill="url(#fuFloorW)" opacity={L} />
            {TT.map((x, i) => <Turntable key={i} cx={x} rx={TT_RX[i]} rim={rims[i]} turn={turn * (i % 2 ? -1 : 1)} L={L} />)}
            {/* the Cybercab glides in from the left, its wheels turning with the ground it covers, and stops on its turntable */}
            {co > 0.001 && (
              <g opacity={co} transform={`translate(${cabDx.toFixed(2)} 0)`}>
                <Shadow x0={CAB.x0} x1={CAB.x0 + CAB.L} a={shadowA} />
                <Car s={CAB} pr={P_CAB} lamp={1} spin={-cabDx / CAB.wr} aero inside={<CabInside />} tailBar />
              </g>
            )}
            {/* the robot hand rises out of depth onto its turntable */}
            {ho > 0.001 && (
              <g opacity={ho}>
                <g transform={`translate(${HAND.x} ${G})`}><Shadow x0={-70} x1={70} a={shadowA * he} /></g>
                <g transform={`translate(${HAND.x} ${G + 26 * (1 - he)}) scale(${(0.84 + 0.16 * he).toFixed(4)})`}><RobotHand /></g>
              </g>
            )}
            {/* the Starship model rises out of depth on its stand */}
            {so > 0.001 && (
              <g opacity={so}>
                <g transform={`translate(${SHIP.x} ${G})`}><Shadow x0={-96} x1={96} a={shadowA * se} /></g>
                <g transform={`translate(${SHIP.x} ${G + 30 * (1 - se)}) scale(${(0.84 + 0.16 * se).toFixed(4)})`}><ShipModel /></g>
              </g>
            )}
          </svg>
        </Turn>
      </div>
    </div>
  );
};
