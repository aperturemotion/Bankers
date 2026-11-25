// @ts-nocheck
// ★ V38 station STORE (origin [0,0,−58]): "In 2003, retired store owner Jerry Selbee read a brochure for a new Michigan game, Winfall.
//   He found the loophole in 3 minutes."
//   The camera flies on down the hook's main street (over the standing ticket) to the gap on the right at world z ≈ −55.6, where
//   the CORNER STORE stands: a modest one-storey brick front, a lit display window with the counter right behind it, a glass door,
//   a blue awning, gooseneck lamps over the sign, an ICE chest. "2003" lands; HIS OLD STORE tags the sign; the CBS photo of Jerry
//   and Marge comes up on "Jerry Selbee". On "read a brochure" the camera pushes through the window to the counter, where a WINFALL
//   leaflet lies by the lottery terminal; it unfolds on "new Michigan game" (cover → HOW TO PLAY | PRIZES | THE ROLL-DOWN). On
//   "loophole" a light-blue highlight runs along the roll-down rule; a 3:00 timer rolls in on "3 minutes"; the camera then pushes
//   INTO the rule's diagram (the jackpot column) — the rolldown station cuts to the matching close-up of the real machine.
//   Local frame: the street face of the shop is the plane x = FX (it faces −x, the road); the shop spans z Z0 … Z1.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { canvasTex, std, PAL, ease, easeOut, rnd, clamp01, Glow, Sky } from "./kit";
import { Tag, Inset } from "./overlays";
import { wf, wEnd } from "./take";
import { cueAt } from "../bnx/SfxLayer";
import { BODY, FIGURE } from "./fonts3d";
import { Brochure, BrochureStack, broPt, pxToDesign, RULE } from "./st_store_brochure";
import { staticFile } from "remotion";

