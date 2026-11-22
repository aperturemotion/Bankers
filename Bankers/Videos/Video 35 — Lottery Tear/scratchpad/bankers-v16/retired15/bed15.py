# VIDEO 15 — WHERE 711 STARTS (Timur, 2026-10-22: "nevermind, cancel the render and use the 711 song instead"; STYLE §16).
# 711 builds quietly (~−21 dB) and drops to a steady −10 dB at ~117 s, holding to its end (210 s). The drop is found on the waveform (the
# first 10-ms frame after 115 s louder than −15 dB that stands 8 dB over the 0.3 s before it: the hit at 117.35 s) and lands on the what-section's first word, "On"
# (frame DROP_F), as the lens bloom peaks; the song is started that far before its drop, so music is heard from the film's first frame.
# The song then plays AT ONE GAIN (STYLE §16 2026-10-21: never an envelope), its build quieter under the hook as written, the gain set so
# its loudest stretch sits ~5.7 LU under the voice (scratchpad/lufsgap13.py on the rendered stems).
#   python scratchpad/bed15.py   → prints MUSIC_FROM_S for Video.tsx
import subprocess, sys
sys.stdout.reconfigure(encoding="utf-8")
import numpy as np

FF = r"C:\Users\Timur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"
SR, FPS, DROP_F = 48000, 30, 271

x = np.frombuffer(subprocess.run([FF, "-v", "quiet", "-ss", "110", "-t", "12", "-i", "public/711.mp3", "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                                 capture_output=True, check=True).stdout, np.int16) / 32768
hop = SR // 100
d = 20 * np.log10(np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)]) + 1e-9)
for j in range(500, len(d)):
    if d[j] > -15 and d[j] > np.mean(d[j - 30:j]) + 8:   # (the HIT, loud: the riser out of the silent gap before it starts at ~116.3)
        drop = 110.0 + j / 100
        print(f"drop at {drop:.2f} s of 711 → MUSIC_FROM_S = {drop - DROP_F / FPS:.2f} (the drop on frame {DROP_F})")
        break
else:
    sys.exit("no drop found")
