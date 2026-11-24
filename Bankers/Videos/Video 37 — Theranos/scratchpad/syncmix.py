# Transcribe the RENDERED MIX and align it against the take's own transcript.
# A level probe cannot catch a desync (V10 shipped one); only reading back the finished audio can.
from faster_whisper import WhisperModel
import json, difflib, re

m = WhisperModel("small.en", device="cpu", compute_type="int8")
segs, _ = m.transcribe("out/mix.mp3", word_timestamps=True, beam_size=5)
mix = []
for s in segs:
    for w in s.words:
        t = w.word.strip()
        if t: mix.append({"t": t, "a": round(w.start, 3)})
src = json.load(open("scratchpad/fw_words.json"))["words"]

norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
A = [norm(w["t"]) for w in src]
B = [norm(w["t"]) for w in mix]
print(f"source {len(A)} words | mix {len(B)} words")

sm = difflib.SequenceMatcher(None, A, B, autojunk=False)
matched = drift = 0; worst = (0, "")
for a0, b0, n in sm.get_matching_blocks():
    for k in range(n):
        d = mix[b0 + k]["a"] - src[a0 + k]["a"]
        matched += 1; drift += abs(d)
        if abs(d) > abs(worst[0]): worst = (d, src[a0 + k]["t"])
print(f"matched {matched}/{len(A)} = {100*matched/len(A):.1f}% of the take's words")
print(f"mean |drift| {drift/max(1,matched)*1000:.0f} ms | worst {worst[0]*1000:+.0f} ms on '{worst[1]}'")
missing = [src[i]["t"] for tag,i1,i2,_,_ in sm.get_opcodes() if tag in ("delete","replace") for i in range(i1,i2)]
if missing: print(f"not recovered from the mix ({len(missing)}): {' '.join(missing[:40])}")
