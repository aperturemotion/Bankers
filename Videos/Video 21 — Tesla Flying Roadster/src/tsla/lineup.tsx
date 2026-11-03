import React from "react";
import { type Rig } from "./rig";
import { P, quad, hexa, lightOf, mix, depthOf, contactShadow, type Face, type V } from "./p3";
import { dirWorld, type Pose } from "./roadster";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// ★ THE LINE-UP — the five Teslas the Roadster hopped over (TechCrunch: a Cybercab, a Cybertruck, a Tesla Semi, a Model Y and a Model 3).
// REVISION 1 (Timur, 2026-10-29: "for the rest of the cars as well, that stand there, make them more realistic … add that metallic sort of
// texture … the cars at 47 seconds, they actually look nice. Maybe take some motivation from them, except make them 3D"; STYLE §16
// 2026-10-29: a 3-D vehicle is built to a car's real detail in the Bankers metallic finish).
// Each car is a real-depth LOFT (p3's projection and light) with its parts drawn ON the surface, never as flat stand-ins:
//   · THE BODY: stations every 8 units along the car (published sizes, 100 units = 1 m), each a closed section with CREASES kept crisp —
//     the rocker (sill), the shoulder line and the beltline — and smooth curves between them ("more rectangles", not one blob). The
//     Cybertruck's sections are straight-sided: flat stainless planes.
//   · THE FINISH: the Bankers satin metal in the logo blue — every facet lit by its own normal against the one key (upper left) PLUS a
//     studio reflection (a dark floor, a crisp horizon, a bright overhead softbox) read off the facet's reflected view ray, so the sheen
//     runs CONTINUOUSLY across a panel and breaks crisply at a crease (the shoulder line catches the sky, the tucked lower flank the
//     floor). No per-facet chrome, fall or gloss overlay: nothing draws a facet grid.
//   · SURFACE DETAIL as DECALS: polygons laid in the loft's own (x along the car, t round the section) coordinates, clipped to each facet
//     and painted right after it, so a window or a door cut follows the surface, sorts with it and never floats: the glass roof and the
//     windscreen with their black frit frames and a reflection band, the side glass split by the B-pillar, door cuts with a lit edge,
//     flush handles, the frunk and boot shut lines, head and tail lamps with an inner lit strip, the wheel arches with their lip.
//   · WHEELS (they TURN by `spin`; with `spinBlur` the spokes fade into a blurred disc rather than strobe): a tyre with its tread band
//     (blocks that turn) and a sidewall bead, a lit rim lip, a dark barrel, the brake rotor and its caliper behind the spokes, then the
//     model's own wheel: ten twin spokes (Model 3 / Y), aero covers (Cybercab), the hexagonal covers (Cybertruck), steel disc wheels with
//     hand holes and ten lugs (Semi); a hub, lug nuts, a centre cap.
//   · PER MODEL: Model 3 (low fastback, boot), Model Y (taller, hatch, quarter glass), Cybercab (teardrop, ONE big door a side, no rear
//     window, no mirrors, full-width light bars), Cybertruck (flat panels, raked A-pillar glass, the tonneau seam, angular arch flares,
//     the front light bar), Semi tractor (a tall cab with a wraparound windscreen, a door with steps, side fairings, cab extenders, frame
//     rails, the fifth wheel, tandem DUAL drive wheels under quarter fenders, mud flaps).
// Each takes the Roadster's Pose (roll → pitch → yaw → move), so the line-up can drive off. The API and every dimension are unchanged.
// Local frame: x along the car (nose +x), y DOWN (ground y = 0), z across.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export type CarModel = "cybercab" | "cybertruck" | "semi" | "modely" | "model3";
type Spec = {
  /** the top line (roof, glass, hood, tail) along the car: [x, y] from the tail to the nose */
  top: [number, number][];
  /** the beltline height (where the greenhouse starts); the flank below it */
  belt: number;
  /** the floor's height and the half-width */
  floor: number; hw: number;
  /** how much the greenhouse leans in at the roof (1 = straight up) */
  tumble: number;
  /** x-ranges: the side windows; the windshield; the back glass */
  side: [number, number]; ws: [number, number]; back?: [number, number];
  wheels: { x: number; r: number }[];
  /** a light bar across the nose and the tail (y0, y1) */
  bar?: [number, number];
  /** sharp, flat panels (the Cybertruck) */
  flat?: boolean;
  /** a top line with a near-vertical step (the Semi's cab back): kept straight between its points */
  stepped?: boolean;
};
export const MODELS: Record<CarModel, Spec> = {
  // Model 3 — 4.72 × 1.85 × 1.44 m: a low fastback sedan
  model3: { top: [[-236, -80], [-214, -94], [-160, -102], [-92, -140], [-20, -144], [44, -141], [124, -102], [196, -86], [226, -72], [236, -50]],
    belt: -98, floor: -18, hw: 92, tumble: 0.78, side: [-150, 112], ws: [44, 124], back: [-160, -92], wheels: [{ x: -140, r: 34 }, { x: 150, r: 34 }] },
  // Model Y — 4.75 × 1.92 × 1.62 m: the taller crossover with its hatch
  modely: { top: [[-237, -84], [-228, -112], [-196, -140], [-120, -158], [-20, -162], [46, -157], [128, -110], [198, -92], [228, -76], [237, -52]],
    belt: -104, floor: -20, hw: 96, tumble: 0.8, side: [-188, 118], ws: [46, 128], back: [-228, -196], wheels: [{ x: -142, r: 37 }, { x: 150, r: 37 }] },
  // Cybertruck — 5.68 × 2.20 × 1.79 m: the flat-paneled wedge, its roof one straight line to the apex
  cybertruck: { top: [[-284, -112], [-140, -146], [12, -179], [118, -132], [200, -116], [284, -102]],
    belt: -112, floor: -36, hw: 110, tumble: 0.86, side: [-120, 100], ws: [12, 118], wheels: [{ x: -186, r: 45 }, { x: 186, r: 45 }], bar: [-104, -97], flat: true },
  // Semi (the tractor, no trailer) — ~6.4 × 2.5 × 4.0 m: the tall, rounded cab over a long frame with its fifth wheel behind
  semi: { top: [[-320, -114], [-110, -120], [-96, -382], [-70, -398], [90, -402], [176, -374], [262, -270], [312, -200], [318, -112]],
    belt: -296, floor: -40, hw: 125, tumble: 0.9, side: [-40, 150], ws: [176, 262], wheels: [{ x: -236, r: 52 }, { x: -122, r: 52 }, { x: 196, r: 52 }], stepped: true },
  // Cybercab — ~3.6 × 2.0 × 1.2 m: the two-seat robotaxi, a smooth teardrop with no steering wheel inside
  cybercab: { top: [[-182, -56], [-168, -84], [-122, -108], [-30, -122], [60, -116], [124, -82], [170, -66], [182, -44]],
    belt: -84, floor: -22, hw: 100, tumble: 0.74, side: [-116, 112], ws: [60, 124], back: [-168, -122], wheels: [{ x: -110, r: 36 }, { x: 112, r: 36 }], bar: [-62, -57] },
};

/** the model's length / width (for spacing a row) */
export const lenOf = (m: CarModel) => { const t = MODELS[m].top; return t[t.length - 1][0] - t[0][0]; };
export const widthOf = (m: CarModel) => MODELS[m].hw * 2;

// ── small maths ──
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const sstep = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const nrm = (a: V): V => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const crs = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const lv = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
type XY = [number, number];

// ══ THE FINISH ══════════════════════════════════════════════════════════════════════════════
type Stops = [number, string][];
const ramp = (s: Stops, t: number) => {
  const u = clamp01(t);
  for (let i = 0; i < s.length - 1; i++) if (u <= s[i + 1][0]) return mix(s[i][1], s[i + 1][1], (u - s[i][0]) / (s[i + 1][0] - s[i][0]));
  return s[s.length - 1][1];
};
/** a direction in the rig's view (x right, y down, z toward the camera) — p3's own turn */
const vw = (r: Rig, [nx, ny, nz]: V) => {
  const b = (r.yaw * Math.PI) / 180, a = (r.pitch * Math.PI) / 180;
  const x1 = nx * Math.cos(b) + nz * Math.sin(b), z1 = -nx * Math.sin(b) + nz * Math.cos(b);
  return { x: x1, y: ny * Math.cos(a) - z1 * Math.sin(a), z: ny * Math.sin(a) + z1 * Math.cos(a) };
};
/** ★ THE STUDIO REFLECTION: what a satin panel mirrors along its reflected view ray — a dark floor, a CRISP horizon, a bright overhead
 *  softbox, brightest toward the key (upper left). It is a function of the facet's normal, so it runs continuously across a panel and
 *  breaks crisply only where the surface does (a crease). */
const envOf = (r: Rig, n: V) => {
  const v = vw(r, n), up = -2 * v.z * v.y, sx = 2 * v.z * v.x;
  return clamp01(0.05 + 0.2 * sstep(-0.55, 0.02, up) + 0.46 * sstep(-0.02, 0.22, up) + 0.24 * sstep(0.3, 0.9, up) * (0.4 + 0.6 * sstep(0.25, -0.55, sx)));
};
/** the house metal in the logo blue's family: deep blue turned from the key → the pale lit face; the line-up stays BLUE (the Roadster,
 *  pale steel, is the brightest object of the hook) */
