// @ts-nocheck
// ★ V39 builder B — 1950s SERVICE-STATION PROPS for the gas station (Haviland's, Brattleboro): two tall computing gas pumps with
//   their lighted milk-glass globes (REGULAR / PREMIUM in plain type — no oil company's artwork), mechanical sale/gallon dials reset to
//   zero, a hose looping to the nozzle in its holster; a wire rack of quart oil cans; stacked tires; the station's signage.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { canvasTex, rnd, Glow } from "./kit";
import { BODY } from "./fonts3d";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";

export const SIGNF = loadOswald("normal", { weights: ["500", "600", "700"] }).fontFamily;
const F = (wt, px, fam = BODY) => `${wt} ${px}px ${fam}`;
const ctext = (c, s, x, y, font, color, maxW) => { c.font = font; c.fillStyle = color; c.textAlign = "center"; c.textBaseline = "middle"; if (maxW) c.fillText(s, x, y, maxW); else c.fillText(s, x, y); };

// ── the pump's face: the dial window (AMOUNT OF SALE / GALLONS, wheels at zero), PRICE PER GALLON, the grade, a louvred lower door ──
export const pumpFaceTex = (grade, accent) => canvasTex("b_pumpface_" + grade, 512, 1024, (c, w, h) => {
  c.fillStyle = "#E9E6DC"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 5000; i++) { c.fillStyle = `rgba(80,76,66,${rnd(i) * 0.05})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  // the dial bezel
  c.fillStyle = "#2B2F36"; c.beginPath(); c.roundRect(40, 60, w - 80, 380, 40); c.fill();
  c.fillStyle = "#C9CED6"; c.beginPath(); c.roundRect(52, 72, w - 104, 356, 32); c.fill();
  c.fillStyle = "#F7F5EE"; c.beginPath(); c.roundRect(64, 84, w - 128, 332, 26); c.fill();
  const wheels = (y, label, digits, dp) => {
    ctext(c, label, w / 2, y, F(800, 30), "#1E2633");
    const n = digits.length, cw = 54, x0 = w / 2 - (n * cw) / 2;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * cw;
      c.fillStyle = "#111418"; c.fillRect(x + 3, y + 26, cw - 6, 74);
      const g = c.createLinearGradient(0, y + 26, 0, y + 100); g.addColorStop(0, "rgba(255,255,255,0.18)"); g.addColorStop(0.5, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(0,0,0,0.4)"); c.fillStyle = g; c.fillRect(x + 3, y + 26, cw - 6, 74);
      ctext(c, digits[i], x + cw / 2, y + 64, F(700, 58, SIGNF), "#F4F1E8");
      if (i === dp - 1) { c.fillStyle = "#1E2633"; c.beginPath(); c.arc(x + cw, y + 96, 5, 0, 7); c.fill(); }
    }
  };
  wheels(116, "AMOUNT OF SALE", ["0", "0", "0", "0"], 2);
  wheels(262, "GALLONS", ["0", "0", "0"], 2);
  // price per gallon window (reset, blank wheels show 0)
  c.fillStyle = "#2B2F36"; c.beginPath(); c.roundRect(116, 470, w - 232, 120, 16); c.fill();
  c.fillStyle = "#F7F5EE"; c.beginPath(); c.roundRect(126, 480, w - 252, 100, 10); c.fill();
  ctext(c, "PRICE PER GALLON", w / 2, 506, F(800, 22), "#1E2633");
  ctext(c, "INCL. TAX", w / 2, 560, F(700, 18), "#5A6472");
  // the grade, in plain type on the accent band
  c.fillStyle = accent; c.fillRect(0, 630, w, 120);
  c.fillStyle = "rgba(255,255,255,0.15)"; c.fillRect(0, 630, w, 6);
  ctext(c, grade, w / 2, 692, F(700, 84, SIGNF), "#F7F5EE");
  // the lower door: louvres, a lock, a maker's-style plate in plain words
  for (let k = 0; k < 9; k++) { c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(90, 790 + k * 20, w - 180, 6); c.fillStyle = "rgba(255,255,255,0.35)"; c.fillRect(90, 796 + k * 20, w - 180, 3); }
  c.fillStyle = "#8E959F"; c.beginPath(); c.arc(w - 70, 900, 12, 0, 7); c.fill();
  c.strokeStyle = "rgba(40,40,40,0.5)"; c.lineWidth = 3; c.strokeRect(30, 770, w - 60, 230);
  // wear: chips and grime near the bottom
  for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(60,56,50,${rnd(i) * 0.18})`; c.fillRect(rnd(i + 3) * w, h - rnd(i + 4) * 140, 3 + rnd(i) * 6, 2); }
});
// the globe: a 1950s one-piece milk-glass globe — a lens-shaped body with a lettered glass lens in each face, held in a metal band
const globeLensTex = (grade, accent) => canvasTex("e_globe_lens_" + grade, 512, 512, (c, w, h) => {
  const g = c.createRadialGradient(w * 0.45, h * 0.4, 10, w / 2, h / 2, w / 2); g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.8, "#FBF4E4"); g.addColorStop(1, "#EADCC0");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = accent; c.lineWidth = 30; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 30, 0, 7); c.stroke();
  c.strokeStyle = "#FFFFFF"; c.lineWidth = 5; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 50, 0, 7); c.stroke();
  // a band across the middle with the grade (fitted inside the band, clear of the ring); GASOLINE above it, clear of both
  c.fillStyle = accent; c.fillRect(60, h / 2 - 70, w - 120, 140);
  boxText(c, grade, SIGNF, 700, [74, h / 2 - 64, w - 74, h / 2 + 64], "#FFFFFF", 0.12);
  boxText(c, "GASOLINE", SIGNF, 600, [150, 104, w - 150, 172], accent, 0.08);
});
const globeBodyTex = () => canvasTex("e_globe_body", 256, 128, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#FFFFFF"); g.addColorStop(1, "#EFE4CE"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
const GLOBE_LENS = new THREE.CircleGeometry(0.16, 40);
let GBODY = null;
const globeBody = () => GBODY ??= (() => { const q = new THREE.SphereGeometry(0.2, 36, 22); q.scale(1, 0.95, 0.5); return q; })();
/** the nozzle: a cast body with its grip, the trigger lever under it inside a guard, the spout curving down (local: along +x) */
let NZ = null;
const nozzleGeos = () => NZ ??= (() => {
  const body = new THREE.LatheGeometry([[0.001, 0], [0.024, 0], [0.03, 0.02], [0.03, 0.09], [0.026, 0.12], [0.02, 0.14], [0.001, 0.142]].map(([r, y]) => new THREE.Vector2(r, y)), 18);
  body.rotateZ(-Math.PI / 2);
  const spout = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0.14, 0, 0], [0.2, -0.004, 0], [0.25, -0.03, 0], [0.28, -0.07, 0]].map((p) => new THREE.Vector3(...p))), 16, 0.01, 10, false);
  const grip = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0.0, 0, 0], [-0.06, -0.012, 0], [-0.13, -0.02, 0]].map((p) => new THREE.Vector3(...p))), 12, 0.019, 12, false);
  const guard = new THREE.TorusGeometry(0.055, 0.005, 6, 20, Math.PI); guard.rotateZ(Math.PI); guard.translate(-0.06, -0.02, 0);
  const lever = new THREE.BoxGeometry(0.1, 0.012, 0.016); lever.translate(-0.06, -0.045, 0);
  return { body, spout, grip, guard, lever };
})();
let PM = null;
const pumpMats = () => PM ??= {
  body: new THREE.MeshStandardMaterial({ color: "#E4E1D7", roughness: 0.35, metalness: 0.15, envMapIntensity: 0.9 }),
  trim: new THREE.MeshStandardMaterial({ color: "#1F3A63", roughness: 0.35, metalness: 0.2 }),
  chrome: new THREE.MeshStandardMaterial({ color: "#D6DCE4", roughness: 0.15, metalness: 0.95 }),
  hose: new THREE.MeshStandardMaterial({ color: "#121417", roughness: 0.55, metalness: 0.05 }),
  base: new THREE.MeshStandardMaterial({ color: "#2A2E35", roughness: 0.6, metalness: 0.3 }),
  ring: new THREE.MeshStandardMaterial({ color: "#C9CFD8", roughness: 0.25, metalness: 0.85 })
};
const PG = {};
const pumpGeo = () => PG.body ??= new RoundedBoxGeometry(0.62, 1.55, 0.44, 4, 0.09);
const capGeo = () => PG.cap ??= new RoundedBoxGeometry(0.66, 0.1, 0.48, 3, 0.04);
/** one gas pump standing on the island (front face toward +z): a cast base, the cabinet, the computing head with its dial window
 *  behind a chrome bezel and glass, the grade band, a louvred lower door, chrome edge strips, the hose from its outlet looping down to
 *  the nozzle hanging in its boot with the on/off lever beside it, a lamp housing with a cap of snow, the lighted globe */
