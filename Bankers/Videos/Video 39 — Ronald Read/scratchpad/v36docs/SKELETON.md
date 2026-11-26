# Video 36 "Bre-X Gold" — the SKELETON (integrator, 2026-11-23)

Composition **`BreXGold`** · 1080×1920 · 30 fps · **2227 f = 74.2 s** (PROVISIONAL) · output `out/bre_x_gold.mp4` · Studio port 3436.

## ★ PROVISIONAL TIMING — there is no take yet
- `src/bnx/captions.ts` is **synthetic** (`export const PROVISIONAL = true`), written by `python3 scratchpad/synth_captions.py` from
  `VO_SCRIPT.txt` (17 sentences, 187 words). Re-run it after any script change; it also writes `src/bnx/episode.json`
  (`script`, `labels`, `WD`) and `scratchpad/syn_words.json` (the audit's synthetic word spans).
- The model: each spoken word lasts its syllable weight (max(1, syllables/1.5)) ÷ RATE; pauses 0.12 s at a comma/colon, 0.30 s between
  sentences of one place, a 0.50 s hold at every place change (heroes included), 0.65 s after the hook. **RATE 3.926 is calibrated on
  Video 35's take**: the same model + pauses on V35's script gives V35's measured 2092-f VO exactly (`--calibrate`). On this script it
  gives a 70.3-s VO = **2.66 script words/s gross** (the "≈ 2.6 words/s" figure). Against V35's real read the model's sentence starts ran
  a mean 1.2 s (worst 2.1 s) early mid-film — treat every frame below as ± 2 s.
- **Builders key to WORDS, never to frames**: a place gets `w` = `W_.<id>` (word frames found in the take by `inSen`), so when the take
  lands (`captions_vo.js` → captions.ts, same export shape) everything moves with it. Re-check the 7-s rule on the take.
- The voice is OFF (`HAS_VO = false`): `public/vo_trimmed.mp3` is still Video 35's voice. `render.mjs` refuses while captions are
  PROVISIONAL or HAS_VO is false.

## The place table (provisional frames)
A place's `at`–`end` is `P.<id>` in Composition.tsx (its cut to its hand-over). Enter/exit are the hand-over kinds (`HO`).

| # | place | at–end (f) | dur | enter | exit | notes |
|---|---|---|---|---|---|---|
| 1 | hook | 0–182 | 6.07 s | own (frame 0) | **pushLight** → flare 1 (164–184) | subtitle-free (BANNER_END 174); payoff "$6"@120 → flare 1 grows from 156 |
| 2 | claim | 182–391 | **6.97 s** ⚠ | approach (184, 36 f) out of flare 1 | craneDown (371, 40) | at the 7-s limit |
| 3 | claim2 | 391–498 | 3.57 s | fromBelow (371, 40) | craneDown (478, 40) | the film's counter |
| 4 | hype | 498–655 | 5.23 s | fromBelow (478) | craneDown (635, 40) | |
| 5 | partner | 655–770 | 3.83 s | fromBelow (635) | craneDown (750, 40) | **LightBreak 1** peaks 653 on "That March" — the crane runs under the flash |
| 6 | mystery | 770–914 | 4.80 s | fromBelow (750) | craneDown (894, 40) | |
| 7 | crack | 914–1037 | 4.10 s | fromBelow (894) | craneDown (1017, 40) | |
| 8 | truth | 1037–1212 | 5.83 s | fromBelow (1017) | craneDown (1192, 40) | **the ONE light window** (white stage) |
| 9 | collapse | 1212–1389 | 5.90 s | fromBelow (1192) | craneDown (1369, 40) | the film's grid |
| 10 | pension | 1389–1512 | 4.10 s | fromBelow (1369) | craneDown (1478, 36), done by the fair card's paint | |
| — | **fair** (HERO) | paint 1512 · end 1604 | 3.1 s | — | — | **LightBreak 2** peaks 1515; regular hero, accent "fair," |
| 11 | felderhof | 1606–1837 | **7.70 s** ⚠ | fromBelow (1587, 44) under the fair card's end | craneDown (1803, 36), done by the lesson card's paint | the film's ONE bar scene (cash) |
| — | **lesson** (HERO) | paint 1837 · end 1934 | 3.2 s | — | — | PUNCH hero (display face), accent "proof." |
| 12 | rule | 1934–2119 | 6.17 s | fromBelow (1917, 44) under the lesson card's end | **pushLight** → flare 2 (2099–2121) | |
| 13 | close | 2119–2143 | 0.80 s | approach (2121) | own | the house close: no question; flare 2 recedes onto the white stage |
| — | brand | 2143–2227 | 2.80 s | own | own | BANKER$ from 2165 (BrandClose at brand + 22) |

⚠ **Over / at 7 s:** felderhof 7.70 s (its one 24-word sentence) — split it INSIDE the place with an action-camera travel from the cash
stack to the gavel on "and was found not guilty" (found @1768), as STYLE allows ("the camera travels on to a new framing of the same
construction"); claim 6.97 s. Both must be re-measured on the take.

Hero cards are drawn by the composition (HeroSentence), not by a place file. The close is the kit's `close.tsx` (BrandClose, Watermark) —
`close` has no place file (the kit owns that name); `QuestionStage` (null) holds its slot in PLACES.

## Key word frames (W_ in Composition.tsx — provisional)
- **hook** — s0 0 · gold "Gold" 0 · dust "dust," 8 · sprinkled 19 · rock 39 · samples 47 · s1 66 · took 89 · build 104 · k6 "$6" 120 · billion 127 · company 148
- **claim** — s0 182 · k1993 "1993," 190 · tiny 227 · calgary 237 · brex "Bre-X" 270 · bought 280 · jungle 296 · gold 306 · borneo 331 · indonesia 350
- **claim2** — s0 391 · k1997 "1997," 398 · claimed 435 · k71 "71" 443 · million 463 · ounces 473
- **hype** — s0 498 · stock 506 · pennies 529 · k6 "$6" 554 · billion 562 · company 582 · s1 607 · pension 607 · funds 617 · piled 624
- **partner** — s0 655 · march "March," 662 · partner 681 · drilled 691 · test 714 · holes 722 · beside 730 · brexs "Bre-X's." 740
- **mystery** — s0 770 · march 778 · k19 "19th," 785 · chief 799 · geologist 807 · michael 827 · guzman 845 · fell 855 · helicopter 878
- **crack** — s0 914 · week 921 · later 929 · partner 950 · reported 960 · insignificant 976 · gold 1014
- **truth** — s0 1037 · may 1044 · k4 "4th," 1052 · independent 1063 · auditors 1083 · confirmed 1099 · core 1128 · samples 1135 · salted 1161 · outside 1179 · gold 1189
- **collapse** — s0 1212 · days 1219 · shares 1248 · sank 1256 · k6 "6" 1271 · cents 1279 · s1 1295 · about 1295 · k40000 "40,000" 1306 · shareholders 1326 · nearly 1349 · wiped 1359
- **pension** — s0 1389 · ontario 1397 · teachers "Teachers'" 1417 · plan 1438 · alone 1445 · lost 1456 · k100 "$100" 1463 · million 1481
- **fair (hero)** — To 1517 · be 1524 · fair, 1532 · no 1543 · one 1551 · was 1558 · ever 1566 · convicted. 1576
- **felderhof** — s0 1606 · exploration 1606 · john 1634 · felderhof 1642 · sold 1657 · k84 "$84" 1665 · million 1680 · stock 1708 · k1996 "1996," 1724 · found 1768 · not 1776 · guilty 1783 · insider 1801 · trading 1816
- **lesson (hero)** — The 1842 · lesson: 1849 · a 1863 · company's 1871 · own 1886 · results 1894 · aren't 1904 · proof. 1911
- **rule** — s0 1934 · k2001 "2001," 1942 · canadian 1971 · miners 1991 · need 2001 · qualified 2017 · experts "expert's" 2032 · signoff "sign-off," 2042 · often 2063 · independent 2081 · one "one." 2102

Need another word? Add an `inSen("<id>", n, "<caption token>")` line to `W_.<id>` (the integrator's file — say so in the handback).

## Light, flares, breaks
- **Light windows** (`LIGHT_WINDOWS`): truth `{a: P.truth.at − 10, b: P.truth.end, in 20, out 22}` = white 1027→1047, drained 1190→1212;
  the close `{a: P.close.at − 2, b: P.brand.at + 22, in 20, out 26}` = white 2117→2137, drained 2139→2165 (after flare 2's bloom is gone).
  A place gets `stage` = the field's whiteness (0 navy … 1 white) — only truth (and the close) ever see 1.
- **Flare 1** hook → claim: peak 180 (grow 24 / hold 2 / recede 16: 156–198). `from` (540, 640) → `to` (540, 900) are PLACEHOLDERS: the hook
  builder supplies the gold bar's lit crown on screen at ~178, the claim builder a lit point on the BUSANG stack.
- **Flare 2** rule → close: peak 2118 (grow 26 / hold 2 / recede 16: 2092–2136). `from` (540, 760) placeholder: the rule builder supplies the
  steel seal's lit rim; `to` (540, 960) = where BANKER$ will stand.
- **LightBreak 1** peaks 653 ("That March": the turn), rise 642–653 in the hold; **LightBreak 2** peaks 1515 ("To be fair"), rise 1504–1515.

## Captions
- Chips ≤ 4 words (balanced), numerals per house style: "$6 billion", "1993", "71 million", "19th", "4th", "6 cents", "40,000",
  "$100 million", "$84 million", "1996", "2001". ⚠ The captions follow the VOICE ("$"); every Canadian figure on an OBJECT is C$ (labels).
  If Timur wants C$ in the chips too, change `NUMERALS` in synth_captions.py (one place).
- The hook is subtitle-free (V35's BANNER_END: chips from 174). One serif accent per place (`CAPTION_ACCENT`, provisional picks):
  Bre-X, claimed, pennies, partner, geologist, insignificant, salted, sank, alone, sold, qualified.
- No spoken question: `question.ts` now makes the tracking-text question optional (Q = null when the close has no non-hero line);
  `HAS_QUESTION = Q !== null` gates the TrackText, its whooshes, the "So be honest." hero end and the lift whoosh into the logo.

## Labels (episode.json → `labels` documented, `WD` read at runtime by `L(key)` from ./data)
hookFigure C$6 BILLION · hookLabel PEAK VALUE · claimStencil BUSANG · claimPlate BRE-X · 1993 · claimCity CALGARY · claim2Readout
70,950,000 OZ · claim2Label 71M OZ CLAIMED · claim2Date FEB 1997 · hypeFrom PENNIES · hypeTo C$6B · hypePlaqueOtpp ONTARIO TEACHERS' ·
hypePlaqueOmers OMERS · hypePlaqueCaisse CAISSE · partnerBrex BRE-X · partnerPlate FREEPORT-McMoRAN · partnerDate MARCH 1997 ·
mysteryDate MARCH 19, 1997 · mysteryName MICHAEL DE GUZMAN · mysteryRole CHIEF GEOLOGIST · crackLabel INSIGNIFICANT GOLD · crackDate
MARCH 26, 1997 · truthLabel SALTED · truthDate MAY 4, 1997 · collapseFrom C$6 BILLION · collapseTo 6¢ · collapseDate MAY 6, 1997 ·
collapseHolders ~40,000 SHAREHOLDERS · pensionDrawer ONTARIO TEACHERS' · pensionLoss C$100M LOST · felderhofFigure C$84M ·
felderhofLabel STOCK SOLD · felderhofYear 1996 · felderhofVerdict NOT GUILTY · felderhofDate JULY 31, 2007 · ruleSeal QUALIFIED PERSON ·
ruleCode NI 43-101 · ruleYear 2001. (Edit them in synth_captions.py `LABELS`; it refuses a label over 4 words.)

## Sound (wired, provisional)
- 32 cues on the skeleton (`node scratchpad/cuedump.mjs` → out/cues.json): the opening whooshlong, a travel whoosh + riser per crane,
  claim's approach whoosh, the felderhof/rule rises, EarnEdits' low whoosh under both breaks and both flares, a whooshsoft as each hero card
  clears. `sfxends.mjs`: clean. Stubs add no sound (nothing of theirs moves); each builder's `<id>Sfx` adds its place's.
- The close arrives on the music alone (no lift whoosh: STYLE 2026-10-23).
- **Bed:** still Video 35's `bed_radiohead.mp3` (song rule), baked for V35's take: **72.78 s against a 74.2-s film** — it ends ~1.5 s
  before the last frame (its own fade starts ~69.5 s, under the lesson's last words). Until it is re-cut to this film
  (bedsrc/bedenv/mkbed), Composition fades it by volume over the last 45 f of min(TOTAL_FRAMES, 2183). ⚠ Re-cut once the take lands.

## THE CONTRACT — what a builder writes (from Video 35's place files: counter.tsx, ev.tsx, favors.tsx)
File `src/bnx/<id>.tsx`, `// @ts-nocheck`, in the recovered transpiled-JS style (`import * as esm from "remotion"`,
`import * as jsx_runtime from "react/jsx-runtime"`, `(0,jsx_runtime.jsx)(…)`). Replace the stub wholesale; keep these four exports:

```js
// the windows the place animates on, ALL keyed to its word frames (w = W_.<id>) and its hand-over frame `end` (= P.<id>.end)
export const <id>Times = (w, end) => {
  for (const k of [/* every word it uses */]) if (!Number.isFinite(w[k])) throw new Error(`<id>: the take has no word frame "${k}"`);
  const t = { w, end, grow: { a: w.k84 - 10, b: w.k84 }, pull: { a: w.found - 14, dur: 30 } /* … */ };
  // refuse what would break on a new take: e.g. an action that cannot finish before the hand-over
  if (t.pull.a + t.pull.dur > end + 4) throw new Error("<id>: the pull-back must settle by the crane");
  return t;
};
// the action camera: focuses in ascending `a`; the first is the rest framing (a: -9999). z = zoom, push = slow creep after it lands,
// ride = a span the framing follows (at(g) may move with g). still(x, y) for a fixed aim; x/y are place coordinates (pivot 540, 883).
const shots = (t) => [
  { a: -9999, z: 0.99, push: 0.02, at: still(540, 900) },
  { a: t.grow.a - 6, dur: 30, z: 1.08, push: 0, at: still(540, 760) },
];
export const <id>CamWindows = (t) => actionCamWindows(shots(t));     // the composition scores each with a camera whoosh
// one event per visible motion: job ∈ move | obj (k io/in/out) | land | process | mech | data | label | verdict | coin | flick |
// click | thud | ping | typing | clock — a/b are the motion's own frames (for literal hits, `a` IS the contact frame); vol ≈ 0.3–0.8
export const <id>Sfx = (t) => [ { job: "label", a: t.grow.b - 10, b: t.grow.b + 6, vol: 0.45 } ];
export const Bx<Id> = ({ at, end, w, stage }) => {          // at/end = P.<id>, w = W_.<id>, stage = the field's whiteness 0…1
  const f = (0,esm.useCurrentFrame)();
  const t = <id>Times(w, end);
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: actionCam(shots(t)), children:
    jsx("div", { "data-probe-leaving": travelling(f, <id>CamWindows(t)), style: { position: "absolute", inset: 0 }, children:
      jsxs(Turn, { at, end, from: -6, to: 4, amp: 0.9, children: [
        jsx(Pool3D, { x: 540, y: FLOOR_Y, w: 1e3, on: 0.42 * (1 - stage) }),   // or the place's own floor (TkFloor), on: 1 − stage
        /* the construction: real objects, ≤ 3 per scene, its base there from the first frame; spoken cues light / grow / label it */
      ] }) }) }) });
};
```
Imports: `PlaceRoot` (./shot), `CamFn`, `Pool3D` (./s3), `travelling` (./common), `Turn` (./kit), `actionCam`, `actionCamWindows`,
`still` (./actioncam), `L` (./data) for every label (never type label text in a place), `rInOut`/`rOut`/`mix` (./anim).
Rules carried from V35: new helper files are prefixed with the place id (`felderhof_cash.tsx`, `hook_core.tsx`); figures come from a data
file with `must()` checks against FACTCHECK.md (V35's `data_lt.ts` pattern); nothing pops or fades out — things enter and leave by moving;
a printed figure eases in (≈ 20 f) and sits centred; the place keeps moving (Turn, cameras) while it holds; on `stage` → 1 (truth only)
inks invert to the navy. Do NOT edit the kit/engine (anim, shot, s3, kit, world, text, close, flare, SfxLayer, theme, fonts, actioncam) or
the integrator's files (Composition.tsx, captions.ts, episode.json, question.ts) — ask for a change in the handback.
The hand-overs are the composition's (`HO`): a place never moves itself in or out. The hook builder and the rule builder also hand the
integrator their flare points (screen coordinates of the lit point at the flare's peak).

## What changed from the Video 35 clone (for the integrator)
- Composition.tsx rewired (P, W_, HO, PLACE_IDS, LIGHT_WINDOWS, T_, SCN, FLARES, BREAKS, CAPTION_ACCENT, HERO_ACCENT, CUES_RAW,
  CLOSE_PLAN, bed fade, HAS_VO false, HAS_QUESTION); component `BreXGold`; Root id `BreXGold`.
- 12 stub places (`hook claim claim2 hype partner mystery crack truth collapse pension felderhof rule`.tsx) on `bx_stub.tsx` (delete it when
  the last stub is replaced). Video 35's `hook.tsx` is kept for study as `v35_hook.tsx`; every other V35 file stays as it was (nothing
  imports them).
- Tools re-pointed to `BreXGold` / `out/bre_x_gold.mp4` (render, still, frames, frameset, geom_sweep, cuedump, mp4check, mp4cmp, serve,
  every2s, logprobe, mixprobe, orbcheck, seqcheck33, winprobe, worldframes, studio35.sh's title). `render.mjs` refuses on PROVISIONAL.
- `scratchpad/fw_words.json` (Video 35's take words, which the audit and captions_vo.js read) moved aside to `fw_words.v35.json`.
- `audit.mjs` reads CLOSE_PLAN/RULE_END and skips the word-less close; it runs and rewrote `beats.json` for V36. Its remaining ✗ are
  stale V46/V30-era checks (V46's hook words, V46 exemptions, the ≥ 4-white-window cadence, the TS-era cue-block parser) — re-point later.
- `sfxgaps.py` needs `out/motion.csv` (the whole-film frame scan) — not run on the skeleton.
- `src/bnx/divergences.json` is still empty: arm PLAN.md's "CHANGED FROM THE BRIEF" lines before the take is generated.

## Open calls for the integrator
1. felderhof 7.7 s (> 7) — in-place travel on "and was found not guilty"; claim 6.97 s. Re-measure on the take.
2. hype → partner is a crane under LightBreak 1 (as asked); V35 dove into its breaks with pushLight — compare when the places exist.
3. pension cranes out into the fair card (V35 used pushLight into its break); felderhof cranes out into the lesson card (no break there).
4. Captions show "$" (the voice); objects show C$. `claimPlate` "BRE-X · 1993" carries an interpunct (STYLE §2.5.5 bans "·" chains in
   labels; it is object print here) — confirm.
5. Hook: payoff on "$6" @120, flare 1 grows from 156 — ≈ 1.2 s of the bar before the bloom on this timing; check on the take.
6. The bed: re-cut to the film once the take lands.
