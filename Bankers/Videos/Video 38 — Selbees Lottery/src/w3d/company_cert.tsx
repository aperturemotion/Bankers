// @ts-nocheck
// ★ V38 rev 2 (builder E) — THE SHARE CERTIFICATE of G.S. INVESTMENT STRATEGIES (CBS: the company the Selbees formed; shares sold
//   for $500 apiece). Timur, 2026-11-26: "make it more eye-catching, more detailed, and more aesthetic".
//   An engraved stock certificate drawn on a 2304 × 1536 canvas (3.0 × 2.0 units = 30 × 20 cm at the office's 1 unit = 10 cm):
//   a guilloche border band between fine rules, four corner rosettes, a security under-print, an engraved lake-shore vignette in an
//   oval frame (lighthouse, pines, sunrise; no people), NUMBER and SHARES boxes, the arched company name, the state of incorporation
//   (Michigan), "THIS CERTIFIES THAT … is the owner of … SHARES", the transfer boilerplate, a $500 PER SHARE cartouche, the
//   Secretary's and President's signature lines (titles only), and — as a real 3-D part — the gold foil seal with a sawtooth edge,
//   embossed (the 29 s matched cut lands on it). The paper has a thickness, a deckle-free trimmed edge and a fine emboss (bump map).
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd, ease } from "./kit";
import { BODY } from "./fonts3d";

export const CERT_SERIF = `"Liberation Serif", "Times New Roman", "DejaVu Serif", Georgia, serif`;
export const CW = 3.0, CH = 2.0;                    // the sheet (units)
export const TW = 2304, TH = 1536;                  // its canvas
export const SEAL_PX = { x: 1152, y: 1282, r: 125 }; // the foil seal on the canvas (centre, tooth-tip radius)
export const PRICE_PX = { x: 1152, y: 1134 };       // the $500 PER SHARE cartouche
export const TITLE_PX = { x: 1152, y: 392 };
const INK = "#173F72", INK2 = "rgba(23,63,114,";
const PAPER = "#F1EFE7";

