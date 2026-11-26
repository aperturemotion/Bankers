// @ts-nocheck
// ★ V37 "Theranos" — builder M. THE NAMEPLATE (shared by backers and whistle): a desk nameplate as boardrooms set them — a satin
//   graphite base bar with a bevelled top, a cut slot and two steel end caps, holding a brushed BRASS plate (bevelled edges, an
//   engraved border line, two countersunk screws) leaning back 16°; the name is ENGRAVED in the brass from the first frame (the
//   cut letters read faintly) and its black paint fills on the word. When the plate is LIT a light crosses the brass.
//   Plate-local frame: origin at the base's foot centre on the table, x along the bar, y DOWN (up negative), z toward its reader.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { label } from "./kit";
import { rampAt } from "./solid_engine";
import { XPlane, mapPath, mapScr, rrectPts, worldScr, xfApply, xfMul, xfRotX, xfTrans } from "./tk_rig";
import { BR_BRASS, BR_BRASS_GROOVE, BR_BRASS_LIP, BR_PED, BR_STEEL, Painted, box, painted, ring } from "./backers_kit";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
export const NP = { L: 256, H: 24, D: 54, cap: 12, pw: 240, ph: 76, pt: 5, sink: 12, tilt: 12 };
// the plate's own frame (its front face at z = pt/2, its foot sunk `sink` into the slot), leaning back about the slot
export const NP_PLATE_XF = xfMul(xfTrans([0, -NP.H + NP.sink, -4]), xfRotX(NP.tilt));
const PV = -NP.ph / 2;                      // the plate's centre (plate-local y)
const parts = () => {
  const base = [
    ...box(0, -NP.H / 2, 0, NP.L - 2 * NP.cap, NP.H, NP.D, 4, 0, 1, 4),
    ...[-1, 1].flatMap((s) => box(s * (NP.L / 2 - NP.cap / 2), -NP.H / 2 - 1, 0, NP.cap, NP.H + 2, NP.D + 4, 3, 1, 1, 4))
  ];
  const plate = box(0, PV, 0, NP.pw, NP.ph, NP.pt, 1.6, 0, 1, 5);
  return { base, plate };
};
const PARTS = parts();
const memo = new Map();
const paintedOf = (key, faces, map, rig, spec) => {
  const k = `${key}|${rig.cx}|${rig.cy}|${rig.yaw}|${rig.pitch}|${rig.persp}`;
  if (memo.size > 200) memo.clear();
  if (!memo.has(k)) memo.set(k, painted(faces, map, rig, spec));
  return memo.get(k);
};
/** world point on the plate's front face (plate coords u, v) */
export const plateAt = (pose, u, v) => xfApply(xfMul(pose, NP_PLATE_XF), [u, v, NP.pt / 2]);
export const plateCorners = (pose) => {
  const out = [];
  for (const x of [-NP.L / 2, NP.L / 2]) for (const z of [-NP.D / 2, NP.D / 2]) out.push(xfApply(pose, [x, 0, z]), xfApply(pose, [x, -NP.H, z]));
  out.push(plateAt(pose, -NP.pw / 2, -NP.ph), plateAt(pose, NP.pw / 2, -NP.ph));
  return out;
};
/** the nameplate. pose: world xf of its foot; text; on = the engraving's paint 0…1; lit = the light on it 0…1; key = a memo key */
export const NamePlate = ({ id, rig, pose, text, on = 1, lit = 1, size = 46, probe }) => {
  const map = (q) => xfApply(pose, q);
  const pxf = xfMul(pose, NP_PLATE_XF);
  const pmap = (q) => xfApply(pxf, q);
  const dim = 0.5 * (1 - lit);
  const base = paintedOf(`${id}b`, PARTS.base, map, rig, 0.5);
  const plate = paintedOf(`${id}p`, PARTS.plate, pmap, rig, 0.85);
  const ZF = NP.pt / 2 + 0.2;
  const P = (pts, close = true) => mapPath(pmap, rig, pts.map(([a, b]) => [a, b, ZF]), close);
  // the brushed grain, the engraved border, the screws
  const grain = Array.from({ length: 18 }, (_, k) => P([[-NP.pw / 2 + 6, -NP.ph + 5 + k * 3.8], [NP.pw / 2 - 6, -NP.ph + 5.3 + k * 3.8]], false));
  const border = rrectPts(NP.pw - 18, NP.ph - 16, 4, 3, 0, PV);
  const screws = [-1, 1].map((s) => [s * (NP.pw / 2 - 16), PV]);
  // the light crossing the brass as it is lit: a soft diagonal band clipped to the face
  const sweep = -NP.pw / 2 - 80 + (NP.pw + 160) * clamp01(lit);
  const band = P([[sweep - 30, -NP.ph], [sweep + 16, -NP.ph], [sweep - 14, 0], [sweep - 60, 0]]);
  const g0 = mapScr(pmap, rig, [0, -NP.ph, ZF]), g1 = mapScr(pmap, rig, [0, 0, ZF]);
  const face = P(rrectPts(NP.pw - 4, NP.ph - 4, 4, 3, 0, PV));
  const W = NP.pw - 30, Hh = size + 8;
  const run = (col, op, dy) => jsx("div", { style: { position: "absolute", left: 0, top: dy, width: W, height: Hh, display: "flex", alignItems: "center", justifyContent: "center", opacity: op }, children: jsx("div", { style: { ...label(size, col), letterSpacing: 2, lineHeight: 1 }, children: text }) });
  const sheenOp = 0.5 * Math.sin(Math.PI * clamp01(lit));
  return jsxs("div", { style: { position: "absolute", inset: 0 }, children: [
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsxs("defs", { children: [
        jsxs("linearGradient", { id: `${id}Br`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
          jsx("stop", { offset: "0", stopColor: "#ffffff", stopOpacity: 0.16 }),
          jsx("stop", { offset: "0.5", stopColor: "#ffffff", stopOpacity: 0 }),
          jsx("stop", { offset: "1", stopColor: "#000000", stopOpacity: 0.18 })
        ] }),
        jsx("clipPath", { id: `${id}Fc`, children: jsx("path", { d: face }) })
      ] }),
      jsx(Painted, { dws: base, mats: [BR_PED, BR_STEEL], dim: 0.15 + 0.35 * (1 - lit) }),
      // the slot in the bar's top
      jsx("path", { d: mapPath(map, rig, [[-NP.pw / 2 - 4, -NP.H - 0.3, -10], [NP.pw / 2 + 4, -NP.H - 0.3, -10], [NP.pw / 2 + 4, -NP.H - 0.3, 2], [-NP.pw / 2 - 4, -NP.H - 0.3, 2]]), fill: "#000000", opacity: 0.6 }),
      jsx(Painted, { dws: plate, mats: [BR_BRASS], dim }),
      jsx("path", { d: face, fill: `url(#${id}Br)` }),
      grain.map((d, k) => jsx("path", { d, stroke: k % 2 ? "#000000" : "#ffffff", strokeOpacity: k % 2 ? 0.08 : 0.06, strokeWidth: 0.8, fill: "none" }, `g${k}`)),
      jsx("path", { d: P(border.map(([a, b]) => [a + 0.8, b + 0.8])), fill: "none", stroke: BR_BRASS_LIP, strokeOpacity: 0.35 * (1 - dim), strokeWidth: 0.9 }),
      jsx("path", { d: P(border), fill: "none", stroke: BR_BRASS_GROOVE, strokeOpacity: 0.7, strokeWidth: 1.3 }),
      screws.map(([u, v], k) => jsxs("g", { children: [
        jsx("path", { d: P(ring(u, v, 4.6)), fill: "#000000", opacity: 0.45 }),
        jsx("path", { d: P(ring(u - 0.3, v - 0.3, 3.4)), fill: rampAt(BR_BRASS, 0.75 - 0.4 * dim) }),
        jsx("path", { d: P([[u - 2.6, v + 1.2], [u + 2.6, v - 1.2]], false), stroke: BR_BRASS_GROOVE, strokeWidth: 1, opacity: 0.7, fill: "none" })
      ] }, `s${k}`)),
      sheenOp > 2e-3 && jsx("g", { clipPath: `url(#${id}Fc)`, children: jsx("path", { d: band, fill: "#FFF6DA", opacity: sheenOp, style: { mixBlendMode: "screen" } }) }),
      // the bright top arris of the plate (the key light from the upper left)
      jsx("path", { d: P([[-NP.pw / 2 + 5, -NP.ph + 1.2], [NP.pw / 2 - 5, -NP.ph + 1.2]], false), stroke: "#FFF4D6", strokeOpacity: 0.55 * (1 - dim), strokeWidth: 1.3, fill: "none", strokeLinecap: "round" })
    ] }),
    // the engraving: the cut letters (groove + lit lip) from the first frame, the black paint filling on the word
    jsx(XPlane, { rig, x: pxf, u: -W / 2, v: PV - Hh / 2, w: ZF + 0.2, width: W, height: Hh, probe: probe ?? "the nameplate's engraving", children: jsxs("div", { style: { position: "relative", width: W, height: Hh }, children: [run(BR_BRASS_LIP, 0.45 * (1 - dim), 1.1), run(BR_BRASS_GROOVE, 0.5, 0)] }) }),
    jsx(XPlane, { rig, x: pxf, u: -W / 2, v: PV - Hh / 2, w: ZF + 0.4, width: W, height: Hh, op: clamp01(on), probe: probe ?? "the nameplate's engraving", children: run(mixHex("#0D0A05", "#1A140A", dim), 1, 0) })
  ] });
};
/** REV1: the plate's REFLECTION in the lacquered table top (the brass face mirrored about the top, fading away from the plate),
 *  drawn before the plate; `topY` = the table top's world y; lit 0…1 */
