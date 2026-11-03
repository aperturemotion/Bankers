// VIDEO 21 — "The Last Car You'll Drive" — THE SCRIPT, as ONE source of truth.
// Used by: captions_vo.mjs (asserts the take reads as this script), vo_script.mjs (writes VO_SCRIPT.txt), and the render guard
// (divergences.json holds the brief's lines this script corrected).
//
// The brief's wording with NUMBERS SPELLED so the voice reads them exactly (the captions show digits). Every claim checked at source,
// 2026-10-28 (two research passes in parallel): Tesla's 8-K deliveries releases (Oct 2, 2026; Oct 2, 2025) and its Q3 2026 10-Q (Oct 22,
// 2026) on sec.gov; TechCrunch (Oct 15 and Oct 20, 2026), CBS/AFP, CNN, AP, Politico, NBC Boston on the reveal and the committees.
//
// ★ ONE DATASET PER FIGURE FAMILY (the brief's rule 6): deliveries from Tesla's deliveries releases; profit (GAAP net income attributable
// to common stockholders) and revenue from Tesla's 10-Q; the market value from the Oct 27, 2026 close × the 10-Q cover's share count.
// ★ NO RELATIVE TIME (Bankers §4): every period is named.
export const SECTIONS = [
  { id: "hook", lines: [
    "Tesla built a car that jumps over other cars.",
    "And Elon Musk calls it the best of the last human-driven cars.",
  ] },
  { id: "what", lines: [
    "On October fifteenth, outside Waco, Texas, Tesla showed off its new Roadster.",
    "It climbed an upside-down ramp, flipped in mid-air and landed on its wheels.",
    "Then compressed-air thrusters, developed with SpaceX, lifted it over a row of other Teslas.",
    "Tesla says it goes from zero to sixty in under one second.",
  ] },
  { id: "teach", lines: [
    "Here's the strange part.",
    "Even Musk says the Roadster may not move Tesla's revenue much.",
    "And Tesla's car business is shrinking.",
    "From July to September, deliveries fell two percent, and profit fell forty-three percent.",
    "Yet Tesla is worth about one point six trillion dollars.",
    "Investors aren't paying for the cars Tesla sells today.",
    "They're paying for what Musk says comes next: robotaxis, robots, and maybe SpaceX.",
    "Musk has said both companies set up committees to look at a possible merger.",
  ] },
  { id: "honest", lines: [
    "Now, the honest part.",
    "The FAA says the Roadster doesn't meet its definition of an aircraft.",
    "Production isn't planned until twenty twenty-eight.",
    "And no merger terms have been agreed.",
  ] },
  { id: "question", lines: [
    "So be honest.",
    "Is Tesla still a car company?",
    "Tell us below.",
  ] },
];

/** the brief's lines this script changes (armed in the render guard by divergences.mjs) */
export const CHANGES = [
  { id: "jumps", severity: "medium",
    brief: "Tesla built a car that flies over other cars.",
    corrected: "Tesla built a car that jumps over other cars.",
    why: "The move over the cars was a thruster HOP: CNN 'jumped over a line of existing Tesla models', AP 'short airborne hops', TechCrunch 'lift itself over vehicles'. And the film's own honest part says the FAA does not count it as an aircraft ('The Tesla vehicle does not meet the FAA definition of an aircraft', FAA to CBS) — 'flies' in our own voice would contradict it. 'Flying car' stays Tesla's and Musk's word, not ours." },
  { id: "bestof", severity: "high",
    brief: "And Elon Musk calls it the last of the human-driven cars.",
    corrected: "And Elon Musk calls it the best of the last human-driven cars.",
    why: "Musk's words were 'the best of the last of the human-driven cars' (TechCrunch, Oct 15, 2026; AP: 'best of the last human-driven cars'). Dropping 'best of' turns his claim into a different one — that it IS the last human-driven car. A quotation keeps its meaning." },
  { id: "developed", severity: "low",
    brief: "Then compressed-air thrusters, built with SpaceX, lifted it over a row of other Teslas.",
    corrected: "Then compressed-air thrusters, developed with SpaceX, lifted it over a row of other Teslas.",
    why: "Reuters: 'developed in collaboration with SpaceX'; TechCrunch quotes Musk on 'Tesla and SpaceX Engineers working closely together'. Who BUILT the thrusters is not reported. 'Then' holds: the hop over the cars was a second display after the ramp flip (CNN, The National News Desk)." },
  { id: "underone", severity: "medium",
    brief: "Tesla says it goes from zero to sixty in one second.",
    corrected: "Tesla says it goes from zero to sixty in under one second.",
    why: "AP: Tesla said it can go 'from zero to 60 miles … an hour in less than a second'; CNN: Musk said 'less than a second'; TechCrunch calls the Thrust trim 'sub-one-second'. 'In one second' understates the claim and is not what Tesla said." },
  { id: "merger", severity: "low",
    brief: "Musk has said both companies set up committees to discuss a merger.",
    corrected: "Musk has said both companies set up committees to look at a possible merger.",
    why: "Musk on SpaceX's Q3 call, Oct 20, 2026 (TechCrunch, NBC Boston): both boards formed special committees; no agreement on terms. Tesla's own 10-Q (Oct 22, 2026, Part II Item 5): its special committee is to 'explore deepening Tesla's relationship with SpaceX, which could be through … a business combination'. A merger is one possibility under study, not the committees' set agenda." },
  { id: "success", severity: "medium",
    brief: "Production isn't planned until twenty twenty-eight, and Musk admits success isn't guaranteed.",
    corrected: "Production isn't planned until twenty twenty-eight.",
    why: "2028 holds (CBS, AP, TechCrunch). But Musk's 'success is not guaranteed' (CBS/AFP) was about whether that night's LIVE STUNT would work — said while explaining why no one was in the car, followed by 'It'll probably work' (CNN). Beside the production date it reads as a warning about the car's future, which he did not give. Cut; the honest part keeps the FAA, the 2028 date and the unagreed merger." },
];

