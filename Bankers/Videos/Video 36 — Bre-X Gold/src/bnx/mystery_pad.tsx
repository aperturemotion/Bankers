// @ts-nocheck
// ★ V36 "Bre-X Gold" — mystery helper (builder M): THE JUNGLE HELIPAD. A raised helideck (as jungle pads are, on legs above the
//   mud): a chamfered square deck of graphite aluminium planks (seams and bolt rows), its painted markings — the perimeter line, the
//   touchdown circle and the H — and sixteen perimeter lights on the deck edge, which stay lit (a lens dome, a halo, a pool of light
//   on the deck). House materials: V35's graphite (counter_mat PL_*); the paint a pale steel ink.
//   LOCAL FRAME: the deck's centre on the floor at the origin, y DOWN (deck top at y = −PAD.top), x / z the floor plane.
//   <PadBase id rig pose /> the legs, the deck and its markings (drawn under the helicopter);
//   <PadLights id rig pose which="near"|"far" split /> the lights by depth (the near ones over the helicopter's skids);
//   padCorners(pose) → 8 world points (TkFloor casters); padPoint(pose, which) → "front" (the front edge's centre), "frontL"/"frontR".
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { lightOf, rampAt } from "./solid_engine";
import { reflectStudio, unit3, worldScr, worldView, xfApply } from "./tk_rig";
import { StripDefs, StripPaths, loftPaint } from "./bx_core";
import { PL_BODY, PL_PLATE } from "./counter_mat";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const PAD = { half: 440, ch: 70, deck: 24, legH: 58, top: 82, bev: 5 };
const PAINT = "#C9D6E6";
const LIGHT = { lens: "#F2F8FF", halo: "#A9CBF2", pool: "#7FA9DC" };
const outline = (h, c) => [[-h + c, -h], [h - c, -h], [h, -h + c], [h, h - c], [h - c, h], [-h + c, h], [-h, h - c], [-h, -h + c]];
const DECK = outline(PAD.half, PAD.ch);
// a slab from a floor-plan outline (x, z), between heights y0 (top) and y1 — faces with outward normals, a bevel round the top
const slabFaces = (poly, y0, y1, bev = 0) => {
  const F = [];
  const n = poly.length;
  const cx = poly.reduce((s, q) => s + q[0] / n, 0), cz = poly.reduce((s, q) => s + q[1] / n, 0);
  const ins = poly.map((q) => {
    const d = Math.hypot(q[0] - cx, q[1] - cz) || 1;
    return [q[0] - (q[0] - cx) / d * bev, q[1] - (q[1] - cz) / d * bev];
  });
  F.push({ pts: ins.map((q) => [q[0], y0, q[1]]), n: [0, -1, 0], top: true });
  for (let i = 0; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n], ia = ins[i], ib = ins[(i + 1) % n];
    const e = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(e[0], e[1]) || 1, on = [e[1] / l, 0, -e[0] / l];
    const out = dot(on, [(a[0] + b[0]) / 2 - cx, 0, (a[1] + b[1]) / 2 - cz]) < 0 ? [-on[0], 0, -on[2]] : on;
    F.push({ pts: [[a[0], y0 + bev, a[1]], [b[0], y0 + bev, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]], n: out });
    if (bev > 0) F.push({ pts: [[ia[0], y0, ia[1]], [ib[0], y0, ib[1]], [b[0], y0 + bev, b[1]], [a[0], y0 + bev, a[1]]], n: unit3([out[0], -1, out[2]]), bev: true });
  }
  return F;
};
const paint = (faces, map, rig, ramp, spec = 0.5, k = 1) => faces.map((fc) => {
  const vp = fc.pts.map((q) => worldView(rig, map(q)));
  const c = vp.reduce((s, v) => [s[0] + v[0] / vp.length, s[1] + v[1] / vp.length, s[2] + v[2] / vp.length], [0, 0, 0]);
  const p0 = fc.pts[0];
  const n = unit3(sub(worldView(rig, map([p0[0] + fc.n[0], p0[1] + fc.n[1], p0[2] + fc.n[2]])), worldView(rig, map(p0))));
  if (dot(n, [-c[0], -c[1], rig.persp - c[2]]) <= 1e-6) return null;
  const l = lightOf(n, fc.top ? 0.1 : spec) + 0.16 * reflectStudio(n, c, rig.persp, 0.3);
  const sp = fc.pts.map((q) => worldScr(rig, map(q)));
  const t = fc.bev ? Math.min(1, 0.95 * l + 0.14) : fc.top ? 0.62 * l + 0.06 : 0.8 * l + 0.04;
  return { d: `M${sp.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`, col: rampAt(ramp, t * k), depth: c[2], fc, sp, l };
}).filter(Boolean).sort((p, q) => p.depth - q.depth);
const LEGS = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]].map(([a, b]) => [a * (PAD.half - 70), b * (PAD.half - 70)]);
export const LIGHTS = (() => {
  const out = [], h = PAD.half - 16, c = PAD.ch - 12;
  const ring = outline(h, c);
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    out.push(a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
  }
  return out;
})();
export const padCorners = (pose) => {
  const out = [];
  for (const x of [-PAD.half, PAD.half]) for (const y of [0, -PAD.top]) for (const z of [-PAD.half, PAD.half]) out.push(xfApply(pose, [x, y, z]));
  return out;
};
export const padPoint = (pose, which) => xfApply(pose, which === "frontL" ? [-PAD.half, 0, PAD.half] : which === "frontR" ? [PAD.half, 0, PAD.half] : which === "top" ? [0, -PAD.top, 0] : [0, 0, PAD.half]);
const tube = (pts, r, n = 12) => {
  const rings = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const t = unit3(sub(b, a));
    const up = Math.abs(t[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u = unit3(cross(t, up)), v = unit3(cross(t, u));
    const rr = Array.isArray(r) ? r[i] : r;
    const ring = [], nr = [];
    for (let j = 0; j < n; j++) {
      const a2 = j / n * 2 * Math.PI, c = Math.cos(a2), s = Math.sin(a2);
      const d = [u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s];
      ring.push([p[0] + d[0] * rr, p[1] + d[1] * rr, p[2] + d[2] * rr]);
      nr.push(d);
    }
    return { p: ring, n: nr, cap: i === 0 || i === pts.length - 1 };
  });
  return { rings, M: n };
};
const matOf = (rig, ramp, k = 0.8, b = 0.03) => ({
  light: (nv, vp) => 0.05 + 0.82 * lightOf(nv, 0.5, 28) + 0.22 * reflectStudio(nv, vp, rig.persp, 0.3),
  ramp: (l) => rampAt(ramp, Math.max(0, Math.min(1, b + k * l)))
});
const Loft = ({ id, rig, map, geo, mat }) => {
  const pt = loftPaint(id, rig, map, geo, mat);
  return jsxs("g", { children: [
    jsx(StripDefs, { strips: pt.strips }),
    jsx(StripPaths, { strips: pt.strips }),
    pt.caps.map((c, k) => jsx("path", { d: c.d, fill: mat.ramp(c.l), stroke: mat.ramp(c.l), strokeWidth: 0.5 }, k))
  ] });
};
const deckTopPath = (map, rig, poly, y) => `M${poly.map((q) => {
  const s = worldScr(rig, map([q[0], y, q[1]]));
  return `${f2(s[0])},${f2(s[1])}`;
}).join("L")}Z`;
const ringPoly = (r, n = 72) => Array.from({ length: n }, (_, i) => [r * Math.cos(i / n * 2 * Math.PI), r * Math.sin(i / n * 2 * Math.PI)]);
/** legs, deck and markings — see the top of this file */
export const PadBase = ({ id, rig, pose }) => {
  const map = (q) => xfApply(pose, q);
  const yT = -PAD.top, yB = -PAD.top + PAD.deck;
  const legs = LEGS.flatMap(([x, z]) => slabFaces([[x - 22, z - 22], [x + 22, z - 22], [x + 22, z + 22], [x - 22, z + 22]], yB, 0));
  const fascia = paint(slabFaces(DECK, yT, yB, PAD.bev), map, rig, PL_PLATE, 0.55);
  const top = fascia.find((q) => q.fc.top);
  const sides = fascia.filter((q) => !q.fc.top);
  // the deck top: one face carrying a gradient across it (the studio light sliding over the planks)
  const g0 = worldScr(rig, map([-PAD.half, yT, -PAD.half])), g1 = worldScr(rig, map([PAD.half, yT, PAD.half]));
  const lt = top ? top.l : 0.5;
  const y = yT - 0.3;
  // plank seams (aluminium helideck extrusions) across x, every 44 units, and bolt rows near the edge
  const seams = [];
  for (let z = -PAD.half + 44; z < PAD.half; z += 44) {
    const w = PAD.half - Math.max(0, Math.abs(z) - (PAD.half - PAD.ch)) - 8;
    seams.push(deckTopPath(map, rig, [[-w, z], [w, z]], y).replace(/Z$/, ""));
  }
  const bolts = [];
  for (let z = -PAD.half + 22; z < PAD.half; z += 44) for (const s of [-1, 1]) {
    const w = PAD.half - Math.max(0, Math.abs(z) - (PAD.half - PAD.ch)) - 14;
    bolts.push(worldScr(rig, map([s * w, y, z])));
  }
  // paint: the perimeter line, the touchdown circle and the H (worn a little: 0.85)
  const peri = outline(PAD.half - 30, PAD.ch - 12), peri2 = outline(PAD.half - 44, PAD.ch - 18);
  const H = [[-115, -150], [-70, -150], [-70, -22], [70, -22], [70, -150], [115, -150], [115, 150], [70, 150], [70, 22], [-70, 22], [-70, 150], [-115, 150]];
  const paintD = [
    deckTopPath(map, rig, peri, y) + deckTopPath(map, rig, [...peri2].reverse(), y),
    deckTopPath(map, rig, ringPoly(318), y) + deckTopPath(map, rig, [...ringPoly(296)].reverse(), y),
    deckTopPath(map, rig, H, y)
  ];
  return jsxs("g", { "data-probe-object": "the helipad: a raised plank deck on legs, its painted perimeter, touchdown circle and H, the perimeter lights", children: [
    jsx(jsx_runtime.Fragment, { children: paint(legs, map, rig, PL_BODY, 0.4).map((q, k) => jsx("path", { d: q.d, fill: q.col, stroke: q.col, strokeWidth: 0.6 }, `l${k}`)) }),
    sides.map((q, k) => jsx("path", { d: q.d, fill: q.col, stroke: q.col, strokeWidth: 0.6, strokeLinejoin: "round" }, `s${k}`)),
    top && jsxs("g", { children: [
      jsx("defs", { "data-probe-skip": true, children: jsxs("linearGradient", { id: `${id}Dk`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
        jsx("stop", { offset: "0", stopColor: rampAt(PL_PLATE, 0.62 * lt + 0.2) }),
        jsx("stop", { offset: "0.5", stopColor: rampAt(PL_PLATE, 0.62 * lt + 0.06) }),
        jsx("stop", { offset: "1", stopColor: rampAt(PL_PLATE, 0.62 * lt - 0.03) })
      ] }) }),
      jsx("path", { d: top.d, fill: `url(#${id}Dk)` })
    ] }),
    jsxs("g", { "data-probe-skip": true, children: [
      jsx("path", { d: seams.join(""), stroke: "#0B0D10", strokeWidth: 1.3, opacity: 0.55, fill: "none" }),
      jsx("path", { d: seams.join(""), stroke: "#ffffff", strokeWidth: 0.7, opacity: 0.06, fill: "none", transform: "translate(0 1.2)" }),
      bolts.map((b, k) => jsx("circle", { cx: f2(b[0]), cy: f2(b[1]), r: 1.6, fill: "#9CA3AB", opacity: 0.35 }, k))
    ] }),
    jsx("path", { d: paintD.join(""), fill: PAINT, opacity: 0.8, fillRule: "evenodd" })
  ] });
};
// the lights: housing, lens dome, halo, the pool they throw on the deck. `split` = the view depth dividing near from far
export const PadLights = ({ id, rig, pose, which, split, g = 0 }) => {
  const map = (q) => xfApply(pose, q);
  const y = -PAD.top;
  const items = LIGHTS.map(([x, z], i) => ({ x, z, i, d: worldView(rig, map([x, y, z]))[2] })).filter((q) => which === "near" ? q.d >= split : q.d < split).sort((a, b) => a.d - b.d);
  return jsx("g", { children: items.map((q) => {
    const housing = tube([[q.x, y, q.z], [q.x, y - 10, q.z]], 10, 14);
    const top = worldScr(rig, map([q.x, y - 13, q.z]));
    const pool = Array.from({ length: 24 }, (_, k) => worldScr(rig, map([q.x + 58 * Math.cos(k / 24 * 2 * Math.PI), y - 0.4, q.z + 58 * Math.sin(k / 24 * 2 * Math.PI)])));
    const k = rig.persp / Math.max(1, rig.persp - worldView(rig, map([q.x, y, q.z]))[2]);
    const sh = 0.94 + 0.06 * Math.sin(g / 23 + q.i * 1.7);
    return jsxs("g", { children: [
      jsx("path", { d: `M${pool.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`, fill: LIGHT.pool, opacity: 0.16 * sh, style: { filter: "blur(6px)" }, "data-probe-skip": true }),
      jsx(Loft, { id: `${id}lh${q.i}`, rig, map, geo: housing, mat: matOf(rig, PL_BODY, 0.85) }),
      jsx("ellipse", { cx: f2(top[0]), cy: f2(top[1] + 1.5 * k), rx: f2(7.5 * k), ry: f2(6 * k), fill: LIGHT.lens, opacity: 0.95 }),
      jsx("circle", { cx: f2(top[0]), cy: f2(top[1]), r: f2(20 * k), fill: LIGHT.halo, opacity: 0.42 * sh, style: { filter: `blur(${f2(6 * k)}px)` }, "data-probe-skip": true })
    ] }, q.i);
  }) });
};
// a soft shadow on the deck under a lifted body: an ellipse in the deck plane, displaced along the key light's floor vector
export const DeckShadow = ({ rig, pose, x = 0, z = 0, h = 0, rx = 330, rz = 95, op = 0.5 }) => {
  const map = (q) => xfApply(pose, q);
  const dx = 0.5 * h, dz = -0.62 * h;
  const pts = Array.from({ length: 40 }, (_, k) => {
    const a = k / 40 * 2 * Math.PI;
    return worldScr(rig, map([x + dx + rx * Math.cos(a), -PAD.top - 0.5, z + dz + rz * Math.sin(a)]));
  });
  const o = op / (1 + h / 160) * clamp01(1 - h / 900);
  if (o < 0.01) return null;
  return jsx("path", { "data-probe-skip": true, d: `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`, fill: "#000000", opacity: o, style: { filter: `blur(${f2(8 + h / 14)}px)` } });
};
