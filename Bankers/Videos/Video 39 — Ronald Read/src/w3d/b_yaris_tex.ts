// @ts-nocheck
// ★ V39 builder B — the 2007 Yaris Liftback's printed / drawn surfaces (canvas textures, deterministic, cached by key):
//   the rear and front lamp clusters (unrolled round the body corner: lens, chrome reflectors, bulb sockets, side markers), the plastic
//   wheel cover over the steel wheel (its slots cut out), the tyre's sidewall lettering (175/65R14 82S, no brand), the grey seat cloth,
//   the centre-mounted instrument cluster (speedometer, tachometer, the odometer LCD), the centre stack (vents, the radio, the three HVAC
//   dials), the YARIS letters, the Vermont plate (no plate number). No Toyota logo artwork anywhere (a plain ellipse only).
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { BODY } from "./fonts3d";

const F = (wt, px) => `${wt} ${px}px ${BODY}`;
const noise = (c, w, h, n, rgb, a, seed = 0, sz = 2) => { for (let i = 0; i < n; i++) { c.fillStyle = `rgba(${rgb},${rnd(i + seed) * a})`; c.fillRect(rnd(i * 3 + seed + 1) * w, rnd(i * 7 + seed + 2) * h, sz, sz); } };

// ── the TAIL LAMP, unrolled: u = s / 0.48 (s = 0 at the hatch-side inner edge → round the corner onto the flank), v = y 0.66 → 1.16 ──────
export const TAIL = { s1: 0.48, y0: 0.66, y1: 1.16 };
export const tailTex = () => canvasTex("b_yaris_tail2", 512, 640, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  const X = (s) => (s / TAIL.s1) * w, Y = (y) => (1 - (y - TAIL.y0) / (TAIL.y1 - TAIL.y0)) * h;
  // the lamp's outline: a tall cluster on the corner, its inner edge hugging the hatch, a rounded top, wrapping onto the flank
  const shape = () => {
    c.beginPath();
    c.moveTo(X(0.0), Y(0.74));
    c.lineTo(X(0.0), Y(1.06));
    c.quadraticCurveTo(X(0.0), Y(1.13), X(0.07), Y(1.13));
    c.lineTo(X(0.30), Y(1.10));
    c.quadraticCurveTo(X(0.42), Y(1.08), X(0.45), Y(1.02));
    c.lineTo(X(0.455), Y(0.86));
    c.quadraticCurveTo(X(0.44), Y(0.74), X(0.36), Y(0.72));
    c.lineTo(X(0.05), Y(0.71));
    c.quadraticCurveTo(X(0.0), Y(0.71), X(0.0), Y(0.74));
    c.closePath();
  };
  // the dark housing + chrome rim
  c.save(); shape(); c.fillStyle = "#1A0507"; c.fill(); c.clip();
  // upper: the tail / stop lamp — a deep red lens over a round chrome reflector with its bulb
  const g1 = c.createLinearGradient(0, Y(1.12), 0, Y(0.93)); g1.addColorStop(0, "#6E0A10"); g1.addColorStop(0.5, "#9A1218"); g1.addColorStop(1, "#5A070C");
  c.fillStyle = g1; c.fillRect(0, Y(1.14), w, Y(0.935) - Y(1.14));
  const cx = X(0.12), cy = Y(1.03), R = X(0.075);
  for (let k = 6; k >= 1; k--) { c.strokeStyle = `rgba(${k % 2 ? "220,110,110" : "110,16,20"},0.28)`; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, R * k / 6, 0, 7); c.stroke(); }
  const gb = c.createRadialGradient(cx, cy, 2, cx, cy, R * 0.45); gb.addColorStop(0, "#FFD0C8"); gb.addColorStop(1, "rgba(200,40,40,0)"); c.fillStyle = gb; c.beginPath(); c.arc(cx, cy, R * 0.45, 0, 7); c.fill();
  // the lens' fine optics: vertical flutes across the red
  for (let x = 0; x < w; x += 7) { c.fillStyle = "rgba(255,170,170,0.07)"; c.fillRect(x, Y(1.14), 2, Y(0.935) - Y(1.14)); }
  // the side-marker section wrapping onto the flank (US: red side marker)
  c.fillStyle = "rgba(255,90,90,0.18)"; c.fillRect(X(0.33), Y(1.1), X(0.48) - X(0.33), Y(0.94) - Y(1.1));
  for (let k = 0; k < 6; k++) { c.fillStyle = "rgba(60,0,4,0.5)"; c.fillRect(X(0.34) + k * 14, Y(1.08), 6, Y(0.96) - Y(1.08)); }
  // middle: the turn signal — a red lens over a faceted silver reflector
  c.fillStyle = "#7A0C12"; c.fillRect(0, Y(0.935), w, Y(0.84) - Y(0.935));
  for (let i = 0; i < 18; i++) for (let j = 0; j < 4; j++) { const x0 = X(0.01) + i * 24, y0 = Y(0.93) + j * 19; const g = c.createLinearGradient(x0, y0, x0 + 22, y0 + 17); g.addColorStop(0, "rgba(255,140,140,0.16)"); g.addColorStop(1, "rgba(40,0,0,0.16)"); c.fillStyle = g; c.fillRect(x0, y0, 22, 17); }
  // lower: the clear reverse lamp — clear lens, a chrome parabolic reflector, the bulb
  const g3 = c.createLinearGradient(0, Y(0.84), 0, Y(0.72)); g3.addColorStop(0, "#C9CED6"); g3.addColorStop(0.5, "#F2F4F8"); g3.addColorStop(1, "#8D939C");
  c.fillStyle = g3; c.fillRect(0, Y(0.84), w, Y(0.7) - Y(0.84));
  const rx = X(0.13), ry = Y(0.78);
  for (let k = 5; k >= 1; k--) { c.strokeStyle = `rgba(${k % 2 ? "110,116,126" : "255,255,255"},0.35)`; c.lineWidth = 2; c.beginPath(); c.ellipse(rx, ry, X(0.09) * k / 5, (Y(0.73) - Y(0.83)) * 0.5 * k / 5, 0, 0, 7); c.stroke(); }
  c.fillStyle = "#FFFFFF"; c.beginPath(); c.arc(rx, ry, 9, 0, 7); c.fill();
  c.fillStyle = "rgba(160,20,24,0.9)"; c.fillRect(X(0.32), Y(0.84), X(0.46) - X(0.32), Y(0.72) - Y(0.84));   // red reflex section round the corner
  // dividers between the sections
  c.fillStyle = "#1C1C20"; c.fillRect(0, Y(0.94) - 3, w, 6); c.fillRect(0, Y(0.84) - 3, w, 6);
  // the lens' gloss: a soft highlight down the curve
  const gl = c.createLinearGradient(X(0.0), 0, X(0.46), 0); gl.addColorStop(0, "rgba(255,255,255,0)"); gl.addColorStop(0.55, "rgba(255,255,255,0.16)"); gl.addColorStop(0.7, "rgba(255,255,255,0)"); c.fillStyle = gl; c.fillRect(0, 0, w, h);
  c.restore();
  shape(); c.strokeStyle = "#2A2A2E"; c.lineWidth = 7; c.stroke();
});

