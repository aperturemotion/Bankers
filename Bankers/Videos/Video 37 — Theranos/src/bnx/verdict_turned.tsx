// @ts-nocheck
// ★ V37 "Theranos" — builder F. A TURNED BODY drawn SMOOTH (copied from Video 36 pension_turned.tsx, builder F, unchanged): each
//   band of a lathe profile is one gradient sampled from the key light across the band. Used by the hourglass (verdict), the
//   scales (cleared) and nothing else. The profile turns about the LOCAL +y axis; `xf` places it in the world (tk_rig).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { dot, lightOf, rampAt } from "./solid_engine";
import { unit3, worldScr, worldView, xfApply } from "./tk_rig";

const f2 = (v) => v.toFixed(2);
const newell = (p) => {
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i], b = p[(i + 1) % p.length];
    x += (a[1] - b[1]) * (a[2] + b[2]);
    y += (a[2] - b[2]) * (a[0] + b[0]);
    z += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return unit3([x, y, z]);
};
const viewScr = (rig, v) => {
  const k = rig.persp / Math.max(1, rig.persp - v[2]);
  return [rig.cx + v[0] * k, rig.cy + v[1] * k];
};
/** tone of a lit face on a 5-stop ramp, the house mapping (counter_plinth `tone`) */
const toneOf = (ramp, l, cap) => rampAt(ramp, cap ? 0.62 * l + 0.06 : 0.8 * l + 0.04);
/**
 * Build the painted parts of a turned body.
 * profile: [{ y, r }] from one end to the other along local +y (two points at one y = a flat face; r 0 closes the end).
 * Returns { faces: [{ d, depth, fill, stroke }], defs: [gradient specs] } — sorted far → near.
 */
