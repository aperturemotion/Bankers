// @ts-nocheck
// ★ V36 "Bre-X Gold" — place `crack` (builder M). "A week later, the partner reported insignificant amounts of gold."
//   The partner's own core tray (bx_core BxTray, three rows: a grey core behind, the hero run, an empty row in front), its near end
//   carrying an engraved steel plate FREEPORT-McMoRAN (partnerPlate). MARCH 26, 1997 (crackDate) lands on "A week later". On "the
//   partner" a saw line runs the length of the core; then the top half lifts, turns over like a page and lies face-up in the front
//   row (crack_core), so both sawn faces show: grey stone through and through, a few faint specks at most. INSIGNIFICANT GOLD
//   (crackLabel) lands on "insignificant" as the camera leans in over the two faces.
//   Objects: the tray, the core (two halves), the plate (+ two labels).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mix, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn, label } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { XPlane, worldScr, xfApply, xfMul, xfRotY, xfTrans } from "./tk_rig";
import { TkFloor } from "./tk_floor";
import { PL_GROOVE, PL_LIP, PL_STEEL } from "./counter_mat";
import { CT_PAINT, VG_FIG, VG_FIG_D, VG_NAME } from "./counter_ink";
import { rampAt } from "./solid_engine";
import { BX_FLOOR_Y, BxTray, CORE_R, TRAY, bxRig, trayCoreY, trayCorners, trayRowZ, trayWidth } from "./bx_core";
import { HalfCore, Kerf, splitXf, turnOver } from "./crack_core";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const FY = BX_FLOOR_Y;
const ROWS = 3, HERO = 1, LEN = 800;
const TX = 540, TZ = 0;
const TRAY_XF = xfTrans([TX, FY, TZ]);
const RIG = bxRig({ cx: 540, cy: FY - 640, yaw: -46, pitch: -30, lens: 3200 });
const CXF = splitXf(TX, FY + trayCoreY, TZ + trayRowZ(HERO, ROWS));
const SEED = 41;
const LIFT = 92;
const W = trayWidth(ROWS);
// the plate on the near end block's outer face: a pose whose x/y plane is that face (x across the tray, y down, z out of it). A tray
//   ID plate riveted over the end (it stands 16 units proud of the block's top, as a tag holder does), FREEPORT-McMoRAN engraved
const PLATE_XF = xfMul(TRAY_XF, xfMul(xfTrans([LEN / 2 + TRAY.end, 0, 0]), xfRotY(90)));
const PLATE = { w: 230, v0: -TRAY.endH - 16, v1: -22, t: 2.2 };
const KEYS = ["s0", "week", "later", "partner", "reported", "insignificant", "gold"];
export const crackTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`crack: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // MARCH 26, 1997 — fully read on "later" ("A week later")
    date: { a: w.later - 16, b: w.later },
    // the saw line runs the core's length on "the partner"
    kerf: { a: w.partner - 14, b: w.partner + 2 },
    // the top half turns over into the front row: done by "insignificant"
    flip: { a: w.partner + 4, b: Math.min(w.insignificant - 2, w.partner + 28) },
    // INSIGNIFICANT GOLD — fully read on "insignificant"
    label: { a: w.insignificant - 14, b: w.insignificant + 2 },
    // the camera leans in over the two faces as the half lands
    lean: { a: w.insignificant - 8, dur: 40 }
  };
  if (t.flip.b - t.flip.a < 18) throw new Error(`crack: the turn-over needs ≥ 18 f (${t.flip.b - t.flip.a})`);
  if (t.kerf.a < w.s0 + 4) throw new Error("crack: the saw line must run after the place has risen in");
  if (t.label.b + 20 > end) throw new Error("crack: INSIGNIFICANT GOLD must read before the hand-over");
  return t;
};
const scr = (q) => {
  const p = worldScr(RIG, q);
  return { x: p[0], y: p[1] };
};
const along = (u, z = TZ + trayRowZ(HERO, ROWS) + 43) => [TX - LEN / 2 + u * LEN, FY + trayCoreY - CORE_R, z];
const P_PLATE = scr(xfApply(PLATE_XF, [0, (PLATE.v0 + PLATE.v1) / 2, 0]));
// the whole tray's screen box (its 8 corners) — the pulled-back framing centres it
const BOX = (() => {
  const p = trayCorners(TRAY_XF, ROWS, LEN).map((q) => worldScr(RIG, q));
  const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
})();
const shots = (t) => [
  // the partner's tray, its plate on the near end
  { a: -9999, z: 1.36, push: 0.025, at: () => ({ x: BOX.x + 10, y: BOX.y + 62 }) },
  // leaning in over the two faces as the half lands
  { a: t.lean.a, dur: t.lean.dur, z: 1.44, push: 0.02, at: () => ({ x: BOX.x + 30, y: BOX.y + 70 }) }
];
export const crackCamWindows = (t) => actionCamWindows(shots(t));
export const crackSfx = (t) => [
  // MARCH 26, 1997
  { job: "label", a: t.date.a, b: t.date.b + 6, vol: 0.4 },
  // the saw line running the core (a short mechanism: the cut)
  { job: "mech", a: t.kerf.a, b: t.kerf.b, vol: 0.45 },
  // the half lifts and turns over …
  { job: "obj", a: t.flip.a, b: t.flip.b, k: "io", vol: 0.55 },
  // … and lands face-up in the steel tray
  { job: "thud", a: t.flip.b, vol: 0.55 },
  // INSIGNIFICANT GOLD
  { job: "label", a: t.label.a, b: t.label.b + 6, vol: 0.45 }
];
// the occluders in front of a half drawn after the tray: the tray walls fully in front of it and the near end block
const hullOf = (pts) => {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  for (const q of [...p].reverse()) {
    while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop();
    hi.push(q);
  }
  return [...lo.slice(0, -1), ...hi.slice(0, -1)];
};
const boxHull = (c, s) => {
  const out = [];
  for (const i of [-1, 1]) for (const j of [-1, 1]) for (const k of [-1, 1]) out.push(worldScr(RIG, xfApply(TRAY_XF, [c[0] + i * s[0] / 2, c[1] + j * s[1] / 2, c[2] + k * s[2] / 2])));
  return `M${hullOf(out).map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`;
};
const WALLS = Array.from({ length: ROWS + 1 }, (_, i) => {
  const z = -ROWS * TRAY.pitch / 2 + i * TRAY.pitch;
  const t = i === 0 || i === ROWS ? TRAY.wall : TRAY.div;
  const zz = i === 0 ? z - TRAY.wall / 2 : i === ROWS ? z + TRAY.wall / 2 : z;
  return { z: zz, t, d: boxHull([0, -TRAY.base - TRAY.h / 2, zz], [LEN, TRAY.h, t]) };
});
const NEAR_END = boxHull([LEN / 2 + TRAY.end / 2, -TRAY.endH / 2, 0], [TRAY.end, TRAY.endH, W]);
const Occluded = ({ id, zc, children }) => {
  const occ = WALLS.filter((wl) => wl.z - wl.t / 2 > zc + CORE_R * 0.6).map((wl) => wl.d);
  return jsxs("g", { children: [
    jsx("defs", { "data-probe-skip": true, children: jsxs("mask", { id: `${id}M`, maskUnits: "userSpaceOnUse", x: -3000, y: -3000, width: 7000, height: 8000, children: [
      jsx("rect", { x: -3000, y: -3000, width: 7000, height: 8000, fill: "#ffffff" }),
      jsx("path", { d: [...occ, NEAR_END].join(""), fill: "#000000" })
    ] }) }),
    jsx("g", { mask: `url(#${id}M)`, children })
  ] });
};
// the engraved plate: a steel plate with two rivets on the end block's face, FREEPORT-McMoRAN engraved and painted
const Plate = ({ id }) => {
  const map = (q) => xfApply(PLATE_XF, q);
  const P = (u, v, w = PLATE.t) => worldScr(RIG, map([u, v, w]));
  const c = [P(-PLATE.w / 2, PLATE.v0), P(PLATE.w / 2, PLATE.v0), P(PLATE.w / 2, PLATE.v1), P(-PLATE.w / 2, PLATE.v1)];
  const e = [P(-PLATE.w / 2, PLATE.v1, 0), P(PLATE.w / 2, PLATE.v1, 0)];
  const d = `M${c.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`;
  const riv = [-1, 1].flatMap((s) => [PLATE.v0 + 7, PLATE.v1 - 7].map((v) => P(s * (PLATE.w / 2 - 7), v, PLATE.t + 0.3)));
  return jsxs("g", { children: [
    jsx("defs", { "data-probe-skip": true, children: jsxs("linearGradient", { id: `${id}Pl`, gradientUnits: "userSpaceOnUse", x1: f2(c[0][0]), y1: f2(c[0][1]), x2: f2(c[2][0]), y2: f2(c[2][1]), children: [
      jsx("stop", { offset: "0", stopColor: rampAt(PL_STEEL, 0.74) }),
      jsx("stop", { offset: "0.45", stopColor: rampAt(PL_STEEL, 0.56) }),
      jsx("stop", { offset: "1", stopColor: rampAt(PL_STEEL, 0.4) })
    ] }) }),
    jsx("path", { d: `M${f2(c[3][0])},${f2(c[3][1])}L${f2(c[2][0])},${f2(c[2][1])}L${f2(e[1][0])},${f2(e[1][1])}L${f2(e[0][0])},${f2(e[0][1])}Z`, fill: rampAt(PL_STEEL, 0.2) }),
    jsx("path", { d, fill: `url(#${id}Pl)`, stroke: rampAt(PL_STEEL, 0.85), strokeWidth: 0.6 }),
    riv.map((p, k) => jsxs("g", { children: [
      jsx("circle", { cx: f2(p[0]), cy: f2(p[1]), r: 2.6, fill: "#000000", opacity: 0.4 }),
      jsx("circle", { cx: f2(p[0] - 0.3), cy: f2(p[1] - 0.4), r: 2, fill: rampAt(PL_STEEL, 0.9) })
    ] }, k))
  ] });
};
// the engraving: counter_drums' Engraved recipe (groove, lit lip, paint fill) set on the plate's own plane, in the plate's own case
//   (FREEPORT-McMoRAN keeps its lower-case c and o — the label style's upper-casing is turned off for this print only)
const PlatePrint = ({ text }) => {
  const size = 24, width = PLATE.w - 24, v = (PLATE.v0 + PLATE.v1) / 2 - size / 2 - 1, u = -width / 2;
  const run = (dy, col, op) => jsx("span", { style: { display: "block", position: "absolute", left: 0, top: dy, width, textAlign: "center", ...label(size, col), textTransform: "none", letterSpacing: 1, opacity: op }, children: text });
  return jsxs(jsx_runtime.Fragment, { children: [
    jsx(XPlane, { rig: RIG, x: PLATE_XF, u, v, w: PLATE.t + 0.4, width, height: size + 4, probe: "FREEPORT-McMoRAN", children: jsxs("div", { style: { position: "relative", width, height: size + 4 }, children: [
      run(1.2, PL_LIP, 0.4),
      run(0, PL_GROOVE, 0.85)
    ] }) }),
    jsx(XPlane, { rig: RIG, x: PLATE_XF, u, v, w: PLATE.t + 0.5, width, height: size + 4, probe: "FREEPORT-McMoRAN", children: run(0, CT_PAINT, 1) })
  ] });
};
const ROW0 = { seed: 53, pieces: [[0, 0.28, "saw", "break"], [0.282, 0.61, "break", "break"], [0.613, 1, "break", "saw"]] };
// a label as two static-ink copies crossfaded by the stage (the place cranes out under the white flood into truth: V35 virginia)
const Label = ({ x, y, w = 700, size, ink, on, stage, text, probe }) => {
  if (on <= 3e-3) return null;
  const box = { position: "absolute", left: x - w / 2, top: y, width: w, textAlign: "center", transform: `translateY(${((1 - on) * 24).toFixed(2)}px)` };
  return jsxs("div", { "data-probe-object": `${probe}: one label as two static-ink copies, crossfaded by the stage`, children: [
    jsx("div", { style: { ...box, opacity: on * stage }, children: jsx("span", { style: label(size, ink[0]), children: text }) }),
    jsx("div", { style: { ...box, opacity: on * (1 - stage) }, children: jsx("span", { style: label(size, ink[1]), children: text }) })
  ] });
};
// the labels under the tray (place coordinates): below its lowest corner, a little left of the frame's centre
const LAB = (() => {
  const a = scr([TX + LEN / 2 + TRAY.end, FY, TZ + W / 2]);
  return { x: BOX.x - 50, y: a.y + 30 };
})();
export const BxCrack = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = crackTimes(w, end);
  const e = rInOut(f, t.flip.a, t.flip.b);
  // the landing: a 1.5-unit settle after contact
  const settle = f > t.flip.b ? -1.5 * Math.sin(Math.PI * clamp01((f - t.flip.b) / 6)) : 0;
  const upXf = xfMul(CXF, xfMul(turnOver(e, LIFT, TRAY.pitch), xfTrans([0, 0, e >= 1 ? settle : 0])));
  const zcUp = TZ + trayRowZ(HERO, ROWS) + TRAY.pitch * e;
  // the empty front row's contact shadow arrives with the half
  const shadowLift = 2400 * (1 - rInOut(f, t.flip.b - 10, t.flip.b)) + LIFT * Math.sin(Math.PI * e);
  const cores = [{ ...ROW0 }, void 0, { lift: shadowLift }];
  const specks = rInOut(f, t.flip.b - 4, t.flip.b + 16);
  const casters = [{ corners: trayCorners(TRAY_XF, ROWS, LEN) }];
  const s = clamp01(stage);
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: actionCam(shots(t)), children: jsx("div", { "data-probe-leaving": travelling(f, crackCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -5, to: 3, amp: 0.7, children: [
    jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(TkFloor, { id: "ckF", rig: RIG, at: { x: TX, z: TZ + 100 }, reach: 1400, casters, stage: s, on: 1 - s }) }),
    jsxs("div", { "data-probe-object": "the partner's core tray with its engraved FREEPORT-McMoRAN plate; the core sawn lengthwise and opened face-up, grey through and through", style: { position: "absolute", inset: 0 }, children: [
      jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
        jsx(BxTray, { id: "ckT", rig: RIG, xf: TRAY_XF, rows: ROWS, len: LEN, cores, hero: 2, heroEl: null, probe: null }),
        jsx(Occluded, { id: "ckLo", zc: TZ + trayRowZ(HERO, ROWS), children: jsx(HalfCore, { id: "ckLo", rig: RIG, xf: CXF, len: LEN, seed: SEED, side: -1, specks }) }),
        jsx(Occluded, { id: "ckUp", zc: zcUp, children: jsxs("g", { children: [
          jsx(HalfCore, { id: "ckUp", rig: RIG, xf: upXf, len: LEN, seed: SEED, side: 1, specks }),
          jsx(Kerf, { rig: RIG, xf: CXF, len: LEN, p: rInOut(f, t.kerf.a, t.kerf.b), op: 1 - rInOut(f, t.flip.a, t.flip.a + 6) })
        ] }) }),
        jsx(Plate, { id: "ckP" })
      ] }),
      jsx(PlatePrint, { text: L("partnerPlate") })
    ] }),
    jsx(Label, { x: LAB.x, y: LAB.y, size: 34, ink: [VG_NAME, "#A9C6EA"], on: rOut(f, t.date.a, t.date.b), stage: s, text: L("crackDate"), probe: "MARCH 26, 1997" }),
    jsx(Label, { x: LAB.x, y: LAB.y + 58, size: 58, ink: [VG_FIG, VG_FIG_D], on: rOut(f, t.label.a, t.label.b), stage: s, text: L("crackLabel"), probe: "INSIGNIFICANT GOLD" })
  ] }) }) }) });
};
