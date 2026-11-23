// @ts-nocheck
// Video 36 "Bre-X Gold" — place "claim" (builder B, 2026-11-23): "In nineteen ninety-three, a tiny Calgary miner called Bre-X
//   bought a jungle gold project in Borneo, Indonesia."
//   A drill pad at Busang as a real construction: a skid-mounted core-drill rig drilling (its rods turning, the head feeding down,
//   return water rippling out of the mud at the collar, its work lamp lit — flare 1 recedes into that lamp) and, beside it, a
//   stack of wooden CORE BOXES stencilled BUSANG on a pallet, the top box open on its rows of grey core. The jungle is implied by
//   the light alone (canopy dapples, frond and vine shadows on the pad). The camera opens on the rig (1993 lands beside it), RIDES
//   to the boxes (CALGARY, then BRE-X over the stack), and pulls back to the whole pad for "Borneo, Indonesia".
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mix, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn, figure, label } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { worldScr, xfApply, xfPose } from "./tk_rig";
import { TK_FLOOR_Y, tkRig } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { DrillRig, RIG, RM, rigCasters, rigScr } from "./claim_rig";
import { BOX, BOX_STEP, PALLET_H, coreBoxParts, palletParts, stackCorners } from "./claim_boxes";
import { PaintParts, PartPrints } from "./claim_kit";
import { CanopyFloor } from "./claim_canopy";
import { Palms, palmCasters } from "./claim_palm";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs;
const R = tkRig({ eye: 1500, pitch: -14 });
// the pad: the rig at the left (its mast at its left end), the stack of core boxes in front of it to the right
const RIG_POSE = xfPose(130, TK_FLOOR_Y, -220, 1.12, 0);
const STACK_POSE = xfPose(1010, TK_FLOOR_Y, 340, 1.35, 0);
const N_CLOSED = 4;
// ★ REV1: palm trees around the pad (Borneo) — behind the rig at its left, behind the pad's right, and one at the far right; each
//   about the mast's height, never over the rig, the boxes or the labels, crowns under the caption headroom in every framing
const PALMS_BACK = [
  { base: [40, TK_FLOOR_Y, -760], h: 480, lean: [-0.1, -0.02], seed: 11 },
  { base: [470, TK_FLOOR_Y, -820], h: 530, lean: [0.04, -0.03], seed: 23 },
  // ★ (Timur, 2026-11-23: "the really right one is just too far off … make it more closer to the Bre-X visual"): just behind the
  //   stack's right end, leaning away from BRE-X, so trunk and crown read in the whole-pad framing
  { base: [1820, TK_FLOOR_Y, 160], h: 440, lean: [0.04, 0.02], seed: 37 }
];
const sm = (pose, q) => worldScr(R, xfApply(pose, [q[0] * RM, q[1] * RM, q[2] * RM]));
const STACK_TOP = -(PALLET_H + (N_CLOSED + 1) * BOX_STEP);
// ★ labels: claimPlate "BRE-X · 1993" is one interpunct chain (STYLE §2.5.5) — this place shows BRE-X and 1993 as TWO labels,
//   each on its own word. Until episode.json carries claimBrex / claimYear (asked in the handback) they are split from claimPlate.
const plateParts = () => {
  const brex = L("claimBrex"), year = L("claimYear");
  if (brex && year) return { brex, year };
  const p = (L("claimPlate") ?? "").split(/\s*·\s*/);
  if (p.length !== 2 || !/^\d{4}$/.test(p[1])) throw new Error(`claim: claimPlate "${L("claimPlate")}" is not "<name> · <year>"`);
  return { brex: p[0], year: p[1] };
};
export const claimTimes = (w, end) => {
  for (const k of ["s0", "k1993", "tiny", "calgary", "brex", "bought", "jungle", "gold", "borneo", "indonesia"]) if (!Number.isFinite(w[k])) throw new Error(`claim: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // 1993 lands beside the rig, fully read on "1993"
    year: { a: w.k1993 - 14, b: w.k1993 },
    // the ride from the rig to the boxes, starting after 1993 is read
    ride: { a: Math.max(w.k1993 + 22, w.tiny - 12), dur: 40 },
    // CALGARY (small) then BRE-X over the stack, each on its word
    city: { a: w.calgary - 12, b: w.calgary },
    brex: { a: w.brex - 12, b: w.brex },
    // the canopy stirs on "jungle gold"
    gust: { a: w.jungle - 10, b: w.gold + 24 },
    // back to the whole pad for "Borneo, Indonesia"
    pull: { a: w.borneo - 16, dur: 34 }
  };
  if (t.city.b < t.ride.a + 10) throw new Error("claim: CALGARY must land after the camera has left the rig");
  if (t.brex.b > t.pull.a) throw new Error("claim: BRE-X must be read before the pull-back");
  if (t.pull.a + t.pull.dur > end - 16) throw new Error("claim: the pull-back must settle before the crane out");
  return t;
};
const lay = (p) => ({ x: p[0], y: p[1] });
// the framings are DERIVED from the construction (never typed): screen y = PIV + z·(y − aim.y); the mast's crown keeps ≥ ~70 px
//   under the caption headroom (450) in the rig and whole framings
const PIV = 993, SAFE_TOP = 520;
const MAST_TOP = lay(rigScr(R, RIG_POSE, [0.3, RIG.sheave.c[1] - RIG.sheave.r, 0]));
const RIG_L = lay(rigScr(R, RIG_POSE, [-1.25, 0, -0.3])), RIG_R = lay(rigScr(R, RIG_POSE, [RIG.skid.x1, 0, 0.5]));
const RIG_FOOT = lay(rigScr(R, RIG_POSE, [1.5, 0, 0.6]));
const STACK_R = lay(sm(STACK_POSE, [0.85, 0, 0.3]));
const aimFor = (z, cx, top, foot) => ({ x: cx, y: Math.max(top.y - (SAFE_TOP - PIV) / z, (top.y + foot.y) / 2) });
const RIG_Z = 1.14;
const RIG_C = aimFor(RIG_Z, (RIG_L.x + RIG_R.x) / 2 + 40, MAST_TOP, RIG_FOOT);
const STACK_C = lay(sm(STACK_POSE, [0, STACK_TOP * 0.5 - 0.3, 0]));
// the whole pad takes in the palms either side (their trunks)
// the whole pad is framed on the rig and the stack (both wholly in, balanced); the palms stand in the back row behind them
// ★ (Timur, 2026-11-23) the whole pad also takes in the right palm beside the stack (its trunk and crown), so it reads near BRE-X;
//   it stands right of the stack's close-up, so it never looms over the CALGARY / BRE-X framing
const PALM_R = lay(worldScr(R, [PALMS_BACK[2].base[0] + 170, PALMS_BACK[2].base[1], PALMS_BACK[2].base[2]]));
const W_L = RIG_L.x - 40, W_R = Math.max(STACK_R.x, PALM_R.x) + 40;
const WHOLE_Z = Math.min(0.92, 1000 / (W_R - W_L));
const WHOLE = aimFor(WHOLE_Z, (W_L + W_R) / 2, MAST_TOP, RIG_FOOT);
const shots = (t) => [
  // the rig, drilling (1993 beside it)
  { a: -9999, z: RIG_Z, push: 0.02, at: still(RIG_C.x, RIG_C.y) },
  // the ride to the stack of boxes, closing in on it
  //   (it travels sideways first at the rig's zoom, so the rig and the palms behind it leave by the left edge before the push-in
  //   lifts anything toward the caption band)
  { a: t.ride.a, dur: 26, z: RIG_Z, push: 0, at: still(STACK_C.x, RIG_C.y) },
  { a: t.ride.a + 14, dur: t.ride.dur - 4, z: 1.75, push: 0.02, at: still(STACK_C.x, STACK_C.y) },
  // back to the whole pad
  //   (it zooms out over the stack first, then pans left onto the whole pad, so the palms come in sideways, never down through
  //   the caption band)
  { a: t.pull.a, dur: 22, z: WHOLE_Z, push: 0, at: still(STACK_C.x - 60, WHOLE.y) },
  { a: t.pull.a + 10, dur: t.pull.dur - 10, z: WHOLE_Z, push: 0.015, at: still(WHOLE.x, WHOLE.y) }
];
export const claimCamWindows = (t) => actionCamWindows(shots(t));
export const claimSfx = (t) => [
  // the rig drilling while it is on screen (a held machine run, steady level)
  { job: "mech", a: t.w.s0 + 2, b: t.ride.a + 26, vol: 0.4 },
  { job: "label", a: t.year.a, b: t.year.b + 6, vol: 0.45 },
  // 1993
  { job: "label", a: t.city.a, b: t.city.b + 6, vol: 0.35 },
  // CALGARY
  { job: "label", a: t.brex.a, b: t.brex.b + 6, vol: 0.5 }
  // BRE-X
];
// a floating label: eases in (rises 12 px) — never typed text: L() only
const FloatLabel = ({ x, y, on, text, size, sub, probe }) => {
  if (on <= 3e-3) return null;
  const Wd = 520;
  return /* @__PURE__ */ jsx("div", { "data-probe-label": probe, style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: Wd,
    textAlign: "center",
    transform: `translate(${(x - Wd / 2).toFixed(2)}px, ${(y - size + 12 * (1 - on)).toFixed(2)}px)`,
    opacity: clamp01(on),
    ...sub ? label(size, "#A9C6EA") : figure(size)
  }, children: text });
};
const stackParts = (sc) => {
  const ps = [...palletParts("pl", sc)];
  for (let i = 0; i <= N_CLOSED; i++) {
    const y0 = -(PALLET_H + i * BOX_STEP), open = i === N_CLOSED;
    const from = (i * 4.5).toFixed(1), to = ((i + 1) * 4.5).toFixed(1);
    ps.push(...coreBoxParts(`bx${i}`, y0, {
      open,
      seed: 11 + i * 7,
      sc,
      layer: i,
      pose: open ? STACK_POSE : void 0,
      stencil: L("claimStencil"),
      boxNo: `BOX ${i + 1}`,
      // decorative box print (a generic diamond-drill-hole id and the box's depth range), not a figure of the story
      endText: ["DDH-1", `${from}–${to} M`]
    }));
  }
  return ps;
};
export const BxClaim = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = claimTimes(w, end);
  const { brex, year } = plateParts();
  // labels ease in on an in-out curve from 4 f before their window (an out-curve put ~20% of the label on its first frame: popscan)
  const on = (q) => rInOut(f, q.a - 4, q.b);
  const smap = (q) => xfApply(STACK_POSE, q);
  // the drill: the head feeds down through the place, the chuck turns, the lamp settles from the flare's bloom to its own glow
  const head = RIG.head.top + 0.2 + 0.85 * rInOut(f, at - 30, end + 30);
  const spin = (f - at) * 13;
  const lamp = 1 - 0.5 * rInOut(f, at + 4, at + 46);
  const yearAt = lay(rigScr(R, RIG_POSE, [1.84, -1.86, 0]));
  const top = sm(STACK_POSE, [0, STACK_TOP, 0]);
  const casters = [...rigCasters(RIG_POSE), { corners: stackCorners(STACK_POSE, N_CLOSED + 1), k: 0.9 }];
  const stack = stackParts(1.35);
  casters.push(...palmCasters(PALMS_BACK));
  return /* @__PURE__ */ jsx(PlaceRoot, { children: /* @__PURE__ */ jsx(CamFn, { at: actionCam(shots(t)), children: /* @__PURE__ */ jsx("div", { "data-probe-leaving": travelling(f, claimCamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ jsxs(Turn, { at, end, from: -6, to: 4, amp: 0.9, children: [
    /* @__PURE__ */ jsx(TkFloor, { id: "clF", rig: R, at: { x: 640, z: 40 }, reach: 1350, casters, on: 1 - stage }),
    /* @__PURE__ */ jsx(CanopyFloor, { id: "clC", rig: R, f, at: { x: 640, z: 40 }, reach: 900, gust: rInOut(f, t.gust.a, t.gust.a + 14) * (1 - rInOut(f, t.gust.b - 14, t.gust.b)), on: 1 - stage, stage }),
    /* @__PURE__ */ jsx(Palms, { id: "clP", rig: R, palms: PALMS_BACK, f }),
    /* @__PURE__ */ jsx(DrillRig, { id: "clR", rig: R, pose: RIG_POSE, head, spin, run: 1, plate: "", lamp, f, probe: "the Busang core-drill rig" }),
    /* @__PURE__ */ jsxs("div", { "data-probe-object": "the stack of BUSANG core boxes", style: { position: "absolute", inset: 0 }, children: [
      /* @__PURE__ */ jsx("svg", { width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: /* @__PURE__ */ jsx(PaintParts, { parts: stack, map: smap, rig: R, id: "clS" }) }),
      /* @__PURE__ */ jsx(PartPrints, { parts: stack, rig: R, pose: STACK_POSE, id: "clSt" })
    ] }),
    /* @__PURE__ */ jsx(FloatLabel, { x: yearAt.x, y: yearAt.y, on: on(t.year), text: year, size: 92, probe: "1993 beside the rig" }),
    /* @__PURE__ */ jsx(FloatLabel, { x: top[0], y: top[1] - 178, on: on(t.city), text: L("claimCity"), size: 30, sub: true, probe: "CALGARY over the stack" }),
    /* @__PURE__ */ jsx(FloatLabel, { x: top[0], y: top[1] - 88, on: on(t.brex), text: brex, size: 84, probe: "BRE-X over the stack" })
  ] }) }) }) });
};
