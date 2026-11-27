// @ts-nocheck
// ★ V39 builder D — BRATTLEBORO, VERMONT at blue hour: ONE street set shared by the `will` and `pavilion` stations (origin [2400,0,0]).
//   Main Street runs along x (the road z 3…13, sidewalks both sides), the north side (z < 3) carries, west to east:
//   · the RONALD READ PAVILION (era "pav" only): the hospital's 4-storey modern wing — a red-brick mass with slot windows, a glass
//     curtain wall over three floors (two operating-room floors and an office floor, lit), a glass lobby under a blade canopy, the
//     metal parapet band with the per-letter sign RONALD READ PAVILION (PavilionSign), a louvred rooftop screen. In era "will"
//     (2015) the site holds the old two-storey annex the pavilion replaced.
//   · BRATTLEBORO MEMORIAL HOSPITAL: a 4-storey red-brick block, stone base, belt course and cornice, punched windows with stone
//     sills and keystone lintels (rooms lit behind blinds), a flat entrance canopy with the name in lit letters, the lobby behind
//     glass, a monument sign (BRATTLEBORO MEMORIAL HOSPITAL · MAIN ENTRANCE), the blue H sign, a paved forecourt.
//   · a lawn with trees, then BROOKS MEMORIAL LIBRARY (the real 1967 building: brick and concrete, a glass-sheathed front, flat roof
//     with a deep overhang): brown-brick end walls, two floors of stacks and reading tables behind the glass, the concrete floor
//     band, the overhang's fascia lettered BROOKS MEMORIAL LIBRARY, soffit downlights, a monument sign (BRATTLEBORO, VERMONT), planters,
//     a BOOK RETURN box, a bike rack.
//   · then rows of brick and clapboard commercial blocks (the town kit) on both sides, lamps, trees, the hills beyond, the sky.
//   Local metres, y up; PL = the sidewalk / plaza top.
import React, { useMemo } from "react";
import * as THREE from "three";
import { rnd, Sky, Glow } from "./kit";
import { Mesher, townMats, addBuilding, addProps, winRect } from "./town_parts";
import { LightPool, LightWash } from "./d_fx";
import { letters, advances, lobbyTex, libInteriorTex, orTex, officeTex, hospitalSignTex, librarySignTex, bookReturnTex, hSignTex, concreteTex, paverTex, asphaltTex, lawnTex, sheenTex } from "./d_bratt_tex";

export const PL = 0.15;
export const HOSP = { x: -17, z: -10, W: 24, D: 16, H: 15.6 };
export const LIB = { x: 13, z: -6, W: 20, D: 22, H: 8.4, over: 2.6 };
export const WING = { x: -38, z: -9, W: 18, D: 14, H: 18.6, glass0: -4, band: 1.8 };
// where the money stands (station-local): 8 pallets of $600,000 at the hospital (4 × 2), 2 at the library, the budget block beside them
export const HOSP_PALLETS = [0, 1, 2, 3].flatMap((i) => [-4.5, -3.2].map((z) => [HOSP.x + (i - 1.5) * 1.45, PL, z]));
export const LIB_PALLETS = [[14.6, PL, -2.2], [16.1, PL, -2.2]];
export const GHOST = [12.75, PL, -2.2];
// the pavilion sign: two lines on the parapet band over the glass (local), cap height
export const SIGN_LINES = ["RONALD READ", "PAVILION"];
export const SIGN = { y: [WING.H - 0.55, WING.H - 1.3], z: WING.z + 0.06, cap: 0.45, cx: WING.x + (WING.glass0 + WING.W / 2) / 2 };

