// @ts-nocheck
// ★ V39 builder E — HAVILAND'S SERVICE STATION, the detail pass (Timur, 2026-11-27: "the service station (Haviland's) … make sure the
//   text on the service station doesn't overlap"). Parts used by st_gas.tsx:
//   <OfficeRoom>   the lit office seen through the plate window, built in 3-D: linoleum floor, a pegboard back wall with fan belts and
//                  hoses, shelves of quart oil cans (plain generic labels), boxed parts, a counter with a cash register, a tire display
//                  stand, a drinks cooler, a wall clock and a calendar (no year), a road-map rack, a fluorescent ceiling fixture
//   <BayDoor>      the sectional overhead door in 3-D: four panelled sections with their joints, the lit window row (the garage seen
//                  through it: a workbench, a tool board, a tire, a hanging work lamp), the side tracks, the lift handle and lock
//   <PoleSign>     a lighted double-faced box sign on a steel pole by the road (HAVILAND'S / GAS · OIL · REPAIRS)
//   lotTex / roadTex  the plowed lot (packed snow, tyre tracks, ice, sand) and the plowed winter road (wet wheel tracks, packed snow,
//                  a faint centre line, slush and windrows at its edges)
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { canvasTex, rnd, Glow } from "./kit";
import { SIGNF, boxText, poleSignTex, Tire } from "./b_pump";
import { BODY } from "./fonts3d";

// ── textures ────────────────────────────────────────────────────────────────────────────────────────────────────────────
const canLabel = (k) => canvasTex("e_can" + k, 512, 256, (c, w, h) => {
  const bands = [["#1F3A63", "#D9DEE6"], ["#2E4F3A", "#E6E1C8"], ["#5E2A22", "#E9E4D8"], ["#C9A13A", "#2A2A2A"]][k];
  c.fillStyle = bands[1]; c.fillRect(0, 0, w, h);
  c.fillStyle = bands[0]; c.fillRect(0, h * 0.16, w, h * 0.52);
  for (const cx of [w * 0.25, w * 0.75]) {
    boxText(c, ["MOTOR OIL", "MOTOR OIL", "HEAVY DUTY", "MOTOR OIL"][k], SIGNF, 700, [cx - 110, h * 0.2, cx + 110, h * 0.44], "#FFFFFF", 0.04);
    boxText(c, ["SAE 30", "SAE 20", "SAE 40", "SAE 10W"][k], BODY, 800, [cx - 80, h * 0.46, cx + 80, h * 0.64], "#FFFFFF", 0.06);
    boxText(c, "ONE U.S. QUART", BODY, 700, [cx - 100, h * 0.72, cx + 100, h * 0.9], k === 3 ? "#F2EEDF" : "#20242A", 0.08);
  }
  c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(0, 0, w, 8); c.fillRect(0, h - 8, w, 8);
});
const boxLabel = (k) => canvasTex("e_partbox" + k, 256, 256, (c, w, h) => {
  c.fillStyle = ["#C9502E", "#2C5A8C", "#E2C04A", "#3E6E48"][k]; c.fillRect(0, 0, w, h);
  c.fillStyle = "#F4EFE2"; c.fillRect(0, h * 0.32, w, h * 0.36);
  boxText(c, ["SPARK PLUGS", "OIL FILTER", "FAN BELT", "WIPER BLADES"][k], SIGNF, 600, [10, h * 0.34, w - 10, h * 0.66], "#1E2633", 0.1);
});
/** the office's back wall (2048 × 1560 over its ~3.8 × 2.9 m): cream paint over a dark green wainscot; on the left a pegboard of fan
 *  belts and radiator hoses, a wall clock, a calendar (a month grid, no year), a fire extinguisher; over the shelving on the right a
 *  painted wall sign TIRES · BATTERIES · ACCESSORIES (each line inside its own panel) */
