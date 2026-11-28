# Offline replica of SfxLayer + AudioLayers: per-cue loudness vs the bed and the voice at that moment.
#   python3 scratchpad/sfxaudit.py out/sfx_cues.json   (cues from out/sfxdump.cjs)
import json, re, subprocess, sys, numpy as np
FF="/home/user/ffbin/ffmpeg"; SR=48000; FPS=30
def dec(p, ss=0):
    r=subprocess.run([FF,"-v","error","-ss",str(ss),"-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True)
    return np.frombuffer(r.stdout,np.float32).copy()
src=open("src/bnx/SfxLayer.tsx").read()
even=dict((k,float(v)) for k,v in re.findall(r"^\s+([a-z_0-9]+):\s*([0-9.]+),",src[src.index("const EVEN"):src.index("const PRESENCE")],re.M))
lv=dict((k,float(v)) for k,v in re.findall(r"^\s+([a-z_0-9]+):\s*([0-9.]+),",src[src.index("const LEVEL"):src.index("const GAIN")],re.M)) if "const LEVEL" in src else {}
PRES=float(re.search(r"const PRESENCE = ([0-9.]+)",src).group(1))
main=open("src/w3d/Main.tsx").read()
cues=json.load(open(sys.argv[1]))
N=int(80*SR)
vo=dec("public/vo_trimmed.mp3"); bed=dec("public/music_radiohead.mp3", 0)*0.30
L=max(len(vo),N); vo=np.pad(vo,(0,L-len(vo)))[:L]; bed=np.pad(bed,(0,max(0,L-len(bed))))[:L]
cache={}; sfx=np.zeros(L,np.float32); rows=[]
def db(x): return 20*np.log10(max(x,1e-9))
def rms(a): return float(np.sqrt(np.mean(a*a))) if len(a) else 0
for c in cues:
    s=c["s"]
    if s not in cache: cache[s]=dec(f"public/sfx/{s}.wav")
    a=cache[s]; trim=max(0,-c["at"]); fr=max(0,c["at"]); dur=c["dur"]-trim
    if c.get("rate"): a=np.interp(np.arange(0,len(a),c["rate"]),np.arange(len(a)),a).astype(np.float32)
    seg=a[int(trim/FPS*SR):int((trim+dur)/FPS*SR)]*even[s]*PRES*lv.get(s,1)*c.get("vol",1)
    n_=len(seg); fi=int(c.get("fadeIn",0)/FPS*SR); fo=int(c.get("fade",0)/FPS*SR); env=np.ones(n_,np.float32)
    if fi: env[:min(fi,n_)]*=np.sin(np.pi/2*np.arange(min(fi,n_))/fi)
    if fo: k=min(fo,n_); env[n_-k:]*=np.sin(np.pi/2*np.arange(k)[::-1]/fo)
    seg=seg*env
    i=int(fr/FPS*SR); seg=seg[:max(0,L-i)]; sfx[i:i+len(seg)]+=seg
    # loudest 100 ms of the cue alone, vs bed+voice over the same span
    w=int(0.1*SR); pk=max((rms(seg[j:j+w]) for j in range(0,max(1,len(seg)-w),w//2)),default=0)
    ctx=rms(bed[i:i+len(seg)]+vo[i:i+len(seg)])
    rows.append((fr,s,c.get("vol",1),db(pk),db(pk)-db(ctx)))
for r in sorted(rows): print(f"{r[0]:6.0f} {r[0]/30:6.2f}s {r[1]:32s} vol {r[2]:.2f}  peak {r[3]:6.1f} dBFS  vs bed+vo {r[4]:+6.1f} dB")
import collections
byfam=collections.defaultdict(list)
for r in rows: byfam[r[1]].append(r[4])
print("\nmedian dB vs bed+voice by family:")
for k,v in sorted(byfam.items(), key=lambda kv: -np.median(kv[1])): print(f"  {k:32s} n={len(v):3d} {np.median(v):+6.1f}")
print("bed rms", db(rms(bed[:N])), "voice rms", db(rms(vo[:N])))
np.save("out/sfx_stem.npy", sfx)

mix=vo[:N]+bed[:N]+sfx[:N]; print("mix peak dBFS", db(np.abs(mix).max()), " sfx peak", db(np.abs(sfx).max()))
