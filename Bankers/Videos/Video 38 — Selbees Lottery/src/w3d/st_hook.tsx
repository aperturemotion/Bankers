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

const T = () => ({ town: wf("town"), lottery: wf("lottery."), legally: wf("legally."), years: wf("9"), next: wf("in") });
// ── the street ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const ROAD_W = 9, BLOCKS = 9;
const asphaltTex = () => canvasTex("asphalt", 512, 512, (c, w, h) => {
  c.fillStyle = "#1a2433"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { const g = 30 + rnd(i) * 40; c.fillStyle = `rgba(${g},${g + 8},${g + 20},${0.25 + rnd(i + 7) * 0.3})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
});
const facadeTex = (key, base, rows, cols, lit) => canvasTex("facade_" + key, 512, 512, (c, w, h) => {
  c.fillStyle = base; c.fillRect(0, 0, w, h);
  // brick courses
  c.strokeStyle = "rgba(0,0,0,0.18)"; c.lineWidth = 1;
  for (let y = 0; y < h; y += 10) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  // a cornice band
  c.fillStyle = "rgba(255,255,255,0.10)"; c.fillRect(0, 18, w, 14);
  // the windows (upper floor) and the shop front (ground floor)
  const cw = w / cols;
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const on = rnd(k * 13 + r * 7 + key.length) < lit;
    const x = k * cw + cw * 0.22, y = 60 + r * 90, ww = cw * 0.56, hh = 60;
    c.fillStyle = "#0c1626"; c.fillRect(x - 4, y - 4, ww + 8, hh + 8);
    const g = c.createLinearGradient(0, y, 0, y + hh);
    if (on) { g.addColorStop(0, "#FFD99A"); g.addColorStop(1, "#E9A85A"); } else { g.addColorStop(0, "#22344d"); g.addColorStop(1, "#16243a"); }
    c.fillStyle = g; c.fillRect(x, y, ww, hh);
    c.fillStyle = "rgba(0,0,0,0.35)"; c.fillRect(x + ww / 2 - 1, y, 2, hh);
  }
  const sy = h - 170;
  c.fillStyle = "#0b1422"; c.fillRect(20, sy, w - 40, 150);
  const g2 = c.createLinearGradient(0, sy, 0, sy + 150); g2.addColorStop(0, "#F7CF8A"); g2.addColorStop(1, "#B9783E");
  c.fillStyle = g2; c.globalAlpha = 0.85; c.fillRect(30, sy + 10, w - 60, 130); c.globalAlpha = 1;
  c.fillStyle = "rgba(0,0,0,0.4)"; for (let x = 30; x < w - 30; x += 70) c.fillRect(x, sy + 10, 4, 130);
});
const Building = ({ x, z, w, h, d, side, i }) => {
  const bases = ["#5b3b34", "#4a5466", "#6a4b3a", "#3f4d63", "#5e5248"];
  const tex = useMemo(() => facadeTex(String(i), bases[i % bases.length], Math.max(1, Math.round(h / 4) - 1), 3, 0.6), [i]);
  const front = side < 0 ? Math.PI / 2 : -Math.PI / 2;
  return (
    <group position={[x, h / 2, z]}>
      <mesh castShadow receiveShadow><boxGeometry args={[d, h, w]} /><meshStandardMaterial color={bases[i % bases.length]} roughness={0.85} /></mesh>
      {/* the street face (a textured plane just proud of the box) */}
      <mesh position={[side < 0 ? d / 2 + 0.01 : -d / 2 - 0.01, 0, 0]} rotation-y={front}><planeGeometry args={[w, h]} /><meshStandardMaterial map={tex} roughness={0.8} emissiveMap={tex} emissive="#ffb766" emissiveIntensity={0.35} /></mesh>
      {/* a parapet cap and an awning */}
      <mesh position={[0, h / 2 + 0.15, 0]} castShadow><boxGeometry args={[d + 0.25, 0.3, w + 0.25]} /><meshStandardMaterial color="#2a3446" roughness={0.6} /></mesh>
      <mesh position={[side < 0 ? d / 2 + 0.6 : -d / 2 - 0.6, -h / 2 + 3.1, 0]} rotation-z={side < 0 ? -0.35 : 0.35} castShadow><boxGeometry args={[1.3, 0.08, w * 0.9]} /><meshStandardMaterial color={i % 2 ? "#1F4E8C" : "#8A2F2F"} roughness={0.7} /></mesh>
    </group>
  );
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
const ticketTex = () => canvasTex("ticket", 512, 900, (c, w, h) => {
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
const ticketPose = (t, f) => {
  const k = ease(f, t.lottery - 34, t.lottery + 6);
  const y = 1.55 + 13 * (1 - k) * (1 - k);
  const sway = (1 - k) * 0.45 * Math.sin((f - t.lottery) / 5);
  return { pos: [TICKET_AT[0] + (1 - k) * 2.2 * Math.sin((f - t.lottery) / 9), y, TICKET_AT[2]], rot: [sway * 0.6, -0.35 + (1 - k) * 2.4, sway], vis: f > t.lottery - 36 };
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
      {[-1, 1].map((s) => <mesh key={s} position={[s * (ROAD_W / 2 + 1.1), 0.08, -60]} receiveShadow><boxGeometry args={[2.2, 0.16, 220]} /><meshStandardMaterial color="#4a5668" roughness={0.8} /></mesh>)}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -60]} receiveShadow><planeGeometry args={[400, 400]} /><meshStandardMaterial color="#0d2238" roughness={0.95} /></mesh>
      {blds.map((b) => <Building key={b.i} {...b} />)}
      {Array.from({ length: 6 }, (_, i) => <Lamp key={i} x={(i % 2 ? 1 : -1) * (ROAD_W / 2 + 0.6)} z={-8 - i * 9} />)}
      {/* the town-limit sign, right verge */}
      <group position={[ROAD_W / 2 + 0.9, 0, -12]} rotation-y={-0.32}>
        {[-0.9, 0.9].map((x) => <mesh key={x} position={[x, 1.4, -0.05]} castShadow><cylinderGeometry args={[0.07, 0.07, 2.8, 10]} /><meshStandardMaterial color="#9aa7b8" metalness={0.7} roughness={0.35} /></mesh>)}
        <mesh position={[0, 2.5, 0]} castShadow><boxGeometry args={[2.6, 1.62, 0.06]} /><meshStandardMaterial color="#0B3F7A" roughness={0.5} /></mesh>
        <mesh position={[0, 2.5, 0.032]}><planeGeometry args={[2.6, 1.62]} /><meshStandardMaterial map={sign} roughness={0.35} emissiveMap={sign} emissive="#ffffff" emissiveIntensity={0.18} /></mesh>
      </group>
      {/* the ticket, falling then standing on the road, with its contact shadow under the lamps */}
      {tp.vis && <Ticket pos={tp.pos} rot={tp.rot} />}
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
    { a: t.lottery - 10, b: t.years + 26, pos: [-2.0, 2.5, 1.2], target: [0.1, 1.15, -16], fov: 34 }
  ];
};
const Overlay = ({ f, P }) => {
  const t = T();
  const sign = P([ROAD_W / 2 + 0.9, 2.6, -12]);
  const tk = ticketPose(t, f);
  const tick = P([tk.pos[0] - 0.8, tk.pos[1] + 0.2, tk.pos[2]]);
  return (
    <>
      <Tag text="Evart, Michigan" at={t.town} out={t.lottery - 10} x={80} y={420} to={sign.behind ? null : sign} />
      <Tag text="Legal" at={t.legally - 2} out={t.next - 6} x={90} y={640} to={tick} />
      <Counter at={t.years - 4} out={t.next - 4} x={540} y={330} value={9} unit="YEARS" label="2003 – 2012" size={112} countDur={14} />
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
