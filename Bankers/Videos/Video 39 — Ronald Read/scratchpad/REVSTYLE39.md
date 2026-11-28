# V39 (Ronald Read) — bring it up to the V38 cinematic style (Timur, 2026-11-28) — brief for builders A, B, C, D

Timur: "consider all the changes we made to the style for the video due on Friday [V38 Selbees] … make those changes accordingly to the new
video [V39 Ronald Read, due Sunday 29 Nov]." Read `/home/user/bankers/Bankers/CLAUDE.md` → **"★★★★★ 2026-11-27 — CINEMATIC 3-D WORLD: TIMUR'S
STYLE PREFERENCES"**, rules 1–18 (that is the brief), then the 3-D World section above it. The reference film is V38
(`/home/user/bankers/Bankers/Videos/Video 38 — Selbees Lottery/`), whose stations show how each rule was met (its `src/w3d/st_*.tsx`).

## Already done by the integrator in the REAL V39 project (do NOT redo)
- Engine port from V38: kit.tsx (blue FOG 0.03, the sky's lower half in the fog, bluer hemisphere, `ShadowAll` = every opaque mesh casts
  and receives the key's shadow each frame — mark a mesh `userData.noShadow` to exclude it), karaoke.tsx (the ORIGINAL Bankers subtitles,
  whole chunk, low at y 1500 over a soft black fade), overlays.tsx + label_style.ts (ALL 2-D labels `Tag`, `Counter`, `Inset`, `Pill` now render
  NOTHING — leave the calls or delete them, your choice), SfxLayer (`rate` for stretched cues).
- **No cross-dissolves**: Main `DISSOLVES` is empty, so every station boundary is now a HARD CUT until you design it (see Transitions).
- **No pings** (all removed). **Camera whooshes** (`whooshsoft`, `whooshlong`, `airwoosh` cues in station sfx) are FILTERED OUT by Main —
  the integrator generates one long stretched whoosh per measured fast camera move after your work. Do not add camera whooshes.
- The voice, the take (`take.ts`), the station windows (`windows.ts` WIN) and the Radiohead bed do not change.

## Station windows (film frames) and owners
hook 0–217 · farm 217–370 · gas 370–472 · jcp 472–594 · yard 594–814 · diner 814–916 · shares 916–1108 · vault 1108–1334 · lehman 1334–1530 ·
will 1530–1786 · pavilion 1786–1984 · line 1984–2201 (then the BANKER$ close).
- **A**: hook, jcp, line (the JCPenney store set) — files `st_hook.tsx`, `st_jcp.tsx`, `st_line.tsx`, `a_*`.
- **B**: farm, gas, yard — `st_farm.tsx`, `st_gas.tsx`, `st_yard.tsx`, `b_*`, `e_*`.
- **C**: diner, shares, vault — `st_diner.tsx`, `st_shares.tsx`, `st_vault.tsx`, `c_*`.
- **D**: lehman, will, pavilion — `st_lehman.tsx`, `st_will.tsx`, `st_pavilion.tsx`, `d_*`.
Shared files (`kit.tsx`, `Main.tsx`, `overlays.tsx`, `karaoke.tsx`, `label_style.ts`, `windows.ts`, `take.ts`, `stations.tsx`, `bld_kit.ts`,
`money.tsx`, `print_type.tsx`, `fonts3d.ts`) belong to the integrator: describe any change you need there in your report instead.
You may COPY a helper from V38 (e.g. `fakeshade.tsx`) into a new file named with your letter (`a_fakeshade.tsx`…).

