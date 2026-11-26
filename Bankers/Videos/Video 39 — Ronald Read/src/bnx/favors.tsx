// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { rIn, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn, Pool3D } from "./s3";
import { s3d, travelling } from "./common";
import { US_PAYOUT } from "./data_lt";
import { L, centsOf } from "./data";
import { Turn, label } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { LABEL_INK } from "./pie_ink";
import { centsTop } from "./pie_cents";
import { PieCoin, coinCentre, padBottom, padPose, rimPoint, wedgePoint } from "./pie_coin";
import { PIE_SEAT } from "./pie";
import { LotteryCatch, OUT_LOCK } from "./favors_catch";

const WORDS = ["average", "math", "favors", "lottery"];
const SET = { o: [540, 930, 0], lean: 33, spin: 58 };
const OUT0 = 76, TIP = 8;
const N_CENTS = Math.round(US_PAYOUT * 100);
const FRAME_AT = [-328, 0];
export const favorsTimes = (w, end) => {
  for (const k of WORDS) if (!Number.isFinite(w[k])) throw new Error(`favors: the take has no word frame "${k}"`);
  return {
    w,
    end,
    label: w.average,
    // the set tips toward the lottery's side from "math", its weight settling (a little past, then back) by "favors"
    tip: { a: w.math - 4, b: w.favors + 4 },
    // the wedge slides down the slope home into the jaw, accelerating (gravity on the incline) — home 2 f before "favors"
    slide: { a: w.math + 2, b: w.favors - 2 },
    // the latch drops shut ON "favors"; the lamp lights as it lands
    latch: { a: w.favors - 3, b: w.favors + 3 },
    lamp: { a: w.favors + 2, b: w.favors + 10 },
    glint: { a: w.favors - 8, b: end - 12 },
    // the cents, all down: the pie's pour, long done
    pour: { first: -1e3, every: 0.1, drop: 1, n: N_CENTS }
  };
};
const tipAt = (t, g) => {
  const p = rInOut(g, t.tip.a, t.tip.b);
  const over = g > t.tip.b ? 0.12 * Math.exp(-(g - t.tip.b) / 6) * Math.sin((g - t.tip.b) / 2.2) : 0;
  return TIP * (p + over * p);
};
const outAt = (t, g) => {
  const p = rIn(g, t.slide.a, t.slide.b);
  const reb = g > t.slide.b ? 1.4 * Math.exp(-(g - t.slide.b) / 3) * Math.sin((g - t.slide.b) / 1.4) : 0;
  return OUT0 + (OUT_LOCK - OUT0) * p - Math.max(0, reb);
};
const openAt = (t, g) => {
  const p = rIn(g, t.latch.a, t.latch.b);
  const reb = g > t.latch.b ? 0.07 * Math.exp(-(g - t.latch.b) / 3.5) * Math.abs(Math.sin((g - t.latch.b) / 1.6)) : 0;
  return 1 - p + reb;
};
const coinAt = (t, g) => ({
  ...SET,
  tip: tipAt(t, g),
  wob: 0,
  phi: 0,
  split: true,
  out: outAt(t, g),
  score: 0,
  scoreOp: 0,
  dollar: 0,
  cents: 1,
  dollarText: "$1",
  centsText: centsOf(US_PAYOUT),
  ticks: N_CENTS / (N_CENTS + 6),
  wedgeDim: 1,
  glint: rInOut(g, t.glint.a, t.glint.b),
  stage: 0,
  id: "favC",
  pour: { c: t.pour, g, at: PIE_SEAT },
  printTurn: -34
});
const shots = (t) => {
  const s0 = coinAt(t, t.tip.a), c0 = coinCentre(s0), yb = padBottom(s0), top = centsTop(padPose(s0), FRAME_AT, N_CENTS);
  return [
    // the whole set: the cents paid back, the coin, the wedge by the lottery's catch
    { a: -9999, z: 1.08, push: 0.02, at: still(c0.x + 10, 0.5 * (top.y + yb)) },
    // RIDE the wedge as the set tips and it slides home into the catch (the whole set kept in frame)
    { a: t.tip.a - 2, dur: 30, z: 1.11, push: 0, ride: { a: t.slide.a, b: t.slide.b + 4 }, at: (g) => {
      const s = coinAt(t, g), c = coinCentre(s), q = wedgePoint(s);
      return { x: c.x + 0.2 * (q.x - c.x) + 10, y: 0.5 * (top.y + yb) + 0.2 * (q.y - c.y) };
    } },
    // toward the lit rim, into the flare
    { a: t.glint.a + 14, dur: 30, z: 1.22, push: 0, at: (g) => {
      const s = coinAt(t, g), r = rimPoint(s), c = coinCentre(s);
      return { x: c.x + 0.22 * (r.x - c.x), y: c.y + 0.22 * (r.y - c.y) + 30 };
    } }
  ];
};
export const favorsCamWindows = (t) => actionCamWindows(shots(t));
export const favorsSfx = (t) => [
  // ON AVERAGE on "average"
  { job: "label", a: t.label - 3, b: t.label + 6, vol: 0.5 },
  // the set tipping (its weight going over), the wedge sliding home into the jaw
  { job: "mech", a: t.tip.a, b: t.tip.a + 14, vol: 0.5 },
  { job: "obj", a: t.slide.a, b: t.slide.b, vol: 0.8 },
  { job: "coin", a: t.slide.b, b: t.slide.b + 1, vol: 0.55 },
  // the latch dropping shut ON "favors", the lamp lighting
  { job: "click", a: t.latch.b, b: t.latch.b + 1, vol: 0.85 },
  { job: "ping", a: t.lamp.a, b: t.lamp.a + 2, vol: 0.45 }
];
const favorsRim = (t, g) => rimPoint(coinAt(t, g));
export const LtFavors = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = favorsTimes(w, end);
  const s = { ...coinAt(t, f), stage };
  const yb = padBottom(coinAt(t, t.tip.a));
  const lab = rOut(f, t.label - 3, t.label + 6);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceRoot, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CamFn, { at: actionCam(shots(t)), children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-leaving": travelling(f, favorsCamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)(Turn, { at, end, from: -6, to: 4, amp: 0.9, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Pool3D, { x: 540, y: yb - 20, w: 980, on: 0.42 * (1 - stage) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(PieCoin, { s, front: /* @__PURE__ */ (0,jsx_runtime.jsx)(LotteryCatch, { P: padPose(s), s: { open: openAt(t, f), lamp: rOut(f, t.lamp.a, t.lamp.b), id: "favK" } }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 340, top: yb + 40, width: 400, textAlign: "center", opacity: lab, transform: s3d(0, (1 - lab) * 24), ...label(28, LABEL_INK) }, children: L("onAverage") })
  ] }) }) }) });
};
