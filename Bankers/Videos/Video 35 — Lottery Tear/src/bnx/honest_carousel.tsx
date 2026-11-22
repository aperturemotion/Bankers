// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { theme } from "./theme";
import { cw, prism } from "./solid_engine";
import { facingM, mapPath, worldScr, worldView, wound, xfApply, xfMul, xfRotY, xfRotZ, xfScale, xfTrans } from "./tk_rig";
import { ink, lathe, moved } from "./honest_solid";
import { HC_BULB, HC_HORSE, HC_PANEL, HC_POLE, HC_STRIPE, HS_GROOVE, HS_LIP, HS_TRIM } from "./honest_mat_b";
import { HG_BASE, HG_GROOVE } from "./honest_mat_g";

export const HC_DIM = { r: 154, top: -432, horseR: 94, canopy: -300, platform: -70 };
const M = { base: 0, trim: 1, horse: 2, pole: 3, panel: 4, stripe: 5, saddle: 6 };
const RAMPS = [HG_BASE, HS_TRIM, HC_HORSE, HC_POLE, HC_PANEL, HC_STRIPE, HC_PANEL];
const HORSE = [
  [28, -42],
  [34, -36],
  [48, -26],
  [51, -21],
  [48, -16],
  [38, -17],
  [31, -10],
  [33, 2],
  [40, 6],
  [47, 9],
  [45, 17],
  [46, 22],
  [41, 22],
  [40, 15],
  [40, 12],
  [30, 11],
  [24, 13],
  [-10, 13],
  [-14, 16],
  [-20, 26],
  [-17, 34],
  [-24, 35],
  [-28, 24],
  [-30, 14],
  [-34, 6],
  [-38, 4],
  [-48, 18],
  [-53, 12],
  [-47, -2],
  [-38, -7],
  [-30, -10],
  [-8, -9],
  [8, -12],
  [18, -26],
  [24, -38]
];
const SADDLE = [[-15, -11.5], [-6, -12.5], [6, -14.5], [11, -12], [10, -2], [-14, -1]];
const MANE = [[9, -13], [17, -27], [23, -40], [27, -41], [25, -33], [20, -22], [13, -11]];
const HK = 0.82, HT = 14;
const sc = (p) => cw(p.map(([u, v]) => [u * HK, v * HK]));
let memo = null;
const banded = (r, v0, v1, step) => {
  const prof = [[0, v0]];
  for (let v = v0; v < v1 - 1e-6; v += step) prof.push([r, v]);
  prof.push([r, v1], [0, v1]);
  return prof;
};
const parts = () => {
  if (memo) return memo;
  const base = lathe([
    [0, -56],
    [136, -56],
    [141, -54.5],
    [144.5, -50.5],
    [143, -46.5],
    [139.5, -44],
    [139.5, -16],
    [143.5, -13],
    [148, -8.5],
    [150.5, -4],
    [150.5, 0],
    [0, 0]
  ], 56, M.base, 0, [0, 0, 0], 0, (k) => [1, 2, 3, 6, 7, 8].includes(k) ? M.trim : M.base);
  const key = lathe([[0, 0], [5.5, 0], [5.5, 3], [3.4, 5], [3.4, 17], [5, 19], [0, 19]], 12, M.trim, 0);
  const wings = wound(prism(cw([[-4, 18], [4, 18], [15, 21], [19, 27], [15, 34], [5, 31.5], [0, 30.5], [-5, 31.5], [-15, 34], [-19, 27], [-15, 21]]), 3.2, 0.8, M.trim, 1));
  const platform = lathe(
    [[0, -70], [123, -70], [127.5, -68.5], [129.5, -65], [128, -60], [122, -57], [0, -57]],
    56,
    M.base,
    0,
    [0, 0, 0],
    0,
    (k) => k >= 1 && k <= 3 ? M.trim : M.base
  );
  const column = [
    ...lathe(banded(14, -300, -70, 23), 16, M.pole, 0, [0, 0, 0], 0, (k) => k % 2 ? M.pole : M.trim),
    ...lathe(
      [[0, -282], [46, -282], [47, -278], [42, -275], [42, -199], [47, -196], [46, -192], [0, -192]],
      12,
      M.panel,
      1,
      [0, 0, 0],
      Math.PI / 12,
      (k, j) => k === 3 ? j % 2 ? M.panel : M.stripe : M.trim
    )
  ];
  const horse = wound([
    ...prism(sc(HORSE), HT, 2.4, M.horse, 0),
    ...prism(sc(SADDLE), HT + 4, 1.2, M.saddle, 2),
    ...prism(sc(MANE), HT + 2, 1, M.stripe, 2)
  ]);
  const canopy = [
    ...lathe(
      [[0, -388], [18, -383], [152, -321], [155, -318], [155, -295], [151, -293], [16, -300], [0, -300]],
      24,
      M.stripe,
      0,
      [0, 0, 0],
      0,
      (k, j) => k === 1 ? j % 2 ? M.stripe : M.base : M.trim
    ),
    ...lathe([[0, -434], [1.8, -424], [3, -409], [8.5, -404], [10.5, -397.5], [8.5, -391], [4, -388.5], [0, -388]], 14, M.trim, 1)
  ];
  memo = { base, key, wings, platform, column, horse, canopy };
  return memo;
};
const N_HORSE = 6, KEY_TH = 52;
const f2 = (v) => v.toFixed(2);
const Paths = ({ list }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: list.map((p) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: p.d, fill: p.c, stroke: p.c, strokeWidth: 0.5, strokeLinejoin: "round" }, p.key)) });
const horseXf = (k, turn) => {
  const a = -turn + k * (360 / N_HORSE), ar = a * Math.PI / 180;
  const bob = 13 * Math.sin(3 * turn * Math.PI / 180 + k * Math.PI);
  const x = xfMul(xfTrans([HC_DIM.horseR * Math.cos(ar), -150 + bob, HC_DIM.horseR * Math.sin(ar)]), xfRotY(90 - a));
  return { x, a: ar, bob };
};
export const HcCarousel = ({ id, rig, pose, turn, lights = 0, probe = "the carousel music box" }) => {
  const map = (q) => xfApply(pose, q);
  const p = parts();
  const I = (fs, key, spec = 0.6) => ink(rig, map, fs, RAMPS, spec, key);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const spin = (q, deg = turn) => {
    const a = -deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return [q[0] * c - q[2] * s, q[1], q[0] * s + q[2] * c];
  };
  const turned = (fs) => moved(fs, xfRotY(turn));
  const L = clamp01(lights);
  const reeds = [];
  for (let i = 0; i < 90; i++) {
    const t = i / 90 * 2 * Math.PI, n = [Math.cos(t), 0, Math.sin(t)];
    if (facingM(map, rig, n, [139.5 * n[0], -30, 139.5 * n[2]]) < 0.12) continue;
    reeds.push(P([[139.8 * n[0], -41.5, 139.8 * n[2]], [139.8 * n[0], -18.5, 139.8 * n[2]]], false));
  }
  const kt = KEY_TH * Math.PI / 180;
  const keyAt = xfMul(xfTrans([139.5 * Math.cos(kt), -30, 139.5 * Math.sin(kt)]), xfMul(xfRotY(-KEY_TH), xfRotZ(-90)));
  const keyFaces = [...moved(p.key, keyAt), ...moved(p.wings, xfMul(keyAt, xfRotY(-1.6 * turn)))];
  const bulbs = [];
  const chase = (i, n) => {
    const s = clamp01(L * 1.25 - i / n * 0.25);
    const tw = 0.82 + 0.18 * Math.cos(turn * 6 * Math.PI / 180 - i / n * 2 * Math.PI * 3);
    return s * (L > 0.98 ? tw : 1);
  };
  for (let i = 0; i < 24; i++) {
    const t = (i + 0.5) / 24 * 2 * Math.PI;
    bulbs.push({ q: spin([130.2 * Math.cos(t), -64, 130.2 * Math.sin(t)]), n: spin([Math.cos(t), 0, Math.sin(t)]), on: chase(i, 24), r: 3.6 });
    bulbs.push({ q: spin([155.6 * Math.cos(t), -306.5, 155.6 * Math.sin(t)]), n: spin([Math.cos(t), 0, Math.sin(t)]), on: chase((i + 7) % 24, 24), r: 4.2 });
  }
  for (let i = 0; i < 12; i++) {
    const t = i / 12 * 2 * Math.PI, r = 98, v = -383 + (r - 18) * 62 / 134;
    bulbs.push({ q: spin([r * Math.cos(t), v - 1.2, r * Math.sin(t)]), n: spin([0.42 * Math.cos(t), -0.9, 0.42 * Math.sin(t)]), on: chase(i * 2, 24), r: 3.6 });
  }
  const seen = bulbs.filter((b) => facingM(map, rig, b.n, b.q) > 0.08).map((b) => ({ ...b, s: worldScr(rig, map(b.q)), k: rig.persp / Math.max(1, rig.persp - worldView(rig, map(b.q))[2]) * Math.hypot(...pose.m.slice(0, 3)) }));
  const bulbSvg = (list, key) => list.map((b, i) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
    b.on > 0.01 && /* @__PURE__ */ (0,jsx_runtime.jsx)("circle", { cx: f2(b.s[0]), cy: f2(b.s[1]), r: f2(b.r * b.k * 3.4), fill: theme.accent, opacity: 0.3 * b.on }),
    b.on > 0.01 && /* @__PURE__ */ (0,jsx_runtime.jsx)("circle", { cx: f2(b.s[0]), cy: f2(b.s[1]), r: f2(b.r * b.k * 1.9), fill: theme.accentBright, opacity: 0.45 * b.on }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("circle", { cx: f2(b.s[0]), cy: f2(b.s[1]), r: f2(b.r * b.k * (1 + 0.15 * b.on)), fill: mixHex(HC_BULB, mixHex(theme.accentBright, "#ffffff", 0.5), b.on) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("circle", { cx: f2(b.s[0] - b.r * b.k * 0.3), cy: f2(b.s[1] - b.r * b.k * 0.35), r: f2(b.r * b.k * 0.35), fill: "#ffffff", opacity: 0.25 + 0.6 * b.on })
  ] }, `${key}${i}`));
  const rimB = seen.filter((b) => b.q[1] > -100), topB = seen.filter((b) => b.q[1] <= -100);
  const hem = [];
  for (let j = 0; j < 24; j++) {
    const t0 = j / 24 * 2 * Math.PI, t1 = (j + 1) / 24 * 2 * Math.PI, tm = (t0 + t1) / 2;
    const nm = spin([Math.cos(tm), 0, Math.sin(tm)]);
    if (facingM(map, rig, nm, spin([155 * Math.cos(tm), -293, 155 * Math.sin(tm)])) < 0.05) continue;
    const pts = Array.from({ length: 9 }, (_, i) => {
      const s = i / 8, t = t0 + (t1 - t0) * s;
      return spin([155.3 * Math.cos(t), -294 + 9 * Math.sin(Math.PI * s), 155.3 * Math.sin(t)]);
    });
    hem.push(P(pts));
  }
  const deck = [];
  for (const r of [28, 112]) deck.push(P(Array.from({ length: 48 }, (_, i) => spin([r * Math.cos(i / 48 * 2 * Math.PI), -70.3, r * Math.sin(i / 48 * 2 * Math.PI)]))));
  for (let i = 0; i < 24; i++) {
    const t = i / 24 * 2 * Math.PI;
    deck.push(P([spin([28 * Math.cos(t), -70.3, 28 * Math.sin(t)]), spin([112 * Math.cos(t), -70.3, 112 * Math.sin(t)])], false));
  }
  const items = Array.from({ length: N_HORSE }, (_, k) => {
    const h = horseXf(k, turn), c = [h.x.t[0], h.x.t[1], h.x.t[2]];
    const top = -150 + h.bob - 15 * HK, bot = -150 + h.bob + 13 * HK;
    const poleFaces = [
      ...lathe(banded(3, HC_DIM.canopy, top, 13), 10, M.pole, 0, [c[0], 0, c[2]], 0, (q) => q % 2 ? M.pole : M.trim),
      ...lathe(banded(3, bot, HC_DIM.platform, 13), 10, M.pole, 0, [c[0], 0, c[2]], 0, (q) => q % 2 ? M.pole : M.trim)
    ];
    const horse = moved(p.horse, h.x);
    const side = facingM(map, rig, [Math.cos(h.a), 0, Math.sin(h.a)], c) > 0 ? 1 : -1;
    const hp = (u, v) => xfApply(h.x, [u * HK, v * HK, side * (HT / 2 + 0.4)]);
    const rein = P([hp(46, -19), hp(36, -24), hp(22, -18), hp(6, -13)], false);
    const eye = worldScr(rig, map(hp(38, -29)));
    return { z: worldView(rig, map(c))[2], horse, poleFaces, rein, eye, k };
  });
  const colZ = worldView(rig, map([0, -150, 0]))[2];
  const glowC = worldScr(rig, map([0, -190, 0])), glowF = worldScr(rig, map([0, 0, 0])), sk = Math.hypot(...pose.m.slice(0, 3));
  const drawItem = (it) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(it.poleFaces, `${id}p${it.k}`, 0.9) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(it.horse, `${id}h${it.k}`, 0.7) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: it.rein, stroke: HS_LIP, strokeWidth: 1.1, opacity: 0.6, fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("circle", { cx: f2(it.eye[0]), cy: f2(it.eye[1]), r: 1.6, fill: HS_GROOVE })
  ] }, `it${it.k}`);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-object": probe, style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("radialGradient", { id: `${id}G`, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: theme.accentBright, stopOpacity: 0.55 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: theme.accent, stopOpacity: 0.22 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: theme.accent, stopOpacity: 0 })
    ] }) }),
    L > 0.01 && /* @__PURE__ */ (0,jsx_runtime.jsx)("ellipse", { cx: f2(glowF[0]), cy: f2(glowF[1]), rx: f2(250 * sk), ry: f2(70 * sk), fill: `url(#${id}G)`, opacity: 0.5 * L }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(p.base, `${id}b`) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: reeds.join(""), stroke: HG_GROOVE, strokeWidth: 1.4, opacity: 0.7, fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(keyFaces, `${id}k`, 0.9) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(turned(p.platform), `${id}pl`) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: deck.join(""), stroke: HG_GROOVE, strokeWidth: 1.5, opacity: 0.75, fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: deck.join(""), stroke: HS_LIP, strokeWidth: 0.6, opacity: 0.18, fill: "none", transform: "translate(0.6 1)" }),
    bulbSvg(rimB, `${id}rb`),
    L > 0.01 && /* @__PURE__ */ (0,jsx_runtime.jsx)("ellipse", { cx: f2(glowC[0]), cy: f2(glowC[1]), rx: f2(150 * sk), ry: f2(120 * sk), fill: `url(#${id}G)`, opacity: 0.45 * L }),
    items.filter((it) => it.z < colZ).sort((a, b) => a.z - b.z).map(drawItem),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(turned(p.column), `${id}c`, 0.85) }),
    items.filter((it) => it.z >= colZ).sort((a, b) => a.z - b.z).map(drawItem),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(turned(p.canopy), `${id}cn`, 0.7) }),
    hem.map((d, i) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, fill: HS_TRIM[2], stroke: HS_TRIM[1], strokeWidth: 0.6 }, `hm${i}`)),
    bulbSvg(topB, `${id}tb`)
  ] }) });
};
export const hcCasters = (pose) => {
  const o = [];
  for (let i = 0; i < 8; i++) {
    const t = i / 8 * 2 * Math.PI;
    for (const v of [HC_DIM.canopy - 40, 0]) o.push(xfApply(pose, [HC_DIM.r * Math.cos(t), v, HC_DIM.r * Math.sin(t)]));
  }
  return [{ corners: o, k: 0.8 }];
};
export const hcPose = (x, y, z, k) => xfMul(xfTrans([x, y, z]), xfScale(k));
