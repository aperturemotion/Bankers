// @ts-nocheck
// ★ V37 "Theranos" — place VERDICT (builder F). "In January two thousand twenty-two, Holmes was found guilty of defrauding
//   investors. Her sentence: eleven years and three months, later cut by one year."  (FACTCHECK #13, #14; figures in verdict_data.ts)
//   Neutral: the verdict and the sentence as the jury and the courts ruled them, no person, no gavel (Video 36 had one).
//   1. THE VERDICT BLOCK (verdict_block.tsx): a machined steel block with steel letters set into a slot in its top. JAN 3, 2022
//      paints into its left plate on "2022"; on "guilty" the six letters are driven up out of the block and stop hard on their
//      seats — GUILTY, with weight (a clunk, a low hit, a short rebound); 4 COUNTS paints into the right plate on "defrauding".
//   2. ★ The place runs 8.9 s, so on "Her sentence" the ACTION CAMERA TRAVELS right to framing 2, THE HOURGLASS (verdict_glass.tsx):
//      its sand runs through the neck as a thin thread and the lower bulb fills to 135 MONTHS, the figure easing in over it on
//      "months"; on "later cut by one year" the run reverses for a moment — one year of sand (12/135 of the heap's volume) runs
//      back up through the neck, the heap's level drops by exactly that volume, and the figure rolls over to 123 MONTHS.
//   Exits by the composition's pushLight into the fair hero card (LightBreak 2).
//   Objects: framing 1 the block; framing 2 the hourglass (≤ 3 per scene).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rIn, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn, figure, label } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { worldScr, xfPose } from "./tk_rig";
import { INK } from "./tk_mat";
import { TK_FLOOR_Y } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { CUT_SHARE } from "./verdict_data";
import { BLOCK_TOP_V, LETTER_CAP, VerdictBlock, verdictBlockCorners } from "./verdict_block";
import { Hourglass, hourglassCorners, hourglassPt } from "./verdict_glass";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const FY = TK_FLOOR_Y;
const RIG = { cx: 540, cy: FY - 1300, persp: 3600, yaw: 14, pitch: -6 };
const BLOCK = xfPose(540, FY, 0);
const HGAT = [1760, FY, -180];
const KEYS = ["s0", "january", "k2022", "holmes", "guilty", "defrauding", "investors", "s1", "sentence", "k11", "years", "k3", "months", "cut", "year"];
// ── times: every window keyed to a spoken word ────────────────────────────────────────────────────────────────────────
export const verdictTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`verdict: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    date: { a: w.k2022 - 12, b: w.k2022 + 6 },            // JAN 3, 2022 paints in on "2022"
    rise: { a: w.guilty - 13, b: w.guilty },               // the letters driven up, seated ON "guilty"
    push: { a: w.guilty - 22, dur: 34 },                   // the camera leans in to the letters as they rise
    counts: { a: w.defrauding - 12, b: w.defrauding + 6 }, // 4 COUNTS on "defrauding"
    travel: { a: w.sentence - 14, dur: 38 },               // ★ the travel to the hourglass on "Her sentence"
    pour: { a: w.s1 - 2, b: w.months },                    // the lower bulb fills to the whole sentence by "months"
    fig: { a: w.months - 14, b: w.months + 3 },            // 135 MONTHS on "months"
    back: { a: w.cut - 3, b: w.cut + 15 },                 // one year of sand runs back up on "cut"
    roll: { a: Math.min(w.cut + 19, end - 22) - 20, b: Math.min(w.cut + 19, end - 22) },   // the figure rolls to 123 MONTHS (20 f, soft-edged window), landed before the push-out
    out: end + 2 - 22                                      // the composition's pushLight (HO.verdict)
  };
  if (t.date.b > t.rise.a + 4) throw new Error("verdict: JAN 3, 2022 must be read before the letters rise");
  if (t.counts.b > t.travel.a) throw new Error("verdict: 4 COUNTS must be in before the travel to the hourglass");
  if (t.travel.a + t.travel.dur > t.fig.a) throw new Error("verdict: the camera must be at the hourglass before 135 MONTHS");
  if (t.pour.b - t.pour.a < 30) throw new Error("verdict: the sand needs ≥ 1 s to run");
  if (t.roll.a < t.back.a - 4) throw new Error("verdict: the figure may not roll before the sand runs back");
  if (t.back.a < t.fig.b + 6) throw new Error("verdict: 135 MONTHS must be read before the cut");
  if (t.roll.b > t.out - 2) throw new Error(`verdict: 123 MONTHS must land before the push-out (${t.roll.b} vs ${t.out})`);
  return t;
};
// ── the motion ─────────────────────────────────────────────────────────────────────────────────────────────────────────
/** the letters' rise: driven up (accelerating), stopped hard on the seats, a short damped rebound */
const riseAt = (t, g) => {
  if (g <= t.rise.a) return 0;
  if (g < t.rise.b) {
    const u = (g - t.rise.a) / (t.rise.b - t.rise.a);
    return 0.5 * (u * u) + 0.5 * (u * u * u * (u * (6 * u - 15) + 10));
  }
  const u = g - t.rise.b;
  return 1 - 0.035 * Math.exp(-u / 2.6) * Math.abs(Math.sin(Math.PI * u / 3.6));
};
/** the sand: the lower share, the upper share, the flow (+ down, − back up) */
const sandAt = (t, g) => {
  const e = rInOut(g, t.pour.a, t.pour.b);
  const r = rInOut(g, t.back.a, t.back.b) * CUT_SHARE;
  const low = e - r, up = 1 - e + r;
  const flowDown = g > t.pour.a && g < t.pour.b + 2 ? clamp01(Math.min((g - t.pour.a) / 4, (t.pour.b + 2 - g) / 4)) : 0;
  const flowUp = g > t.back.a && g < t.back.b + 1 ? clamp01(Math.min((g - t.back.a) / 3, (t.back.b + 1 - g) / 3)) : 0;
  return { low, up, flow: flowDown - flowUp, g };
};
// ── the camera ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const scr = (p) => {
  const q = worldScr(RIG, p);
  return { x: q[0], y: q[1] };
};
const BLOCK_C = [540, FY + BLOCK_TOP_V * 0.62, 0];
const LETTERS_C = [540, FY + BLOCK_TOP_V * 0.72, 0];
// framing 2: the hourglass with its figure over it, the whole of it centred (the aim sits 300 under the finial's top)
const HG_C = [HGAT[0], hourglassPt(HGAT, "top")[1] + 300, HGAT[2]];
const shots = (t) => [
  { a: -9999, z: 1.04, push: 0.03, at: () => scr(BLOCK_C) },
  { a: t.push.a, dur: t.push.dur, z: 1.1, push: 0.02, at: () => scr(LETTERS_C) },
  { a: t.travel.a, dur: t.travel.dur, z: 1.16, push: 0.03, at: () => scr(HG_C) }
];
export const verdictCamWindows = (t) => actionCamWindows(shots(t));
export const verdictSfx = (t) => [
  // JAN 3, 2022 paints into the left plate
  { job: "label", a: t.date.a, b: t.date.b, vol: 0.4 },
  // the six letters driven up out of the block …
  { job: "mech", a: t.rise.a, b: t.rise.b, vol: 0.6 },
  // … and stopped hard on their seats: the clunk, and the low hit under GUILTY
  { job: "thud", a: t.rise.b, b: t.rise.b + 1, vol: 0.9 },
  { job: "verdict", a: t.rise.b - 4, b: t.rise.b + 2, vol: 0.6 },
  // 4 COUNTS paints into the right plate
  { job: "label", a: t.counts.a, b: t.counts.b, vol: 0.35 },
  // the sand running: time going by, exactly the run
  { job: "clock", a: t.pour.a, b: t.pour.b, vol: 0.55 },
  // 135 MONTHS
  { job: "label", a: t.fig.a, b: t.fig.b, vol: 0.45 },
  // one year runs back up: the clock again, for exactly the run back
  { job: "clock", a: t.back.a, b: t.back.b, vol: 0.45 },
  // the figure rolls to 123 MONTHS
  { job: "label", a: t.roll.a, b: t.roll.b, vol: 0.4 }
];
// ── the figure over the hourglass: on the cut 135 MONTHS rises out and fades (11 f), 123 MONTHS rises in under it and settles
//    (12 f) — two moves in sequence on one spot, never both readable at once, nothing clipped
const SIZE = 92;
const RollFigure = ({ x, y, on, roll, from, to }) => {
  if (on <= 3e-3) return null;
  const Wd = 640;
  const r = clamp01(roll);
  const eOut = rInOut(r, 0, 0.55), eIn = rInOut(r, 0.45, 1);
  const run = (text, dy, op) => op <= 3e-3 ? null : jsx("div", { style: { position: "absolute", left: 0, top: 0, width: Wd, textAlign: "center",
    transform: `translateY(${dy.toFixed(2)}px)`, opacity: op, ...figure(SIZE) }, children: text });
  return jsxs("div", { "data-probe-label": "the hourglass's figure", style: {
    position: "absolute", left: 0, top: 0, width: Wd, height: SIZE, transformOrigin: "50% 100%",
    transform: `translate(${(x - Wd / 2).toFixed(2)}px, ${(y - SIZE + 14 * (1 - on)).toFixed(2)}px) scale(${(0.94 + 0.06 * on).toFixed(4)})`,
    opacity: clamp01(on * 1.4)
  }, children: [
    run(from, -0.42 * SIZE * eOut, 1 - eOut),
    run(to, 0.42 * SIZE * (1 - eIn), eIn)
  ] });
};
export const BxVerdict = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = verdictTimes(w, end);
  const rise = riseAt(t, f);
  const sand = sandAt(t, f);
  const top = worldScr(RIG, hourglassPt(HGAT, "top"));
  const casters = [{ corners: verdictBlockCorners(BLOCK) }];
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: actionCam(shots(t)), children: jsx("div", { "data-probe-leaving": travelling(f, verdictCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -5, to: 3, amp: 0.8, children: [
    jsx(TkFloor, { id: "vdF", rig: RIG, at: { x: 1100, z: -80 }, reach: 1700, casters, stage, on: 1 - stage }),
    // each framing's object is mounted only while it can be on screen: the hourglass stands off to the right (outside the frame
    //   and the place's clip) until the travel starts, the block is wholly off the left edge once the travel has landed
    f <= t.travel.a + t.travel.dur + 1 && jsx(VerdictBlock, { id: "vdB", rig: RIG, pose: BLOCK, rise, glint: rInOut(f, t.rise.b - 2, t.rise.b + 22), sheen: rInOut(f, at - 30, t.travel.a + 20),
      date: { text: L("verdictDate"), on: rInOut(f, t.date.a, t.date.b) }, counts: { text: L("verdictCounts"), on: rInOut(f, t.counts.a, t.counts.b) } }),
    f >= t.travel.a - 1 && jsx(Hourglass, { id: "vdH", rig: RIG, at: HGAT, sand, glow: rOut(f, t.back.a, t.back.b) * (1 - rInOut(f, t.back.b, t.back.b + 20)) }),
    jsx(RollFigure, { x: top[0], y: top[1] - 34, on: rOut(f, t.fig.a, t.fig.b), roll: rInOut(f, t.roll.a, t.roll.b), from: L("verdictMonths"), to: L("verdictCut") })
  ] }) }) }) });
};
