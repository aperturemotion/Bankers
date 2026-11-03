import React from "react";
import { type Rig } from "./rig";
import { P, pts, quad, seen, lightOf, mix, depthOf, contactShadow, affine, type Face, type V } from "./p3";
import { MARKS } from "./marks";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// ★ THE ROADSTER — Video 21's ONE named spine, REVISION 1 (Timur, 2026-10-29: "The car should be a lot more detailed and specifically
// designed with 3D details … fixing the wheels, the sides, the bottom of it … The car wheels should actually turn … Instead of trying to
// make it curved everywhere, maybe add more rectangles … have that right metallic banker's texture"; STYLE §16 2026-10-29).
// A real-depth MESH (p3.tsx's projection and light), built to a real car's parts in the Bankers SATIN STEEL (pale lit faces white →
// #B3CEEF → #6FA3DF, deep blue #174C8E → #02234A as a face turns from the key; one panel-wide sheen per panel, never one per facet; lit
// bevel catch-lights on the creases):
//   · THE BODY: one closed loft from the tail to the nose whose cross-section has CRISP CREASE ROWS that run the car's length — the sill /
//     rocker, the door's step-out, a flat door panel, the shoulder line, the tumblehome, the deck edge, the fender crowns, the hood's two
//     creases — so it reads as flat planes meeting on lines ("more rectangles"), not one blob. The greenhouse is part of the same loft
//     (the ring rises into the cabin between the cowl and the rear deck): side glass, A-pillars and roof rails (the frame), the raked
//     windscreen, a dark targa roof, the rear glass. Wheel arches with a flared lip; door cuts and a flush handle; the side intake; the hood
//     and deck-lid shut lines; mirrors on stalks; slim headlamp units with a DRL and two projectors; the front intake with slats and the
//     splitter; the ducktail and the full-width tail light; the black diffuser panel with the four tail nozzles, and diffuser fins.
//   · THE WHEELS: a tyre turned from a real profile (bead, sidewall, shoulder, three tread lanes with blocks and grooves); a ten-spoke
//     turbine rim with DISH (the spokes run from a recessed hub out to the lip), lug nuts and a centre cap; the barrel; a cross-drilled
//     brake disc and a caliper (fixed) behind the spokes; the dark arch liner. They TURN by `spin`, and above ~0.6 rad a frame the spokes
//     cross-fade into a radial motion-blurred disc (`spinBlur`, set by the caller; `spinBlurFor` gives the house value).
//   · THE UNDERSIDE (seen when it flips): floor panels with seams, the battery pack plate with ribs and its bolt row, a motor housing and
//     A-arms at each axle, the diffuser fins, the six sill nozzles — every part lit by its own normal.
// ORDER (painter's): every shell facet sorts by its own depth (the shell is near-convex and culled, so that holds); everything SET ON the
// shell (a lamp, a cut line, a sheen, a nozzle) sorts just in front of the deepest-sorting shell facet it sits on (`hostZ`), so a detail can
// never fall behind the panel it is fixed to (the old tail nozzles did) and is never painted over a part that hides it. Each wheel is ONE
// unit: in front of its arch on the near flank; behind the body on the far flank, but in front of the floor when the floor is seen.
// Local frame (object units ≈ px at scale 1): x along the car (nose +x), y DOWN (the ground under the tyres is y = 0), z across (+z = the
// car's left side, toward the viewer at yaw 0). Overall 430 long, ~206 wide, ~116 high — a Roadster's 4.3 × 2.0 × 1.2 m.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const RD = { len: 430, half: 215, width: 206, height: 116, wheelR: 33, wheelX: [-128, 138] as const, wheelZ: 92 } as const;

/** where the car is and how it is turned. `y` is the ground under its tyres (its origin: the wheels' contact centre). */
export type Pose = {
  x: number; y: number; z: number;
  /** degrees: roll about its own length (banking; 180 = upside down), pitch (nose UP positive), yaw (about the vertical; 0 = nose to +x) */
  roll?: number; pitch?: number; yaw?: number;
  scale?: number;
  /** the wheels' turn, radians (a car rolling d px turns its wheels d / wheelR; positive rolls it forward, nose first) */
  spin?: number;
  /** 0..1: the wheels turn too fast to read — the spokes, nuts and tread blocks cross-fade into a radial motion-blurred disc (never a
   *  strobe). Callers set it from the turn per frame: `spinBlurFor(dSpin)` */
  spinBlur?: number;
  /** the suspension's squat on landing, px the body sinks toward its wheels (0 none) */
  squat?: number;
  /** the BODY's nod on its springs, degrees nose DOWN (braking, a landing's weight); the wheels stay on the ground (0 none) */
  dive?: number;
  /** the thrusters: 0 off … 1 firing (glow and jets), and a breathing phase for the puffs */
  jets?: number; breath?: number;
  /** (kept for the API; since 2026-10-30 the glass's reflection is static and soft — nothing travels across the windows) */
  sweep?: number;
  /** 0..1 opacity of the whole car */
  op?: number;
  /** a tint mixed into the satin steel (rarely needed) */
  paint?: string;
};

/** the house blur for a wheel turning `dSpin` radians in one frame: 0 below 0.35 rad/f, full by 0.75 (the spokes stop reading ~0.6) */
export const spinBlurFor = (dSpin: number) => Math.max(0, Math.min(1, (Math.abs(dSpin) - 0.35) / 0.4));

type M3 = number[];
const rot = (p: Pose): M3 => {
  const r = ((p.roll ?? 0) * Math.PI) / 180, t = (-(p.pitch ?? 0) * Math.PI) / 180, y = ((p.yaw ?? 0) * Math.PI) / 180;
  const cr = Math.cos(r), sr = Math.sin(r), ct = Math.cos(t), st = Math.sin(t), cy = Math.cos(y), sy = Math.sin(y);
  // Rx(roll) then Rz(pitch) then Ry(yaw) — as row-major 3×3
  const Rx = [1, 0, 0, 0, cr, -sr, 0, sr, cr];
  const Rz = [ct, -st, 0, st, ct, 0, 0, 0, 1];
  const Ry = [cy, 0, sy, 0, 1, 0, -sy, 0, cy];
  const mul = (A: M3, B: M3) => [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]));
  return mul(Ry, mul(Rz, Rx));
};
const ap = (m: M3, [x, y, z]: V): V => [m[0] * x + m[1] * y + m[2] * z, m[3] * x + m[4] * y + m[5] * z, m[6] * x + m[7] * y + m[8] * z];
/** a local point of the car → the world (the rig's object space) for a pose */
export const toWorld = (p: Pose, v: V, m = rot(p)): V => {
  const s = p.scale ?? 1, w = ap(m, v);
  return [p.x + w[0] * s, p.y + w[1] * s, p.z + w[2] * s];
};
/** a local direction → the world */
export const dirWorld = (p: Pose, v: V) => ap(rot(p), v);

// ── vectors ──
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scl = (a: V, k: number): V => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const crs = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a: V): V => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const newellRaw = (q: V[]): V | null => {
  let n: V = [0, 0, 0];
  for (let i = 0; i < q.length; i++) {
    const a = q[i], b = q[(i + 1) % q.length];
    n = [n[0] + (a[1] - b[1]) * (a[2] + b[2]), n[1] + (a[2] - b[2]) * (a[0] + b[0]), n[2] + (a[0] - b[0]) * (a[1] + b[1])];
  }
  const l = Math.hypot(...n);
  return l < 1e-7 ? null : [n[0] / l, n[1] / l, n[2] / l];
};
/** Newell's normal of a polygon (robust for non-planar and degenerate-cornered polygons), pointed away from `inside` */
const newell = (q: V[], inside: V): V | null => {
  let n: V = [0, 0, 0];
  for (let i = 0; i < q.length; i++) {
    const a = q[i], b = q[(i + 1) % q.length];
    n = [n[0] + (a[1] - b[1]) * (a[2] + b[2]), n[1] + (a[2] - b[2]) * (a[0] + b[0]), n[2] + (a[0] - b[0]) * (a[1] + b[1])];
  }
  const l = Math.hypot(...n);
  if (l < 1e-7) return null;
  n = [n[0] / l, n[1] / l, n[2] / l];
  const c = q.reduce((s, v) => add(s, scl(v, 1 / q.length)), [0, 0, 0] as V);
  return dot(n, sub(c, inside)) < 0 ? [-n[0], -n[1], -n[2]] : n;
};

// ── the finishes (every one lit by a face's own normal: lightOf) ──
const RAMP: [number, string][] = [[0, "#011A38"], [0.12, "#02234A"], [0.3, "#174C8E"], [0.5, "#6FA3DF"], [0.72, "#B3CEEF"], [0.93, "#FFFFFF"]];
const ramp = (t: number) => {
  const u = Math.max(0, Math.min(1, t));
  for (let i = 0; i < RAMP.length - 1; i++) if (u <= RAMP[i + 1][0]) return mix(RAMP[i][1], RAMP[i + 1][1], (u - RAMP[i][0]) / (RAMP[i + 1][0] - RAMP[i][0]));
  return RAMP[RAMP.length - 1][1];
};

// ══ THE BODY ══════════════════════════════════════════════════════════════════════════════════
// KEY SECTIONS from the tail (x −215) to the nose (+215). W: the half-width of the sill; yb the floor; yl the rocker's top; ys the shoulder
// line; yt the deck edge (the fender crowns at the front); yh the hood / deck centre where there is no cabin; cab: the greenhouse (hw its
// half-width at the beltline, roof its centre height). Heights are negative (up). Every row of the section is interpolated along x by a
// monotone cubic, so the crease rows run the length as clean lines and the planes between them stay flat.
type K = { x: number; W: number; yb?: number; yl?: number; ys: number; yt: number; yh?: number; cab?: { hw: number; roof: number } };
const KEYS: K[] = [
  { x: -215, W: 88, yb: -24, yl: -33, ys: -62, yt: -84, yh: -85 },
  { x: -210, W: 90.5, yb: -23, yl: -32, ys: -63, yt: -88, yh: -89 },
  { x: -198, W: 94, yb: -20, yl: -31, ys: -63, yt: -86.5, yh: -87.5 },
  { x: -175, W: 98, yb: -16, yl: -30, ys: -63, yt: -85, yh: -86 },
  { x: -150, W: 100, yb: -13, ys: -63, yt: -85, yh: -86 },
  { x: -125, W: 101, ys: -63, yt: -85, cab: { hw: 64, roof: -86.5 } },
  { x: -92, W: 100.5, ys: -62.5, yt: -83.5, cab: { hw: 66, roof: -101 } },
  { x: -55, W: 98.5, ys: -61.5, yt: -81, cab: { hw: 68.5, roof: -112.5 } },
  { x: -20, W: 97, ys: -60.5, yt: -79, cab: { hw: 70, roof: -116 } },
  { x: 12, W: 96.5, ys: -59.5, yt: -77, cab: { hw: 70, roof: -112 } },
  { x: 45, W: 96.5, ys: -58.5, yt: -75.5, cab: { hw: 70, roof: -95 } },
  { x: 78, W: 97, ys: -58, yt: -74.5, cab: { hw: 70, roof: -76 } },
  { x: 105, W: 98.5, ys: -57.5, yt: -76, yh: -68 },
  { x: 138, W: 99.5, ys: -57, yt: -77, yh: -65 },
  { x: 165, W: 98, ys: -55, yt: -72, yh: -61 },
  { x: 186, W: 94, yb: -13, yl: -28, ys: -50, yt: -64, yh: -57 },
  { x: 202, W: 86, yb: -14.5, yl: -26.5, ys: -43, yt: -54, yh: -50 },
  { x: 211, W: 76, yb: -15.5, yl: -25, ys: -37, yt: -45.5, yh: -44.5 },
  { x: 215, W: 66, yb: -16, yl: -24, ys: -33, yt: -40, yh: -40 },
];
/** the section's half ring, 16 points (z ≥ 0), from the floor's centre round the +z flank and over the top to the centre line.
 *  Rows: 0 floor centre, 1 floor edge, 2–3 the sill's under-bevel, 4 the rocker's top, 5 the door's STEP-OUT crease, 6 the flat door panel,
 *  7 the SHOULDER, 8 the tumblehome, 9 the DECK EDGE, 10 the ledge / fender crown, 11 the beltline (glass base) / hood edge, 12 the top of the
 *  side glass, 13 the roof rail / the hood's crease, 14 the roof / hood, 15 the centre. */
