// THE BED'S SOURCE TRACK — named ONCE (root CLAUDE.md: "Name the bed in bedsrc.mjs"), read by mkbed.mjs (the flat cut)
// and bedenv.mjs (the envelope bake, which re-reads the source every pass).
// ★ Timur, 2026-09-28, with the take: "vo in public, use a song other than the yeat one" — the SUCCESSION track
// (music_succession_bed.mp3, 166 s, stereo), the established alternative bed: Style 3 V12 / V25, and Style 3 Video 30 the
// same day on "use another song". Its calm, polished piano suits the Bankers tone (Bankers/CLAUDE.md §0). COPIED into
// this video's public/ from Style 3 Video 30. The Yeat track (Video 1's bed) stays in public/, unmounted.
// ⚠ Commercial (HBO's Succession theme): the client needs the rights before this posts publicly — flagged in every build
// summary, as the Yeat track was.
// ★★ Timur, 2026-09-30: "use a different song", then (over the WW3 track) "different song", and he chose Daphni — "Poly"
// (music_daphni_poly.mp3, 138.3 s, stereo), copied from OffCamCelebs 014 (a music file, not branding; the firewall is Vision
// Media's). Measured in 4 s windows it sits at −12 to −10 dB after a softer first 4 s (−16.6): no drop, so it plays from its
// top in one regime (DROP_SRC null), and bedenv.mjs holds the separation per window. The Succession and WW3 envelope states
// are archived (bedenv.succession.json, bedenv.ww3.json), never reused. ⚠ Commercial: flag the client's rights.
// ★★★ Timur, 2026-10-01: "change the song to yeat and render" — back to the Yeat track (V9's music_user2.mp3, Video 1's bed),
// copied from Video 1's public/. Its quiet intro jumps ~11 dB at 13.33 s (measured on Video 1), so the bed starts where the
// drop lands on the `what` section's first word and the hook plays over the intro (bedenv.mjs: intro 8 dB under, body 3.5).
// Poly's envelope and baked bed are archived (bedenv.poly.json, bed.poly.mp3). ⚠ Commercial: flag the client's rights.
// ★★★★ Timur, 2026-10-02: "use everything in its right place for the song, then render" — Radiohead, "Everything In Its Right
// Place" (Instrumental), copied from Style 1 Video 1's public/ (267.5 s, stereo, 48 kHz). Measured in 4 s windows over its
// first two minutes it holds −15 to −17 dB from its first second: no quiet intro and no drop, so it plays from its top in one
// regime (DROP_SRC null). The Yeat envelope and baked bed are archived (bedenv.yeat.json, bed.yeat.mp3). The Yeat file stays in
// public/, unmounted. ⚠ Commercial: flag the client's rights.
// ★ Video 5, Timur 2026-10-05: "use another song" (no song named) — the SUCCESSION track again, the established Bankers alternative
// (Video 2; music_succession_bed.mp3, 166 s, stereo, copied from Video 2's public/). Measured in 4 s windows over the film's length it
// holds −7.9 to −8.9 dB from its first second: no drop, so it plays from its top (DROP_SRC null). The Radiohead envelope and bed are
// archived (bedenv.radiohead.json, bed.radiohead.mp3). ⚠ Commercial (HBO's Succession theme): flag the client's rights.
// ★★ Video 6, Timur 2026-10-05: "use yeat for the song" — the Yeat track (music_yeat.mp3, copied from Video 4's public/). Its quiet
// intro jumps ~11 dB at the drop, so DROP_SRC lands the drop on the `what` section's first word ("On September 29") and the hook
// plays over the intro (bedenv.mjs: intro 8 dB under, body 3.5). The Succession envelope and baked bed are archived
// (bedenv.succession.json, bed.succession.mp3). ⚠ Commercial: flag the client's rights.
// ★★★ Video 6, Timur 2026-10-07: "use the song I put in the new [Style 3] video's public folder" — Future, "LIKE ME" (Instrumental,
// ft 42 Dugg & Lil Baby), the Y2Mate rip he dropped in Style 3 Video 34's public/ (134.5 s, 44.1 kHz stereo), copied here as
// public/music_likeme.mp3 (a music file, not branding). Measured in 4 s windows: an intro at −16 to −18 dB to ~12.8 s, then a
// steady body at −7 ± 0.7 dB to ~120 s, then its outro. Like Yeat it DROPS, so the drop lands on "On September 29" and the hook
// plays over the intro (bedenv.mjs: intro 8 dB under the voice, body 3.5). The Yeat envelope and baked bed are archived
// (bedenv.yeat.json, bed.yeat.mp3); music_yeat.mp3 stays in public/, unmounted. ⚠ Commercial (a YouTube rip of a commercial
// track): flag the client's rights.
// ★★ Video 9, Timur 2026-10-12, after the LIKE ME master was rendered: "I forgot to change the song, use DAPHNI - Poly" — Daphni,
// "Poly" (public/music_daphni_poly.mp3, 138.3 s, 44.1 kHz stereo, copied from Video 3's public/: the same file as Videos 2–3).
// Measured in 4 s windows over the film's length: −16.6 dB in its first 4 s, then −14 rising slowly to −11.2 by 76 s, with no
// drop and no fade inside the film. So it plays from its top in ONE regime (DROP_SRC null), and bedenv.mjs holds 3.5 dB under the
// voice per 10 s window. LIKE ME's envelope and baked bed are archived (scratchpad/bedenv.likeme.json, out/archive/bed.likeme.mp3);
// music_likeme.mp3 stays in public/, unmounted. ⚠ Commercial: flag the client's rights.
// ★★ Video 10, Timur 2026-10-13, after the Poly master had rendered: "nevermind, stop it and change the song to everything in its
// right place" — Radiohead, "Everything In Its Right Place" (Instrumental), public/music_radiohead.mp3 (267.5 s, 48 kHz stereo,
// copied from Video 5's public/: the same file, md5 b10b3791…, as Videos 4–5 and Style 1 Video 1). Measured in 4 s windows over the
// film's length it holds −16.1 to −16.6 dB from its first second: no quiet intro, no drop, no fade inside the film, so it plays
// from its top in ONE regime (DROP_SRC null). Poly's envelope and baked bed are archived (scratchpad/bedenv.poly.json,
// out/archive/bed.poly.mp3), and so is the Poly master (out/archive/tesla_flying_roadster.poly.mp4); music_daphni_poly.mp3
// stays in public/, unmounted. ⚠ Commercial: flag the client's rights.
/** ★ Timur, 2026-10-15: "I put in a song in public use that" — public/711.mp3 (210.0 s, stereo, 44.1 kHz). Measured in 2-s windows: a
 *  quiet intro (−25 dB) to ~6 s, the beat at −10 to −11 dB to ~72 s, a breakdown (−29 rising to −14 dB) from 74 s, and the track's
 *  big DROP at 117.38 s (−24.8 → −9.3 dB in one 10-ms window; +27.6 dB in the 40–200 Hz band), then −10 dB to ~205 s. The film rides
 *  the build into that drop: bedPlan starts the source 108.8 s in, so the drop lands on the what section's first word. The Radiohead
 *  envelope and baked bed are archived (scratchpad/bedenv.radiohead.json, out/archive/bed.radiohead.mp3). */
