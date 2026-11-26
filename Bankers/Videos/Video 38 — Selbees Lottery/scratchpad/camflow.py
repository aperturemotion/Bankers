# V38 rev 2 — what the VIEWER sees: the image flow (px/frame at 1080×1920) of a cloud of world points around the subject, frame to
# frame, through the film's own camera maths (lookAt, vertical fov, roll). A BACK-AND-FORTH = the flow swings ≥ T px/f one way and
# then ≥ T px/f back within W frames, outside the stretches kept as authored (flights, pushes into cuts).
import json, sys, numpy as np
src = sys.argv[1]; T = float(sys.argv[2]) if len(sys.argv) > 2 else 6; W = 40
d = json.load(open(src)); cuts = sorted({s["a"] for s in d["shots"] if s.get("cut")})
def proj(k, pts):
    P = np.array(k["pos"]); A = np.array(k["target"]); fwd = A - P; fwd /= np.linalg.norm(fwd)
    up0 = np.array([np.sin(k.get("roll", 0) or 0), np.cos(k.get("roll", 0) or 0), 0.0])
    right = np.cross(fwd, up0); right /= np.linalg.norm(right); up = np.cross(right, fwd)
    rel = pts - P; z = rel @ fwd; x = rel @ right; y = rel @ up
    th = np.tan(np.radians(k["fov"]) / 2); asp = 1080 / 1920
    sx = (x / (z * th * asp)) * 540 + 540; sy = 960 - (y / (z * th)) * 960
    return np.stack([sx, sy], 1), z
rng = np.random.default_rng(1); cloud = rng.uniform(-1, 1, (40, 3))
def flow(C):
    out = np.zeros((len(C) - 1, 2))
    for f in range(len(C) - 1):
        k0, k1 = C[f], C[f + 1]
        dist = np.linalg.norm(np.array(k0["pos"]) - np.array(k0["target"]))
        pts = np.array(k0["target"]) + cloud * dist * 0.35
        a, za = proj(k0, pts); b, zb = proj(k1, pts)
        ok = (za > 0.05) & (zb > 0.05)
        if ok.sum() < 5: continue
        out[f] = np.median(b[ok] - a[ok], axis=0)
    return out
P0 = np.array([c["pos"] for c in d["raw"]]); st = np.r_[0, np.linalg.norm(np.diff(P0, axis=0), axis=1)]
anch = np.zeros(len(st), bool); f = 1
while f < len(st):
    if st[f] <= 0.15: f += 1; continue
    g = f; tot = 0
    while g < len(st) and st[g] > 0.15: tot += st[g]; g += 1
    if tot > 30: anch[max(0, f - 3):g + 3] = True
    f = g
for c in cuts: anch[max(0, c - 30):c + 10] = True
def reversals(F):
    F = F.copy(); F[anch[:-1]] = 0
    for c in cuts: F[c] = 0
    hits = []
    for ax, name in ((0, "horizontal"), (1, "vertical")):
        x = F[:, ax]
        for f in range(len(x)):
            if abs(x[f]) < T: continue
            seg = x[f + 1:f + W]; g = np.where((np.sign(seg) == -np.sign(x[f])) & (np.abs(seg) >= T))[0]
            if len(g): hits.append((f, f + 1 + g[0], name, max(abs(x[f]), abs(seg[g[0]]))))
    hits.sort(); grp = []
    for h in hits:
        if grp and h[0] - grp[-1][-1][1] <= 20: grp[-1].append(h)
        else: grp.append([h])
    return [(g[0][0], max(h[1] for h in g), sorted({h[2] for h in g}), max(h[3] for h in g)) for g in grp]
for name in [n for n in ("raw", "cam") if n in d]:
    rv = reversals(flow(d[name]))
    print(f"{name}: {len(rv)} back-and-forth spots (image flow ≥ {T} px/f both ways within {W} f, outside flights/cut pushes)")
    for a, b, ks, m in rv: print(f"   {a}-{b} ({a/30:.1f}–{b/30:.1f}s) {','.join(ks)} peak {m:.0f} px/f")
