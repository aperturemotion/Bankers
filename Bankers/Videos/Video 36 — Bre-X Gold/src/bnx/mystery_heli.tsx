// @ts-nocheck
// ★ V36 "Bre-X Gold" — mystery helper (builder M): THE HELICOPTER. A small utility helicopter (the Bell 206 family: a two-blade main
//   rotor on a short mast over an engine fairing, a rounded cabin with a two-pane windscreen, chin windows, door windows and roof
//   skylights, two doors a side, skids on arched cross tubes, a tapered tail boom with a horizontal stabilizer and its end plates, a
//   swept vertical fin with a ventral fin and a tail-skid guard, a two-blade tail rotor on the left side) in the house's blue-steel
//   body with graphite running gear, lit by the ONE key light (solid_engine lightOf + tk_rig reflectStudio, the bx_gold metal recipe
//   on the blue-steel ramp). The fuselage is ONE smooth loft (bx_core loftPaint) through a station table, its glazing and seams laid
//   on the same surface, with its small anatomy (rev 1: "more detailed, more realistic"): drooping blades over the blur disc, panel
//   seams and rivet rows on the boom and cabin, an intake grille on the fairing, pitot tube, roof and belly antennas, a skid step,
//   the landing light and the position lights (red on the left stabilizer tip, white at the tail). No markings, no registration, no
//   maker's mark (no brand on a generic object).
//
//   LOCAL FRAME: x forward (the nose at +x), y DOWN, z = the helicopter's LEFT side; the origin is on the ground between the skids,
//   under the mast. <MyHeli id rig xf rot tail glint /> draws it (an SVG <g>), xf its pose (tk_rig xf*); rot / tail = the main / tail
//   rotor's apparent angle (radians, the blur pattern's turn), glint 0…1 a beacon pulse. heliCorners(xf) → 8 world points (casters),
//   heliPoint(xf, which) → a world point ("hub", "belly", "skidL", "nose").
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { lightOf, rampAt } from "./solid_engine";
import { reflectStudio, unit3, worldScr, worldView, xfApply } from "./tk_rig";
import { StripDefs, StripPaths, loftPaint } from "./bx_core";
import { BX_STEEL } from "./bx_gold";
import { PL_STEEL } from "./counter_mat";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
// the body's blue-steel (V35's tk_mat ring steel, as bx_gold BX_STEEL) and a lighter trim stripe from the same family
const BODY = BX_STEEL;
const TRIM = ["#3B4E66", "#7D93AD", "#B8C9DC", "#E2EAF3", "#FFFFFF"];
const GEAR = PL_STEEL;
// ── the fuselage station table (tail → nose): x, half-width, top y, bottom y ─────────────────────────────────────────────────────
const ST = [
  [-562, 8, -151, -135], [-480, 10, -153, -133], [-380, 12, -156, -130], [-270, 15, -160, -126], [-180, 20, -166, -120],
  [-128, 30, -176, -102], [-88, 44, -187, -76], [-46, 57, -194, -56], [0, 64, -197, -47], [60, 66, -198, -45],
  [130, 67, -197, -45], [188, 65, -189, -46], [232, 61, -172, -49], [268, 55, -150, -53], [297, 47, -128, -58],
  [320, 35, -109, -64], [336, 22, -96, -71], [345, 9, -88, -78], [348, 1.5, -84, -81]
];
const cr = (p0, p1, p2, p3, t) => 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
const SUB = 3;
const STATIONS = (() => {
  const out = [];
  const N = ST.length;
  for (let i = 0; i < N - 1; i++) for (let k = 0; k < SUB; k++) {
    const t = k / SUB, g = (j) => ST[Math.max(0, Math.min(N - 1, j))];
    out.push([0, 1, 2, 3].map((c) => cr(g(i - 1)[c], g(i)[c], g(i + 1)[c], g(i + 2)[c], t)));
  }
  out.push(ST[N - 1]);
  return out;
})();
// a station's section at angle φ (z = w cos φ, y = yc + h sin φ; φ = −90° the top, 0 the left side, 90° the belly) — a rounded box,
//   a little narrower over the roof (tumblehome)
const EXP = 2 / 2.6;
const sec = (s, ph) => {
  const [x, w, top, bot] = s;
  const c = Math.cos(ph), sn = Math.sin(ph);
  const yc = (top + bot) / 2, h = (bot - top) / 2;
  const z = w * Math.sign(c) * Math.pow(Math.abs(c), EXP) * (1 - 0.15 * Math.max(0, -sn));
  return [x, yc + h * Math.sign(sn) * Math.pow(Math.abs(sn), EXP), z];
};
const stationAt = (x) => {
  if (x <= STATIONS[0][0]) return STATIONS[0];
  for (let i = 0; i < STATIONS.length - 1; i++) {
    const a = STATIONS[i], b = STATIONS[i + 1];
    if (x <= b[0]) {
      const t = (x - a[0]) / (b[0] - a[0] || 1);
      return a.map((v, k) => v + (b[k] - v) * t);
    }
  }
  return STATIONS[STATIONS.length - 1];
};
/** a point on the fuselage skin at (x, φ), lifted `lift` units off it along the outward normal */
export const skinPt = (x, ph, lift = 0) => {
  const p = sec(stationAt(x), ph);
  if (!lift) return p;
  const n = skinN(x, ph);
  return [p[0] + n[0] * lift, p[1] + n[1] * lift, p[2] + n[2] * lift];
};
const skinN = (x, ph) => {
  const e = 1.5, d = 0.02;
  const tl = sub(sec(stationAt(x + e), ph), sec(stationAt(x - e), ph));
  const ta = sub(sec(stationAt(x), ph + d), sec(stationAt(x), ph - d));
  let n = unit3(cross(tl, ta));
  const s = stationAt(x), p = sec(s, ph), c = [x, (s[2] + s[3]) / 2, 0];
  if (dot(n, sub(p, c)) < 0) n = [-n[0], -n[1], -n[2]];
  return n;
};
const M = 40;
const FUSE = (() => {
  const P = STATIONS.map((s) => Array.from({ length: M }, (_, j) => sec(s, j / M * 2 * Math.PI)));
  const rings = P.map((ring, i) => ({
    p: ring,
    n: ring.map((q, j) => {
      const tl = sub(P[Math.min(P.length - 1, i + 1)][j], P[Math.max(0, i - 1)][j]);
      const ta = sub(ring[(j + 1) % M], ring[(j - 1 + M) % M]);
      let n = unit3(cross(tl, ta));
      const s = STATIONS[i], c = [s[0], (s[2] + s[3]) / 2, 0];
      if (dot(n, sub(q, c)) < 0) n = [-n[0], -n[1], -n[2]];
      // the nose tip and the boom's end: blend toward the axis so the closing rings shade as a rounded end
      if (i === P.length - 1) n = unit3([n[0] + 1.2, n[1], n[2]]);
      return n;
    }),
    cap: i === 0 || i === P.length - 1
  }));
  return { rings, M };
})();
// the engine fairing on the roof (aft of the mast), boxier
const FAIR_ST = [[-92, 22, -214, -190], [-70, 30, -230, -192], [-20, 35, -239, -193], [40, 36, -241, -193], [76, 31, -234, -193], [96, 20, -214, -192]];
const FAIR = (() => {
  const P = FAIR_ST.map((s) => Array.from({ length: 28 }, (_, j) => {
    const ph = j / 28 * 2 * Math.PI, [x, w, top, bot] = s;
    const c = Math.cos(ph), sn = Math.sin(ph), yc = (top + bot) / 2, h = (bot - top) / 2;
    return [x, yc + h * Math.sign(sn) * Math.pow(Math.abs(sn), 0.62), w * Math.sign(c) * Math.pow(Math.abs(c), 0.62)];
  }));
  const rings = P.map((ring, i) => ({ p: ring, n: ring.map((q, j) => {
    const tl = sub(P[Math.min(P.length - 1, i + 1)][j], P[Math.max(0, i - 1)][j]);
    const ta = sub(ring[(j + 1) % 28], ring[(j - 1 + 28) % 28]);
    let n = unit3(cross(tl, ta));
    const s = FAIR_ST[i], c = [s[0], (s[2] + s[3]) / 2, 0];
    if (dot(n, sub(q, c)) < 0) n = [-n[0], -n[1], -n[2]];
    if (i === 0) n = unit3([n[0] - 0.8, n[1], n[2]]);
    if (i === P.length - 1) n = unit3([n[0] + 0.8, n[1], n[2]]);
    return n;
  }), cap: i === 0 || i === P.length - 1 }));
  return { rings, M: 28 };
})();
// a tube (skid, cross tube, mast, exhaust) along local points, radius r — a round section loft
const tubeGeo = (pts, r, n = 14) => {
  const rings = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const t = unit3(sub(b, a));
    const up = Math.abs(t[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u = unit3(cross(t, up)), v = unit3(cross(t, u));
    const ring = [], nr = [];
    for (let j = 0; j < n; j++) {
      const a2 = j / n * 2 * Math.PI, c = Math.cos(a2), s = Math.sin(a2);
      const d = [u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s];
      ring.push([p[0] + d[0] * r, p[1] + d[1] * r, p[2] + d[2] * r]);
      nr.push(i === 0 ? unit3([d[0] - t[0] * 0.6, d[1] - t[1] * 0.6, d[2] - t[2] * 0.6]) : i === pts.length - 1 ? unit3([d[0] + t[0] * 0.6, d[1] + t[1] * 0.6, d[2] + t[2] * 0.6]) : d);
    }
    return { p: ring, n: nr, cap: i === 0 || i === pts.length - 1 };
  });
  return { rings, M: n };
};
// a flat solid from a 2-D outline in the (x, y) plane, extruded ±t/2 along z (the fin) — as two caps + an edge band, painted flat
const finFaces = (poly, z0, t) => {
  const F = [];
  const P = (q, z) => [q[0], q[1], z];
  F.push({ pts: poly.map((q) => P(q, z0 + t / 2)), n: [0, 0, 1] });
  F.push({ pts: [...poly].reverse().map((q) => P(q, z0 - t / 2)), n: [0, 0, -1] });
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const e = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(e[0], e[1]) || 1;
    F.push({ pts: [P(a, z0 + t / 2), P(b, z0 + t / 2), P(b, z0 - t / 2), P(a, z0 - t / 2)], n: [e[1] / l, -e[0] / l, 0], edge: true });
  }
  return F;
};
const boxFaces = (c, s) => {
  const [x, y, z] = c, [a, b, e] = [s[0] / 2, s[1] / 2, s[2] / 2];
  const v = (i, j, k) => [x + i * a, y + j * b, z + k * e];
  return [
    { pts: [v(-1, -1, 1), v(1, -1, 1), v(1, 1, 1), v(-1, 1, 1)], n: [0, 0, 1] },
    { pts: [v(1, -1, -1), v(-1, -1, -1), v(-1, 1, -1), v(1, 1, -1)], n: [0, 0, -1] },
    { pts: [v(1, -1, 1), v(1, -1, -1), v(1, 1, -1), v(1, 1, 1)], n: [1, 0, 0] },
    { pts: [v(-1, -1, -1), v(-1, -1, 1), v(-1, 1, 1), v(-1, 1, -1)], n: [-1, 0, 0] },
    { pts: [v(-1, -1, -1), v(1, -1, -1), v(1, -1, 1), v(-1, -1, 1)], n: [0, -1, 0] },
    { pts: [v(-1, 1, 1), v(1, 1, 1), v(1, 1, -1), v(-1, 1, -1)], n: [0, 1, 0] }
  ];
};
const FIN = [[-500, -150], [-548, -224], [-566, -258], [-602, -258], [-590, -186], [-588, -150], [-597, -104], [-578, -106], [-552, -134]];
const STAB = { x: -430, y: -142, chord: 46, span: 74, t: 6 };
const PLATE = [[-452, -164], [-414, -164], [-406, -128], [-454, -126]];
const SKID = { z: 88, y: -6, r: 6.5, x0: -112, x1: 198 };
const skidPts = (s) => [[SKID.x0, SKID.y, s * SKID.z], [SKID.x1 - 60, SKID.y, s * SKID.z], [SKID.x1, SKID.y, s * SKID.z], [SKID.x1 + 16, SKID.y - 4, s * SKID.z], [SKID.x1 + 30, SKID.y - 15, s * SKID.z], [SKID.x1 + 38, SKID.y - 30, s * SKID.z]];
const crossPts = (x, s) => [[x, SKID.y, s * SKID.z], [x, SKID.y - 18, s * (SKID.z - 6)], [x, SKID.y - 33, s * (SKID.z - 20)], [x, -46, s * (SKID.z - 40)], [x, -49, s * 30]];
const MAST = { x: 38, y0: -238, y1: -262, r: 8 };
export const HUB = [MAST.x, -266, 0];
const ROTOR_R = 372;
const TR = { c: [-592, -196, 12], r: 54 };
// the glazing: (x, φ) outlines on the skin (φ in degrees). Left (camera) side and both windscreen panes, chins, skylights
const GLASS = [
  { id: "wsL", pts: [[206, -84], [252, -84], [300, -62], [306, -22], [270, -8], [222, -26]] },
  { id: "wsR", pts: [[206, -96], [252, -96], [300, -118], [306, -158], [270, -172], [222, -154]] },
  { id: "chinL", pts: [[286, 12], [318, 4], [332, 30], [312, 58], [286, 48]] },
  { id: "chinR", pts: [[286, 168], [318, 176], [332, 150], [312, 122], [286, 132]] },
  { id: "doorF", pts: [[132, -58], [198, -58], [212, -30], [214, 8], [132, 8]] },
  { id: "doorR", pts: [[14, -58], [112, -58], [112, 6], [14, 6]] },
  { id: "sky", pts: [[150, -112], [196, -110], [196, -70], [150, -68]] }
];
const SEAMS = [
  [[124, -64], [124, 74]], [[220, -30], [220, 70]], [[6, -64], [6, 74]],
  [[6, 74], [220, 74]], [[-60, -20], [-60, 70]]
];
const HANDLES = [[[96, 18], [112, 18]], [[192, 20], [206, 20]]];
const STRIPE = { a: 30, b: 40, x0: -150, x1: 326 };
// ── the materials ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
const bodyMat = (rig, k = 0) => ({
  light: (nv, vp) => 0.0 + 0.82 * lightOf(nv, 0.62, 30) + 0.42 * reflectStudio(nv, vp, rig.persp, 0.3),
  ramp: (l) => rampAt(BODY, Math.max(0, Math.min(1, 0.02 + 0.86 * l + k)))
});
const gearMat = (rig) => ({
  light: (nv, vp) => 0.05 + 0.82 * lightOf(nv, 0.55, 30) + 0.3 * reflectStudio(nv, vp, rig.persp, 0.3),
  ramp: (l) => rampAt(GEAR, Math.max(0, Math.min(0.92, 0.02 + 0.78 * l)))
});
const LoftG = ({ id, rig, map, geo, mat }) => {
  const pt = loftPaint(id, rig, map, geo, mat);
  return jsxs("g", { children: [
    jsx(StripDefs, { strips: pt.strips }),
    jsx(StripPaths, { strips: pt.strips }),
    pt.caps.map((c, k) => jsx("path", { d: c.d, fill: mat.ramp(c.l, "bev"), stroke: mat.ramp(c.l, "bev"), strokeWidth: 0.6 }, `c${k}`))
  ] });
};
const paintFlat = (faces, map, rig, ramp, spec = 0.5) => faces.map((fc) => {
  const vp = fc.pts.map((q) => worldView(rig, map(q)));
  const a = sub(vp[1], vp[0]), b = sub(vp[2], vp[0]);
  let n = unit3(cross(a, b));
  const c = vp.reduce((s, v) => [s[0] + v[0] / vp.length, s[1] + v[1] / vp.length, s[2] + v[2] / vp.length], [0, 0, 0]);
  const wn = unit3(sub(worldView(rig, map([fc.pts[0][0] + fc.n[0], fc.pts[0][1] + fc.n[1], fc.pts[0][2] + fc.n[2]])), worldView(rig, map(fc.pts[0]))));
  if (dot(n, wn) < 0) n = [-n[0], -n[1], -n[2]];
  if (dot(n, [-c[0], -c[1], rig.persp - c[2]]) <= 1e-6) return null;
  const l = lightOf(n, spec) + 0.18 * reflectStudio(n, c, rig.persp, 0.3);
  const sp = fc.pts.map((q) => worldScr(rig, map(q)));
  return { d: `M${sp.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`, col: rampAt(ramp, Math.min(1, (fc.edge ? 0.9 : 0.8) * l + (fc.edge ? 0.08 : 0.02))), depth: c[2] };
}).filter(Boolean).sort((p, q) => p.depth - q.depth);
const Flat = ({ faces, map, rig, ramp, spec }) => jsx(jsx_runtime.Fragment, { children: paintFlat(faces, map, rig, ramp, spec).map((q, k) => jsx("path", { d: q.d, fill: q.col, stroke: q.col, strokeWidth: 0.6, strokeLinejoin: "round" }, k)) });
// a surface outline (x, φ°) densified and projected
const surfPath = (map, rig, pts, lift = 0.6, close = true) => {
  const out = [];
  const n = close ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    for (let k = 0; k < 8; k++) {
      const t = k / 8, x = a[0] + (b[0] - a[0]) * t, ph = (a[1] + (b[1] - a[1]) * t) * Math.PI / 180;
      out.push(worldScr(rig, map(skinPt(x, ph, lift))));
    }
  }
  if (!close) {
    const b = pts[pts.length - 1];
    out.push(worldScr(rig, map(skinPt(b[0], b[1] * Math.PI / 180, lift))));
  }
  return { d: `M${out.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}${close ? "Z" : ""}`, pts: out };
};
const facing = (map, rig, x, ph) => {
  const q = skinPt(x, ph), n = skinN(x, ph);
  const v = worldView(rig, map(q)), vn = unit3(sub(worldView(rig, map([q[0] + n[0], q[1] + n[1], q[2] + n[2]])), v));
  return { f: dot(vn, unit3([-v[0], -v[1], rig.persp - v[2]])), vn, v };
};
const Glass = ({ id, rig, map }) => jsx(jsx_runtime.Fragment, { children: GLASS.map((g) => {
  const cx = g.pts.reduce((s, q) => s + q[0], 0) / g.pts.length, cp = g.pts.reduce((s, q) => s + q[1], 0) / g.pts.length * Math.PI / 180;
  const fc = facing(map, rig, cx, cp);
  if (fc.f < 0.04) return null;
  const sp = surfPath(map, rig, g.pts, 0.8);
  const xs = sp.pts.map((p) => p[0]), ys = sp.pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  // the sky's reflection: brighter where the pane faces up (the dusk sky), a band across it
  const l = lightOf(fc.vn, 0.9, 40);
  const top = mixHex("#0B1B2D", "#3E6A99", clamp01(0.25 + 0.9 * l - 0.6 * Math.max(0, fc.vn[1])));
  const gid = `${id}${g.id}`;
  const bw = (x1 - x0) * 0.22;
  return jsxs("g", { children: [
    jsxs("defs", { "data-probe-skip": true, children: [
      jsxs("linearGradient", { id: `${gid}G`, gradientUnits: "userSpaceOnUse", x1: f2(x0), y1: f2(y0), x2: f2(x1), y2: f2(y1), children: [
        jsx("stop", { offset: "0", stopColor: top }),
        jsx("stop", { offset: "0.55", stopColor: "#0D1F33" }),
        jsx("stop", { offset: "1", stopColor: "#06101C" })
      ] }),
      jsx("clipPath", { id: `${gid}C`, clipPathUnits: "userSpaceOnUse", children: jsx("path", { d: sp.d }) })
    ] }),
    jsx("path", { d: sp.d, fill: `url(#${gid}G)` }),
    jsxs("g", { clipPath: `url(#${gid}C)`, "data-probe-skip": true, children: [
      jsx("path", { d: `M${f2(x0 + bw * 1.2)},${f2(y0 - 4)}L${f2(x0 + bw * 2.1)},${f2(y0 - 4)}L${f2(x0 + bw * 1.1)},${f2(y1 + 4)}L${f2(x0 + bw * 0.2)},${f2(y1 + 4)}Z`, fill: "#BFD4EC", opacity: 0.14 + 0.22 * clamp01(l) }),
      jsx("path", { d: `M${f2(x0 + bw * 2.5)},${f2(y0 - 4)}L${f2(x0 + bw * 2.8)},${f2(y0 - 4)}L${f2(x0 + bw * 1.8)},${f2(y1 + 4)}L${f2(x0 + bw * 1.5)},${f2(y1 + 4)}Z`, fill: "#DCE8F6", opacity: 0.1 + 0.16 * clamp01(l) })
    ] }),
    jsx("path", { d: sp.d, fill: "none", stroke: "#08121E", strokeWidth: 2.4, strokeLinejoin: "round" }),
    jsx("path", { d: sp.d, fill: "none", stroke: "#8FB0D6", strokeWidth: 0.8, opacity: 0.28, transform: "translate(0.6 0.9)" })
  ] }, g.id);
}) });
const Seams = ({ rig, map }) => {
  const segs = SEAMS.filter((s) => facing(map, rig, (s[0][0] + s[1][0]) / 2, (s[0][1] + s[1][1]) / 2 * Math.PI / 180).f > 0.05).map((s) => surfPath(map, rig, s, 0.4, false).d);
  const hd = HANDLES.filter((s) => facing(map, rig, s[0][0], s[0][1] * Math.PI / 180).f > 0.1).map((s) => surfPath(map, rig, s, 1.2, false).d);
  return jsxs("g", { "data-probe-skip": true, children: [
    jsx("path", { d: segs.join(""), fill: "none", stroke: "#06111D", strokeWidth: 1.5, opacity: 0.85 }),
    jsx("path", { d: segs.join(""), fill: "none", stroke: "#9DB8D8", strokeWidth: 0.7, opacity: 0.22, transform: "translate(0.8 0.8)" }),
    jsx("path", { d: hd.join(""), fill: "none", stroke: "#06111D", strokeWidth: 3.2, strokeLinecap: "round", opacity: 0.9 }),
    jsx("path", { d: hd.join(""), fill: "none", stroke: "#B7CBE3", strokeWidth: 1, strokeLinecap: "round", opacity: 0.5, transform: "translate(-0.5 -0.8)" })
  ] });
};
// the trim stripe: a band of the lighter steel along the left flank, its gradient following the light along its run
const Stripe = ({ id, rig, map }) => {
  const xs = [];
  for (let x = STRIPE.x0; x <= STRIPE.x1; x += 25) xs.push(x);
  const ok = xs.filter((x) => facing(map, rig, x, (STRIPE.a + STRIPE.b) / 2 * Math.PI / 180).f > 0.02);
  if (ok.length < 2) return null;
  const top = ok.map((x) => [x, STRIPE.a]), bot = [...ok].reverse().map((x) => [x, STRIPE.b]);
  const sp = surfPath(map, rig, [...top, ...bot], 0.5);
  const a = worldScr(rig, map(skinPt(ok[0], 0.7))), b = worldScr(rig, map(skinPt(ok[ok.length - 1], 0.7)));
  const stops = ok.filter((_, i) => i % 3 === 0).map((x) => {
    const fc = facing(map, rig, x, (STRIPE.a + STRIPE.b) / 2 * Math.PI / 180);
    const l = 0.82 * lightOf(fc.vn, 0.62, 30) + 0.42 * reflectStudio(fc.vn, fc.v, rig.persp, 0.3);
    return { t: (x - ok[0]) / (ok[ok.length - 1] - ok[0] || 1), c: rampAt(TRIM, Math.min(1, 0.1 + 0.75 * l)) };
  });
  return jsxs("g", { children: [
    jsx("defs", { "data-probe-skip": true, children: jsx("linearGradient", { id: `${id}St`, gradientUnits: "userSpaceOnUse", x1: f2(a[0]), y1: f2(a[1]), x2: f2(b[0]), y2: f2(b[1]), children: stops.map((s, k) => jsx("stop", { offset: s.t.toFixed(3), stopColor: s.c }, k)) }) }),
    jsx("path", { d: sp.d, fill: `url(#${id}St)` })
  ] });
};
// a spinning rotor: the disc it sweeps (faint) and the blades' motion blur (sectors trailing each blade), never a strobed blade
const RotorBlur = ({ rig, map, c, r, axis, rot, blades = 2, ink = "#9FB4CC", op = 1, hubR = 16, droop = 0, blade = 0 }) => {
  // axis "y": the disc in the x/z plane (main rotor; droop = the tips' sag, the disc a shallow cone); "z": in the x/y plane (tail)
  const P = (a, rr) => axis === "y" ? [c[0] + rr * Math.cos(a), c[1] + droop * (rr / r) * (rr / r), c[2] + rr * Math.sin(a)] : [c[0] + rr * Math.cos(a), c[1] + rr * Math.sin(a), c[2]];
  const S = (a, rr) => worldScr(rig, map(P(a, rr)));
  const ring = (rr) => Array.from({ length: 72 }, (_, i) => S(i / 72 * 2 * Math.PI, rr));
  const rim = ring(r), d = `M${rim.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`;
  const sect = [];
  const K = 9, span = 1.25;
  for (let b = 0; b < blades; b++) {
    const a0 = rot + b * 2 * Math.PI / blades;
    for (let k = 0; k < K; k++) {
      const t0 = a0 - span * (k + 1) / K, t1 = a0 - span * k / K;
      const pts = [];
      for (let q = 0; q <= 3; q++) pts.push(S(t0 + (t1 - t0) * q / 3, r * 0.985));
      for (let q = 3; q >= 0; q--) pts.push(S(t0 + (t1 - t0) * q / 3, hubR));
      sect.push({ d: `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`, o: 0.19 * Math.pow(1 - k / K, 1.6) });
    }
  }
  // the blades themselves, blurred: a slim graphite chord along each blade's leading position (sagging to the tip)
  const bl = blade > 0 ? Array.from({ length: blades }, (_, b) => {
    const a0 = rot + b * 2 * Math.PI / blades;
    const pts = [];
    for (let q = 0; q <= 8; q++) pts.push(S(a0, hubR + (r * 0.99 - hubR) * q / 8));
    return `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}`;
  }) : [];
  return jsxs("g", { opacity: op, children: [
    jsx("path", { d, fill: ink, opacity: 0.05 }),
    sect.map((s, k) => jsx("path", { d: s.d, fill: ink, opacity: s.o }, k)),
    bl.length > 0 && jsx("path", { d: bl.join(""), fill: "none", stroke: "#1E2630", strokeWidth: blade, strokeLinecap: "round", opacity: 0.3 }),
    bl.length > 0 && jsx("path", { d: bl.join(""), fill: "none", stroke: "#C9D6E4", strokeWidth: blade * 0.3, strokeLinecap: "round", opacity: 0.22, transform: "translate(0 -1)" }),
    jsx("path", { d, fill: "none", stroke: ink, strokeWidth: 1.4, opacity: 0.2 })
  ] });
};
/** the helicopter — see the API at the top of this file */
// small anatomy: a glowing light (lens + halo), and dark panel/rivet lines laid on the skin
const Lamp = ({ p, col, halo, r = 3, a = 1 }) => jsxs("g", { children: [
  jsx("circle", { cx: f2(p[0]), cy: f2(p[1]), r: f2(r * 3.2), fill: halo, opacity: 0.35 * a, style: { filter: "blur(3px)" }, "data-probe-skip": true }),
  jsx("circle", { cx: f2(p[0]), cy: f2(p[1]), r: f2(r), fill: col, opacity: 0.95 })
] });
const BOOM_SEAMS = [[[-250, -70], [-250, 70]], [[-400, -70], [-400, 70]], [[-128, -80], [-128, 80]]];
const Details = ({ id, rig, map, zSide, gm, pulse }) => {
  const P = (q) => worldScr(rig, map(q));
  // rivet rows along the boom's flank and along the cabin's lower edge
  const riv = [];
  for (let x = -150; x > -540; x -= 14) if (facing(map, rig, x, 0).f > 0.05) riv.push(worldScr(rig, map(skinPt(x, -0.25 * zSide, 0.6))));
  for (let x = -40; x < 300; x += 16) if (facing(map, rig, x, 1.25 * zSide).f > 0.05) riv.push(worldScr(rig, map(skinPt(x, 1.25 * zSide, 0.6))));
  const seams = BOOM_SEAMS.map((sg) => sg.map(([x, ph]) => [x, ph * zSide])).filter((sg) => facing(map, rig, sg[0][0], 0).f > 0.05).map((sg) => surfPath(map, rig, sg, 0.4, false).d);
  // the engine intake grille on the fairing's flank (five slots)
  const slots = [];
  for (let k = 0; k < 5; k++) {
    const x0 = -46 + k * 13, z = zSide * 35.2;
    slots.push(`M${[[x0, -228, z], [x0 + 8, -228, z], [x0 + 8, -205, z], [x0, -205, z]].map((q) => {
      const s = P(q);
      return `${f2(s[0])},${f2(s[1])}`;
    }).join("L")}Z`);
  }
  const pitot = tubeGeo([[300, -144, zSide * 22], [326, -144, zSide * 24], [352, -146, zSide * 25]], 2.2, 8);
  const ant = tubeGeo([[150, -197, 0], [146, -228, 0], [142, -246, 0]], 1.6, 8);
  const blade = tubeGeo([[-160, -124, 0], [-168, -104, 0]], 3, 8);
  const step = tubeGeo([[150, -24, zSide * 70], [150, -24, zSide * 92]], 3.2, 8);
  const land = P(skinPt(336, 50 * Math.PI / 180, 1.5)), port = P([STAB.x - 10, -164, zSide * (STAB.span + 3)]), tl = P([-602, -150, 0]);
  return jsxs("g", { children: [
    jsxs("g", { "data-probe-skip": true, children: [
      jsx("path", { d: seams.join(""), fill: "none", stroke: "#06111D", strokeWidth: 1.3, opacity: 0.8 }),
      riv.map((q, k) => jsx("circle", { cx: f2(q[0]), cy: f2(q[1]), r: 0.9, fill: "#0A1828", opacity: 0.7 }, k)),
      jsx("path", { d: slots.join(""), fill: "#050C16", opacity: 0.85 }),
      jsx("path", { d: slots.join(""), fill: "none", stroke: "#8FB0D6", strokeWidth: 0.6, opacity: 0.3, transform: "translate(0.6 0.8)" })
    ] }),
    jsx(LoftG, { id: `${id}pt`, rig, map, geo: pitot, mat: gm }),
    jsx(LoftG, { id: `${id}an`, rig, map, geo: ant, mat: gm }),
    jsx(LoftG, { id: `${id}bl`, rig, map, geo: blade, mat: gm }),
    jsx(LoftG, { id: `${id}sp`, rig, map, geo: step, mat: gm }),
    // the landing light in the chin, the position lights: red on the left (port) stabilizer tip, white at the tail
    jsx(Lamp, { p: land, col: "#F4F9FF", halo: "#BFD8F4", r: 3.4 }),
    zSide > 0 && jsx(Lamp, { p: port, col: "#FF5A66", halo: "#EF2B3D", r: 2.6, a: 0.8 + 0.2 * pulse }),
    jsx(Lamp, { p: tl, col: "#F4F9FF", halo: "#CFE3FA", r: 2.4, a: 0.7 })
  ] });
};
export const MyHeli = ({ id, rig, xf, rot = 0, tail = 0, glint = 0, droop = 10 }) => {
  const map = (q) => xfApply(xf, q);
  const near = (s) => s > 0 ? "n" : "f";
  // which side of the body faces the lens (z+ = the left side)
  const zSide = worldView(rig, map([0, -120, 60]))[2] > worldView(rig, map([0, -120, -60]))[2] ? 1 : -1;
  const bm = bodyMat(rig), gm = gearMat(rig);
  const skid = (s) => jsx(LoftG, { id: `${id}sk${near(s)}`, rig, map, geo: tubeGeo(skidPts(s), SKID.r), mat: gm }, `sk${s}`);
  const xt = (s) => jsxs("g", { children: [
    jsx(LoftG, { id: `${id}xa${near(s)}`, rig, map, geo: tubeGeo(crossPts(150, s), 5), mat: gm }),
    jsx(LoftG, { id: `${id}xb${near(s)}`, rig, map, geo: tubeGeo(crossPts(-40, s), 5), mat: gm })
  ] }, `xt${s}`);
  const stab = (s) => jsxs("g", { children: [
    jsx(Flat, { faces: boxFaces([STAB.x, STAB.y, s * STAB.span / 2], [STAB.chord, STAB.t, STAB.span]), map, rig, ramp: BODY, spec: 0.5 }),
    jsx(Flat, { faces: finFaces(PLATE, s * STAB.span, 4), map, rig, ramp: BODY, spec: 0.5 })
  ] }, `st${s}`);
  // the blades' roots and the hub (solid: they turn slowly enough near the axis to read)
  const hub = (() => {
    const pts = [];
    for (let b = 0; b < 2; b++) {
      const a = rot + b * Math.PI;
      pts.push([[HUB[0] + 18 * Math.cos(a), HUB[1], HUB[2] + 18 * Math.sin(a)], [HUB[0] + 62 * Math.cos(a), HUB[1] + 1, HUB[2] + 62 * Math.sin(a)]]);
    }
    return pts;
  })();
  const mastGeo = tubeGeo([[MAST.x, MAST.y0, 0], [MAST.x, MAST.y1, 0]], MAST.r, 16);
  const hubGeo = tubeGeo([[HUB[0], HUB[1] - 7, 0], [HUB[0], HUB[1] + 7, 0]], 17, 18);
  const exhaust = tubeGeo([[-58, -228, -12], [-74, -246, -14], [-86, -252, -15]], 8, 12);
  const beacon = worldScr(rig, map([-578, -262, 0]));
  return jsxs("g", { "data-probe-object": "the helicopter: blue-steel fuselage with its glazing, doors and skids, the engine fairing and mast, the two-blade rotor spinning, the tail boom, fin, stabilizer and tail rotor", children: [
    // far side first
    skid(-zSide),
    xt(-zSide),
    stab(-zSide),
    zSide < 0 && jsx(RotorBlur, { rig, map, c: [TR.c[0], TR.c[1], -TR.c[2]], r: TR.r, axis: "z", rot: tail, hubR: 6, ink: "#A9BCD3" }),
    jsx(Flat, { faces: finFaces(FIN, 0, 7), map, rig, ramp: BODY, spec: 0.5 }),
    jsx(LoftG, { id: `${id}fu`, rig, map, geo: FUSE, mat: bm }),
    jsx(Stripe, { id, rig, map }),
    jsx(Glass, { id, rig, map }),
    jsx(Seams, { rig, map }),
    jsx(Details, { id, rig, map, zSide, gm, pulse: glint }),
    jsx(LoftG, { id: `${id}fa`, rig, map, geo: FAIR, mat: bodyMat(rig, 0.03) }),
    jsx(LoftG, { id: `${id}ex`, rig, map, geo: exhaust, mat: gm }),
    jsx(LoftG, { id: `${id}ma`, rig, map, geo: mastGeo, mat: gm }),
    jsx(LoftG, { id: `${id}hb`, rig, map, geo: hubGeo, mat: gm }),
    hub.map((h, k) => {
      const a = worldScr(rig, map(h[0])), b = worldScr(rig, map(h[1]));
      return jsxs("g", { children: [
        jsx("path", { d: `M${f2(a[0])},${f2(a[1])}L${f2(b[0])},${f2(b[1])}`, stroke: rampAt(GEAR, 0.25), strokeWidth: 9, strokeLinecap: "round" }),
        jsx("path", { d: `M${f2(a[0])},${f2(a[1] - 1.5)}L${f2(b[0])},${f2(b[1] - 1.5)}`, stroke: rampAt(GEAR, 0.75), strokeWidth: 2.2, strokeLinecap: "round", opacity: 0.8 })
      ] }, `hb${k}`);
    }),
    stab(zSide),
    zSide > 0 && jsx(RotorBlur, { rig, map, c: TR.c, r: TR.r, axis: "z", rot: tail, hubR: 6, ink: "#A9BCD3" }),
    zSide > 0 && jsx(LoftG, { id: `${id}tg`, rig, map, geo: tubeGeo([[-592, -196, 4], [-592, -196, 16]], 7, 12), mat: gm }),
    xt(zSide),
    skid(zSide),
    // the anti-collision beacon on the fin's tip: a soft pulse (white, never a red signal)
    jsx("circle", { cx: f2(beacon[0]), cy: f2(beacon[1]), r: 3.2, fill: "#EAF4FF", opacity: 0.55 + 0.45 * glint }),
    glint > 0.02 && jsx("circle", { cx: f2(beacon[0]), cy: f2(beacon[1]), r: 6 + 10 * glint, fill: "#CFE3FA", opacity: 0.35 * glint, style: { filter: "blur(3px)" }, "data-probe-skip": true }),
    jsx(RotorBlur, { rig, map, c: HUB, r: ROTOR_R, axis: "y", rot, hubR: 62, droop, blade: 5 })
  ] });
};
export const heliCorners = (xf) => {
  const out = [];
  for (const x of [-600, 350]) for (const y of [0, -266]) for (const z of [-90, 90]) out.push(xfApply(xf, [x, y, z]));
  return out;
};
export const heliPoint = (xf, which) => xfApply(xf, which === "hub" ? HUB : which === "nose" ? [348, -83, 0] : which === "skidL" ? [40, 0, SKID.z] : [40, -45, 0]);
export const HELI = { rotorR: ROTOR_R, top: -266, len: [-602, 348], skidZ: SKID.z };
