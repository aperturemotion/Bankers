// @ts-nocheck
// ★ V39 builder D — THE BEQUEST AS REAL MONEY (stations will / pavilion): pallets of strapped $1 bundles (money.tsx's real note,
//   edge paper and ABA $100 straps), each pallet $600,000 — 57 layers of 7 × 15 bundles (105 × $100 a layer = $10,500; 57 layers
//   ≈ $600,000), 0.64 m of notes on a 1.2 × 1.0 m wooden pallet — so the hospital's $4.8 million is EIGHT pallets, the library's
//   $1.2 million TWO, and the library's yearly budget (~$600,000, FACTCHECK) ONE block the size of one pallet.
//   · Pallets: the wooden pallets (stringers, deck boards) are merged once; each stack is a box whose sides show the cut paper of
//     the bundles (long sides with their blue straps, short ends), its top the REAL top layer of bundles (one instanced pair for all
//     pallets), its 12 edges glowing light blue. fill (0..1) grows a stack from the deck.
//   · Stream: bundles arcing from a source point onto the pallet tops (one instanced pair, real size × 1.4 shrinking to × 1 as they land).
//   · Ghost: the budget block — clear glass of one pallet's size with glowing edges and YEARLY BUDGET printed on its face; k draws it in.
import React, { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { canvasTex, rnd, clamp01, lerp } from "./kit";
import { billFaceMat, billEdgeTex, strapTex } from "./money";
import { BODY } from "./fonts3d";

export const PAL = { w: 1.2, d: 1.0, h: 0.144 };
export const STACK = { w: 1.092, d: 0.99, h: 0.644, nx: 7, nz: 15, layer: 0.0113 };
export const PALLET_TOP = PAL.h + STACK.h;
// ── the sides of a stack: rows of bundles seen edge-on (16 rows per texture tile) ────────────────────────────────────────────────
const sideTex = (long) => canvasTex(long ? "d_stack_long" : "d_stack_short", 1024, 512, (c, w, h) => {
  const rows = 16, n = long ? STACK.nx : STACK.nz, cw = w / n, rh = h / rows;
  c.fillStyle = "#1C241F"; c.fillRect(0, 0, w, h);
  for (let r = 0; r < rows; r++) for (let k = 0; k < n; k++) {
    const x = k * cw + (rnd(r * 31 + k) - 0.5) * 3, y = r * rh, i = r * 97 + k * 13 + (long ? 0 : 500);
    c.fillStyle = `hsl(${88 + rnd(i) * 30},${14 + rnd(i + 1) * 10}%,${62 + rnd(i + 2) * 9}%)`; c.fillRect(x + 1.5, y + 1.2, cw - 3, rh - 2.4);
    for (let q = 0; q < 7; q++) { c.fillStyle = `rgba(60,78,66,${0.12 + rnd(i + q) * 0.15})`; c.fillRect(x + 1.5, y + 2 + q * (rh - 4) / 7, cw - 3, 0.8); }   // the sheets
    c.fillStyle = "rgba(255,255,255,0.18)"; c.fillRect(x + 1.5, y + 1.2, cw - 3, 1.2);
    if (long) {   // the ABA strap round the bundle's middle, a hint of its print
      const sw = cw * 0.22, sx = x + cw / 2 - sw / 2;
      c.fillStyle = "#2F66B4"; c.fillRect(sx, y + 0.6, sw, rh - 1.2);
      c.fillStyle = "rgba(255,255,255,0.55)"; c.fillRect(sx + 2, y + rh / 2 - 1, sw - 4, 2);
    }
  }
});
let SM = null;
const stackMats = () => {
  if (SM) return SM;
  const mk = (t) => new THREE.MeshStandardMaterial({ map: t, color: "#DCE6D6", roughness: 0.84, envMapIntensity: 0.4 });
  SM = { long: sideTex(true), short: sideTex(false), top: new THREE.MeshStandardMaterial({ color: "#5E6B5C", roughness: 0.9 }), mk };
  return SM;
};
// one pallet's stack materials (own texture clones: the repeat follows its height)
const usePalletMats = () => useMemo(() => {
  const S = stackMats();
  const L = S.long.clone(), Sh = S.short.clone();
  for (const t of [L, Sh]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; }
  const ml = S.mk(L), ms = S.mk(Sh);
  return { mats: [ms, ms, S.top, S.top, ml, ml], L, Sh };
}, []);
// the wooden pallet: 3 stringers, 7 top deck boards, 3 bottom boards (merged once)
let PG = null;
const palletGeo = () => {
  if (PG) return PG;
  const parts = [];
  const b = (w, h, d, x, y, z) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); parts.push(g.toNonIndexed()); };
  for (const z of [-0.45, 0, 0.45]) b(PAL.w, 0.022, 0.1, 0, 0.011, z);                       // bottom boards
  for (const x of [-0.56, 0, 0.56]) b(0.08, 0.1, PAL.d, x, 0.072, 0);                           // stringers
  for (let k = 0; k < 7; k++) b(PAL.w, 0.022, 0.12, 0, 0.133, -0.45 + k * 0.15);                // deck boards
  PG = mergeGeometries(parts);
  return PG;
};
const woodTex = () => canvasTex("d_wood", 256, 256, (c, w, h) => {
  c.fillStyle = "#9C8466"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "60,40,20" : "255,240,210"},${0.05 + rnd(i + 1) * 0.08})`; c.fillRect(0, rnd(i + 2) * h, w, 1 + rnd(i + 3) * 2); }
});
const EDGE_MAT = new THREE.MeshBasicMaterial({ color: "#B3D4FA", toneMapped: false, transparent: true });
const edgeBoxes = (w, h, d) => {
  const t = 0.02, out = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) out.push({ p: [sx * w / 2, h / 2, sz * d / 2], s: [t, h, t] });
  for (const y of [0, h]) { for (const sz of [-1, 1]) out.push({ p: [0, y, sz * d / 2], s: [w, t, t] }); for (const sx of [-1, 1]) out.push({ p: [sx * w / 2, y, 0], s: [t, t, d] }); }
  return out;
};
const Edges = ({ w, h, d, y0 = 0, glow = 1, mat = EDGE_MAT }) => (
  <group position={[0, y0, 0]}>
    {edgeBoxes(w, h, d).map((e, i) => <mesh key={i} position={e.p} scale={e.s} material={mat}><boxGeometry args={[1, 1, 1]} /></mesh>)}
  </group>
);
/** one pallet at `position` (its deck's foot on the ground); fill 0..1 */
export const Pallet = ({ position, fill = 1, edge = 1, ry = 0 }) => {
  const geo = useMemo(palletGeo, []);
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ map: woodTex(), color: "#C9B79C", roughness: 0.85 }), []);
  const pm = usePalletMats();
  const h = STACK.h * fill;
  const rowsShown = h / STACK.layer / 16;
  pm.L.repeat.set(1, Math.max(0.001, rowsShown)); pm.Sh.repeat.set(1, Math.max(0.001, rowsShown));
  EDGE_MAT.opacity = 0.9;
  return (
    <group position={position} rotation-y={ry}>
      <mesh geometry={geo} material={wood} castShadow receiveShadow />
      {h > 0.004 && <mesh position={[0, PAL.h + h / 2, 0]} scale={[STACK.w, h, STACK.d]} material={pm.mats} castShadow receiveShadow><boxGeometry args={[1, 1, 1]} /></mesh>}
      {h > 0.004 && edge > 0.01 && <Edges w={STACK.w + 0.012} h={h + 0.012} d={STACK.d + 0.012} y0={PAL.h - 0.006} />}
    </group>
  );
};
// ── the real top layer of every pallet: 7 × 15 bundles riding on its stack (one instanced pair) ────────────────────────────────
const BG = new THREE.BoxGeometry(0.156, STACK.layer, 0.066), SG = new THREE.BoxGeometry(0.034, STACK.layer + 0.0012, 0.0672);
let TM = null;
const topMats = () => {
  if (TM) return TM;
  const edge = new THREE.MeshStandardMaterial({ map: billEdgeTex(), color: "#E8EEE6", roughness: 0.84, envMapIntensity: 0.4 });
  const face = billFaceMat({ color: "#D4E0CC" });
  const strap = new THREE.MeshStandardMaterial({ map: strapTex(), color: "#FFFFFF", roughness: 0.62 });
  TM = { bundle: [edge, edge, face, face, edge, edge], strap };
  return TM;
};
const _M = new THREE.Matrix4(), _Q = new THREE.Quaternion(), _E = new THREE.Euler(), _V = new THREE.Vector3(), _S = new THREE.Vector3();
/** list: [{ p: pallet position, fill, ry }] */
export const TopLayers = ({ list }) => {
  const n = list.length * STACK.nx * STACK.nz;
  const mats = useMemo(topMats, []);
  const [mb, ms] = useMemo(() => { const a = new THREE.InstancedMesh(BG, mats.bundle, n), b = new THREE.InstancedMesh(SG, mats.strap, n); for (const m of [a, b]) { m.castShadow = false; m.receiveShadow = true; m.frustumCulled = false; } return [a, b]; }, [n]);
  let i = 0;
  for (const q of list) {
    const h = STACK.h * q.fill, show = h > 0.004;
    for (let a = 0; a < STACK.nx; a++) for (let b = 0; b < STACK.nz; b++, i++) {
      const x = -STACK.w / 2 + (a + 0.5) * STACK.w / STACK.nx, z = -STACK.d / 2 + (b + 0.5) * STACK.d / STACK.nz;
      const jit = (rnd(i * 3.1) - 0.5) * 0.004, rj = (rnd(i * 1.7) - 0.5) * 0.03;
      const c = Math.cos(q.ry ?? 0), s = Math.sin(q.ry ?? 0);
      _V.set(q.p[0] + c * x + s * z + jit, q.p[1] + PAL.h + Math.max(STACK.layer / 2, h - STACK.layer / 2) + 0.0006, q.p[2] - s * x + c * z);
      _Q.setFromEuler(_E.set(0, (q.ry ?? 0) + rj, 0)); const k = show ? 1 : 1e-4; _S.set(k, k, k);
      _M.compose(_V, _Q, _S); mb.setMatrixAt(i, _M); ms.setMatrixAt(i, _M);
    }
  }
  mb.instanceMatrix.needsUpdate = true; ms.instanceMatrix.needsUpdate = true;
  return (<><primitive object={mb} /><primitive object={ms} /></>);
};
// ── the stream: bundles in flight (copied from V38's Cash: one instanced pair, positions every frame) ──────────────────────────
const BGs = new THREE.BoxGeometry(1.56, 0.13, 0.66), SGs = new THREE.BoxGeometry(0.34, 0.142, 0.672);
let FM = null;
const flyMats = () => {
  if (FM) return FM;
  const em = { emissive: new THREE.Color("#7FB4F2"), emissiveIntensity: 0.45 };
  const edge = new THREE.MeshStandardMaterial({ map: billEdgeTex(), color: "#E8EEE6", roughness: 0.84, envMapIntensity: 0.4, ...em, emissiveMap: billEdgeTex() });
  const face = billFaceMat({ color: "#E9EEE6", emissive: "#4D8ED9" }); face.emissiveIntensity = 0.4;
  const strap = new THREE.MeshStandardMaterial({ map: strapTex(), color: "#FFFFFF", roughness: 0.62 });
  FM = { bundle: [edge, edge, face, face, edge, edge], strap };
  return FM;
};
/** items: [{ p, r, s }] (s = scale; 0 hides) */
export const Flyers = ({ items }) => {
  const n = items.length;
  const mats = useMemo(flyMats, []);
  const [mb, ms] = useMemo(() => { const a = new THREE.InstancedMesh(BGs, mats.bundle, n), b = new THREE.InstancedMesh(SGs, mats.strap, n); for (const m of [a, b]) { m.castShadow = true; m.frustumCulled = false; } return [a, b]; }, [n]);
  for (let i = 0; i < n; i++) {
    const it = items[i], s = Math.max(1e-4, it.s);
    _Q.setFromEuler(_E.set(it.r[0], it.r[1], it.r[2])); _V.set(it.p[0], it.p[1], it.p[2]); _S.set(s, s, s);
    _M.compose(_V, _Q, _S); mb.setMatrixAt(i, _M); ms.setMatrixAt(i, _M);
  }
  mb.instanceMatrix.needsUpdate = true; ms.instanceMatrix.needsUpdate = true;
  return (<><primitive object={mb} /><primitive object={ms} /></>);
};
/** a stream of N bundles from `src` to the pallets in `dst` (list of pallet positions), launched evenly over [a0, a1], each flying `dur` f,
 *  landing on the pallet's CURRENT top (topAt(j, frame)) — returns Flyers items */
export const streamItems = (f, { N, a0, a1, dur = 26, src, dst, topAt, seed = 0, spread = 1.2 }) => Array.from({ length: N }, (_, i) => {
  const a = a0 + (i / Math.max(1, N - 1)) * (a1 - a0) + (rnd(i * 5 + seed) - 0.5) * 2;
  const u = (f - a) / dur;
  if (u <= 0 || u >= 1) return { p: [0, -50, 0], r: [0, 0, 0], s: 0 };
  const e = u * u * (3 - 2 * u);
  const j = Math.floor(rnd(i * 7 + seed + 1) * dst.length) % dst.length, d = dst[j];
  const sx = src[0] + (rnd(i + 11 + seed) - 0.5) * spread * 2, sy = src[1] + (rnd(i + 12 + seed) - 0.5) * spread, sz = src[2] + (rnd(i + 13 + seed) - 0.5) * spread * 2;
  const ex = d[0] + (rnd(i + 14 + seed) - 0.5) * 0.7, ez = d[2] + (rnd(i + 15 + seed) - 0.5) * 0.6, ey = topAt(j, a + dur) + 0.04;
  const x = lerp(sx, ex, e), z = lerp(sz, ez, e), y = lerp(sy, ey, e) + Math.sin(Math.PI * e) * (1.6 + rnd(i + 16 + seed) * 1.0);
  const spin = (1 - e) * (2 + rnd(i + 17 + seed) * 3);
  const s = (0.1 + 0.24 * (1 - e * e * e)) * clamp01(u / 0.12) * (u > 0.94 ? (1 - u) / 0.06 : 1);   // big in the air, real size as it lands
  return { p: [x, y, z], r: [spin * 0.5 * (rnd(i + 18) - 0.5), spin + (rnd(i + 20) * 0.4), spin * 0.3 * (rnd(i + 19) - 0.5)], s };
});
// ── the budget block ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const ghostLabel = () => canvasTex("d_ghost_label", 512, 256, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  c.fillStyle = "#EAF3FF"; c.textAlign = "center"; c.textBaseline = "middle";
  c.font = `800 64px ${BODY}`; if ("letterSpacing" in c) c.letterSpacing = "4px"; c.fillText("YEARLY", w / 2, 92); c.fillText("BUDGET", w / 2, 168);
});
const GHOST_EDGE = new THREE.MeshBasicMaterial({ color: "#DCEBFF", toneMapped: false, transparent: true });
export const Ghost = ({ position, k = 1, ry = 0 }) => {
  const lab = useMemo(ghostLabel, []);
  if (k <= 0.002) return null;
  const H = PALLET_TOP;
  const eK = clamp01(k / 0.6), gK = clamp01((k - 0.3) / 0.7);
  GHOST_EDGE.opacity = eK;
  return (
    <group position={position} rotation-y={ry}>
      {/* the edges draw up from the ground first, then the glass and the label fade in */}
      <group scale={[1, eK, 1]}><Edges w={PAL.w} h={H} d={PAL.d} mat={GHOST_EDGE} /></group>
      <mesh position={[0, H / 2, 0]} renderOrder={3}><boxGeometry args={[PAL.w, H, PAL.d]} /><meshStandardMaterial color="#7FB4F2" transparent opacity={0.16 * gK} roughness={0.1} metalness={0.1} emissive="#4D8ED9" emissiveIntensity={0.35 * gK} depthWrite={false} /></mesh>
      <mesh position={[0, PAL.h, 0]} rotation-x={-Math.PI / 2} renderOrder={3}><planeGeometry args={[PAL.w, PAL.d]} /><meshBasicMaterial color="#7FB4F2" transparent opacity={0.12 * gK} depthWrite={false} toneMapped={false} /></mesh>
      <mesh position={[0, H * 0.52, PAL.d / 2 + 0.003]} renderOrder={4}><planeGeometry args={[1.08, 0.54]} /><meshBasicMaterial map={lab} transparent opacity={gK} depthWrite={false} toneMapped={false} /></mesh>
    </group>
  );
};
