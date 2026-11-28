// @ts-nocheck
// ★ V39 station JCP (472 → 594, origin [0,0,0] — the same store set as hook and line): "then worked as a part-time janitor at
//   JCPenney for 17 more."  Outside: the store front at blue hour — brick, the stucco fascia with the plain white letters "JCPenney",
//   the entrance canopy's warm downlights, the two lit display windows, the striped lot and its tall lamps, pines and the Vermont hills
//   behind. The place is named by its own sign (Timur rule 10).
//   ★ V39 style pass (Timur's rules 1, 2, 6, 11):
//   · ARRIVAL — a GRAPHIC MATCH CUT, sign to sign (one employer to the next): the gas station ends square-on on its lit fascia sign
//     HAVILAND'S / SERVICE STATION, centred, the lettering ~65 % of the frame width, a little above the frame's centre; we land (cut: true)
//     on the lit "JCPenney" letters at the same place and size, square-on from the lot.
//   · then ONE slow descending dolly toward the lit entrance: the sign stays in frame, the doors and display windows come up under it.
//   · the "Part-time janitor" tag and the 17 YEARS counter are gone (rule 6); the voice carries them, the store is named by its sign.
import React from "react";
import { WIN } from "./windows";
import { StoreSet, SIGN_AT } from "./a_store";

const Scene = ({ f }) => <StoreSet mode="out" cart={{ xray: 0, flash: 0, glow: 0 }} />;
const shots = () => {
  const s = WIN().jcp.start;
  return [
    // the match: nearly square-on to the sign (letters ≈ 60 % of the width, centred ≈ 33 % down the frame), from over the lot
    { a: s, b: s, cut: true, pos: [3.4, 3.5, 25.5], target: [0.25, 3.95, 0], fov: 32 },
    // one slow descending dolly toward the entrance (still moving at the cut to the yard)
    { a: s + 1, b: s + 190, pos: [3.1, 2.5, 18.2], target: [0.2, 3.0, 0], fov: 32 }
  ];
};
const sfx = () => [];
export const ST = { id: "jcp", origin: [0, 0, 0], get from() { return WIN().jcp.start - 8; }, get to() { return WIN().jcp.end + 8; },
  light: { target: [0, 2, 1], shadowBox: 24, keyI: 1.0, fillI: 0.32, key: [-12, 16, 18] }, shots, Scene, sfx };
