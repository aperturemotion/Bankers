# Tile a folder of every-2-s frames into labelled contact sheets.
#   python scratchpad/tile2s.py <srcDir> <prefix> <outPrefix> [cols=10] [rows=2] [step_s=2]
import sys, os
from PIL import Image, ImageDraw, ImageFont

src, prefix, outp = sys.argv[1], sys.argv[2], sys.argv[3]
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 10
rows = int(sys.argv[5]) if len(sys.argv) > 5 else 2
step = float(sys.argv[6]) if len(sys.argv) > 6 else 2.0
files = sorted(f for f in os.listdir(src) if f.startswith(prefix))
try:
    font = ImageFont.truetype("arial.ttf", 22)
except OSError:
    font = ImageFont.load_default()
per = cols * rows
os.makedirs(os.path.dirname(outp) or ".", exist_ok=True)
for s in range(0, len(files), per):
    chunk = files[s:s + per]
    first = Image.open(os.path.join(src, chunk[0]))
    tw, th = first.size
    sheet = Image.new("RGB", (cols * tw + (cols - 1) * 6, rows * th + (rows - 1) * 6), (60, 60, 60))
    d = ImageDraw.Draw(sheet)
    for i, fn in enumerate(chunk):
        im = Image.open(os.path.join(src, fn)).convert("RGB").resize((tw, th))
        x, y = (i % cols) * (tw + 6), (i // cols) * (th + 6)
        sheet.paste(im, (x, y))
        t = (s + i) * step
        d.rectangle([x, y, x + 74, y + 28], fill=(200, 0, 120))
        d.text((x + 5, y + 2), f"{t:.0f}s", fill=(255, 255, 255), font=font)
    out = f"{outp}_{s // per + 1:02d}.jpg"
    sheet.save(out, quality=85)
    print("wrote", out, len(chunk))
