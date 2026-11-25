// @ts-nocheck
// ★ V38 shared parts for the ROAD and GLOBE stations (builder C): the Massachusetts ticket, its bundles, the plastic ticket TUB
//   (CBS: the Selbees kept their tickets in tubs), a word finder and the camera-drift compensator used by the push-through hand-over
//   road → globe (the camera pushes into one ticket in the trunk and the cut lands on the identical ticket on the MIT group's stack).
import React, { useMemo, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { WORDS } from "./take";
import { BODY } from "./fonts3d";

// ── the take: the first word equal to t at or after frame `after` (exact match, so "for" never finds "formed") ─────────────────
const nrm = (s) => s.toLowerCase().replace(/[^a-z0-9$']/g, "");
export const wAt = (t, after = 0) => { const q = nrm(t); for (const w of WORDS) if (w.at >= after && nrm(w.t) === q) return w; throw new Error("st_road: no word " + t + " after " + after); };
export const wa = (t, after = 0) => wAt(t, after).at;

// ── the kit camera's idle drift (kit.makeCam, drift 1): subtracted from a close-up key so that the LIVE camera sits exactly on it ─
export const drift = (f) => [0.06 * Math.sin(f / 97), 0.04 * Math.sin(f / 131 + 1), 0.05 * Math.sin(f / 113 + 2)];
export const undrift = (p, f) => { const d = drift(f); return [p[0] - d[0], p[1] - d[1], p[2] - d[2]]; };

// ── the ticket: a generic $2 lottery slip (no real game's artwork), the same in the trunk and on the MIT stack ─────────────────
export const TICKET_W = 0.068, TICKET_H = 0.12;
export const ticketTexMA = () => canvasTex("ticketMA", 512, 904, (c, w, h) => {
  c.fillStyle = "#F4F7FB"; c.fillRect(0, 0, w, h);
  // a faint security guilloche in the paper
  c.strokeStyle = "rgba(77,142,217,0.10)"; c.lineWidth = 1.2;
  for (let k = 0; k < 26; k++) { c.beginPath(); for (let x = 0; x <= w; x += 8) { const y = 180 + k * 26 + 7 * Math.sin(x / 23 + k); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
  c.fillStyle = "#0B3F7A"; c.fillRect(0, 0, w, 150);
  c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.font = `800 86px ${BODY}`; c.fillText("LOTTERY", w / 2, 106);
  c.fillStyle = "#4D8ED9"; c.fillRect(0, 150, w, 14);
  c.fillStyle = "#0B2547"; c.font = `600 34px ${BODY}`;
  ["A", "B", "C", "D", "E"].forEach((r, i) => {
    const y = 236 + i * 88;
    c.textAlign = "left"; c.fillText(r + ".", 36, y);
    for (let k = 0; k < 6; k++) { c.textAlign = "center"; c.fillText(String(1 + Math.floor(rnd(i * 6 + k + 41) * 46)).padStart(2, "0"), 120 + k * 66, y); }
  });
  c.fillStyle = "#0B2547"; c.font = `700 40px ${BODY}`; c.textAlign = "left"; c.fillText("$2.00", 36, 700);
  c.font = `500 26px ${BODY}`; c.textAlign = "right"; c.fillText("QUICK PICK", w - 36, 700);
  for (let k = 0; k < 64; k++) { const bw = 2 + Math.floor(rnd(k + 190) * 4); c.fillRect(48 + k * 6.6, 740, bw, 110); }
});
// the paper edge of a bundle (many slips, seen from the side)
const edgeTex = () => canvasTex("ticketEdge", 64, 256, (c, w, h) => {
  c.fillStyle = "#E9EEF5"; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 3) { c.fillStyle = `rgba(30,60,100,${0.06 + rnd(y) * 0.1})`; c.fillRect(0, y, w, 1); }
});

/** one bundle of slips standing in a tub: a paper block (thickness along local x, front face toward −x) with a rubber band */
const Bundle = ({ pos, hero = false, tint = 1, glow = 0 }) => {
  const front = useMemo(ticketTexMA, []);
  const edge = useMemo(edgeTex, []);
  return (
    <group position={pos} rotation-z={-Math.PI / 4}>
      <mesh castShadow={!hero} receiveShadow={!hero}>
        <boxGeometry args={[0.04, TICKET_H, TICKET_W]} />
        <meshStandardMaterial map={edge} color="#E8EEF6" roughness={0.7} emissive="#7FB4F2" emissiveIntensity={glow * 0.25} />
      </mesh>
      <mesh position={[-0.0201, 0, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[TICKET_W, TICKET_H]} />
        {hero
          ? <meshBasicMaterial map={front} color="#DDE7F3" toneMapped={false} />
          : <meshStandardMaterial map={front} roughness={0.55} color={tint < 1 ? "#C9D6E6" : "#FFFFFF"} emissive="#7FB4F2" emissiveIntensity={glow * 0.3} />}
      </mesh>
      {/* the rubber band round the middle */}
      <mesh position={[0, -0.047, 0]}><boxGeometry args={[0.0422, 0.005, TICKET_W + 0.0022]} /><meshStandardMaterial color="#3E6FAF" roughness={0.5} /></mesh>
    </group>
  );
};
const cardTex = () => canvasTex("tubCard", 128, 74, (c, w, h) => {
  c.fillStyle = "#EEF2F7"; c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(200,210,225,0.8)"; c.fillRect(0, 0, w, 10); c.fillRect(0, h - 10, w, 10);
  c.strokeStyle = "rgba(20,40,80,0.55)"; c.lineWidth = 3;
  [24, 40, 56].forEach((y, i) => { c.beginPath(); c.moveTo(14, y); for (let x = 14; x < 100 - i * 18; x += 6) c.lineTo(x, y + Math.sin(x * 0.7 + i) * 2); c.stroke(); });
});
// tub (outside) dims: length along x, height, depth along z
export const TUB = { x: 0.42, y: 0.28, z: 0.44, wall: 0.014 };
// where the hero slip's face centre sits, relative to an open tub's base centre, and the direction it faces
export const HERO_LOCAL = [-0.12 - 0.0141, 0.3 + 0.0141, 0];
export const HERO_N = [-Math.SQRT1_2, Math.SQRT1_2, 0];
/** the camera key that frames the hero slip edge to edge, at distance d along its normal (before drift compensation) */
export const heroCam = (tubBase, d = 0.19) => {
  const c = [tubBase[0] + HERO_LOCAL[0], tubBase[1] + HERO_LOCAL[1], tubBase[2] + HERO_LOCAL[2]];
  return { pos: [c[0] + HERO_N[0] * d, c[1] + HERO_N[1] * d, c[2] + HERO_N[2] * d], target: c };
};
const TUB_COLS = ["#5D84B9", "#4C72A6", "#6A8EC2", "#557BB0"];
const tubMat = (glow, seed = 0) => ({ color: TUB_COLS[seed % TUB_COLS.length], roughness: 0.34, metalness: 0.05, emissive: "#7FB4F2", emissiveIntensity: glow * 1.15 });
/** a plastic ticket tub: base at the origin; open shows the bundles; lid closes it */
export const Tub = ({ position = [0, 0, 0], rotY = 0, open = false, hero = false, glow = 0, seed = 0 }) => {
  const { x, y, z, wall } = TUB;
  const m = tubMat(glow, seed);
  return (
    <group position={position} rotation-y={rotY}>
      <mesh position={[0, wall / 2, 0]} castShadow receiveShadow><boxGeometry args={[x - 0.02, wall, z - 0.02]} /><meshStandardMaterial {...m} /></mesh>
      {[-1, 1].map((s) => <mesh key={"x" + s} position={[s * (x / 2 - wall / 2), y / 2, 0]} castShadow receiveShadow><boxGeometry args={[wall, y, z]} /><meshStandardMaterial {...m} /></mesh>)}
      {[-1, 1].map((s) => <mesh key={"z" + s} position={[0, y / 2, s * (z / 2 - wall / 2)]} castShadow receiveShadow><boxGeometry args={[x, y, wall]} /><meshStandardMaterial {...m} /></mesh>)}
      {/* the rolled rim lip and two moulded handles */}
      {[-1, 1].map((s) => <mesh key={"rx" + s} position={[s * (x / 2 - 0.002), y - 0.006, 0]} castShadow><boxGeometry args={[0.028, 0.016, z + 0.024]} /><meshStandardMaterial {...m} color="#6E93C6" /></mesh>)}
      {[-1, 1].map((s) => <mesh key={"rz" + s} position={[0, y - 0.006, s * (z / 2 - 0.002)]} castShadow><boxGeometry args={[x + 0.024, 0.016, 0.028]} /><meshStandardMaterial {...m} color="#6E93C6" /></mesh>)}
      {[-1, 1].map((s) => <mesh key={"h" + s} position={[s * (x / 2 + 0.006), y - 0.05, 0]}><boxGeometry args={[0.012, 0.03, 0.14]} /><meshStandardMaterial color="#2C4E7E" roughness={0.5} /></mesh>)}
      {/* a white index card taped to the end (no writing legible at this size) */}
      <mesh position={[-x / 2 - 0.0015, y * 0.55, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.13, 0.075]} /><meshStandardMaterial map={useMemo(cardTex, [])} roughness={0.7} /></mesh>
      {open && <mesh position={[0, 0.13, 0]}><boxGeometry args={[x - 0.03, 0.24, z - 0.03]} /><meshStandardMaterial color="#DCE4EE" roughness={0.8} emissive="#7FB4F2" emissiveIntensity={glow * 0.2} /></mesh>}
      {open
        ? [-0.12, 0, 0.12].flatMap((bx, r) => [-0.13, 0, 0.13].map((bz, k) => (
          <Bundle key={r + "_" + k} pos={r === 0 && k === 1 ? [bx, 0.3, bz] : [bx + (rnd(seed + r * 3 + k) - 0.5) * 0.01, 0.3 - rnd(seed + r * 7 + k) * 0.03, bz]} hero={hero && r === 0 && k === 1} glow={glow} />
        )))
        : <mesh position={[0, y + 0.008, 0]} castShadow receiveShadow><boxGeometry args={[x + 0.03, 0.022, z + 0.03]} /><meshStandardMaterial {...m} color="#7298CB" /></mesh>}
    </group>
  );
};

/** instanced copies of one mesh: items = [{p:[x,y,z], r?:[x,y,z], s?:[x,y,z]}] (matrices written once) */
export const Inst = ({ geo, mat, items, castShadow = false, receiveShadow = false }) => {
  const ref = useRef();
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    items.forEach((it, i) => {
      e.set(...(it.r ?? [0, 0, 0])); q.setFromEuler(e);
      m.compose(new THREE.Vector3(...it.p), q, new THREE.Vector3(...(it.s ?? [1, 1, 1])));
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [items]);
  return <instancedMesh ref={ref} args={[geo, mat, items.length]} castShadow={castShadow} receiveShadow={receiveShadow} frustumCulled={false} />;
};

/** a faint starfield on the upper sky (points, fixed pixel size, unfogged) */
export const Stars = ({ n = 420, r = 330, opacity = 0.7 }) => {
  const geo = useMemo(() => {
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = rnd(i * 3 + 1) * Math.PI * 2, el = 0.12 + Math.pow(rnd(i * 3 + 2), 0.7) * 1.35;
      a[i * 3] = r * Math.cos(el) * Math.cos(th); a[i * 3 + 1] = r * Math.sin(el); a[i * 3 + 2] = r * Math.cos(el) * Math.sin(th);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(a, 3)); return g;
  }, [n, r]);
  return <points geometry={geo}><pointsMaterial color="#DCE8FA" size={1.6} sizeAttenuation={false} transparent opacity={opacity} fog={false} depthWrite={false} /></points>;
};
