// SYNTHETIC captions for STYLE 3 · VIDEO 38 — "The Ten Days That Cost Him Half"
// Regenerates src/bnx/captions.ts with SYNTHESIZED word timings (no VO yet — the real take sets
// the true length; when it lands: vo_trim.py → fw.py → write captions_vo.js's PLAN → regenerate →
// re-audit → flip HAS_VO/HAS_MUSIC/HAS_SFX).
//
//   node scratchpad/captions.js
//
// Engine: V12's (V11's, calibrated against V10's real take) — variable hero PAINT frames + the
// 12f minimum-hold borrow + the one-caption-at-a-time assertion; only the word source is
// synthesized.
//
// ★★ THE SCRIPT IS VO_SCRIPT.txt's CORRECTED VERSION, not the brief's — the brief lines that
// failed verification (see data.ts FACT CHECK) are corrected here, and every one of them is ARMED
// in src/bnx/divergences.json before any take exists (CLAUDE.md: arm the guard before the take).
//
// ★★ NUMBERS ARE WRITTEN AS THE TAKE WILL TRANSCRIBE THEM (digits), so every cue in
// Composition.tsx already points at the token whisper will produce. Their DURATION comes from how
// they are SPOKEN (the SPOKEN map below).
const fs = require("fs");

const FPS = 30;
const HERO_LEAD = 5;
const MAX_CHUNK = 4;

// ★ V33: the script is the EPISODE CONFIG's (src/bnx/episode.json) — the sponsor's revisions are a one-file edit there.
//   `take` is the line as the read will transcribe (digits where whisper writes digits).
const SENT = JSON.parse(fs.readFileSync("src/bnx/episode.json", "utf8")).script.map((l) => ({ sc: l.scene, t: l.take, hero: !!l.hero }));

// how each digit token is SAID — the duration of a number is its spoken length, not its glyphs
const SPOKEN = {
  "20": "twenty", "10": "ten", "$10,000": "ten thousand dollars", "S&P": "S and P", "500": "five hundred", "2006.": "two thousand six",
  "$80,600.": "eighty thousand six hundred dollars", "5,000": "five thousand", "$35,900.": "thirty five thousand nine hundred dollars",
  "$21,000.": "twenty one thousand dollars", "40,": "forty", "3": "three", "2008": "two thousand eight", "2020": "twenty twenty",
  "2025.": "twenty twenty five", "11.5%,": "eleven and a half percent", "2": "two", "9%": "nine percent",
  "9.5%": "nine and a half percent", "12%.": "twelve percent", "6": "six",
};

// ── synthesized timings ────────────────────────────────────────────────────────────────────────
// ★★ CALIBRATED AGAINST A REAL TAKE (V10's fw_words.json — V11's measurement): word 0.135 +
// 0.029 × chars (cap 0.50), ~0.01 inter-word, sentence breath ~0.40.
const wordDur = (w) => Math.min(0.50, 0.135 + 0.029 * w.replace(/[^A-Za-z0-9$%&]/g, "").length);
const durOf = (w) => (SPOKEN[w] ? SPOKEN[w].split(/\s+/).reduce((a, x) => a + wordDur(x) + 0.01, 0) : wordDur(w));
const GAP_WORD = 0.01, GAP_SENT = 0.30, GAP_SCENE = 0.06;   // V12's calibration (its synthetic landed within 3% of the real take)

const LEAD = 0;

const words = [];
const sceneSent = [];
let t = LEAD, prevScene = null;
for (const s of SENT) {
  if (prevScene && s.sc !== prevScene) t += GAP_SCENE;
  prevScene = s.sc;
  const idx = [];
  for (const w of s.t.split(/\s+/)) {
    const a = t, b = t + durOf(w);
    idx.push(words.length);
    words.push({ word: w, at: Math.round(a * FPS), end: Math.round(b * FPS), scene: s.sc, sec: { t: w, a, b } });
    t = b + GAP_WORD;
  }
  t += GAP_SENT;
  sceneSent.push({ scene: s.sc, hero: !!s.hero, idx, text: s.t });
}

