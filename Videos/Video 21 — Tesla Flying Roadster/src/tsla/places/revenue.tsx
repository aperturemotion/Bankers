import React from "react";
import { useCurrentFrame } from "remotion";
import { rInOut, alpha, mixHex, clamp01 } from "../anim";
import { type Rig } from "../rig";
import { Faces, P, seen, shade, onFace, depthOf, metal, metalBox, steelBox, matBox, quad, contactShadow, vcyl, swing, type Face, type V } from "../p3";
import { roadsterFaces, roadsterShadow, type Pose } from "../roadster";
import { REVENUE } from "../data";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// teachA — "Here's the strange part. Even Musk says the Roadster may not move Tesla's revenue much."
// TESLA'S QUARTER OF REVENUE AS MONEY, AND THE ROADSTER TINY BESIDE IT (the brief: "the Roadster on a scale or plinth against Tesla's
// revenue as a large solid, the Roadster tiny beside it (no invented number: the point is Musk's own words)"; STYLE §16 2026-10-22: money
// is shown as money). In REAL DEPTH (p3.tsx), seen from a little above, one rig for both objects:
//   · A LARGE STACK OF BANDED $100 BUNDLES on a steel skid: 3 bundles across, 3 deep, 34 high, each layer a hair off the one under it
//     (a real hand-built stack is never machine-true). Every bundle shows what a real one has (STYLE §16 2026-10-23): the paper's edge with
//     its rounded light-to-shade, the seams between bundles, the strap round its middle with its printed band, and — on the top layer —
//     the top note's face (border, inner frame, the portrait's oval, the seal, the ribbon, "100" in its corners).
//   · The skid: a polished steel deck, a body with an INLAID NAMEPLATE set into its front (dark seat, brushed plate), on four feet. The
//     plate carries the real figure, Q3 2026 total revenue $28.0B (Tesla's 10-Q, data.ts REVENUE.total), and one label, inked on "revenue".
//   · THE ROADSTER, TINY (roadster.tsx at 0.36 scale), parked on a small low TURNTABLE (a display turntable: a turned steel drum, its deck
//     with a ring of bolts that turns with it, an inlaid light ring at its edge), under its own small pool of light.
// Beats: the stack and the turntable are there with the camera; on "strange" the car's pool of light comes up (the camera finds it); on
// "Roadster" the turntable turns the car a quarter toward us, its light ring lights and a glint crosses its canopy; on "revenue" the
// nameplate's print inks in; on "much" nothing moves — the stack never budges. No Roadster revenue figure anywhere (none was published).
// ★ THE WHITE STAGE (2026-10-30, Timur: "more contrast … more light-themed scenes"): `light` (0 navy … 1 white, default 0 = unchanged) blends
// every ink continuously (STYLE §4.3, never a threshold): the dark-blue metal lifts toward a lit mid blue (its darks most, so nothing reads
// as a black hole on white), the paper deepens a touch so its lit tops never go white-on-white, every shadow turns to the navy at the white
// stage's strength, the floor's light pools give way to a soft navy floor tint, and the turntable's light ring lights in the logo blue.
// KIND object.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const KIND = "object";

type C = { arrive: number; strange: number; even: number; roadsterB: number; revenue: number; much: number; end: number; light?: number };
/** its animation windows; `done`: the frame its LAST action ends (the next place waits for it — registry.tsx) */
export const revenueTimes = (c: C) => ({
  /** the stack, the skid, the turntable and the car arrive with the camera */
  base: [c.arrive - 6, c.arrive + 26] as [number, number],
  /** the car's pool of light comes up (the camera finds it) — a soft swell, no hit */
  light: [c.strange - 6, c.strange + 18] as [number, number],
  /** the turntable turns the car 50°, its nose round toward us (a slow motor: a soft whoosh under it), a glint crosses the canopy */
  turn: [c.roadsterB - 6, c.roadsterB + 46] as [number, number],
  /** the turntable's light ring lights (a tick) */
  ring: [c.roadsterB - 4, c.roadsterB + 12] as [number, number],
  /** the nameplate's figure and label ink in ($28.0B | Q3 REVENUE — a figure arriving: ping) */
  plate: [c.revenue - 12, c.revenue + 4] as [number, number],
  done: c.revenue + 4,
});

