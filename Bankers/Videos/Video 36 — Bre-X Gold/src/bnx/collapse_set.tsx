// @ts-nocheck
// ★ V36 "Bre-X Gold" — collapse helpers (builder C): THE CERTIFICATE WALL and THE PRICE TAG.
//   The wall: a machined graphite frame (posts, header rail with an engraved header plate, bottom rail, feet) holding a recessed
//     board of share certificates as steel plates — 7 × 5 small blue-steel tiles, each with a bevelled edge, an engraved double
//     border, a guilloche wave top and bottom, four corner rosettes and BRE-X struck into it (gold-filled while the certificate is
//     worth something). `lit(i, j)` 0…1 per tile: 1 = a lit steel face with its gold-filled stamp, 0 = dark (the light gone out of
//     the face, the gold drained from the stamp). The header plate's engraving fills with paint on its word (`headOn`).
//   The tag: a heavy steel price tag (chamfered top, a grommeted eyelet) hanging on a ring from a machined T-stand (weighted foot
//     plate, collar, post, a forward arm with a hook). It twists about its ring (`turn` degrees about the vertical; 180 = its back
//     to the lens) and sways a little (`sway` degrees about the lens axis). Front: the figure in two lines (C$6 / BILLION) in dark
//     engraving; back: the new figure (6¢) filled red, with a small date line under it.
//   Local frames (world units ≈ px at the pivot depth; y up = negative, z toward the lens):
//     wall: origin at the foot centre on the floor, its front plane at z = CW.ZF.   stand: origin at the foot plate's centre.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { cw, prism, rampAt, lightOf } from "./solid_engine";
import { XPlane, facingM, mapPath, mapScr, normalM, paintXf, rrectPts, wound, xfApply, xfMul, xfRotY, xfRotZ, xfTrans, worldScr } from "./tk_rig";
import { Faces, Screw, vCyl } from "./counter_plinth";
import { Engraved } from "./counter_drums";
import { PL_BODY, PL_GROOVE, PL_LIP, PL_PLATE, PL_RUBBER, PL_STEEL } from "./counter_mat";
import { CT_PAINT } from "./counter_ink";
import { BX_GOLD, BX_STEEL, BX_STEEL_IN } from "./bx_gold";
import { theme } from "./theme";
import { figure, label } from "./kit";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);

