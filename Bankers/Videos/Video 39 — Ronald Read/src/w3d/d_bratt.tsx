// @ts-nocheck
// ★ V39 builder D — BRATTLEBORO, VERMONT at blue hour, in snow: ONE street set shared by the `will` and `pavilion` stations
//   (origin [2400,0,0]). Main Street runs along x (the road z 3…13, sidewalks both sides), the north side (z < 3) carries, west to east:
//   · the RONALD READ PAVILION (era "pav" only): the hospital's 4-storey modern wing — a red-brick mass with framed slot windows, a
//     glass curtain wall (mullions with caps, spandrel panels at every floor, the floor slabs and lit ceilings seen through the glass,
//     partitions, the operating-room and office floors behind), a glass lobby under a blade canopy (soffit lights, tie rods), the
//     parapet band with the per-letter sign RONALD READ PAVILION (PavilionSign), a louvred rooftop screen, landscaped beds (granite
//     edges, snowy spruces, bollard lights, a bench). In era "will" (2015) the site holds the old two-storey annex it replaced.
//   · BRATTLEBORO MEMORIAL HOSPITAL: a 4-storey red-brick block built as real masonry — the walls are piers and spandrels round
//     RECESSED windows (brick reveals; casings, meeting rails, mullions, glass with the sky's reflection over furnished lit rooms behind
//     blinds), soldier-course brick lintels upstairs, stone lintels with keystones and projecting stone sills (drips) downstairs, a
//     dressed-stone base, brick pilasters, a belt course, a cornice with modillions and dentils, downspouts with conductor heads, wall
//     sconces; the entrance recess (storefront, sliding doors, lobby), the flat canopy (fascia, soffit grid, downlights, columns) with
//     the name in lit letters; a monument sign, the blue H sign, the forecourt. Snow on every sill, lintel, cornice and the roof.
//   · a snow-covered lawn with bare sugar maples and snowy spruces (d_trees.tsx), then BROOKS MEMORIAL LIBRARY (the real 1967 building:
//     brick and concrete, a glass-sheathed front, a flat roof with a deep overhang): brown-brick end walls with stone coping, two
//     floors of real book stacks seen through the glass (double-faced ranges with spines, range-end cards, reading tables with lamps,
//     ceiling light rows, the stacks texture on the back wall), the floor slab, the overhang's fascia lettered BROOKS MEMORIAL LIBRARY,
//     soffit downlights, a monument sign, granite planters with spruces, the BOOK RETURN box, a bike rack — snow on all of it.
//   · then rows of brick and clapboard commercial blocks (the town kit) on both sides; granite curbs, plowed snowbanks in the gutters,
//     the asphalt road (wheel paths, sealed cracks, a patch, the double yellow line, parking-lane lines, one crosswalk), cast-iron
//     post lamps, benches, a hydrant, litter cans, planters; the hills beyond, the sky.
//   Local metres, y up; PL = the sidewalk / plaza top.
import React, { useMemo } from "react";
import * as THREE from "three";
import { rnd, Sky, Glow } from "./kit";
import { Mesher, townMats, addBuilding, addProps, winRect } from "./town_parts";
import { LightPool, LightWash } from "./d_fx";
import { letters, advances, lobbyTex, libInteriorTex, orTex, officeTex, hospitalSignTex, librarySignTex, bookReturnTex, hSignTex, concreteTex, paverTex, sheenTex,
  soldierTex, stoneTex, snowTex, bankTex, spinesTex, rangeEndTex, roadTex } from "./d_bratt_tex";
import { treeMats, addMaple, addSpruce } from "./d_trees";
import { hospMats, hRoom, hLobby, blind, roomKind, LD, LW } from "./d_hosp";
import { addLamp, addBench, addHydrant, addTrash, addPlanterBox, addSnowbank, addCurb, snowLedge, mound, LAMP_ARM } from "./d_street";

export const PL = 0.15;
export const HOSP = { x: -17, z: -10, W: 24, D: 16, H: 15.6 };
export const LIB = { x: 13, z: -6, W: 20, D: 22, H: 8.4, over: 2.6 };
export const WING = { x: -38, z: -9, W: 18, D: 14, H: 18.6, glass0: -4, band: 1.8 };
// where the money stands (station-local): 8 pallets of $600,000 at the hospital (4 × 2), 2 at the library, the budget block beside them
// rev style: the pallets stand as one block (shrink-wrap gaps only), so the bequest's wrapper band runs round all of them
export const HOSP_PALLETS = [0, 1, 2, 3].flatMap((i) => [-4.42, -3.38].map((z) => [HOSP.x + (i - 1.5) * 1.22, PL, z]));
export const HOSP_BLOCK = { c: [HOSP.x, -3.9], w: 3 * 1.22 + 1.092, d: 1.04 + 0.99 };
export const LIB_PALLETS = [[14.6, PL, -2.2], [15.82, PL, -2.2]];
export const LIB_BLOCK = { c: [15.21, -2.2], w: 1.22 + 1.092, d: 0.99 };
export const GHOST = [12.75, PL, -2.2];
// the pavilion sign: two lines on the parapet band over the glass (local), cap height
export const SIGN_LINES = ["RONALD READ", "PAVILION"];
export const SIGN = { y: [WING.H - 0.55, WING.H - 1.3], z: WING.z + 0.06, cap: 0.45, cx: WING.x + (WING.glass0 + WING.W / 2) / 2 };

// ── materials (the town kit's, the trees', plus the set's own glazing, masonry, snow, books) ─────────────────────────────────────
let DM = null;
const setMats = () => {
  if (DM) return DM;
  const T = townMats();
  const em = (map, I, extra = {}) => new THREE.MeshStandardMaterial({ map, emissiveMap: map, emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: I, roughness: 0.12, metalness: 0.2, envMapIntensity: 0.7, ...extra });
  const conc = concreteTex(); conc.repeat.set(0.25, 0.25);
  const sn = snowTex(); sn.repeat.set(0.5, 0.5);
  const st = stoneTex(); st.repeat.set(0.8, 0.8);
  const gr = stoneTex().clone(); gr.needsUpdate = true; gr.repeat.set(1.5, 1.5);
  const sp = spinesTex();
  DM = {
    ...T, ...treeMats(), ...hospMats(),
    lobby: em(lobbyTex(), 0.5, { color: "#9FB0C8" }), libint: em(libInteriorTex(), 0.5, { color: "#A9B8D0" }), or: em(orTex(), 0.72, { color: "#A9B8D0" }), office: em(officeTex(), 0.5, { color: "#A9B8D0" }),
    conc: new THREE.MeshStandardMaterial({ map: conc, color: "#FFFFFF", roughness: 0.85, vertexColors: true }),
    alu: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.32, metalness: 0.75, vertexColors: true, envMapIntensity: 0.9 }),
    spandrel: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.14, metalness: 0.55, vertexColors: true, envMapIntensity: 1.1 }),
    dark: new THREE.MeshStandardMaterial({ color: "#0C1420", roughness: 0.8, vertexColors: true }),
    soldier: new THREE.MeshStandardMaterial({ map: soldierTex(), color: "#FFFFFF", roughness: 0.9, vertexColors: true }),
    stone: new THREE.MeshStandardMaterial({ map: st, color: "#FFFFFF", roughness: 0.78, vertexColors: true }),
    granite: new THREE.MeshStandardMaterial({ map: gr, color: "#FFFFFF", roughness: 0.6, metalness: 0.05, vertexColors: true }),
    snow: new THREE.MeshStandardMaterial({ map: sn, color: "#D2DCEA", roughness: 0.8, vertexColors: true, envMapIntensity: 0.55 }),
    bank: new THREE.MeshStandardMaterial({ map: bankTex(), color: "#AEB9CA", roughness: 0.9, vertexColors: true, envMapIntensity: 0.4 }),
    iron: new THREE.MeshStandardMaterial({ color: "#1A222C", roughness: 0.42, metalness: 0.6, vertexColors: true, envMapIntensity: 0.9 }),
    wood: new THREE.MeshStandardMaterial({ color: "#6B4A36", roughness: 0.7, vertexColors: true }),
    lampglass: new THREE.MeshStandardMaterial({ color: "#FFE2B0", emissive: new THREE.Color("#FFC97A"), emissiveIntensity: 2.6, roughness: 0.2, vertexColors: true }),
    lamp: new THREE.MeshBasicMaterial({ color: "#FFFFFF", toneMapped: false, vertexColors: true }),
    spines: new THREE.MeshStandardMaterial({ map: sp, emissiveMap: sp, emissive: new THREE.Color("#FFE6C0"), emissiveIntensity: 0.42, roughness: 0.8, vertexColors: true }),
    rangeEnd: new THREE.MeshStandardMaterial({ map: rangeEndTex(), emissive: new THREE.Color("#3A2A1A"), emissiveIntensity: 0.5, roughness: 0.7 }),
    interior: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.85, vertexColors: true, emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 0.0 }),
    lit: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.8, vertexColors: true, emissive: new THREE.Color("#5A4A38"), emissiveIntensity: 1.0 })
  };
  for (const k of ["lobby", "libint", "or", "office", "lamp", "lampglass", "spines", "rangeEnd", "lit"]) DM[k].userData.cast = false;
  DM.sheen = new THREE.MeshBasicMaterial({ map: sheenTex(), transparent: true, depthWrite: false, vertexColors: true });
  DM.sheen.userData = { cast: false, recv: false, order: 3 };
  DM.sheenL = new THREE.MeshBasicMaterial({ map: sheenTex(), transparent: true, opacity: 0.55, depthWrite: false, vertexColors: true });   // lighter glass over the 3-D rooms
  DM.sheenL.userData = { cast: false, recv: false, order: 3 };
  return DM;
};
const MT = (uo = [0, 0]) => ({ metric: true, uo });

