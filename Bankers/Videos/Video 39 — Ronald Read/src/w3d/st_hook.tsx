// @ts-nocheck
// ★ V39 station HOOK (0 → 217, origin [0,0,0]): "When a retired janitor in Vermont died in 2014, his will revealed he was worth almost
//   $8 million."  Inside the closed JCPenney in Brattleboro at night (a_store.tsx). Frame 0 is already moving: low along the glossy
//   terrazzo aisle toward the janitor's cart, the glass entrance doors glowing blue-hour at the far end. "Brattleboro, Vermont" on
//   "Vermont"; "Died 2014" (pinned to the cart) on "2014,". On "will" the signature reveal: the cart's trash bin turns to clear glass
//   (white rim), the tall stack of share certificates inside glows in the Bankers light blue, the camera rises and closes in on it;
//   ESTATE ≈ rolls to $8 MILLION on "$8 million.". The camera keeps drifting on the glass bin through the dissolve (end + 8).
import React from "react";
import { Tag, Counter } from "./overlays";
import { WIN, wAt } from "./windows";
import { cueAt } from "../bnx/SfxLayer";
import { ease, clamp01 } from "./kit";
import { StoreSet, cartPt, CART } from "./a_store";
import { BIN, STACK_TOP } from "./a_cart";

const T = () => ({ vermont: wAt("Vermont"), y2014: wAt("2014,"), will: wAt("will"), almost: wAt("almost"), m8: wAt("$8 million.") });
export const revealAt = (t, f) => ({
  xray: ease(f, t.will, t.will + 10),
  flash: clamp01(1 - Math.abs(f - (t.will + 7)) / 10),
  glow: ease(f, t.will + 4, t.will + 40)
});
const BINW = (y) => cartPt([BIN.x, y, BIN.z]);
const Scene = ({ f }) => <StoreSet mode="in" cart={revealAt(T(), f)} />;
const shots = () => {
  const t = T(), b = BINW(0.55);
  return [
    { a: -60, b: -60, pos: [-0.35, 0.32, -37.0], target: [0.0, 0.55, -21], fov: 42 },
    // already gliding at frame 0: low over the polished aisle toward the cart (eased from before the film starts)
    { a: -60, b: t.will + 30, pos: [-0.2, 0.6, -28.4], target: [0.05, 0.62, -21.6], fov: 40 },
    // on "will": up and in, onto the glass bin with its stack (≈ 2.4 m, looking down into it)
    { a: t.will - 22, b: t.m8 + 30, pos: [b[0] + 1.55, 2.2, b[2] - 3.75], target: [b[0], 0.3, b[2] + 0.25], fov: 34 },
    // the drift on through the dissolve
    { a: t.m8 + 20, b: t.m8 + 150, pos: [b[0] + 2.05, 2.25, b[2] - 3.85], target: [b[0], 0.31, b[2] + 0.3], fov: 34 }
  ];
};
const Overlay = ({ f, P }) => {
  const t = T(), end = WIN().hook.end;
  const cart = P(cartPt([-0.25, 1.06, 0]));
  return (
    <>
      <Tag text="Brattleboro, Vermont" at={t.vermont - 12} out={t.will - 8} x={70} y={300} to={null} />
      <Tag text="Died 2014" at={t.y2014 - 12} out={t.will - 4} x={70} y={392} to={cart.behind ? null : cart} />
      <Counter at={t.m8 - 26} out={end - 20} x={540} y={318} from={0} value={8} prefix="$" unit="MILLION" label="ESTATE ≈" size={112} countDur={32} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("whooshsoft", 22, 30, 0.22),            // the glide in (its fastest frames)
    cueAt("pingshort", t.will + 2, 14, 0.32),     // the shell turns to glass
    cueAt("whooshsoft", t.will + 30, 26, 0.18),   // the rise onto the bin
    cueAt("coin", t.m8, 16, 0.3)                  // $8 MILLION lands
  ];
};
const W0 = () => WIN().hook;
export const ST = { id: "hook", origin: [0, 0, 0], get from() { return 0; }, get to() { return W0().end + 8; },
  light: { target: [CART.p[0], 0, CART.p[2]], shadowBox: 7, keyI: 0.4, fillI: 0.16, key: [-5, 12, 10] }, shots, Scene, Overlay, sfx };
