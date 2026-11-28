// @ts-nocheck
// ★ V39 station WILL (builder D): "Then came the will: $4.8 million to the local hospital, $1.2 million to the library. Twice its yearly budget."
//   Brattleboro's Main Street at blue hour (d_bratt.tsx, era "will" = 2015). The bequest as real $1 bundles (d_money.tsx): every pallet
//   is $600,000 of strapped notes.
//   REV STYLE (Timur 2026-11-27 rules 1–18, V38's cinematic pass):
//   · ARRIVAL: the board's long pull-back (lehman) cuts as the first bundle of the bequest flies OUT of the lens toward the hospital —
//     an object passing the lens carries the cut; the camera keeps easing back the way the board's pull-back was going.
//   · the hospital's eight pallets stand as ONE block; the stream fills them on "will"; on "$4.8 million" the bequest's wrapper band
//     wraps the block: $4.8 MILLION | BEQUEST / BRATTLEBORO MEMORIAL HOSPITAL (the figure lives on the money; no 2-D counter).
//   · one long, slow glide east that FOLLOWS the bundles flying on to the library (the camera is always on the money); the library's
//     two pallets fill as the glide brings them into frame and their band $1.2 MILLION | BEQUEST / BROOKS MEMORIAL LIBRARY wraps on
//     "library" (≈ 1.2 s after "$1.2 million": the price of a glide at half the old speed).
//   · "Twice its yearly budget": beside them the library's yearly budget draws in as ONE block of the same size, YEARLY BUDGET $600,000
//     printed on it (FACTCHECK line 8) — the gift is two of them. Then a slow push over them onto the library's stone monument
//     sign until its panel fills the frame's width: the pavilion opens on the hospital's bronze plaque in the same framing (match cut).
import React, { useMemo } from "react";
import { ease, clamp01 } from "./kit";
import { WIN, wAt } from "./windows";
import { cueAt } from "../bnx/SfxLayer";
import { BrattSet, HOSP_PALLETS, LIB_PALLETS, GHOST, PL, HOSP_BLOCK, LIB_BLOCK, LIB } from "./d_bratt";
import { Pallet, TopLayers, Flyers, streamItems, Ghost, WrapBand, PAL, STACK, PALLET_TOP } from "./d_money";

