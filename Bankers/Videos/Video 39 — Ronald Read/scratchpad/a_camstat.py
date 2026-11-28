# builder A: per-window image speed (median per-point px/f of the cloud at the aim, as fastmoves.py) + jerk max
import json, sys, numpy as np
src = sys.argv[1]
sys.argv = ["camflow", src, "6"]
exec(open("scratchpad/camflow.py").read().split("def flow")[0])
C = d["cam"]; N = len(C); M = np.zeros(N)
for f in range(N - 1):
    k0, k1 = C[f], C[f + 1]
    dist = np.linalg.norm(np.array(k0["pos"]) - np.array(k0["target"]))
    pts = np.array(k0["target"]) + cloud * dist * 0.35
    a, za = proj(k0, pts); b, zb = proj(k1, pts); ok = (za > 0.05) & (zb > 0.05)
    if ok.sum() >= 5: M[f] = np.median(np.linalg.norm(b[ok] - a[ok], axis=1))
for c in cuts: M[max(0, c - 1):c + 1] = 0
WINS = {"hook": (0, 217), "jcp": (472, 594), "line": (1984, 2201), "line<outro": (1984, 2137)}
for k, (a, b) in WINS.items():
    s = M[a:b]
    print(f"{k:5s} {a}-{b}: peak {s.max():5.1f} px/f @ {a+int(s.argmax())}  median {np.median(s):5.2f}  p90 {np.percentile(s,90):5.1f}")
if len(sys.argv) > 2 or True:
    import os
    for k, (a, b) in WINS.items():
        print(k, " ".join(f"{f}:{M[f]:.1f}" for f in range(a, b, 6)))
