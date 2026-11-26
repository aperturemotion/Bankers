// @ts-nocheck
// ★ V38 station ROAD (builder C): "Then they found a similar game in Massachusetts. For 6 years, they drove 900 miles a trip, often
//   betting over $600,000."
//   A night interstate, eastbound. The Selbees' sedan runs in the right lane with its headlights cutting cones through the haze; the
//   road streams past (the world scrolls, the car holds, so the camera can stay on it): dashed lanes, a concrete median, guardrail,
//   reflector posts, pines in silhouette, a truck's tail lights far ahead, oncoming headlights across the median.
//   ARRIVAL: a flight from the company station (first shot a ≈ 1062, b ≈ 1102, landing high behind the car).
//   1100  the camera cranes down behind the car; an overhead gantry sign MASSACHUSETTS comes out of the haze (tag CASH WINFALL on
//         "similar game"), and passes over the camera after "Massachusetts".
//   1160  "For 6 years": the camera swings round to the car's side (pill PLAYED 6 YEARS).
//   1206  "900 miles": the camera rises to a high aerial ahead of the car, the road reaching into the dark; an odometer rolls to 900.
//   1262  "often betting": the camera drops in behind the car; the shell turns to glass (white rim) and the cabin shows the tubs of
//         tickets, which glow in the house light blue (tag TUBS OF TICKETS); "$600,000+" lands on its word (label OFTEN, A ROUND).
//   1336  DEPARTURE: the shell dissolves and the camera pushes into one ticket in the trunk until it fills the frame (1356); the
//         globe station cuts (cut: true) to the identical ticket on the MIT group's stack and pulls back.
import { roadArrival, ROAD_FROM } from "./xfer_company_road";
import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { canvasTex, std, ease, easeOut, rnd, clamp01, Sky, Glow } from "./kit";
import { Tag, Counter, Pill } from "./overlays";
import { cueAt } from "../bnx/SfxLayer";
import { BODY, FIGURE } from "./fonts3d";
import { wa, wAt, undrift, Inst, heroCam, Stars } from "./st_road_parts";
import { Car, TRUNK_TUB } from "./st_road_car";