const officeWallTex = () => canvasTex("e_office_wall_v2", 2048, 1560, (c, w, h) => {
  c.fillStyle = "#E3D9BF"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 12000; i++) { c.fillStyle = `rgba(110,90,60,${rnd(i) * 0.05})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 3, 3); }
  const wy = 960;
  c.fillStyle = "#2F4A3A"; c.fillRect(0, wy, w, h - wy);                              // wainscot
  c.fillStyle = "#24392D"; for (let x = 0; x < w; x += 64) c.fillRect(x, wy, 4, h - wy);
  c.fillStyle = "#3A2A1C"; c.fillRect(0, wy - 18, w, 18);                             // chair rail
  // the pegboard, fan belts and hoses hanging on hooks
  const px0 = 70, py0 = 150, pw = 640, ph = 470;
  c.fillStyle = "#B49A72"; c.fillRect(px0, py0, pw, ph);
  c.fillStyle = "#5A4630"; for (let y = py0 + 14; y < py0 + ph; y += 28) for (let x = px0 + 14; x < px0 + pw; x += 28) { c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); }
  c.strokeStyle = "#3A2A1C"; c.lineWidth = 10; c.strokeRect(px0, py0, pw, ph);
  for (let k = 0; k < 6; k++) {
    const x = px0 + 60 + k * 100, r = 30 + rnd(k) * 24;
    c.strokeStyle = "#7A7A7A"; c.lineWidth = 4; c.beginPath(); c.moveTo(x, py0 + 40); c.lineTo(x, py0 + 60); c.stroke();
    c.strokeStyle = "#16181C"; c.lineWidth = 9; c.beginPath(); c.ellipse(x, py0 + 60 + r * 1.6, r * 0.5, r * 1.6, 0, 0, 7); c.stroke();
  }
  for (let k = 0; k < 2; k++) { const x = px0 + 130 + k * 260; c.strokeStyle = "#1E2024"; c.lineWidth = 22; c.beginPath(); c.moveTo(x, py0 + 330); c.bezierCurveTo(x + 40, py0 + 360, x + 90, py0 + 330, x + 120, py0 + 420); c.stroke(); }
  // the wall clock
  const cx = 880, cy = 230;
  c.fillStyle = "#2A2A2A"; c.beginPath(); c.arc(cx, cy, 98, 0, 7); c.fill(); c.fillStyle = "#F7F2E6"; c.beginPath(); c.arc(cx, cy, 86, 0, 7); c.fill();
  c.fillStyle = "#1E2024"; for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; c.fillRect(cx + Math.cos(a) * 72 - 3, cy + Math.sin(a) * 72 - 3, 6, 6); }
  c.strokeStyle = "#1E2024"; c.lineWidth = 7; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + 40, cy - 30); c.moveTo(cx, cy); c.lineTo(cx - 8, cy - 66); c.stroke();
  // the calendar: a covered bridge in snow over a month grid (no year)
  const kx = 760, ky = 380;
  c.fillStyle = "#F4F0E4"; c.fillRect(kx, ky, 270, 400);
  const sky = c.createLinearGradient(0, ky + 16, 0, ky + 190); sky.addColorStop(0, "#7FA0C8"); sky.addColorStop(1, "#DCE6F2"); c.fillStyle = sky; c.fillRect(kx + 14, ky + 14, 242, 170);
  c.fillStyle = "#F7FAFD"; c.fillRect(kx + 14, ky + 140, 242, 44);
  c.fillStyle = "#8E2A26"; c.fillRect(kx + 60, ky + 92, 150, 56); c.fillStyle = "#3A2A20"; c.beginPath(); c.moveTo(kx + 50, ky + 94); c.lineTo(kx + 135, ky + 56); c.lineTo(kx + 220, ky + 94); c.fill(); c.fillStyle = "#1E1612"; c.fillRect(kx + 108, ky + 104, 54, 44);
  boxText(c, "JANUARY", SIGNF, 600, [kx + 20, ky + 192, kx + 250, ky + 232], "#1E2633", 0.08);
  c.fillStyle = "#1E2633"; c.font = `600 17px ${BODY}`; c.textAlign = "center"; c.textBaseline = "alphabetic";
  ["S", "M", "T", "W", "T", "F", "S"].forEach((d, i) => c.fillText(d, kx + 37 + i * 33, ky + 256));
  for (let d = 1; d <= 31; d++) { const i = (d + 2) % 7, r = Math.floor((d + 2) / 7); c.fillStyle = i === 0 ? "#8E2A26" : "#1E2633"; c.fillText(String(d), kx + 37 + i * 33, ky + 284 + r * 22); }
  // a fire extinguisher on its bracket
  c.fillStyle = "#9E2B25"; c.beginPath(); c.roundRect(560, 700, 64, 200, 22); c.fill(); c.fillStyle = "#2A2A2A"; c.fillRect(572, 668, 40, 36);
  // the painted wall sign over the shelving: two panels, each line fitted inside its own panel
  const sx0 = 1100, sx1 = 1990;
  c.fillStyle = "#16294A"; c.beginPath(); c.roundRect(sx0, 40, sx1 - sx0, 250, 16); c.fill();
  c.fillStyle = "#F2EEDF"; c.beginPath(); c.roundRect(sx0 + 14, 54, sx1 - sx0 - 28, 120, 10); c.fill();
  boxText(c, "TIRES · BATTERIES", SIGNF, 700, [sx0 + 30, 58, sx1 - 30, 170], "#16294A", 0.1);
  boxText(c, "ACCESSORIES", SIGNF, 600, [sx0 + 30, 186, sx1 - 30, 280], "#F2EEDF", 0.12);
});
const floorTex = () => { const t = canvasTex("e_lino", 512, 512, (c, w, h) => {
  // worn checkerboard linoleum
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { c.fillStyle = (i + j) % 2 ? "#2A2622" : "#BDB49E"; c.fillRect(i * 64, j * 64, 64, 64); }
  for (let i = 0; i < 6000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "0,0,0" : "255,255,255"},${rnd(i + 1) * 0.06})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 3, 3); }
  const g = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.6); g.addColorStop(0, "rgba(255,255,255,0.08)"); g.addColorStop(1, "rgba(60,50,40,0.2)"); c.fillStyle = g; c.fillRect(0, 0, w, h);
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 3); return t; };
const coolerTex = () => canvasTex("e_cooler", 512, 256, (c, w, h) => {
  c.fillStyle = "#A8282A"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#F4EFE2"; c.beginPath(); c.roundRect(40, 60, w - 80, 120, 14); c.fill();
  boxText(c, "COLD DRINKS", SIGNF, 700, [50, 66, w - 50, 174], "#A8282A", 0.1);
  c.fillStyle = "rgba(255,255,255,0.2)"; c.fillRect(0, 10, w, 6);
});
/** the garage seen through the bay door's windows: warm work light, a tool board, a workbench, a tire, a lift post */
const garageTex = () => canvasTex("e_garage", 1024, 512, (c, w, h) => {
  const g = c.createRadialGradient(w * 0.45, h * 0.2, 20, w * 0.5, h * 0.5, w * 0.7); g.addColorStop(0, "#FFE8BE"); g.addColorStop(0.4, "#D9A060"); g.addColorStop(1, "#5A3A22");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(70,48,30,0.55)"; c.fillRect(w * 0.08, h * 0.25, w * 0.34, h * 0.4);                        // the tool board
  for (let k = 0; k < 14; k++) { c.fillStyle = "rgba(30,24,20,0.85)"; c.fillRect(w * 0.1 + k * 24, h * 0.3, 6, 40 + rnd(k) * 60); }
  c.fillStyle = "rgba(50,36,24,0.95)"; c.fillRect(w * 0.05, h * 0.68, w * 0.42, 26); c.fillRect(w * 0.07, h * 0.68, 14, h * 0.32); c.fillRect(w * 0.44, h * 0.68, 14, h * 0.32);   // bench
  c.fillStyle = "#1A1A1C"; c.beginPath(); c.arc(w * 0.62, h * 0.78, 70, 0, 7); c.fill(); c.fillStyle = "#6E6A62"; c.beginPath(); c.arc(w * 0.62, h * 0.78, 30, 0, 7); c.fill();   // tire
  c.fillStyle = "rgba(160,40,36,0.9)"; c.fillRect(w * 0.78, h * 0.15, 40, h * 0.85);                            // lift post
  c.strokeStyle = "#2A2A2A"; c.lineWidth = 4; c.beginPath(); c.moveTo(w * 0.55, 0); c.lineTo(w * 0.55, h * 0.3); c.stroke();
  c.fillStyle = "#FFF6DC"; c.beginPath(); c.arc(w * 0.55, h * 0.33, 16, 0, 7); c.fill();                         // work lamp
});
/** the plowed lot (Timur, 2026-11-27: "make sure the tracks are placed where a car actually goes — next to the pumps, and into the
 *  garage"). The texture covers the lot plane ONCE (no repeat), drawn in the station's own metres, so every tyre track follows a real
 *  car's path: in from the road and straight into the bay; in along the driving lane BESIDE the pump island (stopping at a pump) and
 *  back out to the road; an older pass along the lane behind the island. No track crosses the island or runs under a pump.
 *  LOT = the plane's extent in station metres (x −12.5…12.5, z −10.5…8.5). */
export const LOT = { x0: -12.5, x1: 12.5, z0: -10.5, z1: 8.5 };
const bez = (p0, p1, p2, p3, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; });
const line = (a, b, n = 20) => Array.from({ length: n + 1 }, (_, i) => [a[0] + (b[0] - a[0]) * (i / n), a[1] + (b[1] - a[1]) * (i / n)]);
export const CAR_PATHS = [
  // into the bay (two visits), straight in through the door at x 1.9
  { pts: bez([4.8, 8.6], [3.6, 4.5], [1.9, 1.5], [1.9, -3.45]), a: 1 },
  { pts: bez([6.0, 8.6], [4.3, 3.6], [2.05, 1.0], [2.05, -3.45]), a: 0.6 },
  // the driving lane in front of the island: in from the road, along the island (z 2.05, the pumps' side), out again
  { pts: [...bez([-7.6, 8.6], [-7.2, 4.0], [-6.2, 2.05], [-4.5, 2.05]), ...line([-4.5, 2.05], [0.6, 2.05]), ...bez([0.6, 2.05], [2.4, 2.05], [3.6, 4.5], [4.2, 8.6])], a: 1 },
  { pts: [...bez([-8.2, 8.6], [-7.8, 4.2], [-6.6, 2.2], [-4.8, 2.2]), ...line([-4.8, 2.2], [0.2, 2.2]), ...bez([0.2, 2.2], [2.0, 2.2], [3.1, 4.6], [3.6, 8.6])], a: 0.55 },
  // an older pass along the lane behind the island, out past the bay
  { pts: [...bez([-8.8, 8.6], [-8.6, 2.0], [-6.8, -1.35], [-5.0, -1.35]), ...line([-5.0, -1.35], [0.2, -1.35]), ...bez([0.2, -1.35], [2.2, -1.35], [3.1, 1.5], [3.4, 8.6])], a: 0.45 }
];
export const lotTex = () => canvasTex("e_lot_v4", 3072, 2336, (c, w, h) => {
  const X = (x) => ((x - LOT.x0) / (LOT.x1 - LOT.x0)) * w, Y = (z) => ((z - LOT.z0) / (LOT.z1 - LOT.z0)) * h, PPM = w / (LOT.x1 - LOT.x0);
  c.fillStyle = "#B4BECB"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 150000; i++) { const g = rnd(i); c.fillStyle = `rgba(${g < 0.45 ? "70,78,92" : g < 0.9 ? "235,240,248" : "120,100,78"},${0.04 + rnd(i + 1) * 0.08})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2 + rnd(i) * 3, 2); }
  for (let k = 0; k < 10; k++) { const x = rnd(k * 5) * w, y = rnd(k * 7) * h; const g = c.createRadialGradient(x, y, 5, x, y, 200 + rnd(k) * 200); g.addColorStop(0, "rgba(200,214,234,0.3)"); g.addColorStop(1, "rgba(200,214,234,0)"); c.fillStyle = g; c.fillRect(x - 420, y - 420, 840, 840); }   // ice
  // the tyre tracks: each wheel 0.72 m either side of the car's path, packed darker snow with a tread pattern; a faint packed band
  // between the wheels
  c.lineCap = "round"; c.lineJoin = "round";
  for (const P of CAR_PATHS) {
    const L = P.pts, nrm = L.map((p, i) => { const a = L[Math.max(0, i - 1)], b = L[Math.min(L.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [-dz / l, dx / l]; });
    c.strokeStyle = `rgba(110,120,140,${0.16 * P.a})`; c.lineWidth = 1.2 * PPM; c.beginPath(); L.forEach((p, i) => c.lineTo(X(p[0]), Y(p[1]))); c.stroke();
    for (const sd of [-0.72, 0.72]) {
      const W2 = L.map((p, i) => [p[0] + nrm[i][0] * sd, p[1] + nrm[i][1] * sd]);
      c.strokeStyle = `rgba(70,78,94,${0.62 * P.a})`; c.lineWidth = 0.22 * PPM; c.beginPath(); W2.forEach((p) => c.lineTo(X(p[0]), Y(p[1]))); c.stroke();
      c.strokeStyle = `rgba(240,244,250,${0.45 * P.a})`; c.lineWidth = 0.035 * PPM; for (const e of [-1, 1]) { c.beginPath(); W2.forEach((p, i) => c.lineTo(X(p[0] + nrm[i][0] * e * 0.12), Y(p[1] + nrm[i][1] * e * 0.12))); c.stroke(); }   // the ridges thrown up at its edges
      // tread: short bars across the track every ~6 cm
      c.strokeStyle = `rgba(36,42,54,${0.38 * P.a})`; c.lineWidth = 0.025 * PPM;
      for (let i = 0; i < W2.length - 1; i++) {
        const a = W2[i], b = W2[i + 1], seg = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(seg / 0.06));
        for (let q = 0; q < n; q++) { const t = q / n, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t, nx = nrm[i][0], nz = nrm[i][1]; c.beginPath(); c.moveTo(X(x - nx * 0.09), Y(z - nz * 0.09)); c.lineTo(X(x + nx * 0.09 + (b[0] - a[0]) / seg * 0.03), Y(z + nz * 0.09 + (b[1] - a[1]) / seg * 0.03)); c.stroke(); }
      }
    }
  }
  // the attendant's boot prints: from behind the island to the office door
  for (let i = 0; i < 26; i++) { const t = i / 25, x = -1.6 + (-1.22 + 1.6) * t + (i % 2 ? 0.12 : -0.12), z = -0.4 + (-3.2 + 0.4) * t; c.fillStyle = "rgba(96,106,124,0.35)"; c.beginPath(); c.ellipse(X(x), Y(z), 0.055 * PPM, 0.14 * PPM, 0.1, 0, 7); c.fill(); }
  for (let i = 0; i < 14000; i++) { c.fillStyle = `rgba(110,86,60,${0.2 + rnd(i) * 0.3})`; c.fillRect(rnd(i * 3 + 1) * w, rnd(i * 3 + 2) * h, 2, 2); }   // sand
});
/** the plowed winter road (u along the road, v across: 0 = the station side) */
export const roadTex = () => canvasTex("e_road_v3", 2048, 512, (c, w, h) => {
  c.fillStyle = "#353C48"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 40000; i++) { const g = 34 + rnd(i) * 60; c.fillStyle = `rgba(${g},${g + 6},${g + 16},0.35)`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  // packed snow: on both shoulders (thick, ragged edge), the crown of each lane between the wheel tracks, the centre
  // (soft wavy edges: low-frequency sines, so the packed snow's edge meanders like a plowed road's, never a saw-tooth)
  const wav = (x, s) => Math.sin(x / 97 + s) * 0.5 + Math.sin(x / 41 + s * 2.3) * 0.3 + Math.sin(x / 13 + s * 5.1) * 0.2;
  const band = (y0, y1, a) => {
    c.fillStyle = `rgba(214,222,234,${a})`; c.beginPath();
    for (let x = 0; x <= w; x += 4) c.lineTo(x, y0 * h + wav(x, y0 * 17) * h * 0.018);
    for (let x = w; x >= 0; x -= 4) c.lineTo(x, y1 * h + wav(x, y1 * 29) * h * 0.018);
    c.closePath(); c.fill();
    for (let i = 0; i < 1400; i++) { const x = rnd(i * 7 + y0 * 1000) * w, y = (y0 + rnd(i * 11 + y1 * 1000) * (y1 - y0)) * h; c.fillStyle = `rgba(${rnd(i) < 0.5 ? "150,160,176" : "245,248,252"},${0.15 + rnd(i + 3) * 0.2})`; c.fillRect(x, y, 3 + rnd(i) * 8, 2); }
  };
  band(0, 0.13, 0.95); band(0.87, 1, 0.95);
  band(0.24, 0.31, 0.6); band(0.69, 0.76, 0.6);
  band(0.45, 0.55, 0.45);
  // wet, darker wheel tracks with a sheen
  for (const y of [0.18, 0.37, 0.63, 0.82]) { c.fillStyle = "rgba(20,24,32,0.35)"; c.fillRect(0, y * h - h * 0.035, w, h * 0.07); c.fillStyle = "rgba(160,180,210,0.08)"; c.fillRect(0, y * h - 3, w, 6); }
  // the centre line showing through in places (double yellow)
  for (let x = 0; x < w; x += 4) if (rnd(Math.floor(x / 40)) < 0.55) { c.fillStyle = "rgba(200,168,72,0.75)"; c.fillRect(x, h * 0.487, 4, 5); c.fillRect(x, h * 0.507, 4, 5); }
  // sand and salt spots, slush at the shoulders' edge
  for (let i = 0; i < 6000; i++) { c.fillStyle = `rgba(130,104,74,${0.2 + rnd(i) * 0.3})`; c.fillRect(rnd(i * 3 + 4) * w, rnd(i * 3 + 5) * h, 2, 2); }
  for (const y of [0.13, 0.87]) { c.strokeStyle = "rgba(120,130,146,0.3)"; c.lineWidth = 7; c.beginPath(); for (let x = 0; x <= w; x += 4) c.lineTo(x, y * h + wav(x, y * 17) * h * 0.018); c.stroke(); }
});

