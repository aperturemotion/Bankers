// @ts-nocheck
// Video 37 "Theranos" — collapse's RESULTS STAND (builder B, rev 1, 2026-11-24). Timur: "Make that stand appear not inside the
//   building but OUTSIDE IN FRONT OF THE DOOR … and make it a lot more detailed itself"; "make the red buttons more detailed".
//   A free-standing results display on the doorstep: a heavy graphite base plate on four levelling feet, a brushed-steel column
//   with its cable channel and a collar, and the display head tilted back like a lectern — a moulded housing with a raised bezel,
//   corner screws, a vent slot along its top, and a black-glass face carrying a status header and TEN result buttons in two rows.
//   Each button is a real panel indicator: a machined steel bezel, a recessed well, a domed lens (lit blue, going RED one by one),
//   the lens's specular highlight from the key light and its glow when red. Under them VOIDED and the years, printed on the glass.
//   Drawn in the DOOR's local frame (th_door), standing in front of the entrance, low enough that its head stays clear under
//   the door's THERANOS lettering, set a little right of the door's centre so the plaque's fall (left of the door) passes clear
//   of its head.
//   <ResultsStand id rig pose red(i) void years probe />   pose: the door's pose; red(i) 0…1 for button i (0…9)
//   STAND: the dimensions · standCorners(pose) → TkFloor casters · standHeadQuad(rig, pose) → the head face's screen corners
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { rampAt } from "./solid_engine";
import { mapScr, xfApply, xfMul, xfRotX, xfTrans } from "./tk_rig";
import { PaintParts, PlanePrint, boxAB, cylAB, f2, path3, planeMatrix } from "./claim_kit";
import { SHOUT } from "./fonts";
import { theme } from "./theme";
import { ED_FRONT, ED_LED, TH_GRAPH, TH_RUBBER, TH_STEEL } from "./claim_mat";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs, Fragment = jsx_runtime.Fragment;
const B = boxAB;
export const STAND = { x: 90, z: 250, base: { w: 300, d: 170, h: 26 }, col: { h: 186, w: 52, d: 38 }, head: { w: 410, h: 250, d: 40, tilt: 14 }, n: 10, cols: 5 };
const S0 = STAND;
// the stand's own frame: origin on the floor under its column, facing the lens (+z), in the door's local frame
const standXf = (pose) => xfMul(pose, xfTrans([S0.x, 0, S0.z]));
// the head's frame: origin at the head's bottom edge centre on its FRONT face, tilted back about that edge
const headXf = (pose) => xfMul(standXf(pose), xfMul(xfTrans([0, -S0.col.h - S0.base.h, 22]), xfRotX(S0.head.tilt)));
export const standCorners = (pose) => {
  const x = standXf(pose), out = [];
  for (const sx of [-1, 1]) for (const y of [0, -S0.col.h - S0.base.h - S0.head.h]) for (const sz of [-1, 1]) out.push(xfApply(x, [sx * S0.head.w / 2, y, sz * S0.base.d / 2]));
  return out;
};
export const standHeadQuad = (rig, pose, m = 14, v0 = null, v1 = null, u0 = null, u1 = null) => {
  const x = headXf(pose), H = S0.head, ya = v0 ?? -H.h + m, yb = v1 ?? -m, xa = u0 ?? -H.w / 2 + m, xb = u1 ?? H.w / 2 - m;
  return [[xa, ya], [xb, ya], [xb, yb], [xa, yb]].map(([u, v]) => mapScr((q) => xfApply(x, q), rig, [u, v, 6.6]));
};
const baseParts = () => {
  const { base, col } = S0, ps = [];
  const P = (k, faces, ramp, oo = {}) => ps.push({ faces, ramp, spec: 0.5, key: k, ...oo, c: oo.c ?? [0, 0, 0] });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P(`ft${sx}${sz}`, cylAB([sx * (base.w / 2 - 22), 0, sz * (base.d / 2 - 22)], [sx * (base.w / 2 - 22), -6, sz * (base.d / 2 - 22)], 11, 14), TH_RUBBER, { layer: 0, c: [sx * 120, -3, sz * 60], spec: 0.2 });
  P("bs", B([-base.w / 2, -6, -base.d / 2], [base.w / 2, -base.h, base.d / 2], 7), TH_GRAPH, { layer: 1, c: [0, -16, 0], spec: 0.55, lift: 0.05 });
  // the column, its collar at the base and its cable channel down the front
  P("cl", B([-col.w / 2 - 10, -base.h, -col.d / 2 - 10], [col.w / 2 + 10, -base.h - 18, col.d / 2 + 10], 3), TH_STEEL, { layer: 2, c: [0, -base.h - 9, 0], spec: 0.8 });
  P("co", B([-col.w / 2, -base.h - 18, -col.d / 2], [col.w / 2, -base.h - col.h, col.d / 2], 4), TH_STEEL, { layer: 3, c: [0, -base.h - col.h / 2, 0], spec: 0.9, lift: 0.04, after: (map, rig) => jsxs("g", { children: [
    jsx("path", { d: path3(map, rig, [[-7, -base.h - 24, col.d / 2 + 0.3], [-7, -base.h - col.h + 8, col.d / 2 + 0.3]], false), stroke: "#1A2129", strokeWidth: 2.4, opacity: 0.7, fill: "none" }),
    jsx("path", { d: path3(map, rig, [[7, -base.h - 24, col.d / 2 + 0.3], [7, -base.h - col.h + 8, col.d / 2 + 0.3]], false), stroke: "#1A2129", strokeWidth: 2.4, opacity: 0.7, fill: "none" }),
    jsx("path", { d: path3(map, rig, [[-5, -base.h - 24, col.d / 2 + 0.3], [-5, -base.h - col.h + 8, col.d / 2 + 0.3]], false), stroke: "#F2F6FA", strokeWidth: 0.9, opacity: 0.35, fill: "none" })
  ] }) });
  // the yoke the head pivots on
  P("yk", B([-60, -base.h - col.h + 6, -col.d / 2 - 4], [60, -base.h - col.h - 12, col.d / 2 + 4], 3), TH_STEEL, { layer: 4, c: [0, -base.h - col.h, 0], spec: 0.85 });
  return ps;
};
const headParts = () => {
  const H = S0.head, ps = [];
  const P = (k, faces, ramp, oo = {}) => ps.push({ faces, ramp, spec: 0.55, key: k, ...oo, c: oo.c ?? [0, 0, 0] });
  P("hs", B([-H.w / 2, 0, -H.d], [H.w / 2, -H.h, 0], 10), ED_FRONT, { layer: 0, c: [0, -H.h / 2, -H.d / 2], lift: 0.06 });
  // the raised bezel round the glass (four bars standing proud)
  const m = 14, t = 6;
  P("b1", B([-H.w / 2 + 4, -4, 0], [H.w / 2 - 4, -m, t], 2), ED_FRONT, { layer: 1, c: [0, -9, 3], lift: 0.14 });
  P("b2", B([-H.w / 2 + 4, -H.h + m, 0], [H.w / 2 - 4, -H.h + 4, t], 2), ED_FRONT, { layer: 1, c: [0, -H.h + 9, 3], lift: 0.14 });
  P("b3", B([-H.w / 2 + 4, -m, 0], [-H.w / 2 + m, -H.h + m, t], 2), ED_FRONT, { layer: 1, c: [-H.w / 2 + 9, -H.h / 2, 3], lift: 0.14 });
  P("b4", B([H.w / 2 - m, -m, 0], [H.w / 2 - 4, -H.h + m, t], 2), ED_FRONT, { layer: 1, c: [H.w / 2 - 9, -H.h / 2, 3], lift: 0.14 });
  return ps;
};
// the glass face: its gradient, the status header, the ten buttons (bezel, well, domed lens, highlight, glow), a reflection
const Face = ({ id, rig, map, red }) => {
  const H = S0.head, m = 14, W = H.w - 2 * m, Ht = H.h - 2 * m;
  const M = planeMatrix(map, rig, [-H.w / 2 + m, -H.h + m, 6.2], [1, 0, 0], [0, 1, 0]);
  const els = [];
  els.push(jsx("rect", { x: 0, y: 0, width: W, height: Ht, rx: 6, fill: `url(#${id}Gf)` }, "bg"));
  // the header: a status light (red once any result is voided), three short bars
  const any = clamp01(Math.max(0, ...Array.from({ length: S0.n }, (_, i) => red(i))));
  els.push(jsx("circle", { cx: 16, cy: 15, r: 5, fill: mixHex(ED_LED, theme.red, any) }, "hl"));
  [70, 40, 54].forEach((w, k) => els.push(jsx("rect", { x: 32 + k * 84, y: 12, width: w, height: 6, rx: 3, fill: "#4D8ED9", opacity: 0.45 }, `hb${k}`)));
  els.push(jsx("rect", { x: 10, y: 28, width: W - 20, height: 1.2, fill: "#4D8ED9", opacity: 0.3 }, "hr"));
  // the ten result buttons
  const bw = 58, bh = 30, gx = (W - 2 * 14 - S0.cols * bw) / (S0.cols - 1);
  for (let i = 0; i < S0.n; i++) {
    const r = Math.floor(i / S0.cols), c = i % S0.cols, k = clamp01(red(i));
    const x = 14 + c * (bw + gx), y = 38 + r * (bh + 12);
    const lens = mixHex("#2F6FB8", theme.red, k), lensHi = mixHex("#9CC7F4", "#FF9AA4", k), lensLo = mixHex("#123B69", "#6A0A16", k);
    els.push(jsxs("g", { children: [
      // the glow round a red lens
      k > 0.02 && jsx("rect", { x: x - 6, y: y - 6, width: bw + 12, height: bh + 12, rx: 12, fill: theme.red, opacity: f2(0.35 * k), style: { filter: "blur(5px)" } }),
      // the machined bezel (lit along its top edge), the recessed well
      jsx("rect", { x, y, width: bw, height: bh, rx: 9, fill: `url(#${id}Bz)` }),
      jsx("rect", { x: x + 0.8, y: y + 0.8, width: bw - 1.6, height: 1.4, rx: 0.7, fill: "#F4F8FC", opacity: 0.6 }),
      jsx("rect", { x: x + 4, y: y + 4, width: bw - 8, height: bh - 8, rx: 6, fill: "#05090E" }),
      // the domed lens: its colour, a darker foot, the dome's light across its top, the key light's specular
      jsx("rect", { x: x + 6, y: y + 6, width: bw - 12, height: bh - 12, rx: 5, fill: lens }),
      jsx("rect", { x: x + 6, y: y + bh / 2, width: bw - 12, height: bh / 2 - 6, rx: 4, fill: lensLo, opacity: 0.6 }),
      jsx("rect", { x: x + 9, y: y + 7.5, width: bw - 18, height: 5, rx: 2.5, fill: lensHi, opacity: 0.75 }),
      jsx("circle", { cx: x + 13, cy: y + 10, r: 1.8, fill: "#FFFFFF", opacity: 0.9 })
    ] }, `b${i}`));
  }
  // the glass's reflection: one soft diagonal band from the upper left
  els.push(jsx("path", { d: `M${f2(W * 0.04)},0 L${f2(W * 0.22)},0 L${f2(W * 0.08)},${f2(Ht)} L${f2(-W * 0.1)},${f2(Ht)} Z`, fill: "#FFFFFF", opacity: 0.06 }, "rf"));
  return jsxs("g", { children: [
    jsxs("defs", { "data-probe-skip": true, children: [
      jsxs("linearGradient", { id: `${id}Gf`, x1: 0, y1: 0, x2: 0, y2: 1, children: [jsx("stop", { offset: "0", stopColor: "#13263D" }), jsx("stop", { offset: "1", stopColor: "#070E17" })] }),
      jsxs("linearGradient", { id: `${id}Bz`, x1: 0, y1: 0, x2: 0, y2: 1, children: [jsx("stop", { offset: "0", stopColor: rampAt(TH_STEEL, 0.86) }), jsx("stop", { offset: "0.5", stopColor: rampAt(TH_STEEL, 0.55) }), jsx("stop", { offset: "1", stopColor: rampAt(TH_STEEL, 0.3) })] }),
      jsx("clipPath", { id: `${id}Fc`, children: jsx("rect", { x: -20, y: -20, width: W + 40, height: Ht + 40 }) })
    ] }),
    jsx("g", { transform: M, children: els })
  ] });
};
// the screws at the bezel's corners and the vent slot along the head's top
const HeadDetail = ({ rig, map }) => {
  const H = S0.head, out = [];
  for (const sx of [-1, 1]) for (const v of [-H.h + 9, -9]) {
    const c = mapScr(map, rig, [sx * (H.w / 2 - 9), v, 6.4]);
    out.push(jsx("circle", { cx: f2(c[0]), cy: f2(c[1]), r: 2.6, fill: "#B9C6D4", opacity: 0.85 }, `s${sx}${v}`));
    out.push(jsx("path", { d: `M${f2(c[0] - 1.8)},${f2(c[1])}L${f2(c[0] + 1.8)},${f2(c[1])}`, stroke: "#28313B", strokeWidth: 0.8 }, `l${sx}${v}`));
  }
  for (let k = 0; k < 9; k++) out.push(jsx("path", { d: path3(map, rig, [[-120 + k * 30 - 10, -H.h - 0.3, -12], [-120 + k * 30 + 10, -H.h - 0.3, -12], [-120 + k * 30 + 10, -H.h - 0.3, -26], [-120 + k * 30 - 10, -H.h - 0.3, -26]]), fill: "#05090E", opacity: 0.75 }, `v${k}`));
  return jsx("g", { children: out });
};
export const ResultsStand = ({ id, rig, pose, red, void: vd, years, probe }) => {
  const sx = standXf(pose), hx = headXf(pose);
  const smap = (q) => xfApply(sx, q), hmap = (q) => xfApply(hx, q);
  const H = S0.head, m = 14;
  // ★ the probe's occluders: the head (housing, bezel and glass) is opaque — what lies behind it (the door's frame, the shutter's
  //   slats, the cladding's joints) cannot cross the print on it. The head is seen turned and tilted, so its outline is a skewed
  //   quad: it is tiled by a 7 × 6 grid of cells, each the axis-aligned box inside its own cell (grown 7 px: the probe reads a
  //   box inset 6 px), so the boxes cover the face without reaching past its edges.
  const NU = 7, NV = 6, occs = [];
  for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
    const q = standHeadQuad(rig, pose, 2, -H.h + 2 + (H.h - 4) * j / NV, -H.h + 2 + (H.h - 4) * (j + 1) / NV, -H.w / 2 + 2 + (H.w - 4) * i / NU, -H.w / 2 + 2 + (H.w - 4) * (i + 1) / NU);
    // (grown 7 px on the head's outer edges — the probe's inset — and 16 px into a neighbouring cell, closing the slanted seams)
    const g = (inner) => (inner ? 16 : 7);
    occs.push({ l: Math.max(q[0][0], q[3][0]) - g(i > 0), r: Math.min(q[1][0], q[2][0]) + g(i < NU - 1), t: Math.max(q[0][1], q[1][1]) - g(j > 0), b: Math.min(q[2][1], q[3][1]) + g(j < NV - 1) });
  }
  const svg = (children, k) => jsx("svg", { width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children }, k);
  const pr = (text, v, size, fill, on, k, ls) => jsx(PlanePrint, { rig, pose: hx, pr: { o: [0, v, 6.8], u: [1, 0, 0], v: [0, 1, 0], text, size, fill, op: clamp01(on), family: SHOUT, ls, probe: "the results stand's display" }, k }, k);
  return jsxs(Fragment, { children: [
    svg([
      jsx(PaintParts, { parts: baseParts(), map: smap, rig, id: `${id}b` }, "b"),
      // the cable from the column into the head's back
      jsx("path", { d: path3(smap, rig, [[16, -S0.base.h - S0.col.h + 4, -S0.col.d / 2 - 2], [26, -S0.base.h - S0.col.h - 30, -40], [30, -S0.base.h - S0.col.h - 60, -30]], false), stroke: "#0A0F15", strokeWidth: 4, fill: "none", strokeLinecap: "round" }, "cb"),
      jsx(PaintParts, { parts: headParts(), map: hmap, rig, id: `${id}h` }, "h"),
      jsx(Face, { id: `${id}F`, rig, map: hmap, red }, "f"),
      jsx(HeadDetail, { rig, map: hmap }, "hd"),
      ...occs.filter((o) => o.r - o.l > 16 && o.b - o.t > 14).map((o, i) => jsx("rect", { "data-probe-occluder-rect": "the results stand's opaque display head", x: f2(o.l), y: f2(o.t), width: f2(o.r - o.l), height: f2(o.b - o.t), fill: "none" }, `oc${i}`))
    ], "s"),
    vd && pr(vd.text, -H.h + m + 140, 46, theme.red, vd.on, `${id}v`, 3),
    years && pr(years.text, -H.h + m + 182, 24, "#F6C7CD", years.on, `${id}y`, 2)
  ] });
};
