// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import { theme } from "./theme";

const O = { x: 540, y: 883 };
export const aim = (x, y) => ({ x: O.x - x, y: O.y - y });
const CX = 540;
export const LOSS = theme.red;
const Box3 = ({ x, y, w, h, d, face, cap, side, shadow, radius = 0, children }) => {
  var _a;
  const r = d * 0.7;
  const ds = (_a = shadow == null ? void 0 : shadow.match(/^drop-shadow\((.+)\)$/)) == null ? void 0 : _a[1];
  return /* @__PURE__ */ jsxs("div", { style: { position: "absolute", left: x, top: y - r, width: w + d, height: h + r, filter: ds ? void 0 : shadow }, children: [
    /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, clipPath: `polygon(${w - 1}px ${r}px, ${w + d}px 0px, ${w + d}px ${h}px, ${w - 1}px ${h + r}px)`, background: side } }),
    /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, clipPath: `polygon(0px ${r + 1}px, ${d}px 0px, ${w + d}px 0px, ${w}px ${r + 1}px)`, background: cap } }),
    /* @__PURE__ */ jsx("div", { style: {
      position: "absolute",
      left: 0,
      top: r - 1,
      width: w + 1,
      height: h + 1,
      background: face,
      borderRadius: radius * 0,
      boxShadow: ds ? `${ds}, inset 0 1px 0 rgba(255,255,255,0.48)` : "inset 0 1px 0 rgba(255,255,255,0.48)"
    }, children })
  ] });
};
const tilt = (ox, oy, P, deg) => (dx, dy) => {
  const t = deg * Math.PI / 180;
  const y1 = dy * Math.cos(t), z1 = dy * Math.sin(t);
  const s = P / (P - z1);
  return { x: ox + dx * s, y: oy + y1 * s, s };
};
const tiltCss = (P, deg) => `perspective(${P}px) rotateX(${deg}deg)`;
export const s3d = (x, y, extra = "") => `perspective(1200px) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0px) rotateX(0.15deg)${extra ? " " + extra : ""}`;
export const seeded = (seed) => {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
};
const Greek = ({ x, y, ws, h = 5, gap = 8, color, op = 0.4 }) => {
  let cx = x;
  return /* @__PURE__ */ jsx(Fragment, { children: ws.map((w, i) => {
    const l = cx;
    cx += w + gap;
    return /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: l, top: y, width: w, height: h, borderRadius: h / 2, background: color, opacity: op } }, i);
  }) });
};
export const travelling = (f, wins) => wins.some((w) => f > w.a && f < w.b) ? "in-place camera travel" : void 0;
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
