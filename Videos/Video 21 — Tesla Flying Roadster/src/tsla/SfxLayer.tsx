// ══ BANKERS CLONE of Style 3 Video 26 — the Bankers pass applied (Bankers/CLAUDE.md §2): greys → the blue
// family by Resources/apply-palette.mjs, every face Anton 400, the outro carries the Bankers logo.

import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// SFX — added on the user's explicit instruction (2026-08-09e).
//
// ⚠ THIS IS A DELIBERATE DIVERGENCE FROM THE REFERENCE CORPUS, recorded so nobody "fixes" it
// later: NO transition SFX were found in any of the ten Style 3 references. The user asked for
// a cue on every beat — coin/cash when money moves, ticks on a count-up, a gentle whoosh on the
// transitions, a muted thud when a big stat lands, a paper flick on the deposit beats — so they
// are here, at a strictly background level. If a future Style 3 video should sound like the
// corpus instead, drop this one component.
//
// ★ LEVELS ARE MEASURED, NEVER EAR-GUESSED, and they need BOTH criteria — this is where the
// first pass went wrong. Every file has a very different source level, so the same multiplier
// means very different loudness per file. Measured means (ffmpeg volumedetect):
//   coin -19.0 · ding -35.9 · flick -18.1 · pop -33.4 · thud -14.5 · tick -11.5 · whoosh -41.4
// EVEN[] normalises each file to a -39 dB mean, which makes them equally loud AS EACH OTHER.
//
// ⚠ But evening by mean alone left every cue INAUDIBLE: rendering the mix with and without SFX
// changed a 0.6s window at a cue by 0.1 dB, and the SFX bed measured in isolation peaked at
// -24 dB against a -2.8 dB VO peak — 21 dB under, where the house band is 10-14 dB under the VO
// PEAK. These assets have a much lower crest factor than the click_cam detents the mean-only
// rule was written against, so the mean target under-shoots them badly.
// PRESENCE is the common trim that fixes it: +6 dB puts the SFX peak ~15 dB under the VO peak
// and the SFX mean level with the music bed — audible punctuation sitting on top of the bed,
// never competing with the voice. Change PRESENCE, not the individual gains: the EVEN[] figures
// are what keep the cues balanced against one another.
//
// `tick` carries a further ~3 dB cut because it fires nine times in a row under the count-up.
//
// ★ AUDIO_LEAD — a click Sequence scheduled to start on frame N is only audible from N+1 (a
// consistent ~33ms encoder-priming delay, identical across renders). Every cue is therefore
// scheduled one frame early so the attack lands on the beat it punctuates.
// ══════════════════════════════════════════════════════════════════════════════════════════════

// ★★ VIDEO 9 ADDS A SECOND, SMOOTH REGISTER (user, 2026-08-28: "I also want more smooth,
// satisfying SFX. Also more of them throughout the video").
//
// The inherited seven are ALL TRANSIENT — short, bright, percussive. That is exactly why simply
// adding more of them makes a track feel busy rather than satisfying: every cue is an impact, and
// impacts do not accumulate into a groove. The four synthesized in `scratchpad/mksfx.sh` are the
// opposite register — they have attack SHAPE, they swell and they resolve — so a beat can be
// scored with a GESTURE instead of a hit:
//   riser — an airy chirp+noise swell, under a beat arriving or a camera move starting
//   sub   — a soft 52 Hz landing, for a solid coming to rest (all body, no click)
//   bloom — a warm C5+G5+C6 chime with a slow attack, for a reveal that should feel earned
//   glide — a band-passed noise breath, the smooth counterpart to `whoosh`
export type SfxName =
  | "coin" | "ding" | "flick" | "pop" | "thud" | "tick" | "whoosh"
  | "riser" | "sub" | "bloom" | "glide"
  // ★★ THE USER'S PACK (Style 3 videos/SFX), imported 2026-08-28 for a try-out pass. Each file
  // was trimmed to ONE clean hit first — several were multi-variation exports (the whoosh file
  // held five back to back, the click file three) — see scratchpad/mknewsfx.sh.
  | "ping" | "whooshlong" | "whooshsoft" | "click" | "data"
  | "airwoosh" | "chain" | "lowwoosh" | "swoosh"
  // ★ SHORT VARIANTS. A sound has to be as long as the moment it punctuates and no longer:
  // ping's 3.6s decay is right for the pair's payoff and absurd on a small reveal, and chain's
  // 3.0s run is the loop, not an accent. Truncating with LEN would hard-cut mid-decay and click,
  // so these are real files with real fades. `chainshort` is sliced AROUND chain's 2.08s peak
  // rather than from its head, or it would be a second of nothing.
  | "pingshort" | "chainshort" | "datashort" | "datamid"
  // ★★ TIMUR'S EPIDEMIC SOUND SET (Bankers STYLE §16, 2026-10-23: "from now on, use these sound effects in the videos"), cut one clean hit
  // per family by Resources/sfx-epidemic/mkpack.sh. The families above keep their names and jobs and now play cuts of his files
  // (whooshsoft, whooshlong, airwoosh, swoosh, lowwoosh, sub, ping, pingshort, flick, coin, click, tick, data…); three are new:
  | "clock" | "type" | "flash";

