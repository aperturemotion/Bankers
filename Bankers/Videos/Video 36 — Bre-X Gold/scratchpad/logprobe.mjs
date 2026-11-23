import * as __fs46 from "node:fs";
// Print every browser console message (not PROBE lines) for a few frames, with its full text.
//   node scratchpad/logprobe.mjs [probe=1] frame...
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "path";
import os from "os";

const args = process.argv.slice(2);
const probe = args[0] === "1";
const frames = args.slice(1).map(Number);
const PORT = Number(process.env.PORT ?? 3865);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
// ★ V46: delete this run's webpack bundle on exit (every run left ~69 MB in /tmp and filled the disk)
process.on("exit", () => { try { __fs46.rmSync(serveUrl, { recursive: true, force: true }); } catch {} });
const inputProps = probe ? { probe: true } : {};
const composition = await selectComposition({ serveUrl, id: "BreXGold", port: PORT, inputProps });
for (const frame of frames) {
  const seen = new Map();
  await renderStill({ serveUrl, composition, port: PORT, frame, inputProps, output: path.join(os.tmpdir(), "logprobe.png"),
    onBrowserLog: (l) => {
      const t = l.text ?? "";
      if (t.startsWith("PROBE")) return;
      const k = `${l.type}: ${t.slice(0, 600)}`;
      seen.set(k, (seen.get(k) ?? 0) + 1);
    } });
  console.log(`— frame ${frame}: ${seen.size} distinct message(s)`);
  for (const [k, n] of seen) console.log(`  ×${n} ${k}`);
}
