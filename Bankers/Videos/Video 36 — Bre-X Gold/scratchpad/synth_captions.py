#!/usr/bin/env python3
# ★★ PROVISIONAL — SYNTHETIC WORD TIMING. Video 36 "Bre-X Gold" has NO TAKE YET (the ElevenLabs generation waits on Timur).
# This writes src/bnx/episode.json (script, labels, WD) and src/bnx/captions.ts (Video 35's exact export shape) from
# VO_SCRIPT.txt on a MODELLED read, so the whole film can be built and re-timed: every place keys to WORDS (W_ in
# Composition.tsx), never to a typed frame. When the real take lands, scratchpad/captions_vo.js (the real-take generator,
# re-pointed to this film) regenerates captions.ts from the take and everything moves with it.
#
#   python3 scratchpad/synth_captions.py              (re-runnable; reads VO_SCRIPT.txt + Composition.tsx's CLOSE_PLAN)
#   python3 scratchpad/synth_captions.py --calibrate  (re-derives RATE on Video 35's own take and prints it; writes nothing)
#
# THE MODEL (Jon – Calm Presence, eleven_v4, as measured on Video 35's trimmed take):
#   · speech: each spoken word lasts (its syllable weight) / RATE seconds, weight = max(1, syllables / 1.5), so short words
#     count as one word and long ones (Indonesia, insignificant, the spelled-out numbers: "nineteen ninety-three") count by
#     their syllables. RATE is CALIBRATED: the same model + the same pauses, run on Video 35's own script, reproduces
#     Video 35's measured VO length (2092 f). See --calibrate.
#   · pauses: 0.12 s after a comma/colon inside a sentence, 0.30 s between sentences of one place, a 0.50 s hold at every
#     place change (hero cards included), 0.65 s after the hook.
#   · the close: no spoken question (CONTENT: the story format ends on the lesson; the question lives in the post caption).
#     The tail after the last word is Composition.tsx's CLOSE_PLAN (ruleHold + close + brand), read from there (one copy).
import json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FPS = 30
HERO_LEAD = 5          # captions_vo.js: a hero paints 5 f before its first word
MAX_CHUNK = 4          # chips of ≤ 4 words, balanced
FADE, MIN_HOLD = 9, 12

# ── the model's constants ────────────────────────────────────────────────────────────────────────────────────────────
# RATE: syllable-weighted words per second of SPEECH. --calibrate on Video 35 (2026-11-23): 3.926 → the model, with the pauses
# below, gives Video 35's script its measured 2092-f VO exactly (= 3.24 spoken words/s while speaking, 2.75 gross; Video 35's
# 182-ish script words over 69.7 s is the "≈ 2.6 words/s" figure). Its sentence starts land a mean 1.2 s (worst 2.1 s) EARLY
# mid-film against the real read — the real take re-times everything anyway.
RATE = 3.926
P_CLAUSE = 0.12        # after "," / ":" / ";" inside a sentence
P_SENT = 0.30          # between two sentences of the same place
P_PLACE = 0.50         # the hold at every place change (and into / out of a hero card)
P_HOOK = 0.65          # after the hook
SYL_PER_UNIT = 1.5

# ── the film: scene ids in order, sentences per scene (the "/" split points of PLAN.md's SCRIPT), hero flags ─────────────
# (the close has NO line: it is the house close — flare 2, the white stage, BANKER$ — after the lesson's last word)
SCENE_PLAN = [
    ("hook", 2, False),
    ("claim", 1, False),
    ("claim2", 1, False),
    ("hype", 2, False),
    ("partner", 1, False),     # THE TURN — LightBreak 1 on "That March"
    ("mystery", 1, False),
    ("crack", 1, False),
    ("truth", 1, False),       # the ONE light window (the white stage)
    ("collapse", 2, False),
    ("pension", 1, False),
    ("fair", 1, True),         # HERO card + LightBreak 2: "To be fair, no one was ever convicted."
    ("felderhof", 1, False),
    ("lesson", 1, True),       # HERO card: "The lesson: a company's own results aren't proof."
    ("rule", 1, False),
]
CLOSE_ID = "close"

