// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).

export const SALES_2008_B = 52.8;
export const SALES_2024_B = 104.7;
export const PRIZES_2024_B = 70.2;
const PRIZES_2008_B = 32.2;
export const NET_2024_B = 34.5;
export const VA_PAYOUT = 0.8;
export const JACKPOT_M = 847;
export const JACKPOT_DATE = { y: 2026, m: 11, d: 4 };
export const US_PAYOUT = PRIZES_2024_B / SALES_2024_B;
export const KEPT_SHARE = NET_2024_B / SALES_2024_B;
const SALES_X = SALES_2024_B / SALES_2008_B;
export const GRID_LIT = Math.round(US_PAYOUT * 100);
const must = (ok, what) => {
  if (!ok) throw new Error("data_lt: " + what);
};
must(Math.abs(SALES_2024_B - PRIZES_2024_B - NET_2024_B) < 1e-9, "sales \u2212 prizes = net revenue (104.7 \u2212 70.2 = 34.5)");
must(Math.round(US_PAYOUT * 100) === 67, "'about sixty-seven cents'");
must(Math.round(KEPT_SHARE * 100) === 33 && Math.abs(KEPT_SHARE - 1 / 3) < 0.01, "'about a third'");
must(SALES_X > 1.9 && SALES_X < 2, "'nearly doubled' (\xD71.98)");
must(Math.round(VA_PAYOUT * 100) === 80 && VA_PAYOUT > US_PAYOUT, "'Virginia paid back eighty cents'");
must(GRID_LIT === 67, "the grid lights 67 of 100");
