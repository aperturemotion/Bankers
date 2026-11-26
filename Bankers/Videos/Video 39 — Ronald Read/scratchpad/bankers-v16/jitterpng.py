# jitter.py's measurement over a folder of lossless frames (framesprobe.mjs): the ink centroid per frame in a crop, its
# frame-to-frame steps, and how often the step flips direction (jitter) — compare with the layout's own smooth motion.
#   python scratchpad/jitterpng.py <dir> <x> <y> <w> <h> <light|dark> [threshold]
import sys, os
from PIL import Image
d, x, y, w, h, mode = sys.argv[1], *map(int, sys.argv[2:6]), sys.argv[6]
thr = int(sys.argv[7]) if len(sys.argv) > 7 else (190 if mode == "light" else 70)
files = sorted(f for f in os.listdir(d) if f.endswith(".png"))
cs = []
for f in files:
    im = Image.open(os.path.join(d, f)).convert("L").crop((x, y, x + w, y + h)); px = im.load()
    sx = sy = m = 0
    for j in range(h):
        for i in range(w):
            v = px[i, j]
            if (v >= thr) if mode == "light" else (v <= thr):
                sx += i; sy += j; m += 1
    cs.append((sx / m, sy / m) if m else None)
vel = [(cs[i][0] - cs[i-1][0], cs[i][1] - cs[i-1][1]) for i in range(1, len(cs)) if cs[i] and cs[i-1]]
acc = [(vel[i][0] - vel[i-1][0], vel[i][1] - vel[i-1][1]) for i in range(1, len(vel))]
flips = sum(1 for i in range(1, len(acc)) if acc[i][1] * acc[i-1][1] < -0.04 or acc[i][0] * acc[i-1][0] < -0.04)
print(f"{len(cs)} frames · max |step| {max(abs(v[0]) + abs(v[1]) for v in vel):.2f} px · max |2nd diff| {max(abs(a[0]) + abs(a[1]) for a in acc):.2f} · direction flips {flips}/{max(1, len(acc) - 1)}")
print("y:", " ".join(f"{c[1]:.2f}" for c in cs if c))
print("x:", " ".join(f"{c[0]:.2f}" for c in cs if c))
