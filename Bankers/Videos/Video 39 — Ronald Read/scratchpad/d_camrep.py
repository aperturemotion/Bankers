# builder D: per-station image speed (median per-point px/f of a cloud round the aim, like fastmoves.py) and jerk (camjerk's flow change)
#   python3 scratchpad/d_camrep.py out/cam_s.json [win json from d_win.cjs]
import json, sys, numpy as np
_argv = sys.argv[:]; sys.argv = sys.argv[:2]
exec(open("scratchpad/camflow.py").read().split("def flow")[0])
sys.argv = _argv
WIN = json.load(open(sys.argv[2]))
C = d["cam"]; N = len(C); M = np.zeros(N); F = np.zeros((N, 2))
for f in range(N - 1):
    k0, k1 = C[f], C[f + 1]
    dist = np.linalg.norm(np.array(k0["pos"]) - np.array(k0["target"]))
    pts = np.array(k0["target"]) + cloud * dist * 0.35
    a, za = proj(k0, pts); b, zb = proj(k1, pts); ok = (za > 0.05) & (zb > 0.05)
    if ok.sum() >= 5: M[f] = np.median(np.linalg.norm(b[ok] - a[ok], axis=1)); F[f] = np.median(b[ok] - a[ok], axis=0)
for c in cuts: M[max(0, c - 1):c + 1] = 0; F[max(0, c - 1):c + 1] = 0
J = np.linalg.norm(np.diff(F, axis=0), axis=1)
for c in cuts: J[max(0, c - 2):c + 3] = 0
for sid in sys.argv[3:] if len(sys.argv) > 3 else ["lehman", "will", "pavilion"]:
    s, e = WIN[sid]["start"], WIN[sid]["end"]
    m = M[s:e]; j = J[s:e]
    pk = s + int(np.argmax(m))
    print(f"{sid:9s} {s}-{e}: peak {m.max():5.1f} px/f @ {pk}  median {np.median(m):4.1f}  p90 {np.percentile(m,90):4.1f}  jerk max {j.max():4.1f} @ {s+int(np.argmax(j))}")
import os
if os.environ.get("PROF"):
    a, b = map(int, os.environ["PROF"].split("-"))
    print(" ".join(f"{f}:{M[f]:.0f}" for f in range(a, b, 3)))
