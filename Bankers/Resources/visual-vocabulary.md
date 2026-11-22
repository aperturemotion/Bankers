# THE BANKERS VISUAL VOCABULARY (`Bankers/Resources/visual-vocabulary.md`)

**Standing rule for EVERY Bankers video, from 2026-10-09** (Timur, the Video 8 revision brief: "save this as
Bankers/Resources/visual-vocabulary.md … It applies to every future Bankers video, not just this one").

**Why:** "the current build reads as AI-generated because the scenes are illustrative and over-detailed. Replace them with
the simple, chart-led vocabulary below." It is derived from the best-performing reels on the sister account against its
worst. Charts and numbers carry the story; objects only support them.

This file decides WHAT may be built. `STYLE.md` still decides how it LOOKS and MOVES (palette, type, solids, light, camera,
sound, the close). Where an older rule asks for something this list forbids, this list wins (see "What it supersedes").

---

## ★★★★ DEMO ANCHOR — START EVERY BUILD HERE (Timur, 2026-10-13, Video 10 brief: "the original Bankers style demo … had the best visuals and animation of anything we've made. Recent videos drifted away from it." — a RESET)

**The primary visual reference for every Bankers video is the 15-s style demo, `Bankers/Demo/`** (composition `BankersDemo`, source
`Demo/src/demo/`, render `Demo/out/bankers_demo.mp4`): the Nasdaq record candles → mortgage rates near 7% with bars and a house →
the Fed raising rates with columns and a dial → "So, where do rates go next?" → the BANKER$ logo. It outranks every later Bankers
video. Before building, re-render a few of its frames (`node Demo/scratchpad/still.mjs 30 90 150 210 290 345 380 430`) and look at
them. **The frame test for every scene: would it sit comfortably inside the demo?**

1. **Match its world exactly:**
   - a navy gradient field with ONE soft overhead spotlight and lots of empty space;
   - glossy, satin 3-D objects in the blue gradient (a light top face, deep sides, a soft rim light) that SYMBOLISE the subject;
   - one hero object centred, plus one large foreground object bleeding off a frame edge or corner, for depth;
   - small, light, sentence-case captions near the top;
   - Anton numbers with a tiny caps label beneath;
   - objects that BUILD IN PLACE;
   - depth-of-field defocus and camera-push transitions;
   - ONE light frame per video;
   - the mixed-type closing question with a glowing italic-serif accent word.
2. **New compositions in the same family:** never copy the demo's shots.
★ **The 3-D objects are DETAILED, as in 100bps** (Timur, 2026-10-13, Video 10: "in general, the visuals should be more detailed,
   like in 100bps videos" — "I mean the 3d visuals, not the charts or graphs"). A glossy symbolic solid is still built with the parts the
   real thing has (STYLE §6.8a): a house's foundation, siding, trim, shingle courses, gutter, framed windows, panelled door and step; a
   coin's raised rim, reeding and bead ring; an arrow's bevelled faces. Charts and graphs stay clean. And an object STANDS on its floor:
   a platform is a circle on the object's own ground (sheared to its projection, under its whole footprint), with a contact shadow.
★★ **2-D BY DEFAULT; REAL 3-D ONLY WHERE THE SCENE IS BETTER IN 3-D** (Timur, 2026-10-16, Video 12: "the 3d style is definitely nice,
   especially near the beginning of the video, but you shouldn't overuse it … something that would be better visualized using a 3d visual
   should be 3d, but otherwise scenes should stay 2d"). The demo's glossy solids are the house 2-D construction (flat faces, the up-right
   extrusion, a Turn, a pool of light: STYLE §6.1a, §6.2). A projected 3-D rig is for the scenes whose idea needs depth: motion through
   space, a thing seen turning, a door opening, slices leaving in depth. Charts, bars, counters and anything read face-on stay 2-D, and
   the style itself does not change.
★★ **NO SCENE IS "ONE PLAIN OBJECT AND A NUMBER" — SCENES ARE RICHER COMPOSITIONS** (Timur, 2026-10-14, Video 11: "some of the scenes
   are too visually simple, like the coin scene. I need more complex but good and relevant visuals"). The scene he named was a short coin
   stack under $15.3B; the same class was a slab under $50B, two plain slabs, a plain pie, three small objects in a row and a shelf with
   three cubes. Each scene is now a COMPOSITION in the demo's glossy family: a hero object built with its real parts, the secondary
   pieces that make the sentence's point (a coin rolling up to its stacks, cash on every share, capital filling the top tray before any
   spills to the next), a floor with its contact shadows and reflection, and an action that tells the sentence. Every piece must be
   RELEVANT (§2.5.1a: a viewer could say in three words why it is there); complexity is never decoration. Charts and graphs stay clean.
3. **Retire the flat UI props of recent videos:** document cards, quote cards, phone mockups, stamps, split-flap rows and poll
   pills. Where a beat needs an object, use a glossy 3-D SYMBOLIC object from the demo's family (a house, a dial, columns, bars, an
   arrow, a coin stack, a price tag).

This supersedes, where they differ, the 2026-10-12 notes that grew out of Video 9 (phone screens with UI, a detailed satellite,
lattice towers, quote cards with portraits): their instinct — every scene a real, recognisable thing acting on its words — stands,
but it is now built as the demo's glossy symbolic solids, not illustration or flat UI.

---

## USE

- **Line and area charts drawn live:** one bright line on the dark field, a soft gradient fill under it, a glowing
  endpoint dot, small-caps date or value labels, a dashed reference line.
- **Real candlesticks for prices** (real daily data, aggregated by the video's own script; STYLE §14).
- **Bars:** 2–3 extruded 3-D bars on one shared axis; horizontal progress-style bars; a long bar made of thin slices.
- **Big-number moments:** one Anton figure plus one small-caps label, and nothing else.
- **Simple primitives only:** a slab or platform, a cube, a plain cylinder, a coin stack, a flat card or document, a ring
  gauge with a %, a simple round dial, a split-flap price board, a phone mockup, a magnifying glass, a balance scale, a date
  block ("MARCH / 2026"), a row or grid of small squares or dots.
- **Text-only beats:** ~~one centred sentence with one italic serif accent word.~~ ⛔ **Withdrawn 2026-10-09** (Timur, Video 8:
  "too many on screen text scenes, replace them with good visuals"): a sentence is carried by a VISUAL built from its data. Tracking
  text is kept for the closing question only.
- **Light full frames with ONE object** for section breaks (never for the closing question).
- ~~**Pill buttons** for the audience question.~~ ⛔ **Withdrawn 2026-10-09** (Timur, Video 8: "why would you add the buttons at the very
  end? with the different options? Don't deviate from the style."): the closing question is the house close, unchanged — tracking
  text on the dark field, no buttons, no answer options, no light frame.
- **At most 3 objects per scene**, centred, with generous empty space.

## NEVER

- Maps, coastlines, straits, shipping lanes: geography of any kind.
- Vehicles or machinery: ships, tankers, rigs, refineries, pipes, factories with detail.
- Weather, storms, liquids, waves, fire, cutaways, caverns, landscapes, cities.
- People, hands, characters.
- Mechanical props with fine detail: springs, gears, pressure gauges, antennas.
- Showers of objects or particles flying past the lens; counterfactual "ghost" paths.

## THE TEST (run it on every scene before handback)

If a scene cannot be described as **"a chart"**, **"a number"**, **"one to three simple shapes"** or **"a sentence"**, it is
too complex: simplify it.

**Depth and 3-D for hooks still apply** (three planes, a camera move as the reveal), but every plane is built from this
vocabulary.

---

## How each item is built in the Bankers kit (Video 8, the first film built to this list)

| Vocabulary item | Built with | Notes |
|---|---|---|
| Line / area chart | an SVG path on ONE zero-based scale, its lit stroke, a vertical gradient fill to the floor, a bead with a soft glow at the head | the line's extrusion stays thin (STYLE §6.3); labels in `label()` / `mono()` |
| Dashed reference line | one SVG line, `strokeDasharray`, faded by `opacity` (never by colour alpha: the probe reads opacity) | |
| Candlesticks | real daily OHLC from the video's data script | thin wicks, bodies in the FIN inks |
| 2–3 bars / progress bar | `Solid` + `FIN` on a shared floor or rail, with a `Pool3D` | progress bar: a track and a fill on one rail |
| Big-number moment | `figure()` + one `label()`, `fromDepth()` | nothing else on the frame but the construction it belongs to |
| Cylinder / slab / cube / card / coin / date block | `Solid` faces or a few SVG polygons, one light from the upper left | no internal machinery, no fine print beyond a title |
| Ring gauge | an SVG ring: a dim track and a lit arc, the % in `figure()` at its centre | not a needle instrument |
| Text-only beat | the engine's tracking text (`track.tsx`): Figtree lines plus ONE Instrument Serif italic accent line | it carries the sentence, so the caption chip steps aside while it is on |

- **Labels follow STYLE §5.7:** one short label, uppercase, never an interpunct chain. Where a brief writes "70M · DOE
  MINIMUM", the figure is "70M" and the label "DOE MINIMUM"; the date or source goes in the voice or the post caption.
- **The screen follows the voice** (root rule): a vocabulary item never prints a figure the take contradicts.

## What it supersedes (from 2026-10-09)

- STYLE §6.8 "Realistic hero objects in every video" and its "no stretch runs on charts alone" (100bps G4's detail level).
- STYLE §10.2 "Nothing basic" (a lone number, a plaque) and "Build animations out of real assets" (a real structure the
  camera moves through): big-number moments, text-only beats and simple primitives are now the house vocabulary.
- Bankers/CLAUDE.md §2.5.1a's "every Bankers video has realistic hero objects, not only charts", and the 2026-10-09 note
  asking for "detailed real objects at Videos 1–6's level of construction".
- The root rule against placeholder shapes still holds in its own sense: a vocabulary primitive is a sanctioned shape, not a
  stand-in for an object the scene should have built. When a sentence names a thing on the NEVER list (a cavern, a tanker, a
  refinery), the scene does not draw it: it shows a chart, a number, a primitive or the sentence instead.
- Video 8's hook asked for its background cylinder "out of focus". STYLE §2.5.1 ("no blurred shapes in the background") is
  set aside for that plane at the brief's explicit request; every other plane stays sharp.

Kept unchanged: the palette, type, materials, light, camera, sound, captions, the close and end card, and every
verification step (STYLE §15).

---

## ★★ SIMPLE IS NOT BARE (Timur, 2026-10-09, on Video 8's rebuild: "the visuals are too simplistic. They need to have more detail and actually be relevant to the context of the scene. For example the 1973 scene is just a block. That is too simple and random.")

The vocabulary limits WHAT kind of thing is built; it never excuses a generic one. Every scene's visual must:

- **Carry its sentence's specific content**, real and sourced: the actual figures, dates, shares and names the line is about
  (a price step chart through the embargo, not a block printed "1973"; the release's 400M barrels with the US's share lit, not a
  blank document; days of cover then and now, not two unlabelled cylinders). A viewer should learn something from the picture
  that the voice alone did not show.
- **Be built with finished detail inside the vocabulary:** scales and tick marks, readouts that count, segments with their own
  labels, shaded periods, graduations, a calendar page with its real day grid — the detail of a well-made chart or instrument
  face, never machinery, maps or illustration.
- **Fail the test "could this sit in any other video?"** If yes, it is too generic: rebuild it from this film's data.

## ★★★ BE MORE CREATIVE: THE THING THE SENTENCE NAMES JOINS THE SCENE (Timur, 2026-10-12, Video 9: "Be a little more creative with the visuals, for example in the partly from space scene add a satellite on one end of the line. Do such a thing for most scenes.")

The list above made the scenes correct and too plain. From 2026-10-12, **most scenes carry ONE real object that their sentence
names or implies, acting in the construction**, not only the chart or primitive:
- a satellite at the sky end of a signal arc ("from space"), a building around a phone ("inside buildings"), a radio mast sending
  the airwaves, a gavel on a court's condition, a pen poised over an unsigned line, a stack of chips beside "a bet", masts on
  the networks;
- it is the sentence's own noun, recognisable at a glance, and it does something: emits, lands, strikes, waits;
- it is built the house way (STYLE §6.8a): few large deep parts, the up-right oblique, graphite-blue and chrome, lit from the
  upper left. Detail stays under ~20 px at the framing, with no fine machinery.
- Still no maps, people, landscapes or showers of particles, at most 3 objects a scene, and the chart or figure stays the point.

**This overrides the NEVER list where the named object is on it** (a satellite and a mast are "machinery" and "antennas" there).
The rest of the NEVER list stands.

## ★★ THE VOCABULARY NEVER OVERRIDES THE HOUSE STYLE (Timur, 2026-10-09: "Don't deviate from the style.")

This list narrows what a scene may SHOW. It never changes how a Bankers video looks or closes: the closing question (tracking text
on the dark field, then the BANKER$ close), the camera, the type, the palette, and STYLE §2.5.1's "nothing blurred behind" all stay
exactly as STYLE.md says, whatever a brief asks. Where a brief asks for something the style rules out (pill buttons, a light frame
for the question, an out-of-focus background), build it the house way and say so.
