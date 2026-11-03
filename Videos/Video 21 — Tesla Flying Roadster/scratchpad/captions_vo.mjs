// VIDEO 14 — captions and cue frames FROM THE TAKE (never from the written script).
//   · the real take: scratchpad/fw_words.json (fw.py on public/vo_trimmed.wav), when it exists;
//   · until then: scratchpad/syn_words.json (synth.mjs — the corrected script at the demo take's measured pace).
// Writes src/tsla/captions.ts: the chips (≤ 4 words, never across a sentence — Style 3), the question's words for the
// tracking text, every sentence (the render guard reads them), each section's span, and the named cues the scenes
// hang on, each pointed at the word the voice says it on.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SCRIPT_TEXT, WHISPER } from "./script.mjs";
import { norm as normG } from "./guard.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30;
/** the voice starts this many frames in, so the hook's bars are already rising before the first word */
const VO_LEAD = 8;
const REAL = fs.existsSync(path.join(here, "fw_words.json"));
const raw = JSON.parse(fs.readFileSync(path.join(here, REAL ? "fw_words.json" : "syn_words.json"), "utf8")).words;

// ── the take's own audio (real take only): 10 ms RMS in dB. Whisper LOCATES a word; the audio TIMES it (root CLAUDE.md,
// VO pipeline step 6) ──
const HOP = 0.01;
const wavPath = path.join(here, "..", "public", "vo_trimmed.wav");
const dbAt = (() => {
  if (!REAL) return null;
  if (!fs.existsSync(wavPath)) throw new Error("real take but no public/vo_trimmed.wav to time it from — refusing");
  const wav = fs.readFileSync(wavPath);
  let o = 12, fmt = null, data = null;
  while (o + 8 <= wav.length) {
    const id = wav.toString("ascii", o, o + 4), sz = wav.readUInt32LE(o + 4);
    if (id === "fmt ") fmt = { ch: wav.readUInt16LE(o + 10), sr: wav.readUInt32LE(o + 12), bits: wav.readUInt16LE(o + 22) };
    if (id === "data") data = wav.subarray(o + 8, o + 8 + sz);
    o += 8 + sz + (sz % 2);
  }
  if (!fmt || !data || fmt.bits !== 16) throw new Error("vo_trimmed.wav: expected 16-bit PCM");
  return (t) => { const i0 = Math.floor(t * fmt.sr), nn = Math.floor(HOP * fmt.sr); let sum = 0, c = 0;
    for (let i = i0; i < i0 + nn; i++) for (let k = 0; k < fmt.ch; k++) { const off = (i * fmt.ch + k) * 2; if (off < 0 || off + 2 > data.length) continue; const v = data.readInt16LE(off) / 32768; sum += v * v; c++; }
    return 10 * Math.log10(sum / Math.max(1, c) + 1e-12); };
})();