const lastWordEnd = words[words.length - 1].end;
// ★ SPONSORED (the brief): the long end-card disclaimer holds ≥ 6 s on screen and ≥ 3 s after the voice ends — a 100-f tail (V33)
// ★ REVISION 2 (13 Oct 2026, the sponsor's compliance check): the end card runs ≥ 10 s and ≥ 4 s past the voice, and its
//   second card (forward-looking information + the Qualified Person) takes the hold — 6 s after the last word.
const END_HOLD = 75;   // V38 (not sponsored): the brand holds ~2.5 s after the CTA, as V36
const TOTAL = lastWordEnd + END_HOLD;
const ids = [...new Set(SENT.map((s) => s.sc))];
const firstWordOf = {};
words.forEach((w, i) => { if (!(w.scene in firstWordOf)) firstWordOf[w.scene] = i; });
const SCENES = ids.map((id, i) => {
  if (i === 0) return { id, index: 0, startFrame: 0 };
  const fi = firstWordOf[id];
  const gap = words[fi].at - words[fi - 1].end;
  return { id, index: i, startFrame: words[fi].at - Math.min(8, Math.max(1, Math.floor(gap / 2))) };
});
SCENES.forEach((s, i) => (s.endFrame = i + 1 < SCENES.length ? SCENES[i + 1].startFrame : TOTAL));
const LAST_END = {};
words.forEach((w) => { LAST_END[w.scene] = w.end; });

// ★ the hook runs subtitle-free; chips resume exactly as the second scene begins
const BANNER_END = SCENES[1].startFrame;   // the scene after the hook, whatever it is called

const EVENTS = [];
for (const s of sceneSent) {
  const ws = s.idx.map((i) => words[i]);
  if (s.hero) {
    EVENTS.push({ kind: "hero", scene: s.scene, at: ws[0].at, words: ws, last: ws[ws.length - 1] });
  } else {
    for (let k = 0; k < ws.length; k += MAX_CHUNK) {
      const chunk = ws.slice(k, k + MAX_CHUNK);
      EVENTS.push({
        kind: "chip", scene: s.scene, at: chunk[0].at,
        text: chunk.map((w) => w.word).join(" "), endAudio: chunk[chunk.length - 1].end,
        parts: chunk.map((w) => ({ word: w.word, at: w.at })),
      });
    }
  }
}
EVENTS.sort((a, b) => a.at - b.at);
const audioEnd = (e) => (e.kind === "hero" ? e.last.end : e.endAudio);
EVENTS.forEach((e, i) => {
  e.paint = e.kind === "hero"
    ? Math.max(e.at - HERO_LEAD, i > 0 ? audioEnd(EVENTS[i - 1]) + 1 : 0)
    : e.at;
});
const FADE = 9, MIN_HOLD = 12;
const TICKER = [], HEROES = [];
for (let i = 0; i < EVENTS.length; i++) {
  const e = EVENTS[i], next = EVENTS[i + 1];
  const nextShows = next ? next.paint : TOTAL;
  if (e.kind === "hero") {
    let end = Math.min(nextShows, Math.max(e.at + 14, Math.min(e.last.at + 28, nextShows)));
    if (!next) end = TOTAL;
    if (next && next.kind === "hero" && end - FADE - e.last.at < MIN_HOLD) {
      end = Math.max(end, Math.min(e.last.at + MIN_HOLD + FADE, next.at + 12, e.last.at + 28));
      next.paint = Math.max(next.paint, end);
    }
    HEROES.push({
      scene: e.scene, start: e.at, paint: e.paint, end,
      words: e.words.map((w) => ({ word: w.word, at: w.at })),
    });
  } else {
    TICKER.push({ word: e.text, at: e.at, until: Math.min(e.endAudio + 4, nextShows), parts: e.parts });
  }
}

