// @ts-nocheck
// ★ V39 station FARM (builder B): "Ronald Read grew up poor on a Vermont farm and was the first in his family to finish high school."
//   A poor 1920s–30s hill farm in Dummerston, Vermont, at blue hour in winter: a weathered clapboard farmhouse (one window lit) with its
//   kitchen ell, a sun-silvered board barn with a tin roof and cupola, fieldstone walls and a split-rail fence across the snowy
//   fields, milk cans on their stand by the lane, bare sugar maples and dark pines up the hill, the Green Mountains in the haze.
//   ★ rev STYLE (2026-11-28, the V38 cinematic rules): no 2-D labels; the names and figures live on real objects; one slow glide.
//   217  (MATCH CUT from the hook ending square-on to the printed band round the certificate stack) — lands square-on to the lettered
//        side of the rural MAILBOX at the road wall: hand-lettered READ (on "Read") / DUMMERSTON, VT. (on "Vermont").
//   217→305  one long crane up and over the mailbox and the road wall, tilting onto the farmhouse (the lit parlour window) on "farm".
//   269→364  one slow push across the front yard into the lit parlour window — through its lower sash the framed diploma in lamplight:
//        BRATTLEBORO UNION HIGH SCHOOL · CLASS OF 1940 (FACTCHECK row 2; no name on it) on "high school."
//   352→384  the push creeps on until the diploma's paper fills the frame: the match cut to Haviland's porcelain sign (gas, 370).
import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { Sky, Glow, rnd, canvasTex, ease } from "./kit";
import { cueAt } from "../bnx/SfxLayer";
import { WIN, wAt } from "./windows";
import { Built, addHouse, addStoneWall, addRailFence, Snowfield, Ridges, fbm, smooth, bpick, addLane } from "./b_winter";
import { diplomaTex, wallpaperTex, glareTex } from "./b_diploma";
import { Mesher } from "./town_parts";
import { Conifers, Maples } from "./e_trees";
import { ShadeLayer, keyDir } from "./b_fakeshade";
import { SIGNF } from "./b_pump";

export const FARM_O = [300, 0, 0];
const A = (p) => [p[0] + FARM_O[0], p[1] + FARM_O[1], p[2] + FARM_O[2]];
const W0 = () => WIN().farm;
const T = () => {
  const w = W0();
  return { start: w.start, end: w.end, ronald: wAt("ronald"), vermont: wAt("vermont", 230), farm: wAt("farm", 230), first: wAt("first", 230), high: wAt("high", 230), school: wAt("school.", 230) };
};
// the ground: the yard is level; the fields fall away gently toward the camera, the hill rises behind to the wooded ridge
export const hgt = (x, z) => {
  const back = smooth(-15, -60, z) * 11 + smooth(-15, -40, z) * 2;
  const left = smooth(-16, -50, x) * 4 * smooth(10, -20, z);
  const front = -smooth(9, 45, z) * 1.4;
  const yard = smooth(26, 14, Math.hypot((x - 3) * 0.8, (z + 5) * 1.1));
  const und = (fbm(x * 0.045 + 3, z * 0.045 + 7, 4) - 0.5) * 2.4 * (1 - yard);
  return back + left + front + und;
};
// the house (centre), its parlour window (the hole the camera looks through), the diploma on the back wall of the parlour
const HOUSE = { x: -1.5, z: -6, w: 8, d: 6.4, h: 3.9, found: 0.5 };
const FRONT_Z = HOUSE.z + HOUSE.d / 2;                     // −2.8
const WINX = HOUSE.x - 1.3, WIN_Y = 1.25, WIN_W = 0.8, WIN_H = 1.4;   // the parlour window (bottom of glass 1.25 m above the snow)
const ROOM_D = 2.2, BACK_Z = FRONT_Z - ROOM_D;
const PANE_X = WINX;                                        // the camera looks through the lower sash (one big pane: a 2/1 sash)
export const DIPLOMA = { x: PANE_X, y: 1.86, z: BACK_Z + 0.035, w: 0.56, h: 0.42 };
const FRAME = { w: 0.7, h: 0.56 };
const BARN = { x: 8.5, z: -21, len: 14, wid: 10, h: 4.4 };
// the rural mailbox by the lane (between the lane's left fence and the plowed lane), its lettered side (+x) facing the lane
export const MB = { x: -2.35, z: 6.75, ry: -Math.PI / 2 + 0.06, top: 1.27 };   // by the road wall, square in front of the parlour window: ry turns the lettered (+x) side to the road (+z), the house straight behind it
export const FARM_KEY = [-11, 13, 6];   // the station's key (upper left, a little in front): shadows fall back and to the right

