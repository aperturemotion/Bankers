// @ts-nocheck
// ★ V39 station YARD (builder B): "He drove a second-hand Toyota Yaris, held his coat together with a safety pin, and chopped his own
//   firewood into his nineties."  (FACTCHECK row 4: used 2007 Toyota Yaris; safety pins holding his coat together; cutting firewood
//   "well into his 90s".)  His modest house in Brattleboro in winter at blue hour: a small clapboard Cape with one lit window and a
//   porch light; the silver Yaris parked in the plowed driveway with snow on its roof; on the porch his worn khaki work jacket on a peg,
//   held shut by one big safety pin; beside the shed a big neat woodpile, the chopping block with the axe in it, chips on the snow.
//   ONE continuous dolly to the right (no reversals): the car (Tag USED 2007 YARIS on "Yaris,") → in close on the jacket (Tag SAFETY PIN
//   on "pin,") → out and on to the woodpile (Tag INTO HIS 90S on "nineties.") and a gentle drift to the end of the window.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Sky, Glow, rnd, canvasTex } from "./kit";
import { Tag } from "./overlays";
import { cueAt } from "../bnx/SfxLayer";
import { WIN, wAt } from "./windows";
import { Built, addHouse, addMaple, Pines, Snowfield, Ridges, fbm, smooth, addRailFence } from "./b_winter";
import { Yaris, topY } from "./b_yaris";
import { PegRail, PIN_Y, frontZ } from "./b_jacket";
import { Splits, pilePieces, ChoppingBlock, Chips } from "./b_wood";
import { poolTex } from "./st_farm";

export const YARD_O = [900, 0, 0];
const A = (p) => [p[0] + YARD_O[0], p[1] + YARD_O[1], p[2] + YARD_O[2]];
const W0 = () => WIN().yard;
const T = () => { const w = W0(); return { start: w.start, end: w.end, yaris: wAt("yaris,", 590), held: wAt("held", 590), pin: wAt("pin,", 590), chopped: wAt("chopped", 590), firewood: wAt("firewood", 590), nineties: wAt("nineties.", 590) }; };
const hgt = (x, z) => {
  const yard = smooth(22, 12, Math.hypot(x - 1, (z + 2) * 1.2));
  return (1 - yard) * ((fbm(x * 0.05 + 11, z * 0.05 + 4, 3) - 0.5) * 1.6 + smooth(-14, -45, z) * 5);
};
// the house and porch (house-local = world-local here, the house centred on x 0)
const HOUSE = { x: 0, z: -5, w: 8.6, d: 7, h: 3.05, found: 0.5 };
const FRONT_Z = HOUSE.z + HOUSE.d / 2;             // −1.5
const DOOR_X = -0.35, PORCH = { x0: -1.55, x1: 1.45, z1: 0.25, y: 0.5 };
const RAIL = { x: 0.64, y: 2.13 };                 // the peg rail; the jacket hangs from its first peg
export const PIN_W = [RAIL.x, RAIL.y - 0.01 + PIN_Y, FRONT_Z + 0.026 + frontZ(0, PIN_Y) + 0.006];
const CAR = { x: -6.4, z: 0.9 };
const SHED = { x: 8.0, z: -4.4, w: 4.6, d: 3.6 };
const PILE = { x0: 5.75, z: SHED.z + SHED.d / 2 + 0.86 };   // the pile's front face; it stands against the shed's front wall, under the eave
const BLOCK = [6.9, 0, 0.55];

