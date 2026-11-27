// @ts-nocheck
// ★ V39 station FARM (builder B): "Ronald Read grew up poor on a Vermont farm and was the first in his family to finish high school."
//   A poor 1920s–30s hill farm in Dummerston, Vermont, at blue hour in winter: a weathered clapboard farmhouse (one window lit) with its
//   kitchen ell, a sun-silvered board barn with a tin roof and cupola, fieldstone walls and a split-rail fence across the snowy
//   fields, milk cans on their stand by the lane, bare sugar maples and dark pines up the hill, the Green Mountains in the haze.
//   217  (cut, the dissolve from the hook) a low wide view across the field; the camera cranes up and dollies in.
//        Tag BORN 1921 on "Ronald" (the house he grew up in); DUMMERSTON, VERMONT on the 2nd "Vermont".
//   ~304 "first … high school": the camera eases toward the lit parlour window — through its lower sash the framed diploma on the
//        wallpapered wall in lamplight: BRATTLEBORO UNION HIGH SCHOOL · CLASS OF 1940 (FACTCHECK row 2; no name on it).
//        Tag CLASS OF 1940 on "high school." (gone before the dissolve to the gas station at 370).
import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { Sky, Glow, rnd, canvasTex, ease } from "./kit";
import { Tag } from "./overlays";
import { cueAt } from "../bnx/SfxLayer";
import { WIN, wAt } from "./windows";
import { Built, addHouse, addStoneWall, addRailFence, addMaple, Pines, Snowfield, Ridges, fbm, smooth, bpick } from "./b_winter";
import { diplomaTex, wallpaperTex } from "./b_diploma";
import { Mesher } from "./town_parts";

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
    door: [{ f: "front", x: 0, w: 0.92, h: 2.05, cell: 0, steps: 2, stepC: "#7E8085" }]
  });
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
  // the farm lane: wheel ruts through the snow (two darker trodden bands) from the road up to the ell door
  // (drawn as thin flattened boxes on the ground, following it)
  for (let i = 0; i < 46; i++) {
    const t = i / 45, z = 34 - t * 37, x = 11.6 - 8.4 * t + Math.sin(t * 3) * 0.8, z2 = z - 37 / 45;
    for (const sd of [-0.75, 0.75]) m.box("snow", [x + sd, hgt(x + sd, z) + 0.012, z - 0.4], [0.42, 0.02, 0.9], "#C8D2E0", { r: [0, -0.22 * (1 - t), 0] });
  }
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
  for (let i = 0; i < 22; i++) {
    const t = i / 21, x = HOUSE.x + (5.6 - HOUSE.x) * t + Math.sin(t * 3.2) * 0.9, z = FRONT_Z + 0.9 + (7.4 - FRONT_Z - 0.9) * t;
    m.box("snow", [x, 0.012, z], [0.75, 0.016, 0.62], "#C9D3E1", { r: [0, -0.5 - Math.cos(t * 3.2) * 0.4, 0] });
  }
  // bare sugar maples (front yard, by the barn, along the wall)
  addMaple(m, [-10.5, hgt(-10.5, 1.0), 1.0], 11, 1);
  addMaple(m, [6.6, 0, 3.2], 9.5, 2);
  addMaple(m, [-19, hgt(-19, 7), 7], 10, 3);
  addMaple(m, [24, hgt(24, 7.5), 7.5], 9, 4);
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
      frame: new THREE.MeshStandardMaterial({ color: "#3A2416", roughness: 0.45, metalness: 0.05 }),
      gilt: new THREE.MeshStandardMaterial({ color: "#B08D4A", roughness: 0.35, metalness: 0.8 }),
      glassF: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.05, metalness: 0.0, transparent: true, opacity: 0.08, envMapIntensity: 1.2 }),
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
        <mesh material={mats.frame} castShadow><boxGeometry args={[FRAME.w, FRAME.h, 0.035]} /></mesh>
        <mesh position={[0, 0, 0.0185]} material={mats.gilt}><boxGeometry args={[FRAME.w - 0.07, FRAME.h - 0.07, 0.003]} /></mesh>
        <mesh position={[0, 0, 0.0205]} material={mats.mat}><planeGeometry args={[FRAME.w - 0.085, FRAME.h - 0.085]} /></mesh>
        <mesh position={[0, -0.004, 0.0215]} material={mats.dip}><planeGeometry args={[DIPLOMA.w, DIPLOMA.h]} /></mesh>
        <mesh position={[0, 0, 0.024]} material={mats.glassF}><planeGeometry args={[FRAME.w - 0.07, FRAME.h - 0.07]} /></mesh>
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

const Scene = ({ f }) => {
  const pines = useMemo(pineItems, []);
  return (
    <group>
      <Sky zenith="#030E22" mid="#0A2B57" horizon="#5A86BE" glowAt={0.5} />
      <Ridges />
      <Snowfield hgt={hgt} size={300} segs={200} />
      <Built build={buildFarm} />
      <Pines items={pines} />
      <Parlour f={f} />
      <RealWindow />
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
  const fin = [PANE_X, 1.53, FRONT_Z + 1.45], aim = [DIPLOMA.x, DIPLOMA.y - 0.01, DIPLOMA.z];
  return [
    { a: t.start, b: t.start, cut: true, pos: A([-7.5, 2.3, 24]), target: A([1.8, 3.6, -9]), fov: 46 },
    { a: t.start, b: t.first + 4, pos: A([-6.2, 4.4, 13.0]), target: A([WINX + 0.6, 2.3, FRONT_Z - 1]), fov: 40 },      // crane up, dolly in
    { a: t.first - 10, b: t.school + 2, pos: A([PANE_X, 1.56, FRONT_Z + 1.7]), target: A(aim), fov: 21 },            // ease in to the lit window
    { a: t.school - 6, b: t.end + 14, pos: A(fin), target: A(aim), fov: 20.5 }                                        // and keep drifting in
  ];
};
const Overlay = ({ f, P }) => {
  const t = T();
  const house = P([HOUSE.x + 0.0, HOUSE.found + 2.2, FRONT_Z + 0.05]);
  const ridge = P([HOUSE.x - 1.2, HOUSE.h + HOUSE.found + 3.0, HOUSE.z]);
  const cls = P([DIPLOMA.x, DIPLOMA.y - 0.08, DIPLOMA.z + 0.03]);
  return (
    <>
      <Tag text="Born 1921" at={t.ronald} out={t.vermont - 10} x={96} y={430} to={house.behind ? null : house} />
      <Tag text="Dummerston, Vermont" at={t.vermont - 2} out={t.first - 4} x={96} y={330} to={ridge.behind ? null : ridge} />
      <Tag text="Class of 1940" at={t.school - 10} out={t.end - 11} x={110} y={400} to={cls.behind ? null : cls} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("ee_click_click_01", t.ronald, 10, 0.32),
    cueAt("whooshsoft", t.start + 30, 30, 0.3),                 // the crane up
    cueAt("ee_click_click_01", t.vermont - 2, 10, 0.32),
    cueAt("whooshsoft", t.first + 18, 34, 0.35),                // the push to the window (fastest ≈ mid-move)
    cueAt("ee_click_click_01", t.school - 10, 10, 0.3)
  ];
};
export const ST = { id: "farm", origin: FARM_O, from: W0().start - 8, to: W0().end + 8, light: { target: [2, 0, -6], shadowBox: 22, keyI: 1.15, fillI: 0.42, rimI: 1.0 }, shots, Scene, Overlay, sfx };
