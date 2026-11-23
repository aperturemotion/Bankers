// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";

const Moon = ({
  x,
  y,
  r = 78,
  at = 0
}) => {
  const f = useCurrentFrame();
  const p = rOut(f, at, at + 40);
  if (p <= 1e-3) return null;
  const S = r * 2.2;
  const c = S / 2;
  return /* @__PURE__ */ jsxs("div", { style: { position: "absolute", left: x - c, top: y - c + (1 - p) * 40, opacity: p }, children: [
    /* @__PURE__ */ jsx("div", { style: {
      position: "absolute",
      left: c - r * 2.2,
      top: c - r * 2.2,
      width: r * 4.4,
      height: r * 4.4,
      borderRadius: "50%",
      filter: "blur(30px)",
      background: "radial-gradient(circle, rgba(219,232,247,0.26) 0%, rgba(219,232,247,0.07) 45%, transparent 70%)",
      mixBlendMode: "screen"
    } }),
    /* @__PURE__ */ jsxs("svg", { width: S, height: S, style: { position: "absolute", inset: 0 }, children: [
      /* @__PURE__ */ jsxs("defs", { children: [
        /* @__PURE__ */ jsxs("radialGradient", { id: "moonFace", cx: "0.34", cy: "0.28", r: "0.9", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#F2F7FC" }),
          /* @__PURE__ */ jsx("stop", { offset: "52%", stopColor: "#B0CDEE" }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#297EDF" })
        ] }),
        /* @__PURE__ */ jsxs("mask", { id: "moonCut", children: [
          /* @__PURE__ */ jsx("circle", { cx: c, cy: c, r, fill: "#FFFFFF" }),
          /* @__PURE__ */ jsx("circle", { cx: c + r * 0.62, cy: c - r * 0.14, r: r * 0.88, fill: "#000000" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("circle", { cx: c, cy: c, r, fill: "url(#moonFace)", mask: "url(#moonCut)" })
    ] })
  ] });
};
export const Plx = ({ z, dx, dy, depth = 1, children }) => {
  const s = 1 + (z - 1) * depth;
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(esm.AbsoluteFill, { style: {
    transform: `translate(${(dx * depth).toFixed(2)}px, ${(dy * depth).toFixed(2)}px) scale(${s.toFixed(4)})`,
    transformOrigin: "50% 54%"
  }, children });
};
