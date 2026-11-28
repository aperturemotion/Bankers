// @ts-nocheck
// ★ V39 builder B — THE WINTER KIT shared by the farm, gas and yard stations (rural Vermont, blue hour, snow on the ground).
//   Everything repeated is merged through town_parts' Mesher (one geometry per material, vertex colours tint the shared textures):
//   bMats()                 the materials: weathered clapboard, barn boards, tin roof, shingles, snow, stone, split wood, trim,
//                           a window/door atlas (dark frosted panes + warm lit rooms), brick
//   addHouse(m, spec)       a New England gable house: clapboard walls (real holes where the camera looks inside), corner boards,
//                           cased windows with sills/heads, a panelled door, a roof with its snow load + icicles, a brick chimney
//   addStoneWall / addRailFence / addPines / addMaple   fieldstone walls, a split-rail fence, snowy pines, bare sugar maples
//   <Snowfield hgt>         the snow ground (wind ripples, a bump map) over a height function; <Ridges> distant hills
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { Mesher, townMats } from "./town_parts";
import { BODY } from "./fonts3d";

export const bpick = (arr, r) => arr[Math.floor(r * arr.length) % arr.length];
const rep = (t, sx, sy = sx) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / sx, 1 / sy); t.needsUpdate = true; return t; };
const lin = (t) => { t.colorSpace = THREE.NoColorSpace; return t; };
export const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// value noise (deterministic)
const hash2 = (x, y) => rnd(x * 157 + y * 311 + 17);
export const vnoise = (x, y) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
export const fbm = (x, y, o = 4) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s; };

