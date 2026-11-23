import * as __fs46 from "node:fs";
// Dump the LIVE SFX cue list (as the composition computes it from the take) to out/cues.json, with each file's audible onset.
//   node scratchpad/cuedump.mjs
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import os from "os";
const PORT = Number(process.env.PORT ?? 3864);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
// ★ V46: delete this run's webpack bundle on exit (every run left ~69 MB in /tmp and filled the disk)
process.on("exit", () => { try { __fs46.rmSync(serveUrl, { recursive: true, force: true }); } catch {} });
const inputProps = { dumpCues: true };
const composition = await selectComposition({ serveUrl, id: "BreXGold", port: PORT, inputProps });
let cues = null, canary = null, moves = null;
await renderStill({ serveUrl, composition, port: PORT, frame: 0, inputProps, output: path.join(os.tmpdir(), "cuedump.png"),
  onBrowserLog: (l) => { const t = l.text ?? ""; if (t.startsWith("CUES")) cues = JSON.parse(t.slice(4)); if (t.startsWith("CANARY")) canary = JSON.parse(t.slice(6)); if (t.startsWith("MOVES")) moves = JSON.parse(t.slice(5)); } });
if (!cues || !cues.length) { console.error("REFUSED: no cue list came back from the page"); process.exit(1); }
// the onset table, read out of SfxLayer.tsx (one copy)
const src = fs.readFileSync("src/bnx/SfxLayer.tsx", "utf8");
const onsetAt = src.search(/const ONSET(?::[^=]*)? = \{/);   // V35 recovery: the bundle stripped the type annotation
if (onsetAt < 0) { console.error("REFUSED: no ONSET table in SfxLayer.tsx"); process.exit(1); }
const block = src.slice(onsetAt, src.indexOf("};", onsetAt));
const ONSET = Object.fromEntries([...block.matchAll(/(\w+): (\d+)/g)].map((m) => [m[1], Number(m[2])]));
for (const c of cues) { if (ONSET[c.s] === undefined) { console.error("REFUSED: no onset for " + c.s); process.exit(1); } c.vis = c.at + ONSET[c.s]; }
fs.writeFileSync("out/cues.json", JSON.stringify(cues, null, 1));
// the end sweep's canaries, built by the page with the real cue builders (scratchpad/sfxends.mjs)
if (!canary) { console.error("REFUSED: no canary cues came back from the page"); process.exit(1); }
fs.writeFileSync("out/cue_canary.json", JSON.stringify(canary, null, 1));
// E7: every place's entrance and exit, for scratchpad/worldcheck.py
if (!moves) { console.error("REFUSED: no move list came back from the page"); process.exit(1); }
fs.writeFileSync("out/moves.json", JSON.stringify(moves, null, 1));
console.log(`${cues.length} cues → out/cues.json`);
