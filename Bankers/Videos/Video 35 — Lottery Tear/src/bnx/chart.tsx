// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).

const vAt = (t, S) => {
  if (t <= S[0][0]) return S[0][1];
  for (let i = 1; i < S.length; i++) {
    if (S[i][0] >= t) {
      const [t0, v0] = S[i - 1], [t1, v1] = S[i];
      return v0 + (t - t0) / (t1 - t0) * (v1 - v0);
    }
  }
  return S[S.length - 1][1];
};
const linScale = (t0, t1, x0, x1, v0, v1, y0, y1) => ({
  x: (t) => x0 + (t - t0) / (t1 - t0) * (x1 - x0),
  y: (v) => y0 + (v - v0) / (v1 - v0) * (y1 - y0),
  t: (x) => t0 + (x - x0) / (x1 - x0) * (t1 - t0)
});
const linePts = (S, t0, t1, D) => {
  const pts = [[S.x(t0), S.y(vAt(t0, D))]];
  for (const [t, v] of D) if (t > t0 && t < t1) pts.push([S.x(t), S.y(v)]);
  pts.push([S.x(t1), S.y(vAt(t1, D))]);
  return pts;
};
const arcX = (pts) => {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return (u) => {
    const want = clamp01(u) * L[L.length - 1];
    let j = 1;
    while (j < L.length - 1 && L[j] < want) j++;
    const q = L[j] > L[j - 1] ? (want - L[j - 1]) / (L[j] - L[j - 1]) : 0;
    return [pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * clamp01(q), pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * clamp01(q)];
  };
};
export const smoothFollow = (f, at) => {
  let W = 0, X = 0, Y = 0, Z = 0;
  for (let d = -12; d <= 12; d++) {
    const w = Math.exp(-(d * d) / 72), p = at(f + d);
    W += w;
    X += w * p.x;
    Y += w * p.y;
    Z += w * p.z;
  }
  return { x: X / W, y: Y / W, z: Z / W };
};
const DatedFigure = ({ x, y, on, date, fig, size = 64, align = "left", tone = "#EFF5FB" }) => {
  if (on <= 1e-3) return null;
  const pos = align === "left" ? { left: x } : align === "right" ? { left: x - 600, width: 600, textAlign: "right" } : { left: x - 300, width: 600, textAlign: "center" };
  return /* @__PURE__ */ jsxs("div", { style: { position: "absolute", top: y, ...pos, opacity: clamp01(on * 1.6), transform: s3d(0, (1 - on) * 18), whiteSpace: "nowrap" }, children: [
    /* @__PURE__ */ jsx("div", { style: { ...label(24, "#A2C3EA") }, children: date }),
    /* @__PURE__ */ jsx("div", { style: { ...figure(size, tone), marginTop: 6 }, children: fig })
  ] });
};
const Ring = ({ x, y, on, r = 13 }) => {
  if (on <= 0.01) return null;
  return /* @__PURE__ */ jsx("div", { style: {
    position: "absolute",
    left: x - r,
    top: y - r,
    width: 2 * r,
    height: 2 * r,
    borderRadius: "50%",
    opacity: on,
    border: `3px solid ${alpha("#EDF4FB", 0.92)}`,
    boxShadow: `0 0 18px ${alpha("#BAD4F0", 0.55)}`,
    transform: s3d(0, 0, `scale(${(0.6 + 0.4 * on).toFixed(3)})`)
  } });
};
