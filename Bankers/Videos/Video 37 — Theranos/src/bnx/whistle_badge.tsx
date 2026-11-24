// @ts-nocheck
// ★ V37 "Theranos" — builder M. THE EMPLOYEE BADGE of the whistle place (no face, no person): a real ID badge lying on the
//   boardroom table — a clear vinyl holder (its punched slot, a lit rim, its thickness and contact shadow) holding the card: the
//   company header band (THERANOS), a BLANK photo window, the name TYLER SHULTZ, the role EMPLOYEE, a barcode and its number
//   strip; a clear strap clip with its steel snap through the slot to a steel swivel hook; and the LANYARD, a woven ribbon loop
//   with stitched edges, simulated as a chain on the table (it trails behind the sliding badge, swings on when it stops, settles).
//   Badge-local frame: u across the card, v DOWN the card from its top edge, w its normal (up out of the table).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { label } from "./kit";
import { SHOUT } from "./fonts";
import { XPlane, mapPath, worldScr, xfApply, xfMul, xfRotX, xfRotY, xfTrans } from "./tk_rig";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
// the card (CR80 proportion, a large vertical holder) and the holder round it
export const BG = { W: 130, H: 206, hw: 144, hh: 246, ht: 3, slotV: -24 };
/** the badge's pose: lying on the table top at (x, y, z), turned `yaw` degrees about the vertical */
export const badgeXf = (x, y, z, yaw, k = 1) => xfMul(xfTrans([x, y - BG.ht * k, z]), xfMul(xfRotY(yaw), xfMul({ m: [k, 0, 0, 0, k, 0, 0, 0, k], t: [0, 0, 0] }, xfRotX(90))));
/** world point on the badge (u, v on the card, w above it) */
export const badgeAt = (xf, u, v, w = 0) => xfApply(xf, [u, v, w]);
const HOLD = { u0: -BG.hw / 2, v0: -40, u1: BG.hw / 2, v1: BG.hh - 40 };
export const badgeCorners = (xf) => [[HOLD.u0, HOLD.v0], [HOLD.u1, HOLD.v0], [HOLD.u1, HOLD.v1], [HOLD.u0, HOLD.v1]].flatMap(([u, v]) => [badgeAt(xf, u, v, 0), badgeAt(xf, u, v, 4)]);
// ── the lanyard: a closed loop of ribbon, pinned at the swivel hook, dragged on the table (verlet chain, deterministic) ────────
export const LY = { n: 40, len: 640, w: 17, keep: 0.9, sub: 2, iters: 8 };
/**
 * Simulate the loop from frame g0 to g. hookAt(g) → [x, z] (world, on the table). Returns the points [x, z] (closed loop, pt 0
 * at the hook). The loop starts lying straight back along `trail` (a unit [x, z]) from the hook, as a slim loop.
 */
