// @ts-nocheck
// ★ V39 builder D — an LED PANEL renderer (the holdings board's tiles, d_board.tsx). The content (type, logo, rules) is drawn first
//   at full resolution on an offscreen canvas in its LIT colours on black; then it is re-drawn as a real fine-pitch LED module:
//   a grid of square lamps (pitch `p` px, a dark gap round each), every lamp the average colour of the content under it added to
//   the unlit lamp's own faint grey, and the module seams of the panel (a tile is 2 × 2 modules) a hair darker.
//   Text is clean typography (Figtree, the house face) rendered through the lamp grid, so it reads as an LED sign up close and as
//   crisp type from a distance.
import { BODY } from "./fonts3d";

export const LED_FONT = BODY;
const OFF = [12, 16, 22], GAP = "#020305";
/** render `draw(ctx, w, h)` as an LED panel into c at (x, y), w × h, lamp pitch p */
export const ledPanel = (c, x, y, w, h, draw, { p = 4, dot = 3, seams = 2, off = OFF } = {}) => {
  const oc = document.createElement("canvas"); oc.width = w; oc.height = h;
  const o = oc.getContext("2d");
  o.fillStyle = "#000"; o.fillRect(0, 0, w, h);
  draw(o, w, h);
  const src = o.getImageData(0, 0, w, h).data;
  c.fillStyle = GAP; c.fillRect(x, y, w, h);
  const nx = Math.floor(w / p), ny = Math.floor(h / p), ox = Math.floor((w - nx * p) / 2), oy = Math.floor((h - ny * p) / 2);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    let r = 0, g = 0, b = 0;
    const x0 = ox + i * p, y0 = oy + j * p;
    for (let a = 0; a < p; a++) for (let q = 0; q < p; q++) { const k = ((y0 + a) * w + x0 + q) * 4; r += src[k]; g += src[k + 1]; b += src[k + 2]; }
    const n = p * p;
    r = Math.min(255, off[0] + r / n); g = Math.min(255, off[1] + g / n); b = Math.min(255, off[2] + b / n);
    c.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
    c.fillRect(x + x0, y + y0, dot, dot);
  }
  if (seams > 1) {   // the module seams
    c.fillStyle = "rgba(0,0,0,0.85)";
    for (let k = 1; k < seams; k++) { c.fillRect(x + Math.round(k * w / seams) - 1, y, 1, h); c.fillRect(x, y + Math.round(k * h / seams) - 1, w, 1); }
  }
};
/** set one or more lines of type left-aligned in a box, the largest size ≤ maxPx that fits width bw; returns the size used */
export const fitLines = (c, lines, x, yTop, bw, bh, { maxPx = 90, weight = 800, color = "#FFFFFF", lead = 1.02, track = -0.01, align = "left" } = {}) => {
  let px = maxPx;
  const measure = (s) => { c.font = `${weight} ${s}px ${LED_FONT}`; if ("letterSpacing" in c) c.letterSpacing = `${s * track}px`; return Math.max(...lines.map((t) => c.measureText(t).width)); };
  while (px > 10 && (measure(px) > bw || px * lead * lines.length > bh)) px -= 2;
  measure(px);
  c.fillStyle = color; c.textBaseline = "alphabetic"; c.textAlign = align;
  const blockH = px * lead * lines.length, y0 = yTop + (bh - blockH) / 2;
  lines.forEach((t, i) => c.fillText(t, align === "center" ? x + bw / 2 : x, y0 + px * 0.8 + i * px * lead));
  if ("letterSpacing" in c) c.letterSpacing = "0px";
  return px;
};
