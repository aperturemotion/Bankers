// @ts-nocheck
// ★ V38 builder D — the STATE HOUSE for the `state` station: a domed neoclassical capitol in the Massachusetts State House family
//   (an arcaded ground storey, a loggia of paired columns under a pediment, a drum and a ribbed pale-gold dome with a lantern),
//   built in DESIGN units (main block front at z 0, x ±26) and placed by the station with a group scale. Stone in the cool blue
//   family; the only warm colour is the lit windows and the dome's own gold.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd, std } from "./kit";

// ── print: stone facade with windows (map) + a separate emissive canvas holding ONLY the lit panes ─────────────────────────
export const drawFacade = (c, w, h, o, emisOnly) => {
  const { cols, rows, base, lit, seed, top = 40, bottom = 30, arch = false } = o;
  c.fillStyle = emisOnly ? "#000" : base; c.fillRect(0, 0, w, h);
  if (!emisOnly) {
    // ashlar courses: horizontal joints and staggered vertical joints, a little tonal variation per block
    const ch = 22;
    for (let y = 0, r = 0; y < h; y += ch, r++) {
      for (let x = (r % 2) * 30 - 30; x < w; x += 60) {
        const v = rnd(seed + r * 131 + x) * 0.10 - 0.05;
        c.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; c.fillRect(x, y, 60, ch);
        c.fillStyle = "rgba(10,20,40,0.22)"; c.fillRect(x, y, 1.5, ch);
      }
      c.fillStyle = "rgba(10,20,40,0.28)"; c.fillRect(0, y, w, 1.5);
    }
    // string course between storeys, a cornice band at the top
    c.fillStyle = "rgba(235,242,252,0.22)"; c.fillRect(0, top - 14, w, 10);
    for (let r = 1; r < rows; r++) { const y = top + (h - top - bottom) * r / rows - 6; c.fillStyle = "rgba(235,242,252,0.18)"; c.fillRect(0, y, w, 8); c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(0, y + 8, w, 3); }
    c.fillStyle = "rgba(0,0,0,0.3)"; c.fillRect(0, h - bottom, w, bottom);
  }
  const cw = w / cols, rh = (h - top - bottom) / rows;
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const on = rnd(seed * 7 + k * 13 + r * 29) < lit;
    const ww = cw * 0.42, hh = rh * 0.62, x = k * cw + (cw - ww) / 2, y = top + r * rh + rh * 0.2;
    if (!emisOnly) {
      // stone surround, lintel with keystone, sill
      c.fillStyle = "rgba(230,238,250,0.30)"; c.fillRect(x - 8, y - 8, ww + 16, hh + 16);
      c.fillStyle = "rgba(230,238,250,0.45)"; c.fillRect(x - 14, y - 18, ww + 28, 10); c.fillRect(x + ww / 2 - 7, y - 22, 14, 16);
      c.fillStyle = "rgba(230,238,250,0.40)"; c.fillRect(x - 12, y + hh + 6, ww + 24, 8);
      c.fillStyle = "rgba(0,0,0,0.35)"; c.fillRect(x - 12, y + hh + 14, ww + 24, 3);
    }
    const g = c.createLinearGradient(0, y, 0, y + hh);
    if (on) { g.addColorStop(0, "#FFE2AE"); g.addColorStop(1, "#E7A65C"); } else if (!emisOnly) { g.addColorStop(0, "#2A4468"); g.addColorStop(0.5, "#13233B"); g.addColorStop(1, "#0D192B"); } else { g.addColorStop(0, "#000"); g.addColorStop(1, "#000"); }
    c.fillStyle = g;
    if (arch) { c.beginPath(); c.moveTo(x, y + hh); c.lineTo(x, y + ww / 2); c.arc(x + ww / 2, y + ww / 2, ww / 2, Math.PI, 0); c.lineTo(x + ww, y + hh); c.closePath(); c.fill(); }
    else c.fillRect(x, y, ww, hh);
    if (on && emisOnly) continue;
    // glazing bars (12 panes) and a curtain edge on lit ones
    c.fillStyle = on ? "rgba(90,50,20,0.55)" : "rgba(150,180,220,0.25)";
    c.fillRect(x + ww / 2 - 1.5, y, 3, hh); for (let q = 1; q < 4; q++) c.fillRect(x, y + hh * q / 4 - 1, ww, 2.5);
    c.fillRect(x + ww / 4 - 1, y, 2, hh); c.fillRect(x + ww * 3 / 4 - 1, y, 2, hh);
    if (on) { c.fillStyle = "rgba(120,60,30,0.35)"; c.fillRect(x, y, ww * 0.16, hh); c.fillRect(x + ww * 0.84, y, ww * 0.16, hh); }
    else { c.fillStyle = "rgba(180,210,250,0.10)"; c.beginPath(); c.moveTo(x, y + hh * 0.7); c.lineTo(x + ww * 0.6, y); c.lineTo(x + ww, y); c.lineTo(x, y + hh); c.fill(); }
  }
};
export const facade = (key, w, h, o) => ({
  map: canvasTex("sh_f_" + key, w, h, (c) => drawFacade(c, w, h, o, false)),
  emis: canvasTex("sh_e_" + key, w, h, (c) => drawFacade(c, w, h, o, true))
});
const STONE = "#6D7B90", STONE_HI = "#93A2B7", STONE_LO = "#4A586C";
const FMat = ({ f, color = "#FFFFFF", ei = 1.0 }) => <meshStandardMaterial map={f.map} color={color} roughness={0.82} emissiveMap={f.emis} emissive="#FFFFFF" emissiveIntensity={ei} />;