// ── textures ────────────────────────────────────────────────────────────────────────────────────────────────────────────
const snowDraw = (bump) => (c, w, h) => {
  c.fillStyle = bump ? "#808080" : "#F3F6FA"; c.fillRect(0, 0, w, h);
  // wind ripples: long soft bands, slightly wavy
  for (let i = 0; i < 90; i++) {
    const y0 = rnd(i * 3 + 1) * h, amp = 6 + rnd(i) * 10, len = 200 + rnd(i + 5) * 500, x0 = rnd(i + 9) * w;
    c.strokeStyle = bump ? `rgba(255,255,255,${0.10 + rnd(i + 2) * 0.12})` : `rgba(150,170,205,${0.025 + rnd(i + 2) * 0.03})`;
    c.lineWidth = 6 + rnd(i + 4) * 10; c.beginPath();
    for (let x = 0; x <= len; x += 16) { const yy = y0 + Math.sin((x0 + x) / 90 + i) * amp; if (x === 0) c.moveTo(x0 + x, yy); else c.lineTo(x0 + x, yy); }
    c.stroke();
  }
  for (let i = 0; i < 40000; i++) {
    const g = rnd(i * 2 + 7);
    c.fillStyle = bump ? `rgba(${g < 0.5 ? "0,0,0" : "255,255,255"},${0.05 + rnd(i) * 0.1})` : `rgba(${g < 0.55 ? "120,140,175" : "255,255,255"},${0.03 + rnd(i) * 0.06})`;
    c.fillRect(rnd(i + 1) * w, rnd(i + 3) * h, 2, 2);
  }
  if (!bump) for (let i = 0; i < 260; i++) { c.fillStyle = "rgba(255,255,255,0.9)"; c.fillRect(rnd(i * 5 + 2) * w, rnd(i * 7 + 3) * h, 1.5, 1.5); }   // sparkle
};
// weathered painted clapboard: 0.1 m exposure (16 boards over a 1.6 m tile), old white paint gone chalky and grey along the grain,
//   a hard shadow under every lap, butt joints, nail heads with rust weeps
const clapDraw = (bump) => (c, w, h) => {
  const n = 16, bh = h / n;
  for (let r = 0; r < n; r++) {
    const y = r * bh, g = c.createLinearGradient(0, y, 0, y + bh);
    if (bump) { g.addColorStop(0, "#1A1A1A"); g.addColorStop(0.12, "#9A9A9A"); g.addColorStop(0.9, "#E8E8E8"); g.addColorStop(1, "#FFFFFF"); }
    else { g.addColorStop(0, "#9E9C96"); g.addColorStop(0.14, "#DCDAD3"); g.addColorStop(0.85, "#EEEDE7"); g.addColorStop(1, "#F4F3EE"); }
    c.fillStyle = g; c.fillRect(0, y, w, bh);
    if (!bump) {
      // weathering runs ALONG the board: long thin grey streaks where the paint has worn to the wood
      for (let q = 0; q < 26; q++) {
        const sx = rnd(r * 70 + q) * w, sl = 40 + rnd(r * 70 + q + 1) * 260, sy = y + 6 + rnd(r * 70 + q + 2) * (bh - 12);
        c.fillStyle = `rgba(${120 + rnd(q) * 20},${116 + rnd(q) * 16},${106 + rnd(q) * 12},${0.12 + rnd(r * 70 + q + 3) * 0.22})`;
        c.fillRect(sx, sy, sl, 1 + rnd(q + r) * 2.5);
      }
      c.fillStyle = "rgba(34,38,46,0.7)"; c.fillRect(0, y + bh - 4, w, 4);   // the shadow under each lap
      if (r % 3 === 1) { const bx = Math.floor(rnd(r + 5) * w); c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(bx, y, 2, bh - 4); }
      for (let q = 0; q < 3; q++) { const nx = (q + 0.3 + rnd(r + q) * 0.2) * w / 3; c.fillStyle = "rgba(70,50,36,0.5)"; c.fillRect(nx, y + bh - 10, 3, 3); c.fillStyle = "rgba(110,70,40,0.08)"; c.fillRect(nx, y + bh - 7, 2, 8 + rnd(q * r) * 12); }
    } else { c.fillStyle = "#000"; c.fillRect(0, y + bh - 4, w, 4); }
  }
};
// barn boards: vertical, ~0.25 m wide with battens, sun-silvered grey-brown (a ghost of old oxide paint in places), knots, nails
const boardDraw = (bump) => (c, w, h) => {
  const n = 8, bw = w / n;
  for (let k = 0; k < n; k++) {
    const x = k * bw, s = k * 31;
    if (bump) {
      c.fillStyle = "#B0B0B0"; c.fillRect(x, 0, bw, h);
      for (let q = 0; q < 70; q++) { c.fillStyle = `rgba(${rnd(s + q) < 0.5 ? "0,0,0" : "255,255,255"},0.25)`; c.fillRect(x + rnd(s + q * 3) * bw, 0, 1.5 + rnd(q) * 2, h); }
      c.fillStyle = "#000"; c.fillRect(x, 0, 4, h);
      continue;
    }
    const l = 30 + rnd(s) * 12, hue = 26 + rnd(s + 1) * 10, sat = 8 + rnd(s + 2) * 8;
    c.fillStyle = `hsl(${hue},${sat}%,${l}%)`; c.fillRect(x, 0, bw, h);
    for (let q = 0; q < 90; q++) { c.fillStyle = `rgba(${rnd(s + q) < 0.5 ? "20,16,12" : "200,195,185"},${0.05 + rnd(s + q * 2) * 0.09})`; c.fillRect(x + rnd(s + q * 3) * bw, 0, 1 + rnd(q) * 2.5, h); }
    if (rnd(s + 7) < 0.45) { c.fillStyle = `rgba(110,58,46,${0.10 + rnd(s + 8) * 0.12})`; c.fillRect(x + 4, h * rnd(s + 9) * 0.6, bw - 8, h * (0.2 + rnd(s + 10) * 0.4)); }   // weathered-off oxide paint
    for (let q = 0; q < 2; q++) { const ky = rnd(s + q * 5 + 11) * h, kx = x + bw * (0.3 + rnd(s + q) * 0.4); c.fillStyle = "rgba(30,22,16,0.55)"; c.beginPath(); c.ellipse(kx, ky, 5, 9, 0, 0, 7); c.fill(); c.strokeStyle = "rgba(30,22,16,0.25)"; c.lineWidth = 1.5; c.beginPath(); c.ellipse(kx, ky, 9, 20, 0, 0, 7); c.stroke(); }
    c.fillStyle = "rgba(12,10,8,0.8)"; c.fillRect(x, 0, 4, h);                          // the gap between boards
    for (const ny of [0.12, 0.5, 0.88]) { c.fillStyle = "rgba(40,30,24,0.8)"; c.fillRect(x + bw * 0.5 - 2, ny * h, 4, 4); c.fillStyle = "rgba(100,56,30,0.18)"; c.fillRect(x + bw * 0.5 - 1, ny * h + 4, 2, 24); }
  }
};
// standing-seam tin roof (seams every 0.45 m), grey galvanised with rust streaks
const tinDraw = (bump) => (c, w, h) => {
  const n = 4, sw = w / n;
  c.fillStyle = bump ? "#808080" : "#7C8590"; c.fillRect(0, 0, w, h);
  if (!bump) for (let i = 0; i < 10000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "0,0,0" : "255,255,255"},${rnd(i + 3) * 0.06})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  for (let k = 0; k < n; k++) {
    if (!bump) for (let q = 0; q < 3; q++) { const x = k * sw + rnd(k * 9 + q) * sw; const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(120,64,34,0)"); g.addColorStop(0.6, `rgba(120,64,34,${0.15 + rnd(q + k) * 0.2})`); g.addColorStop(1, "rgba(120,64,34,0.05)"); c.fillStyle = g; c.fillRect(x, 0, 6 + rnd(q) * 14, h); }
    c.fillStyle = bump ? "#FFFFFF" : "#A3ACB6"; c.fillRect(k * sw, 0, 6, h);
    c.fillStyle = bump ? "#000" : "rgba(20,26,34,0.5)"; c.fillRect(k * sw + 6, 0, 4, h);
  }
};
// split firewood / fence rails: weathered grey with split-grain
const splitDraw = (c, w, h) => {
  c.fillStyle = "#8A8176"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "30,24,18" : "220,210,195"},${0.06 + rnd(i + 1) * 0.14})`; c.fillRect(0, rnd(i + 2) * h, w, 1 + rnd(i + 3) * 3); }
  for (let i = 0; i < 30; i++) { c.fillStyle = "rgba(20,16,12,0.5)"; c.fillRect(rnd(i * 3) * w, rnd(i * 5) * h, 20 + rnd(i) * 60, 1.5); }
};
const stoneDraw = (c, w, h) => {
  c.fillStyle = "#9A9C9E"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { const g = rnd(i); c.fillStyle = `rgba(${g < 0.4 ? "40,42,46" : g < 0.8 ? "210,210,205" : "120,130,96"},${0.05 + rnd(i + 1) * 0.12})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2 + rnd(i + 4) * 3, 2 + rnd(i + 5) * 3); }
  for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(150,160,120,${0.12 + rnd(i) * 0.15})`; c.beginPath(); c.arc(rnd(i * 7) * w, rnd(i * 11) * h, 6 + rnd(i * 3) * 16, 0, 7); c.fill(); }   // lichen
};
const trimDrawB = (c, w, h) => { c.fillStyle = "#F0EFEA"; c.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(80,76,70,${rnd(i) * 0.08})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2 + rnd(i) * 8, 1.5); } };

// ── the WINDOW + DOOR atlas (8 × 2 cells of 256 × 512) ───────────────────────────────────────────────────────────────────
//   row 0: windows   0 lit parlour (lace curtains, 2/2)  1 dark 2/2 (frost, sky reflection)  2 dark 2/2, shade drawn  3 lit kitchen (café curtain)
//                    4 dark 1/1 + blind   5 lit 1/1 (curtains)   6 small dark gable window (2 lites)   7 dusty barn window (4 lites)
//   row 1: doors     0 farmhouse 4-panel (dark green, worn)  1 house door with a small lit lite  2 dark storm door  3 plank door
export const BW = { W: 2048, H: 1536, cw: 256, ch: 512 };   // row 2 (E): the same glazing without its painted sash (the 3-D sashes sit in front)
export const bwRect = (col, row, ins = 3) => { const x = col * BW.cw, y = row * BW.ch; return [(x + ins) / BW.W, 1 - (y + BW.ch - ins) / BW.H, (x + BW.cw - ins) / BW.W, 1 - (y + ins) / BW.H]; };
const litRoom = (c, x, y, w, h, s, warm = 1) => {
  const g = c.createRadialGradient(x + w * 0.5, y + h * 0.62, 4, x + w * 0.5, y + h * 0.6, h * 0.8);
  g.addColorStop(0, "#FFE9BE"); g.addColorStop(0.3, "#F2B66A"); g.addColorStop(0.75, "#9A5E2E"); g.addColorStop(1, "#4A2C18");
  c.fillStyle = g; c.fillRect(x, y, w, h);
  // the room: a wallpaper stripe, a picture, a chair back
  for (let k = 0; k < 9; k++) { c.fillStyle = "rgba(120,70,40,0.10)"; c.fillRect(x + k * w / 9, y, 5, h * 0.7); }
  c.fillStyle = "rgba(70,40,22,0.55)"; c.fillRect(x + w * 0.18, y + h * 0.26, w * 0.26, h * 0.13); c.fillStyle = "rgba(240,220,180,0.6)"; c.fillRect(x + w * 0.2, y + h * 0.275, w * 0.22, h * 0.1);
  c.fillStyle = "rgba(60,34,18,0.7)"; c.fillRect(x, y + h * 0.82, w, h * 0.18);
  c.fillStyle = "rgba(70,40,22,0.8)"; c.fillRect(x + w * 0.62, y + h * 0.58, 8, h * 0.3); c.fillRect(x + w * 0.82, y + h * 0.58, 8, h * 0.3); c.fillRect(x + w * 0.6, y + h * 0.58, w * 0.25, 10);
};
const lace = (c, x, y, w, h, open) => {
  for (const side of [0, 1]) {
    const cw = w * open, x0 = side ? x + w - cw : x;
    c.fillStyle = "rgba(255,246,230,0.62)"; c.beginPath();
    if (side) { c.moveTo(x0, y); c.lineTo(x + w, y); c.lineTo(x + w, y + h); c.lineTo(x0 + cw * 0.55, y + h); c.quadraticCurveTo(x0 + cw * 0.7, y + h * 0.6, x0, y); }
    else { c.moveTo(x, y); c.lineTo(x0 + cw, y); c.quadraticCurveTo(x0 + cw * 0.3, y + h * 0.6, x0 + cw * 0.45, y + h); c.lineTo(x, y + h); }
    c.fill();
    for (let k = 0; k < 120; k++) { c.fillStyle = "rgba(255,255,255,0.35)"; c.beginPath(); c.arc(x0 + rnd(k + side * 99) * cw * 0.8, y + rnd(k * 3 + side) * h, 2 + rnd(k) * 3, 0, 7); c.fill(); }
    for (let k = 0; k < 6; k++) { c.fillStyle = "rgba(160,120,80,0.18)"; c.fillRect(x0 + (k + 0.5) * cw / 7, y, 2, h); }
  }
};
const frost = (c, x, y, w, h, amt = 1) => {
  // frost creeping in from the corners and the bottom rail
  for (let i = 0; i < 380 * amt; i++) {
    const corner = i % 4, r = rnd(i * 3 + 1) * 0.35 * Math.min(w, h);
    const cx = corner % 2 ? x + w : x, cy = corner < 2 ? y + h : y + (corner === 2 ? 0 : h);
    const a = rnd(i * 5 + 2) * Math.PI * 2;
    c.fillStyle = `rgba(225,236,250,${0.05 + rnd(i) * 0.12})`;
    c.beginPath(); c.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.7, 1 + rnd(i + 9) * 3, 0, 7); c.fill();
  }
  const g = c.createLinearGradient(0, y + h - h * 0.12, 0, y + h); g.addColorStop(0, "rgba(220,232,248,0)"); g.addColorStop(1, `rgba(220,232,248,${0.35 * amt})`);
  c.fillStyle = g; c.fillRect(x, y + h * 0.88, w, h * 0.12);
};
const darkPane = (c, x, y, w, h, s) => {
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, "#4E6E9C"); g.addColorStop(0.4, "#1E3152"); g.addColorStop(1, "#0B1626");
  c.fillStyle = g; c.fillRect(x, y, w, h);
  c.fillStyle = "rgba(190,214,245,0.12)"; c.beginPath(); c.moveTo(x + w * 0.2, y); c.lineTo(x + w * 0.5, y); c.lineTo(x + w * 0.1, y + h); c.lineTo(x - w * 0.2, y + h); c.fill();
  // a faint interior: a curtain edge, a chair
  c.fillStyle = "rgba(10,16,26,0.5)"; c.fillRect(x, y + h * 0.75, w, h * 0.25);
};
const sashB = (c, x, y, w, h, frameC, lu, ll, e, aged = 1) => {
  // a double-hung window: upper sash (lu lites across) over the lower (ll lites across), meeting rail at the middle
  c.fillStyle = e ? "#000" : frameC;
  const b = 16, rail = 14;
  c.fillRect(x, y, w, b); c.fillRect(x, y + h - b - 4, w, b + 4); c.fillRect(x, y, b, h); c.fillRect(x + w - b, y, b, h);
  c.fillRect(x, y + h / 2 - rail / 2, w, rail);
  for (let k = 1; k < lu; k++) c.fillRect(x + (w * k) / lu - 3, y, 6, h / 2);
  for (let k = 1; k < ll; k++) c.fillRect(x + (w * k) / ll - 3, y + h / 2, 6, h / 2);
  if (!e && aged) { for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(90,84,76,${rnd(i) * 0.35})`; c.fillRect(x + rnd(i + 1) * w, y + (rnd(i + 2) < 0.5 ? rnd(i + 3) * b : h / 2 - rail / 2 + rnd(i + 3) * rail), 3 + rnd(i) * 10, 2); } }
  if (!e) { c.fillStyle = "rgba(0,0,0,0.3)"; c.fillRect(x + b, y + b, w - 2 * b, 4); c.fillRect(x + b, y + h / 2 + rail / 2, w - 2 * b, 4); }
};
const drawBWin = (c, col, e, bare = false) => {
  const x = col * BW.cw, y = bare ? 2 * BW.ch : 0, w = BW.cw, h = BW.ch, gx = x + (bare ? 0 : 12), gy = y + (bare ? 0 : 12), gw = w - (bare ? 0 : 24), gh = h - (bare ? 0 : 24);
  if (e) { c.fillStyle = "#000"; c.fillRect(x, y, w, h); }
  const lit = col === 0 || col === 3 || col === 5;
  if (lit) {
    litRoom(c, gx, gy, gw, gh, col);
    if (col === 0) lace(c, gx, gy, gw, gh, 0.3);
    if (col === 3) { c.fillStyle = "rgba(240,226,200,0.7)"; c.fillRect(gx, gy + gh * 0.55, gw, gh * 0.3); for (let k = 0; k < 12; k++) { c.fillStyle = "rgba(150,90,60,0.25)"; c.fillRect(gx + k * gw / 12, gy + gh * 0.55, 3, gh * 0.3); } c.fillStyle = "rgba(120,80,50,0.9)"; c.fillRect(gx, gy + gh * 0.545, gw, 5); }
    if (col === 5) { lace(c, gx, gy, gw, gh, 0.22); }
    if (!e) frost(c, gx, gy, gw, gh, col === 5 ? 0.4 : 0.8);
    if (e) { c.globalCompositeOperation = "multiply"; c.fillStyle = "rgba(255,255,255,0.0)"; c.globalCompositeOperation = "source-over"; }
  } else if (!e) {
    darkPane(c, gx, gy, gw, gh, col);
    if (col === 2) { c.fillStyle = "#3C4352"; c.fillRect(gx, gy, gw, gh * 0.62); c.fillStyle = "rgba(0,0,0,0.3)"; c.fillRect(gx, gy + gh * 0.62 - 8, gw, 8); }
    if (col === 4) { for (let yy = gy; yy < gy + gh * 0.5; yy += 10) { c.fillStyle = "rgba(170,180,195,0.5)"; c.fillRect(gx, yy, gw, 6); } }
    if (col === 7) { c.fillStyle = "rgba(120,110,95,0.35)"; c.fillRect(gx, gy, gw, gh); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(160,150,130,${rnd(i) * 0.2})`; c.fillRect(gx + rnd(i + 1) * gw, gy + rnd(i + 2) * gh, 4, 4); } }
    frost(c, gx, gy, gw, gh, 1);
  }
  if (bare) return;
  const fc = col === 7 ? "#6E655A" : col >= 4 && col <= 5 ? "#F2F1EC" : "#E6E3DA";
  if (col === 6) sashB(c, x, y + h * 0.25, w, h * 0.5, fc, 2, 2, e);
  else if (col === 7) { sashB(c, x, y, w, h, fc, 2, 2, e, 0); }
  else if (col === 4 || col === 5) sashB(c, x, y, w, h, fc, 1, 1, e, 0);
  else sashB(c, x, y, w, h, fc, 2, 2, e);
  if (col === 6 && !e) { c.fillStyle = "#1A2230"; c.fillRect(x, y, w, h * 0.25); c.fillRect(x, y + h * 0.75, w, h * 0.25); }
};
const drawBDoor = (c, col, e) => {
  const x = col * BW.cw, y = BW.ch, w = BW.cw, h = BW.ch;
  const fc = ["#2E4A3C", "#24364F", "#1E2630", "#5E554A"][col];
  c.fillStyle = e ? "#000" : fc; c.fillRect(x, y, w, h);
  if (e) {
    if (col === 1) { c.fillStyle = "#C88A48"; c.fillRect(x + 60, y + 50, w - 120, 110); }
    return;
  }
  if (col === 3) {   // plank door
    for (let k = 0; k < 5; k++) { c.fillStyle = `hsl(28,${10 + rnd(k) * 6}%,${30 + rnd(k + 3) * 8}%)`; c.fillRect(x + k * w / 5, y, w / 5 - 3, h); }
    c.fillStyle = "rgba(20,16,12,0.7)"; c.fillRect(x, y + h * 0.2, w, 18); c.fillRect(x, y + h * 0.78, w, 18);
    return;
  }
  const panels = col === 1 ? [[40, 200, 76, 120], [w - 116, 200, 76, 120], [40, 340, 76, 130], [w - 116, 340, 76, 130]] : [[38, 40, 78, 190], [w - 116, 40, 78, 190], [38, 270, 78, 200], [w - 116, 270, 78, 200]];
  if (col === 1) { const g = c.createLinearGradient(0, y + 50, 0, y + 160); g.addColorStop(0, "#FFE2AE"); g.addColorStop(1, "#C88A48"); c.fillStyle = g; c.fillRect(x + 60, y + 50, w - 120, 110); c.fillStyle = fc; c.fillRect(x + w / 2 - 3, y + 50, 6, 110); frost(c, x + 60, y + 50, w - 120, 110, 0.6); }
  for (const [px, py, pw, ph] of panels) {
    const pg = c.createLinearGradient(x + px, y + py, x + px + pw, y + py + ph); pg.addColorStop(0, "rgba(255,255,255,0.14)"); pg.addColorStop(1, "rgba(0,0,0,0.32)");
    c.fillStyle = pg; c.fillRect(x + px, y + py, pw, ph); c.fillStyle = fc; c.fillRect(x + px + 8, y + py + 8, pw - 16, ph - 16);
  }
  // wear: paint rubbed off round the knob, scuffs at the bottom
  for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(150,140,120,${rnd(i) * 0.25})`; c.fillRect(x + rnd(i + 1) * w, y + (rnd(i + 2) < 0.5 ? h * 0.82 + rnd(i + 3) * h * 0.18 : h * 0.5 + rnd(i + 3) * h * 0.1), 3 + rnd(i) * 9, 2); }
  c.fillStyle = "#B89A58"; c.beginPath(); c.arc(x + w - 34, y + h * 0.53, 10, 0, 7); c.fill();
  c.fillStyle = "#8E7440"; c.fillRect(x + w - 40, y + h * 0.53 + 16, 12, 26);
};

// ── (E) THE ROOMS behind the lit windows (2048 × 1024: 4 × 2 cells of 512): 0 parlour wall · 1 kitchen wall · 2 sitting-room wall ·
//   3 a side wall (wallpaper, a door casing) · 4 floor boards with a braided rug · 5 the ceiling with the lamp's pool · 6 kitchen side wall ·
//   7 bedroom wall. A lived-in 1930s–50s New England farmhouse interior, lamplit (warm practical light only).
export const roomRect = (k) => { const x = (k % 4) * 512, y = Math.floor(k / 4) * 512; return [(x + 2) / 2048, 1 - (y + 510) / 1024, (x + 510) / 2048, 1 - (y + 2) / 1024]; };
const paper = (c, x, y, w, h, base, motif, seed) => {
  c.fillStyle = base; c.fillRect(x, y, w, h);
  for (let k = 0; k < w; k += 48) { c.fillStyle = "rgba(255,240,215,0.10)"; c.fillRect(x + k, y, 6, h); c.fillStyle = "rgba(90,60,40,0.08)"; c.fillRect(x + k + 24, y, 3, h); }
  for (let j = 0; j < h / 48; j++) for (let i = 0; i < w / 48; i++) {
    const cx = x + i * 48 + 24 + (j % 2) * 24, cy = y + j * 48 + 24;
    if (cx > x + w - 6) continue;
    c.fillStyle = motif; for (let q = 0; q < 5; q++) { const a = (q / 5) * Math.PI * 2; c.beginPath(); c.arc(cx + Math.cos(a) * 4, cy + Math.sin(a) * 4, 3.2, 0, 7); c.fill(); }
    c.fillStyle = "rgba(80,100,64,0.4)"; c.beginPath(); c.ellipse(cx - 7, cy + 8, 6, 2.4, -0.7, 0, 7); c.fill(); c.beginPath(); c.ellipse(cx + 7, cy + 9, 6, 2.4, 0.7, 0, 7); c.fill();
  }
  for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(70,50,30,${rnd(seed + i) * 0.05})`; c.fillRect(x + rnd(seed + i * 3) * w, y + rnd(seed + i * 5) * h, 2, 2); }
};
const lampLight = (c, x, y, w, h, lx, ly, r = 260) => {
  const g = c.createRadialGradient(lx, ly, 8, lx, ly, r); g.addColorStop(0, "rgba(255,226,170,0.55)"); g.addColorStop(0.5, "rgba(255,190,120,0.18)"); g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(x, y, w, h);
  const v = c.createLinearGradient(0, y, 0, y + h); v.addColorStop(0, "rgba(30,18,10,0.35)"); v.addColorStop(0.4, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(30,18,10,0.3)"); c.fillStyle = v; c.fillRect(x, y, w, h);
};
const frame = (c, x, y, w, h, inner) => { c.fillStyle = "#3A2416"; c.fillRect(x, y, w, h); c.fillStyle = "#B08D4A"; c.fillRect(x + 4, y + 4, w - 8, h - 8); c.fillStyle = "#2E2014"; c.fillRect(x + 7, y + 7, w - 14, h - 14); inner(x + 9, y + 9, w - 18, h - 18); };
const scene = (c, x, y, w, h, kind) => {   // little period pictures: a mountain farm, a ship, a portrait-less still life
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, kind ? "#8FA6B8" : "#C8B48A"); g.addColorStop(1, kind ? "#4E5E52" : "#7A6A48"); c.fillStyle = g; c.fillRect(x, y, w, h);
  c.fillStyle = kind ? "#3E4E3A" : "#5A4A30"; c.beginPath(); c.moveTo(x, y + h * 0.7); c.lineTo(x + w * 0.35, y + h * 0.35); c.lineTo(x + w * 0.6, y + h * 0.6); c.lineTo(x + w, y + h * 0.4); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.fill();
  if (kind) { c.fillStyle = "#E8E2D2"; c.fillRect(x + w * 0.55, y + h * 0.62, w * 0.18, h * 0.14); c.fillStyle = "#7A2A22"; c.beginPath(); c.moveTo(x + w * 0.53, y + h * 0.63); c.lineTo(x + w * 0.64, y + h * 0.52); c.lineTo(x + w * 0.75, y + h * 0.63); c.fill(); }
};
const drawRooms = (c, W, H) => {
  const cell = (k) => [(k % 4) * 512, Math.floor(k / 4) * 512, 512, 512];
  // 0 the parlour: rose sprig paper, a chair rail, a framed picture, a dresser with a kerosene lamp and a doily, a mantel clock
  { const [x, y, w, h] = cell(0); paper(c, x, y, w, h, "#C7AE8E", "rgba(150,80,70,0.5)", 1);
    c.fillStyle = "#4A2E1C"; c.fillRect(x, y + h * 0.62, w, 10); c.fillStyle = "#5A3A26"; c.fillRect(x, y + h * 0.93, w, h * 0.07);
    frame(c, x + 60, y + 110, 150, 110, (a, b, ww, hh) => scene(c, a, b, ww, hh, 1));
    frame(c, x + 300, y + 90, 90, 120, (a, b, ww, hh) => scene(c, a, b, ww, hh, 0));
    c.fillStyle = "#4A2C1A"; c.fillRect(x + 230, y + 300, 230, 170); c.fillStyle = "#5E3A22"; c.fillRect(x + 222, y + 292, 246, 14);
    for (let k = 0; k < 3; k++) { c.fillStyle = "#3A2214"; c.fillRect(x + 240, y + 320 + k * 50, 210, 3); c.fillStyle = "#C9A060"; c.beginPath(); c.arc(x + 300, y + 345 + k * 50, 4, 0, 7); c.arc(x + 390, y + 345 + k * 50, 4, 0, 7); c.fill(); }
    c.fillStyle = "#EFE6D2"; c.beginPath(); c.ellipse(x + 345, y + 292, 70, 8, 0, 0, 7); c.fill();
    c.fillStyle = "#B9D0B4"; c.beginPath(); c.ellipse(x + 330, y + 270, 18, 22, 0, 0, 7); c.fill(); c.fillStyle = "#FFF1D0"; c.fillRect(x + 324, y + 210, 12, 44);
    c.fillStyle = "#5A3A22"; c.beginPath(); c.roundRect(x + 395, y + 250, 50, 42, 10); c.fill(); c.fillStyle = "#F4EEDC"; c.beginPath(); c.arc(x + 420, y + 268, 13, 0, 7); c.fill();
    lampLight(c, x, y, w, h, x + 330, y + 230); }
  // 1 the kitchen: painted beadboard, an open shelf of crockery, a wall cupboard, the stovepipe, a calendar (no year), a towel
  { const [x, y, w, h] = cell(1); c.fillStyle = "#D9D2B4"; c.fillRect(x, y, w, h);
    c.fillStyle = "#A8B898"; c.fillRect(x, y + h * 0.55, w, h * 0.45); for (let k = 0; k < w; k += 16) { c.fillStyle = "rgba(60,70,50,0.25)"; c.fillRect(x + k, y + h * 0.55, 2, h * 0.45); }
    c.fillStyle = "#6E4E30"; c.fillRect(x + 30, y + 150, 220, 10); c.fillRect(x + 30, y + 230, 220, 10);
    for (let k = 0; k < 7; k++) { c.fillStyle = ["#F4F0E4", "#5E7EA8", "#F4F0E4", "#C9B070"][k % 4]; c.beginPath(); c.ellipse(x + 50 + k * 30, y + 135, 12, 15, 0, 0, 7); c.fill(); }
    for (let k = 0; k < 5; k++) { c.fillStyle = "#EEE8D8"; c.fillRect(x + 45 + k * 40, y + 196, 24, 34); c.fillStyle = "#7A9AC0"; c.fillRect(x + 45 + k * 40, y + 206, 24, 4); }
    c.fillStyle = "#9EAE8A"; c.fillRect(x + 300, y + 60, 170, 190); c.strokeStyle = "#6E7E5A"; c.lineWidth = 4; c.strokeRect(x + 310, y + 70, 70, 170); c.strokeRect(x + 390, y + 70, 70, 170);
    c.fillStyle = "#1A1612"; c.fillRect(x + 200, y, 30, 120); c.beginPath(); c.arc(x + 215, y + 120, 18, 0, 7); c.fill();
    c.fillStyle = "#F4F0E4"; c.fillRect(x + 40, y + 280, 90, 120); c.fillStyle = "#7A9AC0"; c.fillRect(x + 46, y + 286, 78, 48); c.fillStyle = "#3A3A3A"; for (let r = 0; r < 4; r++) for (let q = 0; q < 6; q++) c.fillRect(x + 48 + q * 13, y + 344 + r * 13, 8, 6);
    c.fillStyle = "#E8DCC0"; c.fillRect(x + 380, y + 300, 40, 90); for (let k = 0; k < 4; k++) { c.fillStyle = "#A83A30"; c.fillRect(x + 380, y + 310 + k * 20, 40, 5); }
    lampLight(c, x, y, w, h, x + 256, y + 40, 330); }
  // 2 the sitting room: striped paper, a sofa back, a floor lamp with its shade lit, a cathedral radio on a table, pictures
  { const [x, y, w, h] = cell(2); c.fillStyle = "#B9A486"; c.fillRect(x, y, w, h);
    for (let k = 0; k < w; k += 32) { c.fillStyle = "rgba(120,70,50,0.22)"; c.fillRect(x + k, y, 10, h); c.fillStyle = "rgba(255,240,210,0.1)"; c.fillRect(x + k + 14, y, 3, h); }
    frame(c, x + 150, y + 80, 200, 130, (a, b, ww, hh) => scene(c, a, b, ww, hh, 1));
    c.fillStyle = "#5A2E2A"; c.beginPath(); c.roundRect(x + 60, y + 300, 330, 150, 30); c.fill(); c.fillStyle = "#6E3A34"; c.beginPath(); c.roundRect(x + 70, y + 330, 310, 90, 18); c.fill();
    for (let k = 0; k < 3; k++) { c.fillStyle = "rgba(40,20,16,0.4)"; c.fillRect(x + 160 + k * 100, y + 330, 3, 90); }
    c.fillStyle = "#2A1A10"; c.fillRect(x + 440, y + 170, 6, 300); c.fillStyle = "#F0D8A8"; c.beginPath(); c.moveTo(x + 410, y + 170); c.lineTo(x + 476, y + 170); c.lineTo(x + 462, y + 120); c.lineTo(x + 424, y + 120); c.fill();
    c.fillStyle = "#4A2C1A"; c.fillRect(x + 410, y + 330, 80, 140); c.fillStyle = "#6A4024"; c.beginPath(); c.moveTo(x + 420, y + 330); c.quadraticCurveTo(x + 450, y + 250, x + 480, y + 330); c.fill(); c.fillStyle = "#C9A878"; c.beginPath(); c.arc(x + 450, y + 300, 12, 0, 7); c.fill();
    lampLight(c, x, y, w, h, x + 443, y + 150, 300); }
  // 3 a side wall: rose paper, a door casing to the next room (dark), a hook with a coat
  { const [x, y, w, h] = cell(3); paper(c, x, y, w, h, "#C2A889", "rgba(150,80,70,0.45)", 7);
    c.fillStyle = "#E4DCC6"; c.fillRect(x + 260, y + 120, 180, 392); c.fillStyle = "#2A1C12"; c.fillRect(x + 278, y + 140, 144, 372);
    c.fillStyle = "#5A3A26"; c.fillRect(x, y + h * 0.93, w, h * 0.07);
    lampLight(c, x, y, w, h, x, y + 200, 420); }
  // 4 the floor: worn pine boards and a braided oval rug
  { const [x, y, w, h] = cell(4);
    for (let k = 0; k < 8; k++) { c.fillStyle = `hsl(30,${34 + rnd(k) * 10}%,${30 + rnd(k + 3) * 8}%)`; c.fillRect(x, y + k * 64, w, 62); c.fillStyle = "#1E140C"; c.fillRect(x, y + k * 64 + 62, w, 2); for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(0,0,0,${rnd(k * 40 + i) * 0.12})`; c.fillRect(x + rnd(k * 40 + i + 1) * w, y + k * 64 + rnd(i) * 60, 40 + rnd(i + 3) * 120, 1.5); } }
    for (let r = 0; r < 10; r++) { c.strokeStyle = ["#7A3A30", "#3A4A6A", "#8A7A50", "#4E6040"][r % 4]; c.lineWidth = 12; c.beginPath(); c.ellipse(x + 256, y + 300, 200 - r * 18, 120 - r * 11, 0, 0, 7); c.stroke(); }
    lampLight(c, x, y, w, h, x + 256, y + 256, 360); }
  // 5 the ceiling: cracked plaster with the lamp's warm pool
  { const [x, y, w, h] = cell(5); c.fillStyle = "#C9BDA6"; c.fillRect(x, y, w, h);
    for (let i = 0; i < 20; i++) { c.strokeStyle = "rgba(90,70,50,0.25)"; c.lineWidth = 1.5; c.beginPath(); let px = x + rnd(i) * w, py = y + rnd(i + 1) * h; c.moveTo(px, py); for (let q = 0; q < 6; q++) { px += (rnd(i * 9 + q) - 0.5) * 60; py += (rnd(i * 7 + q) - 0.5) * 60; c.lineTo(px, py); } c.stroke(); }
    lampLight(c, x, y, w, h, x + 256, y + 300, 300); }
  // 6 the kitchen side wall: beadboard, a wood cookstove's side and its warming shelf, a hanging dipper
  { const [x, y, w, h] = cell(6); c.fillStyle = "#D9D2B4"; c.fillRect(x, y, w, h); c.fillStyle = "#A8B898"; c.fillRect(x, y + h * 0.55, w, h * 0.45);
    c.fillStyle = "#1E1E22"; c.fillRect(x + 120, y + 300, 280, 212); c.fillStyle = "#3A3A40"; c.fillRect(x + 110, y + 290, 300, 16); c.fillStyle = "#B9C0C8"; c.fillRect(x + 140, y + 330, 240, 6); c.fillRect(x + 140, y + 420, 240, 6);
    c.fillStyle = "#1E1E22"; c.fillRect(x + 240, y, 26, 290);
    lampLight(c, x, y, w, h, x + 260, y + 360, 300); }
  // 7 the bedroom: small blue sprig paper, an iron bedstead's foot, a quilt, a framed sampler (no names)
  { const [x, y, w, h] = cell(7); paper(c, x, y, w, h, "#B8BCC0", "rgba(70,90,130,0.45)", 13);
    c.strokeStyle = "#2A2A2E"; c.lineWidth = 8; c.strokeRect(x + 80, y + 300, 340, 180); for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(x + 100 + k * 38, y + 300); c.lineTo(x + 100 + k * 38, y + 480); c.stroke(); }
    for (let k = 0; k < 6; k++) { c.fillStyle = ["#8A3A30", "#E8DCC0", "#3A5A7A", "#C9A050", "#E8DCC0", "#5A7A4A"][k]; c.fillRect(x + 90 + k * 55, y + 400, 55, 80); }
    frame(c, x + 190, y + 100, 130, 110, (a, b, ww, hh) => { c.fillStyle = "#EFE6D0"; c.fillRect(a, b, ww, hh); for (let r = 0; r < 5; r++) for (let q = 0; q < 8; q++) { c.fillStyle = ["#8A3A30", "#3A5A7A", "#4E6E40"][(r + q) % 3]; c.fillRect(a + 8 + q * 13, b + 10 + r * 17, 7, 7); } });
    lampLight(c, x, y, w, h, x + 100, y + 200, 360); }
};
/** (E) a plowed farm lane / driveway seen from above (u across 0–1, v along): packed snow, two wheel ruts worn to frozen gravel with
 *  tread prints, a crowned middle, soft feathered edges into the field's snow (alpha) */
