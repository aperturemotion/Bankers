// @ts-nocheck
// ★ V36 "Bre-X Gold" — builder F. THE GAVEL of the felderhof place, built as the real thing (no person, no courtroom people):
//   • a section of a judge's BENCH (REV1: "a lot more detailed"): a thick top with a bevelled edge over a moulded nosing, a flush
//     leather inlay with tooled and stitched borders under the block, a cove, a steel rail with end caps and screws, a frieze, a
//     panelled front (three raised fields in moulding frames between four pilasters with capitals and bases), a raised panel on the
//     near end, and a plinth with its cap moulding and toe; beside the block a desk MICROPHONE (weighted base, post, gooseneck,
//     capsule with grille);
//   • the SOUND BLOCK: a turned round block with a chamfered crown, a bead and an inlaid steel ring;
//   • the GAVEL: a turned head (two striking faces, chamfers, grooves, a centre band where the handle enters, two steel rings) on a
//     turned handle (collar, taper, grip, bead, knob). It lies on the bench beside its block, rises, and strikes on "not guilty".
//   Turned parts are drawn smooth (pension_turned.tsx). Bench-local coordinates: u right, v DOWN (floor 0), w toward the viewer.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { prism, rampAt } from "./solid_engine";
import { mapPath, mapScr, paintXf, rrectPts, worldScr, worldView, wound, xfApply, xfMul, xfPose, xfRotX, xfRotY, xfRotZ, xfTrans } from "./tk_rig";
import { HS_DOOR, HS_GROOVE, HS_LIP, HS_STONE, HS_TRIM, HS_WALL } from "./honest_mat_b";
import { PL_BODY, PL_STEEL } from "./counter_mat";
import { TK_FLOOR_Y } from "./tk_slab";
import { Turned } from "./pension_turned";

