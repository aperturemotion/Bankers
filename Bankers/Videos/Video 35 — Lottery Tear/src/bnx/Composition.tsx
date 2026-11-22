// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
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
import { LtHook, hookCamWindows, hookSfx, hookTimes } from "./hook";
import { LtSales, salesCamWindows, salesSfx, salesTimes } from "./sales";
import { LtSales2, sales2CamWindows, sales2Sfx, sales2Times } from "./sales2";
import { LtPrizes, prizesCamWindows, prizesSfx, prizesTimes } from "./prizes";
import { LtLotteries, lotteriesCamWindows, lotteriesSfx, lotteriesTimes } from "./lotteries";
import { LtEv, evCamWindows, evSfx, evTimes } from "./ev";
import { LtPie, pieCamWindows, pieSfx, pieTimes } from "./pie";
import { LtCounter, counterCamWindows, counterSfx, counterTimes } from "./counter";
import { LtVirginia, virginiaCamWindows, virginiaSfx, virginiaTimes } from "./virginia";
import { LtJackpot, jackpotCamWindows, jackpotSfx, jackpotTimes } from "./jackpot";
import { LtPowerball, powerballCamWindows, powerballSfx, powerballTimes } from "./powerball";
import { LtPowerball2, powerball2CamWindows, powerball2Sfx, powerball2Times } from "./powerball2";
import { LtHonest, honestCamWindows, honestSfx, honestTimes } from "./honest";
import { LtFavors, favorsCamWindows, favorsSfx, favorsTimes } from "./favors";
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

