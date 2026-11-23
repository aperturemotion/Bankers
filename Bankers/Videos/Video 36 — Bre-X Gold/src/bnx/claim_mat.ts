// @ts-nocheck
// Video 36 "Bre-X Gold" — the materials of claim / claim2 / partner (builder B, 2026-11-23). ★ Every ramp is DERIVED from Video 35's
//   material files (the colour-pass tools were lost): the rig's painted steel is V35's school bell / panel blue (honest_mat_b), its
//   machinery the counter's graphite (counter_mat), the core boxes a weathered grey timber mixed from the plinth plate and the school's
//   stone, the rock core the plinth's graphite lifted toward the cash paper's grey (sales_mat). No new hue: blue-steel + graphite.
import { mixHex } from "./anim";
import { HS_BELL, HS_STONE, HC_PANEL } from "./honest_mat_b";
import { PL_BODY, PL_PLATE, PL_RUBBER, PL_STEEL, PL_WALL } from "./counter_mat";
import { SL_PAPER } from "./sales_mat";

const mixR = (a, b, t) => a.map((c, i) => mixHex(c, b[i], t));
// the rig's painted frame (skid, mast, struts, crown): the school's bell blue, a touch deeper so the steel reads heavy
export const RG_FRAME = mixR(HS_BELL, ["#0B1A30", "#12304F", "#245A99", "#8FAACB", "#DCE6F1"], 0.35);
// the rig's machinery housings (power pack, head, tank, clamp): the plinth's graphite
export const RG_BODY = PL_BODY;
export const RG_PLATE = PL_PLATE;
// bright machined steel (rods, chuck, sheave, casing, bolts)
export const RG_STEEL = PL_STEEL;
export const RG_RUBBER = PL_RUBBER;
export const RG_WALL = PL_WALL;
// the deck's tread plate: the panel blue, darker
export const RG_DECK = mixR(HC_PANEL, ["#0C1B2E", "#12263F", "#1C3F68", "#6F8FB5", "#C8D6E6"], 0.55);
// weathered core-box timber: the plinth plate's graphite toward the school's stone (a cool grey board, never a brown)
export const BX_WOOD = mixR(mixR(PL_PLATE, HS_STONE, 0.3), ["#353D46", "#58636F", "#8794A1", "#BFC8D1", "#EDF0F3"], 0.75);
export const BX_WOOD_END = mixR(BX_WOOD, PL_WALL, 0.35);
// the box's inside (shadowed boards), its grain and stencil ink
export const BX_INSIDE = "#141A21";
export const BX_GRAIN = "#0E1318";
export const BX_GRAIN_LIT = "#C7D0DA";
export const BX_STENCIL = "#0E1826";
export const BX_NAIL = "#0B0F13";
// grey rock core: the plinth graphite lifted toward the paper grey (no green: the paper ramp only lightens the top)
export const CORE_ROCK = ["#0F1215", "#262B31", "#4A525B", "#9AA2AB", "#E1E5E9"];
export const CORE_FLECK_D = "#1C2126";
export const CORE_FLECK_L = "#C9CFD5";
// drilling mud at the collar: wet graphite with a blue sheen
export const MUD = ["#080B0F", "#0E1319", "#18212B", "#3B4B5E", "#8EA2B8"];
export const MUD_SHEEN = "#A9BED6";
// the lamp's lit lens and its glow
export const LAMP_HOT = "#F4F8FD";
export const LAMP_GLOW = "#B3CEEF";
export { PL_STEEL, PL_RUBBER };
// ★ REV1: the partner's rig is a DIFFERENT model and paint — a graphite frame and a pale blue-steel power pack and cab roof
//   (Bre-X's: steel-blue frame, graphite pack), both from the plinth/school ramps
export const RG_FRAME_B = mixR(PL_PLATE, ["#121519", "#1E2227", "#343B44", "#7A8592", "#D7DBE0"], 0.5);
export const RG_PACK_B = mixR(HC_PANEL, ["#14304F", "#285383", "#5C88BA", "#ADC4DF", "#EEF3F9"], 0.5);
// palm trees (REV1): ringed trunks and pinnate fronds in the house family — a cool grey-blue bark, a deep blue-green frond turned
//   fully into the logo blue's family (no green): the palm reads by its shape, lit from the one key light
export const PALM_BARK = ["#0F1B2B", "#1E3048", "#3A5677", "#7F9BBC", "#CBD8E6"];
export const PALM_FROND = ["#0A1D35", "#14365E", "#25588F", "#5B8FCB", "#B5CFEC"];
// a warning decal plate and the hazard stripes on the skid ends (pale on navy: no yellow)
export const DECAL_PLATE = "#DCE6F1";
export const DECAL_INK = "#0B1A30";
