# V38 rev 2 — finds BACK-AND-FORTH camera motion (Timur: "it goes a bit more to the right and then glitches back"): in screen terms,
# the view's yaw rate, pitch rate and sideways/vertical travel (relative to the aim distance), each in degrees of view per frame.
# A reversal = the rate swings from ≥ T one way to ≥ T the other way within W frames (a real move that settles never reverses).
import json, sys, numpy as np
d = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "out/cam_s.json"))
T = float(sys.argv[2]) if len(sys.argv) > 2 else 0.08; W = 45
cuts = sorted({s["a"] for s in d["shots"] if s.get("cut")})
def rates(C):
    P = np.array([c["pos"] for c in C]); A = np.array([c["target"] for c in C])
    v = A - P; dist = np.linalg.norm(v, axis=1); u = v / dist[:, None]
    yaw = np.degrees(np.unwrap(np.arctan2(u[:, 0], -u[:, 2]))); pit = np.degrees(np.arcsin(np.clip(u[:, 1], -1, 1)))
    right = np.stack([-u[:, 2], np.zeros(len(u)), u[:, 0]], 1); right /= np.maximum(np.linalg.norm(right, axis=1)[:, None], 1e-9)
    dP = np.diff(P, axis=0)
    sx = np.degrees((dP * right[:-1]).sum(1) / dist[:-1]); sy = np.degrees(dP[:, 1] / dist[:-1])
    out = {"yaw": np.diff(yaw), "pitch": np.diff(pit), "slide": sx, "lift": sy}
    for k in out:
        for c in cuts: out[k][c] = 0
    return out
def reversals(r):
    found = []
    for k, x in r.items():
        for f in range(len(x)):
            if abs(x[f]) < T: continue
            s = np.sign(x[f]); seg = x[f + 1:f + W]
            g = np.where(np.sign(seg) == -s)[0]
            g = [i for i in g if abs(seg[i]) >= T]
            if g: found.append((f, k, round(float(x[f]), 2), f + 1 + g[0], round(float(seg[g[0]]), 2)))
    # group
    found.sort(); grp = []
    for it in found:
        if grp and it[0] - grp[-1][-1][0] <= 30: grp[-1].append(it)
        else: grp.append([it])
    return [(g[0][0], g[-1][3], sorted({i[1] for i in g}), max(max(abs(i[2]), abs(i[4])) for i in g)) for g in grp]
# the stretches kept exactly as authored (kit.glideCam ANCHORED): flights (> 30 m runs ±3), the 30 f push into a cut and 8 f after it
P0 = np.array([c["pos"] for c in d["raw"]]); st = np.r_[0, np.linalg.norm(np.diff(P0, axis=0), axis=1)]
anch = np.zeros(len(st), bool); f = 1
while f < len(st):
    if st[f] <= 0.15: f += 1; continue
    g = f; tot = 0
    while g < len(st) and st[g] > 0.15: tot += st[g]; g += 1
    if tot > 30: anch[max(0, f - 3):g + 3] = True
    f = g
for c in cuts: anch[max(0, c - 30):c + 10] = True
def masked(r): return {k: np.where(anch[:-1], 0, v) for k, v in r.items()}
for name in ("raw", "cam"):
    rv = reversals(masked(rates(d[name])))
    print(f"{name}: {len(rv)} back-and-forth spots (rate ≥ {T}°/f both ways within {W} f)")
    for a, b, ks, m in rv: print(f"   {a}-{b} ({a/30:.1f}s) {','.join(ks)} peak {m:.2f}°/f")
