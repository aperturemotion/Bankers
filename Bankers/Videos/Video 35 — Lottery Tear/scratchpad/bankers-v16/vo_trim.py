import subprocess, re, sys, os, glob
FF=r"C:\Users\Timur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin"
# ★ NEW faster-paced VO (44.1 kHz mono pcm). We keep the NATIVE sample rate on the trimmed file so
# playback quality is untouched — the old script resampled to 16 kHz, which is what sounded bad in
# Remotion. faster-whisper resamples internally, so transcription off the 44.1 kHz file is fine.
# Auto-pick the newest VO in public/, whatever it is called — everything that is NOT the VO
# (music beds, click/SFX assets, our own output) is excluded, so a re-drop just works.
# ⚠ .mpeg IS IN THE LIST ON PURPOSE — ElevenLabs exports land as "….mp3.mpeg" and the WhatsApp
# beds arrive as ".mpeg" too. A glob that only knows wav/mp3/m4a silently finds nothing.
# ⚠ "trump"/"potus"/"hook" ARE IN THE SKIP LIST: the hook footage is an .mp4 sitting in
# public/, and it is usually the NEWEST file there — without this, a re-run of the pipeline
# picks the stock clip as the voiceover and transcribes Trump instead of the narrator.
SKIP=("vo_trimmed","music","click","sfx","trump","potus","hook","bed","strings808")  # BANKERS: + "bed" (public/bed.mp3), + the song (Video 13)
cands=[q for q in glob.glob("public/*.wav")+glob.glob("public/*.mp3")+glob.glob("public/*.m4a")
       +glob.glob("public/*.mpeg")+glob.glob("public/*.mp4")
       if not any(k in os.path.basename(q).lower() for k in SKIP)]
if not cands: sys.exit("no VO found in public/")
src=sorted(cands, key=os.path.getmtime)[-1]
print("source:", src)
# 1. detect silences
out=subprocess.run([FF+r"\ffmpeg.exe","-i",src,"-af","silencedetect=noise=-33dB:d=0.45","-f","null","-"],
    capture_output=True,text=True).stderr
starts=[float(m) for m in re.findall(r"silence_start: ([\d.]+)",out)]
ends=[float(m) for m in re.findall(r"silence_end: ([\d.]+)",out)]
dur=float(subprocess.run([FF+r"\ffprobe.exe","-v","error","-show_entries","format=duration","-of","csv=p=0",src],capture_output=True,text=True).stdout.strip())
# 2. build keep-segments: audio between silences, plus a 0.16s pad of each gap
gaps=list(zip(starts,ends))
PAD=0.16
segs=[]; cur=0.0
for s,e in gaps:
    segs.append((cur, s+PAD/2)); cur=e-PAD/2
segs.append((cur,dur))
segs=[(max(0,a),min(dur,b)) for a,b in segs if b-a>0.02]
# 3. build filter to concat — NATIVE 44.1 kHz, mono, 16-bit PCM (no resample, no re-encode loss)
parts="".join(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=N/SR/TB[a{i}];" for i,(a,b) in enumerate(segs))
conc="".join(f"[a{i}]" for i in range(len(segs)))+f"concat=n={len(segs)}:v=0:a=1[out]"
subprocess.run([FF+r"\ffmpeg.exe","-y","-i",src,"-filter_complex",parts+conc,"-map","[out]",
    "-ar","44100","-ac","1","-c:a","pcm_s16le","public/vo_trimmed.wav"],check=True,capture_output=True)
info=subprocess.run([FF+r"\ffprobe.exe","-v","error","-show_entries","stream=sample_rate,channels","-show_entries","format=duration","-of","default=noprint_wrappers=1","public/vo_trimmed.wav"],capture_output=True,text=True).stdout
print(f"raw {dur:.1f}s -> trimmed ({len(gaps)} gaps, {len(segs)} segments)")
print(info.strip())
