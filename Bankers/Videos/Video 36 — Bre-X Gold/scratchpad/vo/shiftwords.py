# V41: the word timings of the RAW take (ElevenLabs Scribe, scratchpad/vo/scribe_raw36_words.json) SHIFTED through vo_trim.py's cut
# map (scratchpad/vo/trimmap.json) onto public/vo_trimmed.wav, written as fw.py writes them (scratchpad/fw_words.json).
# Why: this cloud session cannot fetch the whisper model (huggingface.co is outside the network policy), so the take is transcribed
# once, raw, and shifted, as OffCamCelebs 026's vo_retrim did (CLAUDE.md: "It SHIFTS the transcript rather than re-running it").
#   python scratchpad/vo/shiftwords.py
# It refuses if the map was made from another take, if a word's span falls in a cut the trim removed (a word cannot sit in
# silence that is gone), or if the shifted words run past the trimmed file.
import json, subprocess, os, sys

M = json.load(open("scratchpad/vo/trimmap.json"))
S = json.load(open("scratchpad/vo/scribe_raw36_words.json"))
RAW = "ElevenLabs_2026-11-23_Jon - Calm Presence_v4_take36B_raw.mp3"   # V36 take B
if M["source"] != RAW: sys.exit(f"trimmap.json was made from {M['source']}, not {RAW}")
segs = M["segs"]
# cumulative output start of each kept segment
starts, acc = [], 0.0
for a, b in segs:
    starts.append(acc); acc += b - a

def shift(t, side):
    """raw time -> trimmed time. A time inside a removed stretch snaps to the next kept segment's start (a word's start) or to
    the previous one's end (a word's end), so a span can only shrink, never cross a cut."""
    for (a, b), s0 in zip(segs, starts):
        if a - 1e-6 <= t <= b + 1e-6: return s0 + (min(max(t, a), b) - a)
    if side == "start":
        for (a, b), s0 in zip(segs, starts):
            if a > t: return s0
        return acc
    prev = None
    for (a, b), s0 in zip(segs, starts):
        if a > t: break
        prev = s0 + (b - a)
    return prev if prev is not None else 0.0

out, lost = [], []
for w in S["words"]:
    if w.get("type") != "word": continue
    a, b = shift(w["start"], "start"), shift(w["end"], "end")
    if b <= a + 1e-3:
        lost.append(w["text"]); b = a + 0.04
    out.append({"t": w["text"], "a": round(a, 3), "b": round(b, 3)})
if lost: sys.exit(f"words that fell entirely inside a removed pause (the trim cut speech?): {lost}")
dur = float(subprocess.run([os.environ.get("FFPROBE", "ffprobe"), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                            "public/vo_trimmed.wav"], capture_output=True, text=True).stdout.strip())
if out[-1]["b"] > dur + 0.05: sys.exit(f"shifted words end at {out[-1]['b']:.2f}s, past the trimmed file ({dur:.2f}s): a stale trim map?")
if abs(acc - dur) > 0.05: sys.exit(f"the cut map totals {acc:.2f}s but vo_trimmed.wav is {dur:.2f}s: the map is not this file's")
json.dump({"words": out}, open("scratchpad/fw_words.json", "w"))
print(f"{len(out)} words shifted, last ends {out[-1]['b']:.2f}s (file {dur:.2f}s)")
print("first 6:", " ".join(f"{w['t']}@{w['a']:.2f}" for w in out[:6]))