// ── materials (the town kit's, plus the set's own glazing and concrete) ───────────────────────────────────────────────────────
let DM = null;
const setMats = () => {
  if (DM) return DM;
  const T = townMats();
  const em = (map, I, extra = {}) => new THREE.MeshStandardMaterial({ map, emissiveMap: map, emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: I, roughness: 0.12, metalness: 0.2, envMapIntensity: 0.7, ...extra });
  const conc = concreteTex(); conc.repeat.set(0.25, 0.25);
  DM = {
    ...T,
    lobby: em(lobbyTex(), 0.5, { color: "#9FB0C8" }), libint: em(libInteriorTex(), 0.5, { color: "#A9B8D0" }), or: em(orTex(), 0.72, { color: "#A9B8D0" }), office: em(officeTex(), 0.5, { color: "#A9B8D0" }),
    conc: new THREE.MeshStandardMaterial({ map: conc, color: "#FFFFFF", roughness: 0.85, vertexColors: true }),
    alu: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.32, metalness: 0.75, vertexColors: true, envMapIntensity: 0.9 }),
    spandrel: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.14, metalness: 0.55, vertexColors: true, envMapIntensity: 1.1 }),
    dark: new THREE.MeshStandardMaterial({ color: "#0C1420", roughness: 0.8, vertexColors: true })
  };
  for (const k of ["lobby", "libint", "or", "office"]) DM[k].userData.cast = false;
  DM.sheen = new THREE.MeshBasicMaterial({ map: sheenTex(), transparent: true, depthWrite: false, vertexColors: true });
  DM.sheen.userData = { cast: false, recv: false, order: 3 };
  return DM;
};
const MT = (uo = [0, 0]) => ({ metric: true, uo });
// a punched window in brick: the glazing from the town atlas, frame, stone sill, a flat lintel with a keystone
const winUnit = (m, x, cy, ww, wh, cell, stone = "#B7B0A3", frame = "#D6D2C8") => {
  m.quad("win", [x, cy, 0.012], ww, wh, "#FFFFFF", winRect(cell[0], cell[1]));
  for (const sd of [-1, 1]) m.box("trim", [x + sd * (ww / 2 + 0.03), cy, 0.035], [0.07, wh + 0.07, 0.07], frame);
  m.box("trim", [x, cy + wh / 2 + 0.03, 0.035], [ww + 0.13, 0.07, 0.07], frame);
  m.box("trim", [x, cy, 0.03], [ww, 0.045, 0.04], frame);
  m.box("trim", [x, cy - wh / 2 - 0.07, 0.08], [ww + 0.26, 0.09, 0.16], stone);
  m.box("trim", [x, cy - wh / 2 - 0.12, 0.05], [ww + 0.18, 0.03, 0.1], stone);
  m.box("trim", [x, cy + wh / 2 + 0.17, 0.035], [ww + 0.34, 0.24, 0.07], stone);
  m.box("trim", [x, cy + wh / 2 + 0.17, 0.075], [0.18, 0.27, 0.02], stone);
};
// a hospital room window: lit behind blinds (cool or warm) or dark
const roomCell = (i) => { const r = rnd(i * 7.7 + 3); return r < 0.34 ? [7, r < 0.17 ? 0 : 1] : r < 0.56 ? [3, 1] : r < 0.7 ? [2, 0] : [2 + Math.floor(rnd(i) * 2), 2]; };

