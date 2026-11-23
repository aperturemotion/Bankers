# Video 16 — shared brief for the place builders

Project: `C:\Users\Timur\Documents\Video editing project\Bankers\Videos\Video 16 — Private Equity Backlog\` (a Remotion project,
module `src/pe/`, composition `PrivateEquityBacklog`, 1080×1920 @ 30 fps). Bankers client account: "Bankers/CLAUDE.md" (long — skim
§2.5.1a, §2.5.5) and the look authority **`Bankers/STYLE.md`** (read §5 type, §6 solids/finishes incl. §6.1a "2-D by default", §9 motion,
§10.2 kinds, and the §16 changelog rows dated 2026-10-18 → 2026-10-22) and **`Bankers/Resources/visual-vocabulary.md`** (DEMO ANCHOR).
The brief is `BRIEF.txt` in the project (CONTENT-LEVEL VISUAL NOTES section names each place's object). Facts: `src/pe/data.ts`.

## What you own

Each place is ONE file in `src/pe/places/`. It already exists as a stub. You replace the stub's body and keep its exports:
- `KIND` (do not change it),
- the times function (`<name>Times(c)`) with the same name and argument type; it returns every animation window you use (`[start, end]`
  pairs, frame numbers, used by the SFX score) and **`done`: the frame the place's LAST action ends**. The next place waits for `done`
  (`places/registry.tsx` computes each place's first frame as `max(its sentence lead, previous done + n)`), so keep `done` honest and
  no later than you need: a place may not last more than ~6.5 s on screen.
- the coordinate const (camera aims, in the place's own 1080×1920 frame coordinates — `x, y` = the construction's centre, plus the
  extra fields named in your task),
- the component, with the props type in the stub (`arrive` = the place's first frame; cue frames = absolute film frames of the spoken
  words; `end` = ignore unless useful). Use `useCurrentFrame()` for `f`. Never hard-code the arrival frame: derive from `arrive` and cues.

**Do NOT edit any other file** (Video.tsx, registry.tsx, captions.ts, the kit) — other builders work in parallel. If you need another
word's frame, import `CUE` or `SENTENCES` from `../captions` inside your own file. If you think the kit needs a change, say so in the
report instead.

## The look (non-negotiable)

- The navy field with one soft key light (upper left). Solids in the house **dark-blue metal**, polished, detailed, with depth, a
  contact shadow, one light. Build at the level of Video 15's best objects. References to READ before drawing:
  - 2-D house solids: `src/pe/flat.tsx` (`FSolid`, `FBox`, `FPrism`, `rrect`, `Contact`), `src/pe/glossy.tsx` (`Coin`, `PriceTag`…).
  - Real depth: `src/pe/p3.tsx` (`P`, `quad`, `box`, `metalBox`, `steelBox`, `matBox`, `vcyl`, `xcyl`, `contactShadow`, `onFace`,
    `Faces` sorted far→near, the `after` print slot). `src/pe/rig.tsx` makes a rig.
  - Finished places to copy patterns from (read-only): `..\Video 15 — SpaceX AI Revenue\src\spx\places\` (`cabinet.tsx` real-depth
    drawers with cash bundles, `compute.tsx` server in real depth, `grid.tsx` coin stacks in depth, `pie.tsx`, `pad.tsx` paper),
    `..\Video 14 — Phones Worst Quarter\src\phn\places\` (`pace.tsx` = a detailed 3-D gauge, shelf, bars), `..\Video 13 — Layoffs Since
    1969\src\job\places\` (clock, counter, calendar, mailbox).
- **2-D by default; real 3-D only where the idea needs depth** (STYLE §6.1a).
- Type: figures in Anton (`DATA`/`DISPLAY` from `../fonts`, white `#EEF5FB`-ish via `figure()` in `../kit`), labels via `label()`.
  **One short label per figure.** **Never "·" or "•" between words** — use separate lines or "|". No fine print.
- Bars and any scale start at **zero**. Neutral: no lean, no hype, no flashing red. Red (the house loss red) only for a loss, sparingly.
- **Nothing pops:** everything enters by moving (out of depth or from an edge) and fades over TIME (8–12 frames), never over a slice of
  an eased progress; grows ease in-out; no overshoot, no bounce, no `Math.sin` settles. Nothing switches on a threshold (`x > 0.5 ? a : b`)
  — blend. A place's BASE (floor, plinth, axis, the object's body) is on screen from the place's first frame (it arrives with the camera);
  the spoken cues then light / grow / label what is there.
- Things the voice names act **on their word** (a figure lands ~2–4 f before its word: `figLand` in `./land`).
- No CSS `filter` on anything that moves (shadows are painted). Gradients in `<defs>` must not change per frame (static stops; animate
  opacity of a second finish instead). SVG gradient ids must be unique to your file (prefix them with your place name) and must never be
  `<id>Face|Lit|Cap|Side` for an id you pass to `FlatDefs`.
- Keep big figures out of the top ~460 px (captions live at y ≈ 260–330) and out of the bottom ~180 px (watermark). Text ≥ 14 px clear
  of shapes it is not printed on; ≥ 14 px inside any surface it is printed on.
- The construction should fit inside ~900 px of width at each of its framings (the hand-overs are 1,020-px slides).
- `≤ 3 objects` per scene; every object is the real thing the sentence names (not a stand-in rectangle); detailed, not cartoony.

## How to check your work

- `npx tsc --noEmit -p .` must be clean.
- Still your place at chosen frames: from the project folder,
  `RPORT=<your port> node scratchpad/lab.mjs <placeId>@<frame> <placeId>@<frame> …` → `out/lab/<placeId>_<frame>.png`
  (the Lab draws your place on the field without the camera; frames are absolute film frames; add a trailing number arg `1` to draw on
  the white stage). **Look at every still** (Read the PNG) — at rest, mid-action, and on the first few frames after `arrive`. Fix what is
  wrong; inspect joins and edges at full size.
- Run stills sparingly (each run bundles; the machine has 16 GB shared with other builders): batch several frames per run.
- Do not run the full-film sweep, do not render an MP4, do not start a Studio.

## Report back (short)

1. what you built, per place, and the frames of each action;
2. the final `done` formula and the coordinate const values;
3. an SFX list: each visible action → frame window → suggested house family (swoosh, whooshsoft, chain/rattle for things climbing or
   mechanisms, click for latches/seating, tick, flick for labels/print, coin, sub for a weighty landing, ping ONLY for a number arriving,
   data for counting) — the score is written by the lead;
4. anything you could not do or think the lead should change.
