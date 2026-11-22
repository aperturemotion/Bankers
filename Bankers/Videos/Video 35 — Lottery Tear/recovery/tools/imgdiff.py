import sys, os, numpy as np
from PIL import Image
a_dir, b_dir = sys.argv[1], sys.argv[2]
for f in sorted(os.listdir(a_dir)):
    if not f.endswith('.png'): continue
    a = np.asarray(Image.open(os.path.join(a_dir, f)).convert('RGB')).astype(int)
    b = np.asarray(Image.open(os.path.join(b_dir, f)).convert('RGB')).astype(int)
    d = np.abs(a - b).max(axis=2)
    print(f, 'identical' if d.max() == 0 else f'maxdiff={d.max()} px>2:{(d>2).sum()} px>8:{(d>8).sum()} meanabs={np.abs(a-b).mean():.4f}')
