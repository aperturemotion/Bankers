# -*- coding: utf-8 -*-
# SFX LEVELS, MEASURED AGAINST THE VOICE (user, 2026-10-09: "The audio levels need to be right, sfx can't be too loud").
#   python scratchpad/sfxlevels.py                    (this film: out/mix_sfx.mp3, out/mix_vo.mp3, out/cues.json)
# Every film's voice sits at its own level, so the score is judged RELATIVE to its own film's voice:
#   voice = the voice stem's speech-gated level (50-ms frames within 30 dB of its loudest, power mean)
#   score = the SFX stem's frame peaks (1/30 s) over the frames where it sounds (> −70 dBFS): median, 90th pct, max
#   a cue = the SFX stem's loudest 100-ms RMS inside its audible span, minus the voice (skipped when another cue's span
#           overlaps it, so each figure is ONE sound)
# The reference is the user's own pick for its SFX: Video 29 (its stems are on disk; read only).
# Proves its reader first: a synthetic −18 dBFS burst must read back within 0.5 dB.
import json, os, subprocess, sys
import numpy as np
sys.stdout.reconfigure(encoding="utf-8")
FF = __import__("os").environ.get("FFMPEG", r"C:\Users\Timur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe")
SR, FPS = 48000, 30
HOP = SR // FPS
HERE = os.path.dirname(os.path.abspath(__file__))
V35 = os.path.join(HERE, "..")
# ★ (2026-10-15, "Look at the bob video as a complete style reference … for every aspect"): the reference is now Video 36 (Bob);
#   REF=… names another film's folder
REF_NAME = os.environ.get("REF", "Video 36")
V29 = os.path.join(HERE, "..", "..", REF_NAME)

def pcm(p):
    raw = subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)
def frame_peaks(x):
    n = len(x) // HOP
    return 20 * np.log10(np.abs(x[: n * HOP]).reshape(n, HOP).max(axis=1) + 1e-9)
def rms100(x):
    F = SR // 10; n = len(x) // HOP - 3
    return np.array([20 * np.log10(np.sqrt(np.mean(x[i * HOP : i * HOP + F] ** 2)) + 1e-9) for i in range(max(0, n))])
def voice_level(x):
    F = int(SR * 0.05); n = len(x) // F
    p = (x[: n * F].reshape(n, F) ** 2).mean(axis=1)
    db = 10 * np.log10(p + 1e-12)
    s = db > db.max() - 30
    return 10 * np.log10(np.mean(10 ** (db[s] / 10)))

t = np.zeros(SR * 2, np.float32); s0 = 30 * HOP
t[s0 : s0 + SR // 5] = 10 ** (-18 / 20) * np.sin(2 * np.pi * 440 * np.arange(SR // 5) / SR)
if abs(frame_peaks(t)[29:36].max() + 18) > 0.5: sys.exit("✗ REFUSED — the level reader failed its canary")

def stem_stats(root, name):
    sfx, vo = os.path.join(root, "out", "mix_sfx.mp3"), os.path.join(root, "out", "mix_vo.mp3")
    v = voice_level(pcm(vo)); db = frame_peaks(pcm(sfx)); on = db[db > -70]
    print(f"{name:8s} voice {v:6.1f} dBFS · score frames {len(on):5d} · peak − voice: median {np.median(on) - v:6.1f} · p90 {np.percentile(on, 90) - v:6.1f} · max {on.max() - v:6.1f} dB")
    return v, on

print("canary OK")
v29, on29 = stem_stats(V29, REF_NAME)
v35, on35 = stem_stats(V35, "Video 46")
print(f"→ Video 46 score sits {np.percentile(on35, 90) - v35 - (np.percentile(on29, 90) - v29):+.1f} dB (p90) and {np.median(on35) - v35 - (np.median(on29) - v29):+.1f} dB (median) against {REF_NAME}'s, relative to each film's voice")

cues = json.load(open(os.path.join(V35, "out", "cues.json"), encoding="utf8"))
x = pcm(os.path.join(V35, "out", "mix_sfx.mp3")); r = rms100(x)
spans = []
for c in cues:
    a = int(c.get("vis", c["at"])); b = int(min(c["at"] + c.get("dur", 30), c.get("to", 10 ** 9) + 2)); b = max(b, a + 4)
    spans.append((a, b, c))
rows = []
for i, (a, b, c) in enumerate(spans):
    if any(j != i and not (b2 <= a or a2 >= b) and c2.get("grp") != c.get("grp", "∅") for j, (a2, b2, c2) in enumerate(spans)):
        continue
    seg = r[max(0, a):max(a + 1, min(len(r), b))]
    if len(seg): rows.append((float(seg.max()) - v35, c["s"], a, c.get("vol")))
fam = {}
for d, s, a, vol in rows: fam.setdefault(s, []).append(d)
print("\nper family (clear cues only), loudest 100-ms RMS − voice level:")
for s, ds in sorted(fam.items(), key=lambda kv: -max(kv[1])):
    print(f"  {s:11s} n {len(ds):2d}  median {np.median(ds):6.1f}  max {max(ds):6.1f} dB")
print("\nthe 8 loudest clear cues:")
for d, s, a, vol in sorted(rows, reverse=True)[:8]:
    print(f"  f{a:5d} {s:11s} vol {vol}  {d:6.1f} dB under-voice")
