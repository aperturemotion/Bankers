# V39 BUILD BRIEF — "The Janitor Who Died With $8 Million" (Ronald Read), Bankers 3-D World style

You are one of four builders. Each builds a few STATIONS (places in one WebGL world) for a 73.4-s vertical film (1080×1920, 30 fps),
in YOUR OWN mirror copy of the project. The integrator copies your files into the real project afterwards.

## Read first (do not skip)
- `/home/user/bankers/Bankers/CLAUDE.md` → the section "★★★★ 2026-11-25 — THE BANKERS 3-D WORLD STYLE" (A–F), especially:
  blue-hour Bankers blues, warm light only in small practical lamps/windows, real text on every printed surface (NO grey placeholder
  lines), props that read as the real thing at a glance, detail, things that fall rest ON surfaces, signs never overlap their text,
  landmark buildings built as the real building, NO people modelled (Ronald Read is a real person: he never appears; show his THINGS).
- The engine: your mirror's `src/w3d/kit.tsx` (World3D, makeCam, HouseLights, Sky, Glow, canvasTex, std/phys, ease/easeOut, rnd),
  `overlays.tsx` (Tag, Counter, Pill), `money.tsx` (real $1 notes, bundles), `town_parts.tsx` (V38's detailed small-town
  building kit: Mesher, addBuilding, addRow, addProps, townMats — reuse it for streets), `bld_kit.ts` (architecture helpers),
  `print_type.tsx` (real typography on canvas: line, para, flow, rule, halftone, grain), `windows.ts` (scene windows + wAt()).
- V38's finished stations for reference (READ-ONLY, do not import from there): `/home/user/bankers/Bankers/Videos/Video 39 — Ronald Read/scratchpad/v38_stations/`
  (st_test.tsx = a kitchen table set; st_store.tsx = a shop interior; st_road.tsx = a night road + car; st_globe*.tsx = a plaza and a
  real landmark; st_state_house.tsx = a detailed real building; company_cert.tsx = an engraved certificate drawn on canvas).
  Copy and adapt code from them freely into YOUR files.
- FACTS: `FACTCHECK.md` in the project. Every figure/word on screen comes from it. Company/brand names in plain typography are allowed
  (JCPenney, Toyota, Friendly's, Lehman Brothers, Procter & Gamble…), but never copy a trademark logo's artwork.

## The station contract (one file per station: `src/w3d/st_<id>.tsx`)
```ts
export const ST = { id, origin: [x, 0, z], from, to, light: { target: [x, 0, z] /*local*/, shadowBox, keyI, fillI }, shots, Scene, Overlay, sfx };
//  from = WIN()[id].start - 8, to = WIN()[id].end + 8   (import { WIN, wAt, wEndAt } from "./windows")
//  shots: () => [{ a, b, pos, target, fov, arc?, raw? }]  — WORLD coordinates (add origin), frames are film frames.
//         THE FIRST SHOT IS A CUT at the window start: { a: start, b: start, cut: true, pos, target, fov } — Main.tsx cross-dissolves
//         the previous station into yours over start+1 ± 7 f. Exception: the hook (start 0) needs no cut.
//  Scene: ({ f }) => <R3F content in LOCAL coordinates>   Overlay: ({ f, P }) => HTML (P(localPoint) → {x,y,behind} on screen)
//  sfx: () => [cueAt(name, frame, durFrames, volume)]  (import { cueAt } from "../bnx/SfxLayer"; families: ls public/sfx)
```
1 unit = 1 metre; ground at y 0; build at your origin, keep everything within ~60 m of it.

## Camera (Timur's rules — each one is from a glitch he saw)
- One smooth glide: shots OVERLAP (start the next 6–10 f before the previous ends); the camera moves 70–90 % of the time, slowly.
- No back-and-forth, no out-then-in-then-out: once a framing pulls back it holds or keeps going back until one final move.
- The camera never passes through geometry, never lands on a blank surface; keep the whole construction in frame while it means something.
- Your LAST shot keeps drifting gently through end + 8 (the dissolve shows it).
- Frame 0 of the film is already moving (hook only).

## Overlays (CLAUDE.md §D)
Tags (≤ 4 words, small caps chip + leader to a tracked 3-D point) in the y band 290–670 px, never in the caption band (y 1180–1460),
top 220 px clear. Counters ROLL and land ON the spoken word. A Tag's `out` comes BEFORE your window's end (it must be gone before the
dissolve). Use `wAt("word", afterFrame)` for every timing — exact words, never typed frame numbers.

## Sound
One soft whoosh per big camera travel (peaking on the fastest frame); a context sound only for a visible action (thud of a
falling thing, a click as a sign lights). Quiet levels (0.25–0.5). Never a riser.

## Your mirror, stills and checks
- Your mirror is a full copy of the project; edit only YOUR files there (`st_<id>.tsx` and helpers named `<letter>_*.ts(x)`), plus your
  mirror's `src/w3d/stations.tsx`, which you set to import ONLY your stations in story order:
  `export const STATIONS = [a, b, …];`
- `npx tsc --noEmit -p .` must be clean.
- Stills: `STILL_OUT=out/s PORT_STILL=<your port> node scratchpad/still38.mjs --scale 0.35 <frames…>` (≈ 30 s a frame on this machine;
  SwiftShader WebGL). LOOK at every still you render (Read the PNG). Check at least: each station's first frame, every beat, the last
  frame, plus a strip of ~6 consecutive frames over your fastest move.
- Camera check: `bash scratchpad/camdump.sh` (prints image-motion jerks over 12 px/f²; aim ≤ ~25 inside your stations).
- Keep it renderable: merged/instanced geometry, canvas textures ≤ 2048 px, no per-frame geometry rebuilds.

## Deliver
Report: your files, each station's shots and beats with their frames, every check you ran and what you saw, anything you are unsure of.
Do not touch the real project folder, git, or anything outside your mirror.

## The windows (film frames; dissolve at each start) and the words
hook 0–217 · farm 217–370 · gas 370–472 · jcp 472–594 · yard 594–814 · diner 814–916 · shares 916–1108 · vault 1108–1334 ·
lehman 1334–1530 · will 1530–1786 · pavilion 1786–1984 · line 1984–2201 (the BANKER$ close covers the world from ~2105).
Word frames: `node out/w.cjs` is not needed — read `src/w3d/take.ts` (WORDS: {t, at, end}).

## Origins (world)
store set (hook, jcp, line) [0,0,0] · farm [300,0,0] · gas [600,0,0] · yard [900,0,0] · diner [1200,0,0] · shares [1500,0,0] ·
vault [1800,0,0] · lehman [2100,0,0] · will + pavilion [2400,0,0]
