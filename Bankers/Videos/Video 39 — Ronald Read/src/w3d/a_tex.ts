// @ts-nocheck
// ★ V39 builder A — the STORE SET's print and surfaces (canvas, drawn once with the house fonts): the JCPenney store in Brattleboro,
//   Vermont, at night. Real words on every sign and label (CLAUDE.md 3-D World: no grey placeholder lines).
//   Atlases are cells on one canvas; `cell(A, i)` → the [u0, v0, u1, v1] rect a Mesher box/quad maps into.
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { BODY, FIGURE } from "./fonts3d";

export const SERIF = `"Liberation Serif", "Times New Roman", "DejaVu Serif", Georgia, serif`;
export const MONO = `"Liberation Mono", "Courier New", "DejaVu Sans Mono", monospace`;
const F = (wt, px, fam = BODY) => `${wt} ${px}px ${fam}`;
export const rep = (t, x = 1, y = x) => { const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(x, y); c.needsUpdate = true; return c; };
export const lin = (t) => { t.colorSpace = THREE.NoColorSpace; return t; };
// an atlas of cols × rows cells; i counts left→right, top→bottom; inset in px keeps mip bleed out
export const cellOf = (W, H, cols, rows, inset = 3) => (i) => {
  const cw = W / cols, ch = H / rows, cx = (i % cols) * cw, cy = Math.floor(i / cols) * ch;
  return [(cx + inset) / W, 1 - (cy + ch - inset) / H, (cx + cw - inset) / W, 1 - (cy + inset) / H];
};
const fitText = (c, s, maxW, px, wt = 800, fam = BODY) => { let p = px; c.font = F(wt, p, fam); while (c.measureText(s).width > maxW && p > 8) { p -= 2; c.font = F(wt, p, fam); } return p; };

// ── floors ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// TERRAZZO (the main aisle): a 2.4 m tile poured between brass divider strips; marble chips of five tones in a pale grey matrix
export const terrazzoTex = () => canvasTex("a_terrazzo", 1024, 1024, (c, w, h) => {
  c.fillStyle = "#C3C8CF"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 26000; i++) {
    const r = rnd(i * 3 + 1), x = rnd(i * 3 + 2) * w, y = rnd(i * 3 + 3) * h, s = 1.2 + rnd(i + 7) * (r < 0.04 ? 7 : 3.2);
    c.fillStyle = r < 0.3 ? "#E9ECEF" : r < 0.55 ? "#9AA3AE" : r < 0.75 ? "#6F7A88" : r < 0.9 ? "#B7B2A8" : r < 0.97 ? "#3E4856" : "#8C6E5A";
    c.beginPath(); c.ellipse(x, y, s, s * (0.55 + rnd(i + 9) * 0.45), rnd(i + 11) * 3, 0, 7); c.fill();
  }
  // the divider strips at the tile's edges (brass, worn)
  c.fillStyle = "#9C8A63"; c.fillRect(0, 0, w, 5); c.fillRect(0, 0, 5, h);
  c.fillStyle = "rgba(255,240,200,0.35)"; c.fillRect(0, 1, w, 1); c.fillRect(1, 0, 1, h);
});
// CARPET (the departments): a dark blue-grey loop pile with a small woven diamond figure, the 1990s store carpet
export const carpetTex = () => canvasTex("a_carpet", 512, 512, (c, w, h) => {
  c.fillStyle = "#3A4558"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 30000; i++) { const g = rnd(i) < 0.5 ? "20,26,36" : "120,135,160"; c.fillStyle = `rgba(${g},${0.08 + rnd(i + 1) * 0.12})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2, 2); }
  c.strokeStyle = "rgba(140,160,190,0.22)"; c.lineWidth = 3;
  for (let x = 0; x < w; x += 64) for (let y = 0; y < h; y += 64) { c.beginPath(); c.moveTo(x + 32, y + 12); c.lineTo(x + 52, y + 32); c.lineTo(x + 32, y + 52); c.lineTo(x + 12, y + 32); c.closePath(); c.stroke(); }
  c.fillStyle = "rgba(90,110,140,0.25)"; for (let x = 0; x < w; x += 64) for (let y = 0; y < h; y += 64) c.fillRect(x + 30, y + 30, 4, 4);
});
// ── the ceiling: 2 × 4 ft fissured mineral tiles in a white T-bar grid (one texture = 1.22 × 1.22 m, two tiles) ───────────────
export const ceilTex = () => canvasTex("a_ceil", 512, 512, (c, w, h) => {
  c.fillStyle = "#D9DEE4"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(70,80,95,${0.1 + rnd(i) * 0.25})`; const x = rnd(i + 1) * w, y = rnd(i + 2) * h; c.fillRect(x, y, 1 + rnd(i + 3) * 5, 1.5); }
  for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(60,70,85,0.3)`; c.beginPath(); c.arc(rnd(i + 5) * w, rnd(i + 6) * h, 1.3, 0, 7); c.fill(); }
  c.fillStyle = "#F2F4F6"; c.fillRect(0, 0, w, 7); c.fillRect(0, 0, 7, h); c.fillRect(w / 2 - 3, 0, 6, h);
  c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(0, 7, w, 2); c.fillRect(7, 0, 2, h); c.fillRect(w / 2 + 3, 0, 2, h);
});
// a troffer's prismatic lens in its white steel door frame
export const lensTex = (lit) => canvasTex("a_lens" + (lit ? "L" : "D"), 256, 512, (c, w, h) => {
  c.fillStyle = lit ? "#FFF4E0" : "#8E99A8"; c.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 8) for (let y = 0; y < h; y += 8) { c.fillStyle = (x + y) % 16 ? (lit ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.18)") : (lit ? "rgba(230,200,150,0.35)" : "rgba(0,0,0,0.12)"); c.fillRect(x + 1, y + 1, 6, 6); }
  if (!lit) { c.fillStyle = "rgba(40,50,66,0.35)"; for (const x of [0.25, 0.5, 0.75]) c.fillRect(w * x - 10, 30, 20, h - 60); }   // the dark tubes behind the lens
  c.fillStyle = "#EEF1F4"; c.fillRect(0, 0, w, 14); c.fillRect(0, h - 14, w, 14); c.fillRect(0, 0, 14, h); c.fillRect(w - 14, 0, 14, h);
});
// a square ceiling air diffuser (four-way louvres)
export const diffuserTex = () => canvasTex("a_diff", 256, 256, (c, w, h) => {
  c.fillStyle = "#E6EAEE"; c.fillRect(0, 0, w, h);
  for (let k = 0; k < 6; k++) { const m = 18 + k * 18; c.strokeStyle = k % 2 ? "#B4BCC6" : "#7F8A98"; c.lineWidth = 5; c.strokeRect(m, m, w - 2 * m, h - 2 * m); }
  c.fillStyle = "#59636F"; c.fillRect(w / 2 - 22, h / 2 - 22, 44, 44);
});
// slatwall (painted MDF with 3-inch grooves and their aluminium inserts)
export const slatTex = () => canvasTex("a_slat", 256, 256, (c, w, h) => {
  c.fillStyle = "#C9CED6"; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 32) { c.fillStyle = "#59616C"; c.fillRect(0, y + 24, w, 5); c.fillStyle = "#AEB6C1"; c.fillRect(0, y + 29, w, 2); }
});
// painted plaster wall (a faint roller texture)
export const paintTex = () => canvasTex("a_paint", 256, 256, (c, w, h) => {
  c.fillStyle = "#FFFFFF"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 5000; i++) { c.fillStyle = `rgba(0,0,0,${rnd(i) * 0.04})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 3, 2); }
});
// light wood veneer for the display tables (grain running along u)
export const woodTex = () => canvasTex("a_wood", 512, 512, (c, w, h) => {
  c.fillStyle = "#B08A62"; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 2) { const v = Math.sin(y * 0.11 + Math.sin(y * 0.013) * 6) * 0.5 + 0.5; c.fillStyle = `rgba(${90 + v * 40},${60 + v * 26},${36 + v * 14},${0.18 + rnd(y) * 0.12})`; c.fillRect(0, y, w, 2); }
  for (let i = 0; i < 60; i++) { c.strokeStyle = "rgba(80,50,28,0.25)"; c.lineWidth = 1; c.beginPath(); const y = rnd(i) * h; c.moveTo(0, y); for (let x = 0; x < w; x += 16) c.lineTo(x, y + 6 * Math.sin(x / 70 + i)); c.stroke(); }
});

