// @ts-nocheck
// ★ V36 "Bre-X Gold" — rule helpers (builder C): THE SEAL PRESS, THE TRAY'S END PLATE and THE EMBOSSED SEALS.
//   The press: a cast-iron gooseneck embossing press seen side-on (its broad cast face to the lens): a bevelled base plate with
//     screws, the cast frame (flared foot, column, a lug carrying the lever's pivot pin, the arm reaching over the work, the head
//     the ram slides through), a polished steel ram ending in a die holder and the round DIE, and on top the steel LEVER with a
//     ball knob — pulled down, it drives the ram (its button rides the lever's underside) until the die meets the plate.
//     An engraved nameplate on the arm's face carries two lines (NI 43-101 / 2001) whose paint fills on their word.
//   The end plate: a steel plate riveted to the core tray's near end block, cantilevered toward the lens on two gussets, its
//     top engraved with a border; the seals are embossed into it (raised rim, beaded ring, the wording raised in the middle).
//   Local frames (world units ≈ px at the pivot depth; y up = negative, z toward the lens):
//     press: origin at the column's foot on the floor, the reach toward +x × side, scaled by k about that origin.
//     plate: origin at the centre of its top face.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { cw, cylW, prism, rampAt, lightOf } from "./solid_engine";
import { XPlane, mapPath, mapScr, normalM, rrectPts, wound, xfApply, xfDir, xfMul, xfRotX, xfScale, xfTrans, worldScr, worldView } from "./tk_rig";
import { Faces, Screw, vCyl } from "./counter_plinth";
import { PL_BODY, PL_GROOVE, PL_LIP, PL_PLATE, PL_STEEL } from "./counter_mat";
import { BX_STEEL } from "./bx_gold";
import { label } from "./kit";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const xfFaces = (faces, x) => faces.map((f) => ({ ...f, pts: f.pts.map((p) => xfApply(x, p)), n: xfDir(x, f.n), vn: f.vn ? [xfDir(x, f.vn[0]), xfDir(x, f.vn[1])] : void 0 }));
// a slab lying flat: a polygon in (x, z) extruded along y (thickness t, its top at y = top)
const flat = (pts, t, bev, top, pass) => xfFaces(prism(cw(pts), t, bev, 0, pass), { m: xfRotX(90).m, t: [0, top + t / 2, 0] });

// ── THE PRESS ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const RP = { col: 34, reach: 190, neckTop: -384, neckBot: -296, headHW: 44, headBot: -252, D: 56, baseH: 30, piv: [0, -404], lever: 244, aR: -34, aP: 0, ram: 14 };
const arc = (cx, cy, r, a0, a1, n = 6) => Array.from({ length: n + 1 }, (_, i) => {
  const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});
