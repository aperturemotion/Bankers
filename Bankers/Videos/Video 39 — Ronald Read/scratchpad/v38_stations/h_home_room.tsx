// @ts-nocheck
// ★ V38 rev 4 (builder H; Timur 2026-11-26: "detail a bit more the interior of the house") — the family home's LIVING ROOM behind the
//   picture window and the DINING ROOM behind the small window, in real 3-D (they replace the flat painted backdrops):
//   · living room: oak floor, warm-white walls with skirting and a crown moulding, a blue three-seat sofa (seat and back cushions,
//     three throw pillows, a knitted throw over the arm), an oak coffee table (books, a mug, a candle on a tray, a bowl), a rug,
//     a side table with a table lamp, a floor lamp, a white built-in bookcase full of real-looking books (titles on the spines),
//     framed pictures (a lake landscape, two abstracts), a wall clock, a tall fiddle-leaf fig in a basket, curtains on a black rod,
//     an oak TV cabinet with the television (off, glossy), a ceiling light;
//   · dining room: a table with four chairs, a pendant lamp over it, a fruit bowl and candlesticks, a sideboard, a framed harbour
//     picture, curtains.
//   No people, no portraits, no placeholder lines. Light is baked per vertex (h_tex.bake: the table lamp, floor lamp, ceiling light,
//   the pendant) into roomMat's warm glow; the scene's blue-hour lights are turned down inside (uScene).
//   Units: the House's local metres (front wall's outer face z 3.5, its inner face z 3.38; floor y 0.4; ceiling 2.75).
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Glow, canvasTex, rnd } from "./kit";
import { Kit, srgbTex, linTex, mould, cymaPts, lathe, leaf } from "./bld_kit";
import { roomMat, lamMat, bake, cell, inRect, drawPlaster, drawOak, drawWeave, drawLandscape, drawSeascape, drawAbstract, drawGeo, drawRug, drawSpine, SPINES, drawClock, grain } from "./h_tex";

const F = 0.4, C = 2.75, ZB = -1.9, ZF = 3.38;
const LX0 = -1.55, LX1 = 4.84;                       // the living room
const DX0 = -4.84, DX1 = -1.75;                      // the dining room
export const ROOM = { F, C, ZB, ZF, LX0, LX1, DX0, DX1 };
const TLAMP = [0.05, 1.4, -1.6], FLAMP = [3.08, 1.93, -1.45], CEIL = [1.6, C - 0.08, 0.7], PEND = [-3.3, 1.92, 0.45];
const LAMPS = [
  { p: TLAMP, I: 1.05, r: 1.0, cone: 1 }, { p: FLAMP, I: 1.05, r: 1.05, cone: 1 }, { p: CEIL, I: 0.55, r: 2.4 }, { p: PEND, I: 1.25, r: 1.15, cone: 1 }
];

