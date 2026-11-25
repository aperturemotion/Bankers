# Video 36 "Bre-X Gold" — BUILDER BRIEF (binding for every builder)

Read first, in this order: `PLAN.md` (the film, the hero object, every place's content), `scratchpad/SKELETON.md` (the place table,
provisional word frames, the CONTRACT a place must honour, hand-overs, light/flares/breaks), `FACTCHECK.md` (every figure + date),
the top "★★★ 2026-11-22" section of `/home/user/bankers/Bankers/CLAUDE.md`, and the end of `/home/user/bankers/Bankers/STYLE.md`
(Timur's Video 34/35 rulings — they are the current taste). Then STUDY Video 35's finished places in this same `src/bnx/` as the
quality bar and the house vocabulary: `tk_slab.tsx` + `tk_rig.tsx` + `tk_floor.tsx` (the 3-D rig: solids, faces, one key light,
floor, contact shadows), `counter.tsx` + `counter_drums.tsx` + `counter_plinth.tsx` (machined plinth, odometer drums),
`lotteries_feed.tsx` / `lotteries_safe.tsx` (mechanisms), `sales_cash.tsx` (banded $100 bundles), `honest_school.tsx` /
`honest_carousel.tsx` (detailed buildings/objects), `virginia_*` (white-stage handling), `favors_catch.tsx`, `pie_coin.tsx` (coins).
Render a few of Video 35's frames (`v35` is gone from Composition; render them by temporarily pointing a scratch composition at a
V35 place, or read the published Studio https://claude.ai/artifact/LAo7r5cN97oHuiMqsPDu8A) and match their world.

THE LOOK (Video 35's): metallic blue-steel and graphite objects with real construction (thickness, bevels, screws, seams, printed
detail) under ONE key light from the upper left, on the navy field with the floor grid; Anton labels (≤ 4 words) and figures from
data.ts / episode.json labels; the white stage only where SKELETON.md puts it (truth). Gold is allowed where the story is gold (the
dust, the bar, grains) — a warm metallic gold in the house's material style (gradients following the one light, a specular edge), no
flat yellow. ★ Materials: the colour-pass tools (apply-palette-metal / lift-blue / graphite) were LOST in the container reset, so
REUSE Video 35's existing material files (`counter_mat.ts` graphite, `tk_mat.ts`, `honest_mat_b.ts` / `honest_mat_g.ts` blue-steel
and graphite, `sales_mat.ts` paper/cash, `pie_mat.ts` coins) by importing them; derive any new colour from them; for gold, build one
`bx_gold.ts` material file (the hook builder owns it) and everyone imports it.

RULES (house; each is a past Timur note): every place moves from its first frame (nothing static), damped eased motion, no pops (fades
≥ 8 f, things enter/leave by moving), no linear moves; ≤ 3 objects per scene; a label lands ON its word (fully read on the word);
nothing crosses the caption band (y ≈ 220–360) — geom_sweep proves it; a camera that isolates one item centres it; an object going
into something goes all the way in; a figure eases in and sits centred in its box; real objects read as the real thing (real
anatomy, no generic slabs); no people, no maps, no document cards, no phone mockups; never type a figure — data.ts / labels only;
C$ on every Canadian money figure on screen (labels in episode.json). Keep each place ≤ 7 s; if the provisional frames put it over,
add a camera move inside it (felderhof: cash → gavel on "and was found not guilty").

WORK: in a private mirror `/home/user/bankers/Bankers/Videos/.v36_<you>` (copy the project, `cp -al` node_modules), build ONLY your
files (your place files + new helpers prefixed with your place id or the shared module your section names), copy back only those,
run `npx tsc --noEmit -p .` on the real project, delete the mirror. Never touch Composition.tsx / captions.ts / episode.json /
data*.ts / other builders' files — REPORT what you need changed (labels to add: list key + text; flare points). Never render the
full film, never publish, never commit or push, never call ElevenLabs or any paid service. Chrome needs the proxy shim
(`scratchpad/chrome-proxy.sh`, `scratchpad/cloud-env.sh`); use your own port range.

CHECKS before reporting: full-size stills at every action of your places (LOOK at them; compare with Video 35's quality);
`node scratchpad/geom_sweep.mjs 1 <from> <to>` over your places ± 30 f → 0 spans (run `node scratchpad/cuedump.mjs` first if it asks
for out/moves.json); `node scratchpad/frames.mjs <from> <to> 0.5 out/seq_<you>` + `python3 scratchpad/motion.py out/seq_<you>` → no
pops; delete your outputs. Report briefly: what you built (what a viewer sees), frames of each action, the Ev list, labels/flare points
you need, checks.
