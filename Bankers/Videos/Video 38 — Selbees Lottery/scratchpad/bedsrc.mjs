// THE BED'S SOURCE TRACK — ONE copy, read by mkbed.mjs (cut + fades) and bedenv.mjs (the envelope
// bake, which re-reads the source every pass). Two hard-coded copies are how a bed swap cuts one
// track and envelopes another.
// ★ 2026-09-23: the user's Yeat track ("use the yeat song") — V9's bed, public/music_user2.mp3,
// 200.1 s, stereo; its own intro sits ~10 dB under for the first 10 s, then flat ≈ −7.9 dB.
// (Was music_succession_bed.mp3 on V26's first wiring.)
// ★ 2026-09-25, V27: "use the same song" — the same Yeat track, copied from Video 26/public/.
// ★ 2026-09-25 (later): "I put a new song in public, use that" — public/WW3 MUSIC.MP3, 144.6 s, stereo,
// a hotter track than the Yeat one (≈ −19 dB mean, swinging ±4 dB by section; its own outro runs
// quieter over the last ~15 s). The Yeat bed is kept in public/ but no longer mounted.
// ★ V28 (2026-09-26): the same song as the previous video (the standing rule) — V27's WW3 MUSIC.MP3,
// copied with the clone. Change it here only if the user names another.
// ★ V28 take (2026-09-26): "use the song from 2 videos ago" — Video 26's bed, the Yeat track
// (public/music_user2.mp3, copied from Video 26/public/). WW3 MUSIC.MP3 stays in public/, unmounted.
// ★ V29 (2026-09-27): the same song as the previous video (the standing rule) — V28 shipped on the
// Yeat track, copied with the clone. Change it here only if the user names another.
// ★ V30 (2026-09-28): the same song as the previous video (the standing rule) — V29 shipped on the
// Yeat track, copied with the clone. Change it here only if the user names another.
// ★ V30 take (2026-09-28): "use a song other than the yeat one" — V27's WW3 MUSIC.MP3 (the only other song
// used in the active look; the user's own pick then), copied from Video 27/public/. The Yeat track stays in
// public/, unmounted. ⚠ WW3 is far quieter at source than Yeat (V27 set MUSIC_VOL 0.50 from rendered stems,
// against Yeat's 0.13) — never carry either number; set it from this film's rendered stems.
// ★ V30 (2026-09-28, later): "use another song" — the SUCCESSION track (public/music_succession_bed.mp3, 166 s,
// stereo), Style 3's other established bed (V12, V25), copied from Video 25/public/. WW3 and Yeat stay in public/,
// unmounted; the WW3 envelope state is archived as bedenv.ww3.json.
// ★ V30 (2026-09-29): "change the song, and lower its volume" — DAPHNI 'Poly' (V15's bed, copied from Video 15/public/).
// It is 138.3 s against a 145.3 s film, so music_poly_bed.mp3 is Poly with a 4 s crossfade into its own section from 8 s
// (264.7 s). Succession, WW3 and Yeat stay in public/, unmounted.
// ★ V31 (2026-09-30): the same song as the previous video (the standing rule). V30 shipped on Poly, so
// music_poly_bed.mp3 is copied from Video 30/public/, at the same 7 dB under the voice. Change it only if the user
// names another.
// ★ V31 take (2026-09-30): "use alberto balsalm for the song, I've used it in the past with either 100bps or offcamceleb
// videos" — Aphex Twin, "Alberto Balsalm" (Style 3 V14; OffCamCelebs 005/015/016 — one identical file, md5 e7d396280f2c),
// copied from Video 14/public/ as music_alberto_balsalm.mp3. 310.8 s, stereo; its first 10 s sit ~4 dB under the rest, and
// it builds from about −18.5 to −15.3 dB by 90 s, which the per-window envelope holds. ⚠ A YouTube rip: the claim-risk
// flag V14 carried. Poly stays in public/, unmounted; its envelope is archived as bedenv.poly.json.
// ★ V32 take (2026-10-02): "lets go with everything in its right place" — Radiohead, "Everything In Its Right Place"
// (instrumental; the OffCamCelebs bed, 001/019–023), picked from nine previews under the hook. Copied from
// OffCamCelebs/001-grant-cardone/public/ as music_radiohead.mp3: 267.5 s, stereo. ⚠ A COMMERCIAL track (the same
// claim-risk flag as every bed here). Balsalm stays in public/, unmounted.
// ★ V33 take (2026-10-06): "use radiohead" — the same track, public/music_radiohead.mp3 (267.5 s, 48 kHz stereo). Flat gain
//   0.235 + a 13-knot envelope hold every 10 s window within 0.4 dB of the 7.0 dB speech-gated target (scratchpad/mixlog.txt).
// ★ V34 take (2026-10-07): "I also put the song in public" — Future, "LIKE ME" (instrumental, ft 42 Dugg & Lil Baby), the
//   user's pick for this film, copied from the dropped Y2Mate rip as public/music_likeme.mp3: 134.5 s, 44.1 kHz stereo. Its
//   intro sits ~10 dB under until the beat drops at ~12.4 s; flat ≈ −7 dB to ~120 s, then its outro. ⚠ A YouTube rip of a
//   commercial track (the same claim-risk flag as every bed here). Radiohead stays in public/, unmounted.
// ★ V34 take 2 (2026-10-07): the new read is 122 s, past the track's own fade-out (~121 s of the track, i.e. ~109 s of film
//   from the drop). The bed is cut from scratchpad/music_likeme_ext.wav — the same track with ONE of its own 24-s loops
//   repeated (spliced 50.0 → 26.0 s, sample-aligned, 30-ms crossfade; scratchpad/bedext.mjs). Run bedext.mjs before mkbed.mjs.
// ★ V35 (2026-10-09, user: "the song should be changed to yeat"): the Yeat track, V9's bed — public/music_user2.mp3 (copied
//   from Video 29/public/, md5 603ea3647a79, identical to Video 9's), 200 s, stereo. Its intro sits ~11 dB under until the
//   beat drops at 13.35 s (measured, 10-ms RMS); flat ≈ −8 dB after. LIKE ME stays in public/, unmounted; its envelope is
//   archived as scratchpad/bedenv.likeme.json.
// ★ V36 take (2026-10-12, user: "VO in public, use the same song for now"): V35's bed, the same Yeat track, already in
//   public/music_user2.mp3 (copied with the clone). The same 13.25-s offset puts the drop on the film's opening frames.
// ★ V36 (2026-10-12, user: "use DAPHNI - Poly, then render"): DAPHNI 'Poly' — V15/V30's bed, public/music_poly.mp3 (copied from
//   Video 30/public/, md5 db35d82857a1, identical to Video 15's), 138.3 s, stereo. Full level from its first second (≈ −15 dB in
//   1-s windows, −11.3 dB mean over the film's 115 s, against the Yeat track's −7.9), flat to ~127 s: it is cut from 0 s and needs
//   no loop. The Yeat track stays in public/, unmounted; its envelope is archived as scratchpad/bedenv.yeat.json.
// ★ V37 take (2026-10-13, user: "vo in public, use the same song"): V36's bed, DAPHNI 'Poly', public/music_poly.mp3 (copied
//   with the clone, byte-identical to Video 36's). 138.3 s against a 132.0-s film: cut from 0 s, no loop.
// ★ V38 (2026-10-14, user: "I also put the song to use in public"): quietshadow — FOCUS (Slowed & Reverb) [Instrumental],
//   public/, 119.7 s, stereo. Its own intro is near-silent to ~6.7 s (the first beat), and it breaks to near-silence for a
//   moment before ~62.8 s (a 45-dB jump back in): measure both against the wired take before cutting the bed.
// ★★ V39 (2026-10-20, user: "Find and use the 711 song used in the last bankers video, also, make sure the sound levels are
// right"): public/711.mp3, copied from Bankers Video 11's public/ (md5 07f395e8…; Videos 12–13 moved on to Strings + 808, so 11 is
// the last Bankers film on it). A music file, not branding. 210.0 s, 44.1 kHz stereo. Measured in 2-s windows: a build at −14 to −19 dB
// to its DROP at 117.38 s (Bankers V11's 10-ms / 40–200 Hz measurement), then a steady body at −6.4 to −7.6 dB to 204 s, falling
// away from ~205 s. ★ First cut 109.25 s in (the hook on the build, the drop on "Put"): measured, the build then sat 15.7 dB under
// the voice through the hook, near-inaudible (Timur on this song in Bankers: "I can barely hear it"). So the film OPENS ON THE DROP
// (0.35 s in, just after the 0.3-s fade-in) and stays in the steady body to the end, at one level: the body is extended by one of its
// own 22.07-s sections (scratchpad/mk711ext.mjs -> scratchpad/711_ext.wav; the seam at 176.0 s falls on the song's own beat). ONE GAIN for the whole song (Timur on this same song, Bankers 2026-10-15:
// "choose one volume for the song and don't change the volume"): bedenv.mjs sets it from the body's windows, the build keeps its
// own lower level. FOCUS stays in public/, unmounted; its envelope is archived as scratchpad/bedenv.focus.json.
// ⚠ Commercial track: the user's own pick, as in Bankers.
// ★ V41 (2026-10-23, user: "Use the same song (DAPHNI \"Poly\")"): public/music_poly.mp3 (V36's bed), 138.3 s against a 101.2-s
//   film, so no extension. 711 is not carried.
// ★ V41 take (2026-10-23, user, sending "Golden_Hour_1.mp3": "use this song for the video"): public/music_golden_hour.mp3 (md5
//   45a9e8ff2619), 308.1 s, 44.1 kHz stereo, 320 kb/s. Measured in 2-s windows: a quiet intro (−28 dB) to its full entry at 8.31 s
//   (10-ms energy, the first block of the body above −19 dB), then −14 to −16 dB, stepping up to −11 to −13 dB from ~72 s (film
//   ~64 s): the per-window envelope holds it. Poly stays in public/, unmounted; its envelope is archived as bedenv.poly.json.
//   ⚠ The user's own file; its licence is theirs to confirm, as with every bed here.
// ★ V42 (2026-10-26, user: "i need to change the song … so it was also not used in the previous 3 4 videos", then "yes" to Karl
//   Casey "Glitch in Reality"; the user's file, public/music_glitch.mp3, 206.3 s, 44.1 kHz stereo). Measured in 2-s windows: an intro
//   to ~17 s, a body at −7 to −9 dB, breakdowns at 46–60 s and 118–132 s (−13 dB), the outro from ~189 s. Golden Hour stays in public/,
//   unmounted; its envelope is archived as scratchpad/bedenv.golden.json. "make the loudness of the music the same settings as of the
//   previous videos": the same 9.5-dB speech-gated target, voice-band EQ and per-window controller as V41/V42-golden.
// ★ V43 (2026-10-26, the standing rule as of 2026-10-26: never a bed from the last 3–4 films — V39 711, V40 Poly, V41/V42 Golden Hour,
//   V42 Glitch in Reality): quietshadow — FOCUS (Slowed & Reverb) [Instrumental], from the user's own list, last used on V38 (five films
//   back), copied from Video 39/public/ as public/music_focus.mp3 (119.7 s). Its own near-silence 60.25–62.5 s and DROP at 62.84 s
//   (V38's measurement) are cut to meet the film's one light break (the punch card's flash, frame 1453 = 48.43 s).
// ★ V43 (2026-10-26, user: "add this song" — an upload): Me And The Devil (Instrumental), public/music_devil.mp3, 182.6 s, stereo,
//   loud throughout (≈ −8 dB mean, no breakdown before its outro at ~178 s). Its stop-start intro hits at 0.19, 0.62, 1.54, 1.97,
//   2.90, 3.32, 4.25 s, then the beat runs from 5.60 s. The film opens ON the first hit (offset 0.09 s → frame 3), so the hook rides
//   the stop-start intro and the beat lands at film 5.5 s. FOCUS stays in public/, unmounted.
// ★ V44 (2026-10-27, the 3–4-film rule: V40 Poly, V41 Golden Hour, V42 Glitch, V43 Devil): FOCUS again, last shipped on V38,
//   copied from Video 43/public/ as public/music_focus.mp3 (119.7 s). Its drop (62.84 s) meets the punch flash (frame 1472 =
//   49.07 s, after the take's three 0.50-s holds): offset 13.77 s. Devil is not carried.
// ★ V44 (2026-10-28, user: "use this as a song" — an upload, A_Good_Man_with_a_Broken_Heart.mp3): public/music_goodman.mp3, 118.8 s,
//   44.1 kHz stereo. A soft intro (−16…−20 dB, 1-s RMS) to its main part, which hits at 10.43 s (10-ms energy, −32 → −6 dB), body
//   ≈ −6 dB to ~104 s, outro from ~105 s. Per the user's V43 note ("start the song when the main part starts"), the film opens ON
//   that hit (offset 10.33 → film frame 3); the film's 91.6 s then end at 101.9 s of the track, before its outro. FOCUS stays in
//   public/, unmounted.
// ★ V45 (2026-10-31, the 3–4-film rule: V41 Golden Hour, V42 Glitch, V43 Devil, V44 Good Man): DAPHNI "Poly", V40's (and Bob's,
//   V36's) bed, five films back, copied from Video 41/public/ as public/music_poly.mp3 (138.3 s, full level from its first second:
//   cut from 0 s, no loop needed for an 86.5-s film).
// ★ V46 (2026-11-01, the standing rule: never a bed from the last 3–4 films — V42 Glitch in Reality, V43 FOCUS/Devil, V44 Good Man,
//   V45 Poly): Golden Hour, the user's own pick for V41 (five films back), copied from Video 41/public/ as public/music_golden_hour.mp3
//   (md5 45a9e8ff2619, 308.1 s). Its full entry at 8.31 s lands on frame 3; it steps up ~2 dB at ~72 s of the song (film ~64 s), which
//   the per-window envelope holds.
export const BED_SRC = "public/music_golden_hour.mp3";
// ★ THE BAKED FILE'S NAME IS READ FROM THE COMPOSITION (V31). The clone carried "bed_v30_faded.mp3" in mkbed.mjs and
// bedenv.mjs while Composition.tsx mounts "bed_v33_faded.mp3", so the envelope would have been baked into a file
// nothing plays. One copy, in the file that plays it.
import fs from "fs";
const bedFile = fs.readFileSync("src/bnx/Composition.tsx", "utf8").match(/const BED_FILE = "([^"]+)"/);
if (!bedFile) throw new Error("bedsrc: no BED_FILE in Composition.tsx — refusing");
export const BED_OUT = "public/" + bedFile[1];

