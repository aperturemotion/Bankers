// @ts-nocheck
// ★ V39 builder A — THE STORE SET (stations hook, jcp, line; origin [0,0,0]): the JCPenney department store in Brattleboro, Vermont,
//   where Ronald Read worked as a part-time janitor for 17 years (FACTCHECK line 3). He is never shown — only his cart.
//
//   INSIDE, closed, at night: a long polished terrazzo main aisle (a planar mirror over it, so the lit doors and the security
//   lights streak in the floor) between carpeted departments — clothing on round and four-way racks, wooden display tables of
//   folded shirts, sweaters, jeans and towels, jewellery cases with their own small lights, a service counter with registers, a shoe
//   wall of boxes, gondolas of bedding, slatwall on the side walls, columns with mirrors, hanging department signs (MEN'S, WOMEN'S,
//   HOME, SHOES, FINE JEWELRY, CUSTOMER SERVICE, CHILDREN'S, CATALOG), a 2 × 4 ft tile ceiling with its troffers mostly OFF and a
//   few warm security lights on; the glass entrance doors at the front end, blue hour outside. In the aisle: the janitor's cart.
//   OUTSIDE, blue hour: a one-storey brick front with a stucco fascia and the plain white letters "JCPenney" (plain typography, not
//   the logo artwork) over the entrance canopy, two lit display windows, a sidewalk, a striped parking lot with tall lot lamps, pines
//   and the dark Vermont hills behind the roof.
//   Frame: the front wall is the plane z = 0 (outside is +z), the store runs to z = −70, x from −18 to 18; floor y = 0, ceiling 4.2.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { Mesher, Lm, townMats } from "./town_parts";
import { Sky, Glow, rnd, clamp01, canvasTex } from "./kit";
import * as T from "./a_tex";
import { JanitorCart } from "./a_cart";
import { hang, divider, foldPiece, printTex, wallCell, notice, bagCell, doorNoCell, WALLWORDS } from "./a_fixtures";
import { LotGround, LotLamps, buildFront, StoreTrees, LOTY } from "./a_lot";
import { barkMat } from "./a_trees";

export const X0 = -18, X1 = 18, ZB = -70, CEIL = 4.2, AISLE = 1.25;
export const CART = { p: [0.1, 0, -22], ry: Math.PI / 2 + 0.38 };   // the cart's local +x (the bin end) points back down the aisle
/** a cart-local point → station-local */
export const cartPt = (p) => { const c = Math.cos(CART.ry), s = Math.sin(CART.ry); return [CART.p[0] + p[0] * c + p[2] * s, CART.p[1] + p[1], CART.p[2] - p[0] * s + p[2] * c]; };
const ENT = { x: 3.3, h: 3.3 }, DW = { x0: 5.0, x1: 15.6, y0: 0.55, y1: 3.3, back: -2.2 };
const pick = (a, r) => a[Math.floor(r * a.length) % a.length];
// muted department palettes (they sit in the blue-hour world; a few warm accents)
const MENS = ["#E9EEF5", "#B9CDE6", "#6F8FB8", "#2C3E5C", "#8A939E", "#D8D2C4", "#4A5A6E", "#7B3B42", "#3B4C66"];
const WOMENS = ["#E8E2EA", "#B7A6C6", "#2D3B57", "#9FB7D8", "#C9B9A6", "#5E6F8C", "#8E5A63", "#E3D9C9", "#6E7FA0"];
const DENIM = ["#2E4A72", "#3A5A86", "#22344F", "#5C7AA3"];
const HOMEC = ["#EEF1F5", "#C9D6E6", "#8EA6C6", "#D9CFC0", "#5F7290", "#B8C2CE"];

// ── materials (the town kit's brick/concrete/trim/metal plus the store's own) ───────────────────────────────────────────────
let SMATS = null;
export const storeMats = () => {
  if (SMATS) return SMATS;
  const S = (o) => new THREE.MeshStandardMaterial({ vertexColors: true, envMapIntensity: 0.14, ...o });
  const lensD = T.lensTex(false), lensL = T.lensTex(true);
  SMATS = {
    ...townMats(),
    ...Object.fromEntries(["brick2", "concrete", "trim", "metal", "roof"].map((k) => { const mm = townMats()[k].clone(); mm.envMapIntensity = 0.35; return [k, mm]; })),
    wash: S({ color: "#E9D8C4", emissive: new THREE.Color("#FFD2A0"), emissiveIntensity: 0.42, roughness: 0.8 }),
    paint: S({ map: T.rep(T.paintTex(), 0.5), roughness: 0.85, envMapIntensity: 0.15 }),
    slat: S({ map: T.rep(T.slatTex(), 1 / 0.6), roughness: 0.7, envMapIntensity: 0.15 }),
    chrome: S({ roughness: 0.22, metalness: 0.9, envMapIntensity: 0.35 }),
    mirror: S({ roughness: 0.04, metalness: 1, envMapIntensity: 0.7 }),
    wood: S({ map: T.rep(T.woodTex(), 0.8), roughness: 0.45, envMapIntensity: 0.15 }),
    lam: S({ roughness: 0.4, metalness: 0.05, envMapIntensity: 0.15 }),
    fab: S({ map: T.garmentTex(), roughness: 0.92, metalness: 0 }),
    fold: S({ map: T.foldTex(), roughness: 0.92, metalness: 0 }),
    shoe: S({ map: T.shoeTex(), roughness: 0.75 }),
    dsign: S({ map: T.signTex(), emissiveMap: T.signTex(), emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 0.16, roughness: 0.5 }),
    topper: S({ map: T.topperTex(), roughness: 0.5, emissiveMap: T.topperTex(), emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 0.05 }),
    glassIn: new THREE.MeshPhysicalMaterial({ color: "#A9C8EE", roughness: 0.05, metalness: 0, transparent: true, opacity: 0.16, envMapIntensity: 1.5, depthWrite: false, side: THREE.DoubleSide }),
    caseLit: S({ color: "#FFFFFF", emissive: new THREE.Color("#DCE8FA"), emissiveIntensity: 0.9, roughness: 0.5 }),
    velvet: S({ roughness: 1, metalness: 0 }),
    dark: S({ roughness: 0.7, metalness: 0.1 }),
    frame: S({ roughness: 0.35, metalness: 0.7, envMapIntensity: 0.8 }),
    stucco: S({ map: T.rep(T.stuccoTex(), 0.5), roughness: 0.9 }),
    decal: new THREE.MeshBasicMaterial({ map: T.doorTex(), transparent: true, depthWrite: false, toneMapped: true, side: THREE.DoubleSide }),
    news: S({ map: T.newsTex(), roughness: 0.4, emissiveMap: T.newsTex(), emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 0.06 }),
    warm: S({ color: "#FFE6C4", emissive: new THREE.Color("#FFC98A"), emissiveIntensity: 2.2, roughness: 0.4 }),
    cool: S({ color: "#EAF3FF", emissive: new THREE.Color("#CFE2FF"), emissiveIntensity: 1.6, roughness: 0.4 }),
    screen: S({ color: "#0A1628", emissive: new THREE.Color("#173C6E"), emissiveIntensity: 0.5, roughness: 0.2, metalness: 0.3 }),
    tag: S({ map: printTex(), roughness: 0.7 }),
    print: S({ map: printTex(), roughness: 0.55, emissiveMap: printTex(), emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 0.12 }),
    snow: S({ map: T.rep(T.snowTex(), 0.6), bumpMap: T.rep(T.snowBumpTex(), 0.6), bumpScale: 1.2, roughness: 0.82, envMapIntensity: 0.3 }),
    dome: S({ map: T.rep(T.domeTex(), 1.5 / 0.3, 0.5 / 0.3), roughness: 0.6 }),
    bark: barkMat()
  };
  for (const k of ["glassIn", "decal", "caseLit", "warm", "cool"]) SMATS[k].userData = { cast: false, ...(k === "glassIn" || k === "decal" ? { order: 3 } : {}) };
  return SMATS;
};
// the ceiling has its own materials (they fade if the close's camera rises: see Ceiling)
let CMATS = null;
const ceilMats = () => {
  if (CMATS) return CMATS;
  const S = (o) => new THREE.MeshStandardMaterial({ vertexColors: true, envMapIntensity: 0.1, ...o });
  CMATS = {
    ceil: S({ map: T.rep(T.ceilTex(), 1 / 1.22), roughness: 0.92, envMapIntensity: 0.15 }),
    lensD: S({ map: T.lensTex(false), roughness: 0.3, metalness: 0.1, emissiveMap: T.lensTex(false), emissive: new THREE.Color("#3A5272"), emissiveIntensity: 0.12 }),
    lensL: S({ map: T.lensTex(true), emissiveMap: T.lensTex(true), emissive: new THREE.Color("#FFC88A"), emissiveIntensity: 1.1, roughness: 0.3 }),
    diff: S({ map: T.diffuserTex(), roughness: 0.5, metalness: 0.2 }),
    cmetal: S({ roughness: 0.4, metalness: 0.6 })
  };
  for (const m of Object.values(CMATS)) m.userData = { cast: false };
  return CMATS;
};

