// @ts-nocheck
// ★ V38 builder D — a modest one-storey home at night (the Selbees' kind of house in Evart, generic): a ranch house with lap
//   siding, an asphalt-shingle gable roof, white trim, shutters, warm lit windows with curtains, a porch light over the door, an
//   attached garage, a brick chimney, foundation, steps, shrubs, a mailbox. Local coords: the front face at z = +3.5, ground y 0.
//   PICTURE = the big front window's centre (local) — the total station pushes into it.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd, Glow } from "./kit";

export const PICTURE = [1.6, 1.75, 3.5];
const sidingTex = (key, w, h, base) => canvasTex("hs_siding_" + key, w, h, (c) => {
  c.fillStyle = base; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) {
    const g = c.createLinearGradient(0, y, 0, y + 16); g.addColorStop(0, "rgba(255,255,255,0.10)"); g.addColorStop(0.85, "rgba(0,0,0,0.04)"); g.addColorStop(1, "rgba(0,0,0,0.38)");
    c.fillStyle = g; c.fillRect(0, y, w, 16);
  }
  for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(0,0,0,${rnd(i) * 0.05})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 3, 1); }
});
const shingleTex = () => canvasTex("hs_shingle", 512, 512, (c, w, h) => {
  c.fillStyle = "#222B38"; c.fillRect(0, 0, w, h);
  for (let r = 0, y = 0; y < h; y += 18, r++) for (let x = (r % 2) * 20 - 20; x < w; x += 40) {
    const v = 26 + rnd(r * 31 + x) * 22; c.fillStyle = `rgb(${v},${v + 6},${v + 16})`; c.fillRect(x + 1, y, 38, 17);
    c.fillStyle = "rgba(0,0,0,0.45)"; c.fillRect(x, y + 15, 40, 3);
  }
});
// a lit window seen from outside: a warm room (lamp glow, a picture on the wall, a ceiling light), curtains drawn to the sides
const roomTex = (key, wide) => canvasTex("hs_room_" + key, wide ? 512 : 320, 320, (c, w, h) => {
  const g = c.createRadialGradient(w * 0.62, h * 0.42, 6, w * 0.55, h * 0.5, w * 0.8);
  g.addColorStop(0, "#FFF6EA"); g.addColorStop(0.3, "#F4DDBA"); g.addColorStop(0.75, "#B08A62"); g.addColorStop(1, "#5A4636");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(70,40,20,0.35)"; c.fillRect(w * 0.18, h * 0.22, w * 0.18, h * 0.2);           // a framed picture
  c.fillStyle = "rgba(255,236,200,0.55)"; c.fillRect(w * 0.195, h * 0.235, w * 0.15, h * 0.17);
  c.fillStyle = "rgba(60,36,18,0.55)"; c.fillRect(0, h * 0.78, w, h * 0.22);                       // furniture line
  // curtains: soft folds at each side, a valance
  for (const side of [0, 1]) {
    const x0 = side ? w * 0.8 : 0, cw = w * 0.2;
    for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? "rgba(226,224,220,0.92)" : "rgba(196,196,198,0.92)"; c.fillRect(x0 + k * cw / 6, 0, cw / 6 + 1, h); }
  }
  c.fillStyle = "rgba(200,186,164,0.95)"; c.fillRect(0, 0, w, h * 0.08);
});
const Window = ({ x, y, w, h, z, tex, lit = 1 }) => (
  <group position={[x, y, z]}>
    <mesh position={[0, 0, 0.0]}><planeGeometry args={[w, h]} /><meshBasicMaterial map={tex} color={new THREE.Color("#FFFFFF").multiplyScalar(0.55 + 0.45 * lit)} /></mesh>
    {/* the glass: a faint cool reflection over the room */}
    <mesh position={[0, 0, 0.012]}><planeGeometry args={[w, h]} /><meshStandardMaterial color="#9DB8DC" transparent opacity={0.10} roughness={0.05} metalness={0.6} depthWrite={false} /></mesh>
    {/* trim: casing, sill, the muntins */}
    {[[0, h / 2 + 0.07, w + 0.3, 0.14], [0, -h / 2 - 0.08, w + 0.42, 0.12]].map(([a, b, ww, hh], i) => <mesh key={i} position={[a, b, 0.04]} castShadow><boxGeometry args={[ww, hh, 0.12 + i * 0.08]} /><meshStandardMaterial color="#E4EAF2" roughness={0.6} /></mesh>)}
    {[-1, 1].map((sd) => <mesh key={sd} position={[sd * (w / 2 + 0.07), 0, 0.04]}><boxGeometry args={[0.14, h + 0.1, 0.12]} /><meshStandardMaterial color="#E4EAF2" roughness={0.6} /></mesh>)}
    <mesh position={[0, 0, 0.02]}><boxGeometry args={[w, 0.05, 0.04]} /><meshStandardMaterial color="#E4EAF2" roughness={0.6} /></mesh>
    {Array.from({ length: Math.round(w / 0.6) - 1 }, (_, k) => <mesh key={k} position={[-w / 2 + (k + 1) * w / Math.round(w / 0.6), 0, 0.02]}><boxGeometry args={[0.04, h, 0.04]} /><meshStandardMaterial color="#E4EAF2" roughness={0.6} /></mesh>)}
    {/* shutters */}
    {[-1, 1].map((sd) => <mesh key={"s" + sd} position={[sd * (w / 2 + 0.42), 0, 0.03]} castShadow><boxGeometry args={[0.5, h + 0.1, 0.05]} /><meshStandardMaterial color="#20344F" roughness={0.6} /></mesh>)}
  </group>
);
const gable = (w, h, d) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g; };
// a roof as two sloped slabs over a gable end
const Roof = ({ w, d, rise, y, tex, over = 0.45 }) => {
  const half = w / 2 + over, len = Math.hypot(half, rise), ang = Math.atan2(rise, half);
  return (
    <group position={[0, y, 0]}>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * half / 2, rise / 2, 0]} rotation-z={-sd * ang} castShadow receiveShadow>
          <boxGeometry args={[len, 0.12, d + over * 2]} />
          {[0, 1, 2, 3, 4, 5].map((i) => <meshStandardMaterial key={i} attach={`material-${i}`} map={i === 2 ? tex : null} color={i === 2 ? "#FFFFFF" : "#1A222E"} roughness={0.85} />)}
        </mesh>
      ))}
      <mesh position={[0, rise + 0.04, 0]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.09, 0.09, d + over * 2, 8]} /><meshStandardMaterial color="#1A222E" roughness={0.7} /></mesh>
    </group>
  );
};
export const House = ({ lit = 1, siding = "#6C7B92" }) => {
  const sid = useMemo(() => { const t = sidingTex(siding, 512, 256, siding); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 2); return t; }, [siding]);
  const sh = useMemo(() => { const t = shingleTex(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return t; }, []);
  const room1 = useMemo(() => roomTex("a", true), []), room2 = useMemo(() => roomTex("b", false), []);
  const gab = useMemo(() => gable(7.0, 2.2, 0.12), []);
  return (
    <group>
      {/* foundation, walls */}
      <mesh position={[0, 0.18, 0]} receiveShadow castShadow><boxGeometry args={[10.2, 0.36, 7.2]} /><meshStandardMaterial color="#56606E" roughness={0.9} /></mesh>
      <mesh position={[0, 1.83, 0]} castShadow receiveShadow><boxGeometry args={[10, 2.94, 7]} /><meshStandardMaterial map={sid} color="#FFFFFF" roughness={0.8} /></mesh>
      {/* gable ends with siding */}
      {[-1, 1].map((sd) => <mesh key={sd} geometry={gab} position={[sd * 4.96, 3.3, 0]} rotation-y={Math.PI / 2}><meshStandardMaterial color={siding} roughness={0.8} /></mesh>)}
      <group rotation-y={Math.PI / 2}><Roof w={7} d={10} rise={2.2} y={3.3} tex={sh} /></group>
      {/* chimney */}
      <mesh position={[-3.2, 5.0, -1.2]} castShadow><boxGeometry args={[0.8, 2.6, 0.8]} /><meshStandardMaterial color="#5A4A48" roughness={0.9} /></mesh>
      <mesh position={[-3.2, 6.35, -1.2]}><boxGeometry args={[0.95, 0.14, 0.95]} /><meshStandardMaterial color="#3E4654" roughness={0.8} /></mesh>
      {/* fascia + gutter along the front eave */}
      <mesh position={[0, 3.25, 3.85]} castShadow><boxGeometry args={[10.9, 0.18, 0.16]} /><meshStandardMaterial color="#E4EAF2" roughness={0.6} /></mesh>
      {/* windows, door, porch */}
      <Window x={-3.0} y={1.75} w={1.5} h={1.3} z={3.52} tex={room2} lit={lit} />
      <Window x={PICTURE[0]} y={PICTURE[1]} w={2.6} h={1.45} z={3.52} tex={room1} lit={lit} />
      <mesh position={[-0.8, 1.42, 3.53]} castShadow><boxGeometry args={[1.0, 2.1, 0.08]} /><meshStandardMaterial color="#1F3554" roughness={0.45} /></mesh>
      <mesh position={[-0.8, 2.55, 3.55]}><boxGeometry args={[1.3, 0.14, 0.12]} /><meshStandardMaterial color="#E4EAF2" roughness={0.6} /></mesh>
      {[-1, 1].map((sd) => <mesh key={sd} position={[-0.8 + sd * 0.58, 1.42, 3.55]}><boxGeometry args={[0.14, 2.2, 0.12]} /><meshStandardMaterial color="#E4EAF2" roughness={0.6} /></mesh>)}
      <mesh position={[-0.45, 1.4, 3.6]}><sphereGeometry args={[0.05, 10, 8]} /><meshStandardMaterial color="#D8B060" metalness={0.9} roughness={0.3} /></mesh>
      {/* porch: a small roof on two posts, a slab and steps, the porch light */}
      <mesh position={[-0.8, 2.85, 4.4]} rotation-x={0.18} castShadow><boxGeometry args={[2.4, 0.12, 1.9]} /><meshStandardMaterial color="#2A3442" roughness={0.8} /></mesh>
      {[-1, 1].map((sd) => <mesh key={sd} position={[-0.8 + sd * 1.05, 1.5, 5.15]} castShadow><boxGeometry args={[0.14, 2.7, 0.14]} /><meshStandardMaterial color="#E4EAF2" roughness={0.6} /></mesh>)}
      <mesh position={[-0.8, 0.24, 4.6]} receiveShadow castShadow><boxGeometry args={[2.4, 0.2, 1.6]} /><meshStandardMaterial color="#5E6878" roughness={0.85} /></mesh>
      <mesh position={[-0.8, 0.08, 5.6]} receiveShadow><boxGeometry args={[1.6, 0.16, 0.5]} /><meshStandardMaterial color="#5E6878" roughness={0.85} /></mesh>
      <mesh position={[0.1, 2.3, 3.62]}><cylinderGeometry args={[0.08, 0.1, 0.26, 8]} /><meshStandardMaterial color="#FFE7BE" emissive="#FFC27A" emissiveIntensity={2.4} /></mesh>
      <Glow position={[0.1, 2.3, 3.75]} size={1.6} color="#FFC27A" opacity={0.75} />
      {/* the attached garage: lower roof, a panelled door */}
      <group position={[7.6, 0, 0.5]}>
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow><boxGeometry args={[5.2, 2.8, 6]} /><meshStandardMaterial map={sid} color="#FFFFFF" roughness={0.8} /></mesh>
        <mesh position={[0, 2.95, 0]} castShadow><boxGeometry args={[5.8, 0.22, 6.8]} /><meshStandardMaterial color="#26303D" roughness={0.85} /></mesh>
        <mesh position={[0, 1.15, 3.02]}><planeGeometry args={[3.8, 2.2]} /><meshStandardMaterial map={useMemo(() => canvasTex("hs_garage", 256, 160, (c, w, h) => { c.fillStyle = "#D5DDE8"; c.fillRect(0, 0, w, h); c.strokeStyle = "rgba(40,60,90,0.35)"; c.lineWidth = 3; for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) c.strokeRect(8 + k * 61, 6 + r * 38, 54, 30); }), [])} roughness={0.6} /></mesh>
      </group>
      {/* shrubs under the windows */}
      {[-4.1, -2.0, 3.6, 0.2].map((x, i) => <mesh key={i} position={[x, 0.45, 4.1]} scale={[1.2, 0.8, 0.8]} castShadow><icosahedronGeometry args={[0.6, 1]} /><meshStandardMaterial color="#1F3A4E" roughness={0.95} flatShading /></mesh>)}
    </group>
  );
};
