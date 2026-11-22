import * as __fs46 from "node:fs";
// Render one frame every N (default 60 = 2 s) as JPEGs, for a contact-sheet diagnosis (not a deliverable).
//   node scratchpad/every2s.mjs [n=60] [scale=0.3] [outDir=out/every2s]
import { bundle } from "@remotion/bundler";
import { selectComposition, renderFrames } from "@remotion/renderer";
import path from "path";
import fs from "fs";

const [nArg, sc, dir] = process.argv.slice(2);
const n = Number(nArg ?? 60), scale = Number(sc ?? 0.3);
const outDir = path.resolve(dir ?? "out/every2s");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
const PORT = 3861;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
// ★ V46: delete this run's webpack bundle on exit (every run left ~69 MB in /tmp and filled the disk)
process.on("exit", () => { try { __fs46.rmSync(serveUrl, { recursive: true, force: true }); } catch {} });
const composition = await selectComposition({ serveUrl, id: "LotteryTear", port: PORT, inputProps: {} });
await renderFrames({
  serveUrl, composition, port: PORT, outputDir: outDir, inputProps: {},
  imageFormat: "jpeg", jpegQuality: 88, scale, everyNthFrame: n, concurrency: 4,
  onStart: () => {}, onFrameUpdate: () => {},
});
console.log(`every ${n}th frame of ${composition.durationInFrames} -> ${outDir}`);