export const turnedPaint = (id, rig, xf, profile, ramp, o = {}) => {
  const n = o.n ?? 56, spec = o.spec ?? 0.6, dim = o.dim ?? 0, capRamp = o.capRamp ?? ramp;
  const W = (q) => worldView(rig, xfApply(xf, q));
  const ring = (y, r) => Array.from({ length: n }, (_, i) => {
    const a = i / n * 2 * Math.PI;
    return [r * Math.cos(a), y, r * Math.sin(a)];
  });
  const faces = [], grads = [];
  for (let s = 0; s + 1 < profile.length; s++) {
    const A = profile[s], B = profile[s + 1];
    if (Math.abs(A.y - B.y) < 1e-6) {
      if (Math.abs(A.r - B.r) < 1e-6) continue;
      // a flat face (a disc or an annulus) facing along ±y: outward = toward the side the body is NOT on
      const prev = profile[s - 1], next = profile[s + 2];
      const ny = prev && prev.y < A.y - 1e-6 ? 1 : next && next.y > A.y + 1e-6 ? -1 : s === 0 ? -1 : 1;
      const ro = Math.max(A.r, B.r), ri = Math.min(A.r, B.r);
      const outer = ring(A.y, ro).map(W);
      const c = W([0, A.y, 0]), nv = unit3([W([0, A.y + ny, 0])[0] - c[0], W([0, A.y + ny, 0])[1] - c[1], W([0, A.y + ny, 0])[2] - c[2]]);
      if (dot(nv, [-c[0], -c[1], rig.persp - c[2]]) <= 1e-6) continue;
      const l = lightOf(nv, 0) * (1 - dim);
      const P = (pts) => `M${pts.map((v) => viewScr(rig, v)).map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`;
      const d = ri > 0.5 ? `${P(outer)} ${P(ring(A.y, ri).map(W).reverse())}` : P(outer);
      const col = toneOf(capRamp, l, true);
      // a soft radial sheen across a flat face, brightest toward the key (upper left)
      const gid = `${id}c${s}`;
      const sc = viewScr(rig, c), ex = viewScr(rig, W([ro, A.y, 0])), ez = viewScr(rig, W([0, A.y, ro]));
      const rr = Math.max(Math.hypot(ex[0] - sc[0], ex[1] - sc[1]), Math.hypot(ez[0] - sc[0], ez[1] - sc[1]), 1);
      grads.push({ kind: "radial", id: gid, cx: sc[0] - 0.35 * rr, cy: sc[1] - 0.35 * rr, r: 1.5 * rr, stops: [[0, mixHex(col, "#ffffff", 0.12)], [0.55, col], [1, mixHex(col, "#000000", 0.18)]] });
      faces.push({ d, depth: c[2], fill: `url(#${gid})`, stroke: "none", rule: "evenodd" });
      continue;
    }
    // a band: n quads; one gradient across it, perpendicular to the band's screen axis
    const ra = ring(A.y, A.r).map(W), rb = ring(B.y, B.r).map(W);
    const a0 = viewScr(rig, W([0, A.y, 0])), a1 = viewScr(rig, W([0, B.y, 0]));
    let ax = [a1[0] - a0[0], a1[1] - a0[1]];
    const al = Math.hypot(ax[0], ax[1]);
    if (al < 1e-3) {
      // the axis points at the eye: the band is seen end-on — fall back to a radial direction
      ax = [0, 1];
    } else ax = [ax[0] / al, ax[1] / al];
    const pp = [-ax[1], ax[0]];
    const vis = [];
    let depth = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const q = [ra[i], ra[j], rb[j], rb[i]];
      const nv = newell(q);
      const c = [(q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4, (q[0][2] + q[1][2] + q[2][2] + q[3][2]) / 4];
      // newell's sign follows the ring order; the outward normal points away from the axis
      const axisPt = W([0, (A.y + B.y) / 2, 0]);
      const out = [c[0] - axisPt[0], c[1] - axisPt[1], c[2] - axisPt[2]];
      const nn = dot(nv, out) < 0 ? [-nv[0], -nv[1], -nv[2]] : nv;
      if (dot(nn, [-c[0], -c[1], rig.persp - c[2]]) <= 1e-6) continue;
      const pts = q.map((v) => viewScr(rig, v));
      const sc = viewScr(rig, c);
      vis.push({ pts, o: (sc[0] - a0[0]) * pp[0] + (sc[1] - a0[1]) * pp[1], l: lightOf(nn, spec) * (1 - dim), z: c[2] });
      depth += c[2];
    }
    if (!vis.length) continue;
    depth /= vis.length;
    vis.sort((p, q) => p.o - q.o);
    const gid = `${id}b${s}`;
    // the band's silhouette offsets (the outermost visible quad edges)
    let lo = Infinity, hi = -Infinity;
    for (const v of vis) for (const p of v.pts) {
      const o2 = (p[0] - a0[0]) * pp[0] + (p[1] - a0[1]) * pp[1];
      lo = Math.min(lo, o2);
      hi = Math.max(hi, o2);
    }
    const span = Math.max(1e-3, hi - lo);
    const stops = vis.map((v) => [clamp01((v.o - lo) / span), toneOf(ramp, v.l, false)]);
    stops.unshift([0, stops[0][1]]);
    stops.push([1, stops[stops.length - 1][1]]);
    grads.push({ kind: "linear", id: gid, x1: a0[0] + pp[0] * lo, y1: a0[1] + pp[1] * lo, x2: a0[0] + pp[0] * hi, y2: a0[1] + pp[1] * hi, stops });
    const d = vis.map((v) => `M${v.pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`).join("");
    faces.push({ d, depth, fill: `url(#${gid})`, stroke: `url(#${gid})` });
  }
  faces.sort((p, q) => p.depth - q.depth);
  return { faces, grads };
};
export const TurnedDefs = ({ grads }) => /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: grads.map((g) => g.kind === "linear"
  ? /* @__PURE__ */ (0,jsx_runtime.jsx)("linearGradient", { id: g.id, gradientUnits: "userSpaceOnUse", x1: f2(g.x1), y1: f2(g.y1), x2: f2(g.x2), y2: f2(g.y2), children: g.stops.map(([t, c], k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: t.toFixed(4), stopColor: c }, k)) }, g.id)
  : /* @__PURE__ */ (0,jsx_runtime.jsx)("radialGradient", { id: g.id, gradientUnits: "userSpaceOnUse", cx: f2(g.cx), cy: f2(g.cy), r: f2(g.r), children: g.stops.map(([t, c], k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: t, stopColor: c }, k)) }, g.id)) });
/** a turned body as SVG children (defs + its faces, far → near) */
export const Turned = ({ id, rig, xf, profile, ramp, n, spec, dim, capRamp }) => {
  const { faces, grads } = turnedPaint(id, rig, xf, profile, ramp, { n, spec, dim, capRamp });
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TurnedDefs, { grads }),
    faces.map((fc, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: fc.d, fill: fc.fill, fillRule: fc.rule, stroke: fc.stroke, strokeWidth: fc.stroke === "none" ? void 0 : 0.6, strokeLinejoin: "round" }, k))
  ] });
};
/** the screen point of a local point on a placed body */
export const scrOf = (rig, xf, q) => worldScr(rig, xfApply(xf, q));
