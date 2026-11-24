# Video 37 — REVISION 1 (Timur's notes, 2026-11-24) — binding for every builder

Timur watched the Studio and asked for the changes below. Your section is binding; the rest is context. BUILDERS.md still applies in
full (quality bar = Video 36's places; one key light upper-left; blue-steel/graphite house materials; Anton labels ≤ 4 words from
episode.json via L(); no people/maps/document cards; nothing crosses the caption band y ≈ 220–360 while a chip shows; no pops; fades
≥ 8 f; damped eased motion; ≤ 3 objects per scene; ≤ 7 s per place or a camera move inside it).

## WHAT CHANGED SINCE YOU BUILT (read first)
- **THE REAL TAKE IS IN** (Timur: "generate the voiceover"): captions.ts is from the take (PROVISIONAL = false, HAS_VO = true), so every
  word frame moved. Places on the take (frames): hook 0–163 · claim 163–368 · claim2 368–532 · hype 532–677 · backers 677–870 ·
  crack 870–995 · whistle 995–1118 · expose 1118–1237 · collapse 1237–1455 · verdict 1455–1748 · fair (hero) 1748–1858 ·
  cleared 1858–1942 · lesson (hero) 1942–2045 · rule 2045–2226 · close to 2334. Your place keys to WORDS (W_), so it moved with it;
  re-check your asserts and timings on these frames. Take a FRESH mirror of the CURRENT project (captions.ts, episode.json,
  Composition.tsx, public/vo_trimmed.*, public/bed_devil.mp3 all changed).
- Integrator edits on the take (KEEP them): claim2.tsx `fill.b = Math.min(w.machine + 4, end - 16)`; expose.tsx `date` starts at the
  landing ("October 2015" is read in 8 f) and `glint.b` is capped at `end - 16`. Holds were lengthened after "Stanford." (claim → claim2)
  and after "Edison." (crack → whistle) so STANFORD DROPOUT and EDISON: ~12 TESTS read before their slides.
- popscan_ok.json's excuses are keyed to OLD frames: they will no longer match; report any finding you look at and judge continuous.

## TIMUR'S NOTES, BY BUILDER (his words in quotes)

### H — hook (and th_tube if needed)
"The hook's theme … I really like the idea … the drop itself — that's really nice." KEEP the idea, the drops, the pull-back.
1. **The lancet pen:** "add more detail to the pen … the visual that is dropping the red liquid. Make it a lot more detailed and a lot
   more eye-catching." A real lancing device / lancet pen: knurled or ribbed grip, cocking barrel with its release button, depth-
   adjustment ring with printed depth numbers, a clear end cap/tip, a spring visible through a window if it helps, the steel needle,
   chrome/plastic materials under the one key light, specular edges, seams, a printed brand-free label. Eye-catching: a highlight
   sweep, crisp detail at the close framing.
2. **The stand (the plinth):** "detailize a bit more the stand itself on which the cup stays."
3. **THE GLITCH at ~4 s (≈ frame 120):** "the top of the stand glitches out and has two layers … when it zooms out, the top layer kind
   of shifts to the front and overlays the bottom one, and that's not logical." DIAGNOSE first (stills every frame 90–160 at full
   size): which two parts of the plinth top swap paint order / parallax wrongly during the pull-back; fix it so the top is ONE
   consistent 3-D solid in one perspective at every frame.
4. "check that the cup actually stays ON it and not in front": the tube must sit ON the top plate (its foot on the plate, occluded
   correctly, its contact shadow on the plate) through the whole pull-back — never floating in front of the plinth.

### B — claim, collapse (th_door / the building), claim2 unchanged
1. **claim — the building:** "it's like some kind of building … Make the walls a lot more detailed … the blue walls. Make the door
   more realistic and detailed, and also make it an actual three-dimensional building, not just a wall. Because right now, when
   there's a transition, you can see that it's just like some wall without any three-dimensional behind it." Build the lab as a real
   3-D BUILDING: a facade with real depth (side wall visible in perspective, a roof line/parapet, a canopy/awning over the entrance,
   the slide reveals its side and depth — never a flat card), detailed cladding (panels with seams, rivets, a plinth/base course, window
   bays or a strip window, lights, a door surround), a realistic glass door (frame profiles, handle, hinges, kick plate, reflections,
   the interior behind the glass). Check the slides IN and OUT frame by frame: the building's sides/depth must read during them.
2. **collapse (the same building — "keep" continuity with claim):**
   - "Make sure that the THERANOS caption on the door doesn't overlap with the red buttons, and also make the red buttons more
     detailed." (the red rows of the results board)
   - "the red visual that's inside the building is some kind of like a stand … that shows the voided information. Make that stand
     appear not inside the building but OUTSIDE IN FRONT OF THE DOOR instead, so it's fully seeing the visual stuff, and make it a lot
     more detailed itself." → a detailed free-standing results display/sign stand outside, in front of the door (frame, legs/base,
     panel, the result rows as detailed lit buttons/indicators going red, VOIDED, 2014–2015), clear of the door's THERANOS lettering.
   - Second 42: "keep the animation of the closing of the store. That's great." KEEP the shutter, and the Walgreens plaque fall.

### M — backers (the boardroom), whistle follows the shared plate
1. "For the scene in second 21 (the boardroom), add more detail to the chairs and to the table. Make it just more eye catching. I pretty
   like the idea … Just make it more detailed and realistic." Executive chairs with real upholstery (stitched panels, piping, tufting
   or channels, chrome arms and base, castors), the table (inlays, edge profile, veneer grain, reflections of the chairs, accessories
   ≤ 3 objects: e.g. a carafe/water glasses or a closed laptop), the lighting more cinematic (pools of light on the two lit places).
   Keep the nameplates readable (≥ 40 px cap height), the travel to the stores and everything after unchanged.

