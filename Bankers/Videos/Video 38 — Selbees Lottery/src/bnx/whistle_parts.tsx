// @ts-nocheck
// ★ V37 "Theranos" — whistle_parts.tsx (builder H, REV2 — Timur: "fix the whistle on sec 36, it looks weird and overlapped, also make
//   this scene more detailed and aesthetic").
//   THE WHISTLE, ITS RING / TAG / LANYARD AND THE BOARD TABLE, in the tk_rig world (x right, y DOWN, z toward the lens), one key light
//   from the upper left.
//
//   · THE CHROME PEA WHISTLE (an Acme "Thunderer"-style pea whistle), built as REAL FACETED SOLIDS in one local frame:
//       the turned BARREL (axis = local z, 72 facets round, chamfered ends, a rolled seam near each end, flat end plates with an
//       embossed ring, a centre boss and a stamped arc), the flattened MOUTHPIECE leaving the barrel TANGENT to its top (its top face
//       flush with the barrel's top line, its root cut on the barrel's own cylinder so it MERGES into it), narrower than the barrel's
//       length, with a bevelled lip and the dark MOUTH SLOT; the ESCAPE WINDOW cut in the barrel's top just behind the mouthpiece's
//       root, with its sharp BLADE edge and the pale PEA seen inside; the LUG at the barrel's back with its hole.
//     Every face is shaded by one chrome environment (the key softbox upper left, a cool rim strip behind, a horizon, the dark table
//     below), evaluated per facet from its true reflection vector — so the specular streaks run along the barrel as on real chrome.
//   · ★ OCCLUSION IS EXACT AT EVERY POSE (a BSP, not a guess): the whistle is split by four planes of its own frame —
//       x = 0 (the barrel's back half A | the mouthpiece side C), z = ±mz (the mouthpiece's two side planes), y = MY1 (the mouthpiece's
//       underside) — into convex cells: A (back half of the barrel + window), Cp / Cn (the barrel's two end strips on the mouthpiece
//       side), Clow (the barrel under the mouthpiece) and M (the mouthpiece outside the barrel). Two convex cells separated by a plane
//       are painted far-side first, decided per frame by which side of that plane the EYE is on (`order`), and inside a convex cell
//       only front faces are drawn (they never overlap). The lug is separated from the barrel by the tangent plane at its root, the
//       split ring from the lug by the lug's mid plane, the ring from the tag by the tag's plane. The end-plate details are always in
//       front of the mouthpiece (its plane z = ±HL bounds the whole whistle), so they paint last. The same code paints the mirrored
//       REFLECTION in the lacquer (a reflected pose: every test is made in world space with the eye).
//   · the SPLIT RING (two turns of flat chrome wire) hangs FROM the lug's hole by gravity, in the plane of the hole's axis — so it never
//     enters the barrel; the brushed-steel ID TAG (edge thickness, rolled edge, eyelet, engraved border, L("whistleName") /
//     L("whistleRole") ENGRAVED: groove + lit lip, the paint filling on its word) hangs from the ring, threading it; the LANYARD — a
//     braided navy cord with a chrome crimp sleeve and a jump link — runs from the ring down to the table and across the leather pad.
//   · THE BOARD TABLE: a dark lacquered top with long veneer grain, a crossbanded border and a satin-steel stringing inlay, a bullnosed
//     lit edge; an inset navy LEATHER WRITING PAD (stitched border, raised edge); the soft key pool and the whistle's contact shadow.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { rampAt } from "./solid_engine";
import { XPlane, rrectPts, worldScr, worldView, xfApply, xfDir, xfMul, xfRotY, xfRotZ, xfScale, xfTrans } from "./tk_rig";
import { label } from "./kit";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const D2R = Math.PI / 180;
export const CHROME = ["#060D19", "#1E3150", "#7F98B9", "#DCE8F6", "#FFFFFF"];
const STEEL = ["#0B1524", "#2A3E58", "#7E95B2", "#C9D7E8", "#F4F8FD"];
const CORD = ["#03070E", "#0A1830", "#173A66", "#3F6EA6", "#A9C6E8"];
const LEATHER = ["#03070F", "#081530", "#10264A", "#2B4C7A", "#86A6CF"];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const sstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const path = (pts, close = true) => "M" + pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L") + (close ? "Z" : "");
// ── the rig: world → view rotation, and the eye in world space ─────────────────────────────────────────────────────────
const rotOf = (rig) => {
  const cy = Math.cos(rig.yaw * D2R), sy = Math.sin(rig.yaw * D2R), cp = Math.cos(rig.pitch * D2R), sp = Math.sin(rig.pitch * D2R);
  return (p) => {
    const x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy;
    return [x1, p[1] * cp - z1 * sp, p[1] * sp + z1 * cp];
  };
};
export const eyeOf = (rig) => {
  const cy = Math.cos(rig.yaw * D2R), sy = Math.sin(rig.yaw * D2R), cp = Math.cos(rig.pitch * D2R), sp = Math.sin(rig.pitch * D2R);
  const v = [0, 0, rig.persp];
  const a = [v[0], v[1] * cp + v[2] * sp, -v[1] * sp + v[2] * cp];
  const b = [a[0] * cy - a[2] * sy, a[1], a[0] * sy + a[2] * cy];
  return [rig.cx + b[0], rig.cy + b[1], b[2]];
};
// ── the chrome environment (view space: y down, z toward the lens) ─────────────────────────────────────────────────────
const KEY = unit([-0.52, -0.62, 0.58]);
const FILL = unit([0.78, -0.32, 0.52]);
const RIM = unit([0.42, -0.5, -0.76]);
const envOf = (R) => {
  const up = -R[1];
  // the studio: a dark lacquer floor, a sharp horizon, a graded sky; the key softbox, a fill strip, a cool rim strip behind
  const sky = 0.26 + 0.26 * Math.pow(Math.max(0, up), 0.6);
  const ground = 0.05 + 0.07 * Math.max(0, 1 - R[1]);
  let v = ground + (sky - ground) * sstep(-0.05, 0.03, up);
  v += 0.95 * sstep(0.78, 0.95, dot(R, KEY)) + 0.32 * sstep(0.55, 0.85, dot(R, KEY));
  v += 0.42 * sstep(0.86, 0.97, dot(R, FILL));
  v += 0.62 * sstep(0.8, 0.95, dot(R, RIM));
  return v;
};
const chromeShade = (nv, cv, persp, gain = 1) => {
  const V = unit([-cv[0], -cv[1], persp - cv[2]]);
  const k = 2 * dot(nv, V);
  const R = [k * nv[0] - V[0], k * nv[1] - V[1], k * nv[2] - V[2]];
  return envOf(R) * gain;
};
// ── THE WHISTLE (local units; ×WH.K in its pose) ──────────────────────────────────────────────────────────────────────
//   the barrel's axis along local z, its centre at the origin; θ measured from the barrel's TOP (θ = 0 → (0, −R)) toward +x (the
//   mouthpiece side): a point at angle θ is (R sin θ, −R cos θ)
export const WH = { R: 26, HL: 18.5, c: 2.4, mz: 11.5, MY0: -26, MY1: -13, TIP: 90, LIP: 2.4, K: 4.2 };
const WIN = { t0: -62 * D2R, t1: -1.5 * D2R, z: 10.2 };
const LUG = { th: -138 * D2R, r0: WH.R - 3, r1: WH.R + 15, w: 7.5, t: 2.2, hole: 3.4, hr: WH.R + 8.2 };
const TH_B = Math.acos(-WH.MY1 / WH.R);   // the barrel angle where the mouthpiece's underside meets it
const at = (r, th, z) => [r * Math.sin(th), -r * Math.cos(th), z];
const nrm = (th) => [Math.sin(th), -Math.cos(th), 0];
const buildWhistle = () => {
  const { R, HL, c, mz, MY0, MY1, TIP, LIP } = WH;
  const faces = [];
  const F = (pts, n, g, extra = {}) => faces.push({ pts, n, g, ...extra });
  // the angles round the barrel: a 5° grid plus the cell boundaries (0, ±180°, the underside line)
  const ths = new Set();
  for (let k = 0; k <= 96; k++) ths.add(+(-Math.PI + k * 2 * Math.PI / 96).toFixed(6));
  ths.add(0);
  ths.add(+TH_B.toFixed(6));
  const TH = [...ths].sort((a, b) => a - b);
  const zs = [-HL + c, -mz, mz, HL - c];
  const cellOf = (thm, zm) => thm < 0 ? "A" : zm > mz ? "Cp" : zm < -mz ? "Cn" : thm < TH_B ? null : "Clow";
  for (let i = 0; i < TH.length - 1; i++) {
    const a = TH[i], b = TH[i + 1], m = (a + b) / 2;
    for (let j = 0; j < zs.length - 1; j++) {
      const z0 = zs[j], z1 = zs[j + 1];
      const g = cellOf(m, (z0 + z1) / 2);
      if (!g) continue;
      F([at(R, a, z0), at(R, b, z0), at(R, b, z1), at(R, a, z1)], nrm(m), g, { th: m });
    }
    // the chamfers (cones) at both ends
    const cn = (s) => unit([Math.sin(m), -Math.cos(m), s * c / c]);
    F([at(R, a, HL - c), at(R, b, HL - c), at(R - c, b, HL), at(R - c, a, HL)], cn(1), m < 0 ? "A" : "Cp", { th: m, cham: 1 });
    F([at(R - c, a, -HL), at(R - c, b, -HL), at(R, b, -HL + c), at(R, a, -HL + c)], cn(-1), m < 0 ? "A" : "Cn", { th: m, cham: 1 });
  }
  // the end plates, each split at x = 0 (the back half belongs to A, the front half to Cp / Cn)
  for (const s of [1, -1]) {
    const half = (lo, hi) => {
      const pts = [[0, 0, s * HL]];
      for (let k = 0; k <= 36; k++) pts.push(at(R - c, lo + (hi - lo) * k / 36, s * HL));
      return pts;
    };
    F(half(-Math.PI, 0), [0, 0, s], "A", { plate: s });
    F(half(0, Math.PI), [0, 0, s], s > 0 ? "Cp" : "Cn", { plate: s });
  }
  // the mouthpiece: a rounded flat section (y MY0…MY1, z ±mz) run along +x from its root ON the barrel's cylinder to the lip
  const sec = rrectPts(MY1 - MY0, 2 * mz, 4.6, 4, (MY0 + MY1) / 2, 0).map(([y, z]) => [y, z]);
  const root = (y) => Math.sqrt(Math.max(0, R * R - y * y));
  const inset = (y, z, d) => {
    const cy = (MY0 + MY1) / 2;
    return [cy + (y - cy) * (1 - d / ((MY1 - MY0) / 2)), z * (1 - d / mz)];
  };
  for (let i = 0; i < sec.length; i++) {
    const p = sec[i], q = sec[(i + 1) % sec.length];
    const mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    // the outward normal of the section edge (in y, z)
    const ey = q[0] - p[0], ez = q[1] - p[1];
    let n = unit([0, ez, -ey]);
    if (dot(n, [0, mid[0] - (MY0 + MY1) / 2, mid[1]]) < 0) n = mul(n, -1);
    const pi = inset(p[0], p[1], 1.1), qi = inset(q[0], q[1], 1.1);
    F([[root(p[0]), p[0], p[1]], [TIP - LIP, p[0], p[1]], [TIP - LIP, q[0], q[1]], [root(q[0]), q[0], q[1]]], n, "M", { mp: 1, top: mid[0] < MY0 + 2 });
    // the lip's bevel
    F([[TIP - LIP, p[0], p[1]], [TIP, pi[0], pi[1]], [TIP, qi[0], qi[1]], [TIP - LIP, q[0], q[1]]], unit(add(mul(n, 0.75), [0.66, 0, 0])), "M", { mp: 1, cham: 1 });
  }
  F(sec.map(([y, z]) => inset(y, z, 1.1)).map(([y, z]) => [TIP, y, z]), [1, 0, 0], "M", { tip: 1 });
  // the lug: a tongue on the barrel's back, its plate in the barrel's mid plane (hole axis ∥ the barrel axis)
  const u = nrm(LUG.th), v = [Math.cos(LUG.th), Math.sin(LUG.th), 0];
  const lugOut = [];
  for (let k = 0; k <= 10; k++) {
    const a = Math.PI * k / 10;
    lugOut.push(add(mul(u, LUG.hr + LUG.w * Math.sin(a) * 0.95), mul(v, LUG.w * Math.cos(a))));
  }
  const lugPts = [add(mul(u, LUG.r0), mul(v, LUG.w)), ...lugOut, add(mul(u, LUG.r0), mul(v, -LUG.w))];
  const zf = (p, z) => [p[0], p[1], z];
  F(lugPts.map((p) => zf(p, LUG.t)), [0, 0, 1], "L", { lugFace: 1 });
  F([...lugPts].reverse().map((p) => zf(p, -LUG.t)), [0, 0, -1], "L", { lugFace: -1 });
  for (let k = 0; k < lugPts.length - 1; k++) {
    const p = lugPts[k], q = lugPts[k + 1];
    const e = sub(q, p);
    let n = unit([e[1], -e[0], 0]);
    if (dot(n, sub(mul(add(p, q), 0.5), mul(u, LUG.hr - 4))) < 0) n = mul(n, -1);
    F([zf(p, -LUG.t), zf(q, -LUG.t), zf(q, LUG.t), zf(p, LUG.t)], n, "L", { cham: 1 });
  }
  return faces;
};
const FACES = buildWhistle();
export const LUG_HOLE = add(mul(nrm(LUG.th), LUG.hr), [0, 0, 0]);
// the whistle's lowest point under a rotation (so it rests ON the table)
const SAMPLES = (() => {
  const pts = [];
  for (const z of [-WH.HL, WH.HL]) for (let k = 0; k < 48; k++) pts.push(at(WH.R, k / 48 * 2 * Math.PI, z));
  for (const y of [WH.MY0, WH.MY1]) for (const z of [-WH.mz, WH.mz]) pts.push([WH.TIP, y, z]);
  for (const z of [-LUG.t, LUG.t]) pts.push([...add(mul(nrm(LUG.th), LUG.r1), [0, 0, 0])].map((v, i) => i === 2 ? z : v));
  return pts;
})();
/** the whistle's pose: yaw (deg) turns it about the vertical, tilt (deg) rolls it about its own barrel axis (+ tips the mouthpiece
 *  down), pitch (deg) raises the mouthpiece's far end; lift above the table top (world units) at world (x, z) */
