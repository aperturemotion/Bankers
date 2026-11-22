import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadFigtree } from "@remotion/google-fonts/Figtree";
import { loadFont as loadInstrument } from "@remotion/google-fonts/InstrumentSerif";

// ══ BANKERS FACES (Bankers/CLAUDE.md §2.3). Built-graphic text is Anton 400, as Style 3 already has it.
// ★ SUBTITLE_FACE — the one open item: Timur, 2026-09-25, "the subtitles should stay the way they
// were with Style 3, maybe except for the font if their proposed font looks good".
//   "anton"   → chips and hero lines in Anton 400 (no bold, no italic: Anton has neither)
//   "figtree" → Style 3' own subtitle face, weights and serif-italic accent word, unchanged
// ★ DECIDED (Timur, 2026-09-25): "don't use their font for the subtitles, use the Style 3 one, even in the
// next? part where the text should be that Style 3 cursive sort of font" → Figtree + the serif-italic accent.
export const SUBTITLE_FACE = "figtree" as "anton" | "figtree";
export const SUBTITLE_IS_ANTON = SUBTITLE_FACE === "anton";

const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
const figtree = loadFigtree("normal", { weights: ["300", "400", "500", "800"], subsets: ["latin"] }).fontFamily;
const serif = loadInstrument("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily;

/** the subtitle face (caption chips, hero sentences) */
export const VOICE = SUBTITLE_IS_ANTON ? anton : figtree;
/** the hero's accent word */
export const ACCENT = SUBTITLE_IS_ANTON ? anton : serif;
export const SHOUT = anton;
export const DISPLAY = anton;
export const DISPLAY_TEXT = anton;
export const DATA = anton;
export const SHOUT_SQUEEZE = 0.78;
