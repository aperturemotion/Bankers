// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { theme } from "./theme";
import { GRID_LIT, KEPT_SHARE } from "./data_lt";
import { figure } from "./kit";
import { cw, lightOf, prism, rampAt } from "./solid_engine";
import { axisRot, child, circ, facing, mul, objNormal, objPath, objScr, p2, paintObj, pol, rotX, rotY, rotZ, toWorld } from "./pie_world";
import { Screw, Sv, WPlane } from "./pie_kit";
import { PRINT } from "./pie_ink";
import { CentSeat, CentStack } from "./pie_cents";
import { COIN, COIN_CUT, RELIEF_HI, RELIEF_LO } from "./pie_mat";
import { PAD, PAD_FOOT, TICK, TICK_HI } from "./pie_mat_g";

const PIE_RIG = { cx: 540, cy: 900, persp: 1700 };
export const COIN_G = { R: 246, D: 34, bev: 3.2, rim: 20 };
const PAD_G = { R: 362, D: 40, bev: 5, FR: 326, FD: 16 };
const WEDGE_SPAN = 360 * KEPT_SHARE;
export const WEDGE_DIR = -12;
if (Math.abs(WEDGE_SPAN - 118.6) > 0.3) throw new Error("pie_coin: the wedge must be the true share kept (33.0 % = 118.6\xB0)");
const HALF = WEDGE_SPAN / 2;
const STEP = 1.5;
const TICK_A = (k) => WEDGE_DIR + HALF + 3.6 * (k + 0.5);
if (Array.from({ length: 100 }, (_, k) => TICK_A(k)).filter((a) => a < WEDGE_DIR + 360 - HALF).length !== GRID_LIT)
  throw new Error("pie_coin: the dial must light exactly 67 ticks under the part that stays");