export const whistleXf = (x, z, top, yaw, tilt, lift, pitch = 0) => {
  const R = xfMul(xfRotY(yaw), xfMul(xfRotZ(tilt), xfMul(xfRotY(pitch), xfScale(WH.K))));
  const low = Math.max(...SAMPLES.map((p) => xfApply(R, p)[1]));
  return xfMul(xfTrans([x, top - low - lift, z]), R);
};
/** the rest tilt: rolled about its barrel until the mouthpiece's lip touches the table (the whistle lying on its side) */
export const REST_TILT = (() => {
  const tip = [WH.TIP, WH.MY1, 0];
  for (let t = 0; t < 60; t += 0.1) {
    const r = xfRotZ(t);
    if (xfApply(r, tip)[1] >= WH.R) return t;
  }
  return 25;
})();
export const whistleWindow = (xf) => xfApply(xf, at(WH.R, (WIN.t0 + WIN.t1) / 2, 0));
export const whistleWindowN = (xf) => unit(xfDir(xf, nrm((WIN.t0 + WIN.t1) / 2)));
export const whistleHole = (xf) => xfApply(xf, LUG_HOLE);
export const whistleAxis = (xf) => unit(xfDir(xf, [0, 0, 1]));
export const whistleLugOut = (xf) => unit(xfDir(xf, nrm(LUG.th)));
export const whistleCentre = (xf) => xfApply(xf, [WH.TIP * 0.3, 0, 0]);
export const whistleLow = (xf) => Math.max(...SAMPLES.map((p) => xfApply(xf, p)[1]));
/** the paint order of the whistle's cells for an eye (world), the pose xf: a BSP over its own planes (see the header) */
const sideOf = (xf, eye, p0, n) => dot(unit(xfDir(xf, n)), sub(eye, xfApply(xf, p0))) > 0;
const orderOf = (xf, eye) => {
  const xPos = sideOf(xf, eye, [0, 0, 0], [1, 0, 0]);
  const zP = sideOf(xf, eye, [0, 0, WH.mz], [0, 0, 1]), zN = sideOf(xf, eye, [0, 0, -WH.mz], [0, 0, -1]);
  const above = sideOf(xf, eye, [0, WH.MY1, 0], [0, -1, 0]);
  const lugOut = sideOf(xf, eye, at(WH.R, LUG.th, 0), nrm(LUG.th));
  const lugFront = sideOf(xf, eye, [0, 0, 0], [0, 0, 1]);
  const mid = above ? ["Clow", "M"] : ["M", "Clow"];
  const C = zP ? ["Cn", ...mid, "Cp"] : zN ? ["Cp", ...mid, "Cn"] : ["Cp", "Cn", ...mid];
  const lug = ["ringBack", "L", "ringFront"];
  const A = lugOut ? ["A", ...lug] : [...lug, "A"];
  return { seq: xPos ? [...A, ...C] : [...C, ...A], lugFront };
};
/** project + shade every front face of the whistle for a pose; returns the painted faces grouped by cell */
const paintWhistle = (rig, xf, eye, gain) => {
  const rot = rotOf(rig);
  const out = { A: [], Cp: [], Cn: [], Clow: [], M: [], L: [] };
  for (const f of FACES) {
    const pw = f.pts.map((p) => xfApply(xf, p));
    const c = pw.reduce((s, p) => add(s, p), [0, 0, 0]).map((v) => v / pw.length);
    const nw = unit(xfDir(xf, f.n));
    if (dot(nw, sub(eye, c)) <= 0) continue;
    const nv = unit(rot(nw)), cv = worldView(rig, c);
    let v = chromeShade(nv, cv, rig.persp, gain);
    if (f.cham) v = v * 1.08 + 0.06;
    if (f.g === "L") v = v * 0.9;
    const pts = pw.map((q) => worldScr(rig, q));
    out[f.g].push({ d: path(pts), v, f, pts, nv });
  }
  return out;
};
const fill = (v) => rampAt(CHROME, clamp01(v));
const Faces = ({ list, id }) => jsx(jsx_runtime.Fragment, { children: list.map((p, k) => {
  const col = fill(p.v);
  if (p.grad) return jsx("path", { d: p.d, fill: `url(#${p.grad})`, stroke: `url(#${p.grad})`, strokeWidth: 0.8, strokeLinejoin: "round" }, k);
  if (p.f.plate) return jsx("path", { d: p.d, fill: `url(#${id}pl${p.f.plate > 0 ? "f" : "b"})`, stroke: `url(#${id}pl${p.f.plate > 0 ? "f" : "b"})`, strokeWidth: 0.9, strokeLinejoin: "round" }, k);
  return jsx("path", { d: p.d, fill: col, stroke: col, strokeWidth: 0.8, strokeLinejoin: "round" }, k);
}) });
/** a polyline drawn ON the barrel at height z over the angles [t0, t1], split by cell (for the seams / the blade): world points */
const barrelLine = (xf, r, z, t0, t1, n = 24) => Array.from({ length: n + 1 }, (_, k) => xfApply(xf, at(r, t0 + (t1 - t0) * k / n, z)));
const visibleArc = (rig, xf, eye, r, z, t0, t1, n = 36) => {
  // the parts of a ring on the barrel whose surface faces the eye
  const runs = [];
  let cur = [];
  for (let k = 0; k <= n; k++) {
    const th = t0 + (t1 - t0) * k / n;
    const p = xfApply(xf, at(r, th, z));
    const ok = dot(unit(xfDir(xf, nrm(th))), sub(eye, p)) > 0;
    if (ok) cur.push(worldScr(rig, p));
    else if (cur.length) {
      runs.push(cur);
      cur = [];
    }
  }
  if (cur.length) runs.push(cur);
  return runs.filter((r2) => r2.length > 1);
};
/** THE WHISTLE. pea: the pea's phase; sweep −1…1 a light running along the chrome; gain: the chrome's brightness (lifts in the light);
 *  ring: a render function for the split ring's segments ("back" | "front", relative to the lug's plate); mirror: the lacquer reflection */
