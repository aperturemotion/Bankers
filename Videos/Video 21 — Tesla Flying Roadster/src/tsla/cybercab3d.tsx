import React from "react";
import { type Rig } from "./rig";
import { P, pts, quad, seen, lightOf, mix, depthOf, contactShadow, type Face, type V } from "./p3";
import { type Pose } from "./roadster";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// ★ THE CYBERCAB in real depth (Timur, 2026-10-29, on the 52-s Cybercab: "replace it with the car model at 22 seconds … if it's meant to
// be another car, then just make a similar detailed model"; STYLE §16 2026-10-29: every car in a film is built to the hero car's level of
// detail, same construction). It is the Roadster's machinery (roadster.tsx) with Tesla's two-seat robotaxi's own body:
//   · a low smooth TEARDROP: one closed loft whose section is a smooth curve through crease rows (sill, rocker, door step, shoulder, deck
//     edge, beltline, canopy edge), the roof running in one long arc from the windscreen down to a short Kamm tail;
//   · ONE WRAPAROUND GLASS CANOPY (windscreen, side glass and glass roof as one dark sheet, no B-pillar, a dark seam where the side glass
//     turns into the roof); NO rear window: the canopy stops over the rear axle and the rear is a body panel;
//   · two large BUTTERFLY DOORS (their shut lines run from the sill up through the glass and along the roof), camera pods, no mirrors;
//   · FULL-WIDTH LIGHT BARS front and rear, wrapping round the corners; a lower intake and splitter; a dark diffuser panel;
//   · real WHEELS with AERO COVERS (a dished satin cover with five slots, lug nuts and a hub boss) on real tyres — turning, blurred when too
//     fast to read (`spinBlur`), clipped to where a real wheel can be seen (the arch, below the sill, over the floor);
//   · the UNDERSIDE: floor seams, the battery plate with its ribs and bolts, a motor and A-arms at each axle, diffuser fins.
// Its finish is the LINE-UP's BLUE METAL (the house solids' satin steel in the logo blue's family), not the hero's pale steel.
// `dive` (degrees, nose DOWN) pitches the body alone about the axles, as braking does; the wheels stay on the ground.
// Local frame as the Roadster's: x along (nose +x, tail −200 … nose +200), y DOWN (the tyres stand on y 0), z across (+z its left side).
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const CB = { len: 400, half: 200, width: 180, height: 130, wheelR: 35, wheelX: [-130, 132] as const, wheelZ: 73 } as const;
export type CabPose = Pose & { dive?: number };

type M3 = number[];
const rot = (p: Pose): M3 => {
  const r = ((p.roll ?? 0) * Math.PI) / 180, t = (-(p.pitch ?? 0) * Math.PI) / 180, y = ((p.yaw ?? 0) * Math.PI) / 180;
  const cr = Math.cos(r), sr = Math.sin(r), ct = Math.cos(t), st = Math.sin(t), cy = Math.cos(y), sy = Math.sin(y);
  const Rx = [1, 0, 0, 0, cr, -sr, 0, sr, cr];
  const Rz = [ct, -st, 0, st, ct, 0, 0, 0, 1];
  const Ry = [cy, 0, sy, 0, 1, 0, -sy, 0, cy];
  const mul = (A: M3, B: M3) => [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]));
  return mul(Ry, mul(Rz, Rx));
};
const ap = (m: M3, [x, y, z]: V): V => [m[0] * x + m[1] * y + m[2] * z, m[3] * x + m[4] * y + m[5] * z, m[6] * x + m[7] * y + m[8] * z];
const toWorld = (p: Pose, v: V, m: M3): V => { const s = p.scale ?? 1, w = ap(m, v); return [p.x + w[0] * s, p.y + w[1] * s, p.z + w[2] * s]; };

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


