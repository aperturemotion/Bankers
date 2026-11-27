// @ts-nocheck
// ★ V39 builder B — the framed HIGH-SCHOOL DIPLOMA in the farmhouse window (FACTCHECK row 2: Brattleboro Union High School, 1940,
//   "the first high school graduate in his family"). A 1940-style engrossed diploma: an engraved guilloche border, the school's name
//   in blackletter, the certification in an old-style roman, CLASS OF 1940, three signature lines with generic (illegible) hands,
//   a gold foil seal with ribbons. NO NAME is printed (the holder is a real person) — the wording certifies "the holder of this Diploma".
import { loadFont as loadFraktur } from "@remotion/google-fonts/UnifrakturMaguntia";
import { loadFont as loadFell } from "@remotion/google-fonts/IMFellEnglish";
import { canvasTex, rnd } from "./kit";

const FRAKTUR = loadFraktur().fontFamily;
const FELL = loadFell("normal", { weights: ["400"] }).fontFamily;
const FELL_I = loadFell("italic", { weights: ["400"] }).fontFamily;
const SERIF = `"Liberation Serif", "Times New Roman", serif`;

const center = (c, s, x, y, font, color = "#1B1712", maxW) => { c.font = font; c.fillStyle = color; c.textAlign = "center"; c.textBaseline = "alphabetic"; if (maxW) c.fillText(s, x, y, maxW); else c.fillText(s, x, y); };
const guilloche = (c, x, y, w, h, pitch, color) => {
  // an engraved rope border: two interleaved sine bands along the four edges
  c.strokeStyle = color; c.lineWidth = 1.3;
  const edge = (x0, y0, x1, y1) => {
    const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy, ny = ux;
    for (let k = 0; k < 4; k++) {
      c.beginPath();
      for (let s = 0; s <= L; s += 2) { const o = Math.sin((s / pitch) * Math.PI * 2 + k * Math.PI / 2) * 9; const px = x0 + ux * s + nx * o, py = y0 + uy * s + ny * o; if (s === 0) c.moveTo(px, py); else c.lineTo(px, py); }
      c.stroke();
    }
  };
  edge(x, y, x + w, y); edge(x + w, y, x + w, y + h); edge(x + w, y + h, x, y + h); edge(x, y + h, x, y);
};
const signature = (c, x, y, w, seed) => {
  // a generic, illegible hand (no real person's name): loops and a long trailing stroke
  c.strokeStyle = "rgba(24,26,44,0.88)"; c.lineWidth = 2.6; c.lineCap = "round"; c.beginPath();
  let px = x, py = y;
  c.moveTo(px, py);
  const n = 9 + Math.floor(rnd(seed) * 4);
  for (let i = 0; i < n; i++) {
    const nx = x + (w * 0.8 * (i + 1)) / n, ny = y - 8 - rnd(seed + i) * 26;
    c.bezierCurveTo(px + 10, ny - 18 * rnd(seed + i * 3), nx - 14, y + 10 * rnd(seed + i * 5), nx, i % 3 === 0 ? ny : y - 4);
    px = nx; py = ny;
  }
  c.bezierCurveTo(px + 20, y + 6, px + w * 0.15, y - 2, x + w, y - 10);
  c.stroke();
};
/** (E) an engraved acanthus scroll (a period diploma's ornament): mirrored C-scrolls with leaf curls, drawn as fine engraved strokes */
const scroll = (c, x, y, s, color, flip = 1) => {
  c.save(); c.translate(x, y); c.scale(s * flip, s); c.strokeStyle = color; c.lineCap = "round";
  for (let k = 0; k < 3; k++) {
    c.lineWidth = 2.4 - k * 0.6; c.beginPath(); c.moveTo(0, 0);
    c.bezierCurveTo(40, -30 - k * 6, 110, -34 - k * 4, 150, -4 - k * 3); c.bezierCurveTo(176, 18, 160, 46, 134, 40); c.bezierCurveTo(116, 36, 118, 16, 134, 16);
    c.stroke();
  }
  for (let k = 0; k < 5; k++) { c.lineWidth = 1.2; c.beginPath(); const t = 30 + k * 24; c.moveTo(t, -20 - k * 1.5); c.quadraticCurveTo(t + 10, -42 - k * 2, t + 22, -30 - k * 2); c.stroke(); }
  c.restore();
};
/** the diploma itself (landscape 2400 × 1800; the words exactly as before: FACTCHECK row 2 — no name is printed) */
export const diplomaTex = () => canvasTex("e_diploma1940_v4", 2400, 1800, (c, w, h) => {
  const S = w / 1600;   // the layout was designed on 1600 × 1200; everything scales with it
  c.save(); c.scale(S, S);
  const W0 = 1600, H0 = 1200;
  // heavy cream rag paper, warmer and foxed toward the edges, faint laid lines and fibres
  const g = c.createRadialGradient(W0 / 2, H0 / 2, 100, W0 / 2, H0 / 2, W0 * 0.75); g.addColorStop(0, "#F5EDD8"); g.addColorStop(0.72, "#ECDFBF"); g.addColorStop(1, "#D8C294");
  c.fillStyle = g; c.fillRect(0, 0, W0, H0);
  for (let y = 0; y < H0; y += 5) { c.fillStyle = "rgba(150,120,80,0.025)"; c.fillRect(0, y, W0, 1); }
  for (let i = 0; i < 30000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "120,90,50" : "255,250,235"},${rnd(i + 1) * 0.05})`; c.fillRect(rnd(i + 2) * W0, rnd(i + 3) * H0, 1.5, 1.5); }
  for (let i = 0; i < 400; i++) { c.strokeStyle = `rgba(140,110,70,${0.05 + rnd(i) * 0.06})`; c.lineWidth = 0.6; c.beginPath(); const x = rnd(i * 3) * W0, y = rnd(i * 5) * H0; c.moveTo(x, y); c.quadraticCurveTo(x + 8, y + 3, x + 6 + rnd(i) * 12, y + 8); c.stroke(); }
  for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(150,110,60,${0.03 + rnd(i) * 0.05})`; c.beginPath(); c.arc(rnd(i * 3) * W0, rnd(i * 7) * H0, 5 + rnd(i * 5) * 20, 0, 7); c.fill(); }
  const ink = "#2E281E";
  // the engraved border: an outer heavy rule, a fine rule, a band of guilloche rope, a band of fine cross-hatching, an inner double rule
  c.strokeStyle = ink; c.lineWidth = 6; c.strokeRect(40, 40, W0 - 80, H0 - 80);
  c.lineWidth = 1.4; c.strokeRect(52, 52, W0 - 104, H0 - 104);
  guilloche(c, 76, 76, W0 - 152, H0 - 152, 30, "rgba(46,40,30,0.8)");
  c.save(); c.beginPath(); c.rect(94, 94, W0 - 188, H0 - 188); c.rect(110, 110, W0 - 220, H0 - 220); c.clip("evenodd");
  c.strokeStyle = "rgba(46,40,30,0.55)"; c.lineWidth = 0.9; for (let k = -H0; k < W0; k += 6) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + H0, H0); c.stroke(); c.beginPath(); c.moveTo(k + H0, 0); c.lineTo(k, H0); c.stroke(); }
  c.restore();
  c.lineWidth = 1.6; c.strokeRect(94, 94, W0 - 188, H0 - 188); c.strokeRect(110, 110, W0 - 220, H0 - 220);
  c.lineWidth = 0.9; c.strokeRect(118, 118, W0 - 236, H0 - 236);
  // corner rosettes (engraved, many-petalled) sitting on the rope
  for (const [x, y] of [[76, 76], [W0 - 76, 76], [76, H0 - 76], [W0 - 76, H0 - 76]]) {
    c.fillStyle = "#F1E6CC"; c.beginPath(); c.arc(x, y, 30, 0, 7); c.fill();
    c.strokeStyle = ink; c.lineWidth = 1.6; c.beginPath(); c.arc(x, y, 30, 0, 7); c.stroke();
    for (let k = 0; k < 12; k++) { c.beginPath(); c.ellipse(x, y, 26, 7, (k * Math.PI) / 12, 0, 7); c.lineWidth = 1; c.stroke(); }
    c.fillStyle = ink; c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill();
  }
  // the scrolled cartouche over the heading, and smaller scrolls at the foot centre
  scroll(c, W0 / 2 - 20, 170, 1.15, "rgba(46,40,30,0.85)", -1); scroll(c, W0 / 2 + 20, 170, 1.15, "rgba(46,40,30,0.85)", 1);
  c.fillStyle = ink; c.beginPath(); c.moveTo(W0 / 2, 140); c.lineTo(W0 / 2 + 12, 160); c.lineTo(W0 / 2, 180); c.lineTo(W0 / 2 - 12, 160); c.closePath(); c.fill();
  scroll(c, W0 / 2 - 14, 1110, 0.6, "rgba(46,40,30,0.7)", -1); scroll(c, W0 / 2 + 14, 1110, 0.6, "rgba(46,40,30,0.7)", 1);
  // the heading (the words exactly as before)
  center(c, "Brattleboro Union High School", W0 / 2, 288, `400 108px ${FRAKTUR}`, "#14110D", W0 - 300);
  center(c, "BRATTLEBORO, VERMONT", W0 / 2, 346, `400 34px ${FELL}`, "#2A251E");
  c.fillStyle = "#3A3328"; c.fillRect(W0 / 2 - 260, 372, 520, 2); c.beginPath(); c.arc(W0 / 2, 373, 6, 0, 7); c.fill();
  for (const sd of [-1, 1]) { c.beginPath(); c.arc(W0 / 2 + sd * 272, 373, 3.5, 0, 7); c.fill(); }
  center(c, "This is to Certify that the holder of this Diploma", W0 / 2, 446, `400 42px ${FELL_I}`, "#1E1A14");
  center(c, "has satisfactorily completed the Course of Study prescribed", W0 / 2, 504, `400 39px ${FELL}`, "#1E1A14");
  center(c, "for this High School, and is therefore entitled to this", W0 / 2, 556, `400 39px ${FELL}`, "#1E1A14");
  center(c, "Diploma", W0 / 2, 684, `400 128px ${FRAKTUR}`, "#14110D");
  center(c, "CLASS OF 1940", W0 / 2, 806, `400 92px ${FELL}`, "#14110D");
  c.fillStyle = "#3A3328"; c.fillRect(W0 / 2 - 290, 834, 580, 2);
  center(c, "Given at Brattleboro, Vermont, in the year nineteen hundred and forty", W0 / 2, 884, `400 31px ${FELL_I}`, "#2A251E");
  // the signature lines (generic hands, no names)
  const sig = [[300, "Principal"], [W0 / 2 + 120, "Superintendent of Schools"], [W0 - 330, "Chairman, School Board"]];
  sig.forEach(([x, label], i) => {
    if (i === 0) return;
    signature(c, x - 150, 1000, 300, 11 + i * 17);
    c.fillStyle = "#2E281F"; c.fillRect(x - 170, 1014, 340, 2);
    center(c, label, x, 1046, `400 26px ${FELL_I}`, "#2A251E");
  });
  // the embossed gold foil seal with its ribbon (bottom left): two ribbon tails with V-cut ends, folds shaded; a notched
  // starburst rim, raised rings, the school's name round the band, 1940 in the centre, a highlight sweep
  const sx = 300, sy = 990;
  for (const [a, col] of [[-0.42, "#1F3F78"], [0.38, "#C9A24A"]]) {
    c.save(); c.translate(sx, sy); c.rotate(a);
    const rg = c.createLinearGradient(-30, 0, 30, 0); rg.addColorStop(0, "rgba(0,0,0,0.25)"); rg.addColorStop(0.5, "rgba(255,255,255,0.15)"); rg.addColorStop(1, "rgba(0,0,0,0.3)");
    c.fillStyle = col; c.beginPath(); c.moveTo(-28, 0); c.lineTo(28, 0); c.lineTo(32, 160); c.lineTo(0, 132); c.lineTo(-32, 160); c.closePath(); c.fill();
    c.fillStyle = rg; c.fill();
    c.strokeStyle = "rgba(255,255,255,0.25)"; c.lineWidth = 1; for (let k = -20; k <= 20; k += 8) { c.beginPath(); c.moveTo(k, 10); c.lineTo(k * 1.1, 140); c.stroke(); }
    c.restore();
  }
  const sg = c.createRadialGradient(sx - 24, sy - 30, 8, sx, sy, 104); sg.addColorStop(0, "#FBEBB0"); sg.addColorStop(0.45, "#D8AE52"); sg.addColorStop(0.85, "#A27A2C"); sg.addColorStop(1, "#7E5C1C");
  c.fillStyle = sg; c.beginPath();
  for (let k = 0; k <= 96; k++) { const a = (k / 96) * Math.PI * 2, r = k % 2 ? 94 : 102; c.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); }
  c.fill();
  c.strokeStyle = "rgba(90,64,20,0.85)"; c.lineWidth = 2.5; c.beginPath(); c.arc(sx, sy, 84, 0, 7); c.stroke(); c.lineWidth = 1.5; c.beginPath(); c.arc(sx, sy, 80, 0, 7); c.stroke(); c.beginPath(); c.arc(sx, sy, 50, 0, 7); c.stroke();
  for (let k = 0; k < 48; k++) { const a = (k / 48) * Math.PI * 2; c.strokeStyle = "rgba(255,240,190,0.45)"; c.lineWidth = 1; c.beginPath(); c.moveTo(sx + Math.cos(a) * 86, sy + Math.sin(a) * 86); c.lineTo(sx + Math.cos(a) * 92, sy + Math.sin(a) * 92); c.stroke(); }
  c.save(); c.translate(sx, sy); c.font = `700 16px ${SERIF}`; c.fillStyle = "rgba(80,56,16,0.95)"; c.textAlign = "center"; c.textBaseline = "middle";
  const txt = "BRATTLEBORO UNION HIGH SCHOOL · VERMONT · ";
  for (let i = 0; i < txt.length; i++) { const a = (i / txt.length) * Math.PI * 2 - Math.PI / 2; c.save(); c.rotate(a + Math.PI / 2); c.fillText(txt[i], 0, -65); c.restore(); }
  c.font = `700 30px ${SERIF}`; c.fillText("1940", 0, 2);
  c.strokeStyle = "rgba(90,64,20,0.7)"; c.lineWidth = 1; for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a) * 30, Math.sin(a) * 30); c.lineTo(Math.cos(a) * 44, Math.sin(a) * 44); c.stroke(); }
  c.restore();
  const hl = c.createLinearGradient(sx - 90, sy - 90, sx + 60, sy + 60); hl.addColorStop(0, "rgba(255,255,240,0)"); hl.addColorStop(0.42, "rgba(255,255,240,0.35)"); hl.addColorStop(0.55, "rgba(255,255,240,0)"); c.fillStyle = hl; c.beginPath(); c.arc(sx, sy, 100, 0, 7); c.fill();
  // age: a soft shadow along the top where the mat has sat for years
  const sh = c.createLinearGradient(0, 0, 0, 60); sh.addColorStop(0, "rgba(90,60,30,0.25)"); sh.addColorStop(1, "rgba(90,60,30,0)"); c.fillStyle = sh; c.fillRect(0, 0, W0, 60);
  c.restore();
});
/** (E) the glass over the framed diploma: a faint glare streak in one corner, the rest clear (an alpha map for the glass plane) */
export const glareTex = () => canvasTex("e_glare", 512, 512, (c, w, h) => {
  c.fillStyle = "#000"; c.fillRect(0, 0, w, h);
  const g = c.createLinearGradient(0, 0, w * 0.45, h * 0.45); g.addColorStop(0, "rgba(255,255,255,0.0)"); g.addColorStop(0.25, "rgba(255,255,255,0.55)"); g.addColorStop(0.4, "rgba(255,255,255,0.08)"); g.addColorStop(0.55, "rgba(255,255,255,0.3)"); g.addColorStop(0.7, "rgba(255,255,255,0)");
  c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.lineTo(w * 0.42, 0); c.lineTo(0, h * 0.42); c.closePath(); c.fill();
  c.fillStyle = "rgba(255,255,255,0.12)"; c.fillRect(0, 0, w, h);
});
/** faded 1930s wallpaper: a small floral sprig on a dusty rose-beige ground, with vertical stripes */
export const wallpaperTex = () => canvasTex("b_wallpaper", 512, 512, (c, w, h) => {
  c.fillStyle = "#C9B497"; c.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 64) { c.fillStyle = "rgba(150,120,90,0.25)"; c.fillRect(x, 0, 6, h); c.fillStyle = "rgba(255,245,225,0.15)"; c.fillRect(x + 10, 0, 3, h); }
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
    const x = i * 64 + 32 + (j % 2) * 0, y = j * 64 + 32 + (i % 2) * 32;
    c.fillStyle = "rgba(140,80,70,0.45)"; for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; c.beginPath(); c.arc(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 4, 0, 7); c.fill(); }
    c.fillStyle = "rgba(90,100,70,0.45)"; c.beginPath(); c.ellipse(x - 9, y + 9, 7, 3, -0.7, 0, 7); c.fill(); c.beginPath(); c.ellipse(x + 9, y + 10, 7, 3, 0.7, 0, 7); c.fill();
  }
  for (let i = 0; i < 6000; i++) { c.fillStyle = `rgba(80,60,40,${rnd(i) * 0.06})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
});
