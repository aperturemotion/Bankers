// VIDEO 16 — "33,575 Companies Private Equity Hasn't Sold" — THE SCRIPT, as ONE source of truth.
// Used by: captions_vo.mjs (asserts the take reads as this script), vo_script.mjs (writes VO_SCRIPT.txt), and the render guard
// (divergences.json holds the brief's lines this script corrected).
//
// The brief's wording with NUMBERS SPELLED so the voice reads them exactly (the captions show digits). Every claim checked at source,
// 2026-10-23 (three research passes in parallel): PitchBook's global count via Penn Mutual AM (Oct 22, 2026) and Inc. (Aug 10, 2026);
// Reuters via WSAU (Oct 19, 2026); Bain's Global Private Equity Report 2026 (Feb 23, 2026); Dealogic via Inc./the NYT (Aug 10, 2026);
// PitchBook's Q3 2026 First Look via Foley & Lardner (Oct 2, 2026) and PitchBook's Q2 2026 US PE Breakdown (fundraising history).
//
// ★ ONE DATASET PER FIGURE FAMILY (the brief's rule 6): the unsold counts are one PitchBook GLOBAL series; payouts are Bain's (MSCI buyout
// data); listings are Dealogic's (US exchanges); Q3 exits and fundraising are PitchBook's US data. Never on one scale together.
// ★ NO RELATIVE TIME (Bankers §4): every period is named.
export const SECTIONS = [
  { id: "hook", lines: [
    "Private equity is sitting on over thirty-three thousand companies it hasn't sold.",
    "That's more than double a decade earlier.",
  ] },
  { id: "what", lines: [
    "On October nineteenth, Unilever agreed to sell its Welly bandage brand to a private equity firm.",
    "By the end of June, the unsold count was thirty-three thousand five hundred seventy-five, worldwide.",
  ] },
  { id: "teach", lines: [
    "Here's how private equity gets paid.",
    "A fund raises money from investors like pensions, buys companies, improves them, then sells.",
    "Investors mostly get paid when it sells.",
    "For four years running, yearly payouts have stayed under fifteen percent of what the funds hold.",
    "That's a record streak.",
    "One way out is the stock market.",
    "About seventy have listed in the U.S. since twenty twenty-two, against over four hundred from twenty seventeen to twenty twenty-one.",
  ] },
  { id: "honest", lines: [
    "Now, the honest part.",
    "Sales are picking up.",
    "From July to September, private equity exits of American companies were worth one hundred sixty-five billion dollars, fifty-one percent more than from April to June.",
    "But American private equity fundraising is on pace for its first year under three hundred billion dollars since twenty twenty.",
  ] },
  { id: "question", lines: [
    "So be honest.",
    "Is this pile a warning, or a wave of new listings waiting to happen?",
    "Tell us below.",
  ] },
];

