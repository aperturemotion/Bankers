// @ts-nocheck
// ★ V37 "Theranos" — builder F, place `verdict`, framing 1: THE VERDICT BLOCK (no gavel — Video 36 had one).
//   A machined steel block on a stepped base plate, with the verdict's letters SET INTO IT: six solid steel letters G U I L T Y
//   (Anton, extruded 34 deep: stacked depth layers, lit faces) stand sunk in a long slot cut through the block's top. Before
//   the word they sit below the top surface (only their top edges glint in the slot); on "guilty" they are driven up out of
//   the block and stop hard on their seats (a heavy clunk and a short rebound). The block's front carries two screwed steel
//   plates whose engraving paints in on its word: JAN 3, 2022 (on "2022") and 4 COUNTS (on "defrauding").
//   Construction: the body is FOUR solids round the slot (a back slab, a front slab, two end bridges) so the letters can be drawn
//   between them in painter's order — the front slab covers whatever of a letter is still inside the block.
//   Block-local frame: u right, v DOWN (floor 0, up negative), w toward the lens.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { prism, rampAt } from "./solid_engine";
import { XPlane, mapPath, mapScr, paintXf, rrectPts, worldScr, wound, xfApply } from "./tk_rig";
import { PL_BODY, PL_PLATE, PL_STEEL } from "./counter_mat";
import { Engraved } from "./counter_drums";
import { SHOUT } from "./fonts";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
export const VB = { baseW: 1000, baseH: 36, baseD: 340, W: 920, H: 250, D: 250, slotL: 780, slotW: 56, slotZ: -24 };
const V_TOP = -VB.baseH - VB.H;                      // the block's top surface (local v)
const ZB = -VB.D / 2, ZF = VB.D / 2;                 // back and front faces
const S0 = VB.slotZ - VB.slotW / 2, S1 = VB.slotZ + VB.slotW / 2;   // the slot's back and front walls (w)
const UL = VB.slotL / 2;
// ── the letters ──────────────────────────────────────────────────────────────────────────────────────────────────────
export const LT = { size: 236, cap: 0.83, depth: 34, layers: 13, boxW: 900, boxH: 300 };
const CAP = LT.size * LT.cap;
// baseline (local v): sunk with the cap tops 6 under the top surface; raised with 18 of the letters' feet left in the slot
export const BASE_SUNK = V_TOP + 26 + CAP, BASE_UP = V_TOP + 18;
export const LIFT = BASE_SUNK - BASE_UP;
if (BASE_SUNK > -VB.baseH - 6) throw new Error("verdict_block: the sunk letters must stay inside the block");
if (LT.depth > VB.slotW - 12) throw new Error("verdict_block: the letters must fit their slot");
let memo = null;
const pz = (poly, d, bev, w0) => wound(prism(poly, d, bev, 0, 1, () => false, [0, 0, w0]));
const parts = () => {
  if (memo) return memo;
  const vb = -VB.baseH, H = VB.H;
  const yc = vb - H / 2;
  const base = pz(rrectPts(VB.baseW, VB.baseH - 10, 5, 2, 0, -(VB.baseH - 10) / 2 - 10), VB.baseD, 6, 0);
  const toe = pz(rrectPts(VB.baseW + 16, 10, 3, 2, 0, -5), VB.baseD + 16, 3, 0);
  const back = pz(rrectPts(VB.W, H, 6, 3, 0, yc), S0 - ZB, 7, (ZB + S0) / 2);
  const front = pz(rrectPts(VB.W, H, 6, 3, 0, yc), ZF - S1, 7, (S1 + ZF) / 2);
  const ends = [-1, 1].flatMap((s) => prism(rrectPts(VB.W / 2 - UL, H, 2, 2, s * (UL + VB.W / 2) / 2, yc), S1 - S0 + 2, 0, 0, 1, () => false, [0, 0, VB.slotZ]));
  // the front plates (two), proud of the front face
  const plates = [-1, 1].flatMap((s) => prism(rrectPts(PLATE.w, PLATE.h, 6, 3, s * PLATE.u, PLATE.v), 6, 2.5, 0, 1, () => false, [0, 0, ZF + 3]));
  memo = { base, toe, back, front, ends: wound(ends), plates: wound(plates) };
  return memo;
};
export const PLATE = { w: 330, h: 70, u: 220, v: -VB.baseH - VB.H * 0.47 };
const TOP_INK = "#4C545E";   // the lit top face's tone (sampled from the painted slabs)
const fillOf = (r, light, f) => rampAt(r, f.cap ? 0.62 * light + 0.06 : f.bev ? Math.min(1, 0.95 * light + 0.16) : 0.8 * light + 0.04);
const Paint = ({ faces, map, rig, ramp, spec = 0.5, dim = 0 }) => jsx(jsx_runtime.Fragment, { children: paintXf(faces, map, rig, spec).map((dw, k) => {
  const c = fillOf(ramp, dw.light * (1 - dim), dw.face);
  return jsx("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
}) });
const ring = (u, v, w, r, n = 16, plane = "front") => Array.from({ length: n }, (_, i) => {
  const a = i / n * 2 * Math.PI;
  return plane === "front" ? [u + r * Math.cos(a), v + r * Math.sin(a), w] : [u + r * Math.cos(a), v, w + r * Math.sin(a)];
});
/** a slotted steel screw head: on the front face (plane "front") or the top (plane "top") */
const Screw = ({ P, u, v, w, r = 7, plane = "front", slot = 0.6 }) => {
  const d = (x) => plane === "front" ? [u + x[0], v + x[1], w + 0.4] : [u + x[0], v - 0.4, w + x[1]];
  const sx = Math.cos(slot) * r * 0.65, sy = Math.sin(slot) * r * 0.65;
  return jsxs("g", { children: [
    jsx("path", { d: P(ring(u, v, w, r + 2.2, 18, plane)), fill: "#000000", opacity: 0.45 }),
    jsx("path", { d: P(ring(u, v, w, r, 18, plane)), fill: rampAt(PL_STEEL, 0.62) }),
    jsx("path", { d: P(ring(u - r * 0.25, plane === "front" ? v - r * 0.25 : v, plane === "front" ? w : w - r * 0.25, r * 0.45, 12, plane)), fill: "#FFFFFF", opacity: 0.18 }),
    jsx("path", { d: P([d([-sx, -sy]), d([sx, sy])], false), stroke: "#14181C", strokeWidth: 1.5, opacity: 0.8, fill: "none" })
  ] });
};
/** the letters at rise e (0 sunk … 1 up; may overshoot), one CSS depth layer per slice, the lit face last */
const Letters = ({ id, rig, pose, rise, glint, text }) => {
  const base = BASE_SUNK - LIFT * rise;
  const layers = Array.from({ length: LT.layers }, (_, i) => i / (LT.layers - 1));
  const v0 = base - (LT.boxH - 24);
  const w0 = VB.slotZ - LT.depth / 2;
  const txt = (fill, extra = {}) => jsx("text", { x: LT.boxW / 2, y: LT.boxH - 24, textAnchor: "middle", fontFamily: SHOUT, fontSize: LT.size, letterSpacing: 8, fill, ...extra, children: text });
  const g = clamp01(glint);
  return jsxs("div", { "data-probe-depth": "the verdict's extruded steel letters (stacked depth layers)", style: { position: "absolute", inset: 0 }, children: [
    layers.slice(0, -1).map((k, i) => jsx(XPlane, { rig, x: pose, u: -LT.boxW / 2, v: v0, w: w0 + k * LT.depth, width: LT.boxW, height: LT.boxH, probe: "GUILTY: a depth layer of the steel letters", children: jsx("svg", { width: LT.boxW, height: LT.boxH, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: txt(mixHex("#6E8097", "#252D38", k)) }) }, i)),
    jsx(XPlane, { rig, x: pose, u: -LT.boxW / 2, v: v0, w: w0 + LT.depth + 0.3, width: LT.boxW, height: LT.boxH, probe: "GUILTY: the steel letters set into the block", children: jsxs("svg", { width: LT.boxW, height: LT.boxH, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsx("defs", { children: jsxs("linearGradient", { id: `${id}F`, gradientUnits: "userSpaceOnUse", x1: 0, y1: LT.boxH - 24 - CAP, x2: 0, y2: LT.boxH - 24, children: [
        jsx("stop", { offset: "0", stopColor: "#FBFCFE" }),
        jsx("stop", { offset: "0.42", stopColor: "#D3DDE9" }),
        jsx("stop", { offset: "0.58", stopColor: "#AEBCCE" }),
        jsx("stop", { offset: "1", stopColor: "#7C8EA6" })
      ] }) }),
      txt(`url(#${id}F)`, { stroke: "#FFFFFF", strokeOpacity: 0.35, strokeWidth: 1.2 }),
      // a glint crossing the faces as they seat (the key light catching the polished faces)
      g > 0.01 && g < 0.99 && jsx("g", { opacity: 0.55 * Math.sin(Math.PI * g), children: jsxs("svg", { width: LT.boxW, height: LT.boxH, style: { overflow: "visible" }, children: [
        jsx("defs", { children: jsxs("linearGradient", { id: `${id}G`, gradientUnits: "userSpaceOnUse", x1: -200 + 1300 * g, y1: 0, x2: -40 + 1300 * g, y2: LT.boxH, children: [
          jsx("stop", { offset: "0", stopColor: "#FFFFFF", stopOpacity: 0 }),
          jsx("stop", { offset: "0.5", stopColor: "#FFFFFF", stopOpacity: 0.9 }),
          jsx("stop", { offset: "1", stopColor: "#FFFFFF", stopOpacity: 0 })
        ] }) }),
        txt(`url(#${id}G)`)
      ] }) })
    ] }) })
  ] });
};
/** the block at `pose` (its foot centre), the letters raised by `rise`, the plates painted by `date` / `counts` (0…1) */
export const VerdictBlock = ({ id, rig, pose, rise, glint = 0, date, counts, sheen = 0 }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const m = parts();
  const yT = V_TOP - 0.3;
  // what is seen down the slot: its dark interior (the opening, inset a hair inside its walls)
  const slotOpen = P([[-UL, yT, S0], [UL, yT, S0], [UL, yT, S1], [-UL, yT, S1]]);
  const slotLip = P([[-UL, yT, S1], [UL, yT, S1]], false);
  const slotBackLip = P([[-UL, yT, S0], [UL, yT, S0]], false);
  // the letters' shadow on the top behind the slot (the key from the upper left front throws it right and back)
  const up = Math.max(0, rise) * CAP;
  const shade = up > 2 ? P([[-UL + 40, yT, S0], [UL - 20, yT, S0], [UL - 20 + 0.5 * up, yT, Math.max(ZB + 4, S0 - 0.62 * up)], [-UL + 40 + 0.5 * up, yT, Math.max(ZB + 4, S0 - 0.62 * up)]]) : null;
  // machining: brushed lines along the front face, a bright arris along the top front edge
  const brush = Array.from({ length: 14 }, (_, k) => P([[-VB.W / 2 + 10, V_TOP + 14 + k * 16.5, ZF + 0.1], [VB.W / 2 - 10, V_TOP + 14.6 + k * 16.5, ZF + 0.1]], false));
  const arris = P([[-VB.W / 2 + 8, V_TOP + 0.8, ZF - 0.5], [VB.W / 2 - 8, V_TOP + 0.8, ZF - 0.5]], false);
  const topScrews = [[-VB.W / 2 + 40, ZB + 34], [VB.W / 2 - 40, ZB + 34], [-VB.W / 2 + 40, ZF - 34], [VB.W / 2 - 40, ZF - 34]];
  const baseScrews = [-1, -0.5, 0.5, 1].map((k) => k * (VB.baseW / 2 - 50));
  const plateScrews = [-1, 1].flatMap((s) => [-1, 1].map((e) => [s * PLATE.u + e * (PLATE.w / 2 - 20), PLATE.v]));
  const sweep = -VB.W / 2 - 200 + (VB.W + 400) * clamp01(sheen);
  const band = P([[sweep, V_TOP + 2, ZF + 0.2], [sweep + 120, V_TOP + 2, ZF + 0.2], [sweep + 40, -VB.baseH - 2, ZF + 0.2], [sweep - 80, -VB.baseH - 2, ZF + 0.2]]);
  const faceClip = P([[-VB.W / 2 + 4, V_TOP + 4, ZF + 0.2], [VB.W / 2 - 4, V_TOP + 4, ZF + 0.2], [VB.W / 2 - 4, -VB.baseH - 4, ZF + 0.2], [-VB.W / 2 + 4, -VB.baseH - 4, ZF + 0.2]]);
  const ink = { groove: "#12161A", lip: "#E9EDF1", paint: "#EEF3F8" };
  return jsxs("div", { "data-probe-object": "the verdict block: a machined steel block with its letters set into a slot, two engraved front plates", style: { position: "absolute", inset: 0 }, children: [
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsx(Paint, { faces: m.toe, map, rig, ramp: PL_BODY, spec: 0.3, dim: 0.15 }),
      jsx(Paint, { faces: m.base, map, rig, ramp: PL_STEEL, spec: 0.6, dim: 0.12 }),
      baseScrews.map((u, k) => jsx(Screw, { P, u, v: -VB.baseH + 0.5, w: VB.baseD / 2 - 26, r: 6, plane: "top", slot: 0.4 + k }, `bs${k}`)),
      jsx(Paint, { faces: m.back, map, rig, ramp: PL_PLATE, spec: 0.55 }),
      jsx(Paint, { faces: m.ends, map, rig, ramp: PL_PLATE, spec: 0.55 }),
      [-1, 1].map((sg) => jsx("path", { d: P([[sg * UL, yT - 0.2, S0 - 8], [sg * (VB.W / 2 - 8), yT - 0.2, S0 - 8], [sg * (VB.W / 2 - 8), yT - 0.2, S1 + 8], [sg * UL, yT - 0.2, S1 + 8]]), fill: TOP_INK }, `ec${sg}`)),
      jsx("path", { d: slotOpen, fill: "#06090D" }),
      jsx("path", { d: slotBackLip, stroke: rampAt(PL_STEEL, 0.85), strokeWidth: 1.2, opacity: 0.6, fill: "none" }),
      shade && jsx("path", { d: shade, fill: "#000000", opacity: 0.32 * clamp01(rise * 1.5), stroke: "#000000", strokeOpacity: 0.12, strokeWidth: 8, strokeLinejoin: "round" }),
      topScrews.slice(0, 2).map(([u, w], k) => jsx(Screw, { P, u, v: V_TOP, w, plane: "top", slot: 0.3 + k }, `ts${k}`))
    ] }),
    jsx(Letters, { id: `${id}L`, rig, pose, rise, glint, text: "GUILTY" }),
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsx(Paint, { faces: m.front, map, rig, ramp: PL_PLATE, spec: 0.55 }),
      jsx("path", { d: slotLip, stroke: "#000000", strokeWidth: 2, opacity: 0.55, fill: "none" }),
      brush.map((d, k) => jsx("path", { d, stroke: k % 2 ? "#000000" : "#FFFFFF", strokeOpacity: k % 2 ? 0.08 : 0.05, strokeWidth: 1.2, fill: "none" }, `br${k}`)),
      jsx("defs", { children: jsx("clipPath", { id: `${id}Fc`, children: jsx("path", { d: faceClip }) }) }),
      jsx("path", { d: band, fill: "#FFFFFF", opacity: 0.05, clipPath: `url(#${id}Fc)` }),
      jsx("path", { d: arris, stroke: "#FFFFFF", strokeOpacity: 0.45, strokeWidth: 1.6, strokeLinecap: "round", fill: "none" }),
      topScrews.slice(2).map(([u, w], k) => jsx(Screw, { P, u, v: V_TOP, w, plane: "top", slot: 1.1 + k }, `tf${k}`)),
      jsx(Paint, { faces: m.plates, map, rig, ramp: PL_STEEL, spec: 0.7, dim: 0.05 }),
      plateScrews.map(([u, v], k) => jsx(Screw, { P, u, v, w: ZF + 6, r: 5.5, slot: 0.5 + 0.7 * k }, `ps${k}`))
    ] }),
    jsx(Engraved, { rig, pose, zF: ZF + 6, uC: -PLATE.u, vC: PLATE.v, width: PLATE.w - 70, size: 40, text: date.text, on: date.on, ink, probe: "the block's left plate", bare: 0.22 }),
    jsx(Engraved, { rig, pose, zF: ZF + 6, uC: PLATE.u, vC: PLATE.v, width: PLATE.w - 70, size: 40, text: counts.text, on: counts.on, ink, probe: "the block's right plate", bare: 0.22 })
  ] });
};
export const verdictBlockCorners = (pose) => {
  const out = [];
  for (const u of [-VB.W / 2, VB.W / 2]) for (const v of [V_TOP, 0]) for (const w of [ZB, ZF]) out.push(xfApply(pose, [u, v, w]));
  return out;
};
/** world point on the block (local u v w) */
export const blockPt = (pose, q) => xfApply(pose, q);
export const BLOCK_TOP_V = V_TOP;
export const LETTER_CAP = CAP;
