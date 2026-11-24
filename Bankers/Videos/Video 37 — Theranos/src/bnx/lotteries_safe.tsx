// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { theme } from "./theme";
import { figure, label } from "./kit";
import { box3, cylW, prism, rampAt } from "./solid_engine";
import { XPlane, mapPath, mapScr, paintXf, rrectPts, wound, xfAbout, xfApply, xfMul, xfRotZ } from "./tk_rig";
import { INK } from "./tk_mat";
import { SF_BODY, SF_DOOR, SF_GROOVE, SF_LIP, SF_STEEL } from "./lotteries_mat";

export const SAFE = { w: 500, h: 520, d: 360, plate: 20, over: 8, door: { w: 430, h: 440, t: 10 } };
const TOP = -(SAFE.h + SAFE.plate);
const ZF = SAFE.d / 2, ZD = ZF + SAFE.door.t;
const DOOR_V0 = -SAFE.h + 34, DOOR_V1 = DOOR_V0 + SAFE.door.h;
const SAFE_ROWS = { sub: { v: DOOR_V0 + 60, w: 380 }, fig: { v: DOOR_V0 + 146, w: 380 } };
const DIAL = { u: -92, v: DOOR_V1 - 96, r: 48 }, HANDLE = { u: 84, v: DOOR_V1 - 96 };
let memo = null;
const parts = () => {
  if (memo) return memo;
  const body = prism(rrectPts(SAFE.w, SAFE.h, 10, 3, 0, -SAFE.h / 2), SAFE.d, 8, 0, 1);
  const plate = prism(rrectPts(SAFE.w + 2 * SAFE.over, SAFE.plate, 4, 2, 0, -SAFE.h - SAFE.plate / 2), SAFE.d + 2 * SAFE.over, 4, 1, 1);
  const feet = [-1, 1].flatMap((su) => [-1, 1].flatMap((sw) => box3([su * (SAFE.w / 2 - 36), 6, sw * (SAFE.d / 2 - 40)], [44, 12, 44], 2, 0)));
  const door = prism(rrectPts(SAFE.door.w, SAFE.door.h, 8, 2, 0, (DOOR_V0 + DOOR_V1) / 2), SAFE.door.t, 3, 3, 3, () => false, [0, 0, ZF + SAFE.door.t / 2]);
  const hinges = [DOOR_V0 + 50, (DOOR_V0 + DOOR_V1) / 2, DOOR_V1 - 50].flatMap((v) => box3([SAFE.door.w / 2 + 7, v, ZF + 8], [14, 46, 14], 2, 5));
  const dial = [...cylW(DIAL.u, DIAL.v, DIAL.r, ZD, ZD + 16, 40, 2, 5), ...cylW(DIAL.u, DIAL.v, 14, ZD + 16, ZD + 28, 24, 2, 7)];
  const hub = cylW(HANDLE.u, HANDLE.v, 17, ZD, ZD + 14, 24, 2, 5);
  const lever = box3([HANDLE.u + 42, HANDLE.v, ZD + 19], [86, 15, 10], 2, 7);
  memo = [wound([...feet, ...body, ...plate]), wound(door), wound([...hinges, ...dial, ...hub]), wound(lever)];
  return memo;
};
const f2 = (v) => v.toFixed(2);
export const LtSafe = ({ id, rig, pose, prints = [], seam = 0, dial = 0, handle = 0, probe = "the lotteries' safe" }) => {
  const map = (q) => xfApply(pose, q);
  const [shell, door, fit, lever] = parts();
  const leverXf = xfMul(pose, xfAbout(xfRotZ(handle), [HANDLE.u, HANDLE.v, 0]));
  const leverMap = (q) => xfApply(leverXf, q);
  const fillOf = (r, light, f) => rampAt(r, f.cap ? 0.62 * light + 0.06 : f.bev ? Math.min(1, 0.95 * light + 0.16) : 0.8 * light + 0.04);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const yT = TOP - 0.4;
  const screws = [-1, 1].flatMap((su) => [-1, 1].map((sz) => {
    const u = su * (SAFE.w / 2 - 18), w = sz * (SAFE.d / 2 - 18);
    const ring = (r, y) => Array.from({ length: 20 }, (_, i) => [u + r * Math.cos(i / 20 * 2 * Math.PI), y, w + r * Math.sin(i / 20 * 2 * Math.PI)]);
    return { head: P(ring(9, yT - 2)), bore: P(ring(12, yT)), slotL: P([[u - 6, yT - 3, w], [u + 6, yT - 3, w]], false), hi: mapScr(map, rig, [u - 3, yT - 3, w - 3]) };
  }));
  const doorOut = rrectPts(SAFE.door.w + 6, SAFE.door.h + 6, 10, 2, 0, (DOOR_V0 + DOOR_V1) / 2).map(([u, v]) => [u, v, ZF + 0.4]);
  const plate = rrectPts(SAFE.door.w - 44, 200, 10, 2, 0, DOOR_V0 + 106).map(([u, v]) => [u, v, ZD + 0.3]);
  const ticks = [];
  for (let i = 0; i < 40; i++) {
    const a = i / 40 * 2 * Math.PI + dial * Math.PI / 180, r0 = DIAL.r - (i % 5 ? 6 : 12), r1 = DIAL.r - 2;
    ticks.push(P([[DIAL.u + r0 * Math.cos(a), DIAL.v + r0 * Math.sin(a), ZD + 16.3], [DIAL.u + r1 * Math.cos(a), DIAL.v + r1 * Math.sin(a), ZD + 16.3]], false));
  }
  const index = P([[DIAL.u - 6, DIAL.v - DIAL.r - 16, ZD + 0.3], [DIAL.u + 6, DIAL.v - DIAL.r - 16, ZD + 0.3], [DIAL.u, DIAL.v - DIAL.r - 6, ZD + 0.3]]);
  const brush = [];
  for (let k = 0; k < 26; k++) {
    const v = DOOR_V0 + 10 + k * ((SAFE.door.h - 20) / 25);
    brush.push(P([[-SAFE.door.w / 2 + 8, v, ZD + 0.2], [SAFE.door.w / 2 - 8, v + 1, ZD + 0.2]], false));
  }
  const bolts = [-1, 1].flatMap((su) => [DOOR_V0 + 18, DOOR_V1 - 18].map((v) => P(Array.from({ length: 6 }, (_, i) => [su * (SAFE.door.w / 2 - 18) + 6 * Math.cos(i / 6 * 2 * Math.PI), v + 6 * Math.sin(i / 6 * 2 * Math.PI), ZD + 0.5]))));
  const s = clamp01(seam);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe-object": probe, style: { position: "absolute", inset: 0 }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("radialGradient", { id: `${id}Sc`, cx: "0.35", cy: "0.3", r: "0.75", children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: rampAt(SF_STEEL, 0.95) }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: rampAt(SF_STEEL, 0.55) }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: rampAt(SF_STEEL, 0.2) })
      ] }) }),
      paintXf(shell, map, rig, 0.5).map((dw, k) => {
        const c = fillOf(dw.face.mat === 2 ? SF_STEEL : SF_BODY, dw.light, dw.face);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, `s${k}`);
      }),
      screws.map((c, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: c.bore, fill: "#000000", opacity: 0.45 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: c.head, fill: `url(#${id}Sc)` }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: c.slotL, stroke: "#000000", strokeWidth: 1.6, opacity: 0.6, fill: "none" })
      ] }, `sw${k}`)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(doorOut), stroke: "#000000", strokeWidth: 4, opacity: 0.6, fill: "none", strokeLinejoin: "round" }),
      s > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(doorOut), stroke: theme.accent, strokeWidth: 14, opacity: 0.18 * s, fill: "none", strokeLinejoin: "round" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(doorOut), stroke: theme.accentBright, strokeWidth: 3, opacity: 0.85 * s, fill: "none", strokeLinejoin: "round" })
      ] }),
      paintXf(door, map, rig, 0.5).map((dw, k) => {
        const c = fillOf(SF_DOOR, dw.light, dw.face);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, `d${k}`);
      }),
      brush.map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: k % 2 ? "#ffffff" : "#000000", strokeWidth: 0.7, opacity: 0.035, fill: "none" }, `g${k}`)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(plate.map(([u, v, w]) => [u + 1.2, v + 1.2, w])), stroke: SF_LIP, strokeWidth: 0.9, opacity: 0.4, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(plate), stroke: SF_GROOVE, strokeWidth: 2.6, opacity: 0.85, fill: "none" }),
      bolts.map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, fill: rampAt(SF_STEEL, 0.6), stroke: rampAt(SF_STEEL, 0.9), strokeWidth: 0.7 }, `b${k}`)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: index, fill: SF_LIP, opacity: 0.8 }),
      paintXf(fit, map, rig, 0.65).map((dw, k) => {
        const c = fillOf(SF_STEEL, dw.light, dw.face);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.5, strokeLinejoin: "round" }, `f${k}`);
      }),
      paintXf(lever, leverMap, rig, 0.65).map((dw, k) => {
        const c = fillOf(SF_STEEL, dw.light, dw.face);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.5, strokeLinejoin: "round" }, `lv${k}`);
      }),
      ticks.map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: SF_GROOVE, strokeWidth: k % 5 ? 1 : 1.8, opacity: 0.8, fill: "none" }, `t${k}`))
    ] }),
    prints.map((p) => /* @__PURE__ */ (0,jsx_runtime.jsx)(SafePrintPlane, { rig, pose, p }, p.key))
  ] });
};
const SafePrintPlane = ({ rig, pose, p }) => {
  const row = SAFE_ROWS[p.row], fig = p.row === "fig";
  const H = fig ? 110 : 44, W = row.w;
  const on = clamp01(p.on);
  if (on <= 3e-3) return null;
  const el = (c) => fig ? figure(104, c) : { ...label(28, c), transform: "scale(1.3)" };
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x: pose, u: -W / 2, v: row.v - H / 2, w: ZD + 0.5, width: W, height: H, op: on, probe: `the safe's print ${p.key}`, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "relative", width: W, height: H }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: fig ? 4 : 6, width: W, textAlign: "center", ...el(SF_LIP), opacity: 0.3 }, children: p.text }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: fig ? 2.5 : 4.5, width: W, textAlign: "center", ...el(SF_GROOVE), opacity: 0.85 }, children: p.text })
    ] }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x: pose, u: -W / 2, v: row.v - H / 2, w: ZD + 0.7, width: W, height: H, op: on, probe: `the safe's print ${p.key}`, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "relative", width: W, height: H }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: fig ? 1 : 3, width: W, textAlign: "center", ...el(INK) }, children: p.text }) }) })
  ] });
};
export const safeCorners = (pose) => {
  const out = [];
  for (const u of [-SAFE.w / 2, SAFE.w / 2]) for (const v of [TOP, 0]) for (const w of [-ZF, ZF]) out.push(xfApply(pose, [u, v, w]));
  return out;
};
const safeAt = (rig, pose, q) => mapScr((p) => xfApply(pose, p), rig, q);
export const SAFE_TOP_V = TOP;
