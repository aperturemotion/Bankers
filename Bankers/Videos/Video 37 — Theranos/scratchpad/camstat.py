# THE CAMERA, MEASURED ON A RENDERED FILM (2026-10-20, user on V39: "the camera mainly just sits still, or doesn't even follow any of
# the visuals … compare that to previous 100bps videos, for example the video about bob, or the one about nike").
#   python scratchpad/camstat.py <mp4> <label> [x0 y0 x1 y1 = the analysed window, full-frame px]
# Every frame pair at quarter size: 32-px tiles (128 px full) are block-matched by phase correlation, and a SIMILARITY (pan, tilt,
# zoom) is fitted to the textured tiles by iteratively re-weighted least squares — that is the camera. What is left in each tile
# after the camera is removed is the VISUALS moving on their own.
# Per film it prints: the share of frames the camera moves (> 0.5 px/f at full size, at the frame's edge), its median and p90
# speed, and the share of frames where the visuals animate (residual > 1 px/f) while the camera holds still — "not following".
# Canaries first: a synthetic pan must read as camera, a synthetic object moving on a still frame must read as visuals.
import subprocess, sys, json
import numpy as np

FF = __import__("os").environ.get("FFMPEG", r"C:\Users\Timur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe")
W, H, T = 270, 480, 32

def frames(mp4):
    p = subprocess.Popen([FF, "-v", "error", "-i", mp4, "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "gray", "-"], stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(W * H)
        if len(b) < W * H: break
        yield np.frombuffer(b, np.uint8).astype(np.float32)

WIN = np.outer(np.hanning(T), np.hanning(T))
def pc(a, b):
    A = np.fft.fft2((a - a.mean()) * WIN); B = np.fft.fft2((b - b.mean()) * WIN)
    R = A * np.conj(B); R /= np.abs(R) + 1e-6
    r = np.fft.ifft2(R).real
    y, x = np.unravel_index(r.argmax(), r.shape)
    # sub-pixel by parabola
    def sub(c, m, p): d = (m - p) / (2 * (m - 2 * c + p) + 1e-9); return d
    xs = sub(r[y, x], r[y, (x - 1) % T], r[y, (x + 1) % T]); ys = sub(r[y, x], r[(y - 1) % T, x], r[(y + 1) % T, x])
    dx = x + xs; dy = y + ys
    if dx > T / 2: dx -= T
    if dy > T / 2: dy -= T
    return dx, dy, r[y, x]

def pair(a, b, box):
    x0, y0, x1, y1 = box
    pts = []
    for ty in range(y0, y1 - T + 1, T // 2):
        for tx in range(x0, x1 - T + 1, T // 2):
            ta, tb = a[ty:ty + T, tx:tx + T], b[ty:ty + T, tx:tx + T]
            tex = ta.std()
            if tex < 6 or tb.std() < 6: continue
            dx, dy, pk = pc(tb, ta)
            if pk < 0.15: continue
            pts.append((tx + T / 2, ty + T / 2, dx, dy, tex))
    if len(pts) < 6: return None
    P = np.array(pts)
    cx, cy = W / 2, H / 2
    X = P[:, 0] - cx; Y = P[:, 1] - cy; U = P[:, 2]; V = P[:, 3]
    w = np.minimum(P[:, 4], 40)
    # similarity: u = tx + s*X, v = ty + s*Y  (small rotation ignored: the house camera does not roll)
    for _ in range(4):
        Aa = np.concatenate([np.stack([np.ones_like(X), np.zeros_like(X), X], 1), np.stack([np.zeros_like(X), np.ones_like(X), Y], 1)])
        bb = np.concatenate([U, V]); ww = np.concatenate([w, w])
        sol, *_ = np.linalg.lstsq(Aa * ww[:, None], bb * ww, rcond=None)
        res = np.hypot(U - (sol[0] + sol[2] * X), V - (sol[1] + sol[2] * Y))
        w = np.minimum(P[:, 4], 40) / (1 + (res / 0.6) ** 2)
    tx, ty, s = sol
    cam = (abs(tx) + abs(ty) + abs(s) * np.hypot(cx, cy)) * 4          # full-size px/f at the frame edge
    vis = float(np.percentile(res, 90)) * 4 if len(res) else 0.0         # full-size px/f, the visuals' own motion
    inl = float((res < 1.0).mean())
    return cam, vis, inl

def canaries():
    rng = np.random.default_rng(3)
    base = rng.normal(128, 40, (H + 40, W + 40)).astype(np.float32)
    base = np.clip(np.cumsum(np.cumsum(base, 0), 1) % 255, 0, 255)
    a = base[20:20 + H, 20:20 + W]; b = base[22:22 + H, 21:21 + W]          # a pan of (1, 2) px
    cam, vis, _ = pair(a, b, (0, 0, W, H))
    still = np.zeros((H, W), np.float32) + 10
    o1 = still.copy(); o1[200:260, 100:160] = base[:60, :60]
    o2 = still.copy(); o2[203:263, 103:163] = base[:60, :60]
    r = pair(o1, o2, (0, 0, W, H))
    ok = cam > 6 and vis < 2 and (r is None or r[0] < 2 or r[2] < 0.5)
    print(f"canaries: pan reads camera {cam:.1f} px/f (visuals {vis:.1f}); a lone moving object reads camera {('none' if r is None else f'{r[0]:.1f}')} → {'OK' if ok else 'REFUSED'}")
    if not ok: sys.exit(2)

if __name__ == "__main__":
    canaries()
    mp4, label = sys.argv[1], sys.argv[2]
    box = tuple(int(v) // 4 for v in sys.argv[3:7]) if len(sys.argv) >= 7 else (0, 300 // 4, W, 1700 // 4)
    rows = []; prev = None
    for i, fr in enumerate(frames(mp4)):
        if prev is not None:
            r = pair(prev, fr, box)
            rows.append((i, *r) if r else (i, None, None, None))
        prev = fr
    json.dump(rows, open(f"out/camstat_{label}.json", "w"))
    valid = [r for r in rows if r[1] is not None]
    cam = np.array([r[1] for r in valid]); vis = np.array([r[2] for r in valid])
    mv = cam > 0.5
    anim = vis > 1.0
    print(f"{label}: {len(rows)} pairs, {len(valid)} measurable | camera moving {mv.mean()*100:.0f}% of frames | camera speed median {np.median(cam):.2f} p90 {np.percentile(cam,90):.2f} px/f | visuals animate {anim.mean()*100:.0f}% | animate with camera STILL {(anim & ~mv).mean()*100:.0f}% | still on still {(~anim & ~mv).mean()*100:.0f}%")
