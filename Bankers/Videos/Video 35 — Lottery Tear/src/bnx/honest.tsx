// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { s3d, travelling } from "./common";
import { L } from "./data";
import { Turn, label } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { worldScr, xfMul, xfPose, xfRotY, xfRotZ, xfScale, xfTrans } from "./tk_rig";
import { TK_FLOOR_Y, TK_H, TK_TORN_FULL, TkStrip, tkCentre, tkCorners, tkRig } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { HS_DIM, HS_WINDOWS, HsSchool, hsCasters } from "./honest_school";
import { HC_DIM, HcCarousel, hcCasters, hcPose } from "./honest_carousel";

const R = tkRig({ eye: 1300, pitch: -4, yaw: 14 });
const FY = TK_FLOOR_Y;
const K = 0.26, SCU = tkCentre("strip")[0];
const SCH = { x: 420, z: 0 };
const SCHOOL = xfPose(SCH.x, FY, SCH.z, 1, 0);
const STRIP = { x: SCH.x - 470, z: 360, from: 700, arc: 46 };
const CAR = { x: SCH.x + 640, z: 230, k: 1.25 };
const CAROUSEL = hcPose(CAR.x, FY, CAR.z, CAR.k);
if (CAR.x - HC_DIM.r * CAR.k < SCH.x + HS_DIM.fw / 2 + 80) throw new Error("honest: the carousel must stand clear of the school");
if (STRIP.z < SCH.z + HS_DIM.flag.w + 100 || TK_H * K > -(HS_DIM.flag.top + 80)) throw new Error("honest: the strip must stand in front of the flagpole, under the flag");
const WORDS = ["states", "share", "schools", "ticket", "buys", "little", "fun"];
export const honestTimes = (w, end) => {
  for (const k of WORDS) if (!Number.isFinite(w[k])) throw new Error(`honest: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    glide: { a: w.states + 4, b: w.schools - 8 },
    // the strip glides in beside the school (1761 → 1790)
    feed: { a: w.schools - 10, every: 1.9, dur: 10 },
    // its light feeds the school: the windows light one by one (1788 → 1823)
    schools: { a: w.schools - 10, b: w.schools },
    // SCHOOLS lights on the frieze ON "schools,"
    bell: { a: w.schools - 4 },
    // the bell swings (a damped ring)
    spin: { a: w.ticket - 6, ramp: 34, deg: 2.3 },
    // the carousel starts to turn (1824), full speed by 1858
    lights: { a: w.buys - 8, b: w.little + 2 },
    // its bulbs come on in a running chase (1832 → 1851)
    fun: { a: w.fun - 10, b: w.fun },
    // A LITTLE FUN ON "fun."
    toFun: { a: w.ticket - 16, dur: 36 }
    // the camera travels to the carousel (1814 → 1850)
  };
  if (t.toFun.a < t.glide.b + 16) throw new Error("honest: the strip must be at rest before the camera leaves the school");
  if (t.fun.a < t.lights.a) throw new Error("honest: the lights come on before A LITTLE FUN");
  return t;
};
const swing = (t, p = 12, hl = 4) => t <= 0 ? 0 : Math.exp(-Math.LN2 / hl * t) * Math.sin(2 * Math.PI * t / p);
const stripAt = (t, g) => {
  const s = 1 - clamp01((g - t.glide.a) / (t.glide.b - t.glide.a)), e = 1 - s * s;
  return { x: STRIP.x - STRIP.from * (1 - e), base: FY - STRIP.arc * Math.pow(1 - e, 1.5), roll: 7 * (1 - e) * (1 - e) - 1.6 * swing(g - t.glide.b) };
};
const stripXfOf = (t, g) => {
  const s = stripAt(t, g);
  return xfMul(xfTrans([s.x, s.base, STRIP.z]), xfMul(xfRotY(6), xfMul(xfRotZ(s.roll), xfMul(xfScale(K), xfTrans([-SCU, 0, 0])))));
};
const WIN_ORDER = HS_WINDOWS.map((_, i) => i);
const winLit = (t, g) => (i) => {
  const a = t.feed.a + 4 + WIN_ORDER.indexOf(i) * t.feed.every;
  return rInOut(g, a, a + t.feed.dur);
};
const feedGlow = (t, g) => rInOut(g, t.feed.a + 6, t.feed.a + 6 + HS_WINDOWS.length * t.feed.every + 6);
const bellAt = (t, g) => {
  const s = g - t.bell.a;
  return s <= 0 ? 0 : 19 * Math.sin(2 * Math.PI * s / 26) * clamp01(s / 8) * Math.exp(-s / 70);
};
const turnAt = (t, g) => {
  let a = 0;
  for (let x = t.spin.a; x < g; x += 1) a += t.spin.deg * rInOut(Math.min(x + 0.5, g), t.spin.a, t.spin.a + t.spin.ramp) * Math.min(1, g - x);
  return a;
};
const at = (x, y, z = 0) => {
  const p = worldScr(R, [x, y, z]);
  return { x: p[0], y: p[1] };
};
const MID_Y = FY - 320;
const TWO = { x: (SCH.x + HS_DIM.flag.u - 137 + CAR.x + HC_DIM.r * CAR.k) / 2, z: 0.7 };
const FUN_K = 1.8 * 1.1 / TWO.z;
const shots = (t) => [
  { a: -9999, z: 1.04, push: 0.02, at: () => at(SCH.x - 120, MID_Y, 160) },
  { a: t.glide.a - 4, dur: 34, z: 1.05, push: 0.02, ride: { a: t.glide.a, b: t.glide.b + 8 }, at: (g) => at(SCH.x - 130 + 0.14 * (stripAt(t, g - 4).x - STRIP.x), MID_Y, 160) },
  { a: t.schools.a - 2, dur: 30, z: 1.12, push: 0.02, at: () => at(SCH.x - 75, MID_Y + 10, 160) },
  // ★ REV3 X3: the travel lands on a TWO-SHOT that holds the whole set — the flag, the torn third, the school and the carousel — so
  //   SCHOOLS is never cut by the frame's edge (it was: "…LS" at the left while the camera held the carousel, 1840–1866)
  { a: t.toFun.a, dur: t.toFun.dur, z: TWO.z, push: 0.02, at: () => at(TWO.x, MID_Y + 40, 200) },
  // ON "fun." done, the camera draws back a little further, the whole set still in frame, as the crane takes the place away
  { a: t.fun.b + 3, dur: 34, z: TWO.z * 0.96, push: 0, at: () => at(TWO.x, MID_Y + 30, 180) }
];
export const honestCamWindows = (t) => actionCamWindows(shots(t));
export const honestSfx = (t) => [
  { job: "obj", a: t.glide.a, b: t.glide.b, k: "io", vol: 0.5 },
  // the strip gliding in
  { job: "land", a: t.glide.b - 3, b: t.glide.b + 3, vol: 0.4 },
  { job: "process", a: t.feed.a + 4, b: t.feed.a + 4 + HS_WINDOWS.length * t.feed.every + t.feed.dur, vol: 0.4 },
  // the windows lighting
  { job: "ping", a: t.bell.a + 4, b: t.bell.a + 8, vol: 0.6 },
  // the bell's ring
  { job: "label", a: t.schools.a, b: t.schools.b + 6, vol: 0.45 },
  { job: "mech", a: t.spin.a, b: t.spin.a + t.spin.ramp, vol: 0.45 },
  // the music box starting to turn
  ...[0, 1, 2].map((k) => {
    const a = Math.round(t.lights.a + k * (t.lights.b - t.lights.a) / 3) + 2;
    return { job: "ping", a, b: a + 2, vol: k === 2 ? 0.6 : 0.45 };
  }),
  { job: "label", a: t.fun.a, b: t.fun.b + 6, vol: 0.45 }
];
export const LtHonest = ({ at: at2, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = honestTimes(w, end);
  const sx = stripXfOf(t, f);
  const prints = [{ key: "schools", text: L("schools"), on: rOut(f, t.schools.a, t.schools.b) }];
  const showCar = f >= t.toFun.a - 30;
  const casters = [...hsCasters(SCHOOL), { corners: tkCorners(sx, "strip"), k: 0.9 }, ...showCar ? hcCasters(CAROUSEL) : []];
  const fed = feedGlow(t, f);
  const fun = rOut(f, t.fun.a, t.fun.b);
  const lp = worldScr(R, [CAR.x, FY + (HC_DIM.top - 34) * CAR.k, CAR.z]);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceRoot, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CamFn, { at: actionCam(shots(t)), children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-leaving": travelling(f, honestCamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)(Turn, { at: at2, end, from: -6, to: 4, amp: 0.9, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TkFloor, { id: "hoF", rig: R, at: { x: SCH.x + 160, z: 60 }, reach: 1400, casters, stage }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TkStrip, { id: "hoS", rig: R, pose: sx, stripXf: sx, tear: TK_TORN_FULL, glow: 0.62 - 0.34 * fed, lod: "hi", probe: "the torn third" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(HsSchool, { id: "hoH", rig: R, pose: SCHOOL, lit: winLit(t, f), glow: fed, bell: bellAt(t, f), clock: (f - t.w.states) / 30, wind: f, prints }),
    showCar && /* @__PURE__ */ (0,jsx_runtime.jsx)(HcCarousel, { id: "hoC", rig: R, pose: CAROUSEL, turn: turnAt(t, f), lights: rInOut(f, t.lights.a, t.lights.b) }),
    fun > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-label": "A LITTLE FUN", style: {
      position: "absolute",
      left: lp[0] - 260,
      top: lp[1] - 46 - 23 * (FUN_K - 1.8),
      width: 520,
      height: 46,
      opacity: clamp01(fun),
      transform: s3d(0, (1 - fun) * 24)
    }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: 0, width: 520, textAlign: "center", ...label(28, "#DCE7F4"), opacity: 0.92, transform: `scale(${FUN_K.toFixed(3)})` }, children: L("aLittleFun") }) })
  ] }) }) }) });
};
