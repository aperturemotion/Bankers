# builder B: per-window camera image speed (median-per-point px/f of a cloud at the aim, as fastmoves.py) and jerk (camjerk's flow diff).
#   python3 scratchpad/b_camwin.py out/cam_s.json name:a:b ...
import json, sys, numpy as np
src = sys.argv[1]; wins = sys.argv[2:]
sys.argv = ["camflow", src, "6"]
exec(open("scratchpad/camflow.py").read().split("def reversals")[0])
C = d["cam"]; N = len(C); M = np.zeros(N)
for f in range(N - 1):
    k0, k1 = C[f], C[f + 1]
    dist = np.linalg.norm(np.array(k0["pos"]) - np.array(k0["target"]))
    pts = np.array(k0["target"]) + cloud * dist * 0.35
    a, za = proj(k0, pts); b, zb = proj(k1, pts); ok = (za > 0.05) & (zb > 0.05)
    if ok.sum() >= 5: M[f] = np.median(np.linalg.norm(b[ok] - a[ok], axis=1))
for c in cuts: M[max(0, c - 1):c + 1] = 0
F = flow(C); J = np.r_[np.linalg.norm(np.diff(F, axis=0), axis=1), 0, 0]
for c in cuts: J[max(0, c - 2):c + 3] = 0
for w in wins:
    n, a, b = w.split(":"); a, b = int(a), int(b)
    m = M[a:b]; j = J[a:b]
    print(f"{n:7s} {a}-{b}: peak {m.max():5.1f} px/f @ {a+int(m.argmax())}  median {np.median(m):4.1f}  p90 {np.percentile(m,90):4.1f}  jerk max {j.max():4.1f} @ {a+int(j.argmax())}")