# ── spoken → caption: numbers on screen as numerals (house style). (spoken tokens, caption tokens, which spoken tokens each
#    caption token covers — its timing span). Matched on lower-case, punctuation-free spoken tokens; the group's trailing
#    punctuation stays on its last caption token.
NUMERALS = [
    (["six", "billion", "dollar"], ["$6", "billion"], [[0], [1, 2]]),
    (["nineteen", "ninety-three"], ["1993"], [[0, 1]]),
    (["nineteen", "ninety-seven"], ["1997"], [[0, 1]]),
    (["nineteen", "ninety-six"], ["1996"], [[0, 1]]),
    (["seventy-one", "million"], ["71", "million"], [[0], [1]]),
    (["six", "cents"], ["6", "cents"], [[0], [1]]),
    (["forty", "thousand"], ["40,000"], [[0, 1]]),
    (["a", "hundred", "million", "dollars"], ["$100", "million"], [[0, 1], [2, 3]]),
    (["eighty-four", "million", "dollars"], ["$84", "million"], [[0], [1, 2]]),
    (["two", "thousand", "one"], ["2001"], [[0, 1, 2]]),
    (["march", "nineteenth"], ["March", "19th"], [[0], [1]]),
    (["may", "fourth"], ["May", "4th"], [[0], [1]]),
]
# spelled-out number words that must NOT survive into a caption ("Two days later", "no one", "an independent one" stay words)
NUMBER_WORDS = {"six", "nineteen", "ninety-three", "ninety-seven", "ninety-six", "seventy-one", "forty", "thousand", "hundred",
                "eighty-four", "nineteenth", "fourth", "dollar", "dollars"}

# ── every on-screen label from PLAN.md (Anton, ≤ 4 words). WD is what the film reads at runtime (data.ts L(key)). ─────────
LABELS = {
    # hook — the drill core glitters, swells into a towering gold bar stamped C$6 BILLION
    "hookFigure":      ("hook", "C$6 BILLION", "stamped on the gold bar, large, early in its rise (FACTCHECK: Maclean's / Reuters)"),
    "hookLabel":       ("hook", "PEAK VALUE", "the hook's one label (FACTCHECK: peak market value, 1996)"),
    # claim — wooden core boxes stencilled BUSANG on a drill pad
    "claimStencil":    ("claim", "BUSANG", "stencilled on the core boxes"),
    "claimPlate":      ("claim", "BRE-X · 1993", "the plate on the stack (object print)"),
    "claimCity":       ("claim", "CALGARY", "label"),
    # claim2 — a drum COUNTER rolling to 70,950,000 OZ
    "claim2Readout":   ("claim2", "70,950,000 OZ", "the counter's drums (Bre-X release, Feb 17, 1997)"),
    "claim2Label":     ("claim2", "71M OZ CLAIMED", "label"),
    "claim2Date":      ("claim2", "FEB 1997", "label"),
    # hype — a one-cent coin grows into the hook's gold bar; three engraved pension plaques
    "hypeFrom":        ("hype", "PENNIES", "the coin's plinth"),
    "hypeTo":          ("hype", "C$6B", "the bar"),
    "hypePlaqueOtpp":  ("hype", "ONTARIO TEACHERS'", "engraved plaque (name only, no logo)"),
    "hypePlaqueOmers": ("hype", "OMERS", "engraved plaque"),
    "hypePlaqueCaisse": ("hype", "CAISSE", "engraved plaque (Caisse de dépôt et placement du Québec)"),
    # partner — two drill rigs side by side
    "partnerBrex":     ("partner", "BRE-X", "plate on Bre-X's rig"),
    "partnerPlate":    ("partner", "FREEPORT-McMoRAN", "plate on the partner's rig"),
    "partnerDate":     ("partner", "MARCH 1997", "label"),
    # mystery — plain and respectful: a helicopter on its pad at dusk lifting away out of frame. No fall shown.
    "mysteryDate":     ("mystery", "MARCH 19, 1997", "label"),
    "mysteryName":     ("mystery", "MICHAEL DE GUZMAN", "name label"),
    "mysteryRole":     ("mystery", "CHIEF GEOLOGIST", "under the name"),
    # crack — the partner's own core split lengthwise: grey through and through
    "crackLabel":      ("crack", "INSIGNIFICANT GOLD", "label (Freeport 8-K)"),
    "crackDate":       ("crack", "MARCH 26, 1997", "label"),
    # truth — the hero core under a jeweller's loupe (the white stage)
    "truthLabel":      ("truth", "SALTED", "label"),
    "truthDate":       ("truth", "MAY 4, 1997", "label"),
    # collapse — the hook's bar crumbles to rock dust; a price tag flips; a grid of certificates goes dark
    "collapseFrom":    ("collapse", "C$6 BILLION", "the price tag before the flip"),
    "collapseTo":      ("collapse", "6¢", "the price tag after the flip (C$0.06)"),
    "collapseDate":    ("collapse", "MAY 6, 1997", "label"),
    "collapseHolders": ("collapse", "~40,000 SHAREHOLDERS", "the certificate grid (Globe and Mail, 2013 estimate)"),
    # pension — a vault drawer marked ONTARIO TEACHERS' slides out and empties
    "pensionDrawer":   ("pension", "ONTARIO TEACHERS'", "engraved on the drawer"),
    "pensionLoss":     ("pension", "C$100M LOST", "label"),
    # felderhof — banded cash bundles stacking to C$84M (the film's ONE bar scene); a gavel: NOT GUILTY
    "felderhofFigure": ("felderhof", "C$84M", "the cash stack's figure (C$83.96M, OSC)"),
    "felderhofLabel":  ("felderhof", "STOCK SOLD", "label"),
    "felderhofYear":   ("felderhof", "1996", "label"),
    "felderhofVerdict": ("felderhof", "NOT GUILTY", "lands with the gavel"),
    "felderhofDate":   ("felderhof", "JULY 31, 2007", "label (OSC release)"),
    # rule — the hero core tray under an embossed steel seal
    "ruleSeal":        ("rule", "QUALIFIED PERSON", "embossed on the seal"),
    "ruleCode":        ("rule", "NI 43-101", "on the seal"),
    "ruleYear":        ("rule", "2001", "on the seal"),
    "ruleIndependent": ("rule", "INDEPENDENT", "the second, smaller seal (builder C)"),
}