// ── transcript fixes (the known whisper classes) ─────────────────────────────────────────────
const words = [];
for (let i = 0; i < raw.length; i++) {
  const w = { ...raw[i] };
  const n = raw[i + 1];
  // "7" + "%", "1" + ".2" — and (Video 4's take) "$37" + ".7", "$29 | .8", "$8 | .5": the dollar sign stays on the front
  if (n && /^\$?\d+$/.test(w.t) && /^(%|\.\d+%?[.,]?)$/.test(n.t)) {
    w.t = w.t + n.t; w.b = n.b; i++;
    // Video 12's take: "3 | .7 | %?" — THREE tokens, the percent sign (with the question's mark) on its own
    const n2 = raw[i + 1];
    if (/^\$?\d+\.\d+$/.test(w.t) && n2 && /^%[.,?!]*$/.test(n2.t)) { w.t = w.t + n2.t; w.b = n2.b; i++; }
  }
  // Video 10's take: whisper splits THOUSANDS too — "$40 | ,000", "$2 | ,500", "$400 | ,000.", "$360 | ,000."
  else if (n && /^\$?\d+$/.test(w.t) && /^,\d{3}[.,?!]?$/.test(n.t)) { w.t = w.t + n.t; w.b = n.b; i++; }
  // the script's spelling, not whisper's (Video 14's script spells "data centers", so the old "centres" respelling is gone)
  w.t = w.t.replace(/^J\.?\s?P\.?\s?Morgan/i, "JPMorgan").replace(/^high\s?bandwidth/i, "high-bandwidth")
    // Video 9's take: whisper lower-cased the merger's name ("its sprint merger")
    .replace(/^sprint(?=[.,?!]?$)/, "Sprint")
    // Video 16's take: whisper capitalised "Bandage" ("its Welly Bandage brand") — the script's lowercase
    .replace(/^Bandage$/, "bandage")
    // Video 21's take: whisper lower-cased the car's name ("its new roadster") and heard "robotaxis" as "Robotaxes"
    .replace(/^roadster(?=[.,?!]?$)/, "Roadster").replace(/^robotaxes(?=[.,?!]?$)/i, "robotaxis");
  words.push(w);
}
// Video 16's take: whisper wrote "U | .S." — two tokens, rejoined (".S." would otherwise end a sentence)
for (let i = 0; i < words.length - 1; i++) {
  if (/^U$/.test(words[i].t) && /^\.S\.?$/.test(words[i + 1].t)) { words[i].t = "U.S."; words[i].b = words[i + 1].b; words.splice(i + 1, 1); }
}
// "J.P." / "JP" split across two tokens
for (let i = 0; i < words.length - 1; i++) {
  if (/^J\.?P\.?$/i.test(words[i].t) && /^Morgan/i.test(words[i + 1].t)) { words[i].t = "JPMorgan" + words[i + 1].t.slice(6); words[i].b = words[i + 1].b; words.splice(i + 1, 1); }
}
// ★ THE REAL TAKE (2026-09-26): whisper wrote "J | .P. | Morgan," — THREE tokens, and ".P." ends a sentence, so every
// JPMorgan line split in two. Also merged here: the money it spelled in words (the captions show digits), "high |
// bandwidth", "thirty | -one", "S | &P", and "make it its scale" (the voice says "at scale").
const tokN = (w) => (w ? w.t.toLowerCase().replace(/[^a-z0-9&]/g, "") : "");
const trail = (w) => (w.t.match(/[.,?!]+$/) ?? [""])[0];
const merge = (i, n, t) => { const last = words[i + n - 1]; words[i] = { t: t + trail(last), a: words[i].a, b: last.b }; words.splice(i + 1, n - 1); };
// Video 7: whisper may spell this script's numbers in words or digits — each is merged to the form the captions show
// ("7,819", "31%", "9%", "250", "500", "October 6th", "S&P 500")
const PHRASES = [
  // Video 16: the numbers the script spells, in case whisper writes them in words (the captions show digits)
  [["october", "nineteenth"], "October 19th"], [["fiftyone", "percent"], "51%"], [["fifteen", "percent"], "15%"],
];
// (whisper splits a figure in two: "199" | ",000" — root CLAUDE.md, OffCamCelebs 028 — joined back before anything indexes the words)
for (let i = 0; i < words.length - 1; i++) {
  if (/^\d+$/.test(words[i].t) && /^,\d{3}/.test(words[i + 1].t)) { merge(i, 2, words[i].t + words[i + 1].t.replace(/[.?!]+$/, "").replace(/,$/, "")); i--; }
}
for (let i = 0; i < words.length; i++) {
  for (const [seq, t] of PHRASES) if (seq.every((s, k) => tokN(words[i + k]) === s)) { merge(i, seq.length, t); break; }
}
// a merged phrase with a space in it ("1.052 trillion") goes back to separate words, its time shared out evenly
for (let i = 0; i < words.length; i++) {
  const parts = words[i].t.split(" ");
  if (parts.length < 2) continue;
  const { a, b } = words[i], d = (b - a) / parts.length;
  words.splice(i, 1, ...parts.map((t, k) => ({ t, a: +(a + k * d).toFixed(3), b: +(a + (k + 1) * d).toFixed(3) })));
}
// "N billion dollars" / "N trillion dollars" → "$N billion" (whisper's standing form, 018) and "N percent" → "N%"
for (let i = 0; i < words.length - 1; i++) {
  const n = words[i].t.replace(/^\$/, "");
  if (/^\d[\d,.]*$/.test(n) && /^(billion|trillion)$/i.test(tokN(words[i + 1]))) {
    // two words stay two words (a cue finds "1052"; the script check splits on spaces): "$" onto the number, and a
    // trailing "dollars" folded into the unit, keeping its punctuation
    words[i].t = `$${n}`;
    if (tokN(words[i + 2]) === "dollars") { words[i + 1] = { t: words[i + 1].t.replace(/[.,?!]+$/, "") + trail(words[i + 2]), a: words[i + 1].a, b: words[i + 2].b }; words.splice(i + 2, 1); }
  } else if (/^\d+(\.\d+)?$/.test(n) && /^percent$/i.test(tokN(words[i + 1]))) merge(i, 2, `${n}%`);
}
// ★ Video 14's take: whisper wrote the percent sign as its OWN token ("22 | %", "4 | %", "350 | %") — joined back onto its number
for (let i = 0; i < words.length - 1; i++) {
  if (/^\d+(\.\d+)?$/.test(words[i].t) && /^%[.,?!]*$/.test(words[i + 1].t)) merge(i, 2, `${words[i].t}%`);
}
// ★ Video 5's take: whisper JOINED "share back" into "shareback" ("When NVIDIA buys a shareback, it destroys it.") — split back
// into the script's two words, the time shared (the pie's travel anchors on "buys a share back")
for (let i = 0; i < words.length; i++) {
  const m = words[i].t.match(/^(share)(back)([.,?!]*)$/i);
  if (!m) continue;
  const { a, b } = words[i], mid = +(a + (b - a) * 0.55).toFixed(3);
  words.splice(i, 1, { t: m[1], a, b: mid }, { t: m[2] + m[3], a: mid, b });
}
// ★ Video 12's take: whisper heard "A raise smaller than inflation" as "Arrays smaller…" — split back into the script's two words,
// the time shared (the teach's cue "raise" hangs on it)
for (let i = 0; i < words.length; i++) {
  if (!(/^arrays$/i.test(words[i].t) && /^smaller$/i.test(words[i + 1]?.t ?? ""))) continue;
  const { a, b } = words[i], mid = +(a + (b - a) * 0.3).toFixed(3);
  words.splice(i, 1, { t: "A", a, b: mid }, { t: "raise", a: mid, b });
}
if (words.some((w) => /^arrays$/i.test(w.t))) throw new Error("a stray \"Arrays\" (whisper's \"A raise\") is left in the transcript — refusing");
// whisper splits a hyphenated compound off its first half ("10 | -year") — rejoined
for (let i = 0; i < words.length - 1; i++) {
  if (/^-[a-z]/i.test(words[i + 1].t)) { merge(i, 2, words[i].t + words[i + 1].t.replace(/[.,?!]+$/, "")); i--; }
}
// ★ Video 10's take RAN ON two pairs of the script's sentences: "Same budget, smaller house." and "So be honest, would you buy a home
// at 7 % or wait?". The script's own punctuation is restored (the sentence beat lays out "Same budget." / "Smaller house.", and the
// question is its own sentence with its comma): the WORDS and their times are the take's, only the stops are the script's.
for (let i = 0; i < words.length - 1; i++) {
  if (/^budget,$/i.test(words[i].t) && /^smaller$/i.test(words[i + 1].t) && /^same$/i.test(words[i - 1]?.t ?? "")) { words[i].t = "budget."; words[i + 1].t = "Smaller"; }
  if (/^honest,$/i.test(words[i].t) && /^would$/i.test(words[i + 1].t) && /^be$/i.test(words[i - 1]?.t ?? "")) { words[i].t = "honest."; words[i + 1].t = "Would"; }
  // Video 11's take: "So be honest, is the biggest bank in America bracing for something? Or is this nothing?" — the script's stops are
  // "So be honest." and ONE question "Is the biggest bank in America bracing for something, or is this nothing?" (the tracking text lays
  // out its 13 words)
  if (/^honest,$/i.test(words[i].t) && /^is$/i.test(words[i + 1].t) && /^be$/i.test(words[i - 1]?.t ?? "")) { words[i].t = "honest."; words[i + 1].t = "Is"; }
  if (/^something\?$/i.test(words[i].t) && /^or$/i.test(words[i + 1].t) && /^is$/i.test(words[i + 2]?.t ?? "")) { words[i].t = "something,"; words[i + 1].t = "or"; }
  if (/^7%$/.test(words[i].t) && /^or$/i.test(words[i + 1].t) && /^wait\?$/i.test(words[i + 2]?.t ?? "")) words[i].t = "7%,";
  // Video 12: "So be honest, did your raise beat 3.7%?" — the script's stop after "honest" (the question is its own sentence)
  if (/^honest,$/i.test(words[i].t) && /^did$/i.test(words[i + 1].t) && /^be$/i.test(words[i - 1]?.t ?? "")) { words[i].t = "honest."; words[i + 1].t = "Did"; }
  // "These are averages, your own raise…" — the script's two sentences
  if (/^averages,$/i.test(words[i].t) && /^your$/i.test(words[i + 1].t)) { words[i].t = "averages."; words[i + 1].t = "Your"; }
  // Video 13's take: whisper ran two of the script's sentence pairs together — "…29,000 jobs, and weekly numbers…" and "…end the
  // streak, so be honest." — split back to the script's sentences (each its own caption, and the question's lead-in its own line)
  if (/^jobs,$/i.test(words[i].t) && /^and$/i.test(words[i + 1].t) && /^weekly$/i.test(words[i + 2]?.t ?? "")) { words[i].t = "jobs."; words[i + 1].t = "And"; }
  if (/^streak,$/i.test(words[i].t) && /^so$/i.test(words[i + 1].t) && /^be$/i.test(words[i + 2]?.t ?? "")) { words[i].t = "streak."; words[i + 1].t = "So"; }
  if (/^hiring$/i.test(words[i].t) && /^or$/i.test(words[i + 1].t) && /^just$/i.test(words[i + 2]?.t ?? "")) words[i].t = "hiring,";
  // Video 14's take ran three of the script's sentence pairs together — "…from a year earlier, and the makers…", "…are slowing, but it
  // doesn't…" and "So be honest, would you…" (the last handled above) — split back to the script's sentences; and the script's commas
  // ("Apple fell 4%, and Samsung", "your next phone, or keep")
  if (/^earlier,$/i.test(words[i].t) && /^and$/i.test(words[i + 1].t) && /^the$/i.test(words[i + 2]?.t ?? "")) { words[i].t = "earlier."; words[i + 1].t = "And"; }
  if (/^slowing,$/i.test(words[i].t) && /^but$/i.test(words[i + 1].t) && /^it$/i.test(words[i + 2]?.t ?? "")) { words[i].t = "slowing."; words[i + 1].t = "But"; }
  if (/^4%$/.test(words[i].t) && /^and$/i.test(words[i + 1].t) && /^samsung$/i.test(words[i + 2]?.t ?? "")) words[i].t = "4%,";
  if (/^phone$/i.test(words[i].t) && /^or$/i.test(words[i + 1].t) && /^keep$/i.test(words[i + 2]?.t ?? "")) words[i].t = "phone,";
  // Video 15's take: "So, be honest." (whisper's comma after "So" — the script's stop stays) and the question without its comma:
  // "…still a rocket company or an AI company?" — the script's comma restored ("…a rocket company, or an AI company?")
  if (/^company$/i.test(words[i].t) && /^or$/i.test(words[i + 1].t) && /^an$/i.test(words[i + 2]?.t ?? "")) words[i].t = "company,";
  // Video 16's take: "Now the honest part." and "…a warning or a wave…" — the script's commas restored
  if (/^now$/i.test(words[i].t) && /^the$/i.test(words[i + 1].t) && /^honest$/i.test(words[i + 2]?.t ?? "")) words[i].t = "Now,";
  if (/^warning$/i.test(words[i].t) && /^or$/i.test(words[i + 1].t) && /^a$/i.test(words[i + 2]?.t ?? "")) words[i].t = "warning,";
  // Video 21's take ran two of the script's sentence pairs together — "…over other cars, and Elon Musk…" and "…until 2028, and no merger
  // terms…" — split back to the script's sentences; "…comes next. Robotaxis, robots…" gets the script's colon back; "Then," loses
  // whisper's comma; "compressed | air" is the script's "compressed-air"; "under one second" shows its digit
  if (/^cars,$/i.test(words[i].t) && /^and$/i.test(words[i + 1].t) && /^elon$/i.test(words[i + 2]?.t ?? "")) { words[i].t = "cars."; words[i + 1].t = "And"; }
  if (/^2028,$/.test(words[i].t) && /^and$/i.test(words[i + 1].t) && /^no$/i.test(words[i + 2]?.t ?? "")) { words[i].t = "2028."; words[i + 1].t = "And"; }
  if (/^next\.$/i.test(words[i].t) && /^robotaxis,$/i.test(words[i + 1].t)) { words[i].t = "next:"; words[i + 1].t = "robotaxis,"; }
  if (/^then,$/i.test(words[i].t) && /^compressed$/i.test(words[i + 1].t)) words[i].t = "Then";
  if (/^compressed$/i.test(words[i].t) && /^air$/i.test(words[i + 1].t)) { merge(i, 2, "compressed-air"); }
  if (/^one$/i.test(words[i].t) && /^second\.$/i.test(words[i + 1]?.t ?? "") && /^under$/i.test(words[i - 1]?.t ?? "")) words[i].t = "1";
}
{
  const left = words.filter((w) => /^\.?P\.?$|^&P$|^-[a-z]|^\.S\.?$|^%[.,?!]*$|^\.\d|^,\d/i.test(w.t));
  if (left.length) throw new Error(`transcript tokens left unmerged: ${left.map((w) => w.t).join(" ")} — refusing`);
}

