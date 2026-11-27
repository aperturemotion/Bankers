# V39 DETAIL PASS — brief for builders A, C, D, E (2026-11-27)

**Timur's note (verbatim, the brief):** "overall, try to add as much detail as possible to any visual in the scenes … every visual that looks
like a house or some interior. Make those visuals more realistic, more detailed … the house in this 8 second … the library, the hospital …
the other house near the Toyota car … the trees, make them a lot more realistic. Right now there's just triangles. That looks weird … every
visual, make it a lot more realistic to the real world and more detailed, so it's more interesting. Certificates, houses, cars, interiors of
the houses, clothes, jackets, even the food, the restaurant, the service station (Haviland's). Make sure the text on the service station
doesn't overlap. The JCPenney store, make it a lot more detailed as well, and fix the road, because right now it looks weird … the lockers
at the end with the shares, make them more realistic, and if possible provide the real logos or the real names of the stocks — right now
it's JPM, SJM — give some originality to every single one that's written, and make the board more detailed."

## Where to work (each builder)
- REAL project (read-only for you, never edit, never git): `/home/user/bankers/Bankers/Videos/Video 39 — Ronald Read/` (= `<real>`).
- Your mirror `/home/user/mirrors39/<LETTER>/`. FIRST refresh it: `mkdir -p` it, then
  `rsync -a --delete --exclude node_modules --exclude out --exclude .git "<real>/src/" <mirror>/src/` and the same for `public/` and
  `scratchpad/`; copy `<real>/package.json`, `tsconfig.json`, `remotion.config.ts` (if present) and any other root files except folders
  `node_modules`, `out`, `delivered`; if `<mirror>/node_modules` is missing, `ln -s "<real>/node_modules" <mirror>/node_modules`.
- Set the mirror's `src/w3d/stations.tsx` to import ONLY your stations in story order (keep its `// @ts-nocheck` header style).
- Edit ONLY the files your scope lists, plus new helpers named `<letter>_*.ts(x)` for your letter. Another builder owns every other file;
  builder B is rebuilding the Yaris in `b_yaris.tsx` right now — nobody else touches it.

## What does NOT change
- The voice, the timing, every station's window, its SHOTS (camera path) and its overlays' timing. Improve the THINGS in front of the
  camera. If a better model needs a camera nudge to stay in frame, keep it minimal and say so; never add a reversal (CLAUDE.md camera rules).
- Facts: every word/figure printed on screen follows `<real>/FACTCHECK.md`; generic plausible text (signage, departments, menus,
  small print, rules text, neutral description) is fine; NO invented claims about Ronald Read (no names, dates, numbers, quotes about him
  that the sources don't give). NO people modelled. Company names in plain typography are allowed.

## The bar (read `/home/user/bankers/Bankers/CLAUDE.md` section "★★★★ 2026-11-25 — THE BANKERS 3-D WORLD STYLE", A–F)
- A prop reads as the real thing at a glance, and survives a close look: real construction (thickness, bevels, trims, frames, sills,
  hardware, seams, fasteners), real materials (wood grain, clapboard with shadow lines, brick with mortar and soldier courses, shingles,
  glass that reflects, metal that shines), small secondary detail (gutters, downspouts, vents, meters, mailboxes, light fixtures,
  curtains/blinds and furnished rooms behind lit windows, door hardware, snow lying on every horizontal ledge in winter scenes).
- Real text on every printed surface (canvas textures ≥ 1024–2048 px where the camera gets close), never grey lines; graphics never
  overlap text; signs follow real sign layouts with margins (check each sign at full size).
- TREES: no cones/triangles. Snowy conifers (eastern white pine / spruce / balsam fir) built from layered drooping branch tiers with
  needle-cluster texture, a visible trunk, snow on the upper branch surfaces; bare winter deciduous trees (maples) with a branching
  skeleton (recursive branches tapering to twigs). Instanced/merged so dozens stay cheap; vary each tree (seeded rnd).
- Blue-hour/night Bankers light: cool key, navy fog; warm only in small practical lights (lit windows, lamps).
- Keep it renderable on SwiftShader: merged geometry (Mesher in `town_parts.tsx`) / instancing, canvas textures ≤ 2048 px, no per-frame
  geometry rebuilds, no extra real lights where an emissive surface or a Glow sprite does it.

## Checks (all; LOOK at every still you render — Read the PNG)
- `cd <mirror> && npx tsc --noEmit -p .` clean.
- Stills: `STILL_OUT=out/s PORT_STILL=<your port> node scratchpad/still38.mjs --scale 0.4 <frames…>` (≈ 30–60 s a frame; five builders
  share 4 CPU cores, so render only what you need: before/after of each beat, plus close test frames). Compare with the current stills
  of the real film in `<real>/out/i1/f<frame>.png` (frames 0 60 120 160 214 220 300 367 374 440 476 540 598 640 712 792 818 900 920 1000
  1112 1230 1300 1338 1425 1534 1600 1700 1745 1790 1900 1965 1988 2060 2110 2150 2200).
- If you changed any shot: `bash scratchpad/camdump.sh` then `python3 scratchpad/camjerk.py out/cam_s.json 12` in the mirror.
- Station windows (film frames): hook 0–217 · farm 217–370 · gas 370–472 · jcp 472–594 · yard 594–814 · diner 814–916 · shares 916–1108 ·
  vault 1108–1334 · lehman 1334–1530 · will 1530–1786 · pavilion 1786–1984 · line 1984–2201.

## Report
Files changed/added (mirror paths), what you improved per object, the stills you looked at (paths in your mirror's out/s/), check results,
anything unsure or any fact question. Do not copy into the real project — the integrator does that.