export const lanyardAt = (hookAt, g0, g, trail, k = 1) => {
  const n = LY.n, seg = LY.len * k / n;
  const h0 = hookAt(g0);
  const half = n / 2;
  const pts = Array.from({ length: n }, (_, i) => {
    const s = i <= half ? i / half : (n - i) / half;
    const side = i <= half ? 1 : -1;
    const along = s * (LY.len * k / 2) * 0.96;
    const wide = Math.sin(Math.PI * s) * 60 * k * side;
    return [h0[0] + trail[0] * along - trail[1] * wide, h0[1] + trail[1] * along + trail[0] * wide];
  });
  const prev = pts.map((p) => [...p]);
  const steps = Math.max(0, Math.round((g - g0) * LY.sub));
  for (let s = 1; s <= steps; s++) {
    const gg = g0 + s / LY.sub;
    for (let i = 1; i < n; i++) {
      const vx = (pts[i][0] - prev[i][0]) * LY.keep, vz = (pts[i][1] - prev[i][1]) * LY.keep;
      prev[i] = [pts[i][0], pts[i][1]];
      pts[i] = [pts[i][0] + vx, pts[i][1] + vz];
    }
    const h = hookAt(gg);
    prev[0] = pts[0];
    pts[0] = [h[0], h[1]];
    for (let it = 0; it < LY.iters; it++) {
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n, a = pts[i], b = pts[j];
        const dx = b[0] - a[0], dz = b[1] - a[1], d = Math.hypot(dx, dz) || 1e-6, e = (d - seg) / d / 2;
        const wa = i === 0 ? 0 : 1, wb = j === 0 ? 0 : 1, tot = wa + wb || 1;
        if (wa) a[0] += dx * e * 2 * wa / tot, a[1] += dz * e * 2 * wa / tot;
        if (wb) b[0] -= dx * e * 2 * wb / tot, b[1] -= dz * e * 2 * wb / tot;
      }
      // the ribbon's stiffness: no fold sharper than ~130° (neighbours two apart keep ≥ 1.8 segments)
      for (let i = 0; i < n; i++) {
        const j = (i + 2) % n, a = pts[i], b = pts[j];
        const dx = b[0] - a[0], dz = b[1] - a[1], d = Math.hypot(dx, dz) || 1e-6;
        if (d >= 1.8 * seg) continue;
        const e = (d - 1.8 * seg) / d / 2;
        const wa = i === 0 ? 0 : 1, wb = j === 0 ? 0 : 1, tot = wa + wb || 1;
        if (wa) a[0] += dx * e * 2 * wa / tot, a[1] += dz * e * 2 * wa / tot;
        if (wb) b[0] -= dx * e * 2 * wb / tot, b[1] -= dz * e * 2 * wb / tot;
      }
      pts[0] = [h[0], h[1]];
    }
  }
  return pts;
};
/** the ribbon drawn flat on the table (y), its quads in true perspective, a lighter centre weave and stitched edges */
const smoothLoop = (p, m = 4) => {
  // a closed Catmull-Rom through the chain's points: the ribbon bends in curves, never at the chain's joints
  const n = p.length, out = [];
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    for (let j = 0; j < m; j++) {
      const t = j / m, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
    }
  }
  return out;
};
export const Lanyard = ({ rig, pts: raw, y, k = 1, dim = 0 }) => {
  const pts = smoothLoop(raw);
  const n = pts.length, hw = LY.w * k / 2;
  const nrm = pts.map((p, i) => {
    const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
    const dx = b[0] - a[0], dz = b[1] - a[1], d = Math.hypot(dx, dz) || 1;
    return [-dz / d, dx / d];
  });
  const S = (x, z, off = 0, ii = 0) => worldScr(rig, [x + nrm[ii][0] * off, y, z + nrm[ii][1] * off]);
  const quads = [], centre = [], edges = [[], []];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, p = pts[i], q = pts[j];
    const a = S(p[0], p[1], hw, i), b = S(q[0], q[1], hw, j), c = S(q[0], q[1], -hw, j), d = S(p[0], p[1], -hw, i);
    // the ribbon's sheen: segments turned toward the key light (upper left) read a touch lighter
    const tx = q[0] - p[0], tz = q[1] - p[1], tl = Math.hypot(tx, tz) || 1;
    const lit = 0.5 + 0.5 * Math.abs((tx * 0.62 + tz * 0.78) / tl);
    quads.push({ d: `M${a.map(f2).join(",")}L${b.map(f2).join(",")}L${c.map(f2).join(",")}L${d.map(f2).join(",")}Z`, lit });
  }
  for (let i = 0; i <= n; i++) {
    const p = pts[i % n];
    centre.push(S(p[0], p[1], 0, i % n));
    edges[0].push(S(p[0], p[1], hw * 0.72, i % n));
    edges[1].push(S(p[0], p[1], -hw * 0.72, i % n));
  }
  const line = (ps) => `M${ps.map((q) => `${f2(q[0])},${f2(q[1])}`).join("L")}`;
  const tone = (l) => {
    const v = (0.55 + 0.45 * l) * (1 - 0.5 * dim);
    return `rgb(${Math.round(40 * v)},${Math.round(98 * v)},${Math.round(168 * v)})`;
  };
  // its contact shadow, offset away from the light
  const sh = pts.map((p, i) => S(p[0] + 5 * k, p[1] - 6 * k, 0, i));
  return jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    jsx("path", { d: line([...sh, sh[0]]), stroke: "#000000", strokeOpacity: 0.35, strokeWidth: LY.w * k * 0.9, fill: "none", strokeLinejoin: "round", style: { filter: "blur(3px)" } }),
    quads.map((q, i) => jsx("path", { d: q.d, fill: tone(q.lit), stroke: tone(q.lit), strokeWidth: 0.8, strokeLinejoin: "round" }, i)),
    jsx("path", { d: line(centre), stroke: "#9DBCE2", strokeOpacity: 0.35 * (1 - dim), strokeWidth: 1.6 * k, fill: "none", strokeLinejoin: "round" }),
    edges.map((e, i) => jsx("path", { d: line(e), stroke: "#9DB7D8", strokeOpacity: 0.3 * (1 - dim), strokeWidth: 0.8, strokeDasharray: "3 3", fill: "none" }, `e${i}`))
  ] });
};
// ── the badge ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const CARD = "#EEF3F9", CARD_INK = "#0B1E36", ROLE_INK = "#2C6AB0";
/** the badge: xf from badgeXf; texts { company, name, role } */
export const Badge = ({ id, rig, xf, texts, gleam = 0 }) => {
  const P = (pts, w = 0, close = true) => mapPath((q) => badgeAt(xf, q[0], q[1], w), rig, pts, close);
  const rr = (u0, v0, u1, v1, r, n = 4) => {
    const out = [];
    const c = [[u1 - r, v0 + r, -Math.PI / 2], [u1 - r, v1 - r, 0], [u0 + r, v1 - r, Math.PI / 2], [u0 + r, v0 + r, Math.PI]];
    for (const [cu, cv, a0] of c) for (let i = 0; i <= n; i++) {
      const a = a0 + i / n * Math.PI / 2;
      out.push([cu + r * Math.cos(a), cv + r * Math.sin(a)]);
    }
    return out;
  };
  const holder = rr(HOLD.u0, HOLD.v0, HOLD.u1, HOLD.v1, 10);
  const slot = rr(-18, BG.slotV - 4, 18, BG.slotV + 4, 4, 3);
  const shadow = holder.map(([u, v]) => [u + 6, v + 8]);
  // the strap clip: a clear vinyl strap from the slot up to the steel snap, then the swivel hook
  const strap = rr(-9, BG.slotV - 62, 9, BG.slotV + 6, 4, 3);
  const snap = Array.from({ length: 16 }, (_, i) => [7 * Math.cos(i / 16 * 2 * Math.PI), BG.slotV - 48 + 7 * Math.sin(i / 16 * 2 * Math.PI)]);
  const hookRing = Array.from({ length: 20 }, (_, i) => [9 * Math.cos(i / 20 * 2 * Math.PI), BG.slotV - 74 + 9 * Math.sin(i / 20 * 2 * Math.PI)]);
  const hookBody = rr(-6, BG.slotV - 104, 6, BG.slotV - 80, 5, 3);
  const g0 = worldScr(rig, badgeAt(xf, HOLD.u0, HOLD.v0)), g1 = worldScr(rig, badgeAt(xf, HOLD.u1, HOLD.v1));
  const sweep = -260 + 520 * clamp01(gleam);
  const band = P([[sweep - 40, HOLD.v0], [sweep + 10, HOLD.v0], [sweep + 120, HOLD.v1], [sweep + 70, HOLD.v1]], 3.4);
  const W = BG.W, H = BG.H;
  // the card's print, one plane (the holder's window over it)
  const print = jsxs("div", { style: { position: "relative", width: W, height: H, background: CARD, borderRadius: 6, overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(11,30,54,0.25)" }, children: [
    jsx("div", { style: { position: "absolute", left: 0, top: 0, width: W, height: 34, background: `linear-gradient(180deg, #123257 0%, ${CARD_INK} 100%)` } }),
    jsx("div", { style: { position: "absolute", left: 0, top: 9, width: W, textAlign: "center", ...label(15, "#EEF3F9"), letterSpacing: 3.5 }, children: texts.company }),
    // the photo window: BLANK (no face) — a framed empty field with the window's own sheen
    jsx("div", { style: { position: "absolute", left: (W - 64) / 2, top: 44, width: 64, height: 70, borderRadius: 3, background: "linear-gradient(150deg, #D3DFEC 0%, #BFD0E3 55%, #AFC3DA 100%)", boxShadow: "inset 0 0 0 1.5px rgba(11,30,54,0.35)" } }),
    jsx("div", { style: { position: "absolute", left: 0, top: 121, width: W, textAlign: "center", fontFamily: SHOUT, fontSize: 19, letterSpacing: 0.6, color: CARD_INK, whiteSpace: "nowrap", lineHeight: 1 }, children: texts.name }),
    jsx("div", { style: { position: "absolute", left: 0, top: 145, width: W, textAlign: "center", ...label(12, ROLE_INK), letterSpacing: 2.5 }, children: texts.role }),
    // the barcode (bars of the house ink) and its number strip under it
    jsx("div", { style: { position: "absolute", left: 22, top: 166, width: W - 44, height: 22, background: `repeating-linear-gradient(90deg, ${CARD_INK} 0px, ${CARD_INK} 1.4px, transparent 1.4px, transparent 3px, ${CARD_INK} 3px, ${CARD_INK} 5.2px, transparent 5.2px, transparent 6.4px, ${CARD_INK} 6.4px, ${CARD_INK} 7.2px, transparent 7.2px, transparent 9.6px)` } }),
    jsx("div", { style: { position: "absolute", left: 22, top: 191, width: W - 44, height: 3, background: "repeating-linear-gradient(90deg, rgba(11,30,54,0.55) 0px, rgba(11,30,54,0.55) 3px, transparent 3px, transparent 5px)" } })
  ] });
  return jsxs("div", { style: { position: "absolute", inset: 0 }, children: [
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      jsxs("defs", { children: [
        jsxs("linearGradient", { id: `${id}Hg`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
          jsx("stop", { offset: "0", stopColor: "#ffffff", stopOpacity: 0.22 }),
          jsx("stop", { offset: "0.5", stopColor: "#ffffff", stopOpacity: 0.05 }),
          jsx("stop", { offset: "1", stopColor: "#ffffff", stopOpacity: 0.12 })
        ] }),
        jsx("clipPath", { id: `${id}Hc`, children: jsx("path", { d: P(holder, 3.4) }) })
      ] }),
      // the contact shadow on the lacquer
      jsx("path", { d: P(shadow, -0.5), fill: "#000000", opacity: 0.45, style: { filter: "blur(5px)" } }),
      // the strap clip and the swivel hook (under the holder's top edge)
      jsx("path", { d: P(strap, 1.5), fill: "#C9D8EA", fillOpacity: 0.55, stroke: "#E8F0F9", strokeOpacity: 0.7, strokeWidth: 1 }),
      jsx("path", { d: P(snap, 3), fill: "#AEBBCA", stroke: "#4A5A6C", strokeWidth: 1 }),
      jsx("path", { d: P(hookRing, 2), fill: "none", stroke: "#B9C5D2", strokeWidth: 3.2 }),
      jsx("path", { d: P(hookBody, 2.4), fill: "#B9C5D2", stroke: "#4A5A6C", strokeWidth: 1 }),
      // the holder's thickness (its edge, a little below the face) and the holder's clear body
      jsx("path", { d: P(holder, 0), fill: "#9DB2CB", fillOpacity: 0.55, stroke: "#5D7896", strokeWidth: 1 }),
      jsx("path", { d: P(holder, 3), fill: "#DCE6F2", fillOpacity: 0.4 })
    ] }),
    jsx(XPlane, { rig, x: xfMul(xf, xfTrans([-W / 2, 0, 1.8])), u: 0, v: 0, w: 0, width: W, height: H, probe: "the badge's printed card", children: print }),
    jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      // the vinyl over the card: its sheen, the punched slot, the lit rim
      jsx("path", { d: P(holder, 3.4), fill: `url(#${id}Hg)` }),
      gleam > 0 && gleam < 1 && jsx("g", { clipPath: `url(#${id}Hc)`, children: jsx("path", { d: band, fill: "#ffffff", opacity: 0.35 * Math.sin(Math.PI * gleam) }) }),
      jsx("path", { d: P(slot, 3.5), fill: "#0B1626", fillOpacity: 0.75, stroke: "#ffffff", strokeOpacity: 0.4, strokeWidth: 0.8 }),
      jsx("path", { d: P(holder, 3.5), fill: "none", stroke: "#F2F7FC", strokeOpacity: 0.65, strokeWidth: 1.4 })
    ] })
  ] });
};
/** the hook's ring centre (badge coords) — where the lanyard is pinned */
export const HOOK_V = BG.slotV - 74;
