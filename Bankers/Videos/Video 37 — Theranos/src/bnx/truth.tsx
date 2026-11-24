// @ts-nocheck
// ★ V36 "Bre-X Gold" — place `truth` (builder M), THE FILM'S ONE WHITE STAGE. "On May fourth, independent auditors confirmed it: the
//   core samples had been salted with outside gold."
//   The hero core (bx_core BxCore, `salted`: rounded, river-worn grains sitting only on its outer skin) lies on the white floor, one
//   end broken. An assay magnifier on its stand (truth_loupe: cast base, post, collar, arm, knuckle, the lens head turned to the
//   camera) glides along it; through the glass the core is seen 2.4× — the gold grains sitting ONLY on the rock's skin, rounded and
//   worn — and the lens comes to rest over the broken end: the inside grey. MAY 4, 1997 (truthDate) lands on "May fourth"; SALTED
//   (truthLabel) on "salted", as the camera leans in on the glass; on "outside gold" a light crosses the glass.
//   White-stage handling (V35 virginia): the objects stay dark (navy blue-steel, graphite) and the stone its own grey; each label is
//   two static-ink copies crossfaded by `stage`; the floor (TkFloor) and the glass's ground follow the stage.
//   Objects: the core, the magnifier on its stand (+ two labels).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mix, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { s3d, travelling } from "./common";
import { L } from "./data";
import { Turn, label } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { unit3, worldScr, xfApply, xfMul, xfRotY, xfRotZ, xfTrans } from "./tk_rig";
import { TkFloor } from "./tk_floor";
import { theme } from "./theme";
import { BX_FLOOR_Y, BxCore, CORE_R, bxRig, coreCorners } from "./bx_core";
import { VG_ACCENT, VG_ACCENT_D, VG_FIG, VG_FIG_D, VG_NAME, VG_NAME_D } from "./counter_ink";
import { LoupeRim, LoupeView, StandArm, StandBack, lensScr, loupeGeo } from "./truth_loupe";
import { SaltGrains } from "./truth_grains";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const FY = BX_FLOOR_Y;
const RIG = bxRig({ cx: 540, cy: FY - 600, yaw: -12, pitch: -24, lens: 3200 });
// the core: one run, sawn at one end and BROKEN at the other (local −y, turned toward the lens and the key light, so the broken
//   stone reads grey, not in shadow), lying on the floor
const LEN = 620, SEED = 5;
const TH = 30;
const CEN = [575, FY - CORE_R, 40];
const CORE_XF = xfMul(xfTrans(CEN), xfMul(xfRotY(TH), xfRotZ(-90)));
const PIECES = [[0, 1, "break", "saw"]];
const A = [Math.cos(TH * Math.PI / 180), 0, -Math.sin(TH * Math.PI / 180)];
const NB = [A[2], 0, -A[0]];
const axisAt = (u) => {
  const s = -LEN / 2 + u * LEN;
  return [CEN[0] + A[0] * s, CEN[1], CEN[2] + A[2] * s];
};
// the camera's eye in world space (the inverse of tk_rig's view), so the glass can be set on the line of sight to the core
const EYE = (() => {
  const v = [0, 0, RIG.persp];
  let a = -RIG.pitch * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  let p = [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
  a = -RIG.yaw * Math.PI / 180;
  c = Math.cos(a);
  s = Math.sin(a);
  p = [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
  return [p[0] + RIG.cx, p[1] + RIG.cy, p[2]];
})();
const V = unit3([EYE[0] - axisAt(0.6)[0], EYE[1] - axisAt(0.6)[1], EYE[2] - axisAt(0.6)[2]]);
const LENS = { R: 100, gap: 178, M: 2.4, tilt: 24 };
const geoAt = (u) => {
  const P = axisAt(u);
  const C = [P[0] + V[0] * LENS.gap, P[1] + V[1] * LENS.gap, P[2] + V[2] * LENS.gap];
  // the base stands behind the core and along it toward the sawn end, so the arm reaches across and forward to the glass
  const B = [P[0] + NB[0] * 150 + A[0] * 250, FY, P[2] + NB[2] * 150 + A[2] * 250];
  const g0 = loupeGeo({ C, V, R: LENS.R, B, H: 100, tilt: LENS.tilt });
  // the post stops short of the knuckle: the arm rises from its collar to the knuckle over the glass
  return loupeGeo({ C, V, R: LENS.R, B, H: FY - g0.K[1] - 46, tilt: LENS.tilt });
};
const KEYS = ["s0", "may", "k4", "independent", "auditors", "confirmed", "core", "samples", "salted", "outside", "gold"];
export const truthTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`truth: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // the glass glides the length of the core from the place's arrival, coming to rest over the broken end on "core samples"
    sweep: { a: w.s0 - 22, b: w.samples - 4 },
    // MAY 4, 1997 — fully read on "fourth"
    date: { a: w.k4 - 16, b: w.k4 },
    // the camera follows the glass from "independent auditors", then leans in on it at the broken end
    ride: { a: w.independent - 12 },
    lean: { a: w.samples - 14, dur: 40 },
    // SALTED — fully read on "salted"
    label: { a: w.salted - 14, b: w.salted + 2 },
    // a light crosses the glass on "outside gold"
    glint: { a: w.outside - 6, b: w.gold + 8 }
  };
  if (t.sweep.b - t.sweep.a < 60) throw new Error("truth: the glass needs ≥ 2 s to glide the core");
  if (t.label.a < t.lean.a + 8) throw new Error("truth: SALTED must land once the camera has leaned in");
  if (t.glint.b > end - 6) throw new Error("truth: the glint must finish before the hand-over");
  return t;
};
const U0 = 0.8, U1 = 0.072;
const uAt = (t, g) => U0 + (U1 - U0) * rInOut(g, t.sweep.a, t.sweep.b);
const scr = (q) => {
  const p = worldScr(RIG, q);
  return { x: p[0], y: p[1] };
};
const MIDP = scr(axisAt(0.5));
const ENDL = lensScr(RIG, geoAt(U1));
// the label block under the glass's resting place (place coordinates)
const LAB = { x: ENDL.x - 10, y: ENDL.y + ENDL.r + 40 };
const shots = (t) => [
  // the core and the magnifier on the white floor
  { a: -9999, z: 1.3, push: 0.02, at: () => ({ x: MIDP.x - 30, y: MIDP.y - 10 }) },
  // following the glass along the core (one move, as long as the glide)
  { a: t.ride.a, dur: t.sweep.b - t.ride.a, z: 1.4, push: 0, at: (g) => {
    const L = lensScr(RIG, geoAt(uAt(t, g)));
    return { x: mix(MIDP.x, L.x, 0.4) - 20, y: mix(MIDP.y, L.y, 0.4) + 10 };
  } },
  // leaning in on the glass over the broken end (the label block under it)
  //   (low enough that the stand's collar stays clear of the last chip as the crane out starts lifting the place)
  { a: t.lean.a, dur: t.lean.dur, z: 1.6, push: 0.02, at: () => ({ x: ENDL.x + 16, y: ENDL.y - 34 }) }
];
export const truthCamWindows = (t) => actionCamWindows(shots(t));
export const truthSfx = (t) => [
  // MAY 4, 1997
  { job: "label", a: t.date.a, b: t.date.b + 6, vol: 0.4 },
  // the magnifier gliding along the core on its stand
  { job: "obj", a: t.sweep.a + 20, b: t.sweep.b, k: "io", vol: 0.45 },
  // it comes to rest over the broken end
  { job: "click", a: t.sweep.b, vol: 0.6 },
  // SALTED
  { job: "label", a: t.label.a, b: t.label.b + 6, vol: 0.5 },
  // the light crossing the glass over the grains
  { job: "ping", a: Math.round((t.glint.a + t.glint.b) / 2), vol: 0.6 }
];
// a label as two static-ink copies, crossfaded by the stage (V35 virginia StageText)
const StageLabel = ({ x, y, w = 700, size, ink, on, stage, text, probe }) => {
  if (on <= 3e-3) return null;
  const box = { position: "absolute", left: x - w / 2, top: y, width: w, textAlign: "center", transform: s3d(0, (1 - on) * 24) };
  return jsxs("div", { "data-probe-object": `${probe}: one label as two static-ink copies, crossfaded by the stage`, children: [
    jsx("div", { style: { ...box, opacity: on * stage }, children: jsx("span", { style: label(size, ink[0]), children: text }) }),
    jsx("div", { style: { ...box, opacity: on * (1 - stage) }, children: jsx("span", { style: label(size, ink[1]), children: text }) })
  ] });
};
// a soft contact shadow along the core's underside on the floor (navy ink, as V35's white-stage shades)
const CoreShade = ({ stage }) => {
  const pts = [];
  for (let k = 0; k <= 20; k++) {
    const s = -LEN / 2 + LEN * k / 20;
    pts.push(worldScr(RIG, [CEN[0] + A[0] * s - NB[0] * 10, FY - 0.5, CEN[2] + A[2] * s - NB[2] * 10]));
  }
  for (let k = 20; k >= 0; k--) {
    const s = -LEN / 2 + LEN * k / 20;
    pts.push(worldScr(RIG, [CEN[0] + A[0] * s + NB[0] * 26, FY - 0.5, CEN[2] + A[2] * s + NB[2] * 26]));
  }
  return jsx("path", { "data-probe-skip": true, d: `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`, fill: theme.textOnLight, opacity: 0.1 + 0.18 * stage, style: { filter: "blur(7px)" } });
};
// the magnifier base's soft shade on the white floor
const BaseShade = ({ g, stage }) => {
  const pts = Array.from({ length: 36 }, (_, k) => {
    const a = k / 36 * 2 * Math.PI;
    return worldScr(RIG, [g.B[0] + 8 + 118 * Math.cos(a), FY - 0.5, g.B[2] - 6 + 118 * Math.sin(a)]);
  });
  return jsx("path", { "data-probe-skip": true, d: `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`, fill: theme.textOnLight, opacity: 0.06 + 0.14 * stage, style: { filter: "blur(9px)" } });
};
export const BxTruth = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = truthTimes(w, end);
  const s = clamp01(stage);
  const u = uAt(t, f);
  const g = geoAt(u);
  const Ls = lensScr(RIG, g);
  const glint = clamp01((f - t.glint.a) / (t.glint.b - t.glint.a));
  const cull = [Ls.x - Ls.r / LENS.M - 30, Ls.y - Ls.r / LENS.M - 30, Ls.x + Ls.r / LENS.M + 30, Ls.y + Ls.r / LENS.M + 30];
  const standCorners = [];
  for (const dx of [-110, 110]) for (const dz of [-110, 110]) for (const y of [FY, FY - g.H]) standCorners.push([g.B[0] + dx, y, g.B[2] + dz]);
  const casters = [{ corners: coreCorners(CORE_XF, LEN), k: 0.8 }, { corners: standCorners, k: 0.5 }];
  const gx = t.glint && f > t.glint.a && f < t.glint.b ? Ls.x + (-1.4 + 2.8 * glint) * Ls.r * 0.6 : -1;
  const core = (id, cl, gq) => jsxs("g", { children: [
    jsx(BxCore, { id, rig: RIG, xf: CORE_XF, len: LEN, seed: SEED, pieces: PIECES, salted: 1, sparkle: f, cull: cl, probe: null }),
    jsx(SaltGrains, { rig: RIG, xf: CORE_XF, len: LEN, r: CORE_R, seed: SEED, cull: cl, glint: gq, u0: 0.035 })
  ] });
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: actionCam(shots(t)), children: jsx("div", { "data-probe-leaving": travelling(f, truthCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -5, to: 3, amp: 0.7, children: [
    // the floor fades as the stage turns white (the contract: TkFloor on 1 − stage); the white stage keeps its own soft shades
    jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(TkFloor, { id: "trF", rig: RIG, at: { x: MIDP.x, z: 80 }, reach: 1400, casters, stage: s, on: 1 - s }) }),
    jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(BaseShade, { g, stage: s }) }),
    jsx("div", { "data-probe-object": "the magnifier's cast base and post, standing behind the core", style: { position: "absolute", inset: 0 }, children: jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(StandBack, { id: "trS", rig: RIG, g }) }) }),
    jsx("div", { "data-probe-object": "the hero drill core lying on the floor, gold grains on its skin, one end broken", style: { position: "absolute", inset: 0 }, children: jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsx(CoreShade, { stage: s }),
      core("trC", void 0, -1)
    ] }) }),
    jsx("div", { "data-probe-object": "the magnifier's arm and lens head; through the glass the core magnified: grains only on its skin, the broken end grey", style: { position: "absolute", inset: 0 }, children: jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsx(StandArm, { id: "trA", rig: RIG, g }),
      jsx(LoupeView, { id: "trV", rig: RIG, g, M: LENS.M, stage: s, glint, children: jsx("g", { "data-probe-skip": true, children: core("trM", cull, gx < 0 ? -1 : Ls.x + (gx - Ls.x) / LENS.M) }) }),
      jsx(LoupeRim, { id: "trR", rig: RIG, g })
    ] }) }),
    jsx(StageLabel, { x: LAB.x, y: LAB.y, size: 32, ink: [VG_NAME, VG_NAME_D], on: rOut(f, t.date.a, t.date.b), stage: s, text: L("truthDate"), probe: "MAY 4, 1997" }),
    jsx(StageLabel, { x: LAB.x, y: LAB.y + 50, size: 54, ink: [VG_FIG, VG_FIG_D], on: rOut(f, t.label.a, t.label.b), stage: s, text: L("truthLabel"), probe: "SALTED" })
  ] }) }) }) });
};
