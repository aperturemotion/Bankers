# Tile rendered stills (out/v/f<N>.png) into labelled contact sheets for a sweep review.
#   python scratchpad/sheet.py <cols> <rows> <frame> <frame> ...
# Writes out/sheets/sheet_01.png, sheet_02.png, ... — each tile stamped with its frame number.
import sys, os
from PIL import Image, ImageDraw, ImageFont

cols, rows = int(sys.argv[1]), int(sys.argv[2])
frames = [int(x) for x in sys.argv[3:]]
os.makedirs("out/sheets", exist_ok=True)
for old in os.listdir("out/sheets"):
    os.remove(os.path.join("out/sheets", old))
per = cols * rows
try:
    font = ImageFont.truetype("arial.ttf", 34)
except OSError:
    font = ImageFont.load_default()
for s in range(0, len(frames), per):
    chunk = frames[s:s + per]
    first = Image.open(f"out/v/f{chunk[0]}.png")
    tw, th = first.size
    sheet = Image.new("RGB", (cols * tw + (cols - 1) * 8, rows * th + (rows - 1) * 8), (255, 0, 255))
    for i, fr in enumerate(chunk):
        im = Image.open(f"out/v/f{fr}.png").convert("RGB")
        x, y = (i % cols) * (tw + 8), (i // cols) * (th + 8)
        sheet.paste(im, (x, y))
        d = ImageDraw.Draw(sheet)
        d.rectangle([x, y, x + 150, y + 46], fill=(255, 0, 255))
        d.text((x + 8, y + 5), f"f{fr}", fill=(255, 255, 255), font=font)
    out = f"out/sheets/sheet_{s // per + 1:02d}.png"
    sheet.save(out)
    print("wrote", out, chunk)
