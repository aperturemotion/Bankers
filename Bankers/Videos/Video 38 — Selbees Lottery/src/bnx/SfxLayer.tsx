// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { aud } from "./aud";

const EVEN = {
  ov_stamp: 0.2061,
  ov_money_drop: 0.1062,
  ov_coins: 0.3308,
  ov_paper_flutter: 0.4548,
  ov_steps: 0.4767,
  ov_chalk: 0.4704,
  ov_clank: 0.0721,
  ov_newspaper: 0.4052,
  ov_paper_unfold: 0.2287,
  ov_printer: 0.1666,
  ov_drawer: 0.359,
  ov_car_away: 0.2633,
  ov_car_start: 0.0842,
  coin: 0.1,
  ding: 0.699,
  flick: 0.09,
  pop: 0.525,
  thud: 0.06,
  tick: 0.03,
  // repeats through the count-ups — held ~3 dB under the rest
  whoosh: 1.318,
  // ⚠ THE SUSTAINED FOUR SIT ~3 dB UNDER THEIR EQUAL-MEAN VALUE. Equal MEAN is the wrong target
  // for a sound with a long tail: a 1.5s riser at the same mean as a 0.07s pop puts twenty times
  // the energy into the mix and swamps the bed. The trim is what lets them be used freely.
  riser: 0.092,
  // equal-mean 0.130 × 0.71
  sub: 0.043,
  // equal-mean 0.051 × 0.84 (short enough to need less)
  bloom: 0.107,
  // equal-mean 0.151 × 0.71
  glide: 0.112,
  // equal-mean 0.158 × 0.71
  // ── the user's pack, same rule: normalise to a −39 dB mean, then hold anything with a tail
  // ~3 dB under that (equal MEAN over-weights a long sound against a short one)
  ping: 0.743,
  // 3.60s · measured -39.4 dB · equal-mean 1.047 x 0.71
  whooshlong: 0.202,
  // 1.05s · measured -28.1 dB · equal-mean 0.285 x 0.71
  whooshsoft: 0.202,
  // 0.90s · measured -25.1 dB · equal-mean
  click: 0.327,
  // 0.22s · measured -29.3 dB · equal-mean
  data: 0.286,
  // 2.28s · measured -31.1 dB · equal-mean 0.403 x 0.71
  airwoosh: 0.101,
  // 1.78s · measured -22.1 dB · equal-mean 0.143 x 0.71
  chain: 0.947,
  // 3.00s · measured -41.5 dB · equal-mean 1.334 x 0.71
  lowwoosh: 0.283,
  // 2.50s · measured -31.0 dB · equal-mean 0.398 x 0.71
  swoosh: 0.065,
  // 1.33s · measured -18.2 dB · equal-mean 0.091 x 0.71
  pingshort: 0.85,
  // same source as ping, less tail → less energy, so a touch hotter
  chainshort: 0.7,
  datashort: 0.34,
  datamid: 0.31,
  gavel: 0.195,
  // 1.00s · measured -24.8 dB · equal-mean (a transient: no long-tail trim)
  canclunk: 0.229,
  // 0.90s · measured -26.2 dB · equal-mean
  canclunk2: 0.237,
  // 0.90s · measured -26.5 dB · equal-mean
  canclunk3: 0.224,
  // 0.90s · measured -26.0 dB · equal-mean
  trayslide: 0.2,
  // 1.10s · measured -26.1 dB · equal-mean 0.230 x 0.87
  coilturn: 0.056,
  // 0.45s · measured -13.9 dB · equal-mean
  chainjingle: 0.193,
  // 0.80s · measured -24.7 dB · equal-mean
  // the user's five: equal MEAN misreads the two whose files are mostly silence (the clock's ticks, the riser's long quiet build),
  // so those are set from their loudest 10 ms against the pack's, then levelled from the rendered stem against V36 (sfxlevels.py)
  clock: 1,
  // 2.90s · ticks peak -28.0 dB (10 ms) · whole-file mean -48.2 is mostly the gaps between ticks
  camflash: 0.398,
  // 1.50s · measured -31.0 dB · equal-mean (a transient)
  typing: 0.514,
  // 10.1s · measured -36.2 dB · equal-mean 0.724 x 0.71
  boom: 0.145,
  // 3.55s · measured -25.2 dB · equal-mean 0.204 x 0.71
  riserwhoosh: 0.364,
  // 3.02s · measured -33.2 dB · equal-mean 0.513 x 0.71; played from its last ~16 f (the rise into the whoosh)
  // ── THE EARNEDITS PACK: install.mjs's equal-mean gains (−39 dB), the long-tail ones held ~3 dB under (the house rule)
  ee_whoosh_fast_small_whoosh_01: 0.166,
  // 1.00s · active -19.4 dB · peak -0.5 dBFS · equal-mean
  ee_whoosh_medium_whoosh_01: 0.098,
  // 2.10s · active -15.4 dB · peak -0.7 dBFS · equal-mean x 0.71
  ee_whoosh_large_whoosh_01: 0.0778,
  // 2.48s · active -15.9 dB · peak 0.3 dBFS · equal-mean x 0.71
  ee_whoosh_low_fast_whoosh: 0.1462,
  // 1.04s · active -18.2 dB · peak -3.4 dBFS · equal-mean
  ee_whoosh_cinematic_whoosh_hit: 0.0824,
  // 6.60s · active -12.0 dB · peak 2.6 dBFS · equal-mean x 0.71
  ee_whoosh_sci_fi_whoosh: 0.0894,
  // 1.67s · active -17.5 dB · peak -3.0 dBFS · equal-mean x 0.71
  ee_whoosh_human_whoosh: 0.8635,
  // 1.73s · active -34.6 dB · peak -18.2 dBFS · equal-mean x 0.71
  ee_whoosh_metal_string_rise: 0.1683,
  // 4.82s · active -20.2 dB · peak -1.6 dBFS · equal-mean x 0.71
  ee_impact_low_hit_01: 0.0735,
  // 12.38s · active -13.8 dB · peak -0.4 dBFS · equal-mean x 0.71
  ee_impact_dramatic_bass_hit: 0.0947,
  // 3.38s · active -17.8 dB · peak -4.3 dBFS · equal-mean x 0.71
  ee_impact_low_bomb_impact: 0.0743,
  // 3.44s · active -13.3 dB · peak -3.3 dBFS · equal-mean x 0.71
  ee_impact_firework_impact: 0.0752,
  // 2.15s · active -13.3 dB · peak -3.2 dBFS · equal-mean x 0.71
  ee_impact_repeating_thud_knocks: 0.0726,
  // 3.44s · active -12.9 dB · peak -3.2 dBFS · equal-mean x 0.71
  ee_money_counting_banknotes: 0.3099,
  // 6.04s · active -26.6 dB · peak -0.4 dBFS · equal-mean x 0.71
  ee_paper_paper_tear_01: 0.1413,
  // 0.99s · active -19.0 dB · peak -2.3 dBFS · equal-mean
  ee_paper_fast_page_turn_01: 0.2519,
  // 1.50s · active -21.7 dB · peak -2.0 dBFS · equal-mean x 0.71
  ee_click_click_01: 0.1035,
  // 0.32s · active -12.1 dB · peak 2.0 dBFS · equal-mean
  ee_click_marimba_click_01: 0.0841,
  // 0.84s · active -12.8 dB · peak 1.8 dBFS · equal-mean
  ee_clock_clock_ticking_01: 0.3245,
  // 5.80s · active -26.4 dB · peak -2.5 dBFS · equal-mean x 0.71
  ee_amb_press_conference_busy_camera_shutters: 0.3135
  // 9.76s · active -27.7 dB · peak -0.6 dBFS · equal-mean x 0.71
};
const PRESENCE = 1.25;
const GAIN = Object.fromEntries(
  Object.entries(EVEN).map(([k, v]) => [k, v * PRESENCE])
);
const AUDIO_LEAD = 1;
const LEN = {
  ov_stamp: 24,
  ov_money_drop: 16,
  ov_coins: 54,
  ov_paper_flutter: 28,
  ov_steps: 120,
  ov_chalk: 90,
  ov_clank: 27,
  ov_newspaper: 48,
  ov_paper_unfold: 72,
  ov_printer: 78,
  ov_drawer: 66,
  ov_car_away: 195,
  ov_car_start: 92,
  coin: 24,
  ding: 40,
  flick: 16,
  pop: 16,
  thud: 30,
  tick: 8,
  whoosh: 44,
  riser: 45,
  sub: 30,
  bloom: 60,
  glide: 29,
  ping: 108,
  whooshlong: 32,
  whooshsoft: 27,
  click: 7,
  data: 68,
  airwoosh: 53,
  chain: 90,
  lowwoosh: 75,
  swoosh: 40,
  pingshort: 39,
  chainshort: 32,
  datashort: 29,
  datamid: 48,
  gavel: 30,
  canclunk: 27,
  canclunk2: 27,
  canclunk3: 27,
  trayslide: 33,
  coilturn: 14,
  chainjingle: 24,
  clock: 87,
  camflash: 45,
  typing: 302,
  boom: 106,
  riserwhoosh: 90,
  ee_whoosh_fast_small_whoosh_01: 30,
  ee_whoosh_medium_whoosh_01: 63,
  ee_whoosh_large_whoosh_01: 75,
  ee_whoosh_low_fast_whoosh: 32,
  ee_whoosh_cinematic_whoosh_hit: 198,
  ee_whoosh_sci_fi_whoosh: 51,
  ee_whoosh_human_whoosh: 52,
  ee_whoosh_metal_string_rise: 145,
  ee_impact_low_hit_01: 372,
  ee_impact_dramatic_bass_hit: 102,
  ee_impact_low_bomb_impact: 104,
  ee_impact_firework_impact: 65,
  ee_impact_repeating_thud_knocks: 104,
  ee_money_counting_banknotes: 182,
  ee_paper_paper_tear_01: 30,
  ee_paper_fast_page_turn_01: 45,
  ee_click_click_01: 10,
  ee_click_marimba_click_01: 26,
  ee_clock_clock_ticking_01: 174,
  ee_amb_press_conference_busy_camera_shutters: 293
};
const ONSET = {
  ov_stamp: 2,
  ov_money_drop: 1,
  ov_coins: 1,
  ov_paper_flutter: 10,
  ov_steps: 15,
  ov_chalk: 16,
  ov_clank: 2,
  ov_newspaper: 1,
  ov_paper_unfold: 1,
  ov_printer: 12,
  ov_drawer: 1,
  ov_car_away: 17,
  ov_car_start: 1,
  coin: 0,
  ding: 0,
  flick: 0,
  pop: 0,
  thud: 0,
  tick: 0,
  whoosh: 0,
  riser: 9,
  sub: 0,
  bloom: 0,
  glide: 6,
  ping: 0,
  whooshlong: 8,
  whooshsoft: 6,
  click: 0,
  data: 0,
  airwoosh: 19,
  chain: 0,
  lowwoosh: 10,
  swoosh: 10,
  pingshort: 0,
  chainshort: 4,
  datashort: 0,
  datamid: 0,
  gavel: 0,
  canclunk: 0,
  canclunk2: 0,
  canclunk3: 0,
  trayslide: 0,
  coilturn: 0,
  chainjingle: 0,
  // the clock's first clear tick (its ticks every 6.6 f build to the loudest at 44 f and fade by 77); the flash's click at 3 f
  //   (peak 4); the boom hits at 1 f; the riser's 50% point is 72 f (its whoosh peaks at 80 and stops dead at 82)
  clock: 17,
  camflash: 3,
  typing: 0,
  boom: 1,
  riserwhoosh: 72,
  // the EarnEdits files: catalog.json onset_s (first 10 ms at 50% of peak), in frames
  ee_whoosh_fast_small_whoosh_01: 6,
  ee_whoosh_medium_whoosh_01: 14,
  ee_whoosh_large_whoosh_01: 24,
  ee_whoosh_low_fast_whoosh: 4,
  ee_whoosh_cinematic_whoosh_hit: 17,
  ee_whoosh_sci_fi_whoosh: 4,
  ee_whoosh_human_whoosh: 6,
  ee_whoosh_metal_string_rise: 31,
  ee_impact_low_hit_01: 0,
  ee_impact_dramatic_bass_hit: 6,
  ee_impact_low_bomb_impact: 10,
  ee_impact_firework_impact: 5,
  ee_impact_repeating_thud_knocks: 5,
  ee_money_counting_banknotes: 11,
  ee_paper_paper_tear_01: 5,
  ee_paper_fast_page_turn_01: 15,
  ee_click_click_01: 0,
  ee_click_marimba_click_01: 2,
  ee_clock_clock_ticking_01: 0,
  ee_amb_press_conference_busy_camera_shutters: 5
};
export const cueAt = (s, vis, dur, vol = 1) => ({ s, at: vis - ONSET[s], dur: Math.min(LEN[s], dur + ONSET[s]), fade: 0, vol });
export const ONSET_OF = (s) => ONSET[s];
const SUSTAINED = /* @__PURE__ */ new Set([
  "data",
  "datamid",
  "datashort",
  "chain",
  "chainshort",
  "lowwoosh",
  "airwoosh",
  "swoosh",
  "whooshlong",
  "whooshsoft",
  "riser",
  "glide",
  "whoosh"
]);
export const within = (beat) => (s, visFrom, visTo, vol = 1) => {
  const from = Math.max(Math.round(beat.at), Math.round(visFrom - ONSET[s]));
  const stopBy = SUSTAINED.has(s) && visTo !== void 0 ? Math.min(Math.round(visTo), Math.round(beat.end)) : Math.round(beat.end);
  const dur = Math.max(3, Math.min(LEN[s], stopBy - from));
  return {
    s,
    at: from,
    dur,
    fade: dur < LEN[s] ? Math.min(10, Math.max(3, Math.round(dur / 3))) : 0,
    vol,
    to: SUSTAINED.has(s) && visTo !== void 0 ? Math.round(visTo) : void 0
  };
};
const LOOP_FROM = { chain: 8, data: 9, datamid: 9, datashort: 9, chainshort: 6 };
export const hold = (beat) => (s, visFrom, visTo, vol = 1) => {
  const first = within(beat)(s, visFrom, visTo, vol);
  const stopBy = Math.min(Math.round(visTo), Math.round(beat.end));
  if (first.at + (first.dur ?? 0) >= stopBy) return [first];
  const XF = 10, grp = `${s}@${first.at}`, out = [];
  const len0 = LEN[s] - 2, skip1 = LOOP_FROM[s] ?? 0, avail = LEN[s] - skip1 - 2;
  const rest = stopBy - (first.at + len0);
  const n = Math.max(1, Math.ceil(rest / Math.max(1, avail - XF)));
  const len = Math.min(avail, XF + Math.ceil(rest / n));
  out.push({ s, at: first.at, dur: len0, fade: XF, vol, xf: true, grp, to: stopBy, skip: 0, fadeIn: 0 });
  let at = first.at + len0 - XF;
  for (let i = 0; i < n; i++) {
    const last = i === n - 1, dur = last ? stopBy - at : len;
    out.push({ s, at, dur, fade: last ? Math.min(10, Math.max(5, Math.round(dur / 3))) : XF, vol, xf: true, grp, to: stopBy, skip: skip1, fadeIn: XF });
    at += len - XF;
  }
  return out;
};
const runWithin = (beat) => (s, from, to, n, vol = 1) => {
  const w = within(beat);
  return Array.from({ length: n }, (_, i) => w(
    s,
    from + (to - from) * i / Math.max(1, n - 1),
    void 0,
    vol * (1 - 0.4 * (i / Math.max(1, n - 1)))
  ));
};
export const SfxLayer = ({ cues, total }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: cues.map((c, i) => {
  const at0 = Math.round(c.at) - AUDIO_LEAD;
  const trim = Math.max(0, -at0);
  const from = Math.max(0, at0);
  if (from >= total) return null;
  const dur = Math.min((c.dur ?? LEN[c.s]) - trim, total - from);
  if (dur <= 0) return null;
  const base = GAIN[c.s] * (c.vol ?? 1);
  const fade = c.fade ?? 0, fadeIn = c.fadeIn ?? 0;
  const shape = (r) => c.xf ? Math.sin(Math.PI / 2 * r) : r;
  const ramp = (f) => (fade > 0 ? shape(Math.max(0, Math.min(1, (dur - f) / fade))) : 1) * (fadeIn > 0 ? shape(Math.max(0, Math.min(1, (f + trim) / fadeIn))) : 1);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(esm.Sequence, { from, durationInFrames: dur, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(
    esm.Audio,
    {
      src: aud(`sfx/${c.s}.wav`),
      startFrom: trim + (c.skip ?? 0),
      volume: fade > 0 || fadeIn > 0 ? (f) => base * ramp(f) : base
    }
  ) }, i);
}) });
const tickRun = (at, dur, n = 9) => Array.from({ length: n }, (_, i) => ({
  s: "tick",
  at: at + dur * i / n,
  // the run tapers as the count settles, so it lands rather than stopping dead
  vol: 1 - 0.45 * (i / (n - 1))
}));
const coinRun = (at, gap = 7, n = 5) => Array.from({ length: n }, (_, i) => ({
  s: "coin",
  at: at + i * gap,
  vol: 1 - 0.5 * (i / (n - 1))
}));
const arrive = (at, vol = 1) => [
  { s: "riser", at: at - 34, vol: 0.85 * vol },
  { s: "sub", at, vol: 0.9 * vol }
];
const move = (at, vol = 1) => [{ s: "glide", at: at - 12, vol: 0.8 * vol }];
