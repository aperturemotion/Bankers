// @ts-nocheck
// ★ V37 "Theranos" — place `hook` (builder H). "A few drops of blood. That was the promise behind a nine billion dollar company."
//   Frame 0: the camera is already rushing in from far out onto a thumb-sized nanotainer (th_tube: clear skirted tube, blue snap
//   cap flipped open on its hinge, the THERANOS label) standing in the key light's pool on a polished steel top; a pen lancet hangs
//   point-down above it and a glossy red drop is ALREADY falling from its needle into the open tube. A second drop swells on the
//   needle, lets go and falls in, then a third ("a few drops"): each sinks into the blood, which rises a little each time (a small
//   ring spreads on its surface — never a splash). The lancet withdraws up out of frame and the cap snaps shut on "promise". On
//   "$9 billion dollar company" — the BIGGEST motion — the camera pulls back hard (a real dolly, ~7×): the steel top turns out to
//   be the top of a towering machined blue-steel plinth, the tiny tube standing on it, and $9 BILLION (hookFigure) eases onto the
//   plinth's panel, fully read on "company", ≥ 1 s before flare 1. The composition's pushLight then carries the frame into flare 1
//   blooming from a glint the light catches on the inlaid rule under $9 (hookFlarePoint, near the push's pivot).
//   Elements: the lancet, the drops, the tube (+ its printed label), the plinth, the figure.  Subtitle-free (BANNER_END).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rIn, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn } from "./kit";
import { HW_FLOOR_Y, HwFloor, hwCam, hwPath } from "./hook_world";
import { HookPlinth, PL, PL_TOP_Y, plinthCorners, plinthGlint } from "./hook_plinth";
import { HookLancet } from "./hook_lancet";
import { TH_TUBE, ThTube, thLevelS } from "./th_tube";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const TX = PL.x, FOOT_Y = PL_TOP_Y;
const FOOT = [TX, FOOT_Y, 0];
// the needle's point: 150 units above the tube's foot (68 above the rim) at rest
const TIP_S = 150;
const F = 3000;
// the drops (tube units): radius, the blood's start, the rise per drop, gravity (units/f²)
const DROP_R = 5.4, FILL0 = 0.2, FILL_STEP = 0.07, G = 0.9;
// a drop falls under gravity up to a terminal speed (slow enough to follow on screen), then sinks slowly into the blood
const VT = 4.6, SINK = 1.5, NECK0 = 0.9;
const S_DET = TIP_S - DROP_R * (1 + 1.6 * NECK0);
const fallD = (tt) => tt <= 0 ? 0 : G * tt < VT ? 0.5 * G * tt * tt : VT * VT / (2 * G) + VT * (tt - VT / G);
const fallT = (d) => d <= VT * VT / (2 * G) ? Math.sqrt(2 * d / G) : VT / G + (d - VT * VT / (2 * G)) / VT;
const KEYS = ["s0", "few", "drops", "blood", "s1", "promise", "k9", "billion", "company"];
export const hookTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`hook: the take has no word frame "${k}"`);
  // three drops: the first already falling on frame 0, the second landing on "blood", the third early in line 2
  const det = [-12, w.blood - 20, w.blood + 5];
  const t = {
    w,
    end,
    push: { a: 0, b: 34 },
    det,
    grow: [null, { a: det[1] - 14, b: det[1] }, { a: det[2] - 14, b: det[2] }],
    // the lancet withdraws up out of frame after the third drop; the cap snaps shut on "promise"
    ret: null,
    cap: { a: w.promise - 12, b: w.promise + 12 },
    // THE PAYOFF: the hard pull back, fastest on "$9 billion"; the figure eases on as it slows, fully read on "company"
    pull: { a: w.k9 - 22, b: w.company + 2 },
    fig: { a: w.billion + 4, b: w.company },
    // then the light turns across the polished letters and catches the inlaid rule: the glint flare 1 blooms from
    sheen: { a: w.company + 4, b: end - 10 },
    glint: { a: end - 18, b: end - 2 }
  };
  t.touch = det.map((d, i) => {
    const L0 = thLevelS(FILL0 + FILL_STEP * i);
    return d + fallT(S_DET - DROP_R - L0);
  });
  t.ret = { a: Math.round(t.touch[2]) + 2, b: Math.round(t.touch[2]) + 32 };
  if (t.touch[2] > t.ret.a) throw new Error("hook: the third drop must land before the lancet withdraws");
  if (t.cap.b > t.pull.a + 8) throw new Error(`hook: the cap must be shut early in the pull back (${t.cap.b} vs ${t.pull.a})`);
  if (t.fig.b + 30 > end - 2) throw new Error(`hook: $9 BILLION must read ≥ 1 s before flare 1 (${t.fig.b} vs peak ${end - 2})`);
  if (t.pull.b > end - 20) throw new Error("hook: the pull back must settle before the push into the flare");
  return t;
};
// ── the camera: a real dolly. Far → close on the tube (push, OUT), a slow creep, then the hard pull back to the plinth ──────────
const CLOSE = { D: 520, pitch: -16, yaw: 12, ty: FOOT_Y - 77 };
const FAR = { D: 1400, pitch: -40, yaw: 4, ty: FOOT_Y - 52 };
const FINAL = { D: 3350, pitch: -8, yaw: 16, ty: 660 };
const lerp = (a, b, e) => a + (b - a) * e;
const plateau = (g, a, b, q = 0.3) => {
  const x = clamp01((g - a) / (b - a)), v = 1 / (1 - q);
  const ramp = (y) => v * (y / 2 - q / (2 * Math.PI) * Math.sin(Math.PI * y / q));
  if (x <= q) return ramp(x);
  if (x >= 1 - q) return 1 - ramp(1 - x);
  return v * (q / 2 + (x - q));
};
const camRaw = (t, g) => {
  const e0 = rOut(g, t.push.a, t.push.b), ec = rInOut(g, t.push.b, t.pull.a), ep = plateau(g, t.pull.a, t.pull.b), ea = rInOut(g, t.pull.b, t.end + 20);
  const Dc = CLOSE.D * (1 - 0.07 * ec);
  let D = Math.exp(lerp(Math.log(FAR.D), Math.log(Dc), e0));
  D = Math.exp(lerp(Math.log(D), Math.log(FINAL.D), ep)) * (1 - 0.045 * ea);
  const pitch = lerp(lerp(FAR.pitch, CLOSE.pitch, e0), FINAL.pitch, ep);
  const yaw = lerp(lerp(FAR.yaw, CLOSE.yaw, e0) - 4 * ec, FINAL.yaw, ep) + 2 * ea;
  const tyC = lerp(FAR.ty, CLOSE.ty, e0);
  if (ep <= 0) return hwCam({ tx: TX, ty: tyC, D, F, pitch, yaw });
  // during the pull the tube's point A slides on screen on the same ease as everything else: solve the target that puts it there
  const A = [TX, CLOSE.ty, 0];
  const fin = hwCam({ tx: TX, ty: FINAL.ty, D: FINAL.D, F, pitch: FINAL.pitch, yaw: FINAL.yaw });
  const want = fin.P(A)[1];
  const cam0 = hwCam({ tx: TX, ty: tyC, D, F, pitch, yaw });
  const y0 = cam0.P(A)[1];
  const goal = lerp(y0, want, ep);
  let lo = tyC, hi = FINAL.ty + 200;
  for (let i = 0; i < 30; i++) {
    const m = (lo + hi) / 2;
    if (hwCam({ tx: TX, ty: m, D, F, pitch, yaw }).P(A)[1] > goal) lo = m;
    else hi = m;
  }
  return hwCam({ tx: TX, ty: (lo + hi) / 2, D, F, pitch, yaw });
};
export const hookCamWindows = (t) => [{ a: t.push.a, b: t.push.b }, { a: t.pull.a, b: t.pull.b }];
export const hookSfx = (t) => [
  // the fast push in from far out (the composition also lays its long woosh from frame 0)
  { job: "move", a: 0, b: t.push.b, k: "out", vol: 0.6 },
  // each drop sinking into the blood: a soft, small ping on its contact frame
  ...t.touch.map((a, i) => ({ job: "ping", a: Math.round(a), vol: 0.55 - 0.05 * i })),
  // the lancet withdrawing up out of frame
  { job: "obj", a: t.ret.a, b: t.ret.b, k: "io", vol: 0.35 },
  // the cap snapping shut
  { job: "click", a: t.cap.b, vol: 1.1 },
  // THE PULL BACK (the biggest motion) and the weight of the reveal as $9 BILLION lands
  { job: "move", a: t.pull.a, b: t.pull.b, k: "io", vol: 1.15 },
  { job: "label", a: t.fig.a, b: t.fig.b + 6, vol: 0.45 },
  { job: "verdict", a: t.fig.b - 18, b: t.fig.b, k: "io", vol: 0.55 },
  // the glint catching the rule
  { job: "ping", a: t.glint.a + 6, vol: 0.4 }
];
// ── the drops and the blood ──────────────────────────────────────────────────────────────────────────────────────────────
const fillAt = (t, g) => FILL0 + t.touch.reduce((a, tc) => a + FILL_STEP * rInOut(g, tc, tc + 10), 0);
const dropsAt = (t, g) => {
  const out = [];
  t.det.forEach((d, i) => {
    if (g < d) {
      const gr = t.grow[i];
      if (!gr || g < gr.a) return;
      const k = rOut(g, gr.a, gr.b), r = DROP_R * Math.sqrt(Math.max(0.02, k)), neck = 0.25 + 0.65 * k;
      out.push({ s: TIP_S - r * (1 + 1.6 * neck), r, neck, stretch: 0 });
      return;
    }
    const tt = g - d, neck = NECK0 * (1 - clamp01(tt / 3)), tc = t.touch[i] - d;
    const s = tt < tc ? S_DET - fallD(tt) : S_DET - fallD(tc) - SINK * (tt - tc);
    const L = thLevelS(fillAt(t, g));
    if (s + DROP_R < L - 0.5) return;
    out.push({ s, r: DROP_R, neck, stretch: tt < tc ? clamp01(G * tt / VT) * 0.6 : 0.6 * clamp01(1 - (tt - tc) / 4) });
  });
  return out;
};
const rippleAt = (t, g) => {
  const tc = t.touch.find((c) => g >= c && g < c + 18);
  return tc === void 0 ? null : { k: (g - tc) / 18 };
};
/** the flare-1 source: the glint on the inlaid rule under $9 (near the push's pivot, so it stays put as the frame pushes in) at frame g — place coordinates, and the composed screen point
 *  (the composition's DROP 110 and its pushLight scale about the pivot applied; its slow parallax drift is not) */
