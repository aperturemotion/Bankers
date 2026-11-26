// @ts-nocheck
// ★ V38 rev 2 (builder C) — REAL MONEY for the whole film (Timur, 2026-11-26: "use that actual realistic dollar bills of actual real
//   $1. So do that for all of the money in this video"). The face is public/bill1.jpg: a real public-domain scan of the US $1 note
//   (series 2009, 1216 × 519 — 2.34 : 1, the note's real 156 × 66.3 mm). Everything that draws a bill or a strapped bundle of bills
//   takes its textures and materials from here:
//   · billTex()          the scan as a texture (preloaded at module load through delayRender/continueRender, via aud() so the Studio
//                        bundle can embed it — scratchpad/studio38.sh must list "bill1.jpg")
//   · billFaceMat(o)     the face: the scan + a slight paper sheen (the scan's own luminance as roughness: the intaglio ink
//                        catches the light a little more than the cotton paper; an optional bump is off by default — its cost on
//                        SwiftShader at full-frame close-ups)
//   · billEdgeTex()      a bundle's cut sides: 100 sheets of note paper, fine lines, the rounded fall-off at top and bottom
//   · strapTex()         the ABA standard strap for 100 × $1: BLUE, printed "$100" (and ONE HUNDRED DOLLARS in small print)
//   · bundleMats(o)      { box: 6 materials for a BoxGeometry bundle (sides, face top and bottom), strap: 6 for the strap, all }
//   · BillBundle         one strapped bundle as two meshes (the stack and its strap), for small counts; big counts use Cash (instanced)
//   · SEAL               where the green Treasury seal sits on the face (fractions of the face, measured on the scan) and sealLocal()
import React from "react";
import * as THREE from "three";
import { delayRender, continueRender } from "remotion";
import { aud } from "../bnx/aud";
import { canvasTex, rnd } from "./kit";
import { BODY, FIGURE } from "./fonts3d";

export const BILL_SRC = "bill1.jpg";
export const BILL = { w: 1.56, d: 0.66 };           // the note, in units of 10 cm (156 × 66 mm)
// the green Treasury seal on the scan: centre (896, 295) px of 1216 × 519, outer sawtooth radius 62 px (green-ink centroid / 99.5th pct)
export const SEAL = { u: 896 / 1216, v: 295 / 519, r: 62 / 1216 };
/** the seal's centre on a face of width w (along local x) and depth d (along local z; the image's top edge at −z), and its radius */
export const sealLocal = (w = BILL.w, d = BILL.d) => ({ x: (SEAL.u - 0.5) * w, z: (SEAL.v - 0.5) * d, r: SEAL.r * w });

