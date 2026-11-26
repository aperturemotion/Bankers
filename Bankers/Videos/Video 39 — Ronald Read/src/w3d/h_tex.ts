// @ts-nocheck
// ★ V38 rev 4 (builder H) — shared drawing + geometry helpers for the two interiors seen through openings: the State House's
//   entrance hall (h_state_hall.tsx) and the family home's living and dining rooms (h_home_room.tsx).
//   · paintings (landscape / seascape / abstract), flags (US, a plain blue state-style flag), book spines, a clock face, rugs,
//     fabrics and floors, all drawn on canvas (no people, no seals, no placeholder lines);
//   · atlas cells: a geometry's 0..1 uvs remapped into a canvas cell, per face of a box where needed;
//   · bake(): the per-vertex lamp light for bld_kit's Kit (glow = Σ lamps' irradiance, ao = corners and undersides darker).
import * as THREE from "three";
import { rnd } from "./kit";
import { BODY } from "./fonts3d";
import { flatTex } from "./bld_kit";

export const SERIF = 'Georgia, "Times New Roman", "DejaVu Serif", serif';
export const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ── atlas cells (canvas pixels, y down) → uv rects (v up) ───────────────────────────────────────────────────────────────
export const cell = (A, x, y, w, h, ins = 2) => [(x + ins) / A.W, 1 - (y + h - ins) / A.H, (x + w - ins) / A.W, 1 - (y + ins) / A.H];
/** remap a geometry's own 0..1 uvs into rect r = [u0, v0, u1, v1] (a clone) */
export const inRect = (geo, r) => {
  const g = geo.index ? geo.toNonIndexed() : geo.clone(), U = g.attributes.uv;
  for (let i = 0; i < U.count; i++) U.setXY(i, r[0] + U.getX(i) * (r[2] - r[0]), r[1] + U.getY(i) * (r[3] - r[1]));
  return g;
};
/** a unit box whose +z face shows rect `front` and every other face rect `rest` (books, cabinets with a printed front) */
export const boxFaces = (front, rest, back = rest) => {
  const g = new THREE.BoxGeometry(1, 1, 1), U = g.attributes.uv;
  for (let f = 0; f < 6; f++) {
    const r = f === 4 ? front : f === 5 ? back : rest;
    for (let k = 0; k < 4; k++) { const i = f * 4 + k; U.setXY(i, r[0] + U.getX(i) * (r[2] - r[0]), r[1] + U.getY(i) * (r[3] - r[1])); }
  }
  return g;
};

// ── light baking for bld_kit's Kit.build(fx) ─────────────────────────────────────────────────────────────────────────────
/** lamps: [{p:[x,y,z], I, r, up?}] — irradiance I / (1 + (d/r)²), wrapped Lambert; userData.tag 9 = self-lit (shades, bulbs) */
export const bake = (lamps, { amb = 0.12, floorY = 0, aoH = 0.5, ceilY = 99 } = {}) => (x, y, z, nx, ny, nz, ud) => {
  if (ud.tag === 9) return [3.0, 1];
  let g = amb;
  for (const L of lamps) {
    const dx = L.p[0] - x, dy = L.p[1] - y, dz = L.p[2] - z, d = Math.hypot(dx, dy, dz) + 1e-4;
    const lam = (dx * nx + dy * ny + dz * nz) / d;
    let k = L.I / (1 + (d / L.r) * (d / L.r)) * (0.28 + 0.72 * Math.max(0, lam));
    if (L.cone) { const c = -dy / d; k *= L.cone > 0 ? 0.35 + 0.65 * sstep(0.1, 0.8, c) : 0.35 + 0.65 * sstep(0.1, 0.8, -c); }   // a shade throws more down (cone 1) or up (−1)
    g += k;
  }
  let ao = 0.72 + 0.28 * sstep(floorY, floorY + aoH, y);
  if (ceilY - y < 0.4) ao *= 0.85 + 0.15 * sstep(0, 0.4, ceilY - y);
  if (ny < -0.6) ao *= 0.8;
  return [g, ao];
};