// ── the atlas (2048²) ──────────────────────────────────────────────────────────────────────────────────────────────────
const A = { W: 2048, H: 2048 };
const SP = (i) => [i * 64, 0, 64, 448];
const C_PAGES = [0, 448, 64, 64], C_LAND = [64, 448, 768, 480], C_ABS = [832, 448, 360, 480], C_GEO = [1192, 448, 360, 480], C_CLOCK = [1552, 448, 480, 480];
const C_RUG = [0, 928, 1024, 704], C_KNIT = [1024, 928, 256, 256], C_OCHRE = [1280, 928, 256, 256], C_STRIPE = [1536, 928, 256, 256], C_THROW = [1792, 928, 256, 256];
const C_SCREEN = [1024, 1184, 512, 288], C_SEA = [1536, 1184, 512, 320], C_FRUIT = [1024, 1504, 512, 128], C_RUNNER = [0, 1632, 1024, 160];
const atlasTex = () => canvasTex("h_room_atlas", A.W, A.H, (c) => {
  c.fillStyle = "#808080"; c.fillRect(0, 0, A.W, A.H);
  for (let i = 0; i < SPINES; i++) drawSpine(c, i, ...SP(i));
  { const [x, y, w, h] = C_PAGES; c.fillStyle = "#EFE8D8"; c.fillRect(x, y, w, h); for (let k = 0; k < h; k += 3) { c.fillStyle = "rgba(120,100,70,0.18)"; c.fillRect(x, y + k, w, 1); } }
  drawLandscape(c, ...C_LAND, 11); drawAbstract(c, ...C_ABS, 4); drawGeo(c, ...C_GEO, 9);
  { const [x, y, w] = C_CLOCK; drawClock(c, x, y, w); }
  drawRug(c, ...C_RUG);
  const knit = (r, base, line) => { const [x, y, w, h] = r; c.fillStyle = base; c.fillRect(x, y, w, h); for (let k = 0; k < w; k += 8) for (let j = 0; j < h; j += 10) { c.fillStyle = line; c.beginPath(); c.ellipse(x + k + 4, y + j + 5, 3, 5, (k / 8) % 2 ? 0.5 : -0.5, 0, Math.PI * 2); c.fill(); } };
  knit(C_KNIT, "#E9E2D3", "rgba(150,135,110,0.35)"); knit(C_THROW, "#C9D3E0", "rgba(70,90,120,0.35)");
  { const [x, y, w, h] = C_OCHRE; c.fillStyle = "#C8963F"; c.fillRect(x, y, w, h); c.strokeStyle = "rgba(255,240,210,0.6)"; c.lineWidth = 6; c.beginPath(); c.moveTo(x + w / 2, y + 24); c.lineTo(x + w - 24, y + h / 2); c.lineTo(x + w / 2, y + h - 24); c.lineTo(x + 24, y + h / 2); c.closePath(); c.stroke(); grain(c, w, h, 1500, "0,0,0", 0.02, 0.06, 1.5, 3); }
  { const [x, y, w, h] = C_STRIPE; c.fillStyle = "#E8EEF5"; c.fillRect(x, y, w, h); c.fillStyle = "#4D74A8"; for (let k = 0; k < 7; k++) c.fillRect(x, y + 14 + k * 36, w, 14); }
  { const [x, y, w, h] = C_SCREEN; const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, "#1C2433"); g.addColorStop(0.45, "#0A0E15"); g.addColorStop(1, "#06080C"); c.fillStyle = g; c.fillRect(x, y, w, h); c.fillStyle = "rgba(160,180,210,0.07)"; c.beginPath(); c.moveTo(x, y + h * 0.7); c.lineTo(x + w * 0.45, y); c.lineTo(x + w * 0.62, y); c.lineTo(x + w * 0.1, y + h); c.lineTo(x, y + h); c.fill(); }
  drawSeascape(c, ...C_SEA, 13);
  { const [x, y, w, h] = C_FRUIT; ["#D9822B", "#C2352B", "#E8C547", "#7FA33A", "#E07A2E", "#B0302A", "#F0D060", "#8DB045"].forEach((col, k) => { const g = c.createRadialGradient(x + k * 64 + 24, y + 40, 4, x + k * 64 + 32, y + 64, 60); g.addColorStop(0, "#FFF4D8"); g.addColorStop(0.25, col); g.addColorStop(1, "#40200C"); c.fillStyle = g; c.fillRect(x + k * 64, y, 64, h); }); }
  { const [x, y, w, h] = C_RUNNER; c.fillStyle = "#E9E2D3"; c.fillRect(x, y, w, h); c.fillStyle = "#2F5288"; c.fillRect(x, y + 20, w, 16); c.fillRect(x, y + h - 36, w, 16); grain(c, w, h, 3000, "0,0,0", 0.02, 0.06, 1.5, 8); }
});
const R = (r) => cell(A, r[0], r[1], r[2], r[3]);
const plasterTex = () => srgbTex("h_room_plaster", 512, 512, drawPlaster("#F3EEE6"));
const oakTex = () => { const t = srgbTex("h_oak", 1024, 1024, drawOak(false)); return t; };
const oakBump = () => linTex("h_oak_b", 1024, 1024, drawOak(true));
const weaveTex = () => srgbTex("h_room_weave", 256, 256, drawWeave);

// ── geometry helpers ───────────────────────────────────────────────────────────────────────────────────────────────────
const PL = new THREE.PlaneGeometry(1, 1);
const rbox = (w, h, d, r = 0.04, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, r);
/** a box: +z face shows `front`, top `top`, every other face `side` */
const box6 = (front, top, side) => {
  const g = new THREE.BoxGeometry(1, 1, 1), U = g.attributes.uv;
  [side, side, top, side, front, side].forEach((r, f) => { for (let k = 0; k < 4; k++) { const i = f * 4 + k; U.setXY(i, r[0] + U.getX(i) * (r[2] - r[0]), r[1] + U.getY(i) * (r[3] - r[1])); } });
  return g;
};
/** a draped cloth panel hanging from y1 to y0 at plane z, x0..x1, with `n` soft folds (faces +z) */
const drape = (x0, x1, y0, y1, n, amp, rect) => {
  const g = new THREE.PlaneGeometry(1, 1, n * 6, 4), P = g.attributes.position, U = g.attributes.uv;
  for (let i = 0; i < P.count; i++) {
    const u = U.getX(i), v = U.getY(i);
    P.setXYZ(i, x0 + u * (x1 - x0), y0 + v * (y1 - y0), amp * Math.sin(u * n * Math.PI * 2) * (0.7 + 0.3 * (1 - v)));
    if (rect) U.setXY(i, rect[0] + u * (rect[2] - rect[0]), rect[1] + v * (rect[3] - rect[1]));
  }
  g.computeVertexNormals();
  return g;
};

