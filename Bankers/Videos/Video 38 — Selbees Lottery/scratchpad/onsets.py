# Whisper LOCATES a line; the audio TIMES it (CLAUDE.md, Aperture V5 / Bankers V4). For every sentence in captions.ts,
# measure the real onset in public/vo_trimmed.wav: walk back from the caption's frame to the pause before it, then
# forward to the first 10 ms block above the speech threshold. Reports the frame error per line.
#   python scratchpad/onsets.py
import json, re, wave, numpy as np
ts = open("src/bnx/captions.ts", encoding="utf8").read()
S = json.loads(re.search(r"export const SENTENCES[^=]*= (\[.*?\]);\n", ts, re.S).group(1))
w = wave.open("public/vo_trimmed.wav"); sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
B = sr // 100   # 10 ms blocks
rms = np.sqrt(np.convolve(x * x, np.ones(B) / B, mode="same"))[::B]
db = 20 * np.log10(rms + 1e-9)
TH = -30.0      # speech
SIL = -40.0     # the pause (silences.txt's threshold)
worst = []
for s in S:
    t = s["at"] / 30
    k = int(t * 100)
    # back to the end of the pause before this line (≤ 0.6 s back), then forward to speech
    j = k
    while j > 0 and j > k - 60 and db[j] > SIL: j -= 1
    while j < len(db) - 1 and db[j] < TH: j += 1
    real = j / 100
    err = round((s["at"] / 30 - real) * 30)
    worst.append((abs(err), err, s["scene"], s["text"][:44], s["at"], real))
worst.sort(reverse=True)
print(f"{len(S)} lines · |error| > 2 frames: {sum(1 for w_ in worst if w_[0] > 2)}")
for a, e, sc, tx, at, real in worst[:12]:
    print(f"  {e:+3d} f  {sc:7s} @{at:5d}  real {real:6.2f}s  {tx}")
