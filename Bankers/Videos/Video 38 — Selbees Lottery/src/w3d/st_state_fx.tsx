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
const TREE_FOOT = [{ p: [0, 0.006, 0], s: [4.4, 4.4], r: [-Math.PI / 2, 0, 0], o: 0.42 }, { p: [0, 0.008, 0], s: [1.1, 1.1], r: [-Math.PI / 2, 0, 0], o: 0.45 }];   // rev 6: the canopy's soft shade + the trunk's contact
export const Tree = ({ x, z, s = 1, i = 0, y = 0 }) => {
  const g = buildTree(i % 4);
  return (
    <group position={[x, y, z]} scale={s} rotation-y={tr(i + 3) * 6.28}>
      <Shade items={TREE_FOOT} kind="blob" />
      <mesh geometry={g.wood} material={woodMat} castShadow receiveShadow />
      <mesh geometry={g.leaf} material={leafMat} castShadow receiveShadow />
    </group>
  );
};

// ★ rev 6 (Timur, 2026-11-27: "if you're not going to add shadows to things like the food shelves … at least add those fake shadows
//   … a dark subtle shape under it, but the correct one … You can see the corners better that way. We don't really want unlit
//   objects"): SHADE DECALS — soft dark quads laid on a surface where real light would be blocked: under a shelf board, in a corner,
//   at the foot of a wall, a step, a post, a product row. Two shapes: a BAND (dark at one edge, an eased fall-off to nothing) and a
//   BLOB (a soft ellipse). Every quad of one shape is merged into ONE mesh (alpha in the vertex colour), so a whole store of shade costs
//   one draw call. They never cast or receive, never write depth, sit 2–5 mm off their surface (polygon offset) and fade with the fog.
const shadeTex = (kind) => canvasTex("rev6_shade_" + kind, 128, 128, (c, w, h) => {
  const img = c.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const u = (x + 0.5) / w, v = (y + 0.5) / h;
    let a;
    if (kind === "blob") { const r = Math.hypot(u - 0.5, v - 0.5) * 2; a = Math.exp(-3.2 * r * r) * (1 - Math.min(1, Math.max(0, (r - 0.82) / 0.18))); }
    else { const t = v; const ends = Math.min(1, Math.min(u, 1 - u) / 0.06); a = Math.pow(1 - t, 2.2) * (ends * ends * (3 - 2 * ends)); }   // v = 0 is the dark edge (canvas top)
    const i = (y * w + x) * 4; img.data[i] = 255; img.data[i + 1] = 255; img.data[i + 2] = 255; img.data[i + 3] = Math.round(255 * a);
  }
  c.putImageData(img, 0, 0);
});
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
const buildShade = (items) => {
  const n = items.length, pos = new Float32Array(n * 12), uv = new Float32Array(n * 8), col = new Float32Array(n * 16), idx = [];
  const corners = [[-0.5, 0.5, 0, 1], [0.5, 0.5, 1, 1], [-0.5, -0.5, 0, 0], [0.5, -0.5, 1, 0]];   // the +y edge maps to uv v = 1 (the texture's dark top)
  items.forEach((it, i) => {
    _e.set(it.r?.[0] ?? 0, it.r?.[1] ?? 0, it.r?.[2] ?? 0); _q.setFromEuler(_e); _m.compose(_v.set(...it.p), _q, _s.set(it.s[0], it.s[1], 1));
    corners.forEach(([x, y, a, b], k) => {
      const p = new THREE.Vector3(x, y, 0).applyMatrix4(_m);
      pos.set([p.x, p.y, p.z], (i * 4 + k) * 3); uv.set([a, b], (i * 4 + k) * 2); col.set([1, 1, 1, it.o ?? 0.4], (i * 4 + k) * 4);
    });
    const o = i * 4; idx.push(o, o + 2, o + 1, o + 2, o + 3, o + 1);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setAttribute("color", new THREE.BufferAttribute(col, 4)); g.setIndex(idx);
  return g;
};
/** <Shade items kind> — items: [{ p, s:[w,h], r:[euler], o }] (a quad in its local XY, facing +z; for a band the local +y edge is the dark one) */
export const Shade = ({ items, kind = "band", color = "#00060F", k = 1 }) => {
  const geo = useMemo(() => buildShade(items), [items]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: canvasTexFlip(shadeTex(kind)), color, vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }), [kind, color]);
  mat.opacity = k;
  return <mesh geometry={geo} material={mat} renderOrder={1} userData={{ noShadow: true }} frustumCulled={false} />;
};
const canvasTexFlip = (t) => { t.flipY = true; return t; };
// ── helpers that place shade where the light really is blocked ────────────────────────────────────────────────────────────
const H = Math.PI / 2;
/** a band on a vertical wall that faces `face` ("+z" | "-z" | "+x" | "-x"); dark edge at `edge` ("top" | "bottom" | "left" | "right" as
 *  seen looking at the wall), the band's dark edge line through (x, y, z) ... w along the edge, h the fall-off depth */