// ── the office room behind the plate window ───────────────────────────────────────────────────────────────────────────────
//   (frame: the office's front wall at z = front, the room from x0 to x1, the window between wx0 and wx1, the floor at fy)
export const OfficeRoom = ({ front, x0, x1, fy = 0.24, depth = 3.0, ceil = 3.1, wx0, wx1, f = 0 }) => {
  const mats = useMemo(() => ({
    wall: new THREE.MeshStandardMaterial({ map: officeWallTex(), roughness: 0.85, emissive: "#FFE2B8", emissiveMap: officeWallTex(), emissiveIntensity: 0.22 }),
    side: new THREE.MeshStandardMaterial({ color: "#D9CDAE", roughness: 0.9, emissive: "#3A2A18", emissiveIntensity: 0.3 }),
    floor: new THREE.MeshStandardMaterial({ map: floorTex(), roughness: 0.4, metalness: 0.0 }),
    ceil: new THREE.MeshStandardMaterial({ color: "#E8DFC8", roughness: 0.9, emissive: "#6A5030", emissiveIntensity: 0.4 }),
    wood: new THREE.MeshStandardMaterial({ color: "#5A3E28", roughness: 0.6 }),
    top: new THREE.MeshStandardMaterial({ color: "#C9B48C", roughness: 0.35 }),
    steel: new THREE.MeshStandardMaterial({ color: "#3A3E44", roughness: 0.45, metalness: 0.7 }),
    chrome: new THREE.MeshStandardMaterial({ color: "#D6DCE4", roughness: 0.18, metalness: 0.95 }),
    reg: new THREE.MeshStandardMaterial({ color: "#7E858E", roughness: 0.3, metalness: 0.8 }),
    keys: new THREE.MeshStandardMaterial({ color: "#E8E2D2", roughness: 0.4 }),
    tube: new THREE.MeshBasicMaterial({ color: "#FFF6E2", toneMapped: false }),
    cooler: new THREE.MeshStandardMaterial({ map: coolerTex(), roughness: 0.3, metalness: 0.2 }),
    coolerB: new THREE.MeshStandardMaterial({ color: "#A8282A", roughness: 0.35, metalness: 0.2 }),
    cans: [0, 1, 2, 3].map((k) => [new THREE.MeshStandardMaterial({ map: canLabel(k), roughness: 0.35, metalness: 0.4 }), new THREE.MeshStandardMaterial({ color: "#B9C0C8", roughness: 0.3, metalness: 0.9 })]),
    boxes: [0, 1, 2, 3].map((k) => new THREE.MeshStandardMaterial({ map: boxLabel(k), roughness: 0.6 }))
  }), []);
  const can = useMemo(() => new THREE.CylinderGeometry(0.05, 0.05, 0.14, 18), []);
  const regGeo = useMemo(() => new RoundedBoxGeometry(0.42, 0.2, 0.36, 3, 0.03), []);
  const bz = front - depth, cx = (x0 + x1) / 2, W = x1 - x0;
  // shelves of cans on the back wall (right part), a pyramid of cans on the window's display shelf
  const shelfX0 = x0 + W * 0.52, shelfX1 = x1 - 0.15;
  const shelfCans = [];
  [0.95, 1.35, 1.75].forEach((y, r) => { for (let x = shelfX0 + 0.08; x < shelfX1 - 0.05; x += 0.11) shelfCans.push({ p: [x, fy + y + 0.08, bz + 0.12], k: (Math.floor((x - shelfX0) / 0.11) + r) % 4, r: rnd(x * 50 + r) }); });
  const pyr = [];
  for (let row = 0; row < 4; row++) for (let i = 0; i < 6 - row; i++) pyr.push({ p: [(wx0 + wx1) / 2 - 0.3 + i * 0.11 + row * 0.055 - 0.0, 0.95 + 0.08 + row * 0.145, front - 0.32], k: (i + row) % 4, r: rnd(i * 7 + row) });
  const tubeY = ceil - 0.08;
  return (
    <group>
      {/* the room */}
      <mesh position={[cx, fy + (ceil - fy) / 2, bz]} material={mats.wall}><planeGeometry args={[W, ceil - fy]} /></mesh>
      {[x0, x1].map((x, i) => <mesh key={i} position={[x, fy + (ceil - fy) / 2, front - depth / 2]} rotation-y={i ? -Math.PI / 2 : Math.PI / 2} material={mats.side}><planeGeometry args={[depth, ceil - fy]} /></mesh>)}
      <mesh position={[cx, fy + 0.002, front - depth / 2]} rotation-x={-Math.PI / 2} material={mats.floor} receiveShadow><planeGeometry args={[W, depth]} /></mesh>
      <mesh position={[cx, ceil, front - depth / 2]} rotation-x={Math.PI / 2} material={mats.ceil}><planeGeometry args={[W, depth]} /></mesh>
      {/* the fluorescent fixture */}
      <mesh position={[cx - 0.3, tubeY, front - depth * 0.45]} material={mats.steel}><boxGeometry args={[1.3, 0.05, 0.3]} /></mesh>
      {[-0.07, 0.07].map((z) => <mesh key={z} position={[cx - 0.3, tubeY - 0.04, front - depth * 0.45 + z]} rotation-z={Math.PI / 2} material={mats.tube}><cylinderGeometry args={[0.018, 0.018, 1.2, 10]} /></mesh>)}
      <Glow position={[cx - 0.3, tubeY - 0.1, front - depth * 0.45]} size={2.6} color="#FFF0D0" opacity={0.25} />
      {/* the shelving (three boards on brackets) and the cans on it; boxed parts on the top shelf */}
      {[0.95, 1.35, 1.75, 2.15].map((y) => <mesh key={y} position={[(shelfX0 + shelfX1) / 2, fy + y, bz + 0.13]} material={mats.wood} castShadow><boxGeometry args={[shelfX1 - shelfX0, 0.025, 0.26]} /></mesh>)}
      {shelfCans.map((q, i) => <mesh key={i} geometry={can} material={[mats.cans[q.k][0], mats.cans[q.k][1], mats.cans[q.k][1]]} position={q.p} rotation-y={-Math.PI / 2 + (q.r - 0.5) * 0.6} />)}
      {[0, 1, 2, 3, 0, 2].map((k, i) => <mesh key={i} position={[shelfX0 + 0.14 + i * 0.2, fy + 2.15 + 0.08, bz + 0.13]} rotation-y={(rnd(i) - 0.5) * 0.2} material={mats.boxes[k]}><boxGeometry args={[0.16, 0.14, 0.12]} /></mesh>)}
      {/* the window's display shelf with a pyramid of cans */}
      <mesh position={[(wx0 + wx1) / 2, 0.95, front - 0.32]} material={mats.wood}><boxGeometry args={[wx1 - wx0 - 0.1, 0.03, 0.4]} /></mesh>
      {pyr.map((q, i) => <mesh key={"p" + i} geometry={can} material={[mats.cans[q.k][0], mats.cans[q.k][1], mats.cans[q.k][1]]} position={q.p} rotation-y={-Math.PI / 2 + (q.r - 0.5) * 0.3} />)}
      {/* the counter (panelled front, worn top) with the cash register */}
      <group position={[x0 + W * 0.3, fy, front - depth * 0.62]}>
        <mesh position={[0, 0.5, 0]} material={mats.wood} castShadow><boxGeometry args={[1.5, 1.0, 0.6]} /></mesh>
        <mesh position={[0, 1.015, 0.02]} material={mats.top}><boxGeometry args={[1.58, 0.03, 0.68]} /></mesh>
        {[-0.5, 0, 0.5].map((x) => <mesh key={x} position={[x, 0.5, 0.302]} material={mats.top}><boxGeometry args={[0.4, 0.7, 0.01]} /></mesh>)}
        <group position={[0.3, 1.03, 0.0]}>
          <mesh position={[0, 0.1, 0]} geometry={regGeo} material={mats.reg} />
          <mesh position={[0, 0.27, -0.06]} material={mats.reg}><boxGeometry args={[0.36, 0.16, 0.14]} /></mesh>
          <mesh position={[0, 0.28, 0.012]} material={mats.keys}><boxGeometry args={[0.3, 0.07, 0.005]} /></mesh>
          {Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[-0.13 + (i % 6) * 0.052, 0.2, 0.12 + Math.floor(i / 6) * 0.06]} material={mats.keys}><cylinderGeometry args={[0.016, 0.016, 0.03, 10]} /></mesh>)}
          <mesh position={[0, 0.02, 0.19]} material={mats.chrome}><boxGeometry args={[0.38, 0.06, 0.02]} /></mesh>
        </group>
      </group>
      {/* the tire display stand by the window: four tires standing in a steel rack */}
      <group position={[x0 + 0.42, fy, front - 0.75]}>
        {[-1, 1].map((sd) => <mesh key={sd} position={[0, 0.5, sd * 0.16]} material={mats.steel}><boxGeometry args={[0.04, 1.0, 0.04]} /></mesh>)}
        {[0.1, 0.92].map((y) => <mesh key={y} position={[0, y, 0]} material={mats.steel}><boxGeometry args={[0.04, 0.03, 0.36]} /></mesh>)}
        {[0, 1, 2].map((k) => <Tire key={k} position={[0.0, 0.35 + k * 0.0, -0.32 + k * 0.32]} rotation={[0, Math.PI / 2, 0]} />)}
      </group>
      {/* the drinks cooler against the right wall */}
      <group position={[x1 - 0.42, fy, front - 1.2]} rotation-y={-Math.PI / 2}>
        <mesh position={[0, 0.42, 0]} material={mats.coolerB} castShadow><boxGeometry args={[0.95, 0.84, 0.55]} /></mesh>
        <mesh position={[0, 0.48, 0.276]} material={mats.cooler}><planeGeometry args={[0.8, 0.4]} /></mesh>
        <mesh position={[0, 0.86, 0]} material={mats.chrome}><boxGeometry args={[0.97, 0.03, 0.57]} /></mesh>
      </group>
      <pointLight position={[cx - 0.3, ceil - 0.4, front - depth * 0.45]} color="#FFE2B4" intensity={1.0} distance={5} decay={1.6} />
    </group>
  );
};

