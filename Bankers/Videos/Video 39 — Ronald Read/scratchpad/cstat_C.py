# per-window image speed (px/f of a subject point cloud, incl. zoom spread) from out/cam_s.json
import json, sys, numpy as np
exec(open("scratchpad/camflow.py").read().split("P0 = ")[0].replace("src = sys.argv[1]", "src = sys.argv[1]"))
def speed(C):
    out = np.zeros(len(C) - 1)
    for f in range(len(C) - 1):
        k0, k1 = C[f], C[f + 1]
        dist = np.linalg.norm(np.array(k0["pos"]) - np.array(k0["target"]))
        pts = np.array(k0["target"]) + cloud * dist * 0.35
        a, za = proj(k0, pts); b, zb = proj(k1, pts)
        ok = (za > 0.05) & (zb > 0.05)
        if ok.sum() < 5: continue
        out[f] = np.median(np.linalg.norm(b[ok] - a[ok], axis=1))
    return out
S = speed(d["cam"])
wins = [("diner", 814, 916), ("shares", 916, 1108), ("vault", 1108, 1334)] if len(sys.argv) < 3 else [tuple([w.split(":")[0]] + list(map(int, w.split(":")[1].split("-")))) for w in sys.argv[2:]]
for n, a, b in wins:
    s = S[a + 1:b - 1]  # skip the cut frames
    cutset = set(cuts)
    s = np.array([S[f] for f in range(a, b - 1) if f not in cutset and f + 1 not in cutset and (f - 1) not in cutset])
    print(f"{n} {a}-{b}: median {np.median(s):.2f} p90 {np.percentile(s,90):.2f} peak {s.max():.2f} px/f (at {a + int(np.argmax([S[f] if f not in cutset and f+1 not in cutset and f-1 not in cutset else 0 for f in range(a,b-1)]))})")
