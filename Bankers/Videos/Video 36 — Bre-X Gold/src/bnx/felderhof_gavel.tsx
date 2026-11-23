// @ts-nocheck
// ★ V36 "Bre-X Gold" — builder F. THE GAVEL of the felderhof place, built as the real thing (no person, no courtroom people):
//   • a section of a judge's BENCH: a thick top with a moulded nosing and a cove under it, a panelled front (two raised panels in
//     their frames, a top rail), a raised panel on its end, and a plinth at the floor;
//   • the SOUND BLOCK: a turned round block with a chamfered crown, a bead and an inlaid steel ring;
//   • the GAVEL: a turned head (two striking faces, chamfers, grooves, a centre band where the handle enters, two steel rings) on a
//     turned handle (collar, taper, grip, bead, knob). It lies on the bench beside its block, rises, and strikes on "not guilty".
//   Turned parts are drawn smooth (pension_turned.tsx). Bench-local coordinates: u right, v DOWN (floor 0), w toward the viewer.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { prism, rampAt } from "./solid_engine";
import { mapPath, mapScr, paintXf, rrectPts, worldScr, worldView, wound, xfApply, xfMul, xfPose, xfRotX, xfRotY, xfRotZ, xfTrans } from "./tk_rig";
import { HS_DOOR, HS_GROOVE, HS_LIP, HS_STONE, HS_TRIM, HS_WALL } from "./honest_mat_b";
import { PL_BODY, PL_STEEL } from "./counter_mat";
import { TK_FLOOR_Y } from "./tk_slab";
import { Turned } from "./pension_turned";

