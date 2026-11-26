# -*- coding: utf-8 -*-
# V33 — WHOLE-PIXEL TICKS: the jitter a viewer sees as "glitching around". A layer Chrome keeps 2-D (flattened, or outside
# any 3-D context) under the camera's sub-pixel drift does not drift: it SITS, then jumps exactly 1 px, then sits. The
# signature, per 96-px tile tracked by phase correlation: an isolated step of ~1 px (0.8–1.2) between two calm frames
# (< 0.2 px), with a confident correlation. A smooth drift never produces it; an animated move is not calm either side.
# ★ It proves itself first: canary A (a sine drift, sub-pixel) must give no ticks; canary B (the same drift ROUNDED to
#   whole pixels) must give ticks. A judge that cannot tell them apart refuses.
#   python scratchpad/ticks33.py [dir=out/full3] [from] [to]
import os, sys, json, math
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jitter33 import shift

T, STEP, Y0, Y1 = 96, 96, 300, 1440
def ticks_of(steps):
    out = []
    for i in range(1, len(steps) - 1):
        a, b, c = steps[i - 1], steps[i], steps[i + 1]
        if None in (a, b, c): continue
        m = max(abs(b[0]), abs(b[1]))
        if 0.8 <= m <= 1.25 and max(abs(a[0]), abs(a[1])) < 0.2 and max(abs(c[0]), abs(c[1])) < 0.2: out.append(i)
    return out

def canaries():
    from scipy.ndimage import shift as nshift, gaussian_filter
    rng = np.random.default_rng(5); base = gaussian_filter(rng.random((T + 40, T + 40)) * 255, 2)
    def steps(path):
        fs = [nshift(base, (p, 0), order=3, mode="nearest")[20:20 + T, 20:20 + T] for p in path]
        out = []
        for a, b in zip(fs, fs[1:]):
            dx, dy, cf = shift(a, b); out.append((dx, dy) if cf > 0.5 else None)
        return out
    A = [3 * math.sin(i / 23) for i in range(60)]
    B = [round(v) for v in A]
    na, nb = len(ticks_of(steps(A))), len(ticks_of(steps(B)))
    ok = na == 0 and nb >= 3
    print(f"canaries: A smooth drift {na} ticks · B rounded drift {nb} ticks → {'OK' if ok else 'REFUSED'}")
    if not ok: sys.exit(2)

if __name__ == "__main__":
    canaries()
    d = sys.argv[1] if len(sys.argv) > 1 else "out/full3"
    num = lambda f: int(f.split("-")[1].split(".")[0])
    files = sorted(f for f in os.listdir(d) if f.endswith(".jpeg"))
    lo = int(sys.argv[2]) if len(sys.argv) > 2 else num(files[0]); hi = int(sys.argv[3]) if len(sys.argv) > 3 else num(files[-1])
    files = [f for f in files if lo <= num(f) <= hi]
    here = os.path.dirname(os.path.abspath(__file__))
    B = json.load(open(os.path.join(here, "beats.json"), encoding="utf8"))
    beats = [(x["id"], x["enter"]) for x in B["beats"]]
    def beat_of(f):
        n = beats[0][0]
        for i, a in beats:
            if f >= a: n = i
        return n
    tiles = [(x, y) for y in range(Y0, Y1 - T + 1, STEP) for x in range(0, 1080 - T + 1, STEP)]
    steps = {t: [] for t in tiles}; prev = None; fr = []
    for fn in files:
        im = np.asarray(Image.open(os.path.join(d, fn)).convert("L"), dtype=np.float32)
        if prev is not None:
            for (x, y) in tiles:
                a = prev[y:y + T, x:x + T]; b = im[y:y + T, x:x + T]
                if a.std() < 5 or b.std() < 5: steps[(x, y)].append(None); continue
                dx, dy, c = shift(a, b)
                steps[(x, y)].append((dx, dy) if c > 0.6 else None)
            fr.append(num(fn))
        prev = im
    hits = []
    for t in tiles:
        for i in ticks_of(steps[t]): hits.append((fr[i], t))
    # by scene, and the worst tiles
    from collections import defaultdict
    by = defaultdict(list)
    for f, t in hits: by[beat_of(f)].append((f, t))
    print(f"\nframes {lo}-{hi}: {len(hits)} whole-pixel ticks")
    for b, rows in sorted(by.items(), key=lambda kv: -len(kv[1])):
        ts = defaultdict(list)
        for f, t in rows: ts[t].append(f)
        worst = sorted(ts.items(), key=lambda kv: -len(kv[1]))[:4]
        print(f"  {b:<8} {len(rows):4d} ticks  " + "  ".join(f"x{t[0]}-{t[0] + T} y{t[1]}-{t[1] + T} ×{len(fs)} ({min(fs)}–{max(fs)})" for t, fs in worst))
