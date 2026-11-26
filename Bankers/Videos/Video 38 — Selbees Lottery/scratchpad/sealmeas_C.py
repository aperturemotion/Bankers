# builder C: measure the green Treasury seal on rendered stills (centre, horizontal/vertical outer radius) in 1080×1920 px
import sys, numpy as np
from PIL import Image
for fn in sys.argv[1:]:
    im = np.asarray(Image.open(fn).convert('RGB')).astype(int); H, Wd = im.shape[:2]; sc = 1920 / H
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    m = (g - r > 40) & (g - b > 15) & (g > 90)
    ys, xs = np.nonzero(m)
    if len(xs) < 50: print(fn, 'no seal'); continue
    # the biggest blob: keep pixels near the median, iterate
    cx, cy = np.median(xs), np.median(ys)
    for _ in range(4):
        d = np.hypot(xs - cx, ys - cy); R = np.percentile(d, 60) * 1.8
        k = d < R; cx, cy = xs[k].mean(), ys[k].mean()
    d = np.hypot(xs - cx, ys - cy); k = d < R
    x0, x1 = np.percentile(xs[k], [0.3, 99.7]); y0, y1 = np.percentile(ys[k], [0.3, 99.7])
    print(f"{fn}: c=({(x0+x1)/2*sc:.1f},{(y0+y1)/2*sc:.1f}) rx={(x1-x0)/2*sc:.1f} ry={(y1-y0)/2*sc:.1f}")
