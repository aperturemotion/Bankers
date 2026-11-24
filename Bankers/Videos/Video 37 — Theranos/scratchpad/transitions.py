# THE MOTION SWEEP — every transition as a strip of frames (CLAUDE.md, OffCamCelebs 022: "a clean probe and clean
# per-beat stills can both miss what the user sees … sweep in MOTION as a standing step: frame strips across every
# transition"). Reads a renderFrames sequence (scratchpad/frames.mjs) and tiles, for each boundary, the frames
# from b-18 to b+18 every 3 — one row per transition, each tile stamped with its frame.
#   python scratchpad/transitions.py [seq=out/seqfull] [rows-per-sheet=4]
# The boundaries are DERIVED, never typed: every beat's enter/gone (scratchpad/beats.json, written by audit.mjs),
# every hero card's paint/end (src/bnx/captions.ts HEROES), and the two section breaks.
import sys, os, re, json
from PIL import Image, ImageDraw, ImageFont

seq = sys.argv[1] if len(sys.argv) > 1 else "out/seqfull"
per = int(sys.argv[2]) if len(sys.argv) > 2 else 4
beats = json.load(open("scratchpad/beats.json"))
cap = open("src/bnx/captions.ts", encoding="utf8").read()
i = cap.index("export const HEROES"); j = cap.index("= [", i) + 2
d = 0
for k in range(j, len(cap)):
    if cap[k] == "[": d += 1
    elif cap[k] == "]":
        d -= 1
        if d == 0: heroes = json.loads(cap[j:k + 1]); break
pts = {}
for b in beats["beats"]:
    pts.setdefault(b["enter"], []).append(f"{b['id']} in")
    pts.setdefault(b["gone"], []).append(f"{b['id']} out")
for h in heroes:
    pts.setdefault(h["paint"], []).append(f"hero {h['scene']}")
for br in beats["breaks"]:
    pts.setdefault(br, []).append("break")
# merge boundaries closer than 12 frames into one strip
bounds = []
for f in sorted(pts):
    if bounds and f - bounds[-1][0] < 12: bounds[-1][1].extend(pts[f])
    else: bounds.append([f, list(pts[f])])
files = {int(re.search(r"(\d+)", n).group(1)): os.path.join(seq, n) for n in os.listdir(seq) if n.endswith((".jpeg", ".jpg", ".png"))}
if not files: sys.exit(f"transitions.py: no frames in {seq}")
first = Image.open(next(iter(files.values())))
tw, th = first.size
try: font = ImageFont.truetype("arial.ttf", 16)
except OSError: font = ImageFont.load_default()
os.makedirs("out/trans", exist_ok=True)
for old in os.listdir("out/trans"): os.remove(os.path.join("out/trans", old))
offs = list(range(-18, 19, 3))
LBL = 150
for s in range(0, len(bounds), per):
    chunk = bounds[s:s + per]
    sheet = Image.new("RGB", (LBL + len(offs) * tw, len(chunk) * th), (255, 0, 255))
    dr = ImageDraw.Draw(sheet)
    for r, (b, names) in enumerate(chunk):
        dr.text((6, r * th + 6), f"{b}\n" + "\n".join(names[:6]), fill=(0, 0, 0), font=font)
        for c, o in enumerate(offs):
            f = b + o
            if f not in files: continue
            sheet.paste(Image.open(files[f]).convert("RGB"), (LBL + c * tw, r * th))
            dr.text((LBL + c * tw + 3, r * th + 2), str(f), fill=(255, 0, 255), font=font)
    out = f"out/trans/trans_{s // per + 1:02d}.png"
    sheet.save(out)
    print(out, [b for b, _ in chunk])
print(f"{len(bounds)} transitions")