export const Whistle = ({ id, rig, xf, pea = 0, sweep = -1, gain = 1, ring, mirror = false }) => {
  const eye = eyeOf(rig);
  const P = paintWhistle(rig, xf, eye, gain);
  const { seq, lugFront } = orderOf(xf, eye);
  const k = rig.persp / Math.max(1, rig.persp - worldView(rig, xfApply(xf, [0, 0, 0]))[2]) * WH.K;
  const sw = Math.max(0.5, 0.42 * k);
  // the end plates' gradient: lit toward the key, a soft fall across the face
  const plateGrad = (s) => {
    const n = unit(xfDir(xf, [0, 0, s]));
    if (dot(n, sub(eye, xfApply(xf, [0, 0, s * WH.HL]))) <= 0) return null;
    const nv = unit(rotOf(rig)(n));
    // a polished flat end plate: bright toward the key (upper left), a crisp horizon across it, darker toward the lower right
    const v = (0.5 + 0.3 * Math.max(0, dot(nv, KEY))) * gain;
    const g0 = worldScr(rig, xfApply(xf, at(WH.R - WH.c, -0.9, s * WH.HL))), g1 = worldScr(rig, xfApply(xf, at(WH.R - WH.c, Math.PI - 0.9, s * WH.HL)));
    return jsxs("linearGradient", { id: `${id}pl${s > 0 ? "f" : "b"}`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
      jsx("stop", { offset: "0", stopColor: fill(v + 0.42) }), jsx("stop", { offset: "0.3", stopColor: fill(v + 0.22) }), jsx("stop", { offset: "0.47", stopColor: fill(v + 0.12) }),
      jsx("stop", { offset: "0.53", stopColor: fill(v - 0.16) }), jsx("stop", { offset: "0.8", stopColor: fill(v - 0.1) }), jsx("stop", { offset: "1", stopColor: fill(v - 0.24) })
    ] });
  };
  // the mouthpiece's long faces: a gradient along their length (the studio's reflections sliding along the flat chrome)
  const mGrads = P.M.filter((p) => p.f.mp && !p.f.cham).map((p, q) => {
    const g0 = worldScr(rig, xfApply(xf, [6, -20, 0])), g1 = worldScr(rig, xfApply(xf, [WH.TIP, -20, 0]));
    p.grad = `${id}mg${q}`;
    const v = p.v;
    return jsxs("linearGradient", { id: p.grad, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
      jsx("stop", { offset: "0", stopColor: fill(v - 0.14) }), jsx("stop", { offset: "0.3", stopColor: fill(v + 0.06) }), jsx("stop", { offset: "0.52", stopColor: fill(v - 0.1) }),
      jsx("stop", { offset: "0.78", stopColor: fill(v + 0.1) }), jsx("stop", { offset: "1", stopColor: fill(v - 0.02) })
    ] }, p.grad);
  });
  const S = (q) => worldScr(rig, xfApply(xf, q));
  // ── decals per cell ──
  // A: the escape window (the dark cut, the inner wall, the pea, the blade's bright edge), the rolled seams on the back half
  const winN = unit(xfDir(xf, nrm((WIN.t0 + WIN.t1) / 2)));
  const seeWin = dot(winN, sub(eye, xfApply(xf, at(WH.R, (WIN.t0 + WIN.t1) / 2, 0)))) > 0;
  const winPts = [...barrelLine(xf, WH.R + 0.05, -WIN.z, WIN.t0, WIN.t1, 10), ...barrelLine(xf, WH.R + 0.05, WIN.z, WIN.t1, WIN.t0, 10)].map((q) => worldScr(rig, q));
  const blade = barrelLine(xf, WH.R + 0.1, 0, WIN.t0, WIN.t0, 1);
  const bladeD = path([S(at(WH.R + 0.1, WIN.t0, -WIN.z + 0.6)), S(at(WH.R + 0.1, WIN.t0, WIN.z - 0.6))], false);
  const lipD = path([S(at(WH.R + 0.1, WIN.t1, -WIN.z + 0.6)), S(at(WH.R + 0.1, WIN.t1, WIN.z - 0.6))], false);
  const innerD = path([S(at(WH.R - 3.2, WIN.t0 + 0.05, -WIN.z)), S(at(WH.R - 3.2, WIN.t0 + 0.05, WIN.z)), S(at(WH.R + 0.05, WIN.t0, WIN.z)), S(at(WH.R + 0.05, WIN.t0, -WIN.z))]);
  const peaC = S([-9.5 + 3.5 * Math.sin(pea * 1.7), -13.5 + 2.2 * Math.cos(pea * 2.3), 3.5 * Math.sin(pea * 1.1)]);
  const peaR = 10 * k;
  const seams = (g, s) => {
    const z = s * (WH.HL - WH.c - 1.6);
    const [t0, t1] = g === "A" ? [-Math.PI, 0] : [0, Math.PI];
    return visibleArc(rig, xf, eye, WH.R + 0.06, z, t0, t1).map((run, q) => jsxs("g", { children: [
      jsx("path", { d: path(run, false), stroke: "#050B16", strokeWidth: f2(sw * 1.5), opacity: 0.55, fill: "none" }),
      jsx("path", { d: path(run.map((p) => [p[0] + 0.0, p[1] + sw * 1.4]), false), stroke: "#FFFFFF", strokeWidth: f2(sw * 0.8), opacity: 0.35, fill: "none" })
    ] }, `${g}${s}${q}`));
  };
  // the light running along the chrome as it blows
  const sweepOn = sweep > -1 && sweep < 1;
  const sweepRun = sweepOn ? visibleArc(rig, xf, eye, WH.R + 0.1, 0, -Math.PI, Math.PI, 60) : [];
  const sweepTh = -2.6 + 4.6 * clamp01((sweep + 1) / 2);
  const sweepD = sweepOn ? [-1, 1].map((s) => path(barrelLine(xf, WH.R + 0.12, 0, sweepTh - 0.18, sweepTh + 0.18, 6).map((q) => q), false)) : [];
  const sweepBand = sweepOn ? (() => {
    const pts = [...barrelLine(xf, WH.R + 0.12, -WH.HL + WH.c, sweepTh - 0.12, sweepTh + 0.12, 4), ...barrelLine(xf, WH.R + 0.12, WH.HL - WH.c, sweepTh + 0.12, sweepTh - 0.12, 4)];
    const mid = xfApply(xf, at(WH.R, sweepTh, 0));
    const ok = dot(unit(xfDir(xf, nrm(sweepTh))), sub(eye, mid)) > 0;
    return ok ? { d: path(pts.map((q) => worldScr(rig, q))), g: sweepTh < 0 ? "A" : "C" } : null;
  })() : null;
  const sweepEl = sweepBand && jsx("path", { d: sweepBand.d, fill: "#FFFFFF", opacity: 0.4 * Math.sin(Math.PI * clamp01((sweep + 1) / 2)) });
  // M: the mouth slot on the lip, the stamped cartouche on the mouthpiece's top, a crisp top arris
  const tipN = unit(xfDir(xf, [1, 0, 0]));
  const seeTip = dot(tipN, sub(eye, xfApply(xf, [WH.TIP, -19, 0]))) > 0;
  const slot = rrectPts(WH.MY1 - WH.MY0 - 6.4, 2 * WH.mz - 5.5, 2.4, 3, (WH.MY0 + WH.MY1) / 2 + 0.4, 0).map(([y, z]) => S([WH.TIP + 0.05, y, z]));
  const slotIn = rrectPts(WH.MY1 - WH.MY0 - 6.4, 2 * WH.mz - 5.5, 2.4, 3, (WH.MY0 + WH.MY1) / 2 + 0.4, 0).map(([y, z]) => S([WH.TIP - 9, y + 1.2, z * 0.9]));
  const topN = unit(xfDir(xf, [0, -1, 0]));
  const seeTop = dot(topN, sub(eye, xfApply(xf, [50, WH.MY0, 0]))) > 0;
  const cart = rrectPts(22, 11, 4.5, 3, 0, 0).map(([a, b]) => S([42 + a, WH.MY0 - 0.06, b]));
  const cartIn = rrectPts(18.5, 7.6, 3.2, 3, 0, 0).map(([a, b]) => S([42 + a, WH.MY0 - 0.07, b]));
  const ticks = [-6, -3, 0, 3, 6].map((a) => path([S([42 + a, WH.MY0 - 0.08, -2.2]), S([42 + a + 0.8, WH.MY0 - 0.08, 2.2])], false));
  const arris = (s) => path([S([3, WH.MY0 + 0.6, s * (WH.mz - 2.2)]), S([WH.TIP - WH.LIP, WH.MY0 + 0.6, s * (WH.mz - 2.2)])], false);
  // the end plate's details (embossed ring, centre boss, stamped arc of dots): always in front of the rest when the plate faces us
  const plateDetail = (s) => {
    const n = unit(xfDir(xf, [0, 0, s]));
    if (dot(n, sub(eye, xfApply(xf, [0, 0, s * WH.HL]))) <= 0) return null;
    const ring = (r, dz = 0.08) => Array.from({ length: 49 }, (_, q) => S(at(r, q / 48 * 2 * Math.PI, s * (WH.HL + dz))));
    const dots = Array.from({ length: 9 }, (_, q) => S(at(WH.R * 0.5, -1.15 + q * 0.29, s * (WH.HL + 0.1))));
    return jsxs("g", { children: [
      jsx("path", { d: path(ring(WH.R - WH.c - 0.4)), fill: "none", stroke: "#FFFFFF", strokeWidth: f2(sw * 1.1), opacity: 0.45 }),
      jsx("path", { d: path(ring(WH.R * 0.7)), fill: "none", stroke: "#0A1426", strokeWidth: f2(sw * 1.6), opacity: 0.6 }),
      jsx("path", { d: path(ring(WH.R * 0.7 - 1.3).map((p) => [p[0] + sw * 0.7, p[1] + sw * 0.7])), fill: "none", stroke: "#FFFFFF", strokeWidth: f2(sw * 0.9), opacity: 0.5 }),
      jsx("path", { d: path(ring(WH.R * 0.2, 0.3)), fill: fill(0.42 * gain), stroke: "#FFFFFF", strokeOpacity: 0.55, strokeWidth: f2(sw * 0.8) }),
      jsx("path", { d: path(ring(WH.R * 0.08, 0.35)), fill: "#0B1730", opacity: 0.7 }),
      dots.map((p, q) => jsx("circle", { cx: f2(p[0]), cy: f2(p[1]), r: f2(sw * 1.2), fill: "#0B1730", opacity: 0.55 }, q))
    ] }, `pd${s}`);
  };
  const cells = {
    A: [
      jsx(Faces, { list: P.A, id }, "fA"),
      ...seams("A", 1), ...seams("A", -1),
      seeWin && jsxs("g", { children: [
        jsx("path", { d: path(winPts), fill: "#01050C" }),
        jsx("path", { d: innerD, fill: "#1B2D47", opacity: 0.9 }),
        jsx("g", { clipPath: `url(#${id}wc)`, children: jsx("circle", { cx: f2(peaC[0]), cy: f2(peaC[1]), r: f2(peaR), fill: `url(#${id}pe)` }) }),
        jsx("path", { d: path(winPts), fill: "none", stroke: "#02060C", strokeWidth: f2(sw * 1.2), opacity: 0.8 }),
        jsx("path", { d: bladeD, stroke: "#FFFFFF", strokeWidth: f2(sw * 2.2), strokeLinecap: "round", opacity: 0.95, fill: "none" }),
        jsx("path", { d: lipD, stroke: "#9FB6D3", strokeWidth: f2(sw * 1.2), strokeLinecap: "round", opacity: 0.7, fill: "none" })
      ] }, "win"),
      sweepBand && sweepBand.g === "A" && jsx("g", { children: sweepEl }, "swA")
    ],
    Cp: [jsx(Faces, { list: P.Cp, id }, "fCp"), ...seams("Cp", 1), sweepBand && sweepBand.g === "C" && jsx("g", { children: sweepEl }, "swC")],
    Cn: [jsx(Faces, { list: P.Cn, id }, "fCn"), ...seams("Cn", -1)],
    Clow: [jsx(Faces, { list: P.Clow, id }, "fCl")],
    M: [
      jsx(Faces, { list: P.M, id }, "fM"),
      seeTop && jsxs("g", { children: [
        jsx("path", { d: path(cart), fill: "none", stroke: "#0A1426", strokeWidth: f2(sw * 1.1), opacity: 0.55 }),
        jsx("path", { d: path(cartIn), fill: "none", stroke: "#FFFFFF", strokeWidth: f2(sw * 0.7), opacity: 0.45 }),
        ticks.map((d, q) => jsx("path", { d, stroke: "#0A1426", strokeWidth: f2(sw * 0.9), opacity: 0.55, fill: "none" }, q)),
        jsx("path", { d: arris(1), stroke: "#FFFFFF", strokeWidth: f2(sw * 1.3), opacity: 0.5, strokeLinecap: "round", fill: "none" })
      ] }, "top"),
      seeTip && jsxs("g", { children: [
        jsx("path", { d: path(slot), fill: "#01040A" }),
        jsx("path", { d: path(slotIn), fill: "#0E1B30", opacity: 0.8 }),
        jsx("path", { d: path(slot), fill: "none", stroke: "#FFFFFF", strokeOpacity: 0.35, strokeWidth: f2(sw * 0.8) })
      ] }, "slot")
    ],
    L: [jsx(Faces, { list: P.L, id }, "fL"), (() => {
      // the lug's hole, seen on whichever plate face is toward us
      const s = lugFront ? 1 : -1;
      const hole = Array.from({ length: 25 }, (_, q) => {
        const a = q / 24 * 2 * Math.PI;
        return S(add(LUG_HOLE, [LUG.hole * Math.cos(a), LUG.hole * Math.sin(a), s * (LUG.t + 0.05)]));
      });
      return jsx("path", { d: path(hole), fill: "#02060D", stroke: "#DCE8F6", strokeOpacity: 0.6, strokeWidth: f2(sw * 0.8) }, "lh");
    })()],
    ringBack: ring ? [ring(lugFront ? "back" : "front")] : [],
    ringFront: ring ? [ring(lugFront ? "front" : "back")] : []
  };
  return jsxs("g", { "data-probe-skip": true, children: [
    jsxs("defs", { children: [
      plateGrad(1), plateGrad(-1), ...mGrads,
      jsxs("radialGradient", { id: `${id}pe`, cx: 0.36, cy: 0.32, r: 0.72, children: [
        jsx("stop", { offset: "0", stopColor: "#F2F6FB" }), jsx("stop", { offset: "0.55", stopColor: "#A9BCD4" }), jsx("stop", { offset: "1", stopColor: "#3E5577" })
      ] }),
      jsx("clipPath", { id: `${id}wc`, clipPathUnits: "userSpaceOnUse", children: jsx("path", { d: path(winPts) }) })
    ] }),
    ...seq.flatMap((g) => cells[g]).filter(Boolean),
    plateDetail(1), plateDetail(-1)
  ] });
};
// ── THE SPLIT RING, THE TAG, THE LANYARD ──────────────────────────────────────────────────────────────────────────────
export const RING = { r: 40 };
/** the split ring hanging from the lug's hole (world): its centre, its plane (u along the hole's axis, v from the hole down to its
 *  lowest point), and the point it hangs things from. swing (deg) turns it about the hole's axis; it lies toward `away` on the table
 *  when the hole is too low for it to hang free. */
