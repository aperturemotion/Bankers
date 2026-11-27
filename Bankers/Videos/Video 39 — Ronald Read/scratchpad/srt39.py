#!/usr/bin/env python3
# V39 — the subtitles SRT from take.ts SENT (frames at 30 fps), long sentences split at a comma/colon near the middle (≤ 2 lines of ~42 chars)
import json, re, os, sys
os.chdir(os.path.join(os.path.dirname(__file__), ".."))
src = open("src/w3d/take.ts").read()
SENT = json.loads(re.search(r"export const SENT = (\[.*?\]);", src, re.S).group(1))
def tc(fr):
    ms = round(fr / 30 * 1000); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
def wrap(t, n=42):   # one line if it fits, else two BALANCED lines
    if len(t) <= n: return [t]
    w = t.split(); best = min(range(1, len(w)), key=lambda i: abs(len(" ".join(w[:i])) - len(t) / 2))
    return [" ".join(w[:best]), " ".join(w[best:])]
def fits(t): return all(len(l) <= 46 for l in wrap(t))
cues = []
for s in SENT:
    lines = wrap(s["text"])
    if fits(s["text"]): cues.append((s["at"], s["end"], "\n".join(lines))); continue
    words = s["text"].split(); mid = len(s["text"]) / 2
    cands = [i for i, w in enumerate(words[:-1]) if re.search(r"[,:.]$", w)] + [i - 1 for i, w in enumerate(words) if i > 0 and w in ("and", "then", "thinking", "when", "to")]
    pos = lambda i: len(" ".join(words[:i + 1]))
    i = min(cands, key=lambda i: abs(pos(i) - mid)) if cands else len(words) // 2
    a, b = " ".join(words[:i + 1]), " ".join(words[i + 1:])
    split = s["at"] + (s["end"] - s["at"]) * len(a) / (len(a) + len(b))
    cues.append((s["at"], round(split), "\n".join(wrap(a)))); cues.append((round(split), s["end"], "\n".join(wrap(b))))
out = "".join(f"{k + 1}\n{tc(a)} --> {tc(b)}\n{t}\n\n" for k, (a, b, t) in enumerate(cues))
open(sys.argv[1], "w").write(out); print(len(cues), "cues →", sys.argv[1])