# ── syllables: a heuristic, with this script's exceptions spelled out (checked by eye: --syl prints every word) ─────────────
SYL_FIX = {"sprinkled": 2, "that's": 1, "calgary": 3, "bre-x": 2, "bre-x's": 3, "borneo": 3, "indonesia": 5, "ninety-three": 3,
           "ninety-seven": 3, "ninety-six": 3, "seventy-one": 4, "ounces": 2, "pennies": 2, "piled": 1, "drilled": 1,
           "geologist": 4, "michael": 2, "de": 1, "guzman": 2, "helicopter": 4, "insignificant": 4, "independent": 4,
           "auditors": 3, "confirmed": 2, "salted": 2, "outside": 2, "shareholders": 3, "wiped": 1, "ontario": 4,
           "teachers'": 2, "fair": 1, "convicted": 3, "exploration": 4, "felderhof": 3, "eighty-four": 3, "guilty": 2,
           "insider": 3, "trading": 2, "lesson": 2, "company's": 3, "results": 2, "aren't": 1, "canadian": 4, "miners": 2,
           "qualified": 3, "expert's": 2, "sign-off": 2, "often": 2, "nineteenth": 2, "fourth": 1, "every": 2, "being": 2,
           "chief": 1, "reported": 3, "amounts": 2, "samples": 2, "partner": 2, "dollars": 2, "dollar": 2, "billion": 2,
           "million": 2, "thousand": 2, "hundred": 2, "nineteen": 2, "forty": 2, "seventy": 3, "eighty": 2, "ninety": 2,
           "twenty": 2, "fiscal": 2, "lottery": 3, "lotteries": 3, "americans": 4, "virginia": 4, "powerball": 3,
           "average": 3, "census": 2, "bureau": 2, "doubled": 2, "prizes": 2, "favors": 2, "expected": 3, "value": 2,
           "jackpots": 2, "jackpot": 2, "understands": 3, "schools": 1, "states": 1, "missed": 1, "varies": 2, "honest": 2,
           "nobody": 3, "single": 2, "number": 2, "country": 2, "ticket": 2, "tickets": 2, "little": 2, "toward": 2,
           "after": 2, "paid": 1, "spent": 1, "stayed": 1, "drawn": 1, "worth": 1, "costs": 1, "grew": 1, "won": 1}


def syl_word(w):
    k = re.sub(r"[^a-z'\-]", "", w.lower()).strip("'")
    if k in SYL_FIX:
        return SYL_FIX[k]
    if "-" in k:
        return sum(syl_word(p) for p in k.split("-") if p)
    s = re.sub(r"[^a-z]", "", k)
    if not s:
        return 0
    n = len(re.findall(r"[aeiouy]+", s))
    if s.endswith("e") and not s.endswith("le") and n > 1:
        n -= 1
    if s.endswith("es") and n > 1 and not re.search(r"(c|g|s|x|z|ch|sh)es$", s):
        n -= 1
    if s.endswith("ed") and n > 1 and not re.search(r"[td]ed$", s):
        n -= 1
    return max(1, n)


