# Video 38 "Selbees Lottery" — REVISION 2 BUILDER BRIEF (binding for every builder)

Timur reviewed the rendered draft (delivered/Bankers_Selbees_2026-11-25_v1.mp4, Studio https://claude.ai/artifact/3Hkw7MMXkcu49YqR6AiRCK)
on 2026-11-26. His whole note is in the integrator's hands; YOUR part is in your own brief. The common thread of every note:
**objects must be a LOT more detailed, realistic and eye-catching** ("make it more detailed … more realistic … more eye-catching,
aesthetic … as detailed as possible … it looks like some random visuals bunched up together"), and what he liked must stay as it is.

READ FIRST: `PLAN.md` (the film, ten stations), the "★★★★ 2026-11-25 — THE BANKERS 3-D WORLD STYLE" section of
`/home/user/bankers/Bankers/CLAUDE.md` (style A–F), `src/w3d/Main.tsx`, `src/w3d/kit.tsx`, `src/w3d/overlays.tsx`, then your files.
The engine: three 0.169 + @react-three/fiber 9 through @remotion/three, SwiftShader WebGL. Each station is
`ST = {id, origin, from, to, light, shots(), Scene, Overlay, sfx}` (stations.tsx); one camera over all shots (`makeCam` in kit.tsx).
Rendered frames of the current draft, 540×960: `out/mp4f/element-NNNN.jpeg` (frame N). LOOK at your range there first.

## ★ NEW STANDING RULE (Timur, 2026-11-26) — NO GREY PLACEHOLDER LINES, EVER
"Again, gray lines appear. Please don't do that … use actual text when filling up." Every printed surface (brochure, newspaper,
report, certificate, labels, receipts, screens) carries REAL, legible, plausible text set in real typography (headings, body copy
in columns, small print, numbers) drawn with `canvasTex` at enough resolution (≥ 2048 px on the long side for anything the camera
gets close to; use the house fonts BODY / FIGURE from fonts3d.ts, plus a serif such as Georgia/"Times New Roman" where the real
object uses one). Never bars, blurred strips or lines standing in for text. Text content must be factual or neutral: only facts from
FACTCHECK.md, generic rules text, or plainly descriptive copy; no invented quotes attributed to real people, no invented figures.

## HOUSE RULES (each is a past Timur note)
- Blue is the main colour; the world is at blue hour/night (style §A). Warm only in small practical lights; red only for suspicion/failure.
- Detail = real construction: thickness, bevels, trims, seams, frames, sills, hardware, printed detail, materials that respond to the one
  key light (roughness/metalness/normal variation), small secondary parts. Keep it stylised-photoreal and clean (no grime).
- Performance matters (SwiftShader, ~3 s/frame budget): use instancing / merged geometry for repeats (windows, bricks, products,
  shingles); prefer canvas textures (+ a bump/roughness map) over thousands of meshes; no more than ~2× the current mesh count of
  your station. Time a still before and after (still38.mjs prints seconds per frame) and report both numbers.
- No people modelled (no hands, silhouettes, portraits). Real people only as the existing credited photos.
- No pops: everything enters/leaves by moving or by a fade ≥ 8 f; nothing appears or vanishes in one frame. No linear moves.
- TAGS (`<Tag>` in overlays.tsx — the dark chips with a light-blue bar and a leader line): Timur: "they come up late, so you cannot
  actually see them". A tag must be FULLY in (at + 12) no later than its spoken word, read for ≥ 1.2 s (36 f) before its out starts,
  and must leave BEFORE the camera flies off its object (CLAUDE.md F). Audit every Tag in your files against the word frames in
  `src/w3d/take.ts` (WORDS: {t, at, end}) and the camera shots; list each tag with at/out/readable frames in your report.
- Keep frame 0 / station timings, the voice and the captions untouched; do not change other stations' files.

## WORK PROTOCOL
- Work in a PRIVATE MIRROR: `/home/user/bankers/Bankers/Videos/.v38r2_<LETTER>` — create it with
  `rsync -a --exclude out --exclude node_modules "<project>/" <mirror>/ && ln -s "<project>/node_modules" <mirror>/node_modules`.
  Build and check there. When done, copy ONLY your owned files (and new files you created, prefixed as your brief says) back into
  the real project, run `npx tsc --noEmit -p .` in the real project, and delete your mirror.
- Never edit files you do not own. If you need a change elsewhere (Main.tsx, stations.tsx, another station), REPORT it exactly.
- Stills: in your mirror, `PORT_STILL=<your port> STILL_OUT=out/<you> node scratchpad/still38.mjs --scale 0.5 <frames…>`
  (full detail checks at `--scale 1`). Sequences for motion checks: the same tool over consecutive frames at `--scale 0.25`, then
  `python3 scratchpad/popscan.py <folder>` needs files named element-NNNN.jpeg (convert) — or just look at contact sheets.
  LOOK at every still yourself at full size before you call something done; compare against the draft's frames.
- Use ONLY your port range. Never run render38.mjs, never write into out/r38 or delivered/, never publish, commit or push, never
  call ElevenLabs/Higgsfield or any paid/external service, no network downloads (the only new asset is `public/bill1.jpg`, already
  in place: a real public-domain scan of the US $1 note, 1216×519).
- The machine has 4 cores shared by 5 builders: render stills sparingly (key frames at 0.5, a handful at 1.0).

## REPORT (short)
What the viewer now sees (per item of your brief), frames of each action, mesh/time cost before→after, the tag table, anything you need
the integrator to change in files you do not own, and the stills you looked at (paths in your mirror are gone — keep 3–6 final stills in
`out/rev2_<you>/` of the real project).
