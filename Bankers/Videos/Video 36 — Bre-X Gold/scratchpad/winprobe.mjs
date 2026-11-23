import * as __fs46 from "node:fs";
// Windowed audio probe — renders ONE frame range to mp3 so a cue can be measured in isolation
// from the rest of the film.  node scratchpad/winprobe.mjs <from> <to> <out.mp3>
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import path from "path";
const [a, b, out] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
// ★ V46: delete this run's webpack bundle on exit (every run left ~69 MB in /tmp and filled the disk)
process.on("exit", () => { try { __fs46.rmSync(serveUrl, { recursive: true, force: true }); } catch {} });
const comp = await selectComposition({ serveUrl, id: "BreXGold", port: 3863 });
await renderMedia({
  serveUrl, composition: comp, codec: "mp3", port: 3863,
  frameRange: [Number(a), Number(b)],
  outputLocation: path.resolve(out),
});
console.log("window " + a + "-" + b + " -> " + out);
