// @ts-nocheck
// ★ V36 "Bre-X Gold" — crack helper (builder M): THE SAWN CORE, OPENED LIKE A BOOK. The partner's drill core lies in its tray row,
//   sawn lengthwise through its axis (a horizontal saw cut); the top half lifts, turns over and lies face-up in the next row, so BOTH
//   sawn faces show: grey stone through and through, a few faint specks at most. Built from bx_core's own engine (profHalf + loftGeo +
//   loftPaint with ROCK_MAT, RockSkin with `half`, GrainTex), so the stone, its grains and its light are the hero core's.
//   (bx_core's `split` rolls both halves sideways 1.08 r apart: 133 units across, wider than a tray channel's 82 — in a tray it
//   would cut through the walls, so this place opens the core the way a sawn core is laid out instead.)
//
//   LOCAL FRAME (a core in a tray, its axis along local y as bx_core's, but turned so local +Z is UP): splitXf(x, y, z) = the core's
//   pose; local −X points at the lens (the next row toward the front). The cut is the plane Z = 0: side +1 the upper half (its
//   sawn face looking down until it turns over), side −1 the lower half (face up).
//   <HalfCore id rig xf len r seed side specks /> one half (an SVG <g>);  <Kerf rig xf len r p /> the saw line drawing along the core.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { seeded } from "./common";
import { rampAt } from "./solid_engine";
import { worldScr, xfApply, xfMul, xfRotY, xfRotZ, xfTrans } from "./tk_rig";
import { CORE_R, GrainDefs, GrainTex, ROCK_MAT, RockSkin, StripDefs, StripPaths, loftGeo, loftPaint, profHalf } from "./bx_core";
import { BX_FLECK, BX_ROCK, BX_ROCK_MIN } from "./bx_gold";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
export const splitXf = (x, y, z) => xfMul(xfTrans([x, y, z]), xfMul(xfRotZ(-90), xfRotY(90)));
// the sawn face (the plane z = 0 of a half's local frame): mineral grains, faint saw marks, and at most a few faint gold specks
const faceMemo = new Map();
const faceGrains = (seed, len, r) => {
  const key = `${seed}|${len}|${r}`;
  if (faceMemo.has(key)) return faceMemo.get(key);
  const rnd = seeded(661 * seed + 3);
  const N = Math.round(len * r * 2 / 120);
  const g = Array.from({ length: N }, () => {
    const x = (rnd() * 2 - 1) * r * 0.96, y = -len / 2 + rnd() * len, s = 0.8 + 1.8 * rnd(), t = rnd(), rot = rnd() * 3;
    return { x, y, s, rot, tone: t < 0.42 ? 0 : t < 0.72 ? 1 : t < 0.96 ? 2 : 3 };
  });
  const sp = Array.from({ length: 5 }, () => ({ x: (rnd() * 2 - 1) * r * 0.7, y: -len / 2 + (0.08 + 0.84 * rnd()) * len, s: 1.1 + 0.7 * rnd() }));
  const out = { g, sp };
  faceMemo.set(key, out);
  return out;
};
const SawnFace = ({ rig, map, len, r, seed, specks }) => {
  const { g, sp } = faceGrains(seed, len, r);
  const P = (q) => {
    const s = worldScr(rig, map(q));
    return `${f2(s[0])},${f2(s[1])}`;
  };
  const b = [[], [], [], []];
  for (const q of g) {
    const pts = [0, 1, 2, 3, 4].map((k) => {
      const a = q.rot + k / 5 * 2 * Math.PI;
      return P([q.x + q.s * 0.8 * Math.sin(a), q.y + q.s * Math.cos(a), -0.1]);
    });
    b[q.tone].push(`M${pts.join("L")}Z`);
  }
  const marks = Array.from({ length: Math.round(len / 9) }, (_, i) => `M${P([-r, -len / 2 + i * 9 + 3, -0.1])}L${P([r, -len / 2 + i * 9 + 1, -0.1])}`).join("");
  return jsxs("g", { "data-probe-skip": true, children: [
    jsx("path", { d: b[0].join(""), fill: BX_ROCK_MIN[0], opacity: 0.5 }),
    jsx("path", { d: b[1].join(""), fill: BX_ROCK_MIN[1], opacity: 0.45 }),
    jsx("path", { d: b[2].join(""), fill: BX_ROCK_MIN[2], opacity: 0.32 }),
    jsx("path", { d: b[3].join(""), fill: BX_ROCK_MIN[3], opacity: 0.45 }),
    jsx("path", { d: marks, stroke: "#ffffff", strokeWidth: 0.6, opacity: 0.05, fill: "none" }),
    specks > 0.01 && sp.map((q, k) => {
      const c = worldScr(rig, map([q.x, q.y, -0.2]));
      return jsx("circle", { cx: f2(c[0]), cy: f2(c[1]), r: f2(q.s), fill: k % 2 ? BX_FLECK.lit : BX_FLECK.base, opacity: 0.55 * specks }, k);
    })
  ] });
};
// the half's end (a half disc): the stone, its grains
const capMemo = new Map();
const CapTex = ({ rig, map, y, r, seed, side, l }) => {
  const key = `${seed}|${r}|${side}`;
  let g = capMemo.get(key);
  if (!g) {
    const rnd = seeded(733 * seed + 5);
    g = Array.from({ length: Math.round(r * r * 0.06) }, () => {
      const rr = r * Math.sqrt(rnd()) * 0.92, a = rnd() * Math.PI;
      return { x: rr * Math.cos(a), z: side * rr * Math.sin(a), s: 1 + 2 * rnd(), tone: rnd() < 0.5 ? 0 : 1, rot: rnd() * 3 };
    });
    capMemo.set(key, g);
  }
  const P = (q) => {
    const s = worldScr(rig, map(q));
    return `${f2(s[0])},${f2(s[1])}`;
  };
  const b = [[], []];
  for (const q of g) b[q.tone].push(`M${[0, 1, 2, 3].map((k) => P([q.x + q.s * Math.cos(q.rot + k * 1.57), y, q.z + q.s * 0.7 * Math.sin(q.rot + k * 1.57)])).join("L")}Z`);
  return jsxs("g", { "data-probe-skip": true, children: [
    jsx("path", { d: b[0].join(""), fill: BX_ROCK_MIN[0], opacity: 0.5 }),
    jsx("path", { d: b[1].join(""), fill: BX_ROCK_MIN[2], opacity: 0.3 })
  ] });
};
const toneOf = (seed) => {
  const r = seeded(97 * seed + 1);
  r();
  return r() * 2 - 1;
};
/** one sawn half — see the top of this file. xf: the half's pose (splitXf · its own move); skinXf: the WHOLE core's frame the skin's
 *  grain field is laid out in (so the two halves' skins meet seamlessly while closed) — pass the same xf for a half at rest */
