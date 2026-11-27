// @ts-nocheck
// ★ V39 builder A (detail pass) — THE STORE FRONT AND ITS LOT, outside at blue hour in a Vermont winter (station jcp, 472–594).
//   Timur: "fix the road, because right now it looks weird" — the ground in front of the store was a dark band with heavy white zebra
//   bars pointing at the doors and a mirror copy of the facade. Now: textured asphalt (a close sheet where the camera looks, the whole
//   lot beyond), painted 90° stalls head to head, ONE continental crosswalk from the curb ramp across the fire lane (bars running with
//   the traffic), FIRE LANE stencils and a yellow curb, a broom-finished sidewalk with tooled joints, curb ramp with its truncated-dome
//   panel, plowed snow banks along the edges, curbed end islands with bare maples, tall lot lamps on concrete bases with the light pooling
//   under them, and a wet sheen made of soft light streaks (no planar mirror, so no mirror copy of the sign).
//   Plus the storefront detail: brick pilasters with precast caps and a soldier course, a precast water table, the EIFS fascia with
//   reveals and a two-step cornice, channel letters with their returns, downspouts, window posters, canopy gutter and snow on every ledge.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Glow, rnd } from "./kit";
import * as T from "./a_tex";
import { posterCell } from "./a_fixtures";
import { conifers, maple } from "./a_trees";

export const LOTY = -0.15;
// ── the ground ──────────────────────────────────────────────────────────────────────────────────────────────────────────
export const LotGround = () => {
  const lot = useMemo(T.lotTex, []), near = useMemo(T.lotNearTex, []), rough = useMemo(T.lotRoughTex, []);
  const grain = useMemo(() => { const t = T.grainTex().clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(48 / 1.1, 60 / 1.1); t.needsUpdate = true; return t; }, []);
  const grainN = useMemo(() => { const t = T.grainTex().clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(20 / 1.1, 22 / 1.1); t.needsUpdate = true; return t; }, []);
  const snow = useMemo(() => { const t = T.snowTex().clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(120, 120); t.needsUpdate = true; return t; }, []);
  const pool = useMemo(T.poolTex2, []), streak = useMemo(T.streakTex, []);
  const L = T.LOT, N = T.LOT_NEAR;
  const add = { transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 };
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[(L.x0 + L.x1) / 2, LOTY, (L.z0 + L.z1) / 2]} receiveShadow>
        <planeGeometry args={[L.x1 - L.x0, L.z1 - L.z0]} />
        <meshStandardMaterial map={lot} color="#8E99AA" roughnessMap={rough} roughness={0.85} metalness={0} bumpMap={grain} bumpScale={0.6} envMapIntensity={0.55} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[(N.x0 + N.x1) / 2, LOTY + 0.003, (N.z0 + N.z1) / 2]} receiveShadow>
        <planeGeometry args={[N.x1 - N.x0, N.z1 - N.z0]} />
        <meshStandardMaterial map={near} color="#8E99AA" roughness={0.42} metalness={0} bumpMap={grainN} bumpScale={0.6} envMapIntensity={0.55} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
      </mesh>
      {/* the snow-covered land around the lot */}
      <mesh rotation-x={-Math.PI / 2} position={[0, LOTY - 0.03, 0]} receiveShadow><planeGeometry args={[600, 600]} /><meshStandardMaterial map={snow} color="#9DB0C8" roughness={0.9} /></mesh>
      {/* the light lying on the wet lot: warm pools under the lamps and the canopy, soft streaks of the lit windows and doors */}
      {LAMPS.map(([x, z], i) => <mesh key={i} rotation-x={-Math.PI / 2} position={[x, LOTY + 0.01, z]} renderOrder={2}><planeGeometry args={[15, 15]} /><meshBasicMaterial map={pool} color="#7A5630" {...add} /></mesh>)}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 2.4]} renderOrder={2}><planeGeometry args={[12, 7]} /><meshBasicMaterial map={pool} color="#8A6238" {...add} /></mesh>
      {[[-0.9, 1.4, 0.5], [0.9, 1.4, 0.5], [-2.5, 1.2, 0.35], [2.5, 1.2, 0.35], [-7.5, 3.4, 0.45], [-12.5, 3.4, 0.45], [7.5, 3.4, 0.45], [12.5, 3.4, 0.45]].map(([x, w, o], i) => (
        <mesh key={"s" + i} rotation-x={-Math.PI / 2} position={[x, LOTY + 0.012, 4.45 + 3.6]} renderOrder={2}><planeGeometry args={[w, 7.2]} /><meshBasicMaterial map={streak} color="#FFC48A" opacity={Math.min(1, o * 1.8)} {...add} /></mesh>
      ))}
    </group>
  );
};

