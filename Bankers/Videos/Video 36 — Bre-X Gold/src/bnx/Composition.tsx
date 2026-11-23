// @ts-nocheck
// Video 36 "Bre-X Gold" — cloned from Video 35 "Lottery Tear" (recovered from its published Studio bundle; transpiled JS).
// ★★ SKELETON (integrator, 2026-11-23): every place is a STUB (src/bnx/<id>.tsx → bx_stub.tsx) on PROVISIONAL synthetic word timing
//   (scratchpad/synth_captions.py). Builders replace the stubs; the wiring below re-times itself from captions.ts when the take lands.
//   The contract a place follows: scratchpad/SKELETON.md. Video 35's place files stay in src/bnx for study (nothing imports them).
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
import { BxPartner, partnerCamWindows, partnerSfx, partnerTimes } from "./partner";
import { BxMystery, mysteryCamWindows, mysterySfx, mysteryTimes } from "./mystery";
import { BxCrack, crackCamWindows, crackSfx, crackTimes } from "./crack";
import { BxTruth, truthCamWindows, truthSfx, truthTimes } from "./truth";
import { BxCollapse, collapseCamWindows, collapseSfx, collapseTimes } from "./collapse";
import { BxPension, pensionCamWindows, pensionSfx, pensionTimes } from "./pension";
import { BxFelderhof, felderhofCamWindows, felderhofSfx, felderhofTimes } from "./felderhof";
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

