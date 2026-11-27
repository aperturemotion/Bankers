#!/usr/bin/env bash
# rev 5: the label style frames — one still of frame 69 (Evart, Michigan) per LABEL_STYLE, then label_style.ts back to "off"
cd "$(dirname "$0")/.."
F=${1:-69}
for st in chip off type pin world; do
  sed -i "s/export const LABEL_STYLE: string = \"[a-z]*\";/export const LABEL_STYLE: string = \"$st\";/" src/w3d/label_style.ts
  STILL_OUT=out/labels/$st PORT_STILL=5951 node scratchpad/still38.mjs --scale 0.5 $F 2>&1 | grep -E "^f|rror"
done
sed -i "s/export const LABEL_STYLE: string = \"[a-z]*\";/export const LABEL_STYLE: string = \"off\";/" src/w3d/label_style.ts
