// @ts-nocheck
// ★ V39 builder C — THE DOCUMENT BOX the certificates come out of (station `shares`, rev 2026-11-27; Timur: "the stock certificates
//   kept in a safe place … it's just a blind brown box. Make it realistic … the certificates must come out of an actual spot").
//   A steel home document box (the kind kept in a closet for deeds and stock certificates): hammertone grey-blue powder coat, a rolled
//   rim, a felt-lined floor, a piano hinge along the back, a lid with a turned-down skirt, a flat folding carry handle on top and a hasp
//   at the front, a chrome key lock with its key still in it (a key ring and a paper tag), folding wire handles at both ends, rubber
//   feet, and a chrome card holder on the front with a typed card: STOCK CERTIFICATES. Generic (no maker's name).
//   Its LID opens as the scene arrives and the certificates are lifted out of it one by one, top first (c_shares sheetPose).
//   Box-local: origin at the centre of its footprint on the table, +z = its front (toward the camera), y up.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { canvasTex, rnd } from "./kit";
import { SANSF, tileTex } from "./c_tex";

export const DBOX = { x: 0.13, z: -0.27, ry: 0.1, w: 0.36, d: 0.26, h: 0.11, wall: 0.006, floor: 0.008, open: 1.85 };
const hammerDraw = (c, w, h) => {   // hammertone: a mottled metallic powder coat
  c.fillStyle = "#566676"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) { const x = rnd(i * 3) * w, y = rnd(i * 5) * h, r = 2 + rnd(i) * 7; const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); g.addColorStop(0, `rgba(205,218,232,${0.12 + rnd(i + 1) * 0.12})`); g.addColorStop(0.6, "rgba(120,136,152,0.05)"); g.addColorStop(1, "rgba(20,28,38,0.18)"); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
};
const cardDraw = (c, w, h) => {   // the typed card in the front holder
  c.fillStyle = "#F1EBDA"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 1600; i++) { c.fillStyle = `rgba(120,100,70,${0.03 + rnd(i) * 0.05})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  c.strokeStyle = "rgba(170,60,50,0.55)"; c.lineWidth = 2; c.beginPath(); c.moveTo(0, h * 0.26); c.lineTo(w, h * 0.26); c.stroke();
  c.strokeStyle = "rgba(80,110,170,0.35)"; c.lineWidth = 1.5; for (let y = h * 0.5; y < h; y += h * 0.22) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  c.fillStyle = "#1E2230"; c.textAlign = "center"; c.textBaseline = "alphabetic";
  let px = h * 0.34; const mono = `"Liberation Mono", "DejaVu Sans Mono", monospace`;
  c.font = `700 ${px}px ${mono}`; while (c.measureText("STOCK CERTIFICATES").width > w * 0.9 && px > 10) { px -= 2; c.font = `700 ${px}px ${mono}`; }
  c.fillText("STOCK CERTIFICATES", w / 2, h * 0.64);
};
const tagDraw = (c, w, h) => { c.fillStyle = "#E9DFC6"; c.fillRect(0, 0, w, h); c.fillStyle = "#1E2230"; c.textAlign = "center"; c.font = `700 ${h * 0.26}px ${SANSF}`; c.fillText("BOX KEY", w / 2, h * 0.62); c.fillStyle = "#B8AE98"; c.beginPath(); c.arc(w * 0.12, h / 2, h * 0.12, 0, Math.PI * 2); c.fill(); };
export const DocBox = ({ open }) => {
  const { w, d, h, wall } = DBOX;
  const M = useMemo(() => {
    const ham = tileTex("dbham", 512, 512, hammerDraw, true, [1.5, 1.5]);
    return {
      shell: new THREE.MeshPhysicalMaterial({ map: ham, bumpMap: ham, bumpScale: 1.2, color: "#FFFFFF", metalness: 0.55, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
      inside: new THREE.MeshStandardMaterial({ color: "#8E9BA8", metalness: 0.4, roughness: 0.5 }),
      felt: new THREE.MeshStandardMaterial({ map: tileTex("dbfelt", 128, 128, (c, ww, hh) => { c.fillStyle = "#1F3A2E"; c.fillRect(0, 0, ww, hh); for (let i = 0; i < 2000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "90,130,110" : "0,10,5"},0.2)`; c.fillRect(rnd(i + 1) * ww, rnd(i + 2) * hh, 1, 1); } }, true, [4, 3]), roughness: 1 }),
      chrome: new THREE.MeshStandardMaterial({ color: "#DCE3EA", metalness: 0.95, roughness: 0.14 }),
      brass: new THREE.MeshStandardMaterial({ color: "#C9A866", metalness: 0.9, roughness: 0.25 }),
      dark: new THREE.MeshStandardMaterial({ color: "#0A0C10", roughness: 0.6 }),
      rubber: new THREE.MeshStandardMaterial({ color: "#16181C", roughness: 0.9 }),
      card: new THREE.MeshStandardMaterial({ map: canvasTex("c_db_card", 1024, 300, cardDraw), roughness: 0.8 }),
      tag: new THREE.MeshStandardMaterial({ map: canvasTex("c_db_tag", 256, 128, tagDraw), roughness: 0.85, side: THREE.DoubleSide }),
    };
  }, []);
  const g = useMemo(() => ({
    lidTop: new RoundedBoxGeometry(w + 0.006, 0.012, d + 0.006, 3, 0.004),
    rib: new RoundedBoxGeometry(w * 0.82, 0.004, d * 0.7, 2, 0.002),
  }), []);
  const ang = -DBOX.open * open;
  const T = wall;
  return (
    <group position={[DBOX.x, 0, DBOX.z]} rotation-y={DBOX.ry}>
      {/* ── the body: floor, four walls (painted outside, light grey inside), a rolled rim, the felt liner ── */}
      <mesh position={[0, 0.004, 0]} material={M.shell} castShadow receiveShadow><boxGeometry args={[w, 0.004, d]} /></mesh>
      <mesh position={[0, DBOX.floor - 0.001, 0]} material={M.felt} receiveShadow><boxGeometry args={[w - 2 * T, 0.002, d - 2 * T]} /></mesh>
      {[[0, d / 2 - T / 2, w, T], [0, -d / 2 + T / 2, w, T]].map(([x, z, L, t], i) => (
        <group key={"fb" + i}>
          <mesh position={[x, h / 2, z + (i ? -0.0005 : 0.0005)]} material={M.shell} castShadow receiveShadow><boxGeometry args={[L, h, t * 0.5]} /></mesh>
          <mesh position={[x, h / 2, z + (i ? 0.0015 : -0.0015)]} material={M.inside} receiveShadow><boxGeometry args={[L - 2 * T, h - 0.004, t * 0.5]} /></mesh>
        </group>
      ))}
      {[[w / 2 - T / 2], [-w / 2 + T / 2]].map(([x], i) => (
        <group key={"s" + i}>
          <mesh position={[x + (i ? -0.0005 : 0.0005), h / 2, 0]} material={M.shell} castShadow receiveShadow><boxGeometry args={[T * 0.5, h, d]} /></mesh>
          <mesh position={[x + (i ? 0.0015 : -0.0015), h / 2, 0]} material={M.inside} receiveShadow><boxGeometry args={[T * 0.5, h - 0.004, d - 2 * T]} /></mesh>
        </group>
      ))}
      {[[0, d / 2, w, 0], [0, -d / 2, w, 0]].map(([x, z, L], i) => <mesh key={"r" + i} position={[x, h, z]} rotation-z={Math.PI / 2} material={M.shell}><cylinderGeometry args={[0.0035, 0.0035, L, 8]} /></mesh>)}
      {[w / 2, -w / 2].map((x, i) => <mesh key={"rs" + i} position={[x, h, 0]} rotation-x={Math.PI / 2} material={M.shell}><cylinderGeometry args={[0.0035, 0.0035, d, 8]} /></mesh>)}
      {/* rubber feet */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => <mesh key={"f" + i} position={[sx * (w / 2 - 0.02), 0.001, sz * (d / 2 - 0.02)]} material={M.rubber}><cylinderGeometry args={[0.009, 0.01, 0.004, 12]} /></mesh>)}
      {/* ── the front: the chrome card holder with its typed card, the key lock with the key in it, its ring and tag ── */}
      <group position={[-0.035, h * 0.42, d / 2 + 0.0008]}>
        <mesh material={M.card}><planeGeometry args={[0.15, 0.044]} /></mesh>
        {[[0, -0.024, 0.162, 0.005], [0, 0.0235, 0.162, 0.003]].map(([x, y, L, t], i) => <mesh key={i} position={[x, y, 0.0015]} material={M.chrome}><boxGeometry args={[L, t, 0.003]} /></mesh>)}
        {[-1, 1].map((s) => <mesh key={s} position={[s * 0.079, -0.002, 0.0015]} material={M.chrome}><boxGeometry args={[0.005, 0.046, 0.003]} /></mesh>)}
        {[-1, 1].map((s) => <mesh key={"rv" + s} position={[s * 0.074, -0.0245, 0.0035]} material={M.chrome}><sphereGeometry args={[0.0022, 8, 6]} /></mesh>)}
      </group>
      <group position={[0.12, h - 0.024, d / 2 + 0.001]}>
        <mesh rotation-x={Math.PI / 2} material={M.chrome}><cylinderGeometry args={[0.011, 0.012, 0.006, 24]} /></mesh>
        <mesh position={[0, 0, 0.0032]} rotation-x={Math.PI / 2} material={M.brass}><cylinderGeometry args={[0.0072, 0.0072, 0.001, 20]} /></mesh>
        {/* the key, turned to open: its blade in the plug, the bow standing out, the split ring and the paper tag hanging */}
        <group position={[0, 0, 0.004]} rotation-z={Math.PI / 2}>
          <mesh position={[0, 0, 0.006]} material={M.brass}><boxGeometry args={[0.0025, 0.007, 0.012]} /></mesh>
          <mesh position={[0, 0, 0.018]} rotation-y={Math.PI / 2} material={M.brass}><torusGeometry args={[0.0085, 0.0035, 8, 20]} /></mesh>
        </group>
        <mesh position={[0, -0.013, 0.02]} rotation-x={0.3} material={M.chrome}><torusGeometry args={[0.009, 0.0012, 6, 20]} /></mesh>
        <mesh position={[0.008, -0.04, 0.024]} rotation={[0.15, 0.25, 0.12]} material={M.tag}><planeGeometry args={[0.04, 0.02]} /></mesh>
      </group>
      {/* folding wire handles at both ends */}
      {[1, -1].map((s) => (
        <group key={"hd" + s} position={[s * (w / 2 + 0.004), h * 0.72, 0]}>
          {[-0.035, 0.035].map((z, i) => <mesh key={i} position={[0, 0, z]} rotation-z={Math.PI / 2} material={M.chrome}><cylinderGeometry args={[0.005, 0.005, 0.008, 10]} /></mesh>)}
          <mesh position={[s * 0.004, -0.018, 0]} rotation-y={Math.PI / 2} rotation-z={Math.PI} material={M.chrome}><torusGeometry args={[0.035, 0.0026, 6, 24, Math.PI]} /></mesh>
        </group>
      ))}
      {/* the piano hinge along the back top edge */}
      <mesh position={[0, h + 0.002, -d / 2 - 0.002]} rotation-z={Math.PI / 2} material={M.chrome}><cylinderGeometry args={[0.0042, 0.0042, w - 0.01, 12]} /></mesh>
      {Array.from({ length: 12 }, (_, i) => <mesh key={"k" + i} position={[-w / 2 + 0.02 + i * ((w - 0.04) / 11), h + 0.002, -d / 2 - 0.002]} rotation-z={Math.PI / 2} material={M.dark}><cylinderGeometry args={[0.0044, 0.0044, 0.0012, 12]} /></mesh>)}
      {/* ── the lid, hinged at the back: top with a pressed panel, a skirt all round, the folding carry handle, the hasp ── */}
      <group position={[0, h + 0.002, -d / 2 - 0.002]} rotation-x={ang}>
        <group position={[0, 0.004, d / 2 + 0.002]}>
          <mesh geometry={g.lidTop} position={[0, 0.002, 0]} material={M.shell} castShadow receiveShadow />
          <mesh geometry={g.rib} position={[0, 0.0095, 0]} material={M.shell} castShadow />
          <mesh position={[0, -0.0045, 0]} rotation-x={Math.PI / 2} material={M.inside}><planeGeometry args={[w - 0.01, d - 0.01]} /></mesh>
          {/* the skirt (it hangs over the rim when the lid is shut) */}
          {[[0, d / 2 + 0.001, w + 0.006, 0.002], [0, -d / 2 - 0.001, w + 0.006, 0.002]].map(([x, z, L, t], i) => <mesh key={"sk" + i} position={[x, -0.008, z]} material={M.shell} castShadow><boxGeometry args={[L, 0.02, t]} /></mesh>)}
          {[w / 2 + 0.002, -w / 2 - 0.002].map((x, i) => <mesh key={"ss" + i} position={[x, -0.008, 0]} material={M.shell}><boxGeometry args={[0.002, 0.02, d + 0.006]} /></mesh>)}
          {/* the carry handle, folded flat in its two pivots */}
          {[-0.06, 0.06].map((x, i) => <mesh key={"p" + i} position={[x, 0.014, 0]} material={M.chrome}><boxGeometry args={[0.014, 0.008, 0.018]} /></mesh>)}
          <mesh position={[0, 0.016, 0.02]} rotation-z={Math.PI / 2} material={M.chrome} castShadow><cylinderGeometry args={[0.0045, 0.0045, 0.11, 12]} /></mesh>
          {[-0.055, 0.055].map((x, i) => <mesh key={"a" + i} position={[x, 0.016, 0.01]} rotation-x={Math.PI / 2} material={M.chrome}><cylinderGeometry args={[0.003, 0.003, 0.022, 8]} /></mesh>)}
          {/* the hasp on the front skirt */}
          <mesh position={[0.12, -0.016, d / 2 + 0.004]} material={M.chrome}><boxGeometry args={[0.03, 0.026, 0.003]} /></mesh>
          <mesh position={[0.12, -0.024, d / 2 + 0.006]} material={M.dark}><boxGeometry args={[0.012, 0.005, 0.002]} /></mesh>
        </group>
      </group>
    </group>
  );
};
