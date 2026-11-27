// @ts-nocheck
// ★ V39 builder C — shared helpers for the diner, shares and vault stations: the fonts used ON props (Caveat for a server's / a
//   reader's handwriting; Figtree for printed signage), a hook that holds the frame until they are loaded (so a canvas never caches a
//   fallback face), and the tiling material textures (wood grain, vinyl channels, brushed metal, stone, speckle).
import { useEffect, useState } from "react";
import * as THREE from "three";
import { delayRender, continueRender } from "remotion";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadFigtree } from "@remotion/google-fonts/Figtree";
import { rnd } from "./kit";
import { BODY } from "./fonts3d";

const cav = loadCaveat("normal", { weights: ["500", "700"], subsets: ["latin"] });
export const HAND = cav.fontFamily;
export const SANSF = BODY;
let ready = false;
const P = typeof document === "undefined" ? Promise.resolve() : Promise.all([cav.waitUntilDone(), loadFigtree().waitUntilDone(), document.fonts.ready]).then(() => { ready = true; }).catch(() => { ready = true; });
/** true once the prop fonts are in: components that draw text textures render only then (key their textures on it) */
export const usePropFonts = () => {
  const [ok, setOk] = useState(ready);
  useEffect(() => {
    if (ok) return;
    const h = delayRender("c prop fonts");
    P.then(() => { setOk(true); requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h))); });
  }, []);
  return ok;
};
// ── tiling textures (own cache: these are RepeatWrapping) ─────────────────────────────────────────────────────────────────
const cache = new Map();
export const tileTex = (key, w, h, draw, srgb = true, rep = [1, 1]) => {
  const k = key + "|" + rep.join(",");
  if (cache.has(k)) return cache.get(k);
  let base = cache.get(key + "|base");
  if (!base) {
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    base = c; cache.set(key + "|base", base);
  }
  const t = new THREE.CanvasTexture(base);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
  t.anisotropy = srgb ? 4 : 1; t.needsUpdate = true; cache.set(k, t);
  return t;
};
/** wood grain: long wavy grain lines, rays, a few knots; light = base colour */
export const woodDraw = (base, dark, seed = 1) => (c, w, h) => {
  c.fillStyle = base; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) {
    const y0 = rnd(i * 3 + seed) * h, a = 2 + rnd(i + seed) * 6, per = 180 + rnd(i * 7 + seed) * 400, ph = rnd(i * 11) * 6;
    c.strokeStyle = dark; c.globalAlpha = 0.05 + rnd(i * 5 + seed) * 0.16; c.lineWidth = 0.6 + rnd(i * 13) * 2.4;
    c.beginPath(); for (let x = 0; x <= w; x += 8) { const y = y0 + a * Math.sin(x / per * 6.283 + ph) + 3 * Math.sin(x / 37 + i); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  }
  c.globalAlpha = 1;
  for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "40,24,10" : "255,240,220"},${0.03 + rnd(i + 2) * 0.05})`; c.fillRect(rnd(i + 3) * w, rnd(i + 5) * h, 3 + rnd(i) * 10, 1); }
  for (let k = 0; k < 2; k++) { const x = rnd(k + seed * 5) * w, y = rnd(k * 3 + seed) * h; for (let r = 3; r < 26; r += 3) { c.strokeStyle = dark; c.globalAlpha = 0.18; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y, r * 2.4, r * 0.6, 0, 0, Math.PI * 2); c.stroke(); } }
  c.globalAlpha = 1;
};
export const woodTex = (key, base, dark, rep = [1, 1], seed = 1) => tileTex("wood_" + key, 1024, 256, woodDraw(base, dark, seed), true, rep);
/** brushed metal: fine horizontal streaks (colour map; pass a grey base) */
export const brushedTex = (key, base, rep = [1, 1], vertical = false) => tileTex("brushed_" + key, 512, 512, (c, w, h) => {
  c.fillStyle = base; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) { const v = rnd(i * 3 + key.length); c.fillStyle = v < 0.5 ? `rgba(255,255,255,${0.03 + v * 0.06})` : `rgba(0,0,0,${0.02 + (v - 0.5) * 0.08})`; const y = rnd(i + 7) * h, x = rnd(i * 5) * w, L = 30 + rnd(i + 1) * 260; vertical ? c.fillRect(y, x, 1, L) : c.fillRect(x, y, L, 1); }
}, true, rep);
/** a speckled surface (laminate, terrazzo): base + three fleck colours */
export const speckTex = (key, base, flecks, n = 9000, rep = [1, 1], size = 3) => tileTex("speck_" + key, 512, 512, (c, w, h) => {
  c.fillStyle = base; c.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { c.fillStyle = flecks[Math.floor(rnd(i + 11) * flecks.length)]; const s = 1 + rnd(i + 5) * size; c.fillRect(rnd(i * 3) * w, rnd(i * 5 + 1) * h, s, s * (0.6 + rnd(i) * 0.9)); }
}, true, rep);
/** a soft noise (paint, plaster) */
export const noiseTex = (key, base, amt = 14, rep = [1, 1]) => tileTex("noise_" + key, 256, 256, (c, w, h) => {
  c.fillStyle = base; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 7000; i++) { const v = (rnd(i + key.length * 31) - 0.5) * amt; c.fillStyle = v > 0 ? `rgba(255,255,255,${v / 100})` : `rgba(0,10,30,${-v / 100})`; c.fillRect(rnd(i * 3 + 1) * w, rnd(i * 7 + 2) * h, 2, 2); }
}, true, rep);
/** paper-stack edges: many sheets seen side-on (cream lines, slight colour variety); rows = sheets per texture height */
export const sheetEdgeTex = (key, rows = 256, rep = [1, 1]) => tileTex("sheets_" + key, 64, 1024, (c, w, h) => {
  const step = h / rows;
  for (let r = 0; r < rows; r++) {
    const v = rnd(r * 3 + 1), tone = 226 + Math.floor(v * 22);
    c.fillStyle = `rgb(${tone},${tone - 4 - Math.floor(rnd(r) * 8)},${tone - 16 - Math.floor(rnd(r + 5) * 14)})`;
    c.fillRect(0, r * step, w, step);
    c.fillStyle = `rgba(90,80,60,${0.25 + rnd(r + 9) * 0.35})`; c.fillRect(0, r * step + step - 0.8, w, 0.8);
    if (rnd(r + 13) < 0.06) { c.fillStyle = "rgba(60,50,30,0.35)"; c.fillRect(0, r * step, w, step * 0.5); }
  }
}, true, rep);
