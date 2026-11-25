// @ts-nocheck
// ★ V38 builder D — shared CASH pieces for the state / total stations: a strapped bundle of $100 bills (100 notes, the face printed
//   from public/bill100.png, the cut paper edges as fine sheet lines, a paper strap) drawn as ONE instanced mesh per group, so a
//   column of hundreds of bundles costs two draw calls. Positions/rotations are set every frame from plain item lists.
import React, { useMemo } from "react";
import * as THREE from "three";
import { delayRender, continueRender } from "remotion";
import { aud } from "../bnx/aud";
import { canvasTex, rnd } from "./kit";

export const BUNDLE = [1.56, 0.13, 0.66];      // a real bundle's proportions (156 × 66 mm, ~13 mm thick), in units of 1 = 100 mm
// the bill's face: the image is preloaded when this module loads (the render waits for it), so the very first frame a fresh tab
//   draws already has the print — a texture still loading when its first frame is drawn would show the faces black
const imgCache = new Map();
const preload = (url) => {
  if (typeof document === "undefined" || imgCache.has(url)) return;
  const img = new Image();
  const h = delayRender("img " + url);
  img.onload = () => continueRender(h); img.onerror = () => continueRender(h);
  img.src = url;
  imgCache.set(url, { img, tex: null });
};
preload(aud("bill100.png"));
export const imgTex = (url) => {
  preload(url);
  const e = imgCache.get(url);
  if (!e.tex) { e.tex = new THREE.Texture(e.img); e.tex.colorSpace = THREE.SRGBColorSpace; e.tex.anisotropy = 8; e.tex.needsUpdate = true; }
  return e.tex;
};
const edgeTex = () => canvasTex("cash_edge", 256, 64, (c, w, h) => {
  c.fillStyle = "#D5DCD2"; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 1.5) { c.fillStyle = `rgba(70,84,74,${0.10 + rnd(y * 3.1) * 0.22})`; c.fillRect(0, y, w, 0.8); }
  // a slight darkening toward the top and bottom (the stack's rounded edge)
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(0,0,0,0.18)"); g.addColorStop(0.15, "rgba(0,0,0,0)"); g.addColorStop(0.85, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.22)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
const strapTex = () => canvasTex("cash_strap", 128, 256, (c, w, h) => {
  c.fillStyle = "#E9E1C8"; c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(120,96,40,0.55)"; c.fillRect(0, h * 0.42, w, h * 0.16);       // the printed $10,000 band (illegible at this size)
  c.fillStyle = "rgba(0,0,0,0.12)"; c.fillRect(0, 0, w, 3); c.fillRect(0, h - 3, w, 3);
});
const geoB = new THREE.BoxGeometry(BUNDLE[0], BUNDLE[1], BUNDLE[2]);
const geoS = new THREE.BoxGeometry(0.2, BUNDLE[1] + 0.012, BUNDLE[2] + 0.012);
const makeMats = (glow, white = false) => {
  const bill = imgTex(aud("bill100.png"));
  const edge = edgeTex(), strap = strapTex();
  const em = glow ? { emissive: new THREE.Color(white ? "#FFFFFF" : "#4D8ED9"), emissiveIntensity: 0 } : {};
  const side = new THREE.MeshStandardMaterial({ map: edge, color: "#E8EEE6", roughness: 0.78, ...em });
  const top = new THREE.MeshStandardMaterial({ map: bill, color: "#E2EAE0", roughness: 0.62, ...em });
  if (glow) { top.emissiveMap = bill; side.emissiveMap = edge; }
  const s = new THREE.MeshStandardMaterial({ map: strap, color: "#FFFFFF", roughness: 0.6, ...em });
  return { bundle: [side, side, top, top, side, side], strap: s, all: [side, top, s] };
};
const TINT = new THREE.Color("#9CC3F2");
const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S = new THREE.Vector3();
/** <Cash items=[{p:[x,y,z], r:[rx,ry,rz], s}] scale glow> — one instanced group of bundles; s = 0 hides a bundle */
export const Cash = ({ items, scale = 1, glow = -1, shadows = true, self = 0 }) => {
  const n = items.length;
  const mats = useMemo(() => makeMats(glow >= 0 || self > 0, self > 0), [glow >= 0, self > 0]);
  const [mb, ms] = useMemo(() => {
    const a = new THREE.InstancedMesh(geoB, mats.bundle, n), b = new THREE.InstancedMesh(geoS, mats.strap, n);
    for (const m of [a, b]) { m.castShadow = shadows; m.receiveShadow = true; m.frustumCulled = false; }
    return [a, b];
  }, [mats, n]);
  for (let i = 0; i < n; i++) {
    const it = items[i];
    const s = (it.s ?? 1) * scale;
    E.set(it.r?.[0] ?? 0, it.r?.[1] ?? 0, it.r?.[2] ?? 0); Q.setFromEuler(E);
    V.set(it.p[0], it.p[1], it.p[2]); S.set(s < 1e-4 ? 1e-4 : s, s < 1e-4 ? 1e-4 : s, s < 1e-4 ? 1e-4 : s);
    M.compose(V, Q, S);
    mb.setMatrixAt(i, M); ms.setMatrixAt(i, M);
  }
  mb.instanceMatrix.needsUpdate = true; ms.instanceMatrix.needsUpdate = true;
  if (self > 0) for (const m of mats.all) m.emissiveIntensity = self;
  else if (glow >= 0) for (const m of mats.all) { m.emissiveIntensity = glow; m.color.set(m === mats.strap ? "#FFFFFF" : "#E2EAE0").lerp(TINT, Math.min(1, glow)); }
  return (<><primitive object={mb} /><primitive object={ms} /></>);
};
