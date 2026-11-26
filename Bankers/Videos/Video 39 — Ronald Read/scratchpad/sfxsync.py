# -*- coding: utf-8 -*-
# THE SFX SYNC SWEEP, MEASURED LOCALLY (user, 2026-10-09: "sfx need to be perfectly synced").
#   python scratchpad/sfxsync.py <frames dir> [out/cues.json]
# sfxsweep33.py times each cue against the WHOLE construction band's motion. Under a moving camera that band is already
# busy, so it clamped to its window's edge ("SOUND LATE −12") or saw nothing ("NO MOTION") on half the cues. This sweep
# finds each cue's OWN motion: the frame (270 × 480, band y 95–395) is cut into 15 × 15-px tiles; the tiles whose motion
# RISES most around the cue (peak in [v−6, v+25] over their own baseline in [v−24, v−8]) are the cue's region, and the
# onset is timed on their summed motion (the first frame over 25% of the rise). A SUB is judged on its LANDING (the
# region's motion falling back under 25%). A cue whose region shows no rise (< 0.6 grey levels, or < 35% over the tiles' own
# baseline: a steady pan is not a rise) is reported, not judged.
# Proves itself first: a synthetic block that starts moving at f100 under a camera already panning must be found at
# 100 ± 1, and a static scene under the same pan must report no rise.
import json, os, re, sys
import numpy as np
from PIL import Image
sys.stdout.reconfigure(encoding="utf-8")

T = 15
def tiles(E3):            # E3: frames × H × W abs-diff → frames × tiles
    n, H, W = E3.shape
    h, w = H // T, W // T
    return E3[:, : h * T, : w * T].reshape(n, h, T, w, T).mean(axis=(2, 4)).reshape(n, h * w)

def judge(Et, v, kind):
    # Et: tile motion for frames v-32 .. v+33 (index i ↔ frame v-32+i)
    o = 32
    base = np.median(Et[o - 24: o - 8], axis=0)
    peak = Et[o - 6: o + 25].max(axis=0)
    rise = peak - base
    rel = rise / (base + 2.0)                 # a rise against the tile's own baseline (a steady pan is not a rise)
    k = max(3, int(0.06 * Et.shape[1]))
    sel = np.argsort(-rel)[:k]
    if rise[sel].mean() < 0.6 or rel[sel].mean() < 0.35:
        return None, float(rise[sel].mean())
    S = Et[:, sel].sum(axis=1)
    b, pk = float(np.median(S[o - 24: o - 8])), float(S[o - 6: o + 25].max())
    th = b + 0.25 * (pk - b)
    if kind == "start":
        for i in range(o - 12, o + 25):
            if S[i] > th: return i - o, float(rise[sel].mean())
        return None, float(rise[sel].mean())
    pf = o - 30 + int(S[o - 30: o + 6].argmax())
    for i in range(pf, min(len(S), o + 30)):
        if S[i] < th: return i - o, float(rise[sel].mean())
    return None, float(rise[sel].mean())

# ── canaries: a pan already under way, a block that starts at f100 ─────────────────────────────
rng = np.random.default_rng(1)
tex = rng.uniform(0, 255, (300, 600)).astype(np.float32)
def synth(block):
    fr = []
    for f in range(60, 140):
        img = tex[:, int(f * 1.5) % 300: int(f * 1.5) % 300 + 270].copy()      # the camera pans 1.5 px/frame
        if block and f >= 100: img[120:180, 100:160] = 255 * ((f - 100) % 2)    # a block flickers on from f100
        fr.append(img)
    fr = np.array(fr); return np.abs(np.diff(fr, axis=0, prepend=fr[:1]))
E = tiles(synth(True)); idx0 = 60
def win(Ef, v): return Ef[v - idx0 - 32: v - idx0 + 34]
o1, _ = judge(win(E, 100), 100, "start")
E2 = tiles(synth(False)); o2, r2 = judge(win(E2, 100), 100, "start")
ok = o1 is not None and abs(o1) <= 1 and o2 is None
print(f"canaries: block found at offset {o1} (must be 0±1) · static under the pan → {o2} (must be None) → {'OK' if ok else 'REFUSED'}")
if not ok: sys.exit(1)

d = sys.argv[1]
cues = json.load(open(sys.argv[2] if len(sys.argv) > 2 else "out/cues.json", encoding="utf8"))
names = {int(re.findall(r"\d+", f)[0]): f for f in os.listdir(d) if f.endswith(".jpeg")}
cache = {}
def load(f):
    if f not in cache:
        cache[f] = np.asarray(Image.open(os.path.join(d, names[f])).convert("L").resize((270, 480)), dtype=np.float32)[95:395]
    return cache[f]
rows, flagged = [], 0
for c in sorted(cues, key=lambda c: c["vis"]):
    v = int(c["vis"]); fs = range(v - 32, v + 34)
    if any(f - 1 not in names or f not in names for f in fs if f >= 1):
        rows.append(f"  {v:5d}  {c['s']:<11} (frames missing)"); continue
    E3 = np.array([np.abs(load(f) - load(f - 1)) if f >= 1 else np.zeros_like(load(0)) for f in fs])
    kind = "land" if c["s"] == "sub" else "start"
    off, r = judge(tiles(E3), v, kind)
    if off is None:
        verdict = "no local rise (not judged)"
    else:
        verdict = "ok" if abs(off) <= 3 else ("SOUND EARLY" if off > 0 else "SOUND LATE")
        if verdict != "ok": flagged += 1
    rows.append(f"  {v:5d}  {c['s']:<11} {kind:<5} offset {'' if off is None else f'{off:+d}':>4}  rise {r:5.1f}  {verdict}")
print(f"{len(cues)} cues · {flagged} flagged (|offset| > 3 f)")
print("\n".join(rows))
