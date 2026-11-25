# VIDEO 9 — FIT THE TAKE TO THE 80-s HARD CAP BEFORE ANY WORD IS CUT (root CLAUDE.md, 023: "pad silences ≥ 0.3 s, time-stretch up to
# ~4% (atempo keeps the pitch), and shorten the end hold"). vo_trim.py shortens only pauses ≥ 0.45 s; this re-trims the SAME raw take
# at ≥ 0.25 s (each kept to 0.16 s, as vo_trim does), then stretches by the smallest atempo that brings the voice under its budget:
#   budget = 80 s × 30 − (VO_LEAD 8 + VO_GAP 12 + TAIL 76) frames, less a 3-frame margin.
# Refuses a stretch over 4%. Writes public/vo_trimmed.wav (fitted, NATIVE 44.1 kHz mono PCM) and keeps the unfitted trim in out/.
#   python scratchpad/vo_fit.py
import glob, os, re, shutil, subprocess, sys
FF = r"C:\Users\Timur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin"
SKIP = ("vo_trimmed", "music", "click", "sfx", "trump", "potus", "hook", "bed")
cands = [q for q in glob.glob("public/*.wav") + glob.glob("public/*.mp3") + glob.glob("public/*.m4a") + glob.glob("public/*.mpeg")
         if not any(k in os.path.basename(q).lower() for k in SKIP)]
if not cands: sys.exit("no VO found in public/")
src = sorted(cands, key=os.path.getmtime)[-1]
# TAIL 76 (STYLE §1.5 says 96): the end hold shortened, the root rule's third lever for an over-cap take (captions_vo.mjs TAIL)
FPS, CAP_S, FIXED_F, MARGIN_F = 30, 80.0, 8 + 12 + 76, 3
BUDGET = (CAP_S * FPS - FIXED_F - MARGIN_F) / FPS
PAD, MIN_GAP = 0.16, 0.25

def dur_of(p):
    return float(subprocess.run([FF + r"\ffprobe.exe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout.strip())

out = subprocess.run([FF + r"\ffmpeg.exe", "-i", src, "-af", f"silencedetect=noise=-33dB:d={MIN_GAP}", "-f", "null", "-"], capture_output=True, text=True).stderr
starts = [float(m) for m in re.findall(r"silence_start: ([\d.]+)", out)]
ends = [float(m) for m in re.findall(r"silence_end: ([\d.]+)", out)]
dur = dur_of(src)
segs, cur = [], 0.0
for s, e in zip(starts, ends):
    segs.append((cur, s + PAD / 2)); cur = e - PAD / 2
segs.append((cur, dur))
segs = [(max(0, a), min(dur, b)) for a, b in segs if b - a > 0.02]
trimmed = sum(b - a for a, b in segs)
tempo = max(1.0, trimmed / BUDGET)
print(f"source: {src}\nraw {dur:.2f} s → re-trimmed at ≥{MIN_GAP:.2f} s pauses: {trimmed:.2f} s ({len(starts)} pauses); budget {BUDGET:.2f} s")
if tempo > 1.0405: sys.exit(f"✗ the take needs a {100 * (tempo - 1):.1f}% stretch to fit — over the 4% ceiling; refusing (cut words only with Timur)")
parts = "".join(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=N/SR/TB[a{i}];" for i, (a, b) in enumerate(segs))
conc = "".join(f"[a{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=0:a=1[cat]"
os.makedirs("out", exist_ok=True)
if os.path.exists("public/vo_trimmed.wav"): shutil.copyfile("public/vo_trimmed.wav", "out/vo_trimmed_unfitted.wav")
chain = parts + conc + (f";[cat]atempo={tempo:.5f}[out]" if tempo > 1.0005 else ";[cat]anull[out]")
subprocess.run([FF + r"\ffmpeg.exe", "-y", "-i", src, "-filter_complex", chain, "-map", "[out]", "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", "public/vo_trimmed.wav"], check=True, capture_output=True)
got = dur_of("public/vo_trimmed.wav")
print(f"atempo {tempo:.4f} ({100 * (tempo - 1):.1f}%, pitch kept) → public/vo_trimmed.wav {got:.2f} s; film ≈ {(got * FPS + FIXED_F) / FPS:.2f} s")