export const ringFrame = (hole, axis, away, top, swing = 0) => {
  const r = RING.r;
  const dy = clamp01((top - 2 - hole[1]) / (2 * r)), dz = Math.sqrt(Math.max(0, 1 - dy * dy));
  let dir = add(mul([0, 1, 0], dy), mul(unit([away[0], 0, away[2]]), dz));
  dir = unit(sub(dir, mul(axis, dot(dir, axis))));
  const w = cross(axis, dir), s = swing * D2R;
  const v = unit(add(mul(dir, Math.cos(s)), mul(w, Math.sin(s))));
  const c = add(hole, mul(v, r));
  return { c, r, u: axis, v, low: add(c, mul(v, r)) };
};
const ringPts = (rf, off = 0, n = 64) => Array.from({ length: n + 1 }, (_, q) => {
  const a = q / n * 2 * Math.PI;
  // a = 0 at the hole (top), π at the hanging point
  return add(add(rf.c, mul(rf.v, -Math.cos(a) * (rf.r + off * 0.3))), mul(rf.u, Math.sin(a) * (rf.r + off * 0.3) + off));
});
/** the split ring's segments in one layer: "top" segments are judged against the lug plane (lugN through the hole), "low" ones
 *  against the tag plane (tagN through tagO) */
export const RingPart = ({ rig, rf, which, part, lugO, lugN, tagO, tagN }) => {
  const eye = eyeOf(rig);
  // the wire's runs in this layer (consecutive segments joined, so the wire reads as one smooth round wire)
  const runs = [];
  for (const off of [-2.2, 2.2]) {
    const pts = ringPts(rf, off);
    let cur = null;
    for (let q = 0; q < pts.length - 1; q++) {
      const a = (q + 0.5) / (pts.length - 1) * 2 * Math.PI;
      const top = Math.cos(a) > 0;
      const m = mul(add(pts[q], pts[q + 1]), 0.5);
      const [O, N] = top ? [lugO, lugN] : [tagO, tagN];
      const front = dot(sub(m, O), N) * dot(sub(eye, O), N) > 0;
      // the split: the gap where the two turns cross over, at the side
      const gap = off > 0 && q > 13 && q < 18;
      const ok = (part === "top") === top && (which === "front") === front && !gap;
      if (ok) {
        if (!cur) {
          cur = { pts: [worldScr(rig, pts[q])], a, off };
          runs.push(cur);
        }
        cur.pts.push(worldScr(rig, pts[q + 1]));
      } else cur = null;
    }
  }
  const k = rig.persp / Math.max(1, rig.persp - worldView(rig, rf.c)[2]);
  return jsx("g", { "data-probe-skip": true, children: runs.map((r, i) => {
    const d = path(r.pts, false);
    const lit = 0.62 + (r.off > 0 ? 0.08 : 0);
    return jsxs("g", { children: [
      jsx("path", { d, stroke: "#060E1B", strokeWidth: f2(Math.max(1.2, 8.4 * k)), strokeLinecap: "round", strokeLinejoin: "round", fill: "none" }),
      jsx("path", { d, stroke: fill(lit), strokeWidth: f2(Math.max(0.9, 6.2 * k)), strokeLinecap: "round", strokeLinejoin: "round", fill: "none" }),
      jsx("path", { d, stroke: "#FFFFFF", strokeWidth: f2(Math.max(0.5, 2 * k)), strokeOpacity: 0.7, strokeLinecap: "round", strokeLinejoin: "round", fill: "none", transform: "translate(-0.8 -1)" })
    ] }, i);
  }) });
};
export const TAG = { w: 250, h: 136, t: 5, hole: 18, r: 18 };
/** the tag's frame: it hangs from `hang` (the ring's lowest point) through its hole, its face looking along `face` (the ring's axis:
 *  it threads the ring); where the hang point is too low for it to hang free it lies FACE UP on the table in front of the hang point
 *  and lifts about its hole as the whistle rises. (Flat on the table it can only lie under the whistle: any ray that meets both meets
 *  the whistle first. While it lifts, its part in front of the whistle's near end plane is painted again OVER the whistle: see
 *  `tagFrontClip`.) */