// ── the scan, preloaded once (a texture whose image is still loading draws black on a fresh tab's first frame) ──────────────────
const cache = { img: null, tex: null };
const preload = () => {
  if (typeof document === "undefined" || cache.img) return;
  const img = new Image();
  const h = delayRender("img " + BILL_SRC);
  img.onload = () => continueRender(h); img.onerror = () => continueRender(h);
  img.src = aud(BILL_SRC);
  cache.img = img;
};
preload();
export const billTex = () => {
  preload();
  if (!cache.tex) {
    const t = new THREE.Texture(cache.img);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
    t.needsUpdate = true; cache.tex = t;
  }
  return cache.tex;
};
// the same image read as data (roughness, bump): no colour space conversion
let dataTex = null;
const billData = () => {
  preload();
  if (!dataTex) { dataTex = new THREE.Texture(cache.img); dataTex.colorSpace = THREE.NoColorSpace; dataTex.anisotropy = 1; dataTex.needsUpdate = true; }
  return dataTex;
};
/** the face material. o: { color, emissive (THREE.Color|string|null), sheen (0–1, default 1), bump (default false: SwiftShader cost) } */
export const billFaceMat = (o = {}) => {
  const map = billTex(), data = billData();
  const m = new THREE.MeshStandardMaterial({
    map, color: o.color ?? "#F4F6EF", roughness: 0.74 + 0.16 * (1 - (o.sheen ?? 1)), metalness: 0, envMapIntensity: 0.55,
    roughnessMap: data, ...(o.bump ? { bumpMap: data, bumpScale: -0.35 } : {})
  });
  if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveMap = map; m.emissiveIntensity = 0; }
  return m;
};
// ── a bundle's cut sides: 100 sheets (rows along the canvas height = along the bundle's thickness) ──────────────────────────────
export const billEdgeTex = () => canvasTex("money_edge", 512, 200, (c, w, h) => {
  c.fillStyle = "#DCE2D3"; c.fillRect(0, 0, w, h);
  const n = 100, rh = h / n;
  for (let i = 0; i < n; i++) {
    const y = i * rh;
    // each sheet: a pale paper core with its own slight tint (the print shows through at the cut), and a darker hairline gap
    const k = rnd(i * 7.3 + 3);
    c.fillStyle = k < 0.15 ? "rgba(120,140,110,0.20)" : k < 0.3 ? "rgba(255,255,245,0.30)" : "rgba(190,200,180,0.10)";
    c.fillRect(0, y, w, rh);
    c.fillStyle = `rgba(60,78,66,${0.18 + rnd(i * 3.1) * 0.22})`; c.fillRect(0, y + rh * 0.72, w, Math.max(0.6, rh * 0.28));
    // a few sheets sit a hair proud or short (the stack is squared by hand, not machined)
    if (rnd(i + 91) < 0.18) { const x0 = rnd(i + 5) * w, len = 30 + rnd(i + 8) * 140; c.fillStyle = "rgba(30,44,36,0.22)"; c.fillRect(x0, y, len, rh); }
  }
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(10,20,15,0.22)"); g.addColorStop(0.06, "rgba(0,0,0,0)"); g.addColorStop(0.94, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(10,20,15,0.28)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
// ── the strap: ABA standard for $1 notes — blue paper band, "$100" (one bundle = 100 × $1) ─────────────────────────────────────
// canvas: x across the strap's width (0.34 of the bundle), y along its wrap (around the bundle); the top face shows the middle third
export const strapTex = () => canvasTex("money_strap_aba1", 512, 1024, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "#2A5EAC"); g.addColorStop(0.5, "#3570C2"); g.addColorStop(1, "#2A5EAC");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  // paper fibre
  for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(255,255,255,${rnd(i) * 0.06})`; c.fillRect(rnd(i + 3) * w, rnd(i + 9) * h, 1, 2 + rnd(i + 4) * 5); }
  // printed white edge rules
  c.fillStyle = "rgba(255,255,255,0.85)"; c.fillRect(22, 0, 6, h); c.fillRect(w - 28, 0, 6, h);
  c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#FFFFFF";
  c.save(); c.translate(w / 2, h / 2);
  c.font = `400 210px ${FIGURE}`; c.fillText("$100", 0, -18);
  c.font = `700 36px ${BODY}`; c.fillText("ONE HUNDRED DOLLARS", 0, 118);
  c.restore();
  // repeat the small print on the wrapped parts (sides and underneath)
  c.font = `700 34px ${BODY}`; c.fillStyle = "rgba(255,255,255,0.9)";
  [h * 0.12, h * 0.88].forEach((y) => c.fillText("$100", w / 2, y));
  // the glued overlap seam near one end
  c.fillStyle = "rgba(0,20,60,0.25)"; c.fillRect(0, h * 0.97, w, 4);
});
// ── the bundle's materials (one set can be shared by many bundles; clone per bundle only for per-bundle fades/glows) ───────────
/** o: { emissive: colour for a glow (intensity starts 0), faceColor, edgeColor, transparent } */
export const bundleMats = (o = {}) => {
  const em = o.emissive ? { emissive: new THREE.Color(o.emissive), emissiveIntensity: 0 } : {};
  const edgeT = billEdgeTex(), strapT = strapTex();
  const edge = new THREE.MeshStandardMaterial({ map: edgeT, color: o.edgeColor ?? "#E8EEE4", roughness: 0.86, envMapIntensity: 0.4, ...em });
  if (o.emissive) edge.emissiveMap = edgeT;
  const face = billFaceMat({ color: o.faceColor, emissive: o.emissive });
  const strapFace = new THREE.MeshStandardMaterial({ map: strapT, color: "#FFFFFF", roughness: 0.62, envMapIntensity: 0.45, ...em });
  if (o.emissive) strapFace.emissiveMap = strapT;
  const strapSide = new THREE.MeshStandardMaterial({ color: "#2C62B2", roughness: 0.62, envMapIntensity: 0.45, ...em });
  const all = [edge, face, strapFace, strapSide];
  if (o.transparent) for (const m of all) m.transparent = true;
  return { box: [edge, edge, face, face, edge, edge], strap: [strapSide, strapSide, strapFace, strapFace, strapSide, strapSide], edge, face, strapFace, strapSide, all };
};
// shared geometries (unit bundle of the given height; the strap 0.34 wide, a hair proud of the stack)
const geoCache = new Map();
export const bundleGeo = (h, w = BILL.w, d = BILL.d) => {
  const k = `${h}|${w}|${d}`;
  if (!geoCache.has(k)) geoCache.set(k, { box: new THREE.BoxGeometry(w, h, d), strap: new THREE.BoxGeometry(0.34 * (w / BILL.w), h + 0.008, d + 0.008) });
  return geoCache.get(k);
};
/** one strapped bundle of 100 × $1: <BillBundle h position rotation-y mats castShadow /> */
export const BillBundle = ({ h = 0.11, mats, position, ry = 0, castShadow = true, receiveShadow = true }) => {
  const g = bundleGeo(h);
  return (
    <group position={position} rotation-y={ry}>
      <mesh geometry={g.box} material={mats.box} castShadow={castShadow} receiveShadow={receiveShadow} />
      <mesh geometry={g.strap} material={mats.strap} castShadow={false} receiveShadow={receiveShadow} />
    </group>
  );
};
