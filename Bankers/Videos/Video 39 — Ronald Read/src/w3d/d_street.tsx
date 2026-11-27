// @ts-nocheck
// ★ V39 builder D — the STREET KIT of the Brattleboro set (DETAIL pass 2026-11-27), all merged through the town kit's Mesher.
//   Materials used (d_bratt's setMats): iron (black cast iron), lampglass (the lit lantern glass), snow, bank (plowed snow), stone,
//   granite, wood (bench slats), metal, trim.
//   · addLamp(m, x, z, dir)   a cast-iron New England post lamp: an octagonal plinth, a fluted base with collar rings, a tapered
//                             shaft, a capital and ball finial, a scroll-braced arm over the street, a pendant lantern (cap, glass,
//                             finial), snow on the arm, the cap and the plinth. (Its light pool / glow are drawn by the set.)
//   · addBench / addHydrant / addTrash / addPlanterBox   park bench (cast-iron ends, wood slats, snow on the seat and the top
//                             rail), a dry-barrel hydrant (flange, barrel, bonnet and nut, hose and pumper nozzles with caps and
//                             chains, snow on the bonnet), a slatted steel litter can with its dome lid, a granite planter
//   · addSnowbank(m, x0, x1, z, …)   the plowed bank along a curb: overlapping flattened mounds, gaps where asked
//   · addCurb(m, x0, x1, z)    a granite curb with its arris and the gutter line
import * as THREE from "three";
import { rnd } from "./kit";

const G = {};
const gMound = () => G.mound ??= new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2);
const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();
const IRON = "#FFFFFF";
/** a flattened mound of snow (half-ellipsoid) */
export const mound = (m, mat, p, s, ry = 0, color = "#FFFFFF") => m.add(mat, gMound(), new THREE.Matrix4().compose(_p.set(p[0], p[1], p[2]), _q.setFromEuler(_e.set(0, ry, 0)), _s.set(s[0], s[1], s[2])), color, { metric: false });
/** a snow layer lying on a ledge whose top is at y: a slab and a softer crown */
export const snowLedge = (m, x, y, z, w, d, h = 0.06, ry = 0) => {
  m.box("snow", [x, y + h / 2, z], [w, h, d], "#FFFFFF", { metric: true, ry });
  m.box("snow", [x, y + h + 0.012, z], [w * 0.9, 0.025, d * 0.66], "#FFFFFF", { metric: true, ry });
};
/** a tube from a to b (radius r) */
const tube = (m, mat, a, b, r, color, seg = 8) => {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), len = d.length();
  _q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  m.add(mat, G["t" + seg] ??= new THREE.CylinderGeometry(1, 1, 1, seg, 1, false), new THREE.Matrix4().compose(_p.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), _q, _s.set(r, len, r)), color);
};