// ── grain / fabric / floors ──────────────────────────────────────────────────────────────────────────────────────────────
export const grain = (c, w, h, n, rgb, a0, a1, s = 1.5, seed = 0) => { for (let i = 0; i < n; i++) { c.fillStyle = `rgba(${rgb},${a0 + rnd(i + seed) * (a1 - a0)})`; c.fillRect(rnd(i * 3 + seed + 1) * w, rnd(i * 7 + seed + 2) * h, s, s); } };
/** painted plaster: a flat colour with the faintest roller mottling */
export const drawPlaster = (base) => (c, w, h) => {
  c.fillStyle = base; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) { const x = rnd(i) * w, y = rnd(i + 9) * h, r = 30 + rnd(i + 4) * 90; const g = c.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, `rgba(${rnd(i + 2) > 0.5 ? "255,255,255" : "80,70,60"},0.035)`); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
  grain(c, w, h, 9000, "60,55,50", 0.01, 0.04, 1.4, 7); grain(c, w, h, 5000, "255,255,255", 0.01, 0.04, 1.4, 99);
};
/** veined marble (white or dark) in a rect */
export const marble = (c, x, y, w, h, dark, seed) => {
  const base = dark ? ["#1A2740", "#22324F"] : ["#EEF0F2", "#E3E6EA"];
  const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, base[0]); g.addColorStop(1, base[1]); c.fillStyle = g; c.fillRect(x, y, w, h);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  for (let k = 0; k < 7; k++) { const cx = x + rnd(seed + k) * w, cy = y + rnd(seed + k + 50) * h, r = w * (0.2 + rnd(seed + k + 9) * 0.4); const rg = c.createRadialGradient(cx, cy, 1, cx, cy, r); rg.addColorStop(0, dark ? "rgba(70,95,140,0.22)" : "rgba(190,196,206,0.28)"); rg.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = rg; c.fillRect(x, y, w, h); }
  for (let v = 0; v < 6; v++) {
    let px = x + rnd(seed * 3 + v) * w, py = y - 10, ang = 0.6 + rnd(seed + v * 7) * 1.9;
    c.strokeStyle = dark ? `rgba(${rnd(v + seed) > 0.6 ? "220,228,240" : "110,135,175"},${0.25 + rnd(v + 3) * 0.35})` : `rgba(120,128,142,${0.18 + rnd(v + seed + 1) * 0.35})`;
    c.lineWidth = 0.6 + rnd(v + seed + 5) * 1.8; c.beginPath(); c.moveTo(px, py);
    for (let s = 0; s < 24; s++) { ang += (rnd(seed + v * 31 + s) - 0.5) * 0.7; px += Math.cos(ang) * w / 14; py += Math.sin(ang) * h / 14 + h / 28; c.lineTo(px, py); }
    c.stroke();
  }
  c.restore();
};
/** oak floor boards: 1024² = 2 m × 2 m, boards 0.14 m wide with staggered butt joints */
export const drawOak = (bump) => (c, w, h) => {
  c.fillStyle = bump ? "#808080" : "#A9825A"; c.fillRect(0, 0, w, h);
  const bw = w / 14;
  for (let k = 0; k < 14; k++) {
    let y = -rnd(k) * h;
    while (y < h) {
      const L = h * (0.3 + rnd(k * 13 + Math.round(y)) * 0.45), v = rnd(k * 7 + Math.round(y) * 3);
      if (bump) { c.fillStyle = `rgb(${120 + v * 30},${120 + v * 30},${120 + v * 30})`; c.fillRect(k * bw + 1, y + 1, bw - 2, L - 2); }
      else {
        const L0 = 140 + v * 38; c.fillStyle = `rgb(${L0 + 22},${L0 - 8},${L0 - 50})`; c.fillRect(k * bw, y, bw, L);
        for (let s = 0; s < 10; s++) { c.fillStyle = `rgba(${rnd(s + k) > 0.5 ? "90,56,30" : "255,230,190"},${0.05 + rnd(s * 3 + k) * 0.07})`; c.fillRect(k * bw + rnd(s + k * 5) * bw, y, 1 + rnd(s) * 2, L); }
        c.fillStyle = "rgba(60,36,18,0.55)"; c.fillRect(k * bw, y, bw, 2);
      }
      y += L;
    }
    c.fillStyle = bump ? "#303030" : "rgba(55,34,18,0.6)"; c.fillRect(k * bw, 0, 2, h);
  }
};
/** a woven upholstery fabric (tiling), tinted by the material colour */
export const drawWeave = (c, w, h) => {
  c.fillStyle = "#D8D8D8"; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 3) { c.fillStyle = `rgba(0,0,0,${0.05 + rnd(y) * 0.05})`; c.fillRect(0, y, w, 1); }
  for (let x = 0; x < w; x += 3) { c.fillStyle = `rgba(255,255,255,${0.04 + rnd(x + 7) * 0.05})`; c.fillRect(x, 0, 1, h); }
  grain(c, w, h, 4000, "0,0,0", 0.02, 0.06, 1.2, 3);
};

