# Measures JITTER in the rendered MP4: tracks an element's ink centroid frame by frame inside a crop, then reports the
# motion's smoothness — the frame-to-frame steps (velocity) and how much they JUMP around (the second difference).
# Smooth motion has small second differences even when it moves fast; jitter is a second difference that flips sign
# every frame. Timur, 2026-09-26: "the jpmorgan text is jittering a little bit".
#   python scratchpad/jitter.py <mp4> <t0_s> <dur_s> <x> <y> <w> <h> <light|dark> [threshold]
import sys, subprocess
FF = r"C:\Users\Timur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"
mp4, t0, dur, x, y, w, h, mode = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), *map(int, sys.argv[4:8]), sys.argv[8]
thr = int(sys.argv[9]) if len(sys.argv) > 9 else (190 if mode == "light" else 70)
raw = subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-ss", str(t0), "-t", str(dur), "-i", mp4,
                      "-vf", f"crop={w}:{h}:{x}:{y},format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
n = len(raw) // (w * h)
cs = []
for k in range(n):
    fr = raw[k * w * h:(k + 1) * w * h]
    sx = sy = m = 0
    for i, v in enumerate(fr):
        on = v >= thr if mode == "light" else v <= thr
        if on:
            sx += i % w; sy += i // w; m += 1
    cs.append((sx / m, sy / m, m) if m > 30 else None)
ok = [c for c in cs if c]
print(f"{n} frames, {len(ok)} with ink")
vel = [(cs[i][0] - cs[i-1][0], cs[i][1] - cs[i-1][1]) for i in range(1, n) if cs[i] and cs[i-1]]
acc = [(vel[i][0] - vel[i-1][0], vel[i][1] - vel[i-1][1]) for i in range(1, len(vel))]
flips = sum(1 for i in range(1, len(acc)) if acc[i][1] * acc[i-1][1] < -0.04 or acc[i][0] * acc[i-1][0] < -0.04)
mx = max((abs(a[0]) + abs(a[1]) for a in acc), default=0)
print(f"max |2nd diff| {mx:.2f} px/f²  sign-flipping steps {flips}/{max(1,len(acc)-1)}  mean |vel| {sum(abs(v[0])+abs(v[1]) for v in vel)/max(1,len(vel)):.2f} px/f")
print("per-frame y:", " ".join(f"{c[1]:.2f}" if c else "-" for c in cs[:40]))
print("per-frame x:", " ".join(f"{c[0]:.2f}" if c else "-" for c in cs[:40]))
print("ink px    :", " ".join(str(c[2]) if c else "-" for c in cs[:40]))