export const wallBand = (x, y, z, w, h, o, face = "+z", edge = "top") => {
  const ry = { "+z": 0, "-z": Math.PI, "+x": H, "-x": -H }[face];
  const rz = { top: 0, bottom: Math.PI, left: H, right: -H }[edge];
  const vert = edge === "top" || edge === "bottom";
  const dir = { top: [0, -1], bottom: [0, 1], left: [1, 0], right: [-1, 0] }[edge];   // from the dark edge into the band, in wall (u, y)
  const off = 0.004, ux = Math.cos(ry), uz = -Math.sin(ry), nx = Math.sin(ry), nz = Math.cos(ry);
  const cu = dir[0] * h / 2, cy = dir[1] * h / 2;
  return { p: [x + ux * cu + nx * off, y + cy, z + uz * cu + nz * off], s: vert ? [w, h] : [h, w].reverse(), r: [0, ry, rz], o, _vert: vert };
};
/** a band on the floor (y), dark edge along a line through (x, z) on the side `edge` ("-z" = dark edge is the band's −z side …) */
export const floorBand = (x, y, z, w, d, o, edge = "-z") => {
  const rz = { "-z": 0, "+z": Math.PI, "+x": -H, "-x": H }[edge];
  const dir = { "-z": [0, 1], "+z": [0, -1], "+x": [-1, 0], "-x": [1, 0] }[edge];   // into the band (x, z)
  return { p: [x + dir[0] * d / 2, y + 0.004, z + dir[1] * d / 2], s: [w, d], r: [-H, 0, rz], o };
};
/** a soft ellipse on the floor */
export const floorBlob = (x, y, z, rx, rz, o, rot = 0) => ({ p: [x, y + 0.004, z], s: [rx * 2, rz * 2], r: [-H, 0, rot], o });
/** a floor band whose dark edge runs through (x, z), the band extending in direction (dx, dz) (any angle) */
export const floorBandDir = (x, y, z, w, d, o, dx, dz) => { const n = Math.hypot(dx, dz) || 1; const ux = dx / n, uz = dz / n; return { p: [x + ux * d / 2, y + 0.004, z + uz * d / 2], s: [w, d], r: [-H, 0, Math.atan2(ux, uz)], o }; };
/** a ring of floor bands round a circular foot of radius R (a plinth, a post, a drum) */
export const footRing = (x, y, z, R, d, o, n = 16) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, dx = Math.sin(a), dz = Math.cos(a); return floorBandDir(x + dx * R, y, z + dz * R, (2 * Math.PI * R) / n * 1.12, d, o, dx, dz); });
/** four floor bands round a rectangular foot (cx, cz, half sizes hx, hz) */
export const footRect = (x, y, z, hx, hz, d, o) => [floorBand(x, y, z + hz, hx * 2 + d * 0.6, d, o, "-z"), floorBand(x, y, z - hz, hx * 2 + d * 0.6, d, o, "+z"), floorBand(x + hx, y, z, hz * 2, d, o, "-x"), floorBand(x - hx, y, z, hz * 2, d, o, "+x")];