// ── (E) the farmhouse's front porch (house-local frame, the front wall at z = d/2): a plank deck on fieldstone piers with a lattice
//   skirt, four turned posts with sawn brackets, a shed roof in standing-seam tin under snow with icicles, a beadboard ceiling, a
//   railing of square balusters between the posts (open at the steps in front of the door), two plank steps, a bare-bulb porch light
const addFarmPorch = (m) => {
  const zf = HOUSE.d / 2, pd = 2.1, x0 = -0.68, x1 = HOUSE.w / 2 + 0.02, dy = 0.46, zo = zf + pd;
  const posts = [x0 + 0.08, 0.62, 2.3, x1 - 0.08];
  // the deck: boards running out from the house, a rim joist, piers, the lattice skirt
  for (let x = x0 + 0.05; x < x1; x += 0.1) m.box("split", [x, dy - 0.02, zf + pd / 2], [0.092, 0.035, pd], bpick(["#8A8276", "#857D71", "#90887C"], rnd(x * 37)), { metric: true });
  m.box("trimb", [(x0 + x1) / 2, dy - 0.11, zo], [x1 - x0, 0.16, 0.05], "#D8D4CA", { metric: true });
  for (const x of posts) m.box("stone", [x, (dy - 0.15) / 2 - 0.05, zo - 0.12], [0.3, dy - 0.05, 0.3], "#85878B", { metric: true });
  for (let k = 0; k < 30; k++) { const x = x0 + 0.1 + k * (x1 - x0 - 0.2) / 29; for (const sd of [-1, 1]) m.box("trimb", [x, (dy - 0.2) / 2, zo - 0.04], [0.03, (dy - 0.2) * 1.42, 0.015], "#BEB9AE", { r: [0, 0, sd * Math.PI / 4] }); }
  m.box("dark", [(x0 + x1) / 2, (dy - 0.2) / 2, zo - 0.08], [x1 - x0, dy - 0.2, 0.02], "#161412");
  // snow drifted onto the deck's ends and swept from the middle; a drift along the skirt
  m.sph("snow", [x1 - 0.35, dy + 0.02, zf + pd * 0.5], [0.45, 0.08, pd * 0.48], "#EEF3FA", { seg: 12 });
  m.box("snow", [(x0 + x1) / 2 + 0.6, dy + 0.012, zo - 0.08], [x1 - x0 - 1.8, 0.03, 0.14], "#F2F6FB");
  for (let k = 0; k < 6; k++) m.sph("snow", [x0 + 0.5 + k * 0.8, 0.0, zo + 0.25], [0.6, 0.28 + rnd(k) * 0.1, 0.38], "#EEF3FA", { seg: 12 });
  // the turned posts: a plinth, a shaft with rings and a vase turning, a capital block; sawn brackets to the beam
  const top = 2.72;
  for (const x of posts) {
    const z = zo - 0.12;
    m.box("trimb", [x, dy + 0.12, z], [0.15, 0.24, 0.15], "#E4E0D6", { metric: true });
    m.cyl("trimb", [x, dy + 0.27, z], 0.07, 0.06, "#E4E0D6", { seg: 12 });
    m.cyl("trimb", [x, (dy + 0.3 + top - 0.35) / 2, z], 0.052, top - 0.35 - dy - 0.3, "#E4E0D6", { seg: 12 });
    m.cyl("trimb", [x, dy + 0.62, z], 0.07, 0.18, "#E4E0D6", { rt: 0.75, rb: 1, seg: 12 });
    for (const y of [dy + 0.5, top - 0.5]) m.cyl("trimb", [x, y, z], 0.068, 0.035, "#E4E0D6", { seg: 12 });
    m.box("trimb", [x, top - 0.25, z], [0.15, 0.2, 0.15], "#E4E0D6", { metric: true });
    for (const sd of [-1, 1]) if ((sd < 0 && x > x0 + 0.2) || (sd > 0 && x < x1 - 0.2)) m.box("trimb", [x + sd * 0.16, top - 0.22, z], [0.3, 0.04, 0.05], "#E4E0D6", { r: [0, 0, -sd * 0.7] });
  }
  // the beam, the frieze, the beadboard ceiling
  m.box("trimb", [(x0 + x1) / 2, top - 0.06, zo - 0.12], [x1 - x0 + 0.1, 0.2, 0.16], "#E4E0D6", { metric: true });
  m.box("trimb", [(x0 + x1) / 2, top + 0.06, zf + pd / 2], [x1 - x0, 0.02, pd], "#CFC8B8", { metric: true });
  for (let z = zf + 0.08; z < zo; z += 0.09) m.box("dark", [(x0 + x1) / 2, top + 0.048, z], [x1 - x0, 0.004, 0.006], "#8A8274");
  // the shed roof: tin, from 3.2 m at the wall down past the beam, its snow, a cornice of snow lumps, icicles
  const r0 = 3.08, r1 = top + 0.14, rz1 = zo + 0.28, slope = Math.atan2(r0 - r1, rz1 - zf), L = Math.hypot(r0 - r1, rz1 - zf);
  m.box("tin", [(x0 + x1) / 2, (r0 + r1) / 2, (zf + rz1) / 2], [x1 - x0 + 0.3, 0.05, L], "#C8CED6", { r: [slope, 0, 0], metric: true });
  m.box("snow", [(x0 + x1) / 2, (r0 + r1) / 2 + 0.09, (zf + rz1) / 2 - 0.05], [x1 - x0 + 0.24, 0.12, L * 0.94], "#F2F6FB", { r: [slope, 0, 0], metric: true });
  for (let k = 0; k < 14; k++) { const x = x0 - 0.1 + (k + 0.5) * (x1 - x0 + 0.2) / 14; m.sph("snow", [x, r1 + 0.06, rz1 - 0.05], [0.24, 0.08 + rnd(k + 40) * 0.04, 0.13], "#F2F6FB", { seg: 10 }); }
  m.box("trimb", [(x0 + x1) / 2, r1 - 0.06, rz1], [x1 - x0 + 0.3, 0.14, 0.035], "#D8D4CA", { metric: true });
  for (let k = 0; k < 40; k++) { if (rnd(k * 5 + 1) < 0.4) continue; const il = 0.04 + Math.pow(rnd(k * 7 + 3), 2.2) * 0.4; m.cyl("ice", [x0 - 0.1 + k * (x1 - x0 + 0.2) / 40, r1 - 0.14 - il / 2, rz1 + 0.01], 0.012 + il * 0.03, il, "#DCEBFF", { rt: 1, rb: 0.05, seg: 6 }); }
  // the railing between the posts (open between the first two: the steps), and along both ends back to the wall
  const rail = (xa, za, xb, zb) => {
    const L2 = Math.hypot(xb - xa, zb - za), ry = Math.atan2(-(zb - za), xb - xa), cx = (xa + xb) / 2, cz = (za + zb) / 2;
    m.box("trimb", [cx, dy + 0.1, cz], [L2, 0.06, 0.07], "#E4E0D6", { r: [0, ry, 0] });
    m.box("trimb", [cx, dy + 0.86, cz], [L2, 0.06, 0.1], "#E4E0D6", { r: [0, ry, 0] });
    m.box("snow", [cx, dy + 0.905, cz], [L2 * 0.94, 0.035, 0.085], "#F2F6FB", { r: [0, ry, 0] });
    const n = Math.floor(L2 / 0.12);
    for (let k = 1; k < n; k++) { const t = k / n; m.box("trimb", [xa + (xb - xa) * t, dy + 0.48, za + (zb - za) * t], [0.035, 0.72, 0.035], "#E4E0D6"); }
  };
  rail(posts[1] + 0.08, zo - 0.12, posts[2] - 0.08, zo - 0.12);
  rail(posts[2] + 0.08, zo - 0.12, posts[3] - 0.08, zo - 0.12);
  rail(x1 - 0.08, zo - 0.2, x1 - 0.08, zf + 0.1);
  rail(x0 + 0.08, zo - 0.2, x0 + 0.08, zf + 0.1);
  // the steps down to the path (in front of the door), their stringers, snow on their ends
  const sx = (posts[0] + posts[1]) / 2, sw = posts[1] - posts[0] - 0.2;
  for (let k = 0; k < 2; k++) {
    const y = dy - (k + 1) * (dy / 3), z = zo + 0.15 + k * 0.28;
    m.box("split", [sx, y, z], [sw, 0.045, 0.3], "#8A8276", { metric: true });
    m.box("snow", [sx - sw * 0.33, y + 0.03, z], [sw * 0.3, 0.025, 0.26], "#F2F6FB"); m.box("snow", [sx + sw * 0.36, y + 0.03, z], [sw * 0.26, 0.025, 0.26], "#F2F6FB");
  }
  for (const sd of [-1, 1]) m.box("split", [sx + sd * sw / 2, dy / 2 - 0.05, zo + 0.3], [0.05, 0.2, 0.75], "#7A7266", { r: [Math.atan2(dy, 0.6), 0, 0] });
  // the porch light: a porcelain socket and a bare bulb on the ceiling by the door, lit
  m.cyl("trimb", [0.6, top + 0.02, zf + 0.45], 0.06, 0.05, "#E8E4DA", { seg: 12 });
  m.sph("bulb", [0.6, top - 0.06, zf + 0.45], 0.045, "#FFE6BE", { seg: 8 });
  m.glow([0.6, top - 0.08, zf + 0.45], "#FFD49A", 1.4);
  // a broom and a snow shovel against the wall, a bench under the window, a milk crate
  m.box("wood", [3.6, dy + 0.65, zf + 0.12], [0.03, 1.3, 0.03], "#8A6E4E", { r: [0.15, 0, 0] });
  m.box("metal", [3.6, dy + 0.12, zf + 0.25], [0.38, 0.28, 0.03], "#4A5566", { r: [0.3, 0, 0] });
  m.box("split", [1.9, dy + 0.42, zf + 0.3], [1.3, 0.05, 0.34], "#7A6A58", { metric: true });
  for (const dx of [-0.55, 0.55]) m.box("split", [1.9 + dx, dy + 0.2, zf + 0.3], [0.05, 0.42, 0.3], "#6E6052", { metric: true });
};
// ── the outdoor set, merged ───────────────────────────────────────────────────────────────────────────────────────────────
const buildFarm = (m) => {
  // the farmhouse: 1½ storeys, weathered clapboard, 2/2 sash, a fieldstone foundation, tin roof under snow, a brick chimney
  m.push([HOUSE.x, 0, HOUSE.z]);
  addHouse(m, {
    w: HOUSE.w, d: HOUSE.d, h: HOUSE.h, pitch: 0.9, found: HOUSE.found, wall: "#CFCDC5", trim: "#D8D4CA", roof: "tin", roofC: "#C8CED6", seed: 3,
    chimney: [0.3, -0.2],
    holes: [{ f: "front", x: WINX - HOUSE.x, y: WIN_Y, w: WIN_W, h: WIN_H }],
    win: [
      { f: "front", x: WINX - HOUSE.x, y: WIN_Y, ww: WIN_W, wh: WIN_H, real: true },
      { f: "front", x: -2.9, y: WIN_Y, ww: WIN_W, wh: WIN_H, cell: 1 },
      { f: "front", x: 1.3, y: WIN_Y, ww: WIN_W, wh: WIN_H, cell: 2 },
      { f: "front", x: 2.9, y: WIN_Y, ww: WIN_W, wh: WIN_H, cell: 1 },
      { f: "front", x: -2.1, y: 3.3, ww: 0.7, wh: 0.62, cell: 6 },
      { f: "front", x: 2.1, y: 3.3, ww: 0.7, wh: 0.62, cell: 6 },
      { f: "left", x: -1.3, y: WIN_Y, ww: WIN_W, wh: WIN_H, cell: 1 },
      { f: "left", x: 1.3, y: WIN_Y, ww: WIN_W, wh: WIN_H, cell: 2 },
      { f: "left", x: 0, y: 4.6, ww: 0.7, wh: 1.0, cell: 1 }
    ],
    door: [{ f: "front", x: 0, w: 0.92, h: 2.05, cell: 1 }]
  });
  addFarmPorch(m);
  m.pop();
  // the kitchen ell (lower, set back) with the lit kitchen window and a side door; a woodshed beyond it
  m.push([HOUSE.x + HOUSE.w / 2 + 2.6, 0, HOUSE.z - 0.8]);
  addHouse(m, {
    w: 5.2, d: 5, h: 2.75, pitch: 0.8, found: 0.4, wall: "#C6C3BA", trim: "#D2CEC4", roof: "tin", roofC: "#BFC6CF", seed: 5, icicles: true,
    chimney: [1.4, -0.6],
    win: [{ f: "front", x: -1.2, y: 1.15, ww: 0.75, wh: 1.2, cell: 3 }, { f: "front", x: 1.6, y: 1.15, ww: 0.75, wh: 1.2, cell: 1 }],
    door: [{ f: "front", x: 0.25, w: 0.86, h: 1.95, cell: 3, steps: 1, stepMat: "split", stepC: "#7A7268" }]
  });
  m.pop();
  m.push([HOUSE.x + HOUSE.w / 2 + 5.2 + 2.3, 0, HOUSE.z - 1.2]);
  addHouse(m, { w: 4.2, d: 4.4, h: 2.4, pitch: 0.7, found: 0.15, clap: "board", wall: "#9A9086", trim: "#8E857A", roof: "tin", roofC: "#A9B0B9", seed: 7, foundMat: "stone", door: [{ f: "front", x: -0.6, w: 1.4, h: 1.9, cell: 3 }], icicles: false });
  m.pop();
  // the barn: gable end to the yard, sun-silvered boards, a tin roof half shed of its snow, the big sliding door on its track
  m.push([BARN.x, 0, BARN.z], -Math.PI / 2);
  addHouse(m, {
    w: BARN.len, d: BARN.wid, h: BARN.h, pitch: 0.95, found: 0.35, clap: "board", wall: "#A2988C", trim: "#8A8075", roof: "tin", roofC: "#B4BBC4", seed: 9, snowLen: 0.8, icicles: false,
    win: [{ f: "right", x: 3.4, y: 1.6, ww: 0.75, wh: 0.75, cell: 7 }, { f: "right", x: -3.4, y: 1.6, ww: 0.75, wh: 0.75, cell: 7 }, { f: "front", x: -3, y: 1.6, ww: 0.75, wh: 0.75, cell: 7 }, { f: "front", x: 2, y: 1.6, ww: 0.75, wh: 0.75, cell: 7 }, { f: "front", x: 5.5, y: 1.6, ww: 0.75, wh: 0.75, cell: 7 }]
  });
  // the sliding door on the gable end (local frame of the "right" face: x across, z out)
  m.push([BARN.len / 2, 0.35, 0], Math.PI / 2);
  const DW = 3.4, DH = 3.3;
  for (let k = 0; k < 12; k++) m.box("board", [-DW / 2 + (k + 0.5) * DW / 12 + 0.4, DH / 2, 0.06], [DW / 12 - 0.015, DH, 0.05], bpick(["#9C9286", "#8E8478", "#A59B8E"], rnd(k + 40)), { metric: true });
  for (const y of [0.25, DH / 2, DH - 0.25]) m.box("board", [0.4, y, 0.1], [DW, 0.2, 0.04], "#887E72", { metric: true });
  for (const sg of [-1, 1]) m.box("board", [0.4, DH / 2 + sg * DH / 4, 0.105], [Math.hypot(DW, DH / 2) - 0.2, 0.18, 0.035], "#8A8074", { r: [0, 0, sg * Math.atan2(DH / 2, DW)], metric: true });
  m.box("metal", [0.4, DH + 0.2, 0.1], [DW * 2.1, 0.08, 0.06], "#3A3E44");                 // the track
  for (const x of [-1.0, 1.8]) m.cyl("metal", [x, DH + 0.12, 0.15], 0.06, 0.04, "#2E3238", { r: [Math.PI / 2, 0, 0], seg: 10 });
  m.box("board", [0.4, 4.9, 0.05], [1.6, 1.5, 0.05], "#8C8276", { metric: true });          // the hay door up in the gable
  m.box("board", [0.4, 4.9, 0.08], [1.7, 0.12, 0.03], "#7C7266");
  m.box("metal", [0.4, 6.3, 0.35], [0.12, 0.12, 0.8], "#3A3E44");                          // the hay hood beam
  // a drift against the door, a shovelled-out patch
  m.sph("snow", [-0.4, -0.3, 0.5], [2.6, 0.55, 0.7], "#EEF3FA", { seg: 12 });
  m.pop();
  // the cupola on the ridge
  const rh = BARN.h + (BARN.wid / 2) * 0.95 + 0.35;
  m.box("board", [0, rh + 0.45, 0], [1.1, 0.9, 1.1], "#9C9286", { metric: true });
  for (let k = 0; k < 6; k++) for (const sd of [-1, 1]) m.box("board", [sd * 0.56, rh + 0.2 + k * 0.1, 0], [0.02, 0.04, 0.9], "#5A5248");
  m.box("tin", [0, rh + 1.0, 0], [1.4, 0.06, 1.4], "#B4BBC4", { metric: true });
  m.cyl("tin", [0, rh + 1.25, 0], 0.98, 0.45, "#B4BBC4", { rt: 0.02, rb: 1, seg: 4, r: [0, Math.PI / 4, 0] });
  m.cyl("snow", [0, rh + 1.12, 0], 0.7, 0.14, "#F2F6FB", { rt: 0.4, rb: 1, seg: 10 });
  m.cyl("metal", [0, rh + 1.7, 0], 0.012, 0.5, "#2A2E34", { seg: 6 });
  m.pop();
  // fieldstone walls: along the front of the yard (a gap for the lane) and up the hill on the left
  addStoneWall(m, [[-34, 6.5], [-16, 5.2], [-4, 5.6], [5.2, 6.0]], hgt, 1);
  addStoneWall(m, [[8.6, 6.1], [20, 6.8], [34, 5.5]], hgt, 2);
  addStoneWall(m, [[-15.5, 5.0], [-16.5, -8], [-15, -22], [-17, -38]], hgt, 3);
  addStoneWall(m, [[22, 2], [23, -14], [21, -30]], hgt, 4);
  // the split-rail fence along the lane (both sides) and round the barnyard
  addRailFence(m, [[5.0, 7.2], [5.6, 14], [7.4, 22], [9.5, 32]], hgt, 1);
  addRailFence(m, [[8.8, 7.2], [9.6, 14], [11.4, 22], [13.6, 32]], hgt, 2);
  addRailFence(m, [[19.5, -6.2], [19.5, -16], [14.6, -17.5]], hgt, 3);
  // the milk-can stand by the lane: a plank platform on posts, three 10-gallon cans
  m.push([10.4, hgt(10.4, 7.6), 7.6], -0.2);
  m.box("split", [0, 0.92, 0], [1.6, 0.08, 0.9], "#857C70", { metric: true });
  for (const [x, z] of [[-0.7, -0.35], [0.7, -0.35], [-0.7, 0.35], [0.7, 0.35]]) m.box("split", [x, 0.45, z], [0.1, 0.9, 0.1], "#7A7268", { metric: true });
  m.box("snow", [0.45, 0.975, 0.1], [0.65, 0.04, 0.6], "#F2F6FB");
  [-0.45, -0.05, 0.42].forEach((x, i) => {
    const z = i === 1 ? 0.15 : -0.12, y = 0.96;
    m.cyl("metal", [x, y + 0.26, z], 0.165, 0.52, "#AEB6C0", { seg: 18 });
    m.cyl("metal", [x, y + 0.56, z], 0.165, 0.08, "#AEB6C0", { rt: 0.6, rb: 1, seg: 18 });
    m.cyl("metal", [x, y + 0.66, z], 0.1, 0.12, "#A4ACB6", { seg: 16 });
    m.cyl("metal", [x, y + 0.74, z], 0.12, 0.04, "#9AA2AC", { seg: 16 });
    m.cyl("snow", [x, y + 0.775, z], 0.11, 0.03, "#F2F6FB", { seg: 12 });
    for (const sd of [-1, 1]) m.add("metal", new THREE.TorusGeometry(0.06, 0.012, 6, 12, Math.PI), new THREE.Matrix4().compose(new THREE.Vector3(x + sd * 0.16, y + 0.5, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, sd * Math.PI / 2, 0)), new THREE.Vector3(1, 1, 1)), "#8E96A0");
    m.box("metal", [x, y + 0.02, z], [0.001, 0.001, 0.001], "#000");
  });
  m.pop();
  // the farm lane from the road up to the ell door: a plowed ribbon (packed snow, two ruts worn to frozen gravel, feathered edges) with
  // the plow's banks along both sides (e_ addLane)
  addLane(m, Array.from({ length: 48 }, (_, i) => { const t = i / 47; return [11.6 - 8.4 * t + Math.sin(t * 3) * 0.8, 34 - t * 37]; }), 1.55, hgt, 3);
  // a hand pump and a chopping stump by the ell, a sledge leaning on the woodshed
  m.push([HOUSE.x + HOUSE.w / 2 + 1.0, 0, HOUSE.z + 3.6]);
  m.cyl("metal", [0, 0.6, 0], 0.07, 1.2, "#2C3036", { seg: 10 });
  m.cyl("metal", [0, 1.22, 0], 0.09, 0.08, "#2C3036", { seg: 10 });
  m.cyl("metal", [0.16, 1.0, 0], 0.025, 0.32, "#2C3036", { r: [0, 0, Math.PI / 2], seg: 6 });
  m.cyl("metal", [-0.15, 1.35, 0], 0.02, 0.55, "#2C3036", { r: [0, 0, 0.9], seg: 6 });
  m.box("split", [0, 0.05, 0], [0.7, 0.1, 0.7], "#7A7268");
  m.cyl("snow", [0, 1.27, 0], 0.08, 0.02, "#F2F6FB", { seg: 10 });
  m.pop();
  // drifts banked against the house's foundation (the wind's side), a path trodden from the front steps down to the lane
  for (let k = 0; k < 9; k++) {
    const x = HOUSE.x - HOUSE.w / 2 + 0.4 + k * 0.92;
    if (Math.abs(x - HOUSE.x) < 0.8) continue;
    m.sph("snow", [x, 0.0, FRONT_Z + 0.28], [0.75 + rnd(k) * 0.3, 0.32 + rnd(k + 3) * 0.12, 0.42], "#EEF3FA", { seg: 14 });
  }
  // the path shovelled from the porch steps down to the lane
  addLane(m, Array.from({ length: 16 }, (_, i) => { const t = i / 15; return [HOUSE.x + (5.6 - HOUSE.x) * t + Math.sin(t * 3.2) * 0.9, FRONT_Z + 2.6 + (7.4 - FRONT_Z - 2.6) * t]; }), 0.5, hgt, 5);
  // (the bare sugar maples are e_trees' <Maples>, grown each from its own seed)
};
// the pines: a belt along the ridge behind, a stand on the left, a few behind the barn
const pineItems = () => {
  const out = [];
  for (let i = 0; i < 140; i++) {
    const x = -70 + rnd(i * 3 + 1) * 140, z = -34 - rnd(i * 3 + 2) * 40;
    out.push({ p: [x, hgt(x, z) - 0.2, z], s: 1.6 + rnd(i * 5) * 1.6 });
  }
  for (let i = 0; i < 40; i++) {
    const x = -48 + rnd(i * 7 + 1) * 26, z = -18 + rnd(i * 7 + 2) * 30;
    if (x > -20 && z > 0) continue;
    out.push({ p: [x, hgt(x, z) - 0.2, z], s: 1.4 + rnd(i * 11) * 1.4 });
  }
  for (let i = 0; i < 12; i++) { const x = 24 + rnd(i * 13) * 20, z = -12 - rnd(i * 17) * 20; out.push({ p: [x, hgt(x, z) - 0.2, z], s: 1.5 + rnd(i * 19) * 1.2 }); }
  out.push({ p: [-8.2, 0, -9.5], s: 2.2 }, { p: [-10.5, 0, -12], s: 1.8 });
  return out;
};
// ── the parlour behind the lit window ────────────────────────────────────────────────────────────────────────────────────
const lampLathe = () => {
  const font = new THREE.LatheGeometry([[0.001, 0], [0.07, 0], [0.075, 0.02], [0.05, 0.04], [0.035, 0.09], [0.08, 0.13], [0.085, 0.17], [0.06, 0.21], [0.025, 0.23], [0.001, 0.235]].map(([r, y]) => new THREE.Vector2(r, y)), 24);
  const chim = new THREE.LatheGeometry([[0.035, 0], [0.04, 0.02], [0.055, 0.06], [0.05, 0.1], [0.028, 0.15], [0.026, 0.24], [0.03, 0.25]].map(([r, y]) => new THREE.Vector2(r, y)), 24, 0, Math.PI * 2);
  return { font, chim };
};
const curtainTex = () => canvasTex("b_lace_v2", 256, 512, (c, w, h) => {
  // a fine net with a floral lace pattern, a scalloped hem, soft vertical gathers
  c.clearRect(0, 0, w, h);
  for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) { c.fillStyle = "rgba(255,248,236,0.16)"; c.fillRect(x, y, 1, 1); }
  for (let j = 0; j < 12; j++) for (let i = 0; i < 5; i++) {
    const cx = (i + 0.5 + (j % 2) * 0.5) * w / 5, cy = (j + 0.5) * h / 12;
    c.strokeStyle = "rgba(255,248,236,0.55)"; c.lineWidth = 1.4;
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; c.beginPath(); c.ellipse(cx + Math.cos(a) * 7, cy + Math.sin(a) * 7, 6, 3, a, 0, 7); c.stroke(); }
    c.fillStyle = "rgba(255,248,236,0.6)"; c.beginPath(); c.arc(cx, cy, 2.5, 0, 7); c.fill();
  }
  for (let x = 0; x < w; x += 16) { c.fillStyle = "rgba(255,248,236,0.75)"; c.beginPath(); c.arc(x + 8, h - 10, 8, 0, Math.PI); c.fill(); }
  c.fillStyle = "rgba(255,248,236,0.5)"; c.fillRect(0, h - 22, w, 4);
  for (let k = 0; k < 7; k++) { const g = c.createLinearGradient(k * w / 7, 0, (k + 1) * w / 7, 0); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.5, "rgba(255,250,240,0.12)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(k * w / 7, 0, w / 7, h); }
});
const floorTex = () => canvasTex("b_floor", 512, 512, (c, w, h) => {
  for (let k = 0; k < 8; k++) { c.fillStyle = `hsl(28,${30 + rnd(k) * 10}%,${22 + rnd(k + 2) * 8}%)`; c.fillRect(0, k * 64, w, 62); for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(0,0,0,${rnd(k * 60 + i) * 0.12})`; c.fillRect(rnd(k * 60 + i + 1) * w, k * 64 + rnd(i) * 60, 40 + rnd(i + 3) * 120, 1.5); } c.fillStyle = "#1A100A"; c.fillRect(0, k * 64 + 62, w, 2); }
});
const frostTex = () => canvasTex("b_frostPane", 256, 256, (c, w, h) => {
  c.fillStyle = "#000"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) {
    const corner = i % 4, cx = corner % 2 ? w : 0, cy = corner < 2 ? h : 0, r = Math.pow(rnd(i * 3 + 1), 1.6) * w * 0.42, a = rnd(i * 5 + 2) * Math.PI * 2;
    c.fillStyle = `rgba(255,255,255,${0.06 + rnd(i) * 0.12})`; c.beginPath(); c.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1 + rnd(i + 9) * 2.5, 0, 7); c.fill();
  }
  const g = c.createLinearGradient(0, h * 0.85, 0, h); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(255,255,255,0.45)"); c.fillStyle = g; c.fillRect(0, h * 0.85, w, h * 0.15);
  c.fillStyle = "rgba(255,255,255,0.10)"; c.fillRect(0, 0, w, h);   // the glass itself
});
// (E) walnut with a hand-rubbed finish: dark figured grain
const walnutTex = () => { const t = canvasTex("e_walnut", 512, 512, (c, w, h) => {
  c.fillStyle = "#4A2E1E"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) { const y = rnd(i) * h, a = 0.08 + rnd(i + 1) * 0.2; c.strokeStyle = rnd(i + 2) < 0.5 ? `rgba(20,10,6,${a})` : `rgba(140,96,60,${a * 0.7})`; c.lineWidth = 1 + rnd(i + 3) * 3; c.beginPath(); for (let x = 0; x <= w; x += 16) c.lineTo(x, y + Math.sin(x / 60 + i) * 6 + Math.sin(x / 17 + i * 3) * 1.5); c.stroke(); }
  for (let i = 0; i < 6; i++) { c.strokeStyle = "rgba(20,10,6,0.35)"; c.lineWidth = 1.5; const cx = rnd(i * 5) * w, cy = rnd(i * 7) * h; for (let r = 4; r < 30; r += 5) { c.beginPath(); c.ellipse(cx, cy, r * 2.2, r * 0.7, 0, 0, 7); c.stroke(); } }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t; };
// (E) the frame's mouldings: a rectangle with a rectangular window, extruded with a bevel (a mitred moulding at a glance)
const ringShape = (ow, oh, iw, ih) => { const sh = new THREE.Shape(); sh.moveTo(-ow / 2, -oh / 2); sh.lineTo(ow / 2, -oh / 2); sh.lineTo(ow / 2, oh / 2); sh.lineTo(-ow / 2, oh / 2); sh.closePath(); const hl = new THREE.Path(); hl.moveTo(-iw / 2, -ih / 2); hl.lineTo(-iw / 2, ih / 2); hl.lineTo(iw / 2, ih / 2); hl.lineTo(iw / 2, -ih / 2); hl.closePath(); sh.holes.push(hl); return sh; };
const FG = (() => {
  const frame = new THREE.ExtrudeGeometry(ringShape(FRAME.w - 0.016, FRAME.h - 0.016, FRAME.w - 0.09, FRAME.h - 0.09), { depth: 0.014, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3, curveSegments: 1 });
  frame.translate(0, 0, -0.004);
  const liner = new THREE.ExtrudeGeometry(ringShape(FRAME.w - 0.084, FRAME.h - 0.084, FRAME.w - 0.104, FRAME.h - 0.104), { depth: 0.004, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2, curveSegments: 1 });
  return { frame, liner };
})();
const Parlour = ({ f }) => {
  const mats = useMemo(() => {
    const wp = wallpaperTex(); wp.wrapS = wp.wrapT = THREE.RepeatWrapping; wp.repeat.set(5, 4.8);
    const fl = floorTex(); fl.wrapS = fl.wrapT = THREE.RepeatWrapping; fl.repeat.set(1.5, 1.2);
    return {
      paper: new THREE.MeshStandardMaterial({ map: wp, color: "#B8A890", roughness: 0.85 }),
      floor: new THREE.MeshStandardMaterial({ map: fl, roughness: 0.6 }),
      ceil: new THREE.MeshStandardMaterial({ color: "#C8BCA8", roughness: 0.9 }),
      dip: new THREE.MeshStandardMaterial({ map: diplomaTex(), roughness: 0.75 }),
      mat: new THREE.MeshStandardMaterial({ color: "#E9E1CF", roughness: 0.9 }),
      frame: new THREE.MeshStandardMaterial({ map: walnutTex(), color: "#8A6A50", roughness: 0.38, metalness: 0.05 }),
      gilt: new THREE.MeshStandardMaterial({ color: "#B08D4A", roughness: 0.35, metalness: 0.8 }),
      glassF: new THREE.MeshStandardMaterial({ color: "#FFF6E6", roughness: 0.04, metalness: 0.0, transparent: true, opacity: 0.55, alphaMap: glareTex(), envMapIntensity: 1.2, depthWrite: false }),
      matBevel: new THREE.MeshStandardMaterial({ color: "#F6F0E0", roughness: 0.8 }),
      wood: new THREE.MeshStandardMaterial({ color: "#4A2E1C", roughness: 0.5 }),
      doily: new THREE.MeshStandardMaterial({ color: "#EFE8DA", roughness: 0.9 }),
      lampGlass: new THREE.MeshStandardMaterial({ color: "#C9D8C4", roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.55 }),
      chim: new THREE.MeshStandardMaterial({ color: "#FFF4E0", roughness: 0.05, transparent: true, opacity: 0.35, emissive: "#FFB060", emissiveIntensity: 0.35 }),
      brass: new THREE.MeshStandardMaterial({ color: "#B89A50", roughness: 0.3, metalness: 0.9 }),
      lace: new THREE.MeshStandardMaterial({ map: curtainTex(), transparent: true, roughness: 0.9, side: THREE.DoubleSide, depthWrite: false, alphaTest: 0.02 }),
      flame: new THREE.MeshBasicMaterial({ color: "#FFD08A", toneMapped: false })
    };
  }, []);
  const L = useMemo(lampLathe, []);
  const rx0 = WINX - 1.5, rx1 = WINX + 1.5, y0 = HOUSE.found, y1 = HOUSE.found + 2.45, zc = (FRONT_Z - 0.12 + BACK_Z) / 2, dz = FRONT_Z - 0.12 - BACK_Z;
  const flick = 1 + 0.04 * Math.sin(f * 0.9) + 0.03 * Math.sin(f * 2.3 + 1);
  const LX = DIPLOMA.x + 0.62, LY = HOUSE.found + 0.76, LZ = BACK_Z + 0.32;
  return (
    <group>
      {/* the room: wallpapered walls, a plank floor, the ceiling */}
      <mesh position={[(rx0 + rx1) / 2, (y0 + y1) / 2, BACK_Z]} material={mats.paper}><planeGeometry args={[rx1 - rx0, y1 - y0]} /></mesh>
      <mesh position={[rx0, (y0 + y1) / 2, zc]} rotation-y={Math.PI / 2} material={mats.paper}><planeGeometry args={[dz, y1 - y0]} /></mesh>
      <mesh position={[rx1, (y0 + y1) / 2, zc]} rotation-y={-Math.PI / 2} material={mats.paper}><planeGeometry args={[dz, y1 - y0]} /></mesh>
      <mesh position={[(rx0 + rx1) / 2, y0 + 0.002, zc]} rotation-x={-Math.PI / 2} material={mats.floor}><planeGeometry args={[rx1 - rx0, dz]} /></mesh>
      <mesh position={[(rx0 + rx1) / 2, y1, zc]} rotation-x={Math.PI / 2} material={mats.ceil}><planeGeometry args={[rx1 - rx0, dz]} /></mesh>
      {/* baseboard, chair rail */}
      <mesh position={[(rx0 + rx1) / 2, y0 + 0.08, BACK_Z + 0.01]} material={mats.wood}><boxGeometry args={[rx1 - rx0, 0.16, 0.02]} /></mesh>
      <mesh position={[(rx0 + rx1) / 2, y0 + 0.86, BACK_Z + 0.012]} material={mats.wood}><boxGeometry args={[rx1 - rx0, 0.05, 0.025]} /></mesh>
      {/* the framed diploma: moulded dark frame with a gilt lip, cream mat, the diploma, the glass; hung from a picture wire on a nail */}
      <group position={[DIPLOMA.x, DIPLOMA.y, BACK_Z + 0.03]} rotation-z={0.006}>
        {/* the moulded walnut frame (a bevelled profile, mitred), the gilt liner inside it, the mat with its bevelled window */}
        <mesh geometry={FG.frame} material={mats.frame} castShadow />
        <mesh geometry={FG.liner} position={[0, 0, 0.012]} material={mats.gilt} />
        <mesh position={[0, 0, 0.0015]} material={mats.mat}><planeGeometry args={[FRAME.w - 0.1, FRAME.h - 0.1]} /></mesh>
        {[[0, DIPLOMA.h / 2 + 0.012, DIPLOMA.w + 0.048, 0.024, 0.5], [0, -DIPLOMA.h / 2 - 0.012, DIPLOMA.w + 0.048, 0.024, -0.5], [-DIPLOMA.w / 2 - 0.012, 0, 0.024, DIPLOMA.h + 0.048, 0], [DIPLOMA.w / 2 + 0.012, 0, 0.024, DIPLOMA.h + 0.048, 0]].map(([x, y, w, h, t], i) => (
          <mesh key={i} position={[x, y - 0.004, 0.0055]} rotation={i < 2 ? [t, 0, 0] : [0, (i === 2 ? 0.5 : -0.5), 0]} material={mats.matBevel}><planeGeometry args={[w, h]} /></mesh>
        ))}
        <mesh position={[0, -0.004, 0.0035]} material={mats.dip}><planeGeometry args={[DIPLOMA.w, DIPLOMA.h]} /></mesh>
        <mesh position={[0, 0, 0.0165]} material={mats.glassF} renderOrder={4}><planeGeometry args={[FRAME.w - 0.08, FRAME.h - 0.08]} /></mesh>
        <mesh position={[0, FRAME.h / 2 + 0.07, -0.005]} material={mats.brass}><cylinderGeometry args={[0.006, 0.006, 0.02, 8]} /></mesh>
        {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.09, FRAME.h / 2 + 0.035, -0.01]} rotation-z={sd * 0.95} material={mats.brass}><cylinderGeometry args={[0.0012, 0.0012, 0.13, 4]} /></mesh>)}
      </group>
      {/* a small table with a crocheted doily and the kerosene lamp */}
      <group position={[LX, y0, LZ]}>
        <mesh position={[0, 0.74, 0]} material={mats.wood} castShadow><boxGeometry args={[0.62, 0.03, 0.42]} /></mesh>
        {[[-0.27, -0.17], [0.27, -0.17], [-0.27, 0.17], [0.27, 0.17]].map(([x, z], i) => <mesh key={i} position={[x, 0.37, z]} material={mats.wood}><cylinderGeometry args={[0.018, 0.014, 0.74, 8]} /></mesh>)}
        <mesh position={[0, 0.757, 0]} material={mats.doily}><cylinderGeometry args={[0.17, 0.17, 0.004, 24]} /></mesh>
        <group position={[0, 0.76, 0]}>
          <mesh geometry={L.font} material={mats.lampGlass} />
          <mesh position={[0, 0.235, 0]} material={mats.brass}><cylinderGeometry args={[0.04, 0.045, 0.04, 16]} /></mesh>
          <mesh position={[0, 0.255, 0]} geometry={L.chim} material={mats.chim} />
          <mesh position={[0, 0.3, 0]} material={mats.flame} scale={[0.6, 1.6 * flick, 0.6]}><sphereGeometry args={[0.012, 10, 8]} /></mesh>
          <Glow position={[0, 0.31, 0]} size={0.2} color="#FFC27A" opacity={0.7} />
          <Glow position={[0, 0.31, 0]} size={0.9} color="#FF9F50" opacity={0.18} />
          <pointLight position={[0, 0.34, 0.08]} color="#FFB467" intensity={0.8 * flick} distance={3.0} decay={1.8} />
        </group>
      </group>
      {/* a fill from the room's other lamp, out of view (so the diploma is evenly lit) */}
      <pointLight position={[WINX - 0.6, 2.05, FRONT_Z - 0.6]} color="#FFC48A" intensity={0.55} distance={3.0} decay={1.8} />
      {/* a chair back at the left */}
      <group position={[WINX - 0.95, y0, BACK_Z + 0.55]} rotation-y={0.5}>
        <mesh position={[0, 0.45, 0]} material={mats.wood}><boxGeometry args={[0.42, 0.03, 0.4]} /></mesh>
        {[-0.18, 0.18].map((x) => <mesh key={x} position={[x, 0.7, -0.18]} material={mats.wood}><boxGeometry args={[0.03, 0.95, 0.03]} /></mesh>)}
        {[0.75, 0.88, 1.0].map((y) => <mesh key={y} position={[0, y, -0.18]} material={mats.wood}><boxGeometry args={[0.36, 0.05, 0.02]} /></mesh>)}
      </group>
      {/* lace curtains gathered at both sides of the window, just inside the glass */}
      {[-1, 1].map((sd) => <mesh key={sd} position={[WINX + sd * 0.31, WIN_Y + WIN_H / 2 + 0.04, FRONT_Z - 0.2]} material={mats.lace}><planeGeometry args={[0.24, WIN_H + 0.2]} /></mesh>)}
      <mesh position={[WINX, WIN_Y + WIN_H + 0.06, FRONT_Z - 0.19]} material={mats.brass}><cylinderGeometry args={[0.008, 0.008, WIN_W + 0.3, 8]} /></mesh>
    </group>
  );
};
// the parlour window's own sash (2 over 2), its glass with frost in the corners
const RealWindow = () => {
  const mats = useMemo(() => ({
    sash: new THREE.MeshStandardMaterial({ color: "#D9D5CB", roughness: 0.7 }),
    glass: new THREE.MeshStandardMaterial({ color: "#B9CCE6", roughness: 0.04, metalness: 0.1, transparent: true, opacity: 1, alphaMap: frostTex(), envMapIntensity: 1.3, depthWrite: false })
  }), []);
  const z = FRONT_Z - 0.06, x0 = WINX, yb = WIN_Y, ym = WIN_Y + WIN_H / 2, yt = WIN_Y + WIN_H;
  const bar = (x, y, w, h, d = 0.045, dz = 0) => <mesh position={[x, y, z + dz]} material={mats.sash} castShadow><boxGeometry args={[w, h, d]} /></mesh>;
  return (
    <group>
      {/* the sashes: stiles, rails, the meeting rail, a muntin in each */}
      {bar(x0 - WIN_W / 2 + 0.025, ym, 0.05, WIN_H)}{bar(x0 + WIN_W / 2 - 0.025, ym, 0.05, WIN_H)}
      {bar(x0, yt - 0.03, WIN_W, 0.06)}{bar(x0, yb + 0.045, WIN_W, 0.09)}
      {bar(x0, ym + 0.02, WIN_W, 0.04, 0.04, -0.012)}{bar(x0, ym - 0.02, WIN_W, 0.04, 0.04, 0.012)}
      {bar(x0, (ym + yt) / 2, 0.022, WIN_H / 2 - 0.08, 0.03, -0.012)}
      {/* the glass: upper and lower panes (frost creeping in from the corners) */}
      {[[x0 - WIN_W / 4 + 0.006, (ym + yt) / 2, -0.012, WIN_W / 2 - 0.06], [x0 + WIN_W / 4 - 0.006, (ym + yt) / 2, -0.012, WIN_W / 2 - 0.06], [x0, (yb + ym) / 2 + 0.02, 0.012, WIN_W - 0.1]].map(([x, y, dz, pw], i) => (
        <mesh key={i} position={[x, y, z + dz]} material={mats.glass} renderOrder={3}><planeGeometry args={[pw, WIN_H / 2 - 0.08]} /></mesh>
      ))}
      {/* the warm spill on the snow under the lit windows */}
      <mesh position={[x0, 0.04, FRONT_Z + 1.1]} rotation-x={-Math.PI / 2} renderOrder={2}><planeGeometry args={[2.2, 2.6]} /><meshBasicMaterial map={poolTex()} color="#FFB46A" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <Glow position={[x0, WIN_Y + WIN_H * 0.45, FRONT_Z + 0.15]} size={2.6} color="#FFB060" opacity={0.22} />
    </group>
  );
};
// a soft radial pool (the warm light spilling from a window onto the snow)
export const poolTex = () => canvasTex("b_pool", 128, 128, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.4, "rgba(255,255,255,0.45)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
// chimney smoke: soft puffs drifting up and leaning with the air
const smokeTex = () => canvasTex("b_smoke", 128, 128, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,0.55)"); g.addColorStop(0.6, "rgba(255,255,255,0.18)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
export const Smoke = ({ f, at, n = 14, rise = 0.035, color = "#AFC0D6" }) => {
  const tex = useMemo(smokeTex, []);
  return (
    <group position={at}>
      {Array.from({ length: n }, (_, i) => {
        const life = 140, t = ((f + i * (life / n)) % life) / life;
        const y = t * life * rise, x = t * t * 2.2 + Math.sin(t * 6 + i) * 0.15, s = 0.5 + t * 2.4;
        return <sprite key={i} position={[x, y, 0]} scale={[s, s, s]}><spriteMaterial map={tex} color={color} transparent opacity={0.32 * Math.sin(Math.PI * t) * (1 - t * 0.4)} depthWrite={false} /></sprite>;
      })}
    </group>
  );
};

// ── the rural mailbox (READ / DUMMERSTON, VT.): a galvanised tunnel box on a 4×4 post, hand-lettered in black on its lane side ────
const mailTex = () => canvasTex("b_mailbox_v1", 1024, 330, (c, w, h) => {
  // galvanised sheet: a cool grey with spangle, a little rust bloom along the bottom seam; lettering brushed on in black
  c.fillStyle = "#9AA3AE"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "230,236,244" : "60,66,76"},${0.04 + rnd(i + 1) * 0.08})`; c.beginPath(); c.ellipse(rnd(i + 2) * w, rnd(i + 3) * h, 6 + rnd(i + 4) * 22, 4 + rnd(i + 5) * 14, rnd(i) * 3, 0, 7); c.fill(); }
  const g = c.createLinearGradient(0, h - 60, 0, h); g.addColorStop(0, "rgba(120,70,40,0)"); g.addColorStop(1, "rgba(120,70,40,0.35)"); c.fillStyle = g; c.fillRect(0, h - 60, w, 60);
  c.fillStyle = "#14171B"; c.textAlign = "center"; c.textBaseline = "alphabetic";
  c.font = `700 168px ${SIGNF}`; c.fillText("READ", w / 2, 190);
  c.font = `600 64px ${SIGNF}`; c.fillText("DUMMERSTON, VT.", w / 2, 290);
});
const Mailbox = () => {
  const mats = useMemo(() => ({
    galv: new THREE.MeshStandardMaterial({ color: "#9AA3AE", roughness: 0.42, metalness: 0.7 }),
    side: new THREE.MeshStandardMaterial({ map: mailTex(), roughness: 0.45, metalness: 0.55 }),
    post: new THREE.MeshStandardMaterial({ color: "#6A5E52", roughness: 0.95 }),
    flag: new THREE.MeshStandardMaterial({ color: "#9E2B25", roughness: 0.6 }),
    snow: new THREE.MeshStandardMaterial({ color: "#E6EEFA", roughness: 0.8 })
  }), []);
  const W2 = 0.09, HB = 0.15, L = 0.5, y0 = MB.top - 0.085 - HB, gy = hgt(MB.x, MB.z);
  return (
    <group position={[MB.x, gy, MB.z]} rotation-y={MB.ry}>
      {/* the 4×4 post (leaning a hair), the arm the box sits on */}
      <mesh position={[0, (y0 - 0.02) / 2 - 0.1, -0.05]} rotation-z={0.015} material={mats.post}><boxGeometry args={[0.09, y0 + 0.16, 0.09]} /></mesh>
      <mesh position={[0, y0 - 0.03, 0]} material={mats.post}><boxGeometry args={[0.12, 0.05, 0.46]} /></mesh>
      {/* the tunnel box: flat sides, a half-round top, the door at the lane end with its latch, the lettered side */}
      <mesh position={[0, y0 + HB / 2, 0]} material={mats.galv}><boxGeometry args={[2 * W2, HB, L]} /></mesh>
      <mesh position={[0, y0 + HB, 0]} rotation-x={Math.PI / 2} material={mats.galv}><cylinderGeometry args={[W2, W2, L, 24, 1, false, Math.PI / 2, Math.PI]} /></mesh>
      <mesh position={[W2 + 0.0015, y0 + HB / 2 + 0.005, 0]} rotation-y={Math.PI / 2} material={mats.side}><planeGeometry args={[L * 0.94, HB * 0.97]} /></mesh>
      <mesh position={[0, y0 + HB * 0.8, L / 2 + 0.006]} material={mats.galv}><boxGeometry args={[2 * W2 + 0.01, HB * 1.6 + 0.02, 0.012]} /></mesh>
      <mesh position={[0, y0 + HB + 0.07, L / 2 + 0.016]} material={mats.post}><boxGeometry args={[0.03, 0.02, 0.02]} /></mesh>
      {/* the red flag on the far side, down */}
      <mesh position={[-W2 - 0.01, y0 + 0.07, -0.05]} material={mats.flag}><boxGeometry args={[0.008, 0.035, 0.26]} /></mesh>
      <mesh position={[-W2 - 0.01, y0 + 0.07, -0.21]} material={mats.flag}><boxGeometry args={[0.008, 0.1, 0.07]} /></mesh>
      {/* snow on the round top: a blanket following its curve, thicker along the crown */}
      <mesh position={[0, y0 + HB + 0.004, 0]} rotation-x={Math.PI / 2} material={mats.snow}><cylinderGeometry args={[W2 + 0.005, W2 + 0.005, L - 0.03, 24, 1, false, Math.PI / 2 + 0.75, Math.PI - 1.5]} /></mesh>
      <mesh position={[0, y0 + HB + W2 - 0.004, 0]} scale={[0.075, 0.03, (L - 0.04) / 2]} material={mats.snow}><sphereGeometry args={[1, 20, 12]} /></mesh>
    </group>
  );
};
// the hand-placed contact shadows (b_fakeshade): where things meet the snow, leaning with the key (FARM_KEY)
const buildFarmShade = (s) => {
  const [kx, kz] = keyDir(FARM_KEY);
  const off = (x, z, d) => [x + kx * d, z + kz * d];
  // the farmhouse, the ell and the woodshed: a soft dark band along every wall foot on the snow
  const foot = (x0, x1, z0, z1, k = 0.45) => {
    s.edge([(x0 + x1) / 2, 0.03, z1], [1, 0, 0], [0, 0, 1], x1 - x0, 1.1, k); s.edge([(x0 + x1) / 2, 0.03, z0], [1, 0, 0], [0, 0, -1], x1 - x0, 1.1, k * 0.8);
    s.edge([x0, 0.03, (z0 + z1) / 2], [0, 0, 1], [-1, 0, 0], z1 - z0, 1.1, k * 0.8); s.edge([x1, 0.03, (z0 + z1) / 2], [0, 0, 1], [1, 0, 0], z1 - z0, 1.4, k);
  };
  foot(HOUSE.x - HOUSE.w / 2, HOUSE.x + HOUSE.w / 2, HOUSE.z - HOUSE.d / 2, HOUSE.z + HOUSE.d / 2 + 2.15, 0.4);
  foot(HOUSE.x + HOUSE.w / 2 + 2.6 - 2.6, HOUSE.x + HOUSE.w / 2 + 2.6 + 2.6, HOUSE.z - 0.8 - 2.5, HOUSE.z - 0.8 + 2.5, 0.42);
  foot(HOUSE.x + HOUSE.w / 2 + 7.5 - 2.1, HOUSE.x + HOUSE.w / 2 + 7.5 + 2.1, HOUSE.z - 1.2 - 2.2, HOUSE.z - 1.2 + 2.2, 0.42);
  foot(BARN.x - BARN.wid / 2, BARN.x + BARN.wid / 2, BARN.z - BARN.len / 2, BARN.z + BARN.len / 2, 0.45);
  // the mailbox post, the milk-can stand, the hand pump, the porch steps
  const [mx, mz] = off(MB.x, MB.z, 0.12); s.floor("blob", [mx, hgt(MB.x, MB.z) + 0.03, mz], 0.5, 0.42, 0, 0.6);
  const [cx, cz] = off(10.4, 7.6, 0.3); s.floor("rect", [cx, hgt(10.4, 7.6) + 0.03, cz], 2.0, 1.3, -0.2, 0.5);
  s.floor("blob", [HOUSE.x + HOUSE.w / 2 + 1.0, 0.03, HOUSE.z + 3.6], 0.9, 0.9, 0, 0.5);
};
// bare sugar maples (front yard, by the barn, along the wall), each from its own seed
const MAPLES = [{ p: [-10.5, hgt(-10.5, 1.0) - 0.1, 1.0], h: 12, seed: 11 }, { p: [6.6, -0.1, 3.2], h: 10.5, seed: 12 }, { p: [-19, hgt(-19, 7) - 0.1, 7], h: 11, seed: 13 }, { p: [24, hgt(24, 7.5) - 0.1, 7.5], h: 10, seed: 14 }];
const Scene = ({ f }) => {
  const pines = useMemo(pineItems, []);
  return (
    <group>
      <Sky zenith="#030E22" mid="#0A2B57" horizon="#5A86BE" glowAt={0.5} />
      <Ridges />
      <Snowfield hgt={hgt} size={300} segs={200} />
      <Built build={buildFarm} />
      <Conifers items={pines} near={[0, -6]} farDist={30} />
      <Maples items={MAPLES} />
      <Parlour f={f} />
      <RealWindow />
      <Mailbox />
      <ShadeLayer build={buildFarmShade} />
      {/* the kitchen window glows too; the ell's chimney smokes (the stove is lit) */}
      <Glow position={[HOUSE.x + HOUSE.w / 2 + 2.6 - 1.2, 1.75, HOUSE.z - 0.8 + 2.6]} size={2.2} color="#FFB060" opacity={0.25} />
      <mesh position={[HOUSE.x + HOUSE.w / 2 + 1.4, 0.04, HOUSE.z + 3.2]} rotation-x={-Math.PI / 2}><planeGeometry args={[2, 2.2]} /><meshBasicMaterial map={poolTex()} color="#FFB46A" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <Smoke f={f} at={[HOUSE.x + HOUSE.w / 2 + 2.6 + 1.4, 2.75 + 0.4 + 2.3, HOUSE.z - 0.8 - 0.6]} />
    </group>
  );
};

