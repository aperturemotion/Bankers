// @ts-nocheck
// ★ V38 builder D — light effects shared by the state / total / rules stations. A LIGHT POOL is a soft radial decal laid on a
//   surface (additive, no depth write): the light a lamp throws on the ground, without the per-pixel cost of a point light
//   (six point lights cost ~3 s a frame in the software renderer; a decal costs nothing).
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex } from "./kit";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const poolTex = () => canvasTex("fx_pool", 256, 256, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(255,255,255,0.55)"); g.addColorStop(0.6, "rgba(255,255,255,0.14)"); g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
/** a pool of light on a horizontal surface at `position` (its y is the surface + a hair), radius r, stretched by sx/sz */
export const LightPool = ({ position, r = 3, sx = 1, sz = 1, color = "#FFC27A", opacity = 0.35, rot = 0 }) => {
  const tex = useMemo(poolTex, []);
  if (opacity <= 0.002) return null;
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, rot]} scale={[r * 2 * sx, r * 2 * sz, 1]} renderOrder={2}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
};
/** the same decal standing upright (a wash of light on a wall), facing +z unless rotated */
export const LightWash = ({ position, w = 4, h = 4, color = "#BFD6FF", opacity = 0.25, ry = 0 }) => {
  const tex = useMemo(poolTex, []);
  if (opacity <= 0.002) return null;
  return (
    <mesh position={position} rotation={[0, ry, 0]} scale={[w, h, 1]} renderOrder={2}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
    </mesh>
  );
};

// ★ rev 5 (Timur: "more high quality and cinematic"; the flat-shaded four-ball trees read as low-poly props when the camera trucks
//   past them): a DECIDUOUS TREE built like one — a tapered trunk with a root flare and five limbs, and a crown of ~16 foliage clumps
//   (jittered, smooth-shaded spheres, darker inside and paler on top, in the night's blue-green), merged into two meshes per variant
//   (four variants shared by every tree: two draw calls a tree). Both cast shadows.
const tr = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const treeGeo = new Map();
const buildTree = (v) => {
  if (treeGeo.has(v)) return treeGeo.get(v);
  const wood = [], leaf = [];
  const trunk = new THREE.CylinderGeometry(0.13, 0.24, 3.0, 10, 4); trunk.translate(0, 1.5, 0); wood.push(trunk);
  const flare = new THREE.CylinderGeometry(0.24, 0.4, 0.35, 10); flare.translate(0, 0.17, 0); wood.push(flare);
  const limbs = [];
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + tr(v * 9 + k) * 0.9, up = 0.55 + tr(v * 7 + k) * 0.35, L = 1.3 + tr(v * 5 + k) * 0.8, y0 = 2.3 + tr(v * 3 + k) * 0.7;
    const g = new THREE.CylinderGeometry(0.045, 0.1, L, 6); g.translate(0, L / 2, 0);
    const m = new THREE.Matrix4().makeRotationY(a).multiply(new THREE.Matrix4().makeRotationZ(-(Math.PI / 2 - up * Math.PI / 2)));
    g.applyMatrix4(m); g.translate(0, y0, 0); wood.push(g);
    const dir = new THREE.Vector3(0, L, 0).applyMatrix4(m); limbs.push([dir.x, y0 + dir.y, dir.z]);
  }
  const col = new THREE.Color(), dark = new THREE.Color("#132C40"), pale = new THREE.Color("#2E5674");
  const clump = (cx, cy, cz, r, seed) => {
    const g = new THREE.IcosahedronGeometry(r, 2); const p = g.attributes.position;
    const cols = new Float32Array(p.count * 3);
    for (let j = 0; j < p.count; j++) {
      const nx = p.getX(j), ny = p.getY(j), nz = p.getZ(j), hk = Math.round(nx * 977) * 7 + Math.round(ny * 977) * 131 + Math.round(nz * 977) * 1009;   // a hash of the POSITION (the solid is non-indexed: index-keyed jitter would crack it)
      const n = 1 + (tr(seed * 31 + hk) - 0.5) * 0.28;
      p.setXYZ(j, nx * n, ny * n * 0.86, nz * n);
      col.copy(dark).lerp(pale, Math.min(1, Math.max(0, 0.35 + 0.55 * (ny / r) + (tr(seed + hk) - 0.5) * 0.3)));
      cols[j * 3] = col.r; cols[j * 3 + 1] = col.g; cols[j * 3 + 2] = col.b;
    }
    // smooth sphere-like normals from the jittered positions (computeVertexNormals on this non-indexed solid would facet it)
    const nrm = g.attributes.normal, v3 = new THREE.Vector3();
    for (let j = 0; j < p.count; j++) { v3.set(p.getX(j), p.getY(j) / 0.86, p.getZ(j)).normalize(); nrm.setXYZ(j, v3.x, v3.y, v3.z); }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3)); g.translate(cx, cy, cz); leaf.push(g);
  };
  limbs.forEach(([x, y, z], k) => { clump(x, y, z, 0.95 + tr(v * 11 + k) * 0.35, v * 100 + k); clump(x * 0.55, y + 0.55, z * 0.55, 0.85, v * 100 + k + 20); });
  for (let k = 0; k < 6; k++) { const a = tr(v * 13 + k) * 6.28, rr = 0.6 + tr(v * 17 + k) * 0.7; clump(Math.cos(a) * rr, 3.9 + tr(v * 19 + k) * 1.1, Math.sin(a) * rr, 0.9 + tr(v * 23 + k) * 0.4, v * 100 + k + 40); }
  const out = { wood: mergeGeometries(wood.map((g) => g.index ? g.toNonIndexed() : g)), leaf: mergeGeometries(leaf.map((g) => g.index ? g.toNonIndexed() : g)) };
  treeGeo.set(v, out); return out;
};
const woodMat = new THREE.MeshStandardMaterial({ color: "#1E2836", roughness: 0.92 });
const leafMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, envMapIntensity: 0.4 });
export const Tree = ({ x, z, s = 1, i = 0, y = 0 }) => {
  const g = buildTree(i % 4);
  return (
    <group position={[x, y, z]} scale={s} rotation-y={tr(i + 3) * 6.28}>
      <mesh geometry={g.wood} material={woodMat} castShadow receiveShadow />
      <mesh geometry={g.leaf} material={leafMat} castShadow receiveShadow />
    </group>
  );
};
