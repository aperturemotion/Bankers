# The VISUAL half of the full intersection sweep (Bankers/CLAUDE.md §3.5): tile the frames sweep.mjs --keep saved
# (out/sweep_frames/element-NNNN.jpeg, half size) into labelled contact sheets, for the shape-on-shape overlaps no
# probe measures. Frames are chosen densely through every scene change and more sparsely inside each place.
#   python scratchpad/sweepsheets.py <frame list file>      (one frame number per line; written by sweepframes.mjs)
import sys, os
from PIL import Image, ImageDraw, ImageFont

lst = [int(x) for x in open(sys.argv[1]).read().split()]
COLS, ROWS, TW = 6, 2, 300
src = "out/sweep_frames"
os.makedirs("out/sheets", exist_ok=True)
for old in os.listdir("out/sheets"):
    os.remove(os.path.join("out/sheets", old))
try:
    font = ImageFont.truetype("arialbd.ttf", 26)
except OSError:
    font = ImageFont.load_default()
per = COLS * ROWS
missing = [f for f in lst if not os.path.exists(f"{src}/element-{f:04d}.jpeg")]
if missing:
    sys.exit(f"frames not in {src}: {missing[:10]} — run sweep.mjs 1 --keep first")
for n in range(0, len(lst), per):
    chunk = lst[n:n + per]
    first = Image.open(f"{src}/element-{chunk[0]:04d}.jpeg")
    th = int(first.height * TW / first.width)
    sheet = Image.new("RGB", (COLS * TW, ROWS * th), (60, 60, 60))
    d = ImageDraw.Draw(sheet)
    for i, fr in enumerate(chunk):
        im = Image.open(f"{src}/element-{fr:04d}.jpeg").convert("RGB").resize((TW, th))
        x, y = (i % COLS) * TW, (i // COLS) * th
        sheet.paste(im, (x, y))
        d.rectangle([x, y, x + TW - 1, y + th - 1], outline=(255, 0, 255))
        d.rectangle([x + 2, y + 2, x + 84, y + 32], fill=(0, 0, 0))
        d.text((x + 6, y + 3), str(fr), fill=(255, 90, 90), font=font)
    sheet.save(f"out/sheets/sheet_{n // per + 1:02d}_{chunk[0]}-{chunk[-1]}.jpg", quality=88)
print(f"{(len(lst) + per - 1) // per} sheets, {len(lst)} frames -> out/sheets/")
