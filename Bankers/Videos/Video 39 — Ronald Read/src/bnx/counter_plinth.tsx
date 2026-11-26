// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { cw, cylW, prism, rampAt } from "./solid_engine";
import { mapPath, mapScr, paintXf, rrectPts, wound, xfApply, xfDir, xfRotX } from "./tk_rig";
import { Engraved, Glass, Readout, WinWalls, winGeo, winWidth } from "./counter_drums";
import { PL_BODY, PL_DRUM_A, PL_DRUM_B, PL_DRUM_C, PL_DRUM_D, PL_GLASS, PL_GROOVE, PL_LIP, PL_PLATE, PL_PLATE_BG, PL_RECESS, PL_RUBBER, PL_STEEL, PL_WALL } from "./counter_mat";
import { CT_GLYPH, CT_PAINT } from "./counter_ink";

const f2 = (v) => v.toFixed(2);
const xfFaces = (faces, x) => faces.map((f) => ({ ...f, pts: f.pts.map((p) => xfApply(x, p)), n: xfDir(x, f.n), vn: f.vn ? [xfDir(x, f.vn[0]), xfDir(x, f.vn[1])] : void 0 }));
export const vCyl = (u, w, v0, v1, r, mat, pass) => xfFaces(cylW(0, 0, r, -(v1 - v0) / 2, (v1 - v0) / 2, 20, mat, pass), { m: xfRotX(90).m, t: [u, (v0 + v1) / 2, w] });
export const tone = (r, dw) => rampAt(r, dw.face.bev ? Math.min(1, 0.95 * dw.light + 0.16) : dw.face.cap ? 0.62 * dw.light + 0.06 : 0.8 * dw.light + 0.04);
export const Faces = ({ faces, map, rig, ramp, spec = 0.5, skip, dim = 0 }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: paintXf(faces, map, rig, spec).filter((dw) => !skip || !skip(dw)).map((dw, k) => {
  const c = tone(ramp(dw.face), { ...dw, light: dw.light * (1 - dim) });
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
}) });
export const Screw = ({ id, map, rig, c, r, plane, slot = 30 }) => {
  const at = (dx, dy, lift = 0) => plane === "front" ? [c[0] + dx, c[1] + dy, c[2] + lift] : [c[0] + dx, c[1] - lift, c[2] + dy];
  const ring = (rr, lift) => Array.from({ length: 18 }, (_, i) => at(rr * Math.cos(i / 18 * 2 * Math.PI), rr * Math.sin(i / 18 * 2 * Math.PI), lift));
  const a = slot * Math.PI / 180, sx = Math.cos(a) * r * 0.62, sy = Math.sin(a) * r * 0.62;
  const p0 = mapScr(map, rig, at(-r, -r)), p1 = mapScr(map, rig, at(r, r));
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Sc`, gradientUnits: "userSpaceOnUse", x1: f2(p0[0]), y1: f2(p0[1]), x2: f2(p1[0]), y2: f2(p1[1]), children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: rampAt(PL_STEEL, 0.95) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.45", stopColor: rampAt(PL_STEEL, 0.55) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: rampAt(PL_STEEL, 0.18) })
    ] }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath(map, rig, ring(r + 1.6, 0.2)), fill: "#000000", opacity: 0.5 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath(map, rig, ring(r, 0.8)), fill: `url(#${id}Sc)` }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath(map, rig, [at(-sx, -sy, 1.2), at(sx, sy, 1.2)], false), stroke: PL_GROOVE, strokeWidth: 1.4, opacity: 0.75, fill: "none" })
  ] });
};
const CL = { bar: 12, jawH: 36, jawD: 18, gap: 0.6, padW: 20 };
const clampParts = (top, tk, uc) => {
  const zj = tk.d / 2 + CL.gap + CL.jawD / 2, vj = top - CL.bar - CL.jawH / 2;
  const bar = wound(prism(rrectPts(tk.w + 2 * CL.padW + 16, CL.bar, 3, 2, uc, top - CL.bar / 2), tk.d + 2 * (CL.gap + CL.jawD) + 24, 2.5, 0, 1));
  const jaw = (s) => wound(prism(rrectPts(tk.w + 2 * CL.padW, CL.jawH, 4, 2, uc, vj), CL.jawD, 3, 0, 1, () => false, [0, 0, s * zj]));
  const screws = [-1, 1].map((s) => {
    const u = uc + s * (tk.w / 2 - Math.min(70, tk.w / 5)), w0 = zj + CL.jawD / 2;
    return wound([...cylW(u, vj, 10, w0, w0 + 8, 22, 0, 2), ...cylW(u, vj, 15, w0 + 8, w0 + 17, 30, 0, 3)]);
  });
  return { bar, back: jaw(-1), front: jaw(1), screws, zj, vj, w0: zj + CL.jawD / 2 };
};
export const ClampBack = ({ rig, map, top, tk, uc = 0 }) => {
  const c = clampParts(top, tk, uc);
  const slot = mapPath(map, rig, [
    [uc - tk.w / 2 - CL.padW + 4, top - CL.bar - 0.3, -tk.d / 2],
    [uc + tk.w / 2 + CL.padW - 4, top - CL.bar - 0.3, -tk.d / 2],
    [uc + tk.w / 2 + CL.padW - 4, top - CL.bar - 0.3, tk.d / 2],
    [uc - tk.w / 2 - CL.padW + 4, top - CL.bar - 0.3, tk.d / 2]
  ]);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Faces, { faces: c.bar, map, rig, ramp: () => PL_PLATE, spec: 0.6 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: slot, fill: "#000000", opacity: 0.55 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Faces, { faces: c.back, map, rig, ramp: () => PL_STEEL, spec: 0.7 })
  ] });
};
export const ClampFront = ({ id, rig, map, top, tk, uc = 0 }) => {
  const c = clampParts(top, tk, uc);
  const contact = mapPath(map, rig, [[uc - tk.w / 2 + 2, top - CL.bar - CL.jawH - 0.4, tk.d / 2 + 0.3], [uc + tk.w / 2 - 2, top - CL.bar - CL.jawH - 0.4, tk.d / 2 + 0.3]], false);
  const knurl = [-1, 1].flatMap((s) => {
    const u = uc + s * (tk.w / 2 - Math.min(70, tk.w / 5));
    return Array.from({ length: 24 }, (_, i) => {
      const a = i / 24 * 2 * Math.PI;
      return mapPath(map, rig, [[u + 10.2 * Math.cos(a), c.vj + 10.2 * Math.sin(a), c.w0 + 17.3], [u + 15.2 * Math.cos(a), c.vj + 15.2 * Math.sin(a), c.w0 + 17.3]], false);
    });
  });
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: contact, stroke: "#000000", strokeWidth: 2.2, opacity: 0.55, fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Faces, { faces: c.front, map, rig, ramp: () => PL_STEEL, spec: 0.7 }),
    c.screws.map((f, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Faces, { faces: f, map, rig, ramp: () => PL_STEEL, spec: 0.9 }, k)),
    knurl.map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: "#000000", strokeWidth: 0.9, opacity: 0.35, fill: "none" }, `${id}k${k}`))
  ] });
};
const CLAMP_BAR = CL.bar;
const PL = { feet: 10, foot: { W: 640, H: 22, D: 330 }, body: { W: 560, H: 304, D: 270 }, cap: { W: 608, H: 20, D: 306 } };
const V_FOOT = -PL.feet - PL.foot.H / 2;
const VB0 = -PL.feet - PL.foot.H - PL.body.H;
const V_BODY = VB0 + PL.body.H / 2;
const V_CAP = VB0 - PL.cap.H / 2;
export const PL_TOP = VB0 - PL.cap.H;
export const plinthTicketY = PL_TOP - CL.bar;
const ZF = PL.body.D / 2;
const MET = { size: 96, pitch: 112, w: 84 };
const W_DOLLAR = 60, W_DOT = 30, PADW = 14, GAP = 8;
const WIN_W = winWidth(MET, [{ k: "glyph", w: W_DOLLAR }, { k: "drum" }, { k: "glyph", w: W_DOT }, { k: "drum" }, { k: "drum" }], PADW, GAP);
const TITLE_V = 38, WIN_V = 76, WIN_H = 168, SEAM_V = 264, WORD = 28;
const fv = (v) => VB0 + v;
const WIN = { u0: -WIN_W / 2, v0: fv(WIN_V), w: WIN_W, h: WIN_H, zF: ZF, rd: 18, pad: PADW, gap: GAP };
export const PL_WIN_C = [0, fv(WIN_V + WIN_H / 2), ZF];
export const PL_WORD_C = [0, fv(TITLE_V), ZF];
const INK = { drum: [PL_DRUM_A, PL_DRUM_B, PL_DRUM_C, PL_DRUM_D], plateBg: PL_PLATE_BG, glyph: CT_GLYPH, wall: PL_WALL, recess: PL_RECESS, glass: PL_GLASS };
const ENG = { groove: PL_GROOVE, lip: PL_LIP, paint: CT_PAINT };
const BZ = 13;
let memo = null;
const parts = () => {
  if (memo) return memo;
  const feet = wound([-1, 1].flatMap((su) => [-1, 1].flatMap((sw) => vCyl(su * (PL.foot.W / 2 - 54), sw * (PL.foot.D / 2 - 52), -PL.feet, 0, 17, 0, 0))));
  const foot = wound(prism(rrectPts(PL.foot.W, PL.foot.H, 5, 3, 0, V_FOOT), PL.foot.D, 4, 0, 1));
  const body = wound(prism(rrectPts(PL.body.W, PL.body.H, 8, 3, 0, V_BODY), PL.body.D, 6, 0, 1));
  const cap = wound(prism(rrectPts(PL.cap.W, PL.cap.H, 5, 3, 0, V_CAP), PL.cap.D, 4.5, 0, 1));
  const u0 = WIN.u0, u1 = WIN.u0 + WIN.w, v0 = WIN.v0, v1 = WIN.v0 + WIN.h, at = [0, 0, ZF + 2.5];
  const bar = (cu, cv, w, h) => prism(rrectPts(w, h, 2.5, 2, cu, cv), 5, 1.6, 0, 3, () => false, at);
  const bezel = wound([
    ...bar((u0 + u1) / 2, v0 - BZ / 2, u1 - u0 + 2 * BZ, BZ),
    ...bar((u0 + u1) / 2, v1 + BZ / 2, u1 - u0 + 2 * BZ, BZ),
    ...bar(u0 - BZ / 2, (v0 + v1) / 2, BZ, v1 - v0),
    ...bar(u1 + BZ / 2, (v0 + v1) / 2, BZ, v1 - v0)
  ]);
  memo = { feet, foot, body, cap, bezel };
  return memo;
};
export const PlinthBody = ({ id, rig, pose, drums, glyph, lit, word, wordOn, tk, sheen = 0 }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const { feet, foot, body, cap, bezel } = parts();
  const W = PL.body.W, b0 = VB0, b1 = VB0 + PL.body.H;
  const painted = paintXf(body, map, rig, 0.5);
  const front = painted.find((dw) => dw.face.cap && dw.face.n[2] > 0.5);
  const fl = front ? front.light : 0.45;
  const g0 = mapScr(map, rig, [-W / 2, b0, ZF]), g1 = mapScr(map, rig, [W / 4, b1, ZF]);
  const stops = [0, 0.18, 0.3, 0.55, 0.8, 1].map((t) => ({ t, c: rampAt(PL_BODY, fl + 0.24 - 0.46 * t + (t > 0.12 && t < 0.36 ? 0.08 : 0)) }));
  const wg = winGeo(map, rig, WIN);
  const brush = [];
  for (let v = b0 + 10; v < b1 - 8; v += 7) {
    const inWin = v > WIN.v0 - BZ - 2 && v < WIN.v0 + WIN.h + BZ + 2;
    const runs = inWin ? [[-W / 2 + 6, WIN.u0 - BZ - 3], [WIN.u0 + WIN.w + BZ + 3, W / 2 - 6]] : [[-W / 2 + 6, W / 2 - 6]];
    for (const [a, b] of runs) brush.push(P([[a, v, ZF + 0.15], [b, v, ZF + 0.15]], false));
  }
  const seam = (dy) => P([[-W / 2 + 4, fv(SEAM_V) + dy, ZF + 0.3], [W / 2 - 4, fv(SEAM_V) + dy, ZF + 0.3]], false);
  const VENTS = 13, VW = 22, VH = 8, vy = fv((SEAM_V + PL.body.H) / 2 - 1);
  const vents = Array.from({ length: VENTS }, (_, i) => -((VENTS - 1) / 2) * 34 + i * 34);
  const screws = [[-W / 2 + 24, fv(22), ZF], [W / 2 - 24, fv(22), ZF], [-W / 2 + 24, fv(PL.body.H - 22), ZF], [W / 2 - 24, fv(PL.body.H - 22), ZF]];
  const ct = PL_TOP - 0.3, cw2 = PL.cap.W / 2, cd2 = PL.cap.D / 2;
  const border = P(rrectPts(PL.cap.W - 30, PL.cap.D - 30, 8, 3).map(([u, w]) => [u, ct, w]));
  const capScrews = [-1, 1].flatMap((su) => [-1, 1].map((sw) => [su * (cw2 - 24), ct, sw * (cd2 - 24)]));
  const shadow = ticketShadow(tk, cw2, cd2).map(([u, w]) => [u, ct, w]);
  const sh0 = mapScr(map, rig, [0, ct, -tk.d / 2]), sh1 = mapScr(map, rig, [70, ct, -cd2]);
  const footLine = (dy) => P([[-PL.foot.W / 2 + 10, V_FOOT + dy, PL.foot.D / 2 + 0.2], [PL.foot.W / 2 - 10, V_FOOT + dy, PL.foot.D / 2 + 0.2]], false);
  const s0 = -W / 2 + 70 + sheen;
  const band = (a, w) => P([[s0 + a, b0, ZF + 0.1], [s0 + a + w, b0, ZF + 0.1], [s0 + a + w - 130, b1, ZF + 0.1], [s0 + a - 130, b1, ZF + 0.1]]);
  const slots = [
    { k: "glyph", ch: "$", w: W_DOLLAR, on: glyph },
    { k: "drum", pos: drums[0] },
    { k: "glyph", ch: ".", w: W_DOT, on: glyph },
    { k: "drum", pos: drums[1] },
    { k: "drum", pos: drums[2] }
  ];
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(
    "div",
    {
      "data-probe-object": "the price plinth: feet, foot plate, body, readout window with its drums, bezel and glass, engraved word, seam, vents, screws, cap plate",
      style: { position: "absolute", inset: 0, pointerEvents: "none" },
      children: [
        /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsx)("linearGradient", { id: `${id}Face`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: stops.map((s) => /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: s.t, stopColor: s.c }, s.t)) }) }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)(Faces, { faces: feet, map, rig, ramp: () => PL_RUBBER, spec: 0.2 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)(Faces, { faces: foot, map, rig, ramp: () => PL_PLATE, spec: 0.6 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: footLine(-2), stroke: PL_GROOVE, strokeWidth: 1.8, opacity: 0.85, fill: "none" }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: footLine(-0.2), stroke: PL_LIP, strokeWidth: 0.8, opacity: 0.3, fill: "none" }),
          [-1, 1].map((s) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Screw, { id: `${id}fs${s}`, map, rig, c: [s * (PL.foot.W / 2 - 40), V_FOOT, PL.foot.D / 2], r: 4.6, plane: "front", slot: s * 35 }, `fs${s}`)),
          [16, 8, 3].map((g, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[-W / 2 - g * 0.4, b1 - 0.6, ZF + g], [W / 2 + g, b1 - 0.6, ZF + g], [W / 2 + g, b1 - 0.6, -ZF - g * 0.3], [-W / 2 - g * 0.4, b1 - 0.6, -ZF - g * 0.3]]), fill: "#000000", opacity: [0.1, 0.16, 0.3][k] }, `c${k}`)),
          painted.filter((dw) => dw !== front).map((dw, k) => {
            const c = tone(PL_BODY, dw);
            return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, `b${k}`);
          }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: wg.floor, fill: PL_RECESS })
        ] }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)(Readout, { rig, pose, win: WIN, met: MET, slots, ink: INK, lit, id: `${id}r` }),
        /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)(WinWalls, { g: wg, wall: PL_WALL }),
          front && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: `${front.d} ${wg.hole}`, fillRule: "evenodd", fill: `url(#${id}Face)` }),
          brush.map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: k % 2 ? "#000000" : "#ffffff", strokeOpacity: 0.035, strokeWidth: 1, fill: "none" }, `br${k}`)),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: seam(0), stroke: PL_GROOVE, strokeWidth: 2.2, opacity: 0.8, fill: "none" }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: seam(2.2), stroke: PL_LIP, strokeWidth: 1, opacity: 0.3, fill: "none" }),
          vents.map((u, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
            /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[u - VW / 2, vy - VH / 2, ZF + 0.3], [u + VW / 2, vy - VH / 2, ZF + 0.3], [u + VW / 2, vy + VH / 2, ZF + 0.3], [u - VW / 2, vy + VH / 2, ZF + 0.3]]), fill: PL_RECESS }),
            /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[u - VW / 2, vy - VH / 2, ZF + 0.4], [u + VW / 2, vy - VH / 2, ZF + 0.4], [u + VW / 2, vy - VH / 2 + 2.2, ZF + 0.4], [u - VW / 2, vy - VH / 2 + 2.2, ZF + 0.4]]), fill: "#000000", opacity: 0.5 }),
            /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[u - VW / 2 + 1, vy + VH / 2 + 0.9, ZF + 0.4], [u + VW / 2 - 1, vy + VH / 2 + 0.9, ZF + 0.4]], false), stroke: PL_LIP, strokeWidth: 1, opacity: 0.4, fill: "none" })
          ] }, `v${k}`)),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: band(0, 120), fill: "#ffffff", opacity: 0.03 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: band(150, 26), fill: "#ffffff", opacity: 0.022 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[-W / 2, b0, ZF + 0.1], [W / 2, b0, ZF + 0.1], [W / 2, b0 + 7, ZF + 0.1], [-W / 2, b0 + 7, ZF + 0.1]]), fill: "#000000", opacity: 0.3 }),
          screws.map((c, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Screw, { id: `${id}s${k}`, map, rig, c, r: 7, plane: "front", slot: [25, -30, 50, -10][k] }, `s${k}`))
        ] }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)(Glass, { rig, pose, win: WIN, ink: INK, id: `${id}g` }),
        /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(rrectPts(WIN.w + 2 * BZ, WIN.h + 2 * BZ, 4, 2, WIN.u0 + WIN.w / 2 + 4, WIN.v0 + WIN.h / 2 + 5).map(([u, v]) => [u, v, ZF + 0.2])), fill: "none", stroke: "#000000", strokeWidth: 6, opacity: 0.22 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)(Faces, { faces: bezel, map, rig, ramp: () => PL_STEEL, spec: 0.7 }),
          wg.lip && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: wg.lip, stroke: PL_LIP, strokeWidth: 1.2, opacity: 0.3, fill: "none" })
        ] }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)(Engraved, { rig, pose, zF: ZF, uC: 0, vC: fv(TITLE_V), width: W - 140, size: WORD, text: word, on: wordOn, ink: ENG, probe: "the plinth's engraved word", bare: 0.7 }),
        /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Sh`, gradientUnits: "userSpaceOnUse", x1: f2(sh0[0]), y1: f2(sh0[1]), x2: f2(sh1[0]), y2: f2(sh1[1]), children: [
            /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: "#000000", stopOpacity: 0.62 }),
            /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: "#000000", stopOpacity: 0.12 })
          ] }) }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)(Faces, { faces: cap, map, rig, ramp: () => PL_PLATE, spec: 0.6 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: border, fill: "none", stroke: PL_GROOVE, strokeWidth: 1.8, opacity: 0.75 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(rrectPts(PL.cap.W - 28, PL.cap.D - 28, 8, 3).map(([u, w]) => [u, ct, w])), fill: "none", stroke: PL_LIP, strokeWidth: 0.7, opacity: 0.22 }),
          capScrews.map((c, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Screw, { id: `${id}cs${k}`, map, rig, c, r: 6, plane: "top", slot: [20, -40, 60, 0][k] }, `cs${k}`)),
          shadow.length > 2 && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(shadow), fill: `url(#${id}Sh)` })
        ] })
      ]
    }
  );
};
const ticketShadow = (tk, cw2, cd2) => {
  const zb = -tk.d / 2 - CL.gap - CL.jawD, dz = cd2 - 4 + zb, dx = 0.5 * dz / 0.62;
  let poly = [[-tk.w / 2, zb], [tk.w / 2, zb], [tk.w / 2 + dx, -cd2 + 4], [-tk.w / 2 + dx, -cd2 + 4]];
  const lim = cw2 - 4, out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], ina = a[0] <= lim, inb = b[0] <= lim;
    if (ina) out.push(a);
    if (ina !== inb) {
      const t = (lim - a[0]) / (b[0] - a[0]);
      out.push([lim, a[1] + t * (b[1] - a[1])]);
    }
  }
  poly = out;
  return cw(poly);
};
export const plinthCorners = (pose) => {
  const out = [];
  for (const u of [-PL.cap.W / 2, PL.cap.W / 2]) for (const v of [PL_TOP, 0]) for (const w of [-PL.cap.D / 2, PL.cap.D / 2]) out.push(xfApply(pose, [u, v, w]));
  return out;
};
export const plinthAt = (rig, pose, q) => mapScr((p) => xfApply(pose, p), rig, q);
