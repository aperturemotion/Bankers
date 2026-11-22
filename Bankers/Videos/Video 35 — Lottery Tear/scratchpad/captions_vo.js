// VO captions for STYLE 3 · VIDEO 45 — "4 Tech Companies Just Spent Two Apollo Programs in a Year" — regenerates src/bnx/captions.ts.
// ★ V46 take 1 (2026-11-01): generated in ElevenLabs (Jon - Calm Presence, eleven_v4) from VO_SCRIPT.txt, 104.4 s raw, sped x1.04,
//   trimmed to 96.2 s (0.30-s pauses, three 0.50-s holds: scratchpad/vo_hold.json).
// ★ V45 take 1 (2026-10-31): generated in ElevenLabs (Jon - Calm Presence, eleven_v4) from VO_SCRIPT.txt, 92.8 s raw, sped x1.04
//   (atempo, pitch kept), trimmed to 84.1 s with three 0.50-s holds (the two flares, the punch flash: scratchpad/vo_hold.json).
//   python scratchpad/vo_trim.py && python scratchpad/fw.py && node scratchpad/captions_vo.js
// ★ V41 take 1 (2026-10-23): generated in ElevenLabs (Jon - Calm Presence, eleven_v4) from VO_SCRIPT.txt, 102.3 s raw, natural pace,
//   trimmed to 98.7 s (0.30-s pauses, four 0.50-s holds: scratchpad/vo_hold.json). Its words are ElevenLabs Scribe's on the RAW take,
//   shifted through the trim map (scratchpad/vo/shiftwords.py): this session cannot fetch the whisper model.
//   python scratchpad/vo_trim.py && python scratchpad/vo/shiftwords.py && node scratchpad/captions_vo.js
// ★ V39 take 1 (2026-10-19): generated in ElevenLabs (Jon - Calm Presence, eleven_v4) from VO_SCRIPT.txt, 104.8 s raw, stretched
//   1.05x, then trimmed with four 0.50-s holds (two flares, two breaks: scratchpad/vo_hold.json).
// (V38's notes follow.)
// ★ V38 take 1 (2026-10-14, …T17_11_23…): 103.4 s raw → 95.6 s trimmed, four 0.50-s holds (the two flares, the two breaks:
//   scratchpad/vo_hold.json). Read word for word from VO_SCRIPT.txt, the corrected line ("so it's very hard to pick") included.
//   python scratchpad/vo_trim.py && python scratchpad/fw.py && node scratchpad/captions_vo.js
//   (silences.txt first: ffmpeg silencedetect=noise=-40dB:d=0.10 on public/vo_trimmed.wav)
//
// THE TAKE (2026-10-12, ElevenLabs "Jon – Calm Presence", sp110, file …T15_05_51…): 127.6 s raw → 112.5 s trimmed at native
// 44.1 kHz with three 0.50 s holds (scratchpad/vo_hold.json): the hook's lens flare and the two light breaks. Read from
// VO_SCRIPT.txt word for word, all four corrected lines as corrected and the sign-off in (step 0, checked against the raw
// transcript). Whisper splits figures ("$6" ",000.", "$1" ".1", "S" "&P", "7" ",800"): the suffix merge below joins them.
//
// ★ V33: THE SCRIPT'S LINES ARE THE SENTENCES. The episode config (src/bnx/episode.json `script`) carries every line with its
//   scene and hero flag, and the composition reads sentences by index per scene (sen("hook", 2)…). So the transcript is
//   ALIGNED to those lines, word by word, instead of being split at whisper's punctuation (whisper ran "…that price, and
//   for more than 40 years…" and "Your phone, your car, every AI data center." together). The alignment THROWS on any
//   word the take changed: a re-record that rephrases cannot silently mis-assign a scene.
//   · display words take the SCRIPT's token (its punctuation and the film's spelling: centre, metres, kilometres, tonnes)
//     wherever the take says the same word; a number the voice says in WORDS ("eight") shows as the voice said it.
//   · times are the take's (whisper locates each word; the silence snap and the waveform onsets below time it).
// ⚠ TOKEN NOTES — suffix merges: "S"+"&P", "50"+"%", "2"+".37"+"%", "13"+".1", "3"+".89%.", "gladiatormetals"+".com.".
const fs = require("fs");

const FPS = 30;
const HERO_LEAD = 5;
const MAX_CHUNK = 4;

