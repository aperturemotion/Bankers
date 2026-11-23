// @ts-nocheck
// ★ V36 hook helper (builder H): THE GOLD-DUST STREAM — a fine stream of gold dust falling from above the frame onto the drill core,
//   its source travelling along the core (the sprinkle), every grain on a true gravity fall (10.9 units/f² ≈ 9.8 m/s² at 1 unit
//   ≈ 1 mm), a little spread as it falls, a short velocity streak, a spark where it lands; plus the settled dust: a fine gold ridge
//   along the core's top from where the sprinkle began to where it has reached. Deterministic in the frame.
//   <HookDust rig map len r src={(g) => u} emit={{ a, b }} height seed g />   map: the core's local → world (axis y, up = local +X)
//   dustFront(src, emit, g) → [u0, u1]: the stretch of the core the dust has landed on by frame g (for the core's glitter)
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { seeded } from "./common";
import { worldScr, worldView } from "./tk_rig";
import { BX_DUST } from "./bx_gold";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
export const DUST_G = 10.9;
const RATE = 24;
export const fallFrames = (height) => Math.sqrt(2 * height / DUST_G);
export const dustFront = (src, emit, g, height) => {
  const T = fallFrames(height);
  return [src(emit.a), src(Math.min(emit.b, g - T))];
};
const pMemo = new Map();
const grains = (seed, n) => {
  const key = `${seed}|${n}`;
  if (pMemo.has(key)) return pMemo.get(key);
  const rnd = seeded(5099 * seed + 17);
  const out = Array.from({ length: n }, () => ({ jx: rnd() - 0.5, jz: rnd() - 0.5, sp: 0.3 + rnd(), r: 0.45 + 0.75 * rnd(), c: Math.floor(rnd() * 4.99), ph: rnd() * 6.28, bounce: rnd() < 0.14, bx: rnd() - 0.5, bz: rnd() - 0.5, v0: rnd() * 1.6 }));
  pMemo.set(key, out);
  return out;
};
export const HookDust = ({ rig, map, len, r, src, emit, height = 2000, seed = 1, g }) => {
  const T = fallFrames(height);
  const n = Math.ceil((emit.b - emit.a) * RATE) + 1;
  const G = grains(seed, n);
  const yAt = (u) => -len / 2 + u * len;
  // the core's local frame: +X is up. A grain falls along −X from x = r + height.
  const P = (x, u, z) => worldScr(rig, map([x, yAt(u), z]));
  const k = (x, u, z) => {
    const v = worldView(rig, map([x, yAt(u), z]));
    return rig.persp / Math.max(1, rig.persp - v[2]);
  };
  const streaks = [], dots = [], sparks = [];
  for (let i = 0; i < n; i++) {
    const t0 = emit.a + i / RATE;
    const tau = g - t0;
    if (tau < 0 || t0 > emit.b) continue;
    const p = G[i];
    const u = src(t0) + p.jx * 0.02 * (0.35 + 0.9 * tau / T);
    const z = p.jz * 26 * (0.3 + tau / T);
    const fallen = p.v0 * tau + 0.5 * DUST_G * tau * tau;
    const fade = clamp01(tau / 5);
    if (fallen < height) {
      const x = r + height - fallen;
      const vel = p.v0 + DUST_G * tau;
      const a = P(x, u, z), b = P(x + Math.min(16, vel * 0.32), u, z);
      const s = k(x, u, z);
      const tw = Math.sin(p.ph + g * 0.9) ** 2;
      streaks.push({ d: `M${f2(b[0])},${f2(b[1])}L${f2(a[0])},${f2(a[1])}`, w: p.r * s * 1.4, c: p.c, op: fade * (0.35 + 0.4 * tw) });
      dots.push({ x: a[0], y: a[1], r: p.r * s * (0.8 + 0.5 * tw), c: tw > 0.85 ? 0 : p.c, op: fade * (0.6 + 0.4 * tw) });
    } else {
      // landed: a spark, a few grains hop off the round top and settle
      const tl = tau - T;
      if (tl < 7) {
        const q = P(r + 1, u, z);
        sparks.push({ x: q[0], y: q[1], a: Math.max(0, 1 - tl / 7), s: k(r, u, z) });
      }
      if (p.bounce && tl < 9) {
        const h = 22 * (tl / 9) * (1 - tl / 9) * 4;
        const q = P(r + 1 + h, u + p.bx * 0.01 * tl / 9, z + p.bz * 18 * tl / 9);
        dots.push({ x: q[0], y: q[1], r: p.r * 0.7 * k(r, u, z), c: p.c, op: 1 - tl / 9 });
      }
    }
  }
  return jsxs("g", { "data-probe-skip": true, children: [
    [0, 1, 2, 3, 4].map((c) => {
      const s = streaks.filter((q) => q.c === c);
      return s.length ? jsx("g", { children: s.map((q, i) => jsx("path", { d: q.d, stroke: BX_DUST[c], strokeWidth: f2(Math.max(0.8, q.w)), opacity: f2(q.op * 0.75), strokeLinecap: "round", fill: "none" }, i)) }, `s${c}`) : null;
    }),
    dots.map((q, i) => jsx("circle", { cx: f2(q.x), cy: f2(q.y), r: f2(Math.max(0.7, q.r)), fill: BX_DUST[q.c], opacity: f2(q.op) }, `d${i}`)),
    sparks.map((q, i) => jsxs("g", { opacity: f2(q.a), children: [
      jsx("circle", { cx: f2(q.x), cy: f2(q.y), r: f2(5 * q.s), fill: BX_DUST[1], opacity: 0.25 }),
      jsx("circle", { cx: f2(q.x), cy: f2(q.y), r: f2(1.6 * q.s), fill: "#FFF8DE" })
    ] }, `k${i}`))
  ] });
};
// the settled dust: a fine gold ridge along the top of the core over [u0, u1], feathered at its leading edge
export const DustRidge = ({ rig, map, len, r, span, op = 1, seed = 1 }) => {
  const [u0, u1] = span;
  if (u1 <= u0 + 1e-3 || op <= 1e-3) return null;
  const rnd = seeded(811 * seed + 3);
  const yAt = (u) => -len / 2 + u * len;
  const sk = (th, u) => worldScr(rig, map([(r + 0.6) * Math.cos(th), yAt(u), (r + 0.6) * Math.sin(th)]));
  const N = 40, w = 0.42;
  const top = [], bot = [];
  for (let i = 0; i <= N; i++) {
    const u = u0 + (u1 - u0) * i / N;
    const feather = clamp01((u1 - u) / 0.05);
    const ww = w * (0.35 + 0.65 * feather);
    top.push(sk(-ww, u));
    bot.push(sk(ww, u));
  }
  const band = `M${[...top, ...bot.reverse()].map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`;
  const specks = [];
  // fixed specks over the whole length (stable frame to frame); those inside the span show
  const n = Math.round(len * 0.9);
  for (let i = 0; i < n; i++) {
    const u = rnd(), th = (rnd() - 0.5) * 2 * w * Math.pow(rnd(), 0.6);
    if (u < u0 || u > u1 - 0.05 * rnd()) continue;
    const p = sk(th, u);
    specks.push(`M${f2(p[0] - 1)},${f2(p[1])}L${f2(p[0])},${f2(p[1] - 0.9)}L${f2(p[0] + 1)},${f2(p[1])}L${f2(p[0])},${f2(p[1] + 0.9)}Z`);
  }
  return jsxs("g", { "data-probe-skip": true, opacity: op, children: [
    jsx("path", { d: band, fill: BX_DUST[2], opacity: 0.22 }),
    jsx("path", { d: specks.join(""), fill: BX_DUST[0], opacity: 0.85 })
  ] });
};
