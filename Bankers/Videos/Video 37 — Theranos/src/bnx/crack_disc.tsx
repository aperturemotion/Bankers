// @ts-nocheck
// ★ V37 "Theranos" — crack helper (builder C): THE TEST-MENU DISC, the film's ONE pie. A thick machined blue-steel disc lying on
//   the floor (V35's pie_coin recipe on V35/V36's tk_rig: a real extrusion with a bevelled top edge, a reeded rim wall with two
//   turned grooves, a raised outer band, a ring of 200 engraved ticks — one per test on the menu, every tenth long — lathe rings,
//   an engraved inner ring, four countersunk screws), lit by the house's one key light (solid_engine lightOf, upper left).
//   It splits into two solid pieces along two scored radii: the SLIVER (12 of the 200 ticks: the Edison's share, crack_data) and
//   the REMAINDER. The remainder slides out along its own bisector, in the disc's plane (V5's pie rule: a piece leaves the way a
//   real one would, in its own depth, never over the parts it was cut from); its machined cut faces show as it parts.
//   LOCAL FRAME (prism): x/y the disc's plane (pol(r, a): a = 90° points at the lens), w its thickness (w = +D/2 the top face).
//   <TestDisc id rig s /> (an SVG <g>), s = { spin, score, scoreOp, out, lit, ticks, dim }:
//     spin    the disc's turn about its axis (deg)       score  0…1 the two score lines drawn in from the rim
//     out     the remainder's slide (world units)         lit    0…1 the sliver lights (accent edges, lifted face)
//     ticks   0…1 the sliver's 12 ticks light in turn     dim    0…1 the remainder dims
//   discXf / pieceXf / discPoint(s, which) → world points ("centre", "sliver", "rest", "sliverTip", "restFar").
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { theme } from "./theme";
import { cw, lightOf, prism, rampAt } from "./solid_engine";
import { paintXf, unit3, worldScr, worldView, wound, xfApply, xfMul, xfRotX, xfRotZ, xfTrans } from "./tk_rig";
import { TK_FLOOR_Y } from "./tk_slab";
import { COIN, COIN_CUT, RELIEF_HI, RELIEF_LO } from "./pie_mat";
import { EDISON_SHARE, EDISON_TESTS, MENU_TESTS } from "./crack_data";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const D2R = Math.PI / 180;
export const DISC = { R: 250, D: 58, bev: 4.5, band: 20 };
export const DISC_AT = [540, TK_FLOOR_Y, 40];
// the sliver points left and a little toward the lens; the remainder leaves the opposite way (right, a little back)
export const SL_DIR = 162;
const SPAN = 360 * EDISON_SHARE;
const HALF = SPAN / 2;
const STEP = 1.2;
const TICK_STEP = 360 / MENU_TESTS;
const TICK_A = (k) => SL_DIR - HALF + TICK_STEP * (k + 0.5);
const inSpan = (sp, a, m = 0) => {
  let x = a;
  while (x < sp.a0) x += 360;
  while (x >= sp.a0 + 360) x -= 360;
  return x >= sp.a0 + m && x <= sp.a1 - m;
};
export const SP_SLIVER = { a0: SL_DIR - HALF, a1: SL_DIR + HALF };
export const SP_REST = { a0: SL_DIR + HALF, a1: SL_DIR + 360 - HALF };
// the data check: exactly the Edison's 12 ticks of the menu's 200 fall under the sliver
if (Array.from({ length: MENU_TESTS }, (_, k) => TICK_A(k)).filter((a) => inSpan(SP_SLIVER, a, 0.01)).length !== EDISON_TESTS)
  throw new Error("crack_disc: the sliver must hold exactly the Edison's 12 of the 200 ticks");
