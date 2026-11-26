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
import { wf } from "./take";
import { cueAt } from "../bnx/SfxLayer";
import { BODY, FIGURE } from "./fonts3d";
import { Town, addBuilding, addProps } from "./town_parts";

const T = () => ({ town: wf("town"), lottery: wf("lottery."), legally: wf("legally."), years: wf("9"), next: wf("in") });
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
// the ticket: a generic lottery ticket (no real game's artwork): header band, six-number rows, a barcode
const ticketTex = () => canvasTex("ticket", 1024, 1800, (c) => {
  c.scale(2, 2); const w = 512, h = 900;   // drawn at 2× (rev 2: the ticket lands 1.5× bigger, and the rules close-up reads it too)
  c.fillStyle = "#F4F7FB"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#0B3F7A"; c.fillRect(0, 0, w, 150);
  c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.font = `800 86px ${BODY}`; c.fillText("LOTTERY", w / 2, 108);
  c.fillStyle = "#4D8ED9"; c.fillRect(0, 150, w, 14);
  c.fillStyle = "#0B2547"; c.font = `600 34px ${BODY}`;
  const rows = ["A", "B", "C", "D", "E"];
  rows.forEach((r, i) => {
    const y = 240 + i * 92;
    c.textAlign = "left"; c.fillText(r + ".", 36, y);
    const nums = Array.from({ length: 6 }, (_, k) => String(1 + Math.floor(rnd(i * 6 + k + 3) * 49)).padStart(2, "0"));
    nums.forEach((n, k) => { c.textAlign = "center"; c.fillText(n, 120 + k * 66, y); });
  });
  c.fillStyle = "#0B2547"; for (let k = 0; k < 64; k++) { const bw = 2 + Math.floor(rnd(k + 90) * 4); c.fillRect(48 + k * 6.6, 730, bw, 110); }
  c.font = `500 26px ${BODY}`; c.textAlign = "center"; c.fillText("DRAW 2003", w / 2, 880);
  c.font = `600 22px ${BODY}`; c.fillText("KEEP THIS TICKET · CHECK YOUR NUMBERS", w / 2, 708);
});
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
  // rev 4 (Timur: "when the lottery ticket falls, it goes underground … it should just lay down on the ground and stay there"): it
  //   drifts down like a leaf (spinning, rocking), its face turning up as it comes, and SETTLES FLAT, face up, on the road at
  //   "lottery" + 6 — and stays. The pose is nested (yaw outside, then the tilt about the ticket's own width axis, then the rock), and
  //   its height is never less than what keeps every corner above the asphalt (the old tip-over, tilted about the world x axis after
  //   the yaw, buried a corner 0.4 m)
  const k = ease(f, t.lottery - 34, t.lottery + 6);
  const rock = (1 - k) * 0.45 * Math.sin((f - t.lottery) / 5);
  const tilt = -(Math.PI / 2) * (0.25 + 0.75 * k * k) + (1 - k) * 0.5 * Math.sin((f - t.lottery) / 7);
  const half = 1.5 * TICKET_S, halfW = 0.85 * TICKET_S, REST = 0.03;
  const clear = half * Math.abs(Math.cos(tilt)) * Math.cos(rock) + halfW * Math.abs(Math.sin(rock));
  const y = REST + clear + 13 * (1 - k) * (1 - k);
  return { pos: [TICKET_AT[0] + (1 - k) * 2.2 * Math.sin((f - t.lottery) / 9), y, TICKET_AT[2]], yaw: -0.35 + (1 - k) * 2.4, tilt, rock, vis: f > t.lottery - 36 };
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
      {/* the town-limit sign, right verge */}
      <group position={[ROAD_W / 2 + 0.9, 0, -12]} rotation-y={-0.32}>
        {[-0.9, 0.9].map((x) => <mesh key={x} position={[x, 1.4, -0.05]} castShadow><cylinderGeometry args={[0.07, 0.07, 2.8, 10]} /><meshStandardMaterial color="#9aa7b8" metalness={0.7} roughness={0.35} /></mesh>)}
        <mesh position={[0, 2.5, 0]} castShadow><boxGeometry args={[2.6, 1.62, 0.06]} /><meshStandardMaterial color="#0B3F7A" roughness={0.5} /></mesh>
        <mesh position={[0, 2.5, 0.032]}><planeGeometry args={[2.6, 1.62]} /><meshStandardMaterial map={sign} roughness={0.35} emissiveMap={sign} emissive="#ffffff" emissiveIntensity={0.18} /></mesh>
      </group>
      {/* the ticket, falling then standing on the road, with its contact shadow under the lamps */}
      {tp.vis && <group position={tp.pos} rotation-y={tp.yaw}><group rotation-x={tp.tilt}><group rotation-z={tp.rock}><Ticket s={TICKET_S} /></group></group></group>}
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
  return [
    { a: 0, b: 0, pos: [-1.0, 1.25, 15], target: [2.6, 2.0, -12], fov: 40 },
    { a: 0, b: t.lottery - 10, pos: [-0.9, 1.7, 5], target: [1.2, 1.6, -15], fov: 38 },
    { a: t.lottery - 22, b: t.years + 26, pos: [-1.6, 6.4, -2.6], target: [-0.1, 0.9, -19.5], fov: 36 }   // rev 4: rises as the ticket comes down and looks DOWN on it lying flat on the road (the street and its lit fronts still beyond)
  ];
};
const COUNTER_X = 290;
const Overlay = ({ f, P }) => {
  const t = T();
  const sign = P([ROAD_W / 2 + 0.9, 2.6, -12]);
  const tk = ticketPose(t, f);
  const tick = P([tk.pos[0] - 0.55 * TICKET_S, tk.pos[1] + 0.02, tk.pos[2] - 0.6 * TICKET_S]);   // the ticket's upper-left, lying flat
  return (
    <>
      {/* rev 2 tag audit: each is fully in (at + 12/14) by its word, reads ≥ 36 f, and the pinned ones leave before the flight to
          the store (t.next − 20 = the store's first travel) */}
      <Tag text="Evart, Michigan" at={t.town - 14} out={t.lottery - 10} x={80} y={420} to={sign.behind ? null : sign} />
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
    cueAt("pingshort", t.legally, 12, 0.5),
    cueAt("coin", t.years, 16, 0.45)
  ];
};
export const ST = { id: "hook", origin: [0, 0, 0], from: 0, to: T().next + 70, shots, Scene, Overlay, sfx };