// ── the take must read as the script (spoken-normalised; a real take's wording differences are REPORTED) ──
const normTok = (s) => s.toLowerCase().replace(/[^a-z0-9&]/g, "");
const spokenNums = (s) => WHISPER.reduce((t, [spoken, written]) => t.split(spoken).join(written), s);
const scriptToks = spokenNums(SCRIPT_TEXT).split(/\s+/).map(normTok).filter(Boolean);
const takeToks = words.map((w) => normTok(w.t)).filter(Boolean);
{
  // longest common subsequence → how much of the script the take says, in order
  const A = scriptToks, B = takeToks, m = A.length, n = B.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const share = dp[0][0] / m;
  console.log(`take vs script: ${(share * 100).toFixed(1)}% of the script's words, in order (${REAL ? "REAL take" : "SYNTHETIC take"})`);
  if (share < 0.85) throw new Error("the take does not read as this script (< 85% in order) — wrong file, or the script changed; refusing");
}

// ── sentences ───────────────────────────────────────────────────────────────────────────────
const sents = [];
let cur = [];
// ("U.S." ends in a stop but never a sentence: the take's "…listed in the U.S. since 2022…" is one sentence)
for (const w of words) { cur.push(w); if (/[.?!]$/.test(w.t) && w.t !== "U.S.") { sents.push(cur); cur = []; } }
if (cur.length) sents.push(cur);
const text = (s) => s.map((w) => w.t).join(" ");