// the dome's skin: 16 ribs and a few horizontal bands on pale gold (u around, v pole → equator)
const domeTex = () => canvasTex("sh_dome", 1024, 512, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#F3DDA2"); g.addColorStop(1, "#C9A35C");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 1024; i += 2) { c.fillStyle = `rgba(255,240,200,${rnd(i) * 0.06})`; c.fillRect(i, 0, 2, h); }
  for (let k = 0; k < 16; k++) { const x = (k + 0.5) * w / 16; c.fillStyle = "rgba(90,60,20,0.55)"; c.fillRect(x - 3, 0, 6, h); c.fillStyle = "rgba(255,245,215,0.55)"; c.fillRect(x + 3, 0, 3, h); }
  [0.42, 0.7, 0.93].forEach((v) => { c.fillStyle = "rgba(90,60,20,0.45)"; c.fillRect(0, v * h, w, 5); c.fillStyle = "rgba(255,245,215,0.4)"; c.fillRect(0, v * h + 5, w, 3); });
});
const hallTex = () => canvasTex("sh_hall", 256, 288, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, 40, 10, w / 2, 120, 260); g.addColorStop(0, "#FFE3B4"); g.addColorStop(0.35, "#B9844C"); g.addColorStop(1, "#3A2A1A");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = "rgba(40,24,10,0.55)"; c.lineWidth = 4;
  for (let k = 0; k < 3; k++) { c.strokeRect(18 + k * 78, 130, 64, 70); c.strokeRect(18 + k * 78, 210, 64, 66); }
  c.fillStyle = "rgba(255,240,210,0.9)"; c.beginPath(); c.arc(w / 2, 36, 10, 0, Math.PI * 2); c.fill();
});
const drumTex = () => facade("drum", 2048, 256, { cols: 16, rows: 1, base: STONE, lit: 0.85, seed: 77, top: 40, bottom: 20, arch: true });

