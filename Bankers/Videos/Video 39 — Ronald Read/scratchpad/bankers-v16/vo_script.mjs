// VIDEO 16 — writes VO_SCRIPT.txt (paste-ready for ElevenLabs) from script.mjs, the one source of the script.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SECTIONS, CHANGES, CHECKED, TRIMS, SCRIPT_TEXT } from "./script.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const words = SCRIPT_TEXT.split(/\s+/).length;
// the length: Video 14's REAL take — 189 words, 66.7 s of voice after trimming ("Jon – Calm Presence", eleven_v4)
const voiceS = words * (66.7 / 189);
const rule = "─".repeat(78);
const out = [
  "BANKERS VIDEO 16 — \"33,575 Companies Private Equity Hasn't Sold\" — VO SCRIPT FOR ELEVENLABS",
  "=".repeat(78),
  "",
  "THE SCRIPT (one paragraph per section):",
  rule,
  ...SECTIONS.map((s) => s.lines.join(" ")),
  rule,
  "",
  `${words} words as written. At Video 14's pace ("Jon – Calm Presence") that is ≈ ${Math.round(voiceS)} s of voice; with the ~3.5 s`,
  `close the film lands around ${Math.round(voiceS + 3.5)} s, inside the brief's HARD CAP of 80 s.`,
  "Numbers are spelled out so the voice reads them exactly; the captions show them as digits.",
  "The take is generated in ElevenLabs from this script (Timur, 2026-10-18), then goes through the VO pipeline; every scene is",
  "cued to a word, not to a clock.",
  "",
  `WHAT CHANGED: ${CHANGES.length ? `${CHANGES.length} lines` : "nothing — every line held at primary source"}.`,
  rule,
  ...CHANGES.flatMap((c) => [`- "${c.brief}"`, `    -> "${c.corrected}"`, `    [${c.severity}] ${c.why}`, ""]),
  ...(TRIMS.length ? ["CUT FOR LENGTH:", rule, ...TRIMS.flatMap((t) => [`- "${t.brief}"`, `    -> "${t.now}"`, `    ${t.why}`, ""])] : []),
  "WHAT WAS CHECKED, LINE BY LINE (2026-10-23):",
  rule,
  "Sources: PitchBook (global unsold count, via Penn Mutual AM Oct 22, 2026 and Inc. Aug 10, 2026); Reuters via WSAU (Oct 19, 2026);",
  "Bain, Global Private Equity Report 2026; Dealogic (via the NYT and Inc., Aug 10, 2026); PitchBook Q3 2026 US data (via Foley, Oct 2, 2026).",
  ...CHECKED.map((c) => `- ${c}`),
  "",
  "FOR THE POST CAPTION:",
  "  PitchBook | global count of PE-owned companies awaiting exit, as of Jun 30, 2026; a decade earlier: PitchBook's estimate.",
  "  Payouts: Bain & Company, Global Private Equity Report 2026 (distributions as a share of NAV, MSCI buyout data; latest = 12 months to Q3 2025).",
  "  Listings: Dealogic, US exchanges, 2022 to Aug 2026 vs 2017–2021. Exits and fundraising: PitchBook, US, Q3 2026.",
  "  Educational content, not financial advice.",
].join("\n");
fs.writeFileSync(path.join(here, "..", "VO_SCRIPT.txt"), out + "\n");
console.log(`VO_SCRIPT.txt — ${words} words (≈ ${Math.round(voiceS)} s of voice), ${CHANGES.length} corrections explained`);
