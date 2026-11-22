"""The hook's own sound effects (Video 15, 2026-10-22). The pack has nothing for a rocket, so real and generated effects (scratchpad/sfx-src/
SOURCE.txt) are placed on the hook's frames in ONE file, public/sfx15/hook.wav, played from frame 0 on its own <Audio> in Video.tsx:

  · ★ THE ROCKET, FROM A REAL FALCON 9 LAUNCH (Timur, 2026-10-22: "add a rocket sound effect that is sort of long and continues
    throughout the hook scene"; the generated ones "don't sound like a rocket taking off"; of the options cut from NASA's IM-2 pad-mic
    recording he chose the last, "last one seems good" — takeoff A + flight 3): the close pad mic's IGNITION — its crack, a breath, the
    build to full thrust (123.15 s, 3.6 s) — handing over to the same mic just after liftoff, the rocket RISING off the pad (136.0 s, one
    unbroken 9.5-s stretch, no looping). The takeoff's loudest moment ~5 dB under the speech, the flight ~10 dB under; the roar leaves with
    the push into the lens bloom. Exactly what out/sfx_options/nasa_flight_3_close_rising.mp3 played (scratchpad/sfx_options.py);
  (The AI chip's power-up hum at ~5 s was removed: "the sound effect that I DON'T LIKE IS STILL PLAYING AT 5 seconds REMOVE IT".)

Usage: python scratchpad/mkhooksfx.py <sep0> <whatA>   (the hook's TIMES.hook.sep[0] and the hand-over's first frame T0.whatA; Video.tsx
refuses if either moves)
"""
import sys, os, json, subprocess, wave
import numpy as np

FPS, SR = 30, 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scratchpad", "sfx-src")
FF = r"C:\Users\Timur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"

if len(sys.argv) != 3: sys.exit("usage: mkhooksfx.py <sep0> <whatA>")
SEP0, WHAT_A = int(sys.argv[1]), int(sys.argv[2])
SEP_HIT = SEP0 + 2          # the halves start to part (the kick's in-out is visible from here)
FADE0, FADE1 = WHAT_A - 4, WHAT_A + 24     # the roar leaves with the push into the bloom
LENGTH = FADE1 + 2