// ── the scene, in object space (x right, y DOWN, z toward the viewer) ──
const FLOOR = 1330;
/** the bundles: long side along x, short along z, thickness (≈ a $10,000 strap of 100 notes, 6.14 × 2.61 in) */
const BL = 150, BW = 66, BH = 15, NX = 3, NZ = 3, NY = 34;
const SX0 = 190, SX1 = SX0 + NX * BL, SZ0 = -(NZ * BW) / 2, SZ1 = (NZ * BW) / 2;
/** the skid: deck, body (its front set back 6), feet */
const DECK = 14, BODY = 104, TOE = 14, KX0 = SX0 - 14, KX1 = SX1 + 14, KZ0 = SZ0 - 14, KZ1 = SZ1 + 14;
const SB = FLOOR - TOE - BODY - DECK;              // the stack's bottom
const STOP = SB - NY * BH;                          // its top
/** the nameplate on the body's front (face-local px), and the turntable */
const PL = { w: 316, h: 72 }, TT = { x: 822, z: 22, R: 92, H: 14 };
const CAR_SCALE = 0.36;

const rigAt = (c: C, f: number): Rig => ({ cx: 540, cy: 1060, persp: 2400, yaw: swing(f, c.arrive, c.arrive + 260, -14, -8, 0.5), pitch: -20 });

/** ★ the camera's aims (projected through the rig as it stands mid-place, yaw ≈ −11°): `a` the tiny car (camera IN), `b` the stack */
export const REVENUE_AT = (() => {
  const r: Rig = { cx: 540, cy: 1060, persp: 2400, yaw: -11, pitch: -20 };
  const a = P(r, [TT.x, FLOOR - TT.H - 26, TT.z]), b = P(r, [(SX0 + SX1) / 2, (STOP + FLOOR) / 2, 0]);
  const lo = P(r, [SX0, FLOOR, SZ1]), hi = P(r, [TT.x + TT.R, STOP, 0]);
  return { x: Math.round((lo.x + hi.x) / 2), y: Math.round((STOP + FLOOR) / 2 - 20), a: { x: Math.round(a.x), y: Math.round(a.y) }, b: { x: Math.round(b.x), y: Math.round(b.y) } } as const;
})();

/** a layer's own small offset (a stack built by hand), in x and z */
const jit = (i: number): [number, number] => [2.2 * Math.sin(i * 2.71 + 0.4), 1.6 * Math.sin(i * 1.93 + 1.1)];
const PAPER = "#D6E4F4";

