// @ts-nocheck
// Video 36 "Bre-X Gold" — PALM TREES around the Busang pad (builder B, REV1 2026-11-23: "add palm trees … Borneo, Indonesia …
//   aesthetically placed … the proportions followed"). A real coconut/oil palm: a slender trunk that leans and curves, ringed by
//   its old leaf scars, a crown of long pinnate fronds (a rachis that rises then droops, leaflets either side), a nut cluster under
//   the crown. Built in the house look: solids and leaf paths shaded from the ONE key light (upper left), the palette's blue
//   family (no green — the palm reads by its shape). The crown sways slowly (moving from the first frame). Trunks paint before
//   crowns (layers): a depth sort between a trunk segment and a hanging frond flipped mid-move and blipped (popscan).
import * as jsx_runtime from "react/jsx-runtime";
import { rampAt } from "./solid_engine";
import { mapScr, worldScr, worldView } from "./tk_rig";
import { PaintParts, add3, bez3, centroid, cylAB, f2, mul3, part, rnd, sub3 } from "./claim_kit";
import { PALM_BARK, PALM_FROND } from "./claim_mat";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs;
const norm = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const KEY_W = norm([-0.55, -0.7, 0.45]);
/** one palm: base = world point on the floor, h = its height (world px), lean = [dx, dz] direction and amount (0…0.5), seed */
export const palmParts = (id, base, h, lean, seed, f) => {
  const r = rnd(seed);
  const top = add3(base, [lean[0] * h, -h, lean[1] * h]);
  const spine = bez3(base, add3(base, [lean[0] * h * 0.05, -h * 0.38, lean[1] * h * 0.05]), add3(base, [lean[0] * h * 0.55, -h * 0.74, lean[1] * h * 0.55]), top, 16);
  const R0 = h * 0.03, R1 = h * 0.019;
  const ps = [];
  // the trunk: ringed segments, each a short cylinder a touch apart in tone (the leaf scars), a swollen root flare at its foot
  ps.push(part(cylAB(add3(base, [0, 2, 0]), add3(base, [0, -h * 0.03, 0]), R0 * 1.35, 14), PALM_BARK, { key: `${id}foot`, spec: 0.1, bias: -1, layer: 0 }));
  for (let i = 0; i < 16; i++) {
    const rr = R0 + (R1 - R0) * (i / 15);
    ps.push(part(cylAB(spine[i], spine[i + 1], rr, 12), PALM_BARK, { key: `${id}t${i}`, spec: 0.15, lift: i % 2 ? 0.05 : -0.02, bias: -1, layer: 0 }));
  }
  // the crown: fronds radiating from the top, each rising then drooping; the crown sways
  const NF = 12, L = h * 0.5;
  const sway = 0.06 * Math.sin(f / 70 + seed) + 0.03 * Math.sin(f / 31 + seed * 2);
  for (let i = 0; i < NF; i++) {
    const th = (i / NF) * 2 * Math.PI + r() * 0.4 + sway, el = 0.05 + 0.35 * r(), len = L * (0.8 + 0.3 * r());
    const dir = [Math.cos(th), 0, Math.sin(th)];
    const up = [0, -1, 0];
    const p0 = top, p1 = add3(top, add3(mul3(dir, len * 0.28), mul3(up, len * (0.18 + el * 0.3))));
    const p2 = add3(top, add3(mul3(dir, len * 0.62), mul3(up, len * (0.1 + el * 0.2))));
    const p3 = add3(top, add3(mul3(dir, len * 0.92), mul3(up, -len * (0.32 - el * 0.25))));
    const rach = bez3(p0, p1, p2, p3, 20);
    const mid = rach[10];
    ps.push({
      key: `${id}f${i}`,
      c: mid,
      bias: 2,
      layer: 1,
      after: (map, rig) => frondPaths(map, rig, rach, dir, len, seed * 31 + i)
    });
  }
  // the nut cluster just under the crown
  ps.push({ key: `${id}nuts`, c: add3(top, [0, h * 0.03, 0]), bias: 1, layer: 1, after: (map, rig) => /* @__PURE__ */ jsx("g", { children: [[-1, 0.4], [1, 0.5], [0.2, -0.9]].map(([a, b], k) => {
    const q = worldScr(rig, map(add3(top, [a * R1 * 1.5, h * 0.035, b * R1 * 1.5]))), rr = R1 * 0.85 * Math.abs(q[1] - worldScr(rig, map(add3(top, [0, h * 0.035 + R1, 0])))[1]) / R1 + 2;
    return /* @__PURE__ */ jsx("circle", { cx: f2(q[0]), cy: f2(q[1]), r: f2(Math.max(2, R1 * 0.7)), fill: rampAt(PALM_BARK, 0.35 + 0.1 * k) }, k);
  }) }) });
  return ps;
};
const frondPaths = (map, rig, rach, dir, len, seed) => {
  const r = rnd(seed);
  let lit = "", dark = "";
  const P = (q) => {
    const s = worldScr(rig, map(q));
    return `${f2(s[0])},${f2(s[1])}`;
  };
  for (let k = 2; k < rach.length - 1; k++) {
    const s = k / (rach.length - 1), tan = norm(sub3(rach[k + 1], rach[k - 1]));
    const side = norm(cross(tan, [0, -1, 0]));
    const ll = len * 0.26 * Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.1)), 0.7) * (0.85 + 0.3 * r());
    for (const sg of [-1, 1]) {
      const droop = 0.35 + 0.5 * s;
      const tipDir = norm(add3(add3(mul3(side, sg), mul3(tan, 0.45)), [0, droop, 0]));
      const tip = add3(rach[k], mul3(tipDir, ll));
      const w = len * 0.022;
      const a = add3(rach[k], mul3(tan, -w)), b = add3(rach[k], mul3(tan, w));
      const nrm = norm(cross(sub3(tip, a), sub3(b, a)));
      const l = Math.abs(nrm[0] * KEY_W[0] + nrm[1] * KEY_W[1] + nrm[2] * KEY_W[2]);
      const d = `M${P(a)}L${P(tip)}L${P(b)}Z`;
      if (l > 0.45 && sg * dir[0] <= 0.2) lit += d;
      else dark += d;
    }
  }
  const sp = rach.map(P).join("L");
  const zf = worldView(rig, map(rach[10]))[2];
  const shade = Math.max(0, Math.min(1, 0.5 + zf / 900));
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("path", { d: dark, fill: rampAt(PALM_FROND, 0.28 + 0.12 * shade) }),
    /* @__PURE__ */ jsx("path", { d: lit, fill: rampAt(PALM_FROND, 0.52 + 0.14 * shade) }),
    /* @__PURE__ */ jsx("path", { d: `M${sp}`, stroke: rampAt(PALM_BARK, 0.62), strokeWidth: 2.2, fill: "none", strokeLinecap: "round" })
  ] });
};
/** a group of palms in a scene (world points; map = identity) */
export const Palms = ({ id, rig, palms, f, probe = "the palm trees around the pad" }) => {
  const parts = palms.flatMap((pm, i) => palmParts(`${id}${i}`, pm.base, pm.h, pm.lean, pm.seed ?? 7 + i * 13, f));
  return /* @__PURE__ */ jsx("div", { "data-probe-object": probe, style: { position: "absolute", inset: 0, pointerEvents: "none" }, children: /* @__PURE__ */ jsx("svg", { width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: /* @__PURE__ */ jsx(PaintParts, { parts, map: (q) => q, rig, id }) }) });
};
/** shadow casters for TkFloor: a palm's trunk box */
export const palmCasters = (palms) => palms.map((pm) => {
  const t = [pm.base[0] + pm.lean[0] * pm.h, pm.base[1] - pm.h, pm.base[2] + pm.lean[1] * pm.h], out = [];
  for (const p of [pm.base, t]) for (const dx of [-15, 15]) for (const dz of [-15, 15]) out.push([p[0] + dx, p[1], p[2] + dz]);
  return { corners: out, k: 0.35 };
});
/** a palm's highest screen point (its crown) — for the framings' headroom bound */
export const palmTop = (rig, pm) => worldScr(rig, [pm.base[0] + pm.lean[0] * pm.h, pm.base[1] - pm.h - pm.h * 0.12, pm.base[2] + pm.lean[1] * pm.h]);
