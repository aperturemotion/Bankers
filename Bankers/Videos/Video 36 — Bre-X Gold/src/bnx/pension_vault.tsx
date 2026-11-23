// @ts-nocheck
// ★ V36 "Bre-X Gold" — builder F. THE VAULT CABINET of the pension place: a bank vault's steel cabinet — a crown cap, a body with a
//   brushed face, a recessed toe plinth, fifteen safe-deposit box doors (each with its number plate, the two locks of dual control and
//   two hinge knuckles) and, at the top, the plan's heavy drawer: a steel front with its engraved nameplate ONTARIO TEACHERS', a bar
//   pull on two posts, two keyholes and corner screws, riding out on full-extension slides. The drawer's FLOOR is a pair of trap
//   flaps (the bottom falls out): they swing down on their hinges and the banded cash in the drawer falls through and away.
//   Parts the drawer carries INSIDE the cabinet are drawn only through the opening (STYLE 2026-10-22: a drawer never passes through
//   its own carcass): the drawer group is clipped to the hull of the opening and the drawer's protruding volume.
//   Local coordinates: u (x) right, v (y) DOWN (the floor is v 0, the cabinet rises to negative v), w (z) toward the viewer.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { label } from "./kit";
import { cylW, prism, rampAt } from "./solid_engine";
import { XPlane, facingM, mapPath, mapScr, paintXf, rrectPts, worldScr, wound, xfApply, xfMul, xfRotX, xfRotZ, xfTrans } from "./tk_rig";
import { Faces, Screw, vCyl } from "./counter_plinth";
import { Engraved } from "./counter_drums";
import { SF_BODY, SF_DOOR, SF_GROOVE, SF_LIP, SF_STEEL } from "./lotteries_mat";
import { PL_PLATE, PL_RECESS, PL_RUBBER, PL_WALL } from "./counter_mat";
import { INK } from "./tk_mat";
import { Turned } from "./pension_turned";

