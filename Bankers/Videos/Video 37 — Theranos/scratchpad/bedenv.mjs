// Hold the voice/bed separation PER 10 s WINDOW, not on average (CLAUDE.md, OffCamCelebs 014):
// a slow gain envelope, linear in dB between window centres (so it never pumps), BAKED into the
// bed file together with its fades (static volumes only — the V16 silent-track rule).
//   node scratchpad/bedenv.mjs            (reads out/mix_vo.mp3 + out/mix_music.mp3 — the SOLO
//                                           RENDERS from mixprobe.mjs, never the source files)
// ⚠ IT IS A CONTROLLER: re-render the music stem and run it again with --check — the residuals
// must come back near zero before the envelope is trusted.
// ★ The voice is measured SPEECH-GATED (silences removed): a window with more pauses is not a
// quieter voice, and an ungated mean would duck the bed for the gaps.
import { spawnSync } from "child_process";
import fs from "fs";
import { BED_SRC, BED_OUT, BED_OFFSET, BED_FADE_IN, ONE_GAIN, DROP_FILM, BED_EQ } from "./bedsrc.mjs";

const FF = (process.env.FFMPEG_BIN ?? "C:/Users/Timur/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin");
// ★ G8 (user, 2026-09-29: "Music too loud 7% quieter"): the bed's gain × 0.93 = +0.63 dB of separation, so the
//   target moves 3.5 → 4.13 dB with it (Composition MUSIC_VOL = 0.14 × 0.93)
// ★ 2026-09-29 (later): "change the song, and lower its volume" — the new bed sits 7.0 dB under the voice (≈3 dB
//   quieter than the 4.1 above), still inside Style 3's 3–8 dB band
// ★ 2026-10-15 (V38, user: "are you sure the song volume is right? it seems a little quiet"): 7.0 → 5.0 dB, mid-band
// ★ 2026-10-23 (V41, user: "make the music volume lower and sfx louder"): 5.0 → 7.0 dB (the bed 2 dB quieter)
// ★ 2026-10-23 (V41, "the audio levels are still wrong, compare them to previous 100bps videos"): 7.0 → 9.5 dB with the voice-band
//   cut (bedsrc.mjs BED_EQ): full band where Bob (−9.4), V30 (−9.7) and V32 (−9.9) sit; in the voice band ≈ −15 dB, mid-corpus
// ★ 2026-10-26 (V42, Glitch in Reality, user: "the song is barely heard make it louder"): 9.5 → 6.5 dB (the bed 3 dB louder); with the
//   voice-band cut it still sits inside the corpus (full band ≈ −6.6, voice band ≈ −13.6)
const TARGET = 3.0;   // dB, speech-gated voice over bed — ★ V44 (user, 2026-10-28: "make it a lot more louder … not heard out at all"); was 6.5
// ★ V41: BED_CLAMP (env) lifts the clamp for a FIRST pass from an unattenuated bed (Poly cut flat sat 13 dB OVER the voice), so
//   the flat attenuation and the per-window shape land in one bake; every later pass runs at the ±3-dB default
const CLAMP = Number(process.env.BED_CLAMP ?? 3);   // never move the bed more than ±3 dB per pass
const WIN = 10;
const check = process.argv.includes("--check");

