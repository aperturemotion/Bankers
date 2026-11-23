# THE SOUND DRAWN AGAINST THE PICTURE'S OWN MOTION (Timur, 2026-10-01: "ensure that the sfx are timed right, especially in
# the hook scene"). Reads the frames the every-frame sweep kept (out/sweep_frames/element-NNNN.jpeg, `sweep.mjs 1 --keep`)
# and the cue sheet as heard (out/sfx_cues.json, `sfxsheet.mjs --json`), and plots, per frame, how much of the picture
# MOVED (mean absolute change from the frame before, caption band and watermark masked) with every sound on top of it:
# a hit as a line at its heard peak, a process sound as a band over its heard span, a camera move's whoosh in grey.
#   python scratchpad/sfxmotion.py 0 300 [frames_dir] [out.png]
# Optional regions: --roi=x0,y0,x1,y1 (full-frame px) measures motion inside that box only (e.g. the hook's beam).
import sys, json, os
import numpy as np
from PIL import Image
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

args = [a for a in sys.argv[1:] if not a.startswith("--")]
opts = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
a, b = int(args[0]), int(args[1])
src = args[2] if len(args) > 2 else "out/sweep_frames"
out = args[3] if len(args) > 3 else f"out/sfxmotion_{a}_{b}.png"
cues = json.load(open("out/sfx_cues.json"))

def load(i):
    p = os.path.join(src, f"element-{i:04d}.jpeg")
    im = np.asarray(Image.open(p).convert("L"), dtype=np.float32)
    return im

f0 = load(a)
H, W = f0.shape
k = W / 1080.0                                   # the kept frames are half size
mask = np.ones_like(f0, dtype=bool)
mask[: int(470 * k), :] = False                  # the caption band (chips sit at y ~291) — a word swap is not motion
mask[int(1700 * k):, :] = False                  # the watermark
if "roi" in opts:
    x0, y0, x1, y1 = [int(float(v) * k) for v in opts["roi"].split(",")]
    roi = np.zeros_like(mask); roi[y0:y1, x0:x1] = True; mask &= roi
motion, prev = [], f0
for i in range(a + 1, b + 1):
    cur = load(i)
    motion.append(float(np.abs(cur - prev)[mask].mean()))
    prev = cur
xs = np.arange(a + 1, b + 1)

fig, ax = plt.subplots(figsize=(16, 4.6), dpi=110)
ax.fill_between(xs, motion, color="#1F62B3", alpha=0.35, lw=0)
ax.plot(xs, motion, color="#0B4691", lw=1.2, label="picture motion (mean |Δ| per frame)")
top = max(motion) * 1.15 if motion else 1
col = {"proc": "#E08A00", "hit": "#C2185B", "move": "#777777"}
seen = set()
for c in cues:
    if c["end"] < a or c["at"] > b: continue
    lab = None if c["kind"] in seen else {"proc": "process sound (heard span)", "hit": "hit (heard peak)", "move": "camera-move whoosh (peak)"}[c["kind"]]
    seen.add(c["kind"])
    if c["kind"] == "proc":
        ax.axvspan(max(a, c["at"]), min(b, c["end"]), ymin=0.0, ymax=0.08, color=col["proc"], alpha=0.8, label=lab)
        ax.text(max(a, c["at"]) + 1, top * 0.1, c["s"], fontsize=8, color=col["proc"])
    else:
        ax.axvline(c["peak"], color=col[c["kind"]], lw=1.4 if c["kind"] == "hit" else 1, ls="-" if c["kind"] == "hit" else "--", label=lab)
        ax.text(c["peak"] + 0.6, top * (0.93 if c["kind"] == "hit" else 0.8), c["s"], fontsize=8, rotation=90, va="top", color=col[c["kind"]])
ax.set_xlim(a, b); ax.set_ylim(0, top)
ax.set_xlabel("frame (30 fps)"); ax.set_ylabel("motion")
sec = ax.secondary_xaxis("top", functions=(lambda f: f / 30, lambda s: s * 30)); sec.set_xlabel("seconds")
ax.legend(loc="upper right", fontsize=8)
ax.set_title(f"Picture motion vs. sound, frames {a}–{b}" + (f" (region {opts['roi']})" if "roi" in opts else ""), fontsize=10)
fig.tight_layout(); fig.savefig(out)
print(out)
# the numbers behind the picture: per 5 frames
for i in range(0, len(motion), 5):
    print(f"{xs[i]:5d} " + " ".join(f"{m:5.2f}" for m in motion[i:i + 5]))
