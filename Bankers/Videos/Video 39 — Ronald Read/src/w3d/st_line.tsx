// @ts-nocheck
// ★ V39 station LINE (1984 → 2201, origin [0,0,0] — the store set again): "He never earned a big salary. He just gave his money time."
//   The callback to the opening image: the janitor's cart in the night aisle, the glass bin with the glowing certificate stack and its
//   estate strap (ESTATE OF RONALD READ · ALMOST $8 MILLION). (+ the BANKER$ close.)
//   ★ V39 style pass (Timur's rules 1, 2, 6):
//   · ARRIVAL — a MATCH CUT on the name: the pavilion station ends pushing square-on into the lit sign's top line RONALD READ (Figtree 700
//     caps, white on dark); we land (cut: true) on the same words in the same face, printed on the strap across the top of the stack,
//     close and upright, the line spanning ~85 % of the frame width just above the centre.
//   · then ONE slow pull-back, rising, that never comes back in: off the strap to the glass bin and its cart under the spotlight, then on
//     down the aisle (the racks, the lit doors far behind) — the camera stays on the stack the whole way; the close's OUTRO continues it.
//   · the "Held for decades" tag is gone (rule 6) — nothing replaces it: the stack and its strap ARE the decades.
//   The camera stays UNDER the ceiling, over the open main aisle (no sign or fixture above it), with ~34 m of open aisle behind it.
import React from "react";
import { WIN } from "./windows";
import { ease } from "./kit";
import { StoreSet, CART } from "./a_store";
import { BAND, BAND_TEXT } from "./a_cart";
import { strapW, bandBack } from "./st_hook";

export const CEIL_FADE = null;   // the V39 close pulls back along the aisle (Main.tsx OUTRO), under the ceiling
const Scene = ({ f }) => <StoreSet mode="in" cart={{ xray: 1, flash: 0, glow: 1, fig: 1 }} ceilFade={CEIL_FADE ? ease(f, CEIL_FADE[0], CEIL_FADE[1]) : 0} />;
// a pose `h` m back (toward the camera's side of the stack, i.e. down the aisle) and `v` m up from the point c
const shots = () => {
  const s = WIN().line.start;
  const c = strapW([0, BAND.y, BAND.hz]), name = strapW([0, BAND_TEXT.nameY, BAND.hz]);
  return [
    // the match: square-on to the band's RONALD READ (≈ 1.9 m, fov 26: the line ≈ 45 % of the width, a little above centre)
    { a: s, b: s, cut: true, pos: bandBack(name, 1.9, 0.3), target: [name[0], name[1] - 0.02, name[2]], fov: 26 },
    // ONE slow pull-back, rising a little, to the glass bin on its cart under the spotlight (it never comes back in; the close's OUTRO
    // continues it along the same line)
    { a: s + 1, b: s + 250, pos: bandBack(c, 2.9, 0.92), target: [c[0], c[1] + 0.27, c[2]], fov: 29 }   // the band ends low in frame (≈ y 1300), clear of the BANKER$ logo at y 960
  ];
};
const sfx = () => [];
export const ST = { id: "line", origin: [0, 0, 0], get from() { return WIN().line.start - 8; }, get to() { return WIN().line.end + 8; },
  light: { target: [CART.p[0], 0, CART.p[2]], shadowBox: 7, keyI: 0.4, fillI: 0.16, key: [-5, 12, 10] }, shots, Scene, sfx };