const f2 = (v) => v.toFixed(2);
// ── the cabinet ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const VT = { W: 720, D: 560, H: 1220, crown: 24, over: 12, plinth: 66, toe: 24 };
export const ZF = VT.D / 2;
const V_TOP = -VT.H;                       // the body's top (the crown sits on it)
export const V_CROWN = V_TOP - VT.crown;    // the cabinet's highest point
// the drawer's opening and the drawer (front panel inset in the opening with a 6-px reveal)
const OP = { u: 328, v0: V_TOP + 34, v1: V_TOP + 34 + 166 };
export const DR = { W: 644, v0: OP.v0 + 6, v1: OP.v1 - 6, t: 26, boxW: 624, wall: 10, boxD: 480, floorT: 10, ext: 450 };
const BOX = { v0: DR.v0 + 22, v1: DR.v1 - 6 };          // the box's walls run v0 → v1 (the floor's underside)
export const FLOOR_TOP = BOX.v1 - DR.floorT;            // the inner floor (the flaps' top surface)
const IN_U = DR.boxW / 2 - DR.wall;                      // the inner half-width
// the hatch: an opening in the floor from the back flap's hinge to the front flap's hinge (z relative to the panel's back face)
export const HATCH = { u: IN_U - 8, back: -410, front: -10, t: 6 };
const HINGE_V = FLOOR_TOP + HATCH.t;                     // both flaps turn about their BOTTOM edge
export const FLAP_L = HATCH.front - HATCH.back;      // ONE trap door, hinged at the back edge: the cash falls in front of it
// the safe-deposit doors under the drawer: 3 × 5
const DOORS = { u0: -VT.W / 2 + 26, u1: VT.W / 2 - 26, v0: OP.v1 + 26, v1: -VT.plinth - 22, cols: 3, rows: 6, gap: 8, t: 5 };
const DOOR_W = (DOORS.u1 - DOORS.u0 - (DOORS.cols - 1) * DOORS.gap) / DOORS.cols;
const DOOR_H = (DOORS.v1 - DOORS.v0 - (DOORS.rows - 1) * DOORS.gap) / DOORS.rows;
const DOOR_NO = [214, 215, 216, 224, 225, 226, 234, 235, 236, 244, 245, 246, 254, 255, 256, 264, 265, 266];
/** the panel's back face z for a slide of s (s 0 = closed, flush; s DR.ext = fully out) */
export const panelZ = (s) => ZF - DR.t + 2 + s;
let memo = null;
const parts = () => {
  if (memo) return memo;
  const body = wound(prism(rrectPts(VT.W, VT.H - VT.plinth, 6, 2, 0, (V_TOP - VT.plinth) / 2), VT.D, 5, 0, 1));
  const crown = wound(prism(rrectPts(VT.W + 2 * VT.over, VT.crown, 5, 2, 0, V_TOP - VT.crown / 2), VT.D + 2 * VT.over, 5, 0, 1));
  const plinth = wound(prism(rrectPts(VT.W - 2 * VT.toe, VT.plinth, 3, 2, 0, -VT.plinth / 2), VT.D - 2 * VT.toe, 3, 0, 1));
  const doors = [];
  for (let r = 0; r < DOORS.rows; r++) for (let c = 0; c < DOORS.cols; c++) {
    const u = DOORS.u0 + c * (DOOR_W + DOORS.gap) + DOOR_W / 2, v = DOORS.v0 + r * (DOOR_H + DOORS.gap) + DOOR_H / 2;
    doors.push({ u, v, k: r * DOORS.cols + c });
  }
  const doorFaces = wound(doors.flatMap((d) => prism(rrectPts(DOOR_W, DOOR_H, 3, 2, d.u, d.v), DOORS.t, 1.6, 0, 1, () => false, [0, 0, ZF + DOORS.t / 2])));
  const hinges = wound(doors.flatMap((d) => [-1, 1].flatMap((s) => vCyl(d.u + DOOR_W / 2 + 1, ZF + 6, d.v + s * (DOOR_H / 2 - 30) - 13, d.v + s * (DOOR_H / 2 - 30) + 13, 4.6, 0, 2))));
  memo = { body, crown, plinth, doors, doorFaces, hinges };
  return memo;
};
const fillOf = (r, light, f) => rampAt(r, f.cap ? 0.62 * light + 0.06 : f.bev ? Math.min(1, 0.95 * light + 0.16) : 0.8 * light + 0.04);
const Paint = ({ faces, map, rig, ramp, spec = 0.5, dim = 0 }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: paintXf(faces, map, rig, spec).map((dw, k) => {
  const c = fillOf(ramp, dw.light * (1 - dim), dw.face);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
}) });
/** a keyhole on a front plane: an escutcheon ring and the keyway */
const Keyhole = ({ id, map, rig, u, v, w, r = 12 }) => {
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const ring = (rr, lift = 0) => Array.from({ length: 22 }, (_, i) => [u + rr * Math.cos(i / 22 * 2 * Math.PI), v + rr * Math.sin(i / 22 * 2 * Math.PI), w + lift]);
  const p0 = mapScr(map, rig, [u - r, v - r, w]), p1 = mapScr(map, rig, [u + r, v + r, w]);
  const kw = r * 0.3;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}K`, gradientUnits: "userSpaceOnUse", x1: f2(p0[0]), y1: f2(p0[1]), x2: f2(p1[0]), y2: f2(p1[1]), children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: rampAt(SF_STEEL, 0.95) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: rampAt(SF_STEEL, 0.55) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: rampAt(SF_STEEL, 0.22) })
    ] }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(ring(r + 1.8, 0.1)), fill: "#000000", opacity: 0.5 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(ring(r, 0.6)), fill: `url(#${id}K)` }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(ring(r * 0.62, 0.7)), fill: "none", stroke: "#000000", strokeOpacity: 0.28, strokeWidth: 0.8 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([...Array.from({ length: 12 }, (_, i) => [u + kw * Math.cos(Math.PI + i / 11 * Math.PI), v - kw * 0.4 + kw * Math.sin(Math.PI + i / 11 * Math.PI), w + 0.9]), [u + kw * 0.55, v + r * 0.5, w + 0.9], [u - kw * 0.55, v + r * 0.5, w + 0.9]]), fill: "#05080C", opacity: 0.92 })
  ] });
};
const brushed = (P, u0, u1, v0, v1, w, step = 6.5) => {
  const out = [];
  for (let v = v0 + 4; v < v1 - 3; v += step) out.push(P([[u0 + 4, v, w], [u1 - 4, v + 0.6, w]], false));
  return out;
};
/** the cabinet (everything but the drawer): body, crown, plinth, face, doors with their prints, the opening's cavity */
export const VaultCabinet = ({ id, rig, pose, sheen = 0, shadow }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const { body, crown, plinth, doors, doorFaces, hinges } = parts();
  const W = VT.W, zf = ZF + 0.3;
  const face0 = mapScr(map, rig, [-W / 2, V_TOP, ZF]), face1 = mapScr(map, rig, [W / 4, -VT.plinth, ZF]);
  const s0 = -W / 2 - 160 + sheen;
  const band = (a, w2) => P([[s0 + a, V_TOP, zf + 0.2], [s0 + a + w2, V_TOP, zf + 0.2], [s0 + a + w2 - 200, -VT.plinth, zf + 0.2], [s0 + a - 200, -VT.plinth, zf + 0.2]]);
  const topY = V_CROWN - 0.3, cw2 = W / 2 + VT.over, cd2 = ZF + VT.over;
  const capScrews = [-1, 1].flatMap((su) => [-1, 1].map((sw) => [su * (cw2 - 26), topY, sw * (cd2 - 26)]));
  const sideSeam = P([[-W / 2 - 0.3, V_TOP + 8, ZF - 40], [-W / 2 - 0.3, -VT.plinth - 6, ZF - 40]], false);
  const cav = rrectPts(2 * OP.u, OP.v1 - OP.v0, 3, 2, 0, (OP.v0 + OP.v1) / 2).map(([u, v]) => [u, v, ZF + 0.4]);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("defs", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("linearGradient", { id: `${id}Fc`, gradientUnits: "userSpaceOnUse", x1: f2(face0[0]), y1: f2(face0[1]), x2: f2(face1[0]), y2: f2(face1[1]), children: [0, 0.2, 0.45, 0.75, 1].map((t, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: t, stopColor: rampAt(SF_BODY, [0.56, 0.6, 0.5, 0.42, 0.36][k]) }, k)) }),
        /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Cv`, gradientUnits: "userSpaceOnUse", x1: "0", y1: f2(mapScr(map, rig, [0, OP.v0, ZF])[1]), x2: "0", y2: f2(mapScr(map, rig, [0, OP.v1, ZF])[1]), children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: "#020508" }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: PL_RECESS })
        ] })
      ] }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: plinth, map, rig, ramp: PL_RUBBER, spec: 0.2 }),
      paintXf(body, map, rig, 0.45).map((dw, k) => {
        const front = dw.face.cap && dw.face.n[2] > 0.5;
        const c = fillOf(SF_BODY, dw.light, dw.face);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: front ? `url(#${id}Fc)` : c, stroke: front ? "none" : c, strokeWidth: 0.6, strokeLinejoin: "round" }, `b${k}`);
      }),
      brushed(P, -W / 2, W / 2, V_TOP, -VT.plinth, zf).map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: k % 2 ? "#000000" : "#ffffff", strokeOpacity: 0.03, strokeWidth: 1, fill: "none" }, `br${k}`)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: sideSeam, stroke: SF_GROOVE, strokeWidth: 2, opacity: 0.7, fill: "none" }),
      // the face's frame groove and the seam under the drawer course
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(rrectPts(W - 24, VT.H - VT.plinth - 24, 6, 2, 0, (V_TOP - VT.plinth) / 2).map(([u, v]) => [u, v, zf])), stroke: SF_GROOVE, strokeWidth: 2, opacity: 0.75, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(rrectPts(W - 22, VT.H - VT.plinth - 22, 6, 2, 1, (V_TOP - VT.plinth) / 2 + 1).map(([u, v]) => [u, v, zf])), stroke: SF_LIP, strokeWidth: 0.8, opacity: 0.25, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[-W / 2 + 12, OP.v1 + 13, zf], [W / 2 - 12, OP.v1 + 13, zf]], false), stroke: SF_GROOVE, strokeWidth: 2.2, opacity: 0.8, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[-W / 2 + 12, OP.v1 + 15, zf], [W / 2 - 12, OP.v1 + 15, zf]], false), stroke: SF_LIP, strokeWidth: 0.9, opacity: 0.3, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: band(0, 140), fill: "#ffffff", opacity: 0.028 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: band(170, 30), fill: "#ffffff", opacity: 0.02 }),
      // the safe-deposit doors: reveal, door leaf, hinge knuckles
      doors.map((d) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(rrectPts(DOOR_W + 5, DOOR_H + 5, 4, 2, d.u + 1, d.v + 1.5).map(([u, v]) => [u, v, zf])), fill: "#04080D", opacity: 0.7 }, `rv${d.k}`)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: doorFaces, map, rig, ramp: SF_DOOR, spec: 0.55 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: hinges, map, rig, ramp: SF_STEEL, spec: 0.8 }),
      doors.map((d) => {
        const w = ZF + DORS_FRONT;
        const plate = rrectPts(78, 22, 3, 2, d.u, d.v - DOOR_H / 2 + 26).map(([u, v]) => [u, v, w + 0.3]);
        return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(plate.map(([u, v, ww]) => [u + 1, v + 1.2, ww])), fill: "#000000", opacity: 0.35 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(plate), fill: rampAt(SF_STEEL, 0.78), stroke: rampAt(SF_STEEL, 0.95), strokeWidth: 0.6 }),
          [-1, 1].map((s) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Keyhole, { id: `${id}d${d.k}k${s}`, map, rig, u: d.u + s * 34, v: d.v + 18, w: w + 0.2, r: 11 }, s)),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[d.u - DOOR_W / 2 + 6, d.v - DOOR_H / 2 + 1.5, w + 0.2], [d.u + DOOR_W / 2 - 6, d.v - DOOR_H / 2 + 1.5, w + 0.2]], false), stroke: "#ffffff", strokeOpacity: 0.3, strokeWidth: 1.1, fill: "none" })
        ] }, `dd${d.k}`);
      }),
      // the crown cap with its screws, and the opening's cavity
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: crown, map, rig, ramp: PL_PLATE, spec: 0.6 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(rrectPts(2 * cw2 - 30, 2 * cd2 - 30, 8, 3).map(([u, w]) => [u, topY, w])), fill: "none", stroke: SF_GROOVE, strokeWidth: 1.8, opacity: 0.7 }),
      capScrews.map((c, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Screw, { id: `${id}cs${k}`, map, rig, c, r: 6, plane: "top", slot: [20, -40, 60, 0][k] }, `cs${k}`)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(cav), fill: `url(#${id}Cv)` }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(cav), fill: "none", stroke: SF_LIP, strokeOpacity: 0.3, strokeWidth: 1 }),
      // the open drawer's shadow on the face below it
      shadow && /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Sh`, gradientUnits: "userSpaceOnUse", x1: "0", y1: f2(shadow.y0), x2: "0", y2: f2(shadow.y1), children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: "#000000", stopOpacity: 0.55 * shadow.k }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: "#000000", stopOpacity: 0.12 * shadow.k })
        ] }) }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: shadow.d, fill: `url(#${id}Sh)`, stroke: "#000000", strokeOpacity: 0.08 * shadow.k, strokeWidth: 8, strokeLinejoin: "round" })
      ] })
    ] }),
    doors.map((d) => /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x: pose, u: d.u - 36, v: d.v - DOOR_H / 2 + 26 - 8, w: ZF + DORS_FRONT + 0.6, width: 72, height: 16, probe: "a safe-deposit box's number", children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { width: 72, textAlign: "center", ...label(13, SF_GROOVE), letterSpacing: 1.2, lineHeight: "16px", opacity: 0.85 }, children: `NO. ${DOOR_NO[d.k]}` }) }, `dn${d.k}`))
  ] });
};
const DORS_FRONT = DOORS.t + 0.2;
/** the face shadow cast by the open drawer (key light from the upper left front): its outline on the face plane, clipped to the face */
export const drawerShadow = (rig, pose, s) => {
  if (s < 2) return null;
  const KX = 0.81, KY = 1.61;   // per unit of protrusion: right and down on the face (TkFloor's key direction, onto a vertical plane)
  const z1 = panelZ(s) + DR.t;
  const e = z1 - ZF;
  const u0 = -DR.boxW / 2 - 12, u1 = DR.W / 2;
  const pts = [[u0, BOX.v1], [u1, BOX.v1], [u1 + KX * e, BOX.v1 + KY * e], [u0 + KX * e, BOX.v1 + KY * e]];
  // clip to the face (u within the body, v above the plinth)
  const lim = { u0: -VT.W / 2 + 2, u1: VT.W / 2 - 2, v1: -VT.plinth - 2 };
  const clipX = (poly, x, keepLess) => {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const ia = keepLess ? a[0] <= x : a[0] >= x, ib = keepLess ? b[0] <= x : b[0] >= x;
      if (ia) out.push(a);
      if (ia !== ib) out.push([x, a[1] + (x - a[0]) / (b[0] - a[0]) * (b[1] - a[1])]);
    }
    return out;
  };
  const clipY = (poly, y) => {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const ia = a[1] <= y, ib = b[1] <= y;
      if (ia) out.push(a);
      if (ia !== ib) out.push([a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0]), y]);
    }
    return out;
  };
  let poly = clipY(clipX(clipX(pts, lim.u1, true), lim.u0, false), lim.v1);
  if (poly.length < 3) return null;
  const map = (q) => xfApply(pose, q);
  const d = mapPath(map, rig, poly.map(([u, v]) => [u, v, ZF + DORS_FRONT + 1]));
  return { d, y0: mapScr(map, rig, [0, BOX.v1, ZF])[1], y1: mapScr(map, rig, [0, BOX.v1 + KY * e, ZF])[1], k: clamp01(s / 120) };
};
// ── the drawer ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
const drawerParts = () => {
  const zb = -DR.boxD;   // relative to the panel's back face
  const hv = (BOX.v0 + BOX.v1) / 2, hh = BOX.v1 - BOX.v0;
  const side = (s) => wound(prism(rrectPts(DR.wall, hh, 2, 1, s * (DR.boxW / 2 - DR.wall / 2), hv), DR.boxD, 1.5, 0, 1, () => false, [0, 0, zb / 2]));
  const back = wound(prism(rrectPts(DR.boxW - 2 * DR.wall, hh, 1, 1, 0, hv), DR.wall, 1.5, 0, 1, () => false, [0, 0, zb + DR.wall / 2]));
  const fv = BOX.v1 - DR.floorT / 2;
  const rimBack = wound(prism(rrectPts(2 * IN_U, DR.floorT, 1, 1, 0, fv), HATCH.back - (zb + DR.wall), 1, 0, 1, () => false, [0, 0, (zb + DR.wall + HATCH.back) / 2]));
  const rimSides = wound([-1, 1].flatMap((s) => prism(rrectPts(IN_U - HATCH.u, DR.floorT, 1, 1, s * (HATCH.u + IN_U) / 2, fv), HATCH.front - HATCH.back, 1, 0, 1, () => false, [0, 0, (HATCH.back + HATCH.front) / 2])));
  const rimFront = wound(prism(rrectPts(2 * IN_U, DR.floorT, 1, 1, 0, fv), -HATCH.front, 1, 0, 1, () => false, [0, 0, HATCH.front / 2]));
  const front = wound(prism(rrectPts(DR.W, DR.v1 - DR.v0, 6, 2, 0, (DR.v0 + DR.v1) / 2), DR.t, 4, 0, 1, () => false, [0, 0, DR.t / 2]));
  const plate = wound(prism(rrectPts(430, 54, 4, 2, 0, DR.v0 + 44), 3, 1.2, 0, 1, () => false, [0, 0, DR.t + 1.5]));
  // the slides on the near (left) side: the inner member on the drawer, the intermediate member half-way out
  const rail = (u, z0, z1, h) => wound(prism(rrectPts(6, h, 1, 1, u, hv - 6), z1 - z0, 1, 0, 1, () => false, [0, 0, (z0 + z1) / 2]));
  return { side, back, rimBack, rimSides, rimFront, front, plate, rail };
};
let dmemo = null;
const dparts = () => dmemo ??= drawerParts();
/** the hull of what the drawer may show: the opening, and the drawer's volume in front of the face */
export const drawerClip = (rig, pose, s) => {
  const z1 = panelZ(s) + DR.t + 46;
  const pts = [];
  // (the hole is the drawer front's own outline: through the 6-px reveal above it nothing of the drawer's inside may show)
  for (const u of [-DR.W / 2, DR.W / 2]) for (const v of [DR.v0 - 0.5, OP.v1]) pts.push([u, v, ZF]);
  if (z1 > ZF) for (const u of [-OP.u - 8, OP.u]) for (const v of [DR.v0 - 0.5, OP.v1 + 2]) for (const z of [ZF, z1]) pts.push([u, v, z]);
  const scr = pts.map((q) => worldScr(rig, xfApply(pose, q)));
  const p = [...scr].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
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
  const h = [...lo.slice(0, -1), ...hi.slice(0, -1)];
  return `M${h.map((q) => `${f2(q[0])},${f2(q[1])}`).join("L")}Z`;
};
/** a flap's transform (drawer-local, z relative to the panel's back face): the back flap turns down about its BOTTOM-BACK edge,
 *  the front flap about its BOTTOM-FRONT edge, both through `deg` (0 = shut, 90 = hanging) */
