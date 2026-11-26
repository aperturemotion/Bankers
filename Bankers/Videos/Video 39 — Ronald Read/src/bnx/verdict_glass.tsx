// @ts-nocheck
// ★ V37 "Theranos" — builder F, place `verdict`, framing 2: THE HOURGLASS (the sentence).
//   A real hourglass, built as ONE solid in one perspective: a machined steel base plinth; two turned steel end plates with
//   turned grooves and a moulded edge, the glass bearing on them (a contact ring); three turned steel posts (bead, ring, waisted shaft) between them; a finial
//   on the top plate; and the GLASS — one blown piece, two bulbs and a narrow neck, every section a circle round the vertical axis
//   projected through the rig (so both ends, the neck and the bulbs share one perspective), drawn see-through: its silhouette, a
//   thin wall, a highlight down the side that faces the key light and a faint one opposite.
//   THE SAND is a solid shape, never particles: the upper charge (with the draining dimple in its surface), the lower heap (its
//   body to a level plus the cone the falling sand builds), and only a thin falling THREAD through the neck, its grain moving in
//   the direction the sand runs. Volumes are true: the level comes from integrating the bulb's own radius (a share of the sand ↔
//   a share of the volume), so 123/135 of the heap is drawn as 123/135 of its volume.
//   Hourglass-local frame: x right, y DOWN (floor 0, up negative), z toward the lens; `at` = the foot centre (world).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { rampAt } from "./solid_engine";
import { worldScr, worldView, xfTrans } from "./tk_rig";
import { BRASS, WALNUT, WALNUT_D } from "./verdict_gavel";
import { Turned } from "./verdict_turned";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
// ── dimensions (local y up = negative) ──────────────────────────────────────────────────────────────────────────────────
const BASE_TOP = -58;
const PLATE_T = 36;
const Y_GB = BASE_TOP - PLATE_T - 0.5;           // the glass's bottom end, standing on the bottom plate
const HALF = 318;                                // each bulb, neck → end
const Y_NECK = Y_GB - HALF;
const Y_GT = Y_NECK - HALF;                      // the glass's top end (bearing on the top plate)
const TOP_PLATE = Y_GT - 0.5;                    // the top plate's underside (the glass's top end bears on it)
export const HG = { postR: 156, height: -(TOP_PLATE - PLATE_T - 64), wall: 4.5 };
// the glass's radius at a distance s from the neck (0 … HALF): a smooth bulb (Catmull-Rom through measured control points)
const CTRL = [[0, 10.5], [0.04, 12], [0.12, 30], [0.25, 74], [0.4, 108], [0.55, 124], [0.68, 125], [0.8, 112], [0.9, 86], [0.96, 68], [1, 64]];
const rAt = (s) => {
  const t = clamp01(s / HALF);
  let i = 0;
  while (i < CTRL.length - 2 && CTRL[i + 1][0] < t) i++;
  const p0 = CTRL[Math.max(0, i - 1)], p1 = CTRL[i], p2 = CTRL[i + 1], p3 = CTRL[Math.min(CTRL.length - 1, i + 2)];
  const u = (t - p1[0]) / (p2[0] - p1[0]);
  const m1 = (p2[1] - p0[1]) / (p2[0] - p0[0]) * (p2[0] - p1[0]), m2 = (p3[1] - p1[1]) / (p3[0] - p1[0]) * (p2[0] - p1[0]);
  const h00 = 2 * u ** 3 - 3 * u * u + 1, h10 = u ** 3 - 2 * u * u + u, h01 = -2 * u ** 3 + 3 * u * u, h11 = u ** 3 - u * u;
  return h00 * p1[1] + h10 * m1 + h01 * p2[1] + h11 * m2;
};
const rIn = (s) => Math.max(0.5, rAt(s) - HG.wall);
// ── volumes: the lower bulb filled from its end up to height h above the end; the upper from the neck up ──────────────────────
const NV = 400;
const LOW = (() => {
  // cumulative volume from the lower end (s = HALF) toward the neck (s = 0)
  const out = [0];
  for (let k = 1; k <= NV; k++) {
    const s0 = HALF * (1 - (k - 1) / NV), s1 = HALF * (1 - k / NV), r = rIn((s0 + s1) / 2);
    out.push(out[k - 1] + Math.PI * r * r * (s0 - s1));
  }
  return out;
})();
const UP = (() => {
  const out = [0];
  for (let k = 1; k <= NV; k++) {
    const s0 = HALF * (k - 1) / NV, s1 = HALF * k / NV, r = rIn((s0 + s1) / 2);
    out.push(out[k - 1] + Math.PI * r * r * (s1 - s0));
  }
  return out;
})();
const invert = (tab, v) => {
  if (v <= 0) return 0;
  let k = 1;
  while (k < NV && tab[k] < v) k++;
  const a = tab[k - 1], b = tab[k];
  return HALF * (k - 1 + clamp01((v - a) / Math.max(1e-9, b - a))) / NV;
};
/** the whole charge of sand (its volume) and the heap height it makes in the lower bulb at a share q (0…1) of it */
export const SAND_FULL = LOW[Math.round(NV * 0.6)];   // a full charge fills the lower bulb to 60 % of its height
if (SAND_FULL > UP[Math.round(NV * 0.86)]) throw new Error("verdict_glass: the upper bulb cannot hold the charge");
export const lowLevel = (q) => invert(LOW, SAND_FULL * clamp01(q));     // height above the lower end
export const upLevel = (q) => invert(UP, SAND_FULL * clamp01(q));       // height above the neck
// ── profiles ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const BASE = [{ y: BASE_TOP, r: 0 }, { y: BASE_TOP, r: 200 }, { y: BASE_TOP + 4, r: 208 }, { y: BASE_TOP + 9, r: 210 }, { y: BASE_TOP + 12, r: 204 }, { y: BASE_TOP + 17, r: 204 }, { y: BASE_TOP + 21, r: 212 }, { y: -16, r: 218 }, { y: -12, r: 226 }, { y: -3, r: 228 }, { y: 0, r: 224 }, { y: 0, r: 0 }];
const plate = (y0, down) => {
  // a turned end plate: y0 = the face toward the glass; down = +1 if the plate lies below y0
  const s = down;
  return [[0, 0], [0, 176], [2, 182], [6, 184], [PLATE_T - 8, 184], [PLATE_T - 5, 188], [PLATE_T, 186], [PLATE_T, 0]].map(([d, r]) => ({ y: y0 + s * d, r }));
};
const sortP = (p) => p[0].y <= p[p.length - 1].y ? p : [...p].reverse();
const BOT_PLATE = sortP(plate(BASE_TOP - PLATE_T, 1).map((q) => ({ y: q.y, r: q.r }))).map((q, i, a) => q);
const TOP_PLATE_P = sortP(plate(TOP_PLATE, -1));
const FINIAL = [{ y: TOP_PLATE - PLATE_T - 62, r: 0 }, { y: TOP_PLATE - PLATE_T - 62, r: 8 }, { y: TOP_PLATE - PLATE_T - 56, r: 20 }, { y: TOP_PLATE - PLATE_T - 44, r: 24 }, { y: TOP_PLATE - PLATE_T - 32, r: 16 }, { y: TOP_PLATE - PLATE_T - 22, r: 13 }, { y: TOP_PLATE - PLATE_T - 14, r: 30 }, { y: TOP_PLATE - PLATE_T - 8, r: 34 }, { y: TOP_PLATE - PLATE_T, r: 36 }, { y: TOP_PLATE - PLATE_T, r: 0 }];
const POST_L = (BASE_TOP - PLATE_T) - TOP_PLATE;
const POST = (() => {
  const L = POST_L;
  const q = (y, r) => ({ y, r });
  return [q(0, 0), q(0, 17), q(10, 17), q(13, 14), q(20, 14), q(24, 19), q(32, 19), q(36, 13), q(60, 11), q(L * 0.32, 9), q(L * 0.46, 12), q(L * 0.5, 15), q(L * 0.54, 12), q(L * 0.68, 9), q(L - 60, 11), q(L - 36, 13), q(L - 32, 19), q(L - 24, 19), q(L - 20, 14), q(L - 13, 14), q(L - 10, 17), q(L, 17), q(L, 0)];
})();
const POST_ANG = [30, 150, 270];
// REV 1 ("make it more detailed"): brass fittings on the walnut frame — rings at the posts' beads and waists, a band round each
//   end plate's edge, a brass finial, brass screws, a brass plaque on the base
const POST_RINGS = [[{ y: 24.5, r: 19.8 }, { y: 31.5, r: 19.8 }], [{ y: POST_L - 31.5, r: 19.8 }, { y: POST_L - 24.5, r: 19.8 }], [{ y: POST_L * 0.48, r: 15.8 }, { y: POST_L * 0.52, r: 15.8 }]];
const PLATE_BAND = (y0) => [{ y: y0 - 4, r: 185.4 }, { y: y0 + 4, r: 185.4 }];
export const HOURGLASS_TOP = TOP_PLATE - PLATE_T - 62;
// ── the sand's look (a pale fine steel-white sand: the house's warm-neutral face ramp) ─────────────────────────────────────
const SAND = ["#4E4B46", "#7E7A72", "#B4AFA5", "#DDD8CE", "#F6F3EC"];
const hull = (pts) => {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  for (const q of [...p].reverse()) {
    while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop();
    hi.push(q);
  }
  return [...lo.slice(0, -1), ...hi.slice(0, -1)];
};
const D = (pts, close = true) => `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}${close ? "Z" : ""}`;
/**
 * The hourglass at world foot `at`. sand: { low: share of the charge in the lower bulb, up: share in the upper bulb,
 *   flow: −1 … 1 (+ runs down, − runs back up; 0 none), g: frame (the thread's grain) }.
 */
