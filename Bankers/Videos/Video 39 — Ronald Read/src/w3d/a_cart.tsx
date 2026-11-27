// @ts-nocheck
// ★ V39 builder A — THE JANITOR'S CART (the hero of the store set; used by hook and line): a grey moulded utility cart (8-inch rear
//   wheels, swivel casters, a deep deck, two shelves, a top tray, a push handle), the round grey trash bin with its black liner on the
//   front deck, the yellow mop bucket with a side-press wringer and a wet mop, a corn broom in its clips, a lobby dustpan on its hook,
//   three trigger spray bottles with real labels, towel and tissue rolls, a gallon of floor cleaner, blue gloves, microfibre cloths,
//   and the folded yellow CAUTION — WET FLOOR sign leaning on the cart. Everything stands or leans ON something (floor y = 0).
//
//   THE REVEAL (CLAUDE.md 3-D World §B5): xray 0 → 1 turns the bin's shell into clear pale-blue glass with a white fresnel rim (the
//   liner thins away), flash peaks the rim; glow 0 → 1 lights the tall stack of share certificates inside (cream paper, engraved
//   borders) in the Bankers light blue.
//   Local frame: the cart's length along x (+x = the bin end), width z, y up.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Mesher, Lm } from "./town_parts";
import { Glow, rnd, clamp01 } from "./kit";
import { labelTex, labelCell, wetTex, miscTex, miscCell, linerTex, certTopTex, certTex2, rep } from "./a_tex";

// ── geometry helpers (cached, unit-sized) ────────────────────────────────────────────────────────────────────────────────
const GC = {};
/** a box whose top face is scaled (tx, tz): a frustum (broom head, bucket) */
export const gTaper = (tx, tz) => GC[`t${tx}_${tz}`] ??= (() => { const g = new THREE.BoxGeometry(1, 1, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) { p.setX(i, p.getX(i) * tx); p.setZ(i, p.getZ(i) * tz); } g.computeVertexNormals(); return g; })();
const lathe = (key, pts, seg = 24) => GC[key] ??= new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(1e-4, r), y)), seg);
const torus = (key, R, r, seg = 32) => GC[key] ??= new THREE.TorusGeometry(R, r, 8, seg);
/** a rounded-rectangle ring extruded upward: outer w × d, wall t, radius rad, height h (the mop bucket's walls) */
const gRing = (key, w, d, t, rad, h) => GC[key] ??= (() => {
  const rr = (s, W, D, R) => { const x = -W / 2, y = -D / 2; s.moveTo(x + R, y); s.lineTo(x + W - R, y); s.quadraticCurveTo(x + W, y, x + W, y + R); s.lineTo(x + W, y + D - R); s.quadraticCurveTo(x + W, y + D, x + W - R, y + D); s.lineTo(x + R, y + D); s.quadraticCurveTo(x, y + D, x, y + D - R); s.lineTo(x, y + R); s.quadraticCurveTo(x, y, x + R, y); };
  const s = new THREE.Shape(); rr(s, w, d, rad);
  if (t > 0) { const hole = new THREE.Path(); rr(hole, w - 2 * t, d - 2 * t, Math.max(0.005, rad - t)); s.holes.push(hole); }
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 6 });
  g.rotateX(-Math.PI / 2); return g;
})();

// ── materials ────────────────────────────────────────────────────────────────────────────────────────────────────────────
let CM = null;
const cartMats = () => {
  if (CM) return CM;
  const S = (o) => new THREE.MeshStandardMaterial({ vertexColors: true, envMapIntensity: 0.25, ...o });
  const lab = labelTex(), wet = wetTex(), misc = miscTex();
  CM = {
    plastic: S({ roughness: 0.58, metalness: 0.02, envMapIntensity: 0.3 }),          // the cart's moulded grey polyethylene
    metal: S({ roughness: 0.28, metalness: 0.85, envMapIntensity: 0.9 }),
    rubber: S({ roughness: 0.85, metalness: 0 }),
    yellow: S({ roughness: 0.42, metalness: 0.02, envMapIntensity: 0.6 }),
    straw: S({ roughness: 0.95, metalness: 0 }),
    yarn: S({ roughness: 1, metalness: 0 }),
    paper: S({ roughness: 0.9, metalness: 0 }),
    label: S({ map: lab, roughness: 0.4 }),
    wet: S({ map: wet, roughness: 0.45 }),
    misc: S({ map: misc, roughness: 0.5 }),
    bottle: new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.12, metalness: 0, transparent: true, opacity: 0.62, envMapIntensity: 1.2, clearcoat: 0.6 }),
    water: S({ roughness: 0.05, metalness: 0.2, envMapIntensity: 1.2 }),
    cloth: S({ roughness: 0.95 })
  };
  CM.bottle.userData = { cast: false };
  return CM;
};