const pol = (r, deg) => [r * Math.cos(deg * D2R), r * Math.sin(deg * D2R)];
const arcPts = (a0, a1, r) => {
  const pts = [pol(r, a0)];
  for (let k = Math.floor(a0 / STEP) + 1; k * STEP < a1 - 1e-6; k++) pts.push(pol(r, k * STEP));
  pts.push(pol(r, a1));
  return pts;
};
const apex = (q) => Math.hypot(q[0], q[1]) < 1e-6;
const sectorSolid = (sp) => {
  const pts = cw([[0, 0], ...arcPts(sp.a0, sp.a1, DISC.R)]);
  const n = pts.length;
  return wound(prism(pts, DISC.D, DISC.bev, 0, 1, (i) => apex(pts[i]) || apex(pts[(i + 1) % n])));
};
const WHOLE = wound(prism(cw(Array.from({ length: Math.round(360 / STEP) }, (_, k) => pol(DISC.R, k * STEP))), DISC.D, DISC.bev, 0, 1));
const SLIVER = sectorSolid(SP_SLIVER);
const REST = sectorSolid(SP_REST);
// the disc's pose: lying on the floor (local w → up), turned `spin` about its axis
export const discXf = (s) => xfMul(xfTrans([DISC_AT[0], DISC_AT[1] - DISC.D / 2, DISC_AT[2]]), xfMul(xfRotX(90), xfRotZ(s.spin ?? 0)));
const restOff = (s) => pol(s.out ?? 0, SL_DIR + 180);
export const pieceXf = (s, which) => which === "rest" ? xfMul(discXf(s), xfTrans([...restOff(s), 0])) : discXf(s);
export const discPoint = (s, which) => {
  const top = DISC.D / 2;
  if (which === "centre") return xfApply(discXf(s), [0, 0, top]);
  if (which === "sliver") return xfApply(discXf(s), [...pol(0.62 * DISC.R, SL_DIR), top]);
  if (which === "sliverTip") return xfApply(discXf(s), [...pol(DISC.R, SL_DIR), top]);
  if (which === "rest") return xfApply(pieceXf(s, "rest"), [...pol(0.42 * DISC.R, SL_DIR + 180), top]);
  if (which === "restFar") return xfApply(pieceXf(s, "rest"), [...pol(DISC.R, SL_DIR + 180), top]);
  if (which === "restFront") return xfApply(pieceXf(s, "rest"), [...pol(DISC.R, 90), -DISC.D / 2]);
  if (which === "front") return xfApply(discXf(s), [...pol(DISC.R, 90), -DISC.D / 2]);
  throw new Error(`crack_disc: no point "${which}"`);
};
const SCREWS = [214, 262, 318, 20];
const LATHE = Array.from({ length: 26 }, (_, i) => 26 + i * 6.6);
// the top face's machining, for one piece (its span) or the whole disc (sp null): all paths in the piece's own frame
const FaceDetail = ({ rig, xf, sp, capL, ticksLit, id }) => {
  const R = DISC.R - DISC.bev, w = DISC.D / 2 + 0.2;
  const P = (u, v, ww = w) => worldScr(rig, xfApply(xf, [u, v, ww]));
  const path = (pts, close) => `M${pts.map(([u, v]) => {
    const q = P(u, v);
    return `${f2(q[0])},${f2(q[1])}`;
  }).join("L")}${close ? "Z" : ""}`;
  const a0 = sp ? sp.a0 : 0, a1 = sp ? sp.a1 : 360, close = !sp;
  const ring = (r) => arcPts(a0, a1, r);
  const ringD = (r) => path(ring(r), close);
  const rb = R - DISC.band;
  const band = sp ? path([...ring(R - 0.6), ...ring(rb).reverse()], true) : `${ringD(R - 0.6)} ${path(ring(rb).reverse(), true)}`;
  const ticks = [], ticksL = [];
  for (let k = 0; k < MENU_TESTS; k++) {
    const a = TICK_A(k);
    if (sp && !inSpan(sp, a, 0.25)) continue;
    const major = k % 10 === 9 || k === EDISON_TESTS - 1;
    const r0 = rb - 8, r1 = rb - (major ? 34 : 22);
    const d = path([pol(r0, a), pol(r1, a)], false), dl = path([pol(r0, a + 0.35), pol(r1, a + 0.35)], false);
    ticks.push({ k, d, dl, major });
  }
  const lathe = LATHE.filter((r) => r < rb - 46);
  const screwPts = SCREWS.filter((a) => !sp || inSpan(sp, a, 4)).map((a) => pol(0.66 * R, a));
  const screw = (u, v, k) => {
    const c = (r, dz = 0, du = 0, dv = 0) => path(Array.from({ length: 20 }, (_, i) => [u + du + r * Math.cos(i / 20 * 2 * Math.PI), v + dv + r * Math.sin(i / 20 * 2 * Math.PI)]), true);
    const sa = (40 + 70 * k) * D2R;
    return jsxs("g", { children: [
      jsx("path", { d: c(10.5, 0, 0.8, 1.2), fill: "#000000", opacity: 0.4 }),
      jsx("path", { d: c(9.5), fill: rampAt(COIN, capL - 0.12) }),
      jsx("path", { d: c(7.2), fill: rampAt(COIN, capL + 0.1) }),
      jsx("path", { d: c(3.8, 0, -1.6, -1.8), fill: rampAt(COIN, capL + 0.26), opacity: 0.7 }),
      jsx("path", { d: path([[u - 6.2 * Math.cos(sa), v - 6.2 * Math.sin(sa)], [u + 6.2 * Math.cos(sa), v + 6.2 * Math.sin(sa)]], false), stroke: RELIEF_LO, strokeWidth: 2.2, opacity: 0.85 })
    ] }, k);
  };
  return jsxs("g", { children: [
    // the raised outer band, a hair brighter, its inner edge turned (a dark groove with a light lip)
    jsx("path", { d: band, fill: rampAt(COIN, capL + 0.07), fillRule: "evenodd" }),
    jsx("path", { d: ringD(rb), fill: "none", stroke: RELIEF_LO, strokeWidth: 2.6, opacity: 0.8 }),
    jsx("path", { d: ringD(rb - 1.8), fill: "none", stroke: RELIEF_HI, strokeWidth: 0.9, opacity: 0.3 }),
    jsx("path", { d: ringD(R - 1.2), fill: "none", stroke: RELIEF_HI, strokeWidth: 1, opacity: 0.3 }),
    // lathe rings across the face
    lathe.map((r, i) => jsx("path", { d: ringD(r), fill: "none", stroke: i % 2 ? "#000000" : "#ffffff", strokeOpacity: i % 2 ? 0.07 : 0.05, strokeWidth: 1 }, `l${i}`)),
    // the engraved inner ring
    jsx("path", { d: ringD(0.42 * R), fill: "none", stroke: RELIEF_LO, strokeWidth: 2, opacity: 0.7 }),
    jsx("path", { d: ringD(0.42 * R + 1.6), fill: "none", stroke: RELIEF_HI, strokeWidth: 0.8, opacity: 0.28 }),
    jsx("path", { d: ringD(0.13 * R), fill: "none", stroke: RELIEF_LO, strokeWidth: 1.6, opacity: 0.6 }),
    // the 200 ticks, engraved
    ticks.map((t) => jsxs("g", { children: [
      jsx("path", { d: t.d, stroke: RELIEF_LO, strokeWidth: t.major ? 3 : 1.9, strokeLinecap: "round", opacity: 0.85 }),
      jsx("path", { d: t.dl, stroke: RELIEF_HI, strokeWidth: 0.8, strokeLinecap: "round", opacity: t.major ? 0.4 : 0.26 })
    ] }, t.k)),
    // the sliver's ticks light one by one (a blend, never a switch)
    ticksLit > 0 && ticks.filter((t) => t.k < EDISON_TESTS).map((t) => {
      const on = clamp01(ticksLit * (EDISON_TESTS + 3) - t.k);
      return on > 3e-3 ? jsxs("g", { opacity: on, children: [
        jsx("path", { d: t.d, stroke: theme.accent, strokeWidth: t.major ? 7 : 5.5, strokeLinecap: "round", opacity: 0.35 }),
        jsx("path", { d: t.d, stroke: theme.accentBright, strokeWidth: t.major ? 2.8 : 2, strokeLinecap: "round" })
      ] }, `t${t.k}`) : null;
    }),
    screwPts.map(([u, v], k) => screw(u, v, k))
  ] });
};
// brushed lines across a machined cut face
const CutBrush = ({ rig, xf, f }) => {
  const ws = f.pts.map((q) => q[2]), w0 = Math.min(...ws), w1 = Math.max(...ws);
  let a = f.pts[0], b = f.pts[0], best = -1;
  for (const q of f.pts) for (const r of f.pts) {
    const d = Math.hypot(q[0] - r[0], q[1] - r[1]);
    if (d > best) {
      best = d;
      a = q;
      b = r;
    }
  }
  return jsx(jsx_runtime.Fragment, { children: [0.2, 0.34, 0.5, 0.63, 0.8].map((t, i) => {
    const w = w0 + (w1 - w0) * t, p = worldScr(rig, xfApply(xf, [a[0], a[1], w])), q = worldScr(rig, xfApply(xf, [b[0], b[1], w]));
    return jsx("path", { d: `M${f2(p[0])},${f2(p[1])}L${f2(q[0])},${f2(q[1])}`, stroke: i % 2 ? "#000000" : "#ffffff", strokeOpacity: 0.09, strokeWidth: 1.1 }, i);
  }) });
};
// the soft shade a piece throws on the floor (its outline at the floor, pushed away from the key light) + a tight contact line
const shadeOf = (rig, xf, sp, k) => {
  const ring = sp ? [[0, 0], ...arcPts(sp.a0, sp.a1, DISC.R)] : arcPts(0, 360, DISC.R);
  const at = (u, v, du, dv) => worldScr(rig, xfApply(xf, [u, v, -DISC.D / 2 + 0.5]).map((c, i) => i === 0 ? c + du : i === 2 ? c + dv : c));
  const pd = (du, dv) => `M${ring.map(([u, v]) => {
    const q = at(u, v, du, dv);
    return `${f2(q[0])},${f2(q[1])}`;
  }).join("L")}Z`;
  return jsxs("g", { "data-probe-skip": true, children: [
    jsx("path", { d: pd(0.5 * DISC.D * k, -0.62 * DISC.D * k), fill: "#000000", fillOpacity: 0.32, stroke: "#000000", strokeOpacity: 0.12, strokeWidth: 26, strokeLinejoin: "round" }),
    jsx("path", { d: pd(0.5 * DISC.D * k, -0.62 * DISC.D * k), fill: "none", stroke: "#000000", strokeOpacity: 0.06, strokeWidth: 60, strokeLinejoin: "round" }),
    jsx("path", { d: pd(1.5, 1.5), fill: "#000000", fillOpacity: 0.55, stroke: "#000000", strokeOpacity: 0.35, strokeWidth: 5, strokeLinejoin: "round" })
  ] });
};
export const TestDisc = ({ id, rig, s }) => {
  const split = (s.out ?? 0) > 0.05;
  const pieces = split ? [
    { k: "rest", xf: pieceXf(s, "rest"), faces: REST, sp: SP_REST },
    { k: "sliver", xf: pieceXf(s, "sliver"), faces: SLIVER, sp: SP_SLIVER }
  ] : [{ k: "whole", xf: discXf(s), faces: WHOLE, sp: null }];
  const drawn = [];
  for (const pc of pieces) for (const dw of paintXf(pc.faces, (q) => xfApply(pc.xf, q), rig, 0.5)) {
    // the cut faces stay hidden until the pieces have visibly parted (no seam, no sliver of thickness through the face)
    if (dw.face.cut && (s.out ?? 0) < 0.6) continue;
    drawn.push({ ...dw, pc });
  }
  drawn.sort((a, b) => a.face.pass - b.face.pass || a.depth - b.depth);
  const xf0 = discXf(s);
  const topN = unit3((() => {
    const a = worldView(rig, xfApply(xf0, [0, 0, 0])), b = worldView(rig, xfApply(xf0, [0, 0, 1]));
    return [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  })());
  const capLight = lightOf(topN, 0);
  const lit = clamp01(s.lit ?? 0), dim = clamp01(s.dim ?? 0);
  const capOf = (pc) => 0.74 * capLight + 0.02 + (pc.k === "sliver" ? 0.2 * lit : pc.k === "rest" ? -0.12 * dim : 0);
  const mulOf = (pc) => pc.k === "rest" ? 1 - 0.18 * dim : 1;
  // the top face's gradient: the disc's own (userSpaceOnUse from its own corners), carried by each piece
  const grad = (pc) => {
    const L = capOf(pc), R = DISC.R;
    const g0 = worldScr(rig, xfApply(pc.xf, [-0.85 * R, -0.85 * R, DISC.D / 2])), g1 = worldScr(rig, xfApply(pc.xf, [0.85 * R, 0.85 * R, DISC.D / 2]));
    return jsxs("linearGradient", { id: `${id}G${pc.k}`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
      jsx("stop", { offset: "0", stopColor: rampAt(COIN, L + 0.14) }),
      jsx("stop", { offset: "0.3", stopColor: rampAt(COIN, L + 0.2) }),
      jsx("stop", { offset: "0.55", stopColor: rampAt(COIN, L - 0.02) }),
      jsx("stop", { offset: "1", stopColor: rampAt(COIN, L - 0.2) })
    ] }, pc.k);
  };
  const reed = (dw) => {
    const cx = dw.face.pts.reduce((a, q) => a + q[0], 0), cy = dw.face.pts.reduce((a, q) => a + q[1], 0);
    let a = Math.atan2(cy, cx) / D2R;
    if (a < 0) a += 360;
    return Math.floor(a / STEP) % 2;
  };
  // the score lines, drawn in from the rim along the two radii
  const scoreD = [SL_DIR - HALF, SL_DIR + HALF].map((a) => {
    const r0 = DISC.R - 2, r1 = r0 * (1 - clamp01(s.score ?? 0));
    const p = worldScr(rig, xfApply(xf0, [...pol(r0, a), DISC.D / 2 + 0.6])), q = worldScr(rig, xfApply(xf0, [...pol(Math.max(0, r1), a), DISC.D / 2 + 0.6]));
    return `M${f2(p[0])},${f2(p[1])}L${f2(q[0])},${f2(q[1])}`;
  }).join(" ");
  // the turned grooves round the rim wall (visible half only)
  const wallGroove = (pc, wz) => {
    const segs = [];
    let run = [];
    const sp = pc.sp ?? { a0: 0, a1: 360 };
    const N = Math.ceil((sp.a1 - sp.a0) / 2);
    for (let i = 0; i <= N; i++) {
      const a = sp.a0 + (sp.a1 - sp.a0) * i / N;
      const q = [...pol(DISC.R + 0.4, a), wz];
      const vp = worldView(rig, xfApply(pc.xf, q)), vn = worldView(rig, xfApply(pc.xf, [...pol(DISC.R + 1.4, a), wz]));
      const n = [vn[0] - vp[0], vn[1] - vp[1], vn[2] - vp[2]];
      const vis = n[0] * -vp[0] + n[1] * -vp[1] + n[2] * (rig.persp - vp[2]) > 0;
      if (vis) run.push(worldScr(rig, xfApply(pc.xf, q)));
      else if (run.length) {
        if (run.length > 1) segs.push(`M${run.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}`);
        run = [];
      }
    }
    if (run.length > 1) segs.push(`M${run.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}`);
    return segs.join(" ");
  };
  const sl = pieces.find((p) => p.k === "sliver") ?? pieces[0];
  const slOutline = (() => {
    const pts = [[0, 0], ...arcPts(SP_SLIVER.a0, SP_SLIVER.a1, DISC.R - DISC.bev)].map(([u, v]) => worldScr(rig, xfApply(sl.xf, [u, v, DISC.D / 2 + 0.4])));
    return `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`;
  })();
  return jsxs("g", { children: [
    jsx("defs", { "data-probe-skip": true, children: pieces.map(grad) }),
    pieces.map((pc) => jsx("g", { children: shadeOf(rig, pc.xf, pc.sp, 1) }, `sh${pc.k}`)),
    // every wall first (pass 1), then the tops (pass 2): the sort keeps that order
    drawn.map((dw, k) => {
      const f = dw.face, pc = dw.pc, m = mulOf(pc);
      if (f.cap && f.n[2] > 0) {
        return jsxs("g", { children: [
          jsx("path", { d: dw.d, fill: `url(#${id}G${pc.k})` }),
          jsx(FaceDetail, { rig, xf: pc.xf, sp: pc.sp, capL: capOf(pc), ticksLit: pc.k === "rest" ? 0 : s.ticks ?? 0, id: `${id}${pc.k}` })
        ] }, k);
      }
      if (f.cap) return null;
      if (f.cut) {
        const c2 = rampAt(COIN_CUT, dw.light * 0.95 * m + (pc.k === "sliver" ? 0.05 * lit : 0));
        return jsxs("g", { children: [
          jsx("path", { d: dw.d, fill: c2, stroke: c2, strokeWidth: 0.6, strokeLinejoin: "round" }),
          jsx(CutBrush, { rig, xf: pc.xf, f })
        ] }, k);
      }
      const l = f.bev ? 0.9 * dw.light + 0.16 : (reed(dw) ? 0.84 : 0.64) * dw.light + 0.02;
      const c = rampAt(COIN, l * m);
      return jsx("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.5, strokeLinejoin: "round" }, k);
    }),
    pieces.map((pc) => jsxs("g", { "data-probe-skip": true, children: [
      [-11, 11].map((wz) => jsx("path", { d: wallGroove(pc, wz), stroke: RELIEF_LO, strokeWidth: 2, opacity: 0.6 * mulOf(pc), fill: "none" }, wz)),
      jsx("path", { d: wallGroove(pc, -9.6), stroke: RELIEF_HI, strokeWidth: 0.7, opacity: 0.2, fill: "none" })
    ] }, `gr${pc.k}`)),
    (s.scoreOp ?? 0) > 3e-3 && (s.score ?? 0) > 1e-3 && jsxs("g", { opacity: clamp01(s.scoreOp), children: [
      jsx("path", { d: scoreD, stroke: theme.accent, strokeWidth: 6, strokeLinecap: "round", opacity: 0.35, fill: "none" }),
      jsx("path", { d: scoreD, stroke: theme.accentBright, strokeWidth: 1.8, strokeLinecap: "round", fill: "none" })
    ] }),
    // the sliver lit: its top edge rimmed with the light, a soft bloom
    lit > 3e-3 && jsxs("g", { opacity: lit, children: [
      jsx("path", { d: slOutline, fill: theme.accent, fillOpacity: 0.16, stroke: theme.accent, strokeWidth: 14, strokeOpacity: 0.32, strokeLinejoin: "round" }),
      jsx("path", { d: slOutline, fill: "none", stroke: theme.accentBright, strokeWidth: 2.6, strokeLinejoin: "round" })
    ] })
  ] });
};
void mixHex;
