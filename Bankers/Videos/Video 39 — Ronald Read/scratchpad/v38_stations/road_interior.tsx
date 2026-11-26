// @ts-nocheck
// ★ V38 rev 2 ROAD — the sedan's cabin (builder D), seen through the glass and in the x-ray: two front bucket seats (cushion,
//   backrest, side bolsters, headrests on their posts, cloth inserts with sewn channels and topstitching, plastic side shields and
//   rails), a rear bench with three headrests, the dashboard with its instrument binnacle (lit gauges), air vents and glovebox, the
//   centre stack (radio / CD and climate), the steering wheel on its column — on the LEFT, a US car — the centre console with the
//   gear selector and its gate, cupholders and armrest, door cards with armrests, a carpeted floor and the parcel shelf.
//   Repeated parts are MERGED per material (few draw calls). Car coords: front +x, right +z, ground y 0.
import React, { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { seatTex, gaugeTex, radioTex, doorTex, gateTex, ventTex } from "./road_cartex";

const ni = (g) => { const o = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(o.attributes)) if (!["position", "normal", "uv"].includes(k)) o.deleteAttribute(k); return o; };
/** a placed piece: geometry g moved to p, turned by r (Euler xyz) */
const put = (g, p, r = [0, 0, 0]) => { g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(1, 1, 1))); return g; };
const RB = (sx, sy, sz, rad = 0.03, seg = 3) => new RoundedBoxGeometry(sx, sy, sz, seg, Math.min(rad, sx / 2.05, sy / 2.05, sz / 2.05));
const merge = (list) => mergeGeometries(list.map(ni));

export const DRIVER_Z = -0.37;

