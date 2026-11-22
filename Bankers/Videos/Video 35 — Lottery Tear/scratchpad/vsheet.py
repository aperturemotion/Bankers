"""vsheet.py — tile out/v/f*.png into contact sheets (7 across), each tile labelled with its frame
  python scratchpad/vsheet.py [out_prefix] [frames...]"""
import sys, glob, os, re
from PIL import Image, ImageDraw

pref = sys.argv[1] if len(sys.argv) > 1 else "out/sheet_v"
want = set(int(x) for x in sys.argv[2:]) if len(sys.argv) > 2 else None
files = sorted(glob.glob("out/v/f*.png"), key=lambda p: int(re.findall(r"f(\d+)", p)[0]))
if want: files = [p for p in files if int(re.findall(r"f(\d+)", p)[0]) in want]
W, H, COLS = 270, 480, 7
for s in range(0, len(files), COLS * 2):
    chunk = files[s:s + COLS * 2]
    rows = (len(chunk) + COLS - 1) // COLS
    sheet = Image.new("RGB", (W * COLS, H * rows), "black")
    for i, p in enumerate(chunk):
        im = Image.open(p).convert("RGB").resize((W, H), Image.LANCZOS)
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 64, 16], fill=(255, 0, 0))
        d.text((3, 2), re.findall(r"f(\d+)", p)[0], fill=(255, 255, 255))
        sheet.paste(im, ((i % COLS) * W, (i // COLS) * H))
    out = f"{pref}{s // (COLS * 2) + 1}.jpg"
    sheet.save(out, quality=88)
    print(out)
