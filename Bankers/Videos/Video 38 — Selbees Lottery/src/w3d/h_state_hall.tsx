// @ts-nocheck
// ★ V38 rev 4 (builder H; Timur 2026-11-26: "the doors are open … and inside is just some kind of brown boxes … actually put there
//   something that should be there, detail that part of the building") — the ENTRANCE HALL behind the State House's open centre door,
//   after the building's Doric Hall: a vestibule under the porch, then the hall itself, 7.6 × 8.3 design units, with a polished
//   checkerboard floor of white and navy marble (it REFLECTS: the whole hall is drawn a second time mirrored under the floor, which
//   is laid as a partly transparent glossy sheet over it), four white fluted DORIC columns carrying beams, pilasters, a panelled
//   dado with a chair rail, tall moulded wall panels and a cornice; on the back wall an arched doorway (archivolt, keystone) onto the
//   grand STAIRCASE rising beyond (white steps, a navy runner, balusters, a walnut handrail, a lantern over it); two framed
//   paintings (a river valley at dusk, a harbour with a ship) over Federal benches, four brass sconces; a US flag and a plain blue
//   state-style flag on brass poles; a brass CHANDELIER (two tiers of candle arms) and a hall lantern in the vestibule.
//   Light is BAKED per vertex (h_tex.bake) into bld_kit's kitMat glow, warm white; `door` 0..1 raises it (the money arriving).
//   Units: the State House's design units (floor = the terrace top G = 1.2; the arcade's back face z 3.3; the main face z −0.35…0).
//   Everything is merged into one mesh per material (bld_kit Kit); none of it casts shadows.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Glow, canvasTex, rnd } from "./kit";
import { Kit, kitMat, srgbTex, mould, arcPts, cymaPts, lathe, flutedShaft, archPath, archRing, baluster } from "./bld_kit";
import { roomMat, lamMat, bake, cell, inRect, marble, drawPlaster, drawWeave, drawLandscape, drawSeascape, drawUS, drawBlueFlag, drawRunner, grain } from "./h_tex";

const G = 1.2;
export const HALL = { HX: 3.8, ZB: -8.6, ZF: -0.35, TOP: 5.45, VX: 1.6, VZ: 3.3, SX: 1.8, SZ: -14.5, VTOP: 5.08 };
const { HX, ZB, ZF, TOP, VX, VZ, SX, SZ, VTOP } = HALL;
const AR = 1.12, ASP = 3.45;                                   // the back arch: half width, spring
const COLX = 2.1, COLZ = [-2.6, -5.8];
const CH = [0, 3.95, -3.1];                                    // the chandelier's candle ring
const VL = [0, 4.62, 1.55];                                    // the vestibule lantern
const SL = [0, 4.85, -11.0];                                   // the stair lantern
const SCON = [-1.3, 1.3].map((x) => [x, 3.78, ZB + 0.14]);
const LAMPS = [
  { p: CH, I: 0.95, r: 2.4 }, { p: VL, I: 0.7, r: 1.6 }, { p: SL, I: 1.3, r: 2.2 },
  ...SCON.map((p) => ({ p, I: 0.35, r: 0.7 }))
];

// ── textures ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// the floor: 4 × 4 tiles of 0.8 u (1024 px = 3.2 u), white and navy marble; ALPHA lets the mirrored hall show through (more in the dark tiles)
const floorTex = () => srgbTex("h_floor", 1024, 1024, (c, w, h) => {
  const s = w / 4;
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) marble(c, k * s, r * s, s, s, (r + k) % 2 === 1, r * 4 + k + 1);
  c.fillStyle = "rgba(70,78,92,0.9)"; for (let i = 0; i <= 4; i++) { c.fillRect(i * s - 1.5, 0, 3, h); c.fillRect(0, i * s - 1.5, w, 3); }
  // (one mask drawn in a single destination-in pass: a per-tile destination-in fill would clear every other tile)
  const mk = document.createElement("canvas"); mk.width = w; mk.height = h; const m = mk.getContext("2d");
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { m.fillStyle = (r + k) % 2 ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.9)"; m.fillRect(k * s, r * s, s, s); }
  c.globalCompositeOperation = "destination-in"; c.drawImage(mk, 0, 0); c.globalCompositeOperation = "source-over";
});
const paintTex = () => srgbTex("h_plaster", 512, 512, drawPlaster("#7F98BC"));
const whiteTex = () => srgbTex("h_white", 512, 512, (c, w, h) => { c.fillStyle = "#F5F5F3"; c.fillRect(0, 0, w, h); grain(c, w, h, 8000, "120,126,140", 0.02, 0.06, 1.5, 4); for (let v = 0; v < 5; v++) { c.strokeStyle = "rgba(150,156,168,0.12)"; c.lineWidth = 1; c.beginPath(); let x = rnd(v) * w, y = 0; c.moveTo(x, y); while (y < h) { x += (rnd(v * 9 + y) - 0.5) * 40; y += 30; c.lineTo(x, y); } c.stroke(); } });
const weaveTex = () => srgbTex("h_weave", 256, 256, drawWeave);
// the atlas: two paintings, the two flags, the stair runner
const A = { W: 2048, H: 1024 };
const C_LAND = [0, 0, 1024, 640], C_SEA = [1024, 0, 1024, 640], C_US = [0, 640, 730, 384], C_BLUE = [730, 640, 640, 384], C_RUN = [1370, 640, 678, 384];
const atlasTex = () => canvasTex("h_hall_atlas", A.W, A.H, (c) => {
  drawLandscape(c, ...C_LAND, 2); drawSeascape(c, ...C_SEA, 6); drawUS(c, ...C_US); drawBlueFlag(c, ...C_BLUE); drawRunner(c, ...C_RUN, "#2D5294", "#D7B467");
});
const R = (r) => cell(A, r[0], r[1], r[2], r[3]);

