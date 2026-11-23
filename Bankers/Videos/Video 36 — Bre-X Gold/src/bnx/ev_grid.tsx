// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rOut } from "./anim";
import { theme } from "./theme";
import { GRID_LIT } from "./data_lt";
import { label } from "./kit";
import { prism, rampAt } from "./solid_engine";
import { I3, child, circ, objPath, objScr, p2, paintObj, rotX, rrectPts } from "./pie_world";
import { Contact, HexBolt, Screw, Solid, Sv, WPlane } from "./pie_kit";
import { PERF, TILE, TILE_LIT, TILE_RING, TILE_RING_LIT } from "./ev_mat";
import { GROOVE, GROOVE_HI, LEDGE, PLATE_BG, PLATE_LIP, POCKET, POCKET_LIP, SCREW, SCREW_RIM, TRAY } from "./ev_mat_g";
import { ENG_GROOVE, ENG_LIP, PRINT } from "./pie_ink";

const EV_RIG = { cx: 540, cy: 900, persp: 1700 };
const COLS = 10, ROWS = 10;
const TL = { w: 72, h: 46, d: 12 }, PX = 83, PY = 57;
const GW = COLS * TL.w + (COLS - 1) * (PX - TL.w), GH = ROWS * TL.h + (ROWS - 1) * (PY - TL.h);
const TR = { w: GW + 64, h: GH + 64, d: 40, recline: 18 };
const TRAY_C = [540, 832, 0];
const TRAY_POSE = { o: TRAY_C, m: rotX(TR.recline), rig: EV_RIG };
const LG = { w: TR.w + 36, h: 78, d: 150 };
const FOOT = objScr(TRAY_POSE, [0, TR.h / 2, TR.d / 2]);
const TRAY_FOOT_W = (() => {
  const a = Math.cos(TR.recline * Math.PI / 180), b = Math.sin(TR.recline * Math.PI / 180);
  return [TRAY_C[0], TRAY_C[1] + TR.h / 2 * a, TRAY_C[2] + TR.h / 2 * b];
})();
const LEDGE_TOP = TRAY_FOOT_W[1] - 22;
const LEDGE_POSE = { o: [540, LEDGE_TOP + LG.h / 2, TRAY_FOOT_W[2] + 18], m: I3, rig: EV_RIG };
export const EV_FLOOR = LEDGE_TOP + LG.h;
void FOOT;
const tileUV = (c, r) => [-GW / 2 + TL.w / 2 + c * PX, -GH / 2 + TL.h / 2 + r * PY];
const ORDER = Array.from({ length: COLS * ROWS }, (_, k) => ({ c: Math.floor(k / ROWS), r: k % ROWS }));
const isLit = (c, r) => c * ROWS + r < GRID_LIT;
if (ORDER.filter((t) => isLit(t.c, t.r)).length !== GRID_LIT) throw new Error("ev_grid: the lit set must be GRID_LIT tiles");
const TILE_FACES = prism([[-TL.w / 2, -TL.h / 2], [TL.w / 2, -TL.h / 2], [TL.w / 2, TL.h / 2], [-TL.w / 2, TL.h / 2]], TL.d, 1.6, 0, 1);
const W_TILE = TR.d / 2 - 3.5 + TL.d / 2;
const ringC = [[0, -3], [12, -3], [24, -3], [0, 10], [12, 10], [24, 10]].map(([u, v]) => [u - 1, v]);
const RING_R = 4.3;
let GEO = null;
const build = () => {
  const tiles = [];
  const holes = [], lips = [], hiArcs = [], loArcs = [], lines = [], bars = [], pockets = [], pocketLips = [];
  const arc = (o, cx, cy, rr, a0, a1, w) => objPath(o, Array.from({ length: 9 }, (_, i) => {
    const a = a0 + (a1 - a0) * i / 8;
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a), w];
  }), false);
  for (const { c, r } of ORDER) {
    const [u, v] = tileUV(c, r);
    const o = child(TRAY_POSE, [u, v, W_TILE]);
    const painted = paintObj(TILE_FACES, o);
    const cap = painted.find((dw) => dw.face.cap && dw.face.n[2] > 0);
    const zc = TL.d / 2 + 0.25;
    const pw = TL.w / 2 + 4, ph = TL.h / 2 + 4, zt = TR.d / 2 + 0.2;
    pockets.push(objPath(TRAY_POSE, [[u - pw, v - ph, zt], [u + pw, v - ph, zt], [u + pw, v + ph, zt], [u - pw, v + ph, zt]]));
    pocketLips.push(objPath(TRAY_POSE, [[u - pw + 1, v + ph, zt + 0.1], [u + pw, v + ph, zt + 0.1], [u + pw, v - ph + 1, zt + 0.1]], false));
    for (const hv of [-16, -8, 0, 8, 16]) {
      holes.push(objPath(o, circ(-TL.w / 2 + TL.w / 3, hv, 1.7, 1.7, 8).map(([a, b]) => [a, b, zc])));
      lips.push(arc(o, -TL.w / 2 + TL.w / 3, hv, 1.9, 0.2, 2.9, zc + 0.1));
    }
    for (const [ru, rv] of ringC) {
      hiArcs.push(arc(o, ru, rv, RING_R, Math.PI * 0.9, Math.PI * 1.85, zc + 0.3));
      loArcs.push(arc(o, ru, rv, RING_R, -0.15 * Math.PI, 0.85 * Math.PI, zc + 0.3));
    }
    lines.push(objPath(o, [[-8, -15, zc], [33, -15, zc]], false), objPath(o, [[-31, -14, zc], [-17, -14, zc]], false), objPath(o, [[-31, -9, zc], [-21, -9, zc]], false));
    [-31, -29.5, -27.4, -26, -24.2, -22.6, -21, -19.6].forEach((bu, i) => bars.push(objPath(o, [[bu, 2, zc], [bu, 15 - (i % 3 === 1 ? 2 : 0), zc]], false)));
    const glowPts = [[-TL.w / 2 - 15, -TL.h / 2 - 14], [TL.w / 2 + 15, -TL.h / 2 - 14], [TL.w / 2 + 15, TL.h / 2 + 14], [-TL.w / 2 - 15, TL.h / 2 + 14]].map(([a, b]) => [a, b, -TL.d / 2]);
    const ringLit = ringC.map(([ru, rv]) => objPath(o, circ(ru, rv, RING_R, RING_R, 14).map(([a, b]) => [a, b, zc + 0.35]))).join(" ");
    tiles.push({ c, r, body: painted.filter((dw) => dw !== cap), cap, glow: objPath(o, glowPts), ringLit, center: objScr(o, [0, 0, zc]) });
  }
  return {
    tiles,
    holes: holes.join(" "),
    lips: lips.join(" "),
    hiArcs: hiArcs.join(" "),
    loArcs: loArcs.join(" "),
    lines: lines.join(" "),
    bars: bars.join(" "),
    pockets: pockets.join(" "),
    pocketLips: pocketLips.join(" ")
  };
};
const geo = () => GEO ??= build();
const crossAt = (wv, c, r) => wv.a + (wv.b - wv.a - 6) * (c + 0.06 * r) / (COLS - 1 + 0.06 * (ROWS - 1));
const tileLight = (wv, c, r, g) => {
  const t = crossAt(wv, c, r);
  const glint = Math.exp(-(((g - t) / 4.2) ** 2));
  return { lit: isLit(c, r) ? rOut(g, t - 2, t + 12) : 0, glint };
};
export const waveX = (wv, g) => {
  const p = clamp01((g - wv.a) / (wv.b - wv.a - 6));
  return 540 + (p - 0.5) * GW * 0.98;
};
export const EV_TRAY_C = (() => {
  const s = objScr(TRAY_POSE, [0, 0, TR.d / 2]);
  return { x: s[0], y: s[1] };
})();
export const EV_SET_C = (() => {
  const t = objScr(TRAY_POSE, [0, -TR.h / 2, TR.d / 2]);
  return { x: 540, y: (t[1] + EV_FLOOR) / 2 };
})();
export const EvGrid = ({ g, wave, word, name, stage }) => {
  const G = geo();
  const so = 1 - 0.6 * stage;
  const lights = G.tiles.map((t) => tileLight(wave, t.c, t.r, g));
  const anyLit = lights.reduce((a, l) => a + l.lit, 0) / GRID_LIT;
  const zt = TR.d / 2 + 0.25;
  const ins = (m) => rrectPts(TR.w - 2 * m, TR.h - 2 * m, 10, 4).map(([a, b]) => [a, b, zt]);
  const ticksTop = Array.from({ length: COLS }, (_, c) => {
    const [u] = tileUV(c, 0);
    return objPath(TRAY_POSE, [[u, -TR.h / 2 + 12, zt], [u, -TR.h / 2 + 22, zt]], false);
  }).join(" ");
  const ticksLeft = Array.from({ length: ROWS }, (_, r) => {
    const [, v] = tileUV(0, r);
    return objPath(TRAY_POSE, [[-TR.w / 2 + 12, v, zt], [-TR.w / 2 + 22, v, zt]], false);
  }).join(" ");
  const corners = [[-TR.w / 2 + 16, -TR.h / 2 + 16], [TR.w / 2 - 16, -TR.h / 2 + 16], [TR.w / 2 - 16, TR.h / 2 - 16], [-TR.w / 2 + 16, TR.h / 2 - 16]];
  const zl = LG.d / 2 + 0.3;
  const slot = (() => {
    const yTop = -LG.h / 2 - 0.2, zF = TRAY_FOOT_W[2] - LEDGE_POSE.o[2] + 4, zB = zF - TR.d - 10;
    return objPath(LEDGE_POSE, [[-TR.w / 2 - 6, yTop, zB], [TR.w / 2 + 6, yTop, zB], [TR.w / 2 + 6, yTop, zF], [-TR.w / 2 - 6, yTop, zF]]);
  })();
  const plate = rrectPts(470, 50, 6, 3).map(([a, b]) => [a, b + 2, zl]);
  const printOn = rOut(g, word - 10, word + 8);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe-object": "the grid tray: 100 ticket tiles in their pockets, its ledge and nameplate", style: { position: "absolute", inset: 0 }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Sv, { part: "ev-floor", children: /* @__PURE__ */ (0,jsx_runtime.jsx)(Contact, { rig: EV_RIG, y: EV_FLOOR, x0: 540 - LG.w / 2, x1: 540 + LG.w / 2, z0: LEDGE_POSE.o[2] - LG.d / 2, z1: LEDGE_POSE.o[2] + LG.d / 2, dark: 0.9 * so }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)(Sv, { part: "ev-tray", children: [
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("defs", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsxs)("radialGradient", { id: "evGlow", cx: "0.5", cy: "0.5", r: "0.5", children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: theme.accent, stopOpacity: 0.7 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.62", stopColor: theme.accent, stopOpacity: 0.42 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: theme.accent, stopOpacity: 0 })
        ] }),
        /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: "evDim", x1: "0", y1: "0", x2: "0.7", y2: "1", children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: rampAt(TILE, 0.4) }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.35", stopColor: rampAt(TILE, 0.28) }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: rampAt(TILE, 0.12) })
        ] }),
        /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: "evLit", x1: "0", y1: "0", x2: "0.7", y2: "1", children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: theme.accentBright }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.3", stopColor: theme.accent }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: rampAt(TILE_LIT, 0.3) })
        ] }),
        /* @__PURE__ */ (0,jsx_runtime.jsxs)("radialGradient", { id: "evSpill", cx: "0.5", cy: "0.5", r: "0.5", children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: theme.accent, stopOpacity: 0.14 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: theme.accent, stopOpacity: 0 })
        ] })
      ] }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Solid, { faces: TRAY_FACES, o: TRAY_POSE, ramp: TRAY, id: "evTr", capLift: 0.12, arris: 0.22 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(TRAY_POSE, ins(22)), fill: "none", stroke: GROOVE, strokeWidth: 2.2, opacity: 0.85 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(TRAY_POSE, ins(23.6)), fill: "none", stroke: GROOVE_HI, strokeWidth: 0.9, opacity: 0.32 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: ticksTop + " " + ticksLeft, stroke: GROOVE, strokeWidth: 2, strokeLinecap: "round", opacity: 0.8, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: ticksTop + " " + ticksLeft, stroke: GROOVE_HI, strokeWidth: 0.8, strokeLinecap: "round", opacity: 0.3, fill: "none", transform: "translate(0.8 1)" }),
      corners.map(([u, v], i) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Screw, { o: TRAY_POSE, u, v, w: zt, r: 6, ramp: SCREW, rim: SCREW_RIM, slot: 20 + 37 * i }, i)),
      anyLit > 1e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(TRAY_POSE, ins(30)), fill: "url(#evSpill)", opacity: clamp01(anyLit) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: G.pockets, fill: POCKET, opacity: 0.92 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: G.pocketLips, fill: "none", stroke: POCKET_LIP, strokeWidth: 1, opacity: 0.45 }),
      G.tiles.map((t, k) => lights[k].lit > 2e-3 ? /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: t.glow, fill: "url(#evGlow)", opacity: 0.85 * lights[k].lit }, `g${k}`) : null),
      G.tiles.map((t, k) => {
        const L = lights[k];
        const on = Math.max(L.lit, 0.42 * L.glint * (1 - L.lit));
        return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
          t.body.map((dw, j) => {
            const l = (dw.face.bev ? 0.8 * dw.light + 0.1 : 0.6 * dw.light) + 0.3 * L.lit;
            return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: rampAt(TILE, l), stroke: rampAt(TILE, l), strokeWidth: 0.5, strokeLinejoin: "round" }, j);
          }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: t.cap.d, fill: "url(#evDim)" }),
          on > 4e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: t.cap.d, fill: "url(#evLit)", opacity: on })
        ] }, k);
      }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: G.bars, stroke: PERF, strokeWidth: 1.1, opacity: 0.75, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: G.lines, stroke: PERF, strokeWidth: 1.2, opacity: 0.6, fill: "none", strokeLinecap: "round" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: G.holes, fill: PERF }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: G.lips, stroke: TILE_RING, strokeWidth: 0.7, opacity: 0.65, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: G.loArcs, stroke: PERF, strokeWidth: 1.3, opacity: 0.7, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: G.hiArcs, stroke: TILE_RING, strokeWidth: 1.1, opacity: 0.85, fill: "none" }),
      G.tiles.map((t, k) => lights[k].lit > 4e-3 ? /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: t.ringLit, stroke: TILE_RING_LIT, strokeWidth: 1, fill: "none", opacity: 0.75 * lights[k].lit }, `r${k}`) : null)
    ] }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)(Sv, { part: "ev-ledge", children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Solid, { faces: LEDGE_FACES, o: LEDGE_POSE, ramp: LEDGE, id: "evLg", capLift: 0.14, arris: 0.28 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: slot, fill: "#000000", opacity: 0.55 }),
      [-LG.h / 2 + 12, LG.h / 2 - 11].map((v, i) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(LEDGE_POSE, [[-LG.w / 2 + 14, v, zl], [LG.w / 2 - 14, v, zl]], false), stroke: GROOVE, strokeWidth: 1.8, opacity: 0.8 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(LEDGE_POSE, [[-LG.w / 2 + 14, v + 1.4, zl], [LG.w / 2 - 14, v + 1.4, zl]], false), stroke: GROOVE_HI, strokeWidth: 0.8, opacity: 0.3 })
      ] }, i)),
      [-LG.w / 2 + 34, LG.w / 2 - 34].map((u, i) => /* @__PURE__ */ (0,jsx_runtime.jsx)(HexBolt, { o: LEDGE_POSE, u, v: 2, w: zl, r: 9, ramp: SCREW, rim: SCREW_RIM }, i)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(LEDGE_POSE, plate), fill: PLATE_BG }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(LEDGE_POSE, plate.slice(0, Math.floor(plate.length / 2)), false), stroke: "#000000", strokeWidth: 2, opacity: 0.5, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(LEDGE_POSE, [[-233, 27, zl + 0.1], [233, 27, zl + 0.1]], false), stroke: PLATE_LIP, strokeWidth: 1, opacity: 0.5 })
    ] }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(WPlane, { o: LEDGE_POSE, w: zl + 0.2, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "absolute", left: -235, top: -12, width: 470, textAlign: "center" }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { style: { display: "block", position: "absolute", left: 0, top: 1.2, width: 470, ...label(28, ENG_LIP), opacity: 0.08 }, children: name }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { style: { display: "block", position: "absolute", left: 0, top: 0, width: 470, ...label(28, ENG_GROOVE), opacity: 0.2 }, children: name })
    ] }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(WPlane, { o: LEDGE_POSE, w: zl + 0.4, op: printOn, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-print": "the nameplate's words", style: { position: "absolute", left: -235, top: -12, width: 470, textAlign: "center", ...label(28, PRINT) }, children: name }) })
  ] });
};
const TRAY_FACES = prism(rrectPts(TR.w, TR.h, 14, 5), TR.d, 4, 0, 1);
const LEDGE_FACES = prism(rrectPts(LG.w, LG.h, 6, 3), LG.d, 4, 0, 1);
void p2;