// ── the HEADLAMP, unrolled by arc length: s = 0 at its swept-back tip on the fender → round the corner → its inner end by the grille;
//    v = y 0.60 → 0.90. A big swept teardrop following the hood line: clear lens over a chrome housing, the low- and high-beam reflector
//    bowls with their bulb shields, the amber turn signal and the amber side marker (US) at the rear tip.
export const HEAD = { s1: 0.75, y0: 0.6, y1: 0.9 };
export const headTex = () => canvasTex("b_yaris_head3", 1024, 320, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  const kx = w / HEAD.s1, ky = h / (HEAD.y1 - HEAD.y0);
  const X = (s) => s * kx, Y = (y) => (1 - (y - HEAD.y0) / (HEAD.y1 - HEAD.y0)) * h;
  const shape = () => {
    c.beginPath();
    c.moveTo(X(0.02), Y(0.835));
    c.quadraticCurveTo(X(0.1), Y(0.868), X(0.3), Y(0.872));
    c.lineTo(X(0.55), Y(0.865));
    c.quadraticCurveTo(X(0.69), Y(0.86), X(0.7), Y(0.79));
    c.quadraticCurveTo(X(0.71), Y(0.71), X(0.63), Y(0.69));
    c.quadraticCurveTo(X(0.45), Y(0.665), X(0.3), Y(0.69));
    c.quadraticCurveTo(X(0.12), Y(0.73), X(0.02), Y(0.835));
    c.closePath();
  };
  c.save(); shape(); c.fillStyle = "#3A3F47"; c.fill(); c.clip();
  const g = c.createLinearGradient(0, Y(0.88), 0, Y(0.66)); g.addColorStop(0, "#E9EDF2"); g.addColorStop(0.45, "#A3ABB6"); g.addColorStop(1, "#5E6570"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  // the amber side marker at the swept tip and the amber turn signal along the lower edge
  c.fillStyle = "#D9851E"; c.fillRect(0, 0, X(0.13), h);
  for (let k = 0; k < 6; k++) { c.fillStyle = "rgba(120,60,0,0.35)"; c.fillRect(X(0.015) + k * 26, 0, 9, h); }
  c.fillStyle = "#2B2F36"; c.fillRect(X(0.13) - 3, 0, 6, h);
  c.fillStyle = "#E39A30"; c.beginPath(); c.moveTo(X(0.17), Y(0.70)); c.lineTo(X(0.36), Y(0.675)); c.lineTo(X(0.36), Y(0.725)); c.lineTo(X(0.2), Y(0.745)); c.closePath(); c.fill();
  for (let k = 0; k < 8; k++) { c.fillStyle = "rgba(255,220,160,0.3)"; c.fillRect(X(0.18) + k * 30, Y(0.74), 8, Y(0.68) - Y(0.74)); }
  // the reflector bowls (low beam outboard, high beam inboard), round in the real surface (ellipses in the unrolled texture)
  for (const [s, y, r] of [[0.43, 0.775, 0.068], [0.585, 0.77, 0.055]]) {
    const cx = X(s), cy = Y(y), rx = r * kx, ry = r * ky;
    const rg = c.createRadialGradient(cx - rx * 0.3, cy - ry * 0.3, 2, cx, cy, Math.max(rx, ry)); rg.addColorStop(0, "#FFFFFF"); rg.addColorStop(0.4, "#C7CDD6"); rg.addColorStop(0.85, "#6B727D"); rg.addColorStop(1, "#2E333A");
    c.fillStyle = rg; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.fill();
    for (let k = 1; k <= 4; k++) { c.strokeStyle = "rgba(60,66,76,0.3)"; c.lineWidth = 2; c.beginPath(); c.ellipse(cx, cy, rx * k / 4.4, ry * k / 4.4, 0, 0, 7); c.stroke(); }
    c.strokeStyle = "rgba(40,44,52,0.8)"; c.lineWidth = 4; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.stroke();
    c.fillStyle = "#2A2E35"; c.beginPath(); c.ellipse(cx, cy, 12 * kx / ky, 12, 0, 0, 7); c.fill();
    c.fillStyle = "#F4F6FA"; c.beginPath(); c.arc(cx - 3, cy - 3, 4, 0, 7); c.fill();
  }
  // the parking-lamp strip along the top, the black inner bezel at the inner end
  c.fillStyle = "rgba(255,255,255,0.6)"; c.fillRect(X(0.2), Y(0.855), X(0.62) - X(0.2), 5);
  c.fillStyle = "#1C1F24"; c.fillRect(X(0.655), 0, X(0.72) - X(0.655), h);
  const gl = c.createLinearGradient(0, Y(0.88), 0, Y(0.66)); gl.addColorStop(0, "rgba(255,255,255,0.35)"); gl.addColorStop(0.3, "rgba(255,255,255,0)"); c.fillStyle = gl; c.fillRect(0, 0, w, h);
  c.restore();
  shape(); c.strokeStyle = "#20242A"; c.lineWidth = 6; c.stroke();
});

