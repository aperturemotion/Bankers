// @ts-nocheck
// ★ V39 station JCP (472 → 594, origin [0,0,0] — the same store set as hook and line): "then worked as a part-time janitor at
//   JCPenney for 17 more."  Outside: the store front at blue hour — brick, the stucco fascia with the plain white letters "JCPenney",
//   the entrance canopy's warm downlights, the two lit display windows, the striped lot and its tall lamps, pines and the Vermont hills
//   behind. One slow dolly across the lot toward the lit doors (it never passes through anything; the whole sign stays in frame).
//   "Part-time janitor" on "part-time" (to the doors); 17 YEARS · AT JCPENNEY rolls 0 → 17 and lands on "17 more.".
import React from "react";
import { Tag, Counter } from "./overlays";
import { WIN, wAt } from "./windows";
import { cueAt } from "../bnx/SfxLayer";
import { StoreSet } from "./a_store";

const T = () => ({ then: wAt("then", 400), part: wAt("part-time"), jcp: wAt("JCPenney"), more: wAt("17 more.") });
const Scene = ({ f }) => <StoreSet mode="out" cart={{ xray: 0, flash: 0, glow: 0 }} />;
const shots = () => {
  const s = WIN().jcp.start;
  return [
    { a: s, b: s, cut: true, pos: [4.6, 2.4, 41.5], target: [0.5, 3.4, 0], fov: 32 },
    // the slow push across the lot toward the lit entrance (still moving at the dissolve)
    { a: s, b: s + 180, pos: [1.7, 2.3, 21.5], target: [0.1, 3.1, 0], fov: 32 }
  ];
};
const Overlay = ({ f, P }) => {
  const t = T(), end = WIN().jcp.end;
  const door = P([0.9, 1.25, 0.1]);
  return (
    <>
      <Tag text="Part-time janitor" at={t.part - 12} out={end - 24} x={1010} y={520} side="right" to={door.behind ? null : door} />
      <Counter at={t.more - 26} out={end - 18} x={540} y={300} from={0} value={17} unit="YEARS" label="AT JCPENNEY" size={112} countDur={32} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [cueAt("whooshsoft", WIN().jcp.start + 40, 30, 0.2), cueAt("coin", t.more, 16, 0.3)];
};
export const ST = { id: "jcp", origin: [0, 0, 0], get from() { return WIN().jcp.start - 8; }, get to() { return WIN().jcp.end + 8; },
  light: { target: [0, 2, 1], shadowBox: 24, keyI: 1.0, fillI: 0.32, key: [-12, 16, 18] }, shots, Scene, Overlay, sfx };