{
  const spans = [
    ...TICKER.map((x) => ({ a: x.at, b: x.until })),
    ...HEROES.map((h) => ({ a: h.paint, b: h.end })),
  ].sort((x, y) => x.a - y.a);
  for (let i = 1; i < spans.length; i++)
    if (spans[i].a < spans[i - 1].b) throw new Error("TWO CAPTIONS AT ONCE @" + spans[i].a);
}
{
  const clash = HEROES.filter((h) => h.paint < BANNER_END);
  if (clash.length) throw new Error("HERO IN THE SUBTITLE-FREE HOOK @" + clash[0].paint);
}

const ts = `// AUTO-GENERATED by scratchpad/captions.js (SYNTHETIC timings — no VO yet) — DO NOT EDIT.
export type SceneId = ${ids.map((i) => `"${i}"`).join(" | ")};
export type Scene = { id: SceneId; index: number; startFrame: number; endFrame: number };
export type Word = { word: string; at: number; until?: number; parts?: { word: string; at: number }[] };
export type Hero = { scene: SceneId; start: number; paint: number; end: number; words: Word[] };

export const FPS = ${FPS};
export const TOTAL_FRAMES = ${TOTAL};
export const VO_END_FRAME = ${lastWordEnd};
/** ★ 0 while the timings are SYNTHETIC. captions_vo.js publishes the real lead when the take
 *  lands, so Composition.tsx imports the same name either way and never needs editing.
 *  ⚠ The VO <Audio> MUST be wrapped in <Sequence from={VO_LEAD}>. */
export const VO_LEAD = 0;
/** ★ the hook is subtitle-free; chips resume here — the setup's first frame. Never hand-type it. */
export const BANNER_END = ${BANNER_END};

export const SCENES: Scene[] = ${JSON.stringify(SCENES)};
/** ★★ ONE ENTRY PER SPOKEN SENTENCE — the grid every visual scene boundary snaps to. */
export const SENTENCES: { scene: SceneId; at: number; end: number; hero: boolean; text: string }[] = ${JSON.stringify(
  sceneSent.map((s) => ({
    scene: s.scene,
    at: words[s.idx[0]].at,
    end: words[s.idx[s.idx.length - 1]].end,
    hero: s.hero,
    text: s.text,
  })),
)};
export const TICKER: Word[] = ${JSON.stringify(TICKER)};
export const HEROES: Hero[] = ${JSON.stringify(HEROES)};
export const WORDS: Word[] = ${JSON.stringify(words.map((w) => ({ word: w.word, at: w.at })))};
export const LAST_WORD_END: Record<SceneId, number> = ${JSON.stringify(LAST_END)};

export const sceneById = (id: SceneId): Scene => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error("no scene " + id);
  return s;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9$%&]/g, "");
const ALL: Word[] = WORDS;
const SCENE_OF: string[] = ${JSON.stringify(words.map((w) => w.scene))};

export const wordFrame = (scene: SceneId, word: string, occ = 1): number => {
  const n = norm(word);
  let seen = 0;
  for (let i = 0; i < ALL.length; i++) {
    if (SCENE_OF[i] !== scene) continue;
    if (norm(ALL[i].word) === n && ++seen === occ) return ALL[i].at;
  }
  throw new Error("wordFrame: no \\"" + word + "\\" (#" + occ + ") in " + scene);
};

export const heroAt = (f: number): Hero | undefined =>
  HEROES.find((h) => f >= h.paint && f < h.end);
`;
fs.writeFileSync("src/bnx/captions.ts", ts);
fs.writeFileSync("scratchpad/syn_words.json",
  JSON.stringify({ words: words.map((w) => w.sec) }));
console.log(`SYNTHETIC captions: ${words.length} words · ${sceneSent.length} sentences · ${TICKER.length} chips · ${HEROES.length} heroes`);
console.log(`scenes: ${SCENES.map((s) => `${s.id}@${s.startFrame}`).join(" ")}`);
console.log(`subtitle-free hook: frame 0 → ${BANNER_END} (${(BANNER_END / FPS).toFixed(1)}s)`);
console.log(`TOTAL ${TOTAL}f = ${(TOTAL / FPS).toFixed(1)}s · assertions PASSED`);
