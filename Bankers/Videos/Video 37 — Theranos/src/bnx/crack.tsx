// @ts-nocheck
// ★ V37 "Theranos" — place `crack` (builder C). "But most tests ran on other companies' machines, not the Edison."
//   LightBreak 1 flashes on "But" (the composition's). The film's ONE pie (crack_disc): a thick machined blue-steel disc lies on
//   the floor — the test menu, its 200 engraved ticks one per test — turning to rest as the place arrives; 200+ TESTS OFFERED
//   (crackTotal) lands under it on "tests". Two score lines draw in from the rim around a thin sliver of 12 ticks (6 %, SEC
//   complaint ¶5: crack_data); on "other companies' machines" the big remainder slides out along its own bisector, in the disc's
//   plane, its machined cut faces showing (V5's pie rule), as the camera eases back to hold both, and OTHER MACHINES (crackOthers)
//   lands over it on "other companies'". On "not the Edison" the camera leans in on the sliver, centred; its 12 ticks light one by
//   one, its edges take the light and the remainder dims, as EDISON: ~12 TESTS (crackEdison) lands on "Edison".
//   Objects: the disc (one object, two pieces) + three labels.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { s3d, travelling } from "./common";
import { L } from "./data";
import { Turn, label } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { worldScr } from "./tk_rig";
import { TkFloor } from "./tk_floor";
import { theme } from "./theme";
import { CT_PAINT } from "./counter_ink";
import { DISC, DISC_AT, TestDisc, discPoint } from "./crack_disc";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const RIG = { cx: 540, cy: DISC_AT[1] - 420, persp: 3200, yaw: -10, pitch: -40 };
// how far the remainder slides (world units, along its bisector) and how far the disc turns as it arrives
const OUT = 330, SPIN0 = -34;
const KEYS = ["s0", "most", "tests", "other", "companies", "machines", "edison"];
export const crackTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`crack: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // the disc turns to rest about its axis from the place's first frame, settling as "tests" is said
    spin: { a: w.s0 - 26, b: w.tests + 4 },
    // 200+ TESTS OFFERED — fully read on "tests"
    total: { a: w.tests - 16, b: w.tests },
    // the two score lines draw in from the rim ("ran on")
    score: { a: w.tests + 2, b: w.other - 4 },
    // the remainder slides out on "other companies' machines"
    slide: { a: w.other - 4, b: w.machines + 6 },
    // OTHER MACHINES — fully read on "companies'"
    others: { a: w.companies - 16, b: w.companies },
    // the camera leans in on the sliver ("not the …")
    lean: { a: w.edison - 24, dur: 30 },
    // the sliver lights, its ticks one by one; EDISON: ~12 TESTS — fully read on "Edison"
    lit: { a: w.edison - 18, b: w.edison + 4 },
    ticks: { a: w.edison - 16, b: w.edison + 2 },
    edison: { a: w.edison - 16, b: w.edison }
  };
  if (t.score.b - t.score.a < 10) throw new Error("crack: the score lines need ≥ 10 f");
  if (t.score.a + 34 > t.others.b + 4) throw new Error("crack: the camera must be eased back as OTHER MACHINES lands");
  if (t.slide.b > t.lean.a + 6) throw new Error("crack: the remainder must be out before the camera leans in on the sliver");
  if (t.edison.b > end - 26) throw new Error("crack: EDISON: ~12 TESTS must read before the hand-over");
  return t;
};
const discAt = (t, g) => ({
  spin: SPIN0 * (1 - rOut(g, t.spin.a, t.spin.b)),
  score: rInOut(g, t.score.a, t.score.b),
  scoreOp: rOut(g, t.score.a, t.score.a + 8) * (1 - rInOut(g, t.slide.a + 2, t.slide.a + 14)),
  out: OUT * rInOut(g, t.slide.a, t.slide.b),
  lit: rInOut(g, t.lit.a, t.lit.b),
  ticks: rInOut(g, t.ticks.a, t.ticks.b),
  dim: rInOut(g, t.lit.a, t.lit.b)
});
const scr = (q) => {
  const p = worldScr(RIG, q);
  return { x: p[0], y: p[1] };
};
const S0 = { spin: 0, out: 0 }, S1 = { spin: 0, out: OUT };
const C0 = scr(discPoint(S0, "centre"));
const FRONT0 = scr(discPoint(S0, "front"));
const SLV = scr(discPoint(S1, "sliver"));
const RST = scr(discPoint(S1, "rest"));
const RFAR = scr(discPoint(S1, "restFar"));
const TIP = scr(discPoint(S1, "sliverTip"));
// the labels' places (place coordinates): the total under the disc's front; OTHER MACHINES above the remainder's far side; EDISON
//   above the sliver, so the three never share a line
const LAB_TOTAL = { x: C0.x, y: FRONT0.y + 34 };
// the sliver's visual centre: half way from the disc's centre (its apex) to its tip
const SLC = { x: (C0.x + TIP.x) / 2, y: (C0.y + TIP.y) / 2 };
const LEAN_Z = 1.55, MID_Z = 0.96;
const MID = { x: (SLV.x + RST.x) / 2 + 10, y: C0.y + 100 };
// OTHER MACHINES sits over the remainder's far side: whole in the eased-back framing, wholly carried out of frame by the lean
const LAB_OTHERS = { x: SLC.x + 540 / LEAN_Z + 170, y: Math.min(RST.y, RFAR.y) - 190 };
const LAB_EDISON = { x: SLC.x, y: SLC.y - 176 };
if (540 + (LAB_OTHERS.x + 160 - MID.x) * MID_Z > 1040) throw new Error("crack: OTHER MACHINES must be whole in the eased-back framing");
const shots = (t) => [
  // the disc, close, as it turns to rest
  { a: -9999, z: 1.24, push: 0.02, at: still(C0.x, C0.y + 110) },
  // easing back as the score lines draw, ahead of the slide: both pieces and OTHER MACHINES whole in frame as it lands
  { a: t.score.a, dur: 34, z: MID_Z, push: 0, at: still(MID.x, MID.y) },
  // leaning in on the sliver, centred, its label above it
  { a: t.lean.a, dur: t.lean.dur, z: LEAN_Z, push: 0.02, at: still(SLC.x, SLC.y + 30) }
];
export const crackCamWindows = (t) => actionCamWindows(shots(t));
export const crackSfx = (t) => [
  // 200+ TESTS OFFERED
  { job: "label", a: t.total.a, b: t.total.b + 6, vol: 0.45 },
  // the score lines drawing in from the rim
  { job: "data", a: t.score.a, b: t.score.b, vol: 0.5 },
  // the remainder sliding out
  { job: "obj", a: t.slide.a, b: t.slide.b, k: "io", vol: 0.85 },
  // OTHER MACHINES
  { job: "label", a: t.others.a, b: t.others.b + 6, vol: 0.45 },
  // the sliver takes the light
  { job: "ping", a: Math.round(t.lit.a + 0.55 * (t.lit.b - t.lit.a)), vol: 0.6 },
  // EDISON: ~12 TESTS
  { job: "label", a: t.edison.a, b: t.edison.b + 6, vol: 0.5 }
];
const Label = ({ x, y, w = 760, size, ink, on, text, probe }) => {
  if (on <= 3e-3) return null;
  return jsx("div", { "data-probe-object": probe, style: { position: "absolute", left: x - w / 2, top: y, width: w, textAlign: "center", opacity: on, transform: s3d(0, (1 - on) * 24) }, children: jsx("span", { style: label(size, ink), children: text }) });
};
// the floor alone, under a mask in the place root's own frame: it fades out over the root's off-screen margins, so as the place
//   pans in or out the floor's edge comes in soft — the root's clip would otherwise cut it as a hard vertical line
const MASK = "linear-gradient(to right, transparent 0px, #000 150px, #000 1210px, transparent 1360px)";
const FloorLayer = ({ cam, turn, children }) => jsx("div", { style: { position: "absolute", left: -140, top: -240, width: 1360, height: 2400, WebkitMaskImage: MASK, maskImage: MASK }, children: jsx("div", { style: { position: "absolute", left: 140, top: 240, width: 1080, height: 1920 }, children: jsx(CamFn, { at: cam, children: jsx(Turn, { ...turn, children }) }) }) });
export const BxCrack = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = crackTimes(w, end);
  const s = discAt(t, f);
  const st = clamp01(stage);
  const cam = actionCam(shots(t)), turn = { at, end, from: -5, to: 4, amp: 0.8 };
  return jsx(PlaceRoot, { children: [jsx(FloorLayer, { cam, turn, children: jsx(TkFloor, { id: "ckF", rig: RIG, at: { x: DISC_AT[0] + 80, z: DISC_AT[2] }, reach: 1300, casters: [], stage: st, on: 1 - st }) }, "fl"), jsx(CamFn, { at: cam, children: jsx("div", { "data-probe-leaving": travelling(f, crackCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { ...turn, children: [
    jsx("div", { "data-probe-object": "the test-menu disc on the floor: 200 engraved ticks; the 12-tick Edison sliver and the remainder that slides out", style: { position: "absolute", inset: 0 }, children: jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(TestDisc, { id: "ckD", rig: RIG, s }) }) }),
    jsx(Label, { x: LAB_TOTAL.x, y: LAB_TOTAL.y, size: 44, ink: CT_PAINT, on: rOut(f, t.total.a, t.total.b), text: L("crackTotal"), probe: "200+ TESTS OFFERED" }),
    jsx(Label, { x: LAB_OTHERS.x, y: LAB_OTHERS.y, size: 46, ink: CT_PAINT, on: rOut(f, t.others.a, t.others.b), text: L("crackOthers"), probe: "OTHER MACHINES" }),
    jsx(Label, { x: LAB_EDISON.x, y: LAB_EDISON.y, size: 48, ink: theme.accentBright, on: rOut(f, t.edison.a, t.edison.b), text: L("crackEdison"), probe: "EDISON: ~12 TESTS" })
  ] }) }) }, "obj")] });
};
void DISC;
