#!/usr/bin/env bash
# V39 master: render38.mjs (resumable 60-f chunks) retried until the master exists; ends with one RENDERLOOP_END line
cd "$(dirname "$0")/.."
export FFPROBE=/home/user/ffbin/ffprobe FFMPEG=/home/user/ffbin/ffmpeg
for i in $(seq 1 12); do
  node scratchpad/render38.mjs --chunk 60 --conc 2 --port 5939 && [ -s out/ronald_read.mp4 ] && { echo "RENDERLOOP_END ok try $i"; exit 0; }
  echo "render try $i failed; retrying"; pkill -f "chrome-headless-shell.*5939" 2>/dev/null; sleep 5
done
echo "RENDERLOOP_END FAILED"