// ── the hold after the hook (Bankers/CLAUDE.md §2.5.1: "add some waiting time on the first scene") ──
// Cut the take in the silence after the hook's LAST sentence; everything after plays VO_GAP frames late.
// On a real take the cut comes from the WAVEFORM (the demo's lesson: whisper's word ends are loose) and refuses a cut
// outside silence; on the synthetic take it is the midpoint of the pause.
// (It was 36 f while the brief's hook exit was a crane that had to cross the caption band with no chip showing.)
// ★ 12 f (Timur, 2026-09-29: the transition into the "On Friday" scene was "awkward, long, and rigid"): the hook exit no
// longer waits for a crane, so the hold is a breath, and the camera is still settling as the voice resumes
const VO_GAP = 36; // Video 21: the payoff (the line-up driving off empty) reads in the full frame ≥ 1 s before the exit follows the Roadster out
// the hook ends on the sentence before "On October 8th, the average 30-year mortgage rate…" — counted, not assumed
// (a take can merge the hook's sentences; Video 1's did)
const HOOK_SENTENCES = sents.findIndex((s) => /outside waco/i.test(text(s)));
if (HOOK_SENTENCES < 1) throw new Error("the hook's end (the sentence before \"On October 15, outside Waco…\") was not found — refusing");
const hookEnd = sents[HOOK_SENTENCES - 1].at(-1), nextWord = sents[HOOK_SENTENCES][0];
let CUT_S;
if (REAL) {
  let sil = null;
  for (let t = hookEnd.b; t < hookEnd.b + 1.5; t += HOP) if ([0, 1, 2, 3].every((j) => dbAt(t + j * HOP) < -50)) { sil = t; break; }
  if (sil === null) throw new Error("no silence after the hook — refusing to cut");
  // ★ the next line starts where the audio reaches SPEECH level (−30 dB), never on a breath (root CLAUDE.md, VO pipeline step 6).
  // The second take (2026-10-01) breathes in the pause at −38 to −45 dB: a −40 threshold read the breath as the line, and the
  // cut, placed half way to it, sat 3 dB above the silence test and was refused.
  let onset = null;
  for (let t = sil; t < sil + 2; t += HOP) if (dbAt(t) > -30) { onset = t; break; }
  if (onset === null) throw new Error("no onset after the hook's pause — refusing to cut");
  // the cut goes on the QUIETEST frame boundary in the pause (a Sequence cuts on frames): the loudest 10 ms within ±20 ms of it
  // must be under −48 dB, or there is no clean place to cut and the generator refuses
  const loudAround = (t) => Math.max(...[-2, -1, 0, 1].map((j) => dbAt(t + j * HOP)));
  let best = null;
  for (let fb = Math.ceil(sil * FPS); fb / FPS < onset - 0.05; fb++) { const l = loudAround(fb / FPS); if (!best || l < best.l) best = { fb, l }; }
  if (!best || best.l > -48) throw new Error(`no frame in the hook's pause is quiet enough to cut on (best ${best?.l.toFixed(1)} dB) — refusing`);
  CUT_S = best.fb / FPS;
  console.log(`hook cut at ${CUT_S.toFixed(3)} s (loudest within ±20 ms: ${best.l.toFixed(1)} dB; speech resumes ${onset.toFixed(2)} s)`);
  if (nextWord.a > onset + 0.05) { console.log(`onset fix: "${nextWord.t}" ${nextWord.a}s → ${onset.toFixed(2)}s (measured)`); nextWord.a = +onset.toFixed(2); }
  // ★ THE SILENCE SNAP (root CLAUDE.md, VO pipeline step 4/6): whisper starts a word after a pause EARLY — inside the pause.
  // A word whose claimed start sits in silence (< −45 dB for 30 ms) moves to the first 10 ms where the audio rises above
  // −35 dB, searched only up to its own claimed end, so it can never move onto another word.
  let snapped = 0;
  for (const w of words) {
    if (![0, 1, 2].every((j) => dbAt(w.a + j * HOP) < -45)) continue;
    let on = null;
    for (let t = w.a; t < Math.min(w.b, w.a + 0.6); t += HOP) if (dbAt(t) > -35) { on = t; break; }
    if (on !== null && on - w.a >= 0.03) { w.a = +on.toFixed(3); snapped++; }
  }
  console.log(`silence snap: ${snapped} words moved to their measured onset`);
  // ★ …AND THE OTHER WAY (Video 4's take, 2026-10-01): whisper can start a word after a pause LATE, inside speech that
  // already began ("Micron's" at 24.96 s; its "My-" is audible from 24.80, 5 frames before the chip went up). For every
  // word after punctuation (where a chip starts), walk back from its claimed start while the audio is speech, to the pause
  // before it; the word starts where that pause ends. Never onto the previous word (its claimed end + 30 ms is the floor,
  // root CLAUDE.md V31), never more than 0.3 s; a walk that finds no pause leaves the word alone.
  let early = 0;
  for (let i = 1; i < words.length; i++) {
    const w = words[i], prev = words[i - 1];
    if (!/[.,?!]$/.test(prev.t)) continue;
    const quiet = (t) => [0, 1, 2].every((j) => dbAt(t - j * HOP) < -45);
    let t = w.a - HOP;
    while (t > prev.b + 0.03 && t > w.a - 0.3 && !quiet(t)) t -= HOP;
    if (!quiet(t)) continue;
    let on = null;
    for (let u = t; u < w.a; u += HOP) if (dbAt(u) > -35) { on = u; break; }
    if (on !== null && w.a - on >= 0.05) { console.log(`  early onset: "${w.t}" ${w.a.toFixed(2)} → ${on.toFixed(2)} s (measured)`); w.a = +on.toFixed(3); early++; }
  }
  console.log(`late-start fix: ${early} words moved back to their measured onset`);
} else {
  CUT_S = Math.floor(((hookEnd.b + nextWord.a) / 2) * FPS) / FPS;
}
const VO_CUT = Math.round(CUT_S * FPS);
const fr = (s) => Math.round(s * FPS) + VO_LEAD + (s > CUT_S ? VO_GAP : 0);