// ── geometry ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const PL = new THREE.PlaneGeometry(1, 1);
/** a wall plane centred (x,y,z), size w × h, facing ry (0 = +z) */
const wall = (K, key, w, h, x, y, z, ry, opt) => K.add(key, PL, [x, y, z], [0, ry, 0], [w, h, 1], opt);
/** a rectangle of moulding (4 thin boxes) on a wall: in the wall's own frame (u across, v up), pushed out along its normal */
const frame = (K, key, u0, v0, u1, v1, t, d, place) => {
  [[u0, v0, u1, v0 + t], [u0, v1 - t, u1, v1], [u0, v0, u0 + t, v1], [u1 - t, v0, u1, v1]].forEach(([a, b, c2, e]) => place(key, c2 - a, e - b, d, (a + c2) / 2, (b + e) / 2));
};
/** a wall frame: place(key, w, h, d, u, v) for a wall at fixed coordinate */
const backPlacer = (K, z) => (key, w, h, d, u, v, opt) => K.box(key, w, h, d, u, v, z + d / 2, 0, opt);
const sidePlacer = (K, x, s) => (key, w, h, d, u, v, opt) => K.box(key, d, h, w, x + s * d / 2, v, u, 0, opt);   // s = +1: the left wall (faces +x)

const buildHall = () => {
  const K = new Kit();
  // parts added while NM is set go under "<key>~": drawn once, NOT mirrored under the floor (unseen in the reflection; saves vertices)
  let NM = false; const add0 = K.add.bind(K); K.add = (key, ...a) => add0(NM ? key + "~" : key, ...a);
  // ── shells: side walls, ceiling, the back wall pierced by the arch (0.4 thick: its reveal), the vestibule's inner faces ──────
  [-1, 1].forEach((s) => {
    wall(K, "hpaint", ZF - ZB, TOP - G, -s * HX, (G + TOP) / 2, (ZB + ZF) / 2, s * Math.PI / 2);                // s=1: the left wall (x −HX, facing +x)
    wall(K, "hpaint", VZ - ZF, VTOP - G, -s * VX, (G + VTOP) / 2, (ZF + VZ) / 2, s * Math.PI / 2);              // the vestibule
    wall(K, "hpaint", HX - VX, TOP - G, -s * (HX + VX) / 2, (G + TOP) / 2, ZF, Math.PI);                        // the hall's front wall (inside the face)
  });
  wall(K, "hpaint", VX * 2, TOP - VTOP, 0, (VTOP + TOP) / 2, ZF, Math.PI);
  {
    const sh = new THREE.Shape(); sh.moveTo(-HX, G); sh.lineTo(HX, G); sh.lineTo(HX, TOP); sh.lineTo(-HX, TOP); sh.closePath();
    sh.holes.push(archPath(new THREE.Path(), -AR, AR, G, ASP, true, 20));
    K.add("hpaint", new THREE.ExtrudeGeometry(sh, { depth: 0.4, bevelEnabled: false, curveSegments: 4 }), [0, 0, ZB - 0.4], [0, 0, 0], [1, 1, 1]);
  }
  NM = true;
  K.add("hpaint", PL, [0, TOP, (ZB + ZF) / 2], [Math.PI / 2, 0, 0], [HX * 2, ZF - ZB, 1]);
  K.box("hdark", HX * 2 + 0.2, 0.04, ZF - ZB + 0.2, 0, TOP + 0.03, (ZB + ZF) / 2);                                  // a dark lid (seen from the loggia windows' sill gaps)
  // the stair hall beyond: its side walls, back wall, ceiling
  [-1, 1].forEach((s) => wall(K, "hpaint", ZB - 0.4 - SZ, TOP + 1.6 - G, -s * SX, (G + TOP + 1.6) / 2, (ZB - 0.4 + SZ) / 2, s * Math.PI / 2));
  wall(K, "hpaint", SX * 2, TOP + 1.6 - G, 0, (G + TOP + 1.6) / 2, SZ, 0);
  K.add("hpaint", PL, [0, TOP + 1.6, (ZB - 0.4 + SZ) / 2], [Math.PI / 2, 0, 0], [SX * 2, ZB - 0.4 - SZ, 1]);
  NM = false;
  // the threshold under the arcade's centre arch and the face's reveal
  // (the threshold under the arcade's centre arch is the house's own trim: st_state_house)

  // ── the back wall: arch dressing, pilasters, dado, panels, the paintings, the sconces, the benches ─────────────────────────
  const bz = backPlacer(K, ZB);
  K.add("hwhite", archRing(AR, 0.2, 0.08, 22), [0, ASP, ZB], [0, 0, 0], [1, 1, 1]);
  K.box("hwhite", 0.34, 0.5, 0.14, 0, ASP + AR + 0.16, ZB + 0.07);                                  // keystone
  [-1, 1].forEach((s) => {
    K.box("hwhite", 0.2, ASP - G, 0.08, s * (AR + 0.1), (G + ASP) / 2, ZB + 0.04);                // the jambs' architrave
    K.box("hwhite", 0.34, 0.14, 0.14, s * (AR + 0.12), ASP - 0.02, ZB + 0.07);                     // imposts
  });
  const pil = (x, place, w = 0.36) => {
    place("hwhite", w + 0.08, 0.26, 0.12, x, G + 0.13); place("hwhite", w, TOP - 0.62 - G, 0.07, x, (G + TOP - 0.62) / 2 + 0.13);
    place("hwhite", w + 0.1, 0.12, 0.12, x, TOP - 0.42); place("hwhite", w + 0.16, 0.1, 0.15, x, TOP - 0.32);
  };
  [-3.58, -1.3, 1.3, 3.58].forEach((x) => pil(x, bz));
  // the dado: base, raised panels, chair rail; the tall panel above; per bay (the two bays beside the arch)
  const dado = (place, u0, u1, opt) => {
    place("hwhite", u1 - u0, 0.2, 0.05, (u0 + u1) / 2, G + 0.1, opt);
    place("hwhite", u1 - u0, 0.07, 0.07, (u0 + u1) / 2, G + 1.0, opt); place("hwhite", u1 - u0, 0.03, 0.09, (u0 + u1) / 2, G + 1.05, opt);
    const n = Math.max(1, Math.round((u1 - u0) / 1.0)), pw = (u1 - u0) / n;
    for (let i = 0; i < n; i++) frame(K, "hwhite", u0 + i * pw + 0.1, G + 0.32, u0 + (i + 1) * pw - 0.1, G + 0.86, 0.045, 0.025, (k, w, h, d, u, v) => place(k, w, h, d, u, v, opt));
  };
  [[-3.4, -1.48], [1.48, 3.4]].forEach(([a, b]) => { dado(bz, a, b); frame(K, "hwhite", a + 0.12, G + 1.28, b - 0.12, TOP - 0.78, 0.06, 0.03, bz); });
  // the paintings in gilt frames, the sconces either side of each, the benches under them
  [[-2.5, C_LAND], [2.5, C_SEA]].forEach(([x, r]) => {
    const pw = 1.12, ph = 0.7, y = 2.78;
    K.add("hart", inRect(PL, R(r)), [x, y, ZB + 0.045], [0, 0, 0], [pw, ph, 1], { keepUV: true });
    frame(K, "hbrass", x - pw / 2 - 0.1, y - ph / 2 - 0.1, x + pw / 2 + 0.1, y + ph / 2 + 0.1, 0.1, 0.06, bz);
    frame(K, "hbrass", x - pw / 2 - 0.02, y - ph / 2 - 0.02, x + pw / 2 + 0.02, y + ph / 2 + 0.02, 0.025, 0.075, bz);
    bench(K, x, ZB + 0.34);
  });
  SCON.forEach((p) => sconce(K, p));
  // ── side walls: pilasters as responds to the columns, dado and tall panels per bay; cornice all round ─────────────────
  [-1, 1].forEach((s) => {
    const sp = sidePlacer(K, -s * HX, s);
    const bays = [ZF - 0.05, ...COLZ.flatMap((z) => [z + 0.25, z - 0.25]), ZB + 0.05];
    COLZ.forEach((z) => pil(z, sp, 0.44));
    for (let i = 0; i < bays.length; i += 2) { const a = Math.min(bays[i], bays[i + 1]), b = Math.max(bays[i], bays[i + 1]); dado(sp, a, b); frame(K, "hwhite", a + 0.14, G + 1.28, b - 0.14, TOP - 0.78, 0.06, 0.03, sp); }
  });
  const cor = mould([[0, 0], [0.06, 0], [0.06, 0.08], ...cymaPts(0.06, 0.08, 0.28, 0.3, 5), [0.28, 0.36]], 1);
  K.add("hwhite", cor, [0, TOP - 0.36, ZB], [0, 0, 0], [HX * 2, 1, 1]);
  [-1, 1].forEach((s) => K.add("hwhite", cor, [-s * HX, TOP - 0.36, (ZB + ZF) / 2], [0, s * Math.PI / 2, 0], [ZF - ZB, 1, 1]));
  // the vestibule's walls: dado and one tall panel each side; the opening through the face dressed as a cased opening
  [-1, 1].forEach((s) => {
    const sp = sidePlacer(K, -s * VX, s);
    dado(sp, 0.15, VZ - 0.15); frame(K, "hwhite", 0.3, G + 1.28, VZ - 0.3, VTOP - 0.4, 0.06, 0.03, sp);
    K.box("hwhite", 0.3, VTOP - G, 0.1, -s * (VX + 0.15), (G + VTOP) / 2, ZF - 0.05);                   // the casing's legs (hall side)
  });
  K.box("hwhite", VX * 2 + 0.7, 0.3, 0.12, 0, VTOP + 0.15, ZF - 0.06);
  K.box("hwhite", VX * 2 + 0.9, 0.1, 0.18, 0, VTOP + 0.35, ZF - 0.09);

  // ── the Doric columns and the beams they carry ───────────────────────────────────────────────────────────────────────
  const S0 = G + 0.32, S1 = TOP - 0.68;
  const shaft = flutedShaft(0.27, 0.23, S1 - S0, 20, 2, 4);
  const base = lathe([[0.36, 0], [0.36, 0.05], ...arcPts(0.36, 0.05, 0.31, 0.15, true, 3), [0.29, 0.16], [0.28, 0.2]], 16);
  const cap = lathe([[0.23, 0], [0.25, 0.03], [0.25, 0.06], [0.23, 0.08], [0.26, 0.1], ...arcPts(0.26, 0.1, 0.34, 0.2, false, 3), [0.34, 0.22]], 16);
  COLZ.forEach((z) => [-1, 1].forEach((s) => {
    const x = s * COLX;
    K.box("hwhite", 0.76, 0.12, 0.76, x, G + 0.06, z);
    K.add("hwhite", base, [x, G + 0.12, z], [0, 0, 0], [1, 1, 1]);
    K.add("hwhite", shaft, [x, (S0 + S1) / 2, z], [0, 0, 0], [1, 1, 1]);
    K.add("hwhite", cap, [x, S1, z], [0, 0, 0], [1, 1, 1]);
    K.box("hwhite", 0.76, 0.12, 0.76, x, S1 + 0.28, z);
  }));
  NM = true;
  [-1, 1].forEach((s) => { K.box("hwhite", 0.62, TOP - S1 - 0.34, ZF - ZB, s * COLX, (S1 + 0.34 + TOP) / 2, (ZB + ZF) / 2); K.box("hwhite", 0.7, 0.06, ZF - ZB, s * COLX, S1 + 0.37, (ZB + ZF) / 2); });

  // ── the staircase beyond the arch ───────────────────────────────────────────────────────────────────────────────────
  const N = 11, RISE = 0.26, RUN = 0.38, Z0 = ZB - 0.4 - 0.75, SW = 2.5;
  for (let i = 0; i < N; i++) {
    const top = G + (i + 1) * RISE, z1 = Z0 - i * RUN;
    K.box("hwhite", SW, top - G, RUN, 0, (G + top) / 2, z1 - RUN / 2);
    K.box("hwhite", SW + 0.04, 0.04, 0.05, 0, top - 0.02, z1 + 0.01);                                  // the nosing
    K.add("hart", inRect(PL, R(C_RUN)), [0, top + 0.006, z1 - RUN / 2], [-Math.PI / 2, 0, 0], [1.3, RUN, 1], { keepUV: true });
    K.add("hart", inRect(PL, R(C_RUN)), [0, top - RISE / 2, z1 + 0.003], [0, 0, 0], [1.3, RISE, 1], { keepUV: true });
    K.box("hbrass", 1.36, 0.018, 0.018, 0, top - RISE + 0.012, z1 + 0.015);                              // the stair rods
  }
  const ZL = Z0 - N * RUN, YL = G + N * RISE;
  K.box("hwhite", SX * 2, YL - G, ZL - SZ, 0, (G + YL) / 2, (ZL + SZ) / 2);
  K.add("hart", inRect(PL, R(C_RUN)), [0, YL + 0.006, (ZL + SZ) / 2], [-Math.PI / 2, 0, 0], [1.3, ZL - SZ, 1], { keepUV: true });
  // the balustrades, the newels, the handrails
  const bal = baluster(0.72, 0.045, 6);
  [-1, 1].forEach((s) => {
    const x = s * (SW / 2 - 0.08);
    for (let i = 0; i < N; i++) K.add("hwhite", bal, [x, G + (i + 1) * RISE, Z0 - (i + 0.5) * RUN], [0, 0, 0], [1, 1, 1]);
    K.box("hwhite", 0.2, 1.15, 0.2, x, G + 0.575, Z0 + 0.12); K.box("hwhite", 0.26, 0.08, 0.26, x, G + 1.19, Z0 + 0.12);
    K.add("hbrass", new THREE.SphereGeometry(0.07, 10, 8), [x, G + 1.28, Z0 + 0.12], [0, 0, 0], [1, 1, 1]);
    const y0 = G + RISE + 0.72, y1 = YL + 0.72, L = Math.hypot(Z0 - ZL, y1 - y0);
    K.box("hwood", 0.09, 0.07, L, x, (y0 + y1) / 2 + 0.03, (Z0 + ZL) / 2, 0, { m: new THREE.Matrix4().compose(new THREE.Vector3(x, (y0 + y1) / 2 + 0.03, (Z0 + ZL) / 2), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.atan2(y1 - y0, Z0 - ZL), 0, 0)), new THREE.Vector3(0.09, 0.07, L)) });
  });
  // the stair hall's dado and the lantern over the stair
  frame(K, "hwhite", -1.2, YL + 0.5, 1.2, YL + 2.4, 0.07, 0.03, backPlacer(K, SZ));
  lantern(K, SL, 0.55, TOP + 1.6);
  // the tall arched window on the landing (night outside: blue glass, white glazing bars)
  {
    const wy = YL + 0.3, wsp = YL + 2.2, wr = 0.85;
    K.add("hnight", new THREE.ShapeGeometry(archPath(new THREE.Shape(), -wr, wr, wy, wsp, true, 16)), [0, 0, SZ + 0.02], [0, 0, 0], [1, 1, 1]);
    K.add("hwhite", archRing(wr, 0.14, 0.08, 18), [0, wsp, SZ], [0, 0, 0], [1, 1, 1]);
    [-1, 1].forEach((s) => K.box("hwhite", 0.14, wsp - wy, 0.08, s * (wr + 0.07), (wy + wsp) / 2, SZ + 0.04));
    K.box("hwhite", wr * 2 + 0.4, 0.1, 0.16, 0, wy - 0.05, SZ + 0.08);
    [-0.42, 0, 0.42].forEach((x) => K.box("hwhite", 0.035, wsp - wy + (x ? 0.7 : wr), 0.04, x, (wy + wsp + (x ? 0.7 : wr)) / 2, SZ + 0.04));
    for (let y = wy + 0.45; y < wsp + 0.6; y += 0.45) K.box("hwhite", wr * 2, 0.035, 0.04, 0, y, SZ + 0.04);
  }
  NM = false;
  // brass rope stanchions marking the walkway from the door, navy velvet ropes sagging between them
  [-1, 1].forEach((s) => {
    const zs = [-0.7, -2.2], x = s * 0.88;
    zs.forEach((z) => {
      K.add("hbrass", lathe([[0.13, 0], [0.13, 0.02], [0.06, 0.05], [0.025, 0.1], [0.02, 0.86], [0.04, 0.88], [0.05, 0.94], [0.0001, 0.98]], 14), [x, G, z], [0, 0, 0], [1, 1, 1]);
      K.add("hbrass", new THREE.SphereGeometry(0.045, 10, 8), [x, G + 1.0, z], [0, 0, 0], [1, 1, 1]);
    });
    const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector3(x, G + 0.88 - 0.22 * Math.sin(Math.PI * t), zs[0] + (zs[1] - zs[0]) * t)); }
    K.add("hnavy", new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.022, 6), [0, 0, 0], [0, 0, 0], [1, 1, 1]);
  });

  NM = false;
  // ── the chandelier, the vestibule lantern ───────────────────────────────────────────────────────────────────────────
  chandelier(K, CH, TOP);
  // ── the flags on their poles, standing beside the rear columns ───────────────────────────────────────────────────────
  flag(K, -1.82, ZB + 0.55, -1, R(C_US));
  flag(K, 1.82, ZB + 0.55, 1, R(C_BLUE));
  return K;
};
// a Federal bench: walnut frame, turned legs, a navy squab, a spindle back, scrolled arms
function bench(K, x, z) {
  const L = 1.34, y = G;
  K.box("hnavy", L - 0.1, 0.11, 0.4, x, y + 0.5, z);
  K.box("hwood", L, 0.08, 0.44, x, y + 0.42, z);
  const leg = lathe([[0.035, 0], [0.045, 0.06], [0.03, 0.18], [0.04, 0.3], [0.045, 0.38], [0.0001, 0.38]], 10);
  [-1, 1].forEach((s) => [-1, 1].forEach((q) => K.add("hwood", leg, [x + s * (L / 2 - 0.06), y, z + q * 0.17], [0, 0, 0], [1, 1, 1])));
  K.add("hwood", leg, [x, y, z - 0.17], [0, 0, 0], [1, 1, 1]);
  K.box("hwood", L, 0.07, 0.05, x, y + 0.98, z - 0.2); K.box("hwood", L, 0.04, 0.04, x, y + 0.62, z - 0.2);
  for (let i = 0; i < 9; i++) K.box("hwood", 0.03, 0.34, 0.025, x - L / 2 + 0.12 + i * (L - 0.24) / 8, y + 0.8, z - 0.2);
  [-1, 1].forEach((s) => { K.box("hwood", 0.05, 0.3, 0.05, x + s * (L / 2 - 0.03), y + 0.62, z + 0.17); K.add("hwood", new THREE.TorusGeometry(0.07, 0.025, 6, 12, Math.PI * 1.3), [x + s * (L / 2 - 0.03), y + 0.76, z + 0.05], [0, Math.PI / 2, 0], [1, 1, 1.7]); });
}
// a two-light brass sconce: backplate, two scrolled arms, candle cups, sleeves, flame bulbs, small shades (self-lit)
function sconce(K, p) {
  const [x, y, z] = p, zb = z - 0.07;
  K.add("hbrass", lathe([[0.09, 0], [0.11, 0.02], [0.08, 0.04], [0.0001, 0.05]], 14), [x, y, zb + 0.005], [Math.PI / 2, 0, 0], [1, 1, 1.6]);
  [-1, 1].forEach((s) => {
    const pts = [new THREE.Vector3(x, y - 0.05, zb + 0.04), new THREE.Vector3(x + s * 0.08, y - 0.12, zb + 0.12), new THREE.Vector3(x + s * 0.17, y - 0.06, zb + 0.18), new THREE.Vector3(x + s * 0.19, y + 0.02, zb + 0.18)];
    K.add("hbrass", new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.012, 5), [0, 0, 0], [0, 0, 0], [1, 1, 1]);
    K.add("hbrass", lathe([[0.025, 0], [0.045, 0.03], [0.04, 0.04]], 10), [x + s * 0.19, y + 0.02, zb + 0.18], [0, 0, 0], [1, 1, 1]);
    K.add("hwhite", new THREE.CylinderGeometry(0.016, 0.016, 0.1, 8), [x + s * 0.19, y + 0.09, zb + 0.18], [0, 0, 0], [1, 1, 1]);
    K.add("hshade", new THREE.CylinderGeometry(0.05, 0.08, 0.1, 14, 1, true), [x + s * 0.19, y + 0.17, zb + 0.18], [0, 0, 0], [1, 1, 1], { tag: 9 });
  });
}
// a brass chandelier: ceiling rose and chain, the centre baluster, a lower ring of 8 candle arms, an upper ring of 6, a finial
function chandelier(K, c, top) {
  const [x, y, z] = c;
  K.add("hbrass", lathe([[0.22, 0], [0.18, 0.04], [0.06, 0.08], [0.0001, 0.08]], 18), [x, top, z], [Math.PI, 0, 0], [1, 1, 1]);
  for (let i = 0; i < 9; i++) K.add("hbrass", new THREE.TorusGeometry(0.045, 0.012, 5, 10), [x, top - 0.1 - i * 0.075, z], [0, (i % 2) * Math.PI / 2, 0], [1, 1, 1]);
  const yTop = top - 0.78;
  K.add("hbrass", lathe([[0.03, 0], [0.09, 0.05], [0.13, 0.16], [0.1, 0.28], [0.05, 0.36], [0.07, 0.46], [0.05, 0.56], [0.12, 0.66], [0.04, 0.74], [0.025, yTop - y + 0.3]], 18), [x, y - 0.3, z], [0, 0, 0], [1, 1, 1]);
  K.add("hbrass", new THREE.SphereGeometry(0.07, 10, 8), [x, y - 0.36, z], [0, 0, 0], [1, 1, 1]);
  K.add("hbrass", new THREE.ConeGeometry(0.04, 0.12, 10), [x, y - 0.46, z], [Math.PI, 0, 0], [1, 1, 1]);
  const tier = (n, R, yy, rise, rr, ph) => {
    for (let k = 0; k < n; k++) {
      const a = ph + (k / n) * Math.PI * 2, cx = Math.sin(a), cz = Math.cos(a);
      const pts = [new THREE.Vector3(x + cx * 0.08, yy, z + cz * 0.08), new THREE.Vector3(x + cx * R * 0.5, yy - 0.12, z + cz * R * 0.5), new THREE.Vector3(x + cx * R * 0.92, yy - 0.04, z + cz * R * 0.92), new THREE.Vector3(x + cx * R, yy + rise, z + cz * R)];
      K.add("hbrass", new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, rr, 5), [0, 0, 0], [0, 0, 0], [1, 1, 1]);
      const px = x + cx * R, pz = z + cz * R, py = yy + rise;
      K.add("hbrass", lathe([[0.03, 0], [0.06, 0.03], [0.055, 0.045]], 10), [px, py, pz], [0, 0, 0], [1, 1, 1]);
      K.add("hwhite", new THREE.CylinderGeometry(0.019, 0.019, 0.13, 8), [px, py + 0.11, pz], [0, 0, 0], [1, 1, 1]);
      K.add("hbulb", lathe([[0.0001, 0], [0.022, 0.03], [0.018, 0.06], [0.0001, 0.1]], 8), [px, py + 0.175, pz], [0, 0, 0], [1, 1, 1], { tag: 9 });
    }
  };
  tier(8, 0.66, y - 0.05, 0.1, 0.016, 0);
  tier(6, 0.36, y + 0.32, 0.08, 0.012, Math.PI / 6);
  K.add("hbrass", new THREE.TorusGeometry(0.5, 0.012, 5, 40), [x, y - 0.11, z], [Math.PI / 2, 0, 0], [1, 1, 1]);
}
// a hexagonal brass hall lantern hanging on a rod: glass panes lit from within, a cap and a finial
function lantern(K, c, s, top) {
  const [x, y, z] = c, h = 0.75 * s, r = 0.32 * s;
  K.add("hbrass", new THREE.CylinderGeometry(0.012, 0.012, top - (y + h / 2), 6), [x, (top + y + h / 2) / 2, z], [0, 0, 0], [1, 1, 1]);
  K.add("hglass", new THREE.CylinderGeometry(r, r * 0.85, h, 6, 1, true), [x, y, z], [0, 0, 0], [1, 1, 1], { tag: 9 });
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; K.add("hbrass", new THREE.BoxGeometry(0.02, h + 0.02, 0.02), [x + Math.sin(a) * r * 0.93, y, z + Math.cos(a) * r * 0.93], [0, a, 0], [1, 1, 1]); }
  K.add("hbrass", new THREE.CylinderGeometry(r * 0.2, r * 1.1, 0.18 * s, 6), [x, y + h / 2 + 0.09 * s, z], [0, 0, 0], [1, 1, 1]);
  K.add("hbrass", new THREE.CylinderGeometry(r * 0.95, r * 0.5, 0.12 * s, 6), [x, y - h / 2 - 0.06 * s, z], [0, 0, 0], [1, 1, 1]);
  K.add("hbrass", new THREE.SphereGeometry(0.05 * s, 8, 6), [x, y - h / 2 - 0.16 * s, z], [0, 0, 0], [1, 1, 1]);
}
// a flag on a brass pole in a weighted stand; the cloth drapes from the pole toward `dir` in soft folds
function flag(K, x, z, dir, rect) {
  const PT = 4.95;
  K.add("hbrass", lathe([[0.2, 0], [0.2, 0.03], [0.12, 0.06], [0.05, 0.14], [0.03, 0.3]], 16), [x, G, z], [0, 0, 0], [1, 1, 1]);
  K.add("hbrass", new THREE.CylinderGeometry(0.022, 0.026, PT - G, 8), [x, (G + PT) / 2, z], [0, 0, 0], [1, 1, 1]);
  K.add("hbrass", new THREE.SphereGeometry(0.05, 10, 8), [x, PT + 0.03, z], [0, 0, 0], [1, 1, 1]);
  K.add("hbrass", new THREE.ConeGeometry(0.04, 0.2, 8), [x, PT + 0.17, z], [0, 0, 0], [1, 1, 1]);
  const FW = 1.25, FH = 0.78, NX = 22, NY = 10, g = new THREE.PlaneGeometry(1, 1, NX, NY), P = g.attributes.position, U = g.attributes.uv;
  for (let i = 0; i < P.count; i++) {
    const u = U.getX(i), v = U.getY(i);
    const drop = 0.62 * Math.pow(u, 1.5) * (0.35 + 0.65 * v);                 // the fly sags; the top edge more than the foot
    const X = dir * (0.03 + u * FW * (1 - 0.18 * u)), Y = PT - 0.12 - FH + v * FH - drop;
    const Z = 0.09 * Math.sin(u * 10.5 + v * 0.8) * Math.pow(u, 0.7) + 0.03 * Math.sin(v * 7 + u * 3);
    P.setXYZ(i, X, Y, Z);
    U.setXY(i, rect[0] + u * (rect[2] - rect[0]), rect[1] + v * (rect[3] - rect[1]));
  }
  g.computeVertexNormals();
  K.add("hflag", g, [x, 0, z], [0, 0, 0], [1, 1, 1], { keepUV: true });
  K.add("hbrass", new THREE.TorusGeometry(0.035, 0.008, 4, 8), [x, PT - 0.25, z], [Math.PI / 2, 0, 0], [1, 1, 1]);   // the cord's ring
  K.add("hbrass", lathe([[0.0001, 0], [0.03, 0.03], [0.022, 0.12], [0.0001, 0.14]], 8), [x + dir * 0.06, PT - 0.75, z + 0.04], [0, 0, 0], [1, 1, 1]);   // a tassel
}