// ── dimensions (the real cart: ~46 × 22 in, 38 in tall; a 20-gallon round bin; a 35-quart bucket) ───────────────────────────
export const DECK = { x0: -0.58, x1: 0.6, z: 0.28, y0: 0.13, y1: 0.21 };
export const BIN = { x: 0.32, z: 0, y0: DECK.y1, h: 0.68, rTop: 0.245, rBot: 0.215 };
export const BIN_TOP = BIN.y0 + BIN.h;                               // the rim (0.89)
export const STACK = { n: 190, t: 0.0031, w: 0.3, d: 0.2, y0: BIN.y0 + 0.025 };
export const STACK_TOP = STACK.y0 + STACK.n * STACK.t;               // ≈ 0.76
export const BUCKET = { x: -0.32, z: 0.66, ry: 0.12 };
const GREY = "#646B74", GREY_D = "#4A5058";

const buildCart = (m) => {
  // ── the deck: a deep moulded tub (floor, lip), the front bumper ──
  m.box("plastic", [(DECK.x0 + DECK.x1) / 2, (DECK.y0 + DECK.y1) / 2, 0], [DECK.x1 - DECK.x0, DECK.y1 - DECK.y0, DECK.z * 2], GREY);
  for (const s of [-1, 1]) m.box("plastic", [(0.02 + DECK.x1) / 2, DECK.y1 + 0.03, s * (DECK.z - 0.015)], [DECK.x1 - 0.02, 0.06, 0.03], GREY);
  m.box("plastic", [DECK.x1 - 0.015, DECK.y1 + 0.03, 0], [0.03, 0.06, DECK.z * 2], GREY);
  m.box("rubber", [DECK.x1 + 0.012, (DECK.y0 + DECK.y1) / 2, 0], [0.024, 0.07, DECK.z * 2 - 0.04], "#1A1D22");   // the bumper
  for (let k = 0; k < 6; k++) m.box("plastic", [DECK.x0 + 0.1 + k * 0.19, DECK.y0 - 0.006, 0], [0.03, 0.012, DECK.z * 2 - 0.06], GREY_D);   // the ribs under the deck
  // ── the rear wheels (8 in, on an axle) and the front swivel casters (4 in) ──
  for (const s of [-1, 1]) {
    m.cyl("rubber", [-0.46, 0.1, s * 0.305], 0.1, 0.045, "#16191D", { r: [Math.PI / 2, 0, 0], seg: 22 });
    m.cyl("plastic", [-0.46, 0.1, s * 0.33], 0.055, 0.008, GREY_D, { r: [Math.PI / 2, 0, 0], seg: 16 });
    m.cyl("metal", [-0.46, 0.1, s * 0.336], 0.018, 0.006, "#C9D1DA", { r: [Math.PI / 2, 0, 0], seg: 10 });
    m.box("plastic", [-0.46, 0.15, s * 0.27], [0.12, 0.08, 0.03], GREY_D);
    // the swivel caster: top plate, the swivel race, fork legs, the wheel
    m.box("metal", [0.47, DECK.y0 - 0.008, s * 0.2], [0.09, 0.008, 0.08], "#9AA4B0");
    m.cyl("metal", [0.47, DECK.y0 - 0.02, s * 0.2], 0.03, 0.016, "#7E8894", { seg: 14 });
    for (const q of [-1, 1]) m.box("metal", [0.485, 0.075, s * 0.2 + q * 0.021], [0.05, 0.085, 0.006], "#8A95A2");
    m.cyl("rubber", [0.5, 0.05, s * 0.2], 0.05, 0.03, "#16191D", { r: [Math.PI / 2, 0, 0], seg: 18 });
    m.cyl("metal", [0.5, 0.05, s * 0.2], 0.012, 0.046, "#C9D1DA", { r: [Math.PI / 2, 0, 0], seg: 8 });
  }
  // ── the body over the rear half: side panels with moulded hand-holds, the mid shelf, the top tray, the push handle ──
  const bx0 = DECK.x0, bx1 = 0.02, bxc = (bx0 + bx1) / 2, bl = bx1 - bx0;
  for (const s of [-1, 1]) {
    m.box("plastic", [bxc, 0.59, s * 0.265], [bl, 0.76, 0.03], GREY);
    m.box("plastic", [bxc, 0.59, s * 0.283], [bl - 0.06, 0.7, 0.006], "#6C737C");     // the raised panel face
    m.box("plastic", [bx1 - 0.08, 0.86, s * 0.288], [0.12, 0.035, 0.008], GREY_D);    // a moulded hand-hold
    m.box("plastic", [bxc, 0.22, s * 0.265], [bl, 0.03, 0.035], GREY_D);
  }
  m.quad("misc", [bxc + 0.05, 0.42, 0.2865], 0.36, 0.18, "#FFFFFF", miscCell(0));   // the moulded rating plate on the +z panel
  m.box("plastic", [bxc, 0.58, 0], [bl - 0.02, 0.035, 0.5], GREY);                  // the mid shelf
  m.box("plastic", [bxc, 0.598, 0.0], [bl - 0.06, 0.004, 0.44], "#5C626A");
  m.box("plastic", [bxc, 0.965, 0], [bl, 0.035, 0.56], GREY);                       // the top tray, its lips and a divider
  for (const s of [-1, 1]) m.box("plastic", [bxc, 1.005, s * 0.27], [bl, 0.05, 0.02], GREY);
  m.box("plastic", [bx0 + 0.01, 1.005, 0], [0.02, 0.05, 0.56], GREY); m.box("plastic", [bx1 - 0.01, 1.005, 0], [0.02, 0.05, 0.56], GREY);
  m.box("plastic", [bxc + 0.05, 1.0, 0.04], [0.012, 0.04, 0.44], GREY_D);
  m.box("plastic", [bx1 - 0.005, 0.59, 0], [0.02, 0.76, 0.5], GREY_D);             // the front panel the bin rests against
  // the push handle: two moulded uprights and a grip bar across the back
  for (const s of [-1, 1]) m.box("plastic", [bx0 - 0.04, 0.97, s * 0.24], [0.08, 0.08, 0.05], GREY);
  m.cyl("plastic", [bx0 - 0.075, 1.0, 0], 0.024, 0.52, GREY_D, { r: [Math.PI / 2, 0, 0], seg: 14 });
  // ── on the tray: three trigger spray bottles (labels), a pair of blue gloves over the lip, a stack of microfibre cloths ──
  const bottle = (x, z, k, tint) => {
    m.push([x, 0.983, z], rnd(k + 40) * 0.6 - 0.3);
    m.add("bottle", lathe("bottle", [[0.0, 0], [0.036, 0.0], [0.041, 0.012], [0.042, 0.15], [0.036, 0.185], [0.017, 0.205], [0.016, 0.225], [0.0, 0.225]], 20), Lm([0, 0, 0]), tint);
    m.add("label", GC.lab ??= new THREE.CylinderGeometry(1, 1, 1, 20, 1, true), Lm([0, 0.09, 0], [0.0432, 0.095, 0.0432]), "#FFFFFF", { rect: labelCell(k) });
    m.cyl("plastic", [0, 0.233, 0], 0.019, 0.02, "#EDEFF2", { seg: 14 });          // the cap ring
    m.box("plastic", [0.012, 0.268, 0], [0.07, 0.05, 0.032], ["#1F5FB4", "#EDEFF2", "#2A2F38"][k]);   // the sprayer head
    m.box("plastic", [0.052, 0.276, 0], [0.024, 0.018, 0.018], "#2A2F38");           // the nozzle
    m.box("plastic", [0.028, 0.226, 0], [0.012, 0.05, 0.02], ["#1F5FB4", "#EDEFF2", "#2A2F38"][k], { r: [0, 0, 0.35] });   // the trigger
    m.pop();
  };
  bottle(-0.47, -0.14, 0, "#5FA8F0"); bottle(-0.36, -0.17, 1, "#9EE0D6"); bottle(-0.25, -0.12, 2, "#C9D8EE");
  for (let k = 0; k < 4; k++) m.box("cloth", [-0.13, 1.0 + k * 0.014, -0.15], [0.16, 0.013, 0.15], k % 2 ? "#3F7FD0" : "#2F68B8", { ry: k * 0.06 });
  m.box("cloth", [-0.42, 1.03, 0.14], [0.2, 0.012, 0.11], "#3F7FD0", { ry: 0.3 });   // the gloves: a palm on the tray …
  m.box("cloth", [-0.42, 0.99, 0.285], [0.09, 0.012, 0.07], "#3F7FD0", { r: [Math.PI / 2 - 0.2, 0.3, 0] });   // … the cuff over the lip
  // a roll of trash liners and a clipboard of the cleaning schedule (lying flat)
  m.cyl("paper", [-0.2, 1.03, 0.14], 0.045, 0.16, "#1A1E24", { r: [0, 0, Math.PI / 2], seg: 16 });
  // ── on the mid shelf: two jumbo tissue rolls, two towel rolls, a gallon of floor cleaner ──
  for (const [x, z] of [[-0.48, -0.12], [-0.48, 0.12]]) { m.cyl("paper", [x, 0.6 + 0.046, z], 0.115, 0.09, "#F4F3EE", { seg: 24 }); m.cyl("misc", [x, 0.6 + 0.046, z], 0.1155, 0.04, "#FFFFFF", { seg: 24, open: true, rect: miscCell(3) }); m.cyl("paper", [x, 0.6 + 0.093, z], 0.035, 0.002, "#9A8A70", { seg: 12 }); }
  for (const z of [-0.12, 0.12]) { m.cyl("paper", [-0.25, 0.6 + 0.1, z], 0.075, 0.2, "#F6F5F1", { seg: 22 }); m.cyl("misc", [-0.25, 0.7, z], 0.0755, 0.07, "#FFFFFF", { seg: 22, open: true, rect: miscCell(1) }); }
  m.box("bottle", [-0.08, 0.6 + 0.14, -0.1], [0.12, 0.27, 0.12], "#B9D2EE");
  m.box("label", [-0.08, 0.72, -0.1], [0.122, 0.12, 0.122], "#FFFFFF", { rect: labelCell(2) });
  m.cyl("plastic", [-0.08, 0.89, -0.1], 0.02, 0.03, "#1F5FB4", { seg: 12 });
  m.box("plastic", [-0.08, 0.84, -0.06], [0.03, 0.06, 0.04], "#B9D2EE");
  // on the deck under the shelf: a case of can liners
  m.box("paper", [-0.3, DECK.y1 + 0.13, 0], [0.42, 0.26, 0.36], "#C9B590");
  m.box("paper", [-0.3, DECK.y1 + 0.13, 0.181], [0.3, 0.08, 0.002], "#2A3240");
  // ── the corn broom in two clips on the −z side (its straw on the floor), and the lobby dustpan on its hook at the rear ──
  for (const y of [0.52, 0.92]) m.box("plastic", [-0.42, y, -0.3], [0.05, 0.03, 0.05], GREY_D);
  m.cyl("straw", [-0.42, 0.88, -0.31], 0.0125, 1.12, "#B08356", { seg: 10 });   // the wooden handle (0.32 → 1.44)
  m.cyl("plastic", [-0.42, 1.45, -0.31], 0.015, 0.02, "#2A2F38", { seg: 10 });
  m.push([-0.42, 0, -0.31], 0.0);
  m.add("straw", gTaper(0.55, 0.8), Lm([0, 0.165, 0], [0.3, 0.33, 0.055]), "#D6B878");
  for (const y of [0.2, 0.26]) m.add("straw", gTaper(0.95, 1), Lm([0, y, 0], [0.3 * (1 - (y - 0.0) * 1.36) + 0.012, 0.014, 0.064]), "#7A2E2E");   // the stitching rows
  m.add("straw", gTaper(0.6, 0.9), Lm([0, 0.345, 0], [0.16, 0.04, 0.05]), "#C9A86A");
  m.pop();
  // the lobby dustpan: hangs by its handle's hole on a hook at the rear handle (pan clear of the floor)
  m.box("metal", [DECK.x0 - 0.08, 0.93, 0.2], [0.03, 0.012, 0.012], "#9AA4B0");
  m.cyl("plastic", [DECK.x0 - 0.1, 0.55, 0.2], 0.011, 0.76, "#2A2F38", { seg: 10 });
  m.push([DECK.x0 - 0.13, 0.12, 0.2], 0);
  m.box("plastic", [0, 0.0, 0], [0.2, 0.006, 0.3], "#2A2F38", { r: [0, 0, -0.25] });
  m.box("plastic", [0.06, 0.08, 0], [0.02, 0.15, 0.3], "#2A2F38");
  for (const s of [-1, 1]) m.box("plastic", [0.0, 0.05, s * 0.148], [0.18, 0.1, 0.006], "#2A2F38");
  m.pop();
  // ── the folded A-frame sign, leaning on the +z side panel (its foot on the floor, its top on the panel's edge) ──
  m.push([-0.3, 0, 0.42], 0);
  m.pushR([0, 0, 0], [0.19, 0, 0]);
  m.box("yellow", [0, 0.31, 0], [0.31, 0.62, 0.028], "#E9B92A");
  m.quad("wet", [0, 0.31, 0.0145], 0.3, 0.6, "#FFFFFF", [0, 0, 1, 1]);
  m.quad("wet", [0, 0.31, -0.0145], 0.3, 0.6, "#FFFFFF", [0, 0, 1, 1], { ry: Math.PI });
  m.box("yellow", [0, 0.62, 0], [0.31, 0.02, 0.03], "#C99A1C");                   // the hinge
  m.pop(); m.pop();
  // ── the mop bucket on its four casters, the side-press wringer, the wet mop ──
  m.push([BUCKET.x, 0, BUCKET.z], BUCKET.ry);
  const BW = 0.44, BD = 0.37, BH = 0.3, BY = 0.07;
  m.add("yellow", gRing("bucketWall", BW, BD, 0.012, 0.07, BH), Lm([0, BY, 0]), "#F2C230");
  m.add("yellow", gRing("bucketBase", BW - 0.02, BD - 0.02, 0, 0.06, 0.02), Lm([0, BY, 0]), "#E2B020");
  m.add("yellow", gRing("bucketLip", BW + 0.02, BD + 0.02, 0.022, 0.08, 0.018), Lm([0, BY + BH - 0.012, 0]), "#F5C83A");
  m.add("water", gRing("bucketWater", BW - 0.026, BD - 0.026, 0, 0.06, 0.002), Lm([0, BY + 0.2, 0]), "#5E7894");
  m.quad("misc", [0.05, BY + 0.15, BD / 2 + 0.002], 0.24, 0.12, "#FFFFFF", miscCell(2));
  for (const [a, b] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) { m.cyl("rubber", [a * (BW / 2 - 0.05), 0.032, b * (BD / 2 - 0.05)], 0.032, 0.024, "#16191D", { r: [Math.PI / 2, 0, 0], seg: 14 }); m.box("yellow", [a * (BW / 2 - 0.05), 0.066, b * (BD / 2 - 0.05)], [0.05, 0.012, 0.04], "#C99A1C"); }
  // the wringer on the −x end: its housing clipped over the rim, the press plate, the lever up and back
  const wx = -BW / 2 + 0.12;
  m.box("plastic", [wx, BY + BH + 0.1, 0], [0.22, 0.22, BD - 0.02], "#5A6068");
  m.box("plastic", [wx, BY + BH + 0.1, 0], [0.2, 0.2, BD + 0.012], "#4A5058");
  m.box("plastic", [wx + 0.09, BY + BH + 0.06, 0], [0.04, 0.16, BD - 0.06], "#6E757E");
  m.box("yellow", [wx - 0.02, BY + BH + 0.215, 0], [0.24, 0.025, BD + 0.02], "#F2C230");
  m.cyl("metal", [wx - 0.13, BY + BH + 0.2, 0], 0.012, BD + 0.04, "#AEB8C4", { r: [Math.PI / 2, 0, 0], seg: 10 });
  m.cyl("metal", [wx - 0.2, BY + BH + 0.42, 0], 0.014, 0.48, "#AEB8C4", { r: [0, 0, 0.32], seg: 10 });
  m.cyl("rubber", [wx - 0.27, BY + BH + 0.64, 0], 0.02, 0.14, "#1A1D22", { r: [0, 0, 0.32], seg: 10 });
  // the mop: its head in the wringer (cotton strands down into the water), the handle standing a little out of true
  const mx = wx + 0.0;
  m.box("plastic", [mx, BY + BH + 0.06, 0], [0.06, 0.05, 0.14], "#2A2F38");
  for (let k = 0; k < 46; k++) { const a = rnd(k + 300) * Math.PI * 2, r = 0.02 + rnd(k + 301) * 0.05; m.cyl("yarn", [mx + Math.cos(a) * r * 0.8, BY + 0.27, Math.sin(a) * r * 1.6], 0.008, 0.13 + rnd(k + 302) * 0.06, "#DAD6CB", { seg: 5 }); }
  m.pushR([mx, BY + BH + 0.08, 0], [0, 0, -0.1]);
  m.cyl("metal", [0, 0.62, 0], 0.012, 1.24, "#AEB8C4", { seg: 10 });
  m.cyl("plastic", [0, 1.27, 0], 0.016, 0.1, "#1F5FB4", { seg: 10 });
  m.pop();
  m.pop();
};

