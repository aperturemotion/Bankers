// @ts-nocheck
// ★ V37 "Theranos" — hook_world.tsx (builder H): the hook's (and hype's) little 3-D world. A REAL dolly camera — the eye sits D units
//   from its target and every point projects through F / (D − depth) — so the hook's push-in onto the nanotainer and its hard pull
//   back to the towering plinth are one continuous camera move with true perspective, every part drawn at its final size (no
//   raster scaling). A face painter for machined solids (solid_engine prisms, one key light from the upper left, a studio falloff
//   down tall faces), and the house tile floor (TkFloor's construction) projected through this camera.
//   World: x right, y DOWN, z toward the viewer; the floor at HW_FLOOR_Y.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { theme } from "./theme";
import { cw, lightOf, prism, rampAt } from "./solid_engine";
import { rrectPts } from "./tk_rig";
import { TK_FLOOR, TK_FLOOR_BOLT, TK_FLOOR_SEAM } from "./tk_mat";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const D2R = Math.PI / 180;
export const HW_FLOOR_Y = 1300;
const unit = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
/** the camera: target (tx, ty, 0) drawn at the screen point (ox, oy); the eye D units away along the view axis; F px·units */
export const hwCam = ({ tx, ty, D, F, pitch, yaw, ox = 540, oy = 850 }) => {
  const b = yaw * D2R, a = pitch * D2R, cb = Math.cos(b), sb = Math.sin(b), ca = Math.cos(a), sa = Math.sin(a);
  const rot = (q) => {
    const x1 = q[0] * cb + q[2] * sb, z1 = -q[0] * sb + q[2] * cb;
    return [x1, q[1] * ca - z1 * sa, q[1] * sa + z1 * ca];
  };
  const V = (w) => rot([w[0] - tx, w[1] - ty, w[2]]);
  const K = (w) => F / Math.max(1, D - V(w)[2]);
  const P = (w) => {
    const v = V(w), k = F / Math.max(1, D - v[2]);
    return [ox + v[0] * k, oy + v[1] * k];
  };
  const facing = (w, n) => {
    const v = V(w), m = rot(n);
    return m[0] * -v[0] + m[1] * -v[1] + m[2] * (D - v[2]);
  };
  const light = (n, spec = 0.5, shin = 26) => lightOf(unit(rot(n)), spec, shin);
  return { P, V, K, facing, light, rot, tx, ty, D, F, pitch, yaw, ox, oy };
};
export const hwPath = (cam, pts, close = true) => `M${pts.map((p) => {
  const q = cam.P(p);
  return `${f2(q[0])},${f2(q[1])}`;
}).join("L")}${close ? "Z" : ""}`;
export const scrPathH = (pts, close = true) => pts.length ? `M${pts.map((q) => `${f2(q[0])},${f2(q[1])}`).join("L")}${close ? "Z" : ""}` : "";
/** a vertical machined block: cross-section w × d (x × z) with chamfered vertical edges (ch), bevelled top/bottom edges (bev),
 *  from y0 (top) to y1 (bottom), centred on (x, z). Faces in world coords (solid_engine's prism, turned upright). */
export const hwBlock = (x, z, w, d, y0, y1, { ch = 10, bev = 5, seg = 1, mat = 0, pass = 0 } = {}) => {
  const sec = cw(rrectPts(w, d, ch, seg));
  const h = y1 - y0, yc = (y0 + y1) / 2;
  return prism(sec, h, bev, mat, pass).map((f) => ({
    ...f,
    pts: f.pts.map((p) => [p[0] + x, p[2] + yc, p[1] + z]),
    n: [f.n[0], f.n[2], f.n[1]],
    top: f.cap && f.n[2] < 0
  }));
};
/** a disc (a short vertical cylinder) of radius r from y0 to y1 at (x, z) */
export const hwDisc = (x, z, r, y0, y1, { bev = 1.5, seg = 40, mat = 0, pass = 0 } = {}) => {
  const sec = cw(Array.from({ length: seg }, (_, i) => [r * Math.cos(i / seg * 2 * Math.PI), r * Math.sin(i / seg * 2 * Math.PI)]));
  const h = y1 - y0, yc = (y0 + y1) / 2;
  return prism(sec, h, bev, mat, pass).map((f) => ({ ...f, pts: f.pts.map((p) => [p[0] + x, p[2] + yc, p[1] + z]), n: [f.n[0], f.n[2], f.n[1]], top: f.cap && f.n[2] < 0 }));
};
/** paint faces: cull, light, sort by pass then depth. Each face gets a gradient down its height: lit at the top, falling off
 *  toward the floor (the studio light on a tall object), scaled by `fall(y)` (0…1 brightness at world height y). */
