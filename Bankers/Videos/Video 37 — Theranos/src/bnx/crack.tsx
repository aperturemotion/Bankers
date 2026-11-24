// @ts-nocheck
// ★ V36 "Bre-X Gold" — place `crack` (builder M, REV 1: replaced). "A week later, the partner reported insignificant amounts of
//   gold."
//   Timur: "Don't use the gray drill core … do something more original … more eye-catching … but make it simple." ONE object: the
//   partner's FIRE-ASSAY result (crack_cupel). A bone-ash cupel sits on a heavy steel assay plate engraved FREEPORT-McMoRAN
//   (partnerPlate). The camera is close enough to read the cup and the plate as MARCH 26, 1997 (crackDate) lands on "A week later";
//   on "the partner reported" it dives into the cup's dish, where all the gold the sample gave is one pinhead bead — it catches the
//   light as INSIGNIFICANT GOLD (crackLabel) lands on "insignificant". The labels are set on the frame (outside the camera's zoom),
//   above the cup, so the dive never pushes them out.
//   Objects: the cupel (with its bead), the assay plate (+ two labels).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn, label } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { XPlane, worldScr, xfTrans } from "./tk_rig";
import { TkFloor } from "./tk_floor";
import { PL_GROOVE, PL_LIP } from "./counter_mat";
import { CT_PAINT, VG_FIG, VG_FIG_D, VG_NAME } from "./counter_ink";
import { BX_FLOOR_Y, bxRig } from "./bx_core";
import { AssayPlate, CUP, Cupel, PLATE, cupelPoint, plateFront } from "./crack_cupel";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const FY = BX_FLOOR_Y;
const X = 540, Z = 0;
const RIG = bxRig({ cx: 540, cy: FY - 520, yaw: -18, pitch: -34, lens: 3200 });
// the plate stands on the floor (its top at FY − t); the cupel's foot on the plate's top
const PLATE_XF = xfTrans([X, FY - PLATE.t, Z]);
const CUP_XF = xfTrans([X - 30, FY - PLATE.t, Z - 10]);
const KEYS = ["s0", "week", "later", "partner", "reported", "insignificant", "gold"];
export const crackTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`crack: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // MARCH 26, 1997 — fully read on "later" ("A week later")
    date: { a: w.later - 16, b: w.later },
    // the dive into the dish, from "the partner" to just after "insignificant"
    dive: { a: w.partner - 6, dur: Math.max(36, w.insignificant + 8 - (w.partner - 6)) },
    // INSIGNIFICANT GOLD — fully read on "insignificant"
    label: { a: w.insignificant - 14, b: w.insignificant + 2 },
    // the bead catches the light on "insignificant"
    glint: { a: w.insignificant - 6, b: w.insignificant + 22 }
  };
  if (t.date.a < w.s0 - 26) throw new Error("crack: the date must land after the place has risen in");
  if (t.dive.a + t.dive.dur > end - 14) throw new Error("crack: the dive must settle before the hand-over");
  if (t.label.b + 20 > end) throw new Error("crack: INSIGNIFICANT GOLD must read before the hand-over");
  return t;
};
const scr = (q) => {
  const p = worldScr(RIG, q);
  return { x: p[0], y: p[1] };
};
const BEAD = scr(cupelPoint(CUP_XF, "bead"));
const CUPC = scr([X - 30, FY - PLATE.t - CUP.h * 0.45, Z - 10]);
const shots = (t) => [
  // the cup on its plate, the plate's engraving reading
  { a: -9999, z: 1.6, push: 0.03, at: () => ({ x: CUPC.x + 20, y: CUPC.y + 40 }) },
  // the dive into the dish: the bead centred, pinhead-small against the cup
  { a: t.dive.a, dur: t.dive.dur, z: 3.6, push: 0.03, at: () => ({ x: BEAD.x, y: BEAD.y + 10 }) }
];
export const crackCamWindows = (t) => actionCamWindows(shots(t));
export const crackSfx = (t) => [
  // MARCH 26, 1997
  { job: "label", a: t.date.a, b: t.date.b + 6, vol: 0.4 },
  // the bead catches the light
  { job: "ping", a: Math.round(t.glint.a + 0.45 * (t.glint.b - t.glint.a)), vol: 0.55 },
  // INSIGNIFICANT GOLD
  { job: "label", a: t.label.a, b: t.label.b + 6, vol: 0.45 }
];
// a label on the frame (outside the camera's zoom): two static-ink copies crossfaded by the stage (the place cranes out under the
//   white flood into truth — V35 virginia)
const Label = ({ x, y, w = 760, size, ink, on, stage, text, probe }) => {
  if (on <= 3e-3) return null;
  const box = { position: "absolute", left: x - w / 2, top: y, width: w, textAlign: "center", transform: `translateY(${((1 - on) * 24).toFixed(2)}px)` };
  return jsxs("div", { "data-probe-object": `${probe}: one label as two static-ink copies, crossfaded by the stage`, children: [
    jsx("div", { style: { ...box, opacity: on * stage }, children: jsx("span", { style: label(size, ink[0]), children: text }) }),
    jsx("div", { style: { ...box, opacity: on * (1 - stage) }, children: jsx("span", { style: label(size, ink[1]), children: text }) })
  ] });
};
// the engraving on the plate's front face (counter_drums' Engraved recipe, in the plate's own case: McMoRAN keeps its c and o)
const PlatePrint = ({ text }) => {
  const size = 22, width = 420, pose = plateFront(PLATE_XF), u = -width / 2, v = PLATE.t * 0.5 - size / 2 - 1;
  const run = (dy, col, op) => jsx("span", { style: { display: "block", position: "absolute", left: 0, top: dy, width, textAlign: "center", ...label(size, col), textTransform: "none", letterSpacing: 2, opacity: op }, children: text });
  return jsxs(jsx_runtime.Fragment, { children: [
    jsx(XPlane, { rig: RIG, x: pose, u, v, w: 0.4, width, height: size + 4, probe: "FREEPORT-McMoRAN", children: jsxs("div", { style: { position: "relative", width, height: size + 4 }, children: [
      run(1.2, PL_LIP, 0.4),
      run(0, PL_GROOVE, 0.85)
    ] }) }),
    jsx(XPlane, { rig: RIG, x: pose, u, v, w: 0.5, width, height: size + 4, probe: "FREEPORT-McMoRAN", children: run(0, CT_PAINT, 0.9) })
  ] });
};
// the labels' place on the frame (place coordinates, outside the camera): above the cup, under the caption band's headroom
const LAB = { x: 540, y: 380 };
export const BxCrack = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = crackTimes(w, end);
  const s = clamp01(stage);
  const glint = clamp01((f - t.glint.a) / (t.glint.b - t.glint.a));
  const casters = [{ corners: [[-1, -1], [1, -1], [1, 1], [-1, 1]].flatMap(([a, b]) => [[X + a * PLATE.w / 2, FY, Z + b * PLATE.d / 2], [X + a * PLATE.w / 2, FY - PLATE.t, Z + b * PLATE.d / 2]]) }];
  return jsx(PlaceRoot, { children: jsxs("div", { style: { position: "absolute", inset: 0 }, children: [
    jsx(CamFn, { at: actionCam(shots(t)), children: jsx("div", { "data-probe-leaving": travelling(f, crackCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -4, to: 3, amp: 0.6, children: [
      jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(TkFloor, { id: "ckF", rig: RIG, at: { x: X, z: Z + 80 }, reach: 1200, casters, stage: s, on: 1 - s }) }),
      jsxs("div", { "data-probe-object": "the fire-assay cupel on its steel assay plate engraved FREEPORT-McMoRAN; one pinhead bead of gold in its dish", style: { position: "absolute", inset: 0 }, children: [
        jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
          jsx(AssayPlate, { id: "ckP", rig: RIG, xf: PLATE_XF }),
          jsx(Cupel, { id: "ckC", rig: RIG, xf: CUP_XF, glint, sparkle: f })
        ] }),
        jsx(PlatePrint, { text: L("partnerPlate") })
      ] })
    ] }) }) }),
    jsx(Label, { x: LAB.x, y: LAB.y, size: 34, ink: [VG_NAME, "#A9C6EA"], on: rOut(f, t.date.a, t.date.b), stage: s, text: L("crackDate"), probe: "MARCH 26, 1997" }),
    jsx(Label, { x: LAB.x, y: LAB.y + 54, size: 62, ink: [VG_FIG, VG_FIG_D], on: rOut(f, t.label.a, t.label.b), stage: s, text: L("crackLabel"), probe: "INSIGNIFICANT GOLD" })
  ] }) });
};
