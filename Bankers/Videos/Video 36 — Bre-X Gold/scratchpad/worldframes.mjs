import * as __fs46 from "node:fs";
// Render, at FULL size, only the frames scratchpad/worldcheck.py reads: every hand-over move's window from out/moves.json
// (written by cuedump.mjs), ±4 frames. Bundles once. Writes out/full/element-NNNN.jpeg (names normalised to 4 digits).
//   node scratchpad/worldframes.mjs [concurrency=3]
import { bundle } from "@remotion/bundler";
import { selectComposition, renderFrames } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import os from "os";

const CONC = Number(process.argv[2] ?? 3);
const PORT = Number(process.env.PORT ?? 3866);
const mv = JSON.parse(fs.readFileSync("out/moves.json", "utf8"));
const wins = [];
for (const p of mv.places) for (const half of ["enter", "exit"]) {
  const m = p[half];
  if (!m || m.k === "own" || m.at === undefined) continue;
  wins.push([Math.max(0, Math.floor(m.at) - 4), Math.ceil(m.at + m.dur) + 4]);
}
wins.sort((a, b) => a[0] - b[0]);
const merged = [];
for (const w of wins) { const l = merged[merged.length - 1]; if (l && w[0] <= l[1] + 1) l[1] = Math.max(l[1], w[1]); else merged.push([...w]); }
if (!merged.length) throw new Error("worldframes: no move windows in out/moves.json");
const out = path.resolve("out/full");
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
// ★ V46: delete this run's webpack bundle on exit (every run left ~69 MB in /tmp and filled the disk)
process.on("exit", () => { try { __fs46.rmSync(serveUrl, { recursive: true, force: true }); } catch {} });
const composition = await selectComposition({ serveUrl, id: "BreXGold", port: PORT });
let n = 0;
for (const [a, b0] of merged) {
  const b = Math.min(b0, composition.durationInFrames - 1);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-"));
  await renderFrames({ serveUrl, composition, port: PORT, outputDir: tmp, imageFormat: "jpeg", jpegQuality: 90, scale: 1,
    frameRange: [a, b], concurrency: CONC, onStart: () => {}, onFrameUpdate: () => {} });
  for (const f of fs.readdirSync(tmp)) {
    const m = f.match(/(\d+)\.jpe?g$/);
    if (!m) continue;
    fs.copyFileSync(path.join(tmp, f), path.join(out, `element-${String(Number(m[1])).padStart(4, "0")}.jpeg`));
    n++;
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`window ${a}-${b} done`);
}
console.log(`${n} frames → ${out}`);
