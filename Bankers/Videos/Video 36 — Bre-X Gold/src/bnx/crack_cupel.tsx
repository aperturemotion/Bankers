// @ts-nocheck
// ★ V36 "Bre-X Gold" — crack helper (builder M, rev 1): THE FIRE-ASSAY CUPEL. How an assayer weighs the gold in a rock sample:
//   the crushed sample is fused with lead, the lead button is melted down in a CUPEL — a small, thick cup of pressed bone ash — and
//   the lead soaks into the cup, leaving only the precious metal as one bead in its dish. Here: a bone-ash cupel (a squat turned
//   cup, its flat rim, a shallow dish stained by the lead it absorbed, a porous matte surface) on a heavy steel assay plate, and in
//   the dish a single pinhead bead of gold — all there is. Lit by the one key light (solid_engine lightOf), the house's materials:
//   the plate V35's graphite (counter_mat), the cupel a pale bone-white from the house's steel-white ramp, the bead bx_gold.
//   LOCAL FRAME: the cupel's foot centre at the origin (on the plate's top), y DOWN.
//   <Cupel id rig xf glint /> the cup and its bead (an SVG <g>); <AssayPlate id rig xf /> the plate; CUP / PLATE its sizes;
//   cupelPoint(xf, which) → "bead" | "rim" | "foot" a world point.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { seeded } from "./common";
import { lightOf, rampAt } from "./solid_engine";
import { reflectStudio, unit3, worldScr, worldView, xfApply } from "./tk_rig";
import { BX_GOLD } from "./bx_gold";
import { PL_PLATE } from "./counter_mat";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
// bone ash: a pale, faintly cool white (the house's steel-white ramp, a hair warmer), matte
const ASH = ["#4E5661", "#8B949F", "#BFC5CC", "#E4E7EA", "#FBFBFA"];
export const CUP = { r: 112, h: 92, rim: 86, dish: 22, bead: 3.8 };
const DISH_Y = -CUP.h + CUP.dish;
// the bone ash's pores and the lead stain: seeded on the rim, the wall and the dish
const PORES = (() => {
  const rnd = seeded(907);
  return Array.from({ length: 420 }, () => {
    const a = rnd() * 2 * Math.PI, k = rnd();
    // 0: wall, 1: rim, 2: dish
    const zone = k < 0.45 ? 0 : k < 0.7 ? 1 : 2;
    let r, y;
    if (zone === 0) {
      y = -8 - rnd() * (CUP.h - 22);
      r = CUP.r - 2 + 0.6;
    } else if (zone === 1) {
      r = CUP.rim + 3 + rnd() * (CUP.r - 16 - CUP.rim);
      y = -CUP.h - 0.5;
    } else {
      r = CUP.rim * Math.sqrt(rnd()) * 0.95;
      const R = (CUP.rim * CUP.rim + CUP.dish * CUP.dish) / (2 * CUP.dish), cy = -CUP.h + CUP.dish - R;
      y = cy + Math.sqrt(R * R - r * r) - 0.4;
    }
    return { a, r, y, s: 0.6 + 1.4 * rnd(), zone, dark: rnd() < 0.7 };
  });
})();
// a horizontal circle of radius rr at height y, projected (64 points): an exact ellipse under the perspective
const circ = (rig, map, rr, y, n = 64) => Array.from({ length: n }, (_, i) => worldScr(rig, map([rr * Math.cos(i / n * 2 * Math.PI), y, rr * Math.sin(i / n * 2 * Math.PI)])));
const pd = (pts, close = true) => `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}${close ? "Z" : ""}`;
const dishY = (r) => {
  const R = (CUP.rim * CUP.rim + CUP.dish * CUP.dish) / (2 * CUP.dish), cy = -CUP.h + CUP.dish - R;
  return cy + Math.sqrt(R * R - r * r);
};
/** the cupel and its bead — see the top of this file. Drawn as exact projected outlines (the wall, the rim's flat ring, the dish),
 *  each with a gradient sampled from the key light, so the matte bone ash reads smooth (a loft's strips showed as a grid on it) */
