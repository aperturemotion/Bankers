// @ts-nocheck
// ★ V36 hype helper (builder H, rev 1b): "Pension funds piled in." — MONEY PILING IN at the foot of the C$6B bar's pedestal: coins
//   (the house's blue-steel coin, V35 pie_mat COIN) dropping one after another onto six growing stacks on the floor around the
//   pedestal, each falling a short way with true gravity and easing in over its first 8 frames (V35's cents), seating with a tiny
//   settle. Deterministic in the frame. A coin lies flat: a thick disc (its reeded edge lit on the left, its face lit from above).
//   <HypeCoins rig pose g plan />   plan = coinPlan(a, b): every coin's stack, level and landing frame, first landing a, last b
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { rampAt } from "./solid_engine";
import { worldScr, worldView, xfApply } from "./tk_rig";
import { COIN, RELIEF_HI, RELIEF_LO } from "./pie_mat";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
export const COIN_HC = { r: 52, t: 13.5 };
// the stacks, in the pedestal's frame (its foot centre at the origin, floor y = 0, front +z): beside and in front of its foot
export const STACKS = [
  { x: -450, z: 30, n: 15 },
  { x: -510, z: 200, n: 10 },
  { x: -365, z: 285, n: 17 },
  { x: 365, z: 280, n: 14 },
  { x: 510, z: 195, n: 11 },
  { x: 450, z: 25, n: 18 }
];
const DROP = 300, G = 10.9, FADE = 8;
const FALL = Math.sqrt(2 * DROP / G);
// landing frames: the stacks fill together, round-robin, the next coin on each stack after the one below it has landed
export const coinPlan = (a, b) => {
  const total = STACKS.reduce((s, q) => s + q.n, 0), out = [];
  const levels = STACKS.map(() => 0);
  let k = 0;
  while (out.length < total) {
    const s = k % STACKS.length;
    k++;
    if (levels[s] >= STACKS[s].n) continue;
    out.push({ s, lvl: levels[s]++ });
  }
  // a quick start that keeps pouring: landing frame for the i-th coin on an eased schedule
  return out.map((c, i) => ({ ...c, land: a + (b - a) * Math.pow(i / Math.max(1, total - 1), 0.85) }));
};
export const coinsDone = (plan) => plan[plan.length - 1].land;
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
const N = 24;
const Coin = ({ rig, pose, x, y, z, op, sp, gid }) => {
  const { r, t } = COIN_HC;
  const W = (q) => worldScr(rig, xfApply(pose, q));
  const rim = (yy) => Array.from({ length: N }, (_, i) => {
    const a = i / N * 2 * Math.PI;
    return W([x + r * Math.cos(a), yy, z + r * Math.sin(a)]);
  });
  const top = rim(y - t), bot = rim(y);
  const P = (pts) => `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`;
  const body = hull([...top, ...bot]);
  // reeding: short lines on the front half of the edge
  const reed = Array.from({ length: 18 }, (_, i) => {
    const a = 0.15 * Math.PI + i / 17 * 0.7 * Math.PI;
    const p0 = W([x + r * Math.cos(a), y - 1.2, z + r * Math.sin(a)]), p1 = W([x + r * Math.cos(a), y - t + 1.2, z + r * Math.sin(a)]);
    return `M${f2(p0[0])},${f2(p0[1])}L${f2(p1[0])},${f2(p1[1])}`;
  }).join("");
  const inner = Array.from({ length: N }, (_, i) => {
    const a = i / N * 2 * Math.PI;
    return W([x + r * 0.82 * Math.cos(a), y - t - 0.2, z + r * 0.82 * Math.sin(a)]);
  });
  return jsxs("g", { opacity: op < 1 ? f2(op) : void 0, children: [
    jsx("path", { d: P(body), fill: `url(#${gid})` }),
    jsx("path", { d: reed, stroke: RELIEF_LO, strokeWidth: 0.8, opacity: 0.45 }),
    jsx("path", { d: P(top), fill: rampAt(COIN, 0.74 + 0.08 * sp) }),
    jsx("path", { d: P(inner), fill: "none", stroke: RELIEF_LO, strokeWidth: 1.1, opacity: 0.45 }),
    jsx("path", { d: P(inner), fill: "none", stroke: RELIEF_HI, strokeWidth: 0.7, opacity: 0.35, transform: "translate(-0.6 -0.8)" }),
    jsx("path", { d: P(top), fill: "none", stroke: RELIEF_HI, strokeWidth: 0.9, opacity: 0.55 })
  ] });
};
export const HypeCoins = ({ rig, pose, g, plan, id = "hyC" }) => {
  // the stacks' order, back to front (far first)
  const order = STACKS.map((s, i) => ({ i, d: worldView(rig, xfApply(pose, [s.x, 0, s.z]))[2] })).sort((a, b) => a.d - b.d).map((q) => q.i);
  const els = [], defs = [];
  for (const si of order) {
    const S = STACKS[si];
    const a = worldScr(rig, xfApply(pose, [S.x - COIN_HC.r, 0, S.z])), b = worldScr(rig, xfApply(pose, [S.x + COIN_HC.r, 0, S.z]));
    const gid = `${id}S${si}`;
    defs.push(jsxs("linearGradient", { id: gid, gradientUnits: "userSpaceOnUse", x1: f2(a[0]), y1: f2(a[1]), x2: f2(b[0]), y2: f2(b[1]), children: [
      jsx("stop", { offset: "0", stopColor: rampAt(COIN, 0.82) }),
      jsx("stop", { offset: "0.35", stopColor: rampAt(COIN, 0.6) }),
      jsx("stop", { offset: "0.8", stopColor: rampAt(COIN, 0.34) }),
      jsx("stop", { offset: "1", stopColor: rampAt(COIN, 0.22) })
    ] }, gid));
    // its contact shadow on the floor once the first coin is down
    const first = plan.find((c) => c.s === si && c.lvl === 0);
    const sh = clamp01((g - first.land + 2) / 6);
    if (sh > 0) {
      const ring = Array.from({ length: 20 }, (_, i) => {
        const an = i / 20 * 2 * Math.PI;
        return worldScr(rig, xfApply(pose, [S.x + 6 + COIN_HC.r * 1.15 * Math.cos(an), -0.3, S.z - 8 + COIN_HC.r * 1.15 * Math.sin(an)]));
      });
      els.push(jsx("path", { d: `M${ring.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`, fill: "#000000", opacity: f2(0.35 * sh), style: { filter: "blur(4px)" } }, `sh${si}`));
    }
    for (const c of plan.filter((q) => q.s === si).sort((p, q) => p.lvl - q.lvl)) {
      const t0 = c.land - FALL;
      if (g < t0) continue;
      const tau = g - t0;
      const rest = -c.lvl * COIN_HC.t;
      // the fall (gravity), then a 1-unit settle after the landing
      const y = tau < FALL ? rest - (DROP - 0.5 * G * tau * tau) : rest - 1.2 * Math.max(0, Math.sin(Math.PI * clamp01((g - c.land) / 4)));
      const op = clamp01(tau / FADE);
      els.push(jsx(Coin, { rig, pose, x: S.x, y, z: S.z, op: op * op * (3 - 2 * op), sp: (c.lvl % 3) / 3, gid }, `c${si}_${c.lvl}`));
    }
  }
  return jsxs("g", { children: [jsx("defs", { children: defs }), ...els] });
};
