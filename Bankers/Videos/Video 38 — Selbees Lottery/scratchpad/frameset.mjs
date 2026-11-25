import * as __fs46 from "node:fs";
// Render an explicit LIST of frames (any spread) at a scale, one bundle — for transition review strips.
//   node scratchpad/frameset.mjs <scale> <outDir> <f1> <f2> … | <a-b:step> …
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "path";
import fs from "fs";
const [sc, dir, ...specs] = process.argv.slice(2);
const frames = specs.flatMap((s) => {
  const m = s.match(/^(\d+)-(\d+):(\d+)$/);
  if (!m) return [Number(s)];
  const out = []; for (let f = +m[1]; f <= +m[2]; f += +m[3]) out.push(f); return out;
});
fs.mkdirSync(dir, { recursive: true });
const PORT = Number(process.env.PORT ?? 3860);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
// ★ V46: delete this run's webpack bundle on exit (every run left ~69 MB in /tmp and filled the disk)
process.on("exit", () => { try { __fs46.rmSync(serveUrl, { recursive: true, force: true }); } catch {} });
const composition = await selectComposition({ serveUrl, id: "TheranosBloodTest", port: PORT });
for (const f of frames) await renderStill({ serveUrl, composition, frame: f, scale: Number(sc), port: PORT, output: path.resolve(dir, `f${String(f).padStart(4, "0")}.jpeg`), imageFormat: "jpeg", jpegQuality: 85 });
console.log(`${frames.length} frames → ${dir}`);
