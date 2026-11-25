# Shows popscan.py's findings as image strips: for each listed frame, the frames t-1 … t+2 (half size, kept sweep frames) cropped
# around that frame's flagged tiles, labelled — the eye judges what the scan could not.
#   python scratchpad/popview.py 96 552 1636      -> out/closeups/pop_<t>.png
import re, sys
from PIL import Image, ImageDraw
rows = [l for l in open("out/popscan.txt", encoding="utf8") if l.startswith(("VANISH", "POP", "BLIP", "STEP"))]
for t in map(int, sys.argv[1:]):
    boxes = []
    for l in rows:
        m = re.search(r"frame (\d+) .*x (\d+)–(\d+), y (\d+)–(\d+)", l)
        if m and int(m.group(1)) == t: boxes.append(tuple(int(v) // 2 for v in m.groups()[1:]))
    if not boxes: print(t, "no finding"); continue
    x0 = max(0, min(b[0] for b in boxes) - 60); x1 = min(540, max(b[1] for b in boxes) + 60)
    y0 = max(0, min(b[2] for b in boxes) - 60); y1 = min(960, max(b[3] for b in boxes) + 60)
    ims = [Image.open(f"out/sweep_frames/element-{f:04d}.jpeg").convert("RGB").crop((x0, y0, x1, y1)) for f in range(t - 1, t + 3)]
    w, h = ims[0].size; s = min(2.0, 600 / h)
    S = Image.new("RGB", (int(w * s) * 4 + 30, int(h * s)), (255, 0, 255)); d = ImageDraw.Draw(S)
    for i, im in enumerate(ims):
        S.paste(im.resize((int(w * s), int(h * s))), (i * (int(w * s) + 10), 0)); d.text((i * (int(w * s) + 10) + 4, 4), str(t - 1 + i), fill=(255, 60, 60))
    S.save(f"out/closeups/pop_{t}.png"); print(t, "->", S.size)