// ── the plastic WHEEL COVER over the black steel wheel: a silver 14" cover, 10 slots (cut out: alpha 0) round a plain hub ─────────────
export const coverTex = () => canvasTex("b_yaris_cover2", 512, 512, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  const g = c.createRadialGradient(cx - 50, cy - 70, 20, cx, cy, w / 2); g.addColorStop(0, "#E6EAF0"); g.addColorStop(0.65, "#AEB5BE"); g.addColorStop(1, "#7A818A");
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, w / 2 - 2, 0, 7); c.fill();
  // the slots between ten spokes: cut out (see the steel wheel and the brake through them)
  c.globalCompositeOperation = "destination-out";
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    c.beginPath();
    const r0 = 98, r1 = 214, da0 = 0.17, da1 = 0.2;
    c.moveTo(cx + Math.cos(a - da0) * r0, cy + Math.sin(a - da0) * r0);
    c.arc(cx, cy, r0, a - da0, a + da0);
    c.lineTo(cx + Math.cos(a + da1) * r1, cy + Math.sin(a + da1) * r1);
    c.arc(cx, cy, r1, a + da1, a - da1, true);
    c.closePath(); c.fill();
  }
  c.globalCompositeOperation = "source-over";
  // the slots' moulded edges, the outer rim lip, the centre cap (a plain raised disc with a plain ellipse)
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    c.strokeStyle = "rgba(50,54,60,0.55)"; c.lineWidth = 5; c.beginPath();
    c.arc(cx, cy, 98, a - 0.17, a + 0.17); c.lineTo(cx + Math.cos(a + 0.2) * 214, cy + Math.sin(a + 0.2) * 214); c.arc(cx, cy, 214, a + 0.2, a - 0.2, true); c.closePath(); c.stroke();
  }
  c.strokeStyle = "rgba(255,255,255,0.5)"; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, 236, 0, 7); c.stroke();
  c.strokeStyle = "rgba(40,44,50,0.6)"; c.lineWidth = 8; c.beginPath(); c.arc(cx, cy, 250, 0, 7); c.stroke();
  const gc = c.createRadialGradient(cx - 15, cy - 20, 4, cx, cy, 72); gc.addColorStop(0, "#F2F4F7"); gc.addColorStop(1, "#9BA2AB");
  c.fillStyle = gc; c.beginPath(); c.arc(cx, cy, 70, 0, 7); c.fill();
  c.strokeStyle = "rgba(60,64,70,0.75)"; c.lineWidth = 5; c.beginPath(); c.ellipse(cx, cy, 34, 22, 0, 0, 7); c.stroke();
  // a little road grime / salt
  for (let i = 0; i < 2500; i++) { const r = 150 + rnd(i) * 106, a = rnd(i + 9) * 7; c.fillStyle = `rgba(${rnd(i + 3) < 0.5 ? "70,60,50" : "235,235,228"},${rnd(i + 1) * 0.12})`; c.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 2); }
});

