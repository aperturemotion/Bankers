// @ts-nocheck
// ★ V38 GLOBE — a domed neoclassical building in the spirit of MIT's Great Dome (generic and unlabelled): a stepped stylobate, a
//   portico of ten Ionic columns (fluted shafts, bases, volute capitals), an entablature with a dentil cornice, an attic, a drum
//   ringed with pilasters, a low ribbed dome with its lantern, and long wings either side with tall windows (a few lit, warm).
//   Built facing −x, its front at local x = 0; it extends toward +x.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd, Glow } from "./kit";

const STONE = "#7A8CA5", STONE_D = "#8E9EB4";
const shaftTex = () => canvasTex("g_flutes", 256, 32, (c, w, h) => {
  c.fillStyle = "#A9B7CA"; c.fillRect(0, 0, w, h);
  for (let k = 0; k < 24; k++) { const x = (k / 24) * w; const g = c.createLinearGradient(x, 0, x + w / 24, 0); g.addColorStop(0, "rgba(40,60,90,0.35)"); g.addColorStop(0.5, "rgba(255,255,255,0.12)"); g.addColorStop(1, "rgba(40,60,90,0.05)"); c.fillStyle = g; c.fillRect(x, 0, w / 24, h); }
});
const domeTex = () => canvasTex("g_dome", 512, 256, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#C9D5E4"); g.addColorStop(1, "#93A5BD"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let k = 0; k < 32; k++) { c.fillStyle = "rgba(50,70,100,0.25)"; c.fillRect((k / 32) * w, 0, 3, h); }
  for (let r = 1; r < 6; r++) { c.fillStyle = "rgba(50,70,100,0.12)"; c.fillRect(0, h * (r / 6), w, 2); }
});
const drumTex = () => canvasTex("g_drum", 1024, 128, (c, w, h) => {
  c.fillStyle = "#9DACC1"; c.fillRect(0, 0, w, h);
  for (let k = 0; k < 24; k++) {
    const x = (k / 24) * w;
    c.fillStyle = "rgba(255,255,255,0.18)"; c.fillRect(x + 4, 10, 10, h - 20);
    c.fillStyle = "rgba(30,50,80,0.25)"; c.fillRect(x + 14, 10, 4, h - 20);
    // a window between pilasters
    c.fillStyle = "#26364C"; c.fillRect(x + 22, 36, 16, 60);
  }
  c.fillStyle = "rgba(30,50,80,0.3)"; c.fillRect(0, 0, w, 8); c.fillRect(0, h - 8, w, 8);
});
const wingTex = (key, cols, rows, seed) => canvasTex("g_wing_" + key, 1024, 512, (c, w, h) => {
  c.fillStyle = "#93A3BA"; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) { c.fillStyle = "rgba(40,60,90,0.06)"; c.fillRect(0, y, w, 1); }
  c.fillStyle = "rgba(255,255,255,0.12)"; c.fillRect(0, 26, w, 10); c.fillStyle = "rgba(30,50,80,0.18)"; c.fillRect(0, 36, w, 4);
  const cw = w / cols, rh = (h - 90) / rows;
  for (let k = 0; k < cols; k++) {
    c.fillStyle = "rgba(255,255,255,0.10)"; c.fillRect(k * cw, 50, 8, h - 50);
    for (let r = 0; r < rows; r++) {
      const on = rnd(seed + k * 13 + r * 7) < 0.3;
      const x = k * cw + cw * 0.28, y = 70 + r * rh + rh * 0.12, ww = cw * 0.44, hh = rh * 0.72;
      c.fillStyle = "#16233A"; c.fillRect(x - 3, y - 3, ww + 6, hh + 6);
      const g = c.createLinearGradient(0, y, 0, y + hh);
      if (on) { g.addColorStop(0, "#FFD99A"); g.addColorStop(1, "#E3A55C"); } else { g.addColorStop(0, "#2A3D58"); g.addColorStop(1, "#1A2840"); }
      c.fillStyle = g; c.fillRect(x, y, ww, hh);
      c.fillStyle = "rgba(10,20,35,0.55)"; c.fillRect(x + ww / 2 - 1, y, 2, hh); c.fillRect(x, y + hh * 0.5, ww, 2);
    }
  }
});
const Column = ({ z, h = 11 }) => {
  const flutes = useMemo(shaftTex, []);
  flutes.wrapS = THREE.RepeatWrapping;
  return (
    <group position={[0, 1.5, z]}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow><boxGeometry args={[1.55, 0.4, 1.55]} /><meshStandardMaterial color={STONE} roughness={0.75} /></mesh>
      <mesh position={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.72, 0.76, 0.22, 24]} /><meshStandardMaterial color={STONE} roughness={0.75} /></mesh>
      <mesh position={[0, h / 2 + 0.3, 0]} castShadow receiveShadow><cylinderGeometry args={[0.54, 0.62, h - 0.6, 24, 1]} /><meshStandardMaterial map={flutes} color="#A8B6C9" roughness={0.7} /></mesh>
      {/* the Ionic capital: echinus, two volutes, abacus */}
      <mesh position={[0, h - 0.1, 0]} castShadow><cylinderGeometry args={[0.66, 0.56, 0.25, 24]} /><meshStandardMaterial color={STONE} roughness={0.7} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[0, h + 0.05, s * 0.62]} rotation-x={Math.PI / 2} castShadow><cylinderGeometry args={[0.22, 0.22, 1.35, 16]} /><meshStandardMaterial color={STONE} roughness={0.7} /></mesh>)}
      <mesh position={[0, h + 0.33, 0]} castShadow><boxGeometry args={[1.45, 0.16, 1.7]} /><meshStandardMaterial color={STONE} roughness={0.7} /></mesh>
    </group>
  );
};
export const DomeBuilding = ({ lampsOn = 1 }) => {
  const dome = useMemo(domeTex, []);
  const drum = useMemo(drumTex, []);
  drum.wrapS = THREE.RepeatWrapping;
  const wingL = useMemo(() => wingTex("L", 9, 3, 11), []);
  const wingR = useMemo(() => wingTex("R", 9, 3, 37), []);
  const back = useMemo(() => wingTex("B", 7, 2, 71), []);
  const stone = { color: STONE, roughness: 0.78 };
  const cols = Array.from({ length: 10 }, (_, i) => -12.6 + i * 2.8);
  const dentils = useMemo(() => Array.from({ length: 64 }, (_, i) => -14.4 + i * 0.457), []);
  return (
    <group>
      {/* stylobate: five steps up to the portico */}
      {[0, 1, 2, 3, 4].map((k) => <mesh key={k} position={[(-6.5 + k * 0.45 + 3) / 2, 0.15 + k * 0.3, 0]} castShadow receiveShadow><boxGeometry args={[3 - (-6.5 + k * 0.45), 0.3, 32 - k * 0.4]} /><meshStandardMaterial {...stone} color={k % 2 ? STONE : "#8496AE"} /></mesh>)}
      {cols.map((z) => <group key={z} position={[-3, 0, 0]}><Column z={z} /></group>)}
      {/* the wall behind the colonnade, with tall windows and the doors */}
      <mesh position={[1.5, 7, 0]} receiveShadow><boxGeometry args={[3, 11, 28]} /><meshStandardMaterial {...stone} color="#7B8DA6" /></mesh>
      <mesh position={[-0.02, 7, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[28, 11]} /><meshStandardMaterial map={back} color="#A3B1C5" roughness={0.8} emissiveMap={back} emissive="#FFC58A" emissiveIntensity={0.45} /></mesh>
      {/* entablature: architrave, frieze, dentils, cornice */}
      <mesh position={[-2.2, 13.25, 0]} castShadow receiveShadow><boxGeometry args={[3.4, 0.9, 30]} /><meshStandardMaterial {...stone} /></mesh>
      <mesh position={[-2.1, 14.2, 0]} castShadow><boxGeometry args={[3.2, 1.0, 29.6]} /><meshStandardMaterial {...stone} color="#8C9DB4" /></mesh>
      {dentils.map((z) => <mesh key={z} position={[-3.75, 14.82, z]}><boxGeometry args={[0.2, 0.22, 0.24]} /><meshStandardMaterial {...stone} /></mesh>)}
      <mesh position={[-2.3, 15.1, 0]} castShadow><boxGeometry args={[3.9, 0.36, 30.8]} /><meshStandardMaterial {...stone} color="#90A1B8" /></mesh>
      {/* attic */}
      <mesh position={[1.2, 16.6, 0]} castShadow receiveShadow><boxGeometry args={[8, 2.7, 27]} /><meshStandardMaterial {...stone} color="#7E90A8" /></mesh>
      <mesh position={[1.2, 18.05, 0]}><boxGeometry args={[8.3, 0.25, 27.3]} /><meshStandardMaterial {...stone} /></mesh>
      {/* drum, dome, lantern */}
      <mesh position={[9.5, 20.2, 0]} castShadow><cylinderGeometry args={[8.6, 8.6, 4.4, 64]} /><meshStandardMaterial map={drum} color="#A3B1C5" roughness={0.75} /></mesh>
      <mesh position={[9.5, 22.5, 0]}><cylinderGeometry args={[9.0, 9.0, 0.35, 64]} /><meshStandardMaterial {...stone} /></mesh>
      <mesh position={[9.5, 22.6, 0]} scale={[1, 0.6, 1]} castShadow><sphereGeometry args={[8.4, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial map={dome} color="#B9C6D8" roughness={0.45} metalness={0.15} /></mesh>
      <mesh position={[9.5, 28.0, 0]}><cylinderGeometry args={[1.1, 1.3, 1.6, 20]} /><meshStandardMaterial {...stone} emissive="#FFC97A" emissiveIntensity={0.25 * lampsOn} /></mesh>
      <mesh position={[9.5, 29.0, 0]}><coneGeometry args={[1.25, 0.7, 20]} /><meshStandardMaterial {...stone} /></mesh>
      <Glow position={[9.5, 28.0, 0]} size={4} color="#FFC97A" opacity={0.45 * lampsOn} />
      {/* the long wings either side */}
      {[-1, 1].map((s) => (
        <group key={s} position={[4, 0, s * 33]}>
          <mesh position={[4, 7.5, 0]} castShadow receiveShadow><boxGeometry args={[12, 15, 36]} /><meshStandardMaterial {...stone} color="#75879F" /></mesh>
          <mesh position={[-2.02, 7.2, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[36, 14.4]} /><meshStandardMaterial map={s < 0 ? wingL : wingR} color="#A3B1C5" roughness={0.8} emissiveMap={s < 0 ? wingL : wingR} emissive="#FFC58A" emissiveIntensity={0.45} /></mesh>
          <mesh position={[4, 15.2, 0]}><boxGeometry args={[12.6, 0.4, 36.6]} /><meshStandardMaterial {...stone} color="#8C9DB4" /></mesh>
        </group>
      ))}
      {/* floodlights at the foot of the portico, washing the columns (cool white) */}
      {[-9, -3, 3, 9].map((z) => <Glow key={z} position={[-5.6, 0.4, z]} size={1.2} color="#DCEBFF" opacity={0.5} />)}
    </group>
  );
};
