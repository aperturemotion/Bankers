import sys, os
from PIL import Image, ImageDraw
fs = sys.argv[2:]; out = sys.argv[1]
ims = [Image.open(f"out/s/f{f}.png") for f in fs if os.path.exists(f"out/s/f{f}.png")]
w, h = ims[0].size; cols = min(5, len(ims)); rows = (len(ims) + cols - 1) // cols
S = Image.new("RGB", (cols * w, rows * h), "black"); d = ImageDraw.Draw(S)
for i, (f, im) in enumerate(zip([f for f in fs if os.path.exists(f"out/s/f{f}.png")], ims)):
    S.paste(im, ((i % cols) * w, (i // cols) * h)); d.text(((i % cols) * w + 8, (i // cols) * h + 8), f, fill="yellow")
S.save(out)
