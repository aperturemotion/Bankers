# Video 37 "Theranos" — BUILDER BRIEF (binding for every builder)

Read first, in this order: `PLAN.md` (the film, the hero object, every place's content), `scratchpad/SKELETON.md` (the place table,
the CONTRACT a place must honour, hand-overs, light/flares/breaks), `FACTCHECK.md` (every figure + date), the top "★★★ 2026-11-22"
section of `/home/user/bankers/Bankers/CLAUDE.md`, and the end of `/home/user/bankers/Bankers/STYLE.md` (Timur's latest rulings).

THE QUALITY BAR is Video 36 "Bre-X Gold" as Timur finally accepted it — its place files are in
`/home/user/bankers/Bankers/Videos/Video 36 — Bre-X Gold/src/bnx/` (read, never edit; COPY any helper you want into your own
prefixed file here — nothing in V37 may import from V36's folder). Its Studio: https://claude.ai/artifact/YDB51b6K1wcmNPX6VxHfd2.
Timur's Video 36 revision notes are the current taste, and they ALL say the same thing — objects must be DETAILED, REALISTIC and
instantly readable as the real thing ("make it a lot more detailed and realistic … as eye-catching as possible, so the audience
actually understand what it is"): the drill rigs got lattice masts, cabs, hoses, rails, decals; the loupe a knurled ring and a real
lens; the bench raised panels, mouldings, a leather mat, a brass rail; the vial a true 3-D glass tube (both ends in ONE perspective, a
domed base — never a flat cut-off end); palms with ringed trunks and pinnate fronds in proportion. Also Video 35's places in this
`src/bnx/` (tk_slab/tk_rig/tk_floor: the 3-D rig, solids, one key light, floor, contact shadows; counter_*, honest_*, sales_cash, pie_coin).

THE LOOK: metallic blue-steel and graphite objects with real construction (thickness, bevels, screws, seams, printed detail) under ONE
key light from the upper left, on the navy field with the floor grid; Anton labels (≤ 4 words, from episode.json via `L(key)`); the
white stage only at `expose`. Reuse the existing material files (`counter_mat.ts`, `tk_mat.ts`, `honest_mat_b.ts`/`honest_mat_g.ts`,
`sales_mat.ts`, `pie_mat.ts`) or copy V36's (`claim_mat.ts`, `ev_mat.ts` …) into your own prefixed file. Blood: ONE glossy drop at a time
in the house red (theme's red family, a specular highlight following the one light) — never a splash, stream or pool (no liquids).
Theranos's own look (white/black product design) is fine for its objects (the nanotainer, the Edison) — rendered in the house materials.

RULES (house; each is a past Timur note): every place moves from its first frame (nothing static), damped eased motion, no pops (fades
≥ 8 f, things enter/leave by moving), no linear moves; ≤ 3 objects per scene; a label lands ON its word (fully read on the word);
nothing crosses the caption band (y ≈ 220–360) while a chip shows — geom_sweep proves it; a camera that isolates one item centres it;
an object going into something goes all the way in; a figure eases in and sits centred in its box; real objects read as the real thing;
NO PEOPLE (no hands, no silhouettes, no portraits), no maps, no document cards, no phone mockups; never type a figure — labels only;
company names on objects are OK (Timur, Video 36). Keep each place ≤ 7 s; if a place runs over, travel the action camera inside it.
3-D: anything with two ends (tubes, cylinders) is drawn in ONE consistent perspective (Timur's Video 36 vial note).

WORK: in a private mirror `/home/user/bankers/Bankers/Videos/.v37_<you>` (copy the project WITHOUT out/: `cp -al` node_modules), build
ONLY your files (your place files + new helpers prefixed with your place ids, or the shared module your section names), copy back only
those, run `npx tsc --noEmit -p .` on the real project, delete the mirror. Never touch Composition.tsx / captions.ts / episode.json /
data*.ts / other builders' files — REPORT what you need changed (labels: key + text ≤ 4 words; extra word frames; flare points; HO
changes). Never render the full film, never publish, never commit or push, never call ElevenLabs/Higgsfield or any paid service. Chrome
needs the proxy shim (`source scratchpad/cloud-env.sh`); use only your own port range (H 5730–5739 · B 5740–5749 · M 5750–5759 ·
C 5760–5769 · F 5770–5779; still.mjs takes PORT_STILL/STILL_OUT, frames/geom_sweep take PORT/GEOM_OUT).

CHECKS before reporting: full-size stills of every action of your places (LOOK at them at full size; compare with Video 36's places);
`node scratchpad/cuedump.mjs` (writes out/moves.json); `node scratchpad/geom_sweep.mjs 1 <from> <to>` over your places ± 30 f → 0 spans;
`node scratchpad/frames.mjs <from> <to> 0.5 out/seq_<you>` + `python3 scratchpad/motion.py out/seq_<you>` + `python3 scratchpad/popscan.py
out/seq_<you>` → no finding in your range; `node scratchpad/sfxends.mjs` clean; delete your outputs. Report briefly: what a viewer sees,
the frames of each action, the Ev list, labels/word frames/flare points you need, the checks.
