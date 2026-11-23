// @ts-nocheck
// ★ V36 "Bre-X Gold" — builder F. The felderhof place's figures, from FACTCHECK.md §8 (one dataset each):
//   • OSC charge notice, May 11, 1999: Felderhof sold ~2,720,500 Bre-X shares Apr 24 – Sep 10, 1996 for ~C$83.9M; the four lots
//     add to C$83,955,669 (FACTCHECK "Derived figures") → C$83.96M, said and labelled "eighty-four million" / C$84M.
//   • OSC release, July 31, 2007: Judge Peter Hryn (Ontario Court of Justice) found him NOT GUILTY (not Aug 9).
//   The screen never types them: the labels are episode.json's (L), checked here against the figures.
import { L } from "./data";

export const FELDERHOF_SOLD_M = 83.955669;
export const FELDERHOF_SALE_YEAR = 1996;
export const FELDERHOF_VERDICT = { y: 2007, m: 7, d: 31 };
const MON = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
const must = (ok, what) => {
  if (!ok) throw new Error("felderhof_data: " + what);
};
must(Math.abs(21053951 + 22649558 + 17376205 + 22875955 - FELDERHOF_SOLD_M * 1e6) < 1, "the four OSC lots add to C$83,955,669");
must(L("felderhofFigure") === `C$${Math.round(FELDERHOF_SOLD_M)}M`, `episode.json felderhofFigure must be C$${Math.round(FELDERHOF_SOLD_M)}M`);
must(L("felderhofYear") === String(FELDERHOF_SALE_YEAR), "episode.json felderhofYear must be the sales' year, 1996");
must(L("felderhofVerdict") === "NOT GUILTY", "episode.json felderhofVerdict must be the court's words, NOT GUILTY");
must(L("felderhofDate") === `${MON[FELDERHOF_VERDICT.m - 1]} ${FELDERHOF_VERDICT.d}, ${FELDERHOF_VERDICT.y}`, "episode.json felderhofDate must be JULY 31, 2007 (OSC release)");
