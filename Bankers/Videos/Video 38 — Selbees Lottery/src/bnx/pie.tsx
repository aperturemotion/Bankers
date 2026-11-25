// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rIn, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn, Pool3D } from "./s3";
import { s3d, travelling } from "./common";
import { GRID_LIT, US_PAYOUT } from "./data_lt";
import { L, centsOf } from "./data";
import { Turn, label } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { pol } from "./pie_world";
import { LABEL_INK } from "./pie_ink";
import { centsDone, centsStart, stackCounts, stacksTop } from "./pie_cents";
import { PieCoin, coinCentre, padBottom, padPose } from "./pie_coin";

const WORDS = ["average", "dollar", "tickets", "paid", "about", "k67", "cents"];
const SET = { o: [540, 880, 0], lean: 50, spin: 0, tip: 0 };
const WOB0 = 22, OUT = 76;
const N_CENTS = Math.round(US_PAYOUT * 100);
if (N_CENTS !== GRID_LIT) throw new Error("pie: the cents paid back must be the dial's 67");
if (stackCounts(N_CENTS).reduce((a, b) => a + b, 0) !== N_CENTS) throw new Error("pie: the six stacks must hold every cent paid back");
export const PIE_SEAT = pol(328, 146);
export const pieTimes = (w, end) => {
  for (const k of WORDS) if (!Number.isFinite(w[k])) throw new Error(`pie: the take has no word frame "${k}"`);
  return {
    w,
    end,
    /** the coin settles flat a hair before "dollar" */
    wob: { a: w.average - 29, b: w.dollar - 3 },
    score: { a: w.dollar + 12, b: w.tickets + 6 },
    // (the take's cue list has no "spent": the scoring starts ~ a third of a second after "dollar")
    slide: { a: w.paid, b: w.about + 6 },
    cents: w.k67,
    ticks: { a: w.about + 2, b: w.k67 + 12 },
    /** ★ rev 2: the pour — the first cent lands just after "back" (paid + 9), the 67th two frames before "67"
     *  (★ rev 3: a short drop from inside the frame, under the caption band, each cent fading in over its first 6 frames) */
    pour: { first: w.paid + 9, every: (w.k67 - 2 - (w.paid + 9)) / (N_CENTS - 1), drop: 300, n: N_CENTS, fade: 6 }
  };
};
const coinAt = (t, g) => {
  const { w } = t;
  const p = clamp01((g - t.wob.a) / (t.wob.b - t.wob.a));
  const wob = WOB0 * Math.pow(1 - p, 1.3);
  const n = Math.max(0, Math.min(g, t.wob.b) - t.wob.a), Lw = t.wob.b - t.wob.a;
  const phi = 140 + 180 / Math.PI * (0.17 * n + 0.24 * n * n / Lw);
  const split = g >= t.score.b;
  return {
    ...SET,
    wob,
    phi,
    split,
    out: OUT * rInOut(g, t.slide.a, t.slide.b),
    score: rInOut(g, t.score.a, t.score.b),
    scoreOp: rOut(g, t.score.a, t.score.a + 8) * (1 - rInOut(g, w.paid + 4, w.paid + 16)),
    dollar: rOut(g, w.dollar - 8, w.dollar + 6) * (1 - rIn(g, w.paid - 2, w.paid + 10)),
    cents: rOut(g, t.cents - 12, t.cents + 2),
    dollarText: "$1",
    centsText: centsOf(US_PAYOUT),
    // ★ rev 2: one tick (and the inlay's step) per cent landed, continuous
    ticks: Math.min(N_CENTS, Math.max(0, (g - t.pour.first) / t.pour.every + 1)) / (GRID_LIT + 6),
    wedgeDim: rInOut(g, t.slide.a + 2, t.slide.b + 2),
    glint: 0,
    stage: 0,
    id: "pieC",
    pour: { c: t.pour, g, at: PIE_SEAT }
  };
};
const REST = (t) => coinAt(t, t.wob.b + 1);
const YOFF = 34;
const shots = (t) => {
  const c0 = coinCentre(REST(t));
  const P = padPose(REST(t)), top = stacksTop(P, PIE_SEAT, N_CENTS);
  const s0 = centsStart(t.pour), s1 = centsDone(t.pour), yb = padBottom(REST(t));
  return [
    { a: -9999, z: 1.12, push: 0.02, at: still(c0.x, c0.y + 30) },
    // RIDE the settling coin (its centre sinking as it lies down)
    { a: t.wob.a + 14, dur: 30, z: 1.14, push: 0, ride: { a: t.wob.a + 14, b: t.wob.b }, at: (g) => {
      const c = coinCentre(coinAt(t, g));
      return { x: c.x, y: c.y + 30 };
    } },
    // push in on the face for the scoring
    { a: t.score.a - 6, dur: 34, z: 1.26, push: 0, at: still(c0.x, c0.y + 10) },
    // ★ rev 2: as the wedge slides off right and the cents pour in left, PULL BACK and RIDE the parting — (★ rev 3) the frame rising
    //   with the stacks' tops as they fill, so the whole set (stacks, coin, pad) stays in frame
    { a: t.slide.a - 6, dur: 30, z: 1.06, push: 0, ride: { a: s0, b: s1 }, at: (g) => {
      const k = Math.min(N_CENTS, Math.max(0, (g - t.pour.first) / t.pour.every + 1));
      const ty = stacksTop(P, PIE_SEAT, N_CENTS, k).y;
      return { x: c0.x + 4, y: 0.5 * (ty + yb) + YOFF };
    } },
    // settle on the 67¢ and its stacks of cents, the whole set centred
    { a: s1 + 2, dur: 34, z: 1.15, push: 0.025, at: still(c0.x - 16, 0.5 * (top.y + yb) + YOFF) }
  ];
};
export const pieCamWindows = (t) => actionCamWindows(shots(t));
export const pieSfx = (t) => [
  // the coin's rattle as it settles, its last contact the loudest
  { job: "coin", a: t.wob.b - 16, b: t.wob.b - 15, vol: 0.45 },
  { job: "coin", a: t.wob.b - 7, b: t.wob.b - 6, vol: 0.6 },
  { job: "coin", a: t.wob.b, b: t.wob.b + 1, vol: 0.85 },
  // "$1" printing on "dollar"
  { job: "label", a: t.w.dollar - 8, b: t.w.dollar + 6, vol: 0.5 },
  // the scoring lines drawing in from the rim
  { job: "data", a: t.score.a, b: t.score.b, vol: 0.6 },
  // the wedge sliding out
  { job: "obj", a: t.slide.a, b: t.slide.b, vol: 0.9 },
  // PAID BACK under the pad
  { job: "label", a: t.w.paid - 6, b: t.w.paid + 8, vol: 0.45 },
  // ★ rev 2: the pour of cents — the first one ringing on the seat, the stream, the 67th landing (coin family)
  ...[0, 22, 44, N_CENTS - 1].map((i) => {
    const a = Math.round(t.pour.first + i * t.pour.every);
    return { job: "coin", a, b: a + 1, vol: i === N_CENTS - 1 ? 0.8 : 0.5 };
  }),
  { job: "process", a: Math.round(t.pour.first) - 2, b: Math.round(centsDone(t.pour)) + 2, vol: 0.45 },
  // 67¢: a number arriving
  { job: "ping", a: t.cents - 2, b: t.cents, vol: 0.9 }
];
export const LtPie = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = pieTimes(w, end);
  const s = { ...coinAt(t, f), stage };
  const yb = padBottom(REST(t));
  const lab = rOut(f, w.paid - 6, w.paid + 8);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceRoot, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CamFn, { at: actionCam(shots(t)), children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-leaving": travelling(f, pieCamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)(Turn, { at, end, from: -6, to: 4, amp: 0.9, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Pool3D, { x: 540, y: yb - 20, w: 980, on: 0.42 * (1 - stage) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(PieCoin, { s }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 340, top: yb + 46, width: 400, textAlign: "center", opacity: lab, transform: s3d(0, (1 - lab) * 24), ...label(28, LABEL_INK) }, children: L("paidBack") })
  ] }) }) }) });
};