export const ROAD_O = [1200, 0, 0];
// authored with the car running along +x; the station turns it a quarter so the camera looks down world −z, as the house key
// (upper left, behind the camera) expects: design (x, y, z) → world (z, y, −x)
export const ROT = (p) => [p[2], p[1], -p[0]];
const A = (p) => { const r = ROT(p); return [r[0] + ROAD_O[0], r[1] + ROAD_O[1], r[2] + ROAD_O[2]]; };
export const ROAD_CUT = 1356;   // the push lands here; the globe's cut shows from the next frame
const T = () => {
  const then = wa("then", 1080), similar = wa("similar", 1080), mass = wa("massachusetts.", 1080), forW = wa("for", 1150);
  const years = wa("6 years,", 1150), miles = wa("900 miles", 1150), often = wa("often", 1250), betting = wa("betting", 1250), money = wa("$600,000.", 1250);
  return { then, similar, mass, massEnd: wAt("massachusetts.", 1080).end, forW, years, miles, often, betting, money, moneyEnd: wAt("$600,000.", 1250).end, cut: ROAD_CUT };
};
// ── the world scrolls: the car holds at the origin, everything else streams toward −x at highway speed ─────────────────────────
const V = 0.85;                      // m per frame (~57 mph on screen; reads as cruising without strobing the 12-m lane period)
const S = (f) => V * (f - 1000);
const PERIOD = 48;                   // every roadside repeat (posts, reflectors, pines) repeats every 48 m, so the scroll wraps seamlessly
// cross-section (z): car lane centre 0; right shoulder to 4.8, guardrail 5.1; left lane to −5.4, median barrier −7.1; westbound beyond
const ROAD_Z0 = -19.5, ROAD_Z1 = 5.2, ROAD_LEN = 420, ROAD_X = 90;
const zRow = (z) => ((z - ROAD_Z0) / (ROAD_Z1 - ROAD_Z0)) * 1024;
const roadTex = () => canvasTex("c_interstate", 512, 1024, (c, w, h) => {
  // asphalt with grain, two wheel-track sheens per lane, the lane lines (12-m period along x = the canvas width)
  c.fillStyle = "#1B2535"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 26000; i++) { const g = 26 + rnd(i) * 44; c.fillStyle = `rgba(${g},${g + 8},${g + 22},${0.22 + rnd(i + 7) * 0.32})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  const band = (z0, z1, col) => { c.fillStyle = col; c.fillRect(0, zRow(z0), w, zRow(z1) - zRow(z0)); };
  [[-0.9, -0.5], [0.5, 0.9], [-4.5, -4.1], [-3.1, -2.7], [-15.2, -14.8], [-13.8, -13.4], [-11.6, -11.2], [-10.2, -9.8]].forEach(([a, b]) => band(a, b, "rgba(10,16,28,0.35)"));
  band(1.8, 4.8, "rgba(60,74,96,0.25)"); band(-6.6, -5.4, "rgba(60,74,96,0.25)"); band(-8.8, -7.6, "rgba(60,74,96,0.25)"); band(-19.5, -16.0, "rgba(60,74,96,0.25)");
  // the lines: white edges, a yellow left edge, white dashes 3 m of every 12 m
  band(1.72, 1.86, "#E9EEF6"); band(-5.47, -5.33, "#E3C25E"); band(-7.67, -7.53, "#E3C25E"); band(-16.07, -15.93, "#E9EEF6");
  c.fillStyle = "#E9EEF6";
  [-1.8, -12.4].forEach((z) => c.fillRect(0, zRow(z - 0.07), w * 0.25, zRow(z + 0.07) - zRow(z - 0.07)));
  // rumble strips on the shoulders
  c.fillStyle = "rgba(10,16,26,0.5)"; for (let x = 0; x < w; x += 12) { c.fillRect(x, zRow(2.1), 5, zRow(2.6) - zRow(2.1)); c.fillRect(x, zRow(-6.3), 5, zRow(-5.8) - zRow(-6.3)); }
});
const signTex = () => canvasTex("c_massSign", 1024, 360, (c, w, h) => {
  c.fillStyle = "#0B3F7A"; c.fillRect(0, 0, w, h);
  c.strokeStyle = "#FFFFFF"; c.lineWidth = 12; c.beginPath(); c.roundRect(16, 16, w - 32, h - 32, 26); c.stroke();
  c.fillStyle = "#FFFFFF"; c.textAlign = "center";
  c.font = `700 62px ${BODY}`; c.fillText("EAST", w / 2, 102);
  c.font = `800 150px ${BODY}`; c.fillText("MASSACHUSETTS", w / 2, 262, w - 90);
  // an arrow down to the lane, either side
  [130, w - 130].forEach((x) => { c.beginPath(); c.moveTo(x, 300); c.lineTo(x - 26, 262); c.lineTo(x - 9, 262); c.lineTo(x - 9, 220); c.lineTo(x + 9, 220); c.lineTo(x + 9, 262); c.lineTo(x + 26, 262); c.closePath(); c.fill(); });
});
// the gantry passes over the camera (chase cam at x −8.5) 10 f after "Massachusetts." ends
const gantryX = (f, t) => -8.5 + (S(t.massEnd + 10) - S(f));
const barrierShape = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.31, 0); s.lineTo(0.31, 0); s.lineTo(0.31, 0.08); s.lineTo(0.18, 0.25); s.lineTo(0.08, 0.81); s.lineTo(-0.08, 0.81); s.lineTo(-0.18, 0.25); s.lineTo(-0.31, 0.08); s.closePath();
  return s;
};
const Roadside = ({ f }) => {
  const geo = useMemo(() => ({
    post: new THREE.BoxGeometry(0.1, 0.8, 0.12),
    refl: new THREE.BoxGeometry(0.05, 0.12, 0.09),
    deli: new THREE.CylinderGeometry(0.04, 0.04, 1.1, 6),
    cone1: new THREE.ConeGeometry(1, 1, 11),
    trunk: new THREE.CylinderGeometry(0.15, 0.2, 1, 5)
  }), []);
  const mat = useMemo(() => ({
    post: std("#5E6E84", 0.5, 0.6), refl: new THREE.MeshStandardMaterial({ color: "#FFFFFF", emissive: "#CFE3FF", emissiveIntensity: 1.6 }),
    reflAmber: new THREE.MeshStandardMaterial({ color: "#FFE2A0", emissive: "#FFC97A", emissiveIntensity: 1.2 }),
    deli: std("#D8E2EE", 0.5, 0.1), pine: std("#0C2036", 0.92, 0), pine2: std("#0F2741", 0.92, 0), trunk: std("#0A1828", 0.9, 0)
  }), []);
  const items = useMemo(() => {
    const n = Math.ceil(ROAD_LEN / PERIOD) + 1, x0 = ROAD_X - ROAD_LEN / 2;
    const posts = [], refl = [], reflM = [], deli = [], pines = [], pines2 = [], trunks = [];
    for (let p = 0; p < n; p++) {
      const bx = x0 + p * PERIOD;
      for (let k = 0; k < 24; k++) posts.push({ p: [bx + k * 2, 0.4, 5.25] });
      for (let k = 0; k < 4; k++) { refl.push({ p: [bx + k * 12, 0.62, 5.12] }); reflM.push({ p: [bx + k * 12 + 6, 0.7, -6.95] }); deli.push({ p: [bx + k * 12 + 3, 0.55, 7.2] }); }
      for (let k = 0; k < 22; k++) {
        // pines in two belts, right and left of the roadway; same pattern every period
        const right = k < 11, j = k % 11;
        const x = bx + (j / 11) * PERIOD + rnd(k * 5 + 1) * 3;
        const z = right ? 9.5 + rnd(k * 3 + 2) * 16 + (j % 3) * 4 : -22 - rnd(k * 3 + 5) * 18 - (j % 3) * 4;
        const hgt = 7 + rnd(k * 9 + 3) * 9, r = hgt * 0.27;
        (k % 2 ? pines : pines2).push({ p: [x, 1.4 + hgt * 0.5, z], s: [r, hgt, r] });
        (k % 2 ? pines : pines2).push({ p: [x, 1.4 + hgt * 0.78, z], s: [r * 0.7, hgt * 0.55, r * 0.7] });
        trunks.push({ p: [x, 0.7, z], s: [1, 1.4, 1] });
      }
    }
    return { posts, refl, reflM, deli, pines, pines2, trunks };
  }, []);
  const shift = -(S(f) % PERIOD);
  return (
    <group position={[shift, 0, 0]}>
      <Inst geo={geo.post} mat={mat.post} items={items.posts} castShadow />
      <Inst geo={geo.refl} mat={mat.refl} items={items.refl} />
      <Inst geo={geo.refl} mat={mat.reflAmber} items={items.reflM} />
      <Inst geo={geo.deli} mat={mat.deli} items={items.deli} />
      <Inst geo={geo.cone1} mat={mat.pine} items={items.pines} />
      <Inst geo={geo.cone1} mat={mat.pine2} items={items.pines2} />
      <Inst geo={geo.trunk} mat={mat.trunk} items={items.trunks} />
    </group>
  );
};
// oncoming cars (westbound, across the median) and a truck far ahead in the left lane: lights first, bodies dim
const Traffic = ({ f }) => {
  const cars = [0, 1, 2, 3].map((i) => {
    const span = 300, x = 220 - ((f * (V + 0.9) + i * 77 + rnd(i) * 30) % span);
    const fade = clamp01((220 - x) / 50) * clamp01((x + 70) / 20);
    return { x, z: i % 2 ? -10.9 : -14.4, fade };
  });
  const tx = 64 - 0.04 * (f - 1060);
  return (
    <group>
      {cars.map((c, i) => (
        <group key={i} position={[c.x, 0, c.z]}>
          <mesh position={[0, 0.72, 0]} castShadow><boxGeometry args={[4.5, 0.8, 1.8]} /><meshStandardMaterial color="#2A3A52" metalness={0.4} roughness={0.4} /></mesh>
          <mesh position={[0.2, 1.3, 0]}><boxGeometry args={[2.1, 0.5, 1.5]} /><meshStandardMaterial color="#0B1626" metalness={0.3} roughness={0.15} /></mesh>
          {[-0.62, 0.62].map((z) => <Glow key={z} position={[-2.3, 0.72, z]} size={1.6} color="#E4EEFF" opacity={0.9 * c.fade} />)}
          {[-0.62, 0.62].map((z) => <Glow key={"c" + z} position={[-2.32, 0.72, z]} size={0.5} color="#FFFFFF" opacity={c.fade} />)}
        </group>
      ))}
      {/* a box truck far ahead in the left lane: tail lights and a lit plate */}
      <group position={[tx, 0, -3.6]}>
        <mesh position={[4, 2.1, 0]} castShadow><boxGeometry args={[9, 3.2, 2.5]} /><meshStandardMaterial color="#7F93AF" roughness={0.5} metalness={0.3} /></mesh>
        <mesh position={[9.4, 1.5, 0]}><boxGeometry args={[1.8, 2.2, 2.4]} /><meshStandardMaterial color="#3B5274" roughness={0.4} /></mesh>
        {[-1.05, 1.05].map((z) => <Glow key={z} position={[-0.55, 0.9, z]} size={1.4} color="#FF4A4A" opacity={0.75} />)}
        {[-1.05, 1.05].map((z) => <Glow key={"u" + z} position={[-0.55, 3.55, z]} size={0.5} color="#FFB36B" opacity={0.7} />)}
        {[0, 1, 2].map((k) => <mesh key={k} position={[-0.52, 0.5 + k * 0.02, 0]}><boxGeometry args={[0.04, 0.06 + k * 0.0, 2.3]} /><meshStandardMaterial color="#D8E2EE" emissive="#D8E2EE" emissiveIntensity={0.05} /></mesh>)}
      </group>
    </group>
  );
};
const Gantry = ({ f, t }) => {
  const tex = useMemo(signTex, []);
  const x = gantryX(f, t);
  if (x < -40 || x > 140) return null;
  const steel = { color: "#8FA0B6", metalness: 0.7, roughness: 0.35 };
  const zc = -1.3, half = 6.6;
  return (
    <group position={[x, 0, 0]}>
      {/* two lattice towers: four legs each, on concrete footings */}
      {[5.7, -7.1].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow><boxGeometry args={[1.4, 0.8, 1.2]} /><meshStandardMaterial color="#6D7B8E" roughness={0.85} /></mesh>
          {[[-0.45, -0.35], [0.45, -0.35], [-0.45, 0.35], [0.45, 0.35]].map(([a, b], i) => <mesh key={i} position={[a, 4.7, b]} castShadow><cylinderGeometry args={[0.07, 0.07, 8.0, 8]} /><meshStandardMaterial {...steel} /></mesh>)}
          {Array.from({ length: 8 }, (_, k) => <mesh key={"d" + k} position={[-0.45, 1.2 + k * 0.95, 0]} rotation-x={k % 2 ? 0.75 : -0.75}><cylinderGeometry args={[0.03, 0.03, 0.95, 6]} /><meshStandardMaterial {...steel} /></mesh>)}
          {Array.from({ length: 8 }, (_, k) => <mesh key={"e" + k} position={[0.45, 1.2 + k * 0.95, 0]} rotation-x={k % 2 ? -0.75 : 0.75}><cylinderGeometry args={[0.03, 0.03, 0.95, 6]} /><meshStandardMaterial {...steel} /></mesh>)}
        </group>
      ))}
      {/* the box truss across the roadway */}
      {[[7.9, -0.45], [7.9, 0.45], [8.8, -0.45], [8.8, 0.45]].map(([y, xx], i) => <mesh key={i} position={[xx, y, -0.7]} castShadow><boxGeometry args={[0.1, 0.1, 13.6]} /><meshStandardMaterial {...steel} /></mesh>)}
      {Array.from({ length: 14 }, (_, k) => <mesh key={"v" + k} position={[-0.45, 8.35, -7.2 + k * 1.0]} rotation-x={k % 2 ? 0.8 : -0.8}><cylinderGeometry args={[0.03, 0.03, 1.15, 6]} /><meshStandardMaterial {...steel} /></mesh>)}
      {/* the sign panel, faced toward the traffic (−x), with its catwalk and three sign lights under it */}
      <group position={[-0.62, 6.75, zc]}>
        <mesh castShadow><boxGeometry args={[0.12, 2.75, 7.75]} /><meshStandardMaterial color="#0A2F5E" roughness={0.6} /></mesh>
        <mesh position={[-0.065, 0, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[7.75, 2.73]} /><meshStandardMaterial map={tex} roughness={0.45} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.38} /></mesh>
        <mesh position={[-0.6, -1.5, 0]}><boxGeometry args={[1.0, 0.06, 7.8]} /><meshStandardMaterial {...steel} /></mesh>
        {[-2.6, 0, 2.6].map((z) => (
          <group key={z} position={[-1.0, -1.42, z]}>
            <mesh><boxGeometry args={[0.3, 0.14, 0.42]} /><meshStandardMaterial color="#3E4E64" metalness={0.5} roughness={0.4} /></mesh>
            <Glow position={[-0.1, -0.05, 0]} size={0.9} color="#EAF3FF" opacity={0.7} />
          </group>
        ))}
      </group>
    </group>
  );
};
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  const road = useMemo(roadTex, []);
  road.wrapS = THREE.RepeatWrapping; road.wrapT = THREE.ClampToEdgeWrapping;
  road.repeat.set(ROAD_LEN / 12, 1); road.offset.x = (S(f) / 12) % 1;
  const barrier = useMemo(() => { const g = new THREE.ExtrudeGeometry(barrierShape(), { depth: ROAD_LEN, bevelEnabled: false }); g.rotateY(Math.PI / 2); g.translate(ROAD_X - ROAD_LEN / 2, 0, 0); return g; }, []);
  // the reveal: shell → glass with a white flash, then the tubs glow; for the push the whole car dissolves
  const xr = ease(f, t.betting - 6, t.betting + 6);
  const flash = clamp01(1 - Math.abs(f - (t.betting + 2)) / 7);
  const glow = ease(f, t.betting + 8, t.betting + 20) * (1 - 0.5 * ease(f, t.money + 30, t.cut - 20));
  const shell = 1 - ease(f, t.cut - 22, t.cut - 10);
  const bob = 0.012 * Math.sin(f / 6.3) * (1 - ease(f, t.cut - 40, t.cut - 26));
  return (
    <group rotation-y={Math.PI / 2}>
      <Sky zenith="#020A1A" mid="#06193A" horizon="#24508A" glowAt={0.5} />
      <Stars />
      {/* the roadway: one asphalt plane carrying all its lines; verges either side */}
      <mesh rotation-x={-Math.PI / 2} position={[ROAD_X, 0, (ROAD_Z0 + ROAD_Z1) / 2]} receiveShadow>
        <planeGeometry args={[ROAD_LEN, ROAD_Z1 - ROAD_Z0]} />
        <meshStandardMaterial map={road} roughness={0.42} metalness={0.18} envMapIntensity={0.2} color="#7F8FA8" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[ROAD_X, -0.03, 0]} receiveShadow><planeGeometry args={[ROAD_LEN, 260]} /><meshStandardMaterial color="#0B1E33" roughness={0.95} /></mesh>
      {/* median barrier (concrete), the guardrail beam (steel) */}
      <mesh geometry={barrier} position={[0, 0, -7.1]} castShadow receiveShadow><meshStandardMaterial color="#8C9AAE" roughness={0.8} /></mesh>
      <mesh position={[ROAD_X, 0.62, 5.12]} castShadow><boxGeometry args={[ROAD_LEN, 0.32, 0.05]} /><meshStandardMaterial color="#AEBBCC" metalness={0.75} roughness={0.3} /></mesh>
      <Roadside f={f} />
      <Traffic f={f} />
      <Gantry f={f} t={t} />
      <group position={[0, bob, 0]}>
        <Car xray={xr} flash={flash} shell={shell} glow={glow} spin={-f * 0.22} />
      </group>
    </group>
  );
};
// ── the camera (local keys; + ROAD_O) ───────────────────────────────────────────────────────────────────────────────────────
const shots = () => {
  const t = T();
  const close = heroCam(TRUNK_TUB, 0.19);
  return [
    ...roadArrival(A, t),                                                                                          // arrival (xfer_company_road.ts)
    { a: 1104, b: t.similar + 24, pos: A([-12.5, 3.2, -0.7]), target: A([12, 2.4, -0.5]), fov: 36 },              // crane down behind the car
    { a: t.mass + 14, b: t.massEnd + 6, pos: A([-11.2, 2.7, -1.0]), target: A([10, 4.3, -0.8]), fov: 38 },         // tilt up as the sign goes over
    { a: t.forW - 4, b: t.forW + 22, pos: A([0.5, 2.6, -8.2]), target: A([0.3, 0.8, 0]), fov: 36 },              // round to the side …
    { a: t.forW + 14, b: t.forW + 46, pos: A([10.5, 2.1, -5.2]), target: A([0, 0.8, 0]), fov: 34 },             // … and ahead of it
    { a: t.miles - 10, b: t.miles + 36, pos: A([-9, 21, -1.0]), target: A([5, 0, 0]), fov: 38 },                // high aerial ahead
    { a: t.often - 8, b: t.betting + 16, pos: A([-7.8, 4.4, -4.6]), target: A([-0.5, 0.75, 0]), fov: 36 },          // in behind the trunk
    { a: t.cut - 34, b: t.cut - 12, pos: A(heroCam(TRUNK_TUB, 1.4).pos), target: A(close.target), fov: 34 },     // line up on one ticket
    { a: t.cut - 15, b: t.cut, pos: undrift(A(close.pos), t.cut), target: A(close.target), fov: 34 }              // push straight into it
  ];
};
// an odometer: drums that roll as a real one does (the lowest turns, the next turns over in the last tenth)
const Odometer = ({ at, out, value, x = 540, y = 330, label, unit }) => {
  const f = useCurrentFrame();
  const kIn = easeOut(f, at, at + 14), kOut = ease(f, out, out + 10), vis = kIn * (1 - kOut);
  if (vis <= 0.001) return null;
  const v = value * easeOut(f, at + 2, at + 34);
  const digits = 4, size = 112, cell = size * 1.12;
  const pos = [];
  for (let i = 0; i < digits; i++) {
    const p = Math.pow(10, i), q = v / p;
    if (i === 0) pos.push(q % 10);
    else { const lower = v % p, carry = clamp01(lower - (p - 1)); pos.push((Math.floor(q) % 10) + carry); }
  }
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, ${(1 - kIn) * 22 - kOut * 14}px)`, opacity: vis, background: "rgba(4,18,38,0.86)", borderRadius: 14, padding: "14px 26px 18px", boxShadow: "0 10px 40px rgba(0,8,20,0.5)", textAlign: "center" }}>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: "#B3CEEF", marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
        <div style={{ display: "flex", gap: 6, padding: 6, background: "#020B18", borderRadius: 8, border: "2px solid rgba(179,206,239,0.35)" }}>
          {pos.slice().reverse().map((p, i) => (
            <div key={i} style={{ width: size * 0.62, height: cell, overflow: "hidden", position: "relative", borderRadius: 5, background: "linear-gradient(#0E1E36, #1C3355 50%, #0E1E36)" }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: "100%", transform: `translateY(${-p * cell}px)` }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, k) => <div key={k} style={{ height: cell, lineHeight: `${cell}px`, fontFamily: FIGURE, fontSize: size, color: i < digits - 3 && v < 1000 ? "#5E7FA8" : "#FFFFFF", textAlign: "center" }}>{d}</div>)}
              </div>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.45))" }} />
            </div>
          ))}
        </div>
        <span style={{ fontFamily: FIGURE, fontSize: size * 0.42, color: "#4D8ED9", marginBottom: 6 }}>{unit}</span>
      </div>
    </div>
  );
};
const Overlay = ({ f, P: P0 }) => {
  const t = T();
  const P = (p) => P0(ROT(p));
  const sign = P([gantryX(f, t) - 0.7, 7.4, -1.3]);
  const tubs = P([TRUNK_TUB[0] + 0.05, TRUNK_TUB[1] + 0.3, -0.45]);
  return (
    <>
      {/* rev 2 tag audit (REV2.md): each fully in (at + 12/14) by its word, ≥ 36 f readable, gone before the camera leaves its object */}
      <Tag text="Cash WinFall" at={t.similar - 6} out={t.mass + 22} x={90} y={640} to={sign.behind ? null : sign} />
      <Pill at={t.years - 14} out={t.cut - 24} x={1040} y={240} label="Played" value="6 YEARS" />
      <Odometer at={t.miles - 14} out={t.often - 18} value={900} label="ONE WAY" unit="MILES" />
      <Tag text="Tubs of tickets" at={t.betting + 4} out={t.cut - 20} x={110} y={600} to={tubs.behind ? null : tubs} />
      <Counter at={t.money - 14} out={t.cut - 16} x={540} y={330} value={600000} prefix="$" unit="+" label="Often, a round" size={112} countDur={30} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("whooshlong", 1086, 30, 0.55),                         // the flight in (fastest frame ~ the middle of 1062–1102)
    cueAt("whooshsoft", 1112, 24, 0.45),                         // crane down behind the car
    cueAt("ee_click_click_01", t.similar - 4, 10, 0.4),           // CASH WINFALL tag
    cueAt("airwoosh", t.massEnd + 10, 40, 0.5),                  // the gantry passes overhead
    cueAt("ee_whoosh_medium_whoosh_01", t.forW + 18, 40, 0.4),   // round to the side
    cueAt("ee_click_click_01", t.years - 12, 10, 0.35),             // the pill
    cueAt("ee_whoosh_low_fast_whoosh", t.miles + 10, 30, 0.45),  // up to the aerial
    cueAt("ee_clock_clock_ticking_01", t.miles - 12, 36, 0.3),    // the odometer rolling
    cueAt("whooshsoft", t.often + 6, 24, 0.4),                   // down behind the trunk
    cueAt("pingshort", t.betting + 2, 20, 0.4),                  // the shell turns to glass
    cueAt("coin", t.money + 26, 14, 0.45),                       // $600,000+ lands
    cueAt("ee_whoosh_fast_small_whoosh_01", t.cut - 11, 20, 0.5) // the push into the ticket
  ];
};
export const ST = { id: "road", origin: ROAD_O, from: ROAD_FROM, to: ROAD_CUT, light: { keyI: 1.25, rimI: 1.1, shadowBox: 10, fillI: 0.32 }, shots, Scene, Overlay, sfx };
