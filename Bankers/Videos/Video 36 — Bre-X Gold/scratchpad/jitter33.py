# -*- coding: utf-8 -*-
# V33 — the FULL-SIZE motion sweep (user, 2026-10-05: "most animations are buggy and glitch around a lot").
# Reads a full-size renderFrames sequence (scratchpad/frames.mjs … 1 out/full, single tab) and reports, per scene:
#   · JITTER — sub-pixel snapping / zig-zag: each 120-px tile is tracked frame to frame by PHASE CORRELATION (sub-pixel,
#     Hann-windowed; a thresholded centroid false-flagged 17 of 18 targets on 023). Its cumulative path is compared with a
#     local smooth fit (Savitzky–Golay, 7 frames, cubic): an eased move IS a smooth curve and leaves no residual; a
#     pixel-aligned layer (a CSS filter, a flat 2-D layer under a drifting camera) leaves 0.3–1 px steps.
#   · POPS — something appearing / vanishing / jumping in one frame: a tile's frame-to-frame change spiking above its
#     own neighbourhood (the caption band and the persistent line are masked: words swap by design).
# ★ It proves itself first: canary A (a smooth sine drift) must pass, B (±0.45 px alternating) and C (one 1-px snap)
#   must be flagged, D (a smooth ease-in-out of 300 px over 20 frames) must pass. A judge that cannot tell them apart refuses.
#   python scratchpad/jitter33.py [dir=out/full] [from] [to]
import os, sys, json, math
import numpy as np
from PIL import Image

TILE, STEP = 128, 96
Y0, Y1 = 440, 1430          # the construction layer (captions above, the persistent line below)
RES_PEAK, RES_RMS = 0.42, 0.16
CONF_MIN = 0.18             # correlation peak (normalised cross-power) below this = the tile's content changed: no reading

def shift(a, b):
    h, w = a.shape
    win = np.outer(np.hanning(h), np.hanning(w))
    A = np.fft.fft2((a - a.mean()) * win); B = np.fft.fft2((b - b.mean()) * win)
    R = A * np.conj(B); R /= np.abs(R) + 1e-9
    r = np.fft.ifft2(R).real
    py, px = np.unravel_index(np.argmax(r), r.shape)
    conf = float(r[py, px])
    def sub(c, n, axis):
        m1 = r[(py - 1) % h, px] if axis == 0 else r[py, (px - 1) % w]
        p1 = r[(py + 1) % h, px] if axis == 0 else r[py, (px + 1) % w]
        d = m1 - 2 * r[py, px] + p1
        o = 0.5 * (m1 - p1) / d if d != 0 else 0.0
        c = c + o
        return c - n if c > n / 2 else c
    return -sub(px, w, 1), -sub(py, h, 0), conf

def sg_residual(p):
    """residual of a path from a local cubic fit over 7 samples (Savitzky–Golay); end samples get NaN"""
    p = np.asarray(p, float); n = len(p); out = np.full(n, np.nan)
    t = np.arange(-3, 4)
    V = np.vander(t, 4); C = np.linalg.pinv(V)[-1]      # coefficient for the constant term → the fit at t=0
    for i in range(3, n - 3):
        out[i] = p[i] - C @ p[i - 3:i + 4]
    return out

def judge_path(steps):
    """steps: per-frame (dx, dy) with None where unreadable → list of (frame index, residual px) over the limit"""
    hits = []
    seg = []
    def flush():
        if len(seg) < 8: return
        idx = [s[0] for s in seg]
        px = np.cumsum([0.0] + [s[1] for s in seg]); py = np.cumsum([0.0] + [s[2] for s in seg])
        ex, ey = sg_residual(px), sg_residual(py)
        e = np.hypot(ex, ey)
        # ★ only where the tile is HELD or drifting (≤ 3 px/frame): a fast animated move is judged by the pop and
        #   transition reviews; here we want the glitch that shows while things should be calm
        sp = np.full(len(e), np.inf)
        for k in range(1, len(px) - 1): sp[k] = math.hypot(px[k + 1] - px[k - 1], py[k + 1] - py[k - 1]) / 2
        calm = sp <= 3.0
        for k in range(len(e)):
            if calm[k] and not np.isnan(e[k]) and e[k] > RES_PEAK: hits.append((idx[min(k, len(idx) - 1)], float(e[k])))
        ok = np.where(calm & ~np.isnan(e), e, np.nan)
        for k in range(0, len(ok) - 10):
            w = ok[k:k + 10]
            if np.isnan(w).any(): continue
            rms = float(np.sqrt((w ** 2).mean()))
            if rms > RES_RMS: hits.append((idx[min(k + 5, len(idx) - 1)], rms))
    for i, s in enumerate(steps):
        if s is None or abs(s[0]) > 30 or abs(s[1]) > 30:
            flush(); seg = []
        else:
            seg.append((i, s[0], s[1]))
    flush()
    return hits