export const GasPump = ({ position, ry = 0, grade = "REGULAR", accent = "#1F3A63", lit = 1 }) => {
  const m = pumpMats();
  const face = useMemo(() => pumpFaceTex(grade, accent), [grade]);
  const lens = useMemo(() => globeLensTex(grade, accent), [grade]);
  const faceMat = useMemo(() => new THREE.MeshStandardMaterial({ map: face, roughness: 0.3, metalness: 0.05 }), [face]);
  const lensMat = useMemo(() => new THREE.MeshStandardMaterial({ map: lens, emissiveMap: lens, emissive: "#FFEBD0", emissiveIntensity: 0.95 * lit, roughness: 0.18 }), [lens]);
  const gbm = useMemo(() => new THREE.MeshStandardMaterial({ map: globeBodyTex(), emissive: "#FFE6C4", emissiveIntensity: 0.75 * lit, roughness: 0.25 }), []);
  const glass = useMemo(() => new THREE.MeshStandardMaterial({ color: "#DDE6F2", roughness: 0.03, metalness: 0.1, transparent: true, opacity: 0.18, envMapIntensity: 2, depthWrite: false }), []);
  const snow = useMemo(() => new THREE.MeshStandardMaterial({ color: "#F2F6FB", roughness: 0.75 }), []);
  const nz = nozzleGeos();
  const hose = useMemo(() => {
    const pts = [[0.31, 1.42, -0.06], [0.37, 1.3, 0.02], [0.41, 0.9, 0.16], [0.4, 0.42, 0.26], [0.36, 0.26, 0.2], [0.34, 0.36, 0.08], [0.35, 0.72, 0.05], [0.36, 0.9, 0.07]].map((p) => new THREE.Vector3(...p));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.019, 10, false);
  }, []);
  const H0 = 0.12, BH = 1.55, FZ = 0.2225;
  // the dial window on the face texture: px (40..472, 60..440) of 512 × 1024 over the 0.5 × 1.4 m face
  const dW = 0.5 * (432 / 512), dH = 1.4 * (380 / 1024), dY = H0 + BH / 2 + 0.7 - 1.4 * (250 / 1024);
  return (
    <group position={position} rotation-y={ry}>
      {/* the cast base with its hold-down bolts */}
      <mesh position={[0, 0.06, 0]} material={m.base} castShadow receiveShadow><boxGeometry args={[0.72, 0.12, 0.54]} /></mesh>
      {[[-0.31, -0.22], [0.31, -0.22], [-0.31, 0.22], [0.31, 0.22]].map(([x, z], i) => <mesh key={i} position={[x, 0.125, z]} material={m.chrome}><cylinderGeometry args={[0.014, 0.014, 0.02, 6]} /></mesh>)}
      <mesh position={[0, H0 + BH / 2, 0]} geometry={pumpGeo()} material={m.body} castShadow receiveShadow />
      <mesh position={[0, H0 + BH + 0.04, 0]} geometry={capGeo()} material={m.trim} castShadow />
      {/* the faces (front and back) */}
      <mesh position={[0, H0 + BH / 2, FZ]} material={faceMat}><planeGeometry args={[0.5, 1.4]} /></mesh>
      <mesh position={[0, H0 + BH / 2, -FZ]} rotation-y={Math.PI} material={faceMat}><planeGeometry args={[0.5, 1.4]} /></mesh>
      {/* the computing head's chrome bezel and its glass (both faces), standing proud of the cabinet */}
      {[1, -1].map((sd) => (
        <group key={sd} position={[0, dY, sd * (FZ + 0.012)]} rotation-y={sd > 0 ? 0 : Math.PI}>
          {[dH / 2 + 0.012, -dH / 2 - 0.012].map((y, i) => <mesh key={i} position={[0, y, 0]} material={m.chrome}><boxGeometry args={[dW + 0.05, 0.024, 0.03]} /></mesh>)}
          {[-1, 1].map((q) => <mesh key={q} position={[q * (dW / 2 + 0.012), 0, 0]} material={m.chrome}><boxGeometry args={[0.024, dH + 0.048, 0.03]} /></mesh>)}
          <mesh position={[0, 0, 0.004]} material={glass} renderOrder={3}><planeGeometry args={[dW, dH]} /></mesh>
        </group>
      ))}
      {/* chrome strips down the corners */}
      {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.3, 0.9, 0.2]} material={m.ring}><boxGeometry args={[0.02, 1.4, 0.02]} /></mesh>)}
      {/* the hose outlet, the hose, the nozzle boot on the right side with the nozzle hanging in it, the on/off lever above */}
      <mesh position={[0.31, 1.42, -0.06]} rotation-z={Math.PI / 2} material={m.chrome}><cylinderGeometry args={[0.03, 0.03, 0.05, 12]} /></mesh>
      <mesh geometry={hose} material={m.hose} castShadow />
      <mesh position={[0.335, 0.97, 0.06]} material={m.trim}><boxGeometry args={[0.05, 0.2, 0.13]} /></mesh>
      <group position={[0.37, 0.9, 0.07]} rotation={[0, 0, -1.15]}>
        <mesh geometry={nz.body} material={m.chrome} castShadow />
        <mesh geometry={nz.spout} material={m.chrome} />
        <mesh geometry={nz.grip} material={m.hose} />
        <mesh geometry={nz.guard} material={m.chrome} />
        <mesh geometry={nz.lever} material={m.chrome} />
      </group>
      <group position={[0.335, 1.15, 0.06]} rotation-z={-0.4}>
        <mesh position={[0.03, 0.06, 0]} material={m.chrome}><boxGeometry args={[0.018, 0.14, 0.018]} /></mesh>
        <mesh position={[0.05, 0.13, 0]} material={m.hose}><sphereGeometry args={[0.018, 10, 8]} /></mesh>
      </group>
      {/* the lamp housing, a cap of snow on it, the globe's collar and the globe */}
      <mesh position={[0, H0 + BH + 0.1, 0]} material={m.trim}><boxGeometry args={[0.5, 0.06, 0.34]} /></mesh>
      <mesh position={[-0.12, H0 + BH + 0.13, -0.06]} material={snow} scale={[1, 0.22, 0.8]}><sphereGeometry args={[0.13, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
      <mesh position={[0, 1.83, 0]} material={m.ring}><cylinderGeometry args={[0.07, 0.11, 0.07, 18]} /></mesh>
      <group position={[0, 2.04, 0]}>
        <mesh geometry={globeBody()} material={gbm} />
        <mesh position={[0, 0, 0.101]} geometry={GLOBE_LENS} material={lensMat} />
        <mesh position={[0, 0, -0.101]} rotation-y={Math.PI} geometry={GLOBE_LENS} material={lensMat} />
        <mesh material={m.ring} scale={[1, 0.95, 1]}><torusGeometry args={[0.2, 0.016, 8, 40]} /></mesh>
        {[1, -1].map((sd) => <mesh key={sd} position={[0, 0, sd * 0.1]} material={m.ring}><torusGeometry args={[0.163, 0.008, 6, 36]} /></mesh>)}
      </group>
      <Glow position={[0, 2.04, 0.12]} size={1.1} color="#FFE2B0" opacity={0.4 * lit} />
    </group>
  );
};
// ── the oil-can rack: a black wire rack, three shelves of quart cans (labels in plain words) ──────────────────────────────────
const canTex = (k) => canvasTex("b_oilcan" + k, 512, 256, (c, w, h) => {
  const bands = [["#1F3A63", "#D9DEE6"], ["#2E4F3A", "#E6E1C8"], ["#5E2A22", "#E9E4D8"]][k];
  c.fillStyle = bands[1]; c.fillRect(0, 0, w, h);
  c.fillStyle = bands[0]; c.fillRect(0, h * 0.18, w, h * 0.5);
  for (const cx of [w * 0.25, w * 0.75]) {
    ctext(c, "MOTOR OIL", cx, h * 0.34, F(700, 44, SIGNF), "#FFFFFF", w * 0.45);
    ctext(c, ["SAE 30", "SAE 20", "SAE 10W"][k], cx, h * 0.56, F(800, 34), "#FFFFFF");
    ctext(c, "ONE U.S. QUART", cx, h * 0.82, F(700, 22), "#20242A");
  }
  c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(0, 0, w, 8); c.fillRect(0, h - 8, w, 8);
});
export const OilRack = ({ position, ry = 0 }) => {
  const mats = useMemo(() => ({
    wire: new THREE.MeshStandardMaterial({ color: "#1A1D22", roughness: 0.5, metalness: 0.6 }),
    cans: [0, 1, 2].map((k) => [new THREE.MeshStandardMaterial({ map: canTex(k), roughness: 0.35, metalness: 0.4 }), new THREE.MeshStandardMaterial({ color: "#B9C0C8", roughness: 0.3, metalness: 0.9 })])
  }), []);
  const can = useMemo(() => new THREE.CylinderGeometry(0.05, 0.05, 0.14, 20), []);
  return (
    <group position={position} rotation-y={ry}>
      {[[-0.4, -0.13], [0.4, -0.13], [-0.4, 0.13], [0.4, 0.13]].map(([x, z], i) => <mesh key={i} position={[x, 0.6, z]} material={mats.wire} castShadow><cylinderGeometry args={[0.012, 0.012, 1.2, 6]} /></mesh>)}
      {[0.3, 0.65, 1.0].map((y, s) => (
        <group key={y} position={[0, y, 0]}>
          <mesh material={mats.wire}><boxGeometry args={[0.84, 0.012, 0.3]} /></mesh>
          {[-0.12, 0.12].map((z) => <mesh key={z} position={[0, 0.07, z + Math.sign(z) * 0.03]} material={mats.wire}><boxGeometry args={[0.84, 0.01, 0.01]} /></mesh>)}
          {Array.from({ length: 14 }, (_, i) => {
            const x = -0.36 + (i % 7) * 0.12, z = i < 7 ? 0.065 : -0.065, k = (s + (i % 3 === 0 ? 1 : 0)) % 3;
            return <mesh key={i} geometry={can} material={[mats.cans[k][0], mats.cans[k][1], mats.cans[k][1]]} position={[x, 0.076, z]} rotation-y={-Math.PI / 2 + (rnd(i + s * 20) - 0.5) * 0.5} castShadow />;
          })}
        </group>
      ))}
      {/* the rack's header card */}
      <mesh position={[0, 1.27, 0.0]} material={mats.wire}><boxGeometry args={[0.86, 0.14, 0.02]} /></mesh>
      <mesh position={[0, 1.27, 0.012]}><planeGeometry args={[0.82, 0.12]} /><meshStandardMaterial map={rackCardTex()} roughness={0.5} /></mesh>
    </group>
  );
};
const rackCardTex = () => canvasTex("b_rackcard", 512, 80, (c, w, h) => { c.fillStyle = "#E9E4D6"; c.fillRect(0, 0, w, h); ctext(c, "MOTOR OIL", w / 2, h / 2 + 2, F(700, 52, SIGNF), "#1F3A63"); });
// ── tires: a lathe of the tyre's section with a tread band ──────────────────────────────────────────────────────────────
const treadTex = () => { const t = canvasTex("b_tread", 512, 64, (c, w, h) => { c.fillStyle = "#26282C"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { c.fillStyle = "#0E0F11"; c.fillRect(x, 0, 6, h * 0.45); c.fillRect(x + 8, h * 0.55, 6, h * 0.45); } c.fillStyle = "#0E0F11"; c.fillRect(0, h * 0.47, w, 4); }); t.wrapS = THREE.RepeatWrapping; t.repeat.set(4, 1); return t; };
let TG = null;
const tireGeo = () => TG ??= (() => {
  const R0 = 0.19, R1 = 0.33, W = 0.19;
  const prof = [[R0, -W * 0.42], [R0 + 0.03, -W * 0.5], [R1 - 0.03, -W * 0.5], [R1, -W * 0.38], [R1 + 0.006, 0], [R1, W * 0.38], [R1 - 0.03, W * 0.5], [R0 + 0.03, W * 0.5], [R0, W * 0.42]];
  const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 40);
  return g;
})();
export const Tire = ({ position, rotation = [0, 0, 0] }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2A2C30", roughness: 0.78, metalness: 0.0, map: treadTex() }), []);
  return <mesh geometry={tireGeo()} material={mat} position={position} rotation={rotation} castShadow receiveShadow />;
};
// ── the station's signage ─────────────────────────────────────────────────────────────────────────────────────────────────
/** fit a line of text into a box (maxW × maxH of INK, measured): returns the font size */
export const fitText = (c, s, family, weight, maxW, maxH, start = 400) => {
  let px = start;
  for (let k = 0; k < 60; k++) {
    c.font = `${weight} ${px}px ${family}`;
    const m = c.measureText(s), wd = m.actualBoundingBoxLeft + m.actualBoundingBoxRight, ht = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    if (wd <= maxW && ht <= maxH) return { px, ascent: m.actualBoundingBoxAscent, descent: m.actualBoundingBoxDescent };
    px *= 0.96;
  }
  return { px, ascent: px * 0.7, descent: 0 };
};
/** draw a line of text with its INK centred in the box [x0,y0,x1,y1] (never touching its edges) */
export const boxText = (c, s, family, weight, box, color, pad = 0.12) => {
  const [x0, y0, x1, y1] = box, bw = x1 - x0, bh = y1 - y0;
  const f = fitText(c, s, family, weight, bw * (1 - 2 * pad), bh * (1 - 2 * pad), bh * 1.6);
  c.font = `${weight} ${f.px}px ${family}`; c.fillStyle = color; c.textAlign = "center"; c.textBaseline = "alphabetic";
  const inkH = f.ascent + f.descent, base = y0 + (bh - inkH) / 2 + f.ascent;
  c.fillText(s, (x0 + x1) / 2, base);
};
/** the fascia sign (Timur, 2026-11-27: "make sure the text on the service station doesn't overlap"): a porcelain-enamel panel in a
 *  steel frame, two lettered BANDS separated by a rule; each line is fitted INSIDE its own band with margins (measured ink, not a
 *  guessed size), so nothing touches the border, the rule or the other line. 2048 × 768 for a 4.0 × 1.5 m panel. */
