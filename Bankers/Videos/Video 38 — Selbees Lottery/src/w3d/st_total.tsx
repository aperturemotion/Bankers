// @ts-nocheck
// ★ V38 station TOTAL (builder D): "In all, their company won over $26 million, nearly $8 million of it profit before tax.
//   Theirs went to family."
//   A quiet street in Evart at night. On a polished plinth (plaque G.S. INVESTMENT STRATEGIES · 2003–2012) a dark monolith rises —
//   the company's winnings, sealed. THE SIGNATURE REVEAL: on "$26 million" the shell flashes a white rim and turns to clear glass,
//   showing the column of strapped $100 bundles inside (counter $26 MILLION / WON, 9 YEARS); the camera pushes in; on "nearly
//   $8 million" the top 31% of the bundles (8 of 26) glows the house light blue and that slab lifts out of the case (counter
//   $8 MILLION / PROFIT BEFORE TAX). On "Theirs went to family" the camera glides across the lawn to a modest one-storey home
//   with warm windows (tag FAMILY) and pushes into its lit front window — the frame fills with the room's warm light and the film
//   CUTS (cut: true) to the rules station's close-up of the brochure under a lamp.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { canvasTex, ease, easeOut, rnd, clamp01, lerp, Sky, Glow } from "./kit";
import { Tag, Counter } from "./overlays";
import { cueAt } from "../bnx/SfxLayer";
import { BODY } from "./fonts3d";
import { Cash, BUNDLE } from "./st_total_cash";
import { House, PICTURE } from "./st_total_house";
import { LightPool, LightWash } from "./st_state_fx";
import { wAt, wEndAt } from "./st_state";

export const O_TOTAL = [2100, 0, 0];
const T = () => {
  const s0 = wAt("in", 1852);
  return {
    s0, all: wAt("all", s0), company: wAt("company", s0), won: wAt("won", s0), m26: wAt("$26", s0), m26e: wEndAt("$26", s0),
    nearly: wAt("nearly", s0), m8: wAt("$8", s0), profit: wAt("profit", s0), tax: wAt("tax", s0), taxE: wEndAt("tax", s0),
    theirs: wAt("theirs", s0), went: wAt("went", s0), family: wAt("family", s0), familyE: wEndAt("family", s0), next: wAt("sometimes", s0)
  };
};
// ── the column: LAYERS of 2 × 2 bundles (scaled ×1.4), the top 14 of 46 layers (8/26 = 31%) are the profit slab ─────────────
const SC = 1.4, BX = BUNDLE[0] * SC, BY = BUNDLE[1] * SC, BZ = BUNDLE[2] * SC;
const LAYERS = 46, PROFIT = 14;
const PLINTH_H = 0.7;
const COL_H = LAYERS * BY;                                   // ≈ 8.4
const SHELL = [BX + 0.5, COL_H + 0.5, BZ * 2 + 0.5];
const HOUSE_AT = [9, 0, -15];                                 // the home, set back across the lawn (faces +z)
const PIC = [HOUSE_AT[0] + PICTURE[0], PICTURE[1], HOUSE_AT[2] + PICTURE[2]];
const layerItems = (from, to, y0) => {
  const out = [];
  for (let L = from; L < to; L++) for (let a = 0; a < 1; a++) for (let b = 0; b < 2; b++) {
    const j = L * 4 + a * 2 + b;
    out.push({ p: [(rnd(j) - 0.5) * 0.05, y0 + (L - from + 0.5) * BY, (b - 0.5) * (BZ + 0.02) + (rnd(j + 7) - 0.5) * 0.04], r: [0, (rnd(j + 3) - 0.5) * 0.02, 0], s: 1 });
  }
  return out;
};
// ── print ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const asphaltTex = () => canvasTex("tt_asphalt", 512, 512, (c, w, h) => {
  c.fillStyle = "#18222F"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 12000; i++) { const g = 30 + rnd(i) * 45; c.fillStyle = `rgba(${g},${g + 8},${g + 20},${0.25 + rnd(i + 7) * 0.3})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
});
const lawnTex = () => canvasTex("tt_lawn", 512, 512, (c, w, h) => {
  c.fillStyle = "#12233A"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 26000; i++) { const g = rnd(i) * 40; c.fillStyle = `rgba(${30 + g},${48 + g},${68 + g},0.25)`; c.fillRect(rnd(i + 3) * w, rnd(i + 4) * h, 1.5, 3); }
});
const plaqueTex = () => canvasTex("tt_plaque", 768, 192, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#C9D6E6"); g.addColorStop(1, "#8696AD");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = "rgba(20,36,60,0.6)"; c.lineWidth = 4; c.strokeRect(10, 10, w - 20, h - 20);
  c.fillStyle = "#10233F"; c.textAlign = "center";
  c.font = `800 54px ${BODY}`; c.fillText("G.S. INVESTMENT STRATEGIES", w / 2, 92);
  c.font = `600 38px ${BODY}`; c.fillText("2003 – 2012", w / 2, 150);
});
const graniteTex = () => canvasTex("tt_granite", 512, 256, (c, w, h) => {
  c.fillStyle = "#1C2738"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { const g = 40 + rnd(i) * 80; c.fillStyle = `rgba(${g},${g + 10},${g + 26},${0.18 + rnd(i + 1) * 0.25})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2, 2); }
});