# ── the canaries ──
def canaries():
    rng = np.random.default_rng(3)
    base = rng.random((TILE + 40, TILE + 40)) * 255
    from scipy.ndimage import shift as nshift, gaussian_filter
    base = gaussian_filter(base, 2)
    def frames(path):
        return [nshift(base, (path[i][1], path[i][0]), order=3, mode="nearest")[20:20 + TILE, 20:20 + TILE] for i in range(len(path))]
    def steps_of(fs):
        out = []
        for a, b in zip(fs, fs[1:]):
            dx, dy, c = shift(a, b); out.append((dx, dy) if c >= CONF_MIN else None)
        return out
    n = 40
    A = [(3 * math.sin(i / 9), 2 * math.sin(i / 13)) for i in range(n)]
    B = [(3 * math.sin(i / 9) + (0.45 if i % 2 else -0.45), 0) for i in range(n)]
    C = [(0.08 * i + (1.0 if i == 20 else 0), 0) for i in range(n)]
    ease = lambda t: 0.5 - 0.5 * math.cos(math.pi * min(1, max(0, t)))
    D = [(18 * ease((i - 10) / 20), 0) for i in range(n)]
    res = {k: len(judge_path(steps_of(frames(p)))) for k, p in (("A", A), ("B", B), ("C", C), ("D", D))}
    ok = res["A"] == 0 and res["B"] > 0 and res["C"] > 0 and res["D"] == 0
    print(f"canaries: A smooth {res['A']} hits · B zig-zag {res['B']} · C one snap {res['C']} · D ease {res['D']}  → {'OK' if ok else 'REFUSED'}")
    if not ok: sys.exit(2)

if __name__ == "__main__":
    canaries()
    d = sys.argv[1] if len(sys.argv) > 1 else "out/full"
    files = sorted(f for f in os.listdir(d) if f.endswith(".jpeg"))
    num = lambda f: int(f.split("-")[1].split(".")[0])
    lo = int(sys.argv[2]) if len(sys.argv) > 2 else num(files[0])
    hi = int(sys.argv[3]) if len(sys.argv) > 3 else num(files[-1])
    files = [f for f in files if lo <= num(f) <= hi]
    here = os.path.dirname(os.path.abspath(__file__))
    B = json.load(open(os.path.join(here, "beats.json"), encoding="utf8"))
    beats = [(x["id"], x["enter"]) for x in B["beats"]]
    def beat_of(f):
        n = beats[0][0]
        for i, a in beats:
            if f >= a: n = i
        return n
    tiles = [(x, y) for y in range(Y0, Y1 - TILE + 1, STEP) for x in range(0, 1080 - TILE + 1, STEP)]
    prev = None; steps = {t: [] for t in tiles}; diffs = {t: [] for t in tiles}; fr = []
    for fn in files:
        im = np.asarray(Image.open(os.path.join(d, fn)).convert("L"), dtype=np.float32)
        if prev is not None:
            for (x, y) in tiles:
                a = prev[y:y + TILE, x:x + TILE]; b = im[y:y + TILE, x:x + TILE]
                diffs[(x, y)].append(float(np.abs(a - b).mean()))
                if a.std() < 4 or b.std() < 4: steps[(x, y)].append(None); continue
                dx, dy, c = shift(a, b)
                steps[(x, y)].append((dx, dy) if c >= CONF_MIN else None)
            fr.append(num(fn))
        prev = im
    # JITTER
    jit = []
    for t in tiles:
        for k, v in judge_path(steps[t]):
            jit.append((fr[k], t, v))
    # POPS: a tile's change > 5× its neighbourhood median and > 7 levels, in ONE frame (not a ramp)
    pops = []
    for t in tiles:
        ds = np.array(diffs[t])
        for i in range(len(ds)):
            nb = np.concatenate([ds[max(0, i - 6):max(0, i - 1)], ds[i + 2:i + 7]])
            if len(nb) < 4: continue
            m = float(np.median(nb))
            if ds[i] > 7 and ds[i] > 5 * max(m, 0.4) and (i == 0 or ds[i - 1] < 0.5 * ds[i]) and (i + 1 >= len(ds) or ds[i + 1] < 0.5 * ds[i]):
                pops.append((fr[i], t, ds[i], m))
    # fold by frame into clusters
    def fold(rows, key):
        rows = sorted(rows); out = []
        for r in rows:
            if out and r[0] - out[-1]["e"] <= 3:
                out[-1]["e"] = r[0]; out[-1]["n"] += 1; out[-1]["v"] = max(out[-1]["v"], r[2]); out[-1]["tiles"].add(r[1])
            else:
                out.append({"s": r[0], "e": r[0], "n": 1, "v": r[2], "tiles": {r[1]}})
        return out
    J = fold(jit, 0); P = fold(pops, 0)
    print(f"\nframes {lo}-{hi}: {len(fr)} steps · {len(tiles)} tiles")
    print(f"\nJITTER clusters ({len(J)}): residual from a smooth path > {RES_PEAK}px, or 10-frame rms > {RES_RMS}px")
    for c in J:
        xs = sorted(c["tiles"]); xy = f"x{min(t[0] for t in xs)}-{max(t[0] for t in xs) + TILE} y{min(t[1] for t in xs)}-{max(t[1] for t in xs) + TILE}"
        print(f"  {c['s']:5d}-{c['e']:5d} {beat_of(c['s']):<8} tiles {len(xs):2d}  worst {c['v']:.2f}px  {xy}")
    print(f"\nPOP clusters ({len(P)}): a one-frame change > 5× its neighbourhood")
    for c in P:
        xs = sorted(c["tiles"]); xy = f"x{min(t[0] for t in xs)}-{max(t[0] for t in xs) + TILE} y{min(t[1] for t in xs)}-{max(t[1] for t in xs) + TILE}"
        print(f"  {c['s']:5d}-{c['e']:5d} {beat_of(c['s']):<8} tiles {len(xs):2d}  peak {c['v']:.1f}  {xy}")
