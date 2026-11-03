"""THE HOOK'S OWN SOUNDS (Timur, 2026-10-29: "find the right sound effects for the hook scene, make sure they're not too loud but more
subtle and in the background"; 2026-10-30: "It should be more continuous and more subtle for the car engine sound and the … air things on
the car that let it fly. It should be more continuous throughout the hook scene and more subtle … not just abrupt and disappearing so
quickly"). The Epidemic pack has no car sounds, so the ElevenLabs takes (eleven_text_to_sound_v2, flow RL1VvPTamCNaR7LDBAFc;
scratchpad/sfx-src/, SOURCE.txt) are laid on the hook's own frames in ONE file, public/sfx21/hook.wav, played on its own <Audio> from
frame 0 (the kit's SfxLayer is canonical). Nothing is synthesized: every layer is a recorded take, re-timed.
  python scratchpad/mkhooksfx21.py <leave> <jets0> <jets1> <land> <drive0> <fire0> <swell0> <lift1>
It writes src/tsla/hooksfx.gen.ts with the frames it was built on; Video.tsx REFUSES if the hook's TIMES move away from them.

hook.wav (2026-10-30), all of it under the voice:
  1 · THE MOTOR BED — continuous from frame 0 to the hook's end (~frame 300). The electric whine takes (ramp_b, ramp_a) are only ~0.7 s
      steady, so the bed is woven from them as overlapping grains (0.5 s, half-overlapped, each from a random spot of the steady part) under
      SINE windows: sin² + cos² = 1, an EQUAL-POWER crossfade at every join, so there is no seam and no flutter. Each grain is played at the
      motor's speed (a resample: an electric motor's whine rises with its speed), so the pitch climbs up the ramp, holds in the air, falls as
      it brakes, and idles low on the pad. Its level swells gently up the ramp and eases back after the landing; it fades in over 0.3 s on
      frame 0 and out over 1.5 s at the hook's end.
  2 · THE THRUSTERS — one continuous cold-gas hiss (jets_a: 2.4 s steady), from a little before the jets light through the flight to just
      after the landing: a 0.45-s fade in, a 0.6-s fade out, never a hard start or stop.
  3 · THE LANDING — the rear tyres' thump on touchdown and a softer one as the nose comes down (land_a, low-passed, quiet).
  4 · THE LINE-UP — a soft whir as the cars roll off (driveoff_b), thinning as they go into the fog.
Levels are RMS of each layer's loud part; the whole file is held under a CEILING (−24 dBFS, below the old −20)."""
import os, subprocess, sys
import numpy as np
FF = os.environ.get("FFMPEG") or r"C:\Users\Timur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"
SR, FPS = 48000, 30
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(root, "scratchpad", "sfx-src")
leave, jets0, jets1, land, drive0 = (int(a) for a in sys.argv[1:6])
LEN = 11.0   # the hook and its hand-over (the file is silent after its last sound)
HOOK_END = 300   # the hook's last frame on screen (the slide carries it out by ~frame 300): the bed is faded out by then

def load(name):
    raw = subprocess.run([FF, "-v", "error", "-i", os.path.join(src, name), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)
def rms_db(x): return 20 * np.log10(max(1e-9, np.sqrt(np.mean(x ** 2))))
def fade(x, fin, fout):
    x = x.copy(); a, b = int(fin * SR), int(fout * SR)
    if a: x[:a] *= np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    if b: x[-b:] *= np.cos(np.linspace(0, np.pi / 2, b)) ** 2
    return x
def lowpass(x, hz):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / hz) ** 8)   # 4th-order roll-off: further away, softer edges
    return np.fft.irfft(X, len(x))
def highpass(x, hz):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (hz / np.maximum(f, 1e-3)) ** 4)
    return np.fft.irfft(X, len(x))
def level(x, target_db):
    loud = x[np.abs(x) > np.abs(x).max() * 0.05] if np.abs(x).max() > 0 else x
    return x * 10 ** ((target_db - rms_db(loud)) / 20)
def norm_rms(x):
    """scale a steady source to 0 dB RMS (so the envelope below sets its level directly)"""
    return x / (np.sqrt(np.mean(x ** 2)) + 1e-12)
