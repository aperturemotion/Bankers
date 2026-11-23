// @ts-nocheck
// ★ V36 "Bre-X Gold" — rule helpers (builder C, rev 1): THE TWO-KEY VITRINE.
//   A steel display vitrine on a machined plinth: four steel corner posts, glass side panes, a brushed back panel, a header
//   carrying an engraved nameplate (two lines: NI 43-101 / 2001), a lamp strip under the header, and a pair of glass DOORS in
//   steel frames (French doors) hinged on the front posts, each with a handle bar. Inside, on a small steel display block, the company's results: the film's gold
//   bar (bx_bar), dimmed behind the tinted glass until it is released. The plinth's front carries TWO key locks (bezel, plug,
//   keyway) with a steel key standing in each, and under each an engraved plate (QUALIFIED PERSON / INDEPENDENT) whose paint fills
//   on its word. A key turns (its bow from upright to level), its bezel ring lights; when both have turned the door swings open and
//   the lamp lights the bar.
//   Local frame (world units ≈ px at the pivot depth; y up = negative, z toward the lens): origin at the plinth's foot centre.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { cw, cylW, prism, rampAt } from "./solid_engine";
import { XPlane, mapPath, mapScr, rrectPts, wound, xfApply, xfDir, xfMul, xfRotY, xfScale, xfTrans } from "./tk_rig";
import { Faces, Screw, vCyl } from "./counter_plinth";
import { Engraved } from "./counter_drums";
import { PL_BODY, PL_GROOVE, PL_LIP, PL_PLATE, PL_RUBBER, PL_STEEL } from "./counter_mat";
import { CT_PAINT } from "./counter_ink";
import { BX_STEEL, BX_STEEL_IN } from "./bx_gold";
import { BAR, BarBody } from "./bx_bar";
import { label } from "./kit";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const xfFaces = (faces, x) => faces.map((f) => ({ ...f, pts: f.pts.map((p) => xfApply(x, p)), n: xfDir(x, f.n), vn: f.vn ? [xfDir(x, f.vn[0]), xfDir(x, f.vn[1])] : void 0 }));
const box = (cx, cy, cz, w, h, d, bev = 2, pass = 1) => prism(rrectPts(w, h, Math.min(3, w / 3, h / 3), 2, cx, cy), d, bev, 0, pass, () => false, [0, 0, cz]);

export const RC = { pw: 540, ph: 200, sh: 66, pd: 610, pzc: 73, feet: 10, vw: 440, vd: 300, sill: 16, vh: 490, head: 78, post: 22, vz: -62 };
const PZF = RC.pzc + RC.pd / 2;                   // the plinth's front face: a LOW STEP before the vitrine carries the locks
const PZB = RC.pzc - RC.pd / 2;                   // the plinth's back
const VY0 = -RC.ph, VF = VY0 - RC.sill;           // the vitrine sits on the plinth top; its floor is the sill's top
const VTOP = VF - RC.vh;                          // the underside of the header
const VZ = RC.vz;                                 // the vitrine stands at the back of the plinth, a ledge before it
const VZF = VZ + RC.vd / 2;                       // the vitrine's front plane (the posts' outer face)
const HZF = VZF + 10;                             // the header's front face
const RZ = VZF + 20;                              // the raised block's front (the riser): the step runs from here to PZF
const HP = { w: 300, h: 56, t: 5 };               // the header's nameplate
// the two locks stand on the plinth's front ledge (keys upright), FORWARD of everything the doors sweep (rev 1, Timur: the door
//   went through the keys); their engraved plates are on the plinth's front face
export const LOCKS = [{ u: -125, z: PZF - 46 }, { u: 125, z: PZF - 46 }];
const PLATE = { w: 222, h: 40, v: -RC.feet - (RC.sh - RC.feet) / 2, t: 5 };
// the doors: a pair of glass leaves, each hinged on its front post's inner edge, meeting in the middle (French doors)
const DOOR = { x0: -RC.vw / 2 + RC.post, w: (RC.vw - 2 * RC.post) / 2, z: VZF - 4, st: 16, open: 105 };
// ★ every point either leaf sweeps (0 … DOOR.open°, its frame and handle standing 20 proud) must clear every key's bezel (r 30)
//   by ≥ 8 in plan — so a door never meets a key (Timur, rev 1)
export const DOOR_CLEARANCE = (() => {
  let worst = Infinity;
  for (const s of [-1, 1]) for (let a = 0; a <= DOOR.open; a += 1) for (let r = 0; r <= DOOR.w; r += 2) {
    const th = a * Math.PI / 180, px = s * DOOR.x0 + s * r * Math.cos(th), pz = DOOR.z + r * Math.sin(th);
    for (const l of LOCKS) worst = Math.min(worst, Math.hypot(px - l.u, pz - l.z) - 30 - 20);
  }
  if (worst < 8) throw new Error(`rule_case: a door leaf would pass within ${worst.toFixed(1)} of a key's bezel — move the locks forward`);
  // and the keys stand on the low step: their bows top out below the leaves' bottom rails
  if (RC.sh + 11 + 78 + 27 + 20 > RC.ph + RC.sill) throw new Error("rule_case: the key bows must top out ≥ 20 under the doors' bottom rails");
  return worst;
})();
// the bar on its display block
export const BAR_K = 0.36;
const BLOCK = { w: 170, h: 34, d: 110 };
export const barXfOf = (pose) => xfMul(pose, xfMul(xfTrans([0, VF - BLOCK.h - BAR_K * BAR.H / 2, VZ - 10]), xfScale(BAR_K)));

