// @ts-nocheck
// ★ V38 — the MASSACHUSETTS STATE HOUSE (Bulfinch, Beacon Hill) at night, for the `state` station (rev 2, builder F; Timur
//   2026-11-26: "make … the building of the Massachusetts State House … a lot more detailed … more eye-catching and just better").
//   The real elements: a granite terrace, the wide flight of steps between cheek walls; the brick front (kept very desaturated,
//   in the house blue family, so the GILDED DOME stays the one warm accent) with white trim — quoins, string courses, sash
//   windows (6-over-6, surrounds, sills, keystoned flat arches, cornice heads on the main storey), a dentil-and-modillion cornice
//   and a balustrade along the roof; the centre pavilion: a ground-storey ARCADE of seven arches (archivolts, imposts, keystones;
//   the centre one the open, lit door), above it the two-storey LOGGIA of Corinthian columns (paired at the ends; acanthus
//   capitals with corner volutes) with a balustrade between them and pilasters behind, an entablature with dentils and
//   modillions, the PEDIMENT with raking cornices and its oculus; behind it the dome's square base, the DRUM with arched lit
//   windows between pilasters, the ribbed gilded DOME and its LANTERN (a ring of columns, a gold cap and the PINECONE finial);
//   a hipped slate roof with chimneys; at the foot of the lawn the granite GATE PIERS with their lanterns and the open iron gates
//   (they close the station's iron fence). Geometry merged by material (bld_kit), canvas maps + bump maps, a baked uplight.
//   DESIGN units (main block front at z 0, x ±26; terrace z −20…8; steps to z 12; gate piers at z 12.36 = the station fence at
//   world z −15.2), placed by the station at [0, 0, −22] × 0.55. Footprint, heights and the door/dome anchors are unchanged.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Glow, rnd } from "./kit";
import { Kit, kitMat, srgbTex, linTex, flatTex, blackTex, mould, arcPts, cymaPts, lathe, volute, baluster, leaf, archPath, archRing, smoothstep } from "./bld_kit";

// ── textures ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// brick: 1024 px = 4 u (uv 0.25); courses 0.2 u, stretchers 0.5 u, every 6th course a header course; desaturated, cool
const drawBrick = (c, w, h, bump) => {
  c.fillStyle = bump ? "#000" : "#8E96A6"; c.fillRect(0, 0, w, h);    // the mortar
  const ch = 51.2, rows = Math.round(h / ch);
  for (let r = 0; r < rows; r++) {
    const header = r % 6 === 5, bw = header ? 64 : 128, off = header ? 0 : (r % 2) * 64;
    for (let x = -off; x < w; x += bw) {
      const v = rnd(r * 131 + Math.round(x) * 7);
      if (bump) { c.fillStyle = `rgb(${200 + v * 40},${200 + v * 40},${200 + v * 40})`; }
      else { const L = 78 + v * 22, warm = 5 + rnd(r * 7 + x) * 8; c.fillStyle = `rgb(${L + warm},${L},${L + 3})`; }
      c.fillRect(x + 3, r * ch + 3, bw - 6, ch - 6);
      if (!bump) { c.fillStyle = `rgba(255,255,255,${0.05 + rnd(r + x) * 0.05})`; c.fillRect(x + 3, r * ch + 3, bw - 6, 3); }
    }
  }
  for (let i = 0; i < 30000; i++) { const g = rnd(i * 3 + 1); c.fillStyle = `rgba(${g > 0.5 ? "255,255,255" : "20,22,30"},${0.05 + rnd(i) * 0.07})`; c.fillRect(rnd(i + 2) * w, rnd(i + 5) * h, 1.6, 1.6); }
};
const drawPaint = (c, w, h, bump) => {   // painted trim / dressed stone: fine grain, faint brush
  c.fillStyle = bump ? "#808080" : "#D8DEE8"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(${rnd(i) > 0.5 ? "255,255,255" : "40,50,70"},0.025)`; c.fillRect(0, rnd(i + 1) * h, w, 1 + rnd(i + 2) * 3); }
  for (let i = 0; i < 16000; i++) { const g = rnd(i * 5 + 2); c.fillStyle = `rgba(${g > 0.5 ? "255,255,255" : "30,38,52"},${0.03 + rnd(i) * 0.05})`; c.fillRect(rnd(i + 3) * w, rnd(i + 4) * h, 1.4, 1.4); }
};
const drawGranite = (c, w, h, bump) => {
  c.fillStyle = bump ? "#A0A0A0" : "#8A94A6"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 40000; i++) { const g = rnd(i * 7 + 5); c.fillStyle = `rgba(${g > 0.6 ? "235,240,250" : g > 0.25 ? "40,46,60" : "120,110,120"},${0.1 + rnd(i) * 0.2})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  c.fillStyle = bump ? "#000" : "rgba(30,36,50,0.55)"; for (let y = 0; y < h; y += 128) c.fillRect(0, y, w, 2); for (let x = 0; x < w; x += 256) c.fillRect(x, 0, 2, h);
};
const drawSlate = (c, w, h, bump) => {
  c.fillStyle = bump ? "#606060" : "#3A4558"; c.fillRect(0, 0, w, h);
  for (let r = 0; r < 16; r++) for (let k = 0; k < 16; k++) {
    const x = k * 32 + (r % 2) * 16, y = r * 32, v = rnd(r * 16 + k) * 0.14 - 0.07;
    c.fillStyle = bump ? `rgb(${150 + v * 300},${150 + v * 300},${150 + v * 300})` : (v > 0 ? `rgba(200,215,240,${v})` : `rgba(0,0,0,${-v})`); c.fillRect(x + 1, y + 1, 30, 30);
    c.fillStyle = bump ? "#000" : "rgba(10,14,22,0.6)"; c.fillRect(x, y + 29, 32, 3);
  }
};
// the dome's gilding: pale-to-deep gold, faint seams of the gold-leaf sheets, the ribs carry their own geometry
const drawGold = (c, w, h, bump) => {
  if (bump) { c.fillStyle = "#808080"; c.fillRect(0, 0, w, h); }
  else { const g = c.createLinearGradient(0, h, 0, 0); g.addColorStop(0, "#FFF0C4"); g.addColorStop(0.6, "#F0CF85"); g.addColorStop(1, "#C99A4E"); c.fillStyle = g; c.fillRect(0, 0, w, h); }
  for (let r = 0; r < 18; r++) { c.fillStyle = bump ? "rgba(0,0,0,0.5)" : "rgba(120,80,20,0.18)"; c.fillRect(0, r * h / 18, w, 2); }
  for (let k = 0; k < 64; k++) { c.fillStyle = bump ? "rgba(0,0,0,0.35)" : "rgba(120,80,20,0.12)"; c.fillRect(k * w / 64, 0, 2, h); }
  if (!bump) for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(255,245,215,${rnd(i) * 0.08})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
};
// the pinecone's scales (uv: u around, v up)
const drawCone = (c, w, h, bump) => {
  c.fillStyle = bump ? "#000" : "#B8893E"; c.fillRect(0, 0, w, h);
  for (let r = 0; r < 10; r++) for (let k = 0; k < 12; k++) {
    const x = (k + (r % 2) * 0.5) * w / 12, y = r * h / 10, rw = w / 12, rh = h / 9;
    const g = c.createRadialGradient(x + rw / 2, y + rh * 0.8, 1, x + rw / 2, y + rh * 0.6, rw * 0.7);
    g.addColorStop(0, bump ? "#FFF" : "#FFE7A8"); g.addColorStop(1, bump ? "#222" : "#A57A33");
    c.fillStyle = g; c.beginPath(); c.ellipse(x + rw / 2, y + rh / 2, rw * 0.48, rh * 0.55, 0, 0, Math.PI * 2); c.fill();
  }
};
const interiorTex = () => srgbTex("sh_interior", 128, 256, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#FFE3AE"); g.addColorStop(0.6, "#EBAF66"); g.addColorStop(1, "#A86A35");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  const r = c.createRadialGradient(w / 2, 30, 2, w / 2, 30, 80); r.addColorStop(0, "rgba(255,250,232,0.9)"); r.addColorStop(1, "rgba(255,250,232,0)"); c.fillStyle = r; c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(110,50,30,0.5)"; c.fillRect(0, 0, 20, h); c.fillRect(w - 20, 0, 20, h);    // drawn curtains
  c.fillStyle = "rgba(90,45,20,0.25)"; c.fillRect(0, 0, w, 14);
});
const glassTex = () => srgbTex("sh_glass", 128, 256, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#3B587E"); g.addColorStop(0.5, "#182A44"); g.addColorStop(1, "#0C1828");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(180,210,250,0.10)"; c.beginPath(); c.moveTo(0, h * 0.7); c.lineTo(w * 0.6, 0); c.lineTo(w, 0); c.lineTo(0, h); c.fill();
});
const hallTex = () => srgbTex("sh_hall2", 256, 288, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, 40, 10, w / 2, 120, 260); g.addColorStop(0, "#FFE3B4"); g.addColorStop(0.35, "#B9844C"); g.addColorStop(1, "#3A2A1A");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = "rgba(40,24,10,0.55)"; c.lineWidth = 4;
  for (let k = 0; k < 3; k++) { c.strokeRect(18 + k * 78, 130, 64, 70); c.strokeRect(18 + k * 78, 210, 64, 66); }
  c.fillStyle = "rgba(255,240,210,0.9)"; c.beginPath(); c.arc(w / 2, 36, 10, 0, Math.PI * 2); c.fill();
});