const fx = bake(LAMPS, { amb: 0.2, floorY: G, aoH: 0.55, ceilY: TOP });
const WARM = new THREE.Color("#FFDDB8");
const useHall = () => useMemo(() => {
  const UVS = { hpaint: 0.45, hwhite: 0.6, hwood: 1.0, hnavy: 1.2, hbrass: 0.5, floorO: 1 / 3.2 };
  for (const k of Object.keys(UVS)) UVS[k + "~"] = UVS[k];
  const K = buildHall();
  K.add("floorO~", PL, [0, G, (SZ + ZB) / 2], [-Math.PI / 2, 0, 0], [SX * 2, ZB - SZ, 1]);   // the stair hall's floor: opaque (nothing mirrored under it)
  const parts = K.build(fx, UVS);
  const FK = new Kit();
  FK.add("floor", PL, [0, G, (ZF + VZ) / 2], [-Math.PI / 2, 0, 0], [VX * 2, VZ - ZF, 1]);
  FK.add("floor", PL, [0, G, (ZB + ZF) / 2], [-Math.PI / 2, 0, 0], [HX * 2, ZF - ZB, 1]);
  const fparts = FK.build(fx, { floor: 1 / 3.2 });
  const atlas = atlasTex(); atlas.anisotropy = 2;
  const mats = {
    hpaint: lamMat({ map: paintTex(), color: "#FFFFFF", roughness: 0.86, glow: WARM, envMapIntensity: 0.12 }),
    hwhite: lamMat({ map: whiteTex(), color: "#FFFFFF", roughness: 0.42, glow: WARM, envMapIntensity: 0.22 }),
    hwood: roomMat({ color: "#3C2418", roughness: 0.32, metalness: 0.05, glow: WARM, envMapIntensity: 0.3 }),
    hnavy: lamMat({ map: weaveTex(), color: "#2A4C86", roughness: 0.85, glow: WARM, envMapIntensity: 0.1 }),
    hbrass: roomMat({ color: "#E2BE72", roughness: 0.26, metalness: 0.88, envMapIntensity: 1.6, glow: WARM, glowI: 0.6 }),
    hart: lamMat({ map: atlas, color: "#FFFFFF", roughness: 0.55, glow: WARM, envMapIntensity: 0.15 }),
    hflag: lamMat({ map: atlas, color: "#FFFFFF", roughness: 0.75, glow: WARM, envMapIntensity: 0.1 }),
    hdark: lamMat({ color: "#0C121C", roughness: 0.9 }),
    hnight: roomMat({ color: "#22406E", emissive: "#163A70", emissiveIntensity: 0.5, roughness: 0.08, metalness: 0.4, envMapIntensity: 1.4 }),
    hbulb: roomMat({ color: "#FFF6E4", emissive: "#FFE9C4", emissiveIntensity: 2.4, roughness: 0.4 }),
    hshade: roomMat({ color: "#FFF2DC", emissive: "#FFD9A0", emissiveIntensity: 1.3, roughness: 0.8 }),
    hglass: roomMat({ color: "#FFF0D6", emissive: "#FFD493", emissiveIntensity: 1.5, roughness: 0.2 }),
    floor: roomMat({ map: floorTex(), color: "#FFFFFF", roughness: 0.14, metalness: 0.05, envMapIntensity: 0.45, glow: WARM, transparent: true }),
    floorO: lamMat({ map: floorTex(), color: "#FFFFFF", roughness: 0.14, metalness: 0.05, envMapIntensity: 0.45, glow: WARM })
  };
  const mk = ({ key, geometry }) => { const m = new THREE.Mesh(geometry, mats[key.replace("~", "")]); m.castShadow = false; m.receiveShadow = false; m.renderOrder = key.startsWith("hpaint") ? 1 : 0; return m; };
  const meshes = parts.map(mk), mirror = parts.filter((p) => !p.key.endsWith("~")).map(mk), floor = fparts.map(mk);
  return { meshes, mirror, floor, mats };
}, []);

