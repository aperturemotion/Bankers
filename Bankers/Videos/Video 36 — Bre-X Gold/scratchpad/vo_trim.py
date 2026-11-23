import subprocess, re, sys, os, glob
FF=__import__("os").environ.get("FFMPEG_BIN", r"C:\Users\Timur\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin")
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
# ⚠ "bed_" (V32, 2026-10-02): the baked bed is newer than the take, and was picked as the VO
SKIP=("vo_trimmed","music","click","sfx","trump","potus","hook","bed_","mix_","solo")
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
# ★ (style file, 2026-10-20, V37: "make the vo slower, its fine if the video is like 2.5 minutes long") a GENERATED take keeps
#   0.30 s of each natural pause (was 0.16) and is never sped up
PAD=0.30
segs=[]; cur=0.0
# ★ DECLARED HOLDS (V27): the pauses a SECTION FLASH sits in keep HOLD_PAD instead of PAD — at
# 0.16s the LightBreak's 11-frame rise had no silence to rise in and crossed the last word. Listed
# by RAW-take gap start (s), in scratchpad/vo_hold.json; each must match a detected gap or this
# refuses (a re-drop with a different read must be re-mapped, not silently ignored).
HOLD_PAD=0.50
HOLDS=[]
# ★ SHORT HOLDS (V31): a section flash can sit in a pause the read made SHORTER than the trim threshold (0.45 s), so
# the trim never touches it and it stays at its natural length (V31: 0.37 s before "The price of the burger", against
# the flash's 0.37 s rise). Listed by raw start in vo_hold.json "rawShortGapStarts", matched against silencedetect at
# d=0.10, and LENGTHENED to HOLD_PAD by repeating the pause's own middle (overlapping source ranges), so the room
# tone stays continuous: no digital silence is spliced in.
SHORT=[]
if os.path.exists("scratchpad/vo_hold.json"):
    import json
    hj=json.load(open("scratchpad/vo_hold.json"))
    if os.path.basename(hj.get("source","")) != os.path.basename(src):
        sys.exit("vo_hold.json was mapped for "+hj.get("source","?")+" — re-map the holds for this take")
    HOLDS=hj["rawGapStarts"]
    # ★ per-hold lengths (V32, 2026-10-02): a hold may keep MORE than HOLD_PAD; longer than the read's own pause, the extra
    # repeats the pause's own middle (room tone, never digital silence), as the short holds below do
    LONG={float(k):v for k,v in hj.get("holdPads",{}).items()}
    for h in HOLDS:
        if not any(abs(s-h)<0.05 for s,_ in gaps): sys.exit(f"vo_hold: no detected gap starts at {h}s")
    if hj.get("rawShortGapStarts"):
        o2=subprocess.run([FF+r"\ffmpeg.exe","-i",src,"-af","silencedetect=noise=-33dB:d=0.10","-f","null","-"],
            capture_output=True,text=True).stderr
        sg=list(zip([float(m) for m in re.findall(r"silence_start: ([\d.]+)",o2)],
                    [float(m) for m in re.findall(r"silence_end: ([\d.]+)",o2)]))
        for h in hj["rawShortGapStarts"]:
            m=[(s,e) for s,e in sg if abs(s-h)<0.05]
            if not m: sys.exit(f"vo_hold: no short pause starts at {h}s")
            s,e=m[0]
            if e-s>=0.45: sys.exit(f"vo_hold: the pause at {h}s is {e-s:.2f}s, a TRIMMED gap: list it in rawGapStarts")
            if e-s>=HOLD_PAD: continue
            SHORT.append((s,e))
events=[(s,e,"trim") for s,e in gaps]+[(s,e,"extend") for s,e in SHORT]
for s,e,kind in sorted(events):
    if kind=="extend":
        mid=(s+e)/2; extra=HOLD_PAD-(e-s)
        if mid-extra<s: sys.exit(f"vo_hold: the pause at {s:.2f}s is too short to repeat {extra:.2f}s of its own middle")
        segs.append((cur, mid)); cur=mid-extra
        print(f"  short hold {s:.2f}s: {e-s:.2f}s -> {HOLD_PAD:.2f}s")
        continue
    pad = HOLD_PAD if any(abs(s-h)<0.05 for h in HOLDS) else PAD
    lp=[v for k,v in (LONG.items() if 'LONG' in dir() else []) if abs(s-k)<0.05]
    if lp and lp[0]>e-s:
        # the extra may exceed half the pause: repeat a window of its middle as many times as needed
        mid=(s+e)/2; extra=lp[0]-(e-s); w=min(0.3,(e-s)/2-0.05)
        if w<0.1: sys.exit(f"vo_hold: the pause at {s:.2f}s is too short to repeat")
        segs.append((cur, mid))
        while extra>0.001:
            t=min(w,extra); segs.append((mid-t, mid)); extra-=t
        cur=mid
        print(f"  long hold {s:.2f}s: {e-s:.2f}s -> {lp[0]:.2f}s")
        continue
    if lp: pad=lp[0]
    segs.append((cur, s+pad/2)); cur=e-pad/2
segs.append((cur,dur))
segs=[(max(0,a),min(dur,b)) for a,b in segs if b-a>0.02]
# ★ V41 (the cloud session: no whisper model) the cut map, raw source ranges in output order, so a transcript of the RAW take
#   is SHIFTED onto the trimmed file (scratchpad/vo/shiftwords.py) instead of re-transcribed (CLAUDE.md, OffCamCelebs 026)
import json as _json
_json.dump({"source": os.path.basename(src), "segs": [[round(a, 4), round(b, 4)] for a, b in segs]}, open("scratchpad/vo/trimmap.json", "w"))
# 3. build filter to concat — NATIVE 44.1 kHz, mono, 16-bit PCM (no resample, no re-encode loss)
parts="".join(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=N/SR/TB[a{i}];" for i,(a,b) in enumerate(segs))
conc="".join(f"[a{i}]" for i in range(len(segs)))+f"concat=n={len(segs)}:v=0:a=1[out]"
subprocess.run([FF+r"\ffmpeg.exe","-y","-i",src,"-filter_complex",parts+conc,"-map","[out]",
    "-ar","44100","-ac","1","-c:a","pcm_s16le","public/vo_trimmed.wav"],check=True,capture_output=True)
info=subprocess.run([FF+r"\ffprobe.exe","-v","error","-show_entries","stream=sample_rate,channels","-show_entries","format=duration","-of","default=noprint_wrappers=1","public/vo_trimmed.wav"],capture_output=True,text=True).stdout
print(f"raw {dur:.1f}s -> trimmed ({len(gaps)} gaps, {len(segs)} segments)")
print(info.strip())
