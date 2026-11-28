// @ts-nocheck
// ★ V39 builder C — THE DINER BOOTH (station `diner`): a Friendly's restaurant booth at night (Boston Globe / Reuters 2015: a
//   Friendly's patron paid for Read's meal, thinking he couldn't afford it). Metres; floor y 0; the table top at y TOP; the window
//   wall's inside face at z WALL; the aisle (and the camera) toward +z.
//   · two facing benches in navy channel-tufted vinyl on oak frames, a laminate table with a chrome T-moulding on a pedestal
//   · the finished plate (burger crust, a bun heel, a few fries, a ketchup smear, a crumpled napkin, knife and fork in the
//     finished position), a white diner mug of coffee and a spoon, a ribbed water glass, a chrome napkin dispenser, glass salt
//     and pepper shakers, a tent card printed "Friendly's" (plain type) with the ice-cream menu (no prices)
//   · THE GUEST CHECK on a small check tray with a pen: the printed check (Friendly's / GUEST CHECK, fields, ruled lines, a stub),
//     "PAID" in the server's hand across it, and one short note line, "Paid by another guest" (no order lines: nothing is claimed about
//     what he ate; no check or table number)
//   · a warm enamel pendant lamp over the table (the only warm light), a big window onto the blue night: a parking lot with stall
//     lines and lamp poles, a road, trees and a far town under the sky
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { canvasTex, rnd, Glow } from "./kit";
import { HAND, SANSF, usePropFonts, woodTex, speckTex, noiseTex, tileTex, brushedTex } from "./c_tex";
import { PlateFood, Mug, WaterGlass, Caddy, UsedFlatware } from "./c_dfood";
import { conifer, maple, house, snowGround } from "./c_scenery";

export const TOP = 0.76, WALL = -0.62;
export const TABLE = { x0: -0.38, x1: 0.38, z0: -0.61, z1: 0.51 };
// the check tray on the table (centre, yaw) and the check on it (local to the tray)
export const TRAY = { x: 0.15, z: 0.14, ry: -0.18, w: 0.135, d: 0.215 };
export const CHECK = { w: 0.088, d: 0.168, x: -0.006, z: 0.004, ry: 0.05 };
/** a point on the check (u, v in 0..1 from its top-left as printed) → station-local */
export const onCheck = (u, v, lift = 0.0) => {
  const lx = CHECK.x + (u - 0.5) * CHECK.w, lz = CHECK.z + (v - 0.5) * CHECK.d;
  const a = CHECK.ry, x1 = lx * Math.cos(a) + lz * Math.sin(a), z1 = -lx * Math.sin(a) + lz * Math.cos(a);
  const b = TRAY.ry, x2 = x1 * Math.cos(b) + z1 * Math.sin(b), z2 = -x1 * Math.sin(b) + z1 * Math.cos(b);
  return [TRAY.x + x2, TOP + 0.0075 + lift, TRAY.z + z2];
};