// ── the department signs (hanging two-faced panels; navy with white letters and a light-blue rule) ─────────────────────────
export const SIGNS = ["MEN'S", "WOMEN'S", "HOME", "SHOES", "FINE JEWELRY", "CHILDREN'S", "CATALOG", "FITTING ROOMS", "CUSTOMER SERVICE", "HANDBAGS",
  "BED & BATH", "DRESS SHIRTS", "DENIM", "OUTERWEAR", "ATHLETIC", "CLEARANCE"];
export const SIGN_A = { W: 2048, H: 2048, cols: 2, rows: 8 };
export const signCell = cellOf(2048, 2048, 2, 8, 4);
export const signTex = () => canvasTex("a_signs", 2048, 2048, (c) => {
  SIGNS.forEach((s, i) => {
    const x = (i % 2) * 1024, y = Math.floor(i / 2) * 256, big = i < 7;
    const g = c.createLinearGradient(0, y, 0, y + 256); g.addColorStop(0, big ? "#0E3B73" : "#EEF2F7"); g.addColorStop(1, big ? "#082A55" : "#DCE3EC");
    c.fillStyle = g; c.fillRect(x, y, 1024, 256);
    c.fillStyle = big ? "#7FB4F2" : "#1F5FB4"; c.fillRect(x, y + 226, 1024, 12);
    c.fillStyle = big ? "#F4F8FD" : "#0B2F5E"; c.textAlign = "center"; c.textBaseline = "middle";
    const p = fitText(c, s, 900, big ? 150 : 104, 800); c.font = F(800, p);
    if ("letterSpacing" in c) c.letterSpacing = big ? "10px" : "4px";
    c.fillText(s, x + 512, y + 118);
    if ("letterSpacing" in c) c.letterSpacing = "0px";
  });
});
// small fixture signs on chrome sign holders (rack toppers): real department words, no figures
export const TOPPERS = ["NEW ARRIVALS", "DRESS SHIRTS", "SWEATERS", "DENIM", "BATH TOWELS", "BEDDING", "DRESS SHOES", "ATHLETIC SHOES", "OUTERWEAR", "KNIT TOPS", "TIES", "SLACKS"];
export const topperCell = cellOf(1024, 1024, 2, 6, 3);
export const topperTex = () => canvasTex("a_toppers", 1024, 1024, (c) => {
  TOPPERS.forEach((s, i) => {
    const x = (i % 2) * 512, y = Math.floor(i / 2) * 170;
    c.fillStyle = "#F6F8FB"; c.fillRect(x, y, 512, 170);
    c.fillStyle = "#0B3F7A"; c.fillRect(x, y, 512, 30);
    c.fillStyle = "#FFFFFF"; c.font = F(700, 20); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("JCPenney", x + 256, y + 16);
    c.fillStyle = "#0B2547"; const p = fitText(c, s, 460, 64, 800); c.font = F(800, p); c.fillText(s, x + 256, y + 100);
  });
});

