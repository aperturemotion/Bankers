// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { theme } from "./theme";
import { figure, label } from "./kit";
import { box3, cylW, prism, rampAt } from "./solid_engine";
import { XPlane, mapPath, mapScr, paintXf, rrectPts, wound, xfApply } from "./tk_rig";
import { INK } from "./tk_mat";
import { JP_BODY, JP_GROOVE, JP_LIP, JP_PLATE, JP_STEEL } from "./jackpot_mat";

const JP_PL = { w: 600, d: 690, skirt: 34, body: 168, plate: 22, over: 12, guideH: 38, guideT: 14, guideL: 64, clear: 14 };
export const JP_TOP_V = -(JP_PL.skirt + JP_PL.body + JP_PL.plate);
const ZF = JP_PL.d / 2;
const NP = { w: 470, h: 132, t: 8, v: -(JP_PL.skirt + JP_PL.body / 2) - 4 };
const BAND_V = -(JP_PL.skirt + 40);
const memo = /* @__PURE__ */ new Map();
const parts = (fw, fd) => {
  const key = `${fw.toFixed(1)}|${fd.toFixed(1)}`;
  const hit = memo.get(key);
  if (hit) return hit;
  const S = JP_PL;
  const skirt = prism(rrectPts(S.w + 36, S.skirt, 6, 2, 0, -S.skirt / 2), S.d + 36, 5, 0, 1);
  const body = prism(rrectPts(S.w, S.body, 10, 3, 0, -S.skirt - S.body / 2), S.d, 8, 0, 1);
  const plate = prism(rrectPts(S.w + 2 * S.over, S.plate, 5, 2, 0, -S.skirt - S.body - S.plate / 2), S.d + 2 * S.over, 4, 1, 1);
  const gx = fw / 2 + S.clear + S.guideT / 2, gz = fd / 2 + S.clear + S.guideT / 2, gy = JP_TOP_V - S.guideH / 2;
  const guide = (sx, sz) => [
    ...box3([sx * gx, gy, sz * (gz - S.guideL / 2 + S.guideT / 2)], [S.guideT, S.guideH, S.guideL], 2, 3),
    ...box3([sx * (gx - S.guideL / 2 + S.guideT / 2), gy, sz * gz], [S.guideL, S.guideH, S.guideT], 2, 3)
  ];
  const back = [...guide(-1, -1), ...guide(1, -1)], front = [...guide(-1, 1), ...guide(1, 1)];
  const plateN = prism(rrectPts(NP.w, NP.h, 8, 2, 0, NP.v), NP.t, 3, 2, 3, () => false, [0, 0, ZF + NP.t / 2]);
  const screws = [-1, 1].flatMap((su) => [-1, 1].flatMap((sv) => cylW(su * (NP.w / 2 - 20), NP.v + sv * (NP.h / 2 - 20), 8, ZF + NP.t, ZF + NP.t + 4, 16, 3, 5)));
  const out = [wound([...skirt, ...body, ...plate, ...back]), wound(plateN), wound(screws), wound(front)];
  memo.set(key, out);
  return out;
};
const ROWS = { name: { v: NP.v - 22, w: NP.w - 50, h: 92 }, sub: { v: NP.v + 40, w: NP.w - 50, h: 44 } };
const f2 = (v) => v.toFixed(2);
export const JpPlinth = ({ id, rig, pose, fw, fd, part, prints = [], seam = 0, dim = 0, probe = "the jackpot plinth" }) => {
  const map = (q) => xfApply(pose, q);
  const [shell, plateN, screws, front] = parts(fw, fd);
  const k = 1 - 0.35 * dim;
  const fillOf = (r, light, f) => rampAt(r, k * (f.cap ? 0.6 * light + 0.06 : f.bev ? Math.min(1, 0.95 * light + 0.16) : 0.8 * light + 0.04));
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  if (part === "front") return /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-object": `${probe}'s front guides`, style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: paintXf(front, map, rig, 0.6).map((dw, i) => {
    const c = fillOf(JP_PLATE, dw.light, dw.face);
    return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.5, strokeLinejoin: "round" }, i);
  }) }) });
  const S = JP_PL, s = clamp01(seam);
  const yP = JP_TOP_V - 0.3, hw = S.w / 2 + S.over, hd = ZF + S.over;
  const lip = P([[-hw + 6, -S.skirt - S.body - 1, hd + 0.3], [hw - 6, -S.skirt - S.body - 1, hd + 0.3]], false);
  const band = P([[-S.w / 2 + 4, BAND_V, ZF + 0.3], [S.w / 2 - 4, BAND_V, ZF + 0.3]], false);
  const bandSide = P([[S.w / 2 + 0.3, BAND_V, ZF - 4], [S.w / 2 + 0.3, BAND_V, -ZF + 4]], false);
  const brushLines = [];
  for (let i = 0; i < 30; i++) {
    const z = -hd + 12 + i * ((2 * hd - 24) / 29);
    brushLines.push(P([[-hw + 10, yP, z], [hw - 10, yP, z + 0.6]], false));
  }
  const fx = fw / 2 + S.clear + S.guideT + 10, fz = fd / 2 + S.clear + S.guideT + 10;
  const panel = P([[-fx, yP, -fz], [fx, yP, -fz], [fx, yP, fz], [-fx, yP, fz]]);
  const npB = rrectPts(NP.w - 22, NP.h - 22, 6, 2, 0, NP.v).map(([u, v]) => [u, v, ZF + NP.t + 0.3]);
  const brush = [];
  for (let i = 0; i < 18; i++) {
    const v = NP.v - NP.h / 2 + 8 + i * ((NP.h - 16) / 17);
    brush.push(P([[-NP.w / 2 + 8, v, ZF + NP.t + 0.2], [NP.w / 2 - 8, v + 0.5, ZF + NP.t + 0.2]], false));
  }
  const sa = mapScr(map, rig, [0, NP.v - NP.h / 2, ZF]), sb = mapScr(map, rig, [0, NP.v + NP.h / 2, ZF]);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe-object": probe, style: { position: "absolute", inset: 0 }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Np`, gradientUnits: "userSpaceOnUse", x1: f2(sa[0]), y1: f2(sa[1]), x2: f2(sb[0]), y2: f2(sb[1]), children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: "#ffffff", stopOpacity: 0.06 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: "#ffffff", stopOpacity: 0 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: "#000000", stopOpacity: 0.18 })
      ] }) }),
      paintXf(shell, map, rig, 0.5).map((dw, i) => {
        const c = fillOf(dw.face.mat === 2 ? JP_PLATE : JP_BODY, dw.light, dw.face);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, `s${i}`);
      }),
      brushLines.map((d, i) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: i % 2 ? "#ffffff" : "#000000", strokeWidth: 0.7, opacity: 0.035, fill: "none" }, `g${i}`)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: panel, stroke: JP_GROOVE, strokeWidth: 2.4, opacity: 0.8, fill: "none", strokeLinejoin: "round" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: panel, stroke: JP_LIP, strokeWidth: 0.8, opacity: 0.3, fill: "none", strokeLinejoin: "round", transform: "translate(0.8 1)" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: band, stroke: JP_GROOVE, strokeWidth: 3, opacity: 0.85, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: band, stroke: JP_LIP, strokeWidth: 0.9, opacity: 0.35, fill: "none", transform: "translate(0 1.6)" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: bandSide, stroke: JP_GROOVE, strokeWidth: 2.6, opacity: 0.7, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: lip, stroke: "#000000", strokeWidth: 3, opacity: 0.55, fill: "none" }),
      s > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: lip, stroke: theme.accent, strokeWidth: 14, opacity: 0.2 * s, fill: "none", strokeLinecap: "round" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: lip, stroke: theme.accentBright, strokeWidth: 2.4, opacity: 0.9 * s, fill: "none", strokeLinecap: "round" })
      ] }),
      paintXf(plateN, map, rig, 0.5).map((dw, i) => {
        const c = fillOf(JP_PLATE, dw.light, dw.face);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.5, strokeLinejoin: "round" }, `n${i}`);
      }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(rrectPts(NP.w - 6, NP.h - 6, 6, 2, 0, NP.v).map(([u, v]) => [u, v, ZF + NP.t + 0.25])), fill: `url(#${id}Np)` }),
      brush.map((d, i) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: i % 2 ? "#ffffff" : "#000000", strokeWidth: 0.7, opacity: 0.04, fill: "none" }, `b${i}`)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(npB.map(([u, v, w]) => [u + 1.1, v + 1.1, w])), stroke: JP_LIP, strokeWidth: 0.9, opacity: 0.4, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(npB), stroke: JP_GROOVE, strokeWidth: 2.4, opacity: 0.85, fill: "none" }),
      paintXf(screws, map, rig, 0.7).map((dw, i) => {
        const c = fillOf(JP_STEEL, dw.light, dw.face);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.4 }, `c${i}`);
      })
    ] }),
    prints.map((p) => /* @__PURE__ */ (0,jsx_runtime.jsx)(JpPrintPlane, { rig, pose, p }, p.key))
  ] });
};
const JpPrintPlane = ({ rig, pose, p }) => {
  const r = ROWS[p.row], name = p.row === "name";
  const el = (c) => name ? { ...figure(80, c), letterSpacing: 2 } : { ...label(28, c), transform: "scale(1.4)" };
  const w = ZF + NP.t;
  const on = clamp01(p.on);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x: pose, u: -r.w / 2, v: r.v - r.h / 2, w: w + 0.5, width: r.w, height: r.h, op: on, probe: `the plinth's engraving ${p.key}`, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "relative", width: r.w, height: r.h }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: name ? 7 : 9, width: r.w, textAlign: "center", ...el(JP_LIP), opacity: 0.32 }, children: p.text }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: name ? 5.5 : 7.5, width: r.w, textAlign: "center", ...el(JP_GROOVE), opacity: 0.9 }, children: p.text })
    ] }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x: pose, u: -r.w / 2, v: r.v - r.h / 2, w: w + 0.7, width: r.w, height: r.h, op: on, probe: `the plinth's engraving ${p.key}`, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "relative", width: r.w, height: r.h }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: name ? 4 : 6, width: r.w, textAlign: "center", ...el(INK) }, children: p.text }) }) })
  ] });
};
export const jpPlinthCorners = (pose) => {
  const out = [];
  const hw = JP_PL.w / 2 + 18, hd = ZF + 18;
  for (const u of [-hw, hw]) for (const v of [JP_TOP_V, 0]) for (const w of [-hd, hd]) out.push(xfApply(pose, [u, v, w]));
  return out;
};
const jpPlinthAt = (rig, pose, q) => mapScr((p) => xfApply(pose, p), rig, q);
const JP_NAMEPLATE_V = NP.v;
