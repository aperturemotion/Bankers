import subprocess, numpy as np
def _load(p):
    # (V42: this container's PyAV rejects faster-whisper's own decode call) decode with ffmpeg to 16 kHz mono float32
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32)
from faster_whisper import WhisperModel
import json
m = WhisperModel("small.en", device="cpu", compute_type="int8")
import os
# V35 recovery: this film's take is public/vo_trimmed.mp3 (the .wav name is kept first for older clones)
_src = "public/vo_trimmed.wav" if os.path.exists("public/vo_trimmed.wav") else "public/vo_trimmed.mp3"
segs, info = m.transcribe(_load(_src), word_timestamps=True, beam_size=5)
words = []
for s in segs:
    for w in s.words:
        words.append({"t": w.word.strip(), "a": round(w.start, 3), "b": round(w.end, 3)})
words = [w for w in words if w["t"]]
json.dump({"words": words}, open("scratchpad/fw_words.json", "w"))
print(f"{len(words)} words, last ends {words[-1]['b']:.1f}s (file {info.duration:.2f}s)")
print("first 6:", " ".join(f"{w['t']}@{w['a']:.1f}" for w in words[:6]))