const f2 = (v) => v.toFixed(2);
export const BENCH = { W: 900, H: 800, Dc: 420, topT: 40, nose: 16, over: 30, plinthH: 70 };
const V_TOPS = -BENCH.H;                                   // the bench top's surface (bench-local v)
const ZFC = BENCH.Dc / 2;                                  // the carcass front
const WB = BENCH.W - 44;                                   // the carcass width
const V_RAIL = V_TOPS + BENCH.topT + BENCH.nose + 6;      // the steel rail under the nosing
const V_P0 = V_RAIL + 54, V_P1 = -BENCH.plinthH - 30;     // the panelled zone
const PIL = { w: 42, d: 12 };                              // the pilasters
const PIL_U = [-1, -1 / 3, 1 / 3, 1].map((k) => k * (WB / 2 - PIL.w / 2 - 4));
const PANELS = [0, 1, 2].map((i) => ({ u: (PIL_U[i] + PIL_U[i + 1]) / 2, w: PIL_U[i + 1] - PIL_U[i] - PIL.w - 24 }));
const TOP_D = BENCH.Dc + BENCH.over + 14, TOP_Z = ZFC + BENCH.over - TOP_D / 2;
/** the leather inlay on the top (bench-local u, w): flush, under the sound block and the gavel */
export const INLAY = { u: 40, w: -10, W: BENCH.W - 170, D: TOP_D - 120 };
let memo = null;
const pz = (poly, d, bev, w0) => wound(prism(poly, d, bev, 0, 1, () => false, [0, 0, w0]));
const parts = () => {
  if (memo) return memo;
  const { W, H, Dc, topT, nose, over, plinthH } = BENCH;
  // the top: a thick slab with a bevelled edge, and a moulded nosing step under its front
  const top = pz(rrectPts(W, topT, 8, 3, 0, -H + topT / 2), TOP_D, 12, TOP_Z);
  const nosing = pz(rrectPts(W - 16, nose, 5, 2, 0, -H + topT + nose / 2), TOP_D - 20, 6, TOP_Z - 4);
  const cove = pz(rrectPts(W - 40, 12, 4, 2, 0, -H + topT + nose + 6), Dc + 22, 4, 6);
  const body = pz(rrectPts(WB, H - topT - nose - plinthH, 3, 2, 0, (-H + topT + nose - plinthH) / 2), Dc, 4, 0);
  // the plinth: a deep base, its cap moulding and a toe step
  const plinth = pz(rrectPts(W - 24, plinthH - 12, 4, 2, 0, -(plinthH + 12) / 2), Dc + 26, 4, 0);
  const plinthCap = pz(rrectPts(W - 14, 12, 3, 2, 0, -plinthH - 2), Dc + 34, 4, 0);
  const toe = pz(rrectPts(W - 8, 12, 3, 2, 0, -6), Dc + 40, 3, 0);
  // the pilasters, their capitals and bases
  const pil = PIL_U.flatMap((u) => [
    ...prism(rrectPts(PIL.w, V_P1 - V_P0 + 40, 3, 2, u, (V_P0 + V_P1) / 2), PIL.d, 3, 0, 1, () => false, [0, 0, ZFC + PIL.d / 2]),
    ...prism(rrectPts(PIL.w + 18, 22, 3, 2, u, V_P0 - 22), PIL.d + 8, 3, 0, 1, () => false, [0, 0, ZFC + (PIL.d + 8) / 2]),
    ...prism(rrectPts(PIL.w + 18, 26, 3, 2, u, V_P1 + 30), PIL.d + 8, 3, 0, 1, () => false, [0, 0, ZFC + (PIL.d + 8) / 2])
  ]);
  // each panel: a raised moulding frame and a raised, deeply bevelled field inside it
  const ph = V_P1 - V_P0;
  const frames = PANELS.flatMap((p) => {
    const bar = (cu, cv, bw, bh) => prism(rrectPts(bw, bh, 2, 2, cu, cv), 6, 2.5, 0, 1, () => false, [0, 0, ZFC + 3]);
    return [...bar(p.u, V_P0 + 7, p.w, 14), ...bar(p.u, V_P0 + ph - 7, p.w, 14), ...bar(p.u - p.w / 2 + 7, V_P0 + ph / 2, 14, ph - 28), ...bar(p.u + p.w / 2 - 7, V_P0 + ph / 2, 14, ph - 28)];
  });
  const fields = PANELS.flatMap((p) => prism(rrectPts(p.w - 64, ph - 64, 4, 2, p.u, V_P0 + ph / 2), 10, 12, 0, 1, () => false, [0, 0, ZFC + 5]));
  // the steel rail under the nosing, with end caps
  const rail = [...prism(rrectPts(WB - 30, 12, 4, 2, 0, V_RAIL + 6), 12, 3, 0, 1, () => false, [0, 0, ZFC + 6]),
    ...[-1, 1].flatMap((sg) => prism(rrectPts(18, 22, 4, 2, sg * (WB / 2 - 15), V_RAIL + 6), 18, 4, 0, 1, () => false, [0, 0, ZFC + 9]))];
  // the near end's raised panel (built in its own plane, then turned onto the end face)
  const endField = prism(rrectPts(Dc - 120, ph - 40, 4, 2, 0, V_P0 + ph / 2), 8, 10, 0, 1, () => false, [0, 0, 4]);
  const endFrame = prism(rrectPts(Dc - 70, ph + 10, 4, 2, 0, V_P0 + ph / 2), 4, 2, 0, 1, () => false, [0, 0, 2]);
  memo = { top, nosing, cove, body, plinth, plinthCap, toe, pil: wound(pil), frames: wound(frames), fields: wound(fields), rail: wound(rail), endField: wound(endField), endFrame: wound(endFrame) };
  return memo;
};
const fillOf = (r, light, f) => rampAt(r, f.cap ? 0.62 * light + 0.06 : f.bev ? Math.min(1, 0.95 * light + 0.16) : 0.8 * light + 0.04);
const Paint = ({ faces, map, rig, ramp, spec = 0.5, dim = 0 }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: paintXf(faces, map, rig, spec).map((dw, k) => {
  const c = fillOf(ramp, dw.light * (1 - dim), dw.face);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
}) });
/** the judge's bench section, posed at its foot centre */
export const Bench = ({ id, rig, pose, sheen = 0 }) => {
  const map = (q) => xfApply(pose, q);
  // the near (left) end face: local (x, y, z) of an end part → (−WB/2 − z, y, x) (a quarter turn about the vertical)
  const mapEnd = (q) => xfApply(pose, [-WB / 2 - q[2], q[1], q[0]]);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const m = parts();
  const { W, H } = BENCH;
  const zf = ZFC + 0.3, yT = V_TOPS - 0.4;
  // the leather inlay: its panel, a tooled border line and a stitch line inside it
  const inl = (inset) => rrectPts(INLAY.W - 2 * inset, INLAY.D - 2 * inset, Math.max(2, 10 - inset / 2), 3, INLAY.u, INLAY.w).map(([u, w]) => [u, yT - 0.1 * inset, w]);
  const ip0 = mapScr(map, rig, [INLAY.u - INLAY.W / 2, V_TOPS, INLAY.w - INLAY.D / 2]), ip1 = mapScr(map, rig, [INLAY.u + INLAY.W / 2, V_TOPS, INLAY.w + INLAY.D / 2]);
  const s0 = -W / 2 - 160 + sheen;
  const band = (a, w2) => P([[s0 + a, yT, TOP_Z + TOP_D / 2], [s0 + a + w2, yT, TOP_Z + TOP_D / 2], [s0 + a + w2 + 70, yT, TOP_Z - TOP_D / 2], [s0 + a + 70, yT, TOP_Z - TOP_D / 2]]);
  const railScrews = Array.from({ length: 7 }, (_, k) => [-(WB - 90) / 2 + k * (WB - 90) / 6, V_RAIL + 6, ZFC + 12.4]);
  const grain = Array.from({ length: 10 }, (_, k) => {
    const w0 = TOP_Z - TOP_D / 2 + 12 + k * 5;
    return P(Array.from({ length: 9 }, (_, i) => [-W / 2 + 20 + i * (W - 40) / 8, yT, w0 + 2 * Math.sin(i * 1.3 + k)]), false);
  });
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Lt`, gradientUnits: "userSpaceOnUse", x1: f2(ip0[0]), y1: f2(ip0[1]), x2: f2(ip1[0]), y2: f2(ip1[1]), children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: "#1E3352" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: "#142640" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: "#0D1B2F" })
    ] }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: m.toe, map, rig, ramp: HS_WALL, spec: 0.3, dim: 0.2 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: m.plinth, map, rig, ramp: HS_WALL, spec: 0.3, dim: 0.1 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: m.plinthCap, map, rig, ramp: HS_TRIM, spec: 0.5 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: m.body, map, rig, ramp: HS_DOOR, spec: 0.35, dim: 0.08 }),
    // the near end's frame and raised field
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: m.endFrame, map: mapEnd, rig, ramp: HS_TRIM, spec: 0.45, dim: 0.1 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: m.endField, map: mapEnd, rig, ramp: HS_DOOR, spec: 0.5 }),
    // the front: panel recesses, moulding frames, raised fields, pilasters with capitals and bases
    PANELS.map((p, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(rrectPts(p.w + 6, V_P1 - V_P0 + 6, 3, 2, p.u, (V_P0 + V_P1) / 2).map(([a, b]) => [a, b, zf])), fill: "#000000", opacity: 0.22 }, `pr${k}`)),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: m.frames, map, rig, ramp: HS_TRIM, spec: 0.55 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: m.fields, map, rig, ramp: HS_DOOR, spec: 0.55, dim: -0.08 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: m.pil, map, rig, ramp: HS_TRIM, spec: 0.55 }),
    // the frieze under the rail: a groove and its lip
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[-WB / 2 + 8, V_P0 - 40, zf], [WB / 2 - 8, V_P0 - 40, zf]], false), stroke: HS_GROOVE, strokeWidth: 2.2, opacity: 0.8, fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[-WB / 2 + 8, V_P0 - 38, zf], [WB / 2 - 8, V_P0 - 38, zf]], false), stroke: HS_LIP, strokeWidth: 0.9, opacity: 0.3, fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: m.cove, map, rig, ramp: HS_TRIM, spec: 0.5, dim: 0.1 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: m.rail, map, rig, ramp: PL_STEEL, spec: 0.9 }),
    railScrews.map((c, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(Array.from({ length: 12 }, (_, i) => [c[0] + 3.4 * Math.cos(i / 12 * 2 * Math.PI), c[1] + 3.4 * Math.sin(i / 12 * 2 * Math.PI), c[2]])), fill: rampAt(PL_STEEL, 0.45), stroke: "#000000", strokeOpacity: 0.4, strokeWidth: 0.8 }, `rs${k}`)),
    // the top: nosing, slab, grain, the leather inlay with its tooling and stitching, a sheen
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: m.nosing, map, rig, ramp: HS_TRIM, spec: 0.6 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: m.top, map, rig, ramp: HS_STONE, spec: 0.65 }),
    grain.map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: k % 2 ? "#000000" : "#ffffff", strokeOpacity: k % 2 ? 0.07 : 0.04, strokeWidth: 1.1, fill: "none" }, `gr${k}`)),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(inl(-3)), fill: "#000000", opacity: 0.35 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(inl(0)), fill: `url(#${id}Lt)` }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(inl(9)), fill: "none", stroke: HS_LIP, strokeOpacity: 0.55, strokeWidth: 1.2 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(inl(16)), fill: "none", stroke: "#8FA9C8", strokeOpacity: 0.4, strokeWidth: 1, strokeDasharray: "5 4" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: band(0, 130), fill: "#ffffff", opacity: 0.035 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[-W / 2 + 14, V_TOPS + 1, TOP_Z + TOP_D / 2], [W / 2 - 14, V_TOPS + 1, TOP_Z + TOP_D / 2]], false), stroke: "#ffffff", strokeOpacity: 0.4, strokeWidth: 1.4, fill: "none", strokeLinecap: "round" })
  ] });
};
// ── the gooseneck microphone on the bench (a desk mic: weighted base, short post, flexible neck, capsule with its grille) ──
const rotYTo = (d) => {
  // the rotation taking +y onto the unit vector d (Rodrigues)
  const l = Math.hypot(d[0], d[1], d[2]), u = [d[0] / l, d[1] / l, d[2] / l];
  const ax = [-u[2], 0, u[0]], s = Math.hypot(ax[0], ax[2]), c = u[1];
  if (s < 1e-6) return { m: c > 0 ? [1, 0, 0, 0, 1, 0, 0, 0, 1] : [1, 0, 0, 0, -1, 0, 0, 0, -1], t: [0, 0, 0] };
  const k = [ax[0] / s, 0, ax[2] / s], C = 1 - c;
  return { m: [c + k[0] * k[0] * C, -k[2] * s, k[0] * k[2] * C, k[2] * s, c, -k[0] * s, k[2] * k[0] * C, k[0] * s, c + k[2] * k[2] * C], t: [0, 0, 0] };
};
export const Microphone = ({ id, rig, c }) => {
  const base = [{ y: -22, r: 0 }, { y: -22, r: 30 }, { y: -20, r: 38 }, { y: -17, r: 50 }, { y: -4, r: 58 }, { y: 0, r: 56 }, { y: 0, r: 0 }];
  const post = [{ y: -84, r: 0 }, { y: -84, r: 12 }, { y: -78, r: 12 }, { y: -76, r: 10 }, { y: -22, r: 10 }, { y: -22, r: 0 }];
  // the neck: a cubic curve from the post's top, up and over toward the front-left
  const A = [c[0], c[1] - 82, c[2]], B = [c[0], c[1] - 220, c[2] + 10], C2 = [c[0] - 30, c[1] - 300, c[2] + 80], D = [c[0] - 110, c[1] - 290, c[2] + 140];
  const bez = (t) => [0, 1, 2].map((i) => (1 - t) ** 3 * A[i] + 3 * (1 - t) ** 2 * t * B[i] + 3 * (1 - t) * t * t * C2[i] + t ** 3 * D[i]);
  const pts = Array.from({ length: 25 }, (_, i) => worldScr(rig, bez(i / 24)));
  const d = `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}`;
  const dir = [D[0] - C2[0], D[1] - C2[1], D[2] - C2[2]];
  const capXf = xfMul(xfTrans(D), rotYTo(dir));
  const capsule = [{ y: -2, r: 0 }, { y: -2, r: 11 }, { y: 8, r: 15 }, { y: 18, r: 15 }, { y: 21, r: 18 }, { y: 82, r: 18 }, { y: 88, r: 15 }, { y: 88, r: 0 }];
  const grille = [{ y: 28, r: 18.7 }, { y: 80, r: 18.7 }];
  const ring = [{ y: 11, r: 16 }, { y: 18, r: 16 }];
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath((q) => q, rig, Array.from({ length: 24 }, (_, i) => [c[0] + 14 + 62 * Math.cos(i / 24 * 2 * Math.PI), c[1] - 0.6, c[2] - 16 + 62 * Math.sin(i / 24 * 2 * Math.PI)])), fill: "#000000", opacity: 0.3, stroke: "#000000", strokeOpacity: 0.12, strokeWidth: 10 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}b`, rig, xf: xfTrans(c), profile: base, ramp: PL_BODY, spec: 0.9, n: 48 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}p`, rig, xf: xfTrans(c), profile: post, ramp: PL_STEEL, spec: 0.9, n: 20 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: rampAt(PL_BODY, 0.3), strokeWidth: 15, fill: "none", strokeLinecap: "round" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: rampAt(PL_STEEL, 0.75), strokeWidth: 4, fill: "none", strokeLinecap: "round", transform: "translate(-3.5 -3.5)", opacity: 0.6 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: "#000000", strokeWidth: 15, strokeDasharray: "1.8 3.6", fill: "none", opacity: 0.35 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}c`, rig, xf: capXf, profile: capsule, ramp: PL_BODY, spec: 0.9, n: 32 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}g`, rig, xf: capXf, profile: grille, ramp: PL_STEEL, spec: 0.6, n: 32, dim: 0.25 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}r`, rig, xf: capXf, profile: ring, ramp: PL_STEEL, spec: 0.95, n: 32 })
  ] });
};
// ── the sound block ──────────────────────────────────────────────────────────────────────────────────────────────────────
export const BLOCK = { r: 120, h: 50 };
const BLOCK_PROFILE = [{ y: -50, r: 0 }, { y: -50, r: 110 }, { y: -45, r: 119 }, { y: -42, r: 120 }, { y: -40, r: 117 }, { y: -36, r: 117 }, { y: -34, r: 120 }, { y: -5, r: 120 }, { y: -2, r: 118 }, { y: 0, r: 114 }, { y: 0, r: 0 }];
const BLOCK_RING = [{ y: -40.5, r: 118.6 }, { y: -35.5, r: 118.6 }];
/** the sound block standing at world point c (its foot's centre on the bench top) */
export const SoundBlock = ({ id, rig, c, lit = 0 }) => {
  const xf = xfTrans(c);
  // its contact shadow on the bench (thrown right and back, away from the key)
  const ring = (r, dx, dz) => Array.from({ length: 28 }, (_, i) => [c[0] + dx + r * Math.cos(i / 28 * 2 * Math.PI), c[1] - 0.6, c[2] + dz + r * Math.sin(i / 28 * 2 * Math.PI)]);
  const sh = mapPath((q) => q, rig, ring(BLOCK.r + 10, 16, -20));
  const sh2 = mapPath((q) => q, rig, ring(BLOCK.r + 2, 3, -3));
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: sh, fill: "#000000", opacity: 0.22, stroke: "#000000", strokeOpacity: 0.12, strokeWidth: 14, strokeLinejoin: "round" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: sh2, fill: "#000000", opacity: 0.45 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}b`, rig, xf, profile: BLOCK_PROFILE, ramp: PL_BODY, spec: 0.85, n: 72 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}r`, rig, xf, profile: BLOCK_RING, ramp: PL_STEEL, spec: 0.95, n: 72 }),
    lit > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath((q) => q, rig, Array.from({ length: 36 }, (_, i) => [c[0] + 104 * Math.cos(i / 36 * 2 * Math.PI), c[1] - BLOCK.h - 0.4, c[2] + 104 * Math.sin(i / 36 * 2 * Math.PI)])), fill: "#ffffff", opacity: 0.07 * clamp01(lit) })
  ] });
};
// ── the gavel ────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const GV = { headL: 200, headR: 49, faceR: 36, butt: 398, knobR: 21 };
const HEAD = [{ y: -100, r: 0 }, { y: -100, r: 36 }, { y: -96, r: 42 }, { y: -90, r: 45 }, { y: -62, r: 45 }, { y: -60, r: 42 }, { y: -56, r: 42 }, { y: -54, r: 45 }, { y: -22, r: 45 }, { y: -18, r: 49 }, { y: 18, r: 49 }, { y: 22, r: 45 }, { y: 54, r: 45 }, { y: 56, r: 42 }, { y: 60, r: 42 }, { y: 62, r: 45 }, { y: 90, r: 45 }, { y: 96, r: 42 }, { y: 100, r: 36 }, { y: 100, r: 0 }];
const HEAD_RINGS = [[{ y: -82, r: 46.4 }, { y: -72, r: 46.4 }], [{ y: 72, r: 46.4 }, { y: 82, r: 46.4 }]];
const HANDLE = [{ y: 0, r: 0 }, { y: 0, r: 14 }, { y: 12, r: 14 }, { y: 14, r: 17 }, { y: 22, r: 17 }, { y: 24, r: 13.5 }, { y: 150, r: 12.5 }, { y: 200, r: 14 }, { y: 290, r: 16.5 }, { y: 300, r: 18 }, { y: 306, r: 18 }, { y: 310, r: 15 }, { y: 318, r: 15 }, { y: 322, r: 19 }, { y: 338, r: 21 }, { y: 350, r: 19 }, { y: 356, r: 14 }, { y: 358, r: 0 }];
const HANDLE_IN = GV.butt - 358;   // the handle starts this far from the head's axis (inside the centre band)
/** the gavel's transform: pivot P (the butt's centre, world), yaw ψ, swing θ (about the swing axis; negative lifts the head), roll ρ
 *  (about the handle: 90 = lying on its side). Local frame: the head's centre at the origin, its axis local y, the handle along −x. */
export const gavelXf = (p) => xfMul(xfTrans(p.P), xfMul(xfRotY(p.psi), xfMul(xfRotZ(p.theta), xfMul(xfRotX(p.rho), xfTrans([GV.butt, 0, 0])))));
export const gavelHead = (p) => xfApply(gavelXf(p), [0, 0, 0]);
/** the gavel's soft shadow on the bench top (the key from the upper left front throws it right and back) — drawn UNDER the block */
export const GavelShadow = ({ rig, pose, shadowY }) => {
  const x = gavelXf(pose);
  const head = xfApply(x, [0, 0, 0]);
  const proj = (q) => {
    const d = Math.max(0, shadowY - q[1]);
    return [q[0] + 0.5 * d, shadowY - 0.5, q[2] - 0.62 * d];
  };
  const hScr = [-100, -50, 0, 50, 100].map((y) => worldScr(rig, proj(xfApply(x, [0, y, 0]))));
  const handleScr = [0, 0.25, 0.5, 0.75, 1].map((e) => worldScr(rig, proj(xfApply(x, [-(HANDLE_IN + e * 358), 0, 0]))));
  const lift = Math.max(0, shadowY - head[1] - GV.headR);
  const op = 0.3 / (1 + lift / 140);
  const polyD = (pts) => `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}`;
  const sc = worldScr(rig, [0, shadowY, 0]), s1 = worldScr(rig, [GV.headR, shadowY, 0]);
  const wHead = 1.7 * Math.abs(s1[0] - sc[0]);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [22, 10, 0].map((grow, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { opacity: [0.35, 0.5, 0.75][k] * op, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: polyD(hScr), stroke: "#000000", strokeWidth: wHead + grow, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: polyD(handleScr), stroke: "#000000", strokeWidth: 24 + grow, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" })
  ] }, k)) });
};
export const Gavel = ({ id, rig, pose, blockC }) => {
  const x = gavelXf(pose);
  const hx = xfMul(x, xfMul(xfTrans([-HANDLE_IN, 0, 0]), xfRotZ(90)));
  const head = xfApply(x, [0, 0, 0]), mid = xfApply(x, [-GV.butt / 2, 0, 0]);
  const handleFirst = worldView(rig, mid)[2] < worldView(rig, head)[2];
  // the head's contact darkening on the block's top as it comes down onto it
  const near = blockC ? clamp01(1 - (blockC[1] - BLOCK.h - (head[1] + 100)) / 80) : 0;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    near > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath((q) => q, rig, Array.from({ length: 24 }, (_, i) => [head[0] + 10 + 46 * Math.cos(i / 24 * 2 * Math.PI), blockC[1] - BLOCK.h - 0.5, head[2] - 12 + 46 * Math.sin(i / 24 * 2 * Math.PI)])), fill: "#000000", opacity: 0.32 * near, stroke: "#000000", strokeOpacity: 0.12 * near, strokeWidth: 10 }),
    handleFirst && /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}h`, rig, xf: hx, profile: HANDLE, ramp: PL_BODY, spec: 0.9, n: 36 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}H`, rig, xf: x, profile: HEAD, ramp: PL_BODY, spec: 0.9, n: 64 }),
    HEAD_RINGS.map((pr, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}R${k}`, rig, xf: x, profile: pr, ramp: PL_STEEL, spec: 0.95, n: 64 }, k)),
    !handleFirst && /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}h`, rig, xf: hx, profile: HANDLE, ramp: PL_BODY, spec: 0.9, n: 36 })
  ] });
};
export const benchCorners = (pose) => {
  const out = [];
  for (const u of [-BENCH.W / 2, BENCH.W / 2]) for (const v of [-BENCH.H, 0]) for (const w of [-ZFC, ZFC + BENCH.over]) out.push(xfApply(pose, [u, v, w]));
  return out;
};
export const BENCH_TOP_V = V_TOPS;
export const BENCH_FRONT = ZFC + BENCH.over;