const O = [0, 0, -58];
const W = (p) => [p[0] + O[0], p[1] + O[1], p[2] + O[2]];
export const T = () => ({
  in2003: wf("In", 1), y2003: wf("2003"), store: wf("store"), jerry: wf("Jerry", 1), read: wf("read"), brochure: wf("brochure"),
  newG: wf("new"), michigan: wf("Michigan", 1), winfall: wf("Winfall"), he: wf("He", 1), loophole: wf("loophole"), loopEnd: wEnd("loophole"),
  three: wf("3 minutes"), threeEnd: wEnd("3 minutes"), when: wf("When", 1)
});
// ── the shop's frame ─────────────────────────────────────────────────────────────────────────────────────────────────────
const FX = 6.7, Z0 = -1.45, Z1 = 6.25, WALL = 0.3, SIDE = 0.16, TOPH = 5.0, CEIL = 3.3, BACK = 12.0;
const WIN = { z0: 0.75, z1: 5.75, y0: 0.72, y1: 2.88 }, DOOR = { z0: -0.95, z1: 0.25, y1: 2.78 };
const COUNTER = { x0: 8.4, x1: 9.1, z0: 0.55, z1: 3.95, top: 1.0 };
const BP = [8.78, COUNTER.top + 0.03 + 0.0016, 2.2];   // the open brochure on the counter (page top toward the back of the shop)
// ── textures ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const brickImg = () => canvasTex("st_brick", 512, 512, (c, w, h) => {
  c.fillStyle = "#2b2a2f"; c.fillRect(0, 0, w, h);
  const bh = 16, bw = 48;
  for (let r = 0; r < h / bh; r++) for (let k = -1; k < w / bw + 1; k++) {
    const x = k * bw + (r % 2) * bw / 2, y = r * bh, i = r * 40 + k;
    const v = rnd(i), l = 30 + v * 12;
    c.fillStyle = `hsl(${12 + rnd(i + 5) * 10}, ${22 + rnd(i + 2) * 14}%, ${l}%)`;
    c.fillRect(x + 1.5, y + 1.5, bw - 3, bh - 3);
    c.fillStyle = `rgba(255,255,255,${0.04 + rnd(i + 9) * 0.05})`; c.fillRect(x + 1.5, y + 1.5, bw - 3, 2);
    c.fillStyle = "rgba(0,0,0,0.12)"; c.fillRect(x + 1.5, y + bh - 4, bw - 3, 2.5);
  }
  for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(0,0,0,${rnd(i + 17) * 0.12})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
});
const useBrick = (w, h) => useMemo(() => {
  const t = brickImg().clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 1.6, h / 1.6); t.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ map: t, color: "#B4B8C8", roughness: 0.88, metalness: 0 });
}, [w, h]);
const signTex = () => canvasTex("st_sign", 1400, 200, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#0E3B73"); g.addColorStop(1, "#082A55"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = "rgba(179,206,239,0.75)"; c.lineWidth = 6; c.strokeRect(14, 14, w - 28, h - 28);
  c.fillStyle = "#F4F8FD"; c.font = `800 118px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle"; c.letterSpacing = "10px";
  c.fillText("CORNER STORE", w / 2, h / 2 + 6);
});
const posterTex = () => canvasTex("st_poster", 300, 400, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#08305E"); g.addColorStop(1, "#005DC8"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = "#FFFFFF"; c.beginPath(); c.roundRect(20, 20, 110, 46, 23); c.fill();
  c.fillStyle = "#005DC8"; c.font = `800 30px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("NEW!", 75, 44);
  c.fillStyle = "#FFFFFF"; c.font = `130px ${FIGURE}`; c.textBaseline = "alphabetic"; c.fillText("WIN", w / 2, 205); c.fillStyle = "#B3CEEF"; c.fillText("FALL", w / 2, 330);
  c.fillStyle = "#FFFFFF"; c.font = `700 24px ${BODY}`; c.fillText("PLAY IT HERE", w / 2, 378);
});
const lottoSignTex = () => canvasTex("st_lotto", 512, 128, (c, w, h) => {
  c.fillStyle = "#0A2A52"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#EAF3FF"; c.font = `800 84px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("LOTTERY", w / 2, h / 2 + 4);
});
const openTex = () => canvasTex("st_open", 256, 96, (c, w, h) => {
  c.fillStyle = "#000"; c.fillRect(0, 0, w, h);
  c.strokeStyle = "#FFB36B"; c.lineWidth = 5; c.beginPath(); c.roundRect(8, 8, w - 16, h - 16, 30); c.stroke();
  c.fillStyle = "#FFD6A0"; c.font = `800 60px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("OPEN", w / 2, h / 2 + 3);
});
const iceTex = () => canvasTex("st_ice", 256, 160, (c, w, h) => {
  c.fillStyle = "#EEF3F9"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#005DC8"; c.font = `110px ${FIGURE}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("ICE", w / 2, h / 2 + 6);
});
const tileTex = () => canvasTex("st_tile", 256, 256, (c, w, h) => {
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? "#8E9AAD" : "#4C5A70"; c.fillRect(i * 32, j * 32, 32, 32); }
  for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(0,0,0,${rnd(i) * 0.06})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
});
const termTex = () => canvasTex("st_term", 400, 260, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#0E4A92"); g.addColorStop(1, "#06264F"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = "#FFFFFF"; c.font = `92px ${FIGURE}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("WINFALL", w / 2, 100);
  for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? "#7FB4F2" : "#EAF3FF"; c.beginPath(); c.arc(70 + k * 52, 190, 20, 0, 7); c.fill(); }
});
const awningTex = () => canvasTex("st_awning", 512, 64, (c, w, h) => {
  for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? "#3D6EA8" : "#0B2F5E"; c.fillRect(i * 32, 0, 32, h); }
  c.fillStyle = "rgba(0,0,0,0.25)"; for (let i = 0; i < 16; i++) c.fillRect(i * 32, 0, 2, h);
});
const bladeTex = () => canvasTex("st_blade", 400, 400, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#0E3B73"); g.addColorStop(1, "#082A55"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = "rgba(179,206,239,0.8)"; c.lineWidth = 8; c.strokeRect(16, 16, w - 32, h - 32);
  c.fillStyle = "#F4F8FD"; c.textAlign = "center"; c.textBaseline = "middle";
  c.font = `110px ${FIGURE}`; c.fillText("CORNER", w / 2, 140); c.fillText("STORE", w / 2, 262);
  c.fillStyle = "#7FB4F2"; c.fillRect(70, 330, w - 140, 6);
});
// ── small builders ───────────────────────────────────────────────────────────────────────────────────────────────────────
const Box = ({ p, s, m, cast = true, recv = true, ...r }) => (
  <mesh position={p} castShadow={cast} receiveShadow={recv} material={m} {...r}><boxGeometry args={s} /></mesh>
);
const M = {
  frame: std("#2A3240", 0.35, 0.75), steel: std("#8FA9C8", 0.3, 0.8), dark: std("#151C27", 0.6, 0.2), lintel: std("#1E2733", 0.5, 0.6),
  stone: std("#8D97A6", 0.75, 0.05), wallIn: std("#3E4E66", 0.85, 0, { envMapIntensity: 0.25 }), ceil: std("#2E3A4D", 0.9, 0, { envMapIntensity: 0.2 }),
  lam: std("#34465F", 0.45, 0.1, { envMapIntensity: 0.4 }), top: new THREE.MeshStandardMaterial({ map: canvasTex("st_lamtop", 512, 512, (c, w, h) => { c.fillStyle = "#46546A"; c.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const g = rnd(i) > 0.5 ? 255 : 0; c.fillStyle = `rgba(${g},${g},${g},${0.03 + rnd(i + 1) * 0.05})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2, 2); } }), roughness: 0.42, metalness: 0.05, envMapIntensity: 0.45 }), shelf: std("#6F7E93", 0.5, 0.3, { envMapIntensity: 0.4 }),
  plastic: std("#1F2733", 0.45, 0.1), keys: std("#7A8798", 0.5, 0.2)
};
const glassMat = new THREE.MeshPhysicalMaterial({ color: "#A9C8EE", roughness: 0.04, metalness: 0, transparent: true, opacity: 0.14, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide });
// products on shelves: one instanced mesh, muted packaging colours (a few small warm accents)
const PACK = ["#2F5F9E", "#E9EEF4", "#7C93B0", "#B83A3A", "#3B4A63", "#D8B25A", "#4E7FC2", "#9FB6D3", "#26406A", "#C8D4E2"];
const Products = ({ slots }) => {
  const ref = React.useRef();
  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 }), []);
  React.useLayoutEffect(() => {
    const m = ref.current, o = new THREE.Object3D(), c = new THREE.Color();
    slots.forEach((s, i) => { o.position.set(...s.p); o.scale.set(...s.s); o.rotation.set(0, s.r ?? 0, 0); o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, c.set(s.c)); });
    m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [slots]);
  return <instancedMesh ref={ref} args={[geo, mat, slots.length]} castShadow receiveShadow />;
};
const shelfSlots = () => {
  const out = [];
  // back wall shelving behind the counter (packs, cartons)
  for (let r = 0; r < 4; r++) for (let k = 0; k < 26; k++) {
    const i = r * 100 + k, h = 0.16 + rnd(i) * 0.12, w = 0.1 + rnd(i + 3) * 0.06;
    out.push({ p: [BACK - 0.22, 1.18 + r * 0.42 + h / 2, -0.9 + k * 0.27], s: [0.16, h, w], c: PACK[Math.floor(rnd(i + 7) * PACK.length)] });
  }
  // the gondola on the near side (two faces, three shelves)
  for (let f = 0; f < 2; f++) for (let r = 0; r < 3; r++) for (let k = 0; k < 12; k++) {
    const i = 1000 + f * 300 + r * 40 + k, h = 0.18 + rnd(i) * 0.16, w = 0.12 + rnd(i + 3) * 0.06;
    out.push({ p: [9.55 + k * 0.16, 0.42 + r * 0.46 + h / 2, 5.05 + (f ? 0.22 : -0.22)], s: [w, h, 0.14], c: PACK[Math.floor(rnd(i + 7) * PACK.length)] });
  }
  // candy and gum on the counter's front rack
  for (let k = 0; k < 9; k++) { const i = 2000 + k; out.push({ p: [8.36, 0.62 + (k % 3) * 0.13, 0.9 + Math.floor(k / 3) * 0.18 + (k % 3) * 0.05], s: [0.05, 0.1, 0.13], c: PACK[Math.floor(rnd(i) * PACK.length)] }); }
  return out;
};
const Lamp = ({ z }) => (
  <group position={[FX - 0.08, 4.32, z]}>
    <mesh position={[-0.22, 0.12, 0]} rotation-z={0.9} material={M.frame}><cylinderGeometry args={[0.018, 0.018, 0.5, 8]} /></mesh>
    <mesh position={[-0.42, 0.24, 0]} rotation-z={-0.5} material={M.frame}><coneGeometry args={[0.09, 0.14, 16, 1, true]} /></mesh>
    <mesh position={[-0.40, 0.19, 0]}><sphereGeometry args={[0.04, 10, 8]} /><meshBasicMaterial color="#FFE6BE" toneMapped={false} /></mesh>
    <Glow position={[-0.36, 0.1, 0]} size={0.9} color="#FFD49A" opacity={0.55} />
  </group>
);
// ── the shop ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const Shop = ({ f, t }) => {
  const W_ = Z1 - Z0;
  const brickPier = useBrick(0.5, TOPH), brickBand = useBrick(W_, 1.3), brickKnee = useBrick(5, 0.6), brickTop = useBrick(W_, 0.9);
  const sign = useMemo(signTex, []), poster = useMemo(posterTex, []), lotto = useMemo(lottoSignTex, []), open = useMemo(openTex, []);
  const blade = useMemo(bladeTex, []), ice = useMemo(iceTex, []), term = useMemo(termTex, []), awn = useMemo(awningTex, []);
  const tile = useMemo(() => { const t = tileTex().clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5.3 / 1.3, 7.1 / 1.3); t.needsUpdate = true; return t; }, []);
  const slots = useMemo(shelfSlots, []);
  const zc = (Z0 + Z1) / 2;
  const fx = FX + WALL / 2;
  // the OPEN sign breathes very slightly (a neon tube), the terminal screen idles
  const neon = 0.85 + 0.15 * Math.sin(f / 9);
  return (
    <group>
      {/* ── the street face ── */}
      <Box p={[fx, SIDE + (TOPH - SIDE) / 2, Z1 - 0.25]} s={[WALL, TOPH - SIDE, 0.5]} m={brickPier} />
      <Box p={[fx, SIDE + (TOPH - SIDE) / 2, (DOOR.z1 + WIN.z0) / 2]} s={[WALL, TOPH - SIDE, WIN.z0 - DOOR.z1]} m={brickPier} />
      <Box p={[fx, SIDE + (TOPH - SIDE) / 2, (Z0 + DOOR.z0) / 2]} s={[WALL, TOPH - SIDE, DOOR.z0 - Z0]} m={brickPier} />
      <Box p={[fx, (SIDE + WIN.y0) / 2, (WIN.z0 + WIN.z1) / 2]} s={[WALL, WIN.y0 - SIDE, WIN.z1 - WIN.z0]} m={brickKnee} />
      <Box p={[fx, 3.55, zc]} s={[WALL, 1.3, W_]} m={brickBand} />
      <Box p={[fx, 4.55, zc]} s={[WALL, 0.9, W_]} m={brickTop} />
      {/* steel lintel, stone sill, cornice with a soldier course and a cap */}
      <Box p={[FX - 0.02, 2.98, zc]} s={[0.12, 0.2, W_ - 0.2]} m={M.lintel} />
      <Box p={[FX - 0.06, WIN.y0 - 0.03, (WIN.z0 + WIN.z1) / 2]} s={[0.2, 0.07, WIN.z1 - WIN.z0 + 0.2]} m={M.stone} />
      <Box p={[FX - 0.06, 4.98, zc]} s={[0.14, 0.12, W_]} m={M.stone} />
      <Box p={[FX - 0.12, 5.1, zc]} s={[0.36, 0.14, W_ + 0.1]} m={M.lintel} />
      {Array.from({ length: 30 }, (_, i) => <Box key={i} p={[FX - 0.05, 4.86, Z0 + 0.15 + i * (W_ - 0.3) / 29]} s={[0.08, 0.08, 0.1]} m={M.stone} cast={false} />)}
      {/* the sign panel and its gooseneck lamps */}
      <group position={[FX - 0.06, 3.62, zc + 0.15]}>
        <Box p={[0, 0, 0]} s={[0.08, 0.9, 6.4]} m={M.frame} />
        <mesh position={[-0.041, 0, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[6.3, 0.88]} /><meshStandardMaterial map={sign} roughness={0.4} emissiveMap={sign} emissive="#ffffff" emissiveIntensity={0.55} /></mesh>
      </group>
      {[-0.4, 1.6, 3.6].map((z, i) => <Lamp key={i} z={z + 0.15} />)}
      {/* the awning over the display window */}
      <group position={[FX - 0.36, 2.98, (WIN.z0 + WIN.z1) / 2]} rotation-z={-0.38}>
        <mesh castShadow receiveShadow><boxGeometry args={[0.8, 0.025, WIN.z1 - WIN.z0 + 0.3]} /><meshStandardMaterial map={awn} roughness={0.85} /></mesh>
        <mesh position={[-0.4, -0.08, 0]} rotation-z={0.38}><boxGeometry args={[0.015, 0.16, WIN.z1 - WIN.z0 + 0.3]} /><meshStandardMaterial map={awn} roughness={0.85} /></mesh>
      </group>
      {/* the blade sign over the sidewalk, read from down the street */}
      <group position={[FX - 0.05, 3.55, Z1 - 0.45]}>
        <Box p={[-0.45, 0.62, 0]} s={[0.9, 0.04, 0.04]} m={M.frame} />
        <mesh position={[-0.12, 0.42, 0]} rotation-z={0.8} material={M.frame}><cylinderGeometry args={[0.012, 0.012, 0.55, 6]} /></mesh>
        {[-0.2, -0.7].map((x) => <mesh key={x} position={[x, 0.5, 0]} material={M.frame}><cylinderGeometry args={[0.006, 0.006, 0.2, 4]} /></mesh>)}
        <Box p={[-0.45, 0.0, 0]} s={[0.78, 0.8, 0.06]} m={M.frame} />
        {[1, -1].map((sd) => <mesh key={sd} position={[-0.45, 0, sd * 0.031]} rotation-y={sd > 0 ? 0 : Math.PI}><planeGeometry args={[0.72, 0.74]} /><meshStandardMaterial map={blade} roughness={0.4} emissiveMap={blade} emissive="#ffffff" emissiveIntensity={0.6} /></mesh>)}
        <Glow position={[-0.45, 0, 0.2]} size={1.6} color="#7FB4F2" opacity={0.22} />
      </group>
      {/* the display window: frame, transom, glass, the hanging LOTTERY light box, the WINFALL poster, the neon OPEN */}
      <Box p={[FX + 0.06, (WIN.y0 + WIN.y1) / 2, WIN.z0 + 0.04]} s={[0.1, WIN.y1 - WIN.y0, 0.08]} m={M.frame} />
      <Box p={[FX + 0.06, (WIN.y0 + WIN.y1) / 2, WIN.z1 - 0.04]} s={[0.1, WIN.y1 - WIN.y0, 0.08]} m={M.frame} />
      <Box p={[FX + 0.06, WIN.y1 - 0.04, (WIN.z0 + WIN.z1) / 2]} s={[0.1, 0.08, WIN.z1 - WIN.z0]} m={M.frame} />
      <Box p={[FX + 0.06, WIN.y0 + 0.04, (WIN.z0 + WIN.z1) / 2]} s={[0.1, 0.08, WIN.z1 - WIN.z0]} m={M.frame} />
      <Box p={[FX + 0.06, 2.42, (WIN.z0 + WIN.z1) / 2]} s={[0.08, 0.06, WIN.z1 - WIN.z0]} m={M.frame} />
      <mesh position={[FX + 0.1, (WIN.y0 + WIN.y1) / 2, (WIN.z0 + WIN.z1) / 2]} rotation-y={-Math.PI / 2} material={glassMat}><planeGeometry args={[WIN.z1 - WIN.z0, WIN.y1 - WIN.y0]} /></mesh>
      <group position={[FX + 0.35, 2.12, 4.6]}>
        {[-0.5, 0.5].map((z) => <mesh key={z} position={[0, 0.22, z]} material={M.frame}><cylinderGeometry args={[0.006, 0.006, 0.3, 4]} /></mesh>)}
        <Box p={[0, 0, 0]} s={[0.06, 0.26, 1.04]} m={M.dark} />
        <mesh position={[-0.031, 0, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[1.0, 0.24]} /><meshBasicMaterial map={lotto} toneMapped={false} /></mesh>
        <Glow position={[-0.1, 0, 0]} size={1.4} color="#7FB4F2" opacity={0.35} />
      </group>
      <mesh position={[FX + 0.115, 1.3, 1.25]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.45, 0.6]} /><meshStandardMaterial map={poster} roughness={0.5} emissiveMap={poster} emissive="#ffffff" emissiveIntensity={0.25} /></mesh>
      {/* the door: frame, glass, push bar, the neon OPEN behind its glass */}
      <Box p={[FX + 0.06, SIDE + (DOOR.y1 - SIDE) / 2, DOOR.z0 + 0.05]} s={[0.12, DOOR.y1 - SIDE, 0.1]} m={M.frame} />
      <Box p={[FX + 0.06, SIDE + (DOOR.y1 - SIDE) / 2, DOOR.z1 - 0.05]} s={[0.12, DOOR.y1 - SIDE, 0.1]} m={M.frame} />
      <Box p={[FX + 0.06, DOOR.y1 - 0.05, (DOOR.z0 + DOOR.z1) / 2]} s={[0.12, 0.1, DOOR.z1 - DOOR.z0]} m={M.frame} />
      <Box p={[FX + 0.06, SIDE + 0.12, (DOOR.z0 + DOOR.z1) / 2]} s={[0.12, 0.24, DOOR.z1 - DOOR.z0]} m={M.frame} />
      <mesh position={[FX + 0.07, 1.5, (DOOR.z0 + DOOR.z1) / 2]} rotation-y={-Math.PI / 2} material={glassMat}><planeGeometry args={[DOOR.z1 - DOOR.z0 - 0.2, 2.3]} /></mesh>
      <Box p={[FX - 0.04, 1.08, (DOOR.z0 + DOOR.z1) / 2]} s={[0.05, 0.05, 0.9]} m={M.steel} />
      <mesh position={[FX + 0.16, 2.05, (DOOR.z0 + DOOR.z1) / 2]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.7, 0.26]} /><meshBasicMaterial map={open} transparent blending={THREE.AdditiveBlending} opacity={neon} toneMapped={false} depthWrite={false} /></mesh>
      <Glow position={[FX + 0.05, 2.05, (DOOR.z0 + DOOR.z1) / 2]} size={1.1} color="#FF9F5E" opacity={0.32 * neon} />
      {/* the ICE chest by the door */}
      <group position={[FX - 0.55, SIDE, Z0 + 0.1]}>
        <Box p={[0, 0.55, 0]} s={[0.75, 1.1, 0.0001]} m={M.top} cast={false} />
        <Box p={[0, 0.55, -0.42]} s={[0.78, 1.1, 0.9]} m={std("#E8EEF5", 0.4, 0.1)} />
        <Box p={[0, 1.12, -0.42]} s={[0.82, 0.06, 0.94]} m={M.steel} />
        <mesh position={[-0.395, 0.66, -0.42]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.7, 0.44]} /><meshStandardMaterial map={ice} roughness={0.5} /></mesh>
      </group>
      {/* ── the inside ── */}
      <mesh rotation-x={-Math.PI / 2} position={[(FX + WALL + BACK) / 2, SIDE + 0.002, zc]} receiveShadow><planeGeometry args={[BACK - FX - WALL, W_ - 0.2]} /><meshStandardMaterial map={tile} color="#6E7C90" roughness={0.35} metalness={0.05} envMapIntensity={0.35} /></mesh>
      <Box p={[BACK + 0.15, TOPH / 2, zc]} s={[0.3, TOPH, W_]} m={M.wallIn} />
      <Box p={[(FX + BACK) / 2 + 0.15, TOPH / 2, Z0 + 0.08]} s={[BACK - FX, TOPH, 0.16]} m={M.wallIn} />
      <Box p={[(FX + BACK) / 2 + 0.15, TOPH / 2, Z1 - 0.08]} s={[BACK - FX, TOPH, 0.16]} m={M.wallIn} />
      <Box p={[(FX + WALL + BACK) / 2, CEIL + 0.05, zc]} s={[BACK - FX - WALL, 0.1, W_]} m={M.ceil} />
      <Box p={[(FX + BACK) / 2 + 0.1, TOPH + 0.02, zc]} s={[BACK - FX + 0.2, 0.2, W_]} m={M.lintel} />
      {[[8.7, 2.3], [10.7, 2.3], [10.7, -0.2], [8.7, 5.0]].map(([x, z], i) => (
        <group key={i} position={[x, CEIL - 0.02, z]}>
          <Box p={[0, 0, 0]} s={[0.62, 0.04, 1.24]} m={M.shelf} cast={false} />
          <mesh position={[0, -0.022, 0]} rotation-x={Math.PI / 2}><planeGeometry args={[0.52, 1.12]} /><meshBasicMaterial color="#C9DBF2" /></mesh>
        </group>
      ))}
      <pointLight position={[8.7, 2.95, 2.3]} intensity={2.2} distance={6} decay={1.6} color="#DCE8FA" />
      <pointLight position={[10.8, 2.95, 0.6]} intensity={1.6} distance={6} decay={1.6} color="#FFE2BC" />
      {/* the pool of light on the counter where the leaflet lies */}
      <pointLight position={[8.95, 1.95, 2.25]} intensity={1.1} distance={2.6} decay={2} color="#FFF1DC" />
      {/* the counter: kick plate, laminate front, the top; a candy rack on its customer face */}
      <Box p={[(COUNTER.x0 + COUNTER.x1) / 2, SIDE + 0.06, (COUNTER.z0 + COUNTER.z1) / 2]} s={[COUNTER.x1 - COUNTER.x0 - 0.08, 0.12, COUNTER.z1 - COUNTER.z0 - 0.08]} m={M.dark} />
      <Box p={[(COUNTER.x0 + COUNTER.x1) / 2, (SIDE + 0.12 + COUNTER.top) / 2, (COUNTER.z0 + COUNTER.z1) / 2]} s={[COUNTER.x1 - COUNTER.x0, COUNTER.top - SIDE - 0.12, COUNTER.z1 - COUNTER.z0]} m={M.lam} />
      <Box p={[(COUNTER.x0 + COUNTER.x1) / 2, COUNTER.top + 0.015, (COUNTER.z0 + COUNTER.z1) / 2]} s={[COUNTER.x1 - COUNTER.x0 + 0.14, 0.03, COUNTER.z1 - COUNTER.z0 + 0.1]} m={M.top} />
      <Box p={[COUNTER.x0 - 0.06, 0.82, 1.2]} s={[0.04, 0.5, 0.7]} m={M.steel} />
      {/* the register */}
      <group position={[8.9, COUNTER.top + 0.03, 0.95]}>
        <Box p={[0, 0.06, 0]} s={[0.42, 0.12, 0.42]} m={M.plastic} />
        <Box p={[-0.06, 0.16, 0]} s={[0.22, 0.08, 0.34]} m={M.keys} rotation-z={0.25} />
        <Box p={[0.12, 0.3, 0]} s={[0.04, 0.2, 0.3]} m={M.plastic} />
        <mesh position={[0.098, 0.32, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.26, 0.12]} /><meshBasicMaterial color="#7FB4F2" toneMapped={false} /></mesh>
      </group>
      {/* the lottery terminal: body, slanted screen, ticket slot, a roll of stock */}
      <group position={[8.86, COUNTER.top + 0.03, 3.45]}>
        <Box p={[0.04, 0.09, 0]} s={[0.4, 0.18, 0.48]} m={M.plastic} />
        <Box p={[-0.17, 0.19, 0]} s={[0.03, 0.025, 0.34]} m={M.dark} />
        <group position={[0.12, 0.34, 0]} rotation-z={0.42}>
          <Box p={[0, 0, 0]} s={[0.04, 0.32, 0.46]} m={M.plastic} />
          <mesh position={[-0.021, 0, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.4, 0.26]} /><meshBasicMaterial map={term} toneMapped={false} /></mesh>
        </group>
        <Glow position={[0.0, 0.36, 0]} size={0.7} color="#5C9BE8" opacity={0.35} />
      </group>
      {/* the brochure stand (a short stack, an acrylic holder) and the open leaflet */}
      <group position={[8.95, COUNTER.top + 0.03, 2.85]}>
        <Box p={[0, 0.1, 0]} s={[0.36, 0.2, 0.2]} m={glassMat} cast={false} />
      </group>
      <BrochureStack p={[9.0, COUNTER.top + 0.03, 2.86]} n={5} yaw={0.08} />
      {/* a pen beside the leaflet and a few play slips */}
      <group position={[8.7, COUNTER.top + 0.04, 2.47]} rotation-y={0.5}>
        <mesh rotation-z={Math.PI / 2} material={M.plastic} castShadow><cylinderGeometry args={[0.0055, 0.0055, 0.14, 12]} /></mesh>
        <mesh position={[0.045, 0, 0]} rotation-z={Math.PI / 2} castShadow><cylinderGeometry args={[0.0062, 0.0062, 0.05, 12]} /><meshStandardMaterial color="#1F5FB4" roughness={0.3} metalness={0.2} /></mesh>
        <mesh position={[-0.075, 0, 0]} rotation-z={-Math.PI / 2} material={M.steel}><coneGeometry args={[0.0055, 0.014, 12]} /></mesh>
      </group>
      {[0, 1, 2].map((i) => <mesh key={i} position={[8.62 + i * 0.01, COUNTER.top + 0.032 + i * 0.0006, 1.86 - i * 0.03]} rotation-x={-Math.PI / 2} rotation-z={0.3 + i * 0.12} receiveShadow><planeGeometry args={[0.09, 0.19]} /><meshStandardMaterial color={i === 2 ? "#E9EFF7" : "#D7E2F0"} roughness={0.7} /></mesh>)}
      {/* shelves behind the counter and the gondola */}
      {[0, 1, 2, 3].map((r) => <Box key={r} p={[BACK - 0.2, 1.16 + r * 0.42, 2.6]} s={[0.36, 0.03, 7.2]} m={M.shelf} cast={false} />)}
      <Box p={[10.5, 0.75, 5.05]} s={[2.0, 1.5, 0.08]} m={M.shelf} />
      {[0, 1, 2].map((r) => <Box key={r} p={[10.5, 0.4 + r * 0.46, 5.05]} s={[2.0, 0.03, 0.7]} m={M.shelf} cast={false} />)}
      <Products slots={slots} />
    </group>
  );
};
// ── the brochure's beats ─────────────────────────────────────────────────────────────────────────────────────────────────
const broOpen = (t, f) => ease(f, t.newG - 2, t.winfall + 6);
const hiK = (t, f) => ease(f, t.loophole - 4, t.loopEnd + 16);
// the diagram's jackpot column (spread px → the counter's frame) and the rule's mid-point for the tags
const DIAG = pxToDesign(1330, 960);
const diagPt = (dz = 0.002) => broPt(BP, DIAG[0], DIAG[1], dz);
const rulePt = () => { const d = pxToDesign(1420, 340); return broPt(BP, d[0], d[1]); };
const coverPt = () => broPt(BP, -0.15 + 0.0, 0.02);
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  return (
    <group>
      <Sky />
      <Shop f={f} t={t} />
      <Brochure p={BP} open={broOpen(t, f)} hi={hiK(t, f)} glow={1 - ease(f, t.loopEnd + 14, t.loopEnd + 24)} />
    </group>
  );
};
// the push INTO the diagram ends 7.5 cm over the paper (the near plane is 5 cm), closer than the camera's idle drift (kit.makeCam: ±6 cm) — so it is keyed one
// shot per frame with that drift subtracted (the kit's own formula), landing exactly on the paper without ever dipping under it
const drift = (f) => [0.06 * Math.sin(f / 97), 0.04 * Math.sin(f / 131 + 1), 0.05 * Math.sin(f / 113 + 2)];
const pushIn = (t, d) => {
  const a = t.threeEnd - 12, b = t.when - 1;
  const P5 = [d[0] - 0.2, d[1] + 0.36, d[2]], P6 = [d[0] - 0.008, d[1] + 0.075, d[2]];
  const out = [];
  for (let f = a + 1; f <= b; f++) {
    const e = ease(f, a, b), dr = drift(f);
    const want = [0, 1, 2].map((k) => (P5[k] + dr[k]) * (1 - e) + P6[k] * e);
    out.push({ a: f - 1, b: f, pos: W([want[0] - dr[0], want[1] - dr[1], want[2] - dr[2]]), target: W(d), fov: 32 - 2 * e });
  }
  return out;
};
// ── the camera ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const shots = () => {
  const t = T();
  const d = diagPt(0);
  return [
    // the flight down main street from the hook (over the standing ticket), landing three-quarter on the shop front
    { a: t.in2003 - 20, b: t.in2003 + 16, pos: W([2.3, 2.6, 13.6]), target: W([6.9, 2.7, 4.2]), fov: 36, arc: 3.2 },
    // a slow dolly past the lamp post to the window (the counter and the terminal behind the glass) as the tag and photo come up
    { a: t.in2003 + 16, b: t.read - 4, pos: W([3.3, 1.85, 4.4]), target: W([7.2, 1.7, 1.9]), fov: 34 },
    // through the glass to the counter, looking down at the folded leaflet
    { a: t.read - 4, b: t.brochure + 12, pos: W([8.0, 1.86, 2.32]), target: W([8.8, 1.02, 2.22]), fov: 34 },
    // it unfolds: the camera rises over it
    { a: t.newG - 4, b: t.winfall + 10, pos: W([8.33, 1.86, 2.29]), target: W([8.82, 1.02, 2.27]), fov: 32 },
    // in to the roll-down panel as the rule is highlighted
    { a: t.he - 2, b: t.loopEnd + 6, pos: W([8.55, 1.6, BP[2] + 0.15]), target: W([8.86, 1.02, BP[2] + 0.15]), fov: 32 },
    // settle on the diagram, then push INTO the jackpot column (the cut to the rolldown lands on the matching close-up)
    { a: t.three - 8, b: t.threeEnd - 12, pos: W([d[0] - 0.2, d[1] + 0.36, d[2]]), target: W([d[0], d[1], d[2]]), fov: 32 },
    ...pushIn(t, d)
  ];
};
// a timer figure in the house counter dress, rolling m:ss up to 3:00 on "3 minutes"
const CHIP_BG = "rgba(4, 18, 38, 0.86)";
const Timer = ({ at, land, out, x, y }) => {
  const f = useCurrentFrame();
  const kIn = easeOut(f, at, at + 12), kOut = ease(f, out, out + 8);
  const vis = kIn * (1 - kOut);
  if (vis <= 0.001) return null;
  const s = Math.round(180 * easeOut(f, at + 1, land));
  const txt = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, ${(1 - kIn) * 22 - kOut * 14}px) scale(${0.94 + 0.06 * kIn})`, opacity: vis,
      background: CHIP_BG, borderRadius: 14, padding: "14px 30px 16px", boxShadow: "0 10px 40px rgba(0,8,20,0.5)", textAlign: "center", borderLeft: "5px solid #4D8ED9" }}>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: "#B3CEEF", textTransform: "uppercase", marginBottom: 4 }}>Time to spot it</div>
      <div style={{ fontFamily: FIGURE, fontSize: 112, lineHeight: 1, color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>{txt}<span style={{ fontSize: 46, color: "#4D8ED9", marginLeft: 10 }}>MIN</span></div>
    </div>
  );
};
const Year = ({ at, out, x, y }) => {
  const f = useCurrentFrame();
  const kIn = easeOut(f, at, at + 14), kOut = ease(f, out, out + 10);
  const vis = kIn * (1 - kOut);
  if (vis <= 0.001) return null;
  const yr = Math.round(1990 + 13 * easeOut(f, at + 1, at + 16));
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, ${(1 - kIn) * 22 - kOut * 14}px) scale(${0.94 + 0.06 * kIn})`, opacity: vis,
      background: CHIP_BG, borderRadius: 14, padding: "14px 30px 16px", boxShadow: "0 10px 40px rgba(0,8,20,0.5)", textAlign: "center", borderLeft: "5px solid #4D8ED9" }}>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: "#B3CEEF", textTransform: "uppercase", marginBottom: 4 }}>Evart, Michigan</div>
      <div style={{ fontFamily: FIGURE, fontSize: 112, lineHeight: 1, color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>{yr}</div>
    </div>
  );
};
const Overlay = ({ f, P }) => {
  const t = T();
  const sign = P([FX - 0.05, 2.1, 3.3]);
  const bro = P(coverPt());
  const rule = P(rulePt());
  return (
    <>
      {/* the vignette is global (Main.tsx) */}
      <Year at={t.y2003 - 6} out={t.store - 4} x={540} y={300} />
      <Tag text="His old store" at={t.store - 2} out={t.read - 6} x={110} y={960} to={sign.behind ? null : sign} />
      <Inset src={staticFile("photos/selbees_2shot.jpg")} credit="Photo: CBS News / 60 Minutes" at={t.jerry - 3} out={t.read + 6} x={80} y={300} w={920} h={518} pos="50% 35%" />
      <Tag text="Jerry & Marge Selbee" at={t.jerry + 4} out={t.read + 4} x={80} y={836} />
      <Tag text="The brochure" at={t.brochure - 2} out={t.newG + 2} x={600} y={420} to={bro.behind ? null : bro} />
      <Tag text="New Michigan game" at={t.michigan - 6} out={t.he - 4} x={110} y={360} />
      <Tag text="The loophole" at={t.loophole} out={t.three - 2} x={120} y={420} to={rule.behind ? null : rule} />
      <Timer at={t.three - 12} land={t.three + 2} out={t.threeEnd - 10} x={540} y={330} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("whooshlong", t.in2003 - 2, 36, 0.55),                 // the flight down main street (fastest at its middle)
    cueAt("pingshort", t.y2003 - 2, 12, 0.35),
    cueAt("whooshsoft", (t.read - 4 + t.brochure + 12) / 2, 26, 0.5), // through the window
    cueAt("ee_whoosh_fast_small_whoosh_01", t.newG + 8, 14, 0.35),  // the left flap swings open
    cueAt("ee_whoosh_fast_small_whoosh_01", t.winfall - 4, 14, 0.3), // the right flap
    cueAt("ee_click_click_01", t.loophole - 3, 6, 0.4),          // the highlighter's cap
    cueAt("pingshort", t.loophole + 6, 12, 0.35),
    cueAt("ee_clock_clock_ticking_01", t.three - 10, 26, 0.45),
    cueAt("airwoosh", t.threeEnd - 4, 20, 0.5)                    // the push into the diagram
  ];
};
export const ST = { id: "store", origin: O, from: 200, to: T().when + 2, light: { target: [7.5, 0, 2.4], shadowBox: 11, keyI: 1.9, fillI: 0.42 }, shots, Scene, Overlay, sfx };
