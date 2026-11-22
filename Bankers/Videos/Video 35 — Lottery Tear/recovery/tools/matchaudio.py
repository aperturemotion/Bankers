# usage: python3 -I matchaudio.py <embedded_dir> <candidate_root>...
import sys, os, subprocess, numpy as np, glob, json
SR = 22050
def pcm(path, ch=1):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True)
    return np.frombuffer(r.stdout, dtype=np.float32)
def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=sample_rate,channels", "-of", "csv=p=0", path], capture_output=True, text=True)
    return r.stdout.strip()
emb_dir = sys.argv[1]
cands = []
for root in sys.argv[2:]:
    cands += [p for p in glob.glob(os.path.join(root, "**", "*"), recursive=True) if p.lower().endswith((".wav", ".mp3")) and os.path.getsize(p) < 30_000_000]
cache = {}
def get(p):
    if p not in cache: cache[p] = pcm(p)
    return cache[p]
results = {}
embs = [os.path.join(dp, f) for dp, _, fs in os.walk(emb_dir) for f in fs if f.endswith((".wav", ".mp3"))]
for e in sorted(embs):
    name = os.path.relpath(e, emb_dir)
    a = get(e)
    best = []
    for c in cands:
        b = get(c)
        if len(b) == 0 or abs(len(b) - len(a)) > 0.25 * SR + 0.1 * len(a): continue
        n = min(len(a), len(b))
        # search lag in +-40 ms
        bestc = (-1, 0)
        for lag in range(-int(0.04 * SR), int(0.04 * SR) + 1, 4):
            if lag >= 0: x, y = a[lag:n], b[:n - lag]
            else: x, y = a[:n + lag], b[-lag:n]
            m = min(len(x), len(y)); x, y = x[:m], y[:m]
            if m < 64: continue
            den = np.sqrt((x * x).sum() * (y * y).sum()) + 1e-12
            cc = float((x * y).sum() / den)
            if cc > bestc[0]: bestc = (cc, lag)
        if bestc[0] > 0.9:
            rms_a = np.sqrt((a * a).mean()); rms_b = np.sqrt((b * b).mean())
            best.append((round(bestc[0], 4), round(float(20 * np.log10(rms_a / rms_b)), 2), round(len(a) / SR, 3), round(len(b) / SR, 3), bestc[1], c))
    best.sort(reverse=True)
    results[name] = best[:4]
    print(name, probe(e), json.dumps(best[:3]))