// ── clothing: garment fronts (white line art; the Mesher's vertex colour dyes them) ────────────────────────────────────────
export const garCell = cellOf(1024, 1024, 4, 2, 3);
// 0 dress shirt · 1 sweater · 2 jeans · 3 jacket · 4 polo · 5 dress · 6 flannel check · 7 slacks
export const garmentTex = () => canvasTex("a_garments", 1024, 1024, (c) => {
  const cw = 256, ch = 512;
  const base = (x, y) => { c.fillStyle = "#E8E8E8"; c.fillRect(x, y, cw, ch); for (let i = 0; i < 1800; i++) { c.fillStyle = `rgba(0,0,0,${rnd(i + x + y) * 0.06})`; c.fillRect(x + rnd(i + 1) * cw, y + rnd(i + 2) * ch, 2, 1); } };
  const shade = (x, y) => { const g = c.createLinearGradient(x, 0, x + cw, 0); g.addColorStop(0, "rgba(0,0,0,0.28)"); g.addColorStop(0.18, "rgba(0,0,0,0)"); g.addColorStop(0.82, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.28)"); c.fillStyle = g; c.fillRect(x, y, cw, ch); };
  for (let i = 0; i < 8; i++) {
    const x = (i % 4) * cw, y = Math.floor(i / 4) * ch; base(x, y);
    c.strokeStyle = "rgba(0,0,0,0.35)"; c.fillStyle = "rgba(0,0,0,0.3)"; c.lineWidth = 3;
    if (i === 0 || i === 4 || i === 6) {   // collar, placket, buttons, pocket (polo: 3 buttons, no pocket)
      if (i === 6) { for (let k = 0; k < cw; k += 32) { c.fillStyle = "rgba(0,0,0,0.16)"; c.fillRect(x + k, y, 14, ch); } for (let k = 0; k < ch; k += 32) { c.fillStyle = "rgba(0,0,0,0.16)"; c.fillRect(x, y + k, cw, 14); } c.fillStyle = "rgba(0,0,0,0.3)"; }
      c.fillStyle = "rgba(255,255,255,0.5)"; c.beginPath(); c.moveTo(x + 78, y + 18); c.lineTo(x + 128, y + 70); c.lineTo(x + 178, y + 18); c.lineTo(x + 160, y + 6); c.lineTo(x + 96, y + 6); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(x + 128, y + 70); c.lineTo(x + 128, y + (i === 4 ? 150 : ch)); c.stroke();
      c.fillStyle = "rgba(0,0,0,0.45)";
      for (let k = 0; k < (i === 4 ? 3 : 7); k++) { c.beginPath(); c.arc(x + 136, y + 92 + k * (i === 4 ? 26 : 62), 5, 0, 7); c.fill(); }
      if (i !== 4) c.strokeRect(x + 150, y + 120, 54, 60);
    } else if (i === 1) {   // a crew-neck sweater: knit ribs, ribbed hem
      for (let k = 0; k < cw; k += 9) { c.fillStyle = "rgba(0,0,0,0.09)"; c.fillRect(x + k, y, 4, ch); }
      c.lineWidth = 8; c.beginPath(); c.arc(x + 128, y - 8, 58, 0.2, Math.PI - 0.2); c.stroke();
      for (let k = 0; k < cw; k += 7) { c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(x + k, y + ch - 56, 3, 56); }
    } else if (i === 2 || i === 7) {   // jeans / slacks folded over the hanger bar: waistband, fly, pockets, inseam
      if (i === 2) for (let k = 0; k < 2600; k++) { c.fillStyle = `rgba(255,255,255,${rnd(k + 70) * 0.12})`; c.fillRect(x + rnd(k + 71) * cw, y + rnd(k + 72) * ch, 1, 3); }
      c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(x, y + 10, cw, 34);
      c.strokeStyle = i === 2 ? "rgba(200,150,60,0.8)" : "rgba(0,0,0,0.3)"; c.lineWidth = 2.5;
      c.beginPath(); c.moveTo(x + 128, y + 44); c.lineTo(x + 128, y + 200); c.stroke();
      c.beginPath(); c.moveTo(x + 30, y + 44); c.quadraticCurveTo(x + 40, y + 120, x + 98, y + 130); c.stroke();
      c.beginPath(); c.moveTo(x + 226, y + 44); c.quadraticCurveTo(x + 216, y + 120, x + 158, y + 130); c.stroke();
      c.strokeStyle = "rgba(0,0,0,0.3)"; c.beginPath(); c.moveTo(x + 128, y + 200); c.lineTo(x + 128, y + ch); c.stroke();
      c.fillStyle = "rgba(0,0,0,0.5)"; c.beginPath(); c.arc(x + 128, y + 27, 7, 0, 7); c.fill();
    } else if (i === 3) {   // a sport coat: lapels, buttons, flap pockets
      c.fillStyle = "rgba(0,0,0,0.18)"; c.beginPath(); c.moveTo(x + 70, y); c.lineTo(x + 128, y + 220); c.lineTo(x + 186, y); c.closePath(); c.fill();
      c.lineWidth = 4; c.beginPath(); c.moveTo(x + 70, y); c.lineTo(x + 108, y + 140); c.lineTo(x + 128, y + 230); c.lineTo(x + 148, y + 140); c.lineTo(x + 186, y); c.stroke();
      c.beginPath(); c.moveTo(x + 128, y + 230); c.lineTo(x + 128, y + ch); c.stroke();
      c.fillStyle = "rgba(0,0,0,0.5)"; [280, 350].forEach((yy) => { c.beginPath(); c.arc(x + 140, y + yy, 7, 0, 7); c.fill(); });
      c.strokeRect(x + 28, y + 330, 72, 16); c.strokeRect(x + 156, y + 330, 72, 16); c.strokeRect(x + 30, y + 150, 50, 10);
    } else if (i === 5) {   // a dress: waist seam, a soft pleat skirt
      c.lineWidth = 4; c.beginPath(); c.arc(x + 128, y - 10, 52, 0.2, Math.PI - 0.2); c.stroke();
      c.beginPath(); c.moveTo(x, y + 210); c.lineTo(x + cw, y + 210); c.stroke();
      for (let k = 1; k < 7; k++) { c.strokeStyle = "rgba(0,0,0,0.18)"; c.beginPath(); c.moveTo(x + k * 36, y + 214); c.lineTo(x + k * 36 + (k - 3.5) * 10, y + ch); c.stroke(); }
    }
    shade(x, y);
  }
});
// folded goods, seen from above and from the side: 0 shirt top · 1 sweater top · 2 towel top · 3 folded side (layers) · 4 jeans top · 5 boxed shirt
export const foldCell = cellOf(1536, 512, 3, 2, 3);
export const foldTex = () => canvasTex("a_fold", 1536, 512, (c) => {
  const cw = 512, ch = 256;
  for (let i = 0; i < 6; i++) {
    const x = (i % 3) * cw, y = Math.floor(i / 3) * ch;
    c.fillStyle = "#E6E6E6"; c.fillRect(x, y, cw, ch);
    c.strokeStyle = "rgba(0,0,0,0.32)"; c.lineWidth = 3; c.fillStyle = "rgba(0,0,0,0.3)";
    if (i === 0) {   // a folded dress shirt: collar at the top, placket and buttons running down, the folded-back sleeves' edges
      c.fillStyle = "rgba(255,255,255,0.7)"; c.beginPath(); c.ellipse(x + 256, y + 34, 70, 30, 0, 0, 7); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(x + 210, y + 40); c.lineTo(x + 256, y + 90); c.lineTo(x + 302, y + 40); c.stroke();
      c.beginPath(); c.moveTo(x + 256, y + 90); c.lineTo(x + 256, y + ch); c.stroke();
      c.fillStyle = "rgba(0,0,0,0.5)"; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x + 264, y + 112 + k * 38, 4.5, 0, 7); c.fill(); }
      c.strokeRect(x + 290, y + 120, 50, 52);
      c.strokeStyle = "rgba(0,0,0,0.18)"; c.beginPath(); c.moveTo(x + 60, y); c.lineTo(x + 60, y + ch); c.moveTo(x + 452, y); c.lineTo(x + 452, y + ch); c.stroke();
    } else if (i === 1) {
      for (let k = 0; k < cw; k += 9) { c.fillStyle = "rgba(0,0,0,0.08)"; c.fillRect(x + k, y, 4, ch); }
      c.lineWidth = 7; c.beginPath(); c.arc(x + 256, y - 6, 66, 0.25, Math.PI - 0.25); c.stroke();
      c.strokeStyle = "rgba(0,0,0,0.2)"; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 70, y); c.lineTo(x + 70, y + ch); c.moveTo(x + 442, y); c.lineTo(x + 442, y + ch); c.stroke();
    } else if (i === 2) {   // a folded bath towel: terry loops and a woven dobby band
      for (let k = 0; k < 6000; k++) { c.fillStyle = `rgba(0,0,0,${rnd(k + 33) * 0.1})`; c.beginPath(); c.arc(x + rnd(k + 1) * cw, y + rnd(k + 2) * ch, 1.6, 0, 7); c.fill(); }
      c.fillStyle = "rgba(255,255,255,0.45)"; c.fillRect(x, y + 170, cw, 40); c.fillStyle = "rgba(0,0,0,0.18)"; c.fillRect(x, y + 176, cw, 4); c.fillRect(x, y + 200, cw, 4);
    } else if (i === 3) {   // the side of a stack's garment: fold layers
      for (let k = 0; k < ch; k += 18) { c.fillStyle = "rgba(0,0,0,0.22)"; c.fillRect(x, y + k, cw, 3); c.fillStyle = "rgba(255,255,255,0.25)"; c.fillRect(x, y + k + 5, cw, 2); }
    } else if (i === 4) {   // folded jeans: back pockets with their stitching, a leather patch
      for (let k = 0; k < 2600; k++) { c.fillStyle = `rgba(255,255,255,${rnd(k + 70) * 0.12})`; c.fillRect(x + rnd(k + 71) * cw, y + rnd(k + 72) * ch, 1, 3); }
      c.strokeStyle = "rgba(210,160,70,0.85)"; c.lineWidth = 2.5;
      [140, 372].forEach((px) => { c.beginPath(); c.moveTo(px - 60, y + 70); c.lineTo(px + 60, y + 70); c.lineTo(px + 54, y + 190); c.lineTo(px, y + 216); c.lineTo(px - 54, y + 190); c.closePath(); c.stroke(); });
      c.fillStyle = "rgba(120,80,40,0.7)"; c.fillRect(x + 300, y + 20, 80, 36);
      c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(x, y, cw, 18);
    } else {   // a boxed dress shirt: the clear sleeve's sheen and the band label
      c.fillStyle = "rgba(255,255,255,0.7)"; c.beginPath(); c.ellipse(x + 256, y + 34, 70, 30, 0, 0, 7); c.fill(); c.stroke();
      c.fillStyle = "#0B3F7A"; c.fillRect(x, y + 150, cw, 56); c.fillStyle = "#FFFFFF"; c.font = F(800, 32); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("DRESS SHIRT · 100% COTTON", x + 256, y + 179);
    }
  }
});
// SHOE BOXES (end labels): plain store-brand boxes with style and size (no figures but sizes)
export const shoeCell = cellOf(1024, 512, 4, 4, 2);
export const shoeTex = () => canvasTex("a_shoes", 1024, 512, (c) => {
  const cols = ["#E9E4D8", "#2A2F38", "#C9D3E0", "#7A5A3E", "#EEF0F3", "#123E73", "#B8BEC8", "#4A4F58"];
  const names = ["OXFORD", "LOAFER", "RUNNER", "BOOT", "SNEAKER", "DERBY", "WALKER", "SLIP-ON"];
  for (let i = 0; i < 16; i++) {
    const x = (i % 4) * 256, y = Math.floor(i / 4) * 128, bg = cols[i % 8], dark = ["#2A2F38", "#7A5A3E", "#123E73", "#4A4F58"].includes(bg);
    c.fillStyle = bg; c.fillRect(x, y, 256, 128);
    c.fillStyle = dark ? "#F1F3F6" : "#1B2A40"; c.textAlign = "left"; c.textBaseline = "alphabetic";
    c.font = F(800, 34); c.fillText(names[(i * 3) % 8], x + 16, y + 52);
    c.font = F(600, 22); c.fillText(["MEN'S", "WOMEN'S", "KIDS'"][i % 3] + " · SIZE " + ["9", "10½", "8", "11", "7½", "12", "6", "9½"][i % 8], x + 16, y + 88);
    c.fillStyle = dark ? "#FFFFFF" : "#111"; for (let k = 0; k < 26; k++) c.fillRect(x + 150 + k * 3.5, y + 96, rnd(i * 40 + k) < 0.5 ? 1.5 : 2.5, 22);
  }
});

