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
import { LightPool, LightWash, Tree, Shade, floorBlob, footRing, footRect } from "./st_state_fx";
import { wAt, wEndAt } from "./st_state";

// rev 2 (builder B, Timur 2026-11-26: the 1:00 transition "is great, but make it more smooth"): the street now lies 40 m to the
//   right of the State House plaza (it was 300 m away, crossed in ~25 frames through an empty navy haze). The camera trucks right
//   in ONE eased move from the dome to the plinth, both places in view the whole way; nothing of either place is ever on screen
//   when it mounts or unmounts (checked from the cameras: the nearest other-station object sits ≥ 19° outside the frame edge).
export const O_TOTAL = [1600, 0, 0];   // rev 5: 40 m east of the State House plaza (which moved with it)
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
export const PIC_WORLD = [PIC[0] + O_TOTAL[0], PIC[1] + O_TOTAL[1], PIC[2] + O_TOTAL[2]];   // the lit picture window (the rules crane leaves from it)
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
// the plaque (rev 2, Timur: "the GS investment strategies [text] falls out of the white thing … It cuts out the number"): every line is
//   FITTED inside the engraved border with a 7% margin (measured, scaled down if needed), the plate is a framed brushed-steel plaque
//   with thickness, and it sits higher on the plinth's face so the years line is never under the frame's edge
const PLAQUE = { w: 2.5, h: 0.5, y: 0.4 };
const plaqueTex = () => canvasTex("tt_plaque2", 2048, 410, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#D6E1EE"); g.addColorStop(0.55, "#AFBED1"); g.addColorStop(1, "#8D9DB3");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(255,255,255,${0.04 + rnd(i) * 0.06})`; c.fillRect(0, rnd(i + 7) * h, w, 1); }   // the brushing
  c.strokeStyle = "rgba(16,35,63,0.75)"; c.lineWidth = 8; c.strokeRect(26, 26, w - 52, h - 52);
  c.lineWidth = 3; c.strokeRect(44, 44, w - 88, h - 88);
  const fit = (txt, y, wt, px, track) => {   // set a line, shrinking it until it sits inside the border with the margin
    const maxW = w * 0.86;
    let size = px;
    for (;;) { c.font = `${wt} ${size}px ${BODY}`; if ("letterSpacing" in c) c.letterSpacing = `${track * size}px`; if (c.measureText(txt).width <= maxW || size < 20) break; size -= 2; }
    c.fillStyle = "rgba(255,255,255,0.45)"; c.fillText(txt, w / 2 + 2, y + 3);   // the engraving's lit lower lip
    c.fillStyle = "#10233F"; c.fillText(txt, w / 2, y);
    if ("letterSpacing" in c) c.letterSpacing = "0px";
  };
  c.textAlign = "center"; c.textBaseline = "alphabetic";
  fit("G.S. INVESTMENT STRATEGIES", 205, 800, 150, 0.06);
  fit("EVART, MICHIGAN   2003 – 2012", 322, 600, 82, 0.12);
  [[70, 70], [w - 70, 70], [70, h - 70], [w - 70, h - 70]].forEach(([x, y]) => {   // the four fixing screws
    const sg = c.createRadialGradient(x - 5, y - 5, 2, x, y, 16); sg.addColorStop(0, "#F2F6FB"); sg.addColorStop(1, "#5E6E84");
    c.fillStyle = sg; c.beginPath(); c.arc(x, y, 15, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "rgba(16,35,63,0.6)"; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 9, y + 9); c.lineTo(x + 9, y - 9); c.stroke();
  });
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
// rev 6 (Timur: "we don't really want unlit objects … a dark subtle shape under it"): the plinth's foot on the asphalt (a ring), the
//   street lamp's foot; the money column's foot on the plinth (four bands, shown as the column stands), its glass case's foot
const TOTAL_BANDS = footRing(0, 0, 0, 3.7, 0.9, 0.5, 24);
const TOTAL_BLOBS = [floorBlob(-7.5, 0, -6.5, 0.5, 0.5, 0.6)];
const COLUMN_FOOT = [...footRect(0, PLINTH_H + 0.025, 0, BX / 2 + 0.02, BZ + 0.03, 0.42, 0.55), ...footRect(0, PLINTH_H + 0.02, 0, SHELL[0] / 2, SHELL[2] / 2, 0.3, 0.35)];
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
      <group position={[-12, 0, -18.5]} rotation-y={0.25} scale={0.95}><House lit={0.7} siding="#6F7F96" /></group>
      <group position={[29, 0, -16]} rotation-y={-0.3}><House lit={0.6} siding="#8794A8" /></group>
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
      {[[-6, -14, 1.3], [20, -12, 1.4], [3, -19.5, 1.6], [-16, -8, 1.2]].map(([x, z, s], i) => <Tree key={i} x={x} z={z} s={s} i={i + 5} />)}
      {/* the plinth: polished granite drum, a brushed steel ring, the plaque */}
      <mesh position={[0, PLINTH_H / 2, 0]} castShadow receiveShadow><cylinderGeometry args={[3.5, 3.7, PLINTH_H, 64]} /><meshStandardMaterial map={granite} color="#C5D2E4" roughness={0.18} metalness={0.25} /></mesh>
      <mesh position={[0, PLINTH_H + 0.02, 0]}><cylinderGeometry args={[3.52, 3.52, 0.05, 64]} /><meshStandardMaterial color="#A9BBD3" metalness={0.9} roughness={0.25} /></mesh>
      <group position={[0, PLAQUE.y, 3.64]} rotation-x={-0.05}>
        <mesh position={[0, 0, -0.03]} castShadow><boxGeometry args={[PLAQUE.w + 0.08, PLAQUE.h + 0.08, 0.06]} /><meshStandardMaterial color="#5C6B80" metalness={0.8} roughness={0.35} /></mesh>
        <mesh position={[0, 0, 0.002]}><planeGeometry args={[PLAQUE.w, PLAQUE.h]} /><meshStandardMaterial map={plaque} metalness={0.55} roughness={0.38} emissiveMap={plaque} emissive="#FFFFFF" emissiveIntensity={0.12} /></mesh>
      </group>
      <Shade items={TOTAL_BANDS} />
      <Shade items={TOTAL_BLOBS} kind="blob" />
      <Shade items={COLUMN_FOOT} k={ease(f, t.company - 6, t.company + 10)} />
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
export const TOTAL_PUSH_END = () => T().next - 2;              // (rev 3's dissolve frame; rev 5 crane-transition: Main.tsx no longer uses it)
// ★ rev 5 (Timur: slower, cinematic; "seamless transitions … preferably no fade outs"): six long overlapping moves, each from a
//   subject to a subject — the truck east from the dome (62 f, was 45), the low angle as the monolith climbs, the push on the glass,
//   the rise to the profit slab, the glide to the home (54 f, was 42) and a slow push on its lit picture window. The film then leaves
//   the window by the RULES station's first shot: a crane up the facade, over the roof ridge and down onto Evart's main street, which
//   runs behind the house (st_rules O_RULES) — no cross-dissolve.
const shots = () => {
  const t = T();
  return [
    // arrival: ONE eased truck from the State House framing across the plaza's edge to the plinth 40 m east, a crane over the trees
    { a: wEndAt("$120", 1700) - 8, b: t.s0 + 34, pos: W([-4.5, 2.4, 17.5]), target: W([0, 3.7, 0]), fov: 36, arc: 6.0 },
    // the monolith rises: a low angle easing in as it climbs
    { a: t.s0 + 24, b: t.m26 + 14, pos: W([-3.0, 1.8, 14.5]), target: W([0, 5.2, 0]), fov: 36 },
    // the glass reveal: push in toward the bundles
    { a: t.m26 + 10, b: t.nearly + 6, pos: W([2.4, 4.6, 12.6]), target: W([0, 5.4, 0]), fov: 36 },
    // the profit: rise to the glowing slab as it lifts out
    { a: t.nearly, b: t.tax - 8, pos: W([3.4, 5.6, 16.6]), target: W([0, 8.3, 0]), fov: 36 },   // rev 5: from further back and lower (less climb, no up-then-down swing into the glide)
    // to the home: glide right across the lawn, the case passing on the left, the house front with its lit windows
    { a: t.tax - 18, b: t.went + 12, pos: W([PIC[0] - 2.0, 2.5, PIC[2] + 12]), target: W([PIC[0] - 1.0, 2.1, PIC[2]]), fov: 40 },
    // a slow push on the lit picture window ("Theirs went to family"); the rules station's crane leaves from it
    { a: t.went + 2, b: t.family + 18, pos: W([PIC[0] - 0.6, 2.3, PIC[2] + 7.0]), target: W([PIC[0] - 0.4, 2.0, PIC[2]]), fov: 38 }
  ];
};
const Overlay = ({ f, P }) => {
  const t = T();
  const plaque = P([-SHELL[0] / 2 + 0.3, PLINTH_H + 4.2 - (SHELL[1] + 0.3) * (1 - ease(f, t.s0 - 4, t.company + 10)), SHELL[2] / 2]);
  const slab = P([BX / 2, PLINTH_H + (LAYERS - PROFIT / 2) * BY + ease(f, t.m8 + 2, t.profit + 10) * 2.1, BZ]);
  const home = P([PIC[0] - 0.7, PIC[1] + 0.35, PIC[2] + 0.05]);   // the lit picture window the camera pushes into
  return (
    <>
      {/* rev 2 tag audit (REV2: fully in by the word, ≥ 36 f read, gone before the camera leaves its object) */}
      <Tag text="Their company" at={t.company - 12} out={t.m26 + 10} x={70} y={560} to={plaque.behind ? null : plaque} size={30} />
      <Counter at={t.m26 - 2} out={t.nearly - 4} x={540} y={300} value={26} prefix="$" unit="MILLION" label="Won, 9 years" size={112} countDur={26} />
      <Counter at={t.m8 - 2} out={t.tax + 8} x={540} y={300} value={8} prefix="$" unit="MILLION" label="Profit before tax" size={112} countDur={16} />
      <Tag text="Profit" at={t.m8 - 8} out={t.tax - 10} x={720} y={600} to={slab.behind ? null : slab} size={30} />
      <Tag text="Family" at={t.tax + 7} out={t.family + 8} x={120} y={560} to={home.behind ? null : home} size={32} />
    </>
  );
};
const sfx = () => {
  const t = T();
  const G0 = t.m26 + 16;
  return [
    cueAt("whooshlong", t.s0 - 9, 30, 0.4),                    // the arrival truck (rev 5: its fastest frame ≈ s0 + 3)
    cueAt("sub", t.s0 + 2, 40, 0.45),                           // the monolith rising
    cueAt("chainshort", t.all, 30, 0.22),
    cueAt("ov_clank", t.company + 10, 14, 0.22),                // rev 6: the column locks at full height on its plinth
    cueAt("pingshort", G0 + 2, 12, 0.5),                        // the shell flashing to glass
    cueAt("ee_whoosh_fast_small_whoosh_01", G0 + 1, 12, 0.3),
    cueAt("coin", t.m26 + 24, 16, 0.35),                        // $26M lands
    cueAt("whooshsoft", t.m8 + 6, 20, 0.4),                     // the slab lifting out
    cueAt("ov_money_drop", t.profit + 10, 14, 0.16),            // rev 6: the lifted slab settles (its bundles shift)
    cueAt("pingshort", t.m8 + 14, 12, 0.35),
    cueAt("airwoosh", t.tax - 5, 30, 0.4),                     // the glide to the house (rev 5: fastest ≈ 2053; airwoosh peaks 21 f in)
    cueAt("whooshsoft", t.family + 8, 14, 0.3)                  // the push in toward the window
  ];
};
// rev 5 (Timur: the main visual "needs to have shadows … not bright and unlit"): the key comes from the LEFT and high (the bundles'
//   left faces lit, their fronts in half light, the right in shade, each layer's edge reading), the fill is lower
export const ST = { id: "total", origin: O_TOTAL, from: wAt("$120", 1700) + 10, to: wAt("sometimes", 1852) + 40, light: { target: [2, 0, -4], key: [-13, 13, 4], shadowBox: 22, keyI: 2.0, fillI: 0.24, rimI: 1.4 }, shots, Scene, Overlay, sfx };
