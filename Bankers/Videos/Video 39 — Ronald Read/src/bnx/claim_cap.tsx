// @ts-nocheck
// Video 37 "Theranos" — claim's UNIVERSITY OBJECT (builder B, rev 2, 2026-11-25). Timur: "try adding some kind of visual to explain
//   the voiceover of a dropout from Stanford, like something connected to university … on 'then dropped out of Stanford'."
//   A graduation MORTARBOARD perched on the lab building's parapet coping at its front-right corner, half over the edge: the square
//   board (cloth over a stiff board: a bevelled slab with a woven sheen and a lit front edge), the skull cap under it with its
//   stitched band, the button on top, and a gold tassel (cord across the board to its front corner, a crown, a fan of strands)
//   swinging in the breeze. On "then dropped out" it tips over the edge and DROPS: it falls past the building's corner outside the
//   side wall (never across the founder's plate), tumbling once with its tassel trailing, rights itself and lands on its skull on
//   the ground at the foot of the corner, rocking to rest. A literal drop-out.
//   Drawn on the claim rig in the DOOR's local frame (th_door).
//   <ClaimCap id rig pose k f />   k = frames since it began to tip (< 0: perched) · f = the frame (the breeze)
//   CAP (dimensions + its fall's frames) · capCorners(pose, k) → TkFloor casters · capTopLocal → its highest point while perched
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex, rIn, rInOut, rOut } from "./anim";
import { rampAt } from "./solid_engine";
import { mapScr, xfApply, xfMul, xfRotY, xfRotZ, xfTrans } from "./tk_rig";
import { PaintParts, boxAB, cylAB, f2, path3, ring3 } from "./claim_kit";
import { DOOR } from "./th_door";
import { TH_CAP, TH_GOLD } from "./claim_mat";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs;
const B = boxAB;
// cap-local: origin at the skull's foot (where it sits), y up negative; the board square in x–z, turned 45° to the facade
export const CAP = { r: 64, skull: 56, board: 220, bt: 11, tip: 10, g: 3.4, k: 1.45 };
const SEAT = [DOOR.W1 - 22, -DOOR.H, -8];          // perched on the coping's front-right corner, half over the edge
const PIVOT = [DOOR.W1 + 14, -DOOR.H, -6];         // it tips about the coping's outer edge
const LAND = [DOOR.W1 + 125, 0, -40];               // where it comes to rest: outside the side wall, at the corner's foot
const H0 = -DOOR.H;                                  // the seat's height (local y)
// the fall: a tip over the edge (CAP.tip frames), then free fall from the tipped height to the ground
const FALL = Math.sqrt(2 * (0 - H0) / CAP.g);
export const CAP_T = { tip: CAP.tip, land: Math.round(CAP.tip + FALL), rest: Math.round(CAP.tip + FALL) + 16 };
export const capTopLocal = [SEAT[0], H0 - CAP.skull - CAP.bt - 30, SEAT[2]];
const lerp = (a, b, e) => a + (b - a) * e;
// the cap's pose (cap-local → door-local) k frames after it began to tip; idle teeter while perched
const capXf = (k, f) => {
  const yaw = xfRotY(45);
  if (k <= 0) {
    const tt = 1.2 * Math.sin(f / 23);
    return xfMul(xfTrans(PIVOT), xfMul(xfRotZ(tt * 0.6), xfMul(xfTrans([SEAT[0] - PIVOT[0], SEAT[1] - PIVOT[1], SEAT[2] - PIVOT[2]]), yaw)));
  }
  if (k <= CAP.tip) {
    // it tips over the outer edge: its far side lifts, the cap rolls outward about the edge (gravity: slow, then quick)
    const a = 38 * rIn(k, 0, CAP.tip);
    return xfMul(xfTrans(PIVOT), xfMul(xfRotZ(a), xfMul(xfTrans([SEAT[0] - PIVOT[0], SEAT[1] - PIVOT[1], SEAT[2] - PIVOT[2]]), yaw)));
  }
  // free fall: down under gravity, away from the wall, tumbling once and righting itself by the landing
  const t = Math.min(k - CAP.tip, FALL), e = t / FALL;
  const x = lerp(PIVOT[0] + 20, LAND[0], rOut(t, 0, FALL * 0.7)), z = lerp(SEAT[2], LAND[2], e);
  const y = H0 + 0.5 * CAP.g * t * t;
  // the tumble carries on from the tip's own turning speed (no jolt) and brakes evenly to upright by the landing: a cubic
  //   Hermite from 38° to 360°, its start slope the tip's end speed, its end slope zero
  const v0 = 38 * 2 / CAP.tip * FALL / 322, h = (2 * e * e * e - 3 * e * e + 1) * 0 + (e * e * e - 2 * e * e + e) * v0 + (-2 * e * e * e + 3 * e * e);
  const spin = 38 + 322 * h;
  let base = xfMul(xfTrans([x, Math.min(0, y), z]), xfMul(xfRotZ(spin), yaw));
  if (k - CAP.tip > FALL) {
    // landed on its skull: it rocks to rest
    const d = k - CAP.tip - FALL, rock = 7 * Math.exp(-d / 5) * Math.sin(d / 1.9);
    base = xfMul(xfTrans([LAND[0], 0, LAND[2]]), xfMul(xfRotZ(rock), yaw));
  }
  return base;
};
export const capCorners = (pose, k, f) => {
  const x = xfMul(pose, capXf(k, f)), out = [], hb = CAP.board / 2;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [0, -CAP.skull - CAP.bt]) out.push(xfApply(x, [sx * hb, y, sz * hb]));
  return out;
};
const capParts = () => {
  const { r, skull, board, bt } = CAP, hb = board / 2, ps = [];
  const P = (k, faces, ramp, oo = {}) => ps.push({ faces, ramp, spec: 0.35, key: k, ...oo, c: oo.c ?? [0, 0, 0] });
  P("sk", cylAB([0, 0, 0], [0, -skull, 0], r, 26), TH_CAP, { layer: 0, c: [0, -skull / 2, 0], after: (map, rig) => {
    // the skull's stitched band near its foot
    const ring = ring3([0, -9, 0], [1, 0, 0], [0, 0, 1], r + 0.4, 40);
    return jsx("path", { d: path3(map, rig, ring), stroke: "#6E86A6", strokeWidth: 1.1, strokeDasharray: "3 3", opacity: 0.55, fill: "none" });
  } });
  P("bd", B([-hb, -skull, -hb], [hb, -skull - bt, hb], 2.5), TH_CAP, { layer: 1, c: [0, -skull - bt / 2, 0], spec: 0.5, lift: 0.04, after: (map, rig) => {
    // the woven sheen across the board's top: a soft diagonal band from the key light, and the button
    const y = -skull - bt - 0.4;
    const band = path3(map, rig, [[-hb, y, -hb * 0.2], [-hb * 0.2, y, -hb], [hb * 0.2, y, -hb], [-hb, y, hb * 0.2]]);
    return jsx("path", { d: band, fill: "#C7D7EA", opacity: 0.12 });
  } });
  P("bt", cylAB([0, -skull - bt, 0], [0, -skull - bt - 8, 0], 12, 16), TH_CAP, { layer: 2, c: [0, -skull - bt - 3, 0], lift: 0.12 });
  return ps;
};
// the tassel: a gold cord from the button over the board to its front corner, a crown, and a fan of strands that swings
const Tassel = ({ id, rig, map, swing }) => {
  const { skull, bt, board } = CAP, hb = board / 2, y = -skull - bt - 1;
  const corner = [hb - 6, y, hb - 6];
  const S = (q) => mapScr(map, rig, q);
  const cord = [[0, y - 6, 0], [hb * 0.5, y - 1.5, hb * 0.5], corner];
  // hanging part: from the corner down, swung by `swing` (radians) in the plane of the corner's diagonal
  const dir = [Math.sin(swing) * 0.7071, Math.cos(swing), Math.sin(swing) * 0.7071];
  const K = CAP.k, at = (s, off = 0) => [corner[0] + 6 + dir[0] * s * K + off * K, corner[1] + 2 + dir[1] * s * K, corner[2] + 6 + dir[2] * s * K - off * K];
  const crown0 = at(14), crown1 = at(24);
  const g = TH_GOLD;
  const strands = [-7, -5, -3, -1, 1, 3, 5, 7].map((o) => [at(24, o * 0.45), at(64, o)]);
  const c0 = S(crown0), c1 = S(crown1);
  return jsxs("g", { children: [
    jsx("path", { d: path3(map, rig, [...cord, at(0), crown0], false), stroke: g.mid, strokeWidth: 3, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }),
    jsx("path", { d: path3(map, rig, [...cord, at(0), crown0], false), stroke: g.hi, strokeWidth: 1, opacity: 0.7, fill: "none", strokeLinecap: "round" }),
    // the strands (dark under-layer, then lit strands)
    jsx("path", { d: strands.map(([a, b]) => path3(map, rig, [a, b], false)).join(""), stroke: g.dark, strokeWidth: 4, strokeLinecap: "round", fill: "none" }),
    jsx("path", { d: strands.map(([a, b]) => path3(map, rig, [a, b], false)).join(""), stroke: g.face, strokeWidth: 2.2, strokeLinecap: "round", fill: "none" }),
    jsx("path", { d: strands.filter((_, i) => i % 2 === 0).map(([a, b]) => path3(map, rig, [a, b], false)).join(""), stroke: g.hi, strokeWidth: 0.9, opacity: 0.8, strokeLinecap: "round", fill: "none" }),
    // the crown: a gold barrel binding the strands
    jsx("path", { d: `M${f2(c0[0])},${f2(c0[1])}L${f2(c1[0])},${f2(c1[1])}`, stroke: g.body, strokeWidth: 11, strokeLinecap: "round" }),
    jsx("path", { d: `M${f2(c0[0] - 1.5)},${f2(c0[1])}L${f2(c1[0] - 1.5)},${f2(c1[1])}`, stroke: g.hi, strokeWidth: 2, strokeLinecap: "round", opacity: 0.85 })
  ] });
};
export const ClaimCap = ({ id, rig, pose, k, f }) => {
  const x = xfMul(pose, capXf(k, f)), map = (q) => xfApply(x, q);
  // the tassel: a breeze while it is perched; it trails the tumble (swung against the spin), then settles
  const t = k - CAP.tip;
  const swing = k <= 0 ? 0.22 * Math.sin(f / 13) + 0.08 * Math.sin(f / 5.7)
    : t <= 0 ? -0.5 * rIn(k, 0, CAP.tip)
    : t <= FALL ? -0.5 - 0.9 * Math.sin(Math.PI * clamp01(t / FALL))
    : -0.5 * Math.exp(-(t - FALL) / 6) * Math.cos((t - FALL) / 2.2);
  return jsx("svg", { width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsxs("g", { children: [
    jsx(PaintParts, { parts: capParts(), map, rig, id: `${id}c` }),
    jsx(Tassel, { id, rig, map, swing })
  ] }) });
};
