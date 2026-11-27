// V38 master render — RESUMABLE, in picture chunks (WebGL via SwiftShader is ~8 s/frame; a 5-h single run must survive a crash).
//   node scratchpad/render38.mjs [--chunk 120] [--conc 1] [--port 5900] [--only a-b]
//   1. picture: out/r38/seg_<start>.mp4 for each chunk (muted, solo "picture"); a chunk whose file probes to the right frame count is skipped
//   2. audio:   out/r38/audio.wav (solo "audio": no WebGL)
//   3. concat + mux → out/selbees_lottery.mp4, then probed (duration, streams) — success is the artefact, not the exit code.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { execFileSync } from "child_process";
import fs from "fs"; import path from "path";
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const CHUNK = Number(arg("--chunk", 120)), CONC = Number(arg("--conc", 1)), PORT = Number(arg("--port", 5900));
const ONLY = arg("--only", null);
const FFPROBE = process.env.FFPROBE ?? "ffprobe", FFMPEG = process.env.FFMPEG ?? "ffmpeg";
const PREVIEW = process.argv.includes("--preview");   // a quick low-res picture-only PREVIEW (out/rprev), muxed later with the audio pass
const CHECK = PREVIEW || process.argv.includes("--check");   // a half-size, picture-only CHECK render (out/rchk/check.mp4) — never the master
const D = PREVIEW ? "out/rprev" : CHECK ? "out/rchk" : "out/r38"; fs.mkdirSync(D, { recursive: true });
const SCALE = PREVIEW ? 0.4 : CHECK ? 0.5 : 1;
const chromiumOptions = { gl: "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
process.on("exit", () => { try { fs.rmSync(serveUrl, { recursive: true, force: true }); } catch {} });
const comp = await selectComposition({ serveUrl, id: "SelbeesLottery", port: PORT, chromiumOptions, inputProps: { solo: "picture" } });
const N = comp.durationInFrames;
const frames = (file) => { try { return parseInt(execFileSync(FFPROBE, ["-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", file]).toString().trim(), 10); } catch { return -1; } };
let [lo, hi] = ONLY ? ONLY.split("-").map(Number) : [0, N - 1];
const t0 = Date.now();
for (let a = 0; a < N; a += CHUNK) {
  const b = Math.min(N - 1, a + CHUNK - 1);
  if (b < lo || a > hi) continue;
  const out = `${D}/seg_${String(a).padStart(5, "0")}.mp4`;
  if (fs.existsSync(out) && frames(out) === b - a + 1) { console.log(`skip ${a}-${b}`); continue; }
  const tmp = out.replace(".mp4", ".part.mp4");
  const ts = Date.now();
  await renderMedia({ serveUrl, composition: comp, codec: "h264", crf: PREVIEW ? 26 : 16, muted: true, frameRange: [a, b], outputLocation: tmp, concurrency: CONC, port: PORT, scale: SCALE,
    chromiumOptions, inputProps: { solo: "picture" }, timeoutInMilliseconds: 240000,
    onBrowserLog: (l) => { if (l.type === "error") console.log("BROWSER", l.text.slice(0, 200)); } });
  const n = frames(tmp);
  if (n !== b - a + 1) throw new Error(`chunk ${a}-${b}: ${n} frames`);
  fs.renameSync(tmp, out);
  const s = (Date.now() - ts) / 1000;
  console.log(`seg ${a}-${b} ${s.toFixed(0)}s (${(s / (b - a + 1)).toFixed(1)} s/f) elapsed ${((Date.now() - t0) / 60000).toFixed(1)} min`);
}
if (ONLY) process.exit(0);
if (CHECK) {
  const segs = fs.readdirSync(D).filter((f) => /^seg_\d+\.mp4$/.test(f)).sort();
  fs.writeFileSync(`${D}/list.txt`, segs.map((f) => `file '${f}'`).join("\n") + "\n");
  execFileSync(FFMPEG, ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", `${D}/list.txt`, "-c", "copy", `${D}/check.mp4`]);
  console.log(`CHECK ${D}/check.mp4: ${frames(`${D}/check.mp4`)} frames (expected ${N})`);
  process.exit(0);
}
const wav = `${D}/audio.wav`;
await renderMedia({ serveUrl, composition: { ...comp, props: { ...comp.props, solo: "audio" } }, codec: "wav", outputLocation: wav, port: PORT, inputProps: { solo: "audio" }, concurrency: 1 });
const segs = fs.readdirSync(D).filter((f) => /^seg_\d+\.mp4$/.test(f)).sort();
fs.writeFileSync(`${D}/list.txt`, segs.map((f) => `file '${f}'`).join("\n") + "\n");
const master = "out/selbees_lottery.mp4";
execFileSync(FFMPEG, ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", `${D}/list.txt`, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-movflags", "+faststart", "-shortest", master]);
const nf = frames(master);
const dur = Number(execFileSync(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", master]).toString());
console.log(`MASTER ${master}: ${nf} frames (expected ${N}), ${dur.toFixed(2)} s`);
if (nf !== N) throw new Error("frame count mismatch");
