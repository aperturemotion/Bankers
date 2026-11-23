# Screen-space camera shake from a rendered JPEG sequence: phase-correlate consecutive frames (upper 70%, above the
# caption band), then report the per-frame acceleration of that shift. A jittery camera reverses every frame or two.
#   python scratchpad/shake.py <dir> <from> <to> <scale>
import sys, glob, os
import numpy as np
from PIL import Image
d, lo, hi, sc = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), float(sys.argv[4])
files = sorted(glob.glob(os.path.join(d, "*.jpeg")))[lo:hi + 1]
def load(p):
    a = np.asarray(Image.open(p).convert("L"), dtype=np.float32)
    a = a[: int(a.shape[0] * 0.7)]
    return (a - a.mean()) * np.hanning(a.shape[0])[:, None] * np.hanning(a.shape[1])[None, :]
def shift(a, b):
    F = np.fft.fft2(a) * np.conj(np.fft.fft2(b)); F /= np.abs(F) + 1e-9
    r = np.fft.ifft2(F).real; i, j = np.unravel_index(np.argmax(r), r.shape)
    # sub-pixel: parabola through the peak's neighbours
    def sub(c, n, ax):
        m = [r[(i + (k if ax == 0 else 0)) % r.shape[0], (j + (k if ax == 1 else 0)) % r.shape[1]] for k in (-1, 0, 1)]
        den = m[0] - 2 * m[1] + m[2]; o = 0 if den == 0 else 0.5 * (m[0] - m[2]) / den
        c = c + o; return c - n if c > n / 2 else c
    return sub(i, r.shape[0], 0), sub(j, r.shape[1], 1)
fr = [load(p) for p in files]
v = np.array([shift(fr[k + 1], fr[k]) for k in range(len(fr) - 1)]) / sc   # full-res px / frame
a = np.diff(v, axis=0)
mag = np.hypot(a[:, 0], a[:, 1])
flips = int(np.sum((a[1:, 0] * a[:-1, 0] < 0) & (np.abs(a[1:, 0]) > 1) & (np.abs(a[:-1, 0]) > 1)))
print(f"frames {lo}-{hi}: speed max {np.hypot(v[:,0],v[:,1]).max():.1f} px/f   accel max {mag.max():.2f}  rms {np.sqrt((mag**2).mean()):.2f} px/f²   vertical reversals (>1 px/f²) {flips}")
