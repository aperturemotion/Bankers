// @ts-nocheck
// ★ V37 "Theranos" — builder M (places backers + whistle). Shared solids helpers and the materials of the boardroom.
//   Materials are the house's blue-steel / graphite ramps (5 stops, dark → highlight, read by solid_engine.rampAt); the one warm
//   material is the nameplates' BRASS (the brief's "engraved brass nameplates"), held low in saturation so it reads as metal, not
//   as a second hue.
import { prism, rampAt } from "./solid_engine";
import { paintXf, rrectPts, wound, xfApply, xfDir } from "./tk_rig";

export const xfFaces = (faces, x) => faces.map((f) => ({ ...f, pts: f.pts.map((p) => xfApply(x, p)), n: xfDir(x, f.n), vn: f.vn ? [xfDir(x, f.vn[0]), xfDir(x, f.vn[1])] : void 0 }));
/** a bevelled box centred at (cx, cy, cz): w along x, h along y, d along z */
export const box = (cx, cy, cz, w, h, d, bev = 2, mat = 0, pass = 1, r = 3) => prism(rrectPts(w, h, Math.min(r, w / 2.2, h / 2.2), 2, cx, cy), d, bev, mat, pass, () => false, [0, 0, cz]);
/** a slab lying flat (its plan rounded in x/z), centred at (cx, cy, cz), thickness h */
export const slab = (cx, cy, cz, w, h, d, r = 6, bev = 2, mat = 0, pass = 1) => xfFaces(prism(rrectPts(w, d, Math.min(r, w / 2.2, d / 2.2), 3, 0, 0), h, bev, mat, pass), { m: [1, 0, 0, 0, 0, 1, 0, -1, 0], t: [cx, cy, cz] });
// the house tone of a lit face (counter_plinth `tone`)
export const toneOf = (r, light, face) => rampAt(r, face.bev ? Math.min(1, 0.95 * light + 0.16) : face.cap ? 0.62 * light + 0.06 : 0.8 * light + 0.04);
/** paint a face list once (positions are fixed for a fixed rig + pose): returns [{ d, face, light }] far → near */
export const painted = (faces, map, rig, spec = 0.5) => paintXf(wound(faces), map, rig, spec);

// ── materials ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// the table's polished veneer: a deep graphite-blue lacquer with a bright, cool highlight (a mirror-like top)
export const BR_TOP = ["#050B15", "#081322", "#0E2038", "#3A6295", "#C9DAEE"];
export const BR_EDGE = ["#0A1526", "#122640", "#1F416B", "#7FA3CE", "#EAF1F9"];
// the pedestals' satin graphite
export const BR_PED = ["#0C1219", "#121B26", "#1C2A3B", "#4A6382", "#B6C6D8"];
// polished steel (arms, star bases, the edge inlay)
export const BR_STEEL = ["#1A2129", "#2A3440", "#4A5A6C", "#B9C5D2", "#F6F8FA"];
export const BR_RUBBER = ["#0B0F14", "#121820", "#1B2430", "#2E3B4C", "#56677C"];
// the chairs' navy leather (dark, a soft sheen)
export const BR_LEATHER = ["#081222", "#0F1D33", "#1B3456", "#4A73A6", "#B4CBE6"];
// the blotters' tooled leather on the table
export const BR_BLOT = ["#0A1220", "#0E1A2C", "#152640", "#2C4C76", "#7F9CC2"];
// the nameplates' brushed brass (low saturation) and its engraving fill
export const BR_BRASS = ["#251B0D", "#4A3919", "#8B6D33", "#CDB070", "#F8EDCB"];
export const BR_BRASS_GROOVE = "#1E1609";
export const BR_BRASS_LIP = "#F2E2B4";
export const BR_INK = "#E9F1FA";
export const BR_LABEL = "#84B0E4";
export const BR_NAVY = "#00244D";

import * as jsx_runtime from "react/jsx-runtime";
/** draw a painted list ([{ d, face, light }]) with a ramp per face (mats[face.mat]), dimmed by `dim` (0 lit … 1 black) */
export const Painted = ({ dws, mats, dim = 0, lift = 0, sw = 0.6 }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: dws.map((dw, k) => {
  const r = mats[dw.face.mat ?? 0] ?? mats[0];
  const c = toneOf(r, Math.max(0, dw.light * (1 - dim) + lift), dw.face);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: sw, strokeLinejoin: "round" }, k);
}) });
export const ring = (cx, cy, r, n = 18) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos(i / n * 2 * Math.PI), cy + r * Math.sin(i / n * 2 * Math.PI)]);
