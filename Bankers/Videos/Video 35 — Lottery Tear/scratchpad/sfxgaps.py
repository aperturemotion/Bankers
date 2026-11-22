# SFX COVERAGE — which on-screen motion has no sound under it (user, 2026-10-09: "there are lots of scenes that lack the
# smooth sfx, ensure that they are added to the right places").
#   python scratchpad/sfxgaps.py [motion.csv=out/motion.csv] [cues=out/cues.json]
#
# Reads the per-frame motion score of the full-size render (motion.py's input, frames.mjs output) and the LIVE cue list
# (cuedump.mjs). A frame is "moving" when its 5-frame median motion is over MOV; a cue covers its AUDIBLE span (its visual
# start `vis` to its visual end `to`, or to its file's end less its fade). Runs of uncovered motion ≥ MIN frames are listed
# with their beat. The caption band was masked by motion.py, so a word chip swapping is not motion.
# Canaries first: a synthetic burst under no cue must be listed, the same burst under a cue must not.
import sys, csv, json, os
import numpy as np

MOV, MIN = float(os.environ.get("MOV", 2.0)), int(os.environ.get("MIN", 10))
mpath = sys.argv[1] if len(sys.argv) > 1 else "out/motion.csv"
cpath = sys.argv[2] if len(sys.argv) > 2 else "out/cues.json"
SWELL = {"airwoosh": 6, "whooshsoft": 3, "whooshlong": 3, "swoosh": 3, "lowwoosh": 4}
TRANSIENT = {"sub", "ping", "pingshort", "coin", "click", "pop", "thud", "tick", "ding", "flick", "gavel"}

def covered(cues, n):
    cov = np.zeros(n, bool)
    for c in cues:
        # a whoosh swells: it is audible from its −20 dB point, a few frames before `vis` (its 50% point; measured 2026-10-09)
        a = int(c.get("vis", c["at"])) - SWELL.get(c["s"], 0)
        if c["s"] in TRANSIENT:
            b = a + 10
        else:
            b = int(c.get("to", c["at"] + c.get("dur", 30) - c.get("fade", 0)))
        cov[max(0, a):max(0, min(n, b))] = True
    return cov

def gaps(d, cues):
    n = len(d)
    sm = np.array([np.median(d[max(0, i - 2):i + 3]) for i in range(n)])
    mv = sm > MOV
    cov = covered(cues, n)
    out, i = [], 0
    while i < n:
        if mv[i] and not cov[i]:
            j = i
            while j < n and mv[j] and not cov[j]: j += 1
            if j - i >= MIN: out.append((i, j, float(sm[i:j].mean())))
            i = j
        else: i += 1
    return out

# canaries
syn = np.full(400, 0.3); syn[100:140] = 6.0
assert gaps(syn, []) == [(100, 140, 6.0)] or len(gaps(syn, [])) == 1, "canary: an uncovered burst was not listed"
assert gaps(syn, [{"s": "swoosh", "at": 95, "vis": 98, "to": 142, "dur": 50}]) == [], "canary: a covered burst was listed"

d = np.array([float(r["diff"]) for r in csv.DictReader(open(mpath))])
cues = json.load(open(cpath, encoding="utf8"))
bj = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "beats.json"), encoding="utf8"))
beats = sorted([(x["enter"], x["id"]) for x in bj["beats"]])
def beat(f):
    name = "?"
    for e, i in beats:
        if f >= e: name = i
    return name
G = gaps(d, cues)
print(f"canaries OK · {len(cues)} cues · {len(G)} uncovered motion run(s) ≥ {MIN} f over {MOV}")
for a, b, m in G:
    print(f"  {a:5d}-{b:5d}  ({b - a:3d} f, {a / 30:6.2f}s)  mean {m:5.2f}  {beat(a)}")