export const Cupel = ({ id, rig, xf, glint = 0, sparkle = 0 }) => {
  const map = (q) => xfApply(xf, q);
  const P = (q) => worldScr(rig, map(q));
  const k = rig.persp / Math.max(1, rig.persp - worldView(rig, map([0, DISH_Y, 0]))[2]);
  const vn = (n, q) => unit3(sub(worldView(rig, map([q[0] + n[0], q[1] + n[1], q[2] + n[2]])), worldView(rig, map(q))));
  const L = (n, q) => {
    const v = vn(n, q), c = worldView(rig, map(q));
    return 0.06 + 0.86 * lightOf(v, 0.08, 10) + 0.06 * reflectStudio(v, c, rig.persp, 0.5);
  };
  const ash = (l) => rampAt(ASH, Math.max(0.08, Math.min(0.97, 0.06 + 0.92 * l)));
  // the outlines: the foot, the wall's top (just under the rounded rim), the rim's outer and inner edges
  const R0 = CUP.r - 1, RT = CUP.r - 4, yT = -CUP.h + 6;
  const foot = circ(rig, map, R0, -2), wallTop = circ(rig, map, RT, yT), rimO = circ(rig, map, CUP.r - 10, -CUP.h), rimI = circ(rig, map, CUP.rim, -CUP.h);
  // the wall's silhouette: the front half of the foot and of the wall top, joined at their extreme left / right points
  const ext = (pts) => {
    let l = 0, r = 0;
    pts.forEach((p, i) => {
      if (p[0] < pts[l][0]) l = i;
      if (p[0] > pts[r][0]) r = i;
    });
    return [l, r];
  };
  // the half of a projected circle nearer the lens (larger screen y), from its left extreme to its right extreme
  const frontArc = (pts) => {
    const [l, r] = ext(pts), n = pts.length, a = [], b = [];
    for (let i = l; i !== r; i = (i + 1) % n) a.push(pts[i]);
    a.push(pts[r]);
    for (let i = r; i !== l; i = (i + 1) % n) b.push(pts[i]);
    b.push(pts[l]);
    const my = (q) => q.reduce((s, p) => s + p[1], 0) / q.length;
    return my(a) > my(b) ? a : [...b].reverse();
  };
  const fF = frontArc(foot), fT = frontArc(wallTop);
  const wallD = pd([...fF, ...[...fT].reverse()]);
  // the wall's light across its width: sampled at the front half's angles
  const [fl, fr] = ext(foot);
  const wallStops = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8, a = Math.PI * (0.05 + 0.9 * t);
    // the angle along the front from the left extreme to the right: the front faces the lens (+z after the rig's yaw)
    const ang = Math.atan2(1, 0) + Math.PI - a;
    const n = [Math.cos(ang), 0, Math.sin(ang)];
    const q = [RT * n[0], -CUP.h * 0.5, RT * n[2]];
    return { t, x: P(q)[0], c: ash(L(n, q)) };
  });
  const xs = wallStops.map((w) => w.x), x0 = Math.min(...xs), x1 = Math.max(...xs);
  // the rounded rim: the band between the wall top and the rim's outer edge (a torus' quarter), lit from above-left
  const rimBand = pd([...wallTop]) + pd([...rimO].reverse());
  const rimFlat = pd(rimO) + pd([...rimI].reverse());
  const rimL = L([0, -1, 0], [0, -CUP.h, 0]);
  // the dish: the inner ellipse; its shading: the far inner wall faces the lens and the key (lit), the near one is in its shadow
  const dishFar = L(unit3([0, -1, 0.35]), [0, dishY(CUP.rim * 0.6), -CUP.rim * 0.6]), dishNear = L(unit3([0, -1, -0.35]), [0, dishY(CUP.rim * 0.6), CUP.rim * 0.6]);
  const rimIc = rimI.reduce((s, p) => [s[0] + p[0] / rimI.length, s[1] + p[1] / rimI.length], [0, 0]);
  const rimIh = Math.max(...rimI.map((p) => p[1])) - Math.min(...rimI.map((p) => p[1]));
  // pores: only where the surface faces the lens
  const pores = [[], []];
  for (const q of PORES) {
    const c = Math.cos(q.a), sn = Math.sin(q.a);
    const pos = [q.r * c, q.y, q.r * sn];
    const n = q.zone === 0 ? [c, -0.05, sn] : [0, -1, 0];
    const v = vn(n, pos), w = worldView(rig, map(pos));
    if (dot(v, unit3([-w[0], -w[1], rig.persp - w[2]])) < 0.15) continue;
    if (q.zone === 0 && (q.y < yT + 2 || q.y > -4)) continue;
    const sp = P(pos);
    pores[q.dark ? 0 : 1].push(`M${f2(sp[0] - q.s * k * 0.6)},${f2(sp[1])}a${f2(q.s * k * 0.6)},${f2(q.s * k * 0.4)} 0 1 0 ${f2(q.s * k * 1.2)},0a${f2(q.s * k * 0.6)},${f2(q.s * k * 0.4)} 0 1 0 ${f2(-q.s * k * 1.2)},0Z`);
  }
  const stain = circ(rig, map, CUP.rim * 0.6, dishY(CUP.rim * 0.6) - 0.3, 48);
  const stain2 = circ(rig, map, CUP.rim * 0.3, dishY(CUP.rim * 0.3) - 0.3, 48);
  // the bead
  const b = P([0, DISH_Y - CUP.bead, 0]), br = CUP.bead * k;
  const sh = P([1.6, DISH_Y - 0.2, -1.4]);
  const tw = 0.6 + 0.4 * Math.pow(0.5 + 0.5 * Math.sin(sparkle / 7), 4);
  const g = clamp01(glint), star = g * (1 - g) * 4;
  return jsxs("g", { children: [
    jsxs("defs", { "data-probe-skip": true, children: [
      jsx("linearGradient", { id: `${id}Wl`, gradientUnits: "userSpaceOnUse", x1: f2(x0), y1: "0", x2: f2(x1), y2: "0", children: [...wallStops].sort((p, q) => p.x - q.x).map((w, i) => jsx("stop", { offset: ((w.x - x0) / (x1 - x0 || 1)).toFixed(3), stopColor: w.c }, i)) }),
      jsxs("linearGradient", { id: `${id}Rm`, gradientUnits: "userSpaceOnUse", x1: f2(x0), y1: f2(rimIc[1] - rimIh), x2: f2(x1), y2: f2(rimIc[1] + rimIh), children: [
        jsx("stop", { offset: "0", stopColor: ash(rimL + 0.08) }),
        jsx("stop", { offset: "1", stopColor: ash(rimL - 0.1) })
      ] }),
      jsxs("linearGradient", { id: `${id}Dh`, gradientUnits: "userSpaceOnUse", x1: f2(rimIc[0] - rimIh * 0.6), y1: f2(rimIc[1] - rimIh * 0.5), x2: f2(rimIc[0] + rimIh * 0.3), y2: f2(rimIc[1] + rimIh * 0.5), children: [
        jsx("stop", { offset: "0", stopColor: ash(dishNear - 0.06) }),
        jsx("stop", { offset: "0.55", stopColor: ash((dishNear + dishFar) / 2) }),
        jsx("stop", { offset: "1", stopColor: ash(dishFar + 0.04) })
      ] })
    ] }),
    jsx("path", { d: wallD, fill: `url(#${id}Wl)` }),
    jsx("path", { d: rimBand, fill: `url(#${id}Rm)`, fillRule: "evenodd" }),
    jsx("path", { d: rimFlat, fill: `url(#${id}Rm)`, fillRule: "evenodd" }),
    jsx("path", { d: pd(rimI), fill: `url(#${id}Dh)` }),
    jsxs("g", { "data-probe-skip": true, children: [
      // the dish's own shadow under the near rim (it is in the near wall's lee), a soft crescent
      jsx("path", { d: pd(rimI), fill: "none", stroke: "#3F4650", strokeWidth: f2(3.2 * k), opacity: 0.12, style: { filter: `blur(${f2(2.5 * k)}px)` } }),
      jsx("path", { d: pd(stain), fill: "#8E8472", opacity: 0.16, style: { filter: `blur(${f2(5 * k)}px)` } }),
      jsx("path", { d: pd(stain2), fill: "#6F6758", opacity: 0.18, style: { filter: `blur(${f2(3 * k)}px)` } }),
      jsx("path", { d: pores[0].join(""), fill: "#5C6470", opacity: 0.3 }),
      jsx("path", { d: pores[1].join(""), fill: "#FFFFFF", opacity: 0.35 }),
      // the lit edge of the rim (upper left) and the foot's contact line
      jsx("path", { d: pd(rimO), fill: "none", stroke: "#FFFFFF", strokeWidth: 0.9, opacity: 0.35 }),
      jsx("path", { d: pd(fF, false), fill: "none", stroke: "#1E242B", strokeWidth: 1.4, opacity: 0.45 }),
      jsx("ellipse", { cx: f2(sh[0]), cy: f2(sh[1]), rx: f2(br * 1.25), ry: f2(br * 0.55), fill: "#2A2620", opacity: 0.45, style: { filter: `blur(${f2(Math.max(0.4, br * 0.25))}px)` } })
    ] }),
    jsxs("g", { "data-probe-object": "the gold bead: a pinhead of gold left in the cupel's dish", children: [
      jsx("defs", { "data-probe-skip": true, children: jsxs("radialGradient", { id: `${id}Bd`, cx: "0.36", cy: "0.32", r: "0.75", children: [
        jsx("stop", { offset: "0", stopColor: "#FFF6D8" }),
        jsx("stop", { offset: "0.25", stopColor: rampAt(BX_GOLD, 0.82) }),
        jsx("stop", { offset: "0.7", stopColor: rampAt(BX_GOLD, 0.55) }),
        jsx("stop", { offset: "1", stopColor: rampAt(BX_GOLD, 0.25) })
      ] }) }),
      jsx("circle", { cx: f2(b[0]), cy: f2(b[1]), r: f2(br), fill: `url(#${id}Bd)` }),
      jsx("circle", { cx: f2(b[0] - br * 0.32), cy: f2(b[1] - br * 0.36), r: f2(Math.max(0.4, br * 0.2)), fill: "#FFFDF4", opacity: tw, "data-probe-skip": true }),
      star > 0.02 && jsxs("g", { "data-probe-skip": true, opacity: star, children: [
        jsx("circle", { cx: f2(b[0]), cy: f2(b[1]), r: f2(br * 4), fill: "#FFE9A8", opacity: 0.35, style: { filter: `blur(${f2(br * 1.4)}px)` } }),
        jsx("path", { d: `M${f2(b[0] - br * 5)},${f2(b[1])}L${f2(b[0] + br * 5)},${f2(b[1])}M${f2(b[0])},${f2(b[1] - br * 5)}L${f2(b[0])},${f2(b[1] + br * 5)}`, stroke: "#FFF8E4", strokeWidth: f2(Math.max(0.6, br * 0.22)), strokeLinecap: "round", opacity: 0.85 })
      ] })
    ] })
  ] });
};
export const cupelPoint = (xf, which) => xfApply(xf, which === "bead" ? [0, DISH_Y - CUP.bead, 0] : which === "rim" ? [0, -CUP.h, 0] : [0, 0, 0]);
// the assay plate: a heavy steel plate (chamfered), its top's machining marks and four counter-sunk screws
export const PLATE = { w: 560, d: 380, t: 44, ch: 6 };
export const AssayPlate = ({ id, rig, xf }) => {
  const map = (q) => xfApply(xf, q);
  const W = PLATE.w / 2, D = PLATE.d / 2, T = PLATE.t, c = PLATE.ch;
  // faces: top, four sides, the chamfer band; in plate-local (origin top centre, y down)
  const top = [[-W + c, 0, -D + c], [W - c, 0, -D + c], [W - c, 0, D - c], [-W + c, 0, D - c]];
  const F = [{ pts: top, n: [0, -1, 0], top: true }];
  const outer = [[-W, c, -D], [W, c, -D], [W, c, D], [-W, c, D]];
  for (let i = 0; i < 4; i++) {
    const a = outer[i], b = outer[(i + 1) % 4], ia = top[i], ib = top[(i + 1) % 4];
    const out = unit3([(a[0] + b[0]) / 2, 0, (a[2] + b[2]) / 2].map((v, k) => k === 1 ? 0 : Math.sign(v) * (Math.abs(v) > 1 ? 1 : 0)));
    F.push({ pts: [a, b, [b[0], T, b[2]], [a[0], T, a[2]]], n: out });
    F.push({ pts: [ia, ib, b, a], n: unit3([out[0], -1, out[2]]), bev: true });
  }
  const drawn = F.map((f) => {
    const vp = f.pts.map((q) => worldView(rig, map(q)));
    const cc = vp.reduce((s, v) => [s[0] + v[0] / 4, s[1] + v[1] / 4, s[2] + v[2] / 4], [0, 0, 0]);
    const n = unit3(sub(worldView(rig, map([f.pts[0][0] + f.n[0], f.pts[0][1] + f.n[1], f.pts[0][2] + f.n[2]])), worldView(rig, map(f.pts[0]))));
    if (dot(n, [-cc[0], -cc[1], rig.persp - cc[2]]) <= 1e-6) return null;
    const l = lightOf(n, f.top ? 0.12 : 0.5) + 0.18 * reflectStudio(n, cc, rig.persp, 0.3);
    const t = f.bev ? Math.min(1, 0.95 * l + 0.16) : f.top ? 0.62 * l + 0.08 : 0.8 * l + 0.04;
    const sp = f.pts.map((q) => worldScr(rig, map(q)));
    return { d: `M${sp.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`, col: rampAt(PL_PLATE, t), depth: cc[2], top: !!f.top, sp };
  }).filter(Boolean).sort((a, b) => a.depth - b.depth);
  const topF = drawn.find((d) => d.top);
  // machining: fine concentric fly-cut arcs across the top
  const arcs = [];
  for (let k = 0; k < 26; k++) {
    const R = 120 + k * 22, cx = -W - 220;
    const pts = [];
    for (let i = 0; i <= 30; i++) {
      const a = -0.75 + 1.5 * i / 30, x = cx + R * Math.cos(a), z = R * Math.sin(a);
      if (Math.abs(x) < W - c - 2 && Math.abs(z) < D - c - 2) pts.push(worldScr(rig, map([x, -0.2, z])));
    }
    if (pts.length > 1) arcs.push(`M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}`);
  }
  const screws = [[-W + 30, -D + 30], [W - 30, -D + 30], [W - 30, D - 30], [-W + 30, D - 30]].map(([x, z]) => ({ c: worldScr(rig, map([x, -0.3, z])), e: Array.from({ length: 20 }, (_, i) => worldScr(rig, map([x + 9 * Math.cos(i / 20 * 2 * Math.PI), -0.3, z + 9 * Math.sin(i / 20 * 2 * Math.PI)]))) }));
  const g0 = worldScr(rig, map([-W, 0, -D])), g1 = worldScr(rig, map([W, 0, D]));
  return jsxs("g", { children: [
    drawn.filter((d) => !d.top).map((d, k) => jsx("path", { d: d.d, fill: d.col, stroke: d.col, strokeWidth: 0.6, strokeLinejoin: "round" }, k)),
    topF && jsxs("g", { children: [
      jsx("defs", { "data-probe-skip": true, children: jsxs("linearGradient", { id: `${id}Tp`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
        jsx("stop", { offset: "0", stopColor: mixHex(topF.col, "#FFFFFF", 0.12) }),
        jsx("stop", { offset: "0.55", stopColor: topF.col }),
        jsx("stop", { offset: "1", stopColor: mixHex(topF.col, "#000000", 0.18) })
      ] }) }),
      jsx("path", { d: topF.d, fill: `url(#${id}Tp)` })
    ] }),
    jsxs("g", { "data-probe-skip": true, children: [
      jsx("path", { d: arcs.join(""), stroke: "#FFFFFF", strokeWidth: 0.7, opacity: 0.05, fill: "none" }),
      screws.map((s, k) => jsxs("g", { children: [
        jsx("path", { d: `M${s.e.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`, fill: "#0E1114", opacity: 0.7 }),
        jsx("path", { d: `M${s.e.map((p) => `${f2(p[0] - 0.6)},${f2(p[1] - 0.6)}`).join("L")}Z`, fill: rampAt(PL_PLATE, 0.55), opacity: 0.9 })
      ] }, k))
    ] })
  ] });
};
// a pose whose x/y plane is the plate's FRONT face (x across, y down, z out of it): for print engraved on it
export const plateFront = (xf) => ({ m: xf.m, t: xfApply(xf, [0, 0, PLATE.d / 2]) });
