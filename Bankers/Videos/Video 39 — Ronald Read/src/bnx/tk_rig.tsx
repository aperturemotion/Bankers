// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { D2R, cw, dot, lightOf } from "./solid_engine";

const rx = (p, a) => {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
};
const ry = (p, a) => {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
};
const rz = (p, a) => {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
};
export const unit3 = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const XF_ID = { m: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, 0] };
const mm = (a, b) => {
  const o = new Array(9).fill(0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
  return o;
};
const mv = (m, p) => [m[0] * p[0] + m[1] * p[1] + m[2] * p[2], m[3] * p[0] + m[4] * p[1] + m[5] * p[2], m[6] * p[0] + m[7] * p[1] + m[8] * p[2]];
export const xfMul = (a, b) => ({ m: mm(a.m, b.m), t: add3(mv(a.m, b.t), a.t) });
export const xfApply = (x, p) => add3(mv(x.m, p), x.t);
export const xfDir = (x, n) => mv(x.m, n);
export const xfTrans = (t) => ({ m: XF_ID.m, t });
export const xfScale = (k) => ({ m: [k, 0, 0, 0, k, 0, 0, 0, k], t: [0, 0, 0] });
export const xfRotX = (deg) => {
  const a = deg * D2R, c = Math.cos(a), s = Math.sin(a);
  return { m: [1, 0, 0, 0, c, -s, 0, s, c], t: [0, 0, 0] };
};
export const xfRotY = (deg) => {
  const a = deg * D2R, c = Math.cos(a), s = Math.sin(a);
  return { m: [c, 0, s, 0, 1, 0, -s, 0, c], t: [0, 0, 0] };
};
export const xfRotZ = (deg) => {
  const a = deg * D2R, c = Math.cos(a), s = Math.sin(a);
  return { m: [c, -s, 0, s, c, 0, 0, 0, 1], t: [0, 0, 0] };
};
export const xfAbout = (rot, p) => xfMul(xfTrans(p), xfMul(rot, xfTrans(mul3(p, -1))));
export const xfPose = (x, y, z, k = 1, yaw = 0, pitch = 0, roll = 0) => xfMul(xfTrans([x, y, z]), xfMul(xfRotY(yaw), xfMul(xfRotX(pitch), xfMul(xfRotZ(roll), xfScale(k)))));
export const xfLerp = (a, b, e) => ({ m: a.m.map((v, i) => v + (b.m[i] - v) * e), t: [0, 1, 2].map((i) => a.t[i] + (b.t[i] - a.t[i]) * e) });
const view = (rig, p) => rx(ry(p, rig.yaw * D2R), rig.pitch * D2R);
export const worldView = (rig, w) => view(rig, [w[0] - rig.cx, w[1] - rig.cy, w[2]]);
const viewScr = (rig, v) => {
  const k = rig.persp / Math.max(1, rig.persp - v[2]);
  return [rig.cx + v[0] * k, rig.cy + v[1] * k];
};
export const worldScr = (rig, w) => viewScr(rig, worldView(rig, w));
const xfMap = (x) => (q) => xfApply(x, q);
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
export const wound = (faces) => faces.map((f) => dot(newell(f.pts), f.n) < 0 ? { ...f, pts: [...f.pts].reverse() } : f);
export const paintXf = (faces, map, rig, spec = 0.5) => {
  const out = [];
  for (const f of faces) {
    const vpt = f.pts.map((p) => worldView(rig, map(p)));
    const c = [0, 0, 0];
    for (const r of vpt) {
      c[0] += r[0];
      c[1] += r[1];
      c[2] += r[2];
    }
    c[0] /= vpt.length;
    c[1] /= vpt.length;
    c[2] /= vpt.length;
    const nv = newell(vpt);
    if (dot(nv, [-c[0], -c[1], rig.persp - c[2]]) <= 1e-6) continue;
    const pts = vpt.map((v) => viewScr(rig, v));
    out.push({ d: `M${pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join("L")}Z`, face: f, nv, depth: c[2], light: lightOf(nv, f.cap ? 0 : spec), pts });
  }
  return out.sort((a, b) => a.face.pass - b.face.pass || a.depth - b.depth);
};
export const facingM = (map, rig, n, q) => {
  const a = worldView(rig, map(q)), b = worldView(rig, map([q[0] + n[0], q[1] + n[1], q[2] + n[2]]));
  const nv = unit3(sub3(b, a));
  return dot(nv, [-a[0], -a[1], rig.persp - a[2]]) / Math.hypot(a[0], a[1], rig.persp - a[2]);
};
export const normalM = (map, rig, n, q) => unit3(sub3(worldView(rig, map([q[0] + n[0], q[1] + n[1], q[2] + n[2]])), worldView(rig, map(q))));
export const mapScr = (map, rig, q) => worldScr(rig, map(q));
export const mapPath = (map, rig, pts, close = true) => `M${pts.map((p) => {
  const q = worldScr(rig, map(p));
  return `${q[0].toFixed(2)},${q[1].toFixed(2)}`;
}).join("L")}${close ? "Z" : ""}`;
export const scrPath = (pts, close = true) => `M${pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join("L")}${close ? "Z" : ""}`;
export const rrectPts = (w, h, r, seg = 5, cx = 0, cy = 0) => {
  const pts = [];
  const q = Math.min(r, w / 2, h / 2);
  const corner = (ox, oy, a0) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + i / seg * (Math.PI / 2);
      pts.push([cx + ox + q * Math.cos(a), cy + oy + q * Math.sin(a)]);
    }
  };
  corner(w / 2 - q, -h / 2 + q, -Math.PI / 2);
  corner(w / 2 - q, h / 2 - q, 0);
  corner(-w / 2 + q, h / 2 - q, Math.PI / 2);
  corner(-w / 2 + q, -h / 2 + q, Math.PI);
  return cw(pts);
};
const BOXES = [
  { d: unit3([-0.42, -0.5, 0.76]), lo: 0.955, hi: 0.992, k: 1 },
  { d: unit3([0.62, -0.18, 0.76]), lo: 0.972, hi: 0.996, k: 0.75 },
  { d: unit3([-0.1, 0.55, 0.83]), lo: 0.975, hi: 0.995, k: 0.3 }
];
const sstep = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export const reflectStudio = (nv, vp, persp, soft = 0) => {
  const V = unit3([-vp[0], -vp[1], persp - vp[2]]);
  const k = 2 * dot(nv, V);
  const R = [k * nv[0] - V[0], k * nv[1] - V[1], k * nv[2] - V[2]];
  let s = 0;
  for (const b of BOXES) s += b.k * sstep(b.lo - soft, b.hi, dot(R, b.d));
  return s;
};
const f4 = (v) => Math.abs(v) < 1e-7 ? "0" : v.toFixed(4);
const planeCssXf = (rig, x, u, v, w) => {
  const m = x.m;
  return `perspective(${f4(rig.persp)}px) rotateX(${f4(rig.pitch)}deg) rotateY(${f4(rig.yaw)}deg) translate3d(${f4(x.t[0] - rig.cx)}px, ${f4(x.t[1] - rig.cy)}px, ${f4(x.t[2])}px) matrix3d(${f4(m[0])},${f4(m[3])},${f4(m[6])},0,${f4(m[1])},${f4(m[4])},${f4(m[7])},0,${f4(m[2])},${f4(m[5])},${f4(m[8])},0,0,0,0,1) translate3d(${f4(u)}px, ${f4(v)}px, ${f4(w)}px)`;
};
export const XPlane = ({ rig, x, u, v, w, width, height, op = 1, probe, children }) => {
  if (op <= 1e-3) return null;
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-print": probe, style: {
    position: "absolute",
    left: rig.cx,
    top: rig.cy,
    width,
    height,
    transformOrigin: "0px 0px",
    transform: planeCssXf(rig, x, u, v, w),
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    opacity: op < 1 ? op : void 0,
    pointerEvents: "none"
  }, children });
};