// ── the white stage: every ink is a blend on `L` (0 navy … 1 white) ──
const lumOf = (c: string) => { const n = parseInt(c.slice(1, 7), 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
/** the metal on white: each face's colour lifted toward a lit mid blue, its DARKS most (a navy face reads as a hole on the white stage) */
const liftW = (c: string, L: number, k = 0.42) => (L <= 0.001 || !c.startsWith("#") ? c : mixHex(c, "#8DB6E6", k * L * (1 - lumOf(c))));
const liftFaces = (fs: Face[], L: number, k = 0.42): Face[] => (L <= 0.001 ? fs : fs.map((q) => ({ ...q, fill: liftW(q.fill, L, k), ...(q.stroke ? { stroke: liftW(q.stroke, L, k) } : {}), fall: (q.fall ?? 1) * (1 - 0.5 * L) })));
/** a shadow on white: the navy at the white stage's strength (STYLE §4.3: rgba(0,28,60,0.28–0.35)), never a near-black smudge */
const shadowW = (fs: Face[], L: number, k = 0.5): Face[] => (L <= 0.001 ? fs : fs.map((q) => ({ ...q, fill: mixHex("#000814", "#001C3C", L), op: (q.op ?? 1) * (1 - k * L) })));

const Defs: React.FC = () => (
  <defs data-probe-skip>
    {/* a bundle's paper edge: light along its upper lip, dark along its lower one — a rounded stack of notes, not a flat card */}
    <linearGradient id="rvEdge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.32" /><stop offset="0.18" stopColor="#FFFFFF" stopOpacity="0.06" />
      <stop offset="0.7" stopColor="#0A2A55" stopOpacity="0.05" /><stop offset="1" stopColor="#0A2A55" stopOpacity="0.38" />
    </linearGradient>
    <linearGradient id="rvPlate" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#C6DAF1" /><stop offset="0.35" stopColor="#7FA7D6" /><stop offset="0.55" stopColor="#A9C6E8" /><stop offset="1" stopColor="#3F74B6" />
    </linearGradient>
    <radialGradient id="rvPool" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#4D8ED9" stopOpacity="0.5" /><stop offset="0.55" stopColor="#4D8ED9" stopOpacity="0.12" /><stop offset="1" stopColor="#4D8ED9" stopOpacity="0" /></radialGradient>
  </defs>
);

/** the strap's printed band across a face (face-local: its long side along x, from a to b) */
const Strap: React.FC<{ a: number; b: number; h: number }> = ({ a, b, h }) => (
  <g>
    <rect x={a} y={-0.4} width={b - a} height={h + 0.8} fill="#174C8E" />
    <rect x={a + (b - a) * 0.3} y={-0.4} width={(b - a) * 0.4} height={h + 0.8} fill="#0B2F66" />
    <line x1={a + 1.5} y1={0} x2={a + 1.5} y2={h} stroke={alpha("#B3CEEF", 0.6)} strokeWidth={1} />
    <line x1={b - 1.5} y1={0} x2={b - 1.5} y2={h} stroke={alpha("#B3CEEF", 0.6)} strokeWidth={1} />
  </g>
);

/** ★ the stack of bundles: only its OUTER faces are built (the front row's fronts, the seen side column's ends, the top layer), so nothing
 *  inside can ever paint over the outside; each face gets the paper's edge, its seams and, on a long side, the strap */
const stackFaces = (r: Rig, Lw = 0): Face[] => {
  // (on white the paper deepens a touch: its lit tops would otherwise go white on the white stage)
  const paper = mixHex(PAPER, "#C2D5EC", Lw);
  const out: Face[] = [];
  const fr = shade(r, [0, 0, 1], paper, 1.05);
  for (let i = 0; i < NY; i++) {
    const [jx, jz] = jit(i), y1 = SB - i * BH, y0 = y1 - BH;
    const x0 = SX0 + jx, z0 = SZ0 + jz, z1 = SZ1 + jz, x1 = SX1 + jx;
    // the front row's long sides (z = z1), each with its strap
    for (let j = 0; j < NX; j++) {
      const a = x0 + j * BL, b = a + BL;
      const q = seen(r, [[a, y0, z1], [b, y0, z1], [b, y1, z1], [a, y1, z1]], [0, 0, 1]);
      if (!q.ok) continue;
      out.push({ k: `bf${i}_${j}`, p: q.p, z: depthOf(r, [(a + b) / 2, (y0 + y1) / 2, z1]), fill: fr, chrome: 0, fall: 0.6, skip: true,
        after: (
          <g data-probe-skip transform={onFace(r, [a, y0, z1 + 0.2], [b, y0, z1 + 0.2], [a, y1, z1 + 0.2], BL, BH)}>
            <rect x={0} y={0} width={BL} height={BH} fill="url(#rvEdge)" />
            <Strap a={BL * 0.44} b={BL * 0.56} h={BH} />
            <line x1={BL - 0.6} y1={0.5} x2={BL - 0.6} y2={BH - 0.5} stroke={alpha("#0A2A55", 0.55)} strokeWidth={1.2} />
          </g>
        ) });
    }
    // the side column's short ends (x = x1 or x0, whichever the camera sees) — the notes' ends, no strap
    for (const [sx, nx] of [[x1, 1], [x0, -1]] as [number, number][]) {
      for (let k = 0; k < NZ; k++) {
        const za = z0 + k * BW, zb = za + BW;
        const c: V[] = nx > 0 ? [[sx, y0, zb], [sx, y0, za], [sx, y1, za], [sx, y1, zb]] : [[sx, y0, za], [sx, y0, zb], [sx, y1, zb], [sx, y1, za]];
        const q = seen(r, c, [nx, 0, 0]);
        if (!q.ok) continue;
        const o: V = nx > 0 ? [sx + 0.2, y0, zb] : [sx - 0.2, y0, za], ex: V = nx > 0 ? [sx + 0.2, y0, za] : [sx - 0.2, y0, zb], ey: V = nx > 0 ? [sx + 0.2, y1, zb] : [sx - 0.2, y1, za];
        out.push({ k: `bs${i}_${k}_${nx}`, p: q.p, z: depthOf(r, [sx, (y0 + y1) / 2, (za + zb) / 2]), fill: shade(r, [nx, 0, 0], paper, 1.05), chrome: 0, fall: 0.6, skip: true,
          after: (
            <g data-probe-skip transform={onFace(r, o, ex, ey, BW, BH)}>
              <rect x={0} y={0} width={BW} height={BH} fill="url(#rvEdge)" />
              <line x1={BW - 0.6} y1={0.5} x2={BW - 0.6} y2={BH - 0.5} stroke={alpha("#0A2A55", 0.5)} strokeWidth={1.1} />
            </g>
          ) });
      }
    }
  }
  // the top layer: each bundle's top note, face up, with the strap across it
  const i = NY - 1, [jx, jz] = jit(i), yt = STOP;
  const top = shade(r, [0, -1, 0], paper, 1.08);
  for (let j = 0; j < NX; j++) for (let k = 0; k < NZ; k++) {
    const a = SX0 + jx + j * BL, b = a + BL, za = SZ0 + jz + k * BW, zb = za + BW;
    const q = seen(r, [[a, yt, za], [b, yt, za], [b, yt, zb], [a, yt, zb]], [0, -1, 0]);
    if (!q.ok) continue;
    out.push({ k: `bt${j}_${k}`, p: q.p, z: depthOf(r, [(a + b) / 2, yt, (za + zb) / 2]) + 2e3, fill: top, chrome: 0, fall: 0.5, skip: true,
      after: (
        <g data-probe-skip transform={onFace(r, [a, yt - 0.2, za], [b, yt - 0.2, za], [a, yt - 0.2, zb], BL, BW)}>
          {/* the note's printed border and inner frame */}
          <rect x={3} y={3} width={BL - 6} height={BW - 6} rx={2} fill={alpha("#B3CEEF", 0.24)} stroke={alpha("#2D6AB1", 0.6)} strokeWidth={1.5} />
          <rect x={8} y={8} width={BL - 16} height={BW - 16} rx={2} fill="none" stroke={alpha("#2D6AB1", 0.32)} strokeWidth={0.9} />
          {/* the portrait in its oval, left of the strap, as a $100 is printed; the seal and the ribbon to its right */}
          <ellipse cx={BL * 0.27} cy={BW * 0.5} rx={BL * 0.12} ry={BW * 0.3} fill={alpha("#E3ECF7", 0.9)} stroke={alpha("#2D6AB1", 0.6)} strokeWidth={1.2} />
          <g transform={`translate(${BL * 0.27} ${BW * 0.5})`} fill={alpha("#2D6AB1", 0.45)}>
            <ellipse cx={0} cy={-BW * 0.07} rx={BL * 0.04} ry={BW * 0.09} />
            <path d={`M${-BL * 0.085} ${BW * 0.24} Q${-BL * 0.075} ${BW * 0.04} 0 ${BW * 0.04} Q${BL * 0.075} ${BW * 0.04} ${BL * 0.085} ${BW * 0.24} Z`} />
          </g>
          <circle cx={BL * 0.72} cy={BW * 0.42} r={BW * 0.13} fill="none" stroke={alpha("#2D6AB1", 0.5)} strokeWidth={1.2} />
          <line x1={BL * 0.62} y1={4} x2={BL * 0.62} y2={BW - 4} stroke={alpha("#1F62B3", 0.45)} strokeWidth={2.2} />
          <text data-print x={BL - 30} y={BW - 12} fontFamily="Anton" fontSize={13} fill={alpha("#0B3F82", 0.7)}>100</text>
          <text data-print x={12} y={22} fontFamily="Anton" fontSize={13} fill={alpha("#0B3F82", 0.7)}>100</text>
          {/* the strap across the note's middle, its band printed */}
          <Strap a={BL * 0.44} b={BL * 0.56} h={BW} />
          <line x1={BL - 0.6} y1={0.5} x2={BL - 0.6} y2={BW - 0.5} stroke={alpha("#0A2A55", 0.4)} strokeWidth={1} />
          <line x1={0.5} y1={BW - 0.6} x2={BL - 0.5} y2={BW - 0.6} stroke={alpha("#0A2A55", 0.4)} strokeWidth={1} />
        </g>
      ) });
  }
  return out;
};

/** the steel skid under the stack: a polished deck, the body (its front set back) framed by two corner posts and a bottom rail, the
 *  INLAID NAMEPLATE between them, on a dark toe plinth set back in its own shadow */
const skidFaces = (r: Rig, pq: number, Lw = 0): Face[] => {
  const out: Face[] = [];
  const yd = SB, yb = SB + DECK, yf = yb + BODY;
  out.push(...steelBox(r, "kd", KX0, KX1, yd, yb, KZ0, KZ1, 0.15, 0.6).map((q) => ({ ...q, z: q.z + 1e3 })));
  const body = metalBox(r, "kb", KX0 + 6, KX1 - 6, yb, yf, KZ0 + 6, KZ1 - 6, 0.05);
  const fr = body.find((q) => q.k === "kbf");
  if (fr) {
    const W = KX1 - KX0 - 12, H = BODY, z = KZ1 - 6 + 0.3, x0 = KX0 + 6;
    const px = (W - PL.w) / 2, py = (H - 14 - PL.h) / 2;
    const fig = `$${(REVENUE.total / 1000).toFixed(1)}B`;
    fr.after = (
      <g transform={onFace(r, [x0, yb, z], [x0 + W, yb, z], [x0, yf, z], W, H)}>
        {/* the deck's shadow on the body under it */}
        <rect data-probe-skip x={0} y={0} width={W} height={10} fill={alpha("#000814", 0.35)} />
        {/* the plate's dark seat, the brushed plate, its bevel */}
        <rect data-probe-skip x={px - 3} y={py - 3} width={PL.w + 6} height={PL.h + 6} rx={7} fill={alpha("#000814", 0.7)} />
        <rect x={px} y={py} width={PL.w} height={PL.h} rx={5} fill="url(#rvPlate)" />
        <rect data-probe-skip x={px + 1} y={py + 1} width={PL.w - 2} height={PL.h - 2} rx={4} fill="none" stroke={alpha("#FFFFFF", 0.45)} strokeWidth={1} />
        {/* four small countersunk screws holding the plate */}
        {[[px + 9, py + 9], [px + PL.w - 9, py + 9], [px + 9, py + PL.h - 9], [px + PL.w - 9, py + PL.h - 9]].map(([sx, sy], n) => (
          <g key={n} data-probe-skip><circle cx={sx} cy={sy} r={3.4} fill="#E3ECF7" stroke="#2D6AB1" strokeWidth={0.8} /><line x1={sx - 2.2} y1={sy} x2={sx + 2.2} y2={sy} stroke="#2D6AB1" strokeWidth={0.9} /></g>
        ))}
        {/* ★ the print, inked on "revenue": the figure and its one label, side by side on one baseline */}
        <g opacity={pq}>
          <text data-print x={px + 30} y={py + 52} fontFamily="Anton" fontSize={44} letterSpacing={-1} fill="#001C3C">{fig}</text>
          <text data-print x={px + PL.w - 28} y={py + 52} textAnchor="end" fontFamily="Anton" fontSize={20} letterSpacing={3} fill="#0B3F82">Q3 REVENUE</text>
        </g>
      </g>
    );
  }
  out.push(...body);
  // the bottom rail and the two corner posts, standing 4 px proud of the body's front (the rail first: the posts paint over its ends)
  out.push(...steelBox(r, "kr", KX0 + 6, KX1 - 6, yf - 14, yf, KZ1 - 6, KZ1 - 2, 0.1, 0.5).map((q) => ({ ...q, z: q.z + 500 })));
  for (const [a, b] of [[KX0 + 6, KX0 + 30], [KX1 - 30, KX1 - 6]] as [number, number][]) {
    out.push(...steelBox(r, `kp${a}`, a, b, yb, yf, KZ1 - 6, KZ1 - 2, 0.12, 0.6).map((q) => ({ ...q, z: q.z + 600 })));
  }
  // the toe plinth, set back under the body, in its shadow
  out.push(...matBox(r, "kt", KX0 + 18, KX1 - 18, yf, FLOOR, KZ0 + 18, KZ1 - 18, "#0A2A55", { chrome: 0, fall: 0 }, 0.7).map((q) => ({ ...q, z: q.z - 500 })));
  // the stack's own contact shadow on the deck: a thin dark seat round its footprint, leaning away from the key (right and back)
  const sh = quad(r, "kds", [[SX0 - 4, SB - 0.3, SZ0 - 9], [SX1 + 9, SB - 0.3, SZ0 - 9], [SX1 + 9, SB - 0.3, SZ1 + 5], [SX0 - 4, SB - 0.3, SZ1 + 5]], [0, -1, 0], "#000814", { chrome: 0, fall: 0, op: 0.4, skip: true, sw: 0 });
  // (on white: the metal lifted, its darks most; the deck's seat shadow in the white stage's navy)
  const lifted = liftFaces(out, Lw);
  if (sh) lifted.push(...shadowW([{ ...sh, z: sh.z + 1500 }], Lw, 0.3));
  return lifted;
};

/** the display turntable: a turned drum, its deck, the ring of bolts that turns with it, the light ring at its edge */
const turntableFaces = (r: Rig, ang: number, ring: number, Lw = 0): Face[] => {
  const out: Face[] = [];
  const y0 = FLOOR - TT.H;
  out.push(...vcyl(r, "tt", TT.x, TT.z, TT.R, y0, FLOOR, metal(r, [0, -1, 0], 0.2), ["#6FA3DF", "#02234A"], 96));
  const deck = out.find((q) => q.k === "ttc");
  if (deck) {
    const circ = (rad: number, n = 96) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return P(r, [TT.x + rad * Math.cos(a), y0 - 0.3, TT.z + rad * Math.sin(a)]); });
    const pth = (q: { x: number; y: number }[]) => `M${q.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")} Z`;
    const bolts = Array.from({ length: 10 }, (_, i) => { const a = ang + (i / 10) * Math.PI * 2; return P(r, [TT.x + (TT.R - 22) * Math.cos(a), y0 - 0.4, TT.z + (TT.R - 22) * Math.sin(a)]); });
    deck.chrome = 0.6;
    deck.after = (
      <g data-probe-skip>
        {/* the inlaid light ring at the deck's edge: dim, then lit (a blend) */}
        <path d={`${pth(circ(TT.R - 5))} ${pth(circ(TT.R - 10))}`} fillRule="evenodd" fill={mixHex(mixHex("#1C477E", "#1F5596", Lw), mixHex("#DCEBFB", "#4FA0FF", Lw), ring)} />
        <path d={pth(circ(TT.R - 30))} fill="none" stroke={alpha("#011A38", 0.5)} strokeWidth={1.2} />
        {bolts.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={2.6} fill="#B3CEEF" stroke="#0B3F82" strokeWidth={0.7} />)}
      </g>
    );
  }
  return liftFaces(out, Lw);
};

