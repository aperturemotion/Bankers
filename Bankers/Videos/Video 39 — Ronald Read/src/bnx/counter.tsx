// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { mix, rInOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { US_PAYOUT } from "./data_lt";
import { L, usd2 } from "./data";
import { Turn } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { worldScr, xfApply } from "./tk_rig";
import { TK_D, TK_FLOOR_Y, TK_MAIN_U, TK_ROWS, TK_W, TkWhole, tkAt, tkCorners, tkPose, tkRig } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { ClampBack, ClampFront, PL_TOP, PL_WIN_C, PL_WORD_C, PlinthBody, plinthAt, plinthCorners, plinthTicketY } from "./counter_plinth";

const RIG = tkRig({ eye: 900 });
const X = 540;
const K = 0.5;
const PPOSE = tkPose(X, 0);
const TPOSE = tkPose(X, 0, { k: K, y: TK_FLOOR_Y + plinthTicketY });
const FIT = { w: TK_W * K, d: TK_D * K };
const digitsOf = (s) => {
  const m = s.match(/^\$(\d)\.(\d)(\d)$/);
  if (!m) throw new Error(`counter: "${s}" is not a $d.dd price`);
  return [+m[1], +m[2], +m[3]];
};
const FROM = usd2(1), TO = usd2(Math.round(US_PAYOUT * 100) / 100);
const D0 = digitsOf(FROM), D1 = digitsOf(TO);
const C0 = D0[0] * 100 + D0[1] * 10 + D0[2], C1 = D1[0] * 100 + D1[1] * 10 + D1[2];
if (`$${D1[0]}.${D1[1]}${D1[2]}` !== TO || !(C1 < C0)) throw new Error("counter: the drums must fall to usd2(US_PAYOUT)");
export const counterTimes = (w, end) => {
  for (const k of ["ticket", "worth", "costs", "before", "number", "drawn"]) if (!Number.isFinite(w[k])) throw new Error(`counter: the take has no word frame "${k}"`);
  const run = { a: w.worth - 2, b: w.costs - 1 };
  const t = {
    w,
    end,
    run,
    /** the click the mech score keeps mid-run (Ev list unchanged): it falls on the dimes drum's carry through its detent */
    tick: run.a + 14,
    word: { a: w.worth - 11, b: w.worth - 1 },
    // WORTH fills, readable ON "worth"
    price: { a: w.costs - 11, b: w.costs - 1 },
    // COSTS $1.00 prints on the ticket, ON "costs"
    toWin: { a: w.ticket + 2, dur: 30 },
    // in on the readout, RIDING the run
    toBoth: { a: w.costs - 6, dur: 34 },
    // up to the ticket's price above the plinth's worth
    rings: { a: w.before - 4, b: w.number + 6 },
    // RIDING across the blank rings
    sweep: { a: w.before - 6, b: w.drawn + 2 },
    // the studio light sweeping over them
    pull: { a: w.drawn - 14, dur: 30 }
    // back to the whole set before the crane out
  };
  if (t.run.b - t.run.a < 20) throw new Error("counter: the drums need \u2265 20 f to roll legibly");
  if (t.pull.a + t.pull.dur > end + 4) throw new Error("counter: the pull-back must settle by the crane");
  return t;
};
const ACC = 0.2;
const trap = (u) => {
  const vm = 1 / (1 - ACC);
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  if (u < ACC) return vm * u * u / (2 * ACC);
  if (u > 1 - ACC) return 1 - vm * (1 - u) * (1 - u) / (2 * ACC);
  return vm * (u - ACC / 2);
};
const smooth = (x) => {
  const s = Math.max(0, Math.min(1, x));
  return s * s * (3 - 2 * s);
};
const DENS = { K: 12, WID: 0.6 };
const SEAMS = Array.from({ length: C0 - C1 }, (_, i) => C1 + i + 0.5).filter((q) => Math.round(q - 0.5) % 10 === 9);
const rho = (v) => 1 + SEAMS.reduce((a, q) => {
  const x = Math.abs(v - q) / DENS.WID;
  return a + (x < 1 ? DENS.K * Math.cos(Math.PI / 2 * x) ** 2 : 0);
}, 0);
const TBL = (() => {
  const n = 4e3, dv = (C0 - C1) / n, vs = [C0], cs = [0];
  for (let i = 1; i <= n; i++) {
    vs.push(C0 - dv * i);
    cs.push(cs[i - 1] + rho(C0 - dv * (i - 0.5)) * dv);
  }
  return { vs, cs: cs.map((x) => x / cs[n]) };
})();
const vOfProgress = (p) => {
  if (p <= 0) return C0;
  if (p >= 1) return C1;
  let lo = 0, hi = TBL.cs.length - 1;
  while (hi - lo > 1) {
    const m = lo + hi >> 1;
    if (TBL.cs[m] <= p) lo = m;
    else hi = m;
  }
  return TBL.vs[lo] + (TBL.vs[hi] - TBL.vs[lo]) * ((p - TBL.cs[lo]) / (TBL.cs[hi] - TBL.cs[lo]));
};
const carry = (p) => {
  const m = Math.round((p - 9.5) / 10);
  return m + smooth(p - (10 * m + 9.5) + 0.5);
};
const frameOfV = (run, v) => {
  let lo = 0, hi = TBL.vs.length - 1;
  while (hi - lo > 1) {
    const m = lo + hi >> 1;
    if (TBL.vs[m] >= v) lo = m;
    else hi = m;
  }
  const p = TBL.cs[lo] + (TBL.cs[hi] - TBL.cs[lo]) * ((TBL.vs[lo] - v) / (TBL.vs[lo] - TBL.vs[hi]));
  const vm = 1 / (1 - ACC), pa = vm * ACC / 2;
  const u = p < pa ? Math.sqrt(2 * ACC * p / vm) : p > 1 - pa ? 1 - Math.sqrt(2 * ACC * (1 - p) / vm) : p / vm + ACC / 2;
  return run.a + u * (run.b - run.a);
};
const carries = (run) => {
  const qs = [...SEAMS].sort((x, y) => y - x);
  const fr = qs.map((q) => ({ q, a: frameOfV(run, q + 0.5), b: frameOfV(run, q - 0.5) }));
  return fr.map((c, i) => ({ ...c, until: Math.min(c.b + CLICK.len, i + 1 < fr.length ? fr[i + 1].a - 0.5 : run.b + 3) }));
};
const CLICK = { A: 0.1, om: Math.PI / 2.2, tau: 1.8, len: 7 };
const ring = (g, c) => {
  const dt = g - c.b, span = c.until - c.b;
  if (dt <= 0 || dt >= span) return 0;
  return -CLICK.A * Math.exp(-dt / CLICK.tau) * Math.sin(CLICK.om * dt) * (1 - smooth((dt - span * 0.55) / (span * 0.45)));
};
const CARRY_MEMO = /* @__PURE__ */ new Map();
const counterReadout = (t, g) => {
  const key = `${t.run.a}:${t.run.b}`;
  if (!CARRY_MEMO.has(key)) CARRY_MEMO.set(key, carries(t.run));
  const cs = CARRY_MEMO.get(key);
  const v = vOfProgress(trap((g - t.run.a) / (t.run.b - t.run.a)));
  const dimes = carry(v), dollars = carry(dimes);
  const dRing = cs.reduce((a, c) => a + ring(g, c), 0);
  const dlRing = cs.filter((c) => Math.round(c.q - 0.5) % 100 === 99).reduce((a, c) => a + ring(g, c), 0);
  const drums = [dollars + dlRing, dimes + dRing, v];
  const dig = (p) => (Math.round(p) % 10 + 10) % 10;
  return { v, drums, reads: 100 * dig(drums[0]) + 10 * dig(drums[1]) + dig(drums[2]) };
};
{
  const run = { a: 0, b: 25 };
  let prevR = Infinity, prevV = Infinity;
  for (let g = -2; g <= 32; g += 0.125) {
    const r = counterReadout({ run }, g);
    if (r.reads > prevR || r.v > prevV + 1e-9 || r.reads < C1 || r.v < C1) throw new Error(`counter: the readout rises or dips at ${g}: ${r.reads}`);
    prevR = r.reads;
    prevV = r.v;
  }
  const s0 = counterReadout({ run }, run.a), s1 = counterReadout({ run }, run.b), s2 = counterReadout({ run }, run.b + 3);
  if (s0.reads !== C0 || s1.reads !== C1 || s1.v !== C1 || s2.drums.some((p, i) => p !== [D1[0], D1[1] + 10 * D1[0], C1][i]))
    throw new Error("counter: the readout must start on usd2(1) and land exactly on usd2(US_PAYOUT), at rest by run.b + 3");
}
const lay = (p) => ({ x: p[0], y: p[1] });
const ZF_T = TK_D / 2;
const UC_M = (TK_MAIN_U[0] + TK_MAIN_U[1]) / 2;
const RING_V = -556, RING_RUN = 190;
const PIV = 993, TOPMIN = 466, BOTMAX = 1536;
const SET_T = Math.min(...tkCorners(TPOSE, "whole").map((q) => worldScr(RIG, q)[1]));
const SET_F = Math.max(...plinthCorners(PPOSE).map((q) => worldScr(RIG, q)[1]));
const fit = (z, p) => {
  const lo = SET_F - (BOTMAX - PIV) / z, hi = SET_T + (PIV - TOPMIN) / z;
  if (lo > hi) throw new Error(`counter: the set (${Math.round(SET_F - SET_T)} px) does not fit the frame at z ${z}`);
  return { x: p.x, y: Math.max(lo, Math.min(hi, p.y)) };
};
const shots = (t) => {
  const whole = { x: X + 10, y: (SET_T + SET_F) / 2 };
  const win = lay(plinthAt(RIG, PPOSE, PL_WIN_C)), word = lay(plinthAt(RIG, PPOSE, PL_WORD_C));
  const hund = lay(plinthAt(RIG, PPOSE, [PL_WIN_C[0] + 150, PL_WIN_C[1], PL_WIN_C[2]]));
  const price = lay(tkAt(RIG, TPOSE, [TK_ROWS.fig.u, TK_ROWS.fig.v, ZF_T]));
  const ring2 = (e) => lay(tkAt(RIG, TPOSE, [UC_M - RING_RUN + 2 * RING_RUN * e, RING_V, ZF_T]));
  return [
    // the whole set as it rises
    { a: -9999, z: 0.99, push: 0.02, at: still(whole.x, whole.y) },
    // in on the readout (WORTH over it), RIDING the count a little toward the hundredths drum (the fastest)
    {
      a: t.toWin.a,
      dur: t.toWin.dur,
      z: 1.08,
      push: 0,
      ride: { a: t.run.a, b: t.run.b + 8 },
      at: (g) => fit(1.08, { x: mix(win.x, hund.x, 0.3 * rInOut(g, t.run.a, t.run.b)), y: mix(win.y, word.y, 0.3) })
    },
    // up to the ticket's COSTS $1.00 above the plinth's WORTH $0.67
    { a: t.toBoth.a, dur: t.toBoth.dur, z: 1.04, push: 0, at: () => fit(1.04, { x: mix(price.x, win.x, 0.5), y: mix(price.y, win.y, 0.5) }) },
    // RIDING across the blank rings, left to right, as the light sweeps them
    {
      a: t.rings.a - 10,
      dur: 30,
      z: 1.08,
      push: 0,
      ride: { a: t.rings.a, b: t.rings.b },
      at: (g) => fit(1.08, ring2(rInOut(g, t.rings.a, t.rings.b)))
    },
    // back to the whole set
    { a: t.pull.a, dur: t.pull.dur, z: 1, push: 0.02, at: still(whole.x, whole.y) }
  ];
};
export const counterCamWindows = (t) => actionCamWindows(shots(t));
export const counterSfx = (t) => [
  { job: "label", a: t.word.a, b: t.word.b + 6, vol: 0.45 },
  // WORTH fills in
  { job: "mech", a: t.run.a + 1, b: t.run.b, vol: 0.65 },
  // the drums rolling down
  { job: "click", a: t.tick, b: t.tick + 1, vol: 0.35 },
  // the dimes drum clicks through a carry
  { job: "click", a: t.run.b, b: t.run.b + 1, vol: 0.55 },
  // the drums set on $0.67
  { job: "label", a: t.price.a, b: t.price.b + 6, vol: 0.4 }
  // COSTS $1.00 prints on the ticket
];
export const LtCounter = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = counterTimes(w, end);
  const on = (q) => rInOut(f, q.a, q.b);
  const pOn = on(t.price);
  const prints = [
    { key: "costs", text: L("counterCosts"), row: "sub", on: pOn },
    { key: "price", text: FROM, row: "fig", on: pOn }
  ];
  const sheen = -260 + 240 * rInOut(f, at - 30, at + 30) + 360 * rInOut(f, t.sweep.a, t.sweep.b);
  const pmap = (q) => xfApply(PPOSE, q);
  const casters = [{ corners: plinthCorners(PPOSE) }, { corners: tkCorners(TPOSE, "whole"), k: 0.8 }];
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceRoot, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CamFn, { at: actionCam(shots(t)), children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-leaving": travelling(f, counterCamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)(Turn, { at, end, from: -6, to: 4, amp: 0.9, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TkFloor, { id: "ctF", rig: RIG, at: { x: X + 40, z: 0 }, reach: 1250, casters, on: 1 - stage }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(
      PlinthBody,
      {
        id: "ctP",
        rig: RIG,
        pose: PPOSE,
        drums: counterReadout(t, f).drums,
        glyph: 1,
        lit: 0.35 + 0.65 * rInOut(f, t.run.a, t.run.a + 14),
        word: L("counterWorth"),
        wordOn: on(t.word),
        tk: FIT,
        sheen: 60 * rInOut(f, at - 30, at + 40)
      }
    ),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(ClampBack, { rig: RIG, map: pmap, top: PL_TOP, tk: FIT }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TkWhole, { id: "ctT", rig: RIG, pose: TPOSE, prints, sheen, blank: true, probe: "the ticket on the plinth" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(ClampFront, { id: "ctC", rig: RIG, map: pmap, top: PL_TOP, tk: FIT }) })
  ] }) }) }) });
};
