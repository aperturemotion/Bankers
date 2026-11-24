#!/usr/bin/env bash
# V37 THE TAKE (cloned from V36's take36.sh), end to end (re-runnable): trim (holds) → shift Scribe's raw words through the cut map → ×1.04 atempo fit (pitch kept;
# the 80-s cap) and the words scaled with it → public/vo_trimmed.mp3 → captions.ts / episode.json from the take → the bed against it.
#   bash scratchpad/take37.sh
set -e
cd "$(dirname "$0")/.."
export PATH=/home/user/ffbin:$PATH FFMPEG_BIN=/home/user/ffbin FFPROBE=/home/user/ffbin/ffprobe
python3 scratchpad/vo_trim.py
python3 scratchpad/vo/shiftwords.py
mkdir -p out
cp public/vo_trimmed.wav out/vo_trimmed_unstretched.wav
cp scratchpad/fw_words.json out/fw_words_unstretched.json
ffmpeg -v error -y -i out/vo_trimmed_unstretched.wav -af atempo=1.04 -ar 44100 -ac 1 -c:a pcm_s16le public/vo_trimmed.wav
python3 - <<'PY'
import json
K = 1.04
d = json.load(open("out/fw_words_unstretched.json"))
for w in d["words"]: w["a"] = round(w["a"] / K, 3); w["b"] = round(w["b"] / K, 3)
d["_doc"] = ("V37 take A: ElevenLabs Scribe words on the RAW take, shifted through scratchpad/vo/trimmap.json (vo/shiftwords.py), then "
             "scaled by 1/1.04 for the atempo fit (public/vo_trimmed.wav is the trim stretched x1.04, pitch kept; the unstretched trim "
             "is out/vo_trimmed_unstretched.wav). Written by scratchpad/take37.sh.")
json.dump(d, open("scratchpad/fw_words.json", "w"))
PY
ffmpeg -v error -y -i public/vo_trimmed.wav -c:a libmp3lame -b:a 192k public/vo_trimmed.mp3
echo "voice: $(ffprobe -v error -show_entries format=duration -of csv=p=0 public/vo_trimmed.mp3) s"
python3 scratchpad/synth_captions.py --take | grep -v "^    "
python3 scratchpad/bed36.py
# the composition's bed-length guard reads the baked bed's real length (whole frames)
BF=$(python3 -c "import subprocess;d=float(subprocess.run(['/home/user/ffbin/ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','public/bed_devil.mp3'],capture_output=True,text=True).stdout);print(int(d*30))")
sed -i "s/^const BED_FRAMES = [0-9]*;/const BED_FRAMES = $BF;/" src/bnx/Composition.tsx
echo "BED_FRAMES = $BF"
