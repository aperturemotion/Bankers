// @ts-nocheck
// ★ V38 builder D — shared CASH pieces for the state / total stations: a strapped bundle of $1 bills (100 notes, the face printed
//   from public/bill1.jpg via money.tsx, the cut paper edges as fine sheet lines, a paper strap) drawn as ONE instanced mesh per group, so a
//   column of hundreds of bundles costs two draw calls. Positions/rotations are set every frame from plain item lists.
import React, { useMemo } from "react";
import * as THREE from "three";
import { billFaceMat, billEdgeTex, strapTex } from "./money";

export const BUNDLE = [1.56, 0.13, 0.66];      // a real bundle's proportions (156 × 66 mm, ~13 mm thick), in units of 1 = 100 mm
// ★ rev 2 (builder C): the face is the REAL $1 note (public/bill1.jpg, shared from money.tsx with the paper sheen), the strap the ABA
//   blue "$100" one (100 × $1), the sides the cut sheets of note paper — Timur: "use … actual real $1 … for all of the money".
const geoB = new THREE.BoxGeometry(BUNDLE[0], BUNDLE[1], BUNDLE[2]);
const geoS = new THREE.BoxGeometry(0.34, BUNDLE[1] + 0.012, BUNDLE[2] + 0.012);   // the ABA strap (~34 mm), as money.tsx's
const makeMats = (glow, white = false) => {
  const edge = billEdgeTex(), strap = strapTex();
  const em = glow ? { emissive: new THREE.Color(white ? "#FFFFFF" : "#4D8ED9"), emissiveIntensity: 0 } : {};
  const side = new THREE.MeshStandardMaterial({ map: edge, color: "#E8EEE6", roughness: 0.84, envMapIntensity: 0.4, ...em });
  const top = billFaceMat({ color: "#E9EEE6", emissive: glow ? (white ? "#FFFFFF" : "#4D8ED9") : null });
  if (glow) side.emissiveMap = edge;
  const s = new THREE.MeshStandardMaterial({ map: strap, color: "#FFFFFF", roughness: 0.62, ...em });
  if (glow) s.emissiveMap = strap;
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
  else if (glow >= 0) for (const m of mats.all) { m.emissiveIntensity = glow; m.color.set(m === mats.strap ? "#FFFFFF" : "#E9EEE6").lerp(TINT, Math.min(1, glow)); }
  return (<><primitive object={mb} /><primitive object={ms} /></>);
};
