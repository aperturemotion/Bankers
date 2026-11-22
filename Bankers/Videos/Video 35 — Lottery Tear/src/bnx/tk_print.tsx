// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { seeded } from "./common";
import { mapPath, mapScr } from "./tk_rig";
import { TK_BAND, TK_BAR_INK, TK_FACE, TK_INK_BLUE, TK_INK_DEEP, TK_INK_NAVY, TK_INK_PALE, TK_INK_SOFT, TK_INK_TINT } from "./tk_mat";

const O0 = [[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0]];
const PB = [[0, 6], [0, 0], [3, 0], [4, 1], [4, 2.2], [3, 3.2], [0, 3.2]];
const GLYPH = {
  "0": [O0, [[3.3, 1], [0.7, 5]]],
  "1": [[[1, 1.2], [2.2, 0], [2.2, 6]], [[1, 6], [3.4, 6]]],
  "2": [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 2.2], [0, 6], [4, 6]]],
  "3": [[[0, 0], [4, 0], [2, 2.5], [3, 2.5], [4, 3.5], [4, 5], [3, 6], [1, 6], [0, 5]]],
  "4": [[[3, 6], [3, 0], [0, 4], [4, 4]]],
  "5": [[[4, 0], [0, 0], [0, 2.6], [3, 2.6], [4, 3.6], [4, 5], [3, 6], [0, 6]]],
  "6": [[[3.6, 0], [2, 0], [0, 2], [0, 5], [1, 6], [3, 6], [4, 5], [4, 3.7], [3, 2.8], [1, 2.8], [0, 3.6]]],
  "7": [[[0, 0], [4, 0], [1.4, 6]]],
  "8": [[[1, 0], [3, 0], [4, 1], [4, 2], [3, 2.9], [1, 2.9], [0, 2], [0, 1], [1, 0]], [[1, 2.9], [0, 3.9], [0, 5], [1, 6], [3, 6], [4, 5], [4, 3.9], [3, 2.9]]],
  "9": [[[0.4, 6], [2, 6], [4, 4], [4, 1], [3, 0], [1, 0], [0, 1], [0, 2.4], [1, 3.2], [3, 3.2], [4, 2.4]]],
  A: [[[0, 6], [0, 2], [2, 0], [4, 2], [4, 6]], [[0, 3.7], [4, 3.7]]],
  B: [[[0, 3], [3, 3], [4, 2.1], [4, 1], [3, 0], [0, 0], [0, 6], [3, 6], [4, 5], [4, 4], [3, 3]]],
  C: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5]]],
  D: [[[0, 0], [2.6, 0], [4, 1.4], [4, 4.6], [2.6, 6], [0, 6], [0, 0]]],
  E: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]],
  F: [[[4, 0], [0, 0], [0, 6]], [[0, 3], [3, 3]]],
  G: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5], [4, 3.4], [2.4, 3.4]]],
  H: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]],
  I: [[[1, 0], [3, 0]], [[2, 0], [2, 6]], [[1, 6], [3, 6]]],
  J: [[[4, 0], [4, 5], [3, 6], [1, 6], [0, 5]]],
  K: [[[0, 0], [0, 6]], [[4, 0], [0, 3.8]], [[1.4, 2.6], [4, 6]]],
  L: [[[0, 0], [0, 6], [4, 6]]],
  M: [[[0, 6], [0, 0], [2, 3], [4, 0], [4, 6]]],
  N: [[[0, 6], [0, 0], [4, 6], [4, 0]]],
  O: [O0],
  P: [PB],
  Q: [O0, [[2.4, 4.2], [4, 6.4]]],
  R: [PB, [[2, 3.2], [4, 6]]],
  S: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 2], [1, 2.9], [3, 3.1], [4, 4], [4, 5], [3, 6], [1, 6], [0, 5]]],
  T: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]],
  U: [[[0, 0], [0, 5], [1, 6], [3, 6], [4, 5], [4, 0]]],
  V: [[[0, 0], [2, 6], [4, 0]]],
  W: [[[0, 0], [0.8, 6], [2, 2.6], [3.2, 6], [4, 0]]],
  X: [[[0, 0], [4, 6]], [[4, 0], [0, 6]]],
  Y: [[[0, 0], [2, 3], [4, 0]], [[2, 3], [2, 6]]],
  Z: [[[0, 0], [4, 0], [0, 6], [4, 6]]],
  "-": [[[0.8, 3], [3.2, 3]]],
  ".": [[[1.7, 5.7], [2.3, 5.7]]],
  "/": [[[3.6, 0], [0.4, 6]]],
  ":": [[[2, 1.6], [2, 2.1]], [[2, 4.4], [2, 4.9]]],
  "*": [[[2, 0.6], [2, 5.4]], [[0, 1.8], [4, 4.2]], [[4, 1.8], [0, 4.2]]],
  " ": [],
  "#": [[[1.5, 0.4], [0.9, 5.6]], [[3.3, 0.4], [2.7, 5.6]], [[0.1, 2], [4, 2]], [[0, 4], [3.9, 4]]]
};
const ADV = 5.6;
const typeRun = (s, u, v, cap, align = -1, track = 0) => {
  const k = cap / 6, adv = ADV * k + track, w = s.length * adv - (ADV - 4) * k - track;
  const x0 = align === -1 ? u : align === 0 ? u - w / 2 : u - w;
  const out = [];
  [...s].forEach((ch, i) => {
    for (const pl of GLYPH[ch] ?? []) out.push(pl.map(([x, y]) => [x0 + i * adv + x * k, v - cap / 2 + y * k]));
  });
  return out;
};
const typeWidth = (s, cap, track = 0) => s.length * (ADV * cap / 6 + track) - (ADV - 4) * cap / 6 - track;
const ell = (cx, cy, rx, ry, n = 22) => Array.from({ length: n }, (_, i) => {
  const a = i / n * 2 * Math.PI;
  return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
});
const superE = (cx, cy, a, b, n = 2.7, N = 32) => Array.from({ length: N }, (_, i) => {
  const t = i / N * 2 * Math.PI, c = Math.cos(t), s = Math.sin(t);
  return [cx + a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), cy + b * Math.sign(s) * Math.pow(Math.abs(s), 2 / n)];
});
const star = (c, ro, ri, n, rot = -Math.PI / 2) => Array.from({ length: 2 * n }, (_, i) => {
  const a = rot + i * Math.PI / n, r = i % 2 ? ri : ro;
  return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
});
const rect = (u0, v0, u1, v1) => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
const rrect = (u0, v0, u1, v1, r) => {
  const out = [];
  const c = (cx, cy, a0) => {
    for (let i = 0; i <= 4; i++) {
      const a = a0 + i / 4 * (Math.PI / 2);
      out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  c(u1 - r, v0 + r, -Math.PI / 2);
  c(u1 - r, v1 - r, 0);
  c(u0 + r, v1 - r, Math.PI / 2);
  c(u0 + r, v0 + r, Math.PI);
  return out;
};
const ring = (p) => [...p, p[0]];
const clipBox = (p, u0, v0, u1, v1) => {
  const edge = (q2, inn, cut) => {
    const out = [];
    for (let i = 0; i < q2.length; i++) {
      const A = q2[i], B = q2[(i + 1) % q2.length];
      if (inn(A)) {
        out.push(A);
        if (!inn(B)) out.push(cut(A, B));
      } else if (inn(B)) out.push(cut(A, B));
    }
    return out;
  };
  const atU = (u) => (a, b) => [u, a[1] + (b[1] - a[1]) * (u - a[0]) / (b[0] - a[0])];
  const atV = (v) => (a, b) => [a[0] + (b[0] - a[0]) * (v - a[1]) / (b[1] - a[1]), v];
  let q = edge(p, (x) => x[0] >= u0, atU(u0));
  if (q.length) q = edge(q, (x) => x[0] <= u1, atU(u1));
  if (q.length) q = edge(q, (x) => x[1] >= v0, atV(v0));
  if (q.length) q = edge(q, (x) => x[1] <= v1, atV(v1));
  return q;
};
const waveRun = (u0, u1, vc, amp, n, ph0, f1 = 23, f22 = 71, gap = 1.4) => Array.from({ length: n }, (_, j) => {
  const ph = ph0 + j * 0.62, steps = Math.max(8, Math.round((u1 - u0) / 6));
  return Array.from({ length: steps + 1 }, (_2, i) => {
    const u = u0 + (u1 - u0) * i / steps;
    return [u, vc + amp * Math.sin(u / f1 + ph) * Math.cos(u / f22 - ph * 0.7) + (j - (n - 1) / 2) * gap];
  });
});
const rosette = (c, R, n = 12, rings = 3, pts = 160) => Array.from({ length: rings }, (_, j) => Array.from({ length: pts + 1 }, (_2, i) => {
  const t = i / pts * 2 * Math.PI, r = R * (0.6 + 0.3 * Math.cos(n * t + j * 0.9)) * (0.93 + 0.07 * Math.cos(3 * t + j));
  return [c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)];
}));
const microRow = (a, b, seed, len = [1.6, 4.2]) => {
  const rnd = seeded(seed), L = Math.hypot(b[0] - a[0], b[1] - a[1]), dx = (b[0] - a[0]) / L, dy = (b[1] - a[1]) / L, out = [];
  let s = 0;
  while (s < L - 2) {
    const l = Math.min(L - s, len[0] + rnd() * (len[1] - len[0]));
    out.push([[a[0] + dx * s, a[1] + dy * s], [a[0] + dx * (s + l), a[1] + dy * (s + l)]]);
    s += l + 1.4 + (rnd() < 0.12 ? 3 : 0);
  }
  return out;
};
const dotted = (u0, u1, v, step = 6) => {
  const out = [];
  for (let u = u0; u <= u1 + 0.01; u += step) out.push([[u - 0.4, v], [u + 0.4, v]]);
  return out;
};
const barRuns = (a, b, seed, m = 2.2) => {
  const rnd = seeded(seed), out = [];
  let x = a;
  const put = (w, gap) => {
    out.push([x, x + w * m]);
    x += (w + gap) * m;
  };
  put(1, 1);
  put(1, 1);
  while (x < b - 8 * m) put(1 + Math.floor(rnd() * 3.2), 1 + Math.floor(rnd() * 2.6));
  x = Math.max(x, b - 4 * m);
  put(1, 1);
  put(1, 0);
  return out;
};
const stacked = (u0, u1, v0, v1, rows, seed) => {
  const out = [], m = 1.6, rh = (v1 - v0) / rows, rnd = seeded(seed);
  const guard = (x, widths, dir) => {
    let s = x;
    widths.forEach((w, i) => {
      if (i % 2 === 0) out.push(dir > 0 ? rect(s, v0, s + w * m, v1) : rect(s - w * m, v0, s, v1));
      s += dir * w * m;
    });
    return s;
  };
  const a = guard(u0, [8, 1, 1, 1, 1, 1, 1, 3], 1) + 2 * m, b = guard(u1, [7, 1, 1, 3, 1, 1, 1, 2, 1], -1) - 2 * m;
  for (let r = 0; r < rows; r++) {
    const y0 = v0 + r * rh + 0.3, y1 = v0 + (r + 1) * rh - 0.3;
    let x = a;
    while (x < b - 3 * m) {
      const w = Math.min(b - x, (1 + Math.floor(rnd() * 3.4)) * m);
      if (rnd() < 0.56) out.push(rect(x, y0, x + w, y1));
      x += w + (rnd() < 0.5 ? m : 0);
    }
  }
  return out;
};
const WM = [
  { w: 6.4, polys: (x) => [[[x, 0], [x + 2.95, 0], [x + 2.95, 7.35], [x + 6.4, 7.35], [x + 6.4, 10], [x, 10]]] },
  // L
  { w: 8.4, polys: (x) => [superE(x + 4.2, 5, 4.2, 5), superE(x + 4.2, 5, 1.45, 2.55, 2.4).reverse()] },
  // O
  { w: 7.2, polys: (x) => [[[x, 0], [x + 7.2, 0], [x + 7.2, 2.65], [x + 5.07, 2.65], [x + 5.07, 10], [x + 2.13, 10], [x + 2.13, 2.65], [x, 2.65]]] }
  // T
];
const WORD = [0, 1, 2, 2, 1], WGAP = 0.55, SHEAR = 0.21;
const wordmark = (u, v, h) => {
  const k = h / 10, out = [];
  let x = 0;
  for (const g of WORD) {
    for (const p of WM[g].polys(x)) out.push(p.map(([a, b]) => [u + (a + (10 - b) * SHEAR) * k, v + b * k]));
    x += WM[g].w + WGAP;
  }
  return out;
};
const wordmarkW = (h) => (WORD.reduce((s, g) => s + WM[g].w + WGAP, -WGAP) + 10 * SHEAR) * (h / 10);
const two = (n) => (n < 10 ? "0" : "") + n;
const TK_PLAYS = (() => {
  const rnd = seeded(352026);
  return ["A", "B", "C", "D", "E"].map(() => {
    const s = /* @__PURE__ */ new Set();
    while (s.size < 5) s.add(1 + Math.floor(rnd() * 69));
    return { main: [...s].sort((a, b) => a - b).map(two), bonus: two(1 + Math.floor(rnd() * 26)) };
  });
})();
const SERIAL = "0412 8836 1957 0423 77", SERIAL_A = "0412 8836", SERIAL_B = "1957 0423";
const TK_PLAY_V = [-640, -556, -472, -388, -304];
const TK_PLAY = { pitch: 94, ro: 29, ri: 22.5, bonusRo: 20, bonusRi: 14.5, bonusDu: 57 };
const clipPoly = (p, cutV) => {
  const out = [], n = p.length, inn = (q) => q[1] <= cutV;
  for (let i = 0; i < n; i++) {
    const P = p[i], Q = p[(i + 1) % n];
    const I = () => [P[0] + (Q[0] - P[0]) * (cutV - P[1]) / (Q[1] - P[1]), cutV];
    if (inn(P)) {
      out.push(P);
      if (!inn(Q)) out.push(I());
    } else if (inn(Q)) out.push(I());
  }
  return out;
};
const clipLine = (p, cutV) => {
  const out = [];
  let run = [];
  for (let i = 0; i < p.length; i++) {
    const P = p[i], inP = P[1] <= cutV;
    if (inP) run.push(P);
    const Q = p[i + 1];
    if (!Q) break;
    const inQ = Q[1] <= cutV;
    if (inP !== inQ) {
      const X = [P[0] + (Q[0] - P[0]) * (cutV - P[1]) / (Q[1] - P[1]), cutV];
      if (inP) {
        run.push(X);
        out.push(run);
        run = [];
      } else run = [X];
    }
  }
  if (run.length > 1) out.push(run);
  return out;
};
export const tkCutPrint = (g, cutV) => ({
  ...g,
  layers: g.layers.map((l) => ({ ...l, polys: l.fill ? l.polys.map((p) => clipPoly(p, cutV)).filter((p) => p.length > 2) : l.polys.flatMap((p) => clipLine(p, cutV)) })).filter((l) => l.polys.length > 0),
  circles: g.circles.filter((c) => c.v + c.ro <= cutV - 1)
});
const SEAL_R = 44, WM_H = 48;
const memo = /* @__PURE__ */ new Map();
export const tkPrintGeo = (piece, lod, u0, u1, H, perf, blank) => {
  const key = `${piece}|${lod}|${blank ? 1 : 0}|${u0}|${u1}|${H}|${perf}`;
  const hit = memo.get(key);
  if (hit) return hit;
  const hi = lod === "hi", main = piece === "main";
  const g = { layers: [], bandV: [0, 0], bandU: 0, circles: [] };
  const F = (polys, ink, op = 1, o = {}) => {
    if (polys.length) g.layers.push({ fill: true, polys, ink, op, ...o });
  };
  const Ln = (polys, ink, w, op = 1, o = {}) => {
    if (polys.length) g.layers.push({ fill: false, polys, ink, op, w, ...o });
  };
  const T = (polys, cap, ink = "navy", bold = false, op = 1) => Ln(polys, ink, (bold ? 0.2 : 0.14) * cap, op, { dz: 0.1 });
  const a = main ? u0 + 22 : perf + 18, b = main ? perf - 18 : u1 - 22;
  const uc = main ? (u0 + perf) / 2 : (perf + u1) / 2;
  const ea = main ? u0 + 14 : perf + 9, eb = main ? perf - 9 : u1 - 14;
  const BT = -H + 14, BB = -H + 122, bc = (BT + BB) / 2;
  g.bandV = [BT, BB];
  g.bandU = (ea + eb) / 2;
  const mainUc = main ? uc : (-u1 + perf) / 2, lock = 2 * SEAL_R + 14 + wordmarkW(WM_H);
  const seal = [mainUc - lock / 2 + SEAL_R, bc - 6];
  if (hi) {
    const gw = [];
    for (let r = 0; r < 9; r++) gw.push(...waveRun(ea + 2, eb - 2, BB + 60 + r * 96, 22, 3, r * 1.7 + (main ? 0 : 0.9), 31, 97, 2.2));
    Ln(gw, "pale", 0.8, 0.42);
    const mb = [], xa = main ? u0 + 9 : perf + 7, xb = main ? perf - 7 : u1 - 9;
    for (const [d, s] of [[0, 1], [4, 2]]) {
      const L = xa + d, R = xb - d, Tp = -H + 9 + d, Bt = -9 - d;
      mb.push(
        ...microRow([L, Tp], [R, Tp], 100 + s + (main ? 0 : 50)),
        ...microRow([R, Bt], [L, Bt], 200 + s + (main ? 0 : 50)),
        ...main ? microRow([L, Bt], [L, Tp], 300 + s) : microRow([R, Tp], [R, Bt], 400 + s)
      );
    }
    Ln(mb, "soft", 0.9, 0.55);
  }
  {
    const R = 10, arcP = (cx, cy, a0, a1) => Array.from({ length: 6 }, (_, i) => {
      const t = a0 + (a1 - a0) * i / 5;
      return [cx + R * Math.cos(t), cy + R * Math.sin(t)];
    });
    const blk = main ? [...arcP(ea + R, BT + R, Math.PI, 1.5 * Math.PI), [eb, BT], [eb, BB], [ea, BB]] : [[ea, BT], ...arcP(eb - R, BT + R, -0.5 * Math.PI, 0), [eb, BB], [ea, BB]];
    F([blk], "band");
    if (hi) {
      const rays = [], N = 44, RR = 1600;
      for (let i = 0; i < N; i += 2) {
        const a0 = i / N * 2 * Math.PI, a1 = (i + 1) / N * 2 * Math.PI;
        const p = clipBox([seal, [seal[0] + RR * Math.cos(a0), seal[1] + RR * Math.sin(a0)], [seal[0] + RR * Math.cos(a1), seal[1] + RR * Math.sin(a1)]], ea + 3, BT + 3, eb, BB);
        if (p.length > 2) rays.push(p);
      }
      F(rays, "white", 0.075, { dz: 0.03 });
      const scr = [];
      for (let v = BT + 6; v < BB - 4; v += 5) scr.push([[ea + 2, v], [eb - 2, v]]);
      Ln(scr, "deep", 0.6, 0.16, { dz: 0.03 });
    }
    Ln([[[ea, BB - 3], [eb, BB - 3]]], "white", 1.2, 0.45, { dz: 0.05 });
    F([rect(ea, BB + 4, eb, BB + 9)], "pale", 0.95);
    Ln([[[ea, BB + 13.5], [eb, BB + 13.5]]], "navy", 1.1, 0.85);
  }
  if (main) {
    const [sx, sy] = seal, wu = sx + SEAL_R + 14, wv = sy - 31;
    F([ell(sx + 2.5, sy + 3, SEAL_R, SEAL_R, 40)], "deep", 0.45);
    F([ell(sx, sy, SEAL_R, SEAL_R, 40)], "white");
    F([ell(sx, sy, SEAL_R - 4, SEAL_R - 4, 40)], "deep");
    F([ell(sx, sy, SEAL_R - 7, SEAL_R - 7, 40)], "blue");
    if (hi) {
      const beads = [];
      for (let i = 0; i < 20; i++) {
        const t = i / 20 * 2 * Math.PI;
        beads.push(ell(sx + (SEAL_R - 12) * Math.cos(t), sy + (SEAL_R - 12) * Math.sin(t), 1.7, 1.7, 8));
      }
      F(beads, "white", 0.85, { dz: 0.05 });
      F([ell(sx, sy, SEAL_R - 16.5, SEAL_R - 16.5, 36)], "band", 1, { dz: 0.05 });
      F([star([sx + 1.6, sy + 2.2], 23, 9.6, 5)], "deep", 0.6, { dz: 0.08 });
    }
    F([star([sx, sy], 23, 9.6, 5)], "white", 1, { dz: 0.1 });
    if (hi) {
      const ext = [];
      for (let s = 5; s >= 1; s--) ext.push(...wordmark(wu + s * 0.7, wv + s * 0.85, WM_H));
      F(ext, "deep", 1, { dz: 0.06 });
    }
    F(wordmark(wu, wv, WM_H), "white", 1, { dz: 0.1, even: true });
    if (hi) {
      const ww = wordmarkW(WM_H), r0 = wu - 8, r1 = wu + ww - 2, rv0 = sy + 22, rv1 = sy + 42, rm = (rv0 + rv1) / 2, dr = 5;
      F([
        [[r0 - 16, rv0 + dr], [r0 + 6, rv0 + dr], [r0 + 6, rv1 + dr], [r0 - 16, rv1 + dr], [r0 - 9, rm + dr]],
        [[r1 + 16, rv0 + dr], [r1 - 6, rv0 + dr], [r1 - 6, rv1 + dr], [r1 + 16, rv1 + dr], [r1 + 9, rm + dr]]
      ], "paper", 0.8, { dz: 0.06 });
      F([[[r0, rv1], [r0 + 6, rv1 + dr], [r0 + 6, rv1]], [[r1, rv1], [r1 - 6, rv1 + dr], [r1 - 6, rv1]]], "deep", 0.9, { dz: 0.07 });
      F([rect(r0, rv0, r1, rv1)], "paper", 1, { dz: 0.08 });
      Ln([[[r0 + 3, rv0 + 2.5], [r1 - 3, rv0 + 2.5]], [[r0 + 3, rv1 - 2.5], [r1 - 3, rv1 - 2.5]]], "blue", 0.7, 0.7, { dz: 0.09 });
      T(typeRun("DRAW GAME", (r0 + r1) / 2, rm, 10.5, 0, 3.6), 10.5, "navy", true);
      F([star([r1 + 8, wv + 2], 8.5, 3.5, 5), star([r1 + 26, wv + 13], 6, 2.5, 5), star([r1 + 36, wv - 4], 4.6, 1.9, 5)], "white", 0.95, { dz: 0.1 });
    }
  } else if (hi) {
    T(typeRun("PLAYER STUB", uc, bc - 9, 17, 0, 1.6), 17, "white", true);
    T(typeRun("KEEP FOR YOUR RECORDS", uc, bc + 20, 7, 0, 0.9), 7, "white", true, 0.8);
  } else F([star([uc, bc], 20, 8.4, 5)], "white");
  if (!hi) {
    if (main) {
      const dots = [], disc = [];
      for (const v of TK_PLAY_V) for (let i = 0; i < 6; i++) {
        if (i < 5) dots.push(ring(ell(uc + (i - 2) * TK_PLAY.pitch, v, 26, 26, 12)));
        else disc.push(ell(uc + 2 * TK_PLAY.pitch + TK_PLAY.bonusDu, v, 18, 18, 12));
      }
      Ln(dots, "blue", 4, 0.75);
      F(disc, "blue", 0.9);
      F(barRuns(a + 14, b - 14, 33, 4.4).map(([x0, x1]) => rect(x0, -192, x1, -126)), "bar");
    } else {
      F(barRuns(-412, -214, 91, 4.4).map(([y0, y1]) => rect(uc - 58, y0, uc + 58, y1)), "bar");
    }
    memo.set(key, g);
    return g;
  }
  if (main) {
    const Z0 = BB + 24, Z1 = -724, zc = (Z0 + Z1) / 2;
    F([rrect(a, Z0, b, Z1, 8)], "tint", 0.4, { zone: true });
    const zw = [];
    for (let r = 0; r < 7; r++) zw.push(...waveRun(a + 8, b - 8, Z0 + 22 + r * 22, 7, 2, r * 0.9, 17, 53, 2));
    Ln(zw, "pale", 0.7, 0.75, { zone: true });
    Ln([...rosette([a + 62, zc], 46, 9, 3, 110), ...rosette([b - 62, zc], 46, 9, 3, 110)], "pale", 0.8, 0.8, { zone: true });
    Ln([ring(rrect(a, Z0, b, Z1, 8))], "blue", 1.5, 0.75);
    Ln([ring(rrect(a + 4, Z0 + 4, b - 4, Z1 - 4, 5))], "pale", 0.8, 0.9);
    const pv = -700;
    T(typeRun("QUICK PICK", a + 2, pv, 11, -1, 1), 11, "navy", true);
    T(typeRun("5 PLAYS   1 DRAW", b - 2, pv, 10, 1, 0.8), 10, "soft", true);
    const bonusU = uc + 2 * TK_PLAY.pitch + TK_PLAY.bonusDu;
    T(typeRun("BONUS", bonusU, -679, 7, 0, 0.6), 7, "blue", true);
    F([1, 3].map((r) => rect(a - 4, TK_PLAY_V[r] - 42, b + 4, TK_PLAY_V[r] + 42)), "tint", 0.55);
    const tags = [];
    TK_PLAY_V.forEach((v, r) => {
      T(typeRun("ABCDE"[r] + ".", a + 3, v - 7, 15), 15, "navy", true);
      tags.push(ring(rrect(a + 1, v + 6, a + 25, v + 20, 3)));
      T(typeRun("QP", a + 13, v + 13, 7, 0, 0.4), 7, "soft", true);
      for (let i = 0; i < 5; i++) g.circles.push({ u: uc + (i - 2) * TK_PLAY.pitch, v, ro: TK_PLAY.ro, ri: TK_PLAY.ri, bonus: false, num: blank ? "" : TK_PLAYS[r].main[i] });
      g.circles.push({ u: bonusU, v, ro: TK_PLAY.bonusRo, ri: TK_PLAY.bonusRi, bonus: true, num: blank ? "" : TK_PLAYS[r].bonus });
    });
    Ln(tags, "soft", 0.9, 0.8);
    Ln(dotted(a, b, -262), "navy", 1.6, 0.7);
    T(typeRun("DRAW #1842", a + 2, -246, 9, -1, 0.8), 9, "navy", true);
    T(typeRun("1 OF 1", b - 2, -246, 9, 1, 0.8), 9, "soft", true);
    T(typeRun("SN", a + 2, -227, 11, -1, 0.8), 11, "navy", true);
    T(typeRun(SERIAL, b - 2, -227, 11, 1, 1.6), 11, "navy");
    T(typeRun("RTL 310457   TERM 0418-02   TKT 00921", uc, -210, 8, 0, 0.6), 8, "soft");
    F(barRuns(a + 20, b - 20, 33).map(([x0, x1]) => rect(x0, -194, x1, -132)), "bar", 1, { dz: 0.05 });
    T(typeRun("0 41288 36195 70423 7", uc, -121, 8, 0, 2.2), 8, "bar");
    T(typeRun("KEEP YOUR TICKET", uc, -98, 13, 0, 2.4), 13, "navy", true);
    T(typeRun("SIGN THE BACK   CHECK YOUR NUMBERS", uc, -79, 7.5, 0, 0.8), 7.5, "soft", true);
    Ln([...microRow([a + 10, -60], [b - 10, -60], 61, [1.1, 3]), ...microRow([a + 30, -53], [b - 30, -53], 62, [1.1, 3])], "soft", 0.8, 0.7);
  } else {
    T(typeRun("TICKET NO.", uc, -888, 8, 0, 1), 8, "soft", true);
    T(typeRun(SERIAL_A, uc, -870, 12, 0, 1.4), 12, "navy");
    T(typeRun(SERIAL_B, uc, -852, 12, 0, 1.4), 12, "navy");
    F(stacked(uc - 100, uc + 100, -834, -752, 9, 417), "bar", 1, { dz: 0.05 });
    Ln([[[a, -731], [uc - 68, -731]], [[uc + 68, -731], [b, -731]]], "navy", 1, 0.6, { dz: 0.05 });
    T(typeRun("VOID IF TORN", uc, -731, 10, 0, 1), 10, "navy", true);
    const Z0 = -712, Z1 = -478, zc = (Z0 + Z1) / 2;
    F([rrect(a, Z0, b, Z1, 8)], "tint", 0.4, { zone: true });
    const zw = [];
    for (let r = 0; r < 10; r++) zw.push(...waveRun(a + 8, b - 8, Z0 + 18 + r * 22, 6, 2, r * 1.1 + 0.4, 15, 47, 2));
    Ln(zw, "pale", 0.7, 0.75, { zone: true });
    Ln(rosette([uc, zc], 70, 10, 3), "pale", 0.8, 0.7, { zone: true });
    Ln([ring(rrect(a, Z0, b, Z1, 8))], "blue", 1.5, 0.75);
    Ln([ring(rrect(a + 4, Z0 + 4, b - 4, Z1 - 4, 5))], "pale", 0.8, 0.9);
    T(typeRun("RTL 310457", uc, -458, 8, 0, 0.9), 8, "soft", true);
    T(typeRun("TERM 0418-02", uc, -441, 8, 0, 0.9), 8, "soft", true);
    F(barRuns(-420, -214, 91).map(([y0, y1]) => rect(uc - 60, y0, uc + 60, y1)), "bar", 1, { dz: 0.05 });
    T(typeRun("88361957", uc, -199, 8, 0, 2), 8, "bar");
    T(typeRun("RETAIN THIS STUB", uc, -160, 10, 0, 1.2), 10, "navy", true);
    T(typeRun("SEE BACK FOR RULES", uc, -141, 7, 0, 0.8), 7, "soft", true);
    Ln(dotted(a, b, -120), "navy", 1.6, 0.7);
    Ln([...microRow([a + 6, -100], [b - 6, -100], 71, [1.1, 3]), ...microRow([a + 16, -93], [b - 16, -93], 72, [1.1, 3])], "soft", 0.8, 0.7);
  }
  memo.set(key, g);
  return g;
};
const f2 = (v) => v.toFixed(2);
export const TkFacePrint = ({ id, rig, map, geo, z, px, dim, shine, zoneOff }) => {
  const P = (polys, close, dz = 0) => polys.map((p) => mapPath(map, rig, p.map((q) => [q[0], q[1], z + dz]), close)).join(" ");
  const bt = mapScr(map, rig, [geo.bandU, geo.bandV[0], z]), bb = mapScr(map, rig, [geo.bandU, geo.bandV[1], z]);
  const dk = (c) => mixHex(c, "#000000", 0.32 * dim);
  const INKS = {
    navy: TK_INK_NAVY,
    deep: TK_INK_DEEP,
    blue: TK_INK_BLUE,
    soft: TK_INK_SOFT,
    pale: TK_INK_PALE,
    tint: TK_INK_TINT,
    white: "#FFFFFF",
    bar: TK_BAR_INK,
    paper: TK_FACE[4]
  };
  const inkOf = (k) => k === "band" ? `url(#${id}Bn)` : dk(INKS[k]);
  const zk = 1 - 0.72 * clamp01(zoneOff);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Bn`, gradientUnits: "userSpaceOnUse", x1: f2(bt[0]), y1: f2(bt[1]), x2: f2(bb[0]), y2: f2(bb[1]), children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: dk(mixHex(TK_BAND[0], "#ffffff", 0.1 * shine)) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.3", stopColor: dk(TK_BAND[1]) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.72", stopColor: dk(TK_BAND[3]) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: dk(mixHex(TK_BAND[3], TK_BAND[4], 0.55)) })
    ] }) }),
    geo.layers.map((l, k) => {
      const op = l.op * (l.zone ? zk : 1);
      if (op <= 4e-3) return null;
      return l.fill ? /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(l.polys, true, l.dz ?? 0), fill: inkOf(l.ink), fillRule: l.even ? "evenodd" : "nonzero", opacity: op < 1 ? op : void 0 }, k) : /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(l.polys, false, l.dz ?? 0), fill: "none", stroke: inkOf(l.ink), strokeWidth: (l.w ?? 1) * px, strokeLinecap: "round", strokeLinejoin: "round", opacity: op < 1 ? op : void 0 }, k);
    })
  ] });
};
export const TkNumbers = ({ rig, map, circles, z, px, dim }) => {
  const main = [], bonus = [];
  for (const c of circles) if (c.num) (c.bonus ? bonus : main).push(...typeRun(c.num, c.u, c.v, c.bonus ? 13 : 19, 0, c.bonus ? 0.8 : 1.4));
  const P = (polys) => polys.map((p) => mapPath(map, rig, p.map((q) => [q[0], q[1], z]), false)).join(" ");
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    main.length > 0 && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(main), fill: "none", stroke: mixHex(TK_INK_NAVY, "#000000", 0.32 * dim), strokeWidth: 0.22 * 19 * px, strokeLinecap: "round", strokeLinejoin: "round" }),
    bonus.length > 0 && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: P(bonus), fill: "none", stroke: mixHex("#FFFFFF", "#000000", 0.32 * dim), strokeWidth: 0.22 * 13 * px, strokeLinecap: "round", strokeLinejoin: "round" })
  ] });
};
