// @ts-nocheck
// ★ V37 "Theranos" — place WHISTLE (builder M). "One whistleblower was Tyler Shultz, a board member's grandson."  No face, no person.
//   Back at the boardroom table, close (the chairs stay out of the frame's top, clear of the captions): Shultz's brass SHULTZ
//   nameplate (backers_plate.tsx, the same object as in backers) standing lit on its blotter. On "whistleblower" an employee ID badge on its lanyard slides in across the lacquer from the right, the
//   ribbon trailing and swinging round as it stops (whistle_badge.tsx), and comes to rest beside the nameplate: THERANOS · a blank
//   photo window · TYLER SHULTZ · EMPLOYEE · a barcode. The camera leans in on the badge on "Tyler Shultz" (a light crosses its
//   vinyl), eases back on "board member's", and on "grandson" a thin lit line arcs from the nameplate to the badge: GRANDSON.
//   Enters panFromR, exits panR (the composition's slides). Objects: the table · the nameplate · the badge on its lanyard.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn, figure } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { worldScr, xfMul, xfPose, xfTrans } from "./tk_rig";
import { TK_FLOOR_Y } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { BR_INK, BR_NAVY } from "./backers_kit";
import { TB_TOP, Table, chairX, placeZ, tableCorners } from "./backers_room";
import { NP, NamePlate, plateAt } from "./backers_plate";
import { BG, Badge, HOOK_V, Lanyard, badgeAt, badgeXf, lanyardAt } from "./whistle_badge";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const FY = TK_FLOOR_Y;
const RIG = { cx: 540, cy: FY - 760, persp: 3400, yaw: 12, pitch: -34 };
// the boardroom at 1.5, placed so Shultz's place (chair 2) stands left of the pivot
const K = 1.5, SHULTZ_I = 2;
const ROOM = (() => {
  const x0 = 360 - chairX(SHULTZ_I) * K, z0 = -placeZ * K;
  return xfPose(x0, FY, z0, K);
})();
const PLATE = xfMul(ROOM, xfTrans([chairX(SHULTZ_I), TB_TOP, placeZ]));
const TOP_Y = FY + TB_TOP * K;
// a closer stretch of the same table (its ends just past the frame's edges at every camera of the place)
const TABLE_L = 1040;
// the badge's rest beside the nameplate (right of it, a little nearer the lens), and where its slide starts (off the right)
const REST = { x: 360 + 372, z: 70, yaw: -7 };
const START = { x: REST.x + 1100, z: REST.z - 160, yaw: 38 };
const KEYS = ["s0", "whistleblower", "tyler", "shultz", "board", "grandson"];
export const whistleTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`whistle: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // the badge slides in on "whistleblower" and rests before "Tyler"
    slide: { a: w.whistleblower - 6, b: w.tyler - 5 },
    // the camera leans in on the badge for "Tyler Shultz" (a light crosses its vinyl), then eases back for "board member's"
    lean: { a: w.tyler - 18, dur: 30 },
    gleam: { a: w.tyler - 4, b: w.shultz + 10 },
    back: { a: w.board - 14, dur: 28 },
    // the lit line from the nameplate to the badge, GRANDSON on its word
    link: { a: w.grandson - 18, b: w.grandson - 2 },
    label: { a: w.grandson - 12, b: w.grandson + 2 },
    crane: end - 20
  };
  if (t.slide.b - t.slide.a < 18) throw new Error("whistle: the badge's slide needs ≥ 18 f");
  if (t.lean.a < t.slide.b - 14) throw new Error("whistle: the camera leans in once the badge is nearly at rest");
  if (t.back.a < t.gleam.b - 6) throw new Error("whistle: the name must be read before the camera eases back");
  if (t.label.b > t.crane + 2) throw new Error("whistle: GRANDSON must be read before the slide out");
  return t;
};
// the badge at frame g: an eased slide on a slight arc, turning to its rest, a small settle after it stops
const badgePose = (t, g) => {
  // a cubic ease-out: it slides in fast and decelerates to rest (less front-loaded than the house OUT, so the slide reads)
  const e = 1 - Math.pow(1 - clamp01((g - t.slide.a) / (t.slide.b - t.slide.a)), 3);
  const u = g - t.slide.b;
  const settle = u > 0 ? 3.2 * Math.exp(-u / 4.5) * Math.sin(u / 2.4) : 0;
  const x = START.x + (REST.x - START.x) * e;
  const z = START.z + (REST.z - START.z) * e + 70 * Math.sin(Math.PI * e);
  const yaw = START.yaw + (REST.yaw - START.yaw) * e + settle;
  return badgeXf(x, TOP_Y, z, yaw, K);
};
const hookOf = (t) => (g) => {
  const p = badgeAt(badgePose(t, g), 0, HOOK_V);
  return [p[0], p[2]];
};
// ── the camera ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const scr = (q) => {
  const p = worldScr(RIG, q);
  return { x: p[0], y: p[1] };
};
const restXf = badgeXf(REST.x, TOP_Y, REST.z, REST.yaw, K);
const BADGE_C = scr(badgeAt(restXf, 0, BG.H / 2));
const PLATE_C = scr(plateAt(PLATE, 0, -NP.ph / 2));
const MID = { x: (BADGE_C.x + PLATE_C.x) / 2 + 10, y: (BADGE_C.y + PLATE_C.y) / 2 + 40 };
const shots = (t) => [
  { a: -9999, z: 1.0, push: 0.03, at: () => MID },
  { a: t.lean.a, dur: t.lean.dur, z: 1.3, push: 0, at: () => ({ x: BADGE_C.x - 20, y: BADGE_C.y - 30 }) },
  { a: t.back.a, dur: t.back.dur, z: 1.06, push: 0.02, at: () => MID }
];
export const whistleCamWindows = (t) => actionCamWindows(shots(t));
export const whistleSfx = (t) => [
  // the badge sliding in across the lacquer, its lanyard trailing
  { job: "obj", a: t.slide.a, b: t.slide.b, k: "out", vol: 0.55 },
  // it comes to rest beside the nameplate (a light plastic touch)
  { job: "flick", a: t.slide.b - 2, b: t.slide.b, vol: 0.5 },
  // the light crossing its vinyl as the name is read
  { job: "label", a: t.gleam.a, b: t.gleam.a + 14, vol: 0.3 },
  // the lit line drawing from the nameplate to the badge, then GRANDSON
  { job: "data", a: t.link.a, b: t.link.b, vol: 0.4 },
  { job: "label", a: t.label.a, b: t.label.b, vol: 0.5 }
];
export const BxWhistle = ({ at: at0, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = whistleTimes(w, end);
  // the slide out ends at end + 20: after that the place is wholly off the frame and draws nothing
  if (f > t.crane + 44) return null;
  const xf = badgePose(t, f);
  const pts = lanyardAt(hookOf(t), t.slide.a - 2, Math.max(t.slide.a - 2, f), [0.94, -0.34], K);
  const casters = [{ corners: tableCorners(ROOM, TABLE_L) }];
  // the link: from the nameplate's right shoulder up and over to the badge's top edge
  const A = scr(plateAt(PLATE, NP.pw / 2 - 8, -NP.ph));
  const B = scr(badgeAt(xf, -20, -40, 4));
  const apex = Math.min(A.y, B.y) - 150;
  const C = { x: (A.x + B.x) / 2, y: apex };
  const linkD = `M${A.x.toFixed(2)},${A.y.toFixed(2)}Q${C.x.toFixed(2)},${C.y.toFixed(2)} ${B.x.toFixed(2)},${B.y.toFixed(2)}`;
  const draw = rInOut(f, t.link.a, t.link.b);
  const lab = rOut(f, t.label.a, t.label.b);
  const peak = { x: 0.25 * A.x + 0.5 * C.x + 0.25 * B.x, y: 0.25 * A.y + 0.5 * C.y + 0.25 * B.y };
  const ink = mixHex(BR_INK, BR_NAVY, clamp01(stage));
  const gleam = rInOut(f, t.gleam.a, t.gleam.b);
  const showBadge = f >= t.slide.a - 2;
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: actionCam(shots(t)), children: jsx("div", { "data-probe-leaving": travelling(f, whistleCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at: at0, end, from: -4, to: 3, amp: 0.7, children: [
    jsx(TkFloor, { id: "wbF", rig: RIG, at: { x: 560, z: -100 }, reach: 1500, casters, stage, on: 1 - stage }),
    // ONE construction: the table, the nameplate standing on it, the badge and lanyard lying on it, and the lit line joining them
    jsxs("div", { "data-probe-object": "the boardroom table with Shultz's nameplate, the employee badge on its lanyard, and the lit line joining them", style: { position: "absolute", inset: 0 }, children: [
      jsx(Table, { id: "wbT", rig: RIG, pose: ROOM, L: TABLE_L, sheen: 600 * rInOut(f, at0 - 20, end), glow: [{ x: chairX(SHULTZ_I), on: 1 }] }),
      jsx(NamePlate, { id: "wbP", rig: RIG, pose: PLATE, text: L("boardShultz"), on: 1, lit: 1, probe: "the SHULTZ nameplate" }),
      showBadge && jsx(Lanyard, { rig: RIG, pts, y: TOP_Y - 1, k: K }),
      showBadge && jsx(Badge, { id: "wbB", rig: RIG, xf, texts: { company: L("hookTube"), name: L("whistleName"), role: L("whistleRole") }, gleam }),
      draw > 2e-3 && jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
        jsx("path", { d: linkD, pathLength: 1, stroke: "#8FB2DD", strokeOpacity: 0.28, strokeWidth: 10, fill: "none", strokeLinecap: "round", strokeDasharray: "1 1", strokeDashoffset: (1 - draw).toFixed(4) }),
        jsx("path", { d: linkD, pathLength: 1, stroke: "#E6F0FB", strokeWidth: 3, fill: "none", strokeLinecap: "round", strokeDasharray: "1 1", strokeDashoffset: (1 - draw).toFixed(4) }),
        jsx("circle", { cx: A.x, cy: A.y, r: 6 * rOut(f, t.link.a, t.link.a + 8), fill: "#E6F0FB" }),
        jsx("circle", { cx: B.x, cy: B.y, r: 6 * rOut(f, t.link.b - 4, t.link.b + 4), fill: "#E6F0FB" })
      ] })
    ] }),
    lab > 3e-3 && jsx("div", { "data-probe-label": "GRANDSON", style: {
      position: "absolute", left: 0, top: 0, width: 800, textAlign: "center", transformOrigin: "50% 50%",
      transform: `translate(${(peak.x - 400).toFixed(2)}px, ${(peak.y - 64 - 34 + 14 * (1 - lab)).toFixed(2)}px) scale(${(0.94 + 0.06 * lab).toFixed(4)})`,
      opacity: clamp01(lab * 1.3), ...figure(64, ink)
    }, children: L("whistleLink") })
  ] }) }) }) });
};