// ── the fixtures ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// a garment on its hanger (a_fixtures.hang): the atlas cell decides the cut — 2 jeans / 7 slacks hang folded over the bar, 5 a dress
let _gs = 0;
const garment = (m, p, ry, w, len, col, cell, thick = 0.045) => {
  const kind = cell === 2 || cell === 7 ? "pants" : cell === 5 ? "dress" : "top";
  hang(m, p, ry, w, len, col, T.garCell(cell), _gs++, kind, kind === "top" && (cell === 3 || cell === 1) ? thick * 1.4 : thick);
};
// a round rack: a cross base, the upright, a chrome ring of garments hanging radially, a topper sign
const roundRack = (m, x, z, seed, pal, cells, topper) => {
  m.push([x, 0, z], rnd(seed) * 3);
  for (let k = 0; k < 4; k++) m.box("chrome", [0, 0.025, 0], [0.62, 0.025, 0.035], "#C9D1DA", { ry: (k * Math.PI) / 4 + 0.4 });
  for (let k = 0; k < 4; k++) m.sph("dark", [Math.cos(k * Math.PI / 2 + 0.4) * 0.3, 0.012, -Math.sin(k * Math.PI / 2 + 0.4) * 0.3], 0.018, "#1A1E24", { seg: 6 });
  m.cyl("chrome", [0, 0.7, 0], 0.02, 1.34, "#C9D1DA", { seg: 10 });
  const R = 0.6, H = 1.32;
  m.add("chrome", torusG(R), Lm([0, H, 0], [1, 1, 1], [Math.PI / 2, 0, 0]), "#C9D1DA");
  for (let k = 0; k < 4; k++) m.box("chrome", [0, H, 0], [R * 2, 0.016, 0.016], "#C9D1DA", { ry: (k * Math.PI) / 4 });
  const n = 30, col = pick(pal, rnd(seed + 1)), col2 = pick(pal, rnd(seed + 2)), cell = pick(cells, rnd(seed + 3));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd(seed * 31 + i) * 0.05;
    const c = rnd(seed * 17 + i) < 0.55 ? col : rnd(seed * 19 + i) < 0.6 ? col2 : pick(pal, rnd(seed * 23 + i));
    garment(m, [Math.cos(a) * R, H - 0.012, Math.sin(a) * R], -a, 0.46, 0.68 + rnd(i + seed) * 0.05, c, cell);
    if (i % 8 === 4) { const a2 = a + Math.PI / n; divider(m, [Math.cos(a2) * R, H, Math.sin(a2) * R], -a2 + Math.PI / 2, (i / 8) | 0); }
  }
  if (topper != null) { m.cyl("chrome", [0, H + 0.12, 0], 0.008, 0.24, "#C9D1DA", { seg: 6 }); m.box("topper", [0, H + 0.33, 0], [0.42, 0.14, 0.006], "#FFFFFF", { rect: T.topperCell(topper) }); }
  m.pop();
};
const _tor = {};
const torusG = (R) => _tor[R] ??= new THREE.TorusGeometry(R, 0.011, 6, 40);
// a four-way rack: a square upright, four straight arms, garments hung face-out along each arm
const fourWay = (m, x, z, seed, pal, cells, ry = 0) => {
  m.push([x, 0, z], ry);
  for (let k = 0; k < 2; k++) m.box("chrome", [0, 0.025, 0], [0.95, 0.025, 0.04], "#C9D1DA", { ry: k * Math.PI / 2 + Math.PI / 4 });
  m.box("chrome", [0, 0.72, 0], [0.045, 1.44, 0.045], "#C9D1DA");
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2, H = k % 2 ? 1.36 : 1.42, ca = Math.cos(a), sa = -Math.sin(a);
    m.box("chrome", [ca * 0.33, H, sa * 0.33], [0.62, 0.02, 0.02], "#C9D1DA", { ry: a });
    m.box("chrome", [ca * 0.62, H + 0.02, sa * 0.62], [0.02, 0.05, 0.02], "#C9D1DA");
    const col = pick(pal, rnd(seed + k)), cell = pick(cells, rnd(seed + k * 3 + 1));
    for (let i = 0; i < 8; i++) { const r = 0.14 + i * 0.062; garment(m, [ca * r, H - 0.012, sa * r], a + Math.PI / 2, 0.46, 0.72, i % 4 === 3 ? pick(pal, rnd(seed + k + 9)) : col, cell); }
    divider(m, [ca * 0.39, H, sa * 0.39], a, k + (seed % 3));
    m.box("chrome", [ca * 0.64, H, sa * 0.64], [0.03, 0.03, 0.03], "#C9D1DA");   // the arm's ball end stop
  }
  m.pop();
};
// a wooden display table with stacks of folded goods on the top and the shelf below, and an acrylic sign stand
const foldTable = (m, x, z, seed, pal, kind, ry = 0, topper = null) => {
  m.push([x, 0, z], ry);
  const L = 1.52, D = 0.76, H = 0.78;
  m.box("wood", [0, H - 0.02, 0], [L, 0.04, D], "#FFFFFF", { metric: true });
  m.box("wood", [0, H - 0.07, 0], [L - 0.06, 0.06, D - 0.06], "#D8C4A8", { metric: true });
  for (const [a, b] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) m.box("wood", [a * (L / 2 - 0.05), (H - 0.04) / 2, b * (D / 2 - 0.05)], [0.05, H - 0.04, 0.05], "#C8B092", { metric: true });
  m.box("wood", [0, 0.14, 0], [L - 0.1, 0.03, D - 0.1], "#D8C4A8", { metric: true });
  const piece = kind === "towel" ? { w: 0.34, h: 0.055, d: 0.3, top: 2 } : kind === "sweater" ? { w: 0.34, h: 0.06, d: 0.36, top: 1 } : kind === "jeans" ? { w: 0.34, h: 0.045, d: 0.38, top: 4 } : { w: 0.3, h: 0.038, d: 0.36, top: kind === "boxed" ? 5 : 0 };
  const stacks = (y0, rows, cols, nMax) => {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const sx = (c - (cols - 1) / 2) * (piece.w + 0.08), sz = (r - (rows - 1) / 2) * (piece.d + 0.05);
      const n = 3 + Math.floor(rnd(seed * 7 + r * 5 + c) * (nMax - 2)), col = pick(pal, rnd(seed * 3 + r * 9 + c * 4));
      for (let i = 0; i < n; i++) {
        const jit = (rnd(seed + r * 40 + c * 7 + i) - 0.5) * 0.012;
        foldPiece(m, "fold", [sx + jit, y0 + piece.h * (i + 0.5), sz - jit], [piece.w, piece.h, piece.d], i % 5 === 4 ? pick(pal, rnd(seed + i + r)) : col, (j) => T.foldCell(Math.floor(j / 4) === 2 ? piece.top : 3), jit * 2);
      }
    }
  };
  stacks(H, 2, kind === "towel" ? 3 : 4, kind === "towel" ? 7 : 6);
  stacks(0.155, 1, 4, 4);
  if (topper != null) { m.box("glassIn", [0.55, H + 0.1, -0.2], [0.24, 0.17, 0.008], "#FFFFFF"); m.box("topper", [0.55, H + 0.1, -0.196], [0.22, 0.073, 0.002], "#FFFFFF", { rect: T.topperCell(topper) }); m.box("glassIn", [0.55, H + 0.006, -0.2], [0.24, 0.012, 0.07], "#FFFFFF"); }
  m.pop();
};
// a glass-topped jewellery case: a laminate cabinet with a kick, a lit vitrine with velvet trays and pieces
const jewelCase = (m, x, z, ry, seed) => {
  m.push([x, 0, z], ry);
  const L = 1.8, D = 0.6;
  m.box("dark", [0, 0.05, 0], [L - 0.04, 0.1, D - 0.06], "#11161F");
  m.box("lam", [0, 0.5, 0], [L, 0.8, D], "#E9ECF0");
  m.box("lam", [0, 0.5, D / 2 + 0.002], [L - 0.1, 0.7, 0.004], "#D3D9E1");
  m.box("frame", [0, 0.91, 0], [L, 0.02, D], "#B9C3CF");
  m.box("velvet", [0, 0.925, 0], [L - 0.06, 0.012, D - 0.06], "#1E2A44");
  for (let k = 0; k < 4; k++) { m.box("velvet", [-0.62 + k * 0.42, 0.94, 0], [0.34, 0.025, 0.4], "#2A3858"); for (let i = 0; i < 6; i++) m.sph(rnd(seed + k * 9 + i) < 0.5 ? "chrome" : "warm", [-0.74 + k * 0.42 + (i % 3) * 0.1, 0.96, -0.08 + Math.floor(i / 3) * 0.16], 0.012, rnd(seed + i) < 0.5 ? "#E6EDF5" : "#FFE6B0", { seg: 6 }); }
  m.box("glassIn", [0, 1.07, 0], [L - 0.02, 0.28, D - 0.02], "#FFFFFF");
  m.box("frame", [0, 1.215, 0], [L, 0.012, D], "#B9C3CF");
  for (const a of [-1, 1]) for (const b of [-1, 1]) m.box("frame", [a * (L / 2 - 0.006), 1.07, b * (D / 2 - 0.006)], [0.012, 0.29, 0.012], "#B9C3CF");
  m.box("caseLit", [0, 1.2, -D / 2 + 0.04], [L - 0.1, 0.012, 0.02], "#FFFFFF");
  m.pop();
};
// a gondola of shelves (bedding, towels in packs): a pegboard spine, a base deck, three shelves each face, an end cap
const gondola = (m, x, z, L, seed, pal, ry = 0) => {
  m.push([x, 0, z], ry);
  m.box("paint", [0, 0.8, 0], [L, 1.5, 0.05], "#AEB6C1");
  m.box("dark", [0, 0.08, 0], [L, 0.16, 0.9], "#2A3240");
  for (let r = 0; r < 3; r++) for (const s of [-1, 1]) {
    const y = 0.5 + r * 0.42;
    m.box("chrome", [0, y, s * 0.22], [L, 0.02, 0.4], "#9AA6B4");
    let xx = -L / 2 + 0.05;
    for (let k = 0; xx < L / 2 - 0.25; k++) { const w = 0.32 + rnd(seed + r * 13 + k) * 0.12, h = 0.16 + rnd(seed + k) * 0.12; m.box("fold", [xx + w / 2, y + 0.01 + h / 2, s * 0.22], [w, h, 0.34], pick(pal, rnd(seed * 5 + r * 7 + k)), { rectFn: (j) => T.foldCell(Math.floor(j / 4) === 2 ? 2 : 3) }); xx += w + 0.03; }
  }
  for (let k = 0; k < 4; k++) m.box("fold", [0, 0.2 + k * 0.06, 0.3], [L * 0.8, 0.055, 0.3], pick(pal, rnd(seed + 50 + k)), { rectFn: (j) => T.foldCell(Math.floor(j / 4) === 2 ? 2 : 3) });
  m.pop();
};
// a store column: a square painted column, mirror panels on two faces, a base and corner guards
const column = (m, x, z) => {
  m.box("paint", [x, CEIL / 2, z], [0.56, CEIL, 0.56], "#C3CBD6");
  m.box("dark", [x, 0.06, z], [0.6, 0.12, 0.6], "#2A3240");
  for (const s of [-1, 1]) m.box("mirror", [x, 1.5, z + s * 0.285], [0.46, 1.9, 0.01], "#DDE6F0");
  for (const a of [-1, 1]) for (const b of [-1, 1]) m.box("chrome", [x + a * 0.28, 0.75, z + b * 0.28], [0.03, 1.4, 0.03], "#C9D1DA");
};
// a hanging department sign: a two-faced navy panel on two rods from the ceiling
const hangSign = (m, x, z, i, w = 2.6) => {
  const y = 3.42, h = 0.64;
  m.box("dark", [x, y, z], [w, h, 0.07], "#0A2547");
  m.quad("dsign", [x, y, z + 0.037], w - 0.04, h - 0.04, "#FFFFFF", T.signCell(i));
  m.quad("dsign", [x, y, z - 0.037], w - 0.04, h - 0.04, "#FFFFFF", T.signCell(i), { ry: Math.PI });
  for (const s of [-1, 1]) m.cyl("chrome", [x + s * (w / 2 - 0.25), (y + h / 2 + CEIL) / 2, z], 0.008, CEIL - y - h / 2, "#C9D1DA", { seg: 6 });
};
// a run of shoe boxes on slatwall shelves (end labels facing out) with a display shoe on each top shelf
const shoeWall = (m, x, z0, z1, seed) => {
  for (let r = 0; r < 6; r++) {
    const y = 0.3 + r * 0.36;
    m.box("chrome", [x - 0.18, y, (z0 + z1) / 2], [0.36, 0.015, z1 - z0], "#9AA6B4");
    let z = z0 + 0.05;
    for (let k = 0; z < z1 - 0.35; k++) {
      const w = 0.32, hh = 0.11 + rnd(seed + r * 17 + k) * 0.02, nStack = r === 5 ? 0 : 2 + Math.floor(rnd(seed + k * 3 + r) * 2);
      for (let s = 0; s < nStack; s++) m.box("shoe", [x - 0.17, y + 0.008 + hh * (s + 0.5), z + w / 2], [0.3, hh * 0.97, w], "#FFFFFF", { rectFn: (j) => T.shoeCell(Math.floor(rnd(seed + r * 31 + k * 7 + s) * 16)), ry: Math.PI / 2 });
      if (r === 5 && k % 2 === 0) { m.box("dark", [x - 0.16, y + 0.05, z + w / 2], [0.27, 0.07, 0.1], pick(["#1E2330", "#5A3E2A", "#EEF0F3", "#2A3B55"], rnd(seed + k))); m.box("dark", [x - 0.2, y + 0.11, z + w / 2], [0.12, 0.07, 0.09], pick(["#1E2330", "#5A3E2A", "#EEF0F3", "#2A3B55"], rnd(seed + k))); }
      z += w + 0.03;
    }
  }
};
// the service counter: a cash wrap with two registers, a receipt printer, a bag well, a sign pole
const cashWrap = (m, x, z) => {
  m.push([x, 0, z], 0);
  m.box("lam", [0, 0.5, 0], [3.2, 1.0, 0.7], "#E3E7EC"); m.box("dark", [0, 0.05, 0.02], [3.14, 0.1, 0.66], "#11161F");
  m.box("wood", [0, 1.02, 0], [3.3, 0.04, 0.8], "#FFFFFF", { metric: true });
  m.box("lam", [0, 0.5, 0.352], [3.0, 0.8, 0.006], "#C9D1DB");
  for (const s of [-1, 1]) {
    m.box("dark", [s * 0.8, 1.06, 0.05], [0.4, 0.04, 0.3], "#2A2F38");                                   // the cash drawer base
    m.box("dark", [s * 0.8, 1.2, -0.05], [0.06, 0.24, 0.06], "#2A2F38");
    m.box("dark", [s * 0.8, 1.36, -0.02], [0.38, 0.26, 0.04], "#1A1E24", { r: [-0.25, 0, 0] });          // the screen
    m.box("screen", [s * 0.8, 1.36, 0.0], [0.33, 0.21, 0.004], "#FFFFFF", { r: [-0.25, 0, 0] });
    m.box("dark", [s * 0.8 + 0.3, 1.1, 0.1], [0.16, 0.1, 0.18], "#2A2F38");                              // the receipt printer
    m.box("dark", [s * 0.8 - 0.05, 1.05, 0.25], [0.36, 0.02, 0.14], "#3A4250", { r: [0.15, 0, 0] });     // the keyboard
  }
  m.pop();
};

