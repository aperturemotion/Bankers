// @ts-nocheck
// ★ V38 builder D — the RULES station's world: the small brick convenience store on Evart's main street at blue hour (the hook's
//   street, called back at the close) — its display window, a glass door, a sign band, the lit interior (tiled floor, shelves of
//   stock, the counter with a lottery terminal and a stand of WINFALL brochures, a pendant lamp), and the street outside: the row
//   of two-storey brick shops with lit windows and awnings, wet asphalt with the dashed centre line, the sidewalk and lamps.
//   Local metres; the store's front face is the plane z = 0 (street at +z); COUNTER_TOP is the counter's surface height.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd, std, Glow } from "./kit";
import { BODY, FIGURE } from "./fonts3d";
import { facade } from "./st_state_house";
import { LightPool, LightWash } from "./st_state_fx";

export const COUNTER_TOP = 0.96, COUNTER_Z = -0.75;
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
// a ground-floor shopfront for the neighbours: lit display window (warm), a door, a dark sign band (unreadable lettering)
const shopTex = (i) => ({
  map: canvasTex("rs_shop" + i, 512, 256, (c, w, h) => shopDraw(c, w, h, i, false)),
  emis: canvasTex("rs_shopE" + i, 512, 256, (c, w, h) => shopDraw(c, w, h, i, true))
});
const shopDraw = (c, w, h, i, e) => {
  c.fillStyle = e ? "#000" : "#1D2838"; c.fillRect(0, 0, w, h);
  if (!e) { c.fillStyle = ["#2A3F5E", "#3B2F3A", "#24404A"][i % 3]; c.fillRect(0, 0, w, 58); c.fillStyle = "rgba(220,230,245,0.35)"; for (let k = 0; k < 9; k++) c.fillRect(60 + k * 44, 22, 30, 14); }
  const lit = rnd(i * 7 + 1) < 0.75;
  const g = c.createLinearGradient(0, 70, 0, h);
  if (lit) { g.addColorStop(0, "#FFE1AE"); g.addColorStop(1, "#C98A4A"); } else { g.addColorStop(0, e ? "#000" : "#22344d"); g.addColorStop(1, e ? "#000" : "#121e30"); }
  c.fillStyle = g; c.fillRect(24, 76, 330, 160);
  if (!e || lit) { c.fillStyle = e ? "#000" : "rgba(0,0,0,0.45)"; for (let x = 24; x < 354; x += 82) c.fillRect(x, 76, 5, 160); }
  c.fillStyle = e ? "#000" : "#0E1724"; c.fillRect(380, 80, 100, 176);
  if (!e) { c.fillStyle = "rgba(255,220,170,0.25)"; c.fillRect(392, 92, 76, 90); }
};
// ── the neighbours ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const BASES = ["#5A4644", "#4B5466", "#63504A", "#40506A", "#5B5250", "#4E4448"];
const Shop = ({ x, w, h, i }) => {
  const v = i % 4, rows = Math.max(1, Math.round((h - 3.6) / 2.8));
  const up = useMemo(() => facade("rs_up" + v + "_" + rows, 512, 512, { cols: 3, rows, base: BASES[v], lit: 0.55, seed: 40 + v, top: 46, bottom: 16 }), [v, rows]);
  const sh = useMemo(() => shopTex(i % 3), [i]);
  return (
    <group position={[x, 0, -3]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow><boxGeometry args={[w, h, 6]} /><meshStandardMaterial color={BASES[v]} roughness={0.85} /></mesh>
      <mesh position={[0, 3.6 + (h - 3.6) / 2, 3.01]}><planeGeometry args={[w, h - 3.6]} /><meshStandardMaterial map={up.map} emissiveMap={up.emis} emissive="#FFFFFF" emissiveIntensity={0.9} roughness={0.8} /></mesh>
      <mesh position={[0, 1.8, 3.01]}><planeGeometry args={[w, 3.6]} /><meshStandardMaterial map={sh.map} emissiveMap={sh.emis} emissive="#FFFFFF" emissiveIntensity={0.85} roughness={0.6} /></mesh>
      <mesh position={[0, h + 0.18, 0]} castShadow><boxGeometry args={[w + 0.2, 0.36, 6.2]} /><meshStandardMaterial color="#232D3C" roughness={0.6} /></mesh>
      <mesh position={[0, h - 0.5, 3.08]}><boxGeometry args={[w, 0.16, 0.16]} /><meshStandardMaterial color="#8C97A8" roughness={0.6} /></mesh>
      <mesh position={[0, 3.25, 3.6]} rotation-x={0.42} castShadow><boxGeometry args={[w * 0.9, 0.06, 1.3]} /><meshStandardMaterial color={i % 2 ? "#1F4E8C" : "#35455E"} roughness={0.7} /></mesh>
    </group>
  );
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
const Store = () => {
  const brick = useMemo(() => { const t = brickTex("store", "#5C4A47"); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t; }, []);
  const sign = useMemo(signTex, []), decal = useMemo(decalTex, []), tile = useMemo(() => { const t = tileTex(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 3); return t; }, []);
  const stock = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1), n = 150;
    const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 0.6 }), n);
    const M = new THREE.Matrix4(), C = new THREE.Color();
    const cols = ["#D9E3F0", "#4D8ED9", "#22406A", "#E9EEF5", "#8FA9C8", "#C9A35C", "#B3CEEF", "#3A5A88", "#E0B070"];
    let i = 0;
    for (let s = 0; s < 4; s++) for (let k = 0; k < 36 && i < n; k++, i++) {
      const w = 0.12 + rnd(i) * 0.1, hh = 0.16 + rnd(i + 3) * 0.2;
      M.makeScale(w, hh, 0.22); M.setPosition(-3.6 + k * 0.2 + rnd(i + 5) * 0.02, 0.62 + s * 0.52 + hh / 2, -5.55);
      m.setMatrixAt(i, M); m.setColorAt(i, C.set(cols[Math.floor(rnd(i + 9) * cols.length)]));
    }
    m.count = i; m.receiveShadow = true;
    return m;
  }, []);
  const frame = <meshStandardMaterial color="#1B2433" metalness={0.6} roughness={0.35} />;
  return (
    <group>
      {/* the facade around the openings: piers, bulkhead, the header with the sign band */}
      <mesh position={[-3.65, 2.2, -0.15]} castShadow receiveShadow><boxGeometry args={[0.7, 4.4, 0.3]} /><meshStandardMaterial map={brick} roughness={0.85} /></mesh>
      <mesh position={[1.3, 1.45, -0.15]} castShadow receiveShadow><boxGeometry args={[0.4, 2.9, 0.3]} /><meshStandardMaterial map={brick} roughness={0.85} /></mesh>
      <mesh position={[3.3, 1.45, -0.15]} castShadow receiveShadow><boxGeometry args={[1.4, 2.9, 0.3]} /><meshStandardMaterial map={brick} roughness={0.85} /></mesh>
      <mesh position={[-1.1, 0.375, -0.15]} castShadow receiveShadow><boxGeometry args={[4.4, 0.75, 0.3]} /><meshStandardMaterial map={brick} roughness={0.85} /></mesh>
      <mesh position={[0, 3.65, -0.15]} castShadow receiveShadow><boxGeometry args={[8, 1.5, 0.3]} /><meshStandardMaterial map={brick} roughness={0.85} /></mesh>
      <mesh position={[0, 3.55, 0.03]}><planeGeometry args={[5.6, 0.86]} /><meshStandardMaterial map={sign} roughness={0.4} emissiveMap={sign} emissive="#FFFFFF" emissiveIntensity={0.55} /></mesh>
      <mesh position={[0, 4.5, -0.1]} castShadow><boxGeometry args={[8.2, 0.2, 0.5]} /><meshStandardMaterial color="#2A3446" roughness={0.6} /></mesh>
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
      <primitive object={stock} />
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
  const asphalt = useMemo(() => { const t = asphaltTex(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(30, 3); return t; }, []);
  const shops = useMemo(() => {
    const out = []; let x = -4.15, i = 0;
    while (x > -70) { const w = 6.4 + rnd(i + 2) * 2; out.push({ x: x - w / 2, w, h: 6.2 + Math.floor(rnd(i + 4) * 3) * 2.2, i }); x -= w + 0.05; i++; }
    x = 4.15; while (x < 40) { const w = 6.4 + rnd(i + 2) * 2; out.push({ x: x + w / 2, w, h: 6.2 + Math.floor(rnd(i + 4) * 3) * 2.2, i }); x += w + 0.05; i++; }
    return out;
  }, []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.03, 0]} receiveShadow><planeGeometry args={[400, 400]} /><meshStandardMaterial color="#0d2238" roughness={0.95} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[-15, 0, 8]} receiveShadow><planeGeometry args={[200, 9]} /><meshStandardMaterial map={asphalt} color="#7a8aa3" roughness={0.3} metalness={0.15} /></mesh>
      {Array.from({ length: 30 }, (_, i) => <mesh key={i} rotation-x={-Math.PI / 2} position={[30 - i * 7, 0.005, 8]}><planeGeometry args={[3.2, 0.16]} /><meshStandardMaterial color="#E8C766" emissive="#6b5520" emissiveIntensity={0.3} roughness={0.5} /></mesh>)}
      <mesh position={[-15, 0.08, 1.75]} receiveShadow><boxGeometry args={[200, 0.16, 3.5]} /><meshStandardMaterial color="#364152" roughness={0.8} /></mesh>
      <mesh position={[-15, 0.08, 14.25]} receiveShadow><boxGeometry args={[200, 0.16, 3.5]} /><meshStandardMaterial color="#364152" roughness={0.8} /></mesh>
      <Store />
      {/* the store's own depth behind its facade */}
      <mesh position={[0, 4.45, -3.2]} castShadow><boxGeometry args={[8.1, 0.3, 6.2]} /><meshStandardMaterial color="#232D3C" roughness={0.7} /></mesh>
      {shops.map((s) => <Shop key={s.i} {...s} />)}
      {/* across the street: the other row of shops, facing the store */}
      <group position={[0, 0, 16]} rotation-y={Math.PI}>
        {shops.filter((s) => s.x > -60).map((s) => <Shop key={"x" + s.i} x={-s.x + 2.5} w={s.w} h={s.h + (s.i % 3 === 1 ? 2.2 : 0)} i={s.i + 17} />)}
        {[-10, 0, 10, 20, 30, 40].map((x) => <Lamp key={x} x={x} z={3.1} />)}
      </group>
      {[-6, -16, -26, -36, -46, 7, 17].map((x) => <Lamp key={x} x={x} z={3.1} />)}
    </group>
  );
};