// ── drawing helpers ─────────────────────────────────────────────────────────────────────────────────────────────────────
const spaced = (c, text, x, y, sp) => {   // letter-spaced text centred on x (canvas letterSpacing is not everywhere)
  const ws = [...text].map((ch) => c.measureText(ch).width);
  const tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  let cx = x - tot / 2;
  const al = c.textAlign; c.textAlign = "left";
  [...text].forEach((ch, i) => { c.fillText(ch, cx, y); cx += ws[i] + sp; });
  c.textAlign = al;
  return tot;
};
const arched = (c, text, cx, cy, R, sp) => {   // text on a gentle upward arch (centre of the arch at cx, baseline cy)
  const ws = [...text].map((ch) => c.measureText(ch).width);
  const tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  let s = -tot / 2;
  const al = c.textAlign; c.textAlign = "center";
  [...text].forEach((ch, i) => {
    const mid = s + ws[i] / 2, a = mid / R;
    c.save(); c.translate(cx + Math.sin(a) * R, cy + R - Math.cos(a) * R); c.rotate(a); c.fillText(ch, 0, 0); c.restore();
    s += ws[i] + sp;
  });
  c.textAlign = al;
};
// a guilloche band along a straight edge: n interlaced sine strands, two frequencies (the engraved lattice of a real border)
const bandLine = (c, x0, y0, x1, y1, amp, n, per, ph, lw) => {
  const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len;
  c.lineWidth = lw;
  for (let k = 0; k < n; k++) {
    c.beginPath();
    for (let s = 0; s <= len; s += 3) {
      const o = amp * Math.sin((s / per) * Math.PI * 2 + (k * Math.PI * 2) / n + ph) * (0.55 + 0.45 * Math.cos((s / (per * 7.3)) * Math.PI * 2 + k));
      const x = x0 + ux * s - uy * o, y = y0 + uy * s + ux * o;
      s ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
  }
};
// a rosette: rose curves and rotated loops (a spirograph medallion)
const rosette = (c, x, y, R, seed) => {
  c.save(); c.translate(x, y);
  c.fillStyle = PAPER; c.beginPath(); c.arc(0, 0, R + 6, 0, Math.PI * 2); c.fill();
  c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.arc(0, 0, R + 4, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 1.0;
  for (let ring = 0; ring < 3; ring++) {
    const r0 = R * (0.95 - ring * 0.27), a = R * 0.11, n = 12 + ring * 6;
    c.strokeStyle = INK2 + (0.85 - ring * 0.15) + ")";
    for (let k = 0; k < 4; k++) {
      c.beginPath();
      for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.012) {
        const r = r0 - a + a * Math.sin(n * t + k * 0.8 + seed);
        const xx = Math.cos(t) * r, yy = Math.sin(t) * r; t ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
      }
      c.stroke();
    }
  }
  // the hub: epitrochoid petals
  c.strokeStyle = INK; c.lineWidth = 0.9;
  for (let k = 0; k < 16; k++) { c.beginPath(); c.ellipse(0, 0, R * 0.3, R * 0.1, (k * Math.PI) / 16, 0, Math.PI * 2); c.stroke(); }
  c.fillStyle = INK; c.beginPath(); c.arc(0, 0, R * 0.06, 0, Math.PI * 2); c.fill();
  c.restore();
};
// the engraved vignette: a Great Lakes shore at sunrise in an oval, all in line work (hatching), no people
const vignette = (c, cx, cy, rx, ry) => {
  c.save();
  c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); c.clip();
  c.fillStyle = PAPER; c.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
  const hz = cy + ry * 0.12;                      // the horizon
  const sunX = cx + rx * 0.28, sunR = ry * 0.32;
  // sky: horizontal engraved lines, thinning toward the sun
  for (let y = cy - ry; y < hz; y += 4) {
    c.beginPath(); let on = false;
    for (let x = cx - rx; x <= cx + rx; x += 3) {
      const d = Math.hypot(x - sunX, (y - hz) * 1.4) / (rx * 0.9);
      const keep = rnd(Math.floor(x) * 7 + Math.floor(y) * 131) < 0.2 + 0.8 * Math.min(1, d * d);
      if (keep && !on) { c.moveTo(x, y); on = true; } else if (!keep && on) { c.lineTo(x, y); on = false; } else if (on) c.lineTo(x, y);
    }
    c.lineWidth = 1.1 + 0.6 * ((y - (cy - ry)) / (hz - cy + ry) < 0.4 ? 1 : 0); c.strokeStyle = INK2 + "0.75)"; c.stroke();
  }
  // the sun's rays
  c.strokeStyle = INK2 + "0.55)"; c.lineWidth = 1.2;
  for (let k = 0; k < 34; k++) { const a = Math.PI + (k / 33) * Math.PI; c.beginPath(); c.moveTo(sunX + Math.cos(a) * sunR * 1.15, hz + Math.sin(a) * sunR * 1.15); c.lineTo(sunX + Math.cos(a) * rx * 1.2, hz + Math.sin(a) * rx * 1.2); c.stroke(); }
  c.fillStyle = PAPER; c.beginPath(); c.arc(sunX, hz, sunR, Math.PI, 0); c.fill();
  c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.arc(sunX, hz, sunR, Math.PI, 0); c.stroke();
  // the far shore: low hills, cross-hatched
  const hill = (x) => hz - 10 - 16 * Math.sin((x - cx) / 60) - 10 * Math.sin((x - cx) / 23 + 1) - (x < cx - rx * 0.2 ? 14 : 0);
  c.strokeStyle = INK2 + "0.9)"; c.lineWidth = 1;
  for (let x = cx - rx; x < cx + rx; x += 4) { if (Math.abs(x - sunX) < sunR * 1.1) continue; c.beginPath(); c.moveTo(x, hz); c.lineTo(x + 6, hill(x)); c.stroke(); }
  c.beginPath(); for (let x = cx - rx; x <= cx + rx; x += 3) { if (Math.abs(x - sunX) < sunR * 1.05) { c.moveTo(x + 3, hill(x + 3)); continue; } c.lineTo(x, hill(x)); } c.stroke();
  // water: wavy lines with the sun's glitter path left open
  for (let y = hz + 5; y < cy + ry; y += 5) {
    const depth = (y - hz) / (cy + ry - hz);
    c.beginPath(); let on = false;
    for (let x = cx - rx; x <= cx + rx; x += 3) {
      const glit = Math.abs(x - sunX) < sunR * (0.5 + depth * 1.2) && rnd(Math.floor(x / 9) * 17 + Math.floor(y)) < 0.75;
      const yy = y + 1.6 * Math.sin(x / (7 + depth * 8) + y);
      if (!glit && !on) { c.moveTo(x, yy); on = true; } else if (glit && on) { c.stroke(); c.beginPath(); on = false; } else if (on) c.lineTo(x, yy);
    }
    c.lineWidth = 0.9 + depth * 0.9; c.strokeStyle = INK2 + (0.55 + depth * 0.4) + ")"; c.stroke();
  }
  // the rocky point at left with pines and a lighthouse
  const px0 = cx - rx, px1 = cx - rx * 0.22;
  const rock = (x) => hz + ry * 0.55 - (ry * 0.62) * Math.pow(Math.max(0, 1 - (x - px0) / (px1 - px0)), 0.6) + 6 * Math.sin(x / 11);
  c.fillStyle = PAPER; c.beginPath(); c.moveTo(px0, cy + ry); for (let x = px0; x <= px1; x += 3) c.lineTo(x, rock(x)); c.lineTo(px1, cy + ry); c.closePath(); c.fill();
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); for (let x = px0; x <= px1; x += 3) x === px0 ? c.moveTo(x, rock(x)) : c.lineTo(x, rock(x)); c.stroke();
  c.lineWidth = 1;
  for (let x = px0; x < px1; x += 5) { const top = rock(x); c.beginPath(); c.moveTo(x, top + 4); c.lineTo(x - 18, Math.min(cy + ry, top + 60)); c.stroke(); }   // rock hatching
  for (let x = px0 + 8; x < px1 - 30; x += 9) { const top = rock(x); c.beginPath(); c.moveTo(x, top + 14); c.lineTo(x + 26, top + 40); c.stroke(); }
  const pine = (x, h) => {
    const b = rock(x) + 2;
    c.fillStyle = PAPER; c.beginPath(); c.moveTo(x, b - h); c.lineTo(x - h * 0.28, b); c.lineTo(x + h * 0.28, b); c.closePath(); c.fill();
    c.strokeStyle = INK; c.lineWidth = 1.3;
    for (let k = 1; k <= 7; k++) { const yy = b - h + (h * k) / 7.5, w = (h * 0.28 * k) / 7; c.beginPath(); c.moveTo(x - w, yy); c.lineTo(x, yy - h * 0.09); c.lineTo(x + w, yy); c.stroke(); }
    c.beginPath(); c.moveTo(x, b - h); c.lineTo(x, b); c.stroke();
  };
  pine(px0 + 40, 96); pine(px0 + 78, 120); pine(px0 + 112, 84); pine(px1 - 64, 60);
  // the lighthouse: a tapered tower, banded, shaded with vertical hatching on its right, a lantern room and two beams
  const lx = px0 + 170, lb = rock(lx) + 4, lh = 150;
  c.fillStyle = PAPER; c.beginPath(); c.moveTo(lx - 20, lb); c.lineTo(lx - 12, lb - lh); c.lineTo(lx + 12, lb - lh); c.lineTo(lx + 20, lb); c.closePath(); c.fill();
  c.strokeStyle = INK; c.lineWidth = 1.8; c.stroke();
  c.lineWidth = 1; for (let k = 0; k < 9; k++) { const x = lx + 2 + k * 2; c.beginPath(); c.moveTo(x, lb - lh + 2); c.lineTo(x + k * 0.1, lb); c.stroke(); }
  [0.3, 0.62].forEach((q) => { const y = lb - lh * q; c.beginPath(); c.moveTo(lx - 20 + 8 * q, y); c.lineTo(lx + 20 - 8 * q, y); c.lineWidth = 6; c.stroke(); });
  c.lineWidth = 1.6; c.strokeRect(lx - 9, lb - lh - 24, 18, 24); c.beginPath(); c.moveTo(lx - 14, lb - lh - 24); c.lineTo(lx, lb - lh - 40); c.lineTo(lx + 14, lb - lh - 24); c.stroke();
  c.beginPath(); c.moveTo(lx - 16, lb - lh); c.lineTo(lx + 16, lb - lh); c.lineWidth = 3; c.stroke();
  c.lineWidth = 0.8; c.strokeStyle = INK2 + "0.6)";
  for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(lx + 12, lb - lh - 12); c.lineTo(lx + 210, lb - lh - 12 + k * 7 - 30); c.stroke(); c.beginPath(); c.moveTo(lx - 12, lb - lh - 12); c.lineTo(lx - 160, lb - lh - 12 + k * 6 - 22); c.stroke(); }
  // a schooner on the water, far right (sails only, hatched)
  const sx = cx + rx * 0.62, sy = hz + 16;
  c.strokeStyle = INK; c.lineWidth = 1.2; c.fillStyle = PAPER;
  c.beginPath(); c.moveTo(sx - 26, sy); c.lineTo(sx + 26, sy); c.lineTo(sx + 18, sy + 7); c.lineTo(sx - 20, sy + 7); c.closePath(); c.fill(); c.stroke();
  [[-6, 46], [10, 38]].forEach(([dx, h]) => { c.beginPath(); c.moveTo(sx + dx, sy); c.lineTo(sx + dx, sy - h); c.lineTo(sx + dx + 16, sy - 4); c.closePath(); c.fill(); c.stroke(); for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(sx + dx + 1, sy - (h * k) / 5); c.lineTo(sx + dx + 16 * (k / 5), sy - (h * k) / 5 + 3); c.stroke(); } });
  // gulls
  c.lineWidth = 1.4; [[cx + rx * 0.05, cy - ry * 0.55], [cx + rx * 0.14, cy - ry * 0.62], [cx - rx * 0.05, cy - ry * 0.45]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x - 9, y); c.quadraticCurveTo(x - 4, y - 6, x, y); c.quadraticCurveTo(x + 4, y - 6, x + 9, y); c.stroke(); });
  c.restore();
  // the oval frame: a fine engraved ring with a beaded edge
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 1;
  for (let k = 0; k < 3; k++) { c.beginPath(); for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.01) { const o = 9 + 5 * Math.sin(t * 90 + k * 2.1); const x = cx + Math.cos(t) * (rx + o), y = cy + Math.sin(t) * (ry + o); t ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
  c.lineWidth = 2; c.beginPath(); c.ellipse(cx, cy, rx + 18, ry + 18, 0, 0, Math.PI * 2); c.stroke();
};
// ── the full sheet (drawn once; each certificate copies it and prints its own number) ───────────────────────────────────────
let baseCanvas = null;
const drawBase = () => {
  if (baseCanvas) return baseCanvas;
  const cv = document.createElement("canvas"); cv.width = TW; cv.height = TH;
  const c = cv.getContext("2d"), w = TW, h = TH;
  // paper with a faint tone
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#F4F2EA"); g.addColorStop(1, "#ECE9DF"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 14000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "120,110,90" : "255,255,255"},${0.02 + rnd(i + 4) * 0.05})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  // the security under-print in the field: a pale blue lattice of fine waves (lithographed tint)
  c.save(); c.beginPath(); c.rect(176, 176, w - 352, h - 352); c.clip();
  c.strokeStyle = "rgba(77,142,217,0.13)"; c.lineWidth = 1;
  for (let y = 150; y < h; y += 11) { c.beginPath(); for (let x = 150; x < w; x += 6) { const yy = y + 5 * Math.sin(x / 26 + y / 40); x === 150 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); }
  for (let y = 150; y < h; y += 11) { c.beginPath(); for (let x = 150; x < w; x += 6) { const yy = y + 5 * Math.sin(-x / 26 + y / 37 + 1.3); x === 150 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); }
  // a large faint GS monogram rosette in the tint behind the text
  c.strokeStyle = "rgba(77,142,217,0.12)"; c.lineWidth = 1.2;
  for (let k = 0; k < 48; k++) { c.beginPath(); c.ellipse(w / 2, 860, 360, 120, (k * Math.PI) / 48, 0, Math.PI * 2); c.stroke(); }
  c.restore();
  // the border: outer rule, guilloche band, inner rules, a fine inner key
  c.strokeStyle = INK; c.lineWidth = 7; c.strokeRect(36, 36, w - 72, h - 72);
  c.lineWidth = 2; c.strokeRect(50, 50, w - 100, h - 100);
  c.strokeStyle = INK2 + "0.85)";
  const B = 100;   // the band's centre line
  bandLine(c, B, B, w - B, B, 34, 6, 58, 0, 1.15); bandLine(c, B, h - B, w - B, h - B, 34, 6, 58, 1, 1.15);
  bandLine(c, B, B, B, h - B, 34, 6, 58, 2, 1.15); bandLine(c, w - B, B, w - B, h - B, 34, 6, 58, 3, 1.15);
  c.strokeStyle = INK2 + "0.55)";
  bandLine(c, B, B, w - B, B, 22, 3, 23, 0.5, 0.9); bandLine(c, B, h - B, w - B, h - B, 22, 3, 23, 1.5, 0.9);
  bandLine(c, B, B, B, h - B, 22, 3, 23, 2.5, 0.9); bandLine(c, w - B, B, w - B, h - B, 22, 3, 23, 3.5, 0.9);
  c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(150, 150, w - 300, h - 300);
  c.lineWidth = 5; c.strokeRect(160, 160, w - 320, h - 320);
  c.lineWidth = 1; c.strokeRect(170, 170, w - 340, h - 340);
  // the inner key: small repeated lozenges along the inner rule
  c.fillStyle = INK;
  for (let x = 190; x < w - 190; x += 18) [176, h - 176].forEach((y) => { c.beginPath(); c.moveTo(x, y - 3); c.lineTo(x + 5, y); c.lineTo(x, y + 3); c.lineTo(x - 5, y); c.closePath(); c.fill(); });
  for (let y = 190; y < h - 190; y += 18) [176, w - 176].forEach((x) => { c.beginPath(); c.moveTo(x - 3, y); c.lineTo(x, y + 5); c.lineTo(x + 3, y); c.lineTo(x, y - 5); c.closePath(); c.fill(); });
  // corner rosettes over the band's joins, and two smaller ones mid-side
  [[B, B], [w - B, B], [B, h - B], [w - B, h - B]].forEach(([x, y], i) => rosette(c, x, y, 82, i));
  [[B, h / 2], [w - B, h / 2]].forEach(([x, y], i) => rosette(c, x, y, 56, i + 5));
  // NUMBER and SHARES boxes (engraved frames with a fine inner tint)
  const box = (x0, label, value) => {
    const y0 = 196, bw = 330, bh = 124;
    c.fillStyle = "rgba(77,142,217,0.08)"; c.fillRect(x0, y0, bw, bh);
    c.strokeStyle = INK; c.lineWidth = 4; c.strokeRect(x0, y0, bw, bh); c.lineWidth = 1.2; c.strokeRect(x0 + 9, y0 + 9, bw - 18, bh - 18);
    c.fillStyle = INK; c.font = `700 24px ${CERT_SERIF}`; c.textAlign = "center"; spaced(c, label, x0 + bw / 2, y0 + 38, 6);
    if (value) { c.font = `700 54px ${CERT_SERIF}`; c.fillText(value, x0 + bw / 2, y0 + 98); }
  };
  box(214, "NUMBER", null); box(w - 214 - 330, "SHARES", "* ONE *");
  // incorporated line, the arched name, sub-rules
  c.fillStyle = INK; c.textAlign = "center";
  c.font = `700 30px ${CERT_SERIF}`; spaced(c, "INCORPORATED UNDER THE LAWS OF THE STATE OF MICHIGAN", w / 2, 252, 4.5);
  c.font = `400 24px ${CERT_SERIF}`; spaced(c, "CAPITAL STOCK", w / 2, 296, 9);
  c.font = `700 96px ${CERT_SERIF}`;
  c.save(); c.fillStyle = "rgba(23,63,114,0.25)"; c.translate(3, 3); arched(c, "G.S. INVESTMENT STRATEGIES", TITLE_PX.x, TITLE_PX.y, 2600, 9); c.restore();
  c.fillStyle = INK; arched(c, "G.S. INVESTMENT STRATEGIES", TITLE_PX.x, TITLE_PX.y, 2600, 9);
  // the vignette
  vignette(c, w / 2, 592, 280, 128);
  // scroll flourishes either side of the vignette
  c.strokeStyle = INK; c.lineWidth = 1.6;
  [-1, 1].forEach((s) => { for (let k = 0; k < 4; k++) { c.beginPath(); for (let t = 0; t <= 1; t += 0.01) { const x = w / 2 + s * (330 + t * 360), y = 592 + (18 + k * 9) * Math.sin(t * Math.PI * 2.2 + k) * (1 - t * 0.6); t ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } });
  // the certifying text
  c.font = `700 40px ${CERT_SERIF}`; spaced(c, "THIS CERTIFIES THAT", w / 2, 786, 10);
  c.fillStyle = INK; c.fillRect(560, 846, w - 1120, 2.5);
  c.font = `italic 400 40px ${CERT_SERIF}`; c.fillText("is the owner of", w / 2 - 470, 906);
  c.font = `italic 700 46px ${CERT_SERIF}`; c.fillText("One", w / 2 - 205, 906);
  c.fillRect(w / 2 - 300, 914, 190, 2);
  c.font = `italic 400 40px ${CERT_SERIF}`; c.textAlign = "left"; c.fillText("fully paid and non-assessable share of the", w / 2 - 90, 906); c.textAlign = "center";
  c.font = `700 44px ${CERT_SERIF}`; spaced(c, "CAPITAL STOCK OF G.S. INVESTMENT STRATEGIES", w / 2, 966, 5);
  c.font = `400 27px ${CERT_SERIF}`;
  c.fillText("transferable only on the books of the Company by the holder hereof in person or by duly authorized attorney", w / 2, 1016);
  c.fillText("upon surrender of this Certificate properly endorsed. This Certificate is not valid until countersigned.", w / 2, 1052);
  c.font = `italic 400 27px ${CERT_SERIF}`;
  c.fillText("In Witness Whereof, the said Company has caused this Certificate to be signed by its duly authorized officers", w / 2, 1088);
  // the $500 PER SHARE cartouche: a ribbon with folded ends
  const cx = PRICE_PX.x, cy = PRICE_PX.y;
  c.fillStyle = INK;
  [-1, 1].forEach((s) => { c.beginPath(); c.moveTo(cx + s * 250, cy - 26); c.lineTo(cx + s * 300, cy - 26); c.lineTo(cx + s * 282, cy + 6); c.lineTo(cx + s * 300, cy + 38); c.lineTo(cx + s * 250, cy + 38); c.closePath(); c.fill(); });
  c.fillStyle = "#F4F2EA"; c.strokeStyle = INK; c.lineWidth = 4;
  c.beginPath(); c.roundRect(cx - 262, cy - 36, 524, 66, 10); c.fill(); c.stroke();
  c.lineWidth = 1.2; c.beginPath(); c.roundRect(cx - 252, cy - 28, 504, 50, 7); c.stroke();
  c.fillStyle = INK; c.font = `700 40px ${CERT_SERIF}`; spaced(c, "$500 PER SHARE", cx, cy + 12, 7);
  // date and signature lines (titles only; no signatures)
  c.textAlign = "left"; c.font = `400 30px ${CERT_SERIF}`; c.fillText("Dated", 330, 1190); c.fillRect(420, 1194, 330, 2);
  [[580, "SECRETARY"], [w - 580, "PRESIDENT"]].forEach(([x, t]) => {
    c.fillStyle = INK; c.fillRect(x - 260, 1286, 520, 2.5);
    c.font = `700 28px ${CERT_SERIF}`; c.textAlign = "center"; spaced(c, t, x, 1326, 8);
  });
  c.font = `400 20px ${CERT_SERIF}`; spaced(c, "SEE REVERSE FOR CERTAIN DEFINITIONS", w / 2, h - 186, 4);
  baseCanvas = cv;
  return cv;
};
/** the certificate face for sheet n (the top sheet is the hero, drawn at full size; the ones under it at 2/3) */
export const certTex = (n, hero) => canvasTex("c2_cert" + n, hero ? TW : 1536, hero ? TH : 1024, (c, w, h) => {
  c.drawImage(drawBase(), 0, 0, w, h);
  c.save(); c.scale(w / TW, h / TH);
  c.fillStyle = INK; c.font = `700 54px ${CERT_SERIF}`; c.textAlign = "center"; c.fillText("GS-" + String(n).padStart(3, "0"), 214 + 165, 196 + 98);
  c.restore();
});
/** a grey height map of the same print (intaglio: the ink stands up from the paper a hair) for the paper's emboss */
export const certBump = () => canvasTex("c2_certbump", 1152, 768, (c, w, h) => {
  c.fillStyle = "#808080"; c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = "difference"; c.drawImage(drawBase(), 0, 0, w, h); c.globalCompositeOperation = "source-over";
  // a blind-embossed ring where the seal presses the paper
  c.strokeStyle = "rgba(255,255,255,0.5)"; c.lineWidth = 6; c.beginPath(); c.arc((SEAL_PX.x / TW) * w, (SEAL_PX.y / TH) * h, (SEAL_PX.r + 10) * (w / TW), 0, Math.PI * 2); c.stroke();
});
// ── the gold foil seal (a real part: a sawtooth foil disc, embossed) ───────────────────────────────────────────────────────
export const SEAL_R = (SEAL_PX.r / TW) * CW;   // tooth-tip radius in units (0.163)
const TEETH = 56;
const sealFace = () => canvasTex("c2_sealface", 1024, 1024, (c, w, h) => {
  const cx = w / 2, cy = h / 2, R = w / 2;
  const g = c.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.05, cx, cy, R);
  g.addColorStop(0, "#FFF0B8"); g.addColorStop(0.45, "#E2BD62"); g.addColorStop(0.8, "#B88A2E"); g.addColorStop(1, "#8E6620");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  // the foil's brushed sheen: concentric fine rings
  for (let r = 8; r < R; r += 3) { c.strokeStyle = `rgba(${r % 2 ? "255,240,190" : "90,60,10"},${0.05 + rnd(r) * 0.06})`; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke(); }
  const emb = (fn) => { c.save(); c.translate(-2.5, -2.5); c.globalAlpha = 0.55; c.fillStyle = c.strokeStyle = "#FFF3C8"; fn(); c.restore(); c.save(); c.translate(2.5, 2.5); c.globalAlpha = 0.7; c.fillStyle = c.strokeStyle = "#6B4A12"; fn(); c.restore(); c.save(); c.fillStyle = c.strokeStyle = "#C99B3E"; fn(); c.restore(); };
  // rings
  emb(() => { c.lineWidth = 10; c.beginPath(); c.arc(cx, cy, R * 0.86, 0, Math.PI * 2); c.stroke(); });
  emb(() => { c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, R * 0.6, 0, Math.PI * 2); c.stroke(); });
  emb(() => { c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R * 0.54, 0, Math.PI * 2); c.stroke(); });
  // the milled rim between the teeth and the outer ring
  emb(() => { c.lineWidth = 3; for (let k = 0; k < 120; k++) { const a = (k / 120) * Math.PI * 2; c.beginPath(); c.moveTo(cx + Math.cos(a) * R * 0.88, cy + Math.sin(a) * R * 0.88); c.lineTo(cx + Math.cos(a) * R * 0.95, cy + Math.sin(a) * R * 0.95); c.stroke(); } });
  // the legend around the ring
  const ring = (text, r, top) => {
    c.font = `700 ${Math.round(R * 0.13)}px ${CERT_SERIF}`; c.textAlign = "center"; c.textBaseline = "middle";
    const ws = [...text].map((ch) => c.measureText(ch).width + R * 0.018), tot = ws.reduce((a, b) => a + b, 0);
    let s = -tot / 2;
    [...text].forEach((ch, i) => {
      const a = (s + ws[i] / 2) / r; s += ws[i];
      c.save();
      if (top) { c.translate(cx + Math.sin(a) * r, cy - Math.cos(a) * r); c.rotate(a); }
      else { c.translate(cx + Math.sin(a) * r, cy + Math.cos(a) * r); c.rotate(-a); }
      c.fillText(ch, 0, 0); c.restore();
    });
  };
  emb(() => ring("G.S. INVESTMENT STRATEGIES", R * 0.73, true));
  emb(() => ring("MICHIGAN", R * 0.73, false));
  emb(() => { [-1, 1].forEach((s) => { const a = s * 1.86; c.font = `700 ${Math.round(R * 0.12)}px ${CERT_SERIF}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("★", cx + Math.sin(a) * R * 0.73, cy - Math.cos(a) * R * 0.73); }); });
  // the centre: CORPORATE / SEAL over a laurel
  emb(() => {
    c.textAlign = "center"; c.textBaseline = "middle";
    c.font = `700 ${Math.round(R * 0.12)}px ${CERT_SERIF}`; c.fillText("CORPORATE", cx, cy - R * 0.2);
    c.font = `700 ${Math.round(R * 0.3)}px ${CERT_SERIF}`; c.fillText("GS", cx, cy + R * 0.02);
    c.font = `700 ${Math.round(R * 0.12)}px ${CERT_SERIF}`; c.fillText("SEAL", cx, cy + R * 0.25);
  });
  emb(() => { c.lineWidth = 3; [-1, 1].forEach((s) => { for (let k = 0; k < 7; k++) { const a = Math.PI / 2 + s * (0.35 + k * 0.17); const x = cx + Math.cos(a) * R * 0.44, y = cy + Math.sin(a) * R * 0.44; c.beginPath(); c.ellipse(x, y, R * 0.045, R * 0.018, a + s * 0.9, 0, Math.PI * 2); c.fill(); } }); });
});
const sealBump = () => canvasTex("c2_sealbump", 512, 512, (c, w, h) => {
  // height: the same relief, light = raised
  c.drawImage(sealFace().image, 0, 0, w, h);
  const d = c.getImageData(0, 0, w, h), p = d.data;
  for (let i = 0; i < p.length; i += 4) { const v = (p[i] * 0.3 + p[i + 1] * 0.6 + p[i + 2] * 0.1); p[i] = p[i + 1] = p[i + 2] = v; }
  c.putImageData(d, 0, 0);
});
export const sealShape = () => {
  const s = new THREE.Shape();
  for (let k = 0; k <= TEETH * 2; k++) {
    const a = (k / (TEETH * 2)) * Math.PI * 2, r = k % 2 ? SEAL_R * 0.92 : SEAL_R;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    k ? s.lineTo(x, y) : s.moveTo(x, y);
  }
  return s;
};
let sealRes = null;
export const useSeal = () => useMemo(() => {
  if (sealRes) return sealRes;
  const geo = new THREE.ExtrudeGeometry(sealShape(), { depth: 0.0035, bevelEnabled: true, bevelThickness: 0.0016, bevelSize: 0.0016, bevelSegments: 2, curveSegments: 4 });
  geo.rotateX(-Math.PI / 2);   // lie flat, face up (+y); the shape's +y becomes −z (the canvas top)
  const face = sealFace(); face.repeat.set(1 / (2 * SEAL_R), 1 / (2 * SEAL_R)); face.offset.set(0.5, 0.5);
  const bump = sealBump(); bump.repeat.copy(face.repeat); bump.offset.copy(face.offset);
  const mat = new THREE.MeshStandardMaterial({ map: face, bumpMap: bump, bumpScale: 0.6, color: "#FFFFFF", metalness: 0.75, roughness: 0.34, envMapIntensity: 1.1, emissive: "#3A2A08", emissiveIntensity: 0.35 });
  sealRes = { geo, mat };
  return sealRes;
}, []);
export const Seal = ({ position }) => {
  const { geo, mat } = useSeal();
  return <mesh geometry={geo} material={mat} position={position} castShadow receiveShadow />;
};
// ── the fan of certificates on the blotter (seven sheets turning about their lower-left corner; the top one stays square) ──────
export const CERT_N = 7;
export const FAN_PIVOT = [-3.75, 0, 1.3];
export const SHEET_T = 0.012;
export const sheetY = (i) => 0.008 + i * 0.016;
const fanAng = (i) => (CERT_N - 1 - i) * 0.15;
export const fanOpen = (cut, f, i) => ease(f, cut + 6 + (CERT_N - 1 - i) * 3, cut + 34 + (CERT_N - 1 - i) * 3);
// local (fan-pivot space, unrotated sheet) → station-local for the TOP sheet (it never turns)
export const onTop = (px, py, lift = 0.004) => [FAN_PIVOT[0] + (px / TW) * CW, sheetY(CERT_N - 1) + SHEET_T / 2 + lift, FAN_PIVOT[2] - CH + (py / TH) * CH];
export const SEAL_C = onTop(SEAL_PX.x, SEAL_PX.y, 0.0017 + 0.0051);   // the seal's top-face centre (local)
export const Certificates = ({ f, cut }) => {
  const geo = useMemo(() => new THREE.BoxGeometry(CW, SHEET_T, CH), []);
  const mats = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: "#E9E6DC", roughness: 0.85 });
    const bump = certBump();
    return Array.from({ length: CERT_N }, (_, i) => {
      const top = new THREE.MeshStandardMaterial({ map: certTex(i + 1, i === CERT_N - 1), bumpMap: bump, bumpScale: 0.35, color: "#C9CED6", roughness: 0.66, envMapIntensity: 0.35 });
      return [edge, edge, top, edge, edge, edge];
    });
  }, []);
  const sx = (SEAL_PX.x / TW) * CW, sz = -CH + (SEAL_PX.y / TH) * CH;
  return (
    <group position={FAN_PIVOT}>
      {Array.from({ length: CERT_N }, (_, i) => {
        const a = fanAng(i) * fanOpen(cut, f, i);
        return (
          <group key={i} rotation-y={a} position={[0, sheetY(i), 0]}>
            <mesh geometry={geo} material={mats[i]} position={[CW / 2, 0, -CH / 2]} castShadow receiveShadow />
            <Seal position={[sx, SHEET_T / 2 + 0.0017, sz]} />
          </group>
        );
      })}
    </group>
  );
};
