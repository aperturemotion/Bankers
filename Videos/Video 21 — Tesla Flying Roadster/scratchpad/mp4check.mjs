// THE MP4-vs-STUDIO CHECK (2026-10-15, Video 11: "this only applies to the rendered version, theres no issue with the studio version").
// Renders FRESH stills (what the Studio shows) for every frame of a range and compares them with the same frames decoded from the
// rendered MP4, in 48-px tiles. Encoder noise sits well under LIMIT; a tile over it is something the render drew differently.
//   node scratchpad/mp4check.mjs <from> <to> [every=1] [mp4=out/tesla_flying_roadster.mp4]
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
const RP = process.env.RPORT ? { port: Number(process.env.RPORT) } : {};
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [a, b, every = 1] = process.argv.slice(2, 5).map(Number);
const mp4 = path.resolve(root, process.argv[5] ?? "out/tesla_flying_roadster.mp4");
if (!(Number.isInteger(a) && Number.isInteger(b) && b >= a)) { console.error("usage: mp4check.mjs <from> <to> [every] [mp4]"); process.exit(1); }
const FF = "C:/Users/Timur/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe";
const out = path.join(root, "out", "mp4check");
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(path.join(out, "mp4"), { recursive: true }); fs.mkdirSync(path.join(out, "fresh"), { recursive: true });
execFileSync(FF, ["-v", "error", "-i", mp4, "-vf", `select=between(n\\,${a}\\,${b})`, "-vsync", "0", "-start_number", String(a), path.join(out, "mp4", "f%d.png")]);
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
const composition = await selectComposition({ ...RP, serveUrl, id: "TeslaFlyingRoadster" });
const picks = []; for (let f = a; f <= b; f += every) picks.push(f);
for (const f of picks) await renderStill({ ...RP, composition, serveUrl, frame: f, imageFormat: "png", output: path.join(out, "fresh", `f${f}.png`) });
fs.writeFileSync(path.join(out, "pairs.json"), JSON.stringify(picks.map((f) => [f, path.join(out, "mp4", `f${f}.png`), path.join(out, "fresh", `f${f}.png`)])));
const py = `
import json,sys
import numpy as np
from PIL import Image
pairs=json.load(open(sys.argv[1],encoding="utf8")); LIMIT=10; worst=0; bad=[]; per=[]
for f,s,r in pairs:
  A=np.asarray(Image.open(s).convert('L'),dtype=np.float32); B=np.asarray(Image.open(r).convert('L'),dtype=np.float32)
  H,W=A.shape; t=48; fw=0
  for y in range(0,H-t+1,t):
    for x in range(0,W-t+1,t):
      d=abs(A[y:y+t,x:x+t].mean()-B[y:y+t,x:x+t].mean())+np.abs(A[y:y+t,x:x+t]-B[y:y+t,x:x+t]).mean()*0.5
      fw=max(fw,d)
      if d>LIMIT: bad.append((f,x,y,round(float(d),1)))
  per.append((f,round(float(fw),1))); worst=max(worst,fw)
print('per-frame worst tile:',' '.join(f'{f}:{w}' for f,w in per))
print('compared %d frames; worst tile %.1f (limit %d)'%(len(pairs),worst,LIMIT))
print('CLEAN' if not bad else 'RENDER DIFFERS: '+' '.join(f'f{f}@{x},{y}:{d}' for f,x,y,d in bad[:30]))
`;
fs.writeFileSync(path.join(out, "cmp.py"), py);
console.log(execFileSync("python", [path.join(out, "cmp.py"), path.join(out, "pairs.json")]).toString());
