// @ts-nocheck
// ★ V37 "Theranos" — place WHISTLE (builder H; REV2 — Timur: "fix the whistle on sec 36, it looks weird and overlapped, also make this
//   scene more detailed and aesthetic").
//   "One whistleblower was Tyler Shultz, a board member's grandson."  The line, enacted: THE WHISTLE.
//   On the boardroom table — dark lacquer with long veneer grain, a crossbanded border and a steel stringing inlay, a stitched navy
//   leather writing pad — a chrome pea whistle (Acme "Thunderer"-style) lies on its side in a soft pool of the key light, its
//   braided lanyard running off across the pad, its brushed-steel tag lying flat on the lacquer, the whistle mirrored in the lacquer.
//   On "whistleblower" it RISES into the light — rolling level on its barrel and turning to show its escape window — and BLOWS:
//   three rings of air pulse up out of the window, the pea rattles inside, a light runs round the chrome; the ring and tag swing up
//   off the table and hang from its lug. On "Tyler Shultz" the engraving TYLER SHULTZ · EMPLOYEE (whistleName / whistleRole) fills
//   and a light crosses the steel. On "a board member's" the camera eases back across the table to Shultz's brass SHULTZ nameplate
//   (builder M's NamePlate, the boardroom's own object), its letters filling on "board"; on "grandson" a lit line draws from the tag
//   to the nameplate and GRANDSON (whistleLink) lands on it. Enters panFromR, exits panR (the composition's slides).
//   Objects: the whistle (+ ring, tag, lanyard), the nameplate, the table (+ its pad).
//   ★ The whistle's occlusion is exact at every frame: see whistle_parts.tsx (a BSP over its own planes, decided per frame by the eye).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn, figure } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { worldScr, worldView, xfApply, xfMul } from "./tk_rig";
import { TK_FLOOR_Y } from "./tk_slab";
import { NP, NamePlate, PlateReflection, plateAt } from "./backers_plate";
import {
  BoardTable, Lanyard, padOutline, REST_TILT, RingPart, TAG, TBL, Tag, WH, Whistle, ringFrame, tagAt, tagFrontClip, tagFrame, whistleAxis, whistleCentre,
  whistleHole, whistleLugOut, whistleWindow, whistleXf
} from "./whistle_parts";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const TOP = TK_FLOOR_Y - 500;
const RIG = { cx: 540, cy: TOP - 160, persp: 2600, yaw: 12, pitch: -30 };
const W_AT = { x: 620, z: 60 };
const PLATE = (() => {
  // builder M's nameplate, standing on the table to the whistle's left, turned a little toward the lens
  const c = Math.cos(14 * Math.PI / 180), s = Math.sin(14 * Math.PI / 180), k = 1.25;
  return { m: [c * k, 0, s * k, 0, k, 0, -s * k, 0, c * k], t: [-40, TOP, -170] };
})();
const KEYS = ["s0", "whistleblower", "tyler", "shultz", "board", "grandson"];
export const whistleTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`whistle: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // the whistle rises into the light and turns on "whistleblower", then blows: three rings, the pea rattling
    rise: { a: w.whistleblower - 6, b: w.whistleblower + 22 },
    blow: { a: w.whistleblower + 14, b: w.whistleblower + 42 },
    rings: [0, 7, 14].map((d) => w.whistleblower + 14 + d),
    // TYLER SHULTZ · EMPLOYEE fills on the tag, read by "Shultz"; a light crosses the steel
    name: { a: w.tyler - 10, b: w.tyler + 6 },
    gleam: { a: w.tyler - 4, b: w.shultz + 18 },
    // the camera eases back to the nameplate on "board member's"; SHULTZ fills on "board"
    back: { a: w.board - 22, dur: 30 },
    plate: { a: w.board - 10, b: w.board + 4 },
    // the lit line from the tag to the nameplate, GRANDSON landing on its word
    link: { a: w.grandson - 18, b: w.grandson - 4 },
    label: { a: w.grandson - 16, b: w.grandson - 2 },
    crane: end - 20
  };
  if (t.rise.a < w.s0 - 4) throw new Error("whistle: the rise must start once the line has begun");
  if (t.rings[2] + 26 > t.back.a + 10) throw new Error("whistle: the rings must have spread before the camera eases back");
  if (t.name.b > t.back.a) throw new Error("whistle: the tag's name must be read before the camera eases back");
  if (t.plate.b > t.link.b) throw new Error("whistle: SHULTZ must be filled before the line reaches the nameplate");
  if (t.label.b > t.crane + 2) throw new Error(`whistle: GRANDSON must land before the slide out (${t.label.b} vs ${t.crane})`);
  return t;
};
// ── the whistle's pose: lying on its side (lip on the table) → risen, level, turned to show its window; a slow bob in the light ──
const REST = { yaw: -72, tilt: REST_TILT };
const HERO = { yaw: -52, tilt: 13, lift: 210 };
const poseAt = (t, g) => {
  const e = rInOut(g, t.rise.a, t.rise.b);
  const settle = rInOut(g, t.rise.b - 8, t.rise.b + 24);
  const bob = 5 * Math.sin((g - t.rise.b) / 21) * settle;
  // a tiny damped shiver while it blows
  const u = g - t.blow.a;
  const shiver = u > 0 ? 1.1 * Math.exp(-u / 14) * Math.sin(u * 1.9) : 0;
  const yaw = REST.yaw + (HERO.yaw - REST.yaw) * e + 3 * Math.sin(g / 46) * settle;
  const tilt = REST.tilt + (HERO.tilt - REST.tilt) * e + shiver;
  const lift = HERO.lift * e + bob;
  return whistleXf(W_AT.x, W_AT.z, TOP, yaw, tilt, lift);
};
// the ring and the tag: hanging from the lug's hole by gravity, swinging up off the table as it rises
const hangOf = (t, g, xf) => {
  const hole = whistleHole(xf), axis = whistleAxis(xf), out = whistleLugOut(xf);
  const u = g - t.rise.b;
  const swing = (u > 0 ? 14 * Math.exp(-u / 18) * Math.sin(u / 5) : 8 * Math.sin(Math.PI * rInOut(g, t.rise.a, t.rise.b))) + 2.5 * Math.sin(g / 33);
  const rf = ringFrame(hole, axis, out, TOP, swing);
  const tswing = (u > 0 ? -12 * Math.exp(-u / 20) * Math.sin(u / 6 + 0.6) : 0) + 3 * Math.sin(g / 29 + 1);
  const tf = tagFrame(rf.low, TOP, axis, 16 * rInOut(g, t.rise.a, t.rise.b + 10) + tswing);
  return { rf, tf, axis };
};
// ── the camera ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const scr = (q) => {
  const p = worldScr(RIG, q);
  return { x: p[0], y: p[1] };
};
const restC = () => scr([W_AT.x + 90, TOP - 120, W_AT.z + 40]);
const highC = () => scr([W_AT.x + 60, TOP - 240, W_AT.z + 40]);
// the ease-back frames the nameplate's left end and the whistle's lip (at its hero pose) with a margin, centred between them
const BACK = (() => {
  const hx = whistleXf(W_AT.x, W_AT.z, TOP, HERO.yaw, HERO.tilt, HERO.lift);
  const tip = scr(xfApply(hx, [WH.TIP, -20, 0])), barrelTop = scr(xfApply(hx, [0, -WH.R, 0]));
  const pl = scr(plateAt(PLATE, -NP.pw / 2 - 20, -NP.ph / 2)), pb = scr(plateAt(PLATE, 0, 0));
  const z = Math.min(0.9, 900 / (tip.x - pl.x));
  return { z, x: (tip.x + pl.x) / 2, y: (barrelTop.y + pb.y) / 2 + 60 };
})();
const midC = () => ({ x: BACK.x, y: BACK.y });
const shots = (t) => [
  { a: -9999, z: 1.2, push: 0.02, at: () => restC() },
  { a: t.rise.a - 2, dur: 32, z: 1.16, push: 0.025, at: () => highC() },
  { a: t.back.a, dur: t.back.dur, z: BACK.z, push: 0.02, at: () => midC() }
];
export const whistleCamWindows = (t) => actionCamWindows(shots(t));
export const whistleSfx = (t) => [
  // the whistle rising into the light, turning
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
const MIRROR = { m: [1, 0, 0, 0, -1, 0, 0, 0, 1], t: [0, 2 * TOP, 0] };
export const BxWhistle = ({ at: at0, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = whistleTimes(w, end);
  // the slide out ends at end + 20: after that the place is wholly off the frame and draws nothing
  if (f > t.crane + 44) return null;
  const cam = actionCam(shots(t));
  const cz = cam(f);
  const xf = poseAt(t, f);
  const { rf, tf, axis } = hangOf(t, f, xf);
  const lift = rInOut(f, t.rise.a, t.rise.b);
  // the ring's layers: its top half against the lug's plate, its low half against the tag's plate
  const hole = whistleHole(xf);
  const ringPart = (part) => (which) => jsx(RingPart, { rig: RIG, rf, which, part, lugO: hole, lugN: axis, tagO: tf.o, tagN: tf.n }, `${part}${which}`);
  // the lanyard: a jump link through the ring's low point, the crimp sleeve, the cord falling to the table and across the pad
  const B = rf.low;
  const right = [Math.cos(-0.35), 0, Math.sin(-0.35)];
  const linkPts = Array.from({ length: 17 }, (_, q) => {
    const a = q / 16 * 2 * Math.PI;
    return [B[0] + 14 * Math.cos(a) * right[0] + 2, B[1] + 9 + 11 * Math.sin(a), B[2] + 14 * Math.cos(a) * right[2]];
  });
  const s0 = [B[0] + 28 * right[0], B[1] + 14, B[2] + 28 * right[2]];
  const s1 = [s0[0] + 46 * right[0], Math.min(TOP - 9, s0[1] + 26), s0[2] + 46 * right[2]];
  const PAD = TBL.pad;
  const yOn = (x, z) => Math.abs(x - PAD.x) < PAD.w / 2 - 4 && Math.abs(z - PAD.z) < PAD.d / 2 - 4 ? TOP - PAD.h - 5 : TOP - 5;
  const foot = [s1[0] + 120, 0, s1[2] - 30];
  foot[1] = yOn(foot[0], foot[2]);
  const cord = [s1];
  for (let q = 1; q <= 14; q++) {
    const u = q / 14;
    const x = s1[0] + (foot[0] - s1[0]) * u, z = s1[2] + (foot[2] - s1[2]) * u;
    const y = s1[1] + (foot[1] - s1[1]) * Math.sin(u * Math.PI / 2);
    cord.push([x, Math.min(y, yOn(x, z)), z]);
  }
  const out = [foot[0] + 520, 0, foot[2] + 1050];
  for (let q = 1; q <= 26; q++) {
    const u = q / 26;
    const x = foot[0] + (out[0] - foot[0]) * u + 160 * Math.sin(u * Math.PI), z = foot[2] + (out[2] - foot[2]) * u - 60 * Math.sin(u * Math.PI * 1.3);
    cord.push([x, yOn(x, z), z]);
  }
  // the rings of air from the escape window: circles round the window's normal, rising and spreading (kept clear of the caption band)
  const win = whistleWindow(xf);
  const toScreen = (p) => ({ x: 540 + cz.z * (p[0] + cz.x - 540), y: 883.2 + cz.z * (p[1] + cz.y - 883.2) });
  // the rings of air: arcs of light opening out of the escape window over its top (they never cross the whistle's body, which lies
  //   below and to the right of the window), each born at the window as a point; kept clear of the caption band (y 220–360)
  const W0 = worldScr(RIG, win);
  const winScrY = toScreen(W0).y;
  const rMax = Math.max(60, Math.min(380, (winScrY - 420) / (0.82 * cz.z)));
  const airs = t.rings.map((a, i) => {
    const k = clamp01((f - a) / 28);
    if (k <= 0 || k >= 1) return null;
    const r = 8 + (rMax - 8) * (1 - Math.pow(1 - k, 2.2));
    const pts = [];
    for (let q = 0; q <= 40; q++) {
      const th = (-172 + 164 * q / 40) * Math.PI / 180;
      pts.push([W0[0] + r * Math.cos(th), W0[1] - 6 + 0.82 * r * Math.sin(th)]);
    }
    return { d: "M" + pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L"), op: rInOut(f, a, a + 10) * (1 - k) * (1 - k) * (1 - 0.15 * i), w: 5.5 * (1 - k) + 1.2 };
  }).filter(Boolean);
  const airPaths = () => airs.length > 0 && jsx("g", { "data-probe-skip": true, children: airs.map((q, i) => jsxs("g", { children: [
    jsx("path", { d: q.d, fill: "none", stroke: "#7FA8DA", strokeWidth: f2(q.w * 3.4), opacity: 0.22 * q.op, strokeLinecap: "round", strokeLinejoin: "round" }),
    jsx("path", { d: q.d, fill: "none", stroke: "#F2F7FD", strokeWidth: f2(q.w), opacity: q.op, strokeLinecap: "round", strokeLinejoin: "round" })
  ] }, i)) });
  // the tag → nameplate link (a lit arc), GRANDSON above it
  const A = scr(tagAt(tf, -TAG.w / 2 + 14, TAG.h * 0.62, TAG.t));
  const Bp = scr(plateAt(PLATE, NP.pw / 2 - 12, -NP.ph * 0.78));
  const C = { x: (A.x + Bp.x) / 2, y: Math.max(A.y, Bp.y) + 120 };
  const linkD = `M${f2(A.x)},${f2(A.y)}Q${f2(C.x)},${f2(C.y)} ${f2(Bp.x)},${f2(Bp.y)}`;
  const draw = rInOut(f, t.link.a, t.link.b);
  const lab = rOut(f, t.label.a, t.label.b);
  const low = { x: 0.25 * A.x + 0.5 * C.x + 0.25 * Bp.x, y: Math.min(A.y, Bp.y) - 175 };
  const ink = mixHex("#E9F1FA", "#00244D", clamp01(stage));
  // the light: the key's pool on the lacquer (it follows the whistle up a little), the contact shadow (tight at rest, soft and
  //   spread as it rises, thrown down-right, away from the key), the whistle's reflection in the lacquer
  const cx = whistleCentre(xf);
  const pool = scr([cx[0] - 120, TOP, cx[2] - 40]);
  const shC = scr([cx[0] + 40 + 0.35 * HERO.lift * lift, TOP, cx[2] - 20 - 0.25 * HERO.lift * lift]);
  const shR = scr([cx[0] + 40 + 0.35 * HERO.lift * lift + 260, TOP, cx[2] - 20]);
  const shW = Math.abs(shR.x - shC.x);
  const contact = scr([cx[0] - 60, TOP, cx[2]]);
  const mxf = xfMul(MIRROR, xf);
  const reflTop = scr([cx[0], TOP, cx[2] + 140]).y;
  // the nameplate is drawn only while some of it can be on screen: during the slide in (the composition's panFromR over [at − 20,
  //   at + 20], 1500 px) and until the ease-back it may sit wholly off the left edge
  const plateR = Math.max(...[[NP.L / 2 + 10, 0], [NP.pw / 2, -NP.ph]].map(([u, v]) => scr(plateAt(PLATE, u, v)).x));
  const slideX = 1500 * (1 - rInOut(f, at0 - 20, at0 + 20));
  const plateOn = 540 + cz.z * (plateR + cz.x - 540) + slideX > -60;
  const gain = 0.92 + 0.12 * lift;
  const frontClip = tagFrontClip(RIG, tf, xf);
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: cam, children: jsx("div", { "data-probe-leaving": travelling(f, whistleCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at: at0, end, from: -4, to: 3, amp: 0.7, children: [
    jsxs("div", { "data-probe-object": "the board table with the chrome whistle, its engraved tag and lanyard, Shultz's nameplate and the lit line joining tag and plate", style: { position: "absolute", inset: 0 }, children: [
      jsxs("svg", { "data-probe": "bg", width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
        jsx(BoardTable, { id: "wtT", rig: RIG, top: TOP, sheen: 1000 * rInOut(f, at0 - 20, end) }),
        jsxs("defs", { children: [
          jsxs("radialGradient", { id: "wtPool", gradientUnits: "userSpaceOnUse", cx: f2(pool.x), cy: f2(pool.y), r: 540, gradientTransform: `translate(${f2(pool.x)} ${f2(pool.y)}) scale(1 0.42) translate(${f2(-pool.x)} ${f2(-pool.y)})`, children: [
            jsx("stop", { offset: "0", stopColor: "#BBD3F0", stopOpacity: 0.26 + 0.06 * lift }), jsx("stop", { offset: "0.45", stopColor: "#7FA3CE", stopOpacity: 0.1 }), jsx("stop", { offset: "1", stopColor: "#7FA3CE", stopOpacity: 0 })
          ] }),
          jsxs("radialGradient", { id: "wtSh", cx: 0.5, cy: 0.5, r: 0.5, children: [
            jsx("stop", { offset: "0", stopColor: "#000000", stopOpacity: 0.75 }), jsx("stop", { offset: "0.6", stopColor: "#000000", stopOpacity: 0.3 }), jsx("stop", { offset: "1", stopColor: "#000000", stopOpacity: 0 })
          ] }),
          jsxs("linearGradient", { id: "wtRf", gradientUnits: "userSpaceOnUse", x1: 0, y1: f2(reflTop - 120), x2: 0, y2: f2(reflTop + 260), children: [
            jsx("stop", { offset: "0", stopColor: "#FFFFFF", stopOpacity: 0.5 }), jsx("stop", { offset: "1", stopColor: "#FFFFFF", stopOpacity: 0 })
          ] }),
          jsxs("mask", { id: "wtRm", maskUnits: "userSpaceOnUse", x: -2000, y: -2000, width: 6000, height: 6000, children: [jsx("rect", { x: -2000, y: -2000, width: 6000, height: 6000, fill: "url(#wtRf)" }), jsx("path", { d: padOutline(RIG, TOP), fill: "#000000" })] })
        ] }),
        jsx("ellipse", { cx: f2(pool.x), cy: f2(pool.y), rx: 760, ry: 320, fill: "url(#wtPool)" }),
        // the reflection in the lacquer (fades with distance from the surface; weaker as it rises)
        jsx("g", { mask: "url(#wtRm)", opacity: 0.08 + 0.5 * Math.pow(1 - lift, 1.5), children: jsx(Whistle, { id: "wtWr", rig: RIG, xf: mxf, gain: 0.8 * gain, mirror: true }) }),
        jsx("ellipse", { cx: f2(shC.x), cy: f2(shC.y), rx: f2(shW * (0.9 + 0.5 * lift)), ry: f2(shW * (0.3 + 0.16 * lift)), fill: "url(#wtSh)", opacity: 0.7 - 0.35 * lift }),
        jsx("ellipse", { cx: f2(contact.x), cy: f2(contact.y), rx: f2(shW * 0.7), ry: f2(shW * 0.12), fill: "url(#wtSh)", opacity: 0.85 * (1 - lift) })
      ] }),
      plateOn && jsx("div", { "data-probe": "bg", style: { position: "absolute", inset: 0 }, children: jsx(PlateReflection, { id: "wtR", rig: RIG, pose: PLATE, topY: TOP, lit: 1 }) }),
      plateOn && jsx(NamePlate, { id: "wtP", rig: RIG, pose: PLATE, text: L("boardShultz"), on: rInOut(f, t.plate.a, t.plate.b), lit: 0.55 + 0.45 * rInOut(f, t.plate.a - 6, t.plate.b + 6), probe: "the SHULTZ nameplate" }),
      jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(Lanyard, { rig: RIG, pts: cord, top: TOP, sleeve: [s0, s1], link: linkPts }) }),
      // the ring's low half behind the tag, the tag, the ring's low half in front of it; then the whistle (its ring's top half inside)
      jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: ringPart("low")("back") }),
      jsx(Tag, { id: "wtG", rig: RIG, tf, name: L("whistleName"), role: L("whistleRole"), on: rInOut(f, t.name.a, t.name.b), gleam: -1 + 2 * rInOut(f, t.gleam.a, t.gleam.b) }),
      jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
        ringPart("low")("front"),
        jsx(Whistle, { id: "wtW", rig: RIG, xf, pea: f >= t.blow.a && f <= t.blow.b ? f * 1.3 : t.blow.a * 1.3, sweep: -1 + 2 * rInOut(f, t.blow.a, t.blow.b + 6), gain, ring: (which) => ringPart("top")(which) }),
        airPaths(),
        draw > 2e-3 && jsxs("g", { children: [
          jsx("path", { d: linkD, pathLength: 1, stroke: "#8FB2DD", strokeOpacity: 0.28, strokeWidth: 10, fill: "none", strokeLinecap: "round", strokeDasharray: "1 1", strokeDashoffset: (1 - draw).toFixed(4) }),
          jsx("path", { d: linkD, pathLength: 1, stroke: "#E6F0FB", strokeWidth: 3, fill: "none", strokeLinecap: "round", strokeDasharray: "1 1", strokeDashoffset: (1 - draw).toFixed(4) }),
          jsx("circle", { cx: f2(A.x), cy: f2(A.y), r: f2(6 * rOut(f, t.link.a, t.link.a + 8)), fill: "#E6F0FB" }),
          jsx("circle", { cx: f2(Bp.x), cy: f2(Bp.y), r: f2(6 * rOut(f, t.link.b - 4, t.link.b + 4)), fill: "#E6F0FB" })
        ] })
      ] }),
      // the tag's part in front of the whistle's near end plane (only while it lifts across it), painted again over the whistle
      frontClip && jsx("div", { "data-probe": "bg", style: { position: "absolute", inset: 0, clipPath: `path('${frontClip}')` }, children: jsx(Tag, { id: "wtG2", rig: RIG, tf, name: L("whistleName"), role: L("whistleRole"), on: rInOut(f, t.name.a, t.name.b), gleam: -1 + 2 * rInOut(f, t.gleam.a, t.gleam.b) }) })
    ] }),
    lab > 3e-3 && jsx("div", { "data-probe-label": "GRANDSON", style: {
      position: "absolute", left: 0, top: 0, width: 800, textAlign: "center", transformOrigin: "50% 50%",
      transform: `translate(${(low.x - 400).toFixed(2)}px, ${(low.y + 14 * (1 - lab)).toFixed(2)}px) scale(${(0.94 + 0.06 * lab).toFixed(4)})`,
      opacity: clamp01(lab * 1.3), ...figure(60, ink)
    }, children: L("whistleLink") })
  ] }) }) }) });
};
