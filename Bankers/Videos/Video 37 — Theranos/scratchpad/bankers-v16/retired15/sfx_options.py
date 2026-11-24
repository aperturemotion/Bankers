"""Rocket sound OPTIONS for the hook, for Timur to choose — from a REAL Falcon 9 launch (2026-10-22: the generated ones "don't sound like a
rocket taking off"; NASA's IM-2 pad-mic recording, scratchpad/sfx-src/SOURCE.txt). Each option is heard IN PLACE: the hook's first 9.5 s
with the voice, the song and the other effects (rendered stems out/probe/v2_vo, v2_music, v2_sfx_noroar), plus the option, at the level it
would play at in the film.

  takeoff A/B/C — the first ~2 s (the engines lighting / the blast), each handing over to flight 1, so only the takeoff differs
  flight 1/2/3  — the steady roar for the rest of the hook: ONE unbroken stretch of the real recording each (no looping), after takeoff A

The roar keeps the voice clear: the takeoff sits ~7 dB under the speech, the flight ~10 dB under; the flight leaves with the push into the
lens bloom (frames 255–283), as the film's roar does. Writes out/sfx_options/*.mp3 (previews only).
"""
import os, subprocess
import numpy as np

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = r"C:\Users\Timur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"
NASA = os.path.join(ROOT, "scratchpad", "sfx-src", "nasa_im2_padmic.mp3")
DUR = 9.5
OUT = os.path.join(ROOT, "out", "sfx_options"); os.makedirs(OUT, exist_ok=True)

def load(p, ch=1, ss=None, t=None, pick=None):
    a = [FF, "-v", "error"] + (["-ss", str(ss)] if ss is not None else []) + (["-t", str(t)] if t is not None else []) + ["-i", p]
    if pick is not None: a += ["-af", f"pan=mono|c0=c{pick}"]
    a += ["-ac", str(ch), "-ar", str(SR), "-f", "s16le", "-"]
    x = np.frombuffer(subprocess.run(a, capture_output=True, check=True).stdout, np.int16).astype(np.float64) / 32768
    return x.reshape(-1, ch) if ch == 2 else x

def rms(x): return np.sqrt(np.mean(x ** 2))
def lowpass(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / np.sqrt(1 + (f / fc) ** 4); return np.fft.irfft(X, len(x))

N = int(DUR * SR)
t = np.arange(N) / SR
leave = 0.5 + 0.5 * np.cos(np.pi * np.clip((t * 30 - 255) / 28, 0, 1))
DB = lambda d: 10 ** (d / 20)

# (start s, channel 0 = mic 1 close / 1 = mic 2 farther, low-pass) — from the recording's map in SOURCE.txt
TAKEOFF = {
    "A_ignition_close":   (123.15, 0, 7000, 3.6),   # the ignition crack, a breath, then the build to full thrust (close pad mic)
    "B_full_blast":       (125.6, 0, 6000, 2.4),    # the last of the build straight into the full liftoff blast (close pad mic)
    "C_roar_arriving":    (151.0, 1, 7000, 3.2),    # the roar arriving across the pad, crackle building (farther mic)
}
FLIGHT = {
    "1_crackling_roar":   (162.0, 1, 7000),   # the full roar, crackling, mid-weight (farther mic)
    "2_deep_climb":       (229.0, 1, 5000),   # the deep, clean rumble of the rocket climbing away (farther mic)
    "3_close_rising":     (136.0, 0, 6000),   # just after liftoff, the rocket rising off the pad (close pad mic)
}

def clip_of(spec, dur):
    s0, c, fc = spec[:3]
    x = lowpass(load(NASA, ss=s0, t=dur, pick=c), fc)
    x = np.pad(x, (0, max(0, int(dur * SR) - len(x))))[: int(dur * SR)]
    return x

def win_db(x):
    h = SR // 4
    return np.array([rms(x[i:i + h]) for i in range(0, len(x) - h, h)])

def flight_bed(k):
    x = clip_of(FLIGHT[k], DUR)
    x = x / np.median(win_db(x)) * DB(-33)                          # steady, ~10 dB under the speech-gated voice
    x[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))
    return x * leave

def takeoff(k):
    dur = TAKEOFF[k][3]
    x = clip_of(TAKEOFF[k], dur)
    x = x / win_db(x).max() * DB(-27)                                   # its loudest moment ~5 dB under the speech
    tt = np.arange(len(x)) / SR
    x *= np.clip((dur - tt) / 0.6, 0, 1) ** 1.5                         # hands over to the flight roar over its last 0.6 s
    x[: int(0.005 * SR)] *= np.linspace(0, 1, int(0.005 * SR))
    y = np.zeros(N); y[: len(x)] = x
    return y

def flight_in(k): d = TAKEOFF[k][3]; return np.clip((t - (d - 1.2)) / 1.0, 0, 1)                              # the flight roar comes up under the takeoff's tail

vo, mu, sx = (load(os.path.join(ROOT, "out", "probe", f"v2_{s}.mp3"), 2)[:N] for s in ("vo", "music", "sfx_noroar"))
base = vo + mu + sx

def write(name, rocket):
    mix = base + 0.7071 * rocket[:, None]                               # a mono effect in a stereo mix (Remotion's pan law)
    if np.abs(mix).max() > 0.98: raise SystemExit(f"{name} clips ({np.abs(mix).max():.2f})")
    p = os.path.join(OUT, f"nasa_{name}.mp3")
    subprocess.run([FF, "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-b:a", "192k", p], input=mix.astype(np.float32).tobytes(), check=True)
    print(os.path.basename(p), "peak %.1f dB" % (20 * np.log10(np.abs(mix).max())))

for k in TAKEOFF: write(f"takeoff_{k}", takeoff(k) + flight_bed("1_crackling_roar") * flight_in(k))
for k in FLIGHT: write(f"flight_{k}", takeoff("A_ignition_close") + flight_bed(k) * flight_in("A_ignition_close"))