const HR = 16;
const halfRing = (k: K): [number, number][] => {
  const yb = k.yb ?? -12, yl = k.yl ?? -30, W = k.W, ys = k.ys, yt = k.yt, d0 = yl - 2.5;
  const out: [number, number][] = [
    [0, yb], [W - 9, yb], [W - 2.5, yb - 2], [W, yb - 5], [W + 0.5, yl], [W + 3.5, d0], [W + 4.25, (d0 + ys) / 2], [W + 5, ys],
    [W + 2.5, ys + (yt - ys) * 0.55], [W - 4.5, yt], [W - 12, yt - 1.2],
  ];
  if (k.cab) {
    const { hw, roof } = k.cab, belt = yt - 1.5, H = roof - belt;
    out.push([hw, belt], [hw - 5, belt + H * 0.8], [hw - 11, belt + H * 0.97], [hw * 0.48, belt + H * 0.996], [0, roof]);
  } else {
    const yh = k.yh ?? yt - 1, g = W - 30;
    out.push([g, yh - 0.5], [g * 0.82, yh - 1.2], [g * 0.65, yh - 1.6], [g * 0.33, yh - 2.2], [0, yh - 2.5]);
  }
  return out;
};
/** a monotone cubic (Fritsch–Carlson) through (xs, ys): no overshoot between key sections */
const pchip = (xs: number[], ys: number[]) => {
  const n = xs.length, h: number[] = [], d: number[] = [], m: number[] = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) { h[i] = xs[i + 1] - xs[i]; d[i] = (ys[i + 1] - ys[i]) / h[i]; }
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) m[i] = 0;
    else { const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]); }
  }
  return (x: number) => {
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i++;
    const t = Math.max(0, Math.min(1, (x - xs[i]) / h[i])), t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1];
  };
};
const KX = KEYS.map((k) => k.x), KR = KEYS.map(halfRing);
const ROWF = Array.from({ length: HR }, (_, i) => [pchip(KX, KR.map((q) => q[i][0])), pchip(KX, KR.map((q) => q[i][1]))]);
/** the section's 16 rows at any x (each row's z and y on its own monotone cubic along the car) */
const ctrl = (x: number): [number, number][] => ROWF.map(([fz, fy]) => [fz(x), fy(x)] as [number, number]);
// ★ THE SECTION IS A SMOOTH CURVE THROUGH ITS ROWS (Timur, 2026-10-29, second note: "make the car smoother shaped"): between the rows the
// ring follows a cubic (Hermite, tangents from its neighbours weighted by the spans, so it never overshoots), and it breaks its tangent
// only at the CREASES — the floor's edge, the rocker's top and the door's step-out, the beltline, the glass / frame and frame / roof lines
// — so the panels flow round the shoulder, the fender crowns and the roof, and the detail lines stay crisp.
const CREASE = [false, true, false, false, true, true, false, false, false, false, false, true, true, true, false, false];
/** how many facets each of the 15 bands is cut into at full detail (the curved ones finer) */
const SUBN = [1, 1, 1, 1, 1, 2, 2, 4, 4, 4, 4, 2, 1, 4, 4];
const hermite = (cp: [number, number][], t: number): [number, number] => {
  const i = Math.max(0, Math.min(HR - 2, Math.floor(t))), f = t - i;
  const P0 = cp[i], P1 = cp[i + 1], dl = (a: [number, number], b: [number, number]) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const d = dl(P0, P1);
  const prev: [number, number] = i === 0 ? [-cp[1][0], cp[1][1]] : cp[i - 1];
  const next: [number, number] = i + 1 === HR - 1 ? [-cp[HR - 2][0], cp[HR - 2][1]] : cp[i + 2];
  const chord: [number, number] = [P1[0] - P0[0], P1[1] - P0[1]];
  const d0 = dl(prev, P0), d1 = dl(P1, next);
  const m0: [number, number] = CREASE[i] || d0 + d < 1e-6 ? chord : [(P1[0] - prev[0]) * d / (d0 + d), (P1[1] - prev[1]) * d / (d0 + d)];
  const m1: [number, number] = CREASE[i + 1] || d1 + d < 1e-6 ? chord : [(next[0] - P0[0]) * d / (d + d1), (next[1] - P0[1]) * d / (d + d1)];
  const f2 = f * f, f3 = f2 * f, h00 = 2 * f3 - 3 * f2 + 1, h10 = f3 - 2 * f2 + f, h01 = -2 * f3 + 3 * f2, h11 = f3 - f2;
  return [h00 * P0[0] + h10 * m0[0] + h01 * P1[0] + h11 * m1[0], h00 * P0[1] + h10 * m0[1] + h01 * P1[1] + h11 * m1[1]];
};
/** the stations and the section's samples at one level of detail. `tv` the row parameter of each sample of the half ring (0 … 15),
 *  `band` the row band each half-ring facet lies in, `R[j]` station j's samples (z, y) */
type Geo = { XS: number[]; tv: number[]; band: number[]; R: [number, number][][]; NJ: number; NU: number; NRF: number; u3: number };
/** the stations: every `step` units (half that round the nose and over the ducktail, where the body turns in both directions at once),
 *  plus the feature lines (the ducktail, the glass's ends, the header, the cowl) exactly */
const FEAT = [-215, -210, -125, -92, -58, 6, 14, 78, 211, 215];
const mkGeo = (step: number, sub: (n: number) => number): Geo => {
  const xs: number[] = [...FEAT];
  for (let x = -215; x <= 215; x += x > 158 || x < -188 ? step / 2 : step) if (FEAT.every((q) => Math.abs(q - x) > step / 4)) xs.push(x);
  xs.sort((a, b) => a - b);
  const tv: number[] = [];
  for (let i = 0; i < HR - 1; i++) { const n = Math.max(1, sub(SUBN[i])); for (let k = 0; k < n; k++) tv.push(i + k / n); }
  tv.push(HR - 1);
  const R = xs.map((x) => { const cp = ctrl(x); return tv.map((t) => hermite(cp, t)); });
  const NU = tv.length;
  return { XS: xs, tv, band: tv.slice(0, -1).map((t) => Math.floor(t + 1e-9)), R, NJ: xs.length, NU, NRF: 2 * NU - 2, u3: tv.indexOf(3) };
};
/** three levels of detail (by the car's scale): coarse for a car a few dozen px long, fine for a close-up */
const GEO: Geo[] = [mkGeo(13, () => 1), mkGeo(9, (n) => Math.ceil(n / 2)), mkGeo(5.5, (n) => n)];
const GF = GEO[2];
const stripOfG = (G: Geo, x: number) => {
  const X = G.XS;
  if (x <= X[0]) return 0;
  if (x >= X[G.NJ - 1]) return G.NJ - 2;
  let lo = 0, hi = G.NJ - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (X[mid] <= x) lo = mid; else hi = mid; }
  return lo;
};
/** the fine half ring's samples at any x (linear between the stations — the facets' own surface) */
const ringLin = (x: number): [number, number][] => {
  const G = GF, j = stripOfG(G, x), u = Math.max(0, Math.min(1, (x - G.XS[j]) / (G.XS[j + 1] - G.XS[j])));
  return G.R[j].map((q, i) => [q[0] + (G.R[j + 1][i][0] - q[0]) * u, q[1] + (G.R[j + 1][i][1] - q[1]) * u] as [number, number]);
};
/** the fine sample segment that holds row parameter t */
const sampleOf = (t: number) => {
  const tv = GF.tv, tt = Math.max(0, Math.min(HR - 1, t));
  let u = 0;
  while (u < tv.length - 2 && tt > tv[u + 1]) u++;
  return { u, f: (tt - tv[u]) / Math.max(1e-9, tv[u + 1] - tv[u]) };
};
/** the surface at (x, t): t is the section's row parameter (row 5.5 = half way from row 5 to row 6 along the curve), s the side */
const S = (x: number, t: number, s = 1): V => {
  const R = ringLin(x), { u, f } = sampleOf(t);
  return [x, R[u][1] + (R[u + 1][1] - R[u][1]) * f, (R[u][0] + (R[u + 1][0] - R[u][0]) * f) * s];
};
/** the surface's outward normal at (x, t, s), from the ring's own winding (never from a centre point: the hood's valley and the cabin's
 *  foot are concave, and a centre test flipped their normals — the far fender went missing) */
const SN = (x: number, t: number, s = 1): V => {
  const a = S(x - 0.6, t, s), b = S(x + 0.6, t, s), c = S(x, t - 0.05, s), d = S(x, t + 0.05, s);
  return scl(nrm(crs(sub(b, a), sub(d, c))), -s);
};
/** the flank's row parameter at height y (rows 1–10) */
const tAtY = (x: number, y: number) => {
  const R = ringLin(x), tv = GF.tv;
  for (let u = 0; u < tv.length - 1; u++) {
    if (tv[u] < 1 || tv[u] >= 10) continue;
    const y0 = R[u][1], y1 = R[u + 1][1];
    if (y <= y0 + 1e-6 && y >= y1 - 1e-6) return tv[u] + ((tv[u + 1] - tv[u]) * (y0 - y)) / Math.max(1e-6, y0 - y1);
  }
  return y > ctrl(x)[1][1] ? 1 : 10;
};
/** ★ the flank's surface (local z, +z side) at (x, y): to seat print ON the body (thrusters.tsx's engravings) */
export const flankZ = (x: number, y: number) => S(x, tAtY(x, y))[2];
/** the body's half section at x as (z, y) pairs, floor centre round the +z side to the roof's centre (for a hull check) */
export const bodySection = (x: number) => ringLin(x).map(([z, y]) => ({ z, y }));

/** the nozzles (local position, outward direction) — four in the tail's diffuser panel, three along each rocker (10, as TechCrunch
 *  reports). The rocker ones sit 0.6 proud of the rocker's face. */
export const NOZZLES: { at: V; n: V }[] = [
  ...[-58, -22, 22, 58].map((z) => ({ at: [-215.6, -34, z] as V, n: [-1, 0, 0] as V })),
  ...[-60, -10, 40].flatMap((x) => { const z = flankZ(x, -22) + 0.6; return [{ at: [x, -22, z] as V, n: [0, 0, 1] as V }, { at: [x, -22, -z] as V, n: [0, 0, -1] as V }]; }),
];

