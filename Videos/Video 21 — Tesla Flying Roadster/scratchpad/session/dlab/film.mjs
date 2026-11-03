// Builder D: stills of the REAL film (with its camera) at the given frames → out/labD/film_<f>.png. Never an MP4.
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
const RP = process.env.RPORT ? { port: Number(process.env.RPORT) } : {};
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
const composition = await selectComposition({ ...RP, serveUrl, id: "TeslaFlyingRoadster" });
const dir = path.join(root, "out", "labD");
fs.mkdirSync(dir, { recursive: true });
for (const frame of frames) {
  await renderStill({ ...RP, composition, serveUrl, frame, imageFormat: "png", output: path.join(dir, `film_${frame}.png`) });
}
console.log(`${frames.length} stills → ${dir}`);