### C — crack (FULLY REPLACE), expose
1. **crack (~0:29–0:33): "please fully change it. I don't really like it. Make sure it's fully connected to the voiceover, but fully
   change the visuals there. Do something else. Make it engaging, make it eye-catching, and detailed."** The line: "But most tests ran
   on other companies' machines, not the Edison." LightBreak 1 flashes on "But". The fact (SEC complaint ¶5): the Edison ran ~12 of
   the 200+ tests; the rest ran on third-party analysers (some modified). No pie this time. Pick ONE engaging, literal, detailed idea
   — e.g. a sample tube on a lab conveyor/track arriving at the small Edison, which a switch/gate diverts past it to a row of big
   commercial lab analysers (unbranded), the tubes streaming into those while the Edison's slot stays dark (labels: EDISON: ~12 TESTS ·
   OTHER MACHINES · 200+ TESTS OFFERED as you need them; you may import B's `th_edison.tsx` and H's `th_tube.tsx`). Tell me your choice.
2. **expose (~0:37):** "the Wall Street Journal itself make it more detailed in terms of the text on it, because right now it's just
   blank lines … Make it more detailed and also add some detail to the page behind it … when it just flips, there's just like a white
   blank page behind it. Add some detail to that, like some also text … so it's like basically a second page of that journal, or just
   like a copy of it." Real newspaper typography: masthead, dateline rule, a big headline in a serif display face, deck, bylines,
   multi-column body text set as real-looking text (dense lorem-free filler built from neutral real words is fine as texture, but NO
   readable invented claims about real people — use small, neutral text that reads as print at a glance; the one readable headline
   may be the real one: "Hot Startup Theranos Has Struggled With Its Blood-Test Technology" (WSJ, Oct 15, 2015)), column rules,
   a photo box as a halftone pattern (no face). The page under the top copy is a printed page too (another copy), never blank.

### F — verdict (GUILTY framing fully changed), hourglass (keep, more detail), cleared (FULLY REPLACE)
1. **verdict framing 1 (~0:48), the GUILTY block: "just fully change it, to like a table with the hammer, as in the court, when the
   hammer hits like a small thing on the table. I think we had a similar visual on the previous scene (Video 36's felderhof gavel +
   bench). Use that as a reference, but do something else … with another point of view, so it's not exactly the same as in the
   previous video … change the design of the visuals a bit."** A judge's bench/table with a gavel striking its sound block on "guilty",
   seen from a different angle than Video 36's (e.g. low three-quarter from the side, or high over the bench), a different material/
   design (e.g. dark walnut with brass rather than V36's), GUILTY · 4 COUNTS · JAN 3, 2022 as labels/plates. Copy V36's felderhof_gavel/
   felderhof_base into verdict_ prefixed files if useful, then redesign.
2. **the hourglass (~0:50): "keep the time watch, but make it more detailed."** Keep the 135 → 123 mechanism; add detail (turned
   posts with fluting/rings, engraved end plates, brass fittings, glass thickness and reflections, the sand's grain texture and its
   falling thread, a base plaque).
3. **cleared (~1:02): "I don't really see the logic behind the visual for the guilty, not guilty. Please change that and make some
   visual that actually connects to the voiceover and to investors being guilty and patients being not guilty."** The line: "And she
   was cleared of defrauding patients." (the previous lines: guilty of defrauding INVESTORS). Make the two groups instantly readable
   by their OBJECTS: e.g. two evidence bags/exhibit trays on a court table — INVESTORS: a share certificate / stock folder, stamped
   or tagged GUILTY (red); PATIENTS: a Theranos blood-test tube (H's th_tube) with its test result, tagged NOT GUILTY (lit) — the
   patients' exhibit lit on "cleared". Labels: clearedInvestors "INVESTORS: GUILTY", clearedPatients "PATIENTS: NOT GUILTY". Fast to
   read (≈ 2.8 s place). Tell me your choice.

## WORK + CHECKS (every builder)
FRESH mirror `/home/user/bankers/Bankers/Videos/.v37_<you>2` from the CURRENT project (cp -al node_modules; no out/); change only your
files; copy back only those; `npx tsc --noEmit -p .` on the real project; delete the mirror. Never touch Composition / captions /
episode / data / other builders' files — REPORT what you need (labels: key + text; word frames; HO or flare changes; flare points if your
lit point moved: hook → FLARES[0].from, claim → FLARES[0].to, rule unchanged). Never render the film, publish, commit, push or call paid
services. Chrome: scratchpad/cloud-env.sh. Ports: H 5730–5739 · B 5740–5749 · M 5750–5759 · C 5760–5769 · F 5770–5779.
Checks before reporting: full-size stills of every action (LOOK at them, compare with Video 36's quality); `node scratchpad/cuedump.mjs`
(must print "N cues", no Error); `node scratchpad/geom_sweep.mjs 1 <from> <to>` over your places ± 30 f → 0 spans; `node
scratchpad/frames.mjs <from> <to> 0.5 out/seq_<you>` + `python3 scratchpad/motion.py out/seq_<you>` + `python3 scratchpad/popscan.py
out/seq_<you>` → no finding in your range (or each one looked at and reported); `node scratchpad/sfxends.mjs` clean. Report briefly:
what a viewer now sees, frames of each action, Ev list, labels needed, checks.