// ── the plan ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const G = 1.2;                                     // the terrace top (ground floor level)
const PAV = 9.4;                                   // the centre pavilion's half width
const COLS = [-8.1, -7.2, -5.14, -3.09, -1.03, 1.03, 3.09, 5.14, 7.2, 8.1];
const COL_Z = 3.4, LOG0 = 5.4, LOG1 = 11.2;        // the loggia: column foot / top of capitals
const ARCH = [[-1.6, 1.6, 3.4], ...[[2.45, 4.05], [4.9, 6.5], [7.35, 8.95]].flatMap(([a, b]) => [[a, b, 3.5], [-b, -a, 3.5]])];
const WBAY0 = 9.7, WBAY = 3.1, NWB = 5;
const ROWS = [{ y0: 2.0, y1: 4.4, w: 1.35, head: "arch" }, { y0: 6.2, y1: 9.5, w: 1.45, head: "cornice" }, { y0: 10.6, y1: 12.4, w: 1.35, head: "plain" }];
const GATE_Z = 12.36, GATE_X = 10.2;

const buildHouse = () => {
  const K = new Kit();
  const box = (key, w, h, d, x, y, z, opt) => K.box(key, w, h, d, x, y, z, 0, opt);
  const TC = { tag: 1 }, TP = { tag: 2 }, TD = { tag: 3 }, TG = { tag: 5 };

  // ── the terrace, its coping, the steps and cheek walls ───────────────────────────────────────────────────────────────
  box("granite", 64, G, 28, 0, G / 2, -6);
  box("trim", 64.3, 0.12, 0.5, 0, G + 0.02, 7.95);
  for (let i = 0; i < 6; i++) {
    const zf = 12 - i * 0.7;
    K.add("granite", new THREE.PlaneGeometry(16, 0.2), [0, i * 0.2 + 0.1, zf], [0, 0, 0], [1, 1, 1]);                 // riser
    K.add("granite", new THREE.PlaneGeometry(16, 0.72), [0, (i + 1) * 0.2, zf - 0.35], [-Math.PI / 2, 0, 0], [1, 1, 1]);   // tread
    box("trim", 16, 0.03, 0.05, 0, (i + 1) * 0.2 - 0.015, zf + 0.02);
  }
  [-1, 1].forEach((s) => {
    box("granite", 0.9, 1.75, 4.6, s * 8.45, 0.875, 10.1);
    box("trim", 1.1, 0.16, 4.8, s * 8.45, 1.83, 10.1);
    box("granite", 0.7, 0.5, 0.7, s * 8.45, 2.16, 12.0);                 // a plinth for the lamp at the foot
  });

  // ── the main block: brick mass behind a 0.35-deep face with real openings ────────────────────────────────────────────
  const FZ = -0.175, FD = 0.35, TOPB = 13.2;
  K.boxF("brick", 52, TOPB - G, 9.65, 0, (TOPB + G) / 2, -0.35 - 4.825, "pz ny");   // (its front is hidden behind the face: not drawn)
  // the wings' face: full-length strips between the window rows, and the fields beside each window
  [-1, 1].forEach((s) => {
    const x0 = PAV, x1 = 26, cx = s * (x0 + x1) / 2, len = x1 - x0;
    const ys = [[G, ROWS[0].y0], [ROWS[0].y1, ROWS[1].y0], [ROWS[1].y1, ROWS[2].y0], [ROWS[2].y1, TOPB]];
    ys.forEach(([a, b]) => box("brick", len, b - a, FD, cx, (a + b) / 2, FZ));
    // zones outside the bays
    [[x0, WBAY0], [WBAY0 + NWB * WBAY, x1]].forEach(([a, b]) => ROWS.forEach((r) => box("brick", b - a, r.y1 - r.y0, FD, s * (a + b) / 2, (r.y0 + r.y1) / 2, FZ)));
    for (let k = 0; k < NWB; k++) {
      const bx = s * (WBAY0 + (k + 0.5) * WBAY);
      ROWS.forEach((r, ri) => {
        [-1, 1].forEach((q) => box("brick", (WBAY - r.w) / 2, r.y1 - r.y0, FD, bx + q * (r.w / 2 + (WBAY - r.w) / 4), (r.y0 + r.y1) / 2, FZ));
        sash(K, bx, r.y0, r.y1, r.w, rnd(k * 17 + ri * 5 + (s > 0 ? 40 : 0)) < [0.3, 0.42, 0.25][ri], r.head);
      });
    }
    // the string course at the main storey's floor and a band under the upper storey
    box("trim", len + 0.2, 0.26, 0.2, cx, 5.35, 0.08, TP);
    box("trim", len + 0.2, 0.14, 0.12, cx, 10.15, 0.04, TP);
    // quoins up the outer corner, on the front and the side
    for (let y = G, i = 0; y < TOPB - 0.3; y += 0.62, i++) {
      const L = i % 2 ? 0.7 : 1.15;
      box("trim", L, 0.54, 0.08, s * (26 - L / 2), y + 0.29, 0.03, TP);
      box("trim", 0.08, 0.54, L, s * 26.03, y + 0.29, -L / 2, TP);
    }
    // the side face: two bays of applied sash windows per storey
    [-3.0, -7.0].forEach((zc, k) => ROWS.forEach((r, ri) => sashSide(K, s, zc, r, rnd(k * 9 + ri * 3 + (s > 0 ? 5 : 1)) < 0.3)));
  });
  // the centre face behind the arcade and the loggia: brick, the porch doors, the loggia's tall windows and pilasters
  box("brick", PAV * 2, 5.5 - G, FD, 0, (5.5 + G) / 2, FZ);
  box("brick", PAV * 2, TOPB - 10.2, FD, 0, (10.2 + TOPB) / 2, FZ);
  const LB = [0, -2.06, 2.06, -4.12, 4.12, -6.17, 6.17];
  const bounds = [-PAV, ...LB.flatMap((x) => [x - 0.6, x + 0.6]).sort((a, b) => a - b), PAV];
  for (let i = 0; i < bounds.length; i += 2) box("brick", bounds[i + 1] - bounds[i], 10.2 - 5.5, FD, (bounds[i] + bounds[i + 1]) / 2, (5.5 + 10.2) / 2, FZ);
  LB.forEach((x, i) => {
    // a tall window with an arched head opening onto the loggia
    const lit = i % 3 !== 1;
    K.add(lit ? "glassLit" : "glass", unitUV(new THREE.ShapeGeometry(archPath(new THREE.Shape(), -0.6, 0.6, 0, 3.6 - 0.6, true, 12))), [x, 5.6, -0.26], [0, 0, 0], [1, 1, 1], { keepUV: true });
    box("trim", 0.06, 3.6, 0.08, x, 5.6 + 1.8, -0.22); [1.1, 2.2].forEach((yy) => box("trim", 1.2, 0.05, 0.08, x, 5.6 + yy, -0.22));
    K.add("trim", archRing(0.6, 0.14, 0.1), [x, 5.6 + 3.0, -0.02], [0, 0, 0], [1, 1, 1], TP);
    box("trim", 0.34, 0.4, 0.14, x, 5.6 + 3.65, 0.0, TP);
    box("brick", 1.2, 10.2 - 9.2, FD, x, 9.7, FZ);
    // the porch doors behind the side arches: panelled leaves and a lit fanlight
  });
  ARCH.slice(1).forEach(([a, b]) => {
    const x = (a + b) / 2;
    box("wood", 1.1, 1.9, 0.1, x, G + 0.95, 0.04);
    [0.5, 1.35].forEach((yy) => [-0.25, 0.25].forEach((q) => box("wood", 0.38, 0.6, 0.05, x + q, G + yy, 0.1)));
    K.add("glassLit", unitUV(new THREE.CircleGeometry(0.55, 14, 0, Math.PI)), [x, G + 1.95, 0.03], [0, 0, 0], [1, 1, 1], { keepUV: true });
    K.add("trim", archRing(0.55, 0.12, 0.08), [x, G + 1.95, 0.03], [0, 0, 0], [1, 1, 1]);
    box("trim", 1.5, 0.12, 0.12, x, G + 1.95, 0.06);
  });
  // pilasters behind each column (responds), on the loggia wall
  COLS.forEach((x) => { box("trim", 0.62, LOG1 - LOG0, 0.14, x, (LOG0 + LOG1) / 2, 0.07, TP); box("trim", 0.8, 0.3, 0.2, x, LOG1 - 0.15, 0.1, TP); });

  // ── the roofline: cornice with dentils and modillions, the balustrade, the hipped slate roof and its chimneys ─────────
  K.add("trim", mould([[0, 0], ...arcPts(0, 0, 0.16, 0.14, true, 3), [0.16, 0.2], [0.7, 0.2], [0.7, 0.42], ...cymaPts(0.7, 0.42, 0.95, 0.66, 6)], 52.6), [0, TOPB - 0.05, 0], [0, 0, 0], [1, 1, 1], TP);
  for (let i = 0; i < 150; i++) box("trim", 0.13, 0.16, 0.14, -26 + (i + 0.5) * 52 / 150, TOPB - 0.18, 0.08, TP);
  for (let i = 0; i < 64; i++) { const x = -25.8 + (i + 0.5) * 51.6 / 64; if (Math.abs(x) > PAV + 0.2) box("trim", 0.2, 0.14, 0.62, x, TOPB + 0.08, 0.32, TP); }
  [-1, 1].forEach((s) => balustrade(K, s * 10, s * 26, TOPB + 0.62, 0.28, 0.95));
  box("trim", 52.4, 0.62, 0.5, 0, TOPB + 0.31, 0.05, TP);   // the parapet's plinth over the cornice
  {
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(-9.4, 0); sh.lineTo(-6.6, 2.6); sh.lineTo(-2.8, 2.6); sh.closePath();
    const roof = new THREE.ExtrudeGeometry(sh, { depth: 51, bevelEnabled: false }); roof.translate(0, 0, -25.5); roof.rotateY(-Math.PI / 2);
    K.add("slate", roof, [0, TOPB + 0.4, -0.3], [0, 0, 0], [1, 1, 1]);
  }
  [-22, -14, 14, 22].forEach((x) => { box("brick", 1.2, 3.2, 1.0, x, TOPB + 2.2, -6); box("trim", 1.45, 0.2, 1.25, x, TOPB + 3.8, -6); [-0.25, 0.25].forEach((q) => box("iron", 0.22, 0.4, 0.22, x + q, TOPB + 4.1, -6)); });

  // ── the arcade: a brick wall 0.7 deep pierced by seven arches; archivolts, imposts, keystones; quoins at its corners ────
  {
    const sh = new THREE.Shape(); sh.moveTo(-PAV, 0); sh.lineTo(PAV, 0); sh.lineTo(PAV, 5.2 - G); sh.lineTo(-PAV, 5.2 - G); sh.closePath();
    ARCH.forEach(([a, b, sp]) => sh.holes.push(archPath(new THREE.Path(), a, b, 0, sp - G, true, 14)));
    K.add("brick", new THREE.ExtrudeGeometry(sh, { depth: 0.7, bevelEnabled: false, curveSegments: 3 }), [0, G, 3.3], [0, 0, 0], [1, 1, 1], TP);
    ARCH.forEach(([a, b, sp]) => {
      const r = (b - a) / 2, x = (a + b) / 2;
      K.add("trim", archRing(r, 0.2, 0.1), [x, sp, 3.98], [0, 0, 0], [1, 1, 1], TP);
      box("trim", 0.46, 0.55, 0.16, x, sp + r + 0.12, 4.02, TP);                    // keystone
      [-1, 1].forEach((q) => box("trim", 0.32, 0.18, 0.78, x + q * (r + 0.1), sp - 0.09, 3.65, TP));   // imposts
    });
    // the band over the arcade and the loggia floor's edge
    box("trim", PAV * 2 + 0.2, 0.22, 0.86, 0, 5.18, 3.67, TP);
    for (let y = G, i = 0; y < 5.0; y += 0.62, i++) [-1, 1].forEach((s) => { const L = i % 2 ? 0.55 : 0.9; box("trim", L, 0.54, 0.07, s * (PAV - L / 2), y + 0.29, 4.02, TP); box("trim", 0.07, 0.54, L, s * (PAV + 0.02), y + 0.29, 4.0 - L / 2, TP); });
    // the porch: ceiling and side walls (the hall's own walls close the centre bay)
    box("trim", PAV * 2, 0.12, 3.3, 0, 5.14, 1.65);
    [-1, 1].forEach((s) => box("brick", 0.4, 5.2 - G, 3.3, s * (PAV - 0.2), (5.2 + G) / 2, 1.65));
  }

  // ── the loggia: floor, Corinthian columns, the balustrade between them ───────────────────────────────────────────────
  box("trim", 19.2, 0.25, 4.5, 0, 5.32, 2.1, TP);
  const SH0 = LOG0 + 0.46, CAP = 0.78, SH1 = LOG1 - CAP;
  const shaft = lathe(Array.from({ length: 9 }, (_, i) => { const t = i / 8; return [t < 0.33 ? 0.34 : 0.34 - 0.055 * Math.pow((t - 0.33) / 0.67, 1.3), t * (SH1 - SH0)]; }), 22);
  const cbase = lathe([[0.48, 0], [0.48, 0.07], ...arcPts(0.48, 0.07, 0.4, 0.16, true, 3), [0.37, 0.18], ...arcPts(0.37, 0.18, 0.4, 0.24, false, 2), ...arcPts(0.4, 0.24, 0.34, 0.3, true, 2), [0.34, 0.31]], 22);
  const bell = lathe([[0.3, 0], [0.31, 0.25], [0.35, 0.5], [0.42, CAP - 0.14], [0.0001, CAP - 0.14]], 20);
  const leafA = leaf(0.32, 0.2), leafB = leaf(0.46, 0.17), helix = volute(0.075, 0.04, 1, 1.8, 40), helixM = volute(0.075, 0.04, -1, 1.8, 40);
  const abacus = (() => {
    const a = 0.5, c = 0.07, k = 0.12, s = new THREE.Shape();
    s.moveTo(-a + c, -a); s.quadraticCurveTo(0, -a + k, a - c, -a); s.lineTo(a, -a + c);
    s.quadraticCurveTo(a - k, 0, a, a - c); s.lineTo(a - c, a);
    s.quadraticCurveTo(0, a - k, -a + c, a); s.lineTo(-a, a - c);
    s.quadraticCurveTo(-a + k, 0, -a, -a + c); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.13, bevelEnabled: false, curveSegments: 6 }); g.rotateX(-Math.PI / 2); return g;
  })();
  const astr = new THREE.TorusGeometry(0.3, 0.035, 6, 22); astr.rotateX(Math.PI / 2);
  COLS.forEach((x) => {
    box("trim", 0.98, 0.15, 0.98, x, LOG0 + 0.075, COL_Z, TC);
    K.add("trim", cbase, [x, LOG0 + 0.15, COL_Z], [0, 0, 0], [1, 1, 1], TC);
    K.add("trim", shaft, [x, SH0, COL_Z], [0, 0, 0], [1, 1, 1], TC);
    K.add("trim", astr, [x, SH1 - 0.02, COL_Z], [0, 0, 0], [1, 1, 1], TC);
    K.add("trim", bell, [x, SH1, COL_Z], [0, 0, 0], [1, 1, 1], TC);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2, b = a + Math.PI / 8;
      K.add("trim", leafA, [x + Math.sin(a) * 0.27, SH1 + 0.01, COL_Z + Math.cos(a) * 0.27], [0, a, 0], [1, 1, 1], TC);
      K.add("trim", leafB, [x + Math.sin(b) * 0.25, SH1 + 0.12, COL_Z + Math.cos(b) * 0.25], [0, b, 0], [1, 1, 1], TC);
    }
    // the four corner volutes (helices) under the abacus's horns, the middle rosettes
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + (k * Math.PI) / 2;
      K.add("trim", k % 2 ? helixM : helix, [x + Math.sin(a) * 0.5, SH1 + CAP - 0.25, COL_Z + Math.cos(a) * 0.5], [0, a, 0], [1, 1, 1], TC);
      const b = (k * Math.PI) / 2;
      K.add("trim", new THREE.SphereGeometry(0.06, 6, 4), [x + Math.sin(b) * 0.42, SH1 + CAP - 0.22, COL_Z + Math.cos(b) * 0.42], [0, 0, 0], [1, 1, 1], TC);
    }
    K.add("trim", abacus, [x, SH1 + CAP - 0.14, COL_Z], [0, 0, 0], [1, 1, 1], TC);
  });
  [[-7.6 + -0.0, -5.6], [-4.65, -3.55], [-2.6, -1.5], [1.5, 2.6], [3.55, 4.65], [5.6, 7.6]].forEach(([a, b]) => balustrade(K, a + 0.05, b - 0.05, LOG0 + 0.0, COL_Z, 1.0));

  // ── the entablature over the loggia, the pediment with raking cornices and its oculus ────────────────────────────────
  const EW = 19.8, EF = COL_Z + 0.44;
  box("trim", EW, 1.0, EF + 0.3, 0, LOG1 + 0.5, (EF - 0.3) / 2, TP);
  box("trim", EW, 0.2, 0.08, 0, LOG1 + 0.1, EF + 0.04, TP); box("trim", EW, 0.22, 0.08, 0, LOG1 + 0.33, EF + 0.1, TP);
  K.add("trim", mould([[0, 0], ...arcPts(0, 0, 0.1, 0.08, true, 3), [0.1, 0.1]], EW), [0, LOG1 + 0.44, EF + 0.14], [0, 0, 0], [1, 1, 1], TP);
  const DY = LOG1 + 1.0;
  for (let i = 0; i < 58; i++) box("trim", 0.15, 0.18, 0.16, -EW / 2 + (i + 0.5) * EW / 58, DY + 0.09, EF + 0.12, TP);
  for (let i = 0; i < 24; i++) box("trim", 0.2, 0.15, 0.55, -EW / 2 + 0.3 + (i + 0.5) * (EW - 0.6) / 24, DY + 0.26, EF + 0.3, TP);
  K.add("trim", mould([[0, 0], [0.7, 0], [0.7, 0.24], [0.6, 0.24], ...cymaPts(0.6, 0.24, 0.84, 0.44, 5)], EW + 0.8), [0, DY + 0.18, EF - 0.02], [0, 0, 0], [1, 1, 1], TP);
  const PB = DY + 0.62, PH = 3.0, PW = EW / 2 + 0.1;
  {
    const s = new THREE.Shape(); s.moveTo(-PW, 0); s.lineTo(PW, 0); s.lineTo(0, PH); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: EF + 0.3, bevelEnabled: false }); g.translate(0, 0, -0.3);
    K.add("trim", g, [0, PB, 0], [0, 0, 0], [1, 1, 1], TP);
    // the raking cornices
    const ang = Math.atan2(PH, PW), L = Math.hypot(PW, PH) + 0.5;
    [-1, 1].forEach((q) => K.add("trim", mould([[0, 0], [0.5, 0], [0.5, 0.2], ...cymaPts(0.5, 0.2, 0.72, 0.4, 5)], L), [q * PW / 2, PB + PH / 2 - 0.04, EF - 0.03], [0, 0, -q * ang], [1, 1, 1], TP));
    // the tympanum's border and the oculus
    K.add("trim", new THREE.TorusGeometry(0.72, 0.1, 8, 32), [0, PB + 1.15, EF + 0.02], [0, 0, 0], [1, 1, 1], TP);
    K.add("drumLit", unitUV(new THREE.CircleGeometry(0.72, 28)), [0, PB + 1.15, EF + 0.012], [0, 0, 0], [1, 1, 1], { keepUV: true });
    box("trim", 1.44, 0.05, 0.04, 0, PB + 1.15, EF + 0.03, TP); box("trim", 0.05, 1.44, 0.04, 0, PB + 1.15, EF + 0.03, TP);   // the oculus's glazing bars
    for (let k = 0; k < 4; k++) box("trim", 0.22, 0.3, 0.12, Math.sin(k * Math.PI / 2) * 0.86, PB + 1.15 + Math.cos(k * Math.PI / 2) * 0.86, EF + 0.04, TP);
  }

  // ── the dome: its square base, the drum (pilasters, arched lit windows), the cornice ring, ribs and bands, the lantern ──
  const DZ = -5, DR = 5.4;
  box("brick", 13, 2.2, 13, 0, 14.6, DZ, TD);
  box("trim", 13.6, 0.3, 13.6, 0, 15.8, DZ, TD); box("trim", 13.3, 0.25, 13.3, 0, 13.62, DZ, TD);
  [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([sx, sz]) => [-4, 0, 4].forEach((o) => {
    const px = sx ? sx * 6.52 : o, pz = sz ? DZ + sz * 6.52 : DZ + o;
    K.add("trim", new THREE.TorusGeometry(0.42, 0.08, 6, 20), [px, 14.7, pz], [0, sx ? Math.PI / 2 : 0, 0], [1, 1, 1], TD);
    K.add("glass", new THREE.CircleGeometry(0.42, 16), [px + sx * 0.01, 14.7, pz + sz * 0.01], [0, sx ? sx * Math.PI / 2 : (sz < 0 ? Math.PI : 0), 0], [1, 1, 1], { keepUV: true });
  }));
  K.add("trim", new THREE.CylinderGeometry(DR, DR, 2.6, 64, 1, true), [0, 17.2, DZ], [0, 0, 0], [1, 1, 1], TD);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2, b = a + Math.PI / 16;
    K.add("trim", new THREE.BoxGeometry(0.4, 2.5, 0.16), [Math.sin(a) * (DR + 0.06), 17.2, DZ + Math.cos(a) * (DR + 0.06)], [0, a, 0], [1, 1, 1], TD);
    const win = new THREE.ShapeGeometry(archPath(new THREE.Shape(), -0.36, 0.36, 0, 1.2, true, 10));
    K.add("drumLit", win, [Math.sin(b) * (DR + 0.015), 16.25, DZ + Math.cos(b) * (DR + 0.015)], [0, b, 0], [1, 1, 1], { keepUV: false });
    K.add("trim", archRing(0.36, 0.09, 0.06), [Math.sin(b) * (DR + 0.01), 17.45, DZ + Math.cos(b) * (DR + 0.01)], [0, b, 0], [1, 1, 1], TD);
    K.add("trim", new THREE.BoxGeometry(0.9, 0.08, 0.12), [Math.sin(b) * (DR + 0.04), 16.2, DZ + Math.cos(b) * (DR + 0.04)], [0, b, 0], [1, 1, 1], TD);
  }
  K.add("trim", lathe([[DR, 0], [DR + 0.12, 0], ...arcPts(DR + 0.12, 0, DR + 0.3, 0.16, true, 3), [DR + 0.45, 0.18], [DR + 0.45, 0.36], [DR - 0.2, 0.38]], 64), [0, 18.45, DZ], [0, 0, 0], [1, 1, 1], TD);
  const DY0 = 18.8, DRY = 0.92;
  K.add("gold", new THREE.SphereGeometry(DR, 64, 28, 0, Math.PI * 2, 0, Math.PI / 2), [0, DY0, DZ], [0, 0, 0], [1, DRY, 1], { keepUV: true });
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2, pts = [];
    for (let i = 0; i <= 16; i++) { const t = 0.02 + 0.86 * (i / 16), r = DR * Math.sqrt(1 - t * t) + 0.04; pts.push(new THREE.Vector3(Math.sin(a) * r, DY0 + t * DR * DRY, DZ + Math.cos(a) * r)); }
    K.add("gold", new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 18, 0.1, 5, false), [0, 0, 0], [0, 0, 0], [1, 1, 1]);
  }
  [0.18, 0.5].forEach((t) => K.add("gold", new THREE.TorusGeometry(DR * Math.sqrt(1 - t * t) + 0.02, 0.07, 6, 64), [0, DY0 + t * DR * DRY, DZ], [Math.PI / 2, 0, 0], [1, 1, 1]));
  // the lantern (a ring of slim columns round a lit core, entablature, gold cap, the pinecone)
  const LY = DY0 + DR * DRY - 0.2;
  K.add("trim", lathe([[1.5, 0], [1.5, 0.12], [1.35, 0.18], [1.35, 0.3], [0.0001, 0.3]], 32), [0, LY, DZ], [0, 0, 0], [1, 1, 1], TD);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    K.add("trim", new THREE.CylinderGeometry(0.075, 0.09, 1.45, 10), [Math.sin(a) * 1.15, LY + 1.05, DZ + Math.cos(a) * 1.15], [0, 0, 0], [1, 1, 1], TD);
    K.add("trim", new THREE.BoxGeometry(0.2, 0.12, 0.2), [Math.sin(a) * 1.15, LY + 1.84, DZ + Math.cos(a) * 1.15], [0, a, 0], [1, 1, 1], TD);
  }
  K.add("trim", lathe([[1.42, 0], [1.42, 0.14], [1.52, 0.2], [1.52, 0.32], [0.0001, 0.34]], 32), [0, LY + 1.9, DZ], [0, 0, 0], [1, 1, 1], TD);
  K.add("gold", new THREE.SphereGeometry(1.22, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), [0, LY + 2.24, DZ], [0, 0, 0], [1, 0.75, 1], { keepUV: true });
  K.add("gold", lathe([[0.2, 0], [0.12, 0.12], [0.16, 0.2], [0.07, 0.3]], 16), [0, LY + 3.12, DZ], [0, 0, 0], [1, 1, 1]);
  K.add("cone", lathe(Array.from({ length: 12 }, (_, i) => { const t = i / 11; return [0.0001 + 0.26 * Math.sin(Math.PI * Math.pow(t, 0.8)) * (1 - 0.25 * t), t * 0.85]; }), 16), [0, LY + 3.4, DZ], [0, 0, 0], [1, 1, 1], { keepUV: true });

  // ── the gate piers with their lanterns, and the open iron gates (they close the station's fence at x ±10.2) ──────────
  [-1, 1].forEach((s) => {
    const px = s * GATE_X;
    box("granite", 1.3, 3.4, 1.3, px, 1.7, GATE_Z, TG);
    box("trim", 1.6, 0.25, 1.6, px, 0.12, GATE_Z, TG);
    K.add("trim", mould([[0, 0], [0.12, 0], ...cymaPts(0.12, 0, 0.26, 0.22, 4)], 1.3), [px, 3.4, GATE_Z + 0.65], [0, 0, 0], [1, 1, 1], TG);
    box("trim", 1.82, 0.26, 1.82, px, 3.75, GATE_Z, TG);
    box("granite", 0.9, 0.3, 0.9, px, 4.03, GATE_Z, TG);
    // the lantern: an iron frame round a lit glass, a cap and a finial
    box("iron", 0.3, 0.55, 0.3, px, 4.45, GATE_Z);
    K.add("lamp", new THREE.CylinderGeometry(0.42, 0.3, 1.0, 6, 1), [px, 5.2, GATE_Z], [0, 0, 0], [1, 1, 1], { keepUV: true });
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; K.add("iron", new THREE.BoxGeometry(0.05, 1.04, 0.05), [px + Math.cos(a) * 0.38, 5.2, GATE_Z + Math.sin(a) * 0.38], [0, -a, 0], [1, 1, 1]); }
    K.add("iron", new THREE.ConeGeometry(0.58, 0.42, 6), [px, 5.9, GATE_Z], [0, 0, 0], [1, 1, 1]);
    K.add("iron", new THREE.SphereGeometry(0.08, 8, 6), [px, 6.2, GATE_Z], [0, 0, 0], [1, 1, 1]);
    // the gate leaf, swung open toward the house: pickets with spear heads, three rails, a scroll band
    const gx = s * (GATE_X - 0.85), L = 3.8, n = 16;
    for (let i = 0; i < n; i++) {
      const z = GATE_Z - 0.2 - (i + 0.5) * L / n, hh = 2.6 + 0.35 * Math.sin(Math.PI * (i + 0.5) / n);
      K.add("iron", new THREE.CylinderGeometry(0.035, 0.035, hh, 6), [gx, 0.25 + hh / 2, z], [0, 0, 0], [1, 1, 1]);
      K.add("iron", new THREE.ConeGeometry(0.075, 0.24, 6), [gx, 0.25 + hh + 0.1, z], [0, 0, 0], [1, 1, 1]);
    }
    [0.45, 1.6, 2.55].forEach((y) => box("iron", 0.07, 0.08, L, gx, y, GATE_Z - 0.2 - L / 2));
    box("iron", 0.12, 2.9, 0.12, gx, 1.6, GATE_Z - 0.2);
    for (let i = 0; i < 8; i++) K.add("iron", new THREE.TorusGeometry(0.17, 0.022, 4, 12), [gx, 2.08, GATE_Z - 0.2 - (i + 0.5) * L / 8], [0, Math.PI / 2, 0], [1, 1, 1]);
  });
  // the lamps on the cheek walls at the foot of the steps
  [-1, 1].forEach((s) => {
    const x = s * 8.45, z = 12.0;
    K.add("iron", new THREE.CylinderGeometry(0.07, 0.1, 1.6, 8), [x, 3.2, z], [0, 0, 0], [1, 1, 1]);
    K.add("lamp", new THREE.CylinderGeometry(0.3, 0.22, 0.7, 6, 1), [x, 4.35, z], [0, 0, 0], [1, 1, 1], { keepUV: true });
    K.add("iron", new THREE.ConeGeometry(0.42, 0.3, 6), [x, 4.85, z], [0, 0, 0], [1, 1, 1]);
  });
  return K;
};

