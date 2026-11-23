// @ts-nocheck
// ★ V36 "Bre-X Gold" — bx_bar.tsx: THE GOLD BAR (C$6 BILLION). Owned by builder H; the hook, hype and collapse places import it.
//   A real cast ingot standing on end: a trapezoid section (the stamped face narrower than the back), sloped ends, rounded long
//   edges, bevelled end edges, refined-gold metal lit by the one key light (bx_gold metalLight: lightOf + the studio reflection
//   boxes), a debossed cartouche on its face carrying the figure. Built on bx_core's loft engine, so the SAME bar can grow out of the
//   drill core (hook), out of a one-cent coin (hype), and crumble back to grey rock (collapse).
//
// API
//   BAR = { H, Wb, Wf, T, c, taper, bev }   the finished bar (world units ≈ px): 1150 tall, 440 / 372 wide (back / face), 170 deep
//   barXf(x, footY, z)                       the pose of a bar STANDING on the plane y = footY (local axis y, top at −H/2, face +z)
//   <BxBar id rig xf
//        m={1}                  0…1  the morph: 0 = the SOURCE shape (src), 1 = the bar. Section, length, taper and metal all lerp.
//        src={{ r, len, kind }}       the source: kind "rock" (a drill core: r CORE_R, len CORE_LEN) or "copper" (a coin: r, len =
//                                     its thickness), lying along the same local axis y (see bx_core: coreXf for a core in a tray)
//        glitter sparkle seed        the rock source's dust skin (bx_core RockSkin), faded out as the metal takes over
//        gold                         optional 0…1 override of the metal's spread/blend (default: from m)
//        gild={0}                    0…1 the rock source's dust skin thickening BEFORE the morph (its flecks spread over the whole
//                                     run, dense warm glints): the glittering core. Then, as m grows, a rock source turns to gold by
//                                     the metal SPREADING out of those specks (discs growing until they cover it); copper blends.
//        fig={{ text, on }}          the stamped figure (text from L(…), never typed); on 0…1 eases it in (≈ 20 f, a slight settle)
//        fine={{ text, on }}         optional small stamped line under the figure (e.g. L("barFine") if the integrator adds it)
//        crumble={0} crumbleFrames={60}  0…1 breaks the bar from the TOP into grey rock chunks + dust that fall (true gravity when
//                                     crumble is driven linearly over crumbleFrames) into a pile at the bar's foot; the broken top
//                                     shows grey rock inside a thin gold skin. Drive it with rLin; the pile is complete at 1 (the
//                                     body is gone from 0.985: only the rubble remains). The stamp hides once crumbling starts.
//        sheen={0}                   −1…1 slides the studio's sheen band across the face (a turn of the light)
//        capArt                       optional (props) => element drawn on the source's top cap while m < 1 (the coin's face)
//        dim stage probe />           (the bar can be scaled: put xfScale(k) in xf — the hype bar is the hook's at k = 0.6;
//                                     a source's r/len are then in the bar's local units, i.e. ÷ k)
//   <BarBody …same props… />  the body alone as an SVG <g> (to paint it inside another construction's order, e.g. a tray row);
//   <BarStamp rig xf m src fig fine crumble dim />  the stamp alone (HTML). ⚠ wrap BarBody + BarStamp in ONE div carrying
//                                     data-probe-object (the probe treats print and body as one object only under one ancestor)
//   barPoint(xf, which, m, src) → world point. "crown" = the lit upper-left corner of the face's top bevel (the flare source),
//                                 "face" = the stamp's centre, "foot" = the foot's centre on the floor, "top" = the top's centre
//   barCorners(xf, m, src) → 8 world points (TkFloor casters)    ·   barDims(m, src) → { len, qb, qf, qh, c, taper, bev }
//   barFaceXf(xf, m, src) → an xf whose x/y plane is the stamped face (y down the bar, z out of it): put your own XPlane print on it
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mix, mixHex, rInOut, rOut } from "./anim";
import { seeded } from "./common";
import { figure, label } from "./kit";
import { lightOf, rampAt } from "./solid_engine";
import { XPlane, normalM, unit3, worldScr, worldView, xfApply, xfMul, xfScale, xfTrans } from "./tk_rig";
import { BX_COPPER, BX_GOLD, BX_GOLD_DEEP, BX_ROCK, BX_ROCK_MIN, BX_STAMP, metalLight, rockLight } from "./bx_gold";
import { CORE_LEN, CORE_R, GrainDefs, GrainTex, RockSkin, StripDefs, StripPaths, loftGeo, loftPaint, profBar } from "./bx_core";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
export const BAR = { H: 1150, Wb: 440, Wf: 372, T: 170, c: 16, taper: 46, bev: 9 };
const A_R = Math.atan2((BAR.Wb - BAR.Wf) / 2, BAR.T - 2 * BAR.c);
export const barXf = (x, footY, z) => xfTrans([x, footY - BAR.H / 2, z]);
const SRC0 = { r: CORE_R, len: CORE_LEN, kind: "rock" };
export const barDims = (m = 1, src = SRC0) => {
  const k = clamp01(m);
  const qh = (BAR.T / 2 - BAR.c) * k, qb = (BAR.Wb / 2 - BAR.c) * k, qf = (BAR.Wf / 2 - BAR.c) * k;
  return { len: mix(src.len, BAR.H, k), qb, qf, qh, c: mix(src.r, BAR.c, k), taper: BAR.taper * k * k, bev: BAR.bev * clamp01(k * 1.4 - 0.2) };
};
// the metal: a source's own (rock / copper) blended into refined gold
const envOf = (vp) => 0.16 * Math.max(-1, Math.min(1, -vp[1] / 650));
const matOf = (kind, g) => ({
  light: (nv, vp) => ({ m: metalLight(nv, vp, 3200) + envOf(vp), r: kind === "copper" ? metalLight(nv, vp, 3200, 0.6) : rockLight(nv) }),
  ramp: (l, part) => {
    const gold = rampAt(BX_GOLD, Math.min(1, l.m * (part === "bev" ? 1.08 : 1)));
    const own = kind === "copper" ? rampAt(BX_COPPER, Math.min(1, l.r)) : rampAt(BX_ROCK, Math.max(0, Math.min(0.8, -0.12 + 1.06 * l.r)));
    return g >= 0.999 ? gold : g <= 1e-3 ? own : mixHex(own, gold, g);
  }
});
export const barCorners = (xf, m = 1, src = SRC0) => {
  const d = barDims(m, src), w = d.qb + d.c, h = d.qh + d.c, out = [];
  for (const x of [-w, w]) for (const y of [-d.len / 2, d.len / 2]) for (const z of [-h, h]) out.push(xfApply(xf, [x, y, z]));
  return out;
};
export const barPoint = (xf, which = "crown", m = 1, src = SRC0) => {
  const d = barDims(m, src);
  if (which === "crown") return xfApply(xf, [-(d.qf + d.c * 0.3), -d.len / 2 + d.taper + d.bev * 0.4, d.qh + d.c * 0.7]);
  if (which === "top") return xfApply(xf, [0, -d.len / 2 + d.taper / 2, 0]);
  if (which === "foot") return xfApply(xf, [0, d.len / 2, 0]);
  return xfApply(xf, [0, FACE_V(d), d.qh + d.c + 0.4]);
};
const FACE_V = (d) => -d.len * 0.06;
export const barFaceXf = (xf, m = 1, src = SRC0) => {
  const d = barDims(m, src);
  return xfMul(xf, xfTrans([0, 0, d.qh + d.c]));
};
// ── the stamp: a debossed cartouche with the figure, sized to the face ───────────────────────────────────────────────────────────
const STAMP = { w: 300, h: 330, r: 22, lip: 7 };
const Stamp = ({ rig, xf, d, k, fig, fine, dimK = 1 }) => {
  if (!fig || fig.on <= 1e-3 || k <= 0.02) return null;
  const on = clamp01(fig.on);
  const lines = String(fig.text).length > 6 && String(fig.text).includes(" ") ? [String(fig.text).split(" ")[0], String(fig.text).split(" ").slice(1).join(" ")] : [String(fig.text)];
  const W = STAMP.w, H = lines.length > 1 ? STAMP.h : 190, z = d.qh + d.c;
  // the stamp's own frame: centred on the face, scaled with the face while the bar forms
  const fx = xfMul(xf, xfMul(xfTrans([0, FACE_V(d), z]), xfScale(k)));
  const map = (q) => xfApply(fx, q);
  const P = (pts) => `M${pts.map((q) => {
    const s = worldScr(rig, map(q));
    return `${f2(s[0])},${f2(s[1])}`;
  }).join("L")}Z`;
  const rr = (w, h, r, z2 = 0.3) => {
    const pts = [];
    const c = (cx, cy, a0) => {
      for (let i = 0; i <= 5; i++) {
        const a = a0 + i / 5 * Math.PI / 2;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a), z2]);
      }
    };
    c(w / 2 - r, -h / 2 + r, -Math.PI / 2);
    c(w / 2 - r, h / 2 - r, 0);
    c(-w / 2 + r, h / 2 - r, Math.PI / 2);
    c(-w / 2 + r, -h / 2 + r, Math.PI);
    return pts;
  };
  const outer = P(rr(W, H, STAMP.r)), inner = P(rr(W - 2 * STAMP.lip, H - 2 * STAMP.lip, STAMP.r - 4, 0.35));
  // the recess walls: shaded on the upper-left (the light comes from there), lit on the lower-right
  const a0 = worldScr(rig, map([-W / 2, -H / 2, 0])), a1 = worldScr(rig, map([W / 2, H / 2, 0]));
  const big = lines.length > 1 ? 168 : 150, small = 74;
  const ink = (c, op, dx, dy) => jsxs("div", { style: { position: "absolute", left: dx, top: dy, width: W, height: H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: op }, children: [
    jsx("div", { style: { ...figure(big, c), letterSpacing: -3, lineHeight: 0.95 }, children: lines[0] }),
    lines[1] && jsx("div", { style: { ...figure(small, c), letterSpacing: 1, marginTop: 6, lineHeight: 1 }, children: lines[1] })
  ] });
  const sc = 0.95 + 0.05 * (1 - (1 - on) * (1 - on));
  return jsxs(jsx_runtime.Fragment, { children: [
    jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, "data-probe-skip": true, children: jsxs("g", { opacity: on, children: [
      jsx("defs", { children: jsxs("linearGradient", { id: `stw${Math.round(a0[0])}_${Math.round(a0[1])}`, gradientUnits: "userSpaceOnUse", x1: f2(a0[0]), y1: f2(a0[1]), x2: f2(a1[0]), y2: f2(a1[1]), children: [
        jsx("stop", { offset: "0", stopColor: rampAt(BX_GOLD_DEEP, 0.2 * dimK) }),
        jsx("stop", { offset: "0.55", stopColor: rampAt(BX_GOLD_DEEP, 0.5 * dimK) }),
        jsx("stop", { offset: "1", stopColor: rampAt(BX_GOLD, 0.95 * dimK) })
      ] }) }),
      jsx("path", { d: `${outer} ${inner}`, fillRule: "evenodd", fill: `url(#stw${Math.round(a0[0])}_${Math.round(a0[1])})` }),
      jsx("path", { d: inner, fill: rampAt(BX_GOLD, 0.66 * dimK), opacity: 0.55 })
    ] }) }),
    jsx(XPlane, { rig, x: fx, u: -W / 2, v: -H / 2, w: 0.6, width: W, height: H, op: on, probe: "the gold bar's stamped figure", children: jsxs("div", { style: { position: "relative", width: W, height: H, transform: `scale(${sc.toFixed(4)})`, transformOrigin: "50% 50%" }, children: [
      ink(BX_STAMP.lip, 0.85, 2.2, 3),
      ink(BX_STAMP.ink, 1, 0, 0)
    ] }) }),
    fine && fine.text && fine.on > 1e-3 && jsx(XPlane, { rig, x: fx, u: -W / 2, v: H / 2 + 26, w: 0.6, width: W, height: 40, op: clamp01(fine.on) * on, probe: "the gold bar's fine stamp", children: jsxs("div", { style: { position: "relative", width: W, height: 40 }, children: [
      jsx("div", { style: { position: "absolute", left: 1.5, top: 2, width: W, textAlign: "center", ...label(30, BX_STAMP.lip), opacity: 0.8 }, children: fine.text }),
      jsx("div", { style: { position: "absolute", left: 0, top: 0, width: W, textAlign: "center", ...label(30, BX_STAMP.ink) }, children: fine.text })
    ] }) })
  ] });
};
// ── the crumble: chunks breaking off the top, falling with gravity into a pile at the foot ──────────────────────────────────────────
const G_PX = 10.9;  // world units (≈ mm) per frame² — real gravity at 30 fps
const chunkMemo = new Map();
const chunksOf = (seed) => {
  if (chunkMemo.has(seed)) return chunkMemo.get(seed);
  const rnd = seeded(2203 * seed + 11);
  const out = Array.from({ length: 96 }, (_, i) => {
    const v = (i + rnd() * 0.9) / 96;
    return { v, th: rnd() * 2 * Math.PI, s: 30 + 52 * rnd(), spin: (rnd() - 0.5) * 0.22, rot: rnd() * 6.28, vo: 1.6 + 3.6 * rnd(), a: Array.from({ length: 7 }, () => 0.6 + 0.4 * rnd()), gold: rnd() < 0.62, lean: (rnd() - 0.5) * 0.6 };
  });
  chunkMemo.set(seed, out);
  return out;
};
// chunks break off the broken top at the section's skin, drift outward, fall with gravity and come to rest on the growing pile
const Crumble = ({ rig, xf, d, c, frames, seed, front }) => {
  const H = d.len, top = -H / 2, foot = H / 2;
  const map = (q) => xfApply(xf, q);
  const S = (q) => worldScr(rig, map(q));
  const W2 = d.qb + d.c, T2 = d.qh + d.c;
  const cc = clamp01(c);
  const pileR = W2 + 40 + 150 * Math.sqrt(cc), pileH = 230 * Math.pow(cc, 0.75);
  const pileY = (x, z) => {
    const q = Math.hypot(x / pileR, z / (pileR * 0.75));
    return foot - pileH * Math.max(0, 1 - q * q);
  };
  const zb = worldView(rig, map([0, 0, 0]))[2];
  const els = [];
  for (const k of chunksOf(seed)) {
    if (cc < k.v) continue;
    const t = (cc - k.v) * frames;
    const yb = top + k.v * H;
    const ox = Math.cos(k.th), oz = Math.sin(k.th);
    const sx = ox * W2, sz = oz * T2;
    // falling: outward drift + gravity; resting: on the pile where it came down
    let x = sx + ox * k.vo * t, z = sz + oz * k.vo * t;
    let y = yb + 0.5 * G_PX * t * t;
    const rest = pileY(x, z) - k.s * 0.22;
    const landed = y >= rest;
    if (landed) {
      const T = Math.sqrt(Math.max(0, 2 * (rest - yb) / G_PX));
      x = sx + ox * k.vo * T;
      z = sz + oz * k.vo * T;
      y = pileY(x, z) - k.s * 0.22;
    }
    const zc = worldView(rig, map([x, y, z]))[2];
    if (front !== (zc > zb)) continue;
    const p = S([x, y, z]);
    const sc = rig.persp / Math.max(1, rig.persp - zc);
    const s = k.s * sc;
    const ang = k.rot + k.spin * (landed ? Math.sqrt(Math.max(0, 2 * (rest - yb) / G_PX)) : t);
    const pts = k.a.map((r, i) => {
      const a = ang + i / k.a.length * 2 * Math.PI;
      return [p[0] + s * r * Math.cos(a) * 0.5, p[1] + s * r * Math.sin(a) * (0.42 + k.lean * 0.2)];
    });
    const P2 = (arr) => arr.map((q) => `${f2(q[0])},${f2(q[1])}`).join("L");
    const lit = [p, pts[4], pts[5], pts[6]], dk = [p, pts[1], pts[2], pts[3]];
    els.push(jsxs("g", { children: [
      jsx("path", { d: `M${P2(pts)}Z`, fill: rampAt(BX_ROCK, 0.36) }),
      jsx("path", { d: `M${P2(dk)}Z`, fill: rampAt(BX_ROCK, 0.16) }),
      jsx("path", { d: `M${P2(lit)}Z`, fill: rampAt(BX_ROCK, 0.6) }),
      k.gold && jsx("path", { d: `M${P2([pts[4], pts[5], pts[6], pts[0]])}`, stroke: rampAt(BX_GOLD, 0.82), strokeWidth: Math.max(1.4, s * 0.09), fill: "none", strokeLinecap: "round", strokeLinejoin: "round" })
    ] }, `${k.v}`));
  }
  // the pile: a mound of grey rock dust at the foot, its far half behind the bar
  const pile = [];
  if (cc > 1e-3 && !front) {
    const ring = [];
    for (let i = 0; i <= 48; i++) {
      const a = i / 48 * 2 * Math.PI;
      for (let j = 0; j <= 6; j++) {
        const q = j / 6, x = pileR * Math.cos(a) * (1 - q), z = pileR * 0.75 * Math.sin(a) * (1 - q);
        ring.push(S([x, pileY(x, z), z]));
      }
    }
    const h2 = hull2(ring);
    const g0 = S([-pileR * 0.5, foot - pileH, 0]), g1 = S([pileR * 0.4, foot, pileR * 0.6]);
    const gid = `pile${seed}_${Math.round(g0[0])}`;
    const rnd = seeded(77 + seed);
    const gr = Array.from({ length: 420 }, () => {
      const a = rnd() * 2 * Math.PI, q = Math.sqrt(rnd()) * 0.97, x = pileR * q * Math.cos(a), z = pileR * 0.75 * q * Math.sin(a);
      const p = S([x, pileY(x, z), z]);
      const s2 = 2 + 4 * rnd(), t = rnd();
      return { d: `M${f2(p[0] - s2)},${f2(p[1])}L${f2(p[0])},${f2(p[1] - s2 * 0.7)}L${f2(p[0] + s2)},${f2(p[1])}L${f2(p[0])},${f2(p[1] + s2 * 0.6)}Z`, t };
    });
    pile.push(jsxs("g", { children: [
      jsx("defs", { children: jsxs("linearGradient", { id: gid, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
        jsx("stop", { offset: "0", stopColor: rampAt(BX_ROCK, 0.6) }),
        jsx("stop", { offset: "0.55", stopColor: rampAt(BX_ROCK, 0.36) }),
        jsx("stop", { offset: "1", stopColor: rampAt(BX_ROCK, 0.15) })
      ] }) }),
      jsx("path", { d: `M${h2.map((q) => `${f2(q[0])},${f2(q[1])}`).join("L")}Z`, fill: `url(#${gid})` }),
      jsx("path", { d: gr.filter((q) => q.t < 0.45).map((q) => q.d).join(""), fill: BX_ROCK_MIN[0], opacity: 0.55 }),
      jsx("path", { d: gr.filter((q) => q.t >= 0.45 && q.t < 0.9).map((q) => q.d).join(""), fill: BX_ROCK_MIN[2], opacity: 0.35 }),
      jsx("path", { d: gr.filter((q) => q.t >= 0.9).map((q) => q.d).join(""), fill: rampAt(BX_GOLD, 0.7), opacity: 0.7 })
    ] }, "pile"));
  }
  // dust: a fine haze shed at the breaking front, drifting down
  const dust = [];
  if (cc > 1e-3 && cc < 1 && front) {
    const yb = top + cc * H, rnd = seeded(5 + seed);
    for (let i = 0; i < 90; i++) {
      const ph = rnd(), th = rnd() * 2 * Math.PI, sp = 0.5 + rnd(), r0 = rnd();
      const t = (ph * 36 + cc * frames * sp) % 36;
      const y = yb + 0.5 * 0.7 * t * t;
      if (y > foot) continue;
      const p = S([Math.cos(th) * (W2 + 6 + t * 1.6 * r0), y, Math.sin(th) * (T2 + 6 + t * 1.6 * r0)]);
      dust.push(jsx("circle", { cx: f2(p[0]), cy: f2(p[1]), r: f2(1 + 2 * rnd()), fill: rampAt(BX_ROCK, 0.72), opacity: f2(0.6 * (1 - t / 36)) }, i));
    }
  }
  return jsxs("g", { "data-probe-skip": true, children: [...pile, ...els, ...dust] });
};
const hull2 = (pts) => {
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
// the gold spreading out of the dust: discs on the visible surface, growing until they cover it
const spotMemo = new Map();
const spreadSpots = (rig, map, geo, d, g, seed) => {
  const key = seed;
  let pts = spotMemo.get(key);
  if (!pts) {
    const r = seeded(6151 + seed);
    pts = Array.from({ length: 150 }, () => ({ th: r() * 2 * Math.PI, u: r() - 0.5, k: 0.55 + 0.9 * r(), d: r() * 0.35 }));
    spotMemo.set(key, pts);
  }
  const W = d.qb + d.c, T = d.qh + d.c;
  const A = worldScr(rig, map([0, -d.len / 2, 0])), B = worldScr(rig, map([0, d.len / 2, 0])), C = worldScr(rig, map([W, 0, T]));
  const area = Math.hypot(B[0] - A[0], B[1] - A[1]) * (Math.hypot(C[0] - (A[0] + B[0]) / 2, C[1] - (A[1] + B[1]) / 2) * 2 + 8);
  const R = 2.6 * Math.sqrt(area / pts.length);
  return pts.map((p) => {
    const e = clamp01((g - p.d) / (1 - p.d));
    if (e <= 0) return "";
    const s = worldScr(rig, map([W * Math.cos(p.th), p.u * d.len, T * Math.sin(p.th)]));
    const rr = Math.max(0.5, R * p.k * e * e * (3 - 2 * e) + 1.5 * e);
    return `M${f2(s[0] - rr)},${f2(s[1])}a${f2(rr)},${f2(rr)} 0 1,0 ${f2(2 * rr)},0a${f2(rr)},${f2(rr)} 0 1,0 ${f2(-2 * rr)},0`;
  }).join("");
};
// the bar's painted body (pure SVG: a <g>, so a tray can paint it in its own order); BxBar = this + the stamp.
//   ⚠ Probe: print and body must share ONE data-probe-object ancestor — BxBar's div carries it; when you use BarBody + BarStamp
//   yourself, wrap both in one div with data-probe-object (BarBody's own `probe` is off by default).
export const BarBody = ({ id, rig, xf, m = 1, gold, gild = 0, src = SRC0, glitter = 0, dust = [0, 1], sparkle = 0, seed = 3, crumble = 0, crumbleFrames = 60, sheen = 0, capArt, probe }) => {
  const k = clamp01(m), gm = clamp01((k - 0.04) / 0.56);
  // the metal: a ROCK source turns to gold by SPREADING out of its dust specks (a gold copy under a mask of growing discs);
  //   a copper source blends. gild: the rock's dust skin thickening (denser flecks, glints) before the morph — the glittering core
  const gs = gm * gm * (3 - 2 * gm);
  const spread = src.kind === "rock";
  const g = gold != null ? clamp01(gold) : gs;
  const d0 = barDims(k, src);
  const cr = Math.min(0.985, clamp01(crumble));
  const gone = clamp01(crumble) >= 0.985;
  // the crumbling bar keeps only its lower part: the broken top at y = −len/2 + cr·len
  const cut = cr > 1e-3 ? -d0.len / 2 + cr * d0.len : null;
  const len = cut == null ? d0.len : d0.len / 2 - cut;
  const off = cut == null ? 0 : (cut + d0.len / 2) / 2;
  const prof = profBar({ qb: d0.qb, qf: d0.qf, qh: d0.qh, c: d0.c, n: 64, aR: A_R });
  const rnd = seeded(91 + seed);
  const jag = cut == null ? void 0 : (() => {
    const a = Array.from({ length: prof.pts.length }, () => rnd());
    return (end, j) => end === 0 ? (a[j] - 0.5) * 44 + 14 + 10 * Math.sin(j * 0.7 + seed) : 0;
  })();
  const geo = loftGeo({ prof, len, taper: cut == null ? d0.taper : 0, bev: cut == null ? d0.bev : 0, jag });
  const geoXf = xfMul(xf, xfTrans([0, off, 0]));
  const map = (q) => xfApply(geoXf, q);
  const pt = loftPaint(id, rig, map, geo, matOf(src.kind, spread ? 0 : g));
  const ptG = spread && g > 1e-3 && g < 0.999 ? loftPaint(`${id}G`, rig, map, geo, matOf(src.kind, 1)) : null;
  const goldAll = spread && g >= 0.999;
  const ptF = goldAll ? loftPaint(id, rig, map, geo, matOf(src.kind, 1)) : pt;
  const spots = ptG ? spreadSpots(rig, map, geo, d0, g, seed) : null;
  const top = pt.caps.find((c) => c.which === "top");
  // the top cap: gold (lit by its own normal) — or, broken, grey rock inside a thin gold skin
  const capFill = (c, gg = g) => {
    if (cut != null && c.which === "top") return rampAt(BX_ROCK, 0.1 + 0.75 * rockLight(c.n));
    const l = metalLight(c.n, c.c, 3200) + envOf(c.c);
    const gold = rampAt(BX_GOLD, Math.min(1, l * 1.02));
    const own = src.kind === "copper" ? rampAt(BX_COPPER, Math.min(1, l)) : rampAt(BX_ROCK, 0.04 + 0.8 * rockLight(c.n));
    return mixHex(own, gold, gg);
  };
  // the face's polish: a soft sheen band, a lit hairline on its top bevel, faint cooling ripples of the cast
  const fd = d0;
  const zf = fd.qh + fd.c + 0.4;
  const fy0 = -fd.len / 2 + fd.taper + fd.bev, fy1 = fd.len / 2 - fd.taper - fd.bev;
  const S = (x, y, z = zf) => {
    const p = worldScr(rig, xfApply(xf, [x, y, z]));
    return `${f2(p[0])},${f2(p[1])}`;
  };
  const sx = sheen * fd.qf;
  const cl = (x) => Math.max(-fd.qf, Math.min(fd.qf, x));
  const face = cut == null && g > 0.05 && fd.qf > 20;
  const band = face ? `M${[[cl(sx - fd.qf * 0.62), fy0], [cl(sx - fd.qf * 0.12), fy0], [cl(sx + fd.qf * 0.42), fy1], [cl(sx - fd.qf * 0.08), fy1]].map(([x, y]) => S(x, y)).join("L")}Z` : null;
  const band2 = face ? `M${[[cl(sx + fd.qf * 0.02), fy0], [cl(sx + fd.qf * 0.14), fy0], [cl(sx + fd.qf * 0.68), fy1], [cl(sx + fd.qf * 0.56), fy1]].map(([x, y]) => S(x, y)).join("L")}Z` : null;
  const hair = face ? `M${S(-fd.qf, fy0 - fd.bev * 0.5, zf + 0.2)}L${S(fd.qf, fy0 - fd.bev * 0.5, zf + 0.2)}` : null;
  const ripples = face ? RIPPLES.map((r) => `M${Array.from({ length: 13 }, (_, i) => {
    const x = -fd.qf * 0.94 + i / 12 * fd.qf * 1.88;
    return S(x, fy0 + r.v * (fy1 - fy0) + r.a * Math.sin(i * 0.9 + r.p) + r.b * (i / 12 - 0.5));
  }).join("L")}`).join("") : null;
  const skinOp = 1 - g;
  return jsxs("g", { "data-probe-object": probe || void 0, children: [
    cr > 1e-3 && jsx(Crumble, { rig, xf, d: d0, c: clamp01(crumble), frames: crumbleFrames, seed, front: false }),
    !gone && jsx(StripDefs, { strips: ptF.strips }),
    !gone && jsx(StripPaths, { strips: ptF.strips }),
    src.kind === "rock" && !goldAll && cut == null && jsxs("g", { children: [jsx(GrainDefs, {}), jsx(GrainTex, { clipId: `${id}gc`, strips: pt.strips, rig, map, len, r: d0.qb + d0.c, op: 0.5 })] }),
    !gone && ptF.caps.map((c) => jsx("path", { d: c.d, fill: capFill(c, goldAll ? 1 : spread ? 0 : g), stroke: capFill(c, goldAll ? 1 : spread ? 0 : g), strokeWidth: 0.6 }, c.which)),
    ptG && jsxs("g", { children: [
      jsx("defs", { children: jsxs("mask", { id: `${id}Mk`, maskUnits: "userSpaceOnUse", x: -4000, y: -4000, width: 9000, height: 9000, children: [
        jsx("rect", { x: -4000, y: -4000, width: 9000, height: 9000, fill: "#000000" }),
        jsx("path", { d: spots, fill: "#ffffff" })
      ] }) }),
      jsx(StripDefs, { strips: ptG.strips }),
      jsxs("g", { mask: `url(#${id}Mk)`, children: [
        jsx(StripPaths, { strips: ptG.strips }),
        ptG.caps.map((c) => jsx("path", { d: c.d, fill: capFill(c, 1), stroke: capFill(c, 1), strokeWidth: 0.6 }, c.which))
      ] })
    ] }),
    !gone && cut != null && top && jsx("path", { d: top.d, fill: "none", stroke: rampAt(BX_GOLD, 0.75), strokeWidth: 3.2, strokeLinejoin: "round", "data-probe-skip": true }),
    skinOp > 0.01 && src.kind === "rock" && jsx(RockSkin, { rig, map: (q) => xfApply(xf, q), len: d0.len, r: d0.c, seed, glitter: Math.min(1, glitter + 0.6 * k + gild), dust: [dust[0] * (1 - clamp01(gild)), dust[1] + (1.1 - dust[1]) * clamp01(gild)], sparkle, op: skinOp * (1 - clamp01(k * 2.2)) }),
    skinOp > 0.01 && src.kind === "rock" && (k > 0.02 || gild > 0.02) && jsx(Glints, { rig, map: (q) => xfApply(xf, q), d: d0, a: Math.max(Math.sin(Math.PI * clamp01(k * 1.2)), clamp01(gild) * (1 - k)) * skinOp, sparkle, seed }),
    capArt && top && k < 1 && capArt({ rig, map, y: -len / 2, r: d0.c, op: 1 - clamp01(k * 3) }),
    ripples && jsx("path", { d: ripples, stroke: rampAt(BX_GOLD_DEEP, 0.55), strokeWidth: 1.1, opacity: 0.16 * g, fill: "none", "data-probe-skip": true }),
    band && jsx("path", { d: band, fill: "#FFF6DA", opacity: 0.16 * g, style: { filter: "blur(6px)" }, "data-probe-skip": true }),
    band && jsx("path", { d: band, fill: "#FFF6DA", opacity: 0.08 * g, "data-probe-skip": true }),
    band2 && jsx("path", { d: band2, fill: "#FFF6DA", opacity: 0.09 * g, style: { filter: "blur(3px)" }, "data-probe-skip": true }),
    hair && jsx("path", { d: hair, stroke: "#FFF6DA", strokeWidth: 1.6, opacity: 0.6 * g, fill: "none", "data-probe-skip": true }),
    cr > 1e-3 && jsx(Crumble, { rig, xf, d: d0, c: clamp01(crumble), frames: crumbleFrames, seed, front: true })
  ] });
};
const RIPPLES = Array.from({ length: 9 }, (_, i) => {
  const r = seeded(4400 + i);
  return { v: 0.04 + 0.92 * (i + r()) / 9, a: 2 + 4 * r(), p: r() * 6, b: (r() - 0.5) * 30 };
});
// the stamp alone (HTML over the body) — the figure, eased in on its word
export const BarStamp = ({ rig, xf, m = 1, src = SRC0, fig, fine, crumble = 0, dim = 0 }) => {
  const k = clamp01(m), d0 = barDims(k, src);
  if (crumble > 1e-3) return null;
  return jsx(Stamp, { rig, xf, d: d0, k: clamp01((k - 0.45) / 0.55), fig, fine, dimK: 1 - 0.3 * dim });
};
/** the gold bar — see the API at the top of this file */
export const BxBar = (p) => jsxs("div", { "data-probe-object": p.probe ?? "the gold bar: a cast ingot standing on end, stamped", style: { position: "absolute", inset: 0, pointerEvents: "none" }, children: [
  jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(BarBody, { ...p, probe: null }) }),
  jsx(BarStamp, { ...p })
] });
// the glitter swelling into metal: a dense field of warm glints over the forming bar
const Glints = ({ rig, map, d, a, sparkle, seed }) => {
  if (a <= 0.01) return null;
  const rnd = seeded(311 + seed);
  const out = [];
  for (let i = 0; i < 420; i++) {
    const u = rnd() - 0.5, th = rnd() * 2 * Math.PI, ph = rnd() * 6.283, w = 0.08 + 0.1 * rnd();
    const x = (d.qb + d.c) * Math.cos(th) * 0.98, z = (d.qh + d.c) * Math.sin(th) * 0.98;
    const q = [x, u * d.len, z];
    const v = worldView(rig, map(q)), n = normalM(map, rig, [Math.cos(th), 0, Math.sin(th)], q);
    if (n[0] * -v[0] + n[1] * -v[1] + n[2] * (rig.persp - v[2]) <= 0) continue;
    const tw = Math.pow(0.5 + 0.5 * Math.sin(ph + sparkle * (0.2 + w)), 5);
    const s = worldScr(rig, map(q));
    out.push(jsx("circle", { cx: f2(s[0]), cy: f2(s[1]), r: f2(2.4 + 4.6 * tw), fill: tw > 0.6 ? "#FFF6DA" : "#F2C45C", opacity: (0.45 + 0.55 * tw) * a }, i));
  }
  return jsx("g", { "data-probe-skip": true, children: out });
};
