// ══════════════════════════════════════════════════════════════════════════════════════════════
// BANKERS — THE PALETTE, and the rule that turns a Style 3 film into a Bankers one
// (Bankers/CLAUDE.md §2.1–§2.2).
//
// ★ ANCHORED ON THE LOGO BLUE, #005DC8 (Timur, 2026-09-25: "the blue that they have in their logo doesn't
// really match the blue there is during the video, and I need that blue to be present in the video
// itself … and black doesn't really fit that well with the kind of blue that they have").
//
//   · the GROUND is a deep navy of the logo blue, not black — the theme a little lighter
//   · every Style 3 GREY maps by its lightness onto the ramp  black → #005DC8 → white: a grey darker
//     than the logo blue becomes a shade of it, a lighter grey a tint of it — so the solids, the bars,
//     the dial, the candles are the logo's own blue family
//   · LIGHT (the key cone, glows, the accent word) is a 30% tint of the logo blue — #005DC8 itself is
//     too dark to read as light on the navy ground
//   · the white stage is white with an 8% tint of the logo blue, and its ink is the navy
// Anything with real colour (Style 3's red) is left alone.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const BANKERS = {
  white: "#FFFFFF",
  /** ★ the logo blue — the colour of the client's own logo file; the anchor of the whole palette */
  logo: "#005DC8",
  /** the ground: the logo blue 70% toward black (white on it 17:1) */
  bg: "#001C3C",
  /** the radial lift under the key light: the logo blue 44% toward black */
  bgLift: "#003470",
  /** LIGHT — the key cone, rims, glows, the accent word: the logo blue 30% toward white (5:1 on bg) */
  light: "#4D8ED9",
  /** a hot core: the logo blue 70% toward white */
  bright: "#B3CEEF",
  /** the far end of a beam: the logo blue 50% toward black */
  deep: "#002F64",
  /** the white-themed stage: white with an 8% tint of the logo blue, and its 4% lift */
  stage: "#EBF2FB",
  stageLift: "#F5F9FD",
  /** ink on the white stage: the navy ground (15:1 on the stage) */
  ink: "#001C3C",
};

const toRgb = (hex) => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = ([r, g, b]) =>
  "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("").toUpperCase();
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

const ANCHOR = toRgb(BANKERS.logo);
const BLACK = [0, 0, 0], WHITE = [255, 255, 255];
const lightness = ([r, g, b]) => (Math.max(r, g, b) + Math.min(r, g, b)) / 2 / 255;
const L_ANCHOR = lightness(ANCHOR); // 0.392

/** a colour is a GREY when its channels sit within this many levels of each other. Style 3's greys
 *  are cool or warm-neutral (platinum #b9bfcb spans 18; the quote's paper #e9e7e1 spans 8); its
 *  red (#ef2b3d, span 196) and every chart colour are far outside it. */
export const GREY_SPAN = 40;
export const isGrey = (rgb) => Math.max(...rgb) - Math.min(...rgb) <= GREY_SPAN;

/** the ramp position for a lightness: black → the logo blue → white */
export const rampAt = (l) => {
  if (l <= 0.001) return BLACK;
  if (l >= 0.999) return WHITE;
  return l <= L_ANCHOR ? mix(BLACK, ANCHOR, l / L_ANCHOR) : mix(ANCHOR, WHITE, (l - L_ANCHOR) / (1 - L_ANCHOR));
};

/** ★ THE MAPPING — one grey in, its Bankers colour out. Non-greys come back unchanged. */
export const bkRgb = (rgb) => (isGrey(rgb) ? rampAt(lightness(rgb)) : rgb);
export const bk = (hex) => {
  const rgb = toRgb(hex);
  return isGrey(rgb) ? toHex(bkRgb(rgb)) : hex;
};

// ── self-check: the rule must pass its own known cases, or nothing may use it ─────────────────
const CASES = [
  ["#000000", "#000000"],   // black stays
  ["#ffffff", "#FFFFFF"],   // white stays
  ["#ef2b3d", "#ef2b3d"],   // Style 3's red is not a grey — untouched
];
for (const [inp, want] of CASES) {
  const got = bk(inp);
  if (got.toLowerCase() !== want.toLowerCase()) throw new Error(`bk(${inp}) = ${got}, expected ${want}`);
}
{
  // a mid grey lands in the logo blue's own hue (212°): blue channel highest, red lowest
  const [r, g, b] = toRgb(bk("#808080"));
  if (!(b > g && g > r)) throw new Error(`bk(#808080) = ${bk("#808080")} is not in the logo blue's hue`);
}
