// @ts-nocheck
// Video 37 "Theranos" — cloned from Video 36 "Bre-X Gold" (itself from Video 35's recovered bundle; transpiled JS).
// ★★ SKELETON (integrator, 2026-11-24): every place is a STUB (src/bnx/<id>.tsx → bx_stub.tsx) on PROVISIONAL synthetic word timing
//   (scratchpad/synth_captions.py). Builders replace the stubs; the wiring below re-times itself from captions.ts when the take lands.
//   The contract a place follows: scratchpad/SKELETON.md. Video 36's place files are in its own folder for study.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { aud } from "./aud";
import { clamp01, drift2, rIn, rInOut, rLin } from "./anim";
import { theme } from "./theme";
import { Shot, shotWindow } from "./shot";
import { PlaceLight, placeLights } from "./world";
import { Plx } from "./backdrops";
import { LightBreak } from "./s3";
import { BANNER_END, HEROES, LAST_WORD_END, SCENES, SENTENCES, TICKER, TOTAL_FRAMES, VO_LEAD, WORDS, heroAt } from "./captions";
import { BxHook, hookCamWindows, hookSfx, hookTimes } from "./hook";
import { BxClaim, claimCamWindows, claimSfx, claimTimes } from "./claim";
import { BxClaim2, claim2CamWindows, claim2Sfx, claim2Times } from "./claim2";
import { BxHype, hypeCamWindows, hypeSfx, hypeTimes } from "./hype";
import { BxBackers, backersCamWindows, backersSfx, backersTimes } from "./backers";
import { BxCrack, crackCamWindows, crackSfx, crackTimes } from "./crack";
import { BxWhistle, whistleCamWindows, whistleSfx, whistleTimes } from "./whistle";
import { BxExpose, exposeCamWindows, exposeSfx, exposeTimes } from "./expose";
import { BxCollapse, collapseCamWindows, collapseSfx, collapseTimes } from "./collapse";
import { BxVerdict, verdictCamWindows, verdictSfx, verdictTimes } from "./verdict";
import { BxCleared, clearedCamWindows, clearedSfx, clearedTimes } from "./cleared";
import { BxRule, ruleCamWindows, ruleSfx, ruleTimes } from "./rule";
import { FLARE_T, LensFlare, flareLevel } from "./flare";
import { BrandClose, QuestionStage, Watermark } from "./close";
import { TrackText } from "./track";
import { Q, QUESTION, Q_WORDS } from "./question";
import { ONSET_OF, SfxLayer, cueAt, hold, within } from "./SfxLayer";
import { Probe } from "./Probe";
import { OrbCheck } from "./OrbCheck";
import { setOrbCheck } from "./orb";
import { HeroSentence, WordCaption } from "./text";

export const WIDTH = 1080;
export const HEIGHT = 1920;

