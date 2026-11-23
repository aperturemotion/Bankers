// @ts-nocheck
// ★ V36 hype helpers (builder H): the machined display PEDESTAL the cent stands on (V35's graphite plinth family: rubber feet, a
//   foot plate, a brushed body, a cap plate with screws), its engraved header plate (PENNIES), three steel RAIL slots down its front,
//   the engraved steel PLAQUES that slide into them (ONTARIO TEACHERS' · OMERS · CAISSE — names only, no logos), and the one-cent
//   coin's FACE (a maple twig with two leaves inside a denticled rim — the reverse of Canada's 1937–2012 cent, its text left off).
//   Local frame: the pedestal's foot centre at the origin, y up = negative, its front face at z = HP.ZF.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { cw, prism, rampAt } from "./solid_engine";
import { mapPath, mapScr, rrectPts, wound, xfApply, worldScr } from "./tk_rig";
import { Faces, Screw, vCyl } from "./counter_plinth";
import { Engraved } from "./counter_drums";
import { PL_BODY, PL_GROOVE, PL_LIP, PL_PLATE, PL_RECESS, PL_RUBBER, PL_STEEL } from "./counter_mat";
import { CT_PAINT } from "./counter_ink";
import { BX_COPPER } from "./bx_gold";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
export const HP = { feet: 10, foot: { W: 660, H: 24, D: 360 }, body: { W: 580, H: 380, D: 300 }, cap: { W: 630, H: 22, D: 330 } };
const VB0 = -HP.feet - HP.foot.H - HP.body.H;
export const HP_TOP = VB0 - HP.cap.H;
const ZF = HP.body.D / 2;
HP.ZF = ZF;
const HEAD = { w: 430, h: 62, v: VB0 + 22 + 31, t: 6 };
const PLQ = { w: 482, h: 68, t: 10, pitch: 86 };
export const slotV = (i) => VB0 + 22 + HEAD.h + 30 + PLQ.h / 2 + i * PLQ.pitch;
let memo = null;
const parts = () => {
  if (memo) return memo;
  const feet = wound([-1, 1].flatMap((su) => [-1, 1].flatMap((sw) => vCyl(su * (HP.foot.W / 2 - 56), sw * (HP.foot.D / 2 - 54), -HP.feet, 0, 17, 0, 0))));
  const foot = wound(prism(rrectPts(HP.foot.W, HP.foot.H, 5, 3, 0, -HP.feet - HP.foot.H / 2), HP.foot.D, 4, 0, 1));
  const body = wound(prism(rrectPts(HP.body.W, HP.body.H, 8, 3, 0, VB0 + HP.body.H / 2), HP.body.D, 6, 0, 1));
  const cap = wound(prism(rrectPts(HP.cap.W, HP.cap.H, 5, 3, 0, VB0 - HP.cap.H / 2), HP.cap.D, 4.5, 0, 1));
  const head = wound(prism(rrectPts(HEAD.w, HEAD.h, 6, 3, 0, HEAD.v), HEAD.t, 1.8, 0, 3, () => false, [0, 0, ZF + HEAD.t / 2]));
  // each slot: a rail lip above and below, standing proud of the face
  const rails = [0, 1, 2].map((i) => wound([-1, 1].flatMap((s) => prism(rrectPts(PLQ.w + 40, 6, 2, 2, 0, slotV(i) + s * (PLQ.h / 2 + 4)), 9, 1.4, 0, 3, () => false, [0, 0, ZF + 4.5]))));
  const plaque = wound(prism(rrectPts(PLQ.w, PLQ.h, 5, 3, 0, 0), PLQ.t, 2.6, 0, 1));
  memo = { feet, foot, body, cap, head, rails, plaque };
  return memo;
};
const ENG = { groove: PL_GROOVE, lip: PL_LIP, paint: CT_PAINT };
export const pedestalCorners = (pose) => {
  const out = [];
  for (const u of [-HP.cap.W / 2, HP.cap.W / 2]) for (const v of [HP_TOP, 0]) for (const w of [-HP.cap.D / 2, HP.cap.D / 2]) out.push(xfApply(pose, [u, v, w]));
  return out;
};
/** the pedestal: word = L("hypeFrom"), wordOn 0…1 fills its engraving with paint (on "pennies") */
export const HypePedestal = ({ id, rig, pose, word, wordOn = 0, sheen = 0 }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const { feet, foot, body, cap, head, rails } = parts();
  const W = HP.body.W, b0 = VB0, b1 = VB0 + HP.body.H;
  // the brushed face: horizontal brush lines and a soft sheen band
  const brush = [];
  for (let v = b0 + 10; v < b1 - 8; v += 7) brush.push(P([[-W / 2 + 8, v, ZF + 0.15], [W / 2 - 8, v, ZF + 0.15]], false));
  const s0 = -W / 2 + 60 + sheen;
  const band = (a, w) => P([[s0 + a, b0, ZF + 0.1], [s0 + a + w, b0, ZF + 0.1], [s0 + a + w - 140, b1, ZF + 0.1], [s0 + a - 140, b1, ZF + 0.1]]);
  const screws = [[-W / 2 + 24, b0 + 22, ZF], [W / 2 - 24, b0 + 22, ZF], [-W / 2 + 24, b1 - 22, ZF], [W / 2 - 24, b1 - 22, ZF]];
  const hs = [-1, 1].map((s) => [s * (HEAD.w / 2 - 18), HEAD.v, ZF + HEAD.t]);
  const ct = HP_TOP - 0.3, cw2 = HP.cap.W / 2, cd2 = HP.cap.D / 2;
  const capScrews = [-1, 1].flatMap((su) => [-1, 1].map((sw) => [su * (cw2 - 24), ct, sw * (cd2 - 24)]));
  // each slot's recessed channel behind its plaque
  const chan = (i) => P([[-PLQ.w / 2 - 10, slotV(i) - PLQ.h / 2 - 1, ZF + 0.2], [PLQ.w / 2 + 10, slotV(i) - PLQ.h / 2 - 1, ZF + 0.2], [PLQ.w / 2 + 10, slotV(i) + PLQ.h / 2 + 1, ZF + 0.2], [-PLQ.w / 2 - 10, slotV(i) + PLQ.h / 2 + 1, ZF + 0.2]]);
  return jsxs(jsx_runtime.Fragment, { children: [
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsx(Faces, { faces: feet, map, rig, ramp: () => PL_RUBBER, spec: 0.2 }),
      jsx(Faces, { faces: foot, map, rig, ramp: () => PL_PLATE, spec: 0.6 }),
      [-1, 1].map((s) => jsx(Screw, { id: `${id}fs${s}`, map, rig, c: [s * (HP.foot.W / 2 - 40), -HP.feet - HP.foot.H / 2, HP.foot.D / 2], r: 4.6, plane: "front", slot: s * 35 }, `fs${s}`)),
      // the body's soft contact shadow on the foot plate
      [16, 8, 3].map((g, k) => jsx("path", { d: P([[-W / 2 - g * 0.4, b1 - 0.6, ZF + g], [W / 2 + g, b1 - 0.6, ZF + g], [W / 2 + g, b1 - 0.6, -ZF - g * 0.3], [-W / 2 - g * 0.4, b1 - 0.6, -ZF - g * 0.3]]), fill: "#000000", opacity: [0.1, 0.16, 0.3][k] }, `c${k}`)),
      jsx(Faces, { faces: body, map, rig, ramp: () => PL_BODY, spec: 0.5 }),
      brush.map((d, k) => jsx("path", { d, stroke: k % 2 ? "#000000" : "#ffffff", strokeOpacity: 0.035, strokeWidth: 1, fill: "none" }, `br${k}`)),
      jsx("path", { d: band(0, 120), fill: "#ffffff", opacity: 0.03 }),
      jsx("path", { d: band(150, 26), fill: "#ffffff", opacity: 0.022 }),
      jsx("path", { d: P([[-W / 2, b0, ZF + 0.1], [W / 2, b0, ZF + 0.1], [W / 2, b0 + 7, ZF + 0.1], [-W / 2, b0 + 7, ZF + 0.1]]), fill: "#000000", opacity: 0.3 }),
      [0, 1, 2].map((i) => jsx("path", { d: chan(i), fill: rampAt(PL_BODY, 0.2), opacity: 1 }, `ch${i}`)),
      [0, 1, 2].map((i) => jsx("path", { d: P([[-PLQ.w / 2 - 10, slotV(i) - PLQ.h / 2 + 2, ZF + 0.3], [PLQ.w / 2 + 10, slotV(i) - PLQ.h / 2 + 2, ZF + 0.3]], false), stroke: "#000000", strokeWidth: 4, opacity: 0.35, fill: "none" }, `cs${i}`)),
      [0, 1, 2].map((i) => jsx(Faces, { faces: rails[i], map, rig, ramp: () => PL_STEEL, spec: 0.7 }, `rl${i}`)),
      screws.map((c, k) => jsx(Screw, { id: `${id}s${k}`, map, rig, c, r: 7, plane: "front", slot: [25, -30, 50, -10][k] }, `s${k}`)),
      // the header plate (proud of the face), its screws
      jsx("path", { d: P(rrectPts(HEAD.w + 6, HEAD.h + 6, 7, 3, 3, HEAD.v + 4).map(([u, v]) => [u, v, ZF + 0.2])), fill: "#000000", opacity: 0.25 }),
      jsx(Faces, { faces: head, map, rig, ramp: () => PL_PLATE, spec: 0.7 }),
      hs.map((c, k) => jsx(Screw, { id: `${id}h${k}`, map, rig, c, r: 5, plane: "front", slot: [40, -20][k] }, `h${k}`)),
      jsx(Faces, { faces: cap, map, rig, ramp: () => PL_PLATE, spec: 0.6 }),
      jsx("path", { d: P(rrectPts(HP.cap.W - 30, HP.cap.D - 30, 8, 3).map(([u, w]) => [u, ct, w])), fill: "none", stroke: PL_GROOVE, strokeWidth: 1.8, opacity: 0.75 }),
      jsx("path", { d: P(rrectPts(HP.cap.W - 28, HP.cap.D - 28, 8, 3).map(([u, w]) => [u, ct, w])), fill: "none", stroke: PL_LIP, strokeWidth: 0.7, opacity: 0.22 }),
      capScrews.map((c, k) => jsx(Screw, { id: `${id}cs${k}`, map, rig, c, r: 6, plane: "top", slot: [20, -40, 60, 0][k] }, `cs${k}`))
    ] }),
    jsx(Engraved, { rig, pose, zF: ZF + HEAD.t, uC: 0, vC: HEAD.v, width: HEAD.w - 60, size: 34, text: word, on: wordOn, ink: ENG, probe: "the pedestal's engraved plate", bare: 0.8 })
  ] });
};
/** a plaque in slot i, slid `x` world units right of home (x ≥ 0), engraved `text` */
export const HypePlaque = ({ id, rig, pose, i, x = 0, text }) => {
  const { plaque } = parts();
  const v = slotV(i), z = ZF + 5 + PLQ.t / 2;
  const at = [x, v, z];
  const map = (q) => xfApply(pose, [q[0] + at[0], q[1] + at[1], q[2] + at[2]]);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const zf = PLQ.t / 2 + 0.2;
  const brush = [];
  for (let vv = -PLQ.h / 2 + 7; vv < PLQ.h / 2 - 5; vv += 4) brush.push(P([[-PLQ.w / 2 + 6, vv, zf], [PLQ.w / 2 - 6, vv, zf]], false));
  const g0 = mapScr(map, rig, [-PLQ.w / 2, -PLQ.h / 2, zf]), g1 = mapScr(map, rig, [PLQ.w / 4, PLQ.h / 2, zf]);
  const ppose = { m: pose.m, t: xfApply(pose, at) };
  return jsxs(jsx_runtime.Fragment, { children: [
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsx("defs", { children: jsxs("linearGradient", { id: `${id}G`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
        jsx("stop", { offset: "0", stopColor: rampAt(PL_STEEL, 0.86) }),
        jsx("stop", { offset: "0.42", stopColor: rampAt(PL_STEEL, 0.64) }),
        jsx("stop", { offset: "1", stopColor: rampAt(PL_STEEL, 0.46) })
      ] }) }),
      // its shadow in the channel
      jsx("path", { d: P(rrectPts(PLQ.w, PLQ.h, 5, 3, 4, 5).map(([u, w]) => [u, w, -PLQ.t / 2 - 0.5])), fill: "#000000", opacity: 0.45 }),
      jsx(Faces, { faces: plaque, map, rig, ramp: () => PL_STEEL, spec: 0.75 }),
      jsx("path", { d: P(rrectPts(PLQ.w - 6, PLQ.h - 6, 4, 3).map(([u, w]) => [u, w, zf])), fill: `url(#${id}G)` }),
      brush.map((d, k) => jsx("path", { d, stroke: k % 2 ? "#000000" : "#ffffff", strokeOpacity: 0.05, strokeWidth: 0.9, fill: "none" }, k)),
      jsx("path", { d: P(rrectPts(PLQ.w - 22, PLQ.h - 22, 3, 2).map(([u, w]) => [u, w, zf + 0.1])), fill: "none", stroke: PL_GROOVE, strokeWidth: 1.2, opacity: 0.45 }),
      [-1, 1].map((s) => jsx(Screw, { id: `${id}sc${s}`, map, rig, c: [s * (PLQ.w / 2 - 20), 0, zf], r: 5, plane: "front", slot: s * 30 }, s))
    ] }),
    jsx(Engraved, { rig, pose: ppose, zF: zf, uC: 0, vC: 0, width: PLQ.w - 80, size: 34, text, on: 1, ink: { groove: "#14181C", lip: "#F3F5F7", paint: "#1B2026" }, probe: `the engraved plaque ${text}`, bare: 1 })
  ] });
};
// ── the cent's face: a maple twig with two leaves, a denticled rim (drawn on the coin's top cap) ─────────────────────────────────
// one maple leaf (11 points, stem at the origin, tip toward +y), unit size
const LEAF = (() => {
  const pts = [];
  const R = [0.18, 0.62, 0.42, 0.95, 0.55, 1.0, 0.55, 0.95, 0.42, 0.62, 0.18];
  const A = [-100, -72, -55, -38, -20, 0, 20, 38, 55, 72, 100];
  for (let i = 0; i < R.length; i++) {
    const a = (A[i] - 90) * Math.PI / 180;
    pts.push([R[i] * Math.cos(a) * 0.9, R[i] * Math.sin(a) + 0.08]);
    if (i < R.length - 1) {
      const b = ((A[i] + A[i + 1]) / 2 - 90) * Math.PI / 180, rr = Math.min(R[i], R[i + 1]) * 0.55;
      pts.push([rr * Math.cos(b) * 0.9, rr * Math.sin(b) + 0.08]);
    }
  }
  pts.push([0.04, 0.2], [0, 0.32], [-0.04, 0.2]);
  return pts;
})();
export const CentFace = ({ rig, map, y, r, op = 1, spin = 0 }) => {
  if (op <= 0.01) return null;
  const rot = (x, z, a) => [x * Math.cos(a) - z * Math.sin(a), x * Math.sin(a) + z * Math.cos(a)];
  const S = (x, z, lift = 0.4) => {
    const p = worldScr(rig, map([x, y - lift, z]));
    return `${f2(p[0])},${f2(p[1])}`;
  };
  const a = spin * Math.PI / 180;
  // denticles: a ring of small raised beads inside the rim
  const den = Array.from({ length: 72 }, (_, i) => {
    const t = i / 72 * 2 * Math.PI + a, rr = r * 0.9;
    const pts = [0, 1, 2, 3].map((k) => {
      const b = t + (k - 1.5) * 0.018, q = rr + (k === 0 || k === 3 ? -2.2 : 2.2) * r / 78;
      return S(q * Math.cos(b), q * Math.sin(b));
    });
    return `M${pts.join("L")}Z`;
  }).join("");
  const ring = (rr, lift) => `M${Array.from({ length: 64 }, (_, i) => S(rr * Math.cos(i / 64 * 2 * Math.PI), rr * Math.sin(i / 64 * 2 * Math.PI), lift)).join("L")}Z`;
  // the twig: a curved stem with two leaves (one up-left, one up-right)
  const leaf = (cx, cz, s, ang) => `M${LEAF.map(([lx, lz]) => {
    const [px, pz] = rot(lx * s, -lz * s, ang + a);
    const [qx, qz] = rot(cx, cz, a);
    return S(qx + px, qz + pz, 0.8);
  }).join("L")}Z`;
  const stem = `M${Array.from({ length: 9 }, (_, i) => {
    const t = i / 8, x = -r * 0.05 + r * 0.1 * t, z = r * 0.62 - r * 0.9 * t - r * 0.08 * Math.sin(Math.PI * t);
    const [qx, qz] = rot(x, z, a);
    return S(qx, qz, 0.8);
  }).join("L")}`;
  const L1 = leaf(-r * 0.2, -r * 0.18, r * 0.42, -0.55), L2 = leaf(r * 0.2, -r * 0.08, r * 0.4, 0.5);
  return jsxs("g", { opacity: op, "data-probe-skip": true, children: [
    jsx("path", { d: ring(r * 0.97, 0.3), fill: "none", stroke: rampAt(BX_COPPER, 0.92), strokeWidth: 1.6, opacity: 0.6 }),
    jsx("path", { d: ring(r * 0.84, 0.3), fill: "none", stroke: rampAt(BX_COPPER, 0.25), strokeWidth: 1, opacity: 0.5 }),
    jsx("path", { d: den, fill: rampAt(BX_COPPER, 0.78), opacity: 0.85 }),
    jsx("path", { d: stem, fill: "none", stroke: rampAt(BX_COPPER, 0.3), strokeWidth: 3.2, strokeLinecap: "round", transform: "translate(1 1.2)", opacity: 0.6 }),
    jsx("path", { d: stem, fill: "none", stroke: rampAt(BX_COPPER, 0.85), strokeWidth: 2.4, strokeLinecap: "round" }),
    [L1, L2].map((d, k) => jsxs("g", { children: [
      jsx("path", { d, fill: rampAt(BX_COPPER, 0.12), opacity: 0.7, transform: "translate(1.6 2)" }),
      jsx("path", { d, fill: rampAt(BX_COPPER, 0.9) }),
      jsx("path", { d, fill: "none", stroke: rampAt(BX_COPPER, 0.95), strokeWidth: 0.8, opacity: 0.6 })
    ] }, k))
  ] });
};