const buildCabin = () => {
  const cloth = [], vinyl = [], dash = [], dark = [], chrome = [], carpet = [], leather = [];
  // ── front buckets (x ≈ 0.2), driver left (z −0.37), passenger right ──────────────────────────────────────────────────
  [DRIVER_Z, -DRIVER_Z].forEach((z) => {
    const lean = 0.24;                                  // backrest raked back
    // cushion insert and its two side bolsters (a touch higher)
    cloth.push(put(RB(0.46, 0.1, 0.36, 0.035), [0.24, 0.56, z], [0, 0, 0.07]));
    [-1, 1].forEach((s) => vinyl.push(put(RB(0.48, 0.13, 0.08, 0.035), [0.24, 0.575, z + s * 0.21], [0, 0, 0.07])));
    vinyl.push(put(RB(0.12, 0.09, 0.5, 0.03), [0.47, 0.545, z], [0, 0, 0.3]));            // front roll of the cushion
    // backrest: the cloth insert between two bolsters, the shell behind
    cloth.push(put(RB(0.1, 0.56, 0.34, 0.035), [-0.04, 0.9, z], [0, 0, lean]));
    [-1, 1].forEach((s) => vinyl.push(put(RB(0.15, 0.58, 0.09, 0.04), [-0.035, 0.9, z + s * 0.205], [0, s * 0.18, lean])));
    vinyl.push(put(RB(0.07, 0.6, 0.5, 0.03), [-0.1, 0.9, z], [0, 0, lean]));               // the back shell
    // headrest on two chrome posts
    leather.push(put(RB(0.1, 0.17, 0.27, 0.045), [-0.155, 1.3, z], [0, 0, 0.12]));
    [-1, 1].forEach((s) => chrome.push(put(new THREE.CylinderGeometry(0.007, 0.007, 0.12, 8), [-0.13, 1.19, z + s * 0.07], [0, 0, lean])));
    // plastic side shield, seat rails
    dark.push(put(RB(0.4, 0.13, 0.025, 0.01), [0.24, 0.46, z + (z < 0 ? -0.24 : 0.24)]));
    [-1, 1].forEach((s) => dark.push(put(new THREE.BoxGeometry(0.62, 0.025, 0.035), [0.25, 0.33, z + s * 0.16])));
    dark.push(put(RB(0.4, 0.1, 0.36, 0.02), [0.24, 0.41, z]));
  });
  // ── rear bench (x ≈ −0.72): its cushion top at y 0.67, where the tubs of tickets ride ─────────────────────────────────
  cloth.push(put(RB(0.5, 0.13, 1.24, 0.05), [-0.72, 0.6, 0], [0, 0, 0.06]));
  vinyl.push(put(RB(0.14, 0.12, 1.3, 0.05), [-0.47, 0.585, 0], [0, 0, 0.35]));
  cloth.push(put(RB(0.12, 0.5, 1.24, 0.05), [-0.98, 0.9, 0], [0, 0, 0.32]));
  [-0.42, 0, 0.42].forEach((z) => leather.push(put(RB(0.08, 0.12, z ? 0.26 : 0.2, 0.04), [-1.04, 1.17, z], [0, 0, 0.3])));
  dark.push(put(new THREE.BoxGeometry(0.5, 0.25, 1.3), [-0.72, 0.42, 0]));
  // ── dashboard: an extruded section across the car, the binnacle hood, the glovebox lid, the centre stack ───────────────
  const sec = new THREE.Shape();
  sec.moveTo(1.02, 0.935); sec.quadraticCurveTo(0.92, 0.995, 0.8, 0.985); sec.quadraticCurveTo(0.7, 0.975, 0.7, 0.9);
  sec.quadraticCurveTo(0.72, 0.8, 0.8, 0.72); sec.lineTo(0.86, 0.56); sec.lineTo(1.02, 0.52); sec.closePath();
  const dashG = new THREE.ExtrudeGeometry(sec, { depth: 1.5, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 10 });
  dashG.translate(0, 0, -0.75); dash.push(dashG);
  const hood = new THREE.CylinderGeometry(0.11, 0.11, 0.12, 24, 1, true, 0, Math.PI);   // the binnacle's hood: an arch over the dials
  hood.rotateZ(Math.PI / 2); hood.scale(1, 1, 1.65);
  dash.push(put(hood, [0.76, 0.985, DRIVER_Z]));
  dash.push(put(RB(0.12, 0.34, 0.3, 0.03), [0.8, 0.74, 0], [0, 0, -0.12]));         // centre stack body
  dark.push(put(RB(0.04, 0.16, 0.42, 0.02), [0.72, 0.8, 0.42], [0, 0, -0.35]));     // glovebox lid
  // ── steering: column shroud, column, wheel (rim, three spokes, the airbag hub) ──────────────────────────────────────
  const tilt = 0.42;                                                                  // the wheel's rake from vertical
  const ax = new THREE.Vector3(Math.cos(tilt), -Math.sin(tilt), 0);                   // the column's axis (toward the dash)
  const W0 = new THREE.Vector3(0.6, 0.98, DRIVER_Z);
  const wheelRot = [0, 0, -tilt];                                                     // plane of the wheel ⟂ the axis
  const rim = new THREE.TorusGeometry(0.185, 0.019, 12, 48); rim.rotateY(Math.PI / 2);
  leather.push(put(rim, W0.toArray(), wheelRot));
  [[0, -1], [Math.PI / 2 - 0.25, 1], [-(Math.PI / 2 - 0.25), 1]].forEach(([a]) => {
    const sp = new THREE.BoxGeometry(0.03, 0.15, 0.06); sp.translate(0, -0.09, 0); sp.rotateX(a);
    dark.push(put(sp, W0.toArray(), wheelRot));
  });
  dark.push(put(RB(0.07, 0.13, 0.15, 0.03), W0.clone().addScaledVector(ax, 0.02).toArray(), wheelRot));
  const col = new THREE.CylinderGeometry(0.035, 0.045, 0.3, 16); col.rotateZ(Math.PI / 2);
  dark.push(put(col, W0.clone().addScaledVector(ax, 0.17).toArray(), [0, 0, -tilt]));
  dark.push(put(RB(0.2, 0.1, 0.12, 0.03), W0.clone().addScaledVector(ax, 0.2).add(new THREE.Vector3(0, -0.04, 0)).toArray(), [0, 0, -tilt]));
  [-1, 1].forEach((s) => dark.push(put(new THREE.BoxGeometry(0.1, 0.015, 0.02), W0.clone().addScaledVector(ax, 0.13).add(new THREE.Vector3(0, 0, s * 0.09)).toArray(), [0, 0, -tilt])));   // the stalks
  // ── console: tunnel, shifter (boot, lever, knob), cupholders, the armrest ───────────────────────────────────────────
  dash.push(put(RB(0.9, 0.22, 0.24, 0.04), [0.25, 0.44, 0]));
  dark.push(put(RB(0.3, 0.03, 0.2, 0.01), [0.5, 0.555, 0]));
  dark.push(put(new THREE.CylinderGeometry(0.035, 0.05, 0.06, 16), [0.48, 0.58, 0]));
  dark.push(put(new THREE.CylinderGeometry(0.011, 0.011, 0.16, 10), [0.47, 0.65, 0], [0, 0, 0.2]));
  chrome.push(put(new THREE.SphereGeometry(0.032, 16, 12), [0.455, 0.735, 0]));
  [-0.05, 0.05].forEach((z) => dark.push(put(new THREE.CylinderGeometry(0.038, 0.038, 0.035, 18), [0.22, 0.55, z])));
  leather.push(put(RB(0.32, 0.08, 0.22, 0.035), [-0.05, 0.6, 0]));
  // ── door cards' armrests and the floor ─────────────────────────────────────────────────────────────────────────────
  [-1, 1].forEach((s) => [[0.35, 0.5], [-0.56, 0.42]].forEach(([x, l]) => vinyl.push(put(RB(l, 0.06, 0.09, 0.025), [x, 0.68, s * 0.69]))));
  carpet.push(put(new THREE.BoxGeometry(2.5, 0.04, 1.5), [-0.15, 0.29, 0]));
  carpet.push(put(new THREE.BoxGeometry(0.8, 0.03, 1.36), [-1.88, 0.465, 0]));          // the trunk floor (the tubs stand on it)
  dark.push(put(new THREE.BoxGeometry(0.3, 0.02, 1.4), [-1.3, 0.985, 0], [0, 0, 0.1]));   // parcel shelf
  return { cloth: merge(cloth), vinyl: merge(vinyl), dash: merge(dash), dark: merge(dark), chrome: merge(chrome), carpet: merge(carpet), leather: merge(leather), W0, tilt };
};
let _cab = null;
export const cabinGeometry = () => (_cab ??= buildCabin());

