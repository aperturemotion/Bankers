// @ts-nocheck
// Video 36 "Bre-X Gold" — the exploration core-drill rig of claim and partner (builder B, 2026-11-23). A skid-mounted diamond
//   core rig built from its real parts: twin skid runners under a tread-plate deck; a box-section mast (two rails, rungs, cross
//   braces, a guide plate) with its crown, cheek plates and wireline sheave, braced by two raising struts; the drill head riding
//   the mast (graphite body, carriage plate, hydraulic motor, water swivel, a chuck whose jaw bolts turn); the rod string through
//   the foot clamp into the casing at the collar; the power pack (radiator grille, louvres, exhaust stack, an engraved maker's
//   plate), the hydraulic tank, the wireline winch, the control panel (gauges, levers), hoses and the work lamp.
//   Local units: metres × RM px, x along the skid, y up negative, z toward the camera; the origin is the collar on the ground.
import * as jsx_runtime from "react/jsx-runtime";
import { rampAt } from "./solid_engine";
import { mapScr, xfApply } from "./tk_rig";
import { Screw } from "./counter_plinth";
import { label } from "./kit";
import { SHOUT } from "./fonts";
import { PaintParts, PartPrints, add3, bez3, boxAB, cylAB, extrudeZ, f2, faces, mul3, part, path3, ring3 } from "./claim_kit";
import { DECAL_INK, DECAL_PLATE, LAMP_GLOW, LAMP_HOT, MUD, MUD_SHEEN, RG_BODY, RG_DECK, RG_FRAME as RG_FRAME_A, RG_FRAME_B, RG_PACK_B, RG_PLATE, RG_RUBBER, RG_STEEL, RG_WALL } from "./claim_mat";
import { PL_GROOVE, PL_LIP } from "./counter_mat";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs;
export const RM = 200;
const m3 = (p) => mul3(p, RM);
const B = (a, b, bev = 0) => boxAB(m3(a), m3(b), bev * RM);
const C = (a, b, r, s = 14) => cylAB(m3(a), m3(b), r * RM, s);
// ── the rig's dimensions (metres) — one copy; the places read their points from here ────────────────────────────────────────
export const RIG = {
  deckTop: -0.29,
  skid: { x0: 0.12, x1: 3.04, z: 0.56 },
  mast: { x0: 0.24, x1: 0.6, top: -3.8, rail: 0.08, zr: 0.09 },
  sheave: { c: [0.05, -4.03], r: 0.11 },
  lamp: { lens: [0.375, -3.9, 0.262] },
  head: { top: -3.45, low: -1.15, h: 0.42 },
  pack: { x0: 1.32, x1: 2.88, y0: -1.32, z: 0.5 },
  plate: { x0: 1.42, x1: 2.78, y0: -1.2, y1: -0.92, z: 0.53 },
  collar: [0, 0, 0],
  rodR: 0.035
};
// the water tank stands behind the mast, off the skid's far side (x, z in metres)
const WT = [-0.85, -0.62];
const RUNGS = Array.from({ length: 8 }, (_, k) => -0.62 - k * 0.42);
const memo = /* @__PURE__ */ new Map();
// two models: "a" (Bre-X's: steel-blue frame, graphite pack) and "b" (the partner's: graphite frame, pale blue-steel pack and roof)
const paint = (model) => model === "b" ? { frame: RG_FRAME_B, pack: RG_PACK_B, roof: RG_PACK_B } : { frame: RG_FRAME_A, pack: RG_BODY, roof: RG_FRAME_A };
const statics = (model = "a") => {
  if (memo.has(model)) return memo.get(model);
  const { frame: RG_FRAME, pack: RG_PACK, roof: RG_ROOF } = paint(model);
  const runner = (z0, z1) => extrudeZ([[0.16, -0.2], [3.0, -0.2], [3.0, -0.08], [2.9, 0], [0.26, 0], [0.16, -0.08]].map(([x, y]) => [x * RM, y * RM]), z0 * RM, z1 * RM, 4);
  const { x0: mx0, x1: mx1, top: mt, zr } = RIG.mast;
  const P = (k, f, ramp, o) => ({ key: k, f, ramp, o });
  const list = [
    // the skid: twin runners, the tread-plate deck, the mast's foot plate
    P("runN", runner(0.36, 0.48), RG_FRAME, { spec: 0.55 }),
    P("runF", runner(-0.48, -0.36), RG_FRAME, { spec: 0.55 }),
    P("deck", B([RIG.skid.x0, RIG.deckTop, -RIG.skid.z], [RIG.skid.x1, -0.2, RIG.skid.z], 0.012), RG_DECK, { spec: 0.35, bias: -2e3 }),
    P("mfoot", B([0.18, -0.36, -0.2], [0.66, RIG.deckTop, 0.2], 0.01), RG_FRAME, { spec: 0.6, bias: -300 }),
    // the mast: two rails (left and right), rungs and cross braces on its front and back faces, the guide plate the head rides,
    //   the crown, the sheave between its cheek plates
    P("railL", B([mx0, mt, -zr], [mx0 + RIG.mast.rail, -0.36, zr], 0.01), RG_FRAME, { spec: 0.6 }),
    P("railR", B([mx1 - RIG.mast.rail, mt, -zr], [mx1, -0.36, zr], 0.01), RG_FRAME, { spec: 0.6 }),
    P("guide", B([0.212, mt + 0.05, -0.07], [0.242, -0.4, 0.07], 0.005), RG_STEEL, { spec: 0.8 }),
    ...RUNGS.flatMap((y, k) => [-1, 1].map((s) => P(`rung${k}${s}`, B([mx0 + RIG.mast.rail, y - 0.022, s > 0 ? zr - 0.035 : -zr], [mx1 - RIG.mast.rail, y + 0.022, s > 0 ? zr : -zr + 0.035], 0.005), RG_FRAME, { spec: 0.5, bias: s * 8 }))),
    ...RUNGS.slice(0, -1).flatMap((y, k) => [-1, 1].map((s) => P(`brace${k}${s}`, C([k % 2 ? mx0 + RIG.mast.rail : mx1 - RIG.mast.rail, y - 0.02, s * (zr - 0.018)], [k % 2 ? mx1 - RIG.mast.rail : mx0 + RIG.mast.rail, RUNGS[k + 1] + 0.02, s * (zr - 0.018)], 0.012, 8), RG_FRAME, { spec: 0.5, bias: s * 6 }))),
    P("crown", B([-0.1, mt - 0.12, -0.16], [0.66, mt, 0.16], 0.012), RG_FRAME, { spec: 0.6 }),
    P("cheekF", B([-0.1, RIG.sheave.c[1] - 0.14, -0.065], [0.2, mt - 0.12, -0.045], 0.004), RG_FRAME, { spec: 0.6 }),
    P("sheave", C([RIG.sheave.c[0], RIG.sheave.c[1], -0.035], [RIG.sheave.c[0], RIG.sheave.c[1], 0.035], RIG.sheave.r, 22), RG_STEEL, { spec: 0.8 }),
    P("cheekN", B([-0.1, RIG.sheave.c[1] - 0.14, 0.045], [0.2, mt - 0.12, 0.065], 0.004), RG_FRAME, { spec: 0.6 }),
    // the raising struts and their clevis blocks
    ...[-1, 1].flatMap((s) => [
      P(`strut${s}`, C([0.6, -2.45, s * 0.07], [1.28, -0.32, s * 0.4], 0.034, 12), RG_FRAME, { spec: 0.65 }),
      P(`clev${s}`, B([1.2, -0.4, s * 0.42 - 0.05], [1.36, RIG.deckTop, s * 0.42 + 0.05], 0.008), RG_STEEL, { spec: 0.7 })
    ]),
    // the work lamp on the near rail (bracket + housing; its lens is a decal)
    P("lampArm", B([0.35, -3.83, 0.1], [0.4, -3.8, 0.18], 0.004), RG_STEEL, { spec: 0.7 }),
    P("lamp", B([0.3, -3.98, 0.15], [0.45, -3.83, 0.26], 0.012), RG_BODY, { spec: 0.6 }),
    // the power pack, its exhaust stack and cap, fuel filler
    P("pack", B([RIG.pack.x0, RIG.pack.y0, -RIG.pack.z], [RIG.pack.x1, RIG.deckTop, RIG.pack.z], 0.03), RG_PACK, { spec: 0.5, lift: model === "b" ? 0 : 0.07 }),
    P("plate", B([RIG.plate.x0, RIG.plate.y0, RIG.pack.z - 0.01], [RIG.plate.x1, RIG.plate.y1, RIG.plate.z], 0.006), RG_PLATE, { spec: 0.7, bias: 40 }),
    P("exh", C([2.62, RIG.pack.y0, -0.28], [2.62, -1.86, -0.28], 0.05, 14), RG_STEEL, { spec: 0.7 }),
    P("exhCap", B([2.55, -1.9, -0.35], [2.69, -1.86, -0.21], 0.006), RG_BODY, { spec: 0.6 }),
    P("fuel", C([2.25, RIG.pack.y0, 0.3], [2.25, RIG.pack.y0 - 0.035, 0.3], 0.045, 14), RG_STEEL, { spec: 0.7 }),
    // the hydraulic tank and its filler
    P("tank", B([0.62, -0.88, -0.5], [1.24, RIG.deckTop, -0.06], 0.02), RG_BODY, { spec: 0.5 }),
    P("tankCap", C([0.9, -0.88, -0.3], [0.9, -0.93, -0.3], 0.05, 14), RG_STEEL, { spec: 0.7 }),
    // the wireline winch: frame plates, drum, flanges
    P("winchF", B([0.74, -0.62, -0.02], [1.02, RIG.deckTop, 0.01], 0.004), RG_FRAME, { spec: 0.5 }),
    P("drum", C([0.88, -0.56, 0.04], [0.88, -0.56, 0.42], 0.16, 22), RG_STEEL, { spec: 0.6 }),
    P("flangeF", C([0.88, -0.56, 0.015], [0.88, -0.56, 0.04], 0.22, 22), RG_STEEL, { spec: 0.7 }),
    P("flangeN", C([0.88, -0.56, 0.42], [0.88, -0.56, 0.445], 0.22, 22), RG_STEEL, { spec: 0.7, bias: 20 }),
    P("winchN", B([0.74, -0.62, 0.445], [1.02, RIG.deckTop, 0.475], 0.004), RG_FRAME, { spec: 0.5, bias: 30 }),
    // the control panel, its console and posts
    P("postL", B([0.5, -1.02, 0.46], [0.54, RIG.deckTop, 0.5], 0.004), RG_FRAME, { spec: 0.5 }),
    P("postR", B([0.9, -1.02, 0.46], [0.94, RIG.deckTop, 0.5], 0.004), RG_FRAME, { spec: 0.5 }),
    P("panel", B([0.46, -1.46, 0.43], [0.98, -1.1, 0.52], 0.012), RG_BODY, { spec: 0.5 }),
    P("console", B([0.48, -1.1, 0.4], [0.96, -1.02, 0.56], 0.01), RG_BODY, { spec: 0.5, bias: 10 }),
    ...[0.56, 0.67, 0.78, 0.89].map((x, k) => P(`lever${k}`, C([x, -1.1, 0.5], [x, -1.27, 0.58 - k * 0.006], 0.012, 8), RG_STEEL, { spec: 0.8, bias: 60 })),
    ...[0.56, 0.67, 0.78, 0.89].map((x, k) => P(`knob${k}`, B([x - 0.025, -1.31, 0.56 - k * 0.006], [x + 0.025, -1.26, 0.61 - k * 0.006], 0.01), RG_RUBBER, { spec: 0.4, bias: 70 })),
    // the foot clamp on its bracket, and the casing at the collar
    P("bracket", B([-0.2, -0.36, -0.2], [0.24, -0.3, 0.2], 0.008), RG_FRAME, { spec: 0.6, bias: 50 }),
    P("clamp", B([-0.15, -0.53, -0.15], [0.14, -0.36, 0.15], 0.014), RG_BODY, { spec: 0.55, bias: 60 }),
    P("casing", C([0, -0.13, 0], [0, 0, 0], 0.068, 18), RG_STEEL, { spec: 0.6 }),
    // ★ REV1 detail — the rod rack on the far side (two trestles, a stack of spare rods with their thread pins)
    ...[0.85, 2.55].flatMap((x, k) => [
      P(`trestleL${k}`, B([x - 0.03, -0.66, -1.03], [x + 0.03, 0, -0.98], 0.005), RG_FRAME, { spec: 0.5 }),
      P(`trestleR${k}`, B([x - 0.03, -0.66, -0.76], [x + 0.03, 0, -0.71], 0.005), RG_FRAME, { spec: 0.5 }),
      P(`trestleT${k}`, B([x - 0.05, -0.7, -1.06], [x + 0.05, -0.64, -0.68], 0.006), RG_FRAME, { spec: 0.55 })
    ]),
    ...[[-1.0, -0.735], [-0.93, -0.735], [-0.86, -0.735], [-0.79, -0.735], [-0.965, -0.802], [-0.895, -0.802], [-0.825, -0.802]].flatMap(([z, y], k) => [
      P(`rod${k}`, C([0.45, y, z], [2.95, y, z], 0.034, 12), RG_STEEL, { spec: 0.85, bias: -k }),
      P(`pin${k}`, C([2.95, y, z], [3.03, y, z], 0.024, 10), RG_STEEL, { spec: 0.9, bias: -k })
    ]),
    // the water tank behind the mast (an upright tank with its bands, lid and outlet toward the skid)
    P("wtank", C([WT[0], 0, WT[1]], [WT[0], -1.02, WT[1]], 0.3, 22), RG_PACK, { bias: -150, spec: 0.35, lift: model === "b" ? 0 : 0.12, after: (mp, rg) => tankBands(mp, rg) }),
    P("wlid", C([WT[0], -1.02, WT[1]], [WT[0], -1.07, WT[1]], 0.12, 16), RG_STEEL, { spec: 0.7 }),
    P("wout", C([WT[0] + 0.29, -0.12, WT[1] + 0.06], [WT[0] + 0.4, -0.12, WT[1] + 0.1], 0.03, 10), RG_STEEL, { spec: 0.8 }),
    // the mast ladder (stiles and rungs) on standoffs in front of its right rail
    P("ladL", C([0.66, -0.3, 0.27], [0.66, -3.6, 0.27], 0.014, 8), RG_STEEL, { spec: 0.8, bias: 40 }),
    P("ladR", C([0.9, -0.3, 0.27], [0.9, -3.6, 0.27], 0.014, 8), RG_STEEL, { spec: 0.8, bias: 40 }),
    ...Array.from({ length: 11 }, (_, k) => P(`lrung${k}`, C([0.66, -0.6 - k * 0.3, 0.27], [0.9, -0.6 - k * 0.3, 0.27], 0.01, 6), RG_STEEL, { spec: 0.8, bias: 41 })),
    ...[-1.2, -2.4, -3.4].map((y, k) => P(`lstand${k}`, B([0.58, y - 0.02, 0.08], [0.68, y + 0.02, 0.27], 0.003), RG_FRAME, { spec: 0.5, bias: 39 })),
    // the operator's station: a grated platform off the deck's front, a guard rail, posts and a sun roof over the control panel
    P("oplat", B([0.36, -0.3, 0.56], [1.1, -0.26, 0.88], 0.004), RG_DECK, { spec: 0.4, after: (mp, rg) => grating(mp, rg) }),
    ...[[0.4, 0.84], [1.06, 0.84], [0.4, 0.36], [1.06, 0.36]].map(([x, z], k) => P(`opost${k}`, C([x, -0.3, z], [x, -1.98, z], 0.018, 8), RG_FRAME, { spec: 0.6, bias: z > 0.5 ? 80 : 0 })),
    P("oroof", B([0.33, -2.04, 0.3], [1.13, -1.98, 0.9], 0.008), RG_ROOF, { spec: 0.6, bias: 90 }),
    P("orail", C([0.4, -1.05, 0.86], [1.06, -1.05, 0.86], 0.014, 8), RG_FRAME, { spec: 0.6, bias: 85 }),
    P("orail2", C([0.4, -0.68, 0.86], [1.06, -0.68, 0.86], 0.012, 8), RG_FRAME, { spec: 0.6, bias: 85 }),
    // guard rails along the deck's back edge and its right end
    ...[0.75, 1.5, 2.25, 2.98].map((x, k) => P(`gpost${k}`, C([x, RIG.deckTop, -0.53], [x, -1.2, -0.53], 0.016, 8), RG_FRAME, { spec: 0.6 })),
    P("grail", C([0.75, -1.2, -0.53], [2.98, -1.2, -0.53], 0.017, 8), RG_FRAME, { spec: 0.6 }),
    P("grail2", C([0.75, -0.75, -0.53], [2.98, -0.75, -0.53], 0.013, 8), RG_FRAME, { spec: 0.6 }),
    P("gpostE", C([2.98, RIG.deckTop, 0.53], [2.98, -1.2, 0.53], 0.016, 8), RG_FRAME, { spec: 0.6, bias: 60 }),
    P("grailE", C([2.98, -1.2, -0.53], [2.98, -1.2, 0.53], 0.017, 8), RG_FRAME, { spec: 0.6, bias: 60 })
  ];
  const out = list.map((p) => part(p.f, p.ramp, { key: p.key, ...p.o }));
  memo.set(model, out);
  return out;
};
// ── decals ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const tread = (map, rig) => {
  let d = "";
  for (let x = RIG.skid.x0 + 0.06; x < RIG.skid.x1 - 0.04; x += 0.07) for (let z = -RIG.skid.z + 0.05; z < RIG.skid.z - 0.03; z += 0.07) {
    const s = (Math.round(x / 0.07) + Math.round(z / 0.07)) % 2 ? 1 : -1;
    const a = mapScr(map, rig, m3([x - 0.018, RIG.deckTop - 1e-3, z - s * 0.012])), b = mapScr(map, rig, m3([x + 0.018, RIG.deckTop - 1e-3, z + s * 0.012]));
    d += `M${f2(a[0])},${f2(a[1])}L${f2(b[0])},${f2(b[1])}`;
  }
  return d;
};
const grilleOf = (map, rig) => {
  const x = RIG.pack.x0 - 1e-3, out = [];
  out.push(path3(map, rig, [[x, -1.2, -0.42], [x, -1.2, 0.42], [x, -0.42, 0.42], [x, -0.42, -0.42]].map(m3)));
  let d = "";
  for (let z = -0.38; z <= 0.381; z += 0.06) {
    const a = mapScr(map, rig, m3([x - 2e-3, -1.17, z])), b = mapScr(map, rig, m3([x - 2e-3, -0.45, z]));
    d += `M${f2(a[0])},${f2(a[1])}L${f2(b[0])},${f2(b[1])}`;
  }
  return { box: out[0], bars: d };
};
const louvres = (map, rig) => {
  let dk = "", lt = "";
  for (let y = -0.8; y <= -0.44; y += 0.06) {
    const a = mapScr(map, rig, m3([1.48, y, RIG.pack.z + 1e-3])), b = mapScr(map, rig, m3([2.72, y, RIG.pack.z + 1e-3]));
    const c = mapScr(map, rig, m3([1.48, y + 0.012, RIG.pack.z + 1e-3])), e = mapScr(map, rig, m3([2.72, y + 0.012, RIG.pack.z + 1e-3]));
    dk += `M${f2(a[0])},${f2(a[1])}L${f2(b[0])},${f2(b[1])}`;
    lt += `M${f2(c[0])},${f2(c[1])}L${f2(e[0])},${f2(e[1])}`;
  }
  return { dk, lt };
};
/** the rig in a scene: pose = xfPose(…); head = the head's top (m); spin = the chuck's turn (deg); run 0…1 = drilling (mud);
 *  plate = the engraved maker's text (or ""), plateOn = its paint; lamp 0…1; f = frame (ripples) */
