# THE HOOK'S FOLLOW, MEASURED (Timur, 2026-10-05: "the camera following the line at the beginning is too jittery"). Reads the
# lossless frames framesprobe.mjs renders (the real render path) and finds each frame's global shift against the previous one
# by phase correlation (a thresholded centroid false-flags growing ink — root CLAUDE.md, OffCamCelebs 023), over the frame
# minus the caption band and the watermark. Then it judges the camera's path the way the eye does:
#   · REVERSALS: the vertical or horizontal step changing sign while the move is under way (a bob) — must be 0;
#   · JERK: the step's frame-to-frame change against its own 5-frame median — the worst must stay under LIMIT px.
# It proves itself first: a synthetic smooth pan must pass, and the same pan with a ±2 px wobble must fail.
#   python scratchpad/followjit.py <dir> <from> <to> [mask-left px] [mask-right from x]
import sys, os
import numpy as np
from PIL import Image

LIMIT = 1.5

def shift(a, b):
    """the (dx, dy) that moves a onto b, sub-pixel, by phase correlation with a parabolic peak fit"""
    A, B = np.fft.fft2(a), np.fft.fft2(b)
    R = A.conj() * B
    R /= np.abs(R) + 1e-9
    r = np.fft.ifft2(R).real
    iy, ix = np.unravel_index(np.argmax(r), r.shape)
    def sub(c, m, n):
        l, h = r[(c[0] - 1) % m, c[1]] if n == 0 else r[c[0], (c[1] - 1) % m], r[(c[0] + 1) % m, c[1]] if n == 0 else r[c[0], (c[1] + 1) % m]
        p = r[c]
        d = l - 2 * p + h
        return 0.0 if abs(d) < 1e-12 else 0.5 * (l - h) / d
    dy = iy + sub((iy, ix), r.shape[0], 0)
    dx = ix + sub((iy, ix), r.shape[1], 1)
    if dy > r.shape[0] / 2: dy -= r.shape[0]
    if dx > r.shape[1] / 2: dx -= r.shape[1]
    return dx, dy

def judge(steps):
    s = np.array(steps)
    moving = np.abs(s) > 0.4
    rev = sum(1 for i in range(1, len(s)) if moving[i] and moving[i - 1] and np.sign(s[i]) != np.sign(s[i - 1]))
    jerk = 0.0
    for i in range(2, len(s) - 2):
        jerk = max(jerk, abs(s[i] - np.median(s[i - 2:i + 3])))
    return rev, jerk

MASK_LEFT = int(sys.argv[4]) if len(sys.argv) > 4 else 0   # px from the left edge to ignore (the survey cards' strip)
MASK_RIGHT = int(sys.argv[5]) if len(sys.argv) > 5 else 0  # x from which to ignore (the landing figure's own scale)

# ★ INK mode (2026-10-07, the restyled hook): over a PERIODIC lit background — 500 keycaps at one pitch — phase correlation locks onto
# the grid's period and reads aliased steps (−12 / −18 / −11 px alternating) on a camera path that is analytically smooth. The
# follow's subject is the LINE, so FOLLOWJIT_INK=<luma> keeps only the ink brighter than that (the white line and its head) and
# measures that plane. The wall rides the same 3-D transform at its own depth.
INK = float(os.environ.get("FOLLOWJIT_INK", "0"))

def prep(im):
    a = np.asarray(im.convert("L").resize((im.width // 2, im.height // 2)), dtype=np.float64)
    if INK: a = np.where(a >= INK, a, 0.0)
    if MASK_LEFT: a[:, : MASK_LEFT // 2] = a.mean()
    if MASK_RIGHT: a[:, MASK_RIGHT // 2 :] = a.mean()
    a[: 340 // 2, :] = a.mean()          # the caption band and above
    a[1700 // 2 :, :] = a.mean()         # the watermark and below
    return a - a.mean()

def canaries():
    rng = np.random.default_rng(1)
    base = rng.random((300, 300)) * 255
    def frames(wobble):
        out = []
        for k in range(30):
            dy = 3.0 * k + (2.0 * (-1) ** k if wobble else 0)
            out.append(np.roll(base, int(round(dy)), axis=0))
        return out
    for wob, must in ((False, True), (True, False)):
        fr = frames(wob)
        steps = [shift(fr[i - 1] - fr[i - 1].mean(), fr[i] - fr[i].mean())[1] for i in range(1, len(fr))]
        rev, jerk = judge(steps)
        ok = rev == 0 and jerk < LIMIT
        if ok != must:
            sys.exit(f"CANARY FAILED: wobble={wob} judged {'smooth' if ok else 'jittery'}")

canaries()
d, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
files = {int(f.split("-")[-1].split(".")[0]): os.path.join(d, f) for f in os.listdir(d) if f.endswith(".png")}
prev, xs, ys = None, [], []
for n in range(a, b + 1):
    if n not in files: continue
    cur = prep(Image.open(files[n]))
    if prev is not None:
        dx, dy = shift(prev, cur)
        xs.append(dx * 2); ys.append(dy * 2)
    prev = cur
for name, s in (("x", xs), ("y", ys)):
    rev, jerk = judge(s)
    print(f"{name}: steps {' '.join(f'{v:+.1f}' for v in s)}")
    print(f"{name}: reversals {rev}, worst jerk {jerk:.2f} px (limit {LIMIT})")
rx, jx = judge(xs); ry, jy = judge(ys)
print("canaries ok;", "SMOOTH" if rx == ry == 0 and max(jx, jy) < LIMIT else "JITTERY")