const BODY: Stops = [[0, "#011A38"], [0.2, "#06305F"], [0.4, "#174C8E"], [0.58, "#2F6CB4"], [0.74, "#6FA3DF"], [0.88, "#B3CEEF"], [1, "#E6EFFA"]];
const GLASS: Stops = [[0, "#010814"], [0.35, "#041A36"], [0.6, "#0E3A6E"], [0.82, "#4677B6"], [1, "#A6C4E8"]];
const TRIM: Stops = [[0, "#010610"], [0.55, "#071A33"], [0.8, "#18375F"], [1, "#5679A6"]];
const TYRE: Stops = [[0, "#02050B"], [0.6, "#0B1626"], [1, "#2E3F57"]];
/** glass mirrors the same studio, softened (its curvature is tighter than a panel's, and a crisp horizon stepped from facet to facet) */
const envSoft = (r: Rig, n: V) => {
  const v = vw(r, n), up = -2 * v.z * v.y, sx = 2 * v.z * v.x;
  return clamp01(0.06 + 0.62 * sstep(-0.35, 0.55, up) + 0.22 * sstep(0.35, 0.95, up) * (0.4 + 0.6 * sstep(0.25, -0.55, sx)));
};
const paintOf = (r: Rig, n: V, lift = 0) => ramp(BODY, 0.5 * lightOf(r, n) + 0.5 * envOf(r, n) + lift);
const glassOf = (r: Rig, n: V, lift = 0) => ramp(GLASS, 0.22 * lightOf(r, n) + 0.74 * envSoft(r, n) + lift);
const trimOf = (r: Rig, n: V, lift = 0) => ramp(TRIM, 0.35 * lightOf(r, n) + 0.55 * envOf(r, n) + lift);
const tyreOf = (r: Rig, n: V, lift = 0) => ramp(TYRE, 0.75 * lightOf(r, n) + 0.12 * envOf(r, n) + lift);
const underOf = (r: Rig, n: V) => mix("#020B18", "#123660", lightOf(r, n) * 0.55);

/** the decal finishes (by name), each from the facet's world normal and the facet's own colour */
type FillKey = "glass" | "gloss" | "trim" | "dark" | "lit" | "arch" | "lampH" | "lampHi" | "lampT" | "lampTi" | "recess" | "clad" | "band";
const fillOf = (r: Rig, key: FillKey, n: V, base: string): string => {
  switch (key) {
    case "glass": return glassOf(r, n);
    case "gloss": return mix(glassOf(r, n, 0.12), "#D6E5F7", 0.45);
    case "trim": return trimOf(r, n);
    case "dark": return mix(base, "#000A1A", 0.72);
    case "lit": return mix(base, "#FFFFFF", 0.5);
    case "arch": return mix("#01060E", "#0B1D35", lightOf(r, n) * 0.5);
    case "lampH": return trimOf(r, n, 0.12);
    case "lampHi": return mix("#DCE8F6", "#FFFFFF", lightOf(r, n));
    case "lampT": return mix("#040E1E", "#102F57", lightOf(r, n));
    case "lampTi": return mix("#4D8ED9", "#B3CEEF", lightOf(r, n));
    case "recess": return mix(base, "#000814", 0.6);
    case "clad": return trimOf(r, n, 0.06);
    case "band": return mix(base, "#011A38", 0.25);
  }
};

// ══ THE BODY: sections and stations ═════════════════════════════════════════════════════════════
/** `ends`: how the plan rounds in at the nose and the tail — [share of the length it takes, how far the width pulls in] for each */
type Body = { top: [number, number][]; belt: number; floor: number; hw: number; tumble: number; flat?: boolean; shDrop?: number; roofR?: number; ends?: { nose: [number, number]; tail: [number, number] } };
/** the Semi's CAB as a body of its own (the frame, the fifth wheel and the drive axles behind it are built as parts) */
const SEMI_CAB: Body = { top: [[-80, -384], [-64, -398], [-30, -402], [90, -404], [176, -376], [262, -272], [312, -200], [318, -112]],
  belt: -296, floor: -40, hw: 125, tumble: 0.9, shDrop: 18, roofR: 12, ends: { nose: [0.14, 0.24], tail: [0.03, 0.06] } };
const bodyOf = (m: CarModel): Body => (m === "semi" ? SEMI_CAB : MODELS[m]);

/** the top line's height at x (Catmull–Rom on the heights; straight for the flat-paneled Cybertruck) */
const topAt = (B: Body, x: number) => {
  const t = B.top;
  if (x <= t[0][0]) return t[0][1];
  for (let i = 0; i < t.length - 1; i++) if (x <= t[i + 1][0]) {
    const k = (x - t[i][0]) / Math.max(1e-6, t[i + 1][0] - t[i][0]);
    if (B.flat) return t[i][1] + (t[i + 1][1] - t[i][1]) * k;
    const a = t[Math.max(0, i - 1)][1], b = t[i][1], c = t[i + 1][1], d = t[Math.min(t.length - 1, i + 2)][1], k2 = k * k, k3 = k2 * k;
    return 0.5 * (2 * b + (-a + c) * k + (2 * a - 5 * b + 4 * c - d) * k2 + (-a + 3 * b - 3 * c + d) * k3);
  }
  return t[t.length - 1][1];
};

/** a section's control points (z, y), floor centre → roof centre. Smooth bodies: floor centre, floor edge, rocker foot, SILL (crease),
 *  lower flank, SHOULDER (crease, the widest line), BELT (crease, where the glass starts), the greenhouse leaning in, the roof edge, the
 *  roof crown, the roof centre. Flat bodies: floor, floor edge, sill chamfer, belt, roof edge, roof centre. */
const ringCtl = (B: Body, x: number, x0: number, x1: number): XY[] => {
  const top = topAt(B, x), gh = B.belt - top, beltY = Math.max(top + 4, B.belt);
  const en = B.ends ?? (B.flat ? { nose: [0.08, 0.12], tail: [0.08, 0.12] } : { nose: [0.08, 0.2], tail: [0.08, 0.2] });
  const eN = clamp01((x1 - x) / ((x1 - x0) * en.nose[0])), eT = clamp01((x - x0) / ((x1 - x0) * en.tail[0]));
  const fb = B.floor;
  if (B.flat) {
    // (a straight chamfer at the ends: the Cybertruck's plan is faceted, never rounded)
    const hw = B.hw * (1 - en.nose[1] * (1 - eN)) * (1 - en.tail[1] * (1 - eT)), rh = hw * lerp(0.97, B.tumble, clamp01(gh / 20));
    return [[0, fb], [hw - 7, fb], [hw, fb - 8], [hw, beltY], [rh, top + 2], [0, top]];
  }
  const hw = B.hw * (1 - en.nose[1] * (1 - Math.sqrt(eN))) * (1 - en.tail[1] * (1 - Math.sqrt(eT))), rh = hw * lerp(0.95, B.tumble, clamp01(gh / 24));
  const sill = fb - 12, sh = Math.min(beltY + (B.shDrop ?? 14), sill - 3), R = B.roofR ?? 4;
  // (the lower flank TUCKS UNDER from the shoulder to the sill, so it turns from the overhead light into the floor's dark: the lit
  // shoulder, the reflected band and the dark sill of the 2-D showroom cars, in real depth)
  const pts: XY[] = [[0, fb], [hw - 20, fb], [hw - 9, fb - 3], [hw - 5.5, sill], [hw - 0.5, (sill + sh) / 2 + 3], [hw + 2, sh], [hw - 1.5, beltY],
    [lerp(hw - 1, rh, 0.6), lerp(beltY, top + R, 0.55)], [rh, top + R], [rh * 0.55, top + R * 0.12], [0, top]];
  // (keep the flank's heights in order: a low nose squeezes them together)
  for (let i = 3; i <= 8; i++) pts[i][1] = Math.min(pts[i][1], pts[i - 1][1] - 0.3);
  return pts;
};
const CREASE = new Set([3, 5, 6]);
const SUB = 3;
/** the section as a curve: Catmull–Rom between the control points, one-sided at the creases (so the sill, the shoulder and the belt
 *  stay crisp lines while the panels between them curve) */
