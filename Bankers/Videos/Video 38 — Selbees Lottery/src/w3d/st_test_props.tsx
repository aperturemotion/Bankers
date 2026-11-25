// @ts-nocheck
// ★ V38 helpers for the TEST and COMPANY stations (builder B): a night room at table scale (1 unit = 10 cm; the table top is y 0).
//   · Room       back wall with a real window OPENING (the blue-hour street outside has parallax), a skirting, a floor
//   · Outside    what the window sees: a navy lawn, neighbours' houses with warm lit windows, trees, a street lamp (fogged)
//   · TableLamp  a small practical light (the only warm light in the frame): ceramic base, brass stem, a glowing shade, a warm pool
//   · Mug, Notepad, Pencil  small table props (FG depth)
//   · paper textures: the lottery ticket face, the $1 bill face, paper-stack edges, the $1 strap ("$100", ABA blue)
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd, Glow } from "./kit";
import { BODY, FIGURE } from "./fonts3d";

// ── textures ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const noiseTex = (key, base, amt = 18, n = 6000, w = 256, h = 256) => canvasTex("stt_noise_" + key, w, h, (c) => {
  c.fillStyle = base; c.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { const v = (rnd(i + key.length * 31) - 0.5) * amt; c.fillStyle = v > 0 ? `rgba(255,255,255,${v / 100})` : `rgba(0,10,30,${-v / 100})`; c.fillRect(rnd(i * 3 + 1) * w, rnd(i * 7 + 2) * h, 2, 2); }
});
// a Formica kitchen top: cool pale grey-blue with fine flecks (the classic speckle)
export const formicaTex = () => {
  const t = canvasTex("stt_formica", 512, 512, (c, w, h) => {
    c.fillStyle = "#B4C2D4"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      const k = rnd(i + 11);
      c.fillStyle = k < 0.33 ? "rgba(255,255,255,0.35)" : k < 0.66 ? "rgba(40,60,90,0.25)" : "rgba(120,150,190,0.35)";
      const s = 1 + Math.floor(rnd(i + 5) * 3); c.fillRect(rnd(i * 3) * w, rnd(i * 5 + 1) * h, s, s * (0.5 + rnd(i) * 1.5));
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return t;
};
// a lottery ticket (thermal slip, portrait): the same house design as the hook's ticket, at slip scale
export const ticketFaceTex = () => canvasTex("stt_ticketface", 320, 760, (c, w, h) => {
  c.fillStyle = "#F3F6FA"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#0B3F7A"; c.fillRect(0, 0, w, 120);
  c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.font = `800 62px ${BODY}`; c.fillText("LOTTERY", w / 2, 82);
  c.fillStyle = "#4D8ED9"; c.fillRect(0, 120, w, 10);
  c.fillStyle = "#0B2547"; c.font = `800 34px ${BODY}`; c.fillText("WINFALL", w / 2, 178);
  c.font = `600 25px ${BODY}`;
  ["A", "B", "C", "D", "E"].forEach((r, i) => {
    const y = 240 + i * 62;
    c.textAlign = "left"; c.fillText(r + ".", 18, y);
    for (let k = 0; k < 6; k++) { c.textAlign = "center"; c.fillText(String(1 + Math.floor(rnd(i * 6 + k + 41) * 46)).padStart(2, "0"), 76 + k * 42, y); }
  });
  c.fillStyle = "rgba(11,37,71,0.5)"; c.fillRect(18, 560, w - 36, 2);
  c.fillStyle = "#0B2547"; for (let k = 0; k < 46; k++) { const bw = 2 + Math.floor(rnd(k + 190) * 3); c.fillRect(24 + k * 5.9, 590, bw, 100); }
  c.font = `500 20px ${BODY}`; c.textAlign = "center"; c.fillText("1 DRAW", w / 2, 726);
});
// paper-stack edges: fine horizontal sheets (white thermal paper or bill paper), seen on a bundle's sides
export const edgeTex = (key, base, line) => canvasTex("stt_edge_" + key, 64, 256, (c, w, h) => {
  c.fillStyle = base; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 2) { c.fillStyle = rnd(y + key.length) < 0.5 ? line : "rgba(255,255,255,0.18)"; c.fillRect(0, y, w, 1); }
});
// the $1 bill (generic: no portrait, no real serials): sage-grey paper, a dark engraved frame of guilloche, corner numerals, a rosette oval
export const billFaceTex = () => canvasTex("stt_billface", 1024, 436, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#CBD5C8"); g.addColorStop(1, "#BCC8BF"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  const ink = "#2F4B44";
  c.strokeStyle = ink; c.lineWidth = 10; c.strokeRect(22, 22, w - 44, h - 44);
  // guilloche border band
  c.lineWidth = 1.2; c.strokeStyle = "rgba(47,75,68,0.75)";
  for (let k = 0; k < 4; k++) {
    c.beginPath();
    for (let x = 34; x <= w - 34; x += 2) { const y = 48 + 8 * Math.sin(x / (7 + k) + k); x === 34 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
    c.beginPath();
    for (let x = 34; x <= w - 34; x += 2) { const y = h - 48 + 8 * Math.sin(x / (7 + k) + k * 2); x === 34 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
  }
  // centre oval with a rosette (instead of a portrait)
  c.save(); c.translate(w / 2, h / 2);
  c.fillStyle = "rgba(255,255,255,0.35)"; c.beginPath(); c.ellipse(0, 0, 118, 140, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = ink; c.lineWidth = 6; c.beginPath(); c.ellipse(0, 0, 118, 140, 0, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 1; c.strokeStyle = "rgba(47,75,68,0.8)";
  for (let k = 0; k < 36; k++) { c.beginPath(); c.ellipse(0, 0, 90, 38, (k * Math.PI) / 36, 0, Math.PI * 2); c.stroke(); }
  c.restore();
  // seals and numerals
  [[230, h / 2], [w - 230, h / 2]].forEach(([x, y], i) => {
    c.strokeStyle = ink; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 58, 0, Math.PI * 2); c.stroke();
    for (let k = 0; k < 40; k++) { const a = (k / 40) * Math.PI * 2; c.beginPath(); c.moveTo(x + Math.cos(a) * 40, y + Math.sin(a) * 40); c.lineTo(x + Math.cos(a) * 56, y + Math.sin(a) * 56); c.stroke(); }
    c.fillStyle = i ? "rgba(30,90,80,0.55)" : "rgba(20,40,50,0.45)"; c.beginPath(); c.arc(x, y, 30, 0, Math.PI * 2); c.fill();
  });
  c.fillStyle = ink; c.font = `400 92px ${FIGURE}`; c.textAlign = "center";
  [[90, 130], [w - 90, 130], [90, h - 62], [w - 90, h - 62]].forEach(([x, y]) => c.fillText("1", x, y));
  c.font = `800 44px ${BODY}`; c.fillText("ONE", w / 2, h - 66);
});
// the $1 strap: ABA standard blue, printed "$100" (100 × $1)
export const strapTex = () => canvasTex("stt_strap", 256, 512, (c, w, h) => {
  c.fillStyle = "#2D62B0"; c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(255,255,255,0.10)"; c.fillRect(0, 0, 10, h); c.fillRect(w - 10, 0, 10, h);
  c.fillStyle = "#FFFFFF"; c.font = `400 104px ${FIGURE}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("$100", w / 2, h / 2 + 4);
});
// ── the room: a back wall with a window opening, skirting, a vinyl floor ───────────────────────────────────────────────────
const wallTex = () => {
  const t = canvasTex("stt_wall", 256, 256, (c, w, h) => {
    c.fillStyle = "#56708F"; c.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 32) { c.fillStyle = "rgba(255,255,255,0.05)"; c.fillRect(x, 0, 16, h); }   // a faint wallpaper stripe
    for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(0,15,40,${rnd(i) * 0.06})`; c.fillRect(rnd(i + 3) * w, rnd(i + 9) * h, 2, 2); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 3); return t;
};
const floorTex = () => {
  const t = canvasTex("stt_floor", 256, 256, (c, w, h) => {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? "#22364F" : "#6C819C"; c.fillRect(i * 64, j * 64, 64, 64); }
    c.strokeStyle = "rgba(0,0,0,0.25)"; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 12); return t;
};
/** Room: back wall at z = wallZ with a window opening [wx0, wx1] × [wy0, wy1]; floor at y = floorY. */
export const Room = ({ wallZ = -12, floorY = -7.4, wx0 = -7, wx1 = -0.5, wy0 = 1.8, wy1 = 9.5, width = 60, top = 22 }) => {
  const wt = useMemo(wallTex, []), ft = useMemo(floorTex, []);
  const wm = useMemo(() => new THREE.MeshStandardMaterial({ map: wt, roughness: 0.9, color: "#3B4C66", envMapIntensity: 0.4 }), [wt]);
  const L = -width / 2, R = width / 2, d = 0.6;
  const box = (x0, x1, y0, y1, k) => <mesh key={k} position={[(x0 + x1) / 2, (y0 + y1) / 2, wallZ - d / 2]} material={wm} receiveShadow><boxGeometry args={[x1 - x0, y1 - y0, d]} /></mesh>;
  const trim = "#93A7C0";
  return (
    <group>
      {box(L, wx0, floorY, top, "l")}{box(wx1, R, floorY, top, "r")}{box(wx0, wx1, floorY, wy0, "b")}{box(wx0, wx1, wy1, top, "t")}
      {/* the window: casing, sill, sashes (two panes over two), glass */}
      <group>
        {[[wx0 - 0.25, (wy0 + wy1) / 2, 0.5, wy1 - wy0 + 0.5], [wx1 + 0.25, (wy0 + wy1) / 2, 0.5, wy1 - wy0 + 0.5], [(wx0 + wx1) / 2, wy1 + 0.25, wx1 - wx0 + 1, 0.5]].map(([x, y, w, h], i) =>
          <mesh key={i} position={[x, y, wallZ + 0.12]} castShadow><boxGeometry args={[w, h, 0.25]} /><meshStandardMaterial color={trim} roughness={0.5} /></mesh>)}
        <mesh position={[(wx0 + wx1) / 2, wy0 - 0.12, wallZ + 0.35]} castShadow receiveShadow><boxGeometry args={[wx1 - wx0 + 1.4, 0.24, 1.0]} /><meshStandardMaterial color={trim} roughness={0.45} /></mesh>
        {/* sash bars */}
        <mesh position={[(wx0 + wx1) / 2, (wy0 + wy1) / 2, wallZ - 0.2]}><boxGeometry args={[wx1 - wx0, 0.22, 0.14]} /><meshStandardMaterial color={trim} roughness={0.5} /></mesh>
        <mesh position={[(wx0 + wx1) / 2, (wy0 + wy1) / 2, wallZ - 0.2]}><boxGeometry args={[0.14, wy1 - wy0, 0.14]} /><meshStandardMaterial color={trim} roughness={0.5} /></mesh>
        <mesh position={[(wx0 + wx1) / 2, (wy0 + wy1) / 2, wallZ - 0.3]}>
          <planeGeometry args={[wx1 - wx0, wy1 - wy0]} />
          <meshPhysicalMaterial color="#9CC0EC" transparent opacity={0.1} roughness={0.04} metalness={0} clearcoat={1} depthWrite={false} />
        </mesh>
      </group>
      {/* skirting board and the floor */}
      <mesh position={[0, floorY + 0.5, wallZ + 0.1]}><boxGeometry args={[width, 1.0, 0.2]} /><meshStandardMaterial color={trim} roughness={0.6} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, floorY, wallZ + 25]} receiveShadow><planeGeometry args={[width, 50]} /><meshStandardMaterial map={ft} roughness={0.55} metalness={0.05} /></mesh>
    </group>
  );
};
// ── outside the window: blue hour in a small town (houses with lit windows, trees, a street lamp), behind the wall ───────────────
const houseTex = (k) => canvasTex("stt_house" + k, 256, 192, (c, w, h) => {
  c.fillStyle = k % 2 ? "#2D3F57" : "#3A4A60"; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 8) { c.fillStyle = "rgba(0,0,0,0.12)"; c.fillRect(0, y, w, 1); }   // clapboard
  const wins = [[40, 60], [150, 60], [40, 120], [150, 120]];
  wins.forEach(([x, y], i) => {
    const on = rnd(k * 5 + i) < 0.55;
    c.fillStyle = "#121c2a"; c.fillRect(x - 3, y - 3, 46, 46);
    const g = c.createLinearGradient(0, y, 0, y + 40);
    if (on) { g.addColorStop(0, "#FFD9A0"); g.addColorStop(1, "#E4A25C"); } else { g.addColorStop(0, "#1f2e44"); g.addColorStop(1, "#18243a"); }
    c.fillStyle = g; c.fillRect(x, y, 40, 40); c.fillStyle = "rgba(0,0,0,0.4)"; c.fillRect(x + 19, y, 2, 40); c.fillRect(x, y + 19, 40, 2);
  });
});
const House = ({ x, z, k, s = 1, ry = 0 }) => {
  const t = useMemo(() => houseTex(k), [k]);
  return (
    <group position={[x, 0, z]} rotation-y={ry} scale={s}>
      <mesh position={[0, 14, 0]}><boxGeometry args={[34, 28, 26]} /><meshStandardMaterial color="#33445C" roughness={0.9} /></mesh>
      <mesh position={[0, 14, 13.05]}><planeGeometry args={[34, 28]} /><meshStandardMaterial map={t} emissiveMap={t} emissive="#FFFFFF" emissiveIntensity={0.55} roughness={0.9} /></mesh>
      <mesh position={[0, 34, 0]} rotation-y={Math.PI / 4}><coneGeometry args={[25, 13, 4]} /><meshStandardMaterial color="#121C2B" roughness={0.9} /></mesh>
    </group>
  );
};
const Tree = ({ x, z, s = 1 }) => (
  <group position={[x, 0, z]} scale={s}>
    <mesh position={[0, 6, 0]}><cylinderGeometry args={[0.8, 1.1, 12, 6]} /><meshStandardMaterial color="#1a2535" /></mesh>
    <mesh position={[0, 26, 0]}><coneGeometry args={[11, 34, 8]} /><meshStandardMaterial color="#14243A" roughness={1} /></mesh>
  </group>
);
/** what the window looks out on; placed behind the wall (z < wallZ), at ground y = floorY */
export const Outside = ({ floorY = -7.4, wallZ = -12 }) => (
  <group position={[0, floorY, wallZ]}>
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.05, -150]}><planeGeometry args={[600, 300]} /><meshStandardMaterial color="#0E2440" roughness={1} /></mesh>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, -40]}><planeGeometry args={[600, 8]} /><meshStandardMaterial color="#1A2638" roughness={0.4} metalness={0.2} /></mesh>
    <House x={-18} z={-46} k={1} s={0.42} ry={0.25} />
    <House x={12} z={-56} k={2} s={0.45} ry={-0.2} />
    <House x={-42} z={-62} k={3} s={0.5} ry={0.1} />
    <Tree x={-2} z={-24} s={0.45} /><Tree x={-30} z={-36} s={0.55} /><Tree x={14} z={-34} s={0.5} /><Tree x={-6} z={-80} s={0.8} />
    {/* a street lamp beyond the lawn */}
    <mesh position={[8, 6, -30]}><cylinderGeometry args={[0.15, 0.22, 12, 8]} /><meshStandardMaterial color="#1b2636" /></mesh>
    <mesh position={[8, 12.2, -30]}><sphereGeometry args={[0.5, 12, 10]} /><meshStandardMaterial color="#FFE2B0" emissive="#FFC97A" emissiveIntensity={3} /></mesh>
    <Glow position={[8, 12.2, -30]} size={6} color="#FFC07A" opacity={0.5} />
  </group>
);
// ── the table lamp (the warm practical) ───────────────────────────────────────────────────────────────────────────────────
const shadeTex = () => canvasTex("stt_shade", 64, 256, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#C99A62"); g.addColorStop(0.55, "#F2CF98"); g.addColorStop(1, "#FFE6BC");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 3) { c.fillStyle = `rgba(90,60,30,${0.04 + rnd(x) * 0.05})`; c.fillRect(x, 0, 1, h); }   // the linen weave
});
// the vase profile (a ceramic baluster, glazed in the house navy-blue), turned on a lathe
const VASE = [[0, 0], [0.95, 0], [1.0, 0.12], [0.9, 0.3], [1.05, 0.9], [1.12, 1.5], [0.98, 2.1], [0.62, 2.6], [0.38, 2.85], [0.34, 3.05], [0.45, 3.15], [0.0, 3.2]].map(([x, y]) => new THREE.Vector2(x, y));
export const TableLamp = ({ position = [0, 0, 0], on = 1, scale = 1 }) => {
  const st = useMemo(shadeTex, []);
  const vase = useMemo(() => new THREE.LatheGeometry(VASE, 48), []);
  return (
    <group position={position} scale={scale}>
      <mesh geometry={vase} castShadow receiveShadow><meshPhysicalMaterial color="#1D4A85" roughness={0.16} clearcoat={1} clearcoatRoughness={0.08} /></mesh>
      <mesh position={[0, 3.25, 0]}><cylinderGeometry args={[0.2, 0.26, 0.2, 20]} /><meshStandardMaterial color="#C9A86A" metalness={0.9} roughness={0.25} /></mesh>
      <mesh position={[0, 4.3, 0]} castShadow><cylinderGeometry args={[0.06, 0.06, 2.0, 12]} /><meshStandardMaterial color="#C9A86A" metalness={0.9} roughness={0.25} /></mesh>
      <mesh position={[0, 5.15, 0]}><sphereGeometry args={[0.3, 16, 12]} /><meshStandardMaterial color="#FFF1D6" emissive="#FFD9A0" emissiveIntensity={4 * on} /></mesh>
      {/* the shade: an open linen drum, lit from inside (brighter toward its open foot) */}
      <mesh position={[0, 5.5, 0]}>
        <cylinderGeometry args={[1.15, 1.7, 2.1, 48, 1, true]} />
        <meshStandardMaterial color="#2E261D" emissiveMap={st} emissive="#FFFFFF" emissiveIntensity={1.7 * on} roughness={0.95} side={THREE.DoubleSide} envMapIntensity={0.2} />
      </mesh>
      <mesh position={[0, 6.55, 0]}><torusGeometry args={[1.15, 0.035, 8, 48]} /><meshStandardMaterial color="#C9A86A" metalness={0.8} roughness={0.3} /></mesh>
      <mesh position={[0, 4.45, 0]}><torusGeometry args={[1.7, 0.035, 8, 48]} /><meshStandardMaterial color="#C9A86A" metalness={0.8} roughness={0.3} /></mesh>
      <pointLight position={[0, 4.6, 0]} intensity={70 * on} distance={30} decay={2} color="#FFC48A" />
      <pointLight position={[0, 6.8, 0]} intensity={10 * on} distance={14} decay={2} color="#FFD8A8" />
      <Glow position={[0, 5.3, 0]} size={6.5} color="#FFC07A" opacity={0.38 * on} />
      <Glow position={[0, 4.3, 0]} size={3.2} color="#FFE0B0" opacity={0.55 * on} />
    </group>
  );
};
// ── small props ────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const Mug = ({ position, ry = 0 }) => (
  <group position={position} rotation-y={ry}>
    <mesh position={[0, 0.95, 0]} castShadow receiveShadow><cylinderGeometry args={[0.72, 0.66, 1.9, 40, 1, true]} /><meshPhysicalMaterial color="#123E73" roughness={0.2} clearcoat={1} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0.05, 0]} castShadow><cylinderGeometry args={[0.66, 0.62, 0.1, 40]} /><meshPhysicalMaterial color="#123E73" roughness={0.2} clearcoat={1} /></mesh>
    <mesh position={[0, 1.6, 0]} rotation-x={-Math.PI / 2}><circleGeometry args={[0.66, 40]} /><meshStandardMaterial color="#1A0F08" roughness={0.15} /></mesh>
    <mesh position={[0, 1.9, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[0.7, 0.035, 10, 48]} /><meshPhysicalMaterial color="#DCE8FA" roughness={0.3} clearcoat={1} /></mesh>
    <mesh position={[0.82, 1.0, 0]}><torusGeometry args={[0.42, 0.1, 12, 32, Math.PI * 1.25]} /><meshPhysicalMaterial color="#123E73" roughness={0.2} clearcoat={1} /></mesh>
  </group>
);
const padTex = () => canvasTex("stt_pad", 256, 360, (c, w, h) => {
  c.fillStyle = "#F4F7FB"; c.fillRect(0, 0, w, h);
  c.strokeStyle = "rgba(77,142,217,0.55)"; c.lineWidth = 1.5; for (let y = 50; y < h; y += 22) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  c.strokeStyle = "rgba(217,58,58,0.45)"; c.beginPath(); c.moveTo(36, 0); c.lineTo(36, h); c.stroke();
  // pencil arithmetic, illegible at any size we show (scribble strokes, no readable figures)
  c.strokeStyle = "rgba(40,48,60,0.8)"; c.lineWidth = 2.2;
  for (let r = 0; r < 7; r++) {
    c.beginPath(); let x = 48 + rnd(r) * 20; const y = 44 + r * 22;
    c.moveTo(x, y); const n = 8 + Math.floor(rnd(r + 3) * 14);
    for (let k = 0; k < n; k++) { x += 5 + rnd(r * 40 + k) * 5; c.lineTo(x, y - rnd(r * 9 + k) * 12); }
    c.stroke();
  }
  c.fillStyle = "#1C2F4A"; c.fillRect(0, 0, w, 14);
});
export const Notepad = ({ position, ry = 0 }) => {
  const t = useMemo(padTex, []);
  return (
    <group position={position} rotation-y={ry}>
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow><boxGeometry args={[2.1, 0.12, 2.95]} /><meshStandardMaterial color="#E9EEF4" roughness={0.85} /></mesh>
      <mesh position={[0, 0.121, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[2.1, 2.95]} /><meshStandardMaterial map={t} roughness={0.85} /></mesh>
      {/* the pencil, lying across it */}
      <group position={[0.2, 0.2, 0.3]} rotation={[0, 0.7, Math.PI / 2]}>
        <mesh castShadow><cylinderGeometry args={[0.07, 0.07, 2.6, 6]} /><meshStandardMaterial color="#2A5A96" roughness={0.4} /></mesh>
        <mesh position={[0, 1.42, 0]}><coneGeometry args={[0.07, 0.24, 6]} /><meshStandardMaterial color="#E7D2B0" roughness={0.8} /></mesh>
        <mesh position={[0, -1.36, 0]}><cylinderGeometry args={[0.075, 0.075, 0.14, 10]} /><meshStandardMaterial color="#B9C3CF" metalness={0.8} roughness={0.3} /></mesh>
      </group>
    </group>
  );
};