export const DrillRig = ({ id, rig, pose, head = RIG.head.top, spin = 0, run = 0, plate = "", plateOn = 0, lamp = 0.5, f = 0, probe, mudOn = 1, model = "a", helix = 0 }) => {
  const map = (q) => xfApply(pose, q);
  const hy = head;
  const st = statics(model);
  const { frame: RG_FRAME } = paint(model);
  const sc = Math.hypot(pose.m[0], pose.m[3], pose.m[6]);
  // the moving parts: the head and what rides with it, the rod string, the hoses and the wireline
  const chuckB = hy + RIG.head.h + 0.14;
  const joint = chuckB + 0.95;
  const dyn = [
    part(B([-0.22, hy, -0.2], [0.2, hy + RIG.head.h, 0.2], 0.016), RG_BODY, { key: "head", spec: 0.55, bias: 160 }),
    part(B([0.19, hy - 0.06, -0.12], [0.214, hy + RIG.head.h + 0.06, 0.12], 0.006), RG_FRAME, { key: "carriage", spec: 0.6, bias: 150 }),
    part(C([0.12, hy - 0.22, -0.09], [0.12, hy, -0.09], 0.075, 16), RG_STEEL, { key: "motor", spec: 0.6, bias: 170 }),
    part(C([0.12, hy - 0.26, -0.09], [0.12, hy - 0.22, -0.09], 0.05, 14), RG_BODY, { key: "motorCap", spec: 0.6, bias: 175 }),
    part(C([0, hy - 0.16, 0], [0, hy, 0], 0.048, 14), RG_STEEL, { key: "swivel", spec: 0.7, bias: 180 }),
    part(C([0, hy + RIG.head.h, 0], [0, chuckB, 0], 0.1, 18), RG_STEEL, { key: "chuck", spec: 0.7, bias: 140, after: (mp, rg) => chuckBolts(mp, rg, hy, spin) }),
    chuckB < -0.6 && part(C([0, chuckB, 0], [0, -0.53, 0], RIG.rodR, 12), RG_STEEL, { key: "rodU", spec: 0.85, bias: 100, after: (mp, rg) => helix > 0 ? rodHelix(mp, rg, chuckB, -0.53, spin, helix) : rodStripes(mp, rg, chuckB, -0.53, spin) }),
    joint < -0.6 && part(C([0, joint, 0], [0, joint + 0.07, 0], RIG.rodR + 0.008, 12), RG_STEEL, { key: "joint", spec: 0.8, bias: 110 }),
    part(C([0, -0.3, 0], [0, -0.13, 0], RIG.rodR, 12), RG_STEEL, { key: "rodL", spec: 0.85, bias: -40, after: (mp, rg) => helix > 0 ? rodHelix(mp, rg, -0.3, -0.13, spin, helix) : rodStripes(mp, rg, -0.3, -0.13, spin) })
  ];
  const hoses = {
    key: "hoses",
    c: m3([0.5, -1.8, -0.25]),
    bias: -400,
    after: (mp, rg) => /* @__PURE__ */ jsxs("g", { children: [
      hose(mp, rg, bez3([0.16, hy - 0.14, -0.12], [0.55, hy - 0.2, -0.22], [0.75, -1.6, -0.26], [0.86, -0.9, -0.3]), 0.02),
      hose(mp, rg, bez3([0.1, hy - 0.14, -0.14], [0.5, hy - 0.05, -0.28], [0.68, -1.4, -0.32], [0.96, -0.9, -0.24]), 0.018)
    ] })
  };
  const water = {
    key: "water",
    c: m3([-0.3, -1.6, 0.25]),
    bias: 220,
    after: (mp, rg) => hose(mp, rg, bez3([-0.04, hy - 0.1, 0.03], [-0.5, hy + 0.1, 0.12], [-0.55, -0.9, 0.3], [-0.12, -0.38, 0.3]), 0.018)
  };
  const wire = {
    key: "wire",
    c: m3([0.5, -2.4, 0.0]),
    bias: -60,
    after: (mp, rg) => /* @__PURE__ */ jsxs("g", { fill: "none", strokeLinecap: "round", children: [
      /* @__PURE__ */ jsx("path", { d: path3(mp, rg, [m3([0.88, -0.72, 0.24]), m3([RIG.sheave.c[0] + RIG.sheave.r, RIG.sheave.c[1], 0])], false), stroke: rampAt(RG_STEEL, 0.25), strokeWidth: 1.6 * sc }),
      /* @__PURE__ */ jsx("path", { d: path3(mp, rg, [m3([RIG.sheave.c[0] - RIG.sheave.r, RIG.sheave.c[1], 0]), m3([0, hy - 0.16, 0])], false), stroke: rampAt(RG_STEEL, 0.3), strokeWidth: 1.6 * sc })
    ] })
  };
  const decals = (k) => {
    switch (k) {
      case "deck":
        return (mp, rg) => /* @__PURE__ */ jsx("path", { d: tread(mp, rg), stroke: rampAt(RG_DECK, 0.82), strokeWidth: 1.4 * sc, opacity: 0.32, strokeLinecap: "round", fill: "none" });
      case "runN":
        return (mp, rg) => /* @__PURE__ */ jsxs("g", { children: [
          hazard(mp, rg, 2.62, 2.98, sc),
          /* @__PURE__ */ jsx("path", { d: path3(mp, rg, [m3([0.3, -0.16, 0.481]), m3([2.86, -0.16, 0.481])], false), stroke: "#000000", strokeOpacity: 0.35, strokeWidth: 1.2 * sc, fill: "none" }),
          [0.5, 1.2, 1.9, 2.6].map((x, i) => /* @__PURE__ */ jsx(Screw, { id: `${id}rb${i}`, map: mp, rig: rg, c: m3([x, -0.1, 0.481]), r: 0.022 * RM, plane: "front", slot: 20 + i * 30 }, i))
        ] });
      case "pack":
        return (mp, rg) => {
          const g = grilleOf(mp, rg), lv = louvres(mp, rg);
          const bolts = [[1.38, -1.26], [2.82, -1.26], [1.38, -0.36], [2.82, -0.36]].map(([x, y], k) => /* @__PURE__ */ jsx(Screw, { id: `${id}pb${k}`, map: mp, rig: rg, c: m3([x, y, RIG.pack.z + 1e-3]), r: 0.016 * RM, plane: "front", slot: 30 * k }, `pb${k}`));
          const showG = faces(mp, rg, [-1, 0, 0], m3([RIG.pack.x0, -0.8, 0]));
          return /* @__PURE__ */ jsxs("g", { children: [
            showG && /* @__PURE__ */ jsx("path", { d: g.box, fill: "#05080B", opacity: 0.55 }),
            showG && /* @__PURE__ */ jsx("path", { d: g.bars, stroke: rampAt(RG_STEEL, 0.55), strokeWidth: 2.2 * sc, opacity: 0.8, fill: "none" }),
            /* @__PURE__ */ jsx("path", { d: lv.dk, stroke: "#03060A", strokeWidth: 3.4 * sc, opacity: 0.7, fill: "none" }),
            /* @__PURE__ */ jsx("path", { d: lv.lt, stroke: rampAt(RG_BODY, 0.85), strokeWidth: 1 * sc, opacity: 0.5, fill: "none" }),
            /* @__PURE__ */ jsx("path", { d: path3(mp, rg, [m3([RIG.pack.x0 + 0.04, RIG.pack.y0 - 1e-3, -0.02]), m3([RIG.pack.x1 - 0.04, RIG.pack.y0 - 1e-3, -0.02])], false), stroke: "#000000", strokeOpacity: 0.5, strokeWidth: 1.6 * sc, fill: "none" }),
            /* @__PURE__ */ jsx("path", { d: path3(mp, rg, [m3([RIG.pack.x0 + 0.04, RIG.pack.y0 - 1e-3, 0.0]), m3([RIG.pack.x1 - 0.04, RIG.pack.y0 - 1e-3, 0.0])], false), stroke: rampAt(RG_BODY, 0.9), strokeOpacity: 0.3, strokeWidth: 1 * sc, fill: "none" }),
            bolts,
            showG && warnPlate(mp, rg, [RIG.pack.x0 - 2e-3, -1.26, 0.3], 0.12, sc, [-1, 0, 0])
          ] });
        };
      case "plate":
        return (mp, rg) => plateDecal(mp, rg, id, plate, plateOn, sc);
      case "panel":
        return (mp, rg) => panelDecal(mp, rg, sc, f, run);
      case "drum":
        return (mp, rg) => drumWraps(mp, rg, sc);
      case "lamp":
        return (mp, rg) => lampDecal(mp, rg, id, lamp, sc);
      case "mfoot":
        return (mp, rg) => /* @__PURE__ */ jsxs("g", { children: [
          [[0.22, -0.33], [0.62, -0.33]].map(([x, y], k) => /* @__PURE__ */ jsx(Screw, { id: `${id}mf${k}`, map: mp, rig: rg, c: m3([x, y, 0.201]), r: 0.018 * RM, plane: "front", slot: k * 50 }, k))
        ] });
      case "runF":
        return void 0;
      case "tank":
        return (mp, rg) => /* @__PURE__ */ jsx("path", { d: path3(mp, rg, [[0.7, -0.78, -0.059], [0.74, -0.78, -0.059], [0.74, -0.46, -0.059], [0.7, -0.46, -0.059]].map(m3)), fill: rampAt(RG_STEEL, 0.7), opacity: 0.55 });
      case "clamp":
        return (mp, rg) => /* @__PURE__ */ jsx("path", { d: path3(mp, rg, [m3([-0.15, -0.445, 0.1501]), m3([0.14, -0.445, 0.1501])], false), stroke: "#000000", strokeOpacity: 0.55, strokeWidth: 1.6 * sc, fill: "none" });
      default:
        return void 0;
    }
  };
  const parts = [...st.map((p) => ({ ...p, after: decals(p.key), prints: p.key === "plate" ? platePrints(plate, plateOn) : void 0 })), ...dyn.filter(Boolean), hoses, water, wire];
  return /* @__PURE__ */ jsxs("div", { "data-probe-object": probe ?? "the core-drill rig", style: { position: "absolute", inset: 0, pointerEvents: "none" }, children: [
    /* @__PURE__ */ jsxs("svg", { width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      /* @__PURE__ */ jsx(Collar, { id, map, rig, run, f, sc, on: mudOn }),
      /* @__PURE__ */ jsx(PaintParts, { parts, map, rig, id: `${id}p` })
    ] }),
    /* @__PURE__ */ jsx(PartPrints, { parts, rig, pose, id: `${id}t` })
  ] });
};
// a warning decal: a pale square plate with a navy triangle and exclamation bar (no text), on the face with normal n
const warnPlate = (map, rig, c, s, sc, n = [0, 0, 1]) => {
  const u = n[0] ? [0, 0, -n[0]] : [1, 0, 0], v = [0, 1, 0];
  const at = (a, b) => m3([c[0] + u[0] * a + v[0] * b, c[1] + u[1] * a + v[1] * b, c[2] + u[2] * a + v[2] * b]);
  const h = s / 2;
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("path", { d: path3(map, rig, [at(-h, -h), at(h, -h), at(h, h), at(-h, h)]), fill: DECAL_PLATE, opacity: 0.88 }),
    /* @__PURE__ */ jsx("path", { d: path3(map, rig, [at(0, -h * 0.72), at(h * 0.72, h * 0.6), at(-h * 0.72, h * 0.6)]), fill: "none", stroke: DECAL_INK, strokeWidth: 1.6 * sc, strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: path3(map, rig, [at(0, -h * 0.3), at(0, h * 0.25)], false), stroke: DECAL_INK, strokeWidth: 1.6 * sc, fill: "none" })
  ] });
};
// hazard stripes on the near runner's end (pale and navy diagonals)
const hazard = (map, rig, x0, x1, sc) => {
  const z = 0.4801, out = [];
  for (let x = x0, k = 0; x < x1; x += 0.07, k++) {
    if (k % 2) continue;
    out.push(path3(map, rig, [[x, -0.19, z], [x + 0.05, -0.19, z], [x + 0.05 - 0.06, -0.03, z], [x - 0.06, -0.03, z]].map(m3)));
  }
  return /* @__PURE__ */ jsx("path", { d: out.join(""), fill: DECAL_PLATE, opacity: 0.55 });
};
const grating = (map, rig) => {
  let d = "";
  for (let x = 0.4; x < 1.08; x += 0.045) d += path3(map, rig, [m3([x, -0.301, 0.58]), m3([x, -0.301, 0.86])], false);
  return /* @__PURE__ */ jsx("path", { d, stroke: "#000000", strokeOpacity: 0.35, strokeWidth: 1, fill: "none" });
};
const tankBands = (map, rig) => /* @__PURE__ */ jsx("g", { children: [-0.25, -0.55, -0.85].map((y, k) => {
  const pts = [];
  for (let a = -40; a <= 130; a += 10) {
    const t = a * Math.PI / 180;
    pts.push(m3([WT[0] - 0.302 * Math.cos(t), y, WT[1] + 0.302 * Math.sin(t)]));
  }
  return /* @__PURE__ */ jsx("path", { d: path3(map, rig, pts, false), stroke: "#000000", strokeOpacity: 0.35, strokeWidth: 2.2, fill: "none" }, k);
}) });
// the partner's string spinning DOWN: painted helical bands on the rods that travel down as the string turns
const rodHelix = (map, rig, y0, y1, spin, amt) => {
  const pitch = 0.16, out = [];
  for (let b = 0; b < 2; b++) {
    const pts = [];
    for (let y = y0; y <= y1 + 1e-6; y += 0.008) {
      const a = (spin + b * 180) * Math.PI / 180 + (y - y0) / pitch * 2 * Math.PI;
      const n = [Math.cos(a), 0, Math.sin(a)];
      if (faces(map, rig, n, m3([RIG.rodR * n[0], y, RIG.rodR * n[2]]))) pts.push(m3([RIG.rodR * 1.03 * n[0], y, RIG.rodR * 1.03 * n[2]]));
      else if (pts.length) {
        out.push(path3(map, rig, pts, false));
        pts.length = 0;
      }
    }
    if (pts.length > 1) out.push(path3(map, rig, pts, false));
  }
  return /* @__PURE__ */ jsx("path", { d: out.join(""), stroke: "#0B1A30", strokeOpacity: 0.55 * amt, strokeWidth: 2.2, fill: "none", strokeLinecap: "round" });
};
const hose = (map, rig, pts, r) => {
  const d = path3(map, rig, pts.map(m3), false);
  return /* @__PURE__ */ jsxs("g", { fill: "none", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsx("path", { d, stroke: rampAt(RG_RUBBER, 0.1), strokeWidth: 2 * r * RM * 0.9 }),
    /* @__PURE__ */ jsx("path", { d, stroke: rampAt(RG_RUBBER, 0.75), strokeWidth: r * RM * 0.45, opacity: 0.5, transform: "translate(-1.2 -1.2)" })
  ] });
};
const chuckBolts = (map, rig, hy, spin) => {
  const yb = hy + RIG.head.h + 0.07;
  return /* @__PURE__ */ jsx("g", { children: Array.from({ length: 6 }, (_, k) => {
    const a = (spin + k * 60) * Math.PI / 180, n = [Math.cos(a), 0, Math.sin(a)];
    const c = [0.1 * n[0], yb, 0.1 * n[2]];
    if (!faces(map, rig, n, m3(c))) return null;
    const t = [-n[2], 0, n[0]];
    const pts = ring3(m3(add3(c, mul3(n, 0.004))), t, [0, 1, 0], 0.018 * RM, 12);
    return /* @__PURE__ */ jsx("path", { d: path3(map, rig, pts), fill: rampAt(RG_BODY, 0.25), stroke: rampAt(RG_STEEL, 0.9), strokeWidth: 0.8, strokeOpacity: 0.6 }, k);
  }) });
};
const rodStripes = (map, rig, y0, y1, spin) => /* @__PURE__ */ jsx("g", { children: [0, 180].map((o, k) => {
  const a = (spin * 1.0 + o) * Math.PI / 180, n = [Math.cos(a), 0, Math.sin(a)];
  if (!faces(map, rig, n, m3([RIG.rodR * n[0], (y0 + y1) / 2, RIG.rodR * n[2]]))) return null;
  const p = (y) => m3([RIG.rodR * 1.02 * n[0], y, RIG.rodR * 1.02 * n[2]]);
  return /* @__PURE__ */ jsx("path", { d: path3(map, rig, [p(y0 + 0.01), p(y1 - 0.01)], false), stroke: k ? "#ffffff" : "#000000", strokeOpacity: k ? 0.45 : 0.5, strokeWidth: 1.8, fill: "none" }, k);
}) });
const plateDecal = (map, rig, id, text, on, sc) => {
  const P = RIG.plate, zf = P.z + 1e-3, cy = (P.y0 + P.y1) / 2;
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("path", { d: path3(map, rig, [[P.x0 + 0.025, P.y0 + 0.025, zf], [P.x1 - 0.025, P.y0 + 0.025, zf], [P.x1 - 0.025, P.y1 - 0.025, zf], [P.x0 + 0.025, P.y1 - 0.025, zf]].map(m3)), fill: "none", stroke: PL_GROOVE, strokeWidth: 1.4 * sc, opacity: 0.7 }),
    [[P.x0 + 0.05, cy], [P.x1 - 0.05, cy]].map(([x, y], k) => /* @__PURE__ */ jsx(Screw, { id: `${id}ps${k}`, map, rig, c: m3([x, y, zf]), r: 0.02 * RM, plane: "front", slot: k ? -30 : 40 }, k))
  ] });
};
// the plate's engraving (groove, lip, paint): HTML planes on the plate's face (claim_kit PlanePrint)
const platePrints = (text, on) => {
  if (!text) return [];
  const P = RIG.plate, zf = P.z + 1e-3, cx = (P.x0 + P.x1) / 2, cy = (P.y0 + P.y1) / 2;
  const size = 0.17 * RM, wid = (P.x1 - P.x0 - 0.2) * RM;
  const scale = Math.min(1, wid / (text.length * size * 0.54));
  const run = (dy, fill, op) => ({ o: m3([cx, cy, zf]), dy, u: [1, 0, 0], v: [0, 1, 0], text, size: size * scale, fill, op, family: SHOUT, ls: 1.5, width: (P.x1 - P.x0 - 0.1) * RM, probe: "the rig's engraved maker's plate" });
  return [run(1.2, PL_LIP, 0.32), run(0, PL_GROOVE, 0.85), on > 3e-3 ? run(0, "#D5E4F6", Math.min(1, on)) : null];
};
const panelDecal = (map, rig, sc, f, run) => {
  const z = 0.521;
  return /* @__PURE__ */ jsx("g", { children: [0.58, 0.72, 0.86].map((x, k) => {
    const c = m3([x, -1.29, z]);
    const rim = ring3(c, [1, 0, 0], [0, 1, 0], 0.052 * RM, 24), face = ring3(add3(c, [0, 0, 0.5]), [1, 0, 0], [0, 1, 0], 0.042 * RM, 24);
    const a = (-130 + 160 * (0.35 + 0.25 * k + 0.08 * run * Math.sin(f / (9 + k * 3)))) * Math.PI / 180;
    const tip = add3(c, [0.034 * RM * Math.sin(a), -0.034 * RM * Math.cos(a), 0.8]);
    return /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx("path", { d: path3(map, rig, rim), fill: rampAt(RG_STEEL, 0.75) }),
      /* @__PURE__ */ jsx("path", { d: path3(map, rig, face), fill: "#E9EFF6" }),
      /* @__PURE__ */ jsx("path", { d: path3(map, rig, [add3(c, [0, 0, 0.8]), tip], false), stroke: "#0B1A30", strokeWidth: 1.3 * sc, fill: "none", strokeLinecap: "round" })
    ] }, k);
  }) });
};
const drumWraps = (map, rig, sc) => {
  let d = "";
  for (let z = 0.06; z < 0.41; z += 0.022) {
    const pts = [];
    for (let a = -95; a <= 35; a += 10) {
      const t = a * Math.PI / 180;
      pts.push(m3([0.88 - 0.161 * Math.sin(t), -0.56 - 0.161 * Math.cos(t), z]));
    }
    d += path3(map, rig, pts, false);
  }
  return /* @__PURE__ */ jsx("path", { d, stroke: "#000000", strokeOpacity: 0.32, strokeWidth: 1.1 * sc, fill: "none" });
};
const lampDecal = (map, rig, id, lamp, sc) => {
  const c = m3(RIG.lamp.lens), p = mapScr(map, rig, c);
  const lens = ring3(c, [1, 0, 0], [0, 1, 0], 0.048 * RM, 24), bez = ring3(add3(c, [0, 0, -0.3]), [1, 0, 0], [0, 1, 0], 0.058 * RM, 24);
  const R = 70 * sc * (0.6 + 0.6 * lamp);
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("radialGradient", { id: `${id}lg`, cx: f2(p[0]), cy: f2(p[1]), r: f2(R), gradientUnits: "userSpaceOnUse", children: [
      /* @__PURE__ */ jsx("stop", { offset: "0", stopColor: LAMP_HOT, stopOpacity: 0.9 }),
      /* @__PURE__ */ jsx("stop", { offset: "0.18", stopColor: LAMP_GLOW, stopOpacity: 0.45 }),
      /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: LAMP_GLOW, stopOpacity: 0 })
    ] }) }),
    /* @__PURE__ */ jsx("path", { d: path3(map, rig, bez), fill: rampAt(RG_STEEL, 0.6) }),
    /* @__PURE__ */ jsx("path", { d: path3(map, rig, lens), fill: rampAt(["#3A4A5E", "#6C86A6", "#A9C1DD", "#DCE8F5", "#FFFFFF"], 0.25 + 0.75 * lamp) }),
    lamp > 0.02 && /* @__PURE__ */ jsx("circle", { "data-probe-skip": true, cx: f2(p[0]), cy: f2(p[1]), r: f2(R), fill: `url(#${id}lg)`, opacity: Math.min(1, lamp) })
  ] });
};
// the collar on the ground: wet drilling mud around the casing, cuttings, and (while drilling) rings of return water
const MUD_POLY = Array.from({ length: 26 }, (_, i) => {
  const a = i / 26 * 2 * Math.PI, r = 0.42 + 0.07 * Math.sin(3 * a + 1.1) + 0.05 * Math.sin(5 * a + 0.3);
  return [r * Math.cos(a) * 1.15, 0, r * Math.sin(a) * 0.95 + 0.05];
});
const CUTTINGS = (() => {
  const out = [];
  let s = 9;
  const r = () => (s = s * 16807 % 2147483647) / 2147483647;
  for (let i = 0; i < 46; i++) {
    const a = r() * 2 * Math.PI, d = 0.1 + 0.36 * Math.sqrt(r());
    out.push({ p: [d * Math.cos(a) * 1.1, 0, d * Math.sin(a) * 0.9 + 0.05], s: 0.006 + 0.01 * r(), l: r() });
  }
  return out;
})();
const Collar = ({ id, map, rig, run, f, sc, on }) => {
  if (on <= 0.01) return null;
  const y = -1e-3;
  const d = path3(map, rig, MUD_POLY.map(([x, , z]) => m3([x, y, z])));
  const c0 = mapScr(map, rig, m3([0, y, 0])), c1 = mapScr(map, rig, m3([0.5, y, 0]));
  const rings = run > 0.01 ? [0, 1, 2].map((k) => {
    const ph = (f / 26 + k / 3) % 1;
    return { r: 0.08 + 0.34 * ph, op: run * (1 - ph) * 0.55 };
  }) : [];
  return /* @__PURE__ */ jsxs("g", { opacity: on, children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("radialGradient", { id: `${id}mud`, cx: f2(c0[0]), cy: f2(c0[1]), r: f2(Math.abs(c1[0] - c0[0])), gradientUnits: "userSpaceOnUse", children: [
      /* @__PURE__ */ jsx("stop", { offset: "0", stopColor: rampAt(MUD, 0.5) }),
      /* @__PURE__ */ jsx("stop", { offset: "0.7", stopColor: rampAt(MUD, 0.3) }),
      /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: rampAt(MUD, 0.2) })
    ] }) }),
    /* @__PURE__ */ jsx("path", { d, fill: `url(#${id}mud)`, stroke: rampAt(MUD, 0.55), strokeWidth: 1.2, strokeOpacity: 0.5 }),
    /* @__PURE__ */ jsx("path", { d: path3(map, rig, MUD_POLY.map(([x, , z]) => m3([x * 0.55 - 0.05, y, z * 0.5 - 0.03]))), fill: MUD_SHEEN, opacity: 0.1 }),
    rings.map((r, k) => /* @__PURE__ */ jsx("path", { d: path3(map, rig, ring3(m3([0, y, 0]), [1, 0, 0], [0, 0, 1], r.r * RM, 32)), fill: "none", stroke: MUD_SHEEN, strokeWidth: 1.4 * sc, opacity: r.op }, k)),
    CUTTINGS.map((c, k) => /* @__PURE__ */ jsx("path", { d: path3(map, rig, ring3(m3(c.p), [1, 0, 0], [0, 0, 1], c.s * RM, 6)), fill: c.l > 0.5 ? rampAt(RG_WALL, 0.7 + 0.3 * c.l) : rampAt(MUD, 0.65) }, `c${k}`))
  ] });
};
/** the rig's shadow casters for TkFloor (world corners) */
export const rigCasters = (pose) => {
  const box = (a, b) => {
    const out = [];
    for (const x of [a[0], b[0]]) for (const y of [a[1], b[1]]) for (const z of [a[2], b[2]]) out.push(xfApply(pose, m3([x, y, z])));
    return out;
  };
  return [
    { corners: box([RIG.skid.x0, RIG.deckTop, -RIG.skid.z], [RIG.skid.x1, 0, RIG.skid.z]), k: 0.9 },
    { corners: box([WT[0] - 0.3, -1.05, WT[1] - 0.3], [WT[0] + 0.3, 0, WT[1] + 0.3]), k: 0.7 },
    { corners: box([RIG.pack.x0, RIG.pack.y0, -RIG.pack.z], [RIG.pack.x1, 0, RIG.pack.z]), k: 0.8 },
    { corners: box([RIG.mast.x0, RIG.mast.top, -RIG.mast.zr], [RIG.mast.x1, 0, RIG.mast.zr]), k: 0.4 }
  ];
};
/** a rig point (metres) in world coordinates, and on the place's screen */
export const rigWorld = (pose, q) => xfApply(pose, m3(q));
export const rigScr = (rig, pose, q) => mapScr((p) => xfApply(pose, p), rig, m3(q));
