# copy a renderFrames range into a full sequence, NORMALISING names to 4 digits (renderFrames pads to the range's own
# width: a range under 1000 writes element-228.jpeg, which sat BESIDE element-0228.jpeg and replaced nothing)
#   python scratchpad/putframes.py <src=out/fr_tmp> <dst=out/full4>
import os, re, shutil, sys
src, dst = sys.argv[1], sys.argv[2]
n = 0
for fn in os.listdir(src):
    m = re.match(r"element-(\d+)\.jpeg$", fn)
    if m: shutil.copyfile(os.path.join(src, fn), os.path.join(dst, f"element-{int(m.group(1)):04d}.jpeg")); n += 1
# and fold any stray short names already in dst
for fn in os.listdir(dst):
    m = re.match(r"element-(\d{1,3})\.jpeg$", fn)
    if m: os.remove(os.path.join(dst, fn))
print(f"{n} frames placed in {dst}; stray short names removed")
