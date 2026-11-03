// BANKERS DEMO — audio-only probe (an MP3 for MEASURING, never the deliverable).
//   node scratchpad/audioprobe.mjs            → out/probe/demo_mix.mp3   (everything)
//   node scratchpad/audioprobe.mjs vo|music|sfx → out/probe/demo_<stem>.mp3 (that stem alone)
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
// RPORT pins the renderer's local file server to one port (2026-10-13: a browser connection's source port held 0.0.0.0:3000, and Remotion's port test kept choosing it — "Tried 10 times to find a free port")
const RP = process.env.RPORT ? { port: Number(process.env.RPORT) } : {};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const solo = process.argv[2];
if (solo && !["vo", "music", "sfx"].includes(solo)) throw new Error(`unknown stem "${solo}" — vo | music | sfx`);
const inputProps = solo ? { solo } : {};
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
const composition = await selectComposition({ ...RP,  serveUrl, id: "TeslaFlyingRoadster", inputProps });
const outputLocation = path.join(root, "out", "probe", `v2_${solo ?? "mix"}.mp3`);
fs.mkdirSync(path.dirname(outputLocation), { recursive: true });
// two tabs: the machine shares its memory with other sessions' Studios (root CLAUDE.md: "Target closed" is usually memory)
await renderMedia({ ...RP,  composition, serveUrl, codec: "mp3", outputLocation, inputProps, concurrency: 2 });
console.log(outputLocation);
