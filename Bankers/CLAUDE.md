# BANKERS — account rules (`Bankers/CLAUDE.md`)

This file sits in the `Bankers/` folder of the shared video project. The root `CLAUDE.md` serves
the other accounts (100bps, offcamcelebs and more).

- **For anything inside `Bankers/`, this file overrides the root file.**
- The root file's PROCESS rules still apply unless this file says otherwise: never render unless
  asked, the VO pipeline, dB-measured mixing, guards, verification, and handback via Studio + tunnel.
- Read this file and `Bankers/Resources/` before every Bankers build.
- **★★ THE AUTHORITY ON LOOK IS `Bankers/STYLE.md`** (Timur, 2026-09-28: "There need to be rules about almost
  everything, and they need to be detailed so that you don't change the style over time"). It holds the measured
  spec: palette, type sizes, solids, FG pieces, camera, motion, sound and the close. The canonical engine is
  `Bankers/Resources/kit/`, copied into each video unchanged. `node Bankers/Resources/stylecheck.mjs "<video>"` must
  end CLEAN before every handback. §2 below keeps the history and the reasons; where it and STYLE.md differ,
  STYLE.md wins.
- **★★★★ START EVERY BUILD FROM THE DEMO: `Resources/visual-vocabulary.md` → "DEMO ANCHOR"** (Timur, 2026-10-13, Video 10 brief:
  "the original Bankers style demo … had the best visuals and animation of anything we've made. Recent videos drifted away from
  it."). `Bankers/Demo/` is the primary visual reference, ahead of every later video: re-render a few of its frames first, match
  its world, compose new shots in its family, and retire flat UI props (document and quote cards, phone mockups, stamps,
  split-flap rows, poll pills). The frame test for every scene: would it sit comfortably inside the demo?
- **★★★ EVERY RENDER IS GLITCH-CHECKED ON THE RENDERED FILE ITSELF, BEFORE IT IS HANDED BACK** (Timur, 2026-10-18, Video 12: "render,
  always ensure that there aren't any glitches in the rendered version"). The Studio and fresh stills are not the deliverable: Video 11's
  tray labels and "$" marks glitched only in the MP4. After every render, on the MP4:
  - decode EVERY frame and run the pop scan and the flash check on the decoded frames (`popscan.py` / `flash.py <folder>`): a vanish, a
    pop or a one-frame flash in the file;
  - compare the MP4 with FRESH stills of the same frames, grabbed by frame NUMBER (`mp4check.mjs`, 48-px tiles): anything the render drew
    differently, across the whole film;
  - check the specs, the audio (no clipping) and the post-voice tail.
  A master that fails is renamed `…_v1_<fault>.mp4` (never deleted), fixed, and rendered again; it is never handed back with a glitch.
- **★★★★ FROM VIDEO 38 (2026-11-25) THE CURRENT STYLE IS "THE BANKERS 3-D WORLD" (section below, Timur's 8 reference reels).** Where it
  conflicts with the older rules here, STYLE.md or the visual vocabulary (3-D worlds, cutaways, x-ray shells, machinery, real photos as proof,
  karaoke captions, chips with leader lines), the 3-D World section wins; the Bankers logo, the blue and the fonts stay.
- **★★★ WHAT MAY BE BUILT IS `Resources/visual-vocabulary.md`** (Timur, 2026-10-09, Video 8 revision: charts, big numbers,
  simple primitives and text-only beats; never maps, machinery, weather, liquids, cutaways or particle showers; ≤ 3 objects
  per scene). It applies to every Bankers video and supersedes the older "realistic hero objects" rules.

> **Rewritten 2026-09-25 at Timur's instruction:** "everything else should stay the same way it
> is with 100bps." The client's original rules file is archived verbatim at
> `Archive/2026-09-25 first style (superseded)/CLAUDE-original.md`. §6 lists what changed from it.

---

## ★★★ 2026-11-22 — READ FIRST: CONTENT.md, THE RECOVERY, AND WHERE THE PROJECT LIVES
- **Content (ideas, scripts, VO, captions, structure): see `Bankers/CONTENT.md` — authoritative for content; `STYLE.md` stays
  authoritative for the look.** (Handoff of 2026-11-22: the separate Bankers content chat is closed; its Parts 1–9 live there.
  Where this file repeats a content rule, CONTENT.md is the one copy that counts.)
- **★ THE PROJECT LIVES IN THE GIT REPO** `aperturemotion/bankers`, branch **`bankers-project`** (Timur, 2026-11-22: "Push."). On
  2026-11-22 the cloud container was replaced and everything outside the repo was lost: this file's and STYLE.md's content from
  Oct 23 → Nov 22, `Videos/log.md` rows 17–35, the Video 17–34 project folders and every tool written after Oct 23. **Commit and push
  after every piece of work** (LFS for mp3/wav/mp4/png/jpg/webp/zip; `node_modules/` and `out/` never go in).
- **Restore in a fresh container:** `cd /home/user/bankers && git fetch origin bankers-project && git checkout bankers-project &&
  git lfs pull`; `mkdir -p "/home/user/Video editing project" && ln -s /home/user/bankers/Bankers "/home/user/Video editing
  project/Bankers" && ln -s /home/user/bankers/workspace-CLAUDE.md "/home/user/Video editing project/CLAUDE.md"`; Videos 9–16,
  Archive, Demo and Style frames come from `Bankers-migration-2026-10-23.zip` (unzip, then copy those folders in); `npm ci` in the
  video folder; Chrome needs the proxy shim (`scratchpad/chrome-proxy.sh`, see Video 35's scratchpad — or pass
  `--browser-executable=scratchpad/chrome-proxy.sh`); ffmpeg links in `/home/user/ffbin`.
- **What the recovery rebuilt (2026-11-22):** Video 35 "Lottery Tear" from its published Studio bundle — 88 source modules
  (transpiled JS with `// @ts-nocheck`; TS types lost; 186 webpack renames undone, map in `recovery/`), `public/` byte-exact
  (vo, bed, brand from the bundle; sfx + bill100.png from 100bps Style 3 V46 in `100bps-reference.zip`, proven identical), the V46
  Style 3 tool chain re-pointed to `LotteryTear` (render/still/frames/cuedump/geom_sweep/motion/sfxends/sfxgaps/audit/mp4check/studio
  work; stylecheck, popscan_ok, divergences and V35's bed settings were lost). It renders pixel-identical to the published film.
  **New videos clone Video 35.**
- **The kit since Video 27:** the 100bps Style 3 (V46) kit with the Bankers pass (metallic blue-steel objects on navy; the white
  stage for one light frame + the close), places with action cameras, own/crane/pushLight hand-overs, two flares, two LightBreaks,
  hero cards, the question as tracking text, the BANKER$ close.
- **Process (as of Video 35):** fact-check every line at primary sources → the take (ElevenLabs "Jon – Calm Presence", voice_id
  `enzbGixeo55iqn1QxbbC`, eleven_v4, generated ONCE — ⚠ CONTENT.md Part 4 says Timur records; see the conflict list) → Scribe
  words → trim with holds → captions → places built by parallel builders in private mirrors → integrate → checks (tsc, audit,
  render guard, cuedump, sfxends, sfxgaps, full-film geom_sweep every 3 f, frames + motion, popscan, flash) → publish the Studio
  artifact and republish the SAME one after every change. **Never render unless Timur says "render".** Check the MP4's own frames
  before handing over (Video 35's first render had a see-through cash column only the MP4 frames showed).
- **Song rule:** the previous film's song unless Timur names one; a new song is matched AS HEARD to the bed it replaces. Song by
  video through Video 34: the Bankers Song Shelf https://claude.ai/artifact/KiEAxwjT2zAsHDgg5MWD5d (V35: Radiohead, as V32).
- **Studio artifacts:** V16 https://claude.ai/artifact/J8X1HPKDaP1sEMVr28z5Fi · V17 https://claude.ai/artifact/HhmXZXtaj79ptDtBVSetTi ·
  V18 https://claude.ai/artifact/Sgefu6iN3iCkLNH7ak6UCz · V19 https://claude.ai/artifact/PMy9eqdbHK3HBoxgQcGKXx ·
  V20 https://claude.ai/artifact/MvubnZ1wYB9t3o8TnzV6xy · V21 https://claude.ai/artifact/CqNZNvGuxxcKgBunrFYXoN ·
  V22 https://claude.ai/artifact/V8CAuoya25wzA8r7LscC7d · V23 https://claude.ai/artifact/D9xhvxkp3UgeSnHdKFzVAj ·
  V24 https://claude.ai/artifact/F8utaEVdNkvWirEEECMfKf · V25 Tesla https://claude.ai/artifact/7idziwzhn2rET89u4kvHpi ·
  V26 Nine Sectors https://claude.ai/artifact/7XpXySsp9YcnLthAgVdLUE · V27 https://claude.ai/artifact/Vpkt85WmHJFj2C97dhfyEp ·
  V28 https://claude.ai/artifact/4SaBVnRUuG5AaMYfa4LXnK · V29 https://claude.ai/artifact/MT4AF5rsjS2JQkDYadT79Z ·
  V30 https://claude.ai/artifact/2BpnwhEcS3Qd3mm3PSyxTU · V32 https://claude.ai/artifact/Hp4vdxoM2GojKkBCEr92Rz ·
  V33 https://claude.ai/artifact/CVgsqdzcu6h5sBdu6EweSS · V34 https://claude.ai/artifact/S5jow7Rp4xhhUKHECBKzLC ·
  V35 https://claude.ai/artifact/LAo7r5cN97oHuiMqsPDu8A · V36 Bre-X Gold https://claude.ai/artifact/YDB51b6K1wcmNPX6VxHfd2 (rendered version: vial rebuilt, Me And The Devil, v4; master in the video folder's delivered/). · V37 Theranos https://claude.ai/artifact/TvttwWBRAsneWWnKDt4weY (v5: revision 4 — the whistle scene rebuilt; RENDERED again 2026-11-25 as delivered/…_v2.mp4, v1 superseded). · V38 Selbees Lottery (the first 3-D World film) https://claude.ai/artifact/3Hkw7MMXkcu49YqR6AiRCK (v2: the draft RENDERED 2026-11-26 → delivered/…_v1.mp4; not handed in). (There is no Video 31.) Each Studio's bundle holds that film's compiled code
  — the way to recover a lost film.
- **The Worker app numbers Bankers per contract:** "Video 2 of 15" = Video 35 (the lottery reel); "Video 3 of 15" (Bre-X, due Nov 24)
  is the next; "Video 4 of 15" = Video 37 (Theranos, due Nov 25 — moved from Nov 26 in the app). The daily 06:00 Moscow routine (CONTENT.md changelog) checks it.
  ★ **Already started? (Timur, 2026-11-25):** Timur may start the next video himself before its due date (e.g. on the 25th for a piece due the
  27th). Before building any piece, the routine checks Bankers/Videos/, log.md and the Studio list for a video in progress and compares its
  idea (PLAN.md / VO_SCRIPT.txt) with the piece's script in the app. If they match, the video is in the changes phase: the routine builds
  nothing new, regenerates no voiceover, and only reports where it stands and acts on his notes. If a match is unclear, it asks him.

## ★★★★ 2026-11-25 — THE BANKERS 3-D WORLD STYLE (the current style, from Video 38 on)

> **Timur, 2026-11-25:** the client asked to experiment with new styles to get more views. He sent 8 reference reels (a 3-D explainer
> channel, "SizedUnderstood") and said: *"examine them with great detail, and copy their style … what visuals they use, what background …
> which kind of visual it uses, what is the structure, where it uses specific visuals, where it uses real footage … what kind of animation …
> the new style has a main accent on 3D visuals and like a 3D world and atmosphere … all of the scenes should be in that style … but the
> main rules of the bankers should be kept"* — keep the Bankers logo (the bottom watermark and the end), the main colour BLUE ("really,
> really important") and the fonts. **Every scene of a new video is in this style; never a mix of the old and the new.**

**Where the evidence is:** `Resources/style-3d-world/` — `R1.md … R8.md` (per-reel, beat-by-beat breakdowns: timeline, transitions, overlays,
captions, look, real footage, pacing, audio, with measurements), `ref_R*_overview.png` (a frame every 3 s of each reel), `ref_captions.png`,
`ref_overlays.png`, `ref_detail.png`. The 8 reels: R1 Mercedes headlight (night road), R2 Microsoft undersea data centre, R3 COMAC electric
plane, R4 GTA 6 preload/servers, R5 Lamborghini V12 gearbox/e-motor, R6 Spanish train crash (LZB), R7 USB-C $10 vs $69, R8 traffic-light
induction loop. All 720×1280 at 30 fps, 63–98 s, −14.1 LUFS.

### A. KEPT FROM BANKERS (non-negotiable)
- **The logo:** the 30 % Bankers watermark at the bottom of every frame (§2.5.4) and the **BANKER$ close** at the end (§2.4). The references'
  "Follow" card is NOT copied — the BANKER$ close replaces it.
- **Blue is the main colour.** The references' single accent is lemon yellow (#F5FB14); in Bankers it is the **light blue** (`#7FB4F2` on
  overlays, `#B3CEEF` / `#4D8ED9` for glows in 3-D). The world is lit at **blue hour / night in the Bankers blue family** (cool key
  `#DCE8FA` from the upper left, navy hemisphere fill, pale-blue rims, navy fog `#0A2A52`, a sky from navy zenith through the logo blue to
  a pale horizon glow). Warm colour only in small practical lights (lamps, lit windows) and real objects' own small accents; red only for a
  failure/suspicion (the references' rule too); green only for money added.
- **The fonts:** captions and labels in **Figtree** (the house subtitle face — close to the references' geometric sans), big figures in
  **Anton**, the hero accent word in Instrument Serif italic.
- Content rules (CONTENT.md): fact-checked lines, dates never relative, no advice, no bias, no AI images of real people, real photos only
  credited, labels ≤ 4 words, figures only from FACTCHECK.md.

### B. THE GRAMMAR (copied from the references; measured)
1. **One continuous voice-over over ONE 3-D world.** No title card, no intro: frame 0 is already the hero 3-D shot with the first caption
   word. The voice runs to ~0.7 s before the close. Story shape: surprising claim (0–5 s) → proof it is real (a named product/place, a
   photo) → the mechanism in 3–5 steps, each with its own picture → a twist at ~55–65 % ("But why…?") → numbers/caveats → a one-line
   payoff that CALLS BACK to the opening image.
2. **A new visual idea every 2.2–3.3 s** (27–38 per film): a new framing, a reveal, a new object, a label, a counter. Every new sentence gets a
   new picture within ~0.5 s. A new label or counter every 1–2 s.
3. **The camera moves 70–90 % of the time:** slow, smooth push / dolly / orbit / follow / crane (≈ 2–15 % of the frame per second),
   eased; 0.2–1.2 s quick travels only between ideas. No static hold over ~4 s unless something in frame is animating.
4. **One world, one hero model, "home base" shots** that recur 3–5 times. Every explanation happens ON or INSIDE the real object:
   cutaways, **x-ray glass shells**, exploded views, macro close-ups, top-down diagram views of the same world, mass instancing for scale,
   everyday metaphors (balance scale, taxi meter, padlock and key).
5. **The signature reveal:** solid object → its shell turns to clear glass in 0.15–0.4 s (white rim light) → the camera pushes inside → a
   cutaway / exploded view → the active part GLOWS in the accent → a label → a counter → pull back.
6. **Transitions:** mostly continuous camera through the world, or a 0.2–0.5 s dissolve; 2–4 signature moves per film (push THROUGH an object
   into its inside; a shell turning to glass; through a boundary like a water surface or haze; real footage match-dissolved into the same
   composition in CG; an object morphing/folding into the next). Hard cuts only when motivated (a flash, an object passing the lens) —
   in our engine a push INTO a surface that fills the frame lands on a matching close-up (`cut: true`).
7. **Look:** clean, stylised-photoreal CG (real proportions and real logos, simplified detail, no grime); soft low-contrast key with
   haze/fog for depth, mild bloom on everything emissive, depth of field only on macros, a strong vignette, the lower 25–30 % of the
   picture pushed dark for the captions. One world, one light, one time of day per film (or per place). One saturated hero colour on a
   desaturated world.
8. **People:** rare and stylised in the references (hard hat, sleeves, disembodied hands). **In Bankers: none modelled** — real people appear
   only as credited real photos.

### C. THE CAPTION (karaoke — `src/w3d/karaoke.tsx`)
- Centred; a one-line chip's centre at **68–70 % of the height (≈ y 1310–1345 at 1920)**; two-line chips grow upward; never more than 2
  lines; max line width ~62 % W.
- Figtree ~56 px at 1080 wide (the references' 36–40 px at 720). **Word by word:** each word fades in (~0.1 s) on its voice onset; the
  CURRENT word is white bold, SPOKEN words grey regular (~#9AA6B6), FUTURE words hidden.
- Each line on its own dark translucent pill (black ≈ 70 %, radius ~9 px, padding ~12 px).
- **One keyword per chip** (a number, the noun being explained, or the twist's verb) inside a 2–3 px outline box with two filled dots
  on its top-left and bottom-right corners — in the Bankers light blue, not the references' yellow.
- Chips of 1–6 words (median 3), on phrase boundaries, ~0.6–2 s each; numbers shown as numerals ("$3,600", "1,900", "2011").

### D. OVERLAYS (`src/w3d/overlays.tsx`)
- **Safe zones:** panels, counters and photo cards in the **15–35 % height band (y ≈ 290–670)** with 3–9 % side margins; nothing in the
  caption band (y ≈ 1180–1460); keep the top ~220 px clear of text (Reels UI).
- **Labels (`Tag`):** small caps (Figtree 700, ~24–30 px) on a dark chip (~90 %), a 3–5 px left accent bar, a 1–2 px white leader to a
  6–8 px ring on the tracked 3-D point (projected through the live camera every frame); in over ~0.2 s on the spoken noun, hold 1–5 s,
  fade out. Bar colours code meaning: light blue = the key thing, teal = OK/data, amber = power/speed, red = failure/limit.
- **Counters (`Counter`):** a tiny caps label above a big figure with a small unit (hero ~100–115 px, in-scene ~55–60 px); they always ROLL
  (≈ 0.6–2 s) and land on the spoken word; optional thin progress bar.
- **Running pill (`Pill`):** for cumulative stories (cost, count, time) a top-right pill that keeps a running figure for most of the film
  (R7's price counter); each addition slides in as a "+$N" chip.
- **Real photos / footage (`Inset`):** only to PROVE something is real (the named person, product, document), 1–4.5 s each, ≤ 17 % of the
  runtime: a 16:9 card ~92 % W at the top over the running 3-D shot, or a white-bordered card ~85 % W, with a small grey credit
  ("Photo: CBS News / 60 Minutes"). A reconstructed event gets a small persistent disclaimer pill above the captions.
- Highlight geometry: thin accent rectangles / corner brackets tracked to 3-D objects; a strike line through a debunked number.

### E. SOUND
- The references: wall-to-wall voice, tight edit, mastered at −14 LUFS (LRA ~2 LU); a soft ambient/electronic pad 20–30 dB under the
  voice; almost no sound effects (a rare swoosh or impact swell). **In Bankers the bed follows Timur's 2026-11-25 ruling** ("the song is not
  heard at all … make it louder"): the song sits ~3.5 LU under the voice and is audible on phone speakers (Video 37 rev 3); effects stay
  sparse and quiet — one soft whoosh per big camera travel, a context sound only for a visible action.

### F. THE ENGINE (`src/w3d/` in Video 38 — clone it for every film in this style)
- **WebGL through `@remotion/three` 4.0.315 + `three` 0.169 + `@react-three/fiber` 9.1.** Headless Chrome renders it with SwiftShader
  (`chromiumOptions: { gl: "swangle" }`), ~7–9 s per 1080×1920 frame; render single-tab, plan 4–6 h for a full film.
- `kit.tsx`: `World3D` (ACES tone mapping, sRGB, soft shadows, a RoomEnvironment for reflections, FogExp2), ONE camera for the film
  (`makeCam(shots)`: `{a, b, pos, target, fov, arc, cut}`, smootherstep, a tiny drift), `projectWith` (the same camera maths for the HTML
  overlays), `HouseLights` (the Bankers key/fill/rim), `Sky`, `Glow` (additive light sprites), `canvasTex` (print and signage drawn on
  canvas with the house fonts), `rnd`.
- `Main.tsx` + `stations.tsx`: the film is a list of STATIONS (each a place in the world at its own origin, mounted only around its
  frames: `{id, origin, from, to, shots(), Scene, Overlay, sfx()}`); the camera path is all stations' shots in order; the karaoke, the
  watermark, the BANKER$ close (the camera lifts into the sky as the world dims) and the audio sit on top.
- `take.ts` (generated by `scratchpad/caps38.py` from the take's Scribe words): WORDS, CHIPS, SENT, `wf(word)`; every action keys to a word.
- Stills: `scratchpad/still38.mjs`.
- **Render: `scratchpad/render38.mjs`** (60-f muted h264 chunks, resumable, then an audio-only wav pass and a mux). Measured ~2–4 s/frame at
  concurrency 2 (≈ 1.5–2 h for 77 s). ⚠ The audio pass must pass `composition.props.solo = "audio"`: `inputProps` alone left the
  composition's resolved props on "picture", so it rendered the WebGL picture for 30 min and would have written silence.
- **★★★ NO GREY PLACEHOLDER LINES — REAL TEXT ON EVERY PRINTED SURFACE (Timur, 2026-11-26, V38 rev 2: "Again, gray lines appear.
  Please don't do that … let's add some rule to the bankers … to not use basically the gray lines. You use actual text when filling up").**
  Brochures, newspapers, reports, certificates, labels, receipts, screens: real, legible, plausible text in real typography (headings,
  body columns, small print, tables) drawn with `canvasTex` at ≥ 2048 px on the long side where the camera gets close — never bars,
  blurred strips or lines standing in for text. The words are facts from FACTCHECK.md, generic rules text or neutral description
  (no invented quotes, no invented figures).
- **★★ DETAIL, EVERYWHERE IT RECURS (Timur, same note):** every object is built "a lot more detailed … more realistic … more
  eye-catching" (houses, shop interiors, machines, cars, tubs, paper); and a detail fix applies to EVERY scene where that object
  appears again ("if the visuals come up again in the video … do them also the same exact"). Money is the real US note
  (`public/bill1.jpg`, the public-domain $1 scan) on every bill in the film.
- **Tags pinned to a station must leave BEFORE the camera flies off it** (V38: the balance's tags and RIGGED? hung over an empty floor,
  leader lines to nothing, for ~10 f). Key a tag's `out` to the next station's flight start, not to the word's end.

## 0. What this account is

- **The page:** short-form vertical videos for **Bankers — @bankers** (~361K followers, Sept 2026).
  Bankers is a client of Aperture Motion.
- **Platform and volume:** Instagram Reels only, 15 videos a month.
- **Subject:** headline events in banking, finance, the stock market and individual companies.
  - Each video is a **news post**: one current event carrying one evergreen teach.
  - The client's named interests:
    - what the big banks are doing (JPMorgan etc.)
    - rate decisions and FOMC meetings
    - upcoming market events
    - new IPOs
    - major companies, public or private (e.g. OpenAI)
- **Audience:** men aged 20–50 who invest in the stock market.
- **Currency:** always US dollars ($). US markets by default.
- **Tone:** clean, polished, calm and educational. No hype, no alarm, no cynicism, and **no bias of
  any kind** (§5).
- **Client goal:** a consistent ~30K views on every reel within three months.

## 1. Division of labour

- **The content chat** writes content-only prompts: hook, story, script, facts, and what appears on
  screen.
- **You own every visual decision** within §2: layout, pacing, transitions, camera. If a prompt
  seems to give a style instruction, treat it as intent, not spec.
- **Timur produces the voiceover himself** and hands you the audio file. Run the root VO pipeline
  on it.
  - **★ Since 2026-10-18 you may make it yourself** (Timur: "you have access to elevenlabs now, if I need a voiceover you can generate
    and implement it yourself"). Generate it with ElevenLabs from the FINAL corrected VO_SCRIPT.txt, in the account's voice (Video 12:
    "Jon – Calm Presence", picked from the voice list, never from memory). Then run the same VO pipeline, guard and mix on it. Say in
    the handback that the take was generated, with the voice and settings.
- **Revision prompts** come as LOCKED / CHANGED / DIAGNOSE FIRST. Touch only what is listed under
  CHANGED, and diagnose before editing.

---

## 2. THE LOOK — 100bps Style 3, exactly, with four swaps

> **Since 2026-09-28 the spec is `Bankers/STYLE.md`**, measured from Video 1 plus Timur's notes. This section is
> the history it grew from. Where they differ, STYLE.md wins.

**A Bankers video IS a 100bps Style 3 video.** Everything is kept as 100bps does it, and the same
authorities apply:

- the spec at the top of root `test/resources3/style3-preferences.md`
- the newest Style 3 build in the active look (V25 onward; currently Style 3 Video 26)

That covers the scene grammar, the 3D constructions, the `Turn` arcs, the key light and its
per-scene blend, the caption chips, the hero sentences (fly-through-the-lens, the ladder, the push),
the section flashes, the white story beats, rack focus, pacing, the SFX families, and mixing.

**Four things change (§2.1–§2.4), plus Timur's own additions in §2.5.** Since 2026-09-26 those
additions replace 100bps' camera and beat transitions with the journey camera (§2.5). Risers were tried
the same day and are banned (§2.5.3).

### 2.1 Colours — anchored on the LOGO BLUE, `#005DC8`

> Timur, 2026-09-25: "make the video theme a little bit lighter, since the blue that they have in
> their logo doesn't really match the blue there is during the video, and I need that blue to be
> present in the video itself … and black doesn't really fit that well with the kind of blue that
> they have."
>
> This supersedes the first spec (background `#000000`, blue `#6682D8`). The white `#FFFFFF` is
> kept.

| Role | Value | Derivation |
|---|---|---|
| **The logo blue**, the anchor | **`#005DC8`** | the client's own logo file |
| Ground (replaces black) | **`#001C3C`** | logo blue 70% toward black; white on it is 17:1 |
| Ground lift, under the key light | `#003470` | logo blue 44% toward black |
| Light (key cone, rims, glows, accent word) | **`#4D8ED9`** | logo blue 30% toward white; 5:1 on the ground |
| Hot core | `#B3CEEF` | logo blue 70% toward white |
| Deep beam | `#002F64` | logo blue 50% toward black |
| White | `#FFFFFF` | |

100bps is black and grey: a platinum key light, platinum accents, and grey chrome, text and lines.

- **Every grey becomes the logo blue's family.** Hard-coded or tokened, each is mapped by its
  lightness onto the ramp black → `#005DC8` → white:
  - a grey darker than the logo blue becomes a shade of it;
  - a lighter grey becomes a tint of it;
  - so the solids, bars, dials and candles are all the logo's own blue.
- **Pure `#000000` and `#FFFFFF`** in source stay as they are.
- **The ground is set by hand**, not mapped: navy, never black.
- **Light is a tint**, because `#005DC8` is too dark to read as light on the navy.
- **The mapping is code, not judgement:**
  - `bk()` in `Resources/bankers-palette.mjs` does the mapping.
  - `apply-palette.mjs` runs it over a cloned Style 3 source folder.
  - The theme is generated from the `BANKERS` tokens (the demo's `scratchpad/mktheme.mjs`).
- **Red:** 100bps' red (its one colour, used for negative states) stays exactly as 100bps uses it.

### 2.2 White-themed scenes

- **The stage:** 100bps' light stage (`#e8e8e8`) becomes white with a **slight tint of the logo
  blue**: `#EBF2FB` (8% `#005DC8`), with a lift of `#F5F9FD`.
- **Ink on it:** the navy ground, `#001C3C` (15:1). Not black.
- **Unchanged:** the number of white beats, their dissolves, and the caption ink swap all stay
  exactly as in 100bps.

### 2.3 Font

- **Built-graphic text** (the figures, the labels, the object text) is **Anton, weight 400**. This
  was already 100bps' face for it.
- **Subtitles stay exactly as 100bps does them** (Timur, 2026-09-25: "the subtitles should stay the
  way they were with 100bps, maybe except for the font if their proposed font looks good"). That
  covers the caption chips and the hero sentences: size, position, the ladder, the fly-through-the-
  lens entrance, the push, and the accent word's scale jump and gradient (in the blue family, §2.1).
- **The subtitle face is 100bps' own, NOT Anton** (Timur, 2026-09-25: "don't use their font for
  the subtitles, use the 100bps one, even in the next? part where the text should be that 100bps
  cursive sort of font").
  - Caption chips and hero sentences: **Figtree**, at 100bps' weights.
  - The hero's accent word: **Instrument Serif italic**, 100bps' "cursive" accent, with its scale
    jump and gradient (the gradient in the blue family, §2.1).
  - In `fonts.ts` this is `SUBTITLE_FACE = "figtree"`.
- So Anton is for built-graphic text only, which is where 100bps already uses it.

### 2.4 Logo

- **Where it goes:** the Bankers logo replaces the 100bps wordmark wherever 100bps shows its own
  brand, which is the outro.
- **The outro** is 100bps' `BrandClose` exactly (the blue halo, the scale-in, the position), with
  the Bankers logo in place of the "100bps" wordmark.
  - Timur, 2026-09-25: "keep the 100bps outro with bankers instead, I'll adjust it later."
  - **The outro's BANKER$ is filled with a gradient in the logo blue's family:** `#FFFFFF` at
    the top, through `#B3CEEF`, to `#4D8ED9` at the foot. Around it is a `#005DC8` glow, with one
    specular sweep and the mirror floor.
    - Timur, 2026-09-25: "make the bankers text at the very end the right color, look at their
      logo reference image". Then: "change the bankers text in the end to be more visible
      considering the background is almost the same color".
    - Flat `#005DC8` letters sat at 2.8:1 on the navy.
    - The supplied file's shape is used as a mask, so nothing is redrawn.
  - **Centred in the frame, and lit** (Timur: "center the bankers in the very end, and make it look
    sort of better and shinier in a way like you do with 100bps").
- **Logo files**, in `Resources/brand/`:
  - `bankers-logo-white.svg` on dark
  - `bankers-logo-black.svg` on the white stage
  - `bankers-logo-original.svg` is reference only
- **Logo rules:**
  - never redraw, stretch or outline the logo
  - no recolouring or effects, EXCEPT the outro's gradient fill, glow, sweep and reflection above, which
    Timur asked for
  - never separate the hand mark from the wordmark
  - never type "BANKERS" as a stand-in for it
- **No 100bps branding ever appears** in a Bankers video: no "100bps" wordmark, and no "Follow for
  more market breakdowns". If a take says the latter, cut it from the audio and the captions.

### 2.5 Timur's changes on top of 100bps (from the demo, 2026-09-25 → 26)

These are the only deliberate departures from 100bps. Each is Timur's instruction, recorded as he
gave it.

> History: on 2026-09-25, BIG animated captions with parallax and A → B travel were tried and FULLY
> UNDONE at his instruction. On 2026-09-26 he asked for the journey below, with captions at their
> NORMAL size. The journey is the standing rule. The big captions stay undone for ordinary lines;
> the closing question now gets TRACKING TEXT (§2.5.2), which he asked for to practise it for future
> videos.

#### 2.5.1 ★ ONE CONTINUOUS JOURNEY (Timur, 2026-09-26)

> "The video is one continuous journey. A virtual camera travels from point A to point B to point
> C; every scene is a place the camera arrives at, never a cut."

- **Depth layers in every scene:**
  - FG: sharp, large, and cropped by the frame edge.
  - MID: sharp; this is the construction.
  - On every camera move the layers travel at different speeds, so the parallax sells the depth.
- **★ NO BACKGROUND SHAPES, EVER (Timur, 2026-09-26: "I don't want those blurred shapes in the
  background. Remove that completely").**
  - The BG layer was deleted: the distant candles, the street of homes and the colonnade.
  - Behind the MID there is only the field and its key light.
  - Nothing sits blurred behind anything.
- **The engine is `Demo/src/demo/world.tsx`,** a pinhole camera over flat layers:
  - Each scene has a STATION, the camera position it is authored for.
  - Its layers sit at rest distances FG 0.5 and MID 1.
  - A layer at distance D draws at scale R/D, shifted by −Δ/D. The parallax is therefore geometry:
    FG moves 2× the MID.
  - **Defocus happens ONLY rushing PAST the lens** (`nearAt`).
  - **Going FAR, a layer FADES in instead of blurring** (`far`, per layer): a place the camera
    arrives at fades in as it nears. **That distance fade is an ENTRANCE only** (`farUntil`).
- **★ NO FADE-OUT TRANSITIONS (Timur, 2026-09-26: "no fade out transitions make them seemless
  directional ones instead").**
  - Everything leaves by MOVING out of frame: the tape slides off, the bars and the house rush past
    the lens, the Fed sinks out through the bottom, the arrows fly out, the question lifts out
    through the top, and the watermark sinks.
  - An opacity cut is allowed only after the thing is wholly off-screen.
  - This supersedes his earlier "when the camera is zooming out fade the pillars and valve out".
  - Set each `far` window wide enough that the fade lasts ≥ 10 f. The Fed columns once popped in
    over 3 f, and Timur saw it ("the pillars just sort of appear out of nowhere").
  - **Push-past handovers use a RACK FOCUS.** The outgoing MID racks out of focus (`nearAt` eased
    up over 8 f, from just before the push), and only then does the incoming MID come up out of
    depth behind it. That way they share ≥ 15 f without two sharp things ever touching.
  - Clone it; do not hand-tune per-layer speeds.
- **The camera path is a list of eased MOVES** (`MOVES` in `Demo.tsx`). A station is the camera's
  position at the end of the move that arrives there.
  - Every move is `rInOut` (a travel) or `rOut` (a settle), never linear.
  - An idle drift on x, y and z keeps the layers parallaxing while the camera holds.
- **Scene changes are camera moves through the layers,** one of three:
  - **push forward** past the foreground;
  - **slide sideways**, the layers parallaxing out one edge and in the other;
  - **crane**: the camera rises (or falls), so the current place sinks out through the bottom edge
    while the next one comes down from the top. It is one move, so FG pieces of the two places stay a
    fixed 2 × distance apart. The demo's Fed → question uses it, because a zoom-out converged the
    columns onto the dial and the arrows.
  - A **pull back** remains possible only if nothing converges into a collision and the outgoing
    place still leaves the frame by moving (never shrinking into a background).
- **Overlap:** outgoing and incoming scenes are on screen together for at least 0.5 s (15 f).
  `scratchpad/sweep.mjs` measures it per transition and refuses under 15 f.
- **Never a panel wiping in from any edge to change scene.**
- **FG placement:**
  - On a sideways move, the outgoing scene's FG sits on the side it LEAVES from, so it exits first
    and never sweeps across the construction. The incoming scene's FG sits on the side it arrives
    from.
  - At rest, FG stays clear of its own MID text, the caption slot and the bottom logo.
  - **FG arrives with the camera, out of depth, never by a sideways slide of its own** (Timur,
    2026-09-26: "the pillars shouldn't come in from the side, it makes their animation too
    rigid").
  - A pinhole-projected FG converges on the centre when far, so keep it invisible until it has
    spread clear of its MID: the Fed columns only show within 2.45× of their rest distance.
  - **An outgoing scene never touches the incoming scene's objects** (Timur: "the clock visuals
    with the pillars intersect the next scenes visuals").
- **Sharp against sharp is still a defect.** The zero-intersection rule stands (Timur, 2026-09-25:
  "the stopwatch intersects the bars, that is not ok").
  - Objects may pass in DEPTH, meaning one is defocused (≥ 4 px) behind or in front of the other.
  - Two sharp objects never share pixels. The sweep counts only sharp items for CROSS.
- **Every asset enters from an edge or from depth, and leaves the same way.** It is eased in and
  out, never linear, never snapping (Timur, 2026-09-26: "everything needs to have a smooth
  transition").
  - **Nothing may pop.** A growing solid's extrusion grows with its height and fades up over its
    first 12% of travel. A mortgage bar once appeared with its full cap and side in one frame:
    "the bar for the second scene also just sort of pops in".
  - Nothing switches on a threshold either: dial ticks light by a blend as the needle reaches them.
  - Figures and labels use `fromDepth()`.
  - Constructions arrive with their station.
  - The bottom logo rises in from the bottom edge and sinks back out.
- **Pacing: hold on the hook before the first move** (Timur, 2026-09-26: "add some waiting time on
  the first scene before transitioning to the next").
  - `captions_vo.mjs` inserts `VO_GAP` (24 f) of silence into the take in the pause after sentence
    1.
  - **★ The cut point comes from the WAVEFORM, never the transcript** (Timur, 2026-09-26: "cut the
    VO better because I hear the beginning of mortgage rates at around 2 seconds").
    - whisper put "Mortgage" at 2.50 s; the voice starts it at 2.24 s, so a transcript-midpoint cut
      sliced the "M" onto the first piece.
    - The script finds the silent run (≥ 40 ms under −50 dBFS) and the next onset (> −40 dBFS),
      cuts on a frame inside the silence, and moves a late word to its measured onset.
    - It REFUSES a cut outside the silence. This was proven by putting the old cut back.
  - `Demo.tsx` plays the WAV in two pieces around `VO_CUT`, and every later cue moves with the
    voice.
  - The first slide starts 15 f before sentence 2.
- **Nothing is ever static.**
  - Holding elements drift slightly: each FG piece has its own idle periods, and the MID keeps its
    `Turn` arc.
  - Several things are always mid-motion at different phases.
- **★ JOURNEY LESSONS FROM VIDEO 1 (2026-09-26; 11 places, each proven by the sweep):**
  - **Cranes fight the caption slot.** A place craning in from above crosses y 261–321 while a chip
    is showing, and one leaving through the top does the same.
    - Prefer pushes and slides. Crane only across a pause with no chip on screen.
    - A crane arrival's FG must sit on the side it comes from (top for a crane up). Otherwise, moving
      at 2×, it sweeps across its own MID.
  - **Every place brings its BASE with the camera:** the axis, the plinths, the logo, the tile floor.
    - Constructions cued only to their spoken words arrive EMPTY, and the half-second overlap
      collapses. Video 1's first sweep had six handovers under 15 f.
    - The spoken cues then light, grow and label what is already there.
  - **Slide distance ≥ the constructions' width + margin** (1,020 px for ~880-px MIDs). Two places
    at the same depth slide at the same speed, so they keep a fixed gap. The outgoing one is also
    wholly off-screen before it unmounts (560 px let the chart slide onto the memory module).
  - **Pushes take 44 f** (the question's took 56 f: the takeaway's wide plinths leave the frame
    fast); slides take 40 f.
    - A pushed-in MID uses far [1.8, 2.8]: it shows faint and small from the push's start. That is
      safe because the outgoing MID has already racked out.
    - A pushed-in FG uses far [1.3, 1.9], or later where its pinhole path converges onto its MID
      (the takeaway's bill used [1.15, 1.45]).
  - **The place table is the spine** (`PLACES` in `Video.tsx`): id, how the camera arrives
    (push / slideR / slideL), when (a sentence start from the take), and white or not.
    - Moves, stations, overlaps, rack focus, white dissolves, key lights and swooshes are all derived
      from it.
    - Each place's MID and FG live in `places/` and `fg.tsx`, wired by `places/registry.tsx`.
    - **Clone this structure for Video 2.**
  - **CSS 3-D walls:** with the origin on the shared edge, a floor object's side wall is
    `rotateY(-90deg)` and its front wall `rotateX(90deg)`. `rotateY(+90deg)` sank Micron's index
    column into the tiles, where it showed as a dashed line.

#### 2.5.1a ★★ EVERY OBJECT ON SCREEN NEEDS A REASON THE VIEWER GETS INSTANTLY (Timur, 2026-09-26, Video 1)

> "Make the micron card … more realistic. Right now it just looks like some black card, make it some item that
> is actually tied to micron." · "Change the object in the bottom right at 18 seconds to something more
> intuitive." · "Same with the shopping basket … replace it with something more connected to the context. Save
> this as a preference from now on, the reason these objects are on the screen should really make sense."

- **The test for every FG piece (and every prop):** could a viewer say in three words WHY it is there, from
  what the voice is saying at that moment? If not, it is decoration, and it goes.
- **What failed in Video 1, and why:**
  - A DRAM package drawn as a dark rounded square. It was technically "a Micron chip", but it READ as a black
    card. Replaced by a **Micron M.2 NVMe SSD**: a real Micron product with its label, contacts and parts.
  - A silicon wafer under the share-price chart. It was about chips, not about the sentence ("worth $320 billion
    … $1.2 trillion"). Replaced by an **LED stock ticker**: MU ▲ bright, JPM — dim.
  - A shopping basket for an "index-fund basket". That is a pun on a word in the brief, not the thing. Replaced
    by **the viewer's own index-fund statement**, MU and JPM highlighted among its holdings ("you already own
    both of them").
- **Literal beats clever. A recognisable real object beats an abstract one.** A product with its maker's label
  beats a generic part, and the thing the sentence NAMES beats a metaphor for it.
- It extends §0's "the real thing its lines name" and the root rule against placeholder shapes. Those ask
  whether an object is REAL; this asks whether its PRESENCE makes sense.

- **★ AND THE CORNER PIECES MUST BE WELL MADE (Timur, 2026-09-28, Video 2: "the visuals that appear either at the
  bottom right or bottom left should look better and be more detailed in general").** A FG piece is the object
  nearest the lens, so it must survive a close look. Build it like Video 1's SSD, not like an icon:
  - real construction: thickness and edges, the parts the real thing has (a receipt's thermal-print texture and
    its torn edge, a clipboard's spring clip and rivets, a wallet's stitching, card slots and fold);
  - material: gradients that follow ONE light (the key, upper-left), a specular edge, a soft contact shadow, and
    fine secondary detail (print lines, grain, reeding, screws);
  - legible, real text only where the real object carries it.
  - A flat shape with two gradients and three bars is a placeholder, and it fails the root CLAUDE.md
    placeholder rule.

- **★★ NO SCENE LASTS MORE THAN 6–7 SECONDS (Timur, 2026-09-28, Video 2: "there should be more scenes in the video,
  the audience needs to stay entertained. This doesn't mean that the video should get longer, it means that the long
  scenes should be split up into smaller ones. Don't let a scene last for more than 6-7 seconds").**
  - A place is measured from its arrival to the next arrival. A place that holds a longer stretch of the script is
    SPLIT on its sentences.
  - Each part gets its own construction, or, where the idea continues, the camera travels on to a new framing of the
    same construction, as Video 2's honest part moves from the gap to its two futures.
  - Same running time, more scenes: Video 2 went from 6 places to 12.
  - Check it on the TAKE's timings, not the provisional ones: a real read can stretch a place past 7 s.

- **★★ EVERY BANKERS VIDEO HAS REALISTIC HERO OBJECTS, NOT ONLY CHARTS (Timur, 2026-09-28: "the previous video had
  lots of those realistic visuals like gpus and stuff since it was relevant to the video. I want such scenes in all
  the bankers videos, so find some relevant visual and do the same thing").**
  - Video 1's MIDs were real things built in detail: the memory module, the AI processor with its HBM stacks, the bank
    and the chip.
  - Each video finds the real objects its lines name and makes several places around them: a gauge for a reading, a
    fuel dispenser for gas prices, a wallet for budgets.
  - Each object gets Video 1's level of construction: parts, depth, material, one light.
  - Charts still carry the numbers. The objects carry the story between them.

#### 2.5.1b ★ WHEN TWO SCENES LOOK VERY DIFFERENT, CARRY SOMETHING ACROSS (Timur, 2026-09-26, Video 1)

> "The transition at one minute and 25 seconds has an element that sort of just appears on screen, which
> isn't smooth, and overall it just isn't seamless enough due to the visuals being so different."

- It was the index (white tile floor, basket) pushing through to the takeaway (dark stage, a bank and a chip on
  plinths). Two defects compounded:
  - **The pop:** the takeaway's bank and chip sat HIDDEN behind the outgoing floor's full-frame blur. When that
    layer passed the lens and vanished, they were revealed in about 5 frames, and the $100 bill came in the
    same moment.
  - **Nothing was continuous:** a push-through is only seamless when the two places read as one world. White
    tiles to a dark hall does not.
- **The fix is a MORPH, not a push** (kind `morph`: no camera displacement, so both places share one
  coordinate space):
  - the floor DROPS away (a directional fall, never a fade) and the white stage drains with it;
  - the two company logos NEVER LEAVE: they hang as the floor falls from under them, then glide down onto the
    two plinths rising where the columns stood, recolouring with the stage;
  - the bank and chip arrive only once the plinths are up;
  - the basket drops out and the bill rises in, both from the bottom edge.
- **How it is built** (Video 1, `places/morph.ts`, cloneable):
  - **One copy of every shared number.** The morph's timings, the logos' boxes and the column-growth ramp are all
    imported by BOTH places, so the hand-over cannot drift apart. It was verified pixel-exact: the logos' ink
    boxes are equal on the frames either side of the swap.
  - **Timings are measured from the easing curve**, not guessed. On the house ease-in the floor clears the
    logo at 13 f, the plinth zone at 21 f and the frame at 26 f. The hand-over waits for the first, the plinths
    for the second.
  - **Items carried across are marked `data-probe-also="<place>"` while in transit.** The sweep's OVERLAP then
    counts them for both places (a canary proves it), and the mark comes off when they land. Unmarked, the
    count read 12 f and refused; marked for the whole scene, it read an inflated 156 f; marked in transit only,
    it reads the honest 30 f.
  - **FG pieces carry themselves through the bottom edge**, because there is no camera move to carry them. The
    outgoing piece falls WITH the floor (same displacement, so they never close on each other).
- **Rule:** before choosing a push or a slide between two places, ask what they SHARE (a company, an object, a
  number) and hand that element across the cut. If nothing is shared and the looks differ (white ↔ dark, flat ↔
  3-D), design a bridge object. Never let anything be revealed by another layer vanishing in front of it.
- Video 1 also: the EPS scene's "A YEAR AGO" / "EXPECTED" labels sit 22 px right of the $0 axis (Timur: "should
  be moved right a bit"), not flush on it.

#### 2.5.1c ★★ EVERY BANKERS VIDEO LOOKS LIKE THE LAST ONE (Timur, 2026-09-28, Video 2)

> "Recreate the hook scene completely, it doesn't look like a regular bankers video. Look at the last bankers video
> as a reference. Most of the scenes look completely different to the last video, and I don't like that so adjust the
> style until it looks like it did last video."

- ★★ Then, the same turn: "yeah this video literally doesn't look like the previous one at all. I need you to make it
  look like the previous one because thats the style that we're aiming for and need to stick to." **Video 1's look IS
  the Bankers style.** Every scene of every later video is built to sit inside Video 1 unnoticed.
- **The previous Bankers video is the LOOK reference for the next one** — not just its engine. Video 2's first cut
  kept Video 1's camera, captions and palette but drew its places as flat illustrations: a line chart on white, a
  flat pump, dashed paths, a paper receipt. That read as a different channel.
- **What makes a place look like Bankers** (from Video 1): extruded painted-face SOLIDS (`Solid`, `FIN`) on a
  `Turn` arc with a `Pool3D` floor under them; big Anton figures sitting above their solids; the blue-family
  finishes; the key-light cone on the navy ground; logos and real objects built as 3-D pieces, not line drawings.
- **A brief's content (and a mandated scene) is built IN that vocabulary.** The brief decides WHAT is on screen;
  the last video decides how it LOOKS.
- **Before handback, put a still of each new place beside the matching kind of place in the last video.** If it
  would not sit in that video unnoticed, it is not done.
- **★ THE HOOK MUST BE STRONG, and its STYLE comes from the 100bps (Style 3) hooks** (Timur, same day: "The hook
  does need to be strong, but you should take inspiration from some of the 100bps videos for the overall style of
  it"). So the hook is built from 100bps' hook grammar in the Bankers colours: one big construction centred on the
  key light, a hero figure that lands, extruded solids on their pool, something already moving on frame 0. Not a
  collage of the brief's props. ⚠ The CAMERA stays Video 1's (§2.5.1d): 100bps' slaved camera was tried on Video 2's
  hook and read as jitter.
- **★★★ AND IT HAPPENED AGAIN ON VIDEO 7 (Timur, 2026-10-07: "Overall, the video doesn't really look like the past videos that
  we've made for bankers, something is off. Its something with the visuals used and the colors I think, but I'm not sure. Compare
  this one to the previous ones, and fix it. Ensure that the full video respects the style's rules too.")** Every check was clean,
  and the film still read as another channel. Contact sheets of Videos 3–7 side by side (a frame every 2.5 s) showed why:
  - **Flat drawings instead of solids.** The teach was a flat dot grid, then a flat 2-D treemap; the honest part was thin strokes on
    empty navy; the bill was a flat pale card. Videos 3–6 build EVERY place from extruded, lit solids on a floor.
  - **Dark, low-contrast colour.** The hook's wall was 500 navy-on-navy tiles. Videos 3–6 put pale lit faces (white → `#B3CEEF`
    → `#347ED3`) with blue extrusions on the navy, so the frame reads bright and glossy; the dark is the ground, never the object.
  - **Small or off-centre constructions with half the frame empty** (the breadth bars in the upper left, the honest lines low and
    thin). Videos 3–6 centre ONE big object, ~70–85% of the width, standing on a floor at y ≈ 1300–1400.
  - **A chart that collapsed:** zero-based WEEKLY candles over 14 weeks are 10-px bodies on a 1,000-px column, so the scene
    read as a plain blue slab.
  - Rule slips the checks did not catch: completion marks mounted on a threshold (`past > 0.98 &&`), a tile colour switched at
    0.5, and the teach without a `Turn`.
  - **So:** the side-by-side comparison (STYLE §15.3) is a standing step with a tool, `Resources/lookcheck.py "<video folder>"`.
    It writes a sheet of every settled place above the last four films' places, and it is read BEFORE the handback, not after
    the user sees the film. Its numbers only report (and refuse a place emptier than anything in those films): measured, they
    could not tell the rejected build from Video 4, so the eye on the sheet decides.

#### 2.5.1d ★★★ THE CAMERA AND MOTION ARE VIDEO 1'S, EXACTLY (Timur, 2026-09-28, Video 2)

> First: "the video needs to feel more alive, it needs more movement and less parts where the camera stays still for too
> long … save that as a style preference." Then, having seen the result: "This video is absolutely terrible. Everything
> about it is wrong. Why the hell is the camera so jittery? Just make everything except for the content and some of the
> visuals the same as it was last video."

- **What made it jittery (never again):**
  - the idle float tripled (x ±14, y ±10, z ±0.02 instead of ±6 / ±4 / ±0.008);
  - a camera "beat" chained onto every sentence, so the frame lurched every 1–2 s;
  - the hook's camera SLAVED to a price series: it followed the zig-zag of the quarterly closes and jerked on every
    candle;
  - a camera jolt when a figure landed.
- **The rule now:** the camera is Video 1's engine, byte for byte (`world.tsx`, `track.tsx`: the same float, pushes,
  slides, tilts, rack focus and caption camera). Only the CONTENT and the scene objects are new in a later video.
- **"More movement" is met INSIDE the places, never by the camera.** Constructions draw, grow, light and turn on
  their words, the way Video 1's did (its candles drew, its bars rose, its tiles lit). Never add camera moves to fill
  a hold.
- **Never slave the camera to data.** A camera that follows a real series inherits every wiggle in it.
- **★ ZOOMS EASE IN WHAT THE EYE SEES (Timur, 2026-09-28: "the transitions with the zooming in feel a little linear,
  make sure to smooth out the camera movement when it starts moving and when it approaches the final destination").**
  - **Why an ease on z is not enough:** a layer's size is R / distance. Easing the camera's z (even in-out) still makes
    the arriving place grow fastest in the LAST frames: 1/D² is 5× steeper at the end of a 1.25 push.
  - **The fix:** push moves interpolate the arriving layer's DISTANCE geometrically, `D = Ds·(De/Ds)^e`, so the zoom
    RATE is what gets eased. `e` is a smootherstep (zero speed and zero acceleration at both ends).
  - The camera starts soft and lands soft. It applies to every place push, the caption pushes and the push-through
    to the close (`ease: "zoom"` in `world.tsx`).

#### 2.5.2 ★ THE CAPTION CAMERA — important lines only (Timur, 2026-09-26)

- **Captions stay at their normal size and in 100bps' form:** chips at y 291, hero sentences as
  they are.
- **On the important lines only** (the hook, the reveal, a key number), the caption gets a camera
  move of its own. The world camera moves with it, so the layers behind parallax in step. There are
  two kinds:
  - a slow eased **push-in** toward the text over the line's duration;
  - a short **pull-back** as it lands.
- **Never** on ordinary lines, never a linear zoom, never a pop.
- **★ TRACKING TEXT for the closing question** (Timur, 2026-09-26: "instead of using generic captions
  for when the VO says: So where do rates go next? … use the tracking text feature … to practice
  for future videos, so make sure it zooms closer to the text almost like its 3d").
  - **It is `Demo/src/demo/track.tsx`.** The line is set BIG in real CSS 3-D:
    - each line sits on its own depth plane (the accent word nearest), so the lines parallax as
      the camera dollies;
    - each word flies in FROM DEPTH on its spoken frame;
    - the camera then tracks in toward the text for the rest of the line (a world move too, so the
      FG arrows parallax with it), while the block turns slowly toward square-on and the
      letter-spacing opens.
  - **Faces:** Figtree, with the Instrument Serif italic accent and its gradient.
  - **Line spacing is 100bps' hero rhythm** (Timur, 2026-09-26: "the lines are too far apart, make
    the overall spacing between lines similar to the way it is with 100bps").
    - 100bps' line-height 1.25 leaves ≈ 0.5 × the size between a baseline and the next line's
      letters.
    - Lines are placed by baseline: the next line's INK top sits 0.5 × the upper line's size below
      it, from the font's own glyph metrics (`layout()`). A line-height rule opened a big empty
      band above the huge lowercase "next?".
  - **It LEAVES THROUGH THE TOP** as the camera tilts down onto the close — ALL of it, "next?"'s
    foot included, before the cut (Timur: "make the next? text leave the screen a little sooner since
    the bottom of it stays on screen in the end"; the lift is now 1800 px over 60 f). The logo fades in only as
    the gap between the question's lowest ink and the logo's top opens (`trackBottom()`, computed
    from the same geometry the text is drawn with). Timur: "the bankers at the end should not
    intersect with the other text at all".
  - **Use tracking text for a video's closing question or hero line in future Bankers videos.**
- The caption is modelled at distance 0.7, so a push of dz scales it by 0.7/(0.7 − dz). In the demo
  that is:
  - the hook: push-in, 6–79, dz 0.06, ≈ 9%;
  - the key number "7% this week.": pull-back as it lands, 98–118, dz 0.04, ≈ 6%;
  - the reveal "The Fed raised rates a quarter point.": push-in, 217–270, dz 0.05, ≈ 8%.

#### 2.5.3 ★ SOUND FOR THE JOURNEY (Timur, 2026-09-26)

> "Swoosh on large entrances, exits and camera moves, varied. Context sound effects only for
> actions visibly on screen."

- **A swoosh-family sound on every large entrance, exit and camera move,** a different one each
  time: `whooshsoft`, `swoosh`, `whooshlong`, `airwoosh`, `lowwoosh`.
  - Each is placed so its measured PEAK lands on the move's fastest frame, which is the middle of
    an `rInOut` move.
  - Peaks, in frames from the file start: swoosh 12, whooshlong 12, whooshsoft 8, airwoosh 21,
    lowwoosh 13.
- **⛔ NO RISER, EVER** (Timur, 2026-09-26: "remove the sfx used at 1 second, never use it again").
  - The riser swelling into "record" was the sound at 1 s.
  - All risers were removed, including his earlier "risers into every reveal".
  - Never reintroduce `riser.wav` in a Bankers video. This matches the Style 3 doctrine's "riser
    never".
- **Context SFX only for actions visibly on screen:** the tape printing, a pillar rising, the needle
  sweeping, a solid settling.
  - Nothing plays for a thing that is not moving in frame.
  - Nothing plays for a camera move except its swoosh.

#### 2.5.4 The bottom logo

- **A small Bankers logo at the bottom of every frame.** "Use bankers svg at bottom of video make
  it smaller."
  - The white file on dark, dissolving to the black file on the white stage.
  - **The sweep does not count it in collisions.** Everything passes beneath a watermark (like a
    broadcast bug), including the Fed sinking out through the bottom edge.
  - **A WATERMARK, at 30% opacity** (Timur, 2026-09-26: "the bankers logo at the bottom should be
    transparent, not that visible. It's more like a watermark"). It was 90%.
  - **130 px wide, centred at y ≈ 1745 — at the bottom of the frame** (Timur, 2026-09-25: "make it
    smaller and put it at the bottom"). It sits inside the Reels UI band, by his choice.
  - It is the client's transparent SVG. A WhatsApp copy arrives as a JPEG with a grey ground and
    no transparency, so do not use that copy.
  - It rises in from the bottom edge at the start and sinks back out as the outro's big logo
    arrives (§2.5.1: every asset enters and leaves from an edge or from depth).

#### 2.5.5 ★ LESS ON SCREEN — one short label per number (Timur, 2026-09-26)

> "Less unnecessary information like the info under the main number with the dots between notes
> and dates."

- **A figure carries at most ONE short label:** a year, a name, or TODAY / NOW / PEAK. Examples:
  "18.63%" over "1981", "$51,349" over "NASDAQ", "$2,465" over "AT 6.26%".
- **Never a "·"-chained note** such as "THE RECORD · OCT 9, 1981" or "RAISED · SEPT 17, 2026", and
  never a full date where a year says it.
- **No fine-print lines on screen:** loan terms, "price only", a series' formal name. They go in the
  POST CAPTION, which is the root rule for disclosures anyway. The caption chip and the voice carry
  the context.
- **The facts behind every figure still live in the data file** (dates, series, definitions), so
  the build summary and the post caption can cite them.
- **The demo predates this rule.** "RECORD CLOSE · SEPT 22" and "FED FUNDS · 3.75% → 4.00%" still
  sit under its figures; bring them in line on its next revision.

---

## 3. Building a video

1. **Folder:** `Videos/Video N — [short title]/`, numbered independently of every other account,
   each a standalone Remotion project. Studio port **3400 + N**, serve **4400 + N**. The demo is on
   **3400**.
2. **Video 1:** clone the newest Style 3 build (V25+), then run the Bankers pass:
   - `node Resources/apply-palette.mjs <src folder>`, then read its report;
   - `theme.ts` → the Bankers tokens (`Resources/bankers-palette.mjs`);
   - `fonts.ts` → every face is Anton 400;
   - the outro → the Bankers logo;
   - strip anything that names 100bps.
3. **Later videos** clone the previous Bankers video, which already carries the pass.
   - **★ Then copy `Resources/kit/*` over the clone's engine files, and run
     `node Resources/stylecheck.mjs "Videos/Video N — …"` before writing a single place** (STYLE.md §0, §15). It must
     end CLEAN before every handback, next to the every-frame sweep. A rule changes only when Timur asks: first
     STYLE.md and its §16, then `Resources/kit/` if the engine moves.
   - **Video 1** is `Videos/Video 1 — Micron vs JPMorgan/` (Studio 3401, serve 4401), the first
     client video (2026-09-26). It was cloned from `Demo/`; Video 2 cloned it (below).
     - It carries the place table, the guard ported from Style 3 Video 26 (`guard.mjs` +
       `guardtest.mjs`, armed before the take from `script.mjs`'s CHANGES), and the provisional take.
     - **The provisional take:** until Timur's VO lands, `synth.mjs` writes a word-timed take from
       the corrected script at the demo take's measured 3.26 words/s. `captions_vo.mjs` runs the
       same code on it as on the real `fw_words.json`, so the film re-times itself when the real
       take lands.
     - `render.mjs` refuses a master while the take is still synthetic.
     - **The real take landed 2026-09-26** (ElevenLabs "Jon – Calm Presence", 114.9 s → 97.8 s
       trimmed; the film runs 101.6 s).
       - It was read from the BRIEF, like four Style 3 and OffCamCelebs takes before it. All five
         corrected lines are in their brief form, and the guard caught every one on arrival and
         blocks the master.
       - **Asked to "render" while the guard blocked (2026-09-26):** `render.mjs --review` renders the
         film under ANOTHER name (`out/…_REVIEW_not-for-posting.mp4`) and never writes the master's
         path. The guard's refusal was first re-proven on the plain command. The master waits until
         the lines are re-recorded, or until Timur explicitly accepts them (then set `accepted: true`
         on those entries in `divergences.mjs` and regenerate).
       - The film re-timed itself from the transcript. Two anchors had to move because the take
         merged sentences: the makers' slide now hangs on the word "three", and the key-number
         caption camera on "ten".
   - **Music:** Timur chose the demo's Yeat bed for Video 1 anyway (2026-09-26: "Use the Yeat track
     anyway"). He confirmed it when the take landed ("vo in public, use yeat"). It is a commercial
     track, so flag the client's rights in every build summary until he confirms them.
     - **The Yeat track's DROP is at 13.33 s** of the source: its intro sits at about −19 to −23 dB,
       then it jumps to about −6 dB.
       - Played from the top, the drop fell mid-sentence.
       - So `bedsrc.mjs` starts the bed where the drop lands on the reveal line, "The company is
         Micron" (the first word of section `what`). The hook plays over the quiet intro.
       - The offset comes from the generated captions (`bedPlan()`), never from a typed frame.
     - **The envelope steps at the drop** (`bedenv.mjs`):
       - The intro is one window aimed 8 dB under the voice, the edge of the band.
       - The body uses 10 s windows at 3.5 dB speech-gated.
       - The gain changes in 0.1 s at the drop, where the music's own jump hides it.
       - Linear 10 s knots would have smeared a ramp across the drop.
       - Level, envelope and fades are baked into `public/bed.mp3`, and the volume is a static 1.
       - Measured: every window within 0.2 dB of its target.
     - The track is copied into the video's own `public/music_yeat.mp3`: the demo's relative path to
       Style 3 Video 26 no longer resolved one folder deeper.
   - **SFX levels (Video 1, measured from the rendered stem at full bandwidth):**
     - `PRESENCE` 1.59, and per-family swoosh volumes from their measured peaks: whooshlong 1.6,
       swoosh 1.5, airwoosh 0.8, lowwoosh 1.1, whooshsoft 1.0.
     - EVEN[] matches the files' MEANS, and their crest factors differ by about 6 dB.
     - Result: swooshes 15–18 dB under the voice peak, context 19–21 dB, subs about 26 dB (they are
       52 Hz, and a peak reading undersells them).
     - `scratchpad/sfxpeaks.mjs` measures it.
     - ⚠ Decode at 48 kHz. A 9 kHz decode filtered out the `data` bleeps and reported them as silence.
   - **Video 2** is `Videos/Video 2 — Sentiment vs Stocks/` (Studio 3402, serve 4402), built 2026-09-28,
     cloned from Video 1; **Video 3 clones Video 2.** Composition `SentimentVsStocks`. The brief capped it at
     80 s; it runs ≈ 59 s on the provisional take. Its lessons:
     - **★ Its first cut looked nothing like Video 1, and Timur rejected it (§2.5.1c, §2.5.1d).** The first build
       drew the brief's hook literally: a paper receipt as a far plane, a pale 3-D number, glow-blurred candles riding to
       the lens, and an exit flown through the paper. Its other places were flat illustrations. A second pass added
       camera beats, a tripled float and a camera slaved to the price data; that read as jitter. What stands now:
       - Every place is built from Video 1's pieces: blue solids, white Anton figures, pale labels under an axis,
         the pool, and Video 1's candle inks.
       - The camera is Video 1's engine byte for byte (`world.tsx`, `track.tsx` copied back).
       - The brief's props survive as content: the receipt is a corner FG piece (GAS $4.48), "48.1" is a figure,
         the candles are a real S&P 500 tape.
     - **Then twelve scenes (Timur, same day: 6–7 s per scene, realistic hero objects, better corner pieces).** Six places
       became twelve on their sentences. New realistic MIDs: a machined sentiment gauge on the demo's dial recipe, and a
       fuel dispenser. New corner pieces: survey binders, an earnings report, an hourglass. Two mechanisms were added:
       - `keepMid` / `keepFg` in the place table let the camera travel across ONE construction as successive scenes
         (the honest part: gap → futures → pull-back). A kept MID is marked `data-probe-also` for the framing it is in,
         so the sweep's overlap count sees it.
       - Consecutive white places form one white RUN (flood on the first, drain on the next dark one). The first
         version counted a white-after-white place as white from frame 0, and the whole film went white.
     - **Pushes ease in log-distance** (`ease: "zoom"`, §2.5.1d): Timur found them linear.
     - **The real take landed the same evening** ("vo in public, use a song other than the yeat one").
       - ElevenLabs "Jon – Calm Presence", 67.5 s raw → 58.3 s trimmed. The film runs 62.5 s, inside the 80 s cap.
       - **It was read from the BRIEF again.** Both corrected lines are in their brief form ("Every other time people felt
         this bad…" [high], "Sentiment measures what people pay" [low]). The guard caught both on arrival and blocks the
         master.
       - The hook's two fall cues follow the voice: on the corrected line they are the years; on the brief's they are
         "bad" and "falling". `captions_vo.mjs` decides with the guard's own pattern, read from divergences.json.
       - The take joined sentences with commas, so the hook's tape now slides in on the word "Yet" (`CUE.yet`), and the
         chips break at clause commas (STYLE §13.1).
       - Whisper split "74 | -year" and "all | -time", wrote "second lowest" open, and title-cased "Consumer Sentiment
         Survey". All are fixed in the generator.
       - A measured silence snap was added: 9 words moved to their onset.
       - The gap scene ran 7.8 s on this slower read. It is split: **gapB** is a camera pull-back across the same bars
         (x +60, z −0.2) after the calendar flips on "Today", and the calendar slides out with it (`exit`).
       - **The bed is the Succession track** (Timur: "use a song other than the yeat one"; STYLE §11.3). It is flat, so
         it plays from its top. Mixed from the rendered stems, it sits 3.5 dB under the voice in every 10 s window (within
         0.2 dB). The swooshes sit 15–18 dB and the context sounds 21–23 dB under the voice peak. The mix peaks at
         −3.3 dB.
     - **Timur's third review (2026-09-30): "the first half completely lacks good visuals … the hook scene is visually very
       weak, improve it a lot, perhaps by taking some inspiration from 100bps"; then "at 11 seconds, the screen randomly
       changes and becomes brighter".** Rules: STYLE.md §6.8, §9.6, §10.1, §16. The build:
       - **A forwarded hook revision prompt** (four depth planes, a soft gas receipt, a slamming extruded 48.1, erupting
         candles, ghost stacks, motes) was built, then SCRAPPED at Timur's word: "no, scrap the hook completely, don't listen
         to the prompt, undo the changes relating to the hook. Create some sort of chart hook scene, using inspiration from
         100bps". Nothing of it remains. (Its diagnosis step did find the old hook's frame 0 was an empty boxed panel.)
         ⚠ It also asked for a 1980 ghost "falling": when sentiment bottomed in May 1980 stocks were RISING, so that would
         have been false; check any "every other time" visual against divergences.json.
       - **The hook is now THE JAWS** (`places/jaws.tsx`): the S&P 500's month-end closes and the Michigan index, both as %
         change since Dec 2021 on ONE zero-based axis, leaving one bead and opening apart (stocks the bright thick ribbon to
         7,743 NEAR A RECORD, feelings to 48.1 WORSE THAN 2008 under 2008's low); the kicker lights 2022 red, when both fell
         together. Frame 0 is already ~30% drawn. `spxq.mjs` now also writes `SPX_M` (month-end closes, Dec 2021 →).
       - **First-half objects:** "On Friday" keeps the University's columns and gains Michigan's extruded Block M, with the
         last twelve readings TRACKED point to point into TODAY 48.1 (the base arrives with the camera, so it never lands
         empty); the 2008-vs-today scene is a real LED MARKET BOARD (housing, feet, bolts, lamp, a lamp field) whose two
         columns keep the honest drawdown chart — 2008 drains row by row to 57% with the lost rows dim red.
       - **The 11 s brightening was a one-frame jump of +69 levels** (frame 347 → 348): the pushed-past terminal hung over the
         white stage as a dark blur and was unmounted at once. The two monitors did the same into the pump (+43, 32.5 s).
         Pushed-past layers now dissolve over [t0 + 4, t0 + 26] (a distance-keyed fade ran in ~4 f at SETTLE's peak speed and
         still flashed). `scratchpad/flash.py` refuses any one-frame change over 25 levels; proven on the old frames.
       - **The hook was then stripped** ("too many random elements in the hook scene, like lines and stuff"): no zero line,
         no dashed record or 2008 level, no stretch, no band — only the two ribbons, their start, heads, names and verdicts.
       - **The flash fix, final form:** a fade on the pushed-past layer cut three hand-overs under 15 f (the lens pass sets
         their length), so instead the WHITE FLOOD waits until the outgoing place is through the lens: a push out of a dark
         place floods from t0 + 16, not t0 + 6 (`Video.tsx`). The frame brightens as one dissolve.
       - **Same day, more notes:** the pump's crown was drawn BEHIND the cabinet (its white cap cut across it) — now seated on
         it and drawn in front; the SFX at 11 s was shorter than its animation — process sounds now span their animation's
         own window (`proc()`, chained past the file's length) and the bundle refuses a short one (proven by sabotage); the
         data texture is rationed to 3 computing moments; the hook's red 2022 stretch DRAWS along each ribbon; and the 41 s
         scene gained the eight biggest companies' real marks (`marks.ts`, simple-icons CC0, Microsoft from its geometry;
         data.ts BIGGEST — ★ re-check against SPY's holdings on upload day) and three extruded PROFITS bars from zero
         (2025 → +32% → +15%, FactSet CY2026/CY2027), replacing a numberless rising curve.
       - **The bed is Daphni — "Poly"** ("use a different song" → WW3 → "different song" → he chose Poly), copied from
         OffCamCelebs 014, re-mixed from the rendered stems at 3.5 dB speech-gated per window. ⚠ Commercial: flag the rights.
     - **Timur's second review (2026-09-30).** He said the hook and the corner assets looked "claudy" (AI-generated), there
       were too many zooms after 42 s, and the "≠" blurred at 44 s. The demo "looked great because it focused on 15 seconds",
       and it "used assets like the roman pillars to create an animation". All rules are in STYLE.md §7.1, §7.6, §8.7a,
       §10.1, §10.2 and §16. The build:
       - **The hook is ONE construction**, a trading terminal (`places/terminal.tsx`):
         - how Americans feel since 2007 in the lower pane, the S&P 500's quarterly candles in the upper pane;
         - both zero-based, on one time axis;
         - the camera travels up (hookB) and pulls back (hookC), and red bands drop through both panes at 2008 and 2022.
         - The gauge and the receipt are gone.
       - **whatA is framed by the University of Michigan's columns** (`places/columns.tsx`), a FRAME layer that comes out of
         depth with the camera: the demo's Fed composition.
       - **Corner pieces only on the nozzle and wallet scenes**, rebuilt as extruded solids. Seven others were deleted.
       - **The "≠" and the honest part now arrive by slides**, and the caption push on "not the economy" is gone.
       - **Rack focus starts with the push**, not 6 f before.
       - **Kept constructions no longer far-fade on a pull-back.** The hook's terminal dimmed to about 20% under the default
         [1.25, 1.5]; kept MIDs now use [2.2, 3.2].
       - stylecheck enforces the new zoom rules (27 canaries).
     - **Timur's review of the wired cut (2026-09-29).** All eleven notes are in STYLE.md §16. The build:
       - **Camera:** every move is now on SETTLE (world.tsx): a soft start, then one long deceleration. Pushes run
         56 f, slides 48 and the question 64. Slides scale by the outgoing construction's distance, so what they leave
         crosses a full frame.
       - **FG pieces on a push** are projected by the landed camera and glide into their corner (FgEnter), instead of
         swelling out of the vanishing point.
       - **The hook's red candles** are a quick wave (14 f each, 2 f apart), lit on "time" and "bad", so 2022's fall has
         screen time.
       - **The hand-over into "On Friday":** the exit leaves as "…falling." ends, with tilt 160 and VO_GAP 12.
       - **The arrows** became two trading monitors (STYLE §10.2: nothing basic).
       - **The lows scene's red stretch** became a see-through extension of today's solid.
       - **The sweep's new VANISH / POP check** was proven on the old unscaled slide, which unmounted the gap while its
         edge was on screen.
         - Its first full run flagged 15 hits, and 13 were things leaving fast through an edge.
         - So an item now counts only if, extrapolated one frame at its own speed, it would still be on screen.
         - An ambiguous match (the bubble's stacked copies) falls back to "≥ 50% of it on screen".
         - What was left was real: the ≠ popped (its bars at `grow × 6` on OUT), and so did the closing logo (a
           40 px ramp).
       - **stylecheck's new SMOOTH check** bundles the real camera path and caps its acceleration. Its first run found
         the fly-through into the close (z +1.2 in 36 f); THRU now runs 56 f.
       - **Hand-overs held at ≥ 15 f** under the faster SETTLE push-past:
         - a pushed-in place fades up over [t0 − 4, t0 + 14];
         - FG pieces start gliding as the push starts;
         - the question lifts over 72 f.
     - **The STYLE.md audit (2026-09-28).** Timur: "Look at the last bankers video and create these rules. Then analyze
       this video and ensure that it follows them." STYLE.md was written from Video 1's measured source, and Video 2 was
       brought to CLEAN under `stylecheck.mjs` plus the every-frame sweep. What it fixed:
       - the caption scale snapping mid-chip (a Video 1 behaviour);
       - the question cutting "So be honest." 6 f after its last word;
       - the pump, the block and the rails popping in at t0 + 7 (`grow` on a fixed-size Solid);
       - halos mounted at `a > 0.97`, and the profits head and the candle head glow switched on or off in one frame;
       - raw 46/34/60/128 px text in the honest part;
       - the gauge and pump print moved to object print;
       - a text shadow, a red keypad key, and one off-token red;
       - no floor light under the sentiment line;
       - the kept wallet dissolving on the pull-back, and then resting as a sliver at the edge;
       - "6,000", "+50%" and "GAP" resting at the frame's edge. The sweep's new MARGIN check found the last two.
     - **The hook's candles are REAL:** quarterly OHLC aggregated from the daily closes by `scratchpad/spxq.mjs`,
       which refuses unless the film's verified levels come out exact. Quarterly, because 237 monthly candles are too
       thin to read at phone size.
     - **Probe (2026-09-28):** a TILTED SVG shape is judged by its outline quad (`shapeQuad`, used only when
       its hull agrees with the browser's box to 3 px, so the 2-D CTM under a CSS 3-D transform never leaks
       in). A tilted receipt's axis-aligned hull had "crossed" a caption the strip cleared by 150 px. Canaried both
       sides: in the page every frame, and in `sweep.mjs` (a hull-only overlap must not fire; a real one must).
     - **`<defs data-probe-skip>`:** a clipPath's rect and a mask's path are DOM geometry. The probe measured the
       chart's growing clip rect as a line through "51.7".
     - **Fade an SVG line with `opacity`, not with its colour's alpha.** The probe reads opacity, so a stroke
       faded to a transparent colour still counted, and an unseen grid line "crossed" the hook's figure.
     - **Tracking text: keep each line short.** On Video 1's fly-in, a word far from the centre projects toward the
       perspective origin as it comes out of depth. At the end of the five-word line "off than a year ago?", "ago?"
       landed over "year". The question was re-lined ("off than" / "a year ago?"), and the engine stayed Video 1's.
   - **Video 3** is `Videos/Video 3 — Interest vs Military/` (Studio 3403, serve 4403), built 2026-09-30, cloned from
     Video 2 with `Resources/kit/` copied over its engine; **Video 4 clones Video 3.** Composition `InterestVsMilitary`.
     The brief ("America Now Spends More on Interest Than on Its Military", RECORD HUNTER) capped it at 80 s; it runs
     70.3 s on the provisional take. Its build:
     - **The facts were verified before the script went back** (root CLAUDE.md), and four lines were corrected and armed
       in the guard BEFORE the take (`script.mjs` CHANGES → `divergences.mjs`; guardtest proves all five directions):
       - the debt is **$40.1T** (Treasury, Debt to the Penny, Sept 28, 2026), not the brief's "thirty-eight" [high];
       - $1,052B ÷ 335 days is **$3.14B a day**, "more than", not "almost" three billion [medium];
       - savers hold Treasuries through money market funds and savings BONDS, not savings accounts [medium];
       - "Nobody knows which yet", not "nobody controls" (a claim about who sets rates) [low].
       - CBO's own PDF could not be fetched (403 on WebFetch; a download in the browser pane). Its figures are quoted
         from the coverage of the review and cross-checked against Treasury's statement (DoD $832.63B, JEC).
       - ⚠ Treasury's "net interest" ($1,017B) is a different definition from CBO's "net interest on the public debt"
         ($1,052B): one dataset per figure family, never mixed.
     - **The brief's hook was a forwarded-prompt device** (a Capitol dome background, coins, motes, a slamming "$1
       TRILLION", a ticker). It was first built as a chart in the hook grammar (STYLE §10.1 as it then stood): THE OVERTAKE,
       two bars racing up one $0-based axis. Timur: "add some more interesting visuals to the hook scene … Right now it is
       too plain and simple", then "no, don't do a bar chart, replace the hook with something more creative entirely"
       (STYLE §10.1 now: a creative construction, not a chart).
     - **The hook is THE BALANCE** (`places/balance.tsx`): a trade balance.
       - A tank sits on the military's pan. On the other pan, a cast-iron weight stamped "%" GROWS (interest growing)
         until the beam tips to interest.
       - $833B and $1.05T land under their pans. On "…isn't even over" the weight grows on and the beam dips further
         (IN 11 MONTHS).
       - The camera then pushes into the weight.
       - Dropped drafts: a FALLING weight would have passed through the beam's arm above its own pan; a fighter jet
         parked behind the tank was hidden by it.
     - The brief's on-screen period stamp went to the post caption (§2.5.5).
     - **Sixteen places, all real objects or real data** (STYLE §6.8, §10.2): a desk calendar flipping October → August;
       the Pentagon as an aerial model; pallets of $100 bills on a warehouse floor (28 a day a year ago, three more
       delivered: +12%); the FRAME place — the camera pushes in between two towers of Treasury bond bundles to the stack of
       the debt; one Treasury bond with its coupon sheet (the coupons light on "price"); the 10-year yield since 2010; THE
       ROLLOVER, a rack of bonds on one fixed rail (2% bonds mature off one end, 5% ones roll in, the coupons under the rail
       grow); a stream of coins splitting to four holders (office tower, bank portico, desk globe, piggy bank); an open
       ledger (the same entry as COST and INCOME); two staircases from this year's bill for the honest part.
     - No corner pieces: none of its sentences is about an object you hold (STYLE §7.1).
     - **What the first every-frame sweep found (2026-09-30), and the fixes:**
       - **The FRAME can't part outward toward the next place.** The bond towers opened like the University's columns,
         and the right one swept through the bond certificate sliding in from that side (LINE). They now DROP out
         through the bottom edge just before the slide (STYLE §9.6's "a drop"). Choose a frame's exit by the next
         move's direction: doors only where the next place does not arrive through them.
       - **The probe cannot see paint order.** Print hidden under something opaque still counts: the flip calendar's
         flying pages' edges "crossed" the days of the page beneath, and the coupon sheet under the certificate
         "crossed" TREASURY BOND. Covered print is faded by how far it is uncovered (`calendar.tsx` `edgeY`), and the
         sheet shows only as it comes out from under.
       - **A pulled-back construction is carried a full frame by the next slide.** The rack's matured bonds parked just
         off-screen came back into view and crossed the incoming stream (CROSS, then VANISH at the unmount). They now
         slide far off (14 slots).
       - Deliveries come from the side the camera is arriving from, never through the outgoing place (the pallets).
       - **Print on a front object is "crossed" by everything behind it.** The pallets' "$100M" tag sat over the row
         behind; the unit now stands on the open floor ("$100M EACH"), and the day's total sits under the floor, so the
         push out carries it DOWN, not up through the next caption (SOFTCAP).
       - **A frame that drops must slow through the frame's edge** (INOUT, ending just below it): on IN the last bundle
         crossed the edge at ~150 px/f and was gone in one frame (VANISH).
       - **A push INTO a lit object floods the white stage early** (`whiteIn: 7`, not the push default 16). The hook's
         push dives into the lit interest bar, which fills the frame bright and clears the lens at t0 + 17–20; flooding at
         t0 + 16 left the dark stage showing between them, a −28-level dip in one frame (`flash.py`, frame 255). The
         default 16 exists for the opposite case (a DARK construction hanging over the white stage, Video 2).
       - Final state: stylecheck CLEAN, every-frame sweep CLEAN (every hand-over ≥ 15 f), flash CLEAN (worst 21.2).
       - ⚠ The machine was down to 0.4 GB free and a concurrency-4 sweep crashed ("Page crashed!"). `sweep.mjs` now takes
         `--concurrency=N`; Video 3 swept at 2.
     - **The real take landed the same day** ("vo in public").
       - **The take:** ElevenLabs "Jon – Calm Presence", 81.8 s raw → 69.7 s trimmed; the film runs 73.1 s, inside the
         80 s cap. It was read from the CORRECTED script this time: all four corrected lines as written, so the guard has
         nothing to block (0 active of 4, self-test proven).
       - **Whisper artifacts fixed in `captions_vo.mjs`, each would have shown on screen:**
         - "the U | .S." split a sentence → "US";
         - "one trillion and fifty-two billion dollars" came back as "$1 trillion and $52 billion" → "$1.052 trillion";
         - "The price of it is, for most of the 2010s," joined two sentences → split at "is.";
         - "around five" (percent) came back as "around $5" → "five".
         The generator refuses if any of those tokens is left.
       - **The mix:** the bed is Daphni — "Poly", as on Video 2. Flat, it came out ~10 dB OVER the voice; the envelope
         put it 3.5 dB under in every 10 s window (within 0.2 dB, speech-gated, from the rendered stems). Swooshes sit
         16.7–17.2 dB under the voice peak; the hook's chain was 15.5 and went down to 0.3. Full mix: −21.1 dB mean,
         −4.1 dB peak.
       - **On the real timing, four moves swallowed their place's last action** (the pallets' light wave, the lit
         coupons, "5.24%", INCOME): each landed as its scene left. Those moves now wait:
         `t0: Math.max(lead, actionCue + 30)` (root CLAUDE.md, VO pipeline step 7). "Pension funds, banks, foreign
         governments, and anyone…" came as ONE sentence, so whoB would have held 7.3 s; its travel now starts on
         "…holds the bonds". The later push into the rollover then needed tilt 420 (SOFTCAP).
       - **Identical small items can't be followed off-frame by the sweep's VANISH check** (its match must be
         unambiguous). The rack's two end-stop bolts were separate identical circles and were flagged as they left.
         Draw such repeats as ONE path.
       - Final state: stylecheck CLEAN, every-frame sweep CLEAN (every hand-over ≥ 15 f), flash CLEAN (worst 21.1).
     - **Screen follows the voice:** the stack prints no figure if the take says the brief's "thirty-eight trillion"
       (`SAYS_BRIEF`, the guard's own pattern).
     - **Timur's notes on the wired cut (2026-09-30):**
       - **"improve the calendar animation, make it more detailed and polished"** (`places/calendar.tsx`):
         - the flips RIFFLE, slow on October, quick through the winter, slowing into August;
         - each page CURLS as it turns (its lower half lags, most as it stands up);
         - a lifting page keeps its month ON the sheet: each line of print is mapped onto the curl, foreshortened with
           its true projected height, and fades only as it turns edge-on. With the print dropped by 35°, a blank sheet
           covered the whole calendar mid-flip;
         - a lifting page casts a moving shadow; the paper has punched holes and a twin-loop wire threaded through them
           (back loops behind, front loops over); the day grid has blue weekends; the stack still to come thins month
           by month, and the flipped pages build a lip over the wire.
         - Two sweep lessons: only ONE page may face the lens in flight at a time (each starts lifting as the one before
           passes vertical), or the nearer page's print overhangs the other's edge; and the flat page and board the print
           sits over carry `data-probe-skip`, since a nearer sheet's print legitimately overhangs them and the probe has
           no depth order.
       - **"in the interest is up 12% part the boxes closest to the camera intersect each other as they enter the
         scene"**: the three pallets were delivered leftmost-bound first, so the other two drove through it. The
         farthest-bound now goes first (STYLE §9.6). The sweep can't see this within one construction, so check every
         staggered entrance in the strips.
       - **"ensure that the sfx are timed right, especially in the hook scene and add some more throughout the video.
         Only SFX that have either been used in 100bps style 3 or in the previous bankers videos" (2026-10-01).** The score
         went from 50 cues to 87 (STYLE §11.0–11.2). What was wrong, measured on the sweep's own frames
         (`scratchpad/sfxmotion.py`, `whooshsync.py`):
         - **Every camera whoosh peaked 8–12 f late**: placed on the move's midpoint, while SETTLE peaks ~29% in. They now
           peak on the fastest frame (all within ±1 f).
         - **The hook's rattle missed its beam**: it was cued at "interest − 10" (frame 43). The beam swings hardest at
           15–30 and stops by ~88, so the rattle started 43 f late and ran 40 f after the beam stopped. It now spans the
           measured swing (`beamSwing`: wherever it turns ≥ 0.04°/f) and fades with it. The second swing on "…isn't even
           over" got its own. The travel to the interest pan (72 px) had the loudest whoosh, 2 f from "$1.05T": it is now
           whooshsoft 0.5.
         - **Every figure's hit sat on its word, 2–3 f after the figure visibly arrived** (OUT is front-loaded). Hits now
           go at 0.4 of `figLand` (word − 2).
         - **Added:**
           - a flick per calendar page as it passes vertical (10 in the riffle, on the frames' own flip spikes);
           - a tick per Pentagon ring and per staircase step;
           - coins as the coupons light and as the stream comes in (one every 13 f, the rate coins pass a point);
           - the rack's rattle per rollover, ending in a click as each new bond seats;
           - a ping as the bill lights;
           - flicks on the floor and ledger labels, 2% and the staircase headings;
           - a soft whoosh under the pallets' light wave and a lowwoosh as the bond towers drop;
           - a bloom as the hook's interest side takes the light, cut as the push dives in.
         - **Each place exports its windows** (registry.tsx `TIMES`), so no sound is placed by a copied offset.
           `sfxsheet.mjs` prints the score as heard and checks it (PILE, OFFSTAGE, KIND).
         - Levels were set from the rendered stem, 17–22 dB under the voice peak. A click at 0.8 measured 10.6 dB under and
           went down to 0.35; ticks needed 1.3. The mix is unchanged (−21.1 / −4.1 dB). Effects sit a median 31.5 dB under
           the voice in speech windows, and the bed stays within 0.2 dB of its target.
         - The refactor left the picture alone: the re-swept frames matched last night's, except tab-alternating raster
           noise (mean < 0.1 level). Sweep, flash, stylecheck and guard are all CLEAN.
       - **"change the song to yeat and render" (2026-10-01).** The bed went back to Yeat (`music_yeat.mp3`, from Video 1;
         STYLE §11.3), with the drop on the calendar section's first word (9.13 s) and the hook over the quiet intro.
         - The drop was re-measured in 10 ms windows: the hit is at 13.345 s, after a 10 ms gap. The gain step is centred
           0.05 s before it (DROP_SRC 13.29), so it completes in the gap.
         - Two controller passes put every window within 0.1 dB of target (intro 8.0, body 3.4–3.6), and the voice's last
           3.5 s at 4.0.
         - The master was rendered SINGLE-TAB (`render.mjs 1`): the sweep's two tabs rasterised alternate frames slightly
           differently.
   - **Video 4** is `Videos/Video 4 — Micron vs Apple/` (Studio 3404, serve 4404), built 2026-10-01, cloned from Video 3
     (module `src/profit/`); **Video 5 clones Video 4.** Composition `MicronVsApple`. The brief ("A Chip Maker Just
     Out-Earned Apple", a CALENDAR ENGINE news post on Micron's FQ4 2026 release) capped it at 80 s; it runs ≈ 68.5 s on the
     provisional take. Its build:
     - **Facts, verified at primary source before the script went back:** both companies' SEC 8-K press-release exhibits
       (Micron FQ4 2026: $54,229M / $37,701M / GAAP gross margin 86.8%; FY2026 $84,969M vs FY2025 $8,539M — Apple FQ3 2026:
       $109,417M / $29,789M) and Micron's annual net income FY2018–FY2025 from SEC XBRL (each 10-K's `NetIncomeLoss`).
       Five lines were corrected and armed in the guard BEFORE the take (`script.mjs` CHANGES; guardtest proves all
       directions): "only three companies make it" → "almost all of it" (CXMT began small-scale HBM3E, Aug 2026); "The price
       of memory did" → "more than doubled" (TrendForce: DRAM contract +93–98% in Q1 2026 alone); "the market already knew"
       dropped (results BEAT consensus; coverage blamed capex); "every past boom" → "many past booms"; "the most expensive
       thing in the computer" → "one of the most expensive parts" (the GPU costs more in an AI server).
     - ⚠ The guard's self-test caught a `\b` turned into a raw backspace by a shell string in `divergences.mjs` (control
       character in a pattern): fixed by rewriting the line from a Write-tool script, as the root rule says.
     - **The brief MANDATED a layered hook** (a blurred background chip, bars, defocused FG racks, motes, a slamming number).
       Built in the Bankers vocabulary (§2.5.1c): every plane SHARP, no motes, no bracket. Three depth planes as layers of
       their own (registry.tsx `planes`, Video.tsx): the chip at R 1.3, the bars at MID, the racks at R 0.7 with `pinXY`
       (they follow the camera across and parallax only in depth, so hookB's sideways recentring never swings them into the
       bars). Frame 0: the chip rising, both profit bars mid-growth, the racks sliding out from the edges. hookB pulls back
       (z −0.25) on "On half the sales" as the thinner see-through sales pair rises on the SAME scale; the exit is a push
       between the racks. The racks are the film's FRAME place (§10.2). The brief's stamp "Micron FQ4 2026 · Apple FQ3 2026"
       went on screen as each company's ONE label (FQ4 2026 / FQ3 2026: §5.7 bans the interpunct chain) and in full in the
       post caption.
     - **The brief's map of the three HBM makers** became three HBM stacks with their makers' marks (no map data in the
       project; the marks name the three in one second). ⚠ The first stacks were drawn tall with micro-bump dots between the
       dies, and in the stills they read as OFFICE BUILDINGS with rows of windows. They are now flat die PLATES (each face
       showing its eight banks) dropping out of an exploded column — what a chip stack looks like at a glance.
     - **Apple's mark** is not in the canonical `parts.tsx` Brand list, so it lives in the video's own `marks.ts` (generated
       by `scratchpad/mkmarks.mjs` from simple-icons' CC0 file, as Video 2's marks did).
     - **The price-stack proportions are real:** one dollar of Micron's price split by its FQ4 GAAP gross margin (cost 13.2%,
       profit 86.8%), so the "almost pure profit" picture is the actual split, not an invented one.
     - **What the sweeps found (2026-10-01):**
       - **A far plane never passes the lens.** The chip at R 1.3 stands beyond where the dive ends, so it hung over the white
         results as a dark blur and was unmounted at once: +76 levels in one frame (`flash.py`, 235 → 236). It now DROPS out
         through the bottom edge during the dive (`leave`, the move that carries the construction away).
       - **A near plane and a sideways travel:** the racks first parallaxed with the camera's x, so the pull-back's
         recentring would have swung them into the bars. `pinXY` keeps them on the aisle. The sales pair, its label and the
         axis line also wait until the pull-back has brought their side clear of the racks (CROSS 103–176).
       - **Every place's base arrives WITH the camera** (STYLE §6.9). Two hand-overs were under 15 f because a base came at
         t0 + 14 (the results) or only one stack's base came (the HBM).
       - **Lines from a coin's centre cut its print:** the split's radii ran through a centred "$1" (LINE). It now sits on
         the lower face, clear of every cut, and rides with its slice.
       - **A label that rides up with a travel** ("FQ4 2026") ended at y 369.9, under the 370 margin: whatB travels 290, not
         330.
       - **`whooshsync.py` measures each whoosh two ways.** A move into a WHITE place floods the stage while the camera moves:
         the raw frame difference peaked on the flood (takeA read −9 f), and a mean-removed one read the white field's
         radial light reshaping (honestB −7 f). A whoosh passes if either measure agrees within ±3 f, with both offsets
         printed: all 15 do. The fly-through's whoosh follows the camera's fastest frame here, measured; Video 3's sat
         between the camera's and the lift's. `flash.py` reads the frame number whatever its width (a `--range` run writes
         three digits). Final state: stylecheck CLEAN, every-frame sweep CLEAN (every hand-over ≥ 15 f), flash CLEAN.
     - **Timur's notes on the first cut (2026-10-01): "the text at the end should be on top of the blurred visual, not under
       it. Also, do a full intersection and violation sweep. Ensure that there are lots of SFX and they are timed right."**
       - **The question was UNDER the racked-out board:** world layers carry zIndex up to 6000, and the question, the chips and
         the watermark carry none. `<World>` now mounts in its own stacking context (STYLE §5.4a, a stylecheck [CHECK], which
         also flags Videos 2 and 3: built before the rule, they have the same defect).
       - **The violation sweep** (`scratchpad/violations.mjs`, STYLE §15.2a) measures clearance on the probe's frames. Its
         first run found 11 settled near-misses. Two were artifacts: the extruded figure's stepped copies read as ten overlapping
         texts (now `data-probe-skip`), and fat SVG paths' boxes (now counted as unmeasured, never passed). Nine were real:
         labels 3–13 px from their bars or plinth, a tag's "$" on its own edge, and strap prints that could not keep 14 px on a
         46 px strap (removed).
       - ⚠ **The probe maps SVG text through a 2-D transform under a 3-D `Turn`** (the documented ±10 px). A print on a swinging
         tag read 8 px from its edge while it was 18 px at rest. Give object print enough margin to hold under that error.
       - **The score went from 52 to 128 cues** (STYLE §11.4): every visible action has its family's sound, each timed by its
         animation's exported window. The data texture was REMOVED from five ordinary bar growths (it is rationed to drawn
         series: the nine years, MU's trace). It plays in the Studio on the provisional take (`SFX_PREVIEW = SYNTHETIC`).
       - **Looking at the kept frames found three defects both sweeps had passed** (contact sheets of every beat and hand-over
         from `sweepframes.mjs`). They were shape-on-shape or timing faults, which no probe measures:
         - the side HBM stacks' dies fell from above their makers' marks while the marks landed, so they dropped THROUGH
           SK hynix and Samsung. Each side stack now closes before its mark lands;
         - Apple's SALES label sat under an empty groove for 20 f before its bar reached it. It now lands with its figure, when
           the bar arrives;
         - the coins showed their cut lines before they split. Removing the white outline was not enough. The two wedges
           left an anti-aliased seam, one slice's thickness showed past the other's face, and each wedge's gradient was its
           OWN box's. Now the gradients are the coin's (`userSpaceOnUse`), all edges paint before all faces, and the intact coin
           is drawn whole over the slices until the cut opens;
         - SIZE (takeA) landed on "Sales", naming an empty ground line through the whole push (the violation sweep's transit
           list showed it 9 px from that line). It now lands as the tower tops out. On "big" its flick had piled into the
           floors' ticks.
       - **The levels, measured against Video 3's stem** (`sfxlevels.py`, STYLE §11.4): camera whooshes, clicks, pings and
         subs matched within 0.5 dB. Flicks, context swooshes and whooshsofts sat 2–4 dB under; 23 cues were raised. The SFX
         stem peaks at −18.8 dBFS (Video 3: −18.2).
       - ⚠ `captions.ts` still held a `tellUs` cue at 1633 ("Sales TELL you how"), written before its anchor was fixed and never
         regenerated. Nothing read it yet. Regenerated, it is 1939. Re-run the captions generator after any anchor edit.
     - **The real take landed the same evening** ("I put the vo in public").
       - **The take:** ElevenLabs "Jon – Calm Presence", 84.0 s raw → 71.5 s trimmed; the film runs 74.9 s (2247 f), inside
         the 80 s cap. It was read from the CORRECTED script: the guard has 0 active of 5, and guardtest proves every direction.
       - **Whisper artifacts fixed in `captions_vo.mjs`; each would have shown on screen:**
         - "$37 | .7", "$29 | .8" and "$8 | .5" were split tokens. The decimal merge now keeps a leading "$";
         - **"Price." was missing.** Whisper dropped the one-word answer in context, though the clip transcribed alone reads
           "price.". It is inserted where the audio has it (24.27–24.67 s), and the generator refuses if that gap is silent;
         - "centers" → "centres" (the script's spelling); "boom and bust" → "boom-and-bust".
       - **Late starts:** 11 words after punctuation came back late, by 0.05–0.27 s. "Sales" was zero-length 8 f after the
         word began. A walk back to the end of each pause fixes them (root CLAUDE.md, VO pipeline step 6).
       - **The take ran three sentences on after a comma** ("…than Apple, on half the sales.", "…in sales and $37.7…",
         "…booms ended, and the stock…"). `HOOK_B_AT` looked for a sentence starting "On half", found none, and would have
         crashed the composition. honestC's "barely moved" sentence would have opened 1.5 s early, on "That's how". Both now
         anchor on WORDS (`CUE.onHalf`, `CUE.andStock`), as does the hook's caption push.
       - **Two places ran over 7 s on the slower read** (whyA 7.10, honestA 7.13). The waits after their last actions were
         trimmed (whyB doubled + 26, honestA Ten + 32, honestB $6 + 27); every action still finishes 10–16 f before its move.
       - **The mix:** the Yeat bed, its drop on "Last night" (6.70 s). Flat, the body sat ~14 dB OVER the voice; two
         controller passes put every window within 0.1 dB (intro 8.0, body 3.4–3.6), and the voice's last 3.5 s at 4.4.
         The voice stem sits at −23.2 mean / −5.2 peak. SFX run 17–23 dB under the voice peak (textures to 29). Full mix:
         −21.5 dB mean, −3.9 dB peak.
       - Final state: stylecheck CLEAN, every-frame sweep CLEAN (every hand-over ≥ 15 f), violations CLEAN on settled
         frames, flash CLEAN (worst 24.1), every camera whoosh within ±3 f, sfxsheet clean, and contact sheets of all 198
         beat and hand-over frames looked at.
     - **Timur's notes on the wired cut (2026-10-01):**
       - **"don't say anything like last night in the video because we don't know when it'll be uploaded. Just use dates.
         Send me the new VO script adjusting for this"** (now a standing rule, §4). Eight lines were re-dated: "just made",
         "Last night" → "On September thirtieth", "latest quarter" → "June quarter", "didn't double this year" → "didn't
         double their output", "A year ago" / "This year" → "fiscal 2025 / 2026", "In 2023" → "fiscal 2023" (consistency),
         "Right now" → "In 2026". All eight are armed in the guard (13 entries, every direction proven), and the first take
         now blocks the master on them. The anchors that keyed on the old words (`night`, `ago`, "latest quarter",
         "year ago") now find either take's wording.
       - **"in the hook scene, the two bars that appear on the very right should have some more space since the metal
         parts of the chip in the middle intersect one of the bars."** The pull-back recentres the camera, and the far
         plane (R 1.3) parallaxes LESS than the bars, which carried the chip's right pins into Apple's see-through sales
         bar. The sweep could not see it: the chip is a `data-probe-skip` surface, and this is shape-on-shape across
         planes. The chip went to 560 wide (from 640) on the same centre; the sales pair moved 60 px out, and the racks
         24 px out each side (otherwise the right rack crossed the axis, CROSS 145–183). The pins now stand ~22 px from
         "$37.7B" and ~36 px from the bar. `HOOK_CENTER` and the axis length were typed numbers that would have stayed on
         the old layout; they are derived from `BARS` now.
         ⚠ **Check a far plane's edges against the MID at the END of every sideways or depth move,** not at its start.
       - **"fix the animation for the left and right stacks at second 33"** (the HBM side stacks on "three companies").
         They dropped die by die, 1 f apart, each from its own height with its own fade; in ~20 f that was a jumble of
         half-clear plates in mid-air. Each side stack now comes in as ONE exploded column (its 12 dies evenly apart, fading
         in together) and closes onto its base in one eased move, the left first; the plates never cross. Each closes before
         its maker's mark lands. The score's chainshort spans each close.
     - **The second take landed the same night** ("I put the vo in public"), read from the re-dated script: the guard has
       0 active of 13, and every corrected line is said as written. Raw 89.2 s → 76.0 s trimmed; the film runs 79.4 s, inside
       the 80 s cap but close.
       - **Whisper:** "out-earn Apple" came back as "outear an Apple", both times; it is now merged, and the generator refuses
         a stray "outear". It caught "Price." this time. 17 late starts were walked back (up to 0.25 s).
       - **A breath in the hold:** the pause after "possible." holds an audible inhale (−38 to −45 dB). The cut logic read
         the breath as the next line (a −40 dB onset), put the cut half way to it, then refused it as not silent. The cut
         now goes on the QUIETEST frame boundary in the pause (−52 dB here), and the line starts at speech level (−30 dB),
         as the root VO pipeline step 6 says. The breath plays before "On September 30th".
       - **A chip never ends on a bare "and":** "in sales and | $37.7 billion…" became "in sales | and $37.7 billion in profit."
       - **Four places ran 7.4–8.4 s** on the slower read with the dates' extra words. whatA was retimed (the dive waits
         through the hold; Apple's row comes 4 f earlier). whyA, whyD and honestA each split with a camera travel across
         their construction (STYLE §1.3): whyA2 eases back after "Price." to set the fab beside the tag; whyD2 pulls back on
         "In fiscal 2026" as the stack builds; honestA2 eases in toward the red 2023 bar. 18 places now, the longest 6.93 s.
       - **The mix:** the Yeat drop lands on "On September 30th" (6.50 s); every bed window is within 0.1 dB of target
         (intro 8.0, body 3.4–3.6), and the voice's last 3.5 s sit at 3.5. SFX run 16.5–28 dB under the voice peak, median
         20; the camera whooshes are loudest, as on Video 3 (16.7). Full mix: −21.5 dB mean, −5.0 dB peak.
       - **★ Timur, 2026-10-02: "use everything in its right place for the song, then render."** The bed is now Radiohead's
         "Everything In Its Right Place" (Instrumental), `public/music_radiohead.mp3`, copied from Style 1 Video 1's
         `public/` (267.5 s, stereo, 48 kHz; the 19 s file in Downloads and Style 3 V32's `music_previews/` is only a
         preview). Measured in 4 s windows it holds −15 to −17 dB from its first second, with no quiet intro and no drop,
         so it plays from its top in one regime (`DROP_SRC` null) and bedenv.mjs holds 3.5 dB per 10 s window. The Yeat
         envelope and baked bed are archived (`scratchpad/bedenv.yeat.json`, `bed.yeat.mp3`). ⚠ Commercial (Radiohead):
         the client needs the rights before this posts publicly.
       - **The sweep after the travels:** whyA2's ease-back shows the price tag ~6% smaller, and its "$" came 12.3 px under
         the hole's ring. A smaller ring and a smaller "$", centred between ring and foot, keep ~26 tag units each side
         (≥ 17 px). The kept frames also showed Micron's SALES label landing beside an EMPTY groove: the same class as Apple's,
         fixed earlier for Apple's variant only. Both now land as their bar arrives.
       - Final state: stylecheck CLEAN (18 places, longest 6.93 s), every-frame sweep CLEAN (every hand-over ≥ 15 f),
         violations CLEAN on settled frames, flash CLEAN (worst 23.6), all 18 camera whooshes within ±3 f, sfxsheet clean,
         guard clear, and contact sheets of 217 frames looked at.
     - **Timur, 2026-10-02: "the hook scene is sort of too crammed together."** After the pull-back everything sat
       in ~700 px. The chip was a 560 × 1040 slab with all four bars and "$37.7B" drawn across its face, its pins threading
       between the two pairs. The sales pair was pressed against the right rack, and the racks took ~30% of the width.
       - **The chip now stands ABOVE the bars:** a 340 × 450 package on the frame's centre, its foot ending above "$37.7B".
         The hook reads top to bottom (caption, chip, figure, bars), each with its own air.
       - The racks moved 40 px further out each side (slim edges), and the pull-back went from z −0.25 to −0.3.
       - ⚠ A far plane's R changes how it MOVES, not its size at its own station: pushing the chip from R 1.3 to 1.5 changed
         nothing in the close-up. To de-clutter layers, change the object's own size and position.
       - Hook range sweep CLEAN, violations CLEAN, stylecheck CLEAN.
     - **★ Timur, 2026-10-05: "remake the hook, right now there are too [many] elements on the screen in it."** By its last
       frame the hook held ~15 things: the chip, four bars, four figures, two labels, an axis, and server racks down both
       edges. ★ **A hook carries the FEWEST elements that tell its first line: its two real objects, a figure per side and
       at most one or two short labels, nothing decorative (no near-plane racks, no far-plane wallpaper, no second chart).**
       Count the hook's elements on its last frame before handback; more than ~6 is a defect.
       - **Rebuilt as THE CHIP AND THE iPHONE** (`places/hook.tsx`; the layered hook is archived in `retired/hook_layered.tsx`).
         A Micron memory chip settles onto the pool (moving on frame 0); "$37.7B" slams down under it with PROFIT; on "than
         Apple" an iPhone (its back: the iPhone 17 Pro camera plateau, the Apple mark) slides in at the chip's size as the camera
         pulls back, and "$29.8B" lands under it; on "on half the sales" the iPhone GROWS to 2.02× the chip's height (Apple's
         sales over Micron's, from `data.ts`). The big thing earned less. Six things on the last frame.
       - The construction is drawn at 1.15× about the chip's foot and hookB pulls back 0.35, recentring in x AND y (both derived
         from the construction's extent in hook.tsx, never typed). The racks were the film's FRAME place (§10.2); the camera
         now dives between the chip and the iPhone instead.
       - Checks: sweep 0–300 CLEAN, violations CLEAN, stylecheck CLEAN, sfxsheet clean, flash worst 18.1. hookB's airwoosh peaks
         at 86 and the picture moves most at 87.
     - **Timur, 2026-10-02: "make the slice that gets cut off the pie on the 70 cents scene larger for micron since its
       70/100."** Both slices of each coin used to move apart. On Micron's coin the small, dimmed 30% COST wedge drifted off
       and read as the piece cut off; on Apple's the 27% KEPT piece did. Now each coin tells it the same way: the slice the
       company KEPT slides out (34 px along its bisector, lit), and the cost slice stays in place and dims. ★ When a split
       shows a share, the piece that comes OUT is the share the voice names, on every object that shows it.
     - **Timur, 2026-10-02: "add the same micron stack animation for samsung and sk hynix on the scene at 35 seconds."**
       The side stacks now build die by die exactly like Micron's (each die dropping 14 f out of the exploded column), on
       "three companies", 2 f apart (Micron's 3 f would run past the scene). SK hynix's and Samsung's marks land only when
       their stack is complete (three + 29 / + 33), as the three light up on "almost all of it". This replaces the one-move
       closing column of 2026-10-01. Range sweep 560–1100 CLEAN, violations CLEAN, stylecheck CLEAN.
     - **Timur, same day: "look the piece of the pie chart that gets separated needs to be larger for the micron pie chart. It
       should be 70% of the pie chart."** The first fix (the kept slice sliding 34 px down-right) still read wrong: whichever
       piece is DIMMED and set apart reads as the separated one. Now the kept slice is CENTRED ON 12 O'CLOCK and lifts 60 px
       straight up, out of the coin, toward its "70¢" / "27¢". The cost slice stays put, barely dimmed, as what is left of the
       coin, and a dashed outline marks the hole. The figures rose 32 px to keep their air. The coin's thickness layers carry
       `data-probe-skip`: a cut line hidden 24 px under a face read as a LINE through "$1".
       ★ The separated piece must be unmistakable: it MOVES clearly away (≥ ~60 px), it is lit, and the remainder stays
       where the whole object was.
     - **Timur, same day: "the screen with the MU visual is a little too simple and random. Make it more relevant to the
       context. Improve it, don't replace it."** The board kept MU, its flat trace and the news marker, and now states the
       story. The marker carries RESULTS in lamps (block 3 × 5 letters: a diagonal S read as a 5). A ticker strip in its own
       housing under the board crawls the news, "MICRON PROFIT $37.7B IN ONE QUARTER", one lamp column every 2 f, with
       "PROFIT $37.7B" centred as the voice says "on the news". There is still no price and no move on screen (the brief).
       Range sweep 1780–2010 CLEAN, violations CLEAN, stylecheck CLEAN.
     - **Timur, 2026-10-02: "28 sec change the money tag for something else" and "37 sec - 55 sec repeating boring animations
       with the same concept of losing and gaining money please change that just ask it to redesign those scenes."** Four
       constructions in a row were money amounts growing or shrinking: the price tag doubling (whyA2), the banded-money
       stack (whyC), the 1-vs-10 profit blocks (whyD), and the profit bars around zero (honestA). ★ Standing lesson: across
       consecutive scenes, vary the CONCEPT and the MECHANISM, not just the object. Several "a money amount grows/shrinks"
       scenes in a row read as one boring animation repeated, even when every object is different.
       - **The redesign:**
         - **whyA2 (28 s):** a PRICE THERMOMETER on its printed backboard, scale 1× / 2× / 3× linear from zero, centred
           under the stick. It rises in on "Price.", its 2× line lights on "the price of memory", and the column climbs
           past 2× to 2.3× on "more than doubled". The fab's dashed 2× stays empty: same mark, two outcomes.
         - **whyC:** an AUCTION. One memory chip in a glass case on a pedestal under a spotlight (supply), and a crowd of
           bidding paddles rising from the frame's bottom edge (demand). Each paddle carries a server (the data centres),
           not invented bidder numbers. The bids lift higher on "every extra dollar of price", and the gavel strikes on
           "pure". The lot is drawn at 1.35×: at 1× it was a detail in empty space.
         - **whyD/whyD2:** a MECHANICAL COUNTER. The drums roll to "$ 8.5 B" under a FISCAL 2025 plate; the plate flips to
           2026 (a new cue, `fy26`); on "$85 billion" the digits SLIDE ONE PLACE LEFT past the fixed decimal point and a 0
           rolls in ("$ 85.0 B"); 10× lands. Ten times shown as the decimal point moving.
         - **honestA/honestA2:** a ROLLER COASTER whose track IS FY2018–FY2025 net income, on one scale from the ground
           (zero). It draws itself on "boom-and-bust" with the car behind its head; the car plunges into 2023's red pit
           on "lost"; −$5.8B lands. FY2026 is left out: on this scale it would flatten every cycle (it is the counter's).
         - **Timur, same day: "undo the changes to that price tag visual, bring it back instead of this thermometer."** The
           price tag is back, exactly as it was: it swings in on "Price.", its dashed 2× outline draws, and it grows past it.
           The thermometer is withdrawn. ★ Timur likes the tag: keep it; "change X for something else" can be reversed once
           he has seen the alternative.
         - **Timur: "make the cart on the roller coaster more realistic and smoother."** The car stepped from sample to sample
           and took its tilt from two points either side, so it shuffled and wobbled. Everything on the track now moves by ARC
           LENGTH, interpolated between samples. The tilt comes from a tangent smoothed over ±16 px, and the track grows
           continuously. The car is a real coaster car: a chassis wrapping the rail, running wheels on top and up-stop wheels
           under it, a tub with a rounded nose and side stripe, two rows of rounded seat backs with lap bars. A two-car train
           was tried and dropped: the 2023 pit is a tight V (the real data), and two rigid cars folded into each other there.
         - **Timur, same evening: "the cart on the roller coaster should be slower and smooth."** The car was still tied 30 px
           behind the drawing track. It rode 2018 → 2022 in under a second (61 px/frame at its fastest), stopped DEAD on
           2022's point (which sits on the drop's slope, so it hung there tilted 56°), waited 40 frames, then dropped, and it
           came to rest tilted 40° on the pit's wall. The car now has its own ride (`places/coastride.ts`, pure, measured
           frame by frame by `scratchpad/ridecheck.mjs` on the real module):
           - it waits on the LEVEL top of the first hill, leaves from rest once the scene has slid in, and eases through each
             bend (it slows where the track turns tightly, blended over ~150 px so it never lurches);
           - it crawls to a stop where the track is level on top of the last hill, hangs, then drops from rest, gathering
             speed and braking to rest LEVEL on the pit's floor;
           - its wheel sets sit on the rail and the body follows the line between them, so it tilts as a rigid car does.
           Measured: top speed 61 → 13 px/frame, no speed step anywhere (≤ 1.3 px/f²), tilt ≤ 12°/frame (it was 96° in one
           frame), level at both rests. ★ **A car or any object that RIDES a path moves on its own eased timeline, never
           pinned to a drawing line's head. It stops only where a real one could stand still: level ground.**
         - Retired files: `retired/dollars.tsx`, `tenx.tsx`, `cycle.tsx`. The pit fades from dark red to the stage's navy:
           a near-black red failed stylecheck COLOUR (neither the logo blue's family nor a loss red).
   - **Video 5** is `Videos/Video 5 — Nvidia Buyback/` (Studio 3405, serve 4405), started 2026-10-05, cloned from Video 4
     (module `src/buyback/`). Composition `NvidiaBuyback`. The brief: "Nvidia Is Spending $235 Billion Buying Itself" (the
     Sept 28, 2026 $150B authorization; one teach: what a buyback does), with a MANDATED layered hook (a GPU die, an extruded
     "$235 BILLION", share certificates streaming into the die, McDonald's on the same scale).
     - **The script was verified and SENT before the build** (root rule, 2026-10-01). Seven lines are corrected and armed in the
       guard; guardtest proves every direction. The one FALSE line: "on Friday, the stock closed at a record high". Oct 2 was a
       record INTRADAY high ($237.88); the close ($233.95) sat under May 14's record close ($235.74). Quartz's "closed at an
       all-time high" was filed two hours before the close. ★ **Check a "record close" against the day's actual close, never a
       story filed during the session.** "$5.7 trillion" was intraday as well ($5.649T at the close → "nearly five point seven").
     - **★ THE BRIEF'S WORD COUNT IS IN DIGITS; THE VOICE READS SPELLED NUMBERS.** "~180 words, sized to fit" became 268 words
       spelled out, and it measured ≈ 87.5 s of voice, over the 80 s cap with the close. That figure is the synthetic take
       (synth.mjs) × Video 4's measured ratio, real 75.6 s / synthetic 64.6 s = 1.17 with the same voice. Seven lines were
       tightened for length (script.mjs `TRIMS`, not armed in the guard: the longer lines are not wrong); every beat stays.
       Now 231 words, ≈ 76 s of voice. **Measure every brief's script this way before sending it.**
     - **The build: seven constructions, sixteen places** (the full list heads `src/buyback/Video.tsx`).
       - The die and its certificates, then a certificate stack against McDonald's bar.
       - A horizontal record board.
       - NVDA's real daily candles, $0-based, with an area under the closes so the band has body.
       - The pie.
       - The profit tank with its two pipes.
       - The value tower and its 4% slab.
       - Three quote plates: the low, the record, and NEXT with rolling drums.
       - Each construction that carries more than 7 s of voice is TRAVELLED across.
       - Every place's first frame is computed ONCE (`places/registry.tsx` T0), and the constructions' windows and the score
         read it there.
     - **The mandated hook, built to the fewest-elements rule** (Timur's note of the same day). Sharp, no motes, no bracket
       (STYLE §10.1).
       - Five certificates in flight, not a dense stream.
       - The brief's "bars beside the number" became a certificate-printed BUYBACK bar and McDonald's bar with its arches.
       - The exit is a push AIMED at the die (`aim` + `tilt` derived in hook.tsx): the camera follows the last certificate in.
     - **What the first stills caught:**
       - The die drawn as a 6 × 6 even grid read as an office building's WINDOWS. It was redrawn as silicon: GPCs of SM tiles,
         an L2 band, memory-interface strips with PHY bumps.
       - A stack of thin sheets read as a tower's floors.
       - A travel and a lifted slab both pushed into the caption band.
       - "ABOUT 4%" clipped the frame edge.
     - **Logos on white are NAVY, not their own colours:** stylecheck COLOUR refuses Nvidia's green, so the marks follow Video
       4 (navy on white, white on dark).
     - **The real take landed the same day** ("I also put the VO in public"), read from the corrected script.
       - The guard shows 0 active of 7, and every line is said as corrected.
       - 83.1 s raw → 69.8 s trimmed; the film runs 73.1 s.
       - **Whisper JOINED "share back" into "shareback"**, the reverse of its usual compound split. captions_vo.mjs splits it
         back, and the pie's travel anchors on "buys a share back".
       - The take ran "…4% of NVIDIA, because NVIDIA is worth…" on as one sentence, so the tower's travel anchors on the WORD
         "because".
       - The bed is the previous video's Radiohead, every window at 3.5 dB within 0.1, the tail included.
     - **★ Timur, 2026-10-05: "Fix the pie chart animation, since the slices in the pie should be removed as if they were
       actually in the pie, and not overlap the rest of the pie as they are rising."** Each removed slice was drawn on TOP of
       the pie and rose 240 px, so it crossed the slices behind it. ★ **An object taken out of a construction leaves the way
       the real thing would:** it slides straight out along its own radius, in its own depth (painter's order with the rest),
       and dissolves once clear of the rim. It never passes over the parts it was cut from.
     - **★ Timur, same note: "The second scene sort of just copies the visual from the previous video, so choose a different
       visual."** The record board was Video 4's results rows again: horizontal extruded bars with marks and figures on white.
       It is now a HIGH JUMP (`places/record.tsx`): two uprights with $0–$250B marks, and the crossbar raised to $150B
       (RECORD), with Apple's 2024 bar dashed at $110B. ★ **Compare each new scene's construction with the PREVIOUS video's
       scenes, not only with this film's.** The no-repeat rule held within the film, while the scene still copied the last
       film's signature.
     - **Timur, 2026-10-05: "the share certificate at the end of the hook should be above the bar chart layer, not below it."**
       The certificates were painted before the comparison bars, so the last one, flying from the lens into the die, passed
       BEHIND the bars. ★ **Whatever flies from the lens is the nearest thing in the shot: it paints over every part of the
       construction it crosses.** Painting order follows depth, not the order the parts were written in.
     - **Timur, 2026-10-05: "use another song".** No song was named, so the bed became the Succession track, the established
       Bankers alternative (Video 2), copied from Video 2's `public/`. The Radiohead envelope and baked bed are archived
       (`scratchpad/bedenv.radiohead.json`, `bed.radiohead.mp3`). ⚠ Commercial (HBO): flag the client's rights.
     - **⚠ A clone carryover the cloning checklist missed: `sweep.mjs` held the previous film's place ids, TYPED by hand.**
       - Every hand-over of the new film read "0 f" against names that no longer exist (whatC, whyA…), and the sweep refused
         for the wrong reason.
       - It now DERIVES the list from Video.tsx's PLACES and refuses if it finds none.
       - After cloning, grep the scratchpad for the previous film's PLACE IDS as well as its module name and composition id.
   - **Video 6** is `Videos/Video 6 — Confidence vs Cruises/` (Studio 3406, serve 4406), started 2026-10-05, cloned from Video 5
     (module `src/confidence/`). Composition `ConfidenceVsCruises`. The brief: the Conference Board's September confidence
     (81.9, lowest since April 2014) against Carnival's Q3 results on the same morning. One teach: soft data versus hard data.
     It mandates a layered hook: a cruise ship, a confidence line diving to "81.9", "$7.6B" rising, survey cards and boarding
     passes.
     - **Twelve lines corrected and armed before the take; guardtest proves every direction.**
       - **The FALSE one:** "a record 7.6 billion dollars in customer deposits". It is a THIRD-QUARTER record; deposits peak
         every spring, at $9.0B on May 31, 2026. ★ **Read what the company calls a record ("third-quarter record", "record
         for the period") before a line says "a record".**
       - "Same Americans" overstates: US guests are 55.8% of Carnival's revenue.
       - "Wall Street barely reacts to a bad survey" is contradicted by research (this index's surprises do move stocks).
         The line now says what happened that day: the S&P 500 −0.17%.
       - "Usually follows" became "can follow".
       - The rest are relative time: "just" ×2, "On Tuesday", "next year", "next summer", "this year".
     - The bed is the previous video's Succession track (rule: the same song unless Timur names another).
     - **The real take landed the same day** ("vo in public, continue"), read from the corrected script: 98.9% of its words in
       order, every correction said, the guard at 0 active of 12. 77.8 s raw → 65.2 s trimmed; the film runs 68.6 s.
       - Whisper wrote "S | &P | 500" (three tokens) and "third quarter" as two words: captions_vo.mjs merges the first, and
         the `q3` cue accepts either.
       - The bed: every 10-s window and the tail at 3.5 dB under the voice, within 0.1.
     - **The build: ten constructions in sixteen places** (the list heads `src/confidence/Video.tsx`).
       - The brief's hook as three DEPTH PLANES (registry.tsx `planes`): the ship at R 1.25, the line and figures at 1,
         the survey cards and boarding passes at 0.6. ★ **A plane behind the MID must still pass the lens on the exit
         push:** at R ≤ 1.25 + the travel's pull-back it is gone by the push's end, so it never unmounts on screen (VANISH).
         The dive's aim and tilt are DERIVED from the dive point and the ship's plane distance ((p − 540)·R).
       - The exit's first dive point (the bow, y 1405) needed a 496-px tilt, past STYLE §8.3's 420: it moved up to deck 3's
         glass front.
       - Every year's low 2014–2026 (counted from the index's own months, so "lowest since 2014" is shown, not asserted);
         Carnival's Q3 deposits as stacks of $1B blocks; a ship's deck plan half lit; a canal lock whose water level is
         CCL's price; a survey on a clipboard beside a card terminal; a spirit level; a cash register; a suitcase with a 2027
         tag; two dominoes. None repeats Video 5's die, high jump, candles, pie, tank, tower or quote plates.
       - **A gradient id can look like a colour to the checker:** `#fcFace` parsed as a hex (hue 57°) and COLOUR refused.
         Name gradient ids with a non-hex letter early (`fuelFace`).
     - **★★ Timur, 2026-10-05: "the third scene is a bar chart after the bar chart in the second scene. Prevent these sorts of
       things by avoiding visual repetition in the same video. Replace it with different visuals."** The yearly-lows columns
       (whatA) were followed by Carnival's deposits as four stacks of $1B blocks (whatB). Different objects, but the same
       VISUAL: a row of solids whose heights are the data. The no-repeat audit had compared objects, never kinds.
       - The deposits became a banknote-counting machine counting Carnival's deposits up to $7.6B (`places/counter.tsx`).
       - ★ **Every place now declares its construction KIND** (STYLE §10.2: bars, line, candles, pie, dial, steps, grid, fill,
         counter, object), and **every kind except `object` appears at most once per film**. stylecheck KINDS refuses a missing,
         unknown or repeated kind from Video 6 on, and proves itself on canaries.
       - **The same audit, done by eye on the objects, found three more repeats the note implied:**
         - a second cruise ship (in the lock) right after the deck plan of one: the lock now lifts a CCL channel buoy;
         - two machines with keypads and displays (the teach's card terminal, then a cash register), with the counting machine
           a third: the register became the survey's postage-paid reply envelope beside a heavy bank deposit bag;
         - the survey card again, on the register's counter.
         ★ **Before handback, list every scene's KIND and its hero object's FAMILY (ship, machine with a display, card, …) and
         look for any family twice.** The check covers kinds; families are still judged by eye.
     - **★★ Timur, 2026-10-05: "Instead of having the cruise together with the other visuals in the hook scene, I want you to first
       show the rest, and when the cruise is mentioned, the camera should sort of pan in some direction and only the cruise ship
       along with related visuals should be visible."** The brief's layered hook had stacked both subjects in one frame (the ship
       behind the line and "81.9"). It is now TWO framings: hookA holds the confidence line, "81.9", 2014 and the falling survey
       cards; on "Cruise bookings" the camera slides right to hookB, which holds only the ship, "$7.6B" / Q3 RECORD and the
       boarding passes. ★ **When a hook names two subjects, give each its own framing and pan on the word** (STYLE §10.1).
     - **★ Timur, 2026-10-05: "the blur effect doesn't have any intro transition, I need you to fix that. It needs to happen
       smoothly."** The push-past rack ran over 4 frames, so the outgoing place (the hook's cruise framing at rackGain 2.2) jumped from
       sharp to ~16 px of blur in about two. The rack's blur is now the full rack's blur × an INOUT ramp over the push's first 12 f (18 left the outgoing sharp while the incoming faded up; the incoming now fades up over [t0 + 2, t0 + 14])
       (Video.tsx `rackNear`, which solves the nearAt that gives exactly that blur at the layer's live distance) (STYLE §8.4).
     - **★ Timur, 2026-10-05: "start the line at the very beginning earlier, and add that smooth camera follow effect to it."** The
       hook's line was already two-thirds drawn on frame 0. It now starts at its first point on frame 0, framed close in on its
       head; the framing follows the head on a smoothed path and eases back to the whole line as "81.9" lands (hook.tsx
       `follow`; STYLE §10.1).
     - **★ Timur, 2026-10-05: "right now the camera following the line at the beginning is too jittery, look at how its done in the
       100bps videos."** Two faults, both found by reading Style 3 V29's `MonthPair` and V12's stake column: my follow moved INSIDE
       the Turn (100bps puts the camera transform AROUND it), and it aimed at a moving average of the series, which still bobbed with
       the 2020 dip (100bps aims at a steady eased value). Now one transform wraps the Turn, aimed at a straight path from the line's
       first point to its last. `scratchpad/followjit.py` measures it on lossless single-tab frames (survey cards and the landing
       "81.9" masked — its own scale is not the camera): 0 reversals, worst jerk ≤ 0.17 px (limit 1.5). The follow framing sits at
       y 990, not 900: at 900 the line's box (its 2019 peak, off-screen left) reached the caption band as it eased back.
       - ⚠ The same frames rendered with TWO tabs differ on alternate frames in the falling survey cards (a filtered SVG in a rotated
         card): tab raster state. The master renders single-tab (render.mjs 1), and the Studio previews in one tab.
     - **Timur, 2026-10-05: "remove the survey visuals that keep falling in the very beginning of the video."** The survey cards
       (the brief's "survey cards tumbling down") are gone with their depth plane; the opening is the line and "81.9" alone. The
       boarding passes in the cruise framing stay. (STYLE §10.1: no props falling through the opening framing.)
     - **Timur, 2026-10-05: "change the icon for prices."** The price tag over "prices" became a shopping cart with groceries in it
       (a milk carton and a loaf): the cost of goods the survey's write-ins named.
     - **Timur, 2026-10-05: "use yeat for the song."** The bed became the Yeat track (`music_yeat.mp3`, from Video 4's public/), its
       drop (13.29 s in the source) landing on "On September 29" with the hook over its quiet intro (8 dB under the voice), the
       body 3.5 dB under. The Succession envelope and bed are archived (`bedenv.succession.json`, `bed.succession.mp3`).
       ⚠ Commercial: flag the client's rights.
     - **★★★ Timur, 2026-10-05: "fix up the dominoes, especially the edges. Also enforce the no overlap rule throughout the entire
       video: No visuals from different scenes should overlap, even if its one fading out and the other fading in."** STYLE §9.8
       (the same rule OffCamCelebs adopted as its rule 41 that day): hand-overs keep places apart in space (slides) or in time
       (pushes: the outgoing dissolves through the lens before the incoming shows), and the question no longer holds over the racked
       honest part. The sweep's SCENES check judges every cross-place pair at any opacity, blurred or not, flyers included.
       - **How it was enforced:**
         - **Pushes** (the dive through the ship's glass, and the terminal → the spirit level): every layer of the outgoing place
           (MID, depth planes, FG, frame) dissolves over [t0 + 4, t0 + 16] as it swells at the lens (`PUSH_OUT`). The incoming
           place fades up over [t0 + 16, t0 + 28] (`PUSH_IN`). The field stands alone 6 f between them.
         - **The question** became a SLIDE (STYLE §8.10). It starts 33 f before "Have", carries the dominoes out through the left
           edge, and leaves a 4-f gap before the first word. Its old hero rack is gone.
         - **Slides** were already apart in space. The first full run found no cross-place pixel anywhere, including the hook's
           boarding-pass plane on the pan.
       - **The checks:**
         - `scratchpad/scenes.mjs` (imported by `sweep.mjs`) refuses any cross-place overlap at any opacity. Its canaries: a 10%
           blurred overlap must fire; touching, a carried item and one place's own layers must not; a tilted hull-only overlap
           must not.
         - The sweep's HANDOVER line measures each push and the question in time: they may never share a frame, and the gap must be
           under 8 f. Slides keep OVERLAP ≥ 15 f.
         - Final full sweep: SCENES CLEAN on all 2058 frames.
       - **The sound followed:** a push's whoosh now peaks mid-dissolve (t0 + 10, STYLE §11.1); the camera's fastest frame falls on
         the empty field. The opening's whoosh moved to +27: with the survey cards gone, "81.9" arriving is the motion.
         whooshsync: all within ±3 f.
     - **★★ Timur, same note, then: "also fix up the suitcase, and any other complex visuals, as most of them are messed up when you look
       closely."** Every object was rendered at rest at full size and inspected part by part (`scratchpad/closeups.mjs`), and every
       glitch fixed (STYLE §6.8a). The dominoes' fault was the class: a rounded face with sharp extrusions bolted on, a depth that
       rotated with the tilted domino, and SOFT's thickness painted across HARD's face.
     - **Timur, 2026-10-07: "use the song I put in the new 100bps video's public folder."** The bed is now Future, "LIKE ME"
       (Instrumental): the Y2Mate rip in Style 3 Video 34's public/, copied in as `public/music_likeme.mp3` (STYLE §11.3).
       - **The track:** an intro at −16 to −18 dB, then the beat hits at 12.85 s, with no gap before it.
       - **The drop:** DROP_SRC 12.80, so the 0.1 s gain step completes as the beat lands. The hit falls on "On September 29"
         (10.02 s in the film).
       - **The mix:** two controller passes from the rendered stems put every window within 0.1 dB of its target: the intro
         at 8.0 dB under the voice, the body and the tail at 3.4–3.5. The full mix is −22.2 dB mean, −5.2 dB peak, with no
         clipping.
       - **Archived:** the Yeat envelope and bed (`bedenv.yeat.json`, `bed.yeat.mp3`).
       - ⚠ A rip of a commercial track: flag the client's rights.
     - **Rendered on Timur's word (2026-10-07, "render")**, single-tab: `out/confidence_vs_cruises.mp4`.
       - **The file:** 68.65 s, h264 1080×1920 at 30 fps, AAC 48 kHz stereo, 22.2 MB.
       - **The guard** cleared it (0 of 12 blocking).
       - **Verified on the file:**
         - −22.2 dB mean / −5.2 dB peak, exactly the probe's numbers;
         - the tail after the voice is the bed alone, fading from −26 to −38 dB;
         - the worst one-frame brightness change on the decoded frames is 19.3 levels (limit 25).
       - **Served** on 4406 through srv.us forward 10. A full download through the tunnel matched the file byte for byte.
     - **Timur, 2026-10-06: "the blue shadow for the white line in the very beginning is too thick, make it thinner."** The hook line's
       extrusion used the solids' step (8 × +2.4 / −1.7, ≈ 23 px): under the opening's 1.5× follow it read as a ~35 px blue band under
       a 12 px line. It is now 8 × +1.0 / −0.7 (≈ 10 px). STYLE §6.3: a drawn line's extrusion is thin.
     - **Timur, 2026-10-06: "what are those two unlit windows on the cruise? fix that."** The bridge wing I added in the close-up pass
       carried two windows drawn DARK by hand, outside the loop that lights the other windows, so they stayed unlit as the whole ship lit up.
       Every window is now drawn by one helper (`win` in hook.tsx): the wing's two have the row's size and 12 px spacing, and light in
       the same left-to-right wave. STYLE §6.8a: a repeated part behaves as its siblings do; check objects after their animation, not
       only at rest. The other lit repeats were checked and are deliberate (the deck plan's unlit half is the "half booked" story).
     - **Sweep lessons from this build:**
       - **A construction drawn under `data-probe-skip` is invisible to the hand-over count:** four hand-overs read 0–13 f
         until the main SVGs were measured. Skip only things in flight.
       - **A depth plane behind a kept MID needs the MID's `data-probe-also` too** (Video.tsx `tag()`), or it counts for the
         wrong framing.
       - **The probe boxes SVG `<text>` by the font's full height, taller than its ink**, so print in a tight SVG surface (keys,
         a postage box, a label bar) reads as crowding its edges while it looks centred. Put such print in HTML over the SVG's
         frame (teach.tsx `KeyDigits`, costs.tsx `EnvelopePrint`); the HTML ink boxes are calibrated.
       - **LINE samples SVG outlines with a 2-D matrix, which drifts under a Turn while the object moves**: the "9" key "crossed"
         its own digit for 15 frames of the terminal's descent. Checked at full size (centred, nothing crosses), and listed.
   - **Video 7** is `Videos/Video 7 — Record High Narrow/` (Studio 3407, serve 4407), started 2026-10-07, cloned from Video 6
     (module `src/narrow/`), with `Resources/kit/` copied over its engine. Composition `RecordHighNarrow`. The brief: "A Record High.
     Three Out of Four Stocks Are Falling." (RECORD HUNTER), the S&P 500's Oct 6 record close against weak breadth. One teach: the
     index is weighted by company size. It mandated a layered hook (a 500-tile wall, the line drawn live, five tiles rising as
     towers, an exit flown between them).
     - **Facts, checked before the script went back** (three research agents in parallel). Twelve lines are corrected and armed in
       the guard; guardtest proves every direction:
       - "Three out of four… are FALLING" → "Seven out of ten… are in a downtrend" [high]. On the record day, 29.48% of S&P 500
         stocks were above their 50-day average (Investing.com S5FI). The brief's 25% was The Kobeissi Letter's undated
         late-September reading. ★ And "below the 50-day" is not "falling": Oct 6 itself was a broad up day (NYSE advancers 1.93
         to 1; the equal-weight index matched the cap-weighted +0.6%).
       - "That's not a rally. That's five companies." → "Five companies are nearly a third of it." [high]. The record day was
         broad, and "not a rally" is a judgment (§5).
       - "Twenty-eight percent" → "thirty-one" [high]. ★ 28.42% is the top five TICKER LINES. Alphabet has two share classes, so
         the five largest COMPANIES are 30.86% (SPY, Oct 5). **Merge share classes before any "top N companies" figure.**
       - The breadth lines are dated to Oct 6 in ONE dataset (S5FI / S5TH). "And the index keeps rising" became the verified
         same-day contrast: 134 NYSE new lows against 50 new highs on the record day (WSJ Markets Diary).
       - No relative time ("just", "On Tuesday", "today"). "Buy 'the whole market'" became "an S&P 500 fund": spoken aloud, the
         quotation marks vanish.
     - **★ The brief's word count was in digits again** (Video 5's lesson). Spelled for the voice the corrected script ran 246
       words, ≈ 78 s of voice. Two trims and a few tightened corrections brought it to 234 words, with no claim cut.
     - **The take landed the same day**, read from the corrected script: guard 0 of 12. It trimmed to 77.0 s, which would have
       made an 80.9-s film against the 80-s cap. ★ It was FITTED before any word was cut (root CLAUDE.md, 023): a 3% atempo
       stretch (pitch kept) gave 74.8 s of voice and a 78.3-s film. The unstretched trim is kept in `out/`.
     - **Weights, ONE dataset:** SPY's full holdings as of Oct 2 (Schwab's page, 506 lines, read in the built-in browser; the Oct 5
       stockanalysis.com page shows only 25 rows without an account). `scratchpad/weights.mjs` merges share classes (501
       companies) and REFUSES unless every spoken weight claim holds on the list: NVDA 8.49%, top five 30.69%, bottom 250 8.06%.
     - **The hook line is ZERO-BASED** (§5): weekly closes since 2019 (2,305 → 7,819). The April-to-October run on its own would
       only "climb" on a cropped axis.
     - **The hook, built in the Bankers vocabulary:** every plane SHARP, no motes, and RECORD HIGH lands with weight and no
       overshoot (the brief asked for "overshoot"; the house lands with weight, no bounce). It is its own CSS 3-D rig
       (spine.tsx): the wall at z −520 tilted back 26°, the line at z 0, the type at z +140, and five tiles rising as glass
       towers. Its camera follows the line's head on a steady path, then pulls back on the reveal. The exit push's aim and tilt
       come from the towers' projected centre (`hookDive`).
       - ★ **An `opacity` below 1 on a `preserve-3d` element FLATTENS it in Chrome.** The wall's fade-out turned the towers
         into flat squares. The fade now goes on each tile's colour.
     - **The spine is ONE construction in one file** (KIND "grid"), so the brief's sanctioned recurrence does not trip the KINDS
       check: the hook's wall, then the teach's 500 equal tiles → a squarified map of the 501 companies by weight → Nvidia 8.5%.
       ★ Three teach travels in a row broke the CAMERA rule, so the middle one is a SLIDE along the same construction. The five
       giants ride it into a block (31%), and the bottom 250 stream into a strip beside it on the same area scale (8%).
     - The bed is "LIKE ME" (STYLE §11.3), its drop on "On October 6th": every window within 0.1 dB (intro 8.0, body 3.5).
     - **Sweep lessons from this build:**
       - **A construction that slides off-screen comes BACK on a slide in the other direction.** The teach's map left through the
         left edge on the slide to the comparison. The slide back to the bill brought it in again, under the bill (SCENES,
         frames 1474–1515), then unmounted it on screen (VANISH). It now dissolves while wholly off-screen.
       - **A shape cropped by an SVG viewport, or hidden by `overflow: hidden`, is still measured whole.** Each half of the cut
         bill drew the whole bill's frame and oval. As the slice lifted, its invisible outlines "crossed" the other half's print
         (clearance gap 0). Each half now draws ONLY its own shapes and print.
       - **Print laid across a construction's internal seams reads as crossed by them** (the five tiles' edges through "31%").
         The five MERGE into one block as they land, before the figure appears. Things flying past printed type arc around it,
         their sideways travel leading their climb.
       - **A figure must stay readable before the move that removes it.** 8.5% on its own word had under a second before the
         five lifted out. It now appears on "NVIDIA", counts up to land on "nine", and the slide waits ~1 s.
       - **A slide's hand-over needs both places' bases on screen.** The breadth scene's measure label was hidden until its word,
         so the slide into it shared 11 f. Shown with the camera's arrival, it shares 20.
       - **A camera travel goes where its construction's action is**, so the travel's whoosh lands on what the picture does most
         (whooshsync measured the bars' re-growth and the bill's lift, 21 and 11 f after the camera's peak). The travels now
         start on those actions.
       - ★ **`renderFrames` pads names to the RANGE's width** (root CLAUDE.md, V33). A re-swept range under frame 1000 left 3-digit
         copies beside the full set, and flash.py refused it. `scratchpad/remerge.mjs <a>-<b>` re-sweeps a range, normalises the
         names, merges the probe's frames and refuses unless the set is still every frame once. A range must contain a push or
         the close's fly-through, or the sweep's "no defocused item" self-check refuses.
     - **★ RESTYLED THE SAME DAY (Timur: "the video doesn't really look like the past videos … something with the visuals used and
       the colors"; §2.5.1c).** Every place was rebuilt in the series' solids, with the journey, the cues and the score unchanged:
       - **Hook:** the 500 tiles are lit keycaps on the ramp under the key light's pool (they were near-transparent navy); the
         towers are solid lit boxes; 71% is white with its label in the red, as Video 2's 48.1.
       - **Record close:** 34 MONTHLY candles (Jan 2024 → the record month, aggregated in `spx.mjs`) on an extruded floor rail.
         The 14 weekly candles, zero-based, were 10-px bodies on a 1,000-px column and read as a blue slab.
       - **Breadth:** two big 100% columns side by side (50-day, 200-day): the lit share above from the floor, the see-through
         red share below stacked on it. The thin bars sat in the upper left with half the frame empty.
       - **NYSE:** the facade in solids (extruded pediment, cornice, frieze, round columns with capitals and bases, steps). Its
         hairline flutes broke §6.9a. The board's flaps now turn as a real split-flap: the old top falls, then the new bottom drops.
       - **Teach:** keycaps set in an extruded slab on a Turn; the five merge into an extruded block and the bottom 250 into an
         extruded strip; the index is a lit ribbon. 8.5% moved above the map: the 860-px map's Nvidia tile is 168 px wide. Two
         rule slips went with it: a tile colour switched at 0.5 and a light wave that mounted each tile on a threshold.
       - **Bill:** a slab with stepped depth, a stronger engraving, the slice lifting into FIN.lit.
       - **Honest:** lit ribbons (thin extrusion), bead heads blended in, a floor rail. It had mounted its dots on `past > 0.98`
         and drawn by a guessed path length, which left a stray dot at a future's end before it drew (now `pathLength` 1).
       - **★ Timur, after the restyle: "the animation for the boxes at 37 seconds should be smoother, really focus on making it look
         good"** (the five giants lifting out of the map and riding the slide into their block, teachC). Then, the same minute:
         **"same thing for the one at 40 seconds, it should be smoother and the direction shouldn't change so abruptly for the
         little boxes"** (the bottom 250 streaming into their strip on a down-and-up arc). Treated as a class: every move of a
         piece between two framings is judged frame by frame (see STYLE §9.9).
       - **★ Timur, same session: "the background should be a little darker/less visible in the hook scene."** The lit keycap wall
         had swung too far from the first build's navy glass: it competed with the line and RECORD HIGH. A hook's backdrop
         construction sits clearly BELOW the line and the type in brightness (STYLE §10.1).
         Then: **"the edges of the group of boxes in the background of the hook scene shouldn't be visible, make them larger, but
         don't change the size of the lighting on them."** The wall now runs past the frame at every camera position of the hook
         (an unlit margin of tiles around the 500), and the key light's pool keeps its size in pixels.
         Then: **"the edge of the group of blocks is still visible, like I said, make the blocks in the background larger so that
         they can more easily fill up the screen. Also, the record high text should be smaller and right above the end of the line
         on the right. When the 5 blocks rise, they cannot intersect with the line, 5 blocks that are below the line need to
         rise."** The tiles are now 1.5× larger (the wall fills the frame at every camera position, its light the same size in
         pixels); RECORD HIGH sits small, right-aligned just above the record dot, in the line's own plane; the five towers are
         tiles BELOW the line on screen, chosen so their risen caps stay clear of it.
         Then: **"I told you to not touch the lighting for the hook scene, make sure its darker at the top when the camera zooms
         out so that the edge of the group of boxes isn't really visible."** The key light's pool stays exactly as it was (its
         size and centre in pixels on the wall, `poolAt`); on top of it the wall darkens toward its FAR top rows, reaching the
         navy before the wall ends, so the pulled-back framing shows no top edge. ⚠ When a note says "don't touch X", change
         nothing about X, and say in the handback that X is untouched and how that was checked.
         Then: **"instead of the record high text, add sp500, make it smaller, and ensure that it doesn't intersect with that circle
         that appears at the end of the line."** The label is now "S&P 500" (64 px, extruded, still landing on the reveal), sitting
         above the record dot with its box clear of the dot's glow ring at the ring's largest while the label is on screen. ⚠ The
         glow ring is `data-probe-skip`, so the sweep cannot see this clearance: it is computed from the ring's own radius.
         Then, after the render: **"LIKE I SAID MAKE SURE THE BACKGROUND OF THE HOOK SCENE IS FULLY COVERED IN THOSE BOXES."** ⚠ I had
         read "darker at the top so the edge isn't visible" as "fade the top boxes out", which left the top of the frame EMPTY navy:
         the opposite of what he asked for three times. The wall's boxes now cover the WHOLE frame at every frame of the hook (the
         wall runs far past the top edge; `scratchpad/wallcover.mjs` projects its outline and refuses any frame it does not
         cover), the top boxes keep their colour (darker only because they sit outside the light), and nothing fades them out.
         **Lesson: when a note names the goal ("fully covered", "edges not visible"), check the fix against the goal itself, not
         against the mechanism I chose.**
       - **Timur, same message: "replace the 100 dollar bill with a real bill."** Asked whether to download the BEP's public-domain
         Series 2009 $100 obverse from Wikimedia Commons (it carries Franklin's portrait), he answered: "I change my mind, don't add
         the real bill." The drawn bill stays.
       - **Timur: "the background in the hook scene is still messed up, theres a point on the upper half of the screen where you
         clearly see a gap between a group of blocks and the rest that are above. It should be consistent throughout the entire
         screen."** Cause: the 500 central tiles each sank 36 px (translateZ) as they dimmed, the margin around them did not, so
         from the reveal on a seam opened where the two groups met. No tile moves on its own any more: the dimming is colour only
         and the wall sinks as one. ⚠ **Anything that moves PART of a repeated backdrop opens a seam where the moved part meets
         the rest — check the boundary between any two groups of one backdrop at full size, after every animation that touches
         one group.**
       - **Timur, same moment: "Also make the circle that appears at the end of the line smaller."** The record dot's glow ring went
         from r 60–110 to r 30–56 (resting 40); the S&P 500 label's clearance is computed from the new radius.
       - **Timur: "the new york stock exchange 3d visual [could] look a lot better, improve it and focus on the details."** The facade
         was rebuilt from the real building's parts (11 Wall St / 18 Broad St): six Corinthian columns (acanthus capitals with
         volutes and abacus, fluted shafts in ≥ 20-px channels, Attic bases), end pilasters, a three-fascia architrave, the
         inscribed frieze, a dentilled cornice, the pediment with its sculpture group in low relief, the glass window wall behind
         the colonnade with each column's shadow on it, and the stylobate and steps. One light from the upper left throughout.
       - **Timur: "at exactly 37.27, a bunch of boxes turn into a larger box, but it isn't smooth enough."** The five landed tiles
         were cross-faded into a separate block whose face carried ONE gradient while each tile carried its OWN, so the picture
         swapped texture as it faded. Now the five share the block's gradient from the lift on (one light across the group), their
         seams and bevels fade out as they fuse, and the block's depth grows out of them over 16 f: nothing changes but the seams
         closing and the thickness arriving.
       - **Timur: "the stock exchange looks decent but the 3d effect is gone. It needs to look 3d."** The detailed rebuild drew the
         architecture as one flat SVG; only the steps, the board and the pediment kept their extrusion. Every part now has real
         depth on ONE vector up and to the right (stepped copies, dark at the back): the entablature as one deep block, each
         column and pilaster its own thickness, the pediment on the same vector, the window wall set back behind the colonnade.
         ⚠ **Detail never replaces depth: a Bankers object gains detail ON its extruded solids, not instead of them.**
       - **Timur, next: "the stock exchange building looks weird, simplify it, but make it look more 3d."** The 12-step copies
         left stair-stepped edges on the pediment and the entablature and dark slivers between the capitals, and the small parts
         (acanthus leaves, dentils, fasciae, the sculpted figures) read as clutter. The facade is now a FEW BIG SOLIDS, each with
         clean faces drawn as real polygons on the one up-right vector: a deep pediment prism with a recessed tympanum, an
         entablature block with the inscription, six ROUND columns drawn as true cylinders in the same oblique projection (block
         capital and plinth on each), square end piers, a window wall set well back behind them with the porch floor showing,
         and the steps. ⚠ **When a detailed object reads "weird", the fix is fewer, larger, deeper parts, not more detail: a
         part smaller than ~20 px at the film's framing is noise, and stepped copies are for shapes a polygon cannot draw.**
       - **★ Timur, same session: "use candlesticks for the scene at one minute"** (the honest part, THE INDEX against MOST STOCKS and
         the two futures, which had been lit ribbons). It is now two candle series with the futures as ghost candles of equal
         weight. The record close (whatA) is also candles, so the honest part's KIND line carries a `style-exempt` marker naming
         this request: a repeat of a chart kind Timur asks for by name is his call, recorded, never silent (STYLE §10.2).
       - **What the brighter look broke, and how each was found:**
         - The hook rig's `overflow: hidden` cut the lit wall into hard straight edges inside the frame on the opening frames (under
           ARRIVE the layer starts smaller than the frame). Dark tiles had hidden it. The clip is gone; the wall fades into the
           ground at its own rim (`TILE_POOL`).
         - A bright construction arriving on a push becomes the move's biggest change: the whatC → teachA whoosh read 15 f early
           (whooshsync). Slowing the wall's fade fixed that and opened an 8-f empty field (the push gap must stay under 8). The wall
           now ARRIVES DIM under a veil that lifts over the next two seconds: whoosh +1 f, gap 6 f.
         - `followjit.py` read the analytically unchanged follow as jittery (6 px): phase correlation locks onto a PERIODIC lit
           grid's pitch. `FOLLOWJIT_INK=235` measures the line's ink alone: 0 reversals, worst jerk 0.97 px.
           ★ After the wall was darkened, the ink-only measure rose to 1.8 px in steady plateaus every 3–4 frames: the line's
           GROWING HEAD adds new ink each frame and biases the correlation. Masking the head's side (`followjit.py … 1 84 0 520`)
           gives 0.18 px with the whole frame: measure a drawing follow on what is already drawn.
   - **⚠ Brand files load from the video's own `public/`** (copies of `Resources/brand/`, loaded
     with `staticFile()`), never imported from `../../../Resources`.
     - Imported from outside the project, the render bundled them fine.
     - The Studio, though, served them as an undecodable URL, and `<Img>` threw an error every few
       seconds during playback (Timur, 2026-09-26: "I keep getting an error message every few
       seconds").
4. **Worked example:** `Demo/`, the 15-second demo. It is Style 3 Video 26's grammar with the pass
   applied, built as the §2.5.1 journey:
   - `world.tsx` is the camera and the depth layers.
   - `scenery.tsx` holds each place's FG and BG.
   - `MOVES`, the stations and the caption camera are in `Demo.tsx`.
   - Clone those three for Video 1.
   - **Style frames (2026-09-26): four NEW visuals in the look, stills only.** Timur asked for "3-4
     style frames to showcase some new visuals but in this style. No video needed".
     - They are composition `BankersFrames` (`Demo/src/frames/Frames.tsx`), rendered by
       `scratchpad/frames.mjs` and saved in `Bankers/Style frames/2026-09-26 new visuals/`:
       1. a mortgage-rate terrain since 1971;
       2. $100-bill stacks for the payment on $400,000 (white stage);
       3. the Fed's staircase since 2022;
       4. Nasdaq vs S&P 500 as two ribbons of $10,000, under the tracking text.
     - Every figure is real FRED data (`scratchpad/frames_data.mjs`), or stated arithmetic on a
       stated hypothetical loan.
     - They are a menu of constructions for future videos. Log whichever one a video uses in
       `Videos/log.md`.
5. **The sweep** (`scratchpad/sweep.mjs` + `src/demo/Probe.tsx`) is the measured check for §2.5.1.
   Run it before every handback, and read its whole report.
   - **CROSS:** two sharp items of different groups overlapping. A layer's depth-of-field blur
     travels on its group as `data-blur`; items blurred ≥ 4 px are logged but never collide.
   - **OVERLAP:** refuses any scene change with under 15 f of co-visibility.
   - **CLIP:** only for PINNED text (caption, question, logo). World text crossing the edge is the
     camera carrying it out.
   - **HTML text is measured by its INK.** The horizontal extent comes from a Range; the vertical
     extent comes from the font's own glyph metrics (canvas `measureText` on the element's computed
     font), scaled by the Range's on-screen height.
     - This found a real near-touch the line-box method hid: the comma of "27,244" against its
       label.
     - Proven by squeezing the question's lines together and watching TEXT fire.
   - **Big shapes** (> 60% of the frame: a bar rushing past the lens) count toward OVERLAP but never
     collide. **Groups carrying `data-exiting`** (the question lifting away) are not CLIPs.
   - **A shape under a blur filter is logged as DEFOCUSED, not dropped** (Video 1).
     - It may be a glow, or an object still easing in from depth. Either way it is on screen.
     - Dropping it made every arriving place invisible to the overlap count: hook → chip read 0 f.
   - **Video 8** is `Videos/Video 8 — Emergency Oil Low/` (Studio 3408, serve 4408), started 2026-10-09, cloned from Video 7
     (module `src/oil/`), with `Resources/kit/` copied over its engine. Composition `EmergencyOilLow`. The brief: "America's Emergency
     Oil Is at a 44-Year Low" (RECORD HUNTER): the SPR at 283M barrels, its lowest since 1982. One teach: a reserve is a shock
     absorber. It mandated a layered hook (a glass tank behind, the SPR line drawn live across it, barrels rolling past the lens).
     - **Facts, checked before the script went back** (three research agents in parallel). Seven lines corrected and armed in the guard:
       - "a hurricane shut a QUARTER of Gulf oil production" → "nearly two-thirds", dated Oct 8 [high]. The 25% was the Oct 7
         report; Oct 8's was 62.89% (issued on bsee.gov by the Marine Minerals Administration, which since July 2026 has merged
         BOEM and BSEE).
       - "The coast it hit holds over half of America's refineries" → "The Gulf Coast holds over half of America's refining
         capacity" [high]. Over half is CAPACITY (54.4%), not the count (58 of 130); and Isaias had not made landfall, near
         Pensacola, where the coast holds ~3% of US capacity.
       - "Today, about 284 million" → "On October second, about two hundred and eighty-three million" (EIA's latest week:
         282.983M; 284 was a rounding of an earlier week). Plus relative time ("just", "today's prices"), "cut off" →
         "effectively closed" (EIA's words), and "kept" → "keeps".
       - ★ The brief's consumption figure (20.1M b/d) was an older STEO: the October STEO says 20.60 → 13.7 days, still "about
         two weeks".
       - ★ **Two Brent series disagree by ~$25 in 2026:** EIA's daily Brent is a SPOT price; the "$100.20 on Oct 7" is ICE
         FUTURES. The candles are drawn from futures (BZ=F daily, aggregated in `scratchpad/oildata.mjs`, which refuses unless
         Mar 12's $100.46 and Oct 7's $100.20 come out exact).
     - **The take landed the same day**, read from the corrected script (guard 0 of 7). It trimmed to 77.7 s; a 3% atempo stretch
       made 75.4 s of voice and a 78.9-s film. The unstretched trim is kept in `out/`.
     - **The hook, built in the Bankers vocabulary:** the tank is its own depth plane (R 1.25) behind the line, drawn on ONE scale
       with it (1 px per million barrels), so the oil's front edge IS the line's level and follows its head; the "dashed line to
       1982" is the oil's own surface. Kept from the brief: no text on frame 0, three planes, type only after the picture says it.
       Set aside for house rules: the blurred tank (§2.5.1), the motes and the overshoot (§10.1). ⚠ A line hook draws from its
       start (STYLE §10.1), but the brief asked for frame 0 "a third drawn" with the tank visible: it starts ~a quarter in, and the
       follow is MILD (1.08×, leaning 30% to the head) — the first 1.22× follow pushed the tank into the caption band and cropped it
       on frame 0. ⚠ Like Video 7, the hook draws a line live (the brief's mandate) — the log's "no same hook type twice" is flagged.
     - **★★ Timur, after the first handback (2026-10-09): "RECREATE ALL THE VISUALS, BE MORE CREATIVE AND STOP DEVIATING FROM THE
       ORIGINAL SMOOTH BANKERS STYLE. THE VISUALS NEED TO BE DETAILED AND GOOD LOOKING."** The first build drew most places as flat
       SVG illustrations (a map sheet, a flat disc, line-drawn valves, a sea plane of tiny rigs, a hand-drawn pump): every check was
       clean and the film still read as another channel. Every place is rebuilt in the series' own vocabulary — `Solid` blocks with
       the FIN gradients, white inset, cap and side, glows and pools, big Anton figures sitting on their solids, detailed real
       objects at Videos 1–6's level of construction — and each idea is staged more inventively, not as a diagram.
       **The smoothness reference he named, the same turn: "look at the smoothness of visuals in the Americans now feel worse video for
       100bps" and "the Two companies are now fifteen percent video"** — Style 3 Video 30 ("Americans Feel Worse Than 2008. Stocks Are
       at a Record.") and Style 3 Video 28 ("The S&P 500 Has Never Been This Concentrated in Two Stocks"). Their renders and source are
       the bar for how smooth and polished the rebuilt places must look and move.
       **And, the same turn: "overall, the style (fonts and some of the visuals), look a little too childish. I need you to sharpen them up
       a tiny bit, make the vibe more premium and smooth."** So: labels at the small end of the range (30–32 px), widely tracked and
       muted, one per figure; figures clean white Anton without chunky blue extrusions; objects in darker graphite-blue and chrome
       with fine detail (hairline seams, screws, inset bezels, soft speculars) rather than pale, rounded, toy-like fills; no
       hand-drawn or cartoon shapes; colour used sparingly.
       ⚠ **Before building a place, open the matching kind of place in Videos 4–7 and build with the same parts. A drawing that only
       LOOKS like the brief's object is not a Bankers visual.**
     - **Process lessons:** the clone's rename missed tools that join the module path as `"src", "narrow"` (still.mjs failed on a
       missing captions file) — grep the scratchpad for the old module name in split form too. A helper file in `places/` must
       declare a KIND or live outside it (stylecheck KINDS): the shared drawing helpers are `src/oil/okit.tsx`. Looping flow
       pulses (`% 1`) fade with their position so they never pop back at full strength.
     - **★★★ THE REVISION BRIEF (2026-10-09, LOCKED / CHANGED / DIAGNOSE FIRST): "the current build reads as AI-generated because the
       scenes are illustrative and over-detailed. Replace them with the simple, chart-led vocabulary."** It became the standing rule for
       every Bankers video: `Resources/visual-vocabulary.md` (pointer at the top of this file; STYLE.md §6.8, §10.2 and §16). It supersedes
       the "detailed real objects" notes above. What changed in Video 8:
       - **Diagnosis** (one still per beat, `scratchpad/beats.mjs old|new`, sheets by `beatsheet.py`): the tank's liquid and the hook's
         rolling barrels and calendar; the Gulf Coast cutaway with its caverns and wellheads; the 1973 pump and its sign; the machined
         reserve gauge with lamps; the Hormuz diorama with tankers; the valve manifold and pipe; the ghost path; the coil-over shock
         absorbers; the rig under the storm spiral; the refinery on the pie. Kept: the 727M / 283M bars and the candles (now daily).
       - **Rebuilt as:** the hook's three planes (a plain glass cylinder behind, out of focus, its solid block at 40% ON THE CHART'S SCALE —
         rim = 714M capacity, cap = 283M; the line with its soft fill; the type in front), 14 DAYS over 14 squares, a push INTO the glowing
         dot that blooms and floods the white; four text-only beats as tracking text in the world (the chips step aside for them:
         `places/words.tsx` TEXT_SPANS); date blocks for 1973 and MARCH 2026 with a document card; the cylinder for FILL / RELEASE and
         THEN / NOW; 2026's DAILY Brent candles from $0; 63% over a progress bar; a 54% ring gauge; three equal floor cards; the question on a
         light frame with two pill buttons.
       - **Facts re-checked for the new items** (agent, 2026-10-09): the floors are Fortune, Oct 5 (DOE 70M "to safely manage the
         caverns", via a DOE spokesperson; Rapidan's "soft-ish floor" ~170M) and Misra's Aug 25 op-ed (~250M "practical operational
         floor"). ⚠ **The brief's "25.08% shut in as of Oct 8" is the OCT 7 report** (MMA: Oct 6 9.24%, Oct 7 25.08%, Oct 8 62.89%); the
         take says "nearly two-thirds", so the screen shows 63%. Its "284M" is shown as the take's 283M. Interpunct labels ("70M · DOE
         MINIMUM") became a figure plus one label (§5.7).
       - **Engine (asked for):** `track.tsx` takes `ink` (navy on the white stage, blended), and its accent gradient sits on an INNER span
         (the Style 3 V33 solid-box fix), with the unarrived accent word keeping its padding. stylecheck KINDS gains `text` (repeatable).
       - **Set aside, and said so:** the brief's "out of focus" background is honoured for the hook's cylinder although §2.5.1 says no
         blurred shapes behind — the brief asked for it by name.
     - **★★ Timur on the vocabulary rebuild, the same day: "the video is a bit better overall now but the visuals are too simplistic.
       They need to have more detail and actually be relevant to the context of the scene. For example the 1973 scene is just a
       block. That is too simple and random."** Recorded as "SIMPLE IS NOT BARE" (visual-vocabulary.md, STYLE §16): every scene shows
       its sentence's own sourced data at chart/instrument detail. What changed:
       - 1973: a block printed "1973" → a $0-based STEP CHART of Saudi Arabian Light's posted price through the embargo, $2.90 →
         $5.12 (Oct 16) → $11.65 (Jan 1974), the embargo's months shaded (Oct 19, 1973 – Mar 18, 1974).
       - Fill/release: an arbitrary level → the reserve's REAL last cycle on a graduated cylinder: bought back 347M (Jul 2023) → 415M
         (Feb 2026), released to 283M (Oct 2), its level read out as it moves.
       - March: a date block and a blank document → the real March 2026 calendar page with Mar 11 (the IEA agreement) ringed, then the
         release as a GRID of 40 squares of 10M barrels: the US's 172M lit, then the rest of the 400M from 32 countries.
       - THEN / NOW: unlabelled cylinders → graduated, with their barrels and DAYS OF COVER (727M ÷ 2010's 19.18M b/d ≈ 38 days;
         283M ÷ 20.6M ≈ 14).
       - 63%: a plain progress bar → the Gulf's Oct 8 output as 102 slices of 20,000 b/d, 64 going dark while 63% and 1,282,879 b/d count.
       - 54%: a plain ring → all US refining capacity in its five PADD regions with a legend of shares (EIA, Jan 1, 2026).
       - The floors: three cards → a level gauge at today's 283M with the three floors on its zero-based scale, one finish (no winner).
       - The hook's cylinder is graduated every 100M. KINDS now: line, steps, fill, bars, grid, candles, counter, pie, dial, text,
         object. ⚠ Facts NOT shown because sources disagree: the strait's closure date (EIA: Mar 2 and Feb 28) and the Jan/Oct 1, 1973
         price steps (OCR only).
     - **★★ Then: "too many on screen text scenes, replace them with good visuals"** (no text-only beats in Bankers from now on; the
       vocabulary and STYLE §16 record it; tracking text stays for the closing question). The four sentences became:
       - "It's called the Strategic Petroleum Reserve. Salt caverns on the Gulf Coast," → the reserve's SPLIT-FLAP BOARD (`board.tsx`):
         its name lights, then the four sites flip in with their state and capacity (DOE: 247M, 170M, 220M, 76M). Cavern counts are
         NOT shown: DOE's site page gives West Hackberry 21 caverns, its Quick Facts 22.
       - "Without the release… / …working exactly as designed." → the candle chart gains a RELEASE PANE, like a trading chart's volume
         pane: the barrels that left the SPR each week (EIA weekly, Mar 20 → Oct 2), drawn as the camera eases down onto it, then the
         total, 132M SINCE MARCH. No counterfactual path.
       - "Nobody knows when the next shock comes." → a TIMELINE of the reserve's presidentially authorized emergency releases (1991
         GULF WAR 17M, 2005 KATRINA 11M, 2011 LIBYA 31M, 2022 UKRAINE 180M, 2026 HORMUZ 172M — DOE's History of SPR Releases; 2026 carried
         out as an exchange), beads sized by barrels, and an unplaced NEXT ? drifting on the dashed future.
       - Sweep lessons: a far-right element (the NEXT bead) is the last thing a slide carries out, so the question's slide starts 43 f
         before its first word; a dashed line through a bead's text is broken round it; files edited by both shell scripts and the Write
         tool had MIXED line endings, which made multi-line edit anchors miss — normalise to LF before scripting an edit.
     - **★★ Then: "why would you add the buttons at the very end? with the different options? Don't deviate from the style."** The
       brief's pill buttons and light frame for the question were removed: the close is the house close exactly (tracking text on the
       dark field). The hook's background cylinder is SHARP again (STYLE §2.5.1), dim behind the line. Rule: a brief's vocabulary
       narrows what a scene shows and never overrides the style (visual-vocabulary.md, last section; STYLE §16).
     - **Then: "instead of the cylinder in the background in the hook scene, make an oil barrel visual with an oil symbol on it. Make it
       look good".** The hook's backdrop is a steel 55-gallon OIL DRUM (`spine.tsx` OilDrum): rolled body shaded round its curve, weld
       seam, two pressed rolling hoops with lit edges, chime, lid with two bungs, and an oil-drop emblem in a ring between the hoops; true
       drum proportions (H/W ≈ 1.47), sized so its lid stays clear of 283M BARRELS and the emblem clear of the dashed 1982 level. Sharp,
       dim behind the line, brightening on "that tank". The cylinder stays in the fill/release and THEN / NOW scenes.
     - **2026-10-10: "remove the lowest since 1982 text in the hook".** The record line is gone; the dashed level to 1982's point
       carries "since 1982" on its own. 283M BARRELS now lands in its slot on "…1982", sized like 14 DAYS (150 px), so the type rail
       reads 283M BARRELS → 14 DAYS. Its separate flick cue went with it (one landing, one sub).
     - **★ Then: "that faint white background filter … in the area below the line chart in the hook scene … replace that with an
       american flag, make it look good, but keep the opacity low and keep it see through. The oil barrel should also smooth into the
       scene from below, not just be on screen from the start."** The area under the hook's line is the US flag drawn to its
       construction (13 stripes, the canton with 50 stars; official colours, STYLE §2.2's flag exception), clipped to the area, low
       opacity, see-through, fading down to the floor like the old fill. The drum RISES from below the frame into its place (an
       ease-in-out, no overshoot) instead of standing there from frame 0.
     - **★ Then: "the bloom transition at 9 seconds needs to have that lens bloom effect, just like in 100bps".** The hook's exit push
       into the glowing dot (→ whatA) gets 100bps' LENS BLOOM treatment, rebuilt in Bankers' blues and white (the TECHNIQUE crosses,
       never 100bps' palette or branding).
     - **★ Then: "make the oil barrel enter when the camera zooms back out at around 3 seconds, and also make the camera zoom in closer to
       the line as it follows it before the barrel entrance".** The hook's opening follow is a CLOSE follow on the line's head (a real
       zoom in on the drawing line, tracking it), and the drum rises into place DURING the reveal's pull-back (~3 s, "…its lowest
       level"), so the pull-back discovers it, not the opening.
     - **★ Then: "the barrel should appear when the Heres how that sentence starts".** The drum rises into place as "Here's what that
       tank is actually for." begins (fastest on "tank"), not during the reveal's pull-back; it is absent from the hook until then.
     - **★ 2026-10-11: "instead of the 283M text add the 1983, and move the 283 down next to the end of the chart, and make it
       smaller".** The hook's big figure slot now carries the YEAR, landing on "…since 1982". It is drawn as **1982**, not the
       "1983" typed: the voice says 1982 and the dashed level lands on Oct 1982 (EIA: the last lower week, 280.802M), and the
       screen may never differ from the voice. This was flagged to Timur. 283M is a small value label beside the line's end dot, in
       the chart's own plane, so it rides the camera with the chart.
     - **★ 2026-10-12: "change the song to a good man with a broken heart", then at once "actually just use yeat"** (with Video 8's
       Studio open). The bed is the YEAT track (`music_yeat.mp3`, the established Bankers bed of Videos 1, 4 and 6), re-cut so its
       drop lands on the `what` section's first word and re-mixed from the rendered stems (intro 8 dB under the voice, body 3.5).
       LIKE ME's envelope and baked bed are archived (`bedenv.likeme.json`, `bed.likeme.mp3`). The 2026-10-11 MP4 still carries
       LIKE ME: a new render is needed for the Yeat version (only on Timur's word).
     - **Built (2026-10-10):** `src/oil/flare.tsx` (LensBloom, Style 3's optics and 41/4/32 timing, ghosts in the ramp, no CSS filter on
       a ghost), peaking at whatA t0 + 14 inside the pause (asserted), its source the dot projected through hookA's layer every frame,
       receding onto the board's name; the push's whoosh sits on the bloom's own rise (peak − 0.55 × swell) and whooshsync judges it
       against the LIGHT (`SFX_SHEET.LIGHT`). The follow is 1.55× at a FIXED height (at 1.6× easing to today's level the 2010 peak
       crossed the caption).
     - ⚠ **TWO CHECKS READ CACHED INPUTS, AND BOTH PASSED ON STALE ONES.** `flash.py` and `whooshsync.py` read `out/sweep_frames/`, which
       only `sweep.mjs 1 --keep` (the FULL film) refreshes. `whooshsync.py` also reads `out/sfx_cues.json`, which only
       `sfxsheet.mjs --json` writes. Range sweeps and a plain `sfxsheet.mjs` leave both stale. Two "CLEAN" results this session were
       read off yesterday's frames: the flag and drum round, and the first bloom pass. After any visual or score change, run the
       full `--keep` sweep and `sfxsheet --json` before trusting either check, and check the kept frames' date.
   - **Video 9** is `Videos/Video 9 — SpaceX vs Carriers/` (Studio 3409, serve 4409), started 2026-10-11, cloned from Video 8
     (module `src/sx/`, composition `SpaceXVsCarriers`). The brief: SpaceX's 800 MHz deal (announced Oct 8, 2026) and the carriers'
     Oct 9 sell-off; HARD 80-s cap; the brief's ★ HOOK SCENE mandatory (three planes; three stock lines over a phone).
     - **The script went back first** (root rule): three research agents verified every line live (the events post-date the model's
       training). Ten corrections, the guard armed before the take. The ones that matter:
       - "just spent" → "has reportedly agreed to pay about": nothing paid (FCC approval pending); the $8B is the WSJ's anonymous
         sources (terms undisclosed).
       - "doesn't compete in a single city yet" → "doesn't sell a phone plan of its own anywhere yet": Starlink already reaches
         T-Mobile customers as T-Satellite.
       - "simple physics" was Forbes's paraphrase — Schulman said "because of physics" (Jul 24 call); both CEO lines → "has said".
       - Verizon −8.75% is "almost nine", not ten. "On Thursday/Friday", "just", "Right now" → dates / dropped (§4).
     - **AT&T and Verizon went ex-dividend on Oct 9**: the reported moves (−9.81%, −8.75%) are net of the dividends (raw −10.82%,
       −10.14%). One basis everywhere — the reported one — in the voice, the hook's line ends, the bars and the $57B.
     - **The hook's lines are REAL closes** (Sep 25 → Oct 8, three history tables agreeing to the cent), each rebased to its own
       Oct 8 close so all three meet at the break, then the reported Oct 9 move. Not "flat": T-Mobile wanders 5% in the window — the
       brief's "flat and steady" was intent; the data wins.
     - **Built the house way where the brief asked otherwise** (visual-vocabulary.md, last section): the background phone is SHARP,
       the three text-only beats are visuals (a launch-target track, a $57B / 0 panel, a balance easing level), the closing question
       is the house tracking text (no "I'D SWITCH / I'D STAY" pills), labels carry no "·" chains. The licence's OWNER flap flipping
       T-MOBILE → SPACEX would say T-Mobile sold to SpaceX (it sold to Grain in Aug 2026): two true fields instead, BUYER SPACEX and
       FORMER OWNER T-MOBILE. The card arrives by a truck beside the chart, not over it (the probe has no occluder model).
     - **The take ran 90 s raw** (80.7 s trimmed): FITTED before any word was cut — pauses ≥ 0.25 s tightened, a 3.8% pitch-kept
       stretch (`scratchpad/vo_fit.py`, ceiling 4%) and the end hold cut to 76 f (STYLE §1.5's 96 — the root rule's third lever).
       79.6 s. Whisper heard "Verizon CEO" (the possessive dropped) and "sprint": cue on "CEO", Sprint capitalised.
     - The bed is LIKE ME again (the standing rule: the previous video's song). Its drop sits 0.1 s before "On October 8th", so it
       lands 3 f early, on the push into the coverage ring (`bedsrc.mjs`). Mixed from the rendered stems: intro 8.0 dB under the
       voice, body 3.5 ± 0.2.
     - ⚠ The log's "never the same hook chart type twice running" is broken by the brief's mandatory line hook (Video 8 opened on a
       line too) — flagged to Timur, built as the brief specifies.
     - **★ THE FULL INTERSECTION + VIOLATION SWEEP (Timur, 2026-10-12: "do a full intersection sweep and a sweep for any violations of
       the rules or glitches/wrong visuals").** Every automated check was CLEAN on the first pass (stylecheck, the every-frame sweep,
       SCENES, violations, flash, whooshsync, sfxsheet). The defects came from LOOKING (every place at rest at full size, plus the
       hand-over contact sheets) and from a subagent reading the source against STYLE.md. Fixed:
       - **The hook's names, lines and "$" sat across the phone's bezel.** The phone is `data-probe-skip`, so NO probe check can see
         anything crossing it. The phone grew to 780 px and the chart, the names (30 px) and $8 BILLION (100 px) were refit ≥ 24 px
         inside its screen (`hook.tsx`). **A skipped object is a blind spot: look at everything that crosses it, every build.**
       - The ring's ticks sat on its extruded side (each now starts beyond the ring's reach along its own direction, depth
         included). "T-MOBILE + SPRINT": Anton's small, low "+" read as a separator dot, so the label is now SPRINT MERGER. STARLINK
         ran 20 px into the phone's camera pill (`phone.tsx` now fits the carrier name to the gap). With the camera eased back for the
         fourth slab, the AT&T slab sat cut by the frame edge (teachD now x 84 / z −0.16). AT&T's quote card stood EMPTY for 7 s; it
         now rises in on its own line, as the lone Verizon card (now centred) eases aside. "VALUE LOST, OCT 9" → "VALUE LOST ON OCT 9".
         The bet chart's first expected step was a 5-px drop that read as a misjoin; the dashes now restart on each step.
       - **Pops (one-frame on/off), found by the source audit:** the bet steps were sliced by `Math.ceil(progress × years)` (now a
         continuous clip); the $57B counter switched on at full strength; the Starlink dot was mounted on `dot < 0.999`; the ring arc's
         40-px round cap appeared whole; the launch track's ticks and its 2027 label; the merger arrowhead; the stamp's fade keyed to
         an ease-out.
       - Also: two of three phones are ticked, not all three (the voice says "most"). The balance levels ON "right" (it used to settle
         2 f before the question's slide). The drop bars grow over 26 f (§9.3). The deal document no longer repeats the licence card
         ("800 MHz", BUYER SPACEX): it is THE DEAL with a sign-off block, where Grain and SpaceX have signed, the FCC's line is empty,
         and PENDING lands on it.
       - **The re-sweep caught three side effects of the fixes:**
         - $8 BILLION's BOX ran into the falls' box. CROSS compares a diagonal path by its box, and the front plane draws ~5 px right
           of its layout x, so it is now right-aligned 30 px left of the break.
         - AT&T's card rose while Verizon's was still moving aside (EDGE, 3 f). It now rises once that spot is clear, on "CEO".
         - The stamp's 1.25× punch came 9.9 px from "FCC" (V1 in transit). It now punches 1.12× and sits 20 px further right.
       - ⚠ `remerge.mjs` on a range with no defocused item (no push, no close) is refused by the sweep's own self-check: extend
         the range to the film's end.
     - **★ Timur, 2026-10-12: "the line chart in the beginning should be attached to the phone, and move with the phone, and the
       phone just disappears on scene. I need you to never allow abrupt disappearing of visuals"; then "make the phone more 3d and
       realistic".** Both are STYLE rules now (§9.6, §6.8a).
       - **The vanish:** the hook phone was its own depth plane (R 1.4). It trailed the rest in the truck to the licence, and its
         window closed with its edge still on screen (315 → 318). No check saw it, because the phone was `data-probe-skip`. It now
         lives in the MID with its chart (one layer, one Turn): they move as one and slide off together.
       - **`scratchpad/popscan.py`** proves "nothing appears or disappears in one frame" in PIXELS, so probe-skipped things are
         covered too. It reads the full sweep's kept frames in tiles, and a change counts only when motion cannot explain it: shapes
         are matched under the area's measured displacement (phase correlation) and a local search, and an edge entry is motion. It
         reports VANISH, POP and BLIP, with canaries from real frames. On the old frames it caught the phone at 315 → 316.
         - Its false alarms are designed fast motion: slides at peak speed, repeating patterns (month ticks, a row of identical
           phones) and the question's tracking text. Each one was looked at and is listed in `scratchpad/popscan_ok.json` with its
           reason. Excused findings are printed every run, and a stale excuse is reported.
         - **A VANISH can never be excused.** Run it with `flash.py` after every full `--keep` sweep;
           `scratchpad/popview.py <frame>` shows a finding as a strip.
       - **The phone (`phone.tsx`) is the real handset in 3-D:** the front outline swept along the depth as ONE smooth convex body
         (no stepped copies) in polished graphite-blue metal, with a rounded edge (a highlight, a mid-band groove, a back seam). The
         keys stand proud on the right side's own sheared plane. The front has a chrome band, black glass, a black border, the
         display, the island with its lens, one glass sheen and a contact shadow. Every phone in the film uses it.
       - **"the 8 billion text should also be anchored to the phone"** (same day): $8 BILLION and SPACEX left their R 0.8 plane for
         the phone's layer. The hook is now ONE layer, with no depth planes (STYLE §9.6).
     - **★ Timur, 2026-10-12: "Be a little more creative with the visuals, for example in the partly from space scene add a satellite
       on one end of the line. Do such a thing for most scenes."** It is a standing rule in `Resources/visual-vocabulary.md` (the
       2026-10-12 section) and STYLE §10.2. It overrides the NEVER list for the object the sentence names. Seven scenes got one,
       each acting on its own words and none repeated:
       - **whatE:** a Starlink satellite (chassis and two solar wings) glides in from the left and settles; the dashed arc and its dot
         leave from under it.
       - **whatB:** the glass block became an office building (banded upper floors, a windowed side, a roof plant box, a glass
         lobby), with three signal arcs coming in through its wall to the phone before its bars light.
       - **hookC:** a rosette seal with ribbon tails pressed onto the licence between the two rows' flips. A mast was rejected
         because its waves would repeat whatB's arcs.
       - **whatD:** a gavel on its sound block under DOJ CONDITION, raised, striking on "condition" (an accelerating fall, then rest).
       - **teachA:** a SIM card under END 2027 ("a phone plan of its own").
       - **teachB:** four chips dropped onto a stack on the EXPECTED side ("a bet"), each with a solo coin cue.
       - **honestC:** a pen gliding in on "sign off" and resting beside PENDING on the FCC's line.
       - Every new action has its cue in the score (a swoosh for the glides, a sub for the seal and the gavel, flick, coin).
     - **★ Timur, same day: "at 28 seconds, the scene should start with just the phone and then sort of zoom out and move up slowly to
       get the satellite visible. Also, the satellite should be bigger and detailed."**
       - whatE lands on the phone alone (bigger, centred). A new travel, **whatE2**, pulls the camera back and up over 56 f (z −0.15,
         y −330) on "a phone network it plans…". 56 f is the house's longest travel (stylecheck CAMERA refused 64).
       - **z −0.25 broke the next hand-over** (whatE2 → whatF: 8 f, then 10). Two reasons:
         - At 1.25× its rest distance the place sat exactly where `farFade` starts.
         - The next slide is scaled by the outgoing place's distance (`slideK`), so the incoming drop travelled 15% further.
         - The fix: z −0.15 and a per-place `slideK: 1` on whatF. The outgoing still crosses 887 px, leaving x ≈ 721 for −166. Now
           19 f.
       - **A camera move that zooms a place out changes the NEXT slide's scale:** check that hand-over every time.
     - **★ Timur, same day: "the visuals are still a little bit plain, like for example the phone screen doesn't have anything on it in
       the satellite scene. Find something relevant and add it. Apply this to other similar scenes"** (STYLE changelog, 6.8a/10.2). The
       content lives in `src/sx/screens.tsx` and goes in through phone.tsx's `children`. Each piece is the phone's own UI for its
       sentence, every state change cross-fades, and the text is object print:
       - **whatE:** SEARCHING, its radio arcs lighting in turn (a sine wave, no switching), then CONNECTED as the signal lands, and a
         message bubble rising in, VIA SATELLITE.
       - **whatB:** NO SERVICE, then CALL CONNECTED over a counting timer, with the handset button lit (Lucide's "phone" outline,
         filled; my own drawing read as headphones).
       - **whatC:** each phone shows 800 MHz, landing with its check, dim on the phone without one.
       - **teachC–D:** each network slab carries a cell-mast emblem in deep blue (white was faint on the slabs' pale tops). Starlink's
         dashed slab carries an orbit and its satellite. **Superseded the same day, below.**
     - **★ Timur, same day: "try to be more visual, like with the 3 companies bar scene, instead of bars just add those signal towers
       themselves with the company's logo on or above them"** (STYLE changelog, 10.2).
       - **The slabs are now three cell towers:** a concrete footing, braced steel legs over a lighter back face (the oblique), a
         platform, antenna panels, a microwave dish and a beacon mast. Their signal arcs breathe on "networks", and each company's
         mark sits above its tower in navy (simple-icons, never brand colours).
       - **They build from the ground up through a FEATHERED mask (80 px soft):** a hard clip moving ~57 px a frame showed the
         platform's whole row in one frame (popscan f1480). Each mark waits until its own tower is ≥ 80% built.
       - **The fourth is Starlink:** a dashed, see-through satellite and its beam to the ground, sliding in. The towers lean back on
         "overnight" as the slabs did.
       - **The marks:** `public/brand/{att,verizon,tmobile}.svg`, copied from simple-icons 13.21.0 in Aperture Demos/Video 1's
         node_modules (no download). `scratchpad/mkcarriers.mjs` writes them to `src/sx/carrierlogos.ts`, a separate module because
         parts.tsx (Logo/BRAND) is a canonical ENGINE file.
       - The drop bars (whatF) carry the same marks over their names.
     - **★ Timur, same day: "54:28 - 58:17 the scene needs changing, blue box looks awful needs some sort of new creative visual"** (teachE,
       STYLE changelog 10.2). The deep blue panel became two real things:
       - **a swing PRICE TAG:** a pointed tag with an eyelet and a loose string loop, the three carriers' marks printed on it, its
         markdown counting up in loss red (−$57B), and VALUE LOST ON OCT 9 under it;
       - **a mechanical tally COUNTER under it:** six drums all at 0, their windows lighting in turn through "switched", under
         CUSTOMERS SWITCHED.
       - KIND stays `counter`. A string running up to nowhere read as unfinished, so it hangs from the eyelet in a loop.
     - **★ Timur, same day: "59 sec replace verizon ceo with a real picture and change up the scene to make the quote box look better with
       a new font. I put his pic in public"** (STYLE changelog 5.2/6.8a).
       - `public/face.jpg` was cut out with `shared/tools/cutout.py` (u2net_human_seg, cached, no download; one person in the
         frame) and cropped to `public/schulman_bust.png`.
       - Each card now has a round portrait on its top edge (Remotion `<Img>`), the NAME in Anton (data.ts QUOTES `name`), the role,
         and the words in Instrument Serif italic (ACCENT; raw size, so `data-print`) in sentence case.
       - AT&T's card showed the AT&T mark until Timur supplied `public/john stankey.jpg` the same day. It was cut out the same way
         (`stankey_cutout.png`, one person in the frame) and cropped to `stankey_bust.png`, framed so his head reads the same size as
         Schulman's in the disc (equal weight, §10.3). The source is only 618 × 412, which is enough for the 192-px portrait.
     - **RENDERED 2026-10-12 ("render")** single-tab: `out/spacex_vs_carriers.mp4`, 79.66 s, 24.2 MB, h264 1080×1920 at 30 fps plus
       AAC 48 kHz stereo. The guard was clear (10 divergences, all cleared by the take).
       - **Audio:** peak −3.9 dB, mean −22.5. Every 10-s window sits at −22.1 to −23.2, and the tail after the voice is −28.4 dB,
         bed only.
       - **28 MP4 frames against fresh stills:** worst 48-px tile 7.1 levels, none over 12.
       - **`flash.py` and `popscan.py` were run on the MP4's own decoded frames** (both now take a frames-folder argument), and
         both are CLEAN. Three reviewed slides landed 2 f later in the MP4, so their `popscan_ok.json` entries now cover both.
       - It is served on 4409 (srv.us forward 16, `tunnel4409.ps1`). serve.mjs's page title still said Video 8: a clone
         carryover, now fixed.
     - **★ Timur, 2026-10-12, after that render: "I forgot to change the song, use DAPHNI - Poly".** The bed is now Daphni, "Poly"
       (`public/music_daphni_poly.mp3`, copied from Video 3's public/). It has no drop, so it plays from its top (DROP_SRC null)
       in one regime.
       - **Mixed from the rendered stems:** 3.3–3.8 dB under the voice in every 10-s window and the tail (worst 0.3 dB off its
         target). The full mix peaks at −3.6 dB, mean −22.4, and the tail after the voice is −28.9 dB, bed only.
       - LIKE ME's envelope and bed are archived (`scratchpad/bedenv.likeme.json`, `out/archive/bed.likeme.mp3`).
       - **RE-RENDERED with Poly ("re render", same night)**, single-tab: `out/spacex_vs_carriers.mp4`, 79.66 s, 24.2 MB, guard
         clear. The LIKE ME master is archived as `out/archive/spacex_vs_carriers_likeme.mp4`.
         - Audio: peak −3.7 dB, mean −22.4, windows −21.8 to −23.4, and the tail after the voice is −28.8 dB. It correlates with
           the Poly mix probe at r 0.989, lagged by exactly Remotion's 2048-sample AAC delay.
         - Picture: 28 frames against fresh stills, worst tile 7.0. `flash.py` and `popscan.py` are CLEAN on the MP4's own frames.
         - ⚠ The render died TWICE (at 20% and 10%) when the session restarted, along with the Studio, the hosts and the tunnels,
           all of them `Start-Process` children. It finished only when launched through WMI (root CLAUDE.md, Handback).
       - ⚠ **Flagged to Timur:** the quote is Dan Schulman's (Verizon CEO since Oct 2025). The photo must be of him: the card prints
         his name beside it, and a photo of anyone else would misattribute the quote.
       - The move lives in ONE place: `starlink.tsx` `REVEAL`, which Video.tsx reads.
       - **The satellite can't drop in from above:** it would cross the caption band (STYLE §5.4). It enters from the LEFT edge at its
         own height, under the band. Its screen path is set, and its WORLD position is solved from the camera's own move every frame
         (zoomFrac/zoomT, ORIGIN 540/960), so the two land together. Measured on the render, it settles at x ≈ 372, y ≈ 430.
       - It is ~510 px at rest and detailed: a box chassis with a 4 × 2 phased array, a laser-link turret and a star tracker on top,
         a thruster, an emitter dome underneath, truss booms, and two-panel wings with hinges. The arc draws from its dome once it has
         landed and reaches the phone on "space". It mounts only from the reveal's first frame, while it is still beyond the left edge:
         the push's arrival draws this layer small, and that would have pulled it into view early.
       - PLANNED moved to 34 px under the phone. At + 60 it ended 8 px above the watermark.
       - **Clone carryover:** `closeups.py` still listed Video 7's objects. `scratchpad/closeplan.mjs` now derives each place's
         rest frame and crop from `probe_frames.json`, and closeups.py refuses without it.
       - Flagged, not changed:
         - the drop bars and the slabs are both rows of three carrier solids on white (both are in the brief);
         - the bet chart's heights are a diagram, not data;
         - $8 BILLION's extrusion and blurred shadow are in the brief, but go against "type is flat" and "plain white Anton";
         - the kit's `Turn` can round its yaw to 0.00° (the V33 one-frame snap), which is an ENGINE change.
   - **Video 10** is `Videos/Video 10 — Same Payment Smaller House/` (Studio 3410, serve 4410), started 2026-10-13, cloned from Video 9
     (module `src/mtg/`, composition `SameBudgetSmallerHouse`). The brief: mortgage rates at 7.40% (PMMS, Oct 8, 2026), the highest
     since Nov 2023, and what that does to a fixed $2,500 monthly payment ($404K → $361K of loan). HARD 80-s cap; a mandatory four-plane
     hook; and **★★ THE DEMO ANCHOR**, a style reset (top of this file; `Resources/visual-vocabulary.md`).
     - **The script went back first** (one research agent; every claim confirmed at primary source: PMMS 7.40 / 7.28 / 6.30, the last
       higher reading 7.44 on Nov 16, 2023, a streak of exactly seven weekly rises, the Sept 16 FOMC hike, the first since Jul 2023).
       Seven relative-time lines were re-dated and armed in the guard (all low); `VO_SCRIPT.txt` was sent before the build.
     - **Built in the demo's world:** the navy field and one soft spotlight, glossy satin symbolic solids (`src/mtg/house.tsx`: the
       recurring HOUSE; `glossy.tsx`: arrow, coin, price tag, fluted column, card), one centred hero, objects that build in place.
       The house is the brief's one recurring spine and looks different each time: centred and shrinking in the hook (k 0.3), large and
       turned with a price tag in the teach (k 0.6), small and square-on under the sentence (k 0.18).
     - **The hook in four planes** (`places/hook.tsx`, registry `planes`): a glossy RATE DIAL behind like a moon (R 1.5, defocused as
       the brief asks; its hub hidden behind the gable so it rises over the roof; 6/7/8% clear of the roof's depth and the chimney),
       the house on a reflective platform (MID), 7.40% extruded in front (R 0.8), a defocused up-arrow nearest (R 0.55). The needle
       sweeps 6.30 → 7.40 on "rates… highest"; a travel (hookB) eases down and in as 7.40% defocuses away and $2,500 A MONTH lands; the
       house shrinks to 0.894 (the loan's ratio) with its dashed old outline, and −$43K lands on "forty thousand". The exit DIVES INTO
       THE LIT WINDOW (aim and tilt derived from the window as the shrink leaves it) through Video 8's LENS BLOOM, peaking in the pause
       and receding onto the Oct 8 bar's foot. The hook ends 17 f after line two (the brief: ≤ 0.6 s).
     - **⚠ −$43K does not fit "in the gap":** a 10.6% shrink leaves a ~50-px strip. It sits just over the old roof's peak, in the
       dial's face, left of the needle (flagged).
     - **ONE light frame** (the Fed's portico, honestA). That broke STYLE §4.1's 1-in-3 cadence, so §4.1 and stylecheck WHITE now judge
       Video 10 on by the demo anchor: exactly one white run (canaries for none, one and two). Videos 1–9 keep the old rule (Video 9
       re-checked CLEAN).
     - **Two bar scenes** (the rates in WHAT, the loans in TEACH) are both the brief's: each KIND line carries `style-exempt:` with the
       brief's words. ⚠ The KINDS check reads files ALPHABETICALLY, so the marker must be on the file it reaches second; it is on both.
     - **Two sentence beats** (`places/words.tsx`, Video 8's tracking text in the world, chips stepping aside via `TEXT_ON`, held to
       the end of the chip on screen so no chip is cut mid-show): "Same budget. / Smaller / house." over the small house, and
       "Your / own rate" over a card and a coin that LIGHT on "credit" and "down payment". Neither is text-only (the 2026-10-09
       withdrawal): each shares its place with its sentence's object.
     - ⚠ A regex edit through a shell heredoc ate a backslash again (`/^Video (\d+)/` became `/^Video (d+)/` in stylecheck.mjs; this very note lost its backslash the same way and was re-typed through Edit): the WHITE
       gate silently fell back to the old rule. Fixed through Edit, and the gate now refuses if it cannot read a "Video N" number.
     - **Timur's notes on the first Studio pass (2026-10-13), each recorded the moment it was given:**
       - **"make sure the house properly sits on the circular surface in the hook scene"**, then **"same with the visual at 21 seconds, and
         fix the house up there too"**. The platform was a flat ellipse under the front face, while the house's depth recedes up-right,
         so the back of every house hung past the rim. Each platform is now a circle on the house's OWN ground (`house.tsx` floorOf: a
         sheared ellipse in the oblique, centred under the whole footprint, radius checked against the footprint's half-diagonal), with a
         contact shadow; the hook's reflection is the gable front's only. The 21 s house was turned 0.6 and read as a barn: now 0.45, 540
         wide, centred with its depth. The class reached all three houses (hook, teachA, teachD). STYLE.md changelog, 6.3 / 10.2.
         ⚠ Draw such a floor as a PATH: a sheared `<circle>` is boxed by the probe as its unsheared square (1,300 px wide), and CROSS fired.
       - **"in general, the visuals should be more detailed, like in 100bps videos" — "I mean the 3d visuals, not the charts or graphs"**
         (STYLE.md changelog 6.8a / 10.2; visual-vocabulary.md DEMO ANCHOR). The house gained foundation, siding, trim, shingle courses,
         gutter and downspout, shutters, a framed sill, a panelled door with its step and lamp, a capped chimney; the coins a raised rim,
         reeding and a bead ring; the arrows bevelled faces; the card chip contacts, contactless mark and embossing; the portico dentils and
         an architrave. Charts were left clean.
       - **"find a better visual for the scene at 45 seconds"** (honestB, "…They follow long-term bond yields."): the two plain arrows
         became a coupled pair on a rail — BOND YIELDS leads, MORTGAGE RATES is pulled after it.
       - **"replace the arrow at 55 seconds with a better visual too"** (honestD, "And rates can fall as quickly as they rose."): the turning
         arrow became a glossy ball in a half-pipe, rolling from the high side down through the bottom (fastest) and up the other side
         to the same height — down as quick as up, and no lean either way (§5). STYLE changelog 10.2: a plain arrow is never a scene's hero.
     - **The real take landed the same night** ("I also put the VO in public"; Timur: "use the same song"). ElevenLabs "Jon – Calm
       Presence", read from the CORRECTED script: 100% of its words in order, the guard 0 of 7 (every re-dated line said as corrected).
       67.9 s raw → 60.5 s trimmed; the film runs 64.1 s, inside the 80-s cap. Whisper split THOUSANDS ("$40 | ,000") as well as
       decimals, and wrote "30 year" unhyphenated; the read ran "Same budget, smaller house." and "So be honest, would you…" on as one
       sentence each — the generator restores the script's stops (the words and times stay the take's). 20 word starts moved to their
       measured onsets. On the slower read the loan bars held 8.6 s, so a travel (teachC2, down and in toward the lower bar on "At 7.4…")
       splits them; the coin stack's first coin sat 3 f from $2,500's sub and goes silent.
       The bed is Daphni "Poly" (the previous video's song, as asked): every 10-s window and the tail at 3.5 dB under the voice within
       0.2 dB. Full mix −22.7 dB mean, −4.3 dB peak; SFX peak 17.5 dB under the voice's; after the voice, bed only at −28.8 dB.
       ⚠ The pop scan's VANISH at 1327 was a STROBE: the portico's dentils (one every 28 px) moved ~2 periods a frame at the slide's
       peak speed. Coarsened to one every 50 px. A repeat finer than a slide's per-frame step strobes, whatever STYLE §6.9a's 20 px.
     - **⚠ A NEAR-MISS RENDER (2026-10-13).** `render.mjs --check` — a flag this script did not have — was read as the concurrency
       (NaN), passed the guard on the clear take and began a master render; it died at 0% (NaN broke the pool), and no file was written.
       The script now fails closed on unknown flags and bad concurrency, and `--check` runs the guards only (root CLAUDE.md, Guards).
       ⚠ The renderer's own port finder also failed ("Tried 10 times to find a free port"): a browser connection's SOURCE port held
       0.0.0.0:3000 and Remotion kept choosing it. `RPORT=<port>` pins the server's port in every render tool.
     - **What the every-frame sweep and the pixel scans found (2026-10-13), and the fixes:**
       - **`<defs>` and a clipped reflection are DOM geometry.** The hook house's platform reflection (the house mirrored, clipped to
         the disc, masked) and its clip ellipse and mask rect were measured whole: they "crossed" 7.40% and $2,500. Both are
         `data-probe-skip` now (Video 2's lesson, again).
       - **A coin's rim path closed with a straight line ACROSS its face**: hidden under the face, read as a stroke through the "$".
         It now closes along the face's front arc (`glossy.tsx` Coin); coins lying under another carry `under` (face not measured).
       - **A slide's overlap is set by the incoming place's LEFTMOST item and the outgoing's RIGHTMOST** (slideR), and SETTLE crosses
         the frame's middle at ~60 px/f. Modelled on SETTLE, the model matched the sweep exactly (11 f, 13 f), and it set the layout:
         the loan bars' zero line at x 80 (names 22 px right of it), the coin stack at 570 → 17 f.
       - **A bar grown on OUT stands ~15% tall at full strength on its first frame: a POP** (popscan, the loan bars at 952). Grows are
         INOUT now, and things that fade in fade over TIME (8–10 f), never over an OUT progress (the swing tag and the top coin popped
         in at 36–45% opacity).
       - **popscan's canaries were Video 9's frame picks.** Its moving block came from a fixed spot that was flat navy in this film (a
         featureless block cannot be tracked as it slides, so the slide canary fired), and its ground frame was the teachA house (an
         opaque block uncovered real detail each frame). The canaries now take the most TEXTURED patch and the QUIETEST ground strip
         from frames across the film, so they hold for any film. The question's fast lift is the one reviewed exception
         (`popscan_ok.json`).
       - Final state: stylecheck CLEAN (13 places, longest 6.2 s; one light frame), every-frame sweep CLEAN (every hand-over on the
         rule), violations CLEAN, flash CLEAN (worst 19.1), popscan CLEAN (3 reviewed), every camera whoosh within ±3 f, sfxsheet
         clean, guard proven. Studio 3410 via WMI, srv.us forward 17 (`tunnel3410.ps1`).
     - **Rendered with Poly on Timur's word ("render", 2026-10-13), then the song changed.** The single-tab master (launched through
       WMI with `RPORT`) finished at 64.13 s, 19.4 MB, h264 + AAC, guard 0 of 7. Before it was verified Timur wrote **"nevermind, stop it
       and change the song to everything in its right place"**; it had already finished, so it is archived unverified as
       `out/archive/same_budget_smaller_house.poly.mp4` and the master path is free.
       - **The bed is now Radiohead, "Everything In Its Right Place" (Instrumental)**, `public/music_radiohead.mp3`, copied from Video
         5's public/ (the same file as Videos 4–5, md5 b10b3791…). It holds −16.1 to −16.6 dB over the film's length, with no intro and
         no drop, so it plays from its top (`DROP_SRC` null). STYLE §11.3.
       - **The mix, from freshly rendered stems:** one controller pass put every 10-s window and the tail at 3.4–3.6 dB under the
         speech-gated voice (worst 0.1 dB off). Full mix −22.7 dB mean, −4.0 dB peak; after the voice, the bed alone at −27.4 dB.
       - Poly's envelope and baked bed are archived (`scratchpad/bedenv.poly.json`, `out/archive/bed.poly.mp3`);
         `music_daphni_poly.mp3` stays in public/, unmounted. ⚠ Commercial (Radiohead): flag the client's rights.
     - **RENDERED with Radiohead ("now render", 2026-10-13)**, single-tab through WMI with `RPORT`: `out/same_budget_smaller_house.mp4`,
       64.13 s, 19.4 MB, h264 1080×1920 at 30 fps plus AAC 48 kHz stereo; guard 0 of 7. Verified on the file:
       - **Audio:** −22.7 dB mean, −4.1 dB peak; 10-s windows −22.3 to −22.8 (the last, with the outro, −25.2); after the voice the
         bed alone at −27.4 dB. It correlates with the Radiohead mix probe at r 0.966, lagged by exactly Remotion's 2048-sample AAC
         delay (42.7 ms), and with Poly's bed at 0.018 (session scratchpad `whichbed.py`).
       - **Picture:** 28 MP4 frames against fresh stills, worst 48-px tile 3.5 levels (limit 18). `flash.py` (worst 19.1) and
         `popscan.py` (the 3 reviewed question-lift BLIPs) are CLEAN on the MP4's own decoded frames.
       - **Served** on 4410 through srv.us forward 18 (`tunnel4410.ps1`, a reconnect loop); a full download through the tunnel matched
         the file byte for byte, and range requests answer 206.
   - **Video 11** is `Videos/Video 11 — JPMorgan Buyback Pause/` (Studio 3411, serve 4411), started 2026-10-14, cloned from Video 10
     (module `src/jpm/`, composition `JPMorganBuybackPause`; the clone script is the session's `clone11.mjs`: no node_modules, out/, take
     or mix state, Video 10's places left behind). The brief: "JPMorgan's $50 Billion, Barely Touched" — the Q3 2026 results (Oct 13):
     a $50B buyback plan, ~$1.06B used in its first quarter. HARD 80-s cap; the brief's ★ HOOK SCENE mandatory; the DEMO ANCHOR again.
     - **The script went back first** (two research agents, JPMorgan's 8-K of Oct 13 — exhibits 99.1 release and 99.2 supplement — and
       its June 24 release): every figure in the brief held. Five lines corrected and armed in the guard before the take (all low):
       - "gave itself fifty billion dollars" → "gave itself PERMISSION to buy back fifty billion dollars": the program is an
         authorization "of up to $50 billion", no money set aside;
       - "Last quarter" → "Three months in"; "is still unused" → "At the end of September, … was still unused" (relative time, §4);
       - "A buyback is HOW a company hands cash back" → "one way" (dividends are the other);
       - "BUT its CEO … flagged" → "Its CEO … flagged": "But" set the risks against JPMorgan's stated reason (§5, the brief's own
         equal-weight rule).
       - ★ The supplement's line is "Aggregate repurchases of common stock" (not "common stock repurchased"); the release's $664M is the
         NET figure (1,057 − 393 of employee issuances). The film uses GROSS throughout; the $15.8B "excluding a significant item" adds
         back $658M PRE-tax ($498M after tax) and is not used.
     - **The build, in the demo's world** (`src/jpm/block.tsx`: the GLOSSY BLOCK — one billion dollars — is the film's unit):
       - **hookA/hookB** (`places/wall.tsx`, KIND grid, ONE file for both framings of the spine): the logo embossed behind (R 1.5,
         defocused as asked), the wall of 50 blocks lighting row by row bottom to top, $50 BILLION extruded in front (R 0.8), a
         defocused block nearest (R 0.55); on "Three months in" one block slides out printing $1.06B / JUL–SEP and the 49 dim; the
         camera dives into it through the lens bloom onto the plinth.
       - ⚠ **The bloom grows for 41 f before its peak on the cut**, so anything that happens in the last ~1 s of the hook's line is
         swallowed by light. The block's slide and print were moved to the START of line two ("Three months in"), where they read for
         ~1 s before the swell. Time a hook's payoff against the bloom's onset, not against the cut.
       - whatA a plinth carrying the logo, $50B, APPROVED JUNE 24 · whatB/whatB2 five quarterly bars on one $0 axis (Q3 2026 barely
         off the floor, $1.06B; the travel up to $8.3B) · whatC a short WIDE coin stack, $15.3B, PROFIT (wide and low, not Video 10's
         tall stack) · teachA/teachA2 a glossy disc of ten slices: they part, the front share lights 10%, the back slice leaves along its
         radius, the nine widen, 11% · teachB four blocks glide on a rail and ease to a stop, a magnifying glass settles over one, "investors
         ask / why." · answerA BUSINESS & CLIENTS lowers onto BUYBACKS · answerB WHITE (the one light frame) arrow, bar, dial · honestA a
         shelf takes three weights and holds, "may be / manageable." · honestB the wall again, straight on and closer, the open slot.
       - The brief's two "text-only" beats are built the house way: each shares its place with its object (words.tsx).
       - The bed is Radiohead, "Everything In Its Right Place" (Video 10's last song, the standing rule); HAS_VO/MUSIC/SFX off until the
         take lands (the score plays in the Studio as a preview).
     - **What the sweeps and the close-ups found (2026-10-14), and the fixes:**
       - **A block that comes FORWARD out of a wall:** the wall's blocks behind it read as LINEs through its print (the probe has no
         depth). Only the blocks it really covers go under `data-probe-skip`, and only while it is out (`wall.tsx` covered()).
       - **Print on a pie slice rides WITH the slice** (the parting moved the slice, not its 10%), sits low in the wedge where it is
         widest, and a 10% → 11% change is IN SEQUENCE (out, then in): overlapped, the two read as text on text.
       - **A rail nearly the frame's width cannot leave on a 1,020-px slide** (VANISH as it unmounted): the next slide's `slideK` 1.15.
         The same for the wall before the question: `slideK` 1.2, and the slide starts 32 f before the first word (gap 5 f).
       - **A figure wider than its bar touches the bar beside it** ($1.06B over the short Q3 2026 bar): the last gap is wider.
       - **GlossyArrow's five stepped copies show as a sawtooth at large sizes** (the light frame's 370-px arrow): its extrusion is now
         drawn in steps of ≤ 2 px (`glossy.tsx`). **A magnifying glass shows the scene under it, magnified** (the rail as well as the
         block) — a block floating in dark glass read wrong; the view through the glass is `data-probe-skip` (the probe cannot see the
         glass's clip and measured the magnified rail at its full width).
       - The weights' clicks piled on the beat's flicks (sfxsheet PILE): they seat before the beat's first word.
     - **★★ Timur's notes on the first Studio pass (2026-10-14): "some of the scenes are too visually simple, like the coin scene. I need
       more complex but good and relevant visuals. Also, I want you to fix the fact that the jpmorgan text in the first scene isn't
       visible, and be creative about the way it blends with the visual."** Recorded in visual-vocabulary.md (DEMO ANCHOR: no scene is
       "one plain object and a number") and STYLE.md's changelog (6.8a/10.2, 10.1). Treated as a CLASS — every scene that was one plain
       object and a number was rebuilt as a relevant composition (the charts stayed clean):
       - **The logo** was a dim, defocused shape BEHIND the wall, half hidden by its top row. It is now ENGRAVED in a glossy lintel over
         the wall — the vault's nameplate — sharp, its recess deep blue with a lit lower lip; the bottom-to-top ripple runs up into it and
         a band of light sweeps across the letters. The wall returns with the same lintel in the honest part. The background plane went
         (three planes remain: wall, $50 BILLION, the near block).
       - **whatA** a plain slab under $50B → the bank's VAULT DOOR in its wall: bevelled ring with rivets, eight bolts, two hinges, a
         three-spoke wheel on a raised hub, the logo on a nameplate; on "approved" the wheel turns, the bolts draw back, light leaks
         round the seam (`places/vault.tsx`).
       - **whatC** (the scene he named) a short stack → a coin HOARD on a glossy floor: three stacks build, two loose coins, a large coin
         rolls in and stands on its edge (its "$" turns as it rolls; its reflection in the floor).
       - **teachA** the plain pie → the disc on a polished platter, a banded BUNDLE OF CASH settling onto every slice on "hands spare
         cash back" (each rides with its slice; the leaving slice takes its cash with it).
       - **answerA** two slabs → a CASCADE of two trays: the billion-blocks fill BUSINESS & CLIENTS first, and only then one falls past it
         into BUYBACKS — the hierarchy as what fills first.
       - **answerB** three bare objects → three STATIONS on glossy pedestals: an up-arrow with a price tag hanging from it, a house
         before stepping bars (homes and stocks), a dial whose needle climbs a lit arc.
       - **honestA** a shelf and cubes → a sturdy bench (beam, legs on feet, cross-brace, bolts) taking three glossy WEIGHTS with ring
         handles.
       - **"remember to use 100bps sfx in the video where they apply"** (Timur, same day; STYLE §11.0): the score was re-cut to 100bps'
         family-per-job doctrine — chain under the bars climbing, the tray drops and the risk bars; datashort as the stake re-reckons
         10% → 11%; swoosh for the coin rolling in and the cash arriving; pings only on numbers arriving ($8.3B, the 10% stake); a tick
         on "one quarter"; clicks only as latches (the vault's bolts, the disc's last slice); a sub as the bench's load is seated.
     - **The real take landed the same evening** ("I put the VO in public"). ElevenLabs "Jon – Calm Presence", read from the CORRECTED
       script: 100% of its words in order, the guard 0 of 5. 73.1 s raw → 66.1 s trimmed; the film runs ~69.7 s, inside the 80-s cap.
       - Whisper wrote "J | .P. | Morgan" again (three tokens: merged in the generator), and split the close wrongly ("So be honest, is
         the biggest bank… something? Or is this nothing?") — the script's stops are restored: "So be honest." and ONE 13-word question.
       - On the slower read the light frame held 7.6 s: a travel (answerB2, down and in on "high asset prices") splits it, still the one
         white run.
       - The bed is Radiohead (Video 10's last song): every 10-s window and the tail 3.3–3.8 dB under the speech-gated voice (worst
         0.3 dB off). Full mix −22.6 dB mean, −3.5 dB peak; after the voice, the bed alone at −30.2 dB.
       - SFX levelled against Video 10 family by family (`sfxlevels.py`): the context swooshes sat ~8 dB under Video 10's and the soft
         whooshes ~4 dB; raised to within 1–3 dB. ⚠ `sfxlevels.py` reads `out/sfx_cues.json`: re-run `sfxsheet.mjs --json` after a take
         re-times the film, or it measures silence where the cues used to be (it read −180 dB for most families until it was).
       - ⚠ Close-up lessons: a cash bundle under ~90 px wide read as grey bricks (now pale, banded, two high); feet plates wider than their
         leg AND offset forward read as skis (now centred under the leg); a cross-brace between two legs is drawn BEHIND them; a rolling
         coin's "$" crossing the stacks it passes reads as a LINE (only what it really covers goes under `data-probe-skip`).
     - **★★ Timur's notes of 2026-10-15, built the same session** (every rule is in STYLE.md §16; the body is §8.2/§8.7):
       - **The hook builds itself, block by block, in a random order** (`wall.tsx` buysOf: a FIXED seed, so every render is the same):
         14 blocks already in place on frame 0, the other 36 flying in one at a time from their own side, height and tilt, the last
         seating on "fifty". It first slid in row by row from alternate sides ("make an animation of its stock literally moving into
         place from the left and right sides" → "the buying back should happen individually to the blocks, and it should be more
         randomized"). The opening push starts from twice the distance (ARRIVE z −0.5 over 30 f).
       - **"$1.06B" prints from the first quarter of the block's slide**, not as it arrives ("should appear sooner").
       - **The camera — intensity, not speed.** "Use 100bps speed and camera movement amounts" was first built as 32–36 f hand-overs on
         the kit's new `FAST` curve with chains of short keys; Timur: "too jittery … I mainly meant the intensity, not the speed or
         consistency". Now: the Bankers durations on SETTLE, an 8% depth arc on every slide, Turns −6° → +4.5°, close zooms, and one or
         two long FOLLOW keys per place ("the camera actually follows the line"; "in the coin scene, the camera should follow the coin
         into the scene"). The caption camera's pull on "$1 billion" went (it reversed against the bars' follow). stylecheck: CAMERA
         (Video 11 on) and the new STILL check, each canaried.
       - **The hook's zooms are anchored on the wall's top edge**: zoomed about the frame's centre, the lintel and its wordmark rose under
         the captions (stills 148–200). The dive's aim includes the hook key's offset.
       - **The coin follow**: the coin rolls in from the RIGHT (the camera's direction of travel) as the slide settles, and a key with an
         explicit `pan` carries the camera on with it; the hoard is laid out 80 px left (`profit.tsx` SX) so it ends centred.
       - **Smooth dark-blue metal**, not bright satin ("too bright and cartoony … smooth metallic … keep the blue", then "a bit too gray …
         a little more dark blue"): a tone map over the solids' colour literals (session scratchpad `metalmap3.mjs`: v2 inverted exactly,
         re-mapped at ~95% of the satin's saturation, mids darker) and a 4-stop chrome face on the block. **Paper money keeps the first
         build's finish** (`finish="paper"`: "keep the stacks that were on the pie chart the same, they were good").
       - **Text over the construction must separate from it**: the wall steps down 40% in light as $50 BILLION lands, a painted navy pool
         sits behind the figure, the lintel's wordmark is a BRIGHT INLAY (a deep-blue recess vanished into the darker steel), and the
         used block's print is white over a navy shadow ("like I said, the text in the hook scene isn't properly visible").
       - **The vault in real depth** (`places/vault.tsx`, the plane rig `src/jpm/rig.tsx` ported from Style 3 Video 38): wall plate,
         collar and bolts, hinge barrels, a 60-px door with its rim bolts, nameplate, dial and a four-spoke wheel; the wheel spins, the
         lock clicks, the door opens. It opened 72° first and "glitched" (a plane stack seen near edge-on shows its slices): it opens
         20° now ("only make it open a little"). Opening, not closing: the line is an approval.
       - **The pie in real depth** (`places/slices.tsx`): a flat disc in the rig at a 62° tilt, every height a plane of all ten wedges,
         painted bottom-up — the slices show their outer wall and cut faces as they part and the back one leaves ("make sure the pie
         slices at 29 seconds are 3d").
       - **The hook's exit 8 f later** ("make the transition out of the hook scene happen a little later"): the bloom's white now peaks as
         the new bed's drop lands on "America's…" (the FLARE assertion allows ≤ 10 f into the line).
       - **The bed is `public/711.mp3`** (Timur: "I put in a song in public use that"): its big drop (117.38 s) lands on the what
         section's first word; the hook rides the build. Mixed from the rendered stems: intro 8.0 dB under the voice, every 10-s window
         and the tail 3.3–3.7 dB under (within 0.2). The Radiohead state is archived (`bedenv.radiohead.json`, `out/archive/`).
       - **Then the bed's level, twice.** "The audio level of the song changes at the beat drop": the two-regime mix stepped the gain
         DOWN 5.8 dB at the hit, because 711's build rises into its drop. `DROP_HOLD` (bedsrc.mjs) now eases the gain from the build's
         level to the body's over the 2.5 s before the drop. Held flat at the body's gain, the build had fallen ~13 dB under the voice:
         "I can barely hear it". Now the build sits 6 dB under the voice and the body 3.0 (was 3.5), every window within 0.2 dB.
       - **What the first every-frame sweep of the new camera found, all from the camera's intensity**: Q3 2025 and $1.06B past the
         margins (a milder bars follow, the bars' Turn −5° → 3.5°), the lens's close framing reaching the trays on the slide
         (answerA slideK 1.15), INFLATION cut by the left edge (the dial's key zooms about its own height), "manageable." past the margin
         (the bench's second key eases back as it lands), the honest wall's lintel in the captions (its push anchored on the wall's top
         edge). The pop scan caught the hook's blocks entering at ~200 px a frame (now each starts just beyond the edge of the framing at
         its own start frame, on a smoothstep), the lintel's 1,500-px slide (now 1,060 px, in-out), and the vault's wheel spinning ¾ turn
         in 26 f (now ½ turn in 30 f). Then the bars were re-spaced (170 px apart, the last gap kept at 195 so $1.06B clears Q2 2026: a
         group 940 px wide had no room for any zoom) and the dial's key zooms 5% about x 650 (its stations' labels span the full width).
       - **★ A RENDER-ONLY GLITCH (after the first master, "the business and clients and buybacks text glitches at 41 seconds" — "the
         glitch only happens in the rendered version").** The tray labels faded out mid-crossfade in the MP4 only. Two causes, one class:
         the label's colour crossfaded white → navy through the face's own shade, and the face's gradient STOPS were recomputed every frame
         — a sequential render can keep a gradient's old stops (the stale-paint class of root CLAUDE.md, OffCamCelebs 028). Fixed as a
         class: no `<defs>` changes per frame any more — GlossyBlock and the trays draw a static dim finish and a static lit finish over
         it at opacity; labels keep ONE colour (white over a navy outline). `scratchpad/seqcheck.mjs <from> <to>` renders a range
         sequentially in one tab and compares it with fresh stills in 48-px tiles: CLEAN at 1150–1250 (worst 3.1). Run it on any range
         the user calls render-only. The song fades out slowly from the closing logo's entrance (66.3 s) to the last frame.
         **⚠ THAT FIX WAS WRONG: the glitch was still in the second master** (user: "in the render the initial glitch … is also present,
         fix it and revert the changes you made to the style of the text"; and "the dollar signs glitch at 21 seconds"). The label style
         was reverted (navy-on-lit ink crossfade, the lower tray's 0.8 blue). **The real cause: SVG text inside a `preserve-3d` Turn,
         under the place's depth-of-field blur** (`world.tsx`'s CSS filter on the layer). On the first blurred frame of the exit (f1253)
         the MP4 drew BUYBACKS ~75 px up, above its tray, and BUSINESS & CLIENTS not at all; the coin stacks' "$" marks vanished the same
         way (f677). The Studio's GPU compositor draws it right. The probe I ran first (seqcheck at 1150–1250) stopped three frames
         short of the exit, so it said CLEAN. **Fix: `kit.tsx` Turn is FLAT** (still yaws in perspective; every 3-D object already has its
         own rig in a flat wrapper) and its yaw never sits at 0.00°. ⚠ **Flat alone did NOT fix it**: the third master still had it.
         The mis-draw needs the tab to have drawn the place's EARLIER frames: a sequential run from f1246 was clean, one from f1200
         broke f1253, and a fresh browser per 60-frame chunk broke it too (so neither JPEG capture nor a long session is the cause).
         **The fix that held: the Turn's contents are a new DOM every frame (`key={f}` in `kit.tsx`)**, so every frame is drawn as a
         fresh still draws it. Proven on runs that reproduced it (1200–1258, 560–684). ★ A seqcheck has to START early enough to
         reproduce: begin it at the place's arrival, never a few frames before the bad one.
         ★ **Find a render-only glitch in the MP4 FIRST**: decode every frame around the time the user names and look for the one that
         changes (here the blur's first frame, 41.8 s), and run seqcheck over the place's whole window, hand-overs included.
       - **Final state (2026-10-15):** stylecheck CLEAN (CAMERA with arcs and keys; STILL longest 37 f); the every-frame sweep CLEAN
         (SCENES clean, every hand-over on the rule); violations CLEAN on settled frames; flash CLEAN (worst 18.9); popscan CLEAN (7
         reviewed); every camera whoosh within ±3 f; sfxsheet clean; full mix −22.4 dB mean, −4.0 dB peak; guard proven; not rendered.
   - **Video 12** is `Videos/Video 12 — Paycheck vs Prices/` (Studio 3412, serve 4412, srv.us forward 21 via the session's
     `tunnel3412.ps1`), started 2026-10-16, cloned from Video 11 (module `src/pay/`, composition `PaycheckVsPrices`). The brief:
     "Paychecks Went Up. They Buy Less." (CALENDAR ENGINE): BLS Real Earnings and CPI for September, both released Oct 14, 2026.
     HARD 80-s cap; the hook (RUNNING UP A DOWN ESCALATOR) mandatory; the DEMO ANCHOR and every STYLE §16 rule.
     - **The script went back first.** Five low corrections armed in the guard before the take (relative time: "over the past year",
       "a year ago", "last year", "right now"; and the FedWatch line's clause order). 193 words, ≈ 69 s of voice. ONE dataset: BLS Real
       Earnings + BLS CPI (Sept 2026) and CME FedWatch as reported Oct 14.
     - **The real-wage line is COMPUTED** from BLS's published levels (`data.ts` REAL_YOY, self-checked against them): real average
       hourly earnings, 12-month change, Oct 2024 → Sep 2026. **Oct 2025 has no CPI** (the shutdown), so its point is null and the line
       bridges it dashed. The BLS v1 API returns three years only: v2 POST for older values; bls.gov blocks curl (read in the browser).
     - **`src/pay/p3.tsx`: real-depth solids as SVG.** Corners projected through the rig, faces painted far to near with STATIC
       gradients plus a chrome-ramp overlay, culled by PROJECTED WINDING (`seen`): exact in perspective. The old orientation test
       blinked faces out near the frame's edges. Every 3-D object of the film is built on it, under `<svg key={f}>` (Video 11's
       render-only class).
     - **Sweep lessons:** faces skipped by default faked the hand-over gaps (now measured by default; `skip` only for faces print sits
       over, the probe having no depth); a textPath is measured by its whole diagonal box, so the escalator's rail print is
       `data-probe-skip`; anything of a place left off-screen at a slide's start is carried INTO view by the slide (the hook's walls
       and plate were cut back); things that appear in the air come out of DEPTH and fade up over their first frames (popscan); a floor
       is painted before what stands on it, always.
     - **SFX lessons:** a whoosh on a push peaks where the picture changes most, which is the INCOMING place fading up (~15 f after
       mid-dissolve) when it is bright (`PEAK_SHIFT`, measured by whooshsync); a repeating tick within 4 f of a ping, and a stop click
       at 97% of a ride that ends under an arrival's whoosh, are PILEs: the clicks go on the frame the thing comes to REST.
     - **The real take landed the same day** (ElevenLabs "Jon – Calm Presence", read from the CORRECTED script: 100% of its words in
       order, guard 0 of 5). 74.0 s raw → 67.8 s trimmed; the voice ends at 68.0 s.
       - **Whisper:** it heard "A raise smaller…" as "Arrays smaller…", which is split back with the generator refusing a stray
         "Arrays". It wrote "3 | .7 | %?" as THREE tokens, and the percent sign is joined too.
       - **Timing:** on the take the hook held 7.4 s, so the exit slide starts 16 f after the −0.7% label, not 30. SETTLE swells
         ~14 f in, so the payoff still reads ≥ 1 s first.
       - **★ The bed (Timur, 2026-10-16: "use the same song for now, but remind me to change it"):** 711.mp3 at one volume, a
         PLACEHOLDER. Remind him to change it in every handback until he names the song. Its drop (117.38 s) lands on "On"
         (MUSIC_FROM_S 110.75). At 0.146 the body sits 3.1 dB under the speech-gated voice, every 10-s window 2.9–3.4.
     - **★★ Timur, the same day: "the 3d style is definitely nice, especially near the beginning of the video, but you shouldn't overuse
       it … Pay and prices scene, gasoline scene, weekly pay scene and gas scene should all become 2d."** A standing rule now (STYLE
       §6.1a): 2-D by default, real 3-D only where the idea needs depth. The four scenes were rebuilt as house 2-D solids with the same
       parts, timings and exports: `src/pay/flat.tsx` (`FBox`, `FPrism`: Video 11's `Pillar` finishes in SVG, static gradients); the
       columns are Video 11's `Pillar` itself. The escalator, the reports, the plane, the balance, the grid and the averages stay 3-D.
     - **★ REVISION 2 (Timur, 2026-10-18; recorded in STYLE §16 the same day).** His notes, in film order:
       - hook: nothing on the handrail (the +3.7% PRICES print goes); remove the vertical white line and the see-through line beside it;
         the escalator FULLY 3-D, the plane under the steps closed, the camera-facing side covered with a designed side panel; the
         bundle's shape stays, its LABEL restyled to the house type;
       - reports (7 s): the CPI and REAL EARNINGS books and the white calendar block "don't look 3D" — lighting and shadows wrong;
         REAL EARNINGS too long: smaller and centred;
       - the whole film: every SFX cue synced to its motion; NO ping in the hook; a quiet escalator sound;
       - the pump (20 s, "the gas 3D object… looks blocky"): realistic and detailed, at past Bankers objects' level;
       - the plane (26 s): a better model, not blocky or "AI generated";
       - every 3-D object: lighting and shadows "look like unrendered 3D objects" — fixed in the kit, not left to the render;
       - 31 s (the balance): the top of the +3% box glitches; its lighting; 47 s (the grid): lighting;
       - 59 s (the gas can) and 63 s (the averages): more detail;
       - "The rest of the video is great."
       - **Built the same day:**
         - **The kit's light (`src/pay/p3.tsx`):** Lambert against one key (upper left, in front), a fill from the camera, a soft
           specular, shadow sides tinted BLUE (a grey shade read as dirt), `shade()`/`matBox()` for any base colour, the chrome sheen scaled
           by each face's turn to the lens, a static spotlight FALLOFF over every face, 0.7-px seam strokes, and `contactShadow()` (14
           faint rings: six read as stepped halos on the white stage). The old term kept every face within a step of mid-grey.
         - **The hook:** the escalator closed as a real machine (clad truss with chrome trim, panel joints and kick trim, its end
           face, outer decking, glass, and the handrail looping round a half-round NEWEL at the landing); no rail print; the start line's two
           marks gone; the label is an upright card on the bundle's band in the house type, which turns over to −0.7% REAL PAY.
         - **The objects:**
           - the reports: shaded pages with page lines, a taller calendar with rings so its 14 clears the second report, REAL EARNINGS
             at 34 px centred, and contact shadows. A falling report fades as ONE group: faded face by face, it showed through itself;
           - the plane: a loft (`xloft`) with nose, tail cone, window band, cheatline, windscreen, swept wings and winglets, turbofans on
             pylons, the tail, and the stand moved under the forward cabin (under the wing its post rose out of the near engine);
           - the pump and the gas can: rebuilt with `flat.tsx` `FSolid`/`rrect` (rounded, each facet shaded, catchlight bevel) and their
             real parts;
           - the balance: the strap always paints after the bundle it wraps (the 31-s glitch was a painter's-sort tie);
           - the grid: lit tiles keep their deep blue on the white stage;
           - the averages: shaded bundles, note seams, banknote faces on the top bundles, and contact shadows.
         - **SFX:** no hook ping (a flick on the card's turn); the escalator's running sound is `chain` at 0.11–0.15 in overlapping 84-f
           runs; teachA's whoosh shift removed (whooshsync).
         - **Checks:** stylecheck, the every-frame sweep, violations, flash, popscan, sfxsheet, whooshsync and guardtest are all CLEAN.
           Not rendered.
     - **★ REVISION 3 (Timur, 2026-10-18, the same evening; STYLE §16 rows of that date):**
       - the hook's +3% label card: floating, with a "shadow" behind it, appears abruptly, its flip glitched and ugly → print on a real
         surface, ink in, COUNT the change;
       - the escalator's sound: not the bicycle chain — a real, quiet escalator whir;
       - ~13 s: a sound with the bars is not synced;
       - 25 s: IN ONE MONTH does not fit its panel;
       - 30 s: the balance's block shows the strap's side through its white top; "maybe instead of a block, think of something more
         relevant and creative";
       - 711.mp3 stays for now ("I'll name the song later").
       - **Built the same evening:**
         - **The hook's figure is PRINTED on the bundle's currency strap** (a pale-blue paper strap, 150 wide), inked in as it counts
           +0.0 → +3.0% on "…went up", then counting DOWN through zero to −0.7% as the bundle is carried below where it began. Its ink
           turns to the house red past zero, and PAY cross-fades to REAL PAY. No card, no flip, no hit.
         - **The escalator's sound** is `public/sfx/escalator.wav`, synthesized by `scratchpad/mkescalator.py`: a motor hum whose pitch
           rises with the speed-up, the belt's whir, a comb clack per step at the treads' rate, made for the hook's speed-up window and
           length. Video.tsx refuses if either moves.
           - It plays on its OWN `<Audio>` in Video.tsx: the kit's SfxLayer is canonical (stylecheck ENGINE refused an edit to it).
           - Level from the rendered stems (`scratchpad/esclevel.py`): ~19 dB under the voice, ~7.5 under the hook's bed.
         - **13 s:** `chain.wav` is loud for its first ~18 f, dips 15 dB from f24 and swells again at f80, and one cue asked to span
           both columns (346–462) ran out at 90 f. So it swelled at 13.6 s between the climbs. Every repeating rattle now goes through
           `rattle()`: chainshort fitted to exactly its animation, with copies 24 f apart for longer runs. It also fixed the grid's, the
           week's and the averages', which ran 4–12 f past their file.
         - **25 s:** IN ONE MONTH at 28 px / 4 tracking, centred in its door panel.
         - **30 s:** the balance's bundle and strap replaced by a PAYCHECK: a pay envelope standing on the beam, its cheque standing up
           out of the top (on it, painted after it, never inside it), and +3.0% PAY in its address window.
         - **Tool:** violations.mjs V2 now judges two SVG texts by their INK QUADS (sheared print's boxes overlapped while the letters
           stood clear). It has a quiet canary and a firing twin, and with the branch sabotaged it refuses.
         - **Checks:** every check CLEAN; guard proven; not rendered.
     - **★ THE SONG (Timur, 2026-10-18: "use this song" — "Strings + 808 + Beat", from his Downloads):** the 711.mp3 placeholder is
       retired; the reminder stops.
       - **The file:** copied untouched to `public/strings808.mp3` (71.5 s, stereo, 44.1 kHz). It is constant-energy from its first bar,
         so it has no drop to land and plays from frame 0. It fades out on its own from 49 s and is silent by 64 s, while the voice runs
         to 68 s.
       - **Extended at his word** ("a crossfaded splice back to an earlier bar"): `scratchpad/extend808.py` → `public/strings808_ext.wav`.
         It cuts at the bar line 38.68 s and jumps back exactly 16 bars to 11.25 s, with a 40-ms equal-power crossfade and no level
         change. The seam's level is equal either side, and no sample step is sharper than the track's own.
         - ⚠ The tempo must come from the FULL-BAND spectral flux: the low band alone read 124 BPM, but it is 140 (bar 1.714 s). An
           un-smoothed flux scores every candidate 0.1–0.2; smoothed over 40 ms, the chosen seam scores rhythm 0.36 before and 0.58
           after.
       - **ONE volume, 12/97** (Remotion rounds to 1/97 steps; 11/97 measured 3.6). The body sits 2.8 dB under the speech-gated voice,
         every 10-s window 2.3–3.1 (`scratchpad/session/sep12.py`), fading from the closing logo. The full mix measures −22.3 dB mean,
         −3.5 dB peak.
       - **The escalator sound went back to 1.0** under this louder bed: 15 dB under the voice, 11 under the bed (`esclevel.py`).
     - **★ RENDERED 2026-10-18** (Timur: "render, always ensure that there aren't any glitches in the rendered version").
       - **The master:** `out/paycheck_vs_prices.mp4`, single tab via WMI (`scratchpad/session/render12.cmd`). 2137 f, 71.3 s, 25.5 MB,
         h264 1080×1920 at 30 fps, AAC 48 kHz stereo; −22.3 dB mean, −3.5 dB peak; the tail fades to silence.
       - **Glitch-checked on the file** (`scratchpad/session/mp4glitch.cmd`):
         - every frame decoded: the pop scan is CLEAN. Its one finding, f1674, was WEEKLY PAY's counter digit, pushed over the threshold
           by encoding (the MP4 matches the Studio frames to 0.6 levels), and is logged as a reviewed counter;
         - flash is CLEAN (worst 17.8, limit 25);
         - the MP4 against fresh stills, every 4th frame of the film, is CLEAN (worst tile 3.9, limit 10).
       - **Served** on 4412 through srv.us forward 22 (same throwaway key as the Studio's 21).
     - **★ REVISION 4 (Timur, 2026-10-18; STYLE §16 rows of that date), then RE-RENDERED.** The first master is archived as
       `out/archive/paycheck_vs_prices_v1_before-rev4.mp4`.
       - **Bar SFX:** the bike chain was 24–28 dB under the new song, so it was scored but never heard. Now ×7 (`CHAIN_LIFT`, ~8 dB under
         the bed) on every rattle, plus a ping as each column's figure lands. A cue's level is checked on the stems against the bed in
         its own window.
       - **The camera, every place: ZOOM IN → MOVE → ZOOM OUT** (`phrase()` in Video.tsx), every key gliding at 0.9 depth
         (`KEY_GENTLE`).
         - The hook follows the bundle ~90% centred (`onBundle`: c 0.5 plus a pan and a `panY`) in ONE glide up to the top of its climb
           (`HOOK_TOP`) and ONE down. Four rest-to-rest keys had stopped the camera every ~40 f.
         - stylecheck PHRASE + GLIDE hold this from Video 12 on: five canaries, proven by refusing a single-drift hold.
       - **Captions:** a gap under 12 f between chips is closed (`CHIPS_V`): the 5-f blank at 1825 read as a glitch. A chip that begins
         under the closing question never shows (`CHIPS_SHOWN`): "Tell us below." flashed for 2 f at 2051.
       - **Shadows** fade on their object's own ramp. A falling report's fade is keyed to FRAMES, not to a slice of its in-out drop.
       - **Tightened by the sweep:**
         - margins on the closer framings (19, 31, 39, 52 s);
         - the slide to the pump's vanish (an out key wider than the arrival framing);
         - 0% against the zero line;
         - the 47-s whoosh (its travel is the move again; the push-in after it gentler);
         - the report dropping past the calendar's 14, logged as reviewed motion.
       - **RE-RENDERED 2026-10-18** ("render when you're ready"): `out/paycheck_vs_prices.mp4`, 2137 f, 71.3 s, 27.1 MB, −22.3 dB mean,
         −3.5 dB peak. Glitch-checked on the file: pop scan and flash CLEAN on every decoded frame; the MP4 against fresh stills, every
         4th frame, CLEAN (worst tile 3.8, limit 10). Served on the same link (srv.us forward 22).
   - **Video 13** is `Videos/Video 13 — Layoffs Since 1969/` (Studio 3413, srv.us forward 23 via the session's `tunnel3413.ps1`), built
     2026-10-19/20, cloned from Video 12 (module `src/job/`, composition `LayoffsSince1969`). The brief: "Fewer Layoffs Than Any Stretch
     Since 1969" — DOL's weekly claims, 199,000 in the week to Oct 10 (released Oct 15), the fifth straight week under 200,000. HARD 80-s
     cap; the hook (FIVE WEEKS UNDER THE BAR) mandatory; the DEMO ANCHOR and every STYLE §16 rule.
     - **The script went back first.** Every figure checked at primary source (DOL's release and its claims database since 1967; BLS for
       the labor force and payrolls). Three low corrections armed in the guard: "workers" → "workforce… twice as big" (the screen shows
       the LABOR FORCE), "most up-to-date OFFICIAL read" (private trackers publish too), "Few layoffs ARE". ⚠ 1969 holds as "the last time
       that happened" (no run of even three weeks under 200K since Nov 1969), but NOT as "the longest streak" (1969's ran 16 weeks): no
       line or label says "longest" or "record". The Oct 10 figure is an ADVANCE estimate, revised Oct 22: re-check before posting.
     - **The take was GENERATED by Claude in ElevenLabs** (Bankers §1, 2026-10-18): "Jon – Calm Presence", eleven_v4, from the final
       VO_SCRIPT.txt; it read 100% as written (guard 0 of 3). 64.0 s raw → 58.8 s trimmed; the film runs 62.3 s. Whisper split
       "199 | ,000" (joined in captions_vo.mjs) and ran three sentences on after commas (split back at their stops).
     - **The bed is "Strings + 808 + Beat"** (the previous video's song), `strings808_ext.wav` at one volume 12/97: 2.3–3.0 dB under the
       speech-gated voice in every 10-s window, the tail 3.0 (Video 12's accepted level). Full mix −22.3 dB mean, −3.5 dB peak.
     - **Built:** the hook in real depth (`places/limbo.tsx`: the rail, the limbo bar at exactly 200K on the columns' own zero-based scale,
       the five weeks at their real heights, the tally, the whip back to 1969 as the construction's own dolly, and the SPINE RETURN —
       the bar side-on with a sixth slot NEXT WEEK ? and a ghost column wandering equally above and below the bar); the clock, counter,
       calendar, lunch pails, mailbox, day-tiles (the light frame) and payroll bars as house 2-D; the office tower in real depth. The
       brief's two bar charts (the pails and the payrolls) carry `style-exempt:` on their KIND lines.
     - **Lessons from the build:**
       - **A gradient id that matches the kit's own collides silently.** `FlatDefs id="ck"` defines `ckFace`, `ckLit`, `ckCap` and
         `ckSide`; the clock's own `ckFace` came second, so its pale dial drew in the house face blue (and Thursday's `thLit` the same).
         Never name a gradient `<flatDefs id>` + Face/Lit/Cap/Side.
       - **`...fromDepth()` spread after a `transform` REPLACES it** (it returns its own transform): the payroll figures lost their
         centring and sat on their bars. Put fromDepth on an inner div, as the house figures do.
       - **A distance fade at the lens blinks at whip speed.** The first whip (5,200 px of dolly on SETTLE in 48 f) carried things through
         the near-lens fade in one or two frames: the pop scan's blinks at 170–181. Now the whip is an in-out over 59 f, the bar scene
         dissolves by TIME as it rushes at the lens (the house push-past), the rail and markers fade only once they are off the frame,
         and the dashed lane fades before the speed builds.
       - **Things the probe has no depth for:** columns passing before and behind the uprights, and an envelope going in behind a
         closing door, are not measured while in flight; hidden neighbour digits on a drum counter (clipped by `overflow`) are skipped.
       - **A slide's overlap needs both places' BASES on screen:** the payroll's month names now arrive with the camera (13 f → on the
         rule), and 1969 and the office tower rest a little off centre (a key plus a pan), so each shares its slide out for ≥ 15 f.
         A slide may not be shortened below 1,020 px (stylecheck CAMERA).
       - **★ A REGULAR GRID STROBES AT A SLIDE'S PEAK SPEED.** A slide peaks at ~50–70 px a frame (more when the place it leaves was
         zoomed in: the slide scales with that distance). Any grid spaced under about twice that step (window bays, day cells, wire
         rings) jumps half its own spacing a frame: to the eye a wagon-wheel strobe, to the pop scan a VANISH it cannot excuse. Fixed
         by spacing, not by the checker: the tower went to three wide bays and a one-bay side, the calendar's cells to 112 px and its
         rings from 13 to 6, and the counter's zoom eased (dz 0.12 → 0.06) so the slide after it is a plain frame wide.
       - **★ PAINT ORDER FROM THE EYE, NOT FROM AVERAGE DEPTH.** Two solids separated by a plane: whichever side holds the EYE is
         nearer. From the hook's upper right the left upright is always behind the columns and the right one always in front
         (`limbo.tsx` `eyeX`); sorted by average depth, a column flipped in front of or behind an upright in one frame.
       - **A distance fade at the lens and an edge-on face both blink at speed:** the office's right face went edge-on mid-slide (its
         turn now ends at −14°), and the hook's last column left the frame too fast to follow (columns now leave at 26 a frame, arrive at
         40, the speed blended through the bar).
     - **Final state (2026-10-20):** stylecheck CLEAN; the every-frame sweep CLEAN (SCENES clean, every hand-over on the rule);
       violations CLEAN on settled frames; flash CLEAN (worst 19.3); popscan CLEAN (15 reviewed motion findings, none a VANISH, each
       looked at); every camera whoosh within ±3 f; sfxsheet clean; SFX families within ~1.5 dB of Video 12's; guard proven; not
       rendered.
     - **★ THE SONG (Timur, 2026-10-20: "use this song, make sure audio levels are right"):** Luke Muzzic, "Me And The Devil" (Instrumental),
       copied untouched from the chat upload to `public/music_devil.mp3` (182.6 s, stereo, 44.1 kHz). It replaces "Strings + 808 + Beat"
       for Video 13, and by the standing rule it is the next video's bed too unless he names another. ⚠ A commercial track: flag the
       client's rights.
       - It holds −7 to −10 dB in 2-s windows from its first second to 178 s (no intro, drop or fade in the film's length), so it plays
         from its top. But at one volume it sat 2.7–4.7 dB under the voice across the 10-s windows, so a slow envelope (linear in dB between
         window centres) is BAKED into `public/bed_devil.wav` by `scratchpad/bedbake13.py`, a controller run on the rendered stems, and played
         at volume 1. One correction put every window at 3.36–3.71 dB under the speech-gated voice (house 3.5); the voice's last 3.5 s sit at
         4.2 (the safe side). Full mix −22.7 dB mean, −4.2 dB peak; after the voice, the bed alone, fading.
       - ⚠ Its intro is sparse hits over near-silence (−24 dB a second, −60 dB at the median 33-ms frame): judge it in seconds or windows,
         never by a per-frame median.
     - **★★ Timur on that render (2026-10-20): "the music needs to begin at the start, not at around 5 seconds. Also, like I said, adjust the
       audio levels to the way they are in previous bankers videos, the song is too loud now."** Two standing rules:
       - **The music is heard from the film's first frame.** A song whose own opening is a sparse or quiet intro is cut to start where its
         music proper begins (find it on the waveform), never left to arrive seconds into the hook.
       - **The bed's level is matched to the previous Bankers films AS HEARD, not by plain RMS.** The 3.5-dB RMS rule put this denser,
         brighter track audibly louder than Videos 11–12's beds. Measure the bed against the voice in K-weighted loudness (LUFS) on the
         rendered stems and match the previous films' figure.
       - **Built the same day:**
         - The song opens with four lone hits over silence (0.19, 1.54, 2.88, 4.23 s; −50 dB between them), and its music proper enters on
           the fifth hit (5.58 s). So the bed is cut from 5.55 s, and music is heard from the first 100 ms.
         - Videos 10–12's beds, measured by `scratchpad/lufsgap13.py` (K-weighted, BS.1770, voice speaking; canary: a −20 dBFS sine in both
           channels reads −20.0 LUFS):
           - V10: 4.6 LU under the voice, p90 3.4, p98 2.7;
           - V11: 6.0, 4.3, 4.0;
           - V12: 4.0, 3.2, 2.5.
         - This song at its RMS-set level read 4.7 / 3.1 / 1.5, and cut from the beat 4.0 / 2.4 / 0.9: its hits came at the voice.
         - `bedbake13.py` now controls K-weighted loudness: 5.8 LU under in every 10-s window (5.75–5.83), p90 4.25, p98 2.67, inside the
           previous films' range. It is baked as `public/bed_devil_r2.wav` (a new name, so the Studio can't replay a cached bed).
         - Mix −23.1 dB mean, −3.3 dB peak.
         - The 2026-10-20 MP4 carries the old bed and is out of date until a re-render.
     - **★★ Timur, the same day: "what are those wierd new sound effects that you added? remove them. just keep the ones from before the
       prompt." Then: "use more of the 100bps sound effects".** STYLE §16 records both:
       - **No synthesized SFX in a Bankers film.** The made sounds (public/sfx13, `mksfx13.py`, now marked retired) were removed, and the
         pack cues they had replaced are back exactly (the clock's chain, click and flick; the drums' chain and click; the mailbox's
         whooshsofts, click and flick; the tiles' chain and sub; the floors' ticks).
       - **More 100bps cues, family per job:**
         - a soft whoosh as each car passes the beam;
         - a flick as "200,000 CLAIMS" prints;
         - the data texture as 1969's slots light and as the calendar counts its weeks;
         - a tick as the lobby lights;
         - a click as the sixth slot warms.
       - 83 cues; sfxsheet clean. The families sit within ~1–2 dB of Video 12's (sfxlevels.py; the one sub reads hot only because the
         tiles' chain shares its window). Mix −23.1 dB mean, −3.3 dB peak.
     - **RE-RENDERED 2026-10-20 ("render")** with the re-cut, re-levelled bed and the pack-only score. The first master is archived as
       `out/layoffs_since_1969_v1_old-bed-and-sfx.mp4`.
       - **The file:** `out/layoffs_since_1969.mp4`, 1869 f, 62.4 s, 28.6 MB.
       - **Audio:** −23.1 dB mean, −3.3 dB peak; the music at −23 dB in the first half-second; the tail fades to −67 dB; r 0.9999 against
         the mix probe.
       - **Picture:** flash CLEAN; the MP4 against fresh stills CLEAN (worst tile 4.2). The pop scan's one finding is again the calendar
         edge at 697, the same traced slide (58 → 74 → 38 px a frame; the MP4 within 1.2 levels of the source).
       - **Served** on the same srv.us forward 24 link; byte-for-byte match.
     - **RENDERED 2026-10-20** (Timur: "render, ensure there aren't any issues in the rendered version"), single tab via WMI
       (`scratchpad/session/render13.cmd`): `out/layoffs_since_1969.mp4`, 1869 f, 62.4 s, 28.6 MB, h264 1080×1920 at 30 fps, AAC 48 kHz
       stereo; guard 0 of 3. Audio −22.7 dB mean, −4.2 dB peak (the mix probe's exact figures; r 0.9999 against it at Remotion's 2048-sample
       AAC delay); after the voice the bed alone, fading to −68 dB. Glitch-checked on the file (`scratchpad/session/mp4glitch13.cmd`):
       - flash CLEAN (worst 19.3) on every decoded frame; the MP4 against fresh stills, every 4th frame, CLEAN (worst tile 4.2, limit 10);
       - the pop scan on the MP4's frames found a BLIP at 162 (the stand's base in the whip: added to the reviewed dissolve) and a VANISH at
         697 → 698. ⚠ The VANISH is the calendar card's left edge sliding out on the hand-over to the pails, traced frame by frame as a smooth
         ease (58, 66, 72, 74, 70, 62, 56 … px a frame). It crossed the tile in one 62-px step, past the scan's 48-px local search. The MP4 is
         within ~2 levels of the source render there, and the source's frames pass the same scan. Not a glitch, so the master was kept, and
         it was reported to Timur as the scan's one open finding. A VANISH is never written into the excuse file.
       - Served on 4413 through srv.us forward 24 (session `tunnel4413.ps1`, `scratchpad/session/serve4413.cmd`); a full download through
         the link matched the file byte for byte.
     - **★ REVISION 1 (Timur, 2026-10-20; STYLE §16 rows of that date).** His notes, in film order:
       - hook: "I really, really like the idea… Lots of motion" — but the objects are "not detailed enough… very simplistic": replace the
         week BLOCKS on the path with something more creative; make the 200,000 CLAIMS stand and the path more detailed; every object
         metallic and shiny like the day-tiles at 36 s; the 1969 at 7 s the same; the camera CENTRED at ~8 s (it sat "a little far to the
         right");
       - the clock (10 s): a good idea, not polished enough — the rim shows its rectangles; a smooth metallic surface, more 3-D, more
         detailed;
       - the counter: "great"; the calendar: good, but its top details (rings, header) more 3-D and detailed;
       - the mailbox: "absolutely terrible, at least the top of it", and the letter glitches through its door — rebuild it as a real 3-D
         Bankers object, satisfying and smooth, the door opening correctly and the letter going in correctly; redesign the letter;
       - the office tower (41 s): more detailed, "too plain right now";
       - the spine (55 s): the same changes as the hook; NEXT WEEK ? ABOVE the slot, not beside it;
       - the SFX: synced properly, with new, correct sounds for the right visuals where possible.
       - **Built the same day:**
         - **The kit (`p3.tsx`):** a `gloss` sheen on any face and `steelBox()` (metalBox + gloss on the faces turned to the lens + catchlight
           lines on the top's front and left edges): the house metal for every rebuilt object.
         - **The hook and the spine (`limbo.tsx`):** the week blocks became five steel FLATCARS on the rail (wheels, frame, deck, couplers),
           each carrying a stack of claim forms strapped down, its band printing the week's figure; the bar is a steel I-BEAM printed
           200,000 CLAIMS on its web between round posts on bolted bases, the left post carrying the five-slot tally; year plaques on steel
           frames; 1969 a chrome numeral on a steel plinth. The camera centres 1969 as it lands (hookB's pan). NEXT WEEK ? sits ABOVE the
           beam's sixth slot.
         - **The clock:** in real depth, no Turn: a 160-slice drum, a chrome bezel as ONE evenodd ring with a gloss sheen (no visible
           facets), a step ring, the dial printed on the face, a date window, hands with shadows, glass, a steel nameplate.
         - **The calendar's top:** the header band with depth, shadow and gloss, punched holes, twin-wire loops front and back.
         - **The office tower:** spandrels, glass with gloss, slab bands, mullion fins, a parapet, a louvred crown, a spire and beacon, lobby
           mullions, a door, a canopy and steps, painted roof-first so the crown never covers the top floor.
         - **The mailbox:** in real depth: an arched steel shell with OUTWARD normals (inward ones drew its inside), a dark mouth and lip ring,
           rivets, a door hinged at its foot (it opens 100° on its hinge, the outer and inner faces chosen by `seen`), latch tab and hinges,
           and a flag on its own plane. The letter is a real envelope (flap, perforated stamp, postmark, address lines) that rises in front of
           the open mouth, slides in clipped to it, and is gone once the door shuts.
         - **The sounds (`scratchpad/mksfx13.py` → `public/sfx13/`):** the pack has nothing for these, so each is SYNTHESIZED and cut to its
           own motion from TIMES: the flatcars' steel roll swelling as each clears the beam; the clock's tick-tock, gear clicks along the
           hands' eased sweep, the date ratchet and a latch on 8:30; each drum's clicks as its digits pass and a clack as it lands; the
           mailbox door's hinge and stop, the letter's paper slide, the door's shut and the flag's catch; a keycap click per day-tile and
           THU's lift; a light switch per floor. They REPLACE the pack's chain, ticks, clicks and whooshes on those actions; each scene's
           file plays on its own `<Audio>` (SfxLayer is canonical), and Video.tsx REFUSES if the windows a file was made for have moved
           (proven by moving one). Levels from the rendered stem: the roll ~16 dB under the voice, the clicks and clunks 11–14 dB under,
           all under the camera whooshes.
       - **What the checks found on the rebuild, and the fixes:**
         - "200,000 CLAIMS" was crowded by the I-beam's flanges (its 40-px web; the flanges overhang it in perspective): web 64.
         - The mailbox was all `skip` until its letter, so the hand-over read a 39-f gap, then a POP and a VANISH as the letter's skip
           switched. The post and foot are measured; the letter is measured throughout and fades into the box's dark (never switched off).
           **Never toggle `data-probe-skip` on a thing while it is on screen: the probe reads the toggle as a pop.**
         - Centring 1969 cut the hook → clock slide to 13 f. The clock stands 100 px right at its arrival, and its keys pan it back to the
           centre. ⚠ The 1969 key aims in SCREEN space (`centreOn`), the clock's in its PLACE's space, where the pan carries the whole offset.
         - At 8:30 the minute hand covered the date window under the hub: the window now sits between the 12 and the hub.
         - The last flatcar left the frame at ~115 px a frame in the whip's first frames (VANISH): the cars dissolve with the whip's first
           10 f (`carPast`), the stand later.
         - NEXT WEEK ? above its slot made the spine leave ~3 f sooner: the question's slide starts 27 f before its first word (was 31).
         - Four whooshes re-timed on the new pictures (PEAK_SHIFT hookB −1, honestA +6, honestC +15). The opening's whoosh starts on frame
           0. whooshsync now judges the film's opening against the camera's own early peak, because the rolling cars outgrow it.
         - `scratchpad/session/dumptimes13.mjs` only bundled; it now writes `out/times13.json` itself. The sound plan had been cut from a
           stale dump, and the guard passed because the plan's windows had not moved.
         - Final state: stylecheck CLEAN; the every-frame sweep CLEAN (every hand-over on the rule); violations, flash and popscan CLEAN (the
           stand's dissolve in the whip reviewed); every whoosh within ±3 f; guard proven; mix −22.3 dB mean, −3.5 dB peak; not rendered.
   - **Video 14** is `Videos/Video 14 — Phones Worst Quarter/` (Studio 3414, serve 4414, srv.us forward 25 via the session's
     `tunnel3414.ps1`), built 2026-10-21, cloned from Video 13 (module `src/phn/`, composition `PhonesWorstQuarter`). The brief: "The Worst
     Quarter Ever for Phones" — IDC's 3Q26 smartphone shipments, −22%, the largest year-on-year drop on record (released Oct 14). HARD 80-s
     cap; the hook (THE CHIP LEAVES THE PHONE) mandatory; the DEMO ANCHOR and every STYLE §16 rule.
     - **The script went back first.** IDC's release (dateline Oct 14, posted Oct 15), IDC's Feb 26 blog and Micron's Sept 30 8-K (FY25
       $8,539M, FY26 $84,969M GAAP net income). Six corrections armed in the guard before the take: "the two biggest" (medium), the
       low-end brands "about thirty percent or more" (medium), "tends" (low), "the makers of the cheapest phones get squeezed first"
       (medium), "memory price RISES are slowing" (high: prices still rise, the pace slows), "doesn't expect the market to recover before
       2028" (low). The brief's on-screen stamp goes in the post caption (§5.7).
     - **The take was GENERATED by Claude** (ElevenLabs "Jon – Calm Presence", eleven_v4) from the final VO_SCRIPT.txt: 72.8 s raw → 66.7 s
       trimmed; the film runs 70.2 s. Whisper read 97.8% of the script; captions_vo.mjs merges "%" tokens and restores four sentence stops.
     - **The bed is "Me And The Devil"** (Video 13's song, the standing rule), the file as given from its fifth hit (5.55 s) at ONE volume
       (STYLE §11.3), set from this film's rendered stems by K-weighted loudness against Videos 10–13.
     - **★ THE HOOK WAS REBUILT (Timur, 2026-10-21: "the hook scene should be recreated, right now there isn't enough motion in it and it is
       too simple. Come up with a better idea, considering the last two bankers videos made"; STYLE §16).** One phone turning while one chip
       flew to a rack was too still beside Video 12's escalator and Video 13's limbo rail. It is now THE FORMATION (`places/hook.tsx`): fifty
       lit phones five abreast and ten deep on a dark floor, a wave of light running through the rows and the formation drifting toward the
       lens from frame 0; −22% lands over it; on "biggest drop on record" ELEVEN of the fifty (11/50 = 22%, asserted against data.ts) topple
       backwards one after another, front to back, and go dark; on "The reason is AI." their memory chips rise out and stream as a swarm,
       riding the camera's travel, into an AI rack whose eleven bays light in turn; AI lands. Each phone is built from its own outline and
       turned about its base's back edge (a fall), not by a rig of its own (one rig keeps one perspective). Its score: a tick on every other
       landing (8 f apart), the data texture under the bays filling. The opening zoom aims at y 900 (a centred push) so −22% never rides up
       into the caption.
     - **★ REVISION 1 (Timur, 2026-10-21; STYLE §16 rows of that date):** the hook floor's edges fade out; the screen-shine wave narrower
       and more visible; no white box round any chip; AI fits its header; the rack's sockets on its own turned face, the rack more
       realistic; the pallets' base cleaned up and the cartons made recognisable as phone boxes; −22% moved clear of the ghost; the
       brand bars' one-frame colour change fixed and a gap under the platform; every phone a detailed realistic handset (31, 35, 40, 49,
       60 s); the supply chips go INTO the phone and the rack; the cylinder's foot seated in a collar; the shelf's tier labels redesigned;
       the dial rebuilt as a detailed 3-D instrument with a smooth needle and 0% clear of it; the spine's signs redesigned.
       Built the same day: `phone14.tsx` FlatPhone/phoneFaces rebuilt as real handsets (titanium frame, side buttons, CameraModule with
       layered lenses, wallpaper, island); FlatChip has no halo; the hook's chips morph their shape onto the rack's turned face as they seat;
       the supply chips go in behind the phone and the rack (painted after them); the gauge is Video 13's clock recipe (pace.tsx); the spine
       is the phone showing IDC's outlook as a recovery bar (spine.tsx). Every check CLEAN; not rendered.
       ⚠ A raw-text patch helper wrote its own end marker into shelf.tsx when a replacement was EMPTY, and the sweep caught it as a text
       ("@@@END") — any edit tool must handle an empty replacement, and grep for its markers after use.
     - **★ THE SONG (Timur, 2026-10-21: "use this song"): "Golden Hour"**, his file from Downloads, copied untouched to
       `public/music_goldenhour.mp3` (308 s, stereo, 44.1 kHz; md5 6bcb3ade…). It replaces "Me And The Devil" for Video 14 and, by the
       standing rule, is the next video's bed unless he names another. One volume, music from the first frame, level as heard (STYLE §11.3).
       ⚠ Commercial or not, flag the client's rights in the handback until Timur confirms them.
     - **RENDERED 2026-10-21 ("render")**, single tab via WMI (`scratchpad/session/render14.cmd`): `out/phones_worst_quarter.mp4`, 2106 f,
       70.25 s, 28.0 MB, h264 1080×1920 at 30 fps, AAC 48 kHz stereo; guard 0 of 6. Audio −23.5 dB mean, −4.2 dB peak; r 0.9999 against the
       mix probe at Remotion's 2048-sample AAC delay; after the voice the song alone, fading. Glitch-checked on the file
       (`scratchpad/session/mp4glitch14.cmd`): flash CLEAN (worst 19.1); the MP4 against fresh stills, every 4th frame, CLEAN (worst tile 3.9);
       the pop scan on the MP4's frames flagged two designed motions only the encoded frames push over its threshold (−22% sliding out at the
       travel's peak, 165; the buyer stand's post sliding in, 1140, 15 levels) — looked at and logged as reviewed; never a VANISH. Served on
       4414 through srv.us forward 26 (session `tunnel4414.ps1`, `scratchpad/session/serve4414.cmd`); a full download matched byte for byte.
     - **Built:** the hook in real depth (`places/hook.tsx`); everything else house
       2-D (`flat.tsx`) except the spine's return (`places/spine.tsx`, the hook's phone dark on a rail of years). Brand marks for the five
       makers are simple-icons paths in `src/phn/phonelogos.ts` (`scratchpad/mkphonelogos.mjs`), drawn navy on the white stage.
     - **Lessons from the build:**
       - **A traveller carried by a camera move rides the move's own curve.** The chip flew on its own ease while the camera travelled on
         SETTLE, which peaks ~29% in, so the camera outran it and the chip left the frame mid-flight. It now takes the travel's SETTLE for
         the distance and eases only its own step on screen (`hook.tsx` `cam`).
       - **A decoration on a figure reads as a glitch.** A small chevron over −22% read as a mark scratched across the "2"; it went.
       - **A label over a tall object in the upper third meets the caption band** (AI DATA CENTER over the giant rack): labels go under
         the floor.
       - **A shelf's brackets stand between the tiers**, never under a tier's label.
       - **A thing settling onto a surface comes out of DEPTH toward it** (the chip onto the phone's back), never down across the
         surface's own parts (it crossed the camera island).
       - **A part hidden behind a solid hides its print too.** The chip's MEMORY was drawn after the phone's faces while the chip was
         still behind it, so it showed through the phone (popscan f158). The chip comes in front only once it has cleared the top edge,
         and its print fades in then.
       - **A face turning edge-on fades with its projected width** (`phone14.tsx` back): culled at 11 px wide, it read as a VANISH.
       - **Tracking text: a low line on a FAR plane crosses the lines above as its words fly in from depth** (they start near the block's
         centre). The question's lowest line sits on a near plane, just behind the accent.
       - **A network timeout fetching Google Fonts kills the sweep**, and every check after it then reads the PREVIOUS frames. Read the
         sweep's own lines before trusting the rest of a run.
     - **Final state (2026-10-21):** stylecheck CLEAN; the every-frame sweep CLEAN (SCENES clean, every hand-over on the rule); violations
       CLEAN on settled frames; flash CLEAN (worst 19.0); popscan CLEAN (2 reviewed question motions); every camera whoosh within ±3 f;
       sfxsheet clean; SFX families within ~2 dB of Video 13's; the bed 5.9 LU under the voice (p90 4.3, p98 2.7, as Video 13's 5.8 /
       4.25 / 2.67); mix −22.9 dB mean, −3.8 dB peak; guard 0 of 6 blocking; not rendered.
   - **Video 15** is `Videos/Video 15 — SpaceX AI Revenue/` (Studio 3415, serve 4415, srv.us forward 27 via the session's
     `tunnel3415.ps1`), built 2026-10-22, cloned from Video 14 (module `src/spx/`, composition `SpaceXAIRevenue`). The brief: "SpaceX Is a
     Rocket Company. Its Biggest Business Is AI." — SpaceX's Q3 2026 results (8-K, Oct 20, 2026, Exhibit 99.1). HARD 80-s cap; the hook (THE
     PAYLOAD IS AI) mandatory; the DEMO ANCHOR and every STYLE §16 rule.
     - **The script went back first.** Every line held at primary source (data.ts asserts each spoken claim against the 8-K's figures), so
       there is no correction to arm: guardtest proves the guard on a PLANTED entry when the live list is empty (a check whose failure mode
       is "pass" must be made to fire).
     - **The take was GENERATED by Claude** (ElevenLabs "Jon – Calm Presence", eleven_v4) from the final VO_SCRIPT.txt: 71.1 s raw → 63.7 s
       trimmed. The pause after the hook is VO_GAP 36 (not 12): the payload lands on "combined" and must read ≥ 1 s before the lens bloom
       starts to grow (Video.tsx FLARE asserts it).
     - **The hook** (`places/hook.tsx`, real depth): the rocket as a vertical LOFT (`yloft`, shared with the spine via `rocketParts`), its
       climb inside the construction (the pad falls away), the crane to the nose the world's (hookB), and the payoff's opening-out the
       construction's own zoom (`ZF`/`PIVOT`), so the payload's swell and the rocket's shrink ride one curve. The fairing halves are open
       shells (inner faces painted before the payload, outer after). ⚠ Laid out by eye first, the payload covered the caption band and the
       rocket's base left the frame: solve PIVOT/ZF from the ROCKET'S VISIBLE PART (the adapter down, once the fairing is gone).
     - **Set aside, and said so:** the brief's ping on "AI $7.56B" (STYLE §16 2026-10-18: no ping in the hook — a sub lands it); its "·"
       label chains (separate lines); its on-screen stamp (post caption, §5.7).
     - **Lessons:** a p3 `contactShadow` pushed into a face list without a −1e6 depth paints OVER nearby faces (the pie's gap read as a grey
       slab); a drawer pulled out toward a camera that looks down covers the drawer BELOW it on screen, so the deepest drawer goes lowest.
     - **★ REVISION 1 (Timur, 2026-10-22; STYLE §16 rows of that date).** His notes: the hook's rocket far more detailed and as good-looking
       as the film's other objects; the fairing halves to FALL under gravity, not exit sideways; the payload "cube" — say what it is, and if
       made up, replace it with a real thing; the 11-s visual an actual thing; no rectangle round the SpaceX logo; the 28-s server more
       detailed and 3-D; the 35-s rocket the same as the hook's; the 38-s cabinet's cash improved, no drawer showing through its top, more
       cabinet detail; the 42-s blocks replaced by something that means revenue; only SFX he has approved, synced. The song: he will send
       one (until then Golden Hour stays).
       - **Built the same day:** the rocket's polished finish (`hook.tsx` `polish`: a side key, a strong terminator, a specular stripe), seam
         rings, the raceway, thin lattice grid fins on hinge blocks, legs with pushers and feet, the fairing's separation ring and seam, 48-
         facet lofts; the halves kicked clear then FALLING (an accelerating drop, ≤ 16° lean); the payload a real data-center AI chip (package
         board with pads and capacitors, interposer, compute die printed AI, six HBM stacks; $7.56B on the board) painted in layers; the 11-s
         scene SpaceX's printed results release (Exhibit 99.1) as a paper stack with a binder clip (`pad.tsx`); the server rebuilt in real depth
         (`compute.tsx`: lid off, eight GPU heat sinks, CPUs and memory, fan wall, bezel); the cabinet drawn in layers with each drawer painted
         only OUTSIDE the carcass (behind the top's lip nothing is drawn), banded $100 bundles four deep, pressed side panels, frame, plinth
         and feet; the ×9.3 scene as coin stacks in real depth (`grid.tsx`), each stack dropping in under gravity.
       - **Lessons:** an `after` set on a face AFTER the face list was copied (`L()` spreads into new objects) is lost — attach prints before
         copying; a flat package's interposer painted by average depth covered the memory stacks at its edges — paint layered parts in fixed
         layers; a vertical body under the frame's high key reads matte — light a turned body with a lower side key so it shows a terminator
         and a highlight; cash low in a tall drawer is hidden from a camera above — fill it up toward the front's top edge.
     - **Then (same day): "rocket surface should be smooth"** (STYLE §16). Each loft band's visible facets are now ONE polygon filled with a
       gradient across it, a stop per facet's shade (`hook.tsx` `smoothBand`), so the light runs round the curve with no stripes. The
       gradient ids carry the frame (`tagFrame`), so a sequential render never reuses an id whose stops changed (Video 11's stale paint).
     - **★ REVISION 2 (Timur, 2026-10-22: "a weird line right above what looks like the solar panel, and below it as well… at around 2 seconds,
       part of the rocket at the bottom of the screen sort of glitches… make those parts closed off until the part that opens actually opens…
       focus a lot more on the details of this rocket… there shouldn't be any mistakes on it"; STYLE §16).** Built the same day:
       - **The lines by the grid fins** were two 6-unit bands either side of the interstage (a light one in the body's ink, a dark ring) and
         a 1-unit ledge (the interstage at RB + 1). The interstage is now ONE band at RB, flush; the weld seams are fine grooves a shade under
         the body (`SEAM_INK`), never black rings.
       - **The 2-s glitch:** a leg's average depth sat within a few units of the smooth body band's, so they swapped paint order as the rocket
         turned. Every attachment is now painted by its SIDE (in front of every band when it faces the camera, behind when it doesn't).
       - **Closed until it opens:** before separation the fairing is one closed shell (`closedFairing`, the same 48 facets the halves split
         into), flush with the stage at RB, with no seam strip and no inside showing; the halves exist only from the first frame they move.
       - **Polish:** the nose is 24 sections on one smooth profile (six coarse rings stepped their light), the boattail an S-curve of 16
         sections, band outlines 1.6 px so neighbours never leave a hairline; the legs are black carbon panels lying ON the body, tapering
         to the tip (they were light sticks standing off it), and the raceway a flush curved cover. Inspected at full size at 0, 20, 40,
         62–64, 112 and 121–128.
     - **Then (same day): "instead of the grok text, use the grok logo"** (STYLE §16). At Timur's yes, Wikimedia Commons'
       `Grok-feb-2025-logo.svg` (2.4 KB; source grok.com, author X.AI Corp; listed public domain as simple shapes and text, a trademark
       all the same) was copied untouched to `public/brand/grok-feb-2025-logo.svg`; its paths are in `src/spx/groklogo.ts` (mark +
       wordmark), drawn white, 250 wide, on the server's monitor glass.
     - **And: "the camera starts with an angle too low in the hook scene."** Frame 0 framed the empty floor under the pad with the nose cut
       off at the top. The opening push now starts raised (`ARRIVE_Y` 260 in Video.tsx: the whole rocket on its pad in frame) and settles
       onto the hook's framing as it lands at frame 30.
     - **And: "try finding and including the right sound effects for the hook scene, make sure they are good"** (STYLE §16). The pack has
       nothing for a rocket, so Claude generated effects in ElevenLabs (`eleven_text_to_sound_v2`, flow jhhQ5RdUCVpBTSi72YkC, ~2 cents for
       eight 1-s takes; the takes kept are in `scratchpad/sfx-src/` with SOURCE.txt). `scratchpad/mkhooksfx.py` places them on the hook's
       frames in ONE file, `public/sfx15/hook.wav`, played on its own `<Audio>` (the kit's SfxLayer is canonical), and Video.tsx REFUSES if
       the separation or the rise moves (proven by moving one):
       - the LIFT-OFF RUMBLE at full from frame 0 (the engines are lit), falling away by frame 108 as the camera climbs off the engines. The
         connector only returns 1-s clips, so it is lengthened by overlapping windowed grains of the take's own sustained part (fixed seed,
         no repeating loop) and low-passed to sit distant. About 10 dB under the speech-gated voice;
       - the fairing's BOLT HIT on frame 121, as the halves start to part (measured on the stem: 120.7), 15 dB under the voice peak; the pack
         swoosh stays on the halves falling;
       - the AI chip's POWER-UP from frame 125 as it rises and glows, loudest at 148.5 (the rise's middle), faded rather than cut; it
         replaces the pack whooshsoft there. The sub on "combined" stays.
       - Mix −23.4 dB mean, −4.6 dB peak; sfxsheet, stylecheck CLEAN.
     - **Then: "remove the sound effect that occurs at around 4 seconds and 26 milliseconds, and add a rocket sound effect that is sort of
       long and continues throughout the hook scene"** (STYLE §16). The 4-s sound was the fairing's bolt hit (120.7 f): withdrawn. The rocket
       now ROARS from frame 0 to the hand-over (four steady 2-s ElevenLabs takes chained by equal-power crossfades, leaving with the push into
       the bloom, frames 255–283); `mkhooksfx.py <rise0> <whatA>`, guarded on both (proven by moving one).
     - **Then: "give me a few options for the sfx for the rocket, takeoff and while its in the air, I'll choose which one you use."** More
       takes were generated (ignition ×3, flight ×6; the "airy, high in the sky" takes came back as fly-by whooshes and were dropped).
       `scratchpad/sfx_options.py` puts each option IN PLACE (the hook's first 9.5 s with the voice, song and other effects, from the
       rendered stems) into `out/sfx_options/`: takeoff A deep boom, B crackling blast, C distant ignition (each over flight 1); flight
       1 deep steady, 2 close powerful, 3 crackling distant (each after takeoff A). Until Timur picks, the film carries flight 1 with no
       takeoff layer.
     - **Then: "they're all wrong, they don't sound like a rocket taking off"** (STYLE §16: a real thing sounds like that thing; prefer a real
       recording). At Timur's yes, NASA's real Falcon 9 launch audio was downloaded: "SpaceX CLPS IM-2 Live Launch Coverage - Pad Mic 1 (1),
       Pad Mic 2 (2)" (KSC-20250226-AU-ILW01-0002, 4.2 MB, credit NASA/Isaac Watson), kept untouched in `scratchpad/sfx-src/` with its map
       in SOURCE.txt. `sfx_options.py` now cuts the options straight from it, each flight sound ONE unbroken stretch: takeoff A ignition +
       build (close mic, 123.15 s), B straight into the blast (125.6 s), C the roar arriving (far mic, 151 s); flight 1 crackling roar (far
       mic, 162 s), 2 deep climb (far mic, 229 s), 3 close rising (close mic, 136 s). The generated previews were moved to
       `out/sfx_options/rejected_generated/`. Credit NASA in the post caption if the client wants sources listed.
     - **★ CHOSEN: "last one seems good"** (`nasa_flight_3_close_rising.mp3` = takeoff A + flight 3). `mkhooksfx.py` builds exactly that into
       `public/sfx15/hook.wav`: the close pad mic's ignition and build (123.15 s, 3.6 s), then the same mic as the rocket rises off the pad
       (136.0 s, unbroken), to the hand-over, plus the chip's power-up. Measured on the stems: ignition 12 dB under the speech-gated voice,
       the rising roar 9 dB under, fading naturally as the rocket climbs away; mix peak −4.6 dB. sfxsheet, stylecheck, guard CLEAN.
     - **Then the 4–5-s sound (STYLE §16).** "You removed the wrong one. Re add the previous one, remove the one I hear now" — I took that to
       be the halves' pack swoosh (peak 4.1 s), restored the bolt hit and removed the swoosh. Then: "the sound effect that I DON'T LIKE IS
       STILL PLAYING AT 5 seconds REMOVE IT": it was the chip's POWER-UP hum (loudest 4.95 s). The hum is gone, the swoosh is back, the bolt
       hit stays. **Lesson: when a sound is named by its time, list every cue sounding within ±1 s of it (score + hook.wav) and name the one
       you are removing in the reply.** `mkhooksfx.py <sep0> <whatA>` now.
     - **"the rocket sound is good, it just needs to be a little more consistent and not get quieter then louder again."** The recording's
       dip (between the ignition crack and full thrust) and its fade (the rocket climbing away) are levelled by a slow gain (0.3-s RMS,
       smoothed 0.8 s) to −31 dBFS, and the ignition crack is held within 3 dB of it: every 0.25 s from 0.15 s to the hand-over sits at
       −29…−33.
     - **"add some sort of fire to the bottom of the rocket"** → drawn flames (plume, tongues, a billow) → "does not look good at all",
       "too cartoony, make it more of just some sort of bloom" (STYLE §16). The fire is now ONLY soft radial light (`hook.tsx` `flameOf`):
       a white-hot core in the nozzles, a warm glow below, a pool on the pad while close, a haze screened over the base; warm colours
       `style-exempt:` by name.
     - **"theres a bug at around 36 seconds, some stacks of cash just appear"** (the cabinet): a row of bundles was drawn only once its
       drawer had opened far enough to hold ALL of it, so a row popped in. `bundle()` now takes a cut `zc` (the opening): the part still in
       the carcass isn't drawn, the top note's print is clipped to what is out, and the cash slides out with the drawer (every frame
       1066–1122 rendered: smooth curves, no one-frame jump).
     - **"the sound for the rocket should be a little deeper and quieter by a tiny bit"**: played at 0.92 speed (~1.5 semitones down),
       4th-order low-pass ~3 kHz, held at −32.5 dBFS (was −31). Power centroid 614 Hz, 53% of it under 300 Hz.
     - **"make the text on the rocket be on the rocket even at the start of the video"**: the mark, ROCKETS AND STARLINK and $7.0B are
       painted on from frame 0 (`mq = lq = gq = 1`); the $7.0B flick is gone (nothing lands).
     - **"at the start of the rocket sfx, the volume gets too loud for a bit"**: the ignition crack still ran ~4 dB over the roar. The
       limiter now holds every 50-ms window within 0.5 dB of the level (CEIL), and the start eases in over 0.15 s: max −31.7 against a
       median −33.1.
     - **"fix shadows for the scene at 30 secs"** (the pie, STYLE §16): the kit's contactShadow grew a rounded box evenly, which on this
       steep view showed as a grey ring round the pie, above it too. `pie.tsx` `wedgeShadow`: each piece's own footprint, a contact line
       at the base, soft layers leaning away from the key, navy-tinted, riding with its piece.
     - **"remove the 7 billion text on the rocket, make the spacex logo bigger"; "add the text that would normally be on their rocket"**
       (STYLE §16): $7.0B and ROCKETS AND STARLINK are gone; the mark is 164 wide (was 112). The SpaceX WORDMARK is not in the project
       (simple-icons' spacex is the X-and-swoosh only); Commons has it public-domain ("SpaceX logo black.svg", 1.2 KB) — pending
       Timur's yes to download.
     - **"put more effort into the design of the standing object to the right of the rocket"**: `towerParts` — four corner columns on a
       footing, girts and X-braces on all four faces (open lattice), decks with railings every third level, a trussed crew-access arm
       ending in the white room, a lightning mast (kept below the caption band). The 35-s rocket (spine) got the same tower.
     - **Wordmark (Timur's yes):** Commons "SpaceX logo black.svg" (1.2 KB, public domain) copied untouched to
       `public/brand/spacex-wordmark.svg`, paths in `src/spx/spxwordmark.ts`. `wordmarkOn()` paints it vertically down the first stage,
       reading top to bottom, as a Falcon 9 wears it, on both rockets; both marks on the second stage are 164 wide.
     - **"sfx gets too loud and seems very bad quality at around 2 seconds, it needs to sound more like a rocket, deeper"** (STYLE §16:
       never a clipped stretch). At ~2 s the takeoff ran into the close mic's blast, which CLIPS in the source (1–5% of samples from
       126 s). Rebuilt from clean stretches only (< 0.1% clipped): the ignition crack and early build (123.15 s, 1.5 s), then the close
       mic's rise (136.6 s) blended with the far mic's deep rumble (229.6 s); 0.88 speed, 4th-order roll-off ~2.2–2.6 kHz, lows +2.5 dB.
       Power centroid 181 Hz (75% under 150 Hz, 15% in 200 Hz–1 kHz so a phone still hears it); +5 dB lows (centroid 133 Hz) was too
       deep for phone speakers.
     - **"render when its done"** → all checks CLEAN → the master render started (single tab, WMI) → **"nevermind, cancel the render and
       use the 711 song instead"**: the render's process tree was stopped (no partial MP4 written; `out/render15.log` marked CANCELLED).
     - **★ THE SONG IS 711** (STYLE §16): `public/711.mp3` from Video 12 (md5 07f395e8…, the same file as Video 11). Its hit at 117.38 s
       (`scratchpad/bed15.py`, found on the waveform; the riser out of the silent gap starts ~116.3) lands on "On" (frame 271) as the lens
       bloom peaks: `MUSIC_FROM_S` 108.35, the build under the hook as written. **ONE gain, 12/97** — Timur: "the drop should not get
       quieter, that's the good part. Don't adjust sound levels, keep them the same throughout the video"; "pick one sound level that is
       good". lufsgap13.py: after the drop 7.0–7.6 LU under the voice per window, the loudest window 5.9 (the house level), the build 12.0.
       Mix −22.9 dB mean, −4.5 dB peak. ⚠ Commercial: flag the client's rights.
     - **"louder for the song"**: 15/97 (+1.9 dB), one gain still. lufsgap13.py: 5.65 LU under the voice on average (the house figure,
       as Videos 13–14), the loudest window 3.9, the build 10.0. Mix −22.3 dB mean, −4.3 dB peak. Then "tiny bit louder": 16/97 (+0.6 dB).
     - **RENDERED 2026-10-22** ("Render the master now, and glitch-check the MP4"), single tab via WMI: `out/spacex_ai_revenue.mp4`, 68.0 s,
       25.8 MB, h264 1080×1920 30 fps + AAC; −22.1 dB mean, −4.2 dB peak, the tail fading. On the MP4: flash CLEAN (19.3), vs fresh stills
       CLEAN (worst tile 4.6), popscan CLEAN after one reviewed BLIP (1949, the question lifting out; crops looked at). Served on 4415 via
       srv.us forward 28 (https://ewvrytoiecrtbew3h5ch5fscwq.srv.us/).
   - **Video 16** is `Videos/Video 16 — Private Equity Backlog/` (Studio 3416, serve 4416), built 2026-10-23, cloned from Video 15 (module
     `src/pe/`, composition `PrivateEquityBacklog`). The brief: "33,575 Companies Private Equity Hasn't Sold" — PitchBook's global count of
     PE-owned companies awaiting exit at Jun 30, 2026; the teach: how private equity gets paid. HARD 80-s cap; the hook (THE STOCKROOM THAT
     ONLY FILLS) mandatory; the DEMO ANCHOR and every STYLE §16 rule.
     - **The script went back first.** Five corrections armed in the guard before the take: "investors like pensions" (low); payouts "for
       four years running" (Bain's own claim — its latest point is the 12 months to Q3 2025, not calendar 2025) (medium); "listed in the U.S."
       (Dealogic is a US count) (medium); "private equity exits of American companies were worth" (PitchBook counts exits of US PE-backed
       companies, sellers of any nationality) (high); "American private equity fundraising" (a US figure) (medium). ⚠ PitchBook's
       decade-earlier figure is its own ESTIMATE with no year: the screen says A DECADE EARLIER (EST.), and no line calls the count a record.
     - **The take was GENERATED by Claude** (ElevenLabs "Jon – Calm Presence", eleven_v4), read as written (guard 0 of 5): 80 s raw → 71.9 s
       trimmed; the film runs 76.2 s.
     - **Built by five builders at once:** the hook and the spine's return by the lead (`places/hook.tsx`, `rackback.tsx`: carton-flow
       racking in real depth — three punched upright frames, inclined roller lanes, stop lips, an exit gate on a spring onto a run-out
       conveyor, sealed cartons with a tape seam and one embossed pictogram each, every carton's roll a deterministic queue per lane), the
       other places by four subagents in parallel, each owning its own files (a shared brief in `scratchpad/session/PLACE_BRIEF.md`).
     - **Decisions, flagged:** the brief's ping on MORE THAN DOUBLE is a SUB (STYLE §16 2026-10-18: no ping in the hook); the tin's label is
       SALE AGREED TO A PRIVATE EQUITY FIRM, not the brief's "SOLD" (Reuters: agreed, not closed — the voice says "agreed to sell"); the
       stamp goes in the post caption (§5.7); the bell's strike is a quiet pingshort (the pack has no bell, and `ding` was never approved in
       a Bankers film); the dial's arrival is a PUSH, because the spine's stream runs on past the frame and no slide could carry it clear.
     - The bed is 711 (Video 15's song), its drop (117.38 s) on "On October 19th" (frame 262), ONE gain 15/97: at 16/97 it sat 4.6 LU
       under the voice (this film's body sits on more of the drop), one step down holds Video 15's level as heard (5.13 LU, lufsgap13.py).
     - **★ THE PROBE HAS NO DEPTH ORDER, SO A 3-D PLACE DECLARES WHAT ITS PRINT SURFACES HIDE** (`hook.tsx` `hideBehind`): any face whose
       screen box meets an opaque print surface's box (the header beam's print, the decade tag, the spine's figure plates) is not measured.
       Decide it by REGION, every frame from the rig, for the whole hold — switched on a cue (the plates' first frame), the sweep reads the
       hidden faces as vanishing. Before it, the hook alone had 6 violations of print "crossed" by cartons behind it.
     - **Lessons from seven check runs:** a place built with nearly every face `skip` is invisible to the hand-over count (the tin read as
       arriving 132 f late); a margin brush under a zoom is fixed in the place's LAYOUT, not by re-aiming keys (IMPROVE moved 10 px, the bars
       moved in); print measured during a push's arrival is judged at the arriving SCALE (PENSION FUND now inks as the push lands); a white
       flood under an outgoing label reads as the label vanishing (teachD floods from t0 + 32); coins hopping a pocket in 3–5 f strobe as
       pops (each now 16–29 f, ≤ 19 px a frame); a range re-sweep (`remerge.mjs`) settles a local fix without a 20-minute full sweep.
     - **Final state (2026-10-23):** stylecheck CLEAN; the every-frame sweep CLEAN (SCENES clean, every hand-over on the rule) but for the
       closing question's 2–4-f word crossings as words fly in from depth (the canonical track.tsx; plane depth made no difference — listed,
       not refused); violations, flash, popscan (11 reviewed motions in `popscan_ok.json`), sfxsheet and whooshsync CLEAN; guard 0 of 5
       blocking; not rendered. Studio 3416 via WMI, srv.us forward 29 (https://oz5j3d3cobr72iu6bmljbkxxom.srv.us/).
     - **★ REVISION 1 (Timur, 2026-10-23; STYLE §16 rows of that date).** "Overall… pretty well"; the bars "absolutely fantastic". Built:
       - the hook's cartons as darker corrugated board (shading pulled toward the navy, a board falloff, the cut flute edge, crushed-corner
         wear, flap seams, glossy tape with a torn end; `CartonDefs`, shared with the spine);
       - the tin's bandages as solids (backing thickness, raised pad, pressed vent dimples, own shadows, a loose heap);
       - the register's cash (note edges, band, the top note's face, coin cups), receipt (printed lines, total, barcode, serrated edge,
         curl) and body (key legends, SALE display bezel, printer cover, vents, lock key);
       - the coin tray: each year's coins rise straight out to a staircase, then glide level onto the ledge one by one; a load-time check
         refuses any graze, sink or reach of the 15 line;
       - the bell scene: the end cap painted over the crossbeam (the "3D bug"), now cap-on-post; podium pilasters, trim, a moulded panel,
         an engraved bell seal, plinth; fluted pedestals on stepped bolted bases;
       - the spine: the "line through the boxes" was the level-0 front beam's catchlight and the gate's hinge at the cartons' own depth
         (their paint order flipped as each carton passed) — the beams paint behind the stream and the latched flap is gone; the stream's
         spacing 172 → 260 (two cartons overlapped across the turn); the header's lip, connector plates, ribs and end caps; the conveyor as a
         machine (lit rollers with end bosses, a lipped box-section frame with bolts, braced legs on feet, a drive motor, a roller transfer).
       - The full sweep then found one more of the paint-order class in the hook (the sold carton passing under the lifted gate, 144): the
         gate paints over what passes beneath it, the carton over the gate only once past its tip; and the exit lane's front carton now
         waits in its slot from frame 0. All checks CLEAN again; not rendered.
     - **★★ THE SFX LIBRARY IS NOW TIMUR'S EPIDEMIC SOUND SET (2026-10-23, STYLE §16: "from now on, use these sound effects in the videos…
       Ensure to sync all sound effects correctly").** The 14 files are kept as supplied in `Resources/sfx-epidemic/`;
       `Resources/sfx-epidemic/mkpack.sh <out dir>` cuts one clean hit per family into a video's `public/sfx/` (mono 44.1 kHz WAV, faded).
       The families keep their names and jobs (whooshsoft, whooshlong, airwoosh, swoosh, lowwoosh, sub, ping, pingshort, flick, coin, click,
       tick, data, datamid, datashort); three are new — `clock` (time passing), `type` (printing), `flash` (a snapshot or a record) — added
       to the CANONICAL `Resources/kit/SfxLayer.tsx` (gain, length, onset) and to `sfxsheet.mjs`'s peak table and approved families. thud,
       chain and chainshort stay from the old pack (the set has nothing for those jobs). Data, ping and whooshlong were already cuts of these
       files. The old pack is archived in Video 16's `out/archive/sfx-pack-before-2026-10-23/`.
       - **Sync:** a cue builder places a file by its audible ONSET, so the whoosh tables carry each file's ONSET → PEAK gap (whooshlong 5,
         swoosh 12, airwoosh 9, lowwoosh 8, whooshsoft 2; sub 6). The old table had swoosh 2 and airwoosh 21 and five hand-tuned
         PEAK_SHIFTs cancelling those errors; with the true gaps the shifts are the picture's own 1–2 f. `peakAt(s, f)` puts a file's PEAK on
         a frame (booms, flashes, coins). Every camera whoosh within ±3 f of its move's measured peak (whooshsync).
       - **Levels:** gains first by the equal-mean rule, then matched family by family to Video 15's heard levels on the rendered stems
         (`sfxlevels.py "../Video 15 — SpaceX AI Revenue"`). Equal mean misjudges sparse hits: the coin read 18 dB hot, the page turn 8.6;
         the Clock's ticks GROW through the file, so it is levelled at its loudest tick (−26 dBFS), not its mean. SFX stem peak −14.7 dBFS
         (Video 15: −15.0); full mix −22.4 mean, −4.1 peak.
       - **Video 16's new jobs:** the typewriter as 33,575 prints on the header, as the receipt feeds and as the bell scene's dates print; the
         clock under "for four years running" with a coin as each earlier year's stack completes; the camera flash on A RECORD; booms (sub)
         placed by their peak.
       - Then (same day): no bike chain under the spine's stream (~57 s), and no whoosh under the fly-through into the close (1:13 — the
         lowwoosh, confirmed from the cue list before it was removed). STYLE §16.
     - **RENDERED 2026-10-23** ("Render the master now, and glitch-check the MP4"), single tab via WMI: `out/private_equity_backlog.mp4`,
       2286 f, 76.25 s, 44.9 MB, h264 1080×1920 30 fps + AAC 48 kHz stereo; guard 0 of 5. Audio −22.4 dB mean, −4.1 dB peak (the mix probe's
       figures); after the voice, the song alone fading (−32.7 dB). On the MP4: flash CLEAN (19.2); vs fresh stills, every 4th frame, CLEAN
       (worst tile 4.6); popscan's one finding a VANISH at 1157→1158 — "A RECORD" carried out by the slide into the bell scene, traced frame
       by frame as a smooth ease (10 … 46 … 72 px a frame), past the scan's 48-px search; not a glitch, kept and reported (Video 13's class,
       never written into the excuse file). Served on 4416 via srv.us forward 30 (https://zc3ufcbzkmbeti3um5ahwqs2gu.srv.us/); a download
       through the link matched the file byte for byte (one long transfer broke and resumed).
       - ⚠ Older Bankers videos keep their own copy of the old SfxLayer; stylecheck ENGINE will now report them as differing from the kit,
         which is history, not a fault. A new video clones Video 16 (with its `public/sfx/`).
   - **Video 1's sweep** takes its 12 place ids from `PLACE_IDS` in `sweep.mjs`; update the list
     whenever the places change.
     - The caption chip is a full-width div: once the caption camera scaled it, its element box
       faked edge clips and corner collisions.
     - A Range's height is the font's whole content area: Anton at 120 px faked a hit on the label
       below it.
   - **Proven by firing (2026-09-26):** a FG candle moved into the hook caption was caught as CROSS,
     then reverted.
   - **★ "FULL INTERSECTION SWEEP" (Timur, 2026-09-26: "meaning you fully go through the video
     trying to find intersecting elements and fix them").** When he asks for one:
     - sweep EVERY frame (`node scratchpad/sweep.mjs 1 --keep`), not every 2nd or 3rd;
     - FIX every hit, then re-run until clean;
     - then look at the kept frames (`out/sweep_frames/`, half size) for shape-on-shape overlaps,
       which no probe measures.
     - It is a fix job, not a report.
   - **Three blind spots the every-3rd sweep had, closed in Video 1 (2026-09-26):**
     - **EDGE:** a label crossing the edge of a div or img of its OWN group, such as "$1.22T" 2 px
       into the Micron logo box under it. CROSS compared only different groups.
     - **LINE:** an SVG stroke through a text. A path's box holds every label on its chart, so no
       box test could see the dashed 4× gridline running through "3.8×". The probe now samples
       every visible path, line and rect with `getPointAtLength` and tests the points against the
       text's ink. A per-frame canary proves it: a line through a text must hit, and a line beside
       it must not.
     - **TEXT from 30% opacity:** it was 90%, so a crossfade's ghosted overlap never counted.
     - **SOFTCAP:** a defocused figure that still READS crossing the pinned caption or question.
       For text, that means blur under a quarter of the letter height; for a shape, under 12 px. CROSS skips every defocused item as depth. That is right for a
       glow and wrong for the race's "$1.22T", which passed about 8 px soft behind "Micron almost
       quadrupled." for 12 frames. Only the visual pass saw it. The probe now logs each item's
       layer blur (`bl`).
     - Each new check has a must-flag and a must-not-flag fixture in `sweep.mjs`.
     - **SVG text is measured by its INK in its own space.** Its element box is the whole font cell,
       and on a TILTED label (the takeaway's $100 bill) that box's axis-aligned hull "crossed" rings
       and borders the numeral never touched. The probe now takes `getBBox()` plus the font's metrics,
       maps the ink rect through `getScreenCTM`, and LINE tests stroke points in the label's own
       rotated space. A per-frame canary proves it: a line through a tilted "100" must hit, and one
       under its baseline (inside the hull, outside the ink) must not.
   - **What the visual pass of Video 1 changed (2026-09-26):**
     - **Push-past layers defocus 1.8× harder** (`blurGain` in `world.tsx`), so whatever crosses
       the caption band on its way past the lens is a glow, not letters. Push-ins and resting
       layers are unchanged.
     - **A push's incoming place gates in one frame later** (t0 + 3). At eps → cycle, the year labels
       showed a frame before the EPS bars crossed the 4 px defocus mark.
     - **An FG piece must not PARK under the watermark.** The watermark is for things passing
       beneath it. The index basket's rim sat under it for 7 s, so it moved 110 px left. Keep FG
       pieces clear of x 475–605 at the bottom.
     - **Tracking-text gaps are descender-aware** (`track.tsx` DESC_CLEAR): the "y" of "you" came
       within 5 px of "Micron" as the camera dollied in. Lines with no descender above them keep the
       approved GAP exactly.
   - **Build a TILTED piece in SVG, not HTML** (Video 1's SSD and fund statement). The probe measures HTML
     by axis-aligned boxes, which swell about 30 px at −18° and flagged a 16 px gap as a crossing. SVG texts
     carry their ink QUAD (`q`), and the sweep compares quads by the separating-axis test (canaried both
     ways). Line samples are clipped to their own SVG's viewport, so a logo's clipPath-hidden artwork is
     not "drawn".
   - **Logos are inline SVG paths** (`parts.tsx` Logo ← `brandsvg.ts`, generated from `public/brand/` by
     `scratchpad/mkbrand.mjs`; re-run it if a logo file changes). As a CSS mask the JPMorganChase wordmark
     jittered in the render (Timur, 2026-09-26). See the root CLAUDE.md Assets note for the measurement.
   - **What the pass deliberately KEEPS:** a push's incoming place shows through the outgoing
     one's blur. That is the §2.5.1 push-past depth, not an intersection, and the stronger blur
     keeps it soft.
   - **★ BLUR DOES NOT MAKE BIG TYPE UNREADABLE — A PUSH MUST NOT CARRY A FIGURE THROUGH THE
     CAPTION (Video 1, 2026-09-26).**
     - A push toward the frame's centre sends everything in the upper third straight up through
       the pinned caption band.
     - Anton at 130 px still READ at 16 px of blur. The race's "$1.22T", then "3.8×", sat behind
       "Micron almost quadrupled." for 10 frames, and the 1.8× blur only softened them.
     - The fix is geometry, not blur:
       - leave a place whose big figures sit HIGH by a slide (the race now goes on to the AI
         package with `slideR`);
       - or give its push a `tilt` (the camera rises while pushing, so the outgoing place sinks as it
         swells; the hook → chip push rises 120 px).
     - SOFTCAP now judges blur against the letter height, flagging any text blurred less than a
       quarter of its own height. It was proven by firing on the pre-fix render: it caught exactly
       the three texts seen by eye.
     - When building a place, keep its big figures out of the upper third if a push leaves it.
6. **Check:** search `Bankers/` for "100bps", "100 bps" and "market breakdowns" before every
   handback. The only hits allowed are in this file and the archive.
7. **Log each video** in `Videos/log.md`: its hook chart type, hero objects and main scene types.
   - Never open two consecutive videos with the same hook chart type or hero object.
   - Never repeat a signature composition within any five-video run (15 posts a month makes a
     stale feed the main risk).

## 4. Accuracy

- The root file's "Facts and claims" rules apply: one dataset per video, ★-flag every live figure,
  verify at primary source, and the screen follows the voice.
- Chart shapes follow real data. Say in the build summary when a series had to be approximated.
- **★ NO RELATIVE TIME IN THE SCRIPT: USE DATES [T 2026-10-01, Video 4: "don't say anything like last night in the video
  because we don't know when it'll be uploaded. Just use dates."]** The upload date is unknown, so a time word pinned to
  the day of writing is wrong by the time it airs.
  - Out: "last night", "yesterday", "today", "this week", "this year", "a year ago", "right now", "just" (as in "just
    made"), "latest quarter".
  - In: the date or the period it names: "On September 30", "Apple's June quarter", "in fiscal 2025".
  - Apply it when verifying every brief's script, before the corrected VO_SCRIPT goes back. Arm the guard against
    the relative wording, as for any other corrected line.
- **End every build with a build summary** covering:
  - what was built
  - every hard number on screen, with its source
  - asset and photo sources
  - open flags

## 5. Editorial rules — the client's hard rule: NO BIAS

- **No investment calls:** no buy/sell/hold, no price targets as advice, no "bargain" framing. This
  is educational content, not financial advice.
- **No directional lean.** Never imply what a market or stock will do. Where the market is heading
  is shown only as what markets are **pricing** (futures, FedWatch odds, consensus), attributed.
- **Honest scale:** bars start at zero, and no axis is stretched or window cropped to dramatise a
  move.
- **Equal treatment of up and down.** No villains or heroes. Politically neutral: a politician
  appears only as the source of an action.
- **No hype:** no siren or alert graphics, no flashing red. And not the page's old voice: no "banks
  vs you" cynicism.
- **Real people and brands are allowed:** photo cards, logos, flags. Photos must be real and
  sourced, never AI stand-ins, and every source goes in the build summary.
- **On-screen voice** is "we" / "us", never "I" / "me".

## 6. What changed from the original rules (2026-09-25)

Dropped, because 100bps does it differently and Timur asked for 100bps:

- **Captions:** the 4–5 word beats with a per-word brightness ramp, and the one-accent-word colour
  rule. 100bps' caption chips and hero sentences replace them.
- **Section frames:** the full-bleed blue frames carrying a title. 100bps' section flash replaces
  them, in blue.
- **End card:** the ring end card with its follow cue. The 100bps outro with the Bankers logo
  replaces it.
- **Other design rules:**
  - the watermark
  - the 36px legibility floor
  - the Reels safe-zone margins
  - the on-screen "as of" stamp
  - "THE curve" easing (100bps' own curves are used)
- **"Navy fields" ban:** gone. Dark greys now map to deep shades of the blue.

**Superseded:** the "royal" palette exploration and every earlier board, frame and demo. All are
archived in `Archive/`. The palette is §2.1.

Kept, because they are content or process rather than design: §0, §1, §3–§5, and the ban on 100bps
branding.
