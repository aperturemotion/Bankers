// @ts-nocheck
// ★ V38 station HOOK (0 → the slide to the store): "A retired couple from a town of 1,900 people beat the lottery. Legally. For 9 years."
//   Blue hour on the road into Evart, Michigan: wet asphalt with a dashed centre line, the town's low brick-and-clapboard main street
//   with warm lit windows, street lamps. Frame 0 the camera is already gliding low up the road; the town-limit sign (EVART · POP.
//   1,903 — 2010 census) passes on "town"; on "lottery" a lottery ticket drops out of the sky and lands upright on the road, lit by
//   the lamps; LEGAL tags it on "Legally."; 9 YEARS lands on "years". Then the camera rises along main street toward the store.
import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { canvasTex, std, PAL, ease, easeOut, rnd, clamp01, Sky, Glow } from "./kit";
import { Tag, Counter } from "./overlays";
import { wf } from "./take_rt";   // rev 4c: the hook runs in REAL time (shift.ts)
import { Couple, coupleZ } from "./i_couple";
import { cueAt } from "../bnx/SfxLayer";
import { BODY, FIGURE } from "./fonts3d";
import { drawTicket } from "./ticket_art";
import { LABEL_STYLE } from "./label_style";
import { Town, addBuilding, addProps, Mesher, townMats } from "./town_parts";