// ══ THE BODY ══════════════════════════════════════════════════════════════════════════════════
// KEY SECTIONS from the tail (x −200) to the nose (+200), as the Roadster's: W the sill's half-width, yb the floor, yl the rocker's top, ys
// the shoulder, yt the deck edge / beltline, yh the hood's centre where there is no cabin, cab the canopy (hw its half-width at the belt,
// roof its centre height). The canopy runs from the cowl right back to the tail, its roof one falling arc (the teardrop).
type K = { x: number; W: number; yb?: number; yl?: number; ys: number; yt: number; yh?: number; cab?: { hw: number; roof: number } };
const KEYS: K[] = [
  { x: -200, W: 70, yb: -27, yl: -36, ys: -56, yt: -70, cab: { hw: 56, roof: -75 } },
  { x: -193, W: 78, yb: -24, yl: -34, ys: -59, yt: -76, cab: { hw: 62, roof: -84 } },
  { x: -178, W: 83, yb: -21, yl: -32, ys: -60, yt: -79, cab: { hw: 64, roof: -96 } },
  { x: -146, W: 86, yb: -19, yl: -32, ys: -60, yt: -80, cab: { hw: 64, roof: -111 } },
  { x: -96, W: 86, yb: -19, yl: -32, ys: -60, yt: -80, cab: { hw: 63, roof: -124 } },
  { x: -42, W: 86, yb: -19, yl: -32, ys: -60, yt: -80, cab: { hw: 62, roof: -130 } },
  { x: 10, W: 86, yb: -19, yl: -32, ys: -60, yt: -80, cab: { hw: 62, roof: -126 } },
  { x: 56, W: 86, yb: -19, yl: -32, ys: -60, yt: -79.5, cab: { hw: 63, roof: -112 } },
  { x: 98, W: 85.5, yb: -19, yl: -32, ys: -59, yt: -78.5, cab: { hw: 65, roof: -90 } },
  { x: 118, W: 85, yb: -19, yl: -32, ys: -58.5, yt: -78, cab: { hw: 66, roof: -79.5 } },
  { x: 145, W: 84, yb: -19, yl: -32, ys: -57, yt: -76, yh: -74 },
  { x: 172, W: 80, yb: -20, yl: -31, ys: -53, yt: -69, yh: -68 },
  { x: 190, W: 72, yb: -22, yl: -31, ys: -48, yt: -61, yh: -60 },
  { x: 200, W: 61, yb: -24, yl: -31, ys: -43, yt: -53, yh: -53 },
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
const FEAT = [-200, -193, -122, -108, 118, 196, 200];
const mkGeo = (step: number, sub: (n: number) => number): Geo => {
  const xs: number[] = [...FEAT];
  for (let x = -200; x <= 200; x += x > 160 || x < -180 ? step / 2 : step) if (FEAT.every((q) => Math.abs(q - x) > step / 4)) xs.push(x);
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
/** ★ the flank's surface (local z, +z side) at (x, y): to seat print ON the body (the Cybercab's own print) */
const flankZ = (x: number, y: number) => S(x, tAtY(x, y))[2];
/** the body's half section at x as (z, y) pairs, floor centre round the +z side to the roof's centre (for a hull check) */
export const cabSection = (x: number) => ringLin(x).map(([z, y]) => ({ z, y }));
/** the flank's surface (local z, +z side) at (x, y) */
export const cabFlankZ = flankZ;

// the canopy's extent along the car: the side glass from its rear corner to the cowl, the glass roof from over the rear axle to the cowl
const GL = { cowl: 118, side0: -122, roof0: -108 } as const;
const ARCH_R = 39.5;

/** the line-up's BLUE METAL: lit faces #B3CEEF → #6FA3DF, turning from the key through the logo blue to the deep navy */
const BRAMP: [number, string][] = [[0, "#011A38"], [0.18, "#02234A"], [0.38, "#0B3F82"], [0.58, "#2D6AB1"], [0.8, "#6FA3DF"], [1, "#B3CEEF"]];
const bramp = (t: number) => {
  const u = Math.max(0, Math.min(1, t));
  for (let i = 0; i < BRAMP.length - 1; i++) if (u <= BRAMP[i + 1][0]) return mix(BRAMP[i][1], BRAMP[i + 1][1], (u - BRAMP[i][0]) / (BRAMP[i + 1][0] - BRAMP[i][0]));
  return BRAMP[BRAMP.length - 1][1];
};

/** the Cybercab's static finishes (one fixed set of defs; carried by its own first face) */
const CabDefs: React.FC = () => (
  <defs data-probe-skip>
    <linearGradient id="cbSheen" x1="0" y1="0" x2="0.9" y2="1">
      <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.26" /><stop offset="0.3" stopColor="#FFFFFF" stopOpacity="0.08" />
      <stop offset="0.52" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="0.78" stopColor="#001C3C" stopOpacity="0.10" />
      <stop offset="1" stopColor="#001C3C" stopOpacity="0.16" />
    </linearGradient>
    <linearGradient id="cbSheenH" x1="0" y1="0" x2="1" y2="0.35">
      <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.04" /><stop offset="0.34" stopColor="#FFFFFF" stopOpacity="0.24" />
      <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.05" /><stop offset="0.8" stopColor="#001C3C" stopOpacity="0.08" />
      <stop offset="1" stopColor="#001C3C" stopOpacity="0.02" />
    </linearGradient>
    <linearGradient id="cbBand" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#E8F2FF" stopOpacity="0" /><stop offset="0.45" stopColor="#E8F2FF" stopOpacity="0.5" />
      <stop offset="0.6" stopColor="#E8F2FF" stopOpacity="0.28" /><stop offset="1" stopColor="#E8F2FF" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="cbWell" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#010611" /><stop offset="0.7" stopColor="#030E20" /><stop offset="1" stopColor="#06172F" />
    </linearGradient>
    <radialGradient id="cbBlur" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#C9DAEE" /><stop offset="0.3" stopColor="#9DB9DB" /><stop offset="0.5" stopColor="#6F93BF" />
      <stop offset="0.72" stopColor="#7FA2CC" /><stop offset="1" stopColor="#B8CDE6" />
    </radialGradient>
  </defs>
);

/** ★ THE CYBERCAB'S FACES (merge them with the scene's own and paint with <Faces>). `key` prefixes every face. */
export const cybercabFaces = (r: Rig, p: CabPose, key = "cb"): Face[] => {
  const m = rot(p), out: Face[] = [];
  const sc = p.scale ?? 1, sq = p.squat ?? 0, OP = p.op ?? 1, EPS = 0.6 * sc;
  const lod = sc >= 0.9 ? 2 : sc >= 0.55 ? 1 : 0;
  const blur = Math.max(0, Math.min(1, p.spinBlur ?? 0)), spin = p.spin ?? 0;
  const L = (wn: V) => lightOf(r, wn);
  // finishes: the body in the line-up's blue metal, the cladding a darker satin, the canopy deep-blue glass
  const steel = (wn: V) => bramp(0.12 + 0.86 * L(wn));
  const trim = (wn: V) => mix("#010B1A", "#3F6595", L(wn) * 0.9);
  const under = (wn: V) => bramp(0.12 + 0.7 * L(wn));
  const underLite = (wn: V) => bramp(0.2 + 0.75 * L(wn));
  const glass = (wn: V) => mix("#020E24", "#3A72B8", Math.pow(L(wn), 1.3));
  const roofGlass = (wn: V) => mix("#020A1C", "#2A5C9C", Math.pow(L(wn), 1.3));
  const seam = (wn: V) => mix("#010812", "#1E3B63", L(wn));
  const rubber = (wn: V) => mix("#02060C", "#33465F", L(wn) * 0.85);
  const cover = (wn: V) => mix("#5E86B8", "#EEF4FB", L(wn));
  const opOf = (o?: number) => (o ?? 1) * OP;
  // the body's pitch under braking (`dive`, nose down), about the axles' height; the wheels stay where they are
  const dv = ((p.dive ?? 0) * Math.PI) / 180, cdv = Math.cos(dv), sdv = Math.sin(dv), PY = -CB.wheelR;
  const lift = (v: V): V => { const dx = v[0], dy = v[1] + sq - PY; return [dx * cdv - dy * sdv, PY + dx * sdv + dy * cdv, v[2]]; };
  const W3 = (v: V) => toWorld(p, v, m);
  const mk = (k: string, pts0: V[], n: V, fill: (wn: V) => string, o: Partial<Face> = {}, body = true): Face | null => {
    const wc = pts0.map((q) => W3(body ? lift(q) : q)), wn = nrm(ap(m, n));
    return quad(r, key + k, wc, wn, fill(wn), { chrome: 0, fall: 0, skip: true, ...o, op: opOf(o.op) });
  };
  const depthL = (v: V, body = true) => depthOf(r, W3(body ? lift(v) : v));

  out.push({ k: `${key}defs`, p: [], z: -1e9, fill: "none", sw: 0, chrome: 0, fall: 0, skip: true, after: <CabDefs /> });

  // ══ THE SHELL ══
  const G = GEO[sc >= 0.9 ? 2 : sc >= 0.5 ? 1 : 0];
  const ptJ = (j: number, k: number): V => {
    const kk = ((k % G.NRF) + G.NRF) % G.NRF, u = kk < G.NU ? kk : G.NRF - kk, sd = kk < G.NU ? 1 : -1, q = G.R[j][u];
    return [G.XS[j], q[1], q[0] * sd];
  };
  const segK = (u: number, s: number) => (s > 0 ? u : G.NRF - 1 - u);
  const D: number[][] = [], SEEN: boolean[][] = [];
  const glassOf = (xm: number, band: number): ((wn: V) => string) | null => {
    if (xm > GL.cowl) return null;
    if (band === 11) return xm > GL.side0 ? glass : null;
    if (band === 12) return xm > GL.side0 ? seam : null;
    if (band === 13 || band === 14) return xm > GL.roof0 ? (xm < 40 ? roofGlass : glass) : null;
    return null;
  };
  for (let j = 0; j < G.NJ - 1; j++) {
    D.push([]); SEEN.push([]);
    const xm = (G.XS[j] + G.XS[j + 1]) / 2;
    for (let k = 0; k < G.NRF; k++) {
      const q = [ptJ(j, k), ptJ(j + 1, k), ptJ(j + 1, k + 1), ptJ(j, k + 1)].map(lift);
      D[j].push(q.reduce((s, v) => s + depthOf(r, W3(v)), 0) / 4);
      SEEN[j].push(false);
      const n0 = newellRaw(q);
      if (!n0) continue;
      const n = scl(n0, -1);
      const band = G.band[k < G.NU - 1 ? k : G.NRF - 1 - k];
      const g = glassOf(xm, band);
      const fill = band === 0 ? under : band <= 4 ? trim : g ?? steel;
      const wc = q.map(W3), wn = nrm(ap(m, n));
      // (the rocker's faces — bands 2 and 3 — are the car's measured shapes, both sides)
      const f = quad(r, `${key}b${j}_${k}`, wc, wn, fill(wn), { chrome: 0, fall: 0, skip: !(band === 2 || band === 3), sw: 1.3, op: opOf() });
      if (f) { out.push(f); SEEN[j][k] = true; }
    }
  }
  const usOf = (i0: number, i1: number) => { const o: number[] = []; for (let u = 0; u < G.NU - 1; u++) if (G.band[u] >= i0 && G.band[u] <= i1) o.push(u); return o; };
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
  const capPts = (j: number): V[] => Array.from({ length: G.NRF }, (_, k) => ptJ(j, k + G.u3));
  const capZ = (j: number) => capPts(j).reduce((a, v) => a + depthL(v), 0) / G.NRF;
  const tailZ = capZ(0), noseZ = capZ(G.NJ - 1);
  { const f = mk("tail", capPts(0), [-1, 0, 0], steel); if (f) { f.z = tailZ; out.push(f); } }
  { const f = mk("nose", capPts(G.NJ - 1), [1, 0, 0], steel); if (f) { f.z = noseZ; out.push(f); } }

  // ── tools for what is set ON the shell ──
  const SP = (x: number, t: number, s: number, off = 0.25): V => add(S(x, t, s), scl(SN(x, t, s), off));
  const onSurf = (k: string, xt: [number, number][], s: number, fill: (wn: V) => string, z: number, o: Partial<Face> = {}, off = 0.25) => {
    const pp = xt.map(([x, t]) => SP(x, t, s, off));
    const c = xt.reduce((a, q) => [a[0] + q[0] / xt.length, a[1] + q[1] / xt.length], [0, 0]);
    const f = mk(k, pp, SN(c[0], c[1], s), fill, o);
    if (f) { f.z = z; out.push(f); }
    return f;
  };
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
  const along = (x0: number, x1: number, t: number, n: number): [number, number][] => Array.from({ length: n + 1 }, (_, i) => [x0 + ((x1 - x0) * i) / n, t] as [number, number]);
  const circ = (x: number, t: number, s: number, rad: number, off: number, N = 14): { pts: V[]; n: V } => {
    const c = S(x, t, s), n = SN(x, t, s), u = nrm(sub(S(x + 0.5, t, s), S(x - 0.5, t, s))), v = nrm(crs(n, u));
    return { pts: Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2; return add(add(c, scl(n, off)), add(scl(u, rad * Math.cos(a)), scl(v, rad * Math.sin(a)))); }), n };
  };
  const catchOp = (x: number, t: number, s: number, k = 1) => (0.3 + 0.62 * L(nrm(ap(m, SN(x, t, s))))) * k;
  const lit = (a: number) => (wn: V) => mix("#B3CEEF", "#FFFFFF", Math.min(1, a + L(wn) * 0.5));
  const rowY = (x: number, t: number) => S(x, t, 1)[1];
  const clearOfArches = (x0: number, x1: number, t: number): [number, number][] => {
    let segs: [number, number][] = [[x0, x1]];
    const hw = (y: number) => { const dy = y + CB.wheelR, R2 = ARCH_R + 4.5; return Math.abs(dy) < R2 ? Math.sqrt(R2 * R2 - dy * dy) : 0; };
    for (const ax of CB.wheelX) {
      const hl = hw(rowY(ax - 34, t)), hr = hw(rowY(ax + 34, t));
      if (hl <= 0 && hr <= 0) continue;
      segs = segs.flatMap(([a, b]) => (b <= ax - hl || a >= ax + hr ? [[a, b]] : ([[a, Math.min(b, ax - hl)], [Math.max(a, ax + hr), b]] as [number, number][]).filter(([u, v]) => v - u > 3)));
    }
    return segs;
  };
  const pod = (k: string, x: number, t: number, s: number, rad: number, z: number) => {
    const a = circ(x, t, s, rad, 0.6, 16), b = circ(x, t, s, rad * 0.5, 0.9, 12), c = circ(x + rad * 0.15, t + 0.04, s, rad * 0.18, 1.0, 8);
    for (const [q, fill, dz] of [[a, (wn: V) => mix("#020A18", "#3B5F8E", L(wn) * 0.7), 0], [b, () => "#2E5E9C", 0.1], [c, () => "#EAF3FF", 0.2]] as [typeof a, (wn: V) => string, number][]) {
      const f = mk(`${k}${dz}`, q.pts, q.n, fill, { sw: 0.3 });
      if (f) { f.z = z + dz * EPS; out.push(f); }
    }
  };

  for (const s of [1, -1] as const) {
    const sk = s > 0 ? "L" : "R";
    // ── the panel SHEENS (one soft satin gradient per panel) ──
    const sheen = (k: string, xt: [number, number][], hosts: number) => {
      const c = xt.reduce((q, v) => [q[0] + v[0] / xt.length, q[1] + v[1] / xt.length], [0, 0]);
      const wn = nrm(ap(m, SN(c[0], c[1], s)));
      onSurf(k, xt, s, () => "url(#cbSheen)", hosts + EPS, { op: 0.9 * (0.45 + 0.55 * L(wn)), sw: 0 }, 0.15);
    };
    const panel = (x0: number, x1: number, t0: number, t1: number, n = 8): [number, number][] => [...along(x0, x1, t1, n), ...along(x1, x0, t0, n)];
    sheen(`shD${sk}`, panel(-87, 89, 5.05, 8.95), hostZ(-87, 89, 4, 8, s));
    sheen(`shQ${sk}`, panel(-197, -172, 5.05, 8.95, 4), hostZ(-197, -172, 4, 8, s));
    sheen(`shF${sk}`, panel(175, 196, 5.05, 8.6, 3), hostZ(175, 196, 4, 8, s));

    // ── the WHEEL ARCHES: a dark well in the flank, its lip lit along the top ──
    for (const wx of CB.wheelX) {
      const N = lod ? 22 : 14, ring: [number, number][] = [];
      const xy = (a: number, rr: number) => [wx + rr * Math.cos(a), -CB.wheelR + rr * Math.sin(a)] as [number, number];
      for (let i = 0; i <= N; i++) ring.push(xy(Math.PI + (i / N) * Math.PI, ARCH_R));
      const yb = rowY(wx, 1.0);
      const poly: [number, number][] = [...ring, [wx + ARCH_R, yb], [wx - ARCH_R, yb]];
      const toT = (q: [number, number][]) => q.map(([x, y]) => [x, y >= rowY(x, 1.2) ? 1.2 : tAtY(x, y)] as [number, number]);
      const az = hostZ(wx - ARCH_R + 0.5, wx + ARCH_R - 0.5, 0, 9, s);
      onSurf(`ar${wx}${sk}`, toT(poly), s, () => "url(#cbWell)", az + 2 * EPS, { sw: 0.4 }, 0.35);
      const lipPath = (rr: number) => toT(Array.from({ length: N + 1 }, (_, i) => xy(Math.PI + 0.12 + (i / N) * (Math.PI - 0.24), rr)));
      const outer = lipPath(ARCH_R + 3.2), inner = lipPath(ARCH_R);
      const lp = [...outer.map(([x, t]) => SP(x, t, s, 0.9)), ...inner.reverse().map(([x, t]) => SP(x, t, s, 0.55))];
      const f = mk(`al${wx}${sk}`, lp, SN(wx, tAtY(wx, -CB.wheelR - ARCH_R - 1.5), s), (wn) => bramp(0.3 + 0.75 * L(wn)), { sw: 0.4 });
      if (f) { f.z = az + 3 * EPS; out.push(f); }
      ribbon(`ac${wx}${sk}`, lipPath(ARCH_R + 3.0), s, 0.9, lit(0.4), az + 4 * EPS, { op: catchOp(wx, 8, s, 0.75) }, 0, 1.0);
    }

    // ── CREASE CATCH-LIGHTS (the shoulder, the deck edge, the rocker's top), split round the arches ──
    const crease = (k: string, t: number, x0: number, x1: number, w: number, a: number, iHost: [number, number]) => {
      clearOfArches(x0, x1, t).forEach(([u, v], n) => {
        const pieces = Math.max(1, Math.round((v - u) / 70));
        for (let q = 0; q < pieces; q++) {
          const a0 = u + ((v - u) * q) / pieces, a1 = u + ((v - u) * (q + 1)) / pieces;
          ribbon(`${k}${n}_${q}${sk}`, along(a0, a1, t, 8), s, w, lit(0.3), hostZ(a0, a1, iHost[0], iHost[1], s) + 4 * EPS, { op: catchOp((a0 + a1) / 2, t + 0.3, s, a) });
        }
      });
    };
    crease("cs", 7, -197, 196, 1.0, 0.7, [6, 7]);
    crease("cd", 9, -197, 197, 1.2, 0.85, [8, 9]);
    crease("cr", 4.05, -192, 192, 0.7, 0.4, [3, 4]);
    clearOfArches(-192, 192, 4.6).forEach(([u, v], n) => ribbon(`cp${n}${sk}`, along(u, v, 4.6, 14), s, 1.1, () => "#031530", hostZ(u, v, 3, 5, s) + 4 * EPS, { op: 0.5 }));

    // ── the BUTTERFLY DOOR: its shut line from the sill up the rear edge, through the glass, along the roof's edge, down the front edge ──
    const dz = hostZ(-92, 96, 3, 14, s) + 5 * EPS;
    const door: [number, number][] = [[-44, 4.6], [-44.6, 6.5], [-45, 8.6], [-43, 10.4], [-38, 11.4], [-31, 12.35], [-24, 13.06],
      ...along(-16, 46, 13.06, 8), [54, 12.35], [62, 11.4], [70, 10.4], [78, 8.6], [80, 6.5], [80.5, 4.6]];
    ribbon(`dcg${sk}`, door, s, 1.2, () => "#010A18", dz, { op: 0.9 });
    ribbon(`dcl${sk}`, door, s, 0.7, lit(0.3), dz + 0.1 * EPS, { op: 0.4 }, -1.05);
    // the door's touch sensor and the cameras: on the door's rear top, the front fender, the rear quarter
    pod(`ds${sk}`, -34, 8.3, s, 2.2, dz + EPS);
    pod(`cf${sk}`, 160, 8.1, s, 3.4, hostZ(150, 170, 6, 9, s) + 5 * EPS);
    pod(`cq${sk}`, -170, 8.4, s, 3.4, hostZ(-180, -160, 6, 9, s) + 5 * EPS);

    // ── the CANOPY: its edge's catch-light at the belt, the dark seam into the roof lit along its top, the reflection band (`sweep`) ──
    const gz = hostZ(GL.side0, GL.cowl, 10, 14, s) + 3 * EPS;
    ribbon(`fb${sk}`, along(GL.side0 + 4, GL.cowl - 3, 11.0, 16), s, 0.8, lit(0.3), gz, { op: catchOp(-10, 10.6, s, 0.6) });
    ribbon(`fr${sk}`, along(GL.roof0 + 2, GL.cowl - 3, 13.0, 18), s, 0.7, lit(0.4), gz, { op: catchOp(-10, 13.2, s, 0.55) });
    {
      const sw = p.sweep ?? 0.35, c = 70 - 170 * sw;
      const xs0 = Math.max(GL.side0 + 6, c - 10), xs1 = Math.min(GL.cowl - 8, c + 10);
      if (xs1 - xs0 > 4) {
        const lean = (t: number) => (t - 11.5) * 16;
        onSurf(`gb${sk}`, [[xs0 - lean(11.06), 11.06], [xs1 - lean(11.06), 11.06], [xs1 - lean(11.94), 11.94], [xs0 - lean(11.94), 11.94]].map(([x, t]) => [Math.max(GL.side0 + 1, Math.min(GL.cowl - 1, x)), t] as [number, number]), s,
          () => "url(#cbBand)", gz + EPS, { sw: 0 }, 0.3);
      }
    }
    // ── the LIGHT BARS wrap round the corners: a dark housing on the deck edge with its lamp line, front (white) and rear ──
    for (const [k, x0, x1, lamp, dir] of [["lf", 181, 199.2, "#F2F8FF", 1], ["lr", -199.2, -184, "#9DC4F0", -1]] as [string, number, number, string, number][]) {
      const zz = (dir > 0 ? hostZ(176, 200, 7, 10, s) : hostZ(-200, -180, 7, 10, s)) + 5 * EPS;
      const path = along(x0, x1, 8.75, 8);
      ribbon(`${k}h${sk}`, path, s, 4.2, () => "#020A16", zz, {}, 0, 0.35);
      ribbon(`${k}l${sk}`, path, s, 1.5, () => lamp, zz + EPS, {}, 0, 0.5);
    }
  }

  // ══ ACROSS THE TOP: the hood's sheen and frunk line, the cowl, the windscreen's band, the canopy's rear edge, the rear panel's sheen ══
  {
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
    const putTop = (k: string, pp: V[], xm: number, tm: number, fill: (wn: V) => string, z: number, o: Partial<Face> = {}) => {
      const f = mk(k, pp, SN(xm, tm, 1), fill, o);
      if (f) { f.z = z; out.push(f); }
      return f;
    };
    const hoodZ = topZ(120, 199, 9), backZ = topZ(-199, -110, 9), wsZ = topZ(40, 120, 10);
    for (const [k, x0, x1, z] of [["shH", 122, 194, hoodZ], ["shK", -194, -112, backZ]] as [string, number, number, number][]) {
      const wn = nrm(ap(m, SN((x0 + x1) / 2, 14.5, 1)));
      putTop(k, across(x0, x1, 10.6), (x0 + x1) / 2, 14.5, () => "url(#cbSheenH)", z + EPS, { op: 0.9 * (0.4 + 0.6 * L(wn)), sw: 0 });
    }
    // the frunk lid's shut line: along each side at the hood's edge and across the front
    for (const s of [1, -1]) ribbon(`hk${s > 0 ? "L" : "R"}`, along(124, 190, 10.7, 10), s, 1.0, () => "#03142E", hoodZ + 3 * EPS, { op: 0.8 });
    {
      const endX = 190, tE = 10.7, a: V[] = [], b: V[] = [];
      for (let i = 0; i <= 10; i++) { const t = tE + ((15 - tE) * i) / 10; a.push(SP(endX + 0.55, t, 1, 0.3)); b.push(SP(endX - 0.55, t, 1, 0.3)); }
      const pp = [...a, ...a.slice(0, -1).reverse().map((v) => [v[0], v[1], -v[2]] as V), ...b.slice(0, -1).map((v) => [v[0], v[1], -v[2]] as V), ...b.reverse()];
      putTop("hkX", pp, endX, 14.5, () => "#03142E", hoodZ + 3 * EPS, { op: 0.8, sw: 0 });
    }
    // the cowl: a dark strip across the windscreen's foot
    putTop("cowl", across(GL.cowl - 4, GL.cowl + 2, 10.3, 2), GL.cowl, 14.5, () => "#041530", wsZ + 2 * EPS, { sw: 0.3 });
    // the windscreen's reflection band, leaning across the glass, travelling with `sweep`
    {
      const sw = p.sweep ?? 0.35, c = 104 - 56 * Math.max(0, Math.min(1, sw)), w = 7;
      const band: V[] = [], xAt = (tt: number) => c + tt * 10;
      for (let i = 0; i <= 6; i++) { const tt = -1 + (2 * i) / 6, t = 13.1 + (15 - 13.1) * (1 - Math.abs(tt)); band.push(SP(Math.min(GL.cowl - 3, Math.max(40, xAt(tt) + w)), t, tt < 0 ? -1 : 1, 0.3)); }
      for (let i = 6; i >= 0; i--) { const tt = -1 + (2 * i) / 6, t = 13.1 + (15 - 13.1) * (1 - Math.abs(tt)); band.push(SP(Math.min(GL.cowl - 3, Math.max(40, xAt(tt) - w)), t, tt < 0 ? -1 : 1, 0.3)); }
      putTop("wsb", band, c, 14.6, () => "url(#cbBand)", wsZ + 2 * EPS, { sw: 0, op: 0.8 });
      // the glass roof's own soft sheen
      putTop("rfs", across(GL.roof0 + 2, 40, 13.1), -40, 14.6, () => "url(#cbSheenH)", topZ(GL.roof0, 40, 12) + EPS, { sw: 0, op: 0.5 });
      // the canopy's rear edge, where the glass roof meets the rear body panel: a lit lip across
      putTop("cre", across(GL.roof0 - 1.2, GL.roof0 + 0.4, 12.6, 2), GL.roof0, 14.5, lit(0.4), topZ(GL.roof0 - 8, GL.roof0 + 8, 12) + 3 * EPS, { sw: 0, op: 0.7 });
    }
  }

  // ══ THE TAIL'S full-width light bar and diffuser panel; THE NOSE's light bar, intake and splitter ══
  {
    const onCap = (k: string, x: number, pp: [number, number][], fill: (wn: V) => string, z: number, o: Partial<Face> = {}) => {
      const f = mk(k, pp.map(([zz, y]) => [x, y, zz] as V), [Math.sign(x), 0, 0], fill, { sw: 0.3, ...o });
      if (f) { f.z = z; out.push(f); }
      return f;
    };
    const band = (X: number, y0: number, y1: number, inset: number): [number, number][] => {
      const z0 = flankZ(X, y0) - inset, z1 = flankZ(X, y1) - inset;
      return [[-z0, y0], [z0, y0], [z1, y1], [-z1, y1]];
    };
    // the tail: the light bar across its top (a dark housing, the lamp, a bright core), the dark diffuser panel at its foot
    onCap("tlh", -200.4, band(-200, -69, -61.5, 3), () => "#020C1D", tailZ + EPS);
    onCap("tll", -200.6, band(-200, -67, -63.2, 5), () => "#9DC4F0", tailZ + 2 * EPS, { sw: 0 });
    onCap("tlc", -200.7, band(-200, -65.6, -64.6, 8), () => "#F2F8FF", tailZ + 3 * EPS, { sw: 0 });
    {
      const R = ctrl(-200), y0 = -40, pp: [number, number][] = [];
      const zAt = flankZ(-200, y0) - 2;
      pp.push([-zAt, y0], [zAt, y0]);
      for (let i = 5; i >= 1; i--) if (R[i][1] > y0) pp.push([R[i][0] - 2, R[i][1] - (i === 1 ? 0.2 : 0)]);
      for (let i = 1; i <= 5; i++) if (R[i][1] > y0) pp.push([-(R[i][0] - 2), R[i][1] - (i === 1 ? 0.2 : 0)]);
      onCap("dfp", -200.4, pp, (wn) => mix("#020A18", "#25466F", L(wn) * 0.8), tailZ + EPS);
      onCap("dfe", -200.6, [[-zAt, y0 - 0.6], [zAt, y0 - 0.6], [zAt, y0 + 0.5], [-zAt, y0 + 0.5]], lit(0.3), tailZ + 2 * EPS, { sw: 0, op: 0.6 });
    }
    // the nose: the light bar across its top edge, the lower intake with two slats
    onCap("flh", 200.4, band(200, -51.5, -46.5, 3), () => "#020C1D", noseZ + EPS);
    onCap("fll", 200.6, band(200, -50.2, -47.8, 5), () => "#F2F8FF", noseZ + 2 * EPS, { sw: 0 });
    onCap("ni", 200.4, [[-34, -36], [34, -36], [38, -28], [-38, -28]], () => "#020B1A", noseZ + EPS);
    for (let q = 0; q < 2; q++) {
      const y = -33.4 + q * 2.8, wq = 34 + (q + 0.6) * 1.4;
      onCap(`ns${q}`, 200.6, [[-wq, y - 0.6], [wq, y - 0.6], [wq, y + 0.6], [-wq, y + 0.6]], (wn) => bramp(0.4 + 0.6 * L(wn)), noseZ + 2 * EPS, { sw: 0 });
    }
  }

  // ══ THE UNDERSIDE ══
  {
    const sees = floorSeen(-140, 140, 1) || floorSeen(-140, 140, -1);
    const fz = Math.max(hostZ(-200, 200, 0, 1, 1), hostZ(-200, 200, 0, 1, -1));
    let ord = 0;
    const uz = (natural: number) => (sees ? fz + (5 + (ord++) * 0.002) * EPS : natural);
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
      for (const [nm, pp, n] of F) { const f = mk(`${k}${nm}`, pp, n, fill, { sw: 0.5 }); if (f) { f.z = z + (nm === "b" ? 0.01 : 0); out.push(f); } }
    };
    const bar = (k: string, a: V, b: V, w: number, h: number, fill: (wn: V) => string) => {
      const d = nrm(sub(b, a)), up: V = [0, -1, 0], sd = nrm(crs(d, up)), u2 = nrm(crs(sd, d));
      const c = (q: V, i: number): V => add(q, add(scl(sd, (i & 1 ? 1 : -1) * w / 2), scl(u2, (i & 2 ? 1 : -1) * h / 2)));
      const A = [0, 1, 2, 3].map((i) => c(a, i)), B = [0, 1, 2, 3].map((i) => c(b, i));
      const ctr = scl(add(a, b), 0.5), z = uz(depthL(ctr));
      ([[0, 1], [1, 3], [3, 2], [2, 0]] as [number, number][]).forEach(([i0, i1], q) => {
        const pp = [A[i0], A[i1], B[i1], B[i0]], n = newell(pp, ctr);
        if (!n) return;
        const f = mk(`${k}${q}`, pp, n, fill, { sw: 0.4 });
        if (f) { f.z = z; out.push(f); }
      });
    };
    const fy = -19 + 0.12;
    for (const x of [-160, -92, 86, 104, 168]) {
      const zW = ctrl(x)[1][0] - 2, yb = ctrl(x)[0][1] + 0.12;
      const f = mk(`fs${x}`, [[x - 0.6, yb, -zW], [x + 0.6, yb, -zW], [x + 0.6, yb, zW], [x - 0.6, yb, zW]], [0, 1, 0], () => "#020A18", { sw: 0, op: 0.85 });
      if (f) { f.z = uz(f.z); out.push(f); }
    }
    ubox("bp", -86, 80, -19, -15.6, -64, 64, under);
    for (let q = 0; q < 6; q++) { const z = -45 + q * 18; ubox(`br${q}`, -78, 72, -15.6, -14.4, z - 1.3, z + 1.3, underLite); }
    if (lod >= 2) {
      const bolts: [number, number][] = [];
      for (let x = -80; x <= 74; x += 22) bolts.push([x, 60], [x, -60]);
      bolts.forEach(([x, z], q) => {
        const pp: V[] = Array.from({ length: 6 }, (_, a) => { const g = (a / 6) * Math.PI * 2 + 0.3; return [x + 1.7 * Math.cos(g), -15.5, z + 1.7 * Math.sin(g)] as V; });
        const f = mk(`bo${q}`, pp, [0, 1, 0], underLite, { sw: 0.2 });
        if (f) { f.z = uz(f.z) + 0.01; out.push(f); }
      });
    }
    void fy;
    for (const [ax, hw, rr] of [[132, 34, 6.2], [-130, 38, 7.0]] as [number, number, number][]) {
      ubox(`mp${ax}`, ax - 20, ax + 20, -19, -16.5, -hw, hw, under);
      const prof: [number, number][] = [[-rr, -16.5], [-rr, -14.4], [-rr * 0.7, -11.6], [rr * 0.7, -11.6], [rr, -14.4], [rr, -16.5]];
      const zc = hw - 8, cz = uz(depthL([ax, -14, 0]));
      for (let q = 0; q < prof.length - 1; q++) {
        const [a, b] = [prof[q], prof[q + 1]];
        const pp: V[] = [[ax + a[0], a[1], -zc], [ax + b[0], b[1], -zc], [ax + b[0], b[1], zc], [ax + a[0], a[1], zc]];
        const n = newell(pp, [ax, -16.5, 0]);
        if (!n) continue;
        const f = mk(`mc${ax}${q}`, pp, n, underLite, { sw: 0.5 });
        if (f) { f.z = cz + 0.02; out.push(f); }
      }
      for (const s of [1, -1]) {
        const f = mk(`me${ax}${s}`, prof.map(([px, py]) => [ax + px, py, s * zc] as V), [0, 0, s], under, { sw: 0.4 });
        if (f) { f.z = cz + 0.02; out.push(f); }
        const knuckle: V = [ax, -18.2, s * 58];
        bar(`aa${ax}${s}`, [ax - 16, -15, s * (hw - 2)], knuckle, 3.4, 2.4, (wn) => bramp(0.1 + 0.7 * L(wn)));
        bar(`ab${ax}${s}`, [ax + 14, -15, s * (hw - 2)], knuckle, 3.4, 2.4, (wn) => bramp(0.1 + 0.7 * L(wn)));
      }
    }
    for (const fzc of [-36, -12, 12, 36]) {
      const top: [number, number][] = [];
      for (let x = -165; x >= -198; x -= 6) top.push([x, Math.min(ctrl(x)[0][1] + 0.3, -19.9)]);
      top.push([-198, ctrl(-198)[0][1] + 0.3]);
      const bot = -19.8;
      for (const sd of [1, -1]) {
        const pp: V[] = [...top.map(([x, y]) => [x, y, fzc + sd * 1.2] as V), [-198, bot, fzc + sd * 1.2], [-165, bot, fzc + sd * 1.2]];
        const f = mk(`df${fzc}${sd}`, pp, [0, 0, sd], (wn) => mix("#020B18", "#2F5F99", L(wn) * 0.9), { sw: 0.4 });
        if (f) { f.z = uz(depthL([-180, -22, fzc])); out.push(f); }
      }
    }
    // the front splitter: a dark blade under the nose, standing a little proud of it
    {
      const xs = [172, 184, 194, 200, 202.5];
      const yTop = (x: number) => ctrl(Math.min(200, x))[0][1] + 0.2;
      const zW = (x: number) => Math.min(72, ctrl(Math.min(200, x))[1][0] + 3);
      const topP: V[] = [...xs.map((x) => [x, yTop(x), zW(x)] as V), ...xs.slice().reverse().map((x) => [x, yTop(x), -zW(x)] as V)];
      const botP = topP.map((v) => [v[0], v[1] + 2.4, v[2]] as V);
      const z = sees ? fz + 5 * EPS : depthL([190, -21, 0]);
      const fb = mk("spb", botP, [0, 1, 0], (wn) => mix("#020B18", "#2F5F99", L(wn)), { sw: 0.4 });
      if (fb) { fb.z = z; out.push(fb); }
      const X = 202.5, fr: V[] = [[X, yTop(X), zW(X)], [X, yTop(X), -zW(X)], [X, yTop(X) + 2.4, -zW(X)], [X, yTop(X) + 2.4, zW(X)]];
      const ff = mk("spf", fr, [1, 0, 0], (wn) => mix("#13355F", "#BFD3EC", L(wn)), { sw: 0.3 });
      if (ff) { ff.z = Math.max(z, noseZ + 3 * EPS); out.push(ff); }
    }
  }

  // ══ THE WHEELS: a real tyre and an AERO COVER, each wheel ONE unit, clipped to where a real wheel can be seen ══
  const R = CB.wheelR, NW = lod >= 2 ? 40 : lod ? 30 : 22;
  for (const wx of CB.wheelX) for (const s of [1, -1] as const) {
    const sk = `w${wx}${s > 0 ? "L" : "R"}`;
    const cy = -R, wzc = s * CB.wheelZ, zo = wzc + s * 13;
    const ZA = (dzz: number) => zo - s * dzz;
    const at = (rr: number, a: number, z: number): V => [wx + rr * Math.cos(a), cy + rr * Math.sin(a), z];
    const ctr: V = [wx, cy, wzc];
    const list: Face[] = [];
    const W = (k: string, pp: V[], n: V | null, fill: (wn: V) => string, o: Partial<Face> = {}) => {
      const nn = n ?? newell(pp, ctr);
      if (!nn) return;
      const f = mk(`${sk}${k}`, pp, nn, fill, { sw: 0.5, ...o }, false);
      if (f) list.push(f);
    };
    const disc = (rad: number, z: number, N = NW, a0 = 0): V[] => Array.from({ length: N }, (_, i) => at(rad, a0 + (i / N) * Math.PI * 2, z));
    type Pr = [number, number];
    const lathe = (k: string, prof: Pr[], fill: (wn: V, band: number, seg: number) => string, rotWith = true) => {
      for (let b = 0; b < prof.length - 1; b++) for (let i = 0; i < NW; i++) {
        const a0 = (rotWith ? spin : 0) + (i / NW) * Math.PI * 2, a1 = a0 + (Math.PI * 2) / NW;
        const [ra, da] = prof[b], [rb, db] = prof[b + 1];
        W(`${k}${b}_${i}`, [at(ra, a0, ZA(da)), at(ra, a1, ZA(da)), at(rb, a1, ZA(db)), at(rb, a0, ZA(db))], null, (wn) => fill(wn, b, i));
      }
    };
    const tread: Pr[] = lod >= 2
      ? [[0.965 * R, 0.5], [R, 2.6], [R, 8.6], [0.982 * R, 9.0], [0.982 * R, 10.0], [R, 10.4], [R, 15.6], [0.982 * R, 16.0], [0.982 * R, 17.0], [R, 17.4], [R, 23.4], [0.965 * R, 25.5]]
      : [[0.965 * R, 0.5], [R, 2.6], [R, 23.4], [0.965 * R, 25.5]];
    lathe("t", tread, (wn, b, i) => {
      const base = rubber(wn);
      if (lod < 2) return base;
      const groove = b === 3 || b === 7, outerLane = b === 1 || b === 9, block = outerLane && i % 2 === 0;
      const c = groove ? mix(base, "#000000", 0.55) : block ? mix(base, "#7E95B3", 0.16) : outerLane ? mix(base, "#000000", 0.25) : base;
      return mix(c, mix(base, "#000000", outerLane ? 0.05 : 0), blur);
    });
    W("in", disc(0.84 * R, ZA(25.6), NW), [0, 0, -s], () => "#030912");
    lathe("is", [[0.965 * R, 25.5], [0.9 * R, 26], [0.82 * R, 25.4]], (wn) => mix(rubber(wn), "#000000", 0.15), false);
    // the outer sidewall's base disc — the measured shape
    W("sw", disc(0.97 * R, ZA(0.15), NW), [0, 0, s], (wn) => mix("#040A14", "#1C2C44", L(wn) * 0.8), { skip: false });
    const outerSeen = seen(r, disc(0.9 * R, zo, 12).map((q) => W3(q)), nrm(ap(m, [0, 0, s]))).ok;
    if (outerSeen) {
      // ── the AERO COVER: a satin dish (its rim flush with the lip, sloping in toward a raised hub boss), five slots and five nuts that turn ──
      lathe("cv", [[0.8 * R, 1.0], [0.62 * R, 2.4], [0.4 * R, 3.0], [0.24 * R, 2.6], [0.17 * R, 1.9]], (wn, b) => (b === 3 ? mix("#2D5A92", "#DCE8F6", L(wn)) : cover(wn)), false);
      W("cb", disc(0.17 * R, ZA(1.9), 20), [0, 0, s], (wn) => mix("#0B3F82", "#EAF2FB", L(wn)), { sw: 0.3 });
      if (blur < 0.98) for (let q = 0; q < 5; q++) {
        const a0 = spin + (q / 5) * Math.PI * 2 + 0.25, a1 = a0 + 0.32;
        const quadS: V[] = [at(0.46 * R, a0, ZA(2.8)), at(0.68 * R, a0 + 0.14, ZA(1.9)), at(0.68 * R, a1 + 0.14, ZA(1.9)), at(0.46 * R, a1, ZA(2.8))];
        W(`sl${q}`, quadS.map((v) => add(v, [0, 0, s * 0.15])), [0, 0, s], () => "#0B2A55", { sw: 0.3, op: 1 - blur });
        const ta = spin + (q / 5) * Math.PI * 2, c = at(0.3 * R, ta, ZA(2.55));
        W(`nt${q}`, Array.from({ length: 6 }, (_, h) => add(c, [1.3 * Math.cos((h / 6) * Math.PI * 2 + ta), 1.3 * Math.sin((h / 6) * Math.PI * 2 + ta), s * 0.25])), [0, 0, s],
          (wn) => mix("#0A2240", "#9FBCE0", L(wn)), { sw: 0.3, op: 1 - blur });
      }
      if (blur > 0.01) W("blr", disc(0.72 * R, ZA(1.6), NW), [0, 0, s], () => "url(#cbBlur)", { op: blur * 0.6, sw: 0 });
      lathe("lp", [[0.78 * R, 1.2], [0.8 * R, 0.6], [0.83 * R, 0.5]], (wn) => bramp(0.4 + 0.65 * L(wn)), false);
      lathe("os", [[0.83 * R, 0.5], [0.9 * R, 0], [0.965 * R, 0.5]], (wn) => mix("#03080F", "#2C3F5A", L(wn) * 0.85), false);
    }
    // ── where the unit sorts, and the region a real wheel can be seen in (its arch, below the sill, over the floor) ──
    let zu: number;
    if (outerSeen) zu = hostZ(wx - ARCH_R + 0.5, wx + ARCH_R - 0.5, 0, 9, s) + 8 * EPS;
    else if (floorSeen(wx - 30, wx + 30, s)) zu = hostZ(wx - 46, wx + 46, 0, 1, s) + 8 * EPS;
    else zu = depthOf(r, W3(ctr)) - 70 * sc;
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
        const a = Math.PI + (i / N) * Math.PI, x = wx + (ARCH_R + 0.3) * Math.cos(a), y = -CB.wheelR + (ARCH_R + 0.3) * Math.sin(a);
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

/** ★ its soft footprint shadow on a floor at `floorY` (paint before the car) */
export const cybercabShadow = (r: Rig, p: CabPose, floorY: number, key = "cb"): Face[] => {
  const s = p.scale ?? 1, h = Math.max(0, floorY - p.y), k = Math.max(0, 1 - h / (420 * s));
  if (k <= 0.02) return [];
  const yaw = ((p.yaw ?? 0) * Math.PI) / 180, hx = (CB.half * Math.abs(Math.cos(yaw)) + 88 * Math.abs(Math.sin(yaw))) * s, hz = (88 * Math.abs(Math.cos(yaw)) + CB.half * Math.abs(Math.sin(yaw))) * s;
  return contactShadow(r, `${key}sh`, p.x - hx, p.x + hx, p.z - hz, p.z + hz, floorY, 1.5 * k * k * (p.op ?? 1), 22 * s);
};
