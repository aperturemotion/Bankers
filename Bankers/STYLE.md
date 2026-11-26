# THE BANKERS STYLE — the spec (`Bankers/STYLE.md`)

> **Timur, 2026-09-28:** "Ensure that all my style preferences are properly saved. There need to be rules about almost
> everything, and they need to be detailed so that you don't change the style over time. Look at the last bankers
> video and create these rules."

## 0. Authority and change control

- **This file is the authority on how a Bankers video LOOKS, MOVES and SOUNDS.** `Bankers/CLAUDE.md` §2 keeps the
  history and the reasons. Where the two differ, this file wins.
- **The reference build is Video 1, `Videos/Video 1 — Micron vs JPMorgan/`.** Every value below was measured from
  its source (2026-09-28). Timur's later notes (Video 2) are folded in and marked **[T]** with their date.
- **The canonical engine lives in `Bankers/Resources/kit/`.** These files are copied into every video UNCHANGED:
  - `world.tsx`, `kit.tsx`, `parts.tsx`, `theme.ts`, `fonts.ts`, `stage.tsx`, `s3.tsx`
  - `text.tsx`, `track.tsx`, `close.tsx`, `anim.ts`, `SfxLayer.tsx`
  - `Probe.tsx` (the sweep's measuring tool)

  A video may add its own `places/`, `fg.tsx`, `data.ts`, `brandsvg.ts` and `Video.tsx`. It never edits the engine.
- **`Video.tsx` exports `JOURNEY`** (`PLACES, DUR_OF, MOVES, CAP, capScale, chipAt, CHIPS, ARRIVE, TRACK, THRU, PUSH_Z,
  SLIDE_X, HERO_ON, TOTAL`): the journey exactly as the render runs it. The checker bundles it and judges it frame by
  frame. Clone Video 2's `Video.tsx` and the export comes with it.
- **Video 1 is the reference except where its own source breaks a rule.** These are known deviations, not to be copied:
  - colour stops switched on a threshold (`lit > 0.01 ? A : B`) in the hook, package, makers and take;
  - scenes over 7 s (race 13.4, EPS 15.0, cycle 17.6, hook 8.9, take 9.7);
  - an LED blinking on a hard 7-frame toggle;
  - the caption camera snapping back to scale 1 mid-chip (§8.6).
- **To change a rule:** Timur asks for it. Then:
  1. edit this file and add a line to §16;
  2. if the engine changes, update `Resources/kit/`;
  3. re-run the checker.
  Nothing drifts silently: a style change without a §16 entry is a defect.
- **[CHECK]** marks a rule that `Bankers/Resources/stylecheck.mjs <video folder>` verifies on every run. It refuses
  on any failure.
  - Run it before every handback, next to the intersection sweep (§15).
  - Rules not marked [CHECK] are verified by the stills comparison (§15.3).

---

## 1. Format, length and pacing

1.1 **Canvas:** 1080 × 1920, 30 fps. The composition id is PascalCase, with no "_".

1.2 **Length:** the brief's cap is a hard ceiling, end card included. Video 1 ran 101.6 s; Video 2 runs 62.5 s on its real take.

1.3 **★ No scene lasts more than 7.0 s** from its arrival to the next arrival **[T 2026-09-28] [CHECK]**.
- A longer stretch of script is SPLIT on its sentences.
- The idea can instead continue with the camera travelling to a new framing of the same construction
  (`keepMid` / `keepFg`, §8.9).
- Video 1 predates this rule: its race ran 13.4 s, EPS 15.0 s and cycle 17.6 s. Do not copy those lengths.
- **A slower take re-breaks it, so re-check after every take** (Video 4, 2026-10-01). The re-dated script's take ran ~6% slower
  and four places went to 7.4–8.4 s.
  - Where the VOICE runs over 7 s in one construction, a wait cannot be trimmed far enough without cutting an action short.
    Split the place with a gentle camera TRAVEL across the same construction instead (keepMid + `moves`): an ease back to
    set two objects side by side, a pull-back as a stack builds, an ease in on the beat that matters.
  - Give each travel an airwoosh (§11.1), and keep it out of the whoosh cycle so the other moves keep their families.
  - Trim a wait only where the action has clearly finished (≥ 10 f after it).

1.4 **Scene count ≈ runtime ÷ 5 s.** Video 2 has 14 places in 62.5 s. More scenes, never a longer film **[T]**.

1.5 **Voice timing** (`captions_vo.mjs`):
- `VO_LEAD` 8 f: the hook is already moving before the first word.
- `VO_GAP`, the hold after the hook, is **12 f** [T 2026-09-29: the hand-over into the second section was "awkward, long,
  and rigid"; it was 24–36 f]. It is cut in the WAVEFORM's silence, never at a transcript
  midpoint.
- `TAIL` 96 f after the voice holds the close.

1.6 **The hook's first frame is already moving**:
- a chart drawing, a needle sweeping, or a bar rising;
- and the receipt or corner piece printing in.

---

## 2. Palette — the logo blue's family, one red

2.1 **Tokens** (`theme.ts`, canonical):

| Role | Value |
|---|---|
| Ground (dark stage) | `#001C3C` |
| Ground lift under the key | `#003470` |
| Light / accent / key / glows | `#4D8ED9` |
| Hot core | `#B3CEEF` |
| Deep beam | `#002F64` |
| White stage | `#EBF2FB`, lift `#F5F9FD` |
| Ink on white | `#001C3C` |
| Red, negative states only | `#ef2b3d`; on text `#FF8A80`; darks `#b3172a` / `#99101f` / `#6e0a16` |

2.2 **[CHECK] Every other colour is a shade or tint of the logo blue** (hue 200°–225°), or a near-neutral
(saturation < 0.08).
- The exceptions are red for negatives (§2.4) and official flag colours drawn to their construction.
- No black ground, no grey, and no other hue.

2.3 **The working ramp** (use these before inventing new ones):
- darks: `#01203F`, `#01295A`, `#02234A`, `#062F63`, `#0B3F82`, `#0B4691`
- mids: `#1A5DB0`, `#1F62B3`, `#347ED3`, `#3C83D5`, `#4D8ED9`
- lights: `#6FA3DF`, `#8DB6E6`, `#9DC0EA`, `#B3CEEF`, `#B7D1F0`, `#D5E4F6`, `#DCE8F6`, `#E3EDF9`, `#EEF5FB`, `#F4F8FD`

2.4 **Red** is only for something that went DOWN or was LOST:
- a loss bar;
- the red outline of a drawdown;
- a down arrow;
- a fall in a candle tape;
- the stretch between a reading and a better reference.

Never for emphasis, never for a warning, never flashing (Bankers §5).
- **Red on a real object is still red.** A pump's red cancel key, a red LED or a red logo stripe is decorative red, and
  it is drawn in the ramp instead. Video 2's keypad key was red until the audit.
- **[CHECK] Only the canonical reds:** `#ef2b3d`, `#FF8A80`, `#b3172a`, `#99101f`, `#6e0a16`, `#ff6a5e`, `#ff9a90`,
  `#a3121f`, `#3a040b`, `#4a0710`, or `theme.red`. The checker lists every line that uses red, so each use can be read
  against the rule above.

2.5 **Glows** are `#4D8ED9` (lit solids, alpha 0.35–0.6, drop-shadow 30 px) or `#B3CEEF` (lit parts, chips and
dies, 0.8–0.9). A glow is always blended in by a ramp, never switched on.

---

## 3. Stage and light

3.1 **Field** (`stage.tsx`): `radial-gradient(120% 80% at {lightX}% 12%, lift@0.95 0%, ground@0.6 32%, ground 68%)`,
breathing ±6% on a 220 f sine.
- `lightX` alternates by place index: 24% even, 66% odd. It blends over 24 f from each move's midpoint.

3.2 **Key light** (`KeyLight`):
- `len 2200`, `spread 520`, `strength 0.35 × (1 − whiteness)`, in the accent colour;
- sway 2.2° on a 260 f sine, pulse 0.82–1.0 on 96 f.

3.3 **Per-place key positions alternate sides:**
- left: x 240–300, y −270 to −280, angle +14° to +18°;
- right: x 700–780, y −250 to −260, angle −14° to −20°.
- The last place before the question centres at x ≈ 470–520, angle 3–4°.

3.4 **Floor light** under every construction that stands on a floor: `Pool3D` centred at x 540, 16 px under the
floor, `w` 880–960 (620–760 for single objects), `on` 0.45–0.55 on dark, 0.3 on white.

---

## 4. White stage

4.1 **Cadence [CHECK]:** ★ **from Video 10 on, ONE light frame per video** — exactly one white run of one or two places, where the
story puts it, as in the demo (the DEMO ANCHOR, `Resources/visual-vocabulary.md` [T 2026-10-13, Video 10 brief: "ONE light frame"]).
The 1-in-3 cadence and the 30-s dark limit below stand only for Videos 1–9, which were built to them. `stylecheck.mjs` WHITE judges
by the folder's video number (and refuses if it cannot read one), with canaries for none, one and two light frames.
- (Videos 1–9) about 1 place in 3–4 is white, spread through the film: Video 1 had 4 of 11; Video 2 has 3 of 13;
- (Videos 1–9) no dark stretch over 30 s.

4.2 **Dissolve:** the stage floods over 24 f starting at `t0 + 6` (`t0 + 16` after a PUSH out of a dark place: §9.6, no flash), and drains over 24 f starting at the next dark
place's `t0 + 6`. Consecutive white places are ONE white run and never dip to grey between them **[T]**.

4.3 **Ink on white:**

| Element | Value |
|---|---|
| figures | `#001C3C` |
| labels | `alpha(#001C3C, 0.6–0.65)` or `#0C64CA` |
| solids | `FIN.pale`, or custom pale faces |
| axis lines | `alpha(#001C3C, 0.18–0.25)` |
| shadows | `rgba(0,28,60,0.28–0.35)` |
| lines | `#1F62B3` |

A component that can sit on either stage takes `light` and blends every ink with `mixHex`, never a threshold.

4.4 **Caption ink** swaps `#FFFFFF` ↔ `#001C3C` in ONE frame at the dissolve's 50% point. It never half-blends.

4.5 **The watermark** cross-fades from its white file to its black file with the stage.

---

## 5. Type

5.1 **Faces:**
- **Anton 400** for every built graphic (figures, labels, readouts, object print);
- **Figtree** for the voice: caption chips, and the question's Figtree lines;
- **Instrument Serif italic 400** for the question's one accent line.

5.2 **Helpers only [CHECK]:** scene text uses `figure()`, `label()` or `mono()` from `kit.tsx`, with these sizes:

| Role | Helper | Size | Ink (dark / white) |
|---|---|---|---|
| Display moment ("3.8×", "10×") | `figure` | 150–210 | `#EEF5FB` / `#001C3C` |
| Hero value on a construction | `figure` | 84–120 | `#EEF5FB` / `#001C3C`; `#FFFFFF` inside a bar; `#FF8A80` for a loss |
| Secondary value | `figure` | 56–64 | `#EEF5FB` or `#DCE8F6` |
| Label (a name, a year, TODAY, PEAK) | `label` | 30–44 | `#8DB6E6`; lead series `#E3EDF9`; losses `#FF8A80` / navy 0.6–0.65 |
| Axis readout | `mono` | 24–26 | `alpha(#8DB6E6, …)` |

- `figure` tracking is −2 at ≥ 90 px and −1 below.
- `label` is uppercase with tracking 1.5.
- Line height is 1 everywhere.
- **Type is flat [CHECK]:** no `textShadow` on any text, including a lit display's readout. Light is shown by the
  object's glass and bezel, not by glowing letters.
- **[CHECK]** A raw `fontSize` in a place is allowed only on object print (§5.3), marked `data-print` on the same line.
  Scene text in a raw size (Video 2's first honest part: 46, 34, 60 and 128 px) is a defect.

5.3 **Object print is not scene text.**
- The print a real object carries goes in raw Anton, at the object's own scale, inside the object: a pump's
  octane numbers, a gauge's legend and dial numerals, a calendar's month, a card's digits.
- It carries `data-print` so the checker can tell it from scene text. FG pieces (`fg.tsx`) are objects throughout.
- It never sits on the stage as a label.

5.4 **Caption chips** (`WordCaption`, canonical):
- Figtree 400, 50 px, centred, at y 291, tracking 0, no shadow;
- a hard swap between chips of 2–5 words;
- the slot empties in the pauses.
- The caption band is y 261–321. Nothing sharp crosses it while a chip shows.

5.4a **★★ TEXT PAINTS ABOVE THE WORLD [T 2026-10-01: "the text at the end should be on top of the blurred visual, not under it"]
[CHECK].** Every depth layer carries a zIndex up to 6000 (world.tsx: nearer over farther), and in the root stacking context
those beat the closing question, the caption chips and the watermark, which carry none. Video 4's racked-out server board
painted over its question. `Video.tsx` mounts `<World>` inside its own stacking context (a `zIndex: 0` wrapper), so every
layer stays below the text. stylecheck STAGE refuses a bare `<World>`; it also flags Videos 2 and 3, which were built before the
rule.

5.5 **The closing question is TRACKING TEXT** (`track.tsx`, canonical):
- three to four lines: a Figtree 92/500 opener at z 0, the accent line in Instrument Serif 124–210 at z 70, then
  Figtree 72–74/800 at z 40;
- **no line longer than 3–4 short words** [T]: on the fly-in, a word far from the centre projects over its
  neighbour;
- accent gradient `175deg #ffffff 6%, #B3CEEF 30%, #4D8ED9 62%, #1D70CE 96%`.

5.6 **Numbers:**
- `$1.22T` for ≥ $1,000B;
- `$912B`, with no decimals, below that;
- `3.8×` for multiples;
- `$3.03`, 2 dp where cents matter;
- `−$5.8B`, with a U+2212 minus, never a hyphen;
- `48.1`, as published;
- `−43%`, whole percent, or 1 dp under 5%.
- A figure may be MORE precise than the voice, never different (root rule).

5.7 **Labels:**
- one short label per figure: a year, a name, TODAY, NOW, PEAK, RECORD;
- uppercase;
- never an interpunct chain, never a full date where a year says it, no fine print (Bankers §2.5.5).

---

## 6. Constructions (the MID)

6.1 **Everything stands in the construction zone:** x 90–1000, y ≈ 390–1470.
- Floors and axes sit at y 1130–1400, most often 1320–1400.
- Nothing rests above y 370, which is the caption band plus clearance.
- **[sweep: MARGIN]** No sharp MID text rests outside x 60–1020, y 370–1700 for 10 frames or more. The sweep measures
  this on every frame; text the camera is carrying out does not count. Video 2's hook had its "6,000" readout 20 px from
  the frame's edge until X1 moved from 970 to 900.
- FG print is exempt: an FG piece is cropped by the frame on purpose.

6.1a **★★ 2-D BY DEFAULT; REAL 3-D ONLY WHERE THE SCENE IS BETTER IN 3-D** [T 2026-10-16, Video 12: "the 3d style is definitely
nice, especially near the beginning of the video, but you shouldn't overuse it. You need to somewhat stick to the 2d style visuals we've
previously used for bankers … Save this as a rule from now on, something that would be better visualized using a 3d visual should be 3d,
but otherwise scenes should stay 2d."]
- **The 2-D style is the house construction of Videos 1–11:** front faces drawn flat, with the extrusion up and to the right (§6.2:
  a side and a cap as painted facets — Video 11 `buybars.tsx` `Pillar`, the kit's `Solid`/`FIN`), on a `Turn` arc with its `Pool3D`.
  Charts, bars, counters, readouts, rails and anything read FACE-ON are built this way.
- **Real 3-D** (a projected rig: `p3.tsx`, `rig.tsx`) is kept for the scenes whose idea needs depth: a thing moving THROUGH space or
  seen turning (Video 12's escalator, the model plane on its stand, the report landing on a desk), a door opening (Video 11's vault), a
  disc whose slices leave in depth (Video 11's pie).
- **The test per scene:** would this sentence read worse face-on? If not, it is 2-D. A film may carry a few 3-D scenes; it never
  becomes all 3-D.
- Nothing else changes: the palette, the dark-blue metal finishes, the type, the camera and the motion stay exactly as they are.
- In Video 12 the pay and prices columns, the gasoline pump, the weekly pay and the gas can went back to 2-D.

6.2 **Solids** (`Solid`, canonical):
- extrusion up and to the right: side width `d`, cap height `0.7·d`;
- depth 22–34 for bars, plinths and rails; 40–48 for big objects;
- face 168°, side 180°, cap 120°, with a 1 px white inset on the face;
- shadow `drop-shadow(0 26px 44px rgba(0,8,20,0.7))` on dark;
- grows without a pop: the extrusion grows with the height, and the solid fades up over its first 12%.
- **`grow` is only for a Solid whose size grows with it** (a bar's height, a rail's length), as in every Video 1 bar.
  An object that is simply there (a pump cabinet, a block, a rail) takes no `grow`: it arrives with the camera (§6.9).
  Driven by an `OUT` ramp at a fixed size, `grow` reaches 12% in about 2 frames. Video 2's pump, block and rails
  popped in that way at t0 + 7.

6.3 **Finishes** (`FIN`):

| Finish | Face | Use |
|---|---|---|
| `lit` | `#E3EDF9 → #8DB6E6 → #347ED3 → #0B4691` | the thing that matters now |
| `deep` | `#6FA3DF → #1A5DB0 → #01295A` | the rest |
| `pale` | `#FFFFFF → #DCE8F6 → #9DC0EA` | on white |
| `chip` | `#2A3F5E → #101B2C → #060B14` | dark hardware |
| hook bars | `#5C98DC → #1A5DB0 → #01295A`, side and cap from `deep` | |
| red | `#ff6a5e → #ef2b3d → #99101f` or `#ff9a90 → #ef2b3d → #b3172a → #6e0a16`, side `#a3121f → #3a040b` | losses only |

- **★ A loss or a shortfall is a SEE-THROUGH RED EXTENSION of the solid it belongs to** [T 2026-09-29: "instead of a red
  rectangle make it sort of a red see through extension of that 3d object"].
  - It is drawn on the solid's own geometry: face, side and cap in translucent red (0.10 / 0.16 / 0.2), with a dashed
    `#FF8A80` outline.
  - Never a flat red rectangle. Examples: the gap scene's −43% ghost; the lows scene's "lower than 2008" stretch.
- "Extruded" means a `Solid`, or stepped copies (`DEPTH` 12, step +2.4 to +3.4 / −1.7 to −2.8) for shapes a
  `Solid` cannot draw, such as arrows, ≠ and numerals.
- **★ A drawn LINE's extrusion is thin: about 10 px of depth in all, at most (8 copies × +1.0 / −0.7) [T 2026-10-06, Video 6: "the
  blue shadow for the white line in the very beginning is too thick, make it thinner"].** At the solids' step (8 × +2.4 / −1.7,
  ≈ 23 px) the hook's 12-px line carried a blue band thicker than itself, ~35 px under the opening's 1.5× follow. A line is
  thinner than a solid, so its depth is too. Judge it at the closest zoom the line is ever seen at.

6.4 **Axis lines:**
- dark stage: `alpha(#D5E4F6, 0.35)`, 2 px;
- white stage: `alpha(#001C3C, 0.18–0.25)`.

**Grid lines**, only where a chart needs levels:
- `alpha(#D5E4F6, 0.12–0.14)`, 1.5 px, dash `6 8`;
- starting clear of any figure or label;
- faded by `opacity`, never by the colour's alpha.

6.5 **Charts:**
- zero-based linear scales, always (§14);
- one scale for everything compared.

Candles (Video 1's race):
- up `#B3CEEF`, down `#1F62B3`, falls lit red on their word;
- body 0.62 × the slot, rx 1.5–2;
- wick `alpha(ink, 0.8)` 2 px;
- each candle grows from its own open;
- the head candle glows `drop-shadow(0 0 10px #4D8ED9@0.9)` while it draws.

Lines:
- 3–6 px, round joins, in `#DCE8F6` / `#B3CEEF` on dark or `#1F62B3` on white;
- area fill `#4D8ED9` 0.3 → 0.02.

Key points: halo r 24–26 at `alpha(#B3CEEF, 0.22)`, core r 9–10 in white (or navy on white).

6.6 **Figures sit ON the construction:**
- above a bar (centred on its face plus half its depth);
- inside a long bar's end;
- beside a line's end;
- or under the floor with their label.

They never float free. A place carries 0–4 figures.

6.7 **`Turn`:**
- `from` −5° to −10°, `to` +3° to +6°, `amp` 0.6–1.0°, period 250, perspective 1800;
- or the mirror (from +4 to +7 → to −3) for a place that should lean the other way;
- alternate the lean between neighbours.
- Objects built on their own 3-D frame (a package, a tile floor) may skip `Turn`.

6.8 **★ Realistic hero objects in every video [T 2026-09-28].** ⛔ **SUPERSEDED 2026-10-09 by `Resources/visual-vocabulary.md`**
(Timur, Video 8 revision: "the current build reads as AI-generated because the scenes are illustrative and over-detailed"). Scenes
are now charts, big numbers, simple primitives and text-only beats; the rules below are kept as history only.
- Several places are built around a real object that a line names, built in detail:
  - Video 1: the memory module, the AI package, the bank, the chip;
  - Video 2: the sentiment gauge, the fuel dispenser.
- Each object is built from its real parts, in the ramp's finishes, lit from the upper left.
- It is brand-less unless the brand is the subject; a brand appears as its real logo (inline SVG).
- A flat icon or a placeholder shape is a defect (root rule).
- **★★ REAL, DETAILED OBJECTS IN EVERY STRETCH OF THE FILM, THE FIRST HALF INCLUDED [T 2026-09-30].** Timur: "the second
  half of the video is great, but the first half completely lacks good visuals. Take a look at some of 100bps style's new
  rules on the detailed visuals like the gas pump and the phone. Don't add those objects specifically because I mentioned
  them, just add some relevant objects in the right style as visuals for some of the scenes in the first half."
  - **The detail level is 100bps' (its rule G4):** a gas pump with its price window, grade buttons, card reader, nozzle
    and hose; a phone with its status bar, side keys, home bar and its own sparkline; an LED board built of real dots.
    That means the parts the real thing has, a MECHANISM that moves on the words (digits roll, dots scan, a line tracks
    point to point, a column drains row by row), and one light from the upper left.
  - **The examples are a LEVEL, not a list.** Find the objects THIS film's sentences name. Never add a pump or a phone
    because they were the examples given.
  - **No stretch runs on charts alone.** In any three consecutive scenes at least one is built around a real object, a
    real structure or a real mark, and each half of the film has at least two. Video 2's first half was five chart scenes
    in a row (a boxed terminal, a line, ranked bars, two bars, two chart monitors), while its second half (the pump, the
    500-tile block, the ≠, the rails, the wallet) was "great".
  - It stays in the Bankers build (§6.2, §7.6): solids in the ramp, structural detail, true or generic print only.

6.8a **★★★ EVERY OBJECT IS CHECKED AT FULL SIZE, PART BY PART [T 2026-10-05, Video 6: "fix up the dominoes, especially the edges";
"also fix up the suitcase, and any other complex visuals, as most of them are messed up when you look closely"].** No sweep sees a
bad join. Before handback, render every object at rest at full size, crop it 1:1 (`scratchpad/closeups.mjs`), and check each
join, corner, edge, overlap and highlight:
- an extrusion's corners match its face's (a rounded face gets a rounded extrusion: stepped copies of the same shape, never
  sharp parallelograms bolted on);
- the depth recedes up-right ON SCREEN even when the object is rotated (counter-rotate it);
- parts that touch meet exactly, and the one behind is painted behind (nothing's thickness cuts across another's face);
- every part a viewer expects is there and finished (handles attach, wheels sit on axles, straps meet their buckles);
- **★ every REPEATED part behaves as its siblings do [T 2026-10-06, Video 6: "what are those two unlit windows on the cruise? fix
  that"].** The ship's bridge wing carried two windows drawn dark by hand, outside the loop that lights every other window, so they
  stayed unlit while the whole ship came on around them. Draw a repeated part through ONE helper (hook.tsx `win`), so each copy
  has the same size, spacing and animation. Check every object again AFTER its animation has run, not only at rest.
- **★ detail is built from FEW, LARGE, DEEP parts [T 2026-10-08, Video 7: "the stock exchange building looks weird, simplify it, but
  make it look more 3d"].** The Exchange's facade had been drawn with acanthus leaves, dentils, fasciae and a sculpted figure group,
  each a few px, then given depth by stepped copies of the whole silhouette: stair-stepped edges, dark slivers between parts, and
  clutter. A part under ~20 px at the film's framing is noise, so leave it out. Give each remaining part its own clean faces (front,
  side, cap as polygons on the one up-right vector; a round column as a true cylinder in that projection), and let depth, set-back
  planes and cast shadows carry the realism. Stepped copies stay for shapes a polygon cannot draw (§6.3).
- **★ A DEVICE LOOKS LIKE THE REAL DEVICE, IN 3-D [T 2026-10-12, Video 9: "make the phone more 3d and realistic"].** The vocabulary's
  phone mockup was a flat blue slab with a stepped outline. A phone is now built as the real handset is seen at a slight turn: a thin
  black glass front edge to edge, a narrow polished metal band around it (graphite-blue and chrome, lit along its top-left and dark
  on its far side), the band's real THICKNESS on the side the camera sees, shaded as a rounded edge (a highlight line where it
  turns), its keys standing proud of that side, a dynamic island with its lens, a glass sheen across the screen, and a soft contact
  shadow under it. One helper draws every phone in a film (`phone.tsx`), so every scene's phone gets it.
Fix every glitch, then look for the same class in every other object.

6.9 **The base arrives with the camera**, meaning the axis, floor, bezel or plinths. The spoken cues then grow,
light and label what is already there. No place arrives empty.

6.9a **★ NO PATTERN FILLS, NO FINE REPEATING STRIPES ON ANYTHING THAT MOVES [T 2026-09-30: "the sp500 text on the terminal along
with the other text is glitching a lot"].** The LED board's text was Anton filled with a 6 px dot `<pattern>`, its columns with
a 14 px one. Under the camera's sub-pixel drift the browser re-snaps a pattern's tiles to the pixel grid every frame, so the
dots slid against the letters and shimmered. The columns' 2–3 px `repeating-linear-gradient` flutes were the same class.
- Lamps, dots, tiles and dot-matrix text are EXPLICIT shapes (one path of circles; Video 2's 5×7 dot-matrix font in
  `places/gap.tsx`).
- Fluting, ribbing and ruling are individually shaded channels ≥ ~20 px wide, never a repeating hairline pattern.

6.10 **Logos are inline SVG paths** (`Logo` / `LogoInSvg`, from `brandsvg.ts`), never a bitmap or a CSS mask.
- On dark they are reversed (knockout `#FFFFFF` / `#DCE8F6`); on white they show in their own colours.
- The outro is the one mask.

---

## 7. Foreground pieces (FG)

7.1 **★★ A corner piece ONLY where the sentence is about a physical object [T 2026-09-30].** Timur: "tell it to not
always do that, only on scenes where there is a wallet and gas pump, it doesn't need to do that everywhere."
- **Yes:** a scene about paying at the pump (a fuel nozzle), or about a household budget (a wallet).
- **No:** charts, rankings, comparisons, the hook, the question. Most places have NO corner piece.
- Replaces "one FG piece per place" (2026-09-26). Video 2 went from nine corner pieces to two.

7.2 **What it is:** the real thing the sentence names, with a three-word reason (§2.5.1a).

7.3 **Where:**
- a bottom corner, cropped by the frame edge, occupying about x −130 to 480 or 600 to 1250, and y 1400–2000;
- on a slide it sits on the side it LEAVES from (outgoing) or ARRIVES from (incoming);
- it never parks under the watermark (x 475–605, y 1725–1765);
- it stays clear of its MID's text.

7.4 **Size and pose:**
- 360–720 px on its long side;
- tilted −6° to −22° (bottom-left) or +5° to +10° (bottom-right);
- drift `useIdle(seed, 6)`, with a unique seed per piece.

7.5 **Shadow:**
- `drop-shadow(0 30px 50px rgba(0,8,20,0.75))` on dark (0.55–0.6 for pale objects);
- `rgba(0,28,60,0.28–0.35)` on white.

7.6 **★★ Built like the DEMO's pieces, not illustrated [T 2026-09-30].** Timur: "the whole video has these assets in
the corner that look claudy, they are a good addition to the video but just change them to something better"; "the
gas receipt and clock in the middle looks very ai generated".
- A corner piece is a BOLD EXTRUDED SOLID in the logo blue's ramp, like the demo's candle, house, columns and arrows:
  - a clean, recognisable silhouette;
  - real depth (a raked side and a lit cap);
  - one light from the upper left;
  - big, and cropped by the frame.
- **Banned** (they read as AI-generated):
  - fake print (runs of character marks, tiny invented text, checkbox labels, receipts);
  - paper textures and grain;
  - busy illustrated props.
- Detail is STRUCTURAL: bevels, a second volume, a cut-out. It is never decoration.
- The 2026-09-28 "fine secondary detail" rule is retired. Its worked examples (receipt, clipboard, calendar,
  hourglass) are what Timur rejected.

7.7 **Draw tilted pieces in SVG**, not tilted HTML. The probe measures SVG text by its tilted ink.

7.8 **★ On a push, the FG piece GLIDES IN [T 2026-09-29: the corner objects "appear in a sudden manner. I need them to have
more of a smooth seamless transition, just like I changed them to be in the 100bps style"].**
- Carried by the camera, it used to swell out of the vanishing point and fade up in a few frames mid-push.
- Now its layer is projected by the LANDED camera until the push ends (`LayerSpec.cam`), and `FgEnter` (world.tsx)
  brings it in:
  - it rises 150 px into its corner from below the frame edge, drifting 60 px in from its own side;
  - over 30 f on OUT (the long settle), opaque by 12 f (100bps E4);
  - starting as the push starts (a later start left the hand-over under 15 f, because SETTLE carries the outgoing place
    past the lens in about 20 f).
- Each FG piece declares its corner (`fgSide` in registry.tsx). A pushed-in FG without one is a refusal.
- On a slide the FG arrives with the camera's parallax, as before.

---

## 8. Camera and journey

8.1 **The engine is canonical `world.tsx` [CHECK]:**
- FG at distance 0.5, MID at 1;
- idle float `drift2(f,231,97,6)` x, `drift2(f,173,79,4)` y, `drift2(f,211,89,0.008)` z;
- default depth of field `nearAt` 0.6.

8.2 **Moves [CHECK]:**
- **★★ The camera is ALWAYS smooth, everywhere, whatever the move [T 2026-09-29: "Overall the camera movement should always
  be smooth no matter what throughout the entire video"].** Every move except `ARRIVE` runs on **SETTLE**
  (world.tsx, bezier 0.45, 0.05, 0.12, 1):
  - it starts softly and peaks about 29% in;
  - its whole second half is one long deceleration, so the last 30% of the time covers only 5% of the move.
  - [T 2026-09-29: "as the camera approaches the new scene, it needs to smooth into it more rather than abruptly
    stopping at the final point"; 100bps: "the last few percent of every animation takes the longest".]
  - It replaced smootherstep (pushes) and INOUT (slides), which braked over only their last third.
- `ARRIVE`: z +0.15 over 0–40 f, `out` (the film's first frame is already moving).
- **push:** z `PUSH_Z` 1.25 over **56 f**, `ease: "zoom"` (SETTLE, in log distance).
- **slideR / slideL:** x ±`SLIDE_X` 1020 × the outgoing construction's distance, over **48 f**, SETTLE.
  - ★ A slide must carry what it leaves a FULL frame on screen [T 2026-09-29: "part of the previous scene just
    disappears since it didn't go off screen. Never let things like this happen"].
  - After a pull-back the outgoing construction stands farther away (Video 2's gap at 1.2×), and a plain 1020 moved it
    only 850 px, so its edge was still on screen when it unmounted. The sweep's VANISH check (§15.2) refuses this.
- **question push:** **64 f**.
- **morph:** no displacement, `MORPH_DUR` 50.
- **★★ From Video 11: the Style 3 films' INTENSITY at these speeds [T 2026-10-15: "I mainly meant the intensity, not the speed or
  consistency of the movements"; §16].** The durations above stay. Added: every plain slide pulls back 8% at its middle and returns (an
  `arc` move, z −0.08 over the slide's own span, sin-shaped, so no station moves); every `Turn` swings −6° → +4.5° with a 1° sine;
  zoom-ins go close (keys up to 0.18 nearer, the hook's dive from ~1.6×); and the camera follows the action inside each place (§8.7).
  stylecheck CAMERA (Video 11 on) requires the arcs and checks every key; STILL refuses a camera standing still > 45 f. The kit's
  `FAST` curve (the Style 3 films' in-out) exists but is not used: 32–36 f hand-overs read as jitter.

8.3 **Tilt on a push** (the camera rises 120–420 px) whenever the outgoing place has figures in the upper third, so
nothing swells up through the caption band.

8.4 **Rack focus on every push-past:**
- the outgoing layers rack over `[next.t0 − 2, next.t0 + 2]` (2026-09-30; it was `− 6`, which blurred the ≠ during its
  sentence), with `blurGain 1.8`.
- **★★ …and the blur EASES IN [T 2026-10-05, Video 6: "the blur effect doesn't have any intro transition, I need you to fix
  that. It needs to happen smoothly"].** Switched over those 4 frames, the outgoing place went from sharp to ~16 px of blur in
  about two frames. The blur now grows from zero with the push: it is the full rack's blur scaled by an INOUT ramp over the
  push's first 12 f (Video.tsx `rackNear`), so it starts WITH the push (never before) and arrives smoothly. The incoming place
  then fades up over `[t0 + 2, t0 + 14]`, so nothing of it shows before the outgoing has defocused (≥ 4 px by t0 + 5): at 18 f
  the two crossed sharp for 2 frames.
- **The rack is relative to where the outgoing place stands:** `nearAt 0.6 → kOut + 0.25`, where `kOut` is its distance
  at the push. A pulled-back place (the hook's terminal at 1.6×) never reached a fixed 1.25, and it swelled sharp through
  the caption band.
- The incoming place fades up over `[t0, t0 + 18]` on INOUT, once the outgoing is racked:
  - `[t0 − 4, t0 + 14]` crossed the two places sharp for a few frames;
  - `[t0 + 3, t0 + 13]` on OUT popped the ≠.
- MID `far` [1.8, 2.8];
- FG `far` [1.3, 1.9], or [1.15, 1.45] where its path converges on its MID;
- `farUntil = t0 + DUR`.

8.4a **★ A CORNER PIECE WAITS UNTIL THE OUTGOING SCENE IS OUT OF THE WAY [T 2026-09-30: "the pump itself appears on screen
while the previous scene is still on … by pump I mean like the visual that appears at the bottom left of the screen. That
should not come into view before the zoom in transition"].** The nozzle glided into its corner from the push's first frame,
under the still-sharp monitors.
- On a push, the incoming FG piece starts its glide (`FgEnter`) `fgDelay` frames in: Video 2's nozzle at `t0 + 20`, once the
  outgoing place has swelled past the lens, settling with the push (Video.tsx).
- The hand-over's ≥ 15 f (§8.5) is carried by the incoming MID coming out of depth as before (whyA → whyB: 17 f).
- (A first reading moved the pump cabinet's own fade instead: `farIn` stays available per place, unused.)
- **Anything that leaves an object (a hose, a cable, a lead) runs off the frame at EVERY camera position of its arrival**,
  not just at rest: the pump's hose ended at x −50, which the still-smaller arriving pump brought on screen.

8.5 **Overlap:** every SLIDE hand-over shares ≥ 15 f on screen, side by side and never overlapping (§9.8) **[sweep]**. A push hands
over in TIME (§9.8): the incoming place shows only once the outgoing is gone, and the gap between them stays under 8 f.

8.6 **The caption camera:** three uses per film at most:
- the hook's first line: push, dz 0.06, over the sentence;
- one key number: pull, dz 0.04, 20 f;
- one reveal or display line: push, dz 0.05.

It uses the same zoom easing.
- **[CHECK] The caption's scale changes only at a chip swap or in a pause.** A push holds its end scale until the chip
  on screen at its end is gone; a pull starts its scale on the chip on screen at its start. Video 1 snapped a 9%
  scale back in one frame mid-chip, and its pull jumped 6% mid-chip. The checker scans every frame.

8.7 **★ The camera is Video 1's, exactly [T 2026-09-28].**
- No camera beats chained onto sentences.
- No larger idle float.
- Never a camera slaved to data.
- No landing jolts.
- "More movement" comes from the constructions animating on their words, never from the camera. **★★★ Superseded from Video 11
  [T 2026-10-15: "the scenes look like different pages where the camera sort of just sits still while the visuals move. That should be
  prevented"]: the camera FOLLOWS THE ACTION** — one or two long keys per place (Video.tsx `keys`: a framing of the place's point (x, y)
  drawn `c` toward the centre, `dz` nearer, an optional `pan`; ≥ 30 f each, on SETTLE or a glide, inside the place's hold), aimed where
  the voice points: in on the vault as it unlocks, along the bars to the newest, with a coin rolling into its scene, down with a block
  falling to its tray. Never a chain of short keys (jitter), never slaved to data, never a landing jolt.

8.7a **★★ NOT TOO MANY ZOOMS [T 2026-09-30: "Too many zoom in's from 42 seconds"; "44 sec - the blur of the = sign and line
should not be there"].**
- Never two pushes in a row.
- At most one push in any 10 s.
- After a push, the next move is a slide, a travel or a pull-back.
- The caption camera never pushes inside the last third of the film.
- **Rack focus starts WITH the push, never before it** (it was `t0 − 6`). A construction whose sentence is still being
  said is never blurred. At 44 s the "≠" blurred while "not the economy" was still being spoken.

8.8 **Transitions vary:** Video 1 ran push, slideR, slideR, slideL, push, slideR, push, slideL, morph, push.
- No kind more than twice in a row.
- When two looks are very different, use a MORPH that carries a shared element across (§2.5.1b).

8.8a **A FRAME (architecture, §10.2) enters and leaves like the demo's columns:**
- It comes out of depth with the push, faded by distance only near its end (`far` [1.1, 1.6]), so it is opaque only once
  spread to the frame's edges.
- Once arrived, it is pinned to its station (no parallax).
- On the next move it OPENS outward off the frame, like doors, and never sweeps across the construction or the caption.
- The construction's own base waits until the frame has spread (Video 2: the survey chart's axis from t0 + 24).

8.9 **Travelling across one construction** counts as a new scene when the framing and the subject change:
- `keepMid` / `keepFg` keep the construction and its piece mounted;
- a travel is a slide of 300 px, or a pull-back of z −0.25 with x recentring, over 40–56 f [CHECK];
- a travel with depth eases `"zoom"` with `endD = MID − dz`, so the construction recedes at an even rate; a flat travel
  eases `io` [CHECK];
- a kept FG takes `far` [2.2, 3.2], and so does a KEPT MID. Under the default far fade a pull-back dissolves them on
  screen: a 0.25 pull-back takes a kept FG to 1.5× its rest distance, and the hook's terminal dimmed to 20% on its
  pull-back.
- a construction the camera travels across is marked for both framings during the travel (the sweep's hand-over count).
- If the travel only carries it to the frame's edge, it slides on out with the move (Video 2's wallet: `exit`, +520 px
  on `IN` over the pull). It never rests as a sliver at the edge.

8.10 **Close:**
- `TRACK`: z +0.12 across the question; `THRU`: z +1.2 into the close, over **56 f** (36 f was a jolt).
- **[CHECK] SMOOTH:** the camera path never accelerates faster than 15 px/f² (x, y) or 0.012/f² (depth). stylecheck
  measures every frame, and two canaries prove it: a slide starting at full speed must fire; SETTLE moves must not.
- **The question is never a push** (2026-09-30: "too many zooms").
- **★ From Video 6 it ARRIVES BY A SLIDE onto the open field (§9.8, 2026-10-05).**
  - The slide starts on the question section's first sentence ("So be honest.").
  - It carries the honest part's last framing out through the edge before the first word of the tracking text flies in.
  - Nothing is under the question, so there is no hero rack.
  - THRU then carries the question alone into the close.
- *(Videos 2–5: the question was a HOLD. The honest part's framing stayed behind it, racked out from HERO_ON − 12 so the text
  read over it. §9.8 retires that. A hold place is still allowed only as the film's last [CHECK].)*
- The question lifts 1800 px through the top, over 72 f.
- The logo opens only once the question's lowest ink has cleared it.

---

## 9. Motion grammar

9.1 **Curves** (canonical `anim.ts`):
- `OUT` bezier(0.17, 0.84, 0.28, 1) for entrances;
- `INOUT` (0.45, 0.05, 0.35, 1) for travels and grows;
- `IN` (0.55, 0, 0.9, 0.45) for exits.
- Never linear for anything a viewer watches move.

9.2 **Figures and labels** come out of depth with `fromDepth` (scale 0.8 → 1, blur 7 → 0, opacity ×1.7):
- over 18–22 f, starting 2–6 f before their word;
- labels 10–14 f before their numbers when both are cued together.

9.3 **Grows:**
- bars and solids 26–38 f (`OUT` for a single bar, `INOUT` for a pair);
- chart draws 40–120 f, span-aligned to the words they illustrate;
- staggers 3–9 f between siblings.

9.4 **Lighting:**
- **A GROUP changes colour as a quick WAVE** along its members, never all at once:
  - each member blends over 14 f on INOUT, 2 f after the one before it;
  - the last group lit in a scene keeps ≥ 1 s on screen before the scene leaves;
  - [T 2026-09-29: the hook's red candles first looked "too abrupt" (the whole group at once on an OUT ramp); then "the
    second group of red candles doesn't have enough screen time, make both of them turning red a faster animation"].
- the lit thing gets `FIN.lit` and a `#4D8ED9` glow (0.35–0.6), blended over 16–20 f;
- the others dim to ~55%, blended;
- never a colour switched on a threshold. Video 1's `lit > 0.01 ? A : B` face stops are a known deviation: do not
  copy them.

9.5 **Nothing is static.**
- Every MID keeps its `Turn` sine and every FG its drift.
- Something new happens on every clause: a figure lands, a bar grows, a mark lights, a page flips.

9.6 **Nothing pops.**
- Things enter from depth or from an edge, and leave by moving: a slide, a push past the lens, a fold, a drop.
- An opacity cut happens only after the thing is off-screen.
- A string never swaps mid-shot; counters count.
- **A mark that appears when something completes is blended in**, never mounted on a threshold:
  - a key-point halo at a line's landing: `rOut` over ~14 f around the landing, not `a > 0.97 &&`;
  - the lit head of a rising line: faded up with its first 6% of rise.
- **A glow that travels with a draw FADES when the draw ends** (the candle tape's head glow over ~14 f), never
  switching off at `draw < 0.999`.
- A label outside a construction comes in with `fromDepth`, not a bare opacity ramp.
- **★★ NO FLASHES [T 2026-09-30: "at 11 seconds, the screen randomly changes and becomes brighter"].** Pushed out of a dark
  place into a white one, the outgoing construction hung over the already-flooded white stage as a dark blur and dropped
  out at the lens in a few frames: +69 brightness levels in ONE frame at 11.6 s, +43 at 32.5 s.
  - The fix is the flood's timing: after a push out of a DARK place, the white stage floods from `t0 + 16` (not `t0 + 6`),
    once the outgoing place is through the lens (§4.2). The frame then brightens as one dissolve.
  - A fade on the outgoing layer was tried first and rejected: the lens pass sets a hand-over's length, so any fade cut
    three hand-overs under 15 f.
  - `scratchpad/flash.py` reads every kept sweep frame and refuses any one-frame change over 25 levels (a designed 24 f
    dissolve peaks at ~19). Its canaries prove it tells a step from a dissolve; it fired on the old frames at 11.57 s.
- **★ OBJECTS ENTERING ONE AFTER ANOTHER NEVER PASS THROUGH EACH OTHER [T 2026-09-30, Video 3: "in the interest is up 12%
  part the boxes closest to the camera intersect each other as they enter the scene"].** Three pallets were delivered from
  the left in a stagger, the leftmost-bound first, so the two bound further right drove through it.
  - Order a staggered entrance so each piece travels clear of the ones already placed: from the left, the FARTHEST-bound
    goes first. Equivalently, check that no two pieces' paths cross mid-flight.
  - ⚠ The sweep's CROSS compares DIFFERENT places only, so pieces of one construction passing through each other are
    invisible to it. The motion strips (§15.4) must look for this at every entrance, not only at the hand-overs.
- **★★ NOTHING VANISHES WHILE ON SCREEN** [T 2026-09-29: "Never let things like this happen"]:
  - a layer unmounts only after its last visible pixel has left the frame;
  - an element fades out only after it has left.
  - The sweep's VANISH / POP check (§15.2) measures this on every frame.
  - **★★★ RE-STATED, AND IT HOLDS FOR EVERY VISUAL WITHOUT EXCEPTION [T 2026-10-12, Video 9: "the phone just disappears on scene. I
    need you to never allow abrupt disappearing of visuals"].** Video 9's hook phone sat on its own slower depth plane; in the
    truck to the licence it trailed behind the rest, and its plane's window closed with its edge still on screen (frame 315 → 318).
    The probe never saw it, because the phone was `data-probe-skip`: **a check that cannot see an object cannot clear it.**
    - Anything skipped by the probe must still be proven gone by PIXELS: `scratchpad/popscan.py` judges every kept sweep frame in
      tiles and refuses any one-frame change that neither the frame before nor the frame after shares (a cut, a vanish, a pop),
      with canaries that must fire (a step) and must not (a 12 f fade, a slide). It runs with `flash.py` before every handback.
    - A depth plane's window closes only after its last pixel has left: a slow plane trails the place it belongs to.
- **★★ A CHART SHOWN ON A DEVICE IS ATTACHED TO IT [T 2026-10-12, Video 9: "the line chart in the beginning should be attached to the
  phone, and move with the phone"].** A chart, figure or readout drawn over a phone, monitor or card lives in the device's own
  layer, at its depth, and moves with it. It never parallaxes against the device it sits on. ★ That includes the headline figure
  printed over it [T 2026-10-12, Video 9: "the 8 billion text should also be anchored to the phone"]: Video 9's $8 BILLION had
  its own nearer plane (R 0.8) and drifted across the phone; now it is in the phone's layer too. Everything over a device is
  anchored to it.

9.7 **★ A PIECE TAKEN OUT OF A CONSTRUCTION LEAVES THE WAY THE REAL THING WOULD [T 2026-10-05, Video 5: "the slices in the pie should
  be removed as if they were actually in the pie, and not overlap the rest of the pie as they are rising"].** It slides straight
  out along its own line (a slice along its radius, a slab off its face), stays in its own depth (painter's order with the parts
  around it), and dissolves once it is clear. It is never drawn on top of the construction or lifted across the parts it was cut
  from.

---

9.8 **★★★ NO TWO SCENES EVER OVERLAP [T 2026-10-05, Video 6: "enforce the no overlap rule throughout the entire video: No visuals
from different scenes should overlap, even if its one fading out and the other fading in"] [sweep].** In no frame may any visual
of one place share screen area with any visual of another place: not while either is fading, dimmed, racked out or flying past
the lens, and not for a single frame.
- A hand-over keeps the two places apart IN SPACE (a slide: side by side, each clear of the other) or IN TIME (a push: the
  outgoing place is fully gone, dissolved as it passes the lens, before the incoming place's first pixel shows).
- Low opacity, blur and "it is only a transition" are never excuses. Travels across ONE construction are one place.
- The closing question no longer holds over the honest part racked out (§8.10): that framing slides away first.
- The sweep's SCENES check judges every cross-place pair of items at any logged opacity, sharp or blurred, flyers included.
- **How it is built (Video 6, `Video.tsx`):**
  - **A PUSH** dissolves every layer of the place it leaves (MID, depth planes, FG, frame) over [t0 + 4, t0 + 16], racked out and
    swelling toward the lens (`PUSH_OUT`).
  - The incoming place fades up only after that, over [t0 + 16, t0 + 28] (`PUSH_IN`).
  - The field shows alone for a few frames between them. The sweep's HANDOVER line measures that gap; 8 f or more refuses.
  - **A SLIDE** keeps its ≥ 15 f of co-visibility (§8.5), but the two places must stay side by side, each clear of the other.
- **The check:** `scratchpad/scenes.mjs`, imported by `sweep.mjs`.
  - It refuses on any cross-place pixel overlap at any opacity.
  - Its canaries: a 10% blurred overlap must fire, a touching pair must not, and an item carried across must not.

9.9 **★★ PIECES CARRIED BETWEEN FRAMINGS MOVE AS ONE SMOOTH GESTURE [T 2026-10-07, Video 7: "the animation for the boxes at 37
seconds should be smoother, really focus on making it look good"; "same thing for the one at 40 seconds, it should be smoother
and the direction shouldn't change so abruptly for the little boxes"].** Video 7's five giants rode the slide into their block on
a different ease from the camera's, so on screen they drifted back, then rushed forward, and crossed through each other as their
tiling changed; the bottom 250 dived down and snapped back up on a sine arc.
- **Lock the carry to the camera.** A piece ridden across a slide moves `slide × SETTLE(t)` in the world, exactly the camera's
  own move, so on screen it is still; its own travel to its new place is a separate, monotone in-out on top. On screen the path
  is then one ease with no reversal.
- **Re-tiling keeps the topology.** When pieces regroup (a map's tiles into a block), the target layout keeps their order and
  neighbours (left of, above), so shared edges stay shared through the interpolation and nothing passes through anything.
- **A flock flies on smooth curves.** Each piece follows a cubic Bézier (tangent continuous: no V-turn), eased in and out on its
  own, staggered; never a `sin` arc added to a straight lerp.
- **Lift, travel, settle, merge:** a piece taken out lifts first (scale and light), then travels, then lands; a merge happens
  only on landed pieces, with the merged solid covering them exactly (no ghosted double image).
- Checked frame by frame in full-size single-tab frames (strips every 3 f), and the screen path of the group by tracking.

## 10. Scene structure

10.1 **Hook:**
- one of the hook chart types (a line, two bars on one axis, candlesticks);
- never the same hook chart type or hero object as the previous video (`Videos/log.md`);
- the first sentence's subject is on frame 0.
- **★★ STRONG, FOCUSED, DEMO-GRADE [T 2026-09-30: "Hook is very claudy and weak (the gas receipt and clock in the middle
  looks very ai generated)"].** The model is the demo's opening:
  - ONE construction the camera works across (the demo: the Nasdaq tape, pushed onto its record candle);
  - a BIG figure with one short label landing on each clause (27,244 / RECORD CLOSE);
  - no dials or gauges (they read as a clock);
  - no receipts or props;
  - no corner piece.
  - ~~Video 2's hook was a trading-terminal chart~~ (two boxed panes): Timur called it "visually very weak" (below).
- **★★ THE HOOK IS A CHART IN 100bps' HOOK GRAMMAR [T 2026-09-30].** Timur: "the hook scene is visually very weak, improve
  it a lot, perhaps by taking some inspiration from 100bps"; then, over a forwarded revision prompt (a four-plane hook with a
  receipt, a slamming number, ghost candles): "no, scrap the hook completely, don't listen to the prompt, undo the changes
  relating to the hook. Create some sort of chart hook scene, using inspiration from 100bps". So:
  - **ONE chart, ONE gesture that reads in a second with the sound off.** When the story is a contrast, the two series
    leave ONE shared starting point and open apart on ONE axis: 100bps' "jaws" (its hook for this same story).
  - **Honest:** one unit (% change from the shared start), zero-based (the start is the 0 line), real monthly data.
  - **★ NOTHING ELSE ON IT [T 2026-09-30: "too many random elements in the hook scene, like lines and stuff"].** Only the
    two series, their shared start bead, their heads, their names and the verdicts. No zero line, no dashed record or
    reference levels, no measured stretches, no bands or bracket lines. A comparison is carried by a verdict label
    ("WORSE THAN 2008"), an event by lighting the series itself (2022's stretch of both ribbons turning red).
  - **Full frame and moving on frame 0:** the chart spans ≥ 80% of the width; both series are already ~30% drawn on the
    first frame (the thumbnail), and the gap reads by ~1.7 s.
  - **Built in the Bankers solids:** each series is a lit extruded ribbon with a bead head; the rising one is the brighter,
    thicker one. Never a flat stroke, never boxed panels, a dashboard or a terminal frame.
  - **A new event on every clause,** and the verdicts sit OUTSIDE the jaws (the rising one above its line, the falling one
    below its line), each a big figure with one plain label (100bps G5). The wedge between the jaws stays empty.
  - The camera works across it as ONE construction with flat travels (§8.9), Video 1's camera.
  - **Nothing on it just appears [T 2026-09-30: "instead of the red lines just appearing, add an animation for them"]:** a
    mark on a series DRAWS along it (Video 2's 2022 stretch runs red from the shared start, feelings first, stocks a beat
    later, 22 f each on INOUT), never an opacity fade over the whole stretch.
  - **No props, receipts, planes of motes or forwarded-prompt devices in the hook.** The rejected prompt build (a soft
    receipt behind, a slamming extruded number, candles in front, motes) is not to be revived.
- **★★★ A PLAIN CHART IS NOT A HOOK — BUILD A CREATIVE CONSTRUCTION [T 2026-09-30, Video 3]. This supersedes "THE HOOK
  IS A CHART" above for Video 3 onward.** Timur, on a two-bar hook: "add some more interesting visuals to the hook scene,
  for example since there is military on screen add something related to that and something related to interest as
  well. Right now it is too plain and simple"; then, while objects were being added to the bars: "no, don't do a bar
  chart, replace the hook with something more creative entirely".
  - The hook is ONE creative construction built from the real objects its first line names, with a MECHANISM that enacts
    the line and reads in a second with the sound off: a visual metaphor you can hold, not a chart of the numbers.
    Video 3: a balance scale, the military's hardware (a tank and a fighter jet) on one pan, and a cast-iron weight
    stamped "%" dropping onto the other, so the beam tips to interest.
  - The numbers still land as big figures, one short label each, on the construction (STYLE §6.6). The figures are the
    verified ones; the metaphor is never drawn to a false scale or read as a chart.
  - **★★ FEWEST ELEMENTS [T 2026-10-05, Video 4: "remake the hook, right now there are too [many] elements on the screen in it"].**
    The hook carries only what tells its first line: its real objects, a figure for each side and at most one short label
    under each figure. Nothing decorative: no near-plane racks, no far-plane wallpaper, no second chart, no axis. Count the
    last frame's elements before handback: about six is the ceiling (Video 4's layered hook had ~15; its remake has six).
  - **★★ TWO SUBJECTS ARE SHOWN ONE AT A TIME [T 2026-10-05, Video 6: "Instead of having the cruise together with the other
    visuals in the hook scene, I want you to first show the rest, and when the cruise is mentioned, the camera should sort of
    pan in some direction and only the cruise ship along with related visuals should be visible"].** When the hook's lines name
    two subjects (confidence, then cruise bookings), the first framing holds ONLY the first subject and its objects. On the
    word that names the second, the camera PANS (a slide) to a framing that holds ONLY the second subject and its own objects:
    nothing of the first stays in view, and nothing of the second is on screen before its word. Each framing still counts its
    own elements against the ceiling above.
  - **★ NO PROPS FALLING THROUGH THE OPENING [T 2026-10-05, Video 6: "remove the survey visuals that keep falling in the very
    beginning of the video"].** The brief's survey cards tumbling past the lens were decoration around the first line: the
    opening framing is the line and its figure alone. (Video 6's boarding passes in the cruise framing stay.)
  - **★★ A LINE IN THE HOOK DRAWS FROM ITS FIRST POINT, AND THE CAMERA FOLLOWS ITS HEAD [T 2026-10-05, Video 6: "start the line
    at the very beginning earlier, and add that smooth camera follow effect to it"].** Frame 0 shows the line just beginning,
    not already half drawn. The framing starts close in (about 1.5×) on its head, follows it, then eases back to the whole
    construction as the figure lands — the one sanctioned "camera follows data" device; the journey's camera keeps Video 1's
    moves (§8.7).
    - **★★ Done the 100bps way [T 2026-10-05: "right now the camera following the line at the beginning is too jittery, look at
      how its done in the 100bps videos"]** (Style 3 V29 `MonthPair`, V12's stake column): the follow is ONE transform WRAPPING
      the construction's `Turn`, never a transform moving inside it (a Turn flattens its subtree, and a move inside it steps by
      half-pixels); and its target is a STEADY eased value, never the data — x on the draw's own ease, y straight from the line's
      first point to its last. The first follow aimed at a moving average of the series and still bobbed with the 2020 dip.
    - Measured, not eyeballed: `scratchpad/followjit.py` (phase correlation on lossless single-tab frames from
      `framesprobe.mjs`, the flyers and the landing figure masked) must report 0 reversals and a worst jerk under 1.5 px. Video 6:
      ≤ 0.17 px through the follow and 0.13 px through the ease-back.
  - What stays from the rules above: one construction, frame 0 already moving, the first line's subject on frame 0, a new
    event on every clause, Video 1's camera, the Bankers solids and palette, and no receipts, motes, background planes,
    reference lines or forwarded-prompt devices.
  - **★ A construction BEHIND the hook's line and type stays clearly dimmer than them [T 2026-10-07, Video 7: "the background
    should be a little darker/less visible in the hook scene"].** Video 7's restyled tile wall (pale keycaps up to `#9DC0EA`)
    competed with the white line and RECORD HIGH. Its keycaps now top out at the ramp's mid blues (about `#4D8ED9` at the light's
    centre), with softer bevels: lit solids, but a backdrop.
  - **★ …and a backdrop has NO VISIBLE EDGES [T 2026-10-07: "the edges of the group of boxes in the background of the hook scene
    shouldn't be visible, make them larger, but don't change the size of the lighting on them"].** It runs past the frame at every
    camera position the scene uses; where it should end, the LIGHT ends (its pool, fixed in size), never the construction.
    [T, again: "the edge of the group of blocks is still visible … make the blocks in the background larger so that they can more
    easily fill up the screen"] — a backdrop of repeated parts uses parts big enough to fill the frame, not more of small ones.
    [T 2026-10-08: "MAKE SURE THE BACKGROUND OF THE HOOK SCENE IS FULLY COVERED IN THOSE BOXES"] — **the backdrop covers the WHOLE
    frame at every frame; nothing in it fades out to hide an edge** (fading the top boxes left the top of the frame empty, which is
    the edge problem in another form). Its outline is projected and checked to contain the frame (`scratchpad/wallcover.mjs`).
  - **★ A label belongs to the point it names [T 2026-10-07: "the record high text should be smaller and right above the end of the
    line on the right"].** RECORD HIGH sits small, just above the record dot, in the line's own plane (so it never drifts off it).
  - **★ Nothing that rises in the hook crosses its line [T 2026-10-07: "When the 5 blocks rise, they cannot intersect with the line,
    5 blocks that are below the line need to rise"].** Towers are picked from tiles below the line on screen, and their risen caps
    are checked against the line at every frame of the rise.
  - A chart still carries data everywhere else in the film.
  - Video 2: stocks (the S&P 500's month-end closes) and how Americans feel (the Michigan index) from the end of 2021 —
    7,743 NEAR A RECORD above, 48.1 WORSE THAN 2008 below, and in the kicker 2022 lit red on both ribbons, when the jaws
    were closed and both fell together.
- **★ Every 15 s gets the demo's care** [T 2026-09-30: "the demo looked great because it focused on 15 seconds of the video
  and made it look good"]. A long film is not an excuse for a weaker scene: judge each scene against the demo's frames.

10.2 **Body:** one construction per scene, named in three words; no visual repeated within a video (root rule).
- **★★★ FROM 2026-10-09 WHAT A SCENE MAY BE IS `Resources/visual-vocabulary.md`:** "a chart", "a number", "one to three simple
  shapes" or "a sentence". The "nothing basic" and "real assets" rules below are superseded by it and kept as history.
- **★★ ONE OF EACH CHART KIND PER FILM [T 2026-10-05, Video 6: "the third scene is a bar chart after the bar chart in the second
  scene. Prevent these sorts of things by avoiding visual repetition in the same video. Replace it with different visuals"]
  [CHECK].** Two scenes can hold different OBJECTS and still be the same VISUAL: Video 6's yearly-lows columns were followed by
  Carnival's deposits as stacks of $1B blocks, so the viewer saw two bar charts in a row. Judge each scene by its KIND, not its
  props.
  - Every `places/*.tsx` declares `export const KIND`, one of: `bars` (any row of solids whose heights are the data: columns,
    stacks, ranked solids), `line`, `candles`, `pie`, `dial` (a needle or gauge), `steps`, `grid` (a unit grid lit to a share),
    `fill` (one level rising in a vessel: a tank, a lock, a thermometer), `counter` (a figure counting on a mechanism), `text`
    (a text-only beat: tracking text with one serif accent word, from 2026-10-09), or `object` (a simple primitive or object
    acting out its sentence, with no data scale).
  - **Every kind except `object` and `text` appears at most once per film.** Objects still follow the no-repeat rule above.
  - **★ Unless Timur names the kind for a scene [T 2026-10-07, Video 7: "use candlesticks for the scene at one minute"].** Then the
    second use carries `style-exempt: <his words>` on its KIND line (the checker prints it), and it must still look unlike the
    first: Video 7's record close is one monthly tape from zero on a rail; its honest part is two diverging candle series with
    ghost-candle futures.
  - stylecheck KINDS refuses a missing, unknown or repeated kind (from Video 6 on), with canaries.
  - Classify honestly: a set of extruded solids whose heights are numbers is `bars`, whatever is printed on them.
- **★★ BUILD ANIMATIONS OUT OF REAL ASSETS, THE DEMO'S WAY [T 2026-09-30: "the demo … used assets like the roman pillars to
  create an animation, it should be doing that now but its not"].**
  - In the demo, the camera pushed past the rate pillars, and the Fed's dial arrived framed between Roman columns on
    the white stage. The asset (the columns) MADE the transition and the composition.
  - Every film has at least one such place: a real structure the sentence names, built in solids, that the camera moves
    between or through, framing the construction.
  - Video 2's is the University of Michigan: its columned hall frames the survey's history, on "the University of
    Michigan's consumer sentiment survey".
- **★★ NOTHING BASIC [T 2026-09-29: the up/down arrows scene "does not look good, it is too simple and claudy"; 100bps
  G4].**
  - A construction is never a symbol standing in for an idea: two arrows, a plaque, a lone number.
  - It is a real, detailed thing, or a real chart on one.
  - **When a sentence compares two things, build the MID-FUNNEL FRAME (100bps G3, V30's praised frame):**
    - two things side by side, one going up and one going down, each on its own panel;
    - one plain verdict under each name;
    - professional motion.
  - Video 2's "So how can both be true?" is two trading MONITORS on stands:
    - 2026's weekly S&P candles reaching a RECORD line, with the verdict NEAR A RECORD HIGH;
    - 2026's monthly sentiment step line touching a RECORD LOW line and turning red, with the verdict NEAR A RECORD LOW;
    - both screens zero-based (§14.1).
- **Chart grammar is vocabulary, not a repeated visual:** the key-point halo, a TODAY or PEAK label, a zero axis, the
  series' names. The CONSTRUCTIONS must differ: gauge, candle tape, line, ranked solids, bars, arrows, pump, block, ≠,
  rails.
- A headline number may land as a figure in each scene that says it (48.1 in the hook, the line and the ranking). It
  may not be the same construction twice.

10.3 **The honest part:**
- both directions drawn with EQUAL weight: the same stroke, colour, length and duration;
- no lean (Bankers §5).

10.4 **The close:**
- the closing question as tracking text (§5.5) with the comment bubble as its FG;
- then `BrandClose`.

10.5 **Log each video** in `Videos/log.md`: its hook chart, hero objects, scene types and signature composition.
No signature composition repeats within five videos.

---

## 11. Sound

11.0 **★★ ONLY FAMILIES THE STUDIO HAS ALREADY USED [T 2026-10-01: "Only SFX that have either been used in 100bps style 3 or
in the previous bankers videos"].** A Bankers film scores with the families cued in Bankers Videos 1–2 or in a Style 3 film:
the swoosh family (§11.1), data / datamid / datashort, chain / chainshort, sub, ping / pingshort, and from Style 3 tick, click,
flick, coin, ding and bloom. Never riser or glide (§11.2), never a new file. `sfxsheet.mjs` KIND refuses anything else.
- **★★★ …AND SCORED THE WAY 100bps SCORES THEM, WHEREVER THEY APPLY [T 2026-10-14, Video 11: "remember to use 100bps sfx in the video
  where they apply"].** Bankers carries 100bps' pack; the score follows 100bps' FAMILY-PER-JOB doctrine (root `test/resources3/
  style3-preferences.md` §9), one job per family for the whole film:
  - `chain` / `chainshort` under anything mechanical or REPEATING — bars and columns CLIMBING (the user's 100bps ruling), blocks
    dropping in one after another, a wheel turning, things gliding on a rail — cut when it stops;
  - `data` family for a thing COMPUTING (a number re-reckoning, a line drawing) for exactly its span;
  - `sub` under every BIG arrival (a hero figure landing, a load seated);
  - `swoosh` for ordinary ENTRANCES (a coin rolling in, cash arriving), `whooshlong` for the big turn, `whooshsoft` for small
    hand-overs, `airwoosh` for the camera's travels, `lowwoosh` for verdicts (a share leaving);
  - `ping` rationed (~3 a film, quiet) and only on a NUMBER arriving; `coin` solo on a key coin landing; `tick` LITERAL only (a
    quarter passing); `click` a rare solo LATCH (a bolt, a part seating) — never a run of clicks.
  The 100bps `gavel` is for a gavel on screen only. Check every score against this table, not only against `sfxsheet.mjs`.

11.1 **A swoosh on every move, rotating:** whooshlong (vol 1.6, peak 4), swoosh (1.5, 2), airwoosh (0.8, 2),
lowwoosh (1.1, 3), whooshsoft (1.0, 2).
- **★★ It is placed so its peak lands on the move's FASTEST frame, not its midpoint [T 2026-10-01: "ensure that the sfx are
  timed right, especially in the hook scene"].** Every move runs on SETTLE, which peaks ~29% in and brakes over the rest. On
  the midpoint, every whoosh in Video 3 peaked 8–12 f AFTER the picture's own motion (measured on the sweep's frames), heard
  as the move was settling. `SETTLE_PEAK` is read off the ease itself (Video.tsx). THRU's picture is the camera and the
  question lifting away, so its whoosh peaks between the two fastest frames. `scratchpad/whooshsync.py` measures every camera
  whoosh against the frames and refuses any more than ±3 f off (Video 3: all within ±1 f).
- **★ A PUSH's whoosh peaks on the outgoing place's rush, the middle of `PUSH_OUT` (t0 + 10) (Video 6, 2026-10-05, with §9.8).**
  A push now hands over in time, so the camera's fastest frame (t0 + 16) falls on the empty field. What the eye reads as the move
  is the outgoing place swelling at the lens and dissolving, and both of Video 6's pushes measured their picture's peak at t0 + 9
  (`pushFast` in Video.tsx).
- `ARRIVE` gets whooshsoft 0.6; `THRU` gets lowwoosh 1.1.
- **A travel's whoosh is sized to the travel [T 2026-10-01].** The rotation gave Video 3's hookB, a 72 px drift, whooshlong at
  1.6: the loudest family on the smallest move, 2 f from "$1.05T" landing. A small drift takes whooshsoft ~0.5; a camera
  travel takes airwoosh 0.8, Style 3's family for travels (Video.tsx `SWOOSH_OF`).

11.2 **Context sounds are only for actions visible on screen:**

| Family | Job | Vol |
|---|---|---|
| data | drawing / computing | 0.35–0.45 |
| datashort | a solid rising, a small build | 0.3–0.5 |
| datamid | a big growth or rewind | 0.4–0.5 |
| chain | a mechanism | 0.45 |
| sub | a big arrival settling | 0.6–0.85 |
| pingshort | one mark lighting | 0.3–0.35; at most one per place |
| flick | a page turning (one per page); a label or small figure dealt in | 0.5–0.7 |
| tick | lights coming on one by one, steps laid (one per item) | 0.6–1.4 |
| click | a part seating into place (solo) | 0.27–0.35 |
| coin | money moving: coins on a stream, coupons cashed, a holder paid | 0.3–0.5 |
| bloom | a reveal that takes the light (cut as the next move starts) | 1.0 |

- **★★ EVERY SOUND IS TIMED BY ITS ANIMATION'S OWN WINDOW [T 2026-10-01: "ensure that the sfx are timed right, especially in
  the hook scene and add some more throughout the video"].** Video 3's hook rattle was cued at "interest − 10": a guess at the
  beam's swing. The beam was already swinging hardest at frames 15–30, so the rattle started 43 f late and ran 40 f after the
  beam stopped. Every figure's hit sat on its word, 2–3 f after the figure visibly arrived.
  - Each place EXPORTS its windows (`riffle`, `ringLights`, `palletTimes`, `couponTimes`, `rolloverTimes`, `streamTimes`,
    `ledgerTimes`, `futureTimes`, `rateTimes`, `towerDrop`, `beamSwing`, `balanceLit`; every figure lands on `figLand`). The
    construction animates on them, `registry.tsx TIMES` calls them with the same cue words, and the score reads `TIMES`. There
    is no copied offset to drift.
  - A HIT goes where the eye sees the arrival: 0.4 of an OUT window (a figure on word c: frame c − 2), 0.5 of an INOUT one,
    and 1/3 of a page's 270° flip (passing vertical).
  - A MECHANISM'S RATTLE spans the motion's measured frames (the hook's beam: wherever it turns ≥ 0.04°/f) and FADES over the
    slower share of the swing, never rattling on at full level to a hard stop.
  - One sound per visible item where the items are counted: a flick per calendar page, a tick per ring or step, a coin per
    coupon or holder, a click per bond seated. Mirror images get identical sounds at identical levels (§10.3).
  - `scratchpad/sfxsheet.mjs` prints the score as heard, against the words and the places, and checks it. PILE: two
    different hits within 3 f, or a ping, click or chime within 4 f of a move's whoosh. OFFSTAGE, KIND, and SILENT places
    are also reported. `sfxmotion.py` plots the sweep's frame-to-frame motion with every sound on it.

- **★★ A PROCESS SOUND LASTS AS LONG AS ITS ANIMATION [T 2026-09-30: "the sound effect you set at 11 seconds isn't long
  enough, always ensure that the sfx align with the length of the visual animations"].** At 11 s a 2.3 s `data` file sat
  under a 3.5 s point-to-point trace and stopped while the line was still moving. The lows (52 f under 29 f), the LED
  board's drain (137 f under 48 f) and the 500 tiles (52 f under 29 f) were short the same way.
  - A drawing, growing, filling, draining or lighting sound is written as `proc(from, to)` with the animation's OWN first
    and last frame (Video.tsx). It picks the variant whose length fits (datashort 29 f, datamid 48, data 68), and CHAINS
    data copies, 6 f overlapped, for anything longer.
  - Every such window is recorded, and the build REFUSES if the cues stop before the animation does. It was proven by
    firing: sabotaged, it refused on exactly the 11 s case ("frames 328–436 stops at 396").
  - When an animation's timing changes, its sound's window changes with it: it reads the same cue frames.
- **★★ THE DATA TEXTURE IS RATIONED [T 2026-09-30: "use that sound effect … less often throughout the video, be more selective
  about what visuals to use it with"].** Video 2 had scored 17 animations with it, so it read as wallpaper. It plays only
  where a SERIES IS BEING COMPUTED on screen as its scene's main event: about three per film (Video 2: the jaws opening, the
  University's readings tracked hop by hop, the pump's price rolling). A bar growing, a colour wave, a label or a light gets
  its swoosh, sub or single ping, or plays silent.
- **Never a riser, never a glide.**
- `PRESENCE` 1.59; every cue goes through `within()`.

11.3 **The bed:**
- **★★★★★★ RADIOHEAD — "EVERYTHING IN ITS RIGHT PLACE" (INSTRUMENTAL) [T 2026-10-13, Video 10: "nevermind, stop it and change the
  song to everything in its right place"].** Video 10's master had just rendered with Daphni's "Poly" (Video 9's bed from 2026-10-12,
  carried over as "the same song"); it is archived, and the bed is now this track.
  - **The file:** `music_radiohead.mp3` (267.5 s, 48 kHz stereo), the same file as Videos 4–5 (from Style 1 Video 1's public/). The
    19-s copies in Downloads and Style 3 V32's `music_previews/` are previews only.
  - **Its shape:** flat, −16.1 to −16.6 dB in 4-s windows from its first second over the film's length; no intro, no drop. It plays
    from its top in one regime (`DROP_SRC = null`), 3.5 dB under the voice per 10-s window.
  - **What follows:** the next Bankers video follows this track unless Timur names another.
  - ⚠ Commercial (Radiohead): flag the client's rights.
- **★★★★★ FUTURE — "LIKE ME" (INSTRUMENTAL) [T 2026-10-07, Video 6: "use the song I put in the new 100bps video's public folder"].**
  - **The file:** the track Timur dropped in Style 3 Video 34's public/. It is copied into the video as `music_likeme.mp3`
    (134.5 s, 44.1 kHz stereo); a music file is not branding.
  - **Its shape:** an intro at −16 to −18 dB, then a beat that hits at 12.85 s in the source, then a flat body at −7 ± 0.7 dB to
    ~120 s.
  - **The mix:** it is laid out like Yeat. The drop lands on the `what` section's first word, the hook sits over the intro 8 dB
    under the voice, and the body sits 3.5 dB under.
  - **The drop:** the intro runs straight into the hit with no gap, so the 0.1 s gain step is centred 0.05 s before it
    (DROP_SRC 12.80) and completes as the beat lands.
  - **Measuring it:** measure a drop with an ACCURATE seek (output-side `-ss`). An input-side seek on the mp3 showed 40 ms of
    decoder silence that is not in the song.
  - **What follows:** the next Bankers video follows LIKE ME unless Timur names another. The Yeat envelope and bed are archived in
    Video 6's scratchpad.
  - ⚠ A YouTube rip of a commercial track: flag the client's rights.
- **★★★★ YEAT [T 2026-10-05, Video 6: "use yeat for the song"].** Video 6 replaced the Succession track (Video 5's bed) with the
  Yeat track (`music_yeat.mp3`, copied from Video 4's public/), its drop landing on the `what` section's first word as below. The
  next Bankers video follows Yeat unless Timur names another. The Succession envelope and bed are archived in Video 6's scratchpad.
- **★★★ YEAT, AGAIN [T 2026-10-01: "change the song to yeat and render"].** Video 3 went back to the Yeat track
  (`music_yeat.mp3`, Video 1's bed, copied from Video 1's public/), so the next Bankers video follows Yeat unless Timur names
  another. Its intro is quiet and it DROPS: the drop hits at 13.345 s in the source, measured in 10 ms windows just after a
  10 ms gap. `bedsrc.mjs` lands it on the first word of the `what` section, with the hook over the intro, 8 dB under the
  voice; the body is 3.5 dB under. The gain steps over 0.1 s centred 0.05 s BEFORE the hit (DROP_SRC 13.29), so the step
  finishes in the gap. Centred on 13.33 it straddled the hit, and ~30 ms came through ~2 dB hot. Poly's envelope and bed
  are archived in the video's scratchpad.
- ~~DAPHNI — "POLY"~~ (superseded 2026-10-01) (`music_daphni_poly.mp3`, 138.3 s, stereo) **[T 2026-09-30]**. Timur: "use a different song"; the
  WW3 track (Style 3 V27/V30) went in, then "different song", and he chose Poly from the tracks already in the project. It is
  flat (−12 to −10 dB after a softer first 4 s), so it plays from its top in one regime. The next Bankers video follows it
  unless he names another. Succession, Yeat and WW3 are retired for Bankers unless he asks.
- ~~The SUCCESSION track~~ (superseded 2026-09-30) (`music_succession_bed.mp3`, 166 s, stereo) **[T 2026-09-28]**. With Video 2's take Timur
  said "use a song other than the yeat one". Video 1's Yeat track is retired unless he asks for it. The next video
  follows the previous one's song unless he names another.
- ⚠ Both tracks are commercial, so every build summary flags the client's rights until they are confirmed.
- A track with a quiet intro and a drop (Yeat): the drop lands on the first word of the second section, and the intro is
  its own window, 8 dB under the voice.
- A flat track (Succession: −8.2 ± 0.4 dB from its first second) plays from its top, in one regime (`bedsrc.mjs`
  `DROP_SRC = null`).
- Mixed from the rendered stems, speech-gated, 3.5 dB under the voice in 10 s windows (`bedenv.mjs`: Video 2's six
  windows within 0.2 dB).

11.4 **Wiring:** `HAS_VO`, `HAS_MUSIC` and `HAS_SFX` switch on together when the real take is wired.
- **★ The score plays in the Studio on the PROVISIONAL take [T 2026-10-01: "Ensure that there are lots of SFX and they are timed
  right", asked before the VO existed] [CHECK].** `SFX_PREVIEW = SYNTHETIC` (the captions' own flag) lets the SFX be judged
  before the voice is recorded. It switches off by itself when the real take is wired, and `render.mjs` refuses a master while
  the take is synthetic, so a preview never ships. stylecheck STAGE refuses any other value.
- **★ "Lots", and each on its frame [same note].** Every visible action gets its family's sound: a figure or label dealt in, a
  light, a bar growing, each counted item, a mechanism, a big arrival, each line of the question. Video 4 carries 128 cues in
  ~68 s. Each is timed by its animation's exported window (§11.2), and `sfxsheet.mjs` (PILE, OFFSTAGE, KIND) plus
  `whooshsync.py` are clean before handback.
- **Levels follow the previous film's MEASURED band, family by family.** Render the SFX stem alone (`audioprobe.mjs sfx`)
  and run `scratchpad/sfxlevels.py "<previous video>"`: it reads each cue's heard peak, clear of its neighbours. Video 4's
  first score had its flicks, context swooshes and whooshsofts 2–4 dB under Video 3's, written at 0.4–0.5 where Video 3 used
  0.5–0.7. They were raised to land within ~1 dB.

---

## 12. Watermark and close

12.1 **Watermark:**
- the Bankers logo, 130 × 39 px, centred at x 540, y ≈ 1745, opacity 0.3;
- the white file on dark, cross-fading to the black file on white;
- it rises in over 26 f and sinks out as the close arrives.

12.2 **`BrandClose`** (canonical `close.tsx`):
- the logo at 620 px, filled `#FFFFFF → #B3CEEF → #4D8ED9`;
- a `#005DC8` glow and halo, a mirror floor, one specular sweep;
- scale 0.84 → 1 over 44 f.

---

## 13. Captions and voice on screen

13.1 **Chips are generated from the take**, never the script, at ≤ 4 words (5 only to avoid a one-word orphan). No
chip spans two sentences.
- **Nor two clauses:** a take that joins sentences with a comma ("…than they did in 2008, yet stocks are…") still breaks
  its chips at the comma when both sides have ≥ 3 words. A short opener like "On Friday," stays attached.
- **The silence snap is measured from the WAV:** a word whose transcribed start sits in silence (< −45 dB for 30 ms)
  moves to where the audio rises above −35 dB. On Video 2's take, 9 words moved.

13.2 **The question sentence is not chipped.** It is the tracking text.
- The chips give way as the question's first word starts out of depth (`HERO_ON = HERO[0].at − 3`, track.tsx), but never
  before the last chip has shown its final word for 8 f. Video 2's take starts the question 9 f after "honest.".
- **[CHECK]** The last chip before it has shown its last word for ≥ 8 f. Video 1's `at − 11` cut "So be honest." 6 f
  after "honest".
- The call to comment after the question ("Tell us below.") is not chipped either. The question is still lifting
  through the caption band, and the comment bubble (FG) carries it.

---

## 14. Content on screen

14.1 **Honest scale:** bars, lines and candle tapes start at zero on linear scales. Everything compared shares one
scale.

14.2 **One dataset per figure family** (root rule). Each live figure carries a ★ in `data.ts`.

14.3 **No bias** (Bankers §5): equal finishes for compared things, no hero or loser colouring, and no prediction.

14.4 **No 100bps branding** anywhere in `Bankers/` [CHECK].

---

## 15. Verification (every build, before handback)

15.1 **`node Bankers/Resources/stylecheck.mjs "<video folder>"`** must end CLEAN. It checks:
- ENGINE: every `Resources/kit/` file, byte for byte;
- SCENES: ≤ 7.0 s each;
- WHITE: the share of white places and the longest dark stretch;
- CAMERA: the move constants, durations and easings, no beats, the caption camera ≤ 3 uses, no kind 3× in a row;
- CAPTION: the caption scale frame by frame, and the question's hand-over;
- TYPE: helper sizes, raw sizes only on object print, no text shadow;
- COLOUR: the logo blue's family, near-neutrals, the canonical reds (every red use is listed);
- STAGE: the key light, the watermark, the HAS_* switches together;
- BRAND: no 100bps branding.
- KINDS: every place declares its construction KIND, and no kind but `object` repeats (§10.2, from Video 6).

It proves itself on every run: 25 known-bad and known-good cases must be judged correctly, or it refuses. It fails
closed: no JOURNEY export, no places, no colours or no helper calls found is a refusal. On 2026-09-28 it was made to fire
on a sabotaged copy of Video 2 (Video 1's caption snap and question cut, a camera beat, a 40 f push, a 7.3 s scene, raw
46 px text, a text shadow, a red keypad key, a green, one changed engine number, HAS_SFX alone). It caught all twelve.
A line may opt out only with a visible `style-exempt: <reason>` marker, and every such line is printed.

15.2 **The every-frame intersection sweep** (`scratchpad/sweep.mjs 1 --keep`) must end CLEAN, with every hand-over
at ≥ 15 f. It includes MARGIN (§6.1) and **VANISH / POP** (§9.6).
- VANISH: a world layer unmounted while any of it is on screen.
- POP: a layer appearing whole, sharp and ≥ 60% opaque in one frame.
- On 2026-09-29 VANISH was proven on the old unscaled slide: it fired at frame 913, where the gap construction's edge
  was still on screen.

15.2a **★ THE VIOLATION SWEEP [T 2026-10-01: "do a full intersection and violation sweep"].** After every full sweep,
`scratchpad/violations.mjs` reads the probe's per-frame measurements and measures CLEARANCE, not only crossing:
- text to a shape it is not printed on: ≥ 14 px;
- text to text: ≥ 10 px, or 8 px within one construction;
- anything to the caption chip's ink: ≥ 12 px;
- text to the edges of the surface it is printed on: ≥ 14 px.

A touch is gap 0 and counts. Settled frames must be clean; spans wholly inside a camera move are listed apart as transit. It
proves itself on canaries (fires on 7 px and on a touch, silent at 34 px) before it reports. "A full intersection and violation
sweep" means both, every frame, fixed until clean, then the kept frames looked at.

15.3 **Stills side by side:** put a still of every place next to the matching kind of place in the previous video.
It must sit in that video unnoticed (§2.5.1c).
- **★★★ MEASURED, AND AGAINST THE LAST FOUR FILMS [T 2026-10-07, Video 7: "the video doesn't really look like the past videos that
  we've made for bankers, something is off. Its something with the visuals used and the colors … Compare this one to the previous
  ones, and fix it"].** Video 7 passed every check and still read as another channel: a navy-on-navy tile wall, a flat dot grid, a
  flat treemap, thin lines on empty navy, a pale flat bill, and zero-based weekly candles that collapsed into a blue slab.
  - **What every place shares in Videos 3–6:** ONE big construction of EXTRUDED, LIT solids (pale faces white → `#B3CEEF` → `#347ED3`,
    blue stepped depth, a bevel or white edge), ~70–85% of the frame's width, centred, standing on a floor at y ≈ 1300–1400 with its
    `Pool3D`, on a `Turn`. The navy is the GROUND; an object is never navy on navy. Lines appear only on a chart, as lit ribbons.
  - **Never:** a flat 2-D chart or diagram as a whole scene; a grid of dots; strokes alone on an empty field; a chart whose data
    collapses at an honest scale (pick the window or the construction that reads, never a cropped axis).
  - **The tool:** `python Bankers/Resources/lookcheck.py "<video folder>"` writes `out/lookcheck_sheet.jpg`: one settled frame of
    every place, in a row above the same for each of the last four films. It also reports each place's coverage, lit-solid share and
    width with its rank among those films' places, and refuses a place emptier than every one of them.
  - ⚠ **The numbers cannot pass a film.** Measured on 2026-10-07, they do not separate Video 7's rejected first build from the
    accepted films (Video 4 is as dark and sparse by every one of them). What was wrong was FLATNESS and navy on navy, which only the
    eye sees. So the sheet is read before every handback, and each place that would not sit in its column unnoticed is rebuilt.

15.4 **Motion strips:** contact sheets across every transition, every 4–6 frames. Look for pops, flashes and
loitering.

---

## 16. Changelog

| Date | Rule | Change |
|---|---|---|
| 2026-09-28 | all | Spec written from Video 1's measured source + Timur's Video 2 notes. |
| 2026-09-28 | 1.3 | Scenes ≤ 7 s [T]. |
| 2026-09-28 | 6.8, 7.6 | Realistic hero objects; detailed FG pieces [T]. |
| 2026-09-28 | 8.2 | Pushes use `ease: "zoom"` (world.tsx) [T]. |
| 2026-09-28 | 8.7 | Camera = Video 1's; no beats / float / data-slaved camera [T]. |
| 2026-09-28 | 0, 15 | `Resources/kit/` + `stylecheck.mjs` created; Video 2 audited against this file and brought to CLEAN. |
| 2026-09-28 | 2.4, 5.2, 5.3 | Red on hardware is decorative; type is flat; raw sizes only as `data-print` object print. |
| 2026-09-28 | 6.1, 6.2 | MARGIN sweep check; `grow` only for Solids that grow. |
| 2026-09-28 | 8.6, 8.9, 13.2 | Caption scale holds to the chip swap; travels with depth ease "zoom"; kept FG far; chips yield at HERO[0].at − 3. |
| 2026-09-28 | 9.6, 10.2 | Completion marks and travelling glows blend; chart grammar is vocabulary, not a repeated visual. |
| 2026-09-28 | 11.3 | The bed is the Succession track; Yeat retired [T: "use a song other than the yeat one"]. |
| 2026-09-29 | 8.2, 7.8 | SETTLE on every move (push 56, slide 48, question 64); FG pieces glide in on pushes [T]. |
| 2026-09-29 | 1.5, 8.2, 9.6 | Hook hold 12 f; slides scale with distance; nothing vanishes on screen (sweep VANISH/POP) [T]. |
| 2026-09-29 | 8.2, 8.10, 15 | SMOOTH [CHECK] on the camera path; THRU 56 f; the question lifts over 72 f; pushed-in places fade up [t0 − 4, t0 + 14]. |
| 2026-09-29 | 6.3, 9.4, 10.2 | Losses as see-through extensions; colour waves; nothing basic → the two-monitor frame [T]. |
| 2026-09-30 | 7.1, 7.6, 8.7a, 10.1, 10.2 | Corner pieces only on object scenes (gas, wallet), as bold demo-style solids; the hook is one demo-grade construction (no gauge or receipt); animations built from real assets (columns); no two pushes in a row; rack focus with the push [T]. |
| 2026-09-28 | 13.1, 13.2 | Chips break at clause commas; silence snap; chips yield ≥ 8 f after the last chip's last word. |
| 2026-09-30 | 6.8, 10.1 | Real, detailed objects at 100bps' pump/phone level in every stretch of the film (no three chart-only scenes in a row; ≥ 2 object scenes per half); the hook is a chart in 100bps' hook grammar, the jaws (a forwarded four-plane prompt was built, then scrapped at Timur's word) [T]. |
| 2026-09-30 | 10.1 | The hook chart carries nothing but its two series, start, heads, names and verdicts — no reference lines, levels, stretches or bands [T: "too many random elements in the hook scene, like lines and stuff"]. |
| 2026-09-30 | 11.3 | The bed is Daphni — "Poly" [T: "use a different song"; WW3 was tried, then "different song", and he chose Poly]. |
| 2026-09-30 | 10.1 | Marks on the hook's series draw along them, never fade in whole [T]. |
| 2026-09-30 | 6.9a | No pattern fills or fine repeating stripes on moving objects: lamps and dot-matrix text are explicit circles [T]. |
| 2026-09-30 | 8.4a | On a push the corner piece glides in only once the outgoing scene has cleared (fgDelay, the nozzle at t0 + 20); lines leaving an object run off-frame throughout its arrival [T]. |
| 2026-09-30 | 11.2 | The data texture rationed to ~3 computing moments per film [T]. |
| 2026-09-30 | 11.2 | Process sounds span their animation's own window, chained when longer than the file; the build refuses a short one [T]. |
| 2026-09-30 | 9.6 | Staggered entrances never pass through each other (the farthest-bound goes first); the sweep cannot see it within one construction, so the strips must [T]. |
| 2026-09-30 | 10.1 | A plain chart is not a hook: the hook is ONE creative construction of the real objects its first line names, with a mechanism that enacts the line (Video 3: a balance scale, military hardware against a "%" weight). Supersedes "the hook is a chart" [T: "too plain and simple"; "no, don't do a bar chart, replace the hook with something more creative entirely"]. |
| 2026-09-30 | 4.2, 9.6, 15.2 | After a push out of a dark place the white stage floods from t0 + 16, once the outgoing place is through the lens (no dark veil dropping out in one frame); the flash check refuses any one-frame brightness jump over 25 levels [T: "at 11 seconds, the screen randomly changes and becomes brighter"]. |
| 2026-10-01 | 11.0–11.2 | Only SFX families the studio has already used (Bankers V1–V2, Style 3). A move's whoosh peaks on its fastest frame (SETTLE ~29% in), not its midpoint: every whoosh had been 8–12 f late (`whooshsync.py`). Every context sound is timed by its animation's own exported window: hits at 0.4 of the arrival, rattles over the measured motion and fading with it, one sound per counted item, travel whooshes sized to the travel. `sfxsheet.mjs` checks the score [T: "ensure that the sfx are timed right, especially in the hook scene and add some more throughout the video. Only SFX that have either been used in 100bps style 3 or in the previous bankers videos"]. |
| 2026-10-01 | 5.4a, 11.4, 15.2a | Text paints above the World (its own stacking context; stylecheck refuses a bare `<World>`) [T: "the text at the end should be on top of the blurred visual, not under it"]. The score plays in the Studio on the provisional take (`SFX_PREVIEW = SYNTHETIC`), and every visible action gets its sound [T: "Ensure that there are lots of SFX and they are timed right"]. The violation sweep (clearance, `violations.mjs`) joins the intersection sweep [T: "do a full intersection and violation sweep"]. |
| 2026-10-05 | 10.1 | The hook carries the fewest elements that tell its first line (its objects, a figure each, a short label each; ~6 on its last frame), nothing decorative [T: "remake the hook, right now there are too [many] elements on the screen in it"]. |
| 2026-10-05 | 9.7, 10.5 | A piece removed from a construction slides out along its own line, in its own depth, and dissolves once clear [T: "the slices in the pie should be removed as if they were actually in the pie"]. A new scene is compared with the PREVIOUS video's scenes too: Video 5's record board repeated Video 4's results rows [T: "The second scene sort of just copies the visual from the previous video, so choose a different visual"]. |
| 2026-10-05 | 10.2, 15.1 | One of each chart KIND per film: every place declares its KIND (bars, line, candles, pie, dial, steps, grid, fill, counter, object) and every kind but `object` appears once; stylecheck KINDS enforces it from Video 6 [T: "the third scene is a bar chart after the bar chart in the second scene. Prevent these sorts of things by avoiding visual repetition in the same video. Replace it with different visuals"]. |
| 2026-10-05 | 10.1 | A hook with two subjects shows them one at a time: the first framing holds only the first subject; on the word naming the second, the camera pans (a slide) to a framing with only the second subject and its objects [T: "first show the rest, and when the cruise is mentioned, the camera should sort of pan in some direction and only the cruise ship along with related visuals should be visible"]. |
| 2026-10-05 | 8.4 | The push-past rack's blur eases in from zero with the push (INOUT over its first 12 f; the incoming fades up over [t0 + 2, t0 + 14]), never switched over 4 f [T: "the blur effect doesn't have any intro transition, I need you to fix that. It needs to happen smoothly"]. |
| 2026-10-05 | 10.1, 8.7 | A line in the hook draws from its first point on frame 0, and the framing follows its head close in on a smoothed path, then eases back as the figure lands — inside the construction, the one sanctioned camera-follows-data device [T: "start the line at the very beginning earlier, and add that smooth camera follow effect to it"]. |
| 2026-10-05 | 10.1 | The hook's line follow is one transform wrapping the Turn, aimed at a steady eased path (never the data), as 100bps does it; checked by followjit.py [T: "the camera following the line at the beginning is too jittery, look at how its done in the 100bps videos"]. |
| 2026-10-05 | 10.1 | No props falling through the hook's opening framing: Video 6's survey cards removed [T: "remove the survey visuals that keep falling in the very beginning of the video"]. |
| 2026-10-05 | 11.3 | The bed is the Yeat track again (Video 6) [T: "use yeat for the song"]. |
| 2026-10-05 | 9.8, 8.5, 8.10 | No two scenes ever overlap, at any opacity or blur, flyers included: slides keep places apart in space, pushes in time (the outgoing dissolves through the lens before the incoming shows); the question no longer holds over the racked honest part. The sweep judges every cross-place pair [T: "No visuals from different scenes should overlap, even if its one fading out and the other fading in"]. |
| 2026-10-05 | 6.8a | Every object is checked at full size, part by part (closeups.mjs), before handback: corners, joins, contact, depth direction [T: "fix up the dominoes, especially the edges"; "also fix up the suitcase, and any other complex visuals, as most of them are messed up when you look closely"]. |
| 2026-10-05 | 8.10, 11.1 | §9.8 enforced on Video 6: a push dissolves every layer of the outgoing place over [t0 + 4, t0 + 16] and fades the incoming up over [t0 + 16, t0 + 28] (gap < 8 f); the closing question arrives by a SLIDE onto the open field (no hero rack); a push's whoosh peaks mid-dissolve (t0 + 10). The sweep refuses any cross-place pixel (SCENES) and any push or question hand-over that shares a frame or leaves a gap of 8 f or more. |
| 2026-10-06 | 6.3, 6.8a | A drawn line's extrusion is thin (≈ 10 px: 8 × +1.0 / −0.7), judged at its closest zoom [T: "the blue shadow for the white line in the very beginning is too thick, make it thinner"]. A repeated part behaves as its siblings do: drawn by one helper, with the same size, spacing and animation; objects are checked after their animation as well as at rest [T: "what are those two unlit windows on the cruise? fix that"]. |
| 2026-10-07 | 11.3 | The bed is Future, "LIKE ME" (Instrumental), from Style 3 Video 34's public/; its beat hits at 12.85 s with no gap, so DROP_SRC 12.80; measure drops with an accurate (output-side) seek [T: "use the song I put in the new 100bps video's public folder"]. |
| 2026-10-07 | 9.9, 10.1 | Pieces carried between framings move as one smooth gesture: locked to the camera's own slide, re-tiled with their topology kept, flocks on Bézier curves (no V-turns), lift → travel → land → merge [T: "the animation for the boxes at 37 seconds should be smoother"; "the direction shouldn't change so abruptly for the little boxes"]. A construction behind the hook's line and type stays clearly dimmer than them [T: "the background should be a little darker/less visible in the hook scene"]. |
| 2026-10-07 | 15.3 | Every place is put beside the last four films (`Resources/lookcheck.py`, its sheet read by eye): one big, centred construction of extruded lit solids on a floor; never navy on navy, never a flat 2-D chart, a dot grid or bare strokes as a scene, never a chart that collapses at an honest scale [T: "the video doesn't really look like the past videos that we've made for bankers, something is off … Compare this one to the previous ones, and fix it"]. |
| 2026-10-08 | 6.8a | Detail is built from few, large, deep parts: nothing under ~20 px at the framing, each part with clean polygon faces on the one vector, round columns as true cylinders, depth and set-back planes carrying the realism [T: "the stock exchange building looks weird, simplify it, but make it look more 3d"]. |
| 2026-10-09 | 2.5.1c, 6.8 | Every place is built from the series' own parts (Solid + FIN, white inset, cap and side, glows, pools, Anton figures on their solids) at Videos 1–6's detail, staged creatively; flat SVG illustrations (map sheets, flat discs, line-drawn machines) are not the Bankers look [T: "RECREATE ALL THE VISUALS, BE MORE CREATIVE AND STOP DEVIATING FROM THE ORIGINAL SMOOTH BANKERS STYLE. THE VISUALS NEED TO BE DETAILED AND GOOD LOOKING"]. |
| 2026-10-09 | 5.2, 6.8 | Premium, not childish: labels small (30–32), tracked and muted; figures plain white Anton (no chunky extrusion); objects in graphite-blue and chrome with fine detail, not pale toy-like fills; the smoothness bar is Style 3 Videos 28 and 30 [T: "look at the smoothness of visuals in the Americans now feel worse video"; "the style (fonts and some of the visuals), look a little too childish… sharpen them up a tiny bit, make the vibe more premium and smooth"]. |
| 2026-10-09 | 0, 6.8, 10.1, 10.2 | **THE VISUAL VOCABULARY** (`Resources/visual-vocabulary.md`) decides what may be built in every Bankers video: live line and area charts, real candlesticks, 2–3 bars or a progress bar, big-number moments, simple primitives (slab, cube, cylinder, card, ring gauge, date block, a row of squares), text-only beats and pill buttons; never maps, machinery, weather, liquids, cutaways, people, fine mechanical props, particle showers or ghost paths; ≤ 3 objects per scene. It supersedes §6.8 and §10.2's "nothing basic" and "real assets" rules. KINDS gains `text` (repeatable) [T: "the current build reads as AI-generated because the scenes are illustrative and over-detailed"]. |
| 2026-10-09 | 5.5 | Tracking text takes an `ink` (`dark` on the white stage: navy lines, the accent gradient in the deep blues), so a text-only beat or the closing question can sit on a light full frame (Video 8 revision: "light full frame, two pill buttons"). |
| 2026-10-09 | 10.2 | **Simple is not bare** (visual-vocabulary.md): every scene carries its sentence's specific, sourced content (figures, dates, shares) with finished chart/instrument detail (scales, ticks, counting readouts, labelled segments); a generic primitive that could sit in any video is a defect [T: "the visuals are too simplistic. They need to have more detail and actually be relevant to the context of the scene. For example the 1973 scene is just a block"]. |
| 2026-10-09 | 10.2 | **No text-only scenes**: every sentence gets a visual built from its own data; tracking text stays for the closing question only. KINDS `text` is withdrawn from use [T: "too many on screen text scenes, replace them with good visuals"]. |
| 2026-10-09 | 5.5, 9.8, 2.5.1 | **The close never deviates**: the closing question stays tracking text on the dark field (no pill buttons, no answer options, no light frame), and nothing behind a construction is blurred, whatever a brief asks [T: "why would you add the buttons at the very end? with the different options? Don't deviate from the style."]. The `ink` option of track.tsx stays in the kit, unused by the close. |
| 2026-10-10 | 2.2, 2.5.1, 6 | Video 8 hook: an area chart may be filled with a see-through national flag drawn to its construction (official colours, `style-exempt` on the one line that holds them; ~0.25 opacity, fading to the floor; clipped to the area so the line unrolls it) [T: "replace that with an american flag … keep the opacity low and keep it see through"]. A backdrop object ENTERS by moving (rises into place from below, eased, no overshoot), never stands on screen from frame 0 [T: "smooth into the scene from below, not just be on screen from the start"]. The hook has no record line: the dashed level carries "since 1982" [T: "remove the lowest since 1982 text"]. |
| 2026-10-10 | 8.7, 9.8, 2.2 | **The LENS BLOOM** (Video 8 `src/oil/flare.tsx`): a push into a lit point may hand over through the Style 3 films' lens-flare transition, rebuilt for Bankers. A point on a real thing well off centre, a cool haze, lens ghosts reflected through the frame centre, a bell of light whose reach grows with √L, 41 / 4 / 32 frames, peaking ON the hand-over in a pause, receding onto a real thing in the incoming place, into a white stage. Bankers' version: ghosts in the logo blue's family and white (no amber or green), no CSS filter on any ghost, the peak falling off to the white stage's #EBF2FB, caption ink and watermark on 1 − (1 − stage)(1 − flare). Its source is projected through the place's own layer every frame, so the light rides the dive [T: "the bloom transition at 9 seconds needs to have that lens bloom effect"]. The hook's follow may be CLOSE (1.55× on the drawing head, a fixed height that keeps the chart's peak clear of the caption), and its backdrop object enters on the sentence that names it (the drum rises as "Here's what that tank…" begins) [T: "make the camera zoom in closer to the line as it follows it"; "the barrel should appear when the Heres how that sentence starts"]. |
| 2026-10-11 | 5.2, 6 | Video 8 hook: a chart's current value is a small secondary value (figure 56 over its unit, label 30) beside the line's end dot, in the chart's own plane; the display slot carries the comparison's YEAR, read off the same point of the series the dashed level lands on, and asserted against what the voice says [T: "instead of the 283M text add the 1983, and move the 283 down next to the end of the chart, and make it smaller" — drawn as 1982, the year the voice says]. |
| 2026-10-12 | 9.6 | Nothing ever vanishes on screen, whatever it is, including probe-skipped objects: `popscan.py` proves it in pixels (tile one-frame changes, canaried). A chart on a device is attached to it: same layer, same depth, moves with it [T: "the line chart in the beginning should be attached to the phone, and move with the phone, and the phone just disappears on scene. I need you to never allow abrupt disappearing of visuals"]. |
| 2026-10-12 | 6.8a | A device looks like the real device, in 3-D: black glass front, a polished metal band with real side thickness shaded as a rounded edge, keys proud of the side, the island and its lens, a glass sheen, a contact shadow — one helper draws every phone [T: "make the phone more 3d and realistic"]. |
| 2026-10-12 | 9.6 | Everything shown over a device is anchored to it, the headline figure included (no own depth plane) [T: "the 8 billion text should also be anchored to the phone"]. |
| 2026-10-12 | 10.2 | Be more creative: most scenes carry ONE real object their sentence names, acting in the construction (a satellite at the arc's sky end, a building around the phone, a mast sending airwaves, a gavel, a pen, chips for a bet), built the house way. This overrides the vocabulary's NEVER list for that object (`Resources/visual-vocabulary.md`) [T: "Be a little more creative with the visuals, for example in the partly from space scene add a satellite on one end of the line. Do such a thing for most scenes."]. |
| 2026-10-12 | 8.2, 6.8a | A scene may OPEN on its first object alone and REVEAL its second by a slow camera pull-back that rises (a travel within the place, ~2 s, in-out): Video 9's Starlink scene opens on the phone, then zooms out and moves up until the satellite is in view. The revealed object is big and detailed, not an icon. A revealed object never crosses the caption band on its way in: the satellite enters the frame from its edge, below the band, while the camera rises [T: "the scene should start with just the phone and then sort of zoom out and move up slowly to get the satellite visible. Also, the satellite should be bigger and detailed."]. |
| 2026-10-12 | 6.8a, 10.2 | No blank screens or faces: a phone (or any device or slab) in a scene SHOWS something its sentence is about — a satellite link connecting and a message arriving, a call working indoors, the band the phones support, each network's mast — never an empty dark screen. Screen content is object print (`data-print`), the phone's own UI, cross-faded between states, never swapped in one frame [T: "the visuals are still a little bit plain, like for example the phone screen doesn't have anything on it in the satellite scene. Find something relevant and add it. Apply this to other similar scenes"]. |
| 2026-10-12 | 10.2 | Be MORE visual: where a construction stands in for real things, build the things themselves — Video 9's "three companies run America's nationwide phone networks" is three cell TOWERS, each with its company's logo above it, not three bars [T: "try to be more visual, like with the 3 companies bar scene, instead of bars just add those signal towers themselves with the company's logo on or above them"]. Logos follow the house: inline SVG paths, in the stage's ink (navy on white), never their brand colours. |
| 2026-10-12 | 10.2 | No plain box as a scene's visual: a blue extruded panel carrying a figure (Video 9's ~$57B / 0 CUSTOMERS SWITCHED card) "looks awful" — build a creative object that ENACTS the sentence instead ("investors repriced it" → a price tag marked down; "before a single customer switched" → a counter still at zero) [T: "54:28 - 58:17 the scene needs changing, blue box looks awful needs some sort of new creative visual"]. |
| 2026-10-12 | 5.2, 6.8a | A quote is shown with its SPEAKER's real photo (supplied by Timur, cut out and graded to the stage; never downloaded) and set in a quote face, not Anton: Instrument Serif italic, large, with the speaker's name and role in Anton beside the portrait [T: "replace verizon ceo with a real picture and change up the scene to make the quote box look better with a new font"]. The photo must be of the person who said the words: the name is printed beside it, and a mismatch is a misattribution. |
| 2026-10-13 | 0, 2, 10 | **THE DEMO ANCHOR — a reset.** `Bankers/Demo/` (the 15-s style demo) is the primary visual reference for every video, ahead of all later ones (`Resources/visual-vocabulary.md` → DEMO ANCHOR): the navy field and one overhead spotlight, glossy satin symbolic solids, one centred hero plus one large FG piece bleeding off an edge, small sentence-case captions, Anton figures with a tiny caps label, objects that build in place, defocus and push transitions, one light frame, the mixed-type question with a glowing serif accent. New compositions in its family, never its shots. Flat UI props retired (document and quote cards, phone mockups, stamps, split-flap rows, poll pills) [T: Video 10 brief, "the original Bankers style demo … had the best visuals and animation of anything we've made. Recent videos drifted away from it"]. |
| 2026-10-13 | 4.1 | **One light frame per video, from Video 10** (the demo anchor): exactly one white run of one or two places; the 1-in-3 cadence and the 30-s dark limit stay with Videos 1–9. stylecheck WHITE reads the video's number and judges by the right rule [T: Video 10 brief, "ONE light frame"]. |
| 2026-10-13 | 6.3, 10.2 | **The house SITS on its floor**: a platform under an oblique object is a circle on the SAME ground — a sheared ellipse in the object's own projection (`house.tsx` floorOf), centred under the whole footprint, with a contact shadow — never a flat ellipse under the front face, which left the back of every house hanging past the rim. A deep oblique turn (k 0.6) only stretches the side wall into a barn; three-quarter means k ≈ 0.45 [T: "make sure the house properly sits on the circular surface in the hook scene"; "same with the visual at 21 seconds, and fix the house up there too"]. |
| 2026-10-13 | 6.8a, 10.2 | **The 3-D objects carry 100bps-level detail** — the demo anchor's glossy symbolic solids are built with every part a real one has (a house's foundation, siding, trim, shingle courses, gutter, framed and shuttered windows, a panelled door and its step; a coin's raised rim, reeding and beading; an arrow's bevelled faces; a card's chip contacts and embossing), within §6.9a (no repeat finer than 20 px). Charts and graphs stay clean [T: "in general, the visuals should be more detailed, like in 100bps videos" — "I mean the 3d visuals, not the charts or graphs"]. |
| 2026-10-13 | 10.2 | **A plain arrow is never a scene's hero.** Both of Video 10's arrow scenes were sent back (45 s: "find a better visual for the scene at 45 seconds"; 55 s: "replace the arrow at 55 seconds with a better visual too"). A sentence about a movement (rates following, rates falling) is shown by a glossy object that ENACTS it — a coupled pair towed up a rail, a ball rolling down and up a half-pipe — not by an arrow pointing the way. Arrows stay as accents only (the hook's near arrow, a small climbing marker) [T: as quoted]. |
| 2026-10-13 | 11.3 | The bed is Radiohead, "Everything In Its Right Place" (Instrumental), `music_radiohead.mp3` (Video 10; flat, plays from its top) [T: "nevermind, stop it and change the song to everything in its right place"]. |
| 2026-10-14 | 6.8a, 10.2 | **No scene is "one plain object and a number": scenes are richer, relevant compositions** — a hero object with its real parts, the secondary pieces that make the sentence’s point, a floor with shadows and reflection, an action that tells the sentence (visual-vocabulary.md, DEMO ANCHOR). Charts stay clean [T, Video 11: "some of the scenes are too visually simple, like the coin scene. I need more complex but good and relevant visuals"]. |
| 2026-10-14 | 10.1 | **A logo in a hook must be SEEN, and it belongs to the construction** — not a dim shape half-hidden behind it. Video 11’s JPMorgan Chase wordmark is engraved across the wall’s blocks and catches the light as the rows light [T: "fix the fact that the jpmorgan text in the first scene isn’t visible, and be creative about the way it blends with the visual"]. |
| 2026-10-14 | 11.0 | **Score the way 100bps scores, wherever it applies**: 100bps’ family-per-job doctrine (Style 3 §9) — chain under climbing bars and repeating drops, data for computing, sub under big arrivals, swoosh for entrances, pings rationed to numbers, tick literal, click a rare latch [T, Video 11: "remember to use 100bps sfx in the video where they apply"]. |
| 2026-10-15 | 10.1 | **A hook MOVES: its subject assembles itself** — the hook’s construction is built by motion on screen, not merely lit; Video 11’s wall of 50 blocks (the stock) slides into place row by row from the left and right edges, the lintel last [T, Video 11: "need more movement in the hook scene, make an animation of its stock literally moving into place from the left and right sides"]. |
| 2026-10-15 | 8 | **The hook OPENS on a quick, aggressive push-in from much further out** — frame 0 starts zoomed well out and the camera drives in fast, decelerating onto the hook’s framing (Video 11: from 2× the distance in ~1 s) [T, Video 11: "a more aggressive quick camera in transition for the hook scene, just start zoomed further out"]. |
| 2026-10-15 | 10.1 | **The hook's blocks are bought back ONE AT A TIME, in a random order** — each block flies into its own slot on its own moment, from its own side (left or right, by a fixed pseudo-random draw, so every render is the same), never a whole row together; the wall fills like trades arriving, patchy, not row by row [T, Video 11: "the buying back should happen individually to the blocks, and it should be more randomized"]. |
| 2026-10-15 | 6.8a | **A hero object is built in REAL DEPTH, the Style 3 Video 36 vault's way**: a stack of planes parallel to its face, every plane projected through ONE perspective rig per object (perspective, pitch and yaw about its own centre), painted back to front in DOM order (never preserve-3d), so its thickness reads at rest — rims, collars, bolt heads, hubs, spokes and knobs each with their own depth. Video 11's vault door is rebuilt this way (`src/jpm/rig.tsx`, ported from Style 3 Video 38's `rig.tsx`) in the Bankers blues [T, Video 11: "make the vault more 3d like, like in the recent 100bps video"]. |
| 2026-10-15 | 6.8a | **A pie's slices are SOLIDS, not flat wedges**: each slice is a thick wedge with its own rim (the curved outer wall), its two cut faces where it parts from its neighbours, and its top face, built in the plane rig like the vault, so a slice that parts or leaves shows its thickness and its cut faces as it moves [T, Video 11: "make sure the pie slices at 29 seconds are 3d"]. |
| 2026-10-15 | 10.1 | **A figure printed on a moving object appears EARLY in its move**, not as it arrives: Video 11's used block prints $1.06B from the first quarter of its slide out of the wall, so the figure reads for the whole move [T, Video 11: "the text on the one block that comes out should appear sooner"]. |
| 2026-10-15 | 8.7 | **★★ NO SCENE HOLDS STILL: the camera FOCUSES on each scene's main object while it holds** — after a place has arrived, the camera keeps moving, zooming in (and drawing toward) the object the sentence is about, or another thing in the scene that matters (the vault's hub, the bar the voice names, the lit slice, the magnifier), until the next move takes over. It supersedes §8.7's "more movement comes from the constructions, never from the camera" and "no camera beats" for Video 11 on; the idle float, a data-slaved camera and landing jolts stay banned [T, Video 11: "the scenes stay still for too long, there needs to be camera movement zooming in on the main objects in such scenes or on something else"]. |
| 2026-10-15 | 8.7, 10 | **★★★ THE CAMERA FOLLOWS THE ACTION — a place is never a still page with things moving on it.** Within every place the camera moves on the action's own frames, the way the Style 3 films' Cam keys do (30–50 f in-out, aimed where the voice points): it follows a line's head as the line draws, rises with bars as they climb, tracks a rolling coin, rides a gliding block, drops with a block falling to its tray, leans into a slice as it leaves, and closes in on a figure as it lands — then hands over to the next move. A wide, still framing while the visuals move is a defect [T, Video 11: "the camera needs to be moving more often, because right now the scenes look like different pages where the camera sort of just sits still while the visuals move. That should be prevented. An example is with line graphs when the camera actually follows the line rather than just staying zoomed out and just the line moving"]. |
| 2026-10-15 | 8.7, 10.1 | **Zoom-ins go CLOSE**: a push-in on a hook or on a scene's main object takes a genuinely closer angle — the hook's wall grows ~1.6× by the dive (the camera ~0.35 nearer), and an object key comes 0.10–0.15 nearer — never a polite 3–6% creep [T, Video 11: "some zoom ins like the one in the hook scene should be stronger, meaning a closer angle"]. |
| 2026-10-15 | 8.2, 8.7 | **★★ "100bps camera movement" means its INTENSITY, never its speed or rhythm** — this corrects the row above that took the Style 3 films' 32/36 f hand-overs: the hand-overs stay the smooth Bankers ones (push 56 f, slide 48 f, travels 40–56 f, all on SETTLE). What is taken is the AMOUNT of movement: close zooms (keys up to 0.18 nearer), each slide's 8% pull-back at its middle, `Turn` arcs of −6° → +4.5° with a ~1° sine. And the camera's moves inside a place are FEW and LONG — one or two smooth follows per place (≥ 30 f each, on SETTLE or a glide), never a chain of short keys, which read as jitter [T, Video 11: "right now the camera seems a little too jittery overall. I told you to apply that 100bps camera movement, but I mainly meant the intensity, not the speed or consistency of the movements"]. |
| 2026-10-15 | 8.7, 10 | **The camera FOLLOWS a thing into its scene**: when an object travels in (Video 11's coin rolling in), the hand-over carries the camera WITH it — the object keeps its place on screen while its scene arrives around it — rather than the object crossing a held frame. More such follows wherever something moves: bars climbing, blocks gliding, a block falling to its tray [T, Video 11: "in the coin scene, the camera should follow the coin into the scene, we need more of those following animations"]. |
| 2026-10-15 | 2.1, 6 | **Solids are SMOOTH BLUE METAL, not bright satin plastic**: the Style 3 films' chrome texture in the logo blue's family — deep steel-blue bodies, a crisp near-white specular edge, a dark reflected band across each face (the chrome ramp: light → mid → deep → light), low-key overall so the frame reads dark and polished; the pale, evenly bright faces read as cartoony. Blue stays the only colour [T, Video 11: "overall, right now the colors of visuals are a little too bright and cartoony, make them look more like the smooth metallic 100bps texture but keep the blue color"]. |
| 2026-10-15 | 2.1, 6, 10.1 | **The metal stays DARK BLUE, not grey** — the steel finish keeps the series' blue: deep, saturated navy-to-logo-blue bodies (close to the earlier Bankers colour, a little darker), chrome highlights near white; a grey steel reads as another channel. **And type always separates from the construction behind it**: where a figure or caption sits over a lit solid (Video 11's $50 BILLION over the wall), the solid steps down in light as the figure lands and the type carries a deep navy shadow, so white type never sits on a pale face [T, Video 11: "the color of the text isn't really distinguishable from the color of the visuals in the hook scene, fix that. Also, make the color a little bit more similar to the previous bankers color, you made it a bit too gray. Make it a little more dark blue"]. |
| 2026-10-15 | 6.8a | **A plane-built part that MOVES turns only a little** — a door, a lid or a flap in the plane rig opens ~20°, never toward edge-on: seen near edge-on, its stack of planes reads as slices (Video 11's vault door "glitched" at 72°). A full opening needs a real 3-D model, not planes [T, Video 11: "Theres also a wierd glitching on the vualt door, so only make it open a little"]. |
| 2026-10-15 | 6, 2.1 | **Paper money keeps its pale paper finish**: the metal rule is for solids; Video 11's banded cash bundles on the pie stay exactly as first built — pale satin paper blocks, two high, with their band — standing on the 3-D slices (block.tsx `finish="paper"`) [T, Video 11: "no keep the stacks that were on the pie chart the same, they were good"]. |
| 2026-10-15 | 11.3 | **One gain through a drop whose build RISES into it**: the bed's gain does not step at the drop (bedsrc.mjs `DROP_HOLD`); the build plays at the body's own gain and only the song's own drop is heard. The two-regime mix (intro held 8 dB under, a 0.1-s step at the drop) stays for flat, quiet intros (Yeat, LIKE ME); on Video 11's 711.mp3 it made the bed step DOWN by itself as the beat hit [T, Video 11: "the audio level of the song changes at the beat drop for some reason, fix that"]. |
| 2026-10-15 | 11.3 | **The bed is never buried**: from Video 11 the body sits 3.0 dB under the speech-gated voice (it was 3.5) and a hook's build 6 dB under (it was 8). Held at the body's gain through a rising build, Video 11's hook bed fell ~13 dB under the voice and could barely be heard; with DROP_HOLD the gain now EASES from the build's level to the body's over the 2.5 s before the drop (no step at the beat) [T, Video 11: "just make sure the audio level for the song is right, I can barely hear it for some reason"]. |
| 2026-10-15 | 11.3 | **★★★ ONE VOLUME FOR THE SONG, START TO END — supersedes every bed-envelope rule above** (the per-window envelope, the intro regime, the step and the eased ramp at a drop, the build at 6 dB): the bed is cut, faded in and out, and played at ONE gain for the whole film (bedsrc.mjs `ONE_GAIN`), set so the body after the drop sits 3 dB under the speech-gated voice; everything else is the song's own dynamics. Verify in the baked file: its gain against the source is the same in every half-second window [T, Video 11: "I told you do not change it throughout the video, choose one volume for the song and don't change the volume. Right now it goes quiet after the beat drop"]. |
| 2026-10-15 | 11.3 | **★★★ The song is the FILE TIMUR GAVE, played as is, with ONE volume on its `<Audio>`** — no processed or baked copy (no envelope, no fades, no dB work on the file); the only settings are where it starts and one overall volume chosen to suit the video (Video 11: public/711.mp3 from 108.8 s at volume 0.146). Supersedes the baked-bed pipeline (mkbed/bedenv) for Bankers from Video 11 [T, Video 11: "remove the song that you added, and re add the file of the song that I gave you. You messed something up with the audio level. Don't adjust the db level or anything, just change the overall volume of the song to suit the video"]. |
| 2026-10-15 | 11.3 | **The song fades out SLOWLY as the closing Bankers logo appears** — its one volume holds to the logo's entrance, then eases (in-out) to silence by the film's last frame; that is the only change to the song's volume (Video.tsx `musicVol`) [T, Video 11: "make the music fade out slowly when the bankers logo appears, remember that"]. |
| 2026-10-15 | 11.3 | **The tray labels keep their ORIGINAL style** (the top label crossfades from white to navy as its tray lights; the lower label is 0.8 blue). The white-with-navy-outline restyle made while chasing the render glitch is reverted. The glitch was a kit bug, not the style: `Turn` is now flat [T, Video 11: "fix it and revert the changes you made to the style of the text at that part of the video"]. |
| 2026-10-16 | 0, 6.7 | **ENGINE: `Turn` is FLAT and its contents are a new DOM every frame (`key={f}`), and its yaw never sits at 0.00°** — promoted from Video 11 into `Resources/kit/kit.tsx`. A render tab that had drawn a place's earlier frames mis-drew SVG text inside a preserve-3d `Turn` once the layer's depth-of-field blur came on (Video 11's tray labels at 41.8 s, the coin stacks' "$" at 22.6 s); fresh stills and the Studio were right. Nothing inside a `Turn` may keep state across frames (no useState, effects or `<Img>`) [T, Video 11: "the glitch only happens in the rendered version"; "the dollar signs glitch at 21 seconds"]. |
| 2026-10-16 | 6.1a, 10.2 | **★★ 2-D BY DEFAULT; REAL 3-D ONLY WHERE THE SCENE IS BETTER IN 3-D** — scenes are built in the house 2-D construction of Videos 1–11 (flat front faces, the up-right extrusion as painted facets, a `Turn`, a `Pool3D`); a projected 3-D rig (`p3.tsx`, `rig.tsx`) only for a scene whose idea needs depth (motion through space, a thing seen turning, a door opening, slices leaving in depth). Nothing else about the style changes. Video 12's pay and prices columns, gasoline pump, weekly pay and gas can went back to 2-D [T, Video 12: "the 3d style is definitely nice, especially near the beginning of the video, but you shouldn't overuse it … something that would be better visualized using a 3d visual should be 3d, but otherwise scenes should stay 2d"]. |
| 2026-10-18 | 6.8a, 3 | **★★ A 3-D OBJECT IS LIT LIKE A RENDERED ONE: every face takes its light from its own ORIENTATION to the one key (upper left) — tops brightest, the side away from the key dark, undersides darkest — and every object casts a soft contact shadow on the floor it stands on.** Faces painted with one shared gradient whatever way they face read as "unrendered 3-D objects"; that is a defect, not a render artefact [T, Video 12: "for most 3D objects in this video, for some reason, the shadows aren't right and it makes them sort of look like unrendered 3D objects. So please fix that"; "The lighting and shadows aren't right"]. |
| 2026-10-18 | 6.8a | **A real-3-D object is CLOSED: no part of it may show as a flat cut-out plane.** Video 12's escalator showed the shaped plane under its steps; a solid with depth is a closed body, and the side facing the camera is covered (a side panel with its own design: skirt, trim, panel joints) [T, Video 12: "part of the section below the steps is visible, and you can sort of see that it's not 3D objects… Make the escalator fully 3D and consider like the sides of it. Maybe cover the side up completely, the side facing the camera with some sort of design"]. |
| 2026-10-18 | 5.7, 10.1 | **Nothing printed where the object would not carry print**: Video 12's escalator handrail loses its repeated +3.7% PRICES (the rail is plain), and stray construction lines (a vertical white line, a see-through diagonal) are removed. A label on an object matches the house type and finishes (Anton figure + one small tracked caps label, the series' blues), never a generic sticker [T, Video 12: "on the handle for the escalator, the 3.7% prices text… should not show up at all. There should be nothing on the handle"; "a vertical white line… a see-through line. I want you to remove those two things"; the box's label "doesn't really match the style. I want you to improve that"]. |
| 2026-10-18 | 5.2 | **Print fits its object with a margin**: a title too long for its cover (Video 12's REAL EARNINGS) is set smaller and centred, never run to the edges [T, Video 12: "the real earnings on the second book, it's sort of too long. So either make it smaller and center it"]. |
| 2026-10-18 | 6.8a | **Objects are realistic and detailed, never blocky** — the gas pump and the model plane are rebuilt with their real parts at the level of past Bankers objects; a model that reads "blocky" or "AI generated" is a defect [T, Video 12: "The gas 3D object doesn't really look good. It looks blocky… improve it, make it more realistic. You can look at past bankers videos to understand how realistic objects should look and how detailed they should be"; "improve the model of the plane… Don't make it so blocky and seem so AI generated"]. |
| 2026-10-18 | 5.7, 9.6 | **A figure on an object is PRINTED ON it — never a card floating over it with a shadow behind it.** Video 12's upright label card above the bundle was sent back ("floating in the air and there's a shadow behind it. That doesn't make sense whatsoever… be more creative… matches the style"); a figure lives on a real surface of the thing it describes (a currency strap carries its amount). **It never just appears**: print inks in, a figure counts up into place (STYLE §9.6, the no-pop rule — "it just appears on scene. We have a rule for things not just appearing on scene so abruptly"). **And a value that changes COUNTS, never spins**: the card's flip "is sort of glitched… doesn't look good at all" [T, Video 12]. |
| 2026-10-18 | 11.0 | **A machine's sound is that machine's sound**: the escalator gets an ESCALATOR sound — a quiet motor whir/hum, present but low — never a stand-in family (the bicycle `chain` was "not what I meant"). A sound the pack lacks is synthesized for the job (royalty-free by construction, root CLAUDE.md) [T, Video 12: "I need some sort of escalator sound, straight up an escalator sound, some sort of machine whirring… it can't be that loud either. It needs to be sort of quiet, but it needs to be existent"]. |
| 2026-10-18 | 5.2 | **Print sits INSIDE the panel it is printed on, with a margin** — Video 12's IN ONE MONTH ran past its door panel [T: "it doesn't really fit into the box… in 25 seconds"]. |
| 2026-10-18 | 6.8a, 10.2 | **Parts that wrap a solid never show their inner faces** — Video 12's strap round the balance's bundle showed its side through the bundle's white top ("the side of the blue part is visible, even though the white part should be covering it"); and the pay side of the balance becomes an object relevant to its sentence ("instead of a block, think of something more relevant and creative") [T, Video 12]. |
| 2026-10-18 | 11.3 | **The bed is "Strings + 808 + Beat"** — Timur's own file (from his Downloads, copied into Video 12's `public/strings808.mp3`), replacing the 711.mp3 placeholder; played as the file he gave at ONE volume (the 2026-10-15 rule), the next Bankers video follows it unless he names another [T, Video 12: "use this song"]. **The track fades out on its own from 49 s (silent by 64 s), shorter than the film, so it is EXTENDED by a crossfaded splice back to an earlier, matching bar** — the file's own music, sample-aligned, no level change — and runs to the end at one volume [T, Video 12, choosing between that and letting it fade: "Extend the song past its fade with a crossfaded splice back to an earlier bar, so it runs to the end of the video at one volume"]. This is the one sanctioned edit to a song Timur gives: a splice for length, never an envelope or dB work. |
| 2026-10-18 | 8.7 | **The phrase is SMOOTH and a touch GENTLE: every camera key glides (the sine in-out), and a key's push-in is 0.9 of the phrase's** (in ≤ 0.135, the old 0.15 × 0.9) — "only lower the camera movement intensity by the tiniest bit". **A camera that follows a moving thing follows it in ONE glide per direction of travel** — it turns only where the thing turns (Video 12's bundle: up the stair to the top of its climb, then down with it to the landing), never a chain of rest-to-rest keys across a continuous motion, which stops and starts the camera while its subject keeps moving [T, Video 12: "make the camera movement a little smoother and a little less intense. Apply those changes to the style"; "make the camera more smoothly follow the box, rather than the unsmooth way it is now in the hook scene"]. |
| 2026-10-18 | 9.6 | **A shadow fades in and out WITH its object, on the object's own ramp** — never ahead of it, never at a strength its object has not reached. Video 12's falling reports cast their shadow at a quarter strength on their first frame while they faded up from nothing [T, Video 12: "the shadows in scene two appear abruptly, even though the books appear smoothly"]. |
| 2026-10-18 | 8.7 | **★★★ EVERY PLACE'S CAMERA IS A "ZOOM IN → MOVE → ZOOM OUT" PHRASE, never a hold.** After a place arrives the camera pushes IN close on where the action starts, TRAVELS with the action at that close framing (a line's head, a climbing bar, a counting figure, the next object the voice names), then pulls back OUT to show the whole before the hand-over — the 100bps films' and Video 11's rhythm. A framing that sits on a visual while only the visual moves is a defect: "scenes that simply hold the camera still on a visual for too long are boring… The audience needs to stay entertained." Video 12's real-wage line at 38 s: in on its start, follow its head along the months, then out to the whole chart. stylecheck CAMERA enforces it from Video 12 [T, Video 12: "the camera should follow the visuals more… it should be that zoom in zoom out movement that makes the camera move, zoom in, move zoom out sort of movement… applied in the 100basispoints style, and… well in the previous bankers video… ensure that it becomes a style rule for future videos"]. |
| 2026-10-18 | 11.0, 11.2 | **Bars climbing ALWAYS get the usual bar SFX, AUDIBLE over the bed: the bike chain (`chain`) for each climb, and a ping as a figure lands where it is needed.** Video 12's columns at 13 s carried a chain too quiet to hear over the new song ("why does the scene at 13 seconds not have any sfx? use the usual bar sfx (bike chain and ping if needed)"). A cue that is scored but cannot be heard over the bed counts as missing: check its level on the rendered stems against the bed in its own window [T, Video 12]. |
| 2026-10-18 | 11.0, 11.2 | **No ping in the hook; a moving machine gets a QUIET sound of its own** (Video 12's escalator: a soft running hum under the hook), and every cue is re-timed to its motion before handback [T, Video 12: "ensure that all the sound effects are cued properly and they're synced with the video… remove the ping in the hook scene and add a sort of a quiet sound effect for the escalator"]. |
| 2026-10-20 | 6.8a, 10.1 | **A hook keeps its idea and gets DETAILED, metallic, shiny objects** — Video 13's limbo hook ("I really, really like the idea… Lots of motion") read as simple blocks: the week columns become a creative real object, the 200,000 CLAIMS stand and the path get real detail, and every object in the scene matches the polished metallic sheen of the film's best places (its day-tiles at 36 s; the 1969 at 7 s gets the same) [T, Video 13: "the visuals just are not detailed enough, and they are very simplistic… be more creative with the blocks on the actual moving path… Instead of blocks, come up with something better… the stand itself… make that more detailed… Same with the path… match that sort of metallic, shiny vibe that the scene at 36 seconds has"]. |
| 2026-10-20 | 8.7 | **The camera rests CENTRED on the visual** — a framing offset to make two places share a slide is a defect when it reads as off-centre (Video 13's 1969 at 8 s sat "a little far to the right") [T, Video 13: "keep the camera actually centered on the visual"]. |
| 2026-10-20 | 6.2, 6.8a | **A round object's rim is ONE smooth metallic surface, never visible facets** — Video 13's clock showed the rectangles its rim was swept from; a dial object is built in real depth, polished and detailed to the level of past Bankers objects [T, Video 13: "around the clock, you can see the rectangles making up the edge of the clock. Fix that. This needs to be sort of a smooth metallic surface… the clock needs to look a little bit more 3D-like and detailed"]. |
| 2026-10-20 | 6.8a, 9.6 | **A container takes what goes into it CORRECTLY: its door opens on its hinge in 3-D, and the thing going in passes through the opening, never through the door or a wall** — Video 13's mailbox top looked wrong and the letter glitched through its door; the mailbox is rebuilt as a real 3-D Bankers object and the letter redesigned [T, Video 13: "the mailbox is absolutely terrible, at least the top of it. And the fact that the letter that goes into it glitches through the door… It should look 3D, and it should have the right details. It should look satisfying and smooth"]. |
| 2026-10-20 | 5.2 | **A label for an object goes ABOVE it when beside it crowds it** — Video 13's NEXT WEEK ? sat too close beside its slot [T, Video 13: "make the next week text appear above it rather than next to it"]. |
| 2026-10-20 | 11.0, 11.2 | **Every visual gets the RIGHT sound, made for it where the pack has none** — a clock ticks, a mailbox door clunks, paper slides, a counter's drums clatter — each synced to its motion (the escalator precedent of Video 12) [T, Video 13: "sync the sound effects properly and find and use new and correct sound effects for the right visuals where you can"]. ⚠ SUPERSEDED the same day, see the next row. |
| 2026-10-20 | 11.0, 11.2 | **★ NO SYNTHESIZED SOUND EFFECTS.** The score is the house pack only (swooshes, chain, ticks, clicks, flicks, subs, pings …), each cue synced to its motion. The made sounds Video 13 tried (a rolling rail, a clock's tick-tock and gears, drum clicks, a mailbox's hinge and paper slide, keycaps, light switches) were removed and the pack cues they replaced restored. "Find new sounds" means a better choice FROM THE PACK, never a synthesized one. Video 12's escalator whir (row of 2026-10-18) is the one he asked for by name [T, Video 13: "what are those wierd new sound effects that you added? remove them. just keep the ones from before the prompt."]. |
| 2026-10-20 | 11.0, 11.2 | **★ USE MORE OF THE 100bps SOUND EFFECTS.** Score generously from the 100bps pack, family per job: a soft whoosh for each thing passing by, a flick as print lands, the data texture under anything being counted, ticks and clicks on small mechanical beats. Every visible action gets its own cue, timed by its animation's window, never a synthesized stand-in. Video 13 gained cues for the cars passing the beam, the bar's print, 1969's slots, the calendar's count, the lobby lighting and the sixth slot [T, Video 13: "use more of the 100bps sound effects"]. |
| 2026-10-21 | 10.1, 9.5 | **★ A HOOK IS FULL OF MOTION AND AT LEAST AS RICH AS THE LAST TWO HOOKS.** Video 14's first hook (one phone turning, one chip flying to a rack) read as too still and too simple next to Video 12's escalator (steps running every frame, a bundle carried down) and Video 13's limbo bar (columns gliding under it, then a whip down the rail). From now on a hook has several things moving on every frame from frame 0 — a mechanism, a crowd or a stream, not one object — each line of the hook adds a NEW motion, and the payoff is the biggest move of all; a single hero object turning slowly is never the whole hook. Before building a hook, set it beside the last two films' hooks in motion (their renders or Studios) and check it has at least as much going on [T, Video 14: "the hook scene should be recreated, right now there isn't enough motion in it and it is too simple. Come up with a better idea, considering the last two bankers videos made"]. |
| 2026-10-21 | 6.3, 6.8a | **A floor or platform never shows its edges: it fades into the ground**, above all its far edge — Video 14's hook floor showed its back and side edges [T, Video 14: "the platform that the phones stand on… I need them to not be visible. Sort of make them fade into the background… Make sure the edges in the back are not visible"]. |
| 2026-10-21 | 9.5 | **A light wave across a crowd reads as a WAVE: a narrow, noticeable band, and only a few objects share the same shine at once** — Video 14's fifty screens brightened almost together [T, Video 14: "the shine… should not occur on all of them at the same time… make the wave of that shine a little bit more noticeable… less phones have sort of the same shine at the same time"]. |
| 2026-10-21 | 6.8a | **No white box or rectangular halo round a small object** — a chip's glow is soft and shaped like the chip, or there is none [T, Video 14: "when the memory chips appear, they have this sort of white box around them… remove that"; again for the chip on the phone's back: "a sort of white highlight around the actual memory chip… remove that and make it look better"]. |
| 2026-10-21 | 5.2, 6.8a | **Print fits its panel with margin on every side** (Video 14: AI overran its header box) [T: "The AI text doesn't really fit in the box. Fix that"]. |
| 2026-10-21 | 6.7, 6.8a | **A part seated into an object takes the object's orientation** — the rack's chip sockets faced the camera while the rack was turned (a glitch at 6 s): anything on a face is drawn ON that face, and what flies into it turns to match as it arrives. And a server rack is built to the detail of past Bankers objects [T, Video 14: "the place where the memory chips actually go is sort of facing the camera, whereas the box itself… is facing a different direction… make the… box itself look a little better, more realistic compared to last banker's videos"]. |
| 2026-10-21 | 6.8a, 2.5.1a | **A repeated unit must say what it is** — Video 14's cartons read as plain cubes: a phone box shows it is a phone box (the handset printed on it, its lid seam); the pallet under them is a clean, real pallet [T: "add a little bit more detail onto the boxes. Make sure that the audience actually knows what they are"; "the bottom of the visual is sort of messed up… those rectangles behind the cubes"]. A figure on a ghost sits clear of it (up and to the side), never across the boxes. |
| 2026-10-21 | 9.6, 10.2 | **Bars hanging from a platform start a little BELOW it, with a clear gap**, and a lit state is a blend, never a one-frame colour change (Video 14's first two bars flickered at 18.2 s) [T]. |
| 2026-10-21 | 6.8a | **★ EVERY PHONE IS A DETAILED, REALISTIC HANDSET** — its camera module (raised plateau, lenses with rings and glass, flash), its corners and frame smooth, its side buttons; nothing that reads AI-generated. It holds for every phone in a film, 2-D or 3-D [T, Video 14: "add some more detail. Right now it looks too AI generated, especially the camera area and the top right corner… make it look like a realistic 3D phone" — and at 35, 40, 49 and 60 s]. |
| 2026-10-21 | 9.6 | **What travels into an object goes INTO it — through a slot or an opening, clipped by it — never fades out on top of it** (Video 14's chips faded onto the phone and the rack) [T: "the boxes sort of go somewhere rather than just fading out onto the phone… Make it look realistic"]. A tube standing in a base seats into a collar, never cuts through the base. |
| 2026-10-21 | 6.8a, 9.3 | **A gauge is a detailed 3-D instrument at the past films' level** (bezel, glass, dial face, a real needle on a hub), its needle moves smoothly, and its scale figures sit clear of the needle's sweep [T, Video 14 at 57 s: "make the visual more detailed… especially the handle on the meter… make the animation smoother for the handle… move the 0% a little bit lower"]. Signs that look plain are redesigned or replaced with a better idea [T, at 1:00: "the signs don't really look good"]. Price-tier labels on a shelf are redesigned in the house type and colours [T, at 49 s]. |
| 2026-10-21 | 11.3 | **The bed is "Golden Hour"** — Timur's own file (from his Downloads, copied untouched into Video 14's `public/music_goldenhour.mp3`), replacing Video 13's "Me And The Devil" for Video 14; played as the file at ONE volume, its music heard from the first frame, levelled as heard against the previous films; by the standing rule it is the next Bankers video's bed too unless he names another [T, Video 14: "use this song"]. |
| 2026-10-21 | 11.0, 11.2 | **No static-like texture where nothing is computing.** The data texture (`data`/`datamid`/`datashort`) read as static over the song under Video 14's hook, where chips were seating into a rack; it is for a figure being computed or counted, never for parts going into place. **Each physical action gets its physical sound, on its frame:** a phone falling flat lands with a soft `thud` (quieter as it is farther away); a chip seating into its socket clicks as it latches (`click`) [T, Video 14: "what's that weird sound effect you're using on the hook scene over the song? its sort of like a static sound effect. Remove that, and instead implement the right sfx for the phones dropping, and in the next scene for the chips getting attached into place"]. |
| 2026-10-21 | 11.3 | **"Golden Hour" plays from its own first second at the film's first frame** — its quiet 8-s intro under the hook, its beat entering at 8.3 s (during the travel to the rack) — not cut to its beat. The 2026-10-20 "music from the first frame" rule cuts a song only where its opening is silence or lone hits; a quiet intro that is music plays as written [T, Video 14: "start the song from the beginning at the beginning of the video"]. |
| 2026-10-21 | 11.3 | **★ ONE LEVEL, SET BY THE SONG'S LOUDEST STRETCH.** The song plays at ONE gain from the first frame to the logo's fade — never an envelope, never a step, never louder or softer in one part of the film than another by our hand. A track that builds (Video 14's "Golden Hour" grows louder in its second half) is levelled so its LOUDEST stretch under the voice sits at the house level (about 6 LU under the speech-gated voice, as Videos 11 and 13), so the build never crowds the voice; the quieter parts are simply quieter, as the song is written [T, Video 14: "make sure the music volume is right, especially considering that the song sort of gets louder in the second half of the video. Make sure to keep it at one level throughout the whole video though, don't ever have the song at different audio levels at different parts of videos"]. |
| 2026-10-22 | 6.8a, 10.1 | **A real-3-D hero is built to the film's best-looking object, not below it.** Video 15's hook rocket read plainer and duller than the counter, the bars and the glasses around it. A hero in real depth carries every part the real thing has (on a launcher: the octaweb of engines with their nozzles, the skirt, the raceway running up both stages, panel rings, the black interstage with lattice grid fins, folded legs with their struts, the fairing's seam and dome) and the house's polished finish: lit faces bright, a specular stripe down a turned body, a dark side. Before handback put a still of the hero beside the film's other objects; if it looks plainer than any of them, it is not done [T, Video 15: "the rocket in the first scene, it needs to be more detailed… Consider the other visuals in the video and sort of compare their look to the rocket's look"]. |
| 2026-10-22 | 9.3 | **Things that come apart obey GRAVITY.** A part released from a moving object (a fairing half, a lid, a panel) separates a little and then FALLS — an accelerating drop with a slow tumble — out through the bottom of the frame, never a level slide out through the sides [T, Video 15: "when the top of it actually separates, make sure gravity is taken into account. So make them sort of drop more rather than just exiting to the sides"]. |
| 2026-10-22 | 6.8a | **No made-up objects.** Every object is a real, nameable thing (a GPU package, a server, a printed results release, a filing cabinet), never an invented "module" or a symbolic box; the handback says what each one IS. A pedestal with a logo on it is not a thing. A grid of blocks standing for money is not a thing either: money is shown as money (coins, notes) [T, Video 15: "tell me exactly what it's supposed to be representing, because if that's some made up object, I need you to replace it with something relevant and something real"; "the visual at 42 seconds doesn't really make sense. It's about revenue. I don't understand why you're using boxes to symbolize that"]. |
| 2026-10-22 | 5.2 | **A logo is never set in a rectangle.** The SpaceX mark sits on its surface alone — no recess, plate, box or panel drawn round it [T, Video 15: "for the SpaceX logo, I don't want any sort of rectangle surrounding it"]. |
| 2026-10-22 | 6.3 | **A drawer, a lid or a door never passes through its own carcass.** A part sliding out of a body is drawn INSIDE it (clipped by the opening, painted under the frame round it); check every frame of the slide at full size [T, Video 15: "make sure there's no glitching at the top of the cabinet, because I see the drawer sort of glitching through the top of the cabinet"]. |
| 2026-10-22 | 11.0 | **Score only with sound effects Timur has already approved in Bankers films**, each on its own job (the swoosh family on moves, the bike chain under things climbing, clicks for latches, thuds for falls, ticks, flicks and subs for landings, the data texture only for computing), every cue timed to its motion's own frames and checked by whooshsync and sfxsheet [T, Video 15: "ensure to add sound effects you've previously used and I've approved in Banker's videos, and make sure that the video is properly synced to them"]. |
| 2026-10-22 | 6.8a | **A turned body (a rocket, a can, a column) is SMOOTH.** Its shading runs continuously round the curve — one gradient across each band, sampled from the light at many angles — never as visible flat facets or vertical stripes [T, Video 15: "rocket surface should be smooth, not the way it is now"]. |
| 2026-10-22 | 6.8a, 9.6 | **A hero object carries no stray lines, no gaps and no glitches — inspected part by part at full size, in motion.** Every band edge, joint and seam on it must be a real part read cleanly (no thin light or dark rings where two parts meet unless the real object has that joint, drawn crisp); a part that opens later is CLOSED until it opens — its seams flush, nothing of its inside or of the body under it showing; and every frame of its motion is checked for flicker where its parts overlap [T, Video 15: "there's a weird line right above what looks like the solar panel, and below it as well… at around 2 seconds, part of the rocket at the bottom of the screen sort of glitches… the gaps are clear between the shape of the rocket itself and that part that opens. I need you to make those parts closed off until the part that opens actually opens… focus a lot more on the details… there shouldn't be any mistakes on it"]. |
| 2026-10-22 | 6.8a, 2.4 | **A product or company named on screen is shown by its real LOGO, never its name typed in Anton.** Grok on the server's monitor is the Grok mark, not the word GROK; draw it from the maker's own vector, as inline SVG paths, in the house ink [T, Video 15: "instead of the grok text, use the grok logo"]. |
| 2026-10-22 | 8.2 | **The opening frame is aimed AT the hero, never below it.** On frame 0 the hook's object sits whole in the frame (a rocket with its nose in, its pad at the bottom), with no band of empty floor under it; the opening push settles from there onto the hook's framing [T, Video 15: "the camera starts with an angle too low in the hook scene"]. |
| 2026-10-22 | 11.0 | **The hook gets sounds that are RIGHT for what it shows, found for it when the pack has none, and they must sound good.** Where the hook's actions have no fitting sound in the approved pack (a rocket's engines, a fairing's separation), source a real, good-quality effect for that action rather than forcing a pack whoosh onto it; level it from the rendered stems under the voice, sync it to its motion, and say in the handback where it came from. This widens the 2026-10-22 "approved SFX only" row for the hook [T, Video 15: "try finding and including the right sound effects for the hook scene, make sure they are good"]. |
| 2026-10-22 | 11.0 | **A hero machine that runs through a scene carries ONE long continuous sound for the whole scene**, not a short burst at its start: the hook's rocket roars from the first frame to the hand-over, steady under the voice, leaving with the camera. And no separate bolt hit on the fairing's separation (it read as a stray sound at 4 s) [T, Video 15: "remove the sound effect that occurs at around 4 seconds and 26 milliseconds, and add a rocket sound effect that is sort of long and continues throughout the hook scene"]. |
| 2026-10-22 | 11.0 | **A real thing's sound must sound like THAT thing.** A rocket taking off is judged against a real launch (the crackling, thunderous roar of a liftoff), not a generic rumble; AI-generated stand-ins that "don't sound like a rocket" fail. Prefer a REAL recording of the event (public-domain agency audio first, its source recorded), and offer it in place for Timur to approve [T, Video 15: "they're all wrong, they don't sound like a rocket taking off"]. |
| 2026-10-22 | 6.4 | **A shadow is the object's own footprint on the floor**, darkest in a thin contact line at its base, softening outward and leaning a little AWAY from the key light, tinted navy (never grey) — never an even halo grown around the object's box (on a steep downward view that shows as a grey ring above the object as well) [T, Video 15: "fix shadows for the scene at 30 secs"]. And a sound's START is as even as its body: no burst over the steady level in its first second [T: "at the start of the rocket sfx, the volume gets too loud for a bit"]. |
| 2026-10-22 | 6.8a, 2.4 | **A real object carries its REAL markings, not our figures**: the rocket wears the livery a Falcon 9 actually carries (the SpaceX mark large, its wordmark), never a made-up label or a figure printed on it ($7.0B and ROCKETS AND STARLINK were removed); the mark is drawn from its vector [T, Video 15: "remove the 7 billion text on the rocket, make the spacex logo bigger"; "add the text that would normally be on their rocket"]. And every supporting object in a hero scene gets the same design effort as the hero (the launch tower beside the rocket was a plain lattice bar) [T: "put more effort into the design of the standing object to the right of the rocket"]. |
| 2026-10-22 | 9.3 | **Print that belongs to an object is ON it from the object's first frame** — the rocket's SpaceX mark, ROCKETS AND STARLINK and $7.0B are painted on the stage from frame 0, never inked in on the voice [T, Video 15: "make the text on the rocket be on the rocket even at the start of the video"]. |
| 2026-10-22 | 11.3 | **Video 15's bed is 711** (`711.mp3`, the file Videos 11–12 used), its big drop landing on the line after the hook, the music heard from the first frame — at ONE gain for the whole film (the 2026-10-21 rule, restated): the drop is never turned down, "that's the good part" [T, Video 15: "nevermind, cancel the render and use the 711 song instead"; "the drop should not get quieter, that's the good part. Don't adjust sound levels, keep them the same throughout the video"; then, at 12/97, "louder for the song": 15/97 (+1.9 dB); "tiny bit louder": 16/97, still one gain]. By the standing rule it is the next video's bed too unless Timur names another. |
| 2026-10-22 | 11.0 | **Never use a CLIPPED stretch of a recording**: a real recording's distorted (clipped) part sounds cheap and louder than it measures. Check the source's clipped-sample share per second before cutting, and build from clean stretches; for a rocket, a deep clean rumble carries the body, with low end lifted [T, Video 15: "sfx gets too loud and seems very bad quality at around 2 seconds, it needs to sound more like a rocket, deeper"]. |
| 2026-10-22 | 11.0 | **The rocket's roar sits DEEP and a touch quieter**: the real recording lowered ~1.5 semitones with its top end softened (low-pass ~3 kHz), at −32.5 dBFS RMS in its file (1.5 dB under the first level) [T, Video 15: "the sound for the rocket should be a little deeper and quieter by a tiny bit"]. And cash in a drawer slides out WITH the drawer, cut at the opening — never a whole row appearing in one frame [T: "theres a bug at around 36 seconds, some stacks of cash just appear"]. |
| 2026-10-22 | 11.0 | **A continuous machine sound (a rocket's roar) holds ONE steady level for the whole scene** — no dip and swell, even where the real recording has one; level it with a slow, smooth gain, leaving only the fade at the hand-over [T, Video 15: "the rocket sound is good, it just needs to be a little more consistent and not get quieter then louder again"]. And the sound Timur meant at 4–5 s was the chip's POWER-UP hum (loudest 4.95 s): removed; the halves' swoosh, removed by mistake, is back [T: "the sound effect that I DON'T LIKE IS STILL PLAYING AT 5 seconds REMOVE IT"]. |
| 2026-10-22 | 11.0 | **Before removing a sound the user points to by its time, confirm WHICH cue sits at that time from the live cue list (`out/sfx_cues.json`) and the stems, and name it back.** At 4 s two cues overlapped (the fairing's bolt hit at 4.02 s and the halves' pack swoosh peaking at 4.1 s); the bolt hit was removed and was the wrong one. Restore the bolt hit; the swoosh goes [T, Video 15: "for the sound effect at 4 seconds, you removed the wrong one. Re add the previous one, remove the one I hear now"]. |
| 2026-10-22 | 6.8a, 2.2 | **A launching rocket shows its engines' fire as a soft warm BLOOM of light** — a white-hot core at the nozzles glowing out through yellow to orange, spreading across the pad and lighting the rocket's base, gently flickering in brightness — NEVER drawn flame shapes (tongues, lobes, outlined plumes read as cartoon). (First built as drawn flames; Timur: "the fire does not look good at all right now"; "It looks too cartoony, make it more of just some sort of bloom".) The vocabulary's "no fire" and the blue-only palette give way here by name: each warm colour line carries `style-exempt:` naming this request [T, Video 15: "add some sort of fire to the bottom of the rocket"]. |
| 2026-10-23 | 6.8a | **Shipping cartons read as real corrugated board, DARKER than a pale blue box** — a deeper, slightly desaturated board tone in the blue family (never a pale satin tint), a visible corrugated edge where the board is cut, flap seams, a taped seam with its sheen, soft edge wear, and the board's own light-to-shade falloff [T, Video 16: "for the packages in the hook scene, try to make them look a little bit more realistic and make the color a little darker for them, for the boxes themselves"]. |
| 2026-10-23 | 6.8a | **Small items inside a container are SOLIDS, not flat stickers** — each bandage in the tin has thickness, a raised pad, a rounded, lit edge and a shadow on the strip under it [T, Video 16: "The bandages in the welly container, they should look a little bit more 3D. Put some effort into that."]. |
| 2026-10-23 | 6.8a | **Cash and paper props carry their real detail** — banded bundles with visible note edges, the band, the face of the top note; a receipt with printed lines, a torn edge and a curl as it feeds out; a cash register with its real parts (keys with legends, a customer display, the printer, the drawer's coin cups) [T, Video 16: "put some more effort into the stacks of cash and the little receipt that comes out. And maybe add some more details to the actual cash register as well"]. |
| 2026-10-23 | 9.3, 9.6 | **Every moving part is checked for smoothness and correct physics, scene by scene: no hops, no parts passing through each other, every move eased** [T, Video 16 (the coin tray): "ensure that the animations are smooth, there are no weird glitches, and that everything moves the way it's supposed to"]. |
| 2026-10-23 | 6.8a | **A 2-D house solid's extrusion must close at every corner** — a corner where the side and top extrusions don't meet reads as a 3-D bug; and the lower half of an object (a podium's body, a counter's pillar and stand) gets the same level of detail as its top (panels, trim, a base plinth, bolts) [T, Video 16: "the visual with the bell on the left, make sure that its top left corner is fixed. It seems like there's a little 3D visual bug… add some more detail… onto the bottom half of it because it looks a little bit plain right now. Same for the bottom part, the sort of pillar and stand section of the two 3D objects to the right of that"]. |
| 2026-10-23 | 6.8a, 9.6 | **A conveyor or path that objects travel on is built as a real 3-D machine** (side frames with depth, rollers or a belt with its edges, legs and cross-braces, end drums), its structure top detailed too; **no line may cross a moving object** (a rail, an edge or a lane line drawn over a box reads as a glitch), and objects travelling one after another never overlap [T, Video 16 (the spine's stream): "there's this sort of line, it's glitching through the boxes… add some sort of detail to the top of that sort of box holder… make sure the path itself looks more detailed, that has more 3D elements… no boxes actually glitch through each other"]. |
| 2026-10-23 | 11.0, 11.2 | **★★ THE BANKERS SFX LIBRARY IS TIMUR'S EPIDEMIC SOUND SET** (14 files, kept in `Resources/sfx-epidemic/` with their original names): Clock; Camera Flash (vintage); Typewriter (fast); Boom (low hit); Riser–Transition–Whoosh fast short 01 and 02; Tonal Ping (piano C); Magazine Page Turn 03; Falling Coins; Generic Long Whooshes; Whoosh Softs; two UI button clicks; Data Calculating (futuristic). Every Bankers video scores with THESE from now on, each on the job its name says (the families keep their jobs: soft whooshes on soft moves and hand-overs, long whooshes on big moves, the fast transition whooshes on pushes and slides, the low boom under a weighty landing, the piano ping on a number arriving, page turns on paper and labels, coins on money, clicks on latches and keys, the typewriter on printing, the data texture on computing and counting, the clock on time passing, the camera flash on a snapshot or reveal of a record). Where the library has nothing for an action, the older pack's sound may stay, on its own job. Every cue is synced to its motion's own frames: a whoosh's measured peak on the move's fastest frame, a hit on the landing, a process sound spanning its animation exactly (whooshsync, sfxsheet, the end check). The two "Riser, Transition, Whoosh" files are fast transition WHOOSHES Timur supplied; the 2026-09-26 ban on the old swelling `riser.wav` stands [T, Video 16: "from now on, use these sound effects in the videos, some of them you already have implemented, but some you don't. Ensure to sync all sound effects correctly."]. |
| 2026-10-23 | 11.0 | **No bike chain under the spine's carton stream** (the honest part's conveyor, ~57 s): the chain's job stays bars and things climbing, never a stream of boxes rolling out [T, Video 16: "don't use that bike chain sound on the scene at 57 seconds"]. |
| 2026-10-23 | 11.1 | **No whoosh under the fly-through into the closing logo** (the push through the question into BANKER$, ~1:13 in Video 16): the close arrives on the music alone [T, Video 16: "remove the sound effect at 1 minute 13 seconds" — confirmed from the cue list as the lowwoosh starting 72.8 s, peaking 73.5 s]. |

## ★★ 2026-11-22 — rulings from Oct 23 → Nov 22 that survived the container loss (re-entered from the conversation; the rest of
## that month's STYLE.md is lost — Videos 27–35 were built on the 100bps Style 3 kit with the Bankers metallic blue-steel pass)
- **★ Timur on Video 34 rev 2 (2026-11-19):**
  - A hero object falling from the sky FALLS LIKE A REAL HEAVY OBJECT: fast, tumbling/flipping about its centre of mass, righting
    itself as it reaches the ground and landing flat (the crack-on-impact landing is liked). Never a stiff upright slide down.
  - "X cents of every dollar" = REAL COINS: drop X one-cent coins and stack them — not a cut-up bill.
  - Two related objects in one scene sit CLOSE together; the camera divides the beats, then pulls back to show both together.
  - (rev 3) A tumbling fall must be SMOOTH: one slow continuous turn whose spin brakes evenly to upright by the landing, a pure
    gravity drop, a camera that eases into the landing. Objects that "belong to" a hero land a short step from it.
  - (rev 4) A falling hero stays CENTRED in frame the whole fall, and falls fast enough to read as energetic. Hand-overs between
    unrelated sets can be ONE camera move in one direction (old set pulls away while the new arrives slightly large and settles).
- **★ Timur on Video 35 (2026-11-20):**
  - A real object reads as the real thing: build it with the real object's anatomy in detail (a lottery ticket: header band and
    wordmark, play lines of printed numbers, barcode, serial and fine print, security pattern) inside the house look. Never a real
    brand's name or logo on a generic object.
  - Geography gets a map: a line that names a state shows a MAP of the U.S. with that state highlighted and filled to its value,
    animated — never a still, never values on states the source does not give. (⚠ CONFLICTS with CONTENT.md "never maps" — ruling
    pending.)
  - A hook's action starts at frame 0 for anticipation: a small, slow motion that completes decisively at its beat (~5 s).
- **★ Timur on Video 35 rev 2 (2026-11-20):**
  - A hook's slow action must be SEEN from frame 0: open on a visible, already-started tear that advances in readable steps.
  - A bar chart of money is built from CASH (the house's banded bundles of real notes), not from the film's other object.
  - An object going INTO something goes ALL the way in (a shredder's feed) — nothing left sticking out.
  - A line about money that "fed" something gets a visual that points the eye at the feeders.
  - A camera that isolates one item CENTRES it in frame, a touch closer.
  - Every scene keeps the same design effort; when one scene is asked "more detailed", look at its twins too.
  - A word like "fun" gets its own small, charming object — never a repeat of the film's hero object.
- **★ Timur on Video 35 rev 3 (2026-11-20):**
  - A figure printed on an object EASES in (≈20+ frames, a slight settle in scale), never snaps, and sits CENTRED in its box.
  - A counter that counts down only ever shows falling values (drive every drum from one number, like a real odometer).

- **★ Timur on Video 38 rev 2 (2026-11-26, the first 3-D World film):**
  - **NO GREY PLACEHOLDER LINES.** Every printed surface (brochure, newspaper, report, certificate, labels, screens) carries real,
    legible text in real typography — never bars or blurred strips standing in for text ("let's add some rule to the bankers").
  - Objects "a lot more detailed, more realistic, more eye-catching": houses, shop goods, registers, machines, cars (with seats and a
    steering wheel inside), storage tubs. A detail fix applies to every scene where the object comes back.
  - Money is the real US note: `bill1.jpg` (the public-domain $1 scan) on every bill.
  - A matched cut between two round things puts both on the SAME screen point at the same size, the push carrying through.
  - Labels (tags) are fully in by their word and readable; never so late they are missed.
  - The song is the one from the video he names, played as the file at one volume (11.3), its drop on the line after the hook.
  - **The camera is one smooth glide** (kit.smoothCam, Bankers CLAUDE.md F): no stop-and-go between shots, and NO back-and-forth —
    nothing overshoots a framing and swings back; no fast whip out of a close-up. Checked by camjerk.py (image motion, ≤ ~25 px/f²).
  - Graphics never overlap text on signs and print (the gantry's arrows sit in their own band under MASSACHUSETTS).
  - Named landmark buildings (MIT, the State House) are built as the real architecture, in detail.
