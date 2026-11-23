# THE BED AS HEARD (Timur, 2026-10-20: "adjust the audio levels to the way they are in previous bankers videos, the song is too loud now").
# Plain RMS (bedwin13.py) let a denser, punchier song sit audibly louder at the same figure, so this measures the bed against the voice in
# K-WEIGHTED loudness (ITU BS.1770: the two-stage K filter at 48 kHz, 400-ms momentary blocks every 100 ms), on rendered stems, while the
# voice speaks (its momentary loudness above -40 LUFS):
#   · the bed's typical level under the voice (energy mean of its momentary loudness) — and its p90 and p98, the LOUD moments a punchy
#     track pushes at the voice;
#   · the same, per 10-s window.
#   python scratchpad/lufsgap13.py <voice stem> <bed stem> [label]
import subprocess, sys
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
FF = r"C:\Users\Timur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"
SR = 48000

def pcm(p):
    x = np.frombuffer(subprocess.run([FF, "-v", "quiet", "-i", p, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
    return x.reshape(-1, 2).astype(np.float64)

def biquad(x, b, a):
    y = np.zeros_like(x); x1 = x2 = y1 = y2 = np.zeros(x.shape[1])
    # vectorised over channels, looped over samples via lfilter-free recursion (scipy-free): use direct form with numpy cumulative trick is
    # not exact, so loop in chunks
    for n in range(len(x)):
        xn = x[n]; yn = b[0] * xn + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2
        y[n] = yn; x2, x1, y2, y1 = x1, xn, y1, yn
    return y

try:
    from scipy.signal import lfilter
    def filt(x, b, a): return lfilter(b, a, x, axis=0)
except ImportError:
    filt = biquad

# BS.1770-4 K-weighting at 48 kHz: the high-shelf pre-filter, then the RLB high-pass
PRE = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585])
RLB = ([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621])

def momentary(p):
    x = pcm(p)
    y = filt(filt(x, *PRE), *RLB)
    e = (y ** 2).sum(1)                      # channel weights 1, 1 (L, R)
    c = np.concatenate([[0], np.cumsum(e)])
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    idx = np.arange(0, len(e) - blk, hop)
    ms = (c[idx + blk] - c[idx]) / blk
    return -0.691 + 10 * np.log10(ms + 1e-15)

# canary (BS.1770): a 997 Hz sine at 0 dBFS peak in ONE channel reads -3.01 LUFS, so one peaking at -20 dBFS in BOTH reads -20.0
t = np.arange(SR * 2) / SR; s = 0.1 * np.sin(2 * np.pi * 1000 * t)
yy = filt(filt(np.stack([s, s], 1), *PRE), *RLB); L = -0.691 + 10 * np.log10(((yy[SR // 2:] ** 2).sum(1)).mean())
if not (-20.3 < L < -19.7): sys.exit(f"REFUSED — the K-weighted meter failed its canary ({L:.2f} LUFS for a -20 dBFS 1 kHz sine)")

vo, bed = sys.argv[1], sys.argv[2]; lab = sys.argv[3] if len(sys.argv) > 3 else ""
Mv, Mb = momentary(vo), momentary(bed); n = min(len(Mv), len(Mb)); Mv, Mb = Mv[:n], Mb[:n]
sp = Mv > -40
lin = lambda v: 10 * np.log10(np.mean(10 ** (np.asarray(v) / 10)))
V = lin(Mv[sp])
print(f"{lab:10s} while the voice speaks: bed {V - lin(Mb[sp]):5.2f} LU under it (energy mean), loud moments p90 {V - np.percentile(Mb[sp], 90):5.2f}, p98 {V - np.percentile(Mb[sp], 98):5.2f}")
t = np.arange(n) * 0.1; ws = []
for a in np.arange(0, t[sp].max(), 10):
    w = sp & (t >= a) & (t < a + 10)
    if w.sum() < 20: continue
    ws.append(f"{lin(Mv[w]) - lin(Mb[w]):.1f}")
print(f"{'':10s} per 10-s window: {' '.join(ws)}")