const drawLane = (c, w, h) => {
  c.clearRect(0, 0, w, h);
  for (let y = 0; y < h; y++) {
    for (const [u0, u1, a] of [[0, 0.12, 0], [0.12, 0.88, 1], [0.88, 1, 0]]) {
      const g = c.createLinearGradient(u0 * w, 0, u1 * w, 0);
      if (a) { g.addColorStop(0, "rgba(206,216,230,1)"); g.addColorStop(1, "rgba(206,216,230,1)"); }
      else if (u0 === 0) { g.addColorStop(0, "rgba(206,216,230,0)"); g.addColorStop(1, "rgba(206,216,230,1)"); }
      else { g.addColorStop(0, "rgba(206,216,230,1)"); g.addColorStop(1, "rgba(206,216,230,0)"); }
      c.fillStyle = g; c.fillRect(u0 * w, y, (u1 - u0) * w + 1, 1);
    }
  }
  for (let i = 0; i < 20000; i++) { const x = (0.12 + rnd(i) * 0.76) * w; c.fillStyle = `rgba(${rnd(i + 1) < 0.5 ? "110,120,140" : "250,252,255"},${0.06 + rnd(i + 2) * 0.1})`; c.fillRect(x, rnd(i + 3) * h, 2 + rnd(i) * 3, 2); }
  for (const u of [0.3, 0.7]) {
    const g = c.createLinearGradient((u - 0.09) * w, 0, (u + 0.09) * w, 0); g.addColorStop(0, "rgba(120,128,142,0)"); g.addColorStop(0.3, "rgba(104,108,116,0.75)"); g.addColorStop(0.7, "rgba(104,108,116,0.75)"); g.addColorStop(1, "rgba(120,128,142,0)");
    c.fillStyle = g; c.fillRect((u - 0.09) * w, 0, 0.18 * w, h);
    for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(${rnd(i * 3) < 0.5 ? "70,62,54" : "160,150,138"},${0.3 + rnd(i * 5) * 0.4})`; c.fillRect((u - 0.05 + rnd(i * 7 + u * 100) * 0.1) * w, rnd(i * 11 + u * 50) * h, 2, 2); }   // gravel
    c.strokeStyle = "rgba(60,64,72,0.25)"; c.lineWidth = 4; for (let y = 0; y < h; y += 18) { c.beginPath(); c.moveTo((u - 0.06) * w, y); c.lineTo((u + 0.06) * w, y + 8); c.stroke(); }   // tread
  }
};
const drawLace = (c, w, h) => {
  c.clearRect(0, 0, w, h);
  for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) { c.fillStyle = "rgba(255,248,236,0.22)"; c.fillRect(x, y, 1, 1); }
  for (let j = 0; j < 12; j++) for (let i = 0; i < 4; i++) {
    const cx = (i + 0.5 + (j % 2) * 0.5) * w / 4, cy = (j + 0.5) * h / 12;
    c.strokeStyle = "rgba(255,248,236,0.7)"; c.lineWidth = 1.4;
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; c.beginPath(); c.ellipse(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8, 7, 3, a, 0, 7); c.stroke(); }
  }
  for (let x = 0; x < w; x += 16) { c.fillStyle = "rgba(255,248,236,0.85)"; c.beginPath(); c.arc(x + 8, h - 10, 8, 0, Math.PI); c.fill(); }
  for (let k = 0; k < 6; k++) { const g = c.createLinearGradient(k * w / 6, 0, (k + 1) * w / 6, 0); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.5, "rgba(255,250,240,0.2)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(k * w / 6, 0, w / 6, h); }
};

let BM = null;
export const bMats = () => {
  if (BM) return BM;
  const T = townMats();
  const std = (o) => new THREE.MeshStandardMaterial({ vertexColors: true, ...o });
  const winMap = canvasTex("bw_win_e2", BW.W, BW.H, (c) => { for (let k = 0; k < 8; k++) { drawBWin(c, k, false); drawBWin(c, k, false, true); } for (let k = 0; k < 4; k++) drawBDoor(c, k, false); });
  const winE = canvasTex("bw_winE_e2", BW.W, BW.H, (c) => { c.fillStyle = "#000"; c.fillRect(0, 0, BW.W, BW.H); for (let k = 0; k < 8; k++) { drawBWin(c, k, true); drawBWin(c, k, true, true); } for (let k = 0; k < 4; k++) drawBDoor(c, k, true); });
  const room = canvasTex("bw_room_e1", 2048, 1024, drawRooms);
  const laneT = canvasTex("bw_lane_e1", 512, 1024, drawLane); laneT.wrapT = THREE.RepeatWrapping;
  const laceT = canvasTex("bw_lace_e1", 256, 512, drawLace);
  BM = {
    ...T,
    clap: std({ map: rep(canvasTex("bw_clap_e2", 1024, 2048, clapDraw(false)), 1, 1.6), bumpMap: lin(rep(canvasTex("bw_clapB_e2", 1024, 2048, clapDraw(true)), 1, 1.6)), bumpScale: 3.2, roughness: 0.82 }),
    board: std({ map: rep(canvasTex("bw_board", 1024, 1024, boardDraw(false)), 2), bumpMap: lin(rep(canvasTex("bw_boardB", 1024, 1024, boardDraw(true)), 2)), bumpScale: 3, roughness: 0.92 }),
    tin: std({ map: rep(canvasTex("bw_tin", 512, 1024, tinDraw(false)), 1.8, 3.6), bumpMap: lin(rep(canvasTex("bw_tinB", 512, 1024, tinDraw(true)), 1.8, 3.6)), bumpScale: 2, roughness: 0.48, metalness: 0.55 }),
    snow: std({ map: rep(canvasTex("bw_snowS", 512, 512, snowDraw(false)), 2.5), color: new THREE.Color("#D3E0F4"), roughness: 0.78, metalness: 0, envMapIntensity: 0.6 }),
    stone: std({ map: rep(canvasTex("bw_stone", 512, 512, stoneDraw), 0.8), roughness: 0.92, flatShading: true }),
    split: std({ map: rep(canvasTex("bw_split", 256, 256, splitDraw), 1.2, 0.6), roughness: 0.9 }),
    trimb: std({ map: rep(canvasTex("bw_trim", 256, 256, trimDrawB), 1), roughness: 0.7 }),
    dark: std({ roughness: 0.9, metalness: 0 }),
    wood: std({ roughness: 0.85 }),
    ice: std({ roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.75, envMapIntensity: 1.4 }),
    bwin: std({ map: winMap, emissiveMap: winE, emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 0.9, roughness: 0.14, metalness: 0.2, envMapIntensity: 0.9 }),
    // (E) the lit rooms behind real window openings, their lace, the glass in the 3-D sashes, painted sash wood, galvanised gutters
    broom: std({ map: room, emissiveMap: room, emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 0.62, roughness: 0.85 }),
    blace: new THREE.MeshStandardMaterial({ map: laceT, vertexColors: true, transparent: true, depthWrite: false, roughness: 0.9, side: THREE.DoubleSide, emissive: new THREE.Color("#FFC58A"), emissiveMap: laceT, emissiveIntensity: 0.35 }),
    bglass: new THREE.MeshStandardMaterial({ color: "#C8D8EE", transparent: true, opacity: 0.14, roughness: 0.04, metalness: 0.1, envMapIntensity: 1.6, depthWrite: false }),
    sash: std({ roughness: 0.6 }),
    galv: std({ roughness: 0.4, metalness: 0.6 }),
    lane: std({ map: laneT, transparent: true, depthWrite: false, roughness: 0.7, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 })
  };
  BM.lane.userData = { cast: false, order: 1 };
  BM.bwin.userData.cast = false; BM.ice.userData.cast = false;
  BM.broom.userData = { cast: false };
  BM.blace.userData = { cast: false, recv: false, order: 3 };
  BM.bglass.userData = { cast: false, recv: false, order: 4 };
  return BM;
};
/** <Built build={(m) => …} /> : builds once with the winter materials */
export const Built = ({ build, deps = [] }) => {
  const grp = useMemo(() => { const m = new Mesher(); build(m); return m.build(bMats()); }, deps);
  return <primitive object={grp} />;
};

// ── geometry helpers ──────────────────────────────────────────────────────────────────────────────────────────────────────
const _q = new THREE.Quaternion(), _Y = new THREE.Vector3(0, 1, 0);
const CYL = {};
const cylG = (seg = 6, rt = 1, rb = 1) => CYL[seg + "_" + rt + "_" + rb] ??= new THREE.CylinderGeometry(rt, rb, 1, seg, 1, true);
/** a cylinder from a to b (radius ra at a, rb at b) */
export const seg3 = (m, mat, a, b, ra, rb, color, seg = 6) => {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length();
  if (L < 1e-5) return;
  _q.setFromUnitVectors(_Y, d.clone().normalize());
  const M = new THREE.Matrix4().compose(new THREE.Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), _q, new THREE.Vector3(1, L, 1));
  // a tapered cylinder: build a unit one with the right radius ratio
  const g = cylG(seg, rb / Math.max(ra, 1e-4), 1);
  const S = new THREE.Matrix4().makeScale(ra, 1, ra);
  m.add(mat, g, M.multiply(S), color);
};
/** a gable wall shape (pentagon) of width w, eave height h, ridge height hr, centred on x 0, optional rectangular holes */
const wallShape = (w, h, hr, holes = []) => {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h);
  if (hr > h) s.lineTo(0, hr);
  s.lineTo(-w / 2, h); s.closePath();
  for (const o of holes) { const p = new THREE.Path(); p.moveTo(o.x - o.w / 2, o.y); p.lineTo(o.x - o.w / 2, o.y + o.h); p.lineTo(o.x + o.w / 2, o.y + o.h); p.lineTo(o.x + o.w / 2, o.y); p.closePath(); s.holes.push(p); }
  return new THREE.ShapeGeometry(s);
};

// (E) lites across the upper / lower sash for each atlas window kind
const LITES = { 0: [2, 2], 1: [2, 2], 2: [2, 2], 3: [2, 2], 4: [1, 1], 5: [1, 1], 6: [2, 0], 7: [2, 2] };
const LIT = { 0: 0, 3: 1, 5: 2 };   // lit window kinds → their room's back wall (roomRect)
/** (E) one sash in 3-D: stiles, rails and muntins (lx lites across, ly down) around an opening w × h centred at (x, cy), at depth z */
const sash3 = (m, x, cy, w, h, z, lx, ly, color, bottom = 0.06, top = 0.045, d = 0.035) => {
  const st = 0.045;
  m.box("sash", [x - w / 2 + st / 2, cy, z], [st, h, d], color);
  m.box("sash", [x + w / 2 - st / 2, cy, z], [st, h, d], color);
  m.box("sash", [x, cy + h / 2 - top / 2, z], [w, top, d], color);
  m.box("sash", [x, cy - h / 2 + bottom / 2, z], [w, bottom, d], color);
  for (let k = 1; k < lx; k++) m.box("sash", [x - w / 2 + (w * k) / lx, cy, z - 0.004], [0.02, h, d * 0.7], color);
  for (let k = 1; k < ly; k++) m.box("sash", [x, cy - h / 2 + (h * k) / ly, z - 0.004], [w, 0.02, d * 0.7], color);
};
/** (E) a lamplit room behind a window opening (wall-local frame: wall face z 0, inside z < −T): wallpapered walls, floor, ceiling,
 *  a table with a lamp (a glow), a chair, lace curtains just inside the glass */
const litRoom3 = (m, o, cy, T, kind, seed) => {
  const rw = o.ww + 1.8, rd = 1.9, yf = cy - o.wh / 2 - 0.78, yc = yf + 2.45, zb = -T - rd, zc = -T - rd / 2, R = (k) => rnd(seed * 31 + k);
  m.quad("broom", [o.x, (yf + yc) / 2, zb], rw, yc - yf, "#FFFFFF", roomRect(kind === 1 ? 1 : kind === 2 ? 2 : R(1) < 0.5 ? 0 : 7));
  m.quad("broom", [o.x - rw / 2, (yf + yc) / 2, zc], rd, yc - yf, "#D8D0C8", roomRect(kind === 1 ? 6 : 3), { r: [0, Math.PI / 2, 0] });
  m.quad("broom", [o.x + rw / 2, (yf + yc) / 2, zc], rd, yc - yf, "#D8D0C8", roomRect(kind === 1 ? 6 : 3), { r: [0, -Math.PI / 2, 0] });
  m.quad("broom", [o.x, yf, zc], rw, rd, "#E8E0D8", roomRect(4), { r: [-Math.PI / 2, 0, 0] });
  m.quad("broom", [o.x, yc, zc], rw, rd, "#C8C0B8", roomRect(5), { r: [Math.PI / 2, 0, 0] });
  // a table under the window's view with a lamp on it, a chair beside it (real depth for the parallax)
  const tx = o.x + (R(2) - 0.5) * 0.5, tz = -T - 0.75;
  m.box("wood", [tx, yf + 0.74, tz], [0.7, 0.035, 0.5], "#4A2E1C");
  for (const [dx, dz] of [[-0.31, -0.21], [0.31, -0.21], [-0.31, 0.21], [0.31, 0.21]]) m.box("wood", [tx + dx, yf + 0.37, tz + dz], [0.035, 0.74, 0.035], "#3E2616");
  m.box("trimb", [tx, yf + 0.762, tz], [0.5, 0.006, 0.32], "#EFE8DA");
  m.cyl("trimb", [tx + 0.12, yf + 0.86, tz - 0.05], 0.06, 0.18, "#C9D8C4", { seg: 10 });
  m.cyl("bulb", [tx + 0.12, yf + 1.0, tz - 0.05], 0.03, 0.1, "#FFE6BE", { seg: 8 });
  m.cyl("trimb", [tx + 0.12, yf + 1.12, tz - 0.05], 0.13, 0.12, "#F0D8A8", { rt: 0.55, rb: 1, seg: 12, open: true });
  m.glow([tx + 0.12, yf + 1.02, tz - 0.05], "#FFC98A", 0.9);
  const chx = tx - 0.55;
  m.box("wood", [chx, yf + 0.45, tz + 0.1], [0.4, 0.035, 0.4], "#4A2E1C");
  m.box("wood", [chx, yf + 0.75, tz - 0.08], [0.4, 0.6, 0.03], "#3E2616");
  for (const [dx, dz] of [[-0.17, -0.07], [0.17, -0.07], [-0.17, 0.27], [0.17, 0.27]]) m.box("wood", [chx + dx, yf + 0.22, tz + dz], [0.03, 0.45, 0.03], "#3E2616");
  // lace curtains gathered at both sides, a rod (a café curtain across the lower half in the kitchen)
  if (kind === 1) m.quad("blace", [o.x, cy - o.wh / 4, -T - 0.05], o.ww * 0.96, o.wh / 2, "#FFFFFF", [0, 0, 1, 0.5]);
  else for (const sd of [-1, 1]) m.quad("blace", [o.x + sd * (o.ww / 2 - 0.1), cy + 0.03, -T - 0.05], 0.3, o.wh + 0.12, "#FFFFFF", [0, 0, 0.6, 1]);
  m.cyl("galv", [o.x, cy + o.wh / 2 + 0.04, -T - 0.05], 0.007, o.ww + 0.2, "#B89A50", { r: [0, 0, Math.PI / 2], seg: 6 });
};
/** (E) a panelled door in 3-D (wall-local frame), recessed in its opening: leaf, raised panels with mouldings, a lit lite (kind 1),
 *  a plank door with its Z-brace and strap hinges (kind 3), brass knob and escutcheon, butt hinges, a mail slot */
const DOORC = ["#2E4A3C", "#24364F", "#1E2630", "#5E554A"];
const door3 = (m, o) => {
  const x = o.x, w = o.w, h = o.h, z = -0.05, col = o.color ?? DOORC[o.cell ?? 0], cy = h / 2 + 0.02;
  if ((o.cell ?? 0) === 3) {
    for (let k = 0; k < 5; k++) m.box("split", [x - w / 2 + (k + 0.5) * w / 5, cy, z], [w / 5 - 0.012, h, 0.045], bpick(["#6E6458", "#625A4E", "#776C5E"], rnd(k + 3)), { metric: true });
    for (const y of [0.3, h - 0.3]) m.box("split", [x, y, z + 0.035], [w - 0.06, 0.14, 0.03], "#5E554A", { metric: true });
    m.box("split", [x, h / 2, z + 0.035], [Math.hypot(w - 0.2, h - 0.75), 0.12, 0.028], "#5A5044", { r: [0, 0, Math.atan2(h - 0.75, w - 0.2)], metric: true });
    for (const y of [0.3, h - 0.3]) { m.box("metal", [x - w / 2 + 0.25, y, z + 0.055], [0.5, 0.04, 0.01], "#1E2024"); m.cyl("metal", [x - w / 2 + 0.03, y, z + 0.05], 0.015, 0.12, "#1E2024", { seg: 6 }); }
    m.box("metal", [x + w / 2 - 0.12, 1.05, z + 0.05], [0.03, 0.18, 0.02], "#1E2024");
    return;
  }
  // (E, Timur 2026-11-27: "make the door more realistic and more detailed") a real exterior door: the slab behind, stiles and rails
  // standing proud so the panels are recessed, a quarter-round moulding round every panel opening, a raised bevelled field in each,
  // a six-lite glazed top (the hall's lamp and its lace curtain behind frosted glass) on a lock rail, a brass kick plate on the
  // bottom rail, knob and rose with a deadbolt above, three butt hinges with their knuckles, the weatherstrip shadow round the leaf
  const T2 = 0.045, fz = z + T2 / 2;                                    // the leaf's front face
  const lighten = (hex, k) => { const c2 = new THREE.Color(hex); c2.lerp(new THREE.Color("#FFFFFF"), k); return "#" + c2.getHexString(); };
  const colM = lighten(col, 0.07), colF = lighten(col, 0.03);
  m.box("dark", [x, cy, z - 0.012], [w + 0.02, h + 0.01, 0.02], "#0C0E10");       // the weatherstrip / jamb gap round the leaf
  m.box("sash", [x, cy, z - 0.004], [w, h, T2 - 0.008], col);                       // the slab (the panels' ground)
  const st = 0.13, topR = 0.12, lockY = h * 0.5, botR = 0.24;
  const frameBox = (bx, by, bw, bh) => m.box("sash", [bx, by, fz], [bw, bh, 0.014], col);
  frameBox(x - w / 2 + st / 2, h / 2 + 0.02, st, h); frameBox(x + w / 2 - st / 2, h / 2 + 0.02, st, h);                  // stiles
  frameBox(x, h + 0.02 - topR / 2, w - 2 * st, topR); frameBox(x, 0.02 + botR / 2, w - 2 * st, botR);                   // top and bottom rails
  const lit = (o.cell ?? 0) === 1 || o.lite;
  const panel = (px, py, pw, ph) => {
    // the panel opening: quarter-round moulding (proud, lighter), the recessed ground, the raised field with its bevel
    for (const [dx, dy, sw, sh2] of [[0, ph / 2 - 0.008, pw, 0.016], [0, -ph / 2 + 0.008, pw, 0.016], [-pw / 2 + 0.008, 0, 0.016, ph], [pw / 2 - 0.008, 0, 0.016, ph]]) m.box("sash", [px + dx, py + dy, fz - 0.002], [sw, sh2, 0.012], colM);
    m.box("sash", [px, py, fz - 0.003], [pw - 0.09, ph - 0.09, 0.01], colF);
    m.box("sash", [px, py, fz + 0.001], [pw - 0.16, ph - 0.16, 0.008], col);
    for (const [dx, dy, sw, sh2, rx, ry] of [[0, (ph - 0.125) / 2, pw - 0.125, 0.04, -0.5, 0], [0, -(ph - 0.125) / 2, pw - 0.125, 0.04, 0.5, 0], [-(pw - 0.125) / 2, 0, 0.04, ph - 0.125, 0, 0.5], [(pw - 0.125) / 2, 0, 0.04, ph - 0.125, 0, -0.5]]) m.box("sash", [px + dx, py + dy, fz - 0.001], [sw, sh2, 0.004], col, { r: [rx * 0.6, ry * 0.6, 0] });
  };
  const iw = w - 2 * st, mid = 0.1;
  if (lit) {
    const gy0 = lockY + mid / 2, gy1 = h + 0.02 - topR, gh = gy1 - gy0, gcy = (gy0 + gy1) / 2;
    frameBox(x, lockY, iw, mid);                                                                                  // the lock rail
    m.quad("bwin", [x, gcy, fz - 0.007], iw, gh, "#FFFFFF", bwRect(5, 2));                                         // lit hall, lace, frost (in front of the slab)
    m.quad("bglass", [x, gcy, fz - 0.004], iw, gh, "#FFFFFF");
    for (const dx of [-1, 1]) m.box("sash", [x + dx * iw / 6, gcy, fz - 0.002], [0.022, gh, 0.014], colM);       // muntins (2 × 3 lites)
    m.box("sash", [x, gcy, fz - 0.002], [iw, 0.022, 0.014], colM);
    for (const [dy, s2] of [[gy1 - 0.008, 1], [gy0 + 0.008, -1]]) m.box("sash", [x, dy, fz], [iw, 0.016, 0.016], colM);   // glazing beads
    for (const sd of [-1, 1]) m.box("sash", [x + sd * (iw / 2 - 0.008), gcy, fz], [0.016, gh, 0.016], colM);
    const pw2 = (iw - 0.1) / 2, py0 = 0.02 + botR, py1 = lockY - mid / 2, ph2 = py1 - py0;
    frameBox(x, (py0 + py1) / 2, 0.1, ph2);                                                                       // the centre muntin of the lower panels
    for (const sd of [-1, 1]) panel(x + sd * (pw2 / 2 + 0.05), (py0 + py1) / 2, pw2, ph2);
  } else {
    const pw2 = (iw - 0.1) / 2, mid2 = h * 0.42;
    frameBox(x, mid2, iw, mid); frameBox(x, (0.02 + botR + h + 0.02 - topR) / 2, 0.1, h - botR - topR);
    for (const sd of [-1, 1]) {
      panel(x + sd * (pw2 / 2 + 0.05), (mid2 + mid / 2 + h + 0.02 - topR) / 2, pw2, h + 0.02 - topR - mid2 - mid / 2);
      panel(x + sd * (pw2 / 2 + 0.05), (0.02 + botR + mid2 - mid / 2) / 2, pw2, mid2 - mid / 2 - 0.02 - botR);
    }
  }
  // hardware (worn brass): the kick plate, knob on its rose, the deadbolt above, a keyhole, three butt hinges with knuckles, a mail slot
  const brass = "#B89A58", kx = x + w / 2 - 0.075;
  if (lit || o.kick) m.box("galv", [x, 0.02 + 0.11, fz + 0.009], [w - 0.06, 0.2, 0.004], "#C2A462");
  m.cyl("galv", [kx, 0.95, fz + 0.006], 0.03, 0.012, brass, { r: [Math.PI / 2, 0, 0], seg: 16 });
  m.cyl("galv", [kx, 0.95, fz + 0.025], 0.009, 0.03, brass, { r: [Math.PI / 2, 0, 0], seg: 8 });
  m.sph("galv", [kx, 0.95, fz + 0.055], 0.029, "#CDAE66", { seg: 14 });
  m.cyl("galv", [kx, 1.12, fz + 0.007], 0.03, 0.014, brass, { r: [Math.PI / 2, 0, 0], seg: 16 });
  m.cyl("galv", [kx, 1.12, fz + 0.016], 0.013, 0.008, "#9E8448", { r: [Math.PI / 2, 0, 0], seg: 12 });
  m.box("dark", [kx, 1.12, fz + 0.021], [0.003, 0.012, 0.002], "#0A0A0A");
  for (const y of [0.24, h / 2 + 0.05, h - 0.2]) {
    m.box("galv", [x - w / 2 + 0.03, y, fz + 0.002], [0.05, 0.1, 0.004], "#8E7C52");
    m.cyl("galv", [x - w / 2 - 0.004, y, fz + 0.004], 0.009, 0.1, "#9E8A5A", { seg: 8 });
    for (const dy of [-0.05, 0.05]) m.cyl("galv", [x - w / 2 - 0.004, y + dy, fz + 0.004], 0.006, 0.01, "#9E8A5A", { seg: 8 });
  }
  if (!lit) m.box("galv", [x, h * 0.42, fz + 0.012], [0.26, 0.04, 0.012], brass);
};

/**
 * addHouse(m, s): a New England gable house in the current frame (front wall on z = d/2 facing +z, x across, ground y = 0).
 * s: { w, d, h (eave above the sill), pitch (rise per run), found, wall, trim, roof: "shingle"|"tin", snow: 0–1, chimney: [x, z] | null,
 *      win: [{ f: "front"|"back"|"left"|"right", x, y, ww, wh, cell, real?, flat?, shutters? }], door: [{ f, x, w, h, cell, steps }],
 *      holes: [{ f, x, y, w, h }], icicles, seed, clap: "clap"|"board", gutters (default: on clapboard houses), sashC }
 * (E) every window is a real opening with a 3-D double-hung sash (upper sash outside, lower inside, muntins, meeting rails); a dark
 *  window shows its glazing (frost, the sky's reflection, a dim room) recessed behind the sash; a LIT window (kinds 0, 3, 5) opens onto a
 *  furnished lamplit room. Doors are 3-D. The foundation is laid in split granite / fieldstone blocks; gutters and downspouts; a lumpy
 *  snow cornice at the eaves; a corbelled brick chimney with its flashing and flue tile.
 */
export const addHouse = (m, s) => {
  const R = (k) => rnd((s.seed ?? 1) * 41 + k * 13);
  const { w, d, h } = s, found = s.found ?? 0.45, pitch = s.pitch ?? 0.75, run = d / 2, rise = run * pitch, hr = h + rise;
  const wallMat = s.clap ?? "clap", wallC = s.wall ?? "#DAD8D0", trimC = s.trim ?? "#E4E1D8", sashC = s.sashC ?? (wallMat === "board" ? "#6E655A" : "#ECEAE2");
  const fm = s.foundMat ?? "stone";
  // foundation: split granite / fieldstone laid in courses (stone), or poured concrete
  if (fm === "stone") {
    m.box("stone", [0, found / 2 - 0.05, 0], [w + 0.04, found + 0.1, d + 0.04], "#4E5054", { metric: true });   // the mortar behind
    let k = 0;
    const courses = Math.max(1, Math.round(found / 0.24)), ch = found / courses;
    for (const [L, ry, off] of [[w, 0, d / 2], [w, Math.PI, d / 2], [d, Math.PI / 2, w / 2], [d, -Math.PI / 2, w / 2]]) {
      m.push([0, 0, 0], ry);
      for (let c = 0; c < courses; c++) {
        let x = -L / 2 - 0.02 + (c % 2) * 0.18;
        while (x < L / 2 + 0.02) {
          const bl = Math.min(L / 2 + 0.04 - x, 0.34 + R(500 + k) * 0.5);
          if (bl > 0.08) m.box("stone", [x + bl / 2, -0.05 + c * ch + ch / 2 + 0.03, off + 0.025 + R(600 + k) * 0.02], [bl - 0.025, ch - 0.025, 0.07], bpick(["#8E9094", "#7E8186", "#9A9C9E", "#86837C", "#A3A49F"], R(700 + k)), { metric: true, uo: [R(k) * 5, R(k + 1) * 5] });
          x += bl; k++;
        }
      }
      m.pop();
    }
  } else m.box(fm, [0, found / 2 - 0.05, 0], [w + 0.08, found + 0.1, d + 0.08], s.foundC ?? "#8E9094", { metric: true });
  m.push([0, found, 0]);
  const T = 0.12;   // wall thickness
  // every window / door is a real opening (unless flat)
  const holes = (f) => [
    ...(s.holes ?? []).filter((o) => o.f === f).map((o) => ({ x: o.x, y: o.y - found, w: o.w, h: o.h })),
    ...(s.win ?? []).filter((o) => o.f === f && !o.real && !o.flat).map((o) => ({ x: o.x, y: o.y - found, w: o.ww, h: o.wh })),
    ...(s.door ?? []).filter((o) => o.f === f && !o.flat).map((o) => ({ x: o.x, y: 0.02, w: o.w, h: o.h }))
  ];
  const walls = [
    { f: "front", L: [0, 0, d / 2], ry: 0, w, hr: h },
    { f: "back", L: [0, 0, -d / 2], ry: Math.PI, w, hr: h },
    { f: "right", L: [w / 2, 0, 0], ry: Math.PI / 2, w: d, hr },
    { f: "left", L: [-w / 2, 0, 0], ry: -Math.PI / 2, w: d, hr }
  ];
  for (const W of walls) {
    m.push(W.L, W.ry);
    m.add(wallMat, wallShape(W.w, h, W.hr, holes(W.f)), new THREE.Matrix4(), wallC, { metric: true, uo: [R(1) * 3, R(2) * 3] });
    m.push([0, 0, -T], Math.PI); m.add("dark", wallShape(W.w, h, W.hr, holes(W.f).map((o) => ({ ...o, x: -o.x }))), new THREE.Matrix4(), "#2A2520"); m.pop();
    for (const o of holes(W.f)) {   // the reveals (jambs, head, stool) of a real opening
      m.box("trimb", [o.x - o.w / 2 - 0.005, o.y + o.h / 2, -T / 2], [0.01, o.h, T], trimC, { metric: true });
      m.box("trimb", [o.x + o.w / 2 + 0.005, o.y + o.h / 2, -T / 2], [0.01, o.h, T], trimC, { metric: true });
      m.box("trimb", [o.x, o.y + o.h + 0.005, -T / 2], [o.w, 0.01, T], trimC, { metric: true });
      m.box("trimb", [o.x, o.y - 0.005, -T / 2], [o.w, 0.01, T], trimC, { metric: true });
    }
    // corner boards (both faces of the corner), the water table, the frieze board
    if (W.f === "front" || W.f === "back") for (const sd of [-1, 1]) m.box("trimb", [sd * (W.w / 2 - 0.07), h / 2, 0.025], [0.15, h, 0.05], trimC, { metric: true });
    else for (const sd of [-1, 1]) m.box("trimb", [sd * (W.w / 2 + 0.005), h / 2, 0.025], [0.12, h, 0.05], trimC, { metric: true });
    m.box("trimb", [0, 0.09, 0.03], [W.w + 0.02, 0.18, 0.06], trimC, { metric: true });
    m.box("trimb", [0, 0.185, 0.065], [W.w + 0.04, 0.025, 0.04], trimC, { metric: true });                                       // its drip cap
    if (W.f === "front" || W.f === "back") m.box("trimb", [0, h - 0.1, 0.03], [W.w, 0.2, 0.06], trimC, { metric: true });
    m.pop();
  }
  // windows: casing, the 3-D sashes, glazing or a lit room behind, a sill with its lip and snow, a drip cap, (shutters)
  (s.win ?? []).forEach((o, wi) => {
    const W = walls.find((q) => q.f === o.f);
    m.push(W.L, W.ry);
    const cy = o.y - found + o.wh / 2;
    if (o.flat) m.quad("bwin", [o.x, cy, 0.01], o.ww, o.wh, "#FFFFFF", bwRect(o.cell, 0));
    else if (!o.real) {
      const lites = LITES[o.cell] ?? [2, 2], lit = LIT[o.cell];
      const zg = -0.085;
      if (lit === undefined) m.quad("bwin", [o.x, cy, zg], o.ww, o.wh, "#FFFFFF", bwRect(o.cell, 2));
      else {
        litRoom3(m, o, cy, T, lit, (s.seed ?? 1) * 7 + wi);
        m.quad("bglass", [o.x, cy, -0.045], o.ww - 0.04, o.wh - 0.04, "#FFFFFF");
        m.glow([o.x, cy, 0.25], "#FFB060", 1.6);
      }
      if (o.cell === 7 || o.cell === 6) sash3(m, o.x, cy, o.ww, o.wh, -0.045, lites[0], 2, sashC, 0.05, 0.05, 0.04);
      else {
        sash3(m, o.x, cy + o.wh / 4, o.ww, o.wh / 2 + 0.02, -0.03, lites[0], 1, sashC, 0.035, 0.05);                // upper sash (outside)
        sash3(m, o.x, cy - o.wh / 4, o.ww - 0.01, o.wh / 2 + 0.02, -0.062, lites[1], 1, sashC, 0.075, 0.035);      // lower sash (inside)
        m.box("galv", [o.x, cy + 0.0, -0.04], [0.07, 0.012, 0.03], "#B89A58");                                       // the sash lock
      }
    }
    const cw = 0.11;
    for (const sd of [-1, 1]) m.box("trimb", [o.x + sd * (o.ww / 2 + cw / 2), cy, 0.03], [cw, o.wh + 0.04, 0.05], trimC, { metric: true });
    m.box("trimb", [o.x, cy + o.wh / 2 + 0.08, 0.03], [o.ww + 2 * cw + 0.04, 0.16, 0.05], trimC, { metric: true });
    m.box("trimb", [o.x, cy + o.wh / 2 + 0.17, 0.06], [o.ww + 2 * cw + 0.1, 0.035, 0.1], trimC, { metric: true });       // drip cap
    m.box("trimb", [o.x, cy - o.wh / 2 - 0.03, 0.06], [o.ww + 2 * cw + 0.08, 0.05, 0.12], trimC, { metric: true });      // sill
    m.box("trimb", [o.x, cy - o.wh / 2 - 0.1, 0.03], [o.ww + 2 * cw, 0.1, 0.05], trimC, { metric: true });               // apron
    if (s.snow !== 0) {
      m.box("snow", [o.x, cy - o.wh / 2 + 0.0, 0.07], [o.ww + 2 * cw + 0.02, 0.035, 0.1], "#F4F7FB", { metric: true });
      m.box("snow", [o.x, cy + o.wh / 2 + 0.2, 0.06], [o.ww + 2 * cw + 0.06, 0.03, 0.09], "#F4F7FB", { metric: true });   // on the drip cap
    }
    if (o.shutters) for (const sd of [-1, 1]) {
      // louvred shutters: stiles, rails, a mid rail, two banks of louvres, iron shutter dogs holding them open
      const sx = o.x + sd * (o.ww / 2 + cw + 0.2), sw = 0.36, shh = o.wh + 0.04;
      for (const dx of [-1, 1]) m.box("wood", [sx + dx * (sw / 2 - 0.025), cy, 0.045], [0.05, shh, 0.035], o.shutters);
      for (const y of [cy - shh / 2 + 0.04, cy, cy + shh / 2 - 0.04]) m.box("wood", [sx, y, 0.045], [sw, 0.07, 0.035], o.shutters);
      for (let k = 0; k < 18; k++) { const y = cy - shh / 2 + 0.1 + k * (shh - 0.2) / 18; if (Math.abs(y - cy) < 0.05) continue; m.box("wood", [sx, y, 0.05], [sw - 0.08, 0.022, 0.02], o.shutters, { r: [0.5, 0, 0] }); }
      m.box("metal", [sx + sd * (sw / 2 + 0.05), cy - shh / 2 + 0.2, 0.06], [0.06, 0.02, 0.02], "#15181C");
      m.box("snow", [sx, cy + shh / 2 + 0.01, 0.05], [sw, 0.025, 0.04], "#F4F7FB");
    }
    m.pop();
  });
  // doors: the 3-D leaf, casing with a crown, the threshold, steps
  for (const o of s.door ?? []) {
    const W = walls.find((q) => q.f === o.f);
    m.push(W.L, W.ry);
    if (o.flat) m.quad("bwin", [o.x, o.h / 2 + 0.02, 0.012], o.w, o.h, "#FFFFFF", bwRect(o.cell, 1));
    else door3(m, o);
    for (const sd of [-1, 1]) m.box("trimb", [o.x + sd * (o.w / 2 + 0.07), o.h / 2 + 0.02, 0.03], [0.14, o.h + 0.06, 0.05], trimC, { metric: true });
    m.box("trimb", [o.x, o.h + 0.14, 0.03], [o.w + 0.36, 0.22, 0.05], trimC, { metric: true });
    if (!o.flat && (o.cell ?? 0) !== 3) {
      // (E) the casing's backband (a proud outer moulding), plinth blocks at its feet, a bed moulding under the head
      for (const sd of [-1, 1]) {
        m.box("trimb", [o.x + sd * (o.w / 2 + 0.155), o.h / 2 + 0.06, 0.05], [0.035, o.h + 0.1, 0.08], trimC, { metric: true });
        m.box("trimb", [o.x + sd * (o.w / 2 + 0.085), 0.12, 0.045], [0.19, 0.2, 0.07], trimC, { metric: true });
      }
      m.box("trimb", [o.x, o.h + 0.04, 0.06], [o.w + 0.36, 0.03, 0.04], trimC, { metric: true });
      m.box("trimb", [o.x, o.h + 0.255, 0.06], [o.w + 0.4, 0.03, 0.07], trimC, { metric: true });
    }
    m.box("trimb", [o.x, o.h + 0.27, 0.07], [o.w + 0.46, 0.04, 0.12], trimC, { metric: true });
    if (s.snow !== 0) m.box("snow", [o.x, o.h + 0.3, 0.07], [o.w + 0.4, 0.03, 0.1], "#F4F7FB", { metric: true });
    m.box("wood", [o.x, 0.015, 0.03], [o.w + 0.12, 0.045, 0.22], "#7A6448", { metric: true });   // the oak threshold, worn
    m.box("galv", [o.x, 0.04, 0.0], [o.w, 0.008, 0.03], "#9A8A62");                             // its brass weather bar
    for (let k = 0; k < (o.steps ?? 0); k++) {
      const sh = found / (o.steps ?? 1);
      m.box(o.stepMat ?? "stone", [o.x, -found + sh * (o.steps - k) - sh / 2, 0.3 + k * 0.3], [o.w + 0.5, sh, 0.3], o.stepC ?? "#8A8C90", { metric: true });
      m.box("snow", [o.x - (o.w + 0.5) * 0.25, -found + sh * (o.steps - k) + 0.01, 0.3 + k * 0.3], [(o.w + 0.5) * 0.45, 0.025, 0.26], "#F4F7FB", { metric: true });
    }
    m.pop();
  }
  // the roof: two slopes (overhang at the eaves and the rakes), fascia, the snow load on top with a lumpy cornice at the eave, icicles
  const ov = s.over ?? 0.32, rov = s.rake ?? 0.22, ang = Math.atan(pitch), ca = Math.cos(ang), sa = Math.sin(ang);
  const roofMat = s.roof === "tin" ? "tin" : "shingle", roofC = s.roofC ?? "#FFFFFF", rth = 0.07, len = (run + ov) / ca;
  const gut = s.gutters ?? (wallMat === "clap");
  for (const sd of [-1, 1]) {
    const n = [0, ca, sd * sa], dn = [0, -sa, sd * ca];
    const mid = [0, hr - (run + ov) * pitch / 2, sd * (run + ov) / 2];
    const sc = [0, mid[1] + n[1] * rth / 2, mid[2] + n[2] * rth / 2];
    m.box(roofMat, sc, [w + 2 * rov, rth, len], roofC, { r: [sd * ang, 0, 0], metric: true });
    // the drip edge
    m.box("galv", [0, h - ov * pitch + 0.0, sd * (d / 2 + ov + 0.005)], [w + 2 * rov + 0.02, 0.05, 0.02], "#8E969F");
    if (s.snow !== 0) {
      const sl = len * (s.snowLen ?? 0.92), sth = s.snowT ?? 0.12, off = (len - sl) / 2;
      const c = [0, sc[1] + n[1] * (rth + sth) / 2 - dn[1] * off, sc[2] + n[2] * (rth + sth) / 2 - dn[2] * off];
      m.box("snow", c, [w + 2 * rov - 0.04, sth, sl], "#F2F6FB", { r: [sd * ang, 0, 0], metric: true });
      const lip = [0, c[1] + dn[1] * sl / 2, c[2] + dn[2] * sl / 2];
      // the cornice: overlapping soft lumps along the eave, a little overhang, uneven
      const nL = Math.ceil((w + 2 * rov) / 0.38);
      for (let k = 0; k < nL; k++) {
        const x = -w / 2 - rov + 0.12 + (k + 0.5) * (w + 2 * rov - 0.24) / nL, r = sth * (0.55 + R(800 + k * 3 + (sd > 0 ? 0 : 1)) * 0.35);
        m.sph("snow", [x, lip[1] - r * 0.15, lip[2] + sd * r * 0.25], [((w + 2 * rov) / nL) * 0.75, r, r * 1.2], "#F2F6FB", { seg: 10 });
      }
      if ((s.icicles ?? true) && sd === 1) {
        const k0 = Math.floor((w + 2 * rov) / 0.12);
        for (let k = 0; k < k0; k++) {
          if (R(100 + k) < 0.45) continue;
          const ix = -w / 2 - rov + 0.08 + k * 0.12 + R(200 + k) * 0.05, il = 0.04 + Math.pow(R(300 + k), 2.2) * 0.42;
          m.cyl("ice", [ix, h - ov * pitch - (gut ? 0.2 : 0.17) - il / 2, d / 2 + ov - 0.03 + (gut ? 0.08 : 0)], 0.012 + il * 0.03, il, "#DCEBFF", { rt: 1, rb: 0.05, seg: 6 });
        }
      }
    }
    // the fascia along the eave; the gutter (K-style, galvanised) with snow in it; downspouts at both ends with elbows and splash blocks
    m.box("trimb", [0, h - ov * pitch - 0.08, sd * (d / 2 + ov - 0.02)], [w + 2 * rov, 0.18, 0.04], trimC, { metric: true });
    if (gut) {
      const gz = sd * (d / 2 + ov + 0.06), gy = h - ov * pitch - 0.1;
      m.box("galv", [0, gy, gz + sd * 0.055], [w + 0.1, 0.12, 0.012], "#9AA3AD");
      m.box("galv", [0, gy - 0.055, gz], [w + 0.1, 0.012, 0.11], "#9AA3AD");
      m.box("galv", [0, gy + 0.06, gz + sd * 0.062], [w + 0.1, 0.018, 0.025], "#A9B2BC");
      for (const ex of [-1, 1]) m.box("galv", [ex * (w / 2 + 0.05), gy, gz], [0.012, 0.12, 0.12], "#9AA3AD");
      if (s.snow !== 0) m.box("snow", [0, gy + 0.065, gz], [w + 0.06, 0.05, 0.1], "#F2F6FB");
      for (let k = 0; k < Math.floor(w / 0.8); k++) m.box("galv", [-w / 2 + 0.4 + k * 0.8, gy + 0.03, gz], [0.02, 0.012, 0.13], "#7E868F");   // hangers
      for (const ex of [-1, 1]) {
        const dx = ex * (w / 2 - 0.12), dz = sd * (d / 2 + 0.06);
        m.cyl("galv", [dx, gy - 0.12, (gz + dz) / 2], 0.035, Math.abs(gz - dz) + 0.06, "#9AA3AD", { r: [Math.PI / 2 - sd * 0.5, 0, 0], seg: 8 });
        m.cyl("galv", [dx, (gy - 0.18 - found + 0.25) / 2, dz], 0.035, gy - 0.18 + found - 0.25, "#9AA3AD", { seg: 8 });
        m.cyl("galv", [dx, -found + 0.18, dz + sd * 0.12], 0.035, 0.28, "#9AA3AD", { r: [sd * 1.1, 0, 0], seg: 8 });
        for (let q = 0; q < 3; q++) m.box("galv", [dx, 0.3 + q * (h - 0.6) / 2, sd * (d / 2 + 0.03)], [0.09, 0.02, 0.05], "#7E868F");
        m.box("concrete", [dx, -found + 0.02, dz + sd * 0.35], [0.22, 0.05, 0.5], "#8E949C");
      }
    }
  }
  // rake boards up the gables, with a little snow along their tops
  for (const sx of [-1, 1]) for (const sd of [-1, 1]) {
    m.box("trimb", [sx * (w / 2 + rov - 0.02), h + rise - ((run + ov) * pitch) / 2 - 0.06, sd * (run + ov) / 2], [0.04, 0.2, len], trimC, { r: [sd * ang, 0, 0], metric: true });
  }
  // the ridge cap
  m.box(roofMat, [0, hr + 0.06, 0], [w + 2 * rov, 0.05, 0.22], roofC, { metric: true });
  if (s.snow !== 0) m.cyl("snow", [0, hr + 0.13, 0], 0.12, w + 2 * rov - 0.06, "#F2F6FB", { r: [0, 0, Math.PI / 2], seg: 10 });
  // chimney: brick, its flashing where it meets the roof, two corbelled courses, a cap, the clay flue tile, soot, snow on the crown
  if (s.chimney) {
    const [cx, cz] = s.chimney, ch = hr + 0.9 - h, top = h + ch;
    const roofAt = h + (run - Math.abs(cz)) * pitch;
    m.box("brick1", [cx, h + ch / 2 - 0.4, cz], [0.6, ch + 0.8, 0.6], "#FFFFFF", { metric: true });
    m.box("galv", [cx, roofAt + 0.12, cz], [0.66, 0.12, 0.66], "#7E868F");
    m.box("brick1", [cx, top - 0.22, cz], [0.66, 0.08, 0.66], "#FFFFFF", { metric: true });
    m.box("brick1", [cx, top - 0.06, cz], [0.72, 0.1, 0.72], "#FFFFFF", { metric: true });
    m.box("concrete", [cx, top + 0.03, cz], [0.7, 0.06, 0.7], "#8A8E94", { metric: true });
    m.box("brick2", [cx, top + 0.16, cz], [0.26, 0.22, 0.26], "#C9A27A", { metric: true });
    m.box("dark", [cx, top + 0.275, cz], [0.18, 0.01, 0.18], "#0A0A0A");
    m.box("dark", [cx, top + 0.24, cz], [0.27, 0.06, 0.27], "#1A1614");
    m.box("snow", [cx + 0.22, top + 0.07, cz], [0.2, 0.03, 0.66], "#F2F6FB");
  }
  m.pop();
};

/** (E) a lane / driveway ribbon over the ground: pts [[x, z], …] (its centre line), half-width hw; banks of plowed snow along both
 *  edges (lumps, the snow thrown up by the plow), optional on each side */
export const addLane = (m, pts, hw, hgt = () => 0, seed = 1, banks = [true, true]) => {
  const P = [], N = [], U = [], I = [];
  let vacc = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const tx = b[0] - a[0], tz = b[1] - a[1], L = Math.hypot(tx, tz) || 1, nx = -tz / L, nz = tx / L;
    if (i > 0) vacc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    for (const sd of [-1, 1]) {
      const x = pts[i][0] + nx * hw * sd, z = pts[i][1] + nz * hw * sd;
      P.push(x, hgt(x, z) + 0.025, z); N.push(0, 1, 0); U.push(sd < 0 ? 0 : 1, vacc / 3.2);
      if (banks[sd < 0 ? 0 : 1] && i % 2 === 0) {
        const bx = pts[i][0] + nx * (hw + 0.35) * sd, bz = pts[i][1] + nz * (hw + 0.35) * sd, r = rnd(seed * 97 + i * 3 + (sd > 0 ? 1 : 0));
        m.sph("snow", [bx, hgt(bx, bz) - 0.05, bz], [0.9 + r * 0.5, 0.22 + r * 0.18, 0.55 + r * 0.2], "#EEF3FA", { seg: 10, r: [0, Math.atan2(nz, nx) + r, 0] });
      }
    }
    if (i > 0) { const k = (i - 1) * 2; I.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2));
  g.setIndex(I);
  m.add("lane", g, new THREE.Matrix4(), "#FFFFFF");
};

// ── fieldstone wall along a polyline (points [x, z]), courses of rough stones with snow on the top ─────────────────────────────
export const addStoneWall = (m, pts, hgt = () => 0, seed = 1, height = 0.85) => {
  let k = seed * 1000;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / L, uz = (z1 - z0) / L;
    const n = Math.ceil(L / 0.34);
    for (let j = 0; j < n; j++) {
      const t = (j + rnd(k) * 0.4) / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, gy = hgt(x, z);
      const ht = height * (0.82 + rnd(k + 1) * 0.3);
      // two or three courses: big stones below, smaller above, offset across the wall
      let y = gy - 0.05;
      for (let c = 0; c < 3 && y < gy + ht - 0.1; c++) {
        const s = (0.34 - c * 0.06) * (0.75 + rnd(k + c * 3 + 2) * 0.55);
        for (const side of c === 0 ? [-1, 1] : [0]) {
          const off = side * 0.2 + (rnd(k + c + 9) - 0.5) * 0.1;
          const col = bpick(["#7E8186", "#8F9295", "#6E7176", "#9A9790", "#85837C"], rnd(k + c * 7 + side));
          m.ico("stone", [x - uz * off, y + s * 0.55, z + ux * off], [s * (0.9 + rnd(k + 4) * 0.4), s * 0.62, s * (0.75 + rnd(k + 5) * 0.3)], col, { r: [rnd(k + 6) * 0.6, rnd(k + 7) * 3, rnd(k + 8) * 0.6] });
        }
        y += s * 1.05;
      }
      // the snow on top
      if (rnd(k + 11) < 0.85) m.sph("snow", [x, y + 0.02, z], [0.24 + rnd(k + 12) * 0.12, 0.07, 0.24], "#F2F6FB", { seg: 8, r: [0, rnd(k) * 3, 0] });
      k += 17;
    }
  }
};
// ── split-rail fence (post and three split rails, every 2.4 m) ───────────────────────────────────────────────────────────────
export const addRailFence = (m, pts, hgt = () => 0, seed = 2, rails = 3) => {
  let k = seed * 777;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 2.4)), ry = Math.atan2(-(z1 - z0), x1 - x0);
    for (let j = 0; j <= n; j++) {
      if (j === n && i < pts.length - 2) continue;
      const t = j / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, gy = hgt(x, z), lean = (rnd(k) - 0.5) * 0.08;
      m.box("split", [x, gy + 0.62, z], [0.14, 1.36, 0.12], bpick(["#8F877C", "#7E766C", "#9A9186"], rnd(k + 1)), { r: [lean, ry + rnd(k + 2) * 0.4, lean * 0.5], metric: true });
      m.box("snow", [x, gy + 1.32, z], [0.15, 0.05, 0.13], "#F2F6FB");
      k += 5;
    }
    for (let j = 0; j < n; j++) for (let r = 0; r < rails; r++) {
      const ta = j / n, tb = (j + 1) / n, xa = x0 + (x1 - x0) * ta, za = z0 + (z1 - z0) * ta, xb = x0 + (x1 - x0) * tb, zb = z0 + (z1 - z0) * tb;
      const ya = hgt(xa, za) + 0.38 + r * 0.36 + (rnd(k + r) - 0.5) * 0.05, yb = hgt(xb, zb) + 0.38 + r * 0.36 + (rnd(k + r + 3) - 0.5) * 0.05;
      const cx = (xa + xb) / 2, cy = (ya + yb) / 2, cz = (za + zb) / 2, len = Math.hypot(xb - xa, zb - za) + 0.3, tilt = Math.atan2(yb - ya, len);
      const sz = 0.09 + rnd(k + r + 5) * 0.04;
      m.box("split", [cx, cy, cz], [len, sz, sz * 0.85], bpick(["#8C8378", "#968D81", "#7A7268"], rnd(k + r + 7)), { r: [Math.PI / 4 + (rnd(k + r) - 0.5) * 0.3, ry, tilt], metric: true });
      if (r === rails - 1 || rnd(k + r + 9) < 0.5) m.box("snow", [cx, cy + sz * 0.62, cz], [len * (0.7 + rnd(k + r) * 0.25), 0.035, sz * 0.7], "#F2F6FB", { r: [0, ry, tilt] });
      k += 3;
    }
  }
};
// ── a snowy pine (merged into one geometry with vertex colours: tiers of drooping boughs, snow on their upper faces) ───────────
export const pineGeo = (seed = 1, tiers0 = 9) => {
  const tiers = Math.round(tiers0 * 1.5);
  const parts = [];
  const col = new THREE.Color(), dark = new THREE.Color(), snowC = new THREE.Color("#D6E0EC");
  const trunk = new THREE.CylinderGeometry(0.06, 0.12, 1.4, 8); trunk.translate(0, 0.7, 0);
  const tc = []; for (let i = 0; i < trunk.attributes.position.count; i++) { col.set("#1E1814"); tc.push(col.r, col.g, col.b); }
  trunk.setAttribute("color", new THREE.Float32BufferAttribute(tc, 3)); parts.push(trunk.toNonIndexed());
  for (let t = 0; t < tiers; t++) {
    const f = t / (tiers - 1), r = 1.2 * (1 - f * 0.9) * (0.88 + rnd(seed * 31 + t) * 0.24), y0 = 0.75 + f * 4.7, th = 0.85 - f * 0.4;
    const g = new THREE.ConeGeometry(r, th, 32, 3, true);
    const P = g.attributes.position, C = [];
    const ph = rnd(seed * 17 + t) * 6.28;
    for (let i = 0; i < P.count; i++) {
      let x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      const a = Math.atan2(z, x), rr = Math.hypot(x, z) / r;
      // boughs: a scalloped rim (a dozen drooping branch tips), slight irregularity
      const jag = 1 + (0.09 * Math.pow(Math.abs(Math.sin(a * 7 + ph)), 0.7) - 0.04 + 0.05 * Math.sin(a * 3 + ph * 2)) * rr;
      x *= jag; z *= jag; y -= 0.16 * rr * rr * (0.8 + 0.4 * Math.abs(Math.sin(a * 7 + ph)));
      P.setXYZ(i, x, y + y0 + th / 2, z);
      // snow lies on the upper faces of the boughs in soft patches; the needles darken toward the trunk
      const patch = 0.5 + 0.5 * Math.sin(a * 6 + ph + 0.6) * Math.cos(a * 2 + ph);
      const sn = Math.max(0, Math.min(1, (patch * (0.3 + rr * 0.7) - 0.55) * 3.0));
      dark.set(bpick(["#10283A", "#13303F", "#0E2432"], rnd(seed + t))).multiplyScalar(0.7 + rr * 0.45);
      col.copy(dark).lerp(snowC, sn * 0.85);
      C.push(col.r, col.g, col.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(C, 3)); g.computeVertexNormals();
    parts.push(g.toNonIndexed());
  }
  // merge
  let n = 0; for (const p of parts) n += p.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), cc = new Float32Array(n * 3);
  let o = 0;
  for (const p of parts) { p.computeVertexNormals(); pos.set(p.attributes.position.array, o * 3); nor.set(p.attributes.normal.array, o * 3); cc.set(p.attributes.color.array, o * 3); o += p.attributes.position.count; }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); g.setAttribute("color", new THREE.BufferAttribute(cc, 3));
  g.computeBoundingSphere();
  return g;
};
let PINEMAT = null;
const pineMat = () => PINEMAT ??= new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
/** <Pines items={[{p:[x,y,z], s}]}/>: three pine shapes instanced */
export const Pines = ({ items, cast = true }) => {
  const groups = useMemo(() => {
    const geos = [pineGeo(1), pineGeo(2, 10), pineGeo(3, 8)];
    return geos.map((g, gi) => {
      const its = items.filter((_, i) => i % 3 === gi);
      const im = new THREE.InstancedMesh(g, pineMat(), Math.max(1, its.length));
      const M = new THREE.Matrix4(), Q = new THREE.Quaternion();
      its.forEach((it, i) => { Q.setFromAxisAngle(_Y, it.ry ?? rnd(i * 7 + gi) * 6.28); const s = it.s ?? 1; M.compose(new THREE.Vector3(...it.p), Q, new THREE.Vector3(s * (it.sx ?? 1), s, s * (it.sx ?? 1))); im.setMatrixAt(i, M); });
      im.count = its.length; im.castShadow = cast; im.receiveShadow = true; im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere();
      return im;
    });
  }, []);
  return <>{groups.map((g, i) => <primitive key={i} object={g} />)}</>;
};
// ── a bare sugar maple: recursive limbs (merged) ─────────────────────────────────────────────────────────────────────────────
export const addMaple = (m, base, height = 9, seed = 1, color = "#2A2622") => {
  const grow = (p, dir, len, r, depth, k) => {
    const end = [p[0] + dir.x * len, p[1] + dir.y * len, p[2] + dir.z * len];
    seg3(m, "wood", p, end, r, r * 0.72, color, depth > 3 ? 7 : 5);
    if (depth === 0 || r < 0.012) return;
    const nb = depth > 4 ? 2 : 2 + (rnd(k) < 0.5 ? 1 : 0);
    for (let b = 0; b < nb; b++) {
      const yaw = (b / nb) * Math.PI * 2 + rnd(k + b * 3) * 2.2, tilt = 0.35 + rnd(k + b * 5) * 0.45;
      const nd = dir.clone().multiplyScalar(1.2).add(new THREE.Vector3(Math.cos(yaw) * Math.sin(tilt), Math.cos(tilt) * 0.3, Math.sin(yaw) * Math.sin(tilt))).normalize();
      nd.y = Math.max(nd.y, 0.15); nd.normalize();
      grow(end, nd, len * (0.66 + rnd(k + b) * 0.16), r * 0.68, depth - 1, k * 3 + b + 1);
    }
  };
  grow(base, new THREE.Vector3((rnd(seed) - 0.5) * 0.1, 1, (rnd(seed + 1) - 0.5) * 0.1).normalize(), height * 0.3, height * 0.028, 6, seed * 11 + 3);
  m.cyl("snow", [base[0], base[1] + 0.02, base[2]], 0.5, 0.05, "#F2F6FB", { seg: 10 });
};

// ── the snow ground over a height function ─────────────────────────────────────────────────────────────────────────────────
export const Snowfield = ({ hgt, size = 260, segs = 180, cx = 0, cz = 0, tint = (x, z) => 1 }) => {
  const { geo, mat } = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, segs, segs); g.rotateX(-Math.PI / 2); g.translate(cx, 0, cz);
    const P = g.attributes.position, C = [];
    const col = new THREE.Color();
    for (let i = 0; i < P.count; i++) {
      const x = P.getX(i), z = P.getZ(i);
      P.setY(i, hgt(x, z));
      const t = tint(x, z) * (0.93 + 0.07 * fbm(x * 0.15, z * 0.15, 3));
      col.setRGB(0.80 * t, 0.87 * t, 0.985 * t); C.push(col.r, col.g, col.b);   // rev STYLE (rules 3–4): the snow leans into the Bankers blue (was 0.93/0.95/0.99)
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));
    g.computeVertexNormals();
    const map = rep(canvasTex("bw_snow", 1024, 1024, snowDraw(false)), 5);
    const bump = lin(rep(canvasTex("bw_snowB", 1024, 1024, snowDraw(true)), 5));
    const mt = new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 1.2, vertexColors: true, roughness: 0.8, metalness: 0, envMapIntensity: 0.55 });
    return { geo: g, mat: mt };
  }, []);
  return <mesh geometry={geo} material={mat} receiveShadow />;
};
// distant hills: a ring of layered ridgelines (the Green Mountains in the haze), fog-free so they read as silhouettes
export const Ridges = ({ radius = 230, y0 = -2, layers = 3, color = ["#173A63", "#1D4672", "#25527F"] }) => {
  const meshes = useMemo(() => Array.from({ length: layers }, (_, L) => {
    const tex = canvasTex("bw_ridge" + L, 2048, 256, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      c.fillStyle = "#FFFFFF"; c.beginPath(); c.moveTo(0, h);
      for (let x = 0; x <= w; x += 4) { const u = x / w; const y = h * (0.35 + 0.35 * fbm(u * 9 + L * 5, L * 3.1, 5) + 0.12 * Math.sin(u * Math.PI * 6 + L)); c.lineTo(x, y); }
      c.lineTo(w, h); c.closePath(); c.fill();
    });
    tex.wrapS = THREE.RepeatWrapping;
    const r = radius - L * 30;
    const g = new THREE.CylinderGeometry(r, r, 40 - L * 8, 96, 1, true);
    const mt = new THREE.MeshBasicMaterial({ map: tex, alphaMap: tex, transparent: true, color: color[L], side: THREE.BackSide, fog: false, depthWrite: false });
    return { g, mt, y: y0 + (40 - L * 8) / 2 - 6 };
  }), []);
  return <>{meshes.map((q, i) => <mesh key={i} geometry={q.g} material={q.mt} position={[0, q.y, 0]} renderOrder={-5 + i} />)}</>;
};
