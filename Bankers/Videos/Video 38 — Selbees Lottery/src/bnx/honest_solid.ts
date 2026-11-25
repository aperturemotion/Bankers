// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import { box3, prism, rampAt } from "./solid_engine";
import { paintXf, unit3, wound, xfApply, xfDir } from "./tk_rig";

export const lathe = (prof, segs, mat, pass, at = [0, 0, 0], a0 = 0, matOf) => {
  const F = [];
  const P = (r, v, th) => [at[0] + r * Math.cos(th), at[1] + v, at[2] + r * Math.sin(th)];
  for (let k = 0; k < prof.length - 1; k++) {
    const [r0, v0] = prof[k], [r1, v1] = prof[k + 1];
    const nr = v1 - v0, nv = -(r1 - r0), l = Math.hypot(nr, nv) || 1;
    for (let j = 0; j < segs; j++) {
      const a = a0 + j / segs * 2 * Math.PI, b = a0 + (j + 1) / segs * 2 * Math.PI, m = (a + b) / 2;
      const raw = [P(r0, v0, a), P(r0, v0, b), P(r1, v1, b), P(r1, v1, a)];
      const pts = raw.filter((p, i) => {
        const q = raw[(i + 1) % raw.length];
        return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) > 1e-6;
      });
      if (pts.length < 3) continue;
      F.push({ pts, n: [nr / l * Math.cos(m), nv / l, nr / l * Math.sin(m)], pass, mat: matOf ? matOf(k, j) : mat });
    }
  }
  return wound(F);
};
export const alongU = (faces) => faces.map((f) => ({ ...f, pts: f.pts.map(([x, y, z]) => [z, x, y]), n: [f.n[2], f.n[0], f.n[1]] }));
export const moved = (faces, x) => faces.map((f) => ({ ...f, pts: f.pts.map((p) => xfApply(x, p)), n: unit3(xfDir(x, f.n)) }));
export const slab = (cx, cy, w, h, d, wc, bev, mat, pass) => {
  const hw = w / 2, hh = h / 2;
  const p = [[cx - hw, cy - hh], [cx + hw, cy - hh], [cx + hw, cy + hh], [cx - hw, cy + hh]];
  return wound(prism(p, d, bev, mat, pass, () => false, [0, 0, wc]));
};
export const boxMM = (a, b, mat, pass) => wound(box3([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], [Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), Math.abs(b[2] - a[2])], mat, pass));
export const ink = (rig, map, faces, ramps, spec = 0.55, key = "f", tone = 1) => paintXf(faces, map, rig, spec).map((dw, i) => {
  const f = dw.face, r = ramps[f.mat] ?? ramps[0];
  const k = f.cap ? 0.62 * dw.light + 0.06 : f.bev ? Math.min(1, 0.95 * dw.light + 0.16) : 0.8 * dw.light + 0.05;
  return { d: dw.d, c: rampAt(r, k * tone), key: `${key}${i}` };
});