// ── the camera (local; + FARM_O) ─────────────────────────────────────────────────────────────────────────────────────────
const shots = () => {
  const t = T();
  const aim = [DIPLOMA.x, DIPLOMA.y - 0.01, DIPLOMA.z];
  const mb = [MB.x, hgt(MB.x, MB.z) + MB.top - 0.06, MB.z];
  const u = [-Math.cos(MB.ry), Math.sin(MB.ry)].map((v) => -v);          // the lettered side's outward normal (toward the lens), [x, z]
  const at = (d, y) => [mb[0] + u[0] * d, mb[1] + y, mb[2] + u[1] * d];
  // aim FAR along the ray through the mailbox (≈ the house's distance), so the tilt up to the house turns at an even angular rate
  // (a near aim lerped to a far one front-loads the whole turn into a few frames)
  const far = (p, q, L = 19) => { const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], n = Math.hypot(...d); return p.map((v, i) => v + d[i] / n * L); };
  return [
    // the match cut (A's hook ends square-on to the printed band on the certificate stack): square-on to the mailbox's lettered side —
    // READ lands on "Read"; the road wall and the farmhouse lie straight beyond it
    { a: t.start, b: t.start, cut: true, pos: at(1.7, -0.02), target: far(at(1.7, -0.02), [mb[0], mb[1] - 0.12, mb[2]]), fov: 30 },
    // a slow rise over the box, tilting down onto its snowy top (DUMMERSTON, VT. still reads on "Vermont")
    { a: t.start, b: t.vermont + 6, pos: at(1.75, 0.75), target: far(at(1.75, 0.75), [mb[0] - u[0] * 0.3, mb[1] - 0.06, mb[2] - u[1] * 0.3]), fov: 30 },
    // one crane up, tilting onto the farmhouse up the lane (the mailbox sinks out under the frame) — on "farm"
    { a: t.vermont - 14, b: t.farm + 24, pos: [WINX + 0.25, 3.3, 5.2], target: [WINX + 0.6, 1.9, -6], fov: 34 },
    // one slow push up the lane into the lit parlour window (the diploma on "high school.")
    { a: t.farm - 10, b: t.school + 6, pos: [PANE_X + 0.05, 1.58, FRONT_Z + 1.75], target: aim, fov: 21 },
    // creeping on until the diploma's paper fills the frame at the match cut to Haviland's sign
    { a: t.school - 6, b: t.end + 14, pos: [PANE_X, 1.6, FRONT_Z + 0.95], target: aim, fov: 19 }
  ].map((sh) => ({ ...sh, pos: A(sh.pos), target: A(sh.target) }));
};
// rev STYLE: no 2-D labels (the names are on the mailbox, the year on the diploma); nothing visibly acts here, so no sound (rules 14–18)
const Overlay = () => null;
const sfx = () => [];
export const ST = { id: "farm", origin: FARM_O, from: W0().start - 8, to: W0().end + 8, light: { target: [2, 0, -2], key: FARM_KEY, keyColor: "#C4D8F6", shadowBox: 24, keyI: 2.1, fillI: 0.3, rimI: 1.2 }, shots, Scene, Overlay, sfx };
