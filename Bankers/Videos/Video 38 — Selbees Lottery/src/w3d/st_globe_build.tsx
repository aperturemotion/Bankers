// @ts-nocheck
// ★ V38 GLOBE — MIT's BUILDING 10 and the GREAT DOME on Killian Court, at night (rev 2, builder F; Timur 2026-11-26: "make the
//   buildings of MIT … a lot more detailed … a lot more eye-catching and just better overall").
//   The real architecture: a wide flight of granite steps up to a podium; a giant portico of ten Ionic columns (fluted shafts,
//   Attic bases, volute capitals with egg-and-dart, abaci); a three-fascia architrave; the frieze carrying the facade's real
//   inscription MASSACHVSETTS INSTITVTE OF TECHNOLOGY in incised Roman capitals; a dentil cornice; a pediment-less attic with
//   sunk panels and its own cornice; behind it the drum (pilasters, small windows, a dentil cornice), the stepped rings and the
//   shallow Great Dome with its ribs, the oculus ring and its lantern. Behind the colonnade, tall bronze-framed windows in three
//   tiers with spandrel panels and the bronze doors; either side the long wings (Buildings 3 and 4) with a rusticated base,
//   a giant order of pilasters, two-tier windows, an entablature with dentils and an attic storey. Limestone with an ashlar
//   canvas map + bump; the columns uplit (a baked per-vertex wash, bld_kit fx), a few warm lit windows.
//   Everything is merged by material (bld_kit Kit): ~12 meshes for several thousand parts.
//   Station frame (unchanged): faces −x, its front (the colonnade wall) at local x = 0, extends toward +x; the station places it at
//   [26, 0, 0] × 0.6. Built here in a facade frame (x across, +z out) and turned −90° about y.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Glow, rnd } from "./kit";
import { Kit, kitMat, srgbTex, linTex, flatTex, blackTex, mould, arcPts, cymaPts, lathe, flutedShaft, volute, smoothstep } from "./bld_kit";
import { SERIF } from "./print_type";