// ── the bin: a moulded round container (a tapered wall with ribs, the rim lip, handles), the liner, the certificate stack ─────
const binShellGeo = () => GC.binShell ??= (() => {
  const { h, rTop, rBot } = BIN, t = 0.008;
  const g = new THREE.LatheGeometry([[0.0001, 0], [rBot - 0.02, 0], [rBot, 0.015], [rTop, h - 0.035], [rTop + 0.018, h - 0.03], [rTop + 0.022, h - 0.008], [rTop + 0.006, h], [rTop - t, h - 0.008], [rTop - t, h - 0.05], [rBot - t, 0.02], [0.0001, 0.012]].map(([r, y]) => new THREE.Vector2(r, y)), 40);
  g.computeVertexNormals(); return g;
})();
const binRibsGeo = () => GC.binRibs ??= (() => {
  const parts = [];
  for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + Math.PI / 4; const b = new THREE.BoxGeometry(0.028, BIN.h - 0.12, 0.016); b.translate(0, BIN.h / 2 - 0.02, (BIN.rTop + BIN.rBot) / 2 + 0.004); b.rotateY(a); parts.push(b); }
  for (const s of [-1, 1]) { const b = new THREE.BoxGeometry(0.1, 0.03, 0.04); b.translate(0, BIN.h - 0.055, BIN.rTop + 0.02); b.rotateY(s > 0 ? Math.PI / 2 : -Math.PI / 2); parts.push(b); }
  const out = mergeSimple(parts); return out;
})();
const mergeSimple = (geos) => {
  const P = [], N = [], U = [], I = []; let base = 0;
  for (const g of geos) { const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv; for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); U.push(u.getX(i), u.getY(i)); } for (let i = 0; i < g.index.count; i++) I.push(base + g.index.getX(i)); base += p.count; }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); return g;
};
// the liner: inside the wall from the bottom to the rim, then folded over the lip and down the outside, crinkled
const linerGeo = () => GC.liner ??= (() => {
  const { h, rTop, rBot } = BIN;
  const g = new THREE.LatheGeometry([[0.0001, 0.02], [rBot - 0.012, 0.022], [rTop - 0.012, h - 0.02], [rTop - 0.006, h + 0.004], [rTop + 0.024, h + 0.008], [rTop + 0.03, h - 0.03], [rTop + 0.028, h - 0.095]].map(([r, y]) => new THREE.Vector2(r, y)), 48, 0, Math.PI * 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = Math.hypot(x, z), a = Math.atan2(z, x);
    if (r < rTop - 0.003 || y > h + 0.002) continue;
    const k = 0.006 + 0.012 * clamp01((h - y) / 0.09);
    const d = k * (Math.sin(a * 9 + 1.3) * 0.6 + Math.sin(a * 23 + 0.4) * 0.4) + (y < h - 0.07 ? -0.006 * (1 + Math.sin(a * 5)) : 0);
    p.setXYZ(i, x * (1 + d / r), y - (y < h - 0.06 ? 0.012 * (0.5 + 0.5 * Math.sin(a * 7 + 2)) : 0), z * (1 + d / r));
  }
  g.computeVertexNormals(); return g;
})();
const rimShader = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { k: { value: 0 }, col: { value: new THREE.Color("#E6F1FF") } },
  vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
  fragmentShader: "uniform float k;\nuniform vec3 col;\nvarying vec3 vN;\nvarying vec3 vV;\nvoid main(){\n float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.4);\n gl_FragColor = vec4(col * f * k, 1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}"
});
// the stack: sheets of three engraving colours, each a hair off square (no two edges line up), the P&G sheet on top
const buildStack = (m) => {
  const { n, t, w, d, y0 } = STACK;
  for (let i = 0; i < n; i++) {
    const k = i % 7 === 3 ? 1 : i % 5 === 2 ? 2 : 0;
    const jx = (rnd(i + 11) - 0.5) * 0.02, jz = (rnd(i + 12) - 0.5) * 0.016, ry = (rnd(i + 13) - 0.5) * 0.12 + (i % 17 === 0 ? 0.16 : 0);
    m.box("cert" + k, [BIN.x + jx, y0 + t * (i + 0.5), BIN.z + jz], [w, t * 0.92, d], i % 3 ? "#F3E9D2" : "#E9DCC0", { ry });
  }
};
let SM = null;
const stackMats = () => {
  if (SM) return SM;
  const mk = (map) => new THREE.MeshStandardMaterial({ map, vertexColors: true, roughness: 0.78, metalness: 0, emissive: new THREE.Color("#4D8ED9"), emissiveMap: map, emissiveIntensity: 0 });
  SM = { cert0: mk(certTex2(0)), cert1: mk(certTex2(1)), cert2: mk(certTex2(2)), top: mk(certTopTex()) };
  return SM;
};