// ── the sectional overhead door (3-D) and the garage behind its windows ────────────────────────────────────────────────────────
export const BayDoor = ({ x, front, w = 3.0, h = 3.0, color = "#DAD8CF", trim = "#1F3A63" }) => {
  const mats = useMemo(() => ({
    door: new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.15 }),
    panel: new THREE.MeshStandardMaterial({ color: "#D0CEC4", roughness: 0.5, metalness: 0.12 }),
    joint: new THREE.MeshStandardMaterial({ color: "#2A2C30", roughness: 0.8 }),
    steel: new THREE.MeshStandardMaterial({ color: "#3A3E44", roughness: 0.45, metalness: 0.7 }),
    glass: new THREE.MeshStandardMaterial({ color: "#E6D4B4", roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.22, envMapIntensity: 1.5, depthWrite: false }),
    garage: new THREE.MeshBasicMaterial({ map: garageTex(), color: "#E8D2B0" }),
    grime: new THREE.MeshStandardMaterial({ color: "#8E887C", roughness: 0.9, transparent: true, opacity: 0.35 })
  }), []);
  const sh = h / 4, z = front + 0.02;
  return (
    <group>
      {/* the garage behind the window row (a lit room 1.4 m deep) */}
      <mesh position={[x, sh * 2.5, front - 1.4]} material={mats.garage}><planeGeometry args={[w + 0.6, sh * 2.2]} /></mesh>
      {/* the four sections: rails, stiles and recessed panels; the second from the top glazed */}
      {[0, 1, 2, 3].map((r) => {
        const y0 = r * sh, glazed = r === 2;
        return (
          <group key={r} position={[x, y0 + sh / 2, z]}>
            <mesh position={[0, sh / 2 - 0.035, 0]} material={mats.door} castShadow><boxGeometry args={[w, 0.07, 0.05]} /></mesh>
            <mesh position={[0, -sh / 2 + 0.035, 0]} material={mats.door}><boxGeometry args={[w, 0.07, 0.05]} /></mesh>
            {[0, 1, 2, 3, 4].map((k) => <mesh key={k} position={[-w / 2 + 0.05 + k * (w - 0.1) / 4, 0, 0]} material={mats.door}><boxGeometry args={[0.1, sh, 0.05]} /></mesh>)}
            {[0, 1, 2, 3].map((k) => {
              const px = -w / 2 + 0.05 + (k + 0.5) * (w - 0.1) / 4, pw = (w - 0.1) / 4 - 0.1, ph = sh - 0.14;
              return glazed
                ? <mesh key={k} position={[px, 0, 0.0]} material={mats.glass} renderOrder={3}><planeGeometry args={[pw, ph]} /></mesh>
                : <group key={k} position={[px, 0, -0.01]}>
                    <mesh material={mats.panel}><boxGeometry args={[pw, ph, 0.03]} /></mesh>
                    <mesh position={[0, 0, 0.018]} material={mats.door}><boxGeometry args={[pw - 0.08, ph - 0.08, 0.012]} /></mesh>
                  </group>;
            })}
            <mesh position={[0, -sh / 2, 0.022]} material={mats.joint}><boxGeometry args={[w, 0.012, 0.012]} /></mesh>
          </group>
        );
      })}
      {/* road grime splashed up the bottom section */}
      <mesh position={[x, 0.22, z + 0.03]} material={mats.grime}><planeGeometry args={[w, 0.42]} /></mesh>
      {/* the lift handle and the lock */}
      <mesh position={[x, 0.42, z + 0.05]} material={mats.steel}><boxGeometry args={[0.36, 0.04, 0.04]} /></mesh>
      {[-0.16, 0.16].map((d) => <mesh key={d} position={[x + d, 0.42, z + 0.035]} material={mats.steel}><boxGeometry args={[0.04, 0.06, 0.03]} /></mesh>)}
      <mesh position={[x + 0.4, 0.42, z + 0.03]} rotation-x={Math.PI / 2} material={mats.steel}><cylinderGeometry args={[0.03, 0.03, 0.02, 14]} /></mesh>
      {/* the side tracks (angle steel) and the stops */}
      {[-1, 1].map((sd) => <mesh key={sd} position={[x + sd * (w / 2 + 0.03), h / 2, z + 0.01]} material={mats.steel}><boxGeometry args={[0.05, h + 0.05, 0.06]} /></mesh>)}
      <Glow position={[x, sh * 2.5, front + 0.3]} size={3.2} color="#FFC98A" opacity={0.16} />
    </group>
  );
};