export const hwPaint = (cam, faces, { ramp, spec = 0.55, fall = () => 1, tone } = {}) => {
  const out = [];
  for (const f of faces) {
    const c = f.pts.reduce((a, p) => [a[0] + p[0] / f.pts.length, a[1] + p[1] / f.pts.length, a[2] + p[2] / f.pts.length], [0, 0, 0]);
    if (cam.facing(c, f.n) <= 1e-6) continue;
    const vp = f.pts.map((p) => cam.V(p));
    const depth = vp.reduce((a, v) => a + v[2], 0) / vp.length;
    const sp = f.pts.map((p) => cam.P(p));
    const l = cam.light(f.n, f.cap ? 0.25 : spec);
    const ys = f.pts.map((p) => p[1]), yT = Math.min(...ys), yB = Math.max(...ys);
    const iT = sp.reduce((a, p, i) => f.pts[i][1] < f.pts[a][1] ? i : a, 0), iB = sp.reduce((a, p, i) => f.pts[i][1] > f.pts[a][1] ? i : a, 0);
    const base = tone ? tone(l, f) : f.bev ? Math.min(1, 0.95 * l + 0.14) : f.cap ? 0.7 * l + 0.05 : 0.82 * l + 0.03;
    out.push({ d: scrPathH(sp), face: f, depth, base, ramp: f.ramp ?? ramp, gT: sp[iT], gB: sp[iB], kT: fall(yT), kB: fall(yB), tall: yB - yT > 40 });
  }
  return out.sort((a, b) => a.face.pass - b.face.pass || a.depth - b.depth);
};
export const HwFaces = ({ id, cam, faces, ramp, spec, fall, tone, dim = 0, stroke = true }) => {
  const dws = hwPaint(cam, faces, { ramp, spec, fall, tone });
  return jsx(jsx_runtime.Fragment, { children: dws.map((dw, k) => {
    const cT = rampAt(dw.ramp, dw.base * dw.kT * (1 - dim) + 0.06 * (1 - dw.kT)), cB = rampAt(dw.ramp, dw.base * dw.kB * (1 - dim) - 0.05 + 0.06 * (1 - dw.kB));
    if (!dw.tall) return jsx("path", { d: dw.d, fill: cT, stroke: stroke ? cT : "none", strokeWidth: 0.6, strokeLinejoin: "round" }, k);
    const gid = `${id}g${k}`;
    return jsxs("g", { children: [
      jsx("defs", { children: jsxs("linearGradient", { id: gid, gradientUnits: "userSpaceOnUse", x1: f2(dw.gT[0]), y1: f2(dw.gT[1]), x2: f2(dw.gB[0]), y2: f2(dw.gB[1]), children: [
        jsx("stop", { offset: "0", stopColor: cT }),
        jsx("stop", { offset: "1", stopColor: cB })
      ] }) }),
      jsx("path", { d: dw.d, fill: `url(#${gid})`, stroke: stroke ? `url(#${gid})` : "none", strokeWidth: 0.6, strokeLinejoin: "round" })
    ] }, k);
  }) });
};
/** a slotted machine screw set into a face: centre c (world), its face's two in-plane unit axes u, v and normal n */
export const HwScrew = ({ cam, c, u, v, r = 7, slot = 35 }) => {
  const at = (a, b, lift = 0) => [c[0] + u[0] * a + v[0] * b + lift * (u[1] * v[2] - u[2] * v[1]) * 0, c[1] + u[1] * a + v[1] * b, c[2] + u[2] * a + v[2] * b];
  const ring = (rr) => Array.from({ length: 20 }, (_, i) => at(rr * Math.cos(i / 20 * 2 * Math.PI), rr * Math.sin(i / 20 * 2 * Math.PI)));
  const s = slot * D2R, sx = Math.cos(s) * r * 0.66, sy = Math.sin(s) * r * 0.66;
  const k = cam.K(c);
  const p0 = cam.P(at(-r, -r)), p1 = cam.P(at(r, r));
  const gid = `hwS${Math.round(c[0])}_${Math.round(c[1])}_${Math.round(c[2])}`;
  return jsxs("g", { children: [
    jsx("defs", { children: jsxs("linearGradient", { id: gid, gradientUnits: "userSpaceOnUse", x1: f2(p0[0]), y1: f2(p0[1]), x2: f2(p1[0]), y2: f2(p1[1]), children: [
      jsx("stop", { offset: "0", stopColor: "#E9F0F8" }),
      jsx("stop", { offset: "0.45", stopColor: "#7D93AE" }),
      jsx("stop", { offset: "1", stopColor: "#1A2A40" })
    ] }) }),
    jsx("path", { d: hwPath(cam, ring(r + 1.8)), fill: "#050E1C", opacity: 0.55 }),
    jsx("path", { d: hwPath(cam, ring(r)), fill: `url(#${gid})` }),
    jsx("path", { d: hwPath(cam, [at(-sx, -sy), at(sx, sy)], false), stroke: "#0A1626", strokeWidth: Math.max(0.6, 1.5 * k), opacity: 0.85, fill: "none" })
  ] });
};
const hull = (pts) => {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  for (const q of [...p].reverse()) {
    while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop();
    hi.push(q);
  }
  return [...lo.slice(0, -1), ...hi.slice(0, -1)];
};
// the key light's direction across the floor (shadows lean away from the upper-left light: right and back)
const KEYDIR = { x: 0.5, z: -0.62 };
/** the house tile floor (TkFloor's seams, studs, radial lift and contact shadows), projected through the hook camera.
 *  casters: [{ corners: [[x,y,z]…], k }] — each object's shadow, darkest at its foot, leaning away from the key light. */