/** the cart with its bin; xray 0–1 (shell → glass), flash 0–1 (rim peak), glow 0–1 (the stack's light);
 *  leak 0–1 (V39 rev 1, the hook's tease: before the reveal a faint blue light spills out of the bin's open top) */
export const JanitorCart = ({ xray = 0, flash = 0, glow = 0, leak = 0 }) => {
  const body = useMemo(() => { const m = new Mesher(); buildCart(m); return m.build(cartMats()); }, []);
  const stack = useMemo(() => { const m = new Mesher(); buildStack(m); return m.build(stackMats()); }, []);
  const B = useMemo(() => ({
    shell: new THREE.MeshStandardMaterial({ color: "#6B727B", roughness: 0.55, metalness: 0.02, envMapIntensity: 0.5 }),
    ribs: new THREE.MeshStandardMaterial({ color: "#626970", roughness: 0.6, metalness: 0.02 }),
    liner: new THREE.MeshStandardMaterial({ color: "#FFFFFF", map: rep(linerTex(), 3, 1), roughness: 0.3, metalness: 0.1, envMapIntensity: 1.1, side: THREE.DoubleSide }),
    rim: rimShader(), rim2: rimShader(),
    ring: new THREE.MeshBasicMaterial({ color: "#EAF4FF", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })
  }), []);
  // ── the x-ray: grey plastic → clear pale-blue glass; the liner thins away; a white rim ──
  const x = clamp01(xray), gl = clamp01(glow);
  const glass = x > 0.001;
  B.shell.transparent = glass; B.ribs.transparent = glass;
  B.shell.opacity = 1 - 0.9 * x; B.ribs.opacity = 1 - 0.9 * x;
  B.shell.color.set("#6B727B").lerp(new THREE.Color("#BFD8F6"), x); B.shell.roughness = 0.55 - 0.5 * x; B.shell.envMapIntensity = 0.5 + 1.3 * x;
  B.shell.emissive.set("#3F7CC4"); B.shell.emissiveIntensity = 0.04 * x + 0.5 * flash;
  B.shell.depthWrite = !glass; B.ribs.depthWrite = !glass; B.shell.side = glass ? THREE.DoubleSide : THREE.FrontSide;
  B.liner.transparent = glass; B.liner.opacity = 1 - x; B.liner.depthWrite = !glass; B.liner.visible = x < 0.995;
  B.rim.uniforms.k.value = clamp01(0.3 * x + 0.9 * flash); B.rim2.uniforms.k.value = clamp01(0.2 * x + 0.6 * flash);
  B.ring.opacity = clamp01(0.4 * x + 0.6 * flash);
  for (const k of ["cert0", "cert1", "cert2", "top"]) stackMats()[k].emissiveIntensity = (k === "top" ? 0.3 : 0.22) * gl;
  const cast = x < 0.3;
  return (
    <group>
      <primitive object={body} />
      <group position={[BIN.x, BIN.y0, BIN.z]}>
        <mesh geometry={binShellGeo()} material={B.shell} castShadow={cast} receiveShadow renderOrder={glass ? 4 : 0} />
        <mesh geometry={binRibsGeo()} material={B.ribs} castShadow={cast} renderOrder={glass ? 4 : 0} />
        <mesh geometry={linerGeo()} material={B.liner} castShadow={cast} receiveShadow renderOrder={glass ? 3 : 0} />
        {B.rim.uniforms.k.value > 0.003 && <><mesh geometry={binShellGeo()} material={B.rim} renderOrder={6} /><mesh geometry={binRibsGeo()} material={B.rim2} renderOrder={6} /></>}
        {B.ring.opacity > 0.003 && [[BIN.h + 0.001, BIN.rTop + 0.012], [0.016, BIN.rBot + 0.002]].map(([y, r], i) => (
          <mesh key={i} position={[0, y, 0]} rotation-x={Math.PI / 2} material={B.ring} renderOrder={7}><torusGeometry args={[r, 0.0035, 6, 64]} /></mesh>
        ))}
      </group>
      <primitive object={stack} />
      {/* the top certificate (the hero sheet, full print) */}
      <mesh position={[BIN.x, STACK_TOP + 0.0006, BIN.z]} rotation={[-Math.PI / 2, 0, 0.05]} material={stackMats().top}><planeGeometry args={[STACK.w, STACK.d]} /></mesh>
      {leak > 0.002 && <>
        <Glow position={[BIN.x, BIN_TOP + 0.05, BIN.z]} size={0.85} color="#7FB4F2" opacity={0.34 * leak} />
        <Glow position={[BIN.x, BIN_TOP + 0.22, BIN.z]} size={1.7} color="#4D8ED9" opacity={0.12 * leak} />
      </>}
      {gl + leak > 0.002 && <pointLight position={[BIN.x, Math.max(STACK_TOP + 0.08, BIN_TOP + 0.12 * (1 - gl)), BIN.z]} intensity={2.2 * gl + 1.1 * leak} distance={2.6} decay={1.6} color="#7FB4F2" />}
      {gl > 0.002 && <>
        <Glow position={[BIN.x, (STACK.y0 + STACK_TOP) / 2 + 0.05, BIN.z]} size={1.25} color="#7FB4F2" opacity={0.22 * gl} />
        <Glow position={[BIN.x, STACK_TOP + 0.03, BIN.z]} size={0.7} color="#B3CEEF" opacity={0.3 * gl} />
      </>}
    </group>
  );
};
