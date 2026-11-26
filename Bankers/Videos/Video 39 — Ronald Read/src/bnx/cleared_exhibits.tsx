// @ts-nocheck
// ★ V37 "Theranos" — builder F, place `cleared`, REV 1 (Timur: "make some visual that actually connects to the voiceover and to
//   investors being guilty and patients being not guilty"). THE EXHIBIT TABLE: the court's walnut evidence table (the same walnut and
//   brass as the verdict's bench) with TWO EXHIBIT TRAYS, each holding what its count was about:
//   • INVESTORS — a SHARE CERTIFICATE lying in its brushed-steel tray: cream security paper with a double engraved border, corner
//     rosettes, a guilloche band, a blank engraved title panel, fine-print rows, a seal with rays, signature rules — and the court's
//     red stamp across it, GUILTY (verdictGuilty). Its exhibit card in front reads INVESTORS: GUILTY (clearedInvestors).
//   • PATIENTS — a THERANOS NANOTAINER (builder H's th_tube: the clear sample tube, blood in its well, THERANOS on its label)
//     standing in a steel tube stand, a printed test-result slip beside it. Its exhibit card lies face-down in front; on "cleared"
//     it flips up on its steel clip to read PATIENTS: NOT GUILTY (clearedPatients) as a lamp lights that tray.
//   Every part is a solid in the one rig (one key light, upper left); the cards and the stamp are print planes ON their objects.
//   Table-local frame: x right, y DOWN (floor 0), z toward the lens; the table top at TABLE.H above the floor.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { prism, rampAt } from "./solid_engine";
import { XPlane, mapPath, paintXf, rrectPts, worldScr, wound, xfApply, xfMul, xfRotX, xfRotY, xfRotZ, xfTrans } from "./tk_rig";
import { PL_STEEL } from "./counter_mat";
import { theme } from "./theme";
import { figure, label } from "./kit";
import { Turned } from "./verdict_turned";
import { BRASS, WALNUT, WALNUT_D } from "./verdict_gavel";
import { ThTube } from "./th_tube";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const D = (pts, close = true) => `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}${close ? "Z" : ""}`;
export const TABLE = { W: 1120, D: 600, H: 500, top: 40, apron: 70 };
const VT = -TABLE.H;                                  // the top surface (local y)
export const TRAY = { W: 400, D: 300, rim: 22, wall: 9, u: 240, w: -70 };
export const CARD = { W: 350, H: 112, w: 112 };
const PAPER = ["#5E5A50", "#9A9486", "#CFC8B7", "#EAE4D6", "#FBF8F0"];
let memo = null;
const pz = (poly, d, bev, w0) => wound(prism(poly, d, bev, 0, 1, () => false, [0, 0, w0]));
// a horizontal slab: centre (u, w), size (W × D), from y0 (its top) down by h
const slab = (u, w, W, Dp, y0, h, bev = 3) => pz(rrectPts(W, h, Math.min(6, h / 2), 2, u, y0 + h / 2), Dp, bev, w);
const parts = () => {
  if (memo) return memo;
  const top = slab(0, 0, TABLE.W, TABLE.D, VT, TABLE.top, 10);
  const edge = pz(rrectPts(TABLE.W - 30, 7, 2, 2, 0, VT + TABLE.top * 0.5), 5, 1.5, TABLE.D / 2 + 1.5);
  const apron = slab(0, -10, TABLE.W - 90, TABLE.D - 90, VT + TABLE.top, TABLE.apron, 4);
  const trays = [-1, 1].map((s) => {
    const u = s * TRAY.u, y0 = VT - TRAY.rim;
    return wound([
      ...prism(rrectPts(TRAY.W, 6, 2, 2, u, VT - 3), TRAY.D, 2, 0, 1, () => false, [0, 0, TRAY.w]),
      ...prism(rrectPts(TRAY.W, TRAY.rim, 3, 2, u, VT - TRAY.rim / 2), TRAY.wall, 3, 0, 1, () => false, [0, 0, TRAY.w + TRAY.D / 2 - TRAY.wall / 2]),
      ...prism(rrectPts(TRAY.W, TRAY.rim, 3, 2, u, VT - TRAY.rim / 2), TRAY.wall, 3, 0, 1, () => false, [0, 0, TRAY.w - TRAY.D / 2 + TRAY.wall / 2]),
      ...[-1, 1].flatMap((e) => prism(rrectPts(TRAY.wall, TRAY.rim, 3, 2, u + e * (TRAY.W / 2 - TRAY.wall / 2), VT - TRAY.rim / 2), TRAY.D - 2 * TRAY.wall, 2, 0, 1, () => false, [0, 0, TRAY.w]))
    ]);
  });
  // the patients' tube stand (a steel block) and the cards' steel clips
  const stand = slab(TRAY.u - 60, TRAY.w - 20, 86, 86, VT - 6 - 34, 34, 4);
  const clips = [-1, 1].map((s) => slab(s * TRAY.u, CARD.w, CARD.W + 30, 26, VT - 14, 14, 3));
  memo = { top, edge, apron, trays, stand, clips };
  return memo;
};
const fillOf = (r, light, f) => rampAt(r, f.cap ? 0.62 * light + 0.06 : f.bev ? Math.min(1, 0.95 * light + 0.16) : 0.8 * light + 0.04);
const Paint = ({ faces, map, rig, ramp, spec = 0.5, dim = 0 }) => jsx(jsx_runtime.Fragment, { children: paintXf(faces, map, rig, spec).map((dw, k) => {
  const c = fillOf(ramp, dw.light * (1 - dim), dw.face);
  return jsx("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
}) });
const LEG = (() => {
  const L = TABLE.H - TABLE.top - TABLE.apron;
  return [{ y: 0, r: 0 }, { y: 0, r: 30 }, { y: 14, r: 30 }, { y: 18, r: 24 }, { y: 30, r: 26 }, { y: 36, r: 21 }, { y: L * 0.75, r: 16 }, { y: L - 30, r: 18 }, { y: L - 24, r: 22 }, { y: L - 14, r: 22 }, { y: L - 10, r: 18 }, { y: L, r: 17 }, { y: L, r: 0 }];
})();
/** the share certificate, flat in the investors' tray (plane at y = yP), with the court's GUILTY stamp */
const Certificate = ({ id, rig, map, pose, stamp }) => {
  const u0 = -TRAY.u, w0 = TRAY.w, CW = 330, CD = 236, yP = VT - 7.5;
  const P = (pts, close = true) => mapPath(map, rig, pts.map(([u, w]) => [u0 + u, yP, w0 + w]), close);
  const rect = (W, Dp, cu = 0, cw = 0) => [[cu - W / 2, cw - Dp / 2], [cu + W / 2, cw - Dp / 2], [cu + W / 2, cw + Dp / 2], [cu - W / 2, cw + Dp / 2]];
  const circ = (cu, cw, r, n = 24) => Array.from({ length: n }, (_, i) => [cu + r * Math.cos(i / n * 2 * Math.PI), cw + r * Math.sin(i / n * 2 * Math.PI)]);
  const ink = "#1D3554";
  const guill = Array.from({ length: 4 }, (_, k) => Array.from({ length: 41 }, (_, i) => [-CW / 2 + 30 + i * (CW - 60) / 40, -CD / 2 + 34 + 5 * Math.sin(i * 0.9 + k * 1.3) + k * 2]));
  const rays = Array.from({ length: 18 }, (_, i) => {
    const a = i / 18 * 2 * Math.PI;
    return [[CW / 2 - 62 + 20 * Math.cos(a), CD / 2 - 52 + 20 * Math.sin(a)], [CW / 2 - 62 + 29 * Math.cos(a), CD / 2 - 52 + 29 * Math.sin(a)]];
  });
  const stampXf = xfMul(pose, xfMul(xfTrans([u0 + 6, yP - 0.6, w0 - 40]), xfMul(xfRotX(90), xfRotZ(-12))));
  return jsxs(jsx_runtime.Fragment, { children: [
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsx("path", { d: P(rect(CW + 4, CD + 4, 4, -4)), fill: "#000000", opacity: 0.3 }),
      jsx("path", { d: P(rect(CW, CD)), fill: rampAt(PAPER, 0.78) }),
      jsx("path", { d: P(rect(CW - 22, CD - 22)), fill: "none", stroke: ink, strokeOpacity: 0.75, strokeWidth: 2.2 }),
      jsx("path", { d: P(rect(CW - 32, CD - 32)), fill: "none", stroke: ink, strokeOpacity: 0.55, strokeWidth: 1 }),
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b], k) => jsxs("g", { children: [
        jsx("path", { d: P(circ(a * (CW / 2 - 16), b * (CD / 2 - 16), 9)), fill: rampAt(PAPER, 0.78), stroke: ink, strokeOpacity: 0.7, strokeWidth: 1.4 }),
        jsx("path", { d: P(circ(a * (CW / 2 - 16), b * (CD / 2 - 16), 4)), fill: ink, opacity: 0.6 })
      ] }, `ro${k}`)),
      guill.map((pts, k) => jsx("path", { d: P(pts, false), fill: "none", stroke: ink, strokeOpacity: 0.35, strokeWidth: 0.9 }, `gu${k}`)),
      // the engraved title panel (blank: no invented words), and the vignette band under it
      jsx("path", { d: P(rect(190, 26, 0, -CD / 2 + 70)), fill: ink, opacity: 0.8 }),
      jsx("path", { d: P(rect(178, 16, 0, -CD / 2 + 70)), fill: "none", stroke: rampAt(PAPER, 0.95), strokeOpacity: 0.5, strokeWidth: 0.8 }),
      // fine print rows
      Array.from({ length: 6 }, (_, k) => jsx("path", { d: P([[-CW / 2 + 40, -CD / 2 + 102 + k * 12], [CW / 2 - 40 - (k % 3) * 22, -CD / 2 + 102 + k * 12]], false), stroke: ink, strokeOpacity: 0.3, strokeWidth: 2.2, fill: "none" }, `fp${k}`)),
      // the seal and the signature rules
      jsx("path", { d: P(circ(CW / 2 - 62, CD / 2 - 52, 18)), fill: ink, opacity: 0.55 }),
      rays.map((r, k) => jsx("path", { d: P(r, false), stroke: ink, strokeOpacity: 0.55, strokeWidth: 1.4, fill: "none" }, `ry${k}`)),
      [-1, 0].map((k) => jsx("path", { d: P([[-CW / 2 + 40 + (k + 1) * 0, CD / 2 - 34 + k * 0], [-CW / 2 + 140, CD / 2 - 34]], false), stroke: ink, strokeOpacity: 0.6, strokeWidth: 1.2, fill: "none" }, `sg${k}`))
    ] }),
    // the court's stamp: a red frame and GUILTY, inked ON the paper
    jsx(XPlane, { rig, x: stampXf, u: -112, v: -38, w: 0, width: 224, height: 76, probe: "the court's stamp on the share certificate", children: jsx("div", { style: { width: 224, height: 76, boxSizing: "border-box", border: `5px solid ${theme.red}`, borderRadius: 8, opacity: 0.88 * clamp01(stamp.on), display: "flex", alignItems: "center", justifyContent: "center", ...figure(56, theme.red), letterSpacing: 4 }, children: stamp.text }) })
  ] });
};
/** an exhibit card on its steel clip at the front of a tray: lift 0 = lying face-down on the table, 1 = standing (tilted back 14°) */
const Card = ({ rig, pose, side, lift, who, what, red, lit = 0, probe }) => {
  const ang = -90 + 104 * lift;
  const xf = xfMul(pose, xfMul(xfTrans([side * TRAY.u, VT - 14, CARD.w]), xfRotX(ang)));
  const back = xfMul(xf, xfRotY(180));
  const face = mixHex("#E9EEF4", "#FFFFFF", clamp01(lit));
  return jsxs(jsx_runtime.Fragment, { children: [
    jsx(XPlane, { rig, x: back, u: -CARD.W / 2, v: -CARD.H, w: 0.4, width: CARD.W, height: CARD.H, children: jsx("div", { style: { width: CARD.W, height: CARD.H, background: "#C9D1DB", borderRadius: 6, boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.12)" } }) }),
    jsx(XPlane, { rig, x: xf, u: -CARD.W / 2, v: -CARD.H, w: 0.4, width: CARD.W, height: CARD.H, probe, children: jsxs("div", { style: { width: CARD.W, height: CARD.H, background: face, borderRadius: 6, boxShadow: "inset 0 0 0 2px rgba(11,28,51,0.25)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }, children: [
      jsx("div", { style: { ...label(30, "#2B4C77"), letterSpacing: 3 }, children: who }),
      jsx("div", { style: { ...figure(62, red ? theme.red : "#0B1C33"), marginTop: 6 }, children: what })
    ] }) })
  ] });
};
/** the table at `pose`; stamp { text, on }; inv / pat: the cards' text halves; lift: the patients' card 0…1; lamp 0…1 */
export const ExhibitTable = ({ id, rig, pose, stamp, inv, pat, lift, lamp, tubeLabel, sheen = 0 }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const m = parts();
  const legs = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => xfTrans(xfApply(pose, [sx * (TABLE.W / 2 - 80), VT + TABLE.top + TABLE.apron, sz * (TABLE.D / 2 - 70) - 10]))));
  // the tube: standing in its stand, drawn by builder H's ThTube in the rig's own scale and view
  const foot = xfApply(pose, [TRAY.u - 60, VT - 6 - 34 - 4, TRAY.w - 20]);
  const fs = worldScr(rig, foot), fs2 = worldScr(rig, [foot[0] + 50, foot[1], foot[2]]);
  const tScale = 1.6 * Math.abs(fs2[0] - fs[0]) / 50;
  // the lamp's pool on the patients' tray
  const pc = worldScr(rig, map([TRAY.u, VT - 7, TRAY.w])), pr = worldScr(rig, map([TRAY.u + 260, VT - 7, TRAY.w]));
  const R = Math.abs(pr[0] - pc[0]);
  const grain = Array.from({ length: 18 }, (_, k) => {
    const w0 = -TABLE.D / 2 + 14 + k * (TABLE.D - 28) / 17;
    return P(Array.from({ length: 15 }, (_, i) => [-TABLE.W / 2 + 14 + i * (TABLE.W - 28) / 14, VT - 0.3, w0 + 3 * Math.sin(i * 0.8 + k * 1.9) + 2 * Math.sin(i * 2.1 + k)]), false);
  });
  const topClip = P([[-TABLE.W / 2 + 6, VT - 0.3, TABLE.D / 2 - 6], [TABLE.W / 2 - 6, VT - 0.3, TABLE.D / 2 - 6], [TABLE.W / 2 - 6, VT - 0.3, -TABLE.D / 2 + 6], [-TABLE.W / 2 + 6, VT - 0.3, -TABLE.D / 2 + 6]]);
  const s0 = -TABLE.W / 2 - 200 + (TABLE.W + 400) * clamp01(sheen);
  const band = P([[s0, VT - 0.4, TABLE.D / 2 - 4], [s0 + 120, VT - 0.4, TABLE.D / 2 - 4], [s0 + 220, VT - 0.4, -TABLE.D / 2 + 4], [s0 + 100, VT - 0.4, -TABLE.D / 2 + 4]]);
  const slip = [[TRAY.u + 10, TRAY.w - 110], [TRAY.u + 150, TRAY.w - 110], [TRAY.u + 150, TRAY.w + 110], [TRAY.u + 10, TRAY.w + 110]];
  const slipP = (pts, close = true) => P(pts.map(([u, w]) => [u, VT - 7.2, w]), close);
  return jsxs("div", { "data-probe-object": "the exhibit table: the share certificate stamped GUILTY in one tray, the Theranos tube in the other, their exhibit cards", style: { position: "absolute", inset: 0 }, children: [
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsxs("defs", { children: [
        jsx("clipPath", { id: `${id}Tc`, children: jsx("path", { d: topClip }) }),
        jsxs("radialGradient", { id: `${id}Lp`, gradientUnits: "userSpaceOnUse", cx: f2(pc[0]), cy: f2(pc[1]), r: f2(R), gradientTransform: `translate(${f2(pc[0])} ${f2(pc[1])}) scale(1 0.55) translate(${f2(-pc[0])} ${f2(-pc[1])})`, children: [
          jsx("stop", { offset: "0", stopColor: "#FFFFFF", stopOpacity: 0.5 }),
          jsx("stop", { offset: "0.5", stopColor: "#CFE0F5", stopOpacity: 0.22 }),
          jsx("stop", { offset: "1", stopColor: "#CFE0F5", stopOpacity: 0 })
        ] })
      ] }),
      // the floor shadow, the legs, the apron, the top with its grain and brass edge
      jsx("path", { d: P(Array.from({ length: 32 }, (_, i) => [30 + 640 * Math.cos(i / 32 * 2 * Math.PI), -0.5, -50 + 330 * Math.sin(i / 32 * 2 * Math.PI)])), fill: "#000000", opacity: 0.3, stroke: "#000000", strokeOpacity: 0.12, strokeWidth: 24, strokeLinejoin: "round" }),
      legs.map((xf, k) => jsx(Turned, { id: `${id}l${k}`, rig, xf, profile: LEG, ramp: WALNUT_D, spec: 0.8, n: 32 }, `lg${k}`)),
      jsx(Paint, { faces: m.apron, map, rig, ramp: WALNUT_D, spec: 0.4 }),
      jsx(Paint, { faces: m.top, map, rig, ramp: WALNUT, spec: 0.7 }),
      jsx(Paint, { faces: m.edge, map, rig, ramp: BRASS, spec: 0.95 }),
      jsx("g", { clipPath: `url(#${id}Tc)`, children: grain.map((d, k) => jsx("path", { d, stroke: k % 2 ? "#000000" : "#E8C9A8", strokeOpacity: k % 2 ? 0.16 : 0.07, strokeWidth: 1.3, fill: "none" }, `gr${k}`)) }),
      jsx("path", { d: band, fill: "#FFFFFF", opacity: 0.05, clipPath: `url(#${id}Tc)` }),
      // the trays' shadows, then the trays
      [-1, 1].map((s) => jsx("path", { d: P([[s * TRAY.u - TRAY.W / 2 + 14, VT - 0.5, TRAY.w - TRAY.D / 2 - 18], [s * TRAY.u + TRAY.W / 2 + 22, VT - 0.5, TRAY.w - TRAY.D / 2 - 18], [s * TRAY.u + TRAY.W / 2 + 22, VT - 0.5, TRAY.w + TRAY.D / 2 - 6], [s * TRAY.u - TRAY.W / 2 + 14, VT - 0.5, TRAY.w + TRAY.D / 2 - 6]]), fill: "#000000", opacity: 0.3, stroke: "#000000", strokeOpacity: 0.15, strokeWidth: 10 }, `ts${s}`)),
      m.trays.map((faces, k) => jsx(Paint, { faces, map, rig, ramp: PL_STEEL, spec: 0.85, dim: k === 0 ? 0.1 * clamp01(lamp) : -0.05 * clamp01(lamp) }, `tr${k}`)),
      // the lamp's pool on the patients' tray
      lamp > 3e-3 && jsx("ellipse", { cx: f2(pc[0]), cy: f2(pc[1]), rx: f2(R), ry: f2(R * 0.55), fill: `url(#${id}Lp)`, opacity: clamp01(lamp) }),
      // the test-result slip beside the tube: thermal paper, print rows, a barcode
      jsx("path", { d: slipP(slip), fill: rampAt(PAPER, 0.92) }),
      Array.from({ length: 9 }, (_, k) => jsx("path", { d: slipP([[TRAY.u + 24, TRAY.w - 88 + k * 16], [TRAY.u + 136 - (k % 3) * 24, TRAY.w - 88 + k * 16]], false), stroke: "#3B4654", strokeOpacity: 0.55, strokeWidth: 1.8, fill: "none" }, `sl${k}`)),
      Array.from({ length: 16 }, (_, k) => jsx("path", { d: slipP([[TRAY.u + 26 + k * 7, TRAY.w + 72], [TRAY.u + 26 + k * 7, TRAY.w + 96]], false), stroke: "#1B222B", strokeWidth: k % 3 ? 1.6 : 3, opacity: 0.75, fill: "none" }, `bc${k}`)),
      jsx(Paint, { faces: m.stand, map, rig, ramp: PL_STEEL, spec: 0.9 }),
      jsx("path", { d: P(Array.from({ length: 24 }, (_, i) => [TRAY.u - 60 + 29 * Math.cos(i / 24 * 2 * Math.PI), VT - 6 - 34 - 0.4, TRAY.w - 20 + 29 * Math.sin(i / 24 * 2 * Math.PI)])), fill: "#0A0F16" }),
      m.clips.map((faces, k) => jsx(Paint, { faces, map, rig, ramp: PL_STEEL, spec: 0.85 }, `cl${k}`))
    ] }),
    jsx(Certificate, { id: `${id}C`, rig, map, pose, stamp }),
    jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(ThTube, { x: fs[0], y: fs[1], scale: tScale, fill: 0.55, pitch: -36, lit: 0.4 * clamp01(lamp), label: tubeLabel, id: `${id}T` }) }),
    jsx(Card, { rig, pose, side: -1, lift: 1, who: inv.who, what: inv.what, red: true, probe: "the investors' exhibit card" }),
    jsx(Card, { rig, pose, side: 1, lift, who: pat.who, what: pat.what, lit: lamp, probe: "the patients' exhibit card" })
  ] });
};
export const tableCorners = (pose) => {
  const out = [];
  for (const x of [-TABLE.W / 2, TABLE.W / 2]) for (const z of [-TABLE.D / 2, TABLE.D / 2]) for (const y of [VT, 0]) out.push(xfApply(pose, [x, y, z]));
  return out;
};
export const TABLE_TOP_V = VT;