// ── the whole merged construction ──────────────────────────────────────────────────────────────────────────────────────────
const buildStore = (m) => {
  const W_ = X1 - X0, L_ = -ZB;
  // ── shell: side and back walls (painted inside, brick outside), the front wall around the entrance and the display windows ──
  for (const s of [-1, 1]) {
    m.box("paint", [s * (X1 - 0.02), CEIL / 2, ZB / 2], [0.04, CEIL, L_], "#B9C3CF", { metric: true });
    m.box("brick2", [s * (X1 + 0.18), 3.6, ZB / 2], [0.3, 7.2, L_ + 0.6], "#FFFFFF", { metric: true });
    m.box("dark", [s * (X1 - 0.05), 0.06, ZB / 2], [0.02, 0.12, L_], "#1A1E24");   // the cove base
  }
  m.box("paint", [0, CEIL / 2, ZB + 0.02], [W_, CEIL, 0.04], "#B9C3CF", { metric: true });
  m.box("brick2", [0, 3.6, ZB - 0.18], [W_ + 0.6, 7.2, 0.3], "#FFFFFF", { metric: true });
  // the front wall: piers and spandrels around the openings (brick outside; painted inside), the stucco fascia, the coping
  const FZ = 0;
  const pier = (xa, xb) => { m.box("brick2", [(xa + xb) / 2, 2.2, FZ], [xb - xa, 4.4, 0.3], "#FFFFFF", { metric: true }); m.box("paint", [(xa + xb) / 2, CEIL / 2, FZ - 0.16], [xb - xa, CEIL, 0.02], "#B9C3CF", { metric: true }); };
  for (const s of [-1, 1]) {
    pier(s < 0 ? X0 - 0.3 : DW.x1, s < 0 ? -DW.x1 : X1 + 0.3);
    pier(s < 0 ? -DW.x0 : ENT.x, s < 0 ? -ENT.x : DW.x0);
    const xc = s * (DW.x0 + DW.x1) / 2, ww = DW.x1 - DW.x0;
    m.box("trim", [xc, DW.y0 / 2, FZ], [ww, DW.y0, 0.3], "#7E8796");                                  // the granite bulkhead
    m.box("trim", [xc, DW.y0 + 0.03, FZ + 0.16], [ww + 0.1, 0.06, 0.1], "#A3ABB6");
    m.box("brick2", [xc, (DW.y1 + 4.4) / 2, FZ], [ww, 4.4 - DW.y1, 0.3], "#FFFFFF", { metric: true });
    m.box("metal", [xc, DW.y1 + 0.06, FZ + 0.12], [ww + 0.1, 0.14, 0.12], "#2A2E33");                 // the steel lintel
    // the storefront: frame, three lights of glass per window, mullions
    for (let k = 0; k <= 3; k++) m.box("frame", [xc - ww / 2 + k * ww / 3, (DW.y0 + DW.y1) / 2, FZ + 0.1], [0.08, DW.y1 - DW.y0, 0.12], "#2A2E33");
    m.box("frame", [xc, DW.y0 + 0.04, FZ + 0.1], [ww, 0.08, 0.12], "#2A2E33"); m.box("frame", [xc, DW.y1 - 0.04, FZ + 0.1], [ww, 0.08, 0.12], "#2A2E33");
    m.box("glassIn", [xc, (DW.y0 + DW.y1) / 2, FZ + 0.08], [ww, DW.y1 - DW.y0, 0.01], "#FFFFFF");
    // the display box behind: a carpeted platform, side walls, a low back partition (the store shows over it)
    m.box("velvet", [xc, DW.y0 / 2, (DW.back + FZ) / 2 - 0.08], [ww, DW.y0, -DW.back - 0.16], "#2C3850");
    m.box("paint", [xc, 1.0, DW.back], [ww, 2.0, 0.08], "#9DA9B8");
    m.quad("wash", [xc, 1.28, DW.back + 0.045], ww - 0.1, 1.44, "#FFFFFF", [0.1, 0.1, 0.2, 0.2]);
    m.box("dark", [xc, 2.02, DW.back], [ww + 0.02, 0.04, 0.12], "#2A3240");
    for (const xs of [DW.x0, DW.x1]) m.box("paint", [s * xs, 1.65, (DW.back + FZ) / 2 - 0.08], [0.08, 3.3, -DW.back - 0.16], "#9DA9B8");
    m.box("paint", [xc, 3.3 + (CEIL - 3.3) / 2, DW.back], [ww, CEIL - 3.3, 0.06], "#9DA9B8");    // the bulkhead over the window box
    m.box("paint", [xc, 3.3, (DW.back + FZ) / 2 - 0.08], [ww, 0.04, -DW.back - 0.16], "#C3CBD6"); // its soffit
    // the window display: a round rack of outerwear, a table of sweaters, a sign on a stand
    m.push([0, DW.y0, 0], 0); roundRack(m, xc - s * 2.8, -1.15, 70 + s, MENS, [3], null); foldTable(m, xc + s * 1.6, -1.0, 80 + s, WOMENS, "sweater", 0, null); m.pop();
    m.cyl("chrome", [xc + s * 3.6, 0.55 + 0.6, -1.4], 0.012, 1.2, "#C9D1DA", { seg: 6 });
    m.box("topper", [xc + s * 3.6, 1.86, -1.4], [0.6, 0.2, 0.01], "#FFFFFF", { rect: T.topperCell(s < 0 ? 8 : 0) });
    for (let k = 0; k < 5; k++) m.glow([xc - ww / 2 + 1 + k * (ww - 2) / 4, 3.22, -0.5], "#FFD9A8", 0.6);
    for (let k = 0; k < 5; k++) m.cyl("warm", [xc - ww / 2 + 1 + k * (ww - 2) / 4, 3.24, -0.5], 0.05, 0.05, "#FFFFFF", { seg: 10 });
  }
  // two concrete planters of clipped yews flanking the entrance
  for (const s2 of [-1, 1]) { const px = s2 * 5.9; m.box("trim", [px, 0.3, 1.0], [1.6, 0.6, 0.9], "#8C929C"); m.box("trim", [px, 0.62, 1.0], [1.7, 0.05, 1.0], "#A3ABB6"); m.box("snow", [px, 0.65, 1.0], [1.5, 0.05, 0.8], "#E4EBF3"); for (let k = 0; k < 7; k++) { const py = 0.82 + rnd(k + px) * 0.12, pz = 1.0 + (rnd(k * 3 + px) - 0.5) * 0.3; m.ico("plant", [px - 0.6 + k * 0.2, py, pz], [0.24, 0.26, 0.24], pick(["#1F3A36", "#28463F", "#22403A"], rnd(k + 9))); m.ico("snow", [px - 0.6 + k * 0.2, py + 0.17, pz], [0.17, 0.08, 0.17], "#EEF3F9"); } m.box("snow", [px, 0.632, 1.0], [1.68, 0.03, 0.98], "#EEF3F9"); }
  // warm wall packs on the piers (security lights), each with its glow
  for (const x of [-16.8, -10.3, 10.3, 16.8]) { m.box("metal", [x, 4.0, 0.24], [0.34, 0.26, 0.18], "#1E2630"); m.box("warm", [x, 3.89, 0.27], [0.26, 0.04, 0.1], "#FFFFFF"); m.glow([x, 3.82, 0.4], "#FFCF96", 1.4); }
  // the entrance: two pairs of doors with sidelights and a transom, push bars, decals; the vestibule mat inside
  m.box("brick2", [0, (ENT.h + 4.4) / 2, FZ], [ENT.x * 2, 4.4 - ENT.h, 0.3], "#FFFFFF", { metric: true });
  for (const x of [-ENT.x, -1.75, -0.05, 0.05, 1.75, ENT.x]) m.box("frame", [x, ENT.h / 2, FZ + 0.05], [0.1, ENT.h, 0.16], "#2A2E33");
  m.box("frame", [0, ENT.h - 0.05, FZ + 0.05], [ENT.x * 2, 0.1, 0.16], "#2A2E33"); m.box("frame", [0, 2.28, FZ + 0.05], [ENT.x * 2, 0.1, 0.16], "#2A2E33");
  for (const s of [-1, 1]) {
    for (const x of [s * 0.9, s * 2.5]) {
      m.box("glassIn", [x, 1.14, FZ + 0.05], [x === s * 2.5 ? 1.5 : 1.6, 2.18, 0.012], "#FFFFFF");
      m.box("frame", [x, 0.08, FZ + 0.05], [x === s * 2.5 ? 1.5 : 1.6, 0.16, 0.06], "#2A2E33");   // the bottom rail
      if (x === s * 0.9) for (const z of [FZ + 0.12, FZ - 0.02]) { m.box("chrome", [x, 1.05, z], [1.3, 0.04, 0.04], "#C9D1DA"); for (const e of [-0.6, 0.6]) m.box("chrome", [x + e, 1.05, (z + FZ + 0.05) / 2], [0.04, 0.04, 0.07], "#C9D1DA"); }
      if (x === s * 0.9) m.quad("decal", [x, 1.25, FZ + 0.065], 0.82, 1.64, "#FFFFFF", [0, 0, 1, 1]);
    }
    m.box("glassIn", [s * 1.7, 2.8, FZ + 0.05], [3.3, 0.9, 0.012], "#FFFFFF");
  }
  m.box("dark", [0, 0.006, -1.6], [5.6, 0.012, 2.6], "#20262F");   // the walk-off mat inside the doors
  m.box("dark", [0, 0.004, 1.5], [5.6, 0.008, 2.0], "#20262F");    // and outside
  // above the openings: the stucco fascia (sign band), the cornice and the coping; the parapet's back
  m.box("stucco", [0, 5.65, FZ + 0.02], [W_ + 0.6, 2.5, 0.34], "#77706A", { metric: true });
  m.box("trim", [0, 4.42, FZ + 0.2], [W_ + 0.6, 0.08, 0.1], "#A3ABB6");
  m.box("trim", [0, 6.95, FZ + 0.22], [W_ + 0.6, 0.12, 0.14], "#A3ABB6");
  m.box("metal", [0, 7.12, FZ + 0.05], [W_ + 0.7, 0.16, 0.5], "#2A2E33");
  for (let k = -9; k <= 9; k++) if (Math.abs(k) > 3) m.box("stucco", [k * 2, 5.65, FZ + 0.195], [0.02, 2.4, 0.01], "#5A554F");   // control joints (clear of the sign)
  m.box("roof", [0, 6.6, ZB / 2], [W_, 0.1, L_], "#FFFFFF", { metric: true }); m.box("snow", [0, 6.67, ZB / 2], [W_ - 0.2, 0.06, L_ - 0.2], "#D9E2EE");
  for (const [x, z, w, d] of [[-9, -14, 3.2, 2], [7, -20, 2.6, 1.8], [-4, -38, 3.2, 2], [10, -46, 2.2, 1.6]]) { m.box("metal", [x, 7.35, z], [w, 1.4, d], "#A9B3C0"); m.cyl("metal", [x + w * 0.25, 8.07, z], 0.4, 0.06, "#2A3240", { seg: 16 }); m.box("snow", [x - w * 0.15, 8.08, z], [w * 0.6, 0.05, d - 0.1], "#E4EBF3"); }   // rooftop units
  // the canopy over the entrance: fascia, soffit with recessed lights, two columns with stone bases
  const CX = 4.9, CZ = 3.7;
  m.box("metal", [0, 3.75, CZ / 2 + 0.1], [CX * 2, 0.6, CZ], "#1B2433");
  m.box("stucco", [0, 3.78, CZ + 0.12], [CX * 2 + 0.1, 0.56, 0.08], "#FFFFFF", { metric: true });
  for (const s of [-1, 1]) m.box("stucco", [s * (CX + 0.06), 3.78, CZ / 2 + 0.1], [0.08, 0.56, CZ], "#FFFFFF", { metric: true });
  m.box("trim", [0, 3.44, CZ / 2 + 0.1], [CX * 2, 0.02, CZ], "#C3CBD6");
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const x = -3.3 + i * 2.2, z = 1.2 + j * 1.7; m.cyl("warm", [x, 3.43, z], 0.09, 0.02, "#FFFFFF", { seg: 14 }); m.glow([x, 3.36, z], "#FFD6A0", 0.7); }
  for (const s of [-1, 1]) { m.box("brick2", [s * 4.4, 1.72, CZ - 0.3], [0.5, 3.44, 0.5], "#FFFFFF", { metric: true }); m.box("trim", [s * 4.4, 0.25, CZ - 0.3], [0.62, 0.5, 0.62], "#7E8796"); }
  // the sidewalk (concrete slabs, tooled joints), the curb, bollards, a bench, a trash can, the town's newspaper box, a planter
  m.box("concrete", [0, -0.075, 1.925], [W_ + 12, 0.15, 3.55], "#FFFFFF", { metric: true });
  for (const s2 of [-1, 1]) m.box("concrete", [s2 * 12.8, -0.075, 4.075], [22.4, 0.15, 0.75], "#FFFFFF", { metric: true });
  for (const x of [-3.3, -2.2, 2.2, 3.3]) { m.cyl("metal", [x, 0.45, 4.05], 0.1, 0.9, "#3A4A5E", { seg: 14 }); m.sph("metal", [x, 0.9, 4.05], [0.1, 0.06, 0.1], "#3A4A5E", { seg: 10 }); m.sph("snow", [x, 0.93, 4.05], [0.09, 0.04, 0.09], "#EEF3F9", { seg: 8 }); m.box("metal", [x, 0.6, 4.05], [0.205, 0.05, 0.205], "#C9A93E", { ry: 0.78 }); }
  buildFront(m);
  m.push([7.2, 0, 1.6], 0); m.box("metal", [0, 0.55, 0], [0.5, 0.72, 0.42], "#1F4E8C"); m.box("metal", [0, 0.1, 0], [0.42, 0.2, 0.36], "#1B2433"); m.quad("news", [0, 0.66, 0.213], 0.44, 0.44, "#FFFFFF", [0, 0, 1, 1]); m.box("metal", [0, 0.93, 0], [0.52, 0.04, 0.44], "#16355E"); m.box("snow", [0, 0.97, 0], [0.48, 0.04, 0.4], "#EEF3F9"); m.pop();
  m.push([-7.4, 0, 1.4], 0); for (let k = 0; k < 3; k++) m.box("wood", [0, 0.44, -0.12 + k * 0.13], [1.6, 0.04, 0.1], "#6B4A36"); for (let k = 0; k < 2; k++) m.box("wood", [0, 0.62 + k * 0.14, -0.24], [1.6, 0.1, 0.03], "#6B4A36", { r: [-0.15, 0, 0] }); for (const sd of [-1, 1]) { m.box("metal", [sd * 0.7, 0.22, -0.02], [0.05, 0.44, 0.42], "#1E2630"); m.box("metal", [sd * 0.7, 0.62, -0.25], [0.05, 0.4, 0.04], "#1E2630"); } m.box("snow", [0, 0.48, 0.02], [1.5, 0.04, 0.34], "#EEF3F9"); m.pop();
  m.cyl("metal", [5.8, 0.45, 1.5], 0.27, 0.9, "#2A3B4E", { seg: 16 }); m.sph("metal", [5.8, 0.9, 1.5], [0.29, 0.12, 0.29], "#22303F", { seg: 14 }); m.sph("snow", [5.8, 0.98, 1.5], [0.25, 0.07, 0.25], "#EEF3F9", { seg: 12 });
  for (let k = 0; k < 13; k++) m.box("metal", [5.8 + Math.cos(k * 0.483) * 0.272, 0.45, 1.5 + Math.sin(k * 0.483) * 0.272], [0.025, 0.86, 0.02], "#22303F", { ry: -k * 0.483 });   // its slats
  // ── the interior floor fittings and the departments ──
  // the transition strips between terrazzo and carpet along the main aisle
  for (const s of [-1, 1]) m.box("chrome", [s * AISLE, 0.004, (ZB + -2.8) / 2], [0.05, 0.008, -ZB - 2.8], "#B9A77A");
  // columns (two rows each side), with mirrors
  for (const x of [-7.2, 7.2, -14.4, 14.4]) for (const z of [-9, -18, -27, -45, -54, -63]) column(m, x, z);
  // hanging department signs (over the departments, never over the main aisle: the close's camera has open air above the aisle)
  hangSign(m, -5.4, -4.6, 8, 3.4); hangSign(m, 5.4, -4.6, 4, 3.0);
  hangSign(m, -5.4, -12, 1); hangSign(m, 5.4, -12, 0);
  hangSign(m, -5.4, -40, 2); hangSign(m, 5.4, -40, 3);
  hangSign(m, -5.4, -58, 5, 3.0); hangSign(m, 5.4, -58, 6);
  // the front: customer service (left), fine jewellery (right)
  cashWrap(m, -6.6, -6.6);
  m.box("dark", [-6.6, 0.006, -7.6], [4.0, 0.012, 1.4], "#20262F");
  jewelCase(m, 4.2, -6.2, 0, 1); jewelCase(m, 6.2, -6.2, 0, 2); jewelCase(m, 8.2, -6.2, 0, 3); jewelCase(m, 9.4, -7.4, Math.PI / 2, 4); jewelCase(m, 3.0, -7.4, Math.PI / 2, 5);
  // WOMEN'S (left of the aisle): round racks near the aisle, four-ways behind, a wall of slatwall with folded tops
  [[-2.15, -10.5], [-2.2, -15.2], [-2.15, -19.8], [-2.2, -27.6], [-2.15, -31.8]].forEach(([x, z], i) => roundRack(m, x, z, 10 + i, WOMENS, [0, 1, 5, 4], i === 1 ? 9 : null));
  [[-4.4, -13], [-4.3, -17.5], [-4.4, -24], [-4.4, -29.5], [-9.6, -12], [-9.9, -18], [-9.6, -24.5], [-9.7, -30.5], [-12.6, -15], [-12.4, -21.5], [-12.8, -28]].forEach(([x, z], i) => (i % 3 === 1 ? roundRack(m, x, z, 30 + i, WOMENS, [1, 5], null) : fourWay(m, x, z, 40 + i, WOMENS, [0, 1, 5, 2], rnd(i) * 0.6)));
  foldTable(m, -2.2, -23.6, 51, WOMENS, "sweater", 0.1, 2);
  // MEN'S (right of the aisle): display tables of folded dress shirts and jeans at the aisle, four-ways and round racks behind
  foldTable(m, 2.15, -10.8, 61, MENS, "shirt", -0.05, 1); foldTable(m, 2.2, -15.4, 62, MENS, "boxed", 0.04, null);
  foldTable(m, 2.15, -19.4, 63, DENIM, "jeans", -0.06, 3); foldTable(m, 2.2, -26.2, 64, MENS, "sweater", 0.05, 2);
  foldTable(m, 2.15, -30.6, 65, MENS, "shirt", -0.03, null);
  [[4.4, -12.8], [4.4, -17.6], [4.3, -23.2], [4.4, -29.2], [9.6, -12.4], [9.8, -18.6], [9.4, -24.6], [9.8, -30.6], [12.6, -15], [12.8, -21.2], [12.4, -27.6]].forEach(([x, z], i) => (i % 3 === 2 ? roundRack(m, x, z, 70 + i, MENS, i === 5 ? [6] : [0, 4], i === 2 ? 0 : null) : fourWay(m, x, z, 80 + i, i % 2 ? DENIM : MENS, i % 2 ? [2, 7] : [0, 3, 4, 6], rnd(i + 5) * 0.6)));
  // the side walls: slatwall with shelves of folded goods (men's right, women's left) and the fitting-room doorway
  for (const s of [-1, 1]) {
    m.box("slat", [s * (X1 - 0.06), 1.3, -20], [0.04, 2.2, 22], "#FFFFFF", { metric: true });
    for (let r = 0; r < 4; r++) { m.box("chrome", [s * (X1 - 0.25), 0.55 + r * 0.5, -20], [0.36, 0.015, 21.6], "#9AA6B4"); for (let k = 0; k < 40; k++) { const z = -30.6 + k * 0.53; for (let i = 0; i < 3; i++) foldPiece(m, "fold", [s * (X1 - 0.25), 0.578 + r * 0.5 + i * 0.045, z], [0.34, 0.045, 0.32], pick(s > 0 ? MENS : WOMENS, rnd(r * 90 + k * 3 + s)), (j) => T.foldCell(Math.floor(j / 4) === 2 ? (r % 2 ? 1 : 0) : 3), -s * Math.PI / 2 + (rnd(r * 7 + k + i) - 0.5) * 0.05); } }
    m.box("paint", [s * (X1 - 0.06), 3.05, -20], [0.06, 0.4, 22.2], "#D3D9E1");
  }
  // HOME (left, behind the cross aisle): towel tables and gondolas of bedding
  [[-2.2, -40.5], [-2.15, -45.5], [-2.2, -51]].forEach(([x, z], i) => foldTable(m, x, z, 90 + i, HOMEC, "towel", 0.05 * (i - 1), i === 0 ? 4 : i === 2 ? 5 : null));
  [[-7.5, -42], [-7.5, -48], [-11.5, -42], [-11.5, -48], [-7.5, -57.5], [-11.5, -57.5]].forEach(([x, z], i) => gondola(m, x, z, 3.2, 100 + i, HOMEC, Math.PI / 2));
  // SHOES (right, behind the cross aisle): the shoe wall, display tables with shoes on risers, fitting benches
  shoeWall(m, X1 - 0.06, -60, -39, 7);
  m.box("slat", [X1 - 0.06, 1.3, -49.5], [0.04, 2.6, 21], "#FFFFFF", { metric: true });
  for (const [x, z] of [[2.3, -41.5], [2.3, -47.5], [2.3, -53.5]]) {
    m.box("wood", [x, 0.4, z], [1.2, 0.8, 0.8], "#FFFFFF", { metric: true });
    for (let k = 0; k < 6; k++) { const px = x - 0.45 + (k % 3) * 0.45, pz = z - 0.2 + Math.floor(k / 3) * 0.4, c = pick(["#1E2330", "#5A3E2A", "#EEF0F3", "#2A3B55", "#7A8798"], rnd(k + z)); m.box("lam", [px, 0.84, pz], [0.14, 0.08, 0.14], "#E9ECF0"); m.box("dark", [px, 0.92, pz], [0.1, 0.06, 0.27], c, { ry: 0.4 }); m.box("dark", [px - 0.02, 0.98, pz - 0.06], [0.08, 0.07, 0.1], c, { ry: 0.4 }); }
  }
  for (const [x, z] of [[9.4, -44], [9.4, -51], [11.9, -44], [11.9, -51]]) { m.box("velvet", [x, 0.22, z], [0.5, 0.12, 2.0], "#2A3858"); m.box("chrome", [x, 0.1, z], [0.42, 0.2, 1.9], "#9AA6B4"); m.box("lam", [x + 0.5, 0.08, z - 0.6], [0.3, 0.02, 0.12], "#3A4250"); }
  // the back: CHILDREN'S racks (left), the CATALOG desk (right)
  [[-2.15, -58], [-2.2, -63], [-5.0, -60.5], [-9.0, -58.5], [-9.2, -64]].forEach(([x, z], i) => roundRack(m, x, z, 120 + i, ["#B9CDE6", "#E8E2EA", "#9FB7D8", "#C9D6E6", "#6F8FB8"], [4, 1, 6], null));
  m.push([9.5, 0, -66.5], 0);
  m.box("lam", [0, 0.55, 0], [5, 1.1, 0.8], "#E3E7EC"); m.box("wood", [0, 1.12, 0], [5.1, 0.04, 0.9], "#FFFFFF", { metric: true });
  m.box("dark", [-1.2, 1.36, -0.1], [0.4, 0.3, 0.04], "#1A1E24"); m.box("screen", [-1.2, 1.36, -0.078], [0.34, 0.24, 0.004], "#FFFFFF");
  m.box("lam", [0, 1.6, -3.35], [6, 3.2, 0.3], "#C3CBD6"); for (let r = 0; r < 4; r++) { m.box("chrome", [0, 0.29 + r * 0.6, -3.05], [5.8, 0.02, 0.36], "#9AA6B4"); for (let k = 0; k < 14; k++) if (rnd(r * 20 + k + 7) < 0.8) m.box("lam", [-2.6 + k * 0.4, 0.3 + r * 0.6 + 0.15 + rnd(r * 20 + k) * 0.05, -3.05], [0.34, 0.3 + rnd(r * 20 + k) * 0.1, 0.3], pick(["#C9B590", "#B9A47E", "#D6C6A2"], rnd(r * 20 + k))); }   // the pickup shelves of parcels
  m.pop();
  // the cross aisle and the vestibule floor are terrazzo too (separate floor meshes); a store directory near the front
  m.push([-2.3, 0, -3.5], 0.3);
  m.box("frame", [0, 0.9, 0], [0.06, 1.8, 0.06], "#2A2E33"); m.box("dark", [0, 0.04, 0], [0.5, 0.04, 0.4], "#2A2E33");
  m.box("dsign", [0, 1.55, 0.035], [0.7, 0.18, 0.01], "#FFFFFF", { rect: T.signCell(8) });
  m.pop();
  buildInteriorDetail(m);
};
// ── V39 detail pass: the interior's finish ─────────────────────────────────────────────────────────────────────────────────
const buildInteriorDetail = (m) => {
  // the terrazzo aisle's border: a darker poured band inside each brass strip, and the carpet's vinyl reducer strip beside it
  for (const s of [-1, 1]) {
    m.box("lam", [s * (AISLE - 0.13), 0.0035, (ZB - 2.8) / 2], [0.2, 0.002, -ZB - 2.8], "#4E5866");
    m.box("dark", [s * (AISLE + 0.05), 0.006, (ZB - 2.8) / 2], [0.06, 0.012, -ZB - 2.8], "#2A3038");
  }
  // perimeter department words on the wall bulkheads over the slatwall (a pale band, navy letters, a light-blue rule)
  const band = (x, z, i, s) => { m.box("lam", [x - s * 0.02, 3.55, z], [0.04, 0.46, 6.4], "#D9E0E8"); m.quad("print", [x - s * 0.045, 3.55, z], 6.24, 0.39, "#FFFFFF", wallCell(i), { ry: -s * Math.PI / 2 }); };
  band(X0 + 0.06, -14, 0, -1); band(X0 + 0.06, -27, 0, -1); band(X1 - 0.06, -14, 1, 1); band(X1 - 0.06, -27, 1, 1);
  band(X0 + 0.06, -50, 2, -1); band(X1 - 0.06, -50, 3, 1);
  // ── the fitting rooms (women's, on the left wall): a framed entrance with its sign, a corridor of louvred doors, the return rack ──
  const FX = X0 + 3.2, FZ0 = -38.4, FZ1 = -31.2;
  m.box("paint", [(X0 + FX) / 2, 1.25, FZ0], [FX - X0, 2.5, 0.12], "#C3CBD6"); m.box("paint", [(X0 + FX) / 2, 1.25, FZ1], [FX - X0, 2.5, 0.12], "#C3CBD6");
  for (const [za, zb] of [[FZ0, -35.5], [-34.1, FZ1]]) m.box("paint", [FX, 1.25, (za + zb) / 2], [0.12, 2.5, zb - za], "#C3CBD6");
  m.box("paint", [FX, 2.38, -34.8], [0.12, 0.24, 1.4], "#C3CBD6");                                     // the header over the opening
  m.box("paint", [(X0 + FX) / 2, 2.52, (FZ0 + FZ1) / 2], [FX - X0, 0.04, FZ1 - FZ0], "#D3D9E1");          // its lid
  for (const zz of [-35.5, -34.1]) m.box("wood", [FX + 0.07, 1.13, zz], [0.04, 2.26, 0.08], "#FFFFFF", { metric: true });   // the casing
  m.box("wood", [FX + 0.07, 2.27, -34.8], [0.04, 0.08, 1.48], "#FFFFFF", { metric: true });
  m.box("dsign", [FX + 0.1, 2.72, -34.8], [0.02, 0.34, 2.0], "#FFFFFF", { rect: T.signCell(7), ry: Math.PI / 2 });
  m.box("dark", [FX + 0.08, 2.72, -34.8], [0.02, 0.38, 2.06], "#0A2547");
  m.box("velvet", [(X0 + FX) / 2 + 0.3, 0.004, -34.8], [FX - X0 - 0.4, 0.004, 1.3], "#30394C");          // the corridor's runner
  for (let k = 0; k < 4; k++) for (const sd of [-1, 1]) {   // the cubicle doors, louvred, with their number plates and hooks
    const dx = X0 + 0.55 + k * 0.7, dz = -34.8 + sd * 0.68;
    m.box("wood", [dx, 1.0, dz], [0.62, 1.7, 0.035], "#E6DCCB", { metric: true });
    for (let l = 0; l < 14; l++) m.box("wood", [dx, 0.35 + l * 0.095, dz - sd * 0.02], [0.52, 0.02, 0.01], "#BFB29D", { r: [sd * 0.5, 0, 0] });
    m.box("tag", [dx, 1.95, dz - sd * 0.02], [0.14, 0.14, 0.006], "#FFFFFF", { rect: doorNoCell(k * 2 + (sd > 0 ? 1 : 0)) });
    m.box("chrome", [dx + 0.22, 1.05, dz - sd * 0.03], [0.03, 0.12, 0.03], "#C9D1DA");
  }
  // the return rack outside the entrance: a chrome bar on two uprights with a few garments left behind, and its sign
  m.push([FX + 1.0, 0, -36.6], Math.PI / 2);
  for (const s of [-1, 1]) { m.box("chrome", [s * 0.6, 0.75, 0], [0.03, 1.5, 0.03], "#C9D1DA"); m.box("chrome", [s * 0.6, 0.02, 0], [0.05, 0.03, 0.5], "#C9D1DA"); }
  m.box("chrome", [0, 1.5, 0], [1.25, 0.025, 0.025], "#C9D1DA");
  for (let i = 0; i < 6; i++) garment(m, [-0.5 + i * 0.17 + rnd(i) * 0.05, 1.49, 0], Math.PI / 2 + (rnd(i + 3) - 0.5) * 0.3, 0.44, 0.7, pick(WOMENS, rnd(i + 70)), [0, 1, 5, 4, 2, 6][i]);
  m.box("tag", [0, 1.72, 0.005], [0.8, 0.2, 0.006], "#FFFFFF", { rect: notice(0) });
  m.pop();
  // ── the service counter's finish: a navy band and kick, a pin pad on a stand at each register, bag stacks, the counter sign ──
  m.push([-6.6, 0, -6.6], 0);
  m.box("lam", [0, 0.86, -0.352], [3.0, 0.1, 0.006], "#0B2F5E"); m.box("lam", [0, 0.5, -0.352], [3.0, 0.008, 0.006], "#7FB4F2");
  for (const s of [-1, 1]) {
    m.box("dark", [s * 0.8 - 0.32, 1.06, -0.18], [0.05, 0.08, 0.05], "#2A2F38");
    m.box("dark", [s * 0.8 - 0.32, 1.14, -0.2], [0.1, 0.16, 0.04], "#1A1E24", { r: [0.35, 0, 0] });
    m.box("screen", [s * 0.8 - 0.32, 1.17, -0.221], [0.07, 0.05, 0.004], "#FFFFFF", { r: [0.35, 0, 0] });
  }
  for (let k = 0; k < 18; k++) m.box("tag", [1.35, 0.32 + k * 0.006, 0.1], [0.36, 0.005, 0.44], "#FFFFFF", { rect: bagCell(0), r: [0, 0.04 * Math.sin(k), 0] });   // folded bags in the bag well
  m.box("tag", [0.0, 1.05 + 0.15, 0.36], [0.34, 0.42, 0.12], "#FFFFFF", { rect: bagCell(0) });            // a filled bag waiting for pick-up
  m.box("chrome", [-1.4, 1.3, -0.2], [0.03, 0.5, 0.03], "#C9D1DA"); m.box("tag", [-1.4, 1.62, -0.2], [0.62, 0.16, 0.01], "#FFFFFF", { rect: notice(1) });
  m.pop();
  // the jewellery cases' backs: a mirrored back wall with a lit valance behind the counters
  // the jewellery department's back wall: a pale panelled wall with a mirror strip, a lit valance and its sign
  m.box("lam", [6.2, 1.25, -8.62], [6.4, 2.5, 0.06], "#D3DBE5");
  for (let k = 0; k < 5; k++) m.box("dark", [3.2 + k * 1.5, 1.25, -8.655], [0.012, 2.5, 0.006], "#9AA6B4");
  m.box("frame", [6.2, 1.45, -8.66], [2.2, 0.9, 0.012], "#B9C3CF"); m.box("mirror", [6.2, 1.45, -8.67], [2.1, 0.8, 0.008], "#DDE6F0");
  m.box("lam", [6.2, 2.6, -8.69], [6.5, 0.22, 0.16], "#E6EBF1"); m.box("caseLit", [6.2, 2.47, -8.76], [6.3, 0.025, 0.04], "#FFFFFF");
  m.quad("dsign", [6.2, 2.6, -8.772], 2.0, 0.2, "#FFFFFF", T.signCell(4), { ry: Math.PI });
  // nesting tables: a lower table tucked in front of three of the aisle tables, with a stack of folded tees
  for (const [x, z, pal, sd] of [[2.75, -12.0, MENS, 3], [-2.8, -24.6, WOMENS, 5], [2.8, -20.7, DENIM, 7]]) {
    m.push([x, 0, z], 0);
    m.box("wood", [0, 0.52, 0], [0.9, 0.035, 0.6], "#FFFFFF", { metric: true });
    for (const [a, b] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) m.box("wood", [a * 0.41, 0.26, b * 0.26], [0.04, 0.52, 0.04], "#C8B092", { metric: true });
    for (let c2 = 0; c2 < 2; c2++) for (let i = 0; i < 5; i++) foldPiece(m, "fold", [-0.2 + c2 * 0.4, 0.56 + 0.038 * (i + 0.5), 0], [0.3, 0.038, 0.36], pick(pal, rnd(sd + c2 * 3 + (i > 2 ? 1 : 0))), (j) => T.foldCell(Math.floor(j / 4) === 2 ? (pal === DENIM ? 4 : 0) : 3), (rnd(sd + i) - 0.5) * 0.06);
    m.pop();
  }
  // the columns' bulkhead caps (a painted band at the ceiling) and a speaker grille / return grilles in the ceiling
  for (const x of [-7.2, 7.2, -14.4, 14.4]) for (const z of [-9, -18, -27, -45, -54, -63]) m.box("paint", [x, CEIL - 0.15, z], [0.64, 0.3, 0.64], "#D3D9E1");
};

