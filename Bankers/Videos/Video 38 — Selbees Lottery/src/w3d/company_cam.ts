// @ts-nocheck
// ★ V38 rev 2 (builder E) — camera maths for the company station's matched cuts and its hand-over to the road.
//   solveView: where to put the camera so that a world point lands on a given screen point at a given apparent size, seen along a
//   given direction (the matched cuts are SOLVED, not hand-tuned: test's seal and company's seal share centre and radius on the cut).
//   keysFrom: turns a per-frame camera function into kit.makeCam "cut" keys (one per frame, each undrifted so the LIVE camera, idle
//   drift included, sits exactly on the solved pose).
import * as THREE from "three";
import { projectWith, smoother, clamp01 } from "./kit";

export const drift = (f) => [0.06 * Math.sin(f / 97), 0.04 * Math.sin(f / 131 + 1), 0.05 * Math.sin(f / 113 + 2)];   // = kit.makeCam's
export const undrift = (p, f) => { const d = drift(f); return [p[0] - d[0], p[1] - d[1], p[2] - d[2]]; };
export const fpx = (fov) => 960 / Math.tan((fov * Math.PI) / 360);
const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
/** the camera {pos, target, fov} that shows world point C at screen (sx, sy), looking along w, such that measure(k) = size px */
export const solveView = ({ C, w, sx, sy, size, measure, fov = 40 }) => {
  const W = V(w).normalize(), up = new THREE.Vector3(0, 1, 0);
  const R = new THREE.Vector3().crossVectors(W, up).normalize(), U = new THREE.Vector3().crossVectors(R, W);
  const fp = fpx(fov);
  const dir = R.clone().multiplyScalar((sx - 540) / fp).add(U.clone().multiplyScalar(-(sy - 960) / fp)).add(W).normalize();
  let D = 1;
  let k = null;
  for (let it = 0; it < 12; it++) {
    const P = V(C).sub(dir.clone().multiplyScalar(D));
    k = { pos: [P.x, P.y, P.z], target: [P.x + W.x * D, P.y + W.y * D, P.z + W.z * D], fov, roll: 0 };
    const m = measure(k);
    if (Math.abs(m / size - 1) < 1e-5) break;
    D *= m / size;
  }
  return k;
};
/** the mean apparent radius (px) of a circle (centre C, radius r) lying in the plane with normal n, and its projected centre */
export const discPx = (k, C, r, n = [0, 1, 0], N = 96) => {
  const nn = V(n).normalize(), a = Math.abs(nn.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const e1 = new THREE.Vector3().crossVectors(nn, a).normalize(), e2 = new THREE.Vector3().crossVectors(nn, e1);
  const c = projectWith(k, C);
  let s = 0;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    const p = V(C).add(e1.clone().multiplyScalar(Math.cos(t) * r)).add(e2.clone().multiplyScalar(Math.sin(t) * r));
    const q = projectWith(k, [p.x, p.y, p.z]); pts.push(q);
  }
  // the ellipse's own centre (mean of the rim) and its mean radius about it
  const mx = pts.reduce((a, q) => a + q.x, 0) / N, my = pts.reduce((a, q) => a + q.y, 0) / N;
  pts.forEach((q) => { s += Math.hypot(q.x - mx, q.y - my); });
  const rx = (Math.max(...pts.map((q) => q.x)) - Math.min(...pts.map((q) => q.x))) / 2, ry = (Math.max(...pts.map((q) => q.y)) - Math.min(...pts.map((q) => q.y))) / 2;
  const bx = (Math.max(...pts.map((q) => q.x)) + Math.min(...pts.map((q) => q.x))) / 2, by = (Math.max(...pts.map((q) => q.y)) + Math.min(...pts.map((q) => q.y))) / 2;
  return { r: s / N, rx, ry, bx, by, cx: c.x, cy: c.y, ex: mx, ey: my };
};
/** half the apparent length (px) of a segment C ± ax·half */
export const segPx = (k, C, ax, half) => {
  const a = projectWith(k, [C[0] - ax[0] * half, C[1] - ax[1] * half, C[2] - ax[2] * half]);
  const b = projectWith(k, [C[0] + ax[0] * half, C[1] + ax[1] * half, C[2] + ax[2] * half]);
  return Math.hypot(b.x - a.x, b.y - a.y) / 2;
};
/** per-frame kit keys for frames [f0, f1] from cam(f) → {pos, target, fov} (world) */
export const keysFrom = (f0, f1, cam) => {
  const out = [];
  for (let f = f0; f <= f1; f++) { const k = cam(f); out.push({ a: f - 1, b: f, cut: true, pos: undrift(k.pos, f), target: k.target, fov: k.fov, zoom: false }); }
  return out;
};
export const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
/** an eased move between two poses whose apparent zoom is eased (geometric in the distance to the aim), like kit.makeCam */
export const moveBetween = (A, B, e) => {
  const d0 = Math.hypot(A.pos[0] - A.target[0], A.pos[1] - A.target[1], A.pos[2] - A.target[2]);
  const d1 = Math.hypot(B.pos[0] - B.target[0], B.pos[1] - B.target[1], B.pos[2] - B.target[2]);
  let q = e;
  if (Math.abs(Math.log(d1 / d0)) > 0.05) q = clamp01((d0 * Math.pow(d1 / d0, e) - d0) / (d1 - d0));
  return { pos: lerp3(A.pos, B.pos, q), target: lerp3(A.target, B.target, q), fov: A.fov + (B.fov - A.fov) * e };
};
export { smoother };
