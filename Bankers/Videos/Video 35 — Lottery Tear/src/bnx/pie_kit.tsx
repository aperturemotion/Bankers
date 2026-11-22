// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { rampAt } from "./solid_engine";
import { circ, objPath, p2, paintObj, planeCss, worldScr } from "./pie_world";

export const Sv = ({ children, part, op }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(
  "svg",
  {
    "data-what": part,
    width: 1080,
    height: 1920,
    viewBox: "0 0 1080 1920",
    style: { position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none", opacity: op },
    children
  }
);
const capGrad = (id, dw, ramp, lift) => {
  const xs = dw.pts.map((p) => p[0]), ys = dw.pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const L = 0.85 * dw.light + lift;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id, gradientUnits: "userSpaceOnUse", x1: x0.toFixed(1), y1: y0.toFixed(1), x2: (x0 + 0.55 * (x1 - x0)).toFixed(1), y2: y1.toFixed(1), children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: 0, stopColor: rampAt(ramp, L + 0.2) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: 0.18, stopColor: rampAt(ramp, L + 0.26) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: 0.46, stopColor: rampAt(ramp, L + 0.04) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: 1, stopColor: rampAt(ramp, L - 0.2) })
  ] });
};
export const Solid = ({
  faces,
  o,
  ramp,
  id,
  capLift = 0.2,
  dim = 1,
  arris = 0.32,
  cap
}) => {
  const painted = paintObj(faces, o);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
    painted.map((dw, k) => {
      const front = dw.face.cap && dw.face.n[2] > 0;
      if (front) {
        return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: capGrad(`${id}c${k}`, dw, ramp, capLift * dim) }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: `url(#${id}c${k})`, stroke: rampAt(ramp, 0.5 * dw.light), strokeWidth: 0.4, strokeLinejoin: "round" }),
          cap == null ? void 0 : cap(dw)
        ] }, k);
      }
      const up = dw.face.n[1] < -0.7;
      const l = dw.face.bev ? 0.9 * dw.light + 0.16 : up ? 0.9 * dw.light + 0.06 : 0.82 * dw.light;
      const c = rampAt(ramp, l * dim);
      return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
    }),
    arris > 0 && (() => {
      const fr = painted.find((dw) => dw.face.cap && dw.face.n[2] > 0);
      if (!fr) return null;
      const left = [...fr.pts].sort((a, b) => a[0] - b[0]).slice(0, 2).sort((a, b) => a[1] - b[1]);
      return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: p2(left, false), stroke: "#ffffff", strokeOpacity: arris * dim, strokeWidth: 1.4, fill: "none" });
    })()
  ] });
};
export const Screw = ({ o, u, v, w, r, ramp, rim, slot = 30 }) => {
  const ring = (rr, dz, du = 0, dv = 0) => objPath(o, circ(u + du, v + dv, rr, rr, 18).map(([a2, b]) => [a2, b, w + dz]));
  const a = slot * Math.PI / 180;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: ring(r * 1.35, 0.1, 0.6, 0.9), fill: "#000000", opacity: 0.45 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: ring(r * 1.2, 0.2), fill: rim, opacity: 0.85 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: ring(r, 0.4), fill: rampAt(ramp, 0.55) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: ring(r * 0.55, 0.6, -r * 0.28, -r * 0.3), fill: rampAt(ramp, 0.86), opacity: 0.8 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(
      "path",
      {
        d: objPath(o, [[u - r * 0.75 * Math.cos(a), v - r * 0.75 * Math.sin(a), w + 0.8], [u + r * 0.75 * Math.cos(a), v + r * 0.75 * Math.sin(a), w + 0.8]], false),
        stroke: rim,
        strokeWidth: Math.max(0.9, r * 0.28),
        fill: "none",
        opacity: 0.85
      }
    )
  ] });
};
export const HexBolt = ({ o, u, v, w, r, ramp, rim }) => {
  const hex = (rr, dz) => Array.from({ length: 6 }, (_, i) => [u + rr * Math.cos(i / 6 * 2 * Math.PI + 0.3), v + rr * Math.sin(i / 6 * 2 * Math.PI + 0.3), w + dz]);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(o, hex(r * 1.25, 0.1).map(([a, b, c]) => [a + 0.8, b + 1, c])), fill: "#000000", opacity: 0.42 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(o, hex(r * 1.12, 0.2)), fill: rim }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(o, hex(r, 0.5)), fill: rampAt(ramp, 0.6) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(o, hex(r * 0.55, 0.7)), fill: rampAt(ramp, 0.82), opacity: 0.7 })
  ] });
};
const floorRect = (rig, y, x0, x1, z0, z1) => [worldScr(rig, [x0, y, z0]), worldScr(rig, [x1, y, z0]), worldScr(rig, [x1, y, z1]), worldScr(rig, [x0, y, z1])];
export const Contact = ({ rig, y, x0, x1, z0, z1, dark }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: [44, 28, 15, 6, 1.5].map((g, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: p2(floorRect(rig, y, x0 - g * 0.6 + 6, x1 + g + 8, z0 - g * 0.9, z1 + g * 0.5)), fill: "#000000", opacity: dark * [0.05, 0.07, 0.1, 0.16, 0.32][k] }, k)) });
const at2 = (o, q) => {
  const s = objScr(o, q);
  return { x: s[0], y: s[1] };
};
export const WPlane = ({ o, w, op = 1, children }) => /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: 0, width: 1, height: 1, transformOrigin: "0px 0px", transform: planeCss(o, w), opacity: op, overflow: "visible" }, children });