const GLOWS = (() => {
  const out = [];
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; out.push([CH[0] + Math.sin(a) * 0.66, CH[1] + 0.22, CH[2] + Math.cos(a) * 0.66, 0.5]); }
  for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + (k / 6) * Math.PI * 2; out.push([CH[0] + Math.sin(a) * 0.36, CH[1] + 0.57, CH[2] + Math.cos(a) * 0.36, 0.4]); }
  SCON.forEach(([x, y, z]) => [-1, 1].forEach((s) => out.push([x + s * 0.19, y + 0.17, z + 0.11, 0.55])));
  return out;
})();

/** The hall. `door` 0..1: the light rises as the money arrives. */
export const StateHall = ({ door = 0 }) => {
  const { meshes, mirror, floor, mats } = useHall();
  const m = 0.78 + 0.6 * door;
  for (const k of ["hpaint", "hwhite", "hwood", "hnavy", "hart", "hflag", "floor"]) mats[k].userData.uGlow.value.copy(WARM).multiplyScalar(m);
  mats.hbrass.userData.uGlow.value.copy(WARM).multiplyScalar(0.6 * m);
  mats.hbulb.emissiveIntensity = 1.6 + 1.6 * door; mats.hshade.emissiveIntensity = 0.9 + 0.8 * door; mats.hglass.emissiveIntensity = 1.0 + 1.0 * door;
  const go = 0.45 + 0.4 * door;
  const glows = (mir) => (
    <>
      {GLOWS.map(([x, y, z, s], i) => <Glow key={i} position={[x, mir ? 2 * G - y : y, z]} size={s} color="#FFE1B0" opacity={(mir ? 0.35 : 0.8) * go} />)}
      <Glow position={[CH[0], mir ? 2 * G - CH[1] - 0.2 : CH[1] + 0.2, CH[2]]} size={2.2} color="#FFD69A" opacity={(mir ? 0.12 : 0.26) * go} />
      <Glow position={[SL[0], mir ? 2 * G - SL[1] : SL[1], SL[2]]} size={2.0} color="#FFD69A" opacity={(mir ? 0.25 : 0.55) * go} />
    </>
  );
  return (
    <group>
      {meshes.map((o, i) => <primitive key={i} object={o} />)}
      {/* the reflection: the same hall mirrored under the floor (it sits in a pit cut out of the terrace), seen through the glossy marble */}
      <group position={[0, 2 * G, 0]} scale={[1, -1, 1]}>{mirror.map((o, i) => <primitive key={i} object={o} />)}</group>
      {floor.map((o, i) => <primitive key={i} object={o} />)}
      {glows(false)}
      {glows(true)}
    </group>
  );
};
