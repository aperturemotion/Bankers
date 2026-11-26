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
import { cw, cylW, prism, rampAt } from "./solid_engine";
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
  // REV1 (Timur: "more detail to … the table … more realistic"): a FIGURED veneer — long flowing grain with a cathedral crown in
  //   each field, book-matched about the centre line — inside an INLAID border: a pale stringer, a cross-banded band (its grain
  //   running across), a second stringer; the chairs REFLECTED in the lacquer, strongest at the far edge and fading toward us
  const grain = Array.from({ length: 26 }, (_, k) => {
    const z0 = -TB.D / 2 + 70 + k * ((TB.D - 140) / 25);
    const amp = 3 + 5 * Math.abs(Math.sin(k * 0.9));
    return { d: P(Array.from({ length: 22 }, (_, i) => {
      const x = -L / 2 + 80 + i * (L - 160) / 21;
      return [x, yT - 0.1, z0 + amp * Math.sin(i * 0.55 + k * 0.7) + 2.5 * Math.sin(i * 1.9 + k)];
    }), false), lit: k % 3 === 0, op: 0.04 + 0.05 * Math.abs(Math.sin(k * 1.7)) };
  });
  const crowns = [-1, 1].flatMap((sd) => [-0.32, 0.32].map((fx) => {
    const cx = fx * L, cz = sd * 6;
    return Array.from({ length: 5 }, (_, j) => {
      const rx = 90 + j * 34, rz = 26 + j * 15;
      return P(Array.from({ length: 19 }, (_, i) => {
        const a = Math.PI * (i / 18);
        return [cx - sd * 0 + rx * Math.cos(a) * (fx < 0 ? 1 : -1), yT - 0.1, cz + sd * rz * Math.sin(a) * 0.9 + sd * 40];
      }), false);
    });
  })).flat();
  const inset = (k) => rrectPts(L - 2 * TB.bev - 2 * k, TB.D - 2 * TB.bev - 2 * k, Math.max(8, TB.R - TB.bev - k), 6, 0, 0).map(([a, b]) => [a, yT - 0.2, b]);
  const xb0 = 44, xb1 = 66;
  const crossB = [-1, 1].map((sd) => {
    const z1 = sd * (TB.D / 2 - TB.bev - xb0), z2 = sd * (TB.D / 2 - TB.bev - xb1);
    let d = "";
    for (let x = -L / 2 + TB.R + 30; x < L / 2 - TB.R - 30; x += 9) d += P([[x, yT - 0.2, z1], [x + 2, yT - 0.2, z2]], false);
    return d;
  }).join("");
  const farY = mapScr(map, rig, [0, yT, -TB.D / 2])[1], nearY = mapScr(map, rig, [0, yT, TB.D / 2])[1];
  const midX = mapScr(map, rig, [0, yT, 0])[0];
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
      jsxs("linearGradient", { id: `${id}Rg`, gradientUnits: "userSpaceOnUse", x1: f2(midX), y1: f2(farY - 10), x2: f2(midX), y2: f2(farY + 0.62 * (nearY - farY)), children: [
        jsx("stop", { offset: "0", stopColor: "#ffffff", stopOpacity: 1 }),
        jsx("stop", { offset: "1", stopColor: "#ffffff", stopOpacity: 0 })
      ] }),
      jsx("mask", { id: `${id}Rm`, maskUnits: "userSpaceOnUse", x: -4000, y: -4000, width: 9000, height: 9000, children: jsx("path", { d: P(topPlan), fill: `url(#${id}Rg)` }) }),
      glow.map((gl, k) => {
        const c = mapScr(map, rig, [gl.x, yT, gl.z ?? -TB.D / 2 + 150]);
        return jsxs("radialGradient", { id: `${id}G${k}`, gradientUnits: "userSpaceOnUse", cx: f2(c[0]), cy: f2(c[1]), r: 230, gradientTransform: `translate(${f2(c[0])} ${f2(c[1])}) scale(1 0.42) translate(${f2(-c[0])} ${f2(-c[1])})`, children: [
          jsx("stop", { offset: "0", stopColor: "#DCE9F8", stopOpacity: 0.5 }),
          jsx("stop", { offset: "0.45", stopColor: "#8FB2DD", stopOpacity: 0.16 }),
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
      grain.map((g, k) => jsx("path", { d: g.d, stroke: g.lit ? "#BFD5EF" : "#000000", strokeOpacity: g.lit ? g.op * 0.8 : g.op * 2, strokeWidth: 1.1, fill: "none" }, `g${k}`)),
      crowns.map((d, k) => jsx("path", { d, stroke: k % 2 ? "#000000" : "#BFD5EF", strokeOpacity: k % 2 ? 0.12 : 0.05, strokeWidth: 1, fill: "none" }, `cr${k}`)),
      reflect && jsx("g", { mask: `url(#${id}Rm)`, children: jsx("g", { opacity: 0.55, children: reflect }) }),
      // the inlaid border: stringer, cross-banding, stringer
      jsx("path", { d: crossB, stroke: "#BFD5EF", strokeOpacity: 0.035, strokeWidth: 1, fill: "none" }),
      jsx("path", { d: P(inset(xb0)), fill: "none", stroke: "#AFC8E8", strokeOpacity: 0.34, strokeWidth: 1.4 }),
      jsx("path", { d: P(inset(xb1)), fill: "none", stroke: "#AFC8E8", strokeOpacity: 0.26, strokeWidth: 1.1 }),
      jsx("path", { d: P(inset(xb1 + 4)), fill: "none", stroke: "#000000", strokeOpacity: 0.3, strokeWidth: 1 }),
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
    jsx("path", { d: P(frontRun(TB_TOP + TB.bev + 8, 0), false), stroke: "#000000", strokeWidth: 3, fill: "none", opacity: 0.35 }),
    jsx("path", { d: P(frontRun(TB_TOP + TB.T - 2, -1), false), stroke: "#7FA3CE", strokeWidth: 1.2, fill: "none", opacity: 0.45 }),
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
  // mats: 0 leather · 1 polished chrome · 2 graphite/rubber
  // REV1 (Timur: "more detail to the chairs … more realistic"): the five-star base is polished chrome with twin-wheel CASTORS
  //   (a hood and two wheels on their axle at each spoke's end); the back's shell is graphite with a polished CHROME frame round
  //   its front bevel; the arms are chrome loops with stitched leather pads; the seat and back cushions carry piping and channels.
  const castor = [
    ...box(0, -30, 150, 22, 12, 26, 3, 1, 1, 6),
    ...[-1, 1].flatMap((s2) => xfFaces(cylW(0, 0, 13, -4, 4, 16, 2, 1), { m: xfRotY(90).m, t: [s2 * 7, -13, 156] }))
  ];
  const spokes = Array.from({ length: 5 }, (_, k) => xfFaces([
    ...box(0, -34, 74, 28, 14, 150, 5, 1, 1, 7),
    ...castor
  ], { m: xfRotY(k * 72 + 36).m, t: [0, 0, 0] })).flat();
  const column = [...vCyl(0, 0, -160, -34, 13, 1, 1), ...vCyl(0, 0, -128, -44, 20, 2, 1), ...vCyl(0, 0, -48, -30, 34, 1, 1)];
  const mech = box(0, SEAT_Y + 40, 0, 150, 22, 160, 4, 2, 1, 6);
  const pan = slab(0, SEAT_Y + 24, 6, 240, 12, 236, 30, 3, 2, 2);
  const seat = slab(0, SEAT_Y + 2, 10, 258, 42, 250, 40, 15, 0, 2);
  const shell = prism(BACK_OUT, BACK_D, 18, 0, 1).map((f) => ({ ...f, mat: f.bev ? 1 : f.cap ? 0 : 2 }));
  const back = xfFaces([
    ...shell,
    ...prism(CUSHION, 16, 7, 0, 1, () => false, [0, 0, ZF_B + 4]),
    ...prism(PILLOW, 24, 9, 0, 1, () => false, [0, 0, ZF_B + 6])
  ], BACK_XF);
  const arms = [-1, 1].flatMap((s2) => {
    const x = s2 * 142;
    return [
      ...box(x, SEAT_Y - 34, 70, 14, 80, 16, 5, 1, 2, 7),
      ...box(x, SEAT_Y - 34, -50, 14, 80, 16, 5, 1, 2, 7),
      ...box(x, SEAT_Y - 78, 10, 16, 10, 150, 4, 1, 2, 5),
      ...box(x, SEAT_Y - 92, 14, 38, 18, 176, 8, 0, 2, 9),
      ...box(s2 * 124, SEAT_Y + 26, 10, 30, 12, 140, 3, 1, 2, 4)
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
const lin = (id, a, b, stops) => jsx("linearGradient", { id, gradientUnits: "userSpaceOnUse", x1: f2(a[0]), y1: f2(a[1]), x2: f2(b[0]), y2: f2(b[1]), children: stops.map(([o, c, op], k) => jsx("stop", { offset: o, stopColor: c, stopOpacity: op }, k)) });
// the channels of the back cushion (back-local y, top → bottom); each band between two seams is a padded roll
const SEAMS = [-270, -226, -182, -138, -94, -34];
/** one executive chair, posed at its foot centre facing +z. lit 0…1 */
export const Chair = ({ id, rig, pose, lit = 0 }) => {
  const map = (q) => xfApply(pose, q);
  const dws = once(keyOf(rig, `${id}c`), () => painted(CP, map, rig, 0.6));
  const bmap = (q) => map(xfApply(BACK_XF, q));
  const P = (pts, close = false) => mapPath(bmap, rig, pts, close);
  const S = (q) => mapScr(bmap, rig, q);
  const dim = 0.55 * (1 - lit);
  const on = 1 - dim;
  const zc = ZF_B + 12.3, zp = ZF_B + 18.3;
  const cushion = P(CUSHION.map(([a, b]) => [a, b, zc]), true), pillow = P(PILLOW.map(([a, b]) => [a, b, zp]), true);
  // each padded roll: lit along its upper edge (the key light from above-left), shaded into the seam below
  const rolls = SEAMS.slice(0, -1).map((y0, k) => {
    const y1 = SEAMS[k + 1];
    return { d: P([[-112, y0, zc], [112, y0, zc], [112, y1, zc], [-112, y1, zc]], true), a: S([0, y0, zc]), b: S([0, y1, zc]) };
  });
  const seams = SEAMS.slice(1, -1).map((v) => ({
    g: P([[-100, v, zc], [100, v, zc]]),
    st: [P([[-96, v - 4.5, zc], [96, v - 4.5, zc]]), P([[-96, v + 4.5, zc], [96, v + 4.5, zc]])]
  }));
  // the pillow's seam and piping, the cushion's piping (a raised bead: its lit top and its shadow)
  const pipeC = rrectPts(206, 228, 30, 4, 0, -152);
  const pipeP = PILLOW.map(([a, b]) => [a * 0.95, -296 + (b + 296) * 0.92]);
  const hl = S([-70, -330, zp]);
  // the chrome frame's polished highlight (a thin bright line along its upper-left arc)
  const rimArc = arcPts(124, 98, -292, 20).slice(8, 21).map(([a, b]) => [a, b, ZF_B - 6]);
  // the seat cushion's channels (on its top face) and its front piping
  const sy = SEAT_Y + 2 - 21.3;
  const smap = (q) => map(q);
  const seatSeams = [-70, -20, 30, 80].map((z) => mapPath(smap, rig, [[-104, sy, z], [104, sy, z]], false));
  const seatPipe = mapPath(smap, rig, [[-118, sy + 2, 132], [118, sy + 2, 132]], false);
  return jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    jsxs("defs", { children: [
      jsx("clipPath", { id: `${id}Cc`, children: jsx("path", { d: cushion }) }),
      jsx("clipPath", { id: `${id}Pc`, children: jsx("path", { d: pillow }) }),
      rolls.map((r, k) => lin(`${id}R${k}`, r.a, r.b, [["0", "#DCE8F7", 0.2 * on], ["0.3", "#DCE8F7", 0.06 * on], ["0.72", "#000000", 0.08], ["1", "#000000", 0.42]])),
      lin(`${id}Pg`, S([0, -380, zp]), S([0, -282, zp]), [["0", "#DCE8F7", 0.26 * on], ["0.45", "#DCE8F7", 0.05], ["1", "#000000", 0.38]]),
      jsxs("radialGradient", { id: `${id}Hl`, gradientUnits: "userSpaceOnUse", cx: f2(hl[0]), cy: f2(hl[1]), r: 90, children: [
        jsx("stop", { offset: "0", stopColor: "#FFFFFF", stopOpacity: 0.34 * on }),
        jsx("stop", { offset: "1", stopColor: "#FFFFFF", stopOpacity: 0 })
      ] })
    ] }),
    jsx(Painted, { dws, mats: [BR_LEATHER, BR_STEEL, BR_RUBBER], dim, lift: 0.12 * lit }),
    // the back cushion: padded rolls, seams with a stitch line either side, piping round it
    jsx("g", { clipPath: `url(#${id}Cc)`, children: rolls.map((r, k) => jsx("path", { d: r.d, fill: `url(#${id}R${k})` }, k)) }),
    seams.map((c, k) => jsxs("g", { children: [
      jsx("path", { d: c.g, stroke: "#02060C", strokeOpacity: 0.7, strokeWidth: 2.4, fill: "none" }),
      c.st.map((d, j) => jsx("path", { d, stroke: "#B4CBE6", strokeOpacity: 0.32 * on, strokeWidth: 0.8, strokeDasharray: "2.5 2.5", fill: "none" }, j))
    ] }, k)),
    jsx("path", { d: P(pipeC.map(([a, b]) => [a + 1.2, b + 1.6, zc]), true), fill: "none", stroke: "#000000", strokeOpacity: 0.45, strokeWidth: 2.2 }),
    jsx("path", { d: P(pipeC.map(([a, b]) => [a, b, zc]), true), fill: "none", stroke: rampAt(BR_LEATHER, 0.86), strokeOpacity: 0.55 * on, strokeWidth: 1.6 }),
    // the pillow headrest: its own padded gradient, piping, the soft sheen of the key light on the leather
    jsx("g", { clipPath: `url(#${id}Pc)`, children: [
      jsx("path", { d: pillow, fill: `url(#${id}Pg)` }, "f"),
      jsx("ellipse", { cx: f2(hl[0]), cy: f2(hl[1]), rx: 95, ry: 46, fill: `url(#${id}Hl)` }, "h")
    ] }),
    jsx("path", { d: P(pipeP.map(([a, b]) => [a, b, zp]), true), fill: "none", stroke: "#B4CBE6", strokeOpacity: 0.28 * on, strokeWidth: 0.8, strokeDasharray: "2.5 2.5" }),
    // the polished chrome frame's highlight
    jsx("path", { d: P(rimArc), fill: "none", stroke: "#FFFFFF", strokeOpacity: 0.55 * (0.4 + 0.6 * on), strokeWidth: 2, strokeLinecap: "round" }),
    // the seat: channels and the front piping
    seatSeams.map((d, k) => jsx("path", { d, stroke: "#02060C", strokeOpacity: 0.5, strokeWidth: 1.8, fill: "none" }, `ss${k}`)),
    jsx("path", { d: seatPipe, stroke: rampAt(BR_LEATHER, 0.86), strokeOpacity: 0.5 * on, strokeWidth: 1.6, fill: "none" })
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
