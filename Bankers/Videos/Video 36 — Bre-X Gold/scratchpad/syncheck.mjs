// Diff a transcript of the RENDERED mix against the caption data it was built from.
//   node scratchpad/syncheck.mjs scratchpad/render_words.json
//
// ⚠ THIS IS THE ONLY CHECK THAT CAN SEE DESYNC. Aggregate level probes (volumedetect) cannot —
// they were clean over the 2026-08-30 build in which the voice ran 176 frames ahead of its own
// subtitles. Run it on every render.
// ⚠ THE RENDER'S AUDIO CONTAINS THE HOOK CLIP'S OWN SPEECH before the VO starts, so the
// transcript has ~13 words that have NO caption. A naive sequential matcher starting at heard[0]
// burns its lookahead on them and reports a false DESYNC — anchor on the first caption word
// instead, searching the whole list for it.
import fs from "fs";
const cap = fs.readFileSync("src/bnx/captions.ts", "utf8");
const grab = (m) => { const i = cap.indexOf(m), j = cap.indexOf("= [", i) + 2; let d = 0;
  for (let k = j; k < cap.length; k++) { if (cap[k] === "[") d++; else if (cap[k] === "]") { d--; if (!d) return JSON.parse(cap.slice(j, k + 1)); } } };
const WORDS = grab("export const WORDS");
// ★ the SAME suffix merge captions_vo.js applies ("$10" + ",000" → "$10,000"): V31's first word is a split number, and
//   an unmerged transcript could not find it at all
const heard = [];
for (const w of JSON.parse(fs.readFileSync(process.argv[2], "utf8")).words) {
  const suffix = /^[-.,%]/.test(w.t) || (/^&/.test(w.t) && w.t.length > 1);
  if (heard.length && suffix) { heard[heard.length - 1].t += w.t; heard[heard.length - 1].b = w.b; } else heard.push({ ...w });
}
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9$%&]/g, "");

// anchor: the first caption word, found anywhere in the transcript
const first = norm(WORDS[0].word);
let j = heard.findIndex((h) => norm(h.t) === first);
if (j < 0) { console.log("✗ could not find the first caption word in the render at all"); process.exit(1); }
console.log(`anchored on "${WORDS[0].word}" — captions ${(WORDS[0].at / 30).toFixed(2)}s, heard ${heard[j].a.toFixed(2)}s`);
console.log(`(${j} earlier transcript words are the hook clip's own speech, which has no caption)`);

const LOOK = 25;
let drift = [];
for (const w of WORDS) {
  const n = norm(w.word); if (!n) continue;
  for (let k = j; k < Math.min(j + LOOK, heard.length); k++) {
    if (norm(heard[k].t) === n) { drift.push(heard[k].a - w.at / 30); j = k + 1; break; }
  }
}
const sorted = [...drift].sort((a, b) => a - b);
const med = sorted[sorted.length >> 1];
const p95 = sorted[Math.floor(sorted.length * 0.95)];
const worst = drift.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a), 0);
console.log(`matched ${drift.length}/${WORDS.length} caption words`);
console.log(`drift  median ${med.toFixed(3)}s · p95 ${p95.toFixed(3)}s · worst ${worst.toFixed(3)}s`);
const ok = drift.length > WORDS.length * 0.75 && Math.abs(med) < 0.25 && Math.abs(p95) < 0.5;
console.log(ok ? "✓ captions and voice agree in the rendered file"
               : "✗ DESYNC — the render's voice does not sit where the captions say it does");
process.exit(ok ? 0 : 1);
