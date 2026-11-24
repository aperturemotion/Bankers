// @ts-nocheck
// ★ V37 "Theranos" — place BACKERS (builder M). "Two former secretaries of state sat on its board. Walgreens offered its tests in
//   about forty stores."  Neutral: names on objects only, no people, no portraits.
//   Framing 1 — THE BOARDROOM (backers_room.tsx): a long polished boardroom table on two pedestals, a row of EMPTY high-backed
//     leather executive chairs pushed in along its far side, a tooled blotter at each place. On "former" the third chair's light
//     comes up and its brass nameplate's engraving fills: SHULTZ; on "secretaries" the fourth: KISSINGER (backers_plate.tsx);
//     FORMER SECRETARIES OF STATE lands over the two lit chairs on "state".
//   On "Walgreens" the ACTION CAMERA TRAVELS across the floor to Framing 2 — THE STORES (backers_stores.tsx, the film's ONE grid):
//     forty pharmacy storefronts on a five-step terrace, WALGREENS over it as the camera arrives; on "offered" the stores light one
//     after another in a quick narrow wave, landing ~40 STORES on "forty" and ARIZONA on "stores".
//   Enters panFromR, exits panR (the composition's slides). Objects per framing: table · chairs · nameplates / the terrace.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn, figure, label } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { worldScr, xfMul, xfPose, xfTrans } from "./tk_rig";
import { TK_FLOOR_Y } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { BR_INK, BR_LABEL } from "./backers_kit";
import { CHAIR_N, CHAIR_Z, Chair, ChairReflection, TB_TOP, Table, chairCorners, chairTop, chairX, placeZ, tableCorners, viewDepth } from "./backers_room";
import { NamePlate, plateCorners } from "./backers_plate";
import { Terrace, storeOrder, terraceCorners } from "./backers_stores";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const FY = TK_FLOOR_Y;
export const BACKERS_RIG = { cx: 540, cy: FY - 980, persp: 3400, yaw: 16, pitch: -24 };
const RIG = BACKERS_RIG;
// the boardroom at 0.8 (its table 1,376 long), centred on the stage pivot; the two named chairs are the middle pair
export const ROOM = xfPose(540, FY, 0, 0.8);
const chairPose = (i) => xfMul(ROOM, xfTrans([chairX(i), 0, CHAIR_Z]));
export const platePose = (i) => xfMul(ROOM, xfTrans([chairX(i), TB_TOP, placeZ]));
export const SHULTZ_I = 2, KISS_I = 3;
// the terrace of stores, across the floor to the right. ★ The travel is a real DOLLY of the rig along the floor (world x, by DX) —
//   every object, the floor's grid and the shadows re-project each frame — so the stores are seen as the boardroom was: square to
//   the lens, never sheared by the lens's edge. (rig.cx + vx with the layer shifted back by vx = the camera moved vx along x.)
const DX = 2150;
const STORES = xfPose(540 + DX, FY, -30, 0.9, -6);
const rigAt = (vx) => ({ ...RIG, cx: RIG.cx + vx });
const KEYS = ["s0", "two", "former", "secretaries", "state", "board", "s1", "walgreens", "offered", "tests", "k40", "stores"];
export const backersTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`backers: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // the two chairs light (and their nameplates' engraving fills) — each fully read on its word
    shultz: { a: w.former - 12, b: w.former + 2 },
    kiss: { a: w.secretaries - 12, b: w.secretaries + 2 },
    // FORMER SECRETARIES OF STATE, fully read on "state"
    board: { a: w.state - 14, b: w.state + 2 },
    // ★ the travel to the stores, arriving on "Walgreens"
    travel: { a: w.walgreens - 30, dur: 36 },
    brand: { a: w.walgreens - 11, b: w.walgreens + 3 },
    // the stores light in a wave from "offered" to just before "forty"
    wave: { a: w.offered - 6, b: w.k40 - 8 },
    count: { a: w.k40 - 12, b: w.k40 + 2 },
    state: { a: w.k40 - 2, b: w.stores + 2 },
    crane: end - 20
  };
  if (t.travel.a < t.board.b + 12) throw new Error("backers: FORMER SECRETARIES OF STATE must be read before the travel to the stores");
  if (t.wave.a < t.travel.a + t.travel.dur - 4) throw new Error("backers: the camera must have arrived at the stores before they light");
  if (t.wave.b - t.wave.a < 24) throw new Error("backers: the wave across forty stores needs ≥ 24 f to read as a wave");
  if (t.state.b > t.crane + 2) throw new Error("backers: ARIZONA must land before the slide out");
  return t;
};
// ── the camera ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const at = (q) => {
  const p = worldScr(RIG, q);
  return { x: p[0], y: p[1] };
};
const ROOM_AIM = (() => {
  const a = worldScr(RIG, chairTop(chairPose(SHULTZ_I))), b = worldScr(RIG, chairTop(chairPose(KISS_I))), c = worldScr(RIG, xfMul(ROOM, xfTrans([0, TB_TOP, 0])).t);
  return { x: (a[0] + b[0]) / 2 + 10, y: ((a[1] + b[1]) / 2 + c[1]) / 2 + 128 };
})();
// the terrace framing: centred on its projected box (WALGREENS above it, ~40 STORES · ARIZONA under it)
const ST_BOX = (() => {
  const ps = terraceCorners(STORES).map((q) => worldScr(rigAt(DX), q)).map(([x, y]) => [x - DX, y]);
  const xs = ps.map((p) => p[0]), ys = ps.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
})();
const STORES_AIM = { x: (ST_BOX.x0 + ST_BOX.x1) / 2, y: (ST_BOX.y0 + ST_BOX.y1) / 2 + 50 };
const shots = (t) => [
  { a: -9999, z: 1.12, push: 0.05, at: () => ROOM_AIM },
  // ★ the travel across the floor to the terrace of stores
  { a: t.travel.a, dur: t.travel.dur, z: 0.94, push: 0.03, at: () => STORES_AIM }
];
export const backersCamWindows = (t) => actionCamWindows(shots(t));
export const backersSfx = (t) => [
  // the light coming up on Shultz's chair, then Kissinger's (a switch's click as each light comes on)
  { job: "click", a: t.shultz.a + 2, b: t.shultz.a + 3, vol: 0.7 },
  { job: "label", a: t.shultz.a, b: t.shultz.b, vol: 0.3 },
  { job: "click", a: t.kiss.a + 2, b: t.kiss.a + 3, vol: 0.7 },
  { job: "label", a: t.kiss.a, b: t.kiss.b, vol: 0.3 },
  // FORMER SECRETARIES OF STATE
  { job: "label", a: t.board.a, b: t.board.b, vol: 0.45 },
  // WALGREENS over the terrace as the camera arrives
  { job: "label", a: t.brand.a, b: t.brand.b, vol: 0.4 },
  // the forty stores lighting one after another (a count running up)
  { job: "data", a: t.wave.a, b: t.wave.b, vol: 0.55 },
  // ~40 STORES, then ARIZONA
  { job: "label", a: t.count.a, b: t.count.b, vol: 0.5 },
  { job: "label", a: t.state.a, b: t.state.b, vol: 0.3 }
];
// ── labels ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** an Anton figure or label centred on (x, y), easing up into place (≈14 px) with a slight settle in scale */
const Tag = ({ x, y, on, text, size, kind = "fig", probe }) => {
  if (on <= 3e-3) return null;
  const Wd = 1000;
  return jsx("div", { "data-probe-label": probe, style: {
    position: "absolute", left: 0, top: 0, width: Wd, textAlign: "center", transformOrigin: "50% 50%",
    transform: `translate(${(x - Wd / 2).toFixed(2)}px, ${(y - size / 2 + 14 * (1 - on)).toFixed(2)}px) scale(${(0.94 + 0.06 * on).toFixed(4)})`,
    opacity: clamp01(on * 1.3),
    ...(kind === "fig" ? figure(size, BR_INK) : label(size, BR_LABEL))
  }, children: text });
};
// the light from above on a lit chair: a soft pool on the floor around its foot (an ellipse in the floor's plane, never a box)
const FloorPool = ({ id, rig, pose, on }) => {
  if (on <= 3e-3) return null;
  const c = worldScr(rig, xfMul(pose, xfTrans([0, 0, 20])).t);
  const e = worldScr(rig, xfMul(pose, xfTrans([260, 0, 20])).t), n = worldScr(rig, xfMul(pose, xfTrans([0, 0, -240])).t);
  const rx = Math.hypot(e[0] - c[0], e[1] - c[1]), ry = Math.max(30, Math.abs(n[1] - c[1]));
  return jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    jsx("defs", { children: jsxs("radialGradient", { id: `${id}Pl`, children: [
      jsx("stop", { offset: "0", stopColor: "#BFD5EF", stopOpacity: 0.3 }),
      jsx("stop", { offset: "0.55", stopColor: "#8FB2DD", stopOpacity: 0.1 }),
      jsx("stop", { offset: "1", stopColor: "#8FB2DD", stopOpacity: 0 })
    ] }) }, "d"),
    jsx("ellipse", { cx: c[0], cy: c[1], rx, ry, fill: `url(#${id}Pl)`, opacity: clamp01(on), style: { mixBlendMode: "screen" } }, "e")
  ] });
};
export const BxBackers = ({ at: at0, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = backersTimes(w, end);
  // the slide out ends at end + 20: after that the place is wholly off the frame and draws nothing
  if (f > t.crane + 44) return null;
  // the dolly: the camera moving DX along the floor over the travel (the layer shifted back by vx keeps the frame on the lens)
  const tEnd = t.travel.a + t.travel.dur;
  const vx = DX * rInOut(f, t.travel.a, tEnd);
  const rig = rigAt(vx);
  // each framing is drawn only while it can be on the frame: the boardroom until the dolly has carried it ≥ 900 px off the left
  //   edge (it ends 1,600 px off), the stores from the dolly's start (they wait 1,000 px off the right edge)
  const room = f <= tEnd, stores = f >= t.travel.a;
  const litS = rInOut(f, t.shultz.a, t.shultz.b + 6), litK = rInOut(f, t.kiss.a, t.kiss.b + 6);
  const litOf = (i) => i === SHULTZ_I ? litS : i === KISS_I ? litK : 0;
  const order = Array.from({ length: CHAIR_N }, (_, i) => i).sort((p, q) => viewDepth(rig, chairPose(p).t) - viewDepth(rig, chairPose(q).t));
  const litAt = (r, c) => {
    const T = t.wave.a + (t.wave.b - t.wave.a) * storeOrder[`${r},${c}`];
    return { on: rInOut(f, T, T + 8), flash: rOut(f, T, T + 4) * (1 - rInOut(f, T + 4, T + 18)) };
  };
  const casters = [
    ...(room ? [{ corners: tableCorners(ROOM) }, ...Array.from({ length: CHAIR_N }, (_, i) => ({ corners: chairCorners(chairPose(i)), k: 0.7 }))] : []),
    ...(stores ? [{ corners: terraceCorners(STORES), k: 0.45 }] : [])
  ];
  // label anchors (place coordinates, live: they ride with the dolly's projection)
  const topS = worldScr(rig, chairTop(chairPose(SHULTZ_I))), topK = worldScr(rig, chairTop(chairPose(KISS_I)));
  const boardAt = [(topS[0] + topK[0]) / 2, Math.min(topS[1], topK[1]) - 98];
  const box = (() => {
    const ps = terraceCorners(STORES).map((q) => worldScr(rig, q));
    const xs = ps.map((p) => p[0]), ys = ps.map((p) => p[1]);
    return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y0: Math.min(...ys), y1: Math.max(...ys) };
  })();
  const sheen = 900 * rInOut(f, at0 - 20, t.travel.a + 20);
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: actionCam(shots(t)), children: jsx("div", { "data-probe-leaving": travelling(f, backersCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsx(Turn, { at: at0, end, from: -4, to: 3, amp: 0.7, children: jsxs("div", { style: { position: "absolute", inset: 0, transform: `translateX(${(-vx).toFixed(2)}px)` }, children: [
    jsx(TkFloor, { id: "bkF", rig, at: { x: 560 + vx, z: -60 }, reach: 1500, casters, stage, on: 1 - stage }),
    // the boardroom: table, chairs and the two nameplates standing on it are ONE construction (the plates' engraving sits over
    //   the table top and the chairs behind it by design)
    room && jsxs("div", { "data-probe-object": "the boardroom: a long polished table on two pedestals, six empty high-backed leather executive chairs, two brass nameplates", style: { position: "absolute", inset: 0 }, children: [
      jsx(FloorPool, { id: "bkLs", rig, pose: chairPose(SHULTZ_I), on: litS }),
      jsx(FloorPool, { id: "bkLk", rig, pose: chairPose(KISS_I), on: litK }),
      order.map((i) => jsx(Chair, { id: `bkC${i}`, rig, pose: chairPose(i), lit: litOf(i) }, `c${i}`)),
      jsx(Table, { id: "bkT", rig, pose: ROOM, sheen, glow: [{ x: chairX(SHULTZ_I), on: litS }, { x: chairX(KISS_I), on: litK }], reflect: order.map((i) => jsx(ChairReflection, { id: `bkC${i}`, rig, pose: chairPose(i), lit: litOf(i) }, `m${i}`)) }),
      jsx(NamePlate, { id: "bkPS", rig, pose: platePose(SHULTZ_I), text: L("boardShultz"), on: rOut(f, t.shultz.a, t.shultz.b), lit: litS, probe: "the SHULTZ nameplate" }),
      jsx(NamePlate, { id: "bkPK", rig, pose: platePose(KISS_I), text: L("boardKissinger"), on: rOut(f, t.kiss.a, t.kiss.b), lit: litK, probe: "the KISSINGER nameplate" })
    ] }),
    room && jsx(Tag, { x: boardAt[0], y: boardAt[1], on: rOut(f, t.board.a, t.board.b), text: L("boardLabel"), size: 56, probe: "FORMER SECRETARIES OF STATE" }),
    stores && jsx("div", { "data-probe-object": "forty pharmacy storefronts on a stepped terrace", style: { position: "absolute", inset: 0 }, children: jsx(Terrace, { id: "bkS", rig, pose: STORES, litAt }) }),
    stores && jsx(Tag, { x: box.x, y: box.y0 - 86, on: rOut(f, t.brand.a, t.brand.b), text: L("storesBrand"), size: 92, probe: "WALGREENS" }),
    stores && jsx(Tag, { x: box.x, y: box.y1 + 76, on: rOut(f, t.count.a, t.count.b), text: L("storesCount"), size: 96, probe: "~40 STORES" }),
    stores && jsx(Tag, { x: box.x, y: box.y1 + 154, on: rOut(f, t.state.a, t.state.b), text: L("storesState"), size: 40, kind: "lab", probe: "ARIZONA" })
  ] }) }) }) }) });
};
