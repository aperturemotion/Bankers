// Render specific frames to out/v/ for a visual audit. Bundles once.
//   node scratchpad/still.mjs 120 340 560 ...        (frames; scale 0.5)
//   node scratchpad/still.mjs --scale 1 120          (full-res single frame)
//   node scratchpad/still.mjs                        (every sentence's settled frame — DERIVED
//                                                     from src/bnx/captions.ts, never hand-typed)
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "path";
import fs from "fs";

let scale = 0.5;
const args = process.argv.slice(2);
const frames = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--scale") { scale = parseFloat(args[++i]); continue; }
  frames.push(parseInt(args[i], 10));
}
const cap = fs.readFileSync("src/bnx/captions.ts", "utf8");
const SENT = JSON.parse(cap.match(/export const SENTENCES[^=]*= (\[.*\]);/)[1]);
const list = frames.length
  ? frames.map((f) => ["f" + f, f])
  : SENT.map((s, i) => [`s${String(i).padStart(2, "0")}_${s.scene}`, s.end - 2]);

// STILL_OUT=… gives a parallel worker its own folder (V41 revision: several scene rebuilds rendering stills at once)
const OUTD = process.env.STILL_OUT ?? "out/v";
fs.mkdirSync(OUTD, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const PORT = Number(process.env.PORT_STILL ?? 3860);   // ⚠ pinned: the renderer's auto-picked port collides with a running Studio
const composition = await selectComposition({ serveUrl, id: "BreXGold", port: PORT });
for (const [name, frame] of list) {
  await renderStill({ serveUrl, composition, frame, scale, port: PORT,
    output: path.resolve(`${OUTD}/${name}.png`) });
  console.log(`wrote ${OUTD}/${name}.png  @frame ${frame}`);
}
// ★ V44 (2026-10-27): every run left its ~44 MB webpack bundle in /tmp, and 560 of them filled the disk — remove our own
fs.rmSync(serveUrl, { recursive: true, force: true });