// the cast gooseneck, side-on: a flared foot, the column, the neck curving over the work into the head the ram slides through,
//   a lug on top carrying the lever's pivot pin
const frameOutline = () => {
  const { col, reach, neckTop, neckBot, headHW, headBot, baseH, piv } = RP;
  const hx0 = reach - headHW, hx1 = reach + headHW;
  return [
    [-col - 24, -baseH], ...arc(-col - 24, -baseH - 40, 40, 90, 0, 5).slice(1),
    [-col, neckTop + 30], ...arc(-col + 30, neckTop + 30, 30, 180, 270),
    [piv[0] - 20, neckTop], ...arc(piv[0], piv[1], 20, 180, 360, 10), [piv[0] + 20, neckTop],
    ...arc(hx1 - 18, neckTop + 18, 18, 270, 360),
    ...arc(hx1 - 14, headBot - 14, 14, 0, 90),
    ...arc(hx0 + 14, headBot - 14, 14, 90, 180),
    [hx0, neckBot],
    ...arc(col + 44, neckBot + 44, 44, 270, 180, 8),
    ...arc(col + 24, -baseH - 40, 40, 180, 90, 5).slice(1), [col + 24, -baseH]
  ];
};
const pmemo = new Map();
const pressParts = (side, dieR) => {
  const key = `${side}|${dieR}`;
  if (pmemo.has(key)) return pmemo.get(key);
  const sx = (pts) => pts.map(([x, y]) => [side * x, y]);
  const frame = wound(prism(cw(sx(frameOutline())), RP.D, 4, 0, 1));
  const base = wound(prism(rrectPts(200, RP.baseH, 8, 3, 0, -RP.baseH / 2), 190, 4, 0, 0));
  const pin = wound(xfFaces(cylW(0, 0, 13, -6, 6, 20, 0, 3), { m: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [side * RP.piv[0], RP.piv[1], RP.D / 2 + 6] }));
  const plate = wound(prism(rrectPts(NP.w, NP.h, 6, 3, side * NP.u, NP.v), 5, 1.6, 0, 3, () => false, [0, 0, RP.D / 2 + 2.5]));
  const bush = wound(vCyl(side * RP.reach, 0, RP.headBot, RP.headBot + 12, 27, 0, 2));
  const out = { frame, base, pin, plate, bush };
  pmemo.set(key, out);
  return out;
};
// the lever angle for a stroke s (0 raised … 1 pressed) and where the ram's top rides on it
// polished tool steel for the die and its holder: V35's graphite steel lifted toward its lit end
const DIE_STEEL = PL_STEEL.map((c, i) => mixHex(c, "#FFFFFF", [0.1, 0.16, 0.22, 0.2, 0][i]));
// the nameplate on the neck's face
const NP = { w: 170, h: 70, u: 120, v: (RP.neckTop + RP.neckBot) / 2 };
const levA = (s) => RP.aR + (RP.aP - RP.aR) * clamp01(s);
const ramTop = (s) => RP.piv[1] + RP.reach * Math.tan(levA(s) * Math.PI / 180) + 8;
/** the die's bottom (local y) for a stroke s, given the plate top pt (local y) — pressed: on the plate */
export const dieBottom = (s, pt) => ramTop(s) + (pt - ramTop(1));
export const pressCorners = (pose, side) => {
  const out = [];
  for (const x of [-100, 100]) for (const y of [RP.piv[1] - 30, 0]) for (const z of [-95, 95]) out.push(xfApply(pose, [x, y, z]));
  return out;
};
/** the press: pose (its foot, scaled), side ±1, stroke s 0…1, pt the plate top (local y), dieR (local), name { lines, on } */
export const RulePress = ({ id, rig, pose, side = 1, s = 0, pt, dieR, name, sheen = 0 }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const { frame, base, pin, plate, bush } = pressParts(side, dieR);
  const rx = side * RP.reach;
  const yDie = dieBottom(s, pt), yHold = yDie - 14, yRam = yHold - 18, yTop = ramTop(s);
  const ram = wound(vCyl(rx, 0, yTop + 4, yRam, RP.ram, 0, 1));
  const button = wound(vCyl(rx, 0, yTop, yTop + 6, RP.ram + 5, 0, 2));
  const holder = wound(vCyl(rx, 0, yRam, yHold, 28, 0, 1));
  const die = wound(vCyl(rx, 0, yHold, yDie, dieR, 0, 2));
  // the die's knurled collar: short vertical cuts round its lit front half
  const knurl = Array.from({ length: 30 }, (_, k) => {
    const a = (0.05 + 0.9 * k / 29) * Math.PI;
    return P([[rx + dieR * Math.cos(a), yHold + 2, dieR * Math.sin(a)], [rx + dieR * Math.cos(a), yDie - 2, dieR * Math.sin(a)]], false);
  }).join("");
  // the frame's cast face: a soft sheen band, the foundry's parting line along its edge
  const z0 = RP.D / 2 + 0.3;
  const band = P([[side * (-RP.col + 14 + sheen), RP.neckTop, z0], [side * (-RP.col + 40 + sheen), RP.neckTop, z0], [side * (-RP.col + 22 + sheen), -RP.baseH - 40, z0], [side * (-RP.col - 4 + sheen), -RP.baseH - 40, z0]]);
  const parting = P(frameOutline().map(([x, y]) => [side * x * 0.985 + side * 0.6, y * 0.99 - 2, z0]));
  // the lever: a round steel bar from the pivot over the ram, a ball knob at its end
  const a = levA(s) * Math.PI / 180, L = RP.lever, zl = 0;
  const lp = (d) => [side * (RP.piv[0] + d * Math.cos(a)), RP.piv[1] + d * Math.sin(a), zl];
  const l0 = mapScr(map, rig, lp(-14)), l1 = mapScr(map, rig, lp(L));
  const kn = mapScr(map, rig, lp(L + 14));
  const sc = rig.persp / Math.max(1, rig.persp - worldView(rig, map(lp(L)))[2]) * Math.hypot(pose.m[0], pose.m[3], pose.m[6]);
  const nx = -(l1[1] - l0[1]), ny = l1[0] - l0[0], nl = Math.hypot(nx, ny) || 1;
  const rod = (w, off) => `M${f2(l0[0] + nx / nl * off)},${f2(l0[1] + ny / nl * off)}L${f2(l1[0] + nx / nl * off)},${f2(l1[1] + ny / nl * off)}`;
  return jsxs(jsx_runtime.Fragment, { children: [
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsx("defs", { children: jsxs("radialGradient", { id: `${id}Kn`, cx: f2(kn[0] - 6 * sc), cy: f2(kn[1] - 7 * sc), r: f2(22 * sc), gradientUnits: "userSpaceOnUse", children: [
        jsx("stop", { offset: "0", stopColor: "#FFFFFF" }),
        jsx("stop", { offset: "0.3", stopColor: rampAt(PL_STEEL, 0.75) }),
        jsx("stop", { offset: "1", stopColor: rampAt(PL_STEEL, 0.12) })
      ] }) }),
      jsx(Faces, { faces: base, map, rig, ramp: () => PL_PLATE, spec: 0.55 }),
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([u, w], k) => jsx(Screw, { id: `${id}bs${k}`, map, rig, c: [u * 78, -RP.baseH - 0.3, w * 76], r: 6, plane: "top", slot: [20, -40, 60, 0][k] }, `bs${k}`)),
      jsx(Faces, { faces: ram, map, rig, ramp: () => PL_STEEL, spec: 0.95 }),
      jsx(Faces, { faces: button, map, rig, ramp: () => PL_STEEL, spec: 0.95 }),
      jsx(Faces, { faces: frame, map, rig, ramp: () => BX_STEEL, spec: 0.55 }),
      jsx("path", { d: band, fill: "#ffffff", opacity: 0.05 }),
      jsx("path", { d: parting, fill: "none", stroke: "#ffffff", strokeWidth: 0.8, opacity: 0.12 }),
      name && jsx(Faces, { faces: plate, map, rig, ramp: () => PL_STEEL, spec: 0.7 }),
      name && [-1, 1].map((u) => jsx(Screw, { id: `${id}ns${u}`, map, rig, c: [side * NP.u + u * (NP.w / 2 - 11), NP.v, RP.D / 2 + 5.2], r: 4, plane: "front", slot: u * 30 }, `ns${u}`)),
      jsx(Faces, { faces: bush, map, rig, ramp: () => PL_STEEL, spec: 0.8 }),
      jsx(Faces, { faces: holder, map, rig, ramp: () => DIE_STEEL, spec: 0.9 }),
      jsx(Faces, { faces: die, map, rig, ramp: () => DIE_STEEL, spec: 0.95 }),
      // the die's lit lower edge (the face that makes the seal)
      jsx("path", { d: P(Array.from({ length: 25 }, (_, k) => { const a = (0.08 + 0.84 * k / 24) * Math.PI; return [rx + dieR * Math.cos(a), yDie - 0.5, dieR * Math.sin(a)]; }), false), fill: "none", stroke: "#FFFFFF", strokeWidth: 1.2, opacity: 0.45 }),
      jsx("path", { d: knurl, stroke: "#000000", strokeWidth: 0.9, opacity: 0.3, fill: "none" }),
      // the lever over everything: its shadow line, the bar (dark edge, body, lit edge), the pin, the knob
      jsx("path", { d: rod(9, 4 * sc), stroke: "#000000", strokeWidth: 3 * sc, opacity: 0.25, fill: "none", strokeLinecap: "round" }),
      jsx("path", { d: rod(9, 0), stroke: rampAt(PL_STEEL, 0.28), strokeWidth: 15 * sc, fill: "none", strokeLinecap: "round" }),
      jsx("path", { d: rod(9, -2.5 * sc), stroke: rampAt(PL_STEEL, 0.72), strokeWidth: 7 * sc, fill: "none", strokeLinecap: "round" }),
      jsx("path", { d: rod(9, -4.4 * sc), stroke: "#FFFFFF", strokeWidth: 1.6 * sc, opacity: 0.7, fill: "none", strokeLinecap: "round" }),
      jsx(Faces, { faces: pin, map, rig, ramp: () => PL_STEEL, spec: 0.95 }),
      jsx("circle", { cx: f2(kn[0] + 3 * sc), cy: f2(kn[1] + 4 * sc), r: f2(22 * sc), fill: "#000000", opacity: 0.3 }),
      jsx("circle", { cx: f2(kn[0]), cy: f2(kn[1]), r: f2(22 * sc), fill: `url(#${id}Kn)` })
    ] }),
    name && jsx(NamePlate, { rig, pose, u: side * NP.u, v: NP.v, z: RP.D / 2 + 5.2, w: NP.w - 14, lines: name.lines, on: name.on })
  ] });
};
// the nameplate's two engraved lines (their grooves always cut faintly, the paint filling on the word)
const NamePlate = ({ rig, pose, u, v, z, w, lines, on }) => {
  const W = w - 8, H = 62;
  const run = (col, op, dy) => jsxs("div", { style: { position: "absolute", left: 0, top: dy, width: W, height: H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: op }, children: [
    jsx("div", { style: { ...label(lines[0].size, col), lineHeight: 1 }, children: lines[0].text }),
    lines[1] && jsx("div", { style: { ...label(lines[1].size, col), lineHeight: 1, marginTop: 5 }, children: lines[1].text })
  ] });
  return jsxs(jsx_runtime.Fragment, { children: [
    jsx(XPlane, { rig, x: pose, u: u - W / 2, v: v - H / 2, w: z + 0.3, width: W, height: H, probe: "the press's engraved nameplate", children: jsxs("div", { style: { position: "relative", width: W, height: H }, children: [run(PL_LIP, 0.22, 1.2), run(PL_GROOVE, 0.4, 0)] }) }),
    jsx(XPlane, { rig, x: pose, u: u - W / 2, v: v - H / 2, w: z + 0.5, width: W, height: H, op: clamp01(on), probe: "the press's engraved nameplate", children: run("#11161B", 1, 0) })
  ] });
};

