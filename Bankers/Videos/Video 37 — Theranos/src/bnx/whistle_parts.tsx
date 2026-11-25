// @ts-nocheck
// ★ V37 "Theranos" — whistle_parts.tsx (builder H, REV1: Timur "fully change the visuals … more connected to the voiceover").
//   THE WHISTLE, THE TAG AND THE BOARD TABLE, in the tk_rig world (y down, the floor at TK_FLOOR_Y), lit by the one key light:
//   · a chrome PEA WHISTLE (an Acme-style "thunderer"): the turned barrel (chamfered ends, a stamped ring and centre dimple on its
//     end face), the flattened mouthpiece with its mouth slot, the escape window cut in the barrel's top with its sharp blade edge
//     and the pale PEA visible inside it (it rattles as the whistle blows), the lug at the barrel's back with a chrome split ring
//   · the steel ID TAG hanging from the ring (it lies flat on the table while the whistle rests, lifts and swings as it rises):
//     a rounded plate with thickness, a hole and its eyelet, an engraved border, L("whistleName") / L("whistleRole") engraved
//   · the LANYARD: a woven navy cord from the ring, falling to the table and lying off to the right
//   · a strip of the BOARD TABLE: dark lacquered top with a bullnosed edge, a recessed apron, a moving sheen, the light pool
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { cw, lightOf, prism, rampAt } from "./solid_engine";
import { XPlane, paintXf, rrectPts, worldScr, worldView, wound, xfApply, xfDir, xfMul, xfRotX, xfRotY, xfScale, xfTrans } from "./tk_rig";
import { label } from "./kit";
import { thLathe } from "./th_tube";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const { frameOf, turned, Grad, frontArc, streak, keyAngle, poly } = thLathe;
export const CHROME = ["#0B1524", "#2A3E58", "#8EA6C4", "#E3EDF8", "#FFFFFF"];
const TABLE_TOP = ["#050B15", "#081322", "#0E2038", "#3A6295", "#C9DAEE"];
const TABLE_EDGE = ["#0A1526", "#122640", "#1F416B", "#7FA3CE", "#EAF1F9"];
const CORD = ["#050B16", "#0B1A31", "#163256", "#3E6697", "#A9C3E2"];
const unit = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** a projector for the turned-solid helpers (th_tube's thLathe) through a tk_rig rig, for world points */
export const prOf = (rig, at) => {
  const vdir = (n) => {
    const c = [rig.cx, rig.cy, 0], a = worldView(rig, c), b = worldView(rig, add(c, n));
    return [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  };
  return {
    P: (q) => worldScr(rig, q),
    facing: (q, n) => {
      const v = worldView(rig, q), m = vdir(n);
      return m[0] * -v[0] + m[1] * -v[1] + m[2] * (rig.persp - v[2]);
    },
    light: (n, spec = 0.5, shin = 26) => lightOf(unit(vdir(n)), spec, shin),
    scale: rig.persp / Math.max(1, rig.persp - worldView(rig, at)[2])
  };
};
/** painted faces with a ramp per material index */
export const Faces = ({ faces, map, rig, ramps, spec = 0.5, tone }) => jsx(jsx_runtime.Fragment, { children: paintXf(wound(faces), map, rig, spec).map((dw, k) => {
  const r = ramps[dw.face.mat ?? 0];
  const v = tone ? tone(dw) : dw.face.bev ? Math.min(1, 0.95 * dw.light + 0.14) : dw.face.cap ? 0.7 * dw.light + 0.05 : 0.82 * dw.light + 0.03;
  const c = rampAt(r, v);
  return jsx("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
}) });
const xfFaces = (faces, x) => faces.map((f) => ({ ...f, pts: f.pts.map((p) => xfApply(x, p)), n: xfDir(x, f.n) }));
// a horizontal slab: plan w × d (x × z) with rounded corners, from y0 (top) down to y1
const slab = (cx, cz, w, d, y0, y1, r, bev, mat, pass) => xfFaces(prism(cw(rrectPts(w, d, r, 4)), y1 - y0, bev, mat, pass), { m: [1, 0, 0, 0, 0, 1, 0, -1, 0], t: [cx, (y0 + y1) / 2, cz] });
// ── THE TABLE STRIP ────────────────────────────────────────────────────────────────────────────────────────────────────
export const TBL = { x: 500, z: 260, L: 1900, D: 1240, T: 34, R: 60 };
export const BoardTable = ({ id, rig, top, sheen = 0 }) => {
  const { x, z, L, D, T, R } = TBL;
  const faces = [...slab(x, z, L, D, top, top + T, R, 10, 0, 1), ...slab(x, z - 30, L - 120, D - 110, top + T, top + 520, 20, 2, 1, 0)];
  const P = (pts) => "M" + pts.map((q) => worldScr(rig, q)).map((p) => `${f2(p[0])},${f2(p[1])}`).join("L") + "Z";
  const yT = top - 0.4;
  const plan = cw(rrectPts(L - 24, D - 24, R - 10, 6)).map(([a, b]) => [x + a, yT, z + b]);
  const s0 = x - L / 2 - 500 + sheen;
  const band = (a, w) => P([[s0 + a, yT - 0.3, z + D / 2], [s0 + a + w, yT - 0.3, z + D / 2], [s0 + a + w + 320, yT - 0.3, z - D / 2], [s0 + a + 320, yT - 0.3, z - D / 2]]);
  const g0 = worldScr(rig, [x, yT, z - D / 2]), g1 = worldScr(rig, [x, yT, z + D / 2]);
  return jsxs("g", { children: [
    jsx(Faces, { faces, map: (q) => q, rig, ramps: [TABLE_TOP, TABLE_EDGE], spec: 0.9 }),
    jsxs("defs", { children: [
      jsxs("linearGradient", { id: `${id}Tg`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
        jsx("stop", { offset: "0", stopColor: "#000000", stopOpacity: 0.35 }),
        jsx("stop", { offset: "0.55", stopColor: "#7FA3CE", stopOpacity: 0.06 }),
        jsx("stop", { offset: "1", stopColor: "#C9DAEE", stopOpacity: 0.14 })
      ] }),
      jsx("clipPath", { id: `${id}Tc`, clipPathUnits: "userSpaceOnUse", children: jsx("path", { d: P(plan) }) })
    ] }),
    // the lacquer's depth (darker far, lifting toward the lit near edge) and the slow sheen of the studio light across it
    jsx("path", { d: P(plan), fill: `url(#${id}Tg)` }),
    jsxs("g", { clipPath: `url(#${id}Tc)`, children: [
      jsx("path", { d: band(0, 90), fill: "#C9DAEE", opacity: 0.06 }),
      jsx("path", { d: band(150, 26), fill: "#E6F0FB", opacity: 0.08 })
    ] }),
    // the bullnose's lit arris along the near edge
    jsx("path", { d: P([[x - L / 2 + R, top + 3, z + D / 2 + 0.5], [x + L / 2 - R, top + 3, z + D / 2 + 0.5]]).replace(/Z$/, ""), stroke: "#C9DAEE", strokeWidth: 1.6, opacity: 0.5, fill: "none" })
  ] });
};
// ── THE WHISTLE ────────────────────────────────────────────────────────────────────────────────────────────────────────
// local units (×K in the pose): the barrel's axis along local z, its centre at the origin; the mouthpiece along +x on its top
export const WH = { R: 26, HL: 20, mx0: 4, mx1: 80, my0: -26, my1: -10, mz: 12.5, K: 3.2 };
const WIN = { p0: -0.42, p1: 0.16, z: 10.5 };
const LUG = [-24, 13, -WH.HL + 4];
// the whistle's own lowest point under a rotation (so it rests ON the table)
const SAMPLES = (() => {
  const pts = [];
  for (const z of [-WH.HL, WH.HL]) for (let k = 0; k < 24; k++) {
    const a = k / 24 * 2 * Math.PI;
    pts.push([WH.R * Math.cos(a), WH.R * Math.sin(a), z]);
  }
  for (const x of [WH.mx0, WH.mx1]) for (const y of [WH.my0, WH.my1]) for (const z of [-WH.mz, WH.mz]) pts.push([x, y, z]);
  return pts;
})();
/** the whistle's pose: yaw (deg), roll (deg, about its mouthpiece axis: 90 = lying on its back end, front face up), lift above the
 *  table (world units), at world (x, z) on a table whose top is at `top` */
export const whistleXf = (x, z, top, yaw, roll, lift, bob = 0) => {
  const R = xfMul(xfRotY(yaw), xfMul(xfRotX(roll), xfScale(WH.K)));
  const low = Math.max(...SAMPLES.map((p) => xfApply(R, p)[1]));
  return xfMul(xfTrans([x, top - low - lift + bob, z]), R);
};
export const whistleWindow = (xf) => {
  const a = (WIN.p0 + WIN.p1) / 2;
  return xfApply(xf, [WH.R * Math.sin(a), -WH.R * Math.cos(a), 0]);
};
export const whistleLug = (xf) => xfApply(xf, LUG);
export const whistleCorners = (xf) => SAMPLES.filter((p, i) => i % 6 === 0).map((p) => xfApply(xf, p));
export const Whistle = ({ id, rig, xf, pea = 0, sweep = -1, lit = 0 }) => {
  const at = xfApply(xf, [0, 0, 0]);
  const pr = prOf(rig, at);
  const ax = unit(xfDir(xf, [0, 0, 1])), e1 = unit(xfDir(xf, [0, -1, 0]));
  const o = xfApply(xf, [0, 0, -WH.HL]);
  const fr = frameOf(o, ax, e1);
  const L = 2 * WH.HL * WH.K, R = WH.R * WH.K, c = 2.2 * WH.K;
  const shade = (l) => ({ c: rampAt(CHROME, Math.min(1, 1.08 * l * l + 0.04 + 0.1 * lit)) });
  const barrel = turned(pr, fr, c, L - c, R, R, shade);
  const chamF = turned(pr, fr, L - c, L, R, R - c, shade);
  const chamB = turned(pr, fr, 0, c, R - c, R, shade);
  const sw = Math.max(0.4, 0.55 * pr.scale);
  // the end faces: whichever faces the eye
  const front = pr.facing(fr.at(L, 0, 0), ax) > 0, back = pr.facing(fr.at(0, 0, 0), ax.map((v) => -v)) > 0;
  const disc = (s, r, n = 48) => Array.from({ length: n }, (_, i) => pr.P(fr.at(s, r, i / n * 2 * Math.PI)));
  const fl = pr.light(ax, 0.9, 40), bl = pr.light(ax.map((v) => -v), 0.9, 40);
  // the mouthpiece: a rounded flat tube along local +x on the barrel's top
  const mouth = xfFaces(prism(cw(rrectPts(2 * WH.mz, WH.my1 - WH.my0, 4.5, 3)), WH.mx1 - WH.mx0, 1.6, 0, 2), { m: [0, 0, 1, 0, 1, 0, 1, 0, 0], t: [(WH.mx0 + WH.mx1) / 2, (WH.my0 + WH.my1) / 2, 0] });
  const mxf = (q) => xfApply(xf, q);
  // the mouth slot on its end, the escape window in the barrel's top (with the blade edge), the pea seen through it
  const slot = cw(rrectPts(2 * WH.mz - 7, WH.my1 - WH.my0 - 7, 2.5, 2)).map(([a, b]) => xfApply(xf, [WH.mx1 + 0.2, (WH.my0 + WH.my1) / 2 + b, a]));
  const seeSlot = pr.facing(xfApply(xf, [WH.mx1, -18, 0]), unit(xfDir(xf, [1, 0, 0]))) > 0;
  const winPts = [];
  for (let k = 0; k <= 10; k++) {
    const a = WIN.p0 + (WIN.p1 - WIN.p0) * k / 10;
    winPts.push(xfApply(xf, [WH.R * 1.002 * Math.sin(a), -WH.R * 1.002 * Math.cos(a), -WIN.z]));
  }
  for (let k = 10; k >= 0; k--) {
    const a = WIN.p0 + (WIN.p1 - WIN.p0) * k / 10;
    winPts.push(xfApply(xf, [WH.R * 1.002 * Math.sin(a), -WH.R * 1.002 * Math.cos(a), WIN.z]));
  }
  const winScr = winPts.map((q) => pr.P(q));
  const winN = unit(xfDir(xf, [Math.sin((WIN.p0 + WIN.p1) / 2), -Math.cos((WIN.p0 + WIN.p1) / 2), 0]));
  const seeWin = pr.facing(winPts[5], winN) > 0;
  const blade = [xfApply(xf, [WH.R * Math.sin(WIN.p1), -WH.R * Math.cos(WIN.p1) - 0.3, -WIN.z]), xfApply(xf, [WH.R * Math.sin(WIN.p1), -WH.R * Math.cos(WIN.p1) - 0.3, WIN.z])].map((q) => pr.P(q));
  const peaC = pr.P(xfApply(xf, [-3 + 4 * Math.sin(pea * 1.7), -10 + 3 * Math.cos(pea * 2.3), 2 * Math.sin(pea * 1.1)])), peaR = 10.5 * WH.K * pr.scale;
  // the stamped ring and the centre dimple on the front face
  const kth = keyAngle(pr, fr);
  const sweepD = sweep > -1 && sweep < 1 ? streak(pr, fr, kth + 0.4 - 1.6 * sweep, c, L - c, R * 1.003, 14) : "";
  return jsxs("g", { "data-probe-skip": true, children: [
    jsxs("defs", { children: [
      jsx(Grad, { id: `${id}b`, g: barrel }), jsx(Grad, { id: `${id}f`, g: chamF }), jsx(Grad, { id: `${id}k`, g: chamB }),
      jsxs("radialGradient", { id: `${id}pe`, cx: 0.38, cy: 0.35, r: 0.7, children: [
        jsx("stop", { offset: "0", stopColor: "#F4F8FD" }), jsx("stop", { offset: "0.6", stopColor: "#AFC3DB" }), jsx("stop", { offset: "1", stopColor: "#5C7495" })
      ] }),
      jsx("clipPath", { id: `${id}wc`, clipPathUnits: "userSpaceOnUse", children: jsx("path", { d: poly(winScr) }) })
    ] }),
    back && jsx("path", { d: poly(disc(0, R - c)), fill: rampAt(CHROME, 0.9 * bl) }),
    jsx("path", { d: chamB.d, fill: `url(#${id}k)` }),
    jsx("path", { d: barrel.d, fill: `url(#${id}b)` }),
    jsx("path", { d: chamF.d, fill: `url(#${id}f)` }),
    front && jsx("path", { d: poly(disc(L, R - c)), fill: rampAt(CHROME, Math.min(1, 0.95 * fl + 0.05)) }),
    front && jsx("path", { d: poly(disc(L + 0.2, R * 0.62)), fill: "none", stroke: "#0C1828", strokeWidth: sw * 1.3, opacity: 0.6 }),
    front && jsx("path", { d: poly(disc(L + 0.2, R * 0.62 - 1.2)), fill: "none", stroke: "#FFFFFF", strokeWidth: sw * 0.8, opacity: 0.55, transform: "translate(-0.6 -0.6)" }),
    front && jsx("path", { d: poly(disc(L + 0.2, R * 0.12)), fill: rampAt(CHROME, 0.3) }),
    jsx("path", { d: streak(pr, fr, kth + 0.3, c, L - c, R * 1.002, 14), stroke: "#FFFFFF", strokeWidth: sw * 3, opacity: 0.8, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d: streak(pr, fr, kth + Math.PI - 0.6, c, L - c, R * 1.002, 14), stroke: "#DCE7F4", strokeWidth: sw * 1.4, opacity: 0.35, fill: "none", strokeLinecap: "round" }),
    // the escape window: dark inside, the pea glinting through it, the blade's bright edge
    seeWin && jsx("path", { d: poly(winScr), fill: "#030A15" }),
    seeWin && jsx("g", { clipPath: `url(#${id}wc)`, children: jsx("circle", { cx: f2(peaC[0]), cy: f2(peaC[1]), r: f2(peaR), fill: `url(#${id}pe)` }) }),
    seeWin && jsx("path", { d: poly(blade, false), stroke: "#FFFFFF", strokeWidth: sw * 1.6, opacity: 0.9, fill: "none", strokeLinecap: "round" }),
    // the mouthpiece and its slot
    jsx(Faces, { faces: mouth, map: mxf, rig, ramps: [CHROME], spec: 0.95, tone: (dw) => dw.face.bev ? Math.min(1, 1.1 * dw.light + 0.1) : Math.min(1, 1.05 * dw.light * dw.light + 0.05) }),
    seeSlot && jsx("path", { d: poly(slot.map((q) => pr.P(q))), fill: "#02060D" }),
    sweepD && jsx("path", { d: sweepD, stroke: "#FFFFFF", strokeWidth: sw * 7, opacity: 0.45 * Math.sin(Math.PI * (sweep + 1) / 2), fill: "none", strokeLinecap: "round" })
  ] });
};
// ── THE SPLIT RING AND THE TAG ─────────────────────────────────────────────────────────────────────────────────────────
export const TAG = { w: 230, h: 126, t: 3.4, hole: 16 };
/** the ring (world centre) and the tag's frame: the tag hangs from the ring's bottom by gravity, or lies on the table where the
 *  ring is too low for it to hang free; swing (deg) turns it about the vertical */
export const tagFrame = (ringC, ringR, top, swing = 0) => {
  const hang = [ringC[0], ringC[1] + ringR, ringC[2]];
  const len = TAG.h + 4;
  const dy = clamp01((top - 1.5 - hang[1]) / len), dz = Math.sqrt(Math.max(0, 1 - dy * dy));
  const sw = swing * Math.PI / 180;
  const ux = [Math.cos(sw), 0, -Math.sin(sw)];
  const dn = unit([dz * Math.sin(sw), dy, dz * Math.cos(sw)]);
  const nrm = unit(cross(ux, dn));
  return { o: hang, u: ux, v: dn, n: nrm, flat: 1 - dy };
};
export const tagAt = (tf, a, b, w = 0) => add(add(add(tf.o, mul(tf.u, a)), mul(tf.v, b)), mul(tf.n, w));
export const Tag = ({ id, rig, tf, name, role, on = 1, gleam = -1 }) => {
  const S = (q) => worldScr(rig, q);
  const k = prOf(rig, tf.o).scale;
  const outline = rrectPts(TAG.w, TAG.h, 16, 4, 0, TAG.h / 2 + 4);
  const face = (w) => "M" + outline.map(([a, b]) => S(tagAt(tf, a, b, w))).map((p) => `${f2(p[0])},${f2(p[1])}`).join("L") + "Z";
  const lN = prOf(rig, tf.o).light(tf.n, 0.9, 30), seeFront = prOf(rig, tf.o).facing(tf.o, tf.n) > 0;
  const col = rampAt(CHROME, Math.min(1, 0.92 * lN + 0.05));
  const border = rrectPts(TAG.w - 22, TAG.h - 22, 9, 3, 0, TAG.h / 2 + 4);
  const g0 = S(tagAt(tf, -TAG.w / 2, 4)), g1 = S(tagAt(tf, TAG.w / 2, TAG.h + 4));
  const holeC = S(tagAt(tf, 0, TAG.hole + 1, TAG.t / 2));
  // the engraving on an HTML plane through the rig (a real perspective plane: the probe reads it)
  const X = { m: [tf.u[0], tf.v[0], tf.n[0], tf.u[1], tf.v[1], tf.n[1], tf.u[2], tf.v[2], tf.n[2]], t: tf.o };
  const W = TAG.w - 34, H = 80;
  const sweepX = -TAG.w / 2 - 60 + (TAG.w + 120) * clamp01((gleam + 1) / 2);
  // (a wide soft band: it crosses the steel slowly)
  return jsxs("div", { style: { position: "absolute", inset: 0 }, children: [
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsxs("defs", { children: [
        jsxs("linearGradient", { id: `${id}tg`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
          jsx("stop", { offset: "0", stopColor: "#FFFFFF", stopOpacity: 0.35 }), jsx("stop", { offset: "0.5", stopColor: "#FFFFFF", stopOpacity: 0 }), jsx("stop", { offset: "1", stopColor: "#000000", stopOpacity: 0.25 })
        ] }),
        jsx("clipPath", { id: `${id}tc`, clipPathUnits: "userSpaceOnUse", children: jsx("path", { d: face(TAG.t / 2) }) })
      ] }),
      // the plate's thickness (its back face offset), then the face, its brushed light, the engraved border, the eyelet
      jsx("path", { d: face(-TAG.t / 2), fill: rampAt(CHROME, 0.25) }),
      jsx("path", { d: face(TAG.t / 2), fill: col, stroke: rampAt(CHROME, 0.95), strokeWidth: Math.max(0.5, 1.1 * k) }),
      jsx("path", { d: face(TAG.t / 2), fill: `url(#${id}tg)` }),
      jsx("path", { d: "M" + border.map(([a, b]) => S(tagAt(tf, a, b, TAG.t / 2 + 0.2))).map((p) => `${f2(p[0])},${f2(p[1])}`).join("L") + "Z", fill: "none", stroke: "#26384F", strokeWidth: Math.max(0.5, 1.2 * k), opacity: 0.7 }),
      jsx("ellipse", { cx: f2(holeC[0]), cy: f2(holeC[1]), rx: f2(9 * k), ry: f2(9 * k * Math.max(0.3, Math.abs(tf.n[2]))), fill: "#071222", stroke: "#E6EEF8", strokeWidth: Math.max(0.6, 1.8 * k) }),
      gleam > -1 && gleam < 1 && jsx("g", { clipPath: `url(#${id}tc)`, children: jsx("path", { d: "M" + [[sweepX - 40, 0], [sweepX + 30, 0], [sweepX - 5, TAG.h + 8], [sweepX - 75, TAG.h + 8]].map(([a, b]) => S(tagAt(tf, a, b, TAG.t / 2 + 0.3))).map((p) => `${f2(p[0])},${f2(p[1])}`).join("L") + "Z", fill: "#FFFFFF", opacity: 0.24 * Math.sin(Math.PI * clamp01((gleam + 1) / 2)) }) })
    ] }),
    seeFront && jsx(XPlane, { rig, x: X, u: -W / 2, v: TAG.hole + 18, w: TAG.t / 2 + 0.4, width: W, height: H, op: clamp01(on), probe: "the whistle tag's engraving", children: jsxs("div", { style: { width: W, height: H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }, children: [
      jsx("div", { style: { ...label(35, "#0E1A2B"), letterSpacing: 2, lineHeight: 1 }, children: name }),
      jsx("div", { style: { ...label(21, "#2A3E58"), letterSpacing: 4, lineHeight: 1 }, children: role })
    ] }) })
  ] });
};
/** the chrome split ring through the whistle's lug: two turns of flat wire (drawn as two ellipses in the ring's plane) */
export const SplitRing = ({ rig, c, r, u, v }) => {
  const pts = (rr, off) => Array.from({ length: 40 }, (_, i) => {
    const a = i / 40 * 2 * Math.PI;
    return worldScr(rig, add(add(c, mul(u, rr * Math.cos(a))), add(mul(v, rr * Math.sin(a)), [0, 0, off])));
  });
  const k = prOf(rig, c).scale;
  return jsxs("g", { children: [
    jsx("path", { d: poly(pts(r, -1.2)), fill: "none", stroke: "#1A2A40", strokeWidth: Math.max(1, 3.4 * k) }),
    jsx("path", { d: poly(pts(r, 0)), fill: "none", stroke: rampAt(CHROME, 0.82), strokeWidth: Math.max(1, 2.6 * k) }),
    jsx("path", { d: poly(pts(r - 0.2, 1.4)), fill: "none", stroke: "#FFFFFF", strokeWidth: Math.max(0.6, 1.0 * k), opacity: 0.8 })
  ] });
};
/** the lanyard: a woven cord from the ring falling to the table, then lying across it out to the right */
export const Lanyard = ({ rig, from, top, out }) => {
  const k = prOf(rig, from).scale;
  const foot = [from[0] + 60, top - 3, from[2] - 40];
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const u = i / 16;
    // a hanging curve from the ring to its foot on the table, the lower half resting in a soft bow
    pts.push([from[0] + (foot[0] - from[0]) * u, from[1] + (foot[1] - from[1]) * Math.sin(u * Math.PI / 2), from[2] + (foot[2] - from[2]) * u]);
  }
  for (let i = 1; i <= 14; i++) {
    const u = i / 14;
    pts.push([foot[0] + (out[0] - foot[0]) * u, top - 3, foot[2] + (out[2] - foot[2]) * u + 70 * Math.sin(u * Math.PI)]);
  }
  const d = poly(pts.map((q) => worldScr(rig, q)), false);
  return jsxs("g", { children: [
    jsx("path", { d, stroke: "#02060C", strokeWidth: Math.max(1, 9 * k), opacity: 0.5, fill: "none", strokeLinecap: "round", strokeLinejoin: "round", transform: "translate(2 4)" }),
    jsx("path", { d, stroke: rampAt(CORD, 0.42), strokeWidth: Math.max(1, 8 * k), fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }),
    jsx("path", { d, stroke: rampAt(CORD, 0.8), strokeWidth: Math.max(0.6, 2.2 * k), opacity: 0.55, fill: "none", strokeLinecap: "round", strokeDasharray: `${f2(5 * k)} ${f2(4 * k)}`, transform: "translate(-1 -1.5)" })
  ] });
};
