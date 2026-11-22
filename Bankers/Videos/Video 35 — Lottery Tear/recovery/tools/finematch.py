import sys, subprocess, numpy as np
def pcm(p, sr):
    r = subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(sr),"-f","f32le","-"],capture_output=True)
    return np.frombuffer(r.stdout,dtype=np.float32)
a_p, b_p = sys.argv[1], sys.argv[2]
sr = 44100
a, b = pcm(a_p, sr), pcm(b_p, sr)
best = (-1, 0)
for lag in range(-200, 201):
    if lag >= 0: x, y = a[lag:], b
    else: x, y = a, b[-lag:]
    m = min(len(x), len(y)); x, y = x[:m], y[:m]
    cc = float((x*y).sum() / (np.sqrt((x*x).sum()*(y*y).sum())+1e-12))
    if cc > best[0]: best = (cc, lag)
cc, lag = best
if lag >= 0: x, y = a[lag:], b
else: x, y = a, b[-lag:]
m = min(len(x), len(y)); x, y = x[:m], y[:m]
g = float((x*y).sum()/(y*y).sum())
res = x - g*y
snr = 10*np.log10((x*x).sum()/((res*res).sum()+1e-20))
print(f"corr={cc:.5f} lag={lag} gain_dB={20*np.log10(g):.2f} SNR_after_gain={snr:.1f}dB lenA={len(a)/sr:.4f} lenB={len(b)/sr:.4f}")