// ── the pole sign ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const PoleSign = ({ position, ry = 0, h = 6.2, sw = 2.2, shh = 1.375 }) => {
  const mats = useMemo(() => {
    const t = poleSignTex();
    return {
      face: new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: "#FFF2DC", emissiveIntensity: 0.55, roughness: 0.3 }),
      box: new THREE.MeshStandardMaterial({ color: "#16294A", roughness: 0.4, metalness: 0.5 }),
      pole: new THREE.MeshStandardMaterial({ color: "#5A6270", roughness: 0.45, metalness: 0.7 }),
      snow: new THREE.MeshStandardMaterial({ color: "#F2F6FB", roughness: 0.75 })
    };
  }, []);
  return (
    <group position={position} rotation-y={ry}>
      <mesh position={[0, h / 2, 0]} material={mats.pole} castShadow><cylinderGeometry args={[0.08, 0.1, h, 14]} /></mesh>
      <mesh position={[0, 0.15, 0]} material={mats.pole}><cylinderGeometry args={[0.2, 0.24, 0.3, 14]} /></mesh>
      <group position={[0, h - shh / 2 + 0.2, 0]}>
        <mesh material={mats.box} castShadow><boxGeometry args={[sw + 0.12, shh + 0.12, 0.3]} /></mesh>
        <mesh position={[0, 0, 0.151]} material={mats.face}><planeGeometry args={[sw, shh]} /></mesh>
        <mesh position={[0, 0, -0.151]} rotation-y={Math.PI} material={mats.face}><planeGeometry args={[sw, shh]} /></mesh>
        <mesh position={[0, shh / 2 + 0.09, 0]} material={mats.snow} scale={[1, 0.35, 1]}><boxGeometry args={[sw + 0.1, 0.16, 0.28]} /></mesh>
      </group>
      <Glow position={[0, h - shh / 2 + 0.2, 0.3]} size={3} color="#FFE8C4" opacity={0.2} />
    </group>
  );
};
