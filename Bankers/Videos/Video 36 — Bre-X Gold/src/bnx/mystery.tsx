// @ts-nocheck
// ★ V36 "Bre-X Gold" — place `mystery` (builder M). "On March nineteenth, chief geologist Michael de Guzman fell from a helicopter."
//   PLAIN AND RESPECTFUL (PLAN.md): no person, no fall, no speculation. A small utility helicopter (mystery_heli: blue-steel body,
//   graphite running gear, its rotor already turning) stands on a raised jungle helipad at dusk (mystery_pad: the plank deck, its
//   painted H and touchdown circle, sixteen perimeter lights glowing in the dusk). MARCH 19, 1997 (mysteryDate)
//   lands on "March nineteenth"; on his name MICHAEL DE GUZMAN (mysteryName) with CHIEF GEOLOGIST (mysteryRole) beneath it. Then the
//   helicopter LIFTS — a short hover off the H, a pedal turn to the right — and flies out of the frame to the RIGHT, climbing only a
//   little (its highest point stays well under the caption band: it never passes behind a chip): it leaves, nothing falls. The pad
//   stays, empty, its lights on. The camera is quiet: one framing and a slow creep.
//   Objects: the helicopter, the helipad (+ the date and the two name labels).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mix, rIn, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn, label } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { worldScr, worldView, xfMul, xfRotY, xfRotZ, xfScale, xfTrans } from "./tk_rig";
import { TkFloor } from "./tk_floor";
import { BX_FLOOR_Y, bxRig } from "./bx_core";
import { MyHeli, heliCorners } from "./mystery_heli";
import { DeckShadow, PAD, PadBase, PadLights, padCorners, padPoint } from "./mystery_pad";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const FY = BX_FLOOR_Y;
const X = 540, Z = 0;
const POSE = xfTrans([X, FY, Z]);
const RIG = bxRig({ cx: 540, cy: FY - 560, yaw: -20, pitch: -13, lens: 3200 });
const HEAD = -34;
// the helicopter at 1.3× its modelled units: ≈ 950 long and a 970 rotor over the 880 deck (a small helicopter on a TLOF its size)
const K = 1.3;
const KEYS = ["s0", "march", "k19", "chief", "geologist", "michael", "guzman", "fell", "helicopter"];
export const mysteryTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`mystery: the take has no word frame "${k}"`);
  const L0 = Math.min(w.fell - 18, end - 64);
  const t = {
    w,
    end,
    // MARCH 19, 1997 — fully read on "nineteenth"
    date: { a: w.k19 - 18, b: w.k19 },
    // MICHAEL DE GUZMAN on "Michael", CHIEF GEOLOGIST beneath it a beat after (fully read on "Guzman")
    name: { a: w.michael - 16, b: w.michael + 2 },
    role: { a: w.michael - 4, b: Math.min(w.guzman, w.michael + 12) },
    // the lift: a hover off the H and a pedal turn to the right, then forward flight out through the right edge (≈ 50 f after the
    //   lift on the provisional take), before the crane takes the empty pad away
    hover: { a: L0, b: L0 + 16 },
    turn: { a: L0 + 3, b: L0 + 32 },
    fly: { a: L0 + 12, b: end - 10 }
  };
  if (t.date.b > t.name.a) throw new Error("mystery: the date must land before the name");
  if (t.role.b > t.hover.a + 4) throw new Error(`mystery: the name labels must have landed before the helicopter lifts (${t.role.b} vs ${t.hover.a})`);
  if (t.fly.b - t.fly.a < 40) throw new Error("mystery: the departure needs ≥ 40 f before the hand-over");
  return t;
};
// the departure (world units): a hover off the H, a pedal turn from HEAD to HEAD_OUT (its nose square to the right of the frame),
//   then forward flight along that heading, accelerating from rest, climbing 140 units. On screen (scratchpad check of the projected
//   rotor disc, tail and skids under the place's camera) its highest point stays ≥ y 530 and it is wholly past the right edge
//   ≈ 50 f after the lift.
const HOVER = 44, HEAD_OUT = 14, FLY = 2300, CLIMB = 140;
const DIR = [Math.cos(HEAD_OUT * Math.PI / 180), 0, -Math.sin(HEAD_OUT * Math.PI / 180)];
const flight = (t, g) => {
  const hv = rInOut(g, t.hover.a, t.hover.b);
  const p = clamp01((g - t.fly.a) / (t.fly.b - t.fly.a));
  const fwd = FLY * Math.pow(p, 1.6);
  return {
    h: HOVER * hv + CLIMB * rInOut(g, t.fly.a, t.fly.b),
    dx: DIR[0] * fwd,
    dz: DIR[2] * fwd,
    head: HEAD + (HEAD_OUT - HEAD) * rInOut(g, t.turn.a, t.turn.b),
    // the nose dips as it accelerates into forward flight
    pitch: 5 * rInOut(g, t.fly.a, t.fly.a + 24)
  };
};
const heliXf = (t, g) => {
  const fl = flight(t, g);
  return xfMul(xfTrans([X + fl.dx, FY - PAD.top - fl.h, Z + fl.dz]), xfMul(xfRotY(fl.head), xfMul(xfRotZ(fl.pitch), xfScale(K))));
};
const scr = (q) => {
  const p = worldScr(RIG, q);
  return { x: p[0], y: p[1] };
};
// the label block under the pad's front edge (place coordinates)
const FRONT = scr(padPoint(POSE, "front"));
const MID = scr(padPoint(POSE, "top"));
const LAB = { x: MID.x - 40, y0: FRONT.y + 30 };
const shots = (t) => [
  // the pad and the helicopter, a slow creep
  // (one framing, a slow creep and nothing else: the camera stays quiet while the helicopter leaves — no move to score)
  { a: -9999, z: 0.9, push: 0.03, at: () => ({ x: MID.x - 70, y: MID.y - 60 }) }
];
export const mysteryCamWindows = (t) => actionCamWindows(shots(t));
export const mysterySfx = (t) => [
  // MARCH 19, 1997
  { job: "label", a: t.date.a, b: t.date.b + 6, vol: 0.4 },
  // the name and his role
  { job: "label", a: t.name.a, b: t.name.b + 6, vol: 0.4 },
  // the helicopter flies away to the right (one soft whoosh peaking as it crosses the frame — nothing louder: the line is a death,
  //   stated plainly)
  { job: "obj", a: t.fly.a, b: t.fly.a + 70, k: "io", vol: 0.4 },
  // ★ (integrator, sfxgaps 850–871) the hover off the H and the pedal turn moved with no sound under them (the departure's whoosh
  //   is only audible from ~868): a quieter soft whoosh carries the lift and the turn
  { job: "obj", a: t.hover.a, b: t.turn.b, k: "io", vol: 0.3 }
];
const Label = ({ x, y, w = 760, size, color, on, text, probe }) => {
  if (on <= 3e-3) return null;
  return jsx("div", { "data-probe-label": probe, style: { position: "absolute", left: x - w / 2, top: y, width: w, height: size + 8, opacity: clamp01(on), transform: `translateY(${((1 - on) * 24).toFixed(2)}px)` }, children: jsx("div", { style: { position: "absolute", left: 0, top: 0, width: w, textAlign: "center", ...label(size, color) }, children: text }) });
};
export const BxMystery = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = mysteryTimes(w, end);
  const xf = heliXf(t, f);
  const fl = flight(t, f);
  const rot = 0.21 * (f - at) + 0.4;
  const tail = -0.33 * (f - at);
  const glint = Math.pow(0.5 + 0.5 * Math.sin((f - at) / 6.5), 10);
  const split = worldView(RIG, padPoint(POSE, "top"))[2] + 120;
  const casters = [{ corners: padCorners(POSE) }, { corners: heliCorners(xf), k: 0.6 }];
  const lab = { date: rOut(f, t.date.a, t.date.b), name: rOut(f, t.name.a, t.name.b), role: rOut(f, t.role.a, t.role.b) };
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: actionCam(shots(t)), children: jsx("div", { "data-probe-leaving": travelling(f, mysteryCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -4, to: 3, amp: 0.6, children: [
    jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(TkFloor, { id: "myF", rig: RIG, at: { x: X, z: Z + 140 }, reach: 1500, casters, stage, on: 1 - clamp01(stage) }) }),
    jsx("div", { "data-probe-object": "the helipad and its lights", style: { position: "absolute", inset: 0 }, children: jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsx(PadBase, { id: "myP", rig: RIG, pose: POSE }),
      jsx(PadLights, { id: "myLf", rig: RIG, pose: POSE, which: "far", split, g: f })
    ] }) }),
    // the helicopter (it leaves through the right edge, under the caption band all the way; its shadow on the deck goes with it and
    //   fades off the deck's edge)
    jsx("div", { style: { position: "absolute", inset: 0 }, children: jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsx(DeckShadow, { rig: RIG, pose: POSE, x: fl.dx, z: fl.dz, h: fl.h, rx: 330 * K, rz: 95 * K, op: 0.55 * clamp01((PAD.half + 40 - Math.abs(fl.dx)) / 260) }),
      jsx(MyHeli, { id: "myH", rig: RIG, xf, rot, tail, glint })
    ] }) }),
    jsx("div", { style: { position: "absolute", inset: 0 }, children: jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(PadLights, { id: "myLn", rig: RIG, pose: POSE, which: "near", split, g: f }) }) }),
    jsx(Label, { x: LAB.x, y: LAB.y0, size: 34, color: "#A9C6EA", on: lab.date, text: L("mysteryDate"), probe: "MARCH 19, 1997" }),
    jsx(Label, { x: LAB.x, y: LAB.y0 + 62, size: 56, color: "#EFF5FB", on: lab.name, text: L("mysteryName"), probe: "MICHAEL DE GUZMAN" }),
    jsx(Label, { x: LAB.x, y: LAB.y0 + 136, size: 30, color: "#84B0E4", on: lab.role, text: L("mysteryRole"), probe: "CHIEF GEOLOGIST" })
  ] }) }) }) });
};