// ── BRATTLEBORO MEMORIAL HOSPITAL (frame: the front face z = 0 facing +z, centred on x = 0) ─────────────────────────────────────
const BRC = "#C4C2CC";   // the red brick's tint at blue hour
const buildHospital = (m) => {
  const { W, D, H } = HOSP, BR = "brick0", uo = [0.3, 0.1];
  // the block, its front layer open at the entrance bay (x ±3.85 under the canopy)
  m.box(BR, [0, H / 2, -D / 2 - 0.45], [W, H, D - 0.9], BRC, MT(uo));
  for (const sd of [-1, 1]) m.box(BR, [sd * (W / 2 + 3.85) / 2, H / 2, -0.45], [W / 2 - 3.85, H, 0.9], BRC, MT(uo));
  m.box(BR, [0, (3.8 + H) / 2, -0.45], [7.7, H - 3.8, 0.9], BRC, MT(uo));
  // stone base (front segments + a wrap round sides and back), belt course over the ground floor, the cornice
  const band = (y, h, out, c = "#B7B0A3") => m.box("trim", [0, y, -D / 2], [W + 2 * out, h, D + 2 * out], c);
  m.box("trim", [0, 0.45, -D / 2 - 0.45], [W + 0.12, 0.9, D - 0.9 + 0.12], "#B7B0A3");
  for (const sd of [-1, 1]) m.box("trim", [sd * (W / 2 + 3.85) / 2 + sd * 0.03, 0.45, -0.42], [W / 2 - 3.85 + 0.06, 0.9, 0.96], "#B7B0A3");
  band(4.25, 0.24, 0.07); band(H - 0.5, 0.55, 0.05, "#A9A296"); band(H - 0.16, 0.12, 0.16, "#B7B0A3"); band(H + 0.12, 0.24, 0.1, "#9E978B");
  for (let i = 0; i < 26; i++) m.box("trim", [-W / 2 + 0.3 + i * (W - 0.6) / 25, H - 0.29, 0.13], [0.16, 0.12, 0.12], "#B7B0A3");   // dentils
  m.box("roof", [0, H + 0.01, -D / 2], [W - 0.3, 0.04, D - 0.3], "#FFFFFF", { metric: true });
  // upper floors: 8 bays of windows; the corners and the centre bay framed by brick pilasters
  for (let fl = 0; fl < 3; fl++) for (let i = 0; i < 8; i++) winUnit(m, -10.5 + i * 3, 4.2 + fl * 3.8 + 1.85, 1.35, 2.0, roomCell(fl * 8 + i));
  for (const x of [-W / 2 + 0.25, W / 2 - 0.25, -3.0, 3.0]) m.box(BR, [x, H / 2 + 2.1, 0.08], [0.5, H - 4.2, 0.16], BRC, MT(uo));
  // ground floor windows either side of the entrance
  for (const x of [-11, -8.4, -5.9, 5.9, 8.4, 11]) winUnit(m, x, 2.15, 1.5, 2.2, roomCell(40 + x * 3));
  // the entrance: a recessed glazed vestibule (the lobby behind it), aluminium storefront, doors, the flat canopy on two columns
  m.quad("lobby", [0, 1.9, -0.78], 7.7, 3.8, "#FFFFFF", [0, 0, 1, 1]);
  m.quad("sheen", [0, 1.9, -0.7], 7.7, 3.8, "#FFFFFF", [0, 0, 1, 1]);
  m.box("trim", [0, 3.73, -0.45], [7.7, 0.14, 0.9], "#8E97A4");
  for (let k = 0; k <= 5; k++) m.box("alu", [-3.5 + k * 1.4, 1.8, -0.72], [0.07, 3.5, 0.1], "#2A3340");
  m.box("alu", [0, 2.55, -0.72], [7, 0.07, 0.1], "#2A3340"); m.box("alu", [0, 0.06, -0.72], [7, 0.12, 0.12], "#2A3340");
  for (const sd of [-1, 1]) m.box("alu", [sd * 0.7, 1.1, -0.66], [0.04, 0.04, 0.5 * 0 + 0.04], "#C9D3DE"), m.box("alu", [sd * 0.25, 1.15, -0.65], [0.03, 0.9, 0.04], "#C9D3DE");
  m.box("trim", [0, 0.07, 0.3], [7.4, 0.14, 1.6], "#8E97A4");                                          // the entrance landing
  // canopy: slab with an aluminium fascia (the letters go on its face), soffit, two round columns
  m.box("alu", [0, 3.92, 2.05], [9.2, 0.5, 4.3], "#D9DEE6"); m.box("dark", [0, 3.66, 2.05], [9.0, 0.02, 4.1], "#FFFFFF");
  for (const sd of [-1, 1]) { m.cyl("alu", [sd * 4.1, 1.84, 3.7], 0.14, 3.68, "#C9D1DB", { seg: 16 }); m.cyl("alu", [sd * 4.1, 0.04, 3.7], 0.24, 0.08, "#8E97A4", { seg: 16 }); }
  for (let k = 0; k < 4; k++) for (const z of [0.9, 2.9]) { m.cyl("bulb", [-3 + k * 2, 3.64, z], 0.1, 0.02, "#FFF2DC", { seg: 10 }); m.glow([-3 + k * 2, 3.55, z], "#FFE4BE", 0.7); }
  // east side wall (toward the library): 5 bays a floor
  m.push([W / 2, 0, -D / 2], Math.PI / 2);
  for (let fl = 0; fl < 4; fl++) for (let i = 0; i < 5; i++) winUnit(m, -6 + i * 3, (fl ? 4.2 + (fl - 1) * 3.8 + 1.85 : 2.15), 1.35, fl ? 2.0 : 2.2, roomCell(60 + fl * 5 + i));
  m.pop();
  // the roof: a brick penthouse, condensers, vents, a parapet return
  m.box(BR, [-3, H + 1.6, -9], [8, 3.2, 6], BRC, MT(uo)); m.box("trim", [-3, H + 3.25, -9], [8.3, 0.12, 6.3], "#9E978B");
  for (let k = 0; k < 3; k++) { m.box("metal", [4 + k * 2.2, H + 0.65, -6], [1.6, 1.2, 1.2], "#B9C2CE"); m.cyl("metal", [4 + k * 2.2, H + 1.27, -6], 0.45, 0.04, "#2A3240", { seg: 16 }); }
  for (let k = 0; k < 4; k++) m.cyl("metal", [-9 + k * 1.8, H + 0.5, -12], 0.16, 1.0, "#8A96A6", { seg: 10 });
};
// the 1950s two-storey annex that stood where the pavilion is (era "will"; it was demolished for the pavilion)
const buildAnnex = (m) => {
  const W = 16, D = 12, H = 8.2;
  m.box("brick1", [0, H / 2, -D / 2], [W, H, D], "#FFFFFF", MT([0.5, 0.2]));
  m.box("trim", [0, H + 0.1, -D / 2], [W + 0.3, 0.2, D + 0.3], "#9E978B");
  for (let fl = 0; fl < 2; fl++) for (let i = 0; i < 5; i++) winUnit(m, -6 + i * 3, 1.9 + fl * 4, 1.6, 1.8, roomCell(90 + fl * 5 + i));
};
// ── THE RONALD READ PAVILION (frame: the front face z = 0, centred on x = 0) ────────────────────────────────────────────────────
const buildWing = (m) => {
  const { W, D, H, glass0 } = WING, x0 = -W / 2, x1 = W / 2, FL = 4.2, gx = (glass0 + x1) / 2, gw = x1 - glass0;
  // the brick mass (west) with slot windows
  m.box("brick0", [(x0 + glass0) / 2, H / 2, -D / 2], [glass0 - x0, H, D], "#FFFFFF", MT([0.1, 0.4]));
  for (let fl = 0; fl < 4; fl++) for (const x of [x0 + 1.4, x0 + 2.9, x0 + 4.0]) {
    const cy = fl * FL + 2.2;
    m.quad("win", [x, cy, 0.012], 0.55, 3.0, "#FFFFFF", winRect(7, fl % 2));
    m.box("alu", [x, cy + 1.53, 0.04], [0.67, 0.06, 0.08], "#2A3340"); m.box("alu", [x, cy - 1.53, 0.06], [0.7, 0.06, 0.14], "#8E97A4");
    for (const sd of [-1, 1]) m.box("alu", [x + sd * 0.3, cy, 0.04], [0.05, 3.06, 0.08], "#2A3340");
  }
  m.box("trim", [(x0 + glass0) / 2, H + 0.08, -D / 2], [glass0 - x0 + 0.2, 0.16, D + 0.2], "#7E8794");
  // the glass section: volume behind, floors 2–4 of curtain wall (OR, OR, offices), floor bands, mullions, spandrels
  m.box("dark", [gx, H / 2, -D / 2 - 0.2], [gw, H, D - 0.4], "#FFFFFF");
  const rows = [["lobby", 0], ["or", 1], ["or", 2], ["office", 3]];
  for (const [mat, fl] of rows) {
    const y0 = fl * FL;
    if (fl === 0) { m.quad("lobby", [gx, 1.95, -0.25], gw - 0.4, 3.5, "#FFFFFF", [0, 0, 1, 1]); m.quad("sheen", [gx, 1.95, -0.08], gw - 0.4, 3.5, "#FFFFFF", [0, 0, 1, 1]); continue; }
    m.box("spandrel", [gx, y0 + 0.55, -0.02], [gw, 1.1, 0.04], "#24364E");                                // spandrel glass at the floor
    m.quad(mat, [gx, y0 + 1.1 + 1.45, -0.36], gw - 0.2, 2.9, "#FFFFFF", [0, 0, 1, 1]);
    m.quad("sheen", [gx, y0 + 1.1 + 1.45, 0.0], gw - 0.2, 2.9, "#FFFFFF", [0, 0, 1, 1]);
    m.box("alu", [gx, y0 + 1.1, 0.02], [gw, 0.08, 0.12], "#2A3340");
  }
  for (let fl = 1; fl <= 4; fl++) m.box("alu", [gx, fl * FL - 0.02, 0.06], [gw + 0.1, fl === 4 ? 0.1 : 0.42, 0.24], "#AEB6C2");   // floor-line bands
  const nM = 10;
  for (let k = 0; k <= nM; k++) m.box("alu", [glass0 + k * gw / nM, FL + (H - FL - WING.band) / 2, 0.05], [0.09, H - FL - WING.band, 0.18], "#2A3340");
  // ground floor: lobby storefront, its doors, brick piers at the ends, the blade canopy on two tie rods
  for (let k = 0; k <= 6; k++) m.box("alu", [glass0 + 0.2 + k * (gw - 0.4) / 6, 1.95, -0.12], [0.08, 3.9, 0.12], "#2A3340");
  m.box("alu", [gx, 3.0, -0.12], [gw - 0.4, 0.08, 0.12], "#2A3340");
  m.box("brick0", [x1 - 0.25, H / 2, -0.1], [0.5, H, 0.4], "#FFFFFF", MT([0.1, 0.4]));
  m.box("alu", [gx + 1.5, 3.95, 1.5], [7, 0.16, 3.0], "#D9DEE6"); m.box("dark", [gx + 1.5, 3.86, 1.5], [6.9, 0.02, 2.9], "#FFFFFF");
  for (const sd of [-1, 1]) { const rx = gx + 1.5 + sd * 3.0, L = Math.hypot(2.3, 2.9); m.box("alu", [rx, 5.1, 1.45], [0.04, 0.04, L], "#C9D1DB", { r: [Math.atan2(2.3, 2.9), 0, 0] }); }
  for (let k = 0; k < 3; k++) { m.cyl("bulb", [gx + 0 + k * 1.5, 3.85, 1.6], 0.09, 0.02, "#FFF2DC", { seg: 10 }); m.glow([gx + k * 1.5, 3.78, 1.6], "#FFE4BE", 0.6); }
  m.box("trim", [gx + 1.5, 0.05, 1.2], [7, 0.1, 2.4], "#8E97A4");
  // the parapet band above the glass (the sign's ground) and the roof
  m.box("spandrel", [gx, H - WING.band / 2, 0.0], [gw + 0.1, WING.band, 0.12], "#2A323E");
  m.box("alu", [gx, H + 0.03, -0.1], [gw + 0.2, 0.08, 0.4], "#AEB6C2");
  // the rooftop louvred screen round the plant
  m.box("metal", [gx + 0.5, H + 1.0, -8], [8, 2.0, 5], "#4A5464");
  for (let k = 0; k < 20; k++) m.box("metal", [gx + 0.5, H + 0.2 + k * 0.09, -5.48], [8, 0.03, 0.06], "#7E8898", { r: [0.6, 0, 0] });
  // the east return (toward the old hospital), brick
  m.box("brick0", [x1 + 0.0, H / 2, -0.5], [0.04, H, 1.0], "#FFFFFF", MT());
};
// ── BROOKS MEMORIAL LIBRARY (frame: the glass front z = 0, centred on x = 0) ─────────────────────────────────────────────────────
const buildLibrary = (m) => {
  const { W, D, H, over } = LIB, BR = "brick1";
  for (const sd of [-1, 1]) m.box(BR, [sd * (W / 2 - 0.3), H / 2, -D / 2 + 0.3], [0.6, H, D + 0.6], "#FFFFFF", MT([0.2, 0.1]));
  m.box("dark", [0, H / 2, -D / 2 - 0.4], [W - 1.2, H, D - 0.8], "#FFFFFF");
  m.quad("libint", [0, 4.2, -0.75], W - 1.2, 8.0, "#FFFFFF", [0, 0, 1, 1]);
  for (const y of [2.15, 6.25]) m.quad("sheen", [0, y, 0.0], W - 1.2, 4.0, "#FFFFFF", [0, 0, 1, 1]);
  for (const y of [0.02, 4.3]) m.box("dark", [0, y + 0.02, -0.4], [W - 1.2, 0.04, 0.72], "#3A3530");   // the floors inside the glass
  m.box("conc", [0, 4.3, 0.02], [W - 1.2, 0.46, 0.34], "#E2DED6", MT());                                    // the floor slab's edge
  m.box("conc", [0, 0.12, 0.02], [W - 1.2, 0.24, 0.34], "#C9C4BA", MT());
  const nM = 12;
  for (let k = 0; k <= nM; k++) m.box("alu", [-(W - 1.2) / 2 + k * (W - 1.2) / nM, 4.2, 0.02], [0.08, 8.0, 0.2], "#262C34");
  for (const y of [2.95, 7.0]) m.box("alu", [0, y, 0.02], [W - 1.2, 0.06, 0.12], "#262C34");
  // the entrance (left of centre): a pair of glass doors in a heavier frame, push bars, a landing
  const dx = -4.9;
  for (const sd of [-1, 0, 1]) m.box("alu", [dx + sd * 0.95, 1.2, 0.08], [0.12, 2.4, 0.14], "#1A1F26");
  m.box("alu", [dx, 2.42, 0.08], [2.0, 0.12, 0.14], "#1A1F26");
  for (const sd of [-1, 1]) m.box("alu", [dx + sd * 0.48, 1.05, 0.13], [0.6, 0.04, 0.04], "#C9D3DE");
  m.box("trim", [dx, 0.04, 0.9], [3.4, 0.08, 1.8], "#8E97A4");
  // the roof slab with its deep overhang and fascia; soffit downlights
  m.box("conc", [0, H + 0.45, -(D - over) / 2], [W + 1.4, 0.9, D + over + 0.4], "#E6E2DA", MT([0.3, 0.6]));
  m.box("conc", [0, H + 0.95, over - 0.1], [W + 1.4, 0.1, 0.2], "#D2CDC3", MT());
  for (let k = 0; k < 7; k++) { const x = -9 + k * 3; m.cyl("bulb", [x, H - 0.01, over - 1.0], 0.12, 0.02, "#FFF2DC", { seg: 10 }); m.glow([x, H - 0.08, over - 1.0], "#FFE4BE", 0.8); }
  // planters with shrubs, the bike rack
  for (const x of [-8.2, 5.6]) {
    m.box(BR, [x, 0.35, 4.6], [3.0, 0.7, 1.0], "#FFFFFF", MT()); m.box("trim", [x, 0.72, 4.6], [3.1, 0.06, 1.1], "#B7B0A3");
    for (let k = 0; k < 6; k++) m.ico("plant", [x - 1.2 + k * 0.48, 0.92 + rnd(k + x) * 0.15, 4.6 + (rnd(k * 3 + x) - 0.5) * 0.3], [0.32, 0.28, 0.32], ["#2C4A48", "#3B5A50", "#284040"][k % 3]);
  }
  for (let k = 0; k < 4; k++) { const x = 7.6 + k * 0.6; m.cyl("metal", [x, 0.82, 1.9], 0.025, 0.4, "#5E6876", { r: [0, 0, Math.PI / 2], seg: 6 }); for (const sd of [-1, 1]) m.cyl("metal", [x + sd * 0.2, 0.42, 1.9], 0.025, 0.84, "#5E6876", { seg: 6 }); }
};
// ── the street: road, sidewalks, plazas, lawn, curbs, neighbours, furniture ───────────────────────────────────────────────────
const NORTH_E = [25, 33.2, 41.6, 49.4, 57.8, 66], NORTH_W = [-54, -62.2, -70.6, -78.4, -86.8, -95];
const SIGNS = [5, 2, 13, 4, 7, 11, 6, 15, 1, 9, 3, 12, 10, 14, 8];
const buildStreet = (m) => {
  m.box("concrete", [-15, PL / 2, -13.5], [220, PL, 33], "#8E97A6", { metric: true });
  m.box("concrete", [-15, PL / 2, 18], [220, PL, 10], "#8E97A6", { metric: true });
  for (const z of [2.93, 13.07]) m.box("trim", [-15, PL / 2 + 0.005, z], [220, PL + 0.01, 0.14], "#A3ABB6", { metric: true });
  // neighbours: north side east of the library and west of the pavilion, the whole south side
  let k = 0;
  for (const xs of [NORTH_E, NORTH_W]) xs.forEach((x, i) => {
    const w = 7.6 + rnd(i + x) * 1.2;
    m.push([x + (xs === NORTH_E ? w / 2 : -w / 2), PL, 0], 0);
    addBuilding(m, { w, h: 8.6 + Math.floor(rnd(i * 3 + x) * 3) * 2.2, d: 8, seed: 200 + k, kind: rnd(k + 5) < 0.3 ? "clap" : "brick", brick: k % 3 === 2 ? 2 : k % 2, sign: SIGNS[k % SIGNS.length], lit: 0.6 });
    m.pop(); k++;
  });
  for (let x = 72, i = 0; x > -112; i++) {
    const w = 7.2 + rnd(i * 5 + 1) * 1.8;
    m.push([x - w / 2, PL, 16], Math.PI);
    addBuilding(m, { w: w - 0.05, h: 8.6 + Math.floor(rnd(i * 7) * 3) * 2.2, d: 8, seed: 300 + i, kind: rnd(i + 9) < 0.3 ? "clap" : "brick", brick: (i + 1) % 3 === 2 ? 2 : i % 2, sign: SIGNS[(i + 6) % SIGNS.length], lit: 0.6 });
    m.pop(); x -= w; k++;
  }
  // street furniture
  const N = (x, type, z = 2.4) => ({ type, p: [x, PL, z], ry: 0 }), S = (x, type, z = 13.6) => ({ type, p: [x, PL, z], ry: Math.PI });
  addProps(m, [N(-2.5, "bench", 1.0), N(-0.5, "trash"), N(1.4, "hydrant"), N(24, "mailbox", 1.0), N(28, "planter", 1.6), N(31, "meter"), N(36, "bench", 1.0), N(-49, "sign", 2.6), N(-51, "planter", 1.6),
    N(-26, "meter"), N(-30.8, "trash"), S(-20, "bench", 14.8), S(-14, "planter", 14.2), S(-6, "news", 14.6), S(2, "hydrant"), S(10, "trash"), S(18, "bench", 14.8), S(26, "planter", 14.2), S(-32, "meter"), S(-40, "trash")]);
};
// ── R3F pieces ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
const Built = ({ build, deps = [] }) => {
  const grp = useMemo(() => { const m = new Mesher(); build(m); return m.build(setMats()); }, deps);
  return <primitive object={grp} />;
};
const metalM = new THREE.MeshStandardMaterial({ color: "#1b2636", metalness: 0.6, roughness: 0.4 });
const Lamp = ({ x, z, dir = 1 }) => (
  <group position={[x, PL, z]} rotation-y={dir > 0 ? 0 : Math.PI}>
    <mesh position={[0, 0.2, 0]} material={metalM}><cylinderGeometry args={[0.14, 0.18, 0.4, 10]} /></mesh>
    <mesh position={[0, 2.7, 0]} castShadow material={metalM}><cylinderGeometry args={[0.06, 0.1, 5.4, 10]} /></mesh>
    <mesh position={[0, 5.3, 0.55]} material={metalM}><boxGeometry args={[0.08, 0.08, 1.2]} /></mesh>
    <mesh position={[0, 5.18, 1.05]} material={metalM}><coneGeometry args={[0.32, 0.2, 14, 1, true]} /></mesh>
    <mesh position={[0, 5.1, 1.05]}><sphereGeometry args={[0.16, 14, 10]} /><meshStandardMaterial color="#FFE2B0" emissive="#FFC97A" emissiveIntensity={3} /></mesh>
    <Glow position={[0, 5.05, 1.05]} size={2.4} color="#FFC27A" opacity={0.7} />
    <LightPool position={[0, 0.03, 1.0]} r={3.4} color="#FFB867" opacity={0.26} />
  </group>
);
const Tree = ({ x, z, s = 1, i }) => (
  <group position={[x, PL, z]} scale={s} rotation-y={rnd(i) * 6}>
    <mesh position={[0, 1.4, 0]} castShadow><cylinderGeometry args={[0.14, 0.22, 2.8, 8]} /><meshStandardMaterial color="#1B2533" roughness={0.9} /></mesh>
    {[[0, 3.5, 0, 1.6], [0.9, 3.0, 0.3, 1.1], [-0.8, 3.1, -0.4, 1.2], [0.2, 4.3, -0.3, 1.0]].map(([a, b, c2, r], k) => (
      <mesh key={k} position={[a, b, c2]} castShadow><icosahedronGeometry args={[r, 2]} /><meshStandardMaterial color={k % 2 ? "#182E40" : "#1C3448"} roughness={0.95} flatShading /></mesh>
    ))}
  </group>
);
// raised letters: the lettering plane over a dark offset copy (their shadow on the wall)
export const Letters = ({ k, text, h, position, color = "#EEF2F7", emissive = 0, emissiveColor = "#FFFFFF", o = {} }) => {
  const L = useMemo(() => letters(k, text, o), [k]);
  const w = h * L.aspect;
  return (
    <group position={position}>
      <mesh position={[0.012, -0.02, -0.008]}><planeGeometry args={[w, h]} /><meshBasicMaterial map={L.tex} color="#000000" transparent opacity={0.45} depthWrite={false} /></mesh>
      <mesh><planeGeometry args={[w, h]} /><meshStandardMaterial map={L.tex} color={color} transparent alphaTest={0.4} roughness={0.35} metalness={0.4} emissive={emissiveColor} emissiveMap={L.tex} emissiveIntensity={emissive} /></mesh>
    </group>
  );
};
/** the pavilion's sign: one plane per letter, two lines; lit(i) ∈ 0..1 lights letter i (counted over both lines, spaces skipped) */
export const PavilionSign = ({ lit }) => {
  const parts = useMemo(() => {
    const size = SIGN.cap / 0.72, out = []; let n = 0;
    SIGN_LINES.forEach((t, li) => {
      const adv = advances(t, { weight: 700, track: 0.1 });
      const total = adv.reduce((a, b) => a + b, 0) * size;
      let x = SIGN.cx - total / 2;
      [...t].forEach((ch, i) => { const w = adv[i] * size, c = x + w / 2; x += w; if (ch !== " ") out.push({ ch, i: n++, x: c, y: SIGN.y[li], L: letters("pav_" + ch, ch, { px: 200, weight: 700, track: 0, pad: 0.12 }) }); });
    });
    return out;
  }, []);
  const h = (SIGN.cap / 0.72) * 1.24;
  return (
    <group>
      {parts.map((p) => {
        const k = lit(p.i);
        return (
          <group key={p.i} position={[p.x, p.y, SIGN.z + 0.07]}>
            <mesh><planeGeometry args={[h * p.L.aspect, h]} /><meshStandardMaterial map={p.L.tex} color="#1E242C" transparent alphaTest={0.4} roughness={0.6} metalness={0.15} envMapIntensity={0.3} emissive="#F4F8FF" emissiveMap={p.L.tex} emissiveIntensity={1.9 * k} /></mesh>
            {k > 0.01 && <Glow position={[0, 0, 0.12]} size={1.1} color="#CFE2FA" opacity={0.25 * k} />}
          </group>
        );
      })}
    </group>
  );
};
export const signLetterCount = () => SIGN_LINES.join("").replace(/ /g, "").length;
/** the Brattleboro set. era: "will" (2015: the old annex) or "pav" (2023: the Ronald Read Pavilion stands) */
export const BrattSet = ({ era = "will" }) => {
  const tx = useMemo(() => {
    const asp = asphaltTex(); asp.repeat.set(40, 2);
    const pav = paverTex(); pav.repeat.set(6, 3);
    const pav2 = paverTex().clone(); pav2.needsUpdate = true; pav2.repeat.set(5, 1.5);
    const lawn = lawnTex(); lawn.repeat.set(3, 4);
    return { asp, pav, pav2, lawn, hs: hospitalSignTex(), ls: librarySignTex(), br: bookReturnTex(), h: hSignTex() };
  }, []);
  return (
    <group>
      <Sky />
      {/* the hills round Brattleboro: dark wooded ridges against the horizon glow */}
      {[[-140, -170, 110, 34], [10, -200, 150, 46], [160, -160, 90, 30], [-120, 190, 130, 40], [90, 210, 140, 52]].map(([x, z, r, hh], i) => (
        <mesh key={i} position={[x, -4, z]} scale={[r, hh, r * 0.45]}><sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshBasicMaterial color={i % 2 ? "#0A1A2E" : "#0C1D33"} fog={false} /></mesh>
      ))}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.03, 0]} receiveShadow><planeGeometry args={[500, 500]} /><meshStandardMaterial color="#0d2238" roughness={0.95} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[-15, 0.0, 8]} receiveShadow><planeGeometry args={[220, 10]} /><meshStandardMaterial map={tx.asp} color="#7a8aa3" roughness={0.32} metalness={0.15} /></mesh>
      {[-0.08, 0.08].map((d) => <mesh key={d} rotation-x={-Math.PI / 2} position={[-15, 0.006, 8 + d]}><planeGeometry args={[220, 0.1]} /><meshStandardMaterial color="#E8C766" emissive="#6b5520" emissiveIntensity={0.3} roughness={0.5} /></mesh>)}
      {[3.9, 12.1].map((z) => <mesh key={z} rotation-x={-Math.PI / 2} position={[-15, 0.006, z]}><planeGeometry args={[220, 0.1]} /><meshStandardMaterial color="#C9D3DE" roughness={0.5} /></mesh>)}
      {/* the hospital forecourt and the library plaza (pavers), the lawn between them */}
      <mesh rotation-x={-Math.PI / 2} position={[HOSP.x, PL + 0.004, -5]} receiveShadow><planeGeometry args={[HOSP.W, 10]} /><meshStandardMaterial map={tx.pav} color="#7F8CA0" roughness={0.45} metalness={0.1} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[LIB.x, PL + 0.004, -3]} receiveShadow><planeGeometry args={[LIB.W, 6]} /><meshStandardMaterial map={tx.pav2} color="#7F8CA0" roughness={0.45} metalness={0.1} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[-1, PL + 0.004, -12]} receiveShadow><planeGeometry args={[8, 23]} /><meshStandardMaterial map={tx.lawn} color="#8FA2BC" roughness={0.95} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[-50.5, PL + 0.004, -12]} receiveShadow><planeGeometry args={[7, 23]} /><meshStandardMaterial map={tx.lawn} color="#8FA2BC" roughness={0.95} /></mesh>
      <Built build={buildStreet} />
      <group position={[HOSP.x, PL, HOSP.z]}><Built build={buildHospital} /></group>
      <group position={[LIB.x, PL, LIB.z]}><Built build={buildLibrary} /></group>
      {era === "pav"
        ? <group position={[WING.x, PL, WING.z]}><Built build={buildWing} /></group>
        : <group position={[WING.x + 1, PL, WING.z - 1]}><Built build={buildAnnex} /></group>}
      {/* the hospital's name on the canopy fascia (lit letters), the library's name on its fascia */}
      <Letters k="bmh_canopy" text="BRATTLEBORO MEMORIAL HOSPITAL" h={0.3} position={[HOSP.x, PL + 3.92, HOSP.z + 4.21]} color="#F4F7FB" emissive={0.9} o={{ px: 140, weight: 700, track: 0.06 }} />
      <Letters k="brooks_fascia" text="BROOKS MEMORIAL LIBRARY" h={0.56} position={[LIB.x + 1.5, PL + LIB.H + 0.42, LIB.z + LIB.over + 0.21]} color="#E8E2D2" emissive={0.18} emissiveColor="#FFE8C4" o={{ px: 160, weight: 500, track: 0.14 }} />
      {/* monument signs: stone panels on brick bases */}
      {[[tx.hs, [-6.2, PL, -1.2], 0.55], [tx.ls, [14.4, PL, -4.8], 0.3]].map(([t, p, ry], i) => (
        <group key={i} position={p} rotation-y={ry}>
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow><boxGeometry args={[2.9, 0.8, 0.6]} /><meshStandardMaterial color={i ? "#5A3E30" : "#7A3A2C"} roughness={0.9} /></mesh>
          <mesh position={[0, 1.38, 0]} castShadow><boxGeometry args={[2.7, 1.16, 0.32]} /><meshStandardMaterial color="#CFC9BC" roughness={0.7} /></mesh>
          <mesh position={[0, 1.38, 0.161]}><planeGeometry args={[2.62, 0.98]} /><meshStandardMaterial map={t} roughness={0.6} emissiveMap={t} emissive="#FFFFFF" emissiveIntensity={0.12} /></mesh>
          <mesh position={[0, 2.0, 0]}><boxGeometry args={[2.86, 0.08, 0.4]} /><meshStandardMaterial color="#9E978B" roughness={0.7} /></mesh>
          <LightWash position={[0, 1.3, 0.3]} w={3.2} h={1.8} color="#FFE2B8" opacity={0.18} />
        </group>
      ))}
      {/* the blue H sign by the forecourt, the library's BOOK RETURN box */}
      <group position={[-4.2, PL, 1.6]} rotation-y={0.3}>
        <mesh position={[0, 1.3, 0]}><cylinderGeometry args={[0.04, 0.04, 2.6, 8]} /><meshStandardMaterial color="#8A96A6" metalness={0.7} roughness={0.4} /></mesh>
        <mesh position={[0, 2.45, 0.03]}><planeGeometry args={[0.6, 0.6]} /><meshStandardMaterial map={tx.h} roughness={0.4} /></mesh>
      </group>
      <group position={[LIB.x - 2.6, PL, LIB.z + 1.6]} rotation-y={0.35}>
        <mesh position={[0, 0.62, 0]} castShadow><boxGeometry args={[0.9, 1.1, 0.75]} /><meshStandardMaterial color="#24476E" roughness={0.45} metalness={0.4} /></mesh>
        <mesh position={[0, 1.2, 0]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.375, 0.375, 0.9, 16, 1, false, 0, Math.PI]} /><meshStandardMaterial color="#24476E" roughness={0.45} metalness={0.4} /></mesh>
        <mesh position={[0, 0.76, 0.376]}><planeGeometry args={[0.86, 0.43]} /><meshStandardMaterial map={tx.br} roughness={0.45} /></mesh>
        <mesh position={[0, 0.04, 0]}><boxGeometry args={[0.96, 0.08, 0.8]} /><meshStandardMaterial color="#16222F" /></mesh>
      </group>
      {/* lamps both sides of the street, trees on the lawns and along the sidewalk */}
      {[-104, -90, -76, -62, -48, -34, -20, -6, 8, 22, 36, 50, 64].map((x) => <Lamp key={"n" + x} x={x} z={2.55} dir={1} />)}
      {[-97, -83, -69, -55, -41, -27, -13, 1, 15, 29, 43, 57].map((x) => <Lamp key={"s" + x} x={x} z={13.45} dir={-1} />)}
      {[[-1.0, -12, 1.25], [-3.0, -17, 1.5], [1.4, -20, 1.3], [-49, -4, 1.3], [-52, -12, 1.5], [24.5, -3.2, 1.0]].map(([x, z, s], i) => <Tree key={i} x={x} z={z} s={s} i={i} />)}
      {/* the hospital's light on its forecourt, the library's warm glow on its plaza, the canopy */}
      <LightPool position={[HOSP.x, PL + 0.02, HOSP.z + 3.5]} r={5} sx={1.3} color="#FFE2B8" opacity={0.3} />
      <LightPool position={[LIB.x, PL + 0.02, LIB.z + 2.6]} r={6} sx={1.7} sz={0.6} color="#FFD6A0" opacity={0.28} />
      <LightWash position={[LIB.x, PL + 4.2, LIB.z + 0.4]} w={22} h={9} color="#FFE2B8" opacity={0.06} />
      <LightWash position={[HOSP.x, PL + 8, HOSP.z + 0.3]} w={26} h={16} color="#BFD6FF" opacity={0.1} />
      {era === "pav" && <LightPool position={[WING.x + 4, PL + 0.02, WING.z + 2.5]} r={5} sx={1.4} color="#E6F0FF" opacity={0.26} />}
    </group>
  );
};