const RAW = JSON.parse(fs.readFileSync("scratchpad/fw_words.json", "utf8")).words;
const W = [];
for (const w of RAW) {
  const suffix = /^[-.,%]/.test(w.t) || (/^&/.test(w.t) && w.t.length > 1);
  if (W.length && suffix) {
    W[W.length - 1].t += w.t;
    W[W.length - 1].b = w.b;
    W[W.length - 1].merged = true;
  } else {
    W.push({ ...w });
  }
}
// ── the measured pauses ─────────────────────────────────────────────────────────────────────────
const GAPS = (() => {
  const txt = fs.readFileSync("scratchpad/silences.txt", "utf8");
  const starts = [...txt.matchAll(/silence_start: ([\d.]+)/g)].map((m) => parseFloat(m[1]));
  const ends = [...txt.matchAll(/silence_end: ([\d.]+)/g)].map((m) => parseFloat(m[1]));
  const g = starts.map((s, i) => [s, ends[i]]).filter(([a, b]) => b > a && b - a >= 0.10);
  if (!g.length) throw new Error("silences.txt parsed to ZERO pauses — format changed");
  return g;
})();

// ── the silence snap — move a word whose claimed span OVERLAPS a real pause onto the pause's end. ⚠ Test span OVERLAP,
// not "does the word start inside the gap".
{
  let snapped = 0;
  for (let i = 0; i < W.length; i++) {
    const w = W[i];
    // ★ V34: a MERGED token ("$6" + ".71.") is two spoken pieces, and the voice may pause BETWEEN them ("six … seventy-one").
    //   Its first piece starts where whisper says; snapping the whole token to the pause's end put "$6.71" 1 s late.
    if (w.merged) continue;
    const g = GAPS.find(([a, b]) => w.a < b && w.b > a && b - a >= 0.12 && b > w.a + 0.05);
    if (!g) continue;
    const [, gEnd] = g;
    if (gEnd >= w.b - 0.04) continue;
    if (gEnd - w.a <= 0.05) continue;
    const was = w.a;
    w.a = gEnd;
    if (i > 0 && W[i - 1].b > w.a) W[i - 1].b = w.a;
    snapped++;
    console.log(`    snap "${w.t}" ${was.toFixed(2)} → ${gEnd.toFixed(2)}s`);
  }
  console.log(`  silence snap: ${GAPS.length} pauses, ${snapped} words moved to their real onset`);
}

// ══════════════════════════════════════════════════════════════════════════════════════════════
// ★ THE ALIGNMENT — transcript words onto the script's lines
// ══════════════════════════════════════════════════════════════════════════════════════════════
const SCRIPT = JSON.parse(fs.readFileSync("src/bnx/episode.json", "utf8")).script;
const normW = (s) => s.toLowerCase().replace(/[^a-z0-9$%&]/g, "");
// the same word in two spellings (the film is written in British English; whisper writes American)
const SPELL = { center: "centre", kilometers: "kilometres", meters: "metres", tons: "tonnes",
  // V34: the voice says "Brothers" for the written "Bros."; whisper drops the possessive of "Warner's studios"
  brothers: "bros", warner: "warners",
  // V37: whisper writes the decades as digits; the read says "Limited" for the written "Ltd."
  "60s": "sixties", "70s": "seventies", limited: "ltd",
  // V38: "Miss twenty…", "Miss forty…" — the read runs "miss" into the T of "twenty"/"forty" and whisper writes "Missed"; the
  //   caption keeps the script's word
  missed: "miss",
  // V39: whisper drops the possessive of "the soda company's stock", and writes the voice's "October sixth" as "6"
  company: "companys", "6": "6th", "16": "16th",
  // V46: whisper drops the possessive of "Intel's stock" on the trimmed take, and writes the voice's "October twenty-ninth" as "29th"
  intel: "intels", "29th": "29",
  // V35 (recovered): the voice says "November fourth" for the written "Nov 4"; whisper writes "4th"
  "4th": "4",
  // V35 (recovered): whisper writes "towards" for the script's "toward"
  towards: "toward" };
