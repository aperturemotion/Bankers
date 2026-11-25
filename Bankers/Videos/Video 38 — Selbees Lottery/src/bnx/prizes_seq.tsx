// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rInOut, rOut } from "./anim";
import { PlaceRoot, useOwn } from "./shot";
import { CamFn } from "./s3";
import { aim, travelling } from "./common";
import { HEROES, SENTENCES, WORDS } from "./captions";
import { NET_2024_B, PRIZES_2024_B } from "./data_lt";
import { L, usdB1 } from "./data";
import { Turn } from "./kit";
import { smoothFollow } from "./chart";
import { actionCam, actionCamWindows } from "./actioncam";
import { worldScr, xfMul, xfRotZ, xfTrans } from "./tk_rig";
import { TK_D, TK_FLOOR_Y, TK_H, TK_STRIP_U, TK_TORN_FULL, TkMain, TkStrip, tkCentre, tkCorners, tkPose, tkRig } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { LtSafe, SAFE, safeCorners } from "./lotteries_safe";
import { FEED_CHEEK_TOP_V, FEED_CROWN_V, FEED_NIP_V, LtFeedBack, LtFeedFront, feedCorners, feedFlecks } from "./lotteries_feed";

const RUN_RIG = tkRig({ eye: 1300 });
const R = RUN_RIG, FY = TK_FLOOR_Y;
const MC = tkCentre("main")[0], SCU = tkCentre("strip")[0];
const RUN = { X0: 400, slide: 190, gap: 30, safeX: 1440 };
const MAIN_X0 = RUN.X0 + MC;
const STRIP_X0 = RUN.X0 + SCU + RUN.gap;
const HANG_Y = FY + FEED_CHEEK_TOP_V - 30, TOUCH_Y = FY + FEED_CROWN_V + 4, NIP_Y = FY + FEED_NIP_V;
const FEED_D = NIP_Y + TK_H + 2 - TOUCH_Y;
if (STRIP_X0 + (TK_STRIP_U[1] - SCU) > RUN.safeX - SAFE.w / 2 - SAFE.over - 30) throw new Error("prizes_seq: the strip must stand clear of the safe");
const norm = (x) => x.toLowerCase().replace(/[^a-z0-9$%&]/g, "");
const sen0 = (scene) => SENTENCES.filter((x) => x.scene === scene)[0];
const inSen = (scene, word) => {
  const s0 = sen0(scene), hit = WORDS.find((x) => x.at >= s0.at && x.at <= s0.end && norm(x.word) === norm(word));
  if (!hit) throw new Error(`prizes_seq: "${word}" not in ${scene}`);
  return hit.at;
};
export const RUN_W = {
  prizes: { s0: sen0("prizes").at, prizes: inSen("prizes", "Prizes"), paid: inSen("prizes", "paid"), back: inSen("prizes", "back"), k702: inSen("prizes", "$70.2"), billion: inSen("prizes", "billion") },
  lotteries: { s0: sen0("lotteries").at, other: inSen("lotteries", "other"), k345: inSen("lotteries", "$34.5"), billion: inSen("lotteries", "billion"), stayed: inSen("lotteries", "stayed"), lotteries: inSen("lotteries", "lotteries") }
};
export const RUN_SPAN = { at: sen0("prizes").at, end: HEROES.filter((h) => h.scene === "nobody")[0].paint };
export const runCheck = (place, w) => {
  for (const k of Object.keys(RUN_W[place])) if (Number.isFinite(w[k]) && w[k] !== RUN_W[place][k]) throw new Error(`prizes run: ${place}.${k} is ${w[k]} in Composition but ${RUN_W[place][k]} in the run`);
};
const SPIN0 = 36;
const feedSpeed = (g, k, S) => {
  if (g < k.on) return 0;
  if (g < k.grab) return SPIN0 * rInOut(g, k.on, k.grab);
  if (g < k.grab + 2) return SPIN0;
  if (g < k.grab + 6) return SPIN0 * (1 - 0.8 * Math.sin(Math.PI * (g - k.grab - 2) / 4));
  const v = g < k.grab + 11 ? SPIN0 + (S - SPIN0) * rInOut(g, k.grab + 6, k.grab + 11) : S;
  return v * (1 - rInOut(g, k.gone, k.gone + 12));
};
const feedTable = (on, grab, gone) => {
  const N = 4, F0 = on - 2, F1 = gone + 30;
  const run = (S2) => {
    const tab2 = [0];
    for (let i = 1; i <= (F1 - F0) * N; i++) {
      const g = F0 + (i - 0.5) / N;
      tab2.push(tab2[i - 1] + feedSpeed(g, { on, grab, gone }, S2) / N);
    }
    return tab2;
  };
  const at2 = (tab2, g) => {
    const x = (Math.min(F1, Math.max(F0, g)) - F0) * N, i = Math.floor(x), e = x - i;
    return tab2[i] + ((tab2[Math.min(tab2.length - 1, i + 1)] ?? tab2[i]) - tab2[i]) * e;
  };
  let lo = 10, hi = 120;
  for (let it = 0; it < 40; it++) {
    const S2 = (lo + hi) / 2, tb = run(S2);
    if (at2(tb, gone) - at2(tb, grab) < FEED_D) lo = S2;
    else hi = S2;
  }
  const S = (lo + hi) / 2, tab = run(S);
  return { S, travel: (g) => at2(tab, g), feed: (g) => Math.max(0, at2(tab, g) - at2(tab, grab)) };
};
export const runTimes = (w, span) => {
  const p = w.prizes, l = w.lotteries;
  const grab = l.billion + 1, gone = l.lotteries - 6;
  const t = {
    w,
    span,
    slide: { a: p.paid - 6, b: p.paid + 34 },
    // the two-thirds slides out (547 → 587)
    prizes: { a: p.s0 + 10, b: p.s0 + 20 },
    // PRIZES as the crane settles
    k702: { a: p.k702 - 10, b: p.k702 },
    // $70.2B ON "$70.2"
    k345: { a: l.k345 - 10, b: l.k345 },
    // LOTTERIES $34.5B ON "$34.5"
    lift: { a: l.other - 1, b: l.other + 19 },
    // the third lifts off the floor (634 → 654)
    glide: { a: l.other + 9, b: l.billion - 8 },
    // …glides over the feed mouth (644 → 668)
    motor: { a: l.billion - 4, b: gone + 12 },
    // the motor runs (672 → 718): the cutters, the throat's light
    lower: { a: l.billion - 9, b: grab },
    // the strip comes down onto the teeth (667 → 677)
    grab,
    // the cutters BITE (677): the hitch, the bog (→ 683)
    gone,
    // …and draw it ALL the way in (gone: 706)
    flecks: feedFlecks(grab, gone - 4, 11),
    dial: { a: l.lotteries - 13, b: l.lotteries },
    // the dial spins home ON "lotteries." (699 → 712)
    handle: { a: l.lotteries - 7, b: l.lotteries },
    // the lever turns level ON "lotteries." (705 → 712)
    seam: { a: l.lotteries - 6, b: l.lotteries + 2 },
    // the door's seam and the hood's lamp light (706 → 714)
    travel: { a: l.s0 - 16, dur: 40 },
    // the camera to the safe
    ride: { a: grab - 5, dur: 34 },
    // …riding the strip down into the safe (672 → 706)
    run: feedTable(l.billion - 4, grab, gone)
  };
  if (t.glide.b > t.lower.a + 2) throw new Error("prizes run: the strip must be over the mouth before it comes down");
  if (t.gone > l.lotteries - 4) throw new Error("prizes run: the strip must be all the way in before the lock");
  if (t.ride.a + t.ride.dur > span.end - 20) throw new Error("prizes run: the ride must land before the dive");
  return t;
};
const swing = (t, p = 14, hl = 4) => t <= 0 ? 0 : Math.exp(-Math.LN2 / hl * t) * Math.sin(2 * Math.PI * t / p) / 0.8;
const mainX = (t, g) => MAIN_X0 - RUN.slide * rInOut(g, t.slide.a, t.slide.b) + 5 * swing(g - t.slide.b);
const mainPose = (t, g) => tkPose(mainX(t, g) - MC, 0);
const LIFT = FY - HANG_Y;
const stripAt = (t, g) => {
  let x = STRIP_X0 + (RUN.safeX - STRIP_X0) * rInOut(g, t.glide.a, t.glide.b);
  let base = FY - LIFT * rInOut(g, t.lift.a, t.lift.b) + (TOUCH_Y - HANG_Y) * rInOut(g, t.lower.a, t.lower.b);
  if (g >= t.grab) {
    base = TOUCH_Y + t.run.feed(g);
    const amp = g < t.grab + 7 ? 1.8 : g < t.gone ? 0.7 : 0;
    x += amp * 0.5 * (Math.sin(g * 2.7) + Math.sin(g * 4.3 + 1));
  }
  const roll = -6 * Math.sin(Math.PI * rInOut(g, t.glide.a, t.glide.b));
  return { x, base, roll };
};
const stripCut = (t, g, s) => g >= t.lower.a && s.base > NIP_Y + 0.5 ? NIP_Y - s.base : void 0;
const stripGone = (t, g, s) => g >= t.grab && s.base - TK_H >= NIP_Y - 1;
const feedState = (t, g) => ({
  travel: t.run.travel(g),
  motor: rInOut(g, t.motor.a, t.motor.a + 5) * (1 - rInOut(g, t.gone, t.motor.b)),
  lamp: rInOut(g, t.seam.a + 2, t.seam.b)
});
const dialAt = (t, g) => 540 * rInOut(g, t.dial.a, t.dial.b) - 6 * swing(g - t.dial.b, 8, 2.5);
const handleAt = (t, g) => -32 * (1 - rInOut(g, t.handle.a, t.handle.b)) + 3 * swing(g - t.handle.b, 9, 2.5);
const stripXfOf = (t, g) => {
  const s = stripAt(t, g);
  return xfMul(xfTrans([s.x, s.base - TK_H / 2, 0]), xfMul(xfRotZ(s.roll), xfTrans([-SCU, TK_H / 2, 0])));
};
const SAFE_POSE = tkPose(RUN.safeX, 0);
const at = (x, y, z = TK_D / 2) => {
  const p = worldScr(R, [x, y, z]);
  return { x: p[0], y: p[1] };
};
const shots = (t) => [
  // the arrival (the crane): the two-thirds, the strip beside it
  { a: -9999, z: 0.8, push: 0.02, at: () => at(MAIN_X0 + 60, FY - 520) },
  // ride the two-thirds out to the left
  { a: t.slide.a - 2, dur: 40, z: 0.8, push: 0.02, ride: { a: t.slide.a, b: t.slide.b + 8 }, at: (g) => at(mainX(t, g - 4) + 200, FY - 520) },
  // travel to the third and the safe; ride the third's lift and glide
  { a: t.travel.a, dur: t.travel.dur, z: 0.64, push: 0.02, ride: { a: t.lift.a, b: t.lower.b }, at: (g) => at(1400 + 0.12 * (stripAt(t, g - 6).x - RUN.safeX), FY - 820 + 0.1 * (FY - stripAt(t, g - 6).base)) }
];
const CLOSE = { feet: 1655, top: 476, fill: 0.52, lag: 2, blend: 22, push: 0.015 };
const OY = 883.2 + 110;
const SAFE_SHELL = [...safeCorners(tkPose(RUN.safeX, 0)), ...feedCorners(tkPose(RUN.safeX, 0))];
const scrY = (q) => worldScr(R, q)[1];
const FEET_P = Math.max(...SAFE_SHELL.map(scrY)), HOOD_P = Math.min(...SAFE_SHELL.map(scrY));
const Z_CLOSE = CLOSE.fill * 1920 / (FEET_P - HOOD_P);
const closeRaw = (t, g) => {
  const h = g - CLOSE.lag, s = stripAt(t, h);
  const top = stripGone(t, h, s) ? HOOD_P : Math.min(HOOD_P, ...tkCorners(stripXfOf(t, h), "strip").map(scrY));
  const z = Math.min(Z_CLOSE, (CLOSE.feet - CLOSE.top) / (FEET_P - top)) * (1 + CLOSE.push * rInOut(g, t.gone, t.gone + 60));
  return { ...aim(at(RUN.safeX - 30, FY).x, FEET_P - (CLOSE.feet - OY) / z), z };
};
const camOf = (t) => {
  const base = actionCam(shots(t));
  return (g) => {
    const b = base(g), e = rInOut(g, t.ride.a, t.ride.a + CLOSE.blend);
    if (e <= 0) return b;
    const c = smoothFollow(g, (h) => closeRaw(t, h));
    return { x: b.x + (c.x - b.x) * e, y: b.y + (c.y - b.y) * e, z: b.z + (c.z - b.z) * e };
  };
};
export const runCamWindows = (t) => [...actionCamWindows(shots(t)), { a: t.ride.a, b: t.ride.a + t.ride.dur }, { a: t.ride.a, b: t.ride.a + t.ride.dur }].sort((p, q) => p.a - q.a);
export const runSfx = (t, a, b) => [
  { job: "label", a: t.prizes.a, b: t.prizes.b + 6, vol: 0.4 },
  { job: "obj", a: t.slide.a, b: t.slide.b, k: "io", vol: 0.55 },
  // the two-thirds sliding out
  { job: "land", a: t.slide.b - 3, b: t.slide.b + 3, vol: 0.35 },
  { job: "label", a: t.k702.a, b: t.k702.b + 6, vol: 0.45 },
  { job: "label", a: t.k345.a, b: t.k345.b + 6, vol: 0.45 },
  { job: "obj", a: t.lift.a, b: t.glide.b, k: "io", vol: 0.5 },
  // the third lifting and gliding
  { job: "process", a: t.motor.a, b: t.motor.b, k: "io", vol: 0.55 },
  // the feed's motor: spin-up, the draw, the run-down
  // (integrator, sfxends) the grab is a HIT, not a 6-f mechanism: chainshort was cut at −4 dB at grab + 6 (a dead stop) — a thud decays
  { job: "thud", a: t.grab, b: t.grab + 6, vol: 0.7 },
  // the cutters GRAB the strip (the bite, the bog)
  { job: "mech", a: t.dial.a, b: t.dial.b, vol: 0.45 },
  // the dial spinning home
  { job: "thud", a: t.handle.b, b: t.handle.b + 6, vol: 0.7 },
  // the LOCK ON "lotteries."
  { job: "click", a: t.seam.b - 2, b: t.seam.b, vol: 0.6 }
  // the hood's lamp
].filter((e) => (e.a + e.b) / 2 >= a && (e.a + e.b) / 2 < b);
const PrizesRun = ({ t, place }) => {
  const f = (0,esm.useCurrentFrame)();
  const mp = mainPose(t, f), sx = stripXfOf(t, f), s = stripAt(t, f);
  const overMouth = f >= t.lower.a, cutV = stripCut(t, f, s), gone = stripGone(t, f, s);
  const seam = rInOut(f, t.seam.a, t.seam.b), fs = feedState(t, f);
  const prints = [
    { key: "prizes", text: L("prizes"), row: "sub", on: rOut(f, t.prizes.a, t.prizes.b) },
    { key: "k702", text: usdB1(PRIZES_2024_B), row: "fig", on: rOut(f, t.k702.a, t.k702.b) }
  ];
  const safePrints = [
    { key: "lotteries", text: L("lotteries"), row: "sub", on: rOut(f, t.k345.a, t.k345.b) },
    { key: "k345", text: usdB1(NET_2024_B), row: "fig", on: rOut(f, t.k345.a, t.k345.b) }
  ];
  const lifted = clamp01((FY - s.base) / 200);
  const casters = [{ corners: tkCorners(mp, "main") }, { corners: [...safeCorners(SAFE_POSE), ...feedCorners(SAFE_POSE)] }, ...overMouth ? [] : [{ corners: tkCorners(sx, "strip"), k: 1 - 0.5 * lifted }]];
  const glowV = cutV ?? Math.min(0, NIP_Y - s.base);
  const stripGlow = !gone && overMouth ? { x: sx, u0: TK_STRIP_U[0] + 14, u1: TK_STRIP_U[1] - 4, v0: Math.max(-TK_H, glowV - 150), v1: glowV, w: TK_D / 2 + 0.6 } : void 0;
  const cam = camOf(t);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceRoot, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CamFn, { at: cam, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-leaving": travelling(f, runCamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)(Turn, { at: t.span.at, end: t.span.end, from: -6, to: 4, amp: 0.9, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TkFloor, { id: `pz${place}F`, rig: R, at: { x: 700, z: 0 }, reach: 1700, casters }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TkMain, { id: `pz${place}M`, rig: R, pose: mp, tear: TK_TORN_FULL, prints, glow: 0.5, lit: 1, sheen: 40 + 60 * rInOut(f, t.slide.a, t.slide.b), probe: "the ticket's two-thirds" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(LtSafe, { id: `pz${place}V`, rig: R, pose: SAFE_POSE, prints: safePrints, seam, dial: dialAt(t, f), handle: handleAt(t, f) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(LtFeedBack, { id: `pz${place}Fb`, rig: R, pose: SAFE_POSE, st: fs }),
    !gone && /* @__PURE__ */ (0,jsx_runtime.jsx)(TkStrip, { id: `pz${place}S`, rig: R, pose: sx, tear: TK_TORN_FULL, stripXf: sx, glow: 0.35, cutV, probe: "the ticket's strip" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(LtFeedFront, { id: `pz${place}Ff`, rig: R, pose: SAFE_POSE, st: fs, flecks: t.flecks, g: f, stripGlow })
  ] }) }) }) });
};
export const PrizesPlace = ({ t, place, at: at2, end }) => {
  const f = (0,esm.useCurrentFrame)();
  const own = useOwn();
  if (own.ownEnter && f < at2) return null;
  if (own.ownExit && f >= end) return null;
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(PrizesRun, { t, place });
};
const prizesTrace = (g) => {
  const t = runTimes(RUN_W, RUN_SPAN), c = camOf(t)(g);
  const scr = (q) => {
    const p = worldScr(R, q);
    return [540 + c.z * (p[0] + c.x - 540), 883.2 + c.z * (p[1] + c.y - 883.2) + 110];
  };
  const box = (pts) => {
    const s2 = pts.map(scr);
    return [Math.min(...s2.map((q) => q[0])), Math.min(...s2.map((q) => q[1])), Math.max(...s2.map((q) => q[0])), Math.max(...s2.map((q) => q[1]))].map(Math.round);
  };
  const s = stripAt(t, g);
  return {
    z: +c.z.toFixed(3),
    cam: [Math.round(c.x), Math.round(c.y)],
    main: box(tkCorners(mainPose(t, g), "main")),
    strip: box(tkCorners(stripXfOf(t, g), "strip")),
    safe: box(safeCorners(SAFE_POSE)),
    shell: box(SAFE_SHELL),
    base: Math.round(s.base),
    cut: stripCut(t, g, s),
    gone: stripGone(t, g, s),
    S: +t.run.S.toFixed(2),
    travel: +t.run.travel(g).toFixed(1)
  };
};
