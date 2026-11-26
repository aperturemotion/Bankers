// @ts-nocheck
// The house lottery ticket (Timur, 2026-11-26: "make the lottery ticket more detailed so it actually looks like a lottery ticket …
// right now it kind of looks like a calendar … more eye catching"). ONE design, drawn on canvas, used by every ticket texture of V38:
// a generic US draw-game thermal ticket (no real lottery's artwork) —
//   · a pre-printed security field: a pale blue tint, fine guilloche waves, a rosette and repeated diagonal microtext;
//   · a colourful pre-printed header: "STATE LOTTERY", a starburst, the game logo "WINFALL" (bold italic, gold outline, drop shadow),
//     a row of lottery balls, a "ROLL-DOWN DRAW" ribbon;
//   · the thermal print in black monospace: QUICK PICK, the draw line, five sorted Quick Pick plays A–E (1–46), price and total,
//     terminal/serial numbers, a 1-D barcode and a small 2-D code, the small print and a perforation.
// drawTicket(c, w, h, { seed, compact, drawLine }) draws into the whole canvas; `compact` is the landscape variant (small tickets).
import { BODY } from "./fonts3d";

const MONO = `"Liberation Mono", "Courier New", monospace`;
const C = { deep: "#0B3F7A", logo: "#005DC8", light: "#4D8ED9", pale: "#7FB4F2", gold: "#E3C988", gold2: "#D6B86E", ink: "#15181E", navy: "#06264D" };

// a small seeded PRNG (mulberry32), so every ticket is deterministic
const prng = (seed) => { let a = (seed * 2654435761) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const pad2 = (n) => String(n).padStart(2, "0");
/** six distinct numbers 1–46, sorted ascending */
const play = (r) => { const s = new Set(); while (s.size < 6) s.add(1 + Math.floor(r() * 46)); return [...s].sort((a, b) => a - b); };

// ── the pre-printed security field ────────────────────────────────────────────────────────────────────────────────────────
const security = (c, x, y, w, h, r, fine = 1) => {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  const g = c.createLinearGradient(x, y, x + w * 0.4, y + h); g.addColorStop(0, "#F3F8FE"); g.addColorStop(0.5, "#EAF2FC"); g.addColorStop(1, "#F1F6FD");
  c.fillStyle = g; c.fillRect(x, y, w, h);
  // two interlaced families of guilloche waves
  const step = 9 * fine;
  for (let fam = 0; fam < 2; fam++) {
    c.strokeStyle = fam ? "rgba(127,180,242,0.30)" : "rgba(77,142,217,0.20)"; c.lineWidth = 0.8 * fine;
    for (let yy = y - 20; yy < y + h + 20; yy += step) {
      c.beginPath();
      for (let xx = x - 4; xx <= x + w + 4; xx += 3 * fine) {
        const k = (xx - x) / w;
        const v = yy + (fam ? 5 : 4) * fine * Math.sin(xx / (fam ? 17 : 23) / fine + yy / 31 + fam * 1.7) + 2.5 * fine * Math.sin(k * 9.4 + yy / 13);
        xx === x - 4 ? c.moveTo(xx, v) : c.lineTo(xx, v);
      }
      c.stroke();
    }
  }
  // a rosette (spirograph) in the middle of the field
  const cx = x + w / 2, cy = y + h * 0.48, R = Math.min(w, h) * 0.36;
  c.strokeStyle = "rgba(0,93,200,0.10)"; c.lineWidth = 0.9 * fine;
  for (let ring = 0; ring < 3; ring++) {
    const rr = R * (1 - ring * 0.2);
    c.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.01) {
      const q = rr * (0.78 + 0.22 * Math.cos(a * (11 + ring * 2)));
      const px = cx + q * Math.cos(a + 0.4 * Math.sin(a * 7)), py = cy + q * Math.sin(a + 0.4 * Math.sin(a * 7));
      a === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
    }
    c.stroke();
  }
  // diagonal microtext
  c.translate(x + w / 2, y + h / 2); c.rotate(-0.52);
  c.fillStyle = "rgba(11,63,122,0.085)"; c.font = `700 ${8.5 * fine}px ${BODY}`; c.textAlign = "left";
  const line = "STATE LOTTERY • WINFALL • ".repeat(14);
  const span = Math.hypot(w, h);
  for (let yy = -span / 2, i = 0; yy < span / 2; yy += 13 * fine, i++) c.fillText(line, -span / 2 - (i % 3) * 30 * fine, yy);
  c.restore();
};

