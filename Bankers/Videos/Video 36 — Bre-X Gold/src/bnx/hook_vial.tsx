// @ts-nocheck
// ★ V36 hook helper (builder H, rev 1): THE SOURCE OF THE DUST — a small clear glass sample vial of gold dust (rounded glass bottom,
//   a threaded neck, an open mouth), held tilted mouth-down above the core and tapped so the dust trickles out of its mouth; it
//   travels along the run with the sprinkle (the stream falls from its mouth), turns its mouth up as the pour ends, then slides
//   away along the run and out of the frame (by moving — never a fade). No hands. Drawn from its projected axis: the glass as a
//   lit capsule (edges catch the light, a highlight streak on the key-light side), the dust inside lying toward the mouth.
//   <HookVial rig mouth axis pour fill g />   mouth: world point of the mouth's centre; axis: unit world vector mouth → bottom
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { seeded } from "./common";
import { worldScr, worldView } from "./tk_rig";
import { BX_DUST } from "./bx_gold";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
export const VIAL = { L: 150, r: 21 };
const SPECKS = (() => {
  const r = seeded(4507);
  return Array.from({ length: 70 }, () => ({ t: r(), s: r() * 2 - 1, k: r(), z: 0.6 + 0.9 * r() }));
})();
export const HookVial = ({ rig, mouth, axis, fill = 0.5, g = 0, id = "hkV" }) => {
  const B = [mouth[0] + axis[0] * VIAL.L, mouth[1] + axis[1] * VIAL.L, mouth[2] + axis[2] * VIAL.L];
  const m = worldScr(rig, mouth), b = worldScr(rig, B);
  const km = rig.persp / Math.max(1, rig.persp - worldView(rig, mouth)[2]), kb = rig.persp / Math.max(1, rig.persp - worldView(rig, B)[2]);
  const ax = [b[0] - m[0], b[1] - m[1]], al = Math.hypot(ax[0], ax[1]) || 1, u = [ax[0] / al, ax[1] / al];
  // the perpendicular on the key light's side (the upper left) first
  let n = [-u[1], u[0]];
  if (n[0] + n[1] > 0) n = [-n[0], -n[1]];
  const wm = VIAL.r * km, wb = VIAL.r * kb;
  const at = (t, s, w0 = wm, w1 = wb) => {
    const w = w0 + (w1 - w0) * t;
    return [m[0] + ax[0] * t + n[0] * w * s, m[1] + ax[1] * t + n[1] * w * s];
  };
  // the foreshortened mouth: its depth-wise radius shrinks with how much the axis points at the lens
  const view = worldView(rig, B), vm = worldView(rig, mouth);
  const ad = [view[0] - vm[0], view[1] - vm[1], view[2] - vm[2]], adl = Math.hypot(...ad) || 1;
  const open = Math.max(0.18, Math.abs(ad[2] / adl) * 0.9 + 0.12);
  const ell = (c, rx, ry, a0 = 0, a1 = 2 * Math.PI, N = 24) => Array.from({ length: N + 1 }, (_, i) => {
    const a = a0 + (a1 - a0) * i / N;
    return [c[0] + n[0] * rx * Math.cos(a) + u[0] * ry * Math.sin(a), c[1] + n[1] * rx * Math.cos(a) + u[1] * ry * Math.sin(a)];
  });
  const P = (pts, close = true) => `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}${close ? "Z" : ""}`;
  // the body: from the mouth's rim down the walls to the rounded bottom
  const body = [at(0, 1), at(0.86, 1), ...ell(at(0.86, 0), wb, wb * 0.9, 0, Math.PI, 14).slice(1, -1).map((p) => p), at(0.86, -1), at(0, -1)];
  // a rounded bottom: the half-ellipse beyond 0.86 of the length, built on the far side
  const bottom = ell(at(0.86, 0), wb, (1 - 0.86) * al, Math.PI / 2, -Math.PI / 2, 14);
  const outline = [at(0, 1), at(0.86, 1), ...bottom.reverse(), at(0.86, -1), at(0, -1)];
  const lit = at(0.02, 1), dark = at(0.02, -1);
  const gid = `${id}G${Math.round(m[0])}`;
  // the dust inside: packed against the mouth end (it lies toward the lower end), level `fill`
  const f = clamp01(fill);
  const dust = [at(0.03, 0.8), at(0.03 + 0.8 * f, 0.8), at(0.03 + 0.8 * f, -0.8), at(0.03, -0.8)];
  const specks = SPECKS.filter((q) => q.t < f).map((q) => {
    const p = at(0.04 + 0.78 * q.t, q.s * 0.72);
    const s = q.z * 1.1 * km;
    return `M${f2(p[0] - s)},${f2(p[1])}L${f2(p[0])},${f2(p[1] - s)}L${f2(p[0] + s)},${f2(p[1])}L${f2(p[0])},${f2(p[1] + s)}Z`;
  }).join("");
  const tw = 0.5 + 0.5 * Math.sin(g * 0.7);
  // neck threads
  const threads = [0.07, 0.11, 0.15].map((t) => P([at(t, 1.04), at(t + 0.012, -1.04)], false)).join("");
  const rim = ell(m, wm * 1.05, wm * open, 0, 2 * Math.PI, 28);
  const rimIn = ell(m, wm * 0.84, wm * open * 0.8, 0, 2 * Math.PI, 28);
  return jsxs("g", { "data-probe-skip": true, children: [
    jsx("defs", { children: jsxs("linearGradient", { id: gid, gradientUnits: "userSpaceOnUse", x1: f2(lit[0]), y1: f2(lit[1]), x2: f2(dark[0]), y2: f2(dark[1]), children: [
      jsx("stop", { offset: "0", stopColor: "#E8F1FB", stopOpacity: 0.62 }),
      jsx("stop", { offset: "0.16", stopColor: "#B8D0EA", stopOpacity: 0.2 }),
      jsx("stop", { offset: "0.55", stopColor: "#9FBDE0", stopOpacity: 0.08 }),
      jsx("stop", { offset: "0.88", stopColor: "#6F93BE", stopOpacity: 0.22 }),
      jsx("stop", { offset: "1", stopColor: "#C9DCF1", stopOpacity: 0.5 })
    ] }) }),
    // the dust inside (seen through the glass), its packed face toward the bottom catching the light
    f > 0.01 && jsx("path", { d: P(dust), fill: BX_DUST[3], opacity: 0.95 }),
    f > 0.01 && jsx("path", { d: P([at(0.03 + 0.8 * f - 0.02, 0.8), at(0.03 + 0.8 * f, 0.8), at(0.03 + 0.8 * f, -0.8), at(0.03 + 0.8 * f - 0.02, -0.8)]), fill: BX_DUST[0], opacity: 0.8 }),
    f > 0.01 && jsx("path", { d: specks, fill: BX_DUST[0], opacity: 0.55 + 0.35 * tw }),
    // the glass
    jsx("path", { d: P(outline), fill: `url(#${gid})`, stroke: "#C5D8EE", strokeWidth: 1.2, strokeOpacity: 0.75 }),
    jsx("path", { d: P([at(0.05, 0.62), at(0.8, 0.62)], false), stroke: "#FFFFFF", strokeWidth: Math.max(1.2, 3.2 * km), opacity: 0.6, strokeLinecap: "round" }),
    jsx("path", { d: P([at(0.1, -0.5), at(0.74, -0.5)], false), stroke: "#FFFFFF", strokeWidth: Math.max(0.8, 1.4 * km), opacity: 0.25, strokeLinecap: "round" }),
    jsx("path", { d: threads, stroke: "#E4EEF9", strokeWidth: 1, opacity: 0.55, fill: "none" }),
    // the mouth's lip: a thick glass rim
    jsx("path", { d: P(rim), fill: "none", stroke: "#DDE9F6", strokeWidth: Math.max(1.4, 3 * km), opacity: 0.85 }),
    jsx("path", { d: P(rimIn), fill: "none", stroke: "#7E9EC4", strokeWidth: 1, opacity: 0.5 })
  ] });
};
