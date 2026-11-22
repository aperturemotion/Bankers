# THE LOOK CHECK — does every place of a Bankers film sit in the series unnoticed? (Bankers/STYLE.md §15.3)
# Timur, 2026-10-07, Video 7: "Overall, the video doesn't really look like the past videos that we've made for bankers, something is
# off. Its something with the visuals used and the colors". Every other check was clean: they measure overlaps, motion and sound,
# never what a place LOOKS like next to the films before it.
#
# ★ ITS MAIN INSTRUMENT IS THE SHEET (out/lookcheck_sheet.jpg): one settled frame of every place of this film, in a row above the
# same for each of the last four films — the side-by-side comparison of §15.3, made in one command. LOOK at it.
# ★ THE NUMBERS ARE A REPORT, with one gate. Per place (median over 3 settled frames): coverage (the share of the construction zone,
# y 380–1470, the construction fills: brighter than the field on the dark stage, darker on the white), solid (pale lit faces on dark,
# luma > 165; blue solids and ink on white, < 150) and width, each with its rank among the last four films' places of that stage.
# The gate: a place EMPTIER than every place of the last four films (coverage under their minimum) is flagged.
# ⚠ MEASURED, 2026-10-07: pixel statistics do NOT separate the rejected first build of Video 7 from the accepted films — Video 4 is as
# dark and sparse by every one of these numbers. What was wrong was FLATNESS (a 2-D dot grid, a flat treemap, bare strokes) and the
# navy-on-navy wall, which only the eye on the sheet sees. So the numbers never pass a film on their own.
# Self-proof: the rejected build's dot grid (lookcheck_fixtures/v7old_teach_dots) must be flagged, and the reference films judged
# against each other must pass ≥ 90% of their places.
#   python Bankers/Resources/lookcheck.py "<video folder>"     (renders the film's settled stills at half size, ~3 min)
import json, os, re, subprocess, sys, glob, shutil
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
FF = r"C:\Users\Timur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"
ZONE = (190, 735)          # y 380–1470 at full size, on 540 × 960 frames

def places(video):
    out = subprocess.run(["node", os.path.join(HERE, "lookstills.mjs"), video, "places"], capture_output=True, text=True, encoding="utf8")
    if out.returncode: raise SystemExit(f"✗ REFUSED — could not read the journey of {video}:\n{out.stderr[-800:]}")
    return json.loads(out.stdout)

def samples(J):
    """3 settled frames per place: from its arrival's end (+6) to the next place's first frame (−4); the question is not a place"""
    P = [p for p in J["places"] if p["id"] != "question"]
    allp = J["places"]
    res = []
    for i, p in enumerate(P):
        nxt = allp[allp.index(p) + 1]["t0"] if allp.index(p) + 1 < len(allp) else J["total"]
        a, b = p["t0"] + p["dur"] + 6, nxt - 4
        if p["t0"] == 0: a = 30
        fr = [round(a + (b - a) * k) for k in (0.2, 0.5, 0.8)] if b - a >= 6 else [round((a + b) / 2)]
        res.append((p["id"], p["white"], fr))
    return res

def metrics(path, white):
    im = np.asarray(Image.open(path).convert("RGB").resize((540, 960)), dtype=np.float32)
    lum = 0.299 * im[..., 0] + 0.587 * im[..., 1] + 0.114 * im[..., 2]
    z = lum[ZONE[0]:ZONE[1]]
    cons = (z < 215) if white else (z > 85)
    solid = (z < 150) if white else (z > 165)
    xs = np.nonzero(cons)[1]
    width = (np.percentile(xs, 95) - np.percentile(xs, 5)) / 540 if len(xs) > 50 else 0.0
    return {"coverage": float(cons.mean()), "solid": float(solid.mean()), "width": float(width)}

def ref_frames(video, J, tmp):
    mp4s = [m for m in glob.glob(os.path.join(video, "out", "*.mp4")) if "solo" not in m and "probe" not in m]
    if not mp4s: return None
    mp4 = max(mp4s, key=os.path.getsize)
    S = samples(J)
    want = sorted({f for _, _, fr in S for f in fr})
    d = os.path.join(tmp, os.path.basename(video).split(" ")[1]); os.makedirs(d, exist_ok=True)
    sel = "+".join(f"eq(n\\,{f})" for f in want)
    subprocess.run([FF, "-v", "error", "-y", "-i", mp4, "-vf", f"select='{sel}',scale=540:960", "-fps_mode", "passthrough", os.path.join(d, "s%04d.jpg")], check=True)
    got = sorted(glob.glob(os.path.join(d, "s*.jpg")))
    if len(got) != len(want): raise SystemExit(f"✗ REFUSED — {mp4}: extracted {len(got)} frames, wanted {len(want)}")
    m = dict(zip(want, got))
    return [(pid, w, [m[f] for f in fr]) for pid, w, fr in S]

def place_stats(rows):
    return [(pid, w, {k: float(np.median([metrics(p, w)[k] for p in paths])) for k in ("coverage", "solid", "width")}) for pid, w, paths in rows]