const buildYard = (m) => {
  // his house: a small 1½-storey Cape, painted clapboard (pale grey-blue), white trim, black shutters, an asphalt-shingle roof under snow
  m.push([HOUSE.x, 0, HOUSE.z]);
  addHouse(m, {
    w: HOUSE.w, d: HOUSE.d, h: HOUSE.h, pitch: 0.95, found: HOUSE.found, wall: "#C3CBD4", trim: "#ECEBE6", roof: "shingle", roofC: "#FFFFFF", seed: 21, foundMat: "concrete", foundC: "#8E949C",
    chimney: [2.2, -0.4],
    win: [
      { f: "front", x: -2.6, y: 1.25, ww: 0.85, wh: 1.35, cell: 5, shutters: "#1E2530" },
      { f: "front", x: 2.4, y: 1.25, ww: 0.85, wh: 1.35, cell: 4, shutters: "#1E2530" },
      { f: "left", x: -1.4, y: 1.25, ww: 0.85, wh: 1.35, cell: 4 },
      { f: "left", x: 1.4, y: 1.25, ww: 0.85, wh: 1.35, cell: 5 },
      { f: "left", x: 0, y: 4.0, ww: 0.75, wh: 1.0, cell: 1 },
      { f: "right", x: 0, y: 4.0, ww: 0.75, wh: 1.0, cell: 4 },
      { f: "right", x: -1.5, y: 1.25, ww: 0.85, wh: 1.35, cell: 4 }
    ],
    door: [{ f: "front", x: DOOR_X, w: 0.92, h: 2.05, cell: 1 }]
  });
  m.pop();
  // the porch: a plank deck on stone piers, two steps, a small gable roof on two turned posts
  const { x0, x1, z1, y } = PORCH, z0 = FRONT_Z;
  m.box("split", [(x0 + x1) / 2, y - 0.05, (z0 + z1) / 2], [x1 - x0, 0.1, z1 - z0], "#8C8C88", { metric: true });
  for (let k = 0; k < 14; k++) m.box("dark", [(x0 + x1) / 2, y + 0.001, z0 + 0.06 + k * 0.125], [x1 - x0, 0.004, 0.008], "#3A3A38");
  for (const x of [x0 + 0.1, x1 - 0.1]) m.box("concrete", [x, (y - 0.1) / 2, z1 - 0.12], [0.24, y - 0.1, 0.24], "#8E949C", { metric: true });
  m.box("trimb", [(x0 + x1) / 2, y - 0.22, z1], [x1 - x0, 0.24, 0.04], "#ECEBE6");                // the skirt board
  for (let k = 0; k < 2; k++) m.box("split", [DOOR_X, y * (2 - k) / 3 - 0.03, z1 + 0.16 + k * 0.3], [1.2, 0.06, 0.3], "#8C8C88", { metric: true });
  for (let k = 0; k < 2; k++) m.box("trimb", [DOOR_X, y * (1 - k) / 3 + 0.02, z1 + 0.16 + k * 0.3], [1.2, y / 3, 0.02], "#ECEBE6");
  // snow: swept off the middle of the deck, banked at the edges; on the steps
  m.box("snow", [x0 + 0.2, y + 0.03, (z0 + z1) / 2 + 0.2], [0.35, 0.06, z1 - z0 - 0.3], "#EEF3FA");
  m.box("snow", [x1 - 0.2, y + 0.03, (z0 + z1) / 2 + 0.2], [0.35, 0.06, z1 - z0 - 0.3], "#EEF3FA");
  for (let k = 0; k < 2; k++) m.box("snow", [DOOR_X + 0.42, y * (2 - k) / 3 + 0.015, z1 + 0.16 + k * 0.3], [0.32, 0.03, 0.26], "#EEF3FA");
  // the door hood: a small gable roof over the door and the coat pegs, carried on two knee-braced brackets (no posts)
  const hy = y + 2.45, rp = 0.6, hx0 = -1.55, hx1 = 1.3, hd = 0.95, half = (hx1 - hx0) / 2, cx = (hx0 + hx1) / 2;
  const ang = Math.atan(rp), slopeL = (half + 0.08) / Math.cos(ang);
  for (const sd of [-1, 1]) {
    m.box("shingle", [cx + sd * (half + 0.08) / 2, hy + 0.05 + rp * (half + 0.08) / 2, z0 + hd / 2], [slopeL, 0.05, hd + 0.05], "#FFFFFF", { r: [0, 0, -sd * ang], metric: true });
    m.box("snow", [cx + sd * (half + 0.08) / 2 - sd * 0.02, hy + 0.14 + rp * (half + 0.08) / 2, z0 + hd / 2], [slopeL * 0.9, 0.09, hd], "#F2F6FB", { r: [0, 0, -sd * ang], metric: true });
  }
  m.push([cx, hy, z0 + hd + 0.0]);
  m.tri("clap", [-half, 0, 0], [half, 0, 0], [0, rp * half, 0], "#C3CBD4");
  m.pop();
  m.box("trimb", [cx, hy - 0.04, z0 + hd / 2], [hx1 - hx0, 0.1, hd], "#ECEBE6");                         // the soffit / tie
  for (const x of [hx0 + 0.1, hx1 - 0.1]) {
    m.box("trimb", [x, hy - 0.45, z0 + 0.05], [0.09, 0.8, 0.09], "#ECEBE6");                                 // the wall post of the bracket
    m.box("trimb", [x, hy - 0.42, z0 + 0.45], [0.07, 0.09, 1.0], "#ECEBE6", { r: [-0.78, 0, 0] });         // the knee brace
  }
  // the porch light by the door (a black lantern)
  m.box("metal", [DOOR_X - 0.75, 2.42, FRONT_Z + 0.04], [0.1, 0.2, 0.06], "#15181C");
  m.box("metal", [DOOR_X - 0.75, 2.5, FRONT_Z + 0.13], [0.16, 0.03, 0.16], "#15181C");
  m.sph("bulb", [DOOR_X - 0.75, 2.38, FRONT_Z + 0.13], 0.05, "#FFE6BE", { seg: 8 });
  m.box("metal", [DOOR_X - 0.75, 2.26, FRONT_Z + 0.13], [0.15, 0.02, 0.15], "#15181C");
  m.glow([DOOR_X - 0.75, 2.38, FRONT_Z + 0.16], "#FFD49A", 1.3);
  // the house number by the door (a plain plaque) and a mailbox on the porch wall
  m.box("metal", [DOOR_X + 0.75, 1.42, FRONT_Z + 0.02], [0.28, 0.32, 0.06], "#1E2530");
  // a boot tray under the jacket with a pair of rubber boots, a snow shovel leaning by the post
  m.box("dark", [RAIL.x + 0.05, y + 0.012, FRONT_Z + 0.3], [0.62, 0.025, 0.38], "#1A1C20");
  for (const dx of [-0.12, 0.12]) {
    m.box("dark", [RAIL.x + 0.05 + dx, y + 0.2, FRONT_Z + 0.25], [0.11, 0.36, 0.13], "#2A2E26");
    m.box("dark", [RAIL.x + 0.05 + dx, y + 0.06, FRONT_Z + 0.33], [0.11, 0.1, 0.26], "#2A2E26");
    m.box("dark", [RAIL.x + 0.05 + dx, y + 0.37, FRONT_Z + 0.25], [0.12, 0.03, 0.14], "#6E3A2A");
  }
  m.box("wood", [x1 - 0.25, y + 0.72, FRONT_Z + 0.16], [0.035, 1.35, 0.035], "#8A6E4E", { r: [0.12, 0, 0] });
  m.box("metal", [x1 - 0.25, y + 0.1, FRONT_Z + 0.27], [0.4, 0.3, 0.03], "#4A5566", { r: [0.25, 0, 0] });
  // the driveway: plowed, packed snow and gravel; snowbanks along both sides
  // (plowed to the far side; the near side only a low windrow behind the car)
  for (let k = 0; k < 14; k++) {
    const z = 14 - k * 1.25;
    m.sph("snow", [CAR.x - 2.2 - rnd(k) * 0.3, 0.0, z], [1.1 + rnd(k * 3) * 0.3, 0.5 + rnd(k * 5) * 0.2, 0.95], "#EEF3FA", { seg: 14, r: [0, rnd(k) * 3, 0] });
    if (z < 3.2) m.sph("snow", [CAR.x + 2.0 + rnd(k + 1) * 0.2, 0.0, z], [0.7, 0.28 + rnd(k * 7) * 0.1, 0.8], "#EEF3FA", { seg: 14, r: [0, rnd(k) * 3, 0] });
  }
  // the shed: board-and-batten, a tin roof (the woodpile against its front wall, under the eave)
  m.push([SHED.x, 0, SHED.z]);
  addHouse(m, { w: SHED.w, d: SHED.d, h: 2.3, pitch: 0.75, found: 0.12, clap: "board", wall: "#8E8478", trim: "#7A7066", roof: "tin", roofC: "#B4BBC4", seed: 31, over: 0.7, foundMat: "concrete", foundC: "#7E848C", icicles: true, door: [{ f: "right", x: 0, w: 1.0, h: 1.9, cell: 3 }] });
  m.pop();
  // a sawbuck by the block, an unsplit round, a couple of splits on the snow
  m.push([BLOCK[0] + 1.1, 0, BLOCK[2] - 0.5], 0.4);
  for (const sx of [-0.35, 0.35]) for (const sd of [-1, 1]) m.box("split", [sx, 0.42, 0], [0.07, 0.95, 0.07], "#7E766C", { r: [0, 0, sd * 0.55], metric: true });
  m.box("split", [0, 0.42, 0], [0.8, 0.06, 0.06], "#7E766C", { metric: true });
  m.box("snow", [0, 0.47, 0], [0.8, 0.03, 0.065], "#F2F6FB");
  m.pop();
  // the mailbox at the road
  m.push([CAR.x + 2.6, 0, 13.0]);
  m.box("wood", [0, 0.55, 0], [0.09, 1.1, 0.09], "#5A4A3A");
  m.box("metal", [0, 1.18, 0], [0.24, 0.24, 0.5], "#22262C");
  m.cyl("metal", [0, 1.3, 0], 0.12, 0.5, "#22262C", { r: [Math.PI / 2, 0, 0], seg: 14 });
  m.box("snow", [0, 1.43, 0], [0.2, 0.05, 0.48], "#F2F6FB");
  m.pop();
  // maples, a neighbour's fence line far left
  addMaple(m, [-16, hgt(-16, -11), -11], 10, 7);
  addMaple(m, [13, hgt(13, 1), 1], 9, 9);
};
const pineItems = () => {
  const out = [];
  for (let i = 0; i < 120; i++) { const x = -60 + rnd(i * 3 + 7) * 120, z = -13 - rnd(i * 3 + 8) * 40; out.push({ p: [x, hgt(x, z) - 0.2, z], s: 1.5 + rnd(i * 5 + 1) * 1.5 }); }
  for (let i = 0; i < 14; i++) { const x = (i % 2 ? -1 : 1) * (16 + rnd(i * 7 + 3) * 20), z = -8 + rnd(i * 9 + 4) * 16; out.push({ p: [x, hgt(x, z) - 0.2, z], s: 1.3 + rnd(i * 11) * 1.2 }); }
  out.push({ p: [12.5, hgt(12.5, -6), -6], s: 2.0 });
  return out;
};
const drivewayTex = () => canvasTex("b_drive", 512, 1024, (c, w, h) => {
  c.fillStyle = "#A9B3C2"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 26000; i++) { const g = rnd(i); c.fillStyle = `rgba(${g < 0.45 ? "70,72,80" : g < 0.9 ? "230,236,246" : "120,100,80"},${0.05 + rnd(i + 1) * 0.12})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2 + rnd(i) * 3, 2 + rnd(i + 4) * 2); }
  for (const x of [w * 0.27, w * 0.73]) { c.fillStyle = "rgba(80,88,100,0.28)"; c.fillRect(x - 26, 0, 52, h); for (let y = 0; y < h; y += 14) { c.fillStyle = "rgba(40,46,56,0.18)"; c.fillRect(x - 24, y, 48, 4); } }
});
const pathTex = () => canvasTex("b_path", 256, 512, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  // a trodden path: boot prints in two staggered lines on a softened band
  const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "rgba(140,155,180,0)"); g.addColorStop(0.3, "rgba(140,155,180,0.35)"); g.addColorStop(0.7, "rgba(140,155,180,0.35)"); g.addColorStop(1, "rgba(140,155,180,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 36) for (const s of [0, 1]) { c.fillStyle = "rgba(90,104,130,0.45)"; c.beginPath(); c.ellipse(w * (0.4 + s * 0.2) + (rnd(y + s) - 0.5) * 12, y + s * 18, 14, 26, (rnd(y) - 0.5) * 0.4, 0, 7); c.fill(); }
});
const Yard = ({ f }) => {
  const pile = useMemo(() => pilePieces(4.6, 1.5, 2, 3).map((q) => ({ ...q, p: [q.p[0] + PILE.x0, q.p[1], q.p[2] + PILE.z] })), []);
  const loose = useMemo(() => [
    { p: [BLOCK[0] - 0.55, 0.06, BLOCK[2] + 0.35], k: 0, rz: -Math.PI / 4, ry: 1.1, rx: 0 },
    { p: [BLOCK[0] + 0.45, 0.06, BLOCK[2] + 0.45], k: 2, rz: -Math.PI * 0.49, ry: -0.6, rx: 0 },
    { p: [BLOCK[0] - 0.2, 0.08, BLOCK[2] + 0.75], k: 1, rz: Math.PI, ry: 0.3, rx: 0 },
    { p: [BLOCK[0] + 0.7, 0.05, BLOCK[2] - 0.1], k: 3, rz: 0, ry: 2.0, rx: Math.PI / 2, s: [1.6, 1.6, 0.9] }
  ], []);
  const mats = useMemo(() => {
    const d = drivewayTex(); d.wrapS = d.wrapT = THREE.RepeatWrapping; d.repeat.set(1, 3);
    return { drive: new THREE.MeshStandardMaterial({ map: d, roughness: 0.7 }), path: new THREE.MeshStandardMaterial({ map: pathTex(), transparent: true, depthWrite: false, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -1 }), back: new THREE.MeshStandardMaterial({ color: "#14100C", roughness: 1 }) };
  }, []);
  return (
    <group>
      <mesh position={[CAR.x, 0.01, 4.5]} rotation-x={-Math.PI / 2} material={mats.drive} receiveShadow><planeGeometry args={[3.4, 22]} /></mesh>
      {/* trodden paths: porch steps → driveway, porch → woodpile */}
      <mesh position={[(DOOR_X + CAR.x) / 2 + 0.4, 0.02, 1.3]} rotation-x={-Math.PI / 2} rotation-z={Math.PI / 2 - 0.08} material={mats.path}><planeGeometry args={[1.0, 5.2]} /></mesh>
      <mesh position={[4.0, 0.02, 1.0]} rotation-x={-Math.PI / 2} rotation-z={Math.PI / 2 + 0.12} material={mats.path}><planeGeometry args={[1.1, 5.8]} /></mesh>
      {/* the car, nose in toward the house's corner */}
      <group position={[CAR.x, 0, CAR.z]} rotation-y={Math.PI / 2 + 0.06}><Yaris /></group>
      {/* the jacket on its peg rail */}
      <group position={[RAIL.x, RAIL.y, FRONT_Z + 0.001]}><PegRail /></group>
      <pointLight position={[DOOR_X - 0.75, 2.36, FRONT_Z + 0.35]} color="#FFC890" intensity={1.6} distance={4.5} decay={1.5} />
      {/* the woodpile against the shed, the dark gaps behind it, the block, the axe, chips */}
      <mesh position={[PILE.x0 + 2.3, 0.75, SHED.z + SHED.d / 2 + 0.01]} material={mats.back}><planeGeometry args={[4.6, 1.5]} /></mesh>
      <Splits pieces={pile} seedTex={1} />
      <Splits pieces={loose} seedTex={5} />
      <ChoppingBlock position={BLOCK} ry={2.25} />
      <Chips center={[BLOCK[0], 0.0, BLOCK[2]]} n={260} radius={1.5} />
      {/* the lit window's warm spill on the snow */}
      <mesh position={[-2.6, 0.03, FRONT_Z + 1.2]} rotation-x={-Math.PI / 2} renderOrder={2}><planeGeometry args={[2.2, 2.4]} /><meshBasicMaterial map={poolTex()} color="#FFB46A" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <mesh position={[DOOR_X - 0.5, PORCH.y + 0.02, FRONT_Z + 0.9]} rotation-x={-Math.PI / 2} renderOrder={2}><planeGeometry args={[2.6, 2.0]} /><meshBasicMaterial map={poolTex()} color="#FFB46A" transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
    </group>
  );
};
const Scene = ({ f }) => {
  const pines = useMemo(pineItems, []);
  return (
    <group>
      <Sky zenith="#030E22" mid="#0A2B57" horizon="#5A86BE" glowAt={0.5} />
      <Ridges />
      <Snowfield hgt={hgt} size={260} segs={160} />
      <Built build={buildYard} />
      <Pines items={pines} />
      <Yard f={f} />
    </group>
  );
};
// ── the camera: one sweep to the right ──────────────────────────────────────────────────────────────────────────────────────
const shots = () => {
  const t = T();
  const pin = PIN_W;
  return [
    { a: t.start, b: t.start, cut: true, pos: A([-2.2, 2.6, 9.5]), target: A([CAR.x - 0.6, 0.35, CAR.z + 0.7]), fov: 40 },
    { a: t.start, b: t.yaris + 2, pos: A([-1.6, 2.5, 8.7]), target: A([CAR.x - 0.45, 0.4, CAR.z + 0.6]), fov: 40 },          // the car
    { a: t.yaris - 6, b: t.pin - 12, pos: A([pin[0] + 0.0, pin[1] + 0.12, FRONT_Z + 3.05]), target: A([pin[0] - 0.01, pin[1] + 0.05, pin[2]]), fov: 26 },   // in to the jacket
    { a: t.pin - 20, b: t.pin + 30, pos: A([pin[0] + 0.07, pin[1] + 0.11, FRONT_Z + 2.85]), target: A([pin[0] + 0.03, pin[1] + 0.05, pin[2]]), fov: 26, raw: true },   // creeping in on the pin (kept as authored: the hold on the pin)
    { a: t.pin + 18, b: t.pin + 46, pos: A([1.0, 2.25, 6.6]), target: A([1.15, 1.35, -1.5]), fov: 34 },                       // pull straight back off the jacket
    { a: t.pin + 38, b: t.nineties + 4, pos: A([3.7, 1.85, 4.3]), target: A([7.3, 0.55, -0.9]), fov: 38 },                    // and on to the woodpile
    { a: t.nineties - 4, b: t.end + 14, pos: A([4.3, 1.85, 4.1]), target: A([7.7, 0.55, -1.0]), fov: 38 }                    // a gentle drift on
  ];
};
const Overlay = ({ f, P }) => {
  const t = T();
  const car = P([CAR.x - 0.2, 1.1, CAR.z + 1.9]);
  const pin = P([PIN_W[0] + 0.01, PIN_W[1] + 0.004, PIN_W[2] + 0.005]);
  const pile = P([PILE.x0 + 1.6, 1.1, PILE.z + 0.05]);
  return (
    <>
      <Tag text="Used 2007 Yaris" at={t.yaris - 4} out={t.held - 2} x={96} y={430} to={car.behind ? null : car} />
      <Tag text="Safety pin" at={t.pin - 8} out={t.pin + 20} x={110} y={600} to={pin.behind ? null : pin} />
      <Tag text="Into his 90s" at={t.nineties - 14} out={t.end - 12} x={96} y={430} to={pile.behind ? null : pile} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("ee_click_click_01", t.yaris - 4, 10, 0.32),
    cueAt("whooshsoft", t.yaris + 30, 30, 0.32),            // in to the jacket
    cueAt("ee_click_click_01", t.pin - 4, 10, 0.32),
    cueAt("whooshsoft", t.pin + 40, 32, 0.32),              // out to the woodpile
    cueAt("ee_click_click_01", t.nineties - 14, 10, 0.3)
  ];
};
export const ST = { id: "yard", origin: YARD_O, from: W0().start - 8, to: W0().end + 8, light: { target: [1, 0, -1], shadowBox: 16, keyI: 1.15, fillI: 0.42, rimI: 1.0 }, shots, Scene, Overlay, sfx };
