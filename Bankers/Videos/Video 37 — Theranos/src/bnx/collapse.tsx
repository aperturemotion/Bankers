// @ts-nocheck
// Video 37 "Theranos" — place "collapse" (builder B, 2026-11-24): "Theranos voided two years of Edison results. Walgreens walked
//   away. In two thousand eighteen, it shut down."
//   The claim's LAB DOOR returns (th_door, the same bay, rig and pose): THERANOS in gold leaf on the glass, the lit corridor behind
//   it — and standing in the corridor just behind the glass, a results board (rows of result tiles, like the Edison's screen).
//   Beat 1 (framed on the glass): on "voided" VOIDED (collapseVoid) lands in red on the board and its rows go red one by one;
//   2014–2015 (collapseYears) lands under it on "two years".
//   Beat 2: the camera travels left to the WALGREENS partner plaque (collapseWalgreens) on the facade beside the door; on "walked
//   away" its left pin slips, it swings on the right pin, slips off and drops — righting itself as it falls — lands on its edge
//   and tips forward face down on the floor.
//   Beat 3: the camera pulls back to the whole bay; SEPT 2018 (collapseShut) lands on "2018" on the floor before the door; on
//   "shut down" the steel roller shutter rolls down out of its hood, over the door, to the floor.
//   Objects: the door (with its shutter), the results board, the plaque. The founder's plate is gone (its four screw holes remain).
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
import { FloatLabel } from "./claim_kit";
import { DOOR, LabDoor, PLAQUE, doorAt, doorCorners, plaqueCorners } from "./th_door";
import { CLAIM_POSE, CLAIM_RIG } from "./claim";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs;
const R = CLAIM_RIG, POSE = CLAIM_POSE;
const lay = (p) => ({ x: p[0], y: p[1] });
const S = (q) => lay(doorAt(R, POSE, q));
const ROWS = 4;
const KEYS = ["s0", "voided", "two", "years", "edison", "results", "s1", "walgreens", "walked", "s2", "k2018", "shut"];
export const collapseTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`collapse: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // VOIDED lands on its word; the board's rows go red one by one from it; 2014–2015 on "two years"
    void: { a: w.voided - 12, b: w.voided + 1 },
    red: Array.from({ length: ROWS }, (_, i) => ({ a: w.voided - 2 + i * 6, b: w.voided + 10 + i * 6 })),
    years: { a: w.two - 8, b: w.years + 1 },
    // the travel to the plaque, then its fall on "walked away"
    toPlaque: { a: w.s1 - 22, dur: 28 },
    unhook: w.walked - 6,
    // the pull back to the whole bay; SEPT 2018 on "2018"; the shutter rolls down across "… it shut down"
    wide: { a: Math.max(w.s2 - 20, w.walked - 6 + PLAQUE.swing + 6), dur: 30 },
    shutL: { a: w.k2018 - 12, b: w.k2018 + 1 },
    roll: { a: w.k2018 + 2, b: w.shut + 6 }
  };
  if (t.toPlaque.a < t.years.b + 10) throw new Error("collapse: 2014–2015 must be read before the camera leaves the door");
  if (t.unhook < t.toPlaque.a + t.toPlaque.dur - 6) throw new Error("collapse: the plaque falls once the camera has arrived on it");
  if (t.roll.b > end - 4) throw new Error("collapse: the shutter must reach the floor before the slide out");
  return t;
};
// the framings, derived from the construction; every one keeps the coping under the caption headroom (top ≥ 500)
const PIV = 883;
const COPE = S([0, -DOOR.H - 16, 0]).y;
const fit = (z, cy) => Math.min(COPE - (500 - PIV) / z, cy);
// every framing keeps ALL the place's print wholly in frame (the plaque's name at the left, the gold name and VOIDED on the
//   door): beat 1 holds the door and the plaque, beat 2 leans in toward the plaque, beat 3 pulls back over the bay and the floor
const PL = S([DOOR.plaque.cx - DOOR.plaque.w / 2 - 24, 0, 0]), DR = S([DOOR.rail.x1 + 30, 0, 0]), GR = S([150, 0, 0]);
const Z1 = Math.min(1.16, 1000 / (DR.x - PL.x)), Z2 = Math.min(1.3, 1000 / (GR.x - PL.x)), Z3 = Math.min(1.08, 980 / (DR.x - PL.x));
const MID = S([0, -380, 0]).y;
const shots = (t) => [
  { a: -9999, z: Z1, push: 0.02, at: still((PL.x + DR.x) / 2, fit(Z1, MID)) },
  { a: t.toPlaque.a, dur: t.toPlaque.dur, z: Z2, push: 0, at: still((PL.x + GR.x) / 2, fit(Z2, MID + 40)) },
  { a: t.wide.a, dur: t.wide.dur, z: Z3, push: 0.02, at: still((PL.x + DR.x) / 2, fit(Z3, MID + 90)) }
];
export const collapseCamWindows = (t) => actionCamWindows(shots(t));
export const collapseSfx = (t) => [
  // VOIDED lands; the rows go red (a relay's click per row); 2014–2015
  { job: "verdict", a: t.void.a, b: t.void.b, vol: 0.6 },
  ...t.red.filter((_, i) => i % 2 === 1).map((r) => ({ job: "click", a: Math.round(r.a + 4), vol: 0.3 })),
  { job: "label", a: t.years.a, b: t.years.b + 6, vol: 0.4 },
  // the plaque: the pin slips (click), it swings and drops (a soft whoosh), lands on its edge (thud), tips flat (thud)
  { job: "click", a: t.unhook + 2, vol: 0.4 },
  { job: "obj", a: t.unhook + 4, b: t.unhook + PLAQUE.land, k: "in", vol: 0.45 },
  { job: "thud", a: t.unhook + PLAQUE.land, vol: 0.55 },
  { job: "thud", a: t.unhook + PLAQUE.tip, vol: 0.45 },
  // SEPT 2018; the shutter's chain run and the bottom bar meeting the floor
  { job: "label", a: t.shutL.a, b: t.shutL.b + 6, vol: 0.45 },
  { job: "mech", a: t.roll.a, b: t.roll.b, vol: 0.55 },
  { job: "thud", a: t.roll.b, vol: 0.6 }
];
export const BxCollapse = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = collapseTimes(w, end);
  const red = t.red.map((r) => rInOut(f, r.a, r.b));
  const k = f - t.unhook;
  const shutter = rInOut(f, t.roll.a, t.roll.b);
  const casters = [{ corners: doorCorners(POSE), k: 0.75 }, { corners: plaqueCorners(POSE, k), k: 0.5 }];
  const lab = S([0, 0, 220]);
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: actionCam(shots(t)), children: jsx("div", { "data-probe-leaving": travelling(f, collapseCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -5, to: 4, amp: 0.8, children: [
    jsx(TkFloor, { id: "coF", rig: R, at: { x: 420, z: 120 }, reach: 1300, casters, on: 1 - stage }),
    jsx("div", { "data-probe-object": "the Theranos lab door, the results board behind its glass, the Walgreens plaque and the roller shutter", style: { position: "absolute", inset: 0 }, children: jsx(LabDoor, {
      id: "coD",
      rig: R,
      pose: POSE,
      f,
      glow: 1,
      name: { text: L("claimName"), write: 1, glint: 0 },
      plate: null,
      plaque: { text: L("collapseWalgreens"), k },
      shutter,
      board: { rows: Array(ROWS).fill(1), red, void: { text: L("collapseVoid"), on: rInOut(f, t.void.a, t.void.b) }, years: { text: L("collapseYears"), on: rInOut(f, t.years.a, t.years.b) } }
    }) }),
    jsx(FloatLabel, { x: lab.x, y: lab.y + 44, on: rInOut(f, t.shutL.a - 4, t.shutL.b), text: L("collapseShut"), size: 80, probe: "SEPT 2018 before the shut door" })
  ] }) }) }) });
};