def curve(t, keys):
    """a smooth (cosine-eased) curve through (time s, value) keys"""
    ks = sorted(keys); out = np.empty_like(t)
    for i, tt in enumerate(t):
        if tt <= ks[0][0]: out[i] = ks[0][1]; continue
        if tt >= ks[-1][0]: out[i] = ks[-1][1]; continue
        for (t0, v0), (t1, v1) in zip(ks, ks[1:]):
            if t0 <= tt <= t1:
                u = (tt - t0) / (t1 - t0); out[i] = v0 + (v1 - v0) * (0.5 - 0.5 * np.cos(np.pi * u)); break
    return out

out = np.zeros(int(LEN * SR))
def place(x, frame):
    i = int(round(frame / FPS * SR)); j = min(len(out), i + len(x)); out[i:j] += x[: j - i]
F = lambda fr: fr / FPS   # frames → seconds
rng = np.random.default_rng(21)

# ── 1 · THE MOTOR BED: grains of the steady whine, equal-power woven, played at the motor's speed ──
def weave(source, dur, rate_at, grain=0.5):
    """a continuous texture `dur` s long from `source` (a steady stretch): sine-windowed grains, hop = grain/2, each from a random spot,
    each resampled by the rate at its centre. sin²+cos²=1 across every overlap (equal power for uncorrelated grains)."""
    G = int(grain * SR); H = G // 2; n = int(dur * SR) + G
    y = np.zeros(n); w = np.sin(np.pi * (np.arange(G) + 0.5) / G)   # sine window: w[k]² + w[k+H]² = 1
    for s in range(0, n - G, H):
        rho = rate_at((s + H) / SR)
        need = int(G * rho) + 2
        if need >= len(source): need = len(source) - 1
        o = rng.integers(0, len(source) - need)
        seg = source[o:o + need]
        g = np.interp(np.arange(G) * rho, np.arange(len(seg)), seg)   # resampled: rho > 1 is higher (faster motor)
        y[s:s + G] += g * w
    return y[: int(dur * SR)]
whine = norm_rms(highpass(load("ramp_b.mp3")[int(0.06 * SR): int(0.74 * SR)], 120))
body = norm_rms(highpass(load("ramp_a.mp3")[int(0.03 * SR): int(0.46 * SR)], 60))
stop = land + 24   # (the car stops ~24 frames after touchdown)
bed_end = F(HOOK_END)
# the motor's speed as a playback rate (the take's own pitch = 1): rising up the ramp with the car's speed (18 → 47 px/f), the motors
# easing off in the air, the regen whine falling as it brakes, an idle on the pad
rate = lambda t: float(curve(np.array([t]), [(0, 0.78), (F(leave), 1.08), (F(land), 1.0), (F(stop), 0.72), (bed_end, 0.7)])[0])
dur = bed_end + 0.05
bed = lowpass(weave(whine, dur, rate), 2600) * 0.55 + lowpass(weave(body, dur, lambda t: 0.55 * rate(t)), 900) * 0.8
tt = np.arange(len(bed)) / SR
# its level (dB RMS): a gentle swell up the ramp, a hold in the air, easing back after the landing, low under the payoff
lev = curve(tt, [(0, -47), (F(leave), -42.5), (F(land) - 0.3, -44), (F(land) + 0.4, -45), (F(stop) + 0.5, -49.5), (F(drive0), -51), (bed_end, -52)])
bed = norm_rms(bed) * 10 ** (lev / 20)
bed = fade(bed, 0.3, 1.5)
place(bed, 0)

# ── 2 · THE THRUSTERS: one continuous hiss from just before the jets light to just after the landing ──
h0, h1 = jets0 - 6, land + 10
hiss = lowpass(highpass(load("jets_a.mp3")[int(0.15 * SR): int(2.55 * SR)], 300), 5200)
need = int(F(h1 - h0) * SR)
if len(hiss) < need: sys.exit(f"jets_a is {len(hiss) / SR:.2f} s of steady hiss; the hook needs {need / SR:.2f} s")
hiss = norm_rms(hiss[:need])
th = np.arange(need) / SR
# (a little fuller while the main jets burn, easing as they cut before the touchdown)
hl = curve(th, [(0, -48), (F(jets0 + 8 - h0), -45.5), (F(jets1 - h0), -46), (F(h1 - h0), -49)])
hiss = fade(hiss * 10 ** (hl / 20), 0.45, 0.6)
place(hiss, h0)

