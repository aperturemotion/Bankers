import * as __fs46 from "node:fs";
// Render a frame RANGE as a low-res JPEG sequence for motion analysis (not a deliverable).
//   node scratchpad/frames.mjs <from> <to> [scale=0.25] [outDir=out/seq]
// Pair with scratchpad/motion.py, which scores frame-to-frame change and flags pops.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderFrames } from "@remotion/renderer";
import path from "path";
import fs from "fs";

const [a, b, sc, dir] = process.argv.slice(2);
const from = Number(a ?? 0), to = Number(b ?? 600), scale = Number(sc ?? 0.25);
const outDir = path.resolve(dir ?? "out/seq");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
const PORT = Number(process.env.PORT ?? 3860);   // ⚠ pinned: the renderer's auto-picked port collides with a running Studio (PORT=… for a second run in parallel)
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
// ★ V46: delete this run's webpack bundle on exit (every run left ~69 MB in /tmp and filled the disk)
process.on("exit", () => { try { __fs46.rmSync(serveUrl, { recursive: true, force: true }); } catch {} });
const composition = await selectComposition({ serveUrl, id: "TheranosBloodTest", port: PORT });
let last = 0;
await renderFrames({
  serveUrl, composition, port: PORT, outputDir: outDir, inputProps: {},
  imageFormat: "jpeg", jpegQuality: Number(process.env.JQ ?? 90), scale, concurrency: Number(process.env.CONC ?? 0) || undefined, frameRange: [from, Math.min(to, composition.durationInFrames - 1)],
  onStart: () => {},
  onFrameUpdate: (n) => { if (n - last >= 200) { last = n; console.log("  frames " + n); } },
});
console.log(`frames ${from}-${to} -> ${outDir}`);
