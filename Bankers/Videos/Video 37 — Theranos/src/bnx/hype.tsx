// @ts-nocheck
// ★ V37 "Theranos" — place `hype` (builder H). "By two thousand fourteen, it was worth nine billion dollars on paper."
//   ON PAPER, literally. The hook's machined steel base is back on the floor — but the tower is gone: standing on it is ONE tall,
//   thin sheet of paper, folded in three and swaying (2014, hypeYear, eases onto its folded outside on "2014"). On "worth $9
//   billion" it unfolds — the left panel swings open toward the eye, the right one round from behind — and stands as a creased
//   sheet printed $9B (hypeFigure) across its three panels, as the camera eases back to hold it whole. It never stops moving: it
//   springs as it opens, leans and flutters, its free corners curl, and on "paper" a breath of air bends it back (flimsy against
//   the heavy steel it stands on) as ON PAPER (hypeLabel) lands under the base. Its thin shadow lies on the steel.
//   Objects: the steel base, the sheet (+ its print), one label. Enters panFromL, exits panL (the composition's).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn, label } from "./kit";
import { HW_FLOOR_Y, HwFloor, hwCam, scrPathH } from "./hook_world";
import { HookPlinth, PL, PL_BASE_TOP, plinthCorners } from "./hook_plinth";
import { HypeSheet, SHEET, sheetPoints } from "./hype_sheet";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const X = PL.x, ZS = 20, Y0 = PL_BASE_TOP, F = 3000;
const KEYS = ["s0", "k2014", "worth", "k9", "billion", "paper"];
export const hypeTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`hype: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // 2014 eases onto the folded sheet, read ON "2014"
    year: { a: w.k2014 - 16, b: w.k2014 },
    // the unfolding: the left panel from just before "worth" to after "$9", the right one through "billion"
    open0: { a: w.worth - 16, b: w.k9 + 8 },
    open1: { a: w.k9 - 10, b: w.billion + 10 },
    // the camera eases back to hold the opened sheet
    back: { a: w.worth - 16, b: w.billion + 12 },
    // "paper": a breath of air bends it back, and ON PAPER lands under the base
    gust: { a: w.paper - 12, b: w.paper + 30 },
    lab: { a: w.paper - 14, b: w.paper }
  };
  if (t.year.a < w.s0 - 22) throw new Error("hype: 2014 must ease in after the place has slid in far enough to read");
  if (t.lab.b > end - 4) throw new Error(`hype: ON PAPER must land before the slide out (${t.lab.b} vs ${end})`);
  if (t.open1.b > t.lab.a + 4) throw new Error("hype: the sheet must stand open before ON PAPER lands");
  return t;
};
const camAt = (t, g) => {
  const e = rInOut(g, t.back.a, t.back.b), c = rInOut(g, t.w.s0 - 20, t.end + 20);
  const D = Math.exp(Math.log(2350) + (Math.log(3050) - Math.log(2350)) * e) * (1 - 0.06 * c);
  return hwCam({ tx: X, ty: 765 + 30 * e, D, F, pitch: -7 - 3 * e, yaw: 13 - 4 * e + 3 * c });
};
export const hypeCamWindows = (t) => [{ a: t.back.a, b: t.back.b }];
export const hypeSfx = (t) => [
  // 2014 on the folded sheet
  { job: "label", a: t.year.a, b: t.year.b + 6, vol: 0.4 },
  // the left panel swinging open toward the eye, then the right one round from behind (paper: soft air)
  { job: "obj", a: t.open0.a, b: t.open0.b, k: "io", vol: 0.55 },
  { job: "obj", a: t.open1.a, b: t.open1.b, k: "io", vol: 0.45 },
  // the breath of air bending the sheet back, and ON PAPER landing
  { job: "obj", a: t.gust.a, b: t.gust.a + 16, k: "out", vol: 0.3 },
  { job: "label", a: t.lab.a, b: t.lab.b + 6, vol: 0.45 }
];
// the paper's flimsiness over time: it springs as each panel opens (a damped wobble), leans, flutters, bends back on "paper"
const bendAt = (t, g) => {
  const spring = (a) => g < a ? 0 : Math.exp(-(g - a) / 14) * Math.sin((g - a) / 4.2);
  const gust = rInOut(g, t.gust.a, t.gust.a + 12) * (1 - 0.55 * rInOut(g, t.gust.a + 14, t.gust.b));
  return {
    lean: 0.25 + 0.55 * spring(t.open0.b - 2) + 0.4 * spring(t.open1.b - 2) + 1.15 * gust,
    curl: 0.6 + 0.5 * Math.sin(g * 0.13) + 0.9 * spring(t.open1.b) + 1.4 * gust,
    flut: 0.6 + 1.2 * gust
  };
};
const KEYDIR = { x: 0.5, z: -0.62 };
export const BxHype = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = hypeTimes(w, end);
  const cam = camAt(t, f);
  const open0 = rInOut(f, t.open0.a, t.open0.b), open1 = rInOut(f, t.open1.a, t.open1.b);
  const bend = bendAt(t, f);
  const sOpt = { x: X, z: ZS, y0: Y0, open0, open1, bend, t: f };
  // the sheet's thin shadow on the steel base's top, leaning away from the key light, clipped to the base
  const sh = sheetPoints(sOpt).map(([x, y, z]) => {
    const d = Y0 - y;
    return cam.P([x + KEYDIR.x * d * 0.55, Y0 - 0.3, z + KEYDIR.z * d * 0.55]);
  });
  const hull = (pts) => {
    const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
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
    return [...lo.slice(0, -1), ...hi.slice(0, -1)];
  };
  const bw = PL.step2.w / 2 - 6, bd = PL.step2.d / 2 - 6;
  const baseTop = [[X - bw, Y0, -bd], [X + bw, Y0, -bd], [X + bw, Y0, bd], [X - bw, Y0, bd]].map((q) => cam.P(q));
  const foot = cam.P([X, Y0, ZS]), far = cam.P([X + KEYDIR.x * 500, Y0, ZS + KEYDIR.z * 500]);
  const lab = rOut(f, t.lab.a, t.lab.b);
  const lp = cam.P([X, HW_FLOOR_Y + 40, PL.step1.d / 2 + 120]);
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: () => ({ x: 0, y: 0, z: 1 }), children: jsx("div", { "data-probe-leaving": travelling(f, hypeCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -4, to: 3, amp: 0.7, children: [
    jsx(HwFloor, { id: "hyF", cam, at: { x: X, z: 60 }, reach: 1300, casters: [{ corners: plinthCorners(true) }], stage }),
    jsxs("div", { "data-probe-object": "the hook's steel base with a tall creased sheet of paper standing on it, printed $9B (2014 on its fold)", style: { position: "absolute", inset: 0 }, children: [
      jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
        jsx(HookPlinth, { id: "hyP", cam, base: true, stage }),
        jsxs("defs", { children: [
          jsx("clipPath", { id: "hyShC", clipPathUnits: "userSpaceOnUse", children: jsx("path", { d: scrPathH(baseTop) }) }),
          jsxs("linearGradient", { id: "hyShG", gradientUnits: "userSpaceOnUse", x1: f2(foot[0]), y1: f2(foot[1]), x2: f2(far[0]), y2: f2(far[1]), children: [
            jsx("stop", { offset: "0", stopColor: "#000000", stopOpacity: 0.55 }),
            jsx("stop", { offset: "1", stopColor: "#000000", stopOpacity: 0.08 })
          ] })
        ] }),
        jsx("path", { d: scrPathH(hull(sh)), fill: "url(#hyShG)", clipPath: "url(#hyShC)" }),
        jsx(HypeSheet, { id: "hySh", cam, ...sOpt, fig: L("hypeFigure"), year: L("hypeYear"), yearOn: rInOut(f, t.year.a, t.year.b), printOn: rInOut(f, t.open0.a + 6, t.open0.a + 28) })
      ] })
    ] }),
    lab > 3e-3 && jsx("div", { "data-probe-label": "ON PAPER", style: { position: "absolute", left: lp[0] - 300, top: lp[1], width: 600, height: 60, opacity: clamp01(lab), transform: `translateY(${((1 - lab) * 24).toFixed(2)}px)` }, children: jsx("div", { style: { position: "absolute", left: 0, top: 0, width: 600, textAlign: "center", ...label(30, "#DCE7F4"), opacity: 0.94, transform: "scale(1.9)" }, children: L("hypeLabel") }) })
  ] }) }) }) });
};