// ── the ceiling: tiles, troffers (mostly off; a few warm security lights on), diffusers, sprinklers, camera domes ────────────
export const LIT = [[1.5, -24.0], [-1.5, -20.4], [1.5, -38.4], [-4.5, -13.2], [7.5, -31.2], [-10.5, -38.4], [4.5, -45.6], [-1.5, -56.4], [10.5, -9.6], [-7.5, -27.6], [-13.5, -20.4], [13.5, -16.8], [-4.5, -49.2]];
// V39 rev 1 (Timur: the hook's lights switch off row by row): the main-aisle troffers in TROF_ZONE can be driven per frame — the merged
// ceiling then draws them dark, and <TrofferBank> lays each one's lit lens and glow over it at the level the station gives
export const inTrofZone = (x, z) => Math.abs(x) < 7.6 && z >= -31.3;
export const trofZone = () => { const out = []; for (let i = 0; i < 12; i++) for (let j = 0; j < 19; j++) { const x = -16.5 + i * 3, z = -2.4 - j * 3.6; if (z <= -2.2 && inTrofZone(x, z)) out.push([x, z, j]); } return out; };
const buildCeiling = (m, dyn = false) => {
  const W_ = X1 - X0;
  m.box("ceil", [0, CEIL + 0.01, ZB / 2], [W_, 0.02, -ZB], "#7E8898", { metric: true });
  const isLit = (x, z) => LIT.some(([a, b]) => Math.abs(a - x) < 0.1 && Math.abs(b - z) < 0.1);
  for (let i = 0; i < 12; i++) for (let j = 0; j < 19; j++) {
    const x = -16.5 + i * 3, z = -2.4 - j * 3.6;
    if (z > -2.2) continue;
    const lit = isLit(x, z) && !(dyn && inTrofZone(x, z));
    m.box("cmetal", [x, CEIL - 0.012, z], [0.64, 0.03, 1.24], "#8E98A6");
    m.quad(lit ? "lensL" : "lensD", [x, CEIL - 0.028, z], 0.6, 1.2, "#FFFFFF", [0, 0, 1, 1], { r: [Math.PI / 2, 0, 0] });
    if (lit) m.glow([x, CEIL - 0.2, z], "#FFC68A", 1.4);
    if ((i + j) % 2 === 0) m.quad("diff", [x + 1.5, CEIL - 0.005, z + 1.8], 0.6, 0.6, "#FFFFFF", [0, 0, 1, 1], { r: [Math.PI / 2, 0, 0] });
    if ((i * 7 + j) % 3 === 0) m.cyl("cmetal", [x - 0.9, CEIL - 0.03, z + 0.9], 0.018, 0.05, "#D9DEE5", { seg: 8 });   // a sprinkler head
  }
  // security camera domes and smoke detectors
  for (const [x, z] of [[-2.6, -8], [2.6, -20], [-2.6, -33], [2.6, -48], [-9, -22], [9, -40]]) { m.cyl("cmetal", [x, CEIL - 0.02, z], 0.12, 0.04, "#E8ECF0", { seg: 16 }); m.sph("cmetal", [x, CEIL - 0.04, z], [0.1, 0.08, 0.1], "#1A1E24", { seg: 14 }); }
};
// ── floors (separate meshes: tiling textures) and the aisle's mirror ───────────────────────────────────────────────────────
const Floors = ({ mode }) => {
  const terr = useMemo(() => { const t = T.terrazzoTex().clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.5, 70 / 2.4); t.needsUpdate = true; return t; }, []);
  const terr2 = useMemo(() => { const t = T.terrazzoTex().clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(36 / 2.4, 3 / 2.4); t.needsUpdate = true; return t; }, []);
  const terr3 = useMemo(() => { const t = T.terrazzoTex().clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(36 / 2.4, 4.6 / 2.4); t.needsUpdate = true; return t; }, []);
  const carp = useMemo(() => { const t = T.carpetTex().clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(36, 70); t.needsUpdate = true; return t; }, []);
  const tm = (map) => <meshStandardMaterial map={map} color="#97A2B2" roughness={0.2} metalness={0.05} envMapIntensity={0.15} />;
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.0, ZB / 2]} receiveShadow><planeGeometry args={[X1 - X0, -ZB]} /><meshStandardMaterial map={carp} color="#8F9BB0" roughness={0.95} envMapIntensity={0.08} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.003, ZB / 2 - 1.3]} receiveShadow><planeGeometry args={[AISLE * 2, -ZB - 2.6]} />{tm(terr)}</mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.0025, -36]} receiveShadow><planeGeometry args={[X1 - X0, 3]} />{tm(terr2)}</mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.0025, -2.45]} receiveShadow><planeGeometry args={[X1 - X0, 4.6]} />{tm(terr3)}</mesh>
      {mode === "in" && <Mirror w={AISLE * 2 - 0.06} d={-ZB - 2.6} pos={[0, 0.006, ZB / 2 - 1.3]} />}
      {/* the parking lot, its light and the snowy land around (a_lot.tsx; no planar mirror outside: no mirror copy of the sign) */}
      <LotGround />
    </group>
  );
};
// a planar mirror over the main aisle, faint (polished terrazzo): the doors' glow and the security lights streak in the floor
const Mirror = ({ w, d, pos, opacity = 0.32, color = "#B8C6DA", fadeK = 0.022 }) => {
  const obj = useMemo(() => {
    const shader = {
      ...Reflector.ReflectorShader,
      uniforms: { ...Reflector.ReflectorShader.uniforms, opacity: { value: opacity } },
      vertexShader: Reflector.ReflectorShader.vertexShader.replace("void main() {", "varying float vDepth;\nvoid main() {").replace("gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "vec4 mvp = modelViewMatrix * vec4( position, 1.0 ); vDepth = -mvp.z; gl_Position = projectionMatrix * mvp;"),
      fragmentShader: `uniform vec3 color; uniform sampler2D tDiffuse; uniform float opacity; varying vec4 vUv; varying float vDepth;
        void main() { vec4 base = texture2DProj( tDiffuse, vUv ); float fade = exp( -pow( vDepth * ${fadeK.toFixed(4)}, 2.0 ) );
          gl_FragColor = vec4( base.rgb * color, opacity * fade );
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
    };
    const r = new Reflector(new THREE.PlaneGeometry(w, d), { textureWidth: 540, textureHeight: 960, multisample: 0, color: new THREE.Color(color), clipBias: 0.002, shader });
    r.material.transparent = true; r.material.depthWrite = false; r.renderOrder = 1;
    r.rotation.x = -Math.PI / 2; r.position.set(pos[0], pos[1], pos[2]);
    return r;
  }, []);
  return <primitive object={obj} />;
};
const Ceiling = ({ fade = 0, dyn = false }) => {
  const grp = useMemo(() => { const m = new Mesher(); buildCeiling(m, dyn); return m.build(ceilMats()); }, [dyn]);
  const op = 1 - clamp01(fade);
  for (const k of Object.keys(ceilMats())) { const mm = ceilMats()[k]; mm.transparent = op < 0.999; mm.opacity = op; mm.depthWrite = op > 0.5; }
  if (op <= 0.002) return null;
  return <primitive object={grp} />;
};
/** the driven troffers: level(x, z) 0–1 per light (1 = lit as the security lights are); a lit lens over the dark one, its glow, and
 *  the light it throws into the aisle (an ambient share + three aisle lights, always mounted so the light count never changes) */
const TrofferBank = ({ level }) => {
  const zone = useMemo(trofZone, []);
  const mats = useMemo(() => zone.map(() => new THREE.MeshStandardMaterial({ map: T.lensTex(true), emissiveMap: T.lensTex(true), emissive: new THREE.Color("#FFC88A"),
    emissiveIntensity: 1.1, roughness: 0.3, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4 })), [zone]);
  const lv = zone.map(([x, z]) => clamp01(level(x, z)));
  const rowMean = (zs) => { const L = zone.filter(([, z]) => zs.some((q) => Math.abs(q - z) < 0.1)).map(([x, z]) => clamp01(level(x, z))); return L.reduce((a, b) => a + b, 0) / Math.max(1, L.length); };
  const frac = lv.reduce((a, b) => a + b, 0) / lv.length;
  return (
    <group>
      {zone.map(([x, z], i) => { mats[i].opacity = lv[i]; return lv[i] > 0.003 && (
        <group key={i}>
          <mesh position={[x, CEIL - 0.034, z]} rotation-x={Math.PI / 2} material={mats[i]} renderOrder={2}><planeGeometry args={[0.6, 1.2]} /></mesh>
          <Glow position={[x, CEIL - 0.2, z]} size={1.4} color="#FFC68A" opacity={0.8 * lv[i]} />
        </group>); })}
      <ambientLight intensity={0.32 * frac} color="#FFE2BC" />
      {[[[-2.4, -6.0, -9.6], -6.0], [[-13.2, -16.8], -15.0], [[-27.6, -31.2], -29.4]].map(([zs, zc], i) => (
        <pointLight key={i} position={[0, CEIL - 0.35, zc]} intensity={7 * rowMean(zs)} distance={15} decay={1.5} color="#FFCF96" />
      ))}
    </group>
  );
};
// the Vermont hills: two long ridgelines (a noisy top edge) far behind the store, in the fog
const ridgeGeo = (seed, w, h0, h1, n = 160) => {
  const P = [], I = [];
  for (let i = 0; i <= n; i++) { const u = i / n, x = (u - 0.5) * w; const y = h0 + (h1 - h0) * (0.5 + 0.3 * Math.sin(u * 7.1 + seed) + 0.15 * Math.sin(u * 19.3 + seed * 2) + 0.05 * Math.sin(u * 53 + seed)); P.push(x, -5, 0, x, y, 0); if (i) { const k = i * 2; I.push(k - 2, k, k - 1, k - 1, k, k + 1); } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals(); return g;
};
const Ridges = () => {
  const g1 = useMemo(() => ridgeGeo(1.3, 900, 18, 62), []), g2 = useMemo(() => ridgeGeo(4.1, 900, 30, 90), []);
  return (<group>
    <mesh geometry={g2} position={[40, 0, -330]}><meshBasicMaterial color="#0C2849" side={THREE.DoubleSide} /></mesh>
    <mesh geometry={g1} position={[-30, 0, -210]}><meshBasicMaterial color="#0A2342" side={THREE.DoubleSide} /></mesh>
  </group>);
};
// the conifers and the hills behind the store
const Backdrop = () => (<group><StoreTrees /><Ridges /></group>);
// the sign: white channel letters on the fascia (emissive), a soft halo on the stucco behind them
export const SIGN_AT = [0, 5.62, 0.36];
const StoreSign = () => {
  const tex = useMemo(T.jcpSignTex, []), halo = useMemo(T.jcpHaloTex, []);
  return (
    <group position={SIGN_AT}>
      <mesh position={[0, 0, -0.163]}><planeGeometry args={[8.4, 2.1]} /><meshBasicMaterial map={halo} color="#B3CEEF" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <mesh position={[0.05, -0.06, -0.166]}><planeGeometry args={[7.2, 1.8]} /><meshBasicMaterial map={tex} color="#000000" transparent opacity={0.3} depthWrite={false} /></mesh>
      {/* the letters' returns (aluminium sides, 11 cm deep): stacked cut-outs behind the lit faces */}
      {[0.012, 0.03, 0.05, 0.07, 0.09, 0.11].map((d, i) => <mesh key={i} position={[0, 0, -d]}><planeGeometry args={[7.2, 1.8]} /><meshStandardMaterial map={tex} transparent alphaTest={0.4} color="#2E333B" roughness={0.45} metalness={0.5} /></mesh>)}
      <mesh><planeGeometry args={[7.2, 1.8]} /><meshStandardMaterial map={tex} transparent alphaTest={0.4} color="#FFFFFF" emissive="#FFFFFF" emissiveMap={tex} emissiveIntensity={2.4} roughness={0.4} /></mesh>
    </group>
  );
};

/**
 * THE STORE SET. mode "in" (the closed store at night, the aisle mirror, the security lights) or "out" (the store front at blue hour);
 * cart: { xray, flash, glow } for the bin's reveal; ceilFade 0–1 (the close's rising camera: the ceiling fades under the veil).
 */
export const StoreSet = ({ mode = "in", cart = {}, ceilFade = 0, trof = null }) => {
  const grp = useMemo(() => { const m = new Mesher(); buildStore(m); return m.build(storeMats()); }, []);
  const inside = mode === "in";
  return (
    <group>
      <Sky zenith="#020F24" mid="#0A3366" horizon="#5C8FD0" glowAt={0.52} />
      <Floors mode={mode} />
      <primitive object={grp} />
      <Ceiling fade={ceilFade} dyn={!!trof} />
      {trof && inside && <TrofferBank level={trof} />}
      <StoreSign />
      <LotLamps lights={!inside} />
      <Backdrop />
      <group position={CART.p} rotation-y={CART.ry}><JanitorCart {...cart} /></group>
      {/* the light of the closed store: the warm security troffers (four real lights), the blue of the doors and windows, the
          lit display windows; outside, the canopy's downlights over the doors */}
      {inside && <>
        {[[1.5, -24.0], [-1.5, -20.4], [-4.5, -13.2], [1.5, -38.4]].map(([x, z], i) => <pointLight key={i} position={[x, CEIL - 0.25, z]} intensity={(i < 2 ? 6 : 5) * (trof && inTrofZone(x, z) ? clamp01(trof(x, z)) : 1)} distance={10} decay={1.5} color="#FFCF96" />)}
        <pointLight position={[0, 2.2, -2.6]} intensity={9} distance={22} decay={1.3} color="#6E9FE0" />
        <pointLight position={[-10, 2.6, -3.0]} intensity={5} distance={14} decay={1.4} color="#8FB4E8" />
        <pointLight position={[10, 2.6, -3.0]} intensity={5} distance={14} decay={1.4} color="#8FB4E8" />
      </>}
      {!inside && <>
        <pointLight position={[0, 3.1, 2.2]} intensity={14} distance={9} decay={1.6} color="#FFD6A0" />
        <pointLight position={[-10.3, 2.8, -0.9]} intensity={11} distance={7} decay={1.6} color="#FFD9A8" />
        <pointLight position={[10.3, 2.8, -0.9]} intensity={11} distance={7} decay={1.6} color="#FFD9A8" />
      </>}
    </group>
  );
};