// a classical column (design units): plinth, torus base, shaft with entasis + flutes (as many sides), a flared capital, the abacus
const colGeo = new THREE.CylinderGeometry(0.30, 0.34, 1, 20, 1);
const Column = ({ x, z, y0, hgt }) => (
  <group position={[x, y0, z]}>
    <mesh position={[0, 0.12, 0]} castShadow receiveShadow><boxGeometry args={[0.95, 0.24, 0.95]} /><meshStandardMaterial color={STONE_HI} roughness={0.7} /></mesh>
    <mesh position={[0, 0.34, 0]} castShadow><cylinderGeometry args={[0.40, 0.44, 0.2, 24]} /><meshStandardMaterial color={STONE_HI} roughness={0.7} /></mesh>
    <mesh position={[0, 0.44 + (hgt - 1.2) / 2, 0]} scale={[1, hgt - 1.2, 1]} castShadow receiveShadow geometry={colGeo}><meshStandardMaterial color="#A4B2C6" roughness={0.6} flatShading /></mesh>
    <mesh position={[0, hgt - 0.6, 0]} castShadow><cylinderGeometry args={[0.52, 0.31, 0.55, 20]} /><meshStandardMaterial color={STONE_HI} roughness={0.65} /></mesh>
    <mesh position={[0, hgt - 0.25, 0]} castShadow><boxGeometry args={[1.05, 0.18, 1.05]} /><meshStandardMaterial color={STONE_HI} roughness={0.65} /></mesh>
  </group>
);
// a run of balusters (one instanced mesh) with its top and bottom rail
const balGeo = new THREE.CylinderGeometry(0.09, 0.13, 1, 8);
const Balustrade = ({ x0, x1, y, z, h = 0.9, step = 0.38 }) => {
  const n = Math.max(1, Math.floor((x1 - x0) / step));
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(balGeo, std(STONE_HI, 0.7), n); m.castShadow = true; m.receiveShadow = true;
    const M = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { M.makeScale(1, h - 0.24, 1); M.setPosition(x0 + (i + 0.5) * (x1 - x0) / n, y + 0.12 + (h - 0.24) / 2, z); m.setMatrixAt(i, M); }
    return m;
  }, [x0, x1, y, z, h, n]);
  return (
    <group>
      <primitive object={mesh} />
      <mesh position={[(x0 + x1) / 2, y + 0.06, z]} receiveShadow><boxGeometry args={[x1 - x0, 0.12, 0.42]} /><meshStandardMaterial color={STONE_HI} roughness={0.7} /></mesh>
      <mesh position={[(x0 + x1) / 2, y + h - 0.07, z]} castShadow receiveShadow><boxGeometry args={[x1 - x0 + 0.1, 0.14, 0.5]} /><meshStandardMaterial color={STONE_HI} roughness={0.7} /></mesh>
    </group>
  );
};
// dentils under a cornice (instanced)
const Dentils = ({ x0, x1, y, z }) => {
  const n = Math.floor((x1 - x0) / 0.32);
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 0.2, 0.18), std(STONE_HI, 0.7), n);
    const M = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { M.makeTranslation(x0 + (i + 0.5) * (x1 - x0) / n, y, z); m.setMatrixAt(i, M); }
    return m;
  }, [x0, x1, y, z, n]);
  return <primitive object={mesh} />;
};
const pedGeo = (base, hgt, depth) => {
  const s = new THREE.Shape(); s.moveTo(-base / 2, 0); s.lineTo(base / 2, 0); s.lineTo(0, hgt); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false }); g.translate(0, 0, -depth / 2); return g;
};

