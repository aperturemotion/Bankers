# -*- coding: utf-8 -*-
# ★★★★ E7's CHECK — DOES THE WORLD MOVE WHEN THE CAMERA DOES? (user, 2026-10-07: "right now it feels like the viewer just
#   stays on the same scene but the visuals simply change. It's supposed to feel like the place that they're watching the
#   visuals from is changing")
# For every hand-over move in the live plan (out/moves.json, written by cuedump.mjs), track the BACKGROUND's light across
# the move on the rendered frames and fail any move where it does not travel.
#   · The background is read in the band ABOVE the caption slot (y 0–240), where nothing built ever sits: there the image
#     is the world's light alone (the lift and the key cone of each place, whose cores sit at the top of the frame).
#   · Each frame's band is blurred (σ 24 px: the light, not its grain) and its brightness PROFILES (across, and down) are
#     aligned to the previous frame's by normalized cross-correlation. ⚠ Not phase correlation: whitening throws away the
#     smooth shape that IS a soft light (it read a real band moving 8 px a frame as 0.06 px; canary R caught it).
#   · TRAVEL counts only COHERENT motion (runs of ≥ 5 frames one way) ALONG THE MOVE'S OWN DIRECTION — the content's
#     direction for a truck or a crane; for a dolly, AWAY from the move's own centre (in) or toward it (out). A dissolve
#     between two lights in different places glides the light's mass whichever way they lie; direction-blind, the pre-fix
#     buyers → board pan read 191 px of "travel" AGAINST the pan.
#   · A move whose background travels less than 60 px, coherently (≥ 5 frames one way), is STATIC: the visuals changed in a
#     fixed room.
# It proves itself first: the same windows on the PRE-FIX frames (out/full4, rendered before E7, where the lights were
# pinned to the screen) must flag two dark-to-dark hand-overs (debt → write, dayone → nobuyer); a synthetic band shifted by a known
# path must measure it to ±15% (S), and a REAL dark frame's light band shifted the same way to ±20% (R).
#   python scratchpad/worldcheck.py <frames dir> [canary frames dir=out/full4] [canary moves=out/moves.json]
# ★ V35: the canary is V34's pre-fix frames, judged on V34's OWN plan (its moves.json), since a clone's plan has other places
import os, sys, json, math
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

SC = 4                               # read at quarter size
BANDS = [(0, 240)]                   # full-res rows ABOVE the caption slot only: below it a dive can swell content into the band
                                     # (the pre-fix ledger dive read as a 99-px "swell" there)
LIMIT = 60                           # px of COHERENT background travel a move must show

