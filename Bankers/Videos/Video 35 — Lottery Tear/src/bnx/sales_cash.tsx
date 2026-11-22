// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { seeded } from "./common";
import { prism, rampAt } from "./solid_engine";
import { XPlane, facingM, mapPath, paintXf, rrectPts, worldScr, wound, xfApply, xfMul, xfRotX, xfRotY, xfRotZ, xfTrans } from "./tk_rig";
import { SL_BAND, SL_HAIR_D, SL_HAIR_L, SL_NOTE, SL_PAPER } from "./sales_mat";
import { scrHull } from "./sales_stack";
import { CashTop, CashTopLight } from "./money";

export const CB = { W: 284, D: 284 / 2.353, H: 21.6, gap: 7, r: 3, band: 284 * 0.22 };
export const CB_DEPTH = 2 * CB.D + CB.gap;
export const CB_SLOT = CB.D / 2 + CB.gap / 2;
const RX90 = xfRotX(90);
export const cashXf = (c, yaw, kh, tx = 0, tz = 0) => xfMul(xfTrans(c), xfMul(xfRotY(yaw), xfMul(xfRotX(tx), xfMul(xfRotZ(tz), xfMul(RX90, { m: [1, 0, 0, 0, 1, 0, 0, 0, kh], t: [0, 0, 0] })))));
const cashCorners = (x) => {
  const out = [];
  for (const u of [-CB.W / 2, CB.W / 2]) for (const v of [-CB.D / 2, CB.D / 2]) for (const w of [-CB.H / 2, CB.H / 2]) out.push(xfApply(x, [u, v, w]));
  return out;
};
export const cashFace = (x, top) => {
  const w = top ? CB.H / 2 : -CB.H / 2;
  return [[-CB.W / 2, -CB.D / 2, w], [CB.W / 2, -CB.D / 2, w], [CB.W / 2, CB.D / 2, w], [-CB.W / 2, CB.D / 2, w]].map((q) => xfApply(x, q));
};
let bodyMemo = null;
const bodyFaces = () => bodyMemo ??= wound(prism(rrectPts(CB.W, CB.D, CB.r, 2), CB.H, 0, 0, 1));
const hairMemo = /* @__PURE__ */ new Map();
const hairsOf = (seed) => {
  let m = hairMemo.get(seed);
  if (m) return m;
  const r = seeded(seed * 7919 + 101);
  const n = 9, hairs = [];
  for (let i = 0; i < n; i++) {
    const h = (i + 0.5 + (r() - 0.5) * 0.7) / n;
    hairs.push({ h: Math.min(0.94, Math.max(0.06, h)), a: r() * 2.4, b: r() * 2.4, dark: r() < 0.55, o: 0.5 + 0.5 * r() });
  }
  const proud = Array.from({ length: 3 }, (_, i) => ({ h: 0.18 + 0.64 * r(), end: i % 2 === 0 ? -1 : 1, l: 1.2 + 2.6 * r() }));
  m = { hairs, proud };
  hairMemo.set(seed, m);
  return m;
};
const f2 = (v) => v.toFixed(2);
export const CashBody = ({ id, rig, x, seed, dim }) => {
  const map = (q) => xfApply(x, q);
  const k = 1 - 0.42 * dim;
  const drawn = paintXf(bodyFaces(), map, rig, 0.25);
  const S = (q) => worldScr(rig, map(q));
  const seg = (a, b) => {
    const p = S(a), q = S(b);
    return `M${f2(p[0])},${f2(p[1])}L${f2(q[0])},${f2(q[1])}`;
  };
  const { hairs, proud } = hairsOf(seed);
  const H = CB.H, W = CB.W, D = CB.D, rr = CB.r, bw = CB.band / 2, o = 0.35;
  const walls = [
    { n: [0, 1, 0], at: (h, t) => [-W / 2 + rr + t * (W - 2 * rr), D / 2 + 0.12, h], len: W - 2 * rr, long: true },
    { n: [0, -1, 0], at: (h, t) => [W / 2 - rr - t * (W - 2 * rr), -D / 2 - 0.12, h], len: W - 2 * rr, long: true },
    { n: [1, 0, 0], at: (h, t) => [W / 2 + 0.12, D / 2 - rr - t * (D - 2 * rr), h], len: D - 2 * rr, long: false },
    { n: [-1, 0, 0], at: (h, t) => [-W / 2 - 0.12, -D / 2 + rr + t * (D - 2 * rr), h], len: D - 2 * rr, long: false }
  ].filter((w) => facingM(map, rig, w.n, w.at(0, 0.5)) > 0.02);
  let dark = "", lit = "", proudD = "", edgeL = "", edgeD = "";
  for (const w of walls) {
    for (const hr of hairs) {
      const h = -H / 2 + hr.h * H, a = hr.a / w.len, b = 1 - hr.b / w.len;
      const s = seg(w.at(h, a), w.at(h, b));
      if (hr.dark) dark += s;
      else lit += s;
    }
    edgeL += seg(w.at(H / 2 - 0.5, 4e-3), w.at(H / 2 - 0.5, 0.996));
    edgeD += seg(w.at(-H / 2 + 0.5, 4e-3), w.at(-H / 2 + 0.5, 0.996));
    if (w.long) for (const p of proud) {
      const h = -H / 2 + p.h * H, t0 = p.end < 0 ? 0 : 1 - 3 / w.len, t1 = p.end < 0 ? 3 / w.len : 1;
      const e0 = w.at(h, 0), e1 = w.at(h, 1), L = Math.hypot(e1[0] - e0[0], e1[1] - e0[1], e1[2] - e0[2]) || 1;
      const dir = [(e1[0] - e0[0]) / L, (e1[1] - e0[1]) / L, (e1[2] - e0[2]) / L];
      const A = w.at(h, t0), B = w.at(h, t1);
      const ext = p.l + rr;
      const A2 = p.end < 0 ? [A[0] - dir[0] * ext, A[1] - dir[1] * ext, A[2] - dir[2] * ext] : A;
      const B2 = p.end < 0 ? B : [B[0] + dir[0] * ext, B[1] + dir[1] * ext, B[2] + dir[2] * ext];
      proudD += seg(A2, B2);
    }
  }
  const bands = [1, -1].map((sv) => {
    const v = sv * (D / 2 + o), n = [0, sv, 0];
    if (facingM(map, rig, n, [0, v, 0]) <= 0.02) return null;
    const q = [[-bw, v, H / 2 + o], [bw, v, H / 2 + o], [bw, v, -H / 2 - o], [-bw, v, -H / 2 - o]];
    const nv = facingM(map, rig, n, [0, v, 0]);
    return { d: mapPath(map, rig, q), fold: seg(q[0], q[3]) + seg(q[1], q[2]), top: seg([-bw + 1, v, H / 2 + o - 0.3], [bw - 1, v, H / 2 + o - 0.3]), l: nv };
  }).filter((b) => !!b);
  const fill = (f, l) => f.cap ? f.n[2] > 0.5 ? mixHex(SL_NOTE, "#000000", clamp01(0.08 + 0.4 * dim)) : rampAt(SL_PAPER, 0.25 * k) : rampAt(SL_PAPER, clamp01((0.3 + 0.72 * l) * k));
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    drawn.map((dw, i) => {
      const c = fill(dw.face, dw.light);
      return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.5, strokeLinejoin: "round" }, i);
    }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dark, stroke: SL_HAIR_D, strokeWidth: 0.75, strokeOpacity: 0.42 * k, fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: lit, stroke: SL_HAIR_L, strokeWidth: 0.7, strokeOpacity: 0.5 * k, fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: edgeL, stroke: "#ffffff", strokeWidth: 1.1, strokeOpacity: 0.5 * k, fill: "none", strokeLinecap: "round" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: edgeD, stroke: "#000000", strokeWidth: 1.2, strokeOpacity: 0.32, fill: "none", strokeLinecap: "round" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: proudD, stroke: SL_HAIR_L, strokeWidth: 1.05, strokeOpacity: 0.85 * k, fill: "none", strokeLinecap: "round" }),
    bands.map((b, i) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: b.d, fill: rampAt(SL_BAND, clamp01((0.42 + 0.34 * b.l) * k)) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: b.fold, stroke: rampAt(SL_BAND, 0.25), strokeWidth: 1, strokeOpacity: 0.9, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: b.top, stroke: "#ffffff", strokeWidth: 1, strokeOpacity: 0.55 * k, fill: "none", strokeLinecap: "round" })
    ] }, `band${i}`))
  ] });
};
export const CashTopPlanes = ({ rig, x, kh, sheen, shade, probe }) => {
  const w = CB.H / 2 + 0.35 / kh;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x, u: -CB.W / 2, v: -CB.D / 2, w, width: CB.W, height: CB.D, probe, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CashTop, { w: CB.W, d: CB.D }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x, u: -CB.W / 2, v: -CB.D / 2, w: w + 0.05 / kh, width: CB.W, height: CB.D, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CashTopLight, { w: CB.W, d: CB.D, sheen, shade }) })
  ] });
};
export const CashContact = ({ id, rig, upper, lower }) => {
  const foot = mapPath((q) => q, rig, cashFace(upper, false));
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsx)("clipPath", { id: `${id}C`, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: scrHull(rig, cashCorners(lower)) }) }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { clipPath: `url(#${id}C)`, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: foot, fill: "#000000", opacity: 0.34, stroke: "#000000", strokeOpacity: 0.24, strokeWidth: 5, strokeLinejoin: "round" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: foot, fill: "none", stroke: "#000000", strokeOpacity: 0.55, strokeWidth: 1.6, strokeLinejoin: "round" })
    ] })
  ] });
};
export const CashDrop = ({ id, rig, x, y, clip }) => {
  const foot = cashFace(x, false);
  const d = Math.max(0, y - Math.max(...foot.map((q) => q[1])));
  const k = clamp01(1 - d / 320);
  if (k <= 0.01) return null;
  const pts = foot.map(([a, , c]) => [a, y - 0.5, c]);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsx)("clipPath", { id: `${id}D`, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: scrHull(rig, clip) }) }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { clipPath: `url(#${id}D)`, d: mapPath((q) => q, rig, pts), fill: "#000000", opacity: 0.42 * k * k, stroke: "#000000", strokeOpacity: 0.25 * k, strokeWidth: 2 + 16 * (1 - k), strokeLinejoin: "round" })
  ] });
};