const HAS_VO = true;
const HAS_MUSIC = true;
const HAS_SFX = true;
const MUSIC_VOL = 1;
const BED_FILE = "bed_radiohead.mp3";
const HERO_ACCENT = [
  { scene: "nobody", word: "understands.", tone: "white" },
  { scene: "honest", word: "honest", tone: "white" },
  { scene: "close", word: "honest.", tone: "white" }
];
const isPunch = (h) => h.scene === "nobody";
const accentOf = (h) => {
  const a = HERO_ACCENT.find((x) => x.scene === h.scene && h.words.some((w2) => w2.word === x.word));
  return a ? { i: h.words.findIndex((w2) => w2.word === a.word), tone: a.tone } : void 0;
};
const BREAKS = [SENTENCES.find((s) => s.scene === "nobody").at - 2, SENTENCES.find((s) => s.scene === "honest").at - 2];
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
const cue = (scene, word, occ = 1) => wordFrame(scene, word, occ);
const P = {
  hook: { at: 0, end: cut("sales", 0) },
  sales: { at: cut("sales", 0), end: cut("sales2", 0) },
  sales2: { at: cut("sales2", 0), end: cut("prizes", 0) },
  prizes: { at: cut("prizes", 0), end: cut("lotteries", 0) },
  lotteries: { at: cut("lotteries", 0), end: heroPaint("nobody") },
  // nobody: the PUNCH hero card alone; ev rises from below under its end
  ev: { at: cut("ev", 0), end: cut("pie", 0) },
  pie: { at: cut("pie", 0), end: cut("counter", 0) },
  counter: { at: cut("counter", 0), end: cut("virginia", 0) },
  virginia: { at: cut("virginia", 0), end: cut("jackpot", 0) },
  jackpot: { at: cut("jackpot", 0), end: cut("powerball", 0) },
  powerball: { at: cut("powerball", 0), end: cut("powerball2", 0) },
  powerball2: { at: cut("powerball2", 0), end: heroPaint("honest") },
  // honest: s0 is the hero ("Now, the honest part."); the place is the schools/fun line under it
  honest: { at: cut("honest", 1), end: cut("favors", 0) },
  favors: { at: cut("favors", 0), end: heroPaint("close") },
  close: { at: cut("close", 1), end: LAST_WORD_END.close + 4 },
  brand: { at: LAST_WORD_END.close + 4, end: TOTAL_FRAMES }
};
const W_ = {
  hook: {
    s0: sen("hook", 0).at,
    americans: inSen("hook", 0, "Americans"),
    spent: inSen("hook", 0, "spent"),
    k1047: inSen("hook", 0, "$104.7"),
    billion: inSen("hook", 0, "billion"),
    lottery: inSen("hook", 0, "lottery"),
    tickets: inSen("hook", 0, "tickets"),
    year: inSen("hook", 0, "year"),
    s1: sen("hook", 1).at,
    about: inSen("hook", 1, "About"),
    third: inSen("hook", 1, "third"),
    never: inSen("hook", 1, "never"),
    prizes: inSen("hook", 1, "prizes")
  },
  sales: {
    s0: sen("sales", 0).at,
    census: inSen("sales", 0, "Census"),
    data: inSen("sales", 0, "data"),
    fiscal: inSen("sales", 0, "fiscal"),
    k2024: inSen("sales", 0, "2024")
  },
  sales2: {
    s0: sen("sales2", 0).at,
    sales: inSen("sales2", 0, "sales"),
    nearly: inSen("sales2", 0, "nearly"),
    doubled: inSen("sales2", 0, "doubled"),
    k528: inSen("sales2", 0, "$52.8"),
    billion: inSen("sales2", 0, "billion"),
    k2008: inSen("sales2", 0, "2008")
  },
  prizes: {
    s0: sen("prizes", 0).at,
    prizes: inSen("prizes", 0, "Prizes"),
    paid: inSen("prizes", 0, "paid"),
    back: inSen("prizes", 0, "back"),
    k702: inSen("prizes", 0, "$70.2"),
    billion: inSen("prizes", 0, "billion")
  },
  lotteries: {
    s0: sen("lotteries", 0).at,
    other: inSen("lotteries", 0, "other"),
    k345: inSen("lotteries", 0, "$34.5"),
    billion: inSen("lotteries", 0, "billion"),
    stayed: inSen("lotteries", 0, "stayed"),
    lotteries: inSen("lotteries", 0, "lotteries")
  },
  ev: { s0: sen("ev", 0).at, split: inSen("ev", 0, "split"), name: inSen("ev", 0, "name"), expected: inSen("ev", 0, "expected"), value: inSen("ev", 0, "value") },
  pie: {
    s0: sen("pie", 0).at,
    average: inSen("pie", 0, "average"),
    every: inSen("pie", 0, "every"),
    dollar: inSen("pie", 0, "dollar"),
    tickets: inSen("pie", 0, "tickets"),
    paid: inSen("pie", 0, "paid"),
    about: inSen("pie", 0, "about"),
    k67: inSen("pie", 0, "67"),
    cents: inSen("pie", 0, "cents")
  },
  counter: {
    s0: sen("counter", 0).at,
    ticket: inSen("counter", 0, "ticket"),
    worth: inSen("counter", 0, "worth"),
    less: inSen("counter", 0, "less"),
    costs: inSen("counter", 0, "costs"),
    before: inSen("counter", 0, "before"),
    single: inSen("counter", 0, "single"),
    number: inSen("counter", 0, "number"),
    drawn: inSen("counter", 0, "drawn")
  },
  virginia: {
    s0: sen("virginia", 0).at,
    varies: inSen("virginia", 0, "varies"),
    state: inSen("virginia", 0, "state"),
    s1: sen("virginia", 1).at,
    virginia: inSen("virginia", 1, "Virginia"),
    paid: inSen("virginia", 1, "paid"),
    k80: inSen("virginia", 1, "80"),
    cents: inSen("virginia", 1, "cents"),
    most: inSen("virginia", 1, "most"),
    country: inSen("virginia", 1, "country")
  },
  jackpot: {
    s0: sen("jackpot", 0).at,
    jackpots: inSen("jackpot", 0, "jackpots"),
    grow: inSen("jackpot", 0, "grow"),
    only: inSen("jackpot", 0, "only"),
    nobody: inSen("jackpot", 0, "nobody"),
    wins: inSen("jackpot", 0, "wins")
  },
  powerball: {
    s0: sen("powerball", 0).at,
    k847: inSen("powerball", 0, "$847"),
    million: inSen("powerball", 0, "million"),
    powerball: inSen("powerball", 0, "Powerball"),
    won: inSen("powerball", 0, "won"),
    november: inSen("powerball", 0, "November"),
    k4: inSen("powerball", 0, "4")
  },
  powerball2: {
    s0: sen("powerball2", 0).at,
    draw: inSen("powerball2", 0, "draw"),
    after: inSen("powerball2", 0, "after"),
    paid: inSen("powerball2", 0, "paid"),
    tickets: inSen("powerball2", 0, "tickets"),
    missed: inSen("powerball2", 0, "missed")
  },
  honest: {
    now: sen("honest", 0).at,
    s0: sen("honest", 1).at,
    many: inSen("honest", 1, "Many"),
    states: inSen("honest", 1, "states"),
    share: inSen("honest", 1, "share"),
    schools: inSen("honest", 1, "schools"),
    ticket: inSen("honest", 1, "ticket"),
    buys: inSen("honest", 1, "buys"),
    little: inSen("honest", 1, "little"),
    fun: inSen("honest", 1, "fun")
  },
  favors: {
    s0: sen("favors", 0).at,
    but: inSen("favors", 0, "But"),
    average: inSen("favors", 0, "average"),
    math: inSen("favors", 0, "math"),
    favors: inSen("favors", 0, "favors"),
    lottery: inSen("favors", 0, "lottery")
  },
  close: {
    q0: sen("close", 1).at,
    do: inSen("close", 1, "Do"),
    buy: inSen("close", 1, "buy"),
    ticket: inSen("close", 1, "ticket"),
    jackpot: inSen("close", 1, "jackpot"),
    big: inSen("close", 1, "big"),
    tell: sen("close", 2).at
  }
};
const CAPTION_WORDS = TICKER.filter((t) => t.at >= BANNER_END - 2).filter((t) => t.at < Q.at - 3);
const CAPTION_ACCENT = [
  { scene: "sales", word: "Census" },
  { scene: "sales2", word: "doubled" },
  { scene: "prizes", word: "Prizes" },
  { scene: "lotteries", word: "stayed" },
  { scene: "ev", word: "expected" },
  { scene: "pie", word: "average," },
  { scene: "counter", word: "worth" },
  { scene: "virginia", word: "Virginia" },
  { scene: "jackpot", word: "nobody" },
  { scene: "powerball", word: "Powerball" },
  { scene: "powerball2", word: "missed." },
  { scene: "honest", word: "schools," },
  { scene: "favors", word: "math" }
];
const CAPTION_ACCENT_AT = new Set(CAPTION_ACCENT.map(({ scene, word, occ = 1 }) => {
  const sc = SCENES.find((s) => s.id === scene);
  const hits = CAPTION_WORDS.flatMap((t) => t.parts ?? []).filter((p) => p.at >= sc.startFrame && p.at < sc.endFrame && p.word === word);
  if (hits.length < occ) throw new Error(`CAPTION_ACCENT: "${word}" (#${occ}) is not in the ${scene} captions \u2014 the take changed it`);
  return hits[occ - 1].at;
}));
const HO = (() => {
  const crane = (B) => ({ at: B - 20, dur: 40 });
  const before = (E, dur) => ({ at: E + 2 - dur, dur });
  const own = { k: "own" };
  return {
    hook: { enter: own, exit: { k: "pushLight", ...before(P.hook.end, 20) } },
    // sales → sales2: ONE bar construction (own); prizes → lotteries: the two torn pieces, ONE construction (own)
    sales: { enter: { k: "approach", at: P.sales.at + 2, dur: 36 }, exit: own },
    sales2: { enter: own, exit: { k: "craneDown", ...crane(P.sales2.end) } },
    prizes: { enter: { k: "fromBelow", ...crane(P.prizes.at) }, exit: own },
    lotteries: { enter: own, exit: { k: "pushLight", ...before(P.lotteries.end, 22) } },
    ev: { enter: { k: "fromBelow", at: heroEnd("nobody") - 17, dur: 44 }, exit: { k: "craneDown", ...crane(P.ev.end) } },
    // ★ (integrator, rev 2 popscan VANISH f1057) pie → counter cranes over 52 f, not 40: the counter's bright paper ticket rose ~55
    //   half-size px a frame at the crane's peak — past popscan's 24-px search, its header "vanished" from its tile. 0.77× the speed.
    pie: { enter: { k: "fromBelow", ...crane(P.pie.at) }, exit: { k: "craneDown", at: P.pie.end - 26, dur: 52 } },
    counter: { enter: { k: "fromBelow", at: P.counter.at - 26, dur: 52 }, exit: { k: "craneDown", ...crane(P.counter.end) } },
    virginia: { enter: { k: "fromBelow", ...crane(P.virginia.at) }, exit: { k: "craneDown", ...crane(P.virginia.end) } },
    // jackpot → powerball → powerball2: ONE construction (the column of losing tickets) under ONE camera
    jackpot: { enter: { k: "fromBelow", ...crane(P.jackpot.at) }, exit: own },
    powerball: { enter: own, exit: own },
    powerball2: { enter: own, exit: { k: "pushLight", ...before(P.powerball2.end, 22) } },
    honest: { enter: { k: "fromBelow", at: heroEnd("honest") - 17, dur: 44 }, exit: { k: "craneDown", ...crane(P.honest.end) } },
    favors: { enter: { k: "fromBelow", ...crane(P.favors.at) }, exit: { k: "pushLight", ...before(P.favors.end, 22) } },
    close: { enter: { k: "approach", at: P.close.at + 2, dur: 36 }, exit: own }
  };
})();
const PLACE_IDS = ["hook", "sales", "sales2", "prizes", "lotteries", "ev", "pie", "counter", "virginia", "jackpot", "powerball", "powerball2", "honest", "favors", "close"];
const PLACES = [
  ...PLACE_IDS.map((id) => ({ id, ...P[id], ...HO[id] })),
  { id: "brand", ...P.brand, enter: { k: "own" }, exit: { k: "own" } }
];
const DROP = 110;
const LIGHT_WINDOWS = [
  // ★ V35: the ONE light frame — Virginia vs the U.S. (the fill) — plus the house close
  // ★ (integrator, popscan VANISH f1360) out by P.virginia.end, not + 12 (V34's): the jackpot column rises from below through the
  //   watermark at ~1360 — on a still-white stage the watermark is the black file, and dark ink over the dark column vanished in one
  //   frame. Ending the white by 1364 (its half-way at 1353, inside the 1351–1364 caption gap) puts the white file back first.
  { a: P.virginia.at - 10, b: P.virginia.end, inF: 20, outF: 22 },
  { a: P.close.at - 40, b: P.brand.at + 10, inF: 20, outF: 26 }
];
const T_ = {
  hook: hookTimes(W_.hook, P.hook.end),
  sales: salesTimes(W_.sales, P.sales.end),
  sales2: sales2Times(W_.sales2, P.sales2.end),
  prizes: prizesTimes(W_.prizes, P.prizes.end),
  lotteries: lotteriesTimes(W_.lotteries, P.lotteries.end),
  ev: evTimes(W_.ev, P.ev.end),
  pie: pieTimes(W_.pie, P.pie.end),
  counter: counterTimes(W_.counter, P.counter.end),
  virginia: virginiaTimes(W_.virginia, P.virginia.end),
  jackpot: jackpotTimes(W_.jackpot, P.jackpot.end),
  powerball: powerballTimes(W_.powerball, P.powerball.end),
  powerball2: powerball2Times(W_.powerball2, P.powerball2.end),
  honest: honestTimes(W_.honest, P.honest.end),
  favors: favorsTimes(W_.favors, P.favors.end)
};
const SCN = [
  { id: "hook", cams: hookCamWindows(T_.hook), ev: hookSfx(T_.hook) },
  { id: "sales", cams: salesCamWindows(T_.sales), ev: salesSfx(T_.sales) },
  { id: "sales2", cams: sales2CamWindows(T_.sales2), ev: sales2Sfx(T_.sales2) },
  { id: "prizes", cams: prizesCamWindows(T_.prizes), ev: prizesSfx(T_.prizes) },
  { id: "lotteries", cams: lotteriesCamWindows(T_.lotteries), ev: lotteriesSfx(T_.lotteries) },
  { id: "ev", cams: evCamWindows(T_.ev), ev: evSfx(T_.ev) },
  { id: "pie", cams: pieCamWindows(T_.pie), ev: pieSfx(T_.pie) },
  { id: "counter", cams: counterCamWindows(T_.counter), ev: counterSfx(T_.counter) },
  { id: "virginia", cams: virginiaCamWindows(T_.virginia), ev: virginiaSfx(T_.virginia) },
  { id: "jackpot", cams: jackpotCamWindows(T_.jackpot), ev: jackpotSfx(T_.jackpot) },
  { id: "powerball", cams: powerballCamWindows(T_.powerball), ev: powerballSfx(T_.powerball) },
  { id: "powerball2", cams: powerball2CamWindows(T_.powerball2), ev: powerball2Sfx(T_.powerball2) },
  { id: "honest", cams: honestCamWindows(T_.honest), ev: honestSfx(T_.honest) },
  { id: "favors", cams: favorsCamWindows(T_.favors), ev: favorsSfx(T_.favors) }
];
const FLARES = [
  { peak: P.hook.end - 2, from: { x: 532, y: 624 }, to: { x: 300, y: 790 }, ghost: 2.2, grow: 24, hold: 2, recede: 16 },
  // the two-thirds' lit perforation top (builder A: hookBloom) → the FY2008 column's lit top (builder B)
  { peak: P.favors.end - 1, from: { x: 348, y: 770 }, to: { x: 480, y: 960 }, grow: 26 }
  // the coin's lit rim (builder C)
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
const PUNCH_WORD = HEROES.find((h) => h.scene === "nobody").words.find((x) => norm(x.word) === "nobody").at;
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
    // ★ a LINE DRAWING is "a thing computing": V36 (Bob)'s data tick, held for the whole draw (user, 2026-10-26: "use 100bps sound
    //   effects … in the line chart … in the Bob video, on the chart there is a specific sound effect. Please add that")
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
  // ── the hook: the long woosh under the slam from frame 0 (its lead-in trimmed before frame 0)
  //    (V32's level, 0.35 — the integrator re-judges it against the hook's own first cues)
  cueAt("whooshlong", 0, 40, 0.35),
  // ── every place: its own motion events (family per job), its camera moves, then the hand-over out of it (the travel's whoosh, the
  //    riser on pans and cranes). ★ Each place's LITERAL sounds (the EarnEdits pack, style §9: a vault's bolts, a clock's ticks, notes
  //    counted…) are added here by its builder, each on its own visual, one job per family for the film (see V46's own literal cues, read-only: 100bps-reference/Style 3 videos/Video 46/src/ic/Composition.tsx CUES_RAW
  //    — never imported).
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
  // ── the arrivals that are their own moves: out of the flare (wallet), up from under the punch card (boxes), out of the break (split)
  ...moveCue(HO.sales.enter, 0.38),
  ...moveCue(HO.ev.enter, 0.4),
  ...riserCue(HO.ev.enter, 0.31),
  ...moveCue(HO.honest.enter, 0.4),
  ...riserCue(HO.honest.enter, 0.31),
  // ── ★ (integrator, 2026-11-07) the first LightBreak (V29: gtav dived into the light on "Here's") had no sound under it (sfxgaps: 1138–1169
  //    uncovered — no arrival whoosh follows it, the punch card does): V46's own line, EarnEdits' low whoosh rising with the flash
  within(BRKS[0])(EE.flash, BREAKS[0] - 11, BRKS[0].end, 0.6),
  // ── ★ V34 (integrator, sfxgaps): the second LightBreak (on "Now", into the honest hero) bloomed in silence (1639–1679) — the same line
  within(BRKS[1])(EE.flash, BREAKS[1] - 11, BRKS[1].end, 0.6),
  // ── ★ V34 (integrator, sfxgaps 1086–1105): the punch card clearing (its rack focus releasing) as the light frame's pair rises under it
  span("whooshsoft", heroEnd("nobody") - 26, heroEnd("nobody") - 6, 0.35),
  // ── ★ V33 (integrator, 2026-11-12) flare 2 bloomed in silence (sfxgaps: 2076–2096 uncovered — commit's last cue ends at 2072 and the
  //    "So be honest." hero carries no arrival): V46's own flare line (100bps-reference V46 CUES_RAW), the low whoosh swelling with the
  //    bloom. Flare 1 keeps none: reveal's approach whoosh already rises under it (a second would stack on the hand-over)
  // ★ V34 rev 1 (integrator, sfxgaps 198–208): flare 1 now blooms from the "?" with no arrival under it — both flares get the line
  ...FLARES.map((fl) => {
    const T = ft(fl);
    return within({ at: fl.peak - T.grow, end: fl.peak + T.hold + T.recede })(EE.flash, fl.peak - Math.round(0.55 * T.grow), fl.peak + T.hold + T.recede, 0.6);
  }),
  // ── the close: the question's lines fly in from depth, each with a soft whoosh as its first word arrives
  ...QUESTION.map((ln) => {
    const at = Q_WORDS[ln.idx[0]].at;
    return whoosh(P.close, "whooshsoft", at - 8, at + 20, ln.accent ? 0.5 : 0.35);
  }),
  span("whooshlong", P.close.end - 12, P.brand.at + 18, 0.5)
  // ★ V34 (integrator): the lift to the logo scored to its fast part (the rInOut lift is ~90% done by brand + 18; sfxends: whooshsoft to brand + 44 ran out 47 f early)
];
const VOICE_CLEAR = [];
const FLAM = 3;
const DEDUPED = CUES_RAW.filter((c, i) => c.s !== "airwoosh" ? c.grp !== void 0 || !CUES_RAW.some((d, j) => j !== i && d.s === c.s && d.grp === void 0 && Math.abs(d.at - c.at) <= FLAM && ((d.vol ?? 1) > (c.vol ?? 1) || (d.vol ?? 1) === (c.vol ?? 1) && j < i)) : !CUES_RAW.some((d, j) => j !== i && d.s === "airwoosh" && Math.abs(d.at - c.at) <= 10 && ((d.vol ?? 1) > (c.vol ?? 1) || (d.vol ?? 1) === (c.vol ?? 1) && j < i)));
const CUES = DEDUPED.map((c) => {
  const peak = c.vis ?? c.at;
  return VOICE_CLEAR.some((v) => peak >= v.a && peak <= v.b) ? { ...c, vol: (c.vol ?? 1) * 0.4 } : c;
});
export const LotteryTear = ({ solo, probe, dumpCues, orbcheck }) => {
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
    HAS_MUSIC && play("music") && /* @__PURE__ */ (0,jsx_runtime.jsx)(esm.Audio, { src: aud(BED_FILE), volume: MUSIC_VOL }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe": "bg", style: { position: "absolute", inset: 0 }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, background: theme.bg } }),
      lights.map((l) => /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceLight, { layer: "dark", ...l, white: fieldLight }, `d${l.i}`)),
      fieldLight > 1e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, background: theme.bgLight, opacity: fieldLight } }),
      lights.map((l) => /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceLight, { layer: "white", ...l, white: fieldLight }, `w${l.i}`))
    ] }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Plx, { z, dx, dy, depth: 1, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "absolute", inset: 0, filter: stageFilter }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "absolute", inset: 0, transform: `translateY(${DROP}px)` }, children: [
        shot(P.hook, HO.hook, /* @__PURE__ */ (0,jsx_runtime.jsx)(LtHook, { ...P.hook, w: W_.hook, stage: fieldLight })),
        shot(P.sales, HO.sales, /* @__PURE__ */ (0,jsx_runtime.jsx)(LtSales, { ...P.sales, w: W_.sales, stage: fieldLight })),
        shot(P.sales2, HO.sales2, /* @__PURE__ */ (0,jsx_runtime.jsx)(LtSales2, { ...P.sales2, w: W_.sales2, stage: fieldLight })),
        shot(P.prizes, HO.prizes, /* @__PURE__ */ (0,jsx_runtime.jsx)(LtPrizes, { ...P.prizes, w: W_.prizes, stage: fieldLight })),
        shot(P.lotteries, HO.lotteries, /* @__PURE__ */ (0,jsx_runtime.jsx)(LtLotteries, { ...P.lotteries, w: W_.lotteries, stage: fieldLight })),
        shot(P.ev, HO.ev, /* @__PURE__ */ (0,jsx_runtime.jsx)(LtEv, { ...P.ev, w: W_.ev, stage: fieldLight })),
        shot(P.pie, HO.pie, /* @__PURE__ */ (0,jsx_runtime.jsx)(LtPie, { ...P.pie, w: W_.pie, stage: fieldLight })),
        shot(P.counter, HO.counter, /* @__PURE__ */ (0,jsx_runtime.jsx)(LtCounter, { ...P.counter, w: W_.counter, stage: fieldLight })),
        shot(P.virginia, HO.virginia, /* @__PURE__ */ (0,jsx_runtime.jsx)(LtVirginia, { ...P.virginia, w: W_.virginia, stage: fieldLight })),
        shot(P.jackpot, HO.jackpot, /* @__PURE__ */ (0,jsx_runtime.jsx)(LtJackpot, { ...P.jackpot, w: W_.jackpot, stage: fieldLight })),
        shot(P.powerball, HO.powerball, /* @__PURE__ */ (0,jsx_runtime.jsx)(LtPowerball, { ...P.powerball, w: W_.powerball, stage: fieldLight })),
        shot(P.powerball2, HO.powerball2, /* @__PURE__ */ (0,jsx_runtime.jsx)(LtPowerball2, { ...P.powerball2, w: W_.powerball2, stage: fieldLight })),
        shot(P.honest, HO.honest, /* @__PURE__ */ (0,jsx_runtime.jsx)(LtHonest, { ...P.honest, w: W_.honest, stage: fieldLight })),
        shot(P.favors, HO.favors, /* @__PURE__ */ (0,jsx_runtime.jsx)(LtFavors, { ...P.favors, w: W_.favors, stage: fieldLight })),
        shot(P.close, HO.close, /* @__PURE__ */ (0,jsx_runtime.jsx)(QuestionStage, { ...P.close, w: W_.close }))
      ] }),
      on(P.brand) && /* @__PURE__ */ (0,jsx_runtime.jsx)(BrandClose, { at: P.brand.at + 22, y: 960 })
    ] }) }),
    FLARES.map((fl, i) => /* @__PURE__ */ (0,jsx_runtime.jsx)(LensFlare, { ...fl, stage: fieldLight }, i)),
    BREAKS.map((b, i) => /* @__PURE__ */ (0,jsx_runtime.jsx)(LightBreak, { at: b, hold: 5 }, i)),
    !hero && /* @__PURE__ */ (0,jsx_runtime.jsx)(WordCaption, { words: CAPTION_WORDS, onLight: capLight, accentAt: CAPTION_ACCENT_AT }),
    HEROES.map((h, i) => (
      // ★ (integrator, 2026-11-07) "So be honest." is gone (its 9-f fade done) by Q.at − 2: the question's "Did" arrives from depth at the
      //   block's centre from Q.at − 2 and sat on "be" for two frames (V28's 1-f "be"×"If")
      /* @__PURE__ */ (0,jsx_runtime.jsx)(
        HeroSentence,
        {
          words: h.words,
          end: h.scene === "close" ? Math.min(h.end, Q.at - 2) : h.end,
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
    f >= Q.at - 6 && f < P.brand.at + 40 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-group": "hero", style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(
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
