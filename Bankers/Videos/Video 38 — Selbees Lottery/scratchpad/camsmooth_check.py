# V38 rev 2: measures the camera path (raw makeCam vs the smoothed CAM): stop-and-go dips, speed/accel, cut frames kept exact
import json, sys, numpy as np
d = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "out/cam_s.json"))
cuts = sorted({s["a"] for s in d["shots"] if s.get("cut")})
def stats(C, name):
    P = np.array([c["pos"] for c in C]); T = np.array([c["target"] for c in C])
    v = T - P; dist = np.linalg.norm(v, axis=1); u = v / dist[:, None]
    ang = np.degrees(np.arccos(np.clip((u[1:] * u[:-1]).sum(1), -1, 1)))
    pv = np.linalg.norm(P[1:] - P[:-1], axis=1) / np.maximum(dist[:-1], 1e-3) * 57.3
    sp = ang + pv
    for c in cuts: sp[c] = np.nan            # the jump between a and a+1
    ac = np.abs(np.diff(sp))
    stops = [f for f in range(20, len(sp) - 20) if sp[f] < 0.05 and np.nanmax(sp[f-20:f]) > 0.3 and np.nanmax(sp[f:f+20]) > 0.3]
    g = []
    for f in stops:
        if not g or f - g[-1][-1] > 3: g.append([f])
        else: g[-1].append(f)
    print(f"{name}: speed median {np.nanmedian(sp):.3f} p95 {np.nanpercentile(sp,95):.2f} max {np.nanmax(sp):.2f} °/f · accel p95 {np.nanpercentile(ac,95):.3f} max {np.nanmax(ac):.2f} · stop-and-go dips {len(g)}")
    return P, T
Pr, Tr = stats(d["raw"], "raw     ")
Ps, Ts = stats(d["cam"], "smoothed")
for c in cuts:
    for f in (c, c + 1):
        e = max(np.abs(Pr[f] - Ps[f]).max(), np.abs(Tr[f] - Ts[f]).max())
        print(f"cut frame {f}: |raw − smoothed| = {e:.2e}")
dev = np.degrees(np.arccos(np.clip((((Tr-Pr)/np.linalg.norm(Tr-Pr,axis=1)[:,None])*((Ts-Ps)/np.linalg.norm(Ts-Ps,axis=1)[:,None])).sum(1),-1,1)))
print("view-direction deviation from raw: median %.2f° p95 %.2f° max %.2f° at %d" % (np.median(dev), np.percentile(dev,95), dev.max(), dev.argmax()))