export const padPose = (s) => ({ o: s.o, m: mul(mul(rotX(s.lean), rotY(s.tip)), rotZ(s.spin)), rig: PIE_RIG });
const coinPose = (s) => {
  const P = padPose(s), a = s.wob * Math.PI / 180, f = s.phi * Math.PI / 180;
  const hc = COIN_G.R * Math.sin(a) + COIN_G.D / 2 * Math.cos(a);
  return child(P, [0, 0, hc], s.wob > 1e-4 ? axisRot([-Math.sin(f), Math.cos(f), 0], s.wob) : rotZ(0));
};
const dirV = (deg, r) => pol(r, deg);
const wedgePose = (s) => {
  const d = dirV(WEDGE_DIR, s.out);
  return child(coinPose(s), [d[0], d[1], 0]);
};
export const coinCentre = (s) => {
  const q = objScr(coinPose(s), [0, 0, COIN_G.D / 2]);
  return { x: q[0], y: q[1] };
};
const CENTS_UV = [-104, -4];
const centsPoint = (s) => {
  const q = objScr(coinPose(s), [CENTS_UV[0], CENTS_UV[1], COIN_G.D / 2]);
  return { x: q[0], y: q[1] };
};
export const wedgePoint = (s) => {
  const c = dirV(WEDGE_DIR, 0.5 * COIN_G.R);
  const q = objScr(wedgePose(s), [c[0], c[1], COIN_G.D / 2]);
  return { x: q[0], y: q[1] };
};
const RIM_GLINT_A = -128;
export const rimPoint = (s) => {
  const c = dirV(RIM_GLINT_A - s.spin, COIN_G.R - 3);
  const q = objScr(coinPose(s), [c[0], c[1], COIN_G.D / 2]);
  return { x: q[0], y: q[1] };
};
export const padBottom = (s) => {
  const P = padPose(s);
  return Math.max(...circ(0, 0, PAD_G.R, PAD_G.R, 48).map(([u, v]) => objScr(P, [u, v, -PAD_G.D - PAD_G.FD])[1]));
};
const arcPts = (a0, a1, r) => {
  const pts = [pol(r, a0)];
  for (let k = Math.floor(a0 / STEP) + 1; k * STEP < a1 - 1e-6; k++) pts.push(pol(r, k * STEP));
  pts.push(pol(r, a1));
  return pts;
};
const apex = (q) => Math.hypot(q[0], q[1]) < 1e-6;
const sectorSolid = (a0, a1, mat) => {
  const pts = cw([[0, 0], ...arcPts(a0, a1, COIN_G.R)]);
  const n = pts.length;
  return prism(pts, COIN_G.D, COIN_G.bev, mat, 1, (i) => apex(pts[i]) || apex(pts[(i + 1) % n]));
};
const WHOLE = prism(cw(Array.from({ length: Math.round(360 / STEP) }, (_, k) => pol(COIN_G.R, k * STEP))), COIN_G.D, COIN_G.bev, 0, 1);
const MAIN = sectorSolid(WEDGE_DIR + HALF, WEDGE_DIR + 360 - HALF, 0);
const WEDGE = sectorSolid(WEDGE_DIR - HALF, WEDGE_DIR + HALF, 1);
const PAD_FACES = prism(cw(circ(0, 0, PAD_G.R, PAD_G.R, 144)), PAD_G.D, PAD_G.bev, 2, 1, () => false, [0, 0, -PAD_G.D / 2]);
const FOOT_FACES = prism(cw(circ(0, 0, PAD_G.FR, PAD_G.FR, 96)), PAD_G.FD, 2, 3, 1, () => false, [0, 0, -PAD_G.D - PAD_G.FD / 2]);
const SCREWS = [30, 82, 198, 246, 290, 330];
const STARS = Array.from({ length: 16 }, (_, i) => 360 * (i + 0.5) / 16);
const BEADS = Array.from({ length: 120 }, (_, i) => 3 * i + 1.5);
const DENTS = Array.from({ length: 180 }, (_, i) => 2 * i + 1);
const RAYS = Array.from({ length: 150 }, (_, i) => 2.4 * i + 0.6);
const starPts = (cx, cy, r, rot) => Array.from({ length: 10 }, (_, i) => {
  const a = rot + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.42 : r;
  return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
});
const inSpan = (sp, a, m = 0) => {
  if (!sp) return true;
  let x = a;
  while (x < sp.a0) x += 360;
  while (x >= sp.a0 + 360) x -= 360;
  return x >= sp.a0 + m && x <= sp.a1 - m;
};
const SP_MAIN = { a0: WEDGE_DIR + HALF, a1: WEDGE_DIR + 360 - HALF };
const SP_WEDGE = { a0: WEDGE_DIR - HALF, a1: WEDGE_DIR + HALF };
const n1 = (v) => v.toFixed(1);
const FaceDetail = ({ o, sp, id, capL }) => {
  const R = COIN_G.R - COIN_G.bev, ri = R - COIN_G.rim, w = COIN_G.D / 2 + 0.15;
  const a0 = sp ? sp.a0 : 0, a1 = sp ? sp.a1 : 360;
  const ring = (r) => arcPts(a0, a1, r).map(([u, v]) => [u, v, w]);
  const band = sp ? [...ring(R - 0.5), ...ring(ri).reverse()] : null;
  const close = !sp;
  const bandPath = sp ? objPath(o, band) : `${objPath(o, ring(R - 0.5))} ${objPath(o, ring(ri).reverse())}`;
  const beads = BEADS.filter((a) => inSpan(sp, a, 1.2)).map((a) => {
    const c = pol(ri - 12, a);
    return objPath(o, circ(c[0], c[1], 2.5, 2.5, 8).map(([u, v]) => [u, v, w + 0.2]));
  }).join(" ");
  const stars = STARS.filter((a) => inSpan(sp, a, 5)).map((a) => {
    const c = pol(0.74 * R, a);
    return objPath(o, starPts(c[0], c[1], 9, a * Math.PI / 180).map(([u, v]) => [u, v, w + 0.2]));
  }).join(" ");
  const dents = DENTS.filter((a) => inSpan(sp, a, 0.8)).map((a) => objPath(o, [[...pol(ri - 1.2, a), w + 0.2], [...pol(ri - 6, a), w + 0.2]], false)).join(" ");
  const rays = RAYS.filter((a) => inSpan(sp, a, 0.6)).map((a) => objPath(o, [[...pol(0.6 * R + 5, a), w + 0.1], [...pol(0.69 * R, a + 1.1), w + 0.1]], false)).join(" ");
  const rayRing = objPath(o, ring(0.7 * R), close);
  const inner = objPath(o, ring(0.6 * R), close);
  const innerLip = objPath(o, ring(0.6 * R + 1.6), close);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: bandPath, fill: rampAt(COIN, capL + 0.06), fillRule: "evenodd" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(o, ring(ri), close), fill: "none", stroke: `url(#${id})`, strokeWidth: 2.4 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(o, ring(R - 1), close), fill: "none", stroke: RELIEF_HI, strokeOpacity: 0.28, strokeWidth: 1 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: beads, fill: rampAt(COIN, capL + 0.22), opacity: 0.9 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: beads, fill: RELIEF_LO, opacity: 0.5, transform: "translate(0.9 1.1)", style: { mixBlendMode: "multiply" } }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: stars, fill: RELIEF_LO, opacity: 0.55, transform: "translate(1 1.2)" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: stars, fill: rampAt(COIN, capL + 0.2) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dents, stroke: RELIEF_LO, strokeWidth: 2.2, opacity: 0.55 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dents, stroke: RELIEF_HI, strokeWidth: 0.8, opacity: 0.22, transform: "translate(-0.6 -0.7)" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: rays, stroke: RELIEF_HI, strokeWidth: 0.8, opacity: 0.16 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: rays, stroke: RELIEF_LO, strokeWidth: 0.8, opacity: 0.3, transform: "translate(0.7 0.8)" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: rayRing, fill: "none", stroke: RELIEF_LO, strokeWidth: 1.3, opacity: 0.6 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(o, ring(0.7 * R + 1.4), close), fill: "none", stroke: RELIEF_HI, strokeWidth: 0.7, opacity: 0.24 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: inner, fill: "none", stroke: RELIEF_LO, strokeWidth: 1.8, opacity: 0.75 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: innerLip, fill: "none", stroke: RELIEF_HI, strokeWidth: 0.9, opacity: 0.3 })
  ] });
};
const CutBrush = ({ o, f }) => {
  const ws = f.pts.map((q) => q[2]), w0 = Math.min(...ws), w1 = Math.max(...ws);
  let a = f.pts[0], b = f.pts[0], best = -1;
  for (const q of f.pts) for (const r of f.pts) {
    const d = Math.hypot(q[0] - r[0], q[1] - r[1]);
    if (d > best) {
      best = d;
      a = q;
      b = r;
    }
  }
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: [0.22, 0.4, 0.58, 0.76].map((t, i) => {
    const w = w0 + (w1 - w0) * t;
    return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(o, [[a[0], a[1], w], [b[0], b[1], w]], false), stroke: i % 2 ? "#000000" : "#ffffff", strokeOpacity: 0.08, strokeWidth: 1 }, i);
  }) });
};
export const PieCoin = ({ s, front }) => {
  const P = padPose(s), C = coinPose(s), Wd = wedgePose(s);
  const id = s.id, so = 1 - 0.62 * s.stage;
  const R = COIN_G.R;
  const pad = [...paintObj(FOOT_FACES, P), ...paintObj(PAD_FACES, P)];
  const zp = 0.2;
  const padRing = (r, a0 = 0, a1 = 360) => objPath(P, arcPts(a0, a1, r).map(([u, v]) => [u, v, zp]), a1 - a0 >= 360);
  const ticks = Array.from({ length: 100 }, (_, k) => {
    const a = TICK_A(k), major = k % 10 === 9 || k === 66, r0 = R + 22, r1 = R + (major ? 50 : 38);
    return { k, d: objPath(P, [[...pol(r0, a), zp], [...pol(r1, a), zp]], false), lip: objPath(P, [[...pol(r0, a + 0.45), zp], [...pol(r1, a + 0.45), zp]], false), major };
  });
  const tickOn = (k) => k < GRID_LIT ? clamp01(s.ticks * (GRID_LIT + 6) - k) : 0;
  const wallGroove = (wz) => {
    const segs = [];
    let run = [];
    for (let i = 0; i <= 144; i++) {
      const a = i / 144 * 360, q = pol(PAD_G.R + 0.4, a);
      const vis = facing(P, [Math.cos(a * Math.PI / 180), Math.sin(a * Math.PI / 180), 0], [q[0], q[1], wz]) > 0;
      if (vis) run.push([q[0], q[1], wz]);
      else if (run.length) {
        if (run.length > 1) segs.push(objPath(P, run, false));
        run = [];
      }
    }
    if (run.length > 1) segs.push(objPath(P, run, false));
    return segs.join(" ");
  };
  const knurl = (dir) => {
    const segs = [];
    for (let i = 0; i < 240; i++) {
      const a0 = i / 240 * 360, a1 = a0 + dir * 2.2;
      const vis = (a) => {
        const q = pol(PAD_G.R + 0.4, a);
        return facing(P, [Math.cos(a * Math.PI / 180), Math.sin(a * Math.PI / 180), 0], [q[0], q[1], -20]) > 0;
      };
      if (!vis(a0) || !vis(a1)) continue;
      const p0 = pol(PAD_G.R + 0.4, a0), p1 = pol(PAD_G.R + 0.4, a1);
      segs.push(objPath(P, [[p0[0], p0[1], -15.5], [p1[0], p1[1], -24.5]], false));
    }
    return segs.join(" ");
  };
  const inlay = s.ticks * (GRID_LIT + 6);
  const shadowOf = (o, sp) => {
    const ring = (sp ? [[0, 0], ...arcPts(sp.a0, sp.a1, R)] : arcPts(0, 360, R)).map(([u, v]) => {
      const wpt = toWorld(o, [u, v, -COIN_G.D / 2]);
      const d = [wpt[0] - P.o[0], wpt[1] - P.o[1], wpt[2] - P.o[2]], m = P.m;
      const pu = m[0] * d[0] + m[3] * d[1] + m[6] * d[2], pv = m[1] * d[0] + m[4] * d[1] + m[7] * d[2], pw = m[2] * d[0] + m[5] * d[1] + m[8] * d[2];
      const h = Math.max(0, pw);
      return [pu + 0.3 * h + 4, pv + 0.42 * h + 5, zp + 0.1];
    });
    return objPath(P, ring);
  };
  const pieces = s.split ? [{ o: C, faces: MAIN, sp: SP_MAIN, k: "main" }, { o: Wd, faces: WEDGE, sp: SP_WEDGE, k: "wedge" }] : [{ o: C, faces: WHOLE, sp: null, k: "whole" }];
  const drawn = [];
  for (const pc of pieces) for (const dw of paintObj(pc.faces, pc.o)) {
    if (dw.face.cut && s.out < 0.4) continue;
    drawn.push({ ...dw, pc });
  }
  drawn.sort((a, b) => a.face.pass - b.face.pass || a.depth - b.depth);
  const capLight = lightOf(objNormal(C, [0, 0, 1]), 0);
  const dimOf = (pc) => pc.k === "wedge" ? 1 - 0.32 * clamp01(s.wedgeDim) : 1;
  const grad = (o, key, L) => {
    const g0 = objScr(o, [-0.85 * R, -0.85 * R, COIN_G.D / 2]), g1 = objScr(o, [0.85 * R, 0.85 * R, COIN_G.D / 2]);
    return /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: key, gradientUnits: "userSpaceOnUse", x1: n1(g0[0]), y1: n1(g0[1]), x2: n1(g1[0]), y2: n1(g1[1]), children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: rampAt(COIN, L + 0.14) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.3", stopColor: rampAt(COIN, L + 0.2) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.55", stopColor: rampAt(COIN, L - 0.02) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: rampAt(COIN, L - 0.2) })
    ] }, key);
  };
  const rimWall = (o, key) => {
    const g0 = objScr(o, [-0.7 * R, -0.7 * R, COIN_G.D / 2]), g1 = objScr(o, [0.7 * R, 0.7 * R, COIN_G.D / 2]);
    return /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: key, gradientUnits: "userSpaceOnUse", x1: n1(g0[0]), y1: n1(g0[1]), x2: n1(g1[0]), y2: n1(g1[1]), children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: RELIEF_LO, stopOpacity: 0.85 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: RELIEF_LO, stopOpacity: 0.3 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: RELIEF_HI, stopOpacity: 0.55 })
    ] }, key);
  };
  const reedOf = (dw) => {
    const cx = dw.face.pts.reduce((a2, q) => a2 + q[0], 0), cy = dw.face.pts.reduce((a2, q) => a2 + q[1], 0);
    let a = Math.atan2(cy, cx) * 180 / Math.PI;
    if (a < 0) a += 360;
    return Math.floor(a / STEP) % 2;
  };
  const scoreLines = [WEDGE_DIR - HALF, WEDGE_DIR + HALF].map((a) => {
    const r0 = R - 2, r1 = R - 2 - (R - 2) * clamp01(s.score);
    return objPath(C, [[...pol(r0, a), COIN_G.D / 2 + 0.6], [...pol(Math.max(0, r1), a), COIN_G.D / 2 + 0.6]], false);
  }).join(" ");
  const glintAt = rimPoint(s);
  const gl = clamp01(s.glint);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe-object": "the $1 coin on its pad: the coin (or its two pieces), the pad's dial, the value printed on the face", style: { position: "absolute", inset: 0 }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsxs)(Sv, { part: `${id}-pad`, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("defs", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsxs)("radialGradient", { id: `${id}Fs`, children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0%", stopColor: "#000000", stopOpacity: 0.55 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "55%", stopColor: "#000000", stopOpacity: 0.22 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "100%", stopColor: "#000000", stopOpacity: 0 })
        ] }),
        /* @__PURE__ */ (0,jsx_runtime.jsxs)("radialGradient", { id: `${id}Tg`, cx: "0.5", cy: "0.5", r: "0.5", children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: theme.accent, stopOpacity: 0.5 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: theme.accent, stopOpacity: 0 })
        ] }),
        (() => {
          const b0 = objScr(P, [-R, -R, 0]), b1 = objScr(P, [R, R, 0]);
          return /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Bz`, gradientUnits: "userSpaceOnUse", x1: n1(b0[0]), y1: n1(b0[1]), x2: n1(b1[0]), y2: n1(b1[1]), children: [
            /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: rampAt(PAD, 0.96) }),
            /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.28", stopColor: rampAt(PAD, 0.7) }),
            /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: rampAt(PAD, 0.42) }),
            /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.72", stopColor: rampAt(PAD, 0.78) }),
            /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: rampAt(PAD, 0.36) })
          ] });
        })()
      ] }),
      (() => {
        const c = objScr(P, [30, 40, -PAD_G.D - PAD_G.FD]), e = objScr(P, [PAD_G.R * 1.15 + 30, 40, -PAD_G.D - PAD_G.FD]), f = objScr(P, [30, PAD_G.R * 1.15 + 40, -PAD_G.D - PAD_G.FD]);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("ellipse", { cx: n1(c[0]), cy: n1(c[1] + 26), rx: n1(Math.abs(e[0] - c[0])), ry: n1(Math.max(40, Math.abs(f[1] - c[1]) * 0.75)), fill: `url(#${id}Fs)`, opacity: 0.8 * so });
      })(),
      pad.map((dw, k) => {
        const ramp = dw.face.mat === 3 ? PAD_FOOT : PAD;
        const top = dw.face.cap && dw.face.n[2] > 0;
        const c = top ? rampAt(ramp, 0.85 * dw.light + 0.02) : rampAt(ramp, dw.face.bev ? 0.85 * dw.light + 0.14 : 0.78 * dw.light);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.7, strokeLinejoin: "round" }, k);
      }),
      [-13, -27].map((wz) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: wallGroove(wz), stroke: TICK, strokeWidth: 1.6, opacity: 0.7, fill: "none" }, wz)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: knurl(1), stroke: TICK, strokeWidth: 1.1, opacity: 0.55, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: knurl(-1), stroke: TICK, strokeWidth: 1.1, opacity: 0.55, fill: "none" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: knurl(1), stroke: TICK_HI, strokeWidth: 0.6, opacity: 0.2, fill: "none", transform: "translate(-0.6 -0.6)" }),
      [R + 64, R + 80, R + 96, R + 108].map((r, i) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: padRing(r), fill: "none", stroke: i % 2 ? "#000000" : "#ffffff", strokeOpacity: 0.06, strokeWidth: 1 }, r)),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: padRing(R + 10), fill: "none", stroke: TICK, strokeWidth: 2, opacity: 0.75 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: `${padRing(R + 18)} ${padRing(R + 12)}`, fill: `url(#${id}Bz)`, fillRule: "evenodd" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: padRing(R + 12), fill: "none", stroke: TICK, strokeWidth: 1.1, opacity: 0.8 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: padRing(R + 18), fill: "none", stroke: TICK, strokeWidth: 0.9, opacity: 0.6 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: padRing(R + 21), fill: "none", stroke: TICK, strokeWidth: 3, opacity: 0.65 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: padRing(R + 22.4), fill: "none", stroke: TICK_HI, strokeWidth: 0.6, opacity: 0.22 }),
      inlay > 0.05 && /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { opacity: clamp01(inlay), children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: padRing(R + 21, TICK_A(0) - 1.6, TICK_A(0) - 1.6 + 3.6 * Math.min(GRID_LIT, inlay)), fill: "none", stroke: theme.accent, strokeWidth: 5, opacity: 0.3, strokeLinecap: "round" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: padRing(R + 21, TICK_A(0) - 1.6, TICK_A(0) - 1.6 + 3.6 * Math.min(GRID_LIT, inlay)), fill: "none", stroke: theme.accentBright, strokeWidth: 1.8, strokeLinecap: "round" })
      ] }),
      [WEDGE_DIR - HALF, WEDGE_DIR + HALF].map((a) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(P, [[...pol(R + 52, a), zp], [...pol(R + 66, a - 1.7), zp], [...pol(R + 66, a + 1.7), zp]]), fill: TICK, opacity: 0.9 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(P, [[...pol(R + 52, a), zp], [...pol(R + 66, a + 1.7), zp]], false), stroke: TICK_HI, strokeWidth: 0.7, opacity: 0.35 })
      ] }, a)),
      ticks.filter((t) => t.major).map((t) => {
        const a = TICK_A(t.k), q = pol(R + 57, a);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: objPath(P, circ(q[0], q[1], 2.6, 2.6, 10).map(([u, v]) => [u, v, zp])), fill: TICK, opacity: 0.85 }, `p${t.k}`);
      }),
      s.pour && /* @__PURE__ */ (0,jsx_runtime.jsx)(CentSeat, { P, at: s.pour.at, w: zp, ink: TICK, lip: TICK_HI, n: s.pour.c.n }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: padRing(PAD_G.R - 12), fill: "none", stroke: TICK, strokeWidth: 1.4, opacity: 0.6 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: padRing(PAD_G.R - 10.6), fill: "none", stroke: TICK_HI, strokeWidth: 0.8, opacity: 0.32 }),
      ticks.map((t) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: t.d, stroke: TICK, strokeWidth: t.major ? 2.8 : 1.7, strokeLinecap: "round", opacity: t.major ? 0.9 : 0.75 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: t.lip, stroke: TICK_HI, strokeWidth: 0.8, strokeLinecap: "round", opacity: t.major ? 0.45 : 0.28 })
      ] }, t.k)),
      ticks.map((t) => {
        const on = tickOn(t.k);
        return on > 3e-3 ? /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { opacity: on, children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: t.d, stroke: theme.accent, strokeWidth: t.major ? 6 : 4.6, strokeLinecap: "round", opacity: 0.28 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: t.d, stroke: theme.accentBright, strokeWidth: t.major ? 2.4 : 1.6, strokeLinecap: "round" })
        ] }, `l${t.k}`) : null;
      }),
      SCREWS.map((a, i) => {
        const q = pol(PAD_G.R - 24, a);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)(Screw, { o: P, u: q[0], v: q[1], w: zp, r: 6.5, ramp: PAD, rim: TICK, slot: 30 + 50 * i }, a);
      }),
      pieces.map((pc) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: shadowOf(pc.o, pc.sp), fill: "#000000", fillOpacity: 0.3, stroke: "#000000", strokeOpacity: 0.1, strokeWidth: 16, strokeLinejoin: "round" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: shadowOf(pc.o, pc.sp), fill: "none", stroke: "#000000", strokeOpacity: 0.05, strokeWidth: 34, strokeLinejoin: "round" })
      ] }, pc.k))
    ] }),
    s.pour && /* @__PURE__ */ (0,jsx_runtime.jsx)(Sv, { part: `${id}-cents`, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CentStack, { P, at: s.pour.at, w: zp, c: s.pour.c, g: s.pour.g, layer: "back", coinR: COIN_G.R }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)(Sv, { part: `${id}-coin`, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("defs", { children: [
        pieces.map((pc) => grad(pc.o, `${id}G${pc.k}`, 0.62 * capLight - 0.02 - (pc.k === "wedge" ? 0.22 * clamp01(s.wedgeDim) : 0))),
        pieces.map((pc) => rimWall(pc.o, `${id}Rw${pc.k}`)),
        /* @__PURE__ */ (0,jsx_runtime.jsxs)("radialGradient", { id: `${id}Gl`, cx: "0.5", cy: "0.5", r: "0.5", children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: "#ffffff", stopOpacity: 1 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.3", stopColor: theme.accentBright, stopOpacity: 0.6 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: theme.accent, stopOpacity: 0 })
        ] })
      ] }),
      drawn.map((dw, k) => {
        const f = dw.face, dim = dimOf(dw.pc);
        if (f.cap && f.n[2] > 0) {
          return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
            /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: `url(#${id}G${dw.pc.k})` }),
            /* @__PURE__ */ (0,jsx_runtime.jsx)(FaceDetail, { o: dw.pc.o, sp: dw.pc.sp, id: `${id}Rw${dw.pc.k}`, capL: (0.62 * capLight - 0.02) * dim })
          ] }, k);
        }
        if (f.cut) {
          const c2 = rampAt(COIN_CUT, dw.light * 0.95 * dim);
          return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
            /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c2, stroke: c2, strokeWidth: 0.6, strokeLinejoin: "round" }),
            /* @__PURE__ */ (0,jsx_runtime.jsx)(CutBrush, { o: dw.pc.o, f })
          ] }, k);
        }
        const l = f.bev ? 0.9 * dw.light + 0.16 : (reedOf(dw) ? 0.84 : 0.62) * dw.light + 0.02;
        const c = rampAt(COIN, l * dim);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.5, strokeLinejoin: "round" }, k);
      }),
      s.scoreOp > 3e-3 && s.score > 1e-3 && /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { opacity: clamp01(s.scoreOp), children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: scoreLines, stroke: theme.accent, strokeWidth: 5, strokeLinecap: "round", opacity: 0.35, fill: "none" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: scoreLines, stroke: theme.accentBright, strokeWidth: 1.6, strokeLinecap: "round", fill: "none" })
      ] }),
      gl > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)(
        "ellipse",
        {
          cx: n1(glintAt.x),
          cy: n1(glintAt.y),
          rx: n1(36 + 84 * gl),
          ry: n1(14 + 34 * gl),
          fill: `url(#${id}Gl)`,
          opacity: gl,
          transform: `rotate(-38 ${n1(glintAt.x)} ${n1(glintAt.y)})`
        }
      )
    ] }),
    front,
    s.dollar > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)(WPlane, { o: C, w: COIN_G.D / 2 + 0.6, op: clamp01(s.dollar), children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-print": "the coin's $1", style: { position: "absolute", left: -110, top: -52, width: 220, textAlign: "center", ...figure(104, PRINT) }, children: s.dollarText }) }),
    s.cents > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)(WPlane, { o: C, w: COIN_G.D / 2 + 0.6, op: clamp01(s.cents), children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-print": "the coin's 67\xA2", style: {
      position: "absolute",
      left: CENTS_UV[0] - 100,
      top: CENTS_UV[1] - 50,
      width: 200,
      textAlign: "center",
      ...figure(100, PRINT),
      ...s.printTurn ? { transform: `rotate(${s.printTurn}deg)`, transformOrigin: "50% 50%" } : {}
    }, children: s.centsText }) }),
    s.pour && /* @__PURE__ */ (0,jsx_runtime.jsx)(Sv, { part: `${id}-centsF`, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CentStack, { P, at: s.pour.at, w: zp, c: s.pour.c, g: s.pour.g, layer: "front", coinR: COIN_G.R }) })
  ] });
};
void p2;
