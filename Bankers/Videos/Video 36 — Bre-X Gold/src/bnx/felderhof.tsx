// @ts-nocheck
// ★ V36 "Bre-X Gold" — place FELDERHOF (builder F). "Exploration chief John Felderhof sold eighty-four million dollars of stock in
//   nineteen ninety-six, and was found not guilty of insider trading."  Neutral: no person, no take — the sale, then the court's ruling.
//   1. The film's ONE bar-like scene: a column of banded C$ cash bundles (sales_cash.tsx, Video 35's bundle; the column IS the bar)
//      stacks on its machined base as the place rises from under the "To be fair…" card; the camera rides its top up; C$84M lands
//      on "$84" with STOCK SOLD over it on "stock", and the base's plaque prints 1996 on "1996" as the camera eases back.
//   2. On "and was found not guilty" (the 7-s split, STYLE §2.5.1a) the camera TRAVELS to the judge's bench beside it: the gavel lying
//      by its sound block rises and strikes on "not"; NOT GUILTY lands on "guilty" with its date, JULY 31, 2007.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rIn, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { seeded, travelling } from "./common";
import { L } from "./data";
import { Turn, figure, label } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { worldScr, xfMul, xfPose } from "./tk_rig";
import { INK } from "./tk_mat";
import { TK_FLOOR_Y } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { CB, CB_DEPTH, CB_SLOT, CashBody, CashContact, CashDrop, CashTopPlanes, cashFace, cashXf } from "./sales_cash";
import { FELDERHOF_SOLD_M } from "./felderhof_data";
import { FB, FB_BASE, FB_TOP, FdBase, fdBaseCorners } from "./felderhof_base";
import { BENCH, BENCH_TOP_V, BLOCK, Bench, GV, Gavel, GavelShadow, SoundBlock, benchCorners } from "./felderhof_gavel";