// ── THE END PLATE AND ITS SEALS ──────────────────────────────────────────────────────────────────────────────────────────────────
export const EP = { w: 410, d: 160, t: 6, onBlock: 22 };
let ememo = null;
const plateParts = () => {
  if (ememo) return ememo;
  const plate = wound(flat(rrectPts(EP.w, EP.d, 8, 3), EP.t, 1.8, 0, 1));
  // two gussets under the cantilevered plate, against the end block's outer face (z = −d/2 + onBlock)
  const zb = -EP.d / 2 + EP.onBlock;
  const gus = wound([-1, 1].flatMap((s) => xfFaces(prism(cw([[0, 0], [EP.d - EP.onBlock - 22, 0], [0, 30]]), 8, 1, 0, 0), { m: [0, 0, -1, 0, 1, 0, 1, 0, 0], t: [s * 105, EP.t, zb] })));
  ememo = { plate, gus };
  return ememo;
};
export const plateCorners = (pose) => {
  const out = [];
  for (const x of [-EP.w / 2, EP.w / 2]) for (const y of [0, EP.t + 30]) for (const z of [-EP.d / 2, EP.d / 2]) out.push(xfApply(pose, [x, y, z]));
  return out;
};
/** the end plate with its seals: seals [{ u, r, lines: [{ text, size }], on, star, inner }] (u along the plate, centred in depth) */
export const RulePlate = ({ id, rig, pose, seals = [] }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const { plate, gus } = plateParts();
  const top = -0.25;
  const border = P(rrectPts(EP.w - 22, EP.d - 22, 5, 3).map(([x, z]) => [x, top, z]));
  return jsxs(jsx_runtime.Fragment, { children: [
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsx(Faces, { faces: gus, map, rig, ramp: () => PL_PLATE, spec: 0.5 }),
      jsx(Faces, { faces: plate, map, rig, ramp: () => PL_STEEL, spec: 0.6 }),
      jsx("path", { d: border, fill: "none", stroke: PL_GROOVE, strokeWidth: 1.3, opacity: 0.5 }),
      jsx("path", { d: border, fill: "none", stroke: "#FFFFFF", strokeWidth: 0.7, opacity: 0.35, transform: "translate(0.6 0.9)" }),
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([u, w], k) => jsx(Screw, { id: `${id}s${k}`, map, rig, c: [u * (EP.w / 2 - 15), top, w * (EP.d / 2 - 15)], r: 5, plane: "top", slot: [30, -20, 70, 10][k] }, `s${k}`))
    ] }),
    seals.map((s, k) => jsx(Seal, { rig, pose, ...s }, k))
  ] });
};
// an embossed seal: lying in the plate's top face (an XPlane turned face-up); the key light is upper left, so on the plate the
//   raised rim catches it on its left and lens-ward side (lower left in the seal's own frame)
const Seal = ({ rig, pose, u, r, lines, on, star = true, inner = true }) => {
  if (on <= 1e-3) return null;
  const x = xfMul(pose, xfMul(xfTrans([u, -0.3, 0]), xfRotX(90)));
  const S = 2 * r, c = r;
  const beads = Array.from({ length: 40 }, (_, k) => {
    const a = k / 40 * 2 * Math.PI;
    return [c + (r - 12) * Math.cos(a), c + (r - 12) * Math.sin(a)];
  });
  const ring = (rr, col, wdt, dx, dy, op) => jsx("circle", { cx: c + dx, cy: c + dy, r: rr, fill: "none", stroke: col, strokeWidth: wdt, opacity: op });
  const txt = (col, dx, dy, op) => jsxs("div", { style: { position: "absolute", left: dx, top: dy, width: S, height: S, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: op }, children: [
    lines.map((ln, i) => jsx("div", { style: { ...label(ln.size, col), letterSpacing: 1, lineHeight: 0.98 }, children: ln.text }, i))
  ] });
  return jsx(XPlane, { rig, x, u: -r, v: -r, w: 0, width: S, height: S, op: clamp01(on), probe: "the seal embossed into the tray's end plate", children: jsxs("div", { style: { position: "relative", width: S, height: S }, children: [
    jsxs("svg", { width: S, height: S, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      // the pressed field: a shallow polished disc, its soft shadowed edge
      jsx("circle", { cx: c, cy: c, r: r - 1, fill: rampAt(PL_STEEL, 0.62), opacity: 0.55 }),
      ring(r - 1, "#1A1F24", 2.2, 0.9, -0.9, 0.5),
      // the raised rim: shadow side, lit side, body
      ring(r - 5, "#1A1F24", 5, 1.3, -1.3, 0.55),
      ring(r - 5, "#FFFFFF", 5, -1.1, 1.1, 0.7),
      ring(r - 5, rampAt(PL_STEEL, 0.7), 4.2, 0, 0, 1),
      // the beaded ring
      jsx("path", { d: beads.map(([bx, by]) => `M${f2(bx + 2.2)},${f2(by)}a2.2,2.2 0 1,0 -4.4,0a2.2,2.2 0 1,0 4.4,0`).join(""), fill: "#1A1F24", opacity: 0.45, transform: "translate(0.7 -0.7)" }),
      jsx("path", { d: beads.map(([bx, by]) => `M${f2(bx + 2)},${f2(by)}a2,2 0 1,0 -4,0a2,2 0 1,0 4,0`).join(""), fill: rampAt(PL_STEEL, 0.9) }),
      inner && ring(r - 19, "#1A1F24", 1.2, 0.6, -0.6, 0.5),
      inner && ring(r - 19, "#FFFFFF", 0.9, -0.5, 0.5, 0.6),
      star && jsx("path", { d: starPath(c, c + r * 0.62, r * 0.09), fill: rampAt(PL_STEEL, 0.85), stroke: "#1A1F24", strokeWidth: 0.7, strokeOpacity: 0.5 }),
      star && jsx("path", { d: starPath(c, c - r * 0.62, r * 0.09), fill: rampAt(PL_STEEL, 0.85), stroke: "#1A1F24", strokeWidth: 0.7, strokeOpacity: 0.5 })
    ] }),
    // the raised wording: its shadow side, its lit side, its face
    txt("#1A1F24", 1, -1, 0.55),
    txt("#FFFFFF", -0.9, 0.9, 0.75),
    txt("#3A434D", 0, 0, 1)
  ] }) });
};
const starPath = (cx, cy, R) => `M${Array.from({ length: 10 }, (_, k) => {
  const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? R * 0.45 : R;
  return `${f2(cx + rr * Math.cos(a))},${f2(cy + rr * Math.sin(a))}`;
}).join("L")}Z`;
/** a seal's rim point (world) at angle a (radians, in the seal's own frame: 0 = +u, π/2 = toward the lens) */
export const sealRim = (pose, u, r, a) => xfApply(pose, [u + (r - 5) * Math.cos(a), -1, (r - 5) * Math.sin(a)]);