export const tagFrame = (hang, top, face, swing = 0) => {
  const len = TAG.h + 6;
  const dy = clamp01((top - TAG.t / 2 - 1 - hang[1]) / len), dz = Math.sqrt(Math.max(0, 1 - dy * dy));
  const base = Math.atan2(face[0], face[2]) + swing * D2R;
  const fh = [Math.sin(base), 0, Math.cos(base)];
  const ux = [Math.cos(base), 0, -Math.sin(base)];
  const dn = unit(add(mul([0, 1, 0], dy), mul(fh, dz)));
  const nrm2 = unit(cross(ux, dn));
  const o = add(hang, mul(dn, -(TAG.hole - 4)));
  return { o, u: ux, v: dn, n: nrm2, flat: 1 - dy };
};
/** the screen outline (an SVG/CSS path) of the part of the tag lying IN FRONT of the whistle's near end plane (local z = +HL, which
 *  bounds the whole whistle: anything beyond it is nearer the lens than every part of the whistle wherever the two overlap) — or null.
 *  The tag's outline is grown a little so its rim and engraving are inside the clip. */
export const tagFrontClip = (rig, tf, xf) => {
  const P0 = xfApply(xf, [0, 0, WH.HL]), N = unit(xfDir(xf, [0, 0, 1]));
  const eye = eyeOf(rig);
  if (dot(sub(eye, P0), N) <= 0) return null;
  const poly = rrectPts(TAG.w + 16, TAG.h + 16, TAG.r + 8, 5, 0, TAG.h / 2).map(([a, b]) => tagAt(tf, a, b, 0));
  const sd = (p) => dot(sub(p, P0), N);
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], da = sd(a), db = sd(b);
    if (da > 0) out.push(a);
    if (da > 0 !== db > 0) out.push(add(a, mul(sub(b, a), da / (da - db))));
  }
  if (out.length < 3) return null;
  return path(out.map((q) => worldScr(rig, q)));
};
export const tagAt = (tf, a, b, w = 0) => add(add(add(tf.o, mul(tf.u, a)), mul(tf.v, b)), mul(tf.n, w));
export const Tag = ({ id, rig, tf, name, role, on = 1, gleam = -1 }) => {
  const eye = eyeOf(rig);
  const S = (q) => worldScr(rig, q);
  const k = rig.persp / Math.max(1, rig.persp - worldView(rig, tf.o)[2]);
  const outline = rrectPts(TAG.w, TAG.h, TAG.r, 5, 0, TAG.h / 2);
  const seeFront = dot(tf.n, sub(eye, tagAt(tf, 0, TAG.h / 2, TAG.t / 2))) > 0;
  const sF = seeFront ? 1 : -1;
  const face = (w) => path(outline.map(([a, b]) => S(tagAt(tf, a, b, w))));
  // the plate's light: the key from the upper left on its face; the rim (its edge thickness) lit where it faces the key
  const rot = rotOf(rig);
  const nv = unit(rot(mul(tf.n, sF)));
  const vFace = chromeShade(nv, worldView(rig, tagAt(tf, 0, TAG.h / 2)), rig.persp, 1) * 0.55 + 0.3;
  const rims = [];
  for (let q = 0; q < outline.length; q++) {
    const a = outline[q], b = outline[(q + 1) % outline.length];
    const e = [b[0] - a[0], b[1] - a[1]];
    const on2 = [e[1], -e[0]];
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const sgn = on2[0] * mid[0] + on2[1] * (mid[1] - TAG.h / 2) > 0 ? 1 : -1;
    const n2 = unit(add(mul(tf.u, on2[0] * sgn), mul(tf.v, on2[1] * sgn)));
    const c = tagAt(tf, mid[0], mid[1]);
    if (dot(n2, sub(eye, c)) <= 0) continue;
    const v = chromeShade(unit(rot(n2)), worldView(rig, c), rig.persp, 1) * 0.7 + 0.2;
    rims.push({ d: path([S(tagAt(tf, a[0], a[1], -TAG.t / 2)), S(tagAt(tf, b[0], b[1], -TAG.t / 2)), S(tagAt(tf, b[0], b[1], TAG.t / 2)), S(tagAt(tf, a[0], a[1], TAG.t / 2))]), c: rampAt(STEEL, clamp01(v)) });
  }
  const border = rrectPts(TAG.w - 26, TAG.h - 26, TAG.r - 8, 4, 0, TAG.h / 2);
  const g0 = S(tagAt(tf, -TAG.w / 2, 0)), g1 = S(tagAt(tf, TAG.w / 2, TAG.h));
  const holeC = (w) => Array.from({ length: 25 }, (_, q) => {
    const a = q / 24 * 2 * Math.PI;
    return S(tagAt(tf, 7.5 * Math.cos(a), TAG.hole + 7.5 * Math.sin(a), w));
  });
  const eyelet = (w) => Array.from({ length: 25 }, (_, q) => {
    const a = q / 24 * 2 * Math.PI;
    return S(tagAt(tf, 12 * Math.cos(a), TAG.hole + 12 * Math.sin(a), w));
  });
  const brushed = Array.from({ length: 26 }, (_, q) => {
    const b = 8 + q * (TAG.h - 16) / 25;
    return path([S(tagAt(tf, -TAG.w / 2 + 6, b, sF * (TAG.t / 2 + 0.1))), S(tagAt(tf, TAG.w / 2 - 6, b + 0.6, sF * (TAG.t / 2 + 0.1)))], false);
  });
  const X = { m: [tf.u[0], tf.v[0], tf.n[0], tf.u[1], tf.v[1], tf.n[1], tf.u[2], tf.v[2], tf.n[2]], t: tf.o };
  const W = TAG.w - 44, H = 78;
  const sweepX = -TAG.w / 2 - 80 + (TAG.w + 160) * clamp01((gleam + 1) / 2);
  const run = (col, op, dy, dx = 0) => jsxs("div", { style: { position: "absolute", left: dx, top: dy, width: W, height: H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, opacity: op }, children: [
    jsx("div", { style: { ...label(36, col), letterSpacing: 2, lineHeight: 1 }, children: name }),
    jsx("div", { style: { ...label(20, col), letterSpacing: 5, lineHeight: 1 }, children: role })
  ] });
  return jsxs("div", { style: { position: "absolute", inset: 0 }, children: [
    jsxs("svg", { width: 1, height: 1, "data-probe-skip": true, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsxs("defs", { children: [
        jsxs("linearGradient", { id: `${id}tg`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
          jsx("stop", { offset: "0", stopColor: "#FFFFFF", stopOpacity: 0.32 }), jsx("stop", { offset: "0.42", stopColor: "#FFFFFF", stopOpacity: 0.04 }),
          jsx("stop", { offset: "0.58", stopColor: "#000000", stopOpacity: 0.04 }), jsx("stop", { offset: "1", stopColor: "#000000", stopOpacity: 0.3 })
        ] }),
        jsx("clipPath", { id: `${id}tc`, clipPathUnits: "userSpaceOnUse", children: jsx("path", { d: face(sF * TAG.t / 2) }) })
      ] }),
      // the far face first, then the visible rim strips (the plate's thickness), then the near face and its finish
      jsx("path", { d: face(-sF * TAG.t / 2), fill: rampAt(STEEL, 0.2) }),
      rims.map((r, q) => jsx("path", { d: r.d, fill: r.c, stroke: r.c, strokeWidth: 0.6 }, `r${q}`)),
      jsx("path", { d: face(sF * TAG.t / 2), fill: rampAt(STEEL, clamp01(vFace)) }),
      jsx("path", { d: face(sF * TAG.t / 2), fill: `url(#${id}tg)` }),
      jsx("g", { clipPath: `url(#${id}tc)`, children: brushed.map((d, q) => jsx("path", { d, stroke: q % 2 ? "#000000" : "#FFFFFF", strokeOpacity: q % 2 ? 0.07 : 0.09, strokeWidth: f2(Math.max(0.5, 0.9 * k)), fill: "none" }, q)) }),
      jsx("path", { d: face(sF * (TAG.t / 2 + 0.05)), fill: "none", stroke: "#F4F8FD", strokeOpacity: 0.55, strokeWidth: f2(Math.max(0.6, 1.3 * k)) }),
      // the engraved border: a groove and its lit lip
      jsx("path", { d: path(border.map(([a, b]) => S(tagAt(tf, a, b, sF * (TAG.t / 2 + 0.2))))), fill: "none", stroke: "#1A2A40", strokeWidth: f2(Math.max(0.6, 1.5 * k)), opacity: 0.75 }),
      jsx("path", { d: path(border.map(([a, b]) => S(tagAt(tf, a + 0.9, b + 0.9, sF * (TAG.t / 2 + 0.2))))), fill: "none", stroke: "#FFFFFF", strokeWidth: f2(Math.max(0.5, 0.8 * k)), opacity: 0.4 }),
      // the eyelet round the hole
      jsx("path", { d: path(eyelet(sF * (TAG.t / 2 + 0.3))), fill: rampAt(STEEL, clamp01(vFace + 0.15)), stroke: "#0B1524", strokeOpacity: 0.6, strokeWidth: f2(Math.max(0.5, 1 * k)) }),
      jsx("path", { d: path(holeC(sF * (TAG.t / 2 + 0.4))), fill: "#02060D", stroke: "#FFFFFF", strokeOpacity: 0.55, strokeWidth: f2(Math.max(0.5, 0.9 * k)) }),
      gleam > -1 && gleam < 1 && jsx("g", { clipPath: `url(#${id}tc)`, children: jsx("path", { d: path([[sweepX - 50, 0], [sweepX + 30, 0], [sweepX - 10, TAG.h], [sweepX - 90, TAG.h]].map(([a, b]) => S(tagAt(tf, a, b, sF * (TAG.t / 2 + 0.3))))), fill: "#FFFFFF", opacity: 0.3 * Math.sin(Math.PI * clamp01((gleam + 1) / 2)) }) })
    ] }),
    // the engraving: the cut letters (groove + lit lip) read faintly from the start, the black paint filling on the word
    seeFront && jsx(XPlane, { rig, x: X, u: -W / 2, v: TAG.hole + 18, w: TAG.t / 2 + 0.4, width: W, height: H, probe: "the whistle tag's engraving", children: jsxs("div", { style: { position: "relative", width: W, height: H }, children: [run("#F4F8FD", 0.4, 1.2, 1.0), run("#2A3E58", 0.45, 0)] }) }),
    seeFront && jsx(XPlane, { rig, x: X, u: -W / 2, v: TAG.hole + 18, w: TAG.t / 2 + 0.6, width: W, height: H, op: clamp01(on), probe: "the whistle tag's engraving", children: run("#0A1322", 1, 0) })
  ] });
};
/** the lanyard: a braided navy cord from a chrome crimp sleeve (on a jump link through the split ring) down to the table, then lying
 *  across it in a loose curve: `pts` (world) is its centre line from the crimp's end */