export const PlateReflection = ({ id, rig, pose, topY, lit = 1 }) => {
  const mir = (q) => [q[0], 2 * topY - q[1], q[2]];
  const pt = (u, v) => worldScr(rig, mir(plateAt(pose, u, v)));
  const a = pt(-NP.pw / 2 + 4, -2), b = pt(NP.pw / 2 - 4, -2), c = pt(NP.pw / 2 - 4, -NP.ph * 0.85), d = pt(-NP.pw / 2 + 4, -NP.ph * 0.85);
  const m0 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], m1 = [(c[0] + d[0]) / 2, (c[1] + d[1]) / 2];
  const P = [a, b, c, d].map((q) => `${q[0].toFixed(2)},${q[1].toFixed(2)}`).join("L");
  return jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    jsx("defs", { children: jsxs("linearGradient", { id: `${id}Rf`, gradientUnits: "userSpaceOnUse", x1: m0[0].toFixed(2), y1: m0[1].toFixed(2), x2: m1[0].toFixed(2), y2: m1[1].toFixed(2), children: [
      jsx("stop", { offset: "0", stopColor: rampAt(BR_BRASS, 0.7), stopOpacity: 0.34 * (0.4 + 0.6 * lit) }),
      jsx("stop", { offset: "1", stopColor: rampAt(BR_BRASS, 0.5), stopOpacity: 0 })
    ] }) }),
    jsx("path", { d: `M${P}Z`, fill: `url(#${id}Rf)`, style: { mixBlendMode: "screen" } })
  ] });
};
