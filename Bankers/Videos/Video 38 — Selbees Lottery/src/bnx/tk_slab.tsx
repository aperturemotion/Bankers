// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { theme } from "./theme";
import { LOSS, seeded } from "./common";
import { KEPT_SHARE, SALES_2024_B } from "./data_lt";
import { figure, label } from "./kit";
import { cylW, lightOf, prism, rampAt } from "./solid_engine";
import { XPlane, facingM, mapPath, mapScr, normalM, paintXf, reflectStudio, worldScr, worldView, wound, xfAbout, xfApply, xfMul, xfPose, xfRotX, xfRotY, xfTrans } from "./tk_rig";
import { TK_BAND, TK_BODY, TK_FACE, TK_FIG_DROP, TK_FIG_INK, TK_GROOVE, TK_INK_BLUE, TK_LIP, TK_TORN } from "./tk_mat";
import { TkFacePrint, TkNumbers, tkCutPrint, tkPrintGeo } from "./tk_print";

const TK_SCALE = 8;
export const TK_W = SALES_2024_B * TK_SCALE;
export const TK_H = 1040;
export const TK_D = 54;
const BEV = 7, CORNER = 16;
const PAPER_L = 0.74;
export const TK_PERF = TK_W * (0.5 - KEPT_SHARE);
export const TK_MAIN_U = [-TK_W / 2, TK_PERF];
export const TK_STRIP_U = [TK_PERF, TK_W / 2];
const tkWidthOf = (b) => b * TK_SCALE;
export const TK_FLOOR_Y = 1300;
if (Math.abs((TK_STRIP_U[1] - TK_STRIP_U[0]) / TK_W - KEPT_SHARE) > 1e-9) throw new Error("tk_slab: the strip must be exactly KEPT_SHARE of the width");
const TK_INTACT = { front: 0, peel: 0, flex: 0 };
export const TK_TORN_FULL = { front: 1, peel: 0, flex: 0, release: 1 };
export const tkCentre = (part) => part === "main" ? [(TK_MAIN_U[0] + TK_MAIN_U[1]) / 2, -TK_H / 2, 0] : part === "strip" ? [(TK_STRIP_U[0] + TK_STRIP_U[1]) / 2, -TK_H / 2, 0] : [0, -TK_H / 2, 0];
export const tkRig = (o = {}) => ({ cx: o.cx ?? 540, cy: TK_FLOOR_Y - (o.eye ?? 1300), persp: o.lens ?? 3600, yaw: o.yaw ?? 16, pitch: o.pitch ?? 2 });
export const tkPose = (x, z, o = {}) => xfPose(x, o.y ?? TK_FLOOR_Y, z, o.k ?? 1, o.yaw ?? 0, o.pitch ?? 0, o.roll ?? 0);
const HOLE_R = 6;
const holesOf = (lod) => {
  const pitch = lod === "hi" ? 26 : 52, n = Math.floor((TK_H - 40) / pitch) + 1, v0 = -TK_H / 2 - (n - 1) * pitch / 2;
  return Array.from({ length: n }, (_, k) => v0 + k * pitch);
};
const PEEL = { door: 34, curl: 9, gap: 24, lift: 18, reach: 300 };
const frontV = (tr) => -TK_H + clamp01(tr.front) * TK_H;
export const tkPeelXf = (v, tr) => {
  let x = xfAbout(xfRotY(tr.flex), [TK_PERF, 0, 0]);
  const fv = frontV(tr);
  const s = fv - v + 3e3 * clamp01(tr.release ?? 0);
  if (s > 0 && tr.peel > 0) {
    const a = tr.peel * (1 - Math.exp(-s / PEEL.reach));
    const door = xfAbout(xfRotY(-PEEL.door * a), [TK_PERF, 0, -TK_D / 2]);
    const curl = xfAbout(xfRotX(-PEEL.curl * a), [0, Math.min(fv, 0), -TK_D / 2]);
    x = xfMul(xfTrans([PEEL.gap * a, 0, PEEL.lift * a]), xfMul(curl, xfMul(door, x)));
  }
  return x;
};
export const tkReleaseXf = (tr) => tkPeelXf(-TK_H / 2, { ...tr, release: 1 });
const bridgeJag = (k, lod) => {
  const rnd = seeded(7919 * (k + 3) + (lod === "hi" ? 1 : 2));
  const n = lod === "hi" ? 4 : 2;
  return Array.from({ length: n }, (_, i) => ({ f: (i + 0.5 + (rnd() - 0.5) * 0.5) / n, du: (rnd() - 0.5) * 9 + (i % 2 ? 1.6 : -1.6) }));
};
const boundary = (side, tr, lod) => {
  const hv = holesOf(lod), fv = frontV(tr), torn01 = (v) => clamp01((fv - v) / 26 + 0.5) * (tr.front > 0 ? 1 : 0);
  const pts = [[TK_PERF, -TK_H]], torn = [torn01(-TK_H)];
  const bridge = (k, a, b) => {
    const t = torn01((a + b) / 2);
    for (const j of bridgeJag(k, lod)) {
      pts.push([TK_PERF + j.du * t, a + (b - a) * j.f]);
      torn.push(t);
    }
  };
  let prev = -TK_H;
  hv.forEach((vk, k) => {
    bridge(k, prev, vk - HOLE_R);
    for (let i = 0; i <= 6; i++) {
      const a = -Math.PI / 2 + i / 6 * Math.PI;
      pts.push([TK_PERF + side * HOLE_R * Math.cos(a), vk + HOLE_R * Math.sin(a)]);
      torn.push(-1);
    }
    prev = vk + HOLE_R;
  });
  bridge(hv.length, prev, 0);
  pts.push([TK_PERF, 0]);
  torn.push(torn01(0));
  return { pts, torn };
};
const seg = (a, b, step) => {
  const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)), out = [];
  for (let i = 1; i <= n; i++) out.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]);
  return out;
};
const arc = (c, r, a0, a1, n = 4) => Array.from({ length: n }, (_, i) => {
  const a = a0 + (a1 - a0) * (i + 1) / n;
  return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
});
const outlineOf = (piece, tr, lod) => {
  const step = lod === "hi" ? 26 : 60, H = TK_H, R = CORNER, L = -TK_W / 2, Rt = TK_W / 2, P = TK_PERF;
  const pts = [];
  const cut = [];
  const push = (q, isCut) => {
    for (const p of q) {
      pts.push(p);
      cut.push(isCut);
    }
  };
  if (piece === "main") {
    const b2 = boundary(-1, tr, lod);
    pts.push([L, -H + R]);
    cut.push(false);
    push(arc([L + R, -H + R], R, Math.PI, 1.5 * Math.PI), false);
    push(seg([L + R, -H], [P, -H], step), true);
    push(b2.pts.slice(1), true);
    cut[cut.length - 1] = false;
    push(seg([P, 0], [L + R, 0], step), false);
    push(arc([L + R, -R], R, 0.5 * Math.PI, Math.PI), false);
    push(seg([L, -R], [L, -H + R], step).slice(0, -1), false);
    for (let i = 0; i < pts.length; i++) if (pts[i][1] <= -H + 1e-6 && i + 1 < pts.length && pts[i + 1][1] <= -H + 1e-6) cut[i] = false;
    return { pts, cut, torn: b2.torn };
  }
  const b = boundary(1, tr, lod);
  push([[P, -H]], false);
  push(seg([P, -H], [Rt - R, -H], step), false);
  push(arc([Rt - R, -H + R], R, -0.5 * Math.PI, 0), false);
  push(seg([Rt, -H + R], [Rt, -R], step), false);
  push(arc([Rt - R, -R], R, 0, 0.5 * Math.PI), false);
  push(seg([Rt - R, 0], [P, 0], step), false);
  cut[cut.length - 1] = true;
  push(b.pts.slice(1, -1).reverse(), true);
  return { pts, cut, torn: [...b.torn].slice(1, -1).reverse() };
};
const geoMemo = /* @__PURE__ */ new Map();
const cutOutline = (pts, cut, cutV) => {
  const op = [], oc = [];
  const n = pts.length, inn = (p) => p[1] <= cutV;
  for (let i = 0; i < n; i++) {
    const P = pts[i], Q = pts[(i + 1) % n], f = cut[i];
    const I = () => {
      const k = (cutV - P[1]) / (Q[1] - P[1]);
      return [P[0] + (Q[0] - P[0]) * k, cutV];
    };
    if (inn(P)) {
      op.push(P);
      oc.push(f);
      if (!inn(Q)) {
        op.push(I());
        oc.push(true);
      }
    } else if (inn(Q)) {
      op.push(I());
      oc.push(f);
    }
  }
  return { pts: op, cut: oc };
};
const pieceGeo = (piece, tr, lod, cutV = 0) => {
  const key = `${piece}|${lod}|${Math.round(clamp01(tr.front) * 2e3)}|${tr.front > 0 ? 1 : 0}|${Math.round(cutV * 4)}`;
  const hit = geoMemo.get(key);
  if (hit) return hit;
  const o0 = outlineOf(piece, tr, lod), o = cutV < -0.5 ? cutOutline(o0.pts, o0.cut, cutV) : o0;
  const faces = wound(prism(o.pts, TK_D, BEV, piece === "main" ? 0 : 1, 1, (i) => o.cut[i]));
  const g = { faces, outline: o.pts, cut: o.cut };
  if (geoMemo.size > 400) geoMemo.clear();
  geoMemo.set(key, g);
  return g;
};
const UC_M = (TK_MAIN_U[0] + TK_MAIN_U[1]) / 2, UC_S = (TK_STRIP_U[0] + TK_STRIP_U[1]) / 2;
const ZF = TK_D / 2;
export const TK_ROWS = {
  sub: { u: UC_M, v: -866, w: 470 },
  fig: { u: UC_M, v: -786, w: 470 },
  sfig: { u: UC_S, v: -612, w: 236 },
  slab: { u: UC_S, v: -514, w: 236 }
};
const rosette = (c, R, n = 9) => [0, 1, 2].map((j) => Array.from({ length: 145 }, (_, i) => {
  const t = i / 144 * 2 * Math.PI, r = R * (0.62 + 0.32 * Math.cos(n * t + j * 0.7)) * (0.92 + 0.08 * Math.cos(3 * t + j));
  return [c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)];
}));
const rr = (u0, v0, u1, v1, r) => {
  const out = [];
  const c = (cx, cy, a0) => {
    for (let i = 0; i <= 4; i++) {
      const a = a0 + i / 4 * (Math.PI / 2);
      out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  c(u1 - r, v0 + r, -Math.PI / 2);
  c(u1 - r, v1 - r, 0);
  c(u0 + r, v1 - r, Math.PI / 2);
  c(u0 + r, v0 + r, Math.PI);
  return out;
};
const f2 = (v) => v.toFixed(2);
const P3 = (p, w = ZF + 0.3) => [p[0], p[1], w];
const Piece = ({ piece, id, rig, map, tr, lod, glow, red, lit, fill, dim, shine, sheen, cutV = 0, blank, zoneOff }) => {
  const geo = pieceGeo(piece, tr, lod, cutV);
  const hi = lod === "hi";
  const drawn = paintXf(geo.faces, map, rig, 0.55);
  const [u0, u1] = piece === "main" ? TK_MAIN_U : TK_STRIP_U, uc = (u0 + u1) / 2;
  const front = facingM(map, rig, [0, 0, 1], [uc, -TK_H / 2, ZF]) > 0;
  const back = !front;
  const N = 9, stops = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1), v = -TK_H + 30 + t * (TK_H - 60);
    const nv = normalM(map, rig, [0, 0, 1], [uc, v, ZF]), vp = worldView(rig, map([uc - (u1 - u0) * 0.2, v, ZF]));
    const l = PAPER_L + 0.42 * (lightOf(nv, 0) - 0.55) - 0.09 * t + 0.05 * reflectStudio(nv, vp, rig.persp, 0.5) + 0.2 * shine;
    stops.push({ t, c: rampAt(TK_FACE, l * (1 - 0.45 * dim)) });
  }
  const ga = mapScr(map, rig, [uc, -TK_H + 30, ZF]), gb = mapScr(map, rig, [uc, -30, ZF]);
  const pa = mapScr(map, rig, [uc, -TK_H / 2 - 50, ZF]), pb = mapScr(map, rig, [uc, -TK_H / 2 + 50, ZF]);
  const px = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) / 100;
  const isCap = (dw) => dw.face.cap && dw.face.n[2] > 0.5;
  const fillOf = (dw) => {
    const f = dw.face;
    if (f.cap && f.n[2] > 0.5) return `url(#${id}Lf)`;
    if (f.cap) return rampAt(TK_BODY, (0.5 * dw.light + 0.06) * (1 - 0.4 * dim));
    if (f.cut) {
      const hole = isHoleWall(f, lod);
      const c = rampAt(TK_TORN, (0.7 * dw.light + 0.08) * (1 - 0.4 * dim));
      return hole ? mixHex(c, theme.accentBright, 0.42 * glow) : c;
    }
    if (f.bev) return rampAt(TK_BODY, Math.min(1, (0.95 * dw.light + 0.18 * clamp01((dw.light - 0.35) * 3)) * (1 - 0.4 * dim)));
    return rampAt(TK_BODY, (0.8 * dw.light + 0.05) * (1 - 0.4 * dim));
  };
  const cap = drawn.find(isCap);
  const body = drawn.filter((dw) => dw !== cap);
  const pg0 = tkPrintGeo(piece, lod, u0, u1, TK_H, TK_PERF, blank);
  const pg = cutV >= -0.5 ? pg0 : tkCutPrint(pg0, cutV);
  const RH = 3;
  const rings = piece === "main" && front && hi ? pg.circles.map((c, k) => {
    const { u, v, ro, ri } = c;
    const walls = paintXf(ringWalls(u, v, ro, RH), map, rig, 0.6);
    const circ = (r, w, n = 30) => Array.from({ length: n }, (_, i) => [u + r * Math.cos(i / n * 2 * Math.PI), v + r * Math.sin(i / n * 2 * Math.PI), w]);
    const top = `${mapPath(map, rig, circ(ro, ZF + RH))} ${mapPath(map, rig, circ(ri, ZF + RH))}`;
    const a = mapScr(map, rig, [u - ro, v - ro, ZF + RH]), b = mapScr(map, rig, [u + ro, v + ro, ZF + RH]);
    const arcP = (r, t0, t1, w) => mapPath(map, rig, Array.from({ length: 9 }, (_, i) => {
      const t = Math.PI * (t0 + (t1 - t0) * i / 8);
      return [u + r * Math.cos(t), v + r * Math.sin(t), w];
    }), false);
    return {
      k,
      c,
      walls,
      top,
      face: mapPath(map, rig, circ(ri, ZF + 1.2)),
      a,
      b,
      mid: mapPath(map, rig, circ((ro + ri) / 2, ZF + RH + 0.15), true),
      rimLit: arcP(ro - 0.6, 1, 1.55, ZF + RH + 0.2),
      inShade: arcP(ri + 0.4, 1, 1.6, ZF + RH),
      inLit: arcP(ri + 0.4, 0, 0.6, ZF + RH)
    };
  }) : [];
  const ob = { pts: geo.outline, cut: geo.cut };
  const edgeRuns = [];
  {
    let run = [];
    for (let i = 0; i < ob.pts.length; i++) {
      if (ob.cut[i]) {
        if (!run.length) run.push(P3(ob.pts[i], ZF + 0.2));
        run.push(P3(ob.pts[(i + 1) % ob.pts.length], ZF + 0.2));
      } else if (run.length) {
        edgeRuns.push(run);
        run = [];
      }
    }
    if (run.length) edgeRuns.push(run);
  }
  const fv = frontV(tr);
  const tornRuns = tr.front > 0 ? edgeRuns.map((r) => r.filter((p) => p[1] < fv + 8 && (cutV >= -0.5 || p[1] < cutV - 0.5))).filter((r) => r.length > 1) : [];
  const fibres = [];
  if (hi && tr.front > 0) {
    const rnd = seeded(piece === "main" ? 5 : 6), side = piece === "main" ? 1 : -1;
    for (let v = -TK_H + 4; v < Math.min(-2, fv, cutV < -0.5 ? cutV - 4 : 0); v += 5.5) {
      const near = holesOf(lod).some((h) => Math.abs(h - v) < HOLE_R + 1);
      if (near || rnd() < 0.35) continue;
      const len = 2 + rnd() * 5, du = (rnd() - 0.5) * 6;
      fibres.push(mapPath(map, rig, [[TK_PERF + du * 0.3, v, ZF + 0.4], [TK_PERF + du * 0.3 + side * len, v + (rnd() - 0.5) * 3, ZF + 0.4]], false));
    }
  }
  const fillOn = fill > 2e-3;
  const vF = -TK_H * clamp01(fill);
  const fq = mapPath(map, rig, [[u0 + 4, vF, ZF + 0.5], [u1 - 4, vF, ZF + 0.5], [u1 - 4, -4, ZF + 0.5], [u0 + 4, -4, ZF + 0.5]]);
  const fa = mapScr(map, rig, [uc, vF, ZF]), fb = mapScr(map, rig, [uc, 0, ZF]);
  const bandU = u0 + (u1 - u0) * 0.25 + sheen;
  const bv = Math.min(-14, cutV - 4), bk = (bv + TK_H) / (TK_H - 28);
  const band = mapPath(map, rig, [[bandU - 40, -TK_H + 14, ZF + 0.2], [bandU + 150, -TK_H + 14, ZF + 0.2], [bandU + 150 - 60 * bk, bv, ZF + 0.2], [bandU - 40 - 60 * bk, bv, ZF + 0.2]]);
  const bx = mapScr(map, rig, [bandU - 70, -TK_H / 2, ZF]), bx2 = mapScr(map, rig, [bandU + 150, -TK_H / 2, ZF]);
  const backG = back && cutV >= -0.5 ? [
    mapPath(map, rig, rr(u0 + 22, -TK_H + 22, u1 - 22, -22, 12).map((p) => [p[0], p[1], -ZF - 0.3])),
    ...rosette([uc, -TK_H / 2], Math.min(110, (u1 - u0) / 2 - 40), 12).map((c) => mapPath(map, rig, c.map((p) => [p[0], p[1], -ZF - 0.3])))
  ] : [];
  const faceAt = (l) => rampAt(TK_FACE, (l + 0.2 * shine) * (1 - 0.45 * dim));
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("defs", { children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("linearGradient", { id: `${id}Lf`, gradientUnits: "userSpaceOnUse", x1: f2(ga[0]), y1: f2(ga[1]), x2: f2(gb[0]), y2: f2(gb[1]), children: stops.map((s) => /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: s.t, stopColor: s.c }, s.t)) }),
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Bd`, gradientUnits: "userSpaceOnUse", x1: f2(bx[0]), y1: f2(bx[1]), x2: f2(bx2[0]), y2: f2(bx2[1]), children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: "#ffffff", stopOpacity: 0 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: "#ffffff", stopOpacity: 0.035 + 0.04 * shine }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: "#ffffff", stopOpacity: 0 })
      ] }),
      rings.length > 0 && rings.map((r) => /* @__PURE__ */ (0,jsx_runtime.jsx)("linearGradient", { id: `${id}R${r.k}`, gradientUnits: "userSpaceOnUse", x1: f2(r.a[0]), y1: f2(r.a[1]), x2: f2(r.b[0]), y2: f2(r.b[1]), children: r.c.bonus ? /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: mixHex(TK_BAND[4], "#000000", 0.35 * dim) }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: mixHex(TK_BAND[3], "#000000", 0.35 * dim) }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: mixHex(TK_BAND[1], "#000000", 0.35 * dim) })
      ] }) : /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: faceAt(PAPER_L + 0.2) }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: faceAt(PAPER_L - 0.02) }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: faceAt(PAPER_L - 0.2) })
      ] }) }, r.k)),
      fillOn && /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Fi`, gradientUnits: "userSpaceOnUse", x1: f2(fa[0]), y1: f2(fa[1]), x2: f2(fb[0]), y2: f2(fb[1]), children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: theme.accentBright, stopOpacity: 0.7 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.06", stopColor: theme.accent, stopOpacity: 0.6 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: theme.accent, stopOpacity: 0.44 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: theme.accent, stopOpacity: 0.34 })
      ] })
    ] }),
    body.map((dw, k) => {
      const c = fillOf(dw);
      return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
    }),
    cap && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: cap.d, fill: `url(#${id}Lf)`, stroke: stops[4].c, strokeWidth: 0.5, strokeLinejoin: "round" }),
    back && backG.map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, fill: "none", stroke: k ? TK_LIP : TK_GROOVE, strokeWidth: k ? 0.8 : 2.2, opacity: k ? 0.22 : 0.7 }, `bk${k}`)),
    front && /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)(TkFacePrint, { id: `${id}P`, rig, map, geo: pg, z: ZF + 0.3, px, dim, shine, zoneOff }),
      cap && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: band, fill: `url(#${id}Bd)` }),
      rings.map((r) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        r.walls.map((dw, j) => {
          const c = r.c.bonus ? rampAt(TK_BAND, 0.25 + 0.6 * dw.light) : faceAt(PAPER_L - 0.3 + 0.5 * (dw.light - 0.45));
          return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: mixHex(c, "#000000", r.c.bonus ? 0.35 * dim : 0), stroke: c, strokeWidth: 0.4 }, j);
        }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: r.face, fill: r.c.bonus ? mixHex(TK_BAND[3], "#000000", 0.35 * dim) : faceAt(PAPER_L + 0.04 - 0.08 * ((r.c.v + TK_H) / TK_H)) }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: r.top, fill: `url(#${id}R${r.k})`, fillRule: "evenodd" }),
        !r.c.bonus && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: r.mid, stroke: mixHex(TK_INK_BLUE, "#000000", 0.35 * dim), strokeWidth: 2.2 * px, opacity: 0.85, fill: "none" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: r.inShade, stroke: "#000000", strokeWidth: 1.6 * px, opacity: r.c.bonus ? 0.35 : 0.16, fill: "none", strokeLinecap: "round" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: r.inLit, stroke: "#ffffff", strokeWidth: 1 * px, opacity: 0.5, fill: "none", strokeLinecap: "round" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: r.rimLit, stroke: "#ffffff", strokeWidth: 1.2 * px, opacity: r.c.bonus ? 0.7 : 0.8, fill: "none", strokeLinecap: "round" })
      ] }, `rg${r.k}`)),
      rings.length > 0 && /* @__PURE__ */ (0,jsx_runtime.jsx)(TkNumbers, { rig, map, circles: pg.circles, z: ZF + 1.5, px, dim }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath(map, rig, [[u0 + (piece === "main" ? CORNER : 2), -TK_H + 0.6, ZF + 0.3], [u1 - (piece === "strip" ? CORNER : 2), -TK_H + 0.6, ZF + 0.3]], false), stroke: "#ffffff", strokeWidth: 1.4, opacity: 0.4 * (1 - 0.5 * dim) + 0.3 * shine, fill: "none" }),
      piece === "main" && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath(map, rig, [[u0 + 0.6, -TK_H + CORNER, ZF + 0.3], [u0 + 0.6, -CORNER, ZF + 0.3]], false), stroke: "#ffffff", strokeWidth: 1.2, opacity: 0.3 * (1 - 0.5 * dim), fill: "none" }),
      fibres.map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: faceAt(0.95), strokeWidth: 0.9, opacity: 0.75, fill: "none", strokeLinecap: "round" }, `fb${k}`)),
      tornRuns.map((r, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath(map, rig, r, false), stroke: faceAt(1), strokeWidth: 1.3, opacity: 0.7, fill: "none", strokeLinejoin: "round" }, `tl${k}`)),
      glow > 3e-3 && edgeRuns.map((r, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath(map, rig, r, false), stroke: theme.accent, strokeWidth: 22, opacity: 0.1 * glow, fill: "none", strokeLinejoin: "round" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath(map, rig, r, false), stroke: theme.accent, strokeWidth: 8, opacity: 0.22 * glow, fill: "none", strokeLinejoin: "round" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath(map, rig, r, false), stroke: theme.accentBright, strokeWidth: 1.6, opacity: 0.5 * glow, fill: "none", strokeLinejoin: "round" })
      ] }, `pg${k}`)),
      lit > 3e-3 && tornRuns.map((r, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath(map, rig, r, false), stroke: theme.accent, strokeWidth: 9, opacity: 0.22 * lit, fill: "none", strokeLinejoin: "round" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath(map, rig, r, false), stroke: theme.accentBright, strokeWidth: 2, opacity: 0.9 * lit, fill: "none", strokeLinejoin: "round" })
      ] }, `lt${k}`)),
      red > 3e-3 && tornRuns.map((r, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath(map, rig, r, false), stroke: LOSS, strokeWidth: 9, opacity: 0.22 * red, fill: "none", strokeLinejoin: "round" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath(map, rig, r, false), stroke: mixHex(LOSS, "#ffffff", 0.18), strokeWidth: 2.2, opacity: 0.95 * red, fill: "none", strokeLinejoin: "round" })
      ] }, `rd${k}`)),
      fillOn && /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: fq, fill: `url(#${id}Fi)` }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath(map, rig, [[u0 + 4, vF, ZF + 0.6], [u1 - 4, vF, ZF + 0.6]], false), stroke: theme.accentBright, strokeWidth: 3, opacity: 0.9, fill: "none" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: mapPath(map, rig, [[u0 + 4, vF, ZF + 0.6], [u1 - 4, vF, ZF + 0.6]], false), stroke: theme.accentBright, strokeWidth: 14, opacity: 0.18, fill: "none" })
      ] })
    ] }),
    dim > 3e-3 && cap && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: cap.d, fill: "#000000", opacity: 0.18 * dim })
  ] });
};
const isHoleWall = (f, lod) => {
  const [u, v] = f.pts[0];
  return holesOf(lod).some((h) => Math.abs(Math.hypot(u - TK_PERF, v - h) - HOLE_R) < 0.6 && Math.abs(v - h) < HOLE_R - 0.2);
};
const ringMemo = /* @__PURE__ */ new Map();
const ringWalls = (u, v, ro, h) => {
  const key = `${u}|${v}|${ro}|${h}`;
  const hit = ringMemo.get(key);
  if (hit) return hit;
  const f = wound(cylW(u, v, ro, ZF, ZF + h, 30, 0, 5).filter((x) => !x.cap));
  ringMemo.set(key, f);
  return f;
};
const Print = ({ rig, x, p }) => {
  const row = TK_ROWS[p.row], fig = p.row === "fig" || p.row === "sfig";
  const H = fig ? 110 : 44, W = row.w, u = row.u - W / 2;
  const v = (p.center && p.row === "fig" ? (-TK_H + 146 - 724) / 2 : row.v) - H / 2;
  const on = clamp01(p.on);
  if (on <= 3e-3) return null;
  const k = p.grow ? 0.94 + 0.06 * (1 - (1 - on) * (1 - on)) : 1;
  const sc = k !== 1 ? { transform: `scale(${k.toFixed(4)})`, transformOrigin: "50% 50%" } : {};
  const el = (c) => fig ? figure(104, c) : { ...label(p.row === "sub" ? 28 : 27, c), transform: p.row === "sub" ? "scale(1.36)" : void 0 };
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x, u, v, w: ZF + 0.5, width: W, height: H, op: on, probe: `the ticket's print ${p.key}`, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "relative", width: W, height: H, ...sc }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: fig ? 3 : 1.5, top: fig ? 4.5 : 4.5, width: W, textAlign: "center", ...el(TK_FIG_DROP), opacity: 0.9 }, children: p.text }) }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x, u, v, w: ZF + 0.7, width: W, height: H, op: on, probe: `the ticket's print ${p.key}`, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "relative", width: W, height: H, ...sc }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: fig ? 1 : 3, width: W, textAlign: "center", ...el(fig ? TK_FIG_INK : TK_INK_BLUE) }, children: p.text }) }) })
  ] });
};
const PerfLight = ({ rig, pose, glow, tr }) => {
  if (glow <= 3e-3) return null;
  const map = (q) => xfApply(pose, q);
  const top = -TK_H + 14, bot = -14;
  const d = mapPath(map, rig, [[TK_PERF, top, -TK_D / 2 - 2], [TK_PERF, bot, -TK_D / 2 - 2]], false);
  const open = clamp01(tr.front * 3) * clamp01(tr.peel * 2);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { "data-probe": "bg", children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: theme.accent, strokeWidth: 46 + 30 * open, opacity: 0.1 * glow, fill: "none", strokeLinecap: "butt" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: theme.accent, strokeWidth: 20 + 16 * open, opacity: 0.3 * glow, fill: "none", strokeLinecap: "butt" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: theme.accentBright, strokeWidth: 8 + 6 * open, opacity: 0.85 * glow, fill: "none", strokeLinecap: "round" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: "#ffffff", strokeWidth: 2.5, opacity: 0.7 * glow, fill: "none", strokeLinecap: "round" })
  ] });
};
const TkSlab = ({
  id,
  rig,
  pose,
  part,
  tear = TK_INTACT,
  stripXf,
  prints = [],
  glow = 0,
  red = 0,
  lit = 0,
  fill = 0,
  dim = 0,
  shine = 0,
  sheen = 0,
  lod = "hi",
  clip,
  cutV,
  probe = "the ticket slab",
  blank = false
}) => {
  const mainMap = (q) => xfApply(pose, q);
  const rowXf = (v) => stripXf ?? xfMul(pose, tkPeelXf(v, tear));
  const stripMap = stripXf ? (q) => xfApply(stripXf, q) : (q) => xfApply(pose, xfApply(tkPeelXf(q[1], tear), q));
  const showMain = part !== "strip", showStrip = part !== "main";
  const dMain = worldView(rig, mainMap(tkCentre("main")))[2], dStrip = worldView(rig, stripMap(tkCentre("strip")))[2];
  const stripFirst = showMain && showStrip && dStrip < dMain - 4;
  const cl = clip && clip.length > 0;
  const mainPrints = prints.filter((p) => p.row === "fig" || p.row === "sub");
  const stripPrints = prints.filter((p) => p.row === "sfig" || p.row === "slab");
  const zoneM = Math.max(0, ...mainPrints.map((p) => clamp01(p.on))), zoneS = Math.max(0, ...stripPrints.map((p) => clamp01(p.on)));
  const svgOf = (which) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    cl && /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsx)("clipPath", { id: `${id}Cl${which}`, children: clip.map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, clipRule: "evenodd" }, k)) }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("g", { clipPath: cl ? `url(#${id}Cl${which})` : void 0, children: which === "main" ? /* @__PURE__ */ (0,jsx_runtime.jsx)(Piece, { piece: "main", id: `${id}M`, rig, map: mainMap, tr: tear, lod, glow, red: 0, lit, fill, dim, shine, sheen, blank, zoneOff: zoneM }) : /* @__PURE__ */ (0,jsx_runtime.jsx)(Piece, { piece: "strip", id: `${id}S`, rig, map: stripMap, tr: tear, lod, glow, red, lit: 0, fill, dim, shine, sheen, cutV, blank, zoneOff: zoneS }) })
  ] }, which);
  const mainEls = showMain ? [svgOf("main"), ...mainPrints.map((p) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Print, { rig, x: pose, p }, p.key))] : [];
  const stripEls = showStrip ? [svgOf("strip"), ...stripPrints.map((p) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Print, { rig, x: rowXf(TK_ROWS[p.row].v), p }, p.key))] : [];
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe-object": probe || void 0, style: { position: "absolute", inset: 0 }, children: [
    showMain && glow > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(PerfLight, { rig, pose, glow, tr: tear }) }),
    stripFirst ? /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
      stripEls,
      mainEls
    ] }) : /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
      mainEls,
      stripEls
    ] })
  ] });
};
export const TkWhole = (p) => /* @__PURE__ */ (0,jsx_runtime.jsx)(TkSlab, { ...p, part: "whole" });
export const TkMain = (p) => /* @__PURE__ */ (0,jsx_runtime.jsx)(TkSlab, { ...p, part: "main" });
export const TkStrip = (p) => /* @__PURE__ */ (0,jsx_runtime.jsx)(TkSlab, { ...p, part: "strip" });
export const tkAt = (rig, x, q) => worldScr(rig, xfApply(x, q));
const tkPerfTop = (rig, pose) => tkAt(rig, pose, [TK_PERF, -TK_H + 4, ZF]);
export const tkCorners = (x, part) => {
  const [u0, u1] = part === "main" ? TK_MAIN_U : part === "strip" ? TK_STRIP_U : [-TK_W / 2, TK_W / 2];
  const out = [];
  for (const u of [u0, u1]) for (const v of [-TK_H, 0]) for (const w of [-ZF, ZF]) out.push(xfApply(x, [u, v, w]));
  return out;
};
const tkFaceRect = (rig, x, part) => {
  const p = tkCorners(x, part).map((q) => worldScr(rig, q));
  return { x0: Math.min(...p.map((q) => q[0])), x1: Math.max(...p.map((q) => q[0])), y0: Math.min(...p.map((q) => q[1])), y1: Math.max(...p.map((q) => q[1])) };
};