// ── the janitor's things: labels, the wet-floor sign, the bucket ───────────────────────────────────────────────────────────
// spray-bottle labels (a band wrapped around the bottle): 0 glass cleaner · 1 disinfectant · 2 neutral floor cleaner
export const labelCell = cellOf(1024, 768, 1, 3, 3);
export const labelTex = () => canvasTex("a_labels", 1024, 768, (c) => {
  const L = [["GLASS", "CLEANER", "STREAK-FREE · AMMONIA-FREE", "#0E5CB8"], ["DISINFECTANT", "CLEANER", "READY TO USE · SPRAY AND WIPE", "#1F7A70"], ["NEUTRAL", "FLOOR CLEANER", "FOR TERRAZZO · VINYL · TILE", "#3C4F78"]];
  L.forEach(([a, b, s, col], i) => {
    const y = i * 256;
    c.fillStyle = "#F4F6F8"; c.fillRect(0, y, 1024, 256);
    c.fillStyle = col; c.fillRect(0, y, 1024, 64); c.fillRect(0, y + 222, 1024, 34);
    c.fillStyle = "#FFFFFF"; c.font = F(800, 30); c.textAlign = "left"; c.textBaseline = "middle"; c.fillText("COMMERCIAL USE", 150, y + 32); c.fillText("WARNING: KEEP OUT OF REACH OF CHILDREN", 150, y + 240);
    c.fillStyle = "#11223A"; c.font = F(800, 64); c.fillText(a, 150, y + 112); c.font = F(700, 44); c.fillText(b, 150, y + 166);
    c.font = F(600, 22); c.fillStyle = "#3A4A60"; c.fillText(s, 150, y + 202);
    // the back of the band: directions (it wraps around the bottle)
    c.font = F(600, 17); c.fillStyle = "#3A4A60";
    ["DIRECTIONS: Spray surface", "and wipe with a clean cloth.", "Do not mix with other", "chemicals. Rinse sprayer."].forEach((t, k) => c.fillText(t, 720, y + 96 + k * 26));
  });
});
// the folded A-frame WET FLOOR sign (both faces): CAUTION band, a pictogram in its own panel, the legend under it
export const wetTex = () => canvasTex("a_wet", 512, 1024, (c, w, h) => {
  c.fillStyle = "#F2C230"; c.fillRect(0, 0, w, h);
  // the moulded handle slot at the top
  c.fillStyle = "#3A3020"; c.beginPath(); c.roundRect(w / 2 - 90, 36, 180, 44, 22); c.fill();
  c.fillStyle = "#111111"; c.fillRect(30, 120, w - 60, 120);
  c.fillStyle = "#F2C230"; c.font = F(900, 92); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("CAUTION", w / 2, 184);
  // the pictogram: a triangle with a slipping figure (the standard symbol), its own band
  c.fillStyle = "#111"; c.beginPath(); c.moveTo(w / 2, 286); c.lineTo(w / 2 + 150, 540); c.lineTo(w / 2 - 150, 540); c.closePath(); c.fill();
  c.fillStyle = "#F2C230"; c.beginPath(); c.moveTo(w / 2, 316); c.lineTo(w / 2 + 124, 524); c.lineTo(w / 2 - 124, 524); c.closePath(); c.fill();
  c.fillStyle = "#111"; c.strokeStyle = "#111"; c.lineCap = "round"; c.lineWidth = 15;
  c.beginPath(); c.arc(w / 2 + 22, 392, 15, 0, 7); c.fill();
  c.beginPath(); c.moveTo(w / 2 + 12, 412); c.lineTo(w / 2 - 14, 466); c.stroke();
  c.beginPath(); c.moveTo(w / 2 - 14, 466); c.lineTo(w / 2 + 34, 486); c.lineTo(w / 2 + 62, 470); c.stroke();
  c.beginPath(); c.moveTo(w / 2 - 14, 466); c.lineTo(w / 2 - 52, 500); c.stroke();
  c.beginPath(); c.moveTo(w / 2 + 6, 428); c.lineTo(w / 2 - 40, 418); c.moveTo(w / 2 + 6, 428); c.lineTo(w / 2 + 50, 440); c.stroke();
  c.lineWidth = 8; c.beginPath(); c.moveTo(w / 2 - 92, 512); c.lineTo(w / 2 + 92, 512); c.stroke();
  c.fillStyle = "#111"; c.font = F(900, 84); c.fillText("WET", w / 2, 640); c.fillText("FLOOR", w / 2, 728);
  c.font = F(800, 46); c.fillText("CUIDADO", w / 2, 830); c.font = F(700, 40); c.fillText("PISO MOJADO", w / 2, 884);
  c.fillStyle = "rgba(0,0,0,0.18)"; c.fillRect(0, h - 40, w, 40);
});
// the cart's moulded labels and the paper-towel wrap: 0 cart side plate · 1 towel wrap · 2 bucket side · 3 tissue wrap
export const miscCell = cellOf(1024, 512, 2, 2, 3);
export const miscTex = () => canvasTex("a_misc", 1024, 512, (c) => {
  c.fillStyle = "#6A7078"; c.fillRect(0, 0, 512, 256);
  c.fillStyle = "#3E434A"; c.font = F(800, 46); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("JANITOR CART", 256, 96);
  c.font = F(600, 24); c.fillText("DO NOT STAND ON CART", 256, 160);
  c.fillStyle = "#F8F8F6"; c.fillRect(512, 0, 512, 256); c.fillStyle = "#1F5FB4"; c.fillRect(512, 96, 512, 64); c.fillStyle = "#FFF"; c.font = F(800, 34); c.fillText("ROLL TOWELS · 2-PLY", 768, 128);
  c.fillStyle = "#F2C230"; c.fillRect(0, 256, 512, 256); c.fillStyle = "#B8901C"; c.font = F(900, 60); c.fillText("CAUTION", 256, 360); c.font = F(700, 26); c.fillText("WET FLOOR · MOP BUCKET", 256, 420);
  c.fillStyle = "#F8F8F6"; c.fillRect(512, 256, 512, 256); c.fillStyle = "#3C4F78"; c.font = F(800, 30); c.fillText("JUMBO ROLL TISSUE", 768, 384);
});
// the black liner (a polyethylene sheen, crinkles)
export const linerTex = () => canvasTex("a_liner", 512, 256, (c, w, h) => {
  c.fillStyle = "#1A1E24"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 140; i++) { const x = rnd(i) * w; const g = c.createLinearGradient(x - 14, 0, x + 14, 0); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, `rgba(200,215,235,${0.05 + rnd(i + 3) * 0.12})`); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(x - 14, 0, 28, h); }
});