// ── printed matter ────────────────────────────────────────────────────────────────────────────────────────────────────
const CK_INK = "#2C4F8C";
const checkDraw = (c, w, h) => {
  c.fillStyle = "#F6F4EC"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 6000; i++) { c.fillStyle = `rgba(120,110,90,${0.015 + rnd(i) * 0.03})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  const ink = CK_INK;
  c.textAlign = "center"; c.fillStyle = ink;
  c.font = `800 92px ${SANSF}`; c.fillText("Friendly's", w / 2, 112);
  c.font = `700 34px ${SANSF}`; if ("letterSpacing" in c) c.letterSpacing = "10px"; c.fillText("GUEST CHECK", w / 2, 164); if ("letterSpacing" in c) c.letterSpacing = "0px";
  c.fillRect(40, 186, w - 80, 3);
  // the field row: DATE | TABLE | GUESTS | SERVER, and the check number
  const cols = [40, 250, 430, 610, w - 40];
  const labels = ["DATE", "TABLE", "GUESTS", "SERVER"];
  c.lineWidth = 2; c.strokeStyle = ink; c.strokeRect(40, 200, w - 80, 96);
  for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(cols[k], 200); c.lineTo(cols[k], 296); c.stroke(); }
  c.font = `700 22px ${SANSF}`; c.textAlign = "left";
  labels.forEach((t, k) => c.fillText(t, cols[k] + 10, 224));
  c.font = `700 30px ${SANSF}`; c.textAlign = "right";
  c.font = `500 40px "Liberation Mono", "DejaVu Sans Mono", monospace`; /* no invented check number */
  // ruled item lines with a price column
  const y0 = 370, lh = 74, n = 14;
  c.lineWidth = 1.6; c.strokeStyle = "rgba(44,79,140,0.75)";
  for (let k = 0; k <= n; k++) { c.beginPath(); c.moveTo(40, y0 + k * lh); c.lineTo(w - 40, y0 + k * lh); c.stroke(); }
  c.lineWidth = 2.4; c.strokeStyle = ink;
  c.beginPath(); c.moveTo(110, y0); c.lineTo(110, y0 + n * lh); c.moveTo(w - 210, y0); c.lineTo(w - 210, y0 + n * lh); c.stroke();
  c.font = `600 20px ${SANSF}`; c.fillStyle = ink; c.textAlign = "center";
  for (let k = 0; k < n; k++) c.fillText(String(k + 1), 75, y0 + k * lh + 46);
  // the printed column heads over the item lines
  c.font = `700 22px ${SANSF}`; c.fillText("QTY", 75, y0 - 16); c.textAlign = "left"; c.fillText("DESCRIPTION", 126, y0 - 16); c.textAlign = "center"; c.fillText("AMOUNT", w - 125, y0 - 16);
  // totals
  const ty = y0 + n * lh;
  c.textAlign = "right"; c.font = `700 26px ${SANSF}`;
  [["TAX", ty + 52], ["TOTAL", ty + 126]].forEach(([t, y]) => { c.fillText(t, w - 226, y); c.strokeRect(w - 210, y - 44, 170, 64); });
  c.fillRect(40, ty + 170, w - 80, 3);
  c.textAlign = "center"; c.font = `italic 600 38px ${SANSF}`; c.fillText("Thank You", w / 2, ty + 222);
  c.font = `600 22px ${SANSF}`; c.fillText("PLEASE PAY CASHIER", w / 2, ty + 256);
  // the perforation and the guest stub
  const py = ty + 290;
  c.fillStyle = "rgba(44,79,140,0.8)"; for (let x = 30; x < w - 30; x += 16) { c.beginPath(); c.arc(x, py, 3.2, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = ink; c.font = `700 26px ${SANSF}`; c.textAlign = "left"; c.fillText("GUEST RECEIPT", 44, py + 56);
  c.textAlign = "right"; c.font = `500 34px "Liberation Mono", "DejaVu Sans Mono", monospace`; /* no invented check number */
  c.font = `600 20px ${SANSF}`; c.textAlign = "left"; c.fillText("Friendly's  ·  Thank you for visiting", 44, py + 96);
  // ★ rev 2026-11-28 (style rules 6/11: the figure lives ON the object and lands on its word): the server's handwriting — PAID and the
  //   note — is no longer printed here; it WRITES ITSELF onto the check on "paid" / "meal," (WriteDecal below, the same pen and hand)
};
// the server's handwriting, drawn into its own transparent canvases (ballpoint blue-black), in check-canvas px (960 × 1832) rects
const CK_W = 960, CK_H = 1832, CK_Y0 = 370, CK_LH = 74;
const PEN = "rgba(18,30,62,0.92)";
export const INK = {
  // PAID, written big across the item lines, underlined twice (left → right as it is written)
  paid: { r: [150, 700, 680, 400], draw: (c) => {
    c.save(); c.translate(472 - 150, CK_Y0 + 7.2 * CK_LH - 700); c.rotate(-0.16);
    c.font = `700 250px "${HAND}"`; c.fillStyle = PEN; c.textAlign = "center"; c.fillText("PAID", 0, 0);
    c.strokeStyle = PEN; c.lineWidth = 9; c.lineCap = "round";
    c.beginPath(); c.moveTo(-260, 40); c.bezierCurveTo(-120, 58, 120, 46, 270, 30); c.stroke();
    c.lineWidth = 7; c.beginPath(); c.moveTo(-230, 72); c.bezierCurveTo(-90, 86, 110, 76, 250, 62); c.stroke();
    c.restore();
  } },
  // the note line under it
  note: { r: [112, CK_Y0 + 11 * CK_LH - 4, 720, 90], draw: (c) => {
    c.save(); c.translate(128 - 112, 54 + 4); c.rotate(-0.02); c.font = `500 60px "${HAND}"`; c.fillStyle = PEN; c.textAlign = "left"; c.fillText("Paid by another guest", 0, 0); c.restore();
  } },
};
/** a line of handwriting on the check that appears left → right as k goes 0 → 1 (a wipe through the texture: no rebuild per frame) */
const WriteDecal = ({ id, k, ready }) => {
  const d = INK[id], [rx, ry, rw, rh] = d.r;
  const tex = useMemo(() => {
    if (!ready) return null;
    const t = canvasTex("c_diner_ink_" + id, rw, rh, (c) => { c.clearRect(0, 0, rw, rh); d.draw(c); }).clone();
    t.wrapS = THREE.ClampToEdgeWrapping; t.needsUpdate = true; return t;
  }, [ready]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }), [tex]);
  if (!tex || k <= 0.001) return null;
  const pw = (rw / CK_W) * CHECK.w, pd = (rh / CK_H) * CHECK.d;
  const cx = ((rx + rw / 2) / CK_W - 0.5) * CHECK.w, cz = ((ry + rh / 2) / CK_H - 0.5) * CHECK.d;
  const kk = Math.min(1, k);
  tex.repeat.set(kk, 1); tex.offset.set(0, 0);
  return (
    <mesh position={[cx - (1 - kk) * pw / 2, 0.0002, cz]} rotation-x={-Math.PI / 2} scale={[kk, 1, 1]} material={mat} renderOrder={2} userData={{ noShadow: true }}>
      <planeGeometry args={[pw, pd]} />
    </mesh>
  );
};
const tentDraw = (c, w, h) => {
  c.fillStyle = "#F4F1E8"; c.fillRect(0, 0, w, h);
  const navy = "#123E73", lt = "#4D8ED9";
  c.fillStyle = navy; c.fillRect(0, 0, w, 210);
  c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.font = `800 112px ${SANSF}`; c.fillText("Friendly's", w / 2, 140);
  c.fillStyle = lt; c.fillRect(0, 210, w, 12);
  c.fillStyle = navy;
  c.font = `800 52px ${SANSF}`; c.fillText("ICE CREAM", w / 2, 310); c.fillText("SUNDAES", w / 2, 370);
  c.font = `500 36px ${SANSF}`; c.fillText("Hot Fudge  ·  Strawberry", w / 2, 428); c.fillText("Butterscotch  ·  Banana Split", w / 2, 474);
  c.fillRect(w / 2 - 120, 510, 240, 3);
  c.font = `800 52px ${SANSF}`; c.fillText("MILKSHAKES", w / 2, 590);
  c.font = `500 36px ${SANSF}`; c.fillText("Chocolate  ·  Vanilla  ·  Coffee", w / 2, 646);
  c.fillRect(w / 2 - 120, 682, 240, 3);
  c.font = `800 52px ${SANSF}`; c.fillText("CONES & CUPS", w / 2, 762);
  c.font = `italic 500 34px ${SANSF}`; c.fillText("Ask your server about", w / 2, 840); c.fillText("today's flavors", w / 2, 882);
  c.strokeStyle = navy; c.lineWidth = 6; c.strokeRect(18, 18, w - 36, h - 36);
  c.fillStyle = navy; c.fillRect(0, h - 70, w, 70); c.fillStyle = "#FFFFFF"; c.font = `700 30px ${SANSF}`; c.fillText("SAVE ROOM FOR DESSERT", w / 2, h - 24);
};
// the blue winter night through the window (Brattleboro, Vermont, in winter): a blue-hour sky, snowy hills with a tree line, the far
// town (clapboard houses with snow on the roofs and lit windows, a white steeple), snowy conifers in tiers and bare maples (c_scenery)
const nightDraw = (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#04132B"); g.addColorStop(0.35, "#0A2C5A"); g.addColorStop(0.6, "#2D5E9E"); g.addColorStop(0.66, "#3E70AE"); g.addColorStop(1, "#1B3560");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 140; i++) { c.fillStyle = `rgba(220,232,250,${0.2 + rnd(i) * 0.5})`; c.fillRect(rnd(i + 3) * w, rnd(i + 7) * h * 0.4, 2, 2); }
  const hz = h * 0.66;
  // far hills under snow, a dark band of forest along their flanks
  c.fillStyle = "#3A5A88"; c.beginPath(); c.moveTo(0, hz); for (let x = 0; x <= w; x += 8) c.lineTo(x, hz - 60 - 40 * Math.sin(x / 260) - 16 * Math.sin(x / 71)); c.lineTo(w, h); c.lineTo(0, h); c.fill();
  for (let x = 0; x < w; x += 5) { const top = hz - 60 - 40 * Math.sin(x / 260) - 16 * Math.sin(x / 71); c.fillStyle = `rgba(14,34,64,${0.55 + rnd(x) * 0.3})`; c.fillRect(x, top + 14 + rnd(x + 1) * 10, 5, 30 + rnd(x + 2) * 22); }
  snowGround(c, w, hz - 6, h);
  // the far town: houses, a white steeple
  for (let k = 0; k < 16; k++) { const x = rnd(k * 3) * w, bw = 60 + rnd(k + 1) * 70; house(c, x, hz + 4, bw, bw * 0.55, k + 30, { wall: rnd(k + 5) < 0.5 ? "#1E3A64" : "#25446F", lit: 0.55 }); }
  const sx = w * 0.7; c.fillStyle = "#C9D6E6"; c.fillRect(sx, hz - 130, 22, 134); c.fillRect(sx - 30, hz - 50, 82, 54);
  c.beginPath(); c.moveTo(sx - 6, hz - 130); c.lineTo(sx + 11, hz - 215); c.lineTo(sx + 28, hz - 130); c.fill(); c.fillStyle = "#FFD9A0"; c.fillRect(sx + 6, hz - 110, 10, 16);
  // the road along the lot: a plowed band with headlamp glows and streetlamps receding
  c.fillStyle = "#1A2A44"; c.fillRect(0, hz + 30, w, 26);
  for (let k = 0; k < 14; k++) { const x = w * 0.05 + k * w * 0.07, y = hz + 22 - k * 0.5; const gg = c.createRadialGradient(x, y, 0, x, y, 22); gg.addColorStop(0, "rgba(255,214,150,0.95)"); gg.addColorStop(0.25, "rgba(255,190,120,0.35)"); gg.addColorStop(1, "rgba(255,190,120,0)"); c.fillStyle = gg; c.fillRect(x - 22, y - 22, 44, 44); }
  // the tree line in front of the town: conifers of every size, bare maples between them
  for (let k = 0; k < 34; k++) { const x = (k / 34) * w + rnd(k * 5) * 50, th = 70 + rnd(k * 7) * 110; conifer(c, x, hz + 34 + rnd(k) * 8, th, th * 0.45, k + 3, { dark: "#0A1A33", mid: "#11264A", snow: "#B9CCE6" }); }
  for (let k = 0; k < 9; k++) maple(c, rnd(k * 11 + 4) * w, hz + 40, 110 + rnd(k) * 80, k + 50, { col: "#0A1730" });
};
const lotDraw = (c, w, h) => {   // a plowed lot at night: wet asphalt, stall lines, tyre tracks in the slush, snow along the edges
  c.fillStyle = "#1A2638"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 20000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "200,215,235" : "0,0,0"},${0.03 + rnd(i + 1) * 0.06})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2, 2); }
  c.fillStyle = "#3A4A60"; c.fillRect(0, 0, w, 24);   // the curb strip by the building
  c.fillStyle = "rgba(220,228,238,0.75)";
  for (let k = 0; k < 12; k++) c.fillRect(30 + k * 86, 40, 5, 200);   // stall lines (2.7 m pitch)
  for (let k = 0; k < 12; k++) c.fillRect(30 + k * 86, 520, 5, 200);
  for (let k = 0; k < 9; k++) { c.fillStyle = "rgba(0,0,0,0.18)"; c.beginPath(); c.ellipse(70 + k * 86 + rnd(k) * 20, 160, 24, 40, 0, 0, Math.PI * 2); c.fill(); }
  // slush and packed snow: patches, the tyre tracks through them, a ridge of snow along the lot's far edge
  for (let i = 0; i < 90; i++) { const x = rnd(i * 3) * w, y = 260 + rnd(i * 5) * 240, r = 20 + rnd(i) * 70; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, "rgba(170,188,212,0.45)"); g.addColorStop(1, "rgba(170,188,212,0)"); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  c.strokeStyle = "rgba(20,30,46,0.55)"; c.lineWidth = 9; for (let k = 0; k < 4; k++) { const y = 300 + k * 50; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(w * 0.3, y + 30, w * 0.6, y - 20, w, y + 10); c.stroke(); c.beginPath(); c.moveTo(0, y + 22); c.bezierCurveTo(w * 0.3, y + 52, w * 0.6, y + 2, w, y + 32); c.stroke(); }
  c.fillStyle = "#AFC2DC"; c.fillRect(0, h - 120, w, 120); for (let x = 0; x < w; x += 6) { c.fillStyle = "#AFC2DC"; c.fillRect(x, h - 120 - rnd(x) * 18, 6, 20); }
  c.fillStyle = "rgba(175,194,220,0.9)"; c.fillRect(0, 24, w, 10);
};
const signDraw = (c, w, h) => {   // the roadside sign box: the name in plain type, a second line, lit from inside
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#F4F6FA"); g.addColorStop(1, "#DCE4EE"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = "#123E73"; c.fillRect(0, 0, w, h * 0.14); c.fillRect(0, h * 0.86, w, h * 0.14);
  c.fillStyle = "#123E73"; c.textAlign = "center"; c.textBaseline = "middle"; let nx = h * 0.36; c.font = `800 ${nx}px ${SANSF}`; while (c.measureText("Friendly's").width > w * 0.8) { nx -= 4; c.font = `800 ${nx}px ${SANSF}`; } c.fillText("Friendly's", w / 2, h * 0.44);
  let px = h * 0.12; c.font = `700 ${px}px ${SANSF}`; while (c.measureText("RESTAURANT  ·  ICE CREAM").width > w * 0.82 && px > 10) { px -= 2; c.font = `700 ${px}px ${SANSF}`; }
  c.fillText("RESTAURANT  ·  ICE CREAM", w / 2, h * 0.72);
};
// ── materials ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const useMats = () => useMemo(() => {
  // channel-tufted navy vinyl: each channel puffs (a lit crown, shaded flanks), a sewn seam between channels (a dark crease with a
  // row of stitch dashes either side), fine grain and a few soft wrinkles where it is sat against
  const vinylDraw = (bump) => (c, w, h) => {
    const P = 128;
    for (let x = 0; x < w; x++) { const t = (x % P) / P, s = Math.pow(Math.sin(t * Math.PI), 0.7); const v = bump ? Math.round(40 + 200 * s) : Math.round(26 + 40 * s); c.fillStyle = bump ? `rgb(${v},${v},${v})` : `rgb(${v * 0.32},${v * 0.66},${v * 1.55})`; c.fillRect(x, 0, 1, h); }
    for (let x = 0; x < w; x += P) {
      c.fillStyle = bump ? "#000" : "#040B19"; c.fillRect(x - 2, 0, 4, h);
      if (!bump) { c.fillStyle = "rgba(160,190,235,0.35)"; for (let y = 2; y < h; y += 9) { c.fillRect(x - 8, y, 1.6, 5); c.fillRect(x + 7, y + 4, 1.6, 5); } }
    }
    for (let i = 0; i < 6000; i++) { c.fillStyle = bump ? `rgba(${rnd(i) < 0.5 ? "255,255,255" : "0,0,0"},0.06)` : `rgba(${rnd(i) < 0.5 ? "200,220,255" : "0,0,10"},${0.03 + rnd(i + 1) * 0.04})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 1.5, 1.5); }
    for (let k = 0; k < 10; k++) { const x = rnd(k * 7) * w, y = rnd(k * 3) * h; c.strokeStyle = bump ? "rgba(0,0,0,0.25)" : "rgba(0,6,20,0.3)"; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 20, y + 6, x + 34, y + 18); c.stroke(); }
  };
  const vinylMap = tileTex("vinyl_ch2", 1024, 128, vinylDraw(false), true, [4, 1]);
  const vinylBump = tileTex("vinyl_ch2b", 1024, 128, vinylDraw(true), false, [4, 1]);
  // the seat: plain vinyl with a soft sheen and a seam 6 cm in from the front edge
  const vinylSeat = tileTex("vinylseat2", 512, 512, (c, w, h) => {
    c.fillStyle = "#2A4C8A"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "200,220,255" : "0,0,10"},${0.03 + rnd(i + 1) * 0.04})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 1.5, 1.5); }
    for (let k = 0; k < 7; k++) { const x = rnd(k * 9) * w, y = rnd(k * 5) * h; const g = c.createRadialGradient(x, y, 0, x, y, 90); g.addColorStop(0, "rgba(0,8,24,0.18)"); g.addColorStop(1, "rgba(0,8,24,0)"); c.fillStyle = g; c.fillRect(x - 90, y - 90, 180, 180); }
  }, true, [2, 2]);
  const oak = woodTex("oak", "#7A5636", "#3A2412", [1.5, 1], 3);
  const oakV = woodTex("oakv", "#6E4C2E", "#331F0E", [1, 1], 5);
  const lam = tileTex("maplelam2", 512, 1024, (c, w, h) => {   // a maple-look laminate: straight fine grain along the table's length
    c.fillStyle = "#B08154"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { const x0 = rnd(i * 3 + 7) * w, a = 1 + rnd(i) * 3; c.strokeStyle = rnd(i + 1) < 0.7 ? "#6E4524" : "#D7A878"; c.globalAlpha = 0.06 + rnd(i * 5) * 0.12; c.lineWidth = 0.6 + rnd(i * 13) * 2; c.beginPath(); for (let y = 0; y <= h; y += 16) { const x = x0 + a * Math.sin(y / (120 + rnd(i) * 200) + i); y ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
    c.globalAlpha = 1; for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(60,30,10,${0.03 + rnd(i + 2) * 0.04})`; c.fillRect(rnd(i + 3) * w, rnd(i + 5) * h, 1, 4 + rnd(i) * 10); }
  }, true, [1, 1]);
  const bead = tileTex("beadboard", 256, 64, (c, w, h) => { c.fillStyle = "#24456F"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { c.fillStyle = "rgba(0,8,20,0.55)"; c.fillRect(x, 0, 3, h); c.fillStyle = "rgba(255,255,255,0.10)"; c.fillRect(x + 3, 0, 2, h); } }, true, [14, 1]);
  const tile = tileTex("dinerfloor2", 512, 512, (c, w, h) => {   // 12-inch vinyl composition tiles: mottled chips, worn wax sheen, dark joints
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const dark = (i + j) % 2; c.fillStyle = dark ? "#1C2E48" : "#9AA6B6"; c.fillRect(i * 256, j * 256, 256, 256);
      for (let k = 0; k < 1800; k++) { c.fillStyle = dark ? `rgba(${rnd(k + i * 7 + j) < 0.5 ? "90,110,140" : "5,12,25"},0.25)` : `rgba(${rnd(k + i * 7 + j) < 0.5 ? "255,255,255" : "70,80,96"},0.2)`; c.fillRect(i * 256 + rnd(k * 3 + j) * 256, j * 256 + rnd(k * 5 + i) * 256, 2 + rnd(k) * 5, 1 + rnd(k + 1) * 3); }
    }
    c.fillStyle = "rgba(0,0,0,0.45)"; c.fillRect(0, 0, w, 2); c.fillRect(0, 256, w, 2); c.fillRect(0, 0, 2, h); c.fillRect(256, 0, 2, h);
    for (let k = 0; k < 12; k++) { const x = rnd(k * 9) * w, y = rnd(k * 13) * h; c.strokeStyle = "rgba(0,0,0,0.12)"; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 30, y + 10, x + 60, y + 4); c.stroke(); }
  }, true, [12, 12]);
  const paint = noiseTex("dinerwall", "#B9C4D2", 10, [4, 2]);
  const chrome = new THREE.MeshStandardMaterial({ color: "#D6DEE8", metalness: 0.95, roughness: 0.16 });
  const steel = new THREE.MeshStandardMaterial({ map: brushedTex("dsteel", "#9AA6B4", [2, 2]), color: "#D8DEE6", metalness: 0.9, roughness: 0.3 });
  const ceramic = new THREE.MeshPhysicalMaterial({ color: "#F3F1EC", roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 });
  return {
    vinylBack: new THREE.MeshPhysicalMaterial({ map: vinylMap, bumpMap: vinylBump, bumpScale: 3, color: "#FFFFFF", roughness: 0.34, clearcoat: 0.35, clearcoatRoughness: 0.3 }),
    vinylSeat: new THREE.MeshPhysicalMaterial({ map: vinylSeat, color: "#FFFFFF", roughness: 0.34, clearcoat: 0.35, clearcoatRoughness: 0.3 }),
    welt: new THREE.MeshPhysicalMaterial({ color: "#1C3766", roughness: 0.3, clearcoat: 0.5 }),
    oak: new THREE.MeshStandardMaterial({ map: oak, roughness: 0.45, color: "#FFFFFF" }),
    oakV: new THREE.MeshStandardMaterial({ map: oakV, roughness: 0.5, color: "#FFFFFF" }),
    lam: new THREE.MeshPhysicalMaterial({ map: lam, roughness: 0.35, color: "#FFFFFF", clearcoat: 0.6, clearcoatRoughness: 0.2, envMapIntensity: 0.5 }),
    tmould: new THREE.MeshStandardMaterial({ color: "#B8C2CE", metalness: 0.85, roughness: 0.28 }),
    under: new THREE.MeshStandardMaterial({ color: "#2A2620", roughness: 0.8 }),
    floor: new THREE.MeshPhysicalMaterial({ map: tile, roughness: 0.32, clearcoat: 0.5, clearcoatRoughness: 0.25, color: "#FFFFFF" }),
    paint: new THREE.MeshStandardMaterial({ map: paint, roughness: 0.85, color: "#FFFFFF" }),
    bead: new THREE.MeshStandardMaterial({ map: bead, roughness: 0.55, color: "#FFFFFF" }),
    alu: new THREE.MeshStandardMaterial({ color: "#8E9AA8", metalness: 0.8, roughness: 0.35 }),
    chrome, steel, ceramic,
    black: new THREE.MeshPhysicalMaterial({ color: "#1B1A1C", roughness: 0.3, clearcoat: 0.8 }),
  };
}, []);
// ── the bench (s = −1 left, +1 right) ──────────────────────────────────────────────────────────────────────────────────
const Z0 = -0.6, Z1 = 0.56;   // bench extent along z
const endShape = () => {   // the oak end panel: low at the seat front, rising to the backrest's full height with a rounded top
  const s = new THREE.Shape();
  s.moveTo(0, 0); s.lineTo(0, 0.5); s.quadraticCurveTo(0.02, 0.56, 0.12, 0.56); s.lineTo(0.36, 0.58); s.quadraticCurveTo(0.44, 0.62, 0.44, 0.8);
  s.lineTo(0.45, 1.16); s.quadraticCurveTo(0.46, 1.22, 0.52, 1.22); s.lineTo(0.58, 1.22); s.lineTo(0.58, 0); s.closePath();
  return s;
};
const Bench = ({ s, M }) => {
  const g = useMemo(() => ({
    seat: new RoundedBoxGeometry(0.5, 0.13, Z1 - Z0 - 0.04, 3, 0.04),
    back: new RoundedBoxGeometry(0.13, 0.64, Z1 - Z0 - 0.04, 3, 0.05),
    end: new THREE.ExtrudeGeometry(endShape(), { depth: 0.036, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 10 }),
  }), []);
  const zc = (Z0 + Z1) / 2;
  return (
    <group>
      {/* the seat box (oak kick panel), the cushion, the tufted back, the back panel and the cap rail */}
      <mesh position={[s * 0.72, 0.17, zc]} material={M.oakV} receiveShadow><boxGeometry args={[0.52, 0.34, Z1 - Z0]} /></mesh>
      <mesh geometry={g.seat} position={[s * 0.71, 0.405, zc]} material={M.vinylSeat} castShadow receiveShadow />
      <group position={[s * 0.92, 0.8, zc]} rotation-z={-s * 0.1}>
        <mesh geometry={g.back} material={M.vinylBack} castShadow receiveShadow />
        {/* welt piping along the back cushion's front edges */}
        {[0.3, -0.3].map((y, i) => <mesh key={i} position={[-s * 0.055, y, 0]} rotation-x={Math.PI / 2} material={M.welt}><cylinderGeometry args={[0.0075, 0.0075, Z1 - Z0 - 0.06, 10]} /></mesh>)}
      </group>
      {/* the seat's welt along its front edge, top and bottom, and the seam line */}
      {[0.466, 0.344].map((y, i) => <mesh key={i} position={[s * 0.47, y, zc]} rotation-x={Math.PI / 2} material={M.welt}><cylinderGeometry args={[0.0075, 0.0075, Z1 - Z0 - 0.06, 10]} /></mesh>)}
      <mesh position={[s * 1.0, 0.6, zc]} material={M.oakV} receiveShadow castShadow><boxGeometry args={[0.04, 1.2, Z1 - Z0]} /></mesh>
      <mesh position={[s * 0.985, 1.2, zc]} material={M.oak} castShadow receiveShadow><boxGeometry args={[0.11, 0.045, Z1 - Z0 + 0.06]} /></mesh>
      {/* the oak end panels at the aisle and at the wall */}
      {[Z1, Z0 - 0.036].map((z, i) => (
        <mesh key={i} geometry={g.end} material={M.oak} position={[s * 0.45, 0, z]} scale={[s, 1, 1]} castShadow receiveShadow />
      ))}
      {/* a coat hook on the aisle post */}
      <group position={[s * 1.0, 1.02, Z1 + 0.05]}>
        <mesh material={M.chrome} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.012, 0.012, 0.03, 12]} /></mesh>
        <mesh material={M.chrome} position={[0, 0.015, 0.03]} rotation-x={0.6}><cylinderGeometry args={[0.005, 0.005, 0.05, 8]} /></mesh>
      </group>
    </group>
  );
};
// ── the table ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const Table = ({ M }) => {
  const w = TABLE.x1 - TABLE.x0, d = TABLE.z1 - TABLE.z0, zc = (TABLE.z0 + TABLE.z1) / 2;
  const mats = useMemo(() => [M.tmould, M.tmould, M.lam, M.under, M.tmould, M.tmould], [M]);
  return (
    <group>
      <mesh position={[0, TOP - 0.016, zc]} material={mats} castShadow receiveShadow><boxGeometry args={[w, 0.032, d]} /></mesh>
      {/* the T-moulding's raised bead around the edge */}
      {[[0, TABLE.z1 + 0.002, w + 0.008, 0.008], [0, TABLE.z0 - 0.002, w + 0.008, 0.008]].map(([x, z, L, t], i) => <mesh key={i} position={[x, TOP - 0.016, z]} material={M.chrome}><boxGeometry args={[L, 0.034, t]} /></mesh>)}
      {[TABLE.x0 - 0.002, TABLE.x1 + 0.002].map((x, i) => <mesh key={i} position={[x, TOP - 0.016, zc]} material={M.chrome}><boxGeometry args={[0.008, 0.034, d + 0.008]} /></mesh>)}
      {/* the pedestal: spider plate, column, a cast four-arm foot */}
      <mesh position={[0, TOP - 0.04, zc]} material={M.under}><boxGeometry args={[0.36, 0.016, 0.5]} /></mesh>
      <mesh position={[0, 0.36, zc]} material={M.chrome} castShadow><cylinderGeometry args={[0.038, 0.038, 0.72, 20]} /></mesh>
      {[0, Math.PI / 2].map((r, i) => <mesh key={i} position={[0, 0.025, zc]} rotation-y={r + 0.785} material={M.black} castShadow><boxGeometry args={[0.62, 0.035, 0.07]} /></mesh>)}
    </group>
  );
};
// ── the wall, the window and the night outside ───────────────────────────────────────────────────────────────────────────
const WX0 = -0.93, WX1 = 0.93, WY0 = 1.0, WY1 = 2.06;
const WallWindow = ({ M }) => {
  const night = useMemo(() => canvasTex("c_diner_night", 2048, 1024, nightDraw), []);
  const lot = useMemo(() => { const t = canvasTex("c_diner_lot2", 1024, 1024, lotDraw); return t; }, []);
  const sign = useMemo(() => canvasTex("c_diner_roadsign2", 1024, 512, signDraw), []);
  const shade = useMemo(() => tileTex("dshade", 256, 256, (c, w, h) => { c.fillStyle = "#E6DFCF"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 3) { c.fillStyle = `rgba(120,100,70,${0.05 + rnd(y) * 0.05})`; c.fillRect(0, y, w, 1); } for (let x = 0; x < w; x += 4) { c.fillStyle = "rgba(255,255,255,0.05)"; c.fillRect(x, 0, 1, h); } }, true, [3, 1]), []);
  const snowM = useMemo(() => new THREE.MeshStandardMaterial({ color: "#A9BCD6", roughness: 0.9, emissive: "#20344F", emissiveIntensity: 0.12 }), []);
  const banks = useMemo(() => {
    const parts = [];
    const lump = (x, y, z, sx, sy, sz, seed) => { const g = new THREE.IcosahedronGeometry(1, 4); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const k = 1 + 0.07 * Math.sin(p.getX(i) * 5 + seed) * Math.cos(p.getZ(i) * 4 + seed) + 0.03 * Math.sin(p.getX(i) * 17 + p.getZ(i) * 13 + seed); p.setXYZ(i, x + p.getX(i) * sx * k, Math.max(-0.02, y + p.getY(i) * sy * k), z + p.getZ(i) * sz * k); } parts.push(g.toNonIndexed()); };
    for (let k = 0; k < 26; k++) lump(-13 + k * 1.05 + rnd(k) * 0.4, 0.05, WALL - 1.7 - rnd(k + 3) * 0.3, 0.8 + rnd(k + 1) * 0.5, 0.35 + rnd(k + 2) * 0.3, 0.55, k);
    for (let k = 0; k < 26; k++) lump(-22 + k * 1.7 + rnd(k) * 0.6, -0.1, WALL - 27.5 - rnd(k + 9) * 0.8, 1.5 + rnd(k + 3) * 0.6, 0.45 + rnd(k) * 0.35, 1.3, k + 40);
    const n = parts.reduce((a, g) => a + g.attributes.position.count, 0), pos = new Float32Array(n * 3); let o = 0;
    parts.forEach((g) => { pos.set(g.attributes.position.array, o); o += g.attributes.position.array.length; });
    const m = new THREE.BufferGeometry(); m.setAttribute("position", new THREE.BufferAttribute(pos, 3)); m.computeVertexNormals(); return m;
  }, []);
  const box = (x0, x1, y0, y1, k, m = M.paint) => <mesh key={k} position={[(x0 + x1) / 2, (y0 + y1) / 2, WALL - 0.06]} material={m} receiveShadow><boxGeometry args={[x1 - x0, y1 - y0, 0.12]} /></mesh>;
  return (
    <group>
      {box(-4, WX0, 0, 3.2, "l")}{box(WX1, 4, 0, 3.2, "r")}{box(WX0, WX1, WY1, 3.2, "t")}{box(WX0, WX1, 0, WY0, "b", M.bead)}
      {/* the sill and the aluminium frame */}
      <mesh position={[0, WY0 - 0.012, WALL + 0.03]} material={M.oak} castShadow receiveShadow><boxGeometry args={[WX1 - WX0 + 0.1, 0.024, 0.12]} /></mesh>
      {[[WX0 + 0.02, (WY0 + WY1) / 2, 0.04, WY1 - WY0], [WX1 - 0.02, (WY0 + WY1) / 2, 0.04, WY1 - WY0], [0, WY1 - 0.02, WX1 - WX0, 0.04], [0, WY0 + 0.02, WX1 - WX0, 0.04]].map(([x, y, w, h], i) =>
        <mesh key={i} position={[x, y, WALL - 0.04]} material={M.alu}><boxGeometry args={[w, h, 0.06]} /></mesh>)}
      <mesh position={[0, (WY0 + WY1) / 2, WALL - 0.05]}>
        <planeGeometry args={[WX1 - WX0, WY1 - WY0]} />
        <meshPhysicalMaterial color="#9CC0EC" transparent opacity={0.1} roughness={0.03} metalness={0} clearcoat={1} depthWrite={false} envMapIntensity={1.2} />
      </mesh>
      {/* outside: the lot, a curb, lamp poles; the far night on a backdrop */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, WALL - 14]} receiveShadow><planeGeometry args={[60, 28]} /><meshStandardMaterial map={lot} roughness={0.75} color="#9FB0C6" /></mesh>
      <mesh position={[0, 0.07, WALL - 0.8]}><boxGeometry args={[60, 0.14, 1.2]} /><meshStandardMaterial color="#3E4E66" roughness={0.9} /></mesh>
      {[[-5.5, -9], [4.5, -16], [-1.5, -27]].map(([x, z], i) => (
        <group key={i} position={[x, 0, WALL + z]}>
          <mesh position={[0, 3.5, 0]}><cylinderGeometry args={[0.07, 0.1, 7, 10]} /><meshStandardMaterial color="#1C2838" roughness={0.6} metalness={0.4} /></mesh>
          <mesh position={[0.45, 6.95, 0]}><boxGeometry args={[0.9, 0.08, 0.08]} /><meshStandardMaterial color="#1C2838" /></mesh>
          <mesh position={[0.9, 6.88, 0]}><boxGeometry args={[0.5, 0.12, 0.26]} /><meshStandardMaterial color="#26344A" /></mesh>
          <mesh position={[0.9, 6.81, 0]}><boxGeometry args={[0.42, 0.02, 0.2]} /><meshStandardMaterial color="#FFE6BE" emissive="#FFD49A" emissiveIntensity={2.5} /></mesh>
          <Glow position={[0.9, 6.7, 0]} size={3.2} color="#FFC888" opacity={0.55} />
          <mesh rotation-x={-Math.PI / 2} position={[0.9, 0.01, 0]}><circleGeometry args={[3.2, 32]} /><meshBasicMaterial color="#FFB870" transparent opacity={0.09} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
        </group>
      ))}
      <mesh position={[0, 9, WALL - 44]}><planeGeometry args={[110, 55]} /><meshBasicMaterial map={night} fog={false} toneMapped={true} /></mesh>
      {/* plowed snowbanks along the curb and at the lot's far edge (one merged lumpy mound each) */}
      <mesh geometry={banks} material={snowM} receiveShadow />
      {/* snow on the outside sill, just beyond the glass */}
      <mesh position={[0, WY0 - 0.01, WALL - 0.16]} material={snowM}><boxGeometry args={[WX1 - WX0 + 0.2, 0.045, 0.14]} /></mesh>
      {/* the roadside sign: two steel posts, a lit double-faced box with the name in plain type */}
      <group position={[-6.4, 0, WALL - 21]} rotation-y={0.62}>
        {[-1.05, 1.05].map((x, i) => <mesh key={i} position={[x, 1.5, 0]}><cylinderGeometry args={[0.07, 0.07, 3, 10]} /><meshStandardMaterial color="#20304A" metalness={0.5} roughness={0.5} /></mesh>)}
        <mesh position={[0, 2.85, 0]}><boxGeometry args={[2.5, 1.2, 0.3]} /><meshStandardMaterial color="#1A2A44" metalness={0.4} roughness={0.5} /></mesh>
        {[1, -1].map((sd) => <mesh key={sd} position={[0, 2.85, sd * 0.152]} rotation-y={sd > 0 ? 0 : Math.PI}><planeGeometry args={[2.36, 1.06]} /><meshBasicMaterial map={sign} toneMapped={true} /></mesh>)}
        <mesh position={[0, 3.47, 0]} material={snowM}><boxGeometry args={[2.56, 0.05, 0.34]} /></mesh>
        <Glow position={[0, 2.85, 0.4]} size={3.4} color="#DCE8FA" opacity={0.25} />
      </group>
      {/* a roller shade half drawn at the top of the window, its pull ring */}
      <mesh position={[0, WY1 - 0.13, WALL + 0.035]} castShadow><boxGeometry args={[WX1 - WX0 - 0.06, 0.26, 0.004]} /><meshStandardMaterial map={shade} color="#FFFFFF" roughness={0.9} /></mesh>
      <mesh position={[0, WY1 - 0.255, WALL + 0.04]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.008, 0.008, WX1 - WX0 - 0.05, 10]} /><meshStandardMaterial color="#C8D0DA" metalness={0.8} roughness={0.3} /></mesh>
      <mesh position={[0, WY1 - 0.29, WALL + 0.042]}><torusGeometry args={[0.014, 0.0025, 6, 20]} /><meshStandardMaterial color="#C8D0DA" metalness={0.8} roughness={0.3} /></mesh>
    </group>
  );
};
// ── the pendant lamp (the warm practical) ───────────────────────────────────────────────────────────────────────────────
const SHADE = [[0.0, 0.17], [0.03, 0.17], [0.045, 0.16], [0.08, 0.135], [0.13, 0.085], [0.165, 0.035], [0.185, 0.004], [0.19, 0]].map(([r, y]) => new THREE.Vector2(r, y));
export const LAMP = [0, 1.72, -0.06];
const Pendant = ({ M }) => {
  const g = useMemo(() => new THREE.LatheGeometry(SHADE, 48), []);
  const outer = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#16365F", roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1, side: THREE.DoubleSide }), []);
  const inner = useMemo(() => new THREE.MeshStandardMaterial({ color: "#FFF3E0", emissive: "#FFD9A8", emissiveIntensity: 0.9, roughness: 0.6, side: THREE.DoubleSide }), []);
  return (
    <group position={LAMP}>
      <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.004, 0.004, 1.2, 6]} /><meshStandardMaterial color="#1A1A1A" /></mesh>
      <mesh position={[0, 0.19, 0]} material={M.chrome}><cylinderGeometry args={[0.022, 0.028, 0.05, 16]} /></mesh>
      <mesh geometry={g} material={outer} castShadow />
      <mesh geometry={g} material={inner} scale={[0.975, 0.975, 0.975]} position={[0, -0.002, 0]} />
      <mesh position={[0, 0.0, 0]} rotation-x={Math.PI / 2} material={M.chrome}><torusGeometry args={[0.19, 0.004, 8, 48]} /></mesh>
      <mesh position={[0, 0.06, 0]}><sphereGeometry args={[0.042, 20, 14]} /><meshStandardMaterial color="#FFF6E6" emissive="#FFE1B0" emissiveIntensity={5} /></mesh>
      <pointLight position={[0, 0.04, 0]} intensity={4.2} distance={5} decay={2} color="#FFC48A" />
      <pointLight position={[0, 0.3, 0]} intensity={0.25} distance={2} decay={2} color="#FFD8A8" />
      <Glow position={[0, 0.02, 0]} size={0.9} color="#FFC07A" opacity={0.45} />
      <Glow position={[0, 0.05, 0]} size={0.32} color="#FFE6C0" opacity={0.7} />
    </group>
  );
};
// ── the table props ───────────────────────────────────────────────────────────────────────────────────────────────────
const PLATE = [[0, 0.0105], [0.095, 0.0105], [0.108, 0.0135], [0.12, 0.018], [0.129, 0.0225], [0.135, 0.0245], [0.139, 0.0232], [0.138, 0.0205], [0.129, 0.0185], [0.11, 0.0125], [0.09, 0.0055], [0.08, 0.0018], [0.074, 0.0], [0.066, 0.0], [0.064, 0.003], [0.0, 0.003]];
const plateBand = () => canvasTex("c_plateband", 4, 512, (c, w, h) => {
  c.fillStyle = "#F4F2EC"; c.fillRect(0, 0, w, h);
  const n = PLATE.length - 1, v0 = 1 - 3.55 / n, v1 = 1 - 3.95 / n;   // the band on the rim (segment 3→4 of the profile; canvas y = 1 − v)
  c.fillStyle = "#2E5C9E"; c.fillRect(0, (1 - v0) * h, w, (v0 - v1) * h);
});
const Plate = ({ M }) => {
  const g = useMemo(() => new THREE.LatheGeometry(PLATE.map(([r, y]) => new THREE.Vector2(r, y)), 64), []);
  const m = useMemo(() => new THREE.MeshPhysicalMaterial({ map: plateBand(), color: "#FFFFFF", roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06, side: THREE.DoubleSide }), []);
  const napkin = useMemo(() => { const q = new THREE.IcosahedronGeometry(0.032, 3); const p = q.attributes.position; for (let i = 0; i < p.count; i++) { const k = 1 + 0.32 * Math.sin(p.getX(i) * 140 + p.getY(i) * 90) * Math.cos(p.getZ(i) * 120); p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.6, p.getZ(i) * k); } q.computeVertexNormals(); return q; }, []);
  const paperM = useMemo(() => new THREE.MeshStandardMaterial({ color: "#F2F2EE", roughness: 0.95 }), []);
  return (
    <group position={[-0.13, TOP, -0.1]}>
      <mesh geometry={g} material={m} scale={1.12} castShadow receiveShadow />
      <PlateFood W={0.0105 * 1.12} />
      <UsedFlatware chrome={M.chrome} position={[0.148, 0, 0.19]} ry={0.05} />
      {/* the paper napkin, crumpled on the table beside the plate */}
      <mesh geometry={napkin} material={paperM} position={[-0.17, 0.02, -0.12]} castShadow />
    </group>
  );
};
const Dispenser = ({ M, position }) => {
  const g = useMemo(() => new RoundedBoxGeometry(0.11, 0.15, 0.085, 3, 0.012), []);
  return (
    <group position={position}>
      <mesh geometry={g} position={[0, 0.075, 0]} material={M.steel} castShadow receiveShadow />
      {/* the napkins showing in the front slot, and the slot's lip */}
      <mesh position={[0, 0.085, 0.0428]}><boxGeometry args={[0.082, 0.1, 0.002]} /><meshStandardMaterial color="#F4F4F0" roughness={0.95} /></mesh>
      {[0.02, 0.04, 0.06, 0.08, 0.1, 0.12].map((y, i) => <mesh key={i} position={[0, y + 0.024, 0.0441]}><boxGeometry args={[0.08, 0.0008, 0.0006]} /><meshStandardMaterial color="#D8D8D2" /></mesh>)}
      <mesh position={[0, 0.138, 0.044]} material={M.chrome}><boxGeometry args={[0.09, 0.006, 0.004]} /></mesh>
      <mesh position={[0, 0.03, 0.044]} material={M.chrome}><boxGeometry args={[0.09, 0.006, 0.004]} /></mesh>
    </group>
  );
};
const Shaker = ({ M, position, fill }) => (
  <group position={position}>
    <mesh position={[0, 0.032, 0]} renderOrder={3}><cylinderGeometry args={[0.019, 0.02, 0.064, 18, 1, true]} /><meshPhysicalMaterial color="#E2EEF9" transparent opacity={0.3} roughness={0.05} clearcoat={1} depthWrite={false} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0.022, 0]}><cylinderGeometry args={[0.0175, 0.0185, 0.042, 18]} /><meshStandardMaterial color={fill} roughness={0.95} /></mesh>
    <mesh position={[0, 0.07, 0]} material={M.chrome} castShadow><cylinderGeometry args={[0.019, 0.02, 0.014, 18]} /></mesh>
    <mesh position={[0, 0.077, 0]} scale={[1, 0.45, 1]} material={M.chrome}><sphereGeometry args={[0.019, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
  </group>
);
const Tent = ({ ready, position, ry }) => {
  const t = useMemo(() => (ready ? canvasTex("c_diner_tent", 640, 960, tentDraw) : null), [ready]);
  const h = 0.15, w = 0.1, a = 0.28;   // each panel leans a from the vertical
  return (
    <group position={position} rotation-y={ry}>
      {/* the chrome wire stand the card sits in: a weighted base and two clips */}
      <mesh position={[0, 0.004, 0]} castShadow><boxGeometry args={[w * 0.9, 0.008, 0.095]} /><meshStandardMaterial color="#D6DEE8" metalness={0.95} roughness={0.16} /></mesh>
      {[-1, 1].map((sx) => <mesh key={sx} position={[sx * w * 0.32, 0.018, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[0.012, 0.0018, 6, 16, Math.PI]} /><meshStandardMaterial color="#D6DEE8" metalness={0.95} roughness={0.16} /></mesh>)}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, (h / 2) * Math.cos(a), s * (h / 2) * Math.sin(a)]} rotation-x={-s * a} rotation-y={s > 0 ? 0 : Math.PI} castShadow receiveShadow>
          <boxGeometry args={[w, h, 0.0012]} />
          {[0, 1, 2, 3].map((k) => <meshStandardMaterial key={k} attach={`material-${k}`} color="#E8E4DA" roughness={0.6} />)}
          <meshStandardMaterial attach="material-4" map={t} color={t ? "#FFFFFF" : "#E8E4DA"} roughness={0.42} />
          <meshStandardMaterial attach="material-5" color="#E8E4DA" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};
const CheckTray = ({ M, ready, ink = {} }) => {
  const tex = useMemo(() => (ready ? canvasTex("c_diner_check", 960, 1832, checkDraw) : null), [ready]);
  const tray = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#2A1E16", roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.12 }), []);
  const base = useMemo(() => new RoundedBoxGeometry(TRAY.w, 0.006, TRAY.d, 2, 0.003), []);
  const paper = useMemo(() => [0, 1, 2, 3, 4, 5].map((k) => new THREE.MeshStandardMaterial(k === 2 ? { map: tex, color: tex ? "#FFFFFF" : "#F4F2EA", roughness: 0.75 } : { color: "#EEECE4", roughness: 0.85 })), [tex]);
  return (
    <group position={[TRAY.x, TOP, TRAY.z]} rotation-y={TRAY.ry}>
      <mesh geometry={base} position={[0, 0.003, 0]} material={tray} castShadow receiveShadow />
      {[[0, TRAY.d / 2 - 0.003, TRAY.w, 0.006], [0, -TRAY.d / 2 + 0.003, TRAY.w, 0.006]].map(([x, z, L, t], i) => <mesh key={i} position={[x, 0.0085, z]} material={tray} castShadow><boxGeometry args={[L, 0.011, t]} /></mesh>)}
      {[TRAY.w / 2 - 0.003, -TRAY.w / 2 + 0.003].map((x, i) => <mesh key={i} position={[x, 0.0085, 0]} material={tray} castShadow><boxGeometry args={[0.006, 0.011, TRAY.d]} /></mesh>)}
      {/* the check, lying on the tray floor */}
      <mesh position={[CHECK.x, 0.0068, CHECK.z]} rotation-y={CHECK.ry} material={paper} receiveShadow castShadow><boxGeometry args={[CHECK.w, 0.0004, CHECK.d]} /></mesh>
      {/* the server's hand, written on the word (c_diner INK) */}
      <group position={[CHECK.x, 0.0072, CHECK.z]} rotation-y={CHECK.ry}>
        <WriteDecal id="paid" k={ink.paid ?? 1} ready={ready} />
        <WriteDecal id="note" k={ink.note ?? 1} ready={ready} />
      </group>
      {/* the pen beside it */}
      <group position={[0.05, 0.0105, 0.0]} rotation-y={Math.PI / 2 - 0.08}>
        <mesh rotation-z={Math.PI / 2} castShadow><cylinderGeometry args={[0.0042, 0.0042, 0.12, 14]} /><meshStandardMaterial color="#163E7A" roughness={0.3} metalness={0.2} /></mesh>
        <mesh position={[0.066, 0, 0]} rotation-z={Math.PI / 2}><coneGeometry args={[0.0042, 0.012, 14]} /><meshStandardMaterial color="#C8D2DE" metalness={0.9} roughness={0.25} /></mesh>
        <mesh position={[-0.04, 0.0045, 0]}><boxGeometry args={[0.04, 0.0012, 0.0028]} /><meshStandardMaterial color="#C8D2DE" metalness={0.9} roughness={0.25} /></mesh>
      </group>
    </group>
  );
};
// ── the whole set ─────────────────────────────────────────────────────────────────────────────────────────────────────
export const DinerSet = ({ ink = {} } = {}) => {
  const M = useMats();
  const ready = usePropFonts();
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 1]} material={M.floor} receiveShadow><planeGeometry args={[8, 5.4]} /></mesh>
      <WallWindow M={M} />
      <Bench s={-1} M={M} /><Bench s={1} M={M} />
      <Table M={M} />
      <Pendant M={M} />
      <Plate M={M} />
      <Mug ceramic={M.ceramic} chrome={M.chrome} position={[0.22, TOP, -0.17]} ry={-0.4} />
      <WaterGlass position={[0.06, TOP, -0.33]} level={0.09} ice={4} />
      <WaterGlass position={[-0.29, TOP, -0.33]} level={0.06} ice={3} />
      <Caddy chrome={M.chrome} position={[-0.02, TOP, -0.535]} ry={0.04} />
      <Dispenser M={M} position={[0.17, TOP, -0.535]} />
      <Shaker M={M} position={[0.275, TOP, -0.52]} fill="#F2F2F0" />
      <Shaker M={M} position={[0.315, TOP, -0.48]} fill="#3A332C" />
      <Tent ready={ready} position={[-0.17, TOP, -0.5]} ry={0.18} />
      <CheckTray M={M} ready={ready} ink={ink} />
    </group>
  );
};