// the glass's extent along the car (the facets' strips are classified by their middle x)
const GL = { cowl: 78, header0: 6, header1: 14, rearFoot: -125, cPillar: -92, roof1: -58 } as const;
const ARCH_R = 38.5;

/** the shared static finishes: the panel sheens, the glass's reflection band, the arch's well, the spin blur (one fixed set of <defs>,
 *  never a stop changed per frame) — carried by the car's own first face, so every SVG that draws the car has them */
const CarDefs: React.FC = () => (
  <defs data-probe-skip>
    {/* the satin sheen across a whole panel: a soft lit band toward the key (upper left), a faint darker reflected band past the middle */}
    <linearGradient id="rdSheen" x1="0" y1="0" x2="0.9" y2="1">
      <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.30" /><stop offset="0.3" stopColor="#FFFFFF" stopOpacity="0.10" />
      <stop offset="0.52" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="0.78" stopColor="#001C3C" stopOpacity="0.10" />
      <stop offset="1" stopColor="#001C3C" stopOpacity="0.16" />
    </linearGradient>
    <linearGradient id="rdSheenH" x1="0" y1="0" x2="1" y2="0.35">
      <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.04" /><stop offset="0.34" stopColor="#FFFFFF" stopOpacity="0.26" />
      <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.05" /><stop offset="0.8" stopColor="#001C3C" stopOpacity="0.08" />
      <stop offset="1" stopColor="#001C3C" stopOpacity="0.02" />
    </linearGradient>
    {/* ★ TINTED GLASS (Timur, 2026-10-30: the windows "have this weird shine on them and it looks unrealistic"). The old travelling white
        band (rdBand, 0.55 white) is gone. Real tinted car glass is dark and slightly blue, with ONE soft reflection of the light above it:
        a faint pale-blue wash at the glass's top that dies away before its middle — never a streak, never white */}
    <linearGradient id="rdGlass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#8FB2DE" stopOpacity="0.20" /><stop offset="0.35" stopColor="#8FB2DE" stopOpacity="0.07" />
      <stop offset="0.7" stopColor="#8FB2DE" stopOpacity="0" /><stop offset="1" stopColor="#000814" stopOpacity="0.12" />
    </linearGradient>
    <linearGradient id="rdGlassW" x1="0" y1="0" x2="0.45" y2="1">
      <stop offset="0" stopColor="#8FB2DE" stopOpacity="0.16" /><stop offset="0.45" stopColor="#8FB2DE" stopOpacity="0.05" />
      <stop offset="0.8" stopColor="#8FB2DE" stopOpacity="0" /><stop offset="1" stopColor="#000814" stopOpacity="0.1" />
    </linearGradient>
    <linearGradient id="rdWell" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#010611" /><stop offset="0.7" stopColor="#030E20" /><stop offset="1" stopColor="#06172F" />
    </linearGradient>
    <radialGradient id="rdBlur" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#9DB9DB" /><stop offset="0.22" stopColor="#5F86B6" /><stop offset="0.4" stopColor="#7FA2CC" />
      <stop offset="0.62" stopColor="#A9C2E1" /><stop offset="0.86" stopColor="#7E9FC8" /><stop offset="1" stopColor="#C6D7EC" />
    </radialGradient>
  </defs>
);

