# THE POP SCAN — NOTHING APPEARS OR DISAPPEARS IN ONE FRAME, PROVEN IN PIXELS (Timur, 2026-10-12, Video 9: "the phone just disappears
# on scene. I need you to never allow abrupt disappearing of visuals" — STYLE §9.6).
# The sweep's VANISH / POP check reads the probe, so it is blind to anything marked data-probe-skip — the hook's phone vanished at
# frame 315 → 318 with every check CLEAN. This one reads the PICTURE: the frames the every-frame sweep kept (out/sweep_frames/,
# `sweep.mjs 1 --keep`, half size), in tiles of 16 px (32 px of the film).
#   A tile is a candidate when it changes by ≥ STEP_MIN levels between two frames and by ≤ 1/RATIO of that between the frames either
#   side (a fade spreads its change over its frames). A candidate counts only when MOTION cannot explain it: its content is matched
#   on shape (less its mean) against the other frame under the area's measured displacements (phase correlation) and a local search,
#   and content that slid in or out through the frame's edge is motion. Then:
#   VANISH — picture becomes bare stage in one frame, and what it held is nowhere in the next (the hook phone, 315 → 316);
#   POP    — bare stage becomes picture in one frame, from nowhere in the frame before;
#   BLIP   — a tile jumps and comes straight back (frame t+2 ≈ frame t): a one-frame glitch.
#   Blobs under 3 tiles (≈ 100 px) are dropped: a dot passing is not a piece of picture.
# The caption band is masked (chips swap hard by design, STYLE §5.4). Tiles that fire together at one frame are joined into blobs.
# It proves itself first on canaries built from REAL kept frames: a block removed in one frame must fire STEP; the same block faded
# over 12 frames, or slid 18 px a frame, must not; a one-frame blip must fire BLIP.
#   python scratchpad/popscan.py            (exit 1 on any finding)
import os, sys
sys.stdout.reconfigure(encoding="utf-8")
import numpy as np
from PIL import Image

SRC = next((a for a in sys.argv[1:] if not a.startswith("-")), "out/sweep_frames")   # (a folder of decoded MP4 frames checks the delivered file)
T = 16                      # tile (px of the half-size frame)
STEP_MIN, RATIO, MARGIN = 14.0, 3.0, 10.0
BLIP_BACK = 0.35            # frame t+2 within this share of the jump of frame t
CAP = tuple(int(v) for v in os.environ.get("POP_CAP", "110,180").split(","))   # the caption band, half-size y (V38 karaoke: POP_CAP=600,720)

num = lambda n: int(n[len("element-"):-len(".jpeg")])
names = sorted((n for n in os.listdir(SRC) if n.startswith("element-") and n.endswith(".jpeg")), key=num)
if len(names) < 100:
    sys.exit(f"only {len(names)} frames in {SRC} — run `node scratchpad/sweep.mjs 1 --keep` first; refusing")
idx = [num(n) for n in names]
if idx != list(range(idx[0], idx[0] + len(idx))):
    sys.exit("the kept frames are not every frame exactly once — refusing")

def load(n):
    return np.asarray(Image.open(os.path.join(SRC, n)).convert("L"), dtype=np.float32)