const smoothHalf = (c: XY[]): XY[] => {
  const out: XY[] = [], n = c.length;
  for (let i = 0; i < n - 1; i++) {
    const b = c[i], cc = c[i + 1];
    const a: XY = i === 0 || CREASE.has(i) ? [2 * b[0] - cc[0], 2 * b[1] - cc[1]] : c[i - 1];
    const d: XY = i + 1 === n - 1 || CREASE.has(i + 1) ? [2 * cc[0] - b[0], 2 * cc[1] - b[1]] : c[i + 2];
    for (let s = 0; s < SUB; s++) {
      const t = s / SUB, t2 = t * t, t3 = t2 * t;
      const cr = (k: 0 | 1) => 0.5 * (2 * b[k] + (-a[k] + cc[k]) * t + (2 * a[k] - 5 * b[k] + 4 * cc[k] - d[k]) * t2 + (-a[k] + 3 * b[k] - 3 * cc[k] + d[k]) * t3);
      out.push([cr(0), cr(1)]);
    }
  }
  out.push(c[n - 1]);
  return out;
};
type LM = { fe: number; sill: number; sh: number; belt: number; re: number; top: number };
type Geo = { B: Body; xs: number[]; half: XY[][]; H: number; lm: LM };
const GEO = new Map<Body, Geo>();
const geom = (B: Body): Geo => {
  const hit = GEO.get(B);
  if (hit) return hit;
  const x0 = B.top[0][0], x1 = B.top[B.top.length - 1][0];
  const set = new Set<number>(B.top.map((q) => q[0]));
  for (let x = x0; x < x1; x += 8) set.add(Math.round(x));
  const xs = [...set].sort((a, b) => a - b);
  const half = xs.map((x) => (B.flat ? ringCtl(B, x, x0, x1) : smoothHalf(ringCtl(B, x, x0, x1))));
  const k = B.flat ? 1 : SUB;
  const lm: LM = B.flat ? { fe: 1, sill: 2, sh: 3, belt: 3, re: 4, top: 5 } : { fe: k, sill: 3 * k, sh: 5 * k, belt: 6 * k, re: 8 * k, top: 10 * k };
  const g: Geo = { B, xs, half, H: half[0].length, lm };
  GEO.set(B, g);
  return g;
};
/** the station span holding x and the fraction along it */
const spanAt = (g: Geo, x: number) => {
  const xs = g.xs;
  let j = 0;
  while (j < xs.length - 2 && x > xs[j + 1]) j++;
  return { j, u: clamp01((x - xs[j]) / Math.max(1e-6, xs[j + 1] - xs[j])) };
};
/** a side-profile height y at x → the section coordinate t on the flank (floor edge … roof edge), as the facets interpolate it */
const tAt = (g: Geo, x: number, y: number) => {
  const { j, u } = spanAt(g, x), A = g.half[j], Bh = g.half[j + 1];
  const yy = (t: number) => lerp(A[t][1], Bh[t][1], u);
  const { fe, re } = g.lm;
  if (y >= yy(fe)) return fe;
  for (let t = fe; t < re; t++) {
    const ya = yy(t), yb = yy(t + 1);
    if (y <= ya && y >= yb) return t + (Math.abs(ya - yb) < 1e-6 ? 0 : (ya - y) / (ya - yb));
  }
  return re;
};

// ══ DECALS: parts drawn ON the surface, in its own (x, t) coordinates ══════════════════════════════
/** `side`: on one flank only (+1 the car's +z side, −1 the other); both when omitted */
type DSpec = { pts: XY[]; xy?: boolean; fill: FillKey; op?: number; side?: 1 | -1 };
type Decal = { pts: XY[]; fill: FillKey; op: number; side?: 1 | -1; bb: [number, number, number, number] };
type CapDecal = { pts: XY[]; fill: FillKey; op?: number; sym?: boolean };
type Detail = { decals: DSpec[]; nose: CapDecal[]; tail: CapDecal[] };

const circ = (cx: number, cy: number, R: number, a0: number, a1: number, n = 40): XY[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + R * Math.cos(a), cy + R * Math.sin(a)] as XY; });
/** a strip of width w along a segment, in side-profile (x, y) */
const lineXY = (a: XY, b: XY, w: number, fill: FillKey, op = 1): DSpec => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, ox = (-dy / l) * w * 0.5, oy = (dx / l) * w * 0.5;
  return { xy: true, fill, op, pts: [[a[0] + ox, a[1] + oy], [b[0] + ox, b[1] + oy], [b[0] - ox, b[1] - oy], [a[0] - ox, a[1] - oy]] };
};
/** a panel gap: a dark cut with a lit edge beside it (the far lip catching the key) */
const cutXY = (a: XY, b: XY): DSpec[] => [lineXY(a, b, 1.7, "dark"), lineXY([a[0] - 1.5, a[1]], [b[0] - 1.5, b[1]], 0.9, "lit", 0.55)];
const rectXT = (x0: number, x1: number, t0: number, t1: number, fill: FillKey, op = 1): DSpec => ({ fill, op, pts: [[x0, t0], [x1, t0], [x1, t1], [x0, t1]] });
const rectXY = (x0: number, x1: number, y0: number, y1: number, fill: FillKey, op = 1): DSpec => ({ xy: true, fill, op, pts: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]] });
/** a flush door handle: the dark recess and the lit lip over it */
const handle = (x0: number, x1: number, y: number): DSpec[] => [rectXY(x0, x1, y - 1.6, y + 1.6, "recess"), rectXY(x0 + 1, x1 - 1, y - 2.4, y - 1.5, "lit", 0.7)];
/** a wheel arch: the opening (the dark liner seen above the tyre) and its rolled lip catching the light */
const archOf = (x: number, r: number): DSpec[] => {
  const R = r + 6;
  return [
    { xy: true, fill: "arch", pts: circ(x, -r, R, 0, Math.PI * 2, 48) },
    { xy: true, fill: "lit", op: 0.45, pts: [...circ(x, -r, R + 2.6, Math.PI + 0.3, Math.PI * 2 - 0.3, 30), ...circ(x, -r, R, Math.PI * 2 - 0.3, Math.PI + 0.3, 30)] },
  ];
};
/** a lamp: its dark housing and the lit inner strip (`lit` names the inner finish) */
/** a diagonal reflection band across a glass that spans both flanks' halves (edge t0 → centre t1): it continues across the centre line
 *  with the same slant, never mirrored into a chevron */
const bandAcross = (x: number, w: number, t0: number, t1: number, k = 22, op = 0.5): DSpec[] => [
  { side: 1, fill: "gloss", op, pts: [[x, t0], [x + w, t0], [x + w - k, t1], [x - k, t1]] },
  { side: -1, fill: "gloss", op, pts: [[x - k, t1], [x - k + w, t1], [x - 2 * k + w, t0], [x - 2 * k, t0]] },
];
const lampXY = (outer: XY[], inner: XY[], lit: FillKey, house: FillKey = "trim"): DSpec[] => [{ xy: true, fill: house, pts: outer }, { xy: true, fill: lit, pts: inner }];

