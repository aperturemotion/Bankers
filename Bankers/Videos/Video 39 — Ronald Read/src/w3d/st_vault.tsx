// @ts-nocheck
// ★ V39 station VAULT (builder C): "When he died, he owned at least 95 stocks. The certificates in his safe deposit box stood about
//   5 inches high." (1108–1334; WSJ 19 Mar 2015). A bank vault (c_vault.tsx): the wall of brass safe-deposit doors; one door swings
//   open and its box slides out along the viewing table; on "certificates" the steel shell turns to clear glass (white rim light,
//   the style's signature reveal) and shows the stack of certificates; a steel rule slides in beside it, its 0 at the box floor;
//   on "5 inches" a pale-blue line joins the stack's top to the rule's 5. Counter AT LEAST 95 STOCKS lands on "95 stocks.";
//   Tag "5 inches" on "5 inches". Camera: wall → box → the stack and rule, one smooth sweep (always closing in).
import React from "react";
import { Tag, Counter } from "./overlays";
import { WIN, wAt, wEndAt } from "./windows";
import { cueAt } from "../bnx/SfxLayer";
import { ease, easeOut } from "./kit";
import { VaultSet, TT, BOX, boxCentre, STACK_Z, STACK_H, FLOOR_T, rulerPos, RULER, INCH } from "./c_vault";

export const VAULT_ORIGIN = [1800, 0, 0];
const O = VAULT_ORIGIN;
const Wp = (p) => [p[0] + O[0], p[1] + O[1], p[2] + O[2]];
export const T = () => {
  const w = WIN().vault;
  const died = wAt("died,", w.start), stocks = wAt("95 stocks.", w.start), certs = wAt("certificates", w.start), box = wAt("box", w.start), inches = wAt("5 inches", w.start);
  return { start: w.start, end: w.end, died, stocks, certs, safe: wAt("safe", w.start), box, stood: wAt("stood", w.start), inches,
    open: [died + 14, died + 36], slide: [died + 40, died + 82], glass: [certs - 2, certs + 8], ruler: [box - 4, box + 26], level: [inches - 8, inches + 10] };
};
const state = (f) => {
  const t = T();
  return {
    open: ease(f, t.open[0], t.open[1]),
    slide: ease(f, t.slide[0], t.slide[1]),
    glass: ease(f, t.glass[0], t.glass[1]),
    flash: Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (f - t.glass[0]) / 16)))) * (f >= t.glass[0] ? 1 : 0),
    ruler: easeOut(f, t.ruler[0], t.ruler[1]),
    level: ease(f, t.level[0], t.level[1]),
  };
};
const Scene = ({ f }) => <VaultSet {...state(f)} />;
const shots = () => {
  const t = T();
  const b = boxCentre(1), sc = [b[0], TT + 0.01, b[2] + STACK_Z];
  return [
    // the wall of boxes from the front right, the table below it
    { a: t.start, b: t.start, cut: true, pos: Wp([1.8, 1.65, 3.3]), target: Wp([-0.15, 1.2, -1.0]), fov: 42 },
    // drift in toward the door as it opens and the box slides out
    { a: t.start + 1, b: t.slide[1] + 10, pos: Wp([1.2, 1.5, 1.3]), target: Wp([0.05, 1.05, -0.85]), fov: 42 },
    // on to the box on the table (the glass reveal)
    { a: t.slide[1] + 2, b: t.box + 10, pos: Wp([0.85, 1.35, 0.45]), target: Wp([b[0] + 0.01, TT + 0.04, b[2] + 0.02]), fov: 40 },
    // the stack and the rule, closing slowly through the end of the window
    { a: t.box + 2, b: t.end + 34, pos: Wp([0.64, 1.16, 0.08]), target: Wp([sc[0] + 0.05, sc[1] - 0.005, sc[2] + 0.02]), fov: 40 },
  ];
};
const Overlay = ({ f, P }) => {
  const t = T();
  const b = boxCentre(1), r = rulerPos(1);
  const five = P([r[0], TT + FLOOR_T + STACK_H, r[2]]);
  return (
    <>
      <Counter at={t.stocks - 28} out={t.certs + 6} x={540} y={300} value={95} label="At least" unit="stocks" size={108} countDur={26} />
      <Tag text="5 inches" at={t.inches} out={t.end - 14} x={70} y={Math.max(300, Math.min(640, five.y - 300))} to={five.behind ? null : five} size={30} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("ee_click_click_01", t.open[0] - 2, 6, 0.3),        // the locks turn
    cueAt("whooshsoft", t.slide[0] + 18, 30, 0.25),           // the box slides out / the camera's travel
    cueAt("pingshort", t.stocks, 12, 0.3),                    // the counter lands
    cueAt("airwoosh", t.glass[0], 14, 0.3),                   // the shell turns to glass
    cueAt("ee_click_click_01", t.level[1], 6, 0.25),          // the level line meets the 5
  ];
};
export const ST = { id: "vault", origin: O, from: WIN().vault.start - 8, to: WIN().vault.end + 8, light: { target: [0.1, TT, -0.6], shadowBox: 2.4, keyI: 1.0, fillI: 0.3, rimI: 0.8 }, shots, Scene, Overlay, sfx };
