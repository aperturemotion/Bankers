# EVERY OBJECT AT FULL SIZE, PART BY PART (STYLE §6.8a — Timur, 2026-10-05: "fix up the suitcase, and any other complex visuals, as
# most of them are messed up when you look closely"). No sweep sees a bad join; this puts each object in front of the eye at 1:1.
# Renders each object's frame at rest (scratchpad/still.mjs), then crops it 1:1 into out/closeups/<name>.png.
#   python scratchpad/closeups.py            (all)      python scratchpad/closeups.py suitcase dominoes
import json, os, subprocess, sys
from PIL import Image

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
# name: (frame at rest, crop box x0 y0 x1 y1 on the 1080 × 1920 frame) — ★ DERIVED from the sweep's own measurements by
# closeplan.mjs (Video 9, 2026-10-12: this list was Video 7's, hand-typed, carried through two clones)
plan_path = os.path.join(root, "out", "closeplan.json")
if not os.path.exists(plan_path):
    sys.exit("no out/closeplan.json — run `node scratchpad/closeplan.mjs` after a full `sweep.mjs 1 --keep`; refusing")
OBJECTS = {k: (v["frame"], tuple(v["box"])) for k, v in json.load(open(plan_path)).items()}
names = sys.argv[1:] or list(OBJECTS)
frames = sorted({OBJECTS[n][0] for n in names})
subprocess.run(["node", os.path.join(root, "scratchpad", "still.mjs"), *map(str, frames)], cwd=root, check=True, capture_output=True)
out = os.path.join(root, "out", "closeups")
os.makedirs(out, exist_ok=True)
for n in names:
    f, box = OBJECTS[n]
    Image.open(os.path.join(root, "out", "sweep", f"f{f:03d}.png")).convert("RGB").crop(box).save(os.path.join(out, f"{n}.png"))
print(f"{len(names)} close-ups -> {out}")