export const BED_SRC = "public/711.mp3";

/** THE DROP: the Yeat track had one (its quiet intro jumped ~11 dB at 13.33 s, and bedPlan started the source so it
 *  landed on the `what` section's first word). The Succession bed has NONE — measured in 4 s windows it sits at
 *  −8.2 ± 0.4 dB from its first second — so it plays from its top and bedenv.mjs runs one regime of 10 s windows. */
/** ★ measured in 10 ms windows (2026-10-01): the intro runs ≈ −21 dB to 13.33 s, a 10 ms gap at 13.34 s, and the drop HITS at
 *  13.345 s (−8.5, then −2 dB). bedenv.mjs steps the gain over 0.1 s centred on DROP_SRC, so it sits 0.05 s early: the step
 *  completes IN the gap, and the hit plays at the body's level (centred on 13.33, ~30 ms of the hit came through ~2 dB hot). */
/** ★ LIKE ME (2026-10-07), measured in 10 ms windows with an ACCURATE seek (output-side -ss; an input-side seek on the mp3 showed
 *  40 ms of decoder silence that is not in the song): the intro runs at −13 to −18 dB right up to the hit at 12.85 s (−4, then
 *  +1 dB). There is NO gap before it, as Yeat had. bedenv.mjs steps the gain over 0.1 s centred on DROP_SRC, so DROP_SRC sits
 *  0.05 s early: the step completes AS the hit lands, and the hit plays at the body's level (the intro's last 0.1 s dips a
 *  little toward the body's lower gain). */
