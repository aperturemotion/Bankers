// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import { loadFont } from "@remotion/google-fonts/Figtree";
import { loadFont as Anton_loadFont } from "@remotion/google-fonts/Anton";
import { loadFont as ArchivoBlack_loadFont } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as Archivo_loadFont } from "@remotion/google-fonts/Archivo";
import { loadFont as JetBrainsMono_loadFont } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as InstrumentSerif_loadFont } from "@remotion/google-fonts/InstrumentSerif";

export const VOICE = loadFont().fontFamily;
export const SHOUT = Anton_loadFont().fontFamily;
const DISPLAY = ArchivoBlack_loadFont().fontFamily;
export const DISPLAY_TEXT = Archivo_loadFont("normal", { weights: ["600", "700"] }).fontFamily;
const DATA = JetBrainsMono_loadFont().fontFamily;
export const ACCENT = InstrumentSerif_loadFont("italic", { weights: ["400"] }).fontFamily;
const SHOUT_SQUEEZE = 0.78;
