// @ts-nocheck
// ★ V39 station LINE (1984 → 2201, origin [0,0,0] — the store set again): "He never earned a big salary. He just gave his money time."
//   The callback to the opening image: the janitor's cart in the night aisle, its glass bin with the glowing certificate stack. One
//   slow pull-back down the aisle, rising as it goes (a wide shot: the cart, the racks, the lit doors beyond) — the camera stays
//   UNDER the ceiling, in the open air over the main aisle (no sign or fixture above it), with ~34 m of open aisle behind it for the
//   close's camera. "Held for decades" tags the stack on "just". After ~2105 the BANKER$ close covers the world; if the close's
//   camera rises (Main.tsx OUTRO), the ceiling fades out under the veil first (CEIL_FADE) so it never flies through the tiles.
import React from "react";
import { Tag } from "./overlays";
import { WIN, wAt } from "./windows";
import { cueAt } from "../bnx/SfxLayer";
import { ease } from "./kit";
import { StoreSet, cartPt, CART } from "./a_store";
import { BIN } from "./a_cart";

export const CEIL_FADE = null;   // the V39 close pulls back along the aisle (Main.tsx OUTRO), under the ceiling
const T = () => ({ he: wAt("he", 1980), salary: wAt("salary."), just: wAt("just", 1980), time: wAt("time.", 1980) });
const Scene = ({ f }) => <StoreSet mode="in" cart={{ xray: 1, flash: 0, glow: 1 }} ceilFade={CEIL_FADE ? ease(f, CEIL_FADE[0], CEIL_FADE[1]) : 0} />;
const shots = () => {
  const s = WIN().line.start, b = cartPt([BIN.x, 0.55, BIN.z]);
  return [
    { a: s, b: s, cut: true, pos: [b[0] + 1.25, 1.85, b[2] - 3.7], target: [b[0], 0.35, b[2] + 0.2], fov: 34 },
    // the pull-back down the aisle, rising (one move, eased; it never comes back in)
    { a: s, b: s + 150, pos: [0.85, 2.3, -30.8], target: [0.05, 0.8, -21.2], fov: 36 },
    { a: s + 140, b: s + 300, pos: [0.75, 2.75, -35.5], target: [0.1, 1.0, -20.6], fov: 37 }
  ];
};
const Overlay = ({ f, P }) => {
  const t = T();
  const stack = P(cartPt([BIN.x, 0.62, BIN.z]));
  return <Tag text="Held for decades" at={t.just - 10} out={t.time + 8} x={70} y={420} to={stack.behind ? null : stack} />;
};
const sfx = () => [cueAt("whooshsoft", WIN().line.start + 64, 30, 0.2)];
export const ST = { id: "line", origin: [0, 0, 0], get from() { return WIN().line.start - 8; }, get to() { return WIN().line.end + 8; },
  light: { target: [CART.p[0], 0, CART.p[2]], shadowBox: 7, keyI: 0.4, fillI: 0.16, key: [-5, 12, 10] }, shots, Scene, Overlay, sfx };
