// @ts-nocheck
// ★ V37 "Theranos" — place VERDICT (builder F, REV 1). "In January two thousand twenty-two, Holmes was found guilty of defrauding
//   investors. Her sentence: eleven years and three months, later cut by one year."  (FACTCHECK #13, #14; figures in verdict_data.ts)
//   Neutral: the verdict and the sentence as the jury and the courts ruled them; no person.
//   1. THE JUDGE'S BENCH (verdict_gavel.tsx; REV 1, Timur: "a table with the hammer, as in the court … another point of view … change
//      the design"): dark walnut and brass, seen high from its right-front three-quarter. JAN 3, 2022 paints into its brass nameplate
//      on "2022"; the gavel lying on the leather pad rises as the camera leans in, and STRIKES its sound block ON "guilty" — GUILTY
//      lands over the block with the blow; 4 COUNTS settles under it on "defrauding".
//   2. ★ The place runs 9.6 s, so on "Her sentence" the ACTION CAMERA TRAVELS right to framing 2, THE HOURGLASS (verdict_glass.tsx;
//      REV 1: "keep the time watch, but make it more detailed"): its sand runs through the neck as a thin thread and the lower bulb
//      fills to 135 MONTHS on "months"; on "later cut by one year" one year of sand (12/135 of the heap's volume) runs back up through
//      the neck, the heap's level drops by exactly that volume, and the figure turns to 123 MONTHS.
//   Exits by the composition's pushLight into the fair hero card (LightBreak 2).
//   Objects: framing 1 the bench, its block, its gavel; framing 2 the hourglass (≤ 3 per scene).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rIn, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn, figure, label } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { worldScr, xfApply, xfPose } from "./tk_rig";
import { INK } from "./tk_mat";
import { TK_FLOOR_Y } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { CUT_SHARE } from "./verdict_data";
import { BENCH, BENCH_TOP_V, BLOCK, Bench, GV, Gavel, GavelShadow, PAD, SoundBlock, benchCorners } from "./verdict_gavel";
import { Hourglass, hourglassCorners, hourglassPt } from "./verdict_glass";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const FY = TK_FLOOR_Y;
const RIG = { cx: 540, cy: FY - 1650, persp: 3600, yaw: 8, pitch: -9 };
// the bench turned −30° about its foot: its right end swings toward the lens (a right-front three-quarter, high)
const BYAW = -30;
const BPOSE = xfPose(540, FY, 0, 1, BYAW);
const HGAT = [1800, FY, -260];
// the block and the gavel, in bench-local coordinates (u right, v down, w front), then into the world through BPOSE
const BLK_L = [PAD.u + 40, BENCH_TOP_V, PAD.w - 30];
const BLK = xfApply(BPOSE, BLK_L);
const BLOCK_TOP = BLK[1] - BLOCK.h;
const yawVec = (psi) => [Math.cos(psi * Math.PI / 180), 0, -Math.sin(psi * Math.PI / 180)];
const toWorld = (p) => ({ ...p, psi: p.psi + BYAW, P: xfApply(BPOSE, p.P) });
// lying on the pad in front of the block (its side on the pad, the knob's end touching it), and struck (its face on the block)
const REST = (() => {
  const psi = 14, head = [BLK_L[0] - 70, BENCH_TOP_V - GV.headR, BLK_L[2] + 178];
  const theta = -Math.asin((GV.headR - GV.knobR) / GV.butt) * 180 / Math.PI;
  const v = yawVec(psi), c = Math.cos(theta * Math.PI / 180);
  return { psi, theta, rho: 90, P: [head[0] - GV.butt * c * v[0], BENCH_TOP_V - GV.knobR, head[2] - GV.butt * c * v[2]] };
})();
if (REST.P[0] - GV.knobR < -BENCH.W / 2 + 30) throw new Error("verdict: the gavel must lie wholly on the bench top");
const STRUCK = (() => {
  const psi = 34, head = [BLK_L[0], BENCH_TOP_V - BLOCK.h - GV.headL / 2, BLK_L[2]];
  const v = yawVec(psi);
  return { psi, theta: 0, rho: 0, P: [head[0] - GV.butt * v[0], head[1], head[2] - GV.butt * v[2]] };
})();
const RAISE = -40;
const mixV = (a2, b2, e) => a2.map((x, i) => x + (b2[i] - x) * e);
const KEYS = ["s0", "january", "k2022", "holmes", "guilty", "defrauding", "investors", "s1", "sentence", "k11", "years", "k3", "months", "cut", "year"];
// ── times: every window keyed to a spoken word ────────────────────────────────────────────────────────────────────────
export const verdictTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`verdict: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    date: { a: w.k2022 - 12, b: w.k2022 + 6 },            // JAN 3, 2022 paints into the nameplate on "2022"
    push: { a: w.guilty - 34, dur: 32 },                   // the camera leans in to the block as the gavel rises
    lift: { a: w.guilty - 28, b: w.guilty - 9 },           // the gavel rises off the pad …
    strike: { a: w.guilty - 8, b: w.guilty },              // … and strikes the block ON "guilty" (an 8-f swing down)
    verdict: { a: w.guilty, b: w.guilty + 8 },             // GUILTY lands with the blow (from the contact on: the head never passes through it)
    counts: { a: w.defrauding - 6, b: w.defrauding + 8 },  // 4 COUNTS settles on "defrauding"
    travel: { a: w.sentence - 14, dur: 38 },               // ★ the travel to the hourglass on "Her sentence"
    pour: { a: w.s1 - 2, b: w.months },                    // the lower bulb fills to the whole sentence by "months"
    fig: { a: w.months - 14, b: w.months + 3 },            // 135 MONTHS on "months"
    back: { a: w.cut - 3, b: w.cut + 15 },                 // one year of sand runs back up on "cut"
    roll: { a: Math.min(w.cut + 19, end - 22) - 20, b: Math.min(w.cut + 19, end - 22) },   // the figure rolls to 123 MONTHS (20 f, soft-edged window), landed before the push-out
    out: end + 2 - 22                                      // the composition's pushLight (HO.verdict)
  };
  if (t.date.b > t.lift.a + 4) throw new Error("verdict: JAN 3, 2022 must be read before the gavel rises");
  if (t.counts.a < t.verdict.b - 2) throw new Error("verdict: 4 COUNTS comes after GUILTY");
  if (t.counts.b > t.travel.a) throw new Error("verdict: 4 COUNTS must be in before the travel to the hourglass");
  if (t.travel.a + t.travel.dur > t.fig.a) throw new Error("verdict: the camera must be at the hourglass before 135 MONTHS");
  if (t.pour.b - t.pour.a < 30) throw new Error("verdict: the sand needs ≥ 1 s to run");
  if (t.roll.a < t.back.a - 4) throw new Error("verdict: the figure may not roll before the sand runs back");
  if (t.back.a < t.fig.b + 6) throw new Error("verdict: 135 MONTHS must be read before the cut");
  if (t.roll.b > t.out - 2) throw new Error(`verdict: 123 MONTHS must land before the push-out (${t.roll.b} vs ${t.out})`);
  return t;
};
// ── the motion ─────────────────────────────────────────────────────────────────────────────────────────────────────────
/** the gavel at frame g: lying → rising (yaw, roll and lift together) → swung up → struck → a small rebound on the block */
const gavelAt = (t, g) => {
  const e = rInOut(g, t.lift.a, t.lift.b), er = rInOut(g, t.lift.a, t.lift.b - 4);
  const P = mixV(REST.P, STRUCK.P, e);
  const psi = REST.psi + (STRUCK.psi - REST.psi) * e;
  const rho = REST.rho * (1 - er);
  let theta = REST.theta + (RAISE - REST.theta) * e;
  if (g >= t.strike.a) theta = RAISE * (1 - rIn(g, t.strike.a, t.strike.b));
  const u = g - t.strike.b;
  if (u > 0) theta = -5 * Math.exp(-u / 2.2) * Math.abs(Math.sin(Math.PI * u / 3.6));
  return toWorld({ P, psi, rho, theta });
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
const BENCH_C = xfApply(BPOSE, [0, BENCH_TOP_V * 0.62, 40]);
const BLOCK_C = [BLK[0] - 20, BLOCK_TOP + 30, BLK[2]];
// framing 2: the hourglass with its figure over it, the whole of it centred (the aim sits 300 under the finial's top)
const HG_C = [HGAT[0], hourglassPt(HGAT, "top")[1] + 300, HGAT[2]];
const shots = (t) => [
  { a: -9999, z: 0.9, push: 0.03, at: () => scr(BENCH_C) },
  { a: t.push.a, dur: t.push.dur, z: 1.18, push: 0.02, at: () => scr(BLOCK_C) },
  { a: t.travel.a, dur: t.travel.dur, z: 1.16, push: 0.03, at: () => scr(HG_C) }
];
export const verdictCamWindows = (t) => actionCamWindows(shots(t));
export const verdictSfx = (t) => [
  // JAN 3, 2022 paints into the brass nameplate
  { job: "label", a: t.date.a, b: t.date.b, vol: 0.4 },
  // the gavel rises off the pad
  { job: "obj", a: t.lift.a, b: t.lift.b, vol: 0.45 },
  // the gavel strikes the block, and the low hit as GUILTY lands with it
  { job: "thud", a: t.strike.b, b: t.strike.b + 1, vol: 0.9 },
  { job: "verdict", a: t.strike.b - 4, b: t.strike.b + 2, vol: 0.6 },
  // 4 COUNTS settles under GUILTY
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
/** a figure with its one small label over it (Video 36's TopLabel order), easing up into place over the struck gavel */
const VerdictLabel = ({ x, y, on, fig, sub, subOn = 0 }) => {
  if (on <= 3e-3 && subOn <= 3e-3) return null;
  const Wd = 640, size = 104;
  return jsxs(jsx_runtime.Fragment, { children: [
    on > 3e-3 && jsx("div", { "data-probe-label": "the verdict", style: { position: "absolute", left: 0, top: 0, width: Wd, textAlign: "center", transformOrigin: "50% 100%",
      transform: `translate(${(x - Wd / 2).toFixed(2)}px, ${(y - size + 16 * (1 - on)).toFixed(2)}px) scale(${(0.92 + 0.08 * on).toFixed(4)})`,
      opacity: clamp01(on * 1.4), ...figure(size) }, children: fig }),
    sub && subOn > 3e-3 && jsx("div", { "data-probe-label": "the verdict's counts", style: { position: "absolute", left: 0, top: 0, width: Wd, textAlign: "center",
      transform: `translate(${(x - Wd / 2).toFixed(2)}px, ${(y - size - 50 + 10 * (1 - subOn)).toFixed(2)}px)`, opacity: clamp01(subOn * 1.4), ...label(36, "#B9D2F0") }, children: sub })
  ] });
};
export const BxVerdict = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = verdictTimes(w, end);
  const g = gavelAt(t, f);
  const sand = sandAt(t, f);
  const top = worldScr(RIG, hourglassPt(HGAT, "top"));
  const over = worldScr(RIG, [BLK[0], BLOCK_TOP - GV.headL - 46, BLK[2]]);
  const casters = [{ corners: benchCorners(BPOSE) }];
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: actionCam(shots(t)), children: jsx("div", { "data-probe-leaving": travelling(f, verdictCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -5, to: 3, amp: 0.8, children: [
    jsx(TkFloor, { id: "vdF", rig: RIG, at: { x: 1100, z: -80 }, reach: 1800, casters, stage, on: 1 - stage }),
    // the hourglass stands off to the right (outside the frame and the place's clip) until the travel starts, so it is mounted
    //   from then on (it never meets the outgoing collapse place on the slide in); the bench stays (its shadow stays on the floor)
    jsxs("div", { "data-probe-object": "the judge's bench with its sound block and gavel", style: { position: "absolute", inset: 0 }, children: [
      jsx(Bench, { id: "vdB", rig: RIG, pose: BPOSE, sheen: rInOut(f, at - 30, t.travel.a + 20), plate: { text: L("verdictDate"), on: rInOut(f, t.date.a, t.date.b) } }),
      jsx(GavelShadow, { rig: RIG, pose: g, shadowY: BLK[1] }),
      jsx(SoundBlock, { id: "vdK", rig: RIG, c: BLK, lit: rOut(f, t.strike.b, t.strike.b + 3) * (1 - rInOut(f, t.strike.b + 3, t.strike.b + 22)) }),
      jsx(Gavel, { id: "vdG", rig: RIG, pose: g, blockC: BLK })
    ] }),
    jsx(VerdictLabel, { x: over[0], y: over[1], on: rOut(f, t.verdict.a, t.verdict.b), fig: L("verdictGuilty"), sub: L("verdictCounts"), subOn: rInOut(f, t.counts.a, t.counts.b) }),
    f >= t.travel.a - 1 && jsx(Hourglass, { id: "vdH", rig: RIG, at: HGAT, sand, glow: rOut(f, t.back.a, t.back.b) * (1 - rInOut(f, t.back.b, t.back.b + 20)) }),
    jsx(RollFigure, { x: top[0], y: top[1] - 34, on: rOut(f, t.fig.a, t.fig.b), roll: rInOut(f, t.roll.a, t.roll.b), from: L("verdictMonths"), to: L("verdictCut") })
  ] }) }) }) });
};
