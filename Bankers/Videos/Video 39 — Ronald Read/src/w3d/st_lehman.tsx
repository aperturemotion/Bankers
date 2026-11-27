// @ts-nocheck
// ★ V39 station LEHMAN (builder D): "Not every pick worked. He held Lehman Brothers when it collapsed in 2008. It was one stock out of dozens."
//   A big physical LED stock board in a dark hall (d_board.tsx): a steel housing with 95 LED tile modules — the seven holdings the WSJ
//   named by their full names in their brand colours (Chase's and GE's free marks), tickers small; the rest idle, unnamed slots.
//   · cut in on the board's upper left, gliding right along the lit tiles ("Not every pick worked.")
//   · "Lehman": the LEH tile flares white and its LEHMAN / BROTHERS lines light; the camera has pushed onto it
//   · "collapsed": it turns RED (the only red in the scene), flickers, cracks and goes dark, tipping back into its socket (it stays on
//     the board); tag LEHMAN BROTHERS, 2008 on "2008"
//   · "one stock out of dozens": the camera pulls straight back until the whole board is in frame — 94 blue tiles and one dark —
//     counter 1 OF 95; it keeps drifting back through the dissolve.
import React, { useMemo } from "react";
import * as THREE from "three";
import { ease, clamp01, rnd, Glow } from "./kit";
import { Tag, Counter } from "./overlays";
import { WIN, wAt } from "./windows";
import { cueAt } from "../bnx/SfxLayer";
import { Board, LehTile, BoardFloor, LEH_POS, GRID_CY, GRID_W, BD } from "./d_board";
import { LightPool, LightWash } from "./d_fx";

export const O_LEHMAN = [2100, 0, 0];
const T = () => {
  const w = WIN().lehman, s0 = w.start;
  return { s0, end: w.end, L: wAt("lehman", s0), C: wAt("collapsed", s0), y08: wAt("2008", s0), it: wAt("it", wAt("2008", s0)), one: wAt("one", s0), dozens: wAt("dozens", s0) };
};
export const lehState = (t, f) => {
  const red = ease(f, t.C - 1, t.C + 3);
  const flick = f > t.C + 3 && f < t.C + 16 ? 0.35 + 0.65 * rnd(Math.floor(f) * 3.7 + 1) : 1;
  const fall = ease(f, t.C + 10, t.C + 19);
  const settle = -0.07 * Math.sin(Math.PI * clamp01((f - t.C - 19) / 6));   // it knocks the socket's back and settles
  return { flare: ease(f, t.L - 3, t.L + 5), red, flick, dark: ease(f, t.C + 12, t.C + 24), crack: ease(f, t.C + 1, t.C + 5), tip: clamp01(fall + (f > t.C + 19 ? settle : 0)) };
};
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  const s = lehState(t, f);
  const [lx, ly] = LEH_POS;
  return (
    <group>
      <BoardFloor />
      {/* the hall's far wall (panels, pilasters, up-lights: d_board's room) washed faintly by the board */}
      <LightWash position={[0, 4.5, -13.8]} w={22} h={10} color="#4D8ED9" opacity={0.12} />
      <Board f={f} />
      <LehTile s={s} />
      {/* the board's light: a soft bloom over the lamp field, its pool on the polished floor */}
      <Glow position={[0, GRID_CY, 0.4]} size={11} color="#4D8ED9" opacity={0.1} />
      <LightPool position={[0, 0.01, 2.6]} r={5.5} sx={1.25} sz={0.8} color="#4D8ED9" opacity={0.3} />
      <LightPool position={[0, 0.01, 1.0]} r={3.2} sx={1.4} color="#7FB4F2" opacity={0.16} />
      {/* LEH's own light: a white flare, then the red failure, both gone with the lamps */}
      <Glow position={[lx, ly, 0.18]} size={1.1} color="#DDEBFF" opacity={0.4 * s.flare * (1 - s.red)} />
      <Glow position={[lx, ly, 0.2]} size={1.5} color="#FF4030" opacity={0.55 * s.red * (1 - s.dark) * s.flick} />
    </group>
  );
};
const W = (p) => [p[0] + O_LEHMAN[0], p[1] + O_LEHMAN[1], p[2] + O_LEHMAN[2]];
const shots = () => {
  const t = T(), [lx, ly] = LEH_POS;
  return [
    { a: t.s0, b: t.s0, cut: true, pos: W([-3.4, 5.5, 3.8]), target: W([-1.2, 5.0, 0]), fov: 38 },
    // gliding right along the lit tiles, closing on LEH by "Lehman"
    { a: t.s0 + 2, b: t.L + 2, pos: W([-0.3, 5.05, 3.6]), target: W([lx - 0.25, ly + 0.02, 0]), fov: 37 },
    { a: t.L - 6, b: t.C + 4, pos: W([lx - 0.3, ly + 0.12, 3.0]), target: W([lx, ly - 0.02, 0]), fov: 36 },
    // the collapse: a slow creep in while it reddens, cracks and tips back
    { a: t.C - 2, b: t.it - 2, pos: W([lx - 0.42, ly + 0.08, 2.6]), target: W([lx - 0.04, ly - 0.04, 0]), fov: 36 },
    // "one stock out of dozens": straight back until the whole board is seen
    { a: t.it - 6, b: t.dozens + 2, pos: W([-1.1, 4.5, 20.5]), target: W([0, 4.0, 0]), fov: 38 },
    { a: t.dozens - 4, b: t.end + 12, pos: W([-1.7, 4.6, 22.2]), target: W([0, 4.05, 0]), fov: 38 }
  ];
};
const Overlay = ({ f, P }) => {
  const t = T();
  const [lx, ly] = LEH_POS;
  const p = P([lx, ly + BD.th / 2, 0.05]);
  return (
    <>
      <Tag text="Lehman Brothers, 2008" at={t.y08 - 6} out={t.it + 8} x={86} y={340} to={p.behind ? null : p} size={30} />
      <Counter at={t.one - 4} out={t.end - 16} x={540} y={300} from={0} value={1} unit="OF 95" label="One stock" size={112} countDur={10} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("ee_click_click_01", t.L - 2, 6, 0.32),          // LEH lights
    cueAt("ee_click_click_01", t.C + 12, 6, 0.22),         // its lamps die
    cueAt("thud", t.C + 19, 12, 0.32),                     // it knocks back into its socket
    cueAt("whooshsoft", t.it + 12, 26, 0.35)               // the pull-back (fastest ≈ its middle)
  ];
};
const w0 = WIN().lehman;
export const ST = { id: "lehman", origin: O_LEHMAN, from: w0.start - 8, to: w0.end + 8, light: { target: [0, 3, 0], shadowBox: 10, keyI: 1.1, fillI: 0.3, rimI: 1.2 }, shots, Scene, Overlay, sfx };
