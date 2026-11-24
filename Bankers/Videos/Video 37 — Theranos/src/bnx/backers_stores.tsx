// @ts-nocheck
// ★ V37 "Theranos" — builder M. THE STORES of the backers place (the film's ONE grid): forty small pharmacy storefronts — "about
//   forty stores" — set out as a TERRACE, five stepped rows of eight on a stepped satin-graphite stand (a steel nosing on each
//   step), every row raised so each front reads. Each store is a real single-storey shopfront: its body, a parapet fascia with the
//   sign panel, a projecting awning with its valance, a shop window (mullions, shelves of stock seen when lit), a glass door with
//   its frame and pull bar, a kick plate, and a rooftop unit. The stores LIGHT one after another in a quick narrow wave (the
//   window and door glow, the sign lights, a soft spill on the step in front).
//   Terrace-local frame: origin at the floor under the front row's front centre, x across, y DOWN, z toward the viewer.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { box3, rampAt } from "./solid_engine";
import { mapPath, mapScr, xfApply } from "./tk_rig";
import { BR_EDGE, BR_PED, BR_STEEL, Painted, painted } from "./backers_kit";
import { HS_DOOR, HS_TRIM, HS_WALL } from "./honest_mat_b";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
export const ST = { cols: 8, rows: 5, SW: 118, SH: 100, SD: 86, gap: 10, RH: 78, RD: 150, set: 18 };
if (ST.cols * ST.rows !== 40) throw new Error("backers_stores: the terrace must hold the ~40 stores the line names");
export const ST_W = ST.cols * ST.SW + (ST.cols - 1) * ST.gap;
const STAND_W = ST_W + 70;
// row r stands on its step: the step's top surface (y) and front (z)
const stepY = (r) => -(r + 1) * ST.RH;
const stepZ = (r) => -r * ST.RD;
export const storeFoot = (r, c) => [(c - (ST.cols - 1) / 2) * (ST.SW + ST.gap), stepY(r), stepZ(r) - ST.set];
// the order the stores light in: a diagonal front leaning to the right, so the wave runs across the terrace left → right
export const storeOrder = (() => {
  const keys = [];
  for (let r = 0; r < ST.rows; r++) for (let c = 0; c < ST.cols; c++) keys.push({ r, c, k: c + 0.55 * r });
  const s = [...keys].sort((a, b) => a.k - b.k);
  const out = {};
  s.forEach((q, i) => out[`${q.r},${q.c}`] = i / (s.length - 1));
  return out;
})();
// mats: 0 wall · 1 trim (fascia, awning) · 2 roof graphite · 3 stand · 4 steel nosing
const storeFaces = (r, c) => {
  const [x, y, z] = storeFoot(r, c);
  const { SW, SH, SD } = ST;
  const B = (cx, cy, cz, w, h, d, mat, pass) => box3([x + cx, y + cy, z + cz], [w, h, d], mat, pass);
  return [
    ...B(0, -SH / 2, -SD / 2, SW, SH, SD, 0, 1),
    ...B(0, -SH + 8, -SD / 2 + 4, SW + 4, 24, SD + 8, 1, 2),
    ...B(0, -2.5, 1.5, SW - 2, 5, 3, 2, 2),
    ...B(-SW / 2 + 30, -SH - 10, -SD + 26, 34, 16, 26, 2, 2)
  ];
};
// the awning, a sloped canopy (its top face and its valance) — drawn as quads on the store's front
const awningPts = (r, c) => {
  const [x, y, z] = storeFoot(r, c);
  const { SW, SH } = ST;
  const xl = x - SW / 2 + 3, xr = x + SW / 2 - 3;
  const yb = y - SH + 20, yf = y - SH + 30, zb = z + 8, zt = z + 26;
  return {
    top: [[xl, yb, zb], [xr, yb, zb], [xr, yf, zt], [xl, yf, zt]],
    val: [[xl, yf, zt], [xr, yf, zt], [xr, yf + 6, zt], [xl, yf + 6, zt]]
  };
};
const standFaces = () => {
  const out = [];
  for (let r = 0; r < ST.rows; r++) {
    const h = (r + 1) * ST.RH, d = ST.RD;
    out.push(...box3([0, -h / 2, stepZ(r) - d / 2], [STAND_W, h, d], 3, 0));
    out.push(...box3([0, stepY(r) + 4, stepZ(r) - 4], [STAND_W + 6, 8, 10], 4, 0));
  }
  return out;
};
const memo = new Map();
const keyOf = (rig, s) => `${s}|${rig.cx}|${rig.cy}|${rig.yaw}|${rig.pitch}|${rig.persp}`;
const once = (k, fn) => {
  if (memo.size > 600) memo.clear();
  if (!memo.has(k)) memo.set(k, fn());
  return memo.get(k);
};
export const terraceCorners = (pose) => {
  const out = [];
  for (const x of [-STAND_W / 2, STAND_W / 2]) for (const z of [0, stepZ(ST.rows - 1) - ST.RD]) out.push(xfApply(pose, [x, 0, z]), xfApply(pose, [x, stepY(ST.rows - 1) - ST.SH, z]));
  return out;
};
/** world points of the terrace: its top centre (over the back row) and its foot centre (the front step) */
export const terraceTop = (pose) => xfApply(pose, [0, stepY(ST.rows - 1) - ST.SH - 20, stepZ(ST.rows - 1) - ST.set]);
export const terraceFoot = (pose) => xfApply(pose, [0, 0, 0]);
const WIN_ON = "#E6F0FB", WIN_OFF = "#0F2036", SIGN_ON = "#F4F8FD";
/** the terrace. litAt(r, c) → { on 0…1, flash 0…1 } for each store */
export const Terrace = ({ id, rig, pose, litAt }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const stand = once(keyOf(rig, `${id}s`), () => painted(standFaces(), map, rig, 0.4));
  // every store, back row first (rows nearer the lens paint over the ones behind)
  const stores = [];
  for (let r = ST.rows - 1; r >= 0; r--) for (let c = 0; c < ST.cols; c++) stores.push({ r, c, dws: once(keyOf(rig, `${id}${r}_${c}`), () => painted(storeFaces(r, c), map, rig, 0.45)) });
  const MATS = [HS_TRIM, HS_DOOR, BR_PED, HS_WALL, BR_STEEL];
  return jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    jsx(Painted, { dws: stand, mats: MATS }),
    stores.map(({ r, c, dws }) => {
      const { on, flash } = litAt(r, c);
      const [x, y, z] = storeFoot(r, c);
      const { SW, SH } = ST;
      const zf = z + 0.4;
      const glass = (x0, x1, y0, y1) => P([[x0, y0, zf], [x1, y0, zf], [x1, y1, zf], [x0, y1, zf]]);
      const win = { x0: x - SW / 2 + 7, x1: x + SW / 2 - 40, y0: y - 9, y1: y - SH + 41 };
      const door = { x0: x + SW / 2 - 33, x1: x + SW / 2 - 8, y0: y - 5, y1: y - SH + 41 };
      const glow = clamp01(on), fl = clamp01(flash);
      const winC = mixHex(WIN_OFF, WIN_ON, 0.82 * glow + 0.18 * fl);
      const aw = awningPts(r, c);
      const sign = P([[x - SW / 2 + 12, y - SH + 1, z + 8.4], [x + SW / 2 - 12, y - SH + 1, z + 8.4], [x + SW / 2 - 12, y - SH + 15, z + 8.4], [x - SW / 2 + 12, y - SH + 15, z + 8.4]]);
      const shelves = [0.32, 0.6].map((k) => win.y0 + (win.y1 - win.y0) * k);
      const spill = P([[x - SW / 2 + 4, y, z + 2], [x + SW / 2 - 4, y, z + 2], [x + SW / 2 + 10, y, z + 34], [x - SW / 2 - 10, y, z + 34]]);
      return jsxs("g", { children: [
        jsx(Painted, { dws, mats: MATS, dim: 0.3 * (1 - glow), lift: 0.06 * fl }),
        // the awning (its sloped top lit from above, the valance in shade)
        jsx("path", { d: P(aw.top), fill: rampAt(BR_EDGE, 0.55 + 0.12 * glow), stroke: rampAt(BR_EDGE, 0.55 + 0.12 * glow), strokeWidth: 0.5 }),
        // the awning's stripes (alternate panels of the canvas, a shade darker)
        jsx("path", { d: Array.from({ length: 4 }, (_, i) => {
          const u0 = aw.top[0][0] + (2 * i + 1) * (aw.top[1][0] - aw.top[0][0]) / 8, u1 = u0 + (aw.top[1][0] - aw.top[0][0]) / 8;
          return P([[u0, aw.top[0][1], aw.top[0][2]], [u1, aw.top[0][1], aw.top[0][2]], [u1, aw.top[2][1], aw.top[2][2]], [u0, aw.top[2][1], aw.top[2][2]]]);
        }).join(""), fill: rampAt(BR_EDGE, 0.36 + 0.08 * glow) }),
        jsx("path", { d: P(aw.val), fill: rampAt(BR_EDGE, 0.3 + 0.1 * glow) }),
        jsx("path", { d: P([[aw.val[0][0], aw.val[0][1], aw.val[0][2]], [aw.val[1][0], aw.val[1][1], aw.val[1][2]]], false), stroke: "#ffffff", strokeOpacity: 0.3, strokeWidth: 0.8, fill: "none" }),
        // the sign panel on the fascia
        jsx("path", { d: sign, fill: mixHex("#1A2F4A", SIGN_ON, 0.9 * glow + 0.1 * fl), stroke: "#000000", strokeOpacity: 0.4, strokeWidth: 0.8 }),
        // the sign's roundel and its lettering (a stroke of ink; the brand itself is the label over the terrace)
        jsx("path", { d: P(Array.from({ length: 16 }, (_, i) => [x - SW / 2 + 22 + 5.5 * Math.cos(i / 16 * 2 * Math.PI), y - SH + 8 + 5.5 * Math.sin(i / 16 * 2 * Math.PI), z + 8.6])), fill: mixHex("#22406A", "#1D3D66", glow) }),
        jsx("path", { d: P([[x - SW / 2 + 22, y - SH + 4.6, z + 8.8], [x - SW / 2 + 22, y - SH + 11.4, z + 8.8]], false) + P([[x - SW / 2 + 18.6, y - SH + 8, z + 8.8], [x - SW / 2 + 25.4, y - SH + 8, z + 8.8]], false), stroke: mixHex("#5D86B8", "#F4F8FD", glow), strokeWidth: 1.8, fill: "none" }),
        jsx("path", { d: P([[x - SW / 2 + 34, y - SH + 8, z + 8.6], [x + SW / 2 - 22, y - SH + 8, z + 8.6]], false), stroke: mixHex("#24446E", "#1D3D66", glow), strokeOpacity: 0.35 + 0.4 * glow, strokeWidth: 3.6, fill: "none", strokeLinecap: "round" }),
        // the window: frame, glass, a mullion, shelves of stock when lit
        jsx("path", { d: glass(win.x0 - 3, win.x1 + 3, win.y0 + 3, win.y1 - 3), fill: rampAt(HS_TRIM, 0.3) }),
        jsx("path", { d: glass(win.x0, win.x1, win.y0, win.y1), fill: winC }),
        glow > 0.02 && shelves.map((sy, k) => jsx("path", { d: P([[win.x0 + 2, sy, zf + 0.1], [win.x1 - 2, sy, zf + 0.1]], false), stroke: "#4D7FBA", strokeOpacity: 0.7 * glow, strokeWidth: 2, fill: "none" }, `sh${k}`)),
        glow > 0.02 && shelves.map((sy, k) => jsx("path", { d: P(Array.from({ length: 5 }, (_, i) => {
          const u = win.x0 + 5 + i * (win.x1 - win.x0 - 10) / 5;
          return [[u, sy - 1, zf + 0.1], [u + 6, sy - 1, zf + 0.1], [u + 6, sy - 8 - (i % 2) * 3, zf + 0.1], [u, sy - 8 - (i % 2) * 3, zf + 0.1]];
        }).flat(), true), fill: "#7FA3CE", opacity: 0.55 * glow }, `st${k}`)),
        jsx("path", { d: P([[(win.x0 + win.x1) / 2, win.y0, zf + 0.2], [(win.x0 + win.x1) / 2, win.y1, zf + 0.2]], false), stroke: rampAt(HS_TRIM, 0.35), strokeWidth: 2, fill: "none" }),
        // the door: frame, glass, pull bar
        jsx("path", { d: glass(door.x0 - 2.5, door.x1 + 2.5, door.y0 + 0.5, door.y1 - 2.5), fill: rampAt(HS_TRIM, 0.3) }),
        jsx("path", { d: glass(door.x0, door.x1, door.y0, door.y1), fill: mixHex(WIN_OFF, WIN_ON, 0.66 * glow + 0.18 * fl) }),
        jsx("path", { d: P([[door.x0 + 4, door.y0 - 22, zf + 0.3], [door.x0 + 4, door.y0 - 36, zf + 0.3]], false), stroke: rampAt(BR_STEEL, 0.8), strokeWidth: 2, fill: "none", strokeLinecap: "round" }),
        // the glass's sheen (the key light from the upper left)
        jsx("path", { d: P([[win.x0 + 4, win.y1 + 2, zf + 0.3], [win.x0 + 18, win.y1 + 2, zf + 0.3], [win.x0 + 6, win.y0 - 2, zf + 0.3], [win.x0 + 2, win.y0 - 2, zf + 0.3]]), fill: "#ffffff", opacity: 0.08 + 0.05 * glow }),
        // the spill of light on the step in front
        glow > 0.02 && jsx("path", { d: spill, fill: "#BFD5EF", opacity: 0.16 * glow + 0.12 * fl, style: { mixBlendMode: "screen" } })
      ] }, `${r}_${c}`);
    })
  ] });
};
