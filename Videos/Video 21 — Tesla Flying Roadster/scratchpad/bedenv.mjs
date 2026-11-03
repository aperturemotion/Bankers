// Hold the voice/bed separation PER WINDOW, not on average (root CLAUDE.md, OffCamCelebs 014) — ported from Style 3
// Video 28, with one change for this track: A STEP AT THE DROP. The Yeat intro sits ~11 dB under its body, and 10 s
// windows interpolated linearly would smear a gain ramp across the drop. So the INTRO (film 0 → the drop) is one window
// with its own target, the BODY is 10 s windows from the drop on, and the gain steps between them in 0.1 s AT the drop
// — where the music's own jump hides it. Everything (level, envelope, fades) is BAKED into public/bed.mp3, so the
// composition's music volume is a static 1.
//   node scratchpad/bedenv.mjs            (reads out/probe/v2_vo.mp3 + out/probe/v2_music.mp3 — the SOLO RENDERS from
//                                          audioprobe.mjs, never the source files: the VO is mono and takes the pan law,
//                                          the bed is stereo and does not)
//   node scratchpad/bedenv.mjs --check    (measure only; exit 1 unless every window is within 0.8 dB of its target)
// ⚠ IT IS A CONTROLLER: re-render the music stem and run --check — the residuals must come back near zero before the
// envelope is trusted.
// ★ The voice is measured SPEECH-GATED (silences removed): a window with more pauses is not a quieter voice.
import { spawnSync } from "child_process";
import fs from "fs";
import { BED_SRC, bedPlan, DROP_HOLD, ONE_GAIN } from "./bedsrc.mjs";

const FF = "C:/Users/Timur/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin";
/** dB, speech-gated voice over bed: the body at Style 3's 3.5 (spec §10); the quiet intro at the band's edge (8), so
 *  the hook stays inside the 3–8 dB band and the drop keeps some of its lift */
// ★ Video 11 (Timur, 2026-10-15: "just make sure the audio level for the song is right, I can barely hear it for some reason"): the body
// 3.0 dB under the voice (it was 3.5), the hook's build 6 dB under (it was 8) — and with DROP_HOLD the gain EASES from the build's level to
// the body's over the RAMP s before the drop, so nothing steps at the beat ("the audio level of the song changes at the beat drop")
const TARGET = 3.0, TARGET_INTRO = 6, RAMP = 2.5;
const CLAMP = 3;             // after the first pass, never move a window more than ±3 dB per pass
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

const { len, voEnd, dropFilm, offset } = bedPlan(fs.readFileSync("src/tsla/captions.ts", "utf8"));
// windows: the intro (from 1 s — past the fade-in — to the drop), then 10 s windows from the drop to the voice's end
// a bed with no drop (bedsrc.mjs DROP_SRC null — the Succession track) has no intro regime: 10 s windows from 1 s
const HAS_DROP = dropFilm > 0;
const wins = HAS_DROP ? [{ s: 1, t: dropFilm - 1.1, target: TARGET_INTRO, intro: true }] : [];
// ★ THE TAIL IS ITS OWN WINDOW (root CLAUDE.md, OffCamCelebs 023/024: "control the tail, not only the windows"). The voice's
// last TAIL s (the verdict and the question) are measured alone and held to the target; the 10 s windows stop where it starts,
// and the outro holds its level. (Radiohead bed, 2026-10-02: the song softens at the end, and the tail sat at 4.6 dB.)
const TAIL = 3.5, bodyEnd = voEnd - TAIL;
for (let s = HAS_DROP ? dropFilm : 1; s < bodyEnd; s += WIN) { const t = Math.min(WIN, bodyEnd - s); if (t >= 3) wins.push({ s, t, target: TARGET, intro: false }); }
wins.push({ s: bodyEnd, t: TAIL, target: TARGET, intro: false, tail: true });
const rows = wins.map((w) => {
  const v = mean("out/probe/v2_vo.mp3", w.s, w.t, true), b = mean("out/probe/v2_music.mp3", w.s, w.t, false);
  return { ...w, c: w.s + w.t / 2, v, b, sep: v - b, need: (v - w.target) - b };
});
const log = rows.map((r) => `${r.intro ? "intro" : r.tail ? " tail" : r.c.toFixed(0).padStart(4) + "s "} voice ${r.v.toFixed(1)}  bed ${r.b.toFixed(1)}  sep ${r.sep.toFixed(1)} (target ${r.target})  → ${r.need >= 0 ? "+" : ""}${r.need.toFixed(1)} dB`);
console.log(log.join("\n"));
// (ONE_GAIN: the intro is not controlled — one volume for the whole song — so it is reported, not judged)
const worst = Math.max(...rows.filter((r) => !(ONE_GAIN && r.intro)).map((r) => Math.abs(r.sep - r.target)));
console.log(`worst window off its target by ${worst.toFixed(1)} dB`);
if (check) process.exit(worst <= 0.8 ? 0 : 1);

