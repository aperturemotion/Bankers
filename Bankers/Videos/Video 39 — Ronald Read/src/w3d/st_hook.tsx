// @ts-nocheck
// ★ V38 station HOOK (0 → the slide to the store): "A retired couple from a town of 1,900 people beat the lottery. Legally. For 9 years."
//   Blue hour on the road into Evart, Michigan: wet asphalt with a dashed centre line, the town's low brick-and-clapboard main street
//   with warm lit windows, street lamps. Frame 0 the camera is already gliding low up the road; the town-limit sign (EVART · POP.
//   1,903 — 2010 census) passes on "town"; on "lottery" a lottery ticket drops out of the sky and lands upright on the road, lit by
//   the lamps; LEGAL tags it on "Legally."; 9 YEARS lands on "years". Then the camera rises along main street toward the store.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, std, PAL, ease, easeOut, rnd, clamp01, Sky, Glow } from "./kit";
import { Tag, Counter } from "./overlays";
import { wf } from "./take_rt";   // rev 4c: the hook runs in REAL time (shift.ts)
import { Couple, coupleZ } from "./i_couple";
import { cueAt } from "../bnx/SfxLayer";
import { BODY, FIGURE } from "./fonts3d";
import { drawTicket } from "./ticket_art";
import { Town, addBuilding, addProps } from "./town_parts";

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
};
const Lamp = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 2.6, 0]} castShadow><cylinderGeometry args={[0.06, 0.09, 5.2, 10]} /><meshStandardMaterial color="#1b2636" metalness={0.6} roughness={0.4} /></mesh>
    <mesh position={[x < 0 ? 0.6 : -0.6, 5.15, 0]}><boxGeometry args={[1.3, 0.08, 0.08]} /><meshStandardMaterial color="#1b2636" metalness={0.6} roughness={0.4} /></mesh>
    <mesh position={[x < 0 ? 1.15 : -1.15, 5.0, 0]}><sphereGeometry args={[0.2, 16, 12]} /><meshStandardMaterial color="#FFE2B0" emissive="#FFC97A" emissiveIntensity={3} /></mesh>
    <pointLight position={[x < 0 ? 1.15 : -1.15, 4.8, 0]} intensity={14} distance={13} decay={1.6} color="#FFC98A" />
    <Glow position={[x < 0 ? 1.15 : -1.15, 5.0, 0]} size={2.6} color="#FFC98A" opacity={0.75} />
  </group>
);
// the town-limit sign: green in Michigan, here in the house navy-white (the Bankers palette)
const signTex = () => canvasTex("evartSign", 512, 320, (c, w, h) => {
  c.fillStyle = "#0B3F7A"; c.fillRect(0, 0, w, h);
  c.strokeStyle = "#FFFFFF"; c.lineWidth = 10; c.strokeRect(16, 16, w - 32, h - 32);
  c.fillStyle = "#FFFFFF"; c.textAlign = "center";
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
const TICKET_AT = [0, 0, -16];
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
  return (
    <group>
      <Sky />
      {/* ground: wet asphalt road, sidewalks, the verges */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -60]} receiveShadow><planeGeometry args={[ROAD_W, 220]} /><meshStandardMaterial map={asphalt} color="#7a8aa3" roughness={0.32} metalness={0.15} /></mesh>
      {Array.from({ length: 26 }, (_, i) => <mesh key={i} rotation-x={-Math.PI / 2} position={[0, 0.005, 20 - i * 7]}><planeGeometry args={[0.18, 3.2]} /><meshStandardMaterial color="#E8C766" emissive="#6b5520" emissiveIntensity={0.3} roughness={0.5} /></mesh>)}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -60]} receiveShadow><planeGeometry args={[400, 400]} /><meshStandardMaterial color="#0d2238" roughness={0.95} /></mesh>
      <Town build={(m) => buildHookStreet(m, blds)} />
      {Array.from({ length: 6 }, (_, i) => <Lamp key={i} x={(i % 2 ? 1 : -1) * (ROAD_W / 2 + 0.6)} z={-8 - i * 9} />)}
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
      {/* far hills and a water tower on the skyline (the town's silhouette) */}
      <group position={[-14, 0, -118]}>
        <mesh position={[0, 9, 0]}><sphereGeometry args={[3.2, 24, 16]} /><meshStandardMaterial color="#5b7392" roughness={0.6} metalness={0.3} /></mesh>
        {[[-2, -2], [2, -2], [-2, 2], [2, 2]].map(([a, b], i) => <mesh key={i} position={[a * 0.8, 4, b * 0.8]}><cylinderGeometry args={[0.15, 0.15, 8, 8]} /><meshStandardMaterial color="#3b4c63" /></mesh>)}
      </group>
    </group>
  );
};
// ── the camera: low up the road from frame 0, easing toward the ticket; then lifting along main street toward the store ─────
const shots = () => {
  const t = T();
  const cz = (fr) => coupleZ(fr, COUPLE_Z0);   // where the couple is (they walk toward +z)
  // rev 4c (Timur: "a small focus on them first … the buildings and the Evart sign are seen when they're walking … focus on them when
  //   the voiceover says 'a retired couple' … then back on the lottery ticket"): ONE framing from frame 0 — the couple walking toward us
  //   with the EVART sign right behind them and the lit shop fronts beyond — the camera drifting back with them; on "retired couple" it
  //   closes in on the pair (narrower lens as they come nearer); then one sweep left onto the road to see the ticket fall. The camera
  //   moves only back (+z) and left (−x) until the kept rev 2 shot takes over: no reversal. Every key is a word (take_rt.ts).
  return [
    { a: 0, b: 0, pos: [8.4, 1.66, -3.2], target: [5.55, 1.36, -12.6], fov: 34 },
    { a: 0, b: t.retired - 4, pos: [8.15, 1.62, -1.5], target: [5.6, 1.16, cz(t.retired - 4) - 1.6], fov: 31 },
    { a: t.retired - 14, b: t.couple + 10, pos: [7.8, 1.52, -0.4], target: [5.75, 0.98, cz(t.couple + 10) - 0.4], fov: 24 },
    { a: t.couple + 8, b: t.lottery - 4, pos: [-0.7, 1.8, 4.8], target: [-0.3, 2.8, -15], fov: 40 },   // the sweep onto the road: framed for the ticket's fall (it appears lottery − 34 high over the road)
    { a: t.lottery - 10, b: t.years + 26, pos: [-2.0, 2.5, 1.2], target: [-1.3, 1.15, -16], fov: 34 }   // rev 2 (restored in rev 4b): aimed 1.4 m left, so the standing ticket stands right of centre and 9 YEARS has the upper left
  ];
};
const COUNTER_X = 290;
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
export const ST = { id: "hook", origin: [0, 0, 0], from: 0, to: T().next + 70, shots, Scene, Overlay, sfx };