// normalise a flat geometry's uvs to 0..1 over its own bounds (a window's interior print, once per pane)
function unitUV(g) {
  g.computeBoundingBox(); const b = g.boundingBox, P = g.attributes.position, U = g.attributes.uv;
  for (let i = 0; i < P.count; i++) U.setXY(i, (P.getX(i) - b.min.x) / (b.max.x - b.min.x), (P.getY(i) - b.min.y) / (b.max.y - b.min.y));
  return g;
}
// a sash window in the front face (facade frame): glass, the sashes (6 over 6), the surround, the sill and the head
function sash(K, x, y0, y1, w, lit, head) {
  const h = y1 - y0, z = -0.27;
  K.add(lit ? "glassLit" : "glass", new THREE.PlaneGeometry(w, h), [x, (y0 + y1) / 2, z], [0, 0, 0], [1, 1, 1], { keepUV: true });
  const b = (key, ww, hh, d, xx, yy, zz, opt) => K.box(key, ww, hh, d, xx, yy, zz, 0, opt);
  [-1, 1].forEach((q) => b("trim", 0.09, h, 0.1, x + q * (w / 2 - 0.045), (y0 + y1) / 2, z + 0.04));
  b("trim", w, 0.09, 0.1, x, y0 + 0.045, z + 0.04); b("trim", w, 0.09, 0.1, x, y1 - 0.045, z + 0.04);
  b("trim", w, 0.08, 0.12, x, (y0 + y1) / 2, z + 0.05);                                   // the meeting rail
  [-1, 1].forEach((q) => b("trim", 0.035, h, 0.06, x + q * w / 6, (y0 + y1) / 2, z + 0.03));   // muntins: 3 across
  [0.25, 0.75].forEach((t) => b("trim", w, 0.035, 0.06, x, y0 + h * t, z + 0.03));            // 2 high per sash
  // the reveal's lining, the surround, the sill
  [-1, 1].forEach((q) => b("brick", 0.06, h, 0.3, x + q * (w / 2 + 0.03), (y0 + y1) / 2, -0.17));
  [-1, 1].forEach((q) => b("trim", 0.14, h + 0.14, 0.06, x + q * (w / 2 + 0.07), (y0 + y1) / 2, 0.03, { tag: 2 }));
  b("trim", w + 0.42, 0.12, 0.3, x, y0 - 0.06, 0.1, { tag: 2 }); b("trim", w + 0.3, 0.08, 0.16, x, y0 - 0.16, 0.04, { tag: 2 });
  if (head === "arch") {           // a splayed flat arch with a keystone
    b("trim", w + 0.5, 0.36, 0.06, x, y1 + 0.2, 0.03, { tag: 2 }); b("trim", 0.32, 0.5, 0.1, x, y1 + 0.22, 0.05, { tag: 2 });
  } else if (head === "cornice") { // a frieze and a small cornice head
    b("trim", w + 0.3, 0.3, 0.06, x, y1 + 0.2, 0.03, { tag: 2 }); b("trim", w + 0.6, 0.12, 0.26, x, y1 + 0.41, 0.1, { tag: 2 }); b("trim", w + 0.5, 0.06, 0.2, x, y1 + 0.5, 0.08, { tag: 2 });
  } else b("trim", w + 0.3, 0.16, 0.06, x, y1 + 0.1, 0.03, { tag: 2 });
}
// an applied sash window on a side face (x = ±26, facing ±x)
function sashSide(K, s, zc, r, lit) {
  const h = r.y1 - r.y0, X = s * 26.03, rot = s * Math.PI / 2;
  K.add(lit ? "glassLit" : "glass", new THREE.PlaneGeometry(r.w, h), [X + s * 0.01, (r.y0 + r.y1) / 2, zc], [0, rot, 0], [1, 1, 1], { keepUV: true });
  const B = new THREE.BoxGeometry(1, 1, 1);
  const add = (w, hh, d, y, dz) => K.add("trim", B, [X + s * d / 2, y, zc + dz], [0, 0, 0], [d, hh, w], { tag: 2 });
  add(0.12, h, 0.06, (r.y0 + r.y1) / 2, -r.w / 2); add(0.12, h, 0.06, (r.y0 + r.y1) / 2, r.w / 2);
  add(r.w + 0.12, 0.1, 0.06, r.y1, 0); add(r.w + 0.4, 0.12, 0.2, r.y0 - 0.05, 0); add(r.w, 0.07, 0.07, (r.y0 + r.y1) / 2, 0);
  add(0.035, h, 0.05, (r.y0 + r.y1) / 2, 0);
  add(r.w + 0.3, 0.28, 0.07, r.y1 + 0.2, 0);
}
// a balustrade along x at height y, depth line z: plinth rail, vase balusters, the top rail
function balustrade(K, x0, x1, y, z, h) {
  if (x1 < x0) [x0, x1] = [x1, x0];
  const n = Math.max(2, Math.floor((x1 - x0) / 0.3)), bh = h - 0.26;
  const bg = baluster(bh, 0.1, 8);
  for (let i = 0; i < n; i++) K.add("trim", bg, [x0 + (i + 0.5) * (x1 - x0) / n, y + 0.13, z], [0, 0, 0], [1, 1, 1], { tag: 2 });
  K.box("trim", x1 - x0, 0.13, 0.36, (x0 + x1) / 2, y + 0.065, z, 0, { tag: 2 });
  K.box("trim", x1 - x0 + 0.08, 0.13, 0.42, (x0 + x1) / 2, y + h - 0.065, z, 0, { tag: 2 });
}

