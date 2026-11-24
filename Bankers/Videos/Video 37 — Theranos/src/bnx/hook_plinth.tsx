// @ts-nocheck
// ★ V37 "Theranos" — hook_plinth.tsx (builder H): THE $9 BILLION PLINTH — a towering machined blue-steel pedestal the tiny
//   nanotainer stands on top of (the hook's payoff), and whose two-step base the paper sheet stands on in `hype` (the solid world
//   the paper is set against). Real construction: a two-step floor base, a foot band, a tall shaft with chamfered vertical edges
//   and two machined grooves, a recessed front panel held by four screws carrying the inlaid figure (L("hookFigure")), a neck
//   band, a heavy cornice, a polished top plate and a machined round seat for the tube. Lit by the one key light; a studio
//   falloff down its height (`fall`), which the hook also uses to keep the tower in the dark until its reveal.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { rampAt } from "./solid_engine";
import { cw } from "./solid_engine";
import { rrectPts } from "./tk_rig";
import { SHOUT } from "./fonts";
import { HW_FLOOR_Y, HwFaces, HwScrew, hwBlock, hwDisc, hwPath, hwPlaneXf } from "./hook_world";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
// polished blue-steel and its darker machined trim (house ramps: TK_BODY / HS_BELL family)
export const PLINTH_RAMP = ["#0A1628", "#132A47", "#22497A", "#86A8CF", "#E6EEF8"];
const TRIM_RAMP = ["#08121F", "#0F2238", "#1B3B63", "#6E91BB", "#D6E2F0"];
const FY = HW_FLOOR_Y;
// the parts, top to bottom (world units; centred on x = PX, z = 0)
const TOPY = 40;   // the top plate's top: the tower stands ≈ 1270 units, ≈ 2.6× its width
export const PL = {
  x: 540,
  step1: { w: 640, d: 520, y0: FY - 40, y1: FY },
  step2: { w: 570, d: 450, y0: FY - 90, y1: FY - 40 },
  foot: { w: 494, d: 384, y0: FY - 124, y1: FY - 90 },
  shaft: { w: 440, d: 330, y0: TOPY + 100, y1: FY - 124 },
  neck: { w: 470, d: 358, y0: TOPY + 70, y1: TOPY + 100 },
  cornice: { w: 536, d: 420, y0: TOPY + 24, y1: TOPY + 70 },
  top: { w: 496, d: 382, y0: TOPY, y1: TOPY + 24 },
  seat: { r: 40, y0: TOPY - 6, y1: TOPY }
};
export const PL_TOP_Y = PL.seat.y0;   // the tube's foot stands here
export const PL_BASE_TOP = PL.step2.y0;   // the base's top (hype's paper stands here)
const PANEL = { x0: -168, x1: 168, y0: TOPY + 170, y1: FY - 196, depth: 7, bev: 8 };
export const plinthFaces = (base = false) => {
  const x = PL.x, B = (p, o) => hwBlock(x, 0, p.w, p.d, p.y0, p.y1, o);
  const fs = [...B(PL.step1, { ch: 14, bev: 5, pass: 0 }), ...B(PL.step2, { ch: 12, bev: 6, pass: 1 })];
  if (base) return fs;
  return [
    ...fs,
    ...B(PL.foot, { ch: 10, bev: 4, pass: 2 }).map((f) => ({ ...f, ramp: TRIM_RAMP })),
    ...B(PL.shaft, { ch: 18, bev: 3, pass: 3 }),
    ...B(PL.neck, { ch: 12, bev: 4, pass: 4 }).map((f) => ({ ...f, ramp: TRIM_RAMP })),
    ...B(PL.cornice, { ch: 14, bev: 8, pass: 5 }),
    ...B(PL.top, { ch: 12, bev: 4, pass: 6 }),
    ...hwDisc(x, 0, PL.seat.r, PL.seat.y0, PL.seat.y1, { bev: 1.5, pass: 7 }).map((f) => ({ ...f, ramp: TRIM_RAMP }))
  ];
};
export const plinthCorners = (base = false) => {
  const p = base ? PL.step2 : PL.cornice, y0 = base ? PL.step2.y0 : PL.top.y0;
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].flatMap(([a, b]) => [[PL.x + a * PL.step1.w / 2, FY, b * PL.step1.d / 2], [PL.x + a * p.w / 2, y0, b * p.d / 2]]);
};
// the grooves round the shaft: the section outline at height y, only the edges whose faces look at the eye
const groove = (cam, y) => {
  const sec = cw(rrectPts(PL.shaft.w + 0.6, PL.shaft.d + 0.6, 20, 1));
  const segs = [];
  for (let i = 0; i < sec.length; i++) {
    const a = sec[i], b = sec[(i + 1) % sec.length];
    const n = [b[1] - a[1], 0, -(b[0] - a[0])], l = Math.hypot(n[0], n[2]) || 1;
    const nn = [n[0] / l, 0, n[2] / l];
    const mid = [PL.x + (a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2];
    if (cam.facing(mid, nn) > 0) segs.push([[PL.x + a[0], y, a[1]], [PL.x + b[0], y, b[1]]]);
  }
  return segs;
};
// the figure's plane: its centre, and the glint on its inlaid rule (local −64, 150) where flare 1 blooms from
const figCentre = () => [PL.x, (PANEL.y0 + PANEL.y1) / 2 - 60, PL.shaft.d / 2 - PANEL.depth + 0.3];
export const plinthGlint = () => {
  const c = figCentre();
  return [c[0] - 64, c[1] + 150, c[2] + 0.6];
};
export const HookPlinth = ({ id = "hkP", cam, fall = () => 1, fig, figOn = 0, base = false, stage = 0, sheen = -1, glint = 0 }) => {
  const faces = plinthFaces(base);
  const k = cam.K([PL.x, (PL.shaft.y0 + PL.shaft.y1) / 2, PL.shaft.d / 2]);
  const Zf = PL.shaft.d / 2;
  // the recessed panel: four bevelled walls stepping in, the back face
  const { x0, x1, y0, y1, depth: dp, bev } = PANEL, X = PL.x;
  const o = [[X + x0, y0, Zf], [X + x1, y0, Zf], [X + x1, y1, Zf], [X + x0, y1, Zf]];
  const i = [[X + x0 + bev, y0 + bev, Zf - dp], [X + x1 - bev, y0 + bev, Zf - dp], [X + x1 - bev, y1 - bev, Zf - dp], [X + x0 + bev, y1 - bev, Zf - dp]];
  const s2 = Math.SQRT1_2;
  const panel = base ? [] : [
    { pts: [o[0], o[1], i[1], i[0]], n: [0, s2, s2], pass: 3.5, bev: false },
    { pts: [o[1], o[2], i[2], i[1]], n: [-s2, 0, s2], pass: 3.5 },
    { pts: [o[2], o[3], i[3], i[2]], n: [0, -s2, s2], pass: 3.5 },
    { pts: [o[3], o[0], i[0], i[3]], n: [s2, 0, s2], pass: 3.5 },
    { pts: i, n: [0, 0, 1], pass: 3.6, ramp: TRIM_RAMP }
  ];
  const screws = base ? [] : [[x0 + 26, y0 + 26], [x1 - 26, y0 + 26], [x1 - 26, y1 - 26], [x0 + 26, y1 - 26]].map(([sx, sy]) => [X + sx, sy, Zf - dp + 0.4]);
  const grooves = base ? [] : [TOPY + 130, TOPY + 144, FY - 160].map((y) => groove(cam, y));
  // the figure: inlaid polished letters on the panel's back face, "$9" over "BILLION" (the label's words, never typed)
  const words = String(fig ?? "").split(" ");
  const line1 = words[0] ?? "", line2 = words.slice(1).join(" ");
  const on = clamp01(figOn), sc = 1 + 0.06 * (1 - on);
  const pc = figCentre();
  const xf = hwPlaneXf(cam, pc, [1, 0, 0], [0, 1, 0]);
  const fallC = (y) => fall(y);
  return jsxs("g", { children: [
    jsx(HwFaces, { id: `${id}F`, cam, faces: [...faces, ...panel], ramp: PLINTH_RAMP, spec: 0.6, fall: fallC }),
    // the grooves: a dark cut with a lit lip under it
    grooves.map((gs, gi) => gs.map((sg, si) => jsxs("g", { children: [
      jsx("path", { d: hwPath(cam, sg, false), stroke: "#050D19", strokeWidth: Math.max(0.6, 2.2 * k), opacity: 0.8 * fall(sg[0][1]), fill: "none" }),
      jsx("path", { d: hwPath(cam, sg.map((p) => [p[0], p[1] + 2.4, p[2]]), false), stroke: "#A9C2E0", strokeWidth: Math.max(0.4, 1 * k), opacity: 0.45 * fall(sg[0][1]), fill: "none" })
    ] }, `${gi}_${si}`))),
    // the panel's lit lower lip and the four screws
    !base && jsx("path", { d: hwPath(cam, [i[3], i[2]], false), stroke: "#B9CFEA", strokeWidth: Math.max(0.5, 1.4 * k), opacity: 0.55 * fall(y1), fill: "none" }),
    !base && jsx("g", { opacity: fall(y0 + 300), children: screws.map((c, si) => jsx(HwScrew, { cam, c, u: [1, 0, 0], v: [0, 1, 0], r: 9, slot: 30 + 25 * si }, si)) }),
    // the figure, easing in (≈ 20 f, a slight settle) and sitting centred on the panel
    !base && on > 2e-3 && jsx("g", { transform: xf, opacity: on, children: jsxs("g", { transform: `scale(${sc.toFixed(4)})`, children: [
      jsxs("defs", { children: [jsxs("linearGradient", { id: `${id}Fg`, x1: "0", y1: "0", x2: "0.35", y2: "1", children: [
        jsx("stop", { offset: "0", stopColor: "#FFFFFF" }),
        jsx("stop", { offset: "0.55", stopColor: "#DCE7F4" }),
        jsx("stop", { offset: "1", stopColor: "#9DB9DB" })
      ] })] }),
      jsx("text", { x: 3, y: 8, textAnchor: "middle", dominantBaseline: "central", style: { fontFamily: SHOUT, fontSize: 280, letterSpacing: -4 }, fill: "#030A15", opacity: 0.75, children: line1 }),
      jsx("text", { x: 0, y: 4, textAnchor: "middle", dominantBaseline: "central", style: { fontFamily: SHOUT, fontSize: 280, letterSpacing: -4 }, fill: `url(#${id}Fg)`, children: line1 }),
      line2 && jsx("text", { x: 2, y: 228, textAnchor: "middle", dominantBaseline: "central", style: { fontFamily: SHOUT, fontSize: 96, letterSpacing: 6 }, fill: "#030A15", opacity: 0.75, children: line2 }),
      line2 && jsx("text", { x: 0, y: 225, textAnchor: "middle", dominantBaseline: "central", style: { fontFamily: SHOUT, fontSize: 96, letterSpacing: 6 }, fill: `url(#${id}Fg)`, children: line2 }),
      jsx("path", { d: "M-150,150L150,150", stroke: "#B9CFEA", strokeWidth: 3, opacity: 0.6 }),
      // the studio's sheen sliding across the polished letters (a turn of the light), ending in the glint on the rule
      sheen > -1 && sheen < 1 && jsxs("g", { children: [
        jsx("defs", { children: jsxs("linearGradient", { id: `${id}Sn`, gradientUnits: "userSpaceOnUse", x1: f2(-260 + 520 * (sheen + 1) / 2 - 90), y1: -200, x2: f2(-260 + 520 * (sheen + 1) / 2 + 90), y2: 60, children: [
          jsx("stop", { offset: "0", stopColor: "#FFFFFF", stopOpacity: 0 }),
          jsx("stop", { offset: "0.5", stopColor: "#FFFFFF", stopOpacity: 0.85 }),
          jsx("stop", { offset: "1", stopColor: "#FFFFFF", stopOpacity: 0 })
        ] }) }),
        jsx("text", { x: 0, y: 4, textAnchor: "middle", dominantBaseline: "central", style: { fontFamily: SHOUT, fontSize: 280, letterSpacing: -4 }, fill: `url(#${id}Sn)`, children: line1 }),
        line2 && jsx("text", { x: 0, y: 225, textAnchor: "middle", dominantBaseline: "central", style: { fontFamily: SHOUT, fontSize: 96, letterSpacing: 6 }, fill: `url(#${id}Sn)`, children: line2 })
      ] }),
      glint > 2e-3 && jsxs("g", { opacity: clamp01(glint), children: [
        jsx("defs", { children: jsxs("radialGradient", { id: `${id}Gl`, cx: 0.5, cy: 0.5, r: 0.5, children: [
          jsx("stop", { offset: "0", stopColor: "#FFFFFF", stopOpacity: 1 }),
          jsx("stop", { offset: "0.25", stopColor: "#DDEBFA", stopOpacity: 0.6 }),
          jsx("stop", { offset: "1", stopColor: "#9FC3EC", stopOpacity: 0 })
        ] }) }),
        jsx("circle", { cx: -64, cy: 150, r: 18 + 26 * glint, fill: `url(#${id}Gl)` }),
        jsx("path", { d: `M-64,${150 - 34 * glint}L-61,147L${-64 + 60 * glint},150L-61,153L-64,${150 + 34 * glint}L-67,153L${-64 - 60 * glint},150L-67,147Z`, fill: "#FFFFFF" })
      ] })
    ] }) })
  ] });
};
