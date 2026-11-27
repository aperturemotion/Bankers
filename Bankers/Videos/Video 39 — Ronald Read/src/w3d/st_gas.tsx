// @ts-nocheck
// ★ V39 station GAS (builder B): "After the war, he pumped gas for about 25 years,"
//   A small 1950s Vermont service station at blue hour (FACTCHECK row 3: attendant/mechanic at Haviland's Service Station "almost a
//   quarter of a century"): a white clapboard office with its lit plate window and a hanging OPEN sign, a one-bay garage with an
//   overhead door glowing from inside, the porcelain fascia sign HAVILAND'S / SERVICE STATION under two gooseneck lamps; on the
//   concrete island two tall computing pumps (REGULAR, PREMIUM) with lighted milk-glass globes, a wire rack of quart oil cans between
//   them; a stack of tires by the bay, an air post, a SNOW TIRES board by the road, the plowed lot, a utility pole, pines behind.
//   370  (cut, the dissolve from the farm) a low view from the road; the camera pushes slowly in past the pumps.
//        Tag AFTER WWII on "war,"; Counter 25 YEARS · AT THE PUMPS rolls and lands on "25 years,".
import React, { useMemo } from "react";
import * as THREE from "three";
import { Sky, Glow, rnd, canvasTex } from "./kit";
import { Tag, Counter } from "./overlays";
import { cueAt } from "../bnx/SfxLayer";
import { WIN, wAt } from "./windows";
import { Built, Pines, Snowfield, Ridges, fbm, smooth, addMaple } from "./b_winter";
import { GasPump, OilRack, Tire, stationSignTex, openSignTex, officeTex, bayDoorTex, SIGNF } from "./b_pump";
import { poolTex } from "./st_farm";
import { BODY } from "./fonts3d";