// ── the tyre's SIDEWALL: raised lettering round the ring (size and load/speed, TUBELESS, M+S; no brand) ──────────────────────────
export const sidewallTex = () => canvasTex("b_yaris_sidewall", 1024, 1024, (c, w, h) => {
  c.fillStyle = "#1B1D20"; c.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  // ring shading (the bulge of the sidewall), then the moulded text along the arc
  for (let r = 300; r < 512; r += 2) { const t = (r - 300) / 212; c.strokeStyle = `rgba(255,255,255,${0.035 * Math.sin(Math.PI * t)})`; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke(); }
  const arcText = (txt, r, a0, px, wt = 700) => {
    c.font = F(wt, px); c.fillStyle = "#4A4E55"; c.textAlign = "center"; c.textBaseline = "middle";
    let a = a0 - (c.measureText(txt).width / r) / 2;
    for (const ch of txt) { const cw = c.measureText(ch).width; a += cw / 2 / r; c.save(); c.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r); c.rotate(a + Math.PI / 2); c.fillText(ch, 0, 0); c.restore(); a += cw / 2 / r; }
  };
  arcText("175/65R14  82S", 405, -Math.PI / 2, 52);
  arcText("M+S", 405, 0, 38);
  arcText("175/65R14  82S", 405, Math.PI / 2, 52);
  arcText("TUBELESS  RADIAL", 405, Math.PI, 30, 600);
  c.strokeStyle = "rgba(90,94,100,0.6)"; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, 352, 0, 7); c.stroke(); c.beginPath(); c.arc(cx, cy, 462, 0, 7); c.stroke();
  noise(c, w, h, 3000, "200,200,190", 0.05, 11);
});

