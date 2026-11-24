// @ts-nocheck
// ★ V37 "Theranos" — builder F, place `rule`: THE JOURNAL SHELF.
//   A library bookcase section (steel, graphite finish): a plinth with a toe and an engraved plate, two side panels, a back panel,
//   a shelf board with a steel front rail, a top board with a moulded cornice. On the shelf stands a ROW OF BOUND JOURNAL VOLUMES —
//   real books: leather covers of varied heights and thickness, each spine with four raised bands, tooled (silvered) double lines,
//   a dark title label carrying JAMA (ruleJournal), the page block showing on top between the boards — and a steel L-shaped
//   BOOKEND holding the row. ONE SLOT in the row is EMPTY: the neighbours' sides and the dark back panel show through it, and the
//   shelf's rail carries a steel card holder under it whose card reads THERANOS (ruleGap). The slot's back lights from within as
//   the line ends (the flare's source).
//   Case-local frame: x right, y DOWN (floor 0), z toward the lens.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { prism, rampAt } from "./solid_engine";
import { XPlane, mapPath, paintXf, rrectPts, worldScr, wound, xfApply, xfTrans } from "./tk_rig";
import { PL_BODY, PL_PLATE, PL_STEEL } from "./counter_mat";
import { HS_DOOR, HS_TRIM, HS_WALL } from "./honest_mat_b";
import { Engraved } from "./counter_drums";
import { label } from "./kit";
import { seeded } from "./common";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
export const CS = { W: 1000, D: 320, side: 34, plinth: 62, board: 34, clear: 420, top: 34, cornice: 16, back: 12 };
const IN_L = -CS.W / 2 + CS.side, IN_R = CS.W / 2 - CS.side;
const V_SHELF = -CS.plinth - CS.board;                 // the shelf's top (books stand here)
const V_TOPB = V_SHELF - CS.clear;                     // the top board's underside
const V_TOP = V_TOPB - CS.top;                         // the case's top
const ZF = CS.D / 2, ZB = -CS.D / 2;
const BOOK_D = 210, BOOK_ZF = ZF - 22;                 // the books stand 22 back from the shelf's front
// ── the row (left → right): thickness, height, leather, a seed for its tooling; ONE gap; the bookend after the last ──────
const LEATHER = [HS_DOOR, HS_TRIM, PL_BODY, HS_WALL];
export const GAP_W = 66;
const GAP_AT = 8;                                      // the gap comes after this many books
const ROW = (() => {
  const rnd = seeded(2015);
  const out = [];
  let x = IN_L + 8;
  for (let i = 0; i < 13; i++) {
    if (i === GAP_AT) {
      out.push({ gap: true, x0: x, x1: x + GAP_W });
      x += GAP_W;
    }
    const t = 44 + Math.round(22 * rnd()), h = 318 + Math.round(64 * rnd()), lea = LEATHER[i % 2 === 0 ? (i / 2) % 2 === 0 ? 0 : 2 : (i % 4 === 1 ? 1 : 3)];
    out.push({ x0: x, x1: x + t, h, lea, seed: i, lean: 0 });
    x += t + 1.5;
  }
  out.push({ bookend: true, x0: x + 2, x1: x + 2 + 10 });
  if (x + 14 > IN_R - 20) throw new Error(`rule_shelf: the row (${(x - IN_L).toFixed(0)}) does not fit the shelf (${IN_R - IN_L})`);
  return out;
})();
const gapOf = ROW.find((b) => b.gap);
const nbr = [ROW[ROW.indexOf(gapOf) - 1], ROW[ROW.indexOf(gapOf) + 1]];
// the gap stands where a volume as tall as its neighbours would: its centre, mid-height of the neighbours
export const GAP_C = [(gapOf.x0 + gapOf.x1) / 2, V_SHELF - Math.min(nbr[0].h, nbr[1].h) / 2, BOOK_ZF - BOOK_D / 2];
export const GAP_FRONT = [(gapOf.x0 + gapOf.x1) / 2, V_SHELF - Math.min(nbr[0].h, nbr[1].h) / 2, BOOK_ZF];
export const GAP_BACK = [(gapOf.x0 + gapOf.x1) / 2, V_SHELF - Math.min(nbr[0].h, nbr[1].h) / 2, ZB + CS.back];
export const SHELF_V = V_SHELF, CASE_TOP_V = V_TOP - CS.cornice;
const PLINTH_ZF = (CS.D - 20) / 2 - 6, PLATE_U = -180, PLATE_V = -12 - (CS.plinth - 12) / 2;
let memo = null;
const pz = (poly, d, bev, w0) => wound(prism(poly, d, bev, 0, 1, () => false, [0, 0, w0]));
const parts = () => {
  if (memo) return memo;
  const toe = pz(rrectPts(CS.W + 10, 12, 3, 2, 0, -6), CS.D + 10, 3, 0);
  const plinth = pz(rrectPts(CS.W - 16, CS.plinth - 12, 4, 2, 0, -12 - (CS.plinth - 12) / 2), CS.D - 20, 5, -6);
  const shelf = pz(rrectPts(CS.W, CS.board, 4, 2, 0, -CS.plinth - CS.board / 2), CS.D, 5, 0);
  const sides = [-1, 1].map((s) => pz(rrectPts(CS.side, -V_TOPB + CS.top - CS.plinth, 4, 2, s * (CS.W / 2 - CS.side / 2), (V_TOP - CS.plinth) / 2), CS.D, 6, 0));
  const back = pz(rrectPts(CS.W - 2 * CS.side, CS.clear + 4, 2, 2, 0, V_SHELF - CS.clear / 2), CS.back, 1, ZB + CS.back / 2);
  const top = pz(rrectPts(CS.W + 8, CS.top, 4, 2, 0, V_TOPB - CS.top / 2), CS.D + 8, 5, 0);
  const cornice = pz(rrectPts(CS.W + 36, CS.cornice, 5, 2, 0, V_TOP - CS.cornice / 2), CS.D + 26, 6, 0);
  const rail = pz(rrectPts(CS.W - 2 * CS.side - 20, 22, 3, 2, 0, -CS.plinth - CS.board / 2), 6, 2, ZF + 3);
  const plate = pz(rrectPts(290, 42, 5, 3, PLATE_U, PLATE_V), 5, 2, PLINTH_ZF + 2.5);
  memo = { toe, plinth, shelf, sides, back, top, cornice, rail, plate };
  return memo;
};
const bookFaces = (b) => {
  const t = b.x1 - b.x0;
  const body = pz(rrectPts(t, b.h, 3.5, 2, (b.x0 + b.x1) / 2, V_SHELF - b.h / 2), BOOK_D, 3, BOOK_ZF - BOOK_D / 2);
  return body;
};
const BOOKS = ROW.filter((b) => !b.gap && !b.bookend).map((b) => ({ ...b, faces: bookFaces(b) }));
const fillOf = (r, light, f) => rampAt(r, f.cap ? 0.62 * light + 0.06 : f.bev ? Math.min(1, 0.95 * light + 0.16) : 0.8 * light + 0.04);
const Paint = ({ faces, map, rig, ramp, spec = 0.5, dim = 0 }) => jsx(jsx_runtime.Fragment, { children: paintXf(faces, map, rig, spec).map((dw, k) => {
  const c = fillOf(ramp, dw.light * (1 - dim), dw.face);
  return jsx("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
}) });
const PAPER = "#D9D4C8";
/** one volume: its body, the page block on top, the spine's bands, tooling, title label (JAMA) */
const BookTitle = ({ b, rig, pose, title }) => {
  const t = b.x1 - b.x0, vT = V_SHELF - b.h, z = BOOK_ZF + 0.3, v0 = vT + 46;
  return jsx("div", { "data-probe-leaving": "a volume's spine print, cropped with its volume by the frame's edge when the camera isolates the gap", style: { position: "absolute", inset: 0 }, children: jsx(XPlane, { rig, x: pose, u: b.x0 + 4, v: v0 + 12, w: z + 0.2, width: t - 8, height: 24, probe: "a volume's title label", children: jsx("div", { style: { width: t - 8, textAlign: "center", ...label(Math.min(19, (t - 16) / 2.3), "#E4ECF5"), letterSpacing: 0.3, paddingTop: Math.max(0, 19 - Math.min(19, (t - 16) / 2.3)) / 2 }, children: title }) }) });
};
const Book = ({ b, map, rig, pose, P, title }) => {
  const t = b.x1 - b.x0, cx = (b.x0 + b.x1) / 2, vT = V_SHELF - b.h, z = BOOK_ZF + 0.3;
  const bands = [0.16, 0.36, 0.56, 0.76].map((k) => vT + 24 + k * (b.h - 48));
  const line = (v, w = 1.2, c = "#E6EDF5", o = 0.55) => jsx("path", { d: P([[b.x0 + 5, v, z], [b.x1 - 5, v, z]], false), stroke: c, strokeOpacity: o, strokeWidth: w, fill: "none" });
  const lab = { v0: vT + 46, v1: vT + 46 + 46 };
  const pages = P([[b.x0 + 4, vT - 0.4, BOOK_ZF - 4], [b.x1 - 4, vT - 0.4, BOOK_ZF - 4], [b.x1 - 4, vT - 0.4, BOOK_ZF - BOOK_D + 6], [b.x0 + 4, vT - 0.4, BOOK_ZF - BOOK_D + 6]]);
  const pageLines = [0.3, 0.55, 0.8].map((k) => P([[b.x0 + 4 + k * (t - 8), vT - 0.5, BOOK_ZF - 6], [b.x0 + 4 + k * (t - 8), vT - 0.5, BOOK_ZF - BOOK_D + 8]], false));
  return jsxs("g", { children: [
    jsx(Paint, { faces: b.faces, map, rig, ramp: b.lea, spec: 0.45 }),
    jsx("path", { d: pages, fill: PAPER }),
    pageLines.map((d, k) => jsx("path", { d, stroke: "#8C8678", strokeOpacity: 0.35, strokeWidth: 0.8, fill: "none" }, `pl${k}`)),
    // the raised bands: a lit ridge over a shadow line
    bands.map((v, k) => jsxs("g", { children: [
      jsx("path", { d: P([[b.x0 + 2, v - 3, z], [b.x1 - 2, v - 3, z], [b.x1 - 2, v + 3, z], [b.x0 + 2, v + 3, z]]), fill: rampAt(b.lea, 0.62) }),
      jsx("path", { d: P([[b.x0 + 2, v - 3, z + 0.1], [b.x1 - 2, v - 3, z + 0.1]], false), stroke: "#FFFFFF", strokeOpacity: 0.35, strokeWidth: 1, fill: "none" }),
      jsx("path", { d: P([[b.x0 + 2, v + 3.4, z], [b.x1 - 2, v + 3.4, z]], false), stroke: "#000000", strokeOpacity: 0.45, strokeWidth: 1.4, fill: "none" })
    ] }, `bd${k}`)),
    // tooling: double silvered lines either side of each band, and at the head and the tail
    bands.flatMap((v, k) => [jsx("g", { children: line(v - 9, 1) }, `ta${k}`), jsx("g", { children: line(v + 9, 1) }, `tb${k}`)]),
    jsx("g", { children: line(vT + 12, 1.4) }), jsx("g", { children: line(vT + 16, 0.9) }),
    jsx("g", { children: line(V_SHELF - 12, 1.4) }), jsx("g", { children: line(V_SHELF - 16, 0.9) }),
    // the title label
    jsx("path", { d: P([[b.x0 + 5, lab.v0, z], [b.x1 - 5, lab.v0, z], [b.x1 - 5, lab.v1, z], [b.x0 + 5, lab.v1, z]]), fill: "#0A1424", opacity: 0.92 }),
    jsx("path", { d: P([[b.x0 + 7, lab.v0 + 2, z], [b.x1 - 7, lab.v0 + 2, z], [b.x1 - 7, lab.v1 - 2, z], [b.x0 + 7, lab.v1 - 2, z]]), fill: "none", stroke: "#DCE6F1", strokeOpacity: 0.45, strokeWidth: 0.8 }),
    // a second, narrower label panel low on the spine (blank, ruled in silver), as bound volumes carry
    jsx("path", { d: P([[b.x0 + 6, bands[3] - 30, z], [b.x1 - 6, bands[3] - 30, z], [b.x1 - 6, bands[3] - 15, z], [b.x0 + 6, bands[3] - 15, z]]), fill: "#0A1424", opacity: 0.85 }),
    jsx("path", { d: P([[b.x0 + 8, bands[3] - 28.5, z], [b.x1 - 8, bands[3] - 28.5, z], [b.x1 - 8, bands[3] - 16.5, z], [b.x0 + 8, bands[3] - 16.5, z]]), fill: "none", stroke: "#DCE6F1", strokeOpacity: 0.4, strokeWidth: 0.7 }),
    // a small tooled ornament between the second and third bands
    jsx("path", { d: P([[cx, (bands[1] + bands[2]) / 2 - 7, z], [cx + 5, (bands[1] + bands[2]) / 2, z], [cx, (bands[1] + bands[2]) / 2 + 7, z], [cx - 5, (bands[1] + bands[2]) / 2, z]]), fill: "#DCE6F1", opacity: 0.5 })
  ] });
};
/** the steel L-bookend: a base plate under the last volume, an upright against it */
const Bookend = ({ b, map, rig }) => {
  const up = pz(rrectPts(b.x1 - b.x0, 250, 3, 2, (b.x0 + b.x1) / 2, V_SHELF - 125), 150, 3, BOOK_ZF - 90);
  const plate = pz(rrectPts(130, 5, 1.5, 2, b.x0 - 50, V_SHELF - 2.5), 150, 1.5, BOOK_ZF - 90);
  return jsxs("g", { children: [jsx(Paint, { faces: plate, map, rig, ramp: PL_STEEL, spec: 0.8 }), jsx(Paint, { faces: wound(up), map, rig, ramp: PL_STEEL, spec: 0.9 })] });
};
/** the case at `pose`; glow 0…1 lights the empty slot from within; holder: the THERANOS card's lift (0…1); date { text, on } */
export const JournalShelf = ({ id, rig, pose, glow = 0, holder = 0, date, gapText, journal }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const m = parts();
  const g = clamp01(glow);
  // the empty slot's back: the back panel's patch between the neighbours, and its light
  const slot = [[gapOf.x0, V_SHELF, ZB + CS.back + 0.4], [gapOf.x1, V_SHELF, ZB + CS.back + 0.4], [gapOf.x1, V_SHELF - Math.min(nbr[0].h, nbr[1].h), ZB + CS.back + 0.4], [gapOf.x0, V_SHELF - Math.min(nbr[0].h, nbr[1].h), ZB + CS.back + 0.4]];
  const gc = worldScr(rig, map(GAP_BACK)), gr = worldScr(rig, map([GAP_BACK[0], GAP_BACK[1] - 240, GAP_BACK[2]]));
  const R = Math.abs(gr[1] - gc[1]);
  // the shelf's floor in the slot, lit by it
  const slotFloor = P([[gapOf.x0, V_SHELF - 0.4, ZB + CS.back], [gapOf.x1, V_SHELF - 0.4, ZB + CS.back], [gapOf.x1, V_SHELF - 0.4, BOOK_ZF], [gapOf.x0, V_SHELF - 0.4, BOOK_ZF]]);
  // the card holder on the rail under the slot
  const hx = (gapOf.x0 + gapOf.x1) / 2, HW = 150, HH = 30, hv = -CS.plinth - CS.board / 2, hz = ZF + 6.5;
  const holderD = P(rrectPts(HW, HH, 3, 2, hx, hv).map(([x, y]) => [x, y, hz]));
  const holderIn = P(rrectPts(HW - 10, HH - 8, 2, 2, hx, hv + 1).map(([x, y]) => [x, y, hz + 0.3]));
  const shelfLip = P([[IN_L, V_SHELF + 0.6, ZF - 0.4], [IN_R, V_SHELF + 0.6, ZF - 0.4]], false);
  const ink = { groove: "#12161A", lip: "#E9EDF1", paint: "#EEF3F8" };
  const sideScrews = [-1, 1].flatMap((s) => [V_SHELF + 14, V_TOPB - 14].map((v) => [s * (CS.W / 2 - CS.side / 2), v]));
  return jsxs("div", { "data-probe-object": "the journal shelf: a steel bookcase, a row of bound JAMA volumes with one empty slot, a bookend, the THERANOS card holder", style: { position: "absolute", inset: 0 }, children: [
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsx("defs", { children: jsxs("radialGradient", { id: `${id}Gl`, gradientUnits: "userSpaceOnUse", cx: f2(gc[0]), cy: f2(gc[1]), r: f2(R), children: [
        jsx("stop", { offset: "0", stopColor: "#FFFFFF", stopOpacity: 0.95 }),
        jsx("stop", { offset: "0.25", stopColor: "#D7E6F8", stopOpacity: 0.75 }),
        jsx("stop", { offset: "0.6", stopColor: "#6F9AD0", stopOpacity: 0.3 }),
        jsx("stop", { offset: "1", stopColor: "#2B5C9A", stopOpacity: 0 })
      ] }) }),
      jsx("path", { d: P(Array.from({ length: 32 }, (_, i) => [20 + 560 * Math.cos(i / 32 * 2 * Math.PI), -0.5, -40 + 200 * Math.sin(i / 32 * 2 * Math.PI)])), fill: "#000000", opacity: 0.3, stroke: "#000000", strokeOpacity: 0.12, strokeWidth: 20, strokeLinejoin: "round" }),
      jsx(Paint, { faces: m.toe, map, rig, ramp: PL_BODY, spec: 0.3, dim: 0.15 }),
      jsx(Paint, { faces: m.back, map, rig, ramp: PL_BODY, spec: 0.2, dim: 0.35 }),
      // the slot's back, lit from within (on the back panel, between the neighbours)
      jsx("path", { d: P(slot), fill: "#05080C", opacity: 0.6 }),
      g > 3e-3 && jsx("path", { d: P(slot), fill: "#9DBDE6", opacity: 0.35 * g }),
      g > 3e-3 && jsx("path", { d: P(slot), fill: `url(#${id}Gl)`, opacity: Math.min(1, 1.2 * g) }),
      jsx(Paint, { faces: m.sides[1], map, rig, ramp: PL_PLATE, spec: 0.55 }),
      jsx(Paint, { faces: m.plinth, map, rig, ramp: PL_PLATE, spec: 0.5 }),
      jsx(Paint, { faces: m.plate, map, rig, ramp: PL_STEEL, spec: 0.7, dim: 0.05 }),
      jsx(Paint, { faces: m.shelf, map, rig, ramp: PL_PLATE, spec: 0.55 }),
      g > 3e-3 && jsx("path", { d: slotFloor, fill: "#CFE0F4", opacity: 0.35 * g }),
    ] }),
    // the books, far (right) to near (left): each covers its right neighbour's side; the bookend first (it stands at the right)
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      ROW.filter((b) => b.bookend).map((b, k) => jsx(Bookend, { b, map, rig }, `be${k}`))
    ] }),
    ...[...BOOKS].reverse().map((b) => jsxs("div", { style: { position: "absolute", inset: 0 }, children: [
      jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(Book, { b, map, rig, pose, P, title: journal }) }),
      jsx(BookTitle, { b, rig, pose, title: journal })
    ] }, `bk${b.seed}`)),
    // the light spilling out of the slot onto its neighbours' edges
    g > 3e-3 && jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx("path", { d: P([[gapOf.x0 - 10, V_SHELF, BOOK_ZF + 1], [gapOf.x1 + 10, V_SHELF, BOOK_ZF + 1], [gapOf.x1 + 10, V_SHELF - Math.min(nbr[0].h, nbr[1].h), BOOK_ZF + 1], [gapOf.x0 - 10, V_SHELF - Math.min(nbr[0].h, nbr[1].h), BOOK_ZF + 1]]), fill: `url(#${id}Gl)`, opacity: 0.55 * g }) }),
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsx(Paint, { faces: m.sides[0], map, rig, ramp: PL_PLATE, spec: 0.55 }),
      jsx(Paint, { faces: m.top, map, rig, ramp: PL_PLATE, spec: 0.55 }),
      jsx(Paint, { faces: m.cornice, map, rig, ramp: PL_STEEL, spec: 0.7, dim: 0.1 }),
      jsx(Paint, { faces: m.rail, map, rig, ramp: PL_STEEL, spec: 0.85 }),
      jsx("path", { d: shelfLip, stroke: "#FFFFFF", strokeOpacity: 0.3, strokeWidth: 1.2, fill: "none" }),
      sideScrews.map(([x, v], k) => jsx("path", { d: P(Array.from({ length: 14 }, (_, i) => [x + 5 * Math.cos(i / 14 * 2 * Math.PI), v + 5 * Math.sin(i / 14 * 2 * Math.PI), ZF + 0.4])), fill: rampAt(PL_STEEL, 0.7), stroke: "#000000", strokeOpacity: 0.5, strokeWidth: 1 }, `ss${k}`)),
      jsx("path", { d: holderD, fill: rampAt(PL_STEEL, 0.78), stroke: "#000000", strokeOpacity: 0.4, strokeWidth: 1 }),
      jsx("path", { d: holderIn, fill: mixHex("#C9CFD6", "#F4F7FB", clamp01(holder)) })
    ] }),
    jsx(XPlane, { rig, x: pose, u: hx - (HW - 14) / 2, v: hv - 11, w: hz + 0.6, width: HW - 14, height: 24, probe: "the empty slot's card holder", children: jsx("div", { style: { width: HW - 14, textAlign: "center", ...label(21, "#0B1C33"), letterSpacing: 1 }, children: gapText }) }),
    date && jsx(Engraved, { rig, pose, zF: PLINTH_ZF + 5, uC: PLATE_U, vC: PLATE_V, width: 250, size: 32, text: date.text, on: date.on, ink, probe: "the plinth's plate", bare: 0.22 })
  ] });
};
export const shelfCorners = (pose) => {
  const out = [];
  for (const x of [-CS.W / 2, CS.W / 2]) for (const z of [ZB, ZF]) for (const v of [CASE_TOP_V, 0]) out.push(xfApply(pose, [x, v, z]));
  return out;
};
