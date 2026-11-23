// Structural audit for STYLE 3 · VIDEO 30 (Americans feel worse than 2008; stocks near a record) — cloned from V29's, re-pointed.
//   node scratchpad/audit.mjs
//
//   1. ONE caption entity at a time, frame by frame
//   2. no dead frames (a beat or a hero covers every frame)
//   3. every FIELD FLIP lands in a transcript silence
//   4. no beat leaves before its own last spoken word (named exceptions only)
//   5. retention: scene lengths
//   6. ★ THE BANNER CONTRACT — up from frame 0, no hero under it, clears with the reveal
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(here, "..", p), "utf8");
const cap = read("src/bnx/captions.ts");
const grab = (marker) => {
  const i = cap.indexOf(marker);
  if (i < 0) throw new Error("cannot find " + marker);
  const j = cap.indexOf("= [", i) + 2;
  let d = 0;
  for (let k = j; k < cap.length; k++) {
    if (cap[k] === "[") d++;
    else if (cap[k] === "]") { d--; if (!d) return JSON.parse(cap.slice(j, k + 1)); }
  }
};
const SCENES = grab("export const SCENES");
const TICKER = grab("export const TICKER");
const HEROES = grab("export const HEROES");
const TOTAL = Number(cap.match(/TOTAL_FRAMES = (\d+)/)[1]);
const BANNER_END = Number(cap.match(/BANNER_END = (\d+)/)[1]);
// ★ THE REAL TAKE'S word spans. ⚠ This used to read syn_words.json, which meant that once the
// VO landed every silence check was still being run against the SYNTHETIC timings — i.e. against
// pauses that do not exist in the audio anyone will hear.
const WORDSRC = fs.existsSync("scratchpad/fw_words.json") ? "scratchpad/fw_words.json" : "scratchpad/syn_words.json";
if (WORDSRC.includes("syn")) console.log("⚠ SYNTHETIC timings (no VO yet) — silences are the generator's, not a real take's");
const FW = JSON.parse(read(WORDSRC)).words
  .map((w) => ({ t: w.t, a: Math.round(w.a * 30), b: Math.round(w.b * 30) }));
const SILENCE = FW.map((w, i) => [w.b, FW[i + 1] ? FW[i + 1].a : TOTAL]).filter(([a, b]) => b - a >= 4);
const inSilence = (f) => SILENCE.some(([a, b]) => f >= a && f <= b);
const wordAt = (f) => FW.find((w) => w.a <= f && f < w.b);

let fail = 0;
const bad = (m) => { console.log("  ✗ " + m); fail++; };

// ── 1. captions ────────────────────────────────────────────────────────────────────────────────
{
  const spans = [
    ...TICKER.map((t) => ({ a: t.at, b: t.until, w: `chip "${t.word}"` })),
    ...HEROES.map((h) => ({ a: h.paint, b: h.end, w: "hero" })),
  ].sort((x, y) => x.a - y.a);
  let n = 0;
  for (let i = 1; i < spans.length; i++)
    if (spans[i].a < spans[i - 1].b) { bad(`two captions @${spans[i].a}`); n++; }
  const holds = spans.map((s) => s.b - s.a).sort((a, b) => a - b);
  console.log(`1. captions — ${spans.length} entities, ${n} overlaps, hold median ${holds[holds.length >> 1]}f min ${holds[0]}f`);
}

