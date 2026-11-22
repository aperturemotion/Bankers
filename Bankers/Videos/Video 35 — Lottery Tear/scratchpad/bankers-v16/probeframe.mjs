// VIDEO 3 — one frame through the probe, its LINE hits spelled out (debugging a sweep finding).
//   node scratchpad/probeframe.mjs 600 [text-substring]
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
// RPORT pins the renderer's local file server to one port (2026-10-13: a browser connection's source port held 0.0.0.0:3000, and Remotion's port test kept choosing it — "Tried 10 times to find a free port")
const RP = process.env.RPORT ? { port: Number(process.env.RPORT) } : {};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frame = Number(process.argv[2]);
const want = process.argv[3] ?? "";
const inputProps = { probe: true };
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
const composition = await selectComposition({ ...RP,  serveUrl, id: "PrivateEquityBacklog", inputProps });
let got = null;
await renderStill({ ...RP, 
  composition, serveUrl, inputProps, frame, output: path.join(os.tmpdir(), `probe-${frame}.png`), scale: 0.5,
  onBrowserLog: (log) => { const t = log.text ?? ""; if (t.startsWith("PROBE ")) got = JSON.parse(t.slice(6)); },
});
if (!got) throw new Error("no PROBE line — refusing");
for (const [ti, g, desc] of got.lines) {
  const t = got.items[ti];
  if (!want || t.s.includes(want)) console.log(`${g} ${desc} through ${t.g}:"${t.s}" ${JSON.stringify(t.r)}`);
}
fs.writeFileSync(path.join(root, "out", `probe-${frame}.json`), JSON.stringify(got));