const buildRooms = () => {
  const K = new Kit();
  const B = (key, w, h, d, x, y, z, ry = 0, opt) => K.box(key, w, h, d, x, y, z, ry, opt);
  const wall = (key, w, h, x, y, z, ry) => K.add(key, PL, [x, y, z], [0, ry, 0], [w, h, 1]);
  // ── the shells: walls, ceilings, floors, the partition, skirting and crown ─────────────────────────────────────────────
  const room = (x0, x1) => {
    wall("rwall", x1 - x0, C - F, (x0 + x1) / 2, (F + C) / 2, ZB, 0);
    wall("rwall", ZF - ZB, C - F, x0, (F + C) / 2, (ZB + ZF) / 2, Math.PI / 2);
    wall("rwall", ZF - ZB, C - F, x1, (F + C) / 2, (ZB + ZF) / 2, -Math.PI / 2);
    K.add("rtrim", PL, [(x0 + x1) / 2, C, (ZB + ZF) / 2], [Math.PI / 2, 0, 0], [x1 - x0, ZF - ZB, 1]);
    K.add("rfloor", PL, [(x0 + x1) / 2, F, (ZB + ZF) / 2], [-Math.PI / 2, 0, 0], [x1 - x0, ZF - ZB, 1]);
    // skirting and crown on the back and both sides
    B("rtrim", x1 - x0, 0.11, 0.018, (x0 + x1) / 2, F + 0.055, ZB + 0.009);
    [x0, x1].forEach((x, k) => B("rtrim", 0.018, 0.11, ZF - ZB, x + (k ? -0.009 : 0.009), F + 0.055, (ZB + ZF) / 2));
    const cr = mould([[0, 0], [0.02, 0], ...cymaPts(0.02, 0.01, 0.08, 0.08, 5), [0.08, 0.09]], 1);
    K.add("rtrim", cr, [(x0 + x1) / 2, C - 0.09, ZB], [0, 0, 0], [x1 - x0, 1, 1]);
    K.add("rtrim", cr, [x0, C - 0.09, (ZB + ZF) / 2], [0, Math.PI / 2, 0], [ZF - ZB, 1, 1]);
    K.add("rtrim", cr, [x1, C - 0.09, (ZB + ZF) / 2], [0, -Math.PI / 2, 0], [ZF - ZB, 1, 1]);
  };
  room(LX0, LX1); room(DX0, DX1);
  // the windows from inside: stools, aprons, jamb linings; curtains on black rods
  const winIn = (x0, x1, y0, y1, cx0, cx1) => {
    B("rtrim", x1 - x0 + 0.16, 0.035, 0.2, (x0 + x1) / 2, y0 - 0.017, ZF - 0.08);
    B("rtrim", x1 - x0 + 0.06, 0.08, 0.02, (x0 + x1) / 2, y0 - 0.075, ZF - 0.01);
    [x0, x1].forEach((x) => B("rtrim", 0.025, y1 - y0, 0.12, x, (y0 + y1) / 2, ZF + 0.06));
    B("rtrim", x1 - x0, 0.025, 0.12, (x0 + x1) / 2, y1, ZF + 0.06);
    const ry = y1 + 0.16;
    K.add("rblack", new THREE.CylinderGeometry(0.012, 0.012, cx1 - cx0 + 0.3, 8), [(cx0 + cx1) / 2, ry, ZF - 0.14], [0, 0, Math.PI / 2], [1, 1, 1]);
    [cx0 - 0.15, cx1 + 0.15].forEach((x) => { K.add("rblack", new THREE.SphereGeometry(0.025, 8, 6), [x, ry, ZF - 0.14], [0, 0, 0], [1, 1, 1]); B("rblack", 0.02, 0.02, 0.12, x + (x < cx0 ? 0.1 : -0.1), ry, ZF - 0.08); });
    [[cx0, x0 + 0.2], [x1 - 0.2, cx1]].forEach(([a, b], k) => {
      K.add("rcurt", drape(a, b, F + 0.02, ry - 0.03, 4, 0.03), [0, 0, ZF - 0.16], [0, 0, 0], [1, 1, 1]);
      for (let i = 0; i < 6; i++) K.add("rblack", new THREE.TorusGeometry(0.02, 0.004, 4, 10), [a + (i + 0.5) * (b - a) / 6, ry, ZF - 0.14], [0, Math.PI / 2, 0], [1, 1, 1]);
    });
  };
  winIn(0.3, 2.9, 1.025, 2.475, -0.1, 3.3);
  winIn(-3.75, -2.25, 1.1, 2.4, -4.05, -1.95);

  // ── the living room ─────────────────────────────────────────────────────────────────────────────────────────────────
  // the rug, the sofa (base, seat and back cushions, arms, legs), throw pillows, the throw
  K.add("ratlas", inRect(PL, R(C_RUG)), [1.55, F + 0.004, -0.55], [-Math.PI / 2, 0, 0], [2.7, 1.85, 1], { keepUV: true });
  {
    const x = 1.55, z = -1.42, Wd = 2.2, D = 0.92;
    K.add("rsofa", rbox(Wd, 0.24, D, 0.05), [x, F + 0.22, z], [0, 0, 0], [1, 1, 1]);
    [-1, 1].forEach((s) => [-1, 1].forEach((q) => K.add("rwood", new THREE.CylinderGeometry(0.022, 0.016, 0.1, 8), [x + s * (Wd / 2 - 0.08), F + 0.05, z + q * (D / 2 - 0.08)], [0, 0, 0], [1, 1, 1])));
    K.add("rsofa", rbox(Wd, 0.5, 0.24, 0.06), [x, F + 0.58, z - D / 2 + 0.12], [0, 0, 0], [1, 1, 1]);
    [-1, 1].forEach((s) => K.add("rsofa", rbox(0.22, 0.32, D, 0.07), [x + s * (Wd / 2 - 0.11), F + 0.5, z], [0, 0, 0], [1, 1, 1]));
    for (let k = -1; k <= 1; k++) {
      K.add("rsofa", rbox(0.58, 0.15, 0.66, 0.06), [x + k * 0.59, F + 0.41, z + 0.1], [0, 0, 0], [1, 1, 1]);
      K.add("rsofa", rbox(0.57, 0.44, 0.17, 0.07), [x + k * 0.59, F + 0.7, z - D / 2 + 0.3], [-0.16, 0, 0], [1, 1, 1]);
    }
    [[x - 0.82, C_OCHRE, 0.35, 0.15], [x - 0.42, C_STRIPE, -0.15, -0.08], [x + 0.8, C_KNIT, -0.3, 0.12]].forEach(([px, r, ry, rz], i) =>
      K.add("ratlas", inRect(rbox(0.42, 0.42, 0.13, 0.06, 2), R(r)), [px, F + 0.72, z - 0.12 + i * 0.01], [-0.25, ry, rz], [1, 1, 1], { keepUV: true }));
    // the throw: folded over the right arm and down its side
    K.add("ratlas", inRect(rbox(0.3, 0.035, 0.62, 0.015, 2), R(C_THROW)), [x + Wd / 2 - 0.11, F + 0.675, z + 0.05], [0, 0, 0.05], [1, 1, 1], { keepUV: true });
    K.add("ratlas", inRect(drape(-0.31, 0.31, 0, 0.3, 3, 0.012, null), R(C_THROW)), [x + Wd / 2 + 0.012, F + 0.37, z + 0.05], [0, Math.PI / 2, 0], [1, 1, 1], { keepUV: true });
  }
  // the coffee table and what is on it
  {
    const x = 1.55, z = -0.22, y = F + 0.42;
    B("rwood", 1.1, 0.04, 0.56, x, y - 0.02, z); B("rwood", 1.0, 0.025, 0.46, x, F + 0.12, z);
    [-1, 1].forEach((s) => [-1, 1].forEach((q) => B("rwood", 0.04, 0.4, 0.04, x + s * 0.5, F + 0.2, z + q * 0.23)));
    [[x - 0.28, 0.06, 5, 0.3, 0.22, 0.04], [x - 0.27, 0.1, 12, 0.27, 0.2, 0.035]].forEach(([bx, dz, sp, w, d, h], k) =>
      K.add("ratlas", box6(R(SP(sp)), R(C_PAGES), R(SP(sp))), [bx, y + h / 2 + k * 0.04, z + dz - 0.08], [0, 0.12 - k * 0.2, 0], [w, h, d], { keepUV: true }));
    K.add("rglaze", lathe([[0.04, 0], [0.042, 0.01], [0.042, 0.095], [0.039, 0.095], [0.039, 0.012], [0.0001, 0.012]], 16), [x + 0.22, y, z + 0.1], [0, 0, 0], [1, 1, 1]);
    K.add("rglaze", new THREE.TorusGeometry(0.025, 0.007, 6, 12, Math.PI), [x + 0.262, y + 0.05, z + 0.1], [0, 0, -Math.PI / 2], [1, 1, 1]);
    K.add("rsofa", new THREE.CylinderGeometry(0.0425, 0.0425, 0.02, 16, 1, true), [x + 0.22, y + 0.065, z + 0.1], [0, 0, 0], [1, 1, 1]);   // the mug's blue band
    K.add("rcoffee", new THREE.CircleGeometry(0.038, 14), [x + 0.22, y + 0.08, z + 0.1], [-Math.PI / 2, 0, 0], [1, 1, 1]);
    B("rblack", 0.3, 0.015, 0.2, x + 0.3, y + 0.008, z - 0.1);
    K.add("rtrim", new THREE.CylinderGeometry(0.035, 0.035, 0.08, 14), [x + 0.33, y + 0.055, z - 0.1], [0, 0, 0], [1, 1, 1]);
    K.add("rshade", new THREE.ConeGeometry(0.008, 0.025, 6), [x + 0.33, y + 0.11, z - 0.1], [0, 0, 0], [1, 1, 1], { tag: 9 });
    K.add("rglaze", lathe([[0.0001, 0], [0.05, 0.005], [0.09, 0.03], [0.11, 0.07], [0.105, 0.072], [0.085, 0.035], [0.0001, 0.01]], 18), [x + 0.02, y, z + 0.12], [0, 0, 0], [1, 1, 1]);
  }
  // the side table with the table lamp and a few books; the floor lamp
  {
    const x = TLAMP[0], z = TLAMP[2], y = F + 0.56;
    B("rwood", 0.46, 0.035, 0.46, x, y - 0.018, z); B("rwood", 0.4, 0.02, 0.4, x, F + 0.15, z);
    [-1, 1].forEach((s) => [-1, 1].forEach((q) => B("rwood", 0.035, 0.54, 0.035, x + s * 0.2, F + 0.27, z + q * 0.2)));
    K.add("rlampb", lathe([[0.06, 0], [0.065, 0.02], [0.1, 0.1], [0.11, 0.16], [0.08, 0.24], [0.03, 0.28], [0.015, 0.33], [0.0001, 0.33]], 18), [x, y, z], [0, 0, 0], [1, 1, 1]);
    K.add("rshade", new THREE.CylinderGeometry(0.15, 0.19, 0.24, 20, 1, true), [x, TLAMP[1], z], [0, 0, 0], [1, 1, 1], { tag: 9 });
    [3, 18].forEach((sp, k) => K.add("ratlas", box6(R(SP(sp)), R(C_PAGES), R(SP(sp))), [x + 0.12, y + 0.02 + k * 0.035, z + 0.13], [0, 0.3 + k * 0.4, 0], [0.18, 0.035, 0.13], { keepUV: true }));
    const fx = FLAMP[0], fz = FLAMP[2];
    K.add("rblack", lathe([[0.15, 0], [0.15, 0.015], [0.04, 0.03], [0.0001, 0.03]], 20), [fx, F, fz], [0, 0, 0], [1, 1, 1]);
    K.add("rblack", new THREE.CylinderGeometry(0.012, 0.012, FLAMP[1] - F - 0.1, 8), [fx, (F + FLAMP[1] - 0.1) / 2, fz], [0, 0, 0], [1, 1, 1]);
    K.add("rshade", new THREE.CylinderGeometry(0.19, 0.22, 0.3, 22, 1, true), [fx, FLAMP[1], fz], [0, 0, 0], [1, 1, 1], { tag: 9 });
  }
  // the pictures over the sofa, the wall clock
  const pic = (r, x, y, w, h, frameKey, mat) => {
    K.add("ratlas", inRect(PL, R(r)), [x, y, ZB + 0.032], [0, 0, 0], [w, h, 1], { keepUV: true });
    if (mat) B("rtrim", w + mat * 2, h + mat * 2, 0.01, x, y, ZB + 0.025);
    const fw = 0.035, W2 = w + mat * 2, H2 = h + mat * 2;
    [[0, (H2 + fw) / 2, W2 + fw * 2, fw], [0, -(H2 + fw) / 2, W2 + fw * 2, fw], [(W2 + fw) / 2, 0, fw, H2], [-(W2 + fw) / 2, 0, fw, H2]].forEach(([dx, dy, ww, hh]) => B(frameKey, ww, hh, 0.035, x + dx, y + dy, ZB + 0.018));
  };
  pic(C_LAND, 1.55, 1.86, 0.88, 0.55, "rwood", 0.07);
  pic(C_ABS, 0.6, 1.9, 0.27, 0.36, "rblack", 0.04);
  pic(C_GEO, 2.5, 1.9, 0.27, 0.36, "rblack", 0.04);
  K.add("ratlas", inRect(new THREE.CircleGeometry(0.17, 32), R(C_CLOCK)), [0.1, 2.22, ZB + 0.035], [0, 0, 0], [1, 1, 1], { keepUV: true });
  K.add("rblack", new THREE.TorusGeometry(0.18, 0.018, 8, 36), [0.1, 2.22, ZB + 0.03], [0, 0, 0], [1, 1, 1]);
  // the bookcase (white, built in): carcass, shelves, cabinet doors below, books and a few objects above
  {
    const x0 = 3.38, x1 = 4.8, d = 0.34, yb = F + 0.72, top = F + 2.12, z = ZB + d / 2;
    [x0, x1].forEach((x) => B("rtrim", 0.03, top - F, d, x, (F + top) / 2, z));
    B("rtrim", x1 - x0 + 0.06, 0.04, d + 0.02, (x0 + x1) / 2, top, z + 0.01); B("rtrim", x1 - x0 + 0.1, 0.05, d + 0.05, (x0 + x1) / 2, top + 0.045, z + 0.02);
    B("rtrim", x1 - x0, yb - F, d, (x0 + x1) / 2, (F + yb) / 2, z);
    [-1, 1].forEach((s) => { B("rtrim", (x1 - x0) / 2 - 0.03, yb - F - 0.12, 0.015, (x0 + x1) / 2 + s * (x1 - x0) / 4, (F + yb) / 2 + 0.02, ZB + d + 0.008); K.add("rbrass", new THREE.SphereGeometry(0.014, 8, 6), [(x0 + x1) / 2 + s * 0.05, (F + yb) / 2 + 0.1, ZB + d + 0.02], [0, 0, 0], [1, 1, 1]); });
    const shelves = [yb, yb + 0.36, yb + 0.72, yb + 1.06];
    shelves.forEach((y) => B("rtrim", x1 - x0 - 0.03, 0.025, d - 0.01, (x0 + x1) / 2, y, z));
    let seed = 7;
    shelves.forEach((y, si) => {
      let x = x0 + 0.03;
      const lim = (si === 3 ? top - 0.03 : shelves[si + 1]) - y - 0.03;
      while (x < x1 - 0.06) {
        const r = rnd(seed++);
        if (r < 0.07 && x < x1 - 0.3) {            // a small vase or a box between the books
          K.add("rglaze", lathe([[0.04, 0], [0.06, 0.05], [0.05, 0.12], [0.025, 0.17], [0.03, 0.19], [0.0001, 0.19]], 14), [x + 0.07, y + 0.012, z + 0.02], [0, 0, 0], [1, 1, 1]);
          x += 0.15; continue;
        }
        if (r > 0.93 && x < x1 - 0.3) {            // a short stack lying flat
          for (let k = 0; k < 3; k++) { const sp = Math.floor(rnd(seed++) * SPINES); K.add("ratlas", box6(R(SP(sp)), R(C_PAGES), R(SP(sp))), [x + 0.11, y + 0.03 + k * 0.035, z + 0.02], [Math.PI / 2, 0, Math.PI / 2], [0.035, 0.2 - k * 0.02, 0.15], { keepUV: true }); }
          x += 0.24; continue;
        }
        const w = 0.022 + rnd(seed++) * 0.03, h = Math.min(lim, 0.2 + rnd(seed++) * 0.1), dd = 0.16 + rnd(seed++) * 0.08, sp = Math.floor(rnd(seed++) * SPINES);
        K.add("ratlas", box6(R(SP(sp)), R(C_PAGES), R(SP(sp))), [x + w / 2, y + 0.012 + h / 2, ZB + 0.03 + dd / 2 + (d - 0.05 - dd)], [0, 0, 0], [w, h, dd], { keepUV: true });
        x += w + 0.002;
      }
    });
  }
  // the fiddle-leaf fig in a woven basket (back left corner)
  {
    const x = -1.12, z = -1.45;
    K.add("rbasket", lathe([[0.15, 0], [0.19, 0.08], [0.21, 0.3], [0.2, 0.32], [0.0001, 0.3]], 18), [x, F, z], [0, 0, 0], [1, 1, 1]);
    const lf = leaf(0.24, 0.17);
    for (let i = 0; i < 3; i++) K.add("rstem", new THREE.CylinderGeometry(0.01, 0.014, 1.1 + i * 0.25, 6), [x + (i - 1) * 0.05, F + 0.3 + (1.1 + i * 0.25) / 2, z + (i - 1) * 0.03], [(i - 1) * 0.08, 0, (i - 1) * 0.1], [1, 1, 1]);
    for (let k = 0; k < 30; k++) {
      const t = k / 30, a = k * 2.4, y = F + 0.65 + t * 1.05, rr = 0.1 + 0.18 * Math.sin(Math.PI * Math.min(1, t * 1.2));
      K.add("rplant", lf, [x + Math.sin(a) * rr, y, z + Math.cos(a) * rr], [-0.6 - 0.5 * rnd(k), a, (rnd(k + 3) - 0.5) * 0.6], [1, 1, 1]);
    }
  }
  // the TV cabinet on the right wall and the television (off), a vase with stems, books
  {
    const x = LX1 - 0.22, z = 1.0, Wd = 1.7, H = 0.55, D = 0.42;
    B("rwood", D, 0.035, Wd, x, F + 0.12 + H, z); B("rwood", D - 0.02, H - 0.02, Wd - 0.02, x, F + 0.12 + H / 2, z);
    [-1, 1].forEach((s) => [-1, 1].forEach((q) => K.add("rblack", new THREE.CylinderGeometry(0.015, 0.01, 0.12, 6), [x + s * 0.15, F + 0.06, z + q * (Wd / 2 - 0.08)], [0, 0, 0], [1, 1, 1])));
    for (let k = 0; k < 3; k++) {
      const cz = z - Wd / 2 + (k + 0.5) * Wd / 3;
      B("rdoor", 0.012, H - 0.08, Wd / 3 - 0.02, x - D / 2 + 0.002, F + 0.12 + H / 2, cz);
      K.add("rbrass", new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6), [x - D / 2 - 0.012, F + 0.12 + H - 0.1, cz + (k === 1 ? 0 : 0)], [Math.PI / 2, 0, 0], [1, 1, 1]);
    }
    const ty = F + 0.12 + H + 0.035;
    B("rblack", 0.22, 0.02, 0.32, x + 0.04, ty + 0.01, z); B("rblack", 0.04, 0.12, 0.06, x + 0.06, ty + 0.07, z);
    B("rblack", 0.045, 0.66, 1.16, x + 0.03, ty + 0.16 + 0.33, z);
    K.add("rscreen", inRect(PL, R(C_SCREEN)), [x + 0.005, ty + 0.16 + 0.33, z], [0, -Math.PI / 2, 0], [1.12, 0.62, 1], { keepUV: true });
    K.add("rglaze", lathe([[0.04, 0], [0.065, 0.06], [0.06, 0.16], [0.03, 0.24], [0.034, 0.27], [0.0001, 0.27]], 16), [x, ty, z + 0.72], [0, 0, 0], [1, 1, 1]);
    for (let k = 0; k < 5; k++) K.add("rstem", new THREE.CylinderGeometry(0.004, 0.004, 0.42, 4), [x + (rnd(k) - 0.5) * 0.06, ty + 0.4, z + 0.72 + (rnd(k + 5) - 0.5) * 0.06], [(rnd(k + 1) - 0.5) * 0.5, 0, (rnd(k + 2) - 0.5) * 0.5], [1, 1, 1]);
    [7, 22].forEach((sp, k) => K.add("ratlas", box6(R(SP(sp)), R(C_PAGES), R(SP(sp))), [x, ty + 0.02 + k * 0.04, z - 0.72], [0, Math.PI / 2 + 0.2 * k, 0], [0.24, 0.04, 0.17], { keepUV: true }));
  }
  // the ceiling light: a flush drum
  K.add("rtrim", new THREE.CylinderGeometry(0.25, 0.25, 0.02, 24), [CEIL[0], C - 0.01, CEIL[2]], [0, 0, 0], [1, 1, 1]);
  K.add("rbulb", new THREE.CylinderGeometry(0.22, 0.2, 0.08, 24), [CEIL[0], C - 0.06, CEIL[2]], [0, 0, 0], [1, 1, 1], { tag: 9 });

  // ── the dining room ─────────────────────────────────────────────────────────────────────────────────────────────────
  {
    const x = PEND[0], z = PEND[2], y = F + 0.75;
    B("rwood", 0.9, 0.04, 1.55, x, y - 0.02, z);
    const leg = lathe([[0.03, 0], [0.025, 0.2], [0.035, 0.35], [0.03, 0.55], [0.04, 0.68], [0.04, 0.71], [0.0001, 0.71]], 10);
    [-1, 1].forEach((s) => [-1, 1].forEach((q) => K.add("rwood", leg, [x + s * 0.38, F, z + q * 0.68], [0, 0, 0], [1, 1, 1])));
    K.add("ratlas", inRect(PL, R(C_RUNNER)), [x, y + 0.002, z], [-Math.PI / 2, 0, Math.PI / 2], [1.3, 0.34, 1], { keepUV: true });
    K.add("rglaze", lathe([[0.0001, 0], [0.07, 0.005], [0.13, 0.05], [0.15, 0.09], [0.145, 0.092], [0.12, 0.055], [0.0001, 0.015]], 18), [x, y, z], [0, 0, 0], [1, 1, 1]);
    for (let k = 0; k < 6; k++) { const a = k * 1.1, rr = 0.06 + (k % 3) * 0.02, fr = [1024 + (k % 8) * 64, 1504, 64, 128]; K.add("ratlas", inRect(new THREE.SphereGeometry(0.04, 10, 8), R(fr)), [x + Math.sin(a) * rr, y + 0.07 + (k > 3 ? 0.04 : 0), z + Math.cos(a) * rr], [0, 0, 0], [1, 1, 1], { keepUV: true }); }
    [-0.45, 0.45].forEach((dz) => { K.add("rbrass", lathe([[0.04, 0], [0.04, 0.01], [0.012, 0.03], [0.015, 0.14], [0.025, 0.16], [0.0001, 0.16]], 12), [x, y, z + dz], [0, 0, 0], [1, 1, 1]); K.add("rtrim", new THREE.CylinderGeometry(0.011, 0.011, 0.16, 8), [x, y + 0.24, z + dz], [0, 0, 0], [1, 1, 1]); });
    // four chairs: painted spindle backs, wooden seats
    [[-1, -0.33], [-1, 0.37], [1, -0.33], [1, 0.37]].forEach(([s, dz]) => {
      const cx = x + s * 0.62, cz = z + dz;
      B("rwood", 0.42, 0.035, 0.42, cx, F + 0.45, cz);
      [-1, 1].forEach((p) => [-1, 1].forEach((q) => B("rchair", 0.03, 0.44, 0.03, cx + p * 0.18, F + 0.22, cz + q * 0.18)));
      const bx = cx + s * 0.19;
      [-1, 1].forEach((q) => B("rchair", 0.03, 0.5, 0.03, bx, F + 0.72, cz + q * 0.18));
      B("rchair", 0.04, 0.07, 0.4, bx, F + 0.95, cz);
      for (let k = -2; k <= 2; k++) B("rchair", 0.015, 0.4, 0.015, bx, F + 0.68, cz + k * 0.065);
    });
    // the pendant over the table
    K.add("rblack", new THREE.CylinderGeometry(0.004, 0.004, C - PEND[1] - 0.1, 4), [x, (C + PEND[1] + 0.1) / 2, z], [0, 0, 0], [1, 1, 1]);
    K.add("rpend", lathe([[0.0001, 0.2], [0.04, 0.2], [0.05, 0.17], [0.12, 0.1], [0.22, 0.02], [0.23, 0]], 24), [x, PEND[1] - 0.05, z], [0, 0, 0], [1, 1, 1]);
    K.add("rshade", new THREE.SphereGeometry(0.05, 12, 8), [x, PEND[1] - 0.04, z], [0, 0, 0], [1, 1, 1], { tag: 9 });
    // the sideboard on the back wall, candlesticks and a bowl on it, the harbour picture above
    const sx = -3.3, sz = ZB + 0.22;
    B("rwood", 1.5, 0.035, 0.44, sx, F + 0.8, sz); B("rnavy", 1.48, 0.66, 0.42, sx, F + 0.46, sz);
    [-1, 1].forEach((s) => [-1, 1].forEach((q) => K.add("rwood", new THREE.CylinderGeometry(0.02, 0.015, 0.13, 8), [sx + s * 0.68, F + 0.065, sz + q * 0.15], [0, 0, 0], [1, 1, 1])));
    for (let k = 0; k < 3; k++) { B("rnavy", 1.44 / 3 - 0.02, 0.58, 0.012, sx - 0.48 + k * 0.48, F + 0.46, sz + 0.215); K.add("rbrass", new THREE.SphereGeometry(0.014, 8, 6), [sx - 0.48 + k * 0.48, F + 0.62, sz + 0.232], [0, 0, 0], [1, 1, 1]); }
    [-0.5, 0.5].forEach((dx) => K.add("rbrass", lathe([[0.045, 0], [0.045, 0.012], [0.014, 0.04], [0.018, 0.2], [0.03, 0.22], [0.0001, 0.22]], 12), [sx + dx, F + 0.82, sz], [0, 0, 0], [1, 1, 1]));
    K.add("rglaze", lathe([[0.05, 0], [0.09, 0.08], [0.08, 0.2], [0.04, 0.3], [0.045, 0.33], [0.0001, 0.33]], 16), [sx + 0.1, F + 0.82, sz], [0, 0, 0], [1, 1, 1]);
    pic(C_SEA, sx, 1.85, 0.8, 0.5, "rblack", 0.06);
  }
  return K;
};