// ── masonry helpers ───────────────────────────────────────────────────────────────────────────────────────────────────────────
/** a wall layer from x0..x1, y0..y1, its face at z0, `dep` deep, with rectangular HOLES {x0,x1,y0,y1} (windows, doors): built as the
 *  piers and spandrels round them (a grid decomposition, runs merged), so every opening has real reveals */
const skin = (m, mat, col, x0, x1, y0, y1, z0, dep, holes, uo = [0, 0]) => {
  const H = holes.map((h) => ({ x0: Math.max(x0, h.x0), x1: Math.min(x1, h.x1), y0: Math.max(y0, h.y0), y1: Math.min(y1, h.y1) })).filter((h) => h.x1 > h.x0 && h.y1 > h.y0);
  const xs = [...new Set([x0, x1, ...H.flatMap((h) => [h.x0, h.x1])])].sort((a, b) => a - b);
  const ys = [...new Set([y0, y1, ...H.flatMap((h) => [h.y0, h.y1])])].sort((a, b) => a - b);
  for (let j = 0; j + 1 < ys.length; j++) {
    const cy = (ys[j] + ys[j + 1]) / 2; let run = null;
    const flush = (xe) => { if (run !== null && xe > run) m.box(mat, [(run + xe) / 2, cy, z0 - dep / 2], [xe - run, ys[j + 1] - ys[j], dep], col, MT(uo)); run = null; };
    for (let i = 0; i + 1 < xs.length; i++) {
      const cx = (xs[i] + xs[i + 1]) / 2, solid = !H.some((h) => cx > h.x0 && cx < h.x1 && cy > h.y0 && cy < h.y1);
      if (solid && run === null) run = xs[i];
      if (!solid) flush(xs[i]);
    }
    flush(xs[xs.length - 1]);
  }
};
const hole = (x, cy, w, h) => ({ x0: x - w / 2, x1: x + w / 2, y0: cy - h / 2, y1: cy + h / 2 });
const STONE = "#D9D2C4", STONE2 = "#C7BFB0";
/** a window set in a recessed opening (face at z = 0, the opening RECESS deep): glazing (a lit or dark room from the town atlas), the
 *  sky's reflection, casing, meeting rail (and a mullion), a projecting stone sill with its drip, a lintel (soldier course or stone
 *  with a keystone), snow on the sill and the lintel */
const RECESS = 0.16;
const winUnit = (m, x, cy, ww, wh, cell, o = {}) => {
  const zg = -RECESS + 0.01, fc = o.frame ?? "#D6D2C8";
  if (!o.open) m.quad("win", [x, cy, zg], ww, wh, "#FFFFFF", winRect(cell[0], cell[1]));   // open: real 3-D room behind (d_hosp)
  else if (o.blind > 0) blind(m, o.L, x, cy, ww, wh, o.blind);
  m.quad(o.open ? "sheenL" : "sheen", [x, cy, zg + 0.012], ww, wh, "#FFFFFF", [0, 0, 1, 1]);
  for (const sd of [-1, 1]) m.box("trim", [x + sd * (ww / 2 - 0.035), cy, zg + 0.03], [0.07, wh, 0.07], fc);
  for (const sd of [-1, 1]) m.box("trim", [x, cy + sd * (wh / 2 - 0.035), zg + 0.03], [ww - 0.14, 0.07, 0.07], fc);
  m.box("trim", [x, cy, zg + 0.035], [ww - 0.1, 0.05, 0.05], fc);
  if (o.mull) m.box("trim", [x, cy, zg + 0.035], [0.05, wh - 0.1, 0.05], fc);
  const sy = cy - wh / 2;
  m.box("stone", [x, sy - 0.045, 0.0], [ww + 0.24, 0.09, RECESS * 2 + 0.1], STONE, MT());
  m.box("stone", [x, sy - 0.1, 0.04], [ww + 0.18, 0.03, 0.2], STONE2, MT());
  snowLedge(m, x, sy, 0.05, ww + 0.16, 0.22, 0.05);
  if (o.lintel === "soldier") {
    m.box("soldier", [x, cy + wh / 2 + 0.1, 0.008], [ww + 0.36, 0.2, 0.03], o.sc ?? "#E6E0E2", { metric: true, uo: [0, -(cy + wh / 2)] });
  } else if (o.lintel !== "none") {
    const ly = cy + wh / 2 + 0.13;
    m.box("stone", [x, ly, 0.03], [ww + 0.36, 0.26, 0.08], STONE, MT());
    m.box("stone", [x, ly + 0.01, 0.075], [0.2, 0.3, 0.03], STONE2, MT());
    snowLedge(m, x, ly + 0.13, 0.035, ww + 0.3, 0.07, 0.035);
  }
};
// a hospital room window: lit behind blinds (cool or warm) or dark
const roomCell = (i) => { const r = rnd(i * 7.7 + 3); return r < 0.34 ? [7, r < 0.17 ? 0 : 1] : r < 0.56 ? [3, 1] : r < 0.7 ? [2, 0] : [2 + Math.floor(rnd(i) * 2), 2]; };
/** a downspout with its conductor head, from the eave at yTop to the ground (frame: wall face z = 0) */
const downspout = (m, x, yTop, z = 0.1) => {
  m.box("metal", [x, yTop - 0.2, z + 0.06], [0.3, 0.3, 0.22], "#3E3A36");
  m.cyl("metal", [x, yTop / 2, z + 0.04], 0.055, yTop - 0.3, "#3E3A36", { seg: 10 });
  for (let y = 1.5; y < yTop - 0.5; y += 2.2) m.box("metal", [x, y, z + 0.0], [0.16, 0.04, 0.1], "#2E2A26");
  m.cyl("metal", [x, 0.12, z + 0.14], 0.06, 0.24, "#3E3A36", { r: [0.7, 0, 0], seg: 10 });
  mound(m, "snow", [x, 0, z + 0.2], [0.35, 0.1, 0.3]);
};
/** a wall sconce (a small lantern on a backplate, its glow) */
const sconce = (m, x, y, z = 0) => {
  m.box("iron", [x, y, z + 0.03], [0.14, 0.24, 0.05], "#FFFFFF");
  m.box("iron", [x, y + 0.02, z + 0.12], [0.04, 0.04, 0.16], "#FFFFFF");
  m.cyl("lampglass", [x, y - 0.04, z + 0.2], 0.08, 0.2, "#FFFFFF", { seg: 10 });
  m.cyl("iron", [x, y + 0.08, z + 0.2], 0.11, 0.05, "#FFFFFF", { rt: 0.4, rb: 1, seg: 10 });
  m.glow([x, y - 0.04, z + 0.24], "#FFD49A", 0.9);
};