def floors(stats):
    """the gate: the minimum coverage of the reference places, per stage"""
    return {w: min(m["coverage"] for _, ww, m in stats if ww == w) for w in (False, True)}

def judge(m, fl):
    return ["emptier than any place in the last four films"] if m["coverage"] < fl else []

def rank(v, xs):
    return 100.0 * sum(x <= v for x in xs) / len(xs)

def main():
    video = os.path.abspath(sys.argv[1])
    sheet = True
    n = int(re.search(r"Video (\d+)", os.path.basename(video)).group(1))
    vids = os.path.join(video, "..")
    refs = []
    for k in range(n - 4, n):
        hit = [d for d in glob.glob(os.path.join(vids, f"Video {k} *")) if os.path.isdir(d)]
        if hit: refs.append(hit[0])
    if len(refs) < 3: raise SystemExit("✗ REFUSED — fewer than three earlier films to compare with")
    tmp = os.path.join(video, "out", "lookcheck"); shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
    ref = {}
    for r in refs:
        rows = ref_frames(r, places(r), tmp)
        if rows: ref[os.path.basename(r)] = place_stats(rows)
    allref = [x for v in ref.values() for x in v]
    FL = floors(allref)
    # ── self-proof 1: each reference film against the other three ──
    passed = total = 0
    for name, st in ref.items():
        fl = floors([x for k, v in ref.items() if k != name for x in v])
        for pid, w, m in st:
            total += 1; passed += not judge(m, fl[w])
    if passed < 0.9 * total: raise SystemExit(f"✗ REFUSED — the reference films judge each other too harshly ({passed}/{total} pass): the gate is miscalibrated")
    # ── self-proof 2: the rejected first build's dot grid must be flagged ──
    fx = os.path.join(HERE, "lookcheck_fixtures", "v7old_teach_dots_f900.jpg")
    if not os.path.exists(fx): raise SystemExit("✗ REFUSED — fixture v7old_teach_dots_f900.jpg is missing")
    if not judge(metrics(fx, False), FL[False]): raise SystemExit("✗ REFUSED — the gate passes the rejected dot grid: it cannot see the defect it exists for")
    print(f"self-proof: the reference films pass each other {passed}/{total}; the rejected dot grid is flagged")
    print(f"gate: coverage under the last four films' minimum — dark {FL[False]:.3f}, white {FL[True]:.3f} ({', '.join(ref)})")
    # ── the film itself ──
    J = places(video)
    S = samples(J)
    want = sorted({f for _, _, fr in S for f in fr})
    sd = os.path.join(tmp, "film")
    r = subprocess.run(["node", os.path.join(HERE, "lookstills.mjs"), video, "stills", sd, *map(str, want)], capture_output=True, text=True, encoding="utf8")
    if r.returncode: raise SystemExit(f"✗ REFUSED — the stills failed:\n{r.stderr[-1200:]}")
    rows = [(pid, w, [os.path.join(sd, f"f{f}.jpg") for f in fr]) for pid, w, fr in S]
    st = place_stats(rows)
    flags = 0
    print(f"\n{os.path.basename(video)} — each place's median over its settled frames:")
    for pid, w, m in st:
        bad = judge(m, FL[w]); flags += bool(bad)
        xs = [mm for _, ww, mm in allref if ww == w]
        rk = {k: rank(m[k], [x[k] for x in xs]) for k in ("coverage", "solid", "width")}
        print(f"  {pid:9s} {'white' if w else 'dark '}  coverage {m['coverage']:.3f} (p{rk['coverage']:3.0f})  solid {m['solid']:.3f} (p{rk['solid']:3.0f})  width {m['width']:.3f} (p{rk['width']:3.0f})  {'⚑ ' + ', '.join(bad) if bad else ''}")
    if sheet:
        cols = []
        for name, rr in [(os.path.basename(video), rows)] + [(k, ref_frames(os.path.join(vids, k), places(os.path.join(vids, k)), tmp)) for k in ref]:
            cols.append((name, [paths[len(paths) // 2] for _, _, paths in rr]))
        w, h = 180, 320
        H = max(len(c[1]) for c in cols)
        img = Image.new("RGB", (w * H, (h + 18) * len(cols)), (16, 16, 16)); d = ImageDraw.Draw(img)
        for r_, (name, ps) in enumerate(cols):
            d.text((4, r_ * (h + 18) + 3), name, fill=(255, 220, 0))
            for c_, p in enumerate(ps): img.paste(Image.open(p).convert("RGB").resize((w, h)), (c_ * w, r_ * (h + 18) + 18))
        img.save(os.path.join(video, "out", "lookcheck_sheet.jpg"), quality=85)
        print(f"sheet → {os.path.join(video, 'out', 'lookcheck_sheet.jpg')}")
    print(f"\n{'no place is emptier than the last four films' if not flags else f'✗ {flags} place(s) emptier than anything in the last four films'} — now LOOK at the sheet: the numbers cannot tell a solid from a flat drawing")
    sys.exit(1 if flags else 0)

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
