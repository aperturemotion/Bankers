#!/usr/bin/env bash
# V35 (cloned from 100bps V46) — build the static Studio bundle for the Artifact handback, pruned to the public files the film loads.
# ★ Audio AND images are EMBEDDED as data: URIs for this bundle only (the artifact frame's media policy: data:/blob:), via src/bnx/audiodata.gen.ts;
#   the empty stub is restored on exit, whatever happens (trap), so renders keep reading public/ files.
set -e
cd "$(dirname "$0")/.."
OUT=out/studio
STUB=scratchpad/audiodata.stub.ts
GEN=src/bnx/audiodata.gen.ts
restore() { cp "$STUB" "$GEN"; }
trap restore EXIT
node -e '
const fs = require("fs");
const cues = JSON.parse(fs.readFileSync("out/cues.json", "utf8"));
const list = (Array.isArray(cues) ? cues : cues.cues);
const fams = [...new Set(list.map((c) => c.s))].sort();
const comp = fs.readFileSync("src/bnx/Composition.tsx", "utf8");
const bed = comp.match(/const BED_FILE\s*=\s*"([^"]+)"/)[1];
// V35 (recovered from the published bundle): the three brand SVGs are embedded too (the close and the watermark load them)
// ★ V36: the voice goes in only once the take is wired (HAS_VO) — before that public/vo_trimmed.mp3 is Video 35's and nothing plays it
const hasVo = /const HAS_VO = true;/.test(comp);
const files = [...(hasVo ? ["vo_trimmed.mp3"] : []), bed, ...fams.map((f) => `sfx/${f}.wav`), "bill100.png", "brand/bankers-logo-black.svg", "brand/bankers-logo-blue.svg", "brand/bankers-logo-white.svg"];
const mime = (f) => f.endsWith(".mp3") ? "audio/mpeg" : f.endsWith(".png") ? "image/png" : f.endsWith(".jpg") ? "image/jpeg" : f.endsWith(".svg") ? "image/svg+xml" : "audio/wav";
const map = {};
for (const f of files) {
  if (!fs.existsSync("public/" + f)) throw new Error("studio45: missing public/" + f);
  // photos go in as WebP (the host caps each file at 16 MiB; the bundle carries everything) — made by ffmpeg into out/, alpha kept
  if (/\.(png|jpg)$/.test(f)) {
    const w = "out/" + f.replace(/[\/.]/g, "_") + ".webp";
    require("child_process").execFileSync("/home/user/ffbin/ffmpeg", ["-y", "-loglevel", "error", "-i", "public/" + f, "-c:v", "libwebp", "-quality", "88", w]);
    map[f] = "data:image/webp;base64," + fs.readFileSync(w).toString("base64");
    continue;
  }
  // ★ V46: the SFX WAVs go in as MP3 (192k) for this bundle only — the EarnEdits files are long (6–12 s) and put bundle.js at 24 MB,
  //   over the host cap; the MP3 encoder ~25-ms priming is under a frame, and renders still read the WAVs from public/
  if (f.endsWith(".wav")) {
    const m = "out/" + f.replace(/[\/.]/g, "_") + ".mp3";
    require("child_process").execFileSync("/home/user/ffbin/ffmpeg", ["-y", "-loglevel", "error", "-i", "public/" + f, "-c:a", "libmp3lame", "-b:a", "192k", m]);
    map[f] = "data:audio/mpeg;base64," + fs.readFileSync(m).toString("base64");
    continue;
  }
  map[f] = `data:${mime(f)};base64,` + fs.readFileSync("public/" + f).toString("base64");
}
fs.writeFileSync("src/bnx/audiodata.gen.ts", "// GENERATED for the Studio bundle by scratchpad/studio45.sh — restored to the empty stub after bundling\nexport const AUDIO_DATA: Record<string, string> = " + JSON.stringify(map) + ";\n");
console.error("embedded", files.length, "audio files,", (Object.values(map).reduce((a, s) => a + s.length, 0) / 1e6).toFixed(1), "MB");
'
rm -rf "$OUT"
node node_modules/@remotion/cli/remotion-cli.js bundle src/index.ts --out-dir "$OUT" --public-path ./ >/dev/null
restore
# drop audio and source files the page no longer loads from public/ (they are inside the bundle now)
rm -f "$OUT"/public/*.wav "$OUT"/public/*.mp3 "$OUT"/public/*.png "$OUT"/public/*.jpg; rm -rf "$OUT/public/sfx"; rm -f "$OUT"/*.map
sed -i 's#<title>[^<]*</title>#<title>Bre-X Gold Studio</title>#' "$OUT/index.html"
# ★ V46: the artifact host refuses files holding a literal U+FFFD; Remotion's media-tag code has 13 inside string literals — write them
#   as the equivalent \uFFFD escape
python3 -c "
import glob
for fn in glob.glob('$OUT/*.js'):
    s = open(fn, encoding='utf8').read()
    if '\ufffd' in s: open(fn, 'w', encoding='utf8').write(s.replace('\ufffd', '\\\\uFFFD'))
"
grep -c "data:audio" "$OUT"/*.js | grep -v ":0" || { echo "✗ no embedded audio in the bundle"; exit 1; }
du -sh "$OUT"; ls -la "$OUT" "$OUT/public"
