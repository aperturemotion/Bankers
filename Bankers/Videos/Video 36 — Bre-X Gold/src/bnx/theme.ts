// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).

const K = 1.5;
export const theme = {
  // ── THE FIELD ────────────────────────────────────────────────────────────────────────────────
  // Measured modal background across all ten: #000000 in 6/10 videos, with the rest sitting a
  // hair above it (#010002, #0b0b0b, #111111, #141115). It is TRUE BLACK with a soft radial lift
  // where a light source sits — never a flat mid-grey.
  bg: "#001E42",
  // ★ 2026-11-04: lifted to #002753, then "a little more shadow" (user, seeing the video) → #00224A + the edge falloff (stage.tsx)
  /** ★ V9: the lift is a HAIR cooler than V8's neutral #0d0d0f — the same trick as the accent.
   *  At 5% luma the hue is subliminal, but it separates the field from the objects' warm-neutral
   *  chrome and is most of why the frame reads "studio" rather than "unlit". */
  bgLift: "#003472",
  // ★ 2026-11-04: #00408A → back near the original #003470 ("a little more shadow")        // the top of the radial lift under a light source
  /** ★ The field can INVERT to a light stage for a section (measured #e3e3e3–#efecf0 in 5/10). */
  bgLight: "#EBF2FB",
  bgLightLift: "#F5F9FD",
  // ── TEXT ─────────────────────────────────────────────────────────────────────────────────────
  text: "#FFFFFF",
  /** the caption's not-yet-spoken / just-arrived word — measured ≈ 55% white on black */
  textDim: "#5794DB",
  textMute: "#0060CE",
  textOnLight: "#002753",
  textOnLightDim: "#0D70E2",
  // ── THE ACCENT ───────────────────────────────────────────────────────────────────────────────
  // ★★ VIDEO 9 RUNS GREY, NOT GREEN (user note, 2026-08-28: "rather than a green black style I
  // want a gray black style that is more premium").
  //
  // The reference corpus's accent is green in 9/10 videos, and every other Style 3 video we have
  // built uses it. This one deliberately does not. The whole 3D kit derives its rim, its key
  // glow, its light pools and its column fills from these four tokens, so flipping them here
  // flips the entire film — nothing downstream hard-codes a hue.
  //
  // The palette is PLATINUM: a cool near-neutral that reads as brushed metal under a light
  // rather than as "grey paint". It is deliberately a few points blue of true neutral — a pure
  // #999 light reads as fog, a faintly cool one reads as a studio source, which is the whole of
  // the "premium" the user asked for. Saturation stays near zero, which is exactly what the
  // corpus measures anyway; only the hue of the ONE source changes.
  //
  // ⚠ RED IS THE ONLY CHROMA IN THIS VIDEO. With the accent neutral there is no green to carry
  // "good", so nothing may be tinted to mean "up" — the up-state is BRIGHTNESS, the down-state
  // is red. Do not reintroduce a second hue to compensate; the restraint is the look.
  accent: "#629BDD",
  // the light source, the rim where it grazes, the "lit" state
  accentBright: "#B8D1F0",
  // the hot core of a glow / a fully lit face
  accentDeep: "#003B7E",
  // the far, cold end of a volumetric beam
  accentGlow: "rgba(98,155,221,0.50)",
  // semantic — measured on SELL pills and crash type.
  red: "#ef2b3d",
  redGlow: "rgba(239,43,61,0.55)",
  gold: "#FFFFFF",
  // ⚠ UNUSED IN VIDEO 10 — kept only so the shared kit still type-checks
  // ── THE PARTY TAGS (Video 11 only) ───────────────────────────────────────────────────────────
  // ★★ NEUTRAL TAGS OF EQUAL VISUAL WEIGHT (brief: "party colors used ONLY as neutral tags").
  // Both are pulled well off their flag saturations and LUMINANCE-MATCHED (≈46% relative luma
  // each) so neither pops harder than the other on the black field. These two are the video's
  // ENTIRE chroma budget: with the accent neutral, nothing else in the film may carry a hue —
  // theme.red above stays reserved for the shared kit and is NOT used as "Republican".
  partyR: "#b95560",
  partyD: "#6C83C1",
  // ── OBJECT SURFACES ──────────────────────────────────────────────────────────────────────────
  // Objects are glossy 3D solids on a mirror floor: a dark body, a bright specular edge, a soft
  // coloured under-glow. These are the fills that produce that read.
  bodyTop: "#1D4473",
  // lit top of a dark solid
  bodyBottom: "#0A1A2B",
  // its shadow side
  chrome: "#E0E8F2",
  // specular highlight / chrome rim
  glassTint: "rgba(255,255,255,0.10)",
  stroke: "rgba(255,255,255,0.16)",
  strokeSoft: "rgba(255,255,255,0.07)",
  /** the faint blueprint grid seen on some dark sections (v05) — barely there */
  grid: "rgba(255,255,255,0.045)"
};
export const LAYOUT = {
  W: 1080,
  H: 1920,
  /** 90px @720 → 135 @1080 (12.5% each side) */
  margin: 135,
  /** the content column: 540px @720 → 810 @1080 */
  colW: 810,
  /** ★ the one-word caption's FIXED baseline slot — it never moves within a video.
   *  Measured across the corpus @720: y=169 (v08), y=172 (v05), y=194 (v10), y=212 (v06),
   *  y=219 (v02), y=225 (v04). Median ≈ 194 → 291 @1080. */
  captionY: 291,
  /** the hero-sentence slot: measured centre-of-block y≈600–700 @720 → ~960 @1080 */
  heroY: 960,
  /** objects live in y 200–960 @720 → 300–1440 @1080; centre of mass ~44% down */
  stageTop: 300,
  stageBottom: 1440,
  /** the mirror horizon — measured y=730 @720 (57% of height) → 1095 @1080 */
  floorY: 1095,
  /** top 15% and bottom 20–25% are kept EMPTY (platform UI + the style's negative space) */
  topClear: 288,
  bottomClear: 1500
};
export const TYPE = {
  /** the one-word running caption — measured asc 25px, x-h 17px → ≈32–35px @720 */
  captionSize: 50,
  /** the hero sentence, regular line — measured ≈28–30px @720 */
  heroSize: 45,
  /** the hero sentence's EMPHASIS word/line — measured ≈48px @720, a 1.6× jump */
  heroEmphSize: 74,
  /** an editor headline / kicker — measured cap 24–26px → ≈34–37px @720 */
  kickerSize: 54,
  /** ★ THE SHOUT — the one ultra-condensed display line. Measured cap 65–106px @720. */
  shoutSize: 200,
  /** big stat numerals — measured digit height 36–109px @720 */
  numeralSize: 150,
  labelSize: 30,
  microSize: 18,
  // the 9–12px @720 sublabels under a stat — deliberately 4–6× smaller
  lineHeight: 1.25,
  // measured hero line-height 35px on 28px type
  trackingCaption: 0
  // ★ measured: NORMAL tracking everywhere. No letterspacing on the voice.
};
const MOTION = {
  /** the always-on camera drift — a plain SINE (a periodic move through an ease curve reads as
   *  turbulence), amplitude in px, unrelated periods per axis */
  driftX: 14,
  driftY: 9,
  periodX: 197,
  periodY: 149,
  /** the slow continuous push across a section */
  pushPerSection: 0.055,
  /** object entrance: rise + settle, strong ease-out, no overshoot */
  enterFrames: 26,
  enterRise: 90,
  /** how long a light beam takes to sweep */
  sweepFrames: 90
};
const TONE = {
  accent: theme.accent,
  red: theme.red,
  white: "#ffffff"
};
