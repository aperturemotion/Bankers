# Video 36 — REVISION 1 (Timur's notes, 2026-11-23) — binding for every builder

Timur watched the Studio and asked for the changes below. Your section is binding; the rest is context. BUILDERS.md still applies in
full (quality bar = Video 35's places; one key light upper-left; blue-steel/graphite + gold; Anton labels ≤ 4 words from
episode.json; no people/maps/document cards; nothing crosses the caption band y ≈ 220–360 while a chip shows; no pops; fades ≥ 8 f;
damped eased motion; ≤ 3 objects per scene; ≤ 7 s per place or a camera move inside it).

## WHAT CHANGED SINCE YOU BUILT (read first)
- **The real take is wired** (Timur: "generate the voiceover"): captions.ts is from the take (PROVISIONAL = false, HAS_VO = true), so
  every word frame moved. Places on the take (frames, ★ UPDATED 2026-11-23 evening: scene changes now keep 0.45-s pauses, fit ×1.04 — refresh
  captions.ts, episode.json, Composition.tsx, public/vo_trimmed.*, public/bed_radiohead.mp3 into your mirror before final checks):
  hook 0–196 · claim 196–417 · claim2 417–546 · hype 546–717 · partner 717–842 · mystery 842–989 · crack 989–1111 ·
  truth 1111–1301 · collapse 1301–1499 · pension 1499–1638 · fair (hero) 1638–1716 · felderhof 1716–1960 · lesson (hero) 1960–2074 ·
  rule 2074–2265 · close to 2373. Your place keys to WORDS (W_), so it moved with it;
  re-check your asserts and timings on these frames.
- Integration fixes already in (keep them): plain C$ note faces (money.tsx PlainNote via `plain: true`); pension/felderhof exit by
  pushLight; the hook's swing ≤ 45 px/f (popscan); the crumble starts progressively (bx_bar.tsx); pension's cash falls with drag
  under a sliding floor plate; scratchpad/popscan_ok.json lists reviewed crane-peak findings (a VANISH is never excused).
- Timur's rulings: the script stays as corrected; "6¢" stays on the collapse tag; real company names on objects are OK
  (FREEPORT-McMoRAN).

## THE RECURRING NOTE: "the grey drill core" must be realistic everywhere
Timur: "I don't really understand what the visual is … make it a lot more detailed and realistic in terms of the cores themselves,
like the inside, the gray ones, and the box outside … as detailed as possible and as eye-catching as possible, so the audience
actually understand what it is" — and "you should do it to every single scene" where the core appears.
Builder H rebuilds the SHARED core and tray (bx_core.tsx: BxCore, BxTray) with a backward-compatible API; every other place that
draws a core (claim's boxes, claim2's core on the counter, partner's core on the ground, truth's salted core) gets it from there.
Builders B and M: build your other changes first; when I tell you H's core has landed, copy the project's bx_core.tsx into your
mirror, fit your scene to it, and run your final checks on it.

## PER BUILDER
### H — hook + the shared core (bx_core.tsx, hook*.tsx)
1. **The core and tray, real** (BxCore/BxTray): diamond-drill core as geologists see it — cylinders of grey rock broken into run
   lengths with natural, irregular fracture faces (never neat discs), a few pieces SAW-CUT in half lengthwise showing the inside;
   rock texture (grey matrix with mottling, light and dark clasts, thin quartz veinlets, pyrite specks), a slight wet sheen along the
   top under the one key light, an orientation line drawn along it. The tray: a real core box (galvanised steel or timber) with 4–5
   channels, dividers, end handles/cut-outs, spacer blocks between runs, its stencilled ID (BUSANG — no invented hole numbers or
   depths: no typed figures). It must read instantly as "rock samples in a core box". Keep the API backward-compatible (claim,
   claim2, partner and truth use it); tell me what changed in it.
2. **The dust needs a source:** Timur: "the gold dust animation is pretty nice, but … it is just coming from nowhere … add some visual
   that will represent where it's actually coming from". Add one real object the dust pours from — e.g. a small glass sample vial of
   gold dust tilting above the core (no hands, no people) — arriving with the camera, staying below the caption band, leaving by
   moving. Keep the stream's look.
3. Keep everything that works (the swing ≤ 45 px/f, C$6 BILLION ≥ 30 f before flare 1's peak, the flare point).

### B — claim, claim2, partner (claim*.tsx, partner*.tsx)
1. **claim (Timur's "second scene", the rig + core boxes):** make the rig ("the factories") much more detailed (mast/derrick with
   lattice and crown block, drill head, rod rack, engine/power skid, water tank, hoses, ladder, operator cab, guard rails, bolts,
   decals). **Add palm trees** — Borneo, Indonesia: "several of the trees, so they will not … overlap the visuals … aesthetically
   placed … make sure that the proportions are followed" (a palm is taller than the rig's cab, comparable to its mast; slender
   ringed trunks, a crown of pinnate fronds), built in the house look (one key light, the palette), placed around the pad, never
   over the rig, the boxes or the labels. The core boxes get H's new core.
2. **claim2 (the counter, ~0:15):** "there's like 1.5 and it overlaps each other … fix the top thing": the core on top of the counter
   is drawn as two pieces with the second OVERLAPPING the first. Make the top piece one clean real core run (H's core: pieces
   end to end, or in a short tray) with nothing interpenetrating.
3. **partner (the two rigs, ~0:25):** the same rig detail and palm trees; the core on the ground → H's core; and **differentiate it
   from claim's scene** ("they are pretty similar") — e.g. a visibly different rig model/paint for Freeport (graphite vs steel-blue),
   a different camera side/height, the pad between the two rigs, the partner's bit clearly spinning down into the ground.