/** ★ each model's surface detail. The numbers are side-profile positions (x, y) or section coordinates (x, t: the landmarks are named). */
const detailOf = (m: CarModel): Detail => {
  const B = bodyOf(m), g = geom(B), L = g.lm;
  const ty = (x: number, d: number) => topAt(B, x) + d;
  const S = MODELS[m];
  const d: DSpec[] = [], nose: CapDecal[] = [], tail: CapDecal[] = [];
  const hwEnd = B.hw * (B.flat ? 0.88 : m === "semi" ? 0.76 : 0.8), hwTail = m === "semi" ? B.hw * 0.94 : hwEnd;
  if (!B.flat && m !== "semi") for (const w of S.wheels) d.push(...archOf(w.x, w.r));
  const sideGlass = (trim: XY[], panes: XY[][]) => {
    d.push({ fill: "trim", pts: trim });
    for (const p of panes) {
      d.push({ fill: "glass", pts: p });
      // the reflection band along the top of each pane
      const tTop = Math.max(...p.map((q) => q[1])), xs = p.map((q) => q[0]);
      d.push({ fill: "gloss", op: 0.4, pts: [[Math.min(...xs) + 6, tTop - 0.75], [Math.max(...xs) - 10, tTop - 0.75], [Math.max(...xs) - 14, tTop - 0.35], [Math.min(...xs) + 6, tTop - 0.35]] });
    }
  };
  const canopy = (x0: number, x1: number, bands: [number, number][]) => {
    // (the glass roof: a black frit frame, the glass, the reflection bands running diagonally across it)
    d.push({ fill: "trim", pts: [[x0 - 4, L.re - 0.4], [x1 + 4, L.re - 0.4], [x1 + 5, L.top], [x0 - 5, L.top]] });
    d.push({ fill: "glass", pts: [[x0, L.re], [x1, L.re], [x1 + 1, L.top], [x0 - 1, L.top]] });
    for (const [bx, w] of bands) d.push(...bandAcross(bx, w, L.re + 0.1, L.top));
  };
  if (m === "model3" || m === "modely") {
    const Y = m === "modely", by = B.belt, fl = B.floor - 12, sh = by + 14;
    // the glass roof (windscreen → roof → back glass), the side glass
    canopy(Y ? -224 : -158, Y ? 125 : 121, Y ? [[64, 14], [94, 5], [-170, 9]] : [[66, 14], [96, 5], [-128, 8]]);
    if (Y) sideGlass([[-188, L.belt + 0.3], [118, L.belt + 0.3], [56, L.re - 0.6], [-176, L.re - 0.6]],
      [[[-2, L.belt + 0.7], [109, L.belt + 0.7], [57, L.re - 1], [-2, L.re - 1]], [[-118, L.belt + 0.7], [-10, L.belt + 0.7], [-10, L.re - 1], [-118, L.re - 1]],
        [[-183, L.belt + 0.7], [-126, L.belt + 0.7], [-126, L.re - 1], [-173, L.re - 1]]]);
    else sideGlass([[-152, L.belt + 0.3], [114, L.belt + 0.3], [52, L.re - 0.6], [-100, L.re - 0.6]],
      [[[-4, L.belt + 0.7], [105, L.belt + 0.7], [52.5, L.re - 1], [-4, L.re - 1]], [[-144, L.belt + 0.7], [-12, L.belt + 0.7], [-12, L.re - 1], [-100, L.re - 1]]]);
    // the shoulder line catching the light along its crease
    d.push(rectXT(-226, 224, L.sh - 0.22, L.sh + 0.12, "lit", 0.5));
    // door cuts (front door's leading edge, the B-pillar line, the rear door's trailing edge) and the doors' bottom gap above the sill
    const fx = Y ? 107 : 103, bx = -7, rx = Y ? -114 : -102;
    d.push(...cutXY([fx, fl - 2], [fx - 4, by + 1]), ...cutXY([bx, fl - 2], [bx - 2, by + 1]), ...cutXY([rx + 4, -S.wheels[0].r * 2 - 8], [rx - 3, by + 1]));
    d.push(rectXT(rx + 2, fx, L.sill + 0.35, L.sill + 0.6, "dark", 0.85));
    // flush handles, just under the window line
    const hy = (by + sh) / 2;
    d.push(...handle(Y ? 68 : 66, Y ? 92 : 88, hy), ...handle(Y ? -64 : -60, Y ? -40 : -38, hy));
    // the frunk and the boot / hatch shut lines on the top surfaces
    const fr0 = Y ? 136 : 132, fr1 = Y ? 226 : 224, tr0 = Y ? -234 : -230, tr1 = Y ? -204 : -164;
    d.push(rectXT(fr0, fr1, L.re + 0.9, L.re + 1.08, "dark", 0.7), rectXT(fr1 - 0.9, fr1, L.re + 0.9, L.top, "dark", 0.7), rectXT(fr0, fr0 + 0.9, L.re + 0.9, L.top, "dark", 0.7));
    d.push(rectXT(tr0, tr1, L.re + 0.9, L.re + 1.08, "dark", 0.7), rectXT(tr0, tr0 + 0.9, L.re + 0.9, L.top, "dark", 0.7));
    // head lamps: a slim sliver wrapping the front corner (the housing, its lit strip); tail lamps wrapping the rear corner
    const X1 = Y ? 237 : 236, X0 = Y ? -237 : -236;
    d.push(...lampXY([[X1 - 34, ty(X1 - 34, 7)], [X1 - 3, ty(X1 - 3, 4.5)], [X1 - 2, ty(X1 - 2, 12)], [X1 - 30, ty(X1 - 30, 14)]],
      [[X1 - 28, ty(X1 - 28, 9)], [X1 - 6, ty(X1 - 6, 6.5)], [X1 - 5, ty(X1 - 5, 9.5)], [X1 - 26, ty(X1 - 26, 11.5)]], "lampHi"));
    d.push(...lampXY([[X0 + 1, ty(X0 + 1, 5)], [X0 + 36, ty(X0 + 36, 5)], [X0 + 34, ty(X0 + 34, 12)], [X0 + 1, ty(X0 + 1, 15)]],
      [[X0 + 3, ty(X0 + 3, 7.5)], [X0 + 31, ty(X0 + 31, 7.5)], [X0 + 30, ty(X0 + 30, 9.5)], [X0 + 3, ty(X0 + 3, 11.5)]], "lampTi", "lampT"));
    const yN = topAt(B, X1), yT = topAt(B, X0);
    void yN;
    nose.push({ fill: "trim", pts: [[-hwEnd * 0.5, B.floor - 12], [hwEnd * 0.5, B.floor - 12], [hwEnd * 0.44, B.floor - 5], [-hwEnd * 0.44, B.floor - 5]] });
    tail.push({ sym: true, fill: "lampT", pts: [[hwEnd * 0.5, yT + 5], [hwEnd * 0.88, yT + 4], [hwEnd * 0.88, yT + 13], [hwEnd * 0.5, yT + 12]] },
      { sym: true, fill: "lampTi", pts: [[hwEnd * 0.54, yT + 7.5], [hwEnd * 0.84, yT + 6.5], [hwEnd * 0.84, yT + 9], [hwEnd * 0.54, yT + 10]] },
      { fill: "trim", pts: [[-hwEnd * 0.62, B.floor - 9], [hwEnd * 0.62, B.floor - 9], [hwEnd * 0.6, B.floor - 3], [-hwEnd * 0.6, B.floor - 3]] });
  }
  if (m === "cybercab") {
    const by = B.belt, fl = B.floor - 12;
    canopy(-60, 121, [[62, 14], [92, 5]]);
    sideGlass([[-108, L.belt + 0.3], [112, L.belt + 0.3], [60, L.re - 0.6], [-80, L.re - 0.6]], [[[-102, L.belt + 0.7], [104, L.belt + 0.7], [60, L.re - 1], [-78, L.re - 1]]]);
    d.push(rectXT(-176, 176, L.sh - 0.22, L.sh + 0.12, "lit", 0.5));
    // ONE big door a side (it opens up, butterfly): its front and rear cuts up to the roof, the cut across the roof's edge
    d.push(...cutXY([66, fl - 2], [62, by + 1]), ...cutXY([-64, fl - 2], [-70, by + 1]), rectXT(-70, 64, L.re - 0.45, L.re - 0.2, "dark"));
    d.push(rectXT(-64, 66, L.sill + 0.35, L.sill + 0.6, "dark", 0.85));
    // the full-width light bars across the nose and the tail (wrapping over the top)
    d.push(rectXT(173, 179, L.belt, L.top, "lampH"), rectXT(174.6, 177.4, L.belt, L.top, "lampHi"));
    d.push(rectXT(-179, -173, L.belt, L.top, "lampT"), rectXT(-177.4, -174.6, L.belt, L.top, "lampTi"));
    const yN = topAt(B, 182), yT = topAt(B, -182);
    void yN; void yT;
    nose.push({ fill: "trim", pts: [[-hwEnd * 0.4, B.floor - 10], [hwEnd * 0.4, B.floor - 10], [hwEnd * 0.36, B.floor - 4], [-hwEnd * 0.36, B.floor - 4]] });
    tail.push({ fill: "trim", pts: [[-hwEnd * 0.6, B.floor - 8], [hwEnd * 0.6, B.floor - 8], [hwEnd * 0.58, B.floor - 3], [-hwEnd * 0.58, B.floor - 3]] });
  }
  if (m === "cybertruck") {
    // the windscreen (black frame, glass, a reflection band); the side glass under the raked A-pillar, split at the B-pillar
    d.push({ fill: "trim", pts: [[8, 3.9], [121, 3.9], [121, 5], [8, 5]] }, { fill: "glass", pts: [[15, 4.08], [115, 4.08], [115, 5], [15, 5]] },
      ...bandAcross(78, 16, 4.1, 5, 18), ...bandAcross(102, 5, 4.1, 5, 18, 0.35));
    d.push({ fill: "trim", pts: [[-130, 3.08], [106, 3.08], [16, 3.93], [-104, 3.93]] },
      { fill: "glass", pts: [[-2, 3.14], [96, 3.14], [18, 3.88], [-2, 3.88]] }, { fill: "glass", pts: [[-124, 3.14], [-10, 3.14], [-10, 3.88], [-101, 3.88]] },
      { fill: "gloss", op: 0.4, pts: [[-96, 3.74], [-14, 3.74], [-14, 3.82], [-98, 3.82]] }, { fill: "gloss", op: 0.4, pts: [[2, 3.74], [30, 3.74], [24, 3.82], [2, 3.82]] });
    // the tonneau's seam where the cab's roof meets the vault's cover; the body side's crisp upper edge catching the light
    d.push(rectXT(-138, -136, 3.95, 5, "dark"), rectXT(-284, 284, 2.975, 3, "lit", 0.5));
    // the front light bar running the full width over the nose; the lower cladding along the sill
    d.push(rectXT(276, 283, 2.9, 5, "lampH"), rectXT(278, 281, 2.9, 5, "lampHi"));
    d.push(rectXT(-284, 284, 1, 2, "clad"), rectXY(-284, 284, -56, -44, "clad"));
    // door cuts (no handles: the Cybertruck has none)
    d.push(...cutXY([114, -57], [114, -111]), ...cutXY([-6, -57], [-6, -111]), ...cutXY([-117, -57], [-117, -111]));
    // the angular arch flares (dark cladding) and the octagonal openings
    for (const w of S.wheels) {
      const R0 = w.r + 6, cy = -w.r;
      d.push({ xy: true, fill: "clad", pts: [[w.x - R0 - 16, -40], [w.x - R0 - 12, cy - R0 * 0.6], [w.x - R0 * 0.5, cy - R0 - 9], [w.x + R0 * 0.5, cy - R0 - 9], [w.x + R0 + 12, cy - R0 * 0.6], [w.x + R0 + 16, -40]] });
      d.push({ xy: true, fill: "arch", pts: [[w.x - R0, -36], [w.x - R0, cy - R0 * 0.45], [w.x - R0 * 0.45, cy - R0], [w.x + R0 * 0.45, cy - R0], [w.x + R0, cy - R0 * 0.45], [w.x + R0, -36]] });
      d.push(lineXY([w.x - R0 * 0.45, cy - R0 - 8.5], [w.x + R0 * 0.45, cy - R0 - 8.5], 1.2, "lit", 0.4));
    }
    nose.push({ fill: "lampH", pts: [[-hwEnd * 0.86, -101], [hwEnd * 0.86, -101], [hwEnd * 0.86, -95], [-hwEnd * 0.86, -95]] },
      { fill: "lampHi", pts: [[-hwEnd * 0.82, -99], [hwEnd * 0.82, -99], [hwEnd * 0.82, -97], [-hwEnd * 0.82, -97]] },
      { fill: "clad", pts: [[-hwEnd, -58], [hwEnd, -58], [hwEnd, -36], [-hwEnd, -36]] });
    tail.push({ fill: "lampT", pts: [[-hwEnd * 0.9, -110], [hwEnd * 0.9, -110], [hwEnd * 0.9, -103], [-hwEnd * 0.9, -103]] },
      { fill: "lampTi", pts: [[-hwEnd * 0.86, -107.5], [hwEnd * 0.86, -107.5], [hwEnd * 0.86, -105.5], [-hwEnd * 0.86, -105.5]] },
      { fill: "clad", pts: [[-hwEnd, -62], [hwEnd, -62], [hwEnd, -36], [-hwEnd, -36]] },
      { fill: "dark", pts: [[-hwEnd * 0.98, -86], [hwEnd * 0.98, -86], [hwEnd * 0.98, -84.6], [-hwEnd * 0.98, -84.6]] });
  }
  if (m === "semi") {
    // the arches over the steer axle and over the first drive axle (at the cab's back corner)
    d.push(...archOf(196, 52), ...archOf(-122, 52));
    // the wraparound windscreen; the door glass and the fixed quarter glass forward of it
    d.push({ fill: "trim", pts: [[166, L.re - 0.5], [265, L.re - 0.5], [266, L.top], [165, L.top]] }, { fill: "glass", pts: [[172, L.re - 0.1], [259, L.re - 0.1], [260, L.top], [171, L.top]] },
      ...bandAcross(226, 16, L.re, L.top, 18), ...bandAcross(250, 5, L.re, L.top, 16, 0.35));
    sideGlass([[58, L.belt + 0.4], [236, L.belt + 0.4], [176, L.re - 0.7], [58, L.re - 0.7]],
      [[[62, L.belt + 0.8], [132, L.belt + 0.8], [132, L.re - 1.1], [62, L.re - 1.1]], [[140, L.belt + 0.8], [227, L.belt + 0.8], [177, L.re - 1.1], [140, L.re - 1.1]]]);
    d.push(rectXT(-78, 314, L.sh - 0.22, L.sh + 0.12, "lit", 0.45));
    // the door (its cuts, its bottom, a grab handle) and the two steps below it; the side fairing's seam; the sleeper's panel seam
    d.push(...cutXY([56, -128], [56, -294]), ...cutXY([136, -128], [136, -294]), lineXY([56, -128], [136, -128], 1.7, "dark"));
    d.push(lineXY([-78, -128], [56, -128], 1.6, "dark", 0.8), ...cutXY([-24, -134], [-24, -378]));
    d.push(rectXY(48, 51.5, -252, -168, "recess"), rectXY(48.5, 51, -253, -251, "lit", 0.6));
    for (const sy of [-102, -74]) d.push(rectXY(70, 124, sy, sy + 8, "recess"), rectXY(70, 124, sy + 8, sy + 9.2, "lit", 0.55));
    // the headlight strip across the nose
    d.push(rectXT(292, 302, L.belt, L.top, "lampH"), rectXT(295.5, 298.5, L.belt, L.top, "lampHi"));
    nose.push({ fill: "trim", pts: [[-hwEnd * 0.62, -94], [hwEnd * 0.62, -94], [hwEnd * 0.62, -84], [-hwEnd * 0.62, -84]] },
      { fill: "trim", pts: [[-hwEnd * 0.5, -68], [hwEnd * 0.5, -68], [hwEnd * 0.5, -58], [-hwEnd * 0.5, -58]] },
      { sym: true, fill: "lampHi", pts: [[hwEnd * 0.66, -108], [hwEnd * 0.82, -108], [hwEnd * 0.82, -103], [hwEnd * 0.66, -103]] });
    for (const zc of [-0.5, -0.17, 0.17, 0.5]) tail.push({ fill: "lampTi", pts: [[hwTail * zc - 6, -372], [hwTail * zc + 6, -372], [hwTail * zc + 6, -366], [hwTail * zc - 6, -366]] });
    tail.push({ sym: true, fill: "dark", pts: [[hwTail * 0.42, -356], [hwTail * 0.43, -356], [hwTail * 0.43, -120], [hwTail * 0.42, -120]] },
      { fill: "dark", pts: [[-hwTail * 0.9, -121], [hwTail * 0.9, -121], [hwTail * 0.9, -119.8], [-hwTail * 0.9, -119.8]] },
      { fill: "dark", pts: [[-hwTail * 0.22, -262], [hwTail * 0.22, -262], [hwTail * 0.22, -170], [-hwTail * 0.22, -170]] },
      { fill: "band", pts: [[-hwTail * 0.2, -260], [hwTail * 0.2, -260], [hwTail * 0.2, -172], [-hwTail * 0.2, -172]] },
      { fill: "recess", pts: [[hwTail * 0.13, -218], [hwTail * 0.17, -218], [hwTail * 0.17, -212], [hwTail * 0.13, -212]] },
      { sym: true, fill: "trim", pts: [[hwTail * 0.08, -112], [hwTail * 0.2, -112], [hwTail * 0.2, -96], [hwTail * 0.08, -96]] },
      { sym: true, fill: "lampTi", pts: [[hwTail * 0.11, -108], [hwTail * 0.17, -108], [hwTail * 0.17, -100], [hwTail * 0.11, -100]] });
  }
  return { decals: d, nose, tail };
};

