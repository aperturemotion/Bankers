# Frame-to-frame motion score over a rendered JPEG sequence (scratchpad/frames.mjs output).
#   python scratchpad/motion.py [dir=out/seq] [from=0] [to=end]
#
# A smooth transition spreads its change over many frames; a POP concentrates it into one or two.
# So each frame is scored against the LOCAL median of its neighbours, not against a global bar —
# a slow white-stage dissolve and a busy build both sit high but flat, while an element that
# appears at full strength in one frame is a spike above whatever surrounds it.
#
# ⚠ THE CAPTION BAND IS MASKED. The word chips hard-swap in one frame BY DESIGN (the V2 contract,
# measured from the references) and would otherwise be every spike in the film.
import sys, os, glob
import numpy as np
from PIL import Image

d = sys.argv[1] if len(sys.argv) > 1 else "out/seq"
files = sorted(glob.glob(os.path.join(d, "*.jpeg")) + glob.glob(os.path.join(d, "*.jpg")))
lo = int(sys.argv[2]) if len(sys.argv) > 2 else 0
hi = int(sys.argv[3]) if len(sys.argv) > 3 else len(files) - 1
files = files[lo:hi + 1]

# beat table and section breaks, for annotation only — READ from scratchpad/beats.json, which
# audit.mjs writes from its own parse of Composition.tsx on every run. (V26's copy was a hand-kept
# table that had to be "re-copied after any re-wire"; on the V27 clone it still named V26's beats.)
import json
_bj = os.path.join(os.path.dirname(os.path.abspath(__file__)), "beats.json")
if not os.path.exists(_bj):
    sys.exit("motion.py: scratchpad/beats.json missing — run node scratchpad/audit.mjs first")
_b = json.load(open(_bj, encoding="utf8"))
BEATS = [(x["id"], x["enter"]) for x in _b["beats"]]
BREAKS = _b["breaks"]

def beat_of(f):
    name = BEATS[0][0]
    for n, a in BEATS:
        if f >= a:
            name = n
    return name

def load(p):
    im = np.asarray(Image.open(p).convert("L"), dtype=np.float32)
    h = im.shape[0]
    # caption band: y 200..400 of 1920 → mask it in whatever scale the sequence was rendered at
    y0, y1 = int(h * 200 / 1920), int(h * 400 / 1920)
    im = im.copy()
    im[y0:y1, :] = 0
    return im

prev = None
diffs = []
for i, p in enumerate(files):
    cur = load(p)
    diffs.append(0.0 if prev is None else float(np.mean(np.abs(cur - prev))))
    prev = cur
diffs = np.array(diffs)

W = 12
spikes = []
for i in range(1, len(diffs)):
    f = lo + i
    a, b = max(1, i - W), min(len(diffs), i + W + 1)
    neigh = np.concatenate([diffs[a:i], diffs[i + 1:b]])
    med = float(np.median(neigh)) if len(neigh) else 0.0
    if diffs[i] > 1.2 and diffs[i] > 3.0 * max(med, 0.25):
        near_break = any(abs(f - br) <= 20 for br in BREAKS)
        near_cut = [n for n, s in BEATS if abs(f - s) <= 3]
        spikes.append((f, diffs[i], med, beat_of(f), "BREAK" if near_break else "", ",".join(near_cut)))

np.savetxt(os.path.join(d, "..", "motion.csv"), np.c_[np.arange(lo, lo + len(diffs)), diffs],
           fmt=["%d", "%.3f"], delimiter=",", header="frame,diff", comments="")
print(f"{len(files)} frames scored ({lo}-{lo + len(files) - 1}); mean diff {diffs[1:].mean():.3f}")
print(f"{len(spikes)} spikes (diff > 1.2 and > 3x the local median)\n")
print(f"{'frame':>6} {'diff':>7} {'local':>6}  beat            note")
for f, v, m, bt, br, cut in spikes:
    print(f"{f:>6} {v:7.2f} {m:6.2f}  {bt:<15} {br} {('cut:' + cut) if cut else ''}")