/** each file normalised to a common -39 dB mean, i.e. equally loud as each other.
 *  gain = 10^((-39 - measured_mean)/20). Measured 2026-08-28 with ffmpeg volumedetect:
 *  coin -19.0 · ding -35.9 · flick -18.1 · pop -33.4 · thud -14.5 · tick -11.5 · whoosh -41.4
 *  riser -21.3 · sub -13.2 · bloom -22.6 · glide -23.0 */
const EVEN: Record<SfxName, number> = {
  // ★ 2026-10-23: the families recut from Timur's Epidemic Sound set, re-normalised by the same rule from their measured means
  // (python mean dB → 10^((−39 − mean)/20), × 0.71 with a tail); the ones whose source did not change keep their old values below
  // ★ then MATCHED, family by family, to Video 15's heard levels on the rendered stems (scratchpad/sfxlevels.py, 2026-10-23): equal mean
  // misjudges a sparse hit (the coin read 18 dB hot, the page turn 8.6), and the boom and the soft whooshes read under
  coin: 0.427,   // Falling Coins, one hit · 0.55 s · −49.6 dB (equal-mean 3.39 → −18 dB to Video 15's coins)
  flick: 0.136,  // Page Turn 03 · 0.62 s · −30.7 dB (equal-mean 0.367 → −8.6 dB)
  tick: 0.44,    // one tick of the Clock · 0.18 s · −45.7 dB (to Video 15's ticks, −26 dBFS heard)
  sub: 0.315,    // Boom, Low Hit · 1.90 s · −22.5 dB (+8 dB: it read 11 dB under Video 15's)
  clock: 0.41,   // the Clock's ticking run · 2.40 s · −47.4 dB — its ticks grow through the run, and at equal mean (1.87) the loud ones hit
                 // −13 dBFS over the coins: held to a texture's −26 dBFS at its LOUDEST tick (measured on the stem, 2026-10-23)
  type: 0.283,   // Typewriter, fast · 3.00 s · −36.7 dB (to the data texture's −25 dBFS)
  flash: 0.216,  // Camera Flash, vintage · 1.00 s · −29.3 dB (to an accent's −24 dBFS)
  ding: 0.699,
  pop: 0.525,
  thud: 0.060,
  whoosh: 1.318,
  // ⚠ THE SUSTAINED FOUR SIT ~3 dB UNDER THEIR EQUAL-MEAN VALUE. Equal MEAN is the wrong target
  // for a sound with a long tail: a 1.5s riser at the same mean as a 0.07s pop puts twenty times
  // the energy into the mix and swamps the bed. The trim is what lets them be used freely.
  riser: 0.092,  // equal-mean 0.130 × 0.71
  bloom: 0.107,  // equal-mean 0.151 × 0.71
  glide: 0.112,  // equal-mean 0.158 × 0.71

  // ── the user's pack, same rule: normalise to a −39 dB mean, then hold anything with a tail
  // ~3 dB under that (equal MEAN over-weights a long sound against a short one)
  ping: 0.743,         // 3.60s · measured -39.4 dB · equal-mean 1.047 x 0.71
  whooshlong: 0.202,   // 1.05s · measured -28.1 dB · equal-mean 0.285 x 0.71
  whooshsoft: 0.290,   // 2026-10-23: Softs, hit 1 · 0.75s · -24.3 dB · equal-mean 0.184, +4 dB to Video 15's
  click: 0.447,        // 2026-10-23: UI Click (Back) · 0.30s · -32.0 dB · equal-mean
  data: 0.286,         // 2.28s · measured -31.1 dB · equal-mean 0.403 x 0.71
  airwoosh: 0.365,     // 2026-10-23: Long Whooshes, hit 4 · 1.65s · -28.2 dB · equal-mean 0.288 x 0.71, +5 dB to Video 15's
  chain: 0.947,        // 3.00s · measured -41.5 dB · equal-mean 1.334 x 0.71
  lowwoosh: 0.300,     // 2026-10-23: Transition Whoosh 01 · 1.05s · -28.7 dB · equal-mean 0.305 x 0.71, +2.8 dB to Video 15's
  swoosh: 0.104,       // 2026-10-23: Transition Whoosh 02 · 1.25s · -18.4 dB · equal-mean 0.093 x 0.71, +4 dB to Video 15's
  pingshort: 0.850,    // same source as ping, less tail → less energy, so a touch hotter
  chainshort: 0.700,
  datashort: 0.340,
  datamid: 0.310,
};
/** the common trim over the EVEN[] normalisation — THE one knob for overall SFX level (change
 *  this, never the individual gains: EVEN[] is what keeps the cues balanced against each other).
 *  History: 2.0 (+6 dB) for the old quiet transients → **1.26 (−4 dB from that)** on the user's
 *  2026-08-28 note "sfx are too loud" — the new pack's sounds are denser and longer-spanned, so the same
 *  presence read hotter. */