// ── the question (tracking text) and the chips ─────────────────────────────────────────────────
const qIdx = sents.findIndex((s) => /still a car company/i.test(text(s)) && /\?$/.test(s.at(-1).t));
if (qIdx < 0) throw new Error("the closing question was not found in the take");
const hero = sents[qIdx].map((w) => ({ word: w.t, at: fr(w.a) }));
const chips = [];
/** a take that joins two sentences with a comma ("…than they did in 2008, yet stocks are…") still breaks its chips at the
 *  comma: a chip never spans two clauses when each side has ≥ 3 words (a short opener like "On Friday," stays attached) */
const clauses = (s) => {
  const out = [];
  let cur = [];
  s.forEach((w, i) => {
    cur.push(w);
    if (/,$/.test(w.t) && cur.length >= 3 && s.length - (i + 1) >= 3) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  return out;
};
sents.flatMap((s, si) => (si === qIdx ? [] : clauses(s))).forEach((s) => {
  for (let i = 0; i < s.length; i += 4) {
    let part = s.slice(i, i + 4);
    // never leave a lone word on its own chip at a sentence's end: fold it into the previous chip (≤ 5 then)
    if (i + 4 < s.length && s.length - (i + 4) === 1) { part = s.slice(i, i + 5); i += 1; }
    // (Video 3) a figure never leaves its unit: "$1.052 | trillion" → the number moves to the next chip
    else if (i + 4 < s.length && /^\$[\d.,]+$/.test(part.at(-1).t) && /^(billion|trillion)/i.test(s[i + 4].t) && part.length > 2) { part = s.slice(i, i + 3); i -= 1; }
    // (Video 4's second take) a chip never ENDS on a bare conjunction: "in sales and | $37.7 billion…" → "in sales | and $37.7
    // billion in profit." — the "and" leads the next chip
    if (part.length > 1 && i + part.length < s.length && /^(and|but|or)$/i.test(part.at(-1).t)) { part = part.slice(0, -1); i -= 1; }
    chips.push({ word: text(part), at: fr(part[0].a), lastEnd: fr(part.at(-1).b), parts: part.map((w) => ({ word: w.t, at: fr(w.a) })) });
  }
});
chips.sort((a, b) => a.at - b.at);
chips.forEach((c, i) => { const next = chips[i + 1]?.at ?? Infinity; c.until = Math.min(next, c.lastEnd + 12); delete c.lastEnd; });

// ── sentences, sections, cues ───────────────────────────────────────────────────────────────
const SENTENCES = sents.map((s) => ({ text: text(s), at: fr(s[0].a), end: fr(s.at(-1).b) }));
const toks = words.map((w) => normTok(w.t));
const find = (re, occ = 1, from = 0) => {
  let k = 0;
  for (let i = 0; i < words.length; i++) if (words[i].a >= from && re.test(toks[i]) && ++k === occ) return fr(words[i].a);
  throw new Error(`cue not found: ${re} #${occ}`);
};
const sentAt = (re) => { const s = SENTENCES.find((x) => re.test(x.text)); if (!s) throw new Error(`sentence not found: ${re}`); return s; };
/** each section runs from its first sentence to its last (by the sentence that opens the next section) */
const SECT_OPEN = {
  hook: /^tesla built a car/i, what: /outside waco/i, teach: /strange part/i, honest: /honest part/i,
  question: /^so,? be honest/i,
};
const opens = Object.entries(SECT_OPEN).map(([id, re]) => [id, sentAt(re).at]);
const SECT = Object.fromEntries(opens.map(([id, at], i) => {
  const nextAt = opens[i + 1]?.[1];
  const inSect = SENTENCES.filter((s) => s.at >= at && (nextAt === undefined || s.at < nextAt));
  return [id, { at, end: inSect.at(-1).end }];
}));
/** ★ which of the brief's lines the take says — each divergence's OWN pattern, on the guard's own normalisation (one copy:
 *  divergences.json). An object that would draw a figure the voice contradicts reads this (root CLAUDE.md, 014/018). */
const SAYS_BRIEF = (() => {
  const doc = JSON.parse(fs.readFileSync(path.join(here, "..", "src", "tsla", "divergences.json"), "utf8"));
  const all = normG(SENTENCES.map((s) => s.text).join(" "));
  return Object.fromEntries(doc.divergences.map((d) => [d.id, new RegExp(d.pattern, "i").test(all)]));
})();
for (const [id, on] of Object.entries(SAYS_BRIEF)) if (on) console.log(`⚠ the take says the BRIEF's line "${id}" — the guard blocks the master`);
// every cue is the WORD the voice says it on (normTok: lowercase, letters/digits/& only — "$1.052" → "1052", "12%" → "12")
const after = (re, occ = 1) => { let k = 0; const w = words.find((x) => re.test(normTok(x.t)) && ++k === occ); if (!w) throw new Error(`anchor not found: ${re}`); return w.a; };
const CUE = {
  // hook: "Tesla built a car that jumps over other cars. And Elon Musk calls it the best of the last human-driven cars."
  tesla: find(/^tesla$/), built: find(/^built$/), car: find(/^car$/), jumps: find(/^jumps$/), over: find(/^over$/), cars: find(/^cars$/),
  elon: find(/^elon$/), musk: find(/^musk$/), calls: find(/^calls$/), best: find(/^best$/), last: find(/^last$/),
  human: find(/^humandriven$/), driven: find(/^cars$/, 2),
  // what happened: "On October 15, outside Waco, Texas, Tesla showed off its new Roadster. It climbed an upside-down ramp, flipped in mid-air
  // and landed on its wheels. Then compressed-air thrusters, developed with SpaceX, lifted it over a row of other Teslas. Tesla says it goes
  // from 0 to 60 in under 1 second."
  october: find(/^october$/), d15: find(/^15$/), waco: find(/^waco$/), texas: find(/^texas$/), showed: find(/^showed$/),
  roadster: find(/^roadster$/), climbed: find(/^climbed$/), upside: find(/^upsidedown$/), ramp: find(/^ramp$/), flipped: find(/^flipped$/),
  midair: find(/^midair$/), landed: find(/^landed$/), wheels: find(/^wheels$/), compressed: find(/^compressedair$/),
  thrusters: find(/^thrusters$/), developed: find(/^developed$/), spacex: find(/^spacex$/), lifted: find(/^lifted$/), row: find(/^row$/),
  teslas: find(/^teslas$/), says: find(/^says$/), zero: find(/^0$/), sixty: find(/^60$/), under: find(/^under$/), second: find(/^second$/),
  // the teach: "Here's the strange part. Even Musk says the Roadster may not move Tesla's revenue much. And Tesla's car business is shrinking.
  // From July to September, deliveries fell 2%, and profit fell 43%. Yet Tesla is worth about $1.6 trillion. Investors aren't paying for the
  // cars Tesla sells today. They're paying for what Musk says comes next: robotaxis, robots, and maybe SpaceX. Musk has said both companies
  // set up committees to look at a possible merger."
  strange: find(/^strange$/), even: find(/^even$/), roadsterB: find(/^roadster$/, 2), revenue: find(/^revenue$/), much: find(/^much$/),
  business: find(/^business$/), shrinking: find(/^shrinking$/), july: find(/^july$/), deliveries: find(/^deliveries$/), p2: find(/^2$/),
  profit: find(/^profit$/), p43: find(/^43$/), yet: find(/^yet$/), worth: find(/^worth$/), t16: find(/^16$/), trillion: find(/^trillion$/),
  investors: find(/^investors$/), paying: find(/^paying$/), today: find(/^today$/), next: find(/^next$/), robotaxis: find(/^robotaxis$/),
  robots: find(/^robots$/), maybe: find(/^maybe$/), spacexB: find(/^spacex$/, 2), committees: find(/^committees$/), merger: find(/^merger$/),
  // the honest part: "Now, the honest part. The FAA says the Roadster doesn't meet its definition of an aircraft. Production isn't planned
  // until 2028. And no merger terms have been agreed."
  honest: find(/^honest$/), faa: find(/^faa$/), definition: find(/^definition$/), aircraft: find(/^aircraft$/),
  production: find(/^production$/), y2028: find(/^2028$/), terms: find(/^terms$/), agreed: find(/^agreed$/),
  // question: "So be honest. Is Tesla still a car company? Tell us below."
  beHonest: find(/^honest$/, 2), still: find(/^still$/), company: find(/^company$/), tellUs: find(/^tell$/),
};
const VO_END = fr(words.at(-1).b);
/** the close after the voice — the film's length lives HERE, once: Video.tsx, mkbed.mjs and bedenv.mjs all read it */
// STYLE §1.5's 96 f (Video 10: the script runs ~70 s of voice inside the brief's HARD 80-s cap; if the real take runs long it is
// FITTED before any word is cut — vo_fit.py, then this hold — root CLAUDE.md, 023)
const TAIL = 96;

const out = `// ★ GENERATED by scratchpad/captions_vo.mjs FROM THE ${REAL ? "REAL TAKE (fw_words.json)" : "SYNTHETIC TAKE (syn_words.json — provisional until Timur's VO lands)"} — do not edit.
export type Word = { word: string; at: number; until?: number; parts?: { word: string; at: number }[] };
/** true until the real take is wired — the handback says so */
export const SYNTHETIC = ${!REAL};
/** the voice starts this many frames in */
export const VO_LEAD = ${VO_LEAD};
/** the take is cut at VO_CUT (a frame of the WAV, in the pause after the hook) and the rest plays VO_GAP frames late */
export const VO_CUT = ${VO_CUT};
export const VO_GAP = ${VO_GAP};
export const CHIPS: Word[] = ${JSON.stringify(chips)};
/** the closing question, word by word, for the tracking text */
export const HERO: Word[] = ${JSON.stringify(hero)};
/** every sentence the voice says, as transcribed (the render guard reads this) */
export const SENTENCES: { text: string; at: number; end: number }[] = ${JSON.stringify(SENTENCES)};
export const SECT = ${JSON.stringify(SECT)} as const;
export const CUE = ${JSON.stringify(CUE)} as const;
/** which brief lines the take says (the guard's own patterns) — objects that draw a contradicted figure read this */
export const SAYS_BRIEF = ${JSON.stringify(SAYS_BRIEF)} as const;
export const VO_END = ${VO_END};
export const TOTAL_FRAMES = ${VO_END + TAIL};
`;
fs.writeFileSync(path.join(here, "..", "src", "tsla", "captions.ts"), out);
console.log(`${SENTENCES.length} sentences · ${chips.length} chips · question at ${hero[0].at} · voice ends ${VO_END} (${(VO_END / FPS).toFixed(1)} s) · hook cut at ${VO_CUT}`);
console.log("sections:", Object.entries(SECT).map(([k, v]) => `${k} ${v.at}–${v.end}`).join(" | "));
