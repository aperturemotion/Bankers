// @ts-nocheck
// ★ V37 "Theranos" — builder M. THE STORES of the backers place (the film's ONE grid): forty small pharmacy storefronts — "about
//   forty stores" — REV2 (Timur: "more space between the stores … it kind of looks like a staircase"): laid out like the blocks of
//   a TOWN on the floor, five rows of eight standing apart — each store its own little building with clear pavement between its
//   neighbours, each row on its own concrete pavement strip with a curb, open floor between the rows, the rows staggered by half a
//   store (no steps, no risers joining them). Each store is a real single-storey shopfront: its body, a parapet fascia with the
//   sign panel, a projecting awning with its valance, a shop window (mullions, shelves of stock seen when lit), a glass door with
//   its frame and pull bar, a kick plate, and a rooftop unit. The stores LIGHT one after another in a quick narrow wave (the
//   window and door glow, the sign lights, a soft spill on the step in front).
//   Terrace-local frame: origin at the floor under the front row's front centre, x across, y DOWN, z toward the viewer.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { box3, rampAt } from "./solid_engine";
import { mapPath, mapScr, worldView, xfApply } from "./tk_rig";
import { BR_EDGE, BR_PED, BR_STEEL, Painted, painted } from "./backers_kit";
import { HS_DOOR, HS_STONE, HS_TRIM, HS_WALL } from "./honest_mat_b";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
export const ST = { cols: 8, rows: 5, SW: 118, SH: 100, SD: 86, gap: 62, RD: 330, set: 26, walk: 72 };
if (ST.cols * ST.rows !== 40) throw new Error("backers_stores: the block must hold the ~40 stores the line names");
const PX = ST.SW + ST.gap;
export const ST_W = ST.cols * PX + PX / 2;
const STAND_W = ST_W + 40;
// every store stands on the floor (y 0); row r's pavement front is at z −r·RD; odd rows are staggered half a store to the right
const stepY = (r) => 0;
const stepZ = (r) => -r * ST.RD;
const rowShift = (r) => (r % 2 ? 0.25 : -0.25) * PX;
export const storeFoot = (r, c) => [(c - (ST.cols - 1) / 2) * PX + rowShift(r), 0, stepZ(r) - ST.set];
if (ST.RD - ST.SD - ST.set - ST.walk < 120) throw new Error("backers_stores: open floor must show between the rows");
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
// a row's pavement: a low concrete strip under the row and in front of it, its front curb in steel-grey
const walkFaces = (r) => {
  const w = ST.cols * PX + 10, cx = rowShift(r), z0 = stepZ(r), zb = z0 - ST.set - ST.SD - 12;
  const d = z0 - zb;
  return [
    ...box3([cx, -3, (z0 + zb) / 2], [w, 6, d], 3, 0),
    ...box3([cx, -4, z0 - 3], [w + 4, 8, 6], 4, 0)
  ];
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
  const zb = stepZ(ST.rows - 1) - ST.set - ST.SD - 12;
  for (const x of [-STAND_W / 2, STAND_W / 2]) for (const z of [0, zb]) out.push(xfApply(pose, [x, 0, z]), xfApply(pose, [x, -ST.SH - 18, z]));
  return out;
};
/** world points of the block: its top centre (over the back row) and its foot centre (the front pavement) */
export const terraceTop = (pose) => xfApply(pose, [0, -ST.SH - 20, stepZ(ST.rows - 1) - ST.set]);
export const terraceFoot = (pose) => xfApply(pose, [0, 0, 0]);
const WIN_ON = "#E6F0FB", WIN_OFF = "#0F2036", SIGN_ON = "#F4F8FD";
/** the terrace. litAt(r, c) → { on 0…1, flash 0…1 } for each store */
export const Terrace = ({ id, rig, pose, litAt }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  // back row first (each row's pavement, then its stores nearest-last), so rows nearer the lens paint over the ones behind
  const items = [];
  for (let r = ST.rows - 1; r >= 0; r--) {
    items.push({ walk: r, dws: once(keyOf(rig, `${id}w${r}`), () => painted(walkFaces(r), map, rig, 0.3)) });
    const row = Array.from({ length: ST.cols }, (_, c) => c).sort((a, b) => worldView(rig, map(storeFoot(r, a)))[2] - worldView(rig, map(storeFoot(r, b)))[2]);
    for (const c of row) items.push({ r, c, dws: once(keyOf(rig, `${id}${r}_${c}`), () => painted(storeFaces(r, c), map, rig, 0.45)) });
  }
  const MATS = [HS_TRIM, HS_DOOR, BR_PED, HS_STONE, BR_STEEL];
  return jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    items.map((it) => it.walk === void 0 ? null : jsx(Painted, { dws: it.dws, mats: MATS, dim: 0.35 }, `w${it.walk}`)),
    items.filter((it) => it.walk === void 0).map(({ r, c, dws }) => {
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