# ── 3 · THE LANDING: the rear tyres' thump on touchdown, a softer one as the nose comes down onto the front tyres (6 f later) ──
thump = fade(lowpass(load("land_a.mp3")[: int(0.7 * SR)], 1400), 0.004, 0.35)
place(level(thump, -41), land)
place(level(thump, -46), land + 6)

# ── 4 · THE LINE-UP: a soft electric whir rolling away, thinning as the cars go into the fog ──
whir = fade(lowpass(load("driveoff_b.mp3")[: int(1.15 * SR)], 3200), 0.4, 0.75)
place(level(whir, -47), drive0)

CEIL = 10 ** (-24 / 20)   # a file never peaks above −24 dBFS: background, never a hit over the voice
dst = os.path.join(root, "public", "sfx21"); os.makedirs(dst, exist_ok=True)
def write(sig, name):
    pk = np.abs(sig).max()
    if pk > CEIL: sig = sig * (CEIL / pk)
    st = np.stack([sig, sig], axis=1).astype(np.float32)
    p = subprocess.run([FF, "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s16le", os.path.join(dst, name)], input=st.tobytes())
    if p.returncode: sys.exit("ffmpeg failed")
    print(f"{name} {len(sig)/SR:.2f} s, peak {20*np.log10(max(1e-9, np.abs(sig).max())):.1f} dBFS, RMS {rms_db(sig[np.abs(sig) > 1e-6]):.1f} dBFS")
    return sig
hk = write(out, "hook.wav")
win = int(0.25 * SR)
print("hook.wav RMS per 0.25 s (dBFS):")
print("  " + " ".join(f"{rms_db(hk[i:i + win]):.0f}" for i in range(0, len(hk), win)))

# ── THE 23-SECOND SCENE (whatC, the thrusters; Timur, 2026-10-29: "and also to the scene at 23 seconds"): the cold-gas thrusters hiss from
# the frame they fire, breathing steadily, then SWELL as they lift the car, fading as it hovers. jets_a (a steady 3-s hiss) then jets_b,
# joined by an equal-power crossfade; played from `fire0` (thrusters.wav starts on that frame). UNCHANGED (2026-10-30 touched the hook only).
fire0, swell0, lift1 = (int(a) for a in sys.argv[6:9])
CEIL = 10 ** (-20 / 20)
need = (lift1 + 12 - fire0) / FPS
ja, jb = lowpass(load("jets_a.mp3"), 6500), lowpass(load("jets_b.mp3")[: int(1.45 * SR)], 6500)
ja, jb = ja[int(0.15 * SR):], jb   # (jets_a's first 0.15 s is its silent lead-in)
X = int(0.35 * SR)
t = np.linspace(0, np.pi / 2, X)
hiss = np.concatenate([ja[:-X], ja[-X:] * np.cos(t) + jb[:X] * np.sin(t), jb[X:]])
while len(hiss) < need * SR:   # (never runs out under its animation: STYLE §11.2)
    hiss = np.concatenate([hiss[:-X], hiss[-X:] * np.cos(t) + hiss[:X] * np.sin(t), hiss[X:]])
hiss = hiss[: int(need * SR)]
hiss = level(hiss, -41)
# its level over time: steady breathing, +4 dB as the jets swell and lift the car, then easing back as it hovers
tt = np.arange(len(hiss)) / SR
sw = (swell0 - fire0) / FPS
gain = 10 ** ((4 * np.clip((tt - sw) / 0.4, 0, 1) - 3 * np.clip((tt - sw - 1.0) / 0.8, 0, 1)) / 20)
write(fade(hiss * gain, 0.06, 0.4), "thrusters.wav")

gen = os.path.join(root, "src", "tsla", "hooksfx.gen.ts")
open(gen, "w", encoding="utf8").write(
    "// GENERATED by scratchpad/mkhooksfx21.py: the frames public/sfx21/hook.wav and thrusters.wav were built on. Video.tsx refuses if\n"
    "// TIMES.hook or TIMES.thrusters move away from them (re-run the script with the new frames).\n"
    f"export const HOOK_SFX_BUILT = {{ leave: {leave}, jets0: {jets0}, jets1: {jets1}, land: {land}, drive0: {drive0} }} as const;\n"
    f"export const THRUSTER_SFX_BUILT = {{ fire0: {fire0}, swell0: {swell0}, lift1: {lift1} }} as const;\n")
print(f"frames: hook leave {leave} jets {jets0}-{jets1} land {land} drive {drive0}; thrusters fire {fire0} swell {swell0} lift-end {lift1}")
