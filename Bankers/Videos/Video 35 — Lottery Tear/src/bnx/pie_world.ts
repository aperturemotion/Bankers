// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import { D2R, cw, dot, lightOf } from "./solid_engine";
import { HOUSE_VIEW } from "./rig";

export const I3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
export const mul = (a, b) => [
  a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
  a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
  a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
  a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
  a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
  a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
  a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
  a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
  a[6] * b[2] + a[7] * b[5] + a[8] * b[8]
];
const app = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
export const rotX = (deg) => {
  const a = deg * D2R, c = Math.cos(a), s = Math.sin(a);
  return [1, 0, 0, 0, c, -s, 0, s, c];
};
export const rotY = (deg) => {
  const a = deg * D2R, c = Math.cos(a), s = Math.sin(a);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
};
export const rotZ = (deg) => {
  const a = deg * D2R, c = Math.cos(a), s = Math.sin(a);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
};
export const axisRot = (ax, deg) => {
  const l = Math.hypot(ax[0], ax[1], ax[2]) || 1, x = ax[0] / l, y = ax[1] / l, z = ax[2] / l;
  const a = deg * D2R, c = Math.cos(a), s = Math.sin(a), t = 1 - c;
  return [t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c];
};
const HM = mul(rotX(HOUSE_VIEW.pitch), rotY(HOUSE_VIEW.yaw));
export const toWorld = (o, q) => {
  const t = app(o.m, q);
  return [o.o[0] + t[0], o.o[1] + t[1], o.o[2] + t[2]];
};
export const worldView = (rig, w) => app(HM, [w[0] - rig.cx, w[1] - rig.cy, w[2]]);
const viewScr = (rig, v) => {
  const k = rig.persp / Math.max(1, rig.persp - v[2]);
  return [rig.cx + v[0] * k, rig.cy + v[1] * k];
};
export const worldScr = (rig, w) => viewScr(rig, worldView(rig, w));
export const objScr = (o, q) => worldScr(o.rig, toWorld(o, q));
export const objNormal = (o, n) => app(HM, app(o.m, n));
export const child = (p, at, m = I3) => ({ o: toWorld(p, at), m: mul(p.m, m), rig: p.rig });
const f6 = (v) => Math.abs(v) < 1e-9 ? "0" : v.toFixed(6);
export const planeCss = (o, w0) => {
  const A = mul(HM, o.m), P = o.rig.persp, cx = o.rig.cx, cy = o.rig.cy;
  const t = worldView(o.rig, toWorld(o, [0, 0, w0]));
  const col = (x, y, z, wb) => [x + cx * wb, y + cy * wb, z, wb];
  const c1 = col(A[0], A[3], A[6], -A[6] / P), c2 = col(A[1], A[4], A[7], -A[7] / P), c3 = col(A[2], A[5], A[8], -A[8] / P);
  const c4 = [t[0] + cx * (1 - t[2] / P), t[1] + cy * (1 - t[2] / P), t[2], 1 - t[2] / P];
  return `matrix3d(${[...c1, ...c2, ...c3, ...c4].map(f6).join(",")})`;
};
export const paintObj = (faces, o) => {
  const out = [];
  for (const f of faces) {
    const nv = objNormal(o, f.n);
    const vpt = f.pts.map((p) => worldView(o.rig, toWorld(o, p)));
    const c = [0, 0, 0];
    for (const r of vpt) {
      c[0] += r[0];
      c[1] += r[1];
      c[2] += r[2];
    }
    c[0] /= vpt.length;
    c[1] /= vpt.length;
    c[2] /= vpt.length;
    if (dot(nv, [-c[0], -c[1], o.rig.persp - c[2]]) <= 1e-6) continue;
    const pts = vpt.map((v) => viewScr(o.rig, v));
    out.push({ d: p2(pts), face: f, nv, depth: c[2], light: lightOf(nv, f.cap ? 0 : 0.5), pts });
  }
  return out.sort((a, b) => a.face.pass - b.face.pass || a.depth - b.depth);
};
export const facing = (o, n, q) => {
  const nv = objNormal(o, n), v = worldView(o.rig, toWorld(o, q));
  return dot(nv, [-v[0], -v[1], o.rig.persp - v[2]]);
};
export const objPath = (o, pts, close = true) => p2(pts.map((p) => objScr(o, p)), close);
export const p2 = (pts, close = true) => `M${pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join("L")}${close ? "Z" : ""}`;
export const rrectPts = (w, h, r, seg = 6, cx = 0, cy = 0) => {
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
export const circ = (cx, cy, rx, ry = rx, n = 24) => Array.from({ length: n }, (_, i) => [cx + rx * Math.cos(i / n * 2 * Math.PI), cy + ry * Math.sin(i / n * 2 * Math.PI)]);
export const pol = (r, deg) => [r * Math.cos(deg * D2R), r * Math.sin(deg * D2R)];