// ── THE WALL ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// a standing frame on feet: the bottom rail, the recessed board of plates, the header rail with its engraved plate
export const CW = { cols: 5, rows: 6, tw: 132, th: 86, gx: 12, gy: 12, post: 32, head: 104, rail: 26, feet: 14, mar: 16, D: 64 };
CW.GW = CW.cols * CW.tw + (CW.cols - 1) * CW.gx;
CW.GH = CW.rows * CW.th + (CW.rows - 1) * CW.gy;
CW.W = CW.GW + 2 * CW.mar + 2 * CW.post;
CW.H = CW.feet + CW.rail + CW.mar + CW.GH + CW.mar + CW.head;
CW.ZF = CW.D / 2;
// the board the plates sit on is recessed into the frame; the plates stand proud of it
const BOARD_Z = CW.ZF - 20, TILE_T = 7, TILE_Z = BOARD_Z + TILE_T;
const V_RAIL = -CW.feet - CW.rail / 2;
const V_B0 = -CW.feet - CW.rail, V_B1 = V_B0 - (2 * CW.mar + CW.GH);
const V_HEAD = V_B1 - CW.head / 2;
const HEADPLATE = { w: 700, h: 74, t: 6 };
export const tileC = (i, j) => [-CW.GW / 2 + CW.tw / 2 + j * (CW.tw + CW.gx), V_B1 + CW.mar + CW.th / 2 + i * (CW.th + CW.gy)];
export const wallHeadC = [0, V_HEAD, CW.ZF + HEADPLATE.t];
export const wallTop = -CW.H;
let wmemo = null;
const wallParts = () => {
  if (wmemo) return wmemo;
  const feet = wound([-1, 1].flatMap((s) => [-1, 1].flatMap((t) => vCyl(s * (CW.W / 2 - 40), t * (CW.D / 2 - 14), -CW.feet, 0, 13, 0, 0))));
  const posts = wound([-1, 1].flatMap((s) => prism(rrectPts(CW.post, CW.H - CW.feet, 4, 3, s * (CW.W / 2 - CW.post / 2), (-CW.feet - CW.H) / 2), CW.D, 3, 0, 1)));
  const rail = wound(prism(rrectPts(CW.W - 2 * CW.post + 2, CW.rail, 3, 2, 0, V_RAIL), CW.D - 8, 2.5, 0, 1));
  const head = wound(prism(rrectPts(CW.W - 2 * CW.post + 2, CW.head, 3, 2, 0, V_HEAD), CW.D - 8, 2.5, 0, 1));
  const plate = wound(prism(rrectPts(HEADPLATE.w, HEADPLATE.h, 6, 3, 0, V_HEAD), HEADPLATE.t, 1.8, 0, 3, () => false, [0, 0, CW.ZF - 4 + HEADPLATE.t / 2]));
  wmemo = { feet, posts, rail, head, plate };
  return wmemo;
};
export const wallCorners = (pose) => {
  const out = [];
  for (const u of [-CW.W / 2, CW.W / 2]) for (const v of [-CW.H, 0]) for (const w of [-CW.D / 2, CW.D / 2]) out.push(xfApply(pose, [u, v, w]));
  return out;
};
// the guilloche: a fine double wave, as on a printed certificate's border
const wave = (P, u0, u1, v, amp, n, z) => {
  const pts = [];
  for (let k = 0; k <= n * 6; k++) {
    const t = k / (n * 6);
    pts.push([u0 + (u1 - u0) * t, v + amp * Math.sin(t * n * 2 * Math.PI), z]);
  }
  return P(pts, false);
};
/** the certificate wall — lit(i, j) 0…1 per plate (row i from the top, column j), stamp: the plates' struck word (a label),
 *  head: the header plate's engraving (a label), headOn 0…1 its paint, sheen −1…1 a soft band across the plates */
