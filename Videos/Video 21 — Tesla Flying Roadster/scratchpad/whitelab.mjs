// Stills the WHITE LAB (src/tsla/WhiteLab.tsx): teachA / honestB / honestC over the stage at a given light. Never an MP4.
//   node scratchpad/whitelab.mjs [tag] [pieces=teachA,honestB,honestC] [lights=0,0.5,1] [at=<abs frame>|settled]
//   → out/whitelab/<tag>/<piece>_L<light>[_f<at>].png
// RPORT pins the renderer's local file server (use 3641 here).
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
const RP = process.env.RPORT ? { port: Number(process.env.RPORT) } : {};
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [tag = "cur", pcs = "teachA,honestB,honestC", lts = "0,0.5,1", atArg = "settled"] = process.argv.slice(2);
const pieces = pcs.split(","), lights = lts.split(",").map(Number);
const ats = atArg === "settled" ? [undefined] : atArg.split(",").map(Number);
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
const dir = path.join(root, "out", "whitelab", tag);
fs.mkdirSync(dir, { recursive: true });
for (const piece of pieces) for (const light of lights) for (const at of ats) {
  const inputProps = at === undefined ? { piece, light } : { piece, light, at };
  const composition = await selectComposition({ ...RP, serveUrl, id: "WhiteLab", inputProps });
  const out = path.join(dir, `${piece}_L${light}${at === undefined ? "" : `_f${at}`}.png`);
  await renderStill({ ...RP, composition, serveUrl, frame: 0, inputProps, imageFormat: "png", output: out });
  console.log(out);
}