export const HalfCore = ({ id, rig, xf, len, r = CORE_R, seed = 1, side, specks = 0 }) => {
  const map = (q) => xfApply(xf, q);
  const pr = profHalf(r, side, 40);
  const geo = loftGeo({ prof: pr, len });
  const pt = loftPaint(`${id}h`, rig, map, geo, ROCK_MAT(toneOf(seed)));
  const sawn = pt.strips.filter((q) => q.flat && q.j >= pr.pts.length - 2);
  const skin = pt.strips.filter((q) => !sawn.includes(q));
  return jsxs("g", { children: [
    jsx(GrainDefs, {}),
    jsx(StripDefs, { strips: pt.strips }),
    jsx(StripPaths, { strips: pt.strips }),
    jsx(RockSkin, { rig, map, len, r, seed, half: side }),
    sawn.length > 0 && jsx(SawnFace, { rig, map, len, r, seed: seed * 13 + (side > 0 ? 1 : 2), specks }),
    sawn.length > 0 && jsx(GrainTex, { clipId: `${id}sc`, strips: sawn, rig, map, len, r, op: 0.5 }),
    jsx(GrainTex, { clipId: `${id}gc`, strips: skin, rig, map, len, r, op: 0.5 }),
    pt.caps.map((c) => {
      const col = rampAt(BX_ROCK, 0.18 + 0.86 * c.l);
      return jsxs("g", { children: [
        jsx("path", { d: c.d, fill: col, stroke: col, strokeWidth: 0.6 }),
        jsx(CapTex, { rig, map, y: c.which === "top" ? -len / 2 : len / 2, r, seed, side, l: c.l }),
        jsx("path", { d: c.d, fill: "none", stroke: "#ffffff", strokeWidth: 0.8, opacity: 0.16 })
      ] }, c.which);
    })
  ] });
};
/** the saw line along the closed core's near side (local −X, at the cut Z = 0), drawing from the −y end to p */
export const Kerf = ({ rig, xf, len, r = CORE_R, p, op = 1 }) => {
  if (p <= 1e-3 || op <= 1e-3) return null;
  const map = (q) => xfApply(xf, q);
  const N = 40, pts = [];
  for (let i = 0; i <= N; i++) pts.push(worldScr(rig, map([-r * 0.995, -len / 2 + len * p * i / N, 0])));
  const d = `M${pts.map((q) => `${f2(q[0])},${f2(q[1])}`).join("L")}`;
  return jsxs("g", { "data-probe-skip": true, opacity: op, children: [
    jsx("path", { d, stroke: "#14161A", strokeWidth: 2, fill: "none", opacity: 0.85 }),
    jsx("path", { d, stroke: "#ffffff", strokeWidth: 0.8, fill: "none", opacity: 0.18, transform: "translate(0 1.4)" })
  ] });
};
/** the upper half's move as it turns over into the next row: e 0…1 → a pose in the core's local frame (pitch = the row pitch) */
export const turnOver = (e, lift, pitch) => {
  const a = -180 * clamp01(e);
  const zc = lift * Math.sin(Math.PI * clamp01(e));
  return xfMul(xfTrans([-pitch * clamp01(e), 0, zc]), xfRotY(a));
};
