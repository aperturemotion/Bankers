// BANKERS VIDEO 3 — stills for checking (PNG). Never an MP4.
//   node scratchpad/still.mjs            → the sweep → out/sweep/f###.png
//   node scratchpad/still.mjs 330 360    → just those frames
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
// RPORT pins the renderer's local file server to one port (2026-10-13: a browser connection's source port held 0.0.0.0:3000, and Remotion's port test kept choosing it — "Tried 10 times to find a free port")
const RP = process.env.RPORT ? { port: Number(process.env.RPORT) } : {};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Every named cue 20 frames after its word (the reveal has landed) and every section's first frame — DERIVED
// from the generated captions, never hand-typed (root CLAUDE.md, V29: a hand-written list kept sweeping the previous
// take's beats; this one was the synthetic take's until 2026-09-26)
const cap = fs.readFileSync(path.join(root, "src", "pe", "captions.ts"), "utf8");
const CUE = JSON.parse(cap.match(/export const CUE = (\{.*?\}) as const;/)[1]);
const SECT = JSON.parse(cap.match(/export const SECT = (\{.*?\}) as const;/)[1]);
const SWEEP = [...new Set([...Object.values(CUE).map((f) => f + 20), ...Object.values(SECT).map((s) => s.at)])].sort((a, b) => a - b);
const frames = process.argv.slice(2).length ? process.argv.slice(2).map(Number) : SWEEP;
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
const composition = await selectComposition({ ...RP,  serveUrl, id: "PrivateEquityBacklog" });
const dir = path.join(root, "out", "sweep");
fs.mkdirSync(dir, { recursive: true });
for (const frame of frames) {
  await renderStill({ ...RP,  composition, serveUrl, frame, imageFormat: "png", output: path.join(dir, `f${String(frame).padStart(3, "0")}.png`) });
}
console.log(`${frames.length} stills → ${dir}`);
