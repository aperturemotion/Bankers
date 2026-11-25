# Video 38 "The Couple Who Beat the Lottery, Legally" — BUILDER BRIEF (binding)

Bankers (Instagram finance reels, client LFG Equities). Timur (the art director) asked on 2026-11-25 for a NEW STYLE copied from 8 reference
reels (a "SizedUnderstood"-style 3-D explainer look), while keeping the Bankers rules. This is the first film in it, and it is due
2026-11-27; it must look as polished, detailed and eye-catching as possible. Project: `/home/user/bankers/Bankers/Videos/Video 38 — Selbees Lottery/`.

## THE STYLE (what the references do — reproduce it)
- **A real 3-D world the camera flies through, continuously.** Photoreal-ish CG (lit solids with real materials, soft shadows, fog/atmosphere,
  depth), not flat graphics. The camera is ALWAYS moving: slow dollies, orbits, cranes, follows, push-ins; scenes hand over by flying from one
  place to the next or by pushing INTO a surface (a screen, a page) and landing on a matching close-up (a rare hard cut is allowed only there).
- **Literal objects for every line**, built with real construction (thickness, bevels, seams, print, material) — the thing the sentence names.
  Cutaways / x-ray shells / exploded views / macro close-ups are part of the grammar.
- **Annotations pinned to the world**: small dark chips with a light-blue accent bar and caps text, joined to the object by a thin leader line
  ending in a dot; big counters (a figure + a small unit) on dark panels; occasional real-photo insets with a credit line; a persistent status
  pill (top right) where a running figure helps. Labels ≤ 4 words; figures only from FACTCHECK.md.
- **Captions**: karaoke chips in the lower middle (already built: `src/w3d/karaoke.tsx` — do not touch).
- **Look in the Bankers dress**: the world is lit at BLUE HOUR / night in the Bankers blue family (key `#DCE8FA` from upper left, navy hemisphere,
  pale-blue rims, navy fog). Warm colour only in small practical lights (lamps, lit windows) and in real objects' own small accents. Big flat
  areas are never warm, red or green. The logo blue `#005DC8`, light `#4D8ED9`, core `#B3CEEF`, ground `#001C3C`.
- Keep the Bankers rules: no people modelled in 3-D (no hands, no figures) — real people appear ONLY as the credited real photos in
  `public/photos/` (CBS News / 60 Minutes); no AI images of real people; no maps; no invented readable claims; no advice; ≤ 3 hero objects per framing.

## THE ENGINE (read these files first; do not edit them — report what you need)
- `src/w3d/kit.tsx`: `World3D`, `makeCam` (shots: `{a, b, pos, target, fov?, arc?, cut?}`, smootherstep), `projectWith`, `HouseLights`,
  `Sky`, `Glow` (additive light sprite), `canvasTex(key,w,h,draw)` for print/signage textures (cached, fonts loaded), `rnd(i)`, `ease/easeOut`, `PAL`.
- `src/w3d/overlays.tsx`: `Tag` (chip + leader line to a projected point), `Counter`, `Inset` (photo + credit), `Pill`.
- `src/w3d/fonts3d.ts`: `BODY` (Figtree), `FIGURE` (Anton) — use them in canvas print too.
- `src/w3d/take.ts` (generated): `WORDS`, `SENT`, `wf(word, occ)` = the frame a word starts, `wEnd(word, occ)`. Key every action to WORDS.
- `src/w3d/Main.tsx` + `src/w3d/stations.tsx`: the film; `src/w3d/st_hook.tsx` is the WORKED EXAMPLE of a station (study it).
- The station contract (export `ST`): `{ id, origin:[x,y,z], from, to, light?, shots(), Scene({f}), Overlay({f,P}), sfx() }` — `Scene` is R3F JSX
  in LOCAL coordinates (the integrator wraps it at `origin`, with `HouseLights` at the origin; pass `light:{key,keyI,target,shadowBox,...}` to tune),
  `shots()` returns WORLD-coordinate camera keys (add your origin!), `Overlay` gets `P(localPoint) → {x,y,z,behind}` through the live camera.
  Each station should include its own `<Sky/>` and ground (fog is global: `#0A2A52`, FogExp2 0.018).
