// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import episode from "./episode.json";
import { SENTENCES } from "./captions";
import { JACKPOT_DATE, JACKPOT_M, NET_2024_B, PRIZES_2024_B, SALES_2008_B, SALES_2024_B, US_PAYOUT, VA_PAYOUT } from "./data_lt";

export const L = (k) => episode.WD[k];
const TAKE = SENTENCES.map((s) => s.text).join(" ").toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ");
const takeSays = (id) => {
  const d = DIV.divergences.find((x) => x.id === id);
  if (!d) throw new Error(`data.ts: no divergence "${id}" \u2014 the screen switch and the guard must share one pattern`);
  return new RegExp(d.pattern, "i").test(TAKE);
};
const BULLION = { face: "#DCE5EF", body: "#A3BBD6", dark: "#2D6CB4", edge: "#F3F6FA" };
export const GOLD_INK = {
  hi: "#fff4d0",
  edge: "#ffe08a",
  face: "#f0c75a",
  body: "#d6a43a",
  mid: "#b98a2c",
  dark: "#8a6220",
  deep: "#4f3812"
};


export const usdB1 = (b) => `$${b.toFixed(1)}B`;
export const usdM0 = (m) => `$${Math.round(m)}M`;
export const centsOf = (share) => `${Math.round(share * 100)}\xA2`;
export const usd2 = (dollars) => `$${dollars.toFixed(2)}`;
export const fyLabel = (year) => `FY${year}`;
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export const dateLabel = (d) => `${MON[d.m - 1]} ${d.d}`;
export const ONE_THIRD = "1/3";
if (usdB1(SALES_2024_B) !== "$104.7B" || usdB1(SALES_2008_B) !== "$52.8B") throw new Error("data: $104.7B / $52.8B fails");
if (usdB1(PRIZES_2024_B) !== "$70.2B" || usdB1(NET_2024_B) !== "$34.5B") throw new Error("data: $70.2B / $34.5B fails");
if (centsOf(US_PAYOUT) !== "67\xA2" || centsOf(VA_PAYOUT) !== "80\xA2" || usd2(Math.round(US_PAYOUT * 100) / 100) !== "$0.67") throw new Error("data: 67\xA2 / 80\xA2 / $0.67 fails");
if (usdM0(JACKPOT_M) !== "$847M" || dateLabel(JACKPOT_DATE) !== "NOV 4") throw new Error("data: $847M / NOV 4 fails");