// ── the pre-printed header pieces ─────────────────────────────────────────────────────────────────────────────────────────
const starburst = (c, cx, cy, R, n = 28) => {
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 0.5) / n) * Math.PI * 2;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + R * Math.cos(a0), cy + R * Math.sin(a0)); c.lineTo(cx + R * Math.cos(a1), cy + R * Math.sin(a1)); c.closePath();
    c.fillStyle = i % 2 ? "rgba(255,255,255,0.07)" : "rgba(227,201,136,0.16)"; c.fill();
  }
  const g = c.createRadialGradient(cx, cy, 0, cx, cy, R * 0.55); g.addColorStop(0, "rgba(179,206,239,0.45)"); g.addColorStop(1, "rgba(179,206,239,0)");
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R * 0.55, 0, Math.PI * 2); c.fill();
};
// a small spiky star (the burst behind the "$2" seal / sparkles)
const spark = (c, cx, cy, R, pts, fill, stroke) => {
  c.beginPath();
  for (let i = 0; i <= pts * 2; i++) { const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2, q = i % 2 ? R * 0.55 : R; i ? c.lineTo(cx + q * Math.cos(a), cy + q * Math.sin(a)) : c.moveTo(cx + q * Math.cos(a), cy + q * Math.sin(a)); }
  c.closePath(); c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = R * 0.08; c.stroke(); }
};
const ball = (c, cx, cy, r, n, base, ink) => {
  c.save();
  c.fillStyle = "rgba(3,20,45,0.35)"; c.beginPath(); c.ellipse(cx + r * 0.12, cy + r * 0.16, r, r, 0, 0, Math.PI * 2); c.fill();
  const g = c.createRadialGradient(cx - r * 0.38, cy - r * 0.42, r * 0.08, cx, cy, r * 1.05);
  g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.35, base); g.addColorStop(1, shade(base));
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
  // the white number disc
  c.fillStyle = "rgba(255,255,255,0.92)"; c.beginPath(); c.arc(cx, cy + r * 0.04, r * 0.6, 0, Math.PI * 2); c.fill();
  c.fillStyle = ink; c.font = `800 ${r * 0.78}px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(String(n), cx, cy + r * 0.08);
  // specular highlight
  const h = c.createRadialGradient(cx - r * 0.45, cy - r * 0.5, 0, cx - r * 0.45, cy - r * 0.5, r * 0.4);
  h.addColorStop(0, "rgba(255,255,255,0.95)"); h.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = h; c.beginPath(); c.arc(cx - r * 0.45, cy - r * 0.5, r * 0.4, 0, Math.PI * 2); c.fill();
  c.textBaseline = "alphabetic"; c.restore();
};
const shade = (hex) => { const n = parseInt(hex.slice(1), 16); const f = 0.62; return `rgb(${((n >> 16) & 255) * f | 0},${((n >> 8) & 255) * f | 0},${(n & 255) * f | 0})`; };
const BALLS = [[7, "#FFFFFF", C.deep], [14, C.pale, C.deep], [23, C.gold, C.navy], [31, "#FFFFFF", C.deep], [38, C.light, C.deep], [45, "#FFFFFF", C.deep]];

/** the WINFALL logo: bold italic, gold outline, navy drop shadow, white-to-ice fill; fitted to maxW */
const logo = (c, text, cx, cy, size, maxW) => {
  c.save();
  c.font = `italic 900 ${size}px ${BODY}`;
  const m = c.measureText(text).width; const k = Math.min(1, maxW / m);
  c.translate(cx, cy); c.scale(k, 1); c.transform(1, 0, -0.12, 1, 0, 0);   // a little extra slant (stays italic even if no italic face is loaded)
  c.textAlign = "center"; c.textBaseline = "middle"; c.lineJoin = "round";
  c.fillStyle = C.navy; c.fillText(text, size * 0.05, size * 0.07);
  c.strokeStyle = C.navy; c.lineWidth = size * 0.2; c.strokeText(text, size * 0.05, size * 0.07);
  c.strokeStyle = C.gold2; c.lineWidth = size * 0.15; c.strokeText(text, 0, 0);
  c.strokeStyle = C.deep; c.lineWidth = size * 0.06; c.strokeText(text, 0, 0);
  const g = c.createLinearGradient(0, -size * 0.45, 0, size * 0.4); g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.55, "#FFFFFF"); g.addColorStop(1, "#BFD8F5");
  c.fillStyle = g; c.fillText(text, 0, 0);
  c.restore();
};
const spaced = (c, text, cx, y, track) => {
  const ws = [...text].map((ch) => c.measureText(ch).width); const tw = ws.reduce((a, b) => a + b, 0) + track * (ws.length - 1);
  let x = cx - tw / 2; c.textAlign = "left"; [...text].forEach((ch, i) => { c.fillText(ch, x, y); x += ws[i] + track; }); return tw;
};
const headerFill = (c, x, y, w, h) => {
  const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, C.deep); g.addColorStop(0.55, C.logo); g.addColorStop(1, "#0A4C9C");
  return g;
};

// ── the thermal-printed pieces ────────────────────────────────────────────────────────────────────────────────────────────
const barcode = (c, x, y, w, h, r, mod) => {
  c.fillStyle = C.ink;
  let xx = x;
  [1, 1, 1].forEach((_, i) => { if (i % 2 === 0) c.fillRect(xx, y, mod, h + mod * 4); xx += mod; });   // start guard
  xx += mod;
  while (xx < x + w - mod * 6) { const bw = mod * (1 + Math.floor(r() * 3)), gap = mod * (1 + Math.floor(r() * 3)); c.fillRect(xx, y, bw, h); xx += bw + gap; }
  xx = x + w - mod * 3; c.fillRect(xx, y, mod, h + mod * 4); c.fillRect(xx + mod * 2, y, mod, h + mod * 4);   // end guard
};
const code2d = (c, x, y, size, r) => {
  const n = 21, m = size / n;
  c.fillStyle = "#FFFFFF"; c.fillRect(x - m, y - m, size + 2 * m, size + 2 * m);
  c.fillStyle = C.ink;
  const finder = (fx, fy) => { c.fillRect(x + fx * m, y + fy * m, 7 * m, 7 * m); c.fillStyle = "#FFFFFF"; c.fillRect(x + (fx + 1) * m, y + (fy + 1) * m, 5 * m, 5 * m); c.fillStyle = C.ink; c.fillRect(x + (fx + 2) * m, y + (fy + 2) * m, 3 * m, 3 * m); };
  const inF = (i, j) => (i < 8 && j < 8) || (i > n - 9 && j < 8) || (i < 8 && j > n - 9);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (!inF(i, j) && r() < 0.48) c.fillRect(x + i * m, y + j * m, m + 0.3, m + 0.3);
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
};
const rule = (c, x0, x1, y, dash, lw) => { c.save(); c.strokeStyle = C.ink; c.lineWidth = lw; c.setLineDash(dash); c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); c.restore(); };
const perforation = (c, x0, x1, y, r, gap) => {
  c.fillStyle = "rgba(11,37,71,0.28)";
  for (let x = x0; x <= x1; x += gap) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
};

// ── the portrait ticket (unit width 512) ──────────────────────────────────────────────────────────────────────────────────
const portrait = (c, H, r, o) => {
  const W = 512, ex = Math.max(0, H - 904);   // extra height on the narrower slips: spread into the header, the plays and the gaps
  // paper + security field
  c.fillStyle = "#F7FAFD"; c.fillRect(0, 0, W, H);
  const HH = 236 + ex * 0.3;   // the header's height
  security(c, 0, HH, W, H - HH, r, 1);
  // the header: gradient, starburst, wave bottom edge
  c.save();
  c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(W, HH - 10);
  for (let x = W; x >= 0; x -= 4) c.lineTo(x, HH - 10 + 7 * Math.sin(x / 26));
  c.closePath(); c.fillStyle = headerFill(c, 0, 0, W, HH); c.fill(); c.clip();
  // fine light guilloche inside the header too
  c.strokeStyle = "rgba(127,180,242,0.16)"; c.lineWidth = 1;
  for (let k = 0; k < 18; k++) { c.beginPath(); for (let x = 0; x <= W; x += 4) { const y = 12 + k * (HH / 18) + 5 * Math.sin(x / 19 + k * 0.7); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
  const logoY = 116 + ex * 0.12;
  starburst(c, W / 2, logoY, 300);
  c.restore();
  // a gold hairline under the wave
  c.strokeStyle = C.gold2; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= W; x += 4) { const y = HH - 10 + 7 * Math.sin(x / 26); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  // "STATE LOTTERY" with gold rules
  c.fillStyle = "#FFFFFF"; c.font = `800 21px ${BODY}`;
  const tw = spaced(c, "STATE LOTTERY", W / 2, 40, 5);
  c.fillStyle = C.gold; c.fillRect(40, 33, W / 2 - tw / 2 - 56, 3); c.fillRect(W / 2 + tw / 2 + 16, 33, W / 2 - tw / 2 - 56, 3);
  spark(c, W / 2 - tw / 2 - 20, 34, 9, 4, C.gold); spark(c, W / 2 + tw / 2 + 20, 34, 9, 4, C.gold);
  // the logo
  logo(c, "WINFALL", W / 2, logoY, 104, W - 70);
  spark(c, 452, logoY - 52, 15, 4, "#FFFFFF"); spark(c, 66, logoY + 40, 10, 4, C.gold);
  // the balls
  const by = logoY + 78 + ex * 0.1, br = 21 + ex * 0.012;
  BALLS.forEach(([n, base, ink], i) => ball(c, W / 2 + (i - 2.5) * (54 + ex * 0.02), by, br, n, base, ink));
  // the ribbon: ROLL-DOWN DRAW
  const ry = HH + 4;
  c.fillStyle = C.light; c.beginPath(); c.moveTo(70, ry); c.lineTo(W - 70, ry); c.lineTo(W - 56, ry + 15); c.lineTo(W - 70, ry + 30); c.lineTo(70, ry + 30); c.lineTo(56, ry + 15); c.closePath(); c.fill();
  c.fillStyle = "#FFFFFF"; c.font = `800 17px ${BODY}`; spaced(c, "ROLL-DOWN DRAW  •  QUICK PICK", W / 2, ry + 21, 2.2);
  // the pre-printed frame around the body
  c.strokeStyle = "rgba(77,142,217,0.55)"; c.lineWidth = 2; c.beginPath(); c.roundRect(14, HH + 44, W - 28, H - HH - 76, 10); c.stroke();
  c.strokeStyle = "rgba(77,142,217,0.25)"; c.lineWidth = 1; c.beginPath(); c.roundRect(19, HH + 49, W - 38, H - HH - 86, 7); c.stroke();
  // ── thermal print ──
  const L = 42, R = W - 42;
  let y = HH + 86 + ex * 0.03;
  c.fillStyle = C.ink; c.textAlign = "center";
  c.font = `700 30px ${MONO}`; c.fillText("** QUICK PICK **", W / 2, y);
  y += 32; c.font = `400 21px ${MONO}`; c.fillText(o.drawLine, W / 2, y);
  y += 16; rule(c, L, R, y, [6, 5], 2);
  const step = 46 + ex * 0.07; y += 40;
  ["A", "B", "C", "D", "E"].forEach((row) => {
    const nums = play(r).map(pad2).join(" ");
    c.textAlign = "left"; c.font = `700 30px ${MONO}`; c.fillText(row + ".", L, y);
    c.font = `400 30px ${MONO}`; c.fillText(nums, L + 54, y);
    c.font = `700 19px ${MONO}`; c.textAlign = "right"; c.fillText("QP", R, y - 1);
    y += step;
  });
  y += -step + 22; rule(c, L, R, y, [6, 5], 2);
  y += 30; c.font = `400 21px ${MONO}`; c.textAlign = "left"; c.fillText("5 PLAYS", L, y); c.textAlign = "right"; c.fillText(`$${o.each}.00 EACH`, R, y);
  y += 40; c.font = `700 34px ${MONO}`; c.textAlign = "left"; c.fillText("TOTAL", L, y); c.textAlign = "right"; c.fillText(`$${o.each * 5}.00`, R, y);
  y += 30; c.font = `400 17px ${MONO}`; c.textAlign = "left";
  const term = String(400000 + Math.floor(r() * 99999)), ser = `${1000 + Math.floor(r() * 8999)}-${10000 + Math.floor(r() * 89999)}-${pad2(Math.floor(r() * 99))}`;
  c.fillText(`TERM ${term}`, L, y); c.textAlign = "right"; c.fillText(`TKT ${pad2(1 + Math.floor(r() * 98))}`, R, y);
  // barcode + 2-D code
  const codeS = 86 + ex * 0.08, by2 = y + 18 + ex * 0.06;
  barcode(c, L, by2, R - L - codeS - 18, codeS - 16, r, 2.4);
  code2d(c, R - codeS, by2, codeS, r);
  y = by2 + codeS + 12; c.font = `400 17px ${MONO}`; c.textAlign = "left"; c.fillStyle = C.ink;
  c.fillText(`${ser} ${String(100000 + Math.floor(r() * 899999))}`, L, y);
  // small print (pre-printed, in blue)
  y += 24 + ex * 0.04; c.fillStyle = C.deep; c.textAlign = "center"; c.font = `700 14px ${BODY}`;
  spaced(c, "KEEP YOUR TICKET · SIGN THE BACK", W / 2, y, 1.4);
  y += 18; c.font = `600 13px ${BODY}`; spaced(c, "MUST BE 18 OR OLDER TO PLAY", W / 2, y, 1.4);
  // the tear line
  perforation(c, 8, W - 8, H - 12, 2.2, 9);
};

// ── the compact landscape ticket (unit 512 × 256) ─────────────────────────────────────────────────────────────────────────
const landscape = (c, H, r, o) => {
  const W = 512, PW = 176;
  c.fillStyle = "#F7FAFD"; c.fillRect(0, 0, W, H);
  security(c, PW, 0, W - PW, H, r, 1.4);
  // header panel (left), wave right edge
  c.save();
  c.beginPath(); c.moveTo(0, 0); c.lineTo(PW - 8, 0); for (let y = 0; y <= H; y += 4) c.lineTo(PW - 8 + 6 * Math.sin(y / 20), y); c.lineTo(0, H); c.closePath();
  c.fillStyle = headerFill(c, 0, 0, PW, H); c.fill(); c.clip();
  starburst(c, PW / 2, 100, 190, 22);
  c.restore();
  c.strokeStyle = C.gold2; c.lineWidth = 3; c.beginPath(); for (let y = 0; y <= H; y += 4) { const x = PW - 8 + 6 * Math.sin(y / 20); y ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  c.fillStyle = "#FFFFFF"; c.font = `800 15px ${BODY}`; spaced(c, "STATE LOTTERY", PW / 2 - 4, 32, 2.5);
  logo(c, "WINFALL", PW / 2 - 4, 96, 50, PW - 30);
  [[7, "#FFFFFF", C.deep], [23, C.gold, C.navy], [38, C.pale, C.deep]].forEach(([n, base, ink], i) => ball(c, PW / 2 - 4 + (i - 1) * 46, 160, 19, n, base, ink));
  c.fillStyle = "#FFFFFF"; c.font = `800 13px ${BODY}`; spaced(c, "ROLL-DOWN DRAW", PW / 2 - 4, 222, 2);
  // thermal print
  const L = PW + 20, R = W - 26;
  c.fillStyle = C.ink; c.font = `700 19px ${MONO}`; c.textAlign = "left"; c.fillText("QUICK PICK", L, 30);
  c.font = `400 17px ${MONO}`; c.textAlign = "right"; c.fillText(o.drawLine, R, 30);
  rule(c, L, R, 40, [5, 4], 1.6);
  ["A", "B", "C", "D", "E"].forEach((row, i) => {
    const y = 64 + i * 24;
    c.textAlign = "left"; c.font = `700 19px ${MONO}`; c.fillText(row + ".", L, y);
    c.font = `400 19px ${MONO}`; c.fillText(play(r).map(pad2).join(" "), L + 32, y);
    c.font = `700 14px ${MONO}`; c.textAlign = "right"; c.fillText("QP", R, y);
  });
  rule(c, L, R, 176, [5, 4], 1.6);
  c.font = `700 19px ${MONO}`; c.textAlign = "left"; c.fillText("TOTAL", L, 198); c.textAlign = "right"; c.fillText(`$${o.each * 5}.00`, R, 198);
  barcode(c, L, 210, R - L - 52, 30, r, 1.8);
  code2d(c, R - 38, 206, 38, r);
  // the tear line along the right edge
  c.fillStyle = "rgba(11,37,71,0.28)"; for (let y = 8; y < H; y += 9) { c.beginPath(); c.arc(W - 8, y, 2, 0, Math.PI * 2); c.fill(); }
};

/** draw the house lottery ticket into the whole canvas (c, w, h). opts: seed (number), compact (landscape), drawLine (thermal line) */
// each: the price of one play - Michigan Winfall $1, Massachusetts Cash WinFall $2 (FACTCHECK.md)
export const drawTicket = (c, w, h, { seed = 1, compact = false, drawLine = "1 DRAW", each = 1 } = {}) => {
  const r = prng(seed + 17);
  const s = w / 512;
  c.save(); c.scale(s, s);
  (compact ? landscape : portrait)(c, h / s, r, { drawLine, each });
  c.restore();
};