// the glass case: solid graphite → clear glass, its 12 edges flashing white then holding a faint light-blue rim
const EDGES = (() => {
  const [x, y, z] = SHELL.map((v) => v / 2), e = [];
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) e.push({ p: [0, sy * y, sz * z], s: [SHELL[0], 0.05, 0.05] });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) e.push({ p: [sx * x, 0, sz * z], s: [0.05, SHELL[1], 0.05] });
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) e.push({ p: [sx * x, sy * y, 0], s: [0.05, 0.05, SHELL[2]] });
  return e;
})();
const Case = ({ glass, rim }) => {
  const geo = useMemo(() => new RoundedBoxGeometry(SHELL[0], SHELL[1], SHELL[2], 3, 0.08), []);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ transparent: true }), []);
  mat.color.set("#16233A").lerp(new THREE.Color("#CFE2F8"), glass);
  mat.metalness = lerp(0.75, 0.0, glass); mat.roughness = lerp(0.28, 0.04, glass);
  mat.opacity = lerp(1, 0.1, glass); mat.depthWrite = glass < 0.5; mat.clearcoat = 1; mat.clearcoatRoughness = 0.1;
  mat.envMapIntensity = lerp(1.4, 2.2, glass);
  return (
    <group position={[0, SHELL[1] / 2 - 0.25, 0]}>
      <mesh geometry={geo} material={mat} renderOrder={glass > 0.5 ? 5 : 0} castShadow={glass < 0.5} receiveShadow />
      {rim > 0.01 && EDGES.map((e, i) => (
        <mesh key={i} position={e.p} renderOrder={6}><boxGeometry args={e.s} /><meshBasicMaterial color="#EAF4FF" transparent opacity={rim} depthWrite={false} /></mesh>
      ))}
      {/* the sealed shell's seams and a brushed band (only while solid) */}
      {glass < 0.98 && [0.3, 0.62].map((v) => <mesh key={v} position={[0, (v - 0.5) * SHELL[1], SHELL[2] / 2 + 0.005]}><boxGeometry args={[SHELL[0] - 0.2, 0.025, 0.01]} /><meshBasicMaterial color="#5E7798" transparent opacity={1 - glass} /></mesh>)}
    </group>
  );
};
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  const asphalt = useMemo(() => { const a = asphaltTex(); a.wrapS = a.wrapT = THREE.RepeatWrapping; a.repeat.set(8, 8); return a; }, []);
  const lawn = useMemo(() => { const a = lawnTex(); a.wrapS = a.wrapT = THREE.RepeatWrapping; a.repeat.set(6, 4); return a; }, []);
  const plaque = useMemo(plaqueTex, []), granite = useMemo(graniteTex, []);
  const lower = useMemo(() => layerItems(0, LAYERS - PROFIT, 0), []);
  const upper = useMemo(() => layerItems(LAYERS - PROFIT, LAYERS, 0), []);
  // the monolith rises out of the plinth; the shell goes to glass; the profit glows and lifts
  const rise = ease(f, t.s0 - 4, t.company + 10);
  const yRise = -(SHELL[1] + 0.3) * (1 - rise);
  const G0 = t.m26 + 16;
  const glass = ease(f, G0, G0 + 9);
  const rim = clamp01(ease(f, G0 - 2, G0 + 4) - 0.65 * ease(f, G0 + 6, G0 + 22));
  const glow = ease(f, t.nearly - 2, t.m8 + 6);
  const lift = ease(f, t.m8 + 2, t.profit + 10) * 2.1;
  const caseLift = ease(f, t.m8 - 4, t.m8 + 6) * 0.0;
  const homeK = ease(f, t.tax - 6, t.family);
  const moonK = ease(f, t.s0 - 2, t.s0 + 12) * (1 - ease(f, t.family, t.family + 10));
  return (
    <group>
      <Sky />
      {moonK > 0.002 && <Glow position={[60, 64, -150]} size={14} color="#CFE0FA" opacity={0.3 * moonK} />}
      {moonK > 0.002 && <mesh position={[60, 64, -150]}><sphereGeometry args={[2.0, 24, 16]} /><meshBasicMaterial color="#E8F0FB" fog={false} transparent opacity={moonK} /></mesh>}
      {/* the ground: a wet cul-de-sac of asphalt, the curb, the lawns, the drive and the front walk */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.03, -20]} receiveShadow><planeGeometry args={[400, 400]} /><meshStandardMaterial color="#0C1F33" roughness={0.95} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[2, 0, 2]} receiveShadow><circleGeometry args={[11, 64]} /><meshStandardMaterial map={asphalt} color="#8494AC" roughness={0.3} metalness={0.2} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[2, 0.005, 2]}><ringGeometry args={[11, 11.4, 64]} /><meshStandardMaterial color="#8A96A8" roughness={0.7} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[6, -0.01, -12]} receiveShadow><planeGeometry args={[60, 22]} /><meshStandardMaterial map={lawn} color="#8FA2BC" roughness={0.95} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[HOUSE_AT[0] + 7.6, 0.01, -9]} receiveShadow><planeGeometry args={[3.8, 9]} /><meshStandardMaterial color="#4A5466" roughness={0.6} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[HOUSE_AT[0] - 0.8, 0.012, -7.6]} receiveShadow><planeGeometry args={[1.3, 6]} /><meshStandardMaterial color="#3E4858" roughness={0.7} /></mesh>
      {/* the home and its neighbours down the street in the haze */}
      <group position={HOUSE_AT}><House lit={1} /></group>
      <group position={[-12, 0, -21]} rotation-y={0.25} scale={0.95}><House lit={0.7} siding="#6F7F96" /></group>
      <group position={[28, 0, -19]} rotation-y={-0.3}><House lit={0.6} siding="#8794A8" /></group>
      {/* the warm spill of the windows and the porch light on the lawn */}
      <LightPool position={[PIC[0], 0.03, PIC[2] + 2.2]} r={2.8} sx={1.3} color="#FFB867" opacity={0.3 + 0.1 * homeK} />
      <LightPool position={[HOUSE_AT[0] - 3, 0.03, HOUSE_AT[2] + 5.4]} r={1.8} color="#FFB867" opacity={0.25} />
      <LightPool position={[HOUSE_AT[0] - 0.7, 0.03, HOUSE_AT[2] + 5.0]} r={2.0} color="#FFC27A" opacity={0.35} />
      {/* a street lamp at the curb */}
      <group position={[-7.5, 0, -6.5]}>
        <mesh position={[0, 2.7, 0]} castShadow><cylinderGeometry args={[0.07, 0.11, 5.4, 10]} /><meshStandardMaterial color="#1B2636" metalness={0.6} roughness={0.4} /></mesh>
        <mesh position={[0.6, 5.35, 0]}><boxGeometry args={[1.3, 0.08, 0.08]} /><meshStandardMaterial color="#1B2636" metalness={0.6} roughness={0.4} /></mesh>
        <mesh position={[1.15, 5.22, 0]}><sphereGeometry args={[0.2, 16, 12]} /><meshStandardMaterial color="#FFE2B0" emissive="#FFC97A" emissiveIntensity={3} /></mesh>
        <Glow position={[1.15, 5.22, 0]} size={2.6} color="#FFC27A" opacity={0.7} />
      </group>
      <LightPool position={[-6.3, 0.02, -6.5]} r={4} color="#FFB867" opacity={0.28} />
      {/* trees in the yards */}
      {[[-6, -14, 1.3], [20, -12, 1.4], [3, -22, 1.6], [-16, -8, 1.2]].map(([x, z, s], i) => (
        <group key={i} position={[x, 0, z]} scale={s} rotation-y={rnd(i) * 6}>
          <mesh position={[0, 1.4, 0]} castShadow><cylinderGeometry args={[0.16, 0.26, 2.8, 8]} /><meshStandardMaterial color="#1B2533" roughness={0.9} /></mesh>
          {[[0, 3.4, 0, 1.6], [0.9, 2.9, 0.3, 1.1], [-0.8, 3.0, -0.4, 1.2], [0.2, 4.2, -0.3, 1.0]].map(([a, b, c2, r], k) => <mesh key={k} position={[a, b, c2]} castShadow><icosahedronGeometry args={[r, 1]} /><meshStandardMaterial color={k % 2 ? "#1E3A52" : "#24425C"} roughness={0.95} flatShading /></mesh>)}
        </group>
      ))}
      {/* the plinth: polished granite drum, a brushed steel ring, the plaque */}
      <mesh position={[0, PLINTH_H / 2, 0]} castShadow receiveShadow><cylinderGeometry args={[3.5, 3.7, PLINTH_H, 64]} /><meshStandardMaterial map={granite} color="#C5D2E4" roughness={0.18} metalness={0.25} /></mesh>
      <mesh position={[0, PLINTH_H + 0.02, 0]}><cylinderGeometry args={[3.52, 3.52, 0.05, 64]} /><meshStandardMaterial color="#A9BBD3" metalness={0.9} roughness={0.25} /></mesh>
      <mesh position={[0, PLINTH_H * 0.5, 3.62]} rotation-x={-0.05}><planeGeometry args={[2.8, 0.7]} /><meshStandardMaterial map={plaque} metalness={0.6} roughness={0.35} /></mesh>
      {/* the light ring around the plinth's foot */}
      <LightPool position={[0, 0.02, 0]} r={6} color="#7FB4F2" opacity={0.22 + 0.25 * glass} />
      {/* the monolith: the column of bundles and its case, rising out of the plinth */}
      <group position={[0, PLINTH_H + yRise, 0]}>
        <Cash items={lower} scale={SC} />
        <group position={[0, (LAYERS - PROFIT) * BY + lift, 0]}>
          <Cash items={upper} scale={SC} glow={glow * 0.75} />
          {glow > 0.01 && <Glow position={[0, PROFIT / 2 * BY, 0]} size={9 * glow} color="#7FB4F2" opacity={0.55 * glow} />}
          {glow > 0.01 && <Glow position={[0, PROFIT / 2 * BY, BZ + 0.3]} size={4.5 * glow} color="#CFE4FF" opacity={0.35 * glow} />}
        </group>
        <group position={[0, caseLift, 0]}><Case glass={glass} rim={rim} /></group>
      </group>
      {/* the glass's light on the asphalt */}
      <pointLight position={[0, PLINTH_H + COL_H * 0.85 + lift, 2.6]} intensity={14 * glow} distance={12} decay={1.4} color="#9CC6F6" />
    </group>
  );
};
// ── the camera (WORLD) ─────────────────────────────────────────────────────────────────────────────────────────────────────
const W = (p) => [p[0] + O_TOTAL[0], p[1] + O_TOTAL[1], p[2] + O_TOTAL[2]];
export const TOTAL_PUSH_END = () => T().next - 2;              // the frame the push into the window lands (the cut follows)
const shots = () => {
  const t = T();
  return [
    // arrival: a flight from the state station, settling low before the plinth
    { a: t.s0 - 21, b: t.s0 + 2, pos: W([-12, 7, 72]), target: W([0, 4.4, 0]), fov: 36, arc: 8 },
    { a: t.s0 - 7, b: t.s0 + 16, pos: W([-4.5, 2.4, 17.5]), target: W([0, 4.4, 0]), fov: 36 },
    // the monolith rises: a low angle easing in as it climbs
    { a: t.s0 + 14, b: t.m26 + 8, pos: W([-3.0, 1.8, 14.5]), target: W([0, 5.2, 0]), fov: 36 },
    // the glass reveal: push in toward the bundles
    { a: t.m26 + 8, b: t.nearly, pos: W([2.4, 4.6, 12.6]), target: W([0, 5.4, 0]), fov: 36 },
    // the profit: rise to the glowing slab as it lifts out
    { a: t.nearly, b: t.tax, pos: W([3.8, 9.6, 12.8]), target: W([0, 11.2, 0]), fov: 36 },
    // to the home: glide right across the lawn, the case passing on the left, the house front with its lit windows
    { a: t.tax - 4, b: t.family - 2, pos: W([PIC[0] - 2.4, 2.6, PIC[2] + 16]), target: W([PIC[0] - 1.2, 2.2, PIC[2]]), fov: 40 },
    // …and into the picture window: the room's light fills the frame
    { a: t.family + 2, b: t.next - 2, pos: W([PIC[0], PIC[1] - 0.02, PIC[2] + 0.1]), target: W([PIC[0], PIC[1] - 0.02, PIC[2] - 4]), fov: 34 }
  ];
};
const Overlay = ({ f, P }) => {
  const t = T();
  const plaque = P([-SHELL[0] / 2 + 0.3, PLINTH_H + 4.2 - (SHELL[1] + 0.3) * (1 - ease(f, t.s0 - 4, t.company + 10)), SHELL[2] / 2]);
  const slab = P([BX / 2, PLINTH_H + (LAYERS - PROFIT / 2) * BY + ease(f, t.m8 + 2, t.profit + 10) * 2.1, BZ]);
  const home = P([HOUSE_AT[0] - 0.8, 2.6, HOUSE_AT[2] + 3.6]);
  return (
    <>
      <Tag text="Their company" at={t.company - 2} out={t.m26 + 10} x={70} y={560} to={plaque.behind ? null : plaque} size={30} />
      <Counter at={t.m26 - 2} out={t.nearly - 4} x={540} y={300} value={26} prefix="$" unit="MILLION" label="Won, 9 years" size={112} countDur={26} />
      <Counter at={t.m8 - 2} out={t.tax + 8} x={540} y={300} value={8} prefix="$" unit="MILLION" label="Profit before tax" size={112} countDur={16} />
      <Tag text="Profit" at={t.profit} out={t.tax + 6} x={720} y={600} to={slab.behind ? null : slab} size={30} />
      <Tag text="Family" at={t.family - 4} out={t.family + 12} x={120} y={560} to={home.behind ? null : home} size={32} />
    </>
  );
};
const sfx = () => {
  const t = T();
  const G0 = t.m26 + 16;
  return [
    cueAt("whooshlong", t.s0 - 6, 30, 0.5),                     // the arrival flight
    cueAt("sub", t.s0 + 2, 40, 0.45),                           // the monolith rising
    cueAt("chainshort", t.all, 30, 0.22),
    cueAt("pingshort", G0 + 2, 12, 0.5),                        // the shell flashing to glass
    cueAt("ee_whoosh_fast_small_whoosh_01", G0 + 1, 12, 0.3),
    cueAt("coin", t.m26 + 24, 16, 0.35),                        // $26M lands
    cueAt("whooshsoft", t.m8 + 6, 20, 0.4),                     // the slab lifting out
    cueAt("pingshort", t.m8 + 14, 12, 0.35),
    cueAt("airwoosh", t.tax + 14, 30, 0.45),                    // the glide to the house
    cueAt("whooshsoft", t.family + 8, 14, 0.4)                  // the push into the window
  ];
};
export const ST = { id: "total", origin: O_TOTAL, from: wAt("in", 1852) - 22, to: wAt("sometimes", 1852) + 2, light: { target: [2, 0, -4], shadowBox: 22, keyI: 1.7, fillI: 0.34, rimI: 1.8 }, shots, Scene, Overlay, sfx };