let memo = null;
const parts = () => {
  if (memo) return memo;
  const feet = wound([-1, 1].flatMap((s) => [-1, 1].flatMap((t) => vCyl(s * (RC.pw / 2 - 46), RC.pzc + t * (RC.pd / 2 - 40), -RC.feet, 0, 15, 0, 0))));
  const plinth = wound([
    ...prism(rrectPts(RC.pw, RC.ph - RC.feet, 7, 3, 0, -RC.feet - (RC.ph - RC.feet) / 2), RZ - PZB, 5, 0, 1, () => false, [0, 0, (RZ + PZB) / 2]),
    ...prism(rrectPts(RC.pw, RC.sh - RC.feet, 6, 3, 0, -RC.feet - (RC.sh - RC.feet) / 2), PZF - RZ + 6, 4, 0, 1, () => false, [0, 0, (PZF + RZ - 6) / 2])
  ]);
  const sill = wound(box(0, VY0 - RC.sill / 2, VZ, RC.vw + 12, RC.sill, RC.vd + 12, 2.5, 2));
  const posts = wound([-1, 1].flatMap((s) => [-1, 1].flatMap((t) => box(s * (RC.vw / 2 - RC.post / 2), (VF + VTOP) / 2, VZ + t * (RC.vd / 2 - RC.post / 2), RC.post, RC.vh, RC.post, 2, 2))));
  const head = wound(box(0, VTOP - RC.head / 2, VZ, RC.vw + 20, RC.head, RC.vd + 20, 4, 3));
  const nplate = wound(prism(rrectPts(HP.w, HP.h, 6, 3, 0, VTOP - RC.head / 2), HP.t, 1.6, 0, 4, () => false, [0, 0, HZF + HP.t / 2]));
  const lamp = wound(box(0, VTOP + 7, VZ, RC.vw - 2 * RC.post - 30, 12, 30, 2, 4));
  const block = wound(box(0, VF - BLOCK.h / 2, VZ - 10, BLOCK.w, BLOCK.h, BLOCK.d, 3, 3));
  const plates = LOCKS.map((l) => wound(prism(rrectPts(PLATE.w, PLATE.h, 5, 3, l.u, PLATE.v), PLATE.t, 1.6, 0, 3, () => false, [0, 0, PZF + PLATE.t / 2])));
  const bezels = LOCKS.map((l) => wound(vCyl(l.u, l.z, -RC.sh - 9, -RC.sh, 30, 0, 3)));
  const plugs = LOCKS.map((l) => wound(vCyl(l.u, l.z, -RC.sh - 11, -RC.sh - 9, 19, 0, 4)));
  memo = { feet, plinth, sill, posts, head, nplate, lamp, block, plates, bezels, plugs };
  return memo;
};
// a leaf's own parts (its frame and handle), in its frame: x along it from the hinge (× s: +1 the left leaf, −1 the right), y down
//   from its top, z out
const dmemo = new Map();
const doorParts = (s) => {
  if (dmemo.has(s)) return dmemo.get(s);
  const H = RC.vh, W = DOOR.w, t = DOOR.st;
  const frame = wound([
    ...box(s * t / 2, -H / 2, 0, t, H, 10), ...box(s * (W - t / 2), -H / 2, 0, t, H, 10),
    ...box(s * W / 2, -t / 2, 0, W - 2 * t, t, 10), ...box(s * W / 2, -H + t / 2, 0, W - 2 * t, t, 10)
  ]);
  const hx = s * (W - 26);
  const handle = wound([...box(hx, -H / 2, 18, 10, 130, 10, 2, 3), ...box(hx, -H / 2 - 52, 10, 10, 10, 12, 1.5, 2), ...box(hx, -H / 2 + 52, 10, 10, 10, 12, 1.5, 2)]);
  const out = { frame, handle };
  dmemo.set(s, out);
  return out;
};
export const caseCorners = (pose) => {
  const out = [];
  for (const x of [-RC.pw / 2, RC.pw / 2]) for (const y of [VTOP - RC.head, 0]) for (const z of [-1, 1]) out.push(xfApply(pose, [x, y, y < -RC.ph - 1 ? VZ + z * RC.vd / 2 : RC.pzc + z * RC.pd / 2]));
  return out;
};
/** a leaf's pose (s +1 the left leaf, −1 the right) for an opening angle a (degrees, 0 shut … DOOR.open, swung out toward the lens) */
const doorXf = (pose, s, a) => xfMul(pose, xfMul(xfTrans([s * DOOR.x0, VF, DOOR.z]), xfRotY(-s * a)));
// a key standing upright in its lock: a steel bow (a ring on a shank, a collar at the plug); φ its turn about the vertical
//   (0 = its face to the lens … 90 = edge-on: turned)
const KEY_Y = -RC.sh - 11;
const keyXf = (l, phi) => ({ m: xfRotY(phi).m, t: [l.u, KEY_Y, l.z] });
const keyFaces = (l, phi) => {
  const ring = Array.from({ length: 24 }, (_, k) => {
    const a = k / 24 * 2 * Math.PI;
    return [27 * Math.cos(a), -78 + 27 * Math.sin(a)];
  });
  return wound(xfFaces([
    ...prism(cw(ring), 7, 1.4, 0, 5),
    ...prism(cw([[-7, 0], [7, 0], [7, -54], [-7, -54]]), 7, 1, 0, 5),
    ...prism(cw([[-12, -46], [12, -46], [12, -56], [-12, -56]]), 10, 1.2, 0, 5)
  ], keyXf(l, phi)));
};
const keyHole = (l, phi) => (k) => {
  const a = k / 20 * 2 * Math.PI, x = keyXf(l, phi);
  const side = Math.cos(phi * Math.PI / 180) >= 0 ? 3.7 : -3.7;
  return xfApply(x, [10 * Math.cos(a), -78 + 10 * Math.sin(a), side]);
};
// the two-line nameplate on the header (both lines engraved, the paint filling on the word)
const NamePlate = ({ rig, pose, lines, on }) => {
  const W = HP.w - 30, H = HP.h - 6, u = -W / 2, v = VTOP - RC.head / 2 - H / 2;
  const run = (col, op, dy) => jsxs("div", { style: { position: "absolute", left: 0, top: dy, width: W, height: H, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, opacity: op }, children: lines.map((ln, i) => jsx("div", { style: { ...label(ln.size, col), lineHeight: 1 }, children: ln.text }, i)) });
  return jsxs(jsx_runtime.Fragment, { children: [
    jsx(XPlane, { rig, x: pose, u, v, w: HZF + HP.t + 0.3, width: W, height: H, probe: "the vitrine's engraved nameplate", children: jsxs("div", { style: { position: "relative", width: W, height: H }, children: [run(PL_LIP, 0.28, 1.2), run(PL_GROOVE, 0.35, 0)] }) }),
    jsx(XPlane, { rig, x: pose, u, v, w: HZF + HP.t + 0.5, width: W, height: H, op: clamp01(on), probe: "the vitrine's engraved nameplate", children: run("#11161B", 1, 0) })
  ] });
};
/** the vitrine: keys [{ phi, lit }] per lock, plates [{ text, on }], name { lines, on }, door 0…1, lamp 0…1, sheen −1…1 */
export const RuleCase = ({ id, rig, pose, keys, plates, name, door = 0, lamp = 0, sheen = 0 }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const S = (q) => mapScr(map, rig, q);
  const { feet, plinth, sill, posts, head, nplate, lamp: lampF, block, plates: plateF, bezels, plugs } = parts();

  const xl = -RC.vw / 2 + RC.post, xr = RC.vw / 2 - RC.post, zb = VZ - RC.vd / 2 + RC.post, zf = VZF - RC.post / 2;
  // the brushed plinth face, its seam, its screws
  const brush = [];
  for (let v = -RC.ph + 8; v < -RC.sh - 6; v += 7) brush.push(P([[-RC.pw / 2 + 8, v, RZ + 0.15], [RC.pw / 2 - 8, v, RZ + 0.15]], false));
  // the back panel and the interior floor
  const back = P([[xl, VTOP, zb], [xr, VTOP, zb], [xr, VF, zb], [xl, VF, zb]]);
  const b0 = S([xl, VTOP, zb]), b1 = S([xr * 0.4, VF, zb]);
  const floor = P([[xl, VF - 0.3, zb], [xr, VF - 0.3, zb], [xr, VF - 0.3, zf], [xl, VF - 0.3, zf]]);
  // the lamp's light falling on the bar: a soft cone from the strip to the block
  const cone = P([[-110, VTOP + 14, VZ - 10], [110, VTOP + 14, VZ - 10], [150, VF - 2, VZ + 30], [-150, VF - 2, VZ + 30]]);
  const c0 = S([0, VTOP + 14, VZ - 10]), c1 = S([0, VF, VZ + 30]);
  // the side panes (glass), the door's pane
  const paneL = P([[xl - RC.post / 2, VTOP, zb], [xl - RC.post / 2, VTOP, zf], [xl - RC.post / 2, VF, zf], [xl - RC.post / 2, VF, zb]]);
  const paneR = P([[xr + RC.post / 2, VTOP, zb], [xr + RC.post / 2, VTOP, zf], [xr + RC.post / 2, VF, zf], [xr + RC.post / 2, VF, zb]]);
  // the two leaves: pane (tinted glass, light streaks), frame, handle — painted far leaf first
  const dw = DOOR.w, dh = RC.vh, st = DOOR.st;
  const leaves = [1, -1].map((s) => {
    const dmap = (q) => xfApply(doorXf(pose, s, DOOR.open * door), q);
    const DP = (pts, close = true) => mapPath(dmap, rig, pts, close);
    const X = (x) => s * x;
    const pane = DP([[X(st), -st, 0], [X(dw - st), -st, 0], [X(dw - st), -dh + st, 0], [X(st), -dh + st, 0]]);
    const streak = (a, w) => DP([[X(st + dw * a), -st, 0.4], [X(st + dw * (a + w)), -st, 0.4], [X(st + dw * (a + w) - dw * 0.3), -dh + st, 0.4], [X(st + dw * a - dw * 0.3), -dh + st, 0.4]]);
    const g0 = mapScr(dmap, rig, [X(st), -st, 0]), g1 = mapScr(dmap, rig, [X(dw - st), -dh + st, 0]);
    return { s, dmap, pane, streak, g0, g1, ...doorParts(s) };
  });
  const shut = 1 - clamp01(door * 3);
  const barXf = barXfOf(pose);
  const svg = (children) => jsx("svg", { width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children });
  return jsxs(jsx_runtime.Fragment, { children: [
    svg([
      jsxs("defs", { children: [
        jsxs("linearGradient", { id: `${id}Bk`, gradientUnits: "userSpaceOnUse", x1: f2(b0[0]), y1: f2(b0[1]), x2: f2(b1[0]), y2: f2(b1[1]), children: [
          jsx("stop", { offset: "0", stopColor: rampAt(PL_BODY, 0.34 + 0.12 * lamp) }),
          jsx("stop", { offset: "1", stopColor: rampAt(PL_BODY, 0.12 + 0.08 * lamp) })
        ] }),
        jsxs("linearGradient", { id: `${id}Cn`, gradientUnits: "userSpaceOnUse", x1: f2(c0[0]), y1: f2(c0[1]), x2: f2(c1[0]), y2: f2(c1[1]), children: [
          jsx("stop", { offset: "0", stopColor: "#FFF6DA", stopOpacity: 0.32 }),
          jsx("stop", { offset: "1", stopColor: "#FFF6DA", stopOpacity: 0.02 })
        ] }),
        ...leaves.map((lv) => jsxs("linearGradient", { id: `${id}Gl${lv.s > 0 ? "L" : "R"}`, gradientUnits: "userSpaceOnUse", x1: f2(lv.g0[0]), y1: f2(lv.g0[1]), x2: f2(lv.g1[0]), y2: f2(lv.g1[1]), children: [
          jsx("stop", { offset: "0", stopColor: "#CFE0F5", stopOpacity: 0.16 }),
          jsx("stop", { offset: "0.5", stopColor: "#9FBADB", stopOpacity: 0.07 }),
          jsx("stop", { offset: "1", stopColor: "#CFE0F5", stopOpacity: 0.13 })
        ] }, `gl${lv.s}`))
      ] }, "defs"),
      jsx(Faces, { faces: feet, map, rig, ramp: () => PL_RUBBER, spec: 0.2 }, "ft"),
      jsx(Faces, { faces: plinth, map, rig, ramp: () => PL_BODY, spec: 0.5 }, "pl"),
      jsx("path", { d: brush.join(""), stroke: "#ffffff", strokeOpacity: 0.035, strokeWidth: 1, fill: "none" }, "br"),
      jsx("path", { d: P([[-RC.pw / 2 + 6, -RC.ph + 22, RZ + 0.3], [RC.pw / 2 - 6, -RC.ph + 22, RZ + 0.3]], false), stroke: PL_GROOVE, strokeWidth: 2, opacity: 0.8, fill: "none" }, "sm"),
      jsx("path", { d: P([[-RC.pw / 2 + 6, -RC.ph + 24, RZ + 0.3], [RC.pw / 2 - 6, -RC.ph + 24, RZ + 0.3]], false), stroke: PL_LIP, strokeWidth: 0.9, opacity: 0.3, fill: "none" }, "sl"),
      [[-1, -RC.ph + 44, RZ], [1, -RC.ph + 44, RZ], [-1, PLATE.v, PZF], [1, PLATE.v, PZF]].map(([s, v, z], k) => jsx(Screw, { id: `${id}ps${k}`, map, rig, c: [s * (RC.pw / 2 - 16), v, z], r: 5.5, plane: "front", slot: [25, -30, 50, -10][k] }, `ps${k}`)),
      // each lock's plate (under it) and its bezel and plug
      ...plateF.map((f, i) => jsx(Faces, { faces: f, map, rig, ramp: () => PL_STEEL, spec: 0.7 }, `pf${i}`)),
      ...LOCKS.flatMap((l, i) => [
        jsx("path", { d: P(Array.from({ length: 30 }, (_, k) => [l.u + 6 + 33 * Math.cos(k / 30 * 2 * Math.PI), -RC.sh - 0.2, l.z - 4 + 33 * Math.sin(k / 30 * 2 * Math.PI)])), fill: "#000000", opacity: 0.35 }, `ls${i}`),
        jsx(Faces, { faces: bezels[i], map, rig, ramp: () => PL_STEEL, spec: 0.9 }, `bz${i}`),
        jsx(Faces, { faces: plugs[i], map, rig, ramp: () => PL_STEEL, spec: 0.95 }, `pg${i}`),
        // the keyway turns with the plug
        jsx("path", { d: P([0, 1].map((e) => {
          const p = keys[i].phi * Math.PI / 180;
          return [l.u + Math.cos(p) * (e ? 14 : -14), -RC.sh - 11.2, l.z - Math.sin(p) * (e ? 14 : -14)];
        }), false), stroke: "#05090D", strokeWidth: 4, strokeLinecap: "round", fill: "none" }, `kw${i}`),
        // the bezel ring lights as its key turns
        keys[i].lit > 1e-3 && jsx("path", { d: P(Array.from({ length: 36 }, (_, k) => [l.u + 26 * Math.cos(k / 36 * 2 * Math.PI), -RC.sh - 9.3, l.z + 26 * Math.sin(k / 36 * 2 * Math.PI)])), fill: "none", stroke: "#B3CEEF", strokeWidth: 6, opacity: f2(0.35 * keys[i].lit), style: { filter: "blur(3px)" } }, `lg${i}`),
        keys[i].lit > 1e-3 && jsx("path", { d: P(Array.from({ length: 36 }, (_, k) => [l.u + 26 * Math.cos(k / 36 * 2 * Math.PI), -RC.sh - 9.4, l.z + 26 * Math.sin(k / 36 * 2 * Math.PI)])), fill: "none", stroke: "#EAF3FD", strokeWidth: 2, opacity: f2(0.85 * keys[i].lit) }, `lr${i}`)
      ]),
      // the vitrine: sill, back panel, floor, the lamp's light, the display block
      jsx(Faces, { faces: sill, map, rig, ramp: () => PL_PLATE, spec: 0.6 }, "si"),
      jsx("path", { d: back, fill: `url(#${id}Bk)` }, "bk"),
      jsx("path", { d: floor, fill: rampAt(PL_BODY, 0.16 + 0.1 * lamp) }, "fl"),
      jsx(Faces, { faces: block, map, rig, ramp: () => PL_STEEL, spec: 0.7 }, "bl")
    ]),
    svg([
      jsx(BarBody, { id: `${id}Bar`, rig, xf: barXf, m: 1, gold: 1, seed: 5, sheen }, "bar"),
      lamp > 1e-3 && jsx("path", { d: cone, fill: `url(#${id}Cn)`, opacity: f2(lamp), style: { filter: "blur(8px)" } }, "cn"),
      // the tint of the shut case over its contents, lifting as the door opens and the lamp comes on
      jsx("path", { d: P([[xl, VTOP, zf], [xr, VTOP, zf], [xr, VF, zf], [xl, VF, zf]]), fill: "#071628", opacity: f2(0.42 * (1 - lamp)) }, "tn"),
      jsx("path", { d: paneL, fill: "#CFE0F5", opacity: 0.06 }, "gL"),
      jsx("path", { d: paneR, fill: "#CFE0F5", opacity: 0.05 }, "gR"),
      jsx(Faces, { faces: posts, map, rig, ramp: () => BX_STEEL, spec: 0.7 }, "po"),
      jsx(Faces, { faces: head, map, rig, ramp: () => BX_STEEL, spec: 0.6 }, "hd"),
      jsx(Faces, { faces: lampF, map, rig, ramp: () => PL_STEEL, spec: 0.5 }, "lp"),
      lamp > 1e-3 && jsx("path", { d: P([[-RC.vw / 2 + RC.post + 18, VTOP + 13.5, VZ + 14], [RC.vw / 2 - RC.post - 18, VTOP + 13.5, VZ + 14]], false), stroke: "#FFF6DA", strokeWidth: 3, opacity: f2(0.9 * lamp), fill: "none" }, "lpl"),
      jsx("path", { d: P(rrectPts(HP.w + 8, HP.h + 8, 8, 3, 4, VTOP - RC.head / 2 + 5).map(([u, v]) => [u, v, HZF + 0.2])), fill: "#000000", opacity: 0.25 }, "nps"),
      jsx(Faces, { faces: nplate, map, rig, ramp: () => PL_STEEL, spec: 0.7 }, "np"),
      [-1, 1].map((s) => jsx(Screw, { id: `${id}ns${s}`, map, rig, c: [s * (HP.w / 2 - 16), VTOP - RC.head / 2, HZF + HP.t], r: 4.5, plane: "front", slot: s * 30 }, `ns${s}`)),
      // the doors: each leaf's pane (tinted glass, two light streaks), its steel frame, its handle
      ...leaves.flatMap((lv) => [
        jsx("path", { d: lv.pane, fill: `url(#${id}Gl${lv.s > 0 ? "L" : "R"})` }, `dp${lv.s}`),
        jsx("path", { d: lv.streak(0.22, 0.16), fill: "#FFFFFF", opacity: f2(0.07 + 0.05 * shut) }, `s1${lv.s}`),
        jsx("path", { d: lv.streak(0.55, 0.06), fill: "#FFFFFF", opacity: f2(0.06 + 0.04 * shut) }, `s2${lv.s}`),
        jsx(Faces, { faces: lv.frame, map: lv.dmap, rig, ramp: () => BX_STEEL, spec: 0.75 }, `df${lv.s}`),
        jsx(Faces, { faces: lv.handle, map: lv.dmap, rig, ramp: () => PL_STEEL, spec: 0.95 }, `dh${lv.s}`)
      ]),
      // the keys standing in their locks
      ...LOCKS.map((l, i) => jsx(Faces, { faces: keyFaces(l, keys[i].phi), map, rig, ramp: () => PL_STEEL, spec: 0.95 }, `ky${i}`)),
      ...LOCKS.map((l, i) => jsx("path", { d: P(Array.from({ length: 20 }, (_, k) => keyHole(l, keys[i].phi)(k))), fill: "#071322", opacity: 0.9 }, `kh${i}`))
    ]),
    jsx(NamePlate, { rig, pose, lines: name.lines, on: name.on }),
    ...LOCKS.map((l, i) => jsx(Engraved, { rig, pose, zF: PZF + PLATE.t, uC: l.u, vC: PLATE.v, width: PLATE.w - 20, size: 21, text: plates[i].text, on: plates[i].on, ink: { groove: "#14181C", lip: "#F3F5F7", paint: "#11161B" }, probe: "a lock's engraved plate", bare: 0.32 }, `en${i}`))
  ] });
};
