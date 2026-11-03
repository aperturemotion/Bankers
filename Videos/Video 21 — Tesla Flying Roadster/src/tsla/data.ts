// ══════════════════════════════════════════════════════════════════════════════════════════════
// BANKERS VIDEO 21 — "The Last Car You'll Drive" — EVERY FIGURE ON SCREEN, WITH ITS SOURCE (verified 2026-10-28 at source;
// scratchpad/script.mjs CHECKED holds the wording).
// ★ ONE DATASET PER FIGURE FAMILY (the brief's rule 6) — never on one scale together:
//   · DELIVERIES — Tesla's production & deliveries releases (8-K Ex. 99.1): Q3 2026 486,532 (Oct 2, 2026); Q3 2025 497,099 (Oct 2, 2025).
//   · PROFIT — Tesla's Q3 2026 10-Q (Oct 22, 2026), income statement: GAAP net income attributable to common stockholders $787M (Q3 2026)
//     vs $1,373M (Q3 2025). ("Profit" in the voice = this figure: −42.7%.)
//   · REVENUE — the same 10-Q: total revenues $28,046M (Q3 2026) vs $28,095M; total automotive revenues $20,560M vs $21,205M (−3%).
//   · MARKET VALUE — 3,952,757,946 shares (10-Q cover, as of Oct 15, 2026) × $407.46 (Oct 27, 2026 close) = $1.611T. ★ LIVE: the stamp
//     "Market value as of Oct 27, 2026 close" goes in the POST CAPTION (STYLE §5.7); the screen carries AS OF OCT 27 as the counter's one
//     label. Re-check on posting day.
//   · THE REVEAL — Oct 15, 2026, SpaceX's test site in McGregor, outside Waco, Texas (TechCrunch, CBS, CNN, AP): an inverted ramp, a 180°
//     roll in mid-air, a landing on its wheels; then a thruster hop over a Cybercab, Cybertruck, Semi, Model Y and Model 3 (TechCrunch).
//     10 thrusters (TechCrunch). 0–60 mph in under one second (AP, CNN). Production planned for 2028 (CBS, AP, TechCrunch). The FAA:
//     "does not meet the FAA definition of an aircraft" (to CBS).
//   · THE COMMITTEES — Musk on SpaceX's Q3 call, Oct 20, 2026 (TechCrunch, NBC Boston); Tesla's 10-Q Part II Item 5 (its special
//     committee). No terms agreed.
// Musk is named, NEVER shown (the brief: no photo). Tesla and SpaceX marks: official vectors as inline SVG, in the stage's ink.
// Excluded on purpose (the brief): the Roadster's reservation prices, Musk's safety remarks, the stock's daily moves, Barclays' target,
// any view on whether a merger is good.
// ══════════════════════════════════════════════════════════════════════════════════════════════

/** ★ DELIVERIES (Tesla's deliveries releases), Q3 2025 → Q3 2026 */
export const DELIVERIES = { q325: 497099, q326: 486532 } as const;
export const DELIVERIES_PCT = Math.round((DELIVERIES.q326 / DELIVERIES.q325 - 1) * 1000) / 10; // −2.1
if (Math.round(DELIVERIES_PCT) !== -2) throw new Error("data: deliveries no longer fell two percent");

/** ★ PROFIT — GAAP net income attributable to common stockholders, $M (Tesla 10-Q) */
export const PROFIT = { q325: 1373, q326: 787 } as const;
export const PROFIT_PCT = Math.round((PROFIT.q326 / PROFIT.q325 - 1) * 1000) / 10; // −42.7
if (Math.round(PROFIT_PCT) !== -43) throw new Error("data: profit no longer fell forty-three percent");

/** ★ REVENUE, $M (Tesla 10-Q): total and total automotive, Q3 2026 vs Q3 2025 */
export const REVENUE = { total: 28046, totalPrev: 28095, auto: 20560, autoPrev: 21205 } as const;

/** ★ MARKET VALUE at the Oct 27, 2026 close ($T) — LIVE, re-check on posting day */
export const MARKET = { shares: 3952757946, close: 407.46, asOf: "OCT 27, 2026" } as const;
export const MARKET_T = (MARKET.shares * MARKET.close) / 1e12; // 1.611
if (Math.round(MARKET_T * 10) / 10 !== 1.6) throw new Error("data: the market value is no longer about $1.6 trillion");

/** ★ THE REVEAL */
export const REVEAL = { date: "OCT 15, 2026", place: "WACO, TEXAS", thrusters: 10, production: 2028, zeroToSixty: "UNDER 1 SECOND" } as const;
/** the five Teslas the Roadster hopped over (TechCrunch), in the row's order as drawn */
export const LINEUP = ["Cybercab", "Cybertruck", "Semi", "Model Y", "Model 3"] as const;
