// @ts-nocheck
// ★ V38 builder D — the RULES station's world: the small brick convenience store on Evart's main street at blue hour (the hook's
//   street, called back at the close) — its display window, a glass door, a sign band, the lit interior (tiled floor, shelves of
//   stock, the counter with a lottery terminal and a stand of WINFALL brochures, a pendant lamp), and the street outside: the row
//   of two-storey brick shops with lit windows and awnings, wet asphalt with the dashed centre line, the sidewalk and lamps.
//   Local metres; the store's front face is the plane z = 0 (street at +z); COUNTER_TOP is the counter's surface height.
//   rev 2 (builder A, Timur 2026-11-26: "the city scene at the end … make more detail … do them also the same exact"): the street is
//   built from the shared town kit (town_parts.tsx) exactly as the hook's, and the store wears the hook's CORNER STORE dress (its
//   sign, the blue striped awning, the blade sign, gooseneck lamps, the neon OPEN); its shelves carry the same printed goods.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd, std, Glow } from "./kit";
import { BODY, FIGURE } from "./fonts3d";
import { LightPool, LightWash, Shade, wallBand, floorBand, floorBlob } from "./st_state_fx";
import { Town, addBuilding, addProps, addGoods, STRIPS, GR } from "./town_parts";
import { storeSignTex, storeAwningTex, storeBladeTex, storeOpenTex } from "./st_store";

