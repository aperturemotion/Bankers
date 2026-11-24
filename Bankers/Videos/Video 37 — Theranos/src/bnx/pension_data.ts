// @ts-nocheck
// ★ V36 "Bre-X Gold" — builder F (REV1: the pension place is a bar chart). ONE dataset (FACTCHECK.md §3):
//   Maclean's, May 19, 1997, "A sampling of funds and their losses" (C$ millions). The chart shows the four largest of the six on one
//   zero-based scale: Ontario Teachers' Pension Plan Board 100 · Caisse de dépôt et placement du Québec 70 · OMERS 45 · Newfoundland
//   Public Sector Pension Plan 5. (Halifax Regional Municipality fund 1.5 and Edmonton Telephone Endowment Fund 0.75 are left out: on
//   this scale they are 8- and 4-px slivers, and six names over-fill the frame.) The screen never types a figure or a name: names are
//   episode.json labels (L); the one figure on screen is the label pensionLoss, checked here against the data.
import { L } from "./data";

export const PENSION_SAMPLE = [
  { key: "otpp", m: 100, label: "pensionDrawer" },
  { key: "caisse", m: 70, label: "hypePlaqueCaisse" },
  { key: "omers", m: 45, label: "hypePlaqueOmers" },
  { key: "nfld", m: 5, label: "pensionNfld" }
];
export const PENSION_SAMPLE_ALL_M = [100, 70, 45, 5, 1.5, 0.75];
export const PENSION_LOSS_M = PENSION_SAMPLE[0].m;
const must = (ok, what) => {
  if (!ok) throw new Error("pension_data: " + what);
};
must(Math.abs(PENSION_SAMPLE_ALL_M.reduce((a, b) => a + b, 0) - 222.25) < 1e-9, "the Maclean's sample adds to C$222.25M (FACTCHECK derived figures)");
must(PENSION_SAMPLE.every((b, i) => b.m === PENSION_SAMPLE_ALL_M[i]), "the chart's bars are the sample's four largest, in its order");
must(L("pensionLoss") === `C$${PENSION_LOSS_M}M LOST`, `episode.json pensionLoss must read "C$${PENSION_LOSS_M}M LOST" (FACTCHECK §7), it reads "${L("pensionLoss")}"`);
must(L("pensionDrawer") === "ONTARIO TEACHERS'", "episode.json pensionDrawer must name the plan (the plan's loss, not the teachers')");