const RIG = { cx: 540, cy: TK_FLOOR_Y - 1300, persp: 3600, yaw: 16, pitch: -5 };
// ── the column: its height IS the C$ sold (one scale, PX_PER_M), built of banded bundles two deep ───────────────────────────
const COLX = 540;
const PX_PER_M = 8;
const H_COL = FELDERHOF_SOLD_M * PX_PER_M;
const N = Math.round(H_COL / CB.H);
const T_C = H_COL / N, KH = T_C / CB.H;
if (Math.abs(KH - 1) > 0.05) throw new Error("felderhof: a course must read as one bundle's thickness");
const NB = 2 * N;
const rnd = seeded(1996);
const BUNDLES = Array.from({ length: NB }, (_, i) => {
  const c = Math.floor(i / 2);
  return {
    dx: (rnd() - 0.5) * 5,
    dz: (rnd() - 0.5) * 3,
    yaw: (rnd() - 0.5) * 1.1,
    dim: 0.06 + 0.1 * rnd() + 0.11 * (1 - c / Math.max(1, N - 1)),
    sheen: 0.15 + 0.35 * rnd(),
    turn: (rnd() - 0.5) * 2.2,
    tx: (rnd() - 0.5) * 6,
    tz: (rnd() - 0.5) * 6,
    seed: 8400 + i
  };
});
const slotZ = (i) => i % 2 === 1 ? CB_SLOT : -CB_SLOT;
const prof = (x) => {
  const c = clamp01(x);
  return 0.4 * c + 0.6 * c * c * (3 - 2 * c);
};
const profInv = (y) => {
  let a = 0, b = 1;
  for (let i = 0; i < 40; i++) {
    const m = (a + b) / 2;
    if (prof(m) < y) a = m;
    else b = m;
  }
  return (a + b) / 2;
};
// ── the bench, the block, the gavel ────────────────────────────────────────────────────────────────────────────────────
const BX = 1720, BZ = -160;
const BPOSE = xfPose(BX, TK_FLOOR_Y, BZ);
const Y_TOP = TK_FLOOR_Y + BENCH_TOP_V;                  // the bench top's surface (world y)
const BLK = [BX + 60, Y_TOP, BZ - 30];                    // the sound block's foot centre (right of centre, so the gavel lies wholly on the bench)
const BLOCK_TOP = Y_TOP - BLOCK.h;
// the gavel's poses: lying by the block (its side on the bench, the knob's end touching it), and struck (its face on the block)
const yawVec = (psi) => [Math.cos(psi * Math.PI / 180), 0, -Math.sin(psi * Math.PI / 180)];
const REST = (() => {
  const psi = 8, head = [BLK[0] - 64, Y_TOP - GV.headR, BLK[2] + 185];
  const theta = -Math.asin((GV.headR - GV.knobR) / GV.butt) * 180 / Math.PI;
  const v = yawVec(psi), c = Math.cos(theta * Math.PI / 180);
  return { psi, theta, rho: 90, P: [head[0] - GV.butt * c * v[0], Y_TOP - GV.knobR, head[2] - GV.butt * c * v[2]] };
})();
if (REST.P[0] - GV.knobR < BX - BENCH.W / 2 + 30) throw new Error("felderhof: the gavel must lie wholly on the bench top");
const STRUCK = (() => {
  const psi = 28, head = [BLK[0], BLOCK_TOP - GV.headL / 2, BLK[2]];
  const v = yawVec(psi);
  return { psi, theta: 0, rho: 0, P: [head[0] - GV.butt * v[0], head[1], head[2] - GV.butt * v[2]] };
})();
const RAISE = -38;
// the gavel framing's aim: between the knob and the block, a little above the bench top
const GAV_AIM = [BLK[0] - 120, BLOCK_TOP - 150, BLK[2] + 60];
const mixV = (a, b, e) => a.map((x, i) => x + (b[i] - x) * e);
// ── times ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const felderhofTimes = (w, end) => {
  for (const k of ["s0", "exploration", "john", "felderhof", "sold", "k84", "million", "stock", "k1996", "found", "not", "guilty", "insider", "trading"]) if (!Number.isFinite(w[k])) throw new Error(`felderhof: the take has no word frame "${k}"`);
  const build = { a: w.s0 - 8, b: w.k84 - 9 };
  const t = {
    w,
    end,
    build,
    land: Array.from({ length: NB }, (_, i) => build.a + (build.b - build.a) * profInv((i + 1) / NB)),
    fig: { a: w.k84 - 8, b: w.k84 + 8 },                  // C$84M lands as the column tops out (the last bundle down), ON "$84"
    sold: { a: w.stock - 12, b: w.stock + 4 },             // STOCK SOLD on "stock"
    year: { a: w.k1996 - 12, b: w.k1996 + 4 },             // 1996 on the base's plaque, on "1996"
    rideIn: { a: build.a + 2, dur: 40 },                   // the camera closes on the build…
    ride: { a: build.a + 22, b: build.b + 3 },             // …and rides its top up
    back: { a: w.stock - 22, dur: 32 },                    // back to the whole column (the year at its foot)
    travel: { a: w.found - 28, dur: 32 },                  // ★ the split: on "and was found" the camera travels to the bench
    lift: { a: w.found - 14, b: w.not - 7 },               // the gavel rises off the bench as the camera arrives
    strike: { a: w.not - 6, b: w.not },                    // and strikes the block ON "not"
    verdict: { a: w.not, b: w.guilty + 6 },                // NOT GUILTY with the strike, fully read on "guilty"
    date: { a: w.not + 3, b: w.not + 17 },                 // its date
    crane: end + 2 - 36                                    // the composition's crane out (HO.felderhof)
  };
  if (t.fig.a <= t.build.b) throw new Error("felderhof: C$84M must land once the last bundle is down (no bundle flies through it)");
  if (t.back.a < t.fig.b + 4) throw new Error("felderhof: C$84M must be read at the top before the camera eases back");
  if (t.travel.a < t.year.b + 8) throw new Error("felderhof: 1996 must be read before the travel to the bench");
  if (t.travel.a + t.travel.dur > t.strike.b) throw new Error("felderhof: the camera must arrive at the bench by the strike");
  if (t.date.b > t.crane) throw new Error("felderhof: NOT GUILTY and its date must be landed before the crane out");
  return t;
};
// ── the column's poses (Video 35's sales_seq drop: each bundle falls the last stretch onto the column, then settles) ────────
const DROP = { fly: 14, h: 120, fade: 6, s0: 0.97 };
const bounce = (u) => u <= 0 ? 0 : 2 * Math.exp(-u / 2.4) * Math.abs(Math.sin(Math.PI * u / 3.2));
const scaled = (x, s) => s === 1 ? x : xfMul(x, { m: [s, 0, 0, 0, s, 0, 0, 0, s], t: [0, 0, 0] });
const hAt = (t, g) => H_COL * prof((g - t.build.a + 1) / (t.build.b - t.build.a + 1));
const colTop = (t, g) => FB_BASE - hAt(t, g);
const poses = (t, g) => {
  const out = [];
  const tops = [FB_BASE, FB_BASE];
  for (let i = 0; i < NB; i++) {
    const b = BUNDLES[i], T = t.land[i], sl = i % 2;
    if (g < T - DROP.fly) break;
    const rest = tops[sl] - T_C / 2;
    const x = COLX + b.dx, z = slotZ(i) + b.dz;
    let y, yaw = b.yaw, tx = 0, tz = 0, s = 1, op = 1;
    const landed = g >= T;
    if (!landed) {
      const tau = T - g, q = tau / DROP.fly, age = DROP.fly - tau;
      const restFinal = FB_BASE - (Math.floor(i / 2) + 0.5) * T_C;
      y = restFinal - DROP.h * q * q;
      yaw += b.turn * q;
      tx = b.tx * q * q;
      tz = b.tz * q * q;
      const fin = rOut(age, 0, DROP.fade);
      op = fin;
      s = DROP.s0 + (1 - DROP.s0) * fin;
    } else y = rest - bounce(g - T);
    y = Math.min(y, rest);
    out.push({ i, x: scaled(cashXf([x, y, z], yaw, KH, tx, tz), s), landed, y, T, op });
    tops[sl] = y - T_C / 2;
  }
  return out;
};
// the gavel at frame g: lying → rising (yaw, roll and lift together) → swung up → struck → a small rebound, resting on the block
const gavelAt = (t, g) => {
  const e = rInOut(g, t.lift.a, t.lift.b), er = rInOut(g, t.lift.a, t.lift.b - 4);
  const P = mixV(REST.P, STRUCK.P, e);
  const psi = REST.psi + (STRUCK.psi - REST.psi) * e;
  const rho = REST.rho * (1 - er);
  let theta = REST.theta + (RAISE - REST.theta) * e;
  if (g >= t.strike.a) theta = RAISE * (1 - rIn(g, t.strike.a, t.strike.b));
  const u = g - t.strike.b;
  if (u > 0) theta = -5 * Math.exp(-u / 2.2) * Math.abs(Math.sin(Math.PI * u / 3.6));
  return { P, psi, rho, theta };
};
// ── the camera ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const at = (x, y, z = 0) => {
  const p = worldScr(RIG, [x, y, z]);
  return { x: p[0], y: p[1] };
};
const shots = (t) => {
  const whole = at(COLX + 6, (FB_BASE - H_COL - 150 + TK_FLOOR_Y) / 2);
  const gav = at(GAV_AIM[0], GAV_AIM[1], GAV_AIM[2]);
  return [
    // the base and the first courses as the place rises
    { a: -9999, z: 1.06, push: 0.02, at: () => at(COLX - 20, FB_BASE - 230) },
    // close on the build, then RIDE its top up
    { a: t.rideIn.a, dur: t.rideIn.dur, z: 1.24, push: 0, ride: t.ride, at: (g) => at(COLX - 40, Math.min(FB_BASE - 220, colTop(t, g) + 170)) },
    // back to the whole column: C$84M · STOCK SOLD over it, 1996 at its foot
    { a: t.back.a, dur: t.back.dur, z: 1.04, push: 0.02, at: () => whole },
    // ★ the travel to the bench: the gavel and its block, centred
    { a: t.travel.a, dur: t.travel.dur, z: 1.55, push: 0.02, at: () => gav }
  ];
};
export const felderhofCamWindows = (t) => actionCamWindows(shots(t));
export const felderhofSfx = (t) => [
  { job: "process", a: t.build.a - 4, b: t.build.b + 2, k: "io", vol: 0.6 },
  // the bundles stacking up (Video 35's column)
  { job: "land", a: t.build.b - 6, b: t.build.b + 1, vol: 0.45 },
  // the column tops out
  { job: "label", a: t.fig.a, b: t.fig.b, vol: 0.5 },
  // C$84M
  { job: "label", a: t.sold.a, b: t.sold.b, vol: 0.35 },
  // STOCK SOLD
  { job: "label", a: t.year.a, b: t.year.b, vol: 0.4 },
  // 1996 on the plaque
  { job: "obj", a: t.lift.a, b: t.lift.b, vol: 0.45 },
  // the gavel rises
  { job: "thud", a: t.strike.b, b: t.strike.b + 1, vol: 0.85 },
  // the gavel strikes the block
  { job: "verdict", a: t.strike.b - 4, b: t.strike.b + 2, vol: 0.6 },
  // the low hit under the strike as NOT GUILTY lands
  { job: "label", a: t.date.a, b: t.date.b, vol: 0.3 }
  // JULY 31, 2007
];
// ── the place ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const SETTLE = 9;
const Bundle = ({ id, x, under, b, face }) => /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
  under && /* @__PURE__ */ (0,jsx_runtime.jsx)(CashContact, { id: `${id}k`, rig: RIG, upper: x, lower: under }),
  /* @__PURE__ */ (0,jsx_runtime.jsx)(CashBody, { id, rig: RIG, x, seed: b.seed, dim: b.dim }),
  face && /* @__PURE__ */ (0,jsx_runtime.jsx)(CashTopPlanes, { rig: RIG, x, kh: KH, sheen: b.sheen, shade: 0.04 })
] });
/** a figure with one small label over it (Video 35's TopLabel), easing up into place */
const TopLabel = ({ x, y, on, fig, sub, subOn = 0, probe, size = 78 }) => {
  if (on <= 3e-3 && subOn <= 3e-3) return null;
  const Wd = 620;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    sub && subOn > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-label": probe, style: {
      position: "absolute", left: 0, top: 0, width: Wd, textAlign: "center",
      transform: `translate(${(x - Wd / 2).toFixed(2)}px, ${(y - size - 48 + 12 * (1 - subOn)).toFixed(2)}px)`,
      opacity: clamp01(subOn * 1.4),
      ...label(30, INK)
    }, children: sub }),
    on > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-label": probe, style: {
      position: "absolute", left: 0, top: 0, width: Wd, textAlign: "center", transformOrigin: "50% 100%",
      transform: `translate(${(x - Wd / 2).toFixed(2)}px, ${(y - size - 6 + 14 * (1 - on)).toFixed(2)}px) scale(${(0.94 + 0.06 * on).toFixed(4)})`,
      opacity: clamp01(on * 1.4),
      ...figure(size)
    }, children: fig })
  ] });
};
export const BxFelderhof = ({ at: at0, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = felderhofTimes(w, end);
  const ps = poses(t, f);
  const landed = ps.filter((p) => p.landed);
  const flying = ps.filter((p) => !p.landed).sort((p, q) => p.i % 2 - q.i % 2 || p.i - q.i);
  const nC = Math.floor(landed.length / 2);
  const covered = (i) => {
    const up = landed.find((p) => p.i === i + 2);
    return !!up && f - up.T >= SETTLE && Math.floor(i / 2) < nC - 2;
  };
  const surfOf = (i) => {
    const under = landed.find((p) => p.i === i - 2);
    if (!under && i >= 2) return null;
    if (under) return { y: Math.min(...cashFace(under.x, true).map((q) => q[1])), clip: cashFace(under.x, true) };
    const z0 = slotZ(i) - CB.D / 2 - 6, z1 = slotZ(i) + CB.D / 2 + 6;
    return { y: FB_BASE, clip: [[COLX - FB.padW / 2, FB_BASE, z0], [COLX + FB.padW / 2, FB_BASE, z0], [COLX + FB.padW / 2, FB_BASE, z1], [COLX - FB.padW / 2, FB_BASE, z1]] };
  };
  const topL = landed.length ? landed.slice(-Math.min(2, landed.length)) : [];
  const colPts = topL.length ? [...landed.slice(0, 2).flatMap((p) => cashFace(p.x, false)), ...topL.flatMap((p) => cashFace(p.x, true))] : [];
  const throwTo = (pts, y) => pts.flatMap(([x, yy, z]) => {
    const d = Math.max(0, y - yy);
    return [[x, y, z], [x + 0.5 * d, y, z - 0.62 * d]];
  });
  const casters = [{ corners: fdBaseCorners(COLX) }, ...(colPts.length ? [{ corners: colPts }] : []), { corners: benchCorners(BPOSE) }];
  const g = gavelAt(t, f);
  // the figure stands clear over the column's top face (its highest projected corner)
  const topY = Math.min(...[-1, 1].flatMap((su) => [-1, 1].map((sz) => worldScr(RIG, [COLX + su * (CB.W / 2 + 3), FB_BASE - H_COL - 1, sz * (CB_DEPTH / 2 + 2)])[1])));
  const a84 = [worldScr(RIG, [COLX, FB_BASE - H_COL, 0])[0], topY - 26];
  const headTop = worldScr(RIG, [GAV_AIM[0] + 10, BLOCK_TOP - GV.headL - 118, GAV_AIM[2]]);
  const sheen = 520 * rInOut(f, t.travel.a + 6, t.strike.b + 10);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceRoot, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CamFn, { at: actionCam(shots(t)), children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-leaving": travelling(f, felderhofCamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)(Turn, { at: at0, end, from: -5, to: 3, amp: 0.8, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TkFloor, { id: "fdF", rig: RIG, at: { x: 980, z: -60 }, reach: 1700, casters, stage, on: 1 - stage }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe-object": "the judge's bench with its sound block and gavel", style: { position: "absolute", inset: 0 }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Bench, { id: "fdB", rig: RIG, pose: BPOSE, sheen }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(GavelShadow, { rig: RIG, pose: g, shadowY: Y_TOP }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(SoundBlock, { id: "fdK", rig: RIG, c: BLK, lit: rOut(f, t.strike.b, t.strike.b + 3) * (1 - rInOut(f, t.strike.b + 3, t.strike.b + 20)) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)(Gavel, { id: "fdG", rig: RIG, pose: g, blockC: BLK })
    ] }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(FdBase, { id: "fdR", rig: RIG, x: COLX, print: { text: L("felderhofYear"), on: rOut(f, t.year.a, t.year.b) }, shade: colPts.length ? throwTo(colPts, FB_TOP) : void 0 }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe-object": "the column of cash", style: { position: "absolute", inset: 0 }, children: [
      landed.map((p) => {
        const u = landed.find((q) => q.i === p.i - 2);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)(Bundle, { id: `fd${p.i}`, x: p.x, under: u == null ? void 0 : u.x, b: BUNDLES[p.i], face: !covered(p.i) }, `b${p.i}`);
      }),
      flying.map((p) => {
        const s = surfOf(p.i);
        return p.op <= 3e-3 ? null : /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "absolute", inset: 0, opacity: p.op < 1 ? p.op : void 0 }, children: [
          s && /* @__PURE__ */ (0,jsx_runtime.jsx)(CashDrop, { id: `fdd${p.i}`, rig: RIG, x: p.x, y: s.y, clip: s.clip }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)(Bundle, { id: `fd${p.i}`, x: p.x, b: BUNDLES[p.i], face: true })
        ] }, `b${p.i}`);
      })
    ] }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TopLabel, { x: a84[0], y: a84[1], on: rOut(f, t.fig.a, t.fig.b), fig: L("felderhofFigure"), sub: L("felderhofLabel"), subOn: rOut(f, t.sold.a, t.sold.b), probe: "the column's figure" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TopLabel, { x: headTop[0], y: headTop[1], on: rOut(f, t.verdict.a, t.verdict.b), fig: L("felderhofVerdict"), sub: L("felderhofDate"), subOn: rOut(f, t.date.a, t.date.b), probe: "the verdict", size: 76 })
  ] }) }) }) });
};
