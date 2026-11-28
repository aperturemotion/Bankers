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
import { ease, easeOut, clamp01 } from "./kit";
import { useCurrentFrame } from "remotion";
import { BODY } from "./fonts3d";
import { StoreSet, cartPt, CART } from "./a_store";
import { BIN, STACK_TOP } from "./a_cart";

const T = () => ({ vermont: wAt("Vermont"), y2014: wAt("2014,"), will: wAt("will"), almost: wAt("almost"), m8: wAt("$8 million.") });
export const revealAt = (t, f) => ({
  xray: ease(f, t.will, t.will + 10),
  flash: clamp01(1 - Math.abs(f - (t.will + 7)) / 10),
  glow: ease(f, t.will + 4, t.will + 40),
  // V39 rev 1 (Timur picked hook idea 2): from frame 0 a faint blue light breathes out of the closed-up bin (slow, 46 f), a little
  // stronger as the camera nears; it hands over to the stack's own glow as the shell turns to glass
  leak: (0.72 + 0.28 * ease(f, 0, t.will - 10)) * (0.86 + 0.14 * Math.sin((f / 46) * Math.PI * 2)) * (1 - ease(f, t.will, t.will + 22))
});
// V39 rev 1 (idea 3): closing time — the main aisle's ceiling lights switch off row by row from the doors toward the cart (then the rows
// behind it), until only the two lights over the cart are left; each switch-off is a 4-f fluorescent decay with a soft click
export const LIGHTS_OFF = [[12, [-2.4, -6.0]], [27, [-9.6]], [42, [-13.2]], [57, [-16.8]], [72, [-27.6, -31.2]], [88, [-20.4, -24.0]]];
const CART_LIT = [[1.5, -24.0], [-1.5, -20.4]];
// V39 rev 2 (Timur: "make the spotlight a lot more visible on the main visual, and the rest of the scene darker"): once the last row is off,
// ONE spotlight clicks on straight over the cart (beam, pool, shadow) and everything else dims — the two troffers over the cart hand over to
// it, the house key/fill drop to 30 % (lightGain), and a vignette darkens the frame around the cart
export const SPOT_ON = 96;
export const spotAt = (f) => ease(f, SPOT_ON, SPOT_ON + 8);
export const trofAt = (f) => (x, z) => {
  if (CART_LIT.some(([a, b]) => Math.abs(a - x) < 0.1 && Math.abs(b - z) < 0.1)) return 1 - 0.85 * spotAt(f);
  const ev = LIGHTS_OFF.find(([, zs]) => zs.some((q) => Math.abs(q - z) < 0.1));
  return ev ? 1 - ease(f, ev[0], ev[0] + 4) : 1;
};
const BINW = (y) => cartPt([BIN.x, y, BIN.z]);
const Scene = ({ f }) => <StoreSet mode="in" cart={revealAt(T(), f)} trof={trofAt(f)} spot={spotAt(f)} />;
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
// V39 rev 1 (idea 5): the open question under the counter in the hook's last second — HOW? (the film answers it); it rises in after the
// counter has landed and leaves with it, before the dissolve
const HowChip = ({ at, out }) => {
  const f = useCurrentFrame();
  const kIn = easeOut(f, at, at + 12), kOut = ease(f, out, out + 10), vis = kIn * (1 - kOut);
  if (vis <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: 540, top: 512, transform: `translate(-50%, ${(1 - kIn) * 18 - kOut * 12}px) scale(${0.9 + 0.1 * kIn})`, opacity: vis,
      display: "flex", alignItems: "stretch", background: "rgba(4, 18, 38, 0.82)", borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,8,20,0.5)" }}>
      <div style={{ width: 6, background: "#4D8ED9" }} />
      <div style={{ padding: "12px 26px 12px 22px", fontFamily: BODY, fontWeight: 800, fontSize: 58, letterSpacing: 6, lineHeight: 1, color: "#F2F7FD" }}>
        HOW<span style={{ color: "#7FB4F2" }}>?</span>
      </div>
    </div>
  );
};
const Overlay = ({ f, P }) => {
  const t = T(), end = WIN().hook.end;
  const cart = P(cartPt([-0.25, 1.06, 0]));
  const k = spotAt(f), bin = P(BINW(0.55));
  return (
    <>
      {k > 0.002 && !bin.behind && (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none",
          background: `radial-gradient(circle at ${bin.x}px ${bin.y}px, rgba(0,5,14,0) 0px, rgba(0,5,14,0) 240px, rgba(0,5,14,${(0.42 * k).toFixed(3)}) 560px, rgba(0,5,14,${(0.7 * k).toFixed(3)}) 1100px)` }} />
      )}
      <Tag text="Brattleboro, Vermont" at={t.vermont - 12} out={t.will - 8} x={70} y={300} to={null} />
      <Tag text="Died 2014" at={t.y2014 - 12} out={t.will - 4} x={70} y={392} to={cart.behind ? null : cart} />
      <Counter at={t.m8 - 26} out={end - 16} x={540} y={318} from={0} value={8} prefix="$" unit="MILLION" label="ESTATE ≈" size={112} countDur={32} />
      <HowChip at={t.m8 + 15} out={end - 16} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("whooshsoft", 22, 30, 0.22),            // the glide in (its fastest frames)
    cueAt("whooshsoft", t.will + 30, 26, 0.18),   // the rise onto the bin
    cueAt("coin", t.m8, 16, 0.3),                 // $8 MILLION lands
    ...LIGHTS_OFF.map(([fr], i) => cueAt("ee_click_click_01", fr, 12, i === LIGHTS_OFF.length - 1 ? 0.2 : 0.14)),  // each row switching off
    cueAt("ee_click_click_01", SPOT_ON, 12, 0.3),  // the spotlight clicking on over the cart
    cueAt("sub", SPOT_ON + 1, 20, 0.22)            // its soft low thump
  ];
};
const W0 = () => WIN().hook;
export const ST = { id: "hook", origin: [0, 0, 0], get from() { return 0; }, get to() { return W0().end + 8; },
  light: { target: [CART.p[0], 0, CART.p[2]], shadowBox: 7, keyI: 0.4, fillI: 0.16, key: [-5, 12, 10] }, shots, Scene, Overlay, sfx, lightGain: (f) => 1 - 0.7 * spotAt(f) };
