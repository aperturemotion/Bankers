# EACH SFX FAMILY'S HEARD LEVEL, FROM THE RENDER (root CLAUDE.md: mix by measured dB; Timur, 2026-10-01: "Ensure that there are
# lots of SFX and they are timed right"). Reads the SFX stem rendered alone (out/probe/v2_sfx.mp3, `audioprobe.mjs sfx`) and the
# cue sheet as heard (out/sfx_cues.json, `sfxsheet.mjs --json`), and takes each cue's peak in its own onset window
# [peak - 1, peak + 5]. A cue with another cue's onset within 6 f is listed as MASKED (its peak would be its neighbour's).
# Per family: median and range of the clean cues' peaks in dBFS. Give it a second video's folder to compare like for like:
#   python scratchpad/sfxlevels.py ["../Video 3 — Interest vs Military"]
# Proves itself first: a synthetic tone burst of known level must read back within 0.5 dB.
import json, os, subprocess, sys
import numpy as np

FF = r"C:\Users\Timur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"
SR, FPS = 48000, 30
HOP = SR // FPS

def frames_db(x):
    n = len(x) // HOP
    m = np.abs(x[: n * HOP]).reshape(n, HOP).max(axis=1)
    return 20 * np.log10(m + 1e-9)

# canary: a 0.2 s burst at -18 dBFS, starting at frame 30, must read -18 ± 0.5 at its onset window
t = np.zeros(SR * 2, np.float32); s = 30 * HOP
t[s : s + SR // 5] = 10 ** (-18 / 20) * np.sin(2 * np.pi * 440 * np.arange(SR // 5) / SR)
if abs(frames_db(t)[29:36].max() + 18) > 0.5: print("✗ REFUSED — level reader failed its canary"); sys.exit(1)

def levels(video):
    stem = os.path.join(video, "out", "probe", "v2_sfx.mp3")
    cues = json.load(open(os.path.join(video, "out", "sfx_cues.json"), encoding="utf8"))
    if os.path.getmtime(stem) < os.path.getmtime(os.path.join(video, "out", "sfx_cues.json")) - 3600:
        print(f"  ⚠ {os.path.basename(video)}: the stem is over an hour older than the cue sheet")
    raw = subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-i", stem, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    db = frames_db(np.frombuffer(raw, np.float32))
    onsets = sorted(c["peak"] for c in cues)
    fam = {}
    masked = 0
    for c in cues:
        p = c["peak"]
        if any(o != p and abs(o - p) <= 6 for o in onsets): masked += 1; continue
        w = db[max(0, p - 1) : p + 6]
        if len(w): fam.setdefault(c["s"], []).append(float(w.max()))
    return fam, masked, len(cues), float(db.max())

vids = [os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))] + [os.path.abspath(v) for v in sys.argv[1:]]
res = [levels(v) for v in vids]
names = [os.path.basename(v).split(" —")[0] for v in vids]
for (fam, masked, n, top), nm in zip(res, names):
    print(f"{nm}: {n} cues, {n - masked} measured clean ({masked} masked by a neighbour within 6 f); stem peak {top:.1f} dBFS")
allf = sorted(set().union(*[r[0].keys() for r in res]))
print(f"\n {'family':12s}" + "".join(f"{nm:>26s}" for nm in names))
for f in allf:
    row = f" {f:12s}"
    for fam, *_ in res:
        v = fam.get(f)
        row += f"{(f'{np.median(v):6.1f}  ({min(v):.1f}…{max(v):.1f}) n{len(v)}' if v else '—'):>26s}"
    print(row)
