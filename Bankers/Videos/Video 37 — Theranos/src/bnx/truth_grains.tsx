// @ts-nocheck
// ★ V36 "Bre-X Gold" — truth helper (builder M): THE SALTED GRAINS, dense enough to read through the glass. Rounded, river-worn
//   placer grains (bx_gold BX_GRAIN: duller and more orange than refined metal) sitting ON the core's outer skin only — each a
//   rounded, slightly irregular lens with its own contact shadow, a body lit from the key's side and a worn specular point. They are
//   laid on bx_core's skin (the core's local frame: axis y, section x/z, ±len/2) in the same way RockSkin lays its own `salted`
//   nuggets, at about thirteen times their density (bx_core's 1 per 34 units of run reads as one or two grains in the glass). Never on a
//   sawn or broken face: they are seeded on the round skin and drawn only where it faces the lens.
//   <SaltGrains rig xf len r seed on glint cull u0 u1 /> (an SVG <g>); on 0…1 (each grain has its own threshold), glint = the screen x
//   of a light crossing (−1 none), u0/u1 keep the grains off a broken end's jagged rim.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { seeded } from "./common";
import { rampAt } from "./solid_engine";
import { normalM, unit3, worldScr, worldView, xfApply } from "./tk_rig";
import { BX_GRAIN } from "./bx_gold";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const memo = new Map();
const grainsOf = (seed, len, r) => {
  const key = `${seed}|${len}|${r}`;
  if (memo.has(key)) return memo.get(key);
  const rnd = seeded(5113 * seed + 17);
  const N = Math.round(len / 2.6);
  const out = Array.from({ length: N }, () => ({
    th: rnd() * 2 * Math.PI,
    u: 0.015 + 0.97 * rnd(),
    s: 1.9 + 3.0 * Math.pow(rnd(), 1.5),
    el: 0.62 + 0.3 * rnd(),
    rot: rnd() * Math.PI,
    thr: rnd(),
    j: Array.from({ length: 12 }, () => rnd())
  }));
  memo.set(key, out);
  return out;
};
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const SaltGrains = ({ rig, xf, len, r, seed = 1, on = 1, glint = -1, cull, u0 = 0, u1 = 1 }) => {
  if (on <= 1e-3) return null;
  const map = (q) => xfApply(xf, q);
  const G = grainsOf(seed, len, r);
  const items = [];
  for (const g of G) {
    const a = clamp01((on - g.thr * 0.85) / 0.15);
    if (a <= 0.02 || g.u < u0 || g.u > u1) continue;
    const y = -len / 2 + g.u * len;
    const n = [Math.cos(g.th), 0, Math.sin(g.th)];
    const lift = g.s * 0.38;
    const c = [(r + lift) * n[0], y, (r + lift) * n[2]];
    const v = worldView(rig, map(c)), vn = normalM(map, rig, n, c);
    const f = dot(vn, unit3([-v[0], -v[1], rig.persp - v[2]]));
    if (f < 0.18) continue;
    const sc = worldScr(rig, map(c));
    if (cull && (sc[0] < cull[0] || sc[0] > cull[2] || sc[1] < cull[1] || sc[1] > cull[3])) continue;
    const pts = [];
    for (let k = 0; k < 12; k++) {
      const an = g.rot + k / 12 * 2 * Math.PI, rr = g.s * (0.9 + 0.2 * g.j[k]);
      pts.push(worldScr(rig, map([(r + lift) * Math.cos(g.th + rr * g.el * Math.sin(an) / r), y + rr * Math.cos(an), (r + lift) * Math.sin(g.th + rr * g.el * Math.sin(an) / r)])));
    }
    const rad = Math.max(...pts.map((p) => Math.hypot(p[0] - sc[0], p[1] - sc[1])));
    // the grain's light: its normal against the key (upper left); a glint where the crossing light passes it
    const lk = clamp01(0.45 + 0.55 * (-0.52 * vn[0] - 0.62 * vn[1] + 0.58 * vn[2]));
    const gl = glint < 0 ? 0 : Math.exp(-Math.pow((sc[0] - glint) / 26, 2));
    items.push({ d: `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`, x: sc[0], y: sc[1], rad, a: a * Math.min(1, f * 1.6), lk, gl, z: v[2] });
  }
  items.sort((p, q) => p.z - q.z);
  return jsx("g", { "data-probe-skip": true, children: items.map((q, k) => jsxs("g", { opacity: q.a, children: [
    jsx("path", { d: q.d, fill: "#1A1206", opacity: 0.42, transform: `translate(${f2(q.rad * 0.16)} ${f2(q.rad * 0.22)})` }),
    jsx("path", { d: q.d, fill: rampAt(BX_GRAIN, 0.32 + 0.3 * q.lk) }),
    jsx("ellipse", { cx: f2(q.x - q.rad * 0.18), cy: f2(q.y - q.rad * 0.2), rx: f2(q.rad * 0.58), ry: f2(q.rad * 0.5), fill: rampAt(BX_GRAIN, 0.62 + 0.25 * q.lk), opacity: 0.85 }),
    jsx("circle", { cx: f2(q.x - q.rad * 0.34), cy: f2(q.y - q.rad * 0.36), r: f2(Math.max(0.5, q.rad * 0.16)), fill: "#FFF3D2", opacity: 0.75 + 0.25 * q.gl }),
    q.gl > 0.05 && jsx("circle", { cx: f2(q.x - q.rad * 0.3), cy: f2(q.y - q.rad * 0.32), r: f2(q.rad * (0.5 + 0.9 * q.gl)), fill: "#FFF8E4", opacity: 0.55 * q.gl, style: { filter: `blur(${f2(1 + q.rad * 0.25)}px)` } })
  ] }, k)) });
};
