// @ts-nocheck
// ★ V39 builder C — THE BANK VAULT (station `vault`; detail pass 2026-11-27: the round vault doorway c_vdoor.tsx, lock faces, bezels,
//   hinge knuckles, engraved plates, section dividers, the box's lid/lips/label, the counting table's mat and pen, brass-strip terrazzo): "When he died, he owned at least 95 stocks. The certificates in his safe deposit
//   box stood about 5 inches high." (WSJ 19 Mar 2015). Metres; floor y 0; the wall of boxes' door faces at z WALLZ (facing +z).
//   · the wall: 176 brushed-brass doors in four sections (3-, 5- and 10-inch doors), each with an engraved number plate, two
//     keyholes (guard key + renter key) in round escutcheons, a hinge, inset in a steel grid; a steel plinth and a cornice with
//     SAFE DEPOSIT in raised letters; a polished terrazzo floor. All merged (town_parts' Mesher): a handful of draw calls.
//   · the viewing table: a brushed-steel top on a steel base, pushed against the wall, its top flush with the target slot's floor
//   · THE BOX (10 × 10 in front, 24 in deep): its door swings open, the steel box slides out of the slot along the table; on
//     "certificates" its shell turns to clear glass (white rim light) and shows the stack of certificates inside (sheet edges; the
//     same engraved certificate drawing as `shares` on top); a steel rule standing on its foot slides in beside it, its 0 at the
//     box floor; the stack's top is level with 5.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd, Glow, clamp01, ease } from "./kit";
import { Mesher } from "./town_parts";
import { SANSF, HAND, usePropFonts, brushedTex, tileTex, speckTex, sheetEdgeTex } from "./c_tex";
import { CW, CH, certMats, certIndex, certGeo, CSERIF } from "./c_cert";
import { VaultFront } from "./c_vdoor";
export { CW };

export const WALLZ = -1.0;
const CELL = 0.264, Y0 = 0.132, NCOL = 12, X0 = -NCOL * CELL / 2;
const TOPY = Y0 + 8 * CELL;                       // 2.244
export const TT = Y0 + 3 * CELL + 0.003;          // the table top = the target slot's floor (0.927)
export const TCOL = 6;                            // the target column (10-inch section), row 3 (its floor at TT)
export const BOX = { x: X0 + TCOL * CELL + CELL / 2, w: 0.24, h: 0.236, d: 0.56, out: 0.6 };
export const INCH = 0.0254, STACK_H = 5 * INCH, FLOOR_T = 0.004;
// the column sections: door pitch per column (3-inch, 5-inch, 10-inch)
const PITCH = [0.132, 0.132, 0.132, 0.088, 0.088, 0.264, 0.264, 0.264, 0.264, 0.132, 0.132, 0.132];
/** the target box's number (the same plate as on its door) */
const BOXNO = (() => { let k = 0, n0 = 0; for (let c = 0; c < TCOL; c++) k += Math.round((TOPY - Y0) / PITCH[c]); n0 = Math.round((TOPY - Y0) / PITCH[TCOL]); return 1000 + TCOL * 100 + (n0 - 3); })();