/** The capitol. `dome` 0..1 brightens the dome and lantern (the money arriving); `door` 0..1 opens the centre doors' light. */
export const StateHouse = ({ dome = 0, door = 0 }) => {
  const front = useMemo(() => facade("front", 2048, 512, { cols: 15, rows: 2, base: STONE, lit: 0.45, seed: 11 }), []);
  const side = useMemo(() => facade("side", 1024, 512, { cols: 6, rows: 2, base: STONE, lit: 0.3, seed: 23 }), []);
  const arcade = useMemo(() => facade("arcade", 1024, 256, { cols: 7, rows: 1, base: STONE_HI, lit: 0.0, seed: 5, top: 26, bottom: 14, arch: true }), []);
  const drum = useMemo(drumTex, []);
  const dtex = useMemo(domeTex, []);
  const hall = useMemo(hallTex, []);
  const ped = useMemo(() => pedGeo(19.6, 3.1, 4.4), []);
  const tymp = useMemo(() => pedGeo(17.0, 2.35, 0.3), []);
  const cols = [-7.9, -6.9, -4.0, -3.0, -0.5, 0.5, 3.0, 4.0, 6.9, 7.9];
  return (
    <group>
      {/* the terrace it stands on, its granite edge and the grand steps */}
      <mesh position={[0, 0.6, -6]} receiveShadow castShadow><boxGeometry args={[64, 1.2, 28]} /><meshStandardMaterial color="#3B4A60" roughness={0.85} /></mesh>
      <mesh position={[0, 1.25, 7.9]} receiveShadow><boxGeometry args={[64, 0.1, 0.4]} /><meshStandardMaterial color="#9AA8BC" roughness={0.6} /></mesh>
      {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[0, 0.1 + i * 0.2, 12 - i * 0.7]} receiveShadow castShadow><boxGeometry args={[16, 0.2, 0.7 + i * 0.0]} /><meshStandardMaterial color={i % 2 ? "#8E9DB2" : "#97A6BB"} roughness={0.7} /></mesh>)}
      {[-8.4, 8.4].map((x) => <mesh key={x} position={[x, 0.9, 10.2]} castShadow receiveShadow><boxGeometry args={[0.8, 1.8, 4.2]} /><meshStandardMaterial color={STONE_HI} roughness={0.7} /></mesh>)}
      {/* the main block (stone, two storeys of lit windows), its parapet balustrade and a cornice */}
      <mesh position={[0, 7.2, -5]} castShadow receiveShadow><boxGeometry args={[52, 12, 10]} /><meshStandardMaterial color={STONE} roughness={0.85} /></mesh>
      <mesh position={[0, 7.2, 0.01]}><planeGeometry args={[52, 12]} /><FMat f={front} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 26.01, 7.2, -5]} rotation-y={s * Math.PI / 2}><planeGeometry args={[10, 12]} /><FMat f={side} /></mesh>)}
      <mesh position={[0, 13.35, -4.8]} castShadow><boxGeometry args={[53, 0.32, 10.8]} /><meshStandardMaterial color={STONE_HI} roughness={0.7} /></mesh>
      <Dentils x0={-26.2} x1={-9.6} y={13.08} z={0.32} />
      <Dentils x0={9.6} x1={26.2} y={13.08} z={0.32} />
      <Balustrade x0={-26} x1={-10} y={13.5} z={0.1} />
      <Balustrade x0={10} x1={26} y={13.5} z={0.1} />
      {/* the centre pavilion: an arcaded ground storey with the open, lit centre door */}
      {[[-5.3, 7.4], [5.3, 7.4]].map(([x, w], i) => (
        <group key={i}>
          <mesh position={[x, 3.2, 2]} castShadow receiveShadow><boxGeometry args={[w, 4, 4]} /><meshStandardMaterial color={STONE_HI} roughness={0.8} /></mesh>
          <mesh position={[x, 3.2, 4.01]}><planeGeometry args={[w, 4]} /><meshStandardMaterial map={arcade.map} roughness={0.8} color="#E8EEF7" /></mesh>
        </group>
      ))}
      <mesh position={[0, 4.95, 2]} castShadow receiveShadow><boxGeometry args={[3.2, 0.5, 4]} /><meshStandardMaterial color={STONE_HI} roughness={0.8} /></mesh>
      {/* the hall behind the open door: panelled walls, a chandelier's warm light, the two door leaves swung in, a stone architrave */}
      <mesh position={[0, 1.21, 2.15]} rotation-x={-Math.PI / 2}><planeGeometry args={[3.2, 3.7]} /><meshStandardMaterial color="#4A3A28" roughness={0.35} metalness={0.1} emissive="#FFB15A" emissiveIntensity={0.08 + 0.35 * door} /></mesh>
      <mesh position={[0, 3.0, 0.3]}><planeGeometry args={[3.2, 3.6]} /><meshBasicMaterial map={hall} color={new THREE.Color("#FFFFFF").multiplyScalar(0.32 + 0.75 * door)} /></mesh>
      {[-1.6, 1.6].map((x) => <mesh key={x} position={[x * 0.99, 3.0, 2.15]} rotation-y={x < 0 ? Math.PI / 2 : -Math.PI / 2}><planeGeometry args={[3.7, 3.6]} /><meshStandardMaterial map={hall} color="#9A8266" roughness={0.6} emissive="#FFB15A" emissiveIntensity={0.05 + 0.25 * door} /></mesh>)}
      {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 1.55, 2.95, 3.25]} rotation-y={sd * 1.25} castShadow><boxGeometry args={[0.08, 3.4, 1.5]} /><meshStandardMaterial color="#2B2118" roughness={0.45} metalness={0.2} /></mesh>)}
      <mesh position={[0, 4.75, 4.06]}><boxGeometry args={[3.7, 0.3, 0.14]} /><meshStandardMaterial color={STONE_HI} roughness={0.6} /></mesh>
      {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 1.72, 2.95, 4.06]}><boxGeometry args={[0.26, 3.5, 0.14]} /><meshStandardMaterial color={STONE_HI} roughness={0.6} /></mesh>)}
      {/* the loggia: a floor, the paired columns, a balustrade between them */}
      <mesh position={[0, 5.3, 2]} receiveShadow castShadow><boxGeometry args={[18.4, 0.2, 4.4]} /><meshStandardMaterial color={STONE_HI} roughness={0.75} /></mesh>
      {cols.map((x) => <Column key={x} x={x} z={3.4} y0={5.4} hgt={5.8} />)}
      <Balustrade x0={-7.4} x1={-4.5} y={5.4} z={3.4} h={1.0} />
      <Balustrade x0={-2.5} x1={-1.0} y={5.4} z={3.4} h={1.0} />
      <Balustrade x0={1.0} x1={2.5} y={5.4} z={3.4} h={1.0} />
      <Balustrade x0={4.5} x1={7.4} y={5.4} z={3.4} h={1.0} />
      {/* entablature, dentils, cornice, the pediment with a recessed tympanum and its oculus */}
      <mesh position={[0, 11.75, 2]} castShadow receiveShadow><boxGeometry args={[18.8, 1.1, 4.4]} /><meshStandardMaterial color={STONE_HI} roughness={0.7} /></mesh>
      <mesh position={[0, 11.5, 4.21]}><boxGeometry args={[18.4, 0.08, 0.02]} /><meshStandardMaterial color="#6E7E94" /></mesh>
      <Dentils x0={-9.3} x1={9.3} y={12.2} z={4.25} />
      <mesh position={[0, 12.45, 2.1]} castShadow><boxGeometry args={[19.8, 0.3, 4.8]} /><meshStandardMaterial color={STONE_HI} roughness={0.65} /></mesh>
      <mesh geometry={ped} position={[0, 12.6, 2.1]} castShadow receiveShadow><meshStandardMaterial color={STONE_HI} roughness={0.7} /></mesh>
      <mesh geometry={tymp} position={[0, 12.85, 4.2]}><meshStandardMaterial color={STONE_LO} roughness={0.85} /></mesh>
      <mesh position={[0, 13.85, 4.42]}><circleGeometry args={[0.55, 28]} /><meshStandardMaterial color="#2A3D5C" emissive="#FFD9A0" emissiveIntensity={0.5 + 0.8 * dome} /></mesh>
      <mesh position={[0, 13.85, 4.41]}><ringGeometry args={[0.55, 0.75, 28]} /><meshStandardMaterial color={STONE_HI} roughness={0.6} /></mesh>
      {/* the dome: a square base, the drum with arched lit windows, a cornice ring, the ribbed pale-gold dome, the lantern */}
      <group position={[0, 0, -5]}>
        <mesh position={[0, 14.6, 0]} castShadow receiveShadow><boxGeometry args={[13, 2.2, 13]} /><meshStandardMaterial color={STONE} roughness={0.8} /></mesh>
        <mesh position={[0, 15.8, 0]} castShadow><boxGeometry args={[13.6, 0.3, 13.6]} /><meshStandardMaterial color={STONE_HI} roughness={0.7} /></mesh>
        <mesh position={[0, 17.2, 0]} castShadow receiveShadow><cylinderGeometry args={[5.4, 5.4, 2.6, 64, 1, true]} /><meshStandardMaterial map={drum.map} emissiveMap={drum.emis} emissive="#FFFFFF" emissiveIntensity={0.9 + 0.5 * dome} roughness={0.8} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 18.6, 0]} castShadow><cylinderGeometry args={[5.75, 5.75, 0.36, 64]} /><meshStandardMaterial color={STONE_HI} roughness={0.65} /></mesh>
        <mesh position={[0, 18.78, 0]} scale={[1, 0.92, 1]} castShadow>
          <sphereGeometry args={[5.4, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial map={dtex} color="#FFFFFF" metalness={0.92} roughness={0.3} emissive="#FFCF7A" emissiveIntensity={0.04 + 0.42 * dome} envMapIntensity={1.6} />
        </mesh>
        {/* lantern: a ring of slim columns around a lit core, a small gold cap, the finial */}
        <group position={[0, 23.6, 0]}>
          <mesh position={[0, 0.1, 0]} castShadow><cylinderGeometry args={[1.35, 1.45, 0.25, 24]} /><meshStandardMaterial color={STONE_HI} roughness={0.6} /></mesh>
          <mesh position={[0, 1.0, 0]}><cylinderGeometry args={[0.9, 0.9, 1.6, 20]} /><meshStandardMaterial color="#3A2C1C" emissive="#FFD08A" emissiveIntensity={0.9 + 1.6 * dome} /></mesh>
          {Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * 1.15, 1.0, Math.sin(a) * 1.15]} castShadow><cylinderGeometry args={[0.09, 0.09, 1.6, 8]} /><meshStandardMaterial color={STONE_HI} roughness={0.6} /></mesh>; })}
          <mesh position={[0, 1.88, 0]} castShadow><cylinderGeometry args={[1.35, 1.35, 0.18, 24]} /><meshStandardMaterial color={STONE_HI} roughness={0.6} /></mesh>
          <mesh position={[0, 1.95, 0]} scale={[1, 0.8, 1]}><sphereGeometry args={[1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#E9CD8C" metalness={0.92} roughness={0.28} emissive="#FFCF7A" emissiveIntensity={0.05 + 0.2 * dome} /></mesh>
          <mesh position={[0, 3.25, 0]}><coneGeometry args={[0.22, 0.75, 12]} /><meshStandardMaterial color="#E9CD8C" metalness={0.9} roughness={0.3} /></mesh>
          <mesh position={[0, 2.85, 0]}><sphereGeometry args={[0.2, 12, 10]} /><meshStandardMaterial color="#E9CD8C" metalness={0.9} roughness={0.3} /></mesh>
        </group>
      </group>
      {/* chimney stacks on the wings (the real building's roofline rhythm) */}
      {[-22, -14, 14, 22].map((x) => <mesh key={x} position={[x, 14.8, -6]} castShadow><boxGeometry args={[1.2, 2.6, 1.0]} /><meshStandardMaterial color={STONE_LO} roughness={0.85} /></mesh>)}
      {/* the hipped roof behind the parapet */}
      <mesh position={[0, 14.2, -5]} castShadow><boxGeometry args={[51, 1.4, 9.4]} /><meshStandardMaterial color="#2C3A4F" roughness={0.6} metalness={0.2} /></mesh>
    </group>
  );
};
