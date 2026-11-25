# Video 38 — "The Couple Who Beat the Lottery, Legally" (Jerry and Marge Selbee, Winfall 2003–2012)
Worker app: LFG Equities / Bankers, "Video 5 of 15", due 2026-11-27 (id 18ed40c5-cb3b-46da-8d08-7c6b4c5a94ce).
Style: the NEW Bankers 3-D World style (Timur, 2026-11-25, from his 8 reference reels) — see Bankers/CLAUDE.md "THE BANKERS 3-D WORLD".
Composition `SelbeesLottery`, 1080×1920 at 30 fps, 2319 f (77.3 s). Voice: ElevenLabs "Jon – Calm Presence" (eleven_v4), take 38B,
trimmed + atempo 1.04 → 73.7 s. Bed: the FOCUS bed with the V37 rev-3 EQ, ~3.5 LU under the voice. Script: VO_SCRIPT.txt; facts: FACTCHECK.md.

## The film: ONE WebGL world, ONE camera, ten stations
Each station is a place in the world at its own origin (`src/w3d/st_<id>.tsx`), mounted only around its frames; the camera path is all
stations' shots in order (`src/w3d/Main.tsx`). Overlapping stations' lights cross-fade by the camera's aim; one shadow caster.

| # | station | origin | frames | the lines | what the viewer sees |
|---|---|---|---|---|---|
| 1 | hook | [0,0,0] | 0–335 | "A retired couple from a town of 1,900 … For 9 years." | Blue-hour Evart main street, the POP. 1,903 sign, a LOTTERY ticket falling to the road; LEGAL tag, 9 YEARS counter |
| 2 | store | [0,0,-58] | 200–483 | "In 2003, retired store owner Jerry Selbee read a brochure … He found the loophole in 3 minutes." | Flight down the street to the corner store; the CBS photo of the couple; push through the window to the WINFALL leaflet, it unfolds; the roll-down rule highlighted; 3:00 timer; push INTO the diagram |
| 3 | rolldown | [300,0,0] | 477–760 | "When the jackpot hit $5 million and nobody won … math on your side." | Cut onto the coin column: coins rise to the $5M ring; MATCH 6 gate locked; coins cascade to MATCH 5/4/3; a balance tips from tickets to prizes |
| 4 | test | [600,0,0] | 716–882 | "Jerry tried it. $3,600 in. $6,300 back." | Flight to a kitchen table: ticket bundles ($3,600), strapped cash rising 1.75× taller ($6,300), the $2,700 above the line lit; NET +$2,700 pill; push onto the bill's seal |
| 5 | company | [900,0,0] | 883–1085 | "He and his wife Marge formed a company … 12 roll-downs, until Michigan ended the game." | Cut seal→seal: G.S. INVESTMENT STRATEGIES certificates fan out; CBS shareholders photo; 12 chalk tallies; a lottery terminal x-rayed, then dark (GAME ENDED 2005) |
| 6 | road | [1200,0,0] | 1066–1356 | "Then they found a similar game in Massachusetts. For 6 years, they drove 900 miles …" | Night interstate, the sedan under a MASSACHUSETTS gantry (CASH WINFALL); orbit; odometer 900 MILES; the shell turns to glass: tubs of tickets; $600,000+; push into one slip |
| 7 | globe | [1500,0,0] | 1357–1630 | "They weren't alone. A group started by MIT students … the Boston Globe … rigged game." | Matched cut to the slip on a second stack before a domed building (MIT GROUP); the Boston Globe lands (JULY 2011); RIGGED? in red, then it dims |
| 8 | state | [1800,0,0] | ~1590–1870 | "The state investigated. The betting was legal … $120 million from it." | A domed State House at night; the Inspector General's report; LEGAL / NO ONE HURT; $120 MILLION grows |
| 9 | total | [2100,0,0] | ~1830–2105 | "In all, their company won over $26 million … Theirs went to family." | A column of winnings $26 MILLION, its top slab lifting ($8 MILLION profit before tax); the couple's modest home (FAMILY) |
| 10 | rules | [2400,0,0] | ~2090–2319 | "Sometimes the edge isn't luck. It's reading the rules." | Back to the leaflet's rules page; a light sweeps the roll-down rule; the camera lifts into the sky for the BANKER$ close |

Hand-overs: hook→store flight; store→rolldown push INTO the diagram + cut; rolldown→test flight through the haze; test→company push onto
the bill's seal + matched cut on the certificate's seal; company→road flight east; road→globe push into a slip + matched cut; then flights.
Close: the camera lifts into the navy sky, the world dims, BANKER$ at CLOSE_AT + 22; the watermark sinks out at CLOSE_AT + 10.

Real photos (credited "CBS News / 60 Minutes"): the couple (store), the shareholders (company). No people modelled in 3-D.
