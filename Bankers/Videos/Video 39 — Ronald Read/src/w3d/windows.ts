// @ts-nocheck
// ★ V39 — THE SCENE WINDOWS (one per sentence; the integrator owns this file). Frames are the film's frames (30 fps, one clock).
//   A station's `start` is the frame its FIRST SHOT is a cut (`{ a: start, b: start, cut: true, … }`): Main.tsx cross-dissolves the previous
//   station into it over start+1 ± 7 f (both cameras keep drifting), so every station is MOUNTED from start − 8 to end + 8, and its last
//   shot keeps the camera moving gently until end + 8. `end` is the next station's start. Every action keys to a word: wf("word", n).
import { WORDS, TOTAL } from "./take";
const nrm = (s) => s.toLowerCase().replace(/[^a-z0-9$']/g, "");
// the frame of the first word EQUAL to w (not a prefix: "he" ≠ "held") at or after frame `after`
export const wAt = (w, after = 0) => { const q = nrm(w); const x = WORDS.find((o) => o.at >= after && nrm(o.t) === q); if (!x) throw new Error("windows: no word " + w + " after " + after); return x.at; };
export const wEndAt = (w, after = 0) => { const q = nrm(w); const x = WORDS.find((o) => o.at >= after && nrm(o.t) === q); if (!x) throw new Error("windows: no word " + w + " after " + after); return x.end; };
const S = (w, after = 0) => wAt(w, after) - 4;   // the new picture lands just before its sentence's first word (CLAUDE.md 3-D World §B2)
export const WIN = () => {
  const starts = {
    hook: 0,                       // "When a retired janitor in Vermont died in 2014, his will revealed he was worth almost $8 million."
    farm: S("ronald"),          // "Ronald Read grew up poor on a Vermont farm and was the first in his family to finish high school."
    gas: S("after"),               // "After the war, he pumped gas for about 25 years,"
    jcp: S("then", 400),             // "then worked as a part-time janitor at JCPenney for 17 more."
    yard: S("he", 590),              // "He drove a second-hand Toyota Yaris, held his coat together with a safety pin, and chopped his own firewood into his nineties."
    diner: S("a", 810),              // "A stranger once paid for his meal, thinking he couldn't afford it."
    shares: S("what"),             // "What nobody knew: for decades, he'd quietly bought shares in companies he understood, and held on to them."
    vault: S("when", 1100),           // "When he died, he owned at least 95 stocks. The certificates in his safe deposit box stood about 5 inches high."
    lehman: S("not"),              // "Not every pick worked. He held Lehman Brothers when it collapsed in 2008. It was one stock out of dozens."
    will: S("then", 1520),            // "Then came the will: $4.8 million to the local hospital, $1.2 million to the library. Twice its yearly budget."
    pavilion: S("in", 1780),          // "In 2023, the hospital opened a new wing, partly paid for by his gift: the Ronald Read Pavilion."
    line: S("he", 1980),             // "He never earned a big salary. He just gave his money time."  (+ the BANKER$ close)
  };
  const ids = Object.keys(starts), out = {};
  ids.forEach((id, i) => { out[id] = { start: starts[id], end: i + 1 < ids.length ? starts[ids[i + 1]] : TOTAL }; });
  return out;
};
