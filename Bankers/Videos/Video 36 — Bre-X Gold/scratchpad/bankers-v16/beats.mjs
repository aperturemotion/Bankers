// BANKERS VIDEO 8 — one still per brief beat (the 2026-10-09 revision's "old vs new" stills). Never an MP4.
//   node scratchpad/beats.mjs old      → out/compare/old/NN_name.png   (before the rebuild)
//   node scratchpad/beats.mjs new      → out/compare/new/NN_name.png
//   node scratchpad/beats.mjs new 3 7  → only beats 3 and 7
// The frames are each beat's settled moment on the REAL take (captions.ts CUE words), so old and new sit side by side.
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
// RPORT pins the renderer's local file server to one port (2026-10-13: a browser connection's source port held 0.0.0.0:3000, and Remotion's port test kept choosing it — "Tried 10 times to find a free port")
const RP = process.env.RPORT ? { port: Number(process.env.RPORT) } : {};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cap = fs.readFileSync(path.join(root, "src", "pe", "captions.ts"), "utf8");
const CUE = JSON.parse(cap.match(/export const CUE = (\{.*?\}) as const;/)[1]);
export const BEATS = [
  ["hook_reveal", CUE.enough - 4],
  ["hook_14days", CUE.weeks + 14],
  ["hook_tank", CUE.forHook + 4],
  ["what_strategic", CUE.reserve + 18],
  ["what_saltcaverns", CUE.gulf + 20],
  ["what_1973", CUE.embargo + 12],
  ["what_fill_release", CUE.hits + 8],
  ["what_peak_today", CUE.v283 + 30],
  ["happ_march", CUE.hormuz + 12],
  ["happ_release", CUE.release2 + 16],
  ["happ_100", CUE.v100 + 26],
  ["happ_likely", CUE.higher + 10],
  ["happ_designed", CUE.designed + 6],
  ["teach_room", CUE.room + 8],
  ["teach_tank", CUE.nextShock + 8],
  ["teach_hurricane", CUE.production + 2],
  ["teach_refining", CUE.capacity + 10],
  ["honest_refill", CUE.prices + 10],
  ["honest_experts", CUE.safely + 18],
  ["honest_nobody", CUE.comes + 8],
  ["question", CUE.caves + 6],
];
const which = process.argv[2];
if (which !== "old" && which !== "new") { console.error("usage: node scratchpad/beats.mjs old|new [beat numbers]"); process.exit(1); }
const only = process.argv.slice(3).map(Number);
const dir = path.join(root, "out", "compare", which);
fs.mkdirSync(dir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
const composition = await selectComposition({ ...RP,  serveUrl, id: "PrivateEquityBacklog" });
for (const [i, [name, frame]] of BEATS.entries()) {
  if (only.length && !only.includes(i + 1)) continue;
  const out = path.join(dir, `${String(i + 1).padStart(2, "0")}_${name}.png`);
  await renderStill({ ...RP,  composition, serveUrl, frame, imageFormat: "png", scale: 0.5, output: out });
  console.log(`${String(i + 1).padStart(2)} ${name.padEnd(18)} f${frame}`);
}