// ── the lot lamps: square tapered steel poles on round concrete bases, twin shoebox heads, snow on the heads and bases ─────
export const LAMPS = [[-12.4, 16.1], [6.0, 16.1], [-12.4, 34.4], [9.65, 34.4], [-12.4, 52.7], [13.8, 52.7]];
export const LotLamps = ({ lights }) => (
  <group>
    {LAMPS.map(([x, z], i) => (
      <group key={i} position={[x, LOTY, z]}>
        <mesh position={[0, 0.42, 0]} castShadow><cylinderGeometry args={[0.34, 0.4, 0.84, 16]} /><meshStandardMaterial color="#8A929E" roughness={0.85} /></mesh>
        <mesh position={[0, 0.86, 0]}><cylinderGeometry args={[0.33, 0.33, 0.05, 16]} /><meshStandardMaterial color="#E6EDF6" roughness={0.8} /></mesh>
        <mesh position={[0, 0.9, 0]}><boxGeometry args={[0.3, 0.06, 0.3]} /><meshStandardMaterial color="#2A3240" metalness={0.6} roughness={0.45} /></mesh>
        {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b], k) => <mesh key={k} position={[a * 0.12, 0.95, b * 0.12]}><cylinderGeometry args={[0.018, 0.018, 0.05, 6]} /><meshStandardMaterial color="#6A7380" metalness={0.7} roughness={0.4} /></mesh>)}
        <mesh position={[0, 5.0, 0]} castShadow><cylinderGeometry args={[0.075, 0.11, 8.2, 4]} /><meshStandardMaterial color="#2A3240" metalness={0.6} roughness={0.42} /></mesh>
        <mesh position={[0, 9.12, 0]}><boxGeometry args={[0.16, 0.05, 0.16]} /><meshStandardMaterial color="#1E2630" metalness={0.5} roughness={0.4} /></mesh>
        {[-1, 1].map((s) => <group key={s} position={[s * 0.8, 9.05, 0]}>
          <mesh position={[-s * 0.38, 0.02, 0]}><boxGeometry args={[0.74, 0.07, 0.07]} /><meshStandardMaterial color="#2A3240" metalness={0.6} roughness={0.4} /></mesh>
          <mesh><boxGeometry args={[0.84, 0.2, 0.5]} /><meshStandardMaterial color="#1E2630" metalness={0.5} roughness={0.4} /></mesh>
          <mesh position={[0, 0.12, 0]}><boxGeometry args={[0.8, 0.05, 0.46]} /><meshStandardMaterial color="#E6EDF6" roughness={0.8} /></mesh>
          <mesh position={[0, -0.105, 0]} rotation-x={Math.PI / 2}><planeGeometry args={[0.72, 0.4]} /><meshStandardMaterial color="#FFE9C8" emissive="#FFC98A" emissiveIntensity={3} side={THREE.DoubleSide} /></mesh>
          <Glow position={[0, -0.3, 0]} size={3.0} color="#FFC98A" opacity={0.7} />
        </group>)}
        {lights && i < 2 && <pointLight position={[0, 8.6, 0]} intensity={70} distance={26} decay={1.7} color="#FFC98A" />}
      </group>
    ))}
  </group>
);