const fx = bake(LAMPS, { amb: 0.34, floorY: F, aoH: 0.35, ceilY: C });
const WARM = new THREE.Color("#FFD9AA");
const useRooms = () => useMemo(() => {
  const K = buildRooms(), parts = K.build(fx, { rwall: 0.6, rtrim: 1.0, rfloor: 0.5, rsofa: 2.0, rcurt: 2.0, rwood: 1.5 });
  const atlas = atlasTex(), weave = weaveTex(); atlas.anisotropy = 2;
  const S = 0.22;
  const mats = {
    rwall: lamMat({ map: plasterTex(), color: "#FFFFFF", roughness: 0.9, glow: WARM, scene: S, envMapIntensity: 0.1 }),
    rtrim: lamMat({ color: "#F3F0EA", roughness: 0.5, glow: WARM, scene: S, envMapIntensity: 0.2 }),
    rfloor: lamMat({ map: oakTex(), bumpMap: oakBump(), bumpScale: 0.6, color: "#FFFFFF", roughness: 0.32, glow: WARM, scene: S, envMapIntensity: 0.5 }),
    rsofa: lamMat({ map: weave, color: "#3A5F94", roughness: 0.9, glow: WARM, scene: S, envMapIntensity: 0.08 }),
    rcurt: lamMat({ map: weave, color: "#C2CFE0", roughness: 0.92, glow: WARM, scene: S, envMapIntensity: 0.08 }),
    rwood: lamMat({ color: "#B98C5E", roughness: 0.42, glow: WARM, scene: S, envMapIntensity: 0.35 }),
    rdoor: lamMat({ color: "#C49A6C", roughness: 0.4, glow: WARM, scene: S, envMapIntensity: 0.35 }),
    rnavy: lamMat({ color: "#36557F", glow: WARM, scene: S }),
    rchair: lamMat({ color: "#EFEBE3", roughness: 0.45, glow: WARM, scene: S, envMapIntensity: 0.2 }),
    rblack: roomMat({ color: "#1B1F26", roughness: 0.4, metalness: 0.3, glow: WARM, glowI: 0.5, scene: S, envMapIntensity: 0.6 }),
    rbrass: roomMat({ color: "#D9B36A", roughness: 0.28, metalness: 0.85, glow: WARM, glowI: 0.5, scene: S, envMapIntensity: 1.4 }),
    rglaze: roomMat({ color: "#F4F2EE", roughness: 0.18, glow: WARM, scene: S, envMapIntensity: 0.6 }),
    rlampb: roomMat({ color: "#4F79B0", roughness: 0.2, glow: WARM, scene: S, envMapIntensity: 0.7 }),
    rbasket: lamMat({ map: weave, color: "#B58E5E", roughness: 0.9, glow: WARM, scene: S, envMapIntensity: 0.1 }),
    rplant: lamMat({ color: "#3F7350", roughness: 0.6, glow: WARM, scene: S, envMapIntensity: 0.25 }),
    rstem: lamMat({ color: "#4A5A3A", roughness: 0.7, glow: WARM, scene: S }),
    rcoffee: roomMat({ color: "#3A2212", roughness: 0.15, glow: WARM, scene: S }),
    rpend: roomMat({ color: "#24406C", roughness: 0.35, metalness: 0.4, glow: WARM, scene: S, envMapIntensity: 0.8 }),
    ratlas: lamMat({ map: atlas, color: "#FFFFFF", roughness: 0.6, glow: WARM, scene: S, envMapIntensity: 0.12 }),
    rscreen: roomMat({ map: atlas, color: "#FFFFFF", roughness: 0.06, metalness: 0.2, glow: WARM, glowI: 0.3, scene: S, envMapIntensity: 1.6 }),
    rshade: roomMat({ color: "#FFF1DA", emissive: "#FFD597", emissiveIntensity: 1.5, roughness: 0.8 }),
    rbulb: roomMat({ color: "#FFF6E8", emissive: "#FFE6C2", emissiveIntensity: 1.4, roughness: 0.5 })
  };
  // (the room's shell draws AFTER its furniture: the software renderer then rejects the hidden wall pixels on depth before shading)
  const meshes = parts.map(({ key, geometry }) => { const m = new THREE.Mesh(geometry, mats[key]); m.castShadow = false; m.receiveShadow = false; m.renderOrder = ["rwall", "rfloor", "rtrim"].includes(key) ? 1 : 0; return m; });
  return { meshes, mats };
}, []);

/** The two lit rooms. `lit` 0..1 scales their light (the hero house is lit 1). */
export const HomeRooms = ({ lit = 1 }) => {
  const { meshes, mats } = useRooms();
  const k = 0.55 + 0.45 * lit;
  for (const m of Object.values(mats)) if (m.userData.uGlow && !m.userData.fixed) { m.userData.base ??= m.userData.uGlow.value.clone(); m.userData.uGlow.value.copy(m.userData.base).multiplyScalar(k); }
  return (
    <group>
      {meshes.map((o, i) => <primitive key={i} object={o} />)}
      <Glow position={[TLAMP[0], TLAMP[1], TLAMP[2] + 0.05]} size={0.9} color="#FFD8A0" opacity={0.45 * k} />
      <Glow position={[FLAMP[0], FLAMP[1], FLAMP[2] + 0.05]} size={0.95} color="#FFD8A0" opacity={0.45 * k} />
      <Glow position={[PEND[0], PEND[1] - 0.1, PEND[2]]} size={0.8} color="#FFD8A0" opacity={0.45 * k} />
    </group>
  );
};
