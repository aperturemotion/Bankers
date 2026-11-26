# Consecutive-frame strips from a full-size sequence, for reviewing MOTION by eye (every frame, not every third).
#   python scratchpad/strip.py <dir> <from> <to> [step=1] [width=270] [cols=12] [crop=x0,y0,x1,y1] [out=out/sheets/strip.png]
import sys, os
from PIL import Image, ImageDraw
d, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
step = int(sys.argv[4]) if len(sys.argv) > 4 else 1
W = int(sys.argv[5]) if len(sys.argv) > 5 else 270
cols = int(sys.argv[6]) if len(sys.argv) > 6 else 12
crop = tuple(int(v) for v in sys.argv[7].split(",")) if len(sys.argv) > 7 and sys.argv[7] != "-" else None
out = sys.argv[8] if len(sys.argv) > 8 else "out/sheets/strip.png"
fr = list(range(a, b + 1, step))
ims = []
for f in fr:
    im = Image.open(os.path.join(d, f"element-{f:04d}.jpeg"))
    if crop: im = im.crop(crop)
    h = int(im.height * W / im.width)
    ims.append(im.resize((W, h), Image.LANCZOS))
h = ims[0].height
rows = (len(ims) + cols - 1) // cols
s = Image.new("RGB", (cols * (W + 4), rows * (h + 22)), (255, 0, 255))
dr = ImageDraw.Draw(s)
for i, (f, im) in enumerate(zip(fr, ims)):
    x, y = (i % cols) * (W + 4), (i // cols) * (h + 22)
    s.paste(im, (x, y + 22)); dr.text((x + 4, y + 4), str(f), fill=(255, 255, 255))
os.makedirs(os.path.dirname(out), exist_ok=True)
s.save(out)
print(out, s.size)
