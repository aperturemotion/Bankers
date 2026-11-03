"""Measures each hook sound-effect take (scratchpad/sfx-src/*.mp3) so the right one is chosen by what it IS, not by ear:
envelope (RMS in 50-ms windows, dBFS), the attack time to the loudest window, how bursty it is (std of the envelope in dB),
the spectral centroid overall and in the first / last third (a rising whine climbs), and the share of energy under 200 Hz
(a thump is low). python scratchpad/sfx-src/analyse.py"""
import glob, os, subprocess, sys
import numpy as np
FF = os.environ.get("FFMPEG") or r"C:\Users\Timur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"
SR = 48000
def load(p):
    raw = subprocess.run([FF, "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)
def centroid(x):
    if len(x) < 512: return 0.0
    X = np.abs(np.fft.rfft(x * np.hanning(len(x))))
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return float((X * f).sum() / max(1e-9, X.sum()))
def low_share(x):
    X = np.abs(np.fft.rfft(x)) ** 2; f = np.fft.rfftfreq(len(x), 1 / SR)
    return float(X[f < 200].sum() / max(1e-12, X.sum()))
d = os.path.dirname(os.path.abspath(__file__))
for p in sorted(glob.glob(os.path.join(d, "*.mp3"))):
    x = load(p)
    w = SR // 20
    n = len(x) // w
    env = np.array([20 * np.log10(max(1e-6, np.sqrt(np.mean(x[i * w:(i + 1) * w] ** 2)))) for i in range(n)])
    loud = env > env.max() - 30
    third = len(x) // 3
    print(f"{os.path.basename(p):18s} {len(x)/SR:5.2f}s  peak {20*np.log10(max(1e-6, np.abs(x).max())):6.1f} dBFS  rms-max {env.max():6.1f}"
          f"  attack {env.argmax()*50:5d} ms  bursty {env[loud].std():4.1f} dB  centroid {centroid(x):6.0f} Hz"
          f" (first {centroid(x[:third]):5.0f} → last {centroid(x[-third:]):5.0f})  <200Hz {low_share(x)*100:4.0f}%")
    print("   env(dB, 50 ms):", " ".join(f"{v:.0f}" for v in env[:40]))
