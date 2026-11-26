// @ts-nocheck
// ★ V38 rev 2 ROAD — a real wheel (builder D): a 215/60 R16 tyre turned on a lathe (rounded shoulders, sidewall bulge, tread
//   grooves and moulded sidewall lettering), a ten-spoke (five twin-spoke) alloy with its rim lip, barrel, hub, centre cap and five
//   lug nuts, a vented brake disc and a caliper that does NOT turn. Built along +y (outboard) and stood on its side by the caller.
import React, { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { tyreTex, tyreBump } from "./road_cartex";

const V2 = (x, y) => new THREE.Vector2(x, y);
const ni = (g) => (g.index ? g.toNonIndexed() : g);
const strip = (g) => { const o = ni(g); for (const k of Object.keys(o.attributes)) if (!["position", "normal", "uv"].includes(k)) o.deleteAttribute(k); return o; };

let _geo = null;
export const wheelGeometry = () => {
  if (_geo) return _geo;
  // the tyre: inner bead → tread → outer bead (y = outboard)
  const prof = [[0.205, -0.098], [0.235, -0.104], [0.27, -0.108], [0.3, -0.106], [0.322, -0.098], [0.335, -0.085], [0.34, -0.06], [0.341, -0.02], [0.341, 0.02], [0.34, 0.06], [0.335, 0.085], [0.322, 0.098], [0.3, 0.106], [0.27, 0.108], [0.235, 0.104], [0.205, 0.098]];
  const tyre = new THREE.LatheGeometry(prof.map(([r, y]) => V2(r, y)), 72);
  // the rim: lip, barrel, and the dished face behind the spokes
  const lip = new THREE.LatheGeometry([[0.19, -0.085], [0.19, 0.07], [0.186, 0.078], [0.19, 0.088], [0.201, 0.095], [0.209, 0.093], [0.21, 0.084], [0.206, 0.08]].map(([r, y]) => V2(r, y)), 56);
  const parts = [lip];
  // five twin spokes (ten arms), tapered, bevelled, dished toward the hub
  const arm = new THREE.Shape();
  arm.moveTo(-0.011, 0.05); arm.lineTo(0.011, 0.05); arm.lineTo(0.017, 0.186); arm.lineTo(-0.013, 0.186); arm.closePath();
  const armG = new THREE.ExtrudeGeometry(arm, { depth: 0.018, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 4 });
  armG.rotateX(-Math.PI / 2);                 // the shape's plane → the wheel face (x–z), the extrusion → +y
  armG.translate(0, 0.064, 0);
  for (let k = 0; k < 5; k++) for (const s of [-1, 1]) {
    const g = armG.clone();
    // dish: the arm leans outboard at the hub
    g.applyMatrix4(new THREE.Matrix4().makeRotationX(0.07));
    g.applyMatrix4(new THREE.Matrix4().makeRotationY((k * 2 * Math.PI) / 5 + s * 0.14));
    parts.push(g);
  }
  const hub = new THREE.CylinderGeometry(0.07, 0.074, 0.028, 40); hub.translate(0, 0.084, 0); parts.push(hub);
  const cap = new THREE.CylinderGeometry(0.034, 0.036, 0.016, 32); cap.translate(0, 0.104, 0); parts.push(cap);
  for (let k = 0; k < 5; k++) { const n = new THREE.CylinderGeometry(0.0095, 0.0095, 0.02, 6); const a = (k * 2 * Math.PI) / 5 + Math.PI / 5; n.translate(Math.cos(a) * 0.051, 0.1, Math.sin(a) * 0.051); parts.push(n); }
  const rim = mergeGeometries(parts.map(strip));
  // the brake disc (with its hat) and the caliper
  const disc = mergeGeometries([new THREE.CylinderGeometry(0.152, 0.152, 0.024, 48), (() => { const h = new THREE.CylinderGeometry(0.075, 0.08, 0.05, 32); h.translate(0, 0.03, 0); return h; })()].map(strip));
  disc.translate(0, -0.02, 0);
  const cal = new THREE.Shape(); cal.absarc(0, 0, 0.165, 0.35, 1.25, false); cal.absarc(0, 0, 0.115, 1.25, 0.35, true);
  const caliper = new THREE.ExtrudeGeometry(cal, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2, curveSegments: 10 });
  caliper.rotateX(-Math.PI / 2); caliper.translate(0, -0.045, 0);
  _geo = { tyre, rim, disc, caliper };
  return _geo;
};

/** one wheel, standing; side = +1 outboard toward +z, −1 toward −z. spin: radians about the axle. mats: shared materials */
export const Wheel = ({ x, z, side, spin, mats }) => {
  const g = wheelGeometry();
  return (
    <group position={[x, 0.34, z]} rotation-y={side > 0 ? 0 : Math.PI}>
      <group rotation-x={Math.PI / 2}>
        {/* the caliper stays put (top-rear of the disc) */}
        <mesh geometry={g.caliper} material={mats.caliper} rotation-y={Math.PI * 0.5 * side} />
        <group rotation-y={spin}>
          <mesh geometry={g.tyre} material={mats.tyre} castShadow />
          <mesh geometry={g.rim} material={mats.rim} castShadow />
          <mesh geometry={g.disc} material={mats.disc} />
        </group>
      </group>
    </group>
  );
};
export const useWheelMats = () => useMemo(() => {
  const tt = tyreTex(), tb = tyreBump();
  return {
    tyre: new THREE.MeshStandardMaterial({ color: "#FFFFFF", map: tt, bumpMap: tb, bumpScale: 1.5, roughness: 0.82, metalness: 0 }),
    rim: new THREE.MeshPhysicalMaterial({ color: "#C3CFDD", metalness: 0.9, roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.15 }),
    disc: new THREE.MeshStandardMaterial({ color: "#6E7886", metalness: 0.8, roughness: 0.45 }),
    caliper: new THREE.MeshStandardMaterial({ color: "#2B3340", metalness: 0.5, roughness: 0.5 })
  };
}, []);