// ── the SEAT CLOTH: grey woven cloth with a small pattern (the centre panels); bolsters use the same weave, darker via vertex colour ─────
export const clothTex = () => {
  const t = canvasTex("b_yaris_cloth2", 256, 256, (c, w, h) => {
    c.fillStyle = "#8E9194"; c.fillRect(0, 0, w, h);
    // the weave: a fine 2 px twill
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) { const v = ((x >> 1) + (y >> 1)) % 3; c.fillStyle = v === 0 ? "rgba(0,0,0,0.10)" : v === 1 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"; c.fillRect(x, y, 2, 2); }
    // the pattern: a small woven fleck grid (darker short dashes, lighter specks) — reads as a mid-grey patterned cloth
    for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) {
      const ox = (y / 16) % 2 ? 8 : 0;
      c.fillStyle = "rgba(46,50,58,0.32)"; c.fillRect(x + ox, y + 6, 6, 3);
      c.fillStyle = "rgba(210,214,220,0.22)"; c.fillRect(x + ox + 9, y + 1, 2, 2);
    }
    noise(c, w, h, 5000, "30,30,34", 0.1, 3, 1);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4);
  return t;
};

// ── the INSTRUMENT CLUSTER (centre-mounted on top of the dash, facing the driver): tachometer | speedometer | the fuel/odometer LCD ──
export const gaugeTex = () => canvasTex("b_yaris_gauges", 1024, 384, (c, w, h) => {
  c.fillStyle = "#08090B"; c.fillRect(0, 0, w, h);
  const dial = (cx, cy, R, a0, a1, n, sub, labels, title, unit) => {
    const g = c.createRadialGradient(cx, cy, 4, cx, cy, R + 14); g.addColorStop(0, "#16181C"); g.addColorStop(1, "#050607"); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R + 12, 0, 7); c.fill();
    c.strokeStyle = "#8E959F"; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, R + 12, 0, 7); c.stroke();
    for (let i = 0; i <= n * sub; i++) {
      const a = a0 + (a1 - a0) * i / (n * sub), major = i % sub === 0, r0 = major ? R - 22 : R - 12;
      c.strokeStyle = major ? "#F2F4F7" : "#A9B0BA"; c.lineWidth = major ? 4 : 2;
      c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke();
      if (major && labels[i / sub] != null) { c.fillStyle = "#F2F4F7"; c.font = F(700, R * 0.2); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(labels[i / sub], cx + Math.cos(a) * (R - 46), cy + Math.sin(a) * (R - 46)); }
    }
    c.fillStyle = "#C9CED6"; c.font = F(600, R * 0.12); c.textAlign = "center"; c.fillText(title, cx, cy + R * 0.42);
    if (unit) { c.font = F(500, R * 0.1); c.fillStyle = "#8E959F"; c.fillText(unit, cx, cy + R * 0.58); }
    // the needle at rest (engine off) and its hub
    c.strokeStyle = "#F06A1E"; c.lineWidth = 6; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a0 + 0.02) * (R - 16), cy + Math.sin(a0 + 0.02) * (R - 16)); c.stroke();
    c.fillStyle = "#202328"; c.beginPath(); c.arc(cx, cy, 16, 0, 7); c.fill();
  };
  const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25;
  dial(220, 196, 150, a0, a1, 8, 2, ["0", "1", "2", "3", "4", "5", "6", "7", "8"], "x1000r/min", "");
  dial(560, 196, 170, a0, a1, 12, 2, ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100", "110", "120"], "MPH", "km/h");
  c.fillStyle = "rgba(60,64,70,1)"; c.fillRect(470, 280, 0, 0);
  // the red zone on the tach
  c.strokeStyle = "#D93A3A"; c.lineWidth = 10; c.beginPath(); c.arc(220, 196, 142, a0 + (a1 - a0) * 6.5 / 8, a1); c.stroke();
  // the LCD: fuel bars, the odometer (blank digits — no invented mileage), the coolant mark
  c.fillStyle = "#1A1E18"; c.fillRect(780, 90, 210, 210); c.strokeStyle = "#5A6068"; c.lineWidth = 3; c.strokeRect(780, 90, 210, 210);
  c.fillStyle = "#7E8A74"; c.font = F(700, 26); c.textAlign = "left"; c.fillText("F", 800, 125); c.fillText("E", 800, 255);
  for (let i = 0; i < 8; i++) { c.fillStyle = i < 5 ? "#9FAE92" : "#2E3329"; c.fillRect(830, 240 - i * 17, 52, 12); }
  c.fillStyle = "#7E8A74"; c.font = F(700, 22); c.fillText("ODO", 900, 125); c.fillText("TRIP", 900, 255);
  c.fillStyle = "#3A4234"; c.font = F(700, 34); c.fillText("88888", 898, 175);
  // warning lamp row (unlit)
  const lamps = ["BRAKE", "ABS", "CHECK", "SEAT BELT"];
  lamps.forEach((t, i) => { c.fillStyle = "#3A1E1E"; c.font = F(700, 18); c.textAlign = "center"; c.fillText(t, 420 + i * 95, 360); });
});

