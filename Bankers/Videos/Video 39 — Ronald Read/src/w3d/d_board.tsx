// @ts-nocheck
// ★ V39 builder D — THE HOLDINGS BOARD (station lehman): a big freestanding LED stock board in a dark hall.
//   DETAIL pass (Timur 2026-11-27: "provide the real logos or the real names of the stocks — right now it's JPM, SJM — give some
//   originality to every single one that's written, and make the board more detailed"):
//   · 95 LED tiles in 10 columns (nine full rows and five; the rest of the last row is a louvred blanking plate). Each tile is a real
//     module: a fine-pitch LED face (d_led.ts: square lamps, module seams), a dark anodised bezel with a lit chamfer, four corner
//     screws, a cover glass with its own reflection streak, an engraved slot plate (A01 … J10) on the rib under it.
//   · The NAMED holdings are only the ones the WSJ named (FACTCHECK: Procter & Gamble, J.P. Morgan Chase, General Electric, Dow
//     Chemical, J.M. Smucker, CVS Health, Johnson & Johnson): each tile shows the company's full name in clean type in its own brand
//     colour, the ticker small under a brand-colour rule; the two real marks free in `simple-icons` (Chase's octagon, GE's monogram,
//     d_logos.ts) sit beside their names. No other logo is drawn. LEH (Lehman Brothers) is its own rig (the station lights it,
//     turns it red, cracks it, tips it back into its socket).
//   · The other tiles stay UNNAMED (no invented holdings, no prices): an idle quote slot — dashes in the ticker and price fields.
//   · The housing: a steel frame with bolts and vent louvres, a header with a scrolling LED ticker tape of the named tickers and a
//     lamp line, the socket grid, I-beam legs on bolted plates, a rear brace, a conduit; above it a ladder cable tray on threaded
//     hangers with the board's cables dropping into the header, linear pendant lights; the hall's panelled back wall with up-lights,
//     a polished concrete floor, stanchions with ropes in front.
//   Local metres: the tile faces on z = 0 facing +z, the board centred on x = 0, the floor at y = 0.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd, Glow } from "./kit";
import { Mesher } from "./town_parts";
import { ledPanel, fitLines, LED_FONT } from "./d_led";
import { drawLogo } from "./d_logos";
import { LightWash } from "./d_fx";

export const BD = { cols: 10, rows: 10, px: 0.62, py: 0.5, tw: 0.56, th: 0.44, y0: 1.55 };   // y0: the grid's bottom edge
export const N_TILES = 95;
export const tilePos = (r, c) => [(c - (BD.cols - 1) / 2) * BD.px, BD.y0 + (BD.rows - 1 - r) * BD.py + BD.py / 2, 0];
export const GRID_W = BD.cols * BD.px, GRID_H = BD.rows * BD.py, GRID_CY = BD.y0 + GRID_H / 2;
// the named holdings (WSJ 19 Mar 2015 via CNBC; FACTCHECK.md) — full name, ticker, brand colour, where they sit (row, col)
export const HOLDINGS = [
  { t: "PG", name: ["Procter", "& Gamble"], col: "#1F5FD0", rc: [1, 2] },             // P&G blue (#003DA5), lifted for an LED
  { t: "JPM", name: ["JPMorgan", "Chase & Co."], col: "#117ACA", rc: [2, 7], logo: "chase" },
  { t: "GE", name: ["General", "Electric"], col: "#0870D8", rc: [0, 5], logo: "ge" },
  { t: "DOW", name: ["Dow", "Chemical"], col: "#E80033", rc: [4, 1] },
  { t: "SJM", name: ["J.M.", "Smucker"], col: "#C8102E", rc: [5, 8] },
  { t: "CVS", name: ["CVS", "Health"], col: "#CC0000", rc: [6, 3] },
  { t: "JNJ", name: ["Johnson", "& Johnson"], col: "#EB1700", rc: [3, 3] }
];
export const NAMED = Object.fromEntries(HOLDINGS.map((h) => [`${h.rc[0]},${h.rc[1]}`, h.t]));
export const LEH_RC = [3, 6];
export const LEH_POS = tilePos(LEH_RC[0], LEH_RC[1]);
const isTile = (r, c) => r < 9 || c < 5;
const FACE_W = 0.53, FACE_H = 0.41;   // the lit LED area inside the bezel

