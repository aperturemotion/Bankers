// @ts-nocheck
// ★ V39 station SHARES (builder C): "What nobody knew: for decades, he'd quietly bought shares in companies he understood, and held on
//   to them." (916–1108). His kitchen table at night under a small lamp (c_shares.tsx). Share certificates of the blue chips he held
//   (WSJ 2015; his 1959 Pacific Gas and Electric purchase first) settle one by one onto a growing stack beside the folded business page.
//   A year counter rolls 1959 → 2014 as they stack (the factual endpoints of his buying and holding), landing on "held";
//   Tag "Held for decades" on "held". The camera glides in and round to the left, one direction, slowly, toward the stack.
import React from "react";
import { useCurrentFrame } from "remotion";
import { Tag } from "./overlays";
import { WIN, wAt } from "./windows";
import { cueAt } from "../bnx/SfxLayer";
import { ease, easeOut } from "./kit";
import { BODY, FIGURE } from "./fonts3d";
import { SharesSet, STACK, stackTop, landAt, N_CERT, KT } from "./c_shares";

export const SHARES_ORIGIN = [1500, 0, 0];
const O = SHARES_ORIGIN;
const Wp = (p) => [p[0] + O[0], p[1] + O[1], p[2] + O[2]];
export const T = () => {
  const w = WIN().shares;
  const knew = wAt("knew:", w.start), held = wAt("held", w.start);
  return { start: w.start, end: w.end, knew, decades: wAt("decades,", w.start), shares: wAt("shares", w.start), held, t0: knew + 8, span: held - 10 - (knew + 8) };
};
const Scene = ({ f }) => { const t = T(); return <SharesSet f={f} t0={t.t0} span={t.span} />; };
const shots = () => {
  const t = T();
  return [
    { a: t.start, b: t.start, cut: true, pos: Wp([0.6, 1.5, 1.3]), target: Wp([0.06, 0.78, 0.0]), fov: 42 },
    { a: t.start + 1, b: t.start + 104, pos: Wp([0.48, 1.4, 1.06]), target: Wp([0.12, 0.77, 0.08]), fov: 42 },
    { a: t.start + 96, b: t.end + 30, pos: Wp([0.36, 1.3, 0.82]), target: Wp([0.17, 0.76, 0.1]), fov: 42 },
  ];
};
// the year counter: a caps label over a big Anton year that ROLLS (no thousands separator: it is a year)
const YearCounter = ({ at, out, x, y, from, to, rollFrom, rollTo, label }) => {
  const f = useCurrentFrame();
  const kIn = easeOut(f, at, at + 14), kOut = ease(f, out, out + 10), vis = kIn * (1 - kOut);
  if (vis <= 0.001) return null;
  const k = ease(f, rollFrom, rollTo);
  const v = Math.round(from + (to - from) * k);
  const size = 104;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, ${(1 - kIn) * 22 - kOut * 14}px) scale(${0.94 + 0.06 * kIn})`, opacity: vis,
      background: "rgba(4, 18, 38, 0.82)", borderRadius: 14, padding: `${size * 0.12}px ${size * 0.26}px`, boxShadow: "0 10px 40px rgba(0,8,20,0.5)", textAlign: "center" }}>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: size * 0.2, letterSpacing: size * 0.024, color: "#B3CEEF", textTransform: "uppercase", marginBottom: size * 0.04 }}>{label}</div>
      <div style={{ fontFamily: FIGURE, fontSize: size, lineHeight: 1, color: "#FFFFFF", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{v}</div>
    </div>
  );
};
const Overlay = ({ f, P }) => {
  const t = T();
  const top = P([STACK.x - 0.09, stackTop(f, t.t0, t.span) + 0.002, STACK.z + 0.06]);
  return (
    <>
      <YearCounter at={t.knew - 6} out={t.end - 16} x={540} y={300} from={1959} to={2014} rollFrom={landAt(t.t0, t.span, 0)} rollTo={t.held} label="Year" />
      <Tag text="Held for decades" at={t.held} out={t.end - 14} x={70} y={Math.max(520, Math.min(660, top.y - 300))} to={top.behind ? null : top} size={30} />
    </>
  );
};
const sfx = () => {
  const t = T();
  const out = [cueAt("whooshsoft", t.start + 30, 40, 0.2)];
  out.push(cueAt("pingshort", t.held, 12, 0.3));
  return out;
};
export const ST = { id: "shares", origin: O, from: WIN().shares.start - 8, to: WIN().shares.end + 8, light: { target: [0, KT, 0], shadowBox: 1.6, keyI: 0.5, fillI: 0.2, rimI: 0.55 }, shots, Scene, Overlay, sfx };
