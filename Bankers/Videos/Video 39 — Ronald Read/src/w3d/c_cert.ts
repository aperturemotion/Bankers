// @ts-nocheck
// ★ V39 builder C — THE SHARE CERTIFICATES of the blue chips Ronald Read held (WSJ 19 Mar 2015: Procter & Gamble, JPMorgan Chase,
//   General Electric, Dow Chemical, J.M. Smucker, CVS, Johnson & Johnson; his 1959 Pacific Gas and Electric purchase). ONE shared
//   drawing for every scene they appear in (the kitchen table stack in `shares`, the top of the safe-deposit stack in `vault`).
//   Generic engraved designs (adapted from V38 company_cert.tsx), each in its own ink: a guilloche border between fine rules, corner
//   rosettes, a pale security tint, an engraved vignette in an oval (power lines, a mill town, a city with a columned bank, orchards,
//   a globe — never people), COMMON STOCK and SHARES boxes (left EMPTY: no invented share counts, no prices, no serials), the state of
//   incorporation, the company name, the certifying text with a blank owner line, the transfer boilerplate, signature lines with the
//   officers' titles (illegible facsimile flourishes, no names), the countersignature block and a printed corporate seal.
//   A real certificate is 12 × 8 in: CW × CH metres. Canvas TW × TH (drawn in a 2304 × 1536 design space, scaled).
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";

export const CW = 0.305, CH = 0.203;          // 12 × 8 in, metres
export const TW = 1536, TH = 1024;            // the canvas
const DW = 2304, DH = 1536;                   // the design space
export const CSERIF = `"Liberation Serif", "Times New Roman", "DejaVu Serif", Georgia, serif`;

// the companies (plain names in type; no logo artwork). state = state of incorporation; vig = the engraved vignette
export const COMPANIES = [
  { key: "pge", name: "PACIFIC GAS AND ELECTRIC COMPANY", short: "PACIFIC GAS AND ELECTRIC", state: "CALIFORNIA", ink: "#24594B", tint: "rgba(48,128,104,", paper: "#F2F0E6", vig: "power" },
  { key: "ge", name: "GENERAL ELECTRIC COMPANY", short: "GENERAL ELECTRIC", state: "NEW YORK", ink: "#6A4728", tint: "rgba(170,110,60,", paper: "#F3EEE2", vig: "industry" },
  { key: "jnj", name: "JOHNSON & JOHNSON", short: "JOHNSON & JOHNSON", state: "NEW JERSEY", ink: "#5F5426", tint: "rgba(150,130,60,", paper: "#F3F0E4", vig: "globe" },
  { key: "dow", name: "THE DOW CHEMICAL COMPANY", short: "DOW CHEMICAL", state: "DELAWARE", ink: "#2F5279", tint: "rgba(70,120,180,", paper: "#EFF1EC", vig: "plant" },
  { key: "smucker", name: "THE J. M. SMUCKER COMPANY", short: "J. M. SMUCKER", state: "OHIO", ink: "#5C3550", tint: "rgba(150,80,130,", paper: "#F3EFE8", vig: "orchard" },
  { key: "jpm", name: "JPMORGAN CHASE & CO.", short: "JPMORGAN CHASE", state: "DELAWARE", ink: "#3E3A6C", tint: "rgba(100,96,170,", paper: "#F0F0EA", vig: "city" },
  { key: "cvs", name: "CVS CORPORATION", short: "CVS", state: "DELAWARE", ink: "#1F5466", tint: "rgba(50,130,160,", paper: "#EFF2EE", vig: "globe2" },
  { key: "pg", name: "THE PROCTER & GAMBLE COMPANY", short: "PROCTER & GAMBLE", state: "OHIO", ink: "#1D3C6E", tint: "rgba(60,110,190,", paper: "#F1F0E8", vig: "river" },
];

