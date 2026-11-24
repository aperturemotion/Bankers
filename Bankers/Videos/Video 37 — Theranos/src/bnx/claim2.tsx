// @ts-nocheck
// Video 37 "Theranos" — place "claim2" (builder B, 2026-11-24): "The pitch: a full set of blood tests from one finger prick, on
//   its Edison machine."
//   THE EDISON (th_edison): the white desktop analyser with its graphite fascia, black-glass touchscreen, EDISON badge, status
//   strip, vents and louvres, standing on the floor. Its loading drawer slides OUT as the place arrives, carrying the cartridge with
//   the nanotainer standing in its well. On "a full set of blood tests" the screen's result tiles appear one by one (the menu: the
//   whole set). On "one finger prick" the drawer draws the cartridge ALL the way in (its lip closes flush with the face, the slot's
//   rim lights) and ONE FINGER PRICK (claim2Pitch) lands beside the machine. On "its Edison machine" the badge fills and glows
//   (claim2Device) and the tiles fill with their result bars (abstract bars — no readable fake medical text).
//   Camera: the whole machine; in toward the drawer as it closes; back out over the screen as it fills.
//   Objects: the Edison, the cartridge (with its tube). Label: ONE FINGER PRICK.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { xfPose } from "./tk_rig";
import { TK_FLOOR_Y } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { FloatLabel } from "./claim_kit";
import { ED, Edison, edAt, edCorners } from "./th_edison";
import { ThTube } from "./th_tube";
import { mapScr, worldView } from "./tk_rig";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs;
const R = { cx: 540, cy: TK_FLOOR_Y - 760, persp: 3200, yaw: -26, pitch: -15 };
const POSE = xfPose(560, TK_FLOOR_Y, -60);
const lay = (p) => ({ x: p[0], y: p[1] });
const S = (q) => lay(edAt(R, POSE, q));
// the drawer: fully out (its lip ~250 in front of the face) → all the way in (flush)
const OUT = ED.Zf + 250;
const KEYS = ["s0", "pitch", "full", "blood", "tests", "finger", "prick", "edison", "machine"];
export const claim2Times = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`claim2: the take has no word frame "${k}"`);
  const n = ED.tiles;
  const t = {
    w,
    end,
    // the drawer slides out as the place arrives (moving from the first frame)
    eject: { a: w.s0 - 24, b: w.s0 + 18 },
    // the tiles of the full set appear one by one across "a full set of blood tests"
    tiles: { a: w.full - 6, b: w.tests + 8 },
    // the drawer draws the cartridge all the way in on "finger prick"; it seats (click) at b
    load: { a: w.finger - 8, b: w.prick + 6 },
    pitchL: { a: w.finger - 4, b: w.prick + 1 },
    // EDISON fills on its word; the tiles fill with their results across "its Edison machine"
    badge: { a: w.edison - 12, b: w.edison + 1 },
    fill: { a: w.edison - 12, b: Math.min(w.machine + 4, end - 16) },   // (integrator, take 37A: "machine." lands 13 f before the slide)
    // camera: in toward the drawer as it closes, back over the screen for the results
    inA: { a: w.finger - 16, dur: 28 },
    outA: { a: w.edison - 18, dur: 30 }
  };
  t.tileAt = (i) => ({ a: t.tiles.a + i * (t.tiles.b - t.tiles.a - 10) / (n - 1), d: 10 });
  t.fillAt = (i) => ({ a: t.fill.a + i * (t.fill.b - t.fill.a - 14) / (n - 1), d: 14 });
  if (t.eject.b > t.tiles.a) throw new Error("claim2: the drawer is out before the tiles appear");
  if (t.load.a < t.tiles.b - 6) throw new Error("claim2: the cartridge goes in once the full set is on the screen");
  if (t.fill.b > end - 16) throw new Error("claim2: the results must fill before the slide out");
  return t;
};
// the framings, derived from the construction: the whole machine with its drawer out; the drawer; the machine and its screen
const TOPP = [S([-ED.W / 2, ED.top, -ED.DP / 2]), S([ED.W / 2, ED.top, -ED.DP / 2]), S([-ED.W / 2, ED.top, ED.DP / 2])].reduce((a, b) => (b.y < a.y ? b : a)), FOOT = S([0, 0, ED.Zf]);
const DRAWER = S([0, ED.slot.y1, ED.Zf + 120]);
const SCREEN = S([0, (ED.screen.y0 + ED.screen.y1) / 2, ED.Zf]);
const PIV = 883;
const WHOLE_Z = 1.08;
const WHOLE = { x: S([60, 0, ED.Zf]).x - 10, y: Math.min(TOPP.y - (500 - PIV) / WHOLE_Z, (TOPP.y + FOOT.y) / 2 + 40) };
const IN_Z = 1.15;
const IN = { x: DRAWER.x + 60, y: Math.min(DRAWER.y - 90, TOPP.y - (500 - PIV) / IN_Z) };
const OUT_Z = 1.14;
const OUTF = { x: SCREEN.x + 30, y: Math.min(SCREEN.y + 150, TOPP.y - (500 - PIV) / OUT_Z) };
const shots = (t) => [
  { a: -9999, z: WHOLE_Z, push: 0.03, at: still(WHOLE.x, WHOLE.y) },
  { a: t.inA.a, dur: t.inA.dur, z: IN_Z, push: 0, at: still(IN.x, IN.y) },
  { a: t.outA.a, dur: t.outA.dur, z: OUT_Z, push: 0.02, at: still(OUTF.x, OUTF.y) }
];
export const claim2CamWindows = (t) => actionCamWindows(shots(t));
export const claim2Sfx = (t) => [
  // the drawer slides out (a motor), then draws the cartridge in and seats it
  { job: "mech", a: t.eject.a + 4, b: t.eject.b, vol: 0.45 },
  // the tiles appear row by row
  ...[0, 1, 2].map((r) => ({ job: "click", a: Math.round(t.tileAt(r * ED.cols).a + 4), vol: 0.3 })),
  { job: "mech", a: t.load.a, b: t.load.b, vol: 0.5 },
  { job: "click", a: t.load.b, vol: 0.45 },
  { job: "label", a: t.pitchL.a, b: t.pitchL.b + 6, vol: 0.45 },
  { job: "ping", a: t.badge.b - 2, vol: 0.5 },
  // the results compute into the tiles
  { job: "data", a: t.fill.a, b: t.fill.b, vol: 0.55 }
];
export const BxClaim2 = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = claim2Times(w, end);
  const out = rInOut(f, t.eject.a, t.eject.b), load = rInOut(f, t.load.a, t.load.b);
  const cz = ED.cartIn + (OUT - ED.cartIn) * out * (1 - load);
  const led = 0.25 + 0.75 * rOut(f, t.load.b - 2, t.load.b + 12);
  const tiles = (i) => rInOut(f, t.tileAt(i).a, t.tileAt(i).a + t.tileAt(i).d);
  const fill = (i) => rInOut(f, t.fillAt(i).a, t.fillAt(i).a + t.fillAt(i).d);
  const bOn = rInOut(f, t.badge.a, t.badge.b);
  const glow = bOn * (0.65 + 0.35 * Math.cos((f - t.badge.b) / 9));
  // the hook's nanotainer (builder H's th_tube), cap shut, standing in the cartridge's well: its foot and its size from the rig
  const tube = (map, rig) => {
    const q = map(ED.wellAt(cz)), p = mapScr(map, rig, ED.wellAt(cz)), v = worldView(rig, q);
    const u = ED.tubeH / 100, k = rig.persp / Math.max(1, rig.persp - v[2]);
    return jsx(ThTube, { id: "c2Tb", x: p[0], y: p[1], scale: u * k, fill: 0.3, open: 0, lit: 0.35 * led, pitch: rig.pitch, yaw: rig.yaw, persp: rig.persp / u, label: L("hookTube") });
  };
  // ONE FINGER PRICK stands on the floor just under the drawer's lip
  const lab = S([-20, 0, ED.Zf + 200]);
  const casters = [{ corners: edCorners(POSE), k: 0.9 }];
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: actionCam(shots(t)), children: jsx("div", { "data-probe-leaving": travelling(f, claim2CamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -5, to: 4, amp: 0.8, children: [
    jsx(TkFloor, { id: "c2F", rig: R, at: { x: 600, z: 80 }, reach: 1200, casters, on: 1 - stage }),
    jsx("div", { "data-probe-object": "the Edison analyser, its drawer and the cartridge carrying the nanotainer", style: { position: "absolute", inset: 0 }, children: jsx(Edison, {
      id: "c2E",
      rig: R,
      pose: POSE,
      tiles,
      fill,
      badge: { text: L("claim2Device"), on: bOn, glow },
      led,
      cart: { z: cz },
      tube
    }) }),
    jsx(FloatLabel, { x: lab.x - 20, y: lab.y + 62, on: rInOut(f, t.pitchL.a - 4, t.pitchL.b), text: L("claim2Pitch"), size: 56, probe: "ONE FINGER PRICK beside the Edison" })
  ] }) }) }) });
};