// ★ V34: the film opens ON the beat — the bed starts 12.3 s in (the drop at ~12.4 s), so its 107.6 s run ends just before
//   the outro (~120 s). A flat intro under the hook would have been boosted ~10 dB by the per-window envelope.
// ★ V35 (Yeat): the drop at 13.35 s lands on the film's frame 3 — the film opens ON the beat (V34's rule), under a 0.3-s
//   fade-in (a 1-s fade would swallow the first beat)
// ★ V36 Poly: no intro to skip — the film opens on its first bar
// ★ V38 FOCUS (2026-10-14): the song cuts to near-silence 60.25–62.5 s and DROPS at 62.84 s (10-ms energy, the first block
//   above −20 dB). It is cut so the drop meets "In March 2020" (the voice's onset 56.90 s in vo_trimmed.wav, its 10-ms
//   energy — whisper said 56.84): the music drops out under "…landed between two of the worst" and comes back on the cut into
//   March 2020. Offset 62.84 − 56.90 = 5.94 s; the song's first beat (6.17 s) then lands at film 0.23 s, under the 0.3-s fade-in.
// ★ 2026-10-15 (the fifth 0.50-s hold, after "You get scared on the worst ones."): "In" of "In March 2020" moved to 57.25 s
//   (captions_vo.js audio onset), so the offset is 62.84 − 57.25 = 5.59 s and the drop still meets it.
// ★ V39 (2026-10-19): the same song as the previous video (the standing rule), FOCUS. Cut so its drop (62.84 s) meets the first
//   section flash's peak (frame 1544, 51.47 s: "So why pay more for the slower company?"): offset 62.84 − 51.47 = 11.37 s. The
//   song's near-silence (60.0–62.2 s) then falls under "For Nvidia, about $23.", the music drops out before the question and
//   comes back on the flash. The film opens mid-section under the 0.3-s fade-in (the intro is skipped).
// ★ V41 Poly (V36's cut): no intro to skip — the film opens on its first bar, the bed cut from 0 s
// ★ V41 Golden Hour: the film opens ON the song's entry (8.31 s) — offset 8.21 s puts it on frame 3, under the 0.3-s fade-in
// ★ V42 Glitch in Reality: the film opens ON the beat after the first breakdown (its first hit at 59.65 s lands on frame 3); the
//   second breakdown (118–132 s) then falls at film 58–72 s, around the second section flash (60.6 s)
// ★ V43 FOCUS: drop 62.84 s − the punch flash 48.43 s = 14.41 s; the near-silence then falls under "…gold fell 8%." and the music comes
//   back on the flash. The film opens mid-section (past the intro) under the 0.3-s fade-in.
// ★ (user, same day: "start the song when the song starts, i mean the main part, like at sec 5 or 6 of the song"): the stop-start
//   intro is skipped; the main beat (5.60 s) lands on frame 3. (Was 0.09: the intro under the hook.)
export const BED_OFFSET = 8.21;   // V46 Golden Hour: the film opens ON the song's entry (8.31 s → frame 3), under the 0.3-s fade-in
// FOCUS was:   // V44: FOCUS's drop (62.84 s) on the punch flash (frame 1472 = 49.07 s, after the three holds)
export const DROP_FILM = 0;
export const ONE_GAIN = false;   // per-window envelope (Golden Hour steps up by section)
export const BED_FADE_IN = 0.3;
// ★★ V41 (2026-10-23, user: "the audio levels are still wrong, compare them to previous 100bps videos"). Measured on the masters
//   (scratchpad/lv/band.py: each master fitted as voice + bed, the bed's level under the speech-gated voice): full band, Golden
//   Hour at −7 dB sat inside the corpus (−4.7 … −9.9), but IN THE VOICE'S OWN BAND (300–3400 Hz) it sat only 9.6 dB under the
//   voice, against Bob −10.7, V39 −13.9, V35 −17.3, V38 −18.6. A mid-heavy song masks the voice at a level a sparser one does not.
//   So the song's mids are cut where the voice lives (applied before the envelope, so the controller measures the cut bed).
export const BED_EQ = "equalizer=f=700:t=o:w=1.6:g=-5,equalizer=f=2000:t=o:w=1.6:g=-5";
