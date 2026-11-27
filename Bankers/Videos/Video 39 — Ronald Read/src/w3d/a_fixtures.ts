// @ts-nocheck
// ★ V39 builder A (detail pass) — the STORE's soft goods and small print, built to survive a close look:
//   garments with a real hang (sloped shoulders, a body that is thicker at the chest, vertical drape folds, a wavy hem, sleeves hanging
//   at the sides, trousers folded over the bar), each on its own hanger (hook + shoulder bar), price tags, size dividers on the rails;
//   folded goods with the rolled fold at the front; the store's small print atlas (wall fascia words, window posters, tags, size discs,
//   fitting-room door numbers, shopping bags, counter signs) — real words, no figures but sizes.
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { BODY } from "./fonts3d";
import { Lm } from "./town_parts";

const F = (wt, px, fam = BODY) => `${wt} ${px}px ${fam}`;
const fit = (c, s, maxW, px, wt = 800) => { let p = px; c.font = F(wt, p); while (c.measureText(s).width > maxW && p > 8) { p -= 2; c.font = F(wt, p); } return p; };
const P = 2048;
const R = (x, y, w, h, ins = 3) => [(x + ins) / P, 1 - (y + h - ins) / P, (x + w - ins) / P, 1 - (y + ins) / P];

// ── the print atlas ────────────────────────────────────────────────────────────────────────────────────────────────────────
export const WALLWORDS = ["WOMEN'S", "MEN'S", "HOME", "SHOES"];
export const wallCell = (i) => R(0, i * 128, 2048, 128);
export const posterCell = (i) => R(i * 512, 512, 512, 768);
export const tagCell = (i) => R(i * 128, 1280, 128, 256);
export const SIZES = ["S", "M", "L", "XL", "XS", "XXL", "8", "10"];
export const sizeCell = (i) => R(1024 + i * 128, 1280, 128, 128);
export const doorNoCell = (i) => R(1024 + i * 128, 1408, 128, 128);
export const bagCell = (i) => R(i * 512, 1536, 512, 512);
export const notice = (i) => R(1024, 1536 + i * 256, 1024, 256);   // 0 return-rack sign · 1 the counter's sign
export const printTex = () => canvasTex("a_print", P, P, (c) => {
  c.textAlign = "center"; c.textBaseline = "middle";
  // the perimeter fascia bands: a pale band, the department word in navy, a light-blue rule under it (its own band)
  WALLWORDS.forEach((t, i) => {
    const y = i * 128; c.fillStyle = "#E7ECF2"; c.fillRect(0, y, 2048, 128);
    c.fillStyle = "#0B2F5E"; const p = fit(c, t, 1500, 92, 800); c.font = F(800, p); if ("letterSpacing" in c) c.letterSpacing = "18px"; c.fillText(t, 1024, y + 58); if ("letterSpacing" in c) c.letterSpacing = "0px";
    c.fillStyle = "#7FB4F2"; c.fillRect(0, y + 114, 2048, 8);
  });
  // window / wall posters: heading, a line of goods, an illustration band of its own (folded goods drawn as shapes), the store name
  const POST = [["SWEATERS", "CARDIGANS · CREWNECKS · TURTLENECKS"], ["OUTERWEAR", "PARKAS · WOOL COATS · JACKETS"], ["BED & BATH", "TOWELS · SHEETS · BLANKETS"], ["BOOTS", "WINTER BOOTS FOR THE FAMILY"]];
  POST.forEach(([a, b], i) => {
    const x = i * 512, y = 512;
    const g = c.createLinearGradient(0, y, 0, y + 768); g.addColorStop(0, "#0E3B73"); g.addColorStop(1, "#071F3E"); c.fillStyle = g; c.fillRect(x, y, 512, 768);
    c.fillStyle = "#F4F8FD"; const p = fit(c, a, 440, 96, 900); c.font = F(900, p); c.fillText(a, x + 256, y + 110);
    c.fillStyle = "#B3CEEF"; const q = fit(c, b, 440, 26, 700); c.font = F(700, q); c.fillText(b, x + 256, y + 180);
    c.fillStyle = "#7FB4F2"; c.fillRect(x + 156, y + 214, 200, 5);
    // the illustration band (y + 260 … y + 640): a stack of folded goods / a coat on a hanger / boots, drawn as simple shapes
    c.save(); c.translate(x + 256, y + 450);
    if (i === 0 || i === 2) { const cols = i === 0 ? ["#9FB7D8", "#E8E2EA", "#5E6F8C", "#C9B9A6", "#2D3B57"] : ["#EEF1F5", "#C9D6E6", "#8EA6C6", "#D9CFC0", "#5F7290"]; cols.forEach((col, k) => { c.fillStyle = col; c.beginPath(); c.roundRect(-150 + (k % 2) * 8, 120 - k * 58, 300, 52, 16); c.fill(); c.fillStyle = "rgba(0,0,0,0.15)"; c.fillRect(-140 + (k % 2) * 8, 158 - k * 58, 280, 6); }); }
    if (i === 1) { c.strokeStyle = "#DCE8FA"; c.lineWidth = 8; c.beginPath(); c.arc(0, -170, 22, Math.PI, 0); c.stroke(); c.beginPath(); c.moveTo(0, -148); c.lineTo(-110, -110); c.lineTo(110, -110); c.closePath(); c.stroke(); c.fillStyle = "#3B4C66"; c.beginPath(); c.moveTo(-100, -110); c.lineTo(100, -110); c.lineTo(130, 170); c.lineTo(-130, 170); c.closePath(); c.fill(); c.fillStyle = "#2C3E5C"; c.beginPath(); c.moveTo(-20, -110); c.lineTo(0, 40); c.lineTo(20, -110); c.closePath(); c.fill(); c.fillStyle = "#B9CDE6"; [-20, 30, 80].forEach((yy) => { c.beginPath(); c.arc(12, yy, 7, 0, 7); c.fill(); }); }
    if (i === 3) { for (const s of [-1, 1]) { c.fillStyle = "#5A3E2A"; c.beginPath(); c.moveTo(s * 90 - 40, -120); c.lineTo(s * 90 + 30, -120); c.lineTo(s * 90 + 34, 80); c.lineTo(s * 90 + 110, 110); c.lineTo(s * 90 + 110, 160); c.lineTo(s * 90 - 44, 160); c.closePath(); c.fill(); c.fillStyle = "#E7DCCB"; c.fillRect(s * 90 - 46, -130, 80, 22); c.fillStyle = "#1A1E24"; c.fillRect(s * 90 - 46, 150, 158, 14); } }
    c.restore();
    c.fillStyle = "#F4F8FD"; c.font = F(700, 34); c.fillText("JCPenney", x + 256, y + 712);
  });
  // price tags (card stock, a punched hole, the store name, a style line, a size, a barcode; no price figure)
  for (let i = 0; i < 8; i++) {
    const x = i * 128, y = 1280; c.fillStyle = "#F7F7F4"; c.fillRect(x, y, 128, 256);
    c.fillStyle = "#0B3F7A"; c.fillRect(x, y, 128, 46); c.fillStyle = "#FFFFFF"; c.font = F(800, 20); c.fillText("JCPenney", x + 64, y + 24);
    c.fillStyle = "#CFCFCF"; c.beginPath(); c.arc(x + 64, y + 66, 8, 0, 7); c.fill();
    c.fillStyle = "#1B2A40"; c.font = F(800, 26); c.fillText(SIZES[i], x + 64, y + 112); c.font = F(600, 14); c.fillText(["COTTON", "WOOL BLEND", "100% COTTON", "MACHINE WASH", "DRY CLEAN", "POLYESTER", "KNIT", "DENIM"][i], x + 64, y + 144);
    for (let k = 0; k < 30; k++) c.fillRect(x + 18 + k * 3.1, y + 170, rnd(i * 40 + k) < 0.5 ? 1.4 : 2.4, 46);
    c.font = F(600, 12); c.fillText("STYLE · COLOR · SIZE", x + 64, y + 232);
  }
  // size dividers (navy discs, white size), fitting-room door numbers
  SIZES.forEach((t, i) => { const x = 1024 + i * 128, y = 1280; c.fillStyle = "#0B2F5E"; c.fillRect(x, y, 128, 128); c.fillStyle = "#FFFFFF"; c.beginPath(); c.arc(x + 64, y + 64, 58, 0, 7); c.lineWidth = 4; c.strokeStyle = "#FFFFFF"; c.stroke(); c.font = F(800, t.length > 2 ? 40 : 54); c.fillText(t, x + 64, y + 66); });
  for (let i = 0; i < 8; i++) { const x = 1024 + i * 128, y = 1408; c.fillStyle = "#DDE3EA"; c.fillRect(x, y, 128, 128); c.fillStyle = "#0B2F5E"; c.font = F(800, 64); c.fillText(String(i + 1), x + 64, y + 66); }
  // shopping bags: white kraft-board with the store name in plain type and a blue rule; the gusset side
  for (let i = 0; i < 2; i++) {
    const x = i * 512, y = 1536; c.fillStyle = i ? "#E9EEF4" : "#F6F7F8"; c.fillRect(x, y, 512, 512);
    for (let k = 0; k < 2200; k++) { c.fillStyle = `rgba(0,0,0,${rnd(k + i) * 0.04})`; c.fillRect(x + rnd(k + 1) * 512, y + rnd(k + 2) * 512, 2, 1); }
    if (!i) { c.fillStyle = "#0B2F5E"; c.font = F(700, 86); c.fillText("JCPenney", x + 256, y + 250); c.fillStyle = "#4D8ED9"; c.fillRect(x + 96, y + 316, 320, 8); c.fillStyle = "#3A4A60"; c.font = F(600, 24); c.fillText("THANK YOU FOR SHOPPING", x + 256, y + 372); }
    else { c.fillStyle = "rgba(0,0,0,0.12)"; c.fillRect(x + 250, y, 12, 512); c.fillStyle = "#0B2F5E"; c.font = F(700, 40); c.save(); c.translate(x + 140, y + 256); c.rotate(-Math.PI / 2); c.fillText("JCPenney", 0, 0); c.restore(); }
  }
  // the return-rack sign and the service counter's sign
  [["PLEASE RETURN ITEMS HERE", "FITTING ROOMS"], ["CHECKOUT", "RETURNS · EXCHANGES · CATALOG PICK-UP"]].forEach(([a, b], i) => {
    const x = 1024, y = 1536 + i * 256; c.fillStyle = "#F4F7FB"; c.fillRect(x, y, 1024, 256); c.fillStyle = "#0B2F5E"; c.fillRect(x, y, 1024, 18); c.fillRect(x, y + 238, 1024, 18);
    c.fillStyle = "#0B2F5E"; const p = fit(c, a, 900, 84, 800); c.font = F(800, p); c.fillText(a, x + 512, y + 104);
    c.fillStyle = "#4D6A90"; const q = fit(c, b, 900, 38, 700); c.font = F(700, q); c.fillText(b, x + 512, y + 182);
  });
});

