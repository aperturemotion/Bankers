// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { alpha, clamp01, mixHex } from "./anim";
import { theme } from "./theme";
import { figure } from "./kit";
import { cw, cylW, prism } from "./solid_engine";
import { XPlane, mapPath, worldScr, worldView, wound, xfApply, xfMul, xfRotX, xfTrans } from "./tk_rig";
import { INK } from "./tk_mat";
import { alongU, boxMM, ink, lathe, moved, slab } from "./honest_solid";
import { HS_BELL, HS_DIAL, HS_DOOR, HS_FLAG_DK, HS_FLAG_LT, HS_GLASS, HS_GROOVE, HS_HANDS, HS_LIP, HS_STONE, HS_TRIM, HS_WALL } from "./honest_mat_b";
import { HG_GROOVE, HG_LIP, HG_ROOF, HG_STEP } from "./honest_mat_g";

export const HS_DIM = {
  fw: 640,
  fd: 370,
  ww: 600,
  wd: 330,
  wallTop: -262,
  eave: -276,
  ridge: -392,
  roofHalf: 318,
  eaveW: 183,
  flag: { u: -392, w: 212, top: -470 },
  top: -650
};
const WF = HS_DIM.wd / 2, WU = HS_DIM.ww / 2;
const ENT = { v0: -298, v1: -250, w1: 266 };
const M = { wall: 0, stone: 1, trim: 2, glass: 3, door: 4, bell: 5, roof: 6, step: 7, flagLt: 8, flagDk: 9, lamp: 10 };
const rampsOf = (glow) => {
  const lampR = HS_GLASS.map((c, i) => mixHex(c, i < 2 ? theme.accent : theme.accentBright, clamp01(glow) * (0.55 + 0.1 * i)));
  return [HS_WALL, HS_STONE, HS_TRIM, HS_GLASS, HS_DOOR, HS_BELL, HG_ROOF, HG_STEP, HS_FLAG_LT, HS_FLAG_DK, lampR];
};
const FRONT = { m: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, WF] };
const SIDE = { m: [0, 0, -1, 0, 1, 0, 1, 0, 0], t: [-WU, 0, 0] };
const onFac = (fac, faces) => moved(faces, fac);
const facP = (fac, a, v, c) => xfApply(fac, [a, v, c]);
const ROWS = [-100, -206];
export const HS_WINDOWS = [
  ...[-100, 0, 100].flatMap((a) => ROWS.map((v) => ({ fac: SIDE, a, v, w: 50, h: 70 }))),
  ...[-258, -196, 196, 258].flatMap((a) => ROWS.map((v) => ({ fac: FRONT, a, v, w: 44, h: 70 })))
];
const winTrim = (wn) => {
  const { a, v, w, h } = wn, t = 5, x0 = a - w / 2, x1 = a + w / 2, y0 = v - h / 2, y1 = v + h / 2;
  return onFac(wn.fac, [
    ...boxMM([x0 - t, y0 - t, 0], [x0, y1 + t, 3], M.trim, 3),
    ...boxMM([x1, y0 - t, 0], [x1 + t, y1 + t, 3], M.trim, 3),
    ...boxMM([x0, y0 - t, 0], [x1, y0, 3], M.trim, 3),
    ...boxMM([x0, y1, 0], [x1, y1 + t, 3], M.trim, 3),
    ...slab(a, y1 + t + 3, w + 18, 6, 10, 5, 1.2, M.trim, 3),
    // the sill
    ...slab(a, y0 - t - 5, w + 16, 10, 5, 2.5, 1, M.trim, 3),
    // the lintel
    ...slab(a, y0 - t - 6, 11, 14, 8, 4, 1, M.stone, 4)
    // its keystone
  ]);
};
let memo = null;
const vRoof = (w) => HS_DIM.ridge + Math.abs(w) * (HS_DIM.eave - HS_DIM.ridge) / HS_DIM.eaveW;
const parts = () => {
  if (memo) return memo;
  const { fw, fd, wallTop, eave, ridge, roofHalf, eaveW } = HS_DIM;
  const base = [...slab(0, -11, fw, 22, fd, 0, 3, M.stone, 0), ...boxMM([-WU, wallTop, -WF], [WU, -22, WF], M.wall, 0)];
  const quoins = [];
  for (let k = 0; k < 11; k++) {
    const y1 = -26 - k * 21, y0 = y1 - 19, q = k % 2 ? 22 : 32;
    quoins.push(...boxMM([-WU - 2, y0, WF - q], [-WU + q, y1, WF + 2], M.stone, 2), ...boxMM([WU - q, y0, WF - q], [WU + 2, y1, WF + 2], M.stone, 2));
  }
  const belt = [...boxMM([-WU - 3, -158, WF - 1], [WU + 3, -150, WF + 3], M.stone, 2), ...boxMM([-WU - 3, -158, -WF - 3], [-WU + 1, -150, WF + 3], M.stone, 2)];
  const door = onFac(FRONT, [
    ...boxMM([-36, -210, 0], [-29, -46, 4], M.trim, 3),
    ...boxMM([29, -210, 0], [36, -46, 4], M.trim, 3),
    ...boxMM([-36, -180, 0], [36, -174, 4], M.trim, 3),
    ...slab(0, -212, 13, 16, 9, 4.5, 1, M.stone, 4)
  ]);
  const spouts = [-1, 1].flatMap((s) => [...boxMM([s * (WU + 8) - 4, -268, WF - 4], [s * (WU + 8) + 4, -24, WF + 4], M.trim, 3)]);
  const trims = [...belt, ...quoins, ...HS_WINDOWS.flatMap(winTrim), ...door, ...spouts];
  const cornice = [
    ...slab(0, (eave + wallTop) / 2, 2 * WU + 26, wallTop - eave, 2 * WF + 26, 0, 3, M.stone, 0),
    ...boxMM([-roofHalf, eave - 4, WF + 14], [roofHalf, eave + 5, WF + 23], M.trim, 1)
  ];
  const tri = cw([[eave, eaveW], [ridge, 0], [eave, -eaveW]]);
  const roof = [...wound(alongU(prism(tri, 2 * roofHalf, 3, M.roof, 0))), ...boxMM([-roofHalf - 2, ridge - 7, -7], [roofHalf + 2, ridge + 3, 7], M.roof, 2)];
  const B = 52, TB = -452, vr = vRoof(B);
  const towerBase = wound([
    { pts: [[-B, TB, B], [B, TB, B], [B, vr, B], [-B, vr, B]], n: [0, 0, 1], pass: 0, mat: M.wall },
    { pts: [[-B, TB, -B], [-B, TB, B], [-B, vr, B], [-B, ridge, 0], [-B, vr, -B]], n: [-1, 0, 0], pass: 0, mat: M.wall },
    { pts: [[B, TB, B], [B, TB, -B], [B, vr, -B], [B, ridge, 0], [B, vr, B]], n: [1, 0, 0], pass: 0, mat: M.wall },
    ...[-1, 1].flatMap((s) => boxMM([s * B - 4, TB, B - 6], [s * B + 4, vr - 2, B + 3], M.stone, 1))
  ]);
  const deck = [...slab(0, TB - 5, 2 * B + 16, 10, 2 * B + 16, 0, 2, M.stone, 0)];
  const post = (su, sw) => boxMM([su * 46 - 6, -534, sw * 46 - 6], [su * 46 + 6, TB - 10, sw * 46 + 6], M.stone, 0);
  const rail = (sw) => boxMM([-40, -476, sw * 46 - 2.5], [40, -471, sw * 46 + 2.5], M.stone, 0);
  const sideRail = (su) => boxMM([su * 46 - 2.5, -476, -40], [su * 46 + 2.5, -471, 40], M.stone, 0);
  const postsBack = [...post(-1, -1), ...post(1, -1), ...rail(-1), ...sideRail(1)];
  const postsFront = [...post(-1, 1), ...post(1, 1), ...rail(1), ...sideRail(-1)];
  const yoke = boxMM([-40, -536, -5], [40, -528, 5], M.trim, 0);
  const bell = lathe(
    [[0, 0], [7, 0.6], [13, 2.6], [17.5, 7], [20, 14], [21.5, 23], [24, 32], [29, 40], [34, 46], [35.5, 49], [33, 50], [0, 47]],
    28,
    M.bell,
    0
  );
  const towerTop = [
    ...boxMM([-58, -546, -58], [58, -534, 58], M.stone, 0),
    ...slab(0, -549, 136, 6, 136, 0, 1.5, M.stone, 1),
    ...lathe([[0, -614], [96, -551]], 4, M.roof, 2, [0, 0, 0], Math.PI / 4),
    ...lathe([[0, -652], [1.5, -644], [2.5, -630], [6, -627], [8, -621], [7, -616], [3, -614], [0, -613]], 14, M.bell, 3)
  ];
  const steps = [1, 2, 3].flatMap((k) => [
    ...slab(0, -11.5 * k / 2, 264, 11.5 * k, 22 * (4 - k), 272 + 11 * (4 - k), 1.5, M.stone, 0),
    ...slab(0, -11.5 * k + 2, 266, 4, 4, 272 + 22 * (4 - k), 1.2, M.trim, 1)
  ]);
  const lamp = (s) => lathe(
    [
      [0, -160],
      [1.5, -158],
      [3, -153],
      [9, -147],
      [10.5, -145],
      [9, -143.5],
      [8, -142.5],
      [9.5, -136],
      [10, -130],
      [9, -124],
      [6, -120.5],
      [3.2, -119.5],
      [3.2, -66],
      [5.5, -63],
      [6.5, -59],
      [0, -59]
    ],
    14,
    M.trim,
    2,
    [s * 146, 0, 312],
    0,
    (k) => k >= 6 && k <= 10 ? M.lamp : M.trim
  );
  const cheeks = [-1, 1].flatMap((s) => [...slab(s * 146, -26, 24, 52, 66, 305, 2, M.step, 1), ...slab(s * 146, -55, 30, 6, 72, 305, 1.5, M.stone, 1)]);
  const porticoLow = [...slab(0, -34, 320, 24, 20, WF + 10, 2, M.stone, 0), ...slab(0, -23, 320, 46, 87, 228.5, 3, M.stone, 0), ...steps, ...cheeks, ...lamp(-1), ...lamp(1)];
  const column = (u) => [
    ...boxMM([u - 16, -52, 244 - 16], [u + 16, -46, 244 + 16], M.stone, 0),
    ...lathe([
      [0, -244],
      [14.5, -244],
      [14, -240],
      [12, -236],
      [11, -233],
      [11, -230],
      [11.6, -150],
      [12.4, -70],
      [12.5, -62],
      [14.5, -60],
      [15.5, -57],
      [14.5, -54.5],
      [16, -53],
      [16, -52],
      [0, -52]
    ], 20, M.stone, 0, [u, 0, 244]),
    ...boxMM([u - 17, -250, 244 - 17], [u + 17, -244, 244 + 17], M.stone, 1)
  ];
  const columns = [-118, -44, 44, 118].map(column);
  const pedTri = cw([[-170, -306], [0, -374], [170, -306]]);
  const porticoTop = [
    ...slab(0, (ENT.v0 + ENT.v1) / 2, 320, ENT.v1 - ENT.v0, ENT.w1 - WF, (ENT.w1 + WF) / 2, 3, M.stone, 0),
    ...slab(0, -302, 338, 8, ENT.w1 + 8 - WF, (ENT.w1 + 8 + WF) / 2, 2, M.stone, 1),
    ...wound(prism(pedTri, 274 - WF, 4, M.stone, 2, () => false, [0, 0, (274 + WF) / 2]))
  ];
  const clock = [...cylW(0, -333, 24, 274, 277, 32, M.bell, 0), ...cylW(0, -333, 20.5, 277, 279, 32, M.bell, 1)];
  const { u: fu, w: fwz } = HS_DIM.flag;
  const pole = [
    ...slab(fu, -6, 36, 12, 36, fwz, 2, M.step, 0),
    ...slab(fu, -16, 24, 8, 24, fwz, 1.5, M.stone, 1),
    ...lathe([[0, -476], [3, -476], [4.6, -20], [0, -20]], 12, M.trim, 2, [fu, 0, fwz]),
    ...lathe([[0, -492], [4, -491], [6.5, -487], [7, -483], [6, -479], [3, -476.5], [0, -476]], 14, M.bell, 3, [fu, 0, fwz])
  ];
  memo = {
    base: wound(base),
    trims: wound(trims),
    cornice: wound(cornice),
    roof,
    towerBase,
    deck: wound(deck),
    postsBack: wound(postsBack),
    postsFront: wound(postsFront),
    yoke: wound(yoke),
    bell,
    towerTop: wound(towerTop),
    porticoLow: wound(porticoLow),
    columns: columns.map(wound),
    porticoTop: wound(porticoTop),
    clock: wound(clock),
    pole: wound(pole)
  };
  return memo;
};
const FLAG = { L: 132, H: 80, top: HS_DIM.flag.top, cols: 14, rows: 13 };
const flagPt = (s, t, wind) => {
  const { u: fu, w: fw } = HS_DIM.flag, k = s / FLAG.L;
  const wave = (2 + 13 * Math.pow(k, 0.85)) * Math.sin(2 * Math.PI * (k * 1.25) - 0.17 * wind + 0.35 * (t / FLAG.H));
  return [fu - 5 - s * (1 - 0.04 * k), FLAG.top + t + 5 * k * k, fw + wave];
};
const flagFaces = (wind) => {
  const out = [];
  for (let r = 0; r < FLAG.rows; r++) for (let c = 0; c < FLAG.cols; c++) {
    const s0 = c / FLAG.cols * FLAG.L, s1 = (c + 1) / FLAG.cols * FLAG.L, t0 = r / FLAG.rows * FLAG.H, t1 = (r + 1) / FLAG.rows * FLAG.H;
    const canton = r < 7 && s1 <= 0.42 * FLAG.L + 1e-6;
    const mat = canton ? M.flagDk : r % 2 ? M.flagLt : M.flagDk;
    const q = [flagPt(s0, t0, wind), flagPt(s1, t0, wind), flagPt(s1, t1, wind), flagPt(s0, t1, wind)];
    out.push(...wound([{ pts: q, n: [0, 0, 1], pass: 0, mat }, { pts: [...q].reverse(), n: [0, 0, -1], pass: 0, mat }]));
  }
  return out;
};
const f2 = (v) => v.toFixed(2);
const Paths = ({ list }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: list.map((p) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: p.d, fill: p.c, stroke: p.c, strokeWidth: 0.6, strokeLinejoin: "round" }, p.key)) });
export const HsSchool = ({ id, rig, pose, lit = () => 0, glow = 0, bell = 0, clock = 0, wind = 0, prints = [], probe = "the schoolhouse" }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const p = parts(), R = rampsOf(glow);
  const I = (fs, key, spec = 0.55) => ink(rig, map, fs, R, spec, key);
  const brick = (fac, a0, a1) => {
    const d = [];
    for (let k = 0, v = -32; v > HS_DIM.wallTop + 4; k++, v -= 10) {
      if (v < -150 && v > -158) continue;
      d.push(P([facP(fac, a0, v, 0.3), facP(fac, a1, v, 0.3)], false));
      for (let a = a0 + (k % 2 ? 12 : 0) + 24; a < a1 - 4; a += 24) d.push(P([facP(fac, a, v, 0.3), facP(fac, a, v + 10, 0.3)], false));
    }
    return d.join("");
  };
  const fJoints = (() => {
    const d = [];
    for (let u = -300; u <= 300; u += 60) d.push(P([[u, -21, HS_DIM.fd / 2 + 0.3], [u, -1, HS_DIM.fd / 2 + 0.3]], false));
    for (let w = -150; w <= 150; w += 60) d.push(P([[-HS_DIM.fw / 2 - 0.3, -21, w], [-HS_DIM.fw / 2 - 0.3, -1, w]], false));
    return d.join("");
  })();
  const seams = (() => {
    const d = [];
    for (let u = -HS_DIM.roofHalf + 18; u < HS_DIM.roofHalf - 6; u += 24) d.push(P([[u, HS_DIM.ridge + 6, 8], [u, HS_DIM.eave - 1.5, HS_DIM.eaveW - 1]], false));
    return d.join("");
  })();
  const ring = (c, n = 28) => P(Array.from({ length: n }, (_, i) => c(i / n * 2 * Math.PI)));
  const ocL = -HS_DIM.roofHalf - 0.4, ocV = -312;
  const oculus = {
    o: ring((a) => [ocL, ocV + 17 * Math.sin(a), 17 * Math.cos(a)]),
    i: ring((a) => [ocL, ocV + 12.5 * Math.sin(a), 12.5 * Math.cos(a)]),
    l: [-8, -3, 2, 7].map((dv) => {
      const hw = Math.sqrt(Math.max(0, 12.5 * 12.5 - dv * dv));
      return P([[ocL, ocV + dv, -hw], [ocL, ocV + dv, hw]], false);
    }).join("")
  };
  const tvV = -410, tvW = 52.4;
  const tvent = {
    o: ring((a) => [15 * Math.cos(a), tvV + 15 * Math.sin(a), tvW]),
    i: ring((a) => [11 * Math.cos(a), tvV + 11 * Math.sin(a), tvW]),
    l: [-6, -2, 2, 6].map((dv) => {
      const hw = Math.sqrt(Math.max(0, 121 - dv * dv));
      return P([[-hw, tvV + dv, tvW], [hw, tvV + dv, tvW]], false);
    }).join("")
  };
  const glass = HS_WINDOWS.map((wn, i) => {
    const l = clamp01(lit(i)), { a, v, w, h } = wn, q = (x, y, c = 0.5) => facP(wn.fac, x, y, c);
    const pane = P([q(a - w / 2, v - h / 2), q(a + w / 2, v - h / 2), q(a + w / 2, v + h / 2), q(a - w / 2, v + h / 2)]);
    const halo = P([q(a - w / 2 - 16, v - h / 2 - 18, 0.35), q(a + w / 2 + 16, v - h / 2 - 18, 0.35), q(a + w / 2 + 16, v + h / 2 + 22, 0.35), q(a - w / 2 - 16, v + h / 2 + 22, 0.35)]);
    const mun = [P([q(a, v - h / 2, 0.8), q(a, v + h / 2, 0.8)], false), ...[-1 / 3, 1 / 3].map((k) => P([q(a - w / 2, v + k * h, 0.8), q(a + w / 2, v + k * h, 0.8)], false))].join("");
    const rail = P([q(a - w / 2, v, 0.9), q(a + w / 2, v, 0.9)], false);
    const streak = P([q(a - w / 2 + 5, v - h / 2 + 4, 0.7), q(a - w / 2 + 14, v - h / 2 + 4, 0.7), q(a - w / 2 + 5, v - h / 2 + 22, 0.7)]);
    return { l, pane, halo, mun, rail, streak };
  });
  const dq = (x, y, c = 0.4) => facP(FRONT, x, y, c);
  const leaves = P([dq(-29, -174), dq(29, -174), dq(29, -46), dq(-29, -46)]);
  const panels = [-1, 1].flatMap((s) => [[-166, -128], [-122, -92], [-86, -54]].map(([y0, y1]) => {
    const x0 = s < 0 ? -25 : 4, x1 = s < 0 ? -4 : 25;
    return P([dq(x0, y0, 0.6), dq(x1, y0, 0.6), dq(x1, y1, 0.6), dq(x0, y1, 0.6)]);
  }));
  const fan = P([...Array.from({ length: 17 }, (_, i) => {
    const a = Math.PI + i / 16 * Math.PI;
    return dq(28 * Math.cos(a), -180 + 28 * Math.sin(a), 0.5);
  })]);
  const fanMun = [0.2, 0.4, 0.6, 0.8].map((k) => {
    const a = Math.PI + k * Math.PI;
    return P([dq(0, -180, 0.8), dq(28 * Math.cos(a), -180 + 28 * Math.sin(a), 0.8)], false);
  }).join("") + P(Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI + i / 8 * Math.PI;
    return dq(11 * Math.cos(a), -180 + 11 * Math.sin(a), 0.8);
  }), false);
  const arch = P(Array.from({ length: 17 }, (_, i) => {
    const a = Math.PI + i / 16 * Math.PI;
    return dq(32 * Math.cos(a), -180 + 32 * Math.sin(a), 2);
  }), false);
  const CK = { v: -333, w: 279.4, r: 18.5 };
  const cq = (r, a) => [r * Math.sin(a), CK.v - r * Math.cos(a), CK.w];
  const dial = ring((a) => [CK.r * Math.cos(a), CK.v + CK.r * Math.sin(a), CK.w]);
  const ticks = Array.from({ length: 12 }, (_, i) => P([cq(CK.r - (i % 3 ? 3 : 5.5), i / 12 * 2 * Math.PI), cq(CK.r - 1, i / 12 * 2 * Math.PI)], false)).join("");
  const secs = 9 * 3600 + 8 * 60 + clock, aS = Math.floor(secs) % 60 / 60 * 2 * Math.PI, aM = secs / 60 % 60 / 60 * 2 * Math.PI, aH = secs / 3600 % 12 / 12 * 2 * Math.PI;
  const hands = { h: P([cq(-2.5, aH), cq(10, aH)], false), m: P([cq(-3, aM), cq(15.5, aM)], false), s: P([cq(-4, aS), cq(16, aS)], false) };
  const bellFaces = moved(p.bell, xfMul(xfTrans([0, -532, 0]), xfRotX(bell)));
  const tym = P([[-138, -310, 274.3], [0, -364, 274.3], [138, -310, 274.3]]);
  const cols = p.columns.map((fs, i) => ({ fs, i, z: worldView(rig, map([[-118, -44, 44, 118][i], -150, 244]))[2] }));
  const lampOn = clamp01(glow);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe-object": probe, style: { position: "absolute", inset: 0 }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(p.base, `${id}b`) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: fJoints, stroke: HS_GROOVE, strokeWidth: 1.6, opacity: 0.75, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: brick(FRONT, -WU + 1, WU - 1), stroke: HS_GROOVE, strokeWidth: 1.1, opacity: 0.6, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: brick(SIDE, -WF + 1, WF - 1), stroke: HS_GROOVE, strokeWidth: 1.1, opacity: 0.55, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: brick(FRONT, -WU + 1, WU - 1), stroke: HS_LIP, strokeWidth: 0.6, opacity: 0.12, fill: "none", transform: "translate(0.5 0.9)" }),
      glass.map((g, i) => g.l > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: g.halo, fill: theme.accent, opacity: 0.13 * g.l }, `h${i}`)),
      glass.map((g, i) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: g.pane, fill: mixHex(HS_GLASS[1], theme.accentBright, 0.88 * g.l), stroke: HS_GLASS[0], strokeWidth: 0.6 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: g.streak, fill: "#ffffff", opacity: 0.1 + 0.08 * (1 - g.l) }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: g.mun, stroke: mixHex(HS_TRIM[2], HS_TRIM[1], g.l), strokeWidth: 2.2, fill: "none" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: g.rail, stroke: mixHex(HS_TRIM[2], HS_TRIM[1], g.l), strokeWidth: 3.6, fill: "none" })
      ] }, `g${i}`)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: leaves, fill: HS_DOOR[2], stroke: HS_DOOR[0], strokeWidth: 0.8 }),
      panels.map((d, i) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, fill: "none", stroke: HS_GROOVE, strokeWidth: 1.8, opacity: 0.85 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, fill: "none", stroke: HS_LIP, strokeWidth: 0.7, opacity: 0.25, transform: "translate(0.6 1)" })
      ] }, `dp${i}`)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([dq(0, -174, 0.6), dq(0, -46, 0.6)], false), stroke: HS_GROOVE, strokeWidth: 1.6, opacity: 0.9, fill: "none" }),
      [-1, 1].map((s) => {
        const sp = worldScr(rig, map(dq(s * 6, -108, 2)));
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("circle", { cx: f2(sp[0]), cy: f2(sp[1]), r: 2.6, fill: HS_BELL[3] }, `kn${s}`);
      }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: fan, fill: mixHex(HS_GLASS[1], theme.accentBright, 0.85 * lampOn), stroke: HS_GLASS[0], strokeWidth: 0.6 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: fanMun, stroke: HS_TRIM[2], strokeWidth: 1.8, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: arch, stroke: HS_TRIM[3], strokeWidth: 5, fill: "none", opacity: 0.85 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(p.trims, `${id}t`) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(p.cornice, `${id}c`) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(p.roof, `${id}r`, 0.7) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: seams, stroke: HG_GROOVE, strokeWidth: 2, opacity: 0.7, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: seams, stroke: HG_LIP, strokeWidth: 0.8, opacity: 0.3, fill: "none", transform: "translate(1.2 0)" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: oculus.o, fill: HS_STONE[2] }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: oculus.i, fill: HS_GLASS[0] }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: oculus.l, stroke: HS_STONE[2], strokeWidth: 2, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(p.towerBase, `${id}tb`) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: tvent.o, fill: HS_STONE[2] }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: tvent.i, fill: HS_GLASS[0] }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: tvent.l, stroke: HS_STONE[2], strokeWidth: 2, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(p.deck, `${id}dk`) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(p.postsBack, `${id}pb`) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I([...p.yoke, ...bellFaces], `${id}bl`, 0.8) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(p.postsFront, `${id}pf`) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(p.towerTop, `${id}tt`, 0.7) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(p.porticoLow, `${id}pl`) }),
      lampOn > 3e-3 && [-1, 1].map((s) => {
        const sp = worldScr(rig, map([s * 146, -133, 312]));
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("circle", { cx: f2(sp[0]), cy: f2(sp[1]), r: 26, fill: theme.accent, opacity: 0.2 * lampOn }, `lg${s}`);
      }),
      cols.sort((a, b) => a.z - b.z).map((c) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(c.fs, `${id}co${c.i}`, 0.75) }, `co${c.i}`)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(p.porticoTop, `${id}pt`) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: tym, stroke: HS_GROOVE, strokeWidth: 2.2, opacity: 0.8, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: tym, stroke: HS_LIP, strokeWidth: 0.8, opacity: 0.3, fill: "none", transform: "translate(0.6 1.2)" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(p.clock, `${id}ck`, 0.8) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dial, fill: HS_DIAL, opacity: 0.92 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: ticks, stroke: HS_HANDS, strokeWidth: 1.3, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: hands.h, stroke: HS_HANDS, strokeWidth: 2.6, strokeLinecap: "round", fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: hands.m, stroke: HS_HANDS, strokeWidth: 1.8, strokeLinecap: "round", fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: hands.s, stroke: HS_GROOVE, strokeWidth: 0.8, strokeLinecap: "round", fill: "none", opacity: 0.8 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(p.pole, `${id}fp`, 0.8) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paths, { list: I(flagFaces(wind), `${id}fl`, 0.35) }),
      flagStars(rig, map, wind).map((s, i) => /* @__PURE__ */ (0,jsx_runtime.jsx)("circle", { cx: f2(s[0]), cy: f2(s[1]), r: 1.5, fill: HS_FLAG_LT[3], opacity: 0.85 }, `st${i}`))
    ] }),
    prints.map((pr) => /* @__PURE__ */ (0,jsx_runtime.jsx)(HsFrieze, { rig, pose, p: pr }, pr.key))
  ] });
};
const flagStars = (rig, map, wind) => {
  const out = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 6 - r % 2; c++) {
    const s = 6 + c * 9.2 + (r % 2 ? 4.6 : 0), t = 5 + r * 7.6;
    const q = flagPt(s, t, wind);
    out.push(worldScr(rig, map([q[0], q[1], q[2] + 0.6])));
  }
  return out;
};
const HsFrieze = ({ rig, pose, p }) => {
  const W = 300, H = 40, u0 = -W / 2, v0 = (ENT.v0 + ENT.v1) / 2 - H / 2, w = ENT.w1 + 0.4;
  const el = (c) => ({ ...figure(36, c), letterSpacing: 7 });
  const on = clamp01(p.on);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x: pose, u: u0, v: v0, w, width: W, height: H, probe: `the school's frieze ${p.key}`, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "relative", width: W, height: H }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: 3.5, width: W, textAlign: "center", ...el(HS_LIP), opacity: 0.12 }, children: p.text }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: 2, width: W, textAlign: "center", ...el(HS_GROOVE), opacity: 0.45 }, children: p.text })
    ] }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x: pose, u: u0, v: v0, w: w + 0.3, width: W, height: H, op: on, probe: `the school's frieze ${p.key}`, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "relative", width: W, height: H }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 20, top: -6, width: W - 40, height: H + 12, background: `radial-gradient(ellipse at 50% 50%, ${alpha(theme.accent, 0.42)} 0%, ${alpha(theme.accent, 0)} 70%)` } }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: 1, width: W, textAlign: "center", ...el(INK) }, children: p.text })
    ] }) })
  ] });
};
export const hsCasters = (pose) => {
  const box = (u, v0, w, du = 0, dw = 0) => {
    const o = [];
    for (const a of [-u + du, u + du]) for (const v of [v0, 0]) for (const c of [-w + dw, w + dw]) o.push(xfApply(pose, [a, v, c]));
    return o;
  };
  return [
    { corners: box(HS_DIM.fw / 2, HS_DIM.ridge, HS_DIM.fd / 2) },
    { corners: box(160, -46, 54, 0, 218) },
    { corners: box(5, -490, 5, HS_DIM.flag.u, HS_DIM.flag.w), k: 0.6 }
  ];
};