- SFX: `cueAt(name, frame, durFrames, vol)` from `src/bnx/SfxLayer.tsx`; files in `public/sfx/` (whooshsoft, whooshlong, swoosh-like
  ee_whoosh_*, airwoosh, coin, pingshort, thud, chain, chainshort, data, ee_click_click_01, ee_clock_clock_ticking_01, ee_paper_paper_tear_01,
  sub, riserwhoosh — NO riser). One whoosh per camera travel (peak on its fastest frame), context sounds only for visible actions.

## THE STATIONS (origins are fixed; frames from the take)
| id | origin | mounted | the lines (frames) | what to build |
|---|---|---|---|---|
| hook (done) | [0,0,0] | 0–~280 | "A retired couple from a town of 1,900 … For 9 years." (0–195) | main street, sign, falling ticket |
| store | [0,0,-58] | 200–500 | "In 2003, retired store owner Jerry Selbee read a brochure for a new Michigan game, Winfall." (212–406) "He found the loophole in 3 minutes." (410–478) | Continue down the hook's main street: Jerry's small convenience store (sold years before; a modest brick storefront with a lit window). The camera pushes in through the window to a counter where a lottery BROCHURE lies (generic "WINFALL" brochure — a folded leaflet, its rules page with a "ROLL-DOWN" paragraph, no real game artwork). Photo inset of the couple on "Jerry Selbee" (`photos/selbees_2shot.jpg`, credit "CBS News / 60 Minutes"). On "loophole" a highlighter sweep / light runs along the roll-down rule; a 3:00 timer counter on "3 minutes". Ends by pushing INTO the brochure's diagram (→ the roll-down). |
| rolldown | [300,0,0] | 470–760 | "When the jackpot hit $5 million and nobody won, the money rolled down to the smaller prizes." (481–635) "On those days, enough tickets put the math on your side." (642–732) | A big sculptural 3-D JACKPOT MACHINE in a navy studio void with a reflective floor: a glass column of gold-ish/blue coins rising to a $5M line (counter); the top tier MATCH 6 gate stays shut ("nobody won"); then the coins CASCADE DOWN a staircase of three lit trays MATCH 5 / MATCH 4 / MATCH 3 (tags). Then a balance: a growing stack of tickets on one pan tips it ("math on your side"). Camera orbits and follows the cascade. |
| test | [600,0,0] | 725–900 | "Jerry tried it." (738–761) "$3,600 in." (770–830) "$6,300 back." (833–880) | A kitchen table at night (lamp glow): a stack of lottery tickets bought ($3,600 counter) beside a stack of cash returned rising taller ($6,300 counter); a Pill top-right "NET +$2,700". |
| company | [900,0,0] | 870–1100 | "He and his wife Marge formed a company with family and friends, and played 12 roll-downs, until Michigan ended the game." (883–1079) | A company's share certificates fanned on a table (G.S. INVESTMENT STRATEGIES — the real company name, OK on screen), photo inset `photos/selbees_shareholders.jpg` (credit "CBS News / 60 Minutes") on "family and friends"; a wall calendar or tally board with 12 roll-down marks lighting one by one on "12 roll-downs"; on "Michigan ended the game" a lottery terminal's screen goes dark (GAME ENDED 2005 tag). |
| road | [1200,0,0] | 1070–1370 | "Then they found a similar game in Massachusetts." (1085–1157) "For 6 years, they drove 900 miles a trip, often betting over $600,000." (1160–1347) | Night interstate: a sedan (detailed: body, glass, wheels, headlights + light cones, tail lights) driving east under an overhead gantry sign "MASSACHUSETTS" (house blue); the camera follows / orbits the car; an odometer-style counter 900 MILES; then the open trunk / back seat stacked with boxes of tickets, counter "$600,000+" ("often" → label "A ROUND"). |
| globe | [1500,0,0] | 1340–1630 | "They weren't alone. A group started by MIT students played it too." (1353–1465) "In 2011, the Boston Globe broke the story, and many suspected a rigged game." (1468–1612) | A second group: a domed neoclassical building suggestive of MIT's Great Dome (generic, unlabelled except a tag "MIT GROUP"), a second stack of tickets; then a NEWSPAPER lands / unfolds: masthead "The Boston Globe" (real paper; masthead text only in a neutral serif, no copied logo art), a big blurred-text page (no invented readable headline), tag "JULY 2011"; on "rigged" a "RIGGED?" tag in red over the lottery machine/ticket, then it dims. |
| state | [1800,0,0] | 1600–1870 | "The state investigated." (1617–1656) "The betting was legal, and no one's odds were hurt." (1660–1739) "The state itself made $120 million from it." (1745–1851) | A state-house style domed capitol (Massachusetts State House feel, its dome in pale gold under blue light) at night; a report binder "INSPECTOR GENERAL · 2012" → tags "LEGAL" and "NO ONE HURT" (checks); a $120 MILLION counter as a vault/stack of cash grows into the capitol. |
| total | [2100,0,0] | 1840–2115 | "In all, their company won over $26 million, nearly $8 million of it profit before tax." (1857–2054) "Theirs went to family." (2059–2096) | A tall glowing column/stack of winnings ($26 MILLION counter, label "WON, 9 YEARS"), with its top ~30% slab lifting out ($8 MILLION, label "PROFIT BEFORE TAX"); then the camera drifts to the couple's modest home in Evart at night with warm windows (tag "FAMILY"). |
| rules | [2400,0,0] | 2090–2230 | "Sometimes the edge isn't luck." (2102–2163) "It's reading the rules." (2166–2211) | Back to the brochure from `store` (re-build it here), the rules page; a light sweeps the roll-down rule line on "reading the rules"; the camera rises; the integrator's outro lifts the camera into the sky for the BANKER$ close at 2223. |