export const COUNTER_TOP = 0.96, COUNTER_Z = -0.75;
const STREET_X0 = -30, STREET_X1 = 40;   // rev 5: the street's extent (it runs on into the fog both ways)
// ── print ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const brickTex = (key, base) => canvasTex("rs_brick_" + key, 512, 512, (c, w, h) => {
  c.fillStyle = base; c.fillRect(0, 0, w, h);
  for (let r = 0, y = 0; y < h; y += 12, r++) for (let x = (r % 2) * 16 - 16; x < w; x += 32) {
    const v = rnd(r * 37 + x) * 0.16 - 0.08; c.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; c.fillRect(x + 1, y + 1, 30, 10);
  }
  c.fillStyle = "rgba(10,16,28,0.35)"; for (let y = 0; y < h; y += 12) c.fillRect(0, y, w, 1.6);
  for (let r = 0, y = 0; y < h; y += 12, r++) for (let x = (r % 2) * 16; x < w; x += 32) c.fillRect(x, y, 1.6, 12);
});
const signTex = () => canvasTex("rs_sign", 1024, 160, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#0F3E78"); g.addColorStop(1, "#0A2B55");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = "rgba(220,234,250,0.7)"; c.lineWidth = 4; c.strokeRect(10, 10, w - 20, h - 20);
  c.fillStyle = "#F2F7FD"; c.font = `110px ${FIGURE}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("CORNER STORE", w / 2, h / 2 + 6);
});
const decalTex = () => canvasTex("rs_decal", 256, 256, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  c.fillStyle = "rgba(0,93,200,0.92)"; c.beginPath(); c.arc(w / 2, h / 2, 120, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "#FFFFFF"; c.lineWidth = 6; c.beginPath(); c.arc(w / 2, h / 2, 108, 0, Math.PI * 2); c.stroke();
  c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `800 44px ${BODY}`; c.fillText("LOTTERY", w / 2, h / 2 - 22);
  c.font = `700 28px ${BODY}`; c.fillText("SOLD HERE", w / 2, h / 2 + 26);
});
const tileTex = () => canvasTex("rs_tile", 256, 256, (c, w, h) => {
  for (let r = 0; r < 8; r++) for (let k = 0; k < 8; k++) { c.fillStyle = (r + k) % 2 ? "#A9B4C4" : "#97A3B5"; c.fillRect(k * 32, r * 32, 32, 32); }
  c.fillStyle = "rgba(0,0,0,0.12)"; for (let i = 0; i <= 8; i++) { c.fillRect(i * 32, 0, 1, h); c.fillRect(0, i * 32, w, 1); }
});
const asphaltTex = () => canvasTex("rs_asphalt", 512, 512, (c, w, h) => {
  c.fillStyle = "#1a2433"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 12000; i++) { const g = 30 + rnd(i) * 40; c.fillStyle = `rgba(${g},${g + 8},${g + 20},${0.25 + rnd(i + 7) * 0.3})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
});
// ── the neighbours: the town kit (the same buildings as the hook's main street) ─────────────────────────────────────────────
const NEAR_SIGNS = [13, 0, 6, 8, 3, 11, 5, 9, 15, 10, 14], NEAR_KIND = ["brick", "clap", "brick", "brick", "clap", "brick", "brick", "brick", "clap", "brick", "brick"];
const FAR_SIGNS = [1, 4, 2, 7, 12, 0, 6, 13, 10, 5, 11, 3, 8, 9, 15, 14];
const buildStreet = (m, shops) => {
  // sidewalks (concrete slabs) and curbs, both sides of the road
  for (const z of [1.75, 14.25]) m.box("concrete", [5, 0.08, z], [STREET_X1 - STREET_X0, 0.16, 3.5], "#FFFFFF", { metric: true });
  for (const z of [3.43, 12.57]) m.box("trim", [5, 0.085, z], [STREET_X1 - STREET_X0, 0.17, 0.14], "#A3ABB6", { metric: true });
  shops.forEach((s, k) => {
    m.push([s.x, 0.16, 0], 0);
    addBuilding(m, { w: s.w - 0.05, h: s.h, d: 6, seed: s.i + 40, kind: NEAR_KIND[k % NEAR_KIND.length], brick: k % 4, sign: NEAR_SIGNS[k % NEAR_SIGNS.length], lit: 0.6 });
    m.pop();
  });
  // rev 5: no shop row across the street — the family home and its neighbours' back yards (st_total) are there; the camera cranes
  //   over that roof into this street
  const N = (x, type, z = 3.0) => ({ type, p: [x, 0.16, z], ry: 0 }), X = (x, type, z = 13.0) => ({ type, p: [x, 0.16, z], ry: Math.PI });
  addProps(m, [
    N(-8.5, "bench", 1.0), N(-11, "planter", 2.6), N(-13.2, "hydrant"), N(-19, "trash"), N(-21.5, "news", 0.9), N(-24, "meter"), N(-29, "planter", 2.6),
    N(5.2, "planter", 2.6), N(9.5, "bench", 1.0), N(12.5, "hydrant"),
    X(-12, "bench", 15.0), X(-21, "trash"), X(-26, "hydrant"), X(9, "meter")
  ]);
};
const Lamp = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 2.7, 0]} castShadow><cylinderGeometry args={[0.06, 0.1, 5.4, 10]} /><meshStandardMaterial color="#1b2636" metalness={0.6} roughness={0.4} /></mesh>
    <mesh position={[0, 5.3, -0.55]}><boxGeometry args={[0.08, 0.08, 1.2]} /><meshStandardMaterial color="#1b2636" metalness={0.6} roughness={0.4} /></mesh>
    <mesh position={[0, 5.15, -1.05]}><sphereGeometry args={[0.2, 16, 12]} /><meshStandardMaterial color="#FFE2B0" emissive="#FFC97A" emissiveIntensity={3} /></mesh>
    <Glow position={[0, 5.15, -1.05]} size={2.6} color="#FFC27A" opacity={0.75} />
    <LightPool position={[0, 0.17, -1.0]} r={3.4} color="#FFB867" opacity={0.3} />
  </group>
);
// ── the store ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
const WIN = { x0: -3.3, x1: 1.1, y0: 0.75, y1: 2.9 };
const buildStore = (m) => {
  const BR = "#C9C6CE", MT = { metric: true, uo: [0.37, 0.21] };
  // the facade around the openings (the hook store's brick), stone plinths and caps, the steel lintel, the cornice with dentils
  m.box("brick0", [-3.65, 2.2, -0.15], [0.7, 4.4, 0.3], BR, MT); m.box("brick0", [1.3, 1.45, -0.15], [0.4, 2.9, 0.3], BR, MT);
  m.box("brick0", [3.3, 1.45, -0.15], [1.4, 2.9, 0.3], BR, MT); m.box("brick0", [-1.1, 0.375, -0.15], [4.4, 0.75, 0.3], BR, MT);
  m.box("brick0", [0, 3.65, -0.15], [8, 1.5, 0.3], BR, MT);
  for (const x of [-3.62, 1.3, 3.85]) { m.box("brick0", [x, 2.25, 0.04], [0.34, 4.3, 0.08], BR, MT); m.box("trim", [x, 0.2, 0.05], [0.4, 0.4, 0.14], "#8D97A6"); m.box("trim", [x, 2.95, 0.06], [0.42, 0.12, 0.16], "#8D97A6"); }
  m.box("metal", [-1.1, 2.98, 0.02], [4.6, 0.18, 0.1], "#1E2733");
  m.box("trim", [-1.1, WIN.y0 - 0.03, 0.06], [4.6, 0.07, 0.2], "#8D97A6");
  m.box("trim", [0, 4.42, 0.05], [8, 0.08, 0.1], "#8D97A6");
  for (let i = 0; i < 40; i++) m.box("trim", [-3.9 + i * 7.8 / 39, 4.32, 0.05], [0.1, 0.08, 0.08], "#8D97A6");
  m.box("metal", [0, 4.55, 0.12], [8.3, 0.14, 0.36], "#1E2733");
  m.box("metal", [-1.1, WIN.y1 - 0.01, 0.02], [4.5, 0.06, 0.06], "#1B2433");
  // the door's kick plate, the step, the sign's steel frame
  m.box("metal", [2.05, 0.36, -0.03], [0.82, 0.36, 0.02], "#8FA9C8"); m.box("trim", [2.05, 0.03, 0.22], [1.2, 0.06, 0.44], "#8D97A6");
  m.box("metal", [0, 3.62, -0.01], [6.4, 0.9, 0.06], "#2A3240");
  // a news box and a trash can by the door (the same street furniture as the hook's)
  addProps(m, [{ type: "news", p: [3.4, 0.16, 0.9], ry: 0 }, { type: "trash", p: [-4.6, 0.16, 0.8], ry: 0 }]);
  // the counter's customer face (toward the window): kick plate, rails, raised panels, the steel nosing
  const cx = -1.2, cl = 3.6, fz = COUNTER_Z + 0.305;
  m.box("trim", [cx, 0.06, fz - 0.02], [cl, 0.12, 0.02], "#11161F");
  m.box("trim", [cx, 0.17, fz], [cl, 0.08, 0.02], "#2A3A52"); m.box("trim", [cx, COUNTER_TOP - 0.1, fz], [cl, 0.1, 0.02], "#2A3A52");
  for (let k = 0; k < 4; k++) { const px = cx - cl / 2 + (k + 0.5) * cl / 4; m.box("trim", [px, 0.52, fz + 0.012], [cl / 4 - 0.2, 0.5, 0.02], "#3E5270"); m.box("trim", [px, 0.52, fz + 0.022], [cl / 4 - 0.32, 0.38, 0.01], "#465C7C"); m.box("trim", [cx - cl / 2 + k * cl / 4, 0.52, fz], [0.08, 0.72, 0.02], "#2A3A52"); }
  // the back-wall shelving: uprights and the goods (the store station's printed packs), price strips
  for (let x = -3.7; x <= 3.5; x += 1.8) m.box("metal", [x, 1.45, -5.55], [0.04, 2.3, 0.4], "#7A8798");
  const goods = [];
  for (let s = 0; s < 4; s++) {
    let x = -3.6, i = 0; const y = 0.62 + s * 0.52;
    while (x < 3.6) {
      const n = 2 + Math.floor(rnd(s * 41 + i) * 3), v = Math.floor(rnd(s * 17 + i * 5) * 8);
      for (let q = 0; q < n && x < 3.6; q++) {
        if (s === 0) { goods.push({ type: "can", p: [x + 0.035, y, -5.45], s: [0.068, 0.122, 0.068], ry: Math.PI, v }); goods.push({ type: "can", p: [x + 0.035, y + 0.122, -5.45], s: [0.068, 0.122, 0.068], ry: Math.PI, v }); x += 0.074; }
        else if (s === 3) { goods.push({ type: "bag", p: [x + 0.09, y, -5.45], s: [0.17, 0.25, 0.07], v }); x += 0.18; }
        else { const big = s === 1; goods.push({ type: "box", p: [x + (big ? 0.1 : 0.08), y, -5.47], s: [big ? 0.19 : 0.15, big ? 0.28 : 0.2, 0.07], v: big ? v % 5 : 5 + (v % 3) }); x += big ? 0.2 : 0.16; }
      }
      x += 0.03; i++;
    }
    for (let k = 0; k < 14; k++) m.quad("goods", [-3.45 + k * 0.53, y - 0.035, -5.348], 0.5, 0.05, "#FFFFFF", GR.strip(s), {});
  }
  addGoods(m, goods);
};