const f2 = (v) => v.toFixed(2);
export const BENCH = { W: 900, H: 800, Dc: 420, topT: 44, over: 28, plinthH: 64 };
const V_TOPS = -BENCH.H;                                   // the bench top's surface (bench-local v)
const ZFC = BENCH.Dc / 2;                                  // the carcass front
let memo = null;
const parts = () => {
  if (memo) return memo;
  const { W, H, Dc, topT, over, plinthH } = BENCH;
  const topD = Dc + over + 14;
  const top = wound(prism(rrectPts(W, topT, 8, 3, 0, -H + topT / 2), topD, 9, 0, 1, () => false, [0, 0, ZFC + over - topD / 2]));
  const cove = wound(prism(rrectPts(W - 34, 16, 4, 2, 0, -H + topT + 8), Dc + 18, 4, 0, 1, () => false, [0, 0, 9]));
  const body = wound(prism(rrectPts(W - 44, H - topT - plinthH - 16, 3, 2, 0, (-H + topT + 16 - plinthH) / 2), Dc, 4, 0, 1));
  const plinth = wound(prism(rrectPts(W - 26, plinthH, 4, 2, 0, -plinthH / 2), Dc + 22, 4, 0, 1));
  const plinthCap = wound(prism(rrectPts(W - 20, 10, 3, 2, 0, -plinthH - 2), Dc + 28, 3, 0, 1));
  // two raised front panels and one on the near (left) end
  const pv0 = -H + topT + 16 + 70, pv1 = -plinthH - 54, pw = (W - 44 - 3 * 46) / 2;
  const fields = [-1, 1].map((s) => s * (pw / 2 + 23));
  const raised = wound(fields.flatMap((u) => prism(rrectPts(pw - 56, pv1 - pv0 - 56, 4, 2, u, (pv0 + pv1) / 2), 7, 5, 0, 1, () => false, [0, 0, ZFC + 3.5])));
  memo = { top, cove, body, plinth, plinthCap, raised, fields, pv0, pv1, pw };
  return memo;
};
const fillOf = (r, light, f) => rampAt(r, f.cap ? 0.62 * light + 0.06 : f.bev ? Math.min(1, 0.95 * light + 0.16) : 0.8 * light + 0.04);
const Paint = ({ faces, map, rig, ramp, spec = 0.5, dim = 0 }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: paintXf(faces, map, rig, spec).map((dw, k) => {
  const c = fillOf(ramp, dw.light * (1 - dim), dw.face);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
}) });
/** the bench section, posed at its foot centre */
export const Bench = ({ id, rig, pose, sheen = 0 }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const { top, cove, body, plinth, plinthCap, raised, fields, pv0, pv1, pw } = parts();
  const { W, H, topT, plinthH } = BENCH;
  const zf = ZFC + 0.3, uL = -(W - 44) / 2 - 0.3;
  const frame = (u) => rrectPts(pw, pv1 - pv0, 5, 2, u, (pv0 + pv1) / 2).map(([a, b]) => [a, b, zf]);
  const sidePanel = rrectPts(BENCH.Dc - 90, pv1 - pv0, 5, 2, 0, (pv0 + pv1) / 2).map(([w, v]) => [uL, v, w]);
  const sidePanelIn = rrectPts(BENCH.Dc - 140, pv1 - pv0 - 50, 4, 2, 0, (pv0 + pv1) / 2).map(([w, v]) => [uL - 0.2, v, w]);
  const rail = (dv) => P([[-(W - 44) / 2 + 6, -H + topT + 16 + 34 + dv, zf], [(W - 44) / 2 - 6, -H + topT + 16 + 34 + dv, zf]], false);
  // a faint grain on the top's surface and the panels (long, slightly wavy strokes)
  const grain = Array.from({ length: 14 }, (_, k) => {
    const w0 = -BENCH.Dc / 2 + 18 + k * ((BENCH.Dc + BENCH.over) / 14);
    return P(Array.from({ length: 9 }, (_, i) => [-W / 2 + 20 + i * (W - 40) / 8, V_TOPS - 0.4, w0 + 3 * Math.sin(i * 1.3 + k)]), false);
  });
  const s0 = -W / 2 - 120 + sheen;
  const band = (a, w2) => P([[s0 + a, V_TOPS, ZFC + BENCH.over], [s0 + a + w2, V_TOPS, ZFC + BENCH.over], [s0 + a + w2 + 60, V_TOPS, -ZFC], [s0 + a + 60, V_TOPS, -ZFC]]);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: plinth, map, rig, ramp: HS_WALL, spec: 0.3, dim: 0.15 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: plinthCap, map, rig, ramp: HS_TRIM, spec: 0.5 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: body, map, rig, ramp: HS_DOOR, spec: 0.4 }),
    // the end's raised panel, the front's frames and rail
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(sidePanel), fill: "none", stroke: HS_GROOVE, strokeWidth: 2.4, opacity: 0.8 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(sidePanelIn), fill: "#ffffff", opacity: 0.035, stroke: HS_LIP, strokeOpacity: 0.3, strokeWidth: 1 }),
    fields.map((u, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(frame(u).map(([a, b, c]) => [a + 1.2, b + 1.2, c])), fill: "none", stroke: HS_LIP, strokeWidth: 1, opacity: 0.35 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(frame(u)), fill: "#000000", fillOpacity: 0.08, stroke: HS_GROOVE, strokeWidth: 2.6, opacity: 0.85 })
    ] }, `fr${k}`)),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: raised, map, rig, ramp: HS_DOOR, spec: 0.55, dim: -0.06 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: rail(0), stroke: HS_GROOVE, strokeWidth: 2.2, opacity: 0.8, fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: rail(2), stroke: HS_LIP, strokeWidth: 0.9, opacity: 0.3, fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: cove, map, rig, ramp: HS_TRIM, spec: 0.5, dim: 0.05 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: top, map, rig, ramp: HS_STONE, spec: 0.6 }),
    grain.map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: k % 2 ? "#000000" : "#ffffff", strokeOpacity: k % 2 ? 0.06 : 0.035, strokeWidth: 1.2, fill: "none" }, `gr${k}`)),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: band(0, 120), fill: "#ffffff", opacity: 0.03 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[-W / 2 + 12, V_TOPS + 1, ZFC + BENCH.over + 14], [W / 2 - 12, V_TOPS + 1, ZFC + BENCH.over + 14]], false), stroke: "#ffffff", strokeOpacity: 0.35, strokeWidth: 1.3, fill: "none", strokeLinecap: "round" })
  ] });
};
// ── the sound block ──────────────────────────────────────────────────────────────────────────────────────────────────────
export const BLOCK = { r: 120, h: 50 };
const BLOCK_PROFILE = [{ y: -50, r: 0 }, { y: -50, r: 110 }, { y: -45, r: 119 }, { y: -42, r: 120 }, { y: -40, r: 117 }, { y: -36, r: 117 }, { y: -34, r: 120 }, { y: -5, r: 120 }, { y: -2, r: 118 }, { y: 0, r: 114 }, { y: 0, r: 0 }];
const BLOCK_RING = [{ y: -40.5, r: 118.6 }, { y: -35.5, r: 118.6 }];
/** the sound block standing at world point c (its foot's centre on the bench top) */
export const SoundBlock = ({ id, rig, c, lit = 0 }) => {
  const xf = xfTrans(c);
  // its contact shadow on the bench (thrown right and back, away from the key)
  const ring = (r, dx, dz) => Array.from({ length: 28 }, (_, i) => [c[0] + dx + r * Math.cos(i / 28 * 2 * Math.PI), c[1] - 0.6, c[2] + dz + r * Math.sin(i / 28 * 2 * Math.PI)]);
  const sh = mapPath((q) => q, rig, ring(BLOCK.r + 10, 16, -20));
  const sh2 = mapPath((q) => q, rig, ring(BLOCK.r + 2, 3, -3));
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: sh, fill: "#000000", opacity: 0.22, stroke: "#000000", strokeOpacity: 0.12, strokeWidth: 14, strokeLinejoin: "round" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: sh2, fill: "#000000", opacity: 0.45 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}b`, rig, xf, profile: BLOCK_PROFILE, ramp: PL_BODY, spec: 0.85, n: 72 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}r`, rig, xf, profile: BLOCK_RING, ramp: PL_STEEL, spec: 0.95, n: 72 }),
    lit > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath((q) => q, rig, Array.from({ length: 36 }, (_, i) => [c[0] + 104 * Math.cos(i / 36 * 2 * Math.PI), c[1] - BLOCK.h - 0.4, c[2] + 104 * Math.sin(i / 36 * 2 * Math.PI)])), fill: "#ffffff", opacity: 0.07 * clamp01(lit) })
  ] });
};
// ── the gavel ────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const GV = { headL: 200, headR: 49, faceR: 36, butt: 398, knobR: 21 };
const HEAD = [{ y: -100, r: 0 }, { y: -100, r: 36 }, { y: -96, r: 42 }, { y: -90, r: 45 }, { y: -62, r: 45 }, { y: -60, r: 42 }, { y: -56, r: 42 }, { y: -54, r: 45 }, { y: -22, r: 45 }, { y: -18, r: 49 }, { y: 18, r: 49 }, { y: 22, r: 45 }, { y: 54, r: 45 }, { y: 56, r: 42 }, { y: 60, r: 42 }, { y: 62, r: 45 }, { y: 90, r: 45 }, { y: 96, r: 42 }, { y: 100, r: 36 }, { y: 100, r: 0 }];
const HEAD_RINGS = [[{ y: -82, r: 46.4 }, { y: -72, r: 46.4 }], [{ y: 72, r: 46.4 }, { y: 82, r: 46.4 }]];
const HANDLE = [{ y: 0, r: 0 }, { y: 0, r: 14 }, { y: 12, r: 14 }, { y: 14, r: 17 }, { y: 22, r: 17 }, { y: 24, r: 13.5 }, { y: 150, r: 12.5 }, { y: 200, r: 14 }, { y: 290, r: 16.5 }, { y: 300, r: 18 }, { y: 306, r: 18 }, { y: 310, r: 15 }, { y: 318, r: 15 }, { y: 322, r: 19 }, { y: 338, r: 21 }, { y: 350, r: 19 }, { y: 356, r: 14 }, { y: 358, r: 0 }];
const HANDLE_IN = GV.butt - 358;   // the handle starts this far from the head's axis (inside the centre band)
/** the gavel's transform: pivot P (the butt's centre, world), yaw ψ, swing θ (about the swing axis; negative lifts the head), roll ρ
 *  (about the handle: 90 = lying on its side). Local frame: the head's centre at the origin, its axis local y, the handle along −x. */
