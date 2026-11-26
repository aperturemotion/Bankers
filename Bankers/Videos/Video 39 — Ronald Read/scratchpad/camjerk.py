# V38 rev 2 — the GLITCH test (what Timur saw at 22 s / 26 s in Studio v3): the image flow (camflow.py) changing abruptly between two
# frames — a 1–2 frame flip, not a turn. Reports every frame where |flow(f+1) − flow(f)| > J px/f², outside the stretches kept as
# authored (flights, pushes into cuts, the cut frames themselves).
import json, sys, numpy as np
src_json = sys.argv[1]; J = float(sys.argv[2]) if len(sys.argv) > 2 else 12
sys.argv = ["camflow", src_json, "6"]
exec(open("scratchpad/camflow.py").read().split("for name in")[0])
for name in [n for n in ("raw", "cam") if n in d]:
    F = flow(d[name]); A = np.linalg.norm(np.diff(F, axis=0), axis=1)
    mask = anch[:-2].copy()
    for c in cuts:
        mask[max(0, c - 2):c + 3] = True
    A[mask] = 0
    hits = np.where(A > J)[0]
    runs = []
    for f in hits:
        if runs and f - runs[-1][1] <= 3: runs[-1][1] = f
        else: runs.append([f, f])
    print(f"{name}: {len(runs)} abrupt changes of image motion (> {J} px/f²) — max {A.max():.1f}")
    for a, b in runs: print(f"   {a}-{b} ({a/30:.1f}s) {A[a:b+1].max():.0f} px/f²")
