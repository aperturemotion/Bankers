// ★ V34 take 2 (2026-10-07, "new vo in public, use that instead"): the new read is 122 s, and LIKE ME's own fade-out begins
//   at ~121 s of the track — from the 12.3-s drop, the film's last ~13 s would have run into it (VO end = −32 dB in the
//   track). So the track is EXTENDED by one of its own 24-s loops: it repeats exactly every 24.000 s (waveform correlation of
//   the 4 s at 50 s against the 4 s at 26 s: r 0.990, best lag 0 samples ±200), so at 50.0 s it jumps back to 26.0 s under a
//   30-ms crossfade and the groove never breaks. Written lossless to the scratchpad; mkbed.mjs and bedenv.mjs cut THIS file.
//   node scratchpad/bedext.mjs
import { execFileSync } from "child_process";

const FF = (process.env.FFMPEG_BIN ?? "C:/Users/Timur/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin");
const SRC = "public/music_likeme.mp3", OUT = "scratchpad/music_likeme_ext.wav";
const A = 50.0, LAG = 24.0, XF = 0.03;
execFileSync(FF + "/ffmpeg.exe", ["-y", "-hide_banner", "-loglevel", "error", "-i", SRC, "-filter_complex",
  `[0:a]atrim=0:${(A + XF / 2).toFixed(3)},asetpts=PTS-STARTPTS[a];` +
  `[0:a]atrim=start=${(A - LAG - XF / 2).toFixed(3)},asetpts=PTS-STARTPTS[b];` +
  `[a][b]acrossfade=d=${XF}:c1=tri:c2=tri[o]`,
  "-map", "[o]", "-ar", "44100", "-ac", "2", "-c:a", "pcm_s16le", OUT]);
const d = execFileSync(FF + "/ffprobe.exe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", OUT]).toString().trim();
console.log(`${OUT}: ${Number(d).toFixed(2)} s (the track + one 24-s loop, spliced at ${A} s → ${A - LAG} s)`);
