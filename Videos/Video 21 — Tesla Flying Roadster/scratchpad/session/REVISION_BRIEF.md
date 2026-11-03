# Video 21 — REVISION 1 brief (2026-10-29), shared by the four builders

Read first, in this order:
1. `scratchpad/session/PLACE_BRIEF.md`: the engine and conventions (p3 faces, rigs, the Lab, the look rules, TIMES/`done`). It all still holds.
2. `Bankers/STYLE.md` §16, the five rows dated **2026-10-29**. They are Timur's new standing rules, written from the note below.

## Timur's note (verbatim; times refer to the film)

> All right, so for the hook scene, it is not nearly polished enough. Now, first of all, just try your best to improve absolutely
> everything. Like, there should be a lot more detail on the ramp itself. The car should be a lot more detailed and specifically designed
> with 3D details. You should really focus on fixing the wheels, the sides, the bottom of it, just overall improving it, and its physics as
> well. The car wheels should actually turn. The car should not clip through the ramp itself. The ramp should be set up properly in a way so
> that it doesn't clip through the car. Just make sure you perfect that design. And for the rest of the cars as well, that stand there, make
> them more realistic. At least add that metallic sort of texture to them that you use on the bars on other bankers' videos. For example, the
> metallic texture used in the next scene. Now, sort of the same thing for the scene at 17 seconds. It is pretty good, but it should be a
> little bit better. The car should be a little bit more detailed and the ramp as well. And make sure you have the physics right, the timing.
> It should all be right. Now, same for the car at 25 seconds. It should be more detailed. Instead of trying to make it curved everywhere,
> maybe add more rectangles or something. I'm not sure. But just make it look realistic and have that right metallic banker's texture. Now
> the cars at 47 seconds, they actually look nice. Maybe take some motivation from them, except make them 3D. I mean, the cars in the
> beginning and in the rest of the video. Now for the car at 52 seconds, it seems glitched and bugged out a little bit. Fix it. Fix the way
> the hand appears at 53 seconds, and the rocket as well. They don't even stand in the circles as they're appearing. Fix that. And make them
> more 3D. Improve the SpaceX book at 59 seconds, and maybe get closer with the camera to the both books so that the audience actually knows
> what's going on. Now improve the car model at 1 minute and 3 seconds as well. Improve the document and the pen at 1 minute, 9 seconds. Make
> it more detailed. Overall, whenever I say improve, I mean make it more detailed, focus on it more, put more effort into it, make it more 3D.

Film times → places (30 fps):
- 0–8 s: hookA/hookB, `hook.tsx`.
- 17 s: whatB, `profile.tsx`.
- 25 s: whatC, `thrusters.tsx`, the car.
- 47 s: teachD, `future.tsx` LEFT half. **This is the reference: the 2-D Model Y and Model 3 he likes.**
- 52–55 s: teachD2, `future.tsx` RIGHT half (the Cybercab, the robot hand, the Starship).
- 59 s: teachE, `committee.tsx`.
- 1:03: honestA, `faa.tsx`. This is the shared Roadster model.
- 1:09: honestC, `unsigned.tsx`.

## What "the metallic Bankers texture" means

