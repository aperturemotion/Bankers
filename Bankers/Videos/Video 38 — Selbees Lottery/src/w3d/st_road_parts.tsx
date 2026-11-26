// @ts-nocheck
// ★ V38 shared parts for the ROAD and GLOBE stations (builder C): the Massachusetts ticket, its bundles, the plastic ticket TUB
//   (CBS: the Selbees kept their tickets in tubs), a word finder and the camera-drift compensator used by the push-through hand-over
//   road → globe (the camera pushes into one ticket in the trunk and the cut lands on the identical ticket on the MIT group's stack).
//   Rev 2 (builder D): the TUB is now a real plastic storage tote (road_tote.tsx: ribs, ledge, handholds, rim lip, snap lid with
//   latches, frosted walls showing the slips, a written label card); the bundles and the hero slip's position are unchanged.
import React, { useMemo, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { WORDS } from "./take";
import { BODY } from "./fonts3d";
import { toteGeometry, toteMats } from "./road_tote";

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
// tub (outside) dims: length along x, height, depth along z (the tote in road_tote.tsx; its lid top = the stacking pitch 0.30)
export const TUB = { x: 0.42, y: 0.28, z: 0.44, wall: 0.014 };
// where the hero slip's face centre sits, relative to an open tub's base centre, and the direction it faces
export const HERO_LOCAL = [-0.12 - 0.0141, 0.3 + 0.0141, 0];
export const HERO_N = [-Math.SQRT1_2, Math.SQRT1_2, 0];
/** the camera key that frames the hero slip edge to edge, at distance d along its normal (before drift compensation) */
export const heroCam = (tubBase, d = 0.19) => {
  const c = [tubBase[0] + HERO_LOCAL[0], tubBase[1] + HERO_LOCAL[1], tubBase[2] + HERO_LOCAL[2]];
  return { pos: [c[0] + HERO_N[0] * d, c[1] + HERO_N[1] * d, c[2] + HERO_N[2] * d], target: c };
};
const setFade = (m, op) => { const tr = op < 0.999; if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; } m.opacity = op; m.depthWrite = true; m.visible = op > 0.004; };
/** a plastic ticket tote (rev 2: road_tote.tsx): base at the origin; open shows the bundles; closed wears its snap lid.
 *  glow: the accent light of the x-ray; fade: 0–1 (dissolves with the car's cabin); num: the number written on its label card */
export const Tub = ({ position = [0, 0, 0], rotY = 0, open = false, hero = false, glow = 0, seed = 0, fade = 1, num }) => {
  const g = toteGeometry();
  const m = useMemo(() => toteMats(seed, num), [seed, num]);
  m.wall.emissiveIntensity = glow * 1.15; m.lid.emissiveIntensity = glow * 1.15;
  for (const k of Object.keys(m)) setFade(m[k], fade);
  const lean = Math.atan2(0.02, 0.262);
  return (
    <group position={position} rotation-y={rotY}>
      <mesh geometry={g.wall} material={m.wall} castShadow receiveShadow />
      {!open && <mesh geometry={g.lid} material={m.lid} castShadow receiveShadow />}
      {!open && <mesh geometry={g.clips} material={m.clips} castShadow />}
      {/* the label card, taped flat to the end wall (which leans out as the tote widens upward) */}
      <group position={[-0.2052, 0.11, 0]} rotation-z={lean}>
        <mesh rotation-y={-Math.PI / 2} material={m.card}><planeGeometry args={[0.165, 0.093]} /></mesh>
      </group>
      {open && <mesh position={[0, 0.14, 0]}><boxGeometry args={[TUB.x - 0.06, 0.22, TUB.z - 0.06]} /><meshStandardMaterial color="#DCE4EE" roughness={0.8} emissive="#7FB4F2" emissiveIntensity={glow * 0.2} /></mesh>}
      {open && [-0.12, 0, 0.12].flatMap((bx, r) => [-0.13, 0, 0.13].map((bz, k) => (
        <Bundle key={r + "_" + k} pos={r === 0 && k === 1 ? [bx, 0.3, bz] : [bx + (rnd(seed + r * 3 + k) - 0.5) * 0.01, 0.3 - rnd(seed + r * 7 + k) * 0.03, bz]} hero={hero && r === 0 && k === 1} glow={glow} />
      )))}
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