export const O_BRATT = [2400, 0, 0];
const T = () => {
  const w = WIN().will, s0 = w.start;
  return { s0, end: w.end, will: wAt("will", s0), m48: wAt("$4.8 million", s0), hosp: wAt("hospital", s0), m12: wAt("$1.2 million", s0), lib: wAt("library", s0), twice: wAt("twice", s0), yearly: wAt("yearly", s0) };
};
// the fills (0..1) of the hospital's eight pallets and the library's two, by frame (the hospital's block is full before its band wraps)
export const hospFill = (t, j, f) => ease(f, t.s0 + 8 + j * 4, t.s0 + 8 + j * 4 + 24);
export const libFill = (t, j, f) => ease(f, t.lib - 22 + j * 6, t.lib - 22 + j * 6 + 22);   // they fill as the glide brings them into frame
export const bandK = (t, f) => ({ h: ease(f, t.m48 + 2, t.m48 + 20), l: ease(f, t.lib + 2, t.lib + 18) });
const SRC_H = [-8.5, 13, 3.5];          // high over the street, to the camera's right
const SRC_L = [-9.0, 7.5, 0.5];         // the second stream leaves from over the hospital's block and flies east along the street
// the lead bundle: it starts just in front of the lens at the cut and flies away onto the block (an object passing the lens carries the cut)
const LEAD = (t, f, cam0) => {
  const u = clamp01((f - t.s0 + 1) / 34); if (u <= 0 || u >= 1) return null;
  const d = HOSP_PALLETS[5], tg = CAM_T0;
  const fw = [tg[0] - cam0[0], tg[1] - cam0[1], tg[2] - cam0[2]], fl = Math.hypot(...fw);
  const st = [cam0[0] + fw[0] / fl * 0.42 + 0.03, cam0[1] + fw[1] / fl * 0.42 - 0.05, cam0[2] + fw[2] / fl * 0.42];
  const e = u * u * (1.6 - 0.6 * u);                 // leaves the lens slowly, then away onto the block
  const en = [d[0], d[1] + PAL.h + STACK.h + 0.05, d[2]];
  const p = [st[0] + (en[0] - st[0]) * e, st[1] + (en[1] - st[1]) * e + Math.sin(Math.PI * e) * 0.5, st[2] + (en[2] - st[2]) * e];
  return { p, r: [0.25 + 0.5 * e, 0.15 + 1.2 * e, 0.12], s: 0.1 * (u > 0.94 ? (1 - u) / 0.06 : 1) };
};
export const willStreams = (t, f) => [
  ...streamItems(f, { N: 90, a0: t.s0 + 2, a1: t.s0 + 50, dur: 30, src: SRC_H, dst: HOSP_PALLETS, topAt: (j, fr) => PL + PAL.h + STACK.h * hospFill(t, j, fr), seed: 3 }),
  ...streamItems(f, { N: 40, a0: t.lib - 66, a1: t.lib - 16, dur: 40, src: SRC_L, dst: LIB_PALLETS, topAt: (j, fr) => PL + PAL.h + STACK.h * libFill(t, j, fr), seed: 41, spread: 0.8 })
];
const CAM0 = [-15.0, 2.7, 9.0], CAM_T0 = [-16.6, 3.0, -6.5];   // the cut's camera and aim (local)
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  const pal = [...HOSP_PALLETS.map((p, j) => ({ p, fill: hospFill(t, j, f) })), ...LIB_PALLETS.map((p, j) => ({ p, fill: libFill(t, j, f) }))];
  const inFlight = f < t.lib + 30;
  const lead = LEAD(t, f, CAM0);
  const bk = bandK(t, f), yb = PL + PAL.h + STACK.h * 0.52;
  return (
    <group>
      <BrattSet era="will" />
      {pal.map((q, i) => <Pallet key={i} position={q.p} fill={q.fill} edge={0} />)}
      <TopLayers list={pal} />
      {inFlight && <Flyers items={[...willStreams(t, f), lead ?? { p: [0, -50, 0], r: [0, 0, 0], s: 0 }]} />}
      <WrapBand c={HOSP_BLOCK.c} w={HOSP_BLOCK.w} d={HOSP_BLOCK.d} y={yb} k={bk.h} fig="$4.8 MILLION" l1="BEQUEST" l2="BRATTLEBORO MEMORIAL HOSPITAL" tkey="hosp" />
      <WrapBand c={LIB_BLOCK.c} w={LIB_BLOCK.w} d={LIB_BLOCK.d} y={yb} k={bk.l} fig="$1.2 MILLION" l1="BEQUEST" l2="BROOKS MEMORIAL LIBRARY" tkey="lib" h={0.3} />
      <Ghost position={GHOST} k={ease(f, t.twice - 6, t.twice + 14)} />
    </group>
  );
};
// the library's monument sign (d_bratt Monument at [14.4, PL, -4.8], ry 0.3): its panel's centre and facing
const MON_N = [Math.sin(0.3), 0, Math.cos(0.3)], MON_C = [14.4 + 0.161 * MON_N[0], PL + 1.38, -4.8 + 0.161 * MON_N[2]];
const W = (p) => [p[0] + O_BRATT[0], p[1] + O_BRATT[1], p[2] + O_BRATT[2]];
// rev style camera: slow eased glides that overlap (no settle-and-restart), always on the money
const shots = () => {
  const t = T(), hb = HOSP_BLOCK.c, lb = LIB_BLOCK.c;
  return [
    // the cut: low in the forecourt, the hospital's entrance and canopy name ahead, the lead bundle leaving the lens
    { a: t.s0, b: t.s0, cut: true, pos: W(CAM0), target: W(CAM_T0), fov: 44 },
    // easing back and up as the stream fills the block; the band wraps on "$4.8 million"
    { a: t.s0 + 1, b: t.m48 + 24, pos: W([-14.4, 5.0, 8.6]), target: W([hb[0], 0.7, hb[1]]), fov: 42 },
    // one long glide east with the bundles flying on to the library: it eases back over the lawn (its maples) so the 31 m travel reads
    // slowly, then settles on the library's front — its two pallets and the budget block low in the frame, the lit glass behind
    { a: t.m48 + 12, b: t.m12 + 16, pos: W([2.0, 6.4, 12.6]), target: W([7.0, 4.2, -3.6]), fov: 46 },
    { a: t.m12 - 2, b: t.twice + 4, pos: W([18.4, 5.4, 7.7]), target: W([14.25, 0.4, -2.4]), fov: 42 },
    // "Twice its yearly budget" — then a slow push over the pallets onto the library's stone monument sign (BROOKS MEMORIAL LIBRARY)
    // until its panel fills the frame's width: the pavilion opens on the hospital's bronze plaque in the same framing (sign → sign match cut)
    { a: t.twice - 2, b: t.end + 1, pos: W([MON_C[0] + MON_N[0] * 6.4, MON_C[1] + 0.25, MON_C[2] + MON_N[2] * 6.4]), target: W(MON_C), fov: 40 }
  ];
};
const Overlay = () => null;   // rev style: no 2-D counters or tags — the figures are printed on the bands and the budget block
// rev style sound (rules 14/16/18): only visible actions, quiet, each spanning its action
const sfx = () => {
  const t = T();
  return [
    cueAt("ov_money_drop", t.s0 + 22, 16, 0.5),             // the first bundles land on the hospital's block
    cueAt("ov_paper_unfold", t.m48 + 2, 18, 0.16),          // the $4.8 MILLION band wraps (m48+2 … +20)
    cueAt("ov_money_drop", t.lib - 10, 16, 0.42),           // the bundles land on the library's pallets (in frame from ≈ lib−8)
    cueAt("ov_paper_unfold", t.lib + 2, 16, 0.14)           // the $1.2 MILLION band wraps (lib+2 … lib+18)
  ];
};
const w0 = WIN().will;
// the street set is mounted by ONE station at a time (will to its end, pavilion from its start): two copies of the set never overlap
export const BRATT_LIGHT = { target: [-12, 0, -5], shadowBox: 38, keyI: 0.95, fillI: 0.28, rimI: 1.3 };
export const ST = { id: "will", origin: O_BRATT, from: w0.start - 8, to: w0.end, light: BRATT_LIGHT, shots, Scene, Overlay, sfx };
