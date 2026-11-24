// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import * as react from "react";
import { clamp01 } from "./anim";
import { figure, label } from "./kit";
import { rampAt } from "./solid_engine";
import { XPlane, facingM, mapPath, rrectPts, xfMul, xfRotX, xfTrans } from "./tk_rig";

const N = 10;
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const winWidth = (met, slots, pad, gap) => 2 * pad + slots.reduce((a, s) => a + (s.k === "drum" ? met.w : s.w ?? 0), 0) + gap * (slots.length - 1);
export const winGeo = (map, rig, win) => {
  const { u0, v0, zF } = win, u1 = u0 + win.w, v1 = v0 + win.h, zR = zF - win.rd;
  const hole = mapPath(map, rig, rrectPts(win.w, win.h, 5, 3, (u0 + u1) / 2, (v0 + v1) / 2).map(([u, v]) => [u, v, zF + 0.2]));
  const walls = [
    { n: [0, 1, 0], q: [[u0, v0, zF], [u1, v0, zF], [u1, v0, zR], [u0, v0, zR]], l: 0.18 },
    { n: [0, -1, 0], q: [[u0, v1, zF], [u1, v1, zF], [u1, v1, zR], [u0, v1, zR]], l: 0.55 },
    { n: [1, 0, 0], q: [[u0, v0, zF], [u0, v1, zF], [u0, v1, zR], [u0, v0, zR]], l: 0.42 },
    { n: [-1, 0, 0], q: [[u1, v0, zF], [u1, v1, zF], [u1, v1, zR], [u1, v0, zR]], l: 0.62 }
  ].filter((wl) => facingM(map, rig, wl.n, [(wl.q[0][0] + wl.q[2][0]) / 2, (wl.q[0][1] + wl.q[2][1]) / 2, (zF + zR) / 2]) > 0).map((wl) => ({ d: mapPath(map, rig, wl.q), l: wl.l }));
  const floor = mapPath(map, rig, [[u0, v0, zR], [u1, v0, zR], [u1, v1, zR], [u0, v1, zR]]);
  const lip = mapPath(map, rig, [[u0 + 4, v1 + 1.5, zF + 0.3], [u1 - 4, v1 + 1.5, zF + 0.3]], false);
  const top = mapPath(map, rig, [[u0 + 4, v0 - 1.5, zF + 0.3], [u1 - 4, v0 - 1.5, zF + 0.3]], false);
  return { hole, walls, floor, lip, top };
};
const DrumCells = ({ rig, pose, u0, va, wa, R, met, pos, glyph, half, k }) => {
  const ch = met.size + 8, step = 360 / N;
  const th0 = Math.asin(Math.min(1, half / R)) * 180 / Math.PI;
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: Array.from({ length: N }, (_, c) => {
    const kk = c + N * Math.round((pos - c) / N);
    const th = -(kk - pos) * step;
    const op = 1 - smooth(th0, th0 + 9, Math.abs(th));
    const x = xfMul(pose, xfMul(xfTrans([0, va, wa]), xfMul(xfRotX(th), xfTrans([0, 0, R]))));
    return /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x, u: u0, v: -ch / 2, w: 0, width: met.w, height: ch, op, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: 4, width: met.w, textAlign: "center", ...figure(met.size, glyph) }, children: c }) }, `${k}${c}`);
  }) });
};
export const Readout = ({ rig, pose, win, met, slots, ink, lit, id }) => {
  const zR = win.zF - win.rd, wFront = zR - 2;
  const R = met.pitch * N / (2 * Math.PI), wa = wFront - R, va = win.v0 + win.h / 2, chH = win.h;
  const [dA, dB, dC, dD] = ink.drum;
  const xs = [];
  let x = win.u0 + win.pad;
  for (const s of slots) {
    xs.push(x);
    x += (s.k === "drum" ? met.w : s.w) + win.gap;
  }
  const glyphTop = (chH - met.size) / 2 + 4;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    slots.map((s, i) => {
      if (s.k === "glyph") {
        return /* @__PURE__ */ (0,jsx_runtime.jsxs)(react.Fragment, { children: [
          /* @__PURE__ */ (0,jsx_runtime.jsxs)(XPlane, { rig, x: pose, u: xs[i], v: win.v0, w: wFront, width: s.w, height: chH, children: [
            /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, borderRadius: 3, background: `linear-gradient(180deg, ${dA} 0%, ${ink.plateBg} 30%, ${dB} 50%, ${ink.plateBg} 72%, ${dA} 100%)` } }),
            /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: glyphTop, width: s.w, textAlign: "center", opacity: 0.26, ...figure(met.size, ink.glyph) }, children: s.ch })
          ] }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x: pose, u: xs[i], v: win.v0, w: wFront + 0.2, width: s.w, height: chH, op: clamp01(s.on), children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: glyphTop, width: s.w, textAlign: "center", ...figure(met.size, ink.glyph) }, children: s.ch }) })
        ] }, `${id}g${i}`);
      }
      return /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x: pose, u: xs[i], v: win.v0, w: wFront, width: met.w, height: chH, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
        position: "absolute",
        inset: 0,
        borderRadius: 3,
        background: `linear-gradient(180deg, ${dA} 0%, ${dB} 16%, ${dC} 32%, ${dD} 44%, ${dC} 60%, ${dB} 84%, ${dA} 100%)`
      } }) }, `${id}b${i}`);
    }),
    slots.map((s, i) => s.k === "drum" ? /* @__PURE__ */ (0,jsx_runtime.jsx)(DrumCells, { rig, pose, u0: xs[i], va, wa, R, met, pos: s.pos, glyph: ink.glyph, half: win.h / 2, k: `${id}d${i}_` }, `${id}c${i}`) : null),
    slots.map((s, i) => s.k === "drum" ? /* @__PURE__ */ (0,jsx_runtime.jsxs)(XPlane, { rig, x: pose, u: xs[i], v: win.v0, w: wFront + 0.4, width: met.w, height: chH, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 20%, rgba(0,0,0,0) 36%, rgba(0,0,0,0) 64%, rgba(0,0,0,0.24) 80%, rgba(0,0,0,0.74) 100%)" } }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0) 26%, rgba(255,255,255,0.07) 35%, rgba(255,255,255,0.02) 42%, rgba(255,255,255,0) 48%)" } }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0) 8px, rgba(0,0,0,0) calc(100% - 9px), rgba(0,0,0,0.7) 100%)" } }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 2, top: 0, width: 1.5, height: chH, background: "linear-gradient(180deg, rgba(255,255,255,0) 10%, rgba(255,255,255,0.3) 38%, rgba(255,255,255,0.08) 70%, rgba(255,255,255,0) 90%)" } })
    ] }, `${id}s${i}`) : null),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x: pose, u: win.u0, v: win.v0, w: wFront + 0.6, width: win.w, height: chH, op: clamp01(lit), children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 62% at 50% 100%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)" } }) })
  ] });
};
export const Glass = ({ rig, pose, win, ink, id }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x: pose, u: win.u0, v: win.v0, w: win.zF + 0.3, width: win.w, height: win.h, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: win.w, height: win.h, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
  /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Gls`, x1: "0", y1: "0", x2: "1", y2: "1", children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: "#ffffff", stopOpacity: 0 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.24", stopColor: "#ffffff", stopOpacity: 0 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.3", stopColor: "#ffffff", stopOpacity: 0.08 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.37", stopColor: "#ffffff", stopOpacity: 0 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: "#ffffff", stopOpacity: 0 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.54", stopColor: "#ffffff", stopOpacity: 0.045 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.6", stopColor: "#ffffff", stopOpacity: 0 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: "#ffffff", stopOpacity: 0 })
  ] }) }),
  /* @__PURE__ */ (0,jsx_runtime.jsx)("rect", { x: 0, y: 0, width: win.w, height: win.h, rx: 5, fill: ink.glass, opacity: 0.12 }),
  /* @__PURE__ */ (0,jsx_runtime.jsx)("rect", { x: 0, y: 0, width: win.w, height: win.h, rx: 5, fill: `url(#${id}Gls)` }),
  /* @__PURE__ */ (0,jsx_runtime.jsx)("rect", { x: 3, y: 0, width: win.w - 6, height: 1.5, fill: "#ffffff", opacity: 0.36 })
] }) });
export const WinWalls = ({ g, wall }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: g.walls.map((wl, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: wl.d, fill: rampAt(wall, wl.l) }, k)) });
export const Engraved = ({ rig, pose, zF, uC, vC, width, size, text, on, ink, probe, bare = 1 }) => {
  const v = vC - size / 2 - 2, u = uC - width / 2;
  const run = (dy, col, op) => /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { style: { display: "block", position: "absolute", left: 0, top: dy, width, textAlign: "center", ...label(size, col), opacity: op }, children: text });
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x: pose, u, v, w: zF + 0.4, width, height: size + 4, probe, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "relative", width, height: size + 4 }, children: [
      run(1.2, ink.lip, 0.4 * bare),
      run(0, ink.groove, 0.85 * bare)
    ] }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x: pose, u, v, w: zF + 0.5, width, height: size + 4, op: clamp01(on), probe, children: run(0, ink.paint, 1) })
  ] });
};
