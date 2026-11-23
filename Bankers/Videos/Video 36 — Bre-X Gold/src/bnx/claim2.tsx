// @ts-nocheck
// Video 36 "Bre-X Gold" — place "claim2" (builder B, 2026-11-23): "By nineteen ninety-seven, it claimed seventy-one million ounces."
//   The film's ONE counter: a machined assay counter (Video 35's plinth recipe, widened to eight drums) with the drill core it
//   assays lying on its cap. Its odometer drums — every drum driven by ONE value, counting only UP — climb through Bre-X's own
//   claims (39.15M, 46.92M, 57.33M oz: a hitch at each, the high drums reading them) and settle, drum by drum from the left, on
//   70,950,000 OZ, at rest just before "seventy-one"; the engraved title 71M OZ CLAIMED fills ON "seventy-one" and the release's
//   date FEB 1997 on "claimed". The camera rides across the window as the drums settle left to right, rises to the title, and
//   pulls back to the whole counter before the crane out.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { mix, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { worldScr, xfPose } from "./tk_rig";
import { TK_FLOOR_Y, tkRig } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { CLAIMS, CLAIMED_OZ } from "./claim2_data";
import { CounterBody, counterAt, counterCorners, counterGeo, drumsOf, slotsOf } from "./claim2_counter";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs;
const RIG = tkRig({ eye: 900 });
const X = 540;
const POSE = xfPose(X, TK_FLOOR_Y, 0, 1, 0);
const SLOTS = slotsOf(L("claim2Readout"));
const NDRUM = SLOTS.filter((s) => s.k === "drum").length;
const GEO = counterGeo(SLOTS);
const LAND = SLOTS.filter((s) => s.k === "drum").map((s) => s.d);
if (+LAND.join("") !== CLAIMED_OZ) throw new Error("claim2: the readout's digits must be CLAIMED_OZ");
// ── ONE value through the run (oz): eased legs between the claims, a crawl through each (the high drums read it), then the
//    settle — the remaining ounces fall away exponentially (each drum comes to rest in turn, left to right), forced exact at run.b ──
const BASE = { seg0: 10, dwell: 5, seg: 5, last: 4, tail: 10 };
const BASE_LEN = BASE.seg0 + 3 * BASE.dwell + 2 * BASE.seg + BASE.last + BASE.tail;
const CRAWL = 75e3, R0 = 1.2e6;
const KTAIL = Math.log(R0 / 0.25) / BASE.tail;
const herm = (t, t0, v0, m0, t1, v1, m1) => {
  const h = t1 - t0, s = (t - t0) / h, s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * v0 + (s3 - 2 * s2 + s) * h * m0 + (-2 * s3 + 3 * s2) * v1 + (s3 - s2) * h * m1;
};
const knotsOf = (run) => {
  const k = (run.b - run.a) / BASE_LEN, ks = [];
  let t = run.a;
  ks.push({ t, v: 0, m: 0 });
  t += BASE.seg0 * k;
  CLAIMS.slice(0, 3).forEach((c, i) => {
    if (i > 0) t += BASE.seg * k;
    ks.push({ t, v: c.oz - CRAWL, m: 2 * CRAWL / (BASE.dwell * k) });
    t += BASE.dwell * k;
    ks.push({ t, v: c.oz + CRAWL, m: 2 * CRAWL / (BASE.dwell * k), hitch: c });
  });
  t += BASE.last * k;
  ks.push({ t, v: CLAIMED_OZ - R0, m: KTAIL / k * R0, tail: true });
  return { ks, k, tailAt: t };
};
export const counterOz = (run, g) => {
  if (g <= run.a) return 0;
  if (g >= run.b) return CLAIMED_OZ;
  const { ks, k, tailAt } = knotsOf(run);
  if (g >= tailAt) {
    const rem = R0 * Math.exp(-KTAIL / k * (g - tailAt));
    const force = 1 - Math.min(1, Math.max(0, (g - (run.b - 3 * k)) / (3 * k)));
    const f2 = force * force * (3 - 2 * force);
    return CLAIMED_OZ - rem * f2;
  }
  let i = 0;
  while (i + 2 < ks.length && g >= ks[i + 1].t) i++;
  const a = ks[i], b = ks[i + 1];
  return herm(g, a.t, a.v, a.m, b.t, b.v, b.m);
};
// the exposure: drum positions sampled across the frame (more samples the faster the drums turn)
const EXPO = 0.6;
const samplesAt = (run, f) => {
  const v0 = counterOz(run, f - EXPO / 2), v1 = counterOz(run, f + EXPO / 2);
  const d0 = drumsOf(v0, NDRUM), d1 = drumsOf(v1, NDRUM);
  const sp = Math.max(...d0.map((p, i) => Math.abs(d1[i] - p)));
  const n = sp < 0.3 ? 1 : Math.min(8, 1 + Math.ceil(sp * 2));
  if (n === 1) return [drumsOf(counterOz(run, f), NDRUM)];
  return Array.from({ length: n }, (_, j) => drumsOf(counterOz(run, f - EXPO / 2 + EXPO * (j + 0.5) / n), NDRUM));
};
// self-check on a sample run: the value never falls, starts at 0, ends exactly on the claim, the drums at rest by run.b
{
  const run = { a: 0, b: 49 };
  let prev = -1;
  for (let g = -2; g <= 52; g += 0.125) {
    const v = counterOz(run, g);
    if (v < prev - 1e-6) throw new Error(`claim2: the counter falls at ${g} (${prev} → ${v})`);
    prev = v;
  }
  const end = drumsOf(counterOz(run, run.b), NDRUM);
  if (end.some((p, i) => Math.abs(p % 10 - LAND[i]) > 1e-6 && Math.abs((p % 10) - LAND[i] - 10) > 1e-6)) throw new Error(`claim2: the drums must land on ${CLAIMED_OZ}`);
  const hit = knotsOf(run).ks.filter((q) => q.hitch).map((q) => drumsOf(counterOz(run, q.t - BASE.dwell / 2), NDRUM).slice(0, 2).map((p) => Math.round(p) % 10).join(""));
  if (hit.join(",") !== CLAIMS.slice(0, 3).map((c) => String(Math.floor(c.oz / 1e6)).padStart(2, "0")).join(",")) throw new Error(`claim2: the hitches must read the claims' millions (${hit})`);
}
export const claim2Times = (w, end) => {
  for (const k of ["s0", "k1997", "claimed", "k71", "million", "ounces"]) if (!Number.isFinite(w[k])) throw new Error(`claim2: the take has no word frame "${k}"`);
  const runB = w.k71 - 4;
  const t = {
    w,
    end,
    // the drums climb through the claims and are at rest just before "seventy-one"
    run: { a: runB - BASE_LEN, b: runB },
    // FEB 1997 fills on "claimed"; 71M OZ CLAIMED fills ON "seventy-one"
    date: { a: w.claimed - 12, b: w.claimed + 2 },
    title: { a: w.k71 - 14, b: w.k71 },
    // cameras: into the window riding the settle left → right, up to the title, back to the whole
    toWin: { a: runB - BASE_LEN + 6, dur: 26 },
    toTitle: { a: w.k71 - 18, dur: 24 },
    pull: { a: w.million - 6, dur: 30 }
  };
  if (t.run.a < w.s0 - 20) throw new Error("claim2: the count would start before the counter is on screen");
  if (t.run.b > w.k71 - 2) throw new Error("claim2: the figure must be fully read on 'seventy-one'");
  if (t.pull.a + t.pull.dur > end + 4) throw new Error("claim2: the pull-back must settle by the crane");
  return t;
};
const lay = (p) => ({ x: p[0], y: p[1] });
const PIV = 993, TOPMIN = 520, BOTMAX = 1560;
const SET = counterCorners(POSE, SLOTS).map((q) => worldScr(RIG, q));
const SET_T = Math.min(...SET.map((p) => p[1])), SET_F = Math.max(...SET.map((p) => p[1]));
const fit = (z, p) => {
  const lo = SET_F - (BOTMAX - PIV) / z, hi = SET_T + (PIV - TOPMIN) / z;
  if (lo > hi) throw new Error(`claim2: the counter (${Math.round(SET_F - SET_T)} px) does not fit the frame at z ${z}`);
  return { x: p.x, y: Math.max(lo, Math.min(hi, p.y)) };
};
const shots = (t) => {
  const whole = { x: X, y: (SET_T + SET_F) / 2 };
  const win = lay(counterAt(RIG, POSE, GEO.WIN_C));
  const left = lay(counterAt(RIG, POSE, [GEO.WIN.u0 + 120, GEO.WIN_C[1], GEO.ZF])), right = lay(counterAt(RIG, POSE, [GEO.WIN.u0 + GEO.WIN.w - 200, GEO.WIN_C[1], GEO.ZF]));
  const title = lay(counterAt(RIG, POSE, GEO.TITLE_C));
  return [
    { a: -9999, z: 0.99, push: 0.02, at: still(whole.x, whole.y) },
    // in on the window, riding from the high drums to the low ones as they settle in turn
    { a: t.toWin.a, dur: t.toWin.dur, z: 1.14, push: 0, ride: { a: t.run.a + 8, b: t.run.b + 4 }, at: (g) => fit(1.14, { x: mix(left.x, right.x, rInOut(g, t.run.a + 8, t.run.b + 4)), y: win.y }) },
    // up to the title over the settled figure
    { a: t.toTitle.a, dur: t.toTitle.dur, z: 1.08, push: 0, at: () => fit(1.08, { x: X, y: mix(title.y, win.y, 0.45) }) },
    // back to the whole counter
    { a: t.pull.a, dur: t.pull.dur, z: 1, push: 0.02, at: still(whole.x, whole.y) }
  ];
};
export const claim2CamWindows = (t) => actionCamWindows(shots(t));
export const claim2Sfx = (t) => {
  const { ks } = knotsOf(t.run);
  return [
    // the drums rolling (held for the whole run)
    { job: "mech", a: t.run.a + 1, b: t.run.b, vol: 0.62 },
    // a detent click as the count hitches on each earlier claim
    ...ks.filter((q) => q.hitch).map((q) => ({ job: "click", a: Math.round(q.t - BASE.dwell * ((t.run.b - t.run.a) / BASE_LEN) / 2), b: Math.round(q.t), vol: 0.3 })),
    // the drums set on 70,950,000
    { job: "click", a: t.run.b, b: t.run.b + 1, vol: 0.55 },
    { job: "label", a: t.date.a, b: t.date.b + 6, vol: 0.35 },
    // FEB 1997
    { job: "label", a: t.title.a, b: t.title.b + 6, vol: 0.5 }
    // 71M OZ CLAIMED
  ];
};
export const BxClaim2 = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = claim2Times(w, end);
  const on = (q) => rOut(f, q.a, q.b);
  const casters = [{ corners: counterCorners(POSE, SLOTS) }];
  return /* @__PURE__ */ jsx(PlaceRoot, { children: /* @__PURE__ */ jsx(CamFn, { at: actionCam(shots(t)), children: /* @__PURE__ */ jsx("div", { "data-probe-leaving": travelling(f, claim2CamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ jsxs(Turn, { at, end, from: -6, to: 4, amp: 0.9, children: [
    /* @__PURE__ */ jsx(TkFloor, { id: "c2F", rig: RIG, at: { x: X + 40, z: 0 }, reach: 1250, casters, on: 1 - stage }),
    /* @__PURE__ */ jsx(CounterBody, {
      id: "c2P",
      rig: RIG,
      pose: POSE,
      slots: SLOTS,
      samples: samplesAt(t.run, f),
      lit: 0.35 + 0.65 * rInOut(f, t.run.a, t.run.a + 14),
      title: L("claim2Label"),
      titleOn: on(t.title),
      date: L("claim2Date"),
      dateOn: on(t.date),
      sheen: 60 * rInOut(f, at - 30, at + 40) + 260 * rInOut(f, t.run.b - 4, t.run.b + 26)
    })
  ] }) }) }) });
};
