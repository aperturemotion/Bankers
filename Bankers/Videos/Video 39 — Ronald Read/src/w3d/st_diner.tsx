// @ts-nocheck
// ★ V39 station DINER (builder C): "A stranger once paid for his meal, thinking he couldn't afford it." (814–916, 3.4 s)
//   A Friendly's booth at night (c_diner.tsx): the finished plate, the coffee, the tent card, and the guest check on its tray. No people.
//   ★ rev 2026-11-28 (Timur's cinematic rules, V38 → V39):
//   · ARRIVAL (cut: true at start): the yard station pushes into his house's lit window until its warm light fills the frame (V38's
//     total → rules precedent); we land on a warm close-up UNDER THE FRIENDLY'S PENDANT: the check tray, the plate's rim, the mug.
//   · ONE slow push (1.9× over 110 f, no turn) onto the guest check, still easing at the cut into `shares`.
//   · the figure lives on the object: the server's hand writes PAID across the check on "paid" and "Paid by another guest" under it on
//     "meal," (c_diner INK / WriteDecal) — the 2-D tag "A stranger paid" is gone.
//   · EXIT: the push ends with the check filling ~2/3 of the frame width; `shares` cuts to the PG&E certificate in his document box at the
//     same place and size in frame (paper → paper: the bill someone else paid → the shares he quietly bought).
import React from "react";
import { WIN, wAt } from "./windows";
import { cueAt } from "../bnx/SfxLayer";
import { ease } from "./kit";
import { DinerSet, onCheck, TOP } from "./c_diner";

export const DINER_ORIGIN = [1200, 0, 0];
const O = DINER_ORIGIN;
const Wp = (p) => [p[0] + O[0], p[1] + O[1], p[2] + O[2]];
export const T = () => {
  const w = WIN().diner;
  return { start: w.start, end: w.end, paid: wAt("paid", w.start), meal: wAt("meal,", w.start) };
};
// the ink schedule (frames the hand writes): PAID over 14 f from "paid", the note over 22 f from "meal,"
export const INK_T = () => { const t = T(); return { paid: [t.paid, t.paid + 14], note: [t.meal, t.meal + 22] }; };
const Scene = ({ f }) => { const k = INK_T(); return <DinerSet ink={{ paid: ease(f, k.paid[0], k.paid[1]), note: ease(f, k.note[0], k.note[1]) }} />; };
const shots = () => {
  const t = T();
  const c = onCheck(0.5, 0.47, 0);
  return [
    // the warm close-up under the pendant: the check tray in front, the plate's rim and the mug beyond (~0.63 m)
    { a: t.start, b: t.start, cut: true, pos: Wp([0.2, 1.215, 0.475]), target: Wp([0.13, 0.78, 0.095]), fov: 40 },
    // one slow push onto the check (~0.33 m), on the same line of sight; still easing at the cut
    { a: t.start + 1, b: t.end + 8, pos: Wp([c[0] + 0.024, c[1] + 0.25, c[2] + 0.222]), target: Wp([c[0], c[1], c[2]]), fov: 40 },
  ];
};
const sfx = () => {
  const k = INK_T();
  return ([
    cueAt("ov_chalk", k.paid[0], k.paid[1] - k.paid[0], 0.2),   // the pen writing PAID (starts and ends with the ink)
    cueAt("ov_chalk", k.note[0], k.note[1] - k.note[0], 0.14),   // … and the note under it
  ]).map((c) => ({ ...c, fade: 4 }));
};
export const ST = { id: "diner", origin: O, from: WIN().diner.start - 8, to: WIN().diner.end + 8, light: { target: [0, TOP, 0], shadowBox: 1.4, keyI: 0.55, fillI: 0.22, rimI: 0.6 }, shots, Scene, sfx };