export const CollapseWall = ({ id, rig, pose, lit, stamp, head, headOn = 0, sheen = 0 }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const { feet, posts, rail, head: headRail, plate } = wallParts();
  // the board: a recessed dark field behind the plates, shadowed under the header and inside the left post (the light is upper left)
  const bu = CW.GW / 2 + CW.mar, bz = BOARD_Z;
  const board = P([[-bu, V_B1, bz], [bu, V_B1, bz], [bu, V_B0, bz], [-bu, V_B0, bz]]);
  const g0 = mapScr(map, rig, [-bu, V_B1, bz]), g1 = mapScr(map, rig, [bu, V_B0, bz]);
  // the plates' faces share ONE gradient across the wall (one light across the group), a soft sheen band sliding over it
  const t0 = mapScr(map, rig, [-CW.GW / 2, V_B1, TILE_Z]), t1 = mapScr(map, rig, [CW.GW / 2 * 0.6, V_B0, TILE_Z]);
  const sx = sheen * CW.GW * 0.7;
  const band = P([[sx - 160, V_B1 + 8, TILE_Z + 0.3], [sx - 60, V_B1 + 8, TILE_Z + 0.3], [sx - 230, V_B0 - 8, TILE_Z + 0.3], [sx - 330, V_B0 - 8, TILE_Z + 0.3]]);
  const tiles = [];
  for (let i = 0; i < CW.rows; i++) for (let j = 0; j < CW.cols; j++) tiles.push({ i, j, c: tileC(i, j), L: clamp01(lit(i, j)) });
  const rr = (c, w, h, r, z, seg = 3) => rrectPts(w, h, r, seg, c[0], c[1]).map(([u, v]) => [u, v, z]);
  // static engraving of every plate, batched: borders, inner rules, waves, rosettes
  const borders = tiles.map((t) => P(rr(t.c, CW.tw - 14, CW.th - 14, 4, TILE_Z + 0.2))).join("");
  const inner = tiles.map((t) => P(rr(t.c, CW.tw - 22, CW.th - 22, 2, TILE_Z + 0.2, 2))).join("");
  const waves = tiles.map((t) => wave(P, t.c[0] - CW.tw / 2 + 15, t.c[0] + CW.tw / 2 - 15, t.c[1] - CW.th / 2 + 15.5, 1.6, 9, TILE_Z + 0.25) + wave(P, t.c[0] - CW.tw / 2 + 15, t.c[0] + CW.tw / 2 - 15, t.c[1] + CW.th / 2 - 15.5, 1.6, 9, TILE_Z + 0.25)).join("");
  const rosette = (cu, cv) => P(Array.from({ length: 12 }, (_, k) => [cu + 3.6 * Math.cos(k / 12 * 2 * Math.PI), cv + 3.6 * Math.sin(k / 12 * 2 * Math.PI), TILE_Z + 0.25]));
  const ros = tiles.map((t) => [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([su, sv]) => rosette(t.c[0] + su * (CW.tw / 2 - 12), t.c[1] + sv * (CW.th / 2 - 12))).join("")).join("");
  const LIT_FACE = [rampAt(BX_STEEL, 0.86), rampAt(BX_STEEL, 0.76), rampAt(BX_STEEL, 0.64)];
  const DARK = "#0A1420";
  return jsxs(jsx_runtime.Fragment, { children: [
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsxs("defs", { children: [
        jsxs("linearGradient", { id: `${id}Bd`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
          jsx("stop", { offset: "0", stopColor: rampAt(PL_BODY, 0.36) }),
          jsx("stop", { offset: "1", stopColor: rampAt(PL_BODY, 0.16) })
        ] }),
        jsxs("linearGradient", { id: `${id}Tf`, gradientUnits: "userSpaceOnUse", x1: f2(t0[0]), y1: f2(t0[1]), x2: f2(t1[0]), y2: f2(t1[1]), children: [
          jsx("stop", { offset: "0", stopColor: LIT_FACE[0] }),
          jsx("stop", { offset: "0.5", stopColor: LIT_FACE[1] }),
          jsx("stop", { offset: "1", stopColor: LIT_FACE[2] })
        ] })
      ] }),
      jsx(Faces, { faces: feet, map, rig, ramp: () => PL_RUBBER, spec: 0.2 }),
      jsx(Faces, { faces: rail, map, rig, ramp: () => PL_PLATE, spec: 0.55 }),
      jsx("path", { d: board, fill: `url(#${id}Bd)` }),
      // the board's shadow under the header rail and inside the left post
      jsx("path", { d: P([[-bu, V_B1, bz + 0.2], [bu, V_B1, bz + 0.2], [bu, V_B1 + 14, bz + 0.2], [-bu, V_B1 + 22, bz + 0.2]]), fill: "#000000", opacity: 0.4 }),
      jsx("path", { d: P([[-bu, V_B1, bz + 0.2], [-bu + 16, V_B1, bz + 0.2], [-bu + 10, V_B0, bz + 0.2], [-bu, V_B0, bz + 0.2]]), fill: "#000000", opacity: 0.3 }),
      // every plate: its shadow on the board, its edge (the thickness), its face
      jsx("path", { d: tiles.map((t) => P(rr([t.c[0] + 3, t.c[1] + 4], CW.tw, CW.th, 6, BOARD_Z + 0.1))).join(""), fill: "#000000", opacity: 0.45 }),
      jsx("path", { d: tiles.map((t) => P(rr(t.c, CW.tw, CW.th, 6, BOARD_Z + 0.4))).join(""), fill: rampAt(BX_STEEL, 0.22) }),
      jsx("path", { d: tiles.map((t) => P(rr(t.c, CW.tw - 2, CW.th - 2, 5, TILE_Z))).join(""), fill: `url(#${id}Tf)` }),
      jsx("path", { d: band, fill: "#ffffff", opacity: 0.07, style: { filter: "blur(10px)" } }),
      // the engraving (cut lines dark, their lower lips lit)
      jsx("path", { d: borders, fill: "none", stroke: "#0D2236", strokeWidth: 1.5, opacity: 0.6 }),
      jsx("path", { d: borders, fill: "none", stroke: "#FFFFFF", strokeWidth: 0.8, opacity: 0.35, transform: "translate(0.8 1)" }),
      jsx("path", { d: inner, fill: "none", stroke: "#0D2236", strokeWidth: 0.8, opacity: 0.45 }),
      jsx("path", { d: waves, fill: "none", stroke: "#123049", strokeWidth: 0.9, opacity: 0.5 }),
      jsx("path", { d: ros, fill: "none", stroke: "#123049", strokeWidth: 1, opacity: 0.55 }),
      // the light going out of each plate: a dark veil per plate (a blend, never a threshold)
      tiles.map((t) => t.L < 0.999 && jsx("path", { d: P(rr(t.c, CW.tw - 1, CW.th - 1, 5, TILE_Z + 0.4)), fill: DARK, opacity: f2(0.86 * (1 - t.L)) }, `dk${t.i}_${t.j}`)),
      // the lit bevel along each plate's upper and left edges, fading with its light
      tiles.map((t) => jsx("path", { d: P([[t.c[0] - CW.tw / 2 + 4, t.c[1] + CW.th / 2 - 5, TILE_Z + 0.5], [t.c[0] - CW.tw / 2 + 2, t.c[1] - CW.th / 2 + 4, TILE_Z + 0.5], [t.c[0] + CW.tw / 2 - 5, t.c[1] - CW.th / 2 + 2, TILE_Z + 0.5]], false), fill: "none", stroke: "#FFFFFF", strokeWidth: 1.3, opacity: f2(0.12 + 0.4 * t.L) }, `bv${t.i}_${t.j}`)),
      jsx(Faces, { faces: posts, map, rig, ramp: () => PL_PLATE, spec: 0.6 }),
      jsx(Faces, { faces: headRail, map, rig, ramp: () => PL_PLATE, spec: 0.55 }),
      jsx("path", { d: P(rrectPts(HEADPLATE.w + 8, HEADPLATE.h + 8, 8, 3, 4, V_HEAD + 5).map(([u, v]) => [u, v, CW.ZF - 3.6])), fill: "#000000", opacity: 0.3 }),
      jsx(Faces, { faces: plate, map, rig, ramp: () => PL_STEEL, spec: 0.7 }),
      [-1, 1].map((s) => jsx(Screw, { id: `${id}hs${s}`, map, rig, c: [s * (HEADPLATE.w / 2 - 20), V_HEAD, CW.ZF - 4 + HEADPLATE.t], r: 5.5, plane: "front", slot: s * 30 }, `hs${s}`)),
      [-1, 1].flatMap((s) => [V_HEAD, V_RAIL].map((v, k) => jsx(Screw, { id: `${id}ps${s}${k}`, map, rig, c: [s * (CW.W / 2 - CW.post / 2), v, CW.ZF], r: 6, plane: "front", slot: 20 + 30 * s + 15 * k }, `ps${s}${k}`)))
    ] }),
    // BRE-X struck into every plate: the groove always, its gold fill with the plate's light
    tiles.map((t) => jsx(Engraved, { rig, pose, zF: TILE_Z, uC: t.c[0], vC: t.c[1] + 1, width: CW.tw - 34, size: 32, text: stamp, on: t.L, ink: { groove: "#0B1B2B", lip: "#E7EEF5", paint: rampAt(BX_GOLD, 0.62) }, probe: "a certificate plate's BRE-X stamp", bare: 0.55 + 0.25 * t.L }, `bx${t.i}_${t.j}`)),
    // the header plate: the count, engraved, its paint filling on its word
    jsx(Engraved, { rig, pose, zF: CW.ZF - 4 + HEADPLATE.t, uC: 0, vC: V_HEAD, width: HEADPLATE.w - 70, size: 52, text: head, on: headOn, ink: { groove: "#14181C", lip: "#F3F5F7", paint: CT_PAINT }, probe: "the wall's engraved header plate", bare: 0.22 })
  ] });
};