It is the finish of the house solids, e.g. the event board in the next scene (`places/marker.tsx`, `flat.tsx` FSolid tones), and p3's
`metal()` / `METAL` / `steelBox()`. That is a satin brushed steel in the logo blue's family:
- a pale lit face (#FFFFFF → #B3CEEF → #6FA3DF), going deep blue (#174C8E → #02234A) as it turns from the key light (upper left);
- a specular sheen that runs CONTINUOUSLY across a whole panel, never one per facet: per-facet chrome, fall and gloss overlays draw each
  facet's edge as a grid; set them to 0 on lofted facets and lay any sheen as one panel-wide shape;
- crisp, lit edges (a bevel catch-light).

Never flat white and never flat colour.

## Who owns what (edit ONLY your files; every other file is read-only to you)

**A — the Roadster model:** `src/tsla/roadster.tsx`, `src/tsla/RoadsterLab.tsx`. You may also make compat-only edits to
`places/thrusters.tsx`, `places/revenue.tsx` and `places/faa.tsx`, e.g. moving the engraving to the new flank, or YAW/scale/aim.
- The car at 0–8 s, 17 s, 25 s, 33 s (tiny, on the turntable) and 1:03 is ONE model. Rebuild it to a real car's detail, in the Bankers
  metallic finish (pale satin steel: it stays the brightest object, so it reads as the hero against the blue line-up):
  - **Body:** crisper body lines, more flat planes ("more rectangles", not one smooth blob): a defined shoulder line, a flat hood plane with
    a crease, a flat deck lid, a crisp sill, door cut lines, a flush door handle, side mirrors, side vents/intakes, the front splitter,
    headlamp units with an inner structure, the full-width tail light, and a rear diffuser with fins.
  - **Glass:** a real windscreen and side glass with a frame and a reflection band.
  - **Wheels:** a tyre with sidewall and tread blocks; a multi-spoke rim (≥ 7 spokes) with depth: dish, lug nuts, centre cap; a brake disc
    and caliper behind the spokes; the arch liner inside.
  - **Wheel turning:** the wheels TURN by `pose.spin` (radians). Add `spinBlur?: number` (0..1) to Pose: when the wheel turns too fast to
    read (above ~0.6 rad a frame), the spokes cross-fade into a radial motion-blurred disc and never strobe. Callers set it.
  - **Underside, seen when the car flips:** the flat floor in panels, the battery pack plate, suspension arms, the motor housings at each
    axle, the diffuser, the 10 thruster nozzles. All lit as real surfaces, never one dark slab.
  - **Size:** keep the external API and the dimensions unchanged, so the other files' physics still holds: `RD` (length 430, wheelR 33,
    wheelX, wheelZ 92, ground at local y 0), `Pose`, `toWorld`, `dirWorld`, `roadsterFaces`, `RoadsterDefs`, `RoadsterJets`,
    `roadsterShadow`, `NOZZLES` if exported.
  - **Checks:** the four tail nozzles must not sort behind the tail panel (Builder A's report flagged it; `thrusters.tsx` carries a z-hack,
    so fix it at the source and remove the hack). The probe-measured faces (the sills and the tyres' sidewalls, both sides, see the
    comment in `roadster.tsx`) must stay measured.
- **Lab views:** RoadsterLab views `side | threeq | rear | roll | under | front | wheel` (registry pieces `rdSide`, `rdThreeQ`, `rdRear`,
  `rdRoll`, `rdUnder`, `rdFront`, `rdWheel`). Implement `under` (seen from below), `front` and `wheel` (one wheel close, turning).
- **Before you report:** re-check the car in place at full size in `whatC@650`, `whatC@720`, `teachA@990`, `honestA@1890`, `honestA@1950`
  and the hook frames (`hookA@20`, `hookA@60`, `hookA@100`, `hookB@200`; B is editing `hook.tsx` in parallel, so only LOOK at those).
- **RPORT 3522.**

**B — the hook's ramp and physics, and the 17-second stunt:** `src/tsla/places/hook.tsx`, `src/tsla/places/profile.tsx`.
- **The hook's ramp: much more detail.** A real stunt ramp: steel deck plates with joints and anti-slip tread, side rails with posts,
  edge bevels, bolt rows, cross-members under the deck, support trusses/pylons with bases, and a clean, finished transition where the
  curl starts. All in the Bankers metallic finish.
- **Physics:**
  - The car RIDES ON the deck: its four wheels' contact points sit on the surface at every frame of the run (no clipping into the deck,
    no air between), and no part of the ramp passes through the car.
  - The wheels turn with the distance travelled (`spin` = distance / wheelR) and set `spinBlur` when fast (A adds it).
  - The speed and timing follow real motion: it accelerates up the run, keeps its speed round the inverted section, follows a gravity
    arc in flight, lands with weight (a suspension squat), and rolls out with braking.
  - Prove "no clipping" by MEASUREMENT, not by eye: compute every wheel's contact gap to the deck per frame, and the car's body hull
    against the deck's faces. Print the worst value. Report the numbers.
- **The 17-second profile: the same.** A more detailed ramp (deck plates, rails, supports, braces, bolts); the car riding on the deck at
  every frame (measured); timing that is right ("climbed" → up, "upside-down" → inverted at the top, "ramp" → it leaves, "flipped" → the
  roll, "landed" → touchdown on the word); wheels turning.
- **Keep:** the hook's existing beats and `hookTimes` keys (`leave`, `flip`, `jets`, `land`, `squat`, `drive`, `label`, `exit`, `done`),
  so the score still lands. If a key's frame moves, report it. Same for `profileTimes`.
- **The model:** A is rebuilding it in parallel with the same API and dimensions. Work against the current file; physics depends only on
  RD's dimensions. Pass `spinBlur` once it exists (add it as an optional field if A hasn't yet: it is ignored until then).
- **RPORT 3523.**

