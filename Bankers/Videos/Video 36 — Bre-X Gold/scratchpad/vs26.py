# The brief's style check: a contact sheet of THIS build (one frame every 2 s) above one of Video 26, the 10-year yield film
# (the style precedent). "Any frame that wouldn't fit inside the 10-year video gets rebuilt."
#   python scratchpad/vs26.py <v36 frames dir (element-NNNN.jpeg, full size)> <v26 sheet frames dir (f_NNN.png, every 2 s)> <out.png>
import sys, glob, os, re
from PIL import Image, ImageDraw

d36, d26, out = sys.argv[1], sys.argv[2], sys.argv[3]
W, H, COLS = 162, 288, 14
f36 = sorted(glob.glob(os.path.join(d36, "element-*.jpeg")), key=lambda p: int(re.findall(r"(\d+)\.jpeg$", p)[0]))
pick36 = [p for p in f36 if int(re.findall(r"(\d+)\.jpeg$", p)[0]) % 60 == 0]
pick26 = sorted(glob.glob(os.path.join(d26, "f_*.png")))
if not pick36 or not pick26:
    sys.exit("✗ no frames found — refusing to write an empty sheet")
def block(paths, label):
    rows = (len(paths) + COLS - 1) // COLS
    im = Image.new("RGB", (W * COLS, 30 + (H + 14) * rows), "white")
    d = ImageDraw.Draw(im)
    d.text((6, 8), label, fill="black")
    for i, p in enumerate(paths):
        x, y = (i % COLS) * W, 30 + (i // COLS) * (H + 14)
        im.paste(Image.open(p).convert("RGB").resize((W, H)), (x, y + 14))
        d.text((x + 3, y + 1), f"{i * 2}s", fill="black")
    return im
a = block(pick36, f"VIDEO 37 — The Worst Market Timer in History ({len(pick36)} frames, one every 2 s)")
b = block(pick26, f"VIDEO 26 — The price of money (the 10-year yield), the style precedent ({len(pick26)} frames, one every 2 s)")
sheet = Image.new("RGB", (max(a.width, b.width), a.height + b.height + 20), "white")
sheet.paste(a, (0, 0)); sheet.paste(b, (0, a.height + 20))
sheet.save(out)
print(f"✓ {out}: {len(pick36)} + {len(pick26)} frames")
