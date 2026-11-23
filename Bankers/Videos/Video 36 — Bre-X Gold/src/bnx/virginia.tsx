// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mix, rInOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { s3d, travelling } from "./common";
import { US_PAYOUT, VA_PAYOUT } from "./data_lt";
import { L, centsOf } from "./data";
import { Turn, figure, label } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { worldScr } from "./tk_rig";
import { VG_ACCENT, VG_ACCENT_D, VG_FIG, VG_FIG_D, VG_NAME, VG_NAME_D } from "./counter_ink";
import { MAP_B, PLATE, VA_INDEX, VM_RIG, VM_STATES, mapW } from "./virginia_map";
import { VmShade, VmTray, trayCorners, trayFront } from "./virginia_tray";
import { VA_COL, VmPlates, vaLevelAt, vaTopAt } from "./virginia_plates";

const N = VM_STATES.length;
const MID = [470, 300];
const DIST = (() => {
  const d = VM_STATES.map((s) => Math.hypot(s.c[0] - MID[0], (s.c[1] - MID[1]) * 1.2));
  const m = Math.max(...d);
  return d.map((v) => v / m);
})();
const ALONG = VM_STATES.map((s) => (s.c[0] - MAP_B.x0) / (MAP_B.x1 - MAP_B.x0));
const pulse = (tau, tp = 7) => tau <= 0 ? 0 : (tau / tp) ** 2 * Math.exp(2 * (1 - tau / tp));
const RIPPLE_A = 9;
export const virginiaTimes = (w, end) => {
  for (const k of ["varies", "state", "virginia", "k80", "cents", "most", "country"]) if (!Number.isFinite(w[k])) throw new Error(`virginia: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    asm: { a: w.varies - 26, span: 16, dur: 14 },
    // the plates rise out of the tray (during the crane in)
    ripple: { a: w.varies, span: Math.max(16, w.virginia - 5 - w.varies) },
    // the wave's front crosses the country, west → east
    us: { a: w.state - 11, b: w.state - 1 },
    // U.S. 67¢, ON "state"
    va: { a: w.virginia - 10, b: w.virginia },
    // VIRGINIA, ON "Virginia"
    rise: { a: w.virginia - 4, b: w.virginia + 22 },
    // Virginia rises out of the map
    dim: { a: w.virginia - 2, b: w.virginia + 24 },
    // the rest of the country steps back
    ring: { a: w.virginia + 14, b: w.virginia + 26 },
    // the U.S. ring engraved on the column
    fill: { a: w.virginia + 14, b: w.k80 },
    // the fill climbs to VA_PAYOUT, set ON "80"
    k80: { a: w.k80 - 10, b: w.k80 },
    // 80¢ ON "80"
    most: { a: w.most - 10, b: w.most },
    // MOST IN U.S. ON "most"
    glint: { a: w.most - 6, b: w.most + 24 },
    dollar: { a: w.cents + 8, b: w.cents + 22 }
    // "of every dollar": the crown's arris (its full height = a dollar) lights
  };
  if (t.fill.b - t.fill.a < 20) throw new Error("virginia: Virginia's fill needs \u2265 20 f");
  if (t.glint.b > end - 14) throw new Error("virginia: the glint must finish before the crane out");
  return t;
};
const asmAt = (t, i, g) => rInOut(g, t.asm.a + t.asm.span * DIST[i], t.asm.a + t.asm.span * DIST[i] + t.asm.dur);
const waveT = (t, i) => t.ripple.a + t.ripple.span * ALONG[i];
const liftAt = (t, i, g) => i === VA_INDEX ? 0 : RIPPLE_A * pulse(g - waveT(t, i));
const riseAt = (t, g) => rInOut(g, t.rise.a, t.rise.b);
const fillAt = (t, g) => VA_PAYOUT * rInOut(g, t.fill.a, t.fill.b);
const vaH = (t, g) => PLATE * asmAt(t, VA_INDEX, g) + (VA_COL - PLATE) * riseAt(t, g);
const LAB = { name: 28, fig: 80, gap: 8, acc: 26 };
const VA_X = vaTopAt(VA_COL).x;
const US_X = VA_X - 262;
const ROW0 = Math.max(trayFront(US_X)[1], trayFront(VA_X)[1]) + 34;
const rowY = (r) => ROW0 + [0, LAB.name + LAB.gap, LAB.name + LAB.gap + LAB.fig + 12][r];
const LAB_W = 300;
const SWATCH = { w: 36, gap: 16 };
const TRAY_PTS = trayCorners().map((q) => worldScr(VM_RIG, q));
const SET = {
  t: Math.min(...TRAY_PTS.map((p) => p[1])),
  b: rowY(2) + LAB.acc + 12,
  l: Math.min(...TRAY_PTS.map((p) => p[0])),
  r: Math.max(...TRAY_PTS.map((p) => p[0]))
};
const VBOX = { t: Math.min(vaTopAt(VA_COL).y - 18, SET.t), b: SET.b, l: US_X - LAB_W / 2 - SWATCH.w, r: Math.max(VA_X + LAB_W / 2, SET.r) };
const PIV = 993, TOPMIN = 470, BOTMAX = 1532, SIDE = 64;
const fitBox = (box, z, p) => {
  const lo = box.b - (BOTMAX - PIV) / z, hi = box.t + (PIV - TOPMIN) / z;
  const xl = box.r - (1080 - SIDE - 540) / z, xr = box.l + (540 - SIDE) / z;
  if (lo > hi + 0.5 || xl > xr + 0.5) throw new Error(`virginia: the box (${Math.round(box.r - box.l)} \xD7 ${Math.round(box.b - box.t)} px) does not fit the frame at z ${z}`);
  return { x: Math.max(xl, Math.min(xr, p.x)), y: Math.max(lo, Math.min(hi, p.y)) };
};
const Z_ALL = 0.91, Z_VA = 1.28;
if (Z_ALL > Math.min((1080 - 2 * SIDE) / (SET.r - SET.l), (BOTMAX - TOPMIN) / (SET.b - SET.t))) throw new Error("virginia: the whole set does not fit at Z_ALL");
const SETC = { x: (SET.l + SET.r) / 2, y: (SET.t + SET.b) / 2 };
const VA_DX = -6;
const VA_HALF = VA_X - (US_L0() - 14);
function US_L0() {
  return VA_X - 262 - (84 + 16 + 36) / 2;
}
const VCOL = { t: vaTopAt(VA_COL).y - 18, b: VBOX.b, l: VA_X - VA_HALF, r: VA_X + VA_HALF };
if (Z_VA * 1.04 > Math.min((BOTMAX - TOPMIN - 20) / (VCOL.b - VCOL.t), (1080 - 2 * SIDE - 10) / (VCOL.r - VCOL.l))) throw new Error("virginia: Virginia's group does not fit at Z_VA");
const VAC = { x: VA_X + VA_DX, y: VCOL.b - (BOTMAX - PIV) / 1.33 };
const waveAt = (t, g) => {
  const k = clamp01((g - t.ripple.a) / t.ripple.span);
  const u = mix(MAP_B.x0, MAP_B.x1, k);
  const p = worldScr(VM_RIG, mapW(u, 300, PLATE));
  return { x: p[0], y: p[1] };
};
const shots = (t) => [
  // the whole map as it rises out of the crane
  { a: -9999, z: 0.91, push: 0.015, at: () => fitBox(SET, 0.91, SETC) },
  // RIDE the ripple a little, west → east
  {
    a: t.ripple.a - 6,
    dur: 32,
    z: 0.93,
    push: 0,
    ride: { a: t.ripple.a, b: t.ripple.a + t.ripple.span },
    at: (g) => ({ x: mix(SETC.x, waveAt(t, g).x, 0.12), y: SETC.y })
  },
  // in toward Virginia, RIDING its crown as it rises
  {
    a: t.rise.a - 2,
    dur: 34,
    z: 1.28,
    push: 0,
    ride: { a: t.rise.a, b: t.rise.b },
    at: (g) => fitBox(VCOL, 1.28, { x: VAC.x, y: mix(VAC.y, vaTopAt(vaH(t, g)).y, 0.22) })
  },
  // RIDE the fill's head up the column (Virginia held at the centre)
  {
    a: t.fill.a,
    dur: t.fill.b - t.fill.a,
    z: 1.3,
    push: 0,
    ride: { a: t.fill.a, b: t.fill.b },
    at: (g) => fitBox(VCOL, 1.3, { x: VAC.x, y: mix(VAC.y, vaLevelAt(fillAt(t, g) * VA_COL).y, 0.25) })
  },
  // lean in for MOST IN U.S. (still centred on the column)
  { a: t.most.a - 8, dur: 32, z: 1.33, push: 0.015, at: () => fitBox(VCOL, 1.33, { x: VAC.x, y: VAC.y }) }
];
export const virginiaCamWindows = (t) => actionCamWindows(shots(t));
export const virginiaSfx = (t) => [
  { job: "obj", a: t.ripple.a - 2, b: t.ripple.a + t.ripple.span + 10, vol: 0.5 },
  // the ripple sweeping the country
  { job: "label", a: t.us.a, b: t.us.b + 6, vol: 0.45 },
  // U.S. 67¢
  { job: "label", a: t.va.a, b: t.va.b + 6, vol: 0.4 },
  // VIRGINIA
  { job: "land", a: t.rise.a, b: t.rise.b, vol: 0.6 },
  // Virginia rising out of the map …
  { job: "click", a: t.rise.b, b: t.rise.b + 2, vol: 0.8 },
  // … and locking at its full height
  { job: "process", a: t.fill.a, b: t.fill.b, vol: 0.55 },
  // the fill climbing
  { job: "ping", a: t.k80.b - 2, b: t.k80.b, vol: 0.85 },
  // 80¢ lands
  { job: "label", a: t.most.a, b: t.most.b + 6, vol: 0.45 }
  // MOST IN U.S.
];
const StageText = ({ x, y, w, on, stage, kind, text, probe, align = "center" }) => {
  if (on <= 3e-3) return null;
  const st = (c) => kind === "fig" ? figure(LAB.fig, c) : label(kind === "name" ? LAB.name : LAB.acc, c);
  const [dark, light] = kind === "fig" ? [VG_FIG, VG_FIG_D] : kind === "name" ? [VG_NAME, VG_NAME_D] : [VG_ACCENT, VG_ACCENT_D];
  const box = { position: "absolute", left: align === "center" ? x - w / 2 : x, top: y, width: w, textAlign: align, transform: s3d(0, (1 - on) * 26) };
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe-object": `${probe}: one label as two static-ink copies, crossfaded by the stage`, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { ...box, opacity: on * stage }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { style: st(dark), children: text }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { ...box, opacity: on * (1 - stage) }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { style: st(light), children: text }) })
  ] });
};
const Swatch = ({ x, y, on, stage }) => on <= 3e-3 ? null : /* @__PURE__ */ (0,jsx_runtime.jsxs)(
  "svg",
  {
    "data-probe-object": "the U.S. legend's dashed swatch (the ring's line)",
    width: 1,
    height: 1,
    style: { position: "absolute", left: 0, top: 0, overflow: "visible", transform: s3d(0, (1 - on) * 26) },
    children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: `M${x.toFixed(1)},${y.toFixed(1)}h${SWATCH.w}`, stroke: VG_ACCENT, strokeWidth: 3, strokeDasharray: "7 5", opacity: on * stage }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: `M${x.toFixed(1)},${y.toFixed(1)}h${SWATCH.w}`, stroke: VG_ACCENT_D, strokeWidth: 3, strokeDasharray: "7 5", opacity: on * (1 - stage) })
    ]
  }
);
const US_NAME_W = 84;
const US_L = US_X - (US_NAME_W + SWATCH.gap + SWATCH.w) / 2;
export const LtVirginia = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = virginiaTimes(w, end);
  const on = (q) => rInOut(f, q.a, q.b);
  const h = Array.from({ length: N }, (_, i) => PLATE * asmAt(t, i, f) + liftAt(t, i, f));
  const lit = Array.from({ length: N }, (_, i) => i === VA_INDEX ? 0 : 0.11 * pulse(f - waveT(t, i)));
  const va = {
    h: riseAt(t, f) > 5e-4 ? vaH(t, f) : h[VA_INDEX],
    fill: fillAt(t, f),
    ring: on(t.ring),
    ringAt: US_PAYOUT,
    glint: f > t.glint.a && f < t.glint.b ? (f - t.glint.a) / (t.glint.b - t.glint.a) : 0,
    crown: 0.35 * on(t.dollar) + 0.35 * on({ a: t.most.a - 2, b: t.most.b + 8 })
  };
  const usOn = on(t.us);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceRoot, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CamFn, { at: actionCam(shots(t)), children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-leaving": travelling(f, virginiaCamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)(Turn, { at, end, from: -6, to: 4, amp: 0.9, children: [
    stage > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { opacity: stage }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(VmShade, {}) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(VmTray, { id: "vgT" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(VmPlates, { id: "vgP", h, lit, dim: on(t.dim), stage, va }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Swatch, { x: US_L, y: rowY(0) + LAB.name * 0.52, on: usOn, stage }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(StageText, { x: US_L + SWATCH.w + SWATCH.gap, y: rowY(0), w: LAB_W, on: usOn, stage, kind: "name", text: L("us"), probe: "U.S.", align: "left" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(StageText, { x: US_X, y: rowY(1), w: LAB_W, on: usOn, stage, kind: "fig", text: centsOf(US_PAYOUT), probe: "67\xA2" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(StageText, { x: VA_X, y: rowY(0), w: LAB_W, on: on(t.va), stage, kind: "name", text: L("virginia"), probe: "VIRGINIA" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(StageText, { x: VA_X, y: rowY(1), w: LAB_W, on: on(t.k80), stage, kind: "fig", text: centsOf(VA_PAYOUT), probe: "80\xA2" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(StageText, { x: VA_X, y: rowY(2), w: LAB_W, on: on(t.most), stage, kind: "accent", text: L("mostInUs"), probe: "MOST IN U.S." })
  ] }) }) }) });
};
