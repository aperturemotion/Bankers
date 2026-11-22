// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { alpha, clamp01, drift2, rInOut, rOut } from "./anim";
import { theme } from "./theme";
import { LIGHT_DEPTH, lightXf, shotPose } from "./shot";

const KEYS = [
  { x: 785, y: -265, angle: -20, lift: 24 },
  // key upper-right, lift left
  { x: 250, y: -265, angle: 18, lift: 66 }
  // key upper-left, lift right
];
const enterSpan = (p) => p.enter.k === "own" ? { a: p.at - 2, d: 24 } : { a: p.enter.at, d: p.enter.dur };
const exitEnd = (p) => p.exit.k === "own" ? p.end + 2 : p.exit.at + p.exit.dur;
const paired = (p, q) => p.exit.k !== "own" && q.enter.k !== "own" && Math.abs(p.exit.at - q.enter.at) <= 2;
const arrival = (f, p) => {
  const e = p.enter;
  if (e.k === "own") return rInOut(f, p.at - 2, p.at + 22);
  if (e.k === "large") return rOut(f, e.at, e.at + 12);
  if (e.k === "approach") return rOut(f, e.at, e.at + e.dur * 0.6);
  return rInOut(f, e.at, e.at + e.dur * 0.6);
};
const complement = (f, q) => {
  const e = q.enter;
  if (e.k === "panFromR" || e.k === "panFromL") {
    const k = rInOut(f, e.at, e.at + e.dur);
    return { tx: (e.k === "panFromR" ? -1 : 1) * 1080 * LIGHT_DEPTH * k, ty: 0, s: 1 };
  }
  if (e.k === "fromAbove" || e.k === "fromBelow") {
    const k = rInOut(f, e.at, e.at + e.dur);
    return { tx: 0, ty: (e.k === "fromAbove" ? 1 : -1) * 1600 * LIGHT_DEPTH * k, s: 1 };
  }
  if (e.k === "approach") {
    const k = rOut(f, e.at, e.at + e.dur);
    return { tx: 0, ty: 0, s: 1 + LIGHT_DEPTH * 0.65 * k };
  }
  if (e.k === "large") {
    const k = rOut(f, e.at, e.at + e.dur);
    return { tx: 0, ty: 0, s: 1 - LIGHT_DEPTH * 0.35 * k };
  }
  return { tx: 0, ty: 0, s: 1 };
};
export const placeLights = (f, places) => {
  const out = [];
  places.forEach((p, i) => {
    const q = places[i + 1];
    const { a } = enterSpan(p);
    const life = q ? Math.max(exitEnd(p), enterSpan(q).a + enterSpan(q).d) : Infinity;
    if (f < a - 1 || f > life + 1) return;
    const pose = shotPose(Math.min(f, exitEnd(p)), p.exit, p.enter);
    const xf = lightXf(pose);
    let { tx, ty, s } = xf;
    let op = arrival(f, p);
    if (q) {
      const qs = enterSpan(q);
      if (!paired(p, q) && f > exitEnd(p)) {
        const c = complement(f, q);
        tx += c.tx;
        ty += c.ty;
        s *= c.s;
      }
      op *= 1 - rInOut(f, qs.a + qs.d * 0.3, qs.a + qs.d);
    }
    if (op > 4e-3) out.push({ i, tx, ty, s, ox: xf.ox, oy: xf.oy, op });
  });
  return out;
};
export const PlaceLight = ({
  layer,
  i,
  tx,
  ty,
  s,
  ox,
  oy,
  op,
  white
}) => {
  const f = (0,esm.useCurrentFrame)();
  const K = KEYS[i % 2];
  const b = 1 + 0.06 * Math.sin(f / 220 * Math.PI * 2);
  const M = 1600;
  const lx = K.lift / 100 * 1080 + M, ly = 0.12 * 1920 + M;
  const sway = drift2(f, 260, 121, 2.2);
  const pulse = 0.82 + 0.18 * (0.5 + 0.5 * Math.sin(f / 96 * Math.PI * 2));
  const keyOn = 0.35 * (1 - white) * pulse;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: {
    position: "absolute",
    inset: 0,
    opacity: clamp01(op),
    transformOrigin: `${ox}px ${oy}px`,
    transform: `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0px) scale(${s.toFixed(5)})`
  }, children: [
    layer === "dark" && white < 0.999 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
      position: "absolute",
      left: -M,
      top: -M,
      width: 1080 + 2 * M,
      height: 1920 + 2 * M,
      background: `radial-gradient(1296px 1536px at ${lx}px ${ly}px, ${alpha(theme.bgLift, 0.78 * b)} 0%, ${alpha(theme.bgLift, 0.3 * b)} 34%, ${alpha(theme.bgLift, 0)} 72%)`
    } }),
    layer === "white" && white > 1e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
      position: "absolute",
      left: -M,
      top: -M,
      width: 1080 + 2 * M,
      height: 1920 + 2 * M,
      opacity: white,
      // the white lift only as the stage turns white
      background: `radial-gradient(1296px 1536px at ${lx}px ${ly}px, ${theme.bgLightLift} 0%, ${alpha(theme.bgLightLift, 0)} 55%)`
    } }),
    layer === "white" && white > 1e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
      position: "absolute",
      left: -M,
      top: -M,
      width: 1080 + 2 * M,
      height: 1920 + 2 * M,
      opacity: white,
      background: `radial-gradient(400px 560px at ${K.x + 260 + M}px ${330 + M}px, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0) 72%), radial-gradient(760px 980px at ${1080 - (K.x + 260) + M}px ${1520 + M}px, rgba(0,55,118,0.075) 0%, rgba(0,55,118,0.03) 48%, rgba(0,55,118,0) 75%)`
    } }),
    layer === "dark" && keyOn > 2e-3 && /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
        position: "absolute",
        left: K.x,
        top: K.y,
        width: 520,
        height: 2200,
        transformOrigin: "50% 0%",
        transform: `rotate(${(K.angle + sway).toFixed(2)}deg)`,
        opacity: keyOn,
        mixBlendMode: "screen",
        filter: "blur(58px)",
        background: `linear-gradient(to bottom, ${alpha(theme.accent, 0.5)} 0%, ${alpha(theme.accent, 0.18)} 34%, ${alpha(theme.accent, 0.04)} 68%, transparent 100%)`
      } }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
        position: "absolute",
        left: K.x + 260 - 190,
        top: K.y + 40,
        width: 380,
        height: 380,
        borderRadius: "50%",
        opacity: keyOn * 0.9,
        mixBlendMode: "screen",
        filter: "blur(30px)",
        background: `radial-gradient(circle, ${alpha(theme.accent, 0.55)} 0%, ${alpha(theme.accent, 0.12)} 45%, transparent 70%)`
      } })
    ] })
  ] });
};
