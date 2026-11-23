// Cut the bed (BED_SRC, scratchpad/bedsrc.mjs) to this film and BAKE its fades (the V16 silent-track rule: long tracks
// take STATIC volumes, so the fades live in the file, never in a volume callback).
//   node scratchpad/mkbed.mjs
// Reads the composition length from src/bnx/captions.ts — never a hand-typed duration.
import { execFileSync } from "child_process";
import fs from "fs";
import { BED_SRC, BED_OUT, BED_OFFSET, BED_FADE_IN } from "./bedsrc.mjs";

const FF = (process.env.FFMPEG_BIN ?? "C:/Users/Timur/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin");
const cap = fs.readFileSync("src/bnx/captions.ts", "utf8");
const TOTAL = Number(cap.match(/TOTAL_FRAMES = (\d+)/)[1]);
const VO_END = Number(cap.match(/VO_END_FRAME = (\d+)/)[1]);
const len = TOTAL / 30;
const FADE_IN = BED_FADE_IN, FADE_OUT = 1.4;
const outStart = Math.max(VO_END / 30, len - FADE_OUT);   // the fade begins as the voice ends
execFileSync(FF + "/ffmpeg.exe", [
  "-y", "-hide_banner", "-loglevel", "error",
  "-ss", String(BED_OFFSET), "-i", BED_SRC, "-t", len.toFixed(3),
  "-af", `afade=t=in:st=0:d=${FADE_IN},afade=t=out:st=${outStart.toFixed(3)}:d=${(len - outStart).toFixed(3)}`,
  "-ar", "44100", "-ac", "2", "-c:a", "libmp3lame", "-b:a", "192k", BED_OUT,
]);
const probe = execFileSync(FF + "/ffprobe.exe", ["-v", "error", "-show_entries", "format=duration:stream=channels",
  "-of", "default=noprint_wrappers=1", BED_OUT]).toString().trim().replace(/\n/g, " ");
console.log(`${BED_OUT}: ${len.toFixed(2)}s cut, fade in ${FADE_IN}s, fade out ${outStart.toFixed(2)}→${len.toFixed(2)}s · ${probe}`);
