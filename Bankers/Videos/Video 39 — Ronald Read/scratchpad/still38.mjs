// V38 stills: node scratchpad/still38.mjs [--scale s] f1 f2 …   → $STILL_OUT (default out/v)/f<frame>.png ; PORT_STILL (default 3880)
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "path"; import fs from "fs";
const args = process.argv.slice(2); let scale = 0.5; const frames = [];
for (let i = 0; i < args.length; i++) { if (args[i] === "--scale") { scale = parseFloat(args[++i]); continue; } frames.push(parseInt(args[i], 10)); }
const OUTD = process.env.STILL_OUT ?? "out/v"; fs.mkdirSync(OUTD, { recursive: true });
const PORT = Number(process.env.PORT_STILL ?? 3880);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const chromiumOptions = { gl: "swangle" };
const composition = await selectComposition({ serveUrl, id: "SelbeesLottery", port: PORT, chromiumOptions, inputProps: { solo: "picture" } });
for (const frame of frames) {
  const t = Date.now();
  await renderStill({ serveUrl, composition, frame, scale, port: PORT, chromiumOptions, inputProps: { solo: "picture" }, output: path.resolve(`${OUTD}/f${frame}.png`), timeoutInMilliseconds: 300000,
    onBrowserLog: (l) => { if (l.type === "error") console.log("BROWSER", l.text.slice(0, 300)); } });
  console.log(`f${frame} ${((Date.now() - t) / 1000).toFixed(1)}s`);
}