export const GAS_O = [600, 0, 0];
const A = (p) => [p[0] + GAS_O[0], p[1] + GAS_O[1], p[2] + GAS_O[2]];
const W0 = () => WIN().gas;
const T = () => { const w = W0(); return { start: w.start, end: w.end, after: wAt("after", 360), war: wAt("war,", 360), pumped: wAt("pumped", 360), years: wAt("25 years,", 360) }; };
const hgt = (x, z) => {
  const lot = smooth(13, 9, Math.abs(x)) * smooth(-11, -8, z) * smooth(9.5, 8.5, z);
  const road = smooth(9, 9.5, z) * smooth(16.5, 16, z);
  const flat = Math.max(lot, road);
  return (1 - flat) * ((fbm(x * 0.05, z * 0.05, 3) - 0.5) * 1.6 + smooth(-12, -45, z) * 6 + 0.12);
};
const FRONT = -3.5, OFF = { x0: -4.6, x1: -0.6, h: 3.3 }, BAY = { x0: -0.6, x1: 4.4, h: 4.0 }, DEPTH = 6;
const PUMP1 = [-3.3, 0.15, 0.3], PUMP2 = [-1.1, 0.15, 0.3];
export const SIGN = { x: -0.1, y: 4.75, w: 4.6, h: 1.72 };
// ── the ground: the plowed lot (packed snow, tyre tracks, a little ice) and the road ───────────────────────────────────────
const lotTex = () => canvasTex("b_lot", 1024, 1024, (c, w, h) => {
  c.fillStyle = "#AEB8C6"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 30000; i++) { const g = rnd(i); c.fillStyle = `rgba(${g < 0.5 ? "60,70,86" : "235,240,248"},${0.04 + rnd(i + 1) * 0.08})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2 + rnd(i) * 3, 2); }
  // tyre tracks curving in from the road to the pumps and the bay
  for (let k = 0; k < 9; k++) {
    const x0 = w * (0.15 + rnd(k) * 0.7), bend = (rnd(k + 3) - 0.5) * w * 0.4;
    for (const off of [0, 52]) {
      c.strokeStyle = `rgba(70,80,96,${0.18 + rnd(k + 5) * 0.12})`; c.lineWidth = 20; c.beginPath();
      c.moveTo(x0 + off, h); c.quadraticCurveTo(x0 + off + bend, h * 0.5, x0 + off + bend * 0.4, 0); c.stroke();
      c.strokeStyle = "rgba(40,48,60,0.12)"; c.lineWidth = 3; for (let q = 0; q < 40; q++) { const t = q / 40, x = (1 - t) * (1 - t) * (x0 + off) + 2 * (1 - t) * t * (x0 + off + bend) + t * t * (x0 + off + bend * 0.4), y = h * (1 - t); c.beginPath(); c.moveTo(x - 9, y); c.lineTo(x + 9, y - 6); c.stroke(); }
    }
  }
  for (let k = 0; k < 6; k++) { c.fillStyle = "rgba(200,215,235,0.25)"; c.beginPath(); c.ellipse(rnd(k * 5) * w, rnd(k * 7) * h, 60 + rnd(k) * 80, 30 + rnd(k + 1) * 40, rnd(k + 2) * 3, 0, 7); c.fill(); }   // ice
});
const roadTex = () => canvasTex("b_road", 1024, 256, (c, w, h) => {
  c.fillStyle = "#3A4250"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 16000; i++) { const g = 40 + rnd(i) * 60; c.fillStyle = `rgba(${g},${g + 6},${g + 16},0.35)`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  // packed snow along both edges and in the wheel tracks' gaps
  for (const [y0, y1] of [[0, 0.16], [0.84, 1]]) { const g = c.createLinearGradient(0, y0 * h, 0, y1 * h); g.addColorStop(y0 === 0 ? 0 : 1, "rgba(220,228,240,0.95)"); g.addColorStop(y0 === 0 ? 1 : 0, "rgba(220,228,240,0)"); c.fillStyle = g; c.fillRect(0, y0 * h, w, (y1 - y0) * h); }
  c.fillStyle = "rgba(200,210,226,0.18)"; c.fillRect(0, h * 0.3, w, h * 0.06); c.fillRect(0, h * 0.64, w, h * 0.06);
  c.fillStyle = "#C9A848"; for (let x = 0; x < w; x += 128) c.fillRect(x, h * 0.49, 64, 6);   // the centre line
});
// ── the building, merged ─────────────────────────────────────────────────────────────────────────────────────────────────
const buildGas = (m) => {
  const wc = "#E4E2DA", trim = "#1F3A63";
  // the office: clapboard, a plate window (a real opening: the lit office shows through), the door
  const WX0 = -4.25, WX1 = -1.95, WY0 = 0.95, WY1 = 2.45, DX = -1.22, DW = 0.9, DH = 2.15;
  const wallBox = (x0, x1, y0, y1) => m.box("clap", [(x0 + x1) / 2, (y0 + y1) / 2, FRONT - 0.06], [x1 - x0, y1 - y0, 0.12], wc, { metric: true });
  wallBox(OFF.x0, WX0, 0, OFF.h); wallBox(WX1, DX - DW / 2, 0, OFF.h); wallBox(DX + DW / 2, OFF.x1, 0, OFF.h);
  wallBox(WX0, WX1, 0, WY0); wallBox(WX0, WX1, WY1, OFF.h); wallBox(DX - DW / 2, DX + DW / 2, DH, OFF.h);
  m.box("clap", [OFF.x0 + 0.06, OFF.h / 2, FRONT - DEPTH / 2], [0.12, OFF.h, DEPTH], wc, { metric: true });                 // the office's side and back walls
  m.box("clap", [(OFF.x0 + OFF.x1) / 2, OFF.h / 2, FRONT - DEPTH + 0.06], [OFF.x1 - OFF.x0, OFF.h, 0.12], wc, { metric: true });
  // the bay: taller, the overhead door
  m.box("clap", [(BAY.x0 + BAY.x1) / 2, BAY.h / 2, FRONT - DEPTH / 2 - 0.0], [BAY.x1 - BAY.x0, BAY.h, DEPTH], wc, { metric: true });
  // foundations, a navy water table and a navy band under the eaves (the station's trim colour)
  m.box("concrete", [(OFF.x0 + BAY.x1) / 2, 0.12, FRONT - DEPTH / 2], [BAY.x1 - OFF.x0 + 0.1, 0.24, DEPTH + 0.1], "#9AA2AE", { metric: true });
  m.box("trimb", [(OFF.x0 + OFF.x1) / 2, 0.3, FRONT + 0.01], [OFF.x1 - OFF.x0, 0.12, 0.05], trim);
  m.box("trimb", [(OFF.x0 + OFF.x1) / 2, OFF.h - 0.1, FRONT + 0.01], [OFF.x1 - OFF.x0 + 0.02, 0.2, 0.06], trim);
  m.box("trimb", [(BAY.x0 + BAY.x1) / 2, BAY.h - 0.1, FRONT + 0.01], [BAY.x1 - BAY.x0 + 0.02, 0.2, 0.06], trim);
  for (const x of [OFF.x0, BAY.x0, BAY.x1]) m.box("trimb", [x, (x === OFF.x0 ? OFF.h : BAY.h) / 2, FRONT + 0.01], [0.14, x === OFF.x0 ? OFF.h : BAY.h, 0.05], "#E9E7E0");
  // flat roofs: a parapet cap, tar paper under a snow blanket
  for (const [b, h] of [[OFF, OFF.h], [BAY, BAY.h]]) {
    m.box("roof", [(b.x0 + b.x1) / 2, h + 0.04, FRONT - DEPTH / 2], [b.x1 - b.x0 + 0.2, 0.08, DEPTH + 0.2], "#FFFFFF", { metric: true });
    m.box("snow", [(b.x0 + b.x1) / 2, h + 0.16, FRONT - DEPTH / 2], [b.x1 - b.x0 + 0.1, 0.18, DEPTH + 0.1], "#F2F6FB", { metric: true });
    m.cyl("snow", [(b.x0 + b.x1) / 2, h + 0.15, FRONT + 0.1], 0.1, b.x1 - b.x0 + 0.1, "#F2F6FB", { r: [0, 0, Math.PI / 2], seg: 10 });
    const n = Math.floor((b.x1 - b.x0) / 0.15);
    for (let k = 0; k < n; k++) { if (rnd(k * 3 + h) < 0.55) continue; const il = 0.05 + Math.pow(rnd(k * 7 + h), 2.4) * 0.32; m.cyl("ice", [b.x0 + 0.1 + k * 0.15, h - 0.02 - il / 2, FRONT + 0.14], 0.012 + il * 0.03, il, "#DCEBFF", { rt: 1, rb: 0.06, seg: 6 }); }
  }
  // the plate window's frame (navy), its sill with snow; the door's frame
  for (const x of [WX0, WX1]) m.box("trimb", [x, (WY0 + WY1) / 2, FRONT + 0.02], [0.08, WY1 - WY0 + 0.08, 0.08], trim);
  m.box("trimb", [(WX0 + WX1) / 2, WY1, FRONT + 0.02], [WX1 - WX0 + 0.08, 0.08, 0.08], trim);
  m.box("trimb", [(WX0 + WX1) / 2, (WY0 + WY1) / 2, FRONT + 0.0], [0.04, WY1 - WY0, 0.05], trim);   // the mullion
  m.box("trimb", [(WX0 + WX1) / 2, WY0 - 0.02, FRONT + 0.07], [WX1 - WX0 + 0.2, 0.06, 0.18], "#E9E7E0");
  m.box("snow", [(WX0 + WX1) / 2, WY0 + 0.025, FRONT + 0.08], [WX1 - WX0 + 0.1, 0.04, 0.12], "#F2F6FB");
  for (const sd of [-1, 1]) m.box("trimb", [DX + sd * (DW / 2 + 0.04), DH / 2, FRONT + 0.02], [0.08, DH, 0.08], trim);
  m.box("trimb", [DX, DH + 0.04, FRONT + 0.02], [DW + 0.16, 0.08, 0.08], trim);
  m.box("concrete", [DX, 0.1, FRONT + 0.45], [1.5, 0.2, 0.8], "#A4ACB8", { metric: true });   // the step
  // the door leaf: navy, a big glass light (lit) in its top half
  m.box("trimb", [DX, DH / 2, FRONT - 0.1], [DW, DH, 0.05], trim);
  m.box("metal", [DX + DW / 2 - 0.1, 1.05, FRONT - 0.06], [0.04, 0.12, 0.06], "#C9CFD8");
  // the bay door's frame, the bay's side window
  for (const sd of [-1, 1]) m.box("trimb", [1.9 + sd * 1.58, 1.55, FRONT + 0.03], [0.14, 3.1, 0.08], trim);
  m.box("trimb", [1.9, 3.12, FRONT + 0.03], [3.3, 0.14, 0.08], trim);
  // the sign: on two steel posts standing on the roofs; two gooseneck lamps over it
  for (const sx of [-1.7, 1.5]) m.box("metal", [SIGN.x + sx, (SIGN.y + OFF.h) / 2, FRONT - 0.15], [0.08, SIGN.y - OFF.h + 0.4, 0.08], "#2A2E35");
  m.box("metal", [SIGN.x, SIGN.y, FRONT - 0.08], [SIGN.w + 0.12, SIGN.h + 0.12, 0.08], "#1A2F52");
  for (const sx of [-1.3, 1.3]) {
    m.cyl("metal", [SIGN.x + sx, SIGN.y + SIGN.h / 2 + 0.25, FRONT + 0.15], 0.018, 0.65, "#1A2F52", { r: [1.1, 0, 0], seg: 6 });
    m.cyl("metal", [SIGN.x + sx, SIGN.y + SIGN.h / 2 + 0.42, FRONT + 0.48], 0.17, 0.14, "#1A2F52", { rt: 0.25, rb: 1, seg: 14, open: true, r: [0.35, 0, 0] });
    m.sph("bulb", [SIGN.x + sx, SIGN.y + SIGN.h / 2 + 0.37, FRONT + 0.5], 0.05, "#FFE6BE", { seg: 8 });
    m.glow([SIGN.x + sx, SIGN.y + SIGN.h / 2 + 0.34, FRONT + 0.52], "#FFD49A", 1.1);
  }
  // the pump island: a concrete curb with steel bumper posts at the ends
  m.box("concrete", [-2.2, 0.08, 0.3], [4.4, 0.16, 1.0], "#B5BCC6", { metric: true });
  m.box("trimb", [-2.2, 0.165, 0.3], [4.42, 0.01, 1.02], "#E8E6DE");
  for (const x of [-4.55, 0.15]) { m.cyl("metal", [x, 0.5, 0.3], 0.07, 0.9, "#D8D2BE", { seg: 12 }); m.cyl("snow", [x, 0.96, 0.3], 0.07, 0.03, "#F2F6FB", { seg: 10 }); }
  // the air post (AIR plate drawn on the sign atlas below), the water can
  m.box("metal", [0.75, 0.6, 0.3], [0.2, 1.2, 0.2], "#8E3A34");
  m.cyl("metal", [0.75, 1.24, 0.3], 0.11, 0.08, "#8E3A34", { seg: 12 });
  m.cyl("metal", [0.9, 0.8, 0.3], 0.008, 0.9, "#141618", { r: [0, 0, 0.15], seg: 6 });
  m.cyl("metal", [0.42, 0.2, 0.45], 0.1, 0.26, "#6E7782", { seg: 14 });
  // a barrel trash can, a snow shovel against the wall, a broom
  m.cyl("metal", [-4.9, 0.45, -2.9], 0.29, 0.9, "#3C4656", { seg: 18 });
  m.cyl("snow", [-4.9, 0.92, -2.9], 0.27, 0.04, "#F2F6FB", { seg: 14 });
  m.box("wood", [4.65, 0.85, -3.3], [0.04, 1.5, 0.04], "#8A6E4E", { r: [0.18, 0, 0] });
  m.box("metal", [4.65, 0.14, -3.05], [0.38, 0.28, 0.03], "#4A5566", { r: [0.5, 0, 0] });
  // the utility pole and its wires to the building
  m.cyl("wood", [8.5, 4.6, 6.5], 0.13, 9.2, "#4A3E34", { seg: 10 });
  m.box("wood", [8.5, 8.6, 6.5], [2.2, 0.12, 0.12], "#4A3E34");
  for (const x of [7.6, 9.4]) m.cyl("dark", [x, 8.72, 6.5], 0.04, 0.12, "#7A8A9A", { seg: 8 });
  // the pole's lamp: an arm and a shade over the lot
  m.cyl("metal", [7.6, 7.2, 6.5], 0.025, 1.8, "#2A2E35", { r: [0, 0, Math.PI / 2], seg: 6 });
  m.cyl("metal", [6.7, 7.05, 6.5], 0.26, 0.16, "#2A2E35", { rt: 0.3, rb: 1, seg: 14, open: true });
  m.sph("bulb", [6.7, 6.97, 6.5], 0.07, "#FFE6BE", { seg: 8 });
  m.glow([6.7, 6.9, 6.5], "#FFD49A", 1.6);
  // snowbanks round the plowed lot
  for (let k = 0; k < 18; k++) {
    const side = k < 9 ? -1 : 1, z = -8 + (k % 9) * 2.1;
    m.sph("snow", [side * (12.2 + rnd(k) * 0.8), 0.1, z], [1.4 + rnd(k + 1) * 0.6, 0.7 + rnd(k + 2) * 0.4, 1.3], "#EEF3FA", { seg: 12 });
  }
  for (let k = 0; k < 10; k++) { const x = -11 + k * 2.4 + rnd(k) * 0.5; if (Math.abs(x) < 7.5) continue; m.sph("snow", [x, 0.05, 8.7 + rnd(k + 9) * 0.3], [1.3, 0.5 + rnd(k + 3) * 0.25, 0.7], "#EEF3FA", { seg: 12, r: [0, rnd(k) * 3, 0] }); }   // the lot entrance is plowed open
  // maples by the road
  addMaple(m, [-9, hgt(-9, -7), -7], 9, 5);
  addMaple(m, [11.5, hgt(11.5, -4), -4], 8, 6);
};
const pineItems = () => {
  const out = [];
  for (let i = 0; i < 110; i++) { const x = -60 + rnd(i * 3 + 1) * 120, z = -13 - rnd(i * 3 + 2) * 40; if (Math.abs(x) < 7 && z > -16) continue; out.push({ p: [x, hgt(x, z) - 0.2, z], s: 1.5 + rnd(i * 5) * 1.5 }); }
  for (let i = 0; i < 16; i++) { const x = (i % 2 ? -1 : 1) * (15 + rnd(i * 7) * 25), z = -6 + rnd(i * 9) * 12; out.push({ p: [x, hgt(x, z) - 0.2, z], s: 1.4 + rnd(i * 11) * 1.2 }); }
  return out;
};
const Station = ({ f }) => {
  const mats = useMemo(() => {
    const lot = lotTex(); lot.wrapS = lot.wrapT = THREE.RepeatWrapping; lot.repeat.set(2.5, 1.6);
    const road = roadTex(); road.wrapS = THREE.RepeatWrapping; road.repeat.set(12, 1);
    return {
      lot: new THREE.MeshStandardMaterial({ map: lot, roughness: 0.6, metalness: 0.05, envMapIntensity: 0.5 }),
      road: new THREE.MeshStandardMaterial({ map: road, roughness: 0.75 }),
      sign: new THREE.MeshStandardMaterial({ map: stationSignTex(), emissiveMap: stationSignTex(), emissive: "#FFE9C8", emissiveIntensity: 0.18, roughness: 0.3, metalness: 0.05 }),
      office: new THREE.MeshBasicMaterial({ map: officeTex(), toneMapped: true, color: "#E6D2B4" }),
      glass: new THREE.MeshStandardMaterial({ color: "#B9CCE6", roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.16, envMapIntensity: 1.4, depthWrite: false }),
      bay: new THREE.MeshStandardMaterial({ map: bayDoorTex(false), emissiveMap: bayDoorTex(true), emissive: "#FFFFFF", emissiveIntensity: 0.85, roughness: 0.5 }),
      open: new THREE.MeshStandardMaterial({ map: openSignTex(), roughness: 0.4, emissive: "#FFE6C0", emissiveMap: openSignTex(), emissiveIntensity: 0.12 }),
      doorLite: new THREE.MeshBasicMaterial({ color: "#E8B878" }),
      tags: new THREE.MeshStandardMaterial({ map: smallSignsTex(), roughness: 0.45 })
    };
  }, []);
  const WX0 = -4.25, WX1 = -1.95, WY0 = 0.95, WY1 = 2.45, DX = -1.22;
  return (
    <group>
      <mesh position={[0, 0.012, -1]} rotation-x={-Math.PI / 2} material={mats.lot} receiveShadow><planeGeometry args={[25, 19]} /></mesh>
      <mesh position={[0, 0.016, 12.75]} rotation-x={-Math.PI / 2} material={mats.road} receiveShadow><planeGeometry args={[160, 7.5]} /></mesh>
      {/* the lit office behind the plate window (a backdrop 0.9 m inside), the glass */}
      <mesh position={[(WX0 + WX1) / 2, (WY0 + WY1) / 2 + 0.05, FRONT - 0.95]} material={mats.office}><planeGeometry args={[3.4, 2.1]} /></mesh>
      {[-1, 1].map((sd) => <mesh key={sd} position={[(WX0 + WX1) / 2 + sd * 1.15, 1.6, FRONT - 0.5]} rotation-y={-sd * Math.PI / 2}><planeGeometry args={[0.9, 3.2]} /><meshStandardMaterial color="#8A6A48" roughness={0.8} /></mesh>)}
      <mesh position={[(WX0 + WX1) / 2, 0.9, FRONT - 0.5]} rotation-x={-Math.PI / 2}><planeGeometry args={[2.4, 0.9]} /><meshStandardMaterial color="#5A4030" roughness={0.8} /></mesh>
      <mesh position={[(WX0 + WX1) / 2, (WY0 + WY1) / 2, FRONT - 0.01]} material={mats.glass} renderOrder={3}><planeGeometry args={[WX1 - WX0, WY1 - WY0]} /></mesh>
      <pointLight position={[(WX0 + WX1) / 2, 2.0, FRONT - 0.6]} color="#FFC07A" intensity={1.2} distance={5} decay={1.6} />
      <mesh position={[(WX0 + WX1) / 2, 0.03, FRONT + 1.4]} rotation-x={-Math.PI / 2} renderOrder={2}><planeGeometry args={[3.6, 2.8]} /><meshBasicMaterial map={poolTex()} color="#FFB46A" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      {/* the door's lit glass and the OPEN sign hanging in it on a chain */}
      <mesh position={[DX, 1.62, FRONT - 0.07]} material={mats.doorLite}><planeGeometry args={[0.62, 0.85]} /></mesh>
      <mesh position={[DX, 1.5, FRONT - 0.04]} material={mats.open}><planeGeometry args={[0.42, 0.21]} /></mesh>
      {[-1, 1].map((sd) => <mesh key={sd} position={[DX + sd * 0.1, 1.71, FRONT - 0.045]} rotation-z={sd * 0.7}><cylinderGeometry args={[0.003, 0.003, 0.24, 4]} /><meshStandardMaterial color="#9AA2AC" metalness={0.8} roughness={0.3} /></mesh>)}
      {/* the overhead bay door, lit from inside; the warm pool in front of it */}
      <mesh position={[1.9, 1.52, FRONT + 0.012]} material={mats.bay}><planeGeometry args={[3.0, 3.0]} /></mesh>
      <mesh position={[1.9, 0.03, FRONT + 1.2]} rotation-x={-Math.PI / 2} renderOrder={2}><planeGeometry args={[3.4, 2.2]} /><meshBasicMaterial map={poolTex()} color="#FFB46A" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      {/* the fascia sign */}
      <mesh position={[SIGN.x, SIGN.y, FRONT - 0.035]} material={mats.sign}><planeGeometry args={[SIGN.w, SIGN.h]} /></mesh>
      <pointLight position={[SIGN.x, SIGN.y + 1.3, FRONT + 0.9]} color="#FFD8A0" intensity={1.4} distance={4} decay={1.4} />
      {/* the pumps and the oil rack on the island; a light over the island from the pole lamp */}
      <GasPump position={PUMP1} grade="REGULAR" accent="#1F3A63" />
      <GasPump position={PUMP2} grade="PREMIUM" accent="#6E2A2A" />
      <OilRack position={[-2.2, 0.16, 0.36]} />
      <pointLight position={[-2.2, 3.2, 2.2]} color="#FFD8A8" intensity={1.0} distance={6} decay={1.4} />
      {/* the tires: a stack by the bay door, two leaning on the wall */}
      {[0, 1, 2, 3, 4].map((k) => <Tire key={k} position={[4.05 + (rnd(k) - 0.5) * 0.06, 0.1 + k * 0.19, -2.75 + (rnd(k + 5) - 0.5) * 0.06]} />)}
      <Tire position={[4.9, 0.33, -3.25]} rotation={[Math.PI / 2 - 0.12, 0, 0]} />
      <Tire position={[5.45, 0.33, -3.22]} rotation={[Math.PI / 2 - 0.16, 0, 0.05]} />
      <mesh position={[4.05, 1.06, -2.75]}><cylinderGeometry args={[0.3, 0.3, 0.05, 20]} /><meshStandardMaterial color="#F2F6FB" roughness={0.8} /></mesh>
      {/* small signs: AIR on the post, SNOW TIRES board by the road */}
      <mesh position={[0.75, 1.0, 0.405]} material={mats.tags}><planeGeometry args={[0.16, 0.16]} /></mesh>
      <group position={[5.6, 0, 7.4]} rotation-y={-0.5}>
        {[-1, 1].map((sd) => <mesh key={sd} position={[0, 0.55, sd * 0.18]} rotation-x={sd * 0.32} castShadow><boxGeometry args={[0.95, 1.15, 0.03]} /><meshStandardMaterial color="#E9E6DC" roughness={0.6} /></mesh>)}
        <mesh position={[0, 0.58, 0.198]} rotation-x={0.32}><planeGeometry args={[0.86, 1.02]} /><primitive object={snowTireMat()} attach="material" /></mesh>
        <mesh position={[0, 1.13, 0]}><boxGeometry args={[0.96, 0.05, 0.2]} /><meshStandardMaterial color="#F2F6FB" roughness={0.8} /></mesh>
      </group>
    </group>
  );
};
const smallSignsTex = () => canvasTex("b_airplate", 128, 128, (c, w, h) => { c.fillStyle = "#F2EFE6"; c.fillRect(0, 0, w, h); c.font = `700 54px ${SIGNF}`; c.fillStyle = "#8E3A34"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("AIR", w / 2, h / 2 + 3); });
let SNOWM = null;
const snowTireMat = () => SNOWM ??= new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvasTex("b_snowtires", 512, 600, (c, w, h) => {
  c.fillStyle = "#E9E6DC"; c.fillRect(0, 0, w, h);
  c.strokeStyle = "#1A2F52"; c.lineWidth = 10; c.strokeRect(14, 14, w - 28, h - 28);
  c.fillStyle = "#1A2F52"; c.textAlign = "center"; c.textBaseline = "middle";
  c.font = `700 120px ${SIGNF}`; c.fillText("SNOW", w / 2, 150); c.fillText("TIRES", w / 2, 290);
  c.fillRect(80, 370, w - 160, 6);
  c.font = `600 64px ${SIGNF}`; c.fillStyle = "#8E2A26"; c.fillText("MOUNTED", w / 2, 450);
  c.font = `600 44px ${SIGNF}`; c.fillStyle = "#1A2F52"; c.fillText("WHILE YOU WAIT", w / 2, 525);
}) });
const Scene = ({ f }) => {
  const pines = useMemo(pineItems, []);
  return (
    <group>
      <Sky zenith="#030E22" mid="#0A2B57" horizon="#5A86BE" glowAt={0.5} />
      <Ridges />
      <Snowfield hgt={hgt} size={260} segs={160} />
      <Built build={buildGas} />
      <Pines items={pines} />
      <Station f={f} />
    </group>
  );
};
const shots = () => {
  const t = T();
  return [
    { a: t.start, b: t.start, cut: true, pos: A([1.0, 2.6, 16.8]), target: A([-1.3, 1.05, -3]), fov: 40 },
    { a: t.start, b: t.end + 14, pos: A([-1.45, 2.9, 8.4]), target: A([-2.2, 0.05, -3]), fov: 40 }             // one slow push in and down onto the pumps
  ];
};
const Overlay = ({ f, P }) => {
  const t = T();
  const sign = P([SIGN.x - 0.6, SIGN.y + 0.35, FRONT]);
  return (
    <>
      <Tag text="After WWII" at={t.war - 4} out={t.years - 30} x={96} y={500} to={sign.behind ? null : sign} />
      <Counter at={t.years - 28} out={t.end - 13} x={540} y={300} value={25} unit="YEARS" label="At the pumps" size={112} countDur={26} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("whooshsoft", t.start + 30, 34, 0.3),            // the push in (fastest ≈ the middle)
    cueAt("ee_click_click_01", t.war - 4, 10, 0.32),
    cueAt("ee_clock_clock_ticking_01", t.years - 26, 26, 0.25),   // the counter rolling
    cueAt("pingshort", t.years + 1, 16, 0.3)
  ];
};
export const ST = { id: "gas", origin: GAS_O, from: W0().start - 8, to: W0().end + 8, light: { target: [-1, 0, -2], shadowBox: 14, keyI: 1.15, fillI: 0.42, rimI: 1.0 }, shots, Scene, Overlay, sfx };
