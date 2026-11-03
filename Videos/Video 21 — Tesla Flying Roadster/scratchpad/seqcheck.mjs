// THE RENDER-ONLY CHECK (2026-10-15, Video 11: "the glitch only happens in the rendered version"). Renders a frame range SEQUENTIALLY in
// ONE tab (as the master render does — a tab that has drawn the earlier frames) and the same frames as FRESH stills, then compares them in
// 48-px tiles: a tile that differs by more than LIMIT levels is paint the sequential render got wrong (stale gradient stops, stale text).
//   node scratchpad/seqcheck.mjs 1180 1250 [every=5]
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderFrames, renderStill } from "@remotion/renderer";
const RP = process.env.RPORT ? { port: Number(process.env.RPORT) } : {};
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [a, b, every = 5] = process.argv.slice(2).map(Number);
if (!(Number.isInteger(a) && Number.isInteger(b) && b > a)) { console.error("usage: seqcheck.mjs <from> <to> [every]"); process.exit(1); }
const out = path.join(root, "out", "seqcheck");
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(path.join(out, "seq"), { recursive: true }); fs.mkdirSync(path.join(out, "fresh"), { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
const composition = await selectComposition({ ...RP, serveUrl, id: "TeslaFlyingRoadster" });
await renderFrames({ ...RP, composition, serveUrl, frameRange: [a, b], concurrency: 1, imageFormat: "png", outputDir: path.join(out, "seq"), onStart: () => {}, onFrameUpdate: () => {} });
const picks = []; for (let f = a; f <= b; f += every) picks.push(f);
for (const f of picks) await renderStill({ ...RP, composition, serveUrl, frame: f, imageFormat: "png", output: path.join(out, "fresh", `f${f}.png`) });
const seqFiles = fs.readdirSync(path.join(out, "seq")).filter((n) => n.endsWith(".png")).sort();
const map = {}; for (const n of seqFiles) map[Number(n.match(/(\d+)\.png$/)[1])] = path.join(out, "seq", n);
fs.writeFileSync(path.join(out, "pairs.json"), JSON.stringify(picks.map((f) => [f, map[f], path.join(out, "fresh", `f${f}.png`)])));
const py = `
import json,sys
import numpy as np
from PIL import Image
pairs=json.load(open(sys.argv[1],encoding="utf8")); LIMIT=18; worst=0; bad=[]
for f,s,r in pairs:
  A=np.asarray(Image.open(s).convert('L'),dtype=np.float32); B=np.asarray(Image.open(r).convert('L'),dtype=np.float32)
  H,W=A.shape; t=48
  for y in range(0,H-t+1,t):
    for x in range(0,W-t+1,t):
      d=abs(A[y:y+t,x:x+t].mean()-B[y:y+t,x:x+t].mean())+np.abs(A[y:y+t,x:x+t]-B[y:y+t,x:x+t]).mean()*0.5
      worst=max(worst,d)
      if d>LIMIT: bad.append((f,x,y,round(float(d),1)))
print('compared %d frames; worst tile %.1f (limit %d)'%(len(pairs),worst,LIMIT))
print('CLEAN' if not bad else 'STALE PAINT: '+' '.join(f'f{f}@{x},{y}:{d}' for f,x,y,d in bad[:20]))
`;
fs.writeFileSync(path.join(out, "cmp.py"), py);
console.log(execFileSync("python", [path.join(out, "cmp.py"), path.join(out, "pairs.json")]).toString());