### M — mystery, crack, truth (mystery*.tsx, crack*.tsx, truth*.tsx)
1. **mystery:** "make sure that it flies up more higher and then flies away … and make it a bit also more detailed and a bit more
   realistic" — a clear, tall climb off the pad first, then the departure. Keep it out of the caption band: let the camera tilt up
   with the climb (the pad sinks away below) so the helicopter stays low enough on screen, then it flies out sideways. Detail: real
   light-helicopter anatomy (rotor mast and hub, blades with droop and a motion blur disc, tail boom with fin and tail rotor, skids
   with cross tubes, windows with reflections, doors and panel lines, nav lights). Still plain and respectful (no fall).
2. **crack (~0:30): fully replace.** "Don't use the gray drill core … Do something more original … more eye-catching … but make it
   simple. Don't add too much visuals." The line: "A week later, the partner reported insignificant amounts of gold." Labels stay
   INSIGNIFICANT GOLD · MARCH 26, 1997. Pick ONE simple, original, instantly readable object — e.g. a fire-assay result: a white
   assay cupel on a steel plate, the camera pushing in to reveal a pinhead of gold in it (tiny against the expectation); or another
   idea that is better. No liquids, no particle showers, no document cards. Tell me your choice and why.
3. **truth:** the core → H's new core; "keep the gold nuggets inside. That's nice. It should be there"; and the loupe "make it more
   detailed": a real jeweller's loupe (chrome/steel folding housing, knurled ring, thick lens with refraction and reflections, the
   magnified view inside it sharper than outside).

### C — collapse, rule (collapse*.tsx, rule*.tsx, and bx_bar.tsx for the shine)
1. **collapse (~0:41):** "make the gold bar like a bit shiny … more realistically, like in the previous appearances because right now
   it's just a bit weird" — the bar must have the same gold, specular edges and shine as in the hook (frame ~185) and hype (~650)
   until it crumbles; find what dulled it (the crumble code path?) and match it without changing the hook/hype pixels.
2. **rule (~1:06): fully replace.** "Make the visuals actually connected to the voiceover … something interesting". The line:
   "Since two thousand one, Canadian miners need a qualified expert's sign-off, and often an independent one." Suggested concept
   (refine or better it): a two-key release — the company's results (the gold bar / the core tray) held behind a steel gate or in a
   case that opens only when a key marked QUALIFIED PERSON turns, then a second key INDEPENDENT turns beside it; NI 43-101 · 2001.
   Simple, one construction. Keep ruleFlarePoint (flare 2 comes off this place) and the labels ruleSeal/ruleCode/ruleYear/
   ruleIndependent (tell me if you need them re-worded).

### F — pension, felderhof (pension*.tsx, felderhof*.tsx)
1. **pension (~0:47): fully replace with a chart** (Timur: "Use some kind of chart, either a bar chart, pie chart, or a line chart.
   Which one will be more suitable?"). Use a **bar chart** of ONE dataset, Maclean's, May 19, 1997, "A sampling of funds and their
   losses" (C$): Ontario Teachers' Pension Plan Board 100M · Caisse de dépôt et placement du Québec 70M · OMERS 45M · Newfoundland
   Public Sector Pension Plan 5M · Halifax Regional Municipality fund 1.5M · Edmonton Telephone Endowment Fund 0.75M (FACTCHECK §3).
   Zero-based, extruded Bankers solids, Ontario Teachers' lit and landing C$100M LOST on "a hundred million"; the others smaller and
   dimmer (short names, ≤ 4 words; numbers only from pension_data.ts; you may keep 4 bars if 6 is too busy — say which). Its KIND
   line carries `style-exempt: Timur asked for a chart (2026-11-23)` (felderhof's cash column is the other bar-like scene).
2. **felderhof (~0:59):** "add a lot more detail to the shelf on which the visual of the hammer and the thing the hammer is hitting on
   is located … a lot more detailed and more eye-catching": a real judge's bench — raised panelled front with mouldings and inset
   panels, a thick desk top with a bevelled edge, the sound block on a leather desk mat, a brass nameplate rail, a reading lamp or
   microphone if it helps (≤ 3 objects), in the house materials under the one key light.

## WORK + CHECKS (every builder)
FRESH mirror `/home/user/bankers/Bankers/Videos/.v36_<you>3` from the CURRENT project (cp -al node_modules); change only your
files; copy back only those; `npx tsc --noEmit -p .` on the real project; delete the mirror. Never touch Composition / captions /
episode / data / other builders' files — REPORT what you need (labels: key + text; HO or flare changes). Never render the film,
publish, commit, push or call paid services. Chrome: scratchpad/cloud-env.sh. Ports: H 5730–5739 · B 5740–5749 · M 5750–5759 ·
C 5760–5769 · F 5770–5779.
Checks before reporting: full-size stills of every action (LOOK at them, compare with Video 35's quality); `node scratchpad/cuedump.mjs`;
`node scratchpad/geom_sweep.mjs 1 <from> <to>` over your places ± 30 f → 0 spans; `node scratchpad/frames.mjs <from> <to> 0.5
out/seq_<you>` + `python3 scratchpad/motion.py out/seq_<you>` + `python3 scratchpad/popscan.py out/seq_<you>` → no finding in your
range; `node scratchpad/sfxends.mjs` clean. Report briefly: what a viewer now sees, frames of each action, Ev list, labels needed,
checks.