export const SIGN_BANDS = { top: [150, 86, 1898, 452], rule: 486, bottom: [300, 520, 1748, 682] };
export const stationSignTex = () => canvasTex("e_haviland_sign_v3", 2048, 768, (c, w, h) => {
  // the enamel: a navy rim, the cream field with a faint gloss band, an inner pinstripe
  c.fillStyle = "#16294A"; c.fillRect(0, 0, w, h);
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#F7F4EA"); g.addColorStop(0.45, "#EFEBDF"); g.addColorStop(1, "#E3DED0");
  c.fillStyle = g; c.beginPath(); c.roundRect(30, 30, w - 60, h - 60, 26); c.fill();
  c.strokeStyle = "#16294A"; c.lineWidth = 7; c.beginPath(); c.roundRect(58, 58, w - 116, h - 116, 16); c.stroke();
  // the two bands and the rule between them (the rule is its own band: no letter reaches it)
  boxText(c, "HAVILAND'S", SIGNF, 700, SIGN_BANDS.top, "#16294A", 0.07);
  c.fillStyle = "#9E2B25"; c.fillRect(w * 0.2, SIGN_BANDS.rule - 5, w * 0.6, 10);
  for (const x of [w * 0.2 - 18, w * 0.8 + 18]) { c.beginPath(); c.arc(x, SIGN_BANDS.rule, 9, 0, 7); c.fill(); }
  boxText(c, "SERVICE STATION", SIGNF, 600, SIGN_BANDS.bottom, "#16294A", 0.1);
  // porcelain: fine crazing, chips at the edges showing dark steel, grime along the bottom
  for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(90,80,60,${rnd(i) * 0.05})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 3, 2); }
  for (let i = 0; i < 14; i++) { const x = rnd(i * 5) < 0.5 ? 34 + rnd(i) * 20 : w - 54 + rnd(i) * 20, y = 80 + rnd(i * 3) * (h - 160); c.fillStyle = "#2A2E36"; c.beginPath(); c.ellipse(x, y, 6 + rnd(i + 2) * 8, 4 + rnd(i + 4) * 6, rnd(i) * 3, 0, 7); c.fill(); }
  const gr = c.createLinearGradient(0, h - 90, 0, h - 30); gr.addColorStop(0, "rgba(70,60,40,0)"); gr.addColorStop(1, "rgba(70,60,40,0.12)"); c.fillStyle = gr; c.fillRect(30, h - 90, w - 60, 60);
  // the mounting bolts (in the rim, clear of the lettering), a little rust weeping from each
  for (const [x, y] of [[44, 44], [w - 44, 44], [44, h - 44], [w - 44, h - 44], [w / 2, 44], [w / 2, h - 44]]) { c.fillStyle = "#5E5A52"; c.beginPath(); c.arc(x, y, 8, 0, 7); c.fill(); c.fillStyle = "rgba(255,255,255,0.35)"; c.beginPath(); c.arc(x - 2, y - 2, 3, 0, 7); c.fill(); }
});
/** the pole sign by the road: a double-faced lighted box — HAVILAND'S over a band GAS · OIL · REPAIRS, each in its own panel */
export const poleSignTex = () => canvasTex("e_pole_sign_v1", 1024, 640, (c, w, h) => {
  c.fillStyle = "#16294A"; c.fillRect(0, 0, w, h);
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#FBF8EE"); g.addColorStop(1, "#ECE6D6");
  c.fillStyle = g; c.beginPath(); c.roundRect(24, 24, w - 48, 380, 18); c.fill();
  boxText(c, "HAVILAND'S", SIGNF, 700, [48, 40, w - 48, 388], "#16294A", 0.08);
  c.fillStyle = "#9E2B25"; c.beginPath(); c.roundRect(24, 428, w - 48, 188, 18); c.fill();
  boxText(c, "GAS · OIL · REPAIRS", SIGNF, 600, [48, 440, w - 48, 604], "#F7F4EA", 0.14);
  for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(80,70,50,${rnd(i) * 0.05})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
});
/** a small hanging tin sign: OPEN */
export const openSignTex = () => canvasTex("b_open", 512, 256, (c, w, h) => {
  c.fillStyle = "#F2EFE6"; c.beginPath(); c.roundRect(8, 8, w - 16, h - 16, 18); c.fill();
  c.strokeStyle = "#8E2A26"; c.lineWidth = 10; c.beginPath(); c.roundRect(24, 24, w - 48, h - 48, 12); c.stroke();
  ctext(c, "OPEN", w / 2, h / 2 + 6, F(700, 150, SIGNF), "#8E2A26");
});
/** the lit office seen through the plate window: a counter, a register, shelves of oil and parts, a wall clock, a calendar, maps */
export const officeTex = () => canvasTex("b_office", 1024, 640, (c, w, h) => {
  const g = c.createRadialGradient(w * 0.45, h * 0.1, 10, w * 0.5, h * 0.4, w * 0.8); g.addColorStop(0, "#FFF0CC"); g.addColorStop(0.35, "#E8B878"); g.addColorStop(1, "#6E4A2C");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(255,248,230,0.95)"; c.fillRect(w * 0.3, 8, w * 0.3, 10);                 // the ceiling fixture
  // shelves of quart cans along the back wall
  for (let r = 0; r < 3; r++) {
    const y = 120 + r * 92;
    c.fillStyle = "rgba(70,46,28,0.9)"; c.fillRect(40, y + 64, w * 0.48, 8);
    for (let k = 0; k < 16; k++) { c.fillStyle = ["#1F3A63", "#2E4F3A", "#5E2A22", "#C9B26A"][(k + r) % 4]; c.fillRect(48 + k * 30, y + 18, 24, 46); c.fillStyle = "rgba(255,255,255,0.5)"; c.fillRect(48 + k * 30, y + 30, 24, 6); }
  }
  // the wall clock
  c.fillStyle = "#F7F2E6"; c.beginPath(); c.arc(w * 0.72, 120, 46, 0, 7); c.fill(); c.strokeStyle = "#2A2A2A"; c.lineWidth = 6; c.stroke();
  c.lineWidth = 5; c.beginPath(); c.moveTo(w * 0.72, 120); c.lineTo(w * 0.72 + 22, 104); c.moveTo(w * 0.72, 120); c.lineTo(w * 0.72 - 4, 86); c.stroke();
  // a road-map rack with folded maps
  c.fillStyle = "#3A3E44"; c.fillRect(w * 0.82, 170, 120, 200);
  for (let k = 0; k < 4; k++) { c.fillStyle = ["#E8E2D0", "#D8E2EE", "#EEDFC8", "#DDE6DA"][k]; c.fillRect(w * 0.82 + 10, 182 + k * 46, 100, 38); c.fillStyle = "#1A2F52"; c.font = F(800, 14); c.textAlign = "center"; c.fillText(["VERMONT", "NEW HAMPSHIRE", "MASSACHUSETTS", "NEW ENGLAND"][k], w * 0.82 + 60, 206 + k * 46); }
  c.fillStyle = "#F2EFE6"; c.font = F(800, 20); c.fillText("ROAD MAPS", w * 0.82 + 60, 164);
  // the counter with a cash register, a coffee pot on a hot plate
  c.fillStyle = "#4A3424"; c.fillRect(0, h * 0.66, w, h * 0.34);
  c.fillStyle = "#6A4A30"; c.fillRect(0, h * 0.64, w, 14);
  c.fillStyle = "#8C939C"; c.fillRect(w * 0.18, h * 0.5, 150, 86); c.fillStyle = "#5E656E"; c.fillRect(w * 0.18 + 20, h * 0.44, 110, 34); c.fillStyle = "#1A1C20"; for (let k = 0; k < 12; k++) c.fillRect(w * 0.18 + 14 + (k % 6) * 22, h * 0.53 + Math.floor(k / 6) * 20, 16, 14);
  c.fillStyle = "#2A2C30"; c.fillRect(w * 0.6, h * 0.55, 60, 70); c.fillStyle = "#C9D2DC"; c.beginPath(); c.arc(w * 0.6 + 30, h * 0.53, 22, 0, 7); c.fill();
  // a stool
  c.fillStyle = "#2A2420"; c.fillRect(w * 0.42, h * 0.72, 10, h * 0.28); c.fillStyle = "#8E2A26"; c.beginPath(); c.ellipse(w * 0.42 + 5, h * 0.72, 40, 12, 0, 0, 7); c.fill();
});
/** the overhead sectional door of the service bay: four rows of panels, a row of lights (lit from inside) */
export const bayDoorTex = (emissive = false) => canvasTex("b_baydoor" + (emissive ? "E" : ""), 1024, 1024, (c, w, h) => {
  c.fillStyle = emissive ? "#000" : "#D9D7CF"; c.fillRect(0, 0, w, h);
  const rows = 4, rh = h / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rh;
    if (!emissive) { c.fillStyle = "rgba(0,0,0,0.35)"; c.fillRect(0, y + rh - 5, w, 5); c.fillStyle = "rgba(255,255,255,0.4)"; c.fillRect(0, y + rh, w, 3); }
    for (let k = 0; k < 4; k++) {
      const x = 30 + k * (w - 60) / 4, pw = (w - 60) / 4 - 24;
      if (r === 1) {
        const g = c.createLinearGradient(0, y + 30, 0, y + rh - 30); g.addColorStop(0, "#FFE7B8"); g.addColorStop(1, "#D6964E");
        c.fillStyle = g; c.fillRect(x + 12, y + 30, pw, rh - 60);
        if (!emissive) { c.fillStyle = "rgba(60,40,24,0.55)"; c.fillRect(x + 12 + pw * 0.2, y + rh * 0.55, pw * 0.4, rh * 0.25); c.fillStyle = "rgba(255,255,255,0.18)"; c.fillRect(x + 12, y + 30, pw * 0.25, rh - 60); }
      } else if (!emissive) {
        const g = c.createLinearGradient(x, y, x + pw, y + rh); g.addColorStop(0, "rgba(255,255,255,0.25)"); g.addColorStop(1, "rgba(0,0,0,0.22)");
        c.fillStyle = g; c.fillRect(x + 12, y + 26, pw, rh - 52); c.fillStyle = "#D2D0C8"; c.fillRect(x + 20, y + 34, pw - 16, rh - 68);
      }
    }
  }
  if (!emissive) {
    c.fillStyle = "#3A3E44"; c.fillRect(w / 2 - 50, h - 70, 100, 24);           // the lift handle
    for (let i = 0; i < 600; i++) { c.fillStyle = `rgba(70,62,50,${rnd(i) * 0.12})`; c.fillRect(rnd(i + 1) * w, h - rnd(i + 2) * 220, 4 + rnd(i) * 10, 2); }
  }
});