const T = () => ({ town: wf("town"), retired: wf("retired"), couple: wf("couple"), lottery: wf("lottery."), legally: wf("legally."), years: wf("9"), next: wf("in", 2) });
// rev 4c (builder I): the retired couple walks toward the camera on the right-hand sidewalk, from just in front of the Evart sign
//   (frame 0) on, the shop fronts across the road behind them; COUPLE_X = his line (curb side), she walks 0.58 m to his left (hands held)
const COUPLE_X = 5.62, COUPLE_Z0 = -10.7;
// ── the street ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const ROAD_W = 9, BLOCKS = 9;
const asphaltTex = () => canvasTex("asphalt", 512, 512, (c, w, h) => {
  c.fillStyle = "#1a2433"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { const g = 30 + rnd(i) * 40; c.fillStyle = `rgba(${g},${g + 8},${g + 20},${0.25 + rnd(i + 7) * 0.3})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
});
// ── the buildings: the town kit (town_parts.tsx), one merged street ─────────────────────────────────────────────────────────
// the right side (the side the camera looks at) carries the named shops; the gap at z ≈ −58 is the corner store (store station)
const RIGHT = [{ sign: 0, kind: "brick", brick: 0, awn: 1 }, { sign: 1, kind: "brick", brick: 2, awn: 3, door: "c" }, { sign: 3, kind: "clap", awn: -1 }, { sign: 2, kind: "brick", brick: 1, awn: -1 },
  null, { sign: 4, kind: "brick", brick: 0, awn: 6 }, { sign: 5, kind: "clap" }, { sign: 14, kind: "brick", brick: 3 }, { sign: 12, kind: "brick", brick: 2 }];
const LEFT = [{ sign: 8, kind: "brick", brick: 1, awn: 0 }, { sign: 13, kind: "clap", awn: 2 }, { sign: 7, kind: "brick", brick: 0 }, { sign: 6, kind: "brick", brick: 2, awn: 4 },
  { sign: 10, kind: "clap" }, { sign: 11, kind: "brick", brick: 3 }, { sign: 9, kind: "brick", brick: 0 }, { sign: 15, kind: "clap" }, { sign: 2, kind: "brick", brick: 1 }];
export const buildHookStreet = (m, blds) => {
  // sidewalks (concrete slabs with tooled joints) and granite curbs
  for (const sd of [-1, 1]) {
    m.box("concrete", [sd * (ROAD_W / 2 + 1.1), 0.08, -60], [2.2, 0.16, 220], "#FFFFFF", { metric: true });
    m.box("trim", [sd * (ROAD_W / 2 + 0.07), 0.085, -60], [0.14, 0.17, 220], "#A3ABB6", { metric: true });
  }
  for (const b of blds) {
    const spec = (b.side > 0 ? RIGHT : LEFT)[Math.floor(b.i / 2)] ?? {};
    m.push([b.side * (ROAD_W / 2 + 2.2), 0.16, b.z], b.side < 0 ? Math.PI / 2 : -Math.PI / 2);
    addBuilding(m, { w: b.w, h: b.h, d: b.d, seed: b.i + 3, lit: 0.6, ...spec });
    m.pop();
  }
  // street furniture on both sidewalks (clear of the lamps at z = −8 − 9k and the town sign at z = −12)
  const R = (sd, z, type, off = 0.55) => ({ type, p: [sd * (ROAD_W / 2 + off), 0.16, z], ry: sd < 0 ? Math.PI / 2 : -Math.PI / 2 });
  addProps(m, [
    R(1, -21.5, "hydrant", 0.45), R(1, -24, "sign", 0.35), R(1, -29.5, "bench", 1.7), R(1, -31.2, "planter", 0.75), R(1, -35.8, "trash", 0.5), R(1, -38.6, "pole", 2.05),
    R(1, -39.6, "news", 0.6), R(1, -42.6, "meter", 0.35), R(1, -45.2, "planter", 0.75), R(1, -47, "bench", 1.7), R(1, -66, "mailbox", 0.6), R(1, -70.5, "planter", 0.75),
    R(-1, -22, "planter", 0.75), R(-1, -28.5, "bench", 1.7), R(-1, -30.5, "trash", 0.5), R(-1, -34.5, "hydrant", 0.45), R(-1, -40.5, "planter", 0.75), R(-1, -46, "news", 0.6),
    R(-1, -49.5, "meter", 0.35), R(-1, -52.2, "bench", 1.7), R(-1, -57.6, "planter", 0.75), R(-1, -63.5, "mailbox", 0.6)
  ].map((q) => q.type === "pole" ? { ...q, p: [q.p[0] - 0.1, 2.2, q.p[2]] } : q));
  // rev 5 (Timur, 252 f: "the distance looks flat … nothing in the distance … add some fog, blue fog"): the street now RECEDES into the
  //   blue fog in layers — curb trees down both sidewalks, a church steeple and the town's water tower over the roofs, a far tree line and
  //   low hills closing the end of the street (all 30–70 m out, where the fog takes them from a silhouette to nothing)
  // the church steeple over the right-hand roofs and the water tower over the left (Evart's skyline)
  m.push([17.5, 0, -47]);
  m.box("siding", [0, 7, 0], [4.2, 14, 4.2], "#C9D2DD"); m.box("trim", [0, 14.2, 0], [4.6, 0.4, 4.6], "#DCE3EC");
  m.box("siding", [0, 15.6, 0], [2.8, 2.6, 2.8], "#C9D2DD");
  for (const [dx, dz] of [[1.41, 0], [-1.41, 0], [0, 1.41], [0, -1.41]]) m.box("trim", [dx, 15.7, dz], [dz ? 0.9 : 0.04, 1.6, dx ? 0.9 : 0.04], "#1B2A3D");   // the belfry louvres
  m.cyl("roof", [0, 21.2, 0], 1, 8.6, "#3A4656", { rt: 0.04, rb: 2.05, seg: 4, r: [0, Math.PI / 4, 0] });
  m.pop();
  m.push([-19, 0, -41]);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) m.cyl("metal", [a * 2.1, 7.2, b * 2.1], 0.16, 14.4, "#56657A", { seg: 8, r: [-b * 0.07, 0, a * 0.07] });
  for (const y of [4.5, 9.5]) for (const [p, s2] of [[[0, y, -2.0], [4.0, 0.08, 0.08]], [[0, y, 2.0], [4.0, 0.08, 0.08]], [[-2.0, y, 0], [0.08, 0.08, 4.0]], [[2.0, y, 0], [0.08, 0.08, 4.0]]]) m.box("metal", p, s2, "#56657A");
  m.cyl("metal", [0, 8, 0], 0.32, 16, "#4A586B", { seg: 10 });
  m.cyl("metal", [0, 16.4, 0], 3.3, 3.8, "#AFC0D4", { seg: 28 });
  m.cyl("metal", [0, 18.95, 0], 1, 1.3, "#7F91A6", { rt: 0.25, rb: 3.35, seg: 28 });
  m.cyl("metal", [0, 14.45, 0], 3.55, 0.12, "#56657A", { seg: 28 });   // the catwalk
  m.pop();
};
// the trees, merged in their own Mesher: smooth crowns in a leaf-cluster texture (the town kit's flat-shaded "plant" read as low-poly)
const TREES = () => {
  const L = [[-5.35, -24, 1], [-5.35, -37.5, 1.08], [-5.35, -55, 0.95], [-5.35, -60.5, 1.05], [-5.35, -67, 1], [-5.35, -73, 1.1], [5.35, -68.6, 0.98], [5.35, -74.5, 1.04]]
    .map(([x, z, sc]) => [x, z, sc, Math.round(-z * 7)]);
  for (let i = 0; i < 22; i++) L.push([-26 + i * 2.45 + (rnd(i + 70) - 0.5) * 1.2, -90 - rnd(i + 90) * 6, 1.25 + rnd(i + 40) * 0.5, 300 + i]);
  return L;
};
const leafTex = (bump) => canvasTex("hook_leaf" + (bump ? "B" : ""), 512, 512, (c, w, h) => {
  c.fillStyle = bump ? "#808080" : "#2C4B57"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) {
    const x = rnd(i + 1) * w, y = rnd(i + 2) * h, r = 5 + rnd(i + 3) * 11, v = rnd(i + 4);
    c.fillStyle = bump ? `rgba(${v > 0.5 ? 255 : 0},${v > 0.5 ? 255 : 0},${v > 0.5 ? 255 : 0},0.35)` : `hsla(${190 + v * 25}, ${22 + v * 18}%, ${14 + v * 22}%, 0.85)`;
    c.beginPath(); c.ellipse(x, y, r, r * 0.62, rnd(i + 5) * 3.1, 0, 7); c.fill();
  }
});
let LEAF = null;
const leafMat = () => {
  if (LEAF) return LEAF;
  const map = leafTex(false); map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(3, 2);
  const bump = leafTex(true); bump.colorSpace = THREE.NoColorSpace; bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.repeat.set(3, 2);
  LEAF = new THREE.MeshStandardMaterial({ vertexColors: true, map, bumpMap: bump, bumpScale: 3, roughness: 0.88, metalness: 0, envMapIntensity: 0.4 });
  return LEAF;
};
const Trees = () => {
  const grp = useMemo(() => { const m = new Mesher(); for (const [x, z, sc, sd] of TREES()) addTree(m, x, z, sc, sd); const tm = townMats(); return m.build({ leaf: leafMat(), trim: tm.trim, metal: tm.metal }); }, []);
  return <primitive object={grp} />;
};
// a curb tree in its iron grate: trunk, two limbs, a clustered crown (merged; the plant material is flat-shaded, dark blue-green at night)
const addTree = (m, x, z, s, seed) => {
  const R = (k) => rnd(seed * 13 + k);
  m.box("metal", [x, 0.17, z], [1.1, 0.02, 1.1], "#1A222D");
  m.cyl("trim", [x, 0.16 + 1.5 * s, z], 0.12 * s, 3.0 * s, "#2E2A26", { seg: 7, rt: 0.75, rb: 1 });
  m.cyl("trim", [x + 0.35 * s, 0.16 + 3.1 * s, z], 0.06 * s, 1.3 * s, "#2E2A26", { seg: 6, r: [0, 0, -0.5] });
  m.cyl("trim", [x - 0.3 * s, 0.16 + 3.2 * s, z + 0.1], 0.06 * s, 1.2 * s, "#2E2A26", { seg: 6, r: [0.2, 0, 0.55] });
  const cols = ["#9FB8C6", "#8EAABB", "#B3C8D4", "#93AFC2"];
  const cy = 0.16 + 4.5 * s;
  m.sph("leaf", [x, cy + 0.2 * s, z], [1.55 * s, 1.25 * s, 1.55 * s], cols[seed % 4], { seg: 14 });
  for (let k = 0; k < 9; k++) {
    const a = k * 0.7 + R(k) * 0.5, rr = (0.75 + R(k + 20) * 0.45) * s, yy = (k % 3 - 1) * 0.55 * s + (R(k + 9) - 0.5) * 0.4 * s;
    const sz = (0.72 + R(k + 3) * 0.38) * s;
    m.sph("leaf", [x + Math.cos(a) * rr, cy + yy, z + Math.sin(a) * rr], [sz, sz * 0.82, sz], cols[(k + seed) % 4], { seg: 12, r: [0, R(k + 6) * 3, 0] });
  }
};
// rev 5: a light glow that fades with the scene fog (kit Glow sprites are fog: false); distance from the live camera
const FogGlow = ({ position, world, opacity = 0.8, ...r }) => {
  const { camera } = useThree();
  const wp = world ?? position;
  const d = camera.position.distanceTo(new THREE.Vector3(wp[0], wp[1], wp[2]));
  const k = Math.exp(-Math.pow(0.03 * d, 2));
  return k < 0.01 ? null : <Glow position={position} opacity={opacity * Math.pow(k, 0.8)} {...r} />;
};
const Lamp = ({ x, z, light = true }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 2.6, 0]} castShadow><cylinderGeometry args={[0.06, 0.09, 5.2, 10]} /><meshStandardMaterial color="#1b2636" metalness={0.6} roughness={0.4} /></mesh>
    <mesh position={[x < 0 ? 0.6 : -0.6, 5.15, 0]}><boxGeometry args={[1.3, 0.08, 0.08]} /><meshStandardMaterial color="#1b2636" metalness={0.6} roughness={0.4} /></mesh>
    <mesh position={[x < 0 ? 1.15 : -1.15, 5.0, 0]}><sphereGeometry args={[0.2, 16, 12]} /><meshStandardMaterial color="#FFE2B0" emissive="#FFC97A" emissiveIntensity={3} /></mesh>
    {light && <pointLight position={[x < 0 ? 1.15 : -1.15, 4.8, 0]} intensity={14} distance={13} decay={1.6} color="#FFC98A" />}
    <FogGlow position={[x < 0 ? 1.15 : -1.15, 5.0, 0]} world={[x + (x < 0 ? 1.15 : -1.15), 5.0, z]} size={2.6} color="#FFC98A" opacity={0.75} />
  </group>
);
// the town-limit sign: green in Michigan, here in the house navy-white (the Bankers palette)
const signTex = () => canvasTex("evartSign" + (LABEL_STYLE === "world" ? "_mi" : ""), 512, 320, (c, w, h) => {
  c.fillStyle = "#0B3F7A"; c.fillRect(0, 0, w, h);
  c.strokeStyle = "#FFFFFF"; c.lineWidth = 10; c.strokeRect(16, 16, w - 32, h - 32);
  c.fillStyle = "#FFFFFF"; c.textAlign = "center";
  if (LABEL_STYLE === "world") {
    // rev 5 style-frame option "world": the place is named by the scene's own city-limit sign — EVART / MICHIGAN / POP. 1,903
    c.font = `700 104px ${BODY}`; c.fillText("EVART", w / 2, 128);
    c.font = `700 44px ${BODY}`; c.fillText("M I C H I G A N", w / 2, 192);
    c.fillRect(w / 2 - 120, 212, 240, 4);
    c.font = `600 56px ${BODY}`; c.fillText("POP. 1,903", w / 2, 274);
    return;
  }
  c.font = `700 112px ${BODY}`; c.fillText("EVART", w / 2, 150);
  c.font = `600 64px ${BODY}`; c.fillText("POP. 1,903", w / 2, 250);
});
// the ticket: the house WINFALL draw ticket (ticket_art.ts — security field, logo header with balls, thermal-printed Quick Picks,
//   barcodes, small print), drawn at 1160×2048 (rev 2: it lands 1.5× bigger, and the rules close-up reads it too)
const ticketTex = () => canvasTex("ticket_v4", 1160, 2048, (c, w, h) => drawTicket(c, w, h, { seed: 1, drawLine: "DRAW 2003" }));
export const Ticket = ({ pos = [0, 0, 0], rot = [0, 0, 0], s = 1 }) => {
  const tex = useMemo(ticketTex, []);
  return (
    <group position={pos} rotation={rot} scale={s}>
      <mesh castShadow receiveShadow><boxGeometry args={[1.7, 3.0, 0.03]} /><meshStandardMaterial color="#F4F7FB" roughness={0.45} /></mesh>
      <mesh position={[0, 0, 0.016]}><planeGeometry args={[1.7, 3.0]} /><meshStandardMaterial map={tex} roughness={0.42} /></mesh>
    </group>
  );
};
// ── the ticket's fall: from above, a slow leaf-like sway, landing upright on its edge (a small settle) ─────────────────────────
// rev 5 (builder P): the ticket lands in the right lane, 14 m up the road, so the couple (right sidewalk) and the falling ticket share ONE
//   framing — the camera turns ~6° instead of sweeping 8 m across the street
const TICKET_AT = [0.6, 0, -14];
export const TICKET_S = 1.5;   // Timur, 2026-11-26: "make it a bit bigger when it lands on the street"
const ticketPose = (t, f) => {
  // rev 4b (Timur: "first it lands as a stand, as it was, and then it falls … when it fell, it started to go in the ground"):
  //   1. the fall from above with a leaf-like sway, LANDING UPRIGHT on its bottom edge on "lottery" + 6 (as in rev 2);
  //   2. as the camera starts its vault toward the store it tips over BACKWARD and lies flat, face up, on the road — and stays.
  //   The tip turns about the ticket's OWN bottom edge: the pose is nested (pivot + yaw → tilt about the local width axis → the
  //   ticket raised half its height → the rock), so the bottom edge stays on the asphalt. (rev 3 tilted it about the WORLD x axis
  //   after the yaw, which swung one corner 0.4 m under the road.) The lowest corner is ≥ 0.027 m above the road on every frame.
  const k = ease(f, t.lottery - 34, t.lottery + 6);
  const sway = (1 - k) * 0.45 * Math.sin((f - t.lottery) / 5);
  const half = 1.5 * TICKET_S, halfW = 0.85 * TICKET_S, REST = 0.05;
  const q = ease(f, t.next - 30, t.next - 12), fall = (Math.PI / 2) * q * q;    // the tip accelerates like a falling card
  const tilt = -fall - sway * 0.6;
  const rock = sway;
  // while it falls from the sky, lift the pivot so the rocked/tilted corners clear the road (zero once it has landed)
  const clear = half * (1 - Math.cos(rock)) + halfW * Math.abs(Math.sin(rock)) + half * Math.abs(Math.sin(Math.min(0, sway * 0.6)));
  const pivot = [TICKET_AT[0] + (1 - k) * 2.2 * Math.sin((f - t.lottery) / 9), REST + clear + 13 * (1 - k) * (1 - k), TICKET_AT[2]];
  const yaw = -0.35 + (1 - k) * 2.4;
  // the ticket's centre (for the tag): pivot + yaw-rotated (0, half·cos, −half·sin)
  const cz = -half * Math.sin(-tilt), cy = half * Math.cos(tilt);
  const pos = [pivot[0] + Math.sin(yaw) * cz, pivot[1] + cy, pivot[2] + Math.cos(yaw) * cz];
  return { pivot, pos, yaw, tilt, rock, half, vis: f > t.lottery - 36 };
};

// rev 5: the ticket's contact shadow (the key's cast shadow does the long shadow; this is the dark where paper meets asphalt)
const contactTex = () => canvasTex("hook_contact", 128, 256, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, h / 2);
  g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(0.55, "rgba(0,0,0,0.75)"); g.addColorStop(1, "rgba(0,0,0,0)");
  c.save(); c.scale(1, 1); c.fillStyle = g; c.fillRect(0, 0, w, h); c.restore();
});
const TicketContact = ({ t, f, tex }) => {
  const k = ease(f, t.lottery - 6, t.lottery + 6);
  if (k <= 0.001) return null;
  const tp = ticketPose(t, f);
  const q = Math.min(1, -tp.tilt / (Math.PI / 2));
  const L = 0.5 + 2 * tp.half * q, Wd = 1.7 * TICKET_S + 0.5;
  return (
    <group position={[tp.pivot[0], 0.006, tp.pivot[2]]} rotation-y={tp.yaw}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -tp.half * q]} renderOrder={1}>
        <planeGeometry args={[Wd, L + 0.4]} />
        <meshBasicMaterial map={tex} transparent opacity={0.6 * k} depthWrite={false} color="#000000" polygonOffset polygonOffsetFactor={-1} />
      </mesh>
    </group>
  );
};
// rev 5 style-frame option "world": the place name as a lit 3-D plate standing on the verge by the town sign (it rises out of the snow on
// "town" and sinks back before the flight) — the label lives IN the scene, lit and shadowed like everything else
const placeTex = () => canvasTex("hook_place_plate", 1024, 256, (c, w, h) => {
  c.fillStyle = "#0B2447"; c.fillRect(0, 0, w, h);
  c.strokeStyle = "#7FB4F2"; c.lineWidth = 6; c.strokeRect(14, 14, w - 28, h - 28);
  c.fillStyle = "#F2F7FD"; c.font = `800 92px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText("EVART, MICHIGAN", w / 2, h / 2 + 4);
});
const WorldLabel = ({ f, t }) => {
  const tex = useMemo(placeTex, []);
  const k = ease(f, t.town - 14, t.town + 4) * (1 - ease(f, t.retired - 10, t.retired + 6));
  if (k <= 0.001) return null;
  const W = 2.6, H = 0.65;
  return (
    <group position={[-(ROAD_W / 2 + 0.9), -H + (H + 1.1) * k, -13]} rotation-y={0.55}>
      <mesh castShadow receiveShadow><boxGeometry args={[W + 0.12, H + 0.12, 0.08]} /><meshStandardMaterial color="#14253D" metalness={0.6} roughness={0.35} /></mesh>
      <mesh position={[0, 0, 0.042]}><planeGeometry args={[W, H]} /><meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.55} roughness={0.4} /></mesh>
      {[-1.0, 1.0].map((x, i) => <mesh key={i} position={[x, -H / 2 - 0.55, -0.02]} castShadow><boxGeometry args={[0.07, 1.1, 0.07]} /><meshStandardMaterial color="#2A3B52" metalness={0.7} roughness={0.4} /></mesh>)}
    </group>
  );
};
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  const asphalt = useMemo(asphaltTex, []);
  asphalt.wrapS = asphalt.wrapT = THREE.RepeatWrapping; asphalt.repeat.set(4, 30);
  const sign = useMemo(signTex, []);
  const blds = useMemo(() => Array.from({ length: BLOCKS * 2 }, (_, i) => {
    const side = i % 2 ? 1 : -1, k = Math.floor(i / 2);
    return { x: side * (ROAD_W / 2 + 2.2 + 2.6), z: -26 - k * 7.4, w: 7, h: 6 + Math.floor(rnd(i + 4) * 3) * 2.4, d: 5.2, side, i };
  }).filter((b) => !(b.side > 0 && Math.abs(b.z - -58) < 5)), []);   // a gap on the right at z ≈ −58: the store station's storefront stands there
  const tp = ticketPose(t, f);
  const contact = useMemo(contactTex, []);
  return (
    <group>
      <Sky />
      {/* ground: wet asphalt road, sidewalks, the verges */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -60]} receiveShadow><planeGeometry args={[ROAD_W, 220]} /><meshStandardMaterial map={asphalt} color="#7a8aa3" roughness={0.32} metalness={0.15} /></mesh>
      {Array.from({ length: 26 }, (_, i) => <mesh key={i} rotation-x={-Math.PI / 2} position={[0, 0.005, 20 - i * 7]}><planeGeometry args={[0.18, 3.2]} /><meshStandardMaterial color="#E8C766" emissive="#6b5520" emissiveIntensity={0.3} roughness={0.5} /></mesh>)}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -60]} receiveShadow><planeGeometry args={[400, 400]} /><meshStandardMaterial color="#0d2238" roughness={0.95} /></mesh>
      <Town build={(m) => buildHookStreet(m, blds)} />
      <Trees />
      {/* rev 5: lamp 5 (z −53) stood right in front of the corner store and cut its landing shot in two — it is left out */}
      {Array.from({ length: 10 }, (_, i) => i !== 5 && <Lamp key={i} x={(i % 2 ? 1 : -1) * (ROAD_W / 2 + 0.6)} z={-8 - i * 9} light={i < 6} />)}
      {/* rev 4c: the retired couple, walking toward the camera from the Evart sign; she glances at him on "retired couple" */}
      <Couple f={f} x={COUPLE_X} y={0.16} z0={COUPLE_Z0} look={[t.retired - 4, t.couple + 10]} />
      {/* the town-limit sign, right verge */}
      <group position={[ROAD_W / 2 + 0.9, 0, -12]} rotation-y={-0.32}>
        {[-0.9, 0.9].map((x) => <mesh key={x} position={[x, 1.4, -0.05]} castShadow><cylinderGeometry args={[0.07, 0.07, 2.8, 10]} /><meshStandardMaterial color="#9aa7b8" metalness={0.7} roughness={0.35} /></mesh>)}
        <mesh position={[0, 2.5, 0]} castShadow><boxGeometry args={[2.6, 1.62, 0.06]} /><meshStandardMaterial color="#0B3F7A" roughness={0.5} /></mesh>
        <mesh position={[0, 2.5, 0.032]}><planeGeometry args={[2.6, 1.62]} /><meshStandardMaterial map={sign} roughness={0.35} emissiveMap={sign} emissive="#ffffff" emissiveIntensity={0.18} /></mesh>
      </group>
      {/* the ticket, falling then standing on the road, with its contact shadow under the lamps */}
      {tp.vis && <group position={tp.pivot} rotation-y={tp.yaw}><group rotation-x={tp.tilt}><group position={[0, tp.half, 0]} rotation-z={tp.rock}><Ticket s={TICKET_S} /></group></group></group>}
      {/* rev 5: its contact shadow on the wet asphalt — a soft dark footprint that grows with the landing and spreads as it tips flat */}
      <TicketContact t={t} f={f} tex={contact} />
    </group>
  );
};
// ── the camera: low up the road from frame 0, easing toward the ticket; then lifting along main street toward the store ─────
const shots = () => {
  const t = T();
  const cz = (fr) => coupleZ(fr, COUPLE_Z0);   // where the couple is (they walk toward +z)
  // ★ rev 5 (Timur, 2026-11-27: "slower … cinematic … always focused on something or moving to something"): FOUR long, overlapping moves,
  //   each from a subject to a subject — (1) drift back with the walking couple, the EVART sign behind them; (2) close slowly onto the pair
  //   on "retired couple"; (3) ease up and a step back with them, the couple in the right half of the frame, as the ticket falls into the road
  //   behind them (it now lands in the near lane: a small turn, not the old 8 m sweep across the street); (4) a slow crane up and in onto
  //   the standing ticket for "Legally. For 9 years." — and as it tips flat the store station's glide carries the camera on over it, down
  //   main street to the store (st_store.tsx shot 1). The camera never moves back toward +z after (3); the couple walk out past the right of the frame.
  return [
    { a: 0, b: 0, pos: [8.4, 1.66, -3.2], target: [5.55, 1.36, -12.6], fov: 34 },
    { a: 0, b: t.retired - 1, pos: [8.15, 1.62, -1.5], target: [5.6, 1.16, cz(t.retired - 1) - 1.6], fov: 31 },
    { a: t.retired - 17, b: t.couple + 22, pos: [7.65, 1.55, -0.5], target: [5.6, 1.0, cz(t.couple + 22) - 0.6], fov: 26 },
    { a: t.couple + 12, b: t.lottery + 20, pos: [7.6, 1.9, 0.5], target: [3.2, 2.1, -11.6], fov: 38 },
    { a: t.lottery + 12, b: t.next - 4, pos: [3.3, 3.2, -3.4], target: [0.1, 2.3, -14.5], fov: 36 }   // a slow crane up and in: the ticket centre-low, 9 YEARS clear above it
  ];
};
const COUNTER_X = 790;   // rev 5: upper RIGHT — the crane onto the ticket keeps the ticket left of centre while it stands
const Overlay = ({ f, P }) => {
  const t = T();
  const sign = P([ROAD_W / 2 + 0.9, 2.6, -12]);
  const tk = ticketPose(t, f);
  const tick = P([tk.pos[0] - 0.8 * TICKET_S, tk.pos[1] + 0.2 * TICKET_S, tk.pos[2]]);   // on the standing ticket (LEGAL leaves before it tips)
  return (
    <>
      {/* rev 2 tag audit: each is fully in (at + 12/14) by its word, reads ≥ 36 f, and the pinned ones leave before the flight to
          the store (t.next − 20 = the store's first travel) */}
      <Tag text="Evart, Michigan" at={t.town - 14} out={t.retired - 10} x={80} y={420} to={sign.behind ? null : sign} />
      <Tag text="Legal" at={t.legally - 14} out={t.next - 32} x={70} y={640} to={tick} />
      <Counter at={t.years - 14} out={t.next - 11} x={COUNTER_X} y={330} value={9} unit="YEARS" label="2003 – 2012" size={112} countDur={14} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("whooshsoft", t.lottery - 20, 30, 0.6),
    cueAt("thud", t.lottery + 4, 14, 0.5),
    cueAt("thud", t.next - 12, 12, 0.2),                      // rev 4b: the ticket slaps down flat on the road
    cueAt("pingshort", t.legally, 12, 0.5),
    cueAt("coin", t.years, 16, 0.45)
  ];
};
// rev 5: the key's shadow box sits on the couple and the ticket (the default box around the origin left the ticket's shadow out)
export const ST = { id: "hook", origin: [0, 0, 0], from: 0, to: T().next + 70, light: { target: [1.5, 0, -10], shadowBox: 13 }, shots, Scene, Overlay, sfx };