// ── geometry helpers ─────────────────────────────────────────────────────────────────────────────────────────────────────
const GC = {};
const merge = (geos) => {
  const Pp = [], N = [], U = [], I = []; let base = 0;
  for (const g0 of geos) { const g = g0.index ? g0 : g0; const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv; for (let i = 0; i < p.count; i++) { Pp.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); U.push(u.getX(i), u.getY(i)); } if (g.index) for (let i = 0; i < g.index.count; i++) I.push(base + g.index.getX(i)); else for (let i = 0; i < p.count; i++) I.push(base + i); base += p.count; }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(Pp, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); return g;
};
/**
 * a hanging garment, unit space: width x ∈ [−0.5, 0.5], length y ∈ [−1, 0] (the hanger's shoulder line at 0), thickness z ∈ [−0.5, 0.5]
 * (scale by [w, len, thick]). kind: "top" (shirt/sweater/jacket, long sleeves), "dress", "pants" (folded over the bar, half length)
 */
export const garGeo = (kind = "top", seed = 0) => GC[`g${kind}${seed}`] ??= (() => {
  const body = new THREE.BoxGeometry(1, 1, 1, 10, 14, 1); body.translate(0, -0.5, 0);
  const p = body.attributes.position, ph = seed * 1.7;
  const L = kind === "pants" ? 0.56 : 1;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i) * L, z = p.getZ(i);
    const t = -y / L;                                                   // 0 at the shoulders, 1 at the hem
    const flare = kind === "dress" ? 1 + 0.35 * t * t : kind === "pants" ? 1 : 1 + 0.05 * t;
    x *= flare;
    if (kind !== "pants") y -= 0.085 * Math.pow(Math.abs(x) * 2, 1.6) * (1 - t);              // the sloped shoulders
    if (kind !== "pants" && t < 0.04 && Math.abs(x) < 0.12) y -= 0.03;                       // the collar dip
    const chest = 0.45 + 0.55 * Math.cos(Math.min(1, Math.abs(x) * 2) * Math.PI / 2);         // thick at the middle, thin at the side seams
    const folds = (0.35 * Math.sin(x * 21 + ph) + 0.2 * Math.sin(x * 47 + ph * 2)) * (0.25 + 0.75 * t);   // drape folds, deeper toward the hem
    z = z * chest * (kind === "pants" ? 0.8 : 1) + folds;
    if (t > 0.96) y += 0.012 * Math.sin(x * 19 + ph);                                        // the hem's soft wave
    p.setXYZ(i, x, y, z);
  }
  body.computeVertexNormals();
  const parts = [body];
  if (kind === "top") for (const s of [-1, 1]) {   // the sleeves: tapered tubes hanging at the sides from the shoulder seam
    const sl = new THREE.CylinderGeometry(0.075, 0.11, 0.66, 8, 4); const q = sl.attributes.position;
    for (let i = 0; i < q.count; i++) { const yy = q.getY(i); q.setXYZ(i, q.getX(i) * 1.0, yy, q.getZ(i) * 3.2 + 0.25 * Math.sin(yy * 9 + seed)); }
    sl.translate(s * 0.47, -0.43, 0.05); sl.rotateZ(s * 0.06); sl.computeVertexNormals();
    // the cuff
    const cf = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 8); cf.scale(1, 1, 3.2); cf.translate(s * 0.49, -0.78, 0.05); cf.computeVertexNormals();
    parts.push(sl, cf);
  }
  if (kind === "pants") {   // the fold over the bar: the cuffs hang down the far side a little, a crease down the front
    const back = new THREE.BoxGeometry(0.98, 0.42, 0.4, 6, 4, 1); back.translate(0, -0.22, -0.45); parts.push(back);
  }
  return merge(parts);
})();
/** a hanger (unit: shoulder width 1): the hook over the bar, its neck, the two shoulder arms following the garment's slope */
export const hangerGeo = () => GC.hanger ??= (() => {
  const hook = new THREE.TorusGeometry(0.06, 0.012, 4, 10, Math.PI * 1.25); hook.rotateZ(-0.15); hook.translate(0, 0.1, 0);
  const neck = new THREE.CylinderGeometry(0.012, 0.012, 0.07, 5); neck.translate(0, 0.045, 0);
  const arms = [-1, 1].map((s) => { const a = new THREE.BoxGeometry(0.47, 0.022, 0.03); a.translate(s * 0.235, 0, 0); a.rotateZ(s * -0.17); return a; });
  return merge([hook, neck, ...arms]);
})();
/**
 * hang one garment on a rail point p (station or rack-local), its plane facing along ry; w the shoulder width, len its length.
 * Adds the hanger and, on some, a price tag; mat "fab" (the garment atlas), cell from the garment atlas, tagged by seed.
 */