// ── textures ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// number plates: an atlas of engraved brass tags (black numbers), 16 × 32 cells
const NA = { W: 2048, H: 2048, cw: 128, ch: 64 };
const numRect = (k) => { const col = k % 16, row = Math.floor(k / 16); return [col * NA.cw / NA.W, 1 - (row + 1) * NA.ch / NA.H, (col + 1) * NA.cw / NA.W, 1 - row * NA.ch / NA.H]; };
const numDraw = (nums) => (c, w, h) => {
  nums.forEach((n, k) => {
    const x = (k % 16) * NA.cw, y = Math.floor(k / 16) * NA.ch;
    // a stamped brass plate: a bevelled edge (lit from the upper left), a brushed face, the number ENGRAVED (dark fill, a bright lip
    // below-right where the cut catches the light), a slotted screw at each end
    const g = c.createLinearGradient(x, y, x, y + NA.ch); g.addColorStop(0, "#EEDDAA"); g.addColorStop(0.45, "#D2B470"); g.addColorStop(1, "#A8873F");
    c.fillStyle = g; c.fillRect(x, y, NA.cw, NA.ch);
    for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(${rnd(i + k) < 0.5 ? "255,245,210" : "90,60,20"},${0.06 + rnd(i * 3 + k) * 0.1})`; c.fillRect(x + 4, y + 4 + rnd(i * 7 + k) * (NA.ch - 8), NA.cw - 8, 1); }
    c.fillStyle = "rgba(255,248,220,0.85)"; c.fillRect(x, y, NA.cw, 3); c.fillRect(x, y, 3, NA.ch);
    c.fillStyle = "rgba(70,48,12,0.85)"; c.fillRect(x, y + NA.ch - 3, NA.cw, 3); c.fillRect(x + NA.cw - 3, y, 3, NA.ch);
    c.strokeStyle = "rgba(90,66,24,0.7)"; c.lineWidth = 1.5; c.strokeRect(x + 6.5, y + 6.5, NA.cw - 13, NA.ch - 13);
    c.font = `700 36px ${CSERIF}`; c.textAlign = "center"; c.textBaseline = "middle";
    if ("letterSpacing" in c) c.letterSpacing = "2px";
    c.fillStyle = "rgba(255,244,205,0.9)"; c.fillText(String(n), x + NA.cw / 2 + 1.4, y + NA.ch / 2 + 3.4);
    c.fillStyle = "#17110A"; c.fillText(String(n), x + NA.cw / 2, y + NA.ch / 2 + 2);
    if ("letterSpacing" in c) c.letterSpacing = "0px";
    [x + 14, x + NA.cw - 14].forEach((sx, i) => {
      const sy = y + NA.ch / 2, gg = c.createRadialGradient(sx - 2, sy - 2, 0, sx, sy, 7); gg.addColorStop(0, "#FFF4D0"); gg.addColorStop(1, "#8A6A2A");
      c.fillStyle = gg; c.beginPath(); c.arc(sx, sy, 6.5, 0, Math.PI * 2); c.fill(); c.strokeStyle = "rgba(60,40,10,0.8)"; c.lineWidth = 1; c.stroke();
      c.save(); c.translate(sx, sy); c.rotate(rnd(k * 2 + i) * Math.PI); c.fillStyle = "#3A2A10"; c.fillRect(-5, -1, 10, 2); c.restore();
    });
  });
};
// THE LOCK FACES (an atlas of two, transparent outside the escutcheon): left = the bank's GUARD lock, right = the RENTER's lock.
// A bevelled brass escutcheon ring, the turning plug (a slightly darker brass disc with its shear line), the keyway cut into it.
export const LOCK = { W: 512, H: 256 };
export const lockRect = (i) => [i * 0.5, 0, i * 0.5 + 0.5, 1];
const lockDraw = (c, w, h) => {
  c.clearRect(0, 0, w, h);
  [0, 1].forEach((i) => {
    const cx = i * 256 + 128, cy = 128;
    // the escutcheon: a domed ring, lit from the upper left
    const rg = c.createLinearGradient(cx - 120, cy - 120, cx + 120, cy + 120); rg.addColorStop(0, "#FFF1C4"); rg.addColorStop(0.45, "#D8B46A"); rg.addColorStop(1, "#7A5A22");
    c.fillStyle = rg; c.beginPath(); c.arc(cx, cy, 124, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "rgba(60,40,10,0.9)"; c.lineWidth = 3; c.stroke();
    c.strokeStyle = "rgba(255,246,214,0.8)"; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, 112, Math.PI * 0.9, Math.PI * 1.7); c.stroke();
    // the recess round the plug (a dark shear gap), then the plug
    c.fillStyle = "#2A1E0C"; c.beginPath(); c.arc(cx, cy, 86, 0, Math.PI * 2); c.fill();
    const pg = c.createRadialGradient(cx - 26, cy - 30, 6, cx, cy, 84); pg.addColorStop(0, "#F2DCA2"); pg.addColorStop(0.7, "#B9944E"); pg.addColorStop(1, "#8C6B2E");
    c.fillStyle = pg; c.beginPath(); c.arc(cx, cy, 80, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 40; k++) { c.strokeStyle = `rgba(${k % 2 ? "255,240,200" : "80,55,20"},0.12)`; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, 8 + k * 1.8, 0, Math.PI * 2); c.stroke(); }
    c.fillStyle = "#0A0703";
    if (i === 0) {
      // guard lock: a lever-lock keyway — a round head over a stepped slot
      c.beginPath(); c.arc(cx, cy - 26, 15, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(cx - 8, cy - 22); c.lineTo(cx + 8, cy - 22); c.lineTo(cx + 8, cy + 6); c.lineTo(cx + 13, cy + 6); c.lineTo(cx + 13, cy + 22); c.lineTo(cx + 5, cy + 22); c.lineTo(cx + 5, cy + 46); c.lineTo(cx - 8, cy + 46); c.closePath(); c.fill();
    } else {
      // renter lock: a flat, wards-cut keyway
      c.beginPath(); c.moveTo(cx - 5, cy - 50);
      [[5, -50], [5, -34], [11, -28], [5, -20], [5, -4], [12, 4], [5, 12], [5, 30], [10, 36], [5, 42], [5, 50], [-5, 50], [-5, 38], [-11, 30], [-5, 24], [-5, 6], [-11, -2], [-5, -10], [-5, -50]].forEach(([dx, dy]) => c.lineTo(cx + dx, cy + dy));
      c.closePath(); c.fill();
    }
    c.fillStyle = "rgba(255,240,200,0.35)"; c.beginPath(); c.arc(cx, cy, 80, Math.PI * 1.05, Math.PI * 1.45); c.lineTo(cx, cy); c.closePath(); c.fill();
  });
};
const signDraw = (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#5D6A7A"); g.addColorStop(1, "#3A4553"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(255,255,255,${0.02 + rnd(i) * 0.04})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 40 + rnd(i) * 120, 1); }
  c.textAlign = "center"; c.textBaseline = "middle"; c.font = `700 ${h * 0.5}px ${CSERIF}`;
  if ("letterSpacing" in c) c.letterSpacing = `${h * 0.18}px`;
  c.fillStyle = "rgba(0,0,0,0.5)"; c.fillText("SAFE DEPOSIT", w / 2 + 3, h / 2 + 4);
  const lg = c.createLinearGradient(0, h * 0.25, 0, h * 0.75); lg.addColorStop(0, "#F4E2AE"); lg.addColorStop(0.5, "#C9A65C"); lg.addColorStop(1, "#8E6E2C");
  c.fillStyle = lg; c.fillText("SAFE DEPOSIT", w / 2, h / 2);
  if ("letterSpacing" in c) c.letterSpacing = "0px";
  c.fillStyle = "#9AA6B4"; c.fillRect(0, 6, w, 4); c.fillRect(0, h - 10, w, 4);
};
// the steel rule: inches with 1/16 graduations, numbered 1–6; 0 sits FLOOR_T above the foot's underside
export const RULER = { w: 0.032, h: 0.17, t: 0.0022 };
const RW = 384, RH = 2048, RPX = RH / RULER.h;
const yOf = (inch) => RH - (FLOOR_T + inch * INCH) * RPX;   // canvas y of a reading (0 sits FLOOR_T above the foot's underside)
// THE STEEL RULE (rev 2026-11-27, Timur: "make the ruler more detailed and more eye-catching"): satin stainless with a cross-grain brush,
// ENGRAVED graduations (each cut a dark groove with a bright lower lip) — 1/16 in on the left edge, 1/8 on the right — numerals 0–6,
// a hanging hole at the top, the maker's generic small print up the middle; the 5-inch line and a small "5 IN" plate in the Bankers
// light blue (their glow comes from rulerGlow, lit as the level line arrives)
const engrave = (c, x, y, w, h) => { c.fillStyle = "rgba(255,255,255,0.75)"; c.fillRect(x, y + 1.2, w, h); c.fillStyle = "#0E1218"; c.fillRect(x, y, w, h); };
const rulerDraw = (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "#AEB9C5"); g.addColorStop(0.18, "#E4EAF0"); g.addColorStop(0.5, "#F4F7FA"); g.addColorStop(0.82, "#DCE3EA"); g.addColorStop(1, "#A4AFBB");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 4200; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "255,255,255" : "40,50,60"},${0.03 + rnd(i + 1) * 0.07})`; c.fillRect(0, rnd(i + 3) * h, w, rnd(i + 4) < 0.85 ? 1 : 2); }
  c.fillStyle = "rgba(255,255,255,0.8)"; c.fillRect(0, 0, 3, h); c.fillRect(w - 3, 0, 3, h); c.fillStyle = "rgba(30,40,50,0.4)"; c.fillRect(3, 0, 2, h); c.fillRect(w - 5, 0, 2, h);
  for (let k = 0; k <= 6 * 16 + 8; k++) {
    const y = yOf(k / 16); if (y < 60) break;
    const L = k % 16 === 0 ? 0.3 : k % 8 === 0 ? 0.22 : k % 4 === 0 ? 0.16 : k % 2 === 0 ? 0.11 : 0.07;
    const th = k % 16 === 0 ? 5 : 3;
    engrave(c, 0, y - th / 2, w * L, th);
    if (k % 2 === 0) { const L2 = k % 16 === 0 ? 0.22 : k % 8 === 0 ? 0.16 : k % 4 === 0 ? 0.12 : 0.08; engrave(c, w - w * L2, y - th / 2, w * L2, th); }
  }
  const mono = `"Liberation Sans", "DejaVu Sans", sans-serif`;
  c.textAlign = "center"; c.textBaseline = "middle";
  for (let n = 0; n <= 6; n++) {
    const y = yOf(n); if (y - w * 0.14 < 200) break;
    const ny = y - w * 0.14; c.font = `700 ${w * 0.17}px ${mono}`; c.fillStyle = "rgba(255,255,255,0.8)"; c.fillText(String(n), w * 0.56 + 1, ny + 1.5); c.fillStyle = "#0E1218"; c.fillText(String(n), w * 0.56, ny);
  }
  // the 5-inch line, inked in the light blue across the full width, and its "5 IN" plate
  const y5 = yOf(5); c.fillStyle = "#4D8ED9"; c.fillRect(0, y5 - 11, w, 22); c.fillStyle = "#B3CEEF"; c.fillRect(0, y5 - 3, w, 6);
  c.fillStyle = "#123E73"; c.fillRect(w * 0.33, y5 + 26, w * 0.44, w * 0.19); c.fillStyle = "#7FB4F2"; c.font = `800 ${w * 0.13}px ${mono}`; c.fillText("5 IN", w * 0.55, y5 + 26 + w * 0.095);
  // the hanging hole near the top: a drilled hole (transparent) with a chamfer ring
  const hy = 120; c.fillStyle = "rgba(60,70,80,0.9)"; c.beginPath(); c.arc(w / 2, hy, 46, 0, Math.PI * 2); c.fill(); c.fillStyle = "rgba(255,255,255,0.9)"; c.beginPath(); c.arc(w / 2, hy, 40, 0, Math.PI * 2); c.fill();
  c.save(); c.globalCompositeOperation = "destination-out"; c.beginPath(); c.arc(w / 2, hy, 34, 0, Math.PI * 2); c.fill(); c.restore();
  // the maker's small print up the middle (generic)
  c.save(); c.translate(w * 0.38, yOf(2.4)); c.rotate(-Math.PI / 2); c.font = `600 ${w * 0.06}px ${mono}`; c.fillStyle = "#1A2028";
  c.fillText("TEMPERED STAINLESS  ·  No. 6  ·  1/16  1/8", 0, 0); c.restore();
  c.save(); c.translate(w * 0.38, yOf(5.75)); c.rotate(-Math.PI / 2); c.font = `700 ${w * 0.06}px ${mono}`; c.fillStyle = "#1A2028"; c.fillText("INCHES", 0, 0); c.restore();
};
/** the glow layer (emissive map): only the 5-inch line and the 5 IN plate */
const rulerGlow = (c, w, h) => {
  c.fillStyle = "#000"; c.fillRect(0, 0, w, h);
  const y5 = yOf(5); c.fillStyle = "#7FB4F2"; c.fillRect(0, y5 - 11, w, 22); c.fillStyle = "#FFFFFF"; c.fillRect(0, y5 - 3, w, 6);
  c.fillStyle = "#7FB4F2"; c.font = `800 ${w * 0.13}px "Liberation Sans", sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("5 IN", w * 0.55, y5 + 26 + w * 0.095);
};
// ── materials ────────────────────────────────────────────────────────────────────────────────────────────────────────
// terrazzo in 1.2 m squares divided by brass strips (the strips catch the ceiling light)
const terrDraw = (c, w, h) => {
  c.fillStyle = "#5C6979"; c.fillRect(0, 0, w, h);
  const fl = ["rgba(232,238,246,0.55)", "rgba(18,24,34,0.55)", "rgba(150,170,196,0.55)", "rgba(206,186,150,0.4)", "rgba(90,104,122,0.6)"];
  for (let i = 0; i < 52000; i++) { c.fillStyle = fl[Math.floor(rnd(i + 11) * fl.length)]; const s = 1 + rnd(i + 5) * 3.2; c.fillRect(rnd(i * 3) * w, rnd(i * 5 + 1) * h, s, s * (0.6 + rnd(i) * 0.9)); }
  for (let i = 0; i < 40; i++) { const x = rnd(i * 7) * w, y = rnd(i * 9) * h, r = 20 + rnd(i) * 70; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, "rgba(255,255,255,0.05)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  // the divider strips on the tile's edges (a polished brass line with a dark joint beside it)
  [0, h - 4].forEach((y) => { c.fillStyle = "#3A2C12"; c.fillRect(0, y, w, 4); }); [0, w - 4].forEach((x) => { c.fillStyle = "#3A2C12"; c.fillRect(x, 0, 4, h); });
  c.fillStyle = "#D9B86C"; c.fillRect(0, 1, w, 2); c.fillRect(1, 0, 2, h);
};
const useVaultMats = () => useMemo(() => {
  const nums = []; for (let c = 0; c < NCOL; c++) { const n = Math.round((TOPY - Y0) / PITCH[c]); for (let r = 0; r < n; r++) nums.push(1000 + c * 100 + (n - r)); }
  const bTex = brushedTex("vbrass2", "#C8A866", [1, 1]);
  const brass = new THREE.MeshStandardMaterial({ map: bTex, bumpMap: bTex, bumpScale: 0.12, color: "#FFFFFF", metalness: 0.9, roughness: 0.27, vertexColors: true });
  const sTex = brushedTex("vsteel", "#8C98A6", [2, 2], true);
  const steel = new THREE.MeshStandardMaterial({ map: sTex, color: "#FFFFFF", metalness: 0.8, roughness: 0.3, vertexColors: true });
  const plate = new THREE.MeshStandardMaterial({ map: canvasTex("c_v_nums2", NA.W, NA.H, numDraw(nums)), metalness: 0.55, roughness: 0.38, color: "#FFFFFF" }); plate.userData.cast = false;
  const lock = new THREE.MeshStandardMaterial({ map: canvasTex("c_v_locks", LOCK.W, LOCK.H, lockDraw), metalness: 0.75, roughness: 0.3, color: "#FFFFFF", alphaTest: 0.5, transparent: false }); lock.userData.cast = false;
  const dark = new THREE.MeshStandardMaterial({ color: "#0B0D12", roughness: 0.6, vertexColors: true }); dark.userData.cast = false;
  const terr = tileTex("vterrazzo2", 1024, 1024, terrDraw, true, [9 / 1.2, 5.2 / 1.2]);
  return {
    brass, steel, plate, lock, dark, nums,
    floor: new THREE.MeshPhysicalMaterial({ map: terr, roughness: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.08, color: "#FFFFFF" }),
    tableTop: new THREE.MeshStandardMaterial({ map: brushedTex("vtable", "#A9B4C0", [1.5, 1]), color: "#FFFFFF", metalness: 0.85, roughness: 0.22 }),
    tableBase: new THREE.MeshStandardMaterial({ color: "#2E3744", metalness: 0.6, roughness: 0.45 }),
    wallPaint: new THREE.MeshStandardMaterial({ color: "#2A3A52", roughness: 0.8 }),
    mat: new THREE.MeshStandardMaterial({ map: tileTex("vmat", 256, 256, (c, w, h) => { c.fillStyle = "#2B3530"; c.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "120,140,130" : "0,0,0"},${0.05 + rnd(i + 1) * 0.08})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2, 2); } c.strokeStyle = "rgba(160,180,170,0.18)"; c.lineWidth = 1; for (let x = 0; x < w; x += 16) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } }, true, [2, 2]), roughness: 0.85, color: "#FFFFFF" }),
  };
}, []);
// ── the wall of boxes (merged) ───────────────────────────────────────────────────────────────────────────────────────
/** one safe-deposit door's hardware on its leaf (door-local: centre (cx, cy), face plane zF), shared by the wall and the moving door */
const doorHardware = (m, cx, cy, dw, dh, zF, rect, seed = 0) => {
  // the leaf's raised border (a stamped frame 9 mm in from the edge: bright on the top/left, shaded on the bottom/right)
  const bi = 0.009, bt = 0.0028;
  m.box("brass", [cx, cy + dh / 2 - bi, zF + 0.0012], [dw - 2 * bi, bt, 0.0018], "#F0DCA8");
  m.box("brass", [cx, cy - dh / 2 + bi, zF + 0.0012], [dw - 2 * bi, bt, 0.0018], "#8F7440");
  m.box("brass", [cx - dw / 2 + bi, cy, zF + 0.0012], [bt, dh - 2 * bi, 0.0018], "#E4CC92");
  m.box("brass", [cx + dw / 2 - bi, cy, zF + 0.0012], [bt, dh - 2 * bi, 0.0018], "#9A7E46");
  // the number plate (upper middle)
  const ph = Math.min(0.024, dh * 0.22), py = cy + dh / 2 - ph / 2 - Math.min(0.02, dh * 0.15);
  m.box("brass", [cx, py, zF + 0.0009], [ph * 2 + 0.003, ph + 0.003, 0.0012], "#7A6232");
  m.quad("plate", [cx, py, zF + 0.0017], ph * 2, ph, "#FFFFFF", rect);
  // the two locks (guard left, renter right): a turned escutcheon standing 4 mm proud, its face from the lock atlas
  const kr = Math.min(0.0125, dh * 0.15), ky = dh > 0.1 ? cy - dh * 0.1 : cy - dh * 0.2, kx = Math.min(0.036, dw * 0.15);
  [-1, 1].forEach((s, i) => {
    m.cyl("brass", [cx + s * kx, ky, zF + 0.002], kr * 1.08, 0.004, "#E6CE96", { r: [Math.PI / 2, 0, 0], seg: 20 });
    m.quad("lock", [cx + s * kx, ky, zF + 0.0041], kr * 2.1, kr * 2.1, "#FFFFFF", lockRect(i), { r: [0, 0, (rnd(seed * 3 + i) - 0.5) * 0.3] });
  });
  // the hinge on the left edge: knuckles with gaps, a pin cap top and bottom
  const nk = dh > 0.1 ? 3 : 2, kh = Math.min(0.05, dh * 0.22), span = dh * 0.62;
  for (let j = 0; j < nk; j++) {
    const yy = cy - span / 2 + (span * j) / (nk - 1);
    m.cyl("steel", [cx - dw / 2 - 0.0005, yy, zF + 0.002], 0.0042, kh, "#D2C6A6", { seg: 10 });
    m.cyl("steel", [cx - dw / 2 - 0.0005, yy + kh / 2 + 0.0012, zF + 0.002], 0.0026, 0.0024, "#EDE4CC", { seg: 8 });
    m.cyl("steel", [cx - dw / 2 - 0.0005, yy - kh / 2 - 0.0012, zF + 0.002], 0.0026, 0.0024, "#EDE4CC", { seg: 8 });
  }
};
const buildWall = (M) => {
  const m = new Mesher();
  const zF = WALLZ;   // door face plane
  let k = 0;
  for (let c = 0; c < NCOL; c++) {
    const x0 = X0 + c * CELL, p = PITCH[c], n = Math.round((TOPY - Y0) / p);
    for (let r = 0; r < n; r++) {
      const y0 = Y0 + r * p, cx = x0 + CELL / 2, cy = y0 + p / 2;
      const isTarget = c === TCOL && r === 3;
      const rect = numRect(k); k++;
      // the opening's frame bezel: a bright chamfered lip round every opening, 5 mm proud of the doors
      const bz = zF + 0.0045;
      m.box("steel", [cx, y0 + p - 0.0042, bz], [CELL - 0.004, 0.0036, 0.003], "#F2F5F8");
      m.box("steel", [cx, y0 + 0.0042, bz], [CELL - 0.004, 0.0036, 0.003], "#8D96A2");
      m.box("steel", [x0 + 0.0062, cy, bz], [0.0036, p - 0.008, 0.003], "#E6EAEF");
      m.box("steel", [x0 + CELL - 0.0062, cy, bz], [0.0036, p - 0.008, 0.003], "#9EA7B2");
      if (isTarget) continue;   // its door and box are separate (they move)
      const dw = CELL - 0.016, dh = p - 0.016;
      const tint = ["#FFFFFF", "#F4EEE2", "#FBF6EC", "#EDE6D6", "#F7F0DE"][Math.floor(rnd(c * 31 + r) * 5)];
      m.box("brass", [cx, cy, zF - 0.005], [dw, dh, 0.01], tint);
      doorHardware(m, cx, cy, dw, dh, zF, rect, c * 40 + r);
    }
    // the steel grid: a vertical stile at each column edge, a rail at each row boundary (they stand proud of the doors)
    m.box("steel", [x0, (Y0 + TOPY) / 2, zF - 0.28], [0.008, TOPY - Y0, 0.57], "#FFFFFF");
    for (let r = 0; r <= n; r++) m.box("steel", [x0 + CELL / 2, Y0 + r * p, zF - 0.28], [CELL, 0.006, 0.57], "#FFFFFF");
  }
  m.box("steel", [X0 + NCOL * CELL, (Y0 + TOPY) / 2, zF - 0.28], [0.008, TOPY - Y0, 0.57], "#FFFFFF");
  // the section dividers (heavier stiles where the door sizes change) with a row of rivets
  [3, 5, 9].forEach((c) => {
    const x = X0 + c * CELL;
    m.box("steel", [x, (Y0 + TOPY) / 2, zF + 0.004], [0.016, TOPY - Y0, 0.008], "#C8D0DA");
    for (let y = Y0 + 0.06; y < TOPY; y += 0.12) m.sph("steel", [x, y, zF + 0.0085], 0.0032, "#EEF2F6", { seg: 8 });
  });
  // plinth (a kick plate) and cornice, pilasters at the ends, the back of the cabinet (dark) and the wall around it
  m.box("steel", [0, Y0 / 2, zF - 0.02], [NCOL * CELL + 0.12, Y0, 0.06], "#AEB8C4");
  m.box("steel", [0, Y0 - 0.008, zF + 0.012], [NCOL * CELL + 0.12, 0.016, 0.012], "#E2E8EE");
  m.box("steel", [0, TOPY + 0.015, zF - 0.02], [NCOL * CELL + 0.16, 0.03, 0.08], "#D0D8E2");
  m.box("steel", [0, TOPY + 0.034, zF + 0.022], [NCOL * CELL + 0.16, 0.008, 0.012], "#F2F5F8");
  m.box("steel", [0, TOPY + 0.3, zF - 0.02], [NCOL * CELL + 0.2, 0.04, 0.09], "#D0D8E2");
  m.box("steel", [0, TOPY + 0.322, zF + 0.026], [NCOL * CELL + 0.2, 0.008, 0.012], "#F2F5F8");
  [-1, 1].forEach((s) => {
    m.box("steel", [s * (NCOL * CELL / 2 + 0.05), (Y0 + TOPY) / 2 + 0.08, zF - 0.02], [0.1, TOPY + 0.16, 0.07], "#AEB8C4");
    for (let y = 0.2; y < TOPY + 0.2; y += 0.25) m.cyl("steel", [s * (NCOL * CELL / 2 + 0.05), y, zF + 0.016], 0.006, 0.004, "#EEF2F6", { r: [Math.PI / 2, 0, 0], seg: 10 });
  });
  m.box("dark", [0, (Y0 + TOPY) / 2, zF - 0.6], [NCOL * CELL, TOPY - Y0, 0.02], "#FFFFFF");
  return m;
};
const Wall = ({ M }) => {
  const grp = useMemo(() => buildWall(M).build({ brass: M.brass, steel: M.steel, plate: M.plate, lock: M.lock, dark: M.dark }), [M]);
  const sign = useMemo(() => canvasTex("c_v_sign", 2048, 256, signDraw), []);
  return (
    <group>
      <primitive object={grp} />
      <mesh position={[0, TOPY + 0.165, WALLZ + 0.026]}><planeGeometry args={[NCOL * CELL * 0.62, 0.24]} /><meshStandardMaterial map={sign} metalness={0.6} roughness={0.35} /></mesh>
      {/* the room: walls either side of the bank of boxes, the ceiling's soffit, the floor */}
      <mesh position={[0, 1.6, WALLZ - 0.62]}><planeGeometry args={[12, 3.2]} /><meshStandardMaterial color="#1F2C40" roughness={0.85} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 3.4, 1.6, WALLZ - 0.05]}><boxGeometry args={[3.4, 3.2, 0.1]} /><meshStandardMaterial color="#26354C" roughness={0.85} /></mesh>)}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 1.5]} receiveShadow material={M.floor}><planeGeometry args={[9, 5.2]} /></mesh>
    </group>
  );
};
// ── the viewing table ────────────────────────────────────────────────────────────────────────────────────────────────
export const TABLE = { x0: -0.62, x1: 0.82, z0: WALLZ + 0.005, z1: WALLZ + 1.0 };   // rev 2026-11-28: 0.72 → 1.0 deep (the inventory lies in front of the box)
const Table = ({ M }) => {
  const w = TABLE.x1 - TABLE.x0, d = TABLE.z1 - TABLE.z0, cx = (TABLE.x0 + TABLE.x1) / 2, cz = (TABLE.z0 + TABLE.z1) / 2;
  return (
    <group>
      <mesh position={[cx, TT - 0.015, cz]} material={M.tableTop} castShadow receiveShadow><boxGeometry args={[w, 0.03, d]} /></mesh>
      <mesh position={[cx, TT - 0.034, cz]} material={M.tableBase}><boxGeometry args={[w - 0.04, 0.012, d - 0.04]} /></mesh>
      {/* an apron, four square steel legs with levelling feet, a low stretcher shelf */}
      <mesh position={[cx, TT - 0.075, cz]} material={M.tableBase} castShadow><boxGeometry args={[w - 0.06, 0.08, d - 0.06]} /></mesh>
      {[[TABLE.x0 + 0.05, TABLE.z0 + 0.05], [TABLE.x1 - 0.05, TABLE.z0 + 0.05], [TABLE.x0 + 0.05, TABLE.z1 - 0.05], [TABLE.x1 - 0.05, TABLE.z1 - 0.05]].map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x, (TT - 0.1) / 2 + 0.01, z]} material={M.tableTop} castShadow><boxGeometry args={[0.045, TT - 0.1, 0.045]} /></mesh>
          <mesh position={[x, 0.006, z]}><cylinderGeometry args={[0.022, 0.026, 0.012, 16]} /><meshStandardMaterial color="#20262E" roughness={0.6} /></mesh>
        </group>
      ))}
      <mesh position={[cx, 0.16, cz]} material={M.tableTop} castShadow receiveShadow><boxGeometry args={[w - 0.12, 0.018, d - 0.12]} /></mesh>
      {/* the rolled (bullnose) front edge and the drip lip under it */}
      <mesh position={[cx, TT - 0.015, TABLE.z1]} rotation-z={Math.PI / 2} material={M.tableTop} castShadow><cylinderGeometry args={[0.0155, 0.0155, w, 20]} /></mesh>
      {[TABLE.x0, TABLE.x1].map((x, i) => <mesh key={i} position={[x, TT - 0.015, TABLE.z1]} material={M.tableTop}><sphereGeometry args={[0.0155, 16, 12]} /></mesh>)}
      {/* a cork-backed rubber counting mat at the far end, with a pen on its bead chain and a stack of envelopes (blank) */}
      <mesh position={[-0.37, TT + 0.0025, WALLZ + 0.37]} receiveShadow castShadow material={M.mat}><boxGeometry args={[0.4, 0.005, 0.52]} /></mesh>
      <group position={[-0.5, TT + 0.005, WALLZ + 0.24]}>
        <mesh position={[0, 0.012, 0]} castShadow><cylinderGeometry args={[0.022, 0.026, 0.024, 20]} /><meshStandardMaterial color="#1E2630" metalness={0.6} roughness={0.35} /></mesh>
        <mesh position={[0.012, 0.055, 0.004]} rotation-z={-0.35} castShadow><cylinderGeometry args={[0.004, 0.004, 0.13, 10]} /><meshStandardMaterial color="#1B1F26" roughness={0.3} metalness={0.3} /></mesh>
        <mesh position={[0.035, 0.115, 0.004]} rotation-z={-0.35}><cylinderGeometry args={[0.0042, 0.0042, 0.02, 10]} /><meshStandardMaterial color="#C8D0DA" metalness={0.9} roughness={0.2} /></mesh>
        {Array.from({ length: 14 }, (_, i) => <mesh key={i} position={[-0.004 - i * 0.006, 0.006 + 0.004 * Math.sin(i * 0.5), 0.018 + i * 0.0045]}><sphereGeometry args={[0.0018, 6, 4]} /><meshStandardMaterial color="#C8D0DA" metalness={0.9} roughness={0.25} /></mesh>)}
      </group>
      <group position={[-0.36, TT + 0.005, WALLZ + 0.5]} rotation-y={0.12}>
        {[0, 1, 2, 3].map((i) => <mesh key={i} position={[(rnd(i) - 0.5) * 0.006, 0.0012 + i * 0.0014, (rnd(i + 3) - 0.5) * 0.006]} rotation-y={(rnd(i + 5) - 0.5) * 0.06} castShadow receiveShadow><boxGeometry args={[0.24, 0.0013, 0.105]} /><meshStandardMaterial color={i % 2 ? "#E9E3D2" : "#EFEADB"} roughness={0.9} /></mesh>)}
      </group>
    </group>
  );
};
// ── the box: door, steel shell (→ glass), the certificates, the handle ───────────────────────────────────────────────
const Door = ({ M, open }) => {
  const p = PITCH[TCOL], dw = CELL - 0.016, dh = p - 0.016, cy = Y0 + 3 * p + p / 2, x0 = X0 + TCOL * CELL;
  const grp = useMemo(() => {
    let k = 0; for (let c = 0; c < TCOL; c++) k += Math.round((TOPY - Y0) / PITCH[c]); k += 3;
    const m = new Mesher();
    m.box("brass", [dw / 2, 0, -0.005], [dw, dh, 0.01], "#FFFFFF");
    doorHardware(m, dw / 2, 0, dw, dh, 0, numRect(k), 77);
    // its inner face: the bare steel back of the leaf and the lock cases (seen as it swings open)
    m.box("steel", [dw / 2, 0, -0.0105], [dw - 0.01, dh - 0.01, 0.001], "#7E8894");
    [-1, 1].forEach((s) => m.box("steel", [dw / 2 + s * Math.min(0.036, dw * 0.15), -dh * 0.1, -0.024], [0.05, 0.06, 0.026], "#A9B2BC"));
    return m.build({ brass: M.brass, steel: M.steel, plate: M.plate, lock: M.lock, dark: M.dark });
  }, [M]);
  return (
    <group position={[x0 + 0.008, cy, WALLZ]} rotation-y={-1.85 * open}>
      <primitive object={grp} />
    </group>
  );
};
// the stack: 26 bundles of certificates (sheet edges on the sides, slightly out of true), the top certificate face up
const Stack = () => {
  const n = 26, th = STACK_H / n;
  const parts = useMemo(() => {
    const edge = sheetEdgeTex("vstack", 96, [1, 1]);
    const side = new THREE.MeshStandardMaterial({ map: edge, roughness: 0.9, color: "#C9C2B2" });
    const top = new THREE.MeshStandardMaterial({ color: "#CFC9BB", roughness: 0.9 });
    const faces = [side, side, top, top, side, side];
    const pg = certMats(certIndex("pg"));
    return { geo: new THREE.BoxGeometry(CH, th * 0.985, CW), faces, pg, top: certGeo(0.0006) };
  }, []);
  return (
    <group>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} geometry={parts.geo} material={parts.faces} position={[(rnd(i * 3) - 0.5) * 0.006, FLOOR_T + th * (i + 0.5), (rnd(i * 5) - 0.5) * 0.006]} rotation-y={(rnd(i * 7) - 0.5) * 0.03} castShadow receiveShadow />
      ))}
      {/* the top certificate, its face up (turned to read from the box's front) */}
      <mesh position={[0.001, FLOOR_T + STACK_H + 0.0004, 0]} rotation-y={Math.PI / 2 + 0.012} material={parts.pg} geometry={parts.top} castShadow />
    </group>
  );
};
export const STACK_Z = BOX.d / 2 - 0.035 - CW / 2;   // the stack's centre along the box (box-local), toward its front
/** the box's pose: slide k ∈ [0,1] → its centre (station-local) */
export const boxCentre = (k) => [BOX.x, TT, WALLZ - 0.024 - BOX.d / 2 + BOX.out * k];
const Box = ({ slide, glass, flash }) => {
  const shell = useMemo(() => new THREE.MeshPhysicalMaterial({ map: brushedTex("vbox", "#7F8B98", [1, 1]), color: "#FFFFFF", metalness: 0.8, roughness: 0.3, clearcoat: 0, transparent: false }), []);
  const front = useMemo(() => new THREE.MeshPhysicalMaterial({ map: brushedTex("vboxf", "#8C97A4", [1, 1], true), color: "#FFFFFF", metalness: 0.8, roughness: 0.28 }), []);
  const label = useMemo(() => new THREE.MeshStandardMaterial({ map: canvasTex("c_v_boxlabel", 512, 220, (c, w, h) => {
    c.fillStyle = "#F1EEE4"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(120,110,90,${0.03 + rnd(i) * 0.04})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
    c.fillStyle = "#1E2A3A"; c.textAlign = "center"; c.font = `700 40px ${CSERIF}`; if ("letterSpacing" in c) c.letterSpacing = "6px"; c.fillText("SAFE DEPOSIT", w / 2, 66); if ("letterSpacing" in c) c.letterSpacing = "0px";
    c.fillRect(60, 86, w - 120, 2); c.font = `700 92px ${CSERIF}`; c.fillText(String(BOXNO), w / 2, 184);
  }), roughness: 0.8, color: "#FFFFFF", transparent: true }), []);
  label.opacity = 1 - glass; label.depthWrite = glass < 0.5;
  const edges = useMemo(() => {
    const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(BOX.w, BOX.h, BOX.d));
    const lid = new THREE.EdgesGeometry(new THREE.BoxGeometry(BOX.w, 0.006, BOX.d - 0.01));
    return { g, lid, m: new THREE.LineBasicMaterial({ color: "#FFFFFF", transparent: true, opacity: 0, toneMapped: false, depthWrite: false }) };
  }, []);
  // the glass reveal: the steel's opacity falls as a pale-blue glass rises; edges flash white then hold a pale rim
  [shell, front].forEach((m) => {
    m.transparent = glass > 0.001; m.depthWrite = glass < 0.5;
    m.opacity = 1 - 0.9 * glass; m.metalness = 0.8 * (1 - glass); m.roughness = 0.3 - 0.25 * glass;
    m.color.set("#FFFFFF").lerp(new THREE.Color("#CFE4FA"), glass); m.clearcoat = glass;
    m.emissive = m.emissive || new THREE.Color(); m.emissive.set("#B3CEEF"); m.emissiveIntensity = 0.12 * glass + 0.5 * flash;
  });
  edges.m.opacity = clamp01(0.16 * glass + 0.9 * flash);   // rev 2026-11-28: the rim flashes, then holds faint (no stray white lines)
  const T = 0.003, w = BOX.w, h = BOX.h, d = BOX.d;
  const c = boxCentre(slide);
  return (
    <group position={c}>
      {/* the shell: floor, two sides, back, the front (with the handle), the hinged lid */}
      <mesh position={[0, FLOOR_T / 2, 0]} material={shell} castShadow={glass < 0.5} receiveShadow><boxGeometry args={[w, FLOOR_T, d]} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * (w / 2 - T / 2), h / 2, 0]} material={shell} castShadow={glass < 0.5} receiveShadow><boxGeometry args={[T, h - 0.006, d]} /></mesh>)}
      <mesh position={[0, h / 2, -d / 2 + T / 2]} material={shell} castShadow={glass < 0.5}><boxGeometry args={[w, h - 0.006, T]} /></mesh>
      <mesh position={[0, h / 2, d / 2 - T]} material={front} castShadow={glass < 0.5} renderOrder={4}><boxGeometry args={[w, h - 0.006, 2 * T]} /></mesh>
      <mesh position={[0, h - 0.003, 0]} material={shell} castShadow={glass < 0.5} renderOrder={4}><boxGeometry args={[w + 0.002, 0.004, d - 0.01]} /></mesh>
      {/* the folding handle on the front and its two pivots, and the label holder */}
      <group position={[0, h * 0.62, d / 2 + 0.002]}>
        <mesh rotation-z={Math.PI / 2} position={[0, 0, 0.012]}><cylinderGeometry args={[0.004, 0.004, 0.09, 10]} /><meshStandardMaterial color="#C8D0DA" metalness={0.9} roughness={0.25} transparent opacity={1 - 0.7 * glass} /></mesh>
        {[-1, 1].map((s) => <mesh key={s} position={[s * 0.045, 0, 0.006]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.005, 0.005, 0.014, 10]} /><meshStandardMaterial color="#C8D0DA" metalness={0.9} roughness={0.25} transparent opacity={1 - 0.7 * glass} /></mesh>)}
      </group>
      {/* the lid: a piano hinge across it (the front half lifts), a turned-down front lip; rolled edges along the sides */}
      <mesh position={[0, h + 0.0015, -0.04]} rotation-z={Math.PI / 2} material={shell}><cylinderGeometry args={[0.0035, 0.0035, w - 0.006, 10]} /></mesh>
      <mesh position={[0, h - 0.007, d / 2 - 0.004]} material={shell} renderOrder={4}><boxGeometry args={[w + 0.002, 0.012, 0.0025]} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * (w / 2), h - 0.004, 0]} rotation-x={Math.PI / 2} material={shell}><cylinderGeometry args={[0.0032, 0.0032, d - 0.01, 8]} /></mesh>)}
      {/* the label holder on the front: a folded steel frame and its card (the box's number) */}
      <group position={[0, h * 0.3, d / 2 + 0.0008]}>
        <mesh material={label} renderOrder={5}><planeGeometry args={[0.07, 0.03]} /></mesh>
        {[[0, 0.0165, 0.078, 0.004], [0, -0.0165, 0.078, 0.004]].map(([x, y, L, t], i) => <mesh key={i} position={[x, y, 0.001]} material={front}><boxGeometry args={[L, t, 0.002]} /></mesh>)}
        {[-1, 1].map((s) => <mesh key={s} position={[s * 0.038, 0, 0.001]} material={front}><boxGeometry args={[0.004, 0.037, 0.002]} /></mesh>)}
      </group>
      <lineSegments geometry={edges.g} material={edges.m} position={[0, h / 2, 0]} renderOrder={6} />
      <Stack />
      {flash > 0.01 && <Glow position={[0, h * 0.6, d / 2]} size={0.45} color="#FFFFFF" opacity={0.45 * flash} />}
    </group>
  );
};
// ── the steel rule on its foot ───────────────────────────────────────────────────────────────────────────────────────
// the rule stands just outside the glass, in line with the stack's FRONT face (so the level line runs straight along x)
// rev 2026-11-28 (integrator: the vault ends looking down on the top certificate from the box's +x side, its name across the frame):
//   the rule now stands at the box's +x side level with the stack's MIDDLE, its face turned to +x (that view); it slides in from the side
export const rulerPos = (k) => [BOX.x + BOX.w / 2 + 0.022 + 0.5 * (1 - k), TT, boxCentre(1)[2]];
const Ruler = ({ k, ready, level = 0 }) => {
  const tex = useMemo(() => (ready ? canvasTex("c_v_ruler2", RW, RH, rulerDraw) : null), [ready]);
  const glow = useMemo(() => (ready ? canvasTex("c_v_ruler2g", RW, RH, rulerGlow) : null), [ready]);
  const mats = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: "#C9D2DC", metalness: 0.92, roughness: 0.18 });
    const face = new THREE.MeshPhysicalMaterial({ map: tex, emissiveMap: glow, emissive: glow ? "#FFFFFF" : "#000000", emissiveIntensity: 0.3, color: tex ? "#FFFFFF" : "#C9D2DC", metalness: 0.62, roughness: 0.24, clearcoat: 0.6, clearcoatRoughness: 0.12, alphaTest: 0.5, transparent: false });
    const back = new THREE.MeshStandardMaterial({ map: tex, color: "#B9C3CE", metalness: 0.85, roughness: 0.25, alphaTest: 0.5 });
    return [edge, edge, edge, edge, face, back];
  }, [tex, glow]);
  mats[4].emissiveIntensity = 0.25 + 1.6 * level;
  const p = rulerPos(k), y5 = FLOOR_T + 5 * INCH;
  return (
    <group position={p} rotation-y={Math.PI / 2}>   {/* rev 2026-11-28: its face to +x, the camera's side at the end */}
      <mesh position={[0, RULER.h / 2, 0]} material={mats} castShadow><boxGeometry args={[RULER.w, RULER.h, RULER.t]} /></mesh>
      {/* bright chamfers down both long edges */}
      {[-1, 1].map((s) => <mesh key={s} position={[s * (RULER.w / 2), RULER.h / 2, 0]} rotation-y={Math.PI / 4}><boxGeometry args={[0.0011, RULER.h, 0.0011]} /><meshStandardMaterial color="#F2F6FA" metalness={0.95} roughness={0.1} /></mesh>)}
      {/* the foot: a machined base block the rule stands in (its height is the box floor's thickness), a clamp jaw, a knurled thumbscrew */}
      <mesh position={[0, FLOOR_T / 2, 0]} castShadow receiveShadow><boxGeometry args={[0.056, FLOOR_T, 0.036]} /><meshStandardMaterial color="#4F5B6A" metalness={0.85} roughness={0.28} /></mesh>
      <mesh position={[0, FLOOR_T - 0.0005, 0.0185]}><boxGeometry args={[0.056, 0.001, 0.001]} /><meshStandardMaterial color="#DDE4EA" metalness={0.95} roughness={0.12} /></mesh>
      <mesh position={[0, FLOOR_T + 0.007, -0.0045]} castShadow><boxGeometry args={[0.04, 0.014, 0.007]} /><meshStandardMaterial color="#5A6676" metalness={0.85} roughness={0.28} /></mesh>
      <mesh position={[0, FLOOR_T + 0.007, 0.004]} castShadow><boxGeometry args={[0.04, 0.014, 0.0045]} /><meshStandardMaterial color="#5A6676" metalness={0.85} roughness={0.28} /></mesh>
      <group position={[0.014, FLOOR_T + 0.007, 0.012]} rotation-x={Math.PI / 2}>
        <mesh><cylinderGeometry args={[0.0018, 0.0018, 0.012, 10]} /><meshStandardMaterial color="#C8D0DA" metalness={0.9} roughness={0.2} /></mesh>
        <mesh position={[0, 0.008, 0]}><cylinderGeometry args={[0.0055, 0.0055, 0.004, 18]} /><meshStandardMaterial color="#AEB8C4" metalness={0.9} roughness={0.35} /></mesh>
      </group>
      {/* the 5-inch mark's light: a small glow at its edge, brightening as the level line arrives */}
      {level > 0.01 && <Glow position={[-RULER.w * 0.5, y5, 0.003]} size={0.05} color="#B3CEEF" opacity={0.4 * level} />}
    </group>
  );
};
/** the 5-inch level: a pale-blue line from the stack's top edge to the rule's 5 */
const Level = ({ k }) => {
  if (k <= 0.001) return null;
  const y = TT + FLOOR_T + STACK_H, b = boxCentre(1), r = rulerPos(1);
  const x0 = b[0] - CH / 2 - 0.004, x1 = r[0] - RULER.w * 0.3, z = r[2] + 0.002;
  const L = (x1 - x0) * k;
  return (
    <group>
      <mesh position={[x0 + L / 2, y, z]} renderOrder={7}><boxGeometry args={[L, 0.0026, 0.0026]} /><meshBasicMaterial color="#DCEBFC" toneMapped={false} /></mesh>
      <mesh position={[x0 + L / 2, y, z]} renderOrder={7}><boxGeometry args={[L, 0.008, 0.002]} /><meshBasicMaterial color="#7FB4F2" transparent opacity={0.35} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      <Glow position={[x0 + L, y, z]} size={0.06} color="#B3CEEF" opacity={0.9 * (1 - ease(k, 0.95, 1))} />
    </group>
  );
};
// ── THE ESTATE INVENTORY (rev 2026-11-28, style rule 11: "at least 95 stocks" lives on the object that would carry it) ─────────────
//   A typed estate inventory sheet lying on the viewing table in front of the box: SCHEDULE B — STOCKS, the WSJ-named holdings typed
//   one per line (names as at his death, June 2014), "(continued)"; on "95 stocks." the appraiser's pencil writes the count in the
//   blank — "95" — and rings it (a wipe through its own texture). No person's name, no values, no share counts.
export const INV = { x: 0.45, z: WALLZ + 0.55, ry: 0.06, w: 0.21, d: 0.297 };   // to the box's right front: it stays in frame as the camera arcs round to the +x side
const IW = 1240, IH = 1754;
const TYPE = `"Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`;
const invDraw = (c, w, h) => {
  c.fillStyle = "#F3F0E6"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(110,100,80,${0.015 + rnd(i) * 0.03})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  const ink = "#1C222C"; c.fillStyle = ink; c.textAlign = "center";
  c.font = `700 52px ${TYPE}`; c.fillText("INVENTORY OF ESTATE", w / 2, 150);
  c.font = `400 34px ${TYPE}`; c.fillText("SCHEDULE B  -  STOCKS AND BONDS", w / 2, 210);
  c.fillRect(110, 244, w - 220, 3);
  c.textAlign = "left"; c.font = `400 30px ${TYPE}`;
  c.fillText("Securities owned by the decedent at the", 110, 300); c.fillText("date of death, by name of issuer.", 110, 340);
  // the summary the pencil fills in (left blank in type)
  c.font = `700 34px ${TYPE}`; c.fillText("NUMBER OF STOCKS HELD:", 110, 440); c.fillRect(640, 448, 330, 2.5);
  c.fillRect(110, 500, w - 220, 2);
  c.font = `700 28px ${TYPE}`; c.fillText("ITEM", 110, 560); c.fillText("DESCRIPTION", 250, 560); c.fillRect(110, 576, w - 220, 2);
  const rows = ["The Procter & Gamble Company", "JPMorgan Chase & Co.", "General Electric Company", "The Dow Chemical Company", "The J. M. Smucker Company", "CVS Caremark Corporation", "Johnson & Johnson"];
  c.font = `400 34px ${TYPE}`;
  rows.forEach((r, i) => { const y = 640 + i * 70; c.fillText(String(i + 1) + ".", 120, y); c.fillText(r, 250, y); c.font = `400 26px ${TYPE}`; c.fillText("common stock", 250, y + 30); c.font = `400 34px ${TYPE}`; });
  c.font = `italic 400 30px ${TYPE}`; c.fillText("(continued)", 250, 640 + rows.length * 70 + 10);
  c.fillRect(110, 1220, w - 220, 2);
  c.font = `400 26px ${TYPE}`; c.fillText("Certificates held in safe deposit box", 110, 1290); c.fillText("at the bank; see Schedule B-1.", 110, 1328);
  c.fillRect(110, h - 150, w - 220, 2);
  c.font = `400 24px ${TYPE}`; c.fillText("Page 1", 110, h - 100); c.textAlign = "right"; c.fillText("Schedule B", w - 110, h - 100);
};
const INK95 = { r: [600, 310, 470, 230] };   // the pencil's rect on the sheet (canvas px): "95" in the blank, ringed
const ink95Draw = (c) => {
  const [rx, ry] = INK95.r, gr = "rgba(46,52,62,0.9)";
  c.save(); c.translate(-rx, -ry);
  c.font = `700 150px "${HAND}"`; c.fillStyle = gr; c.textAlign = "center"; c.fillText("95", 805, 436);
  c.strokeStyle = gr; c.lineWidth = 7; c.lineCap = "round";
  c.beginPath(); c.ellipse(805, 390, 150, 82, -0.08, Math.PI * 0.95, Math.PI * 0.95 + Math.PI * 2.08); c.stroke();
  c.restore();
};
const Inventory = ({ ready, write }) => {
  const tex = useMemo(() => (ready ? canvasTex("c_v_inventory", IW, IH, invDraw) : null), [ready]);
  const ink = useMemo(() => { if (!ready) return null; const [, , rw, rh] = INK95.r; const t = canvasTex("c_v_inv95", rw, rh, (c) => { c.clearRect(0, 0, rw, rh); ink95Draw(c); }).clone(); t.wrapS = THREE.ClampToEdgeWrapping; t.needsUpdate = true; return t; }, [ready]);
  const mats = useMemo(() => { const e = new THREE.MeshStandardMaterial({ color: "#E6E2D6", roughness: 0.9 }); return [e, e, new THREE.MeshStandardMaterial({ map: tex, color: tex ? "#FFFFFF" : "#EEEBE2", roughness: 0.85 }), e, e, e]; }, [tex]);
  const inkM = useMemo(() => new THREE.MeshStandardMaterial({ map: ink, transparent: true, depthWrite: false, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 }), [ink]);
  const [rx, ry, rw, rh] = INK95.r, k = clamp01(write);
  const pw = (rw / IW) * INV.w, pd = (rh / IH) * INV.d, cx = ((rx + rw / 2) / IW - 0.5) * INV.w, cz = ((ry + rh / 2) / IH - 0.5) * INV.d;
  if (ink) ink.repeat.set(Math.max(1e-3, k), 1);
  return (
    <group position={[INV.x, TT, INV.z]} rotation-y={INV.ry}>
      <mesh position={[0, 0.0006, 0]} material={mats} castShadow receiveShadow><boxGeometry args={[INV.w, 0.0008, INV.d]} /></mesh>
      {ink && k > 0.001 && (
        <mesh position={[cx - (1 - k) * pw / 2, 0.0012, cz]} rotation-x={-Math.PI / 2} scale={[k, 1, 1]} material={inkM} renderOrder={2} userData={{ noShadow: true }}><planeGeometry args={[pw, pd]} /></mesh>
      )}
      {/* the appraiser's pencil, laid down beside the sheet */}
      <group position={[INV.w / 2 + 0.03, 0.004, 0.02]} rotation-y={1.35}>
        <mesh rotation-z={Math.PI / 2} castShadow><cylinderGeometry args={[0.0038, 0.0038, 0.17, 6]} /><meshStandardMaterial color="#D9A53A" roughness={0.5} /></mesh>
        <mesh position={[0.093, 0, 0]} rotation-z={-Math.PI / 2}><coneGeometry args={[0.0038, 0.016, 6]} /><meshStandardMaterial color="#E8CFA6" roughness={0.8} /></mesh>
        <mesh position={[0.1, 0, 0]} rotation-z={-Math.PI / 2}><coneGeometry args={[0.0012, 0.004, 6]} /><meshStandardMaterial color="#2A2E34" roughness={0.6} /></mesh>
        <mesh position={[-0.091, 0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.004, 0.004, 0.012, 10]} /><meshStandardMaterial color="#B8C0C8" metalness={0.8} roughness={0.3} /></mesh>
        <mesh position={[-0.1, 0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.0038, 0.0038, 0.008, 10]} /><meshStandardMaterial color="#C98A8A" roughness={0.8} /></mesh>
      </group>
    </group>
  );
};
export const VaultSet = ({ open, slide, glass, flash, ruler, level, write = 1 }) => {
  const M = useVaultMats();
  const ready = usePropFonts();
  return (
    <group>
      <Wall M={M} />
      <VaultFront />
      <Table M={M} />
      <Door M={M} open={open} />
      <Box slide={slide} glass={glass} flash={flash} />
      <Ruler k={ruler} ready={ready} level={level} />
      <Inventory ready={ready} write={write} />
      {/* the vault's ceiling lights: cool panels overhead (their light on the table and the doors) */}
      <pointLight position={[0.1, 2.6, -0.4]} intensity={2.2} distance={6} decay={2} color="#E4EEFA" />
      <pointLight position={[-1.2, 2.6, -0.2]} intensity={1.0} distance={5} decay={2} color="#D6E4F6" />
    </group>
  );
};