def load(name):
    raw = subprocess.run([FF, "-v", "error", "-i", os.path.join(SRC, name), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float64) / 32768

def at_peak(x, db):
    return x * (10 ** (db / 20) / max(1e-9, np.abs(x).max()))

def rms(x):
    return np.sqrt(np.mean(x ** 2))

def lowpass(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** 4)   # a gentle 2nd-order roll-off
    return np.fft.irfft(X, len(x))

out = np.zeros(int(LENGTH / FPS * SR))

# ── the rocket: NASA's IM-2 Falcon 9 pad-mic recording (scratchpad/sfx-src/SOURCE.txt), cut and levelled exactly as the chosen preview ──
NASA = os.path.join(SRC, "nasa_im2_padmic.mp3")
# ★ DEEPER (Timur: "the sound for the rocket should be a little deeper and quieter by a tiny bit"): played at PITCH of its speed (~1.5
# semitones down, which also slows it a touch, so a little more of the recording is read), its top end softened
PITCH = 0.88   # (was 0.92; then "it needs to sound more like a rocket, deeper")
def cut(ss, dur, ch, fc):
    raw = subprocess.run([FF, "-v", "error", "-ss", str(ss), "-t", str(dur * PITCH + 0.05), "-i", NASA, "-af", f"pan=mono|c0=c{ch},aresample={SR},asetrate={SR * PITCH:.0f},aresample={SR}", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    x = lowpass(lowpass(np.frombuffer(raw, np.int16).astype(np.float64) / 32768, fc), fc)   # (twice: a 4th-order roll-off, so the top really softens)
    return np.pad(x, (0, max(0, int(dur * SR) - len(x))))[: int(dur * SR)]
def lowshelf(x, fc, gain_db):
    """lift everything under fc by gain_db (a smooth shelf, in the spectrum)"""
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 + (10 ** (gain_db / 20) - 1) / (1 + (f / fc) ** 2)
    return np.fft.irfft(X, len(x))
def windows(x):
    h = SR // 4
    return np.array([rms(x[i:i + h]) for i in range(0, len(x) - h, h)])
DB = lambda d: 10 ** (d / 20)
N = len(out); t = np.arange(N) / SR
# ★ CLEAN STRETCHES ONLY (Timur: "sfx gets too loud and seems very bad quality at around 2 seconds, it needs to sound more like a rocket,
# deeper"): at ~2 s the old takeoff ran into the close mic's full blast, whose source CLIPS (1–5% of samples from 126 s) — harsh, and
# louder than it measures. Now (every stretch < 0.1% clipped, SOURCE.txt):
#   · the ignition: the close mic's crack and early build only (123.15 s, 1.5 s), ending before the clipped blast;
#   · the flight: the close mic's clean rise off the pad (136.6 s) BLENDED with the far mic's deep, clean rumble of the rocket climbing
#     (229.6 s) — the far mic carries the body, the close one the crackle;
#   · deeper: 0.88 speed (~2.2 semitones down), a 4th-order roll-off at ~2.2 kHz, and the lows under 140 Hz lifted 2.5 dB (5 lost the crackle a phone speaker needs).
TK_AT, TK_DUR = 123.15, 1.5
tk = cut(TK_AT, TK_DUR, 0, 2600)
tk = tk / windows(tk).max() * DB(-29)
tt = np.arange(len(tk)) / SR
tk *= np.clip((TK_DUR - tt) / 0.6, 0, 1) ** 1.5
near = cut(136.6, N / SR, 0, 2600); near /= np.median(windows(near))
far = cut(229.6, N / SR, 1, 2200); far /= np.median(windows(far))
fl = lowshelf(0.65 * near + 0.7 * far, 140, 2.5)   # (deep, but with enough crackle in the mids to carry on a phone speaker)
fl = fl / np.median(windows(fl)) * DB(-33)
leave = 0.5 + 0.5 * np.cos(np.pi * np.clip((t * FPS - FADE0) / (FADE1 - FADE0), 0, 1))
rocket = fl * np.clip((t - (TK_DUR - 0.7)) / 0.7, 0, 1) ** 0.5
rocket[: len(tk)] += lowshelf(tk, 140, 2.5)
# ★ ONE STEADY LEVEL (Timur: "the rocket sound is good, it just needs to be a little more consistent and not get quieter then louder
# again"): the real recording dips between the ignition crack and full thrust, and fades as the rocket climbs away. A slow gain follows
# its loudness (0.3-s RMS every 10 ms, smoothed over 0.8 s in dB) and holds it at LEVEL, so only its texture moves; the hand-over fade stays
LEVEL = -32.5   # (was −31: "quieter by a tiny bit")
hop, win = SR // 100, int(0.3 * SR)
pad = np.pad(rocket, (win // 2, win // 2), mode="reflect")
env_db = np.array([20 * np.log10(rms(pad[i:i + win]) + 1e-9) for i in range(0, len(rocket), hop)])
k = 80; env_db = np.convolve(np.pad(env_db, (k // 2, k // 2), mode="edge"), np.ones(k) / k, mode="valid")[: len(env_db)]
g_db = np.clip(LEVEL - env_db, -12, 18)
g = 10 ** (np.interp(np.arange(len(rocket)), np.arange(len(g_db)) * hop, g_db) / 20)
rocket = rocket * g
# (and no burst above it: the ignition crack stood 8 dB over, then still 4 dB at LEVEL + 3 — Timur: "at the start of the rocket sfx, the
# volume gets too loud for a bit" — so a fast, smoothed limit holds every 50-ms window within CEIL of LEVEL)
CEIL = 0.5
w2 = int(0.05 * SR); pad = np.pad(rocket, (w2 // 2, w2 // 2), mode="reflect")
e2 = np.array([20 * np.log10(rms(pad[i:i + w2]) + 1e-9) for i in range(0, len(rocket), hop)])
l_db = np.minimum(0, LEVEL + CEIL - e2); k2 = 6
l_db = -np.convolve(np.pad(-l_db, (k2, k2), mode="edge"), np.ones(2 * k2 + 1), mode="valid")[: len(l_db)] / (2 * k2 + 1) * 1.0
l_db = np.minimum(l_db, np.minimum(0, LEVEL + CEIL - e2))
rocket = rocket * 10 ** (np.interp(np.arange(len(rocket)), np.arange(len(l_db)) * hop, l_db) / 20) * leave
rocket[: int(0.15 * SR)] *= np.sin(np.linspace(0, np.pi / 2, int(0.15 * SR))) ** 2   # (eased in over 0.15 s, no jump from silence)
if not os.environ.get("NO_ROAR"): out += rocket   # (NO_ROAR=1: without the rocket, for the option previews' SFX stem)

# ── the separation: its bolt hit on SEP_HIT ──
sep = load("el_separation.mp3")
hit = int(np.argmax(np.abs(sep)))
sep = at_peak(sep, -17.0)
s = int(SEP_HIT / FPS * SR) - hit
out[s:s + len(sep)] += sep

# (the AI chip's power-up hum was REMOVED — Timur: "the sound effect that I DON'T LIKE IS STILL PLAYING AT 5 seconds REMOVE IT")

if np.abs(out).max() > 0.95: sys.exit("clips")
os.makedirs(os.path.join(ROOT, "public", "sfx15"), exist_ok=True)
with wave.open(os.path.join(ROOT, "public", "sfx15", "hook.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
json.dump({"sep0": SEP0, "whatA": WHAT_A, "frames": LENGTH}, open(os.path.join(SRC, "hook_frames.json"), "w"))
print(f"public/sfx15/hook.wav: {LENGTH} f; NASA Falcon 9 takeoff 0-{TK_DUR * FPS:.0f} then flight to {FADE1} (fading from {FADE0}), separation hit {SEP_HIT}; peak {20 * np.log10(np.abs(out).max()):.1f} dBFS")
