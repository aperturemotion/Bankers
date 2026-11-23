// @ts-nocheck
// ★ V36 "Bre-X Gold" — bx_gold.ts: THE FILM'S GOLD (and the rock it was sprinkled on). Owned by builder H; every place imports it.
//
// API (all colours are the house's 5-stop ramps, dark → light, read with `rampAt(ramp, l)` from ./solid_engine, l ≈ 0…1 = the
//   one key light's level on that face, upper-left; never a flat colour):
//   BX_GOLD        the refined bar's metal (warm amber shade → bright gold → a near-white specular top)
//   BX_GOLD_DEEP   the same metal in a recess / under a stamp (the debossed figure's floor, the bar's dark side)
//   BX_DUST        the dust stream's grain colours (index 0 = brightest), BX_DUST_GLOW its soft haze
//   BX_FLECK       the glitter flecks the dust leaves on the rock skin (base, lit, glint)
//   BX_GRAIN       a salted grain's rounded body (river-worn placer gold: duller, more orange than refined metal)
//   BX_ROCK        the drill core's stone (a cool neutral grey — graphite family, a hair warmer than the steel)
//   BX_ROCK_MIN    the stone's mineral grains: [dark mafic, mid, pale feldspar, quartz white] — the granular texture
//   BX_ROCK_VEIN   a quartz veinlet's pale ink
//   BX_COPPER      a one-cent coin's copper (the hype place's penny)
//   BX_STEEL       the core tray's galvanised steel (V35's blue-steel family, TK_RING), BX_STEEL_IN its channel floor
//   BX_STAMP       { ink, lip, floor }: a figure struck into gold (ink = the debossed letter, lip = its lit lower edge)
//   goldAt(l)      rampAt(BX_GOLD, l) — the metal at light level l
//   metalLight(nv, vp, persp, k) → l   the house's metal lighting for gold: lightOf with a tight specular + the studio
//                  reflection boxes (tk_rig reflectStudio), so a turned or bevelled gold edge carries a real highlight band
//   rockLight(nv) → l                  matte stone: lightOf with almost no specular
// Derivation: the gold is built from data.ts GOLD_INK (the kit's gold, used by V35's cents) pushed to a refined-metal range; the
//   stone and the steel are V35's graphite (counter_mat PL_*) and blue-steel (tk_mat) ramps, re-used, not re-invented.
import { mixHex } from "./anim";
import { lightOf, rampAt } from "./solid_engine";
import { reflectStudio } from "./tk_rig";
import { GOLD_INK } from "./data";
import { PL_STEEL } from "./counter_mat";

export const BX_GOLD = ["#2B1A05", "#6E4610", "#B9822A", "#EDBE55", "#FFF1C6"];
export const BX_GOLD_DEEP = ["#1E1203", "#4A2E09", "#7C5418", "#B98A33", "#E2BE6A"];
export const BX_GOLD_SPEC = "#FFFAE8";
export const BX_DUST = [GOLD_INK.hi, GOLD_INK.edge, GOLD_INK.face, GOLD_INK.body, GOLD_INK.mid];
export const BX_DUST_GLOW = GOLD_INK.edge;
export const BX_FLECK = { base: GOLD_INK.body, lit: GOLD_INK.edge, glint: "#FFF8DE" };
export const BX_GRAIN = ["#3A2306", "#7A4E12", "#C08A2C", "#E9B957", "#FFE9AE"];
// the stone: V35's graphite steel ramp (PL_STEEL #1F2328 → #F7F7F8) pulled a little warmer and flatter, so it reads as rock, not metal
export const BX_ROCK = PL_STEEL.map((c, i) => mixHex(c, ["#211F1D", "#3A3734", "#5E5A55", "#9C9891", "#D8D5CF"][i], 0.55));
export const BX_ROCK_MIN = ["#1A1B1D", "#3B3E42", "#A9ABA8", "#E4E3DD"];
export const BX_ROCK_VEIN = "#CFCDC4";
export const BX_COPPER = ["#2A1108", "#6C2E14", "#A95A2D", "#DA9461", "#F9D6B6"];
// the tray: V35's tk_mat TK_RING blue-steel (kept unexported there), here named
export const BX_STEEL = ["#0B1F31", "#132B48", "#204D7F", "#90ACCE", "#F3F6FA"];
export const BX_STEEL_IN = ["#08131F", "#0C1C2E", "#13304F", "#3E6893", "#9FB6D0"];
export const BX_STAMP = { ink: "#4A2C07", lip: "#FFF0C0", floor: "#8A5E18" };
export const goldAt = (l) => rampAt(BX_GOLD, l);
export const metalLight = (nv, vp, persp, k = 1) => Math.min(1.15, 0.08 + 0.92 * lightOf(nv, 0.75, 38) + 0.32 * k * reflectStudio(nv, vp, persp, 0.35));
export const rockLight = (nv) => lightOf(nv, 0.06, 12);