// ── the CENTRE STACK face: two centre vents, the radio head unit, the three HVAC dials, A/C and recirculation, the 12V outlet ──────────
export const stackTex = () => canvasTex("b_yaris_stack", 512, 1024, (c, w, h) => {
  c.fillStyle = "#2B2E33"; c.fillRect(0, 0, w, h);
  noise(c, w, h, 6000, "0,0,0", 0.12, 7, 2);
  // the two centre vents (slats + the thumb wheels)
  for (const x0 of [40, 266]) {
    c.fillStyle = "#121417"; c.beginPath(); c.roundRect(x0, 30, 206, 170, 14); c.fill();
    for (let k = 0; k < 7; k++) { c.fillStyle = "#3A3E44"; c.fillRect(x0 + 10, 48 + k * 22, 186, 8); }
    c.fillStyle = "#5A5F66"; c.fillRect(x0 + 92, 42, 22, 146);
  }
  // the radio: AM/FM/CD head unit with its display and keys
  c.fillStyle = "#16181B"; c.beginPath(); c.roundRect(28, 240, 456, 300, 18); c.fill();
  c.strokeStyle = "#5A6068"; c.lineWidth = 3; c.stroke();
  c.fillStyle = "#0B0D0B"; c.fillRect(70, 260, 372, 28); c.fillStyle = "#2E3236"; c.fillRect(110, 270, 292, 6);   // the CD slot
  c.fillStyle = "#1E2A30"; c.fillRect(150, 310, 212, 80);
  c.fillStyle = "#7FB4C8"; c.font = F(700, 44); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("FM1  98.7", 256, 352);
  for (const [x, label] of [[80, "PWR·VOL"], [432, "TUNE·FILE"]]) {
    c.fillStyle = "#3A3E44"; c.beginPath(); c.arc(x, 350, 38, 0, 7); c.fill(); c.strokeStyle = "#8E959F"; c.lineWidth = 3; c.stroke();
    c.fillStyle = "#C9CED6"; c.font = F(600, 18); c.fillText(label, x, 410);
  }
  const keys = ["1", "2", "3", "4", "5", "6"];
  keys.forEach((k, i) => { c.fillStyle = "#2E3236"; c.beginPath(); c.roundRect(46 + i * 72, 432, 62, 40, 6); c.fill(); c.fillStyle = "#E6EAF0"; c.font = F(700, 24); c.fillText(k, 77 + i * 72, 453); });
  ["AM", "FM", "SEEK", "TRACK", "SCAN", "CD"].forEach((k, i) => { c.fillStyle = "#2E3236"; c.beginPath(); c.roundRect(46 + i * 72, 484, 62, 34, 6); c.fill(); c.fillStyle = "#C9CED6"; c.font = F(700, k.length > 3 ? 15 : 19); c.fillText(k, 77 + i * 72, 502); });
  // the HVAC panel: fan, temperature, mode — three big dials, A/C and recirculation buttons
  c.fillStyle = "#1E2125"; c.beginPath(); c.roundRect(20, 580, 472, 260, 18); c.fill();
  const knob = (x, y, labelsAround, kind) => {
    c.fillStyle = "#3C4046"; c.beginPath(); c.arc(x, y, 58, 0, 7); c.fill();
    c.fillStyle = "#4A4F56"; c.beginPath(); c.arc(x, y, 44, 0, 7); c.fill();
    c.fillStyle = "#E6EAF0"; c.fillRect(x - 3, y - 44, 6, 22);
    if (kind === "temp") {
      for (let i = 0; i < 20; i++) { const a = Math.PI * (0.75 + 1.5 * i / 19); c.fillStyle = `rgb(${Math.round(60 + 180 * i / 19)},${90},${Math.round(230 - 180 * i / 19)})`; c.beginPath(); c.arc(x + Math.cos(a) * 72, y + Math.sin(a) * 72, 6, 0, 7); c.fill(); }
    } else {
      labelsAround.forEach((t, i) => { const a = Math.PI * (0.8 + 1.4 * i / (labelsAround.length - 1)); c.fillStyle = "#C9CED6"; c.font = F(700, 18); c.fillText(t, x + Math.cos(a) * 80, y + Math.sin(a) * 80); });
    }
  };
  knob(100, 690, ["OFF", "1", "2", "3", "4"], "fan");
  knob(256, 690, [], "temp");
  knob(412, 690, ["▲", "◢", "◣", "▼", "⊿"], "mode");
  for (const [x, t] of [[180, "A/C"], [332, "RECIRC"]]) { c.fillStyle = "#2E3236"; c.beginPath(); c.roundRect(x - 52, 790, 104, 36, 8); c.fill(); c.fillStyle = "#C9CED6"; c.font = F(700, 20); c.fillText(t, x, 809); }
  // the cubby and the 12 V outlet
  c.fillStyle = "#101113"; c.beginPath(); c.roundRect(60, 870, 392, 120, 14); c.fill();
  c.fillStyle = "#3A3E44"; c.beginPath(); c.arc(420, 930, 22, 0, 7); c.fill(); c.fillStyle = "#0A0A0A"; c.beginPath(); c.arc(420, 930, 13, 0, 7); c.fill();
  c.fillStyle = "#8E959F"; c.font = F(700, 16); c.fillText("12V", 420, 970);
});