def tiles(a):
    h, w = a.shape
    a = a[: h - h % T, : w - w % T]
    return a.reshape(a.shape[0] // T, T, a.shape[1] // T, T).mean(axis=(1, 3))

R = 24                      # the local search (half-size px a frame), beside the measured displacements
EXPLAIN = 0.35              # a tile's content counts as MOVED if it is found within R at under this share of its change …
EXPLAIN_MAX = 9.0           # … and under this many levels a pixel
FLAT = 6.0                  # a tile of bare stage (the backdrop's soft gradients): its levels spread under this
MIN_BLOB = 3                # a finding is a piece of picture ≥ 3 tiles (≈ 100 px), not a dot passing

def _shifts(a, b, cy, cx, half):
    """the strongest displacements of the area around (cy, cx) from frame a to frame b (phase correlation, top 3 peaks)"""
    h, w = a.shape
    y0, y1, x0, x1 = max(0, cy - half), min(h, cy + half), max(0, cx - half), min(w, cx + half)
    A = a[y0:y1, x0:x1] - a[y0:y1, x0:x1].mean(); Bm = b[y0:y1, x0:x1] - b[y0:y1, x0:x1].mean()
    if A.shape[0] < 16 or A.shape[1] < 16: return []
    win = np.outer(np.hanning(A.shape[0]), np.hanning(A.shape[1]))
    F = np.fft.fft2(A * win); G = np.fft.fft2(Bm * win)
    Rr = G * np.conj(F); Rr /= np.abs(Rr) + 1e-6
    c = np.real(np.fft.ifft2(Rr))
    out = []
    for _ in range(3):
        k = int(np.argmax(c)); py, px = divmod(k, c.shape[1])
        dy = py if py <= c.shape[0] // 2 else py - c.shape[0]; dx = px if px <= c.shape[1] // 2 else px - c.shape[1]
        out.append((dy, dx)); c[max(0, py - 2):py + 3, max(0, px - 2):px + 3] = -1e9
    return out

def found_near(src, dst, ty, tx):
    """how well dst's tile (ty, tx) is explained by src MOVED: the best match (mean |difference| a pixel, each patch less its own mean —
    a thing moving while the stage floods white still matches) over the area's measured displacements (phase correlation at two
    reaches, so a whole layer sliding 70 px a frame is found) ± a few px, and within ±R. Content whose source lies OUTSIDE the
    frame entered (or left) through its edge: that is motion, returned as 0."""
    y0, x0 = ty * T, tx * T
    patch = dst[y0:y0 + T, x0:x0 + T]; patch = patch - patch.mean()
    h, w = src.shape
    best = 1e9
    cands = {(0, 0)}
    for half in (64, 128):
        for dy, dx in _shifts(src, dst, y0 + T // 2, x0 + T // 2, half):
            for ey in (-2, 0, 2):
                for ex in (-2, 0, 2): cands.add((dy + ey, dx + ex))
    for dy, dx in cands:
        sy, sx = y0 - dy, x0 - dx        # where the content came from in src
        if sy < 0 or sx < 0 or sy + T > h or sx + T > w:
            if abs(dy) + abs(dx) >= 4: return 0.0    # from beyond the frame's edge, moving: it slid in / out
            continue
        q = src[sy:sy + T, sx:sx + T]
        best = min(best, float(np.abs((q - q.mean()) - patch).mean()))
    # and the local search, for small independent moves
    ya, yb, xa, xb = max(0, y0 - R), min(h, y0 + T + R), max(0, x0 - R), min(w, x0 + T + R)
    win = np.lib.stride_tricks.sliding_window_view(src[ya:yb, xa:xb], (T, T))
    best = min(best, float(np.abs((win - win.mean(axis=(2, 3), keepdims=True)) - patch).mean(axis=(2, 3)).min()))
    return best

def scan(get, n):
    """get(i) → frame i (2-D array), n frames. Returns [(kind, t, tiles[(ty, tx)], magnitude)] — the change from frame t to t + 1.
    A tile counts only when its change is NOT motion: what it held is nowhere near in the next frame (a vanish), or what it holds
    was nowhere near in the frame before (a pop)."""
    d, back, prev2, prev = [], [], None, None
    for i in range(n):
        a = get(i)
        if prev is not None:
            d.append(tiles(np.abs(a - prev)))
        if prev2 is not None:
            back.append(tiles(np.abs(a - prev2)))
        prev2, prev = prev, a
    d = np.array(d); back = np.array(back)
    if len(d) < 3:
        return []
    ty0, ty1 = CAP[0] // T, -(-CAP[1] // T)
    d[:, ty0:ty1, :] = 0
    back[:, ty0:ty1, :] = 0
    out = []
    for t in range(1, len(d) - 1):
        nb = np.maximum(d[t - 1], d[t + 1])
        step = (d[t] >= STEP_MIN) & (d[t] >= RATIO * nb) & (d[t] - nb >= MARGIN)
        # a blip: t and t+1 both jump, t+2 is back where t was, and the frames around are quiet
        if t + 2 < len(d):
            q = np.maximum(d[t - 1], d[t + 2])
            blip = (d[t] >= STEP_MIN) & (d[t + 1] >= STEP_MIN) & (back[t] <= BLIP_BACK * d[t]) & (np.minimum(d[t], d[t + 1]) >= RATIO * q)
        else:
            blip = np.zeros_like(step)
        if not step.any() and not blip.any():
            continue
        A, Bf = get(t), get(t + 1)
        flat = lambda img, ty, tx: float(img[ty * T:(ty + 1) * T, tx * T:(tx + 1) * T].std()) <= FLAT
        vanish, pop, glitch = [], [], []
        for ty, tx in zip(*np.nonzero(step)):
            lim = min(EXPLAIN_MAX, EXPLAIN * float(d[t][ty, tx]))
            # VANISH: what the tile held is nowhere (moved) in the next frame, and bare stage is left behind
            if not flat(A, ty, tx) and flat(Bf, ty, tx) and found_near(Bf, A, ty, tx) > lim: vanish.append((int(ty), int(tx)))
            # POP: bare stage, and the next frame holds something that was nowhere (moved) in this one
            elif flat(A, ty, tx) and not flat(Bf, ty, tx) and found_near(A, Bf, ty, tx) > lim: pop.append((int(ty), int(tx)))
        for ty, tx in zip(*np.nonzero(blip)):
            lim = min(EXPLAIN_MAX, EXPLAIN * float(d[t][ty, tx]))
            if found_near(A, Bf, ty, tx) > lim and found_near(get(t + 2), Bf, ty, tx) > lim: glitch.append((int(ty), int(tx)))
        for kind, cells in (("VANISH", vanish), ("POP", pop), ("BLIP", glitch)):
            if cells:
                out.append((kind, t, cells, float(max(d[t][c] for c in cells))))
    return out

# ── canaries, from real frames ──
CY = 600 if not (CAP[0] < 680 and 600 < CAP[1]) else 400   # the canary's strip stays out of the masked caption band (V38: the karaoke band is low)
# the canaries' ground is the frame whose strip under the block's path (y 600–680, x 40–380) is QUIETEST of twelve across the film:
# the block is pasted opaque, so over a busy ground (Video 10's house at 1/3) every frame it moved uncovered real detail the frame
# before had not shown, and an honest slide read as POPs
def _quiet_base():
    best = None
    for k in range(1, 12):
        im = load(names[k * len(names) // 12])
        s = float(im[CY:CY + 80, 40:380].std())
        if best is None or s < best[0]: best = (s, k)
    return load(names[best[1] * len(names) // 12])
base = _quiet_base()
# the moving block is the most TEXTURED 160×80 region of five frames across the film: a block cut from a fixed spot (Video 9's
# [300:380, 100:260] of the 2/3 frame) was flat navy in Video 10, and a featureless block sliding cannot be tracked by shape, so
# the slide canary fired on the scan's blind spot, not on a flaw — the canary must carry what real content carries
def _texture_patch():
    best = None
    for k in range(1, 6):
        im = load(names[k * len(names) // 6])
        for y in range(80, im.shape[0] - 160, 40):
            for x in range(20, im.shape[1] - 180, 40):
                s = float(im[y:y + 80, x:x + 160].std())
                if best is None or s > best[0]: best = (s, k, y, x)
    s, k, y, x = best
    return load(names[k * len(names) // 6])[y:y + 80, x:x + 160]
patch = _texture_patch()
def with_block(a, x, alpha=1.0):
    b = a.copy(); y0 = CY
    region = b[y0:y0 + 80, x:x + 160]
    b[y0:y0 + 80, x:x + 160] = region * (1 - alpha) + np.clip(patch + 90, 0, 255) * alpha
    return b
seq_cut = [with_block(base, 200) if i < 10 else base for i in range(20)]
seq_fade = [with_block(base, 200, max(0.0, min(1.0, (16 - i) / 12))) for i in range(24)]
seq_slide = [with_block(base, 40 + 18 * i) for i in range(18)]
seq_blip = [with_block(base, 200) if i == 9 else base for i in range(20)]
c_cut, c_fade, c_slide, c_blip = (scan(lambda i, q=q: q[i], len(q)) for q in (seq_cut, seq_fade, seq_slide, seq_blip))
if not any(k == "VANISH" and t == 9 for k, t, _, _ in c_cut):   # d[t] is the change from frame t to t + 1
    sys.exit(f"canary: a block removed in one frame was not caught (VANISH) — {[(k, t) for k, t, _, _ in c_cut]}; refusing")
if c_fade:
    sys.exit(f"canary: a 12-frame fade was flagged — {[(k, t) for k, t, _, _ in c_fade]}; refusing")
if c_slide:
    sys.exit(f"canary: a slide (18 px a frame) was flagged — {[(k, t) for k, t, _, _ in c_slide]}; refusing")
if not any(k == "BLIP" for k, _, _, _ in c_blip):
    sys.exit("canary: a one-frame blip was not caught (BLIP); refusing")

# ── the film ──
cache = {}
def get(i):
    if i not in cache:
        if len(cache) > 6: cache.pop(next(iter(cache)))
        cache[i] = load(names[i])
    return cache[i]
found = scan(get, len(names))
def blobs(cells):
    cells, seen, out = set(cells), set(), []
    for c in cells:
        if c in seen: continue
        stack, blob = [c], []
        seen.add(c)
        while stack:
            y, x = stack.pop(); blob.append((y, x))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    nb = (y + dy, x + dx)
                    if nb in cells and nb not in seen: seen.add(nb); stack.append(nb)
        out.append(blob)
    return out
rows = []
for kind, t, cells, mag in found:
    for b in blobs(cells):
        if len(b) < MIN_BLOB: continue
        ys = [y for y, _ in b]; xs = [x for _, x in b]
        # in the film's own pixels (the kept frames are half size)
        box = (min(xs) * T * 2, min(ys) * T * 2, (max(xs) + 1) * T * 2, (max(ys) + 1) * T * 2)
        rows.append((kind, idx[0] + t, idx[0] + t + 1, len(b), box, mag))
print(f"pop scan: {len(names)} frames, tiles of {T * 2} px; canaries ok (a cut and a blip caught; a 12 f fade and a slide passed)")
# ★ REVIEWED MOTION (scratchpad/popscan_ok.json): a POP or BLIP the eye has judged to be designed motion too fast for the tile match
# (a slide at its peak, evenly spaced ticks sliding, the question's words flying in) is excused by frame range + box, with its
# reason — and LISTED, never silent. A VANISH can never be excused: a disappearance is fixed, not listed (STYLE §9.6).
import json
okp = os.path.join(os.path.dirname(os.path.abspath(__file__)), "popscan_ok.json")
OK = json.load(open(okp, encoding="utf8")) if os.path.exists(okp) else []
for e in OK:
    if e.get("kind") == "VANISH": sys.exit(f"popscan_ok.json excuses a VANISH ({e}) — a disappearance is never excused; refusing")
    if not e.get("why"): sys.exit(f"popscan_ok.json entry without a reason: {e}; refusing")
ov = lambda p, q: p[0] < q[2] and q[0] < p[2] and p[1] < q[3] and q[1] < p[3]
excused, bad, used = [], [], set()
for r in rows:
    kind, a0, b0, n, box, mag = r
    hit = next((i for i, e in enumerate(OK) if kind in e["kinds"] and e["frames"][0] <= a0 <= e["frames"][1] and ov(box, e["box"])), None)
    (excused if hit is not None else bad).append((r, hit))
    if hit is not None: used.add(hit)
for i, e in enumerate(OK):
    if i not in used: print(f"• stale excuse (matched nothing — remove it): {e['frames']} {e['why']}")
for (kind, a0, b0, n, box, mag), hit in excused:
    print(f"  excused  {kind:6} frame {a0} → {b0}  x {box[0]}–{box[2]}, y {box[1]}–{box[3]}  — {OK[hit]['why']}")
if not bad:
    print(f"CLEAN — nothing appears or disappears in one frame ({len(excused)} reviewed motion finding(s) listed above)")
    sys.exit(0)
for (kind, a0, b0, n, box, mag), _ in bad:
    print(f"{kind:6}  frame {a0} → {b0}  {n:3} tile(s)  x {box[0]}–{box[2]}, y {box[1]}–{box[3]}  (up to {mag:.0f} levels)")
print(f"{len(bad)} finding(s) — look at each frame pair (scratchpad/popview.py <frame>); refusing")
sys.exit(1)
