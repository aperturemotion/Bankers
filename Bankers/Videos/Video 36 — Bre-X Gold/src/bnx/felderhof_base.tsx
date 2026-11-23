// @ts-nocheck
// ★ V36 "Bre-X Gold" — builder F. The cash column's MACHINED BASE (felderhof): Video 35's baseline rail (sales_stack.tsx) cut down
//   to one column — a brushed steel beam with its end caps, a step groove and a row of screws, a fly-cut top pad screwed down at its
//   corners, and an engraved plaque in the beam's front that prints the year (1996) on its word. Same materials (sales_mat.ts).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { label } from "./kit";
import { prism, rampAt } from "./solid_engine";
import { XPlane, mapPath, paintXf, rrectPts, worldScr, wound, xfTrans } from "./tk_rig";
import { INK } from "./tk_mat";
import { TK_FLOOR_Y } from "./tk_slab";
import { SL_GROOVE, SL_LIP, SL_PAD, SL_RAIL, SL_STEEL } from "./sales_mat";
import { scrHull } from "./sales_stack";

export const FB = { len: 420, h: 56, d: 400, cap: 26, padW: 312, padH: 8, padD: 300, plaqueW: 170, plaqueH: 38 };
export const FB_TOP = TK_FLOOR_Y - FB.h;
export const FB_BASE = FB_TOP - FB.padH;   // the cash stands here
const f2 = (v) => v.toFixed(2);
let memo = null;
const parts = () => {
  if (memo) return memo;
  const beam = prism(rrectPts(FB.len, FB.h, 4, 2, 0, -FB.h / 2), FB.d, 5, 0, 1);
  const caps = [-1, 1].flatMap((s) => prism(rrectPts(FB.cap, FB.h + 14, 4, 2, s * (FB.len / 2 + FB.cap / 2 - 2), -(FB.h + 14) / 2), FB.d + 24, 4, 1, 1));
  const pad = prism(rrectPts(FB.padW, FB.padH, 2, 2, 0, -FB.h - FB.padH / 2), FB.padD, 2, 2, 2);
  memo = [wound(beam), wound(caps), wound(pad)];
  return memo;
};
/** the base at x (world), centred on z 0; `print` = { text, on } for the plaque; `shade` = world points of the column's foot shadow */
export const FdBase = ({ id, rig, x, print, shade }) => {
  const map = (q) => [q[0] + x, q[1] + TK_FLOOR_Y, q[2]];
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const [beam, caps, pad] = parts();
  const fillOf = (r, light, f) => rampAt(r, f.cap ? 0.62 * light + 0.06 : f.bev ? Math.min(1, 0.95 * light + 0.16) : 0.8 * light + 0.04);
  const ZF = FB.d / 2 + 0.4, H = FB.h, L = FB.len / 2;
  const topFace = P([[-L, -H - 0.3, -FB.d / 2], [L, -H - 0.3, -FB.d / 2], [L, -H - 0.3, FB.d / 2], [-L, -H - 0.3, FB.d / 2]]);
  const arris = P([[-L + 6, -H + 0.6, ZF], [L - 6, -H + 0.6, ZF]], false);
  const step = P([[-L + 10, -16, ZF], [L - 10, -16, ZF]], false), stepLip = P([[-L + 10, -14.8, ZF], [L - 10, -14.8, ZF]], false);
  const screwU = [-L + 34, -L + 84, L - 84, L - 34];
  const ring = (u, v, r, w) => Array.from({ length: 18 }, (_, i) => [u + r * Math.cos(i / 18 * 2 * Math.PI), v + r * Math.sin(i / 18 * 2 * Math.PI), w]);
  const screws = screwU.map((u) => ({
    bore: P(ring(u, -33, 6.2, ZF)),
    head: P(ring(u, -33, 4.6, ZF + 0.3)),
    slot: P([[u - 3.4, -34.4, ZF + 0.5], [u + 3.4, -31.6, ZF + 0.5]], false),
    g: [worldScr(rig, map([u - 4, -37, ZF])), worldScr(rig, map([u + 4, -29, ZF]))]
  }));
  const plaque = rrectPts(FB.plaqueW, FB.plaqueH, 8, 3, 0, -33).map(([a, b]) => [a, b, ZF]);
  const padTop = -H - FB.padH - 0.3;
  const padScrews = [-1, 1].flatMap((su) => [-1, 1].map((sw) => {
    const u = su * (FB.padW / 2 - 14), w = sw * (FB.padD / 2 - 14);
    const rr = (r) => Array.from({ length: 16 }, (_, i) => [u + r * Math.cos(i / 16 * 2 * Math.PI), padTop, w + r * Math.sin(i / 16 * 2 * Math.PI)]);
    return { bore: P(rr(6)), head: P(rr(4.4)) };
  }));
  const flyCut = Array.from({ length: 9 }, (_, k) => {
    const r = 150 + k * 9, c = -120, pts = [];
    for (let i = 0; i <= 24; i++) {
      const a = -0.55 + 1.1 * i / 24, u = c + r * Math.cos(a), w = r * Math.sin(a);
      if (Math.abs(u) < FB.padW / 2 - 6 && Math.abs(w) < FB.padD / 2 - 6) pts.push([u, padTop, w]);
    }
    return pts.length > 1 ? { d: P(pts, false), lit: k % 2 === 0 } : null;
  }).filter((q) => !!q);
  const brush = Array.from({ length: 8 }, (_, k) => P([[-L + 8, -H + 6 + k * 6, ZF + 0.1], [L - 8, -H + 6.4 + k * 6, ZF + 0.1]], false));
  const on = clamp01(print?.on ?? 0);
  const PW = FB.plaqueW - 22, PH = 34;
  const el = (c) => ({ ...label(28, c), transform: "scale(1.06)" });
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe-object": "the cash column's machined base", style: { position: "absolute", inset: 0 }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("defs", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("clipPath", { id: `${id}Tp`, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: topFace }) }),
        screws.map((s, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}S${k}`, gradientUnits: "userSpaceOnUse", x1: f2(s.g[0][0]), y1: f2(s.g[0][1]), x2: f2(s.g[1][0]), y2: f2(s.g[1][1]), children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: rampAt(SL_STEEL, 0.92) }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: rampAt(SL_STEEL, 0.5) }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: rampAt(SL_STEEL, 0.18) })
        ] }, k))
      ] }),
      paintXf(beam, map, rig, 0.45).map((dw, k) => {
        const c = fillOf(SL_RAIL, dw.light, dw.face);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, `b${k}`);
      }),
      paintXf(caps, map, rig, 0.55).map((dw, k) => {
        const c = fillOf(SL_RAIL, Math.min(1, dw.light * 1.08), dw.face);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, `c${k}`);
      }),
      shade && /* @__PURE__ */ (0,jsx_runtime.jsx)("g", { clipPath: `url(#${id}Tp)`, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: scrHull(rig, shade), fill: "#000000", opacity: 0.42, stroke: "#000000", strokeOpacity: 0.2, strokeWidth: 10, strokeLinejoin: "round" }) }),
      brush.map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: k % 2 ? "#ffffff" : "#000000", strokeWidth: 0.7, opacity: 0.035, fill: "none" }, `g${k}`)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: arris, stroke: "#ffffff", strokeWidth: 1.6, opacity: 0.42, fill: "none", strokeLinecap: "round" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: step, stroke: SL_GROOVE, strokeWidth: 2.2, opacity: 0.8, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: stepLip, stroke: SL_LIP, strokeWidth: 0.8, opacity: 0.35, fill: "none" }),
      screws.map((s, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: s.bore, fill: "#000000", opacity: 0.5 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: s.head, fill: `url(#${id}S${k})` }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: s.slot, stroke: "#000000", strokeWidth: 1.3, opacity: 0.6, fill: "none", strokeLinecap: "round" })
      ] }, `s${k}`)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(plaque.map(([a, b, c]) => [a + 1.2, b + 1.2, c])), stroke: SL_LIP, strokeWidth: 0.9, opacity: 0.42, fill: "none", strokeLinejoin: "round" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(plaque), stroke: SL_GROOVE, strokeWidth: 2.6, opacity: 0.88, fill: "none", strokeLinejoin: "round" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(plaque.map(([a, b, c]) => [a - 0.9, b - 0.9, c])), stroke: "#000000", strokeWidth: 0.9, opacity: 0.35, fill: "none", strokeLinejoin: "round" }),
      paintXf(pad, map, rig, 0.6).map((dw, k) => {
        const c = dw.face.cap ? rampAt(SL_PAD, 0.36 * dw.light + 0.04) : fillOf(SL_PAD, dw.light, dw.face);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.5, strokeLinejoin: "round" }, `p${k}`);
      }),
      flyCut.map((c, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: c.d, stroke: c.lit ? "#ffffff" : "#000000", strokeWidth: 1.1, opacity: c.lit ? 0.07 : 0.12, fill: "none" }, `fc${k}`)),
      padScrews.map((s, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: s.bore, fill: "#000000", opacity: 0.45 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: s.head, fill: rampAt(SL_STEEL, 0.62), stroke: rampAt(SL_STEEL, 0.9), strokeWidth: 0.6 })
      ] }, `ps${k}`))
    ] }),
    on > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x: xfTrans([x, TK_FLOOR_Y, 0]), u: -PW / 2, v: -33 - PH / 2, w: FB.d / 2 + 0.5, width: PW, height: PH, op: on, probe: "the base's year", children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "relative", width: PW, height: PH }, children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: 5.5, width: PW, textAlign: "center", ...el(SL_LIP), opacity: 0.32 }, children: print.text }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: 4, width: PW, textAlign: "center", ...el(SL_GROOVE), opacity: 0.85 }, children: print.text })
      ] }) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(XPlane, { rig, x: xfTrans([x, TK_FLOOR_Y, 0]), u: -PW / 2, v: -33 - PH / 2, w: FB.d / 2 + 0.7, width: PW, height: PH, op: on, probe: "the base's year", children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "relative", width: PW, height: PH }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 0, top: 2.5, width: PW, textAlign: "center", ...el(INK) }, children: print.text }) }) })
    ] })
  ] });
};
export const fdBaseCorners = (x) => {
  const out = [];
  for (const u of [x - FB.len / 2 - FB.cap, x + FB.len / 2 + FB.cap]) for (const y of [FB_TOP - 14, TK_FLOOR_Y]) for (const z of [-FB.d / 2, FB.d / 2]) out.push([u, y, z]);
  return out;
};