// ── a round side vent face (slats) ────────────────────────────────────────────────────────────────────────────────────────────
export const ventTex = () => canvasTex("b_yaris_vent", 128, 128, (c, w, h) => {
  c.fillStyle = "#3A3E44"; c.beginPath(); c.arc(64, 64, 63, 0, 7); c.fill();
  c.fillStyle = "#101113"; c.beginPath(); c.arc(64, 64, 52, 0, 7); c.fill();
  for (let k = 0; k < 6; k++) { c.fillStyle = "#4A4F56"; c.fillRect(16, 26 + k * 14, 96, 5); }
  c.fillStyle = "#6A7078"; c.fillRect(58, 14, 12, 100);
});

// ── a door speaker grille ────────────────────────────────────────────────────────────────────────────────────────────────────
export const grilleTex = () => canvasTex("b_yaris_spk", 128, 128, (c, w, h) => {
  c.fillStyle = "#24262A"; c.fillRect(0, 0, w, h);
  for (let y = 6; y < h; y += 9) for (let x = 6 + ((y / 9) % 2) * 4; x < w; x += 9) { c.fillStyle = "#0B0C0E"; c.beginPath(); c.arc(x, y, 2.6, 0, 7); c.fill(); }
});

// ── the YARIS letters (plain chrome) and the Vermont plate (VERMONT / GREEN MOUNTAIN STATE only — no invented plate number) ──────
export const yarisBadgeTex = () => canvasTex("b_yaris_badge", 512, 128, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  c.font = F(700, 96); c.textAlign = "center"; c.textBaseline = "middle";
  if ("letterSpacing" in c) c.letterSpacing = "10px";
  c.fillStyle = "#3A3F46"; c.fillText("YARIS", w / 2 + 3, h / 2 + 5);
  const g = c.createLinearGradient(0, 20, 0, h - 20); g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.5, "#AEB6C0"); g.addColorStop(1, "#E6EAF0");
  c.fillStyle = g; c.fillText("YARIS", w / 2, h / 2);
});
export const plateTex = () => canvasTex("b_vt_plate", 600, 300, (c, w, h) => {
  c.fillStyle = "#1F5A3A"; c.beginPath(); c.roundRect(0, 0, w, h, 22); c.fill();
  c.strokeStyle = "#F2F2EE"; c.lineWidth = 10; c.beginPath(); c.roundRect(12, 12, w - 24, h - 24, 16); c.stroke();
  c.fillStyle = "#F2F2EE"; c.textAlign = "center"; c.textBaseline = "middle";
  c.font = F(800, 128); c.fillText("VERMONT", w / 2, 160, w - 60);   /* no invented plate number */
  c.font = F(700, 30); c.fillText("GREEN MOUNTAIN STATE", w / 2, 258);
  for (const x of [70, w - 70]) { c.fillStyle = "#8A9099"; c.beginPath(); c.arc(x, 50, 9, 0, 7); c.fill(); }
  for (let i = 0; i < 2000; i++) { c.fillStyle = `rgba(40,40,30,${rnd(i) * 0.08})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
});
