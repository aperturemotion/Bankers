#!/usr/bin/env python3
# V38 rev 4c — THE NEW HOOK LINE (Timur, 2026-11-26: option 5 + "just": "In this town of just 1,903 people, a retired couple found a way to
# beat the lottery. Legally. For nine years."). ONE ElevenLabs generation (Jon - Calm Presence, eleven_v4, take38C_hook_raw.mp3),
# processed like take B (pauses ≥ 0.45 s at −33 dB kept at 0.30 s, ×1.04 atempo, pitch kept), word-timed with faster-whisper
# (small.en, local), and SPLICED onto the old take at the silence after "…For nine years." — everything from "In two thousand three"
# on is the old take unchanged, delayed by HOOK_SHIFT whole frames (so every later word moves by exactly HOOK_SHIFT frames).
# Writes: public/vo_trimmed.wav/.mp3 (the old ones kept as out/vo_trimmed_takeB.*), scratchpad/fw_words.json (old kept as
# scratchpad/fw_words_takeB.json), scratchpad/hook_shift.json {frames, seconds}.
import json, os, re, shutil, subprocess, sys
os.chdir(os.path.join(os.path.dirname(__file__), ".."))
FF = "/home/user/ffbin/ffmpeg"
RAW = "scratchpad/vo/takes/take38C_hook_raw.mp3"
FPS = 30
def run(*a): return subprocess.run(a, capture_output=True, text=True)
# keep the take-B originals once
if not os.path.exists("out/vo_trimmed_takeB.wav"): shutil.copy("public/vo_trimmed.wav", "out/vo_trimmed_takeB.wav"); shutil.copy("public/vo_trimmed.mp3", "out/vo_trimmed_takeB.mp3")
if not os.path.exists("scratchpad/fw_words_takeB.json"): shutil.copy("scratchpad/fw_words.json", "scratchpad/fw_words_takeB.json")
old = json.load(open("scratchpad/fw_words_takeB.json"))
OW = old["words"]
# 1. trim the new line's pauses as vo_trim did (≥ 0.45 s under −33 dB → 0.30 s), leading/trailing silence to 0.02 s
err = run(FF, "-i", RAW, "-af", "silencedetect=noise=-33dB:d=0.45", "-f", "null", "-").stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
dur = float(run("/home/user/ffbin/ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", RAW).stdout)
gaps = list(zip(st, en + [dur] * (len(st) - len(en))))
segs, cur = [], 0.0
for (a, b) in gaps:
    if a <= 0.01: cur = max(cur, b - 0.02); continue                       # leading silence
    if b >= dur - 0.01: segs.append((cur, a + 0.02)); cur = None; break    # trailing silence
    keep = 0.30; segs.append((cur, a + keep / 2)); cur = b - keep / 2