// ── BRATTLEBORO MEMORIAL HOSPITAL (frame: the front face z = 0 facing +z, centred on x = 0) ─────────────────────────────────────
const BRC = "#C4C2CC";   // the red brick's tint at blue hour
const FLOORS = [4.2, 8.0, 11.8];
const buildHospital = (m) => {
  const { W, D, H } = HOSP, BR = "brick0", uo = [0.3, 0.1];
  const ENT = { x0: -3.85, x1: 3.85, y0: 0, y1: 3.8 };
  const upper = FLOORS.flatMap((fy, fl) => [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ x: -10.5 + i * 3, cy: fy + 1.85, w: 1.35, h: 2.0, cell: roomCell(fl * 8 + i) })));
  const ground = [-11, -8.4, -5.9, 5.9, 8.4, 11].map((x) => ({ x, cy: 2.15, w: 1.5, h: 2.2, cell: roomCell(40 + x * 3) }));
  // the core behind the rooms, the west and back walls, the fill over the top-floor ceilings, the entrance recess's side walls
  const XE = W / 2 - 0.25, XC = 8.0, ZR = -4.2, ZB = -D + 0.25, TOP = FLOORS[2] + 3.56;
  const core = (x0, x1, y0, y1, z0, z1) => m.box(BR, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], [x1 - x0, y1 - y0, z0 - z1], BRC, MT(uo));
  const LX = LW + 0.1, LZ = -LD - 0.1, LY = 3.98;   // the lobby's volume is kept out of the core
  core(-XE, -LX, 0, H, ZR, ZB); core(LX, XC, 0, H, ZR, ZB); core(-LX, LX, 0, H, LZ, ZB); core(-LX, LX, LY, H, ZR, LZ);
  m.box(BR, [-W / 2 + 0.125, H / 2, (-0.25 - D) / 2], [0.25, H, D - 0.25], BRC, MT(uo));
  m.box(BR, [0, H / 2, -D + 0.125], [W, H, 0.25], BRC, MT(uo));
  m.box(BR, [0, (TOP + H) / 2, (-0.25 + ZR) / 2], [2 * XE, H - TOP, -0.25 - ZR], BRC, MT(uo));
  m.box(BR, [(XC + XE) / 2, (TOP + H) / 2, (ZR + ZB) / 2], [XE - XC, H - TOP, ZR - ZB], BRC, MT(uo));
  for (const sd of [-1, 1]) m.box(BR, [sd * (3.85 + 0.375), 1.9, -0.485], [0.75, 3.8, 0.47], BRC, MT(uo));
  // the rooms behind the windows (real 3-D interiors, d_hosp): upper floors 3 m bays, the ground floor either side of the lobby
  const room = (x0, x1, y0, ch, k, o = {}) => { m.push([0, y0, 0], 0); m.push([(x0 + x1) / 2, 0, 0], 0); hRoom(m, { xl: (x1 - x0) / 2, xr: (x1 - x0) / 2, d: -ZR, ch, ...k, ...o }); m.pop(); m.pop(); };
  const kinds = {};
  upper.forEach((w, i) => { const k = (kinds["u" + i] = roomKind(i + 3)); room(Math.max(-XE, w.x - 1.5), Math.min(XE, w.x + 1.5), w.cy - 1.85, 3.5, k, { openR: w.x + 1.5 > XE }); });
  const gB = [[-XE, -9.7], [-9.7, -7.15], [-7.15, -4.6], [4.6, 7.15], [7.15, 9.7], [9.7, XE]];
  ground.forEach((w, i) => { const r = rnd(i * 2.7 + 5); const k = (kinds["g" + i] = { L: r < 0.25 ? "rmD" : r < 0.65 ? "rmW" : "rmC", kind: rnd(i * 4.1) < 0.5 ? "station" : "office", seed: 70 + i }); room(gB[i][0], gB[i][1], 0, 3.85, k, { openR: i === 5 }); });
  m.push([0, 0, 0], 0); hLobby(m); m.pop();
  const holes = [ENT, ...[...upper, ...ground].map((w) => hole(w.x, w.cy, w.w, w.h))];
  skin(m, "stone", "#CFC8BA", -W / 2 - 0.04, W / 2 + 0.04, 0, 0.9, 0.04, 0.29, holes);
  for (const sd of [-1, 1]) m.box("stone", [sd * (W / 2 + 0.06 + 3.85) / 2, 0.92, 0.02], [W / 2 + 0.06 - 3.85, 0.06, 0.34], STONE2, MT());   // the water table (stopped at the entrance: it ran across the doors)
  skin(m, BR, BRC, -W / 2, W / 2, 0.9, H, 0, 0.25, holes, uo);
  // belt course over the ground floor, the cornice (frieze, modillions, dentils, crown), the coping
  const band = (y, h, out, c = "#B7B0A3") => m.box("stone", [0, y, -D / 2], [W + 2 * out, h, D + 2 * out], c, MT());
  band(4.25, 0.24, 0.07); snowLedge(m, 0, 4.37, 0.02, W + 0.1, 0.12, 0.04);
  band(H - 0.5, 0.55, 0.05, "#C9C1B3"); band(H - 0.16, 0.12, 0.16, STONE); band(H + 0.12, 0.24, 0.24, "#BDB5A7");
  for (let i = 0; i < 31; i++) m.box("stone", [-W / 2 + 0.3 + i * (W - 0.6) / 30, H - 0.07, 0.2], [0.14, 0.2, 0.3], STONE, MT());   // modillions
  for (let i = 0; i < 60; i++) m.box("stone", [-W / 2 + 0.2 + i * (W - 0.4) / 59, H - 0.3, 0.1], [0.08, 0.1, 0.1], STONE2, MT());  // dentils
  m.box("soldier", [0, H - 0.9, 0.006], [W, 0.2, 0.02], "#E6E0E2", { metric: true, uo: [0, -(H - 1.0)] });                       // a soldier band under the frieze
  snowLedge(m, 0, H + 0.24, 0.0, W + 0.4, 0.5, 0.08);
  m.box("roof", [0, H + 0.01, -D / 2], [W - 0.3, 0.04, D - 0.3], "#FFFFFF", { metric: true });
  m.box("snow", [0, H + 0.1, -D / 2], [W - 0.4, 0.16, D - 0.4], "#FFFFFF", MT());
  // brick pilasters (corners and the centre bay) with stone caps
  for (const x of [-W / 2 + 0.25, W / 2 - 0.25, -3.0, 3.0]) { m.box(BR, [x, (4.37 + H - 0.78) / 2, 0.08], [0.5, H - 0.78 - 4.37, 0.16], BRC, MT(uo)); m.box("stone", [x, H - 0.72, 0.12], [0.62, 0.12, 0.26], STONE, MT()); }
  // the windows
  const bl = (i, L) => (L === "rmD" ? 0.92 : rnd(i * 9.1 + 2) < 0.45 ? 0.25 + rnd(i * 3.7) * 0.4 : 0);
  upper.forEach((w, i) => winUnit(m, w.x, w.cy, w.w, w.h, w.cell, { lintel: "soldier", open: true, L: kinds["u" + i].L, blind: bl(i, kinds["u" + i].L) }));
  ground.forEach((w, i) => winUnit(m, w.x, w.cy, w.w, w.h, w.cell, { lintel: "stone", mull: true, open: true, L: kinds["g" + i].L, blind: bl(i + 40, kinds["g" + i].L) }));
  // the entrance recess: lobby behind, a storefront with sliding doors, its floor, ceiling and downlights
  m.quad("sheen", [0, 1.9, -0.66], 7.6, 3.6, "#FFFFFF", [0, 0, 1, 1]);
  m.box("trim", [0, 0.03, -0.36], [7.7, 0.06, 0.72], "#8E97A4");
  m.box("dark", [0, 3.78, -0.36], [7.7, 0.04, 0.72], "#2A3340");
  for (const x of [-2.4, 0, 2.4]) { m.cyl("lamp", [x, 3.75, -0.35], 0.08, 0.02, "#FFF2DC", { seg: 10 }); }
  for (let k = 0; k <= 5; k++) m.box("alu", [-3.5 + k * 1.4, 1.8, -0.68], [0.08, 3.5, 0.12], "#2A3340");
  m.box("alu", [0, 2.6, -0.68], [7.1, 0.1, 0.12], "#2A3340"); m.box("alu", [0, 0.09, -0.68], [7.1, 0.12, 0.14], "#2A3340"); m.box("alu", [0, 3.52, -0.68], [7.1, 0.12, 0.14], "#2A3340");
  for (const sd of [-1, 1]) { m.box("alu", [sd * 0.72, 1.3, -0.6], [0.06, 2.5, 0.06], "#3A4554"); m.box("alu", [sd * 0.36, 0.12, -0.6], [0.68, 0.18, 0.05], "#9AA6B4"); }   // the door leaves' stiles and kick plates
  m.box("dark", [0, 2.78, -0.6], [0.5, 0.12, 0.1], "#1A222C"); m.box("lamp", [0, 2.76, -0.545], [0.06, 0.03, 0.01], "#7FE0A0");      // the door sensor
  m.box("trim", [0, 0.07, 0.6], [8.6, 0.14, 1.6], "#8E97A4");                                          // the entrance landing
  m.box("dark", [0, 0.145, 0.75], [2.2, 0.01, 1.2], "#2A3038");                                        // the walk-off mat
  for (const sd of [-1, 1]) sconce(m, sd * 4.6, 2.9);
  // canopy: slab with an aluminium fascia (the letters go on its face), fascia trims, soffit grid and downlights, columns
  m.box("alu", [0, 3.92, 2.05], [9.2, 0.5, 4.3], "#D9DEE6"); m.box("dark", [0, 3.66, 2.05], [9.0, 0.02, 4.1], "#FFFFFF");
  for (const y of [3.69, 4.15]) m.box("alu", [0, y, 4.22], [9.24, 0.04, 0.04], "#AEB6C2");
  for (let k = -4; k <= 4; k++) m.box("alu", [k, 3.645, 2.05], [0.02, 0.01, 4.0], "#8E97A4");
  for (let k = 0; k < 4; k++) m.box("alu", [0, 3.645, 0.4 + k * 1.1], [8.9, 0.01, 0.02], "#8E97A4");
  snowLedge(m, 0, 4.17, 2.05, 9.0, 4.1, 0.12);
  for (const sd of [-1, 1]) {
    m.cyl("alu", [sd * 4.1, 1.84, 3.7], 0.14, 3.68, "#C9D1DB", { seg: 16 }); m.cyl("alu", [sd * 4.1, 0.04, 3.7], 0.24, 0.08, "#8E97A4", { seg: 16 });
    m.cyl("alu", [sd * 4.1, 3.6, 3.7], 0.2, 0.08, "#AEB6C2", { seg: 16 }); mound(m, "snow", [sd * 4.1, 0.0, 3.7], [0.45, 0.12, 0.45]);
  }
  for (let k = 0; k < 4; k++) for (const z of [0.9, 2.9]) { m.cyl("bulb", [-3 + k * 2, 3.64, z], 0.1, 0.02, "#FFF2DC", { seg: 10 }); m.glow([-3 + k * 2, 3.55, z], "#FFE4BE", 0.7); }
  downspout(m, -W / 2 + 0.2, H - 0.5, 0.0); downspout(m, W / 2 - 0.2, H - 0.5, 0.0);
  // east side wall (toward the library): the same masonry, 5 bays a floor
  m.push([W / 2, 0, -D / 2], Math.PI / 2);
  const sideW = [0, 1, 2, 3].flatMap((fl) => [0, 1, 2, 3, 4].map((i) => ({ x: -6 + i * 3, cy: fl ? FLOORS[fl - 1] + 1.85 : 2.15, w: 1.35, h: fl ? 2.0 : 2.2, cell: roomCell(60 + fl * 5 + i), fl })));
  const sh = sideW.map((w) => hole(w.x, w.cy, w.w, w.h));
  skin(m, "stone", "#CFC8BA", -D / 2 + 0.25, D / 2, 0, 0.9, 0.04, 0.29, sh);
  skin(m, BR, BRC, -D / 2 + 0.25, D / 2, 0.9, H, 0, 0.25, sh, uo);
  // the side rooms (bands between the front rooms' back wall and the back wall; the first window opens into the corner front room)
  const bands = [[-4.2, -6.5], [-6.5, -9.5], [-9.5, -12.5], [-12.5, -D + 0.25]];
  sideW.forEach((w, j) => {
    const i = j % 5, wz = -D / 2 - w.x, y0 = w.fl ? FLOORS[w.fl - 1] : 0;
    const k = i === 0 ? null : roomKind(100 + j);
    if (k) { const [zt, zb] = bands[i - 1]; m.push([w.x, y0, 0], 0); hRoom(m, { xl: zt - wz, xr: wz - zb, d: W / 2 - XC, ch: w.fl ? 3.5 : 3.85, ...k, openL: true }); m.pop(); }
    const L = k ? k.L : (w.fl ? kinds["u" + ((w.fl - 1) * 8 + 7)] : kinds["g5"]).L;
    winUnit(m, w.x, w.cy, w.w, w.h, w.cell, { lintel: w.fl ? "soldier" : "stone", open: true, L, blind: bl(200 + j, L) });
  });
  downspout(m, D / 2 - 0.3, H - 0.5, 0.0);
  m.pop();
  // the roof: a brick penthouse with its coping, condensers, vents — all under snow
  m.box(BR, [-3, H + 1.6, -9], [8, 3.2, 6], BRC, MT(uo)); m.box("stone", [-3, H + 3.25, -9], [8.3, 0.12, 6.3], "#9E978B", MT());
  m.box("snow", [-3, H + 3.36, -9], [8.1, 0.12, 6.1], "#FFFFFF", MT());
  for (let k = 0; k < 3; k++) { m.box("metal", [4 + k * 2.2, H + 0.65, -6], [1.6, 1.2, 1.2], "#B9C2CE"); m.cyl("metal", [4 + k * 2.2, H + 1.27, -6], 0.45, 0.04, "#2A3240", { seg: 16 }); m.box("snow", [4 + k * 2.2, H + 1.3, -6.35], [1.5, 0.06, 0.45], "#FFFFFF", MT()); }
  for (let k = 0; k < 4; k++) { m.cyl("metal", [-9 + k * 1.8, H + 0.5, -12], 0.16, 1.0, "#8A96A6", { seg: 10 }); m.cyl("snow", [-9 + k * 1.8, H + 1.02, -12], 0.15, 0.04, "#FFFFFF", { seg: 10 }); }
};
// the 1950s two-storey annex that stood where the pavilion is (era "will"; it was demolished for the pavilion)
const buildAnnex = (m) => {
  const W = 16, D = 12, H = 8.2, BR = "brick1", uo = [0.5, 0.2];
  const ws = [0, 1].flatMap((fl) => [0, 1, 2, 3, 4].map((i) => ({ x: -6 + i * 3, cy: 1.9 + fl * 4, cell: roomCell(90 + fl * 5 + i) })));
  m.box(BR, [0, H / 2, (-0.25 - D) / 2], [W - 0.4, H, D - 0.25], "#FFFFFF", MT(uo));
  skin(m, BR, "#FFFFFF", -W / 2, W / 2, 0, H, 0, 0.25, ws.map((w) => hole(w.x, w.cy, 1.6, 1.8)), uo);
  for (const w of ws) winUnit(m, w.x, w.cy, 1.6, 1.8, w.cell, { lintel: "soldier", mull: true, sc: "#B8B0AE" });
  m.box("stone", [0, H + 0.1, -D / 2], [W + 0.3, 0.2, D + 0.3], "#9E978B", MT());
  snowLedge(m, 0, H + 0.2, -D / 2, W + 0.2, D + 0.2, 0.12);
  downspout(m, W / 2 - 0.2, H, 0.0);
};
// ── THE RONALD READ PAVILION (frame: the front face z = 0, centred on x = 0) ────────────────────────────────────────────────────
const IN = 4.2, SET = 0.12;   // SET: the interior's slabs, floors and ceilings stop 12 cm behind the glass plane (no face coplanar with a spandrel or the glass); IN: how deep the lit floors are seen behind the glass
const buildWing = (m) => {
  const { W, D, H, glass0 } = WING, x0 = -W / 2, x1 = W / 2, FL = 4.2, gx = (glass0 + x1) / 2, gw = x1 - glass0;
  // the brick mass (west) with framed slot windows (real openings), stone coping
  const slots = [0, 1, 2, 3].flatMap((fl) => [x0 + 1.4, x0 + 2.9, x0 + 4.0].map((x) => ({ x, cy: fl * FL + 2.2, fl })));
  m.box("brick0", [(x0 + glass0) / 2, H / 2, (-0.25 - D) / 2], [glass0 - x0, H, D - 0.25], "#FFFFFF", MT([0.1, 0.4]));
  skin(m, "brick0", "#FFFFFF", x0, glass0, 0, H, 0, 0.25, slots.map((s) => hole(s.x, s.cy, 0.55, 3.0)), [0.1, 0.4]);
  for (const s of slots) {
    const cy = s.cy;
    m.quad("win", [s.x, cy, -0.2], 0.55, 3.0, "#FFFFFF", winRect(7, s.fl % 2));
    m.quad("sheen", [s.x, cy, -0.19], 0.55, 3.0, "#FFFFFF", [0, 0, 1, 1]);
    m.box("alu", [s.x, cy + 1.47, -0.16], [0.55, 0.06, 0.1], "#2A3340"); m.box("alu", [s.x, cy - 0.5, -0.16], [0.55, 0.05, 0.08], "#2A3340");
    for (const sd of [-1, 1]) m.box("alu", [s.x + sd * 0.25, cy, -0.16], [0.05, 3.0, 0.1], "#2A3340");
    m.box("alu", [s.x, cy - 1.53, 0.0], [0.7, 0.06, 0.44], "#8E97A4"); snowLedge(m, s.x, cy - 1.5, 0.02, 0.6, 0.36, 0.04);
  }
  m.box("stone", [(x0 + glass0) / 2, H + 0.08, -D / 2], [glass0 - x0 + 0.2, 0.16, D + 0.2], "#7E8794", MT());
  snowLedge(m, (x0 + glass0) / 2, H + 0.16, -D / 2, glass0 - x0, D, 0.12);
  // the glass section: the dark volume behind the lit depth, and per floor the slab, the ceiling with light panels, partitions, the room
  m.box("dark", [gx, H / 2, -IN - (D - IN) / 2], [gw, H, D - IN], "#FFFFFF");
  const rows = [["lobby", 0], ["or", 1], ["or", 2], ["office", 3]];
  for (const [mat, fl] of rows) {
    const y0 = fl * FL, yc = (fl + 1) * FL - (fl === 0 ? 0.4 : 0.45);
    m.box("conc", [gx, y0 - 0.15 + (fl ? 0 : 0.15), -(IN + SET) / 2], [gw - 0.1, fl ? 0.3 : 0.04, IN - SET], "#C9C4BA", MT());   // the slab (set back: its edge was coplanar with the spandrel face and z-fought)
    m.box("interior", [gx, y0 + 0.02, -(IN + SET) / 2], [gw - 0.12, 0.01, IN - SET], fl === 0 ? "#B8B2A6" : "#9FB3B8");          // the floor finish
    m.box("lit", [gx, yc, -(IN + SET) / 2], [gw - 0.12, 0.04, IN - SET], "#E8ECF0");                                         // the ceiling (set back from the glass plane)
    for (let i = 0; i < 8; i++) for (const z of [-0.9, -2.2, -3.5]) m.box("lamp", [glass0 + 0.9 + i * (gw - 1.6) / 7, yc - 0.025, z], [0.9, 0.01, 0.5], mat === "office" ? "#FFF2DC" : "#EEF6FF");
    m.quad(mat, [gx, (y0 + yc) / 2, -IN + 0.05], gw - 0.12, yc - y0, "#FFFFFF", [0, 0, 1, 1]);
    if (fl > 0) for (const px of [glass0 + gw * 0.33, glass0 + gw * 0.66]) m.box("lit", [px, (y0 + yc) / 2, -IN / 2 - 0.6], [0.12, yc - y0, IN - 1.2], "#DCE4E8");   // partitions
  }
  // the lobby furniture: a reception desk, two benches, a planter
  m.box("lit", [gx + 2.0, 0.55, -2.4], [3.0, 1.1, 0.7], "#D8CFC0"); m.box("lit", [gx + 2.0, 1.12, -2.4], [3.2, 0.06, 0.8], "#F2EEE6");
  for (const x of [gx - 3.5, gx - 1.5]) m.box("interior", [x, 0.25, -1.4], [1.5, 0.45, 0.5], "#3A5C82");
  // the curtain wall: spandrel panels at each floor line, vision glass (the sky's reflection), mullions with caps, transoms
  for (let fl = 1; fl <= 3; fl++) {
    const y0 = fl * FL;
    m.box("spandrel", [gx, y0 + 0.2, -0.02], [gw, 1.1, 0.04], "#24364E");
    m.quad("sheen", [gx, y0 + 2.3, 0.0], gw - 0.1, 3.1, "#FFFFFF", [0, 0, 1, 1]);
    for (const y of [y0 - 0.35, y0 + 0.75]) m.box("alu", [gx, y, 0.03], [gw, 0.08, 0.12], "#2A3340");
  }
  for (let fl = 1; fl <= 4; fl++) m.box("alu", [gx, fl * FL - 0.02 - (fl === 4 ? 0 : 0.0), 0.06], [gw + 0.1, fl === 4 ? 0.1 : 0.12, 0.24], "#AEB6C2");
  const nM = 10;
  for (let k = 0; k <= nM; k++) {
    const x = glass0 + k * gw / nM, hM = H - FL - WING.band;
    m.box("alu", [x, FL + hM / 2, 0.06], [0.08, hM, 0.16], "#2A3340");
    m.box("alu", [x, FL + hM / 2, 0.15], [0.12, hM, 0.04], "#5E6876");      // the pressure cap
  }
  // ground floor: lobby storefront (sliding doors), brick end pier, the blade canopy on tie rods, its soffit lights, landing
  m.quad("sheen", [gx, 1.95, -0.08], gw - 0.4, 3.5, "#FFFFFF", [0, 0, 1, 1]);
  for (let k = 0; k <= 6; k++) m.box("alu", [glass0 + 0.2 + k * (gw - 0.4) / 6, 1.95, -0.12], [0.08, 3.9, 0.14], "#2A3340");
  m.box("alu", [gx, 3.0, -0.12], [gw - 0.4, 0.08, 0.12], "#2A3340"); m.box("alu", [gx, 0.06, -0.12], [gw - 0.4, 0.12, 0.14], "#2A3340");
  for (const sd of [-1, 1]) m.box("alu", [gx + 1.5 + sd * 0.55, 1.4, -0.06], [0.05, 2.7, 0.05], "#3A4554");
  m.box("brick0", [x1 - 0.25, H / 2, -0.1], [0.5, H, 0.4], "#FFFFFF", MT([0.1, 0.4]));
  m.box("alu", [gx + 1.5, 3.95, 1.5], [7, 0.16, 3.0], "#D9DEE6"); m.box("dark", [gx + 1.5, 3.86, 1.5], [6.9, 0.02, 2.9], "#FFFFFF");
  snowLedge(m, gx + 1.5, 4.03, 1.5, 6.9, 2.9, 0.1);
  for (const sd of [-1, 1]) { const rx = gx + 1.5 + sd * 3.0, L = Math.hypot(2.3, 2.9); m.box("alu", [rx, 5.1, 1.45], [0.04, 0.04, L], "#C9D1DB", { r: [Math.atan2(2.3, 2.9), 0, 0] }); }
  for (let k = 0; k < 4; k++) for (const z of [0.7, 2.2]) { m.cyl("bulb", [gx - 0.75 + k * 1.5, 3.85, z], 0.09, 0.02, "#FFF2DC", { seg: 10 }); m.glow([gx - 0.75 + k * 1.5, 3.78, z], "#FFE4BE", 0.6); }
  m.box("trim", [gx + 1.5, 0.05, 1.2], [7, 0.1, 2.4], "#8E97A4");
  // the parapet band above the glass (the sign's ground) and the roof
  m.box("spandrel", [gx, H - WING.band / 2, 0.0], [gw + 0.1, WING.band, 0.12], "#2A323E");
  m.box("alu", [gx, H + 0.03, -0.1], [gw + 0.2, 0.08, 0.4], "#AEB6C2");
  m.box("snow", [gx, H + 0.1, -D / 2], [gw - 0.2, 0.12, D - 0.4], "#FFFFFF", MT());
  // the rooftop louvred screen round the plant
  m.box("metal", [gx + 0.5, H + 1.0, -8], [8, 2.0, 5], "#4A5464"); m.box("snow", [gx + 0.5, H + 2.05, -8], [7.9, 0.1, 4.9], "#FFFFFF", MT());
  for (let k = 0; k < 20; k++) m.box("metal", [gx + 0.5, H + 0.2 + k * 0.09, -5.48], [8, 0.03, 0.06], "#7E8898", { r: [0.6, 0, 0] });
  m.box("brick0", [x1 + 0.0, H / 2, -0.5], [0.04, H, 1.0], "#FFFFFF", MT());
  // landscaping in front: granite-edged beds (snow, spruces added by the set), a path to the doors, bollard lights, a bench
  for (const [bx, bw] of [[glass0 + 1.6, 3.2], [x1 - 1.4, 2.4]]) {
    m.box("granite", [bx, 0.22, 5.0], [bw, 0.44, 2.6], "#B9BEC6", MT()); m.box("granite", [bx, 0.46, 5.0], [bw + 0.06, 0.04, 2.66], "#C9CED6", MT());
    m.box("snow", [bx, 0.52, 5.0], [bw - 0.1, 0.1, 2.5], "#FFFFFF", MT());
    for (let k = 0; k < 4; k++) mound(m, "snow", [bx - bw / 2 + 0.5 + k * (bw - 1) / 3, 0.55, 5.0 + (rnd(k + bx) - 0.5) * 1.2], [0.4, 0.28, 0.38]);
  }
  for (const x of [gx - 0.2, gx + 3.2]) for (const z of [3.4, 6.2]) { m.cyl("iron", [x, 0.45, z], 0.09, 0.9, "#FFFFFF", { seg: 12 }); m.cyl("lampglass", [x, 0.82, z], 0.085, 0.1, "#FFFFFF", { seg: 12 }); m.cyl("iron", [x, 0.92, z], 0.1, 0.05, "#FFFFFF", { seg: 12 }); m.cyl("snow", [x, 0.96, z], 0.08, 0.03, "#FFFFFF", { seg: 10 }); m.glow([x, 0.82, z], "#FFE2B8", 0.5); }
  addBench(m, x0 + 3.0, 0, 4.4, 0);
};
// ── BROOKS MEMORIAL LIBRARY (frame: the glass front z = 0, centred on x = 0) ─────────────────────────────────────────────────────
const LDEEP = 6.5;   // the depth of the lit floors behind the glass
const buildLibrary = (m) => {
  const { W, D, H, over } = LIB, BR = "brick1", iw = W - 1.2;
  for (const sd of [-1, 1]) {
    m.box(BR, [sd * (W / 2 - 0.3), H / 2, -D / 2 + 0.3], [0.6, H, D + 0.6], "#FFFFFF", MT([0.2, 0.1]));
    m.box("stone", [sd * (W / 2 - 0.3), 0.3, 0.32], [0.7, 0.6, 0.08], STONE2, MT());
  }
  m.box("dark", [0, H / 2, -LDEEP - (D - LDEEP) / 2], [iw, H, D - LDEEP], "#FFFFFF");
  // the two lit floors: floor finish, ceiling with light rows, the stacks on the back wall, ranges, tables
  const floors = [[0, 4.05, [0, 0, 1, 0.5]], [4.53, 8.2, [0, 0.5, 1, 1]]];
  floors.forEach(([y0, yc, rect], fi) => {
    m.box("interior", [0, y0 + 0.01, -(LDEEP + SET) / 2], [iw, 0.02, LDEEP - SET], fi ? "#6E5A48" : "#5A4A3E");
    m.box("lit", [0, yc, -(LDEEP + SET) / 2], [iw, 0.04, LDEEP - SET], "#E8DCC8");
    for (const z of [-1.1, -2.9, -4.7]) for (let i = 0; i < 6; i++) m.box("lamp", [-7.5 + i * 3, yc - 0.03, z], [2.2, 0.02, 0.22], "#FFF0D6");
    m.quad("libint", [0, (y0 + yc) / 2, -LDEEP + 0.05], iw, yc - y0, "#FFFFFF", rect);
    // double-faced ranges, their ends toward the glass (spines on both long sides), a wood cap, the range-end card
    for (let i = 0; i < 9; i++) {
      const x = -7.6 + i * 1.75; if (!fi && x > -6.4 && x < -3.2) continue;   // the entrance / circulation zone stays open
      const len = 3.4, zc = -1.9 - len / 2, hh = 2.15;
      m.box("spines", [x, y0 + hh / 2, zc], [0.52, hh, len], "#FFFFFF", { metric: true, uo: [0, -y0] });
      m.box("wood", [x, y0 + hh + 0.03, zc], [0.58, 0.06, len + 0.04], "#8A6A4C");
      m.quad("rangeEnd", [x, y0 + hh / 2, zc + len / 2 + 0.006], 0.52, hh, "#FFFFFF", [0, 0, 1, 1]);
    }
    // reading tables with green-shaded lamps by the glass
    for (let k = 0; k < 4; k++) {
      const x = -6 + k * 4.2, z = -1.0;
      if (!fi && k === 0) continue;
      m.box("wood", [x, y0 + 0.74, z], [1.8, 0.05, 0.8], "#7A5A3C");
      for (const sd of [-1, 1]) m.box("wood", [x + sd * 0.8, y0 + 0.37, z], [0.06, 0.72, 0.7], "#4A3426");
      for (const sd of [-1, 1]) { m.cyl("metal", [x + sd * 0.45, y0 + 0.9, z], 0.012, 0.3, "#C9A456", { seg: 6 }); m.cyl("interior", [x + sd * 0.45, y0 + 1.07, z], 0.12, 0.1, "#2C5A46", { rt: 0.5, rb: 1, seg: 10 }); m.glow([x + sd * 0.45, y0 + 0.98, z], "#FFE6B0", 0.45); }
      for (const sd of [-1, 1]) m.box("interior", [x, y0 + 0.45, z + sd * 0.62], [0.45, 0.06, 0.42], "#3E4C62");
    }
  });
  // the glass front: reflections, the floor slab's edge, mullions, transoms
  for (const y of [2.15, 6.25]) m.quad("sheen", [0, y, 0.0], iw, 4.0, "#FFFFFF", [0, 0, 1, 1]);
  m.box("conc", [0, 4.3, -LDEEP / 2 + 0.1], [iw, 0.46, LDEEP + 0.2], "#E2DED6", MT());                      // the slab (its edge in the glass)
  m.box("conc", [0, 0.12, 0.02], [iw, 0.24, 0.34], "#C9C4BA", MT());
  const nM = 12;
  for (let k = 0; k <= nM; k++) { const x = -iw / 2 + k * iw / nM; m.box("alu", [x, 4.2, 0.03], [0.08, 8.0, 0.2], "#262C34"); m.box("alu", [x, 4.2, 0.14], [0.11, 8.0, 0.03], "#3A424E"); }
  for (const y of [2.95, 7.0]) m.box("alu", [0, y, 0.03], [iw, 0.07, 0.14], "#262C34");
  snowLedge(m, 0, 4.53, 0.12, iw, 0.2, 0.04);
  // the entrance (left of centre): a pair of glass doors in a heavier frame, pulls, a landing and mat
  const dx = -4.9;
  for (const sd of [-1, 0, 1]) m.box("alu", [dx + sd * 0.95, 1.2, 0.08], [0.12, 2.4, 0.14], "#1A1F26");
  m.box("alu", [dx, 2.42, 0.08], [2.0, 0.12, 0.14], "#1A1F26");
  for (const sd of [-1, 1]) { m.cyl("metal", [dx + sd * 0.12, 1.05, 0.2], 0.018, 0.9, "#C9D3DE", { seg: 8 }); for (const y of [0.65, 1.45]) m.box("metal", [dx + sd * 0.12, y, 0.165], [0.03, 0.03, 0.08], "#C9D3DE"); }
  m.box("trim", [dx, 0.04, 0.9], [3.4, 0.08, 1.8], "#8E97A4"); m.box("dark", [dx, 0.085, 0.7], [1.8, 0.01, 1.0], "#2A3038");
  // the roof slab with its deep overhang and fascia, soffit downlights, snow on the roof and its lip
  m.box("conc", [0, H + 0.45, -(D - over) / 2], [W + 1.4, 0.9, D + over + 0.4], "#E6E2DA", MT([0.3, 0.6]));
  m.box("conc", [0, H + 0.95, over - 0.1], [W + 1.4, 0.1, 0.2], "#D2CDC3", MT());
  m.box("snow", [0, H + 1.0, -(D - over) / 2 - 0.2], [W + 1.2, 0.16, D + over], "#FFFFFF", MT());
  for (let k = 0; k < 7; k++) { const x = -9 + k * 3; m.cyl("bulb", [x, H - 0.01, over - 1.0], 0.12, 0.02, "#FFF2DC", { seg: 10 }); m.glow([x, H - 0.08, over - 1.0], "#FFE4BE", 0.8); }
  // granite planters with spruces (added by the set), the bike rack under snow
  for (const x of [-8.2, 5.6]) {
    m.box("granite", [x, 0.35, 4.6], [3.0, 0.7, 1.0], "#B9BEC6", MT()); m.box("granite", [x, 0.72, 4.6], [3.1, 0.06, 1.1], "#C9CED6", MT());
    m.box("snow", [x, 0.78, 4.6], [2.95, 0.1, 0.95], "#FFFFFF", MT());
  }
  for (let k = 0; k < 4; k++) { const x = 7.6 + k * 0.6; m.cyl("metal", [x, 0.82, 1.9], 0.025, 0.4, "#5E6876", { r: [0, 0, Math.PI / 2], seg: 6 }); for (const sd of [-1, 1]) m.cyl("metal", [x + sd * 0.2, 0.42, 1.9], 0.025, 0.84, "#5E6876", { seg: 6 }); m.cyl("snow", [x, 0.85, 1.9], 0.02, 0.38, "#FFFFFF", { r: [0, 0, Math.PI / 2], seg: 5 }); }
};
// ── the street: sidewalks, curbs, snowbanks, neighbours, furniture, lamps, trees ──────────────────────────────────────────────────
const NORTH_E = [25, 33.2, 41.6, 49.4, 57.8, 66], NORTH_W = [-54, -62.2, -70.6, -78.4, -86.8, -95];
const SIGNS = [5, 2, 13, 4, 7, 11, 6, 15, 1, 9, 3, 12, 10, 14, 8];
const XW = [-3.2, 1.2];   // the crosswalk between the hospital and the library
export const LAMPS_N = [-104, -90, -76, -62, -48, -34, -20, -6, 8, 22, 36, 50, 64], LAMPS_S = [-97, -83, -69, -55, -41, -27, -13, 1, 15, 29, 43, 57];
const buildStreet = (m) => {
  m.box("concrete", [-15, PL / 2, -13.5], [220, PL, 33], "#8E97A6", { metric: true });
  m.box("concrete", [-15, PL / 2, 18], [220, PL, 10], "#8E97A6", { metric: true });
  addCurb(m, -125, 95, 2.93, PL, 1); addCurb(m, -125, 95, 13.07, PL, -1);
  // the plowed banks in both gutters (gaps at the crosswalk) and the shovelled snow along the sidewalks' curb edge
  addSnowbank(m, -124, 94, 3.3, { gaps: [XW], seed: 3 });
  addSnowbank(m, -124, 94, 12.7, { gaps: [XW], seed: 9 });
  addSnowbank(m, -124, 94, 2.62, { y: PL, gaps: [XW, ...LAMPS_N.map((x) => [x - 0.4, x + 0.4])], seed: 17, w: 0.32, hgt: 0.22, mat: "snow" });
  addSnowbank(m, -124, 94, 13.4, { y: PL, gaps: [XW, ...LAMPS_S.map((x) => [x - 0.4, x + 0.4])], seed: 23, w: 0.32, hgt: 0.22, mat: "snow" });
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
  // street furniture: the detailed pieces here, the town kit's mailbox / meters / news box / street sign
  addBench(m, -2.5, PL, 1.0, 0); addTrash(m, -0.5, PL, 2.2); addHydrant(m, 1.9, PL, 2.3, 0.4);
  addBench(m, 36, PL, 1.0, 0); addTrash(m, -30.8, PL, 2.2); addBench(m, -20, PL, 14.8, Math.PI); addBench(m, 18, PL, 14.8, Math.PI);
  addTrash(m, 10, PL, 13.8); addTrash(m, -40, PL, 13.8); addHydrant(m, 2, PL, 13.7, 2.6);
  for (const [x, z] of [[28, 1.6], [-51, 1.6], [-14, 14.2], [26, 14.2]]) { addPlanterBox(m, x, PL, z, 0.9, 0.9); addSpruce(m, [x, PL + 0.62, z], 1.3, 300 + x); }
  const N = (x, type, z = 2.4) => ({ type, p: [x, PL, z], ry: 0 }), S = (x, type, z = 13.6) => ({ type, p: [x, PL, z], ry: Math.PI });
  addProps(m, [N(24, "mailbox", 1.0), N(31, "meter"), N(-49, "sign", 2.6), N(-26, "meter"), S(-6, "news", 14.6), S(-32, "meter")]);
  // the lamps
  for (const x of LAMPS_N) addLamp(m, x, PL, 2.55, 1);
  for (const x of LAMPS_S) addLamp(m, x, PL, 13.45, -1);
  // the lawn between the hospital and the library under snow: drifts round its edge; the trees
  for (let i = 0; i < 14; i++) mound(m, "snow", [-4.6 + rnd(i * 3) * 8.6, PL, -0.8 - rnd(i * 3 + 1) * 22], [1.0 + rnd(i) * 1.6, 0.15 + rnd(i + 2) * 0.2, 0.8 + rnd(i + 4) * 1.2], rnd(i + 6) * 3);
  for (const [x, z, h, sd, dp] of [[-1.0, -12, 8, 3, 5], [-1.2, -19.5, 8.5, 11, 5], [-49.5, -4, 8, 11, 4], [-51, -14, 8, 3, 4], [26.0, 2.2, 6, 11, 4]]) addMaple(m, [x, PL, z], h, sd, { depth: dp });
  for (const [x, z, h, sd] of [[-3.6, -5.2, 6.5, 31], [0.8, -8.8, 7.5, 37], [-2.0, -23, 8.5, 41], [-50.5, -20, 7.5, 43], [3.6, -3.0, 4.2, 47]]) addSpruce(m, [x, PL, z], h, sd);
};
// ── R3F pieces ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
const Built = ({ build, deps = [] }) => {
  const grp = useMemo(() => { const m = new Mesher(); build(m); return m.build(setMats()); }, deps);
  return <primitive object={grp} />;
};
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
// the monument sign: a stone panel with a carved border on a brick base, a stone cap with its snow, two ground lights
const Monument = ({ t, p, ry, i }) => (
  <group position={p} rotation-y={ry}>
    <mesh position={[0, 0.4, 0]} castShadow receiveShadow><boxGeometry args={[2.9, 0.8, 0.6]} /><meshStandardMaterial color={i ? "#5A3E30" : "#7A3A2C"} roughness={0.9} /></mesh>
    <mesh position={[0, 0.82, 0]}><boxGeometry args={[3.0, 0.06, 0.66]} /><meshStandardMaterial color="#B7B0A3" roughness={0.7} /></mesh>
    <mesh position={[0, 1.38, 0]} castShadow><boxGeometry args={[2.7, 1.16, 0.32]} /><meshStandardMaterial color="#CFC9BC" roughness={0.7} /></mesh>
    <mesh position={[0, 1.38, 0.161]}><planeGeometry args={[2.62, 0.98]} /><meshStandardMaterial map={t} roughness={0.6} emissiveMap={t} emissive="#FFFFFF" emissiveIntensity={0.12} /></mesh>
    <mesh position={[0, 2.0, 0]}><boxGeometry args={[2.86, 0.08, 0.4]} /><meshStandardMaterial color="#9E978B" roughness={0.7} /></mesh>
    <mesh position={[0, 2.08, 0]}><boxGeometry args={[2.78, 0.08, 0.34]} /><meshStandardMaterial color="#EAF0F8" roughness={0.85} /></mesh>
    {[-0.9, 0.9].map((x) => <mesh key={x} position={[x, 0.08, 0.75]} rotation-x={-0.5}><cylinderGeometry args={[0.07, 0.08, 0.16, 10]} /><meshStandardMaterial color="#1A222C" emissive="#FFD9A0" emissiveIntensity={0.0} metalness={0.6} roughness={0.4} /></mesh>)}
    <LightWash position={[0, 1.3, 0.3]} w={3.2} h={1.8} color="#FFE2B8" opacity={0.18} />
  </group>
);
/** the library's BOOK RETURN: a real US drop box — a steel cabinet with an EXTRUDED curved top (one profile: a rectangle under a
 *  semicircle, extruded across the width; no spherical shapes), on a concrete plinth with anchor bolts; on its front the pull-down
 *  chute door in its slot plate (hinge, pull handle on standoffs), the enamel BOOK RETURN / BOOKS & MEDIA plate, a service lock;
 *  snow lying on the curved top as an extruded band */
