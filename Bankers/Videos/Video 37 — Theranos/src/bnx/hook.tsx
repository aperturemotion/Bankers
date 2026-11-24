// @ts-nocheck
// ★ V36 "Bre-X Gold" — place `hook` (builder H). "Gold dust, sprinkled into rock samples. That's all it took to build a six billion
//   dollar company."
//   Frame 0: far out over a galvanised core tray of four rows of grey drill core, a fine stream of gold dust ALREADY falling onto the
//   front row; the camera pushes in fast onto the stream and rides along the core with it as the sprinkle travels the run, the dust
//   settling into the stone and its skin starting to glitter ("sprinkled into rock samples"). On "That's all it took" the camera eases
//   back to the whole glittering run; on "to build" the core RISES straight out of its row, and through "six billion dollar" it turns
//   upright and SWELLS into a towering cast gold bar (the biggest motion), standing by "company" and dropping onto its foot in front
//   of the tray, stamped C$6 BILLION (hookFigure, read as it stands), PEAK VALUE (hookLabel) under it on "company".
//   ★ (integrator, popscan): the swing is spread so no visible part moves faster than ~41 px/f on screen (hookMotionProbe). The bar holds ≥ 1 s, then the composition's
//   pushLight carries the frame into flare 1 at the bar's lit crown (hookFlarePoint).
//   Objects: the tray, the core → bar, the dust stream (+ the figure and one label).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { OUT, clamp01, mix, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling, aim } from "./common";
import { L } from "./data";
import { Turn, label } from "./kit";
import { worldScr, xfApply, xfMul, xfRotZ, xfTrans } from "./tk_rig";
import { TkFloor } from "./tk_floor";
import { BX_FLOOR_Y, BxTray, CORE_LEN, CORE_R, bxRig, coreXf, trayCoreY, trayCorners, trayRowZ, trayWidth } from "./bx_core";
import { BAR, BarBody, BarStamp, barCorners, barDims, barPoint } from "./bx_bar";
import { DustRidge, HookDust, dustFront, fallFrames } from "./hook_dust";
import { HookVial, VIAL } from "./hook_vial";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const FY = BX_FLOOR_Y;
const ROWS = 4, HERO = 3;
const TX = 540, TZ = 0;
const TRAY_XF = xfTrans([TX, FY, TZ]);
const Z0 = TZ + trayRowZ(HERO, ROWS);
const Y0 = trayCoreY;
// the bar lands on the floor in front of the tray's front wall
const ZB = TZ + trayWidth(ROWS) / 2 + BAR.T / 2 + 50;
const YB = -BAR.H / 2;
const LIFT = 700;
// the dust falls from the vial's mouth, 300 units above the core's top (under the caption band at the ride's framing)
const DROP_H = 300;
const KEYS = ["s0", "gold", "dust", "sprinkled", "rock", "samples", "s1", "took", "build", "k6", "billion", "company"];
export const hookTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`hook: the take has no word frame "${k}"`);
  // ★ (integrator, popscan): the swing is SPREAD so no visible part of the bar moves faster than the pop scan can follow
  //   (≤ ~45 px/f at full size; measured with hookMotionProbe): a sine-eased rise on "to build", the turn upright over 36 f
  //   centred on "billion", the drop onto its foot after "company"'s onset. The rise peaks before the turn does.
  // (rev 1, the take): the turn ends as early as needed for the figure to read ≥ 30 f before flare 1's peak (end − 2); the rise
  //   starts 16 f before the turn, as measured for the ≤ 45 px/f pop-scan limit (same durations, same overlap)
  const rotB = Math.min(w.k6 + 30, end - 34);
  const rot = { a: rotB - 36, b: rotB };
  const lift = { a: rot.a - 16, b: rot.a + 8 };
  const apex = rot.b - 4, land = rot.b + 5;
  const t = {
    w,
    end,
    // the sprinkle: emitted from before frame 0 (already falling), its source travelling the run, stopping after "samples"
    emit: { a: -44, b: w.samples + 14 },
    run: { a: 0.07, b: 0.9 },
    push: { a: 0, dur: 34 },
    // ease back to the whole glittering run on "That's all it took", the skin brightening to full
    back: { a: w.took - 16, dur: 32 },
    glow: { a: w.s1 - 6, b: w.build - 4 },
    lift,
    rot,
    apex,
    land,
    // the camera follows the rise and settles on the towering bar
    rise: { a: lift.a - 4, dur: rot.b - lift.a },
    // then in onto the standing bar as it drops onto its foot
    settle: { a: rot.b - 12, dur: 30 },
    // C$6 BILLION eases in as the face forms through the turn, fully read as the bar stands (≥ 30 f before flare 1's peak)
    fig: { a: rot.b - 22, b: rot.b },
    // the vial: pouring while the dust is emitted, then turning its mouth up and sliding away along the run, out of frame
    vial: { up: { a: w.samples + 8, b: w.samples + 30 }, away: w.samples + 23 },
    label: { a: w.company - 14, b: w.company }
  };
  if (t.fig.b + 30 > end - 2) throw new Error(`hook: C$6 BILLION must read ≥ 1 s before flare 1 (${t.fig.b} vs peak ${end - 2})`);
  if (t.land > end - 26) throw new Error(`hook: the bar must land before the push into the flare (${t.land} vs ${end - 22})`);
  if (t.back.a < t.push.a + t.push.dur + 10) throw new Error("hook: the ride needs its own stretch before the ease-back");
  return t;
};
const srcU = (t) => (g) => {
  const s = clamp01((g - t.emit.a) / (t.emit.b - t.emit.a));
  return t.run.a + (t.run.b - t.run.a) * (0.25 * s + 0.75 * (s - Math.sin(2 * Math.PI * s) / (2 * Math.PI)));
};
// the rig: looking down into the tray, rising to a near-level view of the standing bar
const rigAt = (t, g) => {
  const p = rInOut(g, t.lift.a - 6, t.rot.b + 6);
  return bxRig({ cx: 540, cy: mix(FY - 260, FY - 560, p), yaw: mix(-17, -12, p), pitch: mix(-31, -14, p), lens: 3200 });
};
const rSine = (g, a, b) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01((g - a) / (b - a)));
const heroAt = (t, g) => {
  const eL = rSine(g, t.lift.a, t.lift.b);
  let cy = Y0 - LIFT * eL;
  if (g > t.apex) {
    const ya = Y0 - LIFT * rSine(t.apex, t.lift.a, t.lift.b), tau = Math.min(g, t.land) - t.apex, D = t.land - t.apex;
    cy = ya + (YB - ya) * (tau / D) ** 2;
  }
  const e = rSine(g, t.rot.a, t.rot.b);
  const z = Z0 + (ZB - Z0) * e;
  return { xf: xfMul(xfTrans([TX, FY + cy, z]), xfRotZ(-90 * (1 - e))), m: e, lift: Y0 - cy, cy, e };
};
const scr = (t, g, q) => {
  const p = worldScr(rigAt(t, g), q);
  return { x: p[0], y: p[1] };
};
const coreAt = (u) => [TX - CORE_LEN / 2 + u * CORE_LEN, FY + Y0 - CORE_R, Z0];
const HZ = { far: 0.56, ride: 2.15, back: 0.86, swing: 0.64, bar: 0.76 };
// the camera: focuses blended in order, z interpolated geometrically (the zoom RATE eased), the push-in on OUT (fast from frame 0)
const shots = (t) => {
  const T = fallFrames(DROP_H), u = srcU(t);
  return [
    { a: -9999, z: HZ.far, at: (g) => {
      const p = scr(t, g, [TX, FY - 40, TZ]);
      return { x: p.x, y: p.y - 120 };
    } },
    { a: t.push.a, dur: t.push.dur, z: HZ.ride, ease: "out", ride: { a: t.push.a, b: t.back.a }, at: (g) => {
      const p = scr(t, g, coreAt(u(Math.min(g, t.emit.b) - T)));
      return { x: p.x + 40, y: p.y - 150 };
    } },
    { a: t.back.a, dur: t.back.dur, z: HZ.back, push: 0.035, at: (g) => scr(t, g, [TX + 40, FY - 60, Z0 - 40]) },
    // wide enough through the swing that its ends stay within the pop scan's reach (≤ ~45 px/f)
    { a: t.rise.a, dur: t.rise.dur, z: HZ.swing, push: 0, at: (g) => {
      const p = scr(t, g, [TX, FY - BAR.H * 0.56, ZB]);
      return { x: p.x + 10, y: p.y };
    } },
    { a: t.settle.a, dur: t.settle.dur, z: HZ.bar, push: 0.03, at: (g) => {
      const p = scr(t, g, [TX, FY - BAR.H * 0.53, ZB]);
      return { x: p.x + 10, y: p.y };
    } }
  ];
};
const EASE = { out: OUT };
const camOf = (t) => {
  const S = shots(t);
  const raw = (g) => {
    const s0 = S[0];
    let p = s0.at(g), x = p.x, y = p.y, lz = Math.log(s0.z);
    for (let i = 1; i < S.length; i++) {
      const s = S[i], d = s.dur ?? 40;
      const x01 = clamp01((g - s.a) / d);
      const e = s.ease === "out" ? OUT(x01) : rInOut(g, s.a, s.a + d);
      if (e <= 0) break;
      const q = s.at(g);
      const z = s.z * (1 + (s.push ?? 0) * rInOut(g, s.a + d, s.a + d + 150));
      x += (q.x - x) * e;
      y += (q.y - y) * e;
      lz += (Math.log(z) - lz) * e;
    }
    return { ...aim(x, y), z: Math.exp(lz) };
  };
  // (no smoothing filter: every focus is an eased blend of smooth paths, and frame 0 must be exactly the far framing)
  return raw;
};
export const hookCamWindows = (t) => [
  ...shots(t).slice(1).map((s) => ({ a: s.a, b: s.a + (s.dur ?? 40) })),
  ...shots(t).filter((s) => s.ride).map((s) => ({ a: s.ride.a, b: s.ride.b }))
].sort((p, q) => p.a - q.a);
export const hookSfx = (t) => [
  // the fast push-in from far out
  { job: "move", a: 0, b: 30, k: "out", vol: 0.7 },
  // the gold dust trickling onto the stone (★ the pack has no sand/dust trickle: Falling Coins, quiet, stands in — see the handback)
  { job: "coin", a: 2, vol: 0.32 },
  // the camera riding the core with the sprinkle (its own soft air under the ride, after the push's whoosh has gone)
  { job: "move", a: t.push.a + t.push.dur, b: t.back.a, k: "io", vol: 0.5 },
  // the dust still landing and the skin starting to glitter: two quieter passes of the same stand-in
  { job: "coin", a: t.push.a + t.push.dur - 4, vol: 0.24 },
  { job: "coin", a: Math.round((t.push.a + t.push.dur + t.back.a) / 2) + 2, vol: 0.2 },
  // the vial turns its mouth up and slides away along the run
  { job: "obj", a: t.vial.away, b: t.vial.away + 22, k: "in", vol: 0.32 },
  // the core rises straight out of its row
  { job: "obj", a: t.lift.a, b: t.lift.b, k: "out", vol: 0.75 },
  // it turns upright and swells into the bar
  { job: "obj", a: t.rot.a, b: t.rot.b, k: "io", vol: 0.6 },
  // C$6 BILLION eases onto the face
  { job: "label", a: t.fig.a, b: t.fig.b + 6, vol: 0.45 },
  // the bar drops onto its foot: the weight
  { job: "thud", a: t.land, vol: 0.9 },
  { job: "land", a: t.land - 4, b: t.land + 2, vol: 0.7 },
  // PEAK VALUE
  { job: "label", a: t.label.a, b: t.label.b + 6, vol: 0.4 }
];
// the other three rows: real runs, broken where the rock broke (run blocks mark the breaks)
const ROW_CORES = [
  { seed: 11, pieces: [[0, 0.17, "saw", "break"], [0.172, 0.43, "break", "break"], [0.433, 0.7, "break", "block"], [0.725, 1, "saw", "saw"]] },
  { seed: 23, pieces: [[0, 0.31, "saw", "break"], [0.313, 0.55, "break", "break"], [0.553, 0.84, "break", "break"], [0.843, 1, "break", "saw"]] },
  { seed: 37, pieces: [[0, 0.24, "saw", "block"], [0.265, 0.62, "saw", "break"], [0.622, 1, "break", "saw"]] }
];
const SRC = { r: CORE_R, len: CORE_LEN, kind: "rock" };
/** the flare-1 source: the bar's lit crown in place coordinates and on screen (camera applied; the composition's DROP, pushLight
 *  scale and stage parallax are added by the caller — see the handback for the composed screen point at the peak) */
