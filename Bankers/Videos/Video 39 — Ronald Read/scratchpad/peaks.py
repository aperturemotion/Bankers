# Where is the PERCEPTUAL HIT inside each SFX file?
# A cue scheduled at frame N does not land at frame N — it lands wherever that file's energy peaks.
# A 2.5s whoosh whose swell peaks 2.0s in is TWO SECONDS LATE if you schedule it on the beat.
import wave, struct, os, math
OUT = []
for f in sorted(os.listdir("public/sfx")):
    if not f.endswith(".wav"): continue
    w = wave.open("public/sfx/" + f, "rb")
    n, sr, ch = w.getnframes(), w.getframerate(), w.getnchannels()
    raw = w.readframes(n); w.close()
    a = struct.unpack("<%dh" % (len(raw) // 2), raw)
    if ch == 2: a = [max(abs(a[i]), abs(a[i+1])) for i in range(0, len(a) - 1, 2)]
    else: a = [abs(x) for x in a]
    # 10 ms RMS-ish envelope
    win = max(1, sr // 100)
    env = [max(a[i:i+win]) for i in range(0, len(a), win)]
    pk = max(env) or 1
    ipk = env.index(pk)
    # onset = first window reaching 50% of peak
    ion = next(i for i, v in enumerate(env) if v >= pk * 0.5)
    dur = n / sr
    OUT.append((f[:-4], dur, ion * win / sr, ipk * win / sr))
print("%-12s %6s %8s %8s   %s" % ("file", "dur", "onset", "peak", "peak in frames @30"))
for name, dur, on, pk in OUT:
    print("%-12s %5.2fs %7.2fs %7.2fs   %d" % (name, dur, on, pk, round(pk * 30)))