// ── fx: uplight on the colonnade and the trim, a wash over the brick from below, dark porch and undersides ──────────────
const fxHouse = (x, y, z, nx, ny, nz, u) => {
  let g = 0, ao = 1;
  const hb = Math.max(0, y - G);
  if (u.tag === 1) g = 0.85 * (0.25 + 0.75 * Math.exp(-(y - LOG0) / 3.0)) * (0.4 + 0.6 * Math.max(0, nz));
  else if (u.tag === 3) g = 0.18 + 0.12 * Math.max(0, nz);
  else if (u.tag === 5) g = 0.12;
  else {
    g = 0.16 * Math.exp(-hb / 6) * (0.5 + 0.5 * Math.max(0, nz));
    if (Math.abs(x) < PAV + 0.5 && z > -0.1) g += 0.18 * Math.exp(-Math.max(0, y - 5.3) / 4);   // the pavilion's own uplights
    if (ny < -0.5 && y > LOG1 - 0.2 && y < LOG1 + 2 && Math.abs(x) < 10.5) g = 0.5;            // the entablature soffit
  }
  if (ny < -0.5) ao *= 0.75;
  if (Math.abs(x) < PAV - 0.3 && z > -0.05 && z < 3.25 && y < 5.15) ao *= 0.68;                  // inside the porch
  if (Math.abs(x) < PAV && z > -0.05 && z < 3.0 && y > 5.4 && y < LOG1) ao *= 0.78;            // the loggia's back wall
  ao *= 0.85 + 0.15 * smoothstep(0, 3, y);
  return [g, ao];
};

