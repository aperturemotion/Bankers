// @ts-nocheck
// ★ V38 rev 2 ROAD — the sedan's printed and painted detail (builder D): panel gaps, sill trim and body-side moulding (side,
//   projected from the side), hood / cowl / deck-lid gaps (top, projected from above), the lamp clusters with their reflectors and
//   lenses, the grille, the lower intake with fog lamps, the plate, the tyre's moulded sidewall, and the cabin's printed parts
//   (gauges, radio and climate panel, door cards, seat cloth, shifter gate). Every word drawn is real, plain automotive print.
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { BODY, FIGURE } from "./fonts3d";
import { XR, LEN, XF, topY } from "./road_carbody";

const lin = (t) => { t.colorSpace = THREE.NoColorSpace; return t; };   // bump / data maps are linear
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };

// ── the body side: u = (x − XR)/LEN, v = y/1.6 ──────────────────────────────────────────────────────────────────────────
const sideDraw = (bump) => (c, w, h) => {
  const X = (x) => ((x - XR) / LEN) * w, Y = (y) => (1 - y / 1.6) * h;
  c.fillStyle = bump ? "#808080" : "#FFFFFF"; c.fillRect(0, 0, w, h);
  const gap = (pts, wd = 1) => {
    c.lineCap = "round"; c.lineJoin = "round";
    if (bump) { c.strokeStyle = "#1A1A1A"; c.lineWidth = 4 * wd; }
    else { c.strokeStyle = "rgba(255,255,255,0.55)"; c.lineWidth = 1.5; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(X(x) + 1.5, Y(y) + 1.5) : c.moveTo(X(x) + 1.5, Y(y) + 1.5))); c.stroke(); c.strokeStyle = "rgba(8,14,24,0.92)"; c.lineWidth = 2.2 * wd; }
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y)))); c.stroke();
  };
  // the sill: a black rocker trim between the arches
  c.fillStyle = bump ? "#6A6A6A" : "#26303D"; c.fillRect(X(-1.05), Y(0.335), X(1.05) - X(-1.05), Y(0.2) - Y(0.335));
  // lower valances, front and rear (black, textured)
  c.fillStyle = bump ? "#727272" : "#242C38"; c.fillRect(X(1.97), Y(0.355), w - X(1.97), Y(0.2) - Y(0.355)); c.fillRect(0, Y(0.41), X(-2.04), Y(0.2) - Y(0.41));
  // door cuts: front door leading edge, the B-pillar cut, rear door trailing edge, and the doors' bottom edge
  gap([[0.995, 0.345], [0.99, 0.6], [0.982, 0.955]]);
  gap([[-0.118, 0.345], [-0.122, 0.6], [-0.128, 0.975]]);
  gap([[-0.99, 0.345], [-0.99, 0.62], [-0.995, 0.98]]);
  gap([[-0.99, 0.345], [0.995, 0.345]]);
  // bumper covers: the joint with the fender / quarter panel, then the bumper's top line round the nose / tail
  gap([[1.95, 0.27], [1.955, 0.45], [1.97, 0.605], [XF + 0.1, 0.605]]);
  gap([[-2.0, 0.3], [-2.005, 0.5], [-2.02, 0.68], [XR - 0.1, 0.68]]);
  gap([[XR - 0.1, 0.765], [-2.385, 0.765]], 0.9);   // the deck lid's lower edge (on the tail panel only)
  gap([[2.385, 0.805], [XF + 0.1, 0.805]], 0.9);    // the hood's leading edge (on the nose only)
  // body-side moulding along both doors (a black rubbing strip with a bright top edge)
  [[-0.975, -0.135], [-0.105, 0.98]].forEach(([a, b]) => {
    if (bump) { c.fillStyle = "#C8C8C8"; rr(c, X(a), Y(0.53), X(b) - X(a), Y(0.49) - Y(0.53), 6); c.fill(); return; }
    c.fillStyle = "#1F2732"; rr(c, X(a), Y(0.53), X(b) - X(a), Y(0.49) - Y(0.53), 6); c.fill();
    c.fillStyle = "rgba(230,240,252,0.8)"; c.fillRect(X(a) + 6, Y(0.53) + 1, X(b) - X(a) - 12, 2);
  });
  // the door handles' finger cups (soft shading behind each handle)
  [0.42, -0.62].forEach((x) => {
    const g = c.createRadialGradient(X(x), Y(0.862), 2, X(x), Y(0.862), 50);
    g.addColorStop(0, bump ? "rgba(40,40,40,0.9)" : "rgba(30,40,56,0.55)"); g.addColorStop(1, bump ? "rgba(128,128,128,0)" : "rgba(255,255,255,0)");
    c.save(); c.translate(X(x), Y(0.862)); c.scale(1, 0.38); c.translate(-X(x), -Y(0.862)); c.fillStyle = g; c.fillRect(X(x) - 60, Y(0.862) - 60, 120, 120); c.restore();
  });
  // the fuel door (right rear quarter): a gap circle-ish rectangle
  if (!bump) { c.strokeStyle = "rgba(8,14,24,0.85)"; c.lineWidth = 2; rr(c, X(-1.86) - 34, Y(0.89) - 18, 68, 44, 10); c.stroke(); }
  else { c.strokeStyle = "#1A1A1A"; c.lineWidth = 3; rr(c, X(-1.86) - 34, Y(0.89) - 18, 68, 44, 10); c.stroke(); }
};
export const sideTex = () => canvasTex("car_side_c", 2048, 512, sideDraw(false));
export const sideBump = () => lin(canvasTex("car_side_b", 2048, 512, sideDraw(true)));