export const Hourglass = ({ id, rig, at, sand, glow = 0 }) => {
  const W = (q) => [at[0] + q[0], at[1] + q[1], at[2] + q[2]];
  const S = (q) => worldScr(rig, W(q));
  const xf = xfTrans(at);
  const N = 40;
  const ringS = (y, r, n = N) => Array.from({ length: n }, (_, i) => {
    const a = i / n * 2 * Math.PI;
    return S([r * Math.cos(a), y, r * Math.sin(a)]);
  });
  // ── the glass's silhouette: per section, the leftmost and rightmost projected points
  const secs = [];
  for (let k = 0; k <= 64; k++) {
    const y = Y_GT + (Y_GB - Y_GT) * k / 64, s = Math.abs(y - Y_NECK);
    const rr = rAt(s), pts = ringS(y, rr, 48);
    let L = pts[0], R = pts[0];
    for (const p of pts) {
      if (p[0] < L[0]) L = p;
      if (p[0] > R[0]) R = p;
    }
    secs.push({ L, R, y, rr });
  }
  const glassD = D([...secs.map((q) => q.L), ...[...secs].reverse().map((q) => q.R)]);
  // the walls' inner edge (the glass's thickness, seen at the silhouette)
  const innerL = D(secs.map((q) => [q.L[0] + HG.wall * 0.9, q.L[1]]), false), innerR = D(secs.map((q) => [q.R[0] - HG.wall * 0.9, q.R[1]]), false);
  // the highlight: a line on the glass where it faces the key (upper left), and a faint one on the far side
  const facing = (q, n) => {
    const v = worldView(rig, W(q)), w2 = worldView(rig, W([q[0] + n[0], q[1] + n[1], q[2] + n[2]]));
    return (w2[0] - v[0]) * -v[0] + (w2[1] - v[1]) * -v[1] + (w2[2] - v[2]) * (rig.persp - v[2]);
  };
  const streak = (th, y0, y1, kr = 1.002) => {
    const pts = [];
    for (let k = 0; k <= 40; k++) {
      const y = y0 + (y1 - y0) * k / 40, rr = rAt(Math.abs(y - Y_NECK)) * kr, q = [rr * Math.cos(th), y, rr * Math.sin(th)];
      if (facing(q, [Math.cos(th), 0, Math.sin(th)]) > 0) pts.push(S(q));
    }
    return pts.length > 1 ? D(pts, false) : "";
  };
  const TH_KEY = Math.PI * 0.78, TH_FAR = Math.PI * 0.2;   // azimuths (z toward the lens is +sin)
  const gL = secs[Math.round(secs.length * 0.75)];
  // ── the sand
  const ql = clamp01(sand.low), qu = clamp01(sand.up);
  const hl = lowLevel(ql);                                  // above the lower end
  const yl = Y_GB - hl;
  const hu = upLevel(qu);                                   // above the neck
  const yu = Y_NECK - hu;
  const yRange = (a, b, n) => Array.from({ length: n + 1 }, (_, k) => a + (b - a) * k / n);
  const rInY = (y) => rIn(Math.abs(y - Y_NECK));
  // the lower heap: its body up to the level, and the cone the stream builds (it flattens as the bulb narrows)
  const coneH = ql > 0.002 ? Math.min(46, 0.42 * rInY(yl)) * clamp01(ql * 6) : 0;
  const lowPts = ql > 0.002 ? yRange(Y_GB - 2, yl, 18).flatMap((y) => ringS(y, rInY(y) - 0.5, 28)) : [];
  const apex = S([0, yl - coneH, 0]);
  const lowBody = lowPts.length ? D(hull([...lowPts, apex])) : "";
  const lowCone = lowPts.length ? D(hull([...ringS(yl, rInY(yl) - 0.5, 28), apex])) : "";
  // the upper charge: from the neck up to its level, its surface dished where it drains
  const upPts = qu > 0.002 ? yRange(Y_NECK - 2, yu, 18).flatMap((y) => ringS(y, rInY(y) - 0.5, 28)) : [];
  const upBody = upPts.length ? D(hull(upPts)) : "";
  const upTop = upPts.length ? D(ringS(yu, rInY(yu) - 0.5, 36)) : "";
  const dish = upPts.length ? D(ringS(yu + 0.5, Math.min(rInY(yu) * 0.55, 46), 24)) : "";
  const dishDeep = upPts.length ? D(ringS(yu + 0.5, Math.min(rInY(yu) * 0.22, 16), 18)) : "";
  // the thread through the neck, from the upper charge's foot to the heap's apex
  const fl = sand.flow ?? 0;
  const thread = Math.abs(fl) > 0.02 ? [S([0, Y_NECK - 4, 0]), S([0, ql > 0.002 ? yl - coneH + 2 : Y_GB - 4, 0])] : null;
  // the sand's light: a gradient across its width, lit on the key's side
  const a0 = S([-130, Y_NECK, 0]), a1 = S([130, Y_NECK, 0]);
  const sandGrad = (gid) => jsxs("linearGradient", { id: gid, gradientUnits: "userSpaceOnUse", x1: f2(a0[0]), y1: f2(a0[1]), x2: f2(a1[0]), y2: f2(a1[1]), children: [
    jsx("stop", { offset: "0", stopColor: rampAt(SAND, 0.82) }),
    jsx("stop", { offset: "0.35", stopColor: rampAt(SAND, 0.66) }),
    jsx("stop", { offset: "0.75", stopColor: rampAt(SAND, 0.42) }),
    jsx("stop", { offset: "1", stopColor: rampAt(SAND, 0.3) })
  ] });
  // ── the posts: behind the glass (z < 0) or in front of it
  const posts = POST_ANG.map((deg) => {
    const a = deg * Math.PI / 180, x = HG.postR * Math.cos(a), z = HG.postR * Math.sin(a);
    return { x, z, xf: xfTrans(W([x, TOP_PLATE, z])), depth: worldView(rig, W([x, Y_NECK, z]))[2] };
  });
  const cDepth = worldView(rig, W([0, Y_NECK, 0]))[2];
  const Post = (p, k) => jsxs("g", { children: [
    jsx(Turned, { id: `${id}p${k}`, rig, xf: p.xf, profile: POST, ramp: WALNUT, spec: 0.85, n: 28 }),
    // the shaft's flutes: three fine grooves on the side toward the lens, above and below the waist ring
    [-0.45, 0, 0.45].flatMap((da, j) => [[64, POST_L * 0.44], [POST_L * 0.56, POST_L - 64]].map(([y0, y1], h) => {
      const a = Math.PI / 2 + da, rr = (y) => (y < POST_L * 0.5 ? 9 + 2 * Math.abs(y - POST_L * 0.32) / (POST_L * 0.2) : 9 + 2 * Math.abs(y - POST_L * 0.68) / (POST_L * 0.2));
      const pts = [0, 0.25, 0.5, 0.75, 1].map((u) => {
        const y = y0 + (y1 - y0) * u, r = Math.min(12, rr(y)) + 0.3;
        return S([p.x + r * Math.cos(a), TOP_PLATE + y, p.z + r * Math.sin(a)]);
      });
      return jsx("path", { d: D(pts, false), stroke: "#000000", strokeOpacity: 0.3, strokeWidth: 1.1, fill: "none" }, `fl${j}${h}`);
    })),
    POST_RINGS.map((pr, j) => jsx(Turned, { id: `${id}p${k}r${j}`, rig, xf: p.xf, profile: pr, ramp: BRASS, spec: 0.95, n: 28 }, `r${j}`))
  ] }, `p${k}`);
  const back = posts.filter((p) => p.depth < cDepth), front = posts.filter((p) => p.depth >= cDepth);
  // the shadow of the base on the floor (the key throws it right and back)
  const shadow = D(Array.from({ length: 36 }, (_, i) => S([22 + 236 * Math.cos(i / 36 * 2 * Math.PI), -0.5, -30 + 236 * Math.sin(i / 36 * 2 * Math.PI)])));
  const glassId = `${id}G`, sandId = `${id}S`, grainId = `${id}N`;
  // the base's brass plaque: a curved plate on the base's band, facing the lens, with an engraved double border and a diamond
  const arcPts = (r, y, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, i) => S([r * Math.cos(a0 + (a1 - a0) * i / n), y, r * Math.sin(a0 + (a1 - a0) * i / n)]));
  const PA = Math.PI / 2 - 0.1, PW = 0.44;
  const plq = (inset, rr) => [...arcPts(rr, BASE_TOP + 23 + inset, PA - PW + inset / 215, PA + PW - inset / 215), ...arcPts(rr, -18 - inset, PA + PW - inset / 215, PA - PW + inset / 215)];
  const plaque = jsxs("g", { children: [
    jsx("path", { d: D(plq(0, 216.2)), fill: rampAt(BRASS, 0.62), stroke: "#000000", strokeOpacity: 0.45, strokeWidth: 1 }),
    jsx("path", { d: D(plq(3, 216.4)), fill: "none", stroke: rampAt(BRASS, 0.95), strokeOpacity: 0.7, strokeWidth: 1 }),
    jsx("path", { d: D(plq(5.5, 216.4)), fill: "none", stroke: "#2A1E0B", strokeOpacity: 0.55, strokeWidth: 0.9 }),
    jsx("path", { d: D([S([216.5 * Math.cos(PA - 0.03), (BASE_TOP + 23 - 18) / 2, 216.5 * Math.sin(PA - 0.03)]), S([216.5 * Math.cos(PA), BASE_TOP + 27, 216.5 * Math.sin(PA)]), S([216.5 * Math.cos(PA + 0.03), (BASE_TOP + 23 - 18) / 2, 216.5 * Math.sin(PA + 0.03)]), S([216.5 * Math.cos(PA), -22, 216.5 * Math.sin(PA)])]), fill: "#2A1E0B", opacity: 0.6 })
  ] });
  // the glass's reflections: a broad soft window band on each bulb's lit side
  const band = (y0, y1) => {
    const a0 = TH_KEY - 0.22, a1 = TH_KEY + 0.12;
    const side = (a, rev) => {
      const pts = [];
      for (let k = 0; k <= 16; k++) {
        const y = y0 + (y1 - y0) * k / 16, rr = rAt(Math.abs(y - Y_NECK)) * 1.003;
        pts.push(S([rr * Math.cos(a), y, rr * Math.sin(a)]));
      }
      return rev ? pts.reverse() : pts;
    };
    return D([...side(a0, false), ...side(a1, true)]);
  };
  return jsxs("svg", { "data-probe-object": "the hourglass: walnut base, end plates and posts with brass fittings, the glass, its sand", width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    jsxs("defs", { children: [
      jsxs("linearGradient", { id: glassId, gradientUnits: "userSpaceOnUse", x1: f2(gL.L[0]), y1: f2(gL.L[1]), x2: f2(gL.R[0]), y2: f2(gL.R[1]), children: [
        jsx("stop", { offset: "0", stopColor: "#E6F0FB", stopOpacity: 0.42 }),
        jsx("stop", { offset: "0.12", stopColor: "#B9D0EA", stopOpacity: 0.14 }),
        jsx("stop", { offset: "0.5", stopColor: "#9FBDE0", stopOpacity: 0.05 }),
        jsx("stop", { offset: "0.88", stopColor: "#6F93BE", stopOpacity: 0.16 }),
        jsx("stop", { offset: "1", stopColor: "#C9DCF1", stopOpacity: 0.36 })
      ] }),
      sandGrad(sandId),
      // the sand's grain: fine light and dark specks, fixed in the picture (the level moves through them, as through real sand)
      jsxs("pattern", { id: grainId, patternUnits: "userSpaceOnUse", width: 9, height: 9, children: [
        jsx("circle", { cx: 1.5, cy: 2, r: 0.8, fill: "#6E6A62", opacity: 0.55 }),
        jsx("circle", { cx: 6.2, cy: 4.4, r: 0.7, fill: "#FFFFFF", opacity: 0.55 }),
        jsx("circle", { cx: 3.6, cy: 7.3, r: 0.75, fill: "#8C877D", opacity: 0.5 }),
        jsx("circle", { cx: 7.8, cy: 8.2, r: 0.6, fill: "#FFFFFF", opacity: 0.4 })
      ] })
    ] }),
    jsx("path", { d: shadow, fill: "#000000", opacity: 0.32, stroke: "#000000", strokeOpacity: 0.14, strokeWidth: 18, strokeLinejoin: "round" }),
    jsx(Turned, { id: `${id}b`, rig, xf, profile: BASE, ramp: WALNUT_D, spec: 0.8, n: 72 }),
    plaque,
    // the base's top: a turned groove, and six screws holding the bottom plate down
    jsx("path", { d: D(ringS(BASE_TOP - 0.4, 194, 64)), fill: "none", stroke: "#000000", strokeOpacity: 0.45, strokeWidth: 1.6 }),
    jsx("path", { d: D(ringS(BASE_TOP - 0.4, 196.5, 64)), fill: "none", stroke: "#FFFFFF", strokeOpacity: 0.16, strokeWidth: 1 }),
    [0, 1, 2, 3, 4, 5].map((k) => {
      const a = (k + 0.5) / 6 * 2 * Math.PI, cx = 192 * Math.cos(a) * 0 + 0, q = [194 * Math.cos(a) * 0.98, BASE_TOP - 0.6, 194 * Math.sin(a) * 0.98];
      const hd = Array.from({ length: 14 }, (_, i) => S([q[0] + 5.5 * Math.cos(i / 14 * 2 * Math.PI) * 0 + (q[0] - q[0]) + q[0] * 0 + q[0], q[1], q[2]].map((v, j) => j === 0 ? q[0] + 5.5 * Math.cos(i / 14 * 2 * Math.PI) : j === 2 ? q[2] + 5.5 * Math.sin(i / 14 * 2 * Math.PI) : v)));
      return jsx("path", { d: D(hd), fill: rampAt(BRASS, 0.75), stroke: "#000000", strokeOpacity: 0.5, strokeWidth: 1 }, `bs${k}`);
    }),
    jsx(Turned, { id: `${id}pb`, rig, xf, profile: BOT_PLATE, ramp: WALNUT, spec: 0.85, n: 72 }),
    jsx(Turned, { id: `${id}pbb`, rig, xf, profile: PLATE_BAND(BASE_TOP - PLATE_T / 2), ramp: BRASS, spec: 0.95, n: 72 }),
    back.map(Post),
    jsx("path", { d: D(ringS(Y_GB - 0.3, 70, 48)), fill: "#000000", opacity: 0.35, stroke: "#000000", strokeOpacity: 0.15, strokeWidth: 6 }),
    // the glass's far wall, seen through it (a faint inner edge)
    jsx("path", { d: glassD, fill: "#0B1F31", opacity: 0.18 }),
    // the sand: the upper charge, the thread, the lower heap
    upBody && jsx("path", { d: upBody, fill: `url(#${sandId})` }),
    upTop && jsx("path", { d: upTop, fill: rampAt(SAND, 0.78) }),
    dish && jsx("path", { d: dish, fill: rampAt(SAND, 0.58), opacity: 0.8 }),
    dishDeep && jsx("path", { d: dishDeep, fill: rampAt(SAND, 0.34), opacity: 0.9 }),
    thread && jsx("path", { d: D(thread, false), stroke: rampAt(SAND, 0.7), strokeWidth: 2.6, opacity: clamp01(Math.abs(fl) * 3), fill: "none", strokeLinecap: "round" }),
    thread && jsx("path", { d: D(thread, false), stroke: rampAt(SAND, 0.95), strokeWidth: 1.6, strokeDasharray: "5 7", strokeDashoffset: f2(-(sand.g ?? 0) * 9 * Math.sign(fl)), opacity: clamp01(Math.abs(fl) * 3), fill: "none" }),
    upBody && jsx("path", { d: upBody, fill: `url(#${grainId})` }),
    lowBody && jsx("path", { d: lowBody, fill: `url(#${sandId})` }),
    lowCone && jsx("path", { d: lowCone, fill: rampAt(SAND, 0.8) }),
    lowBody && jsx("path", { d: lowBody, fill: `url(#${grainId})` }),
    lowCone && jsx("path", { d: D([apex, S([-rInY(yl) * 0.7, yl, rInY(yl) * 0.5])], false), stroke: "#FFFFFF", strokeOpacity: 0.25, strokeWidth: 2, fill: "none" }),
    // the glass: body, walls, highlights
    jsx("path", { d: glassD, fill: `url(#${glassId})`, stroke: "#C5D8EE", strokeOpacity: 0.7, strokeWidth: 1.6 }),
    jsx("path", { d: innerL, stroke: "#C5D8EE", strokeOpacity: 0.28, strokeWidth: 1, fill: "none" }),
    jsx("path", { d: innerR, stroke: "#C5D8EE", strokeOpacity: 0.28, strokeWidth: 1, fill: "none" }),
    jsx("path", { d: band(Y_GT + 50, Y_NECK - 90), fill: "#FFFFFF", opacity: 0.1 }),
    jsx("path", { d: band(Y_NECK + 90, Y_GB - 50), fill: "#FFFFFF", opacity: 0.09 }),
    jsx("path", { d: streak(TH_KEY, Y_GT + 30, Y_NECK - 40), stroke: "#FFFFFF", strokeWidth: 5, opacity: 0.5, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d: streak(TH_KEY, Y_NECK + 40, Y_GB - 26), stroke: "#FFFFFF", strokeWidth: 5, opacity: 0.45, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d: D(ringS(Y_GB - 1, 64, 48)), fill: "none", stroke: "#DDE9F6", strokeOpacity: 0.55, strokeWidth: 2 }),
    jsx("path", { d: D(ringS(Y_GT + 1, 64, 48)), fill: "none", stroke: "#DDE9F6", strokeOpacity: 0.4, strokeWidth: 1.6 }),
    jsx("path", { d: streak(TH_KEY - 0.28, Y_GT + 60, Y_NECK - 70), stroke: "#FFFFFF", strokeWidth: 1.6, opacity: 0.35, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d: streak(TH_FAR, Y_GT + 40, Y_GB - 40), stroke: "#FFFFFF", strokeWidth: 1.5, opacity: 0.22, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d: D(ringS(Y_NECK, 12, 20)), fill: "none", stroke: "#DDE9F6", strokeOpacity: 0.45, strokeWidth: 1.2 }),
    glow > 0.003 && jsx("path", { d: glassD, fill: "#EAF2FB", opacity: 0.12 * clamp01(glow) }),
    front.map(Post),
    jsx(Turned, { id: `${id}pt`, rig, xf, profile: TOP_PLATE_P, ramp: WALNUT, spec: 0.85, n: 72 }),
    jsx(Turned, { id: `${id}ptb`, rig, xf, profile: PLATE_BAND(TOP_PLATE - PLATE_T / 2), ramp: BRASS, spec: 0.95, n: 72 }),
    // the top plate's face: two turned grooves
    [150, 112].map((r, k) => jsx("path", { d: D(ringS(TOP_PLATE - PLATE_T - 0.4, r, 64)), fill: "none", stroke: "#000000", strokeOpacity: 0.4, strokeWidth: 1.5 }, `tg${k}`)),
    [152, 114].map((r, k) => jsx("path", { d: D(ringS(TOP_PLATE - PLATE_T - 0.4, r, 64)), fill: "none", stroke: "#FFFFFF", strokeOpacity: 0.14, strokeWidth: 1 }, `th${k}`)),
    jsx(Turned, { id: `${id}f`, rig, xf, profile: FINIAL, ramp: BRASS, spec: 0.95, n: 40 })
  ] });
};
export const hourglassCorners = (at) => {
  const out = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [HOURGLASS_TOP, 0]) out.push([at[0] + sx * 200, at[1] + y, at[2] + sz * 200]);
  return out;
};
/** world points: the glass's neck, the top of the finial */
export const hourglassPt = (at, which) => which === "neck" ? [at[0], at[1] + Y_NECK, at[2]] : which === "top" ? [at[0], at[1] + HOURGLASS_TOP, at[2]] : [at[0], at[1] + Y_GB, at[2]];
