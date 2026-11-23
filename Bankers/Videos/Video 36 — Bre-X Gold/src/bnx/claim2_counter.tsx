// @ts-nocheck
// Video 36 "Bre-X Gold" — claim2's machined ASSAY COUNTER (builder B, 2026-11-23), on Video 35's plinth recipe (counter_plinth.tsx:
//   graphite body with its foot plate, rubber feet, brushed front, seam, vents, screws, cap plate, a steel-bezelled readout window
//   with glass) widened to an eight-drum odometer with its two comma plates and an OZ plate, an engraved title over the window and an
//   engraved date under it; on the cap, the drill core it assays, lying in two steel V-blocks.
//   ★ The drums are an ODOMETER driven by ONE value (counterOz): the units drum turns with the value, each higher drum is geared to
//   the one below it (it turns only while that one passes 9 → 0) — the readout can only rise. A drum spinning faster than the eye can
//   follow is drawn as a real fast drum films: its cells smeared over the frame's exposure (sub-frame samples, averaged).
import * as jsx_runtime from "react/jsx-runtime";
import * as react from "react";
import { clamp01 } from "./anim";
import { figure } from "./kit";
import { cylW, prism, rampAt } from "./solid_engine";
import { XPlane, mapPath, mapScr, paintXf, rrectPts, wound, xfApply, xfMul, xfRotX, xfTrans } from "./tk_rig";
import { Engraved, Glass, WinWalls, winGeo, winWidth } from "./counter_drums";
import { Faces, Screw, tone, vCyl } from "./counter_plinth";
import { PL_BODY, PL_DRUM_A, PL_DRUM_B, PL_DRUM_C, PL_DRUM_D, PL_GLASS, PL_GROOVE, PL_LIP, PL_PLATE, PL_PLATE_BG, PL_RECESS, PL_RUBBER, PL_STEEL, PL_WALL } from "./counter_mat";
import { CT_GLYPH, CT_PAINT } from "./counter_ink";
import { PaintParts, boxAB, cylAB, part, path3, rnd } from "./claim_kit";
import { BxCore, coreXf } from "./bx_core";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs, Fragment = jsx_runtime.Fragment;
const f2 = (v) => v.toFixed(2);
const N = 10;
const smooth = (x) => {
  const s = Math.max(0, Math.min(1, x));
  return s * s * (3 - 2 * s);
};
const sm2 = (a, b, x) => smooth((x - a) / (b - a));
// ── the odometer: every drum from ONE value ───────────────────────────────────────────────────────────────────────────────────
const carry = (p) => {
  const m = Math.round((p - 9.5) / 10);
  return m + smooth(p - (10 * m + 9.5) + 0.5);
};
/** drum positions (in digits), highest drum first, for value v on `n` drums */
export const drumsOf = (v, n) => {
  const pos = [v];
  for (let i = 1; i < n; i++) pos.push(carry(pos[i - 1]));
  return pos.reverse();
};
// ── the readout's slots, parsed from its label (claim2Readout) ─────────────────────────────────────────────────────────────────
export const slotsOf = (text) => {
  const m = text.match(/^([\d,]+) (\S+)$/);
  if (!m) throw new Error(`claim2_counter: readout "${text}" is not "<digits with commas> <unit>"`);
  const out = [];
  for (const ch of m[1]) out.push(ch === "," ? { k: "glyph", ch: ",", w: 24 } : { k: "drum", d: +ch });
  out.push({ k: "glyph", ch: m[2], w: 104, unit: true });
  return out;
};
const MET = { size: 80, pitch: 96, w: 62 };
const PADW = 12, GAP = 6;
const PL = { feet: 10, foot: { H: 22, D: 330 }, body: { H: 330, D: 270 }, cap: { H: 20, D: 306 } };
const TITLE_V = 38, WIN_V = 80, WIN_H = 154, DATE_V = 268, SEAM_V = 296, BZ = 13, WORD = 40, DATE = 26;
export const counterGeo = (slots) => {
  const WIN_W = winWidth(MET, slots, PADW, GAP);
  const W = WIN_W + 2 * 56;
  const V_FOOT = -PL.feet - PL.foot.H / 2, VB0 = -PL.feet - PL.foot.H - PL.body.H;
  const g = {
    W,
    footW: W + 80,
    capW: W + 48,
    V_FOOT,
    VB0,
    V_BODY: VB0 + PL.body.H / 2,
    V_CAP: VB0 - PL.cap.H / 2,
    TOP: VB0 - PL.cap.H,
    ZF: PL.body.D / 2,
    WIN: { u0: -WIN_W / 2, v0: VB0 + WIN_V, w: WIN_W, h: WIN_H, zF: PL.body.D / 2, rd: 18, pad: PADW, gap: GAP }
  };
  g.WIN_C = [0, g.WIN.v0 + WIN_H / 2, g.ZF];
  g.TITLE_C = [0, VB0 + TITLE_V, g.ZF];
  g.DATE_C = [0, VB0 + DATE_V, g.ZF];
  return g;
};
// one drum's cells at one drum position (V35's DrumCells), with an opacity for the exposure's samples
const DrumCells = ({ rig, pose, u0, va, wa, R, pos, half, k, op = 1, blur = 0 }) => {
  const ch = MET.size + 8, step = 360 / N;
  const th0 = Math.asin(Math.min(1, half / R)) * 180 / Math.PI;
  return /* @__PURE__ */ jsx(Fragment, { children: Array.from({ length: N }, (_, c) => {
    const kk = c + N * Math.round((pos - c) / N);
    const th = -(kk - pos) * step;
    const o = (1 - sm2(th0, th0 + 9, Math.abs(th))) * op;
    const x = xfMul(pose, xfMul(xfTrans([0, va, wa]), xfMul(xfRotX(th), xfTrans([0, 0, R]))));
    return /* @__PURE__ */ jsx(XPlane, { rig, x, u: u0, v: -ch / 2, w: 0, width: MET.w, height: ch, op: o, children: /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: 0, top: 4, width: MET.w, textAlign: "center", ...figure(MET.size, CT_GLYPH), filter: blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : void 0 }, children: c }) }, `${k}${c}`);
  }) });
};
const INK = { drum: [PL_DRUM_A, PL_DRUM_B, PL_DRUM_C, PL_DRUM_D], plateBg: PL_PLATE_BG, glyph: CT_GLYPH };
/** the readout: drum bodies, glyph plates, the cells (smeared over the exposure when fast), the drums' shading */
const Readout = ({ rig, pose, win, slots, samples, lit, id }) => {
  const zR = win.zF - win.rd, wFront = zR - 2;
  const R = MET.pitch * N / (2 * Math.PI), wa = wFront - R, va = win.v0 + win.h / 2, chH = win.h;
  const [dA, dB, dC, dD] = INK.drum;
  const xs = [];
  let x = win.u0 + win.pad;
  for (const s of slots) {
    xs.push(x);
    x += (s.k === "drum" ? MET.w : s.w) + win.gap;
  }
  const gsize = (s) => s.unit ? MET.size * 0.62 : MET.size;
  let di = -1;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    slots.map((s, i) => {
      if (s.k === "glyph") {
        const gs = gsize(s), top = (chH - gs) / 2 + (s.unit ? 6 : 4);
        return /* @__PURE__ */ jsxs(XPlane, { rig, x: pose, u: xs[i], v: win.v0, w: wFront, width: s.w, height: chH, children: [
          /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, borderRadius: 3, background: `linear-gradient(180deg, ${dA} 0%, ${INK.plateBg} 30%, ${dB} 50%, ${INK.plateBg} 72%, ${dA} 100%)` } }),
          /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: 0, top, width: s.w, textAlign: "center", ...figure(gs, INK.glyph) }, children: s.ch })
        ] }, `${id}g${i}`);
      }
      return /* @__PURE__ */ jsx(XPlane, { rig, x: pose, u: xs[i], v: win.v0, w: wFront, width: MET.w, height: chH, children: /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, borderRadius: 3, background: `linear-gradient(180deg, ${dA} 0%, ${dB} 16%, ${dC} 32%, ${dD} 44%, ${dC} 60%, ${dB} 84%, ${dA} 100%)` } }) }, `${id}b${i}`);
    }),
    slots.map((s, i) => {
      if (s.k !== "drum") return null;
      di++;
      const ps = samples.map((smp) => smp[di]);
      const sp = ps.length > 1 ? Math.abs(ps[ps.length - 1] - ps[0]) * ps.length / (ps.length - 1) : 0;
      const blur = Math.min(2.6, Math.max(0, sp - 0.6) * 0.9);
      // the exposure: samples averaged by drawing the k-th at 1/(k+1) over the ones before it (a fast drum also softens)
      return /* @__PURE__ */ jsx(react.Fragment, { children: ps.map((p, k) => /* @__PURE__ */ jsx(DrumCells, { rig, pose, u0: xs[i], va, wa, R, pos: p, half: win.h / 2, k: `${id}d${i}_${k}_`, op: 1 / (k + 1), blur }, k)) }, `${id}c${i}`);
    }),
    slots.map((s, i) => s.k === "drum" ? /* @__PURE__ */ jsxs(XPlane, { rig, x: pose, u: xs[i], v: win.v0, w: wFront + 0.4, width: MET.w, height: chH, children: [
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 20%, rgba(0,0,0,0) 36%, rgba(0,0,0,0) 64%, rgba(0,0,0,0.24) 80%, rgba(0,0,0,0.74) 100%)" } }),
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0) 26%, rgba(255,255,255,0.07) 35%, rgba(255,255,255,0.02) 42%, rgba(255,255,255,0) 48%)" } }),
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0) 8px, rgba(0,0,0,0) calc(100% - 9px), rgba(0,0,0,0.7) 100%)" } }),
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: 2, top: 0, width: 1.5, height: chH, background: "linear-gradient(180deg, rgba(255,255,255,0) 10%, rgba(255,255,255,0.3) 38%, rgba(255,255,255,0.08) 70%, rgba(255,255,255,0) 90%)" } })
    ] }, `${id}s${i}`) : null),
    /* @__PURE__ */ jsx(XPlane, { rig, x: pose, u: win.u0, v: win.v0, w: wFront + 0.6, width: win.w, height: chH, op: clamp01(lit), children: /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 62% at 50% 100%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)" } }) })
  ] });
};
const memo = /* @__PURE__ */ new Map();
const partsOf = (g) => {
  const key = g.W;
  if (memo.has(key)) return memo.get(key);
  const feet = wound([-1, 1].flatMap((su) => [-1, 1].flatMap((sw) => vCyl(su * (g.footW / 2 - 54), sw * (PL.foot.D / 2 - 52), -PL.feet, 0, 17, 0, 0))));
  const foot = wound(prism(rrectPts(g.footW, PL.foot.H, 5, 3, 0, g.V_FOOT), PL.foot.D, 4, 0, 1));
  const body = wound(prism(rrectPts(g.W, PL.body.H, 8, 3, 0, g.V_BODY), PL.body.D, 6, 0, 1));
  const cap = wound(prism(rrectPts(g.capW, PL.cap.H, 5, 3, 0, g.V_CAP), PL.cap.D, 4.5, 0, 1));
  const W = g.WIN, u0 = W.u0, u1 = W.u0 + W.w, v0 = W.v0, v1 = W.v0 + W.h, at = [0, 0, g.ZF + 2.5];
  const bar = (cu, cv, w, h) => prism(rrectPts(w, h, 2.5, 2, cu, cv), 5, 1.6, 0, 3, () => false, at);
  const bezel = wound([
    ...bar((u0 + u1) / 2, v0 - BZ / 2, u1 - u0 + 2 * BZ, BZ),
    ...bar((u0 + u1) / 2, v1 + BZ / 2, u1 - u0 + 2 * BZ, BZ),
    ...bar(u0 - BZ / 2, (v0 + v1) / 2, BZ, v1 - v0),
    ...bar(u1 + BZ / 2, (v0 + v1) / 2, BZ, v1 - v0)
  ]);
  const r = { feet, foot, body, cap, bezel };
  memo.set(key, r);
  return r;
};
// the core on the cap: one length of drill core in two steel V-blocks (claim_kit solids, in the plinth's own pose)
const CORE = { len: 0.62, r: 46 };
const coreParts = (g) => {
  const L = Math.min(560, g.capW - 160), r = CORE.r, y = g.TOP, yc = y - 26 - r * 0.55;
  const ps = [];
  for (const s of [-1, 1]) {
    const u = s * L * 0.3;
    ps.push(part(boxAB([u - 34, y - 26, -62], [u + 34, y, 62], 3), PL_STEEL, { key: `vb${s}`, spec: 0.8, layer: 0 }));
    ps.push(part(boxAB([u - 38, y - 4, -70], [u + 38, y, 70], 2), PL_PLATE, { key: `vbf${s}`, spec: 0.5, layer: -1 }));
  }
  // the core itself is the FILM'S drill core (bx_core BxCore), broken once, lying across the two V-blocks
  return { ps, L, core: (pose) => xfMul(pose, coreXf(0, yc, 0)) };
};
/** the counter: samples = drum positions sampled over the frame's exposure (one array per sample, highest drum first) */
export const CounterBody = ({ id, rig, pose, slots, samples, lit, title, titleOn, date, dateOn, sheen = 0 }) => {
  const g = counterGeo(slots);
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const { feet, foot, body, cap, bezel } = partsOf(g);
  const W = g.W, b0 = g.VB0, b1 = g.VB0 + PL.body.H, ZF = g.ZF, WIN = g.WIN;
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
  const seam = (dy) => P([[-W / 2 + 4, b0 + SEAM_V + dy, ZF + 0.3], [W / 2 - 4, b0 + SEAM_V + dy, ZF + 0.3]], false);
  const VENTS = 17, VW = 22, VH = 8, vy = b0 + (SEAM_V + PL.body.H) / 2;
  const vents = Array.from({ length: VENTS }, (_, i) => -((VENTS - 1) / 2) * 36 + i * 36);
  const screws = [[-W / 2 + 24, b0 + 22, ZF], [W / 2 - 24, b0 + 22, ZF], [-W / 2 + 24, b1 - 22, ZF], [W / 2 - 24, b1 - 22, ZF]];
  const ct = g.TOP - 0.3, cw2 = g.capW / 2, cd2 = PL.cap.D / 2;
  const border = P(rrectPts(g.capW - 30, PL.cap.D - 30, 8, 3).map(([u, w]) => [u, ct, w]));
  const capScrews = [-1, 1].flatMap((su) => [-1, 1].map((sw) => [su * (cw2 - 24), ct, sw * (cd2 - 24)]));
  const footLine = (dy) => P([[-g.footW / 2 + 10, g.V_FOOT + dy, PL.foot.D / 2 + 0.2], [g.footW / 2 - 10, g.V_FOOT + dy, PL.foot.D / 2 + 0.2]], false);
  const s0 = -W / 2 + 70 + sheen;
  const band = (a, w) => P([[s0 + a, b0, ZF + 0.1], [s0 + a + w, b0, ZF + 0.1], [s0 + a + w - 130, b1, ZF + 0.1], [s0 + a - 130, b1, ZF + 0.1]]);
  const ENG = { groove: PL_GROOVE, lip: PL_LIP, paint: CT_PAINT };
  const core = coreParts(g);
  const sh = P([[-core.L / 2 + 20, ct, -50], [core.L / 2 + 40, ct, -50], [core.L / 2 + 90, ct, -130], [-core.L / 2 + 70, ct, -130]]);
  return /* @__PURE__ */ jsxs("div", {
    "data-probe-object": "the assay counter: feet, foot plate, body, eight-drum readout with comma and OZ plates, bezel and glass, engraved title and date, seam, vents, screws, cap plate, the core in its V-blocks",
    style: { position: "absolute", inset: 0, pointerEvents: "none" },
    children: [
      /* @__PURE__ */ jsxs("svg", { width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("linearGradient", { id: `${id}Face`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: stops.map((s) => /* @__PURE__ */ jsx("stop", { offset: s.t, stopColor: s.c }, s.t)) }) }),
        /* @__PURE__ */ jsx(Faces, { faces: feet, map, rig, ramp: () => PL_RUBBER, spec: 0.2 }),
        /* @__PURE__ */ jsx(Faces, { faces: foot, map, rig, ramp: () => PL_PLATE, spec: 0.6 }),
        /* @__PURE__ */ jsx("path", { d: footLine(-2), stroke: PL_GROOVE, strokeWidth: 1.8, opacity: 0.85, fill: "none" }),
        /* @__PURE__ */ jsx("path", { d: footLine(-0.2), stroke: PL_LIP, strokeWidth: 0.8, opacity: 0.3, fill: "none" }),
        [-1, 1].map((s) => /* @__PURE__ */ jsx(Screw, { id: `${id}fs${s}`, map, rig, c: [s * (g.footW / 2 - 40), g.V_FOOT, PL.foot.D / 2], r: 4.6, plane: "front", slot: s * 35 }, `fs${s}`)),
        [16, 8, 3].map((gg, k) => /* @__PURE__ */ jsx("path", { d: P([[-W / 2 - gg * 0.4, b1 - 0.6, ZF + gg], [W / 2 + gg, b1 - 0.6, ZF + gg], [W / 2 + gg, b1 - 0.6, -ZF - gg * 0.3], [-W / 2 - gg * 0.4, b1 - 0.6, -ZF - gg * 0.3]]), fill: "#000000", opacity: [0.1, 0.16, 0.3][k] }, `c${k}`)),
        painted.filter((dw) => dw !== front).map((dw, k) => {
          const c = tone(PL_BODY, dw);
          return /* @__PURE__ */ jsx("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, `b${k}`);
        }),
        /* @__PURE__ */ jsx("path", { d: wg.floor, fill: PL_RECESS })
      ] }),
      /* @__PURE__ */ jsx(Readout, { rig, pose, win: WIN, slots, samples, lit, id: `${id}r` }),
      /* @__PURE__ */ jsxs("svg", { width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
        /* @__PURE__ */ jsx(WinWalls, { g: wg, wall: PL_WALL }),
        front && /* @__PURE__ */ jsx("path", { d: `${front.d} ${wg.hole}`, fillRule: "evenodd", fill: `url(#${id}Face)` }),
        brush.map((d, k) => /* @__PURE__ */ jsx("path", { d, stroke: k % 2 ? "#000000" : "#ffffff", strokeOpacity: 0.035, strokeWidth: 1, fill: "none" }, `br${k}`)),
        /* @__PURE__ */ jsx("path", { d: seam(0), stroke: PL_GROOVE, strokeWidth: 2.2, opacity: 0.8, fill: "none" }),
        /* @__PURE__ */ jsx("path", { d: seam(2.2), stroke: PL_LIP, strokeWidth: 1, opacity: 0.3, fill: "none" }),
        vents.map((u, k) => /* @__PURE__ */ jsxs("g", { children: [
          /* @__PURE__ */ jsx("path", { d: P([[u - VW / 2, vy - VH / 2, ZF + 0.3], [u + VW / 2, vy - VH / 2, ZF + 0.3], [u + VW / 2, vy + VH / 2, ZF + 0.3], [u - VW / 2, vy + VH / 2, ZF + 0.3]]), fill: PL_RECESS }),
          /* @__PURE__ */ jsx("path", { d: P([[u - VW / 2, vy - VH / 2, ZF + 0.4], [u + VW / 2, vy - VH / 2, ZF + 0.4], [u + VW / 2, vy - VH / 2 + 2.2, ZF + 0.4], [u - VW / 2, vy - VH / 2 + 2.2, ZF + 0.4]]), fill: "#000000", opacity: 0.5 }),
          /* @__PURE__ */ jsx("path", { d: P([[u - VW / 2 + 1, vy + VH / 2 + 0.9, ZF + 0.4], [u + VW / 2 - 1, vy + VH / 2 + 0.9, ZF + 0.4]], false), stroke: PL_LIP, strokeWidth: 1, opacity: 0.4, fill: "none" })
        ] }, `v${k}`)),
        /* @__PURE__ */ jsx("path", { d: band(0, 120), fill: "#ffffff", opacity: 0.03 }),
        /* @__PURE__ */ jsx("path", { d: band(150, 26), fill: "#ffffff", opacity: 0.022 }),
        /* @__PURE__ */ jsx("path", { d: P([[-W / 2, b0, ZF + 0.1], [W / 2, b0, ZF + 0.1], [W / 2, b0 + 7, ZF + 0.1], [-W / 2, b0 + 7, ZF + 0.1]]), fill: "#000000", opacity: 0.3 }),
        screws.map((c, k) => /* @__PURE__ */ jsx(Screw, { id: `${id}s${k}`, map, rig, c, r: 7, plane: "front", slot: [25, -30, 50, -10][k] }, `s${k}`))
      ] }),
      /* @__PURE__ */ jsx(Glass, { rig, pose, win: WIN, ink: { glass: PL_GLASS }, id: `${id}g` }),
      /* @__PURE__ */ jsxs("svg", { width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
        /* @__PURE__ */ jsx("path", { d: P(rrectPts(WIN.w + 2 * BZ, WIN.h + 2 * BZ, 4, 2, WIN.u0 + WIN.w / 2 + 4, WIN.v0 + WIN.h / 2 + 5).map(([u, v]) => [u, v, ZF + 0.2])), fill: "none", stroke: "#000000", strokeWidth: 6, opacity: 0.22 }),
        /* @__PURE__ */ jsx(Faces, { faces: bezel, map, rig, ramp: () => PL_STEEL, spec: 0.7 }),
        wg.lip && /* @__PURE__ */ jsx("path", { d: wg.lip, stroke: PL_LIP, strokeWidth: 1.2, opacity: 0.3, fill: "none" })
      ] }),
      /* @__PURE__ */ jsx(Engraved, { rig, pose, zF: ZF, uC: 0, vC: g.TITLE_C[1], width: W - 120, size: WORD, text: title, on: titleOn, ink: ENG, probe: "the counter's engraved title", bare: 0.7 }),
      /* @__PURE__ */ jsx(Engraved, { rig, pose, zF: ZF, uC: 0, vC: g.DATE_C[1], width: W - 220, size: DATE, text: date, on: dateOn, ink: ENG, probe: "the counter's engraved date", bare: 0.7 }),
      /* @__PURE__ */ jsxs("svg", { width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
        /* @__PURE__ */ jsx(Faces, { faces: cap, map, rig, ramp: () => PL_PLATE, spec: 0.6 }),
        /* @__PURE__ */ jsx("path", { d: border, fill: "none", stroke: PL_GROOVE, strokeWidth: 1.8, opacity: 0.75 }),
        /* @__PURE__ */ jsx("path", { d: P(rrectPts(g.capW - 28, PL.cap.D - 28, 8, 3).map(([u, w]) => [u, ct, w])), fill: "none", stroke: PL_LIP, strokeWidth: 0.7, opacity: 0.22 }),
        capScrews.map((c, k) => /* @__PURE__ */ jsx(Screw, { id: `${id}cs${k}`, map, rig, c, r: 6, plane: "top", slot: [20, -40, 60, 0][k] }, `cs${k}`)),
        /* @__PURE__ */ jsx("path", { d: sh, fill: "#000000", opacity: 0.35, style: { filter: "blur(6px)" } }),
        /* @__PURE__ */ jsx(PaintParts, { parts: core.ps, map, rig, id: `${id}k` }),
        /* @__PURE__ */ jsx(BxCore, { id: `${id}core`, rig, xf: core.core(pose), len: core.L, r: CORE.r, seed: 1997, pieces: [[0, 0.57, "saw", "break"], [0.575, 1, "break", "saw"]], probe: null })
      ] })
    ]
  });
};
export const counterCorners = (pose, slots) => {
  const g = counterGeo(slots), out = [];
  for (const u of [-g.footW / 2, g.footW / 2]) for (const v of [g.TOP - 2 * CORE.r - 30, 0]) for (const w of [-PL.foot.D / 2, PL.foot.D / 2]) out.push(xfApply(pose, [u, v, w]));
  return out;
};
export const counterAt = (rig, pose, q) => mapScr((p) => xfApply(pose, p), rig, q);
