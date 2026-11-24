// @ts-nocheck
// ★ V37 "Theranos" — place `expose` (builder C), THE FILM'S ONE WHITE STAGE. "In October two thousand fifteen, the Wall Street
//   Journal exposed it."
//   A bundle of newspapers (expose_bundle: 18 folded broadsheets and a top copy, cross-tied with twine) drops onto the floor as the
//   place arrives — tumbling a little about its centre and righting itself as it falls — and lands with a thud on "October", the
//   stack giving under the hit. On "2015" the dateline OCT 15, 2015 (exposeDate) prints in on the top copy's strip under the
//   (still empty) masthead band. In the pause after it the twine SNAPS at the knot: the cut ends whip back over the edges, the
//   visible runs slump down the sides and coil on the floor. The top copy slides forward off the stack as the camera pushes in on
//   it, and on "Wall Street Journal" the masthead THE WALL STREET JOURNAL (exposeMast, Anton) prints in, centred; on "exposed" a
//   light crosses the page. No logo, no photo, no readable fake type: the page is column rules and bars.
//   White-stage handling (V35 virginia, V36 truth): the floor (TkFloor) fades as the stage turns white; the newsprint keeps its
//   own pale steel-blue and its navy print; the shadows are the navy ink (theme.textOnLight) on the white.
//   Objects: the bundle (stack + top copy + twine: one object).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex, rIn, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { worldScr, xfAbout, xfApply, xfMul, xfRotX, xfRotZ, xfTrans } from "./tk_rig";
import { TkFloor } from "./tk_floor";
import { TK_FLOOR_Y } from "./tk_slab";
import { theme } from "./theme";
import { BUNDLE, BundleStack, TopCopyEdge, TopCopyPrint, Twine, topXf } from "./expose_bundle";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const FY = TK_FLOOR_Y;
const X = 540, Z = 30;
const RIG = { cx: 540, cy: FY - 520, persp: 3200, yaw: 20, pitch: -44 };
// the drop (world units above the floor), the tumble it rights, the top copy's slide [dx, dz, yaw°]
const DROP = 260, ROLL0 = 9, PITCH0 = -6;
const SLIDE = [26, 150, 4];
const KEYS = ["s0", "october", "k2015", "wall", "street", "journal", "exposed"];
export const exposeTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`expose: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // the bundle falls from rest as the place pans in and lands (the thud) just before "October"
    drop: { a: w.s0 - 16, b: w.october - 2 },
    // OCT 15, 2015 prints in — fully read on "2015"
    // (integrator, take 37A: "October 2015" is read in 8 f — the date prints from the landing, readable on "2015" or 12 f after)
    date: { a: Math.max(w.k2015 - 18, w.october - 2), b: Math.max(w.k2015, w.october + 10) },
    // the twine snaps in the pause after "2015"
    snap: w.k2015 + 12,
    // the top copy slides forward; the camera pushes in with it
    slide: { a: w.k2015 + 20, b: w.street + 4 },
    // THE WALL STREET JOURNAL prints in — fully read on "Journal"
    mast: { a: w.wall - 6, b: w.journal + 2 },
    // a light crosses the page on "exposed"
    glint: { a: w.exposed - 6, b: Math.min(w.exposed + 14, end - 16) }   // (integrator: capped before the slide on take 37A)
  };
  if (t.drop.b - t.drop.a < 12) throw new Error("expose: the drop needs ≥ 12 f");
  if (t.date.a < t.drop.b) throw new Error("expose: the date prints once the bundle has landed");
  if (t.slide.a < t.snap + 6) throw new Error("expose: the top copy slides once the twine is off it");
  if (t.mast.a < t.slide.a + 8) throw new Error("expose: the masthead prints once the copy is moving into the push");
  if (t.glint.b > end - 16) throw new Error("expose: the light must cross the page before the hand-over");
  return t;
};
const H = BUNDLE.H;
const groupXf = (t, g) => {
  const p = clamp01((g - t.drop.a) / (t.drop.b - t.drop.a));
  const dy = -DROP * (1 - p * p);
  const k = Math.pow(1 - p, 1.4);
  const rot = xfMul(xfRotZ(ROLL0 * k), xfRotX(PITCH0 * k));
  return xfMul(xfTrans([X, FY + dy, Z]), xfAbout(rot, [0, -H / 2, 0]));
};
// the landing's squash: the stack gives under the hit and recovers (a damped spring), 0 before contact
const squash = (t, g) => {
  if (g < t.drop.b) return 0;
  const d = g - t.drop.b;
  return Math.max(-0.25, Math.exp(-d / 3.6) * Math.cos(d * 0.62));
};
const slideAt = (t, g) => {
  const e = rInOut(g, t.slide.a, t.slide.b);
  return [SLIDE[0] * e, SLIDE[1] * e, SLIDE[2] * e];
};
const scr = (q) => {
  const p = worldScr(RIG, q);
  return { x: p[0], y: p[1] };
};
const G0 = xfTrans([X, FY, Z]);
const TOPC = scr(xfApply(G0, [0, -H, 0]));
const MAST = scr(xfApply(topXf(G0, SLIDE), [0, 0, -BUNDLE.D / 2 + 78]));
const shots = (t) => [
  // the bundle, landing, the dateline strip readable
  { a: -9999, z: 1.3, push: 0.02, at: still(TOPC.x, TOPC.y + 50) },
  // pushing in with the sliding top copy onto its masthead, centred
  { a: t.slide.a - 2, dur: t.slide.b - t.slide.a + 8, z: 1.62, push: 0.02, at: still(MAST.x, MAST.y + 40) }
];
export const exposeCamWindows = (t) => actionCamWindows(shots(t));
export const exposeSfx = (t) => [
  // the bundle hits the floor (the contact frame)
  { job: "thud", a: t.drop.b, vol: 0.9 },
  // OCT 15, 2015 printing in
  { job: "label", a: t.date.a, b: t.date.b + 6, vol: 0.4 },
  // the twine snapping at the knot
  { job: "flick", a: t.snap, vol: 0.8 },
  // the top copy sliding off the stack
  { job: "obj", a: t.slide.a, b: t.slide.b, k: "io", vol: 0.6 },
  // THE WALL STREET JOURNAL printing in
  { job: "label", a: t.mast.a, b: t.mast.b + 6, vol: 0.5 },
  // the light crossing the page
  { job: "ping", a: Math.round(t.glint.a + 0.45 * (t.glint.b - t.glint.a)), vol: 0.5 }
];
// the bundle's shade on the floor (navy ink on the white stage, black on the navy floor): its footprint pushed away from the key
//   light, soft and faint while it is in the air, tight and dark once it lands
const Shade = ({ G, ink, lift }) => {
  const W = BUNDLE.W / 2 + 4, D = BUNDLE.D / 2 + 4;
  const foot = [[-W, -D], [W, -D], [W, D], [-W, D]].map(([x, z]) => {
    const q = xfApply(G, [x, 0, z]);
    return [q[0], q[2]];
  });
  const k = 1 / (1 + lift / 180);
  const path = (dx, dz) => `M${foot.map(([x, z]) => {
    const p = worldScr(RIG, [x + dx, FY - 0.5, z + dz]);
    return `${f2(p[0])},${f2(p[1])}`;
  }).join("L")}Z`;
  const off = 0.5 * (40 + lift * 0.4), offz = -0.62 * (40 + lift * 0.4);
  // a floor shade: the probe's background (it lies on the floor, under the bundle; the probe has no depth order)
  return jsxs("g", { "data-probe": "bg", children: [
    jsx("path", { d: path(off, offz), fill: ink, fillOpacity: 0.2 * k, stroke: ink, strokeOpacity: 0.08 * k, strokeWidth: 40 + lift * 0.3, strokeLinejoin: "round" }),
    jsx("path", { d: path(off * 0.4, offz * 0.4), fill: ink, fillOpacity: 0.22 * k * k, stroke: ink, strokeOpacity: 0.1 * k * k, strokeWidth: 14, strokeLinejoin: "round" }),
    lift < 30 && jsx("path", { d: path(1.5, 1.5), fill: "none", stroke: ink, strokeOpacity: 0.5 * (1 - lift / 30), strokeWidth: 4, strokeLinejoin: "round" })
  ] });
};
// the top copy's overhang shades the stack's folded front face under it
const OverhangShade = ({ G, sl, ink }) => {
  const over = sl[1];
  if (over < 2) return null;
  const W = BUNDLE.W / 2, zf = BUNDLE.D / 2 + 3.5, top = -BUNDLE.N * BUNDLE.T;
  const h = Math.min(60, 10 + over * 0.28);
  const pts = [[-W + sl[0] + 6, top, zf], [W - 6, top, zf], [W - 6, top + h, zf], [-W + sl[0] + 6, top + h * 0.7, zf]].map((q) => worldScr(RIG, xfApply(G, q)));
  return jsxs("g", { "data-probe-skip": true, children: [
    jsx("defs", { children: jsxs("linearGradient", { id: "exOv", gradientUnits: "userSpaceOnUse", x1: "0", y1: f2(pts[0][1]), x2: "0", y2: f2(pts[2][1]), children: [
      jsx("stop", { offset: "0", stopColor: ink, stopOpacity: 0.34 * clamp01(over / 40) }),
      jsx("stop", { offset: "1", stopColor: ink, stopOpacity: 0 })
    ] }) }),
    jsx("path", { d: `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`, fill: "url(#exOv)" })
  ] });
};
// the floor alone, under a mask in the place root's own frame: it fades out over the root's off-screen margins, so as the place
//   pans in or out the floor's edge comes in soft — the root's clip would otherwise cut it as a hard vertical line
const MASK = "linear-gradient(to right, transparent 0px, #000 150px, #000 1210px, transparent 1360px)";
const FloorLayer = ({ cam, turn, children }) => jsx("div", { style: { position: "absolute", left: -140, top: -240, width: 1360, height: 2400, WebkitMaskImage: MASK, maskImage: MASK }, children: jsx("div", { style: { position: "absolute", left: 140, top: 240, width: 1080, height: 1920 }, children: jsx(CamFn, { at: cam, children: jsx(Turn, { ...turn, children }) }) }) });
export const BxExpose = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = exposeTimes(w, end);
  const s = clamp01(stage);
  const G = groupXf(t, f);
  const sq = squash(t, f);
  const sl = slideAt(t, f);
  const TX = topXf(G, sl, sq);
  const lift = Math.max(0, -(G.t[1] - FY));
  const ink = mixHex("#000000", theme.textOnLight, s);
  const tw = { snap: f >= t.snap ? f - t.snap : -1, lie: rOut(f, t.snap + 10, t.snap + 30) };
  const glint = f > t.glint.a && f < t.glint.b ? (f - t.glint.a) / (t.glint.b - t.glint.a) : -1;
  const svg = (children, key) => jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children }, key);
  const cam = actionCam(shots(t)), turn = { at, end, from: 5, to: -3, amp: 0.7 };
  return jsx(PlaceRoot, { children: [jsx(FloorLayer, { cam, turn, children: jsx(TkFloor, { id: "exF", rig: RIG, at: { x: X, z: Z + 60 }, reach: 1300, casters: [], stage: s, on: 1 - s }) }, "fl"), jsx(CamFn, { at: cam, children: jsx("div", { "data-probe-leaving": travelling(f, exposeCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { ...turn, children: [
    svg(jsx(Shade, { G, ink, lift }), "sh"),
    jsxs("div", { "data-probe-object": "the bundle of newspapers: folded copies stacked, cross-tied with twine; the top copy with THE WALL STREET JOURNAL and its dateline", style: { position: "absolute", inset: 0 }, children: [
      svg([jsx(BundleStack, { rig: RIG, G, sq }, "st"), jsx(OverhangShade, { G, sl, ink }, "ov"), jsx(Twine, { rig: RIG, G, s: tw, layer: "sides" }, "tws")], "a"),
      svg(jsx(TopCopyEdge, { rig: RIG, X: TX }), "b"),
      jsx(TopCopyPrint, { rig: RIG, X: TX, mast: rOut(f, t.mast.a, t.mast.b), date: rOut(f, t.date.a, t.date.b), glint, mastText: L("exposeMast"), dateText: L("exposeDate") }),
      svg(jsx(Twine, { rig: RIG, G, s: tw, layer: "tops" }), "c")
    ] })
  ] }) }) }, "obj")] });
};
void rIn;
