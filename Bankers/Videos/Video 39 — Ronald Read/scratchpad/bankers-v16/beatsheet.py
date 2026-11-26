# a contact sheet of out/compare/<which>/*.png (5 across), or old|new side by side per beat:
#   python scratchpad/beatsheet.py old            -> out/compare/sheet_old.jpg
#   python scratchpad/beatsheet.py pairs [a b]    -> out/compare/pairs_NN.jpg (old left, new right, 3 beats per sheet)
import sys, glob, os
from PIL import Image, ImageDraw, ImageFont
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "out", "compare")
font = ImageFont.load_default()
def lab(im, t):
    d = ImageDraw.Draw(im); d.rectangle([0, 0, im.width, 22], fill=(0, 0, 0)); d.text((6, 5), t, fill=(255, 255, 255), font=font); return im
if sys.argv[1] in ("old", "new"):
    fs = sorted(glob.glob(os.path.join(root, sys.argv[1], "*.png")))
    W, H = 270, 480; cols = 7; rows = (len(fs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * W, rows * H), (40, 40, 40))
    for i, f in enumerate(fs):
        im = Image.open(f).convert("RGB").resize((W, H)); lab(im, os.path.basename(f)[:-4]); sheet.paste(im, ((i % cols) * W, (i // cols) * H))
    sheet.save(os.path.join(root, f"sheet_{sys.argv[1]}.jpg"), quality=88); print(len(fs), "frames")
else:
    old = sorted(glob.glob(os.path.join(root, "old", "*.png"))); per = 3
    for s in range(0, len(old), per):
        grp = old[s:s + per]; W, H = 405, 720
        sheet = Image.new("RGB", (len(grp) * (2 * W + 16), H), (90, 90, 90))
        for j, f in enumerate(grp):
            n = os.path.basename(f); nf = os.path.join(root, "new", n)
            a = lab(Image.open(f).convert("RGB").resize((W, H)), "OLD " + n[:-4])
            b = lab(Image.open(nf).convert("RGB").resize((W, H)), "NEW " + n[:-4]) if os.path.exists(nf) else Image.new("RGB", (W, H))
            x = j * (2 * W + 16); sheet.paste(a, (x, 0)); sheet.paste(b, (x + W, 0))
        out = os.path.join(root, f"pairs_{s // per + 1:02d}.jpg"); sheet.save(out, quality=88); print(out)
