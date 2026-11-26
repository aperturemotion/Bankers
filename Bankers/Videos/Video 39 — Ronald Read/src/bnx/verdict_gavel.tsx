// @ts-nocheck
// ★ V37 "Theranos" — builder F, REV 1 (Timur: "fully change it, to like a table with the hammer, as in the court … use [Video 36's
//   felderhof] as a reference, but do something else … with another point of view … change the design of the visuals a bit").
//   THE JUDGE'S BENCH, the SOUND BLOCK and the GAVEL — a different design from Video 36's (which was blue-steel, panelled, seen from
//   the front): here DARK WALNUT WITH BRASS, seen HIGH from the right-front three-quarter (its right end and its top both read):
//   • the bench: a thick walnut top with a moulded nosing and a brass edge strip along its front, a navy leather writing pad
//     with tooled border under the block; a frieze with a BRASS NAMEPLATE (two screws, engraved, painted in on its word); a REEDED
//     front (vertical half-round walnut slats between two square corner posts with brass caps and collars); a recessed plinth with a
//     brass kick strip; the right end a framed walnut panel with a raised field and its own brass kick strip;
//   • the sound block: turned walnut, a chamfered crown, a bead, an inlaid brass ring;
//   • the gavel: a turned walnut head (two striking faces, chamfers, grooves) with two brass bands and a brass collar where the turned
//     walnut handle (taper, grip, bead, knob) enters it. It lies on the pad beside its block, rises and strikes ON "guilty".
//   Turned parts are drawn smooth (verdict_turned.tsx). Bench-local coordinates: u right, v DOWN (floor 0), w toward the front.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { prism, rampAt } from "./solid_engine";
import { XPlane, mapPath, mapScr, paintXf, rrectPts, worldScr, worldView, wound, xfApply, xfMul, xfRotX, xfRotY, xfRotZ, xfTrans } from "./tk_rig";
import { Engraved } from "./counter_drums";
import { Turned } from "./verdict_turned";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
// ── materials: a dark, cool walnut (the house's darks, a brown lean) and brass ──────────────────────────────────────────
export const WALNUT = ["#130C0A", "#24160F", "#3D2619", "#7A5338", "#D8B898"];
export const WALNUT_D = ["#0E0907", "#1B110C", "#2E1D14", "#5E3F2B", "#B9957A"];
export const BRASS = ["#2A1E0B", "#54401A", "#93722F", "#DDBE6E", "#FFF3CC"];
const LEATHER = ["#081426", "#0D1E36", "#16304F", "#3E5E86", "#9FB6D2"];
export const BENCH = { W: 980, H: 760, D: 440, topT: 44, nose: 14, over: 34, plinth: 66 };
const V_TOPS = -BENCH.H;
const ZFC = BENCH.D / 2;
const WB = BENCH.W - 60;
const POST = 62;
const V_FR0 = V_TOPS + BENCH.topT + BENCH.nose, V_FR1 = V_FR0 + 74;          // the frieze (the nameplate's band)
const V_RD0 = V_FR1 + 10, V_RD1 = -BENCH.plinth - 8;                        // the reeded zone
const TOP_D = BENCH.D + BENCH.over + 16, TOP_Z = ZFC + BENCH.over - TOP_D / 2;
export const PAD = { u: 70, w: -8, W: 560, D: TOP_D - 150 };
export const PLATE = { w: 330, h: 50, v: (V_FR0 + V_FR1) / 2 };
let memo = null;
const pz = (poly, d, bev, w0) => wound(prism(poly, d, bev, 0, 1, () => false, [0, 0, w0]));
const parts = () => {
  if (memo) return memo;
  const { W, H, D, topT, nose, plinth } = BENCH;
  const top = pz(rrectPts(W, topT, 9, 3, 0, -H + topT / 2), TOP_D, 12, TOP_Z);
  const nosing = pz(rrectPts(W - 18, nose, 5, 2, 0, -H + topT + nose / 2), TOP_D - 22, 5, TOP_Z - 4);
  const edge = pz(rrectPts(W - 30, 8, 2, 2, 0, -H + topT * 0.5), 6, 1.5, TOP_Z + TOP_D / 2 + 2);   // the brass edge strip
  const body = pz(rrectPts(WB, H - topT - nose - plinth, 3, 2, 0, (-H + topT + nose - plinth) / 2), D, 4, 0);
  const plinthB = pz(rrectPts(WB - 30, plinth, 3, 2, 0, -plinth / 2), D - 40, 3, -10);
  const kick = pz(rrectPts(WB - 34, 18, 2, 2, 0, -9), 6, 1.5, ZFC - 20 + 3);
  const frieze = pz(rrectPts(WB - 2 * POST, V_FR1 - V_FR0, 3, 2, 0, (V_FR0 + V_FR1) / 2), 14, 3, ZFC + 7);
  const plate = pz(rrectPts(PLATE.w, PLATE.h, 7, 3, 0, PLATE.v), 5, 2, ZFC + 16.5);
  const posts = [-1, 1].flatMap((s) => [
    ...prism(rrectPts(POST, V_RD1 - V_FR0 + 8, 4, 2, s * (WB / 2 - POST / 2), (V_FR0 + V_RD1) / 2), 22, 4, 0, 1, () => false, [0, 0, ZFC + 11]),
    ...prism(rrectPts(POST + 12, 16, 3, 2, s * (WB / 2 - POST / 2), V_FR0 + 8), 30, 3, 0, 1, () => false, [0, 0, ZFC + 13]),
    ...prism(rrectPts(POST + 12, 20, 3, 2, s * (WB / 2 - POST / 2), V_RD1 - 4), 30, 3, 0, 1, () => false, [0, 0, ZFC + 13])
  ]);
  // the reeds: half-round slats, each a narrow bevelled bar (the bevel makes the round)
  const reedW = 26, n = Math.floor((WB - 2 * POST - 10) / reedW);
  const reeds = Array.from({ length: n }, (_, i) => prism(rrectPts(reedW - 3, V_RD1 - V_RD0, 3, 2, -(n - 1) * reedW / 2 + i * reedW, (V_RD0 + V_RD1) / 2), 12, 6, 0, 1, () => false, [0, 0, ZFC + 6]));
  // the right end: a frame and a raised field (built in its own plane, turned onto the end face)
  const endFrame = prism(rrectPts(D - 60, V_RD1 - V_FR0 + 10, 4, 2, 0, (V_FR0 + V_RD1) / 2), 6, 2, 0, 1, () => false, [0, 0, 3]);
  const endField = prism(rrectPts(D - 130, V_RD1 - V_FR0 - 70, 4, 2, 0, (V_FR0 + V_RD1) / 2), 10, 12, 0, 1, () => false, [0, 0, 5]);
  memo = { top, nosing, edge, body, plinthB, kick, frieze, plate, posts: wound(posts), reeds: reeds.map(wound), endFrame: wound(endFrame), endField: wound(endField) };
  return memo;
};
const fillOf = (r, light, f) => rampAt(r, f.cap ? 0.62 * light + 0.06 : f.bev ? Math.min(1, 0.95 * light + 0.16) : 0.8 * light + 0.04);
const Paint = ({ faces, map, rig, ramp, spec = 0.5, dim = 0 }) => jsx(jsx_runtime.Fragment, { children: paintXf(faces, map, rig, spec).map((dw, k) => {
  const c = fillOf(ramp, dw.light * (1 - dim), dw.face);
  return jsx("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
}) });
const ring = (c, r, n, plane) => Array.from({ length: n }, (_, i) => {
  const a = i / n * 2 * Math.PI;
  return plane === "front" ? [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), c[2]] : [c[0] + r * Math.cos(a), c[1], c[2] + r * Math.sin(a)];
});
/** the bench at `pose`; plate: { text, on } (the nameplate's engraving) */
export const Bench = ({ id, rig, pose, plate, sheen = 0 }) => {
  const map = (q) => xfApply(pose, q);
  const mapEnd = (q) => xfApply(pose, [WB / 2 + q[2], q[1], -q[0]]);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const m = parts();
  const { W, H } = BENCH;
  const yT = V_TOPS - 0.4;
  const pad = (inset) => rrectPts(PAD.W - 2 * inset, PAD.D - 2 * inset, Math.max(2, 8 - inset / 2), 3, PAD.u, PAD.w).map(([u, w]) => [u, yT - 0.1 * inset, w]);
  const p0 = mapScr(map, rig, [PAD.u - PAD.W / 2, V_TOPS, PAD.w - PAD.D / 2]), p1 = mapScr(map, rig, [PAD.u + PAD.W / 2, V_TOPS, PAD.w + PAD.D / 2]);
  // the walnut's figure on the top: long wavy grain lines
  const grain = Array.from({ length: 16 }, (_, k) => {
    const w0 = TOP_Z - TOP_D / 2 + 14 + k * (TOP_D - 28) / 15;
    return P(Array.from({ length: 13 }, (_, i) => [-W / 2 + 16 + i * (W - 32) / 12, yT, w0 + 3 * Math.sin(i * 0.9 + k * 1.7) + 2 * Math.sin(i * 2.3 + k)]), false);
  });
  const s0 = -W / 2 - 200 + (W + 400) * clamp01(sheen);
  const band = P([[s0, yT - 0.2, TOP_Z + TOP_D / 2 - 4], [s0 + 110, yT - 0.2, TOP_Z + TOP_D / 2 - 4], [s0 + 190, yT - 0.2, TOP_Z - TOP_D / 2 + 4], [s0 + 80, yT - 0.2, TOP_Z - TOP_D / 2 + 4]]);
  const topClip = P([[-W / 2 + 6, yT, TOP_Z + TOP_D / 2 - 6], [W / 2 - 6, yT, TOP_Z + TOP_D / 2 - 6], [W / 2 - 6, yT, TOP_Z - TOP_D / 2 + 6], [-W / 2 + 6, yT, TOP_Z - TOP_D / 2 + 6]]);
  const plateScrews = [-1, 1].map((s) => [s * (PLATE.w / 2 - 18), PLATE.v, ZFC + 19.2]);
  const capScrews = [-1, 1].map((s) => [s * (WB / 2 - POST / 2), V_FR0 + 8, ZFC + 28.4]);
  return jsxs("div", { "data-probe-object": "the judge's bench: walnut and brass, its nameplate, its leather pad", style: { position: "absolute", inset: 0 }, children: [
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsxs("defs", { children: [
        jsxs("linearGradient", { id: `${id}Lt`, gradientUnits: "userSpaceOnUse", x1: f2(p0[0]), y1: f2(p0[1]), x2: f2(p1[0]), y2: f2(p1[1]), children: [
          jsx("stop", { offset: "0", stopColor: rampAt(LEATHER, 0.55) }),
          jsx("stop", { offset: "0.5", stopColor: rampAt(LEATHER, 0.38) }),
          jsx("stop", { offset: "1", stopColor: rampAt(LEATHER, 0.2) })
        ] }),
        jsx("clipPath", { id: `${id}Tc`, children: jsx("path", { d: topClip }) })
      ] }),
      jsx(Paint, { faces: m.plinthB, map, rig, ramp: WALNUT_D, spec: 0.3, dim: 0.1 }),
      jsx(Paint, { faces: m.kick, map, rig, ramp: BRASS, spec: 0.8 }),
      jsx(Paint, { faces: m.body, map, rig, ramp: WALNUT_D, spec: 0.35 }),
      // the right end: framed panel, raised field, brass kick strip
      jsx(Paint, { faces: m.endFrame, map: mapEnd, rig, ramp: WALNUT, spec: 0.45, dim: 0.05 }),
      jsx(Paint, { faces: m.endField, map: mapEnd, rig, ramp: WALNUT, spec: 0.55 }),
      jsx("path", { d: mapPath(mapEnd, rig, [[-BENCH.D / 2 + 30, -14, 1], [BENCH.D / 2 - 40, -14, 1], [BENCH.D / 2 - 40, -2, 1], [-BENCH.D / 2 + 30, -2, 1]]), fill: rampAt(BRASS, 0.6) }),
      // the reeded front: the recess behind it, then each reed
      jsx("path", { d: P([[-WB / 2 + POST, V_RD0, ZFC + 0.3], [WB / 2 - POST, V_RD0, ZFC + 0.3], [WB / 2 - POST, V_RD1, ZFC + 0.3], [-WB / 2 + POST, V_RD1, ZFC + 0.3]]), fill: "#000000", opacity: 0.45 }),
      m.reeds.map((faces, k) => jsx(Paint, { faces, map, rig, ramp: WALNUT, spec: 0.55, dim: 0.04 * (k % 3) }, `rd${k}`)),
      jsx(Paint, { faces: m.posts, map, rig, ramp: WALNUT, spec: 0.5 }),
      // the posts' brass collars (a band on each base and capital)
      [-1, 1].flatMap((s) => [V_FR0 + 1, V_RD1 + 5].map((v, k) => jsx("path", { d: P([[s * (WB / 2 - POST / 2) - POST / 2 - 6, v, ZFC + 28.4], [s * (WB / 2 - POST / 2) + POST / 2 + 6, v, ZFC + 28.4], [s * (WB / 2 - POST / 2) + POST / 2 + 6, v + 4, ZFC + 28.4], [s * (WB / 2 - POST / 2) - POST / 2 - 6, v + 4, ZFC + 28.4]]), fill: rampAt(BRASS, 0.75) }, `cl${s}${k}`))),
      capScrews.map((c, k) => jsx("path", { d: P(ring(c, 4, 12, "front")), fill: rampAt(BRASS, 0.85), stroke: "#000000", strokeOpacity: 0.4, strokeWidth: 0.8 }, `cs${k}`)),
      jsx(Paint, { faces: m.frieze, map, rig, ramp: WALNUT, spec: 0.5 }),
      jsx(Paint, { faces: m.plate, map, rig, ramp: BRASS, spec: 0.9 }),
      plateScrews.map((c, k) => jsx("path", { d: P(ring(c, 4.5, 14, "front")), fill: rampAt(BRASS, 0.5), stroke: "#000000", strokeOpacity: 0.5, strokeWidth: 0.8 }, `ps${k}`)),
      // the top: nosing, slab, its brass edge strip, the walnut grain, the leather pad, a moving sheen
      jsx(Paint, { faces: m.nosing, map, rig, ramp: WALNUT, spec: 0.6 }),
      jsx(Paint, { faces: m.top, map, rig, ramp: WALNUT, spec: 0.7 }),
      jsx(Paint, { faces: m.edge, map, rig, ramp: BRASS, spec: 0.95 }),
      jsx("g", { clipPath: `url(#${id}Tc)`, children: grain.map((d, k) => jsx("path", { d, stroke: k % 2 ? "#000000" : "#E8C9A8", strokeOpacity: k % 2 ? 0.16 : 0.07, strokeWidth: 1.3, fill: "none" }, `gr${k}`)) }),
      jsx("path", { d: P(pad(-3)), fill: "#000000", opacity: 0.35 }),
      jsx("path", { d: P(pad(0)), fill: `url(#${id}Lt)` }),
      jsx("path", { d: P(pad(10)), fill: "none", stroke: rampAt(BRASS, 0.7), strokeOpacity: 0.55, strokeWidth: 1.3 }),
      jsx("path", { d: P(pad(17)), fill: "none", stroke: "#8FA9C8", strokeOpacity: 0.35, strokeWidth: 1, strokeDasharray: "5 4" }),
      jsx("path", { d: band, fill: "#FFFFFF", opacity: 0.05, clipPath: `url(#${id}Tc)` })
    ] }),
    plate && jsx(Engraved, { rig, pose, zF: ZFC + 19, uC: 0, vC: PLATE.v, width: PLATE.w - 60, size: 30, text: plate.text, on: plate.on, ink: { groove: "#2A1D08", lip: "#FFF3CC", paint: "#1B1206" }, probe: "the bench's brass nameplate", bare: 0.25 })
  ] });
};
// ── the sound block ──────────────────────────────────────────────────────────────────────────────────────────────────────
export const BLOCK = { r: 112, h: 48 };
const BLOCK_PROFILE = [{ y: -48, r: 0 }, { y: -48, r: 100 }, { y: -44, r: 110 }, { y: -40, r: 112 }, { y: -37, r: 108 }, { y: -33, r: 108 }, { y: -31, r: 112 }, { y: -6, r: 112 }, { y: -3, r: 110 }, { y: 0, r: 106 }, { y: 0, r: 0 }];
const BLOCK_RING = [{ y: -37.5, r: 109.6 }, { y: -32.5, r: 109.6 }];
export const SoundBlock = ({ id, rig, c, lit = 0 }) => {
  const xf = xfTrans(c);
  const rr = (r, dx, dz, n = 28) => Array.from({ length: n }, (_, i) => [c[0] + dx + r * Math.cos(i / n * 2 * Math.PI), c[1] - 0.6, c[2] + dz + r * Math.sin(i / n * 2 * Math.PI)]);
  return jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    jsx("path", { d: mapPath((q) => q, rig, rr(BLOCK.r + 10, 16, -20)), fill: "#000000", opacity: 0.25, stroke: "#000000", strokeOpacity: 0.12, strokeWidth: 14, strokeLinejoin: "round" }),
    jsx("path", { d: mapPath((q) => q, rig, rr(BLOCK.r + 2, 3, -3)), fill: "#000000", opacity: 0.45 }),
    jsx(Turned, { id: `${id}b`, rig, xf, profile: BLOCK_PROFILE, ramp: WALNUT, spec: 0.85, n: 72 }),
    jsx(Turned, { id: `${id}r`, rig, xf, profile: BLOCK_RING, ramp: BRASS, spec: 0.95, n: 72 }),
    // the crown's growth rings (turned walnut), and the dent of use where the gavel strikes
    [86, 62, 38].map((r, k) => jsx("path", { d: mapPath((q) => q, rig, Array.from({ length: 40 }, (_, i) => [c[0] + r * Math.cos(i / 40 * 2 * Math.PI), c[1] - BLOCK.h - 0.3, c[2] + r * Math.sin(i / 40 * 2 * Math.PI)])), fill: "none", stroke: "#000000", strokeOpacity: 0.16, strokeWidth: 1 }, `gr${k}`)),
    lit > 3e-3 && jsx("path", { d: mapPath((q) => q, rig, Array.from({ length: 36 }, (_, i) => [c[0] + 96 * Math.cos(i / 36 * 2 * Math.PI), c[1] - BLOCK.h - 0.4, c[2] + 96 * Math.sin(i / 36 * 2 * Math.PI)])), fill: "#FFE9B8", opacity: 0.1 * clamp01(lit) })
  ] });
};
// ── the gavel ────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const GV = { headL: 196, headR: 47, butt: 392, knobR: 20 };
const HEAD = [{ y: -98, r: 0 }, { y: -98, r: 34 }, { y: -94, r: 40 }, { y: -88, r: 43 }, { y: -58, r: 43 }, { y: -54, r: 40 }, { y: -50, r: 43 }, { y: -20, r: 43 }, { y: -16, r: 47 }, { y: 16, r: 47 }, { y: 20, r: 43 }, { y: 50, r: 43 }, { y: 54, r: 40 }, { y: 58, r: 43 }, { y: 88, r: 43 }, { y: 94, r: 40 }, { y: 98, r: 34 }, { y: 98, r: 0 }];
const HEAD_BANDS = [[{ y: -80, r: 44.2 }, { y: -68, r: 44.2 }], [{ y: 68, r: 44.2 }, { y: 80, r: 44.2 }], [{ y: -12, r: 48.2 }, { y: 12, r: 48.2 }]];
const HANDLE = [{ y: 0, r: 0 }, { y: 0, r: 15 }, { y: 16, r: 15 }, { y: 18, r: 12.5 }, { y: 140, r: 11.5 }, { y: 200, r: 13.5 }, { y: 286, r: 16 }, { y: 296, r: 17.5 }, { y: 304, r: 17.5 }, { y: 308, r: 14 }, { y: 318, r: 14 }, { y: 322, r: 18 }, { y: 336, r: 20 }, { y: 348, r: 18 }, { y: 354, r: 13 }, { y: 356, r: 0 }];
const HANDLE_COLLAR = [{ y: 0, r: 0 }, { y: 0, r: 17 }, { y: 16, r: 17 }, { y: 16, r: 0 }];
const HANDLE_IN = GV.butt - 356;
export const gavelXf = (p) => xfMul(xfTrans(p.P), xfMul(xfRotY(p.psi), xfMul(xfRotZ(p.theta), xfMul(xfRotX(p.rho), xfTrans([GV.butt, 0, 0])))));
export const GavelShadow = ({ rig, pose, shadowY }) => {
  const x = gavelXf(pose);
  const head = xfApply(x, [0, 0, 0]);
  const proj = (q) => {
    const d = Math.max(0, shadowY - q[1]);
    return [q[0] + 0.5 * d, shadowY - 0.5, q[2] - 0.62 * d];
  };
  const hScr = [-98, -49, 0, 49, 98].map((y) => worldScr(rig, proj(xfApply(x, [0, y, 0]))));
  const handleScr = [0, 0.25, 0.5, 0.75, 1].map((e) => worldScr(rig, proj(xfApply(x, [-(HANDLE_IN + e * 356), 0, 0]))));
  const lift = Math.max(0, shadowY - head[1] - GV.headR);
  const op = 0.3 / (1 + lift / 140);
  const polyD = (pts) => `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}`;
  const sc = worldScr(rig, [0, shadowY, 0]), s1 = worldScr(rig, [GV.headR, shadowY, 0]);
  const wHead = 1.7 * Math.abs(s1[0] - sc[0]);
  return jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [22, 10, 0].map((grow, k) => jsxs("g", { opacity: [0.35, 0.5, 0.75][k] * op, children: [
    jsx("path", { d: polyD(hScr), stroke: "#000000", strokeWidth: wHead + grow, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" }),
    jsx("path", { d: polyD(handleScr), stroke: "#000000", strokeWidth: 24 + grow, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" })
  ] }, k)) });
};
export const Gavel = ({ id, rig, pose, blockC }) => {
  const x = gavelXf(pose);
  const hx = xfMul(x, xfMul(xfTrans([-HANDLE_IN, 0, 0]), xfRotZ(90)));
  const cx = xfMul(x, xfMul(xfTrans([-GV.headR - 2, 0, 0]), xfRotZ(90)));
  const head = xfApply(x, [0, 0, 0]), mid = xfApply(x, [-GV.butt / 2, 0, 0]);
  const handleFirst = worldView(rig, mid)[2] < worldView(rig, head)[2];
  const near = blockC ? clamp01(1 - (blockC[1] - BLOCK.h - (head[1] + 98)) / 80) : 0;
  const handle = [
    jsx(Turned, { id: `${id}h`, rig, xf: hx, profile: HANDLE, ramp: WALNUT, spec: 0.9, n: 36 }, "h"),
    jsx(Turned, { id: `${id}c`, rig, xf: cx, profile: HANDLE_COLLAR, ramp: BRASS, spec: 0.95, n: 28 }, "c")
  ];
  return jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    near > 3e-3 && jsx("path", { d: mapPath((q) => q, rig, Array.from({ length: 24 }, (_, i) => [head[0] + 10 + 44 * Math.cos(i / 24 * 2 * Math.PI), blockC[1] - BLOCK.h - 0.5, head[2] - 12 + 44 * Math.sin(i / 24 * 2 * Math.PI)])), fill: "#000000", opacity: 0.32 * near, stroke: "#000000", strokeOpacity: 0.12 * near, strokeWidth: 10 }),
    handleFirst && handle,
    jsx(Turned, { id: `${id}H`, rig, xf: x, profile: HEAD, ramp: WALNUT, spec: 0.9, n: 64 }),
    HEAD_BANDS.map((pr, k) => jsx(Turned, { id: `${id}R${k}`, rig, xf: x, profile: pr, ramp: BRASS, spec: 0.95, n: 64 }, k)),
    !handleFirst && handle
  ] });
};
export const benchCorners = (pose) => {
  const out = [];
  for (const u of [-BENCH.W / 2, BENCH.W / 2]) for (const v of [-BENCH.H, 0]) for (const w of [-ZFC, ZFC + BENCH.over]) out.push(xfApply(pose, [u, v, w]));
  return out;
};
export const BENCH_TOP_V = V_TOPS;
