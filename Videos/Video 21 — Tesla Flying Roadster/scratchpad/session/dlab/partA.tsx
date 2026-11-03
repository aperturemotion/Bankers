import React from "react";
import { useCurrentFrame } from "remotion";
import { rInOut, clamp01, alpha, mixHex } from "../anim";
import { Turn } from "../kit";
import { Pool3D } from "../s3";
import { FlatDefs, rrect } from "../flat";
import { SENTENCES } from "../captions";
import { SPXW_D, SPXW_VIEW } from "../spxwordmark";
import { MARKS } from "../marks";
import { Faces, seen, depthOf, lightOf, metal, mix, onFace, affine, P, swing, type Face, type V } from "../p3";
import { type Rig } from "../rig";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// teachD / teachD2 — "Investors aren't paying for the cars Tesla sells today. They're paying for what Musk says comes next: robotaxis,
// robots, and maybe SpaceX." ONE WIDE SHOWROOM FLOOR, in two halves the camera travels between (FUTURE.travel, at teachD2 — the film's ONE
// light frame floods during that travel):
//   · LEFT (teachD, navy) — THE CARS TESLA SELLS TODAY, in the house 2-D construction (STYLE §6.1a: side-on cars read face-on): a Model Y
//     and a Model 3 parked under the showroom's light. On "cars" their lamps come on; on "today" the light over them DIMS.
//   · RIGHT (teachD2, the white stage) — WHAT COMES NEXT, ★ IN REAL DEPTH (Timur, 2026-10-29: "make them more 3D"; STYLE §16 2026-10-29):
//     three showroom TURNTABLES (real drums set in the floor, an LED rim, etched brushed tops) are there with the camera; their rims light
//     along the row on "next"; then, on their words —
//       a CYBERCAB (Tesla's two-seat robotaxi: a lofted body of flat planes, a wrap-round glasshouse and glass roof, two butterfly doors,
//       full-width light bars, aero wheel covers on real tyres) DRIVES IN from the left on "robotaxis", its wheels turning with the ground
//       it covers (blurred when too fast to read), braking to a stop centred on its turntable, which then turns it slowly;
//       a ROBOT HAND (articulated fingers with real thickness, axle knuckles, a palm with a pad, a ribbed wrist actuator on its post) is
//       LOWERED onto the centre of its turntable on "robots" — on its axis for the whole entrance (STYLE §16 2026-10-29: an object arrives
//       ON its stand, never beside it);
//       a STARSHIP model (a stainless cylinder lit round its curve, weld rings, black heat tiles on its shaded side, the forward and aft
//       flaps standing out in depth, SpaceX's wordmark) is LOWERED onto its stand's turntable on "maybe SpaceX", as the real one lands.
// Inks follow the stage (`light`, 0 navy … 1 white; the lead passes it — a fallback ramp follows the travel when it does not).
// KIND object.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const KIND = "object";

type C = { arrive: number; investors: number; paying: number; today: number; next: number; robotaxis: number; robots: number; maybe: number; spacexB: number; end: number; light?: number };

/** the travel onto the right half (registry.tsx teachD2: "They're paying" − 12) and the next place's first frame (teachE) — the fallback
 *  light ramp follows them */
const sentAt = (re: RegExp) => { const s = SENTENCES.find((x) => re.test(x.text)); if (!s) throw new Error(`future: no sentence ${re}`); return s.at; };
const D2 = sentAt(/^They're paying/) - 12;
const NEXT_PLACE = sentAt(/^Musk has said both/) - 12;

export const futureTimes = (c: C) => ({
  /** the parked cars' lamps come on, on "cars" (a soft click) */
  lamps: [c.paying + 13, c.paying + 31] as [number, number],
  /** the light over the cars dims, on "today" (a soft low whoosh, or nothing — the travel's own airwoosh follows at once) */
  dim: [c.today - 12, c.today + 22] as [number, number],
  /** the three turntables' rim lights come on along the row, on "next" (a tick each) */
  rims: [0, 1, 2].map((i) => [c.next - 4 + 5 * i, c.next + 12 + 5 * i] as [number, number]),
  /** the Cybercab drives in from beyond the left edge and brakes to a stop on its turntable (a whooshsoft peaking as it enters; a soft
   *  click as it stops). ★ 2026-10-29: starts 6 f earlier (was robotaxis − 28) so it enters from off-frame at a car's speed. */
  cab: [c.robotaxis - 34, c.robotaxis + 8] as [number, number],
  /** the robot hand is lowered onto its turntable (a swoosh; a soft click as it seats) */
  hand: [c.robots - 14, c.robots + 12] as [number, number],
  /** the Starship model is lowered onto its stand (a swoosh; a low sub as it settles) */
  ship: [c.maybe - 9, c.spacexB + 12] as [number, number],
  /** the frame the place's LAST action ends (the next place waits for it) */
  done: c.spacexB + 12,
});

// ── layout (the place's own frame: the left half centred on x 540, the right half on 540 + TRAVEL) ──
const TRAVEL = 1020;
const G = 1250;   // the showroom floor (tyres and stands stand on it)
/** the cars, staggered as a showroom parks them: the Model Y a row behind (its floor line higher, a touch smaller), the Model 3 in front.
 *  Rear x, length, height (px), wheel radius, the axles' places along the body (u), the floor line g. Proportions from the real cars
 *  (Model Y 4,751 × 1,624 mm, Model 3 4,720 × 1,441 mm). */
const MY = { x0: 26, L: 490, H: 168, wr: 37, uf: 0.825, ur: 0.205, g: G - 58 };
const M3 = { x0: 410, L: 530, H: 162, wr: 39, uf: 0.822, ur: 0.213, g: G };
/** ★ the right half's three turntables, in that half's OWN frame (x 0..1080; the floor at G; z toward the viewer): centre x, radius */
const TT_X = [292, 668, 896], TT_R = [212, 86, 92];
/** a turntable's drum stands TT_H above the floor (the objects stand on its top) */
const TT_H = 14;
/** where the Cybercab starts its drive (its centre this far left of its turntable's: wholly beyond the frame's left edge) */
const CAB_RUN = 540;
/** ★★ THE CAMERA AIMS. `today` is in the left half's frame. ★ `cab`, `hand`, `ship` and `next` are in the RIGHT half's OWN frame
 *  (Video.tsx applies a key as an offset from where the place has ARRIVED, and teachD2 arrives after the travel): until 2026-10-29 they
 *  carried + TRAVEL, so every key pushed the camera ~200–360 px the WRONG way and the Cybercab sat cut by the frame's left edge the whole
 *  scene (the "glitched" Cybercab at 52 s). `ship` sits between the hand and the ship so the Cybercab stays in frame on the move. */
export const FUTURE = {
  x: 540 + TRAVEL / 2, y: 1060,
  today: { x: 480, y: G - 130 }, next: { x: 540, y: 1030 }, travel: TRAVEL,
  cab: { x: 430, y: G - 80 }, hand: { x: TT_X[1], y: G - 240 }, ship: { x: 640, y: G - 300 },
} as const;

