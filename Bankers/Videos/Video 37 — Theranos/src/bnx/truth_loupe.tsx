// @ts-nocheck
// ★ V36 "Bre-X Gold" — truth helper (builder M): THE ASSAY MAGNIFIER ON ITS STAND. A bench magnifier as an assay office keeps one:
//   a heavy cast base (bevelled), an upright steel post, a collar clamped on it with its thumb screw, a straight arm reaching over the
//   specimen, a knuckle joint and a short drop link to the LENS HEAD — a thick bezel ring holding the glass, turned to face the lens of
//   the camera. Through the glass the specimen is seen MAGNIFIED (the caller draws it: <LoupeView> clips its children to the glass and
//   scales them about the glass's centre), with the glass's own optics over it: the rim darkening, a curved highlight, a faint
//   reflection. Materials: the white stage's dark objects (V35 virginia: navy blue-steel and graphite — bx_gold BX_STEEL, counter_mat
//   PL_*), one key light.
//   <StandBack id rig g /> base + post (painted BEFORE the specimen: they stand behind it); <StandArm id rig g /> collar, arm, knuckle,
//   link (after the specimen: it reaches over it); <LoupeRim id rig g /> the bezel ring (after the view). g = loupeGeo(...).
//   loupeGeo({ C, V, R, B, H }) → the stand's geometry: C the glass centre (world), V the glass normal (toward the camera), R the
//   glass radius, B the base's centre on the floor, H the post's height. lensScr(rig, g) → { x, y, r, d } the glass on screen.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { lightOf, rampAt } from "./solid_engine";
import { reflectStudio, unit3, worldScr, worldView } from "./tk_rig";
import { StripDefs, StripPaths, loftPaint } from "./bx_core";
import { BX_STEEL } from "./bx_gold";
import { PL_BODY, PL_STEEL } from "./counter_mat";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const ID = (q) => q;
const NAVY = BX_STEEL;
// a round-section loft along world points (rings perpendicular to the run), radius r (number or per-point)
const tube = (pts, r, n = 16) => {
  const rings = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const t = unit3(sub(b, a));
    const up = Math.abs(t[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u = unit3(cross(t, up)), v = unit3(cross(t, u));
    const rr = Array.isArray(r) ? r[i] : r;
    const ring = [], nr = [];
    for (let j = 0; j < n; j++) {
      const a2 = j / n * 2 * Math.PI, c = Math.cos(a2), s = Math.sin(a2);
      const d = add(mul(u, c), mul(v, s));
      ring.push(add(p, mul(d, rr)));
      nr.push(i === 0 && pts.length > 2 ? d : i === 0 ? unit3(sub(d, mul(t, 0.5))) : i === pts.length - 1 ? unit3(add(d, mul(t, 0.5))) : d);
    }
    return { p: ring, n: nr, cap: i === 0 || i === pts.length - 1 };
  });
  return { rings, M: n };
};
// a turned solid about a vertical axis at c: profile [[r, dy]] (dy up = negative)
const lathe = (c, prof, n = 40) => {
  const rings = prof.map(([r, dy], i) => {
    const pts = [], nr = [];
    const a = prof[Math.max(0, i - 1)], b = prof[Math.min(prof.length - 1, i + 1)];
    const dr = b[0] - a[0], dv = b[1] - a[1];
    for (let j = 0; j < n; j++) {
      const t = j / n * 2 * Math.PI, ct = Math.cos(t), st = Math.sin(t);
      pts.push([c[0] + r * ct, c[1] + dy, c[2] + r * st]);
      // the profile's outward normal (perpendicular to its tangent in the r/v plane)
      const l = Math.hypot(dr, dv) || 1, nr0 = dv / l, nv = -dr / l;
      const s = nv > 0 ? 1 : 1;
      nr.push(unit3([nr0 * ct * s, nv * s, nr0 * st * s]));
    }
    return { p: pts, n: nr, cap: i === 0 || i === prof.length - 1 };
  });
  return { rings, M: n };
};
const matOf = (rig, ramp, k = 0.82, b = 0.03, refl = 0.3) => ({
  light: (nv, vp) => 0.03 + 0.8 * lightOf(nv, 0.6, 30) + refl * reflectStudio(nv, vp, rig.persp, 0.3),
  ramp: (l) => rampAt(ramp, Math.max(0, Math.min(1, b + k * l)))
});
const Loft = ({ id, rig, geo, mat }) => {
  const pt = loftPaint(id, rig, ID, geo, mat);
  return jsxs("g", { children: [
    jsx(StripDefs, { strips: pt.strips }),
    jsx(StripPaths, { strips: pt.strips }),
    pt.caps.map((c, k) => jsx("path", { d: c.d, fill: mat.ramp(c.l), stroke: mat.ramp(c.l), strokeWidth: 0.5 }, k))
  ] });
};
/** the stand's geometry — see the top of this file */
export const loupeGeo = ({ C, V, R, B, H, tilt = 0 }) => {
  const up = [0, -1, 0];
  // the glass's in-plane axes: e1 horizontal, e2 "up" within the glass; `tilt` (degrees) turns the head about its vertical so the
  //   barrel's side (and its knurled ring) shows
  const a1 = unit3(cross(up, V));
  const tr = tilt * Math.PI / 180;
  const N = unit3(add(mul(V, Math.cos(tr)), mul(a1, Math.sin(tr))));
  const e1 = unit3(cross(up, N)), e2 = unit3(cross(N, e1));
  const top = add(C, mul(e2, R + 15));
  const K = add(top, mul(e2, 34));
  const postTop = [B[0], B[1] - H, B[2]];
  return { C, V: N, R, B, H, e1, e2, top, K, postTop, bezel: 15, depth: 34 };
};
export const lensScr = (rig, g) => {
  const c = worldScr(rig, g.C);
  const pts = Array.from({ length: 64 }, (_, i) => {
    const a = i / 64 * 2 * Math.PI;
    return worldScr(rig, add(g.C, add(mul(g.e1, g.R * Math.cos(a)), mul(g.e2, g.R * Math.sin(a)))));
  });
  const r = pts.reduce((s, p) => s + Math.hypot(p[0] - c[0], p[1] - c[1]), 0) / pts.length;
  return { x: c[0], y: c[1], r, d: `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`, pts };
};
const ringPts = (rig, g, rr, off = 0, n = 72) => Array.from({ length: n }, (_, i) => {
  const a = i / n * 2 * Math.PI;
  return worldScr(rig, add(add(g.C, mul(g.V, off)), add(mul(g.e1, rr * Math.cos(a)), mul(g.e2, rr * Math.sin(a)))));
});
const pathOf = (pts, close = true) => `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}${close ? "Z" : ""}`;
// knurling on a short cylinder (axis a→b, radius r): crossed strokes on the half that faces the lens
const knurl = (rig, a, b, r, n = 36) => {
  const t = unit3(sub(b, a));
  const up = Math.abs(t[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const u = unit3(cross(t, up)), v = unit3(cross(t, u));
  const out = [];
  for (let i = 0; i < n; i++) {
    const a1 = i / n * 2 * Math.PI, a2 = a1 + 2 * Math.PI / n;
    const d1 = add(mul(u, Math.cos(a1)), mul(v, Math.sin(a1))), d2 = add(mul(u, Math.cos(a2)), mul(v, Math.sin(a2)));
    const mid = add(a, mul(d1, r));
    const p = worldView(rig, mid), w = sub(worldView(rig, add(mid, d1)), p);
    if (w[0] * -p[0] + w[1] * -p[1] + w[2] * (rig.persp - p[2]) <= 0) continue;
    const P = (q) => worldScr(rig, q);
    const p0 = P(add(a, mul(d1, r + 0.3))), p1 = P(add(b, mul(d2, r + 0.3))), q0 = P(add(a, mul(d2, r + 0.3))), q1 = P(add(b, mul(d1, r + 0.3)));
    out.push(`M${f2(p0[0])},${f2(p0[1])}L${f2(p1[0])},${f2(p1[1])}M${f2(q0[0])},${f2(q0[1])}L${f2(q1[0])},${f2(q1[1])}`);
  }
  return out.join("");
};
// a slotted screw head lying in a plane (centre c, plane axes u/v), radius r
const ScrewHead = ({ rig, c, u, v, r, slot = 0.6 }) => {
  const pts = Array.from({ length: 20 }, (_, i) => worldScr(rig, add(c, add(mul(u, r * Math.cos(i / 20 * 2 * Math.PI)), mul(v, r * Math.sin(i / 20 * 2 * Math.PI))))));
  const s0 = worldScr(rig, add(c, add(mul(u, -r * 0.7 * Math.cos(slot)), mul(v, -r * 0.7 * Math.sin(slot))))), s1 = worldScr(rig, add(c, add(mul(u, r * 0.7 * Math.cos(slot)), mul(v, r * 0.7 * Math.sin(slot)))));
  return jsxs("g", { children: [
    jsx("path", { d: pathOf(pts.map((p) => [p[0] + 0.8, p[1] + 1])), fill: "#000000", opacity: 0.35 }),
    jsx("path", { d: pathOf(pts), fill: rampAt(PL_STEEL, 0.74) }),
    jsx("path", { d: `M${f2(s0[0])},${f2(s0[1])}L${f2(s1[0])},${f2(s1[1])}`, stroke: "#14171B", strokeWidth: 1.3, opacity: 0.8 })
  ] });
};
/** the stand's geometry beyond loupeGeo: the elbow (the arm rises from the post's collar to the elbow, then reaches down to the loupe's
 *  clamp) and the axis the elbow turns about */
const armOf = (g) => {
  const mid = mul(add(g.postTop, g.K), 0.5);
  const E = add(mid, [0, -70, 0]);
  const dir = unit3(sub(g.K, g.postTop));
  const ax = unit3(cross([0, -1, 0], dir));
  return { E, ax };
};
/** the weighted base (cast, bevelled, a felt ring under it, three screws round its boss) and the post with its cap (behind the
 *  specimen) — rev 1: "more detail to the stand itself" */
export const StandBack = ({ id, rig, g }) => {
  const felt = lathe(g.B, [[0, -4], [114, -4], [116, -2], [114, 0]], 44);
  const base = lathe(g.B, [[0, -38], [40, -38], [52, -35], [98, -24], [114, -14], [120, -10], [120, -6], [116, -4]], 48);
  const boss = lathe(g.B, [[0, -54], [18, -54], [21, -50], [24, -38]], 24);
  const post = tube([[g.B[0], g.B[1] - 50, g.B[2]], [g.B[0], g.B[1] - g.H - 26, g.B[2]]], 8, 16);
  const cap = lathe([g.B[0], g.B[1] - g.H - 26, g.B[2]], [[0, -9], [5, -8], [8.5, -4], [9, 0]], 16);
  const screws = [0.4, 2.5, 4.6].map((a) => [g.B[0] + 58 * Math.cos(a), g.B[1] - 33.5, g.B[2] + 58 * Math.sin(a)]);
  return jsxs("g", { children: [
    jsx(Loft, { id: `${id}fe`, rig, geo: felt, mat: matOf(rig, PL_BODY, 0.55, 0.0, 0.05) }),
    jsx(Loft, { id: `${id}ba`, rig, geo: base, mat: matOf(rig, NAVY, 0.86, 0.02, 0.35) }),
    screws.map((c, k) => jsx(ScrewHead, { rig, c, u: [1, 0, 0], v: [0, -0.18, 1], r: 6, slot: 0.4 + k }, k)),
    jsx(Loft, { id: `${id}bo`, rig, geo: boss, mat: matOf(rig, PL_STEEL, 0.8) }),
    jsx(Loft, { id: `${id}po`, rig, geo: post, mat: matOf(rig, PL_STEEL, 0.82, 0.02, 0.45) }),
    jsx(Loft, { id: `${id}cp`, rig, geo: cap, mat: matOf(rig, PL_STEEL, 0.82, 0.02, 0.45) })
  ] });
};
/** the clamp collar on the post with its thumb screw, the jointed arm with its knurled tension knob at the elbow, and the clamp
 *  that holds the loupe (over the specimen) */
export const StandArm = ({ id, rig, g }) => {
  const { E, ax } = armOf(g);
  const collar = tube([[g.B[0], g.B[1] - g.H + 18, g.B[2]], [g.B[0], g.B[1] - g.H - 18, g.B[2]]], 15, 20);
  const d1 = unit3(sub(E, g.postTop)), s1 = unit3(cross([0, -1, 0], d1));
  const thumbA = add(g.postTop, mul(s1, -14)), thumbB = add(g.postTop, mul(s1, -32)), thumbC = add(g.postTop, mul(s1, -42));
  const screw = tube([thumbA, thumbB], 4.5, 12);
  const knob = tube([thumbB, thumbC], 10, 18);
  const lower = tube([add(g.postTop, mul(d1, 12)), E], 7, 16);
  const upper = tube([E, g.K], 6, 16);
  // the elbow: two hinge plates either side of the joint, then the tension knob on the side facing the lens
  const side = worldView(rig, add(E, ax))[2] > worldView(rig, sub(E, ax))[2] ? 1 : -1;
  const plates = tube([add(E, mul(ax, -9)), add(E, mul(ax, 9))], 14, 22);
  const kA = add(E, mul(ax, side * 9)), kB = add(E, mul(ax, side * 26));
  const tknob = tube([kA, kB], 12, 22);
  // the clamp holding the loupe: a block on the barrel's top with its two screws, and the drop link from the arm's end into it
  const clampA = add(g.top, mul(g.e1, -16)), clampB = add(g.top, mul(g.e1, 16));
  const clamp = tube([clampA, clampB], 9, 14);
  const link = tube([g.K, add(g.top, mul(g.e2, 8))], 5, 14);
  const kz = (q) => rig.persp / Math.max(1, rig.persp - worldView(rig, q)[2]);
  const kc = worldScr(rig, g.K);
  return jsxs("g", { children: [
    jsx(Loft, { id: `${id}co`, rig, geo: collar, mat: matOf(rig, NAVY, 0.86, 0.03, 0.35) }),
    jsx(Loft, { id: `${id}sc`, rig, geo: screw, mat: matOf(rig, PL_STEEL, 0.8) }),
    jsx(Loft, { id: `${id}kn`, rig, geo: knob, mat: matOf(rig, PL_BODY, 0.85) }),
    jsx("path", { "data-probe-skip": true, d: knurl(rig, thumbB, thumbC, 10, 28), stroke: rampAt(PL_STEEL, 0.7), strokeWidth: 0.7, opacity: 0.6, fill: "none" }),
    jsx(Loft, { id: `${id}lo`, rig, geo: lower, mat: matOf(rig, PL_STEEL, 0.82, 0.02, 0.45) }),
    jsx(Loft, { id: `${id}up`, rig, geo: upper, mat: matOf(rig, PL_STEEL, 0.82, 0.02, 0.45) }),
    jsx(Loft, { id: `${id}pl`, rig, geo: plates, mat: matOf(rig, NAVY, 0.86, 0.03, 0.35) }),
    jsx(Loft, { id: `${id}tk`, rig, geo: tknob, mat: matOf(rig, PL_BODY, 0.85, 0.02, 0.25) }),
    jsx("path", { "data-probe-skip": true, d: knurl(rig, kA, kB, 12, 36), stroke: rampAt(PL_STEEL, 0.72), strokeWidth: 0.8, opacity: 0.65, fill: "none" }),
    jsx(ScrewHead, { rig, c: kB, u: unit3(cross(ax, [0, 1, 0])), v: [0, 1, 0], r: 4.5, slot: 0.9 }),
    jsx(Loft, { id: `${id}li`, rig, geo: link, mat: matOf(rig, PL_STEEL, 0.82, 0.02, 0.45) }),
    // the knuckle where the arm meets the drop link
    jsx("circle", { cx: f2(kc[0]), cy: f2(kc[1]), r: f2(8 * kz(g.K)), fill: rampAt(NAVY, 0.3) }),
    jsx("circle", { cx: f2(kc[0] - 2.4 * kz(g.K)), cy: f2(kc[1] - 2.8 * kz(g.K)), r: f2(3.6 * kz(g.K)), fill: rampAt(NAVY, 0.75), opacity: 0.85 }),
    jsx(Loft, { id: `${id}cl`, rig, geo: clamp, mat: matOf(rig, NAVY, 0.86, 0.03, 0.35) }),
    [-1, 1].map((sg) => jsx(ScrewHead, { rig, c: add(add(g.top, mul(g.e1, sg * 10)), mul(g.V, 9.5)), u: g.e1, v: g.e2, r: 3.6, slot: 0.3 + sg }, sg))
  ] });
};
/** the view through the glass: children (the specimen, drawn in the same screen space) clipped to the glass and scaled M× about its
 *  centre, over a ground of the stage's floor; then the glass's optics */
export const LoupeView = ({ id, rig, g, M, stage, glint = 0, children }) => {
  const L = lensScr(rig, g);
  const ground0 = mixHex("#0C2A4D", "#F4F8FC", stage), ground1 = mixHex("#061A33", "#D9E4F1", stage);
  const gx = L.x - L.r * 0.4, gy = L.y - L.r * 0.5;
  // the glint: a soft band of light crossing the glass (−1 … 1 → off the left edge … off the right)
  const gl = -1.4 + 2.8 * clamp01(glint);
  return jsxs("g", { children: [
    jsxs("defs", { "data-probe-skip": true, children: [
      jsx("clipPath", { id: `${id}Cl`, clipPathUnits: "userSpaceOnUse", children: jsx("path", { d: L.d }) }),
      jsxs("radialGradient", { id: `${id}Gr`, gradientUnits: "userSpaceOnUse", cx: f2(gx), cy: f2(gy), r: f2(L.r * 1.6), children: [
        jsx("stop", { offset: "0", stopColor: ground0 }),
        jsx("stop", { offset: "1", stopColor: ground1 })
      ] }),
      jsxs("radialGradient", { id: `${id}Vg`, gradientUnits: "userSpaceOnUse", cx: f2(L.x), cy: f2(L.y), r: f2(L.r), children: [
        jsx("stop", { offset: "0.72", stopColor: "#001C3C", stopOpacity: 0 }),
        jsx("stop", { offset: "0.94", stopColor: "#001C3C", stopOpacity: 0.16 }),
        jsx("stop", { offset: "1", stopColor: "#001C3C", stopOpacity: 0.34 })
      ] }),
      jsxs("linearGradient", { id: `${id}Gl`, gradientUnits: "userSpaceOnUse", x1: f2(L.x + (gl - 0.35) * L.r), y1: f2(L.y - L.r), x2: f2(L.x + (gl + 0.35) * L.r), y2: f2(L.y + L.r * 0.2), children: [
        jsx("stop", { offset: "0", stopColor: "#FFFFFF", stopOpacity: 0 }),
        jsx("stop", { offset: "0.5", stopColor: "#FFFFFF", stopOpacity: 0.34 }),
        jsx("stop", { offset: "1", stopColor: "#FFFFFF", stopOpacity: 0 })
      ] })
    ] }),
    jsxs("g", { clipPath: `url(#${id}Cl)`, children: [
      jsx("path", { d: L.d, fill: `url(#${id}Gr)` }),
      jsx("g", { transform: `translate(${f2(L.x)} ${f2(L.y)}) scale(${M.toFixed(4)}) translate(${f2(-L.x)} ${f2(-L.y)})`, children }),
      jsx("path", { d: L.d, fill: `url(#${id}Vg)`, "data-probe-skip": true }),
      glint > 1e-3 && glint < 0.999 && jsx("path", { d: L.d, fill: `url(#${id}Gl)`, "data-probe-skip": true }),
      // the curved highlight on the glass (upper left: the key light's reflection), and a faint second one lower right
      jsx("path", { "data-probe-skip": true, d: `M${f2(L.x - L.r * 0.78)},${f2(L.y - L.r * 0.12)}A${f2(L.r * 0.82)},${f2(L.r * 0.82)} 0 0 1 ${f2(L.x - L.r * 0.1)},${f2(L.y - L.r * 0.8)}`, fill: "none", stroke: "#FFFFFF", strokeWidth: f2(L.r * 0.07), strokeLinecap: "round", opacity: 0.5 }),
      jsx("path", { "data-probe-skip": true, d: `M${f2(L.x + L.r * 0.5)},${f2(L.y + L.r * 0.62)}A${f2(L.r * 0.84)},${f2(L.r * 0.84)} 0 0 0 ${f2(L.x + L.r * 0.74)},${f2(L.y + L.r * 0.3)}`, fill: "none", stroke: "#FFFFFF", strokeWidth: f2(L.r * 0.03), strokeLinecap: "round", opacity: 0.3 })
    ] })
  ] });
};
// polished chrome: a high-contrast ramp read through banded gradients (the studio's reflection)
const CHROME = ["#121820", "#3B4654", "#8A96A5", "#DDE4EB", "#FFFFFF"];
const lensPt = (g, rr, a, off = 0) => add(add(g.C, mul(g.V, off)), add(mul(g.e1, rr * Math.cos(a)), mul(g.e2, rr * Math.sin(a))));
/** the jeweller's loupe head: the chrome barrel — the front ring, the barrel's side with its knurled grip ring, the thick lens's
 *  refracting edge and its reflections (draw <LoupeRim> AFTER the view). (Rev 1b: the folding cover is gone, at Timur's note.) */
export const LoupeRim = ({ id, rig, g }) => {
  const r0 = g.R, r1 = g.R + g.bezel;
  const ring = (rr, off, n = 72) => Array.from({ length: n }, (_, i) => worldScr(rig, lensPt(g, rr, i / n * 2 * Math.PI, off)));
  const front = ring(r1, 0), inner = ring(r0, 0), back = ring(r1, -g.depth), lipIn = ring(r0 + 4, 0.5);
  const face = pathOf(front) + pathOf([...inner].reverse());
  // the barrel's side: the band between the front and the back rings (evenodd of their union's two outlines)
  const side = pathOf(back) + pathOf([...front].reverse());
  // knurling: short crossed strokes on the grip ring (offsets −10 … −26), only on the side that faces the lens
  const kn = [];
  for (let i = 0; i < 96; i++) {
    const a = i / 96 * 2 * Math.PI;
    const n = add(mul(g.e1, Math.cos(a)), mul(g.e2, Math.sin(a)));
    const p = worldView(rig, lensPt(g, r1, a, -18)), wn = sub(worldView(rig, add(lensPt(g, r1, a, -18), n)), p);
    if (wn[0] * -p[0] + wn[1] * -p[1] + wn[2] * (rig.persp - p[2]) <= 0) continue;
    const a2 = a + 0.035;
    const p0 = worldScr(rig, lensPt(g, r1 + 0.3, a, -10)), p1 = worldScr(rig, lensPt(g, r1 + 0.3, a2, -26));
    const q0 = worldScr(rig, lensPt(g, r1 + 0.3, a2, -10)), q1 = worldScr(rig, lensPt(g, r1 + 0.3, a, -26));
    kn.push(`M${f2(p0[0])},${f2(p0[1])}L${f2(p1[0])},${f2(p1[1])}M${f2(q0[0])},${f2(q0[1])}L${f2(q1[0])},${f2(q1[1])}`);
  }
  const grip = [ring(r1 + 0.4, -10), ring(r1 + 0.4, -26)];
  const a = worldScr(rig, lensPt(g, r1, 2.36)), b = worldScr(rig, lensPt(g, r1, -0.78));
  // a soft window reflection on the glass (upper left) and the lens's thick refracting edge inside the ring
  const win = [[-0.62, 0.62], [-0.18, 0.74], [-0.3, 0.38], [-0.72, 0.3]].map(([u, v]) => worldScr(rig, add(add(g.C, mul(g.V, 1)), add(mul(g.e1, u * r0), mul(g.e2, v * r0)))));
  return jsxs("g", { children: [
    jsx("defs", { "data-probe-skip": true, children: jsxs("linearGradient", { id: `${id}Bz`, gradientUnits: "userSpaceOnUse", x1: f2(a[0]), y1: f2(a[1]), x2: f2(b[0]), y2: f2(b[1]), children: [
      jsx("stop", { offset: "0", stopColor: rampAt(CHROME, 0.97) }),
      jsx("stop", { offset: "0.14", stopColor: rampAt(CHROME, 0.62) }),
      jsx("stop", { offset: "0.34", stopColor: rampAt(CHROME, 0.22) }),
      jsx("stop", { offset: "0.55", stopColor: rampAt(CHROME, 0.82) }),
      jsx("stop", { offset: "0.78", stopColor: rampAt(CHROME, 0.35) }),
      jsx("stop", { offset: "1", stopColor: rampAt(CHROME, 0.14) })
    ] }) }),
    jsx("path", { d: side, fill: rampAt(CHROME, 0.32), fillRule: "evenodd" }),
    jsxs("g", { "data-probe-skip": true, children: [
      jsx("path", { d: pathOf(grip[0], true) + pathOf([...grip[1]].reverse()), fill: rampAt(CHROME, 0.18), fillRule: "evenodd", opacity: 0.7 }),
      jsx("path", { d: kn.join(""), stroke: rampAt(CHROME, 0.78), strokeWidth: 0.8, opacity: 0.75, fill: "none" })
    ] }),
    jsx("path", { d: face, fill: `url(#${id}Bz)`, fillRule: "evenodd" }),
    jsxs("g", { "data-probe-skip": true, children: [
      // the lens's thickness: a dark band then a bright refracting rim just inside the ring
      jsx("path", { d: pathOf(inner), fill: "none", stroke: "#0B1B2D", strokeWidth: 7, opacity: 0.3 }),
      jsx("path", { d: pathOf(lipIn), fill: "none", stroke: "#FFFFFF", strokeWidth: 1.4, opacity: 0.55 }),
      jsx("path", { d: pathOf(inner), fill: "none", stroke: "#000000", strokeWidth: 1.2, opacity: 0.5 }),
      jsx("path", { d: pathOf(win), fill: "#FFFFFF", opacity: 0.16, style: { filter: "blur(2px)" } }),
      jsx("path", { d: pathOf(front), fill: "none", stroke: "#FFFFFF", strokeWidth: 0.9, opacity: 0.5 })
    ] })
  ] });
};