// ── textures ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// ashlar limestone: 512 px = 4 units (uv scale 0.25); courses 0.5 u, blocks 1.5 u, staggered
const drawAshlar = (c, w, h, bump) => {
  c.fillStyle = bump ? "#C8C8C8" : "#CBCFD5"; c.fillRect(0, 0, w, h);
  const ch = 80, bw = 256;
  for (let r = 0; r < h / ch; r++) {
    for (let x = -((r * 96) % bw); x < w; x += bw) {
      const v = rnd(r * 31 + Math.round(x)) * 0.07 - 0.035;
      c.fillStyle = bump ? (v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`) : (v > 0 ? `rgba(255,252,245,${v})` : `rgba(20,30,45,${-v})`);
      c.fillRect(x, r * ch, bw, ch);
      c.fillStyle = bump ? "#000" : "rgba(70,78,92,0.28)"; c.fillRect(x, r * ch, 2, ch);
    }
    c.fillStyle = bump ? "#000" : "rgba(70,78,92,0.3)"; c.fillRect(0, r * ch, w, 2);
  }
  for (let i = 0; i < 26000; i++) { const g = rnd(i * 3 + 7); c.fillStyle = bump ? `rgba(${g > 0.5 ? 255 : 0},${g > 0.5 ? 255 : 0},${g > 0.5 ? 255 : 0},0.08)` : `rgba(${g > 0.5 ? "255,255,250" : "40,48,60"},${0.05 + rnd(i) * 0.06})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 1.6, 1.6); }
};
const drawSmooth = (c, w, h, bump) => {
  c.fillStyle = bump ? "#808080" : "#CED2D8"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) { const g = c.createRadialGradient(rnd(i) * w, rnd(i + 9) * h, 0, rnd(i) * w, rnd(i + 9) * h, 40 + rnd(i + 3) * 90); g.addColorStop(0, bump ? "rgba(0,0,0,0.03)" : "rgba(30,40,60,0.022)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); }
  for (let i = 0; i < 22000; i++) { const g = rnd(i * 5 + 1); c.fillStyle = `rgba(${g > 0.5 ? "255,255,255" : "30,38,50"},${0.04 + rnd(i + 4) * 0.06})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 1.5, 1.5); }
  // the drum joints of a shaft / the block joints of a cornice, every 1.6 u (204 px)
  c.fillStyle = bump ? "rgba(0,0,0,0.6)" : "rgba(70,78,92,0.35)"; for (let y = 0; y < h; y += 205) c.fillRect(0, y, w, 2);
};
const drawRustic = (c, w, h, bump) => {
  c.fillStyle = bump ? "#D0D0D0" : "#BFC4CC"; c.fillRect(0, 0, w, h);
  const ch = 77, bw = 230;       // 0.6 u courses, 1.8 u blocks, deep V-joints
  for (let r = 0; r < Math.ceil(h / ch); r++) {
    const y = r * ch;
    for (let x = -((r * 115) % bw); x < w; x += bw) {
      const v = rnd(r * 17 + Math.round(x) * 3) * 0.1 - 0.05;
      c.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; c.fillRect(x, y, bw, ch);
      const g = c.createLinearGradient(x, 0, x + 8, 0); g.addColorStop(0, bump ? "#000" : "rgba(40,48,62,0.7)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(x, y, 8, ch);
    }
    const g = c.createLinearGradient(0, y, 0, y + 10); g.addColorStop(0, bump ? "#000" : "rgba(40,48,62,0.75)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, y, w, 10);
  }
  for (let i = 0; i < 20000; i++) { const g = rnd(i * 7 + 2); c.fillStyle = `rgba(${g > 0.5 ? "255,255,255" : "30,38,50"},${0.05 + rnd(i) * 0.06})`; c.fillRect(rnd(i + 5) * w, rnd(i + 6) * h, 1.6, 1.6); }
};
// the dome's own courses (sphere uv: u around, v equator → crown)
const drawDome = (c, w, h, bump) => {
  c.fillStyle = bump ? "#C0C0C0" : "#C6CCD4"; c.fillRect(0, 0, w, h);
  const rows = 14;
  for (let r = 0; r < rows; r++) {
    const y = r * h / rows, n = Math.max(8, Math.round(96 * Math.cos((r / rows) * Math.PI / 2)));
    for (let k = 0; k < n; k++) {
      const x = ((k + (r % 2) * 0.5) / n) * w, bw = w / n;
      const v = rnd(r * 97 + k) * 0.1 - 0.05;
      c.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; c.fillRect(x, y, bw, h / rows);
      c.fillStyle = bump ? "#000" : "rgba(60,70,86,0.22)"; c.fillRect(x, y, 2, h / rows);
    }
    c.fillStyle = bump ? "#000" : "rgba(60,70,86,0.26)"; c.fillRect(0, y, w, 2);
  }
  for (let i = 0; i < 20000; i++) { const g = rnd(i * 11 + 3); c.fillStyle = `rgba(${g > 0.5 ? "255,255,255" : "30,38,50"},${0.05 + rnd(i) * 0.05})`; c.fillRect(rnd(i + 8) * w, rnd(i + 9) * h, 1.5, 1.5); }
};
// the frieze: the facade's real inscription, incised (a shadowed upper wall, a lit lower lip), 28.8 × 0.85 u
const FRIEZE_W = 28.8, FRIEZE_H = 0.85, INSCRIPTION = "MASSACHVSETTS INSTITVTE OF TECHNOLOGY";
const drawFrieze = (c, w, h, bump) => {
  if (bump) { c.fillStyle = "#FFFFFF"; c.fillRect(0, 0, w, h); } else drawSmooth(c, w, h, false);
  const px = Math.round(h * 0.62);
  c.font = `400 ${px}px ${SERIF}`; c.textBaseline = "middle";
  // fit the line to ~90 % of the frieze with Roman letter-spacing
  const chars = INSCRIPTION.split("");
  const raw = chars.reduce((s, ch) => s + c.measureText(ch).width, 0);
  const track = (w * 0.9 - raw) / (chars.length - 1);
  const draw = (dx, dy, col) => { let x = w * 0.05; c.fillStyle = col; for (const ch of chars) { c.fillText(ch, x + dx, h / 2 + dy); x += c.measureText(ch).width + track; } };
  if (bump) { draw(0, 0, "#000000"); return; }
  draw(0, 3, "rgba(245,248,252,1)");        // the lit lower lip of each cut
  draw(0, -1, "rgba(14,20,32,1)");          // the cut itself, in shadow
  draw(0, 0, "rgba(34,42,58,1)");
};
const interiorTex = () => srgbTex("mit_interior", 128, 256, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#FFE7B8"); g.addColorStop(0.55, "#F2B871"); g.addColorStop(1, "#B9773D");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  const r = c.createRadialGradient(w / 2, 26, 2, w / 2, 26, 70); r.addColorStop(0, "rgba(255,250,235,0.9)"); r.addColorStop(1, "rgba(255,250,235,0)"); c.fillStyle = r; c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(120,70,30,0.45)"; c.fillRect(0, 0, 16, h); c.fillRect(w - 16, 0, 16, h);
  c.fillStyle = "rgba(90,50,20,0.35)"; for (let k = 0; k < 4; k++) c.fillRect(20 + k * 24, 150, 14, 106);   // shelves / stacks inside
});
const glassTex = () => srgbTex("mit_glass", 128, 256, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#3A5578"); g.addColorStop(0.45, "#1A2B45"); g.addColorStop(1, "#0E1A2C");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(170,200,240,0.10)"; c.beginPath(); c.moveTo(0, h * 0.75); c.lineTo(w * 0.75, 0); c.lineTo(w, 0); c.lineTo(0, h); c.fill();
});

// ── the plan (facade frame: x across, y up, +z out; the colonnade wall's face at z = 0) ─────────────────────────────────
const PODIUM = 1.5, COL_Z = 3.0, COLS = Array.from({ length: 10 }, (_, i) => -12.6 + i * 2.8);
const BAYS = Array.from({ length: 9 }, (_, i) => -11.2 + i * 2.8);
const DOME_Z = -9.5;
const SH1 = 11.9, E0 = SH1 + 0.64, FR0 = E0 + 1.02, EZ = COL_Z + 0.62;
const WING_X0 = 14.4, WING_X1 = 51, WING_FRONT = 2, BAY_W = 2.95, WBAYS = 12;

const buildMIT = () => {
  const K = new Kit();
  const box = (key, w, h, d, x, y, z, opt) => K.box(key, w, h, d, x, y, z, 0, opt);
  const T = { col: { tag: 1 }, dome: { tag: 3 }, wing: { tag: 4 } };

  // ── steps, podium, cheek blocks ──────────────────────────────────────────────────────────────────────────────────────
  const NST = 8, RISE = PODIUM / NST, RUN = 0.42, PODIUM_FRONT = 4.4;
  for (let k = 0; k < NST; k++) {
    const zf = PODIUM_FRONT + (NST - k) * RUN;    // step k's nosing
    // one riser and one tread per step (stacked blocks drew every riser down to the ground, hidden: full cost in software)
    K.add("granite", new THREE.PlaneGeometry(32, RISE), [0, k * RISE + RISE / 2, zf], [0, 0, 0], [1, 1, 1]);
    K.add("granite", new THREE.PlaneGeometry(32, RUN + 0.02), [0, (k + 1) * RISE, zf - RUN / 2], [-Math.PI / 2, 0, 0], [1, 1, 1]);
  }
  K.boxF("smooth@b", 30.4, PODIUM, PODIUM_FRONT + 1, 0, PODIUM / 2, (PODIUM_FRONT - 1) / 2, "pz ny nz");
  [-1, 1].forEach((s) => {
    // the cheek blocks flanking the flight, a plinth course and a cap
    const cz = PODIUM_FRONT + NST * RUN / 2 + 0.2;
    box("rustic", 1.6, 2.5, NST * RUN + 1.6, s * 16.8, 1.25, cz - 0.2);
    box("smooth", 1.9, 0.28, NST * RUN + 1.9, s * 16.8, 2.64, cz - 0.2);
    box("smooth", 1.75, 0.3, NST * RUN + 1.75, s * 16.8, 0.15, cz - 0.2);
  });
  box("smooth", 33.6, 0.28, 0.25, 0, PODIUM + 0.02, PODIUM_FRONT - 0.05);      // podium edge band

  // ── the colonnade wall: piers between tall three-tier windows, bronze frames and spandrels ─────────────────────────
  const WIN_W = 1.7, Y0 = 2.2, Y1 = 12.0, TOP = 12.6;
  const piers = [-14.4, ...BAYS.map((x) => x - WIN_W / 2), ...BAYS.map((x) => x + WIN_W / 2), 14.4].sort((a, b) => a - b);
  for (let i = 0; i < piers.length; i += 2) {
    const a = piers[i], b = piers[i + 1];
    box("ashlar", b - a, TOP - PODIUM, 0.36, (a + b) / 2, (TOP + PODIUM) / 2, -0.18);
  }
  BAYS.forEach((bx, bi) => {
    // rev 4 (Timur: the door "is just like a cutoff window"): the middle bay's opening runs DOWN TO THE PODIUM FLOOR — it started 0.7 m
    //   up on a window sill — and holds real glazed bronze double doors with a threshold, pulls and a lit transom
    const isDoor = bi === 4, yLow = isDoor ? PODIUM : Y0;
    if (!isDoor) box("ashlar", WIN_W, Y0 - PODIUM, 0.36, bx, (Y0 + PODIUM) / 2, -0.18);
    box("ashlar", WIN_W, TOP - Y1, 0.36, bx, (TOP + Y1) / 2, -0.18);
    // a moulded stone surround and a sill (the door: a granite threshold instead)
    box("smooth", WIN_W + 0.3, 0.16, 0.12, bx, Y1 + 0.08, 0.06);
    if (isDoor) box("smooth", WIN_W + 0.2, 0.05, 0.5, bx, PODIUM + 0.025, -0.05);
    else box("smooth", WIN_W + 0.36, 0.12, 0.22, bx, Y0 - 0.06, 0.08);
    [-1, 1].forEach((s) => box("smooth", 0.15, Y1 - yLow, 0.1, bx + s * (WIN_W / 2 + 0.075), (yLow + Y1) / 2, 0.05));
    // three tiers of glass in bronze: tier 1 (the doors in the middle bay), spandrel, tier 2, spandrel, tier 3
    const tiers = [[yLow, 5.4], [6.1, 8.8], [9.5, Y1]];
    tiers.forEach(([ya, yb], ti) => {
      const door = bi === 4 && ti === 0;
      if (door) {
        // two glazed bronze door leaves (each: stiles, a top rail, a tall lit glass light, a mid rail with a push plate, a solid kick
        //   panel), a meeting stile, vertical pulls, then a transom bar and a lit transom light with two mullions
        const DH = 3.45, LW = WIN_W / 2 - 0.05, d0 = ya + 0.02;
        [-1, 1].forEach((s) => {
          const cx = bx + s * (LW / 2 + 0.025);
          box("bronze", 0.13, DH, 0.1, cx - LW / 2 + 0.065, d0 + DH / 2, -0.26); box("bronze", 0.13, DH, 0.1, cx + LW / 2 - 0.065, d0 + DH / 2, -0.26);
          box("bronze", LW, 0.16, 0.1, cx, d0 + DH - 0.08, -0.26);                       // top rail
          box("bronze", LW, 0.62, 0.1, cx, d0 + 0.31, -0.26);                            // kick panel
          box("bronze", LW - 0.18, 0.44, 0.03, cx, d0 + 0.31, -0.2);                     // its raised field
          box("bronze", LW, 0.12, 0.1, cx, d0 + 1.05, -0.26);                            // mid rail
          K.add("glassLit", new THREE.PlaneGeometry(LW - 0.24, DH - 1.3), [cx, d0 + 1.11 + (DH - 1.3) / 2, -0.3], [0, 0, 0], [1, 1, 1], { keepUV: true });
          K.add("glassLit", new THREE.PlaneGeometry(LW - 0.24, 0.3), [cx, d0 + 0.8, -0.3], [0, 0, 0], [1, 1, 1], { keepUV: true });
          box("bronze", 0.05, 0.9, 0.05, bx + s * 0.1, d0 + 1.45, -0.17);               // the vertical pull
          [0, 1].forEach((q) => box("bronze", 0.05, 0.05, 0.09, bx + s * 0.1, d0 + 1.05 + q * 0.8, -0.2));   // its standoffs
        });
        box("bronze", 0.05, DH, 0.12, bx, d0 + DH / 2, -0.25);                           // the meeting stile
        box("bronze", WIN_W, 0.16, 0.14, bx, d0 + DH + 0.08, -0.27);                     // the transom bar
        const t0 = d0 + DH + 0.16;
        K.add("glassLit", new THREE.PlaneGeometry(WIN_W, yb - t0), [bx, (t0 + yb) / 2, -0.32], [0, 0, 0], [1, 1, 1], { keepUV: true });
        [-1, 1].forEach((s) => box("bronze", 0.05, yb - t0, 0.08, bx + s * WIN_W / 6, (t0 + yb) / 2, -0.27));
      } else {
        const lit = rnd(bi * 7 + ti * 3 + 1) < 0.22;
        K.add(lit ? "glassLit" : "glass", new THREE.PlaneGeometry(WIN_W, yb - ya), [bx, (ya + yb) / 2, -0.32], [0, 0, 0], [1, 1, 1], { keepUV: true });
        // mullions (three lights) and two transoms
        [-1, 1].forEach((s) => box("bronze", 0.06, yb - ya, 0.1, bx + s * WIN_W / 6, (ya + yb) / 2, -0.27));
        [1, 2].forEach((q) => box("bronze", WIN_W, 0.05, 0.08, bx, ya + (yb - ya) * q / 3, -0.27));
      }
      box("bronze", WIN_W, 0.09, 0.14, bx, ya, -0.27); box("bronze", WIN_W, 0.09, 0.14, bx, yb, -0.27);
      [-1, 1].forEach((s) => box("bronze", 0.09, yb - ya, 0.14, bx + s * (WIN_W / 2 - 0.045), (ya + yb) / 2, -0.27));
    });
    // the spandrel panels: bronze with a raised border
    [[5.4, 6.1], [8.8, 9.5]].forEach(([ya, yb]) => {
      box("bronze", WIN_W, yb - ya, 0.1, bx, (ya + yb) / 2, -0.3);
      box("bronze", WIN_W - 0.3, yb - ya - 0.22, 0.06, bx, (ya + yb) / 2, -0.23);
    });
  });

  // ── the ten Ionic columns ─────────────────────────────────────────────────────────────────────────────────────────────
  const SH0 = 2.35, R0 = 0.62, R1 = 0.53;
  const shaft = flutedShaft(R0, R1, SH1 - SH0, 20, 4, 5);
  const base = lathe([[0.84, 0], [0.84, 0.1], ...arcPts(0.84, 0.1, 0.72, 0.24, true, 4), [0.66, 0.27], ...arcPts(0.66, 0.27, 0.62, 0.36, false, 3), [0.7, 0.38], ...arcPts(0.7, 0.38, 0.62, 0.48, true, 3), [0.62, 0.5]], 20);
  const astragal = new THREE.TorusGeometry(R1 + 0.03, 0.045, 4, 20); astragal.rotateX(Math.PI / 2);
  const echinus = lathe([[R1 + 0.02, 0], ...arcPts(R1 + 0.02, 0, 0.7, 0.26, true, 5), [0.0001, 0.26]], 20);
  const egg = new THREE.SphereGeometry(1, 6, 4);
  const vol = volute(0.33, 0.07, 1, 2.3, 44), volM = volute(0.33, 0.07, -1, 2.3, 44);
  const bolster = new THREE.CylinderGeometry(0.21, 0.21, 1.3, 16, 1); bolster.rotateX(Math.PI / 2);
  COLS.forEach((cx) => {
    const z = COL_Z;
    box("smooth", 1.72, 0.35, 1.72, cx, PODIUM + 0.175, z, T.col);
    K.add("smooth", base, [cx, PODIUM + 0.35, z], [0, 0, 0], [1, 1, 1], T.col);
    K.add("smooth", shaft, [cx, (SH0 + SH1) / 2, z], [0, 0, 0], [1, 1, 1], T.col);
    K.add("smooth", astragal, [cx, SH1 - 0.02, z], [0, 0, 0], [1, 1, 1], T.col);
    K.add("smooth", echinus, [cx, SH1 + 0.02, z], [0, 0, 0], [1, 1, 1], T.col);
    for (let k = 1; k < 8; k++) {             // the eggs on the visible (front) half
      const a = (k / 16) * Math.PI * 2;
      K.add("smooth", egg, [cx + Math.cos(a) * 0.63, SH1 + 0.15, z + Math.sin(a) * 0.63], [0, -a, 0], [0.05, 0.09, 0.08], T.col);
    }
    // the canalis (the band between the volutes), the bolsters behind, the spiral faces front and back
    box("smooth", 1.5, 0.2, 1.28, cx, SH1 + 0.36, z, T.col);
    [-1, 1].forEach((s) => {
      K.add("smooth", bolster, [cx + s * 0.72, SH1 + 0.13, z], [0, 0, 0], [1, 1, 1], T.col);
      K.add("smooth", s > 0 ? vol : volM, [cx + s * 0.72, SH1 + 0.13, z + 0.63], [0, 0, 0], [1, 1, 1], T.col);
    });
    box("smooth", 1.55, 0.16, 1.55, cx, SH1 + 0.56, z, T.col);   // the abacus
  });

  // ── entablature: three-fascia architrave, the inscribed frieze, bed moulding, dentils, corona, cyma ────────────────────
  const EW = 29.6, MF = EZ - 0.05;
  K.boxF("smooth@b", EW, 3.0, MF + 0.8, 0, E0 + 1.5, (MF - 0.8) / 2, "pz py nz");           // the mass, back to the wall
  [[0, 0.24, 0], [0.24, 0.3, 0.05], [0.54, 0.34, 0.1]].forEach(([y, hh, dz]) => box("smooth", EW, hh, 0.12, 0, E0 + y + hh / 2, EZ + dz));
  K.add("smooth", mould([[0, 0], ...arcPts(0, 0, 0.12, 0.1, true, 3), [0.12, 0.14]], EW), [0, E0 + 0.88, EZ + 0.16], [0, 0, 0], [1, 1, 1]);
  // (the inscription plane is a separate mesh, see below)
  K.add("smooth", mould([[0, 0], [0.05, 0], ...arcPts(0.05, 0, 0.22, 0.18, true, 4), [0.22, 0.2]], EW), [0, FR0 + FRIEZE_H, EZ + 0.02], [0, 0, 0], [1, 1, 1]);
  const DY = FR0 + FRIEZE_H + 0.2;
  const nD = Math.floor(EW / 0.34);
  for (let i = 0; i < nD; i++) box("smooth", 0.18, 0.24, 0.2, -EW / 2 + (i + 0.5) * EW / nD, DY + 0.12, EZ + 0.33);
  box("smooth", EW, 0.26, 0.24, 0, DY + 0.13, EZ + 0.1);
  K.add("smooth", mould([[0, 0], [0.62, 0], [0.62, 0.36], [0.5, 0.36], ...cymaPts(0.5, 0.36, 0.84, 0.66, 6), [0.84, 0.72]], EW + 1.2), [0, DY + 0.26, EZ + 0.02], [0, 0, 0], [1, 1, 1]);
  // returns of the cornice along both ends
  [-1, 1].forEach((s) => box("smooth", 0.84, 1.0, EZ + 1.0, s * (EW / 2 + 0.2), DY + 0.6, (EZ + 1.0) / 2 - 0.1));
  const ETOP = DY + 0.98;

  // ── the attic (no pediment): plinth, sunk panels over each intercolumniation, its cornice ──────────────────────────────
  const A0 = ETOP, A1 = ETOP + 2.5, AZ = EZ - 0.3;
  K.boxF("smooth@b", EW - 0.6, A1 - A0, AZ + 6, 0, (A0 + A1) / 2, AZ / 2 - 3, "ny nz");
  box("smooth", EW - 0.4, 0.3, 0.2, 0, A0 + 0.15, AZ + 0.05);
  BAYS.forEach((bx) => {
    // a sunk panel: a raised moulded frame around a recessed field
    const pw = 2.0, ph = 1.3, py = (A0 + A1) / 2 + 0.05;
    box("smooth", pw, 0.1, 0.08, bx, py + ph / 2, AZ + 0.04); box("smooth", pw, 0.1, 0.08, bx, py - ph / 2, AZ + 0.04);
    [-1, 1].forEach((s) => box("smooth", 0.1, ph, 0.08, bx + s * pw / 2, py, AZ + 0.04));
  });
  COLS.forEach((cx) => box("smooth", 1.4, A1 - A0 - 0.3, 0.14, cx, (A0 + A1) / 2 + 0.1, AZ + 0.07));   // the attic's pilaster-blocks over the columns
  K.add("smooth", mould([[0, 0], ...arcPts(0, 0, 0.18, 0.16, true, 3), [0.42, 0.16], [0.42, 0.36], ...cymaPts(0.42, 0.36, 0.62, 0.56, 5)], EW), [0, A1 - 0.05, AZ], [0, 0, 0], [1, 1, 1]);
  const ATOP = A1 + 0.5;

  // ── the block behind, carrying the drum ──────────────────────────────────────────────────────────────────────────────
  K.boxF("ashlar@b", 28, 0.6, 15.5, 0, ATOP - 0.3, -3.2 - 7.75, "ny pz nz");

  // ── the drum, its cornice, the stepped rings, the Great Dome, ribs, oculus ring, lantern ──────────────────────────────
  const D0 = A1 - 0.1, D1 = D0 + 3.6, DR = 8.6;
  K.add("ashlar", new THREE.CylinderGeometry(DR, DR, D1 - D0, 72, 1, true), [0, (D0 + D1) / 2, DOME_Z], [0, 0, 0], [1, 1, 1], T.dome);
  const NP = 28;
  for (let k = 0; k < NP; k++) {
    const a = (k / NP) * Math.PI * 2;
    K.add("smooth", new THREE.BoxGeometry(0.6, D1 - D0 - 0.2, 0.22), [Math.sin(a) * (DR + 0.08), (D0 + D1) / 2, DOME_Z + Math.cos(a) * (DR + 0.08)], [0, a, 0], [1, 1, 1], T.dome);
    const b = a + Math.PI / NP, lit = rnd(k * 5 + 3) < 0.25;
    K.add(lit ? "glassLit" : "glass", new THREE.PlaneGeometry(0.62, 1.5), [Math.sin(b) * (DR + 0.02), (D0 + D1) / 2 + 0.1, DOME_Z + Math.cos(b) * (DR + 0.02)], [0, b, 0], [1, 1, 1], { keepUV: true });
    K.add("smooth", new THREE.BoxGeometry(0.86, 0.12, 0.16), [Math.sin(b) * (DR + 0.06), (D0 + D1) / 2 - 0.68, DOME_Z + Math.cos(b) * (DR + 0.06)], [0, b, 0], [1, 1, 1], T.dome);
  }
  K.add("smooth", lathe([[DR, 0], [DR + 0.2, 0], [DR + 0.2, 0.18], ...arcPts(DR + 0.2, 0.18, DR + 0.42, 0.34, true, 3), [DR + 0.7, 0.36], [DR + 0.7, 0.62], [DR - 0.4, 0.66]], 72), [0, D1, DOME_Z], [0, 0, 0], [1, 1, 1], T.dome);
  for (let k = 0; k < 150; k++) {
    const a = (k / 150) * Math.PI * 2;
    K.add("smooth", new THREE.BoxGeometry(0.16, 0.18, 0.16), [Math.sin(a) * (DR + 0.32), D1 + 0.44, DOME_Z + Math.cos(a) * (DR + 0.32)], [0, a, 0], [1, 1, 1], T.dome);
  }
  const S0 = D1 + 0.66, NSTEP = 5, SR = DR + 0.3;
  K.add("smooth", lathe(Array.from({ length: NSTEP }, (_, k) => [[SR - k * 0.38, k * 0.34], [SR - k * 0.38, (k + 1) * 0.34]]).flat().concat([[SR - NSTEP * 0.38 - 0.4, NSTEP * 0.34]]), 72), [0, S0, DOME_Z], [0, 0, 0], [1, 1, 1], T.dome);
  const DOME_R = 8.3, DOME_H = 4.4, DOME_Y = S0;   // the shell: an ellipsoid of revolution springing from the first ring
  K.add("dome", new THREE.SphereGeometry(DOME_R, 72, 22, 0, Math.PI * 2, 0, Math.PI / 2), [0, DOME_Y, DOME_Z], [0, 0, 0], [1, DOME_H / DOME_R, 1], { keepUV: true, tag: 3 });
  const OC = 0.93;   // the oculus ring sits at this fraction of the dome's height
  const ringR = DOME_R * Math.sqrt(1 - OC * OC);
  // 24 ribs from the top step to the oculus ring
  const yStepTop = S0 + NSTEP * 0.34, tStart = (yStepTop - DOME_Y) / DOME_H;
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2, pts = [];
    for (let i = 0; i <= 14; i++) {
      const t = tStart + (OC - tStart) * (i / 14), r = DOME_R * Math.sqrt(1 - t * t) + 0.06;
      pts.push(new THREE.Vector3(Math.sin(a) * r, DOME_Y + t * DOME_H, DOME_Z + Math.cos(a) * r));
    }
    K.add("smooth", new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.13, 4, false), [0, 0, 0], [0, 0, 0], [1, 1, 1], T.dome);
  }
  const LY = DOME_Y + OC * DOME_H;
  K.add("smooth", new THREE.TorusGeometry(ringR, 0.22, 8, 48), [0, LY, DOME_Z], [Math.PI / 2, 0, 0], [1, 1, 1], T.dome);
  K.add("smooth", new THREE.CylinderGeometry(ringR - 0.1, ringR + 0.1, 0.5, 40, 1), [0, LY + 0.1, DOME_Z], [0, 0, 0], [1, 1, 1], T.dome);
  // the lantern: a short drum of small windows between piers, a cornice ring, a low cap
  const LR = 1.15, L0 = LY + 0.35, L1 = L0 + 1.25;
  K.add("smooth", new THREE.CylinderGeometry(LR, LR, L1 - L0, 32, 1, true), [0, (L0 + L1) / 2, DOME_Z], [0, 0, 0], [1, 1, 1], T.dome);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, b = a + Math.PI / 8;
    K.add("smooth", new THREE.BoxGeometry(0.22, L1 - L0, 0.18), [Math.sin(a) * (LR + 0.06), (L0 + L1) / 2, DOME_Z + Math.cos(a) * (LR + 0.06)], [0, a, 0], [1, 1, 1], T.dome);
    K.add("glassLit", new THREE.PlaneGeometry(0.42, 0.8), [Math.sin(b) * (LR + 0.02), (L0 + L1) / 2, DOME_Z + Math.cos(b) * (LR + 0.02)], [0, b, 0], [1, 1, 1], { keepUV: true });
  }
  K.add("smooth", lathe([[LR, 0], [LR + 0.25, 0.05], [LR + 0.25, 0.22], [LR + 0.1, 0.28], ...arcPts(LR + 0.1, 0.28, 0.0001, 0.85, true, 6)], 32), [0, L1, DOME_Z], [0, 0, 0], [1, 1, 1], T.dome);

  // ── the wings (Buildings 3 and 4): rusticated base, a giant order of pilasters, two-tier windows, entablature, attic ─────
  const WD = 12, WB0 = 0, WB1 = 3.6, WP0 = 3.95, WP1 = 12.4, WE1 = 13.6, WA1 = 15.6;
  [-1, 1].forEach((s) => {
    const len = WING_X1 - WING_X0, cx = s * (WING_X0 + WING_X1) / 2;
    K.boxF("ashlar@b", len, WA1, WD, cx, WA1 / 2, WING_FRONT - WD / 2 - 0.6, "pz ny nz " + (s < 0 ? "px" : "nx"), T.wing);    // the mass (its front 0.6 behind the face)
    const FZ = WING_FRONT - 0.3, FD = 0.6;                                             // the face parts: 0.6 deep, front at WING_FRONT
    box("smooth", len + 0.1, 0.35, 0.42, cx, WB1 + 0.17, WING_FRONT + 0.06, T.wing);   // the string course
    [WING_X0 + 0.3, WING_X1 - 0.3].forEach((ex) => box("ashlar", 0.6, WA1, FD, s * ex, WA1 / 2, FZ, T.wing));   // the end piers
    const xs = Array.from({ length: WBAYS + 1 }, (_, k) => s * (WING_X0 + 0.6 + k * BAY_W));
    // the face strips spanning every bay (between the openings' storeys)
    box("rustic", len, 0.9, FD, cx, 0.45, FZ, T.wing); box("rustic", len, WB1 - 3.1, FD, cx, (3.1 + WB1) / 2, FZ, T.wing);
    box("ashlar", len, 0.6, FD, cx, WP0 + 0.3, FZ, T.wing); box("ashlar", len, 0.7 + 1.2, FD, cx, WP1 + 0.6 - 0.35, FZ - 0.05, T.wing);
    box("ashlar", len, 0.45, FD, cx, WE1 + 0.225, FZ, T.wing); box("ashlar", len, WA1 - (WA1 - 0.55), FD, cx, WA1 - 0.275, FZ, T.wing);
    box("ashlar", len, WP0 - WB1, FD, cx, (WB1 + WP0) / 2, FZ, T.wing);
    for (let k = 0; k < WBAYS; k++) {
      const bx = (xs[k] + xs[k + 1]) / 2, ww = 1.55, gw = 1.25, aw = 1.05;
      // the fields beside each opening: tall window, ground window, attic window
      [-1, 1].forEach((q) => {
        box("ashlar", (BAY_W - ww) / 2, WP1 - 0.7 - (WP0 + 0.6), FD, bx + q * (ww / 2 + (BAY_W - ww) / 4), (WP1 - 0.7 + WP0 + 0.6) / 2, FZ, T.wing);
        box("rustic", (BAY_W - gw) / 2, 3.1 - 0.9, FD, bx + q * (gw / 2 + (BAY_W - gw) / 4), 2.0, FZ, T.wing);
        box("ashlar", (BAY_W - aw) / 2, WA1 - 0.55 - (WE1 + 0.45), FD, bx + q * (aw / 2 + (BAY_W - aw) / 4), (WA1 - 0.55 + WE1 + 0.45) / 2, FZ, T.wing);
      });
      const ya = WP0 + 0.6, yb = WP1 - 0.7, ym = ya + (yb - ya) * 0.48;
      const tiers = [[ya, ym - 0.3], [ym + 0.3, yb]];
      tiers.forEach(([y0, y1], ti) => {
        const lit = rnd(k * 13 + ti * 5 + (s > 0 ? 50 : 0)) < 0.16;
        K.add(lit ? "glassLit" : "glass", new THREE.PlaneGeometry(ww, y1 - y0), [bx, (y0 + y1) / 2, WING_FRONT - 0.42], [0, 0, 0], [1, 1, 1], { keepUV: true });
        box("bronze", 0.06, y1 - y0, 0.08, bx, (y0 + y1) / 2, WING_FRONT - 0.38);
        box("bronze", ww, 0.06, 0.08, bx, y0 + (y1 - y0) * 0.62, WING_FRONT - 0.38);
        box("bronze", ww, 0.08, 0.12, bx, y0, WING_FRONT - 0.38); box("bronze", ww, 0.08, 0.12, bx, y1, WING_FRONT - 0.38);
      });
      box("bronze", ww, 0.6, 0.08, bx, ym, WING_FRONT - 0.4);                         // the spandrel
      box("bronze", ww - 0.3, 0.36, 0.05, bx, ym, WING_FRONT - 0.34);
      box("smooth", ww + 0.5, 0.14, 0.36, bx, ya - 0.05, WING_FRONT + 0.04, T.wing);   // the sill
      // ground window in the rusticated base, with a keystone
      const g0 = 0.9, g1 = 3.1, glit = rnd(k * 3 + (s > 0 ? 9 : 2)) < 0.14;
      K.add(glit ? "glassLit" : "glass", new THREE.PlaneGeometry(gw, g1 - g0), [bx, (g0 + g1) / 2, WING_FRONT - 0.36], [0, 0, 0], [1, 1, 1], { keepUV: true });
      box("bronze", 0.05, g1 - g0, 0.06, bx, (g0 + g1) / 2, WING_FRONT - 0.33); box("bronze", gw, 0.05, 0.06, bx, (g0 + g1) / 2 + 0.3, WING_FRONT - 0.33);
      box("smooth", 0.42, 0.55, 0.14, bx, g1 + 0.1, WING_FRONT + 0.04, T.wing);
      box("smooth", gw + 0.3, 0.12, 0.3, bx, g0 - 0.06, WING_FRONT + 0.06, T.wing);
      // attic window
      const a0 = WE1 + 0.45, a1 = WA1 - 0.55, alit = rnd(k * 19 + (s > 0 ? 4 : 1)) < 0.12;
      K.add(alit ? "glassLit" : "glass", new THREE.PlaneGeometry(aw, a1 - a0), [bx, (a0 + a1) / 2, WING_FRONT - 0.4], [0, 0, 0], [1, 1, 1], { keepUV: true });
      box("smooth", aw + 0.3, 0.1, 0.18, bx, a0 - 0.05, WING_FRONT + 0.05, T.wing);
    }
    // pilasters: base, shaft, a capital with a small echinus and abacus
    xs.forEach((px) => {
      box("smooth", 1.05, 0.42, 0.5, px, WP0 + 0.21, WING_FRONT + 0.1, T.wing);
      box("smooth", 0.85, WP1 - WP0 - 0.9, 0.3, px, (WP0 + WP1) / 2, WING_FRONT + 0.0, T.wing);
      box("smooth", 1.0, 0.2, 0.42, px, WP1 - 0.36, WING_FRONT + 0.06, T.wing);
      box("smooth", 1.12, 0.14, 0.5, px, WP1 - 0.17, WING_FRONT + 0.1, T.wing);
      [-1, 1].forEach((q) => K.add("smooth", new THREE.CylinderGeometry(0.1, 0.1, 0.3, 10), [px + q * 0.46, WP1 - 0.36, WING_FRONT + 0.2], [Math.PI / 2, 0, 0], [1, 1, 1], T.wing));
    });
    // entablature: architrave, frieze, dentils, cornice
    box("smooth", len, 0.42, 0.34, cx, WP1 + 0.21, WING_FRONT + 0.02, T.wing);
    box("ashlar", len, 0.48, 0.24, cx, WP1 + 0.66, WING_FRONT - 0.03, T.wing);
    const nd = Math.floor(len / 0.34);
    for (let i = 0; i < nd; i++) box("smooth", 0.17, 0.2, 0.18, cx - len / 2 + (i + 0.5) * len / nd, WP1 + 1.0, WING_FRONT + 0.16, T.wing);
    K.add("smooth", mould([[0, 0], [0.5, 0], [0.5, 0.18], ...cymaPts(0.5, 0.18, 0.74, 0.32, 5)], len + 0.6), [cx, WP1 + 1.1, WING_FRONT - 0.05], [0, 0, 0], [1, 1, 1], T.wing);
    K.add("smooth", mould([[0, 0], [0.24, 0], [0.24, 0.12], ...cymaPts(0.24, 0.12, 0.4, 0.26, 4)], len + 0.4), [cx, WA1 - 0.02, WING_FRONT - 0.42], [0, 0, 0], [1, 1, 1], T.wing);
  });
  return K;
};

// ── fx: the uplight on the columns and the portico, a soft wash on the wings and the dome, darkened undersides ──────────
const fxMIT = (x, y, z, nx, ny, nz, u) => {
  const hb = Math.max(0, y - PODIUM);
  let g = 0, ao = 1;
  let near = 0; for (const c of COLS) near = Math.max(near, Math.exp(-((x - c) * (x - c)) / (2 * 1.0 * 1.0)));
  if (u.tag === 1) {
    g = 1.7 * (0.18 + 0.82 * Math.exp(-hb / 4.6)) * (0.3 + 0.7 * Math.max(0, nz));
  } else if (u.tag === 3) {
    g = 0.28 * Math.exp(-Math.max(0, y - 18) / 4) * (0.4 + 0.6 * Math.max(0, nz));
  } else if (u.tag === 4) {
    const ax = Math.abs(x); let p = 0;
    for (let k = 0; k <= WBAYS; k++) { const px = WING_X0 + 0.6 + k * BAY_W; p = Math.max(p, Math.exp(-((ax - px) * (ax - px)) / (2 * 0.7 * 0.7))); }
    g = (0.05 + 0.4 * p) * Math.exp(-Math.max(0, y - 3.9) / 6) * (y > 3.9 ? 1 : 0.6);
  } else if (Math.abs(x) < 15.2 && z > -0.7) {
    g = (0.12 + 0.4 * near) * Math.exp(-hb / 7);
    if (ny < -0.5 && y > 11) g = 0.55;                    // the soffit of the architrave, lit from below
    if (y > SH_TOP && y < SH_TOP + 4.2 && nz > 0.5) g = Math.max(g, 0.32 * (0.5 + 0.5 * near) * (1 - smoothstep(SH_TOP, SH_TOP + 4.2, y)) + 0.12);   // the entablature catches the floods
  }
  if (ny < -0.5) ao *= 0.78;
  if (z < 0.05 && z > -0.5 && Math.abs(x) < 14.4 && y > 1.5 && y < 12.6 && u.tag !== 1) ao *= 0.62;   // the wall in the portico's shade
  ao *= 0.86 + 0.14 * smoothstep(0, 2.5, y);
  return [g, ao];
};
const SH_TOP = 12.5;

// a mesh for each merged material, built once
const useMIT = () => useMemo(() => {
  const K = buildMIT();
  const parts = K.build(fxMIT, { ashlar: 0.25, "ashlar@b": 0.25, smooth: 0.18, "smooth@b": 0.18, rustic: 0.25, granite: 0.3, bronze: 0.5 });
  const T = (draw, k, w = 512, h = 512) => ({ map: srgbTex("mit_" + k, w, h, (c, W, H) => draw(c, W, H, false)), bump: linTex("mit_" + k + "_b", w, h, (c, W, H) => draw(c, W, H, true)) });
  const ash = T(drawAshlar, "ashlar"), sm = T(drawSmooth, "smooth"), ru = T(drawRustic, "rustic"), dm = T(drawDome, "dome", 1024, 512);
  const COOL = "#C6D9F5";
  const mats = {
    ashlar: kitMat({ map: ash.map, bumpMap: ash.bump, bumpScale: 1.2, color: "#A9B5C6", roughness: 0.86, glow: COOL, glowI: 1.0 }),
    smooth: kitMat({ map: sm.map, bumpMap: sm.bump, bumpScale: 0.6, color: "#B4BFCF", roughness: 0.78, glow: COOL, glowI: 1.0 }),
    rustic: kitMat({ map: ru.map, bumpMap: ru.bump, bumpScale: 2.2, color: "#9EAABC", roughness: 0.88, glow: COOL, glowI: 1.0 }),
    granite: kitMat({ map: sm.map, bumpMap: sm.bump, bumpScale: 0.8, color: "#7E8BA0", roughness: 0.7, glow: COOL, glowI: 0.6 }),
    dome: kitMat({ map: dm.map, bumpMap: dm.bump, bumpScale: 1.4, color: "#B0BCCD", roughness: 0.74, glow: COOL, glowI: 1.0 }),
    bronze: kitMat({ map: flatTex(), bumpMap: flatTex(true), color: "#2C333E", roughness: 0.42, metalness: 0.65, envMapIntensity: 0.8 }),
    glass: kitMat({ map: glassTex(), emissiveMap: blackTex(), emissive: "#000000", color: "#9FB2CC", roughness: 0.12, metalness: 0.55, envMapIntensity: 1.3 }),
    glassLit: kitMat({ map: interiorTex(), emissiveMap: interiorTex(), emissive: "#FFFFFF", emissiveIntensity: 1.05, color: "#FFFFFF", roughness: 0.3 })
  };
  // draw order front to back (renderOrder sorts before material), so the depth test rejects the walls hidden behind the columns
  const ORDER = { granite: 1, smooth: 2, bronze: 3, glass: 4, glassLit: 5, rustic: 6, ashlar: 7, dome: 8 };
  const meshes = parts.map(({ key, geometry }) => { const [mk, back] = key.split("@"); const m = new THREE.Mesh(geometry, mats[mk]); m.receiveShadow = false; m.renderOrder = back ? 30 : 10 + ORDER[mk]; return m; });
  // the frieze inscription (own UVs; incised letters in the map and the bump)
  const fr = { map: srgbTex("mit_frieze", 4096, 120, (c, w, h) => drawFrieze(c, w, h, false)), bump: linTex("mit_frieze_b", 4096, 120, (c, w, h) => drawFrieze(c, w, h, true)) };
  [fr.map, fr.bump].forEach((t) => { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; });
  const fg = new THREE.PlaneGeometry(FRIEZE_W, FRIEZE_H);
  const F = new Float32Array(fg.attributes.position.count * 2); for (let i = 0; i < F.length; i += 2) { F[i] = 0.36; F[i + 1] = 1; }
  fg.setAttribute("fx", new THREE.Float32BufferAttribute(F, 2));
  const frieze = new THREE.Mesh(fg, kitMat({ map: fr.map, bumpMap: fr.bump, bumpScale: 2.5, color: "#B4BFCF", roughness: 0.8, glow: COOL, glowI: 1.0 }));
  frieze.position.set(0, FR0 + FRIEZE_H / 2, EZ - 0.04);
  frieze.renderOrder = 12;
  meshes.push(frieze);
  return meshes;
}, []);

export const MIT_PARTS = () => buildMIT().count;   // (the part count, for the report)
export const DomeBuilding = ({ lampsOn = 1 }) => {
  const meshes = useMIT();
  const LTOP = 27.6;
  return (
    <group>
      <group rotation-y={-Math.PI / 2}>
        {meshes.map((m, i) => <primitive key={i} object={m} />)}
        {/* the lantern's glow, and the floodlight fixtures at the column feet (cool white) */}
        <Glow position={[0, LTOP - 0.8, DOME_Z]} size={4.2} color="#FFC97A" opacity={0.42 * lampsOn} />
        {COLS.map((cx) => <Glow key={cx} position={[cx, PODIUM + 0.25, COL_Z + 1.25]} size={0.9} color="#DCEBFF" opacity={0.55} />)}
      </group>
    </group>
  );
};