// ★ V37 THE TAKE (Timur, 2026-11-24: "generate the voiceover"): take A, ElevenLabs "Jon - Calm Presence", eleven_v4, read word for
//   word (Scribe 186/186); trimmed with holds (scratchpad/vo_hold.json: flare 1 0.70 s, both breaks 0.50 s, scene changes 0.45 s),
//   fitted ×1.04 (pitch kept) to the 80-s cap → 73.3 s, public/vo_trimmed.mp3; captions.ts from `bash scratchpad/take37.sh`.
const HAS_VO = true;
const HAS_MUSIC = true;
const HAS_SFX = true;
const MUSIC_VOL = 1;
// ★ V37: the song rule — the previous film's song (V36: "Me And The Devil"); bed_devil.mp3 is V36's baked bed, re-cut by bed36.py
//   once this film's take lands. Below, V36's note on it:
// ★ V36 (Timur, 2026-11-23: "change the song to the song that was used in The Apple is Worth $5 Trillion"): Video 28's song, Luke
//   Muzzic, "Me And The Devil" (Instrumental) — scratchpad/music_devil.mp3 (Video 13's file, md5 2d99b020915f, 182.6 s), cut from its
//   fifth hit (5.55 s; Timur on Video 13: "the music needs to begin at the start"). scratchpad/bed36.py shapes it per 10-s window
//   against the voice and sets its level AS HEARD to the Radiohead bed it replaces (−28.8 LUFS both; 6.2 dB RMS under the speech-gated
//   voice), the gain interpolated between window centres, a 0.3-s fade-in, the last 3 s faded. Static volume (the V16 rule).
// ★ V37 (Timur, 2026-11-25: "change the song … the video 'This company lost 104 billion in 9 months' about Anthropic — use the song from
//   that video"): Video 33's song, quietshadow, "FOCUS (Slowed + Reverb)". Its source file was lost in the 2026-11-22 reset; the
//   source here is Video 33's own baked bed, recovered from its published Studio bundle (scratchpad/music_focus_v33bed.mp3, 79.3 s),
//   re-shaped by bed36.py per 10-s window against this film's voice and matched AS HEARD to the Me And The Devil bed it replaces
//   (−29.1 LUFS; TARGET 5.6 dB under the speech-gated voice).
const BED_FILE = "bed_focus.mp3";
const BED_FRAMES = 2336;
if (BED_FRAMES < TOTAL_FRAMES) throw new Error("Composition: the bed is shorter than the film — re-cut public/bed_focus.mp3");
// ★ V36/V37: no spoken question — the close is the house close alone (flare 2 → the white stage → BANKER$). question.ts makes it optional.
const HAS_QUESTION = Q !== null;
// ★ V36: the close's frames after the lesson's last word — ONE copy (scratchpad/synth_captions.py reads it to size TOTAL_FRAMES):
//   ruleHold: the last word → flare 2's peak (+1); close: the flare receding onto the white stage as it drains; brand: BANKER$.
const CLOSE_PLAN = { ruleHold: 10, close: 24, brand: 84 };
const HERO_ACCENT = [
  { scene: "fair", word: "fair,", tone: "white" },
  { scene: "lesson", word: "proof.", tone: "white" }
];
// ★ V36: the lesson is the film's teach (V35's "Here's what almost nobody understands." slot): the PUNCH card. "To be fair" is
//   the other side's opener (V35's "Now, the honest part." slot): the regular hero.
const isPunch = (h) => h.scene === "lesson";
const accentOf = (h) => {
  const a = HERO_ACCENT.find((x) => x.scene === h.scene && h.words.some((w2) => w2.word === x.word));
  return a ? { i: h.words.findIndex((w2) => w2.word === a.word), tone: a.tone } : void 0;
};
const BREAKS = [SENTENCES.find((s) => s.scene === "crack").at - 2, SENTENCES.find((s) => s.scene === "fair").at - 2];
const sen = (scene, n) => SENTENCES.filter((s) => s.scene === scene)[n];
const LEAD = 0;
const cut = (scene, n) => sen(scene, n).at - LEAD;
const heroPaint = (scene, n = 0) => HEROES.filter((h) => h.scene === scene)[n].paint;
const heroEnd = (scene, n = 0) => HEROES.filter((h) => h.scene === scene)[n].end;
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9$%&]/g, "");
const inSenN = (scene, n, word, occ) => {
  const s = sen(scene, n);
  const hits = WORDS.filter((x) => x.at >= s.at && x.at <= s.end && norm(x.word) === norm(word));
  if (hits.length < occ) throw new Error(`inSenN: "${word}" #${occ} not in ${scene} #${n} ("${s.text}")`);
  return hits[occ - 1].at;
};
const inSen = (scene, n, ...ws) => {
  const s = sen(scene, n);
  const want = ws.map(norm);
  const w2 = WORDS.find((x) => x.at >= s.at && x.at <= s.end && want.includes(norm(x.word)));
  if (!w2) throw new Error(`inSen: none of ${ws.join(" / ")} in ${scene} #${n} ("${s.text}")`);
  return w2.at;
};
const RULE_END = LAST_WORD_END.rule + CLOSE_PLAN.ruleHold;
const P = {
  hook: { at: 0, end: cut("claim", 0) },
  // hook → claim: the hook pushes into flare 1; claim approaches out of it
  claim: { at: cut("claim", 0), end: cut("claim2", 0) },
  claim2: { at: cut("claim2", 0), end: cut("hype", 0) },
  hype: { at: cut("hype", 0), end: cut("backers", 0) },
  // backers: the boardroom table, then an action-camera travel to the Walgreens fronts (two sentences, one place)
  backers: { at: cut("backers", 0), end: cut("crack", 0) },
  // crack: LightBreak 1 flashes on "But" (the turn)
  crack: { at: cut("crack", 0), end: cut("whistle", 0) },
  whistle: { at: cut("whistle", 0), end: cut("expose", 0) },
  // expose: the ONE light window (the white stage)
  expose: { at: cut("expose", 0), end: cut("collapse", 0) },
  collapse: { at: cut("collapse", 0), end: cut("verdict", 0) },
  verdict: { at: cut("verdict", 0), end: heroPaint("fair") },
  // fair: the HERO card alone (+ LightBreak 2 on "To be fair"); cleared rises from below under its end
  cleared: { at: cut("cleared", 0), end: heroPaint("lesson") },
  // lesson: the PUNCH hero card alone; rule rises from below under its end
  rule: { at: cut("rule", 0), end: RULE_END },
  // the rule pushes into flare 2; the close is the house close (no question): the flare recedes onto the white stage as it drains
  close: { at: RULE_END, end: RULE_END + CLOSE_PLAN.close },
  brand: { at: RULE_END + CLOSE_PLAN.close, end: TOTAL_FRAMES }
};
if (TOTAL_FRAMES - P.brand.at !== CLOSE_PLAN.brand)
  throw new Error(`CLOSE_PLAN: captions.ts was generated for a ${TOTAL_FRAMES - P.brand.at}-f brand, the composition plans ${CLOSE_PLAN.brand} — re-run the captions generator`);