// ── the body top: u = (x − XR)/LEN, v = 0.5 + z/2 ────────────────────────────────────────────────────────────────────────
const topDraw = (bump) => (c, w, h) => {
  const X = (x) => ((x - XR) / LEN) * w, Z = (z) => (0.5 - z / 2) * h;
  c.fillStyle = bump ? "#808080" : "#FFFFFF"; c.fillRect(0, 0, w, h);
  const line = (pts, wd = 1) => {
    c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = bump ? "#1A1A1A" : "rgba(8,14,24,0.9)"; c.lineWidth = (bump ? 4 : 2.4) * wd;
    c.beginPath(); pts.forEach(([x, z], i) => (i ? c.lineTo(X(x), Z(z)) : c.moveTo(X(x), Z(z)))); c.stroke();
  };
  // the cowl: a black plastic panel with slots, at the windshield's foot
  c.fillStyle = bump ? "#5A5A5A" : "#1B222C"; c.fillRect(X(0.985), Z(0.76), X(1.075) - X(0.985), Z(-0.76) - Z(0.76));
  if (!bump) { c.fillStyle = "rgba(0,0,0,0.6)"; for (let z = -0.62; z < 0.62; z += 0.045) c.fillRect(X(1.02), Z(z) - 2, X(1.06) - X(1.02), 3); }
  // hood: rear edge, both fender gaps, its rounded front corners
  const hood = [[2.24, 0.705], [2.33, 0.6], [2.36, 0.3], [2.365, 0]];
  line([[1.075, 0.71], [1.6, 0.715], [2.1, 0.712], ...hood, ...hood.slice().reverse().map(([x, z]) => [x, -z]), [2.1, -0.712], [1.6, -0.715], [1.075, -0.71], [1.075, 0.71]]);
  // washer nozzles
  [-0.32, 0.32].forEach((z) => { c.fillStyle = bump ? "#303030" : "#2A3442"; c.beginPath(); c.ellipse(X(1.14), Z(z), 5, 7, 0, 0, Math.PI * 2); c.fill(); });
  // the deck lid: front edge and side gaps (its rear edge is on the tail panel)
  line([[XR - 0.1, 0.7], [-2.3, 0.705], [-1.9, 0.71], [-1.55, 0.7], [-1.52, 0.62], [-1.515, 0], [-1.52, -0.62], [-1.55, -0.7], [-1.9, -0.71], [-2.3, -0.705], [XR - 0.1, -0.7]]);
};
export const topTex = () => canvasTex("car_top_c", 2048, 512, topDraw(false));
export const topBump = () => lin(canvasTex("car_top_b", 2048, 512, topDraw(true)));

