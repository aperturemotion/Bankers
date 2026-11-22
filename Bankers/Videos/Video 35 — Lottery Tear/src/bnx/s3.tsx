// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { alpha, clamp01, rInOut } from "./anim";
import { LAYOUT, theme } from "./theme";

export const CX = LAYOUT.W / 2;
const KEY = { x: -0.62, y: -0.78 };
const chromeFace = (v = 1) => ({
  background: `linear-gradient(146deg, ${mixHex("#1D4778", "#ffffff", 0.3 * v)} 0%, ${mixHex("#18375D", "#ffffff", 0.1 * v)} 26%, #10253F 52%, #0B1F31 78%, #102643 100%)`
});
const matteFace = {
  background: "linear-gradient(150deg, #153558 0%, #122A45 48%, #0E2135 100%)"
};
const glassFace = (v = 1) => ({
  background: `linear-gradient(150deg, rgba(255,255,255,${0.07 * v}) 0%, rgba(255,255,255,${0.02 * v}) 50%, rgba(255,255,255,${0.05 * v}) 100%)`
});
const rim = (v) => `inset 0 1px 0 ${alpha(theme.accent, 0.55 * v)}, inset 1px 0 0 ${alpha(theme.accent, 0.3 * v)}`;
const keyGlow = (v, r = 60) => v <= 0.01 ? void 0 : `drop-shadow(0 0 ${r * v}px ${alpha(theme.accent, 0.3 * v)})`;
const Orbit = ({ children, amp = 7, period = 260, tilt = 0.42, z = 1500, phase = 0 }) => {
  const f = useCurrentFrame();
  const a = Math.sin(f / period * Math.PI * 2 + phase) * amp;
  const b = Math.cos(f / (period * 1.37) * Math.PI * 2 + phase) * amp * tilt;
  return /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, perspective: z, perspectiveOrigin: "50% 44%" }, children: /* @__PURE__ */ jsx("div", { style: {
    position: "absolute",
    inset: 0,
    transformStyle: "preserve-3d",
    transform: `rotateY(${a.toFixed(3)}deg) rotateX(${b.toFixed(3)}deg)`
  }, children }) });
};
const assertOrdered = (keys) => {
  for (let i = 1; i < keys.length; i++) {
    if (keys[i].at < keys[i - 1].at) {
      throw new Error(
        `Cam keys out of order: key ${i} is at frame ${keys[i].at} but key ${i - 1} is at ${keys[i - 1].at}. Camera keyframes must ascend in time \u2014 sort them, and check you have not cued a later-spoken moment before an earlier one.`
      );
    }
  }
};
const camAt = (f, keys) => {
  assertOrdered(keys);
  let cur = { x: 0, y: 0, z: 1 };
  for (const k of keys) {
    const p = (k.ease === "io" ? rInOut : rOut)(f, k.at, k.at + (k.dur ?? 46));
    if (p <= 1e-4) break;
    const t = { x: k.x ?? cur.x, y: k.y ?? cur.y, z: k.z ?? cur.z };
    cur = {
      x: cur.x + (t.x - cur.x) * p,
      y: cur.y + (t.y - cur.y) * p,
      z: cur.z + (t.z - cur.z) * p
    };
  }
  return cur;
};
const Cam = ({ keys, children }) => {
  const f = useCurrentFrame();
  const c = camAt(f, keys);
  return /* @__PURE__ */ jsx("div", { style: {
    position: "absolute",
    inset: 0,
    transformOrigin: "50% 46%",
    transform: `scale(${c.z.toFixed(4)}) translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`
  }, children });
};
export const CamFn = ({ at, children }) => {
  const f = (0,esm.useCurrentFrame)();
  const c = at(f);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
    position: "absolute",
    inset: 0,
    transformOrigin: "50% 46%",
    transform: `scale(${c.z.toFixed(4)}) translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`
  }, children });
};
const vec = (d) => d === "left" ? [-1, 0] : d === "right" ? [1, 0] : d === "up" ? [0, -1] : d === "down" ? [0, 1] : [0, 0];
const Beat = ({
  at,
  end,
  from = "right",
  toward,
  dist = 420,
  zoom = 0.14,
  inDur = 46,
  outDur = 24,
  children
}) => {
  const f = useCurrentFrame();
  const pin = rOut(f, at, at + inDur);
  const pout = rIn(f, end - outDur, end);
  const o = clamp01(pin * 2.4) * (1 - clamp01(pout * 1.35));
  if (o <= 1e-3) return null;
  const [ix, iy] = vec(from);
  const [ox, oy] = vec(toward ?? from);
  const tx = ix * dist * (1 - pin) - ox * dist * 0.5 * pout;
  const ty = iy * dist * (1 - pin) - oy * dist * 0.5 * pout;
  const s = (1 - zoom + zoom * pin) * (1 + 0.1 * pout);
  return /* @__PURE__ */ jsx("div", { style: {
    position: "absolute",
    inset: 0,
    opacity: o,
    transformOrigin: "50% 46%",
    transform: `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(4)})`
  }, children });
};
const Slab = ({
  x,
  y,
  w,
  h,
  d = 34,
  on = 1,
  glass = 0,
  lit = 0,
  rotY = 0,
  rotX = 0,
  children,
  reflect = true,
  scale = 1,
  shadow = 1
}) => {
  if (on <= 1e-3) return null;
  const g = clamp01(glass);
  const border = `${(1 + 0.5 * g).toFixed(2)}px solid ${alpha("#ffffff", 0.1 + 0.2 * g)}`;
  const body = (mirror) => /* @__PURE__ */ jsxs("div", { style: {
    position: "absolute",
    left: -w / 2,
    top: -h / 2,
    width: w,
    height: h,
    transformStyle: "preserve-3d",
    transform: mirror ? "scaleY(-1)" : void 0,
    opacity: mirror ? 0.2 * on : on,
    WebkitMaskImage: mirror ? "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 62%)" : void 0,
    filter: mirror ? "blur(3px)" : void 0
  }, children: [
    [...Array(6)].map((_, i) => /* @__PURE__ */ jsx("div", { style: {
      // a hollow object loses its solid interior as it turns to glass
      position: "absolute",
      inset: 0,
      borderRadius: 10,
      opacity: 1 - 0.8 * g,
      transform: `translateZ(${-d * (i + 1) / 6}px)`,
      background: `rgba(${8 + i * 2},${8 + i * 2},${10 + i * 2},1)`,
      boxShadow: i === 5 ? `0 0 0 1px ${alpha("#ffffff", 0.06)}` : void 0
    } }, i)),
    /* @__PURE__ */ jsxs("div", { style: {
      position: "absolute",
      inset: 0,
      borderRadius: 10,
      border,
      boxShadow: `${rim((0.5 + 0.5 * lit) * (1 - 0.5 * g))}, 0 26px 60px rgba(0,0,0,${(0.9 * shadow * (1 - 0.6 * g)).toFixed(2)})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, ...chromeFace(1), opacity: 1 - g } }),
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, ...glassFace(1), opacity: g } }),
      /* @__PURE__ */ jsx("div", { style: {
        position: "absolute",
        inset: 0,
        background: `linear-gradient(${118 + rotY * 0.6}deg, transparent 34%, ${alpha("#ffffff", 0.09 + 0.13 * lit)} 50%, transparent 66%),linear-gradient(${118 + rotY * 0.6}deg, transparent 38%, ${alpha(theme.accent, 0.09 + 0.15 * lit)} 50%, transparent 62%)`
      } }),
      /* @__PURE__ */ jsx("div", { style: {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }, children })
    ] })
  ] });
  return /* @__PURE__ */ jsxs("div", { style: {
    position: "absolute",
    left: x,
    top: y,
    transformStyle: "preserve-3d",
    transform: `scale(${scale}) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
    filter: keyGlow(lit * 0.8, 70)
  }, children: [
    body(false),
    reflect && /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: 0, top: h + 16, transformStyle: "preserve-3d" }, children: body(true) })
  ] });
};
const Column = ({ x, baseY, w, h, on = 1, down = false, red = 0, lit = 0.4 }) => {
  if (on <= 1e-3 || h <= 0.5) return null;
  const rv = clamp01(typeof red === "boolean" ? red ? 1 : 0 : red);
  const col = mixHex(theme.accent, theme.red, rv);
  const top = down ? baseY : baseY - h;
  return /* @__PURE__ */ jsxs("div", { style: {
    position: "absolute",
    left: x - w / 2,
    top,
    width: w,
    height: h,
    opacity: on,
    transformStyle: "preserve-3d"
  }, children: [
    [...Array(5)].map((_, i) => /* @__PURE__ */ jsx("div", { style: {
      position: "absolute",
      inset: 0,
      borderRadius: 4,
      transform: `translate(${(i + 1) * 3}px, ${-(i + 1) * 3}px) translateZ(${-(i + 1) * 5}px)`,
      background: mixHex("#0D1C2E", col, 0.1)
    } }, i)),
    /* @__PURE__ */ jsx("div", { style: {
      position: "absolute",
      inset: 0,
      borderRadius: 4,
      background: `linear-gradient(158deg, ${mixHex(col, "#ffffff", 0.35)} 0%, ${col} 44%, ${mixHex(col, "#000000", 0.45)} 100%)`,
      boxShadow: `0 0 ${34 * lit}px ${alpha(col, 0.42)}, inset 0 1px 0 ${alpha("#ffffff", 0.35)}`
    } })
  ] });
};
export const Pool3D = ({
  x = CX,
  y,
  w,
  on
}) => {
  const f = (0,esm.useCurrentFrame)();
  if (on <= 1e-3) return null;
  const b = 0.85 + 0.15 * Math.sin(f / 84);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
    position: "absolute",
    left: x - w / 2,
    top: y - w * 0.12,
    width: w,
    height: w * 0.24,
    // ★ 0.34 → 0.26: a neutral pool at the green build's alpha reads as a grey WASH on black,
    // where the green one read as coloured light. The spill is dimmer and the floor stays dark.
    opacity: on * 0.55 * b,
    borderRadius: "50%",
    background: `radial-gradient(ellipse, ${alpha(theme.accent, 0.26)} 0%, ${alpha(theme.accent, 0.06)} 45%, transparent 72%)`,
    filter: "blur(26px)",
    mixBlendMode: "screen"
  } });
};
export const LightBreak = ({ at, hold = 5 }) => {
  const f = (0,esm.useCurrentFrame)();
  const v = f < at + hold ? rInOut(f, at - 11, at) : 1 - rInOut(f, at + hold, at + hold + 16);
  if (v <= 2e-3) return null;
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, background: "#DDEAF8", opacity: clamp01(v) } });
};
const Shock = ({ words, bright, at, y, size = 154, red = false, on = 1 }) => {
  const f = useCurrentFrame();
  const g = rOut(f, at, at + 18) * on;
  if (g <= 1e-3) return null;
  return /* @__PURE__ */ jsx("div", { style: {
    position: "absolute",
    left: 0,
    width: "100%",
    top: y,
    textAlign: "center",
    opacity: g,
    transform: `translateY(${((1 - g) * 22).toFixed(1)}px)`
  }, children: /* @__PURE__ */ jsx("div", { style: {
    display: "inline-block",
    transform: `scaleX(${SHOUT_SQUEEZE})`,
    fontFamily: SHOUT,
    fontWeight: 400,
    fontSize: size,
    lineHeight: 0.94,
    letterSpacing: -1,
    whiteSpace: "nowrap"
  }, children: words.map((w, i) => /* @__PURE__ */ jsx("span", { style: {
    color: i === bright ? red ? theme.red : "#ffffff" : "#0063D6",
    textShadow: i === bright && red ? `0 0 40px ${alpha(theme.red, 0.5)}` : void 0,
    marginRight: i < words.length - 1 ? size * 0.22 : 0
  }, children: w }, i)) }) });
};
const Figure = ({ text, at, y, size = 168, red = false, on = 1 }) => {
  const f = useCurrentFrame();
  const g = rOut(f, at, at + 20) * on;
  if (g <= 1e-3) return null;
  return /* @__PURE__ */ jsx("div", { style: {
    position: "absolute",
    left: 0,
    width: "100%",
    top: y,
    textAlign: "center",
    opacity: g,
    fontFamily: VOICE,
    fontWeight: 300,
    fontSize: size,
    lineHeight: 1,
    letterSpacing: -4,
    color: red ? theme.red : "#ffffff",
    textShadow: red ? `0 0 60px ${alpha(theme.red, 0.42)}` : `0 0 60px ${alpha("#ffffff", 0.18)}`,
    transform: `scale(${(0.94 + 0.06 * g).toFixed(3)})`
  }, children: text });
};
const Etch = ({ text, x, y, on, size = 20, align = "center" }) => {
  if (on <= 1e-3) return null;
  return /* @__PURE__ */ jsx("div", { style: {
    position: "absolute",
    left: align === "center" ? x - 300 : x,
    top: y,
    width: align === "center" ? 600 : void 0,
    textAlign: align,
    opacity: on * 0.8,
    fontFamily: DATA,
    fontWeight: 700,
    fontSize: size,
    letterSpacing: 3,
    color: "#3A89E6",
    whiteSpace: "nowrap"
  }, children: text });
};
