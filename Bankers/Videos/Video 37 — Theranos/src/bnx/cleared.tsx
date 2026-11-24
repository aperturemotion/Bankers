// @ts-nocheck
// ★ V37 "Theranos" — place CLEARED (builder F). "And she was cleared of defrauding patients."  (FACTCHECK #13, #16: acquitted on
//   the patient counts, convicted on the investor counts — stated as the jury ruled, no take.)
//   THE SCALES OF JUSTICE (cleared_scales.tsx): a real equal-arm balance — machined base, turned column, pivot head, a tapered beam
//   with its pointer over an engraved arc plate, two pans hung on three chains each. It rises from under the fair hero card
//   ALREADY SWINGING (the beam rocking and settling); INVESTORS: GUILTY (clearedInvestors) eases in under the right pan as it
//   settles; on "cleared" the beam tips hard — the left pan rises with PATIENTS: NOT GUILTY (clearedPatients) landing under it,
//   the right pan sinks, the pointer swings across the arc — and settles with a damped rock. One clear action, readable in 2 s.
//   Exits by the composition's pushLight into the lesson card. Objects: the scales (one), its two labels.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn, figure, label } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { worldScr, xfPose } from "./tk_rig";
import { TK_FLOOR_Y } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { PIVOT_V, SC, Scales, panFoot, scalesCorners } from "./cleared_scales";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const FY = TK_FLOOR_Y;
const RIG = { cx: 540, cy: FY - 1300, persp: 3600, yaw: 9, pitch: -6 };
const POSE = xfPose(540, FY, 0);
const TIP = 16;                       // the beam's final tilt (°): the right (investors') end down
const KEYS = ["s0", "cleared", "defrauding", "patients"];
export const clearedTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`cleared: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    swing: w.s0 - 34,                                  // the beam is rocking as the place rises (from under the card)
    inv: { a: w.s0 - 4, b: w.s0 + 14 },                // INVESTORS: GUILTY settles in under the right pan
    tip: { a: w.cleared - 10, b: w.cleared + 6 },      // the beam tips ON "cleared"
    pat: { a: w.cleared - 10, b: w.cleared + 3 },      // PATIENTS: NOT GUILTY rides up with its pan, read on "cleared"
    push: { a: w.cleared - 14, dur: 30 },              // the camera leans in a touch as it tips
    out: end + 2 - 22                                  // the composition's pushLight (HO.cleared)
  };
  if (t.inv.b > t.tip.a + 6) throw new Error("cleared: INVESTORS: GUILTY must be in before the beam tips");
  if (t.tip.b > t.out - 6) throw new Error(`cleared: the tip must land before the push-out (${t.tip.b} vs ${t.out})`);
  return t;
};
/** the beam's tilt: a decaying rock from the rise, then the tip to TIP with a damped settle */
const tiltAt = (t, g) => {
  const u = g - t.swing;
  const rock = u > 0 ? -7 * Math.sin(2 * Math.PI * u / 46) * Math.exp(-u / 70) : 0;
  const e = rInOut(g, t.tip.a, t.tip.b);
  const v = g - t.tip.b;
  const settle = v > 0 ? -2.2 * Math.exp(-v / 9) * Math.sin(Math.PI * v / 11) : 0;
  return rock * (1 - e) + TIP * e + settle;
};
const scr = (p) => {
  const q = worldScr(RIG, p);
  return { x: q[0], y: q[1] };
};
// the framing: the whole balance, its labels under the pans (the aim sits between the pivot and the floor, a little low)
const AIM = [540, FY + PIVOT_V * 0.5, 0];
const shots = (t) => [
  { a: -9999, z: 1.02, push: 0.03, at: () => scr(AIM) },
  { a: t.push.a, dur: t.push.dur, z: 1.06, push: 0.02, at: () => scr([540, FY + PIVOT_V * 0.52, 0]) }
];
export const clearedCamWindows = (t) => actionCamWindows(shots(t));
export const clearedSfx = (t) => [
  // INVESTORS: GUILTY
  { job: "label", a: t.inv.a, b: t.inv.b, vol: 0.35 },
  // the beam tips: its chains rattle and the pans swing through
  { job: "mech", a: t.tip.a, b: t.tip.b, vol: 0.6 },
  { job: "obj", a: t.tip.a, b: t.tip.b, k: "io", vol: 0.4 },
  // PATIENTS: NOT GUILTY
  { job: "label", a: t.pat.a, b: t.pat.b, vol: 0.45 }
];
/** a pan's label: the party small, the ruling big under it (the label's own two halves, split at its colon) */
const PanLabel = ({ x, y, on, text, probe }) => {
  if (on <= 3e-3) return null;
  const i = text.indexOf(":");
  const who = i > 0 ? text.slice(0, i) : "", what = i > 0 ? text.slice(i + 1).trim() : text;
  const Wd = 420;
  return jsxs("div", { "data-probe-label": probe, style: { position: "absolute", left: 0, top: 0, width: Wd, transformOrigin: "50% 0%",
    transform: `translate(${(x - Wd / 2).toFixed(2)}px, ${(y - 12 * (1 - on)).toFixed(2)}px) scale(${(0.94 + 0.06 * on).toFixed(4)})`, opacity: clamp01(on * 1.4) }, children: [
    who && jsx("div", { style: { width: Wd, textAlign: "center", ...label(30, "#9FC1EA") }, children: who }),
    jsx("div", { style: { width: Wd, textAlign: "center", marginTop: 10, ...figure(64) }, children: what })
  ] });
};
export const BxCleared = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = clearedTimes(w, end);
  const th = tiltAt(t, f);
  const fl = worldScr(RIG, panFoot(POSE, th, -1)), fr = worldScr(RIG, panFoot(POSE, th, 1));
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: actionCam(shots(t)), children: jsx("div", { "data-probe-leaving": travelling(f, clearedCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at: at - 25, end, from: -4, to: 3, amp: 0.6, children: [
    jsx(TkFloor, { id: "clF", rig: RIG, at: { x: 540, z: -40 }, reach: 1400, casters: [{ corners: scalesCorners(POSE) }], stage, on: 1 - stage }),
    jsx(Scales, { id: "clS", rig: RIG, pose: POSE, th, sheen: rInOut(f, at - 25, end) }),
    jsx(PanLabel, { x: fl[0], y: fl[1] + 44, on: rOut(f, t.pat.a, t.pat.b), text: L("clearedPatients"), probe: "the patients' pan's label" }),
    jsx(PanLabel, { x: fr[0], y: fr[1] + 44, on: rOut(f, t.inv.a, t.inv.b), text: L("clearedInvestors"), probe: "the investors' pan's label" })
  ] }) }) }) });
};