export const hang = (m, p, ry, w, len, col, rect, seed, kind = "top", thick = 0.05) => {
  const L = Lm([p[0], p[1] - 0.035, p[2]], [w, len, thick], [0, ry, 0]);
  m.add("fab", garGeo(kind, seed % 3), L, col, { rect });
  m.add("dark", hangerGeo(), Lm([p[0], p[1] - 0.03, p[2]], [w * 0.92, w * 0.92, w * 0.92], [0, ry, 0]), seed % 4 === 0 ? "#C9D1DA" : "#16191F");
  if (seed % 3 === 0) {   // a price tag on a loop of thread at the side seam / sleeve
    const c = Math.cos(ry), s = Math.sin(ry), ox = 0.5 * w * (kind === "top" ? 1.02 : 0.9), oy = -len * (kind === "top" ? 0.75 : 0.25);
    m.box("tag", [p[0] + ox * c, p[1] + oy, p[2] - ox * s], [0.004, 0.06, 0.03], "#FFFFFF", { ry, rect: tagCell(seed % 8) });
  }
};
/** a size divider disc clipped on a rail at p (rail running along local x of ry) */
export const divider = (m, p, ry, i) => {
  m.add("tag", GC.disc ??= (() => { const g = new THREE.CylinderGeometry(1, 1, 1, 18); g.rotateX(Math.PI / 2); return g; })(), Lm([p[0], p[1] - 0.06, p[2]], [0.07, 0.07, 0.004], [0, ry + Math.PI / 2, 0]), "#FFFFFF", { rect: sizeCell(i % 8) });
};
/**
 * a folded piece on a table/shelf: the flat stack layer and the rolled fold along its front edge (and a softer one at the back);
 * pos = its centre, size [w, h, d]; rectFn maps the top/side cells of the fold atlas
 */
export const foldPiece = (m, mat, pos, size, col, rectFn, ry = 0, sideRect = null) => {
  const [w, h, d] = size;
  m.push(pos, ry);
  m.box(mat, [0, 0, 0], [w, h * 0.96, d - h * 0.7], col, { rectFn });
  m.cyl(mat, [0, 0, (d - h * 0.7) / 2], h * 0.48, w, col, { r: [0, 0, Math.PI / 2], seg: 7, rect: sideRect ?? rectFn(0) });
  m.cyl(mat, [0, 0, -(d - h * 0.7) / 2], h * 0.42, w * 0.98, col, { r: [0, 0, Math.PI / 2], seg: 5, rect: sideRect ?? rectFn(0) });
  m.pop();
};