// ── paintings (no figures) ───────────────────────────────────────────────────────────────────────────────────────────────
const poly = (c, pts, fill) => { c.fillStyle = fill; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts) c.lineTo(p[0], p[1]); c.closePath(); c.fill(); };
const ridge = (x, y, w, h, base, amp, n, seed) => { const pts = [[x, y + h]]; for (let i = 0; i <= n; i++) pts.push([x + (i / n) * w, y + base - amp * (0.5 * Math.sin(i * 0.9 + seed) + 0.5 * rnd(seed + i))]); pts.push([x + w, y + h]); return pts; };
const brush = (c, x, y, w, h, seed, n = 900) => { for (let i = 0; i < n; i++) { c.fillStyle = `rgba(${rnd(seed + i) > 0.5 ? "255,250,235" : "20,20,30"},0.035)`; c.fillRect(x + rnd(seed + i * 3) * w, y + rnd(seed + i * 5) * h, 4 + rnd(i) * 10, 2); } };
/** a river valley at dusk (Hudson River School manner): mountains, a lake, pines, warm low sky */
export const drawLandscape = (c, x, y, w, h, seed = 1) => {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  const sky = c.createLinearGradient(0, y, 0, y + h * 0.62); sky.addColorStop(0, "#35588A"); sky.addColorStop(0.55, "#8EA9C6"); sky.addColorStop(0.85, "#EBCB9A"); sky.addColorStop(1, "#F4D9A8");
  c.fillStyle = sky; c.fillRect(x, y, w, h);
  for (let k = 0; k < 9; k++) { const cx = x + rnd(seed + k) * w, cy = y + h * (0.1 + rnd(seed + k + 3) * 0.28), rw = w * (0.08 + rnd(seed + k + 6) * 0.14); const g = c.createRadialGradient(cx, cy, 1, cx, cy, rw); g.addColorStop(0, "rgba(255,240,222,0.55)"); g.addColorStop(1, "rgba(255,240,222,0)"); c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy, rw, rw * 0.32, 0, 0, Math.PI * 2); c.fill(); }
  poly(c, ridge(x, y, w, h, h * 0.5, h * 0.2, 14, seed), "#7088A6");
  poly(c, ridge(x, y, w, h, h * 0.58, h * 0.12, 18, seed + 4), "#4F6886");
  // the lake with the sky's reflection
  const lk = c.createLinearGradient(0, y + h * 0.62, 0, y + h * 0.8); lk.addColorStop(0, "#E2C49A"); lk.addColorStop(1, "#6F87A4"); c.fillStyle = lk; c.fillRect(x, y + h * 0.62, w, h * 0.2);
  for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,245,225,${0.1 + rnd(seed + i) * 0.2})`; c.fillRect(x + rnd(seed + i * 2) * w, y + h * (0.63 + rnd(i + seed) * 0.16), w * (0.03 + rnd(i) * 0.08), 1.5); }
  poly(c, ridge(x, y, w, h, h * 0.64, h * 0.05, 20, seed + 9), "#2E4A42");
  // pines on the near shore, the foreground bank
  for (let i = 0; i < 26; i++) { const px = x + rnd(seed + i * 7) * w, ph = h * (0.08 + rnd(seed + i) * 0.14), py = y + h * 0.82; poly(c, [[px, py - ph], [px - ph * 0.22, py], [px + ph * 0.22, py]], i % 2 ? "#1F3630" : "#243E36"); }
  poly(c, ridge(x, y, w, h, h * 0.8, h * 0.06, 12, seed + 2), "#26392F");
  const fg = c.createLinearGradient(0, y + h * 0.82, 0, y + h); fg.addColorStop(0, "rgba(40,50,30,0)"); fg.addColorStop(1, "rgba(18,22,16,0.7)"); c.fillStyle = fg; c.fillRect(x, y + h * 0.8, w, h * 0.2);
  brush(c, x, y, w, h, seed); c.fillStyle = "rgba(255,214,150,0.07)"; c.fillRect(x, y, w, h);   // the varnish
  c.restore();
};
/** a harbour at evening: a three-masted ship at anchor, a lighthouse on the point, calm water */
export const drawSeascape = (c, x, y, w, h, seed = 3) => {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  const sky = c.createLinearGradient(0, y, 0, y + h * 0.6); sky.addColorStop(0, "#2B4C7C"); sky.addColorStop(0.6, "#9DB3CC"); sky.addColorStop(1, "#E9D3B0"); c.fillStyle = sky; c.fillRect(x, y, w, h);
  for (let k = 0; k < 7; k++) { const cx = x + rnd(seed + k) * w, cy = y + h * (0.12 + rnd(seed + k + 3) * 0.3), rw = w * (0.1 + rnd(seed + k + 6) * 0.12); c.fillStyle = "rgba(236,226,214,0.35)"; c.beginPath(); c.ellipse(cx, cy, rw, rw * 0.22, 0, 0, Math.PI * 2); c.fill(); }
  const sea = c.createLinearGradient(0, y + h * 0.6, 0, y + h); sea.addColorStop(0, "#AFC0D2"); sea.addColorStop(1, "#2E4A6C"); c.fillStyle = sea; c.fillRect(x, y + h * 0.6, w, h * 0.4);
  for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(255,250,240,${0.08 + rnd(seed + i) * 0.18})`; c.fillRect(x + rnd(seed + i * 2) * w, y + h * (0.61 + rnd(i + seed) * 0.37), w * (0.02 + rnd(i) * 0.06), 1.5); }
  // the point with its lighthouse
  poly(c, [[x + w * 0.7, y + h * 0.62], [x + w * 0.8, y + h * 0.55], [x + w * 0.92, y + h * 0.53], [x + w, y + h * 0.56], [x + w, y + h * 0.64]], "#3C4A44");
  c.fillStyle = "#EDE6DA"; c.fillRect(x + w * 0.86, y + h * 0.36, w * 0.025, h * 0.18); c.fillStyle = "#2B3340"; c.fillRect(x + w * 0.855, y + h * 0.33, w * 0.035, h * 0.035);
  const lg = c.createRadialGradient(x + w * 0.872, y + h * 0.35, 1, x + w * 0.872, y + h * 0.35, w * 0.05); lg.addColorStop(0, "rgba(255,236,190,0.95)"); lg.addColorStop(1, "rgba(255,236,190,0)"); c.fillStyle = lg; c.fillRect(x + w * 0.8, y + h * 0.28, w * 0.15, h * 0.15);
  // the ship: hull, three masts, square sails
  const sx = x + w * 0.32, sy = y + h * 0.63;
  poly(c, [[sx - w * 0.15, sy - h * 0.05], [sx + w * 0.16, sy - h * 0.05], [sx + w * 0.12, sy + h * 0.01], [sx - w * 0.12, sy + h * 0.01]], "#2A2620");
  c.fillStyle = "#3A3026"; [-0.09, 0, 0.09].forEach((m) => c.fillRect(sx + w * m, sy - h * 0.42, w * 0.006, h * 0.37));
  [-0.09, 0, 0.09].forEach((m, i) => [0.36, 0.26, 0.17].forEach((t, j) => { const sw = w * (0.075 - j * 0.012) * (i === 1 ? 1.1 : 1); poly(c, [[sx + w * m - sw / 2, sy - h * t], [sx + w * m + sw / 2, sy - h * t], [sx + w * m + sw * 0.46, sy - h * (t - 0.085)], [sx + w * m - sw * 0.46, sy - h * (t - 0.085)]], `rgba(${236 - j * 8},${228 - j * 8},${212 - j * 8},0.95)`); }));
  c.fillStyle = "rgba(30,28,24,0.35)"; c.fillRect(sx - w * 0.13, sy + h * 0.015, w * 0.26, h * 0.05);   // its reflection
  brush(c, x, y, w, h, seed); c.fillStyle = "rgba(255,214,150,0.06)"; c.fillRect(x, y, w, h);
  c.restore();
};
/** a quiet colour-field abstract (blues and one warm band) */
export const drawAbstract = (c, x, y, w, h, seed = 5, pal = ["#1F3F6A", "#5D86B8", "#D9C39A", "#E9E3D6"]) => {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = pal[3]; c.fillRect(x, y, w, h);
  const bands = [[0.06, 0.42, pal[0]], [0.48, 0.2, pal[1]], [0.72, 0.2, pal[2]]];
  bands.forEach(([t, s, col], i) => { c.fillStyle = col; c.globalAlpha = 0.92; c.beginPath(); c.roundRect(x + w * 0.08, y + h * t, w * 0.84, h * s, 6); c.fill(); });
  c.globalAlpha = 1; brush(c, x, y, w, h, seed, 1400);
  c.restore();
};
/** a geometric abstract: overlapping circles and a diagonal (blue family, one ochre disc) */
export const drawGeo = (c, x, y, w, h, seed = 8) => {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = "#EDE8DE"; c.fillRect(x, y, w, h);
  c.fillStyle = "#264B7A"; c.beginPath(); c.arc(x + w * 0.38, y + h * 0.42, w * 0.3, 0, Math.PI * 2); c.fill();
  c.fillStyle = "rgba(127,180,242,0.85)"; c.beginPath(); c.arc(x + w * 0.62, y + h * 0.58, w * 0.24, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#D2A55A"; c.beginPath(); c.arc(x + w * 0.7, y + h * 0.26, w * 0.09, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "#1A2638"; c.lineWidth = Math.max(2, w * 0.012); c.beginPath(); c.moveTo(x + w * 0.08, y + h * 0.9); c.lineTo(x + w * 0.92, y + h * 0.12); c.stroke();
  brush(c, x, y, w, h, seed, 700);
  c.restore();
};

// ── flags ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const star = (c, cx, cy, r) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.382 : r; c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } c.closePath(); c.fill(); };
/** the US flag (13 stripes, 50 stars in 9 rows of 6 and 5), hoist at the left */
export const drawUS = (c, x, y, w, h) => {
  const sh = h / 13;
  for (let i = 0; i < 13; i++) { c.fillStyle = i % 2 ? "#F4F1EA" : "#B3253A"; c.fillRect(x, y + i * sh, w, sh + 0.5); }
  const cw = w * 0.4, ch = sh * 7; c.fillStyle = "#2B2E62"; c.fillRect(x, y, cw, ch);
  c.fillStyle = "#F4F1EA";
  for (let r = 0; r < 9; r++) { const n = r % 2 ? 5 : 6; for (let k = 0; k < n; k++) star(c, x + cw * ((r % 2 ? 2 : 1) + k * 2) / 12, y + ch * (r + 1) / 10, ch * 0.038); }
  for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(0,0,0,${rnd(i) * 0.05})`; c.fillRect(x + rnd(i + 3) * w, y + rnd(i + 5) * h, 2, 2); }   // the weave
};
/** a plain blue state-style flag: a deep blue field, a gold fringe on the fly and foot */
export const drawBlueFlag = (c, x, y, w, h) => {
  const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, "#1D3F86"); g.addColorStop(1, "#163370"); c.fillStyle = g; c.fillRect(x, y, w, h);
  c.strokeStyle = "rgba(240,210,130,0.55)"; c.lineWidth = 3; c.strokeRect(x + w * 0.06, y + h * 0.08, w * 0.86, h * 0.84);
  c.fillStyle = "#D9B45C"; c.fillRect(x + w - w * 0.045, y, w * 0.045, h); c.fillRect(x, y + h - h * 0.05, w, h * 0.05);
  for (let k = 0; k < 60; k++) { c.fillStyle = k % 2 ? "rgba(120,90,30,0.4)" : "rgba(255,236,170,0.4)"; c.fillRect(x + w - w * 0.045, y + (k / 60) * h, w * 0.045, 2); }
  for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(0,0,0,${rnd(i + 11) * 0.06})`; c.fillRect(x + rnd(i + 3) * w, y + rnd(i + 5) * h, 2, 2); }
};

