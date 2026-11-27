// @ts-nocheck
// ★ V39 builder C — THE VAULT'S ROUND DOORWAY (station `vault`, detail pass 2026-11-27): the camera's first shot now looks INTO the
//   vault through its open round door's jamb and pushes through it (the camera path is unchanged: the ring sits across it, so it frames
//   the wall of boxes at the start and passes the lens by ~1165; the camera is inside the tunnel from ~1300). Station-local metres.
//   · the lobby side: polished blue-pearl granite panels with joints, a polished stainless bezel round the opening (a stepped ring with
//     a rolled lip), the opening's machined tunnel (the jamb) with the gasket groove and the 18 bolt sockets the door's locking bolts
//     throw into, a steel threshold bridge with a diamond-plate tread and a two-step block outside.
//   · the door LEAF stands open on its hinge at the left of the opening, swung back against the granite (inner face out: the boltwork
//     under its glass cover, the time-lock dials, the 18 thrown bolts). Every shot looks down the narrow wedge past it, so only its
//     hinge side reaches the left edge of the first frames; the jamb's bolt sockets are what the camera passes.
//   Nothing here casts shadows (the key light comes from the lobby side: the wall would black out the vault).
import React, { useMemo } from "react";
import * as THREE from "three";
import { rnd } from "./kit";
import { tileTex, brushedTex } from "./c_tex";

