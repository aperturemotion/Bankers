// @ts-nocheck
// ★ V37 "Theranos" — place CLEARED (builder F, REV 1: the scales are replaced). "And she was cleared of defrauding patients."
//   (FACTCHECK #13, #16: convicted on the investor counts, acquitted on the patient counts — stated as the jury ruled, no take.)
//   THE EXHIBIT TABLE (cleared_exhibits.tsx): the court's walnut evidence table with two exhibit trays, each holding what its count
//   was about. INVESTORS: a share certificate stamped GUILTY in red, its exhibit card standing in front, INVESTORS: GUILTY
//   (clearedInvestors). PATIENTS: the Theranos nanotainer (builder H's th_tube) in its stand beside a test-result slip, its card lying
//   face-down. The place rises from under the fair hero card with both exhibits on the table; on "cleared" the patients' card FLIPS
//   UP on its clip to read PATIENTS: NOT GUILTY (clearedPatients) as a lamp lights that tray and the investors' tray dims.
//   Exits by the composition's pushLight into the lesson card. Objects: the table, its two exhibits (≤ 3).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { worldScr, xfApply, xfPose } from "./tk_rig";
import { TK_FLOOR_Y } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { ExhibitTable, TABLE_TOP_V, tableCorners } from "./cleared_exhibits";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const FY = TK_FLOOR_Y;
const RIG = { cx: 540, cy: FY - 2700, persp: 3600, yaw: 4, pitch: -22 };
const POSE = xfPose(540, FY, 0);
const KEYS = ["s0", "cleared", "defrauding", "patients"];
export const clearedTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`cleared: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    flip: { a: w.cleared - 13, b: w.cleared + 2 },         // the patients' card flips up, read ON "cleared"
    lamp: { a: w.cleared - 6, b: w.cleared + 14 },         // the lamp lights the patients' tray
    push: { a: w.cleared - 16, dur: 34 },                  // the camera leans in a touch
    out: end + 2 - 22                                      // the composition's pushLight (HO.cleared)
  };
  if (t.flip.b > t.out - 10) throw new Error(`cleared: the card must be up and read before the push-out (${t.flip.b} vs ${t.out})`);
  return t;
};
const scr = (p) => {
  const q = worldScr(RIG, xfApply(POSE, p));
  return { x: q[0], y: q[1] };
};
const shots = (t) => [
  { a: -9999, z: 1.24, push: 0.03, at: () => scr([0, TABLE_TOP_V + 110, 10]) },
  { a: t.push.a, dur: t.push.dur, z: 1.3, push: 0.02, at: () => scr([40, TABLE_TOP_V + 100, 10]) }
];
export const clearedCamWindows = (t) => actionCamWindows(shots(t));
export const clearedSfx = (t) => [
  // the patients' card flips up on its clip …
  { job: "obj", a: t.flip.a, b: t.flip.b, k: "io", vol: 0.4 },
  // … and lands upright (a card's tap)
  { job: "flick", a: t.flip.b, vol: 0.6 },
  // the lamp comes on over the patients' tray
  { job: "ping", a: t.lamp.a + 4, vol: 0.4 }
];
/** a label's two halves, split at its colon ("INVESTORS: GUILTY" → INVESTORS / GUILTY); nothing typed */
const halves = (text) => {
  const i = text.indexOf(":");
  return i > 0 ? { who: text.slice(0, i), what: text.slice(i + 1).trim() } : { who: "", what: text };
};
export const BxCleared = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = clearedTimes(w, end);
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: actionCam(shots(t)), children: jsx("div", { "data-probe-leaving": travelling(f, clearedCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at: at - 25, end, from: -4, to: 3, amp: 0.6, children: [
    jsx(TkFloor, { id: "clF", rig: RIG, at: { x: 540, z: -40 }, reach: 1500, casters: [{ corners: tableCorners(POSE) }], stage, on: 1 - stage }),
    jsx(ExhibitTable, { id: "clT", rig: RIG, pose: POSE, stamp: { text: L("verdictGuilty"), on: 1 }, inv: halves(L("clearedInvestors")), pat: halves(L("clearedPatients")),
      lift: rInOut(f, t.flip.a, t.flip.b), lamp: rInOut(f, t.lamp.a, t.lamp.b), tubeLabel: L("hookTube"), sheen: rInOut(f, at - 25, end) })
  ] }) }) }) });
};
