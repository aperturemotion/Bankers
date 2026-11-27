// @ts-nocheck
// ★ V39 station PAVILION (builder D): "In 2023, the hospital opened a new wing, partly paid for by his gift: the Ronald Read Pavilion."
//   The same Brattleboro street as `will` (d_bratt.tsx), era "pav" (2023): where the old annex stood, the hospital's new 4-storey wing —
//   red brick and a glass curtain wall over two lit operating-room floors and an office floor, a glass lobby under a blade canopy.
//   · cut in from the library's end of the street, looking back west past the hospital to the wing (tag OPENED 2023 on "2023,")
//   · one smooth glide back along the street toward the wing ("the hospital opened a new wing")
//   · a slow rising push up its glass to the parapet (tag PARTLY HIS GIFT on "gift:")
//   · "the Ronald Read Pavilion": the sign RONALD READ / PAVILION lights letter by letter, a word on each spoken word (a soft click each)
import React, { useMemo } from "react";
import { ease, Glow } from "./kit";
import { Tag } from "./overlays";
import { WIN, wAt, wEndAt } from "./windows";
import { cueAt } from "../bnx/SfxLayer";
import { BrattSet, PavilionSign, SIGN, SIGN_LINES, WING, PL } from "./d_bratt";
import { O_BRATT } from "./st_will";

const T = () => {
  const w = WIN().pavilion, s0 = w.start;
  return { s0, end: w.end, y23: wAt("2023", s0), wing: wAt("wing", s0), partly: wAt("partly", s0), gift: wAt("gift", s0),
    ronald: wAt("ronald", s0), read: wAt("read", s0), pav: wAt("pavilion", s0), pavE: wEndAt("pavilion", s0) };
};
// the letters' lighting: RONALD on "Ronald", READ on "Read", PAVILION on "Pavilion", letter by letter across each word
const WORDS3 = ["RONALD", "READ", "PAVILION"];
const letterLit = (t, i, f) => {
  const starts = [t.ronald, t.read, t.pav], ends = [t.read - 1, t.pav - 1, Math.min(t.pavE, t.end - 14)];
  let n = i;
  for (let w = 0; w < 3; w++) {
    const L = WORDS3[w].length;
    if (n < L) { const a = starts[w] - 2 + (n / L) * (ends[w] - starts[w]); return ease(f, a, a + 4); }
    n -= L;
  }
  return 0;
};
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  const lit = (i) => letterLit(t, i, f);
  const all = ease(f, t.pav, t.pavE);
  return (
    <group>
      <BrattSet era="pav" />
      <group position={[0, PL, 0]}><PavilionSign lit={lit} /></group>
      {/* the lit sign washes its band and the glass under it */}
      <Glow position={[SIGN.cx, PL + (SIGN.y[0] + SIGN.y[1]) / 2, SIGN.z + 0.4]} size={7} color="#BFD6FF" opacity={0.16 * all} />
    </group>
  );
};
const W = (p) => [p[0] + O_BRATT[0], p[1] + O_BRATT[1], p[2] + O_BRATT[2]];
const shots = () => {
  const t = T(), sy = PL + (SIGN.y[0] + SIGN.y[1]) / 2;
  return [
    { a: t.s0, b: t.s0, cut: true, pos: W([2.0, 4.4, 9.6]), target: W([-34, 8.4, -9]), fov: 40 },
    // back along the street to the wing
    { a: t.s0 + 2, b: t.wing + 22, pos: W([-21.5, 4.4, 8.0]), target: W([-35.6, 13.2, -9]), fov: 40 },
    // the slow rising push to the sign
    { a: t.wing + 14, b: t.end + 12, pos: W([-29.6, 9.4, 4.6]), target: W([SIGN.cx, sy - 0.2, WING.z]), fov: 38 }
  ];
};
const Overlay = ({ f, P }) => {
  const t = T();
  const top = P([WING.x + WING.W / 2 - 1.0, PL + WING.H - 2.4, WING.z + 0.2]);
  const corner = P([SIGN.cx + 1.2, PL + WING.H + 0.06, WING.z + 0.05]);   // the parapet's top edge, above the sign
  return (
    <>
      <Tag text="Opened 2023" at={t.y23 - 4} out={t.partly - 6} x={86} y={330} to={top.behind ? null : top} size={30} />
      <Tag text="Partly his gift" at={t.gift - 6} out={t.ronald + 6} x={540} y={300} to={corner.behind ? null : corner} size={30} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("whooshsoft", t.s0 + 34, 30, 0.32),               // the glide back along the street
    cueAt("ee_click_click_01", t.ronald, 6, 0.3),           // the sign: a soft click per word
    cueAt("ee_click_click_01", t.read, 6, 0.3),
    cueAt("ee_click_click_01", t.pav, 6, 0.3)
  ];
};
const w0 = WIN().pavilion;
export const ST = { id: "pavilion", origin: O_BRATT, from: w0.start - 8, to: w0.end + 8, light: { target: [-30, 0, -6], shadowBox: 30, keyI: 0.95, fillI: 0.28, rimI: 1.3 }, shots, Scene, Overlay, sfx };
