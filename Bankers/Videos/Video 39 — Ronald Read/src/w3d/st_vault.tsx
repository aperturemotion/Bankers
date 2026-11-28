// @ts-nocheck
// ★ V39 station VAULT (builder C): "When he died, he owned at least 95 stocks. The certificates in his safe deposit box stood about
//   5 inches high." (1108–1334; WSJ 19 Mar 2015). A bank vault (c_vault.tsx): the wall of brass safe-deposit doors and the viewing table.
//   ★ rev 2026-11-28 (Timur's cinematic rules, V38 → V39):
//   · ARRIVAL (cut: true at start): a match on paper — `shares` ends on his stack of certificates; we land on the estate's typed
//     inventory (SCHEDULE B — STOCKS AND BONDS) lying on the vault's viewing table at the same place in frame, the wall of brass doors
//     above it.
//   · "When he died,": the box's door swings open. "95 stocks.": the appraiser's pencil writes 95 in the inventory's count blank and
//     rings it (the figure on the object; the 2-D counter is gone). Then the box slides out of its slot along the table to just behind
//     the sheet; on "certificates" its steel shell turns to clear glass (the rim flashes, then holds faint) and shows the stack; on "box"
//     the steel rule slides in beside it; on "5 inches" the rule's own blue 5-inch line and its 5 IN plate light (no line drawn across).
//   · ONE slow glide in and right (0.95 → 0.68 m) from the inventory's count line to the box, the stack and the rule.
import React from "react";
import { WIN, wAt } from "./windows";
import { cueAt } from "../bnx/SfxLayer";
import { ease, easeOut } from "./kit";
import { VaultSet, TT, boxCentre, STACK_Z, STACK_H, FLOOR_T, rulerPos, INV } from "./c_vault";

export const VAULT_ORIGIN = [1800, 0, 0];
const O = VAULT_ORIGIN;
const Wp = (p) => [p[0] + O[0], p[1] + O[1], p[2] + O[2]];
export const T = () => {
  const w = WIN().vault;
  const died = wAt("died,", w.start), stocks = wAt("95 stocks.", w.start), certs = wAt("certificates", w.start), box = wAt("box", w.start), inches = wAt("5 inches", w.start);
  return { start: w.start, end: w.end, died, stocks, certs, box, inches,
    open: [died + 10, died + 34],               // the door swings open on "died,"
    write: [stocks, stocks + 24],               // the pencil writes 95 and rings it
    slide: [stocks + 20, certs - 6],            // the box slides out to the table (lands just before "certificates")
    glass: [certs, certs + 10], ruler: [box - 4, box + 26], level: [inches - 6, inches + 10] };
};
const state = (f) => {
  const t = T();
  return {
    open: ease(f, t.open[0], t.open[1]),
    write: ease(f, t.write[0], t.write[1]),
    slide: ease(f, t.slide[0], t.slide[1]),
    glass: ease(f, t.glass[0], t.glass[1]),
    flash: Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (f - t.glass[0]) / 16)))) * (f >= t.glass[0] ? 1 : 0),
    ruler: easeOut(f, t.ruler[0], t.ruler[1]),
    level: ease(f, t.level[0], t.level[1]),
  };
};
const Scene = ({ f }) => <VaultSet {...state(f)} />;
// a camera pose round a target: azimuth from +z toward +x, elevation above the horizontal, distance (degrees, metres)
const orb = (tg, az, el, D) => { const A = az * Math.PI / 180, E = el * Math.PI / 180; return [tg[0] + D * Math.cos(E) * Math.sin(A), tg[1] + D * Math.sin(E), tg[2] + D * Math.cos(E) * Math.cos(A)]; };
// the centre of the top certificate's name line (Stack: on the stack's top at the box's centre, the sheet turned a quarter so its name runs along −z)
const TOPNAME = (() => { const b = boxCentre(1); return [b[0] + 0.001, TT + FLOOR_T + STACK_H + 0.0006, b[2]]; })();   // (Stack is centred in the box)
const shots = () => {
  const t = T();
  return [
    // the inventory on the table (lower frame), the brass doors above it — the match on the certificates' stack
    { a: t.start, b: t.start, cut: true, pos: Wp(orb([0.43, 0.93, -0.53], 34, 32, 0.92)), target: Wp([0.43, 0.93, -0.53]), fov: 40 },
    // ★ integrator follow-up (2026-11-28): the vault ends on the stack's top certificate, THE PROCTER & GAMBLE COMPANY, its name
    //   horizontal and upright, filling the frame width at 1333 — the match onto D's P&G tile at the lehman cut (1334). The sheet's name
    //   reads along −z with its top toward −x, so the camera arcs round to the box's +x side in ONE continuous sweep from the cut (no
    //   reversal; the distance only shrinks), the shots overlapping 8 f; the inventory lies at the box's right front, so it stays in
    //   frame (95 written on its word) as the arc begins:
    // 1. round from the inventory to the box as it slides out and turns to glass
    { a: t.start + 1, b: t.certs + 2, pos: Wp(orb([0.3, 1.0, -0.64], 60, 42, 0.8)), target: Wp([0.3, 1.0, -0.64]), fov: 40 },
    // 2. on round to the box's +x side, over the stack's top and the rule beside it (face to +x): the lit 5 IN readable to ~1317
    { a: t.certs - 6, b: t.inches + 8, pos: Wp(orb([0.16, 1.05, -0.69], 87, 55, 0.7)), target: Wp([0.16, 1.05, -0.69]), fov: 40 },
    // 3. up and over onto the top certificate, looking down steeply from its +x side: the name across the frame at 1333 (az 100: with the
    //    idle drift the name lands level on screen, measured −0.4° at 1333; 1031 px of 1080 wide)
    { a: t.inches, b: t.end + 6, pos: Wp(orb(TOPNAME, 100, 60, 0.61)), target: Wp(TOPNAME), fov: 40 },
  ];
};
const sfx = () => {
  const t = T();
  return ([
    cueAt("ee_click_click_01", t.open[0] - 2, 6, 0.25),                          // the guard and renter keys turn
    cueAt("ov_chalk", t.write[0], t.write[1] - t.write[0], 0.16),                  // the pencil writes 95 and rings it
    cueAt("ov_drawer", t.slide[0], t.slide[1] - t.slide[0], 0.3),                // the steel box slides out along the table
    cueAt("ee_click_click_01", t.ruler[1] - 6, 5, 0.16),                          // the rule's foot settles on the table
  ]).map((c) => ({ ...c, fade: 4 }));
};
export const ST = { id: "vault", origin: O, from: WIN().vault.start - 8, to: WIN().vault.end + 8, light: { target: [0.1, TT, -0.5], shadowBox: 1.4, keyI: 1.0, fillI: 0.3, rimI: 0.8 }, shots, Scene, sfx };
