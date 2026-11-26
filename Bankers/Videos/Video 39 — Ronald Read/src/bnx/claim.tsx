// @ts-nocheck
// Video 37 "Theranos" — place "claim" (builder B, 2026-11-24): "In two thousand three, Elizabeth Holmes founded Theranos at
//   nineteen, then dropped out of Stanford."
//   The company's first glass lab door (th_door: a clad storefront bay, an aluminium frame and glass leaf with its long pull
//   handle, a lit lab corridor seen through the tinted glass) comes out of flare 1 — the bloom recedes into the corridor's far
//   light, seen through the glass (claimFlarePoint). Beside it, the founder's brass plate: its engraving fills on its words —
//   2003 (claimYear) on "2003", ELIZABETH HOLMES, 19 (claimFounder) on "19", STANFORD DROPOUT (claimSchool) on "dropped".
//   On "founded Theranos" the name writes itself across the glass in gold leaf, letter by letter (claimName), then a burnish
//   glint runs across it. The camera holds the door and the plate, creeping in; after the name it rides to the plate.
//   ★ REV 2 (Timur: "some kind of visual … connected to university … on 'then dropped out of Stanford'"): a graduation
//   MORTARBOARD (claim_cap) perched on the parapet's front-right corner, its tassel swinging, tips over the edge just before
//   "dropped" and drops — tumbling once, tassel trailing, past the corner outside the side wall — landing on the ground at the
//   corner's foot on "Stanford" as STANFORD DROPOUT fills. The ride toward the plate leans right so corner and ground stay in.
//   Objects: the building (door, plate), the mortarboard. No people.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rInOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { worldScr, xfApply, xfPose } from "./tk_rig";
import { TK_FLOOR_Y } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { DOOR, LabDoor, doorAt, doorCorners } from "./th_door";
import { CAP_T, ClaimCap, capCorners, capTopLocal } from "./claim_cap";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs;
// the rig: a little above eye height, looking slightly down, the facade turned a few degrees so its depth reads
export const CLAIM_RIG = { cx: 540, cy: TK_FLOOR_Y - 1000, persp: 3200, yaw: -4, pitch: -10 };
const R = CLAIM_RIG;
export const CLAIM_POSE = xfPose(470, TK_FLOOR_Y, 0, 1, -28);
const POSE = CLAIM_POSE;
const lay = (p) => ({ x: p[0], y: p[1] });
const S = (q) => lay(doorAt(R, POSE, q));
const KEYS = ["s0", "k2003", "elizabeth", "holmes", "founded", "theranos", "k19", "dropped", "stanford"];
export const claimTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`claim: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // the corridor's light settles from the flare's bloom to its own glow
    glow: { a: w.s0 - 2, b: w.s0 + 40 },
    // 2003 fills on the plate, read ON "2003"
    year: { a: w.k2003 - 13, b: w.k2003 + 1 },
    // the name writes itself in gold leaf across "founded Theranos", then a burnish glint crosses it
    write: { a: w.founded - 4, b: w.theranos + 12 },
    glint: { a: w.theranos + 14, b: w.theranos + 40 },
    // ELIZABETH HOLMES, 19 fills ON "19"; STANFORD DROPOUT on "dropped … Stanford"
    founder: { a: w.k19 - 13, b: w.k19 + 1 },
    school: { a: w.dropped - 6, b: w.dropped + 10 },
    // ★ rev 2: the mortarboard perched on the parapet's corner tips over the edge just before "dropped" and drops out of the
    //   picture's world: it lands at the corner's foot as "Stanford" is said
    cap: { a: w.dropped - 14 },
    // the lean toward the door as the name writes; the ride toward the plate once it is written
    lean: { a: w.founded - 14, dur: 30 },
    ride: { a: w.theranos + 14, dur: 34 }
  };
  if (t.year.a < w.s0 - 20) throw new Error("claim: 2003 would fill before the place is on screen");
  if (t.ride.a < t.write.b) throw new Error("claim: the camera rides to the plate only once the name is written");
  if (t.founder.b > t.ride.a + t.ride.dur + 30) throw new Error("claim: the founder's line must fill while the plate is framed");
  if (t.school.b > end - 22) throw new Error("claim: STANFORD DROPOUT must be read before the slide out");
  if (t.cap.a + CAP_T.land > end - 20) throw new Error("claim: the mortarboard must land before the slide out");
  return t;
};
// the framings, DERIVED from the construction: the door and the plate together (the left panel cropped by the frame), then the
//   plate and the door's latch side. Everything stays under the caption headroom (450) in both.
const DOOR_L = S([-DOOR.canopy.w / 2 + 40, 0, 0]), PLATE_R = S([DOOR.plate.cx + DOOR.plate.w / 2 + 30, 0, 0]);
const DROP = 110, TOP_AT = 480;
const TOP = [[DOOR.W0, -DOOR.H, 0], [DOOR.W1, -DOOR.H, 0], [DOOR.W0, -DOOR.H, -DOOR.SIDE], [DOOR.W1, -DOOR.H, -DOOR.SIDE], [-470, DOOR.P0 - 150, -1060], capTopLocal].map(S).reduce((a, b) => (b.y < a.y ? b : a)), FOOT = [S([0, 0, 40]), S([DOOR.W1 + DOOR.BZ, 0, DOOR.BZ])].reduce((a, b) => (b.y > a.y ? b : a));
// (and the door's threshold stays above ~1650 on screen: the roof is kept under the headroom, so a closer zoom would drop the
//   door's foot off the frame)
const WIDE_Z = Math.min(1.08, 1000 / (PLATE_R.x - DOOR_L.x), (1640 - TOP_AT) / (FOOT.y - TOP.y));
const PIV = 883;
// (+ DROP: the composition draws every place 110 px lower — the roof's coping is kept at ≥ 480 on screen)
const aimY = (z, top, foot) => Math.min(top.y - (TOP_AT - DROP - PIV) / z, (top.y + foot.y) / 2 + 30 - DROP / z);
const WIDE = { x: (DOOR_L.x + PLATE_R.x) / 2, y: aimY(WIDE_Z, TOP, FOOT) };
// three framings: the WHOLE building (its front, its right side wall going back, the parapet — it reads as a building, not a
//   wall) out of the flare; in on the door and the plate as the name writes; a lean toward the plate as its lines fill. Each
//   keeps the gold name and the plate wholly in frame, the coping under the caption headroom.
const B_L = S([DOOR.W0 - 30, 0, 0]), B_R = S([DOOR.W1 + 30, 0, -DOOR.SIDE]);
const WHOLE_Z = Math.min(0.86, 1000 / (B_R.x - B_L.x));
const WHOLE = { x: (B_L.x + B_R.x) / 2, y: aimY(WHOLE_Z, TOP, FOOT) };
const shots = (t) => [
  { a: -9999, z: WHOLE_Z, push: 0.02, at: still(WHOLE.x, WHOLE.y) },
  { a: t.lean.a, dur: t.lean.dur + 6, z: WIDE_Z, push: 0, at: still(WIDE.x - 20, aimY(WIDE_Z, TOP, FOOT)) },
  // (the ride leans right: the parapet's corner with the mortarboard and the ground under it stay in the picture)
  { a: t.ride.a, dur: t.ride.dur, z: WIDE_Z, push: 0.02, at: still(WIDE.x + 150, aimY(WIDE_Z, TOP, FOOT)) }
];
// ★ flare 1's lit point: the lit glass of the door, the corridor's light just behind it (the bloom recedes into it), in SCREEN
//   coordinates at the place's rest framing (the whole building; the action camera's first focus: screen = pivot + z · (p − aim);
//   pivot = the CamFn origin, 50 % / 46 % of the 1080 × 1920 frame) + the composition's stage drop (Composition.tsx DROP = 110)
const FAR = [0, -330, DOOR.glassZ - 40];
export const claimFlarePoint = (() => {
  const p = worldScr(R, xfApply(POSE, FAR)), O = { x: 540, y: 0.46 * 1920 };
  const z = WHOLE_Z * 1.02;   // the rest focus with its settled creep (push 0.02)
  return { x: Math.round(O.x + z * (p[0] - WHOLE.x)), y: Math.round(O.y + z * (p[1] - WHOLE.y) + DROP) };
})();
export const claimCamWindows = (t) => actionCamWindows(shots(t));
export const claimSfx = (t) => [
  // 2003 fills on the plate
  { job: "label", a: t.year.a, b: t.year.b + 6, vol: 0.45 },
  // the gold leaf writes itself across the glass, letter by letter
  { job: "label", a: t.write.a, b: t.write.b, k: "io", vol: 0.5 },
  // the burnish glint crosses the name
  { job: "ping", a: t.glint.a + 8, vol: 0.5 },
  // the mortarboard tips off the parapet and drops (a soft whoosh through its fall), lands on the ground (a thud)
  { job: "obj", a: t.cap.a, b: t.cap.a + CAP_T.land, k: "in", vol: 0.45 },
  { job: "thud", a: t.cap.a + CAP_T.land, vol: 0.42 },
  // ELIZABETH HOLMES, 19 · STANFORD DROPOUT fill on the plate
  { job: "label", a: t.founder.a, b: t.founder.b + 6, vol: 0.4 },
  { job: "label", a: t.school.a, b: t.school.b + 6, vol: 0.4 }
];
export const BxClaim = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = claimTimes(w, end);
  const on = (q) => rInOut(f, q.a, q.b);
  const glow = 1 + 0.7 * (1 - rInOut(f, t.glow.a, t.glow.b));
  const lines = [
    { text: L("claimYear"), size: 80, on: on(t.year) },
    { text: L("claimFounder"), size: 32, on: on(t.founder) },
    { text: L("claimSchool"), size: 32, on: on(t.school) }
  ];
  const capK = f - t.cap.a;
  const casters = [{ corners: doorCorners(POSE), k: 0.75 }, { corners: capCorners(POSE, capK, f), k: 0.5 }];
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: actionCam(shots(t)), children: jsx("div", { "data-probe-leaving": travelling(f, claimCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -5, to: 4, amp: 0.8, children: [
    jsx(TkFloor, { id: "clF", rig: R, at: { x: 640, z: 120 }, reach: 1300, casters, on: 1 - stage }),
    jsx("div", { "data-probe-object": "the Theranos lab door in its facade, the founder's brass plate beside it", style: { position: "absolute", inset: 0 }, children: jsx(LabDoor, {
      id: "clD",
      rig: R,
      pose: POSE,
      f,
      glow,
      name: { text: L("claimName"), write: rInOut(f, t.write.a, t.write.b), glint: rInOut(f, t.glint.a, t.glint.b) },
      plate: { lines },
      plaque: null,
      shutter: 0,
      board: null
    }) }),
    jsx("div", { "data-probe-object": "the mortarboard perched on the parapet, then dropping to the ground", style: { position: "absolute", inset: 0 }, children: jsx(ClaimCap, { id: "clCap", rig: R, pose: POSE, k: capK, f }) })
  ] }) }) }) });
};