// ── a carpet runner / rug ────────────────────────────────────────────────────────────────────────────────────────────────
export const drawRunner = (c, x, y, w, h, field = "#1B3260", border = "#C9A55A") => {
  c.fillStyle = border; c.fillRect(x, y, w, h);
  const b = Math.min(w, h) * 0.08; c.fillStyle = field; c.fillRect(x + b, y + b, w - 2 * b, h - 2 * b);
  c.strokeStyle = border; c.lineWidth = Math.max(2, b * 0.18); c.strokeRect(x + b * 1.6, y + b * 1.6, w - 3.2 * b, h - 3.2 * b);
  c.fillStyle = "rgba(201,165,90,0.55)";
  for (let i = 0; i < 6; i++) for (let k = 0; k < 3; k++) { const cx = x + w * (0.25 + k * 0.25), cy = y + h * (0.12 + i * 0.152), r = Math.min(w, h) * 0.05; c.beginPath(); c.moveTo(cx, cy - r); c.lineTo(cx + r, cy); c.lineTo(cx, cy + r); c.lineTo(cx - r, cy); c.fill(); }
  grain(c, w, h, 6000, "0,0,0", 0.02, 0.07, 1.4, 21);
};
/** a living-room rug: a cream field, a navy border, a soft lattice */
export const drawRug = (c, x, y, w, h) => {
  c.save(); c.translate(x, y);
  c.fillStyle = "#1E3A63"; c.fillRect(0, 0, w, h);
  const b = h * 0.07; c.fillStyle = "#E8E0CF"; c.fillRect(b, b, w - 2 * b, h - 2 * b);
  c.strokeStyle = "#B88E52"; c.lineWidth = 4; c.strokeRect(b * 0.5, b * 0.5, w - b, h - b);
  c.strokeStyle = "rgba(60,96,146,0.5)"; c.lineWidth = 3;
  const n = 7; for (let i = -n; i <= 2 * n; i++) { c.beginPath(); c.moveTo(b + i * (w / n), b); c.lineTo(b + i * (w / n) + (h - 2 * b), h - b); c.stroke(); c.beginPath(); c.moveTo(b + i * (w / n), h - b); c.lineTo(b + i * (w / n) + (h - 2 * b), b); c.stroke(); }
  c.fillStyle = "#1E3A63"; c.fillRect(0, 0, w, b); c.fillRect(0, h - b, w, b); c.fillRect(0, 0, b, h); c.fillRect(w - b, 0, b, h);
  c.strokeStyle = "#B88E52"; c.strokeRect(b * 0.5, b * 0.5, w - b, h - b);
  for (let i = 0; i < 120; i++) { c.fillStyle = "#E8E0CF"; c.fillRect(-2, (i / 120) * h, 5, 2); c.fillRect(w - 3, (i / 120) * h, 5, 2); }   // the fringe
  grain(c, w, h, 14000, "0,0,0", 0.02, 0.07, 1.6, 31);
  c.restore();
};

