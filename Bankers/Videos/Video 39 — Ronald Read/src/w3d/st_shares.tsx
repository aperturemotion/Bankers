// @ts-nocheck
// ★ V39 station SHARES (builder C): "What nobody knew: for decades, he'd quietly bought shares in companies he understood, and held on
//   to them." (916–1108). His kitchen table at night under a small lamp (c_shares.tsx). Share certificates of the blue chips he held
//   (WSJ 2015; his 1959 Pacific Gas and Electric purchase first) are lifted out of his steel document box one by one and settle onto a
//   growing stack beside the folded business page.
//   ★ rev 2026-11-28 (Timur's cinematic rules, V38 → V39):
//   · ARRIVAL (cut: true at start): a match on paper — the diner's push ends on the guest check; we land on the PG&E certificate lying
//     face up in the open document box at the same place and size in frame (the bill someone else paid → the shares he bought).
//   · the box is already open at the cut (its lid swung back during the diner's last second, off screen), PG&E on top; the first sheet
//     lifts on "knew:" and lands on "decades,".
//   · ONE slow push (1.3×, no turn) that frames the box and the stack together all scene long; it ends on the stack and the box.
//   · no 2-D year counter, no tag: the stack growing sheet by sheet carries "for decades … held on to them".
//   · EXIT: `vault` cuts to the estate's typed inventory of his stocks on the vault's viewing table, at the same place in frame
//     (paper → paper again: the certificates → the list of them).
import React from "react";
import { WIN, wAt } from "./windows";
import { cueAt } from "../bnx/SfxLayer";
import { SharesSet, landAt, N_CERT, KT } from "./c_shares";

export const SHARES_ORIGIN = [1500, 0, 0];
const O = SHARES_ORIGIN;
const Wp = (p) => [p[0] + O[0], p[1] + O[1], p[2] + O[2]];
export const T = () => {
  const w = WIN().shares;
  const knew = wAt("knew:", w.start), held = wAt("held", w.start);
  // t0 = the first sheet's landing; the lid opens over [t0 − 30, t0 − 16] and the first sheet lifts at t0 − 18 (c_shares)
  const t0 = knew + 20;
  return { start: w.start, end: w.end, knew, decades: wAt("decades,", w.start), held, t0, span: held - 10 - t0 };
};
const Scene = ({ f }) => { const t = T(); return <SharesSet f={f} t0={t.t0} span={t.span} lidAt={t.start - 24} />; };
const TGT = [0.15, KT + 0.04, -0.13];   // between the box (the PG&E sheet in it, upper frame) and the stack (lower frame)
const shots = () => {
  const t = T();
  const dir = [0.1, 0.78, 0.62], n = Math.hypot(...dir), at = (D, dx = 0) => [TGT[0] + dir[0] / n * D + dx, TGT[1] + dir[1] / n * D, TGT[2] + dir[2] / n * D];
  return [
    { a: t.start, b: t.start, cut: true, pos: Wp(at(1.1)), target: Wp(TGT), fov: 42 },
    { a: t.start + 1, b: t.end + 8, pos: Wp(at(0.86, 0.035)), target: Wp([TGT[0] + 0.01, TGT[1], TGT[2] + 0.03]), fov: 42 },
  ];
};
const sfx = () => {
  const t = T(), L = (i) => Math.round(landAt(t.t0, t.span, i)), FLY = 18;
  const out = [];
  // a soft paper sound for each of the first four sheets (lift → settle), then one run for the quickening rest
  for (let i = 0; i < 4; i++) out.push(cueAt("ov_paper_flutter", L(i) - FLY, FLY, 0.14));
  for (let a = L(4) - FLY; a < L(N_CERT - 1); a += 24) out.push(cueAt("ov_paper_flutter", a, Math.min(24, L(N_CERT - 1) - a), 0.1));
  return out.map((c) => ({ ...c, fade: 4 }));
};
export const ST = { id: "shares", origin: O, from: WIN().shares.start - 8, to: WIN().shares.end + 8, light: { target: [0, KT, 0], shadowBox: 1.2, keyI: 0.5, fillI: 0.2, rimI: 0.55 }, shots, Scene, sfx };
