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
export const BW = { W: 2048, H: 1024, cw: 256, ch: 512 };
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
const drawBWin = (c, col, e) => {
  const x = col * BW.cw, y = 0, w = BW.cw, h = BW.ch, gx = x + 12, gy = y + 12, gw = w - 24, gh = h - 24;
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

let BM = null;
export const bMats = () => {
  if (BM) return BM;
  const T = townMats();
  const std = (o) => new THREE.MeshStandardMaterial({ vertexColors: true, ...o });
  const winMap = canvasTex("bw_win", BW.W, BW.H, (c) => { for (let k = 0; k < 8; k++) drawBWin(c, k, false); for (let k = 0; k < 4; k++) drawBDoor(c, k, false); });
  const winE = canvasTex("bw_winE", BW.W, BW.H, (c) => { c.fillStyle = "#000"; c.fillRect(0, 0, BW.W, BW.H); for (let k = 0; k < 8; k++) drawBWin(c, k, true); for (let k = 0; k < 4; k++) drawBDoor(c, k, true); });
  BM = {
    ...T,
    clap: std({ map: rep(canvasTex("bw_clap", 512, 1024, clapDraw(false)), 1, 1.6), bumpMap: lin(rep(canvasTex("bw_clapB", 512, 1024, clapDraw(true)), 1, 1.6)), bumpScale: 2.5, roughness: 0.82 }),
    board: std({ map: rep(canvasTex("bw_board", 1024, 1024, boardDraw(false)), 2), bumpMap: lin(rep(canvasTex("bw_boardB", 1024, 1024, boardDraw(true)), 2)), bumpScale: 3, roughness: 0.92 }),
    tin: std({ map: rep(canvasTex("bw_tin", 512, 1024, tinDraw(false)), 1.8, 3.6), bumpMap: lin(rep(canvasTex("bw_tinB", 512, 1024, tinDraw(true)), 1.8, 3.6)), bumpScale: 2, roughness: 0.48, metalness: 0.55 }),
    snow: std({ map: rep(canvasTex("bw_snowS", 512, 512, snowDraw(false)), 2.5), roughness: 0.78, metalness: 0, envMapIntensity: 0.6 }),
    stone: std({ map: rep(canvasTex("bw_stone", 512, 512, stoneDraw), 0.8), roughness: 0.92, flatShading: true }),
    split: std({ map: rep(canvasTex("bw_split", 256, 256, splitDraw), 1.2, 0.6), roughness: 0.9 }),
    trimb: std({ map: rep(canvasTex("bw_trim", 256, 256, trimDrawB), 1), roughness: 0.7 }),
    dark: std({ roughness: 0.9, metalness: 0 }),
    wood: std({ roughness: 0.85 }),
    ice: std({ roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.75, envMapIntensity: 1.4 }),
    bwin: std({ map: winMap, emissiveMap: winE, emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 0.9, roughness: 0.14, metalness: 0.2, envMapIntensity: 0.9 })
  };
  BM.bwin.userData.cast = false; BM.ice.userData.cast = false;
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

/**
 * addHouse(m, s): a New England gable house in the current frame (front wall on z = d/2 facing +z, x across, ground y = 0).
 * s: { w, d, h (eave above the sill), pitch (rise per run), found, wall, trim, roof: "shingle"|"tin", snow: 0–1, chimney: [x, z] | null,
 *      win: [{ f: "front"|"back"|"left"|"right", x, y, ww, wh, cell }], door: [{ f, x, w, h, cell, steps }], holes: [{ f, x, y, w, h }],
 *      icicles, seed, clap: "clap"|"board" }
 */
export const addHouse = (m, s) => {
  const R = (k) => rnd((s.seed ?? 1) * 41 + k * 13);
  const { w, d, h } = s, found = s.found ?? 0.45, pitch = s.pitch ?? 0.75, run = d / 2, rise = run * pitch, hr = h + rise;
  const wallMat = s.clap ?? "clap", wallC = s.wall ?? "#DAD8D0", trimC = s.trim ?? "#E4E1D8";
  // foundation: fieldstone (or concrete)
  m.box(s.foundMat ?? "stone", [0, found / 2 - 0.05, 0], [w + 0.08, found + 0.1, d + 0.08], s.foundC ?? "#8E9094", { metric: true });
  m.push([0, found, 0]);
  const holes = (f) => (s.holes ?? []).filter((o) => o.f === f).map((o) => ({ x: o.x, y: o.y - found, w: o.w, h: o.h }));
  // the four walls: front/back rectangles (with any real holes), the gable ends as pentagons
  const T = 0.12;   // wall thickness
  const walls = [
    { f: "front", L: [0, 0, d / 2], ry: 0, w, hr: h },
    { f: "back", L: [0, 0, -d / 2], ry: Math.PI, w, hr: h },
    { f: "right", L: [w / 2, 0, 0], ry: Math.PI / 2, w: d, hr },
    { f: "left", L: [-w / 2, 0, 0], ry: -Math.PI / 2, w: d, hr }
  ];
  for (const W of walls) {
    m.push(W.L, W.ry);
    m.add(wallMat, wallShape(W.w, h, W.hr, holes(W.f)), new THREE.Matrix4(), wallC, { metric: true, uo: [R(1) * 3, R(2) * 3] });
    // the inner face (so a hole shows a wall's thickness and nothing sees through it)
    m.push([0, 0, -T], Math.PI); m.add("dark", wallShape(W.w, h, W.hr, holes(W.f).map((o) => ({ ...o, x: -o.x }))), new THREE.Matrix4(), "#2A2520"); m.pop();
    for (const o of holes(W.f)) {   // the reveals of a real opening
      m.box("trimb", [o.x - o.w / 2 - 0.005, o.y + o.h / 2, -T / 2], [0.01, o.h, T], trimC, { metric: true });
      m.box("trimb", [o.x + o.w / 2 + 0.005, o.y + o.h / 2, -T / 2], [0.01, o.h, T], trimC, { metric: true });
      m.box("trimb", [o.x, o.y + o.h + 0.005, -T / 2], [o.w, 0.01, T], trimC, { metric: true });
      m.box("trimb", [o.x, o.y - 0.005, -T / 2], [o.w, 0.01, T], trimC, { metric: true });
    }
    // corner boards and the water table
    if (W.f === "front" || W.f === "back") for (const sd of [-1, 1]) m.box("trimb", [sd * (W.w / 2 - 0.07), h / 2, 0.025], [0.15, h, 0.05], trimC, { metric: true });
    m.box("trimb", [0, 0.09, 0.03], [W.w + 0.02, 0.18, 0.06], trimC, { metric: true });
    if (W.f === "front" || W.f === "back") m.box("trimb", [0, h - 0.1, 0.03], [W.w, 0.2, 0.06], trimC, { metric: true });   // the frieze board
    m.pop();
  }
  // windows: glazing from the atlas, casing, a sill with its lip, a drip cap; snow on the sill
  for (const o of s.win ?? []) {
    const W = walls.find((q) => q.f === o.f);
    m.push(W.L, W.ry);
    const cy = o.y - found + o.wh / 2;
    if (!o.real) m.quad("bwin", [o.x, cy, 0.01], o.ww, o.wh, "#FFFFFF", bwRect(o.cell, 0));
    const cw = 0.11;
    for (const sd of [-1, 1]) m.box("trimb", [o.x + sd * (o.ww / 2 + cw / 2), cy, 0.03], [cw, o.wh + 0.04, 0.05], trimC, { metric: true });
    m.box("trimb", [o.x, cy + o.wh / 2 + 0.08, 0.03], [o.ww + 2 * cw + 0.04, 0.16, 0.05], trimC, { metric: true });
    m.box("trimb", [o.x, cy + o.wh / 2 + 0.17, 0.06], [o.ww + 2 * cw + 0.1, 0.035, 0.1], trimC, { metric: true });       // drip cap
    m.box("trimb", [o.x, cy - o.wh / 2 - 0.03, 0.06], [o.ww + 2 * cw + 0.08, 0.05, 0.12], trimC, { metric: true });      // sill
    m.box("trimb", [o.x, cy - o.wh / 2 - 0.1, 0.03], [o.ww + 2 * cw, 0.1, 0.05], trimC, { metric: true });               // apron
    if (s.snow !== 0) m.box("snow", [o.x, cy - o.wh / 2 + 0.0, 0.07], [o.ww + 2 * cw + 0.02, 0.035, 0.1], "#F4F7FB", { metric: true });
    if (o.shutters) for (const sd of [-1, 1]) {
      m.box("wood", [o.x + sd * (o.ww / 2 + cw + 0.2), cy, 0.04], [0.36, o.wh + 0.04, 0.035], o.shutters);
      for (let k = 0; k < 14; k++) m.box("wood", [o.x + sd * (o.ww / 2 + cw + 0.2), cy - o.wh / 2 + 0.08 + k * (o.wh - 0.12) / 14, 0.06], [0.3, 0.018, 0.02], o.shutters);
    }
    m.pop();
  }
  // doors: leaf from the atlas, casing, threshold, steps
  for (const o of s.door ?? []) {
    const W = walls.find((q) => q.f === o.f);
    m.push(W.L, W.ry);
    m.quad("bwin", [o.x, o.h / 2 + 0.02, 0.012], o.w, o.h, "#FFFFFF", bwRect(o.cell, 1));
    for (const sd of [-1, 1]) m.box("trimb", [o.x + sd * (o.w / 2 + 0.07), o.h / 2 + 0.02, 0.03], [0.14, o.h + 0.06, 0.05], trimC, { metric: true });
    m.box("trimb", [o.x, o.h + 0.14, 0.03], [o.w + 0.36, 0.22, 0.05], trimC, { metric: true });
    m.box("trimb", [o.x, o.h + 0.27, 0.07], [o.w + 0.46, 0.04, 0.12], trimC, { metric: true });
    m.box("trimb", [o.x, 0.01, 0.06], [o.w + 0.1, 0.04, 0.14], "#8A8378", { metric: true });   // the threshold
    for (let k = 0; k < (o.steps ?? 0); k++) {
      const sh = found / (o.steps ?? 1);
      m.box(o.stepMat ?? "stone", [o.x, -found + sh * (o.steps - k) - sh / 2, 0.3 + k * 0.3], [o.w + 0.5, sh, 0.3], o.stepC ?? "#8A8C90", { metric: true });
      m.box("snow", [o.x - (o.w + 0.5) * 0.25, -found + sh * (o.steps - k) + 0.01, 0.3 + k * 0.3], [(o.w + 0.5) * 0.45, 0.025, 0.26], "#F4F7FB", { metric: true });
    }
    m.pop();
  }
  // the roof: two slopes (overhang at the eaves and the rakes), fascia, the snow load on top with a rounded lip, icicles
  const ov = s.over ?? 0.32, rov = s.rake ?? 0.22, ang = Math.atan(pitch), ca = Math.cos(ang), sa = Math.sin(ang);
  const roofMat = s.roof === "tin" ? "tin" : "shingle", roofC = s.roofC ?? "#FFFFFF", rth = 0.07, len = (run + ov) / ca;
  for (const sd of [-1, 1]) {
    const n = [0, ca, sd * sa], dn = [0, -sa, sd * ca];                       // slab normal, down-slope direction
    const mid = [0, hr - (run + ov) * pitch / 2, sd * (run + ov) / 2];           // the roof line's midpoint
    const sc = [0, mid[1] + n[1] * rth / 2, mid[2] + n[2] * rth / 2];
    m.box(roofMat, sc, [w + 2 * rov, rth, len], roofC, { r: [sd * ang, 0, 0], metric: true });
    if (s.snow !== 0) {
      const sl = len * (s.snowLen ?? 0.92), sth = s.snowT ?? 0.12, off = (len - sl) / 2;
      const c = [0, sc[1] + n[1] * (rth + sth) / 2 - dn[1] * off, sc[2] + n[2] * (rth + sth) / 2 - dn[2] * off];
      m.box("snow", c, [w + 2 * rov - 0.04, sth, sl], "#F2F6FB", { r: [sd * ang, 0, 0], metric: true });
      const lip = [0, c[1] + dn[1] * sl / 2, c[2] + dn[2] * sl / 2];
      m.cyl("snow", lip, sth * 0.55, w + 2 * rov - 0.04, "#F2F6FB", { r: [0, 0, Math.PI / 2], seg: 10 });
      if ((s.icicles ?? true) && sd === 1) {
        const k0 = Math.floor((w + 2 * rov) / 0.14);
        for (let k = 0; k < k0; k++) {
          if (R(100 + k) < 0.5) continue;
          const ix = -w / 2 - rov + 0.08 + k * 0.14 + R(200 + k) * 0.05, il = 0.05 + Math.pow(R(300 + k), 2.4) * 0.38;
          m.cyl("ice", [ix, h - ov * pitch - 0.17 - il / 2, d / 2 + ov - 0.03], 0.014 + il * 0.03, il, "#DCEBFF", { rt: 1, rb: 0.06, seg: 6 });
        }
      }
    }
    // the fascia along the eave
    m.box("trimb", [0, h - ov * pitch - 0.08, sd * (d / 2 + ov - 0.02)], [w + 2 * rov, 0.18, 0.04], trimC, { metric: true });
  }
  // rake boards up the gables
  for (const sx of [-1, 1]) for (const sd of [-1, 1]) {
    m.box("trimb", [sx * (w / 2 + rov - 0.02), h + rise - ((run + ov) * pitch) / 2 - 0.06, sd * (run + ov) / 2], [0.04, 0.2, len], trimC, { r: [sd * ang, 0, 0], metric: true });
  }
  // the ridge cap
  m.box(roofMat, [0, hr + 0.06, 0], [w + 2 * rov, 0.05, 0.22], roofC, { metric: true });
  if (s.snow !== 0) m.cyl("snow", [0, hr + 0.13, 0], 0.12, w + 2 * rov - 0.06, "#F2F6FB", { r: [0, 0, Math.PI / 2], seg: 10 });
  // chimney: brick, a corbelled cap, a little snow on the crown
  if (s.chimney) {
    const [cx, cz] = s.chimney, ch = hr + 0.9 - h;
    m.box("brick1", [cx, h + ch / 2 - 0.4, cz], [0.6, ch + 0.8, 0.6], "#FFFFFF", { metric: true });
    m.box("brick1", [cx, h + ch + 0.05, cz], [0.72, 0.12, 0.72], "#FFFFFF", { metric: true });
    m.box("dark", [cx, h + ch + 0.12, cz], [0.36, 0.04, 0.36], "#0A0A0A");
    m.box("snow", [cx + 0.18, h + ch + 0.13, cz], [0.18, 0.03, 0.6], "#F2F6FB");
  }
  m.pop();
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
      col.setRGB(0.93 * t, 0.95 * t, 0.99 * t); C.push(col.r, col.g, col.b);
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
