// @ts-nocheck
// ★ V39 builder D — a 5 × 7 LED DOT-MATRIX face (the classic stock-board lamp font), drawn on canvas as round lamps.
//   ledFace(c, x, y, w, h, lines, o): a lamp grid nx × ny over the rectangle; each line { t, s (scale), row (top dot row) } is set
//   centred in the 5 × 7 font; lit lamps white (the material colours them), unlit lamps a faint dark disc (the real board's
//   off-lamps), the lamp glass a little highlight. Used by the Lehman board (d_board.tsx).
const FONT = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"], B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"], D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"], F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"], H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"], J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"], L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"], N: ["10001", "10001", "11001", "10101", "10011", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"], P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"], R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"], T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"], V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"], X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"], Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"], " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"]
};
/** the lit lamps of a text line at scale s: a Set of "col,row" keys (cols from 0 at the line's left) and its width in lamps */
const lineDots = (t, s) => {
  const out = []; let x = 0;
  for (const ch of t) {
    const g = FONT[ch] ?? FONT[" "];
    for (let r = 0; r < 7; r++) for (let k = 0; k < 5; k++) if (g[r][k] === "1") for (let a = 0; a < s; a++) for (let b = 0; b < s; b++) out.push([x + k * s + a, r * s + b]);
    x += 6 * s;
  }
  return { dots: out, w: x - s };
};
/** draw a lamp face. lines: [{ t, s, row }] (row = top lamp row; omitted → centred). mark: "bar" draws the neutral holding mark. */
export const ledFace = (c, x, y, w, h, { nx = 51, ny = 40, lines = [], mark = null, lit = "#FFFFFF", off = "rgba(40,70,110,0.55)", bg = "#04070D" } = {}) => {
  c.fillStyle = bg; c.fillRect(x, y, w, h);
  const px = w / nx, py = h / ny, r = Math.min(px, py) * 0.36;
  const on = new Set();
  for (const L of lines) {
    const { dots, w: lw } = lineDots(L.t, L.s ?? 1);
    const x0 = Math.round((nx - lw) / 2), y0 = L.row ?? Math.round((ny - 7 * (L.s ?? 1)) / 2);
    for (const [a, b] of dots) on.add(`${x0 + a},${y0 + b}`);
  }
  if (mark === "bar") { const bw = 13, y0 = Math.round(ny / 2) - 1; for (let a = 0; a < bw; a++) for (let b = 0; b < 2; b++) on.add(`${Math.round((nx - bw) / 2) + a},${y0 + b}`); }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const cx = x + (i + 0.5) * px, cy = y + (j + 0.5) * py;
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2);
    c.fillStyle = on.has(`${i},${j}`) ? lit : off; c.fill();
  }
};
