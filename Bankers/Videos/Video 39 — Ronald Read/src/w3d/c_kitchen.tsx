// @ts-nocheck
// ★ V39 builder C — HIS KITCHEN (station `shares`, detail pass 2026-11-27): a modest Vermont kitchen at night. Metres; floor y 0; the
//   table top at y KT; the back wall's face at z KWALL. Everything here is generic (nothing claimed about his house).
//   · the table: oak planks with breadboard ends and eased edges on an apron, four turned legs (lathe profile)
//   · two spindle-back kitchen chairs pushed in at the far side and the left end (turned legs, stretchers, a saddle seat, a top rail)
//   · the wall: beadboard wainscot with a chair rail and a cap, a small-print wallpaper above, a baseboard
//   · the window: a double-hung sash window (six over six: muntins, the meeting rail, sash lifts and a lock), casing, sill and apron,
//     café curtains on a rod and a valance; outside, the blue winter night (a neighbour's clapboard house with snow on its roof and
//     lit windows, snowy spruces, a bare maple, a fence in the snow)
//   · a cast-iron radiator under the window, a wall clock, painted base and wall cabinets with a laminate counter and backsplash tile
//     on the right
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { canvasTex, rnd } from "./kit";
import { SANSF, woodTex, noiseTex, tileTex } from "./c_tex";
import { conifer, maple, house, snowGround } from "./c_scenery";

export const KT = 0.76, KWALL = -0.95;
const WX0 = -0.55, WX1 = 0.45, WY0 = 1.05, WY1 = 1.95;

const yardDraw = (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#061732"); g.addColorStop(0.5, "#0E3468"); g.addColorStop(0.72, "#2A5C9C"); g.addColorStop(1, "#14305A");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(220,232,250,${0.2 + rnd(i) * 0.5})`; c.fillRect(rnd(i + 3) * w, rnd(i + 7) * h * 0.35, 2, 2); }
  snowGround(c, w, h * 0.78, h);
  for (let k = 0; k < 5; k++) conifer(c, w * (0.02 + k * 0.08), h * 0.8, h * (0.32 + rnd(k) * 0.12), h * 0.18, k + 7, { dark: "#091A33", mid: "#102646", snow: "#BFD0E8" });
  house(c, w * 0.3, h * 0.86, w * 0.5, h * 0.3, 21, { wall: "#1D3A62", lit: 0.7 });
  conifer(c, w * 0.9, h * 0.88, h * 0.5, h * 0.24, 99, { dark: "#08162C", mid: "#0E2240", snow: "#C6D6EC" });
  // the fence in the snow, snow on its rail
  c.fillStyle = "#1F3A62"; for (let x = 0; x < w; x += 26) c.fillRect(x, h * 0.86, 12, h * 0.08); c.fillRect(0, h * 0.875, w, 5);
  c.fillStyle = "#C9D8EC"; c.fillRect(0, h * 0.872, w, 3); for (let x = 0; x < w; x += 26) c.fillRect(x - 1, h * 0.858, 14, 3);
  maple(c, w * 0.78, h, h * 0.75, 12, { col: "#050F22" });
};
const wallpaperDraw = (c, w, h) => {   // a small sprig print in muted blue on a pale ground (the room's lamp warms it)
  c.fillStyle = "#4F6684"; c.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 64) { c.fillStyle = "rgba(255,255,255,0.05)"; c.fillRect(x, 0, 3, h); }
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
    const x = i * 64 + (j % 2) * 32 + 16, y = j * 64 + 20;
    c.strokeStyle = "rgba(205,215,230,0.35)"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y + 14); c.quadraticCurveTo(x + 2, y + 4, x, y - 6); c.stroke();
    c.fillStyle = "rgba(205,215,230,0.35)"; [[-5, 0], [5, 4], [-4, 8]].forEach(([dx, dy]) => { c.beginPath(); c.ellipse(x + dx, y + dy, 4, 2, dx > 0 ? 0.6 : -0.6, 0, Math.PI * 2); c.fill(); });
    c.fillStyle = "rgba(230,200,170,0.4)"; c.beginPath(); c.arc(x, y - 7, 2.5, 0, Math.PI * 2); c.fill();
  }
};
const beadDraw = (c, w, h) => { c.fillStyle = "#D9DED8"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { c.fillStyle = "rgba(40,50,60,0.45)"; c.fillRect(x, 0, 2, h); c.fillStyle = "rgba(255,255,255,0.4)"; c.fillRect(x + 2, 0, 2, h); c.fillStyle = "rgba(40,50,60,0.12)"; c.fillRect(x + 4, 0, 6, h); } };
const tileDraw = (c, w, h) => { c.fillStyle = "#B9C6D4"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 0 : 32; x < w + 32; x += 64) { c.fillStyle = "#EEF2F5"; c.fillRect(x - 31, y + 1, 62, 30); c.fillStyle = "rgba(255,255,255,0.5)"; c.fillRect(x - 31, y + 1, 62, 3); } };
const linoDraw = (c, w, h) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? "#2C3C54" : "#6E7E92"; c.fillRect(i * 128, j * 128, 128, 128); } for (let k = 0; k < 2500; k++) { c.fillStyle = `rgba(${rnd(k) < 0.5 ? "255,255,255" : "0,0,0"},0.05)`; c.fillRect(rnd(k + 1) * w, rnd(k + 2) * h, 3, 2); } c.strokeStyle = "rgba(0,0,0,0.35)"; c.strokeRect(0.5, 0.5, 255, 255); };