// ── the beat plan, mirrored from Composition.tsx (per-component Beat at/end props) ──────────────
const S = (id) => SCENES.find((s) => s.id === id);
const LAST_END = JSON.parse(cap.match(/LAST_WORD_END(?::[^=]*)? = (\{[^}]*\})/)[1]);
const lastWordEnd = (id) => LAST_END[id];
const WORDS_ALL = grab("export const WORDS");
const SCENE_OF = JSON.parse(cap.match(/const SCENE_OF(?::[^=]*)? = (?:\(\/\* unused pure expression or super \*\/ null && \()?(\[[^\]]*\])/)[1]);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9$%&]/g, "");
const cue = (scene, word, occ = 1) => {
  const n = norm(word);
  let seen = 0;
  for (let i = 0; i < WORDS_ALL.length; i++) {
    if (SCENE_OF[i] !== scene) continue;
    if (norm(WORDS_ALL[i].word) === n && ++seen === occ) return WORDS_ALL[i].at;
  }
  throw new Error(`cue: no "${word}" in ${scene}`);
};
// ★★★ THE BEAT PLAN IS PARSED OUT OF Composition.tsx, NOT MIRRORED BY HAND.
// The hand-maintained mirror was the single most common clone carryover in this project — a
// stale one audits the PREVIOUS structure and reports clean, which is exactly what happened when
// the pacing pass replaced ten beats with twenty-seven and sections 2 and 4 kept checking the old
// nine. Reading the real plan makes that class of failure impossible.
const comp = read("src/bnx/Composition.tsx");
const SEN = grab("export const SENTENCES");
// ★ LEAD is READ from the composition (V25 runs LEAD 0 — the V17 pause rule); a hand-typed copy
// here is exactly the kind of mirror that goes stale on a clone (V12's audit said 8)
const LEAD = Number((comp.match(/^const LEAD = (\d+);/m) ?? [])[1]);
if (!Number.isFinite(LEAD)) throw new Error("audit: could not read LEAD out of Composition.tsx");
const sen = (sc, n) => SEN.filter((s) => s.scene === sc)[n];
const cut = (sc, n) => sen(sc, n).at - LEAD;
const mid = (sc, n, off) => sen(sc, n).at + off;
// ★ a scene can carry TWO heroes (V26's nuance: the opener and the punch) — same signature as the
// composition's own heroPaint(scene, n)
const heroPaint = (sc, n = 0) => HEROES.filter((h) => h.scene === sc)[n].paint;
const heroEnd = (sc, n = 0) => HEROES.filter((h) => h.scene === sc)[n].end;
const PSTART = comp.indexOf("const P = {");
const planSrc = comp.slice(PSTART, comp.indexOf("\n};", PSTART));
const BEATS = [...planSrc.matchAll(/^  (\w+): \{ at: (.+?), end: (.+?) \},?$/gm)].map((m) => {
  // ★ V33: the plan may cut on a WORD inside a sentence (cue / cueAny, the composition's own helpers)
  const cueAny = (sc, ...ws) => { for (const x of ws) { try { return cue(sc, x); } catch { /* the next spelling */ } } throw new Error(`cueAny: none of ${ws.join(" / ")} in ${sc}`); };
  // V35: the plan's close/brand bounds read LAST_WORD_END (the generated captions' own table)
  // V36: the close is planned by the composition's CLOSE_PLAN (ruleHold/close/brand) and RULE_END — READ from it, never retyped
  const CP = JSON.parse((comp.match(/^const CLOSE_PLAN = (\{[^}]*\});$/m) ?? [, "null"])[1].replace(/(\w+):/g, '"$1":'));
  const RULE_END = CP && LAST_END.rule !== undefined ? LAST_END.rule + CP.ruleHold : undefined;
  const ev = (src) => Function("cut", "mid", "w", "cue", "cueAny", "heroPaint", "heroEnd", "LEAD", "BANNER_END", "TOTAL_FRAMES", "LAST_WORD_END", "CLOSE_PLAN", "RULE_END", "return " + src)(
    cut, mid, cue, cue, cueAny, heroPaint, heroEnd, LEAD, BANNER_END, TOTAL, LAST_END, CP, RULE_END);
  return { id: m[1], enter: ev(m[2]), gone: ev(m[3]) };
});
// ⚠ the plan block's own entry count is the proof the parser saw all of it (a plan line it cannot
// parse would otherwise simply vanish from every check below and the audit would report clean)
const declared = (planSrc.match(/^  \w+: \{/gm) ?? []).length;
if (BEATS.length !== declared || BEATS.length < 9)
  bad(`parsed ${BEATS.length} of ${declared} plan entries out of the composition — the plan format changed`);
// which spoken scene each visual scene sits in, for the closing-beat check
for (const b of BEATS) b.scene = (SCENES.find((s) => b.enter >= s.startFrame && b.enter < s.endFrame) ?? SCENES[0]).id;
console.log(`
scenes — ${BEATS.length} visual scenes over ${SCENES.length} spoken scenes`);

// ── 2. dead frames ─────────────────────────────────────────────────────────────────────────────
{
  // ★ V39: a place is on stage from its shot's ENTRANCE (the HO block's enter.at), which can start before the plan's cut: the
  //   reprise descends from the moment the punch card ends. Read off the composition's own HO lines; an entrance written in a
  //   form this reader does not know falls back to the plan's cut (it can only flag MORE dead frames, never hide one).
  const enterAt = {};
  {
    const Pv = Object.fromEntries(BEATS.map((b) => [b.id, { at: b.enter, end: b.gone }]));
    const hoSrc = comp.slice(comp.indexOf("const HO = (() => {"), comp.indexOf("const PLACE_IDS"));
    for (const m of hoSrc.matchAll(/^    (\w+): \{ enter: \{ k: "(\w+)", (.+?) \} as ShotEnter/gm)) {
      const [, id, k, body] = m;
      const ex = body.match(/^at: (.+), dur: \d+$/), af = body.match(/^\.\.\.after\(P\.(\w+)\.at, \d+\)$/),
        cr = body.match(/^\.\.\.crane\(P\.(\w+)\.at\)$/), pn = body.match(/^\.\.\.pan\(P\.(\w+)\.at\)$/);
      try {
        if (ex) enterAt[id] = Function("P", "heroEnd", "heroPaint", "return " + ex[1])(Pv, heroEnd, heroPaint);
        else if (af) enterAt[id] = Pv[af[1]].at - 4;
        else if (cr) enterAt[id] = Pv[cr[1]].at - 20;
        else if (pn) enterAt[id] = Pv[pn[1]].at - 16;
      } catch { /* unknown form: the plan's cut */ }
      void k;
    }
  }
  const onStage = (f) => BEATS.some((b) => f >= Math.min(b.enter, enterAt[b.id] ?? Infinity) && f < b.gone);
  const heroUp = (f) => HEROES.some((h) => f >= h.paint && f < h.end);
  const runs = [];
  let s = null;
  for (let f = 0; f < TOTAL; f++) {
    const dead = !onStage(f) && !heroUp(f);
    if (dead && s === null) s = f;
    if (!dead && s !== null) { runs.push([s, f]); s = null; }
  }
  if (s !== null) runs.push([s, TOTAL]);
  const real = runs.filter(([a, b]) => b - a > 8);
  console.log(`\n2. dead frames — ${runs.length} runs, ${real.length} longer than 8f`);
  for (const [a, b] of real) bad(`nothing on stage and no hero for ${b - a}f @${a}-${b}`);
}

// ── 3. field flips vs the voice ────────────────────────────────────────────────────────────────
{
  console.log("\n3. section breaks vs the voice (each flash RISES over [b − 11, b] — that span must be silence)");
  // ★ the breaks are READ from the composition's own BREAKS line (each peaks on the first word of a
  // named scene) — a hand-kept list here would audit breaks the film no longer has
  const brLine = (comp.match(/^const BREAKS = \[(.*)\];$/m) ?? [])[1];
  // ★ V38 take: an entry may peak a few frames BEFORE its line's first word ("…!.at - 2"): read the offset too
  const ids = brLine ? [...brLine.matchAll(/s\.scene === "(\w+)"\)!?\.at(?: - (\d+))?/g)].map((m) => ({ id: m[1], off: Number(m[2] ?? 0) })) : [];
  if (!ids.length) bad("could not read BREAKS out of Composition.tsx (expected SENTENCES.find(... scene === \"x\")!.at entries)");
  for (const { id, off } of ids) {
    const b = SEN.find((s) => s.scene === id).at - off;
    const rise = [...Array(11)].map((_, k) => b - 11 + k);
    // ★ V28: with a real take, the rise is judged against the MEASURED pauses (silences.txt), not
    // whisper's claimed word spans — whisper stamps a word's start inside the breath before it (the
    // very thing captions_vo.js's silence snap corrects), so a rise that sits wholly in real silence
    // was flagged as crossing "So". The whisper test stays the fallback when no pause file exists.
    const measured = WORDSRC.includes("fw_words") && fs.existsSync("scratchpad/silences.txt")
      ? (() => {
          const t = fs.readFileSync("scratchpad/silences.txt", "utf8");
          const st = [...t.matchAll(/silence_start: ([\d.]+)/g)].map((m) => parseFloat(m[1]) * 30);
          const en = [...t.matchAll(/silence_end: ([\d.]+)/g)].map((m) => parseFloat(m[1]) * 30);
          return st.map((a, i) => [a, en[i]]);
        })()
      : null;
    const inPause = measured && measured.some(([a, e]) => b - 11 >= a - 1 && b <= e + 1);
    const onWord = inPause ? undefined : rise.map(wordAt).find(Boolean);
    const ok = !onWord;
    console.log(`   ${ok ? "✓" : "✗"} break into ${id} peaks @${b}; its rise ${b - 11}–${b} ${ok ? "sits in silence" : `crosses "${onWord.t}"`}`);
    if (!ok) bad(`the break into ${id} rises over the word "${onWord.t}"`);
  }
}

// ── 4. beats vs their own last spoken word ─────────────────────────────────────────────────────
{
  console.log("\n4. scene-closing beats vs their scene's last spoken word");
  const closers = new Map();
  for (const b of BEATS) closers.set(b.scene, b);
  for (const b of closers.values()) {
    if (b.scene === "cta") continue;
    // ★ a scene whose LAST sentence is a hero hands the frame to that hero: the construction must
    // be gone by the hero's paint (spec §4 — nothing mounted under a hero), not by the last word
    // ★ a scene can close on a RUN of heroes (V27's nuance: "So history is a guide." then the punch
    // "It is not a guarantee.") — the construction hands over to the FIRST hero of that run
    const scSen = SEN.filter((s) => s.scene === b.scene);
    if (!scSen.length) continue;   // V36: the close has no spoken line (the house close alone)
    let r = scSen.length - 1;
    while (r > 0 && scSen[r - 1].hero) r--;
    const lastSen = scSen[scSen.length - 1].hero ? scSen[r] : scSen[scSen.length - 1];
    if (lastSen.hero) {
      const h = HEROES.find((x) => x.scene === b.scene && x.start === lastSen.at);
      const ok = h && b.gone <= h.paint + 2 && b.gone >= h.paint - 4;
      console.log(`   ${ok ? "✓" : "✗"} ${b.id.padEnd(9)} hands over to the closing hero at ${h?.paint} (gone ${b.gone})`);
      if (!ok) bad(`${b.id} should end on its scene's closing hero (${h?.paint}), ends ${b.gone}`);
      continue;
    }
    const lastB = lastWordEnd(b.scene);
    const slack = b.gone - lastB;
    const ok = slack >= -4;
    console.log(`   ${ok ? "✓" : "✗"} ${b.id.padEnd(9)} last word ends ${lastB}, gone ${b.gone} (${slack >= 0 ? "+" : ""}${slack}f)`);
    if (!ok) bad(`${b.id} leaves ${-slack}f early`);
  }
}

// ── 5. retention: scene lengths ────────────────────────────────────────────────────────────────
{
  console.log("\n5. scene lengths (manual review > 15s)");
  for (const s of SCENES) {
    const len = ((s.endFrame - s.startFrame) / 30).toFixed(1);
    console.log(`   ${Number(len) > 15 ? "⚠" : " "} ${s.id.padEnd(7)} ${len}s`);
  }
  console.log(`   total ${(TOTAL / 30).toFixed(1)}s`);
}

// ── 6. ★ THE BANNER CONTRACT (this video's whole hook construction) ────────────────────────────
{
  console.log("\n6. the hook gate (the banner itself is removed)");
  const heroUnder = HEROES.filter((h) => h.paint < BANNER_END);
  const ok1 = heroUnder.length === 0;
  console.log(`   ${ok1 ? "✓" : "✗"} no hero sentence before the gate (${heroUnder.length} found)`);
  if (!ok1) bad(`a hero paints at ${heroUnder[0].paint}, before the gate at ${BANNER_END}`);

  const ok2 = BANNER_END === SCENES[1].startFrame;
  console.log(`   ${ok2 ? "✓" : "✗"} the gate is the second scene's first frame (${BANNER_END} / ${SCENES[1].startFrame})`);
  if (!ok2) bad("the hook gate and the second scene's start have drifted apart");

  // ★ THE HOOK'S TWO SPOKEN BEATS (V38) — the brief's two pictures, in its own words: "ten days" (the ten holes in the field,
  // by ~4 s) and "less than half" (the two bars, by ~7 s). Both read with the sound off.
  const said = (re) => WORDS_ALL.find((x, i) => SCENE_OF[i] === "hook" && re.test(norm(x.word)));
  // ★ V42: the hook's two beats are "phone" (SpaceX's bar has shot up, $2.0T, by ~2 s) and "combined" (the carriers' $484B stack is
  //   in, by ~8 s): the 2026-10-25 hook rule, a flat chart readable with the sound off
  // ★ V43: Bob's chart rebuilt on gold — the two beats are "fell" (the head drops off the record, the red fall, by ~1 s) and "even"
  //   (the 28-year bracket reaches 2008, by ~8 s)
  // ★ V45: Bob's chart rebuilt on Big Tech's 12-month spending — the two beats are "Moon" (the head crosses ONE APOLLO, by ~4 s) and
  //   "Twice" (TWO APOLLOS lands, by ~6 s)
  // ★ V46: Bob's chart rebuilt on Intel's price — the two beats are "beat" (the head crosses the 2000 RECORD, NEW RECORD, by ~3 s)
  //   and "single" (the one-day cliff, red, by ~6 s)
  const rec = said(/^beat$/), sep = said(/^single$/);
  if (!rec) bad("the hook never says 'beat' — NEW RECORD has nothing to land on");
  if (!sep) bad('the hook never says "single" — the one-day cliff has nothing to land on');
  const ok3 = rec && rec.at <= 3 * 30 && sep && sep.at <= 6 * 30;
  console.log(`   ${ok3 ? "✓" : "⚠"} the two beats are said: beat at ${rec ? (rec.at / 30).toFixed(1) : "?"}s (≤3s), single at ${sep ? (sep.at / 30).toFixed(1) : "?"}s (≤6s)`);
  if (sep && !ok3) console.log("      → FLAGGED: the read runs the hook long");

  // ★ THE HOOK'S OPENING IS CHIP-FREE, AND SUBTITLES RESUME FOR THE DESCENT (user, 2026-08-30:
  // the split hook — banner + monolith through "basement,", then the depth scene WITH subtitles).
  // Checked against the composition's own filter so the two cannot drift apart.
  const okSubs = comp.includes(`TICKER.filter((t) => t.at >= BANNER_END - 2)`);
  console.log(`   ${okSubs ? "✓" : "✗"} the hook is subtitle-free; chips resume at BANNER_END on a new scene`);
  if (!okSubs) bad("the caption filter has drifted from the subtitle-free-hook contract");
}

// ── 7. ★ THE PACING CONTRACT (user revision, 2026-08-30) ───────────────────────────────────────
// Reads the scene plan straight out of Composition.tsx so it cannot drift from what is mounted.
{
  console.log("\n7. pacing — scene lengths");
  const plan = BEATS.map((b) => ({ id: b.id, at: b.enter, end: b.gone }));

  // the CTA hero deliberately does NOT rack-focus the stage (see the composition), so it is
  // excluded here too — otherwise BrandClose reports 0.1s visible when it is on screen throughout
  const heroSpans = HEROES.filter((h) => h.scene !== "cta").map((h) => [h.paint, h.end]);
  const visible = (a, b) => {
    let v = b - a;
    for (const [x, y] of heroSpans) v -= Math.max(0, Math.min(b, y) - Math.max(a, x));
    return Math.max(0, v);
  };
  let over = 0;
  for (const s of plan) {
    const len = (s.end - s.at) / 30, vis = visible(s.at, s.end) / 30;
    const flag = s.id === "pair" ? "hook" : len > 4.5 ? "⚠" : " ";
    if (flag === "⚠") over++;
    console.log(`   ${flag} ${s.id.padEnd(11)} ${String(s.at).padStart(4)} → ${String(s.end).padStart(4)}   ${len.toFixed(1).padStart(4)}s   visible ${vis.toFixed(1)}s`);
  }
  const bodyScenes = plan.filter((s) => s.id !== "pair");
  const bodyFrames = bodyScenes.reduce((a, s) => a + (s.end - s.at), 0);
  const avg = bodyFrames / bodyScenes.length / 30;
  const avgVis = bodyScenes.reduce((a, s) => a + visible(s.at, s.end), 0) / bodyScenes.length / 30;
  console.log(`\n   ${plan.length} scenes · ${bodyScenes.length} in the body`);
  console.log(`   average body scene ${avg.toFixed(2)}s  (visible ${avgVis.toFixed(2)}s)  — target 2–3s`);
  console.log(`   ${over} scene(s) over 4.5s`);
  // ★ JUDGE THE VISIBLE AVERAGE, NOT THE TOTAL. A beat that spans a hero is on stage for its
  // whole window but SEEN only outside it, so total length over-counts every hero-covered beat
  // and would demand splitting scenes the viewer never gets a clear look at anyway.
  // ⚠ THE TWO CHART SCENES ARE EXEMPT FROM THE AVERAGE, BY STANDING RULE (user, 2026-08-30:
  // "NEVER allow the camera to shift/glitch to a different position instantly"). They used to be
  // split into 3–4 short remounts per chart, and every remount was an instant camera cut — the
  // exact defect the rule bans. One long scene with a continuously eased camera is the compliant
  // form, so their length is a consequence of the smoothness rule, not a pacing failure.
  // ⚠ V26's list — THIS film's staged builds: ONE object across its sentences with a Cam moving
  // between framings on the sentences' own cues, and something new on every sentence (spec §8,
  // V12's wealth-bar / tapes form). Each name here must carry a keyed <Cam> in its component —
  // checked below, so a beat cannot be exempted just by being long. Rebuilt on clone day.
  // (floor spans six transcript sentences, but three are the one-word "Mortgages. / Company debt.
  // / Commercial real estate." — each one lands its own borrower on the floor.)
  // (bets joined on the real take: its betting sentence alone runs 5.8 s — the crowd assembles on
  // "The bond market…", the three stacks build on their own words, the Cam moves between the two)
  // ⚠ V27's list — every beat that stages ONE object across several sentences with its own keyed
  // Cam (the brief's "one distinct visual per beat": a war's path is one tape, the table is one
  // ledger). Section 10 then holds each of them to a new driver at least every 4.5s, so an
  // exemption cannot hide a dead stretch.
  // ★ V28's staged builds: one object with a keyed Cam and a new driver on every sentence (§10)
  // (cents: ONE bill that becomes 100 cents across its two sentences, keyed Cam, a driver per sentence)
  // ★ V30's staged builds (same rule as V29's) — every construction is ONE object carried across its sentences under a keyed
  // Cam (the spine's four builds, the phone, the two months, the bricks, the calendar + board, the
  // strip + rails, the time-lines). §10 still holds each to a new driver at least every 4.5 s.
  // ★ 2026-09-28 (user: one object per screen): the crammed scenes were cut apart — lows, cpi, nasdaq,
  // earnings and hundred are new, each ONE object with its own keyed Cam
  // ★ V33's staged builds: every construction is ONE object with its own keyed Cam (§10 still holds each to a driver)
  // ★ V33 REVISION: the diagrams became real objects — the ingots + gate, the X-ray scanner, cathode stacks, a split-flap
  //   counter, the paper map (2026-10-06: it replaced the aerial belt), the study + archive box, the field case, the scanner, the rig, the core tray, the balance,
  //   the fuel gauge, the honest objects, the LED board, the browser
  // ★ V34's staged builds: ONE object carried across its sentences under a keyed Cam (the hook's camera is a function
  //   slaved to its two bars: CamFn), each with a new driver on every sentence (§10)
  // ★ V35's staged builds: the jaws, the quote board, the coins, the dollar's price tag, the account bars, the company/price
  //   pair, the LED ticker and the receipt — each ONE object across its sentences under a keyed Cam (§10 holds the drivers)
  // ★ V36's staged builds: the hook's line, the savings + climb, the four crashes (one wide line, the camera travelling buy to
  //   buy), the three bars, the new-highs line, the two ways and the record line — each ONE object across its sentences under
  //   its own keyed or slaved Cam (§10 holds the drivers)
  // ★ 2026-10-12 (the balance rewrite, the real take): the stopwatch + hourglass, the pencil sketch and the front pages are each
  //   ONE set of real objects across their sentences under a keyed Cam
  //   (the counter too: on the real take its one sentence holds ~7 s, and its camera moves on "100" and "7,800")
  //   (the vault too: 2026-10-12, "change the visual at 57 seconds" — the door held shut, unlocking and opening on its words)
  // ★ V37's staged builds (2026-10-13, the uranium film): every place that carries its words past ~4 s is ONE object (or one
  //   chart) across its sentences under its own keyed Cam: the two bars, the agreement, the spot line (a following camera),
  //   the map, the years, the holes, the scoreboard, the probe (its camera rides the winch), in-situ recovery, the six plants,
  //   the sample bag + calendar, the honest file and the browser
  // ★ V38's staged builds (2026-10-14): each place that carries its words past ~4.5 s is ONE object or chart across its
  //   sentences under its own keyed or following Cam: the slip, the 20-year line (a following camera), the ladder, the panic
  //   rail, October 2008, the March 2020 blocks, the domino and the field from above
  // ★ V39's staged builds (2026-10-19): the scale, the race line, the LED board, the two bar pairs, the dollar, the vending machine.
  // ★ V41's staged builds (2026-10-23, the Social Security film): every place that carries its words past ~4.5 s is ONE object or
  //   chart across its sentences under its own action camera (riding the action, §11) or a smoothed follow: the cash and the vault
  //   (one world), the five COLA bars, the currency counter, the fund line (a following camera), the cash tank, the two time-card
  //   racks, the salary's cash, the hundred tiles, and the honest label
  // ★ V42's staged builds (2026-10-25, the SpaceX film): the hook chart and the T-Mobile line (smoothed follows of a moving head), the
  //   $10,000 counter, the rent gauge, the LED board and the honest label — each ONE chart or object across its sentences under its
  //   own action camera (§11)
  // ★ V43's staged builds (2026-10-26, the gold film): the hook (Bob's line, a smoothed follow of its head), the bullion scale (the
  //   record and the next day's fall, one object across two sentences), the treasury pair (two sentences, one pair of pay-out units)
  //   and the honest label printer, and (V42's counter/gauge precedent) the one bar chart climbing under a riding camera, the year
  //   counter rolling 1980 → 2025 → 45, and the shop-and-vault two-shot across its two sentences — each ONE chart or object under its
  //   own camera (§11), moving on every frame (§10 holds their drivers)
  // ★ V45's staged builds: the hook (Bob's line), the bill (one place, the camera travelling from the rocket and its pallet into the
  //   hall and its two pallets across two sentences), the twist's fall (the cash pile and the character across two sentences), the cash
  //   waterfall (three sentences, one chart) and the one-in-six bills (two sentences, one object) — each ONE chart or object under its own
  //   camera (§11), moving on every frame (§10 holds their drivers)
  // ★ V46's staged builds: the hook (Bob's line), the record desk (the lamp dims across two sentences), the torn calendar (one wall
  //   calendar across two sentences), the data-center aisle (one place, the camera travelling rack to rack to the pallet), the eight bars (three
  //   sentences, one chart), the worst days (two sentences, one table), the cash pile and the character (two sentences), the $10,000
  //   stacks (two sentences), the ladder (two sentences, one object) and the honest figure (two clauses, one 2026 line) — each ONE chart or object under its own camera (§11)
  const EXEMPT = new Set(["hook", "record", "wait", "comeback", "eight", "worst", "lost", "tenk", "nobody", "honest"]);
  const camOf = {
    hook: ["IntelHook"], record: ["RecordDesk"], wait: ["TearCalendar"], comeback: ["DataAisle"], eight: ["EightBars"], worst: ["WorstDays"], lost: ["LostPile"], tenk: ["TenK"], nobody: ["Ladder"], honest: ["Honest78"],
  };
  for (const id of EXEMPT) if (!camOf[id]) bad(`exempt beat "${id}" names no component to check for a Cam`);
  const allSrc = fs.readdirSync(path.join(here, "..", "src/bnx")).filter((f) => f.endsWith(".tsx"))
    .map((f) => read("src/bnx/" + f)).join("\n");
  for (const [id, comps] of Object.entries(camOf)) {
    for (const c of comps) {
      const i = allSrc.indexOf(`export const ${c}:`);
      if (i < 0) { bad(`exemption for "${id}": component ${c} not found`); continue; }
      const j = allSrc.indexOf("\nexport const ", i + 10);
      const body = allSrc.slice(i, j < 0 ? undefined : j);
      // ★ V35 (2026-10-09, V29's intro): the hook's camera is hookCamAt — slaved to the climbing bar (camA), its pan and crane
      //   keyed on top through camAt — so the body names hookCamAt, not camAt
      const slaved = (id === "pair" && body.includes("const tipY = AXIS - hB")) || (id === "hook" && (body.includes("<CamFn at={cam}>") || body.includes("<CamFn at={(fr) => hookCamAt(t, fr)}>")))

        // ★ V36: a camera that is a module function of the frame (camOf runs its keys through camAt, or a smoothed follow)
        || /<CamFn at=\{\(fr\) => (camOf|hookCamAt|spotCamAt)\(t, fr\)\}>/.test(body)
        // ★ V38: the hook's timeline line's camera is a smoothed follow of its head (CamFn over smoothFollow)
        || (id === "field" && body.includes("<CamFn at={(g) => smoothFollow(g, raw)}>"))
        // ★ V39: a smoothed follow anywhere; the scale's camera function handed to BalanceScale (its CamFn); DuoBars' keyed CamFn
        || body.includes("<CamFn at={(g) => smoothFollow(g, raw)}>")
        || (/^(scale|reprise)$/.test(id) && body.includes("cam={cam}") && allSrc.includes("<CamFn at={cam}>"))
        || (/^(ended|growth)$/.test(id) && body.includes("<DuoBars") && allSrc.includes("<CamFn at={actionCam(shots)}>"))
        // ★★★★ V39 (2026-10-20): THE ACTION CAMERA (actioncam.ts) — a CamFn over actionCam(<its focus list>), in the component's own
        //   body, or (the scale) the actionCam handed to BalanceScale as `cam`
        || /<CamFn at=\{actionCam\(\w+\(t\)\)\}>/.test(body)
        || (/^(scale|reprise)$/.test(id) && /cam=\{(cam|actionCam\(\w+\(t\)\))\}/.test(body) && allSrc.includes("<CamFn at={cam}>"));
      // ★ V33: a camera driven by a function (the match zoom) still counts as keyed when it runs camAt over its keys
      if (!body.includes("<Cam keys") && !(body.includes("<CamFn") && body.includes("camAt(")) && !slaved) bad(`"${id}" is exempted as a staged build but ${c} has no keyed Cam`);
    }
  }
  const paced = bodyScenes.filter((x) => !EXEMPT.has(x.id));
  const avgP = paced.reduce((a2, x) => a2 + visible(x.at, x.end), 0) / paced.length / 30;
  console.log(`   average excl. the staged builds (${[...EXEMPT].join(", ")}) ${avgP.toFixed(2)}s`);
  // ⚠ V12 CALIBRATION: rule 33's own band is "roughly 3–6s of screen time per beat"; V11's
  // 3.2s average gate reflected its shorter sentences (its beats were one construction per
  // sentence at ~7 words each; V12's script runs to 14-word sentences). The gate here is the
  // rule's band: average ≤4.5s AND no paced beat over 7s visible. The 2–3s aspiration stays
  // printed above, and the delta is flagged at handback.
  // ★ ON SYNTHETIC TIMINGS THE AVERAGE IS AN ADVISORY, not a pass/fail: the generator's clock is
  // provisional (V21–V24's real takes ran 1–6% off their synthetic ones) and the take re-times
  // every beat. With a real take (fw_words.json present) it is a hard gate again, as V12 had it.
  if (avgP > 4.5) {
    if (WORDSRC.includes("syn")) console.log(`   ⚠ ADVISORY (synthetic): paced average ${avgP.toFixed(2)}s is over V12's 4.5s gate — re-check on the real take`);
    else bad(`average VISIBLE scene ${avgP.toFixed(2)}s (exempt scenes aside) — over rule 33's band`);
  }
  // ★ V37 REVISION 2: the brand close also carries the sponsor's end cards (≥ 10 s, ≥ 4 s after the voice), so its length is the
  //   compliance requirement, not pacing
  for (const x of paced) if (x.id !== "brand" && visible(x.at, x.end) / 30 > 7) bad(`beat "${x.id}" holds ${(visible(x.at, x.end) / 30).toFixed(1)}s visible — over rule 33's band`);

  // every cut must land on a sentence boundary (or a declared mid-sentence split)
  const starts = new Set(SEN.map((s) => s.at - LEAD));
  const offGrid = bodyScenes.filter((s) => !starts.has(s.at) && !SEN.some((x) => s.at > x.at && s.at < x.end));
  console.log(`   ${offGrid.length === 0 ? "✓" : "✗"} every cut lands on the sentence grid`);
  for (const s of offGrid) bad(`scene "${s.id}" cuts at ${s.at}, which is not a sentence boundary`);
}

// ── 8. ★ SPEC §4 — no construction under a hero, and zero co-visibility between constructions ──
{
  console.log("\n8. heroes own their frames; constructions never share one");
  const heroSpans = HEROES.filter((h) => h.scene !== "cta").map((h) => [h.paint, h.end]);
  let n = 0;
  for (const b of BEATS) {
    if (b.id === "brand") continue;
    for (const [x, y] of heroSpans) {
      const ov = Math.min(b.gone, y) - Math.max(b.enter, x);
      if (ov > 0) { bad(`"${b.id}" is mounted under a hero for ${ov}f (@${Math.max(b.enter, x)})`); n++; }
    }
  }
  const byStart = [...BEATS].sort((a, b) => a.enter - b.enter);
  for (let i = 1; i < byStart.length; i++) {
    const a = byStart[i - 1], b = byStart[i];
    if (b.enter < a.gone) { bad(`"${a.id}" (gone ${a.gone}) and "${b.id}" (enters ${b.enter}) share frames`); n++; }
  }
  console.log(`   ${n === 0 ? "✓" : "✗"} ${BEATS.length} constructions, ${heroSpans.length} heroes, ${n} clash(es)`);
}

// ── 8b. ★ NO TWO HERO CARDS IN A ROW (user, 2026-09-30: "add some sort of animation between 36 seconds and 42 seconds" —
// three cards back to back over an empty stage). Two heroes with no construction visible between them fail. Proven on
// every run by two fixtures: a back-to-back pair must fail, a pair with a beat between must pass.
{
  console.log("\n8b. no two hero cards in a row");
  const runs = (heroes, beats) => {
    const hs = [...heroes].sort((a, b) => a.paint - b.paint), out = [];
    for (let i = 1; i < hs.length; i++) {
      const a = hs[i - 1], b = hs[i];
      const between = beats.some((x) => x.id !== "brand" && x.enter < b.paint && x.gone > a.end);
      if (!between) out.push(`${a.paint}–${a.end} "${a.text}" → ${b.paint}–${b.end} "${b.text}"`);
    }
    return out;
  };
  const fxBad = runs([{ paint: 0, end: 50, text: "A" }, { paint: 50, end: 90, text: "B" }], [{ id: "x", enter: 100, gone: 200 }]);
  const fxOk = runs([{ paint: 0, end: 50, text: "A" }, { paint: 150, end: 190, text: "B" }], [{ id: "x", enter: 52, gone: 148 }]);
  if (fxBad.length !== 1 || fxOk.length !== 0) bad(`8b's own fixtures failed (back-to-back found ${fxBad.length}, with-a-beat found ${fxOk.length}) — the check is broken`);
  const found = runs(HEROES.filter((h) => h.scene !== "cta").map((h) => ({ paint: h.paint, end: h.end, text: h.words.map((w) => w.word).join(" ").slice(0, 40) })), BEATS);
  for (const r of found) bad(`two hero cards in a row: ${r}`);
  console.log(`   ${found.length === 0 ? "✓" : "✗"} ${found.length} back-to-back pair(s) · fixtures ${fxBad.length === 1 && fxOk.length === 0 ? "hold" : "BROKEN"}`);
}

// ── 9. ★ SPEC §2 — white stages are 2–3 designed story beats, not a cadence ────────────────────
{
  // ★ THE WHITE CADENCE (user, 2026-09-25: "more white themed scenes consistently scattered
  // throughout") — about one white construction in three, and no DARK stretch over 30 s. The windows
  // are EVALUATED out of the composition (P, BREAKS, S, cut), so the gate measures real frames.
  const lwStart = comp.indexOf("const LIGHT_WINDOWS: LightWindow[] = [");
  const lw = comp.slice(lwStart, comp.indexOf("];", lwStart));
  const Pm = Object.fromEntries(BEATS.map((b) => [b.id, { at: b.enter, end: b.gone }]));
  const brIds = [...((comp.match(/^const BREAKS = \[(.*)\];$/m) ?? [])[1] ?? "").matchAll(/s\.scene === "(\w+)"\)!?\.at(?: - (\d+))?/g)].map((m) => ({ id: m[1], off: Number(m[2] ?? 0) }));
  const BR = brIds.map(({ id, off }) => SEN.find((s) => s.scene === id).at - off);
  const Sf = (id) => S(id);
  const wins = [...lw.matchAll(/\{ a: (.+?), b: (.+?), inF: (\d+), outF: (\d+) \}/g)].map((m) =>
    Function("P", "BREAKS", "S", "cut", "heroPaint", `return [${m[1]}, ${m[2]}]`)(Pm, BR, Sf, cut, heroPaint));
  const declaredW = (lw.match(/\{ a: /g) ?? []).length;
  if (wins.length !== declaredW) bad(`parsed ${wins.length} of ${declaredW} white windows — the window format changed`);
  wins.sort((x, y) => x[0] - y[0]);
  let worst = 0, worstAt = 0, prevEnd = 0;
  for (const [a, b] of [...wins, [TOTAL, TOTAL]]) { if (a - prevEnd > worst) { worst = a - prevEnd; worstAt = prevEnd; } prevEnd = Math.max(prevEnd, b); }
  const need = Math.round(BEATS.length / 3.5);
  const ok = wins.length >= need && worst <= 30 * 30;
  console.log(`\n9. white cadence — ${wins.length} window(s) over ${BEATS.length} constructions (need ≥${need}); longest dark stretch ${(worst / 30).toFixed(1)}s @${worstAt} ${ok ? "✓" : "✗"}`);
  console.log(`   windows: ${wins.map(([a, b]) => `${(a / 30).toFixed(1)}–${(b / 30).toFixed(1)}s`).join(" · ")}`);
  if (wins.length < need) bad(`${wins.length} white windows — the cadence is about one construction in three (≥${need})`);
  if (worst > 30 * 30) bad(`a ${(worst / 30).toFixed(1)} s dark stretch from ${worstAt} — no dark stretch over 30 s`);
}

// ── 10. ★ NO DEAD STRETCHES (brief rule 6) — the longest gap between a beat's own drivers ────────
// Every construction is driven by the cue props the composition hands it (at, xAt…, end). The
// cue objects are EVALUATED out of Composition.tsx with the same cue/sen the film uses, and each
// mounted beat's drivers are read off its own JSX line. Cue-to-cue OVERSTATES a gap (a reveal is
// still moving ~1s after its cue — the V29 lesson), so this errs toward flagging.
{
  console.log("\n10. dead stretches — longest gap between a beat's drivers (limit 4.5s)");
  const cs = comp.indexOf("// ── cues"), ce = comp.indexOf("const CAPTION_WORDS");
  if (cs < 0 || ce < 0) bad("could not find the cue block in Composition.tsx");
  const cueSrc = comp.slice(comp.indexOf("\n", cs), ce);
  // ★ V30 take: the block also holds a conditional grid (`const Nu = NU7 ? {…} : {…}`) and reads
  // SENTENCES and cueAny (the composition's first-spelling-found helper) — both handed in here
  const names = [...cueSrc.matchAll(/^const (\w+) = /gm)].map((m) => m[1]);
  const cueAny = (sc, ...ws) => {
    for (const w of ws) { try { return cue(sc, w); } catch { /* next spelling */ } }
    throw new Error(`cueAny: none of ${ws.join(" / ")} in ${sc}`);
  };
  let C = {};
  try {
    // ★ V38: the composition's inSen (the first word inside a scene's n-th sentence matching a spelling), mirrored here
    const inSen = (sc, n, ...ws) => {
      const s0 = sen(sc, n), want = ws.map(norm);
      const w0 = WORDS_ALL.find((x) => x.at >= s0.at && x.at <= s0.end && want.includes(norm(x.word)));
      if (!w0) throw new Error(`inSen: none of ${ws.join(" / ")} in ${sc} #${n}`);
      return w0.at;
    };
    // ★ V39: and inSenN (the n-th occurrence of a word inside a sentence)
    const inSenN = (sc, n, word, occ) => {
      const s0 = sen(sc, n);
      const hits = WORDS_ALL.filter((x) => x.at >= s0.at && x.at <= s0.end && norm(x.word) === norm(word));
      if (hits.length < occ) throw new Error(`inSenN: "${word}" #${occ} not in ${sc} #${n}`);
      return hits[occ - 1].at;
    };
    C = Function("cue", "sen", "cueAny", "SENTENCES", "inSen", "inSenN", cueSrc + `; return { ${names.join(", ")} };`)((sc, w, o = 1) => cue(sc, w, o), sen, cueAny, SEN, inSen, inSenN);
  } catch (e) { bad("the cue block would not evaluate: " + e.message); }
  const beatOf = Object.fromEntries(BEATS.map((b) => [b.id, b]));
  let seen = 0;
  // ★ V33: a construction mounts as {on(P.x) && <C … />} or inside its hand-over, {shot(P.x, HO.x, <C … />)}
  const mounts = [...comp.matchAll(/\{(?:on\(P\.(\w+)\) && |shot\(P\.(\w+), (?:HO\.\w+|\{[^<]*\}), )<(\w+) ([^/]*)\/>/g)]
    .map((x) => [x[0], x[1] ?? x[2], x[3], x[4]]);
  for (const m of mounts) {
    const b = beatOf[m[1]];
    if (!b) { bad(`JSX mounts P.${m[1]}, which the plan does not declare`); continue; }
    seen++;
    // ★ V34: a driver may be a LIST of word frames (the certificate's five names)
    const drivers = [...m[3].matchAll(/\w+=\{(\w+)\.(\w+)\}/g)].flatMap(([, o, k]) => {
      const v = C[o]?.[k];
      // ★ V43: the scenes' shared contract takes a whole W object (w={W_.x}) — its values are the drivers
      const vs = Array.isArray(v) ? v : (v && typeof v === "object") ? Object.values(v) : [v];
      if (!vs.length || vs.some((x) => !Number.isFinite(x))) bad(`${m[1]}: driver ${o}.${k} did not resolve`);
      return vs;
    }).filter(Number.isFinite);
    const pts = [b.enter, ...drivers.filter((v) => v > b.enter && v < b.gone), b.gone].sort((x, y) => x - y);
    let worst = 0, wa = 0;
    // ★ V36 take (2026-10-12): the hook OPENS mid-draw — its line is already moving on frame 0, the camera slaved to the head
    //   (hookCamWindows: 0 → the end of "Every single time."), its four buy flags landing along it. That first span is motion on
    //   every frame, not a dead stretch; it is allowed up to 6 s and ONLY for the hook's opening span (every later gap is judged).
    const OPEN_RIDE = { hook: 6 * 30 };
    for (let i = 1; i < pts.length; i++) {
      const g = pts[i] - pts[i - 1];
      if (i === 1 && OPEN_RIDE[m[1]] && g <= OPEN_RIDE[m[1]]) { console.log(`   · ${m[1]} opens on a ride of ${(g / 30).toFixed(1)}s (the line drawing under its following camera) — allowed`); continue; }
      if (g > worst) { worst = g; wa = pts[i - 1]; }
    }
    const ok = worst <= 4.5 * 30 || m[1] === "brand";
    console.log(`   ${ok ? "✓" : "✗"} ${m[1].padEnd(9)} ${drivers.length} drivers · worst gap ${(worst / 30).toFixed(1)}s @${wa}`);
    if (!ok) bad(`"${m[1]}" sits ${(worst / 30).toFixed(1)}s without a new driver (@${wa})`);
  }
  if (seen !== BEATS.length) bad(`read ${seen} mounted beats out of the JSX, the plan declares ${BEATS.length}`);
}

// ★ the beat table and break frames for motion.py's annotations — written from THIS parse on every
// run, so the motion scan can never label spikes with a previous video's beats
{
  const brLine = (comp.match(/^const BREAKS = \[(.*)\];$/m) ?? [])[1] ?? "";
  const breaks = [...brLine.matchAll(/s\.scene === "(\w+)"\)!?\.at/g)].map((m) => SEN.find((s) => s.scene === m[1]).at);
  fs.writeFileSync(path.join(here, "beats.json"), JSON.stringify({
    words: WORDSRC, beats: [...BEATS].sort((a, b) => a.enter - b.enter).map((b) => ({ id: b.id, enter: b.enter, gone: b.gone })), breaks,
  }, null, 1));
}

console.log(fail === 0 ? "\n✓ audit clean" : `\n✗ ${fail} problem(s)`);
process.exit(fail === 0 ? 0 : 1);
