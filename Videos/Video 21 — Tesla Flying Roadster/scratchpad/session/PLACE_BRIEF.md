# Video 21 — shared brief for the place builders

Project: `C:\Users\Timur\Documents\Video editing project\Bankers\Videos\Video 21 — Tesla Flying Roadster\` (a Remotion project,
module `src/tsla/`, composition `TeslaFlyingRoadster`, 1080×1920 @ 30 fps). Bankers client account: `Bankers/CLAUDE.md` (long — skim
§2.5.1a, §2.5.5) and the look authority **`Bankers/STYLE.md`** (read §5 type, §6 solids/finishes incl. **§6.1a "2-D by default"**, §9
motion, §10.2 kinds, and EVERY §16 changelog row dated 2026-10-18 → 2026-10-28 — they are Timur's standing notes and they are strict)
and **`Bankers/Resources/visual-vocabulary.md`** (DEMO ANCHOR). The brief is `BRIEF.txt` in the project (the "CONTENT-LEVEL VISUAL
NOTES" section names each place's object). Facts: `src/tsla/data.ts`. The voice and its timing: `src/tsla/captions.ts` (`CUE`,
`SENTENCES`). The corrected script: `VO_SCRIPT.txt` (the take says these words; the brief's six old lines are NOT said).

## What you own

Each place is ONE file in `src/tsla/places/`. It already exists as a stub. You replace the stub's body and keep its exports:
- `KIND` (do not change it),
- the times function (`<name>Times(c)`) with the same name and argument type; it returns every animation window you use (`[start, end]`
  pairs, frame numbers, used by the SFX score) and **`done`: the frame the place's LAST action ends**. The next place waits for `done`
  (`places/registry.tsx` computes each place's first frame as `max(its sentence lead, previous done + n)`), so keep `done` honest and
  no later than its window below allows.
- the coordinate const (camera aims, in the place's own 1080×1920 frame coordinates — `x, y` = the construction's centre, plus the
  extra fields named in your task: the points the camera's "zoom in → move → zoom out" phrase visits),
- the component, with the props type in the stub (`arrive` = the place's first frame; cue frames = absolute film frames of the spoken
  words; `end` = ignore unless useful). Use `useCurrentFrame()` for `f`. Never hard-code the arrival frame: derive from `arrive` and cues.

**Do NOT edit any other file** (Video.tsx, registry.tsx, captions.ts, roadster.tsx, the kit) — other builders work in parallel. If you
need another word's frame, import `CUE` or `SENTENCES` from `../captions` inside your own file. If you think a shared file needs a change,
say so in the report instead.

## The windows (frames on the wired take; the place is on screen from `arrive` until the next place's arrive)

| place | file | arrive | next arrive | cue words (frame) | arrives by |
|---|---|---|---|---|---|
| whatA | marker.tsx | 260 | 424 | october 273, d15 281, waco 320, texas 334, showed 373, roadster 408 | slide (from the right) |
| whatB | profile.tsx | 424 | 573 | climbed 439, upside 458, ramp 477, flipped 499, midair 516, landed 544, wheels 565 | slide |
| whatC | thrusters.tsx | 573 | 765 | compressed 612, thrusters 625, developed 654, spacex 669, lifted 700, row 730, teslas 756 | push (dive in) |
| whatD | speedo.tsx | 765 | 878 | says 785, zero 810, sixty 825, under 848, second 868 | slide |
| teachA | revenue.tsx | 878 | 1028 | strange 898, even 917, roadsterB 957, revenue 1012, much 1021 | push |
| teachB(+B2) | bars.tsx | 1028 | 1268 (travel at 1200) | business 1065, shrinking 1084, july 1108, deliveries 1153, p2 1175, profit 1216, p43 1238 | slide; a camera travel from the deliveries pair to the profit pair at 1200 |
| teachC | worth.tsx | 1268 | 1379 | yet 1280, worth 1305, t16 1320, trillion 1350 | slide |
| teachD(+D2) | future.tsx | 1379 | 1671 (travel at 1474) | investors 1391, paying 1415, today 1465, next 1540, robotaxis 1580, robots 1609, maybe 1639, spacexB 1650 | push; a camera travel at 1474 onto THE ONE LIGHT FRAME (the white stage floods during the travel: teachD2 is white) |
| teachE | committee.tsx | 1671 | 1782 | committees 1737, merger 1780 | slide (back to navy) |
| honestA | faa.tsx | 1782 | 1962 | honest 1821, faa 1849, definition 1922, aircraft 1951 | push |
| honestB | timeline.tsx | 1962 | 2047 | production 1974, y2028 2016 | slide |
| honestC | unsigned.tsx | 2047 | 2127 | terms 2079, agreed 2100 | slide; then the closing question slides in |

(`done` must leave the next place's arrival unchanged: keep `done + 6 ≤ next arrive`.)

## The shared Roadster (THE film's spine — the brief: it appears in the hook and returns ONCE, changed, in the honest part)

`src/tsla/roadster.tsx` is a finished real-depth model; do not edit it, use it:
- `roadsterFaces(r: Rig, pose: Pose, key?)` → `Face[]` (merge with your own faces and paint with `<Faces>` from `../p3`, which sorts far
  → near). `roadsterShadow(r, pose, floorY, key?)` → its soft footprint shadow (paint first). `<RoadsterDefs/>` once per SVG, then
  `<RoadsterJets r pose />` after the faces (the white cold-gas puffs when `jets > 0`).
- `Pose`: `{ x, y (the floor under its tyres), z, roll, pitch, yaw (degrees), scale, spin (wheel turn, rad), squat, jets (0..1),
  breath (phase), sweep (0..1 canopy glint), op }`. Local size 430 × 206 × 116 at scale 1 (nose to +x at yaw 0). `NOZZLES` = the ten
  thruster positions (four in the tail, three along each sill). `toWorld(pose, localPoint)` maps a local point to the rig's space.
- `../rig` `Rig = { cx, cy, persp, yaw, pitch }` — one perspective rig per object (`../p3` `swing()` gives the house's slow turn).
- Only the places whose idea is THIS car use it: whatC (the thrusters close-up), teachA (the tiny Roadster beside the revenue), honestA
  (the spine's return: parked, the camera circling). whatB draws the stunt's PATH side-on — the car there may be a small side-on
  Roadster (yaw 0, pitch 0 rig: a clean profile) riding the arc.

## Logos (STYLE §16 2026-10-22: a product or company is shown by its real LOGO as inline SVG, never its name typed; never set in a rectangle,
plate or box; ~70–80 px clear of every label; in the stage's ink, never brand colours)

- Tesla's T: `MARKS.tesla` in `../marks` (a 24×24 path).
- SpaceX: `SPX_D` / `SPX_VB` in `../spxlogo` (the X mark, simple-icons) and `SPXW_D` / `SPXW_VIEW` in `../spxwordmark` (the wordmark).
- Musk is NAMED, never shown (no face, no figure, no silhouette of a person).

## The look (non-negotiable)

- The navy field with one soft key light (upper left). Solids in the house **dark-blue metal**, polished, detailed, with depth, a
  contact shadow (the object's own footprint: a thin dark contact line, softening outward, leaning away from the key, tinted navy — never
  a halo), one light. Build at the level of Video 15's and Video 16's best objects. References to READ before drawing:
  - 2-D house solids: `src/tsla/flat.tsx` (`FBox`, `FPrism`, `Contact`, the `FlatDefs` finishes), `src/tsla/glossy.tsx`.
  - Real depth: `src/tsla/p3.tsx` (`P`, `quad`, `box`, `metalBox`, `steelBox`, `matBox`, `vcyl`, `xcyl`, `xloft`, `hexa`,
    `contactShadow`, `onFace` for print ON a face, `Faces` sorted far→near, the `after` print slot, `shade` for non-metal materials).
  - Finished places to copy patterns from (read-only): `..\Video 16 — Private Equity Backlog\src\pe\places\` (register.tsx — a detailed
    cash register; dial.tsx — a 3-D gauge; payouts.tsx; bell.tsx), `..\Video 15 — SpaceX AI Revenue\src\spx\places\` (cabinet.tsx
    drawers with cash bundles, compute.tsx a server in real depth, pad.tsx paper), `..\Video 14 — Phones Worst Quarter\src\phn\places\`
    (pace.tsx a detailed gauge), `..\Video 13 — Layoffs Since 1969\src\job\places\` (counter, calendar).
- **2-D by default; real 3-D only where the idea needs depth** (STYLE §6.1a): charts, bars, counters and anything read face-on are the
  house 2-D construction (flat faces, the up-right extrusion as painted facets — `flat.tsx`), on a `Turn` with a `Pool3D`.
- **No made-up objects**: every object is a real, nameable thing (STYLE §16 2026-10-22). Money is shown as money (banded notes, coins).
  No pedestal with a logo on it as a "thing"; no grid of blocks for money; no hang tags or swing tags (a price or figure goes on a built-in
  display — a read-out in a bezel, a meter, an inlaid nameplate).
- Type: figures in Anton (via `figure()` in `../kit`), labels via `label()`. **One short label per figure.** **Never "·" or "•" between
  words** — use separate lines or "|". No fine print. Print that belongs to an object is ON it (on a real surface — `onFace`), inside its
  panel with a margin on every side, from the object's first frame.
- Bars and any scale start at **zero**; compared numbers on the same scale and aligned. Neutral: no lean, no hype, no flashing red. The
  house loss red only for a loss, sparingly.
- **Nothing pops:** everything enters by moving (out of depth or from an edge) and fades over TIME (8–12 frames), never over a slice of an
  eased progress; moves ease in-out; no overshoot, no bounce, no `Math.sin` settles. Nothing switches on a threshold (`x > 0.5 ? a : b`)
  — blend. A shadow fades with its object. A place's BASE (floor, plinth, axis, the object's body) is on screen from the place's first
  frame (it arrives with the camera); the spoken cues then light / grow / label what is there.
- Things the voice names act **on their word** (a figure lands ~2–4 f before its word: `figLand` in `./land`).
- No CSS `filter` on anything that moves (shadows are painted). Gradients in `<defs>` must not change per frame (static stops; animate
  opacity of a second finish instead). SVG gradient ids must be unique to your file (prefix them with your place name) and must never be
  `<id>Face|Lit|Cap|Side` for an id you pass to `FlatDefs`. Wrap a real-depth SVG as `<svg key={f}>` (the render-only stale-paint class).
- A floor or platform never shows its edges: it fades into the ground. No white box or rectangular halo round a small object.
- Keep big figures out of the top ~460 px (captions live at y ≈ 260–330) and out of the bottom ~180 px (watermark). Text ≥ 14 px clear
  of shapes it is not printed on; ≥ 14 px inside any surface it is printed on.
- The construction should fit inside ~900 px of width at each of its framings (the hand-overs are 1,020-px slides), centred on x 540.
- `≤ 3 objects` per scene; every object the real thing the sentence names; detailed, realistic, never blocky or "AI generated".

## How to check your work

- `npx tsc --noEmit -p .` — your files must be clean (Video.tsx is being rewritten by the lead; ignore ITS errors).
- Still your place at chosen frames: from the project folder,
  `RPORT=<your port> node scratchpad/lab.mjs <placeId>@<frame> <placeId>@<frame> …` → `out/lab/<placeId>_<frame>.png`
  (the Lab draws your place on the field without the camera; frames are absolute film frames; add a trailing number arg `1` to draw on
  the white stage). **Look at every still** (Read the PNG) — at rest, mid-action, and on the first few frames after `arrive`. Fix what is
  wrong; inspect joins and edges at full size (crop and zoom with python/PIL if needed).
- If a font load fails with `ERR_NETWORK_CHANGED`, just run it again (a network blip, not your code).
- Run stills sparingly (each run bundles; the machine has 16 GB shared with other builders): batch several frames per run.
- Do not run the full-film sweep, do not render an MP4, do not start a Studio.

## Report back (short)

1. what you built, per place, and the frames of each action;
2. the final `done` formula and the coordinate const values;
3. an SFX list: each visible action → frame window → suggested family from the Bankers library (Timur's Epidemic set: whooshsoft for soft
   moves and hand-overs, whooshlong for big turns, airwoosh for travels, swoosh for entrances, lowwoosh for verdicts, sub for a weighty
   landing (boom), ping ONLY for a number arriving, pingshort, flick for print landing, coin for coins, click for latches/seating, tick,
   data for counting/computing only, type for printing, clock for time passing, flash for a record, thud for a fall; chain ONLY under bars
   or things climbing) — the score is written by the lead;
4. anything you could not do or think the lead should change.
