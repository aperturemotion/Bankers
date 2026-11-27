// @ts-nocheck
// ★ V39 builder C — WINTER NIGHT SCENERY drawn on canvas for the views through the diner's and the kitchen's windows (detail pass
//   2026-11-27; Timur: "the trees, make them a lot more realistic. Right now there's just triangles"). Brattleboro in winter at
//   blue hour: snowy conifers built from drooping branch tiers (needle tufts, snow lying on each tier's upper surface, a visible
//   trunk), bare maples as recursive branch skeletons tapering to twigs, clapboard houses with snow on the roofs and lit windows.
import { rnd } from "./kit";

/** an eastern white pine / spruce silhouette: tiers of drooping branches from the top down, needles as short strokes, snow on top */
export const conifer = (c, x, base, h, w, seed, { dark = "#0B1C34", mid = "#13294A", snow = "#C9D8EC", snowA = 0.9 } = {}) => {
  // the trunk (visible under the lowest tier)
  c.fillStyle = "#0A1222"; c.fillRect(x - w * 0.035, base - h * 0.16, w * 0.07, h * 0.16);
  const tiers = 9 + Math.floor(rnd(seed) * 4);
  for (let t = 0; t < tiers; t++) {
    const q = (t + 1) / tiers;                                  // 0 at the top → 1 at the bottom
    const y = base - h * 0.14 - (1 - q) * h * 0.84;             // where this tier leaves the trunk
    const half = w * 0.5 * Math.pow(q, 0.9) * (0.85 + rnd(seed + t) * 0.3);
    const droop = h * 0.05 * (0.6 + q);
    [-1, 1].forEach((s) => {
      // the bough: a sagging curve from the trunk to its tip, thick at the trunk
      const tipX = x + s * half, tipY = y + droop;
      c.fillStyle = t % 2 ? mid : dark;
      c.beginPath(); c.moveTo(x, y - h * 0.018);
      c.quadraticCurveTo(x + s * half * 0.55, y - droop * 0.35, tipX, tipY);
      c.quadraticCurveTo(x + s * half * 0.5, y + droop * 0.9, x, y + h * 0.05); c.closePath(); c.fill();
      // needle tufts along the underside
      c.strokeStyle = dark; c.lineWidth = 1;
      for (let k = 0; k < 14; k++) { const u = k / 14, px = x + s * half * u, py = y + droop * u * u + h * 0.02 * (1 - u); c.beginPath(); c.moveTo(px, py); c.lineTo(px + s * 3 - 2 + rnd(seed + t * 9 + k) * 4, py + 4 + rnd(k + t) * 6); c.stroke(); }
      // snow lying on the bough's upper surface, thinning toward the tip
      c.strokeStyle = snow; c.globalAlpha = snowA; c.lineCap = "round";
      c.lineWidth = Math.max(1.5, h * 0.016 * (1 - 0.5 * q));
      c.beginPath(); c.moveTo(x + s * half * 0.05, y - h * 0.016);
      c.quadraticCurveTo(x + s * half * 0.5, y - droop * 0.4 - h * 0.006, x + s * half * (0.78 + 0.1 * rnd(seed * 3 + t)), y + droop * 0.55);
      c.stroke(); c.globalAlpha = 1; c.lineCap = "butt";
    });
  }
  // the leader at the top, with a cap of snow
  c.strokeStyle = dark; c.lineWidth = 2; c.beginPath(); c.moveTo(x, base - h * 0.95); c.lineTo(x, base - h); c.stroke();
  c.fillStyle = snow; c.beginPath(); c.ellipse(x, base - h * 0.955, 3, 2, 0, 0, Math.PI * 2); c.fill();
};
/** a bare sugar maple: a trunk forking into limbs that taper to twigs (recursive), a little snow on the upper limbs */
export const maple = (c, x, base, h, seed, { col = "#081428", snow = "rgba(205,220,240,0.7)" } = {}) => {
  c.lineCap = "round";
  const br = (x0, y0, a, L, wd, d) => {
    if (d > 8 || L < 3) return;
    const x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L;
    c.strokeStyle = col; c.lineWidth = wd; c.beginPath(); c.moveTo(x0, y0);
    c.quadraticCurveTo((x0 + x1) / 2 + (rnd(seed + d * 7 + x0) - 0.5) * L * 0.25, (y0 + y1) / 2, x1, y1); c.stroke();
    if (d >= 1 && d <= 3 && wd > 2.5) { c.strokeStyle = snow; c.lineWidth = Math.max(1, wd * 0.35); c.beginPath(); c.moveTo(x0, y0 - wd * 0.4); c.lineTo(x1, y1 - wd * 0.4); c.stroke(); }
    const n = d < 2 ? 2 : 2 + (rnd(seed + d + x1) < 0.4 ? 1 : 0);
    for (let k = 0; k < n; k++) br(x1, y1, a + (k - (n - 1) / 2) * (0.5 + rnd(seed * 3 + k + d) * 0.35) + (rnd(seed + k * 13 + y1) - 0.5) * 0.25, L * (0.68 + rnd(seed + k + d * 5) * 0.12), wd * 0.66, d + 1);
  };
  br(x, base, -Math.PI / 2 + (rnd(seed) - 0.5) * 0.12, h * 0.3, Math.max(3, h * 0.04), 0);
  c.lineCap = "butt";
};
/** a New England clapboard house: gable roof with snow, shadow lines on the siding, trimmed windows (some lit with curtains), a chimney */
export const house = (c, x, base, w, hh, seed, { wall = "#1A3358", trim = "#C9D4E2", lit = 0.6, snow = "#D6E2F0" } = {}) => {
  const roofH = hh * 0.55;
  c.fillStyle = wall; c.fillRect(x, base - hh, w, hh);
  for (let y = base - hh + 5; y < base; y += Math.max(3, hh / 18)) { c.fillStyle = "rgba(0,0,0,0.22)"; c.fillRect(x, y, w, 1.2); }
  c.fillStyle = trim; c.fillRect(x - 1, base - hh, 3, hh); c.fillRect(x + w - 2, base - hh, 3, hh);
  // the roof, its snow blanket and the eaves
  c.fillStyle = "#0C1A30"; c.beginPath(); c.moveTo(x - w * 0.06, base - hh); c.lineTo(x + w / 2, base - hh - roofH); c.lineTo(x + w * 1.06, base - hh); c.closePath(); c.fill();
  c.fillStyle = snow; c.beginPath(); c.moveTo(x - w * 0.06, base - hh - 1); c.lineTo(x + w / 2, base - hh - roofH - 2); c.lineTo(x + w * 1.06, base - hh - 1); c.lineTo(x + w * 1.0, base - hh - roofH * 0.12); c.lineTo(x + w / 2, base - hh - roofH * 0.94); c.lineTo(x, base - hh - roofH * 0.12); c.closePath(); c.fill();
  c.fillStyle = "rgba(230,238,250,0.9)"; for (let k = 0; k < 6; k++) { const ix = x + w * (0.05 + k * 0.17); c.fillRect(ix, base - hh, 1.5, 3 + rnd(seed + k) * 5); }   // icicles
  c.fillStyle = "#14243E"; c.fillRect(x + w * 0.68, base - hh - roofH * 0.85, w * 0.08, roofH * 0.5); c.fillStyle = snow; c.fillRect(x + w * 0.67, base - hh - roofH * 0.87, w * 0.1, 3);
  // windows: two up, two down (door between)
  const ww = w * 0.16, wh = hh * 0.26;
  [[0.14, 0.18], [0.7, 0.18], [0.14, 0.58], [0.7, 0.58]].forEach(([qx, qy], i) => {
    const wx = x + w * qx, wy = base - hh + hh * qy, on = rnd(seed * 7 + i) < lit;
    c.fillStyle = trim; c.fillRect(wx - 2, wy - 2, ww + 4, wh + 4);
    const g = c.createLinearGradient(0, wy, 0, wy + wh); if (on) { g.addColorStop(0, "#FFD9A0"); g.addColorStop(1, "#D88E48"); } else { g.addColorStop(0, "#1C2E4A"); g.addColorStop(1, "#122038"); }
    c.fillStyle = g; c.fillRect(wx, wy, ww, wh);
    if (on) { c.fillStyle = "rgba(240,230,210,0.55)"; c.fillRect(wx, wy, ww * 0.22, wh); c.fillRect(wx + ww * 0.78, wy, ww * 0.22, wh); }
    c.fillStyle = "rgba(20,30,50,0.7)"; c.fillRect(wx + ww / 2 - 1, wy, 2, wh); c.fillRect(wx, wy + wh / 2 - 1, ww, 2);
    c.fillStyle = snow; c.fillRect(wx - 3, wy + wh + 2, ww + 6, 2);   // snow on the sill
  });
  c.fillStyle = "#3A2A20"; c.fillRect(x + w * 0.42, base - hh * 0.36, w * 0.14, hh * 0.36);
  const pl = c.createRadialGradient(x + w * 0.49, base - hh * 0.42, 0, x + w * 0.49, base - hh * 0.42, w * 0.25); pl.addColorStop(0, "rgba(255,210,150,0.8)"); pl.addColorStop(1, "rgba(255,210,150,0)"); c.fillStyle = pl; c.fillRect(x, base - hh, w, hh);
};
/** a snow ground band with soft drifts and blue shadows */
export const snowGround = (c, w, y0, y1) => {
  const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, "#9FB4D2"); g.addColorStop(1, "#6F88AC"); c.fillStyle = g; c.fillRect(0, y0, w, y1 - y0);
  for (let i = 0; i < 60; i++) { const x = rnd(i * 3) * w, y = y0 + rnd(i * 5) * (y1 - y0), r = 30 + rnd(i) * 120; const gg = c.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, `rgba(${rnd(i + 1) < 0.5 ? "220,232,248" : "60,82,120"},0.25)`); gg.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gg; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
};