export const RING = { x: 0.98, y: 1.25, r: 0.95, z0: 0.45, z1: -0.1 };   // centre, opening radius, the lobby face and the vault face
const graniteDraw = (c, w, h) => {
  c.fillStyle = "#1A2230"; c.fillRect(0, 0, w, h);
  const fl = ["rgba(90,110,140,0.55)", "rgba(10,14,22,0.6)", "rgba(150,170,200,0.35)", "rgba(60,74,96,0.6)", "rgba(200,214,232,0.25)"];
  for (let i = 0; i < 30000; i++) { c.fillStyle = fl[Math.floor(rnd(i + 3) * fl.length)]; const s = 1.5 + rnd(i + 7) * 5; c.beginPath(); c.ellipse(rnd(i * 3 + 1) * w, rnd(i * 5 + 2) * h, s, s * (0.5 + rnd(i) * 0.6), rnd(i + 9) * 3, 0, Math.PI * 2); c.fill(); }
  // blue-pearl feldspar flecks that catch the light
  for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(120,170,235,${0.25 + rnd(i + 5) * 0.35})`; c.fillRect(rnd(i * 7) * w, rnd(i * 11) * h, 3 + rnd(i) * 5, 2); }
  // panel joints (the tile is one 1.2 m × 0.9 m panel)
  c.fillStyle = "#06090E"; c.fillRect(0, 0, w, 3); c.fillRect(0, 0, 3, h);
  c.fillStyle = "rgba(160,180,210,0.25)"; c.fillRect(0, 3, w, 1); c.fillRect(3, 0, 1, h);
};
const diamondDraw = (c, w, h) => {
  c.fillStyle = "#7D8794"; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 16 : 0; x < w; x += 32) {
    c.save(); c.translate(x + 8, y + 8); c.rotate(((x + y) / 32) % 2 ? 0.78 : -0.78);
    c.fillStyle = "#B8C2CE"; c.fillRect(-11, -2.5, 22, 5); c.fillStyle = "rgba(20,26,34,0.6)"; c.fillRect(-11, 2.5, 22, 1.5); c.restore();
  }
};
// ── the door leaf, standing open on its hinge at the left of the opening (lobby side), its inner face — the boltwork under its
//    glass cover, the time locks — turned toward the room; only its hinge side reaches into the first frames (a cropped FG piece) ──
export const LEAF = { hx: RING.x - RING.r - 0.27, hz: RING.z0 + 0.2, open: 2.95, R: 1.12, plug: 0.93 };
const Leaf = ({ M }) => {
  const R = LEAF.R, P = LEAF.plug, off = RING.x - LEAF.hx;   // closed, the leaf's centre would sit on the opening's axis
  const boltA = useMemo(() => Array.from({ length: 18 }, (_, i) => (i / 18) * Math.PI * 2 + Math.PI / 18), []);
  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#D6E6F8", transparent: true, opacity: 0.16, roughness: 0.03, clearcoat: 1, depthWrite: false, envMapIntensity: 1.4 }), []);
  const dial = useMemo(() => new THREE.MeshStandardMaterial({ map: (() => { const cv = document.createElement("canvas"); cv.width = 256; cv.height = 256; const c = cv.getContext("2d"); c.fillStyle = "#EEF1F4"; c.fillRect(0, 0, 256, 256); c.fillStyle = "#1A2230"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = "600 22px sans-serif"; for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2 - Math.PI / 2; if (k % 3 === 0) c.fillText(String(k / 3 * 9 || 72), 128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92); c.fillRect(128 + Math.cos(a) * 112 - 2, 128 + Math.sin(a) * 112 - 2, 4, 4); } c.beginPath(); c.arc(128, 128, 10, 0, Math.PI * 2); c.fill(); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; })(), roughness: 0.4 }), []);
  return (
    <group position={[LEAF.hx, RING.y, LEAF.hz]} rotation-y={-LEAF.open}>
      {/* the hinge: a knuckle column on the frame side and the leaf's arm */}
      <mesh material={M.polish} castShadow={false}><cylinderGeometry args={[0.075, 0.075, 1.5, 28]} /></mesh>
      {[-0.62, 0, 0.62].map((y, i) => <mesh key={i} position={[0, y, 0]} material={M.polish}><cylinderGeometry args={[0.095, 0.095, 0.12, 28]} /></mesh>)}
      {[-0.66, 0.66].map((y, i) => <mesh key={i} position={[0, y + Math.sign(y) * 0.1, 0]} material={M.polish}><sphereGeometry args={[0.07, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>)}
      {[-0.4, 0.4].map((y, i) => <mesh key={i} position={[off - R - 0.03, y, -0.08]} material={M.steel}><boxGeometry args={[0.26, 0.16, 0.12]} /></mesh>)}
      <group position={[off, 0, 0]}>
        {/* the outer slab (lobby face, at local z 0 … −0.16) and the plug that seats in the jamb (−0.16 … −0.70) */}
        <mesh position={[0, 0, -0.08]} rotation-x={Math.PI / 2} material={M.steel}><cylinderGeometry args={[R, R, 0.16, 96]} /></mesh>
        <mesh position={[0, 0, -0.43]} rotation-x={Math.PI / 2} material={M.polish}><cylinderGeometry args={[P, P, 0.54, 96]} /></mesh>
        <mesh position={[0, 0, -0.16]} material={M.polish}><torusGeometry args={[P + 0.01, 0.012, 8, 96]} /></mesh>
        {/* the locking bolts, thrown out of the plug's rim */}
        {boltA.map((a, i) => (
          <group key={i} position={[Math.cos(a) * (P + 0.05), Math.sin(a) * (P + 0.05), -0.45]} rotation-z={a - Math.PI / 2}>
            <mesh material={M.polish}><cylinderGeometry args={[0.032, 0.032, 0.12, 18]} /></mesh>
            <mesh position={[0, 0.06, 0]} material={M.polish}><sphereGeometry args={[0.032, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
          </group>
        ))}
        {/* the inner face (local −z): the boltwork plate — bars from the central hub to each bolt — the time-lock case, the glass cover */}
        <group position={[0, 0, -0.705]} rotation-y={Math.PI}>
          <mesh material={M.plate}><circleGeometry args={[P - 0.02, 96]} /></mesh>
          {boltA.map((a, i) => <mesh key={i} position={[Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0.012]} rotation-z={a} material={M.polish}><boxGeometry args={[0.66, 0.034, 0.014]} /></mesh>)}
          <mesh position={[0, 0, 0.03]} rotation-x={Math.PI / 2} material={M.polish}><cylinderGeometry args={[0.16, 0.16, 0.05, 40]} /></mesh>
          <mesh position={[0, 0, 0.06]} rotation-x={Math.PI / 2} material={M.steel}><cylinderGeometry args={[0.06, 0.06, 0.03, 24]} /></mesh>
          <group position={[0, 0.42, 0.05]}>
            <mesh material={M.steel}><boxGeometry args={[0.5, 0.18, 0.08]} /></mesh>
            {[-0.15, 0, 0.15].map((x, i) => <mesh key={i} position={[x, 0, 0.041]} material={dial}><circleGeometry args={[0.055, 32]} /></mesh>)}
          </group>
          <mesh position={[0, 0, 0.1]} material={glass} renderOrder={3}><circleGeometry args={[P - 0.04, 96]} /></mesh>
        </group>
      </group>
    </group>
  );
};
export const VaultFront = () => {
  const R = RING.r, D = RING.z0 - RING.z1;
  const mats = useMemo(() => {
    const granite = tileTex("vgranite", 1024, 768, graniteDraw, true, [1, 1]);
    const g = new THREE.MeshPhysicalMaterial({ map: granite, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.06, color: "#FFFFFF", envMapIntensity: 0.8 });
    const st = brushedTex("vjamb", "#9AA6B4", [6, 1]);
    return {
      granite: g,
      polish: new THREE.MeshStandardMaterial({ color: "#DDE4EC", metalness: 0.95, roughness: 0.12 }),
      jamb: new THREE.MeshStandardMaterial({ map: st, color: "#FFFFFF", metalness: 0.85, roughness: 0.26, side: THREE.BackSide }),
      socket: new THREE.MeshStandardMaterial({ color: "#07090C", roughness: 0.7 }),
      groove: new THREE.MeshStandardMaterial({ color: "#14181E", roughness: 0.6 }),
      steel: new THREE.MeshStandardMaterial({ map: brushedTex("vleaf", "#A4AFBC", [2, 2]), color: "#FFFFFF", metalness: 0.88, roughness: 0.24 }),
      plate: new THREE.MeshStandardMaterial({ map: brushedTex("vleafp", "#B8C2CE", [1, 1], true), color: "#FFFFFF", metalness: 0.9, roughness: 0.18 }),
      tread: new THREE.MeshStandardMaterial({ map: tileTex("vdiamond", 256, 256, diamondDraw, true, [6, 2]), color: "#FFFFFF", metalness: 0.8, roughness: 0.35 }),
    };
  }, []);
  const geo = useMemo(() => {
    // the wall's lobby face: a big panel with the round hole (UVs in metres → panels 1.2 × 0.9 m)
    const sh = new THREE.Shape(); sh.moveTo(-4, 0); sh.lineTo(5, 0); sh.lineTo(5, 3.4); sh.lineTo(-4, 3.4); sh.closePath();
    const hole = new THREE.Path(); hole.absarc(RING.x, RING.y, R + 0.2, 0, Math.PI * 2, true); sh.holes.push(hole);
    const face = new THREE.ShapeGeometry(sh, 64);
    const uv = face.attributes.uv, pos = face.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 1.2, pos.getY(i) / 0.9);
    // the stainless bezel: a flat ring (R+0.03 … R+0.2), a rolled lip at the opening and a step at its outer edge
    const bez = new THREE.RingGeometry(R + 0.03, R + 0.2, 96, 1);
    const tunnel = new THREE.CylinderGeometry(R, R, D, 96, 1, true).rotateX(Math.PI / 2);
    return { face, bez, tunnel };
  }, []);
  const zc = (RING.z0 + RING.z1) / 2;
  const sockets = useMemo(() => Array.from({ length: 18 }, (_, i) => (i / 18) * Math.PI * 2 + Math.PI / 18), []);
  return (
    <group>
      <mesh geometry={geo.face} material={mats.granite} position={[0, 0, RING.z0]} receiveShadow />
      <Leaf M={mats} />
      {/* the vault side of the wall (dark steel lining), never seen face-on */}
      <mesh geometry={geo.face} position={[0, 0, RING.z1]} rotation-y={Math.PI} scale={[-1, 1, 1]}><meshStandardMaterial color="#2A3546" roughness={0.6} metalness={0.5} side={THREE.DoubleSide} /></mesh>
      <group position={[RING.x, RING.y, RING.z0 + 0.004]}>
        <mesh geometry={geo.bez} material={mats.polish} />
        <mesh rotation-x={0} material={mats.polish}><torusGeometry args={[R + 0.012, 0.018, 12, 128]} /></mesh>
        <mesh material={mats.polish} position={[0, 0, 0.006]}><torusGeometry args={[R + 0.2, 0.01, 8, 128]} /></mesh>
        {/* a ring of polished bolt heads holding the bezel */}
        {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * (R + 0.15), Math.sin(a) * (R + 0.15), 0.006]} rotation-x={Math.PI / 2} material={mats.polish}><cylinderGeometry args={[0.012, 0.014, 0.01, 6]} /></mesh>; })}
      </group>
      {/* the jamb: the machined tunnel, the gasket groove near the lobby face, the bolt sockets at mid-depth */}
      <mesh geometry={geo.tunnel} material={mats.jamb} position={[RING.x, RING.y, zc]} />
      <mesh position={[RING.x, RING.y, RING.z0 - 0.07]} material={mats.groove}><torusGeometry args={[R + 0.001, 0.008, 6, 128]} /></mesh>
      <mesh position={[RING.x, RING.y, RING.z1 + 0.05]} material={mats.polish}><torusGeometry args={[R - 0.004, 0.01, 8, 128]} /></mesh>
      {sockets.map((a, i) => (
        <group key={i} position={[RING.x + Math.cos(a) * R, RING.y + Math.sin(a) * R, zc + 0.03]} rotation-z={a - Math.PI / 2}>
          <mesh material={mats.socket} position={[0, 0.002, 0]}><cylinderGeometry args={[0.034, 0.034, 0.006, 20]} /></mesh>
          <mesh material={mats.polish} position={[0, -0.0005, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[0.036, 0.005, 6, 24]} /></mesh>
        </group>
      ))}
      {/* the threshold bridge across the bottom of the opening and the two-step block on the lobby side */}
      <mesh position={[RING.x, RING.y - R + 0.012, zc]} material={mats.tread} receiveShadow><boxGeometry args={[0.62, 0.024, D + 0.02]} /></mesh>
      {[[0.2, RING.z0 + 0.15, 0.3], [0.1, RING.z0 + 0.45, 0.3]].map(([hh, z, dd], i) => (
        <group key={i}>
          <mesh position={[RING.x, hh / 2, z]} material={mats.tread} receiveShadow><boxGeometry args={[0.7, hh, dd]} /></mesh>
          <mesh position={[RING.x, hh, z + dd / 2]} rotation-z={Math.PI / 2} material={mats.polish}><cylinderGeometry args={[0.008, 0.008, 0.7, 8]} /></mesh>
        </group>
      ))}
    </group>
  );
};
