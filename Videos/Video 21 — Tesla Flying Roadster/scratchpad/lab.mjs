// Stills one Lab piece (src/tsla/Lab.tsx) at full size: node scratchpad/lab.mjs <piece> [light] → out/lab/<piece>.png. Never an MP4.
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
// RPORT pins the renderer's local file server to one port (2026-10-13: a browser connection's source port held 0.0.0.0:3000, and Remotion's port test kept choosing it — "Tried 10 times to find a free port")
const RP = process.env.RPORT ? { port: Number(process.env.RPORT) } : {};
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pieces = process.argv.slice(2).filter((a) => !/^[\d.]+$/.test(a));
const light = Number(process.argv.slice(2).find((a) => /^[\d.]+$/.test(a)) ?? 0);
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "lab-index.ts") });
fs.mkdirSync(path.join(root, "out", "lab"), { recursive: true });
for (const piece of pieces) {
  const inputProps = { piece, light };
  const composition = await selectComposition({ ...RP,  serveUrl, id: "Lab", inputProps });
  // "<piece>@<frame>" stills that frame (default 30)
  const [name, fr] = piece.split("@"); inputProps.piece = name;
  const comp2 = await selectComposition({ ...RP, serveUrl, id: "Lab", inputProps });
  await renderStill({ ...RP,  composition: comp2, serveUrl, frame: Number(fr ?? 30), inputProps, imageFormat: "png", output: path.join(root, "out", "lab", `${name}_${fr ?? 30}.png`) });
}
console.log(`${pieces.length} lab stills → out/lab`);