export const flapXf = (which, deg) => {
  const zh = which === "back" ? HATCH.back : HATCH.front;
  const a = which === "back" ? -deg : deg;
  return xfMul(xfTrans([0, HINGE_V, zh]), xfMul(xfRotX(a), xfTrans([0, -HINGE_V, -zh])));
};
const flapFaces = (which) => {
  const z0 = which === "back" ? HATCH.back : HATCH.back + FLAP_L, z1 = which === "back" ? HATCH.back + FLAP_L : HATCH.front;
  return wound(prism(rrectPts(2 * HATCH.u - 2, HATCH.t, 1, 1, 0, FLOOR_TOP + HATCH.t / 2), z1 - z0 - 1, 1.2, 0, 1, () => false, [0, 0, (z0 + z1) / 2]));
};
const FLAPS = { back: null, front: null };
const flapFacesOf = (w) => FLAPS[w] ??= flapFaces(w);
/** does the camera see a flap's TOP (the face the cash rests on)? then the cash is in front of it */
export const flapTopSeen = (rig, pose, s, which, deg) => {
  const x = xfMul(pose, xfMul(xfTrans([0, 0, panelZ(s)]), flapXf(which, deg)));
  const zc = which === "back" ? HATCH.back + FLAP_L / 2 : HATCH.front - FLAP_L / 2;
  return facingM((q) => xfApply(x, q), rig, [0, -1, 0], [0, FLOOR_TOP, zc]) > 0;
};
export const DrawerFlap = ({ rig, pose, s, which, deg }) => {
  // (the hatch's flaps are 6 px plates flush with the floor's top; HATCH.t)
  const x = xfMul(pose, xfMul(xfTrans([0, 0, panelZ(s)]), flapXf(which, deg)));
  const map = (q) => xfApply(x, q);
  const zc = which === "back" ? HATCH.back + FLAP_L / 2 : HATCH.front - FLAP_L / 2;
  // shut, the trap shows as a fine seam round the opening in the floor
  const seam = mapPath((q) => xfApply(pose, [q[0], q[1], q[2] + panelZ(s)]), rig, rrectPts(2 * HATCH.u, FLAP_L, 2, 1, 0, (HATCH.back + HATCH.front) / 2).map(([u, z]) => [u, FLOOR_TOP - 0.3, z]));
  // the hinge pin along the hinge line (a steel rod under the floor's edge)
  const zh = which === "back" ? HATCH.back : HATCH.front;
  const pinXf = xfMul(pose, xfMul(xfTrans([-HATCH.u + 2, HINGE_V, panelZ(s) + zh]), xfRotZ(-90)));
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: flapFacesOf(which), map, rig, ramp: SF_DOOR, spec: 0.35, dim: 0.12 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: seam, stroke: "#000000", strokeOpacity: 0.5 * (1 - clamp01(deg / 6)), strokeWidth: 1.6, fill: "none" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `pnPin${which}`, rig, xf: pinXf, profile: [{ y: 0, r: 0 }, { y: 0, r: 3.6 }, { y: 2 * HATCH.u - 4, r: 3.6 }, { y: 2 * HATCH.u - 4, r: 0 }], ramp: SF_STEEL, spec: 0.9, n: 14 })
  ] });
};
/** the drawer's FAR parts (behind the cash): back wall, the far (right) side wall, the floor's rim */
export const DrawerFar = ({ rig, pose, s }) => {
  const x = xfMul(pose, xfTrans([0, 0, panelZ(s)]));
  const map = (q) => xfApply(x, q);
  const { side, back, rimBack, rimSides, rimFront } = dparts();
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: back, map, rig, ramp: SF_DOOR, spec: 0.3, dim: 0.22 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: side(1), map, rig, ramp: SF_DOOR, spec: 0.3, dim: 0.3 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: rimBack, map, rig, ramp: SF_DOOR, spec: 0.3, dim: 0.3 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: rimSides, map, rig, ramp: SF_DOOR, spec: 0.3, dim: 0.3 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: rimFront, map, rig, ramp: SF_DOOR, spec: 0.3, dim: 0.3 })
  ] });
};
/** the drawer's NEAR parts (in front of the cash): the near (left) side wall and its slides, the front panel and its fittings */
export const DrawerNear = ({ id, rig, pose, s, text, sheen = 0, plateLit = 0 }) => {
  const x = xfMul(pose, xfTrans([0, 0, panelZ(s)]));
  const map = (q) => xfApply(x, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const { side, front, plate, rail } = dparts();
  const zp = 0, zf2 = DR.t + 0.3;
  const uL = -DR.boxW / 2;
  // the inner slide member rides on the box; the intermediate member travels half the slide (its front end in cabinet-fixed z)
  const inner = rail(uL - 3, -DR.boxD + 20, -18, 30);
  const midFront = ZF - 44 + s / 2 - panelZ(s);
  const mid = rail(uL - 9, midFront - 440, midFront, 38);
  const fr0 = mapScr(map, rig, [-DR.W / 2, DR.v0, zf2]), fr1 = mapScr(map, rig, [DR.W / 4, DR.v1, zf2]);
  const hv = DR.v0 + 124;
  // the bar pull: two posts and the bar (turned bodies), the posts' feet as round bosses
  const postXf = (u) => xfMul(x, xfMul(xfTrans([u, hv, DR.t]), xfRotX(90)));
  const barXf = xfMul(x, xfMul(xfTrans([-188, hv, DR.t + 34]), xfRotZ(-90)));
  const POST = [{ y: 0, r: 15 }, { y: 0, r: 15 }, { y: 3, r: 15 }, { y: 5, r: 10 }, { y: 34, r: 9 }];
  const BAR = [{ y: 0, r: 0 }, { y: 0, r: 9 }, { y: 3, r: 11.5 }, { y: 373, r: 11.5 }, { y: 376, r: 9 }, { y: 376, r: 0 }];
  const s0 = -DR.W / 2 - 120 + sheen;
  const band = (a, w2) => P([[s0 + a, DR.v0, zf2], [s0 + a + w2, DR.v0, zf2], [s0 + a + w2 - 60, DR.v1, zf2], [s0 + a - 60, DR.v1, zf2]]);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsx)("linearGradient", { id: `${id}Fr`, gradientUnits: "userSpaceOnUse", x1: f2(fr0[0]), y1: f2(fr0[1]), x2: f2(fr1[0]), y2: f2(fr1[1]), children: [0, 0.22, 0.5, 0.8, 1].map((t, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: t, stopColor: rampAt(SF_DOOR, [0.7, 0.66, 0.56, 0.47, 0.42][k]) }, k)) }) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: side(-1), map, rig, ramp: SF_DOOR, spec: 0.4 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: mid, map: (q) => xfApply(x, q), rig, ramp: SF_STEEL, spec: 0.8 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: inner, map, rig, ramp: SF_STEEL, spec: 0.8 }),
      paintXf(front, map, rig, 0.45).map((dw, k) => {
        const isFront = dw.face.cap && dw.face.n[2] > 0.5;
        const c = fillOf(SF_DOOR, dw.light, dw.face);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: isFront ? `url(#${id}Fr)` : c, stroke: isFront ? "none" : c, strokeWidth: 0.6, strokeLinejoin: "round" }, `f${k}`);
      }),
      brushed(P, -DR.W / 2 + 4, DR.W / 2 - 4, DR.v0 + 4, DR.v1 - 4, zf2, 5.5).map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: k % 2 ? "#000000" : "#ffffff", strokeOpacity: 0.035, strokeWidth: 1, fill: "none" }, `br${k}`)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[-DR.W / 2 + 8, DR.v0 + 1.6, zf2], [DR.W / 2 - 8, DR.v0 + 1.6, zf2]], false), stroke: "#ffffff", strokeOpacity: 0.42, strokeWidth: 1.3, fill: "none", strokeLinecap: "round" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: band(0, 90), fill: "#ffffff", opacity: 0.035 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: band(118, 22), fill: "#ffffff", opacity: 0.025 }),
      // the nameplate: a riveted steel plate
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(rrectPts(434, 58, 5, 2, 2, DR.v0 + 46.5).map(([u, v]) => [u, v, zf2])), fill: "#000000", opacity: 0.4 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Paint, { faces: plate, map, rig, ramp: SF_STEEL, spec: 0.5, dim: -0.04 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(rrectPts(416, 42, 3, 2, 0, DR.v0 + 44).map(([u, v]) => [u, v, DR.t + 3.2])), fill: "none", stroke: SF_GROOVE, strokeOpacity: 0.45, strokeWidth: 1 }),
      [-1, 1].flatMap((su) => [-1, 1].map((sv) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Screw, { id: `${id}pr${su}${sv}`, map, rig, c: [su * 203, DR.v0 + 44 + sv * 17, DR.t + 3], r: 3.4, plane: "front", slot: 30 * su }, `pr${su}${sv}`))),
      plateLit > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(rrectPts(430, 54, 4, 2, 0, DR.v0 + 44).map(([u, v]) => [u, v, DR.t + 3.3])), fill: "#ffffff", opacity: 0.08 * clamp01(plateLit) }),
      // keyholes and corner screws
      [-1, 1].map((sg) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Keyhole, { id: `${id}kh${sg}`, map, rig, u: sg * 258, v: hv, w: zf2, r: 14 }, `kh${sg}`)),
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([su, sv], k) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Screw, { id: `${id}fs${k}`, map, rig, c: [su * (DR.W / 2 - 18), sv < 0 ? DR.v0 + 16 : DR.v1 - 16, zf2], r: 5, plane: "front", slot: [25, -30, 50, -10][k] }, `fs${k}`)),
      // the pull: bosses, posts, bar (the bar's shadow on the front first)
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P([[-176, hv + 14, zf2], [190, hv + 14, zf2], [192, hv + 30, zf2], [-174, hv + 30, zf2]]), fill: "#000000", opacity: 0.28 }),
      [-1, 1].map((sg) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}po${sg}`, rig, xf: postXf(sg * 160), profile: POST, ramp: SF_STEEL, spec: 0.9, n: 28 }, `po${sg}`)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Turned, { id: `${id}bar`, rig, xf: barXf, profile: BAR, ramp: SF_STEEL, spec: 0.9, n: 40 })
    ] }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Engraved, { rig, pose: x, zF: DR.t + 3, uC: 0, vC: DR.v0 + 44, width: 400, size: 30, text, on: 1, ink: ENG, probe: "the drawer's engraved nameplate", bare: 0.9 })
  ] });
};
const ENG = { groove: SF_GROOVE, lip: SF_LIP, paint: INK };
/** the cabinet's box corners (the floor's contact shadow) */
export const vaultCorners = (pose) => {
  const out = [];
  for (const u of [-VT.W / 2, VT.W / 2]) for (const v of [V_CROWN, 0]) for (const w of [-ZF, ZF]) out.push(xfApply(pose, [u, v, w]));
  return out;
};
export const drawerCorners = (pose, s) => {
  const out = [];
  if (s < 4) return out;
  for (const u of [-DR.W / 2, DR.W / 2]) for (const v of [DR.v0, BOX.v1]) for (const w of [ZF, panelZ(s) + DR.t]) out.push(xfApply(pose, [u, v, w]));
  return out;
};
export const vaultAt = (rig, pose, q) => mapScr((p) => xfApply(pose, p), rig, q);
export const OPENING = OP;