/** what was checked, line by line (for VO_SCRIPT.txt) */
export const CHECKED = [
  "Reveal: Oct 15, 2026, at SpaceX's test site in McGregor, outside Waco, Texas (TechCrunch, CBS photo caption, The National News Desk). The car drove up an inverted ramp, rolled 180° in mid-air and landed on its wheels (CBS; Musk via TechCrunch: 'drive up an inverted ramp, spin around, and ease itself to a landing'). It ran with no one in it.",
  "The hop: compressed-air thrusters lifted it over a Cybercab, Cybertruck, Tesla Semi, Model Y and Model 3 (TechCrunch) in a second display after the flip. TechCrunch: '10 thrusters connected to 600 liters of compressed air' (TechCrunch's sentence — not a Moravy quote).",
  "0–60 mph: 'less than a second' (AP, CNN). Production planned for 2028 (CBS, AP, TechCrunch). FAA: 'does not meet the FAA definition of an aircraft' (to CBS; Politico).",
  "Musk: 'not sure it moves the needle massively from a revenue standpoint' (TechCrunch) — 'may not move Tesla's revenue much'.",
  "Deliveries: Q3 2026 486,532 vs Q3 2025 497,099 = −2.13% (Tesla 8-K exhibits, Oct 2, 2026 and Oct 2, 2025). 'Fell two percent'.",
  "Profit: GAAP net income attributable to common stockholders $787M vs $1,373M = −42.7% (Tesla 10-Q, Oct 22, 2026). 'Fell forty-three percent'. (Total net income incl. noncontrolling interests: −42.1%; the line means the attributable figure.)",
  "Revenue: $28,046M vs $28,095M (flat); total automotive revenues $20,560M vs $21,205M (−3%) — 'the car business is shrinking' (10-Q).",
  "Market value: 3,952,757,946 shares (10-Q cover, Oct 15, 2026) × $407.46 (Oct 27, 2026 close) = $1.611T — 'about one point six trillion'. ★ Live figure: re-check on posting day (Oct 28 midday ≈ $1.58T, still 'about 1.6').",
  "Committees: Musk on SpaceX's Q3 call, Oct 20, 2026 (TechCrunch, NBC Boston): both boards formed special committees; 'have not reached agreement on the terms of any transactions'. Tesla's 10-Q confirms its own committee ('no assurance that any such Transaction will be consummated').",
];

/** lines cut for length (none: the script runs inside the 80-s cap) */
export const TRIMS = [];

/** the whole script as one string (captions_vo.mjs checks the take reads as it) */
export const SCRIPT_TEXT = SECTIONS.flatMap((s) => s.lines).join(" ");

/** the script's spoken numbers → the caption (whisper-like) form — ONE copy */
export const WHISPER = [
  ["one point six trillion dollars", "$1.6 trillion"],
  ["forty-three percent", "43%"],
  ["two percent", "2%"],
  ["twenty twenty-eight", "2028"],
  ["zero to sixty", "0 to 60"],
  ["under one second", "under 1 second"],
  ["October fifteenth", "October 15th"],
];