// ── lamps (decals; u from the OUTER end to the INNER end for heads, inner → outer for tails; v up) ─────────────────────────────
const headShape = (c, w, h) => {
  const P = (u, v) => [u * w, (1 - v) * h];
  c.beginPath();
  c.moveTo(...P(0.02, 0.6));
  c.bezierCurveTo(...P(0.2, 0.86), ...P(0.45, 0.95), ...P(0.97, 0.95));
  c.quadraticCurveTo(...P(1.0, 0.94), ...P(0.995, 0.75));
  c.lineTo(...P(0.985, 0.3));
  c.quadraticCurveTo(...P(0.98, 0.14), ...P(0.9, 0.13));
  c.bezierCurveTo(...P(0.6, 0.12), ...P(0.35, 0.18), ...P(0.12, 0.4));
  c.quadraticCurveTo(...P(0.0, 0.52), ...P(0.02, 0.6));
  c.closePath();
};
const headDraw = (emis) => (c, w, h) => {
  c.clearRect(0, 0, w, h);
  c.save(); headShape(c, w, h); c.clip();
  if (emis) { c.fillStyle = "#000"; c.fillRect(0, 0, w, h); }
  else {
    // the housing behind the lens: dark chrome, lit from above
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#5D6E86"); g.addColorStop(0.5, "#1C2635"); g.addColorStop(1, "#3B4A60");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    // the amber turn signal along the outer end (ribbed lens)
    c.fillStyle = "#C98A2E"; rr(c, w * 0.04, h * 0.42, w * 0.3, h * 0.2, 14); c.fill();
    c.fillStyle = "rgba(255,220,150,0.35)"; for (let x = w * 0.05; x < w * 0.34; x += 9) c.fillRect(x, h * 0.42, 3, h * 0.2);
    // a chrome reflector bezel line under the lamps
    c.strokeStyle = "#C9D6E6"; c.lineWidth = 4; c.beginPath(); c.moveTo(w * 0.36, h * 0.74); c.quadraticCurveTo(w * 0.6, h * 0.8, w * 0.97, h * 0.76); c.stroke();
  }
  // the two lamps: a high-beam reflector bowl and the low-beam projector (inner)
  [[0.56, 0.52, 0.29, 0.55], [0.8, 0.5, 0.33, 1]].forEach(([u, v, r, lum]) => {
    const cx = u * w, cy = (1 - v) * h, R = r * h;
    if (emis) {
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, `rgba(255,255,255,${lum})`); g.addColorStop(0.45, `rgba(225,238,255,${lum * 0.85})`); g.addColorStop(1, `rgba(120,160,220,${lum * 0.15})`);
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill(); return;
    }
    // chrome bowl with concentric facets, a dark gap ring, the bulb / projector lens
    const g = c.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 2, cx, cy, R); g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.5, "#AEBFD6"); g.addColorStop(0.85, "#56677F"); g.addColorStop(1, "#1A2230");
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "rgba(20,30,45,0.35)"; c.lineWidth = 1.5; for (let k = 1; k < 6; k++) { c.beginPath(); c.arc(cx, cy, R * k / 6, 0, Math.PI * 2); c.stroke(); }
    c.strokeStyle = "#0E141D"; c.lineWidth = 5; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
    c.fillStyle = "#E9F2FF"; c.beginPath(); c.arc(cx, cy, R * 0.36, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#8C9DB4"; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R * 0.36, 0, Math.PI * 2); c.stroke();
  });
  c.restore();
  if (!emis) { c.save(); headShape(c, w, h); c.strokeStyle = "rgba(200,214,232,0.9)"; c.lineWidth = 6; c.stroke(); c.restore(); }
};
export const headTex = () => canvasTex("car_head_c", 1024, 384, headDraw(false));
export const headEmis = () => canvasTex("car_head_e", 1024, 384, headDraw(true));

