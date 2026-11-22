// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";

export const OUT = esm.Easing.bezier(0.17, 0.84, 0.28, 1);
const INOUT = esm.Easing.bezier(0.45, 0.05, 0.35, 1);
const IN = esm.Easing.bezier(0.55, 0, 0.9, 0.45);
const RISE = esm.Easing.bezier(0.36, 0, 0.24, 1);
const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
export const rOut = (f, a, b) => (0,esm.interpolate)(f, [a, b], [0, 1], { ...clampOpts, easing: OUT });
export const rInOut = (f, a, b) => (0,esm.interpolate)(f, [a, b], [0, 1], { ...clampOpts, easing: INOUT });
const rRise = (f, a, b) => interpolate(f, [a, b], [0, 1], { ...clampOpts, easing: RISE });
export const rIn = (f, a, b) => (0,esm.interpolate)(f, [a, b], [0, 1], { ...clampOpts, easing: IN });
export const rLin = (f, a, b) => (0,esm.interpolate)(f, [a, b], [0, 1], clampOpts);
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const mix = (a, b, t) => a + (b - a) * clamp01(t);
const glide = (f, ts, vs) => {
  const n = ts.length;
  if (f <= ts[0]) return vs[0];
  if (f >= ts[n - 1]) return vs[n - 1];
  const d = ts.slice(1).map((t2, i) => (vs[i + 1] - vs[i]) / (t2 - ts[i]));
  const m = vs.map((_, i) => i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) {
      const t2 = 3 / Math.sqrt(s);
      m[i] = t2 * a * d[i];
      m[i + 1] = t2 * b * d[i];
    }
  }
  let k = 0;
  while (f > ts[k + 1]) k++;
  const h = ts[k + 1] - ts[k], t = (f - ts[k]) / h;
  const h00 = 2 * t ** 3 - 3 * t ** 2 + 1, h10 = t ** 3 - 2 * t ** 2 + t, h01 = -2 * t ** 3 + 3 * t ** 2, h11 = t ** 3 - t ** 2;
  return h00 * vs[k] + h10 * h * m[k] + h01 * vs[k + 1] + h11 * h * m[k + 1];
};
const win = (f, a, e, inF = 22, outF = 16) => rOut(f, a, a + inF) * (1 - rIn(f, e - outF, e));
const breathe = (f, period = 128, amp = 1) => Math.sin(f / period * Math.PI * 2) * amp;
export const drift2 = (f, p1, p2, a1, a2 = a1 * 0.35) => Math.sin(f / p1 * Math.PI * 2) * a1 + Math.sin(f / p2 * Math.PI * 2) * a2;
export const alpha = (hex, a) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
};
export const mixHex = (a, b, t) => {
  const p = (h) => {
    const s = h.replace("#", "");
    const n = parseInt(s.length === 3 ? s.split("").map((c2) => c2 + c2).join("") : s, 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  };
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  const k = clamp01(t);
  const c = (x, y) => Math.round(x + (y - x) * k).toString(16).padStart(2, "0");
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
};
