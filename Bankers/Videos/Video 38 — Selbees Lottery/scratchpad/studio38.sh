#!/usr/bin/env bash
# V38 — the static Studio bundle for the Artifact handback (cloned from studio35.sh). Every medium the film loads is EMBEDDED as a data: URI
# (the artifact frame's media policy) through src/bnx/audiodata.gen.ts, restored to the empty stub on exit. The SFX families are the cueAt
# names used in src/w3d; photos go in as WebP; the WAVs as MP3 192k.
set -e
cd "$(dirname "$0")/.."
OUT=out/studio
STUB=scratchpad/audiodata.stub.ts
GEN=src/bnx/audiodata.gen.ts
restore() { cp "$STUB" "$GEN"; }
trap restore EXIT
node -e '
const fs = require("fs"), cp = require("child_process");
const src = fs.readdirSync("src/w3d").filter((f) => /\.tsx?$/.test(f)).map((f) => fs.readFileSync("src/w3d/" + f, "utf8")).join("\n");
const fams = [...new Set([...src.matchAll(/cueAt\(\s*"([a-z_0-9]+)"/g)].map((m) => m[1]))].sort();
const photos = fs.existsSync("public/photos") ? fs.readdirSync("public/photos").filter((f) => /\.(jpg|png)$/.test(f)).map((f) => "photos/" + f) : [];
const files = ["vo_trimmed.mp3", "bed_focus.mp3", ...fams.map((f) => `sfx/${f}.wav`), ...photos, "bill100.png", "brand/bankers-logo-black.svg", "brand/bankers-logo-blue.svg", "brand/bankers-logo-white.svg"];
const map = {};
for (const f of files) {
  if (!fs.existsSync("public/" + f)) throw new Error("studio38: missing public/" + f);
  if (/\.(png|jpg)$/.test(f)) { const w = "out/" + f.replace(/[\/.]/g, "_") + ".webp"; cp.execFileSync("/home/user/ffbin/ffmpeg", ["-y", "-loglevel", "error", "-i", "public/" + f, "-c:v", "libwebp", "-quality", "86", w]); map[f] = "data:image/webp;base64," + fs.readFileSync(w).toString("base64"); continue; }
  if (f.endsWith(".wav")) { const m = "out/" + f.replace(/[\/.]/g, "_") + ".mp3"; cp.execFileSync("/home/user/ffbin/ffmpeg", ["-y", "-loglevel", "error", "-i", "public/" + f, "-c:a", "libmp3lame", "-b:a", "192k", m]); map[f] = "data:audio/mpeg;base64," + fs.readFileSync(m).toString("base64"); continue; }
  map[f] = (f.endsWith(".mp3") ? "data:audio/mpeg" : "data:image/svg+xml") + ";base64," + fs.readFileSync("public/" + f).toString("base64");
}
fs.writeFileSync("src/bnx/audiodata.gen.ts", "// GENERATED for the Studio bundle by scratchpad/studio38.sh — restored to the empty stub after bundling\nexport const AUDIO_DATA: Record<string, string> = " + JSON.stringify(map) + ";\n");
console.error("embedded", files.length, "files (sfx: " + fams.join(",") + "),", (Object.values(map).reduce((a, s) => a + s.length, 0) / 1e6).toFixed(1), "MB");
'
rm -rf "$OUT"
node node_modules/@remotion/cli/remotion-cli.js bundle src/index.ts --out-dir "$OUT" --public-path ./ >/dev/null
restore
rm -f "$OUT"/public/*.wav "$OUT"/public/*.mp3 "$OUT"/public/*.png "$OUT"/public/*.jpg; rm -rf "$OUT/public/sfx" "$OUT/public/photos" "$OUT/public/vo" ; rm -f "$OUT"/*.map "$OUT"/public/ElevenLabs*
sed -i 's#<title>[^<]*</title>#<title>Selbees Lottery Studio</title>#' "$OUT/index.html"
du -sh "$OUT"; ls "$OUT"
# the Artifact tool refuses a literal U+FFFD (three.js/troika carry it in string literals): escape it — identical in JS strings and regexes
python3 -c "
import glob
for f in glob.glob('$OUT/*.js'):
    s=open(f,encoding='utf-8').read()
    if '\ufffd' in s: open(f,'w',encoding='utf-8').write(s.replace('\ufffd','\\\\uFFFD')); print('escaped U+FFFD in',f)
"
