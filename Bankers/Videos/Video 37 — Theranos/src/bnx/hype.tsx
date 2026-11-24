// @ts-nocheck
// ★ V36 "Bre-X Gold" — place `hype` (builder H). "The stock went from pennies to a six billion dollar company. Pension funds piled in."
//   A Canadian one-cent coin lies on a machined graphite pedestal whose engraved plate reads PENNIES (hypeFrom; its engraving fills
//   on "pennies"); the camera is close on the coin as it turns slowly. On "six billion" the cent SWELLS — copper turning to gold —
//   into the hook's own gold bar standing on the pedestal (the callback), stamped C$6B (hypeTo, read from "billion"), as the camera
//   pulls back to hold the bar and the pedestal. ★ rev 1b (Timur: the plaques were too fast to read): on "Pension funds piled in"
//   coins pour onto six stacks round the pedestal's foot — money piling in to the stock — and PENSION FUNDS (hypePension) lands
//   on "Pension". Objects: the pedestal, the cent → bar, the coins.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { aim, travelling } from "./common";
import { L } from "./data";
import { Turn } from "./kit";
import { worldScr, xfMul, xfScale, xfTrans } from "./tk_rig";
import { TkFloor } from "./tk_floor";
import { BX_FLOOR_Y, bxRig } from "./bx_core";
import { BarBody, BarStamp, barCorners, barDims } from "./bx_bar";
import { CentFace, HP_TOP, HypePedestal, pedestalCorners } from "./hype_parts";
import { HypeCoins, coinPlan, coinsDone } from "./hype_coins";
import { label } from "./kit";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const FY = BX_FLOOR_Y;
const X = 540, Z = 0;
const POSE = xfTrans([X, FY, Z]);
const RIG = bxRig({ cx: 540, cy: FY - 700, yaw: -13, pitch: -17, lens: 3200 });
// the bar here is the hook's bar at K = 0.6 (so the pedestal and its plaques read beside it); the cent is 132 units across and
//   9.8 thick on screen (a real cent's 19.05 : 1.45 mm) — its source dims are in the bar's local units, so ÷ K
const K = 0.6;
const SRC = { r: 66 / K, len: 9.8 / K, kind: "copper" };
const KEYS = ["s0", "stock", "pennies", "k6", "billion", "company", "s1", "pension", "funds", "piled"];
export const hypeTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`hype: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // PENNIES' engraving fills, read ON "pennies"
    penny: { a: w.pennies - 14, b: w.pennies },
    // the cent swells into the bar: from just before "$6" until the bar stands, a little after "billion"
    grow: { a: w.k6 - 8, b: w.billion + 12 },
    // C$6B eases onto the bar's face, fully read ON "billion"(+8: the face has formed)
    fig: { a: w.billion - 10, b: w.billion + 8 },
    // the camera pulls back to hold the bar on its pedestal
    pull: { a: w.k6 - 12, dur: 38 },
    // and eases in a little as the money comes
    down: { a: w.pension - 16, dur: 32 },
    // ★ (Timur, rev 1b: the plaques read too fast) "Pension funds piled in": coins pour onto six stacks round the pedestal's foot —
    //   the first lands on "Pension", the last as "piled in" ends; PENSION FUNDS lands on "Pension"
    pour: { a: w.pension - 2, b: Math.min(w.piled + 12, end - 26) },
    pension: { a: w.pension - 12, b: w.pension }
  };
  if (t.pension.b + 30 > end - 20) throw new Error(`hype: PENSION FUNDS must read ≥ 30 f before the slide out (${t.pension.b} vs ${end - 20})`);
  if (t.grow.b > t.pour.a) throw new Error("hype: the bar must stand before the money pours in");
  if (t.penny.a < 480) throw new Error("hype: PENNIES must fill after the place has risen in");
  return t;
};
const scr = (q) => {
  const p = worldScr(RIG, q);
  return { x: p[0], y: p[1] };
};
const shots = (t) => [
  // close on the cent and the PENNIES plate
  { a: -9999, z: 1.9, push: 0.04, at: () => {
    const p = scr([X, FY + HP_TOP + 46, Z + 80]);
    return { x: p.x, y: p.y };
  } },
  // back to the bar standing on its pedestal
  { a: t.pull.a, dur: t.pull.dur, z: 0.82, push: 0, at: () => scr([X, FY - 640, Z + 60]) },
  // a touch in toward the rails as the plaques come — the bar's top stays ≈ 200 px under the caption band, so the crane out
  //   (which lifts the place through the top) cannot carry it into the last chip
  { a: t.down.a, dur: t.down.dur, z: 0.88, push: 0.01, at: () => scr([X, FY - 655, Z + 90]) }
];
const camOf = (t) => {
  const S = shots(t);
  return (g) => {
    let p = S[0].at(g), x = p.x, y = p.y, lz = Math.log(S[0].z * (1 + S[0].push * rInOut(g, t.w.s0 - 20, t.pull.a)));
    for (let i = 1; i < S.length; i++) {
      const s = S[i], e = rInOut(g, s.a, s.a + s.dur);
      if (e <= 0) break;
      const q = s.at(g), z = s.z * (1 + (s.push ?? 0) * rInOut(g, s.a + s.dur, s.a + s.dur + 150));
      x += (q.x - x) * e;
      y += (q.y - y) * e;
      lz += (Math.log(z) - lz) * e;
    }
    return { ...aim(x, y), z: Math.exp(lz) };
  };
};
export const hypeCamWindows = (t) => shots(t).slice(1).map((s) => ({ a: s.a, b: s.a + s.dur }));
export const hypeSfx = (t) => [
  // PENNIES fills on the plate
  { job: "label", a: t.penny.a, b: t.penny.b + 4, vol: 0.4 },
  // the cent swells into the gold bar
  { job: "obj", a: t.grow.a, b: t.grow.b, k: "io", vol: 0.7 },
  { job: "coin", a: t.grow.a + 2, vol: 0.5 },
  // C$6B
  { job: "label", a: t.fig.a, b: t.fig.b + 6, vol: 0.45 },
  // PENSION FUNDS
  { job: "label", a: t.pension.a, b: t.pension.b + 6, vol: 0.42 },
  // the coins landing on the stacks: a run of the house's Falling Coins over the pour
  ...Array.from({ length: Math.max(1, Math.round((t.pour.b - t.pour.a) / 9)) + 1 }, (_, i) => ({ job: "coin", a: Math.round(t.pour.a + i * 9), vol: 0.5 - 0.02 * i }))
];
// the bar stands on the pedestal's cap: its foot at y = FY + HP_TOP, growing out of the cent
const barXfAt = (m) => {
  const d = barDims(m, SRC);
  return xfMul(xfTrans([X, FY + HP_TOP - K * d.len / 2, Z]), xfScale(K));
};

export const BxHype = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = hypeTimes(w, end);
  const m = rInOut(f, t.grow.a, t.grow.b);
  const xf = barXfAt(m);
  const plan = coinPlan(t.pour.a, t.pour.b);
  const lab = rOut(f, t.pension.a, t.pension.b);
  const lp = worldScr(RIG, [X, FY + 22, Z + 250]);
  const spin = 14 + 0.55 * (f - at);
  const casters = [{ corners: pedestalCorners(POSE) }, { corners: barCorners(xf, m, SRC), k: rOut(f, t.grow.a, t.grow.b) }];
  const gold = rInOut(f, t.grow.a - 2, t.grow.a + 12);
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: camOf(t), children: jsx("div", { "data-probe-leaving": travelling(f, hypeCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -5, to: 4, amp: 0.8, children: [
    jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(TkFloor, { id: "hyF", rig: RIG, at: { x: X, z: Z + 60 }, reach: 1300, casters, stage }) }),
    jsxs("div", { "data-probe-object": "the machined pedestal with its engraved PENNIES plate; coins pouring onto stacks round its foot", style: { position: "absolute", inset: 0 }, children: [
      jsx(HypePedestal, { id: "hyP", rig: RIG, pose: POSE, word: L("hypeFrom"), wordOn: rInOut(f, t.penny.a, t.penny.b), sheen: 40 * Math.sin((f - at) / 70), rails: false }),
      f >= t.pour.a - 12 && jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(HypeCoins, { rig: RIG, pose: POSE, g: f, plan }) })
    ] }),
    jsxs("div", { "data-probe-object": "the one-cent coin swelling into the stamped gold bar", style: { position: "absolute", inset: 0 }, children: [
      jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(BarBody, { id: "hyB", rig: RIG, xf, m, gold, src: SRC, seed: 7, sheen: -0.8 + 1.4 * rInOut(f, t.grow.b - 4, end), capArt: (p) => jsx(CentFace, { ...p, spin }) }) }),
      jsx(BarStamp, { rig: RIG, xf, m, src: SRC, fig: { text: L("hypeTo"), on: rInOut(f, t.fig.a, t.fig.b) } })
    ] }),
    lab > 3e-3 && jsx("div", { "data-probe-label": "PENSION FUNDS", style: { position: "absolute", left: lp[0] - 300, top: lp[1], width: 600, height: 50, opacity: clamp01(lab), transform: `translateY(${((1 - lab) * 24).toFixed(2)}px)` }, children: jsx("div", { style: { position: "absolute", left: 0, top: 0, width: 600, textAlign: "center", ...label(30, "#DCE7F4"), opacity: 0.92, transform: "scale(1.7)" }, children: L("hypePension") }) })
  ] }) }) }) });
};
