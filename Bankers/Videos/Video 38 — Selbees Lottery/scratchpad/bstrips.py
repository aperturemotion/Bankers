# every-other-frame strips around each scene boundary, several boundaries per sheet
import sys, os
from PIL import Image, ImageDraw
d = sys.argv[1]; bs = [int(x) for x in sys.argv[2].split(",")]; out = sys.argv[3]
W = 150; pre, post, step = 14, 18, 2
rows = []
for b in bs:
    fr = list(range(b - pre, b + post + 1, step))
    ims = [Image.open(os.path.join(d, f"element-{f:04d}.jpeg")).crop((0, 300, 1080, 1520)).resize((W, int(1220 * W / 1080))) for f in fr]
    rows.append((b, fr, ims))
h = rows[0][2][0].height
s = Image.new("RGB", (len(rows[0][1]) * (W + 3), len(rows) * (h + 16)), (255, 0, 255))
dr = ImageDraw.Draw(s)
for r, (b, fr, ims) in enumerate(rows):
    for i, (f, im) in enumerate(zip(fr, ims)):
        x, y = i * (W + 3), r * (h + 16)
        s.paste(im, (x, y + 16)); dr.text((x + 2, y + 2), str(f), fill=(255, 255, 255) if f != b else (255, 255, 0))
s.save(out); print(out, s.size)