// ── THE TAG ON ITS STAND ─────────────────────────────────────────────────────────────────────────────────────────────────────────
export const TAG = { w: 206, h: 282, c: 58, t: 8, eye: 30, hole: 11, grom: 20, post: 520, arm: 170, foot: 66 };
// the tag's own frame: the eyelet's centre at the origin, the tag hanging below it (its top edge at y = −TAG.eye)
const tagPoly = (() => {
  const { w, h, c, eye } = TAG, y0 = -eye, y1 = h - eye, r = 10;
  const pts = [[-w / 2 + c, y0], [w / 2 - c, y0], [w / 2, y0 + c]];
  for (let k = 0; k <= 4; k++) pts.push([w / 2 - r + r * Math.cos(k / 4 * Math.PI / 2), y1 - r + r * Math.sin(k / 4 * Math.PI / 2)]);
  for (let k = 0; k <= 4; k++) pts.push([-w / 2 + r - r * Math.sin(k / 4 * Math.PI / 2), y1 - r + r * Math.cos(k / 4 * Math.PI / 2)]);
  pts.push([-w / 2, y0 + c]);
  return cw(pts);
})();
let tmemo = null;
const tagParts = () => {
  if (tmemo) return tmemo;
  const S = TAG;
  const foot = wound(vCyl(0, 0, -12, 0, S.foot, 0, 0));
  const collar = wound(vCyl(0, 0, -26, -12, 22, 0, 1));
  const post = wound(vCyl(0, 0, -S.post, -26, 8.5, 0, 1));
  const cap = wound(vCyl(0, 0, -S.post - 10, -S.post, 13, 0, 2));
  const arm = wound(prism(rrectPts(16, 14, 3, 2, 0, -S.post + 8), S.arm, 2, 0, 2, () => false, [0, 0, S.arm / 2]).map((f) => f));
  const knuckle = wound(vCyl(0, S.arm - 4, -S.post + 15, -S.post + 30, 6, 0, 3));
  const body = wound(prism(tagPoly, S.t, 2.2, 0, 1));
  tmemo = { foot, collar, post, cap, arm, knuckle, body };
  return tmemo;
};
/** where the eyelet hangs, in the stand's frame */
export const TAG_HANG = [0, -TAG.post + 30 + 30, TAG.arm - 4];
export const tagXfOf = (pose, turn = 0, sway = 0) => xfMul(pose, xfMul(xfTrans(TAG_HANG), xfMul(xfRotY(turn), xfRotZ(sway))));
export const standCorners = (pose) => {
  const out = [];
  for (const u of [-TAG.foot, TAG.foot]) for (const v of [-TAG.post - 10, 0]) for (const w of [-TAG.foot, TAG.foot]) out.push(xfApply(pose, [u, v, w]));
  return out;
};
export const tagCorners = (txf) => {
  const out = [];
  for (const u of [-TAG.w / 2, TAG.w / 2]) for (const v of [-TAG.eye, TAG.h - TAG.eye]) for (const w of [-TAG.t / 2, TAG.t / 2]) out.push(xfApply(txf, [u, v, w]));
  return out;
};
// the print of one face (front or back), drawn upright in the face's own plane
const TagPrint = ({ rig, xf, lines, red, date, probe }) => {
  const W = TAG.w - 36, H = TAG.h - TAG.eye - 70;
  const v0 = TAG.grom + 26;
  const ink = (c, op, dx, dy) => jsxs("div", { style: { position: "absolute", left: dx, top: dy, width: W, height: H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: op }, children: [
    lines[0] && jsx("div", { style: { ...figure(lines[0].size, c(0)), letterSpacing: lines[0].size >= 120 ? -3 : -2, lineHeight: 0.92 }, children: lines[0].text }),
    lines[1] && jsx("div", { style: { ...label(lines[1].size, c(1)), letterSpacing: 1.5, marginTop: lines[1].gap ?? 6 }, children: lines[1].text })
  ] });
  return jsx(XPlane, { rig, x: xf, u: -W / 2, v: v0, w: TAG.t / 2 + 0.6, width: W, height: H, probe, children: jsxs("div", { style: { position: "relative", width: W, height: H }, children: [
    // the engraving's lit lower lip, then the cut itself (and on the back, the red fill)
    ink(() => "#F4F6F8", 0.7, 1.4, 1.8),
    ink((k) => k === 0 && red ? mixHex(theme.red, "#5A0A12", 0.12) : "#11161B", 1, 0, 0)
  ] }) });
};
/** the price tag on its stand — pose: the stand's foot on the floor; turn/sway in degrees; front/back: the faces' print */
export const CollapseTag = ({ id, rig, pose, turn = 0, sway = 0, front, back }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const { foot, collar, post, cap, arm, knuckle, body } = tagParts();
  const txf = tagXfOf(pose, turn, sway);
  const tmap = (q) => xfApply(txf, q);
  const TP = (pts, close = true) => mapPath(tmap, rig, pts, close);
  // the face toward the lens (front +z, back −z) and its light
  const fFront = facingM(tmap, rig, [0, 0, 1], [0, TAG.h / 2 - TAG.eye, TAG.t / 2]);
  const sideZ = fFront >= 0 ? TAG.t / 2 + 0.3 : -TAG.t / 2 - 0.3;
  const nv = normalM(tmap, rig, [0, 0, fFront >= 0 ? 1 : -1], [0, TAG.h / 2 - TAG.eye, sideZ]);
  const l = lightOf(nv, 0.35);
  const g0 = mapScr(tmap, rig, [-TAG.w / 2, -TAG.eye, sideZ]), g1 = mapScr(tmap, rig, [TAG.w / 2, TAG.h - TAG.eye, sideZ]);
  const face = TP(rrectPts(TAG.w - 12, TAG.h - 12, 8, 2, 0, TAG.h / 2 - TAG.eye).map(([u, v]) => [u, v, sideZ]));
  const inset = tagPoly.map(([u, v]) => [u * 0.9, (v - (TAG.h / 2 - TAG.eye)) * 0.93 + (TAG.h / 2 - TAG.eye), sideZ]);
  const ring = (rr, z = sideZ) => Array.from({ length: 24 }, (_, k) => [rr * Math.cos(k / 24 * 2 * Math.PI), rr * Math.sin(k / 24 * 2 * Math.PI), z]);
  const brush = [];
  for (let v = -TAG.eye + 18; v < TAG.h - TAG.eye - 10; v += 5) brush.push(TP([[-TAG.w / 2 + 12, v, sideZ], [TAG.w / 2 - 12, v, sideZ]], false));
  const edgeOn = Math.abs(fFront) < 0.08;
  // the steel ring through the eyelet up to the arm's hook, in the plane across the tag
  const hook = mapScr(map, rig, [0, -TAG.post + 30, TAG.arm - 4]);
  const ringPts = Array.from({ length: 28 }, (_, k) => {
    const a = k / 28 * 2 * Math.PI;
    return mapScr(map, rig, [0, TAG_HANG[1] - 15 + 15 * Math.sin(a), TAG_HANG[2] + 15 * Math.cos(a)]);
  });
  const ringD = `M${ringPts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`;
  return jsxs(jsx_runtime.Fragment, { children: [
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsxs("defs", { children: [jsxs("linearGradient", { id: `${id}Fc`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
        jsx("stop", { offset: "0", stopColor: rampAt(PL_STEEL, Math.min(0.97, 0.5 + 0.62 * l)) }),
        jsx("stop", { offset: "0.45", stopColor: rampAt(PL_STEEL, Math.min(0.9, 0.4 + 0.55 * l)) }),
        jsx("stop", { offset: "1", stopColor: rampAt(PL_STEEL, 0.3 + 0.45 * l) })
      ] })] }),
      jsx(Faces, { faces: foot, map, rig, ramp: () => PL_PLATE, spec: 0.6 }),
      jsx("path", { d: P(Array.from({ length: 36 }, (_, k) => [(TAG.foot - 8) * Math.cos(k / 36 * 2 * Math.PI), -12.2, (TAG.foot - 8) * Math.sin(k / 36 * 2 * Math.PI)])), fill: "none", stroke: PL_GROOVE, strokeWidth: 1.4, opacity: 0.6 }),
      jsx(Faces, { faces: collar, map, rig, ramp: () => PL_STEEL, spec: 0.8 }),
      jsx(Faces, { faces: post, map, rig, ramp: () => PL_STEEL, spec: 0.9 }),
      jsx(Faces, { faces: cap, map, rig, ramp: () => PL_STEEL, spec: 0.9 }),
      jsx(Faces, { faces: arm, map, rig, ramp: () => PL_STEEL, spec: 0.8 }),
      jsx(Faces, { faces: knuckle, map, rig, ramp: () => PL_STEEL, spec: 0.9 }),
      jsx("path", { d: ringD, fill: "none", stroke: rampAt(PL_STEEL, 0.3), strokeWidth: 5.5 }),
      jsx("path", { d: ringD, fill: "none", stroke: rampAt(PL_STEEL, 0.9), strokeWidth: 2, transform: "translate(-0.8 -0.8)" }),
      jsx(Faces, { faces: body, map: tmap, rig, ramp: () => PL_STEEL, spec: 0.7 }),
      !edgeOn && jsxs("g", { children: [
        jsx("path", { d: face, fill: `url(#${id}Fc)` }),
        jsx("path", { d: brush.join(""), stroke: "#000000", strokeOpacity: 0.05, strokeWidth: 0.9, fill: "none" }),
        jsx("path", { d: TP(inset), fill: "none", stroke: PL_GROOVE, strokeWidth: 1.4, opacity: 0.55 }),
        jsx("path", { d: TP(inset), fill: "none", stroke: "#FFFFFF", strokeWidth: 0.7, opacity: 0.4, transform: "translate(0.7 0.9)" }),
        // the grommet and the hole through it
        jsx("path", { d: TP(ring(TAG.grom)), fill: rampAt(PL_STEEL, 0.25 + 0.6 * l) }),
        jsx("path", { d: TP(ring(TAG.grom - 3)), fill: "none", stroke: "#FFFFFF", strokeWidth: 1, opacity: 0.45 }),
        jsx("path", { d: TP(ring(TAG.hole)), fill: "#05090D" })
      ] }),
      // the ring passes in front of the hole's lower edge
      jsx("path", { d: `M${f2(hook[0])},${f2(hook[1])}L${f2(hook[0])},${f2(hook[1] + 2)}`, stroke: rampAt(PL_STEEL, 0.8), strokeWidth: 3 })
    ] }),
    front && jsx(TagPrint, { rig, xf: txf, lines: front, probe: "the price tag's engraved figure" }),
    back && jsx(TagPrint, { rig, xf: xfMul(txf, xfRotY(180)), lines: back, red: true, probe: "the price tag's engraved figure (back)" })
  ] });
};