**C — the line-up cars:** `src/tsla/lineup.tsx`, `src/tsla/LineupLab.tsx`.
- **Make the five cars (Model 3, Model Y, Semi tractor, Cybertruck, Cybercab) realistic 3-D cars.**
  - Take the detail of the 2-D side-on Model Y / Model 3 in `places/future.tsx` (left half: door cuts, flush handles, mirror, lamps, glass
    with a frame and a reflection, the wheels' rims) and build it in 3-D.
  - Give each car its own real silhouette: the Semi a real cab (windscreen, sleeper, side fairings, fuel-tank skirts, fifth wheel and
    frame rails behind), the Cybertruck its flat stainless panels, the Cybercab its teardrop and two doors.
  - The Bankers METALLIC finish everywhere: no faceted low-poly look, no per-facet overlays.
  - Wheels turn by `spin` (the hook drives them off).
- **Keep:** the API and the dimensions (`carFaces(r, model, pose, key)`, `carShadow(r, model, pose, floorY, key)`, `lenOf`, `widthOf`,
  `MODELS`' lengths and widths), so the hook's row spacing holds.
- **Lab:** pieces `luRow`, `luModel3`, `luModelY`, `luSemi`, `luTruck`, `luCab` (`LineupLab.tsx`, yours to extend).
- **Before you report:** look at `hookA@60`, `hookA@100` and `hookB@150` too (B edits `hook.tsx` in parallel: only LOOK).
- **RPORT 3524.**

**D — 52 s to 1:09:** `src/tsla/places/future.tsx` (right half), `places/committee.tsx`, `places/unsigned.tsx`.
- **52 s, the Cybercab "seems glitched and bugged out":** render teachD2@1552…1600 frame by frame and find what breaks. Fix the class:
  check every frame of its glide in, its wheels, its stop.
- **53 s, the hand and the Starship:** each must arrive ON its own turntable (the circles), centred, rising out of / lowered onto its base
  for the whole entrance. Never beside it, never sliding over (STYLE §16 2026-10-29). Make both genuinely 3-D: a real p3 model or
  stepped extrusions with lit sides, not flat silhouettes.
  - The hand: articulated fingers with real thickness, knuckles, a palm with depth, a wrist actuator.
  - The Starship: a cylinder lit round its curve, with weld rings, flaps standing out in depth, heat tiles on its shaded side, on a
    stand.
  - The Cybercab as well, if it is flat today.
- **59 s, the books:**
  - Improve both portfolios, the SpaceX one above all: more detailed and more 3-D. Leather grain, stitched edges, a raised/debossed
    mark (SpaceX's real wordmark, `spxwordmark.ts`; Tesla's T, `marks.ts`), page edges, the spine, a closure strap or corner guards.
  - Make the two legible as two companies' board folders.
  - Export a camera point `COMMITTEE.close`: the place where the camera should push in so that both folders fill the frame (the camera
    must come close enough that the audience can read them). I will wire the keys.
- **1:09, the agreement and the pen: much more detailed and more 3-D.**
  - The paper stack: thickness, slightly fanned sheets, a page curl at the corner, real body type lines, a header with the title, clause
    numbers, initials boxes, the two signature blocks with names/titles lines, the staple, the shadow.
  - A real fountain pen: barrel, cap and clip, the grip section, the nib, lit round its body.
- **RPORT 3525.**

## Rules for everyone

- **NEVER render an MP4.** Lab stills only: `RPORT=<yours> node scratchpad/lab.mjs <piece>@<frame> …` writes `out/lab/<piece>_<frame>.png`.
  Look at your stills at full size (crop and zoom) before you call anything done.
- **Do NOT edit** `Video.tsx`, `places/registry.tsx` or any file you don't own. If you need a change there, say so in your report.
- **Run `npx tsc --noEmit -p .` before you report:** clean for your files.
- **p3 lessons:**
  - `fall: 0` and `chrome: 0` on lofted facets, so the sheen is not a grid.
  - Every visible face is lit by its own normal (`lightOf`, `shade`, `metal`).
  - Closed solids only.
  - Sort whole parts as units, with a bias where needed (wheels, see `roadster.tsx`).
  - No stray lines.
  - Footprint shadows.
- **The probe:** faces with `skip: true` are invisible to the sweep. Keep the probe-measured parts that exist, and give any NEW object at
  least one measured shape (not `skip`), or its place's hand-over reads 0 f.
- **Keep every animation window and `done` formula,** unless the note requires a change. Report any change.

## Report (short)

1. What you changed, part by part.
2. Measurements, if any (B: the contact gaps).
3. Any change to TIMES keys, `done` values or exported camera points.
4. Suggested SFX changes, if any.
5. Anything for me: changes needed in files you don't own, risks, what you did NOT check.
