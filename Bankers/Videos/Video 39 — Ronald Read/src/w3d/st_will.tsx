// @ts-nocheck
// ★ V39 station WILL (builder D): "Then came the will: $4.8 million to the local hospital, $1.2 million to the library. Twice its yearly budget."
//   Brattleboro's Main Street at blue hour (d_bratt.tsx, era "will" = 2015). The bequest as real $1 bundles (d_money.tsx): every pallet
//   is $600,000 of strapped notes with glowing light-blue edges.
//   · cut in on Brattleboro Memorial Hospital: eight empty pallets wait under the canopy (its name in lit letters); on "will" a
//     stream of bundles arcs in over the camera and the stacks rise; counter $4.8 MILLION / HOSPITAL lands on "$4.8 million"
//   · one smooth truck east along the street (the lawn, its trees) to Brooks Memorial Library: the stream carries on to its two
//     pallets; counter $1.2 MILLION / LIBRARY on "$1.2 million"
//   · "Twice its yearly budget": beside the two pallets the library's yearly budget draws in as ONE clear block of the same size
//     (YEARLY BUDGET on its face) — the gift is two of them; tag 2× ITS YEARLY BUDGET. The camera keeps drifting into the dissolve.
import React, { useMemo } from "react";
import { ease, clamp01 } from "./kit";
import { Tag, Counter } from "./overlays";
import { WIN, wAt } from "./windows";
import { cueAt } from "../bnx/SfxLayer";
import { BrattSet, HOSP_PALLETS, LIB_PALLETS, GHOST, PL } from "./d_bratt";
import { Pallet, TopLayers, Flyers, streamItems, Ghost, PAL, STACK, PALLET_TOP } from "./d_money";

export const O_BRATT = [2400, 0, 0];
const T = () => {
  const w = WIN().will, s0 = w.start;
  return { s0, end: w.end, will: wAt("will", s0), m48: wAt("$4.8 million", s0), hosp: wAt("hospital", s0), m12: wAt("$1.2 million", s0), lib: wAt("library", s0), twice: wAt("twice", s0), yearly: wAt("yearly", s0) };
};
// the fills (0..1) of the hospital's eight pallets and the library's two, by frame
const hospFill = (t, j, f) => ease(f, t.will + 16 + j * 6, t.will + 16 + j * 6 + 24);
const libFill = (t, j, f) => ease(f, t.m12 - 4 + j * 10, t.m12 - 4 + j * 10 + 26);
const SRC_H = [-8.5, 13, 3.5], SRC_L = [21.5, 13, 3.0];   // high in the sky to the camera's right, over the street
export const willStreams = (t, f) => [
  ...streamItems(f, { N: 110, a0: t.will - 16, a1: t.will + 44, dur: 34, src: SRC_H, dst: HOSP_PALLETS, topAt: (j, fr) => PL + PAL.h + STACK.h * hospFill(t, j, fr), seed: 3 }),
  ...streamItems(f, { N: 44, a0: t.m12 - 34, a1: t.m12 + 4, dur: 30, src: SRC_L, dst: LIB_PALLETS, topAt: (j, fr) => PL + PAL.h + STACK.h * libFill(t, j, fr), seed: 41 })
];
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  const pal = [...HOSP_PALLETS.map((p, j) => ({ p, fill: hospFill(t, j, f) })), ...LIB_PALLETS.map((p, j) => ({ p, fill: libFill(t, j, f) }))];
  const inFlight = f > t.will - 18 && f < t.m12 + 36;
  return (
    <group>
      <BrattSet era="will" />
      {pal.map((q, i) => <Pallet key={i} position={q.p} fill={q.fill} />)}
      <TopLayers list={pal} />
      {inFlight && <Flyers items={willStreams(t, f)} />}
      <Ghost position={GHOST} k={ease(f, t.twice - 6, t.twice + 14)} />
    </group>
  );
};
const W = (p) => [p[0] + O_BRATT[0], p[1] + O_BRATT[1], p[2] + O_BRATT[2]];
const shots = () => {
  const t = T();
  return [
    // the hospital whole (its upper floors, the roofline, the sky), then a crane down and in to the pallets as the stream fills them
    { a: t.s0, b: t.s0, cut: true, pos: W([-16.6, 4.4, 12.8]), target: W([-15.8, 8.4, -9]), fov: 46 },
    { a: t.s0 + 2, b: t.hosp - 18, pos: W([-13.8, 5.2, 6.4]), target: W([-17.0, 1.45, -4.5]), fov: 42 },
    // one smooth truck east to the library, arriving wide (its overhang and name, the glass, the plaza)
    { a: t.hosp - 26, b: t.m12 + 14, pos: W([23.4, 5.4, 13.6]), target: W([14.0, 3.0, -4.0]), fov: 50 },
    // "Twice its yearly budget": a slow push onto the two pallets and the budget block, on into the dissolve
    { a: t.m12 + 8, b: t.twice + 8, pos: W([18.7, 5.1, 6.9]), target: W([14.3, 0.35, -2.6]), fov: 42 },
    { a: t.twice + 2, b: t.end + 12, pos: W([18.2, 4.9, 5.9]), target: W([14.3, 0.3, -2.6]), fov: 42 }
  ];
};
const Overlay = ({ f, P }) => {
  const t = T();
  const pair = P([(LIB_PALLETS[0][0] + LIB_PALLETS[1][0]) / 2, PL + PALLET_TOP + 0.05, LIB_PALLETS[0][2]]);
  return (
    <>
      <Counter at={t.m48 - 4} out={t.hosp + 2} x={540} y={470} value={4.8} decimals={1} prefix="$" unit="MILLION" label="Hospital" size={108} countDur={26} />
      <Counter at={t.m12 - 4} out={t.twice - 10} x={540} y={380} value={1.2} decimals={1} prefix="$" unit="MILLION" label="Library" size={108} countDur={22} />
      <Tag text="2× its yearly budget" at={t.twice - 2} out={t.end - 16} x={150} y={470} to={pair.behind ? null : pair} size={30} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("airwoosh", t.will - 6, 30, 0.25),                // the stream begins
    cueAt("whooshsoft", t.hosp - 6, 26, 0.35),              // the truck to the library (fastest ≈ its middle)
    cueAt("ee_click_click_01", t.twice - 2, 6, 0.22)        // the budget block draws in
  ];
};
const w0 = WIN().will;
export const ST = { id: "will", origin: O_BRATT, from: w0.start - 8, to: w0.end + 8, light: { target: [0, 0, -4], shadowBox: 30, keyI: 0.95, fillI: 0.28, rimI: 1.3 }, shots, Scene, Overlay, sfx };
