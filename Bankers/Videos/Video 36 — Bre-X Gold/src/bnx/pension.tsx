// @ts-nocheck
// ★ V36 "Bre-X Gold" — place PENSION (builder F, REV1). "The Ontario Teachers' Pension Plan alone lost a hundred million dollars."
//   KIND: bars — style-exempt: Timur asked for a chart (2026-11-23) (felderhof's cash column is the film's other bar-like scene).
//   A horizontal BAR CHART of ONE dataset (pension_data.ts: Maclean's, May 19, 1997, "A sampling of funds and their losses", C$):
//   the sample's four largest losses on one ZERO-BASED scale, as extruded Bankers solids cantilevered from a machined steel upright
//   (the zero line) standing on the floor, each bar sliding out of its steel collar. The chart's base (upright, collars, floor) rises
//   in with the camera; on "Ontario Teachers'" the plan's bar — lit, the only bright one — runs out to C$100M under its name; on
//   "alone" the other three (CAISSE, OMERS, NEWFOUNDLAND) run out dimmer and much shorter; C$100M LOST lands at the lit bar's end on
//   "a hundred million". Then the place pushes out into light (the composition's hand-over) into the "To be fair…" card.
//   Names are episode.json labels; a bar whose label is missing is left out (the film still plays), see pension_data.ts.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn, figure, label } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { mapPath, paintXf, rrectPts, worldScr, wound } from "./tk_rig";
import { prism, rampAt } from "./solid_engine";
import { TK_FLOOR_Y } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { INK } from "./tk_mat";
import { HS_BELL, HS_GROOVE, HS_LIP, HS_TRIM } from "./honest_mat_b";
import { PL_BODY, PL_PLATE, PL_STEEL } from "./counter_mat";
import { Screw } from "./counter_plinth";
import { PENSION_LOSS_M, PENSION_SAMPLE } from "./pension_data";

