// @ts-nocheck
// ★ V39 builder D (copied from V38 st_state_fx) — light effects for the lehman / will / pavilion stations. A LIGHT POOL is a soft radial decal laid on a
//   surface (additive, no depth write): the light a lamp throws on the ground, without the per-pixel cost of a point light
//   (six point lights cost ~3 s a frame in the software renderer; a decal costs nothing).
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex } from "./kit";

const poolTex = () => canvasTex("d_fx_pool", 256, 256, (c, w, h) => {
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