// ── the lamp post: frame at (x, PL, z), the arm reaching along +z (dir = 1) or −z (dir = −1) ───────────────────────────────
export const LAMP_H = 5.1, LAMP_ARM = 1.05;
export const addLamp = (m, x, y, z, dir = 1) => {
  m.push([x, y, z], dir > 0 ? 0 : Math.PI);
  m.cyl("iron", [0, 0.08, 0], 0.27, 0.16, IRON, { seg: 8 });                                   // the octagonal plinth
  m.cyl("iron", [0, 0.2, 0], 0.22, 0.08, IRON, { seg: 12 });
  m.cyl("iron", [0, 0.68, 0], 0.18, 0.9, IRON, { rt: 0.72, rb: 1, seg: 16 });                 // the fluted base
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; m.box("iron", [Math.cos(a) * 0.148, 0.7, Math.sin(a) * 0.148], [0.03, 0.78, 0.03], IRON, { ry: -a }); }
  for (const [yy, r] of [[1.16, 0.15], [1.24, 0.12], [1.3, 0.1]]) m.cyl("iron", [0, yy, 0], r, 0.06, IRON, { seg: 12 });
  m.cyl("iron", [0, 1.3 + 1.6, 0], 0.075, 3.2, IRON, { rt: 0.62, rb: 1, seg: 12 });           // the shaft
  for (const [yy, r] of [[4.5, 0.075], [4.56, 0.09], [4.62, 0.065]]) m.cyl("iron", [0, yy, 0], r, 0.05, IRON, { seg: 14 });
  m.cyl("iron", [0, 4.9, 0], 0.048, 0.6, IRON, { seg: 10 });
  m.sph("iron", [0, 5.24, 0], 0.08, IRON, { seg: 12 }); m.cyl("iron", [0, 5.38, 0], 0.012, 0.18, IRON, { rt: 0.2, rb: 1, seg: 6 });
  // the arm and its scroll brace
  const ay = 4.95;
  tube(m, "iron", [0, ay, 0], [0, ay, LAMP_ARM + 0.05], 0.028, IRON);
  let prev = null;
  for (let k = 0; k <= 8; k++) {   // a quarter-circle brace curling from the shaft up under the arm, ending in a small scroll
    const a = (k / 8) * Math.PI * 0.5, R = 0.55, p = [0, ay - R + Math.sin(a) * R * 0.98, 0.04 + (1 - Math.cos(a)) * R * 1.1];
    if (prev) tube(m, "iron", prev, p, 0.014, IRON, 6); prev = p;
  }
  for (let k = 0; k <= 6; k++) { const a = (k / 6) * Math.PI * 1.6, r = 0.08 * (1 - k / 8), p = [0, ay - 0.1 + Math.sin(a) * r, 0.62 + Math.cos(a) * r]; if (k) tube(m, "iron", prev, p, 0.01, IRON, 5); prev = p; }
  m.sph("iron", [0, ay, LAMP_ARM + 0.06], 0.035, IRON, { seg: 8 });
  // the pendant lantern
  const lz = LAMP_ARM - 0.02;
  m.cyl("iron", [0, ay - 0.1, lz], 0.012, 0.2, IRON, { seg: 6 });
  m.cyl("iron", [0, ay - 0.24, lz], 0.26, 0.12, IRON, { rt: 0.35, rb: 1, seg: 16 });           // the cap
  m.cyl("iron", [0, ay - 0.31, lz], 0.27, 0.03, IRON, { seg: 12 });
  m.cyl("lampglass", [0, ay - 0.55, lz], 0.21, 0.44, "#FFFFFF", { rt: 1, rb: 0.55, seg: 16 }); // the lit glass
  for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + Math.PI / 4; m.box("iron", [Math.cos(a) * 0.17, ay - 0.55, lz + Math.sin(a) * 0.17], [0.018, 0.44, 0.018], IRON, { ry: -a }); }
  m.cyl("iron", [0, ay - 0.79, lz], 0.12, 0.05, IRON, { seg: 12 }); m.sph("iron", [0, ay - 0.84, lz], 0.04, IRON, { seg: 8 });
  m.glow([0, ay - 0.55, lz], "#FFC98A", 1.6);
  // snow on the arm, the cap, the plinth
  tube(m, "snow", [0, ay + 0.03, 0.08], [0, ay + 0.03, LAMP_ARM - 0.1], 0.02, "#FFFFFF", 6);
  m.cyl("snow", [0, ay - 0.17, lz], 0.12, 0.04, "#FFFFFF", { seg: 12 });
  m.cyl("snow", [0, 0.25, 0], 0.2, 0.03, "#FFFFFF", { seg: 12 });
  m.pop();
};
// ── the bench (frame at its seat front centre on the ground, facing +z) ──────────────────────────────────────────────────────
export const addBench = (m, x, y, z, ry = 0, len = 1.7) => {
  m.push([x, y, z], ry);
  for (const sd of [-1, 1]) {   // cast-iron ends: front leg, back leg, seat bracket, armrest
    const ex = sd * (len / 2 - 0.12);
    m.box("iron", [ex, 0.22, 0.12], [0.05, 0.44, 0.05], IRON); m.box("iron", [ex, 0.22, -0.28], [0.05, 0.44, 0.05], IRON);
    m.box("iron", [ex, 0.43, -0.08], [0.05, 0.05, 0.48], IRON);
    m.box("iron", [ex, 0.68, -0.36], [0.05, 0.52, 0.05], IRON, { r: [-0.18, 0, 0] });
    m.box("iron", [ex, 0.64, 0.0], [0.05, 0.04, 0.42], IRON); m.box("iron", [ex, 0.54, 0.17], [0.05, 0.2, 0.04], IRON);
    m.cyl("iron", [ex, 0.03, 0.12], 0.05, 0.06, IRON, { seg: 8 }); m.cyl("iron", [ex, 0.03, -0.28], 0.05, 0.06, IRON, { seg: 8 });
  }
  for (let k = 0; k < 4; k++) m.box("wood", [0, 0.46, 0.13 - k * 0.11], [len, 0.035, 0.085], "#FFFFFF");
  for (let k = 0; k < 3; k++) m.box("wood", [0, 0.6 + k * 0.13, -0.33 - k * 0.025], [len, 0.09, 0.03], "#FFFFFF", { r: [-0.18, 0, 0] });
  snowLedge(m, 0, 0.478, -0.03, len * 0.97, 0.4, 0.05);
  m.box("snow", [0, 0.88, -0.39], [len * 0.95, 0.04, 0.05], "#FFFFFF", { metric: true });
  m.pop();
};
// ── the hydrant ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const addHydrant = (m, x, y, z, ry = 0, col = "#B8902E") => {
  m.push([x, y, z], ry);
  m.cyl("metal", [0, 0.04, 0], 0.17, 0.08, col, { seg: 12 }); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; m.cyl("metal", [Math.cos(a) * 0.14, 0.09, Math.sin(a) * 0.14], 0.016, 0.03, "#6A5A2A", { seg: 6 }); }
  m.cyl("metal", [0, 0.38, 0], 0.115, 0.6, col, { rt: 0.94, rb: 1, seg: 18 });
  m.cyl("metal", [0, 0.7, 0], 0.135, 0.05, col, { seg: 18 });
  m.sph("metal", [0, 0.73, 0], [0.12, 0.1, 0.12], col, { seg: 14 });
  m.cyl("metal", [0, 0.86, 0], 0.03, 0.07, "#8A6A20", { seg: 5 });                                 // the operating nut (pentagon)
  for (const sd of [-1, 1]) {
    m.cyl("metal", [sd * 0.15, 0.5, 0], 0.05, 0.1, col, { r: [0, 0, Math.PI / 2], seg: 12 });
    m.cyl("metal", [sd * 0.21, 0.5, 0], 0.055, 0.04, "#8A6A20", { r: [0, 0, Math.PI / 2], seg: 6 });
    for (let k = 0; k < 4; k++) m.sph("metal", [sd * (0.18 - k * 0.02), 0.44 - k * 0.025, 0.06], 0.008, "#5A4A20", { seg: 5 });   // the cap chain
  }
  m.cyl("metal", [0, 0.44, 0.15], 0.07, 0.12, col, { r: [Math.PI / 2, 0, 0], seg: 12 }); m.cyl("metal", [0, 0.44, 0.22], 0.08, 0.04, "#8A6A20", { r: [Math.PI / 2, 0, 0], seg: 6 });
  m.cyl("snow", [0, 0.81, 0], 0.09, 0.04, "#FFFFFF", { seg: 12 });
  mound(m, "snow", [0, 0, 0], [0.42, 0.12, 0.4]);
  m.pop();
};
// ── the litter can: vertical steel slats round a liner, two bands, a dome lid ──────────────────────────────────────────────
export const addTrash = (m, x, y, z, col = "#24364C") => {
  m.push([x, y, z], 0);
  m.cyl("metal", [0, 0.45, 0], 0.25, 0.86, "#121A24", { seg: 14 });
  for (let k = 0; k < 20; k++) { const a = (k / 20) * Math.PI * 2; m.box("metal", [Math.cos(a) * 0.27, 0.46, Math.sin(a) * 0.27], [0.045, 0.84, 0.018], col, { ry: -a + Math.PI / 2 }); }
  for (const yy of [0.12, 0.8]) m.cyl("metal", [0, yy, 0], 0.285, 0.05, col, { seg: 20 });
  m.sph("metal", [0, 0.9, 0], [0.3, 0.14, 0.3], col, { seg: 12 }); m.box("metal", [0, 0.92, 0.23], [0.22, 0.1, 0.08], "#0A1018");
  m.sph("snow", [0, 0.96, 0], [0.24, 0.09, 0.24], "#FFFFFF", { seg: 12 });
  m.pop();
};
/** a granite planter with a snowy shrub mound (the tree inside it is added by the caller) */
export const addPlanterBox = (m, x, y, z, w = 1.2, d = 1.2) => {
  m.box("granite", [x, y + 0.3, z], [w, 0.6, d], "#B9BEC6", { metric: true });
  m.box("granite", [x, y + 0.62, z], [w + 0.08, 0.06, d + 0.08], "#C9CED6", { metric: true });
  snowLedge(m, x, y + 0.65, z, w - 0.06, d - 0.06, 0.08);
  mound(m, "snow", [x, y + 0.7, z], [w * 0.4, 0.22, d * 0.4]);
};
// ── the plowed bank along a curb (x0 → x1 at z), leaving gaps [[a, b], …] ─────────────────────────────────────────────────────
export const addSnowbank = (m, x0, x1, z, { y = 0, gaps = [], seed = 1, w = 0.55, hgt = 0.42, mat = "bank" } = {}) => {
  let i = 0;
  for (let x = x0; x < x1; x += 0.7 + rnd(seed + i * 3) * 0.5, i++) {
    if (gaps.some(([a, b]) => x > a && x < b)) continue;
    const s = [0.9 + rnd(seed + i * 5) * 0.9, hgt * (0.45 + rnd(seed + i * 7) * 0.5) * (0.7 + 0.3 * Math.sin(x * 0.37 + seed)), w * (0.75 + rnd(seed + i * 11) * 0.45)];
    mound(m, mat, [x, y - 0.02, z + (rnd(seed + i * 13) - 0.5) * 0.18], s, (rnd(seed + i) - 0.5) * 0.5);
  }
};
/** a granite curb from x0 to x1, its face toward +z (dir 1) or −z (dir −1) at z; the sidewalk top at y */
export const addCurb = (m, x0, x1, z, y, dir = 1) => {
  m.box("granite", [(x0 + x1) / 2, y / 2 - 0.05, z], [x1 - x0, y + 0.1, 0.16], "#A9AFB8", { metric: true });
  m.box("granite", [(x0 + x1) / 2, y - 0.005, z + dir * 0.07], [x1 - x0, 0.012, 0.03], "#C3C9D1", { metric: true });   // the worn arris
};
