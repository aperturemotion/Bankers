# compare frames of the rendered MP4 with FRESH full-size stills of the same frames (48-px tiles, mean grey difference).
# canary A: a still against itself re-encoded must be clean; canary B: a 96-px patch forced to the extreme must be flagged.
import subprocess, sys, io
import numpy as np
from PIL import Image
FF = __import__("os").environ.get("FFMPEG", r"C:\Users\Timur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe")
MP4 = "out/bre_x_gold.mp4"; FPS = 30; LIM = 18
frames = [int(x) for x in sys.argv[1:]]
def grab(f):
    raw = subprocess.run([FF, "-v", "error", "-i", MP4, "-vf", f"select=eq(n\,{f})", "-vsync", "0", "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True, check=True).stdout
    return np.asarray(Image.open(io.BytesIO(raw)).convert("L"), np.float32)
def tiles(a, b):
    h, w = a.shape; n = 48
    d = np.abs(a[: h - h % n, : w - w % n] - b[: h - h % n, : w - w % n]).reshape(h // n, n, w // n, n).mean(axis=(1, 3))
    return d.max(), int((d > LIM).sum())
def fresh(f): return np.asarray(Image.open(f"out/v/f{f}.png").convert("L"), np.float32)
s0 = fresh(frames[0]); buf = io.BytesIO(); Image.fromarray(s0.astype(np.uint8)).save(buf, "JPEG", quality=80)
A = np.asarray(Image.open(buf).convert("L"), np.float32)
B = s0.copy(); B[400:496, 400:496] = 255 - B[400:496, 400:496]
if tiles(s0, A)[1] != 0 or tiles(s0, B)[1] == 0: sys.exit("✗ REFUSED — the judge failed its canaries")
print("canaries OK")
bad = 0
for f in frames:
    m, n = tiles(grab(f), fresh(f)); bad += n > 0
    print(f"f{f:5d}  worst tile {m:5.1f}  tiles over {LIM}: {n}")
print(f"{bad} of {len(frames)} frames differ")
