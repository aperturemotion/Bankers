#!/usr/bin/env python3
# V39 — THE TAKE → public/vo_trimmed.wav/.mp3 + scratchpad/fw_words.json (the V38 pipeline, one script):
#   ElevenLabs "Jon – Calm Presence" (eleven_v4), ONE generation call (two variations, 2026-11-26): take39A / take39B.
#   1. each take: pauses ≥ 0.45 s under −33 dB kept at 0.30 s (leading/trailing silence to 0.02 s), ×1.04 atempo (pitch kept)
#   2. faster-whisper small.en word timings on the processed audio (fed as PCM: the av build mismatch)
#   3. the take whose words match VO_SCRIPT.txt best is kept; script tokens are aligned onto whisper's words (difflib on
#      normalised tokens; unmatched runs share their gap by length), so the generator never depends on whisper's spelling
#      of numbers ("2014" vs "twenty fourteen")
#   4. each word's END is checked on the waveform (V38 rev 4f: whisper ended "years." 0.35 s early) — the last word of every
#      sentence is extended to the last 10-ms window above −45 dB before the next word.
import json, os, re, subprocess, sys, difflib
import numpy as np
os.chdir(os.path.join(os.path.dirname(__file__), ".."))
FF, FP = "/home/user/ffbin/ffmpeg", "/home/user/ffbin/ffprobe"
def run(*a): return subprocess.run(a, capture_output=True, text=True)
def process(raw, out):
    err = run(FF, "-i", raw, "-af", "silencedetect=noise=-33dB:d=0.45", "-f", "null", "-").stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    dur = float(run(FP, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", raw).stdout)
    segs, cur = [], 0.0
    for (a, b) in zip(st, en + [dur] * (len(st) - len(en))):
        if a <= 0.01: cur = max(cur, b - 0.02); continue
        if b >= dur - 0.01: segs.append((cur, a + 0.02)); cur = None; break
        segs.append((cur, a + 0.15)); cur = b - 0.15
    if cur is not None: segs.append((cur, dur))
    flt = "".join(f"[0:a]atrim={a:.4f}:{b:.4f},asetpts=PTS-STARTPTS[s{i}];" for i, (a, b) in enumerate(segs))
    flt += "".join(f"[s{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=0:a=1,atempo=1.04[o]"
    r = run(FF, "-v", "error", "-y", "-i", raw, "-filter_complex", flt, "-map", "[o]", "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", out)
    if r.returncode: sys.exit(r.stderr)
    return float(run(FP, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out).stdout)
SCRIPT = open("VO_SCRIPT.txt").read()
TOK = re.findall(r"[A-Za-z0-9'\-,.:]+", SCRIPT)
norm = lambda s: re.sub(r"[^a-z0-9']", "", s.replace("’", "'").lower())
from faster_whisper import WhisperModel
m = WhisperModel("small.en", device="cpu", compute_type="int8")
res = {}
for k in ("A", "B"):
    wav = f"out/take39{k}.wav"
    d = process(f"scratchpad/vo/takes/take39{k}_raw.mp3", wav)
    pcm = np.frombuffer(subprocess.run([FF, "-v", "error", "-i", wav, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout, dtype=np.float32)
    segs, _ = m.transcribe(pcm, word_timestamps=True, initial_prompt=SCRIPT.replace("\n", " "))
    ww = [{"t": w.word.strip(), "a": w.start, "b": w.end} for s in segs for w in s.words]
    sm = difflib.SequenceMatcher(a=[norm(t) for t in TOK], b=[norm(w["t"]) for w in ww], autojunk=False)
    res[k] = (sm.ratio(), d, ww, sm)
    print(f"take39{k}: {d:.2f} s processed, match {sm.ratio():.3f}; whisper: {' '.join(w['t'] for w in ww)[:160]}…")
k = max(res, key=lambda q: res[q][0])
ratio, dur, ww, sm = res[k]
print(f"KEEP take39{k} (match {ratio:.3f}, {dur:.2f} s)")
# align: matched blocks give exact times; gaps share their span by character length
times = [None] * len(TOK)
for a0, b0, n in sm.get_matching_blocks():
    for j in range(n): times[a0 + j] = (ww[b0 + j]["a"], ww[b0 + j]["b"])
i = 0
while i < len(TOK):
    if times[i] is not None: i += 1; continue
    j = i
    while j < len(TOK) and times[j] is None: j += 1
    t0 = times[i - 1][1] if i > 0 else 0.0
    t1 = times[j][0] if j < len(TOK) else dur
    L = [len(norm(t)) + 1 for t in TOK[i:j]]; S = sum(L); c = t0
    for q in range(i, j):
        dt = (t1 - t0) * L[q - i] / S; times[q] = (c, c + dt); c += dt
    print("  aligned by length:", " ".join(TOK[i:j]), f"{t0:.2f}–{t1:.2f}")
    i = j
# waveform end of each sentence's last word (the closing consonant whisper cuts short)
pcm44 = np.frombuffer(subprocess.run([FF, "-v", "error", "-i", f"out/take39{k}.wav", "-f", "f32le", "-ac", "1", "-ar", "44100", "-"], capture_output=True).stdout, dtype=np.float32)
def db(s0, s1): s = pcm44[s0:s1]; return 20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-9) if len(s) else -120
for q, t in enumerate(TOK):
    if not re.search(r"[.!?:,]$", t): continue
    a, b = times[q]; lim = times[q + 1][0] if q + 1 < len(TOK) else dur
    e0, e1 = int(b * 44100), int(min(lim, b + 0.6) * 44100)
    loud = [s for s in range(e0, e1 - 441, 441) if db(s, s + 441) > -45]
    if loud:
        nb = min(lim - 0.02, (loud[-1] + 441) / 44100)
        if nb > b + 0.02: times[q] = (a, round(nb, 3))
words = [{"t": t, "a": round(a, 3), "b": round(b, 3)} for t, (a, b) in zip(TOK, times)]
for q in range(1, len(words)):   # monotone
    if words[q]["a"] < words[q - 1]["b"] - 0.001: words[q]["a"] = words[q - 1]["b"]
    if words[q]["b"] < words[q]["a"] + 0.04: words[q]["b"] = round(words[q]["a"] + 0.04, 3)
json.dump({"words": words, "_doc": f"V39 take39{k} (ElevenLabs Jon – Calm Presence, eleven_v4; pauses ≥0.45 s → 0.30 s, ×1.04), faster-whisper small.en aligned to VO_SCRIPT.txt; sentence ends measured on the waveform."}, open("scratchpad/fw_words.json", "w"), indent=0)
r = run(FF, "-v", "error", "-y", "-i", f"out/take39{k}.wav", "-af", "volume=0.9dB", "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", "public/vo_trimmed.wav")
if r.returncode: sys.exit(r.stderr)
run(FF, "-v", "error", "-y", "-i", "public/vo_trimmed.wav", "-c:a", "libmp3lame", "-b:a", "192k", "public/vo_trimmed.mp3")
print(f"wrote public/vo_trimmed.* ({dur:.2f} s) and scratchpad/fw_words.json ({len(words)} words)")
