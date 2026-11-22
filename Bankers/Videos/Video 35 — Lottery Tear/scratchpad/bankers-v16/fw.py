from faster_whisper import WhisperModel
import json
m = WhisperModel("small.en", device="cpu", compute_type="int8")
segs, info = m.transcribe("public/vo_trimmed.wav", word_timestamps=True, beam_size=5)
words = []
for s in segs:
    for w in s.words:
        words.append({"t": w.word.strip(), "a": round(w.start, 3), "b": round(w.end, 3)})
words = [w for w in words if w["t"]]
json.dump({"words": words}, open("scratchpad/fw_words.json", "w"))
print(f"{len(words)} words, last ends {words[-1]['b']:.1f}s")
print("first 6:", " ".join(f"{w['t']}@{w['a']:.1f}" for w in words[:6]))
