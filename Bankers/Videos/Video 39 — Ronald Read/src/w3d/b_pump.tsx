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
// the globe: milk glass with the grade lettered on both faces of the band
const globeTex = (grade, accent) => canvasTex("b_globe_" + grade, 1024, 512, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.5, "#FFF8EA"); g.addColorStop(1, "#F0E6D2"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = accent; c.fillRect(0, h * 0.38, w, h * 0.24);
  c.fillStyle = "#FFFFFF"; c.fillRect(0, h * 0.38, w, 6); c.fillRect(0, h * 0.62 - 6, w, 6);
  for (const cx of [w * 0.25, w * 0.75]) ctext(c, grade, cx, h * 0.5, F(700, 80, SIGNF), "#FFFFFF", w * 0.4);
});
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
/** one gas pump standing on the island (front face toward +z); its hose hangs on the right side into the nozzle holster */
export const GasPump = ({ position, ry = 0, grade = "REGULAR", accent = "#1F3A63", lit = 1 }) => {
  const m = pumpMats();
  const face = useMemo(() => pumpFaceTex(grade, accent), [grade]);
  const glb = useMemo(() => globeTex(grade, accent), [grade]);
  const faceMat = useMemo(() => new THREE.MeshStandardMaterial({ map: face, roughness: 0.3, metalness: 0.05 }), [face]);
  const globeMat = useMemo(() => new THREE.MeshStandardMaterial({ map: glb, emissiveMap: glb, emissive: "#FFE9C8", emissiveIntensity: 0.9 * lit, roughness: 0.25 }), [glb]);
  const hose = useMemo(() => {
    const pts = [[0.32, 1.45, 0.02], [0.4, 1.25, 0.12], [0.43, 0.7, 0.2], [0.42, 0.42, 0.18], [0.38, 0.5, 0.06], [0.37, 0.92, 0.02]].map((p) => new THREE.Vector3(...p));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.018, 8, false);
  }, []);
  return (
    <group position={position} rotation-y={ry}>
      <mesh position={[0, 0.06, 0]} material={m.base} castShadow receiveShadow><boxGeometry args={[0.72, 0.12, 0.54]} /></mesh>
      <mesh position={[0, 0.12 + 0.775, 0]} geometry={pumpGeo()} material={m.body} castShadow receiveShadow />
      <mesh position={[0, 0.12 + 1.55 + 0.04, 0]} geometry={capGeo()} material={m.trim} castShadow />
      {/* the face (front and back) */}
      <mesh position={[0, 0.12 + 0.775, 0.2225]} material={faceMat}><planeGeometry args={[0.5, 1.4]} /></mesh>
      <mesh position={[0, 0.12 + 0.775, -0.2225]} rotation-y={Math.PI} material={faceMat}><planeGeometry args={[0.5, 1.4]} /></mesh>
      {/* chrome strips down the corners */}
      {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.3, 0.9, 0.2]} material={m.ring}><boxGeometry args={[0.02, 1.4, 0.02]} /></mesh>)}
      {/* the nozzle holster on the right side, the nozzle in it, the hose */}
      <mesh position={[0.33, 0.95, 0.02]} material={m.trim}><boxGeometry args={[0.06, 0.2, 0.12]} /></mesh>
      <group position={[0.37, 0.98, 0.02]} rotation-z={-0.35}>
        <mesh material={m.chrome}><cylinderGeometry args={[0.022, 0.026, 0.16, 10]} /></mesh>
        <mesh position={[0.0, -0.13, 0]} rotation-z={0.5} material={m.chrome}><cylinderGeometry args={[0.012, 0.012, 0.14, 8]} /></mesh>
        <mesh position={[0.05, 0.02, 0]} material={m.hose}><boxGeometry args={[0.07, 0.03, 0.03]} /></mesh>
      </group>
      <mesh geometry={hose} material={m.hose} castShadow />
      {/* the globe: a ring base, the milk-glass ball */}
      <mesh position={[0, 1.78, 0]} material={m.ring}><cylinderGeometry args={[0.09, 0.12, 0.08, 18]} /></mesh>
      <mesh position={[0, 2.0, 0]} material={globeMat}><sphereGeometry args={[0.2, 32, 20]} /></mesh>
      <mesh position={[0, 2.2, 0]} material={m.ring}><cylinderGeometry args={[0.05, 0.06, 0.03, 14]} /></mesh>
      <Glow position={[0, 2.0, 0]} size={1.1} color="#FFE2B0" opacity={0.42 * lit} />
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
/** the fascia sign: HAVILAND'S / SERVICE STATION in plain type, white porcelain enamel with navy letters and a navy edge */
export const stationSignTex = () => canvasTex("b_haviland_sign_v2", 2048, 768, (c, w, h) => {
  c.fillStyle = "#1A2F52"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#F2EFE6"; c.beginPath(); c.roundRect(26, 26, w - 52, h - 52, 22); c.fill();
  c.strokeStyle = "#1A2F52"; c.lineWidth = 8; c.beginPath(); c.roundRect(52, 52, w - 104, h - 104, 14); c.stroke();
  ctext(c, "HAVILAND'S", w / 2, h * 0.39, F(700, 300, SIGNF), "#1A2F52", w - 200);
  c.fillStyle = "#1A2F52"; c.fillRect(w * 0.14, h * 0.63, w * 0.72, 8);
  ctext(c, "SERVICE STATION", w / 2, h * 0.77, F(600, 132, SIGNF), "#1A2F52", w - 260);
  for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(90,80,60,${rnd(i) * 0.06})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 3, 2); }
  // rust weeping from the mounting bolts
  for (const [x, y] of [[90, 90], [w - 90, 90], [90, h - 90], [w - 90, h - 90]]) { c.fillStyle = "#6E6A62"; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); c.fillStyle = "rgba(120,70,40,0.25)"; c.fillRect(x - 3, y + 8, 6, 40); }
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