// ★ TODO (V36, take pending): there is NO voice file yet — the ElevenLabs take waits on Timur. public/vo_trimmed.mp3 is still
//   VIDEO 35's voice (cloned), so the voice stays OFF: the Studio plays the bed + SFX on the provisional timing. When the take
//   lands: trim it to public/vo_trimmed.mp3, regenerate captions.ts with scratchpad/captions_vo.js, then set HAS_VO = true.
const HAS_VO = false;
const HAS_MUSIC = true;
const HAS_SFX = true;
const MUSIC_VOL = 1;
// ★ V36: still Video 35's bed (the song rule: the previous film's song unless Timur names one). The file is baked for V35's
//   take and is 72.78 s (BED_FRAMES) with its own fade at its end; it is NOT re-cut to this film yet. Until it is, the bed is faded
//   out by volume over the last BED_FADE frames of min(TOTAL_FRAMES, BED_FRAMES) so it never stops dead on the brand.
const BED_FILE = "bed_radiohead.mp3";
const BED_FRAMES = 2183;
const BED_FADE = 45;
// ★ V36: no spoken question — the close is the house close alone (flare 2 → the white stage → BANKER$). question.ts makes it optional.
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
const BREAKS = [SENTENCES.find((s) => s.scene === "partner").at - 2, SENTENCES.find((s) => s.scene === "fair").at - 2];
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
  hype: { at: cut("hype", 0), end: cut("partner", 0) },
  // partner: LightBreak 1 flashes on "That March" (the turn)
  partner: { at: cut("partner", 0), end: cut("mystery", 0) },
  mystery: { at: cut("mystery", 0), end: cut("crack", 0) },
  crack: { at: cut("crack", 0), end: cut("truth", 0) },
  // truth: the ONE light window (the white stage)
  truth: { at: cut("truth", 0), end: cut("collapse", 0) },
  collapse: { at: cut("collapse", 0), end: cut("pension", 0) },
  pension: { at: cut("pension", 0), end: heroPaint("fair") },
  // fair: the HERO card alone (+ LightBreak 2 on "To be fair"); felderhof rises from below under its end
  felderhof: { at: cut("felderhof", 0), end: heroPaint("lesson") },
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
    gold: inSen("hook", 0, "Gold"),
    dust: inSen("hook", 0, "dust"),
    sprinkled: inSen("hook", 0, "sprinkled"),
    rock: inSen("hook", 0, "rock"),
    samples: inSen("hook", 0, "samples"),
    s1: sen("hook", 1).at,
    took: inSen("hook", 1, "took"),
    build: inSen("hook", 1, "build"),
    k6: inSen("hook", 1, "$6"),
    billion: inSen("hook", 1, "billion"),
    company: inSen("hook", 1, "company")
  },
  claim: {
    s0: sen("claim", 0).at,
    k1993: inSen("claim", 0, "1993"),
    tiny: inSen("claim", 0, "tiny"),
    calgary: inSen("claim", 0, "Calgary"),
    brex: inSen("claim", 0, "Bre-X"),
    bought: inSen("claim", 0, "bought"),
    jungle: inSen("claim", 0, "jungle"),
    gold: inSen("claim", 0, "gold"),
    borneo: inSen("claim", 0, "Borneo"),
    indonesia: inSen("claim", 0, "Indonesia")
  },
  claim2: {
    s0: sen("claim2", 0).at,
    k1997: inSen("claim2", 0, "1997"),
    claimed: inSen("claim2", 0, "claimed"),
    k71: inSen("claim2", 0, "71"),
    million: inSen("claim2", 0, "million"),
    ounces: inSen("claim2", 0, "ounces")
  },
  hype: {
    s0: sen("hype", 0).at,
    stock: inSen("hype", 0, "stock"),
    pennies: inSen("hype", 0, "pennies"),
    k6: inSen("hype", 0, "$6"),
    billion: inSen("hype", 0, "billion"),
    company: inSen("hype", 0, "company"),
    s1: sen("hype", 1).at,
    pension: inSen("hype", 1, "Pension"),
    funds: inSen("hype", 1, "funds"),
    piled: inSen("hype", 1, "piled")
  },
  partner: {
    s0: sen("partner", 0).at,
    march: inSen("partner", 0, "March"),
    partner: inSen("partner", 0, "partner"),
    drilled: inSen("partner", 0, "drilled"),
    test: inSen("partner", 0, "test"),
    holes: inSen("partner", 0, "holes"),
    beside: inSen("partner", 0, "beside"),
    brexs: inSen("partner", 0, "Bre-X's")
  },
  mystery: {
    s0: sen("mystery", 0).at,
    march: inSen("mystery", 0, "March"),
    k19: inSen("mystery", 0, "19th"),
    chief: inSen("mystery", 0, "chief"),
    geologist: inSen("mystery", 0, "geologist"),
    michael: inSen("mystery", 0, "Michael"),
    guzman: inSen("mystery", 0, "Guzman"),
    fell: inSen("mystery", 0, "fell"),
    helicopter: inSen("mystery", 0, "helicopter")
  },
  crack: {
    s0: sen("crack", 0).at,
    week: inSen("crack", 0, "week"),
    later: inSen("crack", 0, "later"),
    partner: inSen("crack", 0, "partner"),
    reported: inSen("crack", 0, "reported"),
    insignificant: inSen("crack", 0, "insignificant"),
    gold: inSen("crack", 0, "gold")
  },
  truth: {
    s0: sen("truth", 0).at,
    may: inSen("truth", 0, "May"),
    k4: inSen("truth", 0, "4th"),
    independent: inSen("truth", 0, "independent"),
    auditors: inSen("truth", 0, "auditors"),
    confirmed: inSen("truth", 0, "confirmed"),
    core: inSen("truth", 0, "core"),
    samples: inSen("truth", 0, "samples"),
    salted: inSen("truth", 0, "salted"),
    outside: inSen("truth", 0, "outside"),
    gold: inSen("truth", 0, "gold")
  },
  collapse: {
    s0: sen("collapse", 0).at,
    days: inSen("collapse", 0, "days"),
    shares: inSen("collapse", 0, "shares"),
    sank: inSen("collapse", 0, "sank"),
    k6: inSen("collapse", 0, "6"),
    cents: inSen("collapse", 0, "cents"),
    s1: sen("collapse", 1).at,
    about: inSen("collapse", 1, "About"),
    k40000: inSen("collapse", 1, "40,000"),
    shareholders: inSen("collapse", 1, "shareholders"),
    nearly: inSen("collapse", 1, "nearly"),
    wiped: inSen("collapse", 1, "wiped")
  },
  pension: {
    s0: sen("pension", 0).at,
    ontario: inSen("pension", 0, "Ontario"),
    teachers: inSen("pension", 0, "Teachers'"),
    plan: inSen("pension", 0, "Plan"),
    alone: inSen("pension", 0, "alone"),
    lost: inSen("pension", 0, "lost"),
    k100: inSen("pension", 0, "$100"),
    million: inSen("pension", 0, "million")
  },
  felderhof: {
    s0: sen("felderhof", 0).at,
    exploration: inSen("felderhof", 0, "Exploration"),
    john: inSen("felderhof", 0, "John"),
    felderhof: inSen("felderhof", 0, "Felderhof"),
    sold: inSen("felderhof", 0, "sold"),
    k84: inSen("felderhof", 0, "$84"),
    million: inSen("felderhof", 0, "million"),
    stock: inSen("felderhof", 0, "stock"),
    k1996: inSen("felderhof", 0, "1996"),
    found: inSen("felderhof", 0, "found"),
    not: inSen("felderhof", 0, "not"),
    guilty: inSen("felderhof", 0, "guilty"),
    insider: inSen("felderhof", 0, "insider"),
    trading: inSen("felderhof", 0, "trading")
  },
  rule: {
    s0: sen("rule", 0).at,
    k2001: inSen("rule", 0, "2001"),
    canadian: inSen("rule", 0, "Canadian"),
    miners: inSen("rule", 0, "miners"),
    need: inSen("rule", 0, "need"),
    qualified: inSen("rule", 0, "qualified"),
    experts: inSen("rule", 0, "expert's"),
    signoff: inSen("rule", 0, "sign-off"),
    often: inSen("rule", 0, "often"),
    independent: inSen("rule", 0, "independent"),
    one: inSen("rule", 0, "one")
  }
};
const CAPTION_WORDS = TICKER.filter((t) => t.at >= BANNER_END - 2).filter((t) => !HAS_QUESTION || t.at < Q.at - 3);
// one serif accent per place's chips (PROVISIONAL picks — the exact caption token, punctuation included)
const CAPTION_ACCENT = [
  { scene: "claim", word: "Bre-X" },
  { scene: "claim2", word: "claimed" },
  { scene: "hype", word: "pennies" },
  { scene: "partner", word: "partner" },
  { scene: "mystery", word: "geologist" },
  { scene: "crack", word: "insignificant" },
  { scene: "truth", word: "salted" },
  { scene: "collapse", word: "sank" },
  { scene: "pension", word: "alone" },
  { scene: "felderhof", word: "sold" },
  { scene: "rule", word: "qualified" }
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
    claim: { enter: { k: "approach", at: P.claim.at + 2, dur: 36 }, exit: { k: "craneDown", ...crane(P.claim.end) } },
    // claim → claim2 → … → pension: one crane per hand-over (the outgoing sinks out through the bottom, the next rises from below)
    claim2: { enter: { k: "fromBelow", ...crane(P.claim2.at) }, exit: { k: "craneDown", ...crane(P.claim2.end) } },
    hype: { enter: { k: "fromBelow", ...crane(P.hype.at) }, exit: { k: "craneDown", ...crane(P.hype.end) } },
    // hype → partner: the crane runs under LightBreak 1 (peak at P.partner.at − 2, on "That March")
    partner: { enter: { k: "fromBelow", ...crane(P.partner.at) }, exit: { k: "craneDown", ...crane(P.partner.end) } },
    mystery: { enter: { k: "fromBelow", ...crane(P.mystery.at) }, exit: { k: "craneDown", ...crane(P.mystery.end) } },
    crack: { enter: { k: "fromBelow", ...crane(P.crack.at) }, exit: { k: "craneDown", ...crane(P.crack.end) } },
    truth: { enter: { k: "fromBelow", ...crane(P.truth.at) }, exit: { k: "craneDown", ...crane(P.truth.end) } },
    collapse: { enter: { k: "fromBelow", ...crane(P.collapse.at) }, exit: { k: "craneDown", ...crane(P.collapse.end) } },
    // pension → the fair HERO: the pension cranes out, done by the card's paint, under LightBreak 2's rise
    pension: { enter: { k: "fromBelow", ...crane(P.pension.at) }, exit: { k: "craneDown", ...before(P.pension.end, 36) } },
    // the fair hero → felderhof rising from below under the card's end (V35's ev after its punch card); out before the lesson card
    felderhof: { enter: { k: "fromBelow", at: heroEnd("fair") - 17, dur: 44 }, exit: { k: "craneDown", ...before(P.felderhof.end, 36) } },
    // the lesson hero → rule rising from below under it; rule pushes into flare 2
    rule: { enter: { k: "fromBelow", at: heroEnd("lesson") - 17, dur: 44 }, exit: { k: "pushLight", ...before(P.rule.end, 22) } },
    close: { enter: { k: "approach", at: P.close.at + 2, dur: 36 }, exit: own }
  };
})();
const PLACE_IDS = ["hook", "claim", "claim2", "hype", "partner", "mystery", "crack", "truth", "collapse", "pension", "felderhof", "rule", "close"];
const PLACES = [
  ...PLACE_IDS.map((id) => ({ id, ...P[id], ...HO[id] })),
  { id: "brand", ...P.brand, enter: { k: "own" }, exit: { k: "own" } }
];
const DROP = 110;
const LIGHT_WINDOWS = [
  // ★ V36: the ONE light frame — the salted core under the loupe (truth) — plus the house close. Out by P.truth.end (V35's rule:
  //   the white is gone before the next place's dark construction rises through the watermark).
  { a: P.truth.at - 10, b: P.truth.end, inF: 20, outF: 22 },
  // the close: flare 2 recedes onto the white stage (gone by P.close.at + 17), which then drains to navy, done as BANKER$ starts
  //   (brand.at + 22). (Draining while the flare still receded left its bloom as a white blob on the navy, f 2150 of the skeleton.)
  { a: P.close.at - 2, b: P.brand.at + 22, inF: 20, outF: 26 }
];
const T_ = {
  hook: hookTimes(W_.hook, P.hook.end),
  claim: claimTimes(W_.claim, P.claim.end),
  claim2: claim2Times(W_.claim2, P.claim2.end),
  hype: hypeTimes(W_.hype, P.hype.end),
  partner: partnerTimes(W_.partner, P.partner.end),
  mystery: mysteryTimes(W_.mystery, P.mystery.end),
  crack: crackTimes(W_.crack, P.crack.end),
  truth: truthTimes(W_.truth, P.truth.end),
  collapse: collapseTimes(W_.collapse, P.collapse.end),
  pension: pensionTimes(W_.pension, P.pension.end),
  felderhof: felderhofTimes(W_.felderhof, P.felderhof.end),
  rule: ruleTimes(W_.rule, P.rule.end)
};
const SCN = [
  { id: "hook", cams: hookCamWindows(T_.hook), ev: hookSfx(T_.hook) },
  { id: "claim", cams: claimCamWindows(T_.claim), ev: claimSfx(T_.claim) },
  { id: "claim2", cams: claim2CamWindows(T_.claim2), ev: claim2Sfx(T_.claim2) },
  { id: "hype", cams: hypeCamWindows(T_.hype), ev: hypeSfx(T_.hype) },
  { id: "partner", cams: partnerCamWindows(T_.partner), ev: partnerSfx(T_.partner) },
  { id: "mystery", cams: mysteryCamWindows(T_.mystery), ev: mysterySfx(T_.mystery) },
  { id: "crack", cams: crackCamWindows(T_.crack), ev: crackSfx(T_.crack) },
  { id: "truth", cams: truthCamWindows(T_.truth), ev: truthSfx(T_.truth) },
  { id: "collapse", cams: collapseCamWindows(T_.collapse), ev: collapseSfx(T_.collapse) },
  { id: "pension", cams: pensionCamWindows(T_.pension), ev: pensionSfx(T_.pension) },
  { id: "felderhof", cams: felderhofCamWindows(T_.felderhof), ev: felderhofSfx(T_.felderhof) },
  { id: "rule", cams: ruleCamWindows(T_.rule), ev: ruleSfx(T_.rule) }
];
const FLARES = [
  // flare 1 (hook → claim): PROVISIONAL points — the gold bar's lit crown (hook builder) → a lit point on the BUSANG stack (claim builder)
  { peak: P.hook.end - 2, from: { x: 290, y: 431 }, to: { x: 288, y: 602 }, ghost: 2.2, grow: 24, hold: 2, recede: 16 },   // from: the bar's lit crown at f178 (builder H, hookFlarePoint) → to: the rig's work lamp at f199 (builder B)
  // flare 2 (rule → close): PROVISIONAL points — the steel seal's lit rim (rule builder) → the close's centre, where BANKER$ will stand
  //   recede 16 (as flare 1): the bloom is gone over the white stage before it drains (see LIGHT_WINDOWS)
  { peak: P.rule.end - 1, from: { x: 540, y: 760 }, to: { x: 540, y: 960 }, grow: 26, hold: 2, recede: 16 }
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
  // ── the arrivals that are their own moves: out of flare 1 (claim), up from under the two hero cards (felderhof, rule)
  ...moveCue(HO.claim.enter, 0.38),
  ...moveCue(HO.felderhof.enter, 0.4),
  ...riserCue(HO.felderhof.enter, 0.31),
  ...moveCue(HO.rule.enter, 0.4),
  ...riserCue(HO.rule.enter, 0.31),
  // ── the two LightBreaks (on "That March" and "To be fair"): EarnEdits' low whoosh rising with each flash (V34/V35's line)
  within(BRKS[0])(EE.flash, BREAKS[0] - 11, BRKS[0].end, 0.6),
  within(BRKS[1])(EE.flash, BREAKS[1] - 11, BRKS[1].end, 0.6),
  // ── the two hero cards clearing (their rack focus releasing) as the next place rises under them (V35's line after its punch card)
  span("whooshsoft", heroEnd("fair") - 26, heroEnd("fair") - 6, 0.35),
  span("whooshsoft", heroEnd("lesson") - 26, heroEnd("lesson") - 6, 0.35),
  // ── both flares: V46's own flare line, the low whoosh swelling with the bloom
  ...FLARES.map((fl) => {
    const T = ft(fl);
    return within({ at: fl.peak - T.grow, end: fl.peak + T.hold + T.recede })(EE.flash, fl.peak - Math.round(0.55 * T.grow), fl.peak + T.hold + T.recede, 0.6);
  }),
  // ── the close's question (only when the film has one): its lines fly in from depth, each with a soft whoosh, then the lift to the logo.
  //    ★ V36 has none: the close arrives on the music alone (STYLE 2026-10-23: no whoosh under the fly into the closing logo).
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
const BED_END = Math.min(TOTAL_FRAMES, BED_FRAMES);
const bedVolume = (f) => MUSIC_VOL * (1 - rInOut(f, BED_END - BED_FADE, BED_END));
export const BreXGold = ({ solo, probe, dumpCues, orbcheck }) => {
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
        shot(P.partner, HO.partner, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxPartner, { ...P.partner, w: W_.partner, stage: fieldLight })),
        shot(P.mystery, HO.mystery, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxMystery, { ...P.mystery, w: W_.mystery, stage: fieldLight })),
        shot(P.crack, HO.crack, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxCrack, { ...P.crack, w: W_.crack, stage: fieldLight })),
        shot(P.truth, HO.truth, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxTruth, { ...P.truth, w: W_.truth, stage: fieldLight })),
        shot(P.collapse, HO.collapse, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxCollapse, { ...P.collapse, w: W_.collapse, stage: fieldLight })),
        shot(P.pension, HO.pension, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxPension, { ...P.pension, w: W_.pension, stage: fieldLight })),
        shot(P.felderhof, HO.felderhof, /* @__PURE__ */ (0,jsx_runtime.jsx)(BxFelderhof, { ...P.felderhof, w: W_.felderhof, stage: fieldLight })),
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
          size: isPunch(h) ? 74 : h.words.length > 7 ? 54 : 64,
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