const braid = (rig, pts, k0) => {
  const S = pts.map((q) => worldScr(rig, q));
  const ks = pts.map((q) => rig.persp / Math.max(1, rig.persp - worldView(rig, q)[2]));
  const marks = [];
  let acc = 0;
  for (let i = 0; i < S.length - 1; i++) {
    const a = S[i], b = S[i + 1];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const t = [(b[0] - a[0]) / (L || 1), (b[1] - a[1]) / (L || 1)], n = [-t[1], t[0]];
    const w = 6 * ks[i] * k0;
    const step = Math.max(3, 5.2 * ks[i] * k0);
    while (acc < L) {
      const p = [a[0] + t[0] * acc, a[1] + t[1] * acc];
      // one braid chevron: two short diagonals meeting on the cord's centre line
      marks.push(`M${f2(p[0] + n[0] * w * 0.8 - t[0] * step * 0.5)},${f2(p[1] + n[1] * w * 0.8 - t[1] * step * 0.5)}L${f2(p[0])},${f2(p[1])}L${f2(p[0] - n[0] * w * 0.8 - t[0] * step * 0.5)},${f2(p[1] - n[1] * w * 0.8 - t[1] * step * 0.5)}`);
      acc += step;
    }
    acc -= L;
  }
  return marks.join("");
};
export const Lanyard = ({ rig, pts, top, sleeve, link }) => {
  const k = rig.persp / Math.max(1, rig.persp - worldView(rig, pts[0])[2]);
  const d = path(pts.map((q) => worldScr(rig, q)), false);
  // its shadow on the table (the resting part only), offset away from the key
  const shadowPts = pts.filter((q) => q[1] > top - 30).map((q) => worldScr(rig, [q[0] + 10, top, q[2] - 6]));
  const sh = shadowPts.length > 1 ? path(shadowPts, false) : null;
  const W = 11;
  const sv = sleeve.map((q) => worldScr(rig, q));
  const lk = link.map((q) => worldScr(rig, q));
  return jsxs("g", { "data-probe-skip": true, children: [
    sh && jsx("path", { d: sh, stroke: "#000000", strokeOpacity: 0.45, strokeWidth: f2(W * 1.5 * k), fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }),
    jsx("path", { d, stroke: rampAt(CORD, 0.12), strokeWidth: f2(W * 1.15 * k), fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }),
    jsx("path", { d, stroke: rampAt(CORD, 0.4), strokeWidth: f2(W * k), fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }),
    jsx("path", { d: braid(rig, pts, 1), stroke: rampAt(CORD, 0.72), strokeWidth: f2(Math.max(0.6, 1.5 * k)), strokeOpacity: 0.75, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d, stroke: "#9FC1E8", strokeOpacity: 0.22, strokeWidth: f2(W * 0.28 * k), fill: "none", strokeLinecap: "round", strokeLinejoin: "round", transform: `translate(${f2(-W * 0.22 * k)} ${f2(-W * 0.25 * k)})` }),
    // the jump link through the ring
    jsx("path", { d: path(lk, true), stroke: "#060E1B", strokeWidth: f2(5.2 * k), fill: "none" }),
    jsx("path", { d: path(lk, true), stroke: rampAt(CHROME, 0.75), strokeWidth: f2(3.4 * k), fill: "none" }),
    // the crimp sleeve: a short chrome tube with two crimp grooves
    jsx("path", { d: path(sv, false), stroke: "#060E1B", strokeWidth: f2(19 * k), strokeLinecap: "round", fill: "none" }),
    jsx("path", { d: path(sv, false), stroke: rampAt(CHROME, 0.55), strokeWidth: f2(16 * k), strokeLinecap: "round", fill: "none" }),
    jsx("path", { d: path(sv, false), stroke: rampAt(CHROME, 0.92), strokeWidth: f2(5 * k), strokeLinecap: "round", fill: "none", transform: `translate(${f2(-3.2 * k)} ${f2(-3.6 * k)})` }),
    [0.35, 0.62].map((t, q) => {
      const p = [sv[0][0] + (sv[1][0] - sv[0][0]) * t, sv[0][1] + (sv[1][1] - sv[0][1]) * t];
      const tt = unit([sv[1][0] - sv[0][0], sv[1][1] - sv[0][1], 0]), n = [-tt[1], tt[0]];
      return jsx("path", { d: `M${f2(p[0] + n[0] * 8 * k)},${f2(p[1] + n[1] * 8 * k)}L${f2(p[0] - n[0] * 8 * k)},${f2(p[1] - n[1] * 8 * k)}`, stroke: "#0A1426", strokeWidth: f2(1.6 * k), opacity: 0.7 }, q);
    })
  ] });
};
// ── THE BOARD TABLE ───────────────────────────────────────────────────────────────────────────────────────────────────
export const TBL = { x: 380, z: -320, L: 2800, D: 2700, T: 40, R: 70, band: 74, pad: { x: 1060, z: 520, w: 980, d: 560, r: 26, h: 7 } };
const hash = (i) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const GRAIN = Array.from({ length: 150 }, (_, i) => ({ z: hash(i), w: hash(i + 400), a: hash(i + 800), p: hash(i + 1200), x0: hash(i + 1600), len: hash(i + 2000) }));
/** the leather pad's outline on screen (the lacquer's reflections stop at it) */
export const padOutline = (rig, top) => path(rrectPts(TBL.pad.w, TBL.pad.d, TBL.pad.r, 6).map(([a, b]) => worldScr(rig, [TBL.pad.x + a, top - TBL.pad.h, TBL.pad.z + b])));
export const BoardTable = ({ id, rig, top, sheen = 0 }) => {
  const { x, z, L, D, T, R, band, pad } = TBL;
  const S = (q) => worldScr(rig, q);
  const P = (pts, close = true) => path(pts.map(S), close);
  const plan = (w, d, r, y = top, cx = x, cz = z) => rrectPts(w, d, r, 6).map(([a, b]) => [cx + a, y, cz + b]);
  const yT = top - 0.3;
  // the edge's front face (the bullnose, seen from above at the near side) and the apron below
  const near = z + D / 2;
  const edgeTop = [[x - L / 2, top, near], [x + L / 2, top, near]];
  const edge = [[x - L / 2, top, near], [x + L / 2, top, near], [x + L / 2, top + T, near - 6], [x - L / 2, top + T, near - 6]];
  const apron = [[x - L / 2 + 120, top + T, near - 60], [x + L / 2 - 120, top + T, near - 60], [x + L / 2 - 120, top + 520, near - 60], [x - L / 2 + 120, top + 520, near - 60]];
  // the veneer grain: long, gently waving streaks along x in the field; short cross streaks in the crossbanded border
  const field = { w: L - 2 * band, d: D - 2 * band };
  const grain = GRAIN.map((g, i) => {
    // a streak of the figure: its own length and place, waving gently (wider waves where the figure curls)
    const zz = z - field.d / 2 + field.d * g.z;
    const len = field.w * (0.25 + 0.6 * g.len), x0 = x - field.w / 2 + (field.w - len) * g.x0;
    const amp = 3 + 22 * g.a * g.a, fr = 0.6 + 1.6 * g.p;
    const pts = [];
    for (let s2 = 0; s2 <= 20; s2++) {
      const u = s2 / 20;
      pts.push([x0 + len * u, yT, zz + amp * Math.sin(u * Math.PI * 2 * fr + g.p * 9) + 9 * Math.sin(u * 5.3 + g.w * 7)]);
    }
    return { d: P(pts, false), o: 0.02 + 0.05 * g.w, light: g.a > 0.6, sw: 0.7 + 2.6 * g.w * g.w };
  });
  const cross1 = [];
  for (let i = 0; i < 140; i++) {
    const xx = x - L / 2 + band + (L - 2 * band) * (i + 0.5) / 140;
    for (const zz of [z - D / 2 + 8, z + D / 2 - band + 8]) cross1.push(P([[xx + 3 * hash(i), yT, zz], [xx + 2, yT, zz + band - 16]], false));
  }
  const fieldPlan = plan(field.w, field.d, 10);
  const string = (o) => plan(field.w + o, field.d + o, 12, yT - 0.1);
  // the leather pad (raised `h`): its side band, its top, the stitching
  const padTop = plan(pad.w, pad.d, pad.r, top - pad.h, pad.x, pad.z);
  const padBase = plan(pad.w, pad.d, pad.r, top, pad.x, pad.z);
  const stitch = plan(pad.w - 34, pad.d - 34, pad.r - 10, top - pad.h - 0.2, pad.x, pad.z);
  const padSides = [];
  for (let i = 0; i < padTop.length; i++) {
    const j = (i + 1) % padTop.length;
    const midz = (padTop[i][2] + padTop[j][2]) / 2 - pad.z, midx = (padTop[i][0] + padTop[j][0]) / 2 - pad.x;
    // only the sides facing the lens (the near and the side edges)
    if (midz < pad.d / 2 - 40 && Math.abs(midx) < pad.w / 2 - 30) continue;
    padSides.push(P([padBase[i], padBase[j], padTop[j], padTop[i]]));
  }
  const tg0 = S([x, yT, z - D / 2]), tg1 = S([x, yT, z + D / 2]);
  const lg0 = S([pad.x - pad.w / 2, top, pad.z - pad.d / 2]), lg1 = S([pad.x + pad.w / 2, top, pad.z + pad.d / 2]);
  const s0 = x - L / 2 - 600 + sheen;
  const bandAt = (a, w) => P([[s0 + a, yT - 0.4, z + D / 2], [s0 + a + w, yT - 0.4, z + D / 2], [s0 + a + w + 380, yT - 0.4, z - D / 2], [s0 + a + 380, yT - 0.4, z - D / 2]]);
  return jsxs("g", { children: [
    jsxs("defs", { children: [
      jsxs("linearGradient", { id: `${id}Tg`, gradientUnits: "userSpaceOnUse", x1: f2(tg0[0]), y1: f2(tg0[1]), x2: f2(tg1[0]), y2: f2(tg1[1]), children: [
        jsx("stop", { offset: "0", stopColor: "#040912" }), jsx("stop", { offset: "0.5", stopColor: "#0A1628" }), jsx("stop", { offset: "1", stopColor: "#13284A" })
      ] }),
      jsxs("linearGradient", { id: `${id}Lg`, gradientUnits: "userSpaceOnUse", x1: f2(lg0[0]), y1: f2(lg0[1]), x2: f2(lg1[0]), y2: f2(lg1[1]), children: [
        jsx("stop", { offset: "0", stopColor: rampAt(LEATHER, 0.42) }), jsx("stop", { offset: "0.6", stopColor: rampAt(LEATHER, 0.36) }), jsx("stop", { offset: "1", stopColor: rampAt(LEATHER, 0.27) })
      ] }),
      jsxs("pattern", { id: `${id}Lp`, patternUnits: "userSpaceOnUse", width: 7, height: 7, children: [
        jsx("circle", { cx: 1.5, cy: 2, r: 0.7, fill: "#000000", opacity: 0.22 }), jsx("circle", { cx: 5, cy: 5.2, r: 0.6, fill: "#9FC1E8", opacity: 0.07 })
      ] }),
      jsx("clipPath", { id: `${id}Tc`, clipPathUnits: "userSpaceOnUse", children: jsx("path", { d: P(plan(L - 8, D - 8, R - 4, yT)) }) }),
      jsx("clipPath", { id: `${id}Fc`, clipPathUnits: "userSpaceOnUse", children: jsx("path", { d: P(fieldPlan) }) })
    ] }),
    // the apron in shadow under the edge, the edge face (lit arris on top), then the top
    jsx("path", { d: P(apron), fill: "#030810" }),
    jsx("path", { d: P(edge), fill: "#0B1830" }),
    jsx("path", { d: P([[x - L / 2, top + T * 0.35, near - 2], [x + L / 2, top + T * 0.35, near - 2], [x + L / 2, top + T, near - 6], [x - L / 2, top + T, near - 6]]), fill: "#050C18" }),
    jsx("path", { d: P(plan(L, D, R)), fill: `url(#${id}Tg)` }),
    // the crossbanded border (grain across), the stringing inlay (a satin-steel line with its dark shadow line), the field's grain
    jsx("g", { clipPath: `url(#${id}Tc)`, children: cross1.map((d, i) => jsx("path", { d, stroke: i % 3 ? "#7FA3CE" : "#000000", strokeOpacity: i % 3 ? 0.03 : 0.1, strokeWidth: 1.2, fill: "none" }, i)) }),
    jsx("path", { d: P(fieldPlan), fill: "#081324", opacity: 0.55 }),
    jsx("g", { clipPath: `url(#${id}Fc)`, children: grain.map((g, i) => jsx("path", { d: g.d, stroke: g.light ? "#8FB2DD" : "#000000", strokeOpacity: g.light ? g.o : g.o * 2.2, strokeWidth: f2(g.sw), fill: "none" }, i)) }),
    jsx("path", { d: P(string(14)), fill: "none", stroke: "#000000", strokeOpacity: 0.55, strokeWidth: 3.2 }),
    jsx("path", { d: P(string(8)), fill: "none", stroke: "#9FB8D8", strokeOpacity: 0.55, strokeWidth: 2 }),
    jsx("path", { d: P(string(4)), fill: "none", stroke: "#E6F0FB", strokeOpacity: 0.18, strokeWidth: 0.9 }),
    // the lacquer's slow sheen
    jsxs("g", { clipPath: `url(#${id}Tc)`, children: [
      jsx("path", { d: bandAt(0, 110), fill: "#C9DAEE", opacity: 0.045 }),
      jsx("path", { d: bandAt(170, 30), fill: "#E6F0FB", opacity: 0.06 })
    ] }),
    // the bullnose's lit arris along the near edge
    jsx("path", { d: P(edgeTop, false), stroke: "#C9DAEE", strokeWidth: 2, opacity: 0.55, fill: "none" }),
    // the leather writing pad: its raised edge, its top (grained), the stitching, the lit near arris
    jsx("path", { d: P(padBase), fill: "#000000", opacity: 0.5, transform: "translate(6 8)" }),
    padSides.map((d, i) => jsx("path", { d, fill: rampAt(LEATHER, 0.18), stroke: rampAt(LEATHER, 0.18), strokeWidth: 0.6 }, `ps${i}`)),
    jsx("path", { d: P(padTop), fill: `url(#${id}Lg)` }),
    jsx("path", { d: P(padTop), fill: `url(#${id}Lp)` }),
    jsx("path", { d: P(stitch), fill: "none", stroke: "#000000", strokeOpacity: 0.5, strokeWidth: 2.4, strokeDasharray: "7 6", transform: "translate(0.8 1.2)" }),
    jsx("path", { d: P(stitch), fill: "none", stroke: "#8FB2DD", strokeOpacity: 0.55, strokeWidth: 1.6, strokeDasharray: "7 6" }),
    jsx("path", { d: P(padTop.filter((q) => q[2] > pad.z + pad.d / 2 - 30), false), fill: "none", stroke: "#A9C6E8", strokeOpacity: 0.3, strokeWidth: 1.4 })
  ] });
};
