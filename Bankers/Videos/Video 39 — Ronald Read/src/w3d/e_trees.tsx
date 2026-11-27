// @ts-nocheck
// ★ V39 builder E — THE SHARED TREE MODULE for the farm, the gas station and the yard (Timur, 2026-11-27: "the trees, make them a lot
//   more realistic. Right now there's just triangles"). No cones anywhere:
//   <Conifers items>   snowy New England conifers: BALSAM FIR (narrow spire, dense flat sprays), SPRUCE (conical, branches drooping and
//                      turning up at the tips) and EASTERN WHITE PINE (open horizontal tiers of long soft plumes, an irregular crown).
//                      Each tree: a tapering trunk with bark, whorls of real limbs, each limb dressed with needle-spray cards (a canvas
//                      atlas of drawn needles; alpha-tested, shadow-casting through the cutouts), snow lying in lumps along the upper
//                      side of the boughs, a dark inner crown so it never reads see-through. Several seeded variants per species,
//                      instanced (each instance rotated/scaled differently); far trees use a lighter variant of the same species.
//   <Maples items>     bare winter sugar maples: a flared trunk, ascending limbs branching recursively (da Vinci taper) down to fine
//                      twigs, the last twigs as a soft line haze, a thin crust of snow on the upper side of the big limbs. Every maple is
//                      grown from its own seed (no two alike), merged into one mesh per tree.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";

// ── a tiny geometry builder (positions, normals, uvs, colours, indices) ───────────────────────────────────────────────────────
class GB {
  constructor() { this.p = []; this.n = []; this.u = []; this.c = []; this.i = []; }
  v(p, n, u, c) { this.p.push(p[0], p[1], p[2]); this.n.push(n[0], n[1], n[2]); this.u.push(u[0], u[1]); this.c.push(c[0], c[1], c[2]); return this.p.length / 3 - 1; }
  tri(a, b, c) { this.i.push(a, b, c); }
  geo() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(this.u, 2)); g.setAttribute("color", new THREE.Float32BufferAttribute(this.c, 3));
    g.setIndex(this.i); g.computeBoundingSphere(); g.computeBoundingBox();
    return g;
  }
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const col = (hex, k = 1) => { const c = new THREE.Color(hex); return [c.r * k, c.g * k, c.b * k]; };
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
/** a tapered tube along a polyline of points (radius per point), `sides` round, uv u around × v along (metres) */
const tube = (gb, pts, rads, sides, uvRect, c0, c1 = c0, vScale = 1) => {
  const n = pts.length;
  let prevN = null;
  const rings = [];
  let vacc = 0;
  for (let k = 0; k < n; k++) {
    const t = k === 0 ? pts[1].clone().sub(pts[0]) : k === n - 1 ? pts[n - 1].clone().sub(pts[n - 2]) : pts[k + 1].clone().sub(pts[k - 1]);
    t.normalize();
    let nn = prevN ? prevN.clone().sub(t.clone().multiplyScalar(prevN.dot(t))) : (Math.abs(t.y) < 0.9 ? UP.clone() : V(1, 0, 0)).cross(t);
    if (nn.lengthSq() < 1e-8) nn = V(1, 0, 0).cross(t);
    nn.normalize(); prevN = nn;
    const bn = t.clone().cross(nn).normalize();
    if (k > 0) vacc += pts[k].distanceTo(pts[k - 1]);
    const ring = [];
    const cc = mixc(c0, c1, k / (n - 1));
    for (let s = 0; s <= sides; s++) {
      const a = (s / sides) * Math.PI * 2, d = nn.clone().multiplyScalar(Math.cos(a)).add(bn.clone().multiplyScalar(Math.sin(a)));
      const p = pts[k].clone().add(d.clone().multiplyScalar(rads[k]));
      ring.push(gb.v([p.x, p.y, p.z], [d.x, d.y, d.z], [uvRect[0] + (uvRect[2] - uvRect[0]) * (s / sides), uvRect[1] + ((vacc * vScale) % 1) * (uvRect[3] - uvRect[1])], cc));
    }
    rings.push(ring);
  }
  for (let k = 0; k < n - 1; k++) for (let s = 0; s < sides; s++) { const a = rings[k][s], b = rings[k][s + 1], c = rings[k + 1][s], d = rings[k + 1][s + 1]; gb.tri(a, c, b); gb.tri(b, c, d); }
};
/** a two-sided card (quad) centred at c, spanning ±u/2 along axis U and ±w/2 along W; shading normal nn (both faces), uv rect */
const card = (gb, c, U, W, len, wid, nn, r, cc, flip = false) => {
  const a = c.clone().sub(U.clone().multiplyScalar(len / 2)), b = c.clone().add(U.clone().multiplyScalar(len / 2));
  const h = W.clone().multiplyScalar(wid / 2);
  const P = [a.clone().sub(h), b.clone().sub(h), b.clone().add(h), a.clone().add(h)];
  const T = flip ? [[r[0], r[3]], [r[2], r[3]], [r[2], r[1]], [r[0], r[1]]] : [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]];
  const ids = P.map((p, k) => gb.v([p.x, p.y, p.z], [nn.x, nn.y, nn.z], T[k], cc));
  gb.tri(ids[0], ids[1], ids[2]); gb.tri(ids[0], ids[2], ids[3]);
  const ids2 = P.map((p, k) => gb.v([p.x, p.y, p.z], [nn.x, nn.y, nn.z], T[k], cc));
  gb.tri(ids2[0], ids2[2], ids2[1]); gb.tri(ids2[0], ids2[3], ids2[2]);
};
/** a lump of snow lying along a bough: a flattened, slightly irregular half-ellipsoid on the bough's upper side */
const lump = (gb, c, U, len, wid, th, r, cc, seed) => {
  const W = U.clone().cross(UP).normalize(), Nn = W.clone().cross(U).normalize();   // Nn ≈ up
  const segU = 5, segA = 5, ring = [];
  for (let i = 0; i <= segU; i++) {
    const t = i / segU - 0.5, sx = Math.sqrt(Math.max(0, 1 - 4 * t * t));
    const row = [];
    for (let j = 0; j <= segA; j++) {
      const a = (j / segA) * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
      const wob = 1 + 0.18 * Math.sin(seed * 7 + i * 2.1 + j * 1.7);
      const p = c.clone().add(U.clone().multiplyScalar(t * len)).add(W.clone().multiplyScalar(ca * wid * 0.5 * sx * wob)).add(Nn.clone().multiplyScalar(sa * th * sx * wob));
      const nrm = W.clone().multiplyScalar(ca).add(Nn.clone().multiplyScalar(sa * 1.4)).normalize();
      row.push(gb.v([p.x, p.y, p.z], [nrm.x, nrm.y, nrm.z], [r[0] + (r[2] - r[0]) * (j / segA), r[1] + (r[3] - r[1]) * (i / segU)], cc));
    }
    ring.push(row);
  }
  for (let i = 0; i < segU; i++) for (let j = 0; j < segA; j++) { const a = ring[i][j], b = ring[i][j + 1], c2 = ring[i + 1][j], d = ring[i + 1][j + 1]; gb.tri(a, b, c2); gb.tri(b, d, c2); }
};

