// @ts-nocheck
// Video 36 "Bre-X Gold" — builder B's 3-D helpers for claim / claim2 / partner (2026-11-23), on Video 35's engine (tk_rig +
//   solid_engine): axis boxes and cylinders as wound faces, a PART painter (parts sorted back to front by their view depth, each
//   part's faces by the engine's own order, its decals painted right after it), and planar print in the SVG (an affine fitted to
//   the projected plane, so object text sits in painter order with the faces it is printed on).
import * as jsx_runtime from "react/jsx-runtime";
import { cw, cylW, prism, rampAt } from "./solid_engine";
import { XPlane, mapScr, paintXf, worldView, wound, xfApply, xfDir, xfMul, xfRotX, xfRotY, xfTrans } from "./tk_rig";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs, Fragment = jsx_runtime.Fragment;
export const f2 = (v) => v.toFixed(2);
export const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const xfFaces = (faces, x) => faces.map((f) => ({ ...f, pts: f.pts.map((p) => xfApply(x, p)), n: xfDir(x, f.n) }));
/** an axis-aligned box between corners a and b (local units), bevel bev, as wound faces */
export const boxAB = (a, b, bev = 0) => {
  const x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), y0 = Math.min(a[1], b[1]), y1 = Math.max(a[1], b[1]);
  const z0 = Math.min(a[2], b[2]), z1 = Math.max(a[2], b[2]);
  const bv = Math.min(bev, (x1 - x0) / 3, (y1 - y0) / 3, (z1 - z0) / 3);
  return wound(prism(cw([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]), z1 - z0, bv, 0, 1, () => false, [0, 0, (z0 + z1) / 2]));
};
/** an x-y polygon extruded along z from z0 to z1 */
export const extrudeZ = (poly, z0, z1, bev = 0) => wound(prism(cw(poly), z1 - z0, bev, 0, 1, () => false, [0, 0, (z0 + z1) / 2]));
/** a cylinder of radius r from p0 to p1 */
export const cylAB = (p0, p1, r, segs = 14) => {
  const d = sub3(p1, p0), L = Math.hypot(d[0], d[1], d[2]) || 1, u = mul3(d, 1 / L);
  const th = Math.asin(Math.max(-1, Math.min(1, -u[1]))) * 180 / Math.PI, ph = Math.atan2(u[0], u[2]) * 180 / Math.PI;
  return wound(xfFaces(cylW(0, 0, r, 0, L, segs, 0, 1), xfMul(xfTrans(p0), xfMul(xfRotY(ph), xfRotX(th)))));
};
export const centroid = (faces) => {
  let x = 0, y = 0, z = 0, n = 0;
  for (const f of faces) for (const p of f.pts) {
    x += p[0];
    y += p[1];
    z += p[2];
    n++;
  }
  return n ? [x / n, y / n, z / n] : [0, 0, 0];
};
/** one tone formula for every face (walls, caps and bevels alike; bevels catch the light) */
export const toneOf = (ramp, dw, dim = 0, lift = 0) => rampAt(ramp, (dw.face.bev ? Math.min(1, 0.95 * dw.light + 0.16) : 0.8 * dw.light + 0.04) * (1 - dim) + lift);
/** a part: { faces, ramp, spec?, c? (local centroid), bias? (view-depth nudge), layer?, after?: () => decals, dim?, lift? } */
export const part = (faces, ramp, o = {}) => ({ faces, ramp, spec: 0.45, ...o, c: o.c ?? centroid(faces) });
/** paint parts back to front (by layer, then view depth of each part's centroid), each with its decals right after it */
export const PaintParts = ({ parts, map, rig, id }) => {
  const order = parts.filter(Boolean).map((p, i) => ({ p, i, d: worldView(rig, map(p.c))[2] + (p.bias ?? 0) })).sort((a, b) => (a.p.layer ?? 0) - (b.p.layer ?? 0) || a.d - b.d);
  return /* @__PURE__ */ jsx(Fragment, { children: order.map(({ p, i }) => {
    const drawn = p.faces ? paintXf(p.faces, map, rig, p.spec) : [];
    return /* @__PURE__ */ jsxs("g", { opacity: p.op != null && p.op < 1 ? p.op : void 0, children: [
      drawn.map((dw, k) => {
        const c = p.tone ? p.tone(dw) : toneOf(p.ramp, dw, p.dim ?? 0, p.lift ?? 0);
        return /* @__PURE__ */ jsx("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
      }),
      p.after ? p.after(map, rig) : null
    ] }, `${id}${p.key ?? i}`);
  }) });
};
/** the SVG matrix that maps plane coordinates (px along u, px along v, from o) onto the screen — affine, fitted at o */
export const planeMatrix = (map, rig, o, u, v, s = 60) => {
  const O = mapScr(map, rig, o), U = mapScr(map, rig, add3(o, mul3(u, s))), V = mapScr(map, rig, add3(o, mul3(v, s)));
  return `matrix(${((U[0] - O[0]) / s).toFixed(5)} ${((U[1] - O[1]) / s).toFixed(5)} ${((V[0] - O[0]) / s).toFixed(5)} ${((V[1] - O[1]) / s).toFixed(5)} ${f2(O[0])} ${f2(O[1])})`;
};
/** whether the face with normal n through q faces the camera */
export const faces = (map, rig, n, q) => {
  const a = worldView(rig, map(q)), b = worldView(rig, map(add3(q, n)));
  const nv = sub3(b, a);
  return nv[0] * -a[0] + nv[1] * -a[1] + nv[2] * (rig.persp - a[2]) > 0;
};
/** ★ object print as HTML on a CSS-3-D plane (Video 35's XPlane), never SVG <text>: SVG text in these large SVGs made Chrome drop
 *  the whole SVG on random frames of a frame-sequence render (measured: the core-box stack vanished ~1 frame in 12; gone without
 *  the SVG text). A print = { o, u, v, text, size, fill, op, ls, family, probe } in the part's local units, its baseline along u,
 *  its height along v (the face's normal u × v must face the camera; the plane is back-face hidden). */
export const PlanePrint = ({ rig, pose, pr, k }) => {
  if ((pr.op ?? 1) <= 3e-3 || !pr.text) return null;
  const u = pr.u, v = pr.v, n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const x = xfMul(pose, { m: [u[0], v[0], n[0], u[1], v[1], n[1], u[2], v[2], n[2]], t: pr.o });
  const W = pr.width ?? Math.ceil(pr.text.length * pr.size * 0.9 + 40), H = Math.ceil(pr.size * 1.3);
  const anchor = pr.anchor ?? "middle";
  const left = anchor === "middle" ? -W / 2 : anchor === "end" ? -W : 0;
  return /* @__PURE__ */ jsx(XPlane, { rig, x, u: left, v: -H / 2 + (pr.dy ?? 0), w: 0.3, width: W, height: H, op: pr.op ?? 1, probe: pr.probe, children: /* @__PURE__ */ jsx("div", { style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: W,
    height: H,
    lineHeight: `${H}px`,
    textAlign: anchor === "middle" ? "center" : anchor === "end" ? "right" : "left",
    fontFamily: pr.family,
    fontWeight: pr.weight ?? 400,
    fontSize: pr.size,
    letterSpacing: pr.ls ?? 1,
    color: pr.fill,
    whiteSpace: "pre"
  }, children: pr.text }) }, k);
};
/** every print of a set of parts (drawn after their SVG — prints sit on outward faces nothing in the set covers) */
export const PartPrints = ({ parts, rig, pose, id }) => /* @__PURE__ */ jsx(Fragment, { children: parts.filter((p) => p && p.prints).flatMap((p, i) => p.prints.filter(Boolean).map((pr, j) => /* @__PURE__ */ jsx(PlanePrint, { rig, pose, pr, k: `${id}${p.key ?? i}_${j}` }, `${id}${p.key ?? i}_${j}`))) });
/** a closed 3-D polygon's screen path (or an open polyline) */
export const path3 = (map, rig, pts, close = true) => `M${pts.map((p) => {
  const q = mapScr(map, rig, p);
  return `${q[0].toFixed(2)},${q[1].toFixed(2)}`;
}).join("L")}${close ? "Z" : ""}`;
/** a circle of radius r around c in the plane spanned by u and v */
export const ring3 = (c, u, v, r, n = 28) => Array.from({ length: n }, (_, i) => {
  const a = i / n * 2 * Math.PI;
  return add3(c, add3(mul3(u, r * Math.cos(a)), mul3(v, r * Math.sin(a))));
});
/** a cubic bezier through 3-D control points, sampled */
export const bez3 = (p0, p1, p2, p3, n = 24) => Array.from({ length: n + 1 }, (_, i) => {
  const t = i / n, m = 1 - t;
  return [0, 1, 2].map((k) => m * m * m * p0[k] + 3 * m * m * t * p1[k] + 3 * m * t * t * p2[k] + t * t * t * p3[k]);
});
/** a seeded random stream (mulberry32) */
export const rnd = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = a + 1831565813 >>> 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};
export const sstep = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
