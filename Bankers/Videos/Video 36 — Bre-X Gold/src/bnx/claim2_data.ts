// @ts-nocheck
// Video 36 "Bre-X Gold" — the figures of claim2 (builder B, 2026-11-23), ONE dataset: Bre-X's own resource claims for Busang, as
//   quoted in FACTCHECK.md line 2 (OSC charge notice of May 11, 1999, quoting the Feb 17, 1997 release: "totalling 70.95 million
//   ounces of gold"; Reuters Feb 17, 1997: up "by 13.6 million ounces to 70.95 million"; the earlier claims 39.15M (June 20, 1996),
//   46.92M (July 22, 1996) and 57.33M (Dec 3, 1996)). The counter's drums roll up THROUGH these claims to the last one. The 200M oz
//   "comfortable" remark of Feb 19, 1997 was talk, not a company estimate — it is not here.
import { L } from "./data";

export const CLAIMS = [
  { oz: 39150000, y: 1996, m: 6, d: 20 },
  { oz: 46920000, y: 1996, m: 7, d: 22 },
  { oz: 57330000, y: 1996, m: 12, d: 3 },
  { oz: 70950000, y: 1997, m: 2, d: 17 }
];
export const CLAIMED_OZ = CLAIMS[CLAIMS.length - 1].oz;
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export const ozFull = (oz) => `${oz.toLocaleString("en-US")} OZ`;
export const ozM = (oz) => `${Math.round(oz / 1e6)}M OZ`;
const must = (ok, what) => {
  if (!ok) throw new Error("claim2_data: " + what);
};
must(CLAIMS.every((c, i) => i === 0 || c.oz > CLAIMS[i - 1].oz), "the claims only rise (the counter counts only up)");
must(CLAIMS.every((c) => c.oz % 1e4 === 0), "every claim is a release figure to the hundredth of a million ounces");
must(Math.abs((CLAIMED_OZ - CLAIMS[2].oz) / 1e6 - 13.62) < 1e-9, "70.95 − 57.33 = 13.62 (Reuters: up 13.6 million)");
must(Math.round(CLAIMED_OZ / 1e6) === 71, "'seventy-one million ounces' (70.95M rounds to 71)");
must(L("claim2Readout") === ozFull(CLAIMED_OZ), `the drums' readout label "${L("claim2Readout")}" must be ${ozFull(CLAIMED_OZ)}`);
must(String(L("claim2Label")).startsWith(ozM(CLAIMED_OZ)), `claim2Label "${L("claim2Label")}" must start with ${ozM(CLAIMED_OZ)}`);
must(L("claim2Date") === `${MON[CLAIMS[3].m - 1]} ${CLAIMS[3].y}`, `claim2Date "${L("claim2Date")}" must be the release's month (Feb 17, 1997)`);
