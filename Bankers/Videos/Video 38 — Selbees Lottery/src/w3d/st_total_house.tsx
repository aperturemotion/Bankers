// @ts-nocheck
// ★ V38 builder D — a modest one-storey home at night (the Selbees' kind of house in Evart, generic): a ranch house with lap
//   siding, an asphalt-shingle gable roof, white trim, shutters, warm lit windows with curtains, a porch light over the door, an
//   attached garage, a brick chimney, foundation, steps, shrubs. Local coords: the front face at z = +3.5, ground y 0.
//   PICTURE = the big front window's centre (local) — the total station pushes into it.
//   rev 2 (builder A, Timur 2026-11-26: the town's houses "a lot more detailed … in all of the scenes"): built from the town kit
//   (town_parts.tsx), merged per material: real lap siding with a bump map, corner boards, frieze, soffit, fascia, gutters and
//   downspouts, rake boards, a 3-tab shingle roof with a ridge cap, gable vents, a brick chimney with its cap, flue and flashing;
//   cased windows with sills, aprons, head caps, louvered shutters; a panelled front door with its lit lite, a pediment, a porch with
//   a shingled roof, turned posts, a railing, concrete steps and a lantern; the garage with a raised-panel door, its window row, two
//   coach lamps; an AC condenser, foundation vents, shrubs. The picture window keeps a clear centre pane: the push into it ends in
//   the room's warm light, never on a muntin.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd, Glow } from "./kit";
import { Town, winRect } from "./town_parts";
import { HomeRooms } from "./h_home_room";
import { Shade, wallBand, floorBand, floorBlob, footRect } from "./st_state_fx";