// a lumpy snow pile (plowed bank) along a line, merged: overlapping flattened icosahedra, greyer at the base
const snowBank = (m, x0, z0, x1, z1, h, seed) => {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(3, Math.round(L / 1.1));
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, hh = h * (0.7 + rnd(seed + i) * 0.6) * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, Math.max(0, t * 1.15 - 0.07))));
    m.ico("snow", [x + (rnd(seed + i * 3) - 0.5) * 0.6, LOTY + hh * 0.35, z + (rnd(seed + i * 5) - 0.5) * 0.6], [1.0 + rnd(seed + i * 7) * 0.7, hh, 1.0 + rnd(seed + i * 9) * 0.7], rnd(seed + i * 11) < 0.35 ? "#B9C4D2" : "#E4EBF3", { r: [0, rnd(seed + i) * 3, 0] });
    m.ico("snow", [x + (rnd(seed + i * 13) - 0.5) * 0.8, LOTY + 0.1, z + (rnd(seed + i * 15) - 0.5) * 0.8], [1.3, 0.3, 1.3], "#8F9AA8");   // the dirty, plowed foot
  }
};
/** the lot's built pieces (Mesher, store materials): islands, banks, sidewalk joints, curb paint, ramp, snow on the ledges, storefront detail */
export const buildFront = (m) => {
  // ── the sidewalk: tooled joints both ways (a 1.5 m grid), the curb painted yellow (fire lane), the ramp at the crosswalk ──
  for (let x = -23.25; x <= 23.3; x += 1.5) if (Math.abs(x) > 1.6) m.box("dark", [x, 0.001, 2.3], [0.012, 0.002, 4.2], "#59626F");
  for (const z of [1.4, 2.9]) m.box("dark", [0, 0.001, z], [48, 0.002, 0.012], "#59626F");
  for (const s of [-1, 1]) {
    const xa = s * 1.6, xb = s * 24, xc = (xa + xb) / 2, ww = Math.abs(xb - xa);
    m.box("lam", [xc, -0.07, 4.45], [ww, 0.16, 0.16], "#C9A93E");                         // the curb, painted fire-lane yellow
    m.box("lam", [xc, 0.012, 4.45], [ww, 0.006, 0.17], "#B79A3A");
  }
  // the curb ramp: a sloped concrete apron down to the lane, flared cheeks, the truncated-dome panel at its foot
  m.box("concrete", [0, -0.09, 4.075], [3.2, 0.03, 0.77], "#FFFFFF", { r: [0.197, 0, 0], metric: true });
  for (const s of [-1, 1]) m.box("concrete", [s * 1.6, -0.075, 4.075], [0.02, 0.15, 0.75], "#FFFFFF", { metric: true });   // the cut faces of the sidewalk
  m.box("dome", [0, -0.098, 4.2], [1.5, 0.012, 0.5], "#FFFFFF", { r: [0.197, 0, 0] });
  // slush and snow crust at the base of the building and along the curb
  for (let i = 0; i < 40; i++) { const x = -23 + i * 1.18 + rnd(i) * 0.4; if (Math.abs(x) < 3.6) continue; m.ico("snow", [x, 0.02, 0.32 + rnd(i + 1) * 0.1], [0.5 + rnd(i + 2) * 0.4, 0.08 + rnd(i + 3) * 0.06, 0.18], "#DDE5EF"); }
  // ── plowed snow banks along the lot's sides and far end; curbed end islands with a bare maple on each double row ──
  snowBank(m, -25.2, 8, -25.4, 62, 1.5, 11); snowBank(m, 25.2, 8, 25.4, 62, 1.5, 21); snowBank(m, -22, 63.5, 22, 63.8, 1.7, 31);
  snowBank(m, -23.6, 5.4, -21.5, 6.2, 0.9, 41); snowBank(m, 23.6, 5.4, 21.5, 6.2, 0.9, 51);
  for (const zr of T.LOT_ROWS) for (const s of [-1, 1]) {
    const xc = s * 22.2, zc = zr;
    m.box("trim", [xc, LOTY + 0.08, zc], [2.6, 0.16, 10.6], "#A9B1BC");
    m.box("snow", [xc, LOTY + 0.2, zc], [2.3, 0.14, 10.3], "#E4EBF3");
    snowBank(m, xc, zc - 4.4, xc, zc + 4.4, 0.6, 61 + zr + s);
    maple(m, [xc, LOTY + 0.25, zc + (s > 0 ? 1.5 : -1.5)], 7 + rnd(zr + s) * 2, Math.round(zr * 3 + s + 5));
  }
  // ── the storefront detail (the camera's frame at jcp is the centre ~16 m of it) ──
  // brick pilasters with precast caps every bay; a precast water table along the base; a soldier course over the display windows
  for (const x of [-18.2, -15.95, -4.75, -3.55, 3.55, 4.75, 15.95, 18.2]) { m.box("brick2", [x, 2.2, 0.2], [0.4, 4.4, 0.12], "#FFFFFF", { metric: true }); m.box("trim", [x, 4.36, 0.24], [0.5, 0.1, 0.2], "#B5B0A6"); m.box("trim", [x, 0.25, 0.27], [0.5, 0.5, 0.16], "#8C8A86"); m.box("snow", [x, 0.515, 0.27], [0.48, 0.03, 0.15], "#EEF3F9"); }
  for (const s of [-1, 1]) {
    const xc = s * 10.3, ww = 10.6;
    m.box("trim", [xc, 3.55, 0.17], [ww + 0.2, 0.22, 0.05], "#A39684");                      // the soldier course (a precast band in brick tone)
    for (let k = 0; k < 52; k++) m.box("dark", [xc - ww / 2 + 0.1 + k * 0.205, 3.55, 0.196], [0.012, 0.2, 0.004], "#6E6458");   // its vertical joints
    m.box("trim", [xc, 0.58, 0.22], [ww + 0.2, 0.05, 0.16], "#C8C2B7");                       // the exterior sill
    m.box("snow", [xc, 0.62, 0.24], [ww, 0.03, 0.12], "#EEF3F9");                              // snow on it
    // posters in the display windows (standing on easels behind the glass)
    for (const [dx, cell] of [[s * 3.9, s < 0 ? 1 : 0], [s * -3.6, s < 0 ? 3 : 2]]) {
      m.box("dark", [xc + dx, 1.8, -1.85], [0.92, 1.36, 0.03], "#1A1E24");
      m.quad("print", [xc + dx, 1.8, -1.83], 0.86, 1.3, "#FFFFFF", posterCell(cell));
      m.box("dark", [xc + dx, 0.85, -1.8], [0.04, 0.6, 0.04], "#2A2E33");
    }
  }
  for (const s of [-1, 1]) m.box("trim", [s * 10.95, 0.25, 0.2], [15.3, 0.5, 0.1], "#8C8A86");   // the precast water table (not across the doors)
  // the fascia: EIFS reveals, a two-step cornice, the raceway the letters stand on, snow on the coping and the cornice
  for (const y of [4.95, 6.35]) for (const s of [-1, 1]) m.box("dark", [s * 11.4, y, 0.192], [14.0, 0.025, 0.01], "#5C5650");   // reveals, clear of the letters
  m.box("stucco", [0, 6.78, 0.28], [36.8, 0.16, 0.2], "#FFFFFF", { metric: true });
  m.box("stucco", [0, 6.62, 0.24], [36.7, 0.1, 0.12], "#FFFFFF", { metric: true });
  m.box("snow", [0, 6.89, 0.3], [36.6, 0.05, 0.14], "#EEF3F9");
  m.box("snow", [0, 7.22, 0.05], [36.8, 0.07, 0.48], "#EEF3F9");
  // downspouts on the outer pilasters (collector head, straps, the boot into the sidewalk)
  for (const x of [-17.9, 17.9]) { m.box("metal", [x, 6.95, 0.36], [0.3, 0.22, 0.2], "#4A4E55"); m.box("metal", [x, 3.5, 0.34], [0.12, 6.9, 0.09], "#4A4E55"); for (let k = 0; k < 5; k++) m.box("metal", [x, 0.8 + k * 1.3, 0.34], [0.15, 0.03, 0.11], "#33373D"); m.box("metal", [x, 0.12, 0.45], [0.12, 0.09, 0.3], "#4A4E55"); }
  // the canopy: a gutter along its front, a downspout down the right column, its standing-seam roof under snow, the soffit's panel joints
  m.box("metal", [0, 4.0, 3.93], [9.9, 0.12, 0.14], "#2B3442");
  m.box("metal", [4.62, 2.0, 3.72], [0.09, 4.0, 0.09], "#2B3442");
  m.box("snow", [0, 4.095, 1.95], [9.7, 0.09, 3.6], "#EEF3F9");
  for (let k = -9; k <= 9; k++) m.box("dark", [k * 0.5, 3.432, 1.95], [0.01, 0.004, 3.6], "#9AA3AF");
  for (const s of [-1, 1]) { m.box("trim", [s * 4.4, 3.47, 3.4], [0.62, 0.06, 0.62], "#B5B0A6"); m.box("snow", [s * 4.4, 0.52, 3.4], [0.6, 0.03, 0.6], "#EEF3F9"); }
  // the door's vinyl: STORE HOURS block without times would be odd — the opening line and the store's name instead (door decals in a_tex)
};

/** the trees around the store: conifers (white pine, balsam fir) behind the roof and along the sides, built from drooping branches */
export const StoreTrees = () => {
  const objs = useMemo(() => {
    const items = [];
    for (let i = 0; i < 64; i++) { const x = -62 + i * 2.0 + (rnd(i) - 0.5) * 1.6, z = -74 - rnd(i + 1) * 14; items.push({ p: [x, 0, z], h: 15 + rnd(i + 2) * 9, w: 0.9 + rnd(i + 3) * 0.3, kind: rnd(i + 5) < 0.35 ? "fir" : "pine" }); }
    for (const s of [-1, 1]) for (let i = 0; i < 14; i++) { const x = s * (29 + rnd(i + 50) * 12), z = 12 - i * 6.2; items.push({ p: [x, LOTY, z], h: 9 + rnd(i + 51) * 8, w: 0.9 + rnd(i + 52) * 0.3, kind: rnd(i + 53) < 0.45 ? "fir" : "pine" }); }
    return conifers(items, false);
  }, []);
  return <>{objs.map((o, i) => <primitive key={i} object={o} />)}</>;
};
