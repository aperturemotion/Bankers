// @ts-nocheck
// Video 37 "Theranos" — place "collapse" (builder B; rev 1, 2026-11-24): "Theranos voided two years of Edison results. Walgreens
//   walked away. In two thousand eighteen, it shut down."
//   The claim's LAB BUILDING returns (th_door: the same building, rig and three-quarter pose): THERANOS in gold leaf on the door,
//   the lit corridor behind the glass. ★ REV 1 (Timur): the results display stands OUTSIDE, in front of the door — a detailed
//   free-standing results stand (collapse_stand: base, column, a tilted display head with ten lit result buttons), its head low
//   enough to stay clear under the door's THERANOS lettering.
//   Beat 1 (the door, the stand, the plaque): on "voided" VOIDED (collapseVoid) lands in red on the stand's glass and its buttons
//   go RED one by one; 2014–2015 (collapseYears) lands under it on "two years".
//   Beat 2: the camera leans toward the WALGREENS partner plaque (collapseWalgreens) on the facade left of the door; on "walked
//   away" its left pin slips, it swings on the right pin, slips off and drops — righting itself as it falls — lands on its edge
//   on the doorstep and tips forward face down.
//   Beat 3: the camera pulls back over the building; SEPT 2018 (collapseShut) lands in white letters on the facade's right panel
//   (where the founder's plate hung: its four screw holes remain) on "2018"; on "shut down" the steel roller shutter rolls down
//   out of its hood over the door to the doorstep, behind the stand.
//   Objects: the building (door, shutter), the results stand, the plaque. KEPT from v1: the shutter's closing and the plaque fall.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { rInOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { TkFloor } from "./tk_floor";
import { DOOR, LabDoor, PLAQUE, doorAt, doorCorners, plaqueCorners } from "./th_door";
import { ResultsStand, STAND, standCorners } from "./collapse_stand";
import { CLAIM_POSE, CLAIM_RIG } from "./claim";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs;
const R = CLAIM_RIG, POSE = CLAIM_POSE;
const lay = (p) => ({ x: p[0], y: p[1] });
const S = (q) => lay(doorAt(R, POSE, q));
const KEYS = ["s0", "voided", "two", "years", "edison", "results", "s1", "walgreens", "walked", "s2", "k2018", "shut"];
export const collapseTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`collapse: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // VOIDED lands on its word; the stand's ten buttons go red one by one from it; 2014–2015 on "two years"
    void: { a: w.voided - 12, b: w.voided + 1 },
    red: Array.from({ length: STAND.n }, (_, i) => ({ a: w.voided - 2 + i * 3, b: w.voided + 10 + i * 3 })),
    years: { a: w.two - 8, b: w.years + 1 },
    // the lean toward the plaque, then its fall on "walked away"
    toPlaque: { a: w.s1 - 22, dur: 28 },
    unhook: w.walked - 6,
    // the pull back over the building; SEPT 2018 on "2018"; the shutter rolls down across "… it shut down"
    wide: { a: Math.max(w.s2 - 20, w.walked - 6 + PLAQUE.swing + 6), dur: 30 },
    // (integrator, rev 1: on take 37A "2018" falls inside the pull-back, which carried the right panel — and SEPT 2018 on it — in
    //   through the frame edge, so the notice landed half cut off; it now lands as the wide framing settles)
    shutL: { a: Math.max(w.k2018 - 12, w.s2 - 20 > 0 ? Math.max(w.s2 - 20, w.walked - 6 + PLAQUE.swing + 6) + 22 : 0), b: Math.max(w.k2018 + 1, Math.max(w.s2 - 20, w.walked - 6 + PLAQUE.swing + 6) + 35) },
    roll: { a: w.k2018 + 2, b: Math.min(w.shut + 6, end - 18) }
  };
  if (t.toPlaque.a < t.years.b + 10) throw new Error("collapse: 2014–2015 must be read before the camera leaves the door");
  if (t.unhook < t.toPlaque.a + t.toPlaque.dur - 6) throw new Error("collapse: the plaque falls once the camera has arrived on it");
  if (t.roll.b - t.roll.a < 34) throw new Error("collapse: the shutter needs ≥ 34 f to roll down (a heavy steel curtain)");
  if (t.red[STAND.n - 1].b > t.toPlaque.a) throw new Error("collapse: every button is red before the camera leaves the stand");
  return t;
};
// the framings, derived from the construction; each keeps the coping under the caption headroom (≥ 480 on screen, the stage drop
//   included) and every print it shows wholly in frame
const PIV = 883, DROP = 110, TOP_AT = 480;
const COPE = Math.min(...[[DOOR.W0, -DOOR.H, 0], [DOOR.W1, -DOOR.H, 0], [DOOR.W0, -DOOR.H, -DOOR.SIDE], [DOOR.W1, -DOOR.H, -DOOR.SIDE], [-470, DOOR.P0 - 150, -1060]].map((q) => S(q).y));
const fit = (z, cy) => Math.min(COPE - (TOP_AT - DROP - PIV) / z, cy);
const PL = S([DOOR.plaque.cx - DOOR.plaque.w / 2 - 30, 0, 0]);
const NR = S([458 + 200, 0, 0]);
const STR = S([STAND.x + STAND.head.w / 2 + 30, 0, STAND.z]);
const MIDY = S([0, -330, 0]).y;
// every framing also keeps the stand's base (its front foot) above ~1680 on screen under the roof's headroom
const SFOOT = S([STAND.x, 0, STAND.z + STAND.base.d / 2]).y, ZH = (1680 - TOP_AT) / (SFOOT - COPE);
const Z1 = Math.min(1.08, ZH, 990 / (STR.x - PL.x)), Z2 = Math.min(Z1 * 1.05, ZH, 960 / (STR.x - PL.x)), Z3 = Math.min(1.04, ZH, 990 / (NR.x - PL.x));
const shots = (t) => [
  { a: -9999, z: Z1, push: 0.02, at: still((PL.x + STR.x) / 2, fit(Z1, MIDY)) },
  { a: t.toPlaque.a, dur: t.toPlaque.dur, z: Z2, push: 0, at: still((PL.x + STR.x) / 2 - 40, fit(Z2, MIDY)) },
  { a: t.wide.a, dur: t.wide.dur, z: Z3, push: 0.02, at: still((PL.x + NR.x) / 2, fit(Z3, MIDY + 60)) }
];
export const collapseCamWindows = (t) => actionCamWindows(shots(t));
export const collapseSfx = (t) => [
  // VOIDED lands; the buttons go red (a relay's click every other button); 2014–2015
  { job: "verdict", a: t.void.a, b: t.void.b, vol: 0.6 },
  ...t.red.filter((_, i) => i % 3 === 1).map((r) => ({ job: "click", a: Math.round(r.a + 4), vol: 0.3 })),
  { job: "label", a: t.years.a, b: t.years.b + 6, vol: 0.4 },
  // the plaque: the pin slips (click), it swings and drops (a soft whoosh), lands on its edge (thud), tips flat (thud)
  { job: "click", a: t.unhook + 2, vol: 0.4 },
  { job: "obj", a: t.unhook + 4, b: t.unhook + PLAQUE.land, k: "in", vol: 0.45 },
  { job: "thud", a: t.unhook + PLAQUE.land, vol: 0.55 },
  { job: "thud", a: t.unhook + PLAQUE.tip, vol: 0.45 },
  // SEPT 2018; the shutter's chain run and the bottom bar meeting the doorstep
  { job: "label", a: t.shutL.a, b: t.shutL.b + 6, vol: 0.45 },
  { job: "mech", a: t.roll.a, b: t.roll.b, vol: 0.55 },
  { job: "thud", a: t.roll.b, vol: 0.6 }
];
export const BxCollapse = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = collapseTimes(w, end);
  const k = f - t.unhook;
  const shutter = rInOut(f, t.roll.a, t.roll.b);
  const red = (i) => rInOut(f, t.red[i].a, t.red[i].b);
  const casters = [{ corners: doorCorners(POSE), k: 0.75 }, { corners: plaqueCorners(POSE, k), k: 0.5 }, { corners: standCorners(POSE), k: 0.6 }];
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: actionCam(shots(t)), children: jsx("div", { "data-probe-leaving": travelling(f, collapseCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -5, to: 4, amp: 0.8, children: [
    jsx(TkFloor, { id: "coF", rig: R, at: { x: 420, z: 160 }, reach: 1400, casters, on: 1 - stage }),
    jsx("div", { "data-probe-object": "the Theranos lab building: its door, the Walgreens plaque, the roller shutter and the SEPT 2018 notice", style: { position: "absolute", inset: 0 }, children: jsx(LabDoor, {
      id: "coD",
      rig: R,
      pose: POSE,
      f,
      glow: 1,
      name: { text: L("claimName"), write: 1, glint: 0 },
      plate: null,
      plaque: { text: L("collapseWalgreens"), k },
      shutter,
      quiet: true,
      notice: { text: L("collapseShut"), on: rInOut(f, t.shutL.a, t.shutL.b) }
    }) }),
    jsx("div", { "data-probe-object": "the results stand on the doorstep: VOIDED and its red result buttons", style: { position: "absolute", inset: 0 }, children: jsx(ResultsStand, {
      id: "coS",
      rig: R,
      pose: POSE,
      red,
      void: { text: L("collapseVoid"), on: rInOut(f, t.void.a, t.void.b) },
      years: { text: L("collapseYears"), on: rInOut(f, t.years.a, t.years.b) }
    }) })
  ] }) }) }) });
};
