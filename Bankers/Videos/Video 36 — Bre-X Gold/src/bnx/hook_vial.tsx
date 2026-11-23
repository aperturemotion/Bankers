// @ts-nocheck
// ★ V36 hook helper (builder H, rev 1 → rev 1c): THE SOURCE OF THE DUST — a small clear glass sample vial of gold dust, held tilted
//   mouth-down above the core and tapped so the dust trickles out of its mouth; it travels along the run with the sprinkle, turns
//   its mouth up as the pour ends, then slides away along the run and out of the frame (by moving — never a fade). No hands.
//   ★ rev 1c (Timur: "the three-dimensional is not built right … the end … is cut off"): built as ONE real solid in 3-D — circular
//   rings round its axis (a straight tube, a thickened lip at the mouth, a threaded neck, a fully domed base), every ring projected
//   through the rig, so the mouth's ellipse and every section share the one viewing direction; the silhouette is the hull of the
//   rings, the dust inside is the same solid at a smaller radius, the highlight runs along the side that faces the key light.
//   <HookVial rig mouth axis fill g />   mouth: world point of the mouth's centre; axis: unit world vector mouth → bottom
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { seeded } from "./common";
import { worldScr, worldView } from "./tk_rig";
import { BX_DUST } from "./bx_gold";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
export const VIAL = { L: 150, r: 21 };
const KEY = (() => {
  const k = [-0.52, -0.62, 0.58], l = Math.hypot(...k);
  return k.map((v) => v / l);
})();
const SPECKS = (() => {
  const r = seeded(4507);
  return Array.from({ length: 80 }, () => ({ t: r(), a: r() * 2 * Math.PI, q: Math.sqrt(r()), z: 0.6 + 0.9 * r() }));
})();
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => {
  const l = Math.hypot(...a) || 1;
  return a.map((v) => v / l);
};
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
const N = 36;
export const HookVial = ({ rig, mouth, axis, fill = 0.5, g = 0, id = "hkV" }) => {
  const { L, r } = VIAL;
  const a = unit(axis);
  // a basis round the axis; e1 is the side that faces the key light most (the highlight's side)
  let e1 = unit(cross(a, [0, 0, 1]));
  if (Math.hypot(...cross(a, [0, 0, 1])) < 1e-3) e1 = unit(cross(a, [1, 0, 0]));
  let e2 = cross(a, e1);
  const at = (s, rr, th) => [0, 1, 2].map((i) => mouth[i] + a[i] * s + rr * (Math.cos(th) * e1[i] + Math.sin(th) * e2[i]));
  const nrm = (th) => [0, 1, 2].map((i) => Math.cos(th) * e1[i] + Math.sin(th) * e2[i]);
  const S = (p) => worldScr(rig, p);
  const facing = (p, n) => {
    const v = worldView(rig, p), w = worldView(rig, [p[0] + n[0], p[1] + n[1], p[2] + n[2]]);
    return (w[0] - v[0]) * -v[0] + (w[1] - v[1]) * -v[1] + (w[2] - v[2]) * (rig.persp - v[2]);
  };
  const ring = (s, rr, n = N) => Array.from({ length: n }, (_, i) => S(at(s, rr, i / n * 2 * Math.PI)));
  // the profile along the axis: lip (thick), neck with threads, straight tube, then a full dome to the base
  const DOME = r * 0.95, TUBE = L - DOME;
  const prof = [[0, r * 1.06], [4, r * 1.06], [6, r], [TUBE, r]];
  for (let k = 1; k <= 8; k++) {
    const q = k / 8 * Math.PI / 2;
    prof.push([TUBE + DOME * Math.sin(q), r * Math.cos(q) + (k === 8 ? 0.01 : 0)]);
  }
  const outline = hull(prof.flatMap(([s, rr]) => ring(s, Math.max(0.5, rr))));
  // the dust: the same solid at 0.84 r, a plug of length fill·TUBE lying against whichever end is LOWER (gravity, world y down):
  //   against the mouth while it pours mouth-down, sliding down the tube into the dome as the vial turns mouth-up
  const rad = (s) => s <= TUBE ? r : r * Math.sqrt(Math.max(0, 1 - ((s - TUBE) / DOME) ** 2));
  const f = clamp01(fill);
  const fl = (TUBE - 8) * f;
  const w0 = clamp01((a[1] + 0.25) / 0.5), w = w0 * w0 * (3 - 2 * w0);
  const s0 = 8 + (TUBE + DOME * 0.97 - fl - 8) * w, s1 = s0 + fl;
  const dRing = (s) => ring(s, Math.max(0.5, rad(s) * 0.84));
  const dSteps = Array.from({ length: 15 }, (_, k) => s0 + (s1 - s0) * k / 14);
  const dust = hull(dSteps.flatMap(dRing));
  const surfA = dRing(s1), surfB = dRing(s0);
  // an end face of the plug shows only while it faces the lens (it turns edge-on, a line, before it hides: no pop)
  const seeA = facing(at(s1, 0, 0), a) > 0 && rad(s1) > r * 0.3 ? 1 : 0, seeB = facing(at(s0, 0, 0), a.map((v) => -v)) > 0 ? 1 : 0;
  // glass shading across the tube as SEEN: from the silhouette edge on the key light's side (upper left) to the far edge,
  //   perpendicular to the projected axis (taken at the tube's middle ring, so it follows the solid's own width)
  const thL = Math.atan2(e2[0] * KEY[0] + e2[1] * KEY[1] + e2[2] * KEY[2], e1[0] * KEY[0] + e1[1] * KEY[1] + e1[2] * KEY[2]);
  const pm = S(at(TUBE * 0.5, 0, 0)), pa = S(at(TUBE * 0.5 + 10, 0, 0));
  let nx = -(pa[1] - pm[1]), ny = pa[0] - pm[0];
  const nl = Math.hypot(nx, ny) || 1;
  nx /= nl;
  ny /= nl;
  if (nx * KEY[0] + ny * KEY[1] < 0) {
    nx = -nx;
    ny = -ny;
  }
  const hw = Math.max(1, ...ring(TUBE * 0.5, r).map((q) => (q[0] - pm[0]) * nx + (q[1] - pm[1]) * ny));
  const lit = [pm[0] + nx * hw, pm[1] + ny * hw], dark = [pm[0] - nx * hw, pm[1] - ny * hw];
  const gid = `${id}G`;
  // the highlight: a line on the tube along the side facing the light (where it faces the lens), and a faint one opposite
  const streak = (th, s0, s1) => {
    const pts = [];
    for (let k = 0; k <= 12; k++) {
      const s = s0 + (s1 - s0) * k / 12, p = at(s, r * 1.001, th);
      if (facing(p, nrm(th)) > 0) pts.push(S(p));
    }
    return pts.length > 1 ? `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}` : "";
  };
  // the rim (front half bold, back half faint — it is glass), threads on the front half only
  const arcs = (s, rr, front) => {
    const segs = [];
    let cur = [];
    for (let i = 0; i <= N; i++) {
      const th = i / N * 2 * Math.PI, p = at(s, rr, th);
      const ok = (facing(p, nrm(th)) > 0) === front;
      if (ok) cur.push(S(p));
      else if (cur.length) {
        segs.push(cur);
        cur = [];
      }
    }
    if (cur.length) segs.push(cur);
    return segs.filter((q) => q.length > 1).map((q) => `M${q.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}`).join("");
  };
  const P = (pts) => `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`;
  const km = rig.persp / Math.max(1, rig.persp - worldView(rig, mouth)[2]);
  const tw = 0.5 + 0.5 * Math.sin(g * 0.7);
  const specks = SPECKS.filter((q, i) => i < 20 + 60 * f).map((q) => {
    const ss = s0 + (s1 - s0) * q.t, p = S(at(ss, rad(ss) * 0.8 * q.q, q.a));
    const s = q.z * 1.1 * km;
    return `M${f2(p[0] - s)},${f2(p[1])}L${f2(p[0])},${f2(p[1] - s)}L${f2(p[0] + s)},${f2(p[1])}L${f2(p[0])},${f2(p[1] + s)}Z`;
  }).join("");
  // is the open mouth facing the lens (then its opening shows as a filled dark ellipse inside the lip)?
  const mouthOpen = facing(mouth, a.map((v) => -v));
  return jsxs("g", { "data-probe-skip": true, children: [
    jsx("defs", { children: jsxs("linearGradient", { id: gid, gradientUnits: "userSpaceOnUse", x1: f2(lit[0]), y1: f2(lit[1]), x2: f2(dark[0]), y2: f2(dark[1]), children: [
      jsx("stop", { offset: "0", stopColor: "#E8F1FB", stopOpacity: 0.5 }),
      jsx("stop", { offset: "0.2", stopColor: "#B8D0EA", stopOpacity: 0.16 }),
      jsx("stop", { offset: "0.6", stopColor: "#9FBDE0", stopOpacity: 0.08 }),
      jsx("stop", { offset: "0.9", stopColor: "#6F93BE", stopOpacity: 0.24 }),
      jsx("stop", { offset: "1", stopColor: "#C9DCF1", stopOpacity: 0.46 })
    ] }) }),
    // the back half of the rim and of the threads, seen through the glass
    jsx("path", { d: arcs(0, r * 1.06, false), stroke: "#C5D8EE", strokeWidth: 1.1, opacity: 0.35, fill: "none" }),
    // the dust inside, then its packed surface toward the base
    f > 0.01 && jsx("path", { d: P(dust), fill: BX_DUST[3], opacity: 0.95 }),
    f > 0.01 && w < 0.99 && seeA > 0 && jsx("path", { d: P(surfA), fill: BX_DUST[1], opacity: 0.85 * (1 - w) }),
    f > 0.01 && w > 0.01 && seeB > 0 && jsx("path", { d: P(surfB), fill: BX_DUST[1], opacity: 0.85 * w }),
    f > 0.01 && jsx("path", { d: specks, fill: BX_DUST[0], opacity: 0.55 + 0.35 * tw }),
    // the glass body
    jsx("path", { d: P(outline), fill: `url(#${gid})`, stroke: "#C5D8EE", strokeWidth: 1.2, strokeOpacity: 0.75 }),
    jsx("path", { d: streak(thL + 0.35, 10, TUBE + DOME * 0.4), stroke: "#FFFFFF", strokeWidth: Math.max(1.4, 3.2 * km), opacity: 0.6, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d: streak(thL + Math.PI - 0.5, 14, TUBE - 6), stroke: "#FFFFFF", strokeWidth: Math.max(0.8, 1.3 * km), opacity: 0.22, fill: "none", strokeLinecap: "round" }),
    // the threads on the neck and the lip, front halves
    [9, 13, 17].map((s) => jsx("path", { d: arcs(s, r * 1.01, true), stroke: "#E4EEF9", strokeWidth: 1, opacity: 0.5, fill: "none" }, s)),
    mouthOpen > 0 && jsx("path", { d: P(ring(0.2, r * 0.86)), fill: "#0B1F31", opacity: 0.35 }),
    jsx("path", { d: arcs(0, r * 1.06, true), stroke: "#DDE9F6", strokeWidth: Math.max(1.4, 3 * km), opacity: 0.85, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d: arcs(4, r * 1.06, true), stroke: "#9FBCDD", strokeWidth: 1, opacity: 0.5, fill: "none" })
  ] });
};
