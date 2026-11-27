# V38 REV 5 — "make it cinematic" (Timur, 2026-11-27) — brief for builders P, Q, R, S

Read `/home/user/bankers/Bankers/CLAUDE.md` → the section **"★★★★★ 2026-11-27 — CINEMATIC 3-D WORLD: TIMUR'S STYLE PREFERENCES"** first
(it is the brief), then the 3-D World section below it. Timur's words, verbatim where they matter:

> "the main change … I need it to be a little slower in terms of the camera movement in the 3D world. It's too fast. It's way too fast right
> now. And it doesn't look cinematic … rather than fast and jittery." · "slower camera movement overall, more seamless transitions, not
> necessarily fade outs, preferably no fade outs." · "the distance … should always be covered up … by adding fog, blue fog." · "If an object
> is a main visual in a scene, there needs to be shadows on it, and it needs to be detailed." · "no random camera movement, no point in
> moving the camera to something that isn't there. The camera should always be focused on something or be moving to something, some subject.
> Not like … around 2,274 frames, it just randomly wanders around." · "try using a little bit more blue … throughout." · "more high quality
> and cinematic."

## Already done by the integrator (in the real project — do NOT redo)
- Subtitles: low (centre y 1500), text only, no pill, no keyword box (`karaoke.tsx`).
- All 2-D leader labels (`Tag`, st_globe's `RedTag`), photos (`Inset`) and pills (`Pill`) are OFF globally (`label_style.ts`). Leave the
  `<Tag>` calls in place (they render nothing); panel `Counter`s stay (Timur accepted "2003 – 2012 · 9 YEARS").
- Global fog: Bankers blue, density 0.03 (`kit.tsx FOG`); the Sky's lower half is the fog's blue so the horizon sits inside the fog; the
  hemisphere fill is bluer. If YOUR station still shows a world edge, a white/pale distance or a flat empty horizon, fix it in your
  station (move/extend ground, add distant fogged masses — trees, buildings, hills — or tighten the framing), never by turning fog off.

## Frames (REAL composition frames = what Timur quotes; non-hook stations are authored in STORY time = real − HOOK_SHIFT (54))
Timur's points: 69 f the Evart label (done) · 252 f white flat distance (hook street) · 749 f "remove that weird blue line in the middle of
the scale itself" · 897 f / 30 s the two stacks (kitchen, st_test): "no shadows whatsoever … the stack on the left … should have the
correct shadows, as well as the stack of money on the right … they both look too bright and unlit" · 30 s "3,600" / "6,300" counters:
"instead of making them 2D on the screen, make them 3D … behind or on top of the stacks … maybe right in front of them as a thing that
lies flat on the table itself" · 37 s the cash register: "not that detailed and it has no shadow" · ~39 s the car: same · 1192 f "the end of
the Earth is visible" · ~2274 f the camera "randomly wanders around".

## Where to work
- REAL project (read-only for you; never git): `/home/user/bankers/Bankers/Videos/Video 38 — Selbees Lottery/` (= `<real>`).
- Your mirror `/home/user/mirrors38/<LETTER>/`: create it by copying `<real>` WITHOUT `node_modules`, `out`, `delivered` (no rsync on this
  box: `mkdir -p M && cd <real> && tar cf - --exclude=./node_modules --exclude=./out --exclude=./delivered . | (cd M && tar xf -)`), then
  `ln -s "<real>/node_modules" M/node_modules`.
- Set the mirror's `src/w3d/stations.tsx` STATIONS to your stations only (keep the file's other lines; the hook/store wrappers if yours).
- Edit ONLY your stations' files (`st_<id>*.tsx` and the helpers only they import) — list every file you change in the report.
  `kit.tsx`, `Main.tsx`, `overlays.tsx`, `karaoke.tsx`, `label_style.ts`, `shift.ts`, `take*.ts` belong to the integrator: if you need a change
  there (e.g. removing a DISSOLVES entry), describe it exactly in the report instead.

## The camera (the main job)
- Re-author your stations' shots for a SLOW, cinematic camera: fewer and longer moves, gentle eased glides and slow pushes/orbits/cranes,
  every move starting on a subject and ending on a subject, the subject composed (rule of thirds / centred hero), no zips, no reversals, no
  sideways skids, no travel toward empty space, no "settle and restart". Keep every beat on its spoken word (the voice and timing do not
  change; use `wf`/`T()` anchors as now).
- Measure before and after: `bash scratchpad/camdump.sh` then `python3 scratchpad/camstat.py out/cam_s.json` / `python3 scratchpad/camjerk.py
  out/cam_s.json 12` (read each tool's header for its exact use). Report your stations' peak and median image speed (px/frame) before → after;
  aim for the peaks to come down to ≤ ~50–60 % of today's and the median clearly lower. Jerk ≤ 12 px/f² inside your stations.
- Transitions: no opacity fades or cross-dissolves where avoidable — a continuous camera move (push past/through an object, a crane over a
  roof into the next place, travel through blue fog that thickens and clears, a match on a shared object). If your station is on either side
  of a current DISSOLVE (rolldown→test, total→rules) design its replacement and tell the integrator exactly what to change in Main.tsx.
- Things that fade out (objects, glows) should leave by moving or by the camera leaving them, where possible.

## The look
- The MAIN VISUAL of every scene casts proper shadows (castShadow on it, receiveShadow on what it stands on, the station `light`'s
  `shadowBox`/`key` placed so the shadow falls visibly and correctly, contact shadow where it touches) and is detailed (real construction,
  materials, small parts, real text). Not bright and unlit.
- More blue: lights, materials and practicals leaning to the Bankers blues (warm only in small practical lights).
- Keep it renderable (merged geometry, ≤ 2048 textures, no per-frame rebuilds).

## Checks and report
`npx tsc --noEmit -p .` clean in the mirror; stills with `STILL_OUT=out/s PORT_STILL=<port> node scratchpad/still38.mjs --scale 0.4 <frames…>`
(LOOK at each; ~40–120 s a frame, four builders share 4 cores — render what you need: each beat, Timur's quoted frames, the transitions, a
6-frame strip over your fastest remaining move). Report: files changed, what changed per scene, camera speed before → after, stills paths,
anything for the integrator (Main.tsx changes), anything unsure.
