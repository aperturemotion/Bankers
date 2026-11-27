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
/** the diploma itself (landscape 1600 × 1200) */
export const diplomaTex = () => canvasTex("b_diploma1940_v3", 1600, 1200, (c, w, h) => {
  // aged rag paper: cream with a warmer edge, faint foxing
  const g = c.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, w * 0.75); g.addColorStop(0, "#F4ECD6"); g.addColorStop(0.75, "#EBDDBB"); g.addColorStop(1, "#D9C396");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 26000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "120,90,50" : "255,250,235"},${rnd(i + 1) * 0.05})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2, 2); }
  for (let i = 0; i < 24; i++) { c.fillStyle = `rgba(150,110,60,${0.03 + rnd(i) * 0.05})`; c.beginPath(); c.arc(rnd(i * 3) * w, rnd(i * 7) * h, 6 + rnd(i * 5) * 22, 0, 7); c.fill(); }
  // the border: a double rule, an engraved rope, corner rosettes
  c.strokeStyle = "#3A3328"; c.lineWidth = 5; c.strokeRect(46, 46, w - 92, h - 92);
  c.lineWidth = 1.6; c.strokeRect(60, 60, w - 120, h - 120);
  guilloche(c, 82, 82, w - 164, h - 164, 34, "rgba(58,51,40,0.75)");
  c.lineWidth = 1.6; c.strokeRect(104, 104, w - 208, h - 208);
  for (const [x, y] of [[82, 82], [w - 82, 82], [82, h - 82], [w - 82, h - 82]]) {
    c.fillStyle = "#F1E7CE"; c.beginPath(); c.arc(x, y, 26, 0, 7); c.fill();
    c.strokeStyle = "#3A3328"; c.lineWidth = 2; for (let k = 0; k < 8; k++) { c.beginPath(); c.ellipse(x, y, 22, 8, (k * Math.PI) / 8, 0, 7); c.stroke(); }
  }
  // the heading
  center(c, "Brattleboro Union High School", w / 2, 268, `400 112px ${FRAKTUR}`, "#14110D", w - 280);
  center(c, "BRATTLEBORO, VERMONT", w / 2, 330, `400 36px ${FELL}`, "#2A251E");
  c.fillStyle = "#3A3328"; c.fillRect(w / 2 - 260, 360, 520, 2); c.beginPath(); c.arc(w / 2, 361, 6, 0, 7); c.fill();
  center(c, "This is to Certify that the holder of this Diploma", w / 2, 438, `400 42px ${FELL_I}`, "#1E1A14");
  center(c, "has satisfactorily completed the Course of Study prescribed", w / 2, 498, `400 40px ${FELL}`, "#1E1A14");
  center(c, "for this High School, and is therefore entitled to this", w / 2, 552, `400 40px ${FELL}`, "#1E1A14");
  center(c, "Diploma", w / 2, 682, `400 128px ${FRAKTUR}`, "#14110D");
  center(c, "CLASS OF 1940", w / 2, 812, `400 96px ${FELL}`, "#14110D");
  c.fillStyle = "#3A3328"; c.fillRect(w / 2 - 290, 840, 580, 2);
  center(c, "Given at Brattleboro, Vermont, in the year nineteen hundred and forty", w / 2, 892, `400 32px ${FELL_I}`, "#2A251E");
  // the signature lines (generic hands, no names)
  const sig = [[300, "Principal"], [w / 2 + 120, "Superintendent of Schools"], [w - 330, "Chairman, School Board"]];
  sig.forEach(([x, label], i) => {
    if (i === 0) return;
    signature(c, x - 150, 1010, 300, 11 + i * 17);
    c.fillStyle = "#2E281F"; c.fillRect(x - 170, 1024, 340, 2);
    center(c, label, x, 1058, `400 27px ${FELL_I}`, "#2A251E");
  });
  // the gold seal with its ribbons (bottom left)
  const sx = 300, sy = 1010;
  c.fillStyle = "#1F3F78"; for (const a of [-0.35, 0.35]) { c.save(); c.translate(sx, sy); c.rotate(a); c.beginPath(); c.moveTo(-26, 0); c.lineTo(26, 0); c.lineTo(30, 150); c.lineTo(0, 124); c.lineTo(-30, 150); c.closePath(); c.fill(); c.restore(); }
  const sg = c.createRadialGradient(sx - 20, sy - 25, 10, sx, sy, 96); sg.addColorStop(0, "#F7E3A0"); sg.addColorStop(0.5, "#D2A84C"); sg.addColorStop(1, "#8E6A22");
  c.fillStyle = sg; c.beginPath();
  for (let k = 0; k <= 72; k++) { const a = (k / 72) * Math.PI * 2, r = k % 2 ? 92 : 100; c.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); }
  c.fill();
  c.strokeStyle = "rgba(90,64,20,0.85)"; c.lineWidth = 2; c.beginPath(); c.arc(sx, sy, 78, 0, 7); c.stroke(); c.beginPath(); c.arc(sx, sy, 52, 0, 7); c.stroke();
  c.save(); c.translate(sx, sy); c.font = `400 17px ${SERIF}`; c.fillStyle = "rgba(80,56,16,0.95)"; c.textAlign = "center"; c.textBaseline = "middle";
  const txt = "BRATTLEBORO UNION HIGH SCHOOL · VERMONT · ";
  for (let i = 0; i < txt.length; i++) { const a = (i / txt.length) * Math.PI * 2 - Math.PI / 2; c.save(); c.rotate(a + Math.PI / 2); c.fillText(txt[i], 0, -65); c.restore(); }
  c.font = `700 30px ${SERIF}`; c.fillText("1940", 0, 2); c.restore();
  // age: a soft shadow along the top where the mat has sat for years
  const sh = c.createLinearGradient(0, 0, 0, 60); sh.addColorStop(0, "rgba(90,60,30,0.25)"); sh.addColorStop(1, "rgba(90,60,30,0)"); c.fillStyle = sh; c.fillRect(0, 0, w, 60);
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
