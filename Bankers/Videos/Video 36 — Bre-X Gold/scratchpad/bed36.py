#!/usr/bin/env python3
# V36 bed (2026-11-23, the take landed): Radiohead "Everything In Its Right Place" (Instrumental) from its top — the previous film's
# song (Video 35's), scratchpad/music_radiohead.mp3 — set to sit TARGET dB under the speech-gated voice in every 10-s window
# (Video 35's measured relation: 9.7 dB mean, 7.9–12.4 by window, its bed against its own take), the gain interpolated linearly
# between window centres (no step), held through the close, a 0.3-s fade-in, the last 3 s faded, cut to TOTAL_FRAMES (+1 f).
# Writes public/bed_radiohead.mp3 (static volume in the film: the fades and the envelope are baked). Re-run after any re-trim.
#   python3 scratchpad/bed36.py
import json, os, re, subprocess, sys
import numpy as np
FF = os.environ.get("FFMPEG", "/home/user/ffbin/ffmpeg")
TARGET = 9.7
SRC, VO, OUT = "scratchpad/music_radiohead.mp3", "public/vo_trimmed.wav", "public/bed_radiohead.mp3"
cap = open("src/bnx/captions.ts", encoding="utf8").read()
TOTAL = int(re.search(r"TOTAL_FRAMES = (\d+)", cap).group(1))
L = (TOTAL + 1) / 30.0
def load(p, sr, ch):
    raw = subprocess.run([FF, "-v", "error", "-i", p, "-ac", str(ch), "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, ch)
SR = 48000
music = load(SRC, SR, 2)[: int(L * SR)].copy()
if len(music) < int(L * SR): sys.exit("the source is shorter than the film")
voice = load(VO, SR, 1)[:, 0]
blk = int(0.05 * SR)
def rms_blocks(x):
    nb = len(x) // blk
    return np.sqrt((x[: nb * blk].reshape(nb, blk) ** 2).mean(1))
db = lambda x: 20 * np.log10(x + 1e-9)
# ★ the music is measured through ffmpeg's own mono downmix, as Video 35's reference relation was (a plain L/R average reads ~3 dB
#   lower on this track and left the bed at ~7 dB under, not 9.7)
music_mono = load(SRC, SR, 1)[: len(music), 0]
vr, mr = rms_blocks(voice), rms_blocks(music_mono)
gate = db(vr) > -45
W = 200
cent, gains = [], []
for i in range(0, len(vr), W):
    g = gate[i:i + W]
    if g.sum() < 20: continue
    vv = db(np.sqrt((vr[i:i + W][g] ** 2).mean())); mm = db(np.sqrt((mr[i:i + len(g)][g] ** 2).mean()))
    cent.append((i + min(W, len(vr) - i) / 2) * 0.05); gains.append(vv - TARGET - mm)
t = np.arange(len(music)) / SR
gdb = np.interp(t, cent, gains)          # held flat before the first and after the last centre
out = music * (10 ** (gdb / 20))[:, None]
fi = int(0.3 * SR); out[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(3.0 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]
pk = np.abs(out).max()
if pk > 0.89: sys.exit(f"the bed peaks at {db(pk):.1f} dBFS — too hot")
tmp = "out/bed36.wav"
subprocess.run([FF, "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s16le", tmp], input=out.astype(np.float32).tobytes(), check=True)
subprocess.run([FF, "-v", "error", "-y", "-i", tmp, "-c:a", "libmp3lame", "-b:a", "192k", OUT], check=True)
print(f"bed: {len(cent)} windows, gains {min(gains):.1f}…{max(gains):.1f} dB, {L:.2f} s, peak {db(pk):.1f} dBFS → {OUT}")
# verify on the written file
b = load(OUT, SR, 1)[:, 0]; br = rms_blocks(b)
for i in range(0, len(vr), W):
    g = gate[i:i + W]
    if g.sum() < 20: continue
    vv = db(np.sqrt((vr[i:i + W][g] ** 2).mean())); bb = db(np.sqrt((br[i:i + len(g)][g] ** 2).mean()))
    print(f"  {i * 0.05:5.1f}s  voice {vv:6.1f}  bed {bb:6.1f}  under by {vv - bb:4.1f}")