/** decals ready to clip: side-profile heights turned into section coordinates, edges densified so a curve stays a curve */
const DET = new Map<CarModel, { decals: Decal[]; nose: CapDecal[]; tail: CapDecal[] }>();
const detailReady = (m: CarModel) => {
  const hit = DET.get(m);
  if (hit) return hit;
  const g = geom(bodyOf(m)), raw = detailOf(m);
  const decals = raw.decals.map((ds): Decal => {
    const dense: XY[] = [];
    for (let i = 0; i < ds.pts.length; i++) {
      const a = ds.pts[i], b = ds.pts[(i + 1) % ds.pts.length];
      const n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]) / 3, ds.xy ? Math.abs(b[1] - a[1]) / 3 : Math.abs(b[1] - a[1]) / 0.25)));
      for (let k = 0; k < n; k++) dense.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]);
    }
    const pts = ds.xy ? dense.map(([x, y]) => [x, tAt(g, x, y)] as XY) : dense;
    const xs = pts.map((q) => q[0]), ts = pts.map((q) => q[1]);
    return { pts, fill: ds.fill, op: ds.op ?? 1, side: ds.side, bb: [Math.min(...xs), Math.max(...xs), Math.min(...ts), Math.max(...ts)] };
  });
  const out = { decals, nose: raw.nose, tail: raw.tail };
  DET.set(m, out);
  return out;
};
/** Sutherland–Hodgman: a polygon clipped to the cell [x0,x1]×[t0,t1] */
const clipCell = (poly: XY[], x0: number, x1: number, t0: number, t1: number): XY[] => {
  let p = poly;
  const edge = (inside: (q: XY) => boolean, cut: (a: XY, b: XY) => XY) => {
    const o: XY[] = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length], ia = inside(a), ib = inside(b);
      if (ia) o.push(a);
      if (ia !== ib) o.push(cut(a, b));
    }
    p = o;
  };
  const atX = (X: number) => (a: XY, b: XY): XY => [X, a[1] + ((b[1] - a[1]) * (X - a[0])) / ((b[0] - a[0]) || 1e-9)];
  const atT = (T: number) => (a: XY, b: XY): XY => [a[0] + ((b[0] - a[0]) * (T - a[1])) / ((b[1] - a[1]) || 1e-9), T];
  edge((q) => q[0] >= x0, atX(x0)); if (p.length < 3) return [];
  edge((q) => q[0] <= x1, atX(x1)); if (p.length < 3) return [];
  edge((q) => q[1] >= t0, atT(t0)); if (p.length < 3) return [];
  edge((q) => q[1] <= t1, atT(t1));
  return p.length < 3 ? [] : p;
};

// ══ THE CAR ═════════════════════════════════════════════════════════════════════════════════
type Ctx = { r: Rig; p: Pose; key: string; W: (v: V) => V; D: (v: V) => V; op: number; out: (Face | null)[] };
const fo = (op: number, extra: Partial<Face> = {}): Partial<Face> => ({ skip: true, chrome: 0, fall: 0, gloss: 0, sw: 0.7, ...(op < 1 ? { op } : {}), ...extra });
const ptsStr = (r: Rig, W: (v: V) => V, pts: V[]) => pts.map((q) => { const s = P(r, W(q)); return `${s.x.toFixed(1)},${s.y.toFixed(1)}`; }).join(" ");