// ── the word frames each place keys to (W_): every one is found in the take by inSen, so the film re-times itself ─────────────
const W_ = {
  hook: {
    s0: sen("hook", 0).at,
    few: inSen("hook", 0, "few"),
    drops: inSen("hook", 0, "drops"),
    blood: inSen("hook", 0, "blood"),
    s1: sen("hook", 1).at,
    promise: inSen("hook", 1, "promise"),
    k9: inSen("hook", 1, "$9"),
    billion: inSen("hook", 1, "billion"),
    company: inSen("hook", 1, "company")
  },
  claim: {
    s0: sen("claim", 0).at,
    k2003: inSen("claim", 0, "2003"),
    elizabeth: inSen("claim", 0, "Elizabeth"),
    holmes: inSen("claim", 0, "Holmes"),
    founded: inSen("claim", 0, "founded"),
    theranos: inSen("claim", 0, "Theranos"),
    k19: inSen("claim", 0, "19"),
    dropped: inSen("claim", 0, "dropped"),
    stanford: inSen("claim", 0, "Stanford")
  },
  claim2: {
    s0: sen("claim2", 0).at,
    pitch: inSen("claim2", 0, "pitch"),
    full: inSen("claim2", 0, "full"),
    blood: inSen("claim2", 0, "blood"),
    tests: inSen("claim2", 0, "tests"),
    finger: inSen("claim2", 0, "finger"),
    prick: inSen("claim2", 0, "prick"),
    edison: inSen("claim2", 0, "Edison"),
    machine: inSen("claim2", 0, "machine")
  },
  hype: {
    s0: sen("hype", 0).at,
    k2014: inSen("hype", 0, "2014"),
    worth: inSen("hype", 0, "worth"),
    k9: inSen("hype", 0, "$9"),
    billion: inSen("hype", 0, "billion"),
    paper: inSen("hype", 0, "paper")
  },
  backers: {
    s0: sen("backers", 0).at,
    two: inSen("backers", 0, "Two"),
    former: inSen("backers", 0, "former"),
    secretaries: inSen("backers", 0, "secretaries"),
    state: inSen("backers", 0, "state"),
    board: inSen("backers", 0, "board"),
    s1: sen("backers", 1).at,
    walgreens: inSen("backers", 1, "Walgreens"),
    offered: inSen("backers", 1, "offered"),
    tests: inSen("backers", 1, "tests"),
    k40: inSen("backers", 1, "40"),
    stores: inSen("backers", 1, "stores")
  },
  crack: {
    s0: sen("crack", 0).at,
    most: inSen("crack", 0, "most"),
    tests: inSen("crack", 0, "tests"),
    other: inSen("crack", 0, "other"),
    companies: inSen("crack", 0, "companies'"),
    machines: inSen("crack", 0, "machines"),
    edison: inSen("crack", 0, "Edison")
  },
  whistle: {
    s0: sen("whistle", 0).at,
    whistleblower: inSen("whistle", 0, "whistleblower"),
    tyler: inSen("whistle", 0, "Tyler"),
    shultz: inSen("whistle", 0, "Shultz"),
    board: inSen("whistle", 0, "board"),
    grandson: inSen("whistle", 0, "grandson")
  },
  expose: {
    s0: sen("expose", 0).at,
    october: inSen("expose", 0, "October"),
    k2015: inSen("expose", 0, "2015"),
    wall: inSen("expose", 0, "Wall"),
    street: inSen("expose", 0, "Street"),
    journal: inSen("expose", 0, "Journal"),
    exposed: inSen("expose", 0, "exposed")
  },
  collapse: {
    s0: sen("collapse", 0).at,
    voided: inSen("collapse", 0, "voided"),
    two: inSen("collapse", 0, "two"),
    years: inSen("collapse", 0, "years"),
    edison: inSen("collapse", 0, "Edison"),
    results: inSen("collapse", 0, "results"),
    s1: sen("collapse", 1).at,
    walgreens: inSen("collapse", 1, "Walgreens"),
    walked: inSen("collapse", 1, "walked"),
    s2: sen("collapse", 2).at,
    k2018: inSen("collapse", 2, "2018"),
    shut: inSen("collapse", 2, "shut")
  },
  verdict: {
    s0: sen("verdict", 0).at,
    january: inSen("verdict", 0, "January"),
    k2022: inSen("verdict", 0, "2022"),
    holmes: inSen("verdict", 0, "Holmes"),
    guilty: inSen("verdict", 0, "guilty"),
    defrauding: inSen("verdict", 0, "defrauding"),
    investors: inSen("verdict", 0, "investors"),
    s1: sen("verdict", 1).at,
    sentence: inSen("verdict", 1, "sentence"),
    k11: inSen("verdict", 1, "11"),
    years: inSen("verdict", 1, "years"),
    k3: inSen("verdict", 1, "3"),
    months: inSen("verdict", 1, "months"),
    cut: inSen("verdict", 1, "cut"),
    year: inSen("verdict", 1, "year")
  },
  cleared: {
    s0: sen("cleared", 0).at,
    cleared: inSen("cleared", 0, "cleared"),
    defrauding: inSen("cleared", 0, "defrauding"),
    patients: inSen("cleared", 0, "patients")
  },
  rule: {
    s0: sen("rule", 0).at,
    peak: inSen("rule", 0, "peak"),
    theranos: inSen("rule", 0, "Theranos"),
    published: inSen("rule", 0, "published"),
    peer: inSen("rule", 0, "peer-reviewed"),
    data: inSen("rule", 0, "data"),
    outside: inSen("rule", 0, "outside"),
    scientists: inSen("rule", 0, "scientists"),
    check: inSen("rule", 0, "check")
  }
};
const CAPTION_WORDS = TICKER.filter((t) => t.at >= BANNER_END - 2).filter((t) => !HAS_QUESTION || t.at < Q.at - 3);
// one serif accent per place's chips (PROVISIONAL picks — the exact caption token, punctuation included)
const CAPTION_ACCENT = [
  { scene: "claim", word: "founded" },
  { scene: "claim2", word: "Edison" },
  { scene: "hype", word: "paper." },
  { scene: "backers", word: "former" },
  { scene: "crack", word: "other" },
  { scene: "whistle", word: "whistleblower" },
  { scene: "expose", word: "exposed" },
  { scene: "collapse", word: "voided" },
  { scene: "verdict", word: "guilty" },
  { scene: "cleared", word: "cleared" },
  { scene: "rule", word: "peer-reviewed" }
];
const CAPTION_ACCENT_AT = new Set(CAPTION_ACCENT.map(({ scene, word, occ = 1 }) => {
  const sc = SCENES.find((s) => s.id === scene);
  const hits = CAPTION_WORDS.flatMap((t) => t.parts ?? []).filter((p) => p.at >= sc.startFrame && p.at < sc.endFrame && p.word === word);
  if (hits.length < occ) throw new Error(`CAPTION_ACCENT: "${word}" (#${occ}) is not in the ${scene} captions — the take changed it`);
  return hits[occ - 1].at;
}));
const HO = (() => {
  const crane = (B) => ({ at: B - 20, dur: 40 });
  const before = (E, dur) => ({ at: E + 2 - dur, dur });
  const own = { k: "own" };
  return {
    // hook → claim: the hook pushes into flare 1 (pushLight); claim approaches out of the bloom
    hook: { enter: own, exit: { k: "pushLight", ...before(P.hook.end, 20) } },
    // claim → … → verdict hand over by SLIDES (V36 rev 1: a crane lifts the outgoing place through the caption band; slides never
    //   cross it). Directions alternate.
    claim: { enter: { k: "approach", at: P.claim.at + 2, dur: 36 }, exit: { k: "panL", ...crane(P.claim.end) } },
    claim2: { enter: { k: "panFromR", ...crane(P.claim2.at) }, exit: { k: "panR", ...crane(P.claim2.end) } },
    hype: { enter: { k: "panFromL", ...crane(P.hype.at) }, exit: { k: "panL", ...crane(P.hype.end) } },
    backers: { enter: { k: "panFromR", ...crane(P.backers.at) }, exit: { k: "panR", ...crane(P.backers.end) } },
    crack: { enter: { k: "panFromL", ...crane(P.crack.at) }, exit: { k: "panL", ...crane(P.crack.end) } },
    whistle: { enter: { k: "panFromR", ...crane(P.whistle.at) }, exit: { k: "panR", ...crane(P.whistle.end) } },
    expose: { enter: { k: "panFromL", ...crane(P.expose.at) }, exit: { k: "panL", ...crane(P.expose.end) } },
    collapse: { enter: { k: "panFromR", ...crane(P.collapse.at) }, exit: { k: "panR", ...crane(P.collapse.end) } },
    // verdict → the fair HERO: the verdict pushes into the card's paint, under LightBreak 2's rise
    verdict: { enter: { k: "panFromL", ...crane(P.verdict.at) }, exit: { k: "pushLight", ...before(P.verdict.end, 22) } },
    // the fair hero → cleared rising from below under the card's end; out by a push before the lesson card
    cleared: { enter: { k: "fromBelow", at: heroEnd("fair") - 17, dur: 44 }, exit: { k: "pushLight", ...before(P.cleared.end, 22) } },
    // the lesson hero → rule rising from below under it; rule pushes into flare 2
    rule: { enter: { k: "fromBelow", at: heroEnd("lesson") - 17, dur: 44 }, exit: { k: "pushLight", ...before(P.rule.end, 22) } },
    close: { enter: { k: "approach", at: P.close.at + 2, dur: 36 }, exit: own }
  };
})();
const PLACE_IDS = ["hook", "claim", "claim2", "hype", "backers", "crack", "whistle", "expose", "collapse", "verdict", "cleared", "rule", "close"];
const PLACES = [
  ...PLACE_IDS.map((id) => ({ id, ...P[id], ...HO[id] })),
  { id: "brand", ...P.brand, enter: { k: "own" }, exit: { k: "own" } }
];
const DROP = 110;
const LIGHT_WINDOWS = [
  // ★ V37: the ONE light frame — the newspaper (expose) — plus the house close. Out by P.expose.end (V35's rule: the white is gone
  //   before the next place's dark construction arrives).
  { a: P.expose.at - 10, b: P.expose.end, inF: 20, outF: 22 },
  // the close: flare 2 recedes onto the white stage (gone by P.close.at + 17), which then drains to navy, done as BANKER$ starts
  { a: P.close.at - 2, b: P.brand.at + 22, inF: 20, outF: 26 }
];
const T_ = {
  hook: hookTimes(W_.hook, P.hook.end),
  claim: claimTimes(W_.claim, P.claim.end),
  claim2: claim2Times(W_.claim2, P.claim2.end),
  hype: hypeTimes(W_.hype, P.hype.end),
  backers: backersTimes(W_.backers, P.backers.end),
  crack: crackTimes(W_.crack, P.crack.end),
  whistle: whistleTimes(W_.whistle, P.whistle.end),
  expose: exposeTimes(W_.expose, P.expose.end),
  collapse: collapseTimes(W_.collapse, P.collapse.end),
  verdict: verdictTimes(W_.verdict, P.verdict.end),
  cleared: clearedTimes(W_.cleared, P.cleared.end),
  rule: ruleTimes(W_.rule, P.rule.end)
};
const SCN = [
  { id: "hook", cams: hookCamWindows(T_.hook), ev: hookSfx(T_.hook) },
  { id: "claim", cams: claimCamWindows(T_.claim), ev: claimSfx(T_.claim) },
  { id: "claim2", cams: claim2CamWindows(T_.claim2), ev: claim2Sfx(T_.claim2) },
  { id: "hype", cams: hypeCamWindows(T_.hype), ev: hypeSfx(T_.hype) },
  { id: "backers", cams: backersCamWindows(T_.backers), ev: backersSfx(T_.backers) },
  { id: "crack", cams: crackCamWindows(T_.crack), ev: crackSfx(T_.crack) },
  { id: "whistle", cams: whistleCamWindows(T_.whistle), ev: whistleSfx(T_.whistle) },
  { id: "expose", cams: exposeCamWindows(T_.expose), ev: exposeSfx(T_.expose) },
  { id: "collapse", cams: collapseCamWindows(T_.collapse), ev: collapseSfx(T_.collapse) },
  { id: "verdict", cams: verdictCamWindows(T_.verdict), ev: verdictSfx(T_.verdict) },
  { id: "cleared", cams: clearedCamWindows(T_.cleared), ev: clearedSfx(T_.cleared) },
  { id: "rule", cams: ruleCamWindows(T_.rule), ev: ruleSfx(T_.rule) }
];
const FLARES = [
  // flare 1 (hook → claim): from = the glint on the rule under "$9" (builder H, hookFlarePoint, screen at f159) → to: the lab corridor's far light through the door (builder B, claimFlarePoint)
  { peak: P.hook.end - 2, from: { x: 522, y: 1182 }, to: { x: 377, y: 1187 }, ghost: 2.2, grow: 24, hold: 2, recede: 16 },
  // flare 2 (rule → close): from = the journal slot's lit back (builder F, ruleFlarePoint, measured on screen at f1975/f2020); to = BANKER$
  //   recede 16 (as flare 1): the bloom is gone over the white stage before it drains (see LIGHT_WINDOWS)
  { peak: P.rule.end - 1, from: { x: 540, y: 996 }, to: { x: 540, y: 960 }, grow: 26, hold: 2, recede: 16 }
];
const ft = (fl) => ({ grow: fl.grow ?? FLARE_T.grow, hold: fl.hold ?? FLARE_T.hold, recede: fl.recede ?? FLARE_T.recede });
const flash = (f0) => ({ at: f0 - 30, end: f0 + 21 });
const w = (b) => within(b);
const span = (s, visFrom, visTo, vol = 1) => within({ at: visFrom - 30, end: visTo + 12 })(s, visFrom, visTo, vol);
const EASE = {
  io: { v10: 0.033, peak: 0.391, p90: 0.689 },
  rise: { v10: 0.043, peak: 0.293, p90: 0.645 },
  out: { v10: 0, peak: 0, p90: 0.403 },
  in: { v10: 0.433, peak: 1, p90: 0.979 }
};
const FILE_PEAK = {
  airwoosh: 21,
  whooshsoft: 8,
  whooshlong: 12,
  swoosh: 12,
  lowwoosh: 13,
  // the EarnEdits whooshes' loudest 10 ms (catalog.json loudest_s, in frames)
  ee_whoosh_fast_small_whoosh_01: 14,
  ee_whoosh_medium_whoosh_01: 25,
  ee_whoosh_large_whoosh_01: 33,
  ee_whoosh_low_fast_whoosh: 12,
  ee_whoosh_sci_fi_whoosh: 18,
  ee_whoosh_human_whoosh: 13,
  ee_whoosh_cinematic_whoosh_hit: 33,
  ee_whoosh_metal_string_rise: 57
};
const EE = {
  travel: "ee_whoosh_large_whoosh_01",
  handover: "ee_whoosh_medium_whoosh_01",
  label: "ee_whoosh_fast_small_whoosh_01",
  flash: "ee_whoosh_low_fast_whoosh",
  verdict: "ee_impact_dramatic_bass_hit",
  click: "ee_click_click_01",
  tear: "ee_paper_paper_tear_01",
  clock: "ee_clock_clock_ticking_01"
};
const startOf = (a, b, k = "io") => Math.round(a + EASE[k].v10 * (b - a));
const whooshOn = (s, a, b, k = "io") => Math.round(a + EASE[k].peak * (b - a) - ((FILE_PEAK[s] ?? ONSET_OF(s)) - ONSET_OF(s)));
const landOf = (a, b, k = "io") => Math.round(a + EASE[k].p90 * (b - a));
const whoosh = (beat, fam, a, b, vol, k = "io") => {
  const on = whooshOn(fam, a, b, k);
  return beat ? within(beat)(fam, on, b, vol) : span(fam, on, b, vol);
};
const moveCue = (m, vol) => {
  if (m.k === "own" || m.k === "pushLight") return [];
  const fam = /^pan|^crane|^from/.test(m.k) ? EE.travel : m.k === "zoom" ? "whooshlong" : EE.handover;
  return [whoosh(null, fam, m.at, m.at + m.dur, vol * TRAVEL_TRIM, m.k === "approach" || m.k === "large" ? "out" : "io")];
};
const TRAVEL_TRIM = 1.41;
const camCue = (beat, k, vol = 0.36) => whoosh(beat, "airwoosh", k.a, k.a + k.dur, vol * TRAVEL_TRIM);
const RISER_PEAK = 80;
const riserCue = (m, vol) => {
  if (m.k === "own" || !/^pan|^crane|^from|^pull/.test(m.k)) return [];
  const fast = Math.round(m.at + EASE.io.peak * m.dur);
  const skip = Math.max(0, RISER_PEAK - (fast - m.at));
  return [{ s: "riserwhoosh", at: fast - (RISER_PEAK - skip), dur: 84 - skip, skip, fadeIn: 3, fade: 2, vol }];
};
const CLOCK_PEAK = 44;
const clockRun = (from, peakAt, to, vol) => {
  const skip = Math.max(0, Math.round(from - (peakAt - CLOCK_PEAK)));
  const at = Math.round(peakAt) - CLOCK_PEAK + skip;
  return { s: "clock", at, dur: Math.min(87 - skip, to - at), skip, fadeIn: skip > 0 ? 3 : 0, fade: 10, vol };
};
const boomAt = (f0, vol) => within({ at: f0 - 10, end: f0 + 60 })("boom", f0, void 0, vol);
const evCues = (beat, evs, human = false) => evs.flatMap((e) => {
  const v = e.vol ?? 1;
  if (human && e.job === "obj") {
    const c = whoosh(beat, "ee_whoosh_human_whoosh", e.a, e.b, 0.5 * v, e.k ?? "io");
    const dur = Math.max(6, Math.min(52, Math.round(beat.end) - c.at));
    return [{ ...c, dur, fade: Math.max(8, Math.round(dur / 3)), to: void 0 }];
  }
  switch (e.job) {
    case "move":
      return [camCue(beat, { a: e.a, dur: e.b - e.a }, 0.27 * v)];
    case "obj": {
      const c = whoosh(beat, "whooshsoft", e.a, e.b, 0.55 * v, e.k ?? "io");
      if ((e.k ?? "io") !== "in") return [c];
      const dur = Math.max(3, Math.min(27, Math.round(beat.end) - c.at));
      return [{ ...c, dur, fade: dur < 27 ? Math.max(5, Math.round(dur / 3)) : 0, to: void 0 }];
    }
    case "land":
      return [within(beat)("sub", landOf(e.a, e.b, e.k ?? "io"), void 0, 0.8 * v)];
    case "process":
      return hold(beat)("chain", startOf(e.a, e.b, e.k ?? "io"), e.b, 0.42 * v);
    // a mechanism longer than chainshort's 1 s is held on the long chain (sfxends: never a sound that runs out mid-motion)
    case "mech":
      return e.b - e.a > 30 ? hold(beat)("chain", e.a, e.b, 0.5 * v) : [within(beat)("chainshort", e.a, e.b, 0.75 * v)];
    // ★ a LINE DRAWING is "a thing computing": the data tick, held for the whole draw
    case "data":
      return hold(beat)("data", startOf(e.a, e.b, e.k ?? "io"), e.b, 0.6 * v);
    // (the EarnEdits small whoosh is denser than the house swoosh: at 0.85 the score sat +3.2 dB (p90) over V43's, so 0.5)
    case "label":
      return [whoosh(beat, EE.label, e.a, e.b, 0.5 * v, e.k ?? "out")];
    case "verdict": {
      const f0 = landOf(e.a, e.b, e.k ?? "io");
      return [within({ at: f0 - 10, end: f0 + 60 })(EE.verdict, f0, void 0, 0.62 * v)];
    }
    // literal hits: `a` IS the contact frame
    case "coin":
      return [within(beat)("coin", e.a, void 0, 0.62 * v)];
    case "flick":
      return [within(beat)(EE.tear, e.a, void 0, 0.45 * v)];
    case "click":
      return [within(beat)(EE.click, e.a, void 0, 0.3 * v)];
    case "thud":
      return [within(beat)("thud", e.a, void 0, 0.75 * v)];
    case "ping":
      return [within(beat)("pingshort", e.a, void 0, 0.36 * v)];
    // typing runs exactly the span the words or keys write on, cut under a short fade
    case "typing": {
      const a = Math.round(e.a), d = Math.max(5, Math.round(e.b) - a);
      return [{ s: "typing", at: a, dur: d + 3, fade: 6, vol: 0.3 * v, to: Math.round(e.b) }];
    }
    // years going by: the EarnEdits ticking clock, held for exactly the run, never stopping dead
    case "clock": {
      const a = Math.round(e.a), d = Math.max(8, Math.round(e.b) - a);
      return [{ s: EE.clock, at: a, dur: d + 4, fadeIn: 2, fade: 8, vol: 0.5 * v, to: Math.round(e.b) }];
    }
  }
});
const BRKS = BREAKS.map(flash);
const CUES_RAW = [
  // ── the hook: the long woosh under the opening push from frame 0 (its lead-in trimmed before frame 0)
  cueAt("whooshlong", 0, 40, 0.35),
  // ── every place: its own motion events (family per job), its camera moves, then the hand-over out of it (the travel's whoosh, the
  //    riser on pans and cranes). ★ Each place's LITERAL sounds are added here by its builder, each on its own visual.
  ...SCN.flatMap((x) => {
    const pl = P[x.id], ho = HO[x.id];
    return [
      ...evCues({ at: pl.at - 20, end: pl.end }, x.ev),
      // (a place is drawn from ~20 f before its cut: its first cues may lead in)
      ...x.cams.map((k) => camCue(pl, { a: k.a, dur: k.b - k.a }, 0.27)),
      ...moveCue(ho.exit, 0.4),
      ...riserCue(ho.exit, 0.31)
    ];
  }),
  // ── the arrivals that are their own moves: out of flare 1 (claim), up from under the two hero cards (cleared, rule)
  ...moveCue(HO.claim.enter, 0.38),
  ...moveCue(HO.cleared.enter, 0.4),
  ...riserCue(HO.cleared.enter, 0.31),
  ...moveCue(HO.rule.enter, 0.4),
  ...riserCue(HO.rule.enter, 0.31),
  // ── the two LightBreaks (on "But" and "To be fair"): EarnEdits' low whoosh rising with each flash (V34/V35's line)
  within(BRKS[0])(EE.flash, BREAKS[0] - 11, BRKS[0].end, 0.6),
  within(BRKS[1])(EE.flash, BREAKS[1] - 11, BRKS[1].end, 0.6),
  // ── the two hero cards clearing (their rack focus releasing) as the next place rises under them (V35's line after its punch card)
  span("whooshsoft", heroEnd("fair") - 26, heroEnd("fair") - 6, 0.35),
  span("whooshsoft", heroEnd("lesson") - 26, heroEnd("lesson") - 6, 0.35),
  // ★ (V36 lesson, sfxgaps) cleared → the lesson card is the film's one push-light with no break or flare under it (moveCue gives
  //   push-lights none), so it carries its own whoosh, peaking at the push's end (rIn: fastest at its end), decaying into the card
  span("whooshlong", whooshOn("whooshlong", HO.cleared.exit.at, HO.cleared.exit.at + HO.cleared.exit.dur, "in"), HO.cleared.exit.at + HO.cleared.exit.dur + 16, 0.45),
  // ★ (integrator, rev 1, sfxgaps 1927–1938) the push starts before the long whoosh swells: a soft lead-in (V36's crack → truth line)
  whoosh(null, "whooshsoft", HO.cleared.exit.at, HO.cleared.exit.at + 22, 0.3),
  // ── both flares: V46's own flare line, the low whoosh swelling with the bloom
  ...FLARES.map((fl) => {
    const T = ft(fl);
    return within({ at: fl.peak - T.grow, end: fl.peak + T.hold + T.recede })(EE.flash, fl.peak - Math.round(0.55 * T.grow), fl.peak + T.hold + T.recede, 0.6);
  }),
  // ── the close's question (only when the film has one): its lines fly in from depth, each with a soft whoosh, then the lift to the logo.
  //    ★ V36/V37 have none: the close arrives on the music alone (STYLE 2026-10-23: no whoosh under the fly into the closing logo).
  ...(HAS_QUESTION ? [
    ...QUESTION.map((ln) => {
      const at = Q_WORDS[ln.idx[0]].at;
      return whoosh(P.close, "whooshsoft", at - 8, at + 20, ln.accent ? 0.5 : 0.35);
    }),
    span("whooshlong", P.close.end - 12, P.brand.at + 18, 0.5)
  ] : [])
];
const VOICE_CLEAR = [];
const FLAM = 3;
const DEDUPED = CUES_RAW.filter((c, i) => c.s !== "airwoosh" ? c.grp !== void 0 || !CUES_RAW.some((d, j) => j !== i && d.s === c.s && d.grp === void 0 && Math.abs(d.at - c.at) <= FLAM && ((d.vol ?? 1) > (c.vol ?? 1) || (d.vol ?? 1) === (c.vol ?? 1) && j < i)) : !CUES_RAW.some((d, j) => j !== i && d.s === "airwoosh" && Math.abs(d.at - c.at) <= 10 && ((d.vol ?? 1) > (c.vol ?? 1) || (d.vol ?? 1) === (c.vol ?? 1) && j < i)));
const CUES = DEDUPED.map((c) => {
  const peak = c.vis ?? c.at;
  return VOICE_CLEAR.some((v) => peak >= v.a && peak <= v.b) ? { ...c, vol: (c.vol ?? 1) * 0.4 } : c;
});
const bedVolume = MUSIC_VOL;   // static: the fades are baked into the file
export const TheranosBloodTest = ({ solo, probe, dumpCues, orbcheck }) => {
  const f = (0,esm.useCurrentFrame)();
  setOrbCheck(orbcheck === true);
  if (dumpCues && f === 0) console.log("CUES" + JSON.stringify(CUES));
  if (dumpCues && f === 0) console.log("MOVES" + JSON.stringify({
    places: PLACES,
    cams: [
      ...SCN.flatMap((x) => x.cams.map((k) => ({ id: x.id, ...k })))
    ],
    lights: [...FLARES.map((fl) => {
      const T = ft(fl);
      return { a: fl.peak - T.grow, b: fl.peak + T.hold + T.recede };
    }), ...BREAKS.map((b) => ({ a: b - 11, b: b + 21 }))]
  }));
  if (dumpCues && f === 0) console.log("CANARY" + JSON.stringify({
    bad: [{ ...within({ at: 0, end: 400 })("chain", 100, 300), dur: 90, fade: 0 }],
    early: [within({ at: 0, end: 400 })("chain", 100, 300)],
    good: hold({ at: 0, end: 400 })("chain", 100, 300),
    loud: [{ s: "data", at: 0, dur: 30, fade: 0, to: 30 }],
    quiet: [within({ at: 0, end: 400 })("data", 0, 30)]
  }));
  const play = (k) => !solo || solo === k;
  const sc = SCENES.find((s) => f >= s.startFrame && f < s.endFrame) ?? SCENES[SCENES.length - 1];
  const fieldLight = LIGHT_WINDOWS.reduce((acc, lw) => {
    const up = lw.inF ? rInOut(f, lw.a, lw.a + lw.inF) : f >= lw.a ? 1 : 0;
    const down = lw.outF ? rInOut(f, lw.b - lw.outF, lw.b) : f >= lw.b ? 1 : 0;
    return Math.max(acc, clamp01(up - down));
  }, 0);
  const lights = placeLights(f, PLACES);
  const brk = BREAKS.reduce((a, b) => Math.max(a, f < b + 5 ? rInOut(f, b - 11, b) : 1 - rInOut(f, b + 5, b + 21)), 0);
  const flr = FLARES.reduce((a, fl) => {
    const T = ft(fl);
    return Math.max(a, flareLevel(f, fl.peak, T.grow, T.hold, T.recede));
  }, 0);
  const capLight = Math.max(brk >= 0.5 ? 1 : 0, 1 - (1 - fieldLight) * (1 - flr) >= 0.5 ? 1 : 0);
  const p = rInOut(f, sc.startFrame, sc.endFrame);
  const zig = sc.index % 2 === 0 ? 1 + 0.035 * p : 1.035 - 0.035 * p;
  const z = zig + 0.015 * rLin(f, 0, TOTAL_FRAMES);
  const dx = drift2(f, 231, 97, 6);
  const dy = drift2(f, 173, 79, 4);
  const hero = heroAt(f);
  const F_IN = 20, F_OUT = 18;
  const raw = HEROES.map((h) => ({ a: h.paint, b: h.end })).sort((x, y) => x.a - y.a);
  const FOCUS_WINDOWS = [];
  for (const fw of raw) {
    const last = FOCUS_WINDOWS[FOCUS_WINDOWS.length - 1];
    if (last && fw.a - last.b < F_IN + F_OUT) last.b = Math.max(last.b, fw.b);
    else FOCUS_WINDOWS.push({ ...fw });
  }
  const focusOff = clamp01(FOCUS_WINDOWS.reduce((acc, fw) => acc + rInOut(f, fw.a, fw.a + F_IN) * (1 - rInOut(f, fw.b, fw.b + F_OUT)), 0));
  const stageFilter = focusOff > 0.02 ? `blur(${(14 * focusOff).toFixed(2)}px) brightness(${(1 - 0.22 * focusOff).toFixed(3)})` : void 0;
  const on = (bw) => {
    const brk2 = BREAKS.find((b) => b > bw.at - 2 && b <= bw.at + 2);
    return f >= Math.max(bw.at - 2, brk2 ?? -Infinity) && f < bw.end + 2;
  };
  const shot = (bw, ho, el) => {
    const wnd = shotWindow(bw.at, bw.end, ho.exit, ho.enter);
    const brk2 = BREAKS.find((b) => b > bw.at - 2 && b <= bw.at + 2);
    if (f < Math.max(wnd.from, brk2 ?? -Infinity) || f >= wnd.to) return null;
    return /* @__PURE__ */ (0,jsx_runtime.jsx)(Shot, { exit: ho.exit, enter: ho.enter, children: el });
  };
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(esm.AbsoluteFill, { id: "bnx-root", style: { backgroundColor: "#000000", overflow: "hidden" }, children: [
    HAS_VO && play("vo") && /* @__PURE__ */ (0,jsx_runtime.jsx)(esm.Sequence, { from: VO_LEAD, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(esm.Audio, { src: aud("vo_trimmed.mp3"), volume: 1 }) }),
    HAS_SFX && play("sfx") && /* @__PURE__ */ (0,jsx_runtime.jsx)(SfxLayer, { cues: CUES, total: TOTAL_FRAMES }),
    HAS_MUSIC && play("music") && /* @__PURE__ */ (0,jsx_runtime.jsx)(esm.Audio, { src: aud(BED_FILE), volume: bedVolume }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe": "bg", style: { position: "absolute", inset: 0 }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, background: theme.bg } }),
      lights.map((l) => /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceLight, { layer: "dark", ...l, white: fieldLight }, `d${l.i}`)),
      fieldLight > 1e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, background: theme.bgLight, opacity: fieldLight } }),
      lights.map((l) => /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceLight, { layer: "white", ...l, white: fieldLight }, `w${l.i}`))
    ] }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Plx, { z, dx, dy, depth: 1, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "absolute", inset: 0, filter: stageFilter }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "absolute", inset: 0, transform: `translateY(${DROP}px)` }, children: [
        shot(P.hook, HO.hook, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxHook, { ...P.hook, w: W_.hook, stage: fieldLight })),
        shot(P.claim, HO.claim, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxClaim, { ...P.claim, w: W_.claim, stage: fieldLight })),
        shot(P.claim2, HO.claim2, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxClaim2, { ...P.claim2, w: W_.claim2, stage: fieldLight })),
        shot(P.hype, HO.hype, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxHype, { ...P.hype, w: W_.hype, stage: fieldLight })),
        shot(P.backers, HO.backers, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxBackers, { ...P.backers, w: W_.backers, stage: fieldLight })),
        shot(P.crack, HO.crack, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxCrack, { ...P.crack, w: W_.crack, stage: fieldLight })),
        shot(P.whistle, HO.whistle, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxWhistle, { ...P.whistle, w: W_.whistle, stage: fieldLight })),
        shot(P.expose, HO.expose, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxExpose, { ...P.expose, w: W_.expose, stage: fieldLight })),
        shot(P.collapse, HO.collapse, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxCollapse, { ...P.collapse, w: W_.collapse, stage: fieldLight })),
        shot(P.verdict, HO.verdict, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxVerdict, { ...P.verdict, w: W_.verdict, stage: fieldLight })),
        shot(P.cleared, HO.cleared, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxCleared, { ...P.cleared, w: W_.cleared, stage: fieldLight })),
        shot(P.rule, HO.rule, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxRule, { ...P.rule, w: W_.rule, stage: fieldLight })),
        shot(P.close, HO.close, /* @__PURE__ */ (0,jsx_runtime.jsx)(QuestionStage, { ...P.close }))
      ] }),
      on(P.brand) && /* @__PURE__ */ (0,jsx_runtime.jsx)(BrandClose, { at: P.brand.at + 22, y: 960 })
    ] }) }),
    FLARES.map((fl, i) => /* @__PURE__ */ (0,jsx_runtime.jsx)(LensFlare, { ...fl, stage: fieldLight }, i)),
    BREAKS.map((b, i) => /* @__PURE__ */ (0,jsx_runtime.jsx)(LightBreak, { at: b, hold: 5 }, i)),
    !hero && /* @__PURE__ */ (0,jsx_runtime.jsx)(WordCaption, { words: CAPTION_WORDS, onLight: capLight, accentAt: CAPTION_ACCENT_AT }),
    HEROES.map((h, i) => (
      // (a film with a question: the close's "So be honest." is gone by Q.at − 2, before the question's first word arrives from depth)
      /* @__PURE__ */ (0,jsx_runtime.jsx)(
        HeroSentence,
        {
          words: h.words,
          end: HAS_QUESTION && h.scene === "close" ? Math.min(h.end, Q.at - 2) : h.end,
          paint: h.paint,
          y: 880,
          size: isPunch(h) ? 74 : h.words.length > 9 ? 48 : h.words.length > 7 ? 54 : 64,   // V37: the 11-word fair card at 54 reached the frame edge on its fly-in (geom_sweep 1698)
          onLight: capLight,
          display: isPunch(h),
          emph: [],
          accent: accentOf(h)
        },
        i
      )
    )),
    HAS_QUESTION && f >= Q.at - 6 && f < P.brand.at + 40 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-group": "hero", style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(
      TrackText,
      {
        words: Q_WORDS,
        lines: QUESTION,
        y: 900,
        dolly: 240 * rInOut(f, Q.at, P.brand.at) + 220 * rIn(f, P.brand.at - 4, P.brand.at + 28),
        hold: rInOut(f, Q.at, P.brand.at + 4),
        end: P.brand.at + 40,
        lift: 1800 * rInOut(f, P.brand.at - 6, P.brand.at + 40),
        ink: fieldLight
      }
    ) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Watermark, { lit: 1 - (1 - fieldLight) * (1 - Math.max(flr, brk)), outAt: P.brand.at }),
    probe === true && /* @__PURE__ */ (0,jsx_runtime.jsx)(Probe, {}),
    orbcheck === true && /* @__PURE__ */ (0,jsx_runtime.jsx)(OrbCheck, {})
  ] });
};
