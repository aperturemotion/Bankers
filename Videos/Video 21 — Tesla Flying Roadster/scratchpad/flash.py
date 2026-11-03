# THE FLASH CHECK (Timur, 2026-09-30: "at 11 seconds, the screen randomly changes and becomes brighter. Fix that").
# Reads the frames the every-frame sweep kept (out/sweep_frames/element-NNNN.jpeg, `sweep.mjs 1 --keep`) and measures each
# frame's mean brightness. A designed change of stage (the white dissolve, 24 f on INOUT) peaks at ~19 levels per frame;
# the defect was a push-past layer hanging over the new place as a blurred veil and dropping out in ONE frame (+69 levels,
# frame 347 → 348), and the monitors doing the same into the pump (+43, frame 976). Anything over LIMIT in one frame is a
# refusal. It proves itself on every run: a synthetic step must fire and a synthetic 24 f INOUT dissolve must not.
#   python scratchpad/flash.py
import os, sys
import numpy as np
from PIL import Image

LIMIT = 25.0
src = next((a for a in sys.argv[1:] if not a.startswith("-")), "out/sweep_frames")   # (a folder of decoded MP4 frames checks the delivered file)
# the frame number is read from the name whatever its width (a --range run writes element-000.jpeg, a full one element-0000)
num = lambda n: int(n[len("element-"):-len(".jpeg")])
names = sorted((n for n in os.listdir(src) if n.startswith("element-") and n.endswith(".jpeg")), key=num)
if len(names) < 100:
    sys.exit(f"only {len(names)} frames in {src} — run `node scratchpad/sweep.mjs 1 --keep` first; refusing")
idx = [num(n) for n in names]
if idx != list(range(idx[0], idx[0] + len(idx))):
    sys.exit("the kept frames are not consecutive — the check needs every frame; refusing")

def jumps(lum):
    d = np.diff(lum)
    return [(i, float(v)) for i, v in enumerate(d) if abs(v) > LIMIT]

# the canaries: a one-frame step must fire; a 24-frame INOUT dissolve from dark (32) to white (233) must not
t = np.linspace(0, 1, 25)
inout = t * t * (3 - 2 * t)
dissolve = np.concatenate([np.full(10, 32.0), 32 + 201 * inout, np.full(10, 233.0)])
step = np.concatenate([np.full(10, 165.0), np.full(10, 233.0)])
if not jumps(step) or jumps(dissolve):
    sys.exit("canary failed: the check cannot tell a flash from a dissolve — refusing")

lum = np.array([np.asarray(Image.open(os.path.join(src, n)).convert("L"), dtype=np.float32).mean() for n in names])
hits = jumps(lum)
worst = float(np.abs(np.diff(lum)).max())
print(f"flash check: {len(names)} frames, worst one-frame change {worst:.1f} levels (limit {LIMIT}); canaries ok")
for i, v in hits:
    print(f"FLASH frame {idx[i]} -> {idx[i] + 1}: {v:+.1f} levels ({idx[i] / 30:.2f} s)")
print("CLEAN" if not hits else f"REFUSED — {len(hits)} one-frame brightness jumps")
sys.exit(1 if hits else 0)
