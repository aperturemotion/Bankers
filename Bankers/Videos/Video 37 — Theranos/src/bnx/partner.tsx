// @ts-nocheck
// Video 36 "Bre-X Gold" — place "partner" (builder B, 2026-11-23): "That March, a partner drilled its own test holes beside Bre-X's."
//   THE TURN (LightBreak 1 flashes on "That March" as it rises). Two core-drill rigs side by side on one pad (claim's rig, the same
//   model): Bre-X's on the left, IDLE (head parked at the top, still rods, dry mud at its collar), and the partner's on the right,
//   DRILLING — its drill string spinning and feeding down into the ground, return water rippling out of the mud and cuttings at its
//   collar, and its own core laid into a tray in front of it. Each rig's power pack carries an engraved maker's plate: the partner's
//   fills FREEPORT-McMoRAN on "partner", Bre-X's fills BRE-X on "Bre-X's". MARCH 1997 lands over the partner's rig on "March".
//   The camera pushes in to the partner's rig, rides down its spinning string to the collar and the tray, and pulls back to both.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mix, rIn, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn, figure } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { worldScr, xfApply, xfMul, xfPose } from "./tk_rig";
import { TK_FLOOR_Y, tkRig } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { DrillRig, RIG, RM, rigCasters, rigScr } from "./claim_rig";
import { BxCore, BxTray, CORE_LEN, coreXf, trayCoreY, trayCorners, trayRowZ, trayWidth } from "./bx_core";
import { CanopyFloor } from "./claim_canopy";
import { Palms, palmCasters } from "./claim_palm";
import { PaintParts, boxAB, part, path3 } from "./claim_kit";
import { RG_DECK } from "./claim_mat";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs;
// ★ REV1 "they are pretty similar" to claim: a different camera (higher, from the pad's OTHER side, looking down onto the concrete
//   pad between the rigs), a different rig model/paint for the partner (graphite frame, pale blue-steel pack and roof), the
//   partner's string painted with helical bands that travel down as it spins, palms around the pad
const R = tkRig({ eye: 2000, pitch: -22, yaw: -20 });
const K = 0.86, YAW = -26;
// Bre-X's rig at the left, set back; the partner's at the right, a step forward; the partner's core tray in front of its collar
const BREX_POSE = xfPose(-170, TK_FLOOR_Y, -260, K, YAW);
const PART_POSE = xfPose(600, TK_FLOOR_Y, 60, K, YAW);
// the partner's core tray: the FILM'S tray (bx_core BxTray, galvanised steel — the same tray the hook's and the crack's cores lie
//   in), its units ≈ 1 px per mm, posed at this pad's scale (RM px per metre)
// the concrete drill pad both rigs stand on, its expansion joints, and the palms around it
const PAD = { x0: -520, x1: 1180, z0: -700, z1: 640, h: 5 };
const PALMS = [
  { base: [-390, TK_FLOOR_Y, 430], h: 720, lean: [-0.14, 0.08], seed: 51 },
  { base: [980, TK_FLOOR_Y, -720], h: 560, lean: [0.1, -0.06], seed: 63 },
  { base: [1360, TK_FLOOR_Y, 520], h: 620, lean: [0.16, 0.06], seed: 77 }
];
const padParts = () => [part(boxAB([PAD.x0, TK_FLOOR_Y - PAD.h, PAD.z0], [PAD.x1, TK_FLOOR_Y, PAD.z1], 2), ["#0A1626", "#10233A", "#173352", "#2E5684", "#6F93BD"], { key: "pad", spec: 0.1, after: (map, rig) => /* @__PURE__ */ jsx("path", { d: [0.25, 0.5, 0.75].map((u) => path3(map, rig, [[PAD.x0 + u * (PAD.x1 - PAD.x0), TK_FLOOR_Y - PAD.h - 0.3, PAD.z0], [PAD.x0 + u * (PAD.x1 - PAD.x0), TK_FLOOR_Y - PAD.h - 0.3, PAD.z1]], false) + path3(map, rig, [[PAD.x0, TK_FLOOR_Y - PAD.h - 0.3, PAD.z0 + u * (PAD.z1 - PAD.z0)], [PAD.x1, TK_FLOOR_Y - PAD.h - 0.3, PAD.z0 + u * (PAD.z1 - PAD.z0)]], false)).join(""), stroke: "#0A1522", strokeOpacity: 0.45, strokeWidth: 1.4, fill: "none" }) })];
const TRAY_ROWS = 3, TRAY_K = K * 1.75 * RM / 1000;
const TRAY_POSE = xfPose(640, TK_FLOOR_Y, 430, TRAY_K, -18);
export const partnerTimes = (w, end) => {
  for (const k of ["s0", "march", "partner", "drilled", "test", "holes", "beside", "brexs"]) if (!Number.isFinite(w[k])) throw new Error(`partner: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // MARCH 1997 over the partner's rig, read on "March"
    date: { a: w.march - 14, b: w.march },
    // the partner's plate fills on "partner"; Bre-X's on "Bre-X's"
    plateP: { a: w.partner - 12, b: w.partner },
    plateB: { a: w.brexs - 12, b: w.brexs },
    // the partner's rig drills from the first frame and bites harder on "drilled" (the head feeds down, the string spins faster)
    bite: { a: w.drilled - 6, b: w.drilled + 10 },
    // its own core, piece by piece, into the tray's near row on "its own test holes"
    core: { a: w.drilled + 6, b: w.holes + 2 },
    // cameras: in to the partner's rig; riding down its string to the collar and tray; back to both rigs
    push: { a: w.partner - 14, dur: 26 },
    ride: { a: w.drilled + 2, b: w.holes + 2 },
    pull: { a: w.beside - 10, dur: 28 }
  };
  if (t.push.a + t.push.dur > t.ride.a + 6) throw new Error("partner: the push must land before the ride down");
  if (t.pull.a < t.core.b - 8) throw new Error("partner: the core must be in its tray before the pull-back");
  if (t.pull.a + t.pull.dur > end - 16) throw new Error("partner: the pull-back must settle before the crane out");
  return t;
};
const lay = (p) => ({ x: p[0], y: p[1] });
const PIV = 993, TOPMIN = 520, BOTMAX = 1620;
// the crown never rises into the caption headroom (that bound wins); the foot is kept in frame where it still fits
const fitY = (z, top, foot, want) => Math.min(top + (PIV - TOPMIN) / z, Math.max(foot - (BOTMAX - PIV) / z, want));
const MAST_B = lay(rigScr(R, BREX_POSE, [0.3, RIG.sheave.c[1] - RIG.sheave.r, 0])), MAST_P = lay(rigScr(R, PART_POSE, [0.3, RIG.sheave.c[1] - RIG.sheave.r, 0]));
const EXT = [...rigCasters(BREX_POSE), ...rigCasters(PART_POSE)].flatMap((c) => c.corners).map((q) => worldScr(R, q));
const LEFT = { x: Math.min(...EXT.map((p) => p[0])), y: Math.max(...EXT.map((p) => p[1])) }, RIGHT = { x: Math.max(...EXT.map((p) => p[0])), y: Math.max(...EXT.map((p) => p[1])) };
const TRAY_F = lay(worldScr(R, xfApply(TRAY_POSE, [0, 0, trayWidth(TRAY_ROWS) / 2 + 40])));
const TOP = Math.min(MAST_B.y, MAST_P.y, ...EXT.map((p) => p[1])), FOOT = Math.max(TRAY_F.y, LEFT.y, RIGHT.y);
const ZB = Math.min(0.98, 920 / (RIGHT.x - LEFT.x));
const BOTH = { x: (LEFT.x + RIGHT.x) / 2, y: fitY(ZB, TOP, FOOT, (TOP + FOOT) / 2) };
const P_HEAD = lay(rigScr(R, PART_POSE, [0.6, -2.2, 0])), P_COLLAR = lay(rigScr(R, PART_POSE, [0.5, -0.4, 0.3])), TRAY_C = lay(worldScr(R, xfApply(TRAY_POSE, [0, -40, 0])));
const ZP = 1.22;
// MARCH 1997 sits right of the partner's mast, over its power pack and clear above its exhaust stack
const EXH = lay(rigScr(R, PART_POSE, [2.62, -1.9, -0.28]));
const DATE_AT = { x: MAST_P.x + 215, y: MAST_P.y + 150 };
const shots = (t) => [
  // both rigs on the pad
  { a: -9999, z: ZB, push: 0.02, at: still(BOTH.x, BOTH.y) },
  // in to the partner's rig, its spinning string, its collar and its tray (its plate fills on "partner"), easing on down the string
  { a: t.push.a, dur: t.push.dur, z: ZP, push: 0.03, ride: { a: t.ride.a, b: t.ride.b }, at: (g) => {
    const e = rInOut(g, t.ride.a, t.ride.b);
    return { x: mix(P_HEAD.x + 60, P_COLLAR.x + 60, e), y: fitY(ZP, TOP, TRAY_F.y, mix(P_HEAD.y, (P_COLLAR.y + TRAY_C.y) / 2, e)) };
  } },
  // back to both: the partner's holes beside Bre-X's
  { a: t.pull.a, dur: t.pull.dur, z: ZB, push: 0.015, at: still(BOTH.x, BOTH.y) }
];
export const partnerCamWindows = (t) => actionCamWindows(shots(t));
export const partnerSfx = (t) => [
  { job: "label", a: t.date.a, b: t.date.b + 6, vol: 0.45 },
  // MARCH 1997
  { job: "label", a: t.plateP.a, b: t.plateP.b + 6, vol: 0.4 },
  // FREEPORT-McMoRAN fills on its plate
  { job: "mech", a: t.bite.a, b: t.ride.b + 4, vol: 0.55 },
  // the partner's drill biting (held)
  ...coreLandings(t).map((a) => ({ job: "click", a, b: a + 1, vol: 0.26 })),
  // each core piece setting into the tray
  { job: "label", a: t.plateB.a, b: t.plateB.b + 6, vol: 0.45 }
  // BRE-X fills on its plate
];
// the tray: rows 0–1 full of the partner's core; the near row (2) laid in piece by piece on "its own test holes" — each piece
//   lowered in from above its channel, fading in over its first 10 f as it comes down (nothing appears in place)
const NEAR = TRAY_ROWS - 1;
const RUNS = [
  [[0, 0.22, "saw", "break"], [0.225, 0.47, "break", "break"], [0.475, 0.61, "break", "block"], [0.64, 1, "saw", "saw"]],
  [[0, 0.34, "saw", "break"], [0.345, 0.52, "break", "break", "half"], [0.525, 0.79, "break", "break"], [0.795, 1, "break", "saw"]]
];
const NEAR_PIECES = [[0, 0.17], [0.175, 0.38], [0.385, 0.52], [0.525, 0.74], [0.745, 0.88], [0.885, 1]];
const NEAR_N = NEAR_PIECES.length;
const pieceWin = (t, k) => {
  const step = (t.core.b - t.core.a) / (NEAR_N + 2), a = t.core.a + k * step - 10;
  return { a, land: a + 10 + step * 2 };
};
// the contact frames of the pieces settling (never closer than 4 f)
const coreLandings = (t) => Array.from({ length: NEAR_N }, (_, k) => Math.round(pieceWin(t, k).land - 2)).reduce((kept, a) => kept.length && a - kept[kept.length - 1] < 4 ? kept : [...kept, a], []);
const NearRow = ({ t, f }) => /* @__PURE__ */ jsx(jsx_runtime.Fragment, { children: NEAR_PIECES.map(([u0, u1], k) => {
  const { a, land } = pieceWin(t, k);
  if (f < a) return null;
  const lift = 260 * (1 - rInOut(f, a, land)), op = rOut(f, a, a + 10);
  const len = (u1 - u0) * CORE_LEN, xc = -CORE_LEN / 2 + (u0 + u1) / 2 * CORE_LEN;
  const xf = xfMul(TRAY_POSE, coreXf(xc, trayCoreY - lift, trayRowZ(NEAR, TRAY_ROWS)));
  return /* @__PURE__ */ jsx("g", { opacity: op < 1 ? op : void 0, children: /* @__PURE__ */ jsx(BxCore, { id: `ptN${k}`, rig: R, xf, len, seed: 41 + k, pieces: [[0, 1, k ? "break" : "saw", k === NEAR_N - 1 ? "saw" : "break"]], probe: null }) }, k);
}) });
const DateLabel = ({ x, y, on, text }) => on <= 3e-3 ? null : /* @__PURE__ */ jsx("div", { "data-probe-label": "MARCH 1997 between the two masts", style: {
  position: "absolute",
  left: 0,
  top: 0,
  width: 520,
  textAlign: "center",
  transform: `translate(${(x - 260).toFixed(2)}px, ${(y - 70 + 12 * (1 - on)).toFixed(2)}px)`,
  opacity: clamp01(on),
  ...figure(64)
}, children: text });
export const BxPartner = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = partnerTimes(w, end);
  const on = (q) => rOut(f, q.a, q.b);
  // the partner's drill: a slow feed from the first frame, biting harder on "drilled"; Bre-X's parked, still
  const bite = rInOut(f, t.bite.a, t.bite.b);
  const head = RIG.head.top + 0.55 + 0.25 * clamp01((f - at + 30) / 160) + 0.75 * rInOut(f, t.bite.a, end + 10);
  const spin = (f - at) * 9 + 14 * Math.max(0, f - t.bite.a) * bite;
  const dateAt = DATE_AT;
  const casters = [...rigCasters(BREX_POSE), ...rigCasters(PART_POSE), ...palmCasters(PALMS), { corners: trayCorners(TRAY_POSE, TRAY_ROWS), k: 0.7 }];
  return /* @__PURE__ */ jsx(PlaceRoot, { children: /* @__PURE__ */ jsx(CamFn, { at: actionCam(shots(t)), children: /* @__PURE__ */ jsx("div", { "data-probe-leaving": travelling(f, partnerCamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ jsxs(Turn, { at, end, from: -6, to: 4, amp: 0.9, children: [
    /* @__PURE__ */ jsx(TkFloor, { id: "ptF", rig: R, at: { x: 520, z: 0 }, reach: 1350, casters, on: 1 - stage }),
    /* @__PURE__ */ jsx("div", { "data-probe": "bg", style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ jsx("svg", { width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: /* @__PURE__ */ jsx(PaintParts, { parts: padParts(), map: (q) => q, rig: R, id: "ptPad" }) }) }),
    /* @__PURE__ */ jsx(CanopyFloor, { id: "ptC", rig: R, f, at: { x: 460, z: -80 }, reach: 900, on: 1 - stage, stage }),
    /* @__PURE__ */ jsx(Palms, { id: "ptPl", rig: R, palms: PALMS, f }),
    /* @__PURE__ */ jsx(DrillRig, { id: "ptB", rig: R, pose: BREX_POSE, model: "a", head: RIG.head.top, spin: 0, run: 0, plate: L("partnerBrex"), plateOn: on(t.plateB), lamp: 0.18, f, probe: "Bre-X's rig, idle" }),
    /* @__PURE__ */ jsx(DrillRig, { id: "ptP", rig: R, pose: PART_POSE, model: "b", helix: 1, head, spin, run: 0.5 + 0.5 * bite, plate: L("partnerPlate"), plateOn: on(t.plateP), lamp: 0.5, f, probe: "the partner's rig, drilling" }),
    /* @__PURE__ */ jsx("div", { "data-probe-object": "the partner's core tray (the film's galvanised tray) and its own core", style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ jsx("svg", { width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: /* @__PURE__ */ jsx(BxTray, { id: "ptT", rig: R, xf: TRAY_POSE, rows: TRAY_ROWS, cores: [{ seed: 31, pieces: RUNS[0] }, { seed: 37, pieces: RUNS[1] }], hero: NEAR, heroEl: () => /* @__PURE__ */ jsx(NearRow, { t, f }), probe: null }) }) }),
    /* @__PURE__ */ jsx(DateLabel, { x: dateAt.x, y: dateAt.y, on: on(t.date), text: L("partnerDate") })
  ] }) }) }) });
};
