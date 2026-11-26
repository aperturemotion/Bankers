# EACH CAMERA MOVE'S WHOOSH AGAINST THE PICTURE'S OWN MOTION (Timur, 2026-10-01: "ensure that the sfx are timed right").
# For every whoosh in the score as heard (out/sfx_cues.json, `sfxsheet.mjs --json`), finds the frame the picture moves MOST
# (the sweep's kept frames, out/sweep_frames — `sweep.mjs 1 --keep`; caption band and watermark masked, 5-frame mean) in the
# move's own stretch, and refuses any whoosh whose heard peak is more than LIMIT frames from it.
# Found on Video 3: every whoosh peaked 8–12 f late — placed on the move's midpoint while SETTLE peaks ~29% in.
#   python scratchpad/whooshsync.py            (exit 1 on a miss)
# ⚠ It judges CAMERA moves: a context whoosh (a sheet sliding, branches drawing) is judged only when its own motion dominates
# the frame, so those are listed as unjudged — never as passes.
import json, os, sys
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")   # the verdict's ✓ / ± crashed a cp1252 console after the judging had passed
LIMIT = 3
src = "out/sweep_frames"
cues = json.load(open("out/sfx_cues.json"))
if not any(c.get("cam") for c in cues): print("✗ REFUSED — no camera whooshes marked in out/sfx_cues.json (sfxsheet.mjs --json)"); sys.exit(1)
cache = {}
def load(i):
    if i not in cache: cache[i] = np.asarray(Image.open(os.path.join(src, f"element-{i:04d}.jpeg")).convert("L"), dtype=np.float32)
    return cache[i]
H, W = load(0).shape; k = W / 1080
mask = np.ones((H, W), bool); mask[: int(470 * k)] = False; mask[int(1700 * k):] = False
# ★ TWO MEASURES, because a move into a WHITE place floods the stage while the camera moves (Video 4): the RAW difference then
# peaks on the flood (takeA read −9 f), and the MEAN-REMOVED one reads the white field's radial light changing shape as motion
# (honestB read −7 f). Each is blind where the other is not, so a whoosh passes if EITHER agrees within the limit, and both
# offsets are printed. (The whooshes are placed analytically on SETTLE's peak; this measures that the picture agrees.)
def motion_raw(i): return float(np.abs(load(i) - load(i - 1))[mask].mean())
def motion_norm(i):
    a, b = load(i)[mask], load(i - 1)[mask]
    return float(np.abs((a - a.mean()) - (b - b.mean())).mean())

# canary: a synthetic motion curve peaking at 20 must be found at 20 (the finder, not the frames, is under test)
curve = np.exp(-((np.arange(60) - 20) ** 2) / 40.0); sm = np.convolve(curve, np.ones(5) / 5, mode="same")
if int(np.argmax(sm)) != 20: print("✗ REFUSED — the peak finder failed its canary"); sys.exit(1)

# ★ A MOVE UNDER A LENS BLOOM (Video.tsx FLARE, 2026-10-10) is judged against the LIGHT, not the motion: its camera move happens
# under the white, so the picture's "fastest frame" is whatever moved before the white-out (the type sliding away read 275 for a
# push at 293). Its whoosh must peak inside the BRIGHTENING: the frames where the mean luma's 5-frame climb is ≥ half its fastest.
def climb_span(lum):
    d = np.convolve(np.diff(lum), np.ones(5) / 5, mode="same")
    on = np.where(d >= 0.5 * d.max())[0]
    return int(on.min()) + 1, int(on.max()) + 1
# canaries: on a synthetic dark → white S over frames 20–50, a whoosh at 35 must pass and one at 12 must not
t = np.clip((np.arange(70) - 20) / 30.0, 0, 1); ramp = 40 + 210 * t * t * (3 - 2 * t)
ca, cb = climb_span(ramp)
if not (ca <= 35 <= cb) or (ca <= 12 <= cb): print(f"✗ REFUSED — the light judge failed its canaries (span {ca}–{cb})"); sys.exit(1)
def luma(i): return float(load(i)[mask].mean())

bad, unjudged, lit = [], [], []
print(" whoosh       heard  raw / mean-removed peak   offsets")
for c in [c for c in cues if c["kind"] == "move"]:
    if c.get("light"):
        a0, b0 = max(1, c["peak"] - 40), min(len(os.listdir(src)) - 1, c["peak"] + 30)
        la, lb = climb_span(np.array([luma(i) for i in range(a0, b0 + 1)]))
        la, lb = a0 + la, a0 + lb
        ok = la <= c["peak"] <= lb
        print(f" {c['s']:11s} {c['peak']:5d}  the bloom brightens {la}–{lb}   {'(on the light)' if ok else '  ✗'}")
        if not ok: bad.append(f"{c['s']}@{c['peak']} is outside its lens bloom's brightening {la}–{lb}")
        lit.append(f"{c['s']}@{c['peak']}")
        continue
    if not c.get("cam"): unjudged.append(f"{c['s']}@{c['peak']}"); continue
    a, b = max(1, c["peak"] - 30), min(len(os.listdir(src)) - 1, c["peak"] + 24)
    pks = []
    for fn in (motion_raw, motion_norm):
        m = np.array([fn(i) for i in range(a, b + 1)])
        sm = np.convolve(m, np.ones(5) / 5, mode="same")
        pks.append(a + int(np.argmax(sm)))
    offs = [c["peak"] - p for p in pks]
    # ARRIVE: the film opens mid-move. Its camera is fastest on the first frames; when the scene's own motion then outgrows it (Video 13:
    # the flatcars rolling), the camera's peak is the first local maximum of the raw motion in frames 1–12, and the whoosh is judged on that
    early = 1 + int(np.argmax([motion_raw(i) for i in range(1, 13)])) if c["peak"] < 12 else None
    # (a whoosh cannot start before frame 0, so the opening's peaks at ~8 at the earliest: it passes when the camera's own peak is < 6)
    ok = min(abs(o) for o in offs) <= LIMIT or (c["peak"] < 12 and (min(pks) < 6 or early < 6))
    print(f" {c['s']:11s} {c['peak']:5d}  {pks[0]:5d} / {pks[1]:5d}         {offs[0]:+d} / {offs[1]:+d} f {'' if ok else '  ✗'}")
    if not ok: bad.append(f"{c['s']}@{c['peak']} is {offs[0]:+d} / {offs[1]:+d} f from its move's peak")
print(f"unjudged (context whooshes under a camera move): {', '.join(unjudged)}")
if lit: print(f"judged on the light (a move under a lens bloom): {', '.join(lit)}")
if bad: print("✗ " + "; ".join(bad)); sys.exit(1)
print(f"✓ every camera-move whoosh within ±{LIMIT} f of its move's peak motion")