/** ★ THE CAR'S FACES (merge them with the scene's own and paint with <Faces>). `key` prefixes every face (two cars in one place). */
export const roadsterFaces = (r: Rig, p: Pose, key = "rd"): Face[] => {
  const m = rot(p), out: Face[] = [];
  const sc = p.scale ?? 1, sq = p.squat ?? 0, OP = p.op ?? 1, EPS = 0.6 * sc;
  const lod = sc >= 0.9 ? 2 : sc >= 0.55 ? 1 : 0;
  const blur = Math.max(0, Math.min(1, p.spinBlur ?? 0)), spin = p.spin ?? 0;
  const L = (wn: V) => lightOf(r, wn);
  const tint = (c: string) => (p.paint ? mix(c, p.paint, 0.3) : c);
  // finishes
  const steel = (wn: V) => tint(ramp(0.18 + 0.74 * L(wn)));
  const trim = (wn: V) => mix("#02112A", "#5F87B9", L(wn) * 0.95);
  const under = (wn: V) => ramp(0.17 + 0.68 * L(wn));
  const underLite = (wn: V) => ramp(0.24 + 0.72 * L(wn));
  // ★ tinted glass: dark, slightly blue, a NARROW tonal range (the old navy → #3F7DC6 range made each facet of a curved pane its own pale
  // stripe — the "weird shine"); the light still turns it a little, so the pane reads as curved glass, never as a flat sticker
  const glass = (wn: V) => mix("#030A18", "#1D3D66", 0.12 + 0.52 * Math.pow(L(wn), 1.4));
  const roofGlass = (wn: V) => mix("#02060F", "#142D50", 0.12 + 0.5 * Math.pow(L(wn), 1.4));
  const rubber = (wn: V) => mix("#02060C", "#33465F", L(wn) * 0.85);
  const rim = (wn: V) => ramp(0.24 + 0.84 * L(wn));
  const blueMetal = (wn: V) => mix("#02234A", "#5C97DA", L(wn));
  const opOf = (o?: number) => (o ?? 1) * OP;

  // (the sprung body rides the squat and the dive: a nose-down nod of a degree or two about the wheelbase's middle, as a shear — the same
  // picture as a rotation at that angle — so the wheels stay where they are on the ground)
  const tanD = Math.tan(((p.dive ?? 0) * Math.PI) / 180);
  const lift = (v: V): V => [v[0], v[1] + sq + (v[0] - 5) * tanD, v[2]];
  const W3 = (v: V) => toWorld(p, v, m);
  /** one face from LOCAL corners and a LOCAL outward normal (culled in perspective); body parts ride the squat */
  const mk = (k: string, pts: V[], n: V, fill: (wn: V) => string, o: Partial<Face> = {}, body = true): Face | null => {
    const wc = pts.map((q) => W3(body ? lift(q) : q)), wn = nrm(ap(m, n));
    return quad(r, key + k, wc, wn, fill(wn), { chrome: 0, fall: 0, skip: true, ...o, op: opOf(o.op) });
  };
  const depthL = (v: V, body = true) => depthOf(r, W3(body ? lift(v) : v));

  // the defs ride on a face that is always present (an empty polygon painted first)
  out.push({ k: `${key}defs`, p: [], z: -1e9, fill: "none", sw: 0, chrome: 0, fall: 0, skip: true, after: <CarDefs /> });

  // ══ THE SHELL ══ (its level of detail by the car's scale: the coarse mesh for a car a few dozen px long)
  const G = GEO[sc >= 0.9 ? 2 : sc >= 0.5 ? 1 : 0];
  const ptJ = (j: number, k: number): V => {
    const kk = ((k % G.NRF) + G.NRF) % G.NRF, u = kk < G.NU ? kk : G.NRF - kk, sd = kk < G.NU ? 1 : -1, q = G.R[j][u];
    return [G.XS[j], q[1], q[0] * sd];
  };
  /** the full-ring facet that is half-ring facet u on side s */
  const segK = (u: number, s: number) => (s > 0 ? u : G.NRF - 1 - u);
  const D: number[][] = [], SEEN: boolean[][] = [];
  const glassOf = (xm: number, i: number): ((wn: V) => string) | null => {
    if (xm > GL.cowl || xm < GL.rearFoot) return null;
    if (i === 11) return xm > GL.cPillar ? glass : null;
    if (i === 13 || i === 14) {
      if (xm > GL.header1) return glass;
      if (xm > GL.header0) return null;
      if (xm > GL.roof1) return roofGlass;
      return glass;
    }
    return null;
  };
  for (let j = 0; j < G.NJ - 1; j++) {
    D.push([]); SEEN.push([]);
    const xm = (G.XS[j] + G.XS[j + 1]) / 2;
    for (let k = 0; k < G.NRF; k++) {
      const q = [ptJ(j, k), ptJ(j + 1, k), ptJ(j + 1, k + 1), ptJ(j, k + 1)].map(lift);
      D[j].push(q.reduce((s, v) => s + depthOf(r, W3(v)), 0) / 4);
      SEEN[j].push(false);
      // (the outward normal from the ring's consistent winding: rings run floor → +z flank → roof → −z flank, so the raw Newell normal
      // of [A_k, B_k, B_k+1, A_k+1] points INWARD everywhere; a centre-point test got the concave hood valley and the cabin's foot wrong)
      const n0 = newellRaw(q);
      if (!n0) continue;
      const n = scl(n0, -1);
      const band = G.band[k < G.NU - 1 ? k : G.NRF - 1 - k];
      const g = glassOf(xm, band);
      const fill = band === 0 ? under : band <= 3 ? trim : g ?? steel;
      const wc = q.map(W3), wn = nrm(ap(m, n));
      // (the rocker's faces — bands 2 and 3 — are the car's measured shapes, both sides, so a roll never swaps them in one frame)
      const f = quad(r, `${key}b${j}_${k}`, wc, wn, fill(wn), { chrome: 0, fall: 0, skip: !(band === 2 || band === 3), sw: 1.3, op: opOf() });
      if (f) { out.push(f); SEEN[j][k] = true; }
    }
  }
  /** the half-ring facets u whose band lies in i0..i1 */
  const usOf = (i0: number, i1: number) => { const o: number[] = []; for (let u = 0; u < G.NU - 1; u++) if (G.band[u] >= i0 && G.band[u] <= i1) o.push(u); return o; };
  /** the deepest-sorting shell facet among strips over [x0, x1] and bands i0..i1 on side s (a detail set on them sorts in front of it) */
  const hostZ = (x0: number, x1: number, i0: number, i1: number, s: number) => {
    let z = -Infinity;
    const us = usOf(i0, i1);
    for (let j = stripOfG(G, Math.min(x0, x1)); j <= stripOfG(G, Math.max(x0, x1)); j++) for (const u of us) z = Math.max(z, D[j][segK(u, s)]);
    return z;
  };
  const floorSeen = (x0: number, x1: number, s: number) => {
    const us = usOf(0, 0);
    for (let j = stripOfG(G, x0); j <= stripOfG(G, x1); j++) for (const u of us) if (SEEN[j][segK(u, s)]) return true;
    return false;
  };
  // the end caps: the tail panel (flat, upright) and the nose's front face
  // (started at the sill's corner: from the floor's centre the first and last edges are collinear, `seen`'s winding test read zero and the
  // whole tail panel was culled — the far wheel showed through the tail)
  const capPts = (j: number): V[] => Array.from({ length: G.NRF }, (_, k) => ptJ(j, k + G.u3));
  // (what is set on a panel sorts in front of the panel's OWN sort depth — the mean of its corners, which the rows' spacing pulls low)
  const capZ = (j: number) => capPts(j).reduce((a, v) => a + depthL(v), 0) / G.NRF;
  const tailZ = capZ(0), noseZ = capZ(G.NJ - 1);
  { const f = mk("tail", capPts(0), [-1, 0, 0], steel); if (f) { f.z = tailZ; out.push(f); } }
  { const f = mk("nose", capPts(G.NJ - 1), [1, 0, 0], steel); if (f) { f.z = noseZ; out.push(f); } }

  // ── tools for what is SET ON the shell ──
  /** a point on the surface lifted `off` along its normal */
  const SP = (x: number, t: number, s: number, off = 0.25): V => add(S(x, t, s), scl(SN(x, t, s), off));
  /** a polygon given in surface parameters (x, t) on side s */
  const onSurf = (k: string, xt: [number, number][], s: number, fill: (wn: V) => string, z: number, o: Partial<Face> = {}, off = 0.25) => {
    const pts = xt.map(([x, t]) => SP(x, t, s, off));
    const c = xt.reduce((a, q) => [a[0] + q[0] / xt.length, a[1] + q[1] / xt.length], [0, 0]);
    const f = mk(k, s > 0 ? pts : pts.slice().reverse(), SN(c[0], c[1], s), fill, o);
    if (f) { f.z = z; out.push(f); }
    return f;
  };
  /** a thin RIBBON along a surface path (a crease's catch-light, a shut line), `w` wide, shifted `shift` across */
  const ribbon = (k: string, path: [number, number][], s: number, w: number, fill: (wn: V) => string, z: number, o: Partial<Face> = {}, shift = 0, off = 0.3) => {
    const P0 = path.map(([x, t]) => S(x, t, s)), NS = path.map(([x, t]) => SN(x, t, s));
    const left: V[] = [], right: V[] = [];
    for (let i = 0; i < P0.length; i++) {
      const d = nrm(sub(P0[Math.min(P0.length - 1, i + 1)], P0[Math.max(0, i - 1)])), side = nrm(crs(NS[i], d));
      const c = add(P0[i], add(scl(NS[i], off), scl(side, shift)));
      left.push(add(c, scl(side, w / 2))); right.push(add(c, scl(side, -w / 2)));
    }
    const mid = path[Math.floor(path.length / 2)];
    const f = mk(k, [...left, ...right.reverse()], SN(mid[0], mid[1], s), fill, { sw: 0, ...o });
    if (f) { f.z = z; out.push(f); }
    return f;
  };
  const along = (x0: number, x1: number, t: number | ((x: number) => number), n: number): [number, number][] =>
    Array.from({ length: n + 1 }, (_, i) => { const x = x0 + ((x1 - x0) * i) / n; return [x, typeof t === "number" ? t : t(x)] as [number, number]; });
  /** a circle in the surface's tangent plane at (x, t) */
  const circ = (x: number, t: number, s: number, rad: number, off: number, N = 14): { pts: V[]; n: V } => {
    const c = S(x, t, s), n = SN(x, t, s), u = nrm(sub(S(x + 0.5, t, s), S(x - 0.5, t, s))), v = nrm(crs(n, u));
    return { pts: Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2; return add(add(c, scl(n, off)), add(scl(u, rad * Math.cos(a)), scl(v, rad * Math.sin(a)))); }), n };
  };
  const catchOp = (x: number, t: number, s: number, k = 1) => (0.3 + 0.62 * L(nrm(ap(m, SN(x, t, s))))) * k;
  const lit = (a: number) => (wn: V) => mix("#B3CEEF", "#FFFFFF", Math.min(1, a + L(wn) * 0.5));
  const ARCHES = RD.wheelX.map((wx) => wx);
  const rowY = (x: number, t: number) => S(x, t, 1)[1];
  /** split [x0, x1] round the wheel arches along row t (a crease line stops at the arch's lip and starts again past it; the row's height is
   *  read at each side of the arch, since the shoulder falls toward the nose) */
  const clearOfArches = (x0: number, x1: number, t: number): [number, number][] => {
    let segs: [number, number][] = [[x0, x1]];
    const hw = (y: number) => { const dy = y + RD.wheelR, R2 = ARCH_R + 4.5; return Math.abs(dy) < R2 ? Math.sqrt(R2 * R2 - dy * dy) : 0; };
    for (const ax of ARCHES) {
      const hl = hw(rowY(ax - 34, t)), hr = hw(rowY(ax + 34, t));
      if (hl <= 0 && hr <= 0) continue;
      segs = segs.flatMap(([a, b]) => (b <= ax - hl || a >= ax + hr ? [[a, b]] : ([[a, Math.min(b, ax - hl)], [Math.max(a, ax + hr), b]] as [number, number][]).filter(([u, v]) => v - u > 3)));
    }
    return segs;
  };

  for (const s of [1, -1] as const) {
    const sk = s > 0 ? "L" : "R";
    // ── the panel SHEENS (one soft satin gradient over each whole panel; never per facet) ──
    const sheen = (k: string, xt: [number, number][], hosts: number, id = "rdSheen", a = 0.9) => {
      const c = xt.reduce((q, v) => [q[0] + v[0] / xt.length, q[1] + v[1] / xt.length], [0, 0]);
      const wn = nrm(ap(m, SN(c[0], c[1], s)));
      onSurf(k, xt, s, () => `url(#${id})`, hosts + EPS, { op: a * (0.45 + 0.55 * L(wn)), sw: 0 }, 0.15);
    };
    const panel = (x0: number, x1: number, t0: number, t1: number, n = 8): [number, number][] => [...along(x0, x1, t1, n), ...along(x1, x0, t0, n)];
    sheen(`shD${sk}`, panel(-88, 97, 5.05, 8.95), hostZ(-88, 97, 4, 8, s));
    sheen(`shQ${sk}`, panel(-212, -170, 5.05, 8.95, 4), hostZ(-212, -170, 4, 8, s));
    sheen(`shF${sk}`, panel(178, 207, 5.05, 8.6, 3), hostZ(178, 207, 4, 8, s));

    // ── the WHEEL ARCHES: a dark well cut in the flank (the liner inside), its flared lip lit along the top ──
    for (const wx of RD.wheelX) {
      const N = lod ? 22 : 14, ring: [number, number][] = [];
      const xy = (a: number, rr: number) => [wx + rr * Math.cos(a), -RD.wheelR + rr * Math.sin(a)] as [number, number];
      for (let i = 0; i <= N; i++) ring.push(xy(Math.PI + (i / N) * Math.PI, ARCH_R));
      const yb = rowY(wx, 1.0);
      const poly: [number, number][] = [...ring, [wx + ARCH_R, yb], [wx - ARCH_R, yb]];
      const toT = (q: [number, number][]) => q.map(([x, y]) => [x, y >= rowY(x, 1.2) ? 1.2 : tAtY(x, y)] as [number, number]);
      const az = hostZ(wx - ARCH_R + 0.5, wx + ARCH_R - 0.5, 0, 9, s);
      onSurf(`ar${wx}${sk}`, toT(poly), s, () => "url(#rdWell)", az + 2 * EPS, { sw: 0.4 }, 0.35);
      // the lip: a flared band round the arch's edge, lit by the flank's light, a catch-light on its crown
      const lipPath = (rr: number) => toT(Array.from({ length: N + 1 }, (_, i) => xy(Math.PI + 0.12 + (i / N) * (Math.PI - 0.24), rr)));
      const outer = lipPath(ARCH_R + 3.2), inner = lipPath(ARCH_R);
      const lp = [...outer.map(([x, t]) => SP(x, t, s, 0.9)), ...inner.reverse().map(([x, t]) => SP(x, t, s, 0.55))];
      const f = mk(`al${wx}${sk}`, s > 0 ? lp : lp.slice().reverse(), SN(wx, tAtY(wx, -RD.wheelR - ARCH_R - 1.5), s), (wn) => ramp(0.28 + 0.8 * L(wn)), { sw: 0.4 });
      if (f) { f.z = az + 3 * EPS; out.push(f); }
      ribbon(`ac${wx}${sk}`, lipPath(ARCH_R + 3.0), s, 0.9, lit(0.4), az + 4 * EPS, { op: catchOp(wx, 8, s, 0.8) }, 0, 1.0);
    }

    // ── CREASE CATCH-LIGHTS: the shoulder, the deck edge, the rocker's top; split round the arches ──
    const crease = (k: string, t: number, x0: number, x1: number, w: number, a: number, iHost: [number, number]) => {
      clearOfArches(x0, x1, t).forEach(([u, v], n) => {
        // (in pieces ~70 long, each culled by its own normal)
        const pieces = Math.max(1, Math.round((v - u) / 70));
        for (let q = 0; q < pieces; q++) {
          const a0 = u + ((v - u) * q) / pieces, a1 = u + ((v - u) * (q + 1)) / pieces;
          const xm = (a0 + a1) / 2;
          ribbon(`${k}${n}_${q}${sk}`, along(a0, a1, t, 8), s, w, lit(0.35), hostZ(a0, a1, iHost[0], iHost[1], s) + 4 * EPS, { op: catchOp(xm, t + 0.3, s, a) });
        }
      });
    };
    crease("cs", 7, -213, 209, 1.1, 0.85, [6, 7]);
    crease("cd", 9, -212, 212, 1.3, 0.95, [8, 9]);
    crease("cr", 4.05, -205, 205, 0.7, 0.45, [3, 4]);
    // the door's step-out: a dark shadow line under it
    clearOfArches(-205, 205, 4.6).forEach(([u, v], n) => ribbon(`cp${n}${sk}`, along(u, v, 4.6, 14), s, 1.1, () => "#031530", hostZ(u, v, 3, 5, s) + 4 * EPS, { op: 0.5 }));

    // ── the DOOR: its two shut lines (a dark gap with a lit lower lip), the flush handle, the side intake behind it ──
    const cut = (k: string, path: [number, number][], z: number) => {
      ribbon(`${k}g`, path, s, 1.1, () => "#020D1F", z, { op: 0.92 });
      ribbon(`${k}l`, path, s, 0.7, lit(0.3), z + 0.1 * EPS, { op: 0.45 }, 1.0);
    };
    const dz = hostZ(-92, 100, 4, 10, s) + 5 * EPS;
    cut(`dcf${sk}`, [[96.5, 4.55], [96, 6], [95.4, 7], [94.6, 8], [93.6, 9.05]], dz);
    cut(`dcr${sk}`, [[-72, 4.55], [-71.5, 6], [-71, 7], [-70.2, 8], [-69.3, 9.05]], dz);
    // the handle: a recess in the tumblehome with the pull bar inside it, lit on its lower edge
    onSurf(`dh${sk}`, [[-66, 7.35], [-46, 7.35], [-46.6, 7.82], [-65.4, 7.82]], s, () => "#041631", dz + EPS, { sw: 0.3 });
    onSurf(`dhb${sk}`, [[-64.5, 7.47], [-47.6, 7.47], [-48, 7.66], [-64.2, 7.66]], s, (wn) => ramp(0.35 + 0.7 * L(wn)), dz + 2 * EPS, { sw: 0 }, 0.45);
    // the side intake: a dark slot with four slats, ahead of the rear arch
    onSurf(`vi${sk}`, [[-76.5, 5.3], [-88, 5.3], [-88, 6.85], [-80, 6.85]], s, () => "#020B1A", dz + EPS, { sw: 0.4 });
    for (let q = 0; q < 4; q++) {
      const t = 5.5 + q * 0.36, xf = -76.9 - (t - 5.3) * 2;
      ribbon(`vs${q}${sk}`, along(-87.2, xf, t, 3), s, 1.0, (wn) => ramp(0.3 + 0.7 * L(wn)), dz + 2 * EPS, {}, 0, 0.4);
    }

    // ── the GREENHOUSE: the frame's catch-lights (A-pillar → roof rail), the glass's reflection band travelling with `sweep` ──
    const gz = hostZ(GL.rearFoot, GL.cowl, 10, 14, s) + 3 * EPS;
    ribbon(`fr${sk}`, along(GL.rearFoot + 4, GL.cowl - 2, 12.02, 18), s, 0.8, lit(0.45), gz, { op: catchOp(-20, 12.4, s, 0.9) });
    ribbon(`fb${sk}`, along(GL.cPillar, GL.cowl - 3, 11.0, 14), s, 0.7, lit(0.3), gz, { op: catchOp(-20, 10.6, s, 0.35) });
    // ★ the side glass's ONE soft reflection (static on the pane: a faint wash of the light above at its top, dying away by its middle;
    // the old travelling white band was the "weird shine", Timur 2026-10-30). `sweep` no longer moves anything on the glass.
    onSurf(`gb${sk}`, [...along(GL.cPillar + 1.5, GL.cowl - 2, 11.94, 10), ...along(GL.cowl - 2, GL.cPillar + 1.5, 11.06, 10)], s,
      () => "url(#rdGlass)", gz + EPS, { sw: 0 }, 0.3);
    // the mirror on its stalk at the A-pillar's foot (housing in satin steel, its glass dark facing back)
    {
      const mzI = 96, mzO = 113, y0 = -88, y1 = -77.5, x0 = 52, x1 = 67;
      // (in front of its own door's flank — never sorted by the glass rows: the far side's upward-facing glass sorted the far mirror over
      // the roof — and never behind its own depth)
      const mz = Math.max(hostZ(-92, 100, 4, 9, s) + 7 * EPS, depthL([59, -82.5, 104.5 * s]));
      const C: V[] = [[x0, y0, mzI], [x1 - 3, y0 + 1.5, mzI], [x0, y1, mzI], [x1 - 3, y1 - 1, mzI], [x0, y0 - 0.5, mzO], [x1, y0 + 2.5, mzO - 1], [x0, y1 + 0.5, mzO], [x1, y1 - 2, mzO - 1]]
        .map(([x, y, z]) => [x, y, z * s] as V);
      const ctr: V = [59, -82.5, 104.5 * s];
      const F: [string, number[]][] = [["t", [0, 1, 5, 4]], ["b", [2, 6, 7, 3]], ["o", [4, 5, 7, 6]], ["k", [0, 4, 6, 2]], ["f", [1, 3, 7, 5]], ["i", [0, 2, 3, 1]]];
      const stalk: V[] = [[58, -78, 91 * s], [63, -78, 91 * s], [63, -80, 97 * s], [58, -80, 97 * s]];
      const sf = mk(`ms${sk}`, stalk, newell(stalk, [60, -70, 80 * s]) ?? [0, -1, 0], steel, { sw: 0.4 });
      if (sf) { sf.z = mz; out.push(sf); }
      F.forEach(([nm, ix], q) => {
        const pts = ix.map((i) => C[i]), n = newell(pts, ctr);
        if (!n) return;
        const f = mk(`m${nm}${sk}`, pts, n, nm === "k" ? (wn) => mix("#03142E", "#5D8CC6", L(wn)) : steel, { sw: 0.5 });
        if (f) { f.z = mz + (q + 1) * 0.05 * EPS; out.push(f); }
      });
    }

    // ── the HEADLAMP: a slim unit on the fender's leading corner — its dark housing, the DRL along its top edge, two projectors ──
    {
      const hz = hostZ(180, 215, 6, 10, s) + 3 * EPS;
      onSurf(`hl${sk}`, [[184.5, 9.15], [209.5, 7.55], [212.5, 8.45], [188, 9.85]], s, () => "#031128", hz, { sw: 0.5 });
      ribbon(`hd${sk}`, [[186.5, 9.55], [194, 9.1], [202, 8.6], [210.5, 8.1]], s, 1.3, () => "#EAF3FF", hz + EPS, {}, 0, 0.45);
      if (lod) for (const [x, t] of [[193, 9.15], [202, 8.5]] as [number, number][]) {
        const c1 = circ(x, t, s, 3.1, 0.5, 14), c2 = circ(x, t, s, 1.7, 0.6, 12);
        const f1 = mk(`hp${x}${sk}`, c1.pts, c1.n, (wn) => mix("#1C4A84", "#BFD6F2", L(wn)), { sw: 0.3 });
        if (f1) { f1.z = hz + EPS; out.push(f1); }
        const f2 = mk(`hq${x}${sk}`, c2.pts, c2.n, () => "#F2F8FF", { sw: 0 });
        if (f2) { f2.z = hz + 2 * EPS; out.push(f2); }
      }
    }
    // the ROCKER nozzles: a collar, a lit bezel, the core (blue as they arm, white-hot as they fire)
    for (const [i, nz] of NOZZLES.entries()) {
      if (nz.n[2] * s <= 0 || nz.n[0] !== 0) continue;
      const x = nz.at[0], t = tAtY(x, -22), z = hostZ(x - 12, x + 12, 1, 5, s) + 6 * EPS;
      nozzle(`nz${i}`, x, t, s, z);
    }
  }

  // ── a nozzle on the surface (rocker) or on the tail panel ──
  function nozzle(k: string, x: number, t: number, s: number, z: number) {
    const jets = p.jets ?? 0;
    const core = mix(mix("#0B3F82", "#4D8ED9", Math.min(1, jets * 1.6)), "#E8F2FF", Math.max(0, jets - 0.5) * 1.2);
    const rings: [number, number, (wn: V) => string][] = [[8.6, 0.5, (wn) => mix("#020B18", "#3D5F88", L(wn) * 0.7)], [7.2, 0.8, (wn) => ramp(0.25 + 0.75 * L(wn))], [5.8, 1.0, () => "#020814"], [4.6, 1.15, () => core]];
    rings.forEach(([rad, off, fill], q) => {
      const c = circ(x, t, s, rad, off, lod ? 18 : 12);
      const f = mk(`${k}${q}`, c.pts, c.n, fill, { sw: 0.3 });
      if (f) { f.z = z + q * 0.1 * EPS; out.push(f); }
    });
  }

  // ══ ACROSS THE TOP: the hood and deck lid (their sheens and shut lines), the cowl, the windscreen's band, the ducktail, the T ══
  {
    /** a polygon across both sides at rows tA..15 between x0 and x1 (a hood, a lid, a band) */
    const across = (x0: number, x1: number, tA: number, nx = 8): V[] => {
      const up: V[] = [], n = 5;
      along(x0, x1, tA, nx).forEach(([x, t]) => up.push(SP(x, t, 1, 0.2)));
      for (let i = 1; i <= n; i++) up.push(SP(x1, tA + ((15 - tA) * i) / n, 1, 0.2));
      for (let i = n - 1; i >= 0; i--) up.push(SP(x1, tA + ((15 - tA) * i) / n, -1, 0.2));
      along(x1, x0, tA, nx).forEach(([x, t]) => up.push(SP(x, t, -1, 0.2)));
      for (let i = 1; i <= n; i++) up.push(SP(x0, tA + ((15 - tA) * i) / n, -1, 0.2));
      for (let i = n - 1; i > 0; i--) up.push(SP(x0, tA + ((15 - tA) * i) / n, 1, 0.2));
      return up;
    };
    const topZ = (x0: number, x1: number, i0: number) => Math.max(hostZ(x0, x1, i0, 14, 1), hostZ(x0, x1, i0, 14, -1));
    const putTop = (k: string, pts: V[], xm: number, tm: number, fill: (wn: V) => string, z: number, o: Partial<Face> = {}) => {
      const f = mk(k, pts, SN(xm, tm, 1), fill, o);
      if (f) { f.z = z; out.push(f); }
      return f;
    };
    const hoodZ = topZ(80, 212, 9), deckZ = topZ(-212, -122, 9), wsZ = topZ(14, 80, 10);
    // the sheens over the hood and the deck lid
    for (const [k, x0, x1, z] of [["shH", 82, 206, hoodZ], ["shK", -206, -128, deckZ]] as [string, number, number, number][]) {
      const wn = nrm(ap(m, SN((x0 + x1) / 2, 14.5, 1)));
      putTop(k, across(x0, x1, 10.6), (x0 + x1) / 2, 14.5, () => "url(#rdSheenH)", z + EPS, { op: 0.95 * (0.4 + 0.6 * L(wn)), sw: 0 });
    }
    // the frunk lid's and the deck lid's shut lines: along each side at the hood's edge and across the front / back
    for (const [k, x0, x1, tE] of [["hk", 84, 205, 10.7], ["kk", -204, -128, 10.7]] as [string, number, number, number][]) {
      const z = (k === "hk" ? hoodZ : deckZ) + 3 * EPS;
      for (const s of [1, -1]) ribbon(`${k}${s > 0 ? "L" : "R"}`, along(x0, x1, tE, 12), s, 1.0, () => "#03142E", z, { op: 0.8 });
      const endX = k === "hk" ? x1 : x0;
      const acrossLine: V[] = [], back: V[] = [];
      for (let i = 0; i <= 10; i++) {
        const t = tE + ((15 - tE) * i) / 10;
        acrossLine.push(SP(endX + 0.55, t, 1, 0.3)); back.push(SP(endX - 0.55, t, 1, 0.3));
      }
      const pts = [...acrossLine, ...acrossLine.slice(0, -1).reverse().map((v) => [v[0], v[1], -v[2]] as V), ...back.slice(0, -1).map((v) => [v[0], v[1], -v[2]] as V), ...back.reverse()];
      putTop(`${k}X`, pts, endX, 14.5, () => "#03142E", z, { op: 0.8, sw: 0 });
    }
    // the hood's two creases and the deck's, lit
    for (const s of [1, -1]) {
      ribbon(`hc${s}`, along(84, 204, 13, 12), s, 0.9, lit(0.4), hoodZ + 4 * EPS, { op: catchOp(140, 13.3, s, 0.8) });
      ribbon(`kc${s}`, along(-204, -128, 13, 8), s, 0.9, lit(0.4), deckZ + 4 * EPS, { op: catchOp(-160, 13.3, s, 0.8) });
    }
    // the cowl: a dark strip across the windscreen's foot
    putTop("cowl", across(GL.cowl - 4.5, GL.cowl + 2.2, 10.3, 2), GL.cowl, 14.5, () => "#041530", wsZ + 2 * EPS, { sw: 0.3 });
    // ★ the windscreen's ONE soft reflection (static: a faint wash toward the header, gone before the cowl — never the old travelling white
    // diagonal band, Timur 2026-10-30) and the header's lit edge
    {
      putTop("wsb", across(GL.header1 + 1, GL.cowl - 3, 13.1, 6), (GL.header1 + GL.cowl) / 2, 14.6, () => "url(#rdGlassW)", wsZ + 2 * EPS, { sw: 0 });
      putTop("hdr", across(GL.header1 - 0.8, GL.header1 + 0.6, 13.0, 2), GL.header1, 14.5, lit(0.4), wsZ + 3 * EPS, { sw: 0, op: 0.5 });
      // the roof's and the rear glass's own soft reflection (the same faint wash)
      const rz = topZ(-125, 6, 12);
      putTop("rfs", across(-122, 4, 13.1), -60, 14.6, () => "url(#rdGlassW)", rz + EPS, { sw: 0, op: 0.8 });
    }
    // the ducktail's lip: a catch-light across the deck's trailing edge
    {
      const lipZ = topZ(-215, -204, 8);
      const pts: V[] = [];
      for (let i = 0; i <= 12; i++) pts.push(SP(-209.6, 8.6 + ((15 - 8.6) * i) / 12, 1, 0.4));
      const back = pts.map((v) => add(v, [1.4, 0, 0]));
      const ring = [...pts, ...pts.slice(0, -1).reverse().map((v) => [v[0], v[1], -v[2]] as V), ...back.slice(0, -1).map((v) => [v[0], v[1], -v[2]] as V), ...back.reverse()];
      putTop("dlip", ring, -209.6, 14.5, lit(0.5), lipZ + 4 * EPS, { sw: 0, op: 0.75 });
    }
    // the Tesla T on the nose (its real mark, engraved: a darker inlay), set on the hood's front just behind the shut line
    if (lod) {
      const xc = 197, w = 11, oR = SP(xc - w / 2, 14.75, 1, 0.3), o: V = [oR[0], oR[1], -oR[2]], ey: V = SP(xc + w / 2, 14.75, -1, 0.3);
      // (the mark's 24 units across the car; its height along it)
      const oW = [o, oR, ey].map((v) => P(r, W3(lift(v))));
      const n = SN(xc, 14.9, 1), wn = nrm(ap(m, n));
      const v = seen(r, [o, oR, [ey[0], ey[1], -ey[2]], ey].map((q) => W3(lift(q as V))), wn);
      if (v.ok) {
        const z = hoodZ + 5 * EPS;
        out.push({ k: `${key}tm`, p: v.p, z, fill: "none", sw: 0, chrome: 0, fall: 0, skip: true,
          after: <g data-probe-skip opacity={OP * 0.9} transform={affine(oW[0], oW[1], oW[2], 24, 24)}><path d={MARKS.tesla} fill={mix("#1A4B86", "#4D7FBF", L(wn))} /></g> });
      }
    }
  }

  // ══ THE TAIL: the full-width light bar, the black diffuser panel with its four nozzles; THE NOSE: the intake and its slats ══
  {
    const capW = (x: number, y: number) => flankZ(x, y);
    const onCap = (k: string, x: number, pts: [number, number][], fill: (wn: V) => string, z: number, o: Partial<Face> = {}) => {
      const loc = pts.map(([zz, y]) => [x, y, zz] as V);
      const f = mk(k, loc, [Math.sign(x), 0, 0], fill, { sw: 0.3, ...o });
      if (f) { f.z = z; out.push(f); }
      return f;
    };
    const tx = -215.4;
    const band = (y0: number, y1: number, inset: number): [number, number][] => {
      const z0 = capW(-215, y0) - inset, z1 = capW(-215, y1) - inset;
      return [[-z0, y0], [z0, y0], [z1, y1], [-z1, y1]];
    };
    onCap("tlh", tx, band(-80.5, -70, 7), () => "#020C1D", tailZ + EPS);
    onCap("tll", tx - 0.2, band(-78, -72.6, 9), () => "#BFD6F2", tailZ + 2 * EPS, { sw: 0 });
    onCap("tlc", tx - 0.3, band(-75.8, -74.6, 11), () => "#FFFFFF", tailZ + 3 * EPS, { sw: 0 });
    // the diffuser panel: the tail's lower band in black satin, framed by a lit edge
    {
      const R = ctrl(-215), y0 = -45, pts: [number, number][] = [];
      const zAt = capW(-215, y0) - 2;
      pts.push([-zAt, y0], [zAt, y0]);
      for (let i = 5; i >= 1; i--) if (R[i][1] > y0) pts.push([R[i][0] - 2, R[i][1] - (i === 1 ? 0.2 : 0)]);
      for (let i = 1; i <= 5; i++) if (R[i][1] > y0) pts.push([-(R[i][0] - 2), R[i][1] - (i === 1 ? 0.2 : 0)]);
      onCap("dfp", tx, pts, (wn) => mix("#020A18", "#25466F", L(wn) * 0.8), tailZ + EPS);
      onCap("dfe", tx - 0.2, [[-zAt, y0 - 0.6], [zAt, y0 - 0.6], [zAt, y0 + 0.5], [-zAt, y0 + 0.5]], lit(0.3), tailZ + 2 * EPS, { sw: 0, op: 0.7 });
    }
    // the four tail nozzles, set into the diffuser panel
    const jets = p.jets ?? 0;
    const core = mix(mix("#0B3F82", "#4D8ED9", Math.min(1, jets * 1.6)), "#E8F2FF", Math.max(0, jets - 0.5) * 1.2);
    NOZZLES.slice(0, 4).forEach((nz, i) => {
      const rings: [number, number, (wn: V) => string][] = [[8.6, 0.5, (wn) => mix("#020B18", "#3D5F88", L(wn) * 0.7)], [7.2, 0.8, (wn) => ramp(0.25 + 0.75 * L(wn))], [5.8, 1.0, () => "#020814"], [4.6, 1.15, () => core]];
      rings.forEach(([rad, off, fill], q) => {
        const pts: [number, number][] = Array.from({ length: lod ? 18 : 12 }, (_, a) => { const g = (a / (lod ? 18 : 12)) * Math.PI * 2; return [nz.at[2] + rad * Math.cos(g), nz.at[1] + rad * Math.sin(g)]; });
        onCap(`tn${i}${q}`, -215 - off, pts, fill, tailZ + (3 + q * 0.2) * EPS, { sw: 0.3 });
      });
    });
    // the NOSE: the front intake (a dark opening with three slats) on the nose's face, and the splitter's blade under it
    const nx = 215.4;
    onCap("ni", nx, [[-40, -29.5], [40, -29.5], [45, -19], [-45, -19]], () => "#020B1A", noseZ + EPS);
    for (let q = 0; q < 3; q++) {
      const y = -26.6 + q * 2.9, wq = 38.5 + (q + 0.6) * 1.45;
      onCap(`ns${q}`, nx + 0.2, [[-wq, y - 0.7], [wq, y - 0.7], [wq, y + 0.7], [-wq, y + 0.7]], (wn) => ramp(0.3 + 0.7 * L(wn)), noseZ + 2 * EPS, { sw: 0 });
    }
  }

  // ══ THE UNDERSIDE (seen when the car rolls or flips): each part sorts in front of the floor when the floor is seen ══
  {
    const sees = floorSeen(-150, 150, 1) || floorSeen(-150, 150, -1);
    const fz = Math.max(hostZ(-215, 215, 0, 1, 1), hostZ(-215, 215, 0, 1, -1));
    let ord = 0;
    const uz = (natural: number) => (sees ? fz + (5 + (ord++) * 0.002) * EPS : natural);
    /** a box hung UNDER the floor (only its bottom and its four sides: its top is inside the body) */
    const ubox = (k: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, fill: (wn: V) => string) => {
      const c: V = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2];
      const F: [string, V[], V][] = [
        ["b", [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], [0, 1, 0]],
        ["f", [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1]],
        ["k", [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], [0, 0, -1]],
        ["l", [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0]],
        ["r", [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], [1, 0, 0]],
      ];
      const z = uz(depthL(c));
      for (const [nm, pts, n] of F) { const f = mk(`${k}${nm}`, pts, n, fill, { sw: 0.5 }); if (f) { f.z = z + (nm === "b" ? 0.01 : 0); out.push(f); } }
    };
    /** a bar between two points under the floor (an arm): a square section */
    const bar = (k: string, a: V, b: V, w: number, h: number, fill: (wn: V) => string) => {
      const d = nrm(sub(b, a)), up: V = [0, -1, 0], sd = nrm(crs(d, up)), u2 = nrm(crs(sd, d));
      const c = (q: V, i: number): V => add(q, add(scl(sd, (i & 1 ? 1 : -1) * w / 2), scl(u2, (i & 2 ? 1 : -1) * h / 2)));
      const A = [0, 1, 2, 3].map((i) => c(a, i)), B = [0, 1, 2, 3].map((i) => c(b, i));
      const ctr = scl(add(a, b), 0.5), z = uz(depthL(ctr));
      const sides: [number, number][] = [[0, 1], [1, 3], [3, 2], [2, 0]];
      sides.forEach(([i0, i1], q) => {
        const pts = [A[i0], A[i1], B[i1], B[i0]], n = newell(pts, ctr);
        if (!n) return;
        const f = mk(`${k}${q}`, pts, n, fill, { sw: 0.4 });
        if (f) { f.z = z; out.push(f); }
      });
    };
    // the floor's panel seams (dark lines laid on the floor)
    const fy = -12 + 0.12;
    for (const x of [-150, -100, 86, 112, 176]) {
      const zW = ctrl(x)[1][0] - 2;
      const f = mk(`fs${x}`, [[x - 0.6, fy, -zW], [x + 0.6, fy, -zW], [x + 0.6, fy, zW], [x - 0.6, fy, zW]], [0, 1, 0], () => "#020A18", { sw: 0, op: 0.85 });
      if (f) { f.z = uz(f.z); out.push(f); }
    }
    // the battery pack: a plate hung under the floor, its bottom ribbed, a bolt row round its edge
    ubox("bp", -96, 84, -12, -8.6, -74, 74, under);
    for (let q = 0; q < 7; q++) { const z = -54 + q * 18; ubox(`br${q}`, -86, 74, -8.6, -7.4, z - 1.3, z + 1.3, underLite); }
    if (lod >= 2) {
      const bolts: [number, number][] = [];
      for (let x = -90; x <= 78; x += 21) bolts.push([x, 70], [x, -70]);
      for (const z of [-46, 0, 46]) bolts.push([-92, z], [80, z]);
      bolts.forEach(([x, z], q) => {
        const pts: V[] = Array.from({ length: 6 }, (_, a) => { const g = (a / 6) * Math.PI * 2 + 0.3; return [x + 1.7 * Math.cos(g), -8.5, z + 1.7 * Math.sin(g)] as V; });
        const f = mk(`bo${q}`, pts, [0, 1, 0], underLite, { sw: 0.2 });
        if (f) { f.z = uz(f.z) + 0.01; out.push(f); }
      });
    }
    // a motor housing at each axle (a flattened can under a mounting plate) and its A-arms out to the wheels
    for (const [ax, hw, rr] of [[138, 40, 6.2], [-128, 46, 7.4]] as [number, number, number][]) {
      ubox(`mp${ax}`, ax - 22, ax + 22, -12, -9.5, -hw, hw, under);
      // the can: a half-octagon trough along z (never above the floor)
      const prof: [number, number][] = [[-rr, -9.5], [-rr, -7.4], [-rr * 0.7, -4.6], [rr * 0.7, -4.6], [rr, -7.4], [rr, -9.5]];
      const zc = hw - 8, cz = uz(depthL([ax, -7, 0]));
      for (let q = 0; q < prof.length - 1; q++) {
        const [a, b] = [prof[q], prof[q + 1]];
        const pts: V[] = [[ax + a[0], a[1], -zc], [ax + b[0], b[1], -zc], [ax + b[0], b[1], zc], [ax + a[0], a[1], zc]];
        const n = newell(pts, [ax, -9.5, 0]);
        if (!n) continue;
        const f = mk(`mc${ax}${q}`, pts, n, underLite, { sw: 0.5 });
        if (f) { f.z = cz + 0.02; out.push(f); }
      }
      for (const s of [1, -1]) {
        const capP: V[] = prof.map(([px, py]) => [ax + px, py, s * zc] as V);
        const f = mk(`me${ax}${s}`, capP, [0, 0, s], under, { sw: 0.4 });
        if (f) { f.z = cz + 0.02; out.push(f); }
        // the cooling ribs on the can's belly
        if (lod >= 1) for (let q = -2; q <= 2; q++) {
          const zz = q * (zc / 3);
          const f2 = mk(`mr${ax}${s}${q}`, [[ax - rr * 0.66, -4.5, zz - 0.8], [ax + rr * 0.66, -4.5, zz - 0.8], [ax + rr * 0.66, -4.5, zz + 0.8], [ax - rr * 0.66, -4.5, zz + 0.8]], [0, 1, 0], () => "#0A2A55", { sw: 0, op: 0.7 });
          if (s > 0 && f2) { f2.z = cz + 0.03; out.push(f2); }
        }
        // the A-arm: two bars from the subframe to the knuckle at the wheel
        const knuckle: V = [ax, -11.2, s * 77];
        bar(`aa${ax}${s}`, [ax - 17, -8, s * (hw - 2)], knuckle, 3.6, 2.6, (wn) => ramp(0.08 + 0.72 * L(wn)));
        bar(`ab${ax}${s}`, [ax + 15, -8, s * (hw - 2)], knuckle, 3.6, 2.6, (wn) => ramp(0.08 + 0.72 * L(wn)));
      }
    }
    // the rear diffuser's fins: upright plates under the rising tail floor, down to the floor's level
    for (const fzc of [-54, -27, 0, 27, 54]) {
      const top: [number, number][] = [];
      for (let x = -150; x >= -213; x -= 9) top.push([x, ctrl(x)[0][1] + 0.3]);
      top.push([-213, ctrl(-213)[0][1] + 0.3]);
      const bot = -12.6;
      for (const sd of [1, -1]) {
        const pts: V[] = [...top.map(([x, y]) => [x, y, fzc + sd * 1.2] as V), [-213, bot, fzc + sd * 1.2], [-150, bot, fzc + sd * 1.2]];
        const f = mk(`df${fzc}${sd}`, pts, [0, 0, sd], (wn) => mix("#020B18", "#2F5F99", L(wn) * 0.9), { sw: 0.4 });
        if (f) { f.z = uz(depthL([-185, -16, fzc])); out.push(f); }
      }
      const e: V[] = [[-150, bot, fzc - 1.2], [-213, bot, fzc - 1.2], [-213, bot, fzc + 1.2], [-150, bot, fzc + 1.2]];
      const fe = mk(`dg${fzc}`, e, [0, 1, 0], (wn) => mix("#0B2A52", "#8CB1DD", L(wn)), { sw: 0.3 });
      if (fe) { fe.z = uz(depthL([-185, -12.6, fzc])) + 0.01; out.push(fe); }
    }
    // the front splitter: a black blade hung under the nose, standing a little proud of it
    {
      const xs = [186, 196, 206, 214, 217.5];
      const yTop = (x: number) => ctrl(Math.min(215, x))[0][1] + 0.2;
      const zW = (x: number) => Math.min(84, ctrl(Math.min(215, x))[1][0] + 4);
      const topP: V[] = [...xs.map((x) => [x, yTop(x), zW(x)] as V), ...xs.slice().reverse().map((x) => [x, yTop(x), -zW(x)] as V)];
      const botP = topP.map((v) => [v[0], v[1] + 2.6, v[2]] as V);
      const c: V = [205, -14, 0], z = sees ? fz + 5 * EPS : depthL(c);
      const fb = mk("spb", botP, [0, 1, 0], (wn) => mix("#020B18", "#2F5F99", L(wn)), { sw: 0.4 });
      if (fb) { fb.z = z; out.push(fb); }
      const fr: V[] = [[217.5, yTop(217.5), zW(217.5)], [217.5, yTop(217.5), -zW(217.5)], [217.5, yTop(217.5) + 2.6, -zW(217.5)], [217.5, yTop(217.5) + 2.6, zW(217.5)]];
      const ff = mk("spf", fr, [1, 0, 0], (wn) => mix("#13355F", "#CFE0F3", L(wn)), { sw: 0.3 });
      if (ff) { ff.z = Math.max(z, noseZ + 3 * EPS); out.push(ff); }
    }
  }

  // ══ THE WHEELS ══ (each ONE unit: its parts painted in order, the unit placed against the body)
  const R = RD.wheelR, NW = lod >= 2 ? 40 : lod ? 30 : 22;
  for (const wx of RD.wheelX) for (const s of [1, -1] as const) {
    const sk = `w${wx}${s > 0 ? "L" : "R"}`;
    const cy = -R, wzc = s * RD.wheelZ, zo = wzc + s * 13;
    const ZA = (dz: number) => zo - s * dz; // a plane `dz` in from the outer face
    const at = (rr: number, a: number, z: number): V => [wx + rr * Math.cos(a), cy + rr * Math.sin(a), z];
    const ctr: V = [wx, cy, wzc];
    const list: Face[] = [];
    const W = (k: string, pts: V[], n: V | null, fill: (wn: V) => string, o: Partial<Face> = {}) => {
      const nn = n ?? newell(pts, ctr);
      if (!nn) return;
      const f = mk(`${sk}${k}`, s > 0 ? pts : pts.slice().reverse(), nn, fill, { sw: 0.5, ...o }, false);
      if (f) list.push(f);
    };
    const disc = (rad: number, z: number, N = NW, a0 = 0): V[] => Array.from({ length: N }, (_, i) => at(rad, a0 + (i / N) * Math.PI * 2, z));
    // ── the TYRE: turned from its profile (r, depth in from the outer face) ──
    type Pr = [number, number];
    const tread: Pr[] = lod >= 2
      ? [[0.965 * R, 0.5], [R, 2.6], [R, 8.6], [0.982 * R, 9.0], [0.982 * R, 10.0], [R, 10.4], [R, 15.6], [0.982 * R, 16.0], [0.982 * R, 17.0], [R, 17.4], [R, 23.4], [0.965 * R, 25.5]]
      : [[0.965 * R, 0.5], [R, 2.6], [R, 23.4], [0.965 * R, 25.5]];
    const lathe = (k: string, prof: Pr[], fill: (wn: V, band: number, seg: number) => string, rotWith = true) => {
      for (let b = 0; b < prof.length - 1; b++) for (let i = 0; i < NW; i++) {
        const a0 = (rotWith ? spin : 0) + (i / NW) * Math.PI * 2, a1 = a0 + (Math.PI * 2) / NW;
        const [ra, da] = prof[b], [rb, db] = prof[b + 1];
        W(`${k}${b}_${i}`, [at(ra, a0, ZA(da)), at(ra, a1, ZA(da)), at(rb, a1, ZA(db)), at(rb, a0, ZA(db))], null, (wn) => fill(wn, b, i));
      }
    };
    const tyreFill = (wn: V, b: number, i: number) => {
      const base = rubber(wn);
      if (lod < 2) return base;
      const groove = b === 3 || b === 7, outerLane = b === 1 || b === 9, block = outerLane && i % 2 === 0;
      const c = groove ? mix(base, "#000000", 0.55) : block ? mix(base, "#7E95B3", 0.16) : outerLane ? mix(base, "#000000", 0.25) : base;
      return mix(c, mix(base, "#000000", outerLane ? 0.05 : 0), blur);
    };
    lathe("t", tread, tyreFill);
    // the inner face (seen from inside the car's track): a dark disc, then the inner sidewall
    W("in", disc(0.84 * R, ZA(25.6), NW), [0, 0, -s], () => "#030912");
    lathe("is", [[0.965 * R, 25.5], [0.9 * R, 26], [0.82 * R, 25.4]], (wn) => mix(rubber(wn), "#000000", 0.15), false);
    // the outer sidewall's base disc — the measured shape (with the sills), drawn first under the rim
    W("sw", disc(0.97 * R, ZA(0.15), NW), [0, 0, s], (wn) => mix("#040A14", "#1C2C44", L(wn) * 0.8), { skip: false });
    // (the rim is seen only from the wheel's OUTER side: from inside the track its spokes' sides and the barrel would show through the
    // inner face)
    const outerSeen = seen(r, disc(0.9 * R, zo, 12).map((q) => W3(q)), nrm(ap(m, [0, 0, s]))).ok;
    if (outerSeen) {
    // ── the RIM, back to front: the well, the barrel's inner wall, the brake disc and its caliper, the spokes, the hub ──
    W("wl", disc(0.76 * R, ZA(15), NW), [0, 0, s], () => "#020812", { sw: 0.3 });
    for (let i = 0; i < NW; i++) {
      const a0 = (i / NW) * Math.PI * 2, a1 = a0 + (Math.PI * 2) / NW, am = (a0 + a1) / 2;
      W(`bw${i}`, [at(0.76 * R, a0, ZA(1)), at(0.76 * R, a1, ZA(1)), at(0.76 * R, a1, ZA(15)), at(0.76 * R, a0, ZA(15))], [-Math.cos(am), -Math.sin(am), 0], (wn) => mix("#030C1B", "#4A6E9A", L(wn) * 0.8), { sw: 0.3 });
    }
    // the brake disc (its hat darker), cross-drilled, turning with the wheel
    W("bd", disc(0.63 * R, ZA(11), NW), [0, 0, s], (wn) => mix("#3A5F8C", "#D3E1F1", L(wn)), { sw: 0.3 });
    W("bh", disc(0.33 * R, ZA(10.6), Math.max(16, NW / 2)), [0, 0, s], (wn) => mix("#0B2445", "#6F93BF", L(wn)), { sw: 0.3 });
    if (lod >= 2 && blur < 0.98) for (let ring = 0; ring < 2; ring++) for (let h = 0; h < 12; h++) {
      const a = spin + (h / 12) * Math.PI * 2 + ring * 0.26, rr = (0.43 + ring * 0.1) * R, c = at(rr, a, ZA(10.8));
      W(`bx${ring}_${h}`, Array.from({ length: 6 }, (_, q) => add(c, [0.75 * Math.cos((q / 6) * Math.PI * 2), 0.75 * Math.sin((q / 6) * Math.PI * 2), 0])), [0, 0, s], () => "#071A33", { sw: 0, op: 1 - blur });
    }
    // the caliper: a curved block over the disc's upper rear edge (fixed — it does not turn)
    {
      const ac = -Math.PI * 0.72, span = 0.5, r0 = 0.47 * R, r1 = 0.69 * R, zf = ZA(8.4), zb = ZA(14), n = 5;
      const arc = (rr: number, z: number) => Array.from({ length: n + 1 }, (_, i) => at(rr, ac - span / 2 + (span * i) / n, z));
      const outer = arc(r1, zf), inner = arc(r0, zf);
      W("cf", [...outer, ...inner.slice().reverse()], [0, 0, s], blueMetal, { sw: 0.4 });
      const ob = arc(r1, zb);
      for (let i = 0; i < n; i++) W(`co${i}`, [outer[i], outer[i + 1], ob[i + 1], ob[i]], null, blueMetal, { sw: 0.3 });
      W("ce0", [outer[0], inner[0], at(r0, ac - span / 2, zb), ob[0]], null, blueMetal, { sw: 0.3 });
      W("ce1", [outer[n], ob[n], at(r0, ac + span / 2, zb), inner[n]], null, blueMetal, { sw: 0.3 });
    }
    // the TEN SPOKES of a turbine rim: from the recessed hub out to the lip (the dish), each with its lit face and its two sides
    const SPK = 10, rh = 8.6, rl = 0.765 * R, zH = ZA(8.2), zL = ZA(1.6), th = 2.8;
    const spokeOp = 1 - blur;
    if (spokeOp > 0.01) for (let k = 0; k < SPK; k++) {
      const a = spin + (k / SPK) * Math.PI * 2, ar = a + 0.16, wH = 2.4, wL = 1.55;
      const off = (q: V, ang: number, w: number): V => add(q, [-Math.sin(ang) * w, Math.cos(ang) * w, 0]);
      const hC = at(rh, a, zH), lC = at(rl, ar, zL);
      const T = [off(hC, a, -wH), off(hC, a, wH), off(lC, ar, wL), off(lC, ar, -wL)];
      const B = T.map((q) => add(q, [0, 0, -s * th]));
      const mid = scl(add(hC, lC), 0.5), inside = add(mid, [0, 0, -s * th]);
      W(`sa${k}`, [T[0], T[3], B[3], B[0]], null, (wn) => rim(wn), { op: spokeOp, sw: 0.3 });
      W(`sb${k}`, [T[1], B[1], B[2], T[2]], null, (wn) => rim(wn), { op: spokeOp, sw: 0.3 });
      const nT = newell(T, inside);
      if (nT) W(`sf${k}`, T, nT, (wn) => rim(wn), { op: spokeOp, sw: 0.4 });
    }
    // the motion blur: the spokes smeared into a disc of their own light (static radial finish), brightest at the lip
    if (blur > 0.01) W("blr", disc(0.765 * R, ZA(2.2), NW), [0, 0, s], () => "url(#rdBlur)", { op: blur * 0.96, sw: 0 });
    // the hub: a dished plate, five lug nuts on it (turning), the centre cap
    W("hr", disc(rh + 1.6, ZA(7.8), 22), [0, 0, s], () => "#06183A", { sw: 0.3 });
    W("hb", disc(rh + 0.5, ZA(7.6), 22), [0, 0, s], (wn) => ramp(0.2 + 0.8 * L(wn)), { sw: 0.3 });
    if (lod) for (let q = 0; q < 5; q++) {
      const a = spin + (q / 5) * Math.PI * 2, c = at(5.6, a, ZA(7.1));
      W(`nt${q}`, Array.from({ length: 6 }, (_, h) => add(c, [1.3 * Math.cos((h / 6) * Math.PI * 2 + a), 1.3 * Math.sin((h / 6) * Math.PI * 2 + a), 0])), [0, 0, s],
        (wn) => mix("#0A2240", "#9FBCE0", L(wn)), { sw: 0.3, op: 1 - blur });
    }
    W("cc", disc(3.0, ZA(6.9), 16), [0, 0, s], (wn) => mix("#123B6E", "#E4EEF8", L(wn)), { sw: 0.3 });
    // the rim's lip, then the outer sidewall over its edge (the tyre's bead and its rounded shoulder)
    {
      const lip: Pr[] = [[0.74 * R, 1.6], [0.79 * R, 0.6], [0.83 * R, 0.5]];
      lathe("lp", lip, (wn) => ramp(0.32 + 0.8 * L(wn)), false);
      lathe("os", [[0.83 * R, 0.5], [0.9 * R, 0], [0.965 * R, 0.5]], (wn) => mix("#03080F", "#2C3F5A", L(wn) * 0.85), false);
    }
    }
    // ── where the wheel unit sorts ──
    let zu: number;
    // (the near wheel sorts just in front of the facets its arch is cut into — the same hosts as the arch — so the body AHEAD of or
    // BEHIND the arch, where it is nearer, still hides the tyre's tread as a real fender and bumper do)
    if (outerSeen) zu = hostZ(wx - ARCH_R + 0.5, wx + ARCH_R - 0.5, 0, 9, s) + 8 * EPS;
    else if (floorSeen(wx - 30, wx + 30, s)) zu = hostZ(wx - 46, wx + 46, 0, 1, s) + 8 * EPS;
    else zu = depthOf(r, W3(ctr)) - 70 * sc;
    // ★ THE WHEEL IS SEEN ONLY WHERE A REAL ONE CAN BE (Timur, 2026-10-29: "you can see the tires through the body of the car"): through
    // its arch's opening (near side), below the body's sill line, and over the floor when the floor is seen. The whole unit is CLIPPED to
    // that region (built in the car's own space and projected, so it holds from every angle, rolled or lifted), so no part of a tyre can
    // ever paint over the quarter panel, the bumper, the rocker or the far flank, whatever the sort order does.
    const PJ = (v: V) => P(r, W3(lift(v)));
    const span = ARCH_R + 80, regions: { x: number; y: number }[][] = [];
    {
      const top: V[] = [], bot: V[] = [];
      for (let i = 0; i <= 16; i++) { const x = wx - span + (2 * span * i) / 16, q = S(x, 2, s); top.push(q); bot.push([q[0], 160, q[2]]); }
      regions.push([...top, ...bot.reverse()].map(PJ));
    }
    if (outerSeen) {
      const N = 24, o: V[] = [];
      for (let i = 0; i <= N; i++) {
        const a = Math.PI + (i / N) * Math.PI, x = wx + (ARCH_R + 0.3) * Math.cos(a), y = -RD.wheelR + (ARCH_R + 0.3) * Math.sin(a);
        o.push(S(x, tAtY(x, y), s));
      }
      // (the opening runs on down past the sill into the band below it: a seam between the two showed as a dark sliver across the wheel)
      { const qa = S(wx + ARCH_R + 0.3, 2, s), qb = S(wx - ARCH_R - 0.3, 2, s); o.push([qa[0], 20, qa[2]], [qb[0], 20, qb[2]]); }
      regions.push(o.map(PJ));
    }
    if (floorSeen(wx - 30, wx + 30, s)) {
      const fl: V[] = [];
      for (let i = 0; i <= 8; i++) fl.push(S(wx - span + (2 * span * i) / 8, 0, s));
      for (let i = 8; i >= 0; i--) fl.push(S(wx - span + (2 * span * i) / 8, 2, s));
      regions.push(fl.map(PJ));
    }
    const cid = `${key}clip${sk}`;
    out.push({
      k: `${key}${sk}unit`, p: [], z: zu, fill: "none", sw: 0, chrome: 0, fall: 0, skip: true,
      after: (
        <>
          <defs data-probe-skip><clipPath id={cid}>{regions.map((g, i) => <polygon key={i} points={pts(g)} />)}</clipPath></defs>
          <g clipPath={`url(#${cid})`}>
            {list.map((f) => (
              <polygon key={f.k} {...(f.skip ? { "data-probe-skip": true } : {})} points={pts(f.p)} fill={f.fill}
                stroke={f.stroke ?? (f.fill !== "none" && f.sw !== 0 ? f.fill : undefined)} strokeWidth={f.sw ?? 0.7} opacity={f.op} strokeLinejoin="round" />
            ))}
          </g>
        </>
      ),
    });
  }

  return out;
};

