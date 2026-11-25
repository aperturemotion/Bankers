# -*- coding: utf-8 -*-
# V33 (2026-10-06, user: "look at any other visuals to ensure that they are correctly made") — every construction AT REST,
# at FULL resolution: for each beat, two settled frames (40% and 80% of its settled span) are cropped to the construction
# area and tiled 2 per row at 1:1, so joins, cut edges, missing parts and half-hidden labels can be read pixel for pixel.
#   python scratchpad/closeups33.py [dir=out/full5]
import os, sys, json
from PIL import Image, ImageDraw

d = sys.argv[1] if len(sys.argv) > 1 else "out/full5"
here = os.path.dirname(os.path.abspath(__file__))
B = json.load(open(os.path.join(here, "beats.json"), encoding="utf8"))["beats"]
CROP = (0, 380, 1080, 1480)
os.makedirs("out/sheets", exist_ok=True)
for b in B:
    a, z = b["enter"] + 24, b["gone"] - 14
    if z <= a: a, z = b["enter"], b["gone"]
    fr = [round(a + (z - a) * k) for k in (0.4, 0.8)]
    ims = [Image.open(os.path.join(d, f"element-{f:04d}.jpeg")).crop(CROP) for f in fr]
    s = Image.new("RGB", (2 * 1080 + 10, 1100 + 30), (255, 0, 255))
    dr = ImageDraw.Draw(s)
    for k, (f, im) in enumerate(zip(fr, ims)):
        s.paste(im, (k * 1090, 30)); dr.text((k * 1090 + 6, 6), f"{b['id']}  f{f}", fill=(255, 255, 255))
    s.save(f"out/sheets/cu_{b['id']}.png")
    print(f"out/sheets/cu_{b['id']}.png  frames {fr}")