const tailShape = (c, w, h) => {
  const P = (u, v) => [u * w, (1 - v) * h];
  c.beginPath();
  c.moveTo(...P(0.02, 0.12)); c.lineTo(...P(0.02, 0.9));
  c.quadraticCurveTo(...P(0.03, 0.96), ...P(0.12, 0.96));
  c.lineTo(...P(0.7, 0.96));
  c.bezierCurveTo(...P(0.88, 0.95), ...P(0.98, 0.88), ...P(0.985, 0.74));
  c.lineTo(...P(0.97, 0.5));
  c.bezierCurveTo(...P(0.9, 0.3), ...P(0.75, 0.16), ...P(0.5, 0.12));
  c.closePath();
};
const tailDraw = (emis) => (c, w, h) => {
  c.clearRect(0, 0, w, h);
  c.save(); tailShape(c, w, h); c.clip();
  if (emis) {
    c.fillStyle = "#000"; c.fillRect(0, 0, w, h);
    const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "#7A0A10"); g.addColorStop(0.5, "#E0262E"); g.addColorStop(1, "#B5121A");
    c.fillStyle = g; c.fillRect(0, 0, w, h * 0.52);                                   // the upper tail / brake section, lit
    c.fillStyle = "#C21A22"; c.fillRect(w * 0.34, h * 0.52, w, h * 0.5);              // the outer lower section, lit
    c.fillStyle = "rgba(255,120,120,0.55)"; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(w * (0.14 + k * 0.14), h * 0.26, h * 0.09, 0, Math.PI * 2); c.fill(); }
  } else {
    c.fillStyle = "#6E0F16"; c.fillRect(0, 0, w, h);
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(255,140,140,0.5)"); g.addColorStop(0.5, "rgba(255,60,60,0.05)"); g.addColorStop(1, "rgba(80,0,0,0.4)");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    // the lens' cell optics (a honeycomb of small reflex cells) and fine horizontal flutes
    c.strokeStyle = "rgba(255,170,170,0.28)"; c.lineWidth = 1.2;
    for (let y = 0; y < h; y += 18) for (let x = (y / 18) % 2 ? 0 : 11; x < w; x += 22) { c.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k; const px = x + 9 * Math.cos(a), py = y + 9 * Math.sin(a); k ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); c.stroke(); }
    // the reverse lamp (clear, with a chrome reflector) in the inner lower corner
    const rx = w * 0.04, ry = h * 0.52, rw = w * 0.28, rh = h * 0.38;
    const gg = c.createRadialGradient(rx + rw * 0.4, ry + rh * 0.4, 4, rx + rw / 2, ry + rh / 2, rw * 0.7); gg.addColorStop(0, "#FFFFFF"); gg.addColorStop(0.5, "#B7C6DA"); gg.addColorStop(1, "#4A5A70");
    c.fillStyle = gg; rr(c, rx, ry, rw, rh, 16); c.fill();
    c.strokeStyle = "rgba(40,50,70,0.4)"; for (let k = 1; k < 8; k++) { c.beginPath(); c.moveTo(rx + rw * k / 8, ry); c.lineTo(rx + rw * k / 8, ry + rh); c.stroke(); }
    // chrome divider between the sections
    c.fillStyle = "#C9D6E6"; c.fillRect(0, h * 0.5, w, 5);
  }
  c.restore();
  if (!emis) { c.save(); tailShape(c, w, h); c.strokeStyle = "rgba(30,8,12,0.9)"; c.lineWidth = 7; c.stroke(); c.restore(); }
};
export const tailTex = () => canvasTex("car_tail_c", 1024, 384, tailDraw(false));
export const tailEmis = () => canvasTex("car_tail_e", 1024, 384, tailDraw(true));