// ── drawing helpers ─────────────────────────────────────────────────────────────────────────────────────────────────────
const spaced = (c, text, x, y, sp) => {
  const ws = [...text].map((ch) => c.measureText(ch).width);
  const tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  let cx = x - tot / 2; const al = c.textAlign; c.textAlign = "left";
  [...text].forEach((ch, i) => { c.fillText(ch, cx, y); cx += ws[i] + sp; });
  c.textAlign = al; return tot;
};
const fitFont = (c, text, wt, px, maxW, sp = 0) => {   // shrink a line until it fits maxW
  let p = px;
  for (; p > 10; p -= 2) { c.font = `${wt} ${p}px ${CSERIF}`; const w = c.measureText(text).width + sp * (text.length - 1); if (w <= maxW) break; }
  return p;
};
const arched = (c, text, cx, cy, R, sp) => {
  const ws = [...text].map((ch) => c.measureText(ch).width);
  const tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  let s = -tot / 2; const al = c.textAlign; c.textAlign = "center";
  [...text].forEach((ch, i) => { const mid = s + ws[i] / 2, a = mid / R; c.save(); c.translate(cx + Math.sin(a) * R, cy + R - Math.cos(a) * R); c.rotate(a); c.fillText(ch, 0, 0); c.restore(); s += ws[i] + sp; });
  c.textAlign = al;
};
const bandLine = (c, x0, y0, x1, y1, amp, n, per, ph, lw) => {
  const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len;
  c.lineWidth = lw;
  for (let k = 0; k < n; k++) {
    c.beginPath();
    for (let s = 0; s <= len; s += 4) {
      const o = amp * Math.sin((s / per) * Math.PI * 2 + (k * Math.PI * 2) / n + ph) * (0.55 + 0.45 * Math.cos((s / (per * 7.3)) * Math.PI * 2 + k));
      const x = x0 + ux * s - uy * o, y = y0 + uy * s + ux * o; s ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
  }
};
const rosette = (c, x, y, R, seed, ink, paper) => {
  c.save(); c.translate(x, y);
  c.fillStyle = paper; c.beginPath(); c.arc(0, 0, R + 6, 0, Math.PI * 2); c.fill();
  c.strokeStyle = ink; c.lineWidth = 2.4; c.beginPath(); c.arc(0, 0, R + 4, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 1.1;
  for (let ring = 0; ring < 3; ring++) {
    const r0 = R * (0.95 - ring * 0.27), a = R * 0.11, n = 12 + ring * 6;
    c.globalAlpha = 0.9 - ring * 0.15;
    for (let k = 0; k < 4; k++) { c.beginPath(); for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.015) { const r = r0 - a + a * Math.sin(n * t + k * 0.8 + seed); const xx = Math.cos(t) * r, yy = Math.sin(t) * r; t ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); }
  }
  c.globalAlpha = 1; c.lineWidth = 1;
  for (let k = 0; k < 16; k++) { c.beginPath(); c.ellipse(0, 0, R * 0.3, R * 0.1, (k * Math.PI) / 16, 0, Math.PI * 2); c.stroke(); }
  c.fillStyle = ink; c.beginPath(); c.arc(0, 0, R * 0.06, 0, Math.PI * 2); c.fill();
  c.restore();
};
// ── the engraved vignettes (line work only; every one a place or a thing, never a person) ───────────────────────────────────
const V = {};
// sky hatching that opens up around a sun (or a glow) at (sx, sy)
const sky = (c, cx, cy, rx, ry, hz, sx, sy, ink) => {
  c.strokeStyle = ink;
  for (let y = cy - ry; y < hz; y += 4.5) {
    c.beginPath(); let on = false;
    for (let x = cx - rx; x <= cx + rx; x += 3) {
      const d = Math.hypot(x - sx, (y - sy) * 1.4) / (rx * 0.9);
      const keep = rnd(Math.floor(x) * 7 + Math.floor(y) * 131) < 0.15 + 0.85 * Math.min(1, d * d);
      if (keep && !on) { c.moveTo(x, y); on = true; } else if (!keep && on) { c.lineTo(x, y); on = false; } else if (on) c.lineTo(x, y);
    }
    c.globalAlpha = 0.7; c.lineWidth = 1.1; c.stroke();
  }
  c.globalAlpha = 1;
};
const sunRays = (c, sx, sy, r0, r1, ink, n = 30) => {
  c.strokeStyle = ink; c.globalAlpha = 0.5; c.lineWidth = 1.2;
  for (let k = 0; k < n; k++) { const a = Math.PI + (k / (n - 1)) * Math.PI; c.beginPath(); c.moveTo(sx + Math.cos(a) * r0, sy + Math.sin(a) * r0); c.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1); c.stroke(); }
  c.globalAlpha = 1;
};
const hills = (c, cx, rx, base, fn, ink, paper, bottom) => {   // a filled ridge with vertical hatching
  c.fillStyle = paper; c.beginPath(); c.moveTo(cx - rx, bottom); for (let x = cx - rx; x <= cx + rx; x += 3) c.lineTo(x, fn(x)); c.lineTo(cx + rx, bottom); c.closePath(); c.fill();
  c.strokeStyle = ink; c.lineWidth = 1.6; c.beginPath(); for (let x = cx - rx; x <= cx + rx; x += 3) x === cx - rx ? c.moveTo(x, fn(x)) : c.lineTo(x, fn(x)); c.stroke();
  c.lineWidth = 0.9; c.globalAlpha = 0.75;
  for (let x = cx - rx; x < cx + rx; x += 5) { const t = fn(x); c.beginPath(); c.moveTo(x, t + 3); c.lineTo(x + 3, Math.min(bottom, t + 14 + 30 * rnd(x))); c.stroke(); }
  c.globalAlpha = 1;
};
const water = (c, cx, rx, y0, y1, ink, gapX = null, gapW = 0) => {
  c.strokeStyle = ink;
  for (let y = y0; y < y1; y += 5) {
    const depth = (y - y0) / (y1 - y0); c.beginPath(); let on = false;
    for (let x = cx - rx; x <= cx + rx; x += 3) {
      const glit = gapX !== null && Math.abs(x - gapX) < gapW * (0.5 + depth) && rnd(Math.floor(x / 9) * 17 + Math.floor(y)) < 0.75;
      const yy = y + 1.5 * Math.sin(x / (7 + depth * 8) + y);
      if (!glit && !on) { c.moveTo(x, yy); on = true; } else if (glit && on) { c.stroke(); c.beginPath(); on = false; } else if (on) c.lineTo(x, yy);
    }
    c.globalAlpha = 0.5 + depth * 0.4; c.lineWidth = 0.9 + depth * 0.8; c.stroke();
  }
  c.globalAlpha = 1;
};
const bldg = (c, x, base, w, h, ink, paper, o = {}) => {   // a building in outline with a window grid and right-side hatching
  c.fillStyle = paper; c.fillRect(x, base - h, w, h);
  c.strokeStyle = ink; c.lineWidth = 1.6; c.strokeRect(x, base - h, w, h);
  c.lineWidth = 1; c.globalAlpha = 0.85;
  for (let yy = base - h + 8; yy < base - 8; yy += o.wy ?? 12) for (let xx = x + 5; xx < x + w - 6; xx += o.wx ?? 9) c.strokeRect(xx, yy, 4, 6);
  for (let k = 0; k < (o.shade ?? 4); k++) { c.beginPath(); c.moveTo(x + w - 2 - k * 2.5, base - h); c.lineTo(x + w - 2 - k * 2.5, base); c.stroke(); }
  c.globalAlpha = 1;
  if (o.saw) { c.lineWidth = 1.5; c.beginPath(); for (let k = 0; k < o.saw; k++) { const sx = x + (k * w) / o.saw; c.moveTo(sx, base - h); c.lineTo(sx + w / o.saw, base - h - 12); c.lineTo(sx + w / o.saw, base - h); } c.stroke(); }
};
const stack = (c, x, base, h, w, ink, paper, smoke = true) => {
  c.fillStyle = paper; c.beginPath(); c.moveTo(x - w / 2, base); c.lineTo(x - w * 0.35, base - h); c.lineTo(x + w * 0.35, base - h); c.lineTo(x + w / 2, base); c.closePath(); c.fill();
  c.strokeStyle = ink; c.lineWidth = 1.5; c.stroke();
  c.lineWidth = 1; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x + w * 0.1 + k * 2, base - h); c.lineTo(x + w * 0.15 + k * 2.6, base); c.stroke(); }
  [0.25, 0.5].forEach((q) => { c.beginPath(); c.moveTo(x - w * (0.5 - 0.15 * q), base - h * q); c.lineTo(x + w * (0.5 - 0.15 * q), base - h * q); c.stroke(); });
  if (smoke) { c.globalAlpha = 0.6; c.lineWidth = 1.2; for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(x + 10 + k * 13, base - h - 10 - k * 6, 9 + k * 2, 6 + k, -0.3, 0, Math.PI * 2); c.stroke(); } c.globalAlpha = 1; }
};
const tower = (c, x, base, h, ink) => {   // a steel lattice transmission tower
  c.strokeStyle = ink; c.lineWidth = 1.4;
  const wb = h * 0.32, wt = h * 0.06;
  const L = (q) => x - (wb / 2) * (1 - q) - (wt / 2) * q, R = (q) => x + (wb / 2) * (1 - q) + (wt / 2) * q, Y = (q) => base - h * q;
  c.beginPath(); c.moveTo(L(0), Y(0)); c.lineTo(L(1), Y(1)); c.moveTo(R(0), Y(0)); c.lineTo(R(1), Y(1)); c.stroke();
  c.lineWidth = 0.9;
  for (let k = 0; k < 7; k++) { const q0 = k / 7, q1 = (k + 1) / 7; c.beginPath(); c.moveTo(L(q0), Y(q0)); c.lineTo(R(q1), Y(q1)); c.moveTo(R(q0), Y(q0)); c.lineTo(L(q1), Y(q1)); c.moveTo(L(q1), Y(q1)); c.lineTo(R(q1), Y(q1)); c.stroke(); }
  c.lineWidth = 1.4;
  [[0.78, 0.5], [0.95, 0.36]].forEach(([q, a]) => { c.beginPath(); c.moveTo(x - h * a, Y(q)); c.lineTo(x + h * a, Y(q)); c.stroke(); c.beginPath(); c.moveTo(x - h * a, Y(q)); c.lineTo(L(q - 0.08), Y(q - 0.08)); c.moveTo(x + h * a, Y(q)); c.lineTo(R(q - 0.08), Y(q - 0.08)); c.stroke(); });
  return [[x - h * 0.5, Y(0.78)], [x + h * 0.5, Y(0.78)], [x - h * 0.36, Y(0.95)], [x + h * 0.36, Y(0.95)]];
};
const wire = (c, a, b, sag, ink) => { c.strokeStyle = ink; c.lineWidth = 0.9; c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag, b[0], b[1]); c.stroke(); };
const treeBall = (c, x, base, r, ink, paper) => {
  c.fillStyle = paper; c.beginPath(); c.arc(x, base - r * 1.5, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = ink; c.lineWidth = 1.2; c.stroke();
  c.lineWidth = 0.8; c.globalAlpha = 0.8; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(x + r * 0.15, base - r * 1.5, r * (0.25 + k * 0.12), -0.4, 1.4); c.stroke(); } c.globalAlpha = 1;
  c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, base - r * 0.55); c.lineTo(x, base); c.stroke();
};
V.power = (c, cx, cy, rx, ry, ink, paper) => {
  const hz = cy + ry * 0.25, sx = cx - rx * 0.3, sr = ry * 0.3;
  sky(c, cx, cy, rx, ry, hz, sx, hz, ink); sunRays(c, sx, hz, sr * 1.2, rx * 1.3, ink);
  c.fillStyle = paper; c.beginPath(); c.arc(sx, hz, sr, Math.PI, 0); c.fill(); c.strokeStyle = ink; c.lineWidth = 1.6; c.beginPath(); c.arc(sx, hz, sr, Math.PI, 0); c.stroke();
  hills(c, cx, rx, hz, (x) => hz - 12 - 22 * Math.sin((x - cx) / 70 + 1) - 8 * Math.sin((x - cx) / 19), ink, paper, cy + ry);
  hills(c, cx, rx, hz, (x) => hz + 38 - 18 * Math.sin((x - cx) / 90 + 2.4), ink, paper, cy + ry);
  const t1 = tower(c, cx - rx * 0.62, hz + 62, 150, ink), t2 = tower(c, cx + rx * 0.05, hz + 30, 104, ink), t3 = tower(c, cx + rx * 0.55, hz + 10, 70, ink);
  for (let k = 0; k < 4; k++) { wire(c, t1[k], t2[k], 16, ink); wire(c, t2[k], t3[k], 9, ink); wire(c, [cx - rx - 20, t1[k][1] + 30], t1[k], 10, ink); }
};
V.industry = (c, cx, cy, rx, ry, ink, paper) => {
  const hz = cy + ry * 0.4, sx = cx + rx * 0.35;
  sky(c, cx, cy, rx, ry, hz, sx, hz - 30, ink); sunRays(c, sx, hz, ry * 0.4, rx * 1.3, ink);
  hills(c, cx, rx, hz, (x) => hz - 14 - 12 * Math.sin((x - cx) / 50), ink, paper, cy + ry);
  stack(c, cx - rx * 0.42, hz - 38, 120, 24, ink, paper); stack(c, cx - rx * 0.28, hz - 38, 100, 20, ink, paper); stack(c, cx + rx * 0.12, hz - 30, 130, 26, ink, paper);
  bldg(c, cx - rx * 0.62, hz, 150, 58, ink, paper, { saw: 6 }); bldg(c, cx - rx * 0.2, hz, 190, 76, ink, paper, { saw: 7 }); bldg(c, cx + rx * 0.28, hz, 120, 46, ink, paper, { saw: 4 });
  water(c, cx, rx, hz + 6, cy + ry, ink, sx, 30);
};
V.plant = (c, cx, cy, rx, ry, ink, paper) => {   // a chemical works: tanks, a cracking column, pipe racks, a river
  const hz = cy + ry * 0.35, sx = cx - rx * 0.1;
  sky(c, cx, cy, rx, ry, hz, sx, hz - 20, ink); sunRays(c, sx, hz, ry * 0.35, rx * 1.3, ink);
  hills(c, cx, rx, hz, (x) => hz - 10 - 18 * Math.sin((x - cx) / 80 + 0.5), ink, paper, cy + ry);
  // spherical and cylindrical tanks
  [[-0.6, 34], [-0.42, 28], [0.48, 36]].forEach(([q, r]) => { const x = cx + rx * q; c.fillStyle = paper; c.beginPath(); c.arc(x, hz - r - 8, r, 0, Math.PI * 2); c.fill(); c.strokeStyle = ink; c.lineWidth = 1.6; c.stroke(); c.lineWidth = 0.9; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(x, hz - r - 8, r * (0.3 + k * 0.14), -0.2, 1.3); c.stroke(); } c.beginPath(); c.moveTo(x - r * 0.6, hz); c.lineTo(x - r * 0.4, hz - 14); c.moveTo(x + r * 0.6, hz); c.lineTo(x + r * 0.4, hz - 14); c.stroke(); });
  const col = (x, h, w) => { c.fillStyle = paper; c.fillRect(x - w / 2, hz - h, w, h); c.strokeStyle = ink; c.lineWidth = 1.5; c.strokeRect(x - w / 2, hz - h, w, h); c.lineWidth = 0.9; for (let y = hz - h + 10; y < hz; y += 14) { c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x + w / 2, y); c.stroke(); } for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x + w / 2 - 2 - k * 2.5, hz - h); c.lineTo(x + w / 2 - 2 - k * 2.5, hz); c.stroke(); } };
  col(cx - rx * 0.08, 150, 22); col(cx + rx * 0.06, 118, 18); col(cx + rx * 0.22, 96, 16);
  c.strokeStyle = ink; c.lineWidth = 1.2; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(cx - rx * 0.55, hz - 20 - k * 6); c.lineTo(cx + rx * 0.6, hz - 20 - k * 6); c.stroke(); }
  bldg(c, cx + rx * 0.3, hz, 110, 40, ink, paper, {});
  water(c, cx, rx, hz + 6, cy + ry, ink, sx, 26);
};
V.river = (c, cx, cy, rx, ry, ink, paper) => {   // a river town: a bridge, wharf buildings, a steamboat
  const hz = cy + ry * 0.2, sx = cx + rx * 0.05;
  sky(c, cx, cy, rx, ry, hz, sx, hz, ink); sunRays(c, sx, hz, ry * 0.36, rx * 1.3, ink);
  c.fillStyle = paper; c.beginPath(); c.arc(sx, hz, ry * 0.3, Math.PI, 0); c.fill(); c.strokeStyle = ink; c.lineWidth = 1.6; c.beginPath(); c.arc(sx, hz, ry * 0.3, Math.PI, 0); c.stroke();
  hills(c, cx, rx, hz, (x) => hz - 6 - 14 * Math.sin((x - cx) / 60 + 2), ink, paper, hz + 20);
  [[-0.95, 60, 50], [-0.8, 44, 70], [-0.66, 52, 40], [0.52, 50, 60], [0.68, 40, 48], [0.8, 56, 70]].forEach(([q, w, h]) => bldg(c, cx + rx * q, hz + 18, w, h, ink, paper, { wx: 8, wy: 11 }));
  water(c, cx, rx, hz + 20, cy + ry, ink, sx, 30);
  // the bridge: arches on piers across the river
  c.strokeStyle = ink; c.lineWidth = 1.8; const by = hz + 2;
  c.beginPath(); c.moveTo(cx - rx * 0.6, by); c.lineTo(cx + rx * 0.5, by); c.stroke(); c.beginPath(); c.moveTo(cx - rx * 0.6, by - 6); c.lineTo(cx + rx * 0.5, by - 6); c.stroke();
  for (let k = 0; k < 5; k++) { const x0 = cx - rx * 0.6 + k * rx * 0.22, x1 = x0 + rx * 0.22; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x0, by + 26); c.quadraticCurveTo((x0 + x1) / 2, by - 10, x1, by + 26); c.stroke(); c.fillStyle = ink; c.fillRect(x1 - 3, by, 6, 28); }
  // a sternwheel steamboat with two stacks
  const bx = cx - rx * 0.18, bw = 120, byy = hz + 58;
  c.fillStyle = paper; c.strokeStyle = ink; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(bx - bw / 2, byy); c.lineTo(bx + bw / 2, byy); c.lineTo(bx + bw / 2 - 10, byy + 12); c.lineTo(bx - bw / 2 + 8, byy + 12); c.closePath(); c.fill(); c.stroke();
  c.fillRect(bx - bw * 0.35, byy - 16, bw * 0.7, 16); c.strokeRect(bx - bw * 0.35, byy - 16, bw * 0.7, 16); c.strokeRect(bx - bw * 0.22, byy - 28, bw * 0.44, 12);
  for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(bx - bw * 0.32 + k * 9, byy - 13); c.lineTo(bx - bw * 0.32 + k * 9, byy - 4); c.stroke(); }
  [[-0.1, 36], [0.08, 36]].forEach(([q, h]) => { const x = bx + bw * q; c.fillRect(x - 3, byy - 28 - h, 6, h); c.strokeRect(x - 3, byy - 28 - h, 6, h); });
};
V.city = (c, cx, cy, rx, ry, ink, paper) => {   // a skyline and a columned bank in front
  const hz = cy + ry * 0.55, sx = cx;
  sky(c, cx, cy, rx, ry, hz, sx, hz - 60, ink); sunRays(c, sx, hz - 60, ry * 0.3, rx * 1.3, ink);
  [[-0.95, 70, 120], [-0.78, 56, 170], [-0.6, 60, 130], [0.42, 64, 160], [0.6, 54, 190], [0.78, 70, 140]].forEach(([q, w, h]) => bldg(c, cx + rx * q, hz, w, h, ink, paper, { wx: 8, wy: 12 }));
  // the bank: a stylobate, eight columns, entablature, pediment
  const bx = cx - 170, bw = 340, top = hz - 140;
  c.fillStyle = paper; c.fillRect(bx - 10, top, bw + 20, 140);
  c.strokeStyle = ink; c.lineWidth = 1.6;
  for (let k = 0; k < 3; k++) { c.strokeRect(bx - 18 - k * 8, hz - 8 + k * 0, bw + 36 + k * 16, 8); }
  c.beginPath(); c.moveTo(bx - 14, top); c.lineTo(cx, top - 54); c.lineTo(bx + bw + 14, top); c.closePath(); c.fillStyle = paper; c.fill(); c.stroke();
  c.beginPath(); c.moveTo(bx + 14, top - 6); c.lineTo(cx, top - 44); c.lineTo(bx + bw - 14, top - 6); c.closePath(); c.stroke();
  c.strokeRect(bx - 14, top, bw + 28, 22); c.lineWidth = 0.8; for (let x = bx - 10; x < bx + bw + 10; x += 7) { c.beginPath(); c.moveTo(x, top + 16); c.lineTo(x, top + 22); c.stroke(); }
  for (let k = 0; k < 8; k++) {
    const x = bx + 14 + (k * (bw - 28)) / 7;
    c.lineWidth = 1.4; c.strokeRect(x - 9, top + 22, 18, 6); c.strokeRect(x - 9, hz - 14, 18, 6);
    c.lineWidth = 0.8; for (let f = -2; f <= 2; f++) { c.beginPath(); c.moveTo(x + f * 3, top + 28); c.lineTo(x + f * 3, hz - 14); c.stroke(); }
  }
  c.lineWidth = 0.7; c.globalAlpha = 0.6; for (let y = top + 30; y < hz - 14; y += 4) { c.beginPath(); c.moveTo(bx + 8, y); c.lineTo(bx + bw - 8, y); c.stroke(); } c.globalAlpha = 1;
  c.fillStyle = ink; c.fillRect(cx - 16, hz - 70, 32, 56);
  c.strokeStyle = ink; c.lineWidth = 1; for (let y = hz + 4; y < cy + ry; y += 5) { c.globalAlpha = 0.5; c.beginPath(); c.moveTo(cx - rx, y); c.lineTo(cx + rx, y); c.stroke(); } c.globalAlpha = 1;
};
V.orchard = (c, cx, cy, rx, ry, ink, paper) => {
  const hz = cy + ry * 0.1, sx = cx + rx * 0.4;
  sky(c, cx, cy, rx, ry, hz, sx, hz, ink); sunRays(c, sx, hz, ry * 0.32, rx * 1.3, ink);
  hills(c, cx, rx, hz, (x) => hz - 8 - 20 * Math.sin((x - cx) / 90 + 0.8), ink, paper, cy + ry);
  hills(c, cx, rx, hz, (x) => hz + 36 - 16 * Math.sin((x - cx) / 70 + 2.2), ink, paper, cy + ry);
  for (let row = 0; row < 3; row++) for (let k = 0; k < 9 - row; k++) { const x = cx - rx * 0.85 + k * (rx * 1.5) / (8 - row) + row * 20, base = hz + 52 + row * 34; treeBall(c, x, base, 10 + row * 4, ink, paper); }
  // a barn with a gambrel roof
  const bx = cx + rx * 0.45, by = hz + 34;
  c.fillStyle = paper; c.strokeStyle = ink; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(bx - 40, by); c.lineTo(bx - 40, by - 34); c.lineTo(bx - 28, by - 52); c.lineTo(bx, by - 62); c.lineTo(bx + 28, by - 52); c.lineTo(bx + 40, by - 34); c.lineTo(bx + 40, by); c.closePath(); c.fill(); c.stroke();
  c.strokeRect(bx - 12, by - 26, 24, 26); c.beginPath(); c.moveTo(bx - 12, by - 26); c.lineTo(bx + 12, by); c.moveTo(bx + 12, by - 26); c.lineTo(bx - 12, by); c.stroke();
  c.lineWidth = 0.8; for (let x = bx - 38; x < bx + 38; x += 4) { c.beginPath(); c.moveTo(x, by - 33); c.lineTo(x, by - 2); c.stroke(); }
};
const globe = (c, cx, cy, R, ink, paper, tilt = 0.35) => {
  c.fillStyle = paper; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();
  c.strokeStyle = ink; c.lineWidth = 2; c.stroke();
  c.lineWidth = 1;
  for (let k = -3; k <= 3; k++) { const y = cy + (k / 4) * R, w = Math.sqrt(Math.max(0, 1 - (k / 4) ** 2)) * R; c.beginPath(); c.ellipse(cx, y, w, w * tilt * 0.3, 0, 0, Math.PI * 2); c.stroke(); }
  for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(cx, cy, R * Math.abs(Math.cos((k / 6) * Math.PI)), R, 0, 0, Math.PI * 2); c.stroke(); }
  // continents as hatched blobs
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.clip();
  const blob = (bx, by, s, seed) => { c.beginPath(); for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.2) { const r = s * (0.7 + 0.3 * Math.sin(t * 3 + seed) + 0.15 * Math.sin(t * 7 + seed * 2)); const x = bx + Math.cos(t) * r * 1.2, y = by + Math.sin(t) * r; t ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); c.fillStyle = paper; c.fill(); c.lineWidth = 1.6; c.stroke(); c.save(); c.clip(); c.lineWidth = 0.9; for (let x = bx - s * 2; x < bx + s * 2; x += 4) { c.beginPath(); c.moveTo(x, by - s * 1.5); c.lineTo(x + s, by + s * 1.5); c.stroke(); } c.restore(); };
  blob(cx - R * 0.35, cy - R * 0.25, R * 0.28, 1); blob(cx - R * 0.15, cy + R * 0.38, R * 0.2, 3); blob(cx + R * 0.38, cy - R * 0.1, R * 0.32, 5);
  c.restore();
};
const laurel = (c, cx, cy, R, ink, paper) => {
  c.strokeStyle = ink; c.lineWidth = 1.4;
  [-1, 1].forEach((s) => {
    c.beginPath(); c.arc(cx, cy, R, Math.PI / 2 + s * 0.25, Math.PI / 2 + s * 2.4, s < 0); c.stroke();
    for (let k = 0; k < 11; k++) { const a = Math.PI / 2 + s * (0.35 + k * 0.19), x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R; c.fillStyle = paper; c.beginPath(); c.ellipse(x + Math.cos(a) * 9, y + Math.sin(a) * 9, 13, 5, a + s * 0.8, 0, Math.PI * 2); c.fill(); c.stroke(); c.beginPath(); c.ellipse(x - Math.cos(a) * 9, y - Math.sin(a) * 9, 12, 4.5, a - s * 0.8, 0, Math.PI * 2); c.fill(); c.stroke(); }
  });
};
V.globe = (c, cx, cy, rx, ry, ink, paper) => {
  sky(c, cx, cy, rx, ry, cy + ry, cx, cy, ink);
  c.strokeStyle = ink; c.globalAlpha = 0.45; c.lineWidth = 1.1; for (let k = 0; k < 60; k++) { const a = (k / 60) * Math.PI * 2; c.beginPath(); c.moveTo(cx + Math.cos(a) * ry * 0.95, cy + Math.sin(a) * ry * 0.95); c.lineTo(cx + Math.cos(a) * rx * 1.2, cy + Math.sin(a) * rx * 1.2); c.stroke(); } c.globalAlpha = 1;
  laurel(c, cx, cy, ry * 0.98, ink, paper);
  globe(c, cx, cy, ry * 0.72, ink, paper);
};
V.globe2 = (c, cx, cy, rx, ry, ink, paper) => {   // a globe on a stand over a band of rays and a ribbon
  sky(c, cx, cy, rx, ry, cy + ry, cx, cy - 10, ink);
  globe(c, cx, cy - 8, ry * 0.66, ink, paper, 0.5);
  c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy - 8, ry * 0.75, Math.PI * 0.75, Math.PI * 2.25); c.stroke();
  c.fillStyle = ink; c.fillRect(cx - 4, cy + ry * 0.67, 8, 22); c.fillRect(cx - 40, cy + ry * 0.67 + 20, 80, 8);
  [-1, 1].forEach((s) => { c.strokeStyle = ink; c.lineWidth = 1.2; for (let k = 0; k < 4; k++) { c.beginPath(); for (let t = 0; t <= 1; t += 0.02) { const x = cx + s * (ry * 0.9 + t * (rx - ry * 0.9)), y = cy + (12 + k * 8) * Math.sin(t * Math.PI * 2 + k) * (1 - t * 0.5); t ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } });
};
const vignette = (c, kind, cx, cy, rx, ry, ink, paper) => {
  c.save(); c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); c.clip();
  c.fillStyle = paper; c.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
  V[kind](c, cx, cy, rx, ry, ink, paper);
  c.restore();
  c.strokeStyle = ink; c.lineWidth = 3; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 1;
  for (let k = 0; k < 3; k++) { c.beginPath(); for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.01) { const o = 9 + 5 * Math.sin(t * 90 + k * 2.1); const x = cx + Math.cos(t) * (rx + o), y = cy + Math.sin(t) * (ry + o); t ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
  c.lineWidth = 2; c.beginPath(); c.ellipse(cx, cy, rx + 18, ry + 18, 0, 0, Math.PI * 2); c.stroke();
};
// an illegible facsimile signature flourish (no name): a run of loops and a long tail
const flourish = (c, x, y, w, seed, ink) => {
  c.strokeStyle = ink; c.lineWidth = 2.6; c.lineCap = "round"; c.beginPath(); c.moveTo(x, y);
  let px = x;
  for (let k = 0; k < 9; k++) {
    const nx = px + w / 11, h = 18 + rnd(seed + k) * 30;
    c.bezierCurveTo(px + 6, y - h, nx - 12, y - h * 0.9, nx - 4, y + 4); c.bezierCurveTo(nx - 2, y + 10, nx + 2, y - 6, nx + 4, y - 2);
    px = nx;
  }
  c.bezierCurveTo(px + 40, y + 16, px + 60, y - 6, x + w * 1.02, y - 14); c.stroke();
  c.lineWidth = 1.8; c.beginPath(); c.moveTo(x + w * 0.1, y + 12); c.quadraticCurveTo(x + w * 0.5, y + 22, x + w * 0.95, y + 8); c.stroke();
  c.lineCap = "butt";
};
// the printed corporate seal: two rings, the company name around the top, the state around the bottom, CORPORATE SEAL in the centre
const printedSeal = (c, cx, cy, R, co) => {
  const ink = co.ink;
  c.save();
  c.fillStyle = co.paper; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();
  c.strokeStyle = ink; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 1; for (let k = 0; k < 140; k++) { const a = (k / 140) * Math.PI * 2; c.beginPath(); c.moveTo(cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92); c.lineTo(cx + Math.cos(a) * R * 0.98, cy + Math.sin(a) * R * 0.98); c.stroke(); }
  c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, R * 0.62, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, R * 0.57, 0, Math.PI * 2); c.stroke();
  const ring = (text, r, top, px) => {
    c.font = `700 ${px}px ${CSERIF}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = ink;
    const ws = [...text].map((ch) => c.measureText(ch).width + px * 0.12), tot = ws.reduce((a, b) => a + b, 0);
    let s = -tot / 2;
    [...text].forEach((ch, i) => { const a = (s + ws[i] / 2) / r; s += ws[i]; c.save(); if (top) { c.translate(cx + Math.sin(a) * r, cy - Math.cos(a) * r); c.rotate(a); } else { c.translate(cx + Math.sin(a) * r, cy + Math.cos(a) * r); c.rotate(-a); } c.fillText(ch, 0, 0); c.restore(); });
  };
  let px = Math.round(R * 0.15); c.font = `700 ${px}px ${CSERIF}`;
  while (px > 8 && ([...co.short].reduce((a, ch) => a + c.measureText(ch).width + px * 0.12, 0)) / (R * 0.77) > 2.5) { px -= 1; c.font = `700 ${px}px ${CSERIF}`; }
  ring(co.short, R * 0.77, true, px);
  ring(co.state, R * 0.77, false, Math.round(R * 0.13));
  c.font = `700 ${Math.round(R * 0.13)}px ${CSERIF}`; c.fillText("★", cx - R * 0.74, cy + R * 0.18); c.fillText("★", cx + R * 0.74, cy + R * 0.18);
  c.textBaseline = "middle"; c.font = `700 ${Math.round(R * 0.15)}px ${CSERIF}`; c.fillText("CORPORATE", cx, cy - R * 0.14);
  c.font = `700 ${Math.round(R * 0.2)}px ${CSERIF}`; c.fillText("SEAL", cx, cy + R * 0.14);
  c.lineWidth = 1; c.beginPath(); c.moveTo(cx - R * 0.4, cy); c.lineTo(cx + R * 0.4, cy); c.stroke();
  c.restore(); c.textBaseline = "alphabetic";
};
// ── one certificate face ───────────────────────────────────────────────────────────────────────────────────────────────
const drawCert = (c, co, idx) => {
  const w = DW, h = DH, ink = co.ink, paper = co.paper, tint = co.tint;
  c.fillStyle = paper; c.fillRect(0, 0, w, h);
  const g = c.createRadialGradient(w / 2, h / 2, 200, w / 2, h / 2, w * 0.7); g.addColorStop(0, "rgba(255,255,255,0.25)"); g.addColorStop(1, "rgba(120,100,70,0.10)"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(${rnd(i + idx * 9) < 0.5 ? "120,110,90" : "255,255,255"},${0.02 + rnd(i + 4) * 0.05})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2.5, 2.5); }
  // security tint: a lattice of fine waves in the company's tint, and a large rosette under the text
  c.save(); c.beginPath(); c.rect(176, 176, w - 352, h - 352); c.clip();
  c.strokeStyle = tint + "0.16)"; c.lineWidth = 1.2;
  for (let y = 150; y < h; y += 12) { c.beginPath(); for (let x = 150; x < w; x += 8) { const yy = y + 5 * Math.sin(x / (24 + idx) + y / 40); x === 150 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); }
  for (let y = 150; y < h; y += 12) { c.beginPath(); for (let x = 150; x < w; x += 8) { const yy = y + 5 * Math.sin(-x / (26 + idx) + y / 37 + 1.3); x === 150 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); }
  c.strokeStyle = tint + "0.13)"; for (let k = 0; k < 40; k++) { c.beginPath(); c.ellipse(w / 2, 1000, 380, 130, (k * Math.PI) / 40, 0, Math.PI * 2); c.stroke(); }
  c.restore();
  // the border
  c.strokeStyle = ink; c.lineWidth = 8; c.strokeRect(36, 36, w - 72, h - 72);
  c.lineWidth = 2; c.strokeRect(52, 52, w - 104, h - 104);
  const B = 100; c.strokeStyle = ink; c.globalAlpha = 0.85;
  const per = 50 + (idx % 4) * 6, amp = 30 + (idx % 3) * 4;
  bandLine(c, B, B, w - B, B, amp, 6, per, 0, 1.2); bandLine(c, B, h - B, w - B, h - B, amp, 6, per, 1, 1.2);
  bandLine(c, B, B, B, h - B, amp, 6, per, 2, 1.2); bandLine(c, w - B, B, w - B, h - B, amp, 6, per, 3, 1.2);
  c.globalAlpha = 0.5;
  bandLine(c, B, B, w - B, B, 20, 3, 22, 0.5, 1); bandLine(c, B, h - B, w - B, h - B, 20, 3, 22, 1.5, 1);
  bandLine(c, B, B, B, h - B, 20, 3, 22, 2.5, 1); bandLine(c, w - B, B, w - B, h - B, 20, 3, 22, 3.5, 1);
  c.globalAlpha = 1;
  c.lineWidth = 2; c.strokeRect(150, 150, w - 300, h - 300); c.lineWidth = 5; c.strokeRect(160, 160, w - 320, h - 320); c.lineWidth = 1; c.strokeRect(170, 170, w - 340, h - 340);
  c.fillStyle = ink;
  for (let x = 190; x < w - 190; x += 18) [176, h - 176].forEach((y) => { c.beginPath(); c.moveTo(x, y - 3); c.lineTo(x + 5, y); c.lineTo(x, y + 3); c.lineTo(x - 5, y); c.closePath(); c.fill(); });
  for (let y = 190; y < h - 190; y += 18) [176, w - 176].forEach((x) => { c.beginPath(); c.moveTo(x - 3, y); c.lineTo(x, y + 5); c.lineTo(x + 3, y); c.lineTo(x, y - 5); c.closePath(); c.fill(); });
  [[B, B], [w - B, B], [B, h - B], [w - B, h - B]].forEach(([x, y], i) => rosette(c, x, y, 80, i + idx, ink, paper));
  [[B, h / 2], [w - B, h / 2]].forEach(([x, y], i) => rosette(c, x, y, 54, i + 5 + idx, ink, paper));
  // COMMON STOCK and SHARES boxes (an engraved frame on a fine tint; the fields are left empty)
  const box = (x0, label) => {
    const y0 = 200, bw = 340, bh = 130;
    c.fillStyle = tint + "0.10)"; c.fillRect(x0, y0, bw, bh);
    c.save(); c.beginPath(); c.rect(x0, y0, bw, bh); c.clip(); c.strokeStyle = tint + "0.35)"; c.lineWidth = 1; for (let k = 0; k < 26; k++) { c.beginPath(); for (let x = x0; x <= x0 + bw; x += 4) { const y = y0 + 52 + k * 3.2 + 6 * Math.sin(x / 14 + k * 0.4); x === x0 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); } c.restore();
    c.strokeStyle = ink; c.lineWidth = 4; c.strokeRect(x0, y0, bw, bh); c.lineWidth = 1.2; c.strokeRect(x0 + 9, y0 + 9, bw - 18, bh - 18);
    c.fillStyle = paper; c.fillRect(x0 + 30, y0 + 16, bw - 60, 34);
    c.fillStyle = ink; c.font = `700 26px ${CSERIF}`; c.textAlign = "center"; spaced(c, label, x0 + bw / 2, y0 + 42, 6);
  };
  box(214, "COMMON STOCK"); box(w - 214 - 340, "SHARES");
  c.fillStyle = ink; c.textAlign = "center";
  c.font = `700 26px ${CSERIF}`; spaced(c, "INCORPORATED UNDER THE LAWS", w / 2, 236, 4);
  spaced(c, "OF THE STATE OF " + co.state, w / 2, 272, 4);
  c.font = `italic 400 24px ${CSERIF}`; c.fillText("SEE REVERSE FOR CERTAIN DEFINITIONS", w / 2, 312);
  // the vignette
  vignette(c, co.vig, w / 2, 500, 300, 150, ink, paper);
  [-1, 1].forEach((s) => { c.strokeStyle = ink; c.lineWidth = 1.6; for (let k = 0; k < 4; k++) { c.beginPath(); for (let t = 0; t <= 1; t += 0.01) { const x = w / 2 + s * (345 + t * 360), y = 500 + (18 + k * 9) * Math.sin(t * Math.PI * 2.2 + k) * (1 - t * 0.6); t ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } });
  // the company's name (the hero line), set to fit
  const nm = co.name;
  const px = fitFont(c, nm, 700, 104, w - 520, 6);
  c.font = `700 ${px}px ${CSERIF}`;
  c.save(); c.globalAlpha = 0.25; c.fillStyle = ink; c.translate(3, 3); arched(c, nm, w / 2, 790, 3200, 6); c.restore();
  c.fillStyle = ink; arched(c, nm, w / 2, 790, 3200, 6);
  // the certifying text
  c.font = `700 40px ${CSERIF}`; spaced(c, "THIS CERTIFIES THAT", w / 2, 880, 10);
  c.fillStyle = ink; c.fillRect(560, 944, w - 1120, 2.5);
  c.font = `italic 400 38px ${CSERIF}`; c.fillText("is the owner of", w / 2, 1000);
  c.fillRect(w / 2 - 260, 1010, 520, 2);   // the share-count line (left blank)
  c.font = `700 36px ${CSERIF}`; spaced(c, "FULLY PAID AND NON-ASSESSABLE SHARES OF THE COMMON STOCK OF", w / 2, 1058, 2.5);
  c.font = `700 40px ${CSERIF}`; const p2 = fitFont(c, nm, 700, 40, w - 700, 4); c.font = `700 ${p2}px ${CSERIF}`; spaced(c, nm, w / 2, 1104, 4);
  c.font = `400 25px ${CSERIF}`;
  c.fillText("transferable on the books of the Corporation by the holder hereof in person or by duly authorized attorney upon surrender", w / 2, 1146);
  c.fillText("of this Certificate properly endorsed. This Certificate is not valid until countersigned by the Transfer Agent and registered by the Registrar.", w / 2, 1178);
  c.font = `italic 400 25px ${CSERIF}`;
  c.fillText("In Witness Whereof, the Corporation has caused this Certificate to be signed by the facsimile signatures of its duly authorized officers.", w / 2, 1210);
  // the seal and the officers
  printedSeal(c, w / 2, 1318, 104, co);
  c.textAlign = "left"; c.font = `400 28px ${CSERIF}`; c.fillStyle = ink; c.fillText("Dated", 300, 1262); c.fillRect(388, 1266, 300, 2);
  [[600, "SECRETARY"], [w - 600, "CHAIRMAN OF THE BOARD"]].forEach(([x, t], i) => {
    flourish(c, x - 200, 1328, 380, idx * 13 + i * 7, ink);
    c.fillStyle = ink; c.fillRect(x - 250, 1346, 500, 2.5);
    c.font = `700 24px ${CSERIF}`; c.textAlign = "center"; spaced(c, t, x, 1380, 6);
  });
  // the countersignature block (top right of the lower field)
  c.textAlign = "left"; c.fillStyle = ink; c.font = `700 20px ${CSERIF}`;
  c.fillText("COUNTERSIGNED AND REGISTERED:", w - 690, 1250);
  c.font = `400 19px ${CSERIF}`; c.fillText("TRANSFER AGENT AND REGISTRAR", w - 690, 1274); c.fillText("BY", w - 690, 1300); c.fillRect(w - 650, 1302, 280, 1.5);
  c.font = `italic 400 17px ${CSERIF}`; c.fillText("AUTHORIZED SIGNATURE", w - 600, 1322);
};
/** the certificate face of company i (index into COMPANIES), as a texture */
export const certTex = (i) => canvasTex("c_cert_" + COMPANIES[i].key, TW, TH, (c, w, h) => { c.save(); c.scale(w / DW, h / DH); drawCert(c, COMPANIES[i], i); c.restore(); });
export const certIndex = (key) => COMPANIES.findIndex((o) => o.key === key);
/** one certificate as a thin paper sheet: [edge×4, face (+y), back (-y)] materials for a BoxGeometry(CW, T, CH) */
const matCache = new Map();
export const certMats = (i, o = {}) => {
  const k = i + "_" + (o.tag ?? "");
  if (matCache.has(k)) return matCache.get(k);
  const co = COMPANIES[i];
  const edge = new THREE.MeshStandardMaterial({ color: co.paper, roughness: 0.85 });
  const face = new THREE.MeshStandardMaterial({ map: certTex(i), color: o.color ?? "#E6E6E2", roughness: 0.7, envMapIntensity: 0.35 });
  const back = new THREE.MeshStandardMaterial({ color: co.paper, roughness: 0.85 });
  const m = [edge, edge, face, back, edge, edge];
  matCache.set(k, m);
  return m;
};
