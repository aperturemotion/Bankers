// @ts-nocheck
// Video 37 "Theranos" — the materials of builder B's objects (claim / claim2 / collapse; th_door, th_edison), 2026-11-24. Every ramp
//   is DERIVED from the house material files (counter_mat's graphite and steel, honest_mat_b's blue-steel, data.ts's GOLD_INK): no
//   new hue but the gold leaf and the brass plate (gold is the house's gold, as Video 36's bar), and the house red for VOIDED.
import { mixHex } from "./anim";
import { HS_WALL, HC_POLE, HC_PANEL } from "./honest_mat_b";
import { PL_BODY, PL_PLATE, PL_RUBBER, PL_STEEL, PL_WALL } from "./counter_mat";
import { GOLD_INK } from "./data";

const mixR = (a, b, t) => a.map((c, i) => mixHex(c, b[i], t));
// the storefront's anodised aluminium (door frame, leaf stiles, the shutter's rails): the plinth steel a touch toward the pole blue
export const TH_ALU = mixR(PL_STEEL, HC_POLE, 0.28);
// the facade's cladding panels: the school wall's blue-steel, a step lighter so the facade reads against the navy field
export const TH_CLAD = mixR(HS_WALL, ["#132A47", "#1C3D63", "#2A5689", "#86A6CB", "#DCE6F1"], 0.55);
export const TH_CLAD_SEAM = "#08121F";
// the building's granite base course: the plinth plate's graphite toward the school's stone (a cool dark stone, never a brown)
export const TH_BASE = ["#12161B", "#1F252D", "#353E49", "#7A8693", "#CBD3DB"];
// the mortarboard's cloth (claim's university object): a deep navy-black felt with a cool sheen
export const TH_CAP = ["#05080E", "#0B111B", "#17222F", "#344A63", "#7F96B2"];
// the roof's membrane deck: a flat dark graphite
export const TH_ROOF = ["#0E1217", "#171C23", "#262E38", "#4F5A67", "#9AA4AF"];
// the skirting / threshold / hood: the plinth graphite
export const TH_GRAPH = PL_BODY;
export const TH_PLATE = PL_PLATE;
export const TH_STEEL = PL_STEEL;
export const TH_RUBBER = PL_RUBBER;
export const TH_WALLDK = PL_WALL;
// the roller shutter's galvanised slats: brushed steel, cooler and a touch darker than the frame
export const TH_SLAT = mixR(PL_STEEL, ["#16202B", "#24313F", "#3E5266", "#9AAABB", "#E6ECF2"], 0.45);
// a satin brass plate (the founder's plate) and its engraving
export const TH_BRASS = ["#2A1D08", "#5C4316", "#9B7832", "#D6B768", "#FFF0C4"];
export const TH_BRASS_INK = "#21170A";
// gold leaf (the door's lettering): the house gold
export const TH_GOLD = GOLD_INK;
// the lab corridor seen through the glass: cool white walls and ceiling lit by its panels, in the logo blue's family
export const TH_LAB_WALL = ["#0E2239", "#1B3A5E", "#3B6595", "#9DBBDD", "#E9F1FA"];
export const TH_LAB_LIGHT = "#F4F8FD";
// the Edison: a white shell (pale blue-steel, the house's light faces) and a graphite front
export const ED_SHELL = mixR(HC_PANEL, ["#3A4E66", "#6F87A3", "#AFC2D8", "#E3EBF4", "#FBFDFF"], 0.7);
export const ED_FRONT = mixR(PL_BODY, ["#0D1015", "#161B22", "#252D37", "#56616F", "#C9D0D8"], 0.4);
export const ED_GLASS = "#070C12";
export const ED_SCREEN_BG = "#0B1D33";
export const ED_TILE = "#4D8ED9";
export const ED_TILE_HI = "#B3CEEF";
export const ED_LED = "#9CC7F4";
export { PL_RUBBER, PL_STEEL, PL_BODY, HS_WALL };