// ★ rev 6 (Timur at ~2201 f: "at least add those fake shadows … a dark subtle shape under it, but the correct one … You can see the
//   corners better that way. We don't really want unlit objects"): the store's shade, placed where this station's key (upper RIGHT,
//   front: st_rules light.key [6, 14, 7]) and the room's ceiling panels are blocked — under every shelf board on the back panel (a
//   little to the left of the board, as the key throws it), at the foot of every product row on its board, on the board behind the
//   goods, beside every upright, in the back corners, along the floor/wall and ceiling/wall junctions, round the counter's kick and under
//   its nosing, under the terminal. Subtle (0.25–0.55), two merged meshes.
const SHELF_Y = [0, 1, 2, 3].map((k) => 0.6 + k * 0.52);
const STORE_BANDS = (() => {
  const b = [];
  for (const y of SHELF_Y) {
    b.push(wallBand(-0.16, y - 0.02, -6, 7.3, 0.34, 0.55, "+z", "top"));             // the board's shadow on the back panel
    b.push(floorBand(-0.1, y + 0.02, -5.75, 7.3, 0.2, 0.5, "-z"));                    // the board's top, darker where it meets the wall
    b.push(floorBand(-0.1, y + 0.02, -5.41, 7.3, 0.05, 0.38, "-z"));                  // the contact line in front of the product row
    b.push(wallBand(-0.1, y + 0.02, -5.404, 7.2, 0.07, 0.34, "+z", "bottom"));        // the foot of the product row (its own occlusion)
    b.push(wallBand(-0.1, y - 0.02, -5.344, 7.4, 0.035, 0.45, "+z", "top"));          // the board's front lip, its underside edge
  }
  for (const x of [-3.7, -1.9, -0.1, 1.7, 3.5]) b.push(wallBand(x - 0.03, 1.45, -6, 2.4, 0.16, 0.42, "+z", "right"));   // each upright's shadow (to its left)
  b.push(wallBand(-4, 1.6, -6, 3.2, 0.55, 0.5, "+z", "left"), wallBand(4, 1.6, -6, 3.2, 0.55, 0.42, "+z", "right"));   // the back corners
  b.push(wallBand(-4, 1.6, -6, 3.2, 0.55, 0.45, "+x", "right"), wallBand(4, 1.6, -6, 3.2, 0.55, 0.45, "-x", "left"));
  b.push(wallBand(0, 3.2, -6, 8, 0.4, 0.35, "+z", "top"));                             // ceiling / back wall
  b.push(floorBand(0, 0, -6, 8, 0.45, 0.55, "-z"), floorBand(-4, 0, -3, 6, 0.4, 0.42, "-x"), floorBand(4, 0, -3, 6, 0.4, 0.42, "+x"));   // floor junctions
  b.push(floorBand(-0.1, 0, -5.35, 7.4, 0.3, 0.4, "-z"));                             // the floor in front of the shelving's plinth
  // the counter (x −3.0…0.6, z −1.05…−0.45): the floor round its kick, the shade under its nosing on both faces
  b.push(floorBand(-1.2, 0, -0.43, 3.7, 0.32, 0.55, "-z"), floorBand(-1.2, 0, -1.07, 3.7, 0.32, 0.5, "+z"));
  b.push(floorBand(-3.06, 0, -0.75, 0.66, 0.3, 0.45, "+x"), floorBand(0.66, 0, -0.75, 0.66, 0.3, 0.45, "-x"));
  b.push(wallBand(-1.2, 0.94, -0.41, 3.62, 0.16, 0.5, "+z", "top"), wallBand(-1.2, 0.94, -1.06, 3.62, 0.16, 0.45, "-z", "top"));
  return b;
})();
const STORE_BLOBS = [floorBlob(-0.35, COUNTER_TOP, -0.83, 0.26, 0.22, 0.5), floorBlob(-1.2, 0.0, -0.75, 2.2, 0.55, 0.35)];
// rev 6: the street furniture's contact shade on the sidewalks (benches, planters, hydrants, bins, news boxes, meters), the lamps'
//   feet, and the storefront's foot on the sidewalk (the shadow box of the station key only covers the store front)
const PROP_R = { bench: [0.95, 0.4], planter: [0.55, 0.55], hydrant: [0.26, 0.26], trash: [0.36, 0.36], news: [0.36, 0.3], meter: [0.16, 0.16], mailbox: [0.36, 0.3] };
const STREET_BLOBS = [
  ...[[-8.5, "bench", 1.0], [-11, "planter", 2.6], [-13.2, "hydrant", 3.0], [-19, "trash", 3.0], [-21.5, "news", 0.9], [-24, "meter", 3.0], [-29, "planter", 2.6], [5.2, "planter", 2.6], [9.5, "bench", 1.0], [12.5, "hydrant", 3.0],
      [-12, "bench", 15.0], [-21, "trash", 13.0], [-26, "hydrant", 13.0], [9, "meter", 13.0], [3.4, "news", 0.9], [-4.6, "trash", 0.8]]
    .map(([x, k, z]) => floorBlob(x + 0.06, 0.16, z - 0.04, PROP_R[k][0] * 1.25, PROP_R[k][1] * 1.4, 0.55)),
  ...[-6, -16, -26, 7, 17, 27].map((x) => floorBlob(x, 0.16, 3.1, 0.42, 0.42, 0.6)),
  ...[-23, -13, 9, 19, 29].map((x) => floorBlob(-x, 0.16, 12.9, 0.42, 0.42, 0.6))
];
const FRONT_BANDS = [floorBand(0, 0.16, 0.0, 8.2, 0.55, 0.5, "-z"), wallBand(-1.1, 0.75, 0.0, 4.5, 0.12, 0.4, "+z", "bottom")];
const Store = () => {
  const sign = useMemo(storeSignTex, []), awn = useMemo(storeAwningTex, []), blade = useMemo(storeBladeTex, []), open = useMemo(storeOpenTex, []);
  const decal = useMemo(decalTex, []), tile = useMemo(() => { const t = tileTex(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 3); return t; }, []);
  const frame = <meshStandardMaterial color="#1B2433" metalness={0.6} roughness={0.35} />;
  return (
    <group>
      <Town build={buildStore} />
      <Shade items={STORE_BANDS} />
      <Shade items={FRONT_BANDS} />
      <Shade items={STORE_BLOBS} kind="blob" />
      {/* the hook store's dress: its CORNER STORE sign, the blue striped awning over the window, the blade sign, the neon OPEN */}
      <mesh position={[0, 3.62, 0.025]}><planeGeometry args={[6.3, 0.88]} /><meshStandardMaterial map={sign} roughness={0.4} emissiveMap={sign} emissive="#FFFFFF" emissiveIntensity={0.55} /></mesh>
      <group position={[-1.1, 2.98, 0.36]} rotation-x={0.38}>
        <mesh castShadow receiveShadow><boxGeometry args={[WIN.x1 - WIN.x0 + 0.3, 0.025, 0.8]} /><meshStandardMaterial map={awn} roughness={0.85} /></mesh>
        <mesh position={[0, -0.08, 0.4]} rotation-x={-0.38}><boxGeometry args={[WIN.x1 - WIN.x0 + 0.3, 0.16, 0.015]} /><meshStandardMaterial map={awn} roughness={0.85} /></mesh>
      </group>
      <group position={[3.95, 3.55, 0.05]} rotation-y={-Math.PI / 2}>
        <mesh position={[-0.45, 0.62, 0]}><boxGeometry args={[0.9, 0.04, 0.04]} /><meshStandardMaterial color="#2A3240" metalness={0.75} roughness={0.35} /></mesh>
        <mesh position={[-0.45, 0, 0]}><boxGeometry args={[0.78, 0.8, 0.06]} /><meshStandardMaterial color="#2A3240" metalness={0.75} roughness={0.35} /></mesh>
        {[1, -1].map((sd) => <mesh key={sd} position={[-0.45, 0, sd * 0.031]} rotation-y={sd > 0 ? 0 : Math.PI}><planeGeometry args={[0.72, 0.74]} /><meshStandardMaterial map={blade} roughness={0.4} emissiveMap={blade} emissive="#ffffff" emissiveIntensity={0.6} /></mesh>)}
      </group>
      <mesh position={[2.05, 2.05, -0.1]}><planeGeometry args={[0.7, 0.26]} /><meshBasicMaterial map={open} transparent blending={THREE.AdditiveBlending} opacity={0.9} toneMapped={false} depthWrite={false} /></mesh>
      <Glow position={[2.05, 2.05, 0.0]} size={1.1} color="#FF9F5E" opacity={0.3} />
      {[-1, 1].map((sd) => <group key={sd}><mesh position={[sd * 3.1, 4.05, 0.25]}><cylinderGeometry args={[0.03, 0.03, 0.5, 6]} /><meshStandardMaterial color="#1B2433" /></mesh><mesh position={[sd * 3.1, 3.82, 0.32]} rotation-x={0.5}><coneGeometry args={[0.16, 0.2, 12, 1, true]} /><meshStandardMaterial color="#1B2433" side={THREE.DoubleSide} /></mesh><Glow position={[sd * 3.1, 3.72, 0.36]} size={0.9} color="#FFE2B0" opacity={0.8} /></group>)}
      {/* the display window: frame, mullions, the glass (a faint reflection), the decal */}
      {[[WIN.x0, (WIN.y0 + WIN.y1) / 2, 0.06, WIN.y1 - WIN.y0], [WIN.x1, (WIN.y0 + WIN.y1) / 2, 0.06, WIN.y1 - WIN.y0], [-1.1, (WIN.y0 + WIN.y1) / 2, 0.05, WIN.y1 - WIN.y0]].map(([x, y, w, h], i) => <mesh key={i} position={[x, y, -0.05]}><boxGeometry args={[w, h, 0.08]} />{frame}</mesh>)}
      {[WIN.y0, WIN.y1].map((y, i) => <mesh key={i} position={[(WIN.x0 + WIN.x1) / 2, y, -0.05]}><boxGeometry args={[WIN.x1 - WIN.x0 + 0.06, 0.06, 0.08]} />{frame}</mesh>)}
      <mesh position={[(WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, -0.06]} renderOrder={3}><planeGeometry args={[WIN.x1 - WIN.x0, WIN.y1 - WIN.y0]} /><meshStandardMaterial color="#A9C3E6" transparent opacity={0.06} metalness={0.0} roughness={0.1} envMapIntensity={0.3} depthWrite={false} /></mesh>
      <mesh position={[0.45, 2.45, -0.055]} renderOrder={4}><planeGeometry args={[0.42, 0.42]} /><meshBasicMaterial map={decal} transparent depthWrite={false} /></mesh>
      {/* the glass door with its frame and push bar */}
      <mesh position={[2.05, 1.25, -0.08]} renderOrder={3}><planeGeometry args={[0.9, 2.4]} /><meshStandardMaterial color="#A9C3E6" transparent opacity={0.08} metalness={0.0} roughness={0.1} envMapIntensity={0.3} depthWrite={false} /></mesh>
      {[[1.58, 1.25, 0.06, 2.5], [2.52, 1.25, 0.06, 2.5]].map(([x, y, w, h], i) => <mesh key={i} position={[x, y, -0.06]}><boxGeometry args={[w, h, 0.08]} />{frame}</mesh>)}
      <mesh position={[2.05, 2.52, -0.06]}><boxGeometry args={[1.0, 0.08, 0.08]} />{frame}</mesh>
      <mesh position={[2.05, 1.05, -0.02]}><boxGeometry args={[0.7, 0.05, 0.05]} /><meshStandardMaterial color="#B9C6D8" metalness={0.9} roughness={0.3} /></mesh>
      {/* the interior shell (no shadows from the shell, so the key still reaches the counter) */}
      <mesh position={[0, 0.005, -3]} rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[8, 6]} /><meshStandardMaterial map={tile} roughness={0.3} metalness={0.05} /></mesh>
      <mesh position={[0, 1.6, -6]}><planeGeometry args={[8, 3.2]} /><meshStandardMaterial color="#C7B79E" roughness={0.9} /></mesh>
      {[-4, 4].map((x) => <mesh key={x} position={[x, 1.6, -3]} rotation-y={x < 0 ? Math.PI / 2 : -Math.PI / 2}><planeGeometry args={[6, 3.2]} /><meshStandardMaterial color="#B8AA94" roughness={0.9} /></mesh>)}
      <mesh position={[0, 3.2, -3]} rotation-x={Math.PI / 2}><planeGeometry args={[8, 6]} /><meshStandardMaterial color="#D8DCE2" roughness={0.9} emissive="#FFE8C8" emissiveIntensity={0.15} /></mesh>
      {/* shelving and stock on the back wall */}
      {[0, 1, 2, 3].map((s) => <mesh key={s} position={[-0.1, 0.6 + s * 0.52, -5.55]} receiveShadow><boxGeometry args={[7.4, 0.04, 0.4]} /><meshStandardMaterial color="#E2E6EC" roughness={0.6} /></mesh>)}
      {/* two ceiling light panels */}
      {[-2, 1.5].map((x) => <mesh key={x} position={[x, 3.19, -3]} rotation-x={Math.PI / 2}><planeGeometry args={[1.2, 0.5]} /><meshBasicMaterial color="#FFF4E0" /></mesh>)}
      {/* the counter along the window: a panelled front, a dark laminate top with a steel nosing */}
      <mesh position={[-1.2, COUNTER_TOP / 2 - 0.02, COUNTER_Z]} castShadow receiveShadow><boxGeometry args={[3.6, COUNTER_TOP - 0.04, 0.6]} /><meshStandardMaterial color="#2C3A52" roughness={0.6} /></mesh>
      <mesh position={[-1.2, COUNTER_TOP - 0.02, COUNTER_Z]} castShadow receiveShadow><boxGeometry args={[3.7, 0.04, 0.66]} /><meshStandardMaterial color="#1C2534" roughness={0.55} metalness={0.0} envMapIntensity={0.15} /></mesh>
      <mesh position={[-1.2, COUNTER_TOP - 0.02, COUNTER_Z + 0.335]}><boxGeometry args={[3.7, 0.045, 0.012]} /><meshStandardMaterial color="#B9C6D8" metalness={0.9} roughness={0.25} /></mesh>
      {/* the lottery terminal: a small cabinet, its screen (cool light), a slip reader slot */}
      <group position={[-0.35, COUNTER_TOP, COUNTER_Z - 0.08]} rotation-y={Math.PI - 0.35}>
        <mesh position={[0, 0.09, 0]} castShadow><boxGeometry args={[0.36, 0.18, 0.3]} /><meshStandardMaterial color="#D8DEE6" roughness={0.5} /></mesh>
        <mesh position={[0, 0.3, -0.06]} rotation-x={-0.25} castShadow><boxGeometry args={[0.32, 0.24, 0.03]} /><meshStandardMaterial color="#1B2433" roughness={0.4} /></mesh>
        <mesh position={[0, 0.3, -0.043]} rotation-x={-0.25}><planeGeometry args={[0.27, 0.19]} /><meshBasicMaterial color="#6FA6E8" /></mesh>
        <mesh position={[0, 0.181, 0.06]}><boxGeometry args={[0.24, 0.005, 0.03]} /><meshStandardMaterial color="#1B2433" /></mesh>
      </group>
      {/* the brochure stand: a clear acrylic tray of folded WINFALL leaflets */}
      {/* the pendant lamp over the counter */}
      <mesh position={[-2.05, 2.95, COUNTER_Z]}><cylinderGeometry args={[0.008, 0.008, 0.5, 6]} /><meshStandardMaterial color="#111" /></mesh>
      <mesh position={[-2.05, 2.66, COUNTER_Z]}><coneGeometry args={[0.22, 0.2, 24, 1, true]} /><meshStandardMaterial color="#14223A" metalness={0.5} roughness={0.4} side={THREE.DoubleSide} /></mesh>
      <mesh position={[-2.05, 2.6, COUNTER_Z]}><sphereGeometry args={[0.06, 12, 8]} /><meshBasicMaterial color="#FFF2DC" /></mesh>
      <Glow position={[-2.05, 2.58, COUNTER_Z]} size={0.8} color="#FFE2B8" opacity={0.85} />
      <pointLight position={[-2.05, 2.5, COUNTER_Z]} intensity={4.5} distance={5} decay={1.6} color="#FFE6C6" />
      {/* the store's light on the sidewalk */}
      <LightPool position={[-1.1, 0.17, 1.3]} r={2.6} sx={1.4} color="#FFD6A0" opacity={0.3} />
    </group>
  );
};
// ── the street ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const Street = () => {
  const asphalt = useMemo(() => { const t = asphaltTex(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(13.5, 3); return t; }, []);
  const shops = useMemo(() => {
    const out = []; let x = -4.15, i = 0;
    while (x > STREET_X0) { const w = 6.4 + rnd(i + 2) * 2; out.push({ x: x - w / 2, w, h: 6.2 + Math.floor(rnd(i + 4) * 3) * 2.2, i }); x -= w + 0.05; i++; }
    x = 4.15; while (x < STREET_X1) { const w = 6.4 + rnd(i + 2) * 2; out.push({ x: x + w / 2, w, h: 6.2 + Math.floor(rnd(i + 4) * 3) * 2.2, i }); x += w + 0.05; i++; }
    return out;
  }, []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.045, 0]} receiveShadow><planeGeometry args={[400, 400]} /><meshStandardMaterial color="#0C1F33" roughness={0.95} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[5, 0, 8]} receiveShadow><planeGeometry args={[STREET_X1 - STREET_X0 + 20, 9]} /><meshStandardMaterial map={asphalt} color="#7a8aa3" roughness={0.3} metalness={0.15} /></mesh>
      {Array.from({ length: 13 }, (_, i) => <mesh key={i} rotation-x={-Math.PI / 2} position={[44 - i * 7, 0.005, 8]}><planeGeometry args={[3.2, 0.16]} /><meshStandardMaterial color="#E8C766" emissive="#6b5520" emissiveIntensity={0.3} roughness={0.5} /></mesh>)}
      <Store />
      {/* the store's own depth behind its facade */}
      <mesh position={[0, 4.45, -3.2]} castShadow><boxGeometry args={[8.1, 0.3, 6.2]} /><meshStandardMaterial color="#232D3C" roughness={0.7} /></mesh>
      <Town build={(m) => buildStreet(m, shops)} />
      <Shade items={STREET_BLOBS} kind="blob" />
      {/* across the street: its lamps (its row of shops is in the merged street above) */}
      <group position={[0, 0, 16]} rotation-y={Math.PI}>
        {[-23, -13, 9, 19, 29].map((x) => <Lamp key={x} x={x} z={3.1} />)}
      </group>
      {[-6, -16, -26, 7, 17, 27].map((x) => <Lamp key={x} x={x} z={3.1} />)}
    </group>
  );
};
