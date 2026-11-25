// @ts-nocheck
// ★ V37 "Theranos" — place WHISTLE (builder H, REV1: Timur "fully change the visuals … more connected to the voiceover").
//   "One whistleblower was Tyler Shultz, a board member's grandson."  The line, enacted: THE WHISTLE.
//   On a strip of the lacquered board table a chrome pea whistle lies on its back under the key light, its steel tag and navy
//   lanyard beside it. On "whistleblower" it RISES into the light, turning upright to face us, and BLOWS: three crisp rings of
//   light pulse out of its escape window, the pea rattles inside, a sheen runs across the chrome. Its tag swings free as it rises;
//   on "Tyler Shultz" the engraving TYLER SHULTZ · EMPLOYEE (whistleName / whistleRole) fills and a light crosses the steel. On
//   "a board member's" the camera eases back to the table beside it: Shultz's brass SHULTZ nameplate (builder M's NamePlate, the
//   boardroom's own object), its letters filling on "board"; on "grandson" a lit line draws from the tag to the nameplate and
//   GRANDSON (whistleLink) lands on it. Enters panFromR, exits panR (the composition's slides).
//   Objects: the whistle (+ tag, lanyard), the nameplate, the table.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn, figure } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { worldScr, xfApply, xfDir, xfPose } from "./tk_rig";
import { TK_FLOOR_Y } from "./tk_slab";
import { NP, NamePlate, PlateReflection, plateAt } from "./backers_plate";
import { BoardTable, Lanyard, SplitRing, TAG, Tag, WH, Whistle, tagAt, tagFrame, whistleLug, whistleWindow, whistleXf } from "./whistle_parts";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const TOP = TK_FLOOR_Y - 500;
const RIG = { cx: 540, cy: TOP - 160, persp: 2600, yaw: 12, pitch: -30 };
const W_AT = { x: 730, z: 60 };
const PLATE_POSE = xfPose(-170, TOP, -140, 1.25, 14);
const KEYS = ["s0", "whistleblower", "tyler", "shultz", "board", "grandson"];
export const whistleTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`whistle: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // the whistle rises into the light and turns upright on "whistleblower", then blows: three rings, the pea rattling
    rise: { a: w.whistleblower - 6, b: w.whistleblower + 20 },
    blow: { a: w.whistleblower + 14, b: w.whistleblower + 40 },
    rings: [0, 7, 14].map((d) => w.whistleblower + 14 + d),
    // TYLER SHULTZ · EMPLOYEE fills on the tag, read by "Shultz"; a light crosses the steel
    name: { a: w.tyler - 10, b: w.tyler + 6 },
    gleam: { a: w.tyler - 4, b: w.shultz + 18 },
    // the camera eases back to the nameplate on "board member's"; SHULTZ fills on "board"
    back: { a: w.board - 16, dur: 30 },
    plate: { a: w.board - 10, b: w.board + 4 },
    // the lit line from the tag to the nameplate, GRANDSON landing on its word
    link: { a: w.grandson - 18, b: w.grandson - 4 },
    label: { a: w.grandson - 16, b: w.grandson - 2 },
    crane: end - 20
  };
  if (t.rings[2] + 26 > t.back.a + 10) throw new Error("whistle: the rings must have spread before the camera eases back");
  if (t.name.b > t.back.a) throw new Error("whistle: the tag's name must be read before the camera eases back");
  if (t.label.b > t.crane + 2) throw new Error(`whistle: GRANDSON must land before the slide out (${t.label.b} vs ${t.crane})`);
  return t;
};
// on "a board member's" the whistle glides left toward the nameplate as the camera eases back (it blows toward the board)
const GLIDE = 320;
const wx = (t, g) => W_AT.x - GLIDE * rInOut(g, t.back.a - 4, t.back.a + 30);
// ── the whistle's pose: lying on its back end → risen, upright, a slow bob in the light ─────────────────────────────────────
const poseAt = (t, g) => {
  const e = rInOut(g, t.rise.a, t.rise.b);
  const bob = 4 * Math.sin((g - t.rise.b) / 22) * rInOut(g, t.rise.b - 6, t.rise.b + 20);
  const yaw = 34 - 52 * e + 4 * Math.sin(g / 40), roll = 90 * (1 - e), lift = 280 * e;
  return whistleXf(wx(t, g), W_AT.z, TOP, yaw, roll, lift, bob);
};
const ringOf = (xf) => {
  const lug = whistleLug(xf);
  return { c: [lug[0] - 14, lug[1] + 92, lug[2] + 30], r: 26, lug };
};
const tagOf = (t, g, xf) => {
  const rg = ringOf(xf);
  const u = g - t.rise.b;
  const swing = (u > 0 ? 22 * Math.exp(-u / 16) * Math.sin(u / 4.5) : 10 * Math.sin(Math.PI * rInOut(g, t.rise.a, t.rise.b))) + 3 * Math.sin(g / 31);
  return tagFrame(rg.c, rg.r, TOP, -18 + swing);
};
// ── the camera ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const scr = (q) => {
  const p = worldScr(RIG, q);
  return { x: p[0], y: p[1] };
};
const restC = () => scr([W_AT.x - 40, TOP - 70, W_AT.z]);
const highC = () => scr([W_AT.x - 40, TOP - 300, W_AT.z]);
const midC = () => {
  const a = scr([W_AT.x - GLIDE, TOP - 260, W_AT.z]), b = scr(plateAt(PLATE_POSE, 0, -NP.ph / 2));
  return { x: (a.x + b.x) / 2 + 60, y: (a.y + b.y) / 2 - 50 };
};
const shots = (t) => [
  { a: -9999, z: 1.12, push: 0.02, at: () => restC() },
  { a: t.rise.a - 2, dur: 30, z: 1.18, push: 0.025, at: () => highC() },
  { a: t.back.a, dur: t.back.dur, z: 0.88, push: 0.02, at: () => midC() }
];
export const whistleCamWindows = (t) => actionCamWindows(shots(t));
export const whistleSfx = (t) => [
  // the whistle rising into the light, turning upright
  { job: "obj", a: t.rise.a, b: t.rise.b, k: "io", vol: 0.6 },
  // it blows: a bright ping as the first ring leaves the window, a soft air under the rings
  { job: "ping", a: t.rings[0], vol: 1.0 },
  { job: "obj", a: t.rings[0], b: t.rings[2] + 14, k: "out", vol: 0.32 },
  // the name filling on the tag, the light crossing it
  { job: "label", a: t.name.a, b: t.name.b + 6, vol: 0.4 },
  // SHULTZ filling on the nameplate
  { job: "label", a: t.plate.a, b: t.plate.b + 4, vol: 0.32 },
  // the lit line drawing to the nameplate, then GRANDSON
  { job: "data", a: t.link.a, b: t.link.b, vol: 0.35 },
  { job: "label", a: t.label.a, b: t.label.b + 4, vol: 0.5 }
];
export const BxWhistle = ({ at: at0, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = whistleTimes(w, end);
  // the slide out ends at end + 20: after that the place is wholly off the frame and draws nothing
  if (f > t.crane + 44) return null;
  const cam = actionCam(shots(t));
  const xf = poseAt(t, f);
  const rg = ringOf(xf);
  const tf = tagOf(t, f, xf);
  const lift = rInOut(f, t.rise.a, t.rise.b);
  // the split ring's plane: it hangs from the lug, turning with the tag
  const ru = tf.u, rv = tf.v;
  // the rings of sound from the escape window (light, in screen space; kept clear of the caption band)
  const win = scr(whistleWindow(xf));
  const cz = cam(f);
  const winScrY = 883.2 + cz.z * (win.y + cz.y - 883.2) + 110;
  const rMax = Math.max(60, Math.min(330, (winScrY - 410) / cz.z));
  const rings = t.rings.map((a, i) => {
    const k = clamp01((f - a) / 26);
    if (k <= 0 || k >= 1) return null;
    const r = 18 + (rMax - 18) * (1 - Math.pow(1 - k, 2.2));
    // each ring fades up over its first 8 f (never born bright), then thins and fades as it spreads
    return { r, op: clamp01((f - a) / 8) * (1 - k) * (1 - k) * (0.95 - 0.15 * i), w: 5 * (1 - k) + 1.2 };
  }).filter(Boolean);
  // the tag → nameplate link (a lit arc), GRANDSON on it
  const A = scr(tagAt(tf, -TAG.w / 2 + 10, TAG.h * 0.6, 2));
  const B = scr(plateAt(PLATE_POSE, NP.pw / 2 - 10, -NP.ph * 0.8));
  const C = { x: (A.x + B.x) / 2, y: Math.max(A.y, B.y) + 110 };
  const linkD = `M${f2(A.x)},${f2(A.y)}Q${f2(C.x)},${f2(C.y)} ${f2(B.x)},${f2(B.y)}`;
  const draw = rInOut(f, t.link.a, t.link.b);
  const lab = rOut(f, t.label.a, t.label.b);
  const low = { x: 0.25 * A.x + 0.5 * C.x + 0.25 * B.x, y: Math.min(A.y, B.y) - 150 };
  const ink = mixHex("#E9F1FA", "#00244D", clamp01(stage));
  // the light pool on the lacquer, the whistle's soft shadow (smaller and fainter as it rises)
  const pool = scr([wx(t, f) - 80, TOP, W_AT.z]);
  const sh = scr([wx(t, f) + 20 + 70 * lift, TOP, W_AT.z - 30 - 80 * lift]);
  // the nameplate is drawn only while some of it can be on screen: between the slide in (the composition's panFromR over
  //   [at − 20, at + 20], 1500 px) and the ease-back it sits wholly off the left edge (its own screws would "cross" its engraving)
  const plateR = Math.max(...[[NP.L / 2 + 10, 0], [NP.pw / 2, -NP.ph]].map(([u, v]) => scr(plateAt(PLATE_POSE, u, v)).x));
  const slideX = 1500 * (1 - rInOut(f, at0 - 20, at0 + 20));
  const plateOn = 540 + cz.z * (plateR + cz.x - 540) + slideX > -60;
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: cam, children: jsx("div", { "data-probe-leaving": travelling(f, whistleCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at: at0, end, from: -4, to: 3, amp: 0.7, children: [
    jsxs("div", { "data-probe-object": "the board table with the chrome whistle, its engraved tag and lanyard, Shultz's nameplate and the lit line joining tag and plate", style: { position: "absolute", inset: 0 }, children: [
      jsxs("svg", { "data-probe": "bg", width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
        jsx(BoardTable, { id: "wtT", rig: RIG, top: TOP, sheen: 900 * rInOut(f, at0 - 20, end) }),
        jsxs("defs", { children: [
          jsxs("radialGradient", { id: "wtPool", gradientUnits: "userSpaceOnUse", cx: f2(pool.x), cy: f2(pool.y), r: 380, gradientTransform: `translate(${f2(pool.x)} ${f2(pool.y)}) scale(1 0.42) translate(${f2(-pool.x)} ${f2(-pool.y)})`, children: [
            jsx("stop", { offset: "0", stopColor: "#BBD3F0", stopOpacity: 0.22 }), jsx("stop", { offset: "0.55", stopColor: "#7FA3CE", stopOpacity: 0.07 }), jsx("stop", { offset: "1", stopColor: "#7FA3CE", stopOpacity: 0 })
          ] }),
          jsxs("radialGradient", { id: "wtSh", cx: 0.5, cy: 0.5, r: 0.5, children: [
            jsx("stop", { offset: "0", stopColor: "#000000", stopOpacity: 0.6 }), jsx("stop", { offset: "1", stopColor: "#000000", stopOpacity: 0 })
          ] })
        ] }),
        jsx("ellipse", { cx: f2(pool.x), cy: f2(pool.y), rx: 560, ry: 230, fill: "url(#wtPool)" }),
        jsx("ellipse", { cx: f2(sh.x), cy: f2(sh.y), rx: f2(200 + 90 * lift), ry: f2(60 + 26 * lift), fill: "url(#wtSh)", opacity: 0.85 - 0.5 * lift })
      ] }),
      plateOn && jsx("div", { "data-probe": "bg", style: { position: "absolute", inset: 0 }, children: jsx(PlateReflection, { id: "wtR", rig: RIG, pose: PLATE_POSE, topY: TOP, lit: 1 }) }),
      plateOn && jsx(NamePlate, { id: "wtP", rig: RIG, pose: PLATE_POSE, text: L("boardShultz"), on: rInOut(f, t.plate.a, t.plate.b), lit: 0.55 + 0.45 * rInOut(f, t.plate.a - 6, t.plate.b + 6), probe: "the SHULTZ nameplate" }),
      jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(Lanyard, { rig: RIG, from: rg.c, top: TOP, out: [W_AT.x + 900, TOP, W_AT.z + 240] }) }),
      // the tag hangs BEHIND the whistle's lug side when it faces away, in front otherwise: it hangs below the barrel, so draw it first
      jsx(Tag, { id: "wtG", rig: RIG, tf, name: L("whistleName"), role: L("whistleRole"), on: rInOut(f, t.name.a, t.name.b), gleam: -1 + 2 * rInOut(f, t.gleam.a, t.gleam.b) }),
      jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
        (() => {
          const p0 = scr(rg.lug), p1 = scr([rg.c[0], rg.c[1] - rg.r + 2, rg.c[2]]);
          const mx = (p0.x + p1.x) / 2 + 10, my = (p0.y + p1.y) / 2;
          const d = `M${f2(p0.x)},${f2(p0.y)}Q${f2(mx)},${f2(my)} ${f2(p1.x)},${f2(p1.y)}`;
          return jsxs("g", { children: [
            jsx("path", { d, stroke: "#14243A", strokeWidth: 6, fill: "none", strokeLinecap: "round" }),
            jsx("path", { d, stroke: "#C9D8EA", strokeWidth: 3.6, fill: "none", strokeLinecap: "round" }),
            jsx("path", { d, stroke: "#FFFFFF", strokeWidth: 1.2, fill: "none", strokeLinecap: "round", transform: "translate(-1 -1)" })
          ] });
        })(),
        jsx(SplitRing, { rig: RIG, c: rg.c, r: rg.r, u: ru, v: rv }),
        jsx(Whistle, { id: "wtW", rig: RIG, xf, pea: f >= t.blow.a && f <= t.blow.b ? f * 1.3 : t.blow.a * 1.3, sweep: -1 + 2 * rInOut(f, t.blow.a, t.blow.b + 6), lit: 0.4 * lift }),
        draw > 2e-3 && jsxs("g", { children: [
          jsx("path", { d: linkD, pathLength: 1, stroke: "#8FB2DD", strokeOpacity: 0.28, strokeWidth: 10, fill: "none", strokeLinecap: "round", strokeDasharray: "1 1", strokeDashoffset: (1 - draw).toFixed(4) }),
          jsx("path", { d: linkD, pathLength: 1, stroke: "#E6F0FB", strokeWidth: 3, fill: "none", strokeLinecap: "round", strokeDasharray: "1 1", strokeDashoffset: (1 - draw).toFixed(4) }),
          jsx("circle", { cx: f2(A.x), cy: f2(A.y), r: f2(6 * rOut(f, t.link.a, t.link.a + 8)), fill: "#E6F0FB" }),
          jsx("circle", { cx: f2(B.x), cy: f2(B.y), r: f2(6 * rOut(f, t.link.b - 4, t.link.b + 4)), fill: "#E6F0FB" })
        ] })
      ] })
    ] }),
    // the rings of sound (light in flight: not part of the construction's geometry)
    rings.length > 0 && jsx("svg", { "data-probe-skip": true, width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: rings.map((q, i) => jsxs("g", { children: [
      jsx("ellipse", { cx: f2(win.x), cy: f2(win.y), rx: f2(q.r), ry: f2(q.r * 0.82), fill: "none", stroke: "#9FC2EC", strokeWidth: f2(q.w * 3), opacity: 0.25 * q.op }),
      jsx("ellipse", { cx: f2(win.x), cy: f2(win.y), rx: f2(q.r), ry: f2(q.r * 0.82), fill: "none", stroke: "#F2F7FD", strokeWidth: f2(q.w), opacity: q.op })
    ] }, i)) }),
    lab > 3e-3 && jsx("div", { "data-probe-label": "GRANDSON", style: {
      position: "absolute", left: 0, top: 0, width: 800, textAlign: "center", transformOrigin: "50% 50%",
      transform: `translate(${(low.x - 400).toFixed(2)}px, ${(low.y + 14 * (1 - lab)).toFixed(2)}px) scale(${(0.94 + 0.06 * lab).toFixed(4)})`,
      opacity: clamp01(lab * 1.3), ...figure(60, ink)
    }, children: L("whistleLink") })
  ] }) }) }) });
};
