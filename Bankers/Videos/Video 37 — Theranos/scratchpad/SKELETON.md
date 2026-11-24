# Video 37 "Theranos" — the SKELETON (integrator, 2026-11-24; cloned from Video 36)

Composition **`TheranosBloodTest`** · 1080×1920 · 30 fps · **2149 f = 71.6 s** (PROVISIONAL) · output `out/theranos_blood_test.mp4` · Studio 3437.

## ★ PROVISIONAL TIMING — there is no take yet
- `src/bnx/captions.ts` is **synthetic** (`PROVISIONAL = true`), written by `python3 scratchpad/synth_captions.py` from `VO_SCRIPT.txt` (19
  sentences, 186 words; the model calibrated on Video 35's take). On Video 36 the real take ran ~7 % longer than this model: treat every
  frame below as ± 2 s. Re-run the generator after any script change; it also writes `src/bnx/episode.json` (labels, WD).
- **Builders key to WORDS, never to frames**: a place gets `w` = `W_.<id>` (Composition.tsx), so when the take lands everything moves.
- The voice is OFF (`HAS_VO = false`; public/vo_trimmed.* is still Video 36's voice). `render.mjs` refuses while PROVISIONAL.

## The place table (provisional frames; P.<id> = cut → hand-over; HO = the hand-over kinds)
| # | place | at–end (f) | dur | enter | exit | notes |
|---|---|---|---|---|---|---|
| 1 | hook | 0–161 | 5.4 s | own (frame 0) | **pushLight** → flare 1 (peak 159) | subtitle-free until BANNER_END; payoff on "$9" |
| 2 | claim | 161–328 | 5.6 s | approach out of flare 1 | panL (308, 40) | |
| 3 | claim2 | 328–486 | 5.3 s | panFromR | panR | |
| 4 | hype | 486–609 | 4.1 s | panFromL | panL | |
| 5 | backers | 609–788 | 6.0 s | panFromR | panR | TWO framings: boardroom → action-camera travel on "Walgreens" → the stores (the film's ONE grid) |
| 6 | crack | 788–911 | 4.1 s | panFromL | panL | **LightBreak 1** peaks on "But" (≈ 786); the film's ONE pie |
| 7 | whistle | 911–1019 | 3.6 s | panFromR | panR | |
| 8 | expose | 1019–1139 | 4.0 s | panFromL | panL | **the ONE light window** (white stage 1009→1029, drained 1117→1139): inks invert on `stage` |
| 9 | collapse | 1139–1336 | 6.6 s | panFromR | panR | three sentences: VOIDED → Walgreens plaque falls → the shutter (SEPT 2018) |
| 10 | verdict | 1336–1603 | **8.9 s** ⚠ | panFromL | **pushLight** into the fair card | over 7 s: an action-camera travel GUILTY → the hourglass on "Her sentence" |
| — | **fair** (HERO) | paint 1603 · end 1726 | 4.1 s | — | — | **LightBreak 2** on "To be fair"; regular hero, accent "fair," |
| 11 | cleared | 1734–1807 (rises from 1709) | 2.4 s (+0.8) | fromBelow under the card's end | **pushLight** into the lesson card | short: one clear action (the scales tip) |
| — | **lesson** (HERO) | paint ≈ 1807 · end ≈ 1889 | 2.7 s | — | — | PUNCH hero, accent "proof." |
| 12 | rule | 1889–2041 | 5.1 s | fromBelow (1872, 44) | **pushLight** → flare 2 (peak 2040) | the rule builder gives the flare's lit point |
| 13 | close | 2041–2065 | 0.8 s | approach | own | house close; flare 2 recedes onto the white stage |
| — | brand | 2065–2149 | 2.8 s | own | own | BANKER$ |

Word frames: `W_` in `src/bnx/Composition.tsx` (every key a stub's KEYS lists; provisional values print on each placeholder card —
render a still of your place). Need another word? Ask the integrator for an `inSen("<id>", n, "<caption token>")` line.

## Labels (episode.json → `labels`; read at runtime by `L(key)` from ./data — never type label text in a place)
Edit them in `scratchpad/synth_captions.py` `LABELS` (it refuses a label over 4 words) — ask the integrator.
`hookFigure $9 BILLION · hookTube THERANOS · claimName THERANOS · claimYear 2003 · claimFounder ELIZABETH HOLMES, 19 · claimSchool STANFORD DROPOUT · claim2Device EDISON · claim2Pitch ONE FINGER PRICK · hypeFigure $9B · hypeLabel ON PAPER · hypeYear 2014 · boardShultz SHULTZ · boardKissinger KISSINGER · boardLabel FORMER SECRETARIES OF STATE · storesBrand WALGREENS · storesCount ~40 STORES · storesState ARIZONA · crackEdison EDISON: ~12 TESTS · crackOthers OTHER MACHINES · crackTotal 200+ TESTS OFFERED · whistleName TYLER SHULTZ · whistleRole EMPLOYEE · whistleLink GRANDSON · exposeMast THE WALL STREET JOURNAL · exposeDate OCT 15, 2015 · collapseVoid VOIDED · collapseYears 2014–2015 · collapseWalgreens WALGREENS · collapseShut SEPT 2018 · verdictGuilty GUILTY · verdictCounts 4 COUNTS · verdictDate JAN 3, 2022 · verdictMonths 135 MONTHS · verdictCut 123 MONTHS · clearedPatients PATIENTS: NOT GUILTY · clearedInvestors INVESTORS: GUILTY · ruleGap THERANOS · ruleLabel NO PEER-REVIEWED DATA · ruleJournal JAMA · ruleDate FEB 2015`

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