export const hookFlarePoint = (w, end, g) => {
  const t = hookTimes(w, end), h = heroAt(t, g), p = worldScr(rigAt(t, g), barPoint(h.xf, "crown", h.m, SRC)), c = camOf(t)(g);
  return { place: { x: p[0], y: p[1] }, cam: { x: 540 + c.z * (p[0] + c.x - 540), y: 883.2 + c.z * (p[1] + c.y - 883.2) } };
};
/** motion check: screen points (camera applied, place coords) on the core/bar's hull and the tray's corners at frame g — the
 *  per-frame displacement of these is the on-screen speed the pop scan must be able to follow (≤ ~45 px/f at full size) */
export const hookMotionProbe = (w, end, g) => {
  const t = hookTimes(w, end), h = heroAt(t, g), rig = rigAt(t, g), c = camOf(t)(g), d = barDims(h.m, SRC);
  const W2 = d.qb + d.c, T2 = d.qh + d.c, pts = [];
  for (const fy of [-0.5, -0.375, -0.25, -0.125, 0, 0.125, 0.25, 0.375, 0.5]) for (const [x, z] of [[-W2, -T2], [W2, -T2], [-W2, T2], [W2, T2]]) pts.push(xfApply(h.xf, [x, fy * d.len, z]));
  pts.push(...trayCorners(TRAY_XF, ROWS));
  // the vial's mouth and bottom
  const v = vialAt(t, g);
  pts.push(v.mouth, [v.mouth[0] + v.axis[0] * VIAL.L, v.mouth[1] + v.axis[1] * VIAL.L, v.mouth[2] + v.axis[2] * VIAL.L]);
  return pts.map((q) => {
    const p = worldScr(rig, q);
    return [540 + c.z * (p[0] + c.x - 540), 883.2 + c.z * (p[1] + c.y - 883.2)];
  });
};
/** clearance check: the lowest world y of the core/bar's hull vs the tray top (while over it) / the floor; > 0 = clear */
export const hookClearance = (w, end, g) => {
  const t = hookTimes(w, end), h = heroAt(t, g), d = barDims(h.m, SRC);
  const W2 = d.qb + d.c, T2 = d.qh + d.c;
  let low = -Infinity, back = Infinity;
  for (const fy of [-0.5, 0.5]) for (const [x, z] of [[-W2, -T2], [W2, -T2], [-W2, T2], [W2, T2]]) {
    const q = xfApply(h.xf, [x, fy * d.len, z]);
    low = Math.max(low, q[1]);
    back = Math.min(back, q[2]);
  }
  const overTray = back < TZ + trayWidth(ROWS) / 2 + 4;
  return (overTray ? FY - 60 : FY) - low + (h.lift < 70 ? 1e4 : 0);
};
// the vial's pose: its mouth above the stream's source, tilted mouth-down and tapped while it pours; then mouth up, then away
const vialAt = (t, g) => {
  const u = srcU(t)(Math.min(g, t.emit.b));
  const restXf = xfMul(TRAY_XF, coreXf(0, trayCoreY, trayRowZ(HERO, ROWS)));
  let mouth = xfApply(restXf, [CORE_R + DROP_H, -CORE_LEN / 2 + u * CORE_LEN, 0]);
  const tap = Math.sin(g * 0.9) * 2.5 * (1 - rInOut(g, t.vial.up.a - 4, t.vial.up.a));
  const up = rInOut(g, t.vial.up.a, t.vial.up.b);
  // the tilt (degrees from straight down): 62° pouring → 150° mouth up
  const tilt = (62 + tap + 58 * up) * Math.PI / 180;
  const axis = [Math.sin(tilt) * 0.97, -Math.cos(tilt), 0.24 * Math.sin(tilt)];
  const al = Math.hypot(...axis);
  // the slide away along the run (+x): a soft start to ≈ 20 units/f (≤ 45 px/f on screen at the ride's zoom), then — once out of
  //   the frame — on and away fast so the wider framings never see it again
  const e = g - t.vial.away;
  const dx = e <= 0 ? 0 : e < 8 ? 20 * e * e / 16 : 80 + 20 * (e - 8) + (e > 14 ? 9 * (e - 14) ** 2 : 0);
  mouth = [mouth[0] + dx, mouth[1] - 0.25 * dx, mouth[2]];
  const fill = 0.62 - 0.32 * clamp01((g - t.emit.a) / (t.emit.b - t.emit.a));
  return { mouth, axis: axis.map((v) => v / al), fill };
};
export const BxHook = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = hookTimes(w, end);
  const rig = rigAt(t, f);
  const h = heroAt(t, f);
  const u = srcU(t);
  const T = fallFrames(DROP_H);
  const front = dustFront(u, t.emit, f, DROP_H);
  const glitter = 0.72 * rOut(f, t.emit.a + T, t.emit.a + T + 40) + 0.28 * rInOut(f, t.glow.a, t.glow.b);
  const restXf = xfMul(TRAY_XF, coreXf(0, trayCoreY, trayRowZ(HERO, ROWS)));
  const inTray = h.lift < 70;
  const gild = 0.5 * rInOut(f, t.glow.a, t.glow.b) + 0.5 * rInOut(f, t.lift.a - 4, t.rot.a + 6);
  const gold = rInOut(f, t.rot.a + 2, t.rot.a + 22);
  // after the landing the studio's sheen slides across the face (the bar keeps moving while it holds)
  const sweepK = rInOut(f, t.land - 6, t.end);
  const heroBody = (key) => jsx(BarBody, { id: `hkB${key}`, rig, xf: h.xf, m: h.m, gold, gild, src: SRC, glitter, dust: front, sparkle: f, seed: 5, sheen: -0.9 + 1.5 * sweepK }, key);
  const cores = ROW_CORES.map((c) => ({ ...c, sparkle: f }));
  cores.splice(HERO, 0, { seed: 5, lift: h.lift });
  const ridgeOp = 1 - rInOut(f, t.lift.a, t.lift.a + 10);
  const casters = [{ corners: trayCorners(TRAY_XF, ROWS) }, { corners: barCorners(h.xf, h.m, SRC), k: rOut(f, t.rot.a, t.land) }];
  // the label under the bar's foot (it lands on "company")
  const lab = rOut(f, t.label.a, t.label.b);
  const lp = worldScr(rig, [TX, FY + 70, ZB + BAR.T / 2]);
  return jsx(PlaceRoot, { up: 300, children: jsx(CamFn, { at: camOf(t), children: jsx("div", { "data-probe-leaving": travelling(f, hookCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -5, to: 3, amp: 0.7, children: [
    jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(TkFloor, { id: "hkF", rig, at: { x: TX, z: TZ + 120 }, reach: 1500, casters, stage }) }),
    jsxs("div", { "data-probe-object": "the core tray with its drill cores; the front core rising and swelling into the stamped gold bar", style: { position: "absolute", inset: 0 }, children: [
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsx(BxTray, { id: "hkT", rig, xf: TRAY_XF, rows: ROWS, cores, hero: HERO, probe: null, heroEl: inTray ? () => heroBody("in") : null }),
      ridgeOp > 1e-3 && jsx(DustRidge, { rig, map: (q) => xfApply(restXf, q), len: CORE_LEN, r: CORE_R, span: front, op: ridgeOp, seed: 2 }),
      !inTray && heroBody("out"),
      jsx(HookDust, { rig, map: (q) => xfApply(restXf, q), len: CORE_LEN, r: CORE_R, src: u, emit: t.emit, height: DROP_H, seed: 4, g: f }),
      f < t.vial.away + 60 && jsx(HookVial, { rig, ...vialAt(t, f), g: f })
    ] }),
    jsx(BarStamp, { rig, xf: h.xf, m: h.m, src: SRC, fig: { text: L("hookFigure"), on: rInOut(f, t.fig.a, t.fig.b) } })
    ] }),
    lab > 3e-3 && jsx("div", { "data-probe-label": "PEAK VALUE", style: { position: "absolute", left: lp[0] - 300, top: lp[1], width: 600, height: 50, opacity: clamp01(lab), transform: `translateY(${((1 - lab) * 24).toFixed(2)}px)` }, children: jsx("div", { style: { position: "absolute", left: 0, top: 0, width: 600, textAlign: "center", ...label(30, "#DCE7F4"), opacity: 0.92, transform: "scale(1.85)" }, children: L("hookLabel") }) })
  ] }) }) }) });
};
