# Transcribe an ARBITRARY audio/video file with word timings.
#   python scratchpad/fwfile.py <in> <out.json>
# Used to verify a RENDER's sync: aggregate level probes cannot detect desync, only a transcript
# of the finished mix can (the 2026-08-30 lesson).
import sys, json
import subprocess, numpy as np
def _load(p):
    # (V42: this container's PyAV rejects faster-whisper's own decode call) decode with ffmpeg to 16 kHz mono float32
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32)
from faster_whisper import WhisperModel
src, dst = sys.argv[1], sys.argv[2]
m = WhisperModel("small.en", device="cpu", compute_type="int8")
segs, _ = m.transcribe(_load(src), word_timestamps=True, beam_size=5)
words = []
for s in segs:
    for w in s.words:
        t = w.word.strip()
        if t:
            words.append({"t": t, "a": round(w.start, 3), "b": round(w.end, 3)})
json.dump({"words": words}, open(dst, "w"))
print(f"{len(words)} words, first {words[0]['t']}@{words[0]['a']:.2f}s, last ends {words[-1]['b']:.1f}s")