const RIG = { cx: 540, cy: TK_FLOOR_Y - 1250, persp: 3600, yaw: 12, pitch: -4 };
const F = TK_FLOOR_Y;
// ── the chart's geometry (world px) ───────────────────────────────────────────────────────────────────────────────────────
const UP = { x: 140, w: 58, d: 140, top: 576 };             // the upright: the chart's zero line
const COL = { w: 34, h: 112, d: 136 };                        // a bar's collar on the upright
const BAR = { h: 88, d: 116, max: 640 };                     // a bar: C$100M = BAR.max px (one scale for all, zero-based)
const X0 = UP.x + UP.w / 2 + COL.w;                          // where every bar starts (the collar's face = zero)
const ROW0 = 640, PITCH = 176;
const BARS = PENSION_SAMPLE.filter((b) => typeof L(b.label) === "string" && L(b.label).length > 0).map((b, i) => ({ ...b, i, yc: ROW0 + i * PITCH, len: b.m / PENSION_LOSS_M * BAR.max }));
if (BARS[0].key !== "otpp" || PENSION_LOSS_M !== 100) throw new Error("pension: the lit bar is the Ontario Teachers' Pension Plan's C$100M");
if (BARS[BARS.length - 1].yc + BAR.h / 2 > F - 70) throw new Error("pension: the bottom bar must clear the floor");
const LIT = HS_BELL, DIM = HS_TRIM;
const fillOf = (r, light, f) => rampAt(r, f.cap ? 0.62 * light + 0.06 : f.bev ? Math.min(1, 0.95 * light + 0.16) : 0.8 * light + 0.04);
const Paint = ({ faces, rig, ramp, spec = 0.5, dim = 0 }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: paintXf(faces, (q) => q, rig, spec).map((dw, k) => {
  const c = fillOf(ramp, dw.light * (1 - dim), dw.face);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
}) });
let memo = null;
const fixed = () => {
  if (memo) return memo;
  const up = wound(prism(rrectPts(UP.w, F - 18 - UP.top, 4, 2, UP.x, (UP.top + F - 18) / 2), UP.d, 5, 0, 1));
  const cap = wound(prism(rrectPts(UP.w + 16, 16, 4, 2, UP.x, UP.top - 8), UP.d + 16, 4, 0, 1));
  const foot = wound(prism(rrectPts(240, 18, 4, 2, UP.x + 30, F - 9), 300, 4, 0, 1));
  const collars = wound(BARS.flatMap((b) => prism(rrectPts(COL.w, COL.h, 3, 2, UP.x + UP.w / 2 + COL.w / 2, b.yc), COL.d, 3, 0, 1)));
  memo = { up, cap, foot, collars };
  return memo;
};
const barFaces = (b, len) => len < 1.5 ? null : wound(prism(rrectPts(len, BAR.h, Math.min(6, len / 2), 2, X0 + len / 2, b.yc), BAR.d, Math.min(5, len / 3), 0, 1));
// ── times ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const pensionTimes = (w, end) => {
  for (const k of ["s0", "ontario", "teachers", "plan", "alone", "lost", "k100", "million"]) if (!Number.isFinite(w[k])) throw new Error(`pension: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    name0: { a: w.ontario - 12, b: w.ontario },              // ONTARIO TEACHERS' — read on "Ontario"
    grow0: { a: w.ontario - 2, b: w.teachers + 12 },          // its bar runs out to C$100M on "Ontario Teachers'"
    others: BARS.slice(1).map((b, j) => ({ a: w.alone - 10 + 4 * j, b: w.alone + 14 + 4 * j })),   // …the rest, on "alone"
    sweep: { a: w.lost - 6, b: w.lost + 20 },                 // a light runs along the lit bar on "lost"
    loss: { a: w.k100 - 8, b: w.k100 + 10 },                  // C$100M LOST lands on "a hundred million"
    focus: { a: w.ontario - 8, dur: 34 },                     // the camera leans in on the lit bar…
    back: { a: w.alone - 14, dur: 32 },                       // …and back to the whole chart for "alone"
    crane: end + 2 - 22                                       // the composition's push-light out (HO.pension)
  };
  if (t.grow0.b > t.others[0]?.a + 4) throw new Error("pension: the plan's bar must be out before the others start");
  if (t.loss.b > t.crane) throw new Error("pension: C$100M LOST must be landed before the push-light out");
  if (t.others.some((o) => o.b > t.crane - 8)) throw new Error("pension: every bar must be out before the push-light out");
  return t;
};
// ── the camera ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const at = (x, y, z = 0) => {
  const p = worldScr(RIG, [x, y, z]);
  return { x: p[0], y: p[1] };
};
const shots = (t) => {
  // the whole chart: the middle of its projected box (the upright's top-left to the longest bar's far end, the figure over it)
  const a0 = at(UP.x + 30 - 120, UP.top - 60, 150), a1 = at(X0 + BAR.max, F, BAR.d / 2);   // (the foot plate is the leftmost part)
  const whole = { x: (a0.x + a1.x) / 2 - 10, y: (a0.y + a1.y) / 2 - 20 };
  const lit = { x: whole.x + 30, y: at(0, BARS[0].yc + 120).y };
  return [
    { a: -9999, z: 1.12, push: 0.02, at: still(whole.x, whole.y) },
    { a: t.focus.a, dur: t.focus.dur, z: 1.24, push: 0, at: still(lit.x, lit.y) },
    { a: t.back.a, dur: t.back.dur, z: 1.13, push: 0.02, at: still(whole.x, whole.y) }
  ];
};
export const pensionCamWindows = (t) => actionCamWindows(shots(t));
export const pensionSfx = (t) => [
  { job: "label", a: t.name0.a, b: t.name0.b, vol: 0.4 },
  // ONTARIO TEACHERS'
  { job: "process", a: t.grow0.a, b: t.grow0.b, k: "io", vol: 0.55 },
  // its bar runs out to C$100M
  ...(t.others.length ? [{ job: "process", a: t.others[0].a, b: t.others[t.others.length - 1].b, k: "io", vol: 0.4 }] : []),
  // the other funds' bars run out
  ...(t.others.length ? [{ job: "label", a: t.others[0].a + 4, b: t.others[0].a + 18, vol: 0.3 }] : []),
  // their names
  { job: "label", a: t.loss.a, b: t.loss.b, vol: 0.5 }
  // C$100M LOST
];
// ── the place ──────────────────────────────────────────────────────────────────────────────────────────────────────────
/** a bar's printed details on its front face: a fine top arris, a groove line near its foot, a soft light band */
const BarDetail = ({ b, len, lit, sweep }) => {
  if (len < 8) return null;
  const zf = BAR.d / 2 + 0.3, y0 = b.yc - BAR.h / 2, y1 = b.yc + BAR.h / 2;
  const P = (pts, close = true) => mapPath((q) => q, RIG, pts, close);
  const s0 = X0 - 140 + (len + 280) * sweep;
  const band = P([[Math.max(X0 + 2, s0), y0 + 1, zf], [Math.min(X0 + len - 2, s0 + 60), y0 + 1, zf], [Math.min(X0 + len - 2, s0 + 40), y1 - 1, zf], [Math.max(X0 + 2, s0 - 20), y1 - 1, zf]]);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[X0 + 6, y0 + 1.4, zf], [X0 + len - 6, y0 + 1.4, zf]], false), stroke: "#ffffff", strokeOpacity: lit ? 0.55 : 0.3, strokeWidth: 1.4, fill: "none", strokeLinecap: "round" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[X0 + 8, y1 - 12, zf], [X0 + len - 8, y1 - 12, zf]], false), stroke: lit ? HS_GROOVE : "#000000", strokeOpacity: lit ? 0.35 : 0.3, strokeWidth: 1.6, fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[X0 + 8, y1 - 10.6, zf], [X0 + len - 8, y1 - 10.6, zf]], false), stroke: lit ? HS_LIP : "#ffffff", strokeOpacity: 0.18, strokeWidth: 0.8, fill: "none" }),
    lit && sweep > 0 && sweep < 1 && s0 < X0 + len && s0 + 60 > X0 && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: band, fill: "#ffffff", opacity: 0.16 * Math.sin(Math.PI * sweep) })
  ] });
};
const Name = ({ x, y, on, text, lit }) => on <= 3e-3 ? null : /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-label": "a fund's name", style: {
  position: "absolute", left: 0, top: 0, whiteSpace: "nowrap",
  transform: `translate(${x.toFixed(2)}px, ${(y - 30 + 10 * (1 - on)).toFixed(2)}px)`,
  opacity: clamp01(on * 1.3),
  ...label(30, lit ? INK : "#84B0E4")
}, children: text });
/** C$100M LOST: over the lit bar, its right edge on the bar's end, its foot on the names' line; it eases up into place */
const Loss = ({ x, y, on, text }) => {
  if (on <= 3e-3) return null;
  const Wd = 420;
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-label": "the plan's loss", style: {
    position: "absolute", left: 0, top: 0, width: Wd, textAlign: "right", transformOrigin: "100% 100%",
    transform: `translate(${(x - Wd - 12).toFixed(2)}px, ${(y - 90 + 10 * (1 - on)).toFixed(2)}px) scale(${(0.94 + 0.06 * on).toFixed(4)})`,
    opacity: clamp01(on * 1.4),
    ...figure(60)
  }, children: text });
};
export const BxPension = ({ at: at0, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = pensionTimes(w, end);
  const { up, cap, foot, collars } = fixed();
  const grow = BARS.map((b, i) => i === 0 ? rInOut(f, t.grow0.a, t.grow0.b) : rInOut(f, t.others[i - 1].a, t.others[i - 1].b));
  const nameOn = BARS.map((b, i) => i === 0 ? rOut(f, t.name0.a, t.name0.b) : rOut(f, t.others[i - 1].a + 4, t.others[i - 1].a + 18));
  const sweep = clamp01((f - t.sweep.a) / (t.sweep.b - t.sweep.a));
  const lens = BARS.map((b, i) => b.len * grow[i]);
  const corners = [];
  for (const x of [UP.x - UP.w / 2, X0 + BAR.max]) for (const y of [UP.top, F]) for (const z of [-UP.d / 2, UP.d / 2]) corners.push([x, y, z]);
  const casters = [{ corners: [[UP.x - UP.w / 2, UP.top, -UP.d / 2], [UP.x + UP.w / 2, UP.top, -UP.d / 2], [UP.x - UP.w / 2, F, UP.d / 2], [UP.x + UP.w / 2, F, UP.d / 2], [UP.x - UP.w / 2, F, -UP.d / 2], [UP.x + UP.w / 2, UP.top, UP.d / 2]] }];
  // a name sits 14 px over its bar's top-BACK edge (the top face shows from above), at the bar's start
  const nameAt = (b) => {
    const p = worldScr(RIG, [X0 + 2, b.yc - BAR.h / 2, -BAR.d / 2]);
    return { x: worldScr(RIG, [X0 + 2, b.yc - BAR.h / 2, BAR.d / 2])[0], y: p[1] - 16 };
  };
  const lossAt = [worldScr(RIG, [X0 + BARS[0].len, BARS[0].yc, BAR.d / 2])[0], nameAt(BARS[0]).y];
  const screwFront = (yc) => [-1, 1].map((s) => [UP.x + UP.w / 2 + COL.w / 2, yc + s * (COL.h / 2 - 14), COL.d / 2]);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceRoot, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CamFn, { at: actionCam(shots(t)), children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-leaving": travelling(f, pensionCamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)(Turn, { at: at0, end, from: -5, to: 3, amp: 0.8, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TkFloor, { id: "pnF", rig: RIG, at: { x: 520, z: 0 }, reach: 1300, casters, stage, on: 1 - stage }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe-object": "the bar chart: the steel upright (zero), its collars and the four funds' bars with their names", style: { position: "absolute", inset: 0 }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: foot, rig: RIG, ramp: PL_PLATE, spec: 0.5 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: up, rig: RIG, ramp: PL_BODY, spec: 0.6 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: cap, rig: RIG, ramp: PL_PLATE, spec: 0.6 }),
        Array.from({ length: Math.floor((F - 40 - UP.top) / 9) }, (_, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath((q) => q, RIG, [[UP.x - UP.w / 2 + 4, UP.top + 14 + 9 * k, UP.d / 2 + 0.2], [UP.x + UP.w / 2 - 4, UP.top + 14 + 9 * k, UP.d / 2 + 0.2]], false), stroke: k % 2 ? "#000000" : "#ffffff", strokeOpacity: 0.04, strokeWidth: 1, fill: "none" }, `br${k}`)),
        [-1, 1].map((s) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Screw, { id: `pnFs${s}`, map: (q) => q, rig: RIG, c: [UP.x + 30 + s * 90, F - 18.3, 110], r: 6, plane: "top", slot: 30 * s }, `fs${s}`)),
        /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: collars, rig: RIG, ramp: PL_STEEL, spec: 0.8, dim: 0.1 }),
        BARS.flatMap((b) => screwFront(b.yc).map((c, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Screw, { id: `pnS${b.i}${k}`, map: (q) => q, rig: RIG, c, r: 4.6, plane: "front", slot: 25 + 40 * k }, `cs${b.i}${k}`)))
      ] }),
      BARS.map((b, i) => {
        const faces = barFaces(b, lens[i]);
        return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "absolute", inset: 0 }, children: [
          faces && /* @__PURE__ */ (0,jsx_runtime.jsx)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces, rig: RIG, ramp: i === 0 ? LIT : DIM, spec: i === 0 ? 0.75 : 0.4, dim: i === 0 ? -0.12 : 0.42 }) }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)(BarDetail, { b, len: lens[i], lit: i === 0, sweep: i === 0 ? sweep : 0 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)(Name, { ...nameAt(b), on: nameOn[i], text: L(b.label), lit: i === 0 })
        ] }, b.key);
      })
    ] }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Loss, { x: lossAt[0], y: lossAt[1], on: rOut(f, t.loss.a, t.loss.b), text: L("pensionLoss") })
  ] }) }) }) });
};
