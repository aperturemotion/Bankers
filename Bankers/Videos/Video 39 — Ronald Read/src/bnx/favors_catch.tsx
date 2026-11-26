// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { theme } from "./theme";
import { cw, prism, rampAt } from "./solid_engine";
import { child, circ, objPath, objScr, paintObj, rotX, rotY, rotZ } from "./pie_world";
import { HexBolt, Sv } from "./pie_kit";
import { COIN } from "./pie_mat";
import { PAD, TICK, TICK_HI } from "./pie_mat_g";
import { COIN_G, WEDGE_DIR } from "./pie_coin";

export const OUT_LOCK = 96;
const RC = COIN_G.R + 1, Y = 104, XO = 384, H = COIN_G.D, SKIRT = 40, HX = 374;
const JAW = cw([
  ...Array.from({ length: 13 }, (_, i) => {
    const y = -Y + 2 * Y * i / 12;
    return [OUT_LOCK + Math.sqrt(RC * RC - y * y), y];
  }),
  [XO - 16, Y],
  [XO - 16, -Y]
]);
const BODY = prism(JAW, H, 2.2, 0, 1, () => false, [0, 0, H / 2]);
const SKIRT_F = prism(cw([[XO - 16, -Y], [XO, -Y], [XO, Y], [XO - 16, Y]]), H + SKIRT, 2.2, 0, 1, () => false, [0, 0, (H - SKIRT) / 2]);
const LATCH = prism(cw([[-74, -40], [0, -40], [0, 40], [-74, 40]]), 7, 1.4, 0, 1, () => false, [0, 0, 3.5]);
const KNUCKLE = prism(cw(circ(0, 0, 7.5, 7.5, 14)), 94, 1, 0, 1);
export const LotteryCatch = ({ P, s }) => {
  const C = child(P, [0, 0, 0], rotZ(WEDGE_DIR));
  const hinge = child(C, [HX, 0, H + 1], rotY(108 * s.open));
  const knuckle = child(C, [HX, 0, H + 1], rotX(90));
  const body = [...paintObj(SKIRT_F, C), ...paintObj(BODY, C)].sort((a, b) => a.face.pass - b.face.pass || a.depth - b.depth);
  const lamp = clamp01(s.lamp);
  const LX = HX - 18, LY = 74;
  const lampAt = (r, du = 0, dv = 0) => circ(LX + du, LY + dv, r, r, 18).map(([x, y]) => [x, y, H + 0.4]);
  const lc = objScr(C, [LX, LY, H + 0.4]);
  const paintSolid = (faces, o, ramp, capL) => paintObj(faces, o).map((dw, k) => {
    const top = dw.face.cap && dw.face.n[2] > 0;
    const c = top ? rampAt(ramp, 0.86 * dw.light + capL) : rampAt(ramp, dw.face.bev ? 0.9 * dw.light + 0.16 : 0.8 * dw.light);
    return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
  });
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(Sv, { part: `${s.id}-catch`, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("radialGradient", { id: `${s.id}L`, cx: "0.5", cy: "0.5", r: "0.5", children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: "#ffffff", stopOpacity: 1 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.35", stopColor: theme.accentBright, stopOpacity: 0.7 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: theme.accent, stopOpacity: 0 })
    ] }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { "data-probe-object": "the lottery's catch on the pad's lip: its jaw, latch and lamp", children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(C, JAW.map(([x, y]) => [x + 5, y + 6, 0.3])), fill: "#000000", opacity: 0.35 }),
      body.map((dw, k) => {
        const top = dw.face.cap && dw.face.n[2] > 0;
        const c = top ? rampAt(PAD, 0.86 * dw.light + 0.06) : rampAt(PAD, dw.face.bev ? 0.9 * dw.light + 0.16 : 0.8 * dw.light);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
      }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(C, [[XO - 26, -Y + 8, H + 0.2], [XO - 26, Y - 8, H + 0.2]], false), stroke: TICK, strokeWidth: 1.8, opacity: 0.75 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(C, [[XO - 25, -Y + 8, H + 0.2], [XO - 25, Y - 8, H + 0.2]], false), stroke: TICK_HI, strokeWidth: 0.6, opacity: 0.3 }),
      [-74, -54].map((y) => /* @__PURE__ */ (0,jsx_runtime.jsx)(HexBolt, { o: C, u: HX - 18, v: y, w: H + 0.2, r: 7, ramp: PAD, rim: TICK }, y)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(C, lampAt(12)), fill: TICK, opacity: 0.95 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(C, lampAt(12.8, -0.6, -0.8)), fill: "none", stroke: TICK_HI, strokeWidth: 0.8, opacity: 0.35 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(C, lampAt(9)), fill: rampAt(PAD, 0.18) }),
      lamp > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(C, lampAt(9)), fill: theme.accentBright, opacity: lamp }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(C, lampAt(3.6, -2.6, -2.6)), fill: "#ffffff", opacity: 0.3 + 0.55 * lamp }),
      lamp > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("ellipse", { cx: lc[0].toFixed(1), cy: lc[1].toFixed(1), rx: (22 + 40 * lamp).toFixed(1), ry: (16 + 28 * lamp).toFixed(1), fill: `url(#${s.id}L)`, opacity: 0.85 * lamp }),
      paintSolid(KNUCKLE, knuckle, COIN, 0.04),
      paintSolid(LATCH, hinge, COIN, 0.06)
    ] })
  ] });
};
