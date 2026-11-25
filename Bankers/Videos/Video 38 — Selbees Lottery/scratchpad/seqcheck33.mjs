import * as __fs46 from "node:fs";
// V33 (2026-10-06) — SEQUENTIAL RENDER vs FRESH STILLS. The CLOSED sign was drawn IN FRONT of the gate in every fresh still
// and BEHIND its pickets in the sequential render (renderFrames, one tab, frame after frame): Chrome's depth sort inside a
// preserve-3d Turn is not stable across frames. No still, no probe and no strip of stills can see that class; only the
// render the MP4 is made from shows it. This renders FRESH full-size stills (a new page per frame) of sampled frames into
// out/seq/, for scratchpad/seqcmp33.py to compare against the sequential render in out/full4/.
//   node scratchpad/seqcheck33.mjs [every=15] [from=0] [to=3496] [extra frames…]
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill, openBrowser } from "@remotion/renderer";
import path from "path";
import fs from "fs";

const [ev = "15", a = "0", b = "3496", ...extra] = process.argv.slice(2);
const every = +ev, from = +a, to = +b;
const frames = [...new Set([...Array.from({ length: Math.floor((to - from) / every) + 1 }, (_, i) => from + i * every), ...extra.map(Number)])].sort((x, y) => x - y);
fs.mkdirSync("out/seq", { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
// ★ V46: delete this run's webpack bundle on exit (every run left ~69 MB in /tmp and filled the disk)
process.on("exit", () => { try { __fs46.rmSync(serveUrl, { recursive: true, force: true }); } catch {} });
const PORT = Number(process.env.PORT_SEQ ?? 3862);
// one browser for speed; renderStill opens a NEW TAB for every still, so no still has rendered any frame before it
const puppeteerInstance = await openBrowser("chrome");
const composition = await selectComposition({ serveUrl, id: "TheranosBloodTest", port: PORT, puppeteerInstance });
for (const frame of frames) {
  const out = path.resolve(`out/seq/element-${String(frame).padStart(4, "0")}.jpeg`);
  if (fs.existsSync(out)) continue;   // resumable
  await renderStill({ serveUrl, composition, frame, scale: 1, port: PORT, imageFormat: "jpeg", jpegQuality: 93, puppeteerInstance, output: out });
}
await puppeteerInstance.close({ silent: true });
console.log(`fresh stills: ${frames.length} frames (${frames[0]}–${frames[frames.length - 1]}) → out/seq`);