const mean = (file, ss, t, gated) => {
  const af = (gated ? "silenceremove=stop_periods=-1:stop_duration=0.08:stop_threshold=-45dB," : "") + "volumedetect";
  const err = spawnSync(FF + "/ffmpeg.exe", ["-hide_banner", "-nostats", "-ss", String(ss), "-t", String(t),
    "-i", file, "-af", af, "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const m = err.match(/mean_volume: (-?[\d.]+) dB/);
  if (!m) throw new Error(`bedenv: no level for ${file} @${ss}s`);
  return Number(m[1]);
};

// ★ STALE-STEM AND DOUBLE-CORRECTION GUARDS (CLAUDE.md, OffCamCelebs 024 / 025). A stem older than what it was rendered
//   from measures a take or a bed that no longer exists; and the envelope is RELATIVE to the one the bed already carries,
//   so measuring a bed stem rendered BEFORE the last bake applies the same correction twice. Both refuse.
{
  const t = (p) => (fs.existsSync(p) ? fs.statSync(p).mtimeMs : 0);
  for (const p of ["out/mix_vo.mp3", "out/mix_music.mp3"]) if (!t(p)) throw new Error(`bedenv: ${p} missing — run mixprobe.mjs vo music`);
  if (t("out/mix_vo.mp3") < t("public/vo_trimmed.mp3")) throw new Error("bedenv: out/mix_vo.mp3 is OLDER than the take — re-render the voice stem");
  if (t("out/mix_music.mp3") < t(BED_OUT)) throw new Error("bedenv: out/mix_music.mp3 is OLDER than the baked bed — re-render the bed stem");
  if (t("scratchpad/bedenv.json") > t("out/mix_music.mp3")) throw new Error("bedenv: the envelope is newer than the bed stem — re-render it first, or the same correction is applied twice");
}
const cap = fs.readFileSync("src/bnx/captions.ts", "utf8");
const TOTAL = Number(cap.match(/TOTAL_FRAMES = (\d+)/)[1]);
const VO_END = Number(cap.match(/VO_END_FRAME = (\d+)/)[1]);
const len = TOTAL / 30, voEnd = VO_END / 30;

const rows = [];
for (let s = 0; s < voEnd; s += WIN) {
  const t = Math.min(WIN, voEnd - s);
  if (t < 3) break;
  const v = mean("out/mix_vo.mp3", s, t, true), b = mean("out/mix_music.mp3", s, t, false);
  rows.push({ c: s + t / 2, v, b, sep: v - b, adj: Math.max(-CLAMP, Math.min(CLAMP, (v - TARGET) - b)) });
}
// ★ CONTROL THE TAIL (CLAUDE.md, 2026-09-30): the last 4 s of voice — the ask and the sign-off — are measured on
// their own (speech-gated) and controlled as one extra point, which the outro then holds
const TAIL = 4;
{
  const ss = Math.max(0, voEnd - TAIL);
  const v = mean("out/mix_vo.mp3", ss, TAIL, true), b = mean("out/mix_music.mp3", ss, TAIL, false);
  // ★ ASYMMETRIC (2026-10-02, 025): a drift TOWARD the bed (< −0.3 dB) is corrected; one away only past +1.0 dB — the
  //   tail shares a knot with the last window, and a verdict a little clearer than target is the safe side
  const d = (v - TARGET) - b;
  rows.push({ c: voEnd - 0.5, v, b, sep: v - b, adj: Math.max(-CLAMP, Math.min(CLAMP, d < -0.3 || d > 1.0 ? d : 0)), tail: true });
}
const log = rows.map((r) => `${r.c.toFixed(0).padStart(4)}s${r.tail ? " tail" : "     "}  voice ${r.v.toFixed(1)}  bed ${r.b.toFixed(1)}  sep ${r.sep.toFixed(1)}  → ${r.adj >= 0 ? "+" : ""}${r.adj.toFixed(1)} dB`);
console.log(log.join("\n"));
const worst = Math.max(...rows.map((r) => Math.abs(r.sep - TARGET)));
console.log(`worst window off target by ${worst.toFixed(1)} dB (target ${TARGET} dB speech-gated)`);
// ★★ ONE GAIN (V39, 2026-10-20: the 711 song; Timur on this same song in Bankers: "choose one volume for the song and don't change
//   the volume"). No envelope: one constant gain, set so the median window AFTER the drop sits at TARGET; the build before the drop
//   plays at the song's own (lower) level under that same gain. Every window is reported; only the body's median is judged.
if (ONE_GAIN) {
  const body = rows.filter((r) => r.c - WIN / 2 >= DROP_FILM - 0.01);
  if (body.length < 3) throw new Error(`bedenv: ONE_GAIN found ${body.length} window(s) after the drop at ${DROP_FILM.toFixed(2)} s — refusing`);
  const ds = body.map((r) => (r.v - TARGET) - r.b).sort((a, b) => a - b);
  const adj = ds[Math.floor(ds.length / 2)];
  const seps = body.map((r) => r.sep);
  console.log(`ONE GAIN: ${body.length} body windows (after the drop at ${DROP_FILM.toFixed(2)} s), sep ${Math.min(...seps).toFixed(1)}–${Math.max(...seps).toFixed(1)} dB, median off target by ${(-adj).toFixed(1)} dB → ${adj >= 0 ? "+" : ""}${adj.toFixed(1)} dB`);
  if (check) process.exit(Math.abs(adj) <= 0.5 ? 0 : 1);
  const prevPath = "scratchpad/bedenv.json";
  const prev = fs.existsSync(prevPath) ? JSON.parse(fs.readFileSync(prevPath, "utf8")) : null;
  if (prev && prev.oneGain === undefined) throw new Error("bedenv: scratchpad/bedenv.json holds an ENVELOPE (another song's) — archive it and start flat");
  const gain = (prev?.oneGain ?? 0) + adj;
  if (gain > 0) throw new Error(`bedenv: one gain ${gain.toFixed(1)} dB would RAISE the file (clipping risk) — raise MUSIC_VOL instead`);
  fs.writeFileSync(prevPath, JSON.stringify({ target: TARGET, oneGain: gain }, null, 1));
  const FADE_IN = BED_FADE_IN, outStart = Math.max(voEnd, len - 1.4);
  const r = spawnSync(FF + "/ffmpeg.exe", ["-y", "-hide_banner", "-loglevel", "error", "-ss", String(BED_OFFSET), "-i", BED_SRC,
    "-t", len.toFixed(3), "-af", `volume=${gain.toFixed(2)}dB,afade=t=in:st=0:d=${FADE_IN},afade=t=out:st=${outStart.toFixed(3)}:d=${(len - outStart).toFixed(3)}`,
    "-ar", "44100", "-ac", "2", "-c:a", "libmp3lame", "-b:a", "192k", BED_OUT], { encoding: "utf8" });
  if (r.status !== 0) throw new Error("bedenv: ffmpeg failed\n" + r.stderr);
  fs.appendFileSync("scratchpad/mixlog.txt", `\n── bedenv ONE-GAIN pass ${new Date().toISOString()}\n${log.join("\n")}\none gain ${gain.toFixed(2)} dB\n`);
  console.log(`baked ${BED_OUT} at ONE gain ${gain.toFixed(2)} dB`);
  process.exit(0);
}
if (check) process.exit(worst <= 0.8 ? 0 : 1);

// ── bake: fades + the envelope, in one pass from the source bed ─────────────────────────────────
// ⚠ the envelope is RELATIVE to what the current file already carries: read the previous knots
// back from the log so a second pass corrects the residual instead of starting over
const prevPath = "scratchpad/bedenv.json";
const prev = fs.existsSync(prevPath) ? JSON.parse(fs.readFileSync(prevPath, "utf8")) : null;
const knots = rows.map((r, i) => ({ c: r.c, db: (prev?.knots[i]?.db ?? 0) + r.adj }));
fs.writeFileSync(prevPath, JSON.stringify({ target: TARGET, knots }, null, 1));
// piecewise-linear dB in t, clamped flat before the first and after the last knot
let expr = String(knots[knots.length - 1].db.toFixed(2));
for (let i = knots.length - 2; i >= 0; i--) {
  const a = knots[i], b = knots[i + 1];
  expr = `if(lt(t,${b.c.toFixed(2)}),${a.db.toFixed(2)}+(${(b.db - a.db).toFixed(3)})*(t-${a.c.toFixed(2)})/${(b.c - a.c).toFixed(2)},${expr})`;
}
expr = `if(lt(t,${knots[0].c.toFixed(2)}),${knots[0].db.toFixed(2)},${expr})`;
const FADE_IN = BED_FADE_IN, outStart = Math.max(voEnd, len - 1.4);
const af = `${BED_EQ ? BED_EQ + "," : ""}volume='pow(10,(${expr})/20)':eval=frame,afade=t=in:st=0:d=${FADE_IN},` +
  `afade=t=out:st=${outStart.toFixed(3)}:d=${(len - outStart).toFixed(3)}`;
const r = spawnSync(FF + "/ffmpeg.exe", ["-y", "-hide_banner", "-loglevel", "error", "-ss", String(BED_OFFSET), "-i", BED_SRC,
  "-t", len.toFixed(3), "-af", af, "-ar", "44100", "-ac", "2", "-c:a", "libmp3lame", "-b:a", "192k",
  BED_OUT], { encoding: "utf8" });
if (r.status !== 0) throw new Error("bedenv: ffmpeg failed\n" + r.stderr);
fs.appendFileSync("scratchpad/mixlog.txt", `\n── bedenv pass ${new Date().toISOString()}\n${log.join("\n")}\nknots: ${knots.map((k) => `${k.c.toFixed(0)}s ${k.db >= 0 ? "+" : ""}${k.db.toFixed(1)}`).join(" · ")}\n`);
console.log(`baked ${BED_OUT} — knots ${knots.map((k) => `${k.db >= 0 ? "+" : ""}${k.db.toFixed(1)}`).join(" ")} dB`);
