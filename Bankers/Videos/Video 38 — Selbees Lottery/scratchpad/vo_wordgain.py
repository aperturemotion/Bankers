# V43 — per-word level fixes on the trimmed take (user, 2026-10-26: "on 1 minute 6 seconds, I think the word 'earns' of the voiceover
# is quieter than the rest … if it is, fix that"). Measured: "earns" −23.9 dB (speech-gated RMS) against same −18.7, in −20.3,
# gold −18.7, you −20.4, nothing −21.8. Applied to public/vo_trimmed_base.wav (the vo_trim.py output, kept) → public/vo_trimmed.wav,
# so a re-run never stacks. 15-ms raised-cosine ramps; refuses to clip. Re-run after every vo_trim.py.
import numpy as np, subprocess, sys, os
FF = os.environ.get("FFMPEG", "ffmpeg")
# ★ (user, later: "still quieter … make sure that it's on the same exact loudness as the rest of the voice"): judged by EAR-WEIGHTED
#   level (highpass 80 Hz + high shelf +4 dB at 1.7 kHz, speech frames > −40 dB) against the take's MEDIAN word (−20.3): +3.5 left
#   it at −22.5 on its caption window; on the word's own span (65.62–65.86) the raw word is −24.8, so +5.0 puts it at
#   −19.8: between "gold" (−17.3) and "you" (−21.5), at the take's median.
# ★ (user, again: "still somehow quieter than the rest. Make the single word louder"): in the MIX it already sat at −19.7 between "gold"
#   (−17.0) and "you" (−21.1) — a soft "er" vowel reads quiet at an equal level — so it is lifted CLEARLY: +8.5 in all, to ≈ −16.3.
# ★ (user, a fourth time: "the earns before you nothing … still somehow quieter, fix"). The word measured: "earns" is ONLY 65.68–65.86
#   (faster-whisper small on the window: gold 65.32–65.68, earns 65.68–66.16 incl. the pause; the energy shows gold's vowel to 65.68,
#   "earns" 65.68–65.85, a 0.18-s pause, then "you" 66.05). The old window (65.60–65.88, 15-ms ramps) lifted gold's tail as much as
#   "earns", so the GAP to "gold" never closed (base: earns 150–1k Hz −28.7 vs gold −19.6). Now a tight window, 8-ms ramps, +9 dB,
#   plus a presence lift (+5 dB, 2–6 kHz) on the word only, so it reads as clearly as its neighbours.
# ★ (then: "re-generate just that sentence in the same ElevenLabs voice and splice it in") — the sentence is now take A, spliced into
#   vo_trimmed_base.wav by scratchpad/earnfix/splice.py (the original base kept as scratchpad/earnfix/vo_trimmed_base_ORIG.wav). The
#   old lift no longer applies; any new per-word fix is measured on the spliced take.
# On the spliced take, "earns" (65.73–65.97) measured −25.8 against the take's median word −19.9 (gold −18.5, you −20.2): lifted
#   +6 dB with presence +3, tight, to sit at the median.
FIXES = []   # V44: none yet (measure on this take first)
PRESENCE_DB = 3.0
SR = 44100
src, dst = "public/vo_trimmed_base.wav", "public/vo_trimmed.wav"
if not os.path.exists(src): sys.exit(f"✗ no {src} — copy the fresh vo_trim.py output there first")
x = np.frombuffer(subprocess.run([FF, "-v", "error", "-i", src, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout, dtype=np.float32).copy()
g = np.ones_like(x)
for name, a, b, db in FIXES:
    i0, i1, r = int(a * SR), int(b * SR), int(0.008 * SR)
    k = 10 ** (db / 20)
    env = np.ones(i1 - i0 + 2 * r)
    ramp = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, r))
    env[:r] = ramp; env[-r:] = ramp[::-1]
    g[i0 - r:i1 + r] = 1 + (k - 1) * env
    print(f"  {name}: {a:.2f}–{b:.2f} s  +{db} dB")
y = x * g
# the presence lift: the 2–6 kHz band of each fixed word, added back with the same ramp envelope
from scipy.signal import butter, sosfiltfilt
band = sosfiltfilt(butter(2, [2000, 6000], btype="band", fs=SR, output="sos"), x).astype(np.float32)
pg = np.zeros_like(x)
for name, a, b, db in FIXES:
    i0, i1, r = int(a * SR), int(b * SR), int(0.008 * SR)
    env = np.ones(i1 - i0 + 2 * r); ramp = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, r)); env[:r] = ramp; env[-r:] = ramp[::-1]
    pg[i0 - r:i1 + r] = env * (10 ** (db / 20)) * (10 ** (PRESENCE_DB / 20) - 1)
y = y + band * pg
if np.abs(y).max() >= 0.98: sys.exit(f"✗ would clip (peak {np.abs(y).max():.3f}) — refusing")
subprocess.run([FF, "-v", "error", "-y", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-i", "-", "-c:a", "pcm_s16le", dst], input=y.astype(np.float32).tobytes(), check=True)
print(f"✓ wrote {dst}  peak {20*np.log10(np.abs(y).max()):.1f} dBFS")