// a turned leg: a square block at the top (where the apron joins), a vase-and-ring turning, a tapered foot
const LEG = [[0, 0], [0.018, 0], [0.02, 0.01], [0.016, 0.08], [0.022, 0.2], [0.026, 0.32], [0.02, 0.4], [0.026, 0.43], [0.02, 0.46], [0.022, 0.5], [0, 0.5]];
const legGeo = (scale = 1) => new THREE.LatheGeometry(LEG.map(([r, y]) => new THREE.Vector2(r * scale, y)), 16);

const Chair = ({ position, ry, M }) => {
  const g = useMemo(() => ({ leg: legGeo(0.75), seat: new RoundedBoxGeometry(0.42, 0.04, 0.4, 3, 0.012), spindle: new THREE.CylinderGeometry(0.008, 0.01, 0.42, 8) }), []);
  const SH = 0.45;
  return (
    <group position={position} rotation-y={ry}>
      <mesh geometry={g.seat} position={[0, SH, 0]} material={M.chairWood} castShadow receiveShadow />
      {[[-0.17, -0.16], [0.17, -0.16], [-0.17, 0.16], [0.17, 0.16]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh geometry={g.leg} scale={[1, (SH - 0.02) / 0.5, 1]} material={M.chairWood} castShadow />
        </group>
      ))}
      {/* stretchers */}
      {[-0.16, 0.16].map((z, i) => <mesh key={i} position={[0, 0.16, z]} rotation-z={Math.PI / 2} material={M.chairWood}><cylinderGeometry args={[0.009, 0.009, 0.34, 8]} /></mesh>)}
      {[-0.17, 0.17].map((x, i) => <mesh key={i} position={[x, 0.2, 0]} rotation-x={Math.PI / 2} material={M.chairWood}><cylinderGeometry args={[0.009, 0.009, 0.32, 8]} /></mesh>)}
      {/* the back: two turned posts, five spindles, the shaped top rail (behind the seat, toward −z) */}
      {[-0.17, 0.17].map((x, i) => <mesh key={i} position={[x, SH + 0.24, -0.18]} rotation-x={-0.08} material={M.chairWood} castShadow><cylinderGeometry args={[0.014, 0.017, 0.5, 10]} /></mesh>)}
      {[-0.1, -0.05, 0, 0.05, 0.1].map((x, i) => <mesh key={i} geometry={g.spindle} position={[x, SH + 0.22, -0.18]} rotation-x={-0.08} material={M.chairWood} castShadow />)}
      <mesh position={[0, SH + 0.46, -0.2]} rotation-x={-0.08} material={M.chairWood} castShadow><boxGeometry args={[0.4, 0.07, 0.025]} /></mesh>
    </group>
  );
};
export const KitchenRoom = () => {
  const M = useMemo(() => {
    const oak = woodTex("kitoak", "#9C6E42", "#4A2C12", [1, 1], 11);
    const planks = tileTex("kitplanks2", 1024, 1024, (c, w, h) => {
      c.drawImage(oak.image, 0, 0, w, h / 2); c.drawImage(oak.image, -300, h / 2, w, h / 2); c.drawImage(oak.image, w - 300, h / 2, w, h / 2);
      c.fillStyle = "rgba(20,10,4,0.7)"; for (let y = 0; y < h; y += h / 4) c.fillRect(0, y, w, 3);
      c.fillStyle = "rgba(255,230,190,0.12)"; for (let y = 3; y < h; y += h / 4) c.fillRect(0, y, w, 2);
      // wear: a few rings, a scratch, a darker patina where hands rest
      for (let k = 0; k < 4; k++) { c.strokeStyle = "rgba(40,20,5,0.12)"; c.lineWidth = 3; c.beginPath(); c.arc(rnd(k * 3) * w, rnd(k * 5) * h, 40 + rnd(k) * 20, 0, Math.PI * 2); c.stroke(); }
      for (let k = 0; k < 30; k++) { c.strokeStyle = "rgba(255,240,220,0.12)"; c.lineWidth = 1; const x = rnd(k * 7) * w, y = rnd(k * 11) * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30 + rnd(k) * 60, y + (rnd(k + 1) - 0.5) * 8); c.stroke(); }
    }, true, [1, 1]);
    return {
      top: new THREE.MeshPhysicalMaterial({ map: planks, roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.3 }),
      oakEdge: new THREE.MeshStandardMaterial({ map: woodTex("kitoake", "#8E6038", "#432810", [0.5, 0.2], 12), roughness: 0.5, color: "#FFFFFF" }),
      apron: new THREE.MeshStandardMaterial({ color: "#6A4526", roughness: 0.55 }),
      chairWood: new THREE.MeshStandardMaterial({ map: woodTex("chairoak", "#7E5532", "#3C2410", [0.5, 1], 21), roughness: 0.45, color: "#FFFFFF" }),
      paper: new THREE.MeshStandardMaterial({ map: tileTex("kitpaper", 256, 256, wallpaperDraw, true, [12, 4]), roughness: 0.9, color: "#FFFFFF" }),
      bead: new THREE.MeshStandardMaterial({ map: tileTex("kitbead", 256, 64, beadDraw, true, [24, 1]), roughness: 0.55, color: "#C7D2DE" }),
      trim: new THREE.MeshStandardMaterial({ color: "#D8DEE4", roughness: 0.45 }),
      sash: new THREE.MeshStandardMaterial({ color: "#E6EAEE", roughness: 0.4 }),
      cab: new THREE.MeshStandardMaterial({ color: "#C9D3DC", roughness: 0.5 }),
      counter: new THREE.MeshPhysicalMaterial({ map: tileTex("kitcounter", 256, 256, (c, w, h) => { c.fillStyle = "#D8D2C2"; c.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "120,110,90" : "255,255,255"},0.15)`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); } }, true, [4, 1]), roughness: 0.3, clearcoat: 0.6 }),
      splash: new THREE.MeshStandardMaterial({ map: tileTex("kitsplash", 256, 256, tileDraw, true, [8, 2]), roughness: 0.25, color: "#FFFFFF" }),
      chrome: new THREE.MeshStandardMaterial({ color: "#D6DEE8", metalness: 0.95, roughness: 0.18 }),
      iron: new THREE.MeshStandardMaterial({ color: "#B8C0C8", metalness: 0.55, roughness: 0.4 }),
      lino: new THREE.MeshStandardMaterial({ map: tileTex("kitlino", 256, 256, linoDraw, true, [14, 9]), roughness: 0.45, color: "#FFFFFF" }),
      curtain: new THREE.MeshStandardMaterial({ map: tileTex("kitcurtain", 256, 256, (c, w, h) => { c.fillStyle = "#E9E4D6"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { c.fillStyle = `rgba(80,70,50,${0.08 + 0.08 * Math.sin(x / 9)})`; c.fillRect(x, 0, 8, h); } c.fillStyle = "rgba(70,110,170,0.35)"; for (let y = 6; y < h; y += 32) c.fillRect(0, y, w, 4); }, true, [3, 1]), roughness: 0.95, side: THREE.DoubleSide }),
    };
  }, []);
  const yard = useMemo(() => canvasTex("c_sh_yard2", 1024, 1024, yardDraw), []);
  const clock = useMemo(() => canvasTex("c_sh_clock", 256, 256, (c, w, h) => { c.fillStyle = "#EEF2F6"; c.fillRect(0, 0, w, h); c.fillStyle = "#1C2F4A"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `600 26px ${SANSF}`; for (let k = 1; k <= 12; k++) { const a = (k / 12) * Math.PI * 2 - Math.PI / 2; c.fillText(String(k), w / 2 + Math.cos(a) * 100, h / 2 + Math.sin(a) * 100); } for (let k = 0; k < 60; k++) { const a = (k / 60) * Math.PI * 2; c.fillRect(w / 2 + Math.cos(a) * 118 - 1, h / 2 + Math.sin(a) * 118 - 1, 3, 3); } }), []);
  const curtains = useMemo(() => {
    const mk = (w, hh, n, amp) => { const g = new THREE.PlaneGeometry(w, hh, n, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, amp * Math.sin(p.getX(i) * 70)); g.computeVertexNormals(); return g; };
    return { cafe: mk(0.4, 0.44, 24, 0.012), val: mk(WX1 - WX0 + 0.16, 0.18, 40, 0.012) };
  }, []);
  const legG = useMemo(() => legGeo(1.25), []);
  const radG = useMemo(() => new RoundedBoxGeometry(0.048, 0.56, 0.14, 3, 0.02), []);
  const Z = KWALL;
  const wallBox = (x0, x1, y0, y1, k, m = M.paper) => <mesh key={k} position={[(x0 + x1) / 2, (y0 + y1) / 2, Z - 0.06]} material={m} receiveShadow><boxGeometry args={[x1 - x0, y1 - y0, 0.12]} /></mesh>;
  const WAIN = 0.92;
  const wx = (WX0 + WX1) / 2, wy = (WY0 + WY1) / 2;
  // the sashes: two sashes, each 3 × 2 panes (muntins), stiles and rails, the meeting rail
  const sashes = [];
  [[WY0 + 0.02, wy + 0.02], [wy - 0.02, WY1 - 0.02]].forEach(([y0, y1], si) => {
    const zs = Z - 0.03 + (si ? -0.025 : 0), ww = WX1 - WX0 - 0.04, hh = y1 - y0;
    const fr = 0.04;
    sashes.push([wx, y0 + fr / 2, zs, ww, fr, 0.035], [wx, y1 - fr / 2, zs, ww, fr, 0.035], [WX0 + 0.02 + fr / 2, (y0 + y1) / 2, zs, fr, hh, 0.035], [WX1 - 0.02 - fr / 2, (y0 + y1) / 2, zs, fr, hh, 0.035]);
    [1, 2].forEach((k) => sashes.push([WX0 + 0.02 + fr + ((ww - 2 * fr) * k) / 3, (y0 + y1) / 2, zs, 0.014, hh - 2 * fr, 0.02]));
    sashes.push([wx, (y0 + y1) / 2, zs, ww - 2 * fr, 0.014, 0.02]);
  });
  return (
    <group>
      {/* ── the table ── */}
      <mesh position={[0, KT - 0.018, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.12, 0.036, 0.82]} />
        {[0, 1, 3, 4, 5].map((k) => <primitive key={k} object={M.oakEdge} attach={`material-${k}`} />)}
        <primitive object={M.top} attach="material-2" />
      </mesh>
      {/* breadboard ends across the grain, with pegs */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.6, KT - 0.018, 0]} material={M.oakEdge} castShadow receiveShadow><boxGeometry args={[0.08, 0.036, 0.84]} /></mesh>
          {[-0.28, 0, 0.28].map((z, i) => <mesh key={i} position={[s * 0.6, KT + 0.0002, z]} rotation-x={-Math.PI / 2}><circleGeometry args={[0.006, 12]} /><meshStandardMaterial color="#3A2210" roughness={0.6} /></mesh>)}
        </group>
      ))}
      {/* the eased (rounded) long edges */}
      {[-1, 1].map((s) => <mesh key={s} position={[0, KT - 0.018, s * 0.41]} rotation-z={Math.PI / 2} material={M.oakEdge}><cylinderGeometry args={[0.018, 0.018, 1.12, 12]} /></mesh>)}
      <mesh position={[0, KT - 0.08, 0]} material={M.apron} castShadow><boxGeometry args={[1.1, 0.09, 0.7]} /></mesh>
      <mesh position={[0, KT - 0.04, 0.351]} material={M.apron}><boxGeometry args={[1.1, 0.012, 0.012]} /></mesh>
      {[[-0.56, -0.33], [0.56, -0.33], [-0.56, 0.33], [0.56, 0.33]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh geometry={legG} scale={[1, (KT - 0.125) / 0.5, 1]} material={M.apron} castShadow />
          <mesh position={[0, KT - 0.08, 0]} material={M.apron} castShadow><boxGeometry args={[0.055, 0.1, 0.055]} /></mesh>
        </group>
      ))}
      {/* ── the chairs, pushed in ── */}
      <Chair position={[0.2, 0, -0.55]} ry={0} M={M} />
      <Chair position={[-0.78, 0, 0.02]} ry={Math.PI / 2} M={M} />
      {/* ── the floor ── */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0.5]} receiveShadow material={M.lino}><planeGeometry args={[6, 4]} /></mesh>
      {/* ── the back wall: wallpaper above a beadboard wainscot with its chair rail and cap; a baseboard ── */}
      {wallBox(-3, WX0 - 0.08, WAIN, 3, "l")}{wallBox(WX1 + 0.08, 3, WAIN, 3, "r")}{wallBox(WX0 - 0.08, WX1 + 0.08, WY1 + 0.08, 3, "t")}
      {wallBox(WX0 - 0.08, WX1 + 0.08, WAIN, WY0 - 0.06, "b")}
      <mesh position={[0, WAIN / 2, Z - 0.005]} material={M.bead} receiveShadow><boxGeometry args={[6, WAIN, 0.02]} /></mesh>
      <mesh position={[0, WAIN + 0.01, Z + 0.012]} material={M.trim} castShadow><boxGeometry args={[6, 0.05, 0.025]} /></mesh>
      <mesh position={[0, WAIN + 0.036, Z + 0.02]} material={M.trim}><boxGeometry args={[6, 0.012, 0.04]} /></mesh>
      <mesh position={[0, 0.06, Z + 0.012]} material={M.trim}><boxGeometry args={[6, 0.12, 0.02]} /></mesh>
      {/* ── the window: casing, sill (stool) and apron, the two sashes with their muntins, sash lifts and the lock ── */}
      {[[WX0 - 0.045, wy + 0.04, 0.09, WY1 - WY0 + 0.18], [WX1 + 0.045, wy + 0.04, 0.09, WY1 - WY0 + 0.18], [wx, WY1 + 0.06, WX1 - WX0 + 0.2, 0.12]].map(([x, y, w, h], i) =>
        <mesh key={i} position={[x, y, Z + 0.012]} material={M.trim} castShadow><boxGeometry args={[w, h, 0.022]} /></mesh>)}
      <mesh position={[wx, WY1 + 0.13, Z + 0.03]} material={M.trim}><boxGeometry args={[WX1 - WX0 + 0.26, 0.025, 0.06]} /></mesh>
      <mesh position={[wx, WY0 - 0.012, Z + 0.05]} material={M.trim} castShadow receiveShadow><boxGeometry args={[WX1 - WX0 + 0.22, 0.025, 0.13]} /></mesh>
      <mesh position={[wx, WY0 - 0.07, Z + 0.012]} material={M.trim}><boxGeometry args={[WX1 - WX0 + 0.14, 0.08, 0.02]} /></mesh>
      {sashes.map(([x, y, z, w, h, d], i) => <mesh key={i} position={[x, y, z]} material={M.sash} castShadow><boxGeometry args={[w, h, d]} /></mesh>)}
      {[-0.2, 0.2].map((x, i) => <mesh key={i} position={[wx + x, WY0 + 0.045, Z - 0.005]} material={M.chrome}><boxGeometry args={[0.04, 0.012, 0.016]} /></mesh>)}
      <mesh position={[wx, wy + 0.02, Z - 0.005]} material={M.chrome}><boxGeometry args={[0.05, 0.016, 0.02]} /></mesh>
      <mesh position={[wx, wy, Z - 0.07]}><planeGeometry args={[WX1 - WX0, WY1 - WY0]} /><meshPhysicalMaterial color="#9CC0EC" transparent opacity={0.08} roughness={0.03} clearcoat={1} depthWrite={false} /></mesh>
      <mesh position={[wx, 1.3, Z - 3.2]}><planeGeometry args={[6.5, 6.5]} /><meshBasicMaterial map={yard} fog={false} /></mesh>
      {/* snow on the outside sill */}
      <mesh position={[wx, WY0 - 0.005, Z - 0.13]}><boxGeometry args={[WX1 - WX0 + 0.1, 0.04, 0.1]} /><meshStandardMaterial color="#C9D7EA" roughness={0.85} emissive="#3A5070" emissiveIntensity={0.15} /></mesh>
      {/* café curtains on a brass rod across the lower sash, and a valance */}
      <mesh position={[wx, 1.5, Z + 0.05]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.006, 0.006, WX1 - WX0 + 0.16, 8]} /><meshStandardMaterial color="#C9A86A" metalness={0.9} roughness={0.3} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} geometry={curtains.cafe} position={[wx + s * 0.27, 1.28, Z + 0.06]} material={M.curtain} castShadow />)}
      <mesh geometry={curtains.val} position={[wx, WY1 - 0.08, Z + 0.07]} material={M.curtain} />
      {/* a cast-iron radiator under the window: columns, top and bottom headers, its valve */}
      <group position={[wx, 0.1, Z + 0.1]}>
        {Array.from({ length: 12 }, (_, i) => <mesh key={i} geometry={radG} position={[-0.33 + i * 0.06, 0.28, 0]} material={M.iron} castShadow />)}
        {Array.from({ length: 12 }, (_, i) => <mesh key={"f" + i} position={[-0.33 + i * 0.06, 0.28, 0.072]} material={M.iron}><boxGeometry args={[0.012, 0.44, 0.006]} /></mesh>)}
        {[0.04, 0.52].map((y, i) => <mesh key={i} position={[0, y, 0]} rotation-z={Math.PI / 2} material={M.iron}><cylinderGeometry args={[0.025, 0.025, 0.72, 10]} /></mesh>)}
        <mesh position={[0.41, 0.48, 0]} rotation-z={Math.PI / 2} material={M.chrome}><cylinderGeometry args={[0.018, 0.018, 0.07, 10]} /></mesh>
        <mesh position={[0.45, 0.52, 0]} material={M.chrome}><cylinderGeometry args={[0.03, 0.03, 0.012, 14]} /></mesh>
      </group>
      {/* the wall clock (left of the window) */}
      <group position={[-0.95, 1.72, Z + 0.03]}>
        <mesh rotation-x={Math.PI / 2}><cylinderGeometry args={[0.13, 0.13, 0.04, 40]} /><meshStandardMaterial color="#C8D4E2" metalness={0.85} roughness={0.25} /></mesh>
        <mesh position={[0, 0, 0.021]}><circleGeometry args={[0.115, 40]} /><meshStandardMaterial map={clock} roughness={0.5} /></mesh>
        <mesh position={[0.02, 0.035, 0.026]} rotation-z={-0.5}><boxGeometry args={[0.008, 0.08, 0.003]} /><meshStandardMaterial color="#1C2F4A" /></mesh>
        <mesh position={[-0.035, -0.01, 0.027]} rotation-z={1.3}><boxGeometry args={[0.006, 0.1, 0.003]} /><meshStandardMaterial color="#1C2F4A" /></mesh>
      </group>
      {/* ── the cabinets on the right: base cabinets with a counter and tile backsplash, wall cabinets above ── */}
      <group position={[1.35, 0, Z]}>
        <mesh position={[0, 0.45, 0.3]} material={M.cab} castShadow receiveShadow><boxGeometry args={[1.2, 0.86, 0.58]} /></mesh>
        <mesh position={[0, 0.05, 0.56]} ><boxGeometry args={[1.2, 0.1, 0.04]} /><meshStandardMaterial color="#2A3442" roughness={0.7} /></mesh>
        <mesh position={[0, 0.9, 0.32]} material={M.counter} castShadow receiveShadow><boxGeometry args={[1.24, 0.035, 0.64]} /></mesh>
        <mesh position={[0, 0.9, 0.64]} rotation-z={Math.PI / 2} material={M.chrome}><cylinderGeometry args={[0.019, 0.019, 1.24, 10]} /></mesh>
        <mesh position={[0, 1.15, 0.005]} material={M.splash}><boxGeometry args={[1.2, 0.46, 0.01]} /></mesh>
        <mesh position={[0, 1.78, 0.17]} material={M.cab} castShadow><boxGeometry args={[1.2, 0.72, 0.33]} /></mesh>
        {[-0.3, 0.3].map((x, i) => (
          <group key={i}>
            {/* base doors and drawers: a raised panel each, a chrome pull */}
            <mesh position={[x, 0.36, 0.595]} material={M.cab}><boxGeometry args={[0.56, 0.6, 0.02]} /></mesh>
            <mesh position={[x, 0.36, 0.607]} material={M.trim}><boxGeometry args={[0.44, 0.48, 0.008]} /></mesh>
            <mesh position={[x, 0.76, 0.595]} material={M.cab}><boxGeometry args={[0.56, 0.15, 0.02]} /></mesh>
            <mesh position={[x, 0.76, 0.612]} rotation-z={Math.PI / 2} material={M.chrome}><cylinderGeometry args={[0.006, 0.006, 0.1, 8]} /></mesh>
            <mesh position={[x + (i ? -0.22 : 0.22), 0.55, 0.612]} material={M.chrome}><cylinderGeometry args={[0.006, 0.006, 0.08, 8]} /></mesh>
            {/* wall cabinet doors */}
            <mesh position={[x, 1.78, 0.345]} material={M.cab}><boxGeometry args={[0.56, 0.68, 0.02]} /></mesh>
            <mesh position={[x, 1.78, 0.357]} material={M.trim}><boxGeometry args={[0.44, 0.56, 0.008]} /></mesh>
            <mesh position={[x + (i ? -0.22 : 0.22), 1.55, 0.362]} material={M.chrome}><cylinderGeometry args={[0.006, 0.006, 0.08, 8]} /></mesh>
          </group>
        ))}
        {/* on the counter: a breadbox and a canister set */}
        <mesh position={[-0.35, 0.99, 0.25]} material={M.cab} castShadow><boxGeometry args={[0.36, 0.16, 0.24]} /></mesh>
        {[0.15, 0.3, 0.43].map((x, i) => <mesh key={i} position={[x, 0.92 + (0.16 - i * 0.03) / 2, 0.2]} castShadow><cylinderGeometry args={[0.06 - i * 0.008, 0.06 - i * 0.008, 0.16 - i * 0.03, 24]} /><meshStandardMaterial color="#E8ECEF" roughness={0.35} metalness={0.2} /></mesh>)}
      </group>
    </group>
  );
};
