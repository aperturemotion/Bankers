# THE SFX TIMING SWEEP (user, 2026-10-06: "Also, do a SFX timing sweep").
#   python scratchpad/sfxsweep33.py <frames dir> [out/cues.json]
# For every cue (out/cues.json, dumped live by cuedump.mjs: `vis` = the frame its AUDIBLE onset lands on), measure on the
# rendered frames when the motion it scores really starts — or, for a SUB under an arrival, when it lands — and report the
# offset in frames. Motion = mean |frame − previous| over the construction band (y 380–1580: the caption band and the
# sponsor line are excluded). It proves itself first on two synthetic canaries: a step at a known frame must be found to
# ±1, and a flat run must report NO MOTION.
import sys, os, json, re
import numpy as np
from PIL import Image

d = sys.argv[1]
cues = json.load(open(sys.argv[2] if len(sys.argv) > 2 else "out/cues.json"))
names = {int(re.findall(r"\d+", f)[0]): f for f in os.listdir(d) if f.endswith(".jpeg")}
N = max(names) + 1

def onset(E, v):
    lo, hi = max(1, v - 24), max(2, v - 8)
    b = float(np.median(E[lo:hi])) if hi > lo else 0.0
    win = E[max(0, v - 6): v + 25]
    pk = float(win.max()) if len(win) else 0.0
    if pk < b + 0.35:
        return None, b, pk
    th = b + 0.25 * (pk - b)
    for f in range(max(1, v - 12), min(len(E), v + 25)):
        if E[f] > th:
            return f, b, pk
    return None, b, pk

def landing(E, v):
    a = max(1, v - 30)
    seg = E[a: v + 6]
    if not len(seg):
        return None, 0, 0
    pf = a + int(seg.argmax()); pk = float(E[pf])
    b2 = float(np.median(E[v + 10: v + 30])) if v + 30 < len(E) else 0.0
    if pk < b2 + 0.35:
        return None, b2, pk
    th = b2 + 0.25 * (pk - b2)
    for f in range(pf, min(len(E), v + 30)):
        if E[f] < th:
            return f, b2, pk
    return None, b2, pk

# ── canaries ──
E0 = np.full(200, 0.1); E0[100:130] = 3.0
f0, _, _ = onset(E0, 100)
E1 = np.full(200, 0.1)
f1, _, _ = onset(E1, 100)
ok = f0 is not None and abs(f0 - 100) <= 1 and f1 is None
print(f"canaries: step found at {f0} (must be 100±1) · flat run → {f1} (must be None) → {'OK' if ok else 'REFUSED'}")
if not ok:
    sys.exit(1)

need = set()
for c in cues:
    for f in range(max(0, c["vis"] - 32), min(N, c["vis"] + 34)):
        need.add(f)
E = np.zeros(N)
prev = None
cache = {}
def load(f):
    if f not in cache:
        im = Image.open(os.path.join(d, names[f])).convert("L").resize((270, 480))
        cache[f] = np.asarray(im, dtype=np.float32)[95:395]
    return cache[f]
for f in sorted(need):
    if f in names and f - 1 in names:
        E[f] = float(np.abs(load(f) - load(f - 1)).mean())
missing = [f for f in need if f not in names]
if missing:
    print(f"REFUSED: {len(missing)} frames missing from {d} (e.g. {sorted(missing)[:5]})")
    sys.exit(1)

rows, flagged = [], 0
for c in sorted(cues, key=lambda c: c["vis"]):
    kind = "land" if c["s"] == "sub" else "start"
    f, b, pk = (landing if kind == "land" else onset)(E, c["vis"])
    if f is None:
        verdict, off = "NO MOTION", None
    else:
        off = f - c["vis"]
        verdict = "ok" if abs(off) <= 3 else ("SOUND EARLY" if off > 0 else "SOUND LATE")
    if verdict != "ok":
        flagged += 1
    rows.append(f"  {c['vis']:5d}  {c['s']:<11} {kind:<5} motion {'' if f is None else f:>5}  offset {'' if off is None else f'{off:+d}':>4}  {verdict}")
print(f"{len(cues)} cues · {flagged} flagged (|offset| > 3 frames, or no motion within the window)")
print("\n".join(rows))