def band(path):
    im = Image.open(path).convert("L")
    w, h = im.size
    im = im.resize((w // SC, h // SC), Image.BILINEAR)
    a = np.asarray(im, dtype=np.float64)
    rows = np.concatenate([a[r0 // SC: r1 // SC] for r0, r1 in BANDS], axis=0)
    return gaussian_filter(rows, 24 / SC)

RUN = 5                              # frames a motion must hold one direction to count (a camera move, not a dissolve's jump)

def coherent(vs, ang=45, want=None):
    """net travel over the runs of ≥ RUN consecutive frames that move one way: a dissolve between two lights in different
    places makes the tracker JUMP for a frame or two (its first build counted that as travel: 235 px over a white dissolve
    on the pre-fix frames); a camera move is a sustained, one-directional drift"""
    total, run = 0.0, []
    def flush():
        nonlocal total
        if len(run) >= RUN:
            sx, sy = sum(v[0] for v in run), sum(v[1] for v in run)
            # ★ DIRECTION-AWARE: a camera move carries the world the way its content goes; a dissolve between two lights in
            #   different places glides the light's mass whichever way the two lights happen to lie (the pre-fix buyers →
            #   board pan read 191 px of "travel" that way, AGAINST the pan). Count only travel along the move's direction.
            total += math.hypot(sx, sy) if want is None else max(0.0, sx * want[0] + sy * want[1])
    for v in vs:
        ok = v is not None and math.hypot(*v) >= 1.0
        if ok and run:
            mx, my = sum(u[0] for u in run), sum(u[1] for u in run)
            c = (v[0] * mx + v[1] * my) / (math.hypot(*v) * math.hypot(mx, my) + 1e-9)
            ok = c >= math.cos(math.radians(ang))
        if ok: run.append(v)
        else:
            flush(); run = [v] if (v is not None and math.hypot(*v) >= 1.0) else []
    flush()
    return total

def prof_shift(a, b, maxs=12):
    """the shift (sub-pixel) that best aligns 1-D profile b to a, by normalized cross-correlation, and its peak.
    ★ NOT phase correlation: whitening throws away exactly what a soft light IS (its smooth shape) — on a real band shifted
    8 px a frame the phase tracker read 0.06 px (the real-band canary R caught it)"""
    a = a - a.mean(); b = b - b.mean()
    n = len(a)
    best, bs, sc = -2.0, 0, {}
    for s in range(-maxs, maxs + 1):
        x = a[max(0, -s): n - max(0, s)]; y = b[max(0, s): n - max(0, -s)]
        d = math.sqrt((x * x).sum() * (y * y).sum()) + 1e-9
        sc[s] = float((x * y).sum() / d)
        if sc[s] > best: best, bs = sc[s], s
    if -maxs < bs < maxs:
        m1, p1 = sc[bs - 1], sc[bs + 1]
        den = m1 - 2 * best + p1
        if den != 0: bs = bs + 0.5 * (m1 - p1) / den
    else:
        return bs, -1.0                          # pinned at the search limit: not an answer (it read −120 px on a flat ramp)
    return bs, best

def sharpness(a, b, s0, maxs=30):
    """how sharply the correlation peaks around shift s0: a smooth RAMP correlates almost equally at every shift and so
    carries no position; a bump of light peaks hard"""
    a = a - a.mean(); b = b - b.mean(); n = len(a)
    def ncc(s):
        x = a[max(0, -s): n - max(0, s)]; y = b[max(0, s): n - max(0, -s)]
        return float((x * y).sum() / (math.sqrt((x * x).sum() * (y * y).sum()) + 1e-9))
    c0 = ncc(int(round(s0)))
    return max(0.0, c0 - min(ncc(int(round(s0)) - 6), ncc(int(round(s0)) + 6)))

def travel(frames, want=None, swell=0, ox=540.0):
    """net coherent travel of the band's light (px, full res), and of the divergence of its two halves (a dolly's swell)"""
    vs, ds = [], []
    prev = None
    for b in frames:
        if prev is not None:
            px, py = prev.mean(axis=0), prev.mean(axis=1)
            # ★ a DOLLY moves the light AWAY from the move's own centre as the camera flies in (TOWARD it as it backs off),
            #   whichever side the light lies on: the TV dive (centre x 600) carried its light's peak from x 520 to 428,
            #   which a fixed direction, or the divergence of two halves (one of them dark), could not see
            w = px - px.min()
            cxl = float((w * np.arange(len(w))).sum() / (w.sum() + 1e-9)) * SC
            out_dir = 0.0 if abs(cxl - ox) < 40 else math.copysign(1.0, cxl - ox) * swell
            qx, qy = b.mean(axis=0), b.mean(axis=1)
            info = px.std() > 0.25 and qx.std() > 0.25          # a flat band carries no position (a uniform white)
            # ±30 quarter px (120 full) a frame: the last frames of a dive's ease-in move the light ~85 px a frame (at ±12 / ±8
            # the tracker could not follow them and the dives read static)
            dx, cx = prof_shift(px, qx, 30)
            dy, cy = prof_shift(py, qy, 24)
            vs.append((dx * SC, (dy if cy >= 0.6 else 0.0) * SC) if info and cx >= 0.6 else None)
            hw = len(px) // 2
            lx, cl = prof_shift(px[:hw], qx[:hw], 8)
            rx, cr = prof_shift(px[hw:], qx[hw:], 8)
            # each side of the centre on its own: a light balanced across it (the bid board's lift left, cone right) has its
            # mass AT the centre, and a single centroid saw no outward motion at all
            comps = []
            L = int(ox / SC)
            for lo, hi, sgn in ((0, L, -1.0), (L, len(px), 1.0)):
                if hi - lo >= 40 and px[lo:hi].std() > 0.25:
                    d_, c_ = prof_shift(px[lo:hi], qx[lo:hi], 30)
                    # weighted by how SHARPLY the side's correlation peaks: a broad ramp of light reads "no motion" at every
                    # shift (the TV dive's right side, averaged in, cut its measured swell from 287 px to 31)
                    if c_ >= 0.6: comps.append((sgn * d_, sharpness(px[lo:hi], qx[lo:hi], d_)))
            wsum = sum(w_ for _, w_ in comps)
            ds.append((sum(v_ * w_ for v_, w_ in comps) / wsum * SC * swell, 0.0) if (swell and comps and wsum > 0) else None)
        prev = b
    return coherent(vs, want=want), (coherent(ds, ang=10, want=(1.0, 0.0)) if swell else 0.0)

def frame_path(d, f):
    for name in (f"element-{f:04d}.jpeg", f"element-{f}.jpeg"):
        p = os.path.join(d, name)
        if os.path.exists(p): return p
    return None

MOVE_FX = {}
LIGHTS = []
PAIRED = []
def moves(src="out/moves.json"):
    MOVE_FX.clear(); PAIRED.clear()
    raw = json.load(open(src))
    m = raw["places"]
    LIGHTS[:] = [(l["a"], l["b"]) for l in raw["lights"]]
    for p in m:
        for half in ("enter", "exit"):
            if "fx" in p[half]: MOVE_FX[(p["id"], half)] = p[half]["fx"]
    out = []
    for p in m:
        for half in ("enter", "exit"):
            mv = p[half]
            if mv["k"] == "own": continue
            out.append((p["id"], half, mv["k"], mv["at"], mv["at"] + mv["dur"]))
    # a paired truck or crane is ONE move: keep it once (the exit half); and an entrance that opens WHILE the previous
    # place's dive is still running (a reveal, or an arrival out of the distance) is that dive's own continuation — the
    # match — judged with it, not on its own
    seen, uniq = set(), []
    for mv in sorted(out, key=lambda x: x[3]):
        key = (mv[3], mv[4])
        if key in seen: continue
        if mv[1] == "enter" and any(u[1] == "exit" and u[2] == "zoom" and u[3] <= mv[3] <= u[4] + 4 for u in uniq):
            PAIRED.append(mv); continue
        seen.add(key); uniq.append(mv)
    return uniq

# the way each move carries the world: a unit direction for a truck or a crane (the content's own direction of travel), the
# sign of the swell for a dolly (+1: the camera flies in, the light swells; −1: it backs away, the light shrinks)
EXPECT = {
    "panL": ((-1, 0), 0), "panFromR": ((-1, 0), 0), "panR": ((1, 0), 0), "panFromL": ((1, 0), 0),
    "craneUp": ((0, 1), 0), "fromAbove": ((0, 1), 0), "craneDown": ((0, -1), 0), "fromBelow": ((0, -1), 0),
    # a dolly scales the world about a point LOW in the frame (every zoom origin sits below y 775), so the light in the top
    # band also travels UP as the camera flies in and DOWN as it backs away — along with its sideways swell
    "zoom": ((0, -1), 1), "pushLight": ((0, -1), 1), "approach": ((0, -1), 1), "pull": ((0, 1), -1), "large": ((0, 1), -1),
}

def judge(d, mv):
    pid, half, k, a, b = mv
    fs = [frame_path(d, f) for f in range(a - 2, b + 3)]
    if any(p is None for p in fs): return None
    want, swell = EXPECT.get(k, (None, 0))
    bands = [band(p) for p in fs]
    ox = float(MOVE_FX.get((pid, half), 540))
    path, div = travel(bands, want, swell, ox)
    # ★ COVERED: a move under which the stage FLIPS (dark ↔ white) or a flare / LightBreak whites the band out — the tone
    #   change swamps the light, so it cannot be tracked through it (the crane into the white cash: band mean 11 → 238).
    #   Listed as covered, never silently passed; every dark-to-dark move must show its travel.
    means = [float(b.mean()) for b in bands]
    # (or a flare / LightBreak runs over at least 30% of the move: E7.6, the light covers it)
    under_light = any(min(b, lb) - max(a, la) >= 0.3 * (b - a) for la, lb in LIGHTS)
    covered = max(means) - min(means) > 60 or under_light
    return path + div, path, div, covered

# ── the canaries ──
def synthetic():
    rng = np.random.default_rng(5)
    base = gaussian_filter(rng.random((120, 600)) * 255, 8)
    fr = []
    for i in range(30):
        s = 2.0 * i                                      # 2 px/frame at quarter size → 8 px/frame full, 29 steps = 232 px
        fr.append(np.roll(base, int(round(s)), axis=1)[:, 150:420])
    p, _ = travel(fr)
    return p, 232.0

if __name__ == "__main__":
    d = sys.argv[1] if len(sys.argv) > 1 else "out/full5"
    can = sys.argv[2] if len(sys.argv) > 2 else "out/full4"
    got, want = synthetic()
    ok_syn = abs(got - want) <= 0.15 * want
    print(f"canary S (a synthetic band shifted {want:.0f} px): measured {got:.0f} px  {'✓' if ok_syn else '✗'}")
    # canary R: a REAL band (a dark frame's own soft light) shifted by a known path — what the S canary cannot prove
    rb = band(frame_path(can, 900))
    fr = [np.pad(rb, ((0, 0), (60, 60)), mode="edge")[:, 60 - 2 * i: 60 - 2 * i + rb.shape[1]] for i in range(30)]
    gr, _ = travel(fr)
    ok_real = abs(gr - 232) <= 0.2 * 232
    print(f"canary R (a real light band shifted 232 px): measured {gr:.0f} px  {'✓' if ok_real else '✗'}")
    ok_syn = ok_syn and ok_real
    CMV = moves(sys.argv[3] if len(sys.argv) > 3 else "out/moves.json")
    # the pre-fix frames: the in-scene trucks (one VO scene each side, so the old screen-pinned light never moved) must fail
    # (dark → dark on both sides: a canary under a stage flip would be "covered", and could prove nothing)
    must = [mv for mv in CMV if (mv[0], mv[2]) in (("debt", "panL"), ("dayone", "craneUp"))]
    ok_can = True
    for mv in must:
        r = judge(can, mv)
        if r is None: print(f"canary {mv[0]} {mv[2]}: frames missing in {can}"); ok_can = False; continue
        if r[3]: print(f"canary {mv[0]} {mv[2]}: its window is COVERED (a flip or a flash) — not a canary"); ok_can = False; continue
        flag = r[0] < LIMIT
        print(f"canary {mv[0]:8s} {mv[2]:9s} f{mv[3]}–{mv[4]} on the PRE-FIX frames: travel {r[0]:6.0f} px → {'STATIC ✓ (must be)' if flag else 'moves ✗ (must be static)'}")
        ok_can &= flag
    if not (ok_syn and ok_can and must):
        print("REFUSED: a canary came out wrong — the check is not to be trusted"); sys.exit(2)
    MV = moves()                     # this film's own plan (resets the lights and the dive origins)
    print()
    bad = 0
    for mv in MV:
        r = judge(d, mv)
        if r is None: print(f"  {mv[0]:8s} {mv[1]:5s} {mv[2]:9s} f{mv[3]}–{mv[4]}: frames missing"); bad += 1; continue
        tot, path, div, cov = r
        st = tot < LIMIT and not cov
        bad += st
        note = "  STATIC: the room stayed put" if st else ("  (covered: the stage flips or light covers the move)" if cov and tot < LIMIT else "")
        print(f"{'✗' if st else ('~' if cov and tot < LIMIT else ' ')} {mv[0]:8s} {mv[1]:5s} {mv[2]:9s} f{mv[3]:4d}–{mv[4]:4d}  background travel {tot:6.0f} px  (path {path:5.0f}, swell {div:5.0f}){note}")
    for mv in PAIRED: print(f"  {mv[0]:8s} {mv[1]:5s} {mv[2]:9s} f{mv[3]:4d}–{mv[4]:4d}  (the previous dive's continuation — judged with it)")
    print(f"\n{'✗ ' + str(bad) + ' move(s) with a static background' if bad else '✓ every hand-over moves the world: the background travels with the camera'}")
    sys.exit(1 if bad else 0)
