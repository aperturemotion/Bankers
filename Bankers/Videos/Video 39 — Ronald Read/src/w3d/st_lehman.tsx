// @ts-nocheck
// ★ V39 station LEHMAN (builder D): "Not every pick worked. He held Lehman Brothers when it collapsed in 2008. It was one stock out of dozens."
//   A big physical LED stock board in a dark hall (d_board.tsx): a steel housing with 95 LED tile modules — the seven holdings the WSJ
//   named by their full names in their brand colours (Chase's and GE's free marks), tickers small; the rest idle, unnamed slots.
//   REV STYLE (Timur 2026-11-27 rules 1–18):
//   · ARRIVAL (match cut): the vault pushes down onto the stack's top certificate, THE PROCTER & GAMBLE COMPANY; the board opens on
//     Procter & Gamble's tile filling the frame (P&G now sits two slots left of LEH), and one long glide pulls back along the row to LEH.
//   · "Lehman": LEH flares white; "collapsed": it turns RED (the only red), its status row prints BANKRUPT 2008, lit on "2008" — the
//     figure lives on the tile (FACTCHECK line 7); as "It was one stock…" begins its lamps die, the glass cracks, it tips back.
//   · "one stock out of dozens": one long pull-back until the whole board is in frame — 94 lit tiles and one dark — no 2-D counter.
//   · idle slots read HOLDING (real type, no placeholder dashes); no invented names or prices.
import React, { useMemo } from "react";
import * as THREE from "three";
import { ease, clamp01, rnd, Glow } from "./kit";
import { WIN, wAt } from "./windows";
import { cueAt } from "../bnx/SfxLayer";
import { Board, LehTile, BoardFloor, LEH_POS, GRID_CY, GRID_W, BD, HOLDINGS, tilePos } from "./d_board";
import { LightPool, LightWash } from "./d_fx";

export const O_LEHMAN = [2100, 0, 0];
const T = () => {
  const w = WIN().lehman, s0 = w.start;
  return { s0, end: w.end, L: wAt("lehman", s0), C: wAt("collapsed", s0), y08: wAt("2008", s0), it: wAt("it", wAt("2008", s0)), one: wAt("one", s0), dozens: wAt("dozens", s0) };
};
// rev style (V39, Timur's cinematic rules): red on "collapsed", its status row lights BANKRUPT 2008 on "2008" (the figure lives ON the tile,
// FACTCHECK line 7), it stays red through "2008.", then its lamps die, the glass cracks and it tips back into its socket as "It was one
// stock…" begins — so the pull-back shows one dark tile among the lit ones
export const lehState = (t, f) => {
  const red = ease(f, t.C - 1, t.C + 4);
  const flick = f > t.C + 2 && f < t.C + 12 ? 0.55 + 0.45 * rnd(Math.floor(f / 2) * 3.7 + 1) : 1;
  const d0 = t.it - 8;                                                       // the lamps die from here
  const fall = ease(f, d0 + 8, d0 + 18);
  const settle = -0.07 * Math.sin(Math.PI * clamp01((f - d0 - 18) / 6));   // it knocks the socket's back and settles
  return { flare: ease(f, t.L - 3, t.L + 5), red, flick, year: ease(f, t.y08 - 3, t.y08 + 3), dark: ease(f, d0, d0 + 10), crack: ease(f, d0 + 2, d0 + 6), tip: clamp01(fall + (f > d0 + 18 ? settle : 0)) };
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
// rev style camera (rule 1: slow, on a subject; rule 2: the arrival is a MATCH CUT): the vault's last shot pushes down onto the top
// certificate of the stack, THE PROCTER & GAMBLE COMPANY; the board opens on the same company's tile, Procter & Gamble, filling the
// frame. One long eased glide pulls back off it and along the row to LEH (two tiles right) by "Lehman"; a slow creep in through the
// collapse; on "It was one stock out of dozens" one long pull-back until the whole board is in frame (94 lit, one dark), still easing
// back at the cut to the will.
const PG_POS = tilePos(...HOLDINGS.find((h) => h.t === "PG").rc);
const shots = () => {
  const t = T(), [lx, ly] = LEH_POS, [px, py] = PG_POS;
  return [
    { a: t.s0, b: t.s0, cut: true, pos: W([px, py + 0.01, 1.5]), target: W([px, py, 0]), fov: 38 },
    { a: t.s0 + 2, b: t.L + 6, pos: W([lx - 0.42, ly + 0.08, 3.1]), target: W([lx - 0.2, ly, 0]), fov: 37 },
    // the collapse: a slow creep in while it reddens, prints BANKRUPT 2008, dies and tips back
    { a: t.L - 2, b: t.it - 4, pos: W([lx - 0.36, ly + 0.06, 2.55]), target: W([lx - 0.06, ly - 0.02, 0]), fov: 36 },
    // "one stock out of dozens": one long pull-back to the whole board (it starts as the tile dies)
    { a: t.it - 14, b: t.end + 4, pos: W([-1.0, 4.5, 16.5]), target: W([0, 4.0, 0]), fov: 42 },
    { a: t.end - 4, b: t.end + 40, pos: W([-1.2, 4.55, 17.6]), target: W([0, 4.02, 0]), fov: 42 }
  ];
};
// rev style: no 2-D labels (overlays render nothing); the figures live on the board (BANKRUPT 2008 on the tile; 95 tiles, one dark)
const Overlay = () => null;
// rev style sound (rules 14/16/18): only the tile's own actions, quiet (≈ −20 dB under bed + voice), each spanning its action
const sfx = () => {
  const t = T(), d0 = t.it - 8;
  return [
    cueAt("ee_click_click_01", t.L - 3, 6, 0.24),          // LEH's lamps flare (L−3 … L+5)
    cueAt("ee_click_click_01", d0, 6, 0.18),               // its lamps die (d0 … d0+10)
    cueAt("thud", d0 + 17, 10, 0.24)                       // it knocks back into its socket (d0+18)
  ];
};
const w0 = WIN().lehman;
export const ST = { id: "lehman", origin: O_LEHMAN, from: w0.start - 8, to: w0.end + 8, light: { target: [0, 3, 0], shadowBox: 10, keyI: 1.1, fillI: 0.3, rimI: 1.2 }, shots, Scene, Overlay, sfx };