// ── the tile faces: one 2048 × 1600 atlas, 4 × 4 cells of 512 × 400 (the face's 0.53 : 0.41) ────────────────────────────────
const CW = 512, CH = 400;
const cellUV = (i) => { const c = i % 4, r = Math.floor(i / 4); return [(c * CW + 1) / 2048, 1 - ((r + 1) * CH - 1) / 1600, ((c + 1) * CW - 1) / 2048, 1 - (r * CH + 1) / 1600]; };
const M = 30;   // the type's margin inside a face (px of 512)
/** a named holding: the logo (if a free mark exists), the full name in the brand colour, a brand rule, the ticker small */
const drawNamed = (h) => (o, w, ht) => {
  const top = 30, ruleY = 300;
  let tx = M, bw = w - 2 * M;
  if (h.logo) { const s = 92; drawLogo(o, h.logo, M, top + 8, s, h.col); tx = M + s + 22; bw = w - tx - M; }
  fitLines(o, h.name, tx, top, bw, ruleY - top - 18, { maxPx: 96, weight: 800, color: h.col, lead: 1.0, track: -0.015 });
  o.fillStyle = h.col; o.fillRect(M, ruleY, w - 2 * M, 6);
  o.font = `700 50px ${LED_FONT}`; if ("letterSpacing" in o) o.letterSpacing = "6px";
  o.fillStyle = "#D8E2EE"; o.textAlign = "left"; o.textBaseline = "alphabetic"; o.fillText(h.t, M, ht - 36);
  if ("letterSpacing" in o) o.letterSpacing = "0px";
  o.fillStyle = h.col; o.fillRect(w - M - 22, ht - 74, 22, 22);   // the slot's status lamp, in the brand colour
};
/** an unnamed slot: the board's idle quote format — dashes in the ticker field (2–4, as tickers vary) and the price field */
const drawIdle = (v) => (o, w, ht) => {
  const n = 2 + (v % 3), c1 = "#3F78C8", c2 = "#24497E";
  for (let k = 0; k < n; k++) { o.fillStyle = c1; o.fillRect(M + k * 62, 96, 46, 14); }
  for (let k = 0; k < 4; k++) { o.fillStyle = c2; o.fillRect(w - M - 260 + k * 66 + (k > 1 ? 22 : 0), 196, 46, 12); }
  o.fillStyle = c2; o.fillRect(w - M - 260 + 2 * 66 - 2, 202, 10, 10);   // the decimal point
  o.fillStyle = "#16294A"; o.fillRect(M, 300, w - 2 * M, 6);
  for (let k = 0; k < 3; k++) { o.fillStyle = "#1E3A66"; o.fillRect(M + k * 40, ht - 74, 26, 10); }
  o.fillStyle = "#2A5698"; o.fillRect(w - M - 22, ht - 74, 22, 22);
};
const atlasTex = () => canvasTex("d_board_faces2", 2048, 1600, (c) => {
  c.fillStyle = "#000"; c.fillRect(0, 0, 2048, 1600);
  for (let i = 0; i < 16; i++) {
    const x = (i % 4) * CW, y = Math.floor(i / 4) * CH;
    ledPanel(c, x, y, CW, CH, i < HOLDINGS.length ? drawNamed(HOLDINGS[i]) : drawIdle(i));
  }
});
const cellOf = (r, k) => { const i = HOLDINGS.findIndex((h) => h.rc[0] === r && h.rc[1] === k); return i >= 0 ? i : 7 + Math.floor(rnd(r * 17 + k * 5 + 2) * 9); };
// LEH's own faces: the unlit lamp grid, the lit name (white — the station tints it blue, white, red), the flare frame
const lehBase = () => canvasTex("d_leh_base2", CW, CH, (c, w, h) => ledPanel(c, 0, 0, w, h, () => {}));
const lehTop = () => canvasTex("d_leh_top2", CW, CH, (c, w, h) => {
  c.fillStyle = "#000"; c.fillRect(0, 0, w, h);
  ledPanel(c, 0, 0, w, h, (o) => {
    fitLines(o, ["Lehman", "Brothers"], M, 30, w - 2 * M, 252, { maxPx: 96, weight: 800, color: "#FFFFFF", lead: 1.0, track: -0.015 });
    o.fillStyle = "#FFFFFF"; o.fillRect(M, 300, w - 2 * M, 6);
    o.font = `700 50px ${LED_FONT}`; if ("letterSpacing" in o) o.letterSpacing = "6px"; o.textAlign = "left"; o.fillText("LEH", M, h - 36); if ("letterSpacing" in o) o.letterSpacing = "0px";
    o.fillRect(w - M - 22, h - 74, 22, 22);
  }, { off: [0, 0, 0], seams: 0 });
});
const lehSub = () => canvasTex("d_leh_sub2", CW, CH, (c, w, h) => {   // the flare: a lit frame of lamps round the face
  c.fillStyle = "#000"; c.fillRect(0, 0, w, h);
  ledPanel(c, 0, 0, w, h, (o) => { o.strokeStyle = "#FFFFFF"; o.lineWidth = 10; o.strokeRect(10, 10, w - 20, h - 20); }, { off: [0, 0, 0], seams: 0 });
});
// cracks across the tile's cover glass: branching fracture lines from an impact point (white; the station tints and fades them)
const crackTex = () => canvasTex("d_leh_crack", 512, 400, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  const ox = w * 0.58, oy = h * 0.36;
  c.lineCap = "round"; c.lineJoin = "round";
  const branch = (x, y, a, len, wd, depth, seed) => {
    let px = x, py = y;
    c.beginPath(); c.moveTo(px, py);
    const n = 6;
    for (let i = 1; i <= n; i++) { const aa = a + (rnd(seed + i * 3.1) - 0.5) * 0.7; px += Math.cos(aa) * len / n; py += Math.sin(aa) * len / n; c.lineTo(px, py); }
    c.strokeStyle = `rgba(255,255,255,${0.55 + 0.3 * (depth === 0)})`; c.lineWidth = wd; c.stroke();
    if (depth < 2) for (let k = 0; k < 2; k++) branch(x + (px - x) * (0.35 + 0.3 * k), y + (py - y) * (0.35 + 0.3 * k), a + (k ? 0.7 : -0.8) * (0.6 + rnd(seed + k) * 0.6), len * 0.45, wd * 0.6, depth + 1, seed * 1.7 + k * 13);
  };
  for (let k = 0; k < 7; k++) branch(ox, oy, (k / 7) * Math.PI * 2 + rnd(k) * 0.5, 160 + rnd(k + 4) * 180, 2.6, 0, k * 17 + 3);
  c.strokeStyle = "rgba(255,255,255,0.7)"; c.lineWidth = 1.6;
  c.beginPath(); for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2, rr = 26 + rnd(i) * 10; i ? c.lineTo(ox + Math.cos(a) * rr, oy + Math.sin(a) * rr) : c.moveTo(ox + Math.cos(a) * rr, oy + Math.sin(a) * rr); } c.stroke();
  c.fillStyle = "rgba(255,255,255,0.45)"; c.beginPath(); c.arc(ox, oy, 7, 0, Math.PI * 2); c.fill();
});
// the slot plates: 10 × 10 engraved plates "A01" … "J10" (row letter, column number), 128 × 40 each
const PLATE = { W: 1280, H: 400, cw: 128, ch: 40 };
const plateUV = (r, k) => [(k * PLATE.cw + 2) / PLATE.W, 1 - ((r + 1) * PLATE.ch - 2) / PLATE.H, ((k + 1) * PLATE.cw - 2) / PLATE.W, 1 - (r * PLATE.ch + 2) / PLATE.H];
const plateTex = () => canvasTex("d_plates", PLATE.W, PLATE.H, (c) => {
  for (let r = 0; r < 10; r++) for (let k = 0; k < 10; k++) {
    const x = k * PLATE.cw, y = r * PLATE.ch;
    const g = c.createLinearGradient(0, y, 0, y + PLATE.ch); g.addColorStop(0, "#AEB7C4"); g.addColorStop(1, "#7E8896");
    c.fillStyle = g; c.fillRect(x, y, PLATE.cw, PLATE.ch);
    for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(255,255,255,${rnd(r * 100 + k * 7 + i) * 0.15})`; c.fillRect(x + rnd(i + k) * PLATE.cw, y + rnd(i * 3 + r) * PLATE.ch, 18, 1); }
    c.strokeStyle = "rgba(20,26,36,0.6)"; c.lineWidth = 2; c.strokeRect(x + 3, y + 3, PLATE.cw - 6, PLATE.ch - 6);
    c.fillStyle = "#1A212C"; c.font = `700 24px ${LED_FONT}`; c.textAlign = "center"; c.textBaseline = "middle";
    if ("letterSpacing" in c) c.letterSpacing = "3px";
    c.fillText(`${"ABCDEFGHIJ"[r]}${String(k + 1).padStart(2, "0")}`, x + PLATE.cw / 2 + 1.5, y + PLATE.ch / 2 + 1);
    if ("letterSpacing" in c) c.letterSpacing = "0px";
    for (const sx of [10, PLATE.cw - 10]) { c.fillStyle = "#3A424E"; c.beginPath(); c.arc(x + sx, y + PLATE.ch / 2, 3.5, 0, 7); c.fill(); }
  }
});
// the cover glass: soft diagonal reflection streaks (a strip; every tile takes its own window of it)
const glassTex = () => canvasTex("d_tile_glass", 1024, 256, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(255,255,255,0.3)"); g.addColorStop(0.5, "rgba(255,255,255,0.06)"); g.addColorStop(1, "rgba(255,255,255,0.02)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let k = 0; k < 14; k++) {
    const x = rnd(k * 5 + 1) * w, wd = 20 + rnd(k * 5 + 2) * 90, a = 0.12 + rnd(k * 5 + 3) * 0.3;
    c.fillStyle = `rgba(255,255,255,${a})`; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + wd, 0); c.lineTo(x + wd - 140, h); c.lineTo(x - 140, h); c.fill();
  }
});
const glassUV = (i) => { const u = rnd(i * 3.3 + 1) * 0.7; return [u, 0, u + 0.3, 1]; };
// the louvred blanking plate and the vent strips of the frame
const louvreTex = () => canvasTex("d_louvre2", 512, 128, (c, w, h) => {
  c.fillStyle = "#1B2331"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) {
    const x = 30 + i * 52; c.fillStyle = "#04070C"; c.fillRect(x, 18, 34, 92);
    const g = c.createLinearGradient(x, 0, x + 34, 0); g.addColorStop(0, "rgba(160,190,230,0.22)"); g.addColorStop(0.3, "rgba(160,190,230,0.04)"); g.addColorStop(1, "rgba(0,0,0,0)");
    for (let k = 0; k < 9; k++) { c.fillStyle = g; c.fillRect(x, 20 + k * 10, 34, 4); }
  }
});
const steelTex = () => canvasTex("d_steel", 512, 512, (c, w, h) => {
  c.fillStyle = "#808890"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { const g = 110 + rnd(i) * 60; c.fillStyle = `rgba(${g},${g + 4},${g + 10},0.25)`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 1 + rnd(i + 3) * 18, 1); }
});
const floorTex = () => canvasTex("d_floor2", 1024, 1024, (c, w, h) => {
  c.fillStyle = "#2E3846"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 26000; i++) { const g = 40 + rnd(i) * 50; c.fillStyle = `rgba(${g},${g + 6},${g + 16},0.22)`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  for (let i = 0; i < 40; i++) { const x = rnd(i * 7) * w, y = rnd(i * 7 + 1) * h, r = 40 + rnd(i * 7 + 2) * 140; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rnd(i) < 0.5 ? "0,0,0" : "120,140,170"},0.08)`); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  c.fillStyle = "rgba(6,10,18,0.75)"; for (let k = 0; k <= 4; k++) { c.fillRect(k * w / 4 - 2, 0, 4, h); c.fillRect(0, k * h / 4 - 2, w, 4); }
});
// the header's ticker tape: the named tickers only (no prices), evenly spaced so the strip wraps seamlessly
const tapeTex = () => {
  const t = canvasTex("d_tape", 2048, 64, (c, w, h) => ledPanel(c, 0, 0, w, h, (o) => {
    o.font = `800 44px ${LED_FONT}`; o.textBaseline = "middle"; o.textAlign = "center";
    const n = HOLDINGS.length, step = w / n;
    HOLDINGS.forEach((hh, i) => { o.fillStyle = "#8FC0F8"; o.fillText(hh.t, step * (i + 0.5), h / 2 + 2); o.fillStyle = "#3F78C8"; o.fillRect(step * (i + 1) - 4, h / 2 - 4, 8, 8); });
  }, { seams: 0 }));
  t.wrapS = THREE.RepeatWrapping; return t;
};