/** the cabin's materials (all fade together: op = how much of the car is still there) */
export const useCabinMats = () => useMemo(() => {
  const st = seatTex(); st.wrapS = st.wrapT = THREE.RepeatWrapping; st.repeat.set(2, 2);
  const m = {
    cloth: new THREE.MeshStandardMaterial({ map: st, bumpMap: st, bumpScale: 0.6, roughness: 0.92, color: "#C9D3E2" }),
    vinyl: new THREE.MeshStandardMaterial({ color: "#2A3442", roughness: 0.62, metalness: 0.05 }),
    leather: new THREE.MeshStandardMaterial({ color: "#2F3A4A", roughness: 0.5, metalness: 0.05 }),
    dash: new THREE.MeshStandardMaterial({ color: "#1E2633", roughness: 0.72, metalness: 0.05 }),
    dark: new THREE.MeshStandardMaterial({ color: "#151B24", roughness: 0.55, metalness: 0.2 }),
    chrome: new THREE.MeshStandardMaterial({ color: "#D6E0EC", roughness: 0.18, metalness: 1 }),
    carpet: new THREE.MeshStandardMaterial({ color: "#121925", roughness: 0.98 }),
    gauges: new THREE.MeshStandardMaterial({ map: gaugeTex(), emissiveMap: gaugeTex(), emissive: "#FFFFFF", emissiveIntensity: 1.2, roughness: 0.3, color: "#FFFFFF" }),
    radio: new THREE.MeshStandardMaterial({ map: radioTex(), emissiveMap: radioTex(), emissive: "#7FB4F2", emissiveIntensity: 0.25, roughness: 0.45 }),
    door: new THREE.MeshStandardMaterial({ map: doorTex(), roughness: 0.75, side: THREE.DoubleSide }),
    gate: new THREE.MeshStandardMaterial({ map: gateTex(), emissiveMap: gateTex(), emissive: "#FFFFFF", emissiveIntensity: 0.35, roughness: 0.5 }),
    vent: new THREE.MeshStandardMaterial({ map: ventTex(), roughness: 0.4, metalness: 0.4 })
  };
  return m;
}, []);

export const Cabin = ({ mats }) => {
  const g = cabinGeometry();
  const gp = g.W0;
  return (
    <group>
      {["cloth", "vinyl", "leather", "dash", "dark", "chrome", "carpet"].map((k) => <mesh key={k} geometry={g[k]} material={mats[k]} receiveShadow />)}
      {/* the gauges, set in the binnacle and facing the driver */}
      <mesh position={[0.8, 0.985, DRIVER_Z]} rotation-y={-Math.PI / 2} material={mats.gauges}><planeGeometry args={[0.32, 0.16]} /></mesh>
      {/* the centre stack's face */}
      <mesh position={[0.735, 0.75, 0]} rotation-y={-Math.PI / 2} rotation-x={0.12} material={mats.radio}><planeGeometry args={[0.24, 0.3]} /></mesh>
      {/* four vents: two in the stack's top, one at each end of the dash */}
      {[[0.74, 0.94, -0.08], [0.74, 0.94, 0.08], [0.715, 0.93, -0.66], [0.715, 0.93, 0.66]].map((p, i) => <mesh key={i} position={p} rotation-y={-Math.PI / 2} material={mats.vent}><planeGeometry args={[i < 2 ? 0.13 : 0.12, 0.065]} /></mesh>)}
      {/* the shifter's gate */}
      <mesh position={[0.5, 0.572, 0.045]} rotation-x={-Math.PI / 2} rotation-z={-Math.PI / 2} material={mats.gate}><planeGeometry args={[0.04, 0.08]} /></mesh>
      {/* door cards, both sides (front and rear doors on one panel each) */}
      {[-1, 1].map((s) => <mesh key={s} position={[-0.01, 0.67, s * 0.735]} rotation-y={s > 0 ? Math.PI : 0} scale-x={s > 0 ? -1 : 1} material={mats.door}><planeGeometry args={[1.98, 0.62]} /></mesh>)}
    </group>
  );
};
