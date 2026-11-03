# contact sheet: python sheet.py out.png scale cols file1 file2 ...  (labels each tile with its file name)
import sys
from PIL import Image, ImageDraw
out, sc, cols = sys.argv[1], float(sys.argv[2]), int(sys.argv[3])
fs = sys.argv[4:]
ims = [Image.open(f).convert("RGB") for f in fs]
w, h = int(ims[0].width * sc), int(ims[0].height * sc)
rows = (len(ims) + cols - 1) // cols
S = Image.new("RGB", (w * cols, h * rows), (0, 0, 0))
for i, (im, f) in enumerate(zip(ims, fs)):
    t = im.resize((w, h))
    d = ImageDraw.Draw(t); d.text((6, 6), f.split("/")[-1].split("\\")[-1], fill=(255, 80, 80))
    S.paste(t, ((i % cols) * w, (i // cols) * h))
S.save(out)
