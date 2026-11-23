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
export const loupeGeo = ({ C, V, R, B, H }) => {
  const up = [0, -1, 0];
  // the glass's in-plane axes: e1 horizontal, e2 "up" within the glass
  const e1 = unit3(cross(up, V)), e2 = unit3(cross(V, e1));
  const top = add(C, mul(e2, R + 15));
  const K = add(top, mul(e2, 34));
  const postTop = [B[0], B[1] - H, B[2]];
  return { C, V, R, B, H, e1, e2, top, K, postTop, bezel: 15, depth: 16 };
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
/** base + post (behind the specimen) */
export const StandBack = ({ id, rig, g }) => {
  const base = lathe(g.B, [[0, -27], [34, -27], [44, -24], [96, -14], [108, -9], [110, -3], [108, 0]], 44);
  const boss = lathe(g.B, [[0, -40], [16, -40], [18, -36], [20, -27]], 24);
  const post = tube([[g.B[0], g.B[1] - 36, g.B[2]], [g.B[0], g.B[1] - g.H - 6, g.B[2]]], 7.5, 16);
  return jsxs("g", { children: [
    jsx(Loft, { id: `${id}ba`, rig, geo: base, mat: matOf(rig, NAVY, 0.86, 0.02, 0.35) }),
    jsx(Loft, { id: `${id}bo`, rig, geo: boss, mat: matOf(rig, PL_STEEL, 0.8) }),
    jsx(Loft, { id: `${id}po`, rig, geo: post, mat: matOf(rig, PL_STEEL, 0.82, 0.02, 0.45) })
  ] });
};
/** collar, arm, knuckle and drop link (over the specimen) */
export const StandArm = ({ id, rig, g }) => {
  const collar = tube([[g.B[0], g.B[1] - g.H + 16, g.B[2]], [g.B[0], g.B[1] - g.H - 16, g.B[2]]], 14, 20);
  const dir = unit3(sub(g.K, g.postTop));
  const side = unit3(cross([0, -1, 0], dir));
  const screw = tube([add(g.postTop, mul(side, 13)), add(g.postTop, mul(side, 30))], 4.5, 12);
  const knob = tube([add(g.postTop, mul(side, 30)), add(g.postTop, mul(side, 38))], 9, 16);
  const arm = tube([add(g.postTop, mul(dir, 10)), g.K], 6.5, 16);
  const link = tube([g.K, g.top], 5, 14);
  const k = worldScr(rig, g.K), kz = rig.persp / Math.max(1, rig.persp - worldView(rig, g.K)[2]);
  return jsxs("g", { children: [
    jsx(Loft, { id: `${id}co`, rig, geo: collar, mat: matOf(rig, NAVY, 0.86, 0.03, 0.35) }),
    jsx(Loft, { id: `${id}sc`, rig, geo: screw, mat: matOf(rig, PL_STEEL, 0.8) }),
    jsx(Loft, { id: `${id}kn`, rig, geo: knob, mat: matOf(rig, PL_BODY, 0.85) }),
    jsx(Loft, { id: `${id}ar`, rig, geo: arm, mat: matOf(rig, PL_STEEL, 0.82, 0.02, 0.45) }),
    jsx(Loft, { id: `${id}li`, rig, geo: link, mat: matOf(rig, PL_STEEL, 0.82, 0.02, 0.45) }),
    jsxs("g", { children: [
      jsx("circle", { cx: f2(k[0]), cy: f2(k[1]), r: f2(11 * kz), fill: rampAt(NAVY, 0.28) }),
      jsx("circle", { cx: f2(k[0] - 3 * kz), cy: f2(k[1] - 3.5 * kz), r: f2(5.5 * kz), fill: rampAt(NAVY, 0.72), opacity: 0.85 }),
      jsx("circle", { cx: f2(k[0] - 4 * kz), cy: f2(k[1] - 4.5 * kz), r: f2(1.8 * kz), fill: "#FFFFFF", opacity: 0.8 })
    ] })
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
/** the bezel ring holding the glass: its back edge (depth) and its lit front face */
export const LoupeRim = ({ id, rig, g }) => {
  const r0 = g.R, r1 = g.R + g.bezel;
  const front = ringPts(rig, g, r1, 0), inner = ringPts(rig, g, r0, 0), back = ringPts(rig, g, r1, -g.depth);
  const face = pathOf(front) + pathOf([...inner].reverse());
  const side = pathOf(back) + pathOf([...front].reverse());
  // the face's light: brightest toward the key (upper left), darkest lower right
  const a = worldScr(rig, add(g.C, add(mul(g.e1, -r1), mul(g.e2, r1)))), b = worldScr(rig, add(g.C, add(mul(g.e1, r1), mul(g.e2, -r1))));
  const l = lightOf(g.V.map((v) => v), 0.5);
  return jsxs("g", { children: [
    jsx("defs", { "data-probe-skip": true, children: jsxs("linearGradient", { id: `${id}Bz`, gradientUnits: "userSpaceOnUse", x1: f2(a[0]), y1: f2(a[1]), x2: f2(b[0]), y2: f2(b[1]), children: [
      jsx("stop", { offset: "0", stopColor: rampAt(NAVY, 0.86) }),
      jsx("stop", { offset: "0.22", stopColor: rampAt(NAVY, 0.58) }),
      jsx("stop", { offset: "0.6", stopColor: rampAt(NAVY, 0.3) }),
      jsx("stop", { offset: "1", stopColor: rampAt(NAVY, 0.16 + 0.1 * l) })
    ] }) }),
    jsx("path", { d: side, fill: rampAt(NAVY, 0.12), fillRule: "evenodd" }),
    jsx("path", { d: face, fill: `url(#${id}Bz)`, fillRule: "evenodd" }),
    jsx("path", { d: pathOf(inner), fill: "none", stroke: "#000000", strokeWidth: 1.4, opacity: 0.45 }),
    jsx("path", { d: pathOf(front), fill: "none", stroke: rampAt(NAVY, 0.9), strokeWidth: 0.9, opacity: 0.55, "data-probe-skip": true })
  ] });
};
