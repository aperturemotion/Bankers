// @ts-nocheck
// ★ V37 "Theranos" — builder F. The verdict's and the hourglass's figures, ONE dataset (FACTCHECK.md #13, #14, #16):
//   US v. Holmes, 9th Cir. No. 22-10312, amended opinion (Dec 22, 2025) p.16: convicted Jan 3, 2022 on 4 investor counts
//   (1 conspiracy + 3 wire fraud), acquitted on the patient counts; sentenced Nov 18, 2022 to 135 months; on Mar 26, 2026 the
//   sentence was cut by 12 months to 123 months (Bloomberg, Mar 26, 2026; Reason/Volokh, Mar 27, 2026).
//   The labels themselves live in episode.json (verdictCounts, verdictMonths, verdictCut …); these numbers SIZE the sand and are
//   checked against those labels so the drawing and the print can never disagree.
import { L } from "./data";

export const VERDICT_COUNTS = 4;
export const SENTENCE_MONTHS = 135;
export const SENTENCE_CUT_MONTHS = 12;
export const SENTENCE_NOW_MONTHS = SENTENCE_MONTHS - SENTENCE_CUT_MONTHS;
/** the share of the sentence's sand that the cut takes out (12 of 135) */
export const CUT_SHARE = SENTENCE_CUT_MONTHS / SENTENCE_MONTHS;
const must = (ok, what) => {
  if (!ok) throw new Error("verdict_data: " + what);
};
must(SENTENCE_MONTHS === 11 * 12 + 3, "135 months = eleven years and three months (FACTCHECK #14)");
must(SENTENCE_CUT_MONTHS === 12, "'cut by one year' = 12 months (FACTCHECK #14: 135 → 123)");
must(SENTENCE_NOW_MONTHS === 123 && SENTENCE_NOW_MONTHS === 10 * 12 + 3, "123 months = ten years and three months (FACTCHECK #14)");
must(Math.abs(CUT_SHARE - 12 / 135) < 1e-12, "the cut is 12/135 of the sand");
// the printed labels say the same numbers
const num = (k) => Number((L(k) ?? "").match(/^\D*(\d+)/)?.[1]);
must(num("verdictMonths") === SENTENCE_MONTHS, `label verdictMonths ("${L("verdictMonths")}") must print ${SENTENCE_MONTHS}`);
must(num("verdictCut") === SENTENCE_NOW_MONTHS, `label verdictCut ("${L("verdictCut")}") must print ${SENTENCE_NOW_MONTHS}`);
must(num("verdictCounts") === VERDICT_COUNTS, `label verdictCounts ("${L("verdictCounts")}") must print ${VERDICT_COUNTS} (FACTCHECK #13)`);
must(/JAN 3, 2022/.test(L("verdictDate") ?? ""), "label verdictDate must be the verdict's date, JAN 3, 2022 (FACTCHECK #13)");
must(/FEB 2015/.test(L("ruleDate") ?? ""), "label ruleDate must be JAMA's date, FEB 2015 (FACTCHECK #18: JAMA 2015;313(7), Feb 17, 2015)");