const BD_W = 0.9, BD_D = 0.76, BD_S = 1.02;
const bdGeo = () => {
  const r = BD_D / 2, sh = new THREE.Shape();
  sh.moveTo(-r, 0.1); sh.lineTo(r, 0.1); sh.lineTo(r, BD_S); sh.absarc(0, BD_S, r, 0, Math.PI, false); sh.lineTo(-r, 0.1);
  const g = new THREE.ExtrudeGeometry(sh, { depth: BD_W, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 28 });
  g.rotateY(-Math.PI / 2); g.translate(BD_W / 2, 0, 0); return g;
};
const bdSnowGeo = () => {
  const r = BD_D / 2 + 0.012, a0 = 0.42, a1 = Math.PI - 0.42, sh = new THREE.Shape();
  sh.absarc(0, BD_S, r, a0, a1, false);
  for (let k = 0; k <= 20; k++) { const a = a1 - (k / 20) * (a1 - a0), rr = r + 0.012 + 0.05 * Math.sin(((a - a0) / (a1 - a0)) * Math.PI); sh.lineTo(Math.cos(a) * rr, BD_S + Math.sin(a) * rr); }
  const g = new THREE.ExtrudeGeometry(sh, { depth: BD_W - 0.04, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2, curveSegments: 20 });
  g.rotateY(-Math.PI / 2); g.translate((BD_W - 0.04) / 2, 0, 0); return g;
};
const BookDrop = ({ position, ry, tex }) => {
  const G = useMemo(() => ({ body: bdGeo(), snow: bdSnowGeo(),
    paint: new THREE.MeshStandardMaterial({ color: "#1F3A5F", roughness: 0.42, metalness: 0.35, envMapIntensity: 0.9 }),
    steel: new THREE.MeshStandardMaterial({ color: "#B9C3CF", roughness: 0.28, metalness: 0.85 }),
    dark: new THREE.MeshStandardMaterial({ color: "#14243A", roughness: 0.5, metalness: 0.3 }),
    snowM: new THREE.MeshStandardMaterial({ color: "#E6EDF6", roughness: 0.85 }),
    conc: new THREE.MeshStandardMaterial({ color: "#8E949C", roughness: 0.9 }) }), []);
  const fz = BD_D / 2 + 0.012;   // the front face (with its bevel)
  return (
    <group position={position} rotation-y={ry}>
      <mesh position={[0, 0.05, 0]} material={G.conc} receiveShadow><boxGeometry args={[1.04, 0.1, 0.9]} /></mesh>
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => <mesh key={a + "" + b} position={[a * 0.42, 0.12, b * 0.34]} material={G.steel}><cylinderGeometry args={[0.018, 0.018, 0.04, 6]} /></mesh>)}
      <mesh geometry={G.body} material={G.paint} castShadow receiveShadow />
      {/* the slot plate, the pull-down chute door (tilted out a hair), its hinge and pull handle */}
      <mesh position={[0, 0.9, fz + 0.004]} material={G.dark}><boxGeometry args={[0.74, 0.3, 0.008]} /></mesh>
      <group position={[0, 0.78, fz + 0.012]} rotation-x={-0.1}>
        <mesh position={[0, 0.12, 0.012]} material={G.paint}><boxGeometry args={[0.66, 0.24, 0.024]} /></mesh>
        <mesh position={[0, 0.232, 0.03]} material={G.paint}><boxGeometry args={[0.68, 0.02, 0.05]} /></mesh>
        <mesh position={[0, 0.0, 0.01]} rotation-z={Math.PI / 2} material={G.steel}><cylinderGeometry args={[0.012, 0.012, 0.62, 8]} /></mesh>
        {[-0.2, 0.2].map((x) => <mesh key={x} position={[x, 0.2, 0.055]} rotation-x={Math.PI / 2} material={G.steel}><cylinderGeometry args={[0.01, 0.01, 0.06, 6]} /></mesh>)}
        <mesh position={[0, 0.2, 0.085]} rotation-z={Math.PI / 2} material={G.steel}><cylinderGeometry args={[0.014, 0.014, 0.46, 10]} /></mesh>
        {[[-0.3, 0.03], [0.3, 0.03], [-0.3, 0.21], [0.3, 0.21]].map(([x, y]) => <mesh key={x + "" + y} position={[x, y, 0.026]} rotation-x={Math.PI / 2} material={G.steel}><cylinderGeometry args={[0.008, 0.008, 0.006, 6]} /></mesh>)}
      </group>
      {/* the enamel lettering plate in its frame, the service door's lock */}
      <mesh position={[0, 0.47, fz + 0.003]} material={G.steel}><boxGeometry args={[0.76, 0.4, 0.006]} /></mesh>
      <mesh position={[0, 0.47, fz + 0.007]}><planeGeometry args={[0.72, 0.36]} /><meshStandardMaterial map={tex} roughness={0.35} metalness={0.1} /></mesh>
      <mesh position={[0.34, 0.2, fz + 0.01]} rotation-x={Math.PI / 2} material={G.steel}><cylinderGeometry args={[0.018, 0.018, 0.02, 10]} /></mesh>
      <mesh position={[0.34, 0.2, fz + 0.021]} material={G.dark}><boxGeometry args={[0.004, 0.018, 0.002]} /></mesh>
      {/* the snow lying on the curved top, a little drift on the plinth */}
      <mesh geometry={G.snow} material={G.snowM} />
      <mesh position={[0, 0.11, BD_D / 2 + 0.04]} material={G.snowM}><boxGeometry args={[0.95, 0.03, 0.06]} /></mesh>
    </group>
  );
};
/** the Brattleboro set. era: "will" (2015: the old annex) or "pav" (2023: the Ronald Read Pavilion stands) */
export const BrattSet = ({ era = "will" }) => {
  const tx = useMemo(() => {
    const pav = paverTex(); pav.repeat.set(6, 3);
    const pav2 = paverTex().clone(); pav2.needsUpdate = true; pav2.repeat.set(5, 1.5);
    const lawn = snowTex().clone(); lawn.needsUpdate = true; lawn.repeat.set(2, 5);
    return { road: roadTex(), pav, pav2, lawn, hs: hospitalSignTex(), ls: librarySignTex(), br: bookReturnTex(), h: hSignTex() };
  }, []);
  return (
    <group>
      <Sky />
      {/* the hills round Brattleboro: dark wooded ridges against the horizon glow */}
      {[[-140, -170, 110, 34], [10, -200, 150, 46], [160, -160, 90, 30], [-120, 190, 130, 40], [90, 210, 140, 52]].map(([x, z, r, hh], i) => (
        <mesh key={i} position={[x, -4, z]} scale={[r, hh, r * 0.45]}><sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshBasicMaterial color={i % 2 ? "#0A1A2E" : "#0C1D33"} fog={false} /></mesh>
      ))}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.03, 0]} receiveShadow><planeGeometry args={[500, 500]} /><meshStandardMaterial color="#8E9CB4" roughness={0.9} /></mesh>
      {/* the road: asphalt, the double yellow centre line, the parking-lane lines, the crosswalk */}
      <mesh rotation-x={-Math.PI / 2} position={[-15, 0.0, 8]} receiveShadow><planeGeometry args={[220, 10]} /><meshStandardMaterial map={tx.road} color="#8494AC" roughness={0.42} metalness={0.12} envMapIntensity={0.7} /></mesh>
      {[-0.08, 0.08].map((d) => <mesh key={d} rotation-x={-Math.PI / 2} position={[-15, 0.006, 8 + d]}><planeGeometry args={[220, 0.1]} /><meshStandardMaterial color="#D8B95E" emissive="#6b5520" emissiveIntensity={0.25} roughness={0.6} /></mesh>)}
      {[3.9, 12.1].map((z) => <mesh key={z} rotation-x={-Math.PI / 2} position={[-15, 0.006, z]}><planeGeometry args={[220, 0.1]} /><meshStandardMaterial color="#B9C3CE" roughness={0.6} /></mesh>)}
      {Array.from({ length: 8 }, (_, k) => 3.75 + k * 1.2).map((z) => <mesh key={"xw" + z} rotation-x={-Math.PI / 2} position={[(XW[0] + XW[1]) / 2, 0.007, z]}><planeGeometry args={[3.2, 0.55]} /><meshStandardMaterial color="#C9D2DC" roughness={0.65} /></mesh>)}
      {/* the hospital forecourt and the library plaza (pavers), the lawn between them under snow */}
      <mesh rotation-x={-Math.PI / 2} position={[HOSP.x, PL + 0.004, -5]} receiveShadow><planeGeometry args={[HOSP.W, 10]} /><meshStandardMaterial map={tx.pav} color="#7F8CA0" roughness={0.45} metalness={0.1} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[LIB.x, PL + 0.004, -3]} receiveShadow><planeGeometry args={[LIB.W, 6]} /><meshStandardMaterial map={tx.pav2} color="#7F8CA0" roughness={0.45} metalness={0.1} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[-1, PL + 0.006, -12]} receiveShadow><planeGeometry args={[8, 23]} /><meshStandardMaterial map={tx.lawn} color="#AFBCD0" roughness={0.85} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[-50.5, PL + 0.006, -12]} receiveShadow><planeGeometry args={[7, 23]} /><meshStandardMaterial map={tx.lawn} color="#AFBCD0" roughness={0.85} /></mesh>
      <Built build={buildStreet} />
      <group position={[HOSP.x, PL, HOSP.z]}><Built build={buildHospital} /></group>
      <group position={[LIB.x, PL, LIB.z]}><Built build={buildLibrary} /></group>
      {era === "pav"
        ? <group position={[WING.x, PL, WING.z]}><Built build={buildWing} /></group>
        : <group position={[WING.x + 1, PL, WING.z - 1]}><Built build={buildAnnex} /></group>}
      {/* the planters' spruces at the library and the pavilion */}
      <Built build={(m) => {
        for (const x of [-8.2, 5.6]) for (const dx of [-0.8, 0.8]) addSpruce(m, [LIB.x + x + dx, PL + 0.75, LIB.z + 4.6], 1.6 + rnd(x + dx) * 0.4, 600 + x * 3 + dx);
        if (era === "pav") for (const [x, h] of [[WING.glass0 + 0.8, 2.6], [WING.glass0 + 2.5, 2.0], [WING.W / 2 - 1.4, 2.4]]) addSpruce(m, [WING.x + x, PL + 0.5, WING.z + 5.0], h, 700 + x * 7);
      }} deps={[era]} />
      {/* the hospital's name on the canopy fascia (lit letters), the library's name on its fascia */}
      <Letters k="bmh_canopy" text="BRATTLEBORO MEMORIAL HOSPITAL" h={0.3} position={[HOSP.x, PL + 3.92, HOSP.z + 4.21]} color="#F4F7FB" emissive={0.9} o={{ px: 140, weight: 700, track: 0.06 }} />
      <Letters k="brooks_fascia" text="BROOKS MEMORIAL LIBRARY" h={0.56} position={[LIB.x + 1.5, PL + LIB.H + 0.42, LIB.z + LIB.over + 0.21]} color="#E8E2D2" emissive={0.18} emissiveColor="#FFE8C4" o={{ px: 160, weight: 500, track: 0.14 }} />
      {/* monument signs: stone panels on brick bases */}
      <Monument t={tx.hs} p={[-6.2, PL, -1.2]} ry={0.55} i={0} />
      <Monument t={tx.ls} p={[14.4, PL, -4.8]} ry={0.3} i={1} />
      {/* the blue H sign by the forecourt: a framed panel on a post */}
      <group position={[-4.2, PL, 1.6]} rotation-y={0.3}>
        <mesh position={[0, 1.3, 0]}><cylinderGeometry args={[0.04, 0.045, 2.6, 10]} /><meshStandardMaterial color="#8A96A6" metalness={0.7} roughness={0.4} /></mesh>
        <mesh position={[0, 2.45, -0.012]}><boxGeometry args={[0.66, 0.66, 0.03]} /><meshStandardMaterial color="#C9D3DE" metalness={0.6} roughness={0.35} /></mesh>
        <mesh position={[0, 2.45, 0.006]}><planeGeometry args={[0.6, 0.6]} /><meshStandardMaterial map={tx.h} roughness={0.4} /></mesh>
        <mesh position={[0, 2.8, -0.012]}><boxGeometry args={[0.64, 0.04, 0.05]} /><meshStandardMaterial color="#EAF0F8" roughness={0.85} /></mesh>
      </group>
      {/* the library's BOOK RETURN drop box (BookDrop) */}
      <BookDrop position={[LIB.x - 2.6, PL, LIB.z + 1.6]} ry={0.35} tex={tx.br} />
      {/* the lamps' light pools on the sidewalks */}
      {LAMPS_N.map((x) => <LightPool key={"n" + x} position={[x, PL + 0.03, 2.55 + LAMP_ARM]} r={3.4} color="#FFB867" opacity={0.26} />)}
      {LAMPS_S.map((x) => <LightPool key={"s" + x} position={[x, PL + 0.03, 13.45 - LAMP_ARM]} r={3.4} color="#FFB867" opacity={0.26} />)}
      {/* the hospital's light on its forecourt, the library's warm glow on its plaza, the canopy */}
      <LightPool position={[HOSP.x, PL + 0.02, HOSP.z + 3.5]} r={5} sx={1.3} color="#FFE2B8" opacity={0.3} />
      <LightPool position={[LIB.x, PL + 0.02, LIB.z + 2.6]} r={6} sx={1.7} sz={0.6} color="#FFD6A0" opacity={0.28} />
      <LightWash position={[LIB.x, PL + 4.2, LIB.z + 0.4]} w={22} h={9} color="#FFE2B8" opacity={0.05} />
      <LightWash position={[HOSP.x, PL + 8, HOSP.z + 0.3]} w={26} h={16} color="#BFD6FF" opacity={0.08} />
      {era === "pav" && <LightPool position={[WING.x + 4, PL + 0.02, WING.z + 2.5]} r={5} sx={1.4} color="#E6F0FF" opacity={0.26} />}
    </group>
  );
};
