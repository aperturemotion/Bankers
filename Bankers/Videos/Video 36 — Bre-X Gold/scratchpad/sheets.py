# Tile the sentence stills (out/v/sNN_scene.png, from still.mjs with no args) into labelled
# contact sheets for a sweep review.   python scratchpad/sheets.py [cols=5] [rows=2] [width=300]
import sys, os, glob
from PIL import Image, ImageDraw, ImageFont

cols = int(sys.argv[1]) if len(sys.argv) > 1 else 5
rows = int(sys.argv[2]) if len(sys.argv) > 2 else 2
tw = int(sys.argv[3]) if len(sys.argv) > 3 else 300
files = sorted(glob.glob("out/v/s[0-9][0-9]_*.png"))
os.makedirs("out/sheets", exist_ok=True)
for old in os.listdir("out/sheets"):
    os.remove(os.path.join("out/sheets", old))
try:
    font = ImageFont.truetype("arial.ttf", 22)
except OSError:
    font = ImageFont.load_default()
per = cols * rows
for n in range(0, len(files), per):
    chunk = files[n:n + per]
    first = Image.open(chunk[0])
    th = int(first.height * tw / first.width)
    sheet = Image.new("RGB", (cols * tw, rows * th), (40, 40, 40))
    d = ImageDraw.Draw(sheet)
    for i, fp in enumerate(chunk):
        im = Image.open(fp).convert("RGB").resize((tw, th))
        x, y = (i % cols) * tw, (i // cols) * th
        sheet.paste(im, (x, y))
        d.rectangle([x, y, x + tw - 1, y + th - 1], outline=(90, 90, 90))
        d.text((x + 6, y + 4), os.path.basename(fp)[:-4], fill=(255, 80, 80), font=font)
    out = f"out/sheets/sheet_{n // per + 1:02d}.png"
    sheet.save(out)
    print("wrote", out, len(chunk))
