// Cut the bed (BED_SRC, scratchpad/bedsrc.mjs) to this film — starting where bedPlan() lands the song's drop on the
// reveal line — and BAKE its fades (static volumes only on long tracks: Style 3 spec §0). FLAT, no gain: this is the
// pass the stems are first measured on; bedenv.mjs then re-cuts it from the source with the level and envelope baked in.
//   node scratchpad/mkbed.mjs
import { execFileSync } from "child_process";
import fs from "fs";
import { BED_SRC, bedPlan } from "./bedsrc.mjs";

const FF = "C:/Users/Timur/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin";
const { len, voEnd, dropFilm, offset } = bedPlan(fs.readFileSync("src/pe/captions.ts", "utf8"));
const FADE_IN = 1.0, FADE_OUT = 1.4;
const outStart = Math.max(voEnd, len - FADE_OUT);   // the fade begins as the voice ends
execFileSync(FF + "/ffmpeg.exe", [
  "-y", "-hide_banner", "-loglevel", "error",
  "-ss", offset.toFixed(3), "-i", BED_SRC, "-t", len.toFixed(3),
  "-af", `afade=t=in:st=0:d=${FADE_IN},afade=t=out:st=${outStart.toFixed(3)}:d=${(len - outStart).toFixed(3)}`,
  "-ar", "44100", "-ac", "2", "-c:a", "libmp3lame", "-b:a", "192k", "public/bed.mp3",
]);
if (fs.existsSync("scratchpad/bedenv.json")) fs.unlinkSync("scratchpad/bedenv.json");   // a flat bed carries no envelope
const probe = execFileSync(FF + "/ffprobe.exe", ["-v", "error", "-show_entries", "format=duration:stream=channels",
  "-of", "default=noprint_wrappers=1", "public/bed.mp3"]).toString().trim().replace(/\n/g, " ");
console.log(`bed.mp3 (flat): source from ${offset.toFixed(2)}s (drop → film ${dropFilm.toFixed(2)}s), ${len.toFixed(2)}s, fade out ${outStart.toFixed(2)}→${len.toFixed(2)}s · ${probe}`);
