// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { theme } from "./theme";
import { seeded } from "./common";
import { cw, cylW, prism, rampAt } from "./solid_engine";
import { mapPath, mapScr, paintXf, rrectPts, scrPath, worldView, wound, xfApply } from "./tk_rig";
import { TK_FACE } from "./tk_mat";
import { SF_BODY, SF_DOOR, SF_GROOVE, SF_LIP, SF_STEEL } from "./lotteries_mat";
import { SAFE_TOP_V } from "./lotteries_safe";

const TOP = SAFE_TOP_V;
const FEED = {
  R: 30,
  root: 23,
  teeth: 10,
  disc: 24,
  gap: 12,
  discs: 8,
  spR: 15,
  vc: TOP - 14,
  wc: 53,
  recess: { u: 150, w: 92 },
  cheek: { u0: 152, u1: 186, w: 100, h: 72 },
  hood: { u: 204, w0: -186, w1: -104, h: 86 },
  lamp: { v: TOP - 64, r: 11 }
};
export const FEED_NIP_V = FEED.vc;
export const FEED_CROWN_V = FEED.vc - FEED.R;
export const FEED_CHEEK_TOP_V = TOP - FEED.cheek.h;
export const feedCorners = (pose) => {
  const H = FEED.hood, C = FEED.cheek, out = [];
  for (const u of [-H.u, H.u]) for (const v of [TOP - H.h, TOP]) for (const w of [H.w0, H.w1]) out.push(xfApply(pose, [u, v, w]));
  for (const sg of [-1, 1]) for (const u of [C.u0, C.u1]) for (const w of [-C.w, C.w]) out.push(xfApply(pose, [sg * u, TOP - C.h, w]));
  return out;
};
const xform = (faces, f) => {
  const o = f([0, 0, 0]), dir = (n) => {
    const q = f(n);
    return [q[0] - o[0], q[1] - o[1], q[2] - o[2]];
  };
  return faces.map((x) => ({ ...x, pts: x.pts.map(f), n: dir(x.n), vn: x.vn ? [dir(x.vn[0]), dir(x.vn[1])] : void 0 }));
};
const vprism = (pts, vTop, vBot, bev, mat, pass) => xform(prism(pts, vBot - vTop, bev, mat, pass, () => false, [0, 0, -(vTop + vBot) / 2]), (p) => [p[0], -p[2], p[1]]);
const onShaft = (wc, vc, a) => {
  const c = Math.cos(a), s = Math.sin(a);
  return (p) => {
    const x = p[0] * c - p[1] * s, y = p[0] * s + p[1] * c;
    return [p[2], vc + y, wc - x];
  };
};
const toothRing = () => {
  const pts = [], N = FEED.teeth, d = 2 * Math.PI / N;
  for (let k = 0; k < N; k++) {
    const t = k * d;
    const P = (r, a) => [r * Math.cos(t + a * d), r * Math.sin(t + a * d)];
    pts.push(P(FEED.root, 0), P(FEED.root + 3, 0.18), P(FEED.R, 0.5), P(FEED.R - 1.5, 0.62), P(FEED.root + 1, 0.74), P(FEED.root, 0.88));
  }
  return cw(pts);
};
let shaftMemo = null;
const shaftParts = () => {
  if (shaftMemo) return shaftMemo;
  const ring = toothRing(), out = [];
  const span = FEED.discs * FEED.disc + (FEED.discs - 1) * FEED.gap;
  for (let i = 0; i < FEED.discs; i++) {
    const z = -span / 2 + FEED.disc / 2 + i * (FEED.disc + FEED.gap);
    out.push({ faces: wound(prism(ring, FEED.disc, 1.4, 2, 1, () => false, [0, 0, z])), z, mat: "disc" });
    if (i < FEED.discs - 1) {
      const z1 = z + FEED.disc / 2 + FEED.gap / 2;
      out.push({ faces: wound(cylW(0, 0, FEED.spR, z1 - FEED.gap / 2 - 1, z1 + FEED.gap / 2 + 1, 18, 0, 1)), z: z1, mat: "spacer" });
    }
  }
  for (const sg of [-1, 1]) {
    const z0 = sg * (span / 2), z1 = sg * FEED.cheek.u0;
    out.push({ faces: wound(cylW(0, 0, FEED.spR, Math.min(z0, z1) - 1, Math.max(z0, z1) + 1, 18, 0, 1)), z: (z0 + z1) / 2, mat: "spacer" });
  }
  shaftMemo = out;
  return out;
};
let fixedMemo = null;
const fixedParts = () => {
  if (fixedMemo) return fixedMemo;
  const H = FEED.hood, C = FEED.cheek;
  const hood = wound(vprism(rrectPts(2 * H.u, H.w1 - H.w0, 10, 3, 0, (H.w0 + H.w1) / 2), TOP - H.h, TOP, 6, 0, 1));
  const cheeks = [-1, 1].map((sg) => wound(vprism(rrectPts(C.u1 - C.u0, 2 * C.w, 6, 2, sg * (C.u0 + C.u1) / 2, 0), TOP - C.h, TOP, 4, 0, 1)));
  const bosses = [-1, 1].map((sg) => wound([-1, 1].flatMap((sw) => xform(cylW(0, 0, 17, 0, 7, 22, 2, 2), (p) => [sg * (C.u1 + p[2]), FEED.vc + p[1], sw * FEED.wc - p[0] * sg]))));
  const lamp = wound([...cylW(0, FEED.lamp.v, FEED.lamp.r + 5, H.w1, H.w1 + 3, 24, 2, 2), ...cylW(0, FEED.lamp.v, FEED.lamp.r, H.w1 + 3, H.w1 + 7, 24, 3, 3)]);
  fixedMemo = { hood, cheeks, bosses, lamp };
  return fixedMemo;
};
const fillOf = (r, light, f) => rampAt(r, f.cap ? 0.62 * light + 0.06 : f.bev ? Math.min(1, 0.95 * light + 0.16) : 0.8 * light + 0.04);
const f2 = (v) => v.toFixed(2);
const nearSide = (map, rig) => worldView(rig, map([-FEED.cheek.u1, TOP, 0]))[2] > worldView(rig, map([FEED.cheek.u1, TOP, 0]))[2] ? -1 : 1;
const lipClip = (map, rig) => {
  const a = mapScr(map, rig, [-600, TOP, FEED.recess.w]), b = mapScr(map, rig, [600, TOP, FEED.recess.w]);
  return scrPath([a, b, [b[0], b[1] - 4e3], [a[0], a[1] - 4e3]]);
};
const Shaft = ({ map, rig, side, travel, clipId }) => {
  const a = side * travel / FEED.R, lin = onShaft(side * FEED.wc, FEED.vc, a);
  const sm = (q) => map(lin(q));
  const parts = shaftParts().map((p) => ({ p, d: worldView(rig, sm([0, 0, p.z]))[2] })).sort((x, y) => x.d - y.d);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("g", { clipPath: `url(#${clipId})`, children: parts.map(({ p }, i) => paintXf(p.faces, sm, rig, 0.7).map((dw, k) => {
    const c = fillOf(p.mat === "disc" ? SF_STEEL : SF_BODY, p.mat === "disc" ? dw.light : 0.7 * dw.light, dw.face);
    return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.5, strokeLinejoin: "round" }, `${i}_${k}`);
  })) });
};
const hexEnd = (map, rig, sg, sw, a) => {
  const u = sg * (FEED.cheek.u1 + 7.3);
  return mapPath(map, rig, Array.from({ length: 6 }, (_, i) => {
    const t = a + i / 6 * 2 * Math.PI;
    return [u, FEED.vc + 8 * Math.sin(t), sw * FEED.wc + 8 * Math.cos(t)];
  }));
};
const Cheek = ({ map, rig, sg, travel, outer }) => {
  const fx = fixedParts(), k = sg < 0 ? 0 : 1;
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const C = FEED.cheek, uc = sg * (C.u0 + C.u1) / 2, yT = TOP - C.h - 0.4;
  const screws = [-1, 1].map((sw) => ({ wc: sw * (C.w - 20), ring: Array.from({ length: 14 }, (_, i) => [uc + 7 * Math.cos(i / 14 * 2 * Math.PI), yT, sw * (C.w - 20) + 7 * Math.sin(i / 14 * 2 * Math.PI)]) }));
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
    paintXf(fx.cheeks[k], map, rig, 0.55).map((dw, i) => {
      const c = fillOf(SF_BODY, dw.light, dw.face);
      return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, `c${i}`);
    }),
    screws.map((s, i) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(s.ring), fill: rampAt(SF_STEEL, 0.55) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[uc - 5, yT - 0.5, s.wc], [uc + 5, yT - 0.5, s.wc]], false), stroke: "#000000", strokeWidth: 1.2, opacity: 0.55, fill: "none" })
    ] }, `s${i}`)),
    outer && paintXf(fx.bosses[k], map, rig, 0.7).map((dw, i) => {
      const c = fillOf(SF_STEEL, dw.light, dw.face);
      return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.5, strokeLinejoin: "round" }, `b${i}`);
    }),
    outer && [-1, 1].map((sw) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: hexEnd(map, rig, sg, sw, sw * travel / FEED.R), fill: rampAt(SF_STEEL, 0.35), stroke: rampAt(SF_STEEL, 0.9), strokeWidth: 0.8 }, `h${sw}`))
  ] });
};
export const LtFeedBack = ({ id, rig, pose, st }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const fx = fixedParts(), near = nearSide(map, rig);
  const ru = FEED.recess.u, rw = FEED.recess.w, yT = TOP - 0.4;
  const recess = P([[-ru, yT, -rw], [ru, yT, -rw], [ru, yT, rw], [-ru, yT, rw]]);
  const farWall = P([[-ru, yT, -rw], [ru, yT, -rw], [ru, yT + 60, -rw], [-ru, yT + 60, -rw]]);
  const fw0 = mapScr(map, rig, [0, yT, -rw]), fw1 = mapScr(map, rig, [0, yT + 60, -rw]);
  const thr = mapScr(map, rig, [0, TOP + 10, 0]), thrE = mapScr(map, rig, [ru, TOP + 10, 0]);
  const m = clamp01(st.motor), lp = clamp01(st.lamp);
  const lips = [P([[-ru, yT, -rw], [ru, yT, -rw]], false), P([[-ru, yT, rw], [ru, yT, rw]], false), P([[-ru, yT, -rw], [-ru, yT, rw]], false), P([[ru, yT, -rw], [ru, yT, rw]], false)];
  const H = FEED.hood, wF = H.w1 + 0.4;
  const slots = [];
  for (const sg of [-1, 1]) for (let i = 0; i < 7; i++) {
    const u = sg * (64 + i * 17);
    slots.push(P(rrectPts(7, 30, 3.5, 2, u, TOP - 54).map(([x, y]) => [x, y, wF])));
  }
  const border = P(rrectPts(2 * H.u - 22, H.h - 18, 6, 2, 0, TOP - H.h / 2).map(([x, y]) => [x, y, wF]));
  const lampC = mapScr(map, rig, [0, FEED.lamp.v, H.w1 + 7.2]);
  const hoodScrews = [-1, 1].map((sg) => Array.from({ length: 14 }, (_, i) => [sg * (H.u - 22) + 6 * Math.cos(i / 14 * 2 * Math.PI), TOP - H.h - 0.4, (H.w0 + H.w1) / 2 + 6 * Math.sin(i / 14 * 2 * Math.PI)]));
  const clip = lipClip(map, rig);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-object": "the safe's feed mouth", style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("defs", { children: [
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Fw`, gradientUnits: "userSpaceOnUse", x1: f2(fw0[0]), y1: f2(fw0[1]), x2: f2(fw1[0]), y2: f2(fw1[1]), children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: rampAt(SF_BODY, 0.42) }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: rampAt(SF_BODY, 0.1) }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: "#000000" })
      ] }),
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("radialGradient", { id: `${id}Th`, gradientUnits: "userSpaceOnUse", cx: f2(thr[0]), cy: f2(thr[1]), r: f2(Math.hypot(thrE[0] - thr[0], thrE[1] - thr[1])), gradientTransform: `translate(${f2(thr[0])} ${f2(thr[1])}) scale(1 0.32) translate(${f2(-thr[0])} ${f2(-thr[1])})`, children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: theme.accentBright }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.35", stopColor: theme.accent }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: theme.accent, stopOpacity: 0 })
      ] }),
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("radialGradient", { id: `${id}Lp`, cx: "0.5", cy: "0.5", r: "0.5", children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: theme.accentBright }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.4", stopColor: theme.accent, stopOpacity: 0.6 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: theme.accent, stopOpacity: 0 })
      ] }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("clipPath", { id: `${id}Rc`, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: recess }) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("clipPath", { id: `${id}Lc`, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: clip }) })
    ] }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: recess, fill: "#000000", opacity: 0.94 }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { clipPath: `url(#${id}Rc)`, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: farWall, fill: `url(#${id}Fw)` }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: recess, fill: `url(#${id}Th)`, opacity: 0.22 + 0.6 * m })
    ] }),
    lips.map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: "#ffffff", strokeWidth: k === 1 ? 1.4 : 0.9, opacity: k === 1 ? 0.4 : 0.2, fill: "none" }, `l${k}`)),
    paintXf(fx.hood, map, rig, 0.5).map((dw, k) => {
      const c = fillOf(SF_DOOR, dw.light, dw.face);
      return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, `h${k}`);
    }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: border, stroke: SF_GROOVE, strokeWidth: 2, opacity: 0.75, fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: border, stroke: SF_LIP, strokeWidth: 0.7, opacity: 0.3, fill: "none", transform: "translate(0.9 0.9)" }),
    slots.map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, fill: "#000000", opacity: 0.8, stroke: SF_LIP, strokeWidth: 0.5, strokeOpacity: 0.35 }, `v${k}`)),
    hoodScrews.map((s, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(s), fill: rampAt(SF_STEEL, 0.55) }, `hs${k}`)),
    paintXf(fx.lamp, map, rig, 0.8).map((dw, k) => {
      const lens = dw.face.mat === 3, c = lens ? dw.face.cap ? SF_GROOVE : rampAt(SF_STEEL, 0.3) : fillOf(SF_STEEL, dw.light, dw.face);
      return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.4 }, `lp${k}`);
    }),
    lp > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("circle", { cx: f2(lampC[0]), cy: f2(lampC[1]), r: f2(9.5), fill: theme.accentBright, opacity: 0.95 * lp }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("circle", { cx: f2(lampC[0]), cy: f2(lampC[1]), r: f2(74), fill: `url(#${id}Lp)`, opacity: 0.8 * lp })
    ] }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Cheek, { map, rig, sg: -near, travel: st.travel, outer: false }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Shaft, { map, rig, side: -1, travel: st.travel, clipId: `${id}Lc` })
  ] }) });
};
export const feedFlecks = (a, b, n, seed = 35) => {
  const r = seeded(seed);
  return Array.from({ length: n }, (_, i) => ({
    a: a + (i + 0.3 * r()) / n * (b - a),
    u: (r() * 2 - 1) * 108,
    vu: (r() * 2 - 1) * 2.4,
    vw: 4.2 + 1.8 * r(),
    vv: -(7 + 3 * r()),
    spin: (r() * 2 - 1) * 0.45,
    s: 12 + 7 * r(),
    tone: r()
  }));
};
const G = 1.05;
const fleckAt = (k, g) => {
  const t = g - k.a;
  if (t < 0) return null;
  const v0 = FEED_CROWN_V - 2, w0 = 34;
  const tl = (-k.vv + Math.sqrt(k.vv * k.vv + 2 * G * (TOP - v0))) / G;
  const tt = Math.min(t, tl);
  const u = k.u + k.vu * tt, w = w0 + k.vw * tt, v = Math.min(TOP - 0.6, v0 + k.vv * tt + 0.5 * G * tt * tt);
  const rest = t - tl;
  const op = clamp01(t / 3) * (rest > 0 ? 1 - clamp01((rest - 4) / 10) : 1);
  if (op <= 3e-3) return null;
  return { q: [u, v, w], ang: k.spin * tt, flat: rest > 0, op };
};
export const LtFeedFront = ({ id, rig, pose, st, flecks = [], g, stripGlow }) => {
  const map = (q) => xfApply(pose, q);
  const near = nearSide(map, rig), m = clamp01(st.motor);
  const clip = lipClip(map, rig);
  const mc = mapScr(map, rig, [0, FEED.vc - 10, 0]), me = mapScr(map, rig, [FEED.recess.u + 20, FEED.vc - 10, 0]);
  let glow = null;
  if (stripGlow && m > 3e-3) {
    const sg = stripGlow, S = (u, v) => mapScr((q) => xfApply(sg.x, q), rig, [u, v, sg.w]);
    const a = S(sg.u0, sg.v1), b = S(sg.u1, sg.v1), c = S(sg.u1, sg.v0), d = S(sg.u0, sg.v0);
    glow = /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Sg`, gradientUnits: "userSpaceOnUse", x1: f2(d[0]), y1: f2(d[1]), x2: f2(a[0]), y2: f2(a[1]), children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: theme.accent, stopOpacity: 0 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.75", stopColor: theme.accent, stopOpacity: 0.55 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: theme.accentBright, stopOpacity: 0.9 })
      ] }) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: scrPath([a, b, c, d]), fill: `url(#${id}Sg)`, opacity: 0.42 * m })
    ] });
  }
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-object": "the safe's feed mouth", style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("defs", { children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("clipPath", { id: `${id}Fc`, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: clip }) }),
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("radialGradient", { id: `${id}Bl`, cx: "0.5", cy: "0.5", r: "0.5", children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: theme.accentBright, stopOpacity: 0.9 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.45", stopColor: theme.accent, stopOpacity: 0.45 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: theme.accent, stopOpacity: 0 })
      ] })
    ] }),
    glow,
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Shaft, { map, rig, side: 1, travel: st.travel, clipId: `${id}Fc` }),
    m > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("ellipse", { cx: f2(mc[0]), cy: f2(mc[1]), rx: f2(Math.hypot(me[0] - mc[0], me[1] - mc[1])), ry: f2(0.3 * Math.hypot(me[0] - mc[0], me[1] - mc[1])), fill: `url(#${id}Bl)`, opacity: 0.38 * m }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Cheek, { map, rig, sg: near, travel: st.travel, outer: true }),
    flecks.map((k, i) => {
      const s = fleckAt(k, g);
      if (!s) return null;
      const c = Math.cos(s.ang), sn = Math.sin(s.ang), h = k.s / 2;
      const corner = (x, y) => s.flat ? [s.q[0] + x * c - y * sn, s.q[1] - 0.2, s.q[2] + x * sn + y * c] : [s.q[0] + x * c, s.q[1] + y * sn * 0.9, s.q[2] + y * c];
      const pts = [corner(-h, -0.7 * h), corner(h * 0.8, -0.6 * h), corner(h, 0.5 * h), corner(-0.7 * h, 0.7 * h)];
      return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath(map, rig, pts), fill: rampAt(TK_FACE, 0.45 + 0.4 * k.tone), stroke: rampAt(TK_FACE, 0.95), strokeWidth: 0.6, strokeOpacity: 0.6, opacity: s.op }, `f${i}`);
    })
  ] }) });
};