## What to do in each of your stations (Timur's rules, V38's examples)
1. **Camera — slow, cinematic, always on a subject** (rules 1, CLAUDE.md camera section): fewer, longer eased glides / slow pushes / orbits /
   cranes; every move starts on a subject and ends on one; no wandering toward empty space, no zips, no reversals, no "settle and restart"
   (overlap shots 6–10 f). Keep every beat on its spoken word (`wf`/`T()` anchors). Measure before and after: `bash scratchpad/camdump.sh`,
   `python3 scratchpad/camstat.py out/cam_s.json` (copy it from V38's scratchpad if your mirror lacks it) and `python3 scratchpad/camjerk.py
   out/cam_s.json 12`; aim for your stations' peak image speed ≤ ~50–60 % of today's, median clearly lower, jerk ≤ 12 px/f².
2. **Transitions — seamless, no fades** (rule 2): you own the ARRIVAL into each of your stations (A also owns hook→… nothing; hook is first).
   Today every boundary is a hard cut. Replace it with a continuous camera move through the world or a MOTIVATED match: the outgoing shot
   pushes into a surface that fills the frame and the incoming station's first shot (`cut: true`) lands on a matching surface/object
   (V38: the leaflet's diagram → the coin wall; Jerry's ticket stack → the same stack on the kitchen table; a crane over the roof; the car
   pulling out of the lot). To shape the OUTGOING side of a boundary you don't own (the previous station's last shot), describe exactly what
   you need in your report (the integrator coordinates with that station's builder). Every boundary needs a design.
3. **Blue fog / more blue** (rules 3, 4): the distance is always fog; no world edge, flat empty horizon or white washed-out distance. Lean
   materials, lights and practicals into the Bankers blues; warm only in small practical lights. Keep the hook's spotlight (`lightGain`).
4. **Main visual of every scene: real shadows + detail** (rules 5, 13): check each hero object casts and receives the key's shadow (station
   `light.shadowBox`/key placed so the shadow falls visibly and correctly); hand-place subtle, correct fake contact shadows where a real one
   can't reach (shelves, furniture, building feet). No unlit, flat, bright objects.
5. **No floating text at all; figures and names live IN the scene** (rules 6, 8, 10, 11): the 2-D labels and counters below are gone — carry
   the ones that matter on a real object that would carry them, in its real typography, landing on the spoken word (V38: a jackpot meter, chalk
   on the board, an LED trailer sign, a clipboard, a newspaper dateline, a cheque, a band on a money stack, a store banner, a bank time sign).
   Pick the object from the sentence, never a generic sign. Every figure/date from `<real>/FACTCHECK.md` (⚠ the pavilion's old label said
   "Opened 2023" while the script says 2022 — use FACTCHECK.md's value). No photos. Removed labels/counters by station:
   - hook: "Brattleboro, Vermont" · "Died 2014" · counter "$8 MILLION estate ≈"
   - farm: "Born 1921" · "Dummerston, Vermont" · "Class of 1940"
   - gas: "After WWII" · counter "25 YEARS at the pumps"
   - jcp: "Part-time janitor" · counter "17 YEARS at JCPenney"
   - yard: "Used 2007 Yaris" · "Safety pin" · "Into his 90s"
   - diner: "A stranger paid"
   - shares: "Held for decades"
   - vault: counter "At least 95 stocks" · "5 inches"
   - lehman: "Lehman Brothers, 2008" · counter "1 OF 95 — one stock"
   - will: counters "$4.8 MILLION hospital", "$1.2 MILLION library" · "2× its yearly budget"
   - pavilion: "Opened 2023 [check]" · "Partly his gift"
   - line: "Held for decades"
   Not every label needs an object — a place already named by its own real signage (HAVILAND'S, JCPenney, Friendly's) needs nothing more.
6. **No stray graphic lines on objects** (rule 9); signs and print: graphics never overlap text; real text, never grey lines.
7. **Sound** (rules 14, 16, 17, 18): subtle, synced context sounds ONLY on visible actions, starting when the action starts and ending when it
   ends (read the animation's own schedule), ≈ −16…−24 dB under bed + voice (the V38 coin clinks at vol 0.7–1.1 on `coin` were right). Keep the
   existing score otherwise; NO pings; NO camera whooshes; no ambience beds. Sounds available: `public/sfx/` (you may copy V38's `ov_*.wav` and
   their SfxLayer table entries already exist in the ported SfxLayer).
8. Keep it renderable (merged geometry, ≤ 2048 textures, no per-frame rebuilds). No people modelled.

## Where to work
- REAL project (read-only for you; never git): `/home/user/bankers/Bankers/Videos/Video 39 — Ronald Read/` (= `<real>`).
- Your mirror `/home/user/mirrors39/<LETTER>/` — REFRESH it first (the engine changed): `mkdir -p M && cd <real> && tar cf - --exclude=./node_modules
  --exclude=./out --exclude=./delivered . | (cd M && tar xf -)`; `ln -sfn "<real>/node_modules" M/node_modules` if missing. Then set the mirror's
  `src/w3d/stations.tsx` STATIONS to your stations (plus the neighbour before each of yours if you need to see the boundary).
- Checks: `npx tsc --noEmit -p .` clean; stills `STILL_OUT=out/s PORT_STILL=<port A 5981 / B 5982 / C 5983 / D 5984> node scratchpad/still38.mjs
  --scale 0.4 <frames…>` (~30–90 s a frame, four builders share 4 cores — render what you need and LOOK at each PNG: every beat, each arrival
  boundary on both sides, the frames where removed labels' figures now land, and a 6-frame strip over your fastest remaining move); camdump/
  camstat/camjerk as above.

## Report (keep it tight)
Files changed/added (mirror paths), per station: camera before → after (peak/median px/f, jerk), the arrival design for each boundary you own (and
exactly what you need from the previous station's last shot), which figures now live on which objects (with the word they land on), shadow/detail
changes, sound cues added (frame, sound, vol, what it's on), stills you looked at, anything for the integrator, anything unsure. Do not copy into
the real project — the integrator does that.
