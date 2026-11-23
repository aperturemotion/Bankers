// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import * as react from "react";

const measure = (frame) => {
  const root = document.getElementById("bnx-root");
  if (!root) {
    console.log(`ORB ${frame} {"err":"no root"}`);
    return;
  }
  const rr = root.getBoundingClientRect();
  const sx = 1080 / rr.width, sy = 1920 / rr.height;
  const by = {};
  root.querySelectorAll("[data-orb-half]").forEach((el) => {
    const id = el.getAttribute("data-orb-half") ?? "?";
    const b = el.getBoundingClientRect();
    (by[id] ??= []).push({ x: (b.left + b.width / 2 - rr.left) * sx, y: (b.top + b.height / 2 - rr.top) * sy });
  });
  const orbs = Object.entries(by).map(([id, ps]) => {
    const x0 = Math.min(...ps.map((p) => p.x)), x1 = Math.max(...ps.map((p) => p.x)), y = Math.min(...ps.map((p) => p.y));
    const bad = ps.length === 2 && y < 1919 && x1 > 0 && x0 < 1080;
    return { id, y: +y.toFixed(1), x0: +x0.toFixed(1), x1: +x1.toFixed(1), n: ps.length, bad };
  });
  console.log(`ORB ${frame} ${JSON.stringify({ orbs })}`);
};
export const OrbCheck = () => {
  const frame = (0,esm.useCurrentFrame)();
  (0,react.useLayoutEffect)(() => {
    const handle = (0,esm.delayRender)(`orbcheck ${frame}`);
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        measure(frame);
        (0,esm.continueRender)(handle);
      });
    });
    return () => {
      cancelAnimationFrame(raf);
      (0,esm.continueRender)(handle);
    };
  }, [frame]);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: { position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("circle", { "data-orb-half": "CANARY-IN", cx: 300, cy: 1500, r: 0.5, fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("circle", { "data-orb-half": "CANARY-IN", cx: 600, cy: 1500, r: 0.5, fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("circle", { "data-orb-half": "CANARY-OUT", cx: 300, cy: 2e3, r: 0.5, fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("circle", { "data-orb-half": "CANARY-OUT", cx: 600, cy: 2e3, r: 0.5, fill: "none" })
  ] });
};