export const PICTURE = [1.6, 1.75, 3.5];
// a lit room seen through the front window: a warm wall with a lamp, a framed picture, a bookcase, a sofa back, curtains drawn aside
const roomTex = (key, wide) => canvasTex("hs_room2_" + key, wide ? 2048 : 1024, wide ? 1144 : 888, (c, w, h) => {
  const g = c.createRadialGradient(w * 0.55, h * 0.4, 10, w * 0.5, h * 0.5, w * 0.75);
  g.addColorStop(0, "#FFF4E2"); g.addColorStop(0.3, "#F6D9AE"); g.addColorStop(0.72, "#C99A68"); g.addColorStop(1, "#6E5038");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(120,84,56,0.25)"; c.fillRect(0, h * 0.06, w, h * 0.015);                       // the crown molding
  // a framed print (a lake at dusk) and a bookcase
  const fx = w * 0.24, fy = h * 0.22, fw = w * 0.18, fh = h * 0.2;
  c.fillStyle = "#5A3E2A"; c.fillRect(fx, fy, fw, fh); c.fillStyle = "#F1E6D2"; c.fillRect(fx + w * 0.012, fy + w * 0.012, fw - w * 0.024, fh - w * 0.024);
  const sg = c.createLinearGradient(0, fy, 0, fy + fh); sg.addColorStop(0, "#7FA3CC"); sg.addColorStop(1, "#E9C89A"); c.fillStyle = sg; c.fillRect(fx + w * 0.022, fy + w * 0.022, fw - w * 0.044, fh * 0.5);
  c.fillStyle = "#3E5A78"; c.fillRect(fx + w * 0.022, fy + w * 0.022 + fh * 0.5, fw - w * 0.044, fh - w * 0.044 - fh * 0.5);
  const bx = w * 0.68, by = h * 0.18, bw = w * 0.16, bh = h * 0.58;
  c.fillStyle = "#5A3E2A"; c.fillRect(bx, by, bw, bh);
  for (let r = 0; r < 5; r++) { let x = bx + 8; while (x < bx + bw - 14) { const sw = 8 + rnd(x + r) * 14; c.fillStyle = ["#8A3E34", "#2E4F7A", "#C9B48A", "#4E6E5E", "#E2D6BE", "#6A4A7A", "#B07A3A"][Math.floor(rnd(x * 3 + r) * 7)]; c.fillRect(x, by + 10 + r * bh / 5 + rnd(x) * 10, sw - 2, bh / 5 - 22 - rnd(x) * 10); x += sw; } c.fillStyle = "#4A3222"; c.fillRect(bx, by + (r + 1) * bh / 5 - 8, bw, 8); }
  // the table lamp's glow
  const lx = w * 0.56, ly = h * 0.55;
  const lg = c.createRadialGradient(lx, ly, 4, lx, ly, w * 0.3); lg.addColorStop(0, "rgba(255,248,226,0.95)"); lg.addColorStop(1, "rgba(255,230,180,0)"); c.fillStyle = lg; c.fillRect(0, 0, w, h);
  c.fillStyle = "#FFF3D6"; c.beginPath(); c.moveTo(lx - w * 0.04, ly); c.lineTo(lx + w * 0.04, ly); c.lineTo(lx + w * 0.026, ly - h * 0.09); c.lineTo(lx - w * 0.026, ly - h * 0.09); c.fill();
  c.fillStyle = "#6E5038"; c.fillRect(lx - 4, ly, 8, h * 0.12); c.fillStyle = "#5A3E2A"; c.fillRect(lx - w * 0.06, ly + h * 0.12, w * 0.12, h * 0.05);
  // the sofa back and its cushions
  c.fillStyle = "#4E5F78"; c.fillRect(0, h * 0.76, w, h * 0.24); c.fillStyle = "rgba(255,240,220,0.18)"; c.fillRect(0, h * 0.76, w, h * 0.02);
  for (let k = 0; k < 4; k++) { c.fillStyle = k % 2 ? "#C9B48A" : "#8A9BB5"; c.beginPath(); c.roundRect(w * (0.1 + k * 0.22), h * 0.7, w * 0.12, h * 0.12, 18); c.fill(); }
  // curtains drawn aside (folds), a valance
  for (const side of [0, 1]) {
    const cw = w * 0.13, x0 = side ? w - cw : 0;
    for (let k = 0; k < 8; k++) { const gx = x0 + k * cw / 8, cg = c.createLinearGradient(gx, 0, gx + cw / 8, 0); cg.addColorStop(0, "#C9BFAE"); cg.addColorStop(0.5, "#EEE7DA"); cg.addColorStop(1, "#C9BFAE"); c.fillStyle = cg; c.fillRect(gx, 0, cw / 8 + 1, h); }
  }
  c.fillStyle = "#D8CFC0"; c.fillRect(0, 0, w, h * 0.07); c.fillStyle = "rgba(0,0,0,0.15)"; c.fillRect(0, h * 0.07, w, 4);
});
// a raised-panel garage door with a row of lit lites
const garageTex = () => canvasTex("hs_garage2", 1024, 600, (c, w, h) => {
  c.fillStyle = "#DDE3EA"; c.fillRect(0, 0, w, h);
  const rows = 4, cols = 4, rh = h / rows;
  for (let r = 0; r < rows; r++) {
    c.fillStyle = "rgba(30,44,66,0.45)"; c.fillRect(0, r * rh, w, 3);
    for (let k = 0; k < cols; k++) {
      const x = k * w / cols + 18, y = r * rh + 20, pw = w / cols - 36, ph = rh - 40;
      if (r === 0) { const g = c.createLinearGradient(0, y, 0, y + ph); g.addColorStop(0, "#FFE6BE"); g.addColorStop(1, "#D9A262"); c.fillStyle = g; c.fillRect(x, y, pw, ph); c.fillStyle = "rgba(255,255,255,0.3)"; c.fillRect(x, y, pw, 5); continue; }
      const g = c.createLinearGradient(x, y, x + pw, y + ph); g.addColorStop(0, "rgba(255,255,255,0.7)"); g.addColorStop(0.5, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(30,44,66,0.3)");
      c.fillStyle = g; c.fillRect(x, y, pw, ph); c.strokeStyle = "rgba(30,44,66,0.35)"; c.lineWidth = 3; c.strokeRect(x + 14, y + 14, pw - 28, ph - 28);
    }
  }
  c.fillStyle = "#8C97A8"; c.fillRect(w / 2 - 40, h - 40, 80, 10);
});
const garageE = () => canvasTex("hs_garage2E", 1024, 600, (c, w, h) => { c.fillStyle = "#000"; c.fillRect(0, 0, w, h); for (let k = 0; k < 4; k++) { const g = c.createLinearGradient(0, 20, 0, 130); g.addColorStop(0, "#C9A070"); g.addColorStop(1, "#7A5428"); c.fillStyle = g; c.fillRect(k * w / 4 + 18, 20, w / 4 - 36, 110); } });
const gable = (w, h, d) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g; };
const TRIM = "#E9EDF2";
// the merged house: the main block (10 × 7), its roof (ridge along x), the porch, the garage at x 7.6
const buildHouse = (m, siding, sideLit, open = false) => {
  const MT = { metric: true };
  // foundation: a poured base with block coursing (the trim's noise) and two crawl-space vents
  m.box("trim", [0, 0.18, 0], [10.2, 0.36, 7.2], "#6C7482", MT);
  for (const x of [-3.9, 3.0]) { m.box("metal", [x, 0.2, 3.605], [0.4, 0.16, 0.02], "#2A3240"); for (let k = 0; k < 4; k++) m.box("metal", [x, 0.14 + k * 0.04, 3.617], [0.36, 0.012, 0.01], "#8C97A8"); }
  // walls: lap siding (tinted), corner boards, the frieze under the eaves
  if (!open) m.box("siding", [0, 1.83, 0], [10, 2.94, 7], siding, MT);
  else {
    // (rev 4, builder H) the hero house is hollow behind its two front windows: the back block, the side walls, and the front wall in
    //   pieces round the window openings (0.12 thick: z 3.38…3.5); the rooms themselves are h_home_room's
    const fw = (x0, x1, y0, y1) => m.box("siding", [(x0 + x1) / 2, (y0 + y1) / 2, 3.44], [x1 - x0, y1 - y0, 0.12], siding, MT);
    const Y0 = 0.36, Y1 = 3.3, [px, py] = PICTURE, pw = 1.3, ph = 0.725;
    fw(-5, -3.75, Y0, Y1); fw(-3.75, -2.25, Y0, 1.1); fw(-3.75, -2.25, 2.4, Y1); fw(-2.25, px - pw, Y0, Y1);
    fw(px - pw, px + pw, Y0, py - ph); fw(px - pw, px + pw, py + ph, Y1); fw(px + pw, 5, Y0, Y1);
    m.box("siding", [0, 1.83, -2.74], [10, 2.94, 1.52], siding, MT);
    for (const sd of [-1, 1]) m.box("siding", [sd * 4.94, 1.83, 0.8], [0.12, 2.94, 5.4], siding, MT);
  }
  for (const x of [-4.95, 4.95]) for (const z of [-3.51, 3.51]) { m.box("trim", [x, 1.83, z], [0.16, 2.94, 0.04], TRIM); m.box("trim", [x + (x < 0 ? -0.02 : 0.02), 1.83, z - Math.sign(z) * 0.08], [0.04, 2.94, 0.16], TRIM); }
  m.box("trim", [0, 3.17, 3.52], [10, 0.22, 0.04], TRIM); m.box("trim", [0, 3.17, -3.52], [10, 0.22, 0.04], TRIM);
  // the gable ends (siding), their rake boards and louvered vents
  const gab = gable(7.0, 2.2, 0.12);
  for (const sd of [-1, 1]) {
    m.add("siding", gab, new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(sd * 4.96, 3.3, 0), siding, MT);
    for (const zs of [-1, 1]) { const ang = Math.atan2(2.2, 3.95); m.box("trim", [sd * 5.04, 3.3 + 1.1 + 0.08, zs * 1.975], [0.05, 0.2, Math.hypot(3.95, 2.2)], TRIM, { r: [zs * ang, 0, 0] }); }
    m.box("trim", [sd * 5.03, 4.25, 0], [0.04, 0.62, 0.62], TRIM);
    for (let k = 0; k < 6; k++) m.box("trim", [sd * 5.05, 4.02 + k * 0.09, 0], [0.04, 0.025, 0.5], "#C9D1DB", { r: [0, 0, sd * 0.5] });
  }
  // the roof: two shingled slabs, a ridge cap; soffit, fascia, gutters, downspouts
  const half = 3.5 + 0.45, rise = 2.2, len = Math.hypot(half, rise), ang = Math.atan2(rise, half);
  for (const sd of [-1, 1]) {
    m.box("shingle", [0, 3.3 + rise / 2, sd * half / 2], [10 + 0.9, 0.12, len], "#FFFFFF", { r: [sd * ang, 0, 0], metric: true });
    m.box("trim", [0, 3.24, sd * 3.73], [10.9, 0.03, 0.46], TRIM);
    m.box("trim", [0, 3.18, sd * 3.98], [10.9, 0.2, 0.05], TRIM);
    m.box("metal", [0, 3.16, sd * 4.07], [10.9, 0.12, 0.13], "#E4EAF2");
    for (const x of [-5.25, 5.25]) { m.box("metal", [x, 1.75, sd * 4.07], [0.08, 2.7, 0.08], "#E4EAF2"); m.box("metal", [x, 0.42, sd * 4.2], [0.08, 0.08, 0.3], "#E4EAF2"); }
  }
  m.box("shingle", [0, 3.3 + rise + 0.03, 0], [10.9, 0.08, 0.36], "#C9CDD4", { metric: true });
  // the chimney: brick, a stone cap, a flue, the flashing
  m.box("brick1", [-3.2, 5.0, -1.2], [0.8, 2.6, 0.8], "#FFFFFF", MT);
  m.box("trim", [-3.2, 6.35, -1.2], [0.95, 0.12, 0.95], "#8D97A6"); m.cyl("metal", [-3.1, 6.55, -1.1], 0.09, 0.3, "#4A5262", { seg: 10 });
  m.box("metal", [-3.2, 4.55, -0.78], [0.86, 0.08, 0.06], "#5E6876");
  // front windows' trim (the glazing is the lit room, below): casings, sills with aprons, head caps, shutters with louvers
  const win = (x, y, w, h, mull) => {
    for (const sd of [-1, 1]) m.box("trim", [x + sd * (w / 2 + 0.07), y, 3.56], [0.14, h + 0.12, 0.08], TRIM);
    m.box("trim", [x, y + h / 2 + 0.09, 3.56], [w + 0.3, 0.16, 0.08], TRIM); m.box("trim", [x, y + h / 2 + 0.2, 3.6], [w + 0.4, 0.06, 0.16], TRIM);
    m.box("trim", [x, y - h / 2 - 0.06, 3.62], [w + 0.4, 0.06, 0.22], TRIM); m.box("trim", [x, y - h / 2 - 0.16, 3.56], [w + 0.16, 0.12, 0.05], TRIM);
    for (const mx of mull) m.box("trim", [x + mx, y, 3.545], [0.07, h, 0.05], TRIM);
    for (const sd of [-1, 1]) {
      const sx = x + sd * (w / 2 + 0.42);
      m.box("trim", [sx, y, 3.55], [0.5, h + 0.1, 0.04], "#20344F");
      for (let k = 0; k < Math.floor(h / 0.08); k++) m.box("trim", [sx, y - h / 2 + 0.06 + k * 0.08, 3.575], [0.4, 0.03, 0.025], "#2B4466", { r: [0.35, 0, 0] });
      m.box("trim", [sx, y, 3.58], [0.42, 0.06, 0.02], "#20344F");
    }
  };
  win(-3.0, 1.75, 1.5, 1.3, [0]);
  win(PICTURE[0], PICTURE[1], 2.6, 1.45, [-0.72, 0.72]);   // a picture window: a clear centre pane between two side lights
  // side windows on the gable ends (from the town's window atlas)
  for (const sd of [-1, 1]) {
    m.quad("win", [sd * 5.005, 1.8, 1.4], 0.9, 1.2, "#FFFFFF", winRect(sideLit ? 2 : 4, sideLit ? 0 : 2), { ry: sd * Math.PI / 2 });
    for (const dz of [-0.52, 0.52]) m.box("trim", [sd * 5.03, 1.8, 1.4 + dz], [0.06, 1.36, 0.12], TRIM);
    m.box("trim", [sd * 5.03, 2.46, 1.4], [0.06, 0.12, 1.16], TRIM); m.box("trim", [sd * 5.05, 1.15, 1.4], [0.1, 0.07, 1.26], TRIM);
  }
  // the front door: a panelled door with its lit lite, casing, a pediment, the knob, the threshold
  m.quad("win", [-0.8, 1.42, 3.535], 0.94, 2.06, "#FFFFFF", winRect(4, 3));
  for (const sd of [-1, 1]) m.box("trim", [-0.8 + sd * 0.56, 1.42, 3.56], [0.14, 2.2, 0.09], TRIM);
  m.box("trim", [-0.8, 2.58, 3.57], [1.36, 0.14, 0.1], TRIM); m.box("trim", [-0.8, 2.7, 3.6], [1.46, 0.06, 0.16], TRIM);
  m.sph("metal", [-0.45, 1.38, 3.58], 0.045, "#D8B060", { seg: 10 });
  // the porch: slab, two steps, a shingled roof on two posts with bases and capitals, a low railing, the lantern
  m.box("trim", [-0.8, 0.24, 4.6], [2.6, 0.2, 1.7], "#8A929E", MT);
  m.box("trim", [-0.8, 0.16, 5.6], [1.8, 0.16, 0.36], "#8A929E", MT); m.box("trim", [-0.8, 0.07, 5.92], [1.8, 0.14, 0.3], "#8A929E", MT);
  m.box("shingle", [-0.8, 2.92, 4.42], [2.7, 0.1, 1.95], "#FFFFFF", { r: [0.18, 0, 0], metric: true });
  m.box("trim", [-0.8, 2.75, 5.36], [2.7, 0.18, 0.05], TRIM); m.box("trim", [-0.8, 2.82, 4.4], [2.6, 0.04, 1.85], TRIM);
  for (const sd of [-1, 1]) {
    const px = -0.8 + sd * 1.15;
    m.box("trim", [px, 1.5, 5.3], [0.14, 2.4, 0.14], TRIM); m.box("trim", [px, 0.42, 5.3], [0.2, 0.18, 0.2], TRIM); m.box("trim", [px, 2.66, 5.3], [0.2, 0.1, 0.2], TRIM);
    m.box("trim", [-0.8 + sd * 1.15, 0.92, 4.6], [0.06, 0.06, 1.4], TRIM); m.box("trim", [-0.8 + sd * 1.15, 0.38, 4.6], [0.06, 0.06, 1.4], TRIM);
    for (let k = 0; k < 9; k++) m.box("trim", [-0.8 + sd * 1.15, 0.65, 3.95 + k * 0.16], [0.035, 0.5, 0.035], TRIM);
  }
  m.box("metal", [0.12, 2.3, 3.6], [0.06, 0.06, 0.12], "#1B2433");
  m.box("bulb", [0.12, 2.3, 3.7], [0.13, 0.24, 0.13], "#FFE2B0"); m.box("metal", [0.12, 2.45, 3.7], [0.2, 0.06, 0.2], "#1B2433"); m.box("metal", [0.12, 2.16, 3.7], [0.16, 0.04, 0.16], "#1B2433");
  for (const ax of [-1, 1]) for (const az of [-1, 1]) m.box("metal", [0.12 + ax * 0.07, 2.3, 3.7 + az * 0.07], [0.02, 0.26, 0.02], "#1B2433");
  // the garage: siding, corner boards, a low shingled roof with fascia and gutter, the door and its casing, coach lamps, a side lite
  m.push([7.6, 0, 0.5]);
  m.box("trim", [0, 0.1, 0], [5.3, 0.2, 6.1], "#6C7482", MT);
  m.box("siding", [0, 1.4, 0], [5.2, 2.8, 6], siding, MT);
  for (const x of [2.53]) for (const z of [-3.01, 3.01]) m.box("trim", [x, 1.4, z], [0.16, 2.8, 0.04], TRIM);
  for (const sd of [-1, 1]) m.box("shingle", [0, 3.05 + 0.25, sd * 1.7], [5.8, 0.12, Math.hypot(3.4, 0.5)], "#FFFFFF", { r: [sd * Math.atan2(0.5, 3.4), 0, 0], metric: true });
  m.box("trim", [0, 2.9, 3.4], [5.8, 0.18, 0.05], TRIM); m.box("metal", [0, 2.88, 3.48], [5.8, 0.12, 0.13], "#E4EAF2");
  m.box("metal", [2.75, 1.5, 3.48], [0.08, 2.8, 0.08], "#E4EAF2");
  for (const sd of [-1, 1]) m.box("trim", [sd * 2.0, 1.2, 3.05], [0.14, 2.4, 0.1], TRIM);
  m.box("trim", [0, 2.35, 3.05], [4.1, 0.14, 0.1], TRIM);
  for (const sd of [-1, 1]) { m.box("metal", [sd * 2.25, 1.95, 3.07], [0.04, 0.14, 0.04], "#1B2433"); m.box("metal", [sd * 2.25, 2.11, 3.16], [0.18, 0.05, 0.16], "#1B2433"); m.box("metal", [sd * 2.25, 1.8, 3.16], [0.14, 0.04, 0.12], "#1B2433"); m.box("bulb", [sd * 2.25, 1.95, 3.16], [0.11, 0.26, 0.1], "#FFE2B0"); m.glow([sd * 2.25, 1.95, 3.3], "#FFC27A", 1.0); }
  m.quad("win", [2.61, 1.7, -1.2], 0.7, 0.9, "#FFFFFF", winRect(sideLit ? 3 : 1, sideLit ? 1 : 2), { ry: Math.PI / 2 });
  for (const dz of [-0.41, 0.41]) m.box("trim", [2.63, 1.7, -1.2 + dz], [0.06, 1.04, 0.1], TRIM);
  m.box("trim", [2.63, 2.2, -1.2], [0.06, 0.1, 0.92], TRIM); m.box("trim", [2.65, 1.2, -1.2], [0.1, 0.07, 1.0], TRIM);
  m.pop();
  // an AC condenser on a pad at the west wall
  m.box("trim", [-5.8, 0.04, 1.2], [1.0, 0.08, 1.0], "#8A929E"); m.box("metal", [-5.8, 0.48, 1.2], [0.8, 0.8, 0.8], "#B9C3CF");
  m.cyl("metal", [-5.8, 0.89, 1.2], 0.3, 0.03, "#2A3240", { seg: 16 }); for (let k = 0; k < 8; k++) m.box("metal", [-6.205, 0.15 + k * 0.08, 1.2], [0.01, 0.03, 0.7], "#5E6876");
  // shrubs (clusters), a mulch bed edged in stone along the front
  m.box("roof", [-1.0, 0.05, 4.1], [9.6, 0.06, 0.9], "#8C6E5A", MT);
  [-4.1, -2.0, 0.6, 2.4, 3.9].forEach((x, i) => { for (let k = 0; k < 3; k++) m.ico("plant", [x + (k - 1) * 0.32, 0.38 + (k % 2) * 0.12, 4.1 + (rnd(i * 3 + k) - 0.5) * 0.2], [0.42, 0.36 + rnd(i + k) * 0.1, 0.38], ["#1F3A4E", "#24424C", "#2A4650"][k]); });
};
// rev 6 (Timur: "we don't really want unlit objects … You can see the corners better that way"): the house's shade — under the eaves
//   and the porch roof on the front wall, the foundation's foot on the lawn, the porch slab and steps on the walk, each shrub cluster on
//   its bed, the garage door's head and its foot on the drive (every house wears it, the neighbours too)
const HOUSE_BANDS = [
  wallBand(0, 3.06, 3.535, 10, 0.55, 0.45, "+z", "top"),
  wallBand(-0.8, 2.86, 3.6, 2.7, 0.8, 0.5, "+z", "top"),
  floorBand(-1.0, 0.085, 3.62, 9.6, 0.55, 0.5, "-z"),
  ...footRect(-0.8, 0.0, 4.6, 1.3, 0.85, 0.35, 0.42),
  floorBand(-0.8, 0.0, 6.07, 1.9, 0.45, 0.45, "-z"),
  wallBand(-0.8, 0.24, 5.455, 2.5, 0.09, 0.45, "+z", "bottom"), wallBand(-0.8, 0.14, 5.785, 1.8, 0.09, 0.45, "+z", "bottom"),
  wallBand(7.6, 2.28, 3.53, 3.9, 0.28, 0.4, "+z", "top"),
  floorBand(7.6, 0.0, 3.6, 5.4, 0.5, 0.45, "-z"),
  floorBand(0, 0.0, -3.62, 10.3, 0.5, 0.4, "+z")
];
const HOUSE_BLOBS = [-4.1, -2.0, 0.6, 2.4, 3.9].map((x) => floorBlob(x, 0.08, 4.12, 0.75, 0.42, 0.5)).concat([floorBlob(-5.8, 0.0, 1.2, 0.75, 0.75, 0.5)]);
export const House = ({ lit = 1, siding = "#6C7B92" }) => {
  const open = lit > 0.8;                     // the hero house (lit 1) shows its real rooms; the neighbours in the haze keep the painted ones
  const room1 = useMemo(() => roomTex("a", true), []), room2 = useMemo(() => roomTex("b", false), []);
  const gdoor = useMemo(garageTex, []), gE = useMemo(garageE, []);
  const k = 0.55 + 0.45 * lit;
  return (
    <group>
      <Town build={(m) => buildHouse(m, siding, lit > 0.8, open)} deps={[siding, lit > 0.8, open]} />
      <Shade items={HOUSE_BANDS} />
      <Shade items={HOUSE_BLOBS} kind="blob" />
      {open && <HomeRooms lit={lit} />}
      {/* the lit rooms behind the two front windows, and their glass */}
      {[[-3.0, 1.75, 1.5, 1.3, room2], [PICTURE[0], PICTURE[1], 2.6, 1.45, room1]].map(([x, y, w, h, tex], i) => (
        <group key={i} position={[x, y, 3.52]}>
          {!open && <mesh><planeGeometry args={[w, h]} /><meshBasicMaterial map={tex} color={new THREE.Color("#FFFFFF").multiplyScalar(k)} /></mesh>}
          <mesh position={[0, 0, 0.012]}><planeGeometry args={[w, h]} /><meshStandardMaterial color="#9DB8DC" transparent opacity={open ? 0.1 : 0.08} roughness={0.05} metalness={0.6} depthWrite={false} /></mesh>
        </group>
      ))}
      <Glow position={[0.12, 2.3, 3.85]} size={1.6} color="#FFC27A" opacity={0.75} />
      {/* the garage door */}
      <mesh position={[7.6, 1.15, 3.515]}><planeGeometry args={[3.8, 2.25]} /><meshStandardMaterial map={gdoor} emissiveMap={gE} emissive="#FFFFFF" emissiveIntensity={0.6 * lit} roughness={0.55} /></mesh>
    </group>
  );
};
