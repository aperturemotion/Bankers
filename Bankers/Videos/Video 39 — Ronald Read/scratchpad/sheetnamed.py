# Tile every out/v/*.png (sorted by name) into labelled contact sheets.
#   python scratchpad/sheetnamed.py [cols] [rows] [scale] [prefix]
# Writes out/sheets/named_01.png … — each tile stamped with its file name.
import sys, os, glob
from PIL import Image, ImageDraw, ImageFont

cols = int(sys.argv[1]) if len(sys.argv) > 1 else 5
rows = int(sys.argv[2]) if len(sys.argv) > 2 else 2
scale = float(sys.argv[3]) if len(sys.argv) > 3 else 0.6
prefix = sys.argv[4] if len(sys.argv) > 4 else ""
files = sorted(glob.glob(f"out/v/{prefix}*.png"))
os.makedirs("out/sheets", exist_ok=True)
for old in glob.glob("out/sheets/named_*.png"):
    os.remove(old)
try:
    font = ImageFont.truetype("arial.ttf", 22)
except OSError:
    font = ImageFont.load_default()
per = cols * rows
for s in range(0, len(files), per):
    chunk = files[s:s + per]
    first = Image.open(chunk[0])
    tw, th = int(first.size[0] * scale), int(first.size[1] * scale)
    sheet = Image.new("RGB", (cols * tw + (cols - 1) * 6, rows * th + (rows - 1) * 6), (255, 0, 255))
    for i, fp in enumerate(chunk):
        im = Image.open(fp).convert("RGB").resize((tw, th))
        x, y = (i % cols) * (tw + 6), (i // cols) * (th + 6)
        sheet.paste(im, (x, y))
        d = ImageDraw.Draw(sheet)
        name = os.path.splitext(os.path.basename(fp))[0]
        d.rectangle([x, y, x + 12 * len(name) + 10, y + 30], fill=(255, 0, 255))
        d.text((x + 5, y + 3), name, fill=(255, 255, 255), font=font)
    out = f"out/sheets/named_{s // per + 1:02d}.png"
    sheet.save(out)
    print(out)
