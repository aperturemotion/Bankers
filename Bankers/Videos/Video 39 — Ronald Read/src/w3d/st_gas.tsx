// @ts-nocheck
// ★ V39 station GAS (builder B): "After the war, he pumped gas for about 25 years,"
//   A small 1950s Vermont service station at blue hour (FACTCHECK row 3: attendant/mechanic at Haviland's Service Station "almost a
//   quarter of a century"): a white clapboard office with its lit plate window and a hanging OPEN sign, a one-bay garage with an
//   overhead door glowing from inside, the porcelain fascia sign HAVILAND'S / SERVICE STATION under two gooseneck lamps; on the
//   concrete island two tall computing pumps (REGULAR, PREMIUM) with lighted milk-glass globes, a wire rack of quart oil cans between
//   them; a stack of tires by the bay, an air post, a SNOW TIRES board by the road, the plowed lot, a utility pole, pines behind.
//   ★ rev STYLE (2026-11-28, the V38 cinematic rules): no 2-D labels or counters — the place is named by its own sign.
//   370  (MATCH CUT from the farm's push into the framed diploma's cream paper) — lands square on the cream porcelain fascia sign
//        HAVILAND'S / SERVICE STATION (a framed, lettered panel, like the diploma) on "After the war,".
//   370→468  ONE slow pull back and down along the sign's axis: the station rises into the frame under it (the lit office, the bay, the
//        pump island on "pumped gas"); it ends square-on, the sign's lettering ≈ 60 % of the width ≈ 33 % down — the match cut to A's
//        JCPenney letters at 472.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Sky, Glow, rnd, canvasTex } from "./kit";
import { cueAt } from "../bnx/SfxLayer";
import { WIN, wAt } from "./windows";
import { Built, Pines, Snowfield, Ridges, fbm, smooth, addMaple } from "./b_winter";
import { GasPump, OilRack, Tire, stationSignTex, openSignTex, SIGNF } from "./b_pump";
import { OfficeRoom, BayDoor, PoleSign, lotTex, roadTex, LOT } from "./e_gas";
import { poolTex } from "./st_farm";
import { Conifers, Maples } from "./e_trees";
import { BODY } from "./fonts3d";
import { ShadeLayer, keyDir } from "./b_fakeshade";

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
// the fascia sign stands IN FRONT of the roofs' snow (its lower edge 0.17 m above the bay's snow lip, its face 0.3 m out from the wall),
// so no roof, lip or lamp ever crosses its lettering (the old one was cut by the bay roof's snow)
export const SIGN = { x: -0.1, y: 5.17, w: 4.0, h: 1.5, z: 0.305 };
// ── the ground: e_gas' lotTex (the plowed lot) and roadTex (the plowed road) ──────────────────────────────────────────────────
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
  // the bay: taller; its front wall framed round the door opening (the door is e_gas' 3-D <BayDoor>, the lit garage behind it)
  const BD0 = 0.4, BD1 = 3.4, BDH = 3.0;
  m.box("clap", [(BAY.x0 + BD0) / 2, BAY.h / 2, FRONT - 0.06], [BD0 - BAY.x0, BAY.h, 0.12], wc, { metric: true });
  m.box("clap", [(BD1 + BAY.x1) / 2, BAY.h / 2, FRONT - 0.06], [BAY.x1 - BD1, BAY.h, 0.12], wc, { metric: true });
  m.box("clap", [(BD0 + BD1) / 2, (BDH + BAY.h) / 2, FRONT - 0.06], [BD1 - BD0, BAY.h - BDH, 0.12], wc, { metric: true });
  m.box("clap", [BAY.x0 + 0.06, BAY.h / 2, FRONT - DEPTH / 2], [0.12, BAY.h, DEPTH], wc, { metric: true });
  m.box("clap", [BAY.x1 - 0.06, BAY.h / 2, FRONT - DEPTH / 2], [0.12, BAY.h, DEPTH], wc, { metric: true });
  m.box("clap", [(BAY.x0 + BAY.x1) / 2, BAY.h / 2, FRONT - DEPTH + 0.06], [BAY.x1 - BAY.x0, BAY.h, 0.12], wc, { metric: true });
  m.box("dark", [(BD0 + BD1) / 2, BDH + 0.2, FRONT - 0.7], [BD1 - BD0, 0.4, 1.3], "#1A1612");                        // the door's coil housing inside
  m.box("concrete", [(BAY.x0 + BAY.x1) / 2, 0.245, FRONT - DEPTH / 2], [BAY.x1 - BAY.x0 - 0.2, 0.01, DEPTH - 0.2], "#7E868F", { metric: true });
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
  // the sign: a steel-framed porcelain panel carried on two steel posts that stand on the roofs (one on the office, one on the bay),
  // braced back to the parapets; two gooseneck lamps over it, their shades well above its top edge
  const SZ = FRONT + SIGN.z;
  for (const [sx, base] of [[-1.55, OFF.h + 0.2], [1.55, BAY.h + 0.2]]) {
    m.box("metal", [SIGN.x + sx, (SIGN.y + SIGN.h / 2 + base) / 2, SZ - 0.12], [0.09, SIGN.y + SIGN.h / 2 - base, 0.09], "#2A2E35");
    m.box("metal", [SIGN.x + sx, base + 0.55, SZ - 0.5], [0.05, 0.05, 0.85], "#2A2E35", { r: [-0.6, 0, 0] });
  }
  m.box("metal", [SIGN.x, SIGN.y, SZ - 0.06], [SIGN.w + 0.14, SIGN.h + 0.14, 0.1], "#16294A");                       // the frame
  m.box("snow", [SIGN.x, SIGN.y + SIGN.h / 2 + 0.1, SZ - 0.06], [SIGN.w + 0.1, 0.06, 0.1], "#F2F6FB");               // snow on its top
  for (const sx of [-1.25, 1.25]) {
    m.cyl("metal", [SIGN.x + sx, SIGN.y + SIGN.h / 2 + 0.3, SZ + 0.12], 0.018, 0.6, "#16294A", { r: [1.1, 0, 0], seg: 6 });
    m.cyl("metal", [SIGN.x + sx, SIGN.y + SIGN.h / 2 + 0.45, SZ + 0.42], 0.17, 0.14, "#16294A", { rt: 0.25, rb: 1, seg: 14, open: true, r: [0.35, 0, 0] });
    m.sph("bulb", [SIGN.x + sx, SIGN.y + SIGN.h / 2 + 0.4, SZ + 0.44], 0.05, "#FFE6BE", { seg: 8 });
    m.glow([SIGN.x + sx, SIGN.y + SIGN.h / 2 + 0.37, SZ + 0.46], "#FFD49A", 1.1);
  }
  // a gooseneck lamp over the office door, a downspout at the office's corner, a meter box on the bay wall
  m.cyl("metal", [-1.22, 2.55, FRONT + 0.15], 0.015, 0.4, "#16294A", { r: [1.1, 0, 0], seg: 6 });
  m.cyl("metal", [-1.22, 2.62, FRONT + 0.34], 0.12, 0.1, "#16294A", { rt: 0.25, rb: 1, seg: 12, open: true, r: [0.3, 0, 0] });
  m.sph("bulb", [-1.22, 2.58, FRONT + 0.35], 0.04, "#FFE6BE", { seg: 8 });
  m.glow([-1.22, 2.55, FRONT + 0.37], "#FFD49A", 0.8);
  m.cyl("metal", [OFF.x0 + 0.12, OFF.h / 2, FRONT + 0.08], 0.04, OFF.h, "#C9CFD8", { seg: 8 });
  m.box("metal", [4.0, 1.5, FRONT + 0.06], [0.28, 0.4, 0.12], "#7E868F");
  m.cyl("metal", [4.0, 1.5, FRONT + 0.13], 0.07, 0.03, "#D6DCE4", { r: [Math.PI / 2, 0, 0], seg: 14 });
  // the pump island: a concrete curb with steel bumper posts at the ends
  m.box("concrete", [-2.2, 0.08, 0.3], [4.4, 0.16, 1.0], "#B5BCC6", { metric: true });
  m.box("trimb", [-2.2, 0.165, 0.3], [4.42, 0.01, 1.02], "#E8E6DE");
  for (const x of [-4.55, 0.15]) { m.cyl("metal", [x, 0.5, 0.3], 0.07, 0.9, "#D8D2BE", { seg: 12 }); m.cyl("snow", [x, 0.96, 0.3], 0.07, 0.03, "#F2F6FB", { seg: 10 }); }
  // (E) the curb's steel nosing, the island's painted ends, snow shovelled up against both ends and along the back
  for (const sd of [-1, 1]) m.box("metal", [-2.2, 0.16, 0.3 + sd * 0.505], [4.42, 0.025, 0.02], "#8E969F");
  for (const x of [-4.4, 0.0]) m.box("trimb", [x, 0.085, 0.3], [0.04, 0.17, 1.02], "#E3C24A");
  for (const [x, z, sx] of [[-5.0, 0.3, 0.55], [-3.2, -0.45, 0.7], [-1.2, -0.5, 0.6]]) m.sph("snow", [x, 0.02, z], [sx, 0.22, 0.35], "#EEF3FA", { seg: 12 });
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
  // (the maples by the road are e_trees' <Maples>)
};
const pineItems = () => {
  const out = [];
  for (let i = 0; i < 110; i++) { const x = -60 + rnd(i * 3 + 1) * 120, z = -13 - rnd(i * 3 + 2) * 40; if (Math.abs(x) < 7 && z > -16) continue; out.push({ p: [x, hgt(x, z) - 0.2, z], s: 1.5 + rnd(i * 5) * 1.5 }); }
  for (let i = 0; i < 16; i++) { const x = (i % 2 ? -1 : 1) * (15 + rnd(i * 7) * 25), z = -6 + rnd(i * 9) * 12; out.push({ p: [x, hgt(x, z) - 0.2, z], s: 1.4 + rnd(i * 11) * 1.2 }); }
  return out;
};
const Station = ({ f }) => {
  const mats = useMemo(() => {
    const lot = lotTex();   // drawn once over the whole lot in station metres (e_gas LOT): the tracks follow real cars' paths
    const road = roadTex(); road.wrapS = THREE.RepeatWrapping; road.repeat.set(10, 1);
    return {
      lot: new THREE.MeshStandardMaterial({ map: lot, roughness: 0.6, metalness: 0.05, envMapIntensity: 0.5 }),
      road: new THREE.MeshStandardMaterial({ map: road, roughness: 0.75 }),
      sign: new THREE.MeshStandardMaterial({ map: stationSignTex(), emissiveMap: stationSignTex(), emissive: "#FFE9C8", emissiveIntensity: 0.18, roughness: 0.3, metalness: 0.05 }),
      glass: new THREE.MeshStandardMaterial({ color: "#B9CCE6", roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.16, envMapIntensity: 1.4, depthWrite: false }),
      open: new THREE.MeshStandardMaterial({ map: openSignTex(), roughness: 0.4, emissive: "#FFE6C0", emissiveMap: openSignTex(), emissiveIntensity: 0.12 }),
      doorLite: new THREE.MeshBasicMaterial({ color: "#E8B878" }),
      tags: new THREE.MeshStandardMaterial({ map: smallSignsTex(), roughness: 0.45 })
    };
  }, []);
  const WX0 = -4.25, WX1 = -1.95, WY0 = 0.95, WY1 = 2.45, DX = -1.22;
  return (
    <group>
      <mesh position={[(LOT.x0 + LOT.x1) / 2, 0.012, (LOT.z0 + LOT.z1) / 2]} rotation-x={-Math.PI / 2} material={mats.lot} receiveShadow><planeGeometry args={[LOT.x1 - LOT.x0, LOT.z1 - LOT.z0]} /></mesh>
      <mesh position={[0, 0.016, 12.75]} rotation-x={-Math.PI / 2} material={mats.road} receiveShadow><planeGeometry args={[160, 7.5]} /></mesh>
      {/* the lit office behind the plate window, built in 3-D (e_gas OfficeRoom), and the glass */}
      <OfficeRoom front={FRONT - 0.12} x0={OFF.x0 + 0.12} x1={OFF.x1 - 0.12} wx0={WX0} wx1={WX1} depth={DEPTH - 0.24} ceil={OFF.h - 0.12} f={f} />
      <mesh position={[(WX0 + WX1) / 2, (WY0 + WY1) / 2, FRONT - 0.01]} material={mats.glass} renderOrder={3}><planeGeometry args={[WX1 - WX0, WY1 - WY0]} /></mesh>
      <mesh position={[(WX0 + WX1) / 2, 0.03, FRONT + 1.4]} rotation-x={-Math.PI / 2} renderOrder={2}><planeGeometry args={[3.6, 2.8]} /><meshBasicMaterial map={poolTex()} color="#FFB46A" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      {/* the door's lit glass and the OPEN sign hanging in it on a chain */}
      <mesh position={[DX, 1.62, FRONT - 0.07]} material={mats.doorLite}><planeGeometry args={[0.62, 0.85]} /></mesh>
      <mesh position={[DX, 1.5, FRONT - 0.04]} material={mats.open}><planeGeometry args={[0.42, 0.21]} /></mesh>
      {[-1, 1].map((sd) => <mesh key={sd} position={[DX + sd * 0.1, 1.71, FRONT - 0.045]} rotation-z={sd * 0.7}><cylinderGeometry args={[0.003, 0.003, 0.24, 4]} /><meshStandardMaterial color="#9AA2AC" metalness={0.8} roughness={0.3} /></mesh>)}
      {/* the overhead bay door, lit from inside; the warm pool in front of it */}
      <BayDoor x={1.9} front={FRONT} w={3.0} h={3.0} />
      <mesh position={[1.9, 0.03, FRONT + 1.2]} rotation-x={-Math.PI / 2} renderOrder={2}><planeGeometry args={[3.4, 2.2]} /><meshBasicMaterial map={poolTex()} color="#FFB46A" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      {/* the fascia sign */}
      <mesh position={[SIGN.x, SIGN.y, FRONT + SIGN.z]} material={mats.sign}><planeGeometry args={[SIGN.w, SIGN.h]} /></mesh>
      <pointLight position={[SIGN.x, SIGN.y + 1.2, FRONT + SIGN.z + 0.9]} color="#FFD8A0" intensity={1.4} distance={4} decay={1.4} />

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
      <Conifers items={pines} near={[0, -3]} farDist={28} />
      <Maples items={[{ p: [-9, hgt(-9, -7) - 0.1, -7], h: 10, seed: 21 }, { p: [11.5, hgt(11.5, -4) - 0.1, -4], h: 9, seed: 22 }]} />
      <Station f={f} />
      <ShadeLayer build={buildGasShade} />
    </group>
  );
};
export const GAS_KEY = [-10, 13, 7];
const shots = () => {
  const t = T();
  const sc = [SIGN.x, SIGN.y, FRONT + SIGN.z];
  // A's jcp opens (472) on the lit JCPenney letters ≈ 60 % of the width, centred ≈ 33 % down, nearly square-on: the gas station ENDS the
  // same way on its own sign — HAVILAND'S ≈ 2.9 m of lettering = 60 % of a 4.9 m frame width (fov 38 → 12.6 m), the sign 1.47 m above
  // the aim (17 % of the 8.7 m frame height)
  const dEnd = 12.6, end = [sc[0], 3.9, sc[2] + dEnd], endT = [sc[0], sc[1] - 1.47, sc[2]];
  return [
    // the match cut: square on the sign, its panel filling the frame's width (the farm's diploma filled it the frame before)
    { a: t.start, b: t.start, cut: true, pos: A([sc[0] + 0.05, sc[1] - 0.05, sc[2] + 8.6]), target: A([sc[0], sc[1] - 0.1, sc[2]]), fov: 38 },
    // ONE slow pull back and down along the sign's axis ("After the war, he pumped gas …"): the roofs, the lit office window, the bay
    // and the pump island rise into the lower frame under the sign; it ends square-on with the sign in the upper third (A's match)
    { a: t.start, b: t.end - 4, pos: A(end), target: A(endT), fov: 38 },
    // a hair further back through the cut (monotone)
    { a: t.end - 10, b: t.end + 14, pos: A([end[0], end[1] - 0.05, end[2] + 0.35]), target: A(endT), fov: 38 }
  ];
};
// rev STYLE: no 2-D labels or counters (the sign names the place; "25 years" is the voice's); nothing visibly acts → no sound (rules 14–18)
const Overlay = () => null;
const sfx = () => [];
// the hand-placed contact shadows (b_fakeshade): the island and pumps, the tire stack, the building's foot, the bumper posts
const buildGasShade = (s) => {
  const [kx, kz] = keyDir(GAS_KEY);
  s.floor("rect", [-2.2 + kx * 0.2, 0.02, 0.3 + kz * 0.2], 4.9, 1.6, 0, 0.5);
  for (const p of [PUMP1, PUMP2]) s.floor("rect", [p[0] + kx * 0.12, 0.172, p[2] + kz * 0.12], 0.95, 0.75, 0, 0.55);
  s.floor("blob", [4.05 + kx * 0.15, 0.02, -2.75 + kz * 0.15], 1.0, 1.0, 0, 0.55);
  s.floor("blob", [5.15, 0.02, -3.0], 1.6, 0.8, 0, 0.45);
  s.edge([(OFF.x0 + BAY.x1) / 2, 0.025, FRONT + 0.05], [1, 0, 0], [0, 0, 1], BAY.x1 - OFF.x0 + 0.2, 0.9, 0.45);
  s.edge([BAY.x1 + 0.05, 0.025, FRONT - DEPTH / 2], [0, 0, 1], [1, 0, 0], DEPTH, 1.3, 0.45);
  for (const x of [-4.55, 0.15]) s.floor("blob", [x + kx * 0.06, 0.172, 0.3 + kz * 0.06], 0.3, 0.3, 0, 0.5);
  s.floor("blob", [0.75 + kx * 0.1, 0.02, 0.3 + kz * 0.1], 0.5, 0.5, 0, 0.5);
  s.floor("blob", [-4.9 + kx * 0.1, 0.02, -2.9 + kz * 0.1], 0.8, 0.8, 0, 0.5);
  s.floor("rect", [5.6, 0.02, 7.4], 1.2, 0.7, -0.5, 0.45);
};
export const ST = { id: "gas", origin: GAS_O, from: W0().start - 8, to: W0().end + 8, light: { target: [-1, 0, -2], key: GAS_KEY, keyColor: "#C4D8F6", shadowBox: 15, keyI: 2.1, fillI: 0.3, rimI: 1.2 }, shots, Scene, Overlay, sfx };
