// node run.mjs <frame>:<pan>:<light>[:zoom] ... → out/lab/b3_<frame>_<pan>_<light>.png
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
const RP = process.env.RPORT ? { port: Number(process.env.RPORT) } : {};
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const serveUrl = await bundle({ entryPoint: path.join(here, "entry.tsx") });
fs.mkdirSync(path.join(root, "out", "lab"), { recursive: true });
for (const a of process.argv.slice(2)) {
  const [fr, pan, light, zoom] = a.split(":").map(Number);
  const inputProps = { pan, light, zoom: zoom || 1 };
  const comp = await selectComposition({ ...RP, serveUrl, id: "B3", inputProps });
  const out = path.join(root, "out", "lab", `b3_${fr}_${pan}_${light}${zoom ? "_z" + zoom : ""}.png`);
  await renderStill({ ...RP, composition: comp, serveUrl, frame: fr, inputProps, imageFormat: "png", output: out });
  console.log(out);
}