// ── the share certificates (cream paper, an engraved border; the top one in full) ──────────────────────────────────────────
// The certificate lying on top of the stack: THE PROCTER & GAMBLE COMPANY common stock (a blue chip named in the 2015 reporting;
// plain typography, no company artwork). No share count or serial is invented: the boxes carry their labels only.
const CINK = "#1D4F7E";
const guill = (c, x0, y0, x1, y1, amp, n, per, lw, col) => {
  const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len;
  c.lineWidth = lw; c.strokeStyle = col;
  for (let k = 0; k < n; k++) { c.beginPath(); for (let s = 0; s <= len; s += 3) { const o = amp * Math.sin((s / per) * Math.PI * 2 + (k * Math.PI * 2) / n); const x = x0 + ux * s - uy * o, y = y0 + uy * s + ux * o; s ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
};
const spaced = (c, t, x, y, sp) => { const ws = [...t].map((ch) => c.measureText(ch).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1); let cx = x - tot / 2; const al = c.textAlign; c.textAlign = "left"; [...t].forEach((ch, i) => { c.fillText(ch, cx, y); cx += ws[i] + sp; }); c.textAlign = al; };
export const drawCert = (c, w, h, { ink = CINK, name = "THE PROCTER & GAMBLE COMPANY", state = "OHIO", owner = "RONALD READ" } = {}) => {
  const s = w / 2048; c.save(); c.scale(s, s); const W = 2048, H = 1365;
  const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#F6F1E2"); g.addColorStop(1, "#EDE5D0"); c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "120,100,70" : "255,255,255"},${0.02 + rnd(i + 4) * 0.05})`; c.fillRect(rnd(i + 1) * W, rnd(i + 2) * H, 2, 2); }
  // the security tint under the text
  c.save(); c.beginPath(); c.rect(170, 170, W - 340, H - 340); c.clip();
  c.strokeStyle = "rgba(29,79,126,0.10)"; c.lineWidth = 1;
  for (let y = 160; y < H; y += 10) { c.beginPath(); for (let x = 160; x < W; x += 6) { const yy = y + 4 * Math.sin(x / 22 + y / 35); x === 160 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); }
  c.restore();
  // the border: rules, a guilloche band, an inner key of lozenges, corner medallions
  c.strokeStyle = ink; c.lineWidth = 7; c.strokeRect(34, 34, W - 68, H - 68); c.lineWidth = 2; c.strokeRect(48, 48, W - 96, H - 96);
  const B = 96, a = ink === CINK ? "rgba(29,79,126," : "rgba(40,90,60,";
  guill(c, B, B, W - B, B, 30, 6, 52, 1.2, a + "0.85)"); guill(c, B, H - B, W - B, H - B, 30, 6, 52, 1.2, a + "0.85)");
  guill(c, B, B, B, H - B, 30, 6, 52, 1.2, a + "0.85)"); guill(c, W - B, B, W - B, H - B, 30, 6, 52, 1.2, a + "0.85)");
  c.strokeStyle = ink; c.lineWidth = 5; c.strokeRect(144, 144, W - 288, H - 288); c.lineWidth = 1.5; c.strokeRect(156, 156, W - 312, H - 312);
  // microprint in the gap between the inner rules (the issuer's name, repeated), top and bottom
  c.fillStyle = ink; c.font = `700 8px ${SERIF}`; c.textAlign = "left"; c.textBaseline = "middle";
  { const mp = (name + " · ").repeat(40); for (const y of [150, H - 150]) { c.save(); c.beginPath(); c.rect(150, y - 6, W - 300, 12); c.clip(); c.fillText(mp, 150, y); c.restore(); } }
  c.textAlign = "center"; c.textBaseline = "alphabetic";
  for (let x = 176; x < W - 176; x += 18) [166, H - 166].forEach((y) => { c.beginPath(); c.moveTo(x, y - 3); c.lineTo(x + 5, y); c.lineTo(x, y + 3); c.lineTo(x - 5, y); c.closePath(); c.fill(); });
  [[B, B], [W - B, B], [B, H - B], [W - B, H - B]].forEach(([x, y], q) => {
    c.save(); c.translate(x, y); c.fillStyle = "#F3EDDC"; c.beginPath(); c.arc(0, 0, 74, 0, 7); c.fill(); c.strokeStyle = ink; c.lineWidth = 2.4; c.beginPath(); c.arc(0, 0, 72, 0, 7); c.stroke();
    c.lineWidth = 1; for (let k = 0; k < 18; k++) { c.beginPath(); c.ellipse(0, 0, 62, 20, (k * Math.PI) / 18 + q, 0, 7); c.stroke(); }
    c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill(); c.restore();
  });
  // NUMBER / SHARES boxes (labels only)
  [[190, "NUMBER"], [W - 190 - 300, "SHARES"]].forEach(([x0, t]) => { c.fillStyle = "rgba(29,79,126,0.08)"; c.fillRect(x0, 190, 300, 110); c.strokeStyle = ink; c.lineWidth = 4; c.strokeRect(x0, 190, 300, 110); c.lineWidth = 1.2; c.strokeRect(x0 + 8, 198, 284, 94); c.fillStyle = ink; c.font = `700 24px ${SERIF}`; c.textAlign = "center"; spaced(c, t, x0 + 150, 232, 6); c.font = `italic 400 22px ${SERIF}`; c.fillText("see reverse", x0 + 150, 276); });
  c.fillStyle = ink; c.textAlign = "center"; c.textBaseline = "alphabetic";
  c.font = `700 28px ${SERIF}`; spaced(c, `INCORPORATED UNDER THE LAWS OF THE STATE OF ${state}`, W / 2, 238, 4);
  c.font = `400 24px ${SERIF}`; spaced(c, "COMMON STOCK", W / 2, 280, 9);
  c.font = `700 92px ${SERIF}`; let p = 92; while (c.measureText(name).width + name.length * 6 > W - 520 && p > 40) { p -= 3; c.font = `700 ${p}px ${SERIF}`; }
  c.save(); c.fillStyle = "rgba(29,79,126,0.25)"; spaced(c, name, W / 2 + 3, 408, 6); c.restore(); spaced(c, name, W / 2, 405, 6);
  // the engraved vignette: a sunburst over a river valley (Vermont hills), line work only, in an oval
  const cx = W / 2, cy = 560, rx = 250, ry = 105;
  c.save(); c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.clip();
  c.strokeStyle = a + "0.7)"; c.lineWidth = 1.1; for (let y = cy - ry; y < cy + 10; y += 4) { c.beginPath(); c.moveTo(cx - rx, y); c.lineTo(cx + rx, y); c.stroke(); }
  for (let k = 0; k < 30; k++) { const an = Math.PI + (k / 29) * Math.PI; c.beginPath(); c.moveTo(cx + Math.cos(an) * 40, cy + 10 + Math.sin(an) * 40); c.lineTo(cx + Math.cos(an) * 300, cy + 10 + Math.sin(an) * 300); c.stroke(); }
  c.fillStyle = "#F3EDDC"; c.beginPath(); c.arc(cx, cy + 10, 38, Math.PI, 0); c.fill();
  const hill = (x, o) => cy + 18 + o - 26 * Math.sin((x - cx) / 70 + o) - 14 * Math.sin((x - cx) / 31);
  [[0, 0.9], [26, 1]].forEach(([o, al]) => { c.fillStyle = "#F3EDDC"; c.beginPath(); c.moveTo(cx - rx, cy + ry); for (let x = cx - rx; x <= cx + rx; x += 4) c.lineTo(x, hill(x, o)); c.lineTo(cx + rx, cy + ry); c.closePath(); c.fill(); c.strokeStyle = a + al + ")"; c.lineWidth = 1.6; c.stroke(); c.lineWidth = 1; for (let x = cx - rx; x < cx + rx; x += 6) { c.beginPath(); c.moveTo(x, hill(x, o) + 3); c.lineTo(x - 10, Math.min(cy + ry, hill(x, o) + 30)); c.stroke(); } });
  c.restore();
  c.strokeStyle = ink; c.lineWidth = 3; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.stroke(); c.lineWidth = 1.5; c.beginPath(); c.ellipse(cx, cy, rx + 14, ry + 14, 0, 0, 7); c.stroke();
  [-1, 1].forEach((sd) => { for (let k = 0; k < 4; k++) { c.beginPath(); for (let t = 0; t <= 1; t += 0.01) { const x = cx + sd * (290 + t * 330), y = cy + (16 + k * 8) * Math.sin(t * Math.PI * 2.2 + k) * (1 - t * 0.6); t ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } });
  c.fillStyle = ink; c.font = `700 38px ${SERIF}`; spaced(c, "THIS CERTIFIES THAT", W / 2, 746, 10);
  c.font = `italic 700 54px ${SERIF}`; c.fillText(owner, W / 2, 822); c.fillRect(520, 838, W - 1040, 2.5);
  c.font = `italic 400 36px ${SERIF}`; c.fillText("is the owner of fully paid and non-assessable shares of the Common Stock of", W / 2, 900);
  c.font = `700 40px ${SERIF}`; spaced(c, name, W / 2, 956, 4);
  c.font = `400 25px ${SERIF}`;
  c.fillText("transferable on the books of the Company by the holder hereof in person or by duly authorized attorney upon", W / 2, 1004);
  c.fillText("surrender of this Certificate properly endorsed. This Certificate is not valid unless countersigned by the Transfer Agent.", W / 2, 1038);
  c.font = `italic 400 25px ${SERIF}`; c.fillText("In Witness Whereof, the Company has caused this Certificate to be signed by its duly authorized officers.", W / 2, 1072);
  c.textAlign = "center"; c.font = `400 28px ${SERIF}`;
  [[560, "SECRETARY"], [W - 560, "CHAIRMAN OF THE BOARD"]].forEach(([x, t], q) => {
    // a facsimile signature (an engraved flourish, not a real name) over each signature line
    c.save(); c.strokeStyle = ink; c.lineWidth = 2.6; c.lineCap = "round"; c.beginPath();
    let px = x - 190, py = 1106; c.moveTo(px, py);
    for (let k = 0; k < 22; k++) { const nx = px + 16 + rnd(q * 50 + k) * 8, ny = 1106 + Math.sin(k * 1.9 + q) * (5 + rnd(q * 50 + k + 3) * 6); c.bezierCurveTo(px + 14, py - 14 - (k % 4 === 0 ? 8 : 0), nx - 12, ny + 10, nx, ny); px = nx; py = ny; }
    c.stroke(); c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 200, 1118); c.bezierCurveTo(x - 60, 1104, x + 80, 1126, x + 210, 1110); c.stroke(); c.restore();
    c.fillRect(x - 250, 1128, 500, 2.5); c.font = `700 22px ${SERIF}`; spaced(c, t, x, 1160, 5);
  });
  c.font = `700 13px ${SERIF}`; spaced(c, "SEE REVERSE FOR CERTAIN DEFINITIONS", 1660, 320, 2);
  // the corporate seal, engraved (a toothed ring with the legend)
  c.save(); c.translate(W / 2, 1133); c.scale(0.5, 0.5); c.strokeStyle = ink; c.lineWidth = 2.4;
  c.beginPath(); for (let k = 0; k <= 120; k++) { const an = (k / 120) * Math.PI * 2, r = k % 2 ? 78 : 86; k ? c.lineTo(Math.cos(an) * r, Math.sin(an) * r) : c.moveTo(Math.cos(an) * r, Math.sin(an) * r); } c.stroke();
  c.beginPath(); c.arc(0, 0, 64, 0, 7); c.stroke(); c.beginPath(); c.arc(0, 0, 40, 0, 7); c.stroke();
  c.font = `700 15px ${SERIF}`; c.fillStyle = ink; const leg = "CORPORATE SEAL · " + state + " · ";
  [...leg].forEach((ch, k) => { c.save(); c.rotate((k / leg.length) * Math.PI * 2); c.fillText(ch, 0, -47); c.restore(); });
  c.font = `700 22px ${SERIF}`; c.fillText("SEAL", 0, 8); c.restore();
  c.font = `400 15px ${SERIF}`; spaced(c, "COUNTERSIGNED AND REGISTERED · TRANSFER AGENT AND REGISTRAR", W / 2, 1189, 3);
  c.restore();
};
export const certTopTex = () => canvasTex("a_certTop", 2048, 1365, (c, w, h) => drawCert(c, w, h));
// sheets under the top one (their faces peek out at the stack's sides): three engraving colours, smaller
export const certTex2 = (k) => canvasTex("a_cert" + k, 1024, 683, (c, w, h) => drawCert(c, w, h, { ink: ["#1D4F7E", "#2E5E47", "#5A3E2A"][k], name: ["COMMON STOCK CERTIFICATE", "SHARES OF COMMON STOCK", "CAPITAL STOCK"][k], state: ["DELAWARE", "NEW YORK", "NEW JERSEY"][k] }));
// the stack's sides: the paper edges, layer by layer (a fine, uneven ruling of cream sheets)
export const stackSideTex = () => canvasTex("a_stackSide", 256, 1024, (c, w, h) => {
  c.fillStyle = "#EFE7D2"; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 3) { c.fillStyle = `rgba(${rnd(y) < 0.15 ? "60,90,120" : "110,95,70"},${0.12 + rnd(y + 1) * 0.22})`; c.fillRect(0, y, w, 1); }
  for (let i = 0; i < 400; i++) { c.fillStyle = "rgba(255,255,255,0.35)"; c.fillRect(rnd(i) * w, rnd(i + 1) * h, 12 + rnd(i + 2) * 50, 1); }
});

// ── the store front ──────────────────────────────────────────────────────────────────────────────────────────────────────
// the main sign: plain white channel letters, "JCPenney" (plain typography; not the logo artwork), on transparent
export const jcpSignTex = () => canvasTex("a_jcpSign", 2048, 512, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.textBaseline = "middle";
  c.font = F(700, 330); if ("letterSpacing" in c) c.letterSpacing = "-4px";
  c.fillText("JCPenney", w / 2, h / 2 + 16);
});
export const jcpHaloTex = () => canvasTex("a_jcpHalo", 1024, 256, (c, w, h) => {
  c.clearRect(0, 0, w, h); c.filter = "blur(18px)"; c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.textBaseline = "middle";
  c.font = F(700, 165); c.fillText("JCPenney", w / 2, h / 2 + 8); c.filter = "none";
});
// EIFS / stucco fascia (sand finish, faint control joints)
export const stuccoTex = () => canvasTex("a_stucco", 512, 512, (c, w, h) => {
  c.fillStyle = "#D6D9DE"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 26000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "0,0,0" : "255,255,255"},${0.03 + rnd(i + 1) * 0.06})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2, 2); }
  c.fillStyle = "rgba(0,0,0,0.16)"; c.fillRect(0, h - 4, w, 4);
});
// ── the parking lot (V39 detail pass; Timur: "fix the road, because right now it looks weird") ─────────────────────────────
// One 48 × 60 m sheet, drawn as the real lot in front of a 1990s strip-centre department store in winter:
//   z 4.45 → 10.6   the drive lane along the store front, a FIRE LANE (yellow stencils by the curb; the curb itself is painted yellow)
//                   with ONE continental crosswalk from the entrance's curb ramp across it (bars run WITH the traffic, i.e. along x)
//   z 10.6 → 21.6   a double row of 90° stalls, head to head on z 16.1 (the lamp poles stand on that line in their concrete bases)
//   z 21.6 → 28.9   a two-way drive aisle (worn tyre paths, a painted arrow pair)
//   z 28.9 → 39.9   the second double row (lamps on z 34.4) · z 39.9 → 47.2 an aisle · z 47.2 → 58.2 the third double row
// Asphalt: aggregate, sealed cracks, patches, oil spots in the stall centres, road-salt bloom, slush lines, wet tyre tracks.
export const LOT = { x0: -24, x1: 24, z0: 4.4, z1: 64 };
export const LOT_ROWS = [16.1, 34.4, 52.7];   // head-to-head lines (lamp rows)
export const STALL = { w: 2.75, d: 5.5, x0: -20.6, n: 15 };
// worn paint: a band drawn, then nibbled where tyres wore it
const wornRect = (c, x, y, ww, hh, col, seed, wear = 0.25) => {
  c.fillStyle = col; c.fillRect(x, y, ww, hh);
  c.save(); c.globalCompositeOperation = "destination-out";
  const n = Math.min(4000, Math.max(6, Math.round((ww * hh) / 50)));
  for (let i = 0; i < n; i++) { if (rnd(seed + i) > wear) continue; c.fillStyle = `rgba(0,0,0,${0.25 + rnd(seed + i * 3) * 0.5})`; c.beginPath(); c.arc(x + rnd(seed + i * 5) * ww, y + rnd(seed + i * 7) * hh, 0.6 + rnd(seed + i * 11) * 2.2, 0, 7); c.fill(); }
  c.restore();
};
/** draws the lot (features placed in metres, so the near sheet and the whole-lot sheet agree) over region {x0,x1,z0,z1} */
const drawLot = (c, w, h, RG) => {
  const sx = w / (RG.x1 - RG.x0), sz = h / (RG.z1 - RG.z0);
  const X = (x) => (x - RG.x0) * sx, Z = (z) => (z - RG.z0) * sz;
  const inR = (x, z, m = 3) => x > RG.x0 - m && x < RG.x1 + m && z > RG.z0 - m && z < RG.z1 + m;
  // the asphalt: a mid blue-grey with large tonal patches (older and newer pavement), aggregate, fines
  c.fillStyle = "#2A313B"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) { const x = LOT.x0 + rnd(i + 3) * 48, z = LOT.z0 + rnd(i + 4) * 60, r = 1.5 + rnd(i + 5) * 6; if (!inR(x, z, r)) continue; const g = c.createRadialGradient(X(x), Z(z), 0, X(x), Z(z), r * sx); const l = rnd(i + 6) < 0.5; g.addColorStop(0, l ? "rgba(70,78,90,0.24)" : "rgba(10,14,20,0.24)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(X(x) - r * sx, Z(z) - r * sx, 2 * r * sx, 2 * r * sx); }
  const npx = Math.round(w * h * 0.07);
  for (let i = 0; i < npx; i++) { const g = 28 + rnd(i) * 70; c.fillStyle = `rgba(${g},${g + 4},${g + 10},${0.18 + rnd(i + 7) * 0.3})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 1 + (rnd(i + 8) < 0.12 ? 1 : 0), 1 + (rnd(i + 9) < 0.12 ? 1 : 0)); }
  for (let i = 0; i < npx * 0.04; i++) { c.fillStyle = `rgba(190,195,205,${0.08 + rnd(i + 70) * 0.14})`; c.fillRect(rnd(i + 71) * w, rnd(i + 72) * h, 1.5, 1.5); }   // exposed stone
  // saw-cut patches (rectangles of newer, darker asphalt with sealed seams)
  for (let i = 0; i < 9; i++) { const x = LOT.x0 + rnd(i + 400) * 44, z = LOT.z0 + 2 + rnd(i + 401) * 54, ww = 2 + rnd(i + 402) * 5, hh = 1.2 + rnd(i + 403) * 2.5; if (!inR(x, z, 6)) continue; c.fillStyle = "rgba(16,20,27,0.5)"; c.fillRect(X(x), Z(z), ww * sx, hh * sz); c.strokeStyle = "rgba(6,8,12,0.8)"; c.lineWidth = 0.06 * sx; c.strokeRect(X(x), Z(z), ww * sx, hh * sz); }
  // sealed cracks (black crack-sealer bands that wander)
  for (let i = 0; i < 60; i++) { let x = LOT.x0 + rnd(i + 900) * 48, z = LOT.z0 + rnd(i + 901) * 60; if (!inR(x, z, 8)) continue; c.strokeStyle = `rgba(6,8,12,${0.5 + rnd(i) * 0.3})`; c.lineWidth = (0.05 + rnd(i + 1) * 0.06) * sx; c.lineJoin = "round"; c.beginPath(); c.moveTo(X(x), Z(z)); const dir = rnd(i + 902) < 0.5; for (let k = 0; k < 16; k++) { x += dir ? 0.4 + rnd(i * 13 + k) * 0.6 : (rnd(i * 13 + k) - 0.5) * 0.7; z += dir ? (rnd(i * 17 + k) - 0.5) * 0.7 : 0.4 + rnd(i * 17 + k) * 0.6; c.lineTo(X(x), Z(z)); } c.stroke(); }
  // oil drips in the stall centres
  for (const zr of LOT_ROWS) for (const s of [-1, 1]) for (let k = 0; k < STALL.n; k++) {
    const xc = STALL.x0 + (k + 0.5) * STALL.w + (rnd(k + zr) - 0.5) * 0.4, zc = zr + s * STALL.d * 0.5;
    if (!inR(xc, zc) || rnd(k * 7 + zr + s) > 0.75) continue;
    const g = c.createRadialGradient(X(xc), Z(zc), 0, X(xc), Z(zc), 0.8 * sx); g.addColorStop(0, "rgba(4,6,10,0.5)"); g.addColorStop(1, "rgba(4,6,10,0)"); c.fillStyle = g; c.beginPath(); c.ellipse(X(xc), Z(zc), 0.8 * sx, 1.1 * sz, 0, 0, 7); c.fill();
  }
  // wet tyre paths along the aisles (darker), with a lighter, dry crown between them
  c.save(); c.filter = `blur(${Math.max(2, Math.round(0.18 * sz))}px)`;
  for (const z of [7.4, 25.25, 43.55]) for (const o of [-1.7, -0.2, 1.3, 2.8]) { c.strokeStyle = "rgba(8,11,16,0.16)"; c.lineWidth = 0.45 * sz; c.beginPath(); for (let x = RG.x0 - 2; x <= RG.x1 + 2; x += 1) { const zz = z + o + 0.18 * Math.sin(x * 0.21 + o * 3) + 0.08 * Math.sin(x * 0.67 + z); x === RG.x0 - 2 ? c.moveTo(X(x), Z(zz)) : c.lineTo(X(x), Z(zz)); } c.stroke(); }
  c.restore();
  // road-salt bloom: a pale, dry, uneven film where the lot dried
  for (let i = 0; i < 220; i++) { const x = LOT.x0 + rnd(i + 600) * 48, z = LOT.z0 + rnd(i + 601) * 60, r = 0.4 + rnd(i + 602) * 2; if (!inR(x, z)) continue; const g = c.createRadialGradient(X(x), Z(z), 0, X(x), Z(z), r * sx); g.addColorStop(0, "rgba(170,182,198,0.14)"); g.addColorStop(1, "rgba(170,182,198,0)"); c.fillStyle = g; c.fillRect(X(x) - r * sx, Z(z) - r * sx, 2 * r * sx, 2 * r * sx); }
  // ── the paint (traffic white / yellow, worn) ──
  const WHITE = "rgba(226,230,236,0.8)", YEL = "rgba(222,184,64,0.86)", lwx = 0.1 * sx, lwz = 0.1 * sz;
  LOT_ROWS.forEach((zr, ri) => {
    wornRect(c, X(STALL.x0), Z(zr) - lwz / 2, STALL.n * STALL.w * sx, lwz, WHITE, ri * 1000);
    for (let k = 0; k <= STALL.n; k++) { const x = STALL.x0 + k * STALL.w; wornRect(c, X(x) - lwx / 2, Z(zr - STALL.d), lwx, STALL.d * 2 * sz, WHITE, ri * 1000 + k * 37); }
  });
  // the fire lane: a yellow edge line 0.6 m off the curb, FIRE LANE stencils by the curb (0.6 m letters) clear of the crosswalk
  wornRect(c, 0, Z(5.0), w, lwz, YEL, 77, 0.35);
  c.textAlign = "center"; c.textBaseline = "middle";
  [-15.5, -8.0, 8.0, 15.5].forEach((x) => { if (!inR(x, 5.8, 3)) return; c.save(); c.fillStyle = "rgba(222,184,64,0.8)"; c.font = `900 ${Math.round(0.5 * sz)}px ${BODY}`; if ("letterSpacing" in c) c.letterSpacing = `${Math.round(0.1 * sx)}px`; c.translate(X(x), Z(5.75)); c.scale(sx / sz, 1.3); c.fillText("FIRE LANE", 0, 0); c.restore(); });
  // ONE continental crosswalk from the curb ramp at the doors across the drive lane (bars 3.0 m long WITH the traffic, 0.4 m wide)
  for (let k = 0; k < 7; k++) { const z = 5.3 + k * 0.75; wornRect(c, X(-1.5), Z(z), 3.0 * sx, 0.4 * sz, "rgba(226,230,236,0.6)", 300 + k * 17, 0.5); }
  // painted arrows in the aisles, one each way (no text)
  const arrow = (x, z, d) => { if (!inR(x, z)) return; c.save(); c.translate(X(x), Z(z)); c.scale(sx, sz); c.rotate(d > 0 ? -Math.PI / 2 : Math.PI / 2); c.fillStyle = "rgba(226,230,236,0.55)"; c.beginPath(); c.moveTo(0, -1.3); c.lineTo(0.42, -0.5); c.lineTo(0.14, -0.5); c.lineTo(0.14, 1.1); c.lineTo(-0.14, 1.1); c.lineTo(-0.14, -0.5); c.lineTo(-0.42, -0.5); c.closePath(); c.fill(); c.restore(); };
  arrow(-10, 24.2, 1); arrow(10, 26.4, -1); arrow(-12, 42.5, 1); arrow(12, 44.7, -1);
  // plowed-snow crust along the lot's edges and the far end (where the banks are), and slush at the curb
  for (const [x0, x1, z0, z1] of [[LOT.x0, LOT.x0 + 1.6, LOT.z0 + 5, LOT.z1], [LOT.x1 - 1.6, LOT.x1, LOT.z0 + 5, LOT.z1], [LOT.x0, LOT.x1, LOT.z1 - 4, LOT.z1], [LOT.x0, LOT.x1, 4.4, 4.75]]) {
    const thin = z1 - z0 < 1, nn = thin ? 2600 : 1400;
    for (let i = 0; i < nn; i++) { const x = x0 + rnd(i + x0 * 3 + z0) * (x1 - x0), z = z0 + rnd(i * 3 + z0 + x1) * (z1 - z0) * (thin ? rnd(i + 77) : 1); if (!inR(x, z, 0.5)) continue; c.fillStyle = `rgba(200,212,228,${(thin ? 0.05 : 0.1) + rnd(i + 9) * (thin ? 0.18 : 0.25)})`; c.beginPath(); c.arc(X(x), Z(z), (thin ? 0.01 + rnd(i + 5) * 0.04 : 0.05 + rnd(i + 5) * 0.25) * sx, 0, 7); c.fill(); }
  }
};
export const lotTex = () => canvasTex("a_lot2", 2048, 2048, (c, w, h) => drawLot(c, w, h, LOT));
// the close sheet: the lane, the crosswalk and the first rows the jcp camera looks at (≈ 100 px per metre)
export const LOT_NEAR = { x0: -10, x1: 10, z0: 4.4, z1: 26.4 };
export const lotNearTex = () => canvasTex("a_lotN", 2048, 2048, (c, w, h) => drawLot(c, w, h, LOT_NEAR));
// the lot's roughness (linear): dry asphalt rough, puddles and the wet tyre paths smooth, paint a little smoother
export const lotRoughTex = () => { const t = canvasTex("a_lotR", 512, 512, (c, w, h) => {
  const sx = w / (LOT.x1 - LOT.x0), sz = h / (LOT.z1 - LOT.z0), X = (x) => (x - LOT.x0) * sx, Z = (z) => (z - LOT.z0) * sz;
  c.fillStyle = "rgb(196,196,196)"; c.fillRect(0, 0, w, h);
  for (const z of [7.6, 25.2, 43.5]) for (const o of [-1.6, 1.6]) { c.fillStyle = "rgba(90,90,90,0.55)"; c.fillRect(0, Z(z + o) - 0.5 * sz, w, sz); }
  for (let i = 0; i < 60; i++) { const x = rnd(i + 30) * w, y = rnd(i + 31) * h, r = 4 + rnd(i + 32) * 22; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, "rgba(30,30,30,0.9)"); g.addColorStop(0.7, "rgba(30,30,30,0.6)"); g.addColorStop(1, "rgba(30,30,30,0)"); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, r * 1.8, r, rnd(i) * 3, 0, 7); c.fill(); }
  // the drive lane by the store is wet from the melt off the canopy
  const g = c.createLinearGradient(0, Z(4.4), 0, Z(11)); g.addColorStop(0, "rgba(40,40,40,0.75)"); g.addColorStop(1, "rgba(40,40,40,0)"); c.fillStyle = g; c.fillRect(0, Z(4.4), w, Z(11) - Z(4.4));
}); t.colorSpace = THREE.NoColorSpace; return t; };
// a fine asphalt grain for the bump map (tiled ~1.2 m)
export const grainTex = () => lin(canvasTex("a_grain", 512, 512, (c, w, h) => {
  c.fillStyle = "#808080"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 60000; i++) { const g = rnd(i) < 0.5 ? 40 + rnd(i + 1) * 60 : 160 + rnd(i + 1) * 80; c.fillStyle = `rgb(${g},${g},${g})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 1 + rnd(i + 4) * 2.5, 1 + rnd(i + 5) * 2.5); }
}));
// the wet sheen: soft vertical streaks of the store's warm light lying on the wet lane (additive; no copy of the sign)
export const streakTex = () => canvasTex("a_streak", 128, 512, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  for (let k = 0; k < 6; k++) { const x = w * (0.2 + rnd(k) * 0.6), ww = 6 + rnd(k + 1) * 18; const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(255,255,255,0.0)"); g.addColorStop(0.05, `rgba(255,255,255,${0.25 + rnd(k + 2) * 0.3})`); g.addColorStop(0.5, "rgba(255,255,255,0.12)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.filter = "blur(6px)"; c.fillRect(x - ww / 2, 0, ww, h); }
  c.filter = "none";
});
// a pool of lamp light on the ground (additive)
export const poolTex2 = () => canvasTex("a_pool2", 256, 256, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,0.9)"); g.addColorStop(0.35, "rgba(255,255,255,0.35)"); g.addColorStop(0.7, "rgba(255,255,255,0.08)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h);
});
// SNOW (plowed banks, ledges, the ground): crystalline, slightly dirty at the base, with a bump
export const snowTex = () => canvasTex("a_snow", 512, 512, (c, w, h) => {
  c.fillStyle = "#E8EEF6"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { const x = rnd(i) * w, y = rnd(i + 1) * h, r = 20 + rnd(i + 2) * 70; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, "rgba(150,170,195,0.2)"); g.addColorStop(1, "rgba(150,170,195,0)"); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 30000; i++) { c.fillStyle = rnd(i) < 0.5 ? `rgba(255,255,255,${0.3 + rnd(i + 1) * 0.5})` : `rgba(120,140,170,${0.05 + rnd(i + 1) * 0.12})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 1.5, 1.5); }
});
export const snowBumpTex = () => lin(canvasTex("a_snowB", 256, 256, (c, w, h) => {
  c.fillStyle = "#808080"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { const x = rnd(i) * w, y = rnd(i + 1) * h, r = 3 + rnd(i + 2) * 16; const g = c.createRadialGradient(x, y, 0, x, y, r); const l = rnd(i + 3) < 0.5; g.addColorStop(0, l ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)"); g.addColorStop(1, "rgba(128,128,128,0)"); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
}));
// the curb ramp's truncated-dome warning panel (ADA yellow) and a broom-finished concrete with tooled joints
export const domeTex = () => canvasTex("a_dome", 256, 256, (c, w, h) => {
  c.fillStyle = "#C9A23A"; c.fillRect(0, 0, w, h);
  for (let y = 16; y < h; y += 32) for (let x = 16; x < w; x += 32) { const g = c.createRadialGradient(x - 3, y - 3, 1, x, y, 11); g.addColorStop(0, "#F2D06A"); g.addColorStop(0.7, "#C29A30"); g.addColorStop(1, "#7E6420"); c.fillStyle = g; c.beginPath(); c.arc(x, y, 10, 0, 7); c.fill(); }
});
// door decals (white vinyl on the glass): PUSH bar label, the store name, hours line without times
export const doorTex = () => canvasTex("a_door", 512, 1024, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  c.fillStyle = "rgba(255,255,255,0.92)"; c.textAlign = "center"; c.textBaseline = "middle";
  c.font = F(700, 52); c.fillText("JCPenney", w / 2, 300);
  c.font = F(600, 26); c.fillText("BRATTLEBORO, VERMONT", w / 2, 350);
  c.fillRect(w / 2 - 120, 380, 240, 3);
  c.font = F(800, 40); c.fillText("PUSH", w / 2, 560);
  c.font = F(600, 22); c.fillText("PLEASE USE OTHER DOOR WHEN CLOSED", w / 2, 840);
});
// the newspaper box by the doors: the town's paper
export const newsTex = () => canvasTex("a_news", 512, 512, (c, w, h) => {
  c.fillStyle = "#1F4E8C"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.textBaseline = "middle";
  c.font = F(800, 50); c.fillText("BRATTLEBORO", w / 2, 70); c.font = F(800, 64); c.fillText("REFORMER", w / 2, 132);
  c.fillStyle = "#F4F1E8"; c.fillRect(70, 190, w - 140, 280);
  c.fillStyle = "#151A22"; c.font = `700 40px ${SERIF}`; c.fillText("Brattleboro Reformer", w / 2, 240);
  c.fillRect(90, 262, w - 180, 3);
  c.font = `700 22px ${SERIF}`; c.textAlign = "left";
  ["LOCAL NEWS", "SPORTS", "WEATHER", "OPINION", "CLASSIFIEDS"].forEach((t, k) => c.fillText(t, 96, 300 + k * 32));
  c.fillStyle = "#9AA3AE"; c.fillRect(300, 290, 120, 130);
});
