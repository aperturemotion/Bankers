// @ts-nocheck
// ★ V39 station HOOK (0 → 217, origin [0,0,0]): "When a retired janitor in Vermont died in 2014, his will revealed he was worth almost
//   $8 million."  Inside the closed JCPenney in Brattleboro at night (a_store.tsx). Frame 0 is already moving: low along the glossy
//   terrazzo aisle toward the janitor's cart, the glass entrance doors glowing blue-hour at the far end; the ceiling's rows switch off
//   toward the cart and ONE spotlight clicks on over it (rev 2, Timur-approved: lightGain + the vignette). On "will" the signature reveal:
//   the cart's trash bin turns to clear glass (white rim), the tall stack of share certificates inside glows in the Bankers light blue.
//   ★ V39 style pass: no 2-D labels/counters; the figures are printed on the estate's paper band round the stack (see shots()).
import React from "react";
import { WIN, wAt } from "./windows";
import { cueAt } from "../bnx/SfxLayer";
import { ease, clamp01 } from "./kit";
import { StoreSet, cartPt, CART } from "./a_store";
import { BIN, BAND, stackPt } from "./a_cart";

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
const Scene = ({ f }) => { const t = T(); return <StoreSet mode="in" cart={{ ...revealAt(t, f), fig: ease(f, t.m8 - 3, t.m8 + 9) }} trof={trofAt(f)} spot={spotAt(f)} />; };
// ★ V39 style pass (Timur's rules 1, 6, 11): ONE slow glide, always on the cart — from frame 0 low along the aisle (the ceiling's rows
//   switching off over it), rising a little and easing in on the glass bin until the cut to the farm; it ends square-on to the estate's
//   paper BAND round the certificate stack. The figures that were 2-D labels now live on that band (a_tex bandTex): ESTATE OF RONALD READ ·
//   ALMOST $8 MILLION · BRATTLEBORO, VERMONT · 2014 — its figure lights on "$8 million.".
export const strapW = (p) => cartPt(stackPt(p));            // a point in the stack's frame → world (station origin 0)
export const strapDir = () => { const o = strapW([0, 0, 0]), z = strapW([0, 0, 1]); const d = [z[0] - o[0], z[2] - o[2]], n = Math.hypot(d[0], d[1]); return [d[0] / n, d[1] / n]; };
export const bandBack = (c, h, v) => { const d = strapDir(); return [c[0] + d[0] * h, c[1] + v, c[2] + d[1] * h]; };
export const HOOK_END = { h: 2.22, v: 0.6, fov: 32 };
const shots = () => {
  const c = strapW([0, BAND.y, BAND.hz]);
  return [
    { a: -150, b: -150, pos: bandBack(c, 5.0, 0.3), target: [c[0], c[1] + 0.12, c[2]], fov: 36 },
    // one long eased glide (it is already moving at frame 0 and lands just before the cut)
    { a: -150, b: 214, pos: bandBack(c, HOOK_END.h, HOOK_END.v), target: c, fov: HOOK_END.fov }
  ];
};
// the spotlight's vignette (rev 2, Timur-approved): the frame darkens around the bin as the spot comes on. No 2-D text any more (rule 6/11):
// the "Brattleboro, Vermont" / "Died 2014" tags, the ESTATE ≈ $8 MILLION counter and the HOW? chip are gone — the strap carries the figures.
const Overlay = ({ f, P }) => {
  const k = spotAt(f), bin = P(BINW(0.55));
  return k > 0.002 && !bin.behind ? (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none",
      background: `radial-gradient(circle at ${bin.x}px ${bin.y}px, rgba(0,5,14,0) 0px, rgba(0,5,14,0) 240px, rgba(0,5,14,${(0.42 * k).toFixed(3)}) 560px, rgba(0,5,14,${(0.7 * k).toFixed(3)}) 1100px)` }} />
  ) : null;
};
const sfx = () => [
  // rule 16–18: only visible actions, subtle — each row of troffers switching off, the spotlight clicking on (the camera whooshes and the
  // $8 MILLION coin are gone: Main makes the measured camera whooshes; nothing in frame is a coin)
  ...LIGHTS_OFF.map(([fr], i) => cueAt("ee_click_click_01", fr, 12, i === LIGHTS_OFF.length - 1 ? 0.2 : 0.14)),
  cueAt("ee_click_click_01", SPOT_ON, 12, 0.3),
  cueAt("sub", SPOT_ON + 1, 20, 0.22)
];
const W0 = () => WIN().hook;
export const ST = { id: "hook", origin: [0, 0, 0], get from() { return 0; }, get to() { return W0().end + 8; },
  light: { target: [CART.p[0], 0, CART.p[2]], shadowBox: 7, keyI: 0.4, fillI: 0.16, key: [-5, 12, 10] }, shots, Scene, Overlay, sfx, lightGain: (f) => 1 - 0.7 * spotAt(f) };