/** the brief's lines this script changes (armed in the render guard by divergences.mjs) */
export const CHANGES = [
  { id: "pensions", severity: "low",
    brief: "A fund raises money from pensions, buys companies, improves them, then sells.",
    corrected: "A fund raises money from investors like pensions, buys companies, improves them, then sells.",
    why: "Pensions are one kind of investor (limited partner) among several — endowments, sovereign funds, insurers. 'Investors like pensions' keeps the example without saying pensions are the only source." },
  { id: "payouts", severity: "medium",
    brief: "From twenty twenty-two to twenty twenty-five, yearly payouts stayed under fifteen percent of what the funds hold.",
    corrected: "For four years running, yearly payouts have stayed under fifteen percent of what the funds hold.",
    why: "Bain, Global PE Report 2026: 'Distributions as a percentage of net asset value (NAV) have now held below 15% for four years running—an industry record.' Its latest point is NOT calendar 2025: '2025 represents the 12-month period from Q4 2024 to Q3 2025' (Figure 19, MSCI buyout data). 'Four years running' is the report's own claim, exactly; the calendar span would be loose." },
  { id: "listings", severity: "medium",
    brief: "About seventy have listed since twenty twenty-two, against over four hundred from twenty seventeen to twenty twenty-one.",
    corrected: "About seventy have listed in the U.S. since twenty twenty-two, against over four hundred from twenty seventeen to twenty twenty-one.",
    why: "Dealogic (via the NYT and Inc., Aug 10, 2026): 'only 70 private equity-backed companies have gone public on U.S. exchanges' since 2022; 2017–2021: 424. A US count: without 'in the U.S.' the line reads as global. (Counted to early August 2026: the screen says 2022–AUG 2026.)" },
  { id: "exits", severity: "high",
    brief: "From July to September, American firms sold one hundred sixty-five billion dollars of companies, fifty-one percent more than from April to June.",
    corrected: "From July to September, private equity exits of American companies were worth one hundred sixty-five billion dollars, fifty-one percent more than from April to June.",
    why: "PitchBook's Q3 2026 First Look (via Foley & Lardner, Oct 2, 2026), US: '405 exits for the quarter, up 11%, and total value came in at $165.1 billion, a jump of 51% QoQ.' The series is exits of US PE-backed COMPANIES — the selling firms are of any nationality, so 'American firms sold' is wrong; and PitchBook counts listings as exits too, so 'exits … were worth' is exact. (+51% is quarter on quarter; year on year Q3 was down.)" },
  { id: "fundraising", severity: "medium",
    brief: "But fundraising is on pace for its first year under three hundred billion dollars since twenty twenty.",
    corrected: "But American private equity fundraising is on pace for its first year under three hundred billion dollars since twenty twenty.",
    why: "Foley on PitchBook's Q3 data, US section: '$222 billion YTD (as of the end of Q3). If the current pace holds, 2026 will be the first time since 2020 that the asset class will raise less than $300 billion.' PitchBook's US history: 2020 $252.0B; 2021–2025 all above $300B. A US figure: the line names it." },
];

/** what was checked, line by line (for VO_SCRIPT.txt) */
export const CHECKED = [
  "33,575 PE-owned companies awaiting exit at June 30, 2026; 32,451 at year-end 2025; an estimated 15,923 'a decade ago' — PitchBook, global ('Global count of PE-owned companies not yet sold', Penn Mutual AM, Oct 22, 2026; Inc., Aug 10, 2026). No year is given for the decade-ago estimate (the screen says A DECADE EARLIER (EST.)), and no source calls 33,575 a record: never 'record' about the count.",
  "33,575 / 15,923 = 2.11 — 'more than double' holds (Penn Mutual's own words).",
  "Reuters via WSAU, Oct 19, 2026 (a Monday): Unilever 'agreed to sell Welly Health PBC to private-equity firm Forward Consumer Partners'; terms undisclosed; expected to close in Q4. Reuters calls Welly a 'bandage brand'. 'Agreed to sell' — not closed.",
  "Bain, Global PE Report 2026 (Feb 23, 2026): payouts below 15% of NAV four years running, 'an industry record'; the latest ~14% (12 months to Q3 2025). Payouts = cash back to the funds' investors (LPs).",
  "Dealogic: about 70 US PE-backed IPOs since 2022 (to early August 2026), 424 in 2017–2021.",
  "PitchBook, US: Q3 2026 exit value $165.1B, +51% on Q2 (405 exits, +11%).",
  "PitchBook, US: $222B raised Jan–Sep 2026; on pace for the first year under $300B since 2020 ('If the current pace holds' — a projection: the voice says 'on pace').",
  "'A fund raises money … then sells. Investors mostly get paid when it sells' — fair and neutral: distributions come mostly from exits ('mostly': dividend recaps, continuation funds and secondary sales also return cash).",
];

/** lines cut for length (none: the script runs inside the 80-s cap) */
export const TRIMS = [];

/** the whole script as one string (captions_vo.mjs checks the take reads as it) */
export const SCRIPT_TEXT = SECTIONS.flatMap((s) => s.lines).join(" ");

/** the script's spoken numbers → the caption (whisper-like) form — ONE copy */
export const WHISPER = [
  ["thirty-three thousand five hundred seventy-five", "33,575"],
  ["thirty-three thousand", "33,000"],
  ["one hundred sixty-five billion dollars", "$165 billion"],
  ["three hundred billion dollars", "$300 billion"],
  ["fifty-one percent", "51%"],
  ["fifteen percent", "15%"],
  ["twenty twenty-two", "2022"],
  ["twenty seventeen", "2017"],
  ["twenty twenty-one", "2021"],
  ["twenty twenty", "2020"],
  ["October nineteenth", "October 19th"],
];