export const Revenue: React.FC<C> = (c) => {
  const f = useCurrentFrame();
  const T = revenueTimes(c);
  const r = rigAt(c, f);
  const lq = rInOut(f, ...T.light);
  const tq = rInOut(f, ...T.turn);
  const rq = rInOut(f, ...T.ring);
  const pq = rInOut(f, ...T.plate);
  // the white stage's strength (0 navy … 1 white): every ink below blends on it
  const Lw = clamp01(c.light ?? 0);
  // the turntable turns the car from a rear three-quarter toward a FRONT three-quarter (nose toward us)
  const yawCar = 20 - 50 * tq, ang = yawCar * (Math.PI / 180);
  const pose: Pose = { x: TT.x, y: FLOOR - TT.H, z: TT.z, yaw: yawCar, scale: CAR_SCALE, sweep: 0.15 + 0.7 * tq };
  const L = (fs: Face[], dz: number) => fs.map((q) => ({ ...q, z: q.z + dz }));
  const list: Face[] = [
    ...shadowW(contactShadow(r, "ksh", KX0, KX1, KZ0, KZ1, FLOOR, 1.3, 30), Lw),
    ...shadowW(contactShadow(r, "tsh", TT.x - TT.R, TT.x + TT.R, TT.z - TT.R, TT.z + TT.R, FLOOR, 0.9, 14, true), Lw, 0.72),
    ...L(skidFaces(r, pq, Lw), -3e5),
    ...stackFaces(r, Lw),
    ...L(turntableFaces(r, ang, rq, Lw), -2e5),
    ...L(shadowW(roadsterShadow(r, pose, FLOOR - TT.H, "rvs"), Lw, 0.6), -1.5e5 + 1e6),
    // (no spotlight-falloff overlay on the car: laid facet by facet at 0.36 scale, its anti-aliased edges drew a grid over the paint)
    ...L(roadsterFaces(r, pose, "rv"), -1e5).map((q) => ({ ...q, fall: 0 })),
  ];
  // the floor's light: a broad pool under the whole construction, and the car's own small pool, which comes up on "strange"
  const gs = P(r, [(SX0 + SX1) / 2, FLOOR, 0]), gt = P(r, [TT.x, FLOOR, TT.z]);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* (on white the light pools give way to a soft navy floor tint, and the car's pool to a faint logo-blue one: no glow on white) */}
      {Lw < 0.999 && <div data-probe-skip style={{ position: "absolute", left: gs.x - 470, top: gs.y - 90, width: 940, height: 180, borderRadius: "50%", opacity: Lw > 0.001 ? 1 - Lw : undefined,
        background: `radial-gradient(ellipse, ${alpha("#2D6AB1", 0.24)} 0%, ${alpha("#2D6AB1", 0.06)} 50%, transparent 72%)` }} />}
      {Lw > 0.001 && <div data-probe-skip style={{ position: "absolute", left: gs.x - 470, top: gs.y - 90, width: 940, height: 180, borderRadius: "50%", opacity: Lw,
        background: `radial-gradient(ellipse, ${alpha("#1F62B3", 0.1)} 0%, ${alpha("#1F62B3", 0.03)} 50%, transparent 72%)` }} />}
      {Lw < 0.999 && <div data-probe-skip style={{ position: "absolute", left: gt.x - 170, top: gt.y - 62, width: 340, height: 124, borderRadius: "50%", opacity: (0.35 + 0.65 * lq) * (1 - Lw),
        background: `radial-gradient(ellipse, ${alpha("#8DB6E6", 0.42)} 0%, ${alpha("#4D8ED9", 0.12)} 52%, transparent 72%)` }} />}
      {Lw > 0.001 && <div data-probe-skip style={{ position: "absolute", left: gt.x - 170, top: gt.y - 62, width: 340, height: 124, borderRadius: "50%", opacity: (0.35 + 0.65 * lq) * Lw,
        background: `radial-gradient(ellipse, ${alpha("#4D8ED9", 0.2)} 0%, ${alpha("#4D8ED9", 0.06)} 52%, transparent 72%)` }} />}
      <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Defs />
        <Faces list={list} />
      </svg>
    </div>
  );
};
