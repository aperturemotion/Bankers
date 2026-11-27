// V38 preview: render the audio pass (solo "audio", no WebGL) from the CURRENT source and mux it onto out/rprev/check.mp4
//   node scratchpad/preview_mux.mjs <out.mp4>
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { execFileSync } from "child_process";
import path from "path"; import fs from "fs";
const FF = "/home/user/ffbin/ffmpeg", FP = "/home/user/ffbin/ffprobe";
const out = process.argv[2];
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
process.on("exit", () => { try { fs.rmSync(serveUrl, { recursive: true, force: true }); } catch {} });
const comp = await selectComposition({ serveUrl, id: "SelbeesLottery", port: 5961, inputProps: { solo: "audio" } });
const wav = "out/rprev/audio.wav";
await renderMedia({ serveUrl, composition: { ...comp, props: { ...comp.props, solo: "audio" } }, codec: "wav", outputLocation: wav, port: 5961, inputProps: { solo: "audio" }, concurrency: 1 });
execFileSync(FF, ["-y", "-v", "error", "-i", "out/rprev/check.mp4", "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-shortest", out]);
console.log("PREVIEW", out, execFileSync(FP, ["-v", "error", "-show_entries", "format=duration:stream=width,height,codec_name", "-of", "csv=p=0", out]).toString().replace(/\n/g, " "));
