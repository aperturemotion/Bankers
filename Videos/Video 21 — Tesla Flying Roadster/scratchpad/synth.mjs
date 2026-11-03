// VIDEO 13 — THE PROVISIONAL TAKE. Until Timur's VO lands, the film is timed on a synthetic word list built from
// script.mjs at the pace his demo take measured (36 words in 11.05 s ≈ 3.26 words/s, ElevenLabs "Jon – Calm Presence"
// at speed 1.10). It is written in WHISPER's spelling — digits for numbers, "N billion dollars" — so captions_vo.mjs
// runs exactly the same code on it as it will on fw.py's real transcript (root CLAUDE.md: the take speaks digits).
//   node scratchpad/synth.mjs   → scratchpad/syn_words.json   (captions_vo.mjs reads fw_words.json if it exists, else this)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SECTIONS, WHISPER } from "./script.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));

/** the script's spoken numbers → whisper's written form (display), keeping the SPOKEN length for timing */

const words = [];
let t = 0.0;
const PER_CHAR = 0.052, BASE = 0.07, MIN_W = 0.13;
const PAUSE = { comma: 0.14, sentence: 0.34, section: 0.62 };
for (const [si, sec] of SECTIONS.entries()) {
  if (si > 0) t += PAUSE.section - PAUSE.sentence;
  for (const line of sec.lines) {
    let shown = line;
    const spokenLen = new Map();
    for (const [spoken, written] of WHISPER) if (shown.includes(spoken)) { spokenLen.set(written, spoken.length); shown = shown.split(spoken).join(written); }
    const toks = shown.split(/\s+/);
    // spread a multi-word written phrase's spoken length across its tokens
    const phraseOf = (i) => { for (const [w, len] of spokenLen) { const wt = w.split(" "); for (let k = 0; k < wt.length; k++) if (toks.slice(i - k, i - k + wt.length).join(" ") === w) return len / wt.length; } return null; };
    toks.forEach((tok, i) => {
      const clean = tok.replace(/[^\w'&%.$-]/g, "");
      const len = phraseOf(i) ?? clean.length;
      const d = Math.max(MIN_W, BASE + PER_CHAR * len);
      words.push({ t: tok, a: +t.toFixed(2), b: +(t + d).toFixed(2) });
      t += d + 0.03;
      if (/,$/.test(tok)) t += PAUSE.comma;
    });
    t += PAUSE.sentence;
  }
}
// calibrate to the demo take's MEASURED rate — the shape of the timing comes from the text, its speed from the voice
// Video 1's REAL take measured 324 words in 97.4 s = 3.33 words/s (same voice, same settings). ★ Video 10: Video 9's REAL take
// (the newest, same voice) measured 213 words in 80.7 s after trimming = 2.64 words/s — the build is timed on that, so the
// provisional scenes run as long as the real read will need (at 3.33 the synthetic film ran 48 s against a ~70 s read).
// ★ Video 11: Video 10’s REAL take (the newest, same voice and settings) measured 184 words in 60.5 s after trimming = 3.04 words/s.
// ★ Video 12: Video 11's REAL take (the newest, same voice and settings) measured 185 words in 66.1 s after trimming = 2.80 words/s.
const TARGET_WPS = 2.80;
const k = words.length / TARGET_WPS / t;
for (const w of words) { w.a = +(w.a * k).toFixed(2); w.b = +(w.b * k).toFixed(2); }
t *= k;
fs.writeFileSync(path.join(here, "syn_words.json"), JSON.stringify({ synthetic: true, words }, null, 0));
const n = words.length;
console.log(`${n} words · ${t.toFixed(1)} s of voice · ${(n / t).toFixed(2)} words/s (calibrated to Video 11’s real take, 2.80)`);