// ── the needle atlas (2048 × 2048): 8 spray cells of 1024 × 384 (2 columns × 4 rows; the cell's aspect = a card's) + a strip of
//   snow and bark at the foot (y 1536–2048). Cells: 0 fir/spruce spray, side, no snow · 1 the same, snow along its upper edge ·
//   2 fir/spruce spray seen from above, snow lying in clumps · 3 white-pine plume, no snow · 4 white-pine plume, snow on its upper edge ·
//   5 white-pine plume from above, snow · 6 dead lower twigs (bare, grey) · 7 fir/spruce spray, light dusting
const AT = { W: 2048, H: 2048, cw: 1024, ch: 384 };
const rowRect = (k) => { const cx = (k % 2) * AT.cw, cy = Math.floor(k / 2) * AT.ch; return [(cx + 3) / AT.W, 1 - (cy + AT.ch - 3) / AT.H, (cx + AT.cw - 3) / AT.W, 1 - (cy + 3) / AT.H]; };
const STRIP = 4 * AT.ch;
const SNOW_R = [0.02, 6 / AT.H, 0.48, (AT.H - STRIP) / AT.H - 6 / AT.H];
const BARK_R = [0.52, 6 / AT.H, 0.98, (AT.H - STRIP) / AT.H - 6 / AT.H];
const GREENS = ["#14261C", "#182E21", "#1D3526", "#13231B", "#22392A", "#11231A", "#26402E"];
const drawSpray = (c, x0, y0, w, h, o, seed) => {
  // the twig: from the base (left) to the tip (right), a slight arch; side shoots in a flat fan filling the card (fir/spruce sprays
  // are flat fans; the white pine's are soft plumes of long needles in bundles)
  const cy = y0 + h * 0.52, L = w * 0.94, pine = o.pine;
  const pts = []; for (let i = 0; i <= 40; i++) { const t = i / 40; pts.push([x0 + w * 0.03 + t * L, cy - Math.sin(t * Math.PI) * h * 0.05 + (o.droop ?? 0) * t * t * h * 0.08]); }
  const at = (t) => { const k = Math.min(39, Math.floor(t * 40)), f = t * 40 - k; return [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f]; };
  const needle = (x, y, a, len, shade) => { c.strokeStyle = shade; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); c.stroke(); };
  c.lineCap = "round";
  const shoots = [];
  const nS = pine ? 12 : 18;
  for (let s = 0; s < nS; s++) {
    const t = 0.04 + (s / nS) * 0.86, side = s % 2 ? 1 : -1, [bx, by] = at(t);
    const len = h * (pine ? 0.36 : 0.42) * (1 - t * 0.55) * (0.85 + rnd(seed + s) * 0.3);
    const ang = side * (0.62 + rnd(seed + s * 3) * 0.3);
    shoots.push({ bx, by, len, ang, t });
  }
  const drawShoot = (bx, by, len, ang, depth) => {
    const steps = Math.max(5, Math.floor(len / (pine ? 9 : 5)));
    for (let k = 0; k <= steps; k++) {
      const t = k / steps, x = bx + Math.cos(ang) * len * t, y = by + Math.sin(ang) * len * t;
      const tipLight = t > 0.7 ? (t - 0.7) / 0.3 : 0;
      for (const sd of [-1, 1]) {
        const nl = (pine ? 70 + rnd(seed + k * 7 + sd) * 30 : 26 + rnd(seed + k * 7 + sd) * 10) * (1 - 0.3 * t) * (depth ? 0.85 : 1);
        const na = ang + sd * (pine ? 0.3 + rnd(seed + k) * 0.25 : 0.85 + rnd(seed + k) * 0.35);
        c.lineWidth = pine ? 2.2 : 4.2;
        needle(x, y, na, nl, GREENS[Math.floor(rnd(seed + k * 13 + sd * 5) * GREENS.length)]);
        if (tipLight > 0 && rnd(seed + k * 3 + sd) < 0.7) { c.lineWidth = pine ? 1.8 : 3; needle(x, y, na, nl * 0.85, `rgba(96,128,94,${0.55 * tipLight})`); }
        if (!pine && rnd(seed + k * 17 + sd) < 0.45) { c.lineWidth = 2; needle(x, y, na - sd * 0.22, nl * 0.8, "rgba(150,176,160,0.28)"); }   // pale stomatal glint
      }
      if (pine) for (let q = 0; q < 3; q++) { c.lineWidth = 2; needle(x, y, ang + (rnd(seed + k * 5 + q) - 0.5) * 0.7, 60 + rnd(seed + q + k) * 30, GREENS[(k + q) % GREENS.length]); }
    }
    c.strokeStyle = "#3A2C22"; c.lineWidth = depth ? 3 : 6; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + Math.cos(ang) * len, by + Math.sin(ang) * len); c.stroke();
  };
  for (const s of shoots) drawShoot(s.bx, s.by, s.len, s.ang, 1);
  for (let i = 0; i < 40; i++) { const [x, y] = pts[i], [x2, y2] = pts[i + 1]; drawShoot(x, y, Math.hypot(x2 - x, y2 - y) * 1.05, Math.atan2(y2 - y, x2 - x), 0); }
  const blob = (x, y, rx, ry) => {
    const g = c.createRadialGradient(x - rx * 0.2, y - ry * 0.45, 1, x, y, Math.max(rx, ry));
    g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.55, "#EEF3FA"); g.addColorStop(1, "#B4C4D8");
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill();
  };
  if (o.snowEdge) {
    // a cushion of snow riding along the upper side of the twig and of the upper shoots (thick at the base, thinning to the tip)
    for (let i = 0; i < 90; i++) {
      const t = 0.03 + rnd(seed + i * 11) * 0.88, [x, y] = at(t), th = h * (0.11 + 0.1 * (1 - t)) * (0.7 + rnd(seed + i) * 0.5);
      blob(x, y - th * 0.5, 26 * (1.3 - t * 0.6) + rnd(seed + i * 3) * 18, th * 0.55);
    }
    for (const s of shoots) if (s.ang < 0) for (let k = 0; k < 5; k++) { const t = 0.1 + k * 0.17; blob(s.bx + Math.cos(s.ang) * s.len * t, s.by + Math.sin(s.ang) * s.len * t - 8, 18 + rnd(seed + k) * 12, 10 + rnd(seed + k + 1) * 6); }
  }
  if (o.snowTop || o.dust) {
    // seen from above: soft clumps lying in the fan, heaviest along the twig (a light dusting: small, few)
    const n = o.dust ? 30 : 70;
    for (let i = 0; i < n; i++) {
      const t = 0.04 + rnd(seed + i * 7) * 0.86, [x, y] = at(t), off = (rnd(seed + i * 5) - 0.5) * h * 0.7 * (1 - t * 0.45);
      const k = o.dust ? 0.45 : 1;
      blob(x + (rnd(seed + i) - 0.5) * 20, y + off, (24 + rnd(seed + i * 3) * 40 * (1 - t * 0.5)) * k, (14 + rnd(seed + i * 9) * 24 * (1 - t * 0.4)) * k);
    }
  }
};
const drawDeadTwigs = (c, x0, y0, w, h, seed) => {
  c.lineCap = "round";
  const br = (x, y, a, len, wd, d) => { const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; c.strokeStyle = `rgba(${70 + d * 8},${62 + d * 7},${56 + d * 6},0.95)`; c.lineWidth = wd; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke(); if (d > 0) for (let k = 0; k < 3; k++) { const t = 0.3 + k * 0.25; br(x + (x2 - x) * t, y + (y2 - y) * t, a + (k % 2 ? 1 : -1) * (0.6 + rnd(seed + d * 9 + k) * 0.4), len * 0.42, wd * 0.6, d - 1); } };
  br(x0 + 6, y0 + h * 0.5, 0, w * 0.95, 8, 3);
};
let ATLAS = null;
const treeAtlas = () => ATLAS ??= canvasTex("e_tree_atlas_v2", AT.W, AT.H, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  const cell = (k) => [(k % 2) * AT.cw, Math.floor(k / 2) * AT.ch, AT.cw, AT.ch];
  drawSpray(c, ...cell(0), {}, 11);
  drawSpray(c, ...cell(1), { snowEdge: true }, 23);
  drawSpray(c, ...cell(2), { snowTop: true }, 37);
  drawSpray(c, ...cell(3), { pine: true, droop: 1 }, 41);
  drawSpray(c, ...cell(4), { pine: true, droop: 1, snowEdge: true }, 53);
  drawSpray(c, ...cell(5), { pine: true, snowTop: true }, 67);
  drawDeadTwigs(c, ...cell(6), 71);
  drawSpray(c, ...cell(7), { dust: true }, 83);
  // the strip: snow (opaque, faint sparkle and blue shadow pits) and bark (grey-brown scaly plates, dark fissures)
  const y0 = STRIP, sh = h - y0;
  c.fillStyle = "#F1F5FA"; c.fillRect(0, y0, w / 2, sh);
  for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.6 ? "150,170,200" : "255,255,255"},${0.05 + rnd(i + 1) * 0.12})`; c.fillRect(rnd(i + 2) * (w / 2), y0 + rnd(i + 3) * sh, 2 + rnd(i) * 3, 2); }
  c.fillStyle = "#5E5348"; c.fillRect(w / 2, y0, w / 2, sh);
  for (let i = 0; i < 1400; i++) { const x = w / 2 + rnd(i) * (w / 2), y = y0 + rnd(i + 1) * sh; c.fillStyle = `rgba(${rnd(i + 2) < 0.5 ? "40,32,26" : "140,128,116"},${0.3 + rnd(i + 3) * 0.4})`; c.fillRect(x, y, 10 + rnd(i + 4) * 34, 4 + rnd(i + 5) * 12); }
  for (let i = 0; i < 160; i++) { c.fillStyle = "rgba(22,16,12,0.75)"; c.fillRect(w / 2 + rnd(i * 7) * (w / 2), y0, 2 + rnd(i) * 3, sh); }
});

// ── a conifer variant ────────────────────────────────────────────────────────────────────────────────────────────────────────
//   built at unit scale: 10 m tall; the instance scale `s` of an item is the old pine's (≈ 5.6 m per unit), so 10 m × s × 0.56
const SPECIES = {
  //          crown radius at the base (× height), whorl gap, branches per whorl, droop, upturn, first live whorl, spire, atlas rows
  fir:    { rBase: 0.2, gap: 0.3, nb: [6, 8], droop: 0.25, up: 0.15, live: 0.1, spire: 0.12, rows: [0, 1, 2, 7], ncard: 4, needle: "#22392B", bark: "#6E6258" },
  spruce: { rBase: 0.25, gap: 0.32, nb: [6, 8], droop: 0.55, up: 0.35, live: 0.07, spire: 0.07, rows: [0, 1, 2, 7], ncard: 4, needle: "#1F3528", bark: "#5E544A" },
  pine:   { rBase: 0.32, gap: 0.75, nb: [4, 6], droop: 0.12, up: 0.2, live: 0.3, spire: 0.04, rows: [3, 4, 5, 3], ncard: 3, needle: "#273E2E", bark: "#4E463E" }
};
const coniferGeo = (kind, seed, far = false) => {
  const S = SPECIES[kind], R = (k) => rnd(seed * 101 + k * 7 + 3);
  const gb = new GB(), H = 10;
  const barkC = col(S.bark), snowC = col("#F3F7FC"), coreC = col("#16291F");
  // the trunk: a gentle lean and sweep (white pines more), tapering to the leader
  const lean = V((R(1) - 0.5) * (kind === "pine" ? 0.5 : 0.15), 0, (R(2) - 0.5) * (kind === "pine" ? 0.5 : 0.15));
  const axis = (t) => V(lean.x * t * t + Math.sin(t * 5 + seed) * 0.05 * (kind === "pine" ? 1 : 0.3), t * H, lean.z * t * t);
  const tpts = [], trad = [];
  for (let k = 0; k <= 8; k++) { const t = (k / 8) * 0.96; tpts.push(axis(t)); trad.push((0.2 + (kind === "pine" ? 0.06 : 0)) * Math.pow(1 - t, 1.15) + 0.008); }
  tpts[0].y -= 0.3;
  tube(gb, tpts, trad, far ? 5 : 8, BARK_R, barkC, mixc(barkC, coreC, 0.3), 0.6);
  const crownR = (t) => {   // crown radius at height fraction t (above the first live whorl)
    const u = (t - S.live) / (1 - S.live);
    if (u < 0) return 0;
    if (kind === "pine") return S.rBase * H * (0.55 + 0.45 * Math.sin(Math.min(1, u * 1.3) * Math.PI * 0.85)) * (1 - u * 0.55) * (u > 0.85 ? (1 - u) / 0.15 : 1);
    return S.rBase * H * Math.pow(1 - u, kind === "fir" ? 1.05 : 0.95) * (1 + 0.08 * Math.sin(u * 9 + seed));
  };
  // dead lower twigs on the bare trunk below the live crown (the look of a forest-grown conifer)
  const deadTop = S.live * H;
  if (!far) for (let k = 0; k < 10; k++) {
    const y = 1.0 + (k / 10) * (deadTop - 1.0), a = R(500 + k) * Math.PI * 2, L = 0.4 + R(510 + k) * 0.6;
    if (y < 0.8) continue;
    const base = axis(y / H), U = V(Math.cos(a), -0.15, Math.sin(a)).normalize(), Wv = U.clone().cross(UP).normalize();
    card(gb, base.clone().add(U.clone().multiplyScalar(L / 2)), U, Wv.clone().multiplyScalar(0.4).add(UP).normalize(), L, L * 0.3, V(Math.cos(a), 0.4, Math.sin(a)).normalize(), rowRect(6), col("#8A8279"));
  }
  // the whorls of live boughs, bottom to top
  const gap = S.gap * (far ? 1.3 : 1);
  let y = deadTop, wi = 0;
  while (y < H * (1 - S.spire * 0.6)) {
    const t = y / H, cr = crownR(t);
    if (cr > 0.05) {
      const nb = S.nb[0] + Math.floor(R(30 + wi) * (S.nb[1] - S.nb[0] + 1)) - (far ? 1 : 0);
      const a0 = R(40 + wi) * Math.PI * 2, base0 = axis(t);
      const u = (t - S.live) / (1 - S.live);
      for (let b = 0; b < nb; b++) {
        if (kind === "pine" && R(60 + wi * 13 + b) < 0.18) continue;            // white pines lose limbs: gaps in the tiers
        const a = a0 + (b / nb) * Math.PI * 2 + (R(70 + wi * 13 + b) - 0.5) * 0.5;
        const L = cr * (0.75 + R(80 + wi * 13 + b) * 0.45);
        const out = V(Math.cos(a), 0, Math.sin(a));
        // the limb's path: out from the trunk, sagging (more low and long), the tip turning up (spruce)
        const sag = S.droop * L * (0.35 + 0.65 * (1 - u)), rise = 0.12 * L;
        const P = (q) => base0.clone().add(out.clone().multiplyScalar(L * q)).add(V(0, rise * q - sag * Math.sin(q * Math.PI * 0.75) + S.up * L * 0.25 * Math.pow(q, 3), 0));
        const lp = [P(0), P(0.33), P(0.66), P(1)];
        if (!far) tube(gb, lp, [0.035 * Math.min(1, L / 1.5) + 0.01, 0.022, 0.012, 0.005], 4, BARK_R, barkC, barkC, 0.6);
        // needle sprays all along the limb, small and many (a real bough is dozens of overlapping sprays): at each station a flat
        // spray (seen from above: the snow lying in it), an upright one (seen from the side: snow riding its upper edge) and, on a
        // spruce, a drooping curtain of branchlets under it; the inner ones darker (the crown's own shade)
        const step = far ? 0.55 : (kind === "pine" ? 0.5 : 0.34);
        const nc = Math.max(far ? 2 : 3, Math.round(L / step));
        for (let q = 0; q < nc; q++) {
          const s0 = 0.12 + (q + 0.5) / nc * 0.88, pc = P(Math.min(0.98, s0)), pn = P(Math.min(1, s0 + 0.06)), tan = pn.clone().sub(pc).normalize();
          const len = step * (far ? 1.9 : 1.75) * (kind === "pine" ? 1.3 : 1) * (1.15 - 0.3 * s0);
          const wid = len * (kind === "pine" ? 0.42 : 0.4);
          const Wv = tan.clone().cross(UP).normalize(), Up = Wv.clone().cross(tan).normalize();
          const shadeN = out.clone().multiplyScalar(0.6).add(UP.clone().multiplyScalar(0.75)).normalize();
          const tint = (0.42 + 0.45 * s0) * (0.9 + 0.2 * u) + (R(90 + wi * 31 + b * 7 + q) - 0.5) * 0.12;     // dark inside the crown, lighter at the tips
          const cc = [tint * 0.95, tint, tint * 0.95];
          const snowy = s0 > 0.3 && R(95 + wi * 31 + b * 7 + q) < (0.5 + 0.4 * (1 - u));
          const rows = S.rows;
          const tw = (R(97 + q + b * 3 + wi) - 0.5) * 0.7, yaw = (R(98 + q + b * 5 + wi) - 0.5) * 0.6;
          const T2 = tan.clone().applyAxisAngle(UP, yaw);
          const Wt = Wv.clone().applyAxisAngle(UP, yaw).multiplyScalar(Math.cos(tw)).add(Up.clone().multiplyScalar(Math.sin(tw))).normalize();
          card(gb, pc.clone().add(T2.clone().multiplyScalar(len * 0.3)), T2, Wt, len, wid, shadeN, rowRect(snowy ? rows[2] : (q % 3 === 2 ? rows[3] : rows[0])), cc, R(99 + q + b) < 0.5);
          card(gb, pc.clone().add(T2.clone().multiplyScalar(len * 0.3)).add(Up.clone().multiplyScalar(wid * 0.1)), T2, Up.clone().multiplyScalar(0.9).add(Wv.clone().multiplyScalar(0.25)).normalize(), len * 0.9, wid * 0.6, shadeN, rowRect(snowy ? rows[1] : rows[0]), cc, false);
          if (kind === "spruce" && !far && q % 2 === 1) {
            const D = T2.clone().multiplyScalar(0.45).add(V(0, -1, 0)).normalize();
            card(gb, pc.clone().add(D.clone().multiplyScalar(len * 0.32)), D, Wv, len * 0.7, wid * 0.8, shadeN, rowRect(rows[0]), [cc[0] * 0.8, cc[1] * 0.8, cc[2] * 0.8], false);
          }
          if (snowy && !far && R(120 + q * 3 + b) < 0.55) lump(gb, pc.clone().add(T2.clone().multiplyScalar(len * 0.25)).add(Up.clone().multiplyScalar(wid * 0.12)), T2, len * 0.6, wid * 0.4, wid * 0.15, SNOW_R, snowC, seed + wi + b + q);
          else if (snowy && far && q === 1) lump(gb, pc.clone().add(Up.clone().multiplyScalar(wid * 0.12)), T2, len * 0.7, wid * 0.42, wid * 0.15, SNOW_R, snowC, seed + wi);
        }
      }
    }
    y += gap * (0.85 + R(50 + wi) * 0.3) * (kind === "pine" ? 1 : (1 - 0.3 * (y / H)));
    wi++;
  }
  // the leader: a spire of small upright sprays and a cap of snow
  const top = axis(1);
  for (let k = 0; k < (far ? 2 : 4); k++) {
    const a = (k / 4) * Math.PI + R(700) * 3, Wv = V(Math.cos(a), 0, Math.sin(a));
    card(gb, top.clone().add(V(0, -H * S.spire * 0.45, 0)), UP, Wv, H * S.spire * 1.1, H * S.spire * 0.45, V(Math.cos(a), 0.5, Math.sin(a)).normalize(), rowRect(S.rows[1]), [1, 1, 1]);
  }
  return gb.geo();
};
let CONMAT = null;
const coniferMats = () => CONMAT ??= (() => {
  const map = treeAtlas(); map.anisotropy = 4;
  const m = new THREE.MeshStandardMaterial({ map, vertexColors: true, alphaTest: 0.42, roughness: 0.92, metalness: 0, side: THREE.FrontSide, envMapIntensity: 0.4 });
  const depth = new THREE.MeshDepthMaterial({ map, alphaTest: 0.42, depthPacking: THREE.RGBADepthPacking });
  return { m, depth };
})();
const VARIANTS = { fir: 4, spruce: 4, pine: 3 };
const GEOS = {};
const geoFor = (kind, v, far) => GEOS[`${kind}_${v}_${far ? 1 : 0}`] ??= coniferGeo(kind, 17 + v * 29 + (kind === "pine" ? 500 : kind === "fir" ? 300 : 0), far);
/** items: [{ p:[x,y,z], s, kind?: "fir"|"spruce"|"pine", ry?, far? }]. Unit s ≈ the old pines' scale (s × 5.6 m tall). */
export const Conifers = ({ items, cast = true, near = null, farDist = 32 }) => {
  const groups = useMemo(() => {
    const { m, depth } = coniferMats();
    const buckets = {};
    items.forEach((it, i) => {
      const kind = it.kind ?? (rnd(i * 13 + 5) < 0.45 ? "spruce" : rnd(i * 13 + 6) < 0.6 ? "fir" : "pine");
      const v = Math.floor(rnd(i * 17 + 9) * VARIANTS[kind]);
      const far = it.far ?? (near ? Math.hypot(it.p[0] - near[0], it.p[2] - near[1]) > farDist : false);
      (buckets[`${kind}|${v}|${far ? 1 : 0}`] ??= []).push({ ...it, kind, i });
    });
    return Object.entries(buckets).map(([key, its]) => {
      const [kind, v, far] = key.split("|");
      const g = geoFor(kind, +v, far === "1");
      const im = new THREE.InstancedMesh(g, m, its.length);
      im.customDepthMaterial = depth;
      const M = new THREE.Matrix4(), Q = new THREE.Quaternion();
      its.forEach((it, k) => {
        Q.setFromAxisAngle(UP, it.ry ?? rnd(it.i * 7 + 1) * 6.28);
        const sc = (it.s ?? 1) * 0.56 * (kind === "pine" ? 1.15 : 1), sx = sc * (0.9 + rnd(it.i * 3 + 2) * 0.2) * (it.sx ?? 1);
        M.compose(V(...it.p), Q, V(sx, sc, sx * (0.92 + rnd(it.i * 5) * 0.16)));
        im.setMatrixAt(k, M);
      });
      im.castShadow = cast && far !== "1"; im.receiveShadow = true; im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere();
      return im;
    });
  }, []);
  return <>{groups.map((g, i) => <primitive key={i} object={g} />)}</>;
};

// ── bare sugar maples ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const barkTex = () => canvasTex("e_maplebark", 512, 1024, (c, w, h) => {
  // old sugar maple bark: grey, broken into long vertical plates that curl at their edges, deep dark fissures, lichen
  c.fillStyle = "#6A6560"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) {
    const x = rnd(i) * w, y = rnd(i + 1) * h, pw = 18 + rnd(i + 2) * 46, ph = 80 + rnd(i + 3) * 260;
    const g = c.createLinearGradient(x, 0, x + pw, 0); g.addColorStop(0, "rgba(40,36,34,0.6)"); g.addColorStop(0.25, `rgba(${120 + rnd(i) * 30},${116 + rnd(i) * 26},${108 + rnd(i) * 22},0.75)`); g.addColorStop(1, "rgba(60,56,52,0.6)");
    c.fillStyle = g; c.fillRect(x, y, pw, ph);
  }
  for (let i = 0; i < 90; i++) { c.strokeStyle = "rgba(20,16,14,0.8)"; c.lineWidth = 2 + rnd(i) * 4; c.beginPath(); let x = rnd(i * 5) * w; c.moveTo(x, 0); for (let y = 0; y < h; y += 40) { x += (rnd(i * 31 + y) - 0.5) * 14; c.lineTo(x, y); } c.stroke(); }
  for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(${140 + rnd(i) * 30},${150 + rnd(i) * 20},${120},${0.12 + rnd(i + 1) * 0.15})`; c.beginPath(); c.arc(rnd(i * 3) * w, rnd(i * 7) * h, 6 + rnd(i * 2) * 18, 0, 7); c.fill(); }
});
let MAPLEMAT = null;
const mapleMats = () => MAPLEMAT ??= (() => {
  const t = barkTex(); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return {
    bark: new THREE.MeshStandardMaterial({ map: t, vertexColors: true, roughness: 0.95 }),
    twig: new THREE.LineBasicMaterial({ color: "#2A2522", transparent: true, opacity: 0.55, depthWrite: false })
  };
})();
const mapleGeo = (seed, height) => {
  const gb = new GB(), gs = new GB(), lines = [];
  const R = (k) => rnd(seed * 211 + k * 5 + 1);
  let k = 0;
  const darkC = col("#4E4A46"), lightC = col("#8E8984"), snowC = col("#F2F6FB", 1.2);
  const grow = (p, dir, len, r, depth) => {
    k++;
    // a limb in 3 bends (gnarled), its own gravitropism: lower limbs spread, the crown's tips reach up
    const pts = [p.clone()], rads = [r];
    let d = dir.clone(), q = p.clone();
    for (let s = 1; s <= 3; s++) {
      d.add(V((R(k * 9 + s) - 0.5) * 0.35, (R(k * 9 + s + 3) - 0.4) * 0.2, (R(k * 9 + s + 6) - 0.5) * 0.35)).normalize();
      q = q.clone().add(d.clone().multiplyScalar(len / 3)); pts.push(q); rads.push(r * (1 - 0.28 * s / 3));
    }
    const end = pts[3], rEnd = rads[3];
    if (r > 0.012) tube(gb, pts, rads, r > 0.08 ? 9 : r > 0.03 ? 6 : 4, [0, 0, 1, 1], mixc(darkC, lightC, R(k)), mixc(darkC, lightC, R(k + 1)), 0.5);
    else for (let s = 0; s < 3; s++) lines.push(pts[s].x, pts[s].y, pts[s].z, pts[s + 1].x, pts[s + 1].y, pts[s + 1].z);
    // snow on the top of a thick, fairly level limb
    if (r > 0.05 && Math.abs(dir.y) < 0.75) for (let s = 0; s < 3; s++) {
      const a = pts[s], b = pts[s + 1], m = a.clone().add(b).multiplyScalar(0.5), U = b.clone().sub(a), L = U.length(); U.normalize();
      if (Math.abs(U.y) > 0.6) continue;
      lump(gs, m.clone().add(V(0, rads[s] * 0.85, 0)), U, L * 0.95, rads[s] * 1.5, rads[s] * 0.55, [0, 0, 1, 1], snowC, k + s);
    }
    if (depth === 0) return;
    const nb = depth >= 5 ? 2 + (R(k + 7) < 0.4 ? 1 : 0) : 2 + (R(k + 8) < 0.3 ? 1 : 0);
    const rc = rEnd * Math.pow(1 / nb, 1 / 2.6) * 1.05;
    for (let b = 0; b < nb; b++) {
      const yaw = (b / nb) * Math.PI * 2 + R(k * 3 + b) * 2.0, spread = 0.45 + R(k * 5 + b) * 0.35;
      const side = V(Math.cos(yaw), 0, Math.sin(yaw));
      const nd = d.clone().multiplyScalar(1.0).add(side.multiplyScalar(Math.sin(spread) * 1.1)).add(V(0, 0.25 + (depth < 3 ? 0.35 : 0), 0)).normalize();
      grow(end, nd, len * (0.62 + R(k + b * 11) * 0.2), rc * (0.85 + R(k + b * 13) * 0.25), depth - 1);
    }
  };
  // the trunk: a root flare, a straight bole to the first fork at ~35–45 % of the height, then 2–3 big ascending leaders
  const fork = height * (0.3 + R(1) * 0.12), r0 = height * 0.032;
  const flare = [];
  for (let s = 0; s <= 6; s++) { const t = s / 6; flare.push([V((R(2) - 0.5) * 0.15 * t, -0.15 + t * fork, (R(3) - 0.5) * 0.15 * t), r0 * (1 + 0.6 * Math.pow(1 - t, 6)) * (1 - 0.15 * t)]); }
  tube(gb, flare.map((q) => q[0]), flare.map((q) => q[1]), 12, [0, 0, 1, 1], darkC, mixc(darkC, lightC, 0.5), 0.5);
  const top = flare[6][0], nl = 2 + (R(4) < 0.55 ? 1 : 0);
  for (let b = 0; b < nl; b++) {
    const yaw = (b / nl) * Math.PI * 2 + R(5) * 3, d = V(Math.cos(yaw) * 0.45, 1, Math.sin(yaw) * 0.45).normalize();
    grow(top, d, height * 0.3, r0 * 0.72, 6);
  }
  // a couple of low side limbs off the bole
  for (let b = 0; b < 2; b++) { const yaw = R(6 + b) * 6.28, y = fork * (0.6 + b * 0.2); grow(V(0, y, 0), V(Math.cos(yaw), 0.55, Math.sin(yaw)).normalize(), height * 0.18, r0 * 0.3, 4); }
  const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
  return { mesh: gb.geo(), snow: gs.p.length ? gs.geo() : null, lines: lg };
};
let SNOWMAT = null;
const snowMat = () => SNOWMAT ??= new THREE.MeshStandardMaterial({ color: "#EEF3FA", roughness: 0.75 });
/** items: [{ p:[x,y,z], h (metres), seed }] — each maple grown from its own seed */
export const Maples = ({ items }) => {
  const objs = useMemo(() => {
    const M = mapleMats();
    return items.map((it, i) => {
      const { mesh, snow, lines } = mapleGeo(it.seed ?? i + 1, it.h ?? 9);
      const g = new THREE.Group();
      const bm = new THREE.Mesh(mesh, M.bark); bm.castShadow = true; bm.receiveShadow = true; g.add(bm);
      if (snow) { const sm = new THREE.Mesh(snow, snowMat()); sm.receiveShadow = true; g.add(sm); }
      g.add(new THREE.LineSegments(lines, M.twig));          // the finest twigs: a soft haze of 1-px lines
      g.position.set(...it.p); g.rotation.y = it.ry ?? rnd(i * 7 + 3) * 6.28;
      return g;
    });
  }, []);
  return <>{objs.map((o, i) => <primitive key={i} object={o} />)}</>;
};
