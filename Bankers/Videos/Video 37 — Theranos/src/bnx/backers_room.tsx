// @ts-nocheck
// ★ V37 "Theranos" — builder M. THE BOARDROOM of the backers place (no people, no portraits):
//   • the TABLE — a long boardroom table: a thick polished top in graphite-blue lacquer with a bevelled edge all round and rounded
//     corners, a steel inlay line under its arris, a recessed sub-frame, a flush steel power/data channel down its middle with two
//     pop-up lids, a tooled leather blotter (stitched border) at each place, standing on two big satin-graphite pedestals with a
//     vertical steel reveal and a steel plinth foot each;
//   • the CHAIRS — a row of high-backed leather executive chairs, EMPTY, pushed in on the far side: a five-star steel base with
//     casters, a gas column in its rubber bellows, the seat mechanism, a thick seat cushion, a tall back with stitched horizontal
//     channels and a pillow headrest, loop arms (two steel posts, a steel rail, a leather pad). Two of them LIGHT UP.
//   Table-local frame: origin at the floor under the table's centre, x along it, y DOWN (up negative), z toward the viewer.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { cw, prism, rampAt } from "./solid_engine";
import { mapPath, mapScr, rrectPts, worldView, xfApply, xfMul, xfRotX, xfRotY, xfTrans } from "./tk_rig";
import { vCyl } from "./counter_plinth";
import { BR_BLOT, BR_EDGE, BR_LEATHER, BR_PED, BR_RUBBER, BR_STEEL, BR_TOP, Painted, box, painted, slab, xfFaces } from "./backers_kit";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
export const TB = { L: 1720, D: 560, H: 300, T: 30, R: 70, bev: 11 };
export const TB_TOP = -TB.H;                                  // the top surface (table-local y)
const PED = { w: 330, d: 250, foot: 14 };
const pedX = (L) => L / 2 - 360;
// the far side's chairs: six, evenly spaced, pushed in so their seat fronts sit under the top's back edge
export const CHAIR_N = 6, CHAIR_GAP = 268;
export const chairX = (i) => (i - (CHAIR_N - 1) / 2) * CHAIR_GAP;
export const CHAIR_Z = -TB.D / 2 - 150;
// the place in front of chair i (on its blotter): where its nameplate stands
export const placeZ = -TB.D / 2 + 150;
// ── the table ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const tableParts = (L) => {
  const top = slab(0, TB_TOP + TB.T / 2, 0, L, TB.T, TB.D, TB.R, TB.bev, 0, 2);
  const sub = slab(0, TB_TOP + TB.T + 9, 0, L - 180, 18, TB.D - 150, 30, 3, 1, 1);
  const peds = [-1, 1].flatMap((s) => {
    const x = s * pedX(L), h = TB.H - TB.T - 18 - PED.foot;
    return [
      ...box(x, -PED.foot - h / 2, 0, PED.w, h, PED.d, 6, 0, 1, 6),
      ...box(x, -PED.foot / 2, 0, PED.w + 34, PED.foot, PED.d + 34, 4, 0, 1, 4)
    ];
  });
  return { top, sub, peds };
};
const TPS = new Map();
const partsOf = (L) => {
  if (!TPS.has(L)) TPS.set(L, tableParts(L));
  return TPS.get(L);
};
const memo = new Map();
const keyOf = (rig, s) => `${s}|${rig.cx}|${rig.cy}|${rig.yaw}|${rig.pitch}|${rig.persp}`;
const once = (k, fn) => {
  if (memo.size > 600) memo.clear();
  if (!memo.has(k)) memo.set(k, fn());
  return memo.get(k);
};
export const tableCorners = (pose, L = TB.L) => {
  const out = [];
  for (const x of [-L / 2, L / 2]) for (const z of [-TB.D / 2, TB.D / 2]) out.push(xfApply(pose, [x, TB_TOP, z]), xfApply(pose, [x, 0, z * 0.45]));
  return out;
};
/** the table. sheen: a slow light travelling along the lacquer (world units along x); glow: [{ x, on }] spill pools on the top */
export const Table = ({ id, rig, pose, sheen = 0, glow = [], reflect, L = TB.L }) => {
  const TP = partsOf(L);
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const d = once(keyOf(rig, `${id}t${L}`), () => ({
    top: painted(TP.top, map, rig, 0.9),
    sub: painted(TP.sub, map, rig, 0.3),
    peds: painted(TP.peds, map, rig, 0.45)
  }));
  const yT = TB_TOP - 0.4;
  const topPlan = rrectPts(L - 2 * TB.bev, TB.D - 2 * TB.bev, TB.R - TB.bev, 6, 0, 0).map(([a, b]) => [a, yT, b]);
  // the power/data channel down the middle, with two pop-up lids
  const chan = rrectPts(L - 560, 34, 6, 2, 0, 0).map(([a, b]) => [a, yT - 0.2, b]);
  const lids = [-1, 1].map((s) => rrectPts(120, 26, 4, 2, s * 330, 0).map(([a, b]) => [a, yT - 0.4, b]));
  // blotters at the far places, with a stitched border
  const blot = (cx, ins) => rrectPts(232 - 2 * ins, 150 - 2 * ins, 10 - ins / 3, 3, cx, -TB.D / 2 + 120).map(([a, b]) => [a, yT - 0.3, b]);
  const g0 = mapScr(map, rig, [-L / 2, TB_TOP, -TB.D / 2]), g1 = mapScr(map, rig, [L / 2, TB_TOP, TB.D / 2]);
  const s0 = -L / 2 - 400 + sheen;
  const band = (a, w) => P([[s0 + a, yT - 0.5, TB.D / 2], [s0 + a + w, yT - 0.5, TB.D / 2], [s0 + a + w + 260, yT - 0.5, -TB.D / 2], [s0 + a + 260, yT - 0.5, -TB.D / 2]]);
  // the steel inlay under the arris (the front and the two front corners) and the lit arris itself
  const arc = (r, y, a0, a1, cx, cz, n = 10) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + (a1 - a0) * i / n;
    return [cx + r * Math.cos(a), y, cz + r * Math.sin(a)];
  });
  const R2 = TB.R - 1;
  const frontRun = (y, inset) => [
    ...arc(R2 - inset, y, Math.PI, Math.PI / 2, -L / 2 + TB.R, TB.D / 2 - TB.R),
    ...arc(R2 - inset, y, Math.PI / 2, 0, L / 2 - TB.R, TB.D / 2 - TB.R)
  ];
  const grain = Array.from({ length: 9 }, (_, k) => {
    const z0 = -TB.D / 2 + 40 + k * 56;
    return P(Array.from({ length: 12 }, (_, i) => [-L / 2 + 60 + i * (L - 120) / 11, yT - 0.1, z0 + 6 * Math.sin(i * 1.7 + k)]), false);
  });
  const pedReveal = [-1, 1].map((s) => {
    const x = s * pedX(L), zf = PED.d / 2 + 0.4, y0 = -PED.foot - 16, y1 = TB_TOP + TB.T + 34;
    return { groove: P([[x - 6, y0, zf], [x + 6, y0, zf], [x + 6, y1, zf], [x - 6, y1, zf]]), lip: P([[x - 6, y0, zf + 0.2], [x - 6, y1, zf + 0.2]], false) };
  });
  return jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    jsxs("defs", { children: [
      jsxs("linearGradient", { id: `${id}Tg`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
        jsx("stop", { offset: "0", stopColor: "#9FC0E6", stopOpacity: 0.07 }),
        jsx("stop", { offset: "0.45", stopColor: "#9FC0E6", stopOpacity: 0 }),
        jsx("stop", { offset: "1", stopColor: "#000000", stopOpacity: 0.3 })
      ] }),
      jsx("clipPath", { id: `${id}Tc`, children: jsx("path", { d: P(topPlan) }) }),
      glow.map((gl, k) => {
        const c = mapScr(map, rig, [gl.x, yT, gl.z ?? -TB.D / 2 + 150]);
        return jsxs("radialGradient", { id: `${id}G${k}`, gradientUnits: "userSpaceOnUse", cx: f2(c[0]), cy: f2(c[1]), r: 230, gradientTransform: `translate(${f2(c[0])} ${f2(c[1])}) scale(1 0.42) translate(${f2(-c[0])} ${f2(-c[1])})`, children: [
          jsx("stop", { offset: "0", stopColor: "#CFE0F5", stopOpacity: 0.34 }),
          jsx("stop", { offset: "0.5", stopColor: "#8FB2DD", stopOpacity: 0.12 }),
          jsx("stop", { offset: "1", stopColor: "#8FB2DD", stopOpacity: 0 })
        ] }, k);
      })
    ] }),
    jsx(Painted, { dws: d.peds, mats: [BR_PED, BR_STEEL] }),
    pedReveal.map((r, k) => jsxs("g", { children: [
      jsx("path", { d: r.groove, fill: rampAt(BR_STEEL, 0.55) }),
      jsx("path", { d: r.lip, stroke: "#ffffff", strokeOpacity: 0.35, strokeWidth: 1, fill: "none" })
    ] }, `pr${k}`)),
    jsx(Painted, { dws: d.sub, mats: [BR_PED, BR_PED], dim: 0.35 }),
    jsx(Painted, { dws: d.top, mats: [BR_TOP], sw: 0.8 }),
    jsx("path", { d: P(topPlan), fill: `url(#${id}Tg)` }),
    jsxs("g", { clipPath: `url(#${id}Tc)`, children: [
      reflect && jsx("g", { opacity: 0.3, children: reflect }),
      grain.map((g, k) => jsx("path", { d: g, stroke: k % 2 ? "#000000" : "#ffffff", strokeOpacity: k % 2 ? 0.1 : 0.035, strokeWidth: 1.2, fill: "none" }, `g${k}`)),
      jsx("path", { d: band(0, 150), fill: "#ffffff", opacity: 0.05 }),
      jsx("path", { d: band(190, 50), fill: "#ffffff", opacity: 0.035 }),
      glow.map((gl, k) => gl.on > 2e-3 && jsx("path", { d: P(topPlan), fill: `url(#${id}G${k})`, opacity: clamp01(gl.on), style: { mixBlendMode: "screen" } }, `gl${k}`))
    ] }),
    // the channel and its lids
    jsx("path", { d: P(chan), fill: rampAt(BR_STEEL, 0.34), stroke: "#000000", strokeOpacity: 0.5, strokeWidth: 1 }),
    jsx("path", { d: P(chan.map(([a, b, c]) => [a, b, c - 11]), true), fill: "none", stroke: "#ffffff", strokeOpacity: 0.12, strokeWidth: 0.8 }),
    lids.map((l, k) => jsx("path", { d: P(l), fill: rampAt(BR_STEEL, 0.5), stroke: "#000000", strokeOpacity: 0.55, strokeWidth: 1 }, `l${k}`)),
    // the blotters
    Array.from({ length: CHAIR_N }, (_, i) => Math.abs(chairX(i)) > L / 2 - 150 ? null : jsxs("g", { children: [
      jsx("path", { d: P(blot(chairX(i), -2)), fill: "#000000", opacity: 0.35 }),
      jsx("path", { d: P(blot(chairX(i), 0)), fill: rampAt(BR_BLOT, 0.36) }),
      jsx("path", { d: P(blot(chairX(i), 8)), fill: "none", stroke: "#8FA9C8", strokeOpacity: 0.32, strokeWidth: 0.9, strokeDasharray: "4 3" })
    ] }, `b${i}`)),
    // the lit arris along the front and the steel inlay under it
    jsx("path", { d: P(frontRun(TB_TOP + TB.bev + 3, 0), false), stroke: rampAt(BR_STEEL, 0.82), strokeWidth: 2.2, fill: "none", opacity: 0.8 }),
    jsx("path", { d: P(frontRun(yT, TB.bev - 1), false), stroke: "#ffffff", strokeOpacity: 0.45, strokeWidth: 1.5, fill: "none", strokeLinecap: "round" })
  ] });
};
// ── the chair ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const SEAT_Y = -200;
// the back: a contoured shell (a waist, broad shoulders, a rounded top), raked back 9°, its padded front cushion and pillow headrest
const BACK_XF = xfMul(xfTrans([0, SEAT_Y - 8, -116]), xfRotX(9));
const BACK_D = 60, ZF_B = BACK_D / 2;
const arcPts = (rx, ry, cy, n = 14) => Array.from({ length: n + 1 }, (_, i) => {
  const a = i / n * Math.PI;
  return [rx * Math.cos(a), cy - ry * Math.sin(a)];
});
const BACK_OUT = cw([[110, 0], [103, -62], [121, -200], [126, -292], ...arcPts(126, 100, -292).slice(1, -1), [-126, -292], [-121, -200], [-103, -62], [-110, 0]]);
const PILLOW = cw([[114, -296], ...arcPts(114, 84, -296).slice(1, -1), [-114, -296], [-108, -282], [108, -282]]);
const CUSHION = rrectPts(214, 236, 34, 4, 0, -152);
const chairParts = () => {
  // mats: 0 leather · 1 steel · 2 rubber/graphite
  const spokes = Array.from({ length: 5 }, (_, k) => xfFaces([
    ...box(0, -26, 74, 30, 16, 150, 4, 1, 1, 6),
    ...box(0, -15, 150, 26, 18, 30, 4, 2, 1, 8)
  ], { m: xfRotY(k * 72 + 36).m, t: [0, 0, 0] })).flat();
  const column = [...vCyl(0, 0, -150, -30, 14, 1, 1), ...vCyl(0, 0, -120, -40, 21, 2, 1)];
  const mech = box(0, SEAT_Y + 40, 0, 150, 22, 160, 4, 2, 1, 6);
  const pan = slab(0, SEAT_Y + 24, 6, 240, 12, 236, 30, 3, 2, 2);
  const seat = slab(0, SEAT_Y + 2, 10, 258, 42, 250, 40, 15, 0, 2);
  const back = xfFaces([
    ...prism(BACK_OUT, BACK_D, 18, 0, 1),
    ...prism(CUSHION, 16, 7, 0, 1, () => false, [0, 0, ZF_B + 4]),
    ...prism(PILLOW, 24, 9, 0, 1, () => false, [0, 0, ZF_B + 6])
  ], BACK_XF);
  const arms = [-1, 1].flatMap((s) => {
    const x = s * 142;
    return [
      ...box(x, SEAT_Y - 34, 70, 16, 80, 18, 4, 1, 2, 6),
      ...box(x, SEAT_Y - 34, -50, 16, 80, 18, 4, 1, 2, 6),
      ...box(x, SEAT_Y - 78, 10, 18, 10, 150, 3, 1, 2, 4),
      ...box(x, SEAT_Y - 92, 14, 38, 18, 176, 7, 0, 2, 9),
      ...box(s * 124, SEAT_Y + 26, 10, 30, 12, 140, 3, 1, 2, 4)
    ];
  });
  return [...spokes, ...column, ...mech, ...pan, ...seat, ...back, ...arms];
};
const CP = chairParts();
// the chair mirrored in the lacquered top (for its reflection), in chair-local coordinates
const MIRROR = { m: [1, 0, 0, 0, -1, 0, 0, 0, 1], t: [0, 2 * TB_TOP, 0] };
const CP_MIRROR = xfFaces(CP, MIRROR);
export const chairCorners = (pose) => {
  const out = [];
  for (const x of [-150, 150]) for (const z of [-150, 150]) out.push(xfApply(pose, [x, 0, z]), xfApply(pose, [x, SEAT_Y, z]));
  for (const x of [-123, 123]) out.push(xfApply(pose, xfApply(BACK_XF, [x, -392, 0])));
  return out;
};
/** the chair's top centre (world), for labels and lights */
export const chairTop = (pose) => xfApply(pose, xfApply(BACK_XF, [0, -392, 0]));
export const chairBackC = (pose) => xfApply(pose, xfApply(BACK_XF, [0, -200, 30]));
const leatherGrad = (id, a, b) => jsxs("linearGradient", { id, gradientUnits: "userSpaceOnUse", x1: f2(a[0]), y1: f2(a[1]), x2: f2(b[0]), y2: f2(b[1]), children: [
  jsx("stop", { offset: "0", stopColor: "#CFE0F5", stopOpacity: 0.2 }),
  jsx("stop", { offset: "0.35", stopColor: "#CFE0F5", stopOpacity: 0.05 }),
  jsx("stop", { offset: "0.7", stopColor: "#000000", stopOpacity: 0.05 }),
  jsx("stop", { offset: "1", stopColor: "#000000", stopOpacity: 0.3 })
] });
/** one executive chair, posed at its foot centre facing +z. lit 0…1 */
export const Chair = ({ id, rig, pose, lit = 0 }) => {
  const map = (q) => xfApply(pose, q);
  const dws = once(keyOf(rig, `${id}c`), () => painted(CP, map, rig, 0.55));
  const bmap = (q) => map(xfApply(BACK_XF, q));
  const P = (pts, close = false) => mapPath(bmap, rig, pts, close);
  const dim = 0.55 * (1 - lit);
  const zc = ZF_B + 12.3, zp = ZF_B + 18.3;
  // the cushion's stitched channels (a groove + a lit lip each) and its piping
  const ch = [-88, -132, -176, -220].map((v) => ({ g: P([[-98, v, zc], [98, v, zc]]), l: P([[-98, v + 1.8, zc], [98, v + 1.8, zc]]) }));
  const pipe = P(rrectPts(198, 220, 28, 4, 0, -152).map(([a, b]) => [a, b, zc]), true);
  const g0 = mapScr(bmap, rig, [-120, -390, zp]), g1 = mapScr(bmap, rig, [120, -20, zc]);
  return jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    jsx("defs", { children: leatherGrad(`${id}Lg`, g0, g1) }),
    jsx(Painted, { dws, mats: [BR_LEATHER, BR_STEEL, BR_RUBBER], dim, lift: 0.12 * lit }),
    jsx("path", { d: P(CUSHION.map(([a, b]) => [a, b, zc]), true), fill: `url(#${id}Lg)` }),
    jsx("path", { d: P(PILLOW.map(([a, b]) => [a, b, zp]), true), fill: `url(#${id}Lg)` }),
    jsx("path", { d: pipe, stroke: "#9DB7D8", strokeOpacity: 0.2 * (1 - dim), strokeWidth: 0.9, strokeDasharray: "3 3", fill: "none" }),
    ch.map((c, k) => jsxs("g", { children: [
      jsx("path", { d: c.g, stroke: "#000000", strokeOpacity: 0.55, strokeWidth: 2.2, fill: "none" }),
      jsx("path", { d: c.l, stroke: rampAt(BR_LEATHER, 0.8), strokeOpacity: 0.35 * (1 - dim), strokeWidth: 1, fill: "none" })
    ] }, k))
  ] });
};
/** the chair's reflection in the lacquered top (draw it clipped to the top, faint) */
export const ChairReflection = ({ id, rig, pose, lit = 0 }) => {
  const map = (q) => xfApply(pose, q);
  const dws = once(keyOf(rig, `${id}m`), () => painted(CP_MIRROR, map, rig, 0.4));
  return jsx(Painted, { dws, mats: [BR_LEATHER, BR_STEEL, BR_RUBBER], dim: 0.3 * (1 - lit), lift: 0.22 + 0.12 * lit });
};
/** depth of a world point in the view (larger = nearer) — to order chairs far → near */
export const viewDepth = (rig, w) => worldView(rig, w)[2];
