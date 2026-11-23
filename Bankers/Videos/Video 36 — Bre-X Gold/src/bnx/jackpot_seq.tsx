// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import * as react from "react";
import { clamp01, rInOut, rOut } from "./anim";
import { theme } from "./theme";
import { PlaceRoot, useOwn } from "./shot";
import { CamFn } from "./s3";
import { seeded, travelling } from "./common";
import { HEROES, SENTENCES, WORDS } from "./captions";
import { JACKPOT_DATE, JACKPOT_M } from "./data_lt";
import { L, dateLabel, usdM0 } from "./data";
import { Turn } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { mapPath, worldScr, xfApply, xfMul, xfRotX, xfRotY, xfRotZ, xfScale, xfTrans } from "./tk_rig";
import { TK_D, TK_FLOOR_Y, TK_H, TK_W, TkWhole, tkRig } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { JP_TOP_V, JpPlinth, jpPlinthCorners } from "./jackpot_plinth";

const RUN_RIG = tkRig({ eye: 1300, pitch: -8, yaw: 14 });
const R = RUN_RIG, FY = TK_FLOOR_Y;
const K = 0.5;
const TW = TK_W * K, TH = TK_H * K, TD = TK_D * K;
const GAP = 1.5, PITCH = TD + GAP;
const COL = { x: 540, z: 0 };
const PLATE_Y = FY + JP_TOP_V;
const DRAWS = 11, PRE = 4, N = DRAWS * 2 + 1, TOP = N - 1;
const TOP_BACK = TD + 10;
const PLINTH_POSE = xfMul(xfTrans([COL.x, FY, COL.z]), xfScale(1));
const norm = (x) => x.toLowerCase().replace(/[^a-z0-9$%&]/g, "");
const sen0 = (scene) => SENTENCES.filter((x) => x.scene === scene)[0];
const inSen = (scene, word) => {
  const s0 = sen0(scene), hit = WORDS.find((x) => x.at >= s0.at && x.at <= s0.end && norm(x.word) === norm(word));
  if (!hit) throw new Error(`jackpot_seq: "${word}" not in ${scene}`);
  return hit.at;
};
export const RUN_W = {
  jackpot: { s0: sen0("jackpot").at, jackpots: inSen("jackpot", "jackpots"), grow: inSen("jackpot", "grow"), only: inSen("jackpot", "only"), nobody: inSen("jackpot", "nobody"), wins: inSen("jackpot", "wins") },
  powerball: { s0: sen0("powerball").at, k847: inSen("powerball", "$847"), million: inSen("powerball", "million"), powerball: inSen("powerball", "Powerball"), won: inSen("powerball", "won"), november: inSen("powerball", "November"), k4: inSen("powerball", "4") },
  powerball2: { s0: sen0("powerball2").at, draw: inSen("powerball2", "draw"), after: inSen("powerball2", "after"), paid: inSen("powerball2", "paid"), tickets: inSen("powerball2", "tickets"), missed: inSen("powerball2", "missed") }
};
export const RUN_SPAN = { at: sen0("jackpot").at, end: HEROES.filter((h) => h.scene === "honest")[0].paint };
export const runCheck = (place, w) => {
  for (const k of Object.keys(RUN_W[place])) if (Number.isFinite(w[k]) && w[k] !== RUN_W[place][k]) throw new Error(`jackpot run: ${place}.${k} is ${w[k]} in Composition but ${RUN_W[place][k]} in the run`);
};
const FLY = 15, DEAL = 820, ARC = 120;
export const runTimes = (w, span) => {
  const j = w.jackpot, p = w.powerball, q = w.powerball2;
  const first = j.grow + 1, lastDraw = j.wins - 2, every = (lastDraw - first) / (DRAWS - 1 - PRE);
  const land = Array.from({ length: N }, (_, i) => {
    if (i === TOP) return j.wins + 8;
    const d = Math.floor(i / 2);
    return d < PRE ? -9999 : first + (d - PRE) * every + i % 2 * 3;
  });
  const t = {
    w,
    span,
    land,
    jackpotLab: { a: j.jackpots - 10, b: j.jackpots },
    // JACKPOT lights on the plate ON "jackpots"
    tip: { a: p.s0 - 12, b: p.k847 + 3 },
    // the top ticket stands up (1450 → 1472)
    shine: { a: p.s0 - 10, b: p.k847 + 4 },
    // …and lights up
    k847: { a: p.k847 - 10, b: p.k847 },
    // $847M ON "$847"
    nov: { a: p.november - 10, b: p.november },
    // NOV 4 ON "November"
    ride: { a: q.s0 + 3, b: q.paid - 6 },
    // the camera rides down the column (1590 → 1639)
    casc: { a: q.paid, b: q.tickets + 2 },
    // ★ the missed tickets light, bottom → top (1645 → 1672)
    all: { a: q.missed - 8, b: q.missed },
    // ★ the whole column lit at once ON "missed." (1675 → 1683)
    up: { a: q.paid - 4, b: q.missed - 3 },
    // ★ the camera rides up with the cascade, drawing back (1641 → 1680)
    seam: { a: q.missed - 14, b: q.missed + 2 },
    // the plate's seam lights as the camera arrives
    climb: { a: j.grow - 4, b: j.wins + 14 },
    // the camera rides the top up
    close: { a: p.s0 - 16, dur: 34 },
    // the camera onto the standing ticket
    back: { a: p.million + 6, dur: 46 }
    // …easing back on "Powerball"
  };
  if (t.tip.b > t.k847.b + 4 || t.land[TOP] + 4 > t.tip.a) throw new Error('jackpot run: the top ticket must land, then stand up by "$847"');
  if (t.back.a + t.back.dur > p.november - 4) throw new Error("jackpot run: the pull-back must settle before NOV 4 lands");
  if (t.ride.b + 4 > t.casc.a) throw new Error("jackpot run: the ride must reach the plinth before the cascade");
  if (feedArrive(t, TOP - 1) > t.all.a) throw new Error("jackpot run: every pulse must reach the $847M ticket before the column lights at once");
  return t;
};
const JIT = Array.from({ length: N }, (_, i) => {
  const r = seeded(4111 + 37 * i), d = Math.floor(i / 2), low = i < 3 ? 0.15 : 1;
  const layer = (d % 2 ? 1 : -1) * 3.2;
  return { dx: low * ((r() - 0.5) * 10 + (d % 2 ? 8 : -8)), dz: low * (r() - 0.5) * 12, yaw: low * (layer + (r() - 0.5) * 3) };
});
JIT[TOP] = { dx: 0, dz: -TOP_BACK, yaw: -1.5 };
const restOf = (i) => [COL.x + JIT[i].dx, PLATE_Y - TD / 2 - i * PITCH, COL.z + JIT[i].dz];
const flatXf = (c, yaw, tilt = 0, roll = 0) => xfMul(xfTrans(c), xfMul(xfRotZ(roll), xfMul(xfRotY(yaw), xfMul(xfRotX(90 + tilt), xfMul(xfScale(K), xfTrans([0, TK_H / 2, 0]))))));
const settle = (t) => t <= 0 ? 0 : -2.5 * Math.exp(-t / 3) * Math.abs(Math.sin(Math.PI * t / 5));
const sideOf = (i) => i === TOP ? -1 : (Math.floor(i / 2) + i) % 2 ? 1 : -1;
const ticketXf = (t, i, g) => {
  const L0 = t.land[i], c = restOf(i), j = JIT[i];
  if (i === TOP && g >= t.tip.a) return topStandXf(t, g);
  if (g >= L0) return flatXf([c[0], c[1] + settle(g - L0), c[2]], j.yaw);
  const s = (L0 - g) / FLY;
  if (s > 1) return null;
  const e = 1 - s * s, side = sideOf(i), r = seeded(97 + i);
  return flatXf(
    [c[0] + side * DEAL * (1 - e), c[1] - ARC * Math.pow(1 - e, 1.4), c[2] + 30 * (r() - 0.5) * (1 - e)],
    j.yaw + side * (24 + 10 * r()) * (1 - e) * (1 - e),
    -5 * s * s,
    side * 6 * s * s
  );
};
const topStandXf = (t, g) => {
  const c = restOf(TOP), yaw = JIT[TOP].yaw, th = 90 * (1 - rInOut(g, t.tip.a, t.tip.b));
  const ry = xfRotY(yaw), off = xfApply(ry, [0, TD / 2, TH / 2]);
  const P = [c[0] + off[0], c[1] + off[1], c[2] + off[2]];
  return xfMul(xfTrans(P), xfMul(ry, xfMul(xfRotX(th), xfMul(xfScale(K), xfTrans([0, 0, TK_D / 2])))));
};
const STAND_C = (() => {
  const c = restOf(TOP), off = xfApply(xfRotY(JIT[TOP].yaw), [0, TD / 2 - TH / 2, TH / 2 + TD / 2]);
  return [c[0] + off[0], c[1] + off[1], c[2] + off[2]];
})();
const downAt = (t, g) => t.land.reduce((a, L0, i) => a + (i === TOP ? 0 : rInOut(g, L0 - 4, L0 + 6)), 0);
const topYAt = (t, g) => PLATE_Y - downAt(t, g) * PITCH;
const RIDE_Y0 = restOf(TOP - 1)[1], RIDE_Y1 = restOf(0)[1];
const rideY = (t, g) => RIDE_Y0 + (RIDE_Y1 - RIDE_Y0) * rInOut(g, t.ride.a, t.ride.b);
const passAt = (t, i) => {
  const y = restOf(i)[1];
  let lo = t.ride.a, hi = t.ride.b;
  for (let k = 0; k < 24; k++) {
    const m = (lo + hi) / 2;
    if (rideY(t, m) < y) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
};
const FEED_DT = 0.7;
const litAt = (t, i) => t.casc.a + (t.casc.b - t.casc.a) * i / (TOP - 1);
const pulseAt = (t, i, j) => litAt(t, i) + (j - i) * FEED_DT;
const feedArrive = (t, i) => pulseAt(t, i, TOP);
const feedOf = (t, j, g) => {
  if (g < t.casc.a - 4) return { lit: 0, pulse: 0 };
  let pulse = 0;
  for (let i = 0; i <= j; i++) {
    const d = (g - pulseAt(t, i, j)) / 1.7;
    if (d > -4 && d < 4) pulse += Math.exp(-d * d) * (i === j ? 1 : 0.62);
  }
  const all = rInOut(g, t.all.a, t.all.b), da = (g - (t.all.b - 1)) / 3.2;
  pulse += 0.75 * Math.exp(-da * da);
  return { lit: Math.max(rInOut(g, litAt(t, j) - 1, litAt(t, j) + 5) * 0.62, all), pulse: clamp01(pulse) };
};
const fedOf = (t, g) => {
  let fed = 0, flick = 0;
  for (let i = 0; i < TOP; i++) {
    const A = feedArrive(t, i);
    fed += rInOut(g, A - 1, A + 5);
    const d = (g - A) / 2.4;
    if (d > -4 && d < 6) flick += Math.exp(-d * d);
  }
  return { fed: fed / TOP, flick: clamp01(flick * 0.5) };
};
const WHOLE_Y = (STAND_C[1] - TH / 2 + FY) / 2;
const FZ = COL.z + TH / 2;
const at = (x, y, z = FZ) => {
  const p = worldScr(R, [x, y, z]);
  return { x: p[0], y: p[1] };
};
const shots = (t) => [
  // the arrival (the crane): the plinth and the column's first draws, room above for the next ones to fall into
  { a: -9999, z: 0.92, push: 0.02, at: () => at(COL.x, PLATE_Y - 70) },
  // ride the column's top up as the draws land
  { a: t.climb.a, dur: 40, z: 0.98, push: 0.02, ride: { a: t.climb.a, b: t.climb.b }, at: (g) => at(COL.x, topYAt(t, g - 6) + 190) },
  // onto the top ticket as it stands up and lights
  { a: t.close.a, dur: t.close.dur, z: 1.42, push: 0.03, at: () => at(STAND_C[0], STAND_C[1] + 22, STAND_C[2]) },
  // ease back on "Powerball": it crowns the column
  { a: t.back.a, dur: t.back.dur, z: 1.38, push: 0.02, at: () => at(STAND_C[0], STAND_C[1] + 90, STAND_C[2]) },
  // ride down the column of missed tickets to its foot, drawing back ("grew draw after draw"; the lit ticket stays clear of the captions)
  { a: t.ride.a - 2, dur: t.ride.b - t.ride.a + 4, z: 0.75, push: 0, ride: { a: t.ride.a, b: t.ride.b }, at: () => at(COL.x, WHOLE_Y + 70) },
  // ★ ride back UP with the cascade, drawing back: the whole column under its $847M ticket ON "missed."
  { a: t.up.a, dur: t.up.b - t.up.a, z: 0.72, push: 0.02, ride: { a: t.up.a, b: t.up.b }, at: () => at(COL.x, WHOLE_Y - 24) }
];
export const runCamWindows = (t) => actionCamWindows(shots(t));
export const runSfx = (t, a, b) => [
  { job: "label", a: t.jackpotLab.a, b: t.jackpotLab.b + 6, vol: 0.45 },
  // the draws landing, pair by pair (a soft landing each; the top ticket a thud)
  ...Array.from({ length: DRAWS - PRE }, (_, k) => {
    const L0 = t.land[(PRE + k) * 2];
    return { job: "land", a: L0 - 4, b: L0 + 2, vol: k % 2 ? 0.32 : 0.4 };
  }),
  { job: "thud", a: t.land[TOP], b: t.land[TOP] + 6, vol: 0.55 },
  { job: "process", a: t.shine.a, b: t.shine.b, k: "out", vol: 0.5 },
  // the top ticket lighting, standing up
  { job: "label", a: t.k847.a, b: t.k847.b + 6, vol: 0.5 },
  { job: "label", a: t.nov.a, b: t.nov.b + 6, vol: 0.45 },
  { job: "clock", a: t.ride.a, b: t.ride.b, vol: 0.45 },
  // draw after draw, riding down the column
  { job: "process", a: t.casc.a - 2, b: feedArrive(t, TOP - 1) + 2, k: "rise", vol: 0.55 },
  // ★ the feed: the light climbing into the top ticket
  { job: "ping", a: t.all.b - 3, b: t.all.b, vol: 0.6 },
  // ★ the whole column lit at once, ON the word missed
  { job: "process", a: t.seam.a, b: t.seam.b + 6, k: "out", vol: 0.35 }
  // the plate's seam lighting
].filter((e) => (e.a + e.b) / 2 >= a && (e.a + e.b) / 2 < b);
const JackpotRun = ({ t, place, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const id = `jp${place}`;
  const shine = rInOut(f, t.shine.a, t.shine.b);
  const topPrints = [
    { key: "k847", text: usdM0(JACKPOT_M), row: "fig", on: rOut(f, t.k847.a, t.k847.b) },
    { key: "nov", text: dateLabel(JACKPOT_DATE), row: "sfig", on: rOut(f, t.nov.a, t.nov.b) }
  ];
  const plPrints = [
    { key: "pb", text: L("jackpotPowerball"), row: "name", on: 1 },
    { key: "jp", text: L("jackpot"), row: "sub", on: rOut(f, t.jackpotLab.a, t.jackpotLab.b) }
  ];
  const tickets = Array.from({ length: N }, (_, i) => {
    const x = ticketXf(t, i, f);
    if (!x) return null;
    const L0 = t.land[i];
    if (i === TOP) return { i, x, dim: 0.2 * (1 - shine), glint: 0, lit: 0, pulse: 0 };
    const pa = passAt(t, i);
    const glint = Math.exp(-(((f - pa) / 5) ** 2)) * (f > t.ride.a - 6 && f < t.ride.b + 12 ? 1 : 0);
    const fd = feedOf(t, i, f);
    const dim = (L0 < -999 ? 0.42 : 0.12 + 0.3 * rInOut(f, L0 + 3, L0 + 17)) + 0.16 * rInOut(f, pa + 2, pa + 12) - 0.25 * glint - 0.36 * fd.lit - 0.12 * fd.pulse;
    return { i, x, dim, glint, lit: fd.lit, pulse: fd.pulse };
  }).filter(Boolean);
  const top = tickets.find((k) => k.i === TOP);
  const standing = f >= t.tip.a;
  const nDown = t.land.filter((L0, i) => i !== TOP && L0 <= f).length;
  const colTop = PLATE_Y - nDown * PITCH;
  const colBox = [];
  for (const u of [-TW / 2, TW / 2]) for (const y of [colTop, PLATE_Y]) for (const z of [-TH / 2, TH / 2]) colBox.push([COL.x + u, y, COL.z + z]);
  const casters = [{ corners: jpPlinthCorners(PLINTH_POSE) }, { corners: colBox, k: 0.8 }];
  const hc = worldScr(R, [STAND_C[0], STAND_C[1], STAND_C[2] - 40]);
  const fc = worldScr(R, [STAND_C[0], STAND_C[1] + TH / 2, STAND_C[2]]);
  const halo = shine * clamp01(rInOut(f, t.tip.a + 8, t.tip.b + 6));
  const { fed, flick } = fedOf(t, f);
  const feedHalo = halo * clamp01(0.75 * fed + 0.3 * flick);
  const tk = (k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)(react.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(
      TkWhole,
      {
        id: `${id}T${k.i}`,
        rig: R,
        pose: k.x,
        lod: k.i === TOP && standing ? "hi" : "lo",
        dim: clamp01(k.dim),
        shine: k.i === TOP ? shine : 0,
        glow: k.i === TOP ? clamp01(0.8 * shine + 0.2 * fed + 0.15 * flick) : 0,
        sheen: k.i === TOP ? 120 * rInOut(f, t.shine.a, t.shine.b + 30) + 90 * rInOut(f, t.casc.a, t.all.b) : 0,
        prints: k.i === TOP ? topPrints : void 0,
        probe: k.i === TOP ? "the jackpot ticket" : "a missed ticket"
      }
    ),
    k.lit + k.pulse > 0.02 && /* @__PURE__ */ (0,jsx_runtime.jsx)(FeedEdge, { x: k.x, lit: k.lit, pulse: k.pulse }),
    k.glint > 0.02 && /* @__PURE__ */ (0,jsx_runtime.jsx)(Glint, { x: k.x, g: k.glint })
  ] }, k.i);
  const cam = actionCam(shots(t));
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceRoot, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CamFn, { at: cam, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-leaving": travelling(f, runCamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)(Turn, { at: t.span.at, end: t.span.end, from: -6, to: 4, amp: 0.9, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TkFloor, { id: `${id}F`, rig: R, at: { x: COL.x + 40, z: COL.z }, reach: 1300, casters, stage }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(JpPlinth, { id: `${id}P`, rig: R, pose: PLINTH_POSE, fw: TW, fd: TH, part: "base", prints: plPrints, seam: rInOut(f, t.seam.a, t.seam.b) }),
    halo > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { "data-probe": "bg", width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible", opacity: halo }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("radialGradient", { id: `${id}Hl`, children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: theme.accentBright, stopOpacity: 0.34 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.45", stopColor: theme.accent, stopOpacity: 0.14 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: theme.accent, stopOpacity: 0 })
      ] }) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("ellipse", { cx: hc[0], cy: hc[1], rx: 430, ry: 470, fill: `url(#${id}Hl)` })
    ] }),
    feedHalo > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { "data-probe": "bg", width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible", opacity: feedHalo }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("radialGradient", { id: `${id}Hf`, children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: theme.accentBright, stopOpacity: 0.42 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: theme.accent, stopOpacity: 0.2 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: theme.accent, stopOpacity: 0 })
      ] }) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("ellipse", { cx: hc[0], cy: hc[1], rx: 430 + 200 * fed, ry: 470 + 200 * fed, fill: `url(#${id}Hf)` })
    ] }),
    feedHalo > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { "data-probe": "bg", width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible", opacity: clamp01(0.35 * fed + 0.8 * flick) * halo }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("radialGradient", { id: `${id}Hb`, children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: theme.accentBright, stopOpacity: 0.7 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: theme.accent, stopOpacity: 0.25 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: theme.accent, stopOpacity: 0 })
      ] }) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("ellipse", { cx: fc[0], cy: fc[1], rx: 330, ry: 70, fill: `url(#${id}Hb)` })
    ] }),
    tickets.filter((k) => k.i < 2).map(tk),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(JpPlinth, { id: `${id}G`, rig: R, pose: PLINTH_POSE, fw: TW, fd: TH, part: "front" }),
    tickets.filter((k) => k.i >= 2 && k.i !== TOP).map(tk),
    top && tk(top)
  ] }) }) }) });
};
const Glint = ({ x, g }) => {
  const map = (q) => xfApply(x, q);
  const zf = TK_D / 2 + 0.4, u0 = -TK_W / 2 + 30, u1 = TK_W / 2 - 30;
  const d = mapPath(map, R, Array.from({ length: 9 }, (_, k) => [u0 + (u1 - u0) * k / 8, -2, zf]), false);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { "data-probe": "bg", width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: theme.accent, strokeWidth: 7, opacity: 0.22 * g, fill: "none", strokeLinecap: "round" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: theme.accentBright, strokeWidth: 1.8, opacity: 0.85 * g, fill: "none", strokeLinecap: "round" })
  ] });
};
const FeedEdge = ({ x, lit, pulse }) => {
  const map = (q) => xfApply(x, q);
  const u0 = -TK_W / 2 + 18, u1 = TK_W / 2 - 18, zf = TK_D / 2 - 7;
  const side = mapPath(map, R, [[u0, 0.5, zf], [u1, 0.5, zf], [u1, 0.5, -zf], [u0, 0.5, -zf]]);
  const arris = mapPath(map, R, Array.from({ length: 9 }, (_, k) => [u0 + 12 + (u1 - u0 - 24) * k / 8, -2, TK_D / 2 + 0.4]), false);
  const e = clamp01(0.55 * lit + pulse);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { "data-probe": "bg", width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: side, fill: theme.accent, opacity: 0.42 * lit }),
    pulse > 0.01 && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: side, fill: theme.accentBright, opacity: 0.62 * pulse }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: arris, stroke: theme.accent, strokeWidth: 8, opacity: 0.3 * e, fill: "none", strokeLinecap: "round" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: arris, stroke: theme.accentBright, strokeWidth: 1.6, opacity: 0.9 * e, fill: "none", strokeLinecap: "round" })
  ] });
};
export const JackpotPlace = ({ t, place, at: at2, end, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const own = useOwn();
  if (own.ownEnter && f < at2) return null;
  if (own.ownExit && f >= end) return null;
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(JackpotRun, { t, place, stage });
};
const jackpotTrace = (g) => {
  const t = runTimes(RUN_W, RUN_SPAN), c = actionCam(shots(t))(g);
  const scr = (q) => {
    const p = worldScr(R, q);
    return [540 + c.z * (p[0] + c.x - 540), 883.2 + c.z * (p[1] + c.y - 883.2) + 110];
  };
  const x = ticketXf(t, TOP, g);
  const pts = x ? [[-TK_W / 2, -TK_H, 0], [TK_W / 2, -TK_H, 0], [-TK_W / 2, 0, 0], [TK_W / 2, 0, 0]].map((q) => scr(xfApply(x, q))) : [];
  return { z: +c.z.toFixed(3), top: pts.map((p) => p.map(Math.round)), plate: scr([COL.x, PLATE_Y, FZ]).map(Math.round), name: scr([COL.x, FY + JP_NAMEPLATE_V, COL.z + JP_PL.d / 2]).map(Math.round) };
};
