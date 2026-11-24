// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
// ★ V36: this is VIDEO 35's hook (the lottery ticket tear), renamed from hook.tsx so the V36 hook place could take its name. Kept for
//   study only — nothing imports it.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { OUT, clamp01, rIn, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { SALES_2024_B } from "./data_lt";
import { L, ONE_THIRD, usdB1 } from "./data";
import { Turn } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { worldScr, xfApply, xfLerp, xfMul, xfRotX, xfRotY, xfRotZ, xfTrans } from "./tk_rig";
import { TK_D, TK_FLOOR_Y, TK_H, TK_PERF, TkMain, TkStrip, TkWhole, tkCentre, tkCorners, tkPeelXf, tkPose, tkReleaseXf, tkRig } from "./tk_slab";
import { TkFloor } from "./tk_floor";

const RIG = tkRig({ eye: 1300 });
const X = 540;
const POSE = tkPose(X, 0);
const FY = TK_FLOOR_Y;
export const hookTimes = (w, end) => {
  for (const k of ["k1047", "billion", "lottery", "tickets", "year", "about", "third", "never", "prizes"])
    if (!Number.isFinite(w[k])) throw new Error(`hook: the take has no word frame "${k}"`);
  const creep = { a: 0, b: w.year - 16 };
  const rip = { a: creep.b, b: w.about - 8 };
  const rel = { a: rip.b, b: w.about };
  const fly = { a: rel.a + 2, b: w.third + 18 };
  const away = { a: end - 28, b: end + 4 };
  const t = {
    w,
    end,
    creep,
    rip,
    rel,
    fly,
    away,
    fig: { a: w.k1047 - 10, b: w.k1047 },
    // $104.7B ON "$104.7"
    third: { a: w.third - 10, b: w.third },
    // 1/3 ON "third"
    never: { a: w.never - 10, b: w.never },
    // NEVER PAID OUT ON "never"
    climb: { a: w.k1047 + 14, dur: 40 },
    // the camera closes in on the tear once $104.7B has printed (48 → 88)
    back: { a: rel.a - 4, dur: 40 }
    // the camera pulls back to hold both pieces (166 → 206)
  };
  if (rip.a < 120 || rip.a > 160 || rel.b > w.about + 1 || rel.b > w.third - 10)
    throw new Error(`hook: the full rip must start on the 5th second and the strip be free by "About" (${rip.a}, ${rel.b})`);
  if (t.never.b + 30 > away.a) throw new Error(`hook: NEVER PAID OUT must read \u2265 1 s before the strip tumbles away (${t.never.b} vs ${away.a})`);
  return t;
};
const F0 = 0.21;
const TUG_U = [0.09, 0.25, 0.4, 0.535, 0.655, 0.765, 0.86, 0.94];
const TUG_D = [0.026, 0.026, 0.028, 0.03, 0.03, 0.032, 0.034, 0.036];
const STRAIN = 0.02, JUMP = 5;
const tugFrames = (t) => TUG_U.map((u) => Math.round(u * t.rip.a));
const jumpE = (x) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - (1 - x) ** 3;
const kick = (d) => d <= 0 ? 0 : 1 - Math.exp(-d / 4) * Math.cos(2 * Math.PI * d / 9);
const after = (d, hl) => d <= 0 ? 0 : Math.exp(-d / hl);
const preFront = (t, g) => F0 + STRAIN * clamp01(g / t.rip.a) + tugFrames(t).reduce((s, a, i) => s + TUG_D[i] * jumpE((g - a) / JUMP), 0);
const frontAt = (t, g) => {
  const p = preFront(t, Math.min(g, t.rip.a));
  const v = clamp01((g - t.rip.a) / (t.rip.b - t.rip.a)), k = 0.35;
  const run = v < k ? 0.5 * v * v / k / (1 - 0.5 * k) : (v - 0.5 * k) / (1 - 0.5 * k);
  return Math.min(1, p + (1 - p) * run);
};
const frontTrend = (t, g) => F0 + (preFront(t, t.rip.a) - F0) * clamp01(g / t.rip.a);
const tugFlash = (t, g) => Math.min(1, tugFrames(t).reduce((s, a) => s + after(g - a, 5), 0));
const PEEL_REACH = 300;
const LEAN = { at0: 1.55, strain: 0.05, tug: 0.05, rip: 0.15 };
const leanAt = (t, g) => LEAN.at0 + LEAN.strain * clamp01(g / t.rip.a) + tugFrames(t).reduce((s, a) => s + LEAN.tug * kick(g - a), 0) + LEAN.rip * rInOut(g, t.rip.a - 2, t.rip.a + 14);
const tearAt = (t, g) => {
  const front = frontAt(t, g);
  const env = (0.5 + 0.5 * rInOut(g, 0, t.rip.a)) * (1 - rInOut(g, t.rip.a, t.rip.a + 16));
  const shud = tugFrames(t).reduce((s, a) => s + after(g - a, 6) * Math.sin(2 * Math.PI * (g - a) / 5.5), 0);
  const trem = 0.45 * rInOut(g, 70, t.rip.a - 4) * (1 - rInOut(g, t.rip.a - 2, t.rip.a + 10));
  const flex = 2.6 * env * Math.sin((g + 9) / 26 * 2 * Math.PI) + 2.4 * shud + trem * Math.sin(g / 6.5 * 2 * Math.PI);
  const peel = leanAt(t, g) / (1 - Math.exp(-front * TK_H / PEEL_REACH));
  return { front, peel, flex, release: rInOut(g, t.rel.a, t.rel.b) };
};
const SC = tkCentre("strip");
const HANG = { p: [140, -640, 900], yaw: -16 - 3, pitch: -3, roll: 4 };
const freeXf = (k) => xfMul(POSE, xfMul(xfTrans(k.p), xfMul(xfRotY(k.yaw), xfMul(xfRotX(k.pitch), xfMul(xfRotZ(k.roll), xfTrans([-SC[0], -SC[1], -SC[2]]))))));
const relKey = (t) => {
  const tr = { ...tearAt(t, t.rel.b), release: 1 }, x = tkReleaseXf(tr);
  const c = xfApply(x, SC);
  return { p: c, yaw: -34 * tr.peel + tr.flex, pitch: -9 * tr.peel, roll: 0 };
};
const mixK = (a, b, e) => ({ p: [0, 1, 2].map((i) => a.p[i] + (b.p[i] - a.p[i]) * e), yaw: a.yaw + (b.yaw - a.yaw) * e, pitch: a.pitch + (b.pitch - a.pitch) * e, roll: a.roll + (b.roll - a.roll) * e });
const swing = (t, p = 16, hl = 5) => t <= 0 ? 0 : Math.exp(-Math.LN2 / hl * t) * Math.sin(2 * Math.PI * t / p) / 0.8;
const keyAt = (t, g) => {
  const r = relKey(t);
  const e = rInOut(g, t.fly.a, t.fly.b), up = Math.sin(Math.PI * e) * 70;
  let k = mixK(r, HANG, e);
  k = { ...k, p: [k.p[0], k.p[1] - up, k.p[2]], yaw: k.yaw + 5 * swing(g - t.fly.b + 6), roll: k.roll - 2.5 * swing(g - t.fly.b + 4) };
  const h = rInOut(g, t.fly.b - 10, t.fly.b + 20);
  k = { ...k, p: [k.p[0] + h * 6 * Math.sin((g - t.fly.b) / 19), k.p[1] + h * 8 * Math.sin((g - t.fly.b) / 23), k.p[2]], roll: k.roll + h * 1.2 * Math.sin((g - t.fly.b) / 21) };
  const a = clamp01((g - t.away.a) / (t.away.b - t.away.a));
  if (a > 0) {
    const s = a * a;
    k = { p: [k.p[0] + 1100 * s, k.p[1] + 260 * s, k.p[2] - 1700 * s], yaw: k.yaw - 30 * s, pitch: k.pitch + 200 * s, roll: k.roll + 40 * s };
  }
  return k;
};
const stripXfAt = (t, g) => {
  if (g < t.rel.b) return void 0;
  const free = freeXf(keyAt(t, g));
  const att = xfMul(POSE, tkReleaseXf({ ...tearAt(t, t.rel.b), release: 1 }));
  return xfLerp(att, free, rInOut(g, t.rel.b, t.rel.b + 6));
};
const stripOn = (t, g) => 1 - rIn(g, t.away.b - 12, t.away.b);
const at = (x, y, z = TK_D / 2) => {
  const p = worldScr(RIG, [x, y, z]);
  return { x: p[0], y: p[1] };
};
const PX = X + TK_PERF;
const ripY = (t, g) => FY - TK_H + frontAt(t, g) * TK_H;
const HZ = { arrive: 1.35, ride: 1.4, from: 0.86 };
const shots = (t) => [
  // ★ (rev 2) the arrival: ON THE TEAR from frame 0 — the ticket's upper half, the torn top corner and its lit gap right of centre, the
  //   figure's panel left of it (the push is camOf's: fast, from a little farther out)
  { a: -9999, z: HZ.arrive, push: 0.04, at: () => at(PX - 90, FY - TK_H + 368) },
  // once $104.7B has printed: in closer on the tear and ride it down as it advances (its trend — the tugs read against a steady frame;
  //   the top edge, the flap and the figure all stay in frame)
  { a: t.climb.a, dur: t.climb.dur, z: HZ.ride, push: 0.03, ride: { a: t.climb.a, b: t.rip.a }, at: (g) => at(PX - 80, FY - TK_H + 390 + 0.55 * TK_H * (frontTrend(t, g) - F0)) },
  // THE RIP: the camera pulls back down the perforation with the racing front (a beat behind it, so the torn length above reads)
  { a: t.rip.a - 4, dur: 22, z: 1.02, push: 0, ride: { a: t.rip.a, b: t.rip.b }, at: (g) => at(PX - 50, Math.max(FY - TK_H + 420, Math.min(FY - 420, ripY(t, g - 4) - 220))) },
  // the payoff: back to hold both pieces — the two-thirds left, the strip swinging toward the lens on the right
  { a: t.back.a, dur: t.back.dur, z: 0.7, push: 0.035, at: () => at(X + 150, FY - 520) }
];
export const hookCamWindows = (t) => actionCamWindows(shots(t));
const camOf = (t) => {
  const c = actionCam(shots(t));
  return (g) => {
    const k = c(g);
    return { ...k, z: k.z * (HZ.from + (1 - HZ.from) * OUT(clamp01((g + 4) / 64))) };
  };
};
export const hookSfx = (t) => [
  { job: "move", a: 0, b: 30, k: "out", vol: 0.7 },
  // the push-in
  { job: "process", a: 0, b: t.rip.a, vol: 0.24 },
  // the tension under the tugs: the lit perforation's hum
  ...tugFrames(t).map((g, j) => ({ job: "flick", a: g, b: g + JUMP, vol: 0.2 + 0.03 * j })),
  // ★ (rev 2) a small tear on each tug
  { job: "label", a: t.fig.a, b: t.fig.b + 6, vol: 0.45 },
  // $104.7B on the face
  { job: "flick", a: t.rip.a - 4, b: t.rip.b, vol: 1 },
  // THE RIP: the big tear down the perforation
  { job: "verdict", a: t.rel.a - 2, b: t.rel.b + 6, vol: 0.8 },
  // it rips free (the red edge)
  { job: "obj", a: t.fly.a, b: t.fly.b, k: "out", vol: 0.6 },
  // the strip swinging toward the lens
  { job: "label", a: t.third.a, b: t.third.b + 6, vol: 0.45 },
  // 1/3
  { job: "label", a: t.never.a, b: t.never.b + 6, vol: 0.4 },
  // NEVER PAID OUT
  { job: "obj", a: t.away.a, b: t.end - 2, k: "in", vol: 0.45 }
  // the tumble away
];
const hookBloom = (w, end, g) => {
  const t = hookTimes(w, end), p = worldScr(RIG, [PX - 4, FY - TK_H + 6, TK_D / 2]), c = camOf(t)(g);
  return { layer: { x: p[0], y: p[1] }, screen: { x: 540 + c.z * (p[0] + c.x - 540), y: 883.2 + c.z * (p[1] + c.y - 883.2) + 110 } };
};
const hookTrace = (w, end, g) => {
  const t = hookTimes(w, end), c = camOf(t)(g);
  const scr = (q) => {
    const p = worldScr(RIG, q);
    return [540 + c.z * (p[0] + c.x - 540), 883.2 + c.z * (p[1] + c.y - 883.2) + 110];
  };
  const box = (pts) => {
    const s = pts.map(scr);
    return [Math.min(...s.map((q) => q[0])), Math.min(...s.map((q) => q[1])), Math.max(...s.map((q) => q[0])), Math.max(...s.map((q) => q[1]))].map(Math.round);
  };
  const sx = stripXfAt(t, g);
  const strip = sx ? tkCorners(sx, "strip") : tkCorners(xfMul(POSE, tkPeelXf(-TK_H, tearAt(t, g))), "strip");
  return { cam: { x: +c.x.toFixed(1), y: +c.y.toFixed(1), z: +c.z.toFixed(3) }, main: box(tkCorners(POSE, "main")), strip: box(strip) };
};
export const LtHook = ({ at: a0, end, w }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = hookTimes(w, end);
  const tear = tearAt(t, f);
  const sx = stripXfAt(t, f);
  const gq = Math.min(f, t.rip.a), ph = 2 * Math.PI * (gq / 60 + (1 / 22 - 1 / 60) * gq * gq / (2 * t.rip.a) + Math.max(0, f - t.rip.a) / 22);
  const fl = tugFlash(t, f);
  const glow = Math.min(1, 0.8 + 0.1 * rInOut(f, 0, t.rip.a) + 0.06 * Math.sin(ph) + 0.12 * fl) * (1 - 0.35 * rInOut(f, t.rel.a, t.rel.a + 30));
  const red = rOut(f, t.rel.a - 2, t.rel.a + 6) * (1 - rInOut(f, t.never.b + 14, t.away.a + 10));
  const lit = Math.min(1, 0.6 + 0.25 * fl * (1 - rInOut(f, t.rip.a, t.rel.a)) + 0.4 * rInOut(f, t.rel.a + 10, t.fly.b + 10));
  const prints = [{ key: "sales", text: usdB1(SALES_2024_B), row: "fig", on: rInOut(f, t.fig.b - 22, t.fig.b), center: true, grow: true }];
  const sp = [
    { key: "third", text: ONE_THIRD, row: "sfig", on: rOut(f, t.third.a, t.third.b) },
    { key: "never", text: L("neverPaidOut"), row: "slab", on: rOut(f, t.never.a, t.never.b) }
  ];
  const casters = [{ corners: tkCorners(POSE, "main") }, ...sx ? [{ corners: tkCorners(sx, "strip"), k: 0.45 * stripOn(t, f) }] : [{ corners: tkCorners(xfMul(POSE, tkPeelXf(-TK_H / 2, tear)), "strip") }]];
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceRoot, { up: 300, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CamFn, { at: camOf(t), children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-leaving": travelling(f, hookCamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)(Turn, { at: a0, end, from: -6, to: 4, amp: 0.9, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TkFloor, { id: "hkF", rig: RIG, at: { x: X + 60, z: 0 }, reach: 1400, casters }),
    !sx ? /* @__PURE__ */ (0,jsx_runtime.jsx)(TkWhole, { id: "hkT", rig: RIG, pose: POSE, tear, prints: [...prints, ...sp], glow, red, lit, sheen: -120 + 220 * rInOut(f, -10, 90) }) : /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)(TkMain, { id: "hkM", rig: RIG, pose: POSE, tear, prints, glow, lit, sheen: 100, probe: "the ticket's two-thirds" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, opacity: stripOn(t, f) }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(TkStrip, { id: "hkS", rig: RIG, pose: POSE, tear, stripXf: sx, prints: sp, red, probe: "the ticket's strip" }) })
    ] })
  ] }) }) }) });
};
