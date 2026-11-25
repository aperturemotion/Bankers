// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { aud } from "./aud";
import { alpha, clamp01, drift2, rIn, rInOut, rOut } from "./anim";
import { theme } from "./theme";
import { CX } from "./s3";

const AskSlab = ({ x, y, w, h, text, on, pulse, sheen, size = 76 }) => {
  if (on <= 0.01) return null;
  const D = 22, R = D * 0.7;
  return /* @__PURE__ */ jsxs("div", { style: {
    position: "absolute",
    left: x - w / 2,
    top: y - h / 2 - R,
    width: w + D,
    height: h + R,
    opacity: on,
    transform: s3d(0, (1 - on) * 40)
  }, children: [
    /* @__PURE__ */ jsx("div", { style: {
      position: "absolute",
      inset: 0,
      clipPath: `polygon(${w - 1}px ${R}px, ${w + D}px 0px, ${w + D}px ${h}px, ${w - 1}px ${h + R}px)`,
      background: "linear-gradient(180deg, #265C98 0%, #132E4F 100%)"
    } }),
    /* @__PURE__ */ jsx("div", { style: {
      position: "absolute",
      inset: 0,
      clipPath: `polygon(0px ${R + 1}px, ${D}px 0px, ${w + D}px 0px, ${w}px ${R + 1}px)`,
      background: "linear-gradient(120deg, #4D7FBA 0%, #204D7F 100%)"
    } }),
    /* @__PURE__ */ jsxs("div", { style: {
      position: "absolute",
      left: 0,
      top: R - 1,
      width: w + 1,
      height: h + 1,
      borderRadius: 4,
      background: "linear-gradient(170deg, #204D7F 0%, #132E4F 60%, #102740 100%)",
      overflow: "hidden",
      boxShadow: "0 20px 30px rgba(0,0,0,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontFamily: DISPLAY_TEXT, fontWeight: 700, fontSize: size, lineHeight: 1, color: "#EEF4FB", letterSpacing: -1, whiteSpace: "nowrap" }, children: text }),
      /* @__PURE__ */ jsx("div", { "data-probe": "bg", style: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: `${(-30 + 160 * sheen).toFixed(1)}%`,
        width: "18%",
        opacity: Math.sin(sheen * Math.PI) * 0.5,
        background: "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)"
      } })
    ] })
  ] });
};
const FeelQuestion = ({ at, end, feelAt, youAt, answers, ys = [840, 1060], size }) => {
  const f = useCurrentFrame();
  const out = rIn(f, end - 12, end);
  const a = rInOut(f, feelAt + 1, feelAt + 26);
  const b = rInOut(f, Math.min(youAt - 12, feelAt + 22), Math.min(youAt + 16, feelAt + 50));
  const pa = 0.5 + 0.5 * Math.sin((f - feelAt) / 9);
  const pb = 0.5 + 0.5 * Math.sin((f - youAt) / 9 + 1.7);
  return /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, transform: `translate(${(-1150 * out).toFixed(1)}px, 0px)` }, children: /* @__PURE__ */ jsx(Cam, { keys: [{ at: -9999, ...aim(CX, 840), z: 1, dur: 1 }, { at: feelAt + 6, ...aim(CX, 800), z: 1.06, dur: Math.min(50, Math.max(30, end - feelAt - 12)), ease: "io" }], children: /* @__PURE__ */ jsxs(Turn, { at, end, from: -6, to: 4, amp: 0.8, children: [
    /* @__PURE__ */ jsx(AskSlab, { x: CX, y: ys[0], w: 760, h: 150, text: answers[0], on: a, pulse: pa, sheen: (f - feelAt) / 54 % 1, size }),
    /* @__PURE__ */ jsx(AskSlab, { x: CX, y: ys[1], w: 760, h: 150, text: answers[1], on: b, pulse: pb, sheen: (f - feelAt + 27) / 54 % 1, size })
  ] }) }) });
};
const LOGO = aud("brand/bankers-logo-blue.svg");
const LOGO_ASPECT = 530.2 / 160;
const LOGO_W = 620;
export const BrandClose = ({ at, y = 960 }) => {
  const f = (0,esm.useCurrentFrame)();
  const p = rOut(f, at, at + 44);
  if (p <= 1e-3) return null;
  const halo = 0.7 + 0.3 * (0.5 + 0.5 * Math.sin((f - at) / 52));
  const sweep = rInOut(f, at + 16, at + 42);
  const LH = LOGO_W / LOGO_ASPECT;
  const glow = `drop-shadow(0 0 ${(16 * halo).toFixed(1)}px rgba(2,119,255,0.9)) drop-shadow(0 0 ${(46 * halo).toFixed(1)}px ${alpha(theme.accent, 0.55)})`;
  const mask = {
    WebkitMaskImage: `url(${LOGO})`,
    maskImage: `url(${LOGO})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat"
  };
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe": "bg", style: {
    position: "absolute",
    left: CX,
    top: y,
    transform: `perspective(1200px) translate3d(-50%, -50%, 0px) rotateX(0.15deg) scale(${(0.84 + 0.16 * p).toFixed(3)})`,
    opacity: clamp01(p * 2)
  }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
      position: "absolute",
      left: -520,
      top: -230,
      width: 1040,
      height: 460,
      borderRadius: "50%",
      opacity: 0.55 * halo,
      background: `radial-gradient(ellipse, ${alpha(theme.accent, 0.36)} 0%, ${alpha(theme.accent, 0.09)} 46%, transparent 72%)`,
      filter: "blur(26px)",
      mixBlendMode: "screen"
    } }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(esm.Img, { src: LOGO, style: {
      position: "absolute",
      left: 0,
      top: LH / 2 + 14,
      transform: "translate(-50%, 0) scaleY(-1)",
      width: LOGO_W,
      height: LH,
      opacity: 0.16 * p,
      filter: "blur(3px)",
      WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 70%)",
      maskImage: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 70%)"
    } }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: 0, transform: "translate(-50%,-50%)", width: LOGO_W, height: LH, filter: glow }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, ...mask, background: `linear-gradient(180deg, #FFFFFF 0%, ${theme.accentBright} 46%, ${theme.accent} 100%)` } }) }),
    sweep > 1e-3 && sweep < 0.999 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
      position: "absolute",
      left: 0,
      top: 0,
      transform: "translate(-50%,-50%)",
      width: LOGO_W,
      height: LH,
      ...mask,
      mixBlendMode: "screen",
      background: `linear-gradient(105deg, transparent ${(sweep * 140 - 30).toFixed(1)}%, rgba(255,255,255,0.9) ${(sweep * 140 - 18).toFixed(1)}%, transparent ${(sweep * 140 - 6).toFixed(1)}%)`
    } })
  ] });
};
export const Watermark = ({ lit, outAt }) => {
  const f = (0,esm.useCurrentFrame)();
  const y = (1 - rOut(f, 0, 26)) * 210 + rIn(f, outAt, outAt + 26) * 210 + drift2(f, 190, 77, 2);
  if (y >= 205) return null;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe": "bg", style: {
    position: "absolute",
    left: 540 - 65,
    top: 1745 - 20,
    width: 130,
    height: 130 / LOGO_ASPECT,
    opacity: 0.3,
    transform: `perspective(1200px) translate3d(0px, ${y.toFixed(2)}px, 0px) rotateX(0.15deg)`
  }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(esm.Img, { src: aud("brand/bankers-logo-white.svg"), style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      opacity: 1 - clamp01(lit),
      filter: "drop-shadow(0 0 1.5px rgb(6, 16, 46)) drop-shadow(0 0 1.5px rgb(6, 16, 46)) drop-shadow(0 0 0.8px rgb(6, 16, 46))"
    } }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(esm.Img, { src: aud("brand/bankers-logo-black.svg"), style: { position: "absolute", inset: 0, width: "100%", height: "100%", opacity: clamp01(lit) } })
  ] });
};
export const QuestionStage = () => null;