const useHouse = () => useMemo(() => {
  const K = buildHouse();
  const parts = K.build(fxHouse, { brick: 0.25, trim: 0.25, granite: 0.2, slate: 0.35, wood: 0.5, iron: 0.5 });
  const T = (draw, k, w = 512, h = 512) => ({ map: srgbTex("sh2_" + k, w, h, (c, W, H) => draw(c, W, H, false)), bump: linTex("sh2_" + k + "_b", w, h, (c, W, H) => draw(c, W, H, true)) });
  const br = T(drawBrick, "brick", 1024, 1024), pa = T(drawPaint, "paint"), gr = T(drawGranite, "granite"), sl = T(drawSlate, "slate"), go = T(drawGold, "gold", 1024, 512), co = T(drawCone, "cone", 256, 256);
  const COOL = "#C6D9F5";
  const lampTex = srgbTex("sh2_lamp", 64, 128, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#FFF1D0"); g.addColorStop(1, "#FFC57A"); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = "rgba(60,40,20,0.5)"; c.fillRect(0, h * 0.48, w, 4); });
  const mats = {
    brick: kitMat({ map: br.map, bumpMap: br.bump, bumpScale: 1.6, color: "#A7AFC2", roughness: 0.9, glow: COOL, glowI: 1.0 }),
    trim: kitMat({ map: pa.map, bumpMap: pa.bump, bumpScale: 0.4, color: "#C8D2E2", roughness: 0.62, glow: COOL, glowI: 1.0 }),
    granite: kitMat({ map: gr.map, bumpMap: gr.bump, bumpScale: 0.8, color: "#A3AEC2", roughness: 0.72, glow: COOL, glowI: 1.0 }),
    slate: kitMat({ map: sl.map, bumpMap: sl.bump, bumpScale: 1.5, color: "#8E9AB0", roughness: 0.5, metalness: 0.15 }),
    wood: kitMat({ map: flatTex(), bumpMap: flatTex(true), color: "#1E2633", roughness: 0.45, metalness: 0.1 }),
    iron: kitMat({ map: flatTex(), bumpMap: flatTex(true), color: "#121925", roughness: 0.4, metalness: 0.7 }),
    gold: kitMat({ map: go.map, bumpMap: go.bump, bumpScale: 0.6, color: "#FFFFFF", metalness: 0.92, roughness: 0.3, emissive: "#FFCF7A", emissiveIntensity: 0.04, envMapIntensity: 1.6 }),
    cone: kitMat({ map: co.map, bumpMap: co.bump, bumpScale: 2.0, color: "#FFFFFF", metalness: 0.9, roughness: 0.32, emissive: "#FFCF7A", emissiveIntensity: 0.05, envMapIntensity: 1.6 }),
    glass: kitMat({ map: glassTex(), emissiveMap: blackTex(), emissive: "#000000", color: "#9FB2CC", roughness: 0.12, metalness: 0.55, envMapIntensity: 1.3 }),
    glassLit: kitMat({ map: interiorTex(), emissiveMap: interiorTex(), emissive: "#FFFFFF", emissiveIntensity: 1.0, color: "#FFFFFF", roughness: 0.3 }),
    drumLit: kitMat({ map: interiorTex(), emissiveMap: interiorTex(), emissive: "#FFFFFF", emissiveIntensity: 0.9, color: "#FFFFFF", roughness: 0.3 }),
    lamp: kitMat({ map: lampTex, emissiveMap: lampTex, emissive: "#FFFFFF", emissiveIntensity: 2.2, color: "#FFFFFF", roughness: 0.3 })
  };
  const casts = { trim: true, brick: true, granite: true, gold: true, iron: true };
  const meshes = parts.map(({ key, geometry }) => { const m = new THREE.Mesh(geometry, mats[key]); m.castShadow = !!casts[key]; m.receiveShadow = true; return m; });
  return { meshes, mats };
}, []);

/** The State House. `dome` 0..1 brightens the dome, drum and lantern (the money arriving); `door` 0..1 lights the centre hall. */
export const StateHouse = ({ dome = 0, door = 0 }) => {
  const { meshes, mats } = useHouse();
  const hall = useMemo(hallTex, []);
  mats.gold.emissiveIntensity = 0.04 + 0.42 * dome; mats.cone.emissiveIntensity = 0.05 + 0.4 * dome;
  mats.drumLit.emissiveIntensity = 0.9 + 0.6 * dome;
  const LY = 18.8 + 5.4 * 0.92 - 0.2;
  return (
    <group>
      {meshes.map((m, i) => <primitive key={i} object={m} />)}
      {/* the hall behind the open centre door: floor, panelled walls, a chandelier's warm light, the two leaves swung in */}
      <mesh position={[0, G + 0.01, 2.15]} rotation-x={-Math.PI / 2}><planeGeometry args={[3.2, 3.7]} /><meshStandardMaterial color="#4A3A28" roughness={0.35} metalness={0.1} emissive="#FFB15A" emissiveIntensity={0.08 + 0.35 * door} /></mesh>
      <mesh position={[0, 3.2, 0.3]}><planeGeometry args={[3.2, 4.0]} /><meshBasicMaterial map={hall} color={new THREE.Color("#FFFFFF").multiplyScalar(0.32 + 0.75 * door)} /></mesh>
      {[-1.6, 1.6].map((x) => <mesh key={x} position={[x * 0.99, 3.1, 2.15]} rotation-y={x < 0 ? Math.PI / 2 : -Math.PI / 2}><planeGeometry args={[3.7, 3.8]} /><meshStandardMaterial map={hall} color="#9A8266" roughness={0.6} emissive="#FFB15A" emissiveIntensity={0.05 + 0.25 * door} /></mesh>)}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 1.55, 0, 3.25]} rotation-y={sd * 1.25}>
          <mesh position={[0, 2.95, 0]} castShadow><boxGeometry args={[0.08, 3.4, 1.5]} /><meshStandardMaterial color="#232C3A" roughness={0.45} metalness={0.2} /></mesh>
          {[1.9, 2.95, 3.95].map((y) => <mesh key={y} position={[sd * 0.05, y, 0]}><boxGeometry args={[0.03, 0.7, 1.1]} /><meshStandardMaterial color="#2E3849" roughness={0.4} metalness={0.25} /></mesh>)}
          <mesh position={[sd * 0.07, 2.9, sd * -0.5]}><sphereGeometry args={[0.05, 8, 6]} /><meshStandardMaterial color="#E9CD8C" metalness={0.9} roughness={0.3} /></mesh>
        </group>
      ))}
      {/* the lamps: gate piers, cheek walls; the lantern's light */}
      {[-1, 1].map((s) => <Glow key={"g" + s} position={[s * GATE_X, 5.2, GATE_Z]} size={3.2} color="#FFC27A" opacity={0.6} />)}
      {[-1, 1].map((s) => <Glow key={"c" + s} position={[s * 8.45, 4.35, 12.0]} size={2.4} color="#FFC27A" opacity={0.55} />)}
      <Glow position={[0, LY + 1.05, -5]} size={2.6 + 1.6 * dome} color="#FFDDA0" opacity={0.35 + 0.35 * dome} />
      {/* the lantern's lit core between its columns */}
      <mesh position={[0, LY + 1.05, -5]}><cylinderGeometry args={[0.95, 0.95, 1.5, 20]} /><meshStandardMaterial color="#3A2C1C" emissive="#FFD08A" emissiveIntensity={0.9 + 1.6 * dome} /></mesh>
    </group>
  );
};
