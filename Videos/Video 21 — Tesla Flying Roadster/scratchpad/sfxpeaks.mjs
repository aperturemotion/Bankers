// Per-cue peaks of the SFX stem (out/probe/v2_sfx.mp3, rendered alone by audioprobe.mjs sfx), against the voice
// stem's peak — so each family's level is set from the RENDER, never by ear (root CLAUDE.md: mix by measured dB).
//   node scratchpad/sfxpeaks.mjs
// Cues are read from the composition itself: the bundle is not needed — Video.tsx's CUES are re-derived by
// evaluating nothing; instead the stem is cut into windows at every onset (a rise of > 20 dB from the floor).
import { spawnSync } from "child_process";

const FF = "C:/Users/Timur/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe";
const pcm = (file) => {
  const r = spawnSync(FF, ["-hide_banner", "-loglevel", "error", "-i", file, "-ac", "1", "-ar", "48000", "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  const b = r.stdout, out = new Float32Array(b.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = b.readInt16LE(i * 2) / 32768;
  return out;
};
const SR = 48000, HOP = SR / 30;   // one video frame — an INTEGER hop (8000/30 read fractional indices → NaN), and FULL BANDWIDTH: a 9 kHz decode filtered out the data bleeps and reported them as silence
const frames = (x) => { const n = Math.floor(x.length / HOP), o = new Float32Array(n); for (let i = 0; i < n; i++) { let m = 0; for (let k = i * HOP; k < (i + 1) * HOP; k++) m = Math.max(m, Math.abs(x[k])); o[i] = 20 * Math.log10(m + 1e-9); } return o; };
const sfx = frames(pcm("out/probe/v2_sfx.mp3")), vo = frames(pcm("out/probe/v2_vo.mp3"));
const voPeak = Math.max(...vo);
// events: contiguous runs above −60 dB, split where the level drops under −60 for ≥ 3 frames
const ev = [];
let s = -1, quiet = 0;
for (let i = 0; i < sfx.length; i++) {
  if (sfx[i] > -60) { if (s < 0) s = i; quiet = 0; }
  else if (s >= 0 && ++quiet >= 3) { ev.push([s, i - 3]); s = -1; }
}
if (s >= 0) ev.push([s, sfx.length - 1]);
console.log(`voice peak ${voPeak.toFixed(1)} dB (48 kHz mono decode)`);
for (const [a, b] of ev) {
  let pk = -99, at = a;
  for (let i = a; i <= b; i++) if (sfx[i] > pk) { pk = sfx[i]; at = i; }
  let vmax = -99; for (let i = Math.max(0, at - 3); i <= at + 3 && i < vo.length; i++) vmax = Math.max(vmax, vo[i]);
  console.log(`${String(a).padStart(5)}–${String(b).padEnd(5)} peak ${pk.toFixed(1)} @${at}  (${(voPeak - pk).toFixed(1)} under the voice peak; voice there ${vmax.toFixed(1)})`);
}