/** ★ ONE GAIN THROUGH THE DROP (Timur, 2026-10-15: "the audio level of the song changes at the beat drop for some reason, fix that").
 *  The two-regime mix (the intro held 8 dB under the voice, the body 3.5 dB under, a 0.1-s gain step AT the drop) suited Yeat and LIKE
 *  ME, whose intros are quiet and flat; 711's build RISES into its drop, so the intro took 5.8 dB less cut than the body and the bed
 *  stepped down by itself as the beat hit. With DROP_HOLD nothing steps AT the drop: the gain eases from the build's level to the body's
 *  over the 2.5 s before it, under the build's own rise, and only the song's own drop is heard (bedenv.mjs). Held flat at the body's
 *  gain, the build sat ~13 dB under the voice ("I can barely hear it"): it keeps its own level, 6 dB under. */
export const DROP_HOLD = true;
/** ★★★ ONE VOLUME FOR THE WHOLE SONG (Timur, 2026-10-15: "I told you do not change it throughout the video, choose one volume for the
 *  song and don't change the volume. Right now it goes quiet after the beat drop"). No envelope, no ramp, no step: a single gain, set so
 *  the body after the drop sits at the target under the voice (the median of its windows); the build before the drop plays at the
 *  song's own level under that same gain. bedenv.mjs reports every window and judges none but the body's spread. */
export const ONE_GAIN = true;
export const DROP_SRC = 117.33;   // 711's drop hits at 117.38 s: the 0.1-s step centred 0.05 s early completes as it lands (Radiohead and Poly had none; LIKE ME 12.80, Yeat 13.29)

/** where the bed starts in the source, where the drop falls in the film (0: none), and the film's length — all from the
 *  generated captions (never a hand-typed frame) */
export const bedPlan = (capText) => {
  const TOTAL = Number(capText.match(/TOTAL_FRAMES = (\d+)/)[1]);
  const VO_END = Number(capText.match(/VO_END = (\d+)/)[1]);
  const SECT = JSON.parse(capText.match(/export const SECT = (\{.*?\}) as const;/)[1]);
  if (DROP_SRC === null) return { len: TOTAL / 30, voEnd: VO_END / 30, dropFilm: 0, offset: 0 };
  // (Video 9: "On October 8th" starts at 12.90 s, 0.10 s after the song's own drop — the source cannot start before its first frame,
  // so the drop lands 3 f early, on the push INTO the white coverage place, as the section opens)
  const dropFilm = Math.min(SECT.what.at / 30, DROP_SRC);
  const offset = DROP_SRC - dropFilm;
  if (!(offset >= 0)) throw new Error(`bedPlan: the drop (${DROP_SRC}s) cannot land at ${dropFilm}s — refusing`);
  return { len: TOTAL / 30, voEnd: VO_END / 30, dropFilm, offset };
};
