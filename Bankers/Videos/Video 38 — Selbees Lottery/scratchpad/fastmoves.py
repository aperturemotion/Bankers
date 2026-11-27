# Fast camera moves for whoosh placement: per frame, the MEDIAN per-point image speed (px/f at 1080×1920) of a cloud around the aim point
# (catches pushes/zooms, which a median-flow vector cancels). A move = a run above HI, extended both ways while above LO (start/end = where
# the camera starts moving fast / finishes). Hard cuts split runs.
import json, sys, numpy as np
exec(open("scratchpad/camflow.py").read().split("def flow")[0])
HI = float(sys.argv[2]) if len(sys.argv) > 2 else 14; LO = float(sys.argv[3]) if len(sys.argv) > 3 else 4
C = d["cam"]; N = len(C); M = np.zeros(N)
for f in range(N - 1):
    k0, k1 = C[f], C[f + 1]
    dist = np.linalg.norm(np.array(k0["pos"]) - np.array(k0["target"]))
    pts = np.array(k0["target"]) + cloud * dist * 0.35
    a, za = proj(k0, pts); b, zb = proj(k1, pts); ok = (za > 0.05) & (zb > 0.05)
    if ok.sum() >= 5: M[f] = np.median(np.linalg.norm(b[ok] - a[ok], axis=1))
for c in cuts: M[max(0, c - 1):c + 1] = 0
M = np.convolve(M, np.ones(3) / 3, mode="same")
moves = []; f = 0
while f < N:
    if M[f] < HI: f += 1; continue
    a = f
    while a > 0 and M[a - 1] >= LO and (a - 1) not in cuts and a not in cuts: a -= 1
    b = f
    while b < N - 1 and M[b + 1] >= LO and (b + 1) not in cuts: b += 1
    if moves and a <= moves[-1][1]: moves[-1][1] = max(b, moves[-1][1])
    else: moves.append([a, b])
    f = b + 1
out = [{"a": int(a), "b": int(b), "peak": int(a + np.argmax(M[a:b + 1])), "vmax": round(float(M[a:b + 1].max()), 1)} for a, b in moves]
json.dump(out, open("out/fastmoves.json", "w"))
for m in out: print(f"{m['a']:5d}-{m['b']:5d}  {m['a']/30:5.2f}-{m['b']/30:5.2f}s  len {m['b']-m['a']+1:3d}f  peak {m['peak']} @ {m['vmax']} px/f")
print("median speed", round(float(np.median(M)), 1))
