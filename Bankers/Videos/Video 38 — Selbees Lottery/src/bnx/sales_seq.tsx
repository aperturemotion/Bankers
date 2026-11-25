// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rOut } from "./anim";
import { PlaceRoot, useOwn } from "./shot";
import { CamFn } from "./s3";
import { seeded, travelling } from "./common";
import { SENTENCES, WORDS } from "./captions";
import { SALES_2008_B, SALES_2024_B } from "./data_lt";
import { L, fyLabel, usdB1 } from "./data";
import { Turn, figure, label } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { mapPath, worldScr, xfMul } from "./tk_rig";
import { INK } from "./tk_mat";
import { tkRig } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { RAIL, RAIL_TOP, SL_BASE, SlRail, railCorners } from "./sales_stack";
import { CB, CB_DEPTH, CB_SLOT, CashBody, CashContact, CashDrop, CashTopPlanes, cashFace, cashXf } from "./sales_cash";

const SALES_RIG = tkRig({ eye: 1300 });
const R = SALES_RIG;
const SL_PXB = 7;
const COL = { x08: 340, x24: 740 };
const N08 = 17, N24 = 34;
const H08 = SALES_2008_B * SL_PXB, H24 = SALES_2024_B * SL_PXB;
const T08 = H08 / N08, T24 = H24 / N24;
if (Math.abs(T08 / T24 - 1) > 0.012) throw new Error("sales_seq: the two columns' bundles must read as one bundle");
const KH08 = T08 / CB.H, KH24 = T24 / CB.H;
const norm = (x) => x.toLowerCase().replace(/[^a-z0-9$%&]/g, "");
const sen0 = (scene) => SENTENCES.filter((x) => x.scene === scene)[0];
const inSen = (scene, word, occ = 1) => {
  const s0 = sen0(scene), hits = WORDS.filter((x) => x.at >= s0.at && x.at <= s0.end && norm(x.word) === norm(word));
  if (hits.length < occ) throw new Error(`sales_seq: "${word}" not in ${scene}`);
  return hits[occ - 1].at;
};
export const SALES_W = {
  sales: { s0: sen0("sales").at, census: inSen("sales", "Census"), data: inSen("sales", "data"), fiscal: inSen("sales", "fiscal"), k2024: inSen("sales", "2024") },
  sales2: {
    s0: sen0("sales2").at,
    sales: inSen("sales2", "sales"),
    nearly: inSen("sales2", "nearly"),
    doubled: inSen("sales2", "doubled"),
    k528: inSen("sales2", "$52.8"),
    billion: inSen("sales2", "billion"),
    k2008: inSen("sales2", "2008")
  }
};
export const SALES_SPAN = { at: sen0("sales").at, end: sen0("prizes").at };
export const salesCheck = (place, w) => {
  for (const k of Object.keys(SALES_W[place])) if (Number.isFinite(w[k]) && w[k] !== SALES_W[place][k]) throw new Error(`sales run: ${place}.${k} is ${w[k]} in Composition but ${SALES_W[place][k]} in the run`);
};
const prof = (x) => {
  const c = clamp01(x);
  return 0.4 * c + 0.6 * c * c * (3 - 2 * c);
};
const profInv = (y) => {
  let a = 0, b = 1;
  for (let i = 0; i < 40; i++) {
    const m = (a + b) / 2;
    if (prof(m) < y) a = m;
    else b = m;
  }
  return (a + b) / 2;
};
export const salesRunTimes = (w, span) => {
  const s = w.sales, s2 = w.sales2;
  const NB = 2 * N24;
  const build = { a: span.at + 38, b: s2.doubled - 12 };
  const land = Array.from({ length: NB }, (_, i) => build.a + (build.b - build.a) * profInv((i + 1) / NB));
  const pass = land.findIndex((_, i) => i % 2 === 1 && (Math.floor(i / 2) + 1) * T24 > H08 + 0.5);
  const t = {
    w,
    span,
    build,
    land,
    pass,
    fy24: { a: s.k2024 - 10, b: s.k2024 },
    // FY2024 ON "2024"
    level: { a: land[pass] - 3, b: land[pass] + 11 },
    // the FY2008 level line runs across
    top24: { a: build.b + 1, b: build.b + 11 },
    // $104.7B as it tops out
    doubled: { a: s2.doubled - 10, b: s2.doubled },
    // NEARLY DOUBLED ON "doubled"
    k528: { a: s2.k528 - 10, b: s2.k528 },
    // FY2008 · $52.8B ON "$52.8"
    rideIn: { a: build.a + 2, dur: 40 },
    // the camera closes on the build…
    ride: { a: build.a + 26, b: build.b + 3 },
    // …and rides its top up
    back: { a: s2.doubled - 5, dur: 36 }
    // the pull-back to hold both
  };
  if (t.back.a + t.back.dur > s2.k528 + 8) throw new Error('sales run: the pull-back must have FY2008 in frame on "$52.8"');
  if (t.top24.b > s2.doubled) throw new Error('sales run: $104.7B must be up by "doubled"');
  return t;
};
const bundlesOf = (courses, seed) => {
  const r = seeded(seed);
  return Array.from({ length: 2 * courses }, (_, i) => {
    const c = Math.floor(i / 2);
    return {
      dx: (r() - 0.5) * 5,
      dz: (r() - 0.5) * 3,
      yaw: (r() - 0.5) * 1.1,
      dim: 0.06 + 0.1 * r() + 0.22 * (1 - c / Math.max(1, courses - 1)) * 0.5,
      sheen: 0.15 + 0.35 * r(),
      // the drop: its yaw and tilt in the air, levelling as it lands (the first draw was rev 2's skid, kept so every rest pose is the same)
      turn: (r(), (r() - 0.5) * 2.2),
      tx: (r() - 0.5) * 6,
      tz: (r() - 0.5) * 6,
      seed: seed * 10 + i
    };
  });
};
const B08 = bundlesOf(N08, 2008), B24 = bundlesOf(N24, 2024);
const slotZ = (i) => i % 2 === 1 ? CB_SLOT : -CB_SLOT;
const POSES08 = B08.map((b, i) => cashXf([COL.x08 + b.dx, SL_BASE - (Math.floor(i / 2) + 0.5) * T08, slotZ(i) + b.dz], b.yaw, KH08));
const h24 = (t, g) => H24 * prof((g - t.build.a + 1) / (t.build.b - t.build.a + 1));
const top24 = (t, g) => SL_BASE - h24(t, g);
const at = (x, y, z = 0) => {
  const p = worldScr(R, [x, y, z]);
  return { x: p[0], y: p[1] };
};
const shots = (t) => [
  // out of the flare: the rail, the FY2008 column standing and the empty FY2024 plate
  { a: -9999, z: 1.12, push: 0.02, at: () => at(570, 1010) },
  // close on the build, then RIDE its top up past FY2008 to $104.7B
  { a: t.rideIn.a, dur: t.rideIn.dur, z: 1.42, push: 0, ride: t.ride, at: (g) => at(COL.x24 - 150, Math.min(1050, top24(t, g) + 185)) },
  // back, to hold both columns on their one scale
  { a: t.back.a, dur: t.back.dur, z: 0.95, push: 0.03, at: () => at(565, 862) }
];
export const salesRunCamWindows = (t) => actionCamWindows(shots(t));
const DROP = { fly: 12, h: 100, fade: 3, s0: 0.97 };
const bounce = (u) => u <= 0 ? 0 : 2 * Math.exp(-u / 2.4) * Math.abs(Math.sin(Math.PI * u / 3.2));
const scaled = (x, s) => s === 1 ? x : xfMul(x, { m: [s, 0, 0, 0, s, 0, 0, 0, s], t: [0, 0, 0] });
const poses24 = (t, g) => {
  const out = [];
  const tops = [];
  tops[0] = tops[1] = SL_BASE;
  for (let i = 0; i < 2 * N24; i++) {
    const b = B24[i], T = t.land[i], sl = i % 2;
    if (g < T - DROP.fly) break;
    const rest = tops[sl] - T24 / 2;
    const x = COL.x24 + b.dx, z = slotZ(i) + b.dz;
    let y, yaw = b.yaw, tx = 0, tz = 0, s = 1, op = 1;
    const landed = g >= T;
    if (!landed) {
      const tau = T - g, q = tau / DROP.fly, age = DROP.fly - tau;
      const restFinal = SL_BASE - (Math.floor(i / 2) + 0.5) * T24;
      y = restFinal - DROP.h * q * q;
      yaw += b.turn * q;
      tx = b.tx * q * q;
      tz = b.tz * q * q;
      const fin = rOut(age, 0, DROP.fade);
      op = fin;
      s = DROP.s0 + (1 - DROP.s0) * fin;
    } else {
      y = rest - bounce(g - T);
    }
    y = Math.min(y, rest);
    out.push({ i, x: scaled(cashXf([x, y, z], yaw, KH24, tx, tz), s), landed, y, T, op });
    tops[sl] = y - T24 / 2;
  }
  return out;
};
export const salesRunSfx = (t, a, b) => [
  { job: "process", a: t.build.a - 4, b: SALES_W.sales2.s0 + 1, k: "io", vol: 0.55 },
  // the bundles thudding onto the plate (chain)…
  { job: "process", a: SALES_W.sales2.s0 - 5, b: t.build.b + 2, k: "io", vol: 0.6 },
  // …quickening up past FY2008
  { job: "label", a: t.fy24.a, b: t.fy24.b + 6, vol: 0.4 },
  { job: "label", a: t.level.a, b: t.level.b, vol: 0.3 },
  { job: "land", a: t.build.b - 6, b: t.build.b + 1, vol: 0.45 },
  // the column tops out
  { job: "label", a: t.top24.a, b: t.doubled.b + 6, vol: 0.5 },
  // $104.7B · NEARLY DOUBLED
  { job: "label", a: t.k528.a, b: t.k528.b + 6, vol: 0.45 }
  // FY2008 · $52.8B
].filter((e) => (e.a + e.b) / 2 >= a && (e.a + e.b) / 2 < b);
const TopLabel = ({ x, y, on, fig, sub, subOn = 0, probe }) => {
  if (on <= 3e-3 && subOn <= 3e-3) return null;
  const Wd = 420;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    sub && subOn > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-label": probe, style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: Wd,
      textAlign: "center",
      transform: `translate(${(x - Wd / 2).toFixed(2)}px, ${(y - 135 + 12 * (1 - subOn)).toFixed(2)}px)`,
      opacity: clamp01(subOn),
      ...label(27, INK)
    }, children: sub }),
    on > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-label": probe, style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: Wd,
      textAlign: "center",
      transform: `translate(${(x - Wd / 2).toFixed(2)}px, ${(y - 98 + 12 * (1 - on)).toFixed(2)}px)`,
      opacity: clamp01(on),
      ...figure(74)
    }, children: fig })
  ] });
};
const SETTLE = 9;
const Bundle = ({ id, x, under, b, kh, face }) => /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
  under && /* @__PURE__ */ (0,jsx_runtime.jsx)(CashContact, { id: `${id}k`, rig: R, upper: x, lower: under }),
  /* @__PURE__ */ (0,jsx_runtime.jsx)(CashBody, { id, rig: R, x, seed: b.seed, dim: b.dim }),
  face && /* @__PURE__ */ (0,jsx_runtime.jsx)(CashTopPlanes, { rig: R, x, kh, sheen: b.sheen, shade: 0.04 })
] });
const SalesRun = ({ t, place }) => {
  const f = (0,esm.useCurrentFrame)();
  const id = `sl${place}`;
  const p24 = poses24(t, f);
  const landed = p24.filter((p) => p.landed);
  const flying = p24.filter((p) => !p.landed).sort((p, q) => p.i % 2 - q.i % 2 || p.i - q.i);
  const nC = Math.floor(landed.length / 2);
  const covered24 = (i) => {
    const up = landed.find((p) => p.i === i + 2);
    return !!up && f - up.T >= SETTLE && Math.floor(i / 2) < nC - 2;
  };
  const col08 = [0, 1].flatMap((k) => [...cashFace(POSES08[k], false), ...cashFace(POSES08[2 * N08 - 2 + k], true)]);
  const topL = landed.length ? landed.slice(-Math.min(2, landed.length)) : [];
  const col24 = topL.length ? [...landed.slice(0, 2).flatMap((p) => cashFace(p.x, false)), ...topL.flatMap((p) => cashFace(p.x, true))] : [];
  const throwTo = (pts, y) => pts.flatMap(([x, yy, z]) => {
    const d = Math.max(0, y - yy);
    return [[x, y, z], [x + 0.5 * d, y, z - 0.62 * d]];
  });
  const casters = [{ corners: railCorners() }, { corners: col08 }, ...col24.length ? [{ corners: col24 }] : []];
  const shades = [throwTo(col08, RAIL_TOP), ...col24.length ? [throwTo(col24, RAIL_TOP)] : []];
  const prints = [
    { key: "fy2008", text: fyLabel(2008), u: COL.x08, on: rOut(f, t.k528.a, t.k528.b) },
    { key: "fy2024", text: fyLabel(2024), u: COL.x24, on: rOut(f, t.fy24.a, t.fy24.b) }
  ];
  const lv = rOut(f, t.level.a, t.level.b), yL = SL_BASE - H08;
  const lA = [COL.x08 + CB.W / 2 + 8, yL, CB_DEPTH / 2], lB = [COL.x24 - CB.W / 2 - 6, yL, CB_DEPTH / 2];
  const lEnd = [lA[0] + (lB[0] - lA[0]) * lv, yL, CB_DEPTH / 2];
  const lvD = mapPath((q) => q, R, [lA, lEnd], false);
  const tickD = mapPath((q) => q, R, [[lB[0], yL - 9, lB[2]], [lB[0], yL + 9, lB[2]]], false);
  const a24 = worldScr(R, [COL.x24, SL_BASE - H24, -CB_DEPTH / 2]), a08 = worldScr(R, [COL.x08, SL_BASE - H08, -CB_DEPTH / 2]);
  const surfOf = (i) => {
    const under = landed.find((p) => p.i === i - 2);
    if (!under && i >= 2) return null;
    if (under) return { y: Math.min(...cashFace(under.x, true).map((q) => q[1])), clip: cashFace(under.x, true) };
    const z0 = slotZ(i) - CB.D / 2 - 6, z1 = slotZ(i) + CB.D / 2 + 6;
    return { y: SL_BASE, clip: [[COL.x24 - RAIL.padW / 2, SL_BASE, z0], [COL.x24 + RAIL.padW / 2, SL_BASE, z0], [COL.x24 + RAIL.padW / 2, SL_BASE, z1], [COL.x24 - RAIL.padW / 2, SL_BASE, z1]] };
  };
  const cam = actionCam(shots(t));
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceRoot, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CamFn, { at: cam, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-leaving": travelling(f, salesRunCamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)(Turn, { at: t.span.at, end: t.span.end, from: -6, to: 4, amp: 0.9, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TkFloor, { id: `${id}F`, rig: R, at: { x: 560, z: -40 }, reach: 1500, casters }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(SlRail, { id: `${id}R`, rig: R, pads: [COL.x08, COL.x24], prints, shades }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe-object": "the FY2024 stack of cash", style: { position: "absolute", inset: 0 }, children: [
      landed.map((p) => {
        const u = landed.find((q) => q.i === p.i - 2);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)(Bundle, { id: `${id}b${p.i}`, x: p.x, under: u == null ? void 0 : u.x, b: B24[p.i], kh: KH24, face: !covered24(p.i) }, `b${p.i}`);
      }),
      flying.map((p) => {
        const s = surfOf(p.i);
        return p.op <= 3e-3 ? null : /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "absolute", inset: 0, opacity: p.op < 1 ? p.op : void 0 }, children: [
          s && /* @__PURE__ */ (0,jsx_runtime.jsx)(CashDrop, { id: `${id}d${p.i}`, rig: R, x: p.x, y: s.y, clip: s.clip }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)(Bundle, { id: `${id}b${p.i}`, x: p.x, b: B24[p.i], kh: KH24, face: true })
        ] }, `b${p.i}`);
      })
    ] }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-object": "the FY2008 stack of cash", style: { position: "absolute", inset: 0 }, children: POSES08.map((x, i) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Bundle, { id: `${id}a${i}`, x, under: i >= 2 ? POSES08[i - 2] : void 0, b: B08[i], kh: KH08, face: Math.floor(i / 2) >= N08 - 2 }, `a${i}`)) }),
    lv > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: lvD, stroke: INK, strokeWidth: 2.4, strokeDasharray: "9 7", opacity: 0.62, fill: "none", strokeLinecap: "round" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: tickD, stroke: INK, strokeWidth: 2.4, opacity: 0.7 * clamp01((lv - 0.85) / 0.15), fill: "none", strokeLinecap: "round" })
    ] }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TopLabel, { x: a24[0], y: a24[1], on: rOut(f, t.top24.a, t.top24.b), fig: usdB1(SALES_2024_B), sub: L("nearlyDoubled"), subOn: rOut(f, t.doubled.a, t.doubled.b), probe: "FY2024's figure" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TopLabel, { x: a08[0], y: a08[1], on: rOut(f, t.k528.a, t.k528.b), fig: usdB1(SALES_2008_B), probe: "FY2008's figure" })
  ] }) }) }) });
};
export const SalesPlace = ({ t, place, at: at2, end }) => {
  const f = (0,esm.useCurrentFrame)();
  const own = useOwn();
  if (own.ownEnter && f < at2) return null;
  if (own.ownExit && f >= end) return null;
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(SalesRun, { t, place });
};
const salesTrace = (g) => {
  const t = salesRunTimes(SALES_W, SALES_SPAN), c = actionCam(shots(t))(g), p = poses24(t, g);
  return { z: +c.z.toFixed(3), landed: p.filter((q) => q.landed).length, flying: p.filter((q) => !q.landed).length, h: +h24(t, g).toFixed(1), y: p.map((q) => +q.y.toFixed(1)) };
};
const salesTimesDump = () => salesRunTimes(SALES_W, SALES_SPAN);