/** the upper grille between the headlamps: chrome surround, three bars, a blank oval badge (no make) */
export const grilleTex = () => canvasTex("car_grille", 1024, 320, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  const shape = () => { c.beginPath(); c.moveTo(w * 0.04, h * 0.1); c.lineTo(w * 0.96, h * 0.1); c.quadraticCurveTo(w * 0.99, h * 0.1, w * 0.97, h * 0.3); c.lineTo(w * 0.9, h * 0.86); c.quadraticCurveTo(w * 0.88, h * 0.94, w * 0.82, h * 0.94); c.lineTo(w * 0.18, h * 0.94); c.quadraticCurveTo(w * 0.12, h * 0.94, w * 0.1, h * 0.86); c.lineTo(w * 0.03, h * 0.3); c.quadraticCurveTo(w * 0.01, h * 0.1, w * 0.04, h * 0.1); c.closePath(); };
  c.save(); shape(); c.clip();
  c.fillStyle = "#070B12"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#121A26"; for (let y = 0; y < h; y += 10) for (let x = (y / 10) % 2 ? 0 : 10; x < w; x += 20) { c.beginPath(); c.arc(x, y, 3.2, 0, Math.PI * 2); c.fill(); }
  [0.32, 0.52, 0.72].forEach((v) => { const g = c.createLinearGradient(0, h * v - 9, 0, h * v + 9); g.addColorStop(0, "#F4F8FF"); g.addColorStop(0.5, "#8A9BB2"); g.addColorStop(1, "#E2EAF5"); c.fillStyle = g; c.fillRect(0, h * v - 8, w, 16); });
  c.restore();
  c.save(); shape(); c.lineWidth = 22; const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.5, "#9FB0C6"); g.addColorStop(1, "#DCE5F1"); c.strokeStyle = g; c.stroke(); c.restore();
  // the badge: a plain chrome oval with a blue enamel centre (no lettering, no make)
  c.fillStyle = "#DCE5F1"; c.beginPath(); c.ellipse(w / 2, h * 0.52, 74, 46, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#123A70"; c.beginPath(); c.ellipse(w / 2, h * 0.52, 60, 34, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "#8EA3BE"; c.lineWidth = 3; c.beginPath(); c.ellipse(w / 2, h * 0.52, 66, 40, 0, 0, Math.PI * 2); c.stroke();
});
/** the lower intake in the bumper: a black honeycomb mouth and two round fog lamps in their pockets */
export const intakeTex = () => canvasTex("car_intake", 1024, 200, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  c.fillStyle = "#0A0F17"; rr(c, w * 0.3, h * 0.18, w * 0.4, h * 0.64, 28); c.fill();
  c.save(); rr(c, w * 0.3, h * 0.18, w * 0.4, h * 0.64, 28); c.clip();
  c.strokeStyle = "#202A38"; c.lineWidth = 2.5;
  for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? 0 : 10; x < w; x += 20) { c.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k + Math.PI / 6; const px = x + 8 * Math.cos(a), py = y + 8 * Math.sin(a); k ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); c.stroke(); }
  c.restore();
  [0.12, 0.88].forEach((u) => {
    const cx = w * u, cy = h * 0.5;
    c.fillStyle = "#111823"; c.beginPath(); c.ellipse(cx, cy, 78, 62, 0, 0, Math.PI * 2); c.fill();
    const g = c.createRadialGradient(cx - 14, cy - 12, 3, cx, cy, 44); g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.6, "#9EB0C8"); g.addColorStop(1, "#3A4A60");
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 44, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#D5DFEC"; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, 47, 0, Math.PI * 2); c.stroke();
  });
});
/** the rear plate (Michigan: the Selbees drove from Evart); characters are a generic combination */
export const plateTex = () => canvasTex("car_plate_MI", 1024, 512, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#F7FAFD"); g.addColorStop(1, "#E3EAF2");
  c.fillStyle = g; rr(c, 0, 0, w, h, 40); c.fill();
  c.strokeStyle = "#C3CEDB"; c.lineWidth = 26; rr(c, 13, 13, w - 26, h - 26, 34); c.stroke();
  c.fillStyle = "#0B2F63"; c.textAlign = "center";
  c.font = `800 84px ${BODY}`; c.fillText("MICHIGAN", w / 2, 118);
  c.font = `400 250px ${FIGURE}`; c.fillText("DKR 4176", w / 2, 380, w - 110);
  c.font = `700 46px ${BODY}`; c.fillText("GREAT LAKES", w / 2, 462);
  [[90, 70], [w - 90, 70]].forEach(([x, y]) => { c.fillStyle = "#AAB6C6"; c.beginPath(); c.arc(x, y, 16, 0, Math.PI * 2); c.fill(); });
});

// ── the tyre (lathe UV: u around, v across the profile from the inner bead to the outer bead) ────────────────────────────────
const tyreDraw = (bump) => (c, w, h) => {
  c.fillStyle = bump ? "#808080" : "#191D23"; c.fillRect(0, 0, w, h);
  const V = (v) => (1 - v) * h;
  // tread: four circumferential grooves and lateral sipes across the shoulder blocks
  c.fillStyle = bump ? "#202020" : "#07090C";
  [0.445, 0.485, 0.515, 0.555].forEach((v) => c.fillRect(0, V(v) - 2, w, 4));
  for (let x = 0; x < w; x += 22) { c.fillRect(x, V(0.6), 4, V(0.565) - V(0.6)); c.fillRect(x + 11, V(0.435), 4, V(0.4) - V(0.435)); }
  // outer sidewall: moulded lettering (raised), letters' tops toward the tread
  const txt = ["ALL SEASON RADIAL", "215/60 R16 94T", "TUBELESS", "M+S"];
  c.save(); c.translate(w, V(0.82)); c.scale(-1, -1);       // read from outside the wheel, letters' tops toward the tread
  c.fillStyle = bump ? "#E0E0E0" : "#38404B"; c.font = `800 26px ${BODY}`; c.textBaseline = "middle";
  let x = 30; for (let k = 0; x < w - 200; k++) { const s = txt[k % txt.length]; c.fillText(s, x, 0); x += c.measureText(s).width + 120; }
  c.restore();
  // a rim-protector rib near the bead
  c.fillStyle = bump ? "#B0B0B0" : "#232830"; c.fillRect(0, V(0.94), w, 3);
};
export const tyreTex = () => canvasTex("car_tyre_c", 2048, 256, tyreDraw(false));
export const tyreBump = () => lin(canvasTex("car_tyre_b", 2048, 256, tyreDraw(true)));

