// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { LOSS } from "./common";
import { GOLD_INK } from "./data";
import { cw, prism, rampAt } from "./solid_engine";
import { axisRot, child, circ, mul, objPath, objScr, paintObj, pol, rotZ, toWorld, worldView } from "./pie_world";

const CENT_G = { r: 27, t: 2 * 27 / 12.53, bev: 0.8 };
const G = 7.8;
const CU = [
  mixHex(GOLD_INK.deep, LOSS, 0.22),
  mixHex(GOLD_INK.dark, LOSS, 0.3),
  mixHex(GOLD_INK.mid, LOSS, 0.32),
  mixHex(GOLD_INK.face, LOSS, 0.3),
  mixHex(GOLD_INK.hi, LOSS, 0.2)
];
const SEG = 26;
const CENT = prism(cw(circ(0, 0, CENT_G.r, CENT_G.r, SEG)), CENT_G.t, CENT_G.bev, 0, 1);
const frac = (x) => x - Math.floor(x);
const jit = (i) => ({
  u: Math.sin(i * 12.9898) * 1.9,
  v: Math.cos(i * 78.233) * 1.9,
  a: Math.sin(i * 3.7) * 40,
  ax: i * 2.39996,
  amp: 34 + 38 * frac(Math.sin(i * 1.71) * 437.5),
  ph: 6.283 * frac(Math.sin(i * 5.3) * 911.1),
  dr: 0.78 + 0.44 * frac(Math.sin(i * 91.7) * 123.4),
  sx: 4 + 8 * frac(Math.sin(i * 7.77) * 301.9)
});
const N_STACKS = 6;
export const stackCounts = (n) => Array.from({ length: N_STACKS }, (_, s) => Math.floor(n / N_STACKS) + (s >= N_STACKS - n % N_STACKS ? 1 : 0));
const STEP = 11;
const DA = [0.3, -0.4, 0.2, -0.3, 0.4, -0.2], DR = [-1.5, 1.5, -2, 1, -1, 2];
const LEAN = [[0.16, -0.1], [-0.12, 0.14], [0.1, 0.18], [-0.18, -0.06], [0.14, 0.08], [-0.08, -0.16]];
const centStacks = (at, n) => {
  const r0 = Math.hypot(at[0], at[1]), a0 = Math.atan2(at[1], at[0]) * 180 / Math.PI;
  const counts = stackCounts(n);
  if (counts.reduce((a, b) => a + b, 0) !== n) throw new Error("pie_cents: the stacks must hold every cent");
  let first = 0;
  return counts.map((k, s) => {
    const st = { s, at: pol(r0 + DR[s], a0 - ((N_STACKS - 1) / 2 - s) * STEP + DA[s]), n: k, first, lean: LEAN[s] };
    first += k;
    return st;
  });
};
const slotOf = (st, i) => {
  const k = st.findIndex((q) => i >= q.first && i < q.first + q.n);
  return { k, lvl: i - st[k].first };
};
const centAt = (c, i, lvl, g) => {
  const drop = c.drop * jit(i).dr;
  const land = c.first + i * c.every, T = Math.sqrt(2 * drop / G), a = land - T;
  const rest = (lvl + 0.5) * CENT_G.t;
  const op = c.fade ? (() => {
    const x = clamp01((g - a) / c.fade);
    return x * x * (3 - 2 * x);
  })() : 1;
  if (g < a) return { h: rest + drop, u: 0, on: false, op: 0 };
  if (g < land) {
    const u = (g - a) / T;
    return { h: rest + drop * (1 - u * u), u, on: true, op };
  }
  return { h: rest, u: 1, on: true, op: 1 };
};
const centsDown = (c, g) => Math.max(0, Math.min(c.n, Math.floor((g - c.first) / c.every) + 1));
export const centsStart = (c) => c.first - Math.sqrt(2 * c.drop * 1.22 / G);
export const centsDone = (c) => c.first + (c.n - 1) * c.every;
export const centsTop = (P, at, n) => {
  const q = objScr(P, [at[0], at[1], n * CENT_G.t]);
  return { x: q[0], y: q[1] };
};
export const stacksTop = (P, at, n, down = n) => {
  const st = centStacks(at, n);
  const tops = st.map((q) => centsTop(P, q.at, Math.max(0, Math.min(q.n, down - q.first))));
  const feet = st.map((q) => centsTop(P, q.at, 0));
  const hi = tops.reduce((a, b) => b.y < a.y ? b : a), foot = feet.reduce((a, b) => b.y < a.y ? b : a);
  return { x: tops.reduce((a, b) => a + b.x, 0) / tops.length, y: hi.y, foot: foot.y };
};
const SH = [[-0.34, -0.42], [0.34, -0.42], [0.34, 0.02], [0.2, 0.27], [0, 0.42], [-0.2, 0.27], [-0.34, 0.02]];
const n1 = (v) => v.toFixed(1);
export const CentSeat = ({ P, at, w, ink, lip, n = 67 }) => {
  const ring = (c, r, dz = 0, du = 0, dv = 0) => objPath(P, circ(c[0] + du, c[1] + dv, r, r, 40).map(([u, v]) => [u, v, w + dz]));
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("g", { children: centStacks(at, n).map((q) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: ring(q.at, CENT_G.r + 3), fill: "#000000", opacity: 0.32 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: ring(q.at, CENT_G.r + 3), fill: "none", stroke: ink, strokeWidth: 1.8, opacity: 0.85 }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: ring(q.at, CENT_G.r + 4.2, 0.05, 0.6, 0.8), fill: "none", stroke: lip, strokeWidth: 0.8, opacity: 0.35 })
  ] }, q.s)) });
};
export const CentStack = ({ P, at, w, c, g, layer, coinR = 0 }) => {
  const R = CENT_G.r, h2 = CENT_G.t / 2;
  const st = centStacks(at, c.n);
  const depthOf = (u, v, z) => worldView(P.rig, toWorld(P, [u, v, z]))[2];
  const front = (q) => {
    const a = Math.atan2(q.at[1], q.at[0]);
    return depthOf(q.at[0], q.at[1], w) > depthOf(coinR * Math.cos(a), coinR * Math.sin(a), w) + 0.5;
  };
  const shown = st.filter((q) => !layer || layer === "front" === front(q)).sort((a, b) => depthOf(a.at[0], a.at[1], w) - depthOf(b.at[0], b.at[1], w));
  const down = centsDown(c, g);
  const groups = shown.map((q) => {
    const items = [];
    for (let l = 0; l < q.n; l++) {
      const i = q.first + l;
      const m = centAt(c, i, l, g);
      if (!m.on) continue;
      const j = jit(i), k = 1 - m.u;
      const tilt = m.u < 1 ? j.amp * Math.sin(j.ph + 7.5 * m.u) * Math.pow(Math.min(1, 1.6 * k), 1.3) : 0;
      const base = [q.at[0] + j.u + q.lean[0] * l, q.at[1] + j.v + q.lean[1] * l];
      const off = m.u < 1 ? [base[0] + j.sx * k * Math.cos(j.ax), base[1] + j.sx * k * Math.sin(j.ax)] : base;
      const turn = rotZ(j.a * 3 + 160 * k);
      const o = child(P, [off[0], off[1], w + m.h], Math.abs(tilt) > 1e-3 ? mul(axisRot([Math.cos(j.ax), Math.sin(j.ax), 0], tilt), turn) : turn);
      items.push({ i, h: m.h, o, air: m.u < 1, top: m.u >= 1 && (l === q.n - 1 || i === down - 1), op: m.op });
    }
    items.sort((a, b) => a.h - b.h);
    return { q, items, hTop: Math.max(0, Math.min(q.n, down - q.first)) * CENT_G.t };
  });
  if (!groups.some((gr) => gr.items.length)) return null;
  const shadeOf = (q, hTop) => {
    if (hTop <= 0) return null;
    const k = Math.min(hTop, 160) * 0.22;
    const pts = [
      ...circ(q.at[0] + 3, q.at[1] + 4, R + 2, R + 2, 24).map(([u, v]) => [u, v, w + 0.1]),
      ...circ(q.at[0] + 3 + 0.8 * k, q.at[1] + 4 + 1.1 * k, R + 6, R + 6, 24).map(([u, v]) => [u, v, w + 0.1])
    ];
    const s = pts.map((p2) => objScr(P, p2));
    const p = [...s].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    for (const x of p) {
      while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], x) <= 0) lo.pop();
      lo.push(x);
    }
    for (const x of [...p].reverse()) {
      while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], x) <= 0) hi.pop();
      hi.push(x);
    }
    const hull = [...lo.slice(0, -1), ...hi.slice(0, -1)];
    return `M${hull.map((x) => `${n1(x[0])},${n1(x[1])}`).join("L")}Z`;
  };
  const coin = (it, face) => {
    const painted = paintObj(CENT, it.o);
    const capSeen = painted.some((dw) => dw.face.cap && dw.face.n[2] > 0);
    return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { opacity: it.op < 0.999 ? it.op : void 0, children: [
      painted.map((dw, k) => {
        const f = dw.face;
        if (f.cap) {
          if (f.n[2] < 0) {
            const cc3 = rampAt(CU, 0.5 * dw.light);
            return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: cc3, stroke: cc3, strokeWidth: 0.4 }, k);
          }
          const cc2 = rampAt(CU, 0.78 * dw.light + 0.12);
          return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: cc2, stroke: cc2, strokeWidth: 0.4 }, k);
        }
        const l = f.bev ? f.n[2] > 0 ? 0.92 * dw.light + 0.14 : 0.45 * dw.light : 0.8 * dw.light + 0.04;
        const cc = rampAt(CU, l);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: cc, stroke: cc, strokeWidth: 0.5, strokeLinejoin: "round" }, k);
      }),
      face && (() => {
        const top = h2 + 0.15;
        if (!capSeen) return null;
        const ring = (r) => objPath(it.o, circ(0, 0, r, r, 28).map(([u, v]) => [u, v, top]));
        const sh = objPath(it.o, SH.map(([u, v]) => [u * R, v * R, top + 0.2]));
        return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: `${ring(R - CENT_G.bev - 0.4)} ${ring(0.82 * R)}`, fill: rampAt(CU, 0.86), fillRule: "evenodd", opacity: 0.55 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: ring(0.82 * R), fill: "none", stroke: CU[1], strokeWidth: 0.9, opacity: 0.7 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: sh, fill: "none", stroke: CU[1], strokeWidth: 1.2, opacity: 0.6, strokeLinejoin: "round" }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: sh, fill: "none", stroke: CU[4], strokeWidth: 0.7, opacity: 0.55, strokeLinejoin: "round", transform: "translate(-0.6 -0.7)" })
        ] });
      })()
    ] }, it.i);
  };
  const shades = layer === "front" ? [] : st.map((q) => ({ q, d: shadeOf(q, Math.max(0, Math.min(q.n, down - q.first)) * CENT_G.t), k: Math.max(0, Math.min(q.n, down - q.first)) }));
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { "data-probe-object": "the 67 cents paid back, in six short stacks", children: [
    shades.map(({ q, d, k }) => d && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, fill: "#000000", opacity: 0.34 * clamp01(k / 3) }, `s${q.s}`)),
    groups.map(({ q, items }) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
      items.filter((it) => !it.air).map((it) => coin(it, it.top)),
      items.filter((it) => it.air).map((it) => coin(it, true))
    ] }, q.s))
  ] });
};