def weight(spoken):
    return max(1.0, syl_word(spoken) / SYL_PER_UNIT)



def split_sentences(text):
    text = re.sub(r"\s+", " ", text.strip())
    return [s for s in re.split(r"(?<=[.!?])\s+", text) if s]


def to_caption(sentence):
    """spoken sentence → [(caption_token, [spoken tokens it covers])]"""
    sp = sentence.split(" ")
    keys = [re.sub(r"[^a-z0-9\-]", "", t.lower()) for t in sp]
    out, i = [], 0
    while i < len(sp):
        hit = None
        for pat, cap, groups in NUMERALS:
            if keys[i:i + len(pat)] == pat:
                hit = (pat, cap, groups)
                break
        if not hit:
            out.append((sp[i], [sp[i]]))
            i += 1
            continue
        pat, cap, groups = hit
        span = sp[i:i + len(pat)]
        tail = re.search(r"[.,:;!?]+$", span[-1])
        for j, (c, g) in enumerate(zip(cap, groups)):
            tok = c + (tail.group(0) if tail and j == len(cap) - 1 else "")
            out.append((tok, [span[x] for x in g]))
        i += len(pat)
    for tok, _ in out:
        if re.sub(r"[^a-z\-]", "", tok.lower()) in NUMBER_WORDS:
            raise SystemExit(f"REFUSED: the spelled-out number \"{tok}\" would reach a caption — add its numeral form to NUMERALS ({sentence})")
    return out


def model(lines, rate):
    """lines: [{scene, hero, toks:[(caption, [spoken])]}] → timed words [{word, a, b, line}] (seconds)"""
    t, words = 0.0, []
    for li, ln in enumerate(lines):
        if li > 0:
            prev = lines[li - 1]
            if prev["scene"] == lines[0]["scene"] and ln["scene"] != prev["scene"]:
                t += P_HOOK
            elif ln["scene"] != prev["scene"] or ln["hero"] != prev["hero"]:
                t += P_PLACE
            else:
                t += P_SENT
        for k, (cap, spoken) in enumerate(ln["toks"]):
            d = sum(weight(s) for s in spoken) / rate
            words.append({"word": cap, "a": t, "b": t + d, "line": li})
            t += d
            if k < len(ln["toks"]) - 1 and re.search(r"[,:;]$", spoken[-1]):
                t += P_CLAUSE
    return words