export const gavelXf = (p) => xfMul(xfTrans(p.P), xfMul(xfRotY(p.psi), xfMul(xfRotZ(p.theta), xfMul(xfRotX(p.rho), xfTrans([GV.butt, 0, 0])))));
export const gavelHead = (p) => xfApply(gavelXf(p), [0, 0, 0]);
/** the gavel's soft shadow on the bench top (the key from the upper left front throws it right and back) — drawn UNDER the block */
export const GavelShadow = ({ rig, pose, shadowY }) => {
  const x = gavelXf(pose);
  const head = xfApply(x, [0, 0, 0]);
  const proj = (q) => {
    const d = Math.max(0, shadowY - q[1]);
    return [q[0] + 0.5 * d, shadowY - 0.5, q[2] - 0.62 * d];
  };
  const hScr = [-100, -50, 0, 50, 100].map((y) => worldScr(rig, proj(xfApply(x, [0, y, 0]))));
  const handleScr = [0, 0.25, 0.5, 0.75, 1].map((e) => worldScr(rig, proj(xfApply(x, [-(HANDLE_IN + e * 358), 0, 0]))));
  const lift = Math.max(0, shadowY - head[1] - GV.headR);
  const op = 0.3 / (1 + lift / 140);
  const polyD = (pts) => `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}`;
  const sc = worldScr(rig, [0, shadowY, 0]), s1 = worldScr(rig, [GV.headR, shadowY, 0]);
  const wHead = 1.7 * Math.abs(s1[0] - sc[0]);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [22, 10, 0].map((grow, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { opacity: [0.35, 0.5, 0.75][k] * op, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: polyD(hScr), stroke: "#000000", strokeWidth: wHead + grow, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: polyD(handleScr), stroke: "#000000", strokeWidth: 24 + grow, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" })
  ] }, k)) });
};
export const Gavel = ({ id, rig, pose, blockC }) => {
  const x = gavelXf(pose);
  const hx = xfMul(x, xfMul(xfTrans([-HANDLE_IN, 0, 0]), xfRotZ(90)));
  const head = xfApply(x, [0, 0, 0]), mid = xfApply(x, [-GV.butt / 2, 0, 0]);
  const handleFirst = worldView(rig, mid)[2] < worldView(rig, head)[2];
  // the head's contact darkening on the block's top as it comes down onto it
  const near = blockC ? clamp01(1 - (blockC[1] - BLOCK.h - (head[1] + 100)) / 80) : 0;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    near > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath((q) => q, rig, Array.from({ length: 24 }, (_, i) => [head[0] + 10 + 46 * Math.cos(i / 24 * 2 * Math.PI), blockC[1] - BLOCK.h - 0.5, head[2] - 12 + 46 * Math.sin(i / 24 * 2 * Math.PI)])), fill: "#000000", opacity: 0.32 * near, stroke: "#000000", strokeOpacity: 0.12 * near, strokeWidth: 10 }),
    handleFirst && /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}h`, rig, xf: hx, profile: HANDLE, ramp: PL_BODY, spec: 0.9, n: 36 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}H`, rig, xf: x, profile: HEAD, ramp: PL_BODY, spec: 0.9, n: 64 }),
    HEAD_RINGS.map((pr, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}R${k}`, rig, xf: x, profile: pr, ramp: PL_STEEL, spec: 0.95, n: 64 }, k)),
    !handleFirst && /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}h`, rig, xf: hx, profile: HANDLE, ramp: PL_BODY, spec: 0.9, n: 36 })
  ] });
};
export const benchCorners = (pose) => {
  const out = [];
  for (const u of [-BENCH.W / 2, BENCH.W / 2]) for (const v of [-BENCH.H, 0]) for (const w of [-ZFC, ZFC + BENCH.over]) out.push(xfApply(pose, [u, v, w]));
  return out;
};
export const BENCH_TOP_V = V_TOPS;
export const BENCH_FRONT = ZFC + BENCH.over;