/** the lofted body: every facet lit by its own normal, its decals painted right after it; the two end caps with theirs */
const bodyFaces = (c: Ctx, m: CarModel) => {
  const { r, W, D, op, out, key } = c;
  const B = bodyOf(m), g = geom(B), det = detailReady(m), { xs, half, H, lm } = g;
  for (const s of [1, -1] as const) {
    for (let j = 0; j < xs.length - 1; j++) {
      const A = half[j], Bh = half[j + 1], xa = xs[j], xb = xs[j + 1], xm = (xa + xb) / 2;
      const inside: V = [xm, (B.floor + topAt(B, xm)) / 2, 0];
      const near = det.decals.filter((dc) => dc.bb[1] > xa && dc.bb[0] < xb && (dc.side === undefined || dc.side === s));
      for (let i = 0; i < H - 1; i++) {
        const c0: V = [xa, A[i][1], s * A[i][0]], c1: V = [xb, Bh[i][1], s * Bh[i][0]], c2: V = [xb, Bh[i + 1][1], s * Bh[i + 1][0]], c3: V = [xa, A[i + 1][1], s * A[i + 1][0]];
        let n = nrm(crs(sub(c2, c0), sub(c3, c1)));
        const ce = lv(lv(c0, c1, 0.5), lv(c3, c2, 0.5), 0.5);
        if (n[0] * (ce[0] - inside[0]) + n[1] * (ce[1] - inside[1]) + n[2] * (ce[2] - inside[2]) < 0) n = [-n[0], -n[1], -n[2]];
        if (Math.hypot(...crs(sub(c2, c0), sub(c3, c1))) < 1e-4) continue;
        const wn = nrm(D(n));
        const paint = i < lm.fe ? underOf(r, wn) : paintOf(r, wn);
        let base = paint;
        // the decals that fall on this facet, clipped to it and mapped onto it. A decal that covers the WHOLE facet becomes the facet's
        // own finish (no overlay, so no seam between neighbouring pieces); a partial one is painted over it.
        let pieces: { loc: V[]; fill: string; op: number }[] = [];
        for (const dc of near) {
          if (dc.bb[3] <= i || dc.bb[2] >= i + 1) continue;
          const cp = clipCell(dc.pts, xa, xb, i, i + 1);
          if (!cp.length) continue;
          const fill = fillOf(r, dc.fill, wn, paint);
          let ar = 0;
          for (let q = 0; q < cp.length; q++) { const a = cp[q], b = cp[(q + 1) % cp.length]; ar += a[0] * b[1] - b[0] * a[1]; }
          if (Math.abs(ar) / 2 >= (xb - xa) * 0.999 && dc.op >= 1) { base = fill; pieces = []; continue; }
          // (a partial piece runs a little past its facet's edges, inside the decal: the neighbouring facet, painted later, outlines its
          // own base over the shared edge, and its own piece of the same decal then covers that outline again — no seam grid)
          // (about one unit past each edge: a fraction of a big flat facet would carry the piece off the surface's turn)
          const mx = Math.min((xb - xa) * 0.14, 1), mt = Math.min(0.14, 1 / Math.max(1e-3, Math.hypot(...sub(c3, c0)))), ep = clipCell(dc.pts, xa - mx, xb + mx, i - mt, i + 1 + mt);
          pieces.push({ loc: ep.map(([x, t]): V => { const u = (x - xa) / (xb - xa), v = t - i; return lv(lv(c0, c1, u), lv(c3, c2, u), v); }), fill: dc.op < 1 ? mix(base, fill, dc.op) : fill, op: 1 });
        }
        const f = quad(r, `${key}c${j}_${i}${s > 0 ? "r" : "l"}`, [c0, c1, c2, c3].map(W), wn, base, fo(op, { sw: 1.1 }));
        if (!f) continue;
        if (pieces.length) f.after = (
          <g data-probe-skip opacity={op < 1 ? op : undefined}>
            {pieces.map((pc, q) => <polygon key={q} points={ptsStr(r, W, pc.loc)} fill={pc.fill} stroke={pc.fill} strokeWidth={0.8} strokeLinejoin="round" />)}
          </g>
        );
        out.push(f);
      }
    }
  }
  // the end caps (the nose and the tail), with their lamps, intakes and bars
  const capOf = (end: 1 | -1, list: CapDecal[]) => {
    const ix = end > 0 ? xs.length - 1 : 0, x = xs[ix], h = half[ix];
    const ring0: V[] = [...h.map(([z, y]) => [x, y, z] as V), ...h.slice(1, -1).reverse().map(([z, y]) => [x, y, -z] as V)];
    // (start the outline off the floor's straight centre line: p3's facing test reads the first corners, and collinear ones read as
    // edge-on — the caps were culled)
    const ring = [...ring0.slice(2), ...ring0.slice(0, 2)];
    const wn = nrm(D([end, 0, 0]));
    const base = paintOf(r, wn, -0.04);
    const f = quad(r, `${key}cap${end}`, ring.map(W), wn, base, fo(op, { sw: 1.1 }));
    if (!f) return;
    const polys: React.ReactNode[] = [];
    for (const cd of list) for (const sg of cd.sym ? [1, -1] : [1]) {
      const loc = cd.pts.map(([z, y]) => [x + end * 0.3, y, sg * z] as V), fill = fillOf(r, cd.fill, wn, base);
      polys.push(<polygon key={polys.length} points={ptsStr(r, W, loc)} fill={fill} stroke={fill} strokeWidth={0.5} opacity={cd.op} strokeLinejoin="round" />);
    }
    if (polys.length) f.after = <g data-probe-skip opacity={op < 1 ? op : undefined}>{polys}</g>;
    out.push(f);
  };
  capOf(1, det.nose);
  capOf(-1, det.tail);
};

/** a box [x0,x1]×[y0,y1]×[z0,z1] in the car's local space, every face lit by its own normal (`fin`) */
const part = (c: Ctx, k: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, fin: (n: V) => string, zb = 0) => {
  const cs: V[] = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => c.W([i & 1 ? x1 : x0, i & 2 ? y1 : y0, i & 4 ? z1 : z0]));
  for (const f of hexa(c.r, `${c.key}${k}`, cs, (_nm, n) => fin(n), fo(c.op, { sw: 0.8 }))) c.out.push(zb ? { ...f, z: f.z + zb } : f);
};

/** ★ ONE WHEEL: the tyre (tread band with turning blocks, sidewall with its bead), the rim lip and barrel, the rotor and caliper, the
 *  model's own wheel face (turning by spin; blurred into a disc by spinBlur), hub, lugs and cap. `arch`: it sits in a body's arch on the
 *  side facing the camera, so it sorts as a unit in front of that flank (or behind it, for the far side). */