// ★ BANKERS VIDEO 1 (2026-09-26): 1.26 → 1.59 (+2 dB). Measured from the rendered SFX stem at full bandwidth
// (scratchpad/sfxpeaks.mjs), the cues sat 20–24 dB under the voice peak against Style 3's ~15, over a Yeat bed held
// 3.5 dB under the voice — the demo's own note was that 17–22 dB under is "too quiet to hear the journey".
const PRESENCE = 1.59;
const GAIN = Object.fromEntries(
  Object.entries(EVEN).map(([k, v]) => [k, v * PRESENCE]),
) as Record<SfxName, number>;

const AUDIO_LEAD = 1;
const LEN: Record<SfxName, number> = {
  coin: 16, ding: 40, flick: 18, pop: 16, thud: 30, tick: 5, whoosh: 44,
  riser: 45, sub: 57, bloom: 60, glide: 29,
  ping: 108, whooshlong: 39, whooshsoft: 22, click: 9, data: 68, airwoosh: 49, chain: 90, lowwoosh: 31, swoosh: 37,
  pingshort: 39, chainshort: 32, datashort: 29, datamid: 48,
  clock: 72, type: 90, flash: 30,
};

/** `swell` (Bankers, 2026-09-26): the cue's volume BUILDS over its first `swell` frames, from 15% to full on a
 *  1.6-power curve. Made for the riser, which must grow INTO the reveal and resolve on the caption. */
export type Cue = { s: SfxName; at: number; dur?: number; fade?: number; vol?: number; swell?: number };

/**
 * ★★★ WHERE EACH FILE'S AUDIBLE PART BEGINS — the first 10 ms window reaching 50% of its peak,
 * measured by scratchpad/peaks.py, in FRAMES at 30fps. Everything before this is inaudible lead-in.
 */
const ONSET: Record<SfxName, number> = {
  // (2026-10-23: re-measured for the Epidemic Sound cuts — the first 10 ms window at 50% of the file's peak)
  coin: 1, ding: 0, flick: 9, pop: 0, thud: 0, tick: 1, whoosh: 0,
  riser: 9, sub: 1, bloom: 0, glide: 6,
  ping: 0, whooshlong: 13, whooshsoft: 6, click: 0, data: 0,
  airwoosh: 13, chain: 0, lowwoosh: 14, swoosh: 8,
  pingshort: 0, chainshort: 4, datashort: 0, datamid: 0,
  clock: 2, type: 1, flash: 3,
};

/**
 * Sounds that must STOP when their visual stops. A process texture still running after the thing
 * it describes has settled is the "random SFX" problem; a struck bell ringing on over an object
 * that is still on screen is not. So the sustained ones are cut to the visual's own window and
 * the decay ones are allowed to ring out — but never past the end of their BEAT.
 */
const SUSTAINED = new Set<SfxName>([
  "data", "datamid", "datashort", "chain", "chainshort", "clock", "type",
  "lowwoosh", "airwoosh", "swoosh", "whooshlong", "whooshsoft", "riser", "glide", "whoosh",
]);

/**
 * ★★★ THE ONLY WAY A CUE MAY BE WRITTEN (user, 2026-08-28: "ensure that the START of some of these
 * sound effects sync with the START of their corresponding visuals. Same with the endings. I don't
 * want SFX appearing out of nowhere with no visual on screen and just randomly.")
 *
 * The previous model placed each file so its PEAK hit the visual's landing frame — which says
 * nothing about where the file STARTS or ENDS, and that is exactly what went wrong:
 *   · `chain` peaks 62 frames in, so a chain cue BEGAN 25 frames before its beat even mounted;
 *   · `ping` is 108 frames long, so the pair's payoff ring carried on for 69 frames after the
 *     pair had left the screen.
 * Both are audible with nothing on screen to explain them.
 *
 * `within(beat)` returns a cue builder that guarantees three things:
 *   1. START — the file's AUDIBLE ONSET lands on the frame the visual starts moving. The silent
 *      lead-in may sit earlier; nothing you can hear does.
 *   2. FLOOR — it can never begin before its own beat has mounted.
 *   3. END — it is cut, with a real fade so the truncation cannot click, at the visual's end
 *      (sustained sounds) or at the beat's end (decay sounds), whichever applies.
 */