# ── THE REAL TAKE (--take) ───────────────────────────────────────────────────────────────────────────────────────────────
# V36 take B (2026-11-23, ElevenLabs "Jon - Calm Presence", eleven_v4): scratchpad/fw_words.json holds Scribe's words on the RAW take,
# shifted through vo_trim.py's cut map (vo/shiftwords.py) and scaled for the ×1.04 fit. The script's spoken tokens are aligned to them
# ONE TO ONE (Scribe read the script word for word: 187 of 187) — any mismatch refuses. Then the waveform corrects Scribe:
#   · a word's END that falls inside a pause is pulled back to where the speech stops (Scribe stretches a word over the pause after
#     it; Video 35's "fun." caption stayed up through a crane that way — its RETIME fix);
#   · a word's START up to 0.25 s after a pause ends moves to the measured onset (root VO pipeline step 6: late starts walk back).
def pauses_of(wav):
    import subprocess
    ff = os.environ.get("FFMPEG", "/home/user/ffbin/ffmpeg")
    out = subprocess.run([ff, "-i", wav, "-af", "silencedetect=noise=-38dB:d=0.12", "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(m) for m in re.findall(r"silence_start: ([\d.]+)", out)]
    en = [float(m) for m in re.findall(r"silence_end: ([\d.]+)", out)]
    return list(zip(st, en))


def from_take(lines):
    fw = json.load(open(os.path.join(HERE, "fw_words.json"), encoding="utf8"))["words"]
    key = lambda t: re.sub(r"[^a-z0-9]", "", t.lower())
    spoken = [(li, ti, sp) for li, ln in enumerate(lines) for ti, (_, sps) in enumerate(ln["toks"]) for sp in sps]
    if len(spoken) != len(fw):
        raise SystemExit(f"REFUSED: the script has {len(spoken)} spoken tokens, the take {len(fw)} words — not read as written")
    for (li, ti, sp), w in zip(spoken, fw):
        if key(sp) != key(w["t"]):
            raise SystemExit(f"REFUSED: script \"{sp}\" vs take \"{w['t']}\" (line {li}) — the take diverges from VO_SCRIPT.txt")
    wav = os.path.join(ROOT, "public", "vo_trimmed.wav")
    import subprocess
    dur = float(subprocess.run([os.environ.get("FFPROBE", "/home/user/ffbin/ffprobe"), "-v", "error", "-show_entries", "format=duration",
                                "-of", "csv=p=0", wav], capture_output=True, text=True).stdout.strip())
    gaps = pauses_of(wav)
    A = [w["a"] for w in fw]
    B = [min(w["b"], dur) for w in fw]
    moved = []
    # ★ pass 1 — every real pause (≥ 0.2 s) is a word boundary: the word after it starts at the pause's end, the word before it ends at
    #   the pause's start. Scribe sometimes stamps a sentence's LAST word inside the pause after it ("out." at 55.04 raw, after a
    #   0.6-s silence that began at 54.51): that word is moved back before the pause, where the speech is.
    for s0, e0 in gaps:
        if e0 - s0 < 0.2:
            continue
        j = next((k for k in range(1, len(fw)) if A[k] >= e0 - 0.2 and A[k - 1] < e0 - 0.2), None)
        if j is None:
            continue
        # a word lying wholly inside the pause is the one BEFORE it, mis-stamped (Scribe): the word after the pause is the next one
        if j + 1 < len(fw) and B[j] <= e0 + 0.03 and A[j] > s0 + 0.05:
            j += 1
        i = j - 1
        if abs(A[j] - e0) > 0.02:
            moved.append(f"start {fw[j]['t']} {A[j]:.2f}->{e0:.2f} (pause end)")
            A[j] = e0
        if A[i] >= s0 - 0.06:
            prev_end = B[i - 1] if i > 0 else 0.0
            na = max(prev_end, s0 - 0.25)
            if i > 0 and na > s0 - 0.08:          # the word before was stretched over both (Scribe): they split the speech
                na = (A[i - 1] + s0) / 2
            moved.append(f"word {fw[i]['t']} {A[i]:.2f}-{B[i]:.2f} -> {na:.2f}-{s0:.2f} (was stamped in the pause)")
            A[i] = na
            if i > 0 and B[i - 1] > na:
                B[i - 1] = na
        if B[i] > s0 + 0.02:
            moved.append(f"end {fw[i]['t']} {B[i]:.2f}->{s0:.2f} (pause start)")
            B[i] = max(A[i] + 0.04, s0)
    for i in range(len(fw)):
        for s0, e0 in gaps:
            if s0 < B[i] < e0 and (i + 1 == len(fw) or A[i + 1] >= e0 - 0.02):
                moved.append(f"end {fw[i]['t']} {B[i]:.2f}->{s0:.2f}")
                B[i] = max(A[i] + 0.04, s0)
            if i > 0 and e0 < A[i] <= e0 + 0.25 and B[i - 1] <= s0 + 0.02:
                moved.append(f"start {fw[i]['t']} {A[i]:.2f}->{e0:.2f}")
                A[i] = e0
    for i in range(len(fw)):
        if not (A[i] < B[i] and (i == 0 or B[i - 1] <= A[i] + 1e-6)):
            raise SystemExit(f"REFUSED: word {i} {fw[i]['t']} has a bad span {A[i]:.3f}-{B[i]:.3f} after the corrections")
    print(f"take: {len(fw)} words aligned 1:1 · {len(gaps)} pauses · {len(moved)} waveform corrections")
    for m in moved:
        print("   ", m)
    words, k = [], 0
    for li, ln in enumerate(lines):
        for cap, sps in ln["toks"]:
            n = len(sps)
            words.append({"word": cap, "a": A[k], "b": B[k + n - 1], "line": li})
            k += n
    return words, dur


# ── calibration on Video 35's own take ────────────────────────────────────────────────────────────────────────────────────
V35_SPOKEN = {"$104.7": "one hundred four point seven", "2024": "twenty twenty-four", "$52.8": "fifty-two point eight",
              "2008.": "two thousand eight.", "$70.2": "seventy point two", "$34.5": "thirty-four point five",
              "67": "sixty-seven", "80": "eighty", "$847": "eight hundred forty-seven", "4": "fourth",
              "billion": "billion dollars", "billion.": "billion dollars.", "million": "million dollars"}


def calibrate():
    src = open(os.path.join(ROOT, "..", "Video 35 — Lottery Tear", "src", "bnx", "captions.ts"), encoding="utf8").read()
    S = json.loads(re.search(r"export const SENTENCES = (\[.*?\]);", src).group(1))
    vo_end = int(re.search(r"VO_END_FRAME = (\d+)", src).group(1))
    lines = []
    for s in S:
        toks = []
        for w in s["text"].split(" "):
            sp = V35_SPOKEN.get(w, w)
            if w in ("billion", "billion.", "million") and not re.search(r"\$", s["text"]):
                sp = w
            toks.append((w, sp.split(" ")))
        lines.append({"scene": s["scene"], "hero": s["hero"], "toks": toks})
    lo, hi = 1.5, 5.0
    for _ in range(60):
        mid = (lo + hi) / 2
        end = model(lines, mid)[-1]["b"] * FPS
        lo, hi = (mid, hi) if end > vo_end else (lo, mid)
    r = (lo + hi) / 2
    ws = model(lines, r)
    n_sp = sum(len(sp) for ln in lines for _, sp in ln["toks"])
    speech = sum(w["b"] - w["a"] for w in ws)
    print(f"Video 35: VO {vo_end} f ({vo_end / FPS:.1f} s) · {n_sp} spoken words")
    print(f"  calibrated RATE = {r:.3f} syllable-weighted words/s of speech")
    print(f"  = {n_sp / speech:.2f} spoken words/s while speaking · {n_sp / (vo_end / FPS):.2f} words/s gross (pauses included)")
    # how well the model places V35's sentence starts (a sanity check, not a fit target)
    first = {}
    for w in ws:
        first.setdefault(w["line"], w["a"])
    errs = [first[i] * FPS - s["at"] for i, s in enumerate(S)]
    print(f"  sentence-start error vs the real take: mean {sum(abs(e) for e in errs) / len(errs):.1f} f, worst {max(errs, key=abs):+.0f} f")
    return r


def read_close_plan():
    comp = open(os.path.join(ROOT, "src", "bnx", "Composition.tsx"), encoding="utf8").read()
    m = re.search(r"const CLOSE_PLAN = \{\s*ruleHold:\s*(\d+),\s*close:\s*(\d+),\s*brand:\s*(\d+)\s*\}", comp)
    if not m:
        raise SystemExit("REFUSED: no `const CLOSE_PLAN = { ruleHold: N, close: N, brand: N }` in src/bnx/Composition.tsx (one copy)")
    return dict(ruleHold=int(m.group(1)), close=int(m.group(2)), brand=int(m.group(3)))


def main():
    if "--calibrate" in sys.argv:
        calibrate()
        return
    vo = open(os.path.join(ROOT, "VO_SCRIPT.txt"), encoding="utf8").read()
    sents = split_sentences(vo)
    want = sum(n for _, n, _ in SCENE_PLAN)
    if len(sents) != want:
        raise SystemExit(f"REFUSED: VO_SCRIPT.txt has {len(sents)} sentences, SCENE_PLAN expects {want} — the script changed; re-split")
    n_words = len(vo.split())
    lines, k = [], 0
    for scene, n, hero in SCENE_PLAN:
        for _ in range(n):
            lines.append({"scene": scene, "hero": hero, "vo": sents[k], "toks": to_caption(sents[k])})
            k += 1
    for ln in lines:
        ln["take"] = " ".join(c for c, _ in ln["toks"])

    if "--syl" in sys.argv:
        for w in sorted({re.sub(r"[.,:;!?]+$", "", s) for ln in lines for _, sp in ln["toks"] for s in sp}, key=str.lower):
            print(f"{syl_word(w)}  {w}")
        return

    plan = read_close_plan()
    TAKE = "--take" in sys.argv
    if TAKE:
        timed, take_dur = from_take(lines)
    else:
        timed = model(lines, RATE)
    words = [{"word": w["word"], "at": round(w["a"] * FPS), "end": round(w["b"] * FPS), "line": w["line"]} for w in timed]
    for i in range(1, len(words)):
        if words[i]["at"] <= words[i - 1]["at"]:
            raise SystemExit(f"REFUSED: word order {words[i - 1]} → {words[i]}")
    vo_end = words[-1]["end"]
    rule_end = vo_end + plan["ruleHold"]
    total = rule_end + plan["close"] + plan["brand"]

    scene_of = [lines[w["line"]]["scene"] for w in words]
    ids = []
    for ln in lines:
        if ln["scene"] not in ids:
            ids.append(ln["scene"])
    first_word = {}
    for i, s in enumerate(scene_of):
        first_word.setdefault(s, i)
    SCENES = []
    for i, sid in enumerate(ids):
        if i == 0:
            SCENES.append({"id": sid, "index": 0, "startFrame": 0})
            continue
        fi = first_word[sid]
        gap = words[fi]["at"] - words[fi - 1]["end"]
        SCENES.append({"id": sid, "index": i, "startFrame": words[fi]["at"] - min(8, max(1, gap // 2))})
    SCENES.append({"id": CLOSE_ID, "index": len(ids), "startFrame": rule_end})
    for i, s in enumerate(SCENES):
        s["endFrame"] = SCENES[i + 1]["startFrame"] if i + 1 < len(SCENES) else total
    last_end = {}
    for i, w in enumerate(words):
        last_end[scene_of[i]] = w["end"]

    # chips + heroes: captions_vo.js's own logic
    events = []
    for li, ln in enumerate(lines):
        ws = [w for w in words if w["line"] == li]
        if ln["hero"]:
            events.append({"kind": "hero", "scene": ln["scene"], "at": ws[0]["at"], "words": ws, "last": ws[-1]})
        else:
            nC = math.ceil(len(ws) / MAX_CHUNK)
            base, extra = divmod(len(ws), nC)
            kk = 0
            for c in range(nC):
                size = base + (1 if c < extra else 0)
                ch = ws[kk:kk + size]
                kk += size
                events.append({"kind": "chip", "scene": ln["scene"], "at": ch[0]["at"], "text": " ".join(x["word"] for x in ch),
                               "endAudio": ch[-1]["end"], "parts": [{"word": x["word"], "at": x["at"]} for x in ch]})
    events.sort(key=lambda e: e["at"])
    audio_end = lambda e: e["last"]["end"] if e["kind"] == "hero" else e["endAudio"]
    for i, e in enumerate(events):
        e["paint"] = max(e["at"] - HERO_LEAD, audio_end(events[i - 1]) + 1 if i > 0 else 0) if e["kind"] == "hero" else e["at"]
    TICKER, HEROES = [], []
    for i, e in enumerate(events):
        nxt = events[i + 1] if i + 1 < len(events) else None
        next_shows = nxt["paint"] if nxt else total
        if e["kind"] == "hero":
            end = min(next_shows, max(e["at"] + 14, min(e["last"]["at"] + 28, next_shows)))
            if not nxt:
                end = total
            HEROES.append({"scene": e["scene"], "start": e["at"], "paint": e["paint"], "end": end,
                           "words": [{"word": x["word"], "at": x["at"]} for x in e["words"]]})
        else:
            TICKER.append({"word": e["text"], "at": e["at"], "until": min(e["endAudio"] + 4, next_shows), "parts": e["parts"]})
    spans = sorted([(t["at"], t["until"]) for t in TICKER] + [(h["paint"], h["end"]) for h in HEROES])
    for (a0, b0), (a1, b1) in zip(spans, spans[1:]):
        if a1 < b0:
            raise SystemExit(f"REFUSED: two captions at once @{a1}")

    SENTENCES = [{"scene": ln["scene"], "at": [w for w in words if w["line"] == li][0]["at"],
                  "end": [w for w in words if w["line"] == li][-1]["end"], "hero": ln["hero"], "text": ln["take"]}
                 for li, ln in enumerate(lines)]
    WORDS = [{"word": w["word"], "at": w["at"]} for w in words]
    J = lambda o: json.dumps(o, ensure_ascii=False, separators=(", ", ": "))

    head = (f"""// @ts-nocheck
// THE TAKE — Video 36 "Bre-X Gold", take B (2026-11-23): ElevenLabs "Jon - Calm Presence", eleven_v4, generated from VO_SCRIPT.txt
// (read word for word: Scribe 187 of 187). 82.3 s raw → trimmed (0.30-s pauses inside a scene, 0.45 s at scene changes, longer holds at flare 1 and both breaks:
// scratchpad/vo_hold.json) → ×1.04 atempo fit, pitch kept (the 80-s cap) = {take_dur:.2f} s, public/vo_trimmed.wav/.mp3. GENERATED by
// `python3 scratchpad/synth_captions.py --take` from scratchpad/fw_words.json — DO NOT EDIT. Places key to WORDS through W_.
export const PROVISIONAL = false;
""" if TAKE else f"""// @ts-nocheck
// ★★ PROVISIONAL (synthetic timing) — Video 36 "Bre-X Gold" has NO TAKE YET. GENERATED by scratchpad/synth_captions.py from
// VO_SCRIPT.txt on a modelled read (Jon – Calm Presence's pace, calibrated on Video 35's take: RATE {RATE} syllable-weighted
// words/s, 0.30-s sentence pauses, a 0.50-s hold at every place change, 0.65 s after the hook). DO NOT EDIT — re-run the
// generator; when the real take lands, `--take` regenerates this file from it (same export shape).
// Places key to WORDS through W_ in Composition.tsx, never to a typed frame, so the film re-times itself.
export const PROVISIONAL = true;
""")
    ts = head + f"""

export const FPS = {FPS};
export const TOTAL_FRAMES = {total};
export const VO_END_FRAME = {vo_end};
export const VO_LEAD = 0;
export const SCENES = {J(SCENES)};
export const BANNER_END = {SCENES[1]["startFrame"]};
export const SENTENCES = {J(SENTENCES)};
export const TICKER = {J(TICKER)};
export const HEROES = {J(HEROES)};
export const WORDS = {J(WORDS)};
export const LAST_WORD_END = {J(last_end)};
export const sceneById = (id) => {{
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error("no scene " + id);
  return s;
}};
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9$%&]/g, "");
const ALL = WORDS;
const SCENE_OF = {J(scene_of)};
export const wordFrame = (scene, word, occ = 1) => {{
  const n = norm(word);
  let seen = 0;
  for (let i = 0; i < ALL.length; i++) {{
    if (SCENE_OF[i] !== scene) continue;
    if (norm(ALL[i].word) === n && ++seen === occ) return ALL[i].at;
  }}
  throw new Error('wordFrame: no "' + word + '" (#' + occ + ") in " + scene);
}};
export const heroAt = (f) => HEROES.find((h) => f >= h.paint && f < h.end);
"""
    with open(os.path.join(ROOT, "src", "bnx", "captions.ts"), "w", encoding="utf8") as fh:
        fh.write(ts)
    # the synthetic word spans in the take's format (seconds), for the tools' silence checks (audit.mjs reads syn_words.json while
    # there is no fw_words.json; the real take's fw.py writes fw_words.json, which then wins)
    if not TAKE:
     with open(os.path.join(HERE, "syn_words.json"), "w", encoding="utf8") as fh:
        json.dump({"_doc": "PROVISIONAL synthetic word spans (scratchpad/synth_captions.py) — NOT a take", "words": [
            {"t": w["word"], "a": round(w["a"], 3), "b": round(w["b"], 3)} for w in timed]}, fh, ensure_ascii=False)

    episode = {
        "_doc": [
            "Video 36 \"Bre-X Gold\". WRITTEN by scratchpad/synth_captions.py — edit the generator (SCENE_PLAN, NUMERALS, LABELS), not this file.",
            "script: one entry per VO line, in order — scene (place id), vo (VO_SCRIPT.txt, spelled out), take (the caption form: numerals per house style; the real-take generator scratchpad/captions_vo.js aligns the take's words to these tokens), hero.",
            "labels: every on-screen label from PLAN.md (Anton, ≤ 4 words), with its place and where it sits. WD is the flat map the film reads at runtime (src/bnx/data.ts L(key)).",
            ("THE TAKE: take B (2026-11-23), generated in ElevenLabs; captions.ts is timed from it (--take)." if TAKE else "PROVISIONAL: the take does not exist yet; captions.ts is synthetic until it lands."),
        ],
        "script": [dict({"scene": ln["scene"], "vo": ln["vo"], "take": ln["take"]}, **({"hero": True} if ln["hero"] else {})) for ln in lines],
        "labels": {k: {"place": p, "text": t, "note": n} for k, (p, t, n) in LABELS.items()},
        "WD": {k: t for k, (p, t, n) in LABELS.items()},
    }
    for k, (p, t, n) in LABELS.items():
        if len(t.split()) > 4:
            raise SystemExit(f"REFUSED: label {k} \"{t}\" is over 4 words")
    with open(os.path.join(ROOT, "src", "bnx", "episode.json"), "w", encoding="utf8") as fh:
        json.dump(episode, fh, ensure_ascii=False, indent=2)
        fh.write("\n")

    n_sp = sum(len(sp) for ln in lines for _, sp in ln["toks"])
    print(f"{'TAKE' if TAKE else 'PROVISIONAL'} captions: {len(WORDS)} caption words ({n_words} script words, {n_sp} spoken) · {len(TICKER)} chips · {len(HEROES)} heroes")
    print(f"VO ends {vo_end} f ({vo_end / FPS:.1f} s) · gross {n_words / (vo_end / FPS):.2f} script words/s · TOTAL {total} f ({total / FPS:.1f} s)")
    print("scenes: " + " ".join(f"{s['id']}@{s['startFrame']}" for s in SCENES))


if __name__ == "__main__":
    main()
