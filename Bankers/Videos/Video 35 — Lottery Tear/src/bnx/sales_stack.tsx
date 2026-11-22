// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { label } from "./kit";
import { prism, rampAt } from "./solid_engine";
import { XPlane, mapPath, paintXf, rrectPts, scrPath, worldScr, wound, xfTrans } from "./tk_rig";
import { INK } from "./tk_mat";
import { TK_FLOOR_Y } from "./tk_slab";
import { SL_GROOVE, SL_LIP, SL_PAD, SL_RAIL, SL_STEEL } from "./sales_mat";

export const RAIL = { x: 540, len: 860, h: 56, d: 420, cap: 28, padW: 304, padH: 8, padD: 312, plaqueW: 196, plaqueH: 38 };
export const RAIL_TOP = TK_FLOOR_Y - RAIL.h;
export const SL_BASE = RAIL_TOP - RAIL.padH;
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
export const scrHull = (rig, pts) => scrPath(hull(pts.map((q) => worldScr(rig, q))));
let railMemo = null;
const railParts = (pads) => {
  if (railMemo) return railMemo;
  const beam = prism(rrectPts(RAIL.len, RAIL.h, 4, 2, 0, -RAIL.h / 2), RAIL.d, 5, 0, 1);
  const caps = [-1, 1].flatMap((s) => prism(rrectPts(RAIL.cap, RAIL.h + 14, 4, 2, s * (RAIL.len / 2 + RAIL.cap / 2 - 2), -(RAIL.h + 14) / 2), RAIL.d + 24, 4, 1, 1));
  const padF = pads.flatMap((u) => prism(rrectPts(RAIL.padW, RAIL.padH, 2, 2, u, -RAIL.h - RAIL.padH / 2), RAIL.padD, 2, 2, 2));
  railMemo = [wound(beam), wound(caps), wound(padF)];
  return railMemo;
};
export const SlRail = ({ id, rig, pads, prints, shades }) => {
  const map = (q) => [q[0] + RAIL.x, q[1] + TK_FLOOR_Y, q[2]];
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const padsU = pads.map((x) => x - RAIL.x);
  const [beam, caps, padF] = railParts(padsU);
  const fillOf = (r, light, f) => rampAt(r, f.cap ? 0.62 * light + 0.06 : f.bev ? Math.min(1, 0.95 * light + 0.16) : 0.8 * light + 0.04);
  const ZF = RAIL.d / 2 + 0.4, H = RAIL.h, L = RAIL.len / 2;
  const topFace = P([[-L, -H - 0.3, -RAIL.d / 2], [L, -H - 0.3, -RAIL.d / 2], [L, -H - 0.3, RAIL.d / 2], [-L, -H - 0.3, RAIL.d / 2]]);
  const arris = P([[-L + 6, -H + 0.6, ZF], [L - 6, -H + 0.6, ZF]], false);
  const step = P([[-L + 10, -18, ZF], [L - 10, -18, ZF]], false), stepLip = P([[-L + 10, -16.8, ZF], [L - 10, -16.8, ZF]], false);
  const screwU = [];
  for (let u = -L + 34; u <= L - 34; u += 62) if (padsU.every((p) => Math.abs(u - p) > RAIL.plaqueW / 2 + 22)) screwU.push(u);
  const ring = (u, v, r, w) => Array.from({ length: 18 }, (_, i) => [u + r * Math.cos(i / 18 * 2 * Math.PI), v + r * Math.sin(i / 18 * 2 * Math.PI), w]);
  const screws = screwU.map((u) => ({
    bore: P(ring(u, -36, 6.4, ZF)),
    head: P(ring(u, -36, 4.8, ZF + 0.3)),
    slot: P([[u - 3.6, -37.4, ZF + 0.5], [u + 3.6, -34.6, ZF + 0.5]], false),
    g: [worldScr(rig, map([u - 4, -40, ZF])), worldScr(rig, map([u + 4, -32, ZF]))]
  }));
  const plaque = (u) => rrectPts(RAIL.plaqueW, RAIL.plaqueH, 8, 3, u, -37).map(([a, b]) => [a, b, ZF]);
  const padTop = -H - RAIL.padH - 0.3;
  const padScrews = padsU.flatMap((pu) => [-1, 1].flatMap((su) => [-1, 1].map((sw) => {
    const u = pu + su * (RAIL.padW / 2 - 14), w = sw * (RAIL.padD / 2 - 14);
    const rr = (r) => Array.from({ length: 16 }, (_, i) => [u + r * Math.cos(i / 16 * 2 * Math.PI), padTop, w + r * Math.sin(i / 16 * 2 * Math.PI)]);
    return { bore: P(rr(6)), head: P(rr(4.4)) };
  })));
  const flyCut = padsU.flatMap((pu) => Array.from({ length: 9 }, (_, k) => {
    const r = 150 + k * 9, c = pu - 120;
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const a = -0.55 + 1.1 * i / 24, u = c + r * Math.cos(a), w = r * Math.sin(a);
      if (Math.abs(u - pu) < RAIL.padW / 2 - 6 && Math.abs(w) < RAIL.padD / 2 - 6) pts.push([u, padTop, w]);
    }
    return pts.length > 1 ? { d: P(pts, false), lit: k % 2 === 0 } : null;
  })).filter((x) => !!x);
  const brush = [];
  for (let k = 0; k < 9; k++) {
    const v = -H + 6 + k * 5.4;
    brush.push(P([[-L + 8, v, ZF + 0.1], [L - 8, v + 0.4, ZF + 0.1]], false));
  }
  const f2 = (v) => v.toFixed(2);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe-object": "the baseline rail", style: { position: "absolute", inset: 0 }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("defs", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("clipPath", { id: `${id}Tp`, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: topFace }) }),
        screws.map((s, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}S${k}`, gradientUnits: "userSpaceOnUse", x1: f2(s.g[0][0]), y1: f2(s.g[0][1]), x2: f2(s.g[1][0]), y2: f2(s.g[1][1]), children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: rampAt(SL_STEEL, 0.92) }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: rampAt(SL_STEEL, 0.5) }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: rampAt(SL_STEEL, 0.18) })
        ] }, k))
      ] }),
      paintXf(beam, map, rig, 0.45).map((dw, k) => {
        const c = fillOf(SL_RAIL, dw.light, dw.face);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, `b${k}`);
      }),
      paintXf(caps, map, rig, 0.55).map((dw, k) => {
        const c = fillOf(SL_RAIL, Math.min(1, dw.light * 1.08), dw.face);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, `c${k}`);
      }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("g", { clipPath: `url(#${id}Tp)`, children: shades.map((s, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: scrHull(rig, s), fill: "#000000", opacity: 0.42, stroke: "#000000", strokeOpacity: 0.2, strokeWidth: 10, strokeLinejoin: "round" }, `sh${k}`)) }),
      brush.map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: k % 2 ? "#ffffff" : "#000000", strokeWidth: 0.7, opacity: 0.035, fill: "none" }, `g${k}`)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: arris, stroke: "#ffffff", strokeWidth: 1.6, opacity: 0.42, fill: "none", strokeLinecap: "round" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: step, stroke: SL_GROOVE, strokeWidth: 2.2, opacity: 0.8, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: stepLip, stroke: SL_LIP, strokeWidth: 0.8, opacity: 0.35, fill: "none" }),
      screws.map((s, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: s.bore, fill: "#000000", opacity: 0.5 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: s.head, fill: `url(#${id}S${k})` }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: s.slot, stroke: "#000000", strokeWidth: 1.3, opacity: 0.6, fill: "none", strokeLinecap: "round" })
      ] }, `s${k}`)),
      padsU.map((u, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(plaque(u).map(([a, b, c]) => [a + 1.2, b + 1.2, c])), stroke: SL_LIP, strokeWidth: 0.9, opacity: 0.42, fill: "none", strokeLinejoin: "round" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(plaque(u)), stroke: SL_GROOVE, strokeWidth: 2.6, opacity: 0.88, fill: "none", strokeLinejoin: "round" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(plaque(u).map(([a, b, c]) => [a - 0.9, b - 0.9, c])), stroke: "#000000", strokeWidth: 0.9, opacity: 0.35, fill: "none", strokeLinejoin: "round" })
      ] }, `pq${k}`)),
      paintXf(padF, map, rig, 0.6).map((dw, k) => {
        const c = dw.face.cap ? rampAt(SL_PAD, 0.36 * dw.light + 0.04) : fillOf(SL_PAD, dw.light, dw.face);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.5, strokeLinejoin: "round" }, `p${k}`);
      }),
      flyCut.map((c, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: c.d, stroke: c.lit ? "#ffffff" : "#000000", strokeWidth: 1.1, opacity: c.lit ? 0.07 : 0.12, fill: "none" }, `fc${k}`)),
      padScrews.map((s, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: s.bore, fill: "#000000", opacity: 0.45 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: s.head, fill: rampAt(SL_STEEL, 0.62), stroke: rampAt(SL_STEEL, 0.9), strokeWidth: 0.6 })
      ] }, `ps${k}`))
    ] }),
    prints.map((p) => /* @__PURE__ */ (0,jsx_runtime.jsx)(RailPrintPlane, { rig, p }, p.key))
  ] });
};
const RailPrintPlane = ({ rig, p }) => {
  const on = clamp01(p.on);
  if (on <= 3e-3) return null;
  const W = RAIL.plaqueW - 24, Hh = 34;
  const x = xfTrans([RAIL.x, TK_FLOOR_Y, 0]);
  const u = p.u - RAIL.x - W / 2, v = -37 - Hh / 2, w = RAIL.d / 2 + 0.5;
  const el = (c) => ({ ...label(28, c), transform: "scale(1.06)" });
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x, u, v, w, width: W, height: Hh, op: on, probe: `the rail's year ${p.key}`, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "relative", width: W, height: Hh }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: 5.5, width: W, textAlign: "center", ...el(SL_LIP), opacity: 0.32 }, children: p.text }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: 4, width: W, textAlign: "center", ...el(SL_GROOVE), opacity: 0.85 }, children: p.text })
    ] }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x, u, v, w: w + 0.2, width: W, height: Hh, op: on, probe: `the rail's year ${p.key}`, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "relative", width: W, height: Hh }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: 2.5, width: W, textAlign: "center", ...el(INK) }, children: p.text }) }) })
  ] });
};
export const railCorners = () => {
  const out = [];
  for (const x of [RAIL.x - RAIL.len / 2 - RAIL.cap, RAIL.x + RAIL.len / 2 + RAIL.cap]) for (const y of [RAIL_TOP - 14, TK_FLOOR_Y]) for (const z of [-RAIL.d / 2, RAIL.d / 2]) out.push([x, y, z]);
  return out;
};