if cur is not None: segs.append((cur, dur))
flt = "".join(f"[0:a]atrim={a:.4f}:{b:.4f},asetpts=PTS-STARTPTS[s{i}];" for i, (a, b) in enumerate(segs))
flt += "".join(f"[s{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=0:a=1,atempo=1.04[o]"
r = run(FF, "-v", "error", "-y", "-i", RAW, "-filter_complex", flt, "-map", "[o]", "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", "out/hook38C.wav")
if r.returncode: sys.exit(r.stderr)
# 2. word timings (faster-whisper, local)
from faster_whisper import WhisperModel
m = WhisperModel("small.en", device="cpu", compute_type="int8")
import numpy as np
pcm = subprocess.run([FF, "-v", "error", "-i", "out/hook38C.wav", "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout
segs_w, _ = m.transcribe(np.frombuffer(pcm, dtype=np.float32), word_timestamps=True, initial_prompt="In this town of just nineteen hundred and three people, a retired couple found a way to beat the lottery. Legally. For nine years.")
words = [{"t": w.word.strip(), "a": round(w.start, 3), "b": round(w.end, 3)} for s in segs_w for w in s.words]
print("whisper:", " ".join(w["t"] for w in words))
# map onto the script's spoken tokens (spelled, as VO_SCRIPT.txt has them)
SPOKEN = "In this town of just nineteen hundred and three people, a retired couple found a way to beat the lottery. Legally. For nine years.".split()
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
# whisper may write "1,903" for the number: expand it to the spoken tokens, sharing its time span
exp = []
for w in words:
    if re.fullmatch(r"[\d,]+", norm(w["t"]) and w["t"].strip(".,")) and w["t"].strip(".,").replace(",", "") == "1903":
        parts = ["nineteen", "hundred", "and", "three"]; d = (w["b"] - w["a"]) / 4
        exp += [{"t": p, "a": round(w["a"] + i * d, 3), "b": round(w["a"] + (i + 1) * d, 3)} for i, p in enumerate(parts)]
    else: exp.append(w)
if [norm(w["t"]) for w in exp] != [norm(s) for s in SPOKEN]:
    sys.exit("REFUSED: whisper words differ from the line:\n" + " ".join(w["t"] for w in exp))
hook = [{"t": s, "a": w["a"], "b": w["b"]} for s, w in zip(SPOKEN, exp)]
# 3. splice: new hook up to just after its "years." + the old take from just after its "years." (the 0.6 s hold, "In two thousand three", …)
iy = next(i for i, w in enumerate(OW) if w["t"] == "years.")
old_cut = OW[iy]["b"] + 0.03
# rev 4d (Timur: "create a small pause in the voiceover after he says 'In this town'"): PAUSE_F frames of silence inserted at the
#   QUIETEST 10-ms point between "town" and "of" (measured on the trimmed line), every later hook word moved by it
PAUSE_F = int(os.environ.get("PAUSE_F", 0))   # rev 4e: Timur removed the pause again ("delete the pause … keep it as it was")
it = next(i for i, w in enumerate(hook) if w["t"] == "town")
pcm44 = np.frombuffer(subprocess.run([FF, "-v", "error", "-i", "out/hook38C.wav", "-f", "f32le", "-ac", "1", "-ar", "44100", "-"], capture_output=True).stdout, dtype=np.float32)
lo, hi = int(hook[it]["b"] * 44100) - 2205, int(hook[it + 1]["a"] * 44100) + 1323
win = 441; best = min(range(lo, max(lo + 1, hi - win), 110), key=lambda s0: float(np.sqrt(np.mean(pcm44[s0:s0 + win] ** 2))))
pcut = float(os.environ.get("PAUSE_AT", "0.785")) if os.environ.get("PAUSE_AT", "0.785") else (best + win / 2) / 44100; pdur = PAUSE_F / FPS
print(f"pause: {pdur:.3f} s at {pcut:.3f} s (rms {float(np.sqrt(np.mean(pcm44[best:best + win] ** 2))):.4f}) between town ({hook[it]['b']}) and of ({hook[it + 1]['a']})")
r = run(FF, "-v", "error", "-y", "-i", "out/hook38C.wav", "-filter_complex",
        f"[0:a]atrim=0:{pcut:.5f},afade=t=out:st={pcut - 0.01:.5f}:d=0.01,apad=pad_dur={pdur:.5f},asetpts=PTS-STARTPTS[x];[0:a]atrim=start={pcut:.5f},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.01[y];[x][y]concat=n=2:v=0:a=1[o]",
        "-map", "[o]", "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", "out/hook38C_p.wav")
if r.returncode: sys.exit(r.stderr)
if PAUSE_F: os.replace("out/hook38C_p.wav", "out/hook38C.wav")
hook = [w if i <= it else {**w, "a": round(w["a"] + pdur, 3), "b": round(w["b"] + pdur, 3)} for i, w in enumerate(hook)]   # "of" onward (whisper put town/of ~0.15 s early; the measured gap is at PAUSE_AT)
# measured on the trimmed line's energy (whisper put them ~0.15 s early): "town" 0.48–0.76 s; "of" starts 0.80 s → after the pause
hook[it] = {**hook[it], "a": 0.48, "b": 0.76}
hook[it + 1] = {**hook[it + 1], "a": round(0.80 + pdur, 3), "b": round(0.92 + pdur, 3)}
for i in range(it + 2, len(hook)):   # keep the words in order after the pin
    if hook[i]["a"] < hook[i - 1]["b"]: hook[i] = {**hook[i], "a": hook[i - 1]["b"], "b": max(hook[i]["b"], hook[i - 1]["b"] + 0.06)}
# rev 4f (Timur: "the voice over doesnt finish saying 9 years"): whisper ended "years." at 7.94 s, but the closing "s" (a sibilant,
#   80–95 % of its energy over 4 kHz) runs on to ~8.29 s after a short dip — the cut at whisper's end chopped it off. The end is now
#   MEASURED: the last 10-ms window above −45 dB within 0.6 s after whisper's end, + 40 ms of tail.
pcm_e = np.frombuffer(subprocess.run([FF, "-v", "error", "-i", "out/hook38C.wav", "-f", "f32le", "-ac", "1", "-ar", "44100", "-"], capture_output=True).stdout, dtype=np.float32)
e0, e1 = int(hook[-1]["b"] * 44100), min(len(pcm_e), int((hook[-1]["b"] + 0.6) * 44100))
loud = [k for k in range(e0, e1 - 441, 441) if 20 * np.log10(np.sqrt(np.mean(pcm_e[k:k + 441] ** 2)) + 1e-9) > -45]
end_meas = ((loud[-1] + 441) / 44100) if loud else hook[-1]["b"]
print(f"'years.' whisper end {hook[-1]['b']:.3f} s → measured end {end_meas:.3f} s")
hook[-1] = {**hook[-1], "b": round(max(hook[-1]["b"], end_meas), 3)}
new_cut0 = hook[-1]["b"] + 0.04
shift_f = round((new_cut0 - old_cut) * FPS + 0.4999)          # whole frames, rounded UP (the remainder is padded with silence)
pad = shift_f / FPS - (new_cut0 - old_cut)
new_cut = new_cut0 + pad
r = run(FF, "-v", "error", "-y", "-i", "out/hook38C.wav", "-i", "out/vo_trimmed_takeB.wav", "-filter_complex",
        f"[0:a]atrim=0:{new_cut0:.5f},volume=0.9dB,apad=pad_dur={pad:.5f},asetpts=PTS-STARTPTS[h];[1:a]atrim=start={old_cut:.5f},asetpts=PTS-STARTPTS[t];[h][t]concat=n=2:v=0:a=1[o]",
        "-map", "[o]", "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", "public/vo_trimmed.wav")
if r.returncode: sys.exit(r.stderr)
run(FF, "-v", "error", "-y", "-i", "public/vo_trimmed.wav", "-c:a", "libmp3lame", "-b:a", "192k", "public/vo_trimmed.mp3")
sh = shift_f / FPS
out = hook + [{"t": w["t"], "a": round(w["a"] + sh, 3), "b": round(w["b"] + sh, 3)} for w in OW[iy + 1:]]
json.dump({"words": out, "_doc": "V38 take B + rev 4c hook (take38C, faster-whisper small.en on the trimmed ×1.04 line); every word after the hook is take B's, shifted by HOOK_SHIFT = %d frames (%.3f s)." % (shift_f, sh)}, open("scratchpad/fw_words.json", "w"), indent=0)
json.dump({"frames": shift_f, "seconds": sh, "old_cut": old_cut, "new_cut": new_cut}, open("scratchpad/hook_shift.json", "w"))
print("hook words:", [(w["t"], w["a"]) for w in hook])
print(f"HOOK_SHIFT = {shift_f} frames ({sh:.3f} s); old 'years.' end {OW[iy]['b']:.3f} → new {hook[-1]['b']:.3f}")
