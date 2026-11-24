// @ts-nocheck
// ★ V37 "Theranos" — crack helper (builder C, REV 1): THE LAB LINE. A sample conveyor runs past the small Edison (builder B's
//   th_edison, imported) and into the side of a big commercial lab analyser (unbranded). Nanotainers (builder H's th_tube) ride the
//   belt in blue carrier pucks, pass the Edison by and go ALL the way in through the analyser's brush-curtained port; each arrival
//   steps the analyser's reagent carousel, pulses its status beacon and adds a row to its touchscreen's test queue.
//   Drawn on V35's tk_rig (worldScr; claim_kit's PaintParts for the solids), one key light from the upper left (solid_engine).
//   WORLD (shared with crack.tsx): the floor at y = TK_FLOOR_Y, y DOWN, z toward the lens; the belt runs along +x at z = BELT.z.
//
//   <Conveyor rig xs belt /> the track: rails, belt (its seams riding `belt` units), legs   (an SVG <g>; its front rail is separate:
//     <ConveyorFront rig /> paints over the pucks' feet)
//   <Puck rig x /> a carrier puck at belt position x                ·  tubeAt(rig, x) → ThTube props for the tube standing in it
//   <Analyser id rig rot beacon rows /> the analyser (an SVG fragment), rot = the carousel's turn (deg), beacon 0…1, rows 0…n
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { rampAt } from "./solid_engine";
import { mapScr, worldScr, worldView, xfApply, xfTrans } from "./tk_rig";
import { PaintParts, boxAB, cylAB, f2, part, path3, ring3 } from "./claim_kit";
import { PL_BODY, PL_RUBBER, PL_STEEL, TH_ALU } from "./claim_mat";
import { TK_FLOOR_Y } from "./tk_slab";
import { TK_BAND } from "./tk_mat";
import { theme } from "./theme";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const FY = TK_FLOOR_Y;
// the analyser's painted panels: a pale steel-blue enamel (the house's steel ramp lifted toward white), graphite trims
const PANEL = ["#2C3B50", "#62768F", "#A3B4C8", "#D5DEE9", "#F5F8FB"];
const GLASS = "#0A1626";
export const BELT = { x0: -900, x1: 560, z: 130, w: 92, top: -96, rail: -126 };
export const PUCK = { r: 31, h: 30 };
export const TUBE_H = 88;
export const AN = { x: 840, z: -30, W: 560, D: 520, H: 720 };
AN.left = AN.x - AN.W / 2;
if (Math.abs(AN.left - BELT.x1) > 1e-6) throw new Error("crack_lab: the belt must end at the analyser's side");
// the belt is authored on the floor (y = 0 the floor); the world map lifts it onto the rig's floor
const id3 = (q) => [q[0], FY + q[1], q[2]];
// ── the conveyor ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const zb0 = BELT.z - BELT.w / 2, zb1 = BELT.z + BELT.w / 2;
const LEGS = [-760, -440, -120, 200, 500];
export const Conveyor = ({ rig, belt = 0 }) => {
  const { x0, x1, top, rail } = BELT;
  const parts = [
    // the back side rail (an aluminium extrusion), the belt, its return roller housing, the legs and their feet
    part(boxAB([x0, top + 40, zb0 - 14], [x1, rail, zb0]), TH_ALU, { key: "rb", bias: -40 }),
    part(boxAB([x0, top + 6, zb0], [x1, top, zb1]), PL_RUBBER, { key: "belt", bias: -20 }),
    part(boxAB([x0, top + 40, zb0], [x1, top + 6, zb1]), PL_BODY, { key: "bed", bias: -30 }),
    ...LEGS.flatMap((x, i) => [
      part(boxAB([x - 10, 0 - 10, zb0 - 4], [x + 10, top + 40, zb0 + 12]), PL_STEEL, { key: `lb${i}`, bias: -60 }),
      part(boxAB([x - 10, 0 - 10, zb1 - 12], [x + 10, top + 40, zb1 + 4]), PL_STEEL, { key: `lf${i}` }),
      part(boxAB([x - 9, top + 34, zb0], [x + 9, top + 46, zb1]), PL_STEEL, { key: `lx${i}`, bias: -50 }),
      part(boxAB([x - 18, 0, zb1 - 20], [x + 18, -10, zb1 + 12], 3), PL_RUBBER, { key: `ff${i}` }),
      part(boxAB([x - 18, 0, zb0 - 12], [x + 18, -10, zb0 + 20], 3), PL_RUBBER, { key: `fb${i}`, bias: -60 })
    ])
  ];
  const map = id3;
  // the belt's seams (cleats) ride with it; the extrusions' T-slots run along the rails
  const seams = [];
  const S = 46;
  for (let x = x0 + ((belt % S) + S) % S; x < x1 - 2; x += S) seams.push(path3(map, rig, [[x, top - 0.4, zb0 + 2], [x, top - 0.4, zb1 - 2]], false));
  const slot = (z, y) => path3(map, rig, [[x0, y, z], [x1, y, z]], false);
  return jsxs("g", { children: [
    jsx(PaintParts, { parts, map, rig, id: "ckC" }),
    jsx("path", { d: seams.join(" "), stroke: "#000000", strokeOpacity: 0.45, strokeWidth: 1.4, fill: "none" }),
    jsx("path", { d: slot(zb0 - 14.3, rail + 9), stroke: "#0A121C", strokeOpacity: 0.55, strokeWidth: 2.2, fill: "none" })
  ] });
};
// the front rail: in front of the pucks' feet
export const ConveyorFront = ({ rig }) => {
  const { x0, x1, top, rail } = BELT;
  const parts = [part(boxAB([x0, top + 40, zb1], [x1, rail, zb1 + 14], 2), TH_ALU, { key: "rf" })];
  const y1 = rail + 8, y2 = rail + 24;
  return jsxs("g", { children: [
    jsx(PaintParts, { parts, map: id3, rig, id: "ckF" }),
    // the extrusion's two T-slots and its bolted joints
    jsx("path", { d: `${path3(id3, rig, [[x0, y1, zb1 + 14.3], [x1, y1, zb1 + 14.3]], false)} ${path3(id3, rig, [[x0, y2, zb1 + 14.3], [x1, y2, zb1 + 14.3]], false)}`, stroke: "#0A121C", strokeOpacity: 0.6, strokeWidth: 2.4, fill: "none" }),
    jsx("path", { d: `${path3(id3, rig, [[x0, y1 - 2, zb1 + 14.4], [x1, y1 - 2, zb1 + 14.4]], false)} ${path3(id3, rig, [[x0, y2 - 2, zb1 + 14.4], [x1, y2 - 2, zb1 + 14.4]], false)}`, stroke: "#FFFFFF", strokeOpacity: 0.22, strokeWidth: 0.9, fill: "none" }),
    LEGS.map((x, i) => {
      const c = mapScr(id3, rig, [x, top + 20, zb1 + 14.5]);
      return jsxs("g", { children: [
        jsx("circle", { cx: f2(c[0]), cy: f2(c[1]), r: 4.2, fill: "#0A121C", opacity: 0.6 }),
        jsx("circle", { cx: f2(c[0] - 0.8), cy: f2(c[1] - 0.8), r: 2.6, fill: rampAt(PL_STEEL, 0.75) })
      ] }, i);
    })
  ] });
};
// ── a carrier puck (a turned blue polymer puck with a steel collar; the tube stands in its bore) ─────────────────────────────────
const ellipse = (rig, c, r, n = 36) => ring3(c, [1, 0, 0], [0, 0, 1], r, n).map((q) => worldScr(rig, id3(q)));
const frontHalf = (rig, ring) => {
  // the half of a projected horizontal ring nearer the lens (larger y), from its leftmost to its rightmost point
  let l = 0, r = 0;
  ring.forEach((p, i) => {
    if (p[0] < ring[l][0]) l = i;
    if (p[0] > ring[r][0]) r = i;
  });
  const n = ring.length, a = [], b = [];
  for (let i = l; i !== r; i = (i + 1) % n) a.push(ring[i]);
  a.push(ring[r]);
  for (let i = r; i !== l; i = (i + 1) % n) b.push(ring[i]);
  b.push(ring[l]);
  const my = (q) => q.reduce((s, p) => s + p[1], 0) / q.length;
  return my(a) > my(b) ? a : [...b].reverse();
};
const pd = (pts, close = true) => `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}${close ? "Z" : ""}`;
export const Puck = ({ rig, x, id }) => {
  const y0 = BELT.top, y1 = BELT.top - PUCK.h, c0 = [x, y0, BELT.z], c1 = [x, y1, BELT.z];
  const bot = ellipse(rig, c0, PUCK.r), top = ellipse(rig, c1, PUCK.r), col = ellipse(rig, [x, y1 + 9, BELT.z], PUCK.r + 0.6);
  const fb = frontHalf(rig, bot), ft = frontHalf(rig, top), fc = frontHalf(rig, col);
  const side = pd([...fb, ...[...ft].reverse()]);
  const xs = fb.map((p) => p[0]), xa = Math.min(...xs), xb = Math.max(...xs);
  const bore = ellipse(rig, [x, y1 - 0.3, BELT.z], 16);
  return jsxs("g", { children: [
    jsx("defs", { children: jsxs("linearGradient", { id: `${id}S`, gradientUnits: "userSpaceOnUse", x1: f2(xa), y1: "0", x2: f2(xb), y2: "0", children: [
      jsx("stop", { offset: "0", stopColor: rampAt(TK_BAND, 0.78) }),
      jsx("stop", { offset: "0.3", stopColor: rampAt(TK_BAND, 0.62) }),
      jsx("stop", { offset: "0.75", stopColor: rampAt(TK_BAND, 0.3) }),
      jsx("stop", { offset: "1", stopColor: rampAt(TK_BAND, 0.18) })
    ] }) }),
    jsx("path", { d: pd(bot.map((p) => [p[0] + 3, p[1] + 3])), fill: "#000000", opacity: 0.35 }),
    jsx("path", { d: side, fill: `url(#${id}S)` }),
    jsx("path", { d: pd(fc, false), stroke: rampAt(PL_STEEL, 0.85), strokeWidth: 3, fill: "none", opacity: 0.9 }),
    jsx("path", { d: pd(fc, false), stroke: "#0A121C", strokeWidth: 1, fill: "none", opacity: 0.5, transform: "translate(0 2)" }),
    jsx("path", { d: pd(top), fill: rampAt(TK_BAND, 0.66) }),
    jsx("path", { d: pd(top), fill: "none", stroke: rampAt(TK_BAND, 0.9), strokeWidth: 1.2, opacity: 0.6 }),
    jsx("path", { d: pd(bore), fill: "#06101C", opacity: 0.85 })
  ] });
};
// the tube in a puck: its foot on the puck's top, sized from the rig (th_tube is 100 units tall; ours TUBE_H world units)
export const tubeAt = (rig, x) => {
  const q = id3([x, BELT.top - PUCK.h + 2, BELT.z]), p = worldScr(rig, q), v = worldView(rig, q);
  const u = TUBE_H / 100, k = rig.persp / Math.max(1, rig.persp - v[2]);
  return { x: p[0], y: p[1], scale: u * k, pitch: rig.pitch, yaw: rig.yaw, persp: rig.persp / u };
};
// ── the analyser ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//   LOCAL frame: origin on the floor at the analyser's footprint centre; x right, y down, z toward the lens.
const W2 = AN.W / 2, D2 = AN.D / 2, H = AN.H;
const DECK = -Math.round(0.58 * H), HOOD = -Math.round(0.98 * H);
const PORT = { z0: BELT.z - AN.z - 50, z1: BELT.z - AN.z + 50, y0: BELT.top + 30, y1: -232 };
const anParts = () => [
  part(boxAB([-W2 + 12, 0, -D2 + 12], [W2 - 12, -44, D2 - 14], 4), PL_BODY, { key: "kick", bias: -80 }),
  part(boxAB([-W2, -44, -D2], [W2, DECK, D2], 9), PANEL, { key: "cab" }),
  part(boxAB([-W2 - 6, DECK, -D2 - 6], [W2 + 6, DECK - 22, D2 + 8], 5), PL_BODY, { key: "deck" }),
  part(boxAB([-W2, DECK - 22, -D2], [W2, HOOD, D2 - 40], 9), PANEL, { key: "hood" }),
  part(boxAB([-W2 - 6, HOOD, -D2 - 6], [W2 + 6, HOOD - 22, D2 - 34], 5), PL_BODY, { key: "cap" })
];
// a face decal helper: a polygon on a plane of the box, local points
const Face = ({ rig, map, pts, fill, op = 1, stroke, sw = 1, sop = 1 }) => jsx("path", { d: path3(map, rig, pts), fill: fill ?? "none", opacity: op, stroke, strokeWidth: stroke ? sw : void 0, strokeOpacity: stroke ? sop : void 0 });
const rectX = (x0, x1, y0, y1, z) => [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]];
const rectZ = (z0, z1, y0, y1, x) => [[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]];
export const Analyser = ({ id, rig, rot = 0, beacon = 0, rows = 0, rowsMax = 9 }) => {
  const P = xfTrans([AN.x, FY, AN.z]);
  const map = (q) => xfApply(P, q);
  const zf = D2 + 0.4, zh = D2 - 40 + 0.4, xl = -W2 - 0.4;
  // the hood's front: the touchscreen (left) and the window onto the work deck (right)
  const SCR = { x0: -W2 + 34, x1: -40, y0: DECK - 60, y1: HOOD + 44 };
  const WIN = { x0: -10, x1: W2 - 30, y0: DECK - 46, y1: HOOD + 30 };
  const winPts = rectX(WIN.x0, WIN.x1, WIN.y0, WIN.y1, zh);
  // inside the window: the reagent carousel (a turntable of bottle caps) and the pipetting gantry with its probe
  const CAR = { c: [150, DECK - 24, -30], r: 150 };
  const caps = Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * 2 * Math.PI + rot * Math.PI / 180;
    const c = [CAR.c[0] + CAR.r * 0.8 * Math.cos(a), CAR.c[1] - 26, CAR.c[2] + CAR.r * 0.8 * Math.sin(a)];
    return { pts: ring3(c, [1, 0, 0], [0, 0, 1], 13, 14), top: ring3([c[0], c[1] - 18, c[2]], [1, 0, 0], [0, 0, 1], 11, 14), depth: worldView(rig, map(c))[2], k: i };
  }).sort((a, b) => a.depth - b.depth);
  const probeX = 60 + 120 * Math.sin(rot * Math.PI / 90);
  // the screen's test queue: rows of bars (no readable text), the newest lit
  const rowH = (SCR.y0 - SCR.y1 - 70) / rowsMax;
  const nRows = Math.min(rowsMax, rows);
  const lamp = (k) => rampAt(["#0C1A2C", "#1D3A60", "#3F78BD", "#9CC7F4", "#EEF6FF"], 0.25 + 0.75 * k);
  // the louvres and seams on the left face; the port on it, with its brush curtain
  const louv = Array.from({ length: 8 }, (_, i) => rectZ(-D2 + 60, -D2 + 230, DECK - 90 - i * 22, DECK - 98 - i * 22, xl));
  const bristles = Array.from({ length: 16 }, (_, i) => {
    const z = PORT.z0 + 6 + (PORT.z1 - PORT.z0 - 12) * i / 15;
    return [[xl - 0.3, PORT.y1 + 4, z], [xl - 0.3, PORT.y0 - 2, z]];
  });
  const screws = [[-W2 + 20, -64], [W2 - 20, -64], [-W2 + 20, DECK + 20], [W2 - 20, DECK + 20]];
  const beam = clamp01(beacon);
  return jsxs("g", { children: [
    jsx(PaintParts, { parts: anParts(), map, rig, id: `${id}p` }),
    // ── the lower cabinet's front: three doors, a drawer row, a vent grille, the doors' recessed pulls
    [-W2 + 14, -W2 / 3 + 4, W2 / 3 - 4].map((x0, i) => jsx(Face, { rig, map, pts: rectX(x0 + 6, x0 + (W2 * 2 - 28) / 3 - 2, -64, DECK + 92, zf), fill: "#FFFFFF", op: 0.05, stroke: "#0B1626", sw: 1.6, sop: 0.55 }, `d${i}`)),
    [-W2 + 14, -W2 / 3 + 4, W2 / 3 - 4].map((x0, i) => {
      const cx = x0 + (W2 * 2 - 28) / 6 + 2;
      return jsxs("g", { children: [
        jsx(Face, { rig, map, pts: rectX(cx - 44, cx + 44, DECK + 140, DECK + 156, zf), fill: "#0B1626", op: 0.75 }),
        jsx(Face, { rig, map, pts: rectX(cx - 44, cx + 44, DECK + 156, DECK + 158, zf), fill: "#FFFFFF", op: 0.4 })
      ] }, `h${i}`);
    }),
    jsx(Face, { rig, map, pts: rectX(-W2 + 20, W2 - 20, DECK + 84, DECK + 86, zf), fill: "#0B1626", op: 0.6 }),
    // the doors' raised inner panels (a light top-left lip, a dark lower-right shadow line)
    [-W2 + 14, -W2 / 3 + 4, W2 / 3 - 4].map((x0, i) => {
      const x1 = x0 + (W2 * 2 - 28) / 3 - 2;
      return jsxs("g", { children: [
        jsx(Face, { rig, map, pts: rectX(x0 + 26, x1 - 20, -100, DECK + 190, zf + 0.2), fill: "#FFFFFF", op: 0.06, stroke: "#FFFFFF", sw: 1.2, sop: 0.35 }),
        jsx("path", { d: path3(map, rig, [[x0 + 26, -100, zf + 0.3], [x1 - 20, -100, zf + 0.3], [x1 - 20, DECK + 190, zf + 0.3]], false), stroke: "#0B1626", strokeWidth: 1.6, fill: "none", opacity: 0.5 })
      ] }, `in${i}`);
    }),
    // the status LEDs along the deck's front lip
    Array.from({ length: 6 }, (_, i) => {
      const c = mapScr(map, rig, [-W2 + 40 + i * 26, DECK - 11, D2 + 8.6]);
      const on = i === 0 ? 1 : i < 3 ? 0.5 + 0.5 * beam : 0.25;
      return jsx("circle", { cx: f2(c[0]), cy: f2(c[1]), r: 3.6, fill: lamp(on) }, `led${i}`);
    }),
    [0, 1].map((i) => jsx(Face, { rig, map, pts: rectX(-W2 + 20 + i * (W2 - 14), -6 + i * (W2 - 14), DECK + 20, DECK + 78, zf), fill: "none", stroke: "#0B1626", sw: 1.4, sop: 0.5 }, `dr${i}`)),
    [0, 1].map((i) => jsx(Face, { rig, map, pts: rectX(-W2 + 110 + i * (W2 - 14), -96 + i * (W2 - 14), DECK + 44, DECK + 52, zf), fill: "#0B1626", op: 0.7 }, `dh${i}`)),
    Array.from({ length: 5 }, (_, i) => jsx(Face, { rig, map, pts: rectX(-W2 + 60, W2 - 60, -84 - i * 12, -89 - i * 12, zf), fill: "#0B1626", op: 0.5 }, `v${i}`)),
    screws.map(([x, y], i) => {
      const c = mapScr(map, rig, [x, y, zf]);
      return jsx("circle", { cx: f2(c[0]), cy: f2(c[1]), r: 3.4, fill: rampAt(PL_STEEL, 0.7), stroke: "#0B1626", strokeOpacity: 0.6, strokeWidth: 1 }, `s${i}`);
    }),
    // ── the left face: panel seams, the louvres, the port (frame, dark mouth, brush curtain), its indicator lamp
    jsx(Face, { rig, map, pts: rectZ(-D2 + 16, D2 - 16, -64, DECK + 20, xl), stroke: "#0B1626", sw: 1.4, sop: 0.45 }),
    louv.map((pts, i) => jsx(Face, { rig, map, pts, fill: "#0B1626", op: 0.55 }, `l${i}`)),
    jsx(Face, { rig, map, pts: rectZ(PORT.z0 - 14, PORT.z1 + 14, PORT.y0 + 12, PORT.y1 - 14, xl - 0.2), fill: rampAt(PL_BODY, 0.55) }),
    jsx(Face, { rig, map, pts: rectZ(PORT.z0 - 14, PORT.z1 + 14, PORT.y1 - 14, PORT.y1 - 12, xl - 0.3), fill: "#FFFFFF", op: 0.25 }),
    jsx(Face, { rig, map, pts: rectZ(PORT.z0, PORT.z1, PORT.y0, PORT.y1, xl - 0.3), fill: "#03080F" }),
    jsx("path", { d: bristles.map((b) => path3(map, rig, b, false)).join(" "), stroke: rampAt(PL_BODY, 0.5), strokeWidth: 3.2, fill: "none", opacity: 0.9 }),
    jsx("path", { d: bristles.map((b) => path3(map, rig, b, false)).join(" "), stroke: "#FFFFFF", strokeWidth: 0.7, fill: "none", opacity: 0.18, transform: "translate(-1 0)" }),
    (() => {
      const c = mapScr(map, rig, [xl - 0.4, PORT.y1 - 34, (PORT.z0 + PORT.z1) / 2]);
      return jsxs("g", { children: [
        jsx("circle", { cx: f2(c[0]), cy: f2(c[1]), r: 6, fill: lamp(beam), opacity: 0.95 }),
        beam > 0.05 && jsx("circle", { cx: f2(c[0]), cy: f2(c[1]), r: 16, fill: "#9CC7F4", opacity: 0.35 * beam, style: { filter: "blur(4px)" } })
      ] });
    })(),
    // ── the hood's front: the window (dark tinted glass) with the deck behind it, the touchscreen
    jsx("defs", { children: jsx("clipPath", { id: `${id}W`, children: jsx("path", { d: path3(map, rig, winPts) }) }) }),
    jsx(Face, { rig, map, pts: winPts, fill: GLASS }),
    jsxs("g", { clipPath: `url(#${id}W)`, children: [
      // the deck inside, lit from above
      jsx(Face, { rig, map, pts: [[WIN.x0, DECK - 22.5, -D2 + 30], [WIN.x1, DECK - 22.5, -D2 + 30], [WIN.x1, DECK - 22.5, zh], [WIN.x0, DECK - 22.5, zh]], fill: "#1B3352" }),
      jsx(Face, { rig, map, pts: ring3([CAR.c[0], CAR.c[1] - 2, CAR.c[2]], [1, 0, 0], [0, 0, 1], CAR.r, 40), fill: "#24466E" }),
      jsx(Face, { rig, map, pts: ring3([CAR.c[0], CAR.c[1] - 3, CAR.c[2]], [1, 0, 0], [0, 0, 1], CAR.r * 0.55, 32), fill: "#16304F" }),
      caps.map((c) => jsxs("g", { children: [
        jsx(Face, { rig, map, pts: c.pts, fill: "#5F8FC6" }),
        jsx(Face, { rig, map, pts: c.top, fill: c.k % 5 === 0 ? "#D9E6F4" : "#9FBDE0" })
      ] }, c.k)),
      // the gantry rail across the hood and its probe carriage
      jsx(Face, { rig, map, pts: [[WIN.x0, HOOD + 70, -D2 + 80], [WIN.x1, HOOD + 70, -D2 + 80], [WIN.x1, HOOD + 90, -D2 + 80], [WIN.x0, HOOD + 90, -D2 + 80]], fill: "#7F9AB8" }),
      jsx(Face, { rig, map, pts: rectX(probeX - 24, probeX + 24, HOOD + 60, HOOD + 128, -D2 + 84), fill: "#C7D6E6" }),
      jsx("path", { d: path3(map, rig, [[probeX, HOOD + 128, -D2 + 86], [probeX, DECK - 120, -D2 + 86]], false), stroke: "#DCE7F2", strokeWidth: 2.4 }),
      // the glass: a cool reflection band from the key light
      jsx(Face, { rig, map, pts: [[WIN.x0 + 20, WIN.y1, zh + 0.2], [WIN.x0 + 120, WIN.y1, zh + 0.2], [WIN.x0 + 40, WIN.y0, zh + 0.2], [WIN.x0 - 60, WIN.y0, zh + 0.2]], fill: "#FFFFFF", op: 0.1 }),
      jsx(Face, { rig, map, pts: [[WIN.x0 + 150, WIN.y1, zh + 0.2], [WIN.x0 + 176, WIN.y1, zh + 0.2], [WIN.x0 + 96, WIN.y0, zh + 0.2], [WIN.x0 + 70, WIN.y0, zh + 0.2]], fill: "#FFFFFF", op: 0.08 })
    ] }),
    jsx(Face, { rig, map, pts: winPts, stroke: rampAt(PL_BODY, 0.4), sw: 5, sop: 1 }),
    // the touchscreen: bezel, glass, a header bar and the test queue (abstract bars), the newest row lit
    jsx(Face, { rig, map, pts: rectX(SCR.x0 - 10, SCR.x1 + 10, SCR.y0 + 10, SCR.y1 - 10, zh + 0.2), fill: rampAt(PL_BODY, 0.3) }),
    jsx(Face, { rig, map, pts: rectX(SCR.x0, SCR.x1, SCR.y0, SCR.y1, zh + 0.3), fill: "#0B1D33" }),
    jsx(Face, { rig, map, pts: rectX(SCR.x0 + 10, SCR.x1 - 10, SCR.y1 + 12, SCR.y1 + 34, zh + 0.4), fill: "#3F78BD", op: 0.85 }),
    Array.from({ length: nRows + 1 }, (_, i) => {
      if (i >= rowsMax) return null;
      const on = clamp01(rows - i);
      if (on <= 3e-3) return null;
      const y = SCR.y1 + 48 + i * rowH;
      const newest = i === Math.floor(rows - 1e-6) ? 1 : 0.45;
      return jsxs("g", { opacity: on, children: [
        jsx(Face, { rig, map, pts: rectX(SCR.x0 + 14, SCR.x0 + 30, y, y + rowH * 0.55, zh + 0.4), fill: lamp(newest) }),
        jsx(Face, { rig, map, pts: rectX(SCR.x0 + 40, SCR.x0 + 40 + (SCR.x1 - SCR.x0 - 70) * (0.5 + 0.4 * ((i * 37) % 10) / 10), y + 2, y + rowH * 0.5, zh + 0.4), fill: "#6E9ED6", op: 0.55 + 0.4 * newest })
      ] }, `r${i}`);
    }),
    // the status light bar along the cap's front edge: it pulses with each arrival
    (() => {
      const y0 = HOOD - 6, y1 = HOOD - 15, zc = D2 - 34 + 0.5;
      const bar = path3(map, rig, rectX(-W2 + 60, W2 - 60, y0, y1, zc));
      return jsxs("g", { children: [
        jsx("path", { d: bar, fill: lamp(0.35 + 0.65 * beam) }),
        beam > 0.05 && jsx("path", { d: bar, fill: "#9CC7F4", opacity: 0.45 * beam, style: { filter: "blur(6px)" } })
      ] });
    })()
  ] });
};
export const anPoint = (q) => [AN.x + q[0], FY + q[1], AN.z + q[2]];
void mixHex;
void theme;
