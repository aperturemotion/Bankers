# Contact sheet of the white lab's stills: one row per piece, one column per still in the folder (sorted).
#   python scratchpad/whitesheet.py out/whitelab/<tag> [scale=0.5] [crop=y0:y1]  → out/whitelab/<tag>/sheet.png
import sys, os, re
from PIL import Image, ImageDraw

d = sys.argv[1]
sc = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5
crop = tuple(map(int, sys.argv[3].split(":"))) if len(sys.argv) > 3 else (0, 1920)
files = sorted(f for f in os.listdir(d) if f.endswith(".png") and f != "sheet.png")
rows = {}
for f in files:
    rows.setdefault(f.split("_")[0], []).append(f)
cols = max(len(v) for v in rows.values())
W, H = int(1080 * sc), int((crop[1] - crop[0]) * sc)
sheet = Image.new("RGB", (cols * (W + 8) + 8, len(rows) * (H + 30) + 8), (40, 40, 40))
dr = ImageDraw.Draw(sheet)
for j, (k, fs) in enumerate(rows.items()):
    for i, f in enumerate(fs):
        im = Image.open(os.path.join(d, f)).convert("RGB").crop((0, crop[0], 1080, crop[1])).resize((W, H), Image.LANCZOS)
        x, y = 8 + i * (W + 8), 8 + j * (H + 30)
        sheet.paste(im, (x, y + 22))
        dr.text((x, y + 4), f, fill=(230, 230, 230))
sheet.save(os.path.join(d, "sheet.png"))
print(os.path.join(d, "sheet.png"), sheet.size)