type WStyle = "twin" | "aero" | "cyber" | "disc";
const wheelFaces = (c: Ctx, w: { x: number; R: number; zo: number; side: 1 | -1; tw: number; style: WStyle; arch: boolean; near: boolean; dual?: boolean; tag: string }) => {
  const { r, W, D, p, op, out, key } = c;
  const { x, R, zo, side, tw, style } = w;
  const spin = p.spin ?? 0, blur = clamp01((p as Pose & { spinBlur?: number }).spinBlur ?? 0);
  const k0 = `${key}w${w.tag}`;
  const cz = depthOf(r, W([x, -R, zo])), bias = w.arch ? (w.near ? 40 : -40) : 0;
  const flankN = nrm(D([0, 0, side]));
  let q = 0;
  const put = (k: string, pts: V[], n: V, fill: string, o: Partial<Face> = {}, ownZ = false) => {
    const f = quad(r, `${k0}${k}`, pts.map(W), n, fill, fo(op, o));
    if (!f) return;
    out.push(ownZ ? { ...f, z: f.z + bias } : { ...f, z: cz + bias + 0.5 + 0.01 * q++ });
  };
  const at = (rad: number, a: number, z: number): V => [x + rad * Math.cos(a), -R + rad * Math.sin(a), z];
  const disc = (rad: number, z: number, n = 36, a0 = 0): V[] => Array.from({ length: n }, (_, i) => at(rad, a0 + (i / n) * Math.PI * 2, z));
  const ZI = (dz: number) => zo - side * dz;
  const tread = (z0: number, z1: number, tg: string) => {
    const N = 56;
    for (let i = 0; i < N; i++) {
      const a0 = spin + (i / N) * Math.PI * 2, a1 = spin + ((i + 1) / N) * Math.PI * 2, am = (a0 + a1) / 2;
      // (in an arch only the tread below the arch's line shows: the rest is inside the wheel well, behind the body)
      if (w.arch && Math.sin(am) < 0.05) continue;
      const nW = nrm(D([Math.cos(am), Math.sin(am), 0]));
      const col = mix(tyreOf(r, nW), "#000000", (i % 2) * 0.16 * (1 - blur));
      put(`${tg}t${i}`, [at(R, a0, z0), at(R, a1, z0), at(R, a1, z1), at(R, a0, z1)], nW, col, { sw: 0.5 }, true);
    }
  };
  if (!w.near) {
    // the far side's wheel: the tread and the inner sidewall (seen under and past the body), dark
    tread(zo, ZI(tw), "f");
    put("fin", disc(R, ZI(tw), 32), nrm(D([0, 0, -side])), tyreOf(r, nrm(D([0, 0, -side])), -0.1));
    return;
  }
  tread(zo, ZI(tw), "a");
  if (w.dual) tread(ZI(tw + 3), ZI(2 * tw + 3), "b");
  // the sidewall and its bead (a slightly lighter band: the tyre's shoulder)
  put("sw", disc(R, zo), flankN, tyreOf(r, flankN));
  put("sb", disc(R * 0.93, zo + side * 0.2), flankN, tyreOf(r, flankN, 0.1));
  put("sc", disc(R * 0.84, zo + side * 0.3), flankN, tyreOf(r, flankN, -0.02));
  const L = lightOf(r, flankN);
  const metal = (lift: number) => paintOf(r, flankN, lift);
  const spinOp = op * (1 - blur);
  if (style === "twin") {
    put("lip", disc(R * 0.74, zo + side * 0.4), flankN, metal(0.3));
    put("brl", disc(R * 0.69, ZI(1), 36), flankN, mix("#020A16", "#0E2442", L * 0.6));
    // the brake rotor (a ring and its hat) and the caliper over it (fixed: it does not turn with the wheel)
    put("rot", disc(R * 0.56, ZI(4), 32), flankN, mix("#28456A", "#7E9CC0", L));
    put("rth", disc(R * 0.3, ZI(3.6), 24), flankN, mix("#0D2443", "#3D5F8C", L));
    const ca = (a: number, rad: number): V => at(rad, a, ZI(2.4));
    const cal: V[] = [];
    for (let i = 0; i <= 8; i++) cal.push(ca(-Math.PI * 0.5 - 1.15 + (i / 8) * 0.95, R * 0.62));
    for (let i = 8; i >= 0; i--) cal.push(ca(-Math.PI * 0.5 - 1.15 + (i / 8) * 0.95, R * 0.4));
    put("cal", cal, flankN, mix("#3F78C2", "#D4E3F5", L));
    // ten spokes in five twins, each a ridge (a lit half and a shaded half)
    for (let k = 0; k < 5; k++) for (const dd of [-1, 1]) {
      const cA = spin + (k / 5) * Math.PI * 2 + dd * 0.17, r0 = R * 0.2, r1 = R * 0.7, h0 = 0.075 * R / r0, h1 = 0.042 * R / r1, zs = zo - side * 0.3;
      put(`s${k}${dd}a`, [at(r0, cA - h0, zs), at(r1, cA - h1, zs), at(r1, cA, zs), at(r0, cA, zs)], flankN, metal(0.22), { op: spinOp < 1 ? spinOp : undefined });
      put(`s${k}${dd}b`, [at(r0, cA, zs), at(r1, cA, zs), at(r1, cA + h1, zs), at(r0, cA + h0, zs)], flankN, metal(-0.12), { op: spinOp < 1 ? spinOp : undefined });
    }
    if (blur > 0) {
      put("blr", disc(R * 0.7, zo - side * 0.25), flankN, mix(metal(0.05), "#06142A", 0.35), { op: op * blur * 0.92 });
      put("bl2", disc(R * 0.6, zo - side * 0.22), flankN, mix(metal(0.12), "#06142A", 0.25), { op: op * blur * 0.6 });
      put("bl3", disc(R * 0.36, zo - side * 0.2), flankN, mix(metal(0.0), "#06142A", 0.3), { op: op * blur * 0.6 });
    }
    put("hub", disc(R * 0.21, zo + side * 0.1, 24), flankN, metal(0.12));
    for (let k = 0; k < 5; k++) put(`lg${k}`, disc(R * 0.035, zo + side * 0.3, 8, 0).map((v) => [v[0] + R * 0.13 * Math.cos(spin + k * 1.2566), v[1] + R * 0.13 * Math.sin(spin + k * 1.2566), v[2]] as V), flankN, "#07152A", { op: op * (1 - blur * 0.8) < 1 ? op * (1 - blur * 0.8) : undefined });
    put("cap", disc(R * 0.075, zo + side * 0.4, 16), flankN, metal(0.4));
  } else if (style === "aero") {
    put("cov", disc(R * 0.74, zo + side * 0.3), flankN, metal(0.2));
    put("cv2", disc(R * 0.6, zo + side * 0.32), flankN, metal(0.02));
    put("cv3", disc(R * 0.56, zo + side * 0.34), flankN, metal(0.22));
    for (let k = 0; k < 7; k++) {
      const a = spin + (k / 7) * Math.PI * 2, r0 = R * 0.24, r1 = R * 0.54, h = 0.035, zs = zo + side * 0.4;
      put(`sl${k}`, [at(r0, a - h * 2, zs), at(r1, a - h + 0.25, zs), at(r1, a + h + 0.25, zs), at(r0, a + h * 2, zs)], flankN, "#06152B", { op: spinOp < 1 ? spinOp : undefined });
    }
    put("hub", disc(R * 0.15, zo + side * 0.45, 20), flankN, metal(0.35));
  } else if (style === "cyber") {
    put("cov", disc(R * 0.76, zo + side * 0.3), flankN, metal(0.04));
    const hex = (rad: number, z: number) => Array.from({ length: 6 }, (_, i) => at(rad, spin + (i / 6) * Math.PI * 2, z));
    put("hx", hex(R * 0.6, zo + side * 0.34), flankN, metal(0.24), { op: spinOp < 1 ? spinOp : undefined });
    for (let k = 0; k < 6; k++) {
      const a = spin + (k / 6) * Math.PI * 2, zs = zo + side * 0.38;
      put(`hl${k}`, [at(R * 0.6, a - 0.03, zs), at(R * 0.75, a - 0.025, zs), at(R * 0.75, a + 0.025, zs), at(R * 0.6, a + 0.03, zs)], flankN, "#06152B", { op: spinOp < 1 ? spinOp : undefined });
    }
    put("hb", hex(R * 0.18, zo + side * 0.42), flankN, mix("#07152A", "#2D4F7B", L));
  } else {
    // the Semi's steel disc wheel: the dished disc, hand holes, the hub, ten lugs, the cap
    put("dsc", disc(R * 0.76, zo + side * 0.3), flankN, metal(0.24));
    put("dsh", disc(R * 0.62, zo - side * 0.4), flankN, metal(0.05));
    for (let k = 0; k < 8; k++) {
      const a = spin + (k / 8) * Math.PI * 2;
      put(`hh${k}`, disc(R * 0.07, zo - side * 0.3, 10).map((v) => [v[0] + R * 0.47 * Math.cos(a), v[1] + R * 0.47 * Math.sin(a), v[2]] as V), flankN, "#030C1B", { op: spinOp < 1 ? spinOp : undefined });
    }
    put("hub", disc(R * 0.32, zo + side * 0.1, 28), flankN, metal(0.12));
    for (let k = 0; k < 10; k++) {
      const a = spin + (k / 10) * Math.PI * 2;
      put(`lg${k}`, disc(R * 0.03, zo + side * 0.3, 8).map((v) => [v[0] + R * 0.24 * Math.cos(a), v[1] + R * 0.24 * Math.sin(a), v[2]] as V), flankN, metal(0.4), { op: op * (1 - blur * 0.8) < 1 ? op * (1 - blur * 0.8) : undefined });
    }
    put("cap", disc(R * 0.13, zo + side * 0.5, 20), flankN, mix("#07152A", "#3A5C88", L));
  }
};

/** a side mirror: a slim stalk from the door's top corner, the housing LOFTED round its own axis (elliptical sections, swept back,
 *  tapering at its tip) in the body's metal, and its glass facing rearward */
const mirrorFaces = (c: Ctx, xm: number, by: number, hw: number, side: 1 | -1, near: boolean, s = 1) => {
  const zb = near ? 14 : -14, { r } = c;
  part(c, `ms${side}`, xm - 7 * s, xm - 2 * s, by - 6 * s, by - 1, side * (hw - 4), side * (hw + 6 * s), (n) => paintOf(r, n, -0.08), zb);
  const K = 6, N = 14, prof = [0.5, 0.86, 1, 1, 0.9, 0.55];
  const cen = (k: number) => { const t = k / (K - 1); return { x: xm - 7 * s - t * 6 * s, y: by - 8 * s - t * 1.5 * s, z: side * (hw + (4 + t * 23) * s) }; };
  const ring = (k: number, a: number): V => { const o = cen(k); return [o.x + 6.5 * s * prof[k] * Math.cos(a), o.y + 5 * s * prof[k] * Math.sin(a), o.z]; };
  for (let k = 0; k < K - 1; k++) for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2;
    const q: V[] = [ring(k, a0), ring(k + 1, a0), ring(k + 1, a1), ring(k, a1)];
    let n = nrm(crs(sub(q[2], q[0]), sub(q[3], q[1])));
    const o = cen(k + 0.5), mid = lv(q[0], q[2], 0.5);
    if (n[0] * (mid[0] - o.x) + n[1] * (mid[1] - o.y) < 0) n = [-n[0], -n[1], -n[2]];
    const wn = nrm(c.D(n));
    const f = quad(r, `${c.key}mh${side}${k}_${i}`, q.map(c.W), wn, paintOf(r, wn, 0.04), fo(c.op, { sw: 0.8 }));
    if (f) c.out.push({ ...f, z: f.z + zb });
  }
  // the tip's cap and the glass on the housing's back
  const tn = nrm(c.D([0, 0, side]));
  const tip = quad(r, `${c.key}mt${side}`, Array.from({ length: N }, (_, i) => ring(K - 1, (i / N) * Math.PI * 2)).map(c.W), tn, paintOf(r, tn, 0.02), fo(c.op, { sw: 0.8 }));
  if (tip) c.out.push({ ...tip, z: tip.z + zb });
  const gn = nrm(c.D([-1, 0, 0])), g0 = cen(1), g1 = cen(4);
  const gl: V[] = Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2, t = 0.5 + 0.5 * Math.cos(a); return [lerp(g0.x, g1.x, t) - 5.4 * s, lerp(g0.y, g1.y, t) + 3.6 * s * Math.sin(a), lerp(g0.z, g1.z, t)] as V; });
  const gf = quad(r, `${c.key}mg${side}`, gl.map(c.W), gn, glassOf(r, gn, 0.12), fo(c.op, { sw: 0.6 }));
  if (gf) c.out.push({ ...gf, z: gf.z + zb + 1 });
};