// ── the cabin ─────────────────────────────────────────────────────────────────────────────────────────────────────────
/** seat cloth: a woven insert with sewn channels and topstitching */
export const seatTex = () => canvasTex("car_seat", 512, 512, (c, w, h) => {
  c.fillStyle = "#3C4859"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { const g = 50 + rnd(i) * 30; c.fillStyle = `rgba(${g},${g + 10},${g + 24},0.4)`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  for (let x = 0; x < w; x += 64) {
    const g = c.createLinearGradient(x, 0, x + 64, 0); g.addColorStop(0, "rgba(10,16,26,0.55)"); g.addColorStop(0.12, "rgba(255,255,255,0.06)"); g.addColorStop(0.5, "rgba(255,255,255,0.1)"); g.addColorStop(0.88, "rgba(255,255,255,0.04)"); g.addColorStop(1, "rgba(10,16,26,0.45)");
    c.fillStyle = g; c.fillRect(x, 0, 64, h);
    c.fillStyle = "rgba(170,184,204,0.75)"; for (let y = 4; y < h; y += 14) { c.fillRect(x + 6, y, 2, 7); c.fillRect(x + 56, y, 2, 7); }
  }
  c.strokeStyle = "rgba(170,184,204,0.7)"; c.setLineDash([7, 7]); c.lineWidth = 2; c.strokeRect(10, 10, w - 20, h - 20); c.setLineDash([]);
});
/** the instrument cluster: tachometer, speedometer (MPH, km/h inside), fuel and temperature, the gear indicator */
export const gaugeTex = () => canvasTex("car_gauges", 1024, 512, (c, w, h) => {
  c.fillStyle = "#03060B"; c.fillRect(0, 0, w, h);
  const dial = (cx, cy, R, max, step, label, sub, red) => {
    c.strokeStyle = "rgba(127,180,242,0.55)"; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
    const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25;
    for (let v = 0; v <= max; v += step / 2) {
      const a = a0 + (a1 - a0) * v / max, major = v % step === 0;
      c.strokeStyle = red && v >= red ? "#E0303A" : "#DCEBFF"; c.lineWidth = major ? 4 : 2;
      c.beginPath(); c.moveTo(cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92); c.lineTo(cx + Math.cos(a) * R * (major ? 0.78 : 0.85), cy + Math.sin(a) * R * (major ? 0.78 : 0.85)); c.stroke();
      if (major) { c.fillStyle = "#DCEBFF"; c.font = `700 ${R * 0.17}px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(String(v / (max > 100 ? 1 : 1)), cx + Math.cos(a) * R * 0.63, cy + Math.sin(a) * R * 0.63); }
    }
    c.fillStyle = "#7FB4F2"; c.font = `700 ${R * 0.13}px ${BODY}`; c.fillText(label, cx, cy + R * 0.38); c.font = `500 ${R * 0.09}px ${BODY}`; c.fillText(sub, cx, cy + R * 0.55);
  };
  dial(270, 256, 200, 7, 1, "x1000 r/min", "", 6);
  dial(760, 256, 220, 140, 20, "MPH", "", 0);
  // needles: the car is cruising (≈ 2,000 r/min, ≈ 60 mph)
  const needle = (cx, cy, R, frac) => { const a = Math.PI * 0.75 + Math.PI * 1.5 * frac; c.strokeStyle = "#FF7A3C"; c.lineWidth = 6; c.lineCap = "round"; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86); c.stroke(); c.fillStyle = "#1B2533"; c.beginPath(); c.arc(cx, cy, R * 0.1, 0, Math.PI * 2); c.fill(); };
  needle(270, 256, 200, 2 / 7); needle(760, 256, 220, 60 / 140);
  // fuel and temperature, and the gear indicator between the dials
  c.fillStyle = "#DCEBFF"; c.font = `700 26px ${BODY}`; c.textAlign = "center";
  c.fillText("E", 470, 440); c.fillText("F", 560, 440); c.fillText("C", 470, 90); c.fillText("H", 560, 90);
  c.font = `800 30px ${BODY}`; ["P", "R", "N", "D", "2", "1"].forEach((g, i) => { c.fillStyle = g === "D" ? "#FFFFFF" : "rgba(127,180,242,0.45)"; c.fillText(g, 515, 175 + i * 34); });
});
/** the centre stack: a radio / CD head unit and the climate controls */
export const radioTex = () => canvasTex("car_radio", 512, 640, (c, w, h) => {
  c.fillStyle = "#151B24"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#0B1018"; rr(c, 20, 20, w - 40, 300, 18); c.fill();
  // display
  c.fillStyle = "#06243F"; rr(c, 120, 48, 272, 86, 8); c.fill();
  c.fillStyle = "#8FC4FF"; c.font = `700 46px ${BODY}`; c.textAlign = "center"; c.fillText("FM1  98.7", w / 2, 108);
  // knobs and keys
  [[70, 92], [w - 70, 92]].forEach(([x, y], i) => { const g = c.createRadialGradient(x - 8, y - 8, 2, x, y, 38); g.addColorStop(0, "#9AA9BE"); g.addColorStop(1, "#2A3442"); c.fillStyle = g; c.beginPath(); c.arc(x, y, 38, 0, Math.PI * 2); c.fill(); c.fillStyle = "#C9D6E6"; c.font = `700 20px ${BODY}`; c.fillText(i ? "TUNE" : "VOL", x, y + 62); });
  c.fillStyle = "#05080D"; c.fillRect(110, 160, 292, 12);   // the CD slot
  ["AM", "FM", "CD", "SEEK", "SCAN", "1", "2", "3", "4", "5", "6"].forEach((k, i) => {
    const row = i < 5 ? 0 : 1, col = row ? i - 5 : i, n = row ? 6 : 5, bw = (w - 60) / n;
    const x = 30 + col * bw, y = 196 + row * 58;
    c.fillStyle = "#283240"; rr(c, x + 4, y, bw - 8, 44, 8); c.fill();
    c.fillStyle = "#DCE7F5"; c.font = `700 ${row ? 24 : 21}px ${BODY}`; c.fillText(k, x + bw / 2, y + 30);
  });
  // hazard key
  c.fillStyle = "#2A0D10"; rr(c, w / 2 - 34, 336, 68, 40, 8); c.fill(); c.strokeStyle = "#E04848"; c.lineWidth = 5; c.beginPath(); c.moveTo(w / 2, 344); c.lineTo(w / 2 + 16, 370); c.lineTo(w / 2 - 16, 370); c.closePath(); c.stroke();
  // climate: three dials and two keys
  [["TEMP", 100], ["FAN", 256], ["MODE", 412]].forEach(([l, x]) => {
    const y = 470; const g = c.createRadialGradient(x - 10, y - 10, 3, x, y, 52); g.addColorStop(0, "#A8B6C9"); g.addColorStop(1, "#283240"); c.fillStyle = g; c.beginPath(); c.arc(x, y, 50, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#0B1018"; c.lineWidth = 6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30, y - 30); c.stroke();
    c.fillStyle = "#DCE7F5"; c.font = `700 22px ${BODY}`; c.fillText(l, x, y + 80);
    if (l === "TEMP") { c.lineWidth = 6; c.strokeStyle = "#4D8ED9"; c.beginPath(); c.arc(x, y, 60, Math.PI * 0.8, Math.PI * 1.25); c.stroke(); c.strokeStyle = "#D9534A"; c.beginPath(); c.arc(x, y, 60, Math.PI * 1.75, Math.PI * 2.2); c.stroke(); }
    if (l === "FAN") { c.fillStyle = "#C9D6E6"; c.font = `700 18px ${BODY}`; ["0", "1", "2", "3", "4"].forEach((s, i) => { const a = Math.PI * (0.85 + i * 0.33); c.fillText(s, x + Math.cos(a) * 66, y + Math.sin(a) * 66 + 6); }); }
  });
  [["A/C", 178], ["RECIRC", 334]].forEach(([l, x]) => { c.fillStyle = "#283240"; rr(c, x - 50, 600 - 20, 100, 36, 8); c.fill(); c.fillStyle = "#DCE7F5"; c.font = `700 20px ${BODY}`; c.fillText(l, x, 605); });
});
/** the inner door panels, front and rear door (u along x from −1.0 to 0.98, v up from y 0.36 to 1.0) */
export const doorTex = () => canvasTex("car_doorcard", 2048, 640, (c, w, h) => {
  const X = (x) => ((x + 1.0) / 1.98) * w, Y = (y) => (1 - (y - 0.36) / 0.64) * h;
  c.fillStyle = "#1B2230"; c.fillRect(0, 0, w, h);
  // the cloth insert band and its stitching
  c.fillStyle = "#2E394A"; c.fillRect(0, Y(0.86), w, Y(0.72) - Y(0.86));
  for (let i = 0; i < 6000; i++) { c.fillStyle = `rgba(255,255,255,${0.02 + rnd(i) * 0.03})`; c.fillRect(rnd(i + 1) * w, Y(0.86) + rnd(i + 2) * (Y(0.72) - Y(0.86)), 2, 2); }
  c.strokeStyle = "rgba(160,176,198,0.6)"; c.setLineDash([8, 8]); c.lineWidth = 2; [Y(0.86) + 6, Y(0.72) - 6].forEach((y) => { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }); c.setLineDash([]);
  // the door seam at the B-pillar and the two doors' shut lines
  c.fillStyle = "#06090E"; c.fillRect(X(-0.13) - 4, 0, 8, h); c.fillRect(0, 0, 8, h); c.fillRect(w - 8, 0, 8, h);
  // map pockets
  [[-0.95, -0.2], [-0.06, 0.9]].forEach(([a, b]) => { c.fillStyle = "#121822"; rr(c, X(a) + 20, Y(0.52), X(b) - X(a) - 40, Y(0.4) - Y(0.52), 14); c.fill(); c.fillStyle = "rgba(255,255,255,0.08)"; c.fillRect(X(a) + 26, Y(0.52), X(b) - X(a) - 52, 3); });
  // speaker grilles
  [-0.75, 0.15].forEach((x) => { const cx = X(x), cy = Y(0.6), R = 62; c.fillStyle = "#10151E"; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill(); c.fillStyle = "#2B3546"; for (let a = -R; a < R; a += 10) for (let b = -R; b < R; b += 10) if (a * a + b * b < (R - 8) ** 2) c.fillRect(cx + a, cy + b, 4, 4); });
  // inner handles (chrome levers in a recess) and the driver's window switch pack
  [-0.25, 0.68].forEach((x) => { c.fillStyle = "#0B0F16"; rr(c, X(x) - 46, Y(0.9) - 14, 92, 30, 12); c.fill(); c.fillStyle = "#C9D6E6"; rr(c, X(x) - 40, Y(0.9) - 6, 70, 12, 6); c.fill(); });
  c.fillStyle = "#0D1219"; rr(c, X(0.42) - 80, Y(0.79) - 22, 160, 44, 10); c.fill();
  for (let k = 0; k < 4; k++) { c.fillStyle = "#3A4558"; rr(c, X(0.42) - 70 + k * 36, Y(0.79) - 13, 28, 26, 5); c.fill(); }
});
/** the shifter's gate plate */
export const gateTex = () => canvasTex("car_gate", 256, 512, (c, w, h) => {
  c.fillStyle = "#121821"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#05080D"; rr(c, w * 0.42, 40, w * 0.16, h - 80, 10); c.fill();
  c.font = `800 44px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle";
  ["P", "R", "N", "D", "2", "1"].forEach((g, i) => { c.fillStyle = g === "D" ? "#FFFFFF" : "#8FA3BE"; c.fillText(g, w * 0.2, 70 + i * 74); });
  c.strokeStyle = "rgba(200,214,232,0.6)"; c.lineWidth = 3; c.strokeRect(6, 6, w - 12, h - 12);
});
/** an air vent: chrome bezel, dark slats */
export const ventTex = () => canvasTex("car_vent", 256, 128, (c, w, h) => {
  c.fillStyle = "#AEBBCC"; rr(c, 0, 0, w, h, 22); c.fill();
  c.fillStyle = "#06090E"; rr(c, 10, 10, w - 20, h - 20, 16); c.fill();
  for (let y = 22; y < h - 14; y += 14) { const g = c.createLinearGradient(0, y, 0, y + 8); g.addColorStop(0, "#3C4758"); g.addColorStop(1, "#141A24"); c.fillStyle = g; c.fillRect(16, y, w - 32, 7); }
});