// ── bake ─────────────────────────────────────────────────────────────────────────────────────
// ⚠ the envelope is RELATIVE to what the current file already carries. First pass (a flat bed from mkbed.mjs): the
// BASE level is the median of the body's needs, and each window moves at most ±CLAMP around it (the intro up to +12,
// its whole shortfall). Later passes add a ±CLAMP residual to the previous knots.
const prevPath = "scratchpad/bedenv.json";
const prev = fs.existsSync(prevPath) ? JSON.parse(fs.readFileSync(prevPath, "utf8")) : null;
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
let knots;
if (!prev) {
  const body = rows.filter((r) => !r.intro).map((r) => r.need).sort((a, b) => a - b);
  const base = body[Math.floor(body.length / 2)];
  knots = rows.map((r) => ({ c: r.c, intro: r.intro, db: base + clamp(r.need - base, -CLAMP, r.intro ? 12 : CLAMP) }));
} else {
  if (prev.knots.length !== rows.length) throw new Error("bedenv: the window layout changed since the last pass — re-run mkbed.mjs for a flat bed first");
  knots = rows.map((r, i) => ({ c: r.c, intro: r.intro, db: prev.knots[i].db + clamp(r.need, -CLAMP, CLAMP) }));
}
// ★★★ ONE_GAIN (bedsrc.mjs): every knot takes the body's median gain — one volume, start to end
if (ONE_GAIN) { const g = knots.filter((k) => !k.intro).map((k) => k.db).sort((a, b) => a - b)[Math.floor(knots.filter((k) => !k.intro).length / 2)]; knots = knots.map((k) => ({ ...k, db: g })); }
fs.writeFileSync(prevPath, JSON.stringify({ target: TARGET, targetIntro: TARGET_INTRO, dropFilm, offset, knots }, null, 1));
// points: the intro's level held flat to the drop, a 0.1 s step AT the drop, then the body knots, linear between centres
const pts = (ONE_GAIN ? [[0, knots[0].db]] : HAS_DROP
  ? (DROP_HOLD ? [[0, knots[0].db], [dropFilm - RAMP, knots[0].db], [dropFilm - 0.05, knots[1].db], ...knots.slice(1).map((k) => [k.c, k.db])]
    : [[0, knots[0].db], [dropFilm - 0.05, knots[0].db], [dropFilm + 0.05, knots[1].db], ...knots.slice(1).map((k) => [k.c, k.db])])
  : [[0, knots[0].db], ...knots.map((k) => [k.c, k.db])])
  .filter(([t], i, a) => i === 0 || t > a[i - 1][0]);
let expr = pts[pts.length - 1][1].toFixed(2);
for (let i = pts.length - 2; i >= 0; i--) {
  const [ta, da] = pts[i], [tb, db] = pts[i + 1];
  expr = `if(lt(t,${tb.toFixed(3)}),${da.toFixed(2)}+(${(db - da).toFixed(3)})*(t-${ta.toFixed(3)})/${(tb - ta).toFixed(3)},${expr})`;
}
const FADE_IN = 1.0, outStart = Math.max(voEnd, len - 1.4);
const af = `volume='pow(10,(${expr})/20)':eval=frame,afade=t=in:st=0:d=${FADE_IN},` +
  `afade=t=out:st=${outStart.toFixed(3)}:d=${(len - outStart).toFixed(3)}`;
const r = spawnSync(FF + "/ffmpeg.exe", ["-y", "-hide_banner", "-loglevel", "error", "-ss", offset.toFixed(3), "-i", BED_SRC,
  "-t", len.toFixed(3), "-af", af, "-ar", "44100", "-ac", "2", "-c:a", "libmp3lame", "-b:a", "192k",
  "public/bed.mp3"], { encoding: "utf8" });
if (r.status !== 0) throw new Error("bedenv: ffmpeg failed\n" + r.stderr);
fs.appendFileSync("scratchpad/mixlog.txt", `\n── bedenv pass ${new Date().toISOString()}\n${log.join("\n")}\nknots: ${knots.map((k) => `${k.intro ? "intro" : k.c.toFixed(0) + "s"} ${k.db >= 0 ? "+" : ""}${k.db.toFixed(1)}`).join(" · ")}\n`);
console.log(`baked public/bed.mp3 — ${knots.map((k) => `${k.intro ? "intro" : k.c.toFixed(0) + "s"} ${k.db >= 0 ? "+" : ""}${k.db.toFixed(1)}`).join(" · ")} dB`);
