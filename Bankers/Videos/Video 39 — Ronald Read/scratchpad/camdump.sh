#!/usr/bin/env bash
# dump CAM + CAM_RAW for every frame → out/cam_s.json, then the jerk check
cd "$(dirname "$0")/.."
npx esbuild scratchpad/camdump2_entry.ts --bundle --platform=node --format=cjs --inject:scratchpad/camdump_shim.js --loader:.png=empty --loader:.jpg=empty --loader:.mp3=empty --loader:.wav=empty --outfile=out/camdump2.cjs --log-level=error && node out/camdump2.cjs > out/cam_s.json && python3 scratchpad/camjerk.py out/cam_s.json 12 | sed -n '/^cam/,$p'