/** the soft puff the jets are drawn with (one static radial def — STYLE §16: no defs changed per frame). Put it once per SVG that draws
 *  RoadsterJets. (The car's own finishes ride on its faces: no other def is needed.) */
export const RoadsterDefs: React.FC = () => (
  <defs data-probe-skip>
    <radialGradient id="rdPuff">
      <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" /><stop offset="0.45" stopColor="#EEF5FF" stopOpacity="0.55" /><stop offset="1" stopColor="#DCEBFF" stopOpacity="0" />
    </radialGradient>
  </defs>
);
/** ★ THE COLD-GAS JETS: short white puffs breathing out of the firing nozzles (compressed air — white, never fire), drawn as soft radial
 *  puffs along each nozzle's axis that grow and thin out. Paint them AFTER the car (they are in front of the body). */
export const RoadsterJets: React.FC<{ r: Rig; p: Pose; len?: number }> = ({ r, p, len = 70 }) => {
  const jets = p.jets ?? 0;
  if (jets <= 0.01) return null;
  const m = rot(p), s = p.scale ?? 1, br = p.breath ?? 0, sq = p.squat ?? 0;
  const puffs: { x: number; y: number; rr: number; o: number; d: number }[] = [];
  const vb = (r.yaw * Math.PI) / 180, va = (r.pitch * Math.PI) / 180;
  NOZZLES.forEach((nz, i) => {
    const wn = nrm(ap(m, nz.n));
    // ★ a FLANK nozzle on the far side blows away from the camera, behind the body: seen from above its plume projects UP over the car (it
    // read as a white shine on the windows, 2026-10-30). Its puffs fade out smoothly as its nozzle turns away (view z −0.25 → −0.6), so the
    // body hides what it would hide and nothing pops as the car rolls
    const vz = wn[1] * Math.sin(va) + (-wn[0] * Math.sin(vb) + wn[2] * Math.cos(vb)) * Math.cos(va);
    const vis = nz.n[0] === 0 ? Math.max(0, Math.min(1, (vz + 0.6) / 0.35)) : 1;
    if (vis <= 0.01) return;
    const base = toWorld(p, [nz.at[0], nz.at[1] + sq + (nz.at[0] - 5) * Math.tan(((p.dive ?? 0) * Math.PI) / 180), nz.at[2]], m);
    // each nozzle breathes a little out of phase with its neighbours: the plume's length swells and eases ±18%
    const Lj = len * jets * (0.82 + 0.18 * Math.sin(br * 2 * Math.PI + i * 1.7));
    for (let k = 0; k < 5; k++) {
      const t = (k + 0.6) / 5, w: V = [base[0] + wn[0] * Lj * t * s, base[1] + wn[1] * Lj * t * s, base[2] + wn[2] * Lj * t * s];
      const q = P(r, w);
      puffs.push({ x: q.x, y: q.y, rr: (9 + 20 * t) * s, o: 0.5 * jets * vis * (1 - t * 0.85) * (p.op ?? 1), d: depthOf(r, w) });
    }
  });
  return (
    <g data-probe-skip>
      {puffs.sort((a, b) => a.d - b.d).map((q, i) => <circle key={i} cx={q.x.toFixed(1)} cy={q.y.toFixed(1)} r={q.rr.toFixed(1)} fill="url(#rdPuff)" opacity={q.o.toFixed(3)} />)}
    </g>
  );
};

/** ★ ITS SHADOW on a floor at `floorY`: the footprint under the car, softer and fainter the higher it flies (a contact shadow when it is on
 *  its wheels — STYLE §16 2026-10-22: the object's own footprint, leaning away from the key). Paint before the car. */
export const roadsterShadow = (r: Rig, p: Pose, floorY: number, key = "rd"): Face[] => {
  const s = p.scale ?? 1, h = Math.max(0, floorY - p.y), k = Math.max(0, 1 - h / (420 * s));
  if (k <= 0.02) return [];
  const yaw = ((p.yaw ?? 0) * Math.PI) / 180, hx = (RD.half * Math.abs(Math.cos(yaw)) + 102 * Math.abs(Math.sin(yaw))) * s, hz = (102 * Math.abs(Math.cos(yaw)) + RD.half * Math.abs(Math.sin(yaw))) * s;
  const grow = 1 + (1 - k) * 0.5;
  return contactShadow(r, `${key}sh`, p.x - hx * grow, p.x + hx * grow, p.z - hz * grow, p.z + hz * grow, floorY, 1.5 * k * k * (p.op ?? 1), 26 * s);
};