let MATS = null;
const boardMats = () => {
  if (MATS) return MATS;
  const st = steelTex(); st.wrapS = st.wrapT = THREE.RepeatWrapping;
  const faces = atlasTex();
  MATS = {
    steel: new THREE.MeshStandardMaterial({ map: st, color: "#3A4352", roughness: 0.42, metalness: 0.75, envMapIntensity: 0.8, vertexColors: true }),
    dark: new THREE.MeshStandardMaterial({ color: "#0B0F17", roughness: 0.6, metalness: 0.4, vertexColors: true }),
    bezel: new THREE.MeshStandardMaterial({ color: "#151B26", roughness: 0.35, metalness: 0.5, vertexColors: true, envMapIntensity: 0.9 }),
    face: new THREE.MeshStandardMaterial({ map: faces, color: "#262626", emissiveMap: faces, emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 1.55, roughness: 0.35, metalness: 0.1, envMapIntensity: 0.2 }),
    glass: new THREE.MeshStandardMaterial({ map: glassTex(), color: "#BFD3F0", transparent: true, opacity: 0.16, roughness: 0.06, metalness: 0.2, envMapIntensity: 1.4, depthWrite: false, vertexColors: true }),
    plate: new THREE.MeshStandardMaterial({ map: plateTex(), roughness: 0.4, metalness: 0.55, envMapIntensity: 0.8 }),
    louvre: new THREE.MeshStandardMaterial({ map: louvreTex(), roughness: 0.45, metalness: 0.6, vertexColors: true }),
    strip: new THREE.MeshBasicMaterial({ color: "#7FB4F2", toneMapped: false, vertexColors: true }),
    lamp: new THREE.MeshBasicMaterial({ color: "#FFFFFF", toneMapped: false, vertexColors: true }),
    bolt: new THREE.MeshStandardMaterial({ color: "#9AA6B6", roughness: 0.3, metalness: 0.9, vertexColors: true }),
    cable: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.55, metalness: 0.1, vertexColors: true }),
    wall: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.85, metalness: 0.05, vertexColors: true })
  };
  for (const k of ["face", "strip", "lamp", "glass", "plate"]) MATS[k].userData.cast = false;
  MATS.glass.userData = { cast: false, recv: false, order: 3 };
  return MATS;
};
/** one tile module (body, LED face, bezel with its lit chamfer, screws, cover glass) at (x, y); face = the atlas cell UV or null */
const tileModule = (m, x, y, uv, gi) => {
  const bw = 0.022, fw = FACE_W, fh = FACE_H;
  m.box("bezel", [x, y, -0.05], [BD.tw + 0.02, BD.th + 0.02, 0.1], "#FFFFFF");
  if (uv) m.quad("face", [x, y, 0.0015], fw, fh, "#FFFFFF", uv);
  for (const sd of [-1, 1]) {
    m.box("bezel", [x + sd * (fw / 2 + bw / 2), y, 0.012], [bw, fh + 2 * bw, 0.026], "#FFFFFF");
    m.box("bezel", [x, y + sd * (fh / 2 + bw / 2), 0.012], [fw, bw, 0.026], "#FFFFFF");
  }
  m.box("bezel", [x, y + fh / 2 + bw - 0.002, 0.026], [fw + 2 * bw, 0.004, 0.003], "#5A6678");   // the lit top chamfer
  m.box("bezel", [x - fw / 2 - bw + 0.002, y, 0.026], [0.004, fh + 2 * bw, 0.003], "#3A4456");
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) m.cyl("bolt", [x + sx * (fw / 2 + bw / 2), y + sy * (fh / 2 + bw / 2), 0.027], 0.0065, 0.004, "#FFFFFF", { r: [Math.PI / 2, 0, 0], seg: 8 });
  m.quad("glass", [x, y, 0.02], fw, fh, "#FFFFFF", glassUV(gi));
};
const buildBoard = (m) => {
  const W = GRID_W, H = GRID_H, X0 = -W / 2, Y0 = BD.y0, FR = 0.24, DEP = 0.56;
  const xL = X0 - FR / 2, xR = X0 + W + FR / 2, yB = Y0 - FR / 2, yT = Y0 + H + FR / 2;
  // the housing: back box, the four frame members (proud of the grid), the header band
  m.box("dark", [0, Y0 + H / 2, -0.33], [W + 0.04, H + 0.04, 0.04], "#FFFFFF");
  m.box("steel", [0, Y0 + H / 2 + 0.31, -0.36], [W + 2 * FR, H + 2 * FR + 0.62, 0.06], "#FFFFFF");
  for (const x of [xL, xR]) m.box("steel", [x, Y0 + H / 2 + 0.31, -DEP / 2 + 0.1], [FR, H + 2 * FR + 0.62, DEP], "#FFFFFF");
  m.box("steel", [0, yB, -DEP / 2 + 0.1], [W + 2 * FR, FR, DEP], "#FFFFFF");
  m.box("steel", [0, yT + 0.31, -DEP / 2 + 0.1], [W + 2 * FR, FR + 0.62, DEP], "#FFFFFF");
  m.box("dark", [0, yT + 0.31, 0.105], [W - 0.1, 0.46, 0.012], "#FFFFFF");                          // the header's recessed panel
  m.box("bezel", [0, yT + 0.31 + 0.24, 0.112], [W - 0.06, 0.02, 0.02], "#4A5568");                  // its frame
  m.box("bezel", [0, yT + 0.31 - 0.24, 0.112], [W - 0.06, 0.02, 0.02], "#4A5568");
  m.box("strip", [0, yT + 0.31 - 0.185, 0.115], [W - 0.4, 0.022, 0.01], "#FFFFFF");                  // the thin lamp line under the tape
  m.box("steel", [0, yT + 0.65, -0.12], [W + 2 * FR + 0.08, 0.06, DEP + 0.16], "#FFFFFF");          // the cap
  // the frame's edge chamfers and a lip round the grid
  for (const x of [xL + FR / 2 - 0.01, xR - FR / 2 + 0.01]) m.box("bezel", [x, Y0 + H / 2, 0.06], [0.02, H + 0.02, 0.04], "#FFFFFF");
  for (const y of [yB + FR / 2 - 0.01, yT - FR / 2 + 0.01]) m.box("bezel", [0, y, 0.06], [W + 0.02, 0.02, 0.04], "#FFFFFF");
  // vent louvres on the bottom rail and the side stiles (the housing breathes: the LED modules' heat)
  for (let i = 0; i < 6; i++) m.quad("louvre", [X0 + 0.55 + i * (W - 1.1) / 5, yB, 0.102], 0.7, 0.13, "#FFFFFF", [0, 0, 1, 1]);
  for (const x of [xL, xR]) for (let i = 0; i < 4; i++) m.quad("louvre", [x, Y0 + 0.8 + i * 1.2, 0.102], 0.5, 0.13, "#FFFFFF", [0, 0, 1, 1], { r: [0, 0, Math.PI / 2] });
  // bolts round the frame face
  for (let i = 0; i <= 12; i++) for (const y of [yB + 0.085, yT - 0.085]) m.cyl("bolt", [X0 + i * W / 12, y, 0.105], 0.018, 0.02, "#FFFFFF", { r: [Math.PI / 2, 0, 0], seg: 6 });
  for (let i = 0; i <= 10; i++) for (const x of [xL, xR]) m.cyl("bolt", [x, Y0 + i * H / 10, 0.105], 0.018, 0.02, "#FFFFFF", { r: [Math.PI / 2, 0, 0], seg: 6 });
  // the socket grid: vertical and horizontal ribs between the tiles (their front at z 0.05), the slot plates on them
  for (let k = 0; k <= BD.cols; k++) { const full = k <= 5 || k === BD.cols, yb = full ? Y0 : Y0 + BD.py; m.box("bezel", [X0 + k * BD.px, (yb + Y0 + H) / 2, 0.0], [0.045, Y0 + H - yb, 0.1], "#FFFFFF"); }
  for (let r = 0; r <= BD.rows; r++) m.box("bezel", [0, Y0 + r * BD.py, 0.0], [W, 0.045, 0.1], "#FFFFFF");
  // the tiles (all but LEH, which the station draws)
  let gi = 0;
  for (let r = 0; r < BD.rows; r++) for (let k = 0; k < BD.cols; k++) {
    if (!isTile(r, k)) continue;
    const [x, y] = tilePos(r, k);
    m.quad("plate", [x - BD.tw / 2 + 0.07, y - BD.py / 2, 0.0505], 0.1, 0.031, "#FFFFFF", plateUV(r, k));
    if (r === LEH_RC[0] && k === LEH_RC[1]) continue;
    tileModule(m, x, y, cellUV(cellOf(r, k)), gi++);
  }
  // LEH's empty socket (seen when the tile tips back): a dark well with its connector
  { const [x, y] = LEH_POS; m.box("dark", [x, y, -0.22], [BD.tw + 0.03, BD.th + 0.03, 0.02], "#FFFFFF"); m.box("steel", [x, y - 0.08, -0.2], [0.16, 0.05, 0.03], "#8A94A2"); }
  // the blanking plate over the last row's five empty cells
  { const x0 = X0 + 5 * BD.px, y = Y0 + BD.py / 2; m.box("steel", [x0 + 2.5 * BD.px, y, 0.0], [5 * BD.px - 0.02, BD.py - 0.02, 0.1], "#FFFFFF"); m.quad("louvre", [x0 + 2.5 * BD.px, y, 0.052], 5 * BD.px - 0.3, BD.py - 0.16, "#FFFFFF", [0, 0, 1, 1]); }
  // legs: I-beams (web + flanges) from the floor to the frame, base plates with bolts, gussets, a rear brace
  for (const lx of [-2.3, 2.3]) {
    const h = yB - FR / 2;
    m.box("steel", [lx, h / 2, -0.12], [0.03, h, 0.28], "#FFFFFF");
    for (const s of [-1, 1]) m.box("steel", [lx + s * 0.11, h / 2, -0.12], [0.02, h, 0.3], "#FFFFFF"), m.box("steel", [lx, h / 2, -0.12 + s * 0.14], [0.24, h, 0.02], "#FFFFFF");
    m.box("steel", [lx, 0.025, -0.12], [0.62, 0.05, 0.7], "#FFFFFF");
    for (const a of [-1, 1]) for (const b of [-1, 1]) { m.cyl("bolt", [lx + a * 0.24, 0.06, -0.12 + b * 0.28], 0.025, 0.03, "#FFFFFF", { seg: 6 }); m.cyl("bolt", [lx + a * 0.24, 0.085, -0.12 + b * 0.28], 0.012, 0.04, "#FFFFFF", { seg: 6 }); }
    for (const s of [-1, 1]) m.box("steel", [lx + s * 0.07, 0.2, -0.12 + 0.16], [0.012, 0.3, 0.12], "#FFFFFF", { r: [0.6, 0, 0] });
    m.box("steel", [lx, h * 0.5, -0.6], [0.08, 0.08, Math.hypot(h, 0.9)], "#FFFFFF", { r: [-Math.atan2(h, 0.9), 0, 0] });
  }
  // the cable conduit down the left leg and along the floor, a junction box on the leg
  m.cyl("dark", [-2.02, (yB - FR / 2) / 2, -0.3], 0.045, yB - FR / 2, "#FFFFFF", { seg: 10 });
  for (let i = 0; i < 4; i++) m.cyl("bolt", [-2.02, 0.2 + i * 0.4, -0.3], 0.05, 0.03, "#6A7482", { seg: 10 });
  m.box("steel", [-2.02, 1.0, -0.22], [0.22, 0.28, 0.12], "#5A6474"); m.box("bolt", [-2.02, 1.0, -0.158], [0.18, 0.24, 0.004], "#8A94A2");
  m.box("dark", [-2.02, 0.03, -2.6], [0.1, 0.06, 4.6], "#FFFFFF");
};
// above the board: a ladder cable tray on threaded hangers, the board's cable drops, linear pendant lights; the hall's back wall
const buildRoom = (m) => {
  const yTop = BD.y0 + GRID_H + 0.12 + 0.65, ty = 8.5, tz = -0.25;
  for (const sz of [-1, 1]) m.box("steel", [0, ty, tz + sz * 0.16], [22, 0.1, 0.02], "#AEB8C6");
  for (let x = -11; x <= 11; x += 0.3) m.box("steel", [x, ty - 0.04, tz], [0.025, 0.02, 0.32], "#8E98A6");
  for (let x = -10.5; x <= 10.5; x += 1.5) {
    m.box("steel", [x, ty - 0.08, tz], [0.04, 0.04, 0.46], "#6E7886");
    for (const sz of [-1, 1]) m.cyl("bolt", [x, ty + 1.9, tz + sz * 0.21], 0.006, 4.0, "#8E98A6", { seg: 5 });
  }
  const cab = [["#1C232E", 0.016, -0.08], ["#26303E", 0.012, -0.02], ["#3B5E8E", 0.01, 0.03], ["#1C232E", 0.014, 0.08], ["#5A6472", 0.009, 0.11]];
  for (const [c, r, dz] of cab) m.cyl("cable", [0, ty + r, tz + dz], r, 22, c, { r: [0, 0, Math.PI / 2], seg: 6 });
  for (const dx of [-1.6, 1.6]) {
    const h = ty - yTop;
    for (const [c, r, dz] of cab.slice(0, 3)) m.cyl("cable", [dx + dz, yTop + h / 2, tz + 0.02], r * 1.2, h, c, { seg: 6 });
    m.box("steel", [dx, yTop + 0.03, tz + 0.02], [0.3, 0.06, 0.2], "#3A4352");   // the gland plate on the cap
  }
  for (const z of [-3.5, 2.6]) for (const x of [-7.5, -2.5, 2.5, 7.5]) {
    const y = 9.7;
    m.box("steel", [x, y, z], [3.2, 0.08, 0.16], "#2A313C");
    m.box("lamp", [x, y - 0.045, z], [3.1, 0.012, 0.11], "#DCE8FA");
    for (const sx of [-1, 1]) m.cyl("bolt", [x + sx * 1.3, y + 1.2, z], 0.004, 2.4, "#6E7886", { seg: 4 });
  }
  // the back wall: panels between pilasters, a skirting, up-light housings at the pilasters' feet
  m.box("wall", [0, 8, -14.1], [80, 16, 0.2], "#1A2A42");
  for (let x = -30; x <= 30; x += 6) {
    m.box("wall", [x, 8, -13.85], [0.7, 16, 0.3], "#22344F");
    m.box("steel", [x, 0.15, -13.6], [0.5, 0.3, 0.3], "#2A313C"); m.box("lamp", [x, 0.31, -13.6], [0.4, 0.01, 0.2], "#BFD6FF");
  }
  for (let x = -27; x <= 27; x += 6) for (let y = 1.6; y < 15; y += 3.2) m.box("wall", [x, y, -13.99], [5.1, 3.0, 0.02], "#16243A");
  m.box("wall", [0, 0.1, -13.95], [80, 0.2, 0.1], "#0E1828");
  // stanchions and ropes in front of the board
  const posts = [-3.0, -1.0, 1.0, 3.0], sz = 2.4;
  for (const x of posts) {
    m.cyl("bolt", [x, 0.015, sz], 0.17, 0.03, "#C9D3DE", { seg: 20 }); m.cyl("bolt", [x, 0.47, sz], 0.025, 0.92, "#C9D3DE", { seg: 10 });
    m.sph("bolt", [x, 0.95, sz], 0.045, "#DCE4EE", { seg: 10 });
  }
  for (let i = 0; i < posts.length - 1; i++) {
    const a = posts[i] + 0.05, b = posts[i + 1] - 0.05, N = 8, sag = 0.22;
    for (let k = 0; k < N; k++) {
      const u0 = k / N, u1 = (k + 1) / N, x0 = a + (b - a) * u0, x1 = a + (b - a) * u1, y0 = 0.9 - sag * 4 * u0 * (1 - u0), y1 = 0.9 - sag * 4 * u1 * (1 - u1);
      m.cyl("cable", [(x0 + x1) / 2, (y0 + y1) / 2, sz], 0.018, Math.hypot(x1 - x0, y1 - y0) + 0.01, "#1F3554", { r: [0, 0, Math.PI / 2 + Math.atan2(y1 - y0, x1 - x0)], seg: 8 });
    }
  }
};
/** the board (static) and its hall: housing, grid, 94 tiles, the ticker tape (scrolls with f), the tray, lights, the wall */
export const Board = ({ f = 0 }) => {
  const grp = useMemo(() => { const m = new Mesher(); buildBoard(m); buildRoom(m); return m.build(boardMats()); }, []);
  const tape = useMemo(tapeTex, []);
  tape.repeat.set((GRID_W - 0.3) / 0.27 / 32, 1);
  tape.offset.x = (f * 0.0032) % 1;
  const yT = BD.y0 + GRID_H + 0.12;
  return (
    <group>
      <primitive object={grp} />
      <mesh position={[0, yT + 0.31 + 0.04, 0.113]}><planeGeometry args={[GRID_W - 0.3, 0.27]} /><meshStandardMaterial map={tape} color="#202020" emissiveMap={tape} emissive="#FFFFFF" emissiveIntensity={1.5} roughness={0.35} /></mesh>
      {[-7.5, -2.5, 2.5, 7.5].map((x) => <Glow key={x} position={[x, 9.6, 2.6]} size={2.6} color="#CFE0F8" opacity={0.28} />)}
      {[-12, -6, 0, 6, 12].map((x) => <LightWash key={x} position={[x, 3.2, -13.5]} w={2.6} h={7} color="#7FB4F2" opacity={0.16} />)}
    </group>
  );
};
// LEH: the tile as a separate rig. s: { flare 0..1, red 0..1, dark 0..1 (lamps off), crack 0..1, tip 0..1 (falls back), flick }
const lehMats = () => ({
  bez: new THREE.MeshStandardMaterial({ color: "#151B26", roughness: 0.35, metalness: 0.5, envMapIntensity: 0.9 }),
  bolt: new THREE.MeshStandardMaterial({ color: "#9AA6B6", roughness: 0.3, metalness: 0.9 }),
  glass: new THREE.MeshStandardMaterial({ map: glassTex(), color: "#BFD3F0", transparent: true, opacity: 0.16, roughness: 0.06, metalness: 0.2, envMapIntensity: 1.4, depthWrite: false })
});
export const LehTile = ({ s }) => {
  const tex = useMemo(() => ({ base: lehBase(), top: lehTop(), sub: lehSub(), crack: crackTex(), M: lehMats() }), []);
  const blue = new THREE.Color("#5C9CF0"), white = new THREE.Color("#E6F1FF"), red = new THREE.Color("#FF3A30");
  const col = blue.clone().lerp(white, s.flare * (1 - s.red)).lerp(red, s.red);
  const I = (1 + 0.9 * s.flare * (1 - s.red)) * (1 - s.dark) * s.flick;
  const [x, y] = LEH_POS, bw = 0.022, fw = FACE_W, fh = FACE_H;
  // the tip: it turns about its bottom edge, top back into the socket; it sits a little proud while flared
  const zOff = 0.05 * s.flare * (1 - s.tip) - 0.13 * s.tip, th = -0.24 * s.tip, drop = -0.025 * s.tip;
  return (
    <group position={[x, y - BD.th / 2 + drop, zOff]} rotation-x={th}>
      <group position={[0, BD.th / 2, 0]}>
        <mesh position={[0, 0, -0.05]} material={tex.M.bez}><boxGeometry args={[BD.tw + 0.02, BD.th + 0.02, 0.1]} /></mesh>
        {[-1, 1].map((sd) => <mesh key={"v" + sd} position={[sd * (fw / 2 + bw / 2), 0, 0.012]} material={tex.M.bez}><boxGeometry args={[bw, fh + 2 * bw, 0.026]} /></mesh>)}
        {[-1, 1].map((sd) => <mesh key={"h" + sd} position={[0, sd * (fh / 2 + bw / 2), 0.012]} material={tex.M.bez}><boxGeometry args={[fw, bw, 0.026]} /></mesh>)}
        {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => <mesh key={a + "_" + b} position={[a * (fw / 2 + bw / 2), b * (fh / 2 + bw / 2), 0.027]} rotation-x={Math.PI / 2} material={tex.M.bolt}><cylinderGeometry args={[0.0065, 0.0065, 0.004, 8]} /></mesh>)}
        <mesh position={[0, 0, 0.0015]}><planeGeometry args={[fw, fh]} /><meshBasicMaterial map={tex.base} color="#B4BCC8" /></mesh>
        {I > 0.004 && <mesh position={[0, 0, 0.003]}><planeGeometry args={[fw, fh]} /><meshBasicMaterial map={tex.top} color={col.clone().multiplyScalar(I)} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>}
        {I * s.flare > 0.004 && <mesh position={[0, 0, 0.004]}><planeGeometry args={[fw, fh]} /><meshBasicMaterial map={tex.sub} color={col.clone().multiplyScalar(I * s.flare)} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>}
        <mesh position={[0, 0, 0.02]} material={tex.M.glass} renderOrder={3}><planeGeometry args={[fw, fh]} /></mesh>
        {s.crack > 0.004 && <mesh position={[0, 0, 0.021]} renderOrder={4}><planeGeometry args={[fw, fh]} /><meshBasicMaterial map={tex.crack} color="#A9BEDA" transparent opacity={(0.75 - 0.4 * s.tip) * s.crack} depthWrite={false} /></mesh>}
      </group>
    </group>
  );
};
/** the floor: polished dark concrete in big slabs */
export const BoardFloor = () => {
  const t = useMemo(() => { const x = floorTex(); x.wrapS = x.wrapT = THREE.RepeatWrapping; x.repeat.set(12, 12); return x; }, []);
  return <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow><planeGeometry args={[96, 96]} /><meshStandardMaterial map={t} color="#7E8CA3" roughness={0.28} metalness={0.35} envMapIntensity={0.6} /></mesh>;
};
