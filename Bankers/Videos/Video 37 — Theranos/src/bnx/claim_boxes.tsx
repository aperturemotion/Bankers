// @ts-nocheck
// Video 36 "Bre-X Gold" — wooden CORE BOXES and their drill core (builder B, 2026-11-23), for claim (the BUSANG stack on its
//   pallet) and partner (the partner's own tray). Real core-box anatomy: a bottom board, two long side boards and two thicker end
//   boards with hand-hold slots, three dividers making four rows, a lid with two cleats (on the closed boxes), nail heads, grain,
//   a stencil on the long side and the hole ID / box / depth stencilled on the end; inside, the core lies in its rows as broken
//   cylinders of grey rock with wooden depth blocks between the runs. (bx_core.tsx did not exist when this was built: the core
//   here is builder B's own — the integrator can swap it for the film's shared core.)
//   Local units: metres × RM px, x along the box, y up negative, z toward the camera.
import * as jsx_runtime from "react/jsx-runtime";
import { rampAt } from "./solid_engine";
import { mapScr, xfApply } from "./tk_rig";
import { SHOUT } from "./fonts";
import { boxAB, cylAB, f2, faces, part, path3, ring3, rnd } from "./claim_kit";
import { BX_GRAIN, BX_GRAIN_LIT, BX_INSIDE, BX_NAIL, BX_STENCIL, BX_WOOD, BX_WOOD_END, CORE_FLECK_D, CORE_FLECK_L, CORE_ROCK, RG_FRAME } from "./claim_mat";
import { RM } from "./claim_rig";
import { BxCore, coreXf } from "./bx_core";
import { xfMul } from "./tk_rig";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs;
const m3 = (p) => [p[0] * RM, p[1] * RM, p[2] * RM];
const B = (a, b, bev = 0) => boxAB(m3(a), m3(b), bev * RM);
export const BOX = { L: 1.5, W: 0.44, H: 0.088, t: 0.018, te: 0.026, lid: 0.016, cleat: 0.02, rows: 3, div: 0.012, coreR: 0.033 };
export const BOX_STEP = BOX.H + BOX.lid;
export const PALLET_H = 0.13;
const ROW_W = (BOX.W - 2 * BOX.t - (BOX.rows - 1) * BOX.div) / BOX.rows;
export const rowZ = (j) => -BOX.W / 2 + BOX.t + ROW_W / 2 + j * (ROW_W + BOX.div);
/** one run of core per row: pieces (x0, x1) broken at random, with a depth block between two runs */
export const runsOf = (seed) => {
  const r = rnd(seed);
  return Array.from({ length: BOX.rows }, (_, j) => {
    const pieces = [];
    let x = -BOX.L / 2 + BOX.te + 0.01;
    const end = BOX.L / 2 - BOX.te - 0.01;
    const block = r() < 0.7 ? -0.35 + 0.7 * r() : null;
    while (x < end - 0.03) {
      if (block !== null && x < block && x + 0.06 > block) {
        pieces.push({ block: true, x0: x, x1: x + 0.034 });
        x += 0.04;
        continue;
      }
      const len = Math.min(end - x, 0.06 + 0.3 * r() ** 1.3);
      pieces.push({ x0: x, x1: x + len, tone: 0.85 + 0.3 * r(), seed: Math.floor(r() * 1e6) });
      x += len + 0.003 + 0.012 * r();
    }
    return pieces;
  });
};
const grainLines = (seed, n) => {
  const r = rnd(seed);
  return Array.from({ length: n }, () => ({ v: 0.12 + 0.76 * r(), a: 0.004 + 0.006 * r(), k: 3 + 5 * r(), ph: 6 * r(), lit: r() < 0.35 }));
};
/** the wood grain on a board's face: lines along u (local), waving a little in v */
const Grain = ({ map, rig, o, u, v, lu, lv, seed, n = 4, sc = 1 }) => {
  const gl = grainLines(seed, n + 3);
  const kr = rnd(seed * 31 + 7), knots = kr() < 0.6 ? [{ s: 0.15 + 0.7 * kr(), v: 0.3 + 0.4 * kr(), r: 0.08 + 0.06 * kr() }] : [];
  return /* @__PURE__ */ jsxs("g", { children: [knots.map((kn, k) => {
    const c = [o[0] + u[0] * kn.s * lu + v[0] * kn.v * lv, o[1] + u[1] * kn.s * lu + v[1] * kn.v * lv, o[2] + u[2] * kn.s * lu + v[2] * kn.v * lv];
    return /* @__PURE__ */ jsx("path", { d: path3(map, rig, ring3(c, u, v, kn.r * lv, 14).map((p, i) => [p[0] + u[0] * (i % 2 ? 0.6 : 0) * kn.r * lv, p[1] + u[1] * (i % 2 ? 0.6 : 0) * kn.r * lv, p[2] + u[2] * (i % 2 ? 0.6 : 0) * kn.r * lv])), fill: BX_GRAIN, opacity: 0.28 }, `k${k}`);
  }), gl.map((g, k) => {
    const pts = Array.from({ length: 13 }, (_, i) => {
      const s = i / 12, w = (g.v + g.a * Math.sin(g.k * s * Math.PI + g.ph)) * lv;
      return [o[0] + u[0] * s * lu + v[0] * w, o[1] + u[1] * s * lu + v[1] * w, o[2] + u[2] * s * lu + v[2] * w];
    });
    return /* @__PURE__ */ jsx("path", { d: path3(map, rig, pts, false), fill: "none", stroke: g.lit ? BX_GRAIN_LIT : BX_GRAIN, strokeOpacity: g.lit ? 0.24 : 0.5, strokeWidth: (g.lit ? 0.8 : 1.0) * sc }, k);
  })] });
};
const nails = (map, rig, pts, sc) => /* @__PURE__ */ jsx("g", { children: pts.map((q, k) => {
  const c = mapScr(map, rig, q);
  return /* @__PURE__ */ jsx("circle", { cx: f2(c[0]), cy: f2(c[1]), r: f2(1.6 * sc), fill: BX_NAIL, opacity: 0.8 }, k);
}) });
/** one core box with its bottom at y0 (m); open shows its core; o = { seed, stencil, endText: [l1, l2], fill(row) → 0…1, drop } */
export const coreBoxParts = (id, y0, o) => {
  const { L, W, H, t, te, lid, cleat } = BOX;
  const yt = y0 - H, ps = [];
  const sc = o.sc ?? 1, seed = o.seed ?? 1;
  const base = (o.layer ?? 0) * 100;
  const P = (k, f, ramp, oo = {}) => ps.push(part(f, ramp, { key: `${id}${k}`, spec: 0.08, ...oo, layer: base + (oo.sub ?? 10) }));
  const front = [[-L / 2, y0, W / 2], [L / 2, yt, W / 2 - t]];
  P("bot", B([-L / 2, y0, -W / 2], [L / 2, y0 - t, W / 2]), BX_WOOD, { sub: 0 });
  P("back", B([-L / 2 + te, y0 - t, -W / 2], [L / 2 - te, yt, -W / 2 + t]), BX_WOOD, { sub: 1 });
  P("front", B(...front), BX_WOOD, {
    sub: 31,
    prints: [
      o.stencil && { o: m3([-L * 0.17, y0 - H * 0.5, W / 2 + 2e-3]), u: [1, 0, 0], v: [0, 1, 0], text: o.stencil, size: H * 0.74 * RM, fill: BX_STENCIL, op: 0.86 * (o.stencilOn ?? 1), family: SHOUT, ls: 0.035 * RM, probe: "the core box's stencil" },
      o.boxNo && { o: m3([L * 0.33, y0 - H * 0.5, W / 2 + 2e-3]), u: [1, 0, 0], v: [0, 1, 0], text: o.boxNo, size: H * 0.5 * RM, fill: BX_STENCIL, op: 0.7, family: SHOUT, ls: 0.012 * RM, probe: "the core box's stencil" }
    ],
    after: (map, rig) => /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx(Grain, { map, rig, o: m3([-L / 2, yt, W / 2 + 1e-3]), u: [1, 0, 0], v: [0, 1, 0], lu: L * RM, lv: H * RM, seed: seed * 7 + 1, n: 6, sc }),
      nails(map, rig, [[-L / 2 + 0.012, y0 - H * 0.3, W / 2], [-L / 2 + 0.012, y0 - H * 0.72, W / 2], [L / 2 - 0.012, y0 - H * 0.3, W / 2], [L / 2 - 0.012, y0 - H * 0.72, W / 2]].map(m3), sc)
    ] })
  });
  const endDecal = (sx) => (map, rig) => {
    const x = sx * (L / 2) + sx * 1e-3, n = [sx, 0, 0];
    if (!faces(map, rig, n, m3([x, y0 - H / 2, 0]))) return null;
    const u = [0, 0, -sx], v = [0, 1, 0];
    const slot = [[x, y0 - H * 0.62, -0.07], [x, y0 - H * 0.62, 0.07], [x, y0 - H * 0.86, 0.07], [x, y0 - H * 0.86, -0.07]].map(m3);
    return /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx(Grain, { map, rig, o: m3([x, yt, sx * W / 2]), u, v, lu: W * RM, lv: H * RM, seed: seed * 7 + (sx > 0 ? 3 : 5), n: 4, sc }),
      /* @__PURE__ */ jsx("path", { d: path3(map, rig, slot), fill: "#05080B", opacity: 0.8 }),
    ] });
  };
  const endPrints = (sx) => (o.endText ?? []).map((tx, k) => ({ o: m3([sx * (L / 2 + 2e-3), y0 - H * 0.3, -sx * (k ? 0.1 : -0.1)]), u: [0, 0, -sx], v: [0, 1, 0], text: tx, size: H * 0.34 * RM, fill: BX_STENCIL, op: 0.72, family: SHOUT, ls: 0.01 * RM, probe: "the core box's end stencil" }));
  P("endL", B([-L / 2, y0 - t, -W / 2], [-L / 2 + te, yt, W / 2 - t]), BX_WOOD_END, { sub: 30, after: endDecal(-1), prints: endPrints(-1) });
  P("endR", B([L / 2 - te, y0 - t, -W / 2], [L / 2, yt, W / 2 - t]), BX_WOOD_END, { sub: 2, after: endDecal(1) });
  if (!o.open) {
    P("lid", B([-L / 2 - 0.004, yt, -W / 2 - 0.004], [L / 2 + 0.004, yt - lid, W / 2 + 0.004]), BX_WOOD, {
      sub: 40,
      after: (map, rig) => /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx(Grain, { map, rig, o: m3([-L / 2, yt - lid - 1e-3, -W / 2]), u: [1, 0, 0], v: [0, 0, 1], lu: L * RM, lv: W * RM, seed: seed * 7 + 9, n: 9, sc }),
        /* @__PURE__ */ jsx("path", { d: path3(map, rig, [m3([-L / 2, yt - lid - 1e-3, 0]), m3([L / 2, yt - lid - 1e-3, 0])], false), stroke: "#000000", strokeOpacity: 0.4, strokeWidth: 1.2 * sc, fill: "none" })
      ] })
    });
    return ps;
  }
  // open: the dividers, the core in its rows, the depth blocks
  const yIn = y0 - t;
  for (let j = 1; j < BOX.rows; j++) {
    const z = rowZ(j) - (ROW_W + BOX.div) / 2;
    P(`div${j}`, B([-L / 2 + te, yIn, z - BOX.div / 2], [L / 2 - te, yIn - 2 * BOX.coreR + 0.012, z + BOX.div / 2]), BX_WOOD, { sub: 3 + 2 * j });
  }
  const runs = o.runs ?? runsOf(seed);
  runs.forEach((pieces, j) => {
    const fill = o.fill ? o.fill(j) : 1;
    pieces.forEach((pc, k) => {
      const z = rowZ(j);
      const dr = o.drop ? o.drop(j, k, pieces.length) : 0;
      if (dr === null) return;
      const lift = typeof dr === "number" ? dr : dr.lift, pop = typeof dr === "number" ? 1 : dr.op;
      if (pop <= 3e-3) return;
      if (pc.block) {
        P(`blk${j}_${k}`, B([pc.x0, yIn - lift, z - ROW_W / 2 + 0.008], [pc.x1, yIn - 2 * BOX.coreR - 0.004 - lift, z + ROW_W / 2 - 0.008], 0.002), BX_WOOD_END, {
          sub: 4 + 2 * j,
          op: pop,
          after: (map, rig) => /* @__PURE__ */ jsx("path", { d: path3(map, rig, [m3([(pc.x0 + pc.x1) / 2, yIn - 2 * BOX.coreR - 0.0045 - lift, z - 0.03]), m3([(pc.x0 + pc.x1) / 2, yIn - 2 * BOX.coreR - 0.0045 - lift, z + 0.03])], false), stroke: "#000000", strokeOpacity: 0.7, strokeWidth: 1.4 * sc, fill: "none" })
        });
        return;
      }
      if (fill < 1 && (pc.x0 + BOX.L / 2) / BOX.L > fill) return;
      const r = BOX.coreR, yc = yIn - r - lift;
      if (o.pose) return;
      const ramp = CORE_ROCK.map((c) => c);
      P(`core${j}_${k}`, cylAB(m3([pc.x0, yc, z]), m3([pc.x1, yc, z]), r * RM, 14), ramp, {
        sub: 4 + 2 * j,
        spec: 0.4,
        op: pop,
        lift: 0.06 * (pc.tone - 1),
        after: (map, rig) => coreFlecks(map, rig, pc, yc, z, sc)
      });
    });
    // ★ REV1: with the box's pose, the row's core is the FILM'S drill core (bx_core BxCore): its pieces end to end with natural
    //   fractures that fit across each break, sawn ends at the run blocks, one HALF core (sawn, inside up) in the middle row
    if (o.pose) {
      const xs = -L / 2 + te + 0.01, Lin = L - 2 * te - 0.02, r = BOX.coreR, z = rowZ(j);
      const items = pieces;
      const bxp = items.map((pc, k) => {
        if (pc.block) return null;
        const prev = items[k - 1], next = items[k + 1];
        const ea = !prev || prev.block ? "saw" : "break", eb = !next || next.block ? "saw" : "break";
        const piece = [(pc.x0 - xs) / Lin, (pc.x1 - xs) / Lin, ea, eb];
        if (j === 1 && k === 2) piece.push("half");
        return piece;
      }).filter(Boolean);
      const xf = xfMul(o.pose, coreXf(0, (yIn - r) * RM, z * RM));
      ps.push({
        key: `${id}bx${j}`,
        c: [0, (yIn - r) * RM, z * RM],
        layer: base + 4 + 2 * j,
        after: (map, rig) => /* @__PURE__ */ jsx(BxCore, { id: `${id}bc${j}`, rig, xf, len: Lin * RM, r: r * RM, seed: seed * 13 + j, pieces: bxp, probe: null })
      });
    }
  });
  return ps;
};
const coreFlecks = (map, rig, pc, yc, z, sc) => {
  const r = rnd(pc.seed), n = Math.max(2, Math.round((pc.x1 - pc.x0) / 0.03));
  return /* @__PURE__ */ jsx("g", { children: Array.from({ length: n }, (_, k) => {
    const x = pc.x0 + 0.008 + (pc.x1 - pc.x0 - 0.016) * r(), a = (-0.6 + 1.6 * r()) * Math.PI / 2;
    const q = m3([x, yc - BOX.coreR * Math.cos(a) * 0.98, z + BOX.coreR * Math.sin(a) * 0.98]);
    const c = mapScr(map, rig, q), lt = r() < 0.55;
    return /* @__PURE__ */ jsx("circle", { cx: f2(c[0]), cy: f2(c[1]), r: f2((0.35 + 0.5 * r()) * sc), fill: lt ? CORE_FLECK_L : CORE_FLECK_D, opacity: lt ? 0.35 : 0.45 }, k);
  }) });
};
/** a pallet under a stack: three stringers along x and five deck boards across */
export const palletParts = (id, sc = 1) => {
  const ps = [], L = BOX.L + 0.1, W = BOX.W + 0.14;
  for (const z of [-W / 2 + 0.05, 0, W / 2 - 0.05]) ps.push(part(B([-L / 2, 0, z - 0.04], [L / 2, -0.1, z + 0.04], 0.004), BX_WOOD_END, { key: `${id}str${z}`, spec: 0.1, dim: 0.25, layer: -200 }));
  for (let i = 0; i < 6; i++) {
    const x = -L / 2 + 0.07 + i * (L - 0.14) / 5;
    ps.push(part(B([x - 0.06, -0.1, -W / 2], [x + 0.06, -PALLET_H, W / 2], 0.003), BX_WOOD_END, {
      key: `${id}dk${i}`,
      spec: 0.1,
      layer: -100,
      bias: 20,
      after: (map, rig) => /* @__PURE__ */ jsx(Grain, { map, rig, o: m3([x - 0.06, -PALLET_H - 1e-3, -W / 2]), u: [0, 0, 1], v: [1, 0, 0], lu: W * RM, lv: 0.12 * RM, seed: 40 + i, n: 2, sc })
    }));
  }
  return ps;
};
export const stackCorners = (pose, n) => {
  const out = [], L = BOX.L / 2 + 0.05, W = BOX.W / 2 + 0.07, top = -(PALLET_H + n * BOX_STEP);
  for (const x of [-L, L]) for (const y of [top, 0]) for (const z of [-W, W]) out.push(xfApply(pose, m3([x, y, z])));
  return out;
};
export { ROW_W };