/** ★ ONE CAR'S FACES, posed (paint with <Faces>) */
export const carFaces = (r: Rig, model: CarModel, p: Pose, key: string): Face[] => {
  const S = MODELS[model], out: (Face | null)[] = [];
  const sc = p.scale ?? 1;
  const ex = dirWorld(p, [1, 0, 0]), ey = dirWorld(p, [0, 1, 0]), ez = dirWorld(p, [0, 0, 1]);
  const W = (v: V): V => [p.x + sc * (ex[0] * v[0] + ey[0] * v[1] + ez[0] * v[2]), p.y + sc * (ex[1] * v[0] + ey[1] * v[1] + ez[1] * v[2]), p.z + sc * (ex[2] * v[0] + ey[2] * v[1] + ez[2] * v[2])];
  const D = (v: V): V => dirWorld(p, v);
  const op = p.op ?? 1;
  const c: Ctx = { r, p, key, W, D, op, out };
  bodyFaces(c, model);
  const B = bodyOf(model);
  // which flank faces the camera
  const facing = (side: 1 | -1) => depthOf(r, W([0, -40, side * B.hw])) > depthOf(r, W([0, -40, -side * B.hw]));
  const style: WStyle = model === "cybercab" ? "aero" : model === "cybertruck" ? "cyber" : model === "semi" ? "disc" : "twin";
  for (const side of [1, -1] as const) {
    const near = facing(side);
    for (const wh of S.wheels) {
      if (model === "semi" && wh.x < 0) {
        // the drive axles: duals, under quarter fenders, out in the open behind the cab
        wheelFaces(c, { x: wh.x, R: wh.r, zo: side * (B.hw - 8), side, tw: 26, style, arch: false, near: true, dual: true, tag: `${wh.x}${side}` });
        continue;
      }
      const zo = side * (B.hw - (model === "semi" ? 4 : 1));
      wheelFaces(c, { x: wh.x, R: wh.r, zo, side, tw: model === "semi" ? 24 : model === "cybertruck" ? 16 : 12, style, arch: true, near, tag: `${wh.x}${side}` });
    }
    // the side mirrors (the Cybercab has none: cameras)
    if (model === "model3") mirrorFaces(c, 112, S.belt, B.hw, side, near);
    if (model === "modely") mirrorFaces(c, 116, S.belt, B.hw, side, near);
    if (model === "cybertruck") mirrorFaces(c, 104, S.belt, B.hw, side, near, 1.1);
    if (model === "semi") mirrorFaces(c, 240, -300, B.hw, side, near, 1.6);
  }
  if (model === "semi") semiChassis(c);
  return out.filter(Boolean) as Face[];
};

/** the Semi behind its cab: cab extenders, the frame rails and cross-members, the fifth wheel on its mounts, quarter fenders over the
 *  drive tyres, mud flaps, the rear bumper with its lamps */
const semiChassis = (c: Ctx) => {
  const { r } = c, hw = SEMI_CAB.hw;
  const steel = (lift: number) => (n: V) => paintOf(r, n, lift);
  const dark = (n: V) => trimOf(r, n, 0.1);
  for (const s of [1, -1] as const) {
    // the cab extenders: the aero panels carrying the cab's sides back toward the trailer
    part(c, `ex${s}`, -112, -70, -378, -150, s * (hw - 10), s * (hw - 4), steel(0.02));
    // the frame rails
    part(c, `fr${s}`, -322, -70, -86, -56, s * 30, s * 44, dark);
    // the quarter fenders over each drive axle's duals
    for (const ax of [-236, -122]) {
      const R = 52 + 6, N = 12, a0 = -Math.PI + 0.42, a1 = -0.42;
      for (let i = 0; i < N; i++) {
        const u0 = a0 + ((a1 - a0) * i) / N, u1 = a0 + ((a1 - a0) * (i + 1)) / N, um = (u0 + u1) / 2;
        const pt = (a: number, z: number): V => [ax + R * Math.cos(a), -52 + R * Math.sin(a), z];
        const n = nrm(c.D([Math.cos(um), Math.sin(um), 0]));
        c.out.push(quad(r, `${c.key}fd${ax}${s}${i}`, [pt(u0, s * (hw - 3)), pt(u1, s * (hw - 3)), pt(u1, s * (hw - 64)), pt(u0, s * (hw - 64))].map(c.W), n, trimOf(r, n, 0.12), fo(c.op, { sw: 0.8 })));
      }
      // the fender's outer edge (a lit lip facing out)
      const lip: V[] = [];
      for (let i = 0; i <= N; i++) { const a = a0 + ((a1 - a0) * i) / N; lip.push([ax + (R + 3) * Math.cos(a), -52 + (R + 3) * Math.sin(a), s * (hw - 2.5)]); }
      for (let i = N; i >= 0; i--) { const a = a0 + ((a1 - a0) * i) / N; lip.push([ax + R * Math.cos(a), -52 + R * Math.sin(a), s * (hw - 2.5)]); }
      const ln = nrm(c.D([0, 0, s]));
      c.out.push(quad(r, `${c.key}fl${ax}${s}`, lip.map(c.W), ln, paintOf(r, ln, 0.2), fo(c.op, { sw: 0.6 })));
    }
    // a mud flap behind the rear axle
    part(c, `mf${s}`, -300, -296, -66, -8, s * (hw - 60), s * (hw - 8), dark);
    // the rear bumper's lamps
    part(c, `rl${s}`, -324, -320, -64, -54, s * (hw - 34), s * (hw - 14), (n) => mix("#4D8ED9", "#B3CEEF", lightOf(r, n)));
  }
  // cross-members and the rear bumper bar
  part(c, "cm1", -318, -306, -84, -58, -44, 44, dark);
  part(c, "cm2", -210, -200, -84, -60, -44, 44, dark);
  part(c, "bb", -322, -312, -62, -48, -(hw - 10), hw - 10, steel(-0.04));
  // the fifth wheel: its mounting brackets, the plate (a short cylinder), the coupler's V-slot on top
  part(c, "fwm", -214, -150, -92, -84, -46, 46, dark);
  const cx = -182, R = 52, y0 = -101, y1 = -92, N = 30;
  const ringPt = (a: number, y: number): V => [cx + R * Math.cos(a), y, R * Math.sin(a)];
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2, am = (a0 + a1) / 2;
    const n = nrm(c.D([Math.cos(am), 0, Math.sin(am)]));
    c.out.push(quad(r, `${c.key}fws${i}`, [ringPt(a0, y0), ringPt(a1, y0), ringPt(a1, y1), ringPt(a0, y1)].map(c.W), n, paintOf(r, n, -0.06), fo(c.op, { sw: 0.8 })));
  }
  const tn = nrm(c.D([0, -1, 0]));
  const topF = quad(r, `${c.key}fwt`, Array.from({ length: N }, (_, i) => ringPt((i / N) * Math.PI * 2, y0)).map(c.W), tn, paintOf(r, tn, 0.1), fo(c.op, { sw: 0.8 }));
  if (topF) {
    const slot: V[] = [[cx - R + 1, y0 - 0.3, -16], [cx - 4, y0 - 0.3, -3], [cx + 6, y0 - 0.3, -3], [cx + 6, y0 - 0.3, 3], [cx - 4, y0 - 0.3, 3], [cx - R + 1, y0 - 0.3, 16]];
    topF.after = <g data-probe-skip opacity={c.op < 1 ? c.op : undefined}><polygon points={ptsStr(r, c.W, slot)} fill={trimOf(r, tn)} /></g>;
    c.out.push(topF);
  }
};

/** its footprint shadow on the floor at floorY (paint first), with a darker contact patch under every tyre */
export const carShadow = (r: Rig, model: CarModel, p: Pose, floorY: number, key: string): Face[] => {
  const s = p.scale ?? 1, yaw = ((p.yaw ?? 0) * Math.PI) / 180, L = lenOf(model) / 2, Wd = widthOf(model) / 2;
  const hx = (L * Math.abs(Math.cos(yaw)) + Wd * Math.abs(Math.sin(yaw))) * s, hz = (Wd * Math.abs(Math.cos(yaw)) + L * Math.abs(Math.sin(yaw))) * s;
  const out = contactShadow(r, `${key}sh`, p.x - hx, p.x + hx, p.z - hz, p.z + hz, floorY, 1.3 * (p.op ?? 1), 22 * s);
  const S = MODELS[model], ex = dirWorld(p, [1, 0, 0]), ez = dirWorld(p, [0, 0, 1]);
  S.wheels.forEach((w, i) => {
    for (const sd of [1, -1]) {
      const zz = sd * (S.hw - 8), cx = p.x + s * (ex[0] * w.x + ez[0] * zz), cz = p.z + s * (ex[2] * w.x + ez[2] * zz), e = w.r * 0.45 * s;
      out.push(...contactShadow(r, `${key}tp${i}${sd}`, cx - e, cx + e, cz - e * 0.5, cz + e * 0.5, floorY, 0.55 * (p.op ?? 1), 4 * s));
    }
  });
  return out;
};