// ── book spines: real titles in small type, bands, varied cloth colours ─────────────────────────────────────────────────
const TITLES = ["ATLAS OF THE WORLD", "POEMS", "THE GARDEN YEAR", "BIRDS OF MICHIGAN", "HOME COOKING", "A HISTORY OF AMERICA", "GREAT LAKES", "THE ATLAS", "DICTIONARY",
  "CROSSWORDS", "FIELD GUIDE", "THE CIVIL WAR", "ROAD MAPS", "BAKING", "STAR CHARTS", "SHORT STORIES", "THE ALMANAC", "FISHING", "WOODWORKING", "CHESS",
  "TREES", "QUILTS", "MOTOR CARS", "THE SEA", "NATIONAL PARKS", "ENCYCLOPEDIA", "ASTRONOMY", "CLASSICS", "ESSAYS", "THE RIVER", "MAPS", "PUZZLES"];
const CLOTH = ["#7A2E2A", "#24406B", "#2F5A4A", "#C8B88E", "#E4DCC8", "#5B3F6E", "#A0662E", "#1C2433", "#3B6A8C", "#8A8F96", "#B54A35", "#D7C9A3", "#3E4F2C", "#6E2238", "#2A5C7A", "#EDE4D0"];
export const SPINES = 32;
/** spine i of SPINES in the rect (x, y, w, h); title runs bottom-to-top */
export const drawSpine = (c, i, x, y, w, h) => {
  const col = CLOTH[(i * 5) % CLOTH.length], light = ["#C8B88E", "#E4DCC8", "#D7C9A3", "#EDE4D0", "#8A8F96"].includes(col);
  const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, "rgba(0,0,0,0.35)"); g.addColorStop(0.25, "rgba(255,255,255,0.08)"); g.addColorStop(0.75, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.4)");
  c.fillStyle = col; c.fillRect(x, y, w, h); c.fillStyle = g; c.fillRect(x, y, w, h);
  const ink = light ? "#2A2A30" : i % 3 ? "#E9D59A" : "#F2EEE4";
  if (i % 2 === 0) { c.fillStyle = ink; [0.07, 0.1, 0.88, 0.91].forEach((t) => c.fillRect(x + 2, y + h * t, w - 4, h * 0.012)); }
  if (i % 4 === 1) { c.fillStyle = light ? "#2A4A78" : "#1A1A1E"; c.fillRect(x, y + h * 0.14, w, h * 0.12); }
  c.save(); c.translate(x + w / 2, y + h * 0.52); c.rotate(-Math.PI / 2);
  const t = TITLES[i % TITLES.length], px = Math.min(w * 0.5, 30);
  c.font = `${i % 3 === 0 ? "italic 600" : "700"} ${px}px ${i % 2 ? SERIF : BODY}`; c.fillStyle = ink; c.textAlign = "center"; c.textBaseline = "middle";
  const mw = h * 0.62; let s = Math.min(1, mw / c.measureText(t).width); c.scale(s, 1); c.fillText(t, 0, 0);
  c.restore();
  c.font = `600 ${Math.round(px * 0.55)}px ${BODY}`; c.fillStyle = ink; c.textAlign = "center"; c.fillText(["", "PRESS", "", "BOOKS", "", "", "HOUSE", ""][i % 8], x + w / 2, y + h * 0.965);
};
/** a wall clock's face: numerals, minute ticks, hands at 8:10 */
export const drawClock = (c, x, y, s) => {
  const cx = x + s / 2, cy = y + s / 2, R = s / 2;
  c.fillStyle = "#F6F2E8"; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2, r0 = R * (i % 5 ? 0.9 : 0.84); c.strokeStyle = "#1E2430"; c.lineWidth = i % 5 ? 2 : 5; c.beginPath(); c.moveTo(cx + Math.sin(a) * r0, cy - Math.cos(a) * r0); c.lineTo(cx + Math.sin(a) * R * 0.95, cy - Math.cos(a) * R * 0.95); c.stroke(); }
  c.fillStyle = "#1E2430"; c.font = `600 ${Math.round(R * 0.2)}px ${SERIF}`; c.textAlign = "center"; c.textBaseline = "middle";
  for (let n = 1; n <= 12; n++) { const a = (n / 12) * Math.PI * 2; c.fillText(String(n), cx + Math.sin(a) * R * 0.7, cy - Math.cos(a) * R * 0.7); }
  const hand = (a, L, wdt) => { c.lineWidth = wdt; c.lineCap = "round"; c.beginPath(); c.moveTo(cx - Math.sin(a) * L * 0.15, cy + Math.cos(a) * L * 0.15); c.lineTo(cx + Math.sin(a) * L, cy - Math.cos(a) * L); c.stroke(); };
  c.strokeStyle = "#1E2430"; hand(((8 + 10 / 60) / 12) * Math.PI * 2, R * 0.5, R * 0.06); hand((10 / 60) * Math.PI * 2, R * 0.78, R * 0.04);
  c.strokeStyle = "#B3253A"; hand((38 / 60) * Math.PI * 2, R * 0.82, R * 0.015);
  c.fillStyle = "#1E2430"; c.beginPath(); c.arc(cx, cy, R * 0.05, 0, Math.PI * 2); c.fill();
  c.font = `600 ${Math.round(R * 0.08)}px ${BODY}`; c.fillText("QUARTZ", cx, cy + R * 0.32);
};

