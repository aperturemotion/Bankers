// Renders a frame range to lossless PNGs the way the real render does (renderFrames, N tabs) — for measuring motion
// smoothness (scratchpad/jitter.py's method) WITHOUT rendering an MP4 (root CLAUDE.md: never an MP4 unasked).
//   node scratchpad/framesprobe.mjs <from> <to> [concurrency=2]   → out/framesprobe/element-NNNN.png
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderFrames } from "@remotion/renderer";
// RPORT pins the renderer's local file server to one port (2026-10-13: a browser connection's source port held 0.0.0.0:3000, and Remotion's port test kept choosing it — "Tried 10 times to find a free port")
const RP = process.env.RPORT ? { port: Number(process.env.RPORT) } : {};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [a, b] = [Number(process.argv[2]), Number(process.argv[3])];
const conc = Number(process.argv[4] ?? 2);
const outputDir = path.join(root, "out", "framesprobe");
fs.rmSync(outputDir, { recursive: true, force: true });
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
const composition = await selectComposition({ ...RP,  serveUrl, id: "TeslaFlyingRoadster" });
await renderFrames({ ...RP,  composition, serveUrl, outputDir, imageFormat: (process.argv[5] ?? "png"), frameRange: [a, b], concurrency: conc, onStart: () => {}, onFrameUpdate: () => {} });
console.log(`${fs.readdirSync(outputDir).length} PNGs → ${outputDir}`);
