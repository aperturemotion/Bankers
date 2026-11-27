// @ts-nocheck
// ★ V39 station DINER (builder C): "A stranger once paid for his meal, thinking he couldn't afford it." (814–916, 3.4 s)
//   A Friendly's booth at night (c_diner.tsx): the finished plate, the coffee, the tent card, and the guest check on its tray with
//   PAID written across it. No people — the empty booth after the meal. ONE gentle push from the aisle toward the check (it keeps
//   easing through the dissolve into `shares`). Tag "A stranger paid" on "paid", gone before the window ends.
import React from "react";
import { Tag } from "./overlays";
import { WIN, wAt, wEndAt } from "./windows";
import { cueAt } from "../bnx/SfxLayer";
import { DinerSet, onCheck, TOP } from "./c_diner";

export const DINER_ORIGIN = [1200, 0, 0];
const O = DINER_ORIGIN;
const Wp = (p) => [p[0] + O[0], p[1] + O[1], p[2] + O[2]];
export const T = () => {
  const w = WIN().diner;
  return { start: w.start, end: w.end, paid: wAt("paid", w.start), meal: wAt("meal,", w.start), afford: wAt("afford", w.start), itEnd: wEndAt("it.", w.start) };
};
const Scene = () => <DinerSet />;
const shots = () => {
  const t = T();
  return [
    // the booth from the aisle: the bench ends either side, the plate, the check tray nearest, the pendant, the night window
    { a: t.start, b: t.start, cut: true, pos: Wp([0.4, 1.4, 1.98]), target: Wp([0.04, 0.84, -0.15]), fov: 48 },
    // one gentle push toward the check (still easing at end + 8)
    { a: t.start + 1, b: t.end + 22, pos: Wp([0.24, 1.14, 0.66]), target: Wp([0.145, 0.7, 0.26]), fov: 44 },
  ];
};
const Overlay = ({ f, P }) => {
  const t = T();
  const p = P(onCheck(0.42, 0.42, 0.001));
  return (
    <>
      <Tag text="A stranger paid" at={t.paid} out={t.end - 18} x={70} y={Math.max(320, Math.min(620, p.y - 380))} to={p.behind ? null : p} size={30} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [cueAt("whooshsoft", t.start + 20, 30, 0.22)];
};
export const ST = { id: "diner", origin: O, from: WIN().diner.start - 8, to: WIN().diner.end + 8, light: { target: [0, TOP, 0], shadowBox: 2.6, keyI: 0.55, fillI: 0.22, rimI: 0.6 }, shots, Scene, Overlay, sfx };