export const hookFlarePoint = (w, end, g = end - 2) => {
  const t = hookTimes(w, end), cam = camRaw(t, g);
  const p = cam.P(plinthGlint());
  const sc = 1 + 0.9 * rIn(g, end - 18, end + 2);
  return { place: { x: p[0], y: p[1] }, screen: { x: 540 + sc * (p[0] - 540), y: 110 + 883 + sc * (p[1] - 883) } };
};
export const BxHook = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = hookTimes(w, end);
  const cam = camRaw(t, f);
  const rv = rInOut(f, t.pull.a - 6, t.pull.a + 30);
  // the studio light: the top in the key light's pool; down the tower it falls off, dark until the pull reveals it
  const fall = (y) => y < PL.neck.y1 ? 1 : (0.22 + 0.78 * rv) * (1 - 0.3 * clamp01((y - PL.neck.y1) / 1100));
  const foot = cam.P(FOOT), kf = cam.K(FOOT), vz = cam.V(FOOT)[2];
  const lift = -520 * rInOut(f, t.ret.a, t.ret.b);
  const tip = [TX, FOOT_Y - TIP_S + lift, 0];
  const open = 1 - rInOut(f, t.cap.a, t.cap.b);
  const fill = fillAt(t, f);
  const figOn = rInOut(f, t.fig.a, t.fig.b);
  // the key light's pool on the polished top, the tube's soft contact shadow (leaning away from the light)
  const ringAt = (r, dx = 0, dz = 0, y = PL.top.y0 - 0.2) => Array.from({ length: 48 }, (_, i) => [TX + dx + r * Math.cos(i / 48 * 2 * Math.PI), y, dz + r * Math.sin(i / 48 * 2 * Math.PI)]);
  const poolC = cam.P([TX, PL.top.y0, 0]), poolR = 210 * cam.K([TX, PL.top.y0, 0]);
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: () => ({ x: 0, y: 0, z: 1 }), children: jsx("div", { "data-probe-leaving": travelling(f, hookCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -2.5, to: 2, amp: 0.5, children: [
    jsx(HwFloor, { id: "hkF", cam, at: { x: TX, z: 60 }, reach: 1500, casters: [{ corners: plinthCorners() }], stage, on: rv }),
    // ONE construction: the tube stands on the plinth (its label sits over the plinth's top face by design). The hook is
    //   caption-free until BANNER_END (no chip shows while it plays), so the lancet and the tube may stand above the band.
    jsxs("div", { "data-probe-object": "the nanotainer standing on the towering machined plinth ($9 BILLION panel), the lancet and the drops", "data-probe-headroom-ok": "the hook is caption-free (BANNER_END): no chip shows while the lancet and the tube stand above the band", style: { position: "absolute", inset: 0 }, children: [
      jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
        jsx(HookPlinth, { id: "hkP", cam, fall, fig: L("hookFigure"), figOn, stage, sheen: -1 + 2 * rInOut(f, t.sheen.a, t.sheen.b), glint: rInOut(f, t.glint.a, t.glint.b) }),
        jsxs("defs", { children: [jsxs("radialGradient", { id: "hkPool", gradientUnits: "userSpaceOnUse", cx: f2(poolC[0]), cy: f2(poolC[1]), r: f2(poolR), gradientTransform: `translate(${f2(poolC[0])} ${f2(poolC[1])}) scale(1 ${Math.max(0.05, Math.abs(Math.sin(cam.pitch * Math.PI / 180))).toFixed(4)}) translate(${f2(-poolC[0])} ${f2(-poolC[1])})`, children: [
          jsx("stop", { offset: "0", stopColor: "#CFE0F5", stopOpacity: 0.34 }),
          jsx("stop", { offset: "0.5", stopColor: "#9FC0E6", stopOpacity: 0.12 }),
          jsx("stop", { offset: "1", stopColor: "#9FC0E6", stopOpacity: 0 })
        ] })] }),
        jsx("path", { d: hwPath(cam, ringAt(200)), fill: "url(#hkPool)" }),
        [30, 26, 23].map((r, i) => jsx("path", { d: hwPath(cam, ringAt(r, 9, -11, PL.seat.y0 - 0.1)), fill: "#020812", opacity: 0.1 + 0.06 * i }, i))
      ] }),
      jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      // its reflection in the polished top: the tube seen from the mirrored eye, flipped about its foot, fading away from it
      jsxs("defs", { children: [jsxs("linearGradient", { id: "hkRf", gradientUnits: "userSpaceOnUse", x1: 0, y1: f2(foot[1]), x2: 0, y2: f2(foot[1] + 70 * kf * Math.abs(Math.sin(cam.pitch * Math.PI / 180)) + 8), children: [
        jsx("stop", { offset: "0", stopColor: "#FFFFFF", stopOpacity: 0.32 }),
        jsx("stop", { offset: "1", stopColor: "#FFFFFF", stopOpacity: 0 })
      ] }), jsx("mask", { id: "hkRm", maskUnits: "userSpaceOnUse", x: -2000, y: -2000, width: 6000, height: 6000, children: jsx("rect", { x: -2000, y: f2(foot[1]), width: 6000, height: 4000, fill: "url(#hkRf)" }) })] }),
      jsx("g", { mask: "url(#hkRm)", children: jsx("g", { transform: `translate(0 ${f2(2 * foot[1])}) scale(1 -1)`, children: jsx(ThTube, { id: "hkTr", x: foot[0], y: foot[1], scale: kf, pitch: -cam.pitch, yaw: cam.yaw, persp: Math.max(50, cam.D - vz), fill, open, label: L("hookTube") }) }) }),
      jsx(ThTube, { id: "hkT", x: foot[0], y: foot[1], scale: kf, pitch: cam.pitch, yaw: cam.yaw, persp: Math.max(50, cam.D - vz), fill, open, label: L("hookTube"), drops: dropsAt(t, f), ripple: rippleAt(t, f), stage }),
      f < t.ret.b + 2 && jsx(HookLancet, { cam, tip })
    ] })
    ] })
  ] }) }) }) });
};
