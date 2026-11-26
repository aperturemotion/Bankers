# -*- coding: utf-8 -*-
# V33 (2026-10-06) — compare FRESH stills (out/seq, seqcheck33.mjs) with the SEQUENTIAL render (out/full4) of the same
# frames. A frame is flagged when any 48-px tile differs by more than LIM in mean grey level: a depth-sort flip, a stale
# transform or a missing layer differs by tens of levels over whole tiles, while JPEG noise and sub-pixel rasterising stay
# a few levels. Crops of every flagged frame (sequential | fresh) go to out/sheets/seq_<frame>.png.
# ★ It proves itself: canary A (a frame against itself, re-encoded) must be clean; canary B (the same frame with a
#   96-px patch forced to the opposite extreme) must be flagged. A judge that cannot tell them apart refuses.
#   python scratchpad/seqcmp33.py [seq=out/seq] [full=out/full4]
import os, sys, io
import numpy as np
from PIL import Image

T, LIM = 48, 12.0
def tiles(a, b):
    d = np.abs(a.astype(np.float32) - b.astype(np.float32))
    h, w = d.shape
    d = d[: h - h % T, : w - w % T].reshape(h // T, T, w // T, T).mean(axis=(1, 3))
    return d

def grey(p): return np.asarray(Image.open(p).convert("L"))

def canaries(sample):
    im = Image.open(sample).convert("RGB")
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=93); buf.seek(0)
    A = tiles(grey(sample), np.asarray(Image.open(buf).convert("L")))
    g = grey(sample).copy()
    y, x = 900, 500
    # a patch forced to the OPPOSITE extreme (a layer missing or drawn on top): independent of the sample's content —
    # moving a patch of a flat region proved nothing on its first run (max 10.0, refused)
    g2 = g.copy(); patch = g2[y:y + 96, x:x + 96]
    g2[y:y + 96, x:x + 96] = 255 if patch.mean() < 128 else 0
    B = tiles(g, g2)
    ok = A.max() <= LIM and B.max() > LIM
    print(f"canaries: A re-encoded max {A.max():.1f} (must be ≤ {LIM}) · B moved patch max {B.max():.1f} (must be > {LIM}) → {'OK' if ok else 'REFUSED'}")
    if not ok: sys.exit(2)

if __name__ == "__main__":
    sd = sys.argv[1] if len(sys.argv) > 1 else "out/seq"
    fd = sys.argv[2] if len(sys.argv) > 2 else "out/full4"
    files = sorted(f for f in os.listdir(sd) if f.endswith(".jpeg"))
    if not files: print("✗ REFUSED — no fresh stills"); sys.exit(2)
    canaries(os.path.join(fd, files[len(files) // 2]))
    os.makedirs("out/sheets", exist_ok=True)
    bad = []
    for fn in files:
        p = os.path.join(fd, fn)
        if not os.path.exists(p): print(f"✗ REFUSED — {fn} missing from {fd}"); sys.exit(2)
        d = tiles(grey(os.path.join(sd, fn)), grey(p))
        m = d.max()
        if m > LIM:
            ty, tx = np.unravel_index(d.argmax(), d.shape)
            n = int((d > LIM).sum())
            bad.append((fn, m, n, tx * T, ty * T))
            cx, cy = tx * T + T // 2, ty * T + T // 2
            box = (max(0, cx - 200), max(0, cy - 200), min(1080, cx + 200), min(1920, cy + 200))
            a, b = Image.open(p).crop(box), Image.open(os.path.join(sd, fn)).crop(box)
            s = Image.new("RGB", (a.width * 2 + 10, a.height), (255, 0, 255)); s.paste(a, (0, 0)); s.paste(b, (a.width + 10, 0))
            s.save(f"out/sheets/seq_{fn.split('-')[1].split('.')[0]}.png")
    print(f"{len(files)} frames compared, {len(bad)} differ (tile mean > {LIM} grey levels)")
    for fn, m, n, x, y in bad: print(f"  {fn}: worst tile {m:.1f} at x{x} y{y}, {n} tile(s) over")
