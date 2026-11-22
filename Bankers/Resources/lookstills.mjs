// lookcheck's helper (Bankers/STYLE.md §15.3): a video's JOURNEY places, and stills of chosen frames at half size.
//   node Bankers/Resources/lookstills.mjs "<video folder>" places            → JSON [{ id, t0, dur, white }] + total, on stdout
//   node Bankers/Resources/lookstills.mjs "<video folder>" stills <dir> f1 f2 … → <dir>/f<frame>.jpg (540 × 960)
// The journey is bundled from the video's OWN Video.tsx (as stylecheck does), so the places are the ones the render runs.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const [videoArg, mode, ...rest] = process.argv.slice(2);
const video = videoArg ? path.resolve(videoArg) : videoArg;
if (!videoArg || !["places", "stills"].includes(mode)) throw new Error('usage: lookstills.mjs "<video folder>" places | stills <dir> <frames…>');
const req = createRequire(path.join(video, "package.json"));
const mods = fs.readdirSync(path.join(video, "src"), { withFileTypes: true }).filter((d) => d.isDirectory() && fs.existsSync(path.join(video, "src", d.name, "Video.tsx"))).map((d) => d.name);
if (mods.length !== 1) throw new Error(`lookstills: expected one src/<module>/Video.tsx in ${video}, found ${mods.length}`);
const mod = path.join(video, "src", mods[0]);

if (mode === "places") {
  const esbuild = req("esbuild");
  const stub = { name: "stub-fonts", setup(b) {
    b.onResolve({ filter: /^@remotion\/(google-fonts|fonts)/ }, (a) => ({ path: a.path, namespace: "stub" }));
    b.onResolve({ filter: /(^|\/)Probe$/ }, (a) => ({ path: a.path, namespace: "stub" }));
    b.onLoad({ filter: /.*/, namespace: "stub" }, (a) => ({ contents: /Probe$/.test(a.path) ? `export const Probe = () => null;` : `export const loadFont = () => ({ fontFamily: "stub", waitUntilDone: () => Promise.resolve() });`, loader: "js" }));
  } };
  const r = await esbuild.build({
    stdin: { contents: `export { JOURNEY } from "./Video";`, resolveDir: mod, loader: "ts" },
    bundle: true, platform: "node", format: "cjs", write: false, jsx: "automatic", logLevel: "silent",
    external: ["react", "react/*", "react-dom", "remotion", "remotion/*", "@remotion/*"],
    loader: { ".svg": "text", ".png": "dataurl", ".jpg": "dataurl", ".json": "json" },
    plugins: [stub],
  });
  const tmp = path.join(video, "scratchpad", `.lookstills_${process.pid}.cjs`);
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, r.outputFiles[0].text);
  let J;
  try { J = createRequire(tmp)(tmp).JOURNEY; } finally { fs.rmSync(tmp, { force: true }); }
  if (!J || !Array.isArray(J.PLACES) || !J.PLACES.length) throw new Error(`lookstills: ${mod}/Video.tsx exports no JOURNEY.PLACES — refusing`);
  const places = J.PLACES.map((p) => ({ id: p.id, t0: p.t0, dur: typeof J.DUR_OF === "function" ? J.DUR_OF(p) : 48, white: !!p.white }));
  process.stdout.write(JSON.stringify({ places, total: J.TOTAL }));
} else {
  const [dir, ...fr] = rest;
  const frames = fr.map(Number);
  if (!dir || !frames.length || frames.some((x) => !Number.isFinite(x))) throw new Error("lookstills: stills <dir> <frames…>");
  const { bundle } = req("@remotion/bundler");
  const { selectComposition, renderStill } = req("@remotion/renderer");
  const root = fs.readFileSync(path.join(video, "src", "Root.tsx"), "utf8");
  const ids = [...root.matchAll(/id="([A-Za-z0-9-]+)"/g)].map((m) => m[1]);
  if (!ids.length) throw new Error("lookstills: no composition id in src/Root.tsx");
  const serveUrl = await bundle({ entryPoint: path.join(video, "src", "index.ts") });
  const composition = await selectComposition({ serveUrl, id: ids[0], inputProps: {} });
  fs.mkdirSync(dir, { recursive: true });
  for (const frame of frames) {
    await renderStill({ composition, serveUrl, frame, imageFormat: "jpeg", jpegQuality: 90, scale: 0.5, inputProps: {}, output: path.join(dir, `f${frame}.jpg`) });
  }
  console.log(`${frames.length} stills → ${dir}`);
}
