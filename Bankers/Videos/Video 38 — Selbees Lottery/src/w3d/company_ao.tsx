// @ts-nocheck
// ★ V38 rev 6 (builder R) — FAKE SHADOWS for the company and road stations. Timur, 2026-11-27: "if you're not going to add shadows to
//   things … at least add those fake shadows … a dark subtle shape under it, the correct one … you can see the corners better … we don't
//   want unlit objects." Cheap textured quads (one shared soft-rectangle alpha texture), physically placed:
//   · AO      a soft dark contact / occlusion gradient where a thing meets a surface (floor, counter, wall, road) or in a corner
//   · Cast    the soft shadow a thing throws AWAY from the scene's key, stretched by its height (h / tan(key elevation))
//   · AOInst  many AO quads in one instanced draw (posts, trunks, delineators)
//   All are MeshBasicMaterial, transparent, no depth write, polygon-offset onto their surface (kit.ShadowAll skips them).
import React, { useMemo, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { canvasTex } from "./kit";

// a rounded rectangle, solid in the middle, falling off softly to its edges (soft = the fall-off as a share of the half-size)
const softRect = (soft) => canvasTex(`r6_ao_${soft}`, 128, 128, (c, w, h) => {
  const img = c.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const u = Math.abs((x + 0.5) / w * 2 - 1), v = Math.abs((y + 0.5) / h * 2 - 1);
    const e = Math.max(0, Math.hypot(Math.max(0, u - (1 - soft)), Math.max(0, v - (1 - soft))) / soft);   // 0 inside, 1 at the edge
    const a = Math.max(0, 1 - e); const s = a * a * (3 - 2 * a);
    const i = (y * w + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.round(255 * s); img.data[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
});
const mats = new Map();
const aoMat = (soft, color = "#000611") => {
  const k = soft + color;
  if (!mats.has(k)) mats.set(k, new THREE.MeshBasicMaterial({ color, alphaMap: softRect(soft), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  return mats.get(k);
};
const ROT = { y: [-Math.PI / 2, 0, 0], z: [0, 0, 0], "-z": [0, Math.PI, 0], x: [0, Math.PI / 2, 0], "-x": [0, -Math.PI / 2, 0], "-y": [Math.PI / 2, 0, 0] };
/** one soft dark quad: on a horizontal surface (n "y", default) or a wall (n "z" faces +z, "x" faces +x …); spin about the normal */
export const AO = ({ p, w, d, o = 0.5, soft = 0.5, n = "y", spin = 0 }) => {
  const tex = useMemo(() => softRect(soft), [soft]);
  return (
    <group position={p} rotation={ROT[n]}>
      <mesh rotation-z={spin} renderOrder={1} userData={{ noShadow: true }}>
        <planeGeometry args={[w, d]} />
        <meshBasicMaterial color="#000611" alphaMap={tex} transparent opacity={o} depthWrite={false} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
      </mesh>
    </group>
  );
};
/** the shadow a thing of height h and footprint (w × d) throws on the horizontal surface it stands on, away from a key in direction
 *  `key` (toward the light, any length); its foot centre at p. Stretches h / tan(elevation) and fades toward its far end. */
export const Cast = ({ p, w, d, h, toward, o = 0.32, soft = 0.7 }) => {   // (`key` is reserved by React)
  const kx = toward[0], ky = toward[1], kz = toward[2], hz = Math.hypot(kx, kz) || 1;
  const L = (h * hz) / Math.max(0.2, ky);             // h / tan(elevation)
  const ax = -kx / hz, az = -kz / hz;                  // away from the key
  const len = Math.max(w, d) * 0.9 + L, wid = Math.min(w, d) * 1.05;
  const yaw = Math.atan2(az, ax);
  return <AO p={[p[0] + ax * L * 0.45, p[1], p[2] + az * L * 0.45]} w={len} d={wid} o={o} soft={soft} spin={-yaw} />;
};
/** many horizontal AO quads in one draw: items [{ p: [x, y, z], s: [w, d], r?: yaw }]; opacity is shared */
export const AOInst = ({ items, o = 0.5, soft = 0.55 }) => {
  const ref = useRef();
  const geo = useMemo(() => { const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2); return g; }, []);
  const mat = useMemo(() => { const m = aoMat(soft).clone(); m.opacity = o; return m; }, [soft, o]);
  useLayoutEffect(() => {
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    items.forEach((it, i) => { e.set(0, it.r ?? 0, 0); q.setFromEuler(e); M.compose(new THREE.Vector3(...it.p), q, new THREE.Vector3(it.s[0], 1, it.s[1])); ref.current.setMatrixAt(i, M); });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [items]);
  return <instancedMesh ref={ref} args={[geo, mat, items.length]} frustumCulled={false} renderOrder={1} userData={{ noShadow: true }} />;
};
// the keys the fake shadows follow (direction TOWARD the light, in each place's own coordinates)
export const KEY_OFFICE = [-9, 14, 8];          // kit.HouseLights' default key (company's light has no override)
export const KEY_ROAD = [-2.5, 13, -10];        // st_road light.key [-10, 13, 2.5] (world) in the road's design frame
