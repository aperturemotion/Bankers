// @ts-nocheck
// ★ V36 "Bre-X Gold" — builder F. The pension place's ONE figure, from FACTCHECK.md §7 (one dataset):
//   Maclean's, May 19, 1997, "A sampling of funds and their losses" — Ontario Teachers' Pension Plan Board, C$100M.
//   The screen never types it: the label is episode.json's `pensionLoss` (L), checked here against the figure.
import { L } from "./data";

export const PENSION_LOSS_M = 100;
const must = (ok, what) => {
  if (!ok) throw new Error("pension_data: " + what);
};
must(L("pensionLoss") === `C$${PENSION_LOSS_M}M LOST`, `episode.json pensionLoss must read "C$${PENSION_LOSS_M}M LOST" (FACTCHECK §7), it reads "${L("pensionLoss")}"`);
must(L("pensionDrawer") === "ONTARIO TEACHERS'", "episode.json pensionDrawer must name the plan (the plan's loss, not the teachers')");