// ── the interior material: bld_kit's kitMat (per-vertex fx: baked glow + ao) that also turns DOWN the scene's own lights ──────
//   (the blue-hour key, fill and rims reach an interior unshadowed except the key; inside a lit room the baked lamp light must
//   dominate, so their direct and diffuse-indirect parts are scaled by uScene; environment reflections stay)
const mkRoomMat = (lambert) => (o) => {
  const { glow = "#000000", glowI = 1, scene = 0.25, ...rest } = o;
  if (!rest.map) rest.map = flatTex();
  if (!rest.bumpMap) { rest.bumpMap = flatTex(true); rest.bumpScale = 0; }
  if (!rest.emissiveMap) rest.emissiveMap = flatTex();
  if (lambert) { delete rest.roughness; delete rest.metalness; delete rest.envMapIntensity; }
  const m = lambert ? new THREE.MeshLambertMaterial(rest) : new THREE.MeshStandardMaterial(rest);
  const u = { value: new THREE.Color(glow).multiplyScalar(glowI) }, us = { value: scene };
  m.userData.uGlow = u; m.userData.uScene = us;
  m.onBeforeCompile = (s) => {
    s.uniforms.uGlow = u; s.uniforms.uScene = us;
    s.vertexShader = s.vertexShader.replace("#include <common>", "#include <common>\nattribute vec2 fx;\nvarying vec2 vFx;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvFx = fx;");
    s.fragmentShader = s.fragmentShader.replace("#include <common>", "#include <common>\nuniform vec3 uGlow;\nuniform float uScene;\nvarying vec2 vFx;")
      .replace("#include <map_fragment>", "#include <map_fragment>\ndiffuseColor.rgb *= vFx.y;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uGlow * vFx.x * diffuseColor.rgb;")
      .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\nreflectedLight.directDiffuse *= uScene; reflectedLight.directSpecular *= uScene; reflectedLight.indirectDiffuse *= uScene;");
  };
  m.customProgramCacheKey = () => (lambert ? "hlam1" : "hroom1");
  return m;
};
/** glossy / metal parts (PBR, environment reflections) */
export const roomMat = mkRoomMat(false);
/** matte parts (Lambert: no environment sampling, a far cheaper pixel in the software renderer) */
export const lamMat = mkRoomMat(true);