// ★ V44: words whisper MISHEARS on this take, in the window where it does (seconds on the trimmed take) — the script's word shows
const HEARD = [];   // V45: none (V44 had "with/ads" for "what/adds")
// a number written as digits on one side and as a word on the other is the SAME spoken word (whisper writes "four" on one
// pass and "4" on the next): the caption keeps the script's form
const NUMW = { fourteen: "14", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10", hundred: "100" };
const same = (s, t, at) => {
  const a = normW(s), b = normW(t);
  if (at !== undefined && HEARD.some((h) => h.take === b && h.script === a && at >= h.a && at <= h.b)) return "script";
  if (a === b) return "script";
  if (SPELL[b] === a) return "script";
  if (NUMW[a] === b || NUMW[b] === a) return "script";
  return null;
};
const aligned = [];   // { word, a, b, line }
{
  let k = 0;
  SCRIPT.forEach((line, li) => {
    const toks = line.take.split(/\s+/);
    for (let ti = 0; ti < toks.length; ti++) {
      const tok = toks[ti];
      const t = W[k];
      // ★ V37: whisper JOINS a two-word name into one ("Northshore" for the script's "North Shore"). When the take's word
      //   spells this script word and the next one, both are shown, splitting the take word's span by their lengths.
      if (t && !same(tok, t.t) && toks[ti + 1] && normW(tok + toks[ti + 1]) === normW(t.t)) {
        const nxt = toks[ti + 1], cut = t.a + (t.b - t.a) * (normW(tok).length / normW(t.t).length);
        console.log(`    align: "${t.t}" → "${tok} ${nxt}" (a joined name)`);
        aligned.push({ word: tok, a: t.a, b: cut, line: li });
        aligned.push({ word: nxt, a: cut, b: t.b, line: li });
        ti++; k++;
        continue;
      }
      if (!t) throw new Error(`ALIGN: the take ends before line ${li} ("${line.take}") at "${tok}"`);
      // ★ take 2 (2026-10-07): whisper SPLITS a hyphenated compound into two words ("best case" for the script's
      //   "best-case"). When the next two take words spell the script's compound, they are one word, timed across both.
      if (!same(tok, t.t) && tok.includes("-") && W[k + 1] && normW(t.t + W[k + 1].t) === normW(tok)) {
        console.log(`    align: "${t.t} ${W[k + 1].t}" → "${tok}" (a split compound)`);
        aligned.push({ word: tok, a: t.a, b: W[k + 1].b, line: li });
        k += 2;
        continue;
      }
      // ★ V37: whisper spells a percentage out ("0.3" "percent." for the script's "0.3%,"): two take words, one script word
      if (!same(tok, t.t) && W[k + 1] && /^percent/i.test(W[k + 1].t) && normW(t.t) + "%" === normW(tok)) {
        console.log(`    align: "${t.t} ${W[k + 1].t}" → "${tok}" (a spelled-out percent)`);
        aligned.push({ word: tok, a: t.a, b: W[k + 1].b, line: li });
        k += 2;
        continue;
      }
      const how = same(tok, t.t, t.a);
      if (!how)
        throw new Error(`ALIGN: line ${li} expects "${tok}", the take says "${t.t}" @${t.a.toFixed(2)}s — the take changed; re-read the transcript\n` +
          `  take: …${W.slice(Math.max(0, k - 5), k + 6).map((x) => x.t).join(" ")}…`);
      // the voice's word in the script's punctuation when the voice said it differently
      const punct = (tok.match(/[.,?!;:]+$/) || [""])[0];
      const word = how === "script" ? tok : t.t.replace(/[.,?!;:]+$/, "") + punct;
      if (how !== "script" || normW(tok) !== normW(t.t)) console.log(`    align: "${t.t}" → "${word}"`);
      aligned.push({ word, a: t.a, b: t.b, line: li });
      k++;
    }
  });
  if (k !== W.length) throw new Error(`ALIGN: ${W.length - k} take words left over after the last line: ${W.slice(k).map((x) => x.t).join(" ")}`);
  console.log(`  alignment: ${aligned.length} words onto ${SCRIPT.length} lines — every word matched`);
}

// ★ WHISPER LOCATES A LINE; THE AUDIO TIMES IT. Each LINE's first word takes its onset from the waveform: from whisper's
// time, walk back to the pause before it (≤ 0.6 s, never past the previous word's onset), then forward to the first
// 10 ms block above the speech level.
// ★ V33: only where a PAUSE was found walking back. A line the narrator ran straight on from the last ("…that price, and
//   for more than…") has no pause before it, and the walk would have stopped on the previous word and pulled the line's
//   start onto it (CLAUDE.md, V31). Moves over 0.3 s are refused and logged.
{
  const buf = fs.readFileSync("public/vo_trimmed.wav");
  let o = 12, data = null, sr = 44100;
  while (o < buf.length - 8) {
    const id = buf.toString("ascii", o, o + 4), n = buf.readUInt32LE(o + 4);
    if (id === "fmt ") { sr = buf.readUInt32LE(o + 12); if (buf.readUInt16LE(o + 22) !== 16 || buf.readUInt16LE(o + 10) !== 1) throw new Error("onsets: vo_trimmed.wav is not 16-bit mono"); }
    if (id === "data") { data = new Int16Array(buf.buffer.slice(buf.byteOffset + o + 8, buf.byteOffset + o + 8 + n)); break; }
    o += 8 + n + (n % 2);
  }
  if (!data) throw new Error("onsets: no data chunk in vo_trimmed.wav");
  const B = Math.round(sr / 100), nb = Math.floor(data.length / B), db = new Float64Array(nb);
  for (let k = 0; k < nb; k++) { let s = 0; for (let i = k * B; i < (k + 1) * B; i++) s += (data[i] / 32768) ** 2; db[k] = 10 * Math.log10(s / B + 1e-18); }
  const SPEECH = -30, SIL = -40;
  let moved = 0, ranOn = 0;
  for (let i = 1; i < aligned.length; i++) {
    if (aligned[i].line === aligned[i - 1].line) continue;
    const w = aligned[i], prev = aligned[i - 1];
    const k = Math.round(w.a * 100), floor = Math.ceil(prev.a * 100) + 1;
    let j = k;
    while (j > floor && j > k - 60 && db[j] > SIL) j--;
    if (db[j] > SIL) { ranOn++; continue; }          // no pause before this line: the read ran on — leave whisper's time
    while (j < nb - 1 && db[j] < SPEECH) j++;
    const real = j / 100;
    if (Math.abs(real - w.a) < 0.034) continue;
    // ★ V36: the audio is the authority up to 0.5 s (CLAUDE.md, OffCamCelebs 025 onsets.py): "Selling" began 0.40 s before whisper
    if (Math.abs(real - w.a) > 0.5) { console.log(`    onset REFUSED "${w.word}": whisper ${w.a.toFixed(2)} → audio ${real.toFixed(2)}s`); continue; }
    if (real <= prev.a) { console.log(`    onset REFUSED "${w.word}": ${real.toFixed(2)}s is at or before the previous word`); continue; }
    // ★ V35: a soft first word ("The" before "price", zero-length in whisper) can sit under the speech level, so the first
    //   block above it is the SECOND word's. Never move a line's start onto or past its own next word.
    const nxt = aligned[i + 1];
    if (nxt && nxt.line === w.line && real >= nxt.a) { console.log(`    onset REFUSED "${w.word}": ${real.toFixed(2)}s is at or past the line's next word (${nxt.a.toFixed(2)}s)`); continue; }
    console.log(`    onset "${w.word}" ${w.a.toFixed(2)} → ${real.toFixed(2)}s`);
    w.a = real;
    if (prev.b > real) prev.b = real;
    moved++;
  }
  console.log(`  audio onsets: ${moved} line starts moved to the waveform · ${ranOn} lines the read ran straight on (left alone)`);
}

const LEAD = 0;
const words = aligned.map((w) => ({ word: w.word, at: Math.round(w.a * FPS) + LEAD, end: Math.round(w.b * FPS) + LEAD, line: w.line }));
for (let i = 1; i < words.length; i++)
  if (words[i].at < words[i - 1].at) throw new Error(`word order: "${words[i].word}" @${words[i].at} before "${words[i - 1].word}" @${words[i - 1].at}`);

const sceneSent = SCRIPT.map((line, li) => ({ scene: line.scene, hero: !!line.hero, idx: words.map((w, i) => (w.line === li ? i : -1)).filter((i) => i >= 0) }));
const ids = [];
for (const l of SCRIPT) if (!ids.includes(l.scene)) ids.push(l.scene);
const sceneOf = words.map((w) => SCRIPT[w.line].scene);

const lastWordEnd = words[words.length - 1].end;
// ★ V38 (2026-10-15, "Look at the bob video as a complete style reference"): Bob's end card holds 2.5 s past the voice (75 f).
//   The 180-f hold was the sponsored V37's compliance tail, carried over in the clone; V38 has no disclaimer card.
const END_HOLD = 75;
const TOTAL = lastWordEnd + END_HOLD;
const firstWordOf = {};
words.forEach((w, i) => { if (!(sceneOf[i] in firstWordOf)) firstWordOf[sceneOf[i]] = i; });
const SCENES = ids.map((id, i) => {
  if (i === 0) return { id, index: 0, startFrame: 0 };
  const fi = firstWordOf[id];
  const gap = words[fi].at - words[fi - 1].end;
  return { id, index: i, startFrame: words[fi].at - Math.min(8, Math.max(1, Math.floor(gap / 2))) };
});
SCENES.forEach((s, i) => (s.endFrame = i + 1 < SCENES.length ? SCENES[i + 1].startFrame : TOTAL));
const LAST_END = {};
words.forEach((w, i) => { LAST_END[sceneOf[i]] = w.end; });

const EVENTS = [];
for (const s of sceneSent) {
  const ws = s.idx.map((i) => words[i]);
  if (s.hero) {
    EVENTS.push({ kind: "hero", scene: s.scene, at: ws[0].at, words: ws, last: ws[ws.length - 1] });
  } else {
    // ★ BALANCED chunks (V27): the same number of chunks, sizes as even as possible
    const nC = Math.ceil(ws.length / MAX_CHUNK), base = Math.floor(ws.length / nC), extra = ws.length % nC;
    for (let c = 0, k = 0; c < nC; c++) {
      const size = base + (c < extra ? 1 : 0);
      const chunk = ws.slice(k, k + size);
      k += size;
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
    if (!next) end = TOTAL;                    // a short ends ON its CTA
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
    ...TICKER.map((t) => ({ a: t.at, b: t.until })),
    ...HEROES.map((h) => ({ a: h.paint, b: h.end })),
  ].sort((x, y) => x.a - y.a);
  for (let i = 1; i < spans.length; i++)
    if (spans[i].a < spans[i - 1].b) throw new Error("TWO CAPTIONS AT ONCE @" + spans[i].a);
}

const ts = `// AUTO-GENERATED by scratchpad/captions_vo.js from the REAL take (aligned to episode.json's lines) — DO NOT EDIT.
export type SceneId = ${ids.map((i) => `"${i}"`).join(" | ")};
export type Scene = { id: SceneId; index: number; startFrame: number; endFrame: number };
export type Word = { word: string; at: number; until?: number; parts?: { word: string; at: number }[] };
export type Hero = { scene: SceneId; start: number; paint: number; end: number; words: Word[] };

export const FPS = ${FPS};
export const TOTAL_FRAMES = ${TOTAL};
export const VO_END_FRAME = ${lastWordEnd};
/** ★ the frame the narration STARTS on. The VO audio MUST be mounted in a
 *  <Sequence from={VO_LEAD}>: shifting the word timings alone moves the captions and leaves
 *  the voice at frame 0, which is exactly the desync this constant exists to prevent. */
export const VO_LEAD = ${LEAD};

export const SCENES: Scene[] = ${JSON.stringify(SCENES)};
/** ★ the hook is subtitle-free; chips resume here — the second scene's first frame. Never hand-type it. */
export const BANNER_END = ${SCENES[1].startFrame};
/** ★★ ONE ENTRY PER SCRIPT LINE (episode.json), timed by the take. */
export const SENTENCES: { scene: SceneId; at: number; end: number; hero: boolean; text: string }[] = ${JSON.stringify(
  sceneSent.map((x) => ({
    scene: x.scene,
    at: words[x.idx[0]].at,
    end: words[x.idx[x.idx.length - 1]].end,
    hero: x.hero,
    text: x.idx.map((i) => words[i].word).join(" "),
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
const SCENE_OF: string[] = ${JSON.stringify(sceneOf)};

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
console.log(`VO captions: ${words.length} words · ${TICKER.length} chips · ${HEROES.length} heroes`);
console.log(`scenes: ${SCENES.map((s) => `${s.id}@${s.startFrame}`).join(" ")}`);
console.log(`TOTAL ${TOTAL}f = ${(TOTAL / FPS).toFixed(1)}s · VO ends ${lastWordEnd} · alignment PASSED`);