Hand-overs: your FIRST shot is your arrival. For a flight from the previous station, give it `a` ≈ 20 f before your first line and `b` ≈ 10 f
after (the integrator smooths). For a push-through, the previous station pushes INTO a surface over its last ~16 f and your first shot has
`cut: true` with a matching close-up. Coordinate the hand-over with the station before you (the brief lists both sides; the integrator decides).

## QUALITY BAR
- Every frame is a composed, lit, DETAILED shot: foreground/midground/background depth, contact shadows, specular highlights, glows on lights,
  print on objects, a horizon/atmosphere. Compare with the hook stills (`out/hook1.png` once rendered) and do better.
- Motion: eased, continuous, nothing pops (fade/scale-in ≥ 8 f), nothing static; an object enters by moving.
- Overlays: never cover the caption band (y 1230–1420) and keep clear of the top 0–220 (Reels UI); chips ≤ 4 words.
- Performance: aim ≤ 9 s per frame at 1080×1920 (instanced/merged geometry for repeats; ≤ 2 shadow-casting lights; no huge textures).

## WORK + CHECKS
- Work in a private mirror `/home/user/bankers/Bankers/Videos/.v38_<you>` (`cp -al` node_modules; no out/), write ONLY your `src/w3d/st_<id>.tsx`
  files (+ helpers prefixed `st_<id>_*`), register them in YOUR MIRROR's `stations.tsx` to test, then copy back ONLY your st_* files and report
  the registry lines; `npx tsc --noEmit -p .` must pass. Never render the film, publish, commit, push or call paid services.
- Stills: `source scratchpad/cloud-env.sh; PORT_STILL=<your port> STILL_OUT=out/v_<you> node scratchpad/still38.mjs --scale 0.5 <frames>` —
  render every action of your stations and LOOK at them at full size; fix what is not beautiful. Ports: A 5810–5819, B 5820–5829, C 5830–5839, D 5840–5849.
- Report: what a viewer sees (frames of each action), stills paths (copy 4–6 best to `/tmp/claude-0/-home-user-bankers/26026911-a434-57ce-aef5-bcf8c1cbe056/scratchpad/v38_<you>/`),
  the registry lines, render time per frame, anything the integrator must do.