export const within = (beat: { at: number; end: number }) =>
  (s: SfxName, visFrom: number, visTo?: number, vol = 1): Cue => {
    const from = Math.max(Math.round(beat.at), Math.round(visFrom - ONSET[s]));
    const stopBy = SUSTAINED.has(s) && visTo !== undefined
      ? Math.min(Math.round(visTo), Math.round(beat.end))
      : Math.round(beat.end);
    const dur = Math.max(3, Math.min(LEN[s], stopBy - from));
    return { s, at: from, dur, fade: dur < LEN[s] ? Math.min(10, Math.max(3, Math.round(dur / 3))) : 0, vol };
  };

/** the same sound landing on a SEQUENCE of visuals — one per object as each appears */
export const runWithin = (beat: { at: number; end: number }) =>
  (s: SfxName, from: number, to: number, n: number, vol = 1): Cue[] => {
    const w = within(beat);
    return Array.from({ length: n }, (_, i) =>
      w(s, from + ((to - from) * i) / Math.max(1, n - 1), undefined,
        vol * (1 - 0.4 * (i / Math.max(1, n - 1)))));
  };

export const SfxLayer: React.FC<{ cues: Cue[]; total: number }> = ({ cues, total }) => (
  <>
    {cues.map((c, i) => {
      const from = Math.max(0, Math.round(c.at) - AUDIO_LEAD);
      if (from >= total) return null;
      const dur = Math.min(c.dur ?? LEN[c.s], total - from);
      if (dur <= 0) return null;
      const base = GAIN[c.s] * (c.vol ?? 1);
      const fade = c.fade ?? 0;
      const swell = c.swell ?? 0;
      const env = (f: number) =>
        (fade > 0 ? Math.max(0, Math.min(1, (dur - f) / fade)) : 1) *
        (swell > 0 ? 0.15 + 0.85 * Math.pow(Math.max(0, Math.min(1, (f + 1) / swell)), 1.6) : 1);
      return (
        <Sequence key={i} from={from} durationInFrames={dur}>
          <Audio src={staticFile(`sfx/${c.s}.wav`)}
            volume={fade > 0 || swell > 0 ? (f) => base * env(f) : base} />
        </Sequence>
      );
    })}
  </>
);

/** a run of ticks under a counter — the number is heard climbing, not just seen */
export const tickRun = (at: number, dur: number, n = 9): Cue[] =>
  Array.from({ length: n }, (_, i) => ({
    s: "tick" as const,
    at: at + (dur * i) / n,
    // the run tapers as the count settles, so it lands rather than stopping dead
    vol: 1 - 0.45 * (i / (n - 1)),
  }));

/** coins arriving onto a pile — a handful, thinning out, not one per coin */
export const coinRun = (at: number, gap = 7, n = 5): Cue[] =>
  Array.from({ length: n }, (_, i) => ({
    s: "coin" as const,
    at: at + i * gap,
    vol: 1 - 0.5 * (i / (n - 1)),
  }));

/** ★ THE HOUSE GESTURE — a beat arriving. The riser leads INTO the cut (it is 1.5s long and its
 *  swell has to peak on the beat, not start there) and the sub lands ON it. Used on every one of
 *  the fifteen beat entrances, which is what makes the turnover feel scored rather than merely
 *  frequent. */
export const arrive = (at: number, vol = 1): Cue[] => [
  { s: "riser", at: at - 34, vol: 0.85 * vol },
  { s: "sub", at, vol: 0.9 * vol },
];

/** a softer version for a move WITHIN a beat — a camera push, a hand-over — where a landing
 *  would over-punctuate */
export const move = (at: number, vol = 1): Cue[] => [{ s: "glide", at: at - 12, vol: 0.8 * vol }];

/**
 * ★★★ A PROCESS SOUND IS SYNCED BY SPAN, NOT BY PEAK (user, 2026-08-28: "sync the futuristic 02
 * sound better").
 *
 * `sync()` is right for a HIT — one transient landing on one frame. The Futuristic-02 calculating
 * sound is not a hit; it is a PROCESS, and it is synced when it starts as the thing starts
 * computing and stops as the thing lands. Peak-syncing a 2.28s texture to a 38-frame bar fill left
 * it running 28 frames past the bar, and peak-syncing it to a 226-frame curve draw left 6 seconds
 * of the draw silent. Both read as "not in time" even though the peak was exactly on the mark.
 *
 * So: pass the animation's own start and end, and this picks the variant whose LENGTH fits the
 * span (0.95s / 1.6s / 2.28s), or chains copies when the span is longer than the longest file.
 */
