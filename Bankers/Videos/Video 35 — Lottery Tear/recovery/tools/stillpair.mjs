// Render the same frames from two serve-URL bundles with one browser each.
// usage: node stillpair.mjs <projectDir> <bundleDir> <outDir> <browserExe> <port> frames...
import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
const [, , proj, bundleDir, outDir, exe, port, ...frames] = process.argv;
const require = createRequire(path.join(proj, "package.json"));
const { renderStill, selectComposition, openBrowser } = require("@remotion/renderer");
fs.mkdirSync(outDir, { recursive: true });
const browser = await openBrowser("chrome", { browserExecutable: exe });
const comp = await selectComposition({ serveUrl: bundleDir, id: "LotteryTear", puppeteerInstance: browser, browserExecutable: exe, port: Number(port) });
console.log("comp", comp.id, comp.durationInFrames, comp.width, comp.height);
for (const f of frames) {
  const out = path.join(outDir, `f${String(f).padStart(4, "0")}.png`);
  await renderStill({ serveUrl: bundleDir, composition: comp, frame: Number(f), output: out, puppeteerInstance: browser, browserExecutable: exe, port: Number(port), imageFormat: "png" });
  console.log("wrote", out);
}
await browser.close({ silent: true });