export const HwFloor = ({ id, cam, at, reach = 1500, casters = [], stage = 0, on = 1, T = 130 }) => {
  const FY = HW_FLOOR_Y;
  const P = (x, z, y = FY) => cam.P([x, y, z]);
  const ink = (k) => mixHex(rampAt(TK_FLOOR, k), theme.bgLight, 0.78 * stage);
  const X0 = at.x - 2.2 * reach, X1 = at.x + 2.2 * reach, Z0 = at.z - 2.4 * reach, Z1 = at.z + 0.9 * reach;
  const outer = scrPathH([P(X0, Z0), P(X1, Z0), P(X1, Z1), P(X0, Z1)]);
  const c0 = P(at.x, at.z), cS = P(at.x + reach, at.z), cF = P(at.x, at.z - reach * 1.4), cN = P(at.x, at.z + reach * 0.7);
  const rx = Math.max(1, Math.abs(cS[0] - c0[0])), ry = Math.max(30, Math.abs(cF[1] - c0[1]), Math.abs(cN[1] - c0[1]));
  const reachOf = (x, z) => Math.hypot((x - at.x) / reach, (z - at.z) / (z < at.z ? reach * 1.4 : reach * 0.7));
  const alphaAt = (x, z) => clamp01(1.1 - reachOf(x, z));
  const seams = [], studs = [];
  const gx0 = Math.floor(X0 / T) * T, gz0 = Math.floor(Z0 / T) * T;
  const k0 = cam.K([at.x, FY, at.z]);
  for (let x = gx0; x <= X1; x += T) for (let z = gz0; z < Z1; z += T) {
    const a1 = alphaAt(x, z + T / 2);
    if (a1 > 0.03) seams.push({ d: scrPathH([P(x, z), P(x, z + T)], false), a: a1 });
    const a2 = alphaAt(x + T / 2, z);
    if (a2 > 0.03 && x + T <= X1) seams.push({ d: scrPathH([P(x, z), P(x + T, z)], false), a: a2 });
    for (const [dx, dz] of [[14, 14], [T - 14, 14], [14, T - 14], [T - 14, T - 14]]) {
      const a = alphaAt(x + dx, z + dz) * 0.75;
      if (a > 0.06) studs.push({ p: P(x + dx, z + dz), a, k: cam.K([x + dx, FY, z + dz]) });
    }
  }
  const shades = casters.map((c) => {
    const pts = c.corners.map(([x, y, z]) => {
      const d2 = Math.max(0, FY - y);
      return P(x + KEYDIR.x * d2, z + KEYDIR.z * d2);
    });
    const foot = c.corners.reduce((a, q) => q[1] > a[1] ? q : a, c.corners[0]);
    const top = c.corners.reduce((a, q) => q[1] < a[1] ? q : a, c.corners[0]);
    const lift = Math.max(0, FY - foot[1]), d = FY - top[1];
    const mx = c.corners.reduce((a, q) => a + q[0] / c.corners.length, 0), mz = c.corners.reduce((a, q) => a + q[2] / c.corners.length, 0);
    return { d: scrPathH(hull(pts)), a: P(mx, mz), b: P(mx + KEYDIR.x * d, mz + KEYDIR.z * d), op: (c.k ?? 1) * 0.62 / (1 + lift / 400) * (1 - 0.7 * stage), soft: (8 + lift / 30) * k0 };
  });
  return jsxs("svg", { "data-probe": "bg", width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible", opacity: on }, children: [
    jsxs("defs", { children: [
      jsxs("radialGradient", { id: `${id}Fl`, gradientUnits: "userSpaceOnUse", cx: f2(c0[0]), cy: f2(c0[1]), r: f2(rx), gradientTransform: `translate(${f2(c0[0])} ${f2(c0[1])}) scale(1 ${(ry / rx).toFixed(4)}) translate(${f2(-c0[0])} ${f2(-c0[1])})`, children: [
        jsx("stop", { offset: "0", stopColor: ink(0.62) }),
        jsx("stop", { offset: "0.3", stopColor: ink(0.48) }),
        jsx("stop", { offset: "0.62", stopColor: ink(0.32), stopOpacity: 0.85 }),
        jsx("stop", { offset: "1", stopColor: ink(0.2), stopOpacity: 0 })
      ] }),
      shades.map((s, k) => jsxs("linearGradient", { id: `${id}Sh${k}`, gradientUnits: "userSpaceOnUse", x1: f2(s.a[0]), y1: f2(s.a[1]), x2: f2(s.b[0]), y2: f2(s.b[1]), children: [
        jsx("stop", { offset: "0", stopColor: "#000000", stopOpacity: 1 }),
        jsx("stop", { offset: "0.6", stopColor: "#000000", stopOpacity: 0.45 }),
        jsx("stop", { offset: "1", stopColor: "#000000", stopOpacity: 0.1 })
      ] }, k))
    ] }),
    jsx("path", { d: outer, fill: `url(#${id}Fl)` }),
    seams.map((s, k) => jsx("path", { d: s.d, stroke: TK_FLOOR_SEAM, strokeWidth: 2.4 * k0, opacity: 0.9 * s.a, fill: "none" }, k)),
    seams.map((s, k) => jsx("path", { d: s.d, stroke: ink(0.75), strokeWidth: 0.8 * k0, opacity: 0.18 * s.a, fill: "none", transform: `translate(${f2(0.8 * k0)} ${f2(1.2 * k0)})` }, `l${k}`)),
    studs.map((b, k) => jsx("ellipse", { cx: f2(b.p[0]), cy: f2(b.p[1]), rx: f2(4 * b.k), ry: f2(2.4 * b.k), fill: TK_FLOOR_BOLT, opacity: b.a }, `b${k}`)),
    shades.map((s, k) => jsx("path", { d: s.d, fill: `url(#${id}Sh${k})`, opacity: s.op, stroke: "#000000", strokeOpacity: 0.3, strokeWidth: s.soft, strokeLinejoin: "round" }, `s${k}`))
  ] });
};
/** an affine SVG transform mapping a plane's local (u right, v down) units to the screen at world point c (axes u, v) */
export const hwPlaneXf = (cam, c, u, v) => {
  const p = cam.P(c), pu = cam.P([c[0] + u[0], c[1] + u[1], c[2] + u[2]]), pv = cam.P([c[0] + v[0], c[1] + v[1], c[2] + v[2]]);
  return `matrix(${(pu[0] - p[0]).toFixed(5)} ${(pu[1] - p[1]).toFixed(5)} ${(pv[0] - p[0]).toFixed(5)} ${(pv[1] - p[1]).toFixed(5)} ${f2(p[0])} ${f2(p[1])})`;
};
