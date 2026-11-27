// @ts-nocheck
// ★ V39 builder C — THE DINER'S TABLEWARE AND FOOD (detail pass 2026-11-27, station `diner`): generic diner food — nothing on screen
//   claims what Ronald Read ate. Metres, y up, every piece sits on y 0 of its own group.
//   · shaped flatware (extruded outlines: a table knife with its bolster and rounded tip, a four-tine fork, a teaspoon)
//   · the remaining HALF of a cut cheeseburger: sesame top bun, lettuce frill, tomato, melted cheese drooping over a charred patty,
//     the bottom bun; the cut face shows the layers (a painted cross-section) and a bite out of its corner
//   · steak fries in a heap and a few strays, a pickle spear, a paper cup of ketchup and a smear, crumbs
//   · a diner mug with a real loop handle and a coffee surface (meniscus ring, a highlight), the spoon on a saucer-less table
//   · ribbed water glasses with ice cubes, a meniscus, beads of condensation and the bright refraction streaks of a lit glass
//   · a chrome wire condiment caddy: squeeze bottles of ketchup and mustard (generic labels), a sugar-packet holder with packets
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { SANSF } from "./c_tex";

// ── flatware ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const flat = (shape, t) => new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: true, bevelThickness: t * 0.35, bevelSize: t * 0.35, bevelSegments: 2, curveSegments: 12 }).rotateX(-Math.PI / 2).translate(0, t * 0.35, 0);
/** a table knife lying flat, along +x from its handle end (x 0) to its tip (x 0.215) */
export const knifeGeo = () => {
  const s = new THREE.Shape();
  s.moveTo(0, -0.0075); s.quadraticCurveTo(-0.004, 0, 0, 0.0075);                // the handle's rounded butt
  s.lineTo(0.098, 0.0068); s.lineTo(0.106, 0.0055); s.lineTo(0.112, 0.0062);       // the handle, the bolster
  s.lineTo(0.2, 0.0098); s.quadraticCurveTo(0.218, 0.009, 0.216, -0.002);           // the blade's spine to its round tip
  s.quadraticCurveTo(0.21, -0.008, 0.19, -0.0085); s.lineTo(0.112, -0.0058);       // the edge
  s.lineTo(0.106, -0.0052); s.lineTo(0.098, -0.0068); s.closePath();
  return flat(s, 0.0016);
};
/** a dinner fork lying flat, handle end at x 0, tines toward +x (to x 0.19) */
export const forkGeo = () => {
  const s = new THREE.Shape();
  s.moveTo(0, -0.008); s.quadraticCurveTo(-0.005, 0, 0, 0.008);
  s.lineTo(0.09, 0.0058); s.quadraticCurveTo(0.11, 0.0032, 0.122, 0.0035);         // the handle narrowing to the neck
  s.quadraticCurveTo(0.135, 0.0105, 0.14, 0.0122);                                  // the shoulder
  const tines = 4, w = 0.0244, tw = 0.0034, gap = (w - tines * tw) / (tines - 1);
  let y = 0.0122;
  for (let k = 0; k < tines; k++) {
    s.lineTo(0.188 - (k === 0 ? 0.002 : 0), y); s.quadraticCurveTo(0.19, y - tw / 2, 0.188, y - tw);
    y -= tw;
    if (k < tines - 1) { s.lineTo(0.152, y); s.quadraticCurveTo(0.149, y - gap / 2, 0.152, y - gap); y -= gap; }
  }
  s.quadraticCurveTo(0.135, -0.0105, 0.122, -0.0035); s.quadraticCurveTo(0.11, -0.0032, 0.09, -0.0058); s.closePath();
  return flat(s, 0.0015);
};
/** a teaspoon's handle (flat) and its bowl (a shallow scaled sphere) */
export const spoonHandleGeo = () => {
  const s = new THREE.Shape();
  s.moveTo(0, -0.0055); s.quadraticCurveTo(-0.0045, 0, 0, 0.0055); s.lineTo(0.08, 0.0035); s.quadraticCurveTo(0.1, 0.0022, 0.112, 0.0028);
  s.lineTo(0.112, -0.0028); s.quadraticCurveTo(0.1, -0.0022, 0.08, -0.0035); s.closePath();
  return flat(s, 0.0014);
};
export const Spoon = ({ chrome, position, ry = 0 }) => {
  const g = useMemo(spoonHandleGeo, []);
  return (
    <group position={position} rotation-y={ry}>
      <mesh geometry={g} material={chrome} castShadow />
      <mesh position={[0.128, 0.0035, 0]} scale={[1.28, 0.22, 0.9]} material={chrome} castShadow><sphereGeometry args={[0.0165, 24, 12]} /></mesh>
    </group>
  );
};

// ── food textures ─────────────────────────────────────────────────────────────────────────────────────────────────────
const bunTopDraw = (c, w, h) => {   // the crown (lathe UV: u round, v up): glossy egg-washed brown deepening to the top, a pale base band, sesame
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#E9C48A"); g.addColorStop(0.12, "#D49A52"); g.addColorStop(0.45, "#B4692A"); g.addColorStop(1, "#8A4818");   // (rendered: canvas bottom = the crown's top)
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 5000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "70,30,8" : "255,225,170"},${0.04 + rnd(i + 1) * 0.07})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2 + rnd(i) * 4, 1 + rnd(i + 4) * 2); }
  for (let i = 0; i < 26; i++) { const x = rnd(i * 9) * w, y = rnd(i * 4) * h * 0.85; const gg = c.createRadialGradient(x, y, 0, x, y, 30); gg.addColorStop(0, "rgba(255,235,200,0.18)"); gg.addColorStop(1, "rgba(255,235,200,0)"); c.fillStyle = gg; c.fillRect(x - 30, y - 30, 60, 60); }
  for (let i = 0; i < 150; i++) {   // sesame seeds: teardrops, a shadow under each, denser toward the top (y small)
    const x = rnd(i * 3) * w, y = h - Math.pow(rnd(i * 5 + 1), 1.3) * h * 0.8, a = rnd(i + 7) * 3.14;
    c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = "rgba(90,45,10,0.45)"; c.beginPath(); c.ellipse(1.2, 1.4, 5.2, 2.6, 0, 0, Math.PI * 2); c.fill();
    const sg = c.createLinearGradient(-5, -2, 5, 2); sg.addColorStop(0, "#FFF6DE"); sg.addColorStop(1, "#E2CC98"); c.fillStyle = sg; c.beginPath(); c.moveTo(-5, 0); c.quadraticCurveTo(0, -3.2, 5.5, 0); c.quadraticCurveTo(0, 3.2, -5, 0); c.fill(); c.restore();
  }
};
const crustDraw = (c, w, h) => {   // the heel's side and underside: toasted crust, a pale crumb line at the top (the cut face shows a little)
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#EED7A8"); g.addColorStop(0.18, "#D6A060"); g.addColorStop(1, "#B57434");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "90,50,15" : "255,230,180"},${0.05 + rnd(i + 1) * 0.08})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2, 2); }
};
const pattyDraw = (c, w, h) => {   // seared ground beef: a dark crust, crumbly texture, browned flecks, a sheen of fat
  c.fillStyle = "#4A2614"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { const v = rnd(i); c.fillStyle = v < 0.35 ? `rgba(18,7,2,${0.25 + rnd(i + 1) * 0.45})` : v < 0.75 ? `rgba(118,58,28,${0.2 + rnd(i + 1) * 0.35})` : v < 0.93 ? `rgba(160,92,52,0.35)` : "rgba(230,170,120,0.35)"; c.beginPath(); c.ellipse(rnd(i + 2) * w, rnd(i + 3) * h, 1 + rnd(i + 4) * 3.5, 1 + rnd(i + 5) * 2.5, rnd(i) * 3, 0, Math.PI * 2); c.fill(); }
};
const leafDraw = (c, w, h) => {   // a lettuce leaf's frilled edge: pale ribbed green with veins
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#C9E58A"); g.addColorStop(1, "#6EA238"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 18) { c.strokeStyle = "rgba(240,255,210,0.5)"; c.lineWidth = 2; c.beginPath(); c.moveTo(x, h); c.quadraticCurveTo(x + 6, h / 2, x - 4, 0); c.stroke(); }
};
const tomatoDraw = (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#D8452C"); g.addColorStop(0.5, "#F07A50"); g.addColorStop(1, "#C3301C"); c.fillStyle = g; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 40) { c.fillStyle = "rgba(250,200,90,0.6)"; c.beginPath(); c.ellipse(x + 20, h / 2, 6, h * 0.22, 0, 0, Math.PI * 2); c.fill(); } };
// a steak fry: u along its length, v round its section; golden flesh with browned ends and edges, skin along one side, salt
const fryDraw = (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "#6E3C0C"); g.addColorStop(0.06, "#B8752A"); g.addColorStop(0.16, "#E1A850"); g.addColorStop(0.5, "#EAB862"); g.addColorStop(0.84, "#DFA64C"); g.addColorStop(0.94, "#B06E24"); g.addColorStop(1, "#6A380C");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  // the potato's skin along one long side (v 0.62 … 0.86): brown, papery, with eyes
  const sk = c.createLinearGradient(0, h * 0.6, 0, h * 0.88); sk.addColorStop(0, "rgba(120,72,28,0)"); sk.addColorStop(0.15, "rgba(126,78,32,0.95)"); sk.addColorStop(0.85, "rgba(104,62,24,0.95)"); sk.addColorStop(1, "rgba(104,62,24,0)");
  c.fillStyle = sk; c.fillRect(0, h * 0.6, w, h * 0.28);
  for (let i = 0; i < 30; i++) { c.fillStyle = "rgba(60,32,10,0.6)"; c.beginPath(); c.ellipse(rnd(i * 3) * w, h * (0.64 + rnd(i) * 0.2), 2 + rnd(i + 1) * 4, 1.2, 0, 0, Math.PI * 2); c.fill(); }
  // browned edges between the faces, blisters, the cut's fine grain
  [0.12, 0.37, 0.6, 0.88].forEach((v) => { c.fillStyle = "rgba(140,76,18,0.6)"; c.fillRect(0, h * v - 4, w, 8); });
  for (let i = 0; i < 40; i++) { const x = rnd(i * 5 + 3) * w, y = rnd(i * 9 + 4) * h; const gg = c.createRadialGradient(x, y, 0, x, y, 14); gg.addColorStop(0, "rgba(150,80,20,0.45)"); gg.addColorStop(1, "rgba(150,80,20,0)"); c.fillStyle = gg; c.fillRect(x - 14, y - 14, 28, 28); }
  for (let i = 0; i < 700; i++) { c.fillStyle = `rgba(${rnd(i) < 0.6 ? "160,96,30" : "255,236,180"},${0.12 + rnd(i + 1) * 0.25})`; c.beginPath(); c.ellipse(rnd(i + 2) * w, rnd(i + 3) * h, 1 + rnd(i) * 4, 0.8 + rnd(i + 4) * 1.6, 0, 0, Math.PI * 2); c.fill(); }
  for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(255,255,255,${0.6 + rnd(i + 9) * 0.4})`; const x = rnd(i * 7 + 1) * w, y = rnd(i * 11 + 2) * h, s = 1 + rnd(i) * 1.6; c.fillRect(x, y, s, s); }   // salt
};
const fleshDraw = (c, w, h) => {   // a dill spear's cut face (x along the spear, y from the skin (0) to the core (h)): translucent flesh, seeds at the core
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#2F4A12"); g.addColorStop(0.07, "#6F8A2A"); g.addColorStop(0.16, "#B4C266"); g.addColorStop(0.5, "#CDD48A"); g.addColorStop(0.72, "#DADCA0"); g.addColorStop(1, "#C6C98A");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "250,255,225" : "110,130,45"},${0.08 + rnd(i + 1) * 0.14})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h * 0.7, 2 + rnd(i) * 8, 1); }
  // the seed cavity: a jelly band with seeds set in it, along the core
  const jg = c.createLinearGradient(0, h * 0.66, 0, h); jg.addColorStop(0, "rgba(220,226,170,0)"); jg.addColorStop(0.3, "rgba(236,238,196,0.9)"); jg.addColorStop(1, "rgba(214,220,160,0.9)"); c.fillStyle = jg; c.fillRect(0, h * 0.66, w, h * 0.34);
  for (let k = 0; k < 22; k++) { const x = w * (0.05 + k * 0.042) + (rnd(k) - 0.5) * 10, y = h * (0.8 + (rnd(k + 3) - 0.5) * 0.14), a = (rnd(k + 5) - 0.5) * 0.9;
    c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = "rgba(120,124,70,0.55)"; c.beginPath(); c.ellipse(1, 1.5, 8, 4.6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#F3F0D2"; c.beginPath(); c.ellipse(0, 0, 8, 4.4, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = "rgba(150,150,90,0.8)"; c.lineWidth = 1.2; c.stroke(); c.restore(); }
};
const skinDraw = (c, w, h) => {   // the cucumber's skin: dark glossy green, paler ridges along it, warts with dark tips
  c.fillStyle = "#2E4814"; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 14) { const g = c.createLinearGradient(0, y, 0, y + 14); g.addColorStop(0, "rgba(120,150,50,0)"); g.addColorStop(0.5, "rgba(130,160,60,0.4)"); g.addColorStop(1, "rgba(120,150,50,0)"); c.fillStyle = g; c.fillRect(0, y, w, 14); }
  for (let i = 0; i < 2000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "170,190,90" : "10,20,4"},0.15)`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 1); }
  for (let i = 0; i < 220; i++) { const x = rnd(i * 3) * w, y = rnd(i * 5) * h; c.fillStyle = "rgba(160,184,80,0.75)"; c.beginPath(); c.arc(x, y, 2 + rnd(i) * 2.5, 0, Math.PI * 2); c.fill(); c.fillStyle = "rgba(15,24,6,0.85)"; c.beginPath(); c.arc(x + 0.8, y + 0.8, 1, 0, Math.PI * 2); c.fill(); }
};

// ── a whole cheeseburger (centre of its footprint at y 0) ────────────────────────────────────────────────────────────
const CROWN = [[0, 0.036], [0.018, 0.0352], [0.032, 0.031], [0.042, 0.024], [0.049, 0.015], [0.0525, 0.007], [0.053, 0.002], [0.05, 0], [0, 0]];
const HEEL = [[0, 0], [0.044, 0], [0.049, 0.0025], [0.052, 0.008], [0.052, 0.016], [0.05, 0.019], [0, 0.019]];
export const Burger = ({ position, ry = 0 }) => {
  const g = useMemo(() => {
    const crown = new THREE.LatheGeometry(new THREE.SplineCurve(CROWN.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(24), 56);
    const heel = new THREE.LatheGeometry(HEEL.map(([r, y]) => new THREE.Vector2(r, y)), 56);
    // the patty: an irregular, slightly domed disc
    const patty = new THREE.CylinderGeometry(0.0545, 0.0555, 0.014, 64, 2); const pp = patty.attributes.position;
    for (let i = 0; i < pp.count; i++) { const x = pp.getX(i), z = pp.getZ(i), a = Math.atan2(z, x), r = Math.hypot(x, z); if (r > 0.03) { const k = 1 + 0.035 * Math.sin(a * 7 + 1) + 0.025 * Math.sin(a * 13 + 2) + 0.012 * Math.sin(a * 29); pp.setX(i, x * k); pp.setZ(i, z * k); } pp.setY(i, pp.getY(i) + (pp.getY(i) > 0 ? 0.0015 * (1 - r / 0.056) : 0)); }
    patty.computeVertexNormals();
    // the cheese: a square slice draped over the patty, its corners sagging down the sides
    const cheese = new THREE.PlaneGeometry(0.108, 0.108, 28, 28).rotateX(-Math.PI / 2).rotateY(0.4); const cp = cheese.attributes.position;
    for (let i = 0; i < cp.count; i++) { const x = cp.getX(i), z = cp.getZ(i), r = Math.hypot(x, z); if (r > 0.052) { const o = r - 0.052; cp.setY(i, -o * 1.6 - o * o * 10); const k = (0.0535 + o * 0.25) / r; cp.setX(i, x * k); cp.setZ(i, z * k); } }
    cheese.computeVertexNormals();
    const lettuce = new THREE.CylinderGeometry(0.057, 0.06, 0.008, 72, 2, true); const lp = lettuce.attributes.position;
    for (let i = 0; i < lp.count; i++) { const a = Math.atan2(lp.getZ(i), lp.getX(i)); lp.setY(i, lp.getY(i) + 0.003 * Math.sin(a * 23) + 0.002 * Math.sin(a * 9 + 1)); const k = 1 + 0.05 * Math.sin(a * 17) + 0.03 * Math.sin(a * 6); lp.setX(i, lp.getX(i) * k); lp.setZ(i, lp.getZ(i) * k); }
    lettuce.computeVertexNormals();
    return { crown, heel, patty, cheese, lettuce };
  }, []);
  const M = useMemo(() => ({
    crown: new THREE.MeshPhysicalMaterial({ map: (() => { const t = canvasTex("c_df_crown2", 1024, 256, bunTopDraw); return t; })(), color: "#A8744C", roughness: 0.5, clearcoat: 0.22, clearcoatRoughness: 0.5 }),
    heel: new THREE.MeshStandardMaterial({ map: canvasTex("c_df_heel", 512, 64, crustDraw), roughness: 0.75 }),
    patty: new THREE.MeshPhysicalMaterial({ map: canvasTex("c_df_patty2", 512, 512, pattyDraw), roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.5 }),
    cheese: new THREE.MeshPhysicalMaterial({ color: "#F7B53A", roughness: 0.25, clearcoat: 0.8, side: THREE.DoubleSide, emissive: "#7A3E00", emissiveIntensity: 0.2 }),
    lettuce: new THREE.MeshStandardMaterial({ map: canvasTex("c_df_leaf", 1024, 64, leafDraw), roughness: 0.5, side: THREE.DoubleSide }),
    tomato: new THREE.MeshPhysicalMaterial({ map: canvasTex("c_df_tomato", 512, 32, tomatoDraw), roughness: 0.25, clearcoat: 0.9 }),
  }), []);
  const yP = 0.019, yC = yP + 0.0145, yT = yC + 0.0035, yL = yT + 0.006;
  return (
    <group position={position} rotation-y={ry}>
      <mesh geometry={g.heel} material={M.heel} castShadow receiveShadow />
      <mesh geometry={g.patty} material={M.patty} position={[0, yP + 0.007, 0]} castShadow receiveShadow />
      <mesh geometry={g.cheese} material={M.cheese} position={[0, yC, 0]} castShadow />
      <mesh position={[0.004, yT, 0.002]} material={M.tomato} castShadow><cylinderGeometry args={[0.047, 0.047, 0.006, 40]} /></mesh>
      <mesh geometry={g.lettuce} material={M.lettuce} position={[0, yL, 0]} castShadow />
      <mesh geometry={g.crown} material={M.crown} position={[0, yL + 0.002, 0]} rotation-y={0.7} castShadow />
    </group>
  );
};

// ── a dill pickle spear: a quarter of a cucumber, rounded ends, lying on one cut face with the other facing up/out ──────
export const Pickle = ({ position, ry = 0, L = 0.095, R = 0.016 }) => {
  const g = useMemo(() => {
    const rho = (x) => R * Math.pow(Math.max(0, 1 - Math.pow(Math.abs((2 * x) / L), 5)), 0.2);
    const NX = 40, NA = 10, pos = [], uv = [], idx = [];
    for (let i = 0; i <= NX; i++) for (let j = 0; j <= NA; j++) {
      const x = -L / 2 + (L * i) / NX, phi = (j / NA) * (Math.PI / 2), bump = 1 + 0.07 * Math.sin(2 * phi) * Math.sin(x * 420 + j * 1.7) * Math.cos(x * 230 + j);
      const r = rho(x) * bump; pos.push(x, r * Math.cos(phi), -r * Math.sin(phi)); uv.push(i / NX, j / NA);
    }
    for (let i = 0; i < NX; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + NA + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const skin = new THREE.BufferGeometry(); skin.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); skin.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); skin.setIndex(idx); skin.computeVertexNormals();
    // the two cut faces: the outline (x, ρ(x)) — UV v 0 at the skin, 1 at the core
    const sh = new THREE.Shape(); sh.moveTo(-L / 2, 0); for (let i = 0; i <= NX; i++) { const x = -L / 2 + (L * i) / NX; sh.lineTo(x, rho(x)); } sh.lineTo(L / 2, 0); sh.closePath();
    const face = new THREE.ShapeGeometry(sh, 2); const fu = face.attributes.uv, fp = face.attributes.position;
    for (let i = 0; i < fu.count; i++) fu.setXY(i, (fp.getX(i) + L / 2) / L, fp.getY(i) / R);
    return { skin, face };
  }, [L, R]);
  const M = useMemo(() => ({
    skin: new THREE.MeshPhysicalMaterial({ map: canvasTex("c_df_pskin2", 512, 128, skinDraw), roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, side: THREE.DoubleSide }),
    flesh: new THREE.MeshPhysicalMaterial({ map: canvasTex("c_df_pflesh2", 1024, 256, fleshDraw), roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.06, emissive: "#55601A", emissiveIntensity: 0.3, side: THREE.DoubleSide }),
  }), []);
  return (
    <group position={position} rotation-y={ry}>
      <mesh geometry={g.skin} material={M.skin} castShadow />
      {/* the upright cut face (z 0, facing +z) and the one it lies on (y 0, facing down) */}
      <mesh geometry={g.face} material={M.flesh} />
      <mesh geometry={g.face} material={M.flesh} rotation-x={-Math.PI / 2} scale={[1, 1, 1]} />
    </group>
  );
};

// ── fries: steak-cut wedges of potato, each slightly bent and uneven, in a natural pile ─────────────────────────────────
const fryGeo = (seed) => {
  const g = new THREE.BoxGeometry(1, 1, 1, 10, 1, 1), p = g.attributes.position;
  const bend = (rnd(seed) - 0.5) * 0.12, twist = (rnd(seed + 1) - 0.5) * 0.5;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = x + 0.5;
    const taper = 1 - 0.12 * Math.abs(x * 2) ** 3 + 0.05 * Math.sin(t * 9 + seed);
    const a = twist * x, yy = y * Math.cos(a) - z * Math.sin(a), zz = y * Math.sin(a) + z * Math.cos(a);
    p.setXYZ(i, x, yy * taper + bend * (1 - 4 * x * x) * 3, zz * taper);
  }
  g.computeVertexNormals();
  return g;
};
export const FriesPile = ({ position, n = 15, seed = 1, yaw = 0, spread = 0.018 }) => {
  const geos = useMemo(() => Array.from({ length: 6 }, (_, i) => fryGeo(i * 7 + 3)), []);
  const mats = useMemo(() => ["#FFFFFF", "#F2D8B4", "#E2BE8E"].map((col) => new THREE.MeshPhysicalMaterial({ map: canvasTex("c_df_fry3", 512, 128, fryDraw), color: col, roughness: 0.42, clearcoat: 0.3, clearcoatRoughness: 0.4, emissive: "#3A2208", emissiveIntensity: 0.1 })), []);
  // a pile: the lower layer spread wider, upper ones crossing over them at an angle; all roughly along `yaw` (the plate's tangent)
  const list = useMemo(() => Array.from({ length: n }, (_, i) => {
    const layer = i < Math.ceil(n * 0.45) ? 0 : i < Math.ceil(n * 0.8) ? 1 : 2, a = rnd(i * 5 + seed) * Math.PI * 2, rr = (spread - layer * 0.005) * Math.sqrt(rnd(i * 3 + seed));
    const L = 0.05 + rnd(i * 11 + seed) * 0.03, t = 0.0085 + rnd(i * 13 + seed) * 0.003;
    return { g: (i + seed) % 6, p: [Math.cos(a) * rr, layer * 0.0082 + t / 2, Math.sin(a) * rr], r: [(rnd(i + 3 + seed) - 0.5) * (layer ? 0.3 : 0.08), yaw + (rnd(i * 7 + seed) - 0.5) * (layer ? 1.1 : 0.6), (rnd(i + 5 + seed) - 0.5) * (layer ? 0.25 : 0.05)], s: [L, t, t * (0.9 + rnd(i + 8) * 0.25)] };
  }), [n, seed, yaw, spread]);
  return <group position={position}>{list.map((o, i) => <mesh key={i} geometry={geos[o.g]} material={mats[(i + seed) % 3]} position={o.p} rotation={o.r} scale={o.s} castShadow receiveShadow />)}</group>;
};

// ── the plate's food (local to the plate centre, on the plate's well at y W): generic diner food ─────────────────────────
export const PlateFood = ({ W = 0.0105 }) => {
  const M = useMemo(() => ({
    ketchup: new THREE.MeshPhysicalMaterial({ color: "#8E1A10", roughness: 0.15, clearcoat: 1 }),
    paper: new THREE.MeshStandardMaterial({ color: "#F4F2EC", roughness: 0.9, side: THREE.DoubleSide }),
    crumbM: new THREE.MeshStandardMaterial({ color: "#D9B47A", roughness: 0.9 }),
  }), []);
  const g = useMemo(() => ({
    cup: new THREE.LatheGeometry([[0, 0], [0.019, 0], [0.024, 0.026], [0.0255, 0.0265], [0.0235, 0.0265], [0.0175, 0.002], [0, 0.002]].map(([r, y]) => new THREE.Vector2(r, y)), 32),
    pleat: new THREE.CylinderGeometry(0.0256, 0.0196, 0.026, 28, 1, true),
    crumbs: new THREE.IcosahedronGeometry(1, 0),
  }), []);
  return (
    <group>
      <Burger position={[-0.035, W, -0.02]} ry={0.3} />
      <FriesPile position={[0.05, W, 0.04]} seed={3} n={14} yaw={2.25} spread={0.016} />
      <FriesPile position={[0.015, W, 0.088]} seed={11} n={2} yaw={3.14} spread={0.004} />
      <Pickle position={[0.055, W, -0.045]} ry={0.885} L={0.082} R={0.018} />
      {/* a pleated paper cup of ketchup */}
      <group position={[-0.06, W + 0.001, 0.065]}>
        <mesh geometry={g.cup} material={M.paper} castShadow />
        <mesh position={[0, 0.0135, 0]} material={M.paper}><primitive object={g.pleat} attach="geometry" /></mesh>
        <mesh position={[0, 0.021, 0]} scale={[1, 0.28, 1]} material={M.ketchup}><sphereGeometry args={[0.0225, 24, 12]} /></mesh>
      </group>
      {/* crumbs and sesame on the plate */}
      {Array.from({ length: 14 }, (_, i) => <mesh key={i} geometry={g.crumbs} material={M.crumbM} position={[(rnd(i * 3) - 0.5) * 0.15, W + 0.0012, (rnd(i * 5) - 0.5) * 0.15]} scale={0.0012 + rnd(i) * 0.0018} />)}
    </group>
  );
};

/** used knife and fork, laid on the table side by side (handle ends toward +z), on a paper napkin */
export const UsedFlatware = ({ chrome, position, ry = 0 }) => {
  const g = useMemo(() => ({ knife: knifeGeo(), fork: forkGeo() }), []);
  const nap = useMemo(() => { const q = new THREE.PlaneGeometry(0.085, 0.22, 10, 18).rotateX(-Math.PI / 2); const p = q.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, 0.0015 + 0.0015 * Math.sin(p.getX(i) * 90 + p.getZ(i) * 40) * Math.cos(p.getZ(i) * 70)); q.computeVertexNormals(); return q; }, []);
  const napM = useMemo(() => new THREE.MeshStandardMaterial({ color: "#F3F2EE", roughness: 0.95, side: THREE.DoubleSide }), []);
  return (
    <group position={position} rotation-y={ry}>
      <mesh geometry={nap} material={napM} receiveShadow castShadow />
      <mesh geometry={g.knife} material={chrome} position={[-0.016, 0.003, 0.1]} rotation-y={Math.PI / 2} castShadow />
      <mesh geometry={g.fork} material={chrome} position={[0.018, 0.003, 0.098]} rotation-y={Math.PI / 2 + 0.04} castShadow />
    </group>
  );
};

// ── the mug ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const MUG_O = [[0.0, 0.0], [0.035, 0.0], [0.039, 0.003], [0.041, 0.012], [0.043, 0.05], [0.044, 0.09], [0.0435, 0.096], [0.0405, 0.0975], [0.0378, 0.095], [0.0368, 0.088], [0.035, 0.03], [0.031, 0.016], [0.0, 0.016]];
const coffeeDraw = (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, "#2B1407"); g.addColorStop(0.82, "#3A1C0B"); g.addColorStop(0.93, "#7A4A26"); g.addColorStop(1, "#B9875A");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  const hl = c.createRadialGradient(w * 0.36, h * 0.34, 0, w * 0.36, h * 0.34, w * 0.18); hl.addColorStop(0, "rgba(255,236,210,0.5)"); hl.addColorStop(1, "rgba(255,236,210,0)"); c.fillStyle = hl; c.fillRect(0, 0, w, h);
};
export const Mug = ({ ceramic, chrome, position, ry = 0 }) => {
  const g = useMemo(() => {
    const body = new THREE.LatheGeometry(MUG_O.map(([r, y]) => new THREE.Vector2(r, y)), 56);
    const path = new THREE.CatmullRomCurve3([[0.04, 0.082], [0.056, 0.084], [0.068, 0.072], [0.07, 0.052], [0.064, 0.032], [0.05, 0.024], [0.041, 0.026]].map(([x, y]) => new THREE.Vector3(x, y, 0)));
    const handle = new THREE.TubeGeometry(path, 40, 0.0068, 12, false);
    return { body, handle };
  }, []);
  const coffee = useMemo(() => new THREE.MeshPhysicalMaterial({ map: canvasTex("c_df_coffee", 256, 256, coffeeDraw), roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.02 }), []);
  return (
    <group position={position} rotation-y={ry}>
      <mesh geometry={g.body} material={ceramic} castShadow receiveShadow />
      <mesh geometry={g.handle} material={ceramic} castShadow />
      <mesh position={[0, 0.079, 0]} rotation-x={-Math.PI / 2} material={coffee}><circleGeometry args={[0.0362, 40]} /></mesh>
      {/* a dried drip down the outside below the lip, away from the handle */}
      <mesh position={[-0.0443, 0.083, 0.006]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.004, 0.018]} /><meshStandardMaterial color="#6E4A2C" transparent opacity={0.45} roughness={0.5} depthWrite={false} /></mesh>
      <Spoon chrome={chrome} position={[0.02, 0.0, 0.075]} ry={0.45} />
    </group>
  );
};

// ── a water glass with ice ───────────────────────────────────────────────────────────────────────────────────────────
const glassSkinDraw = (c, w, h) => {   // transparent except the refraction streaks and condensation beads
  c.clearRect(0, 0, w, h);
  [[0.18, 26, 0.55], [0.24, 8, 0.8], [0.66, 14, 0.35], [0.72, 5, 0.6]].forEach(([u, bw, a]) => { const g = c.createLinearGradient(u * w - bw, 0, u * w + bw, 0); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, `rgba(255,255,255,${a})`); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(u * w - bw, h * 0.08, 2 * bw, h * 0.84); });
  for (let i = 0; i < 160; i++) { const x = rnd(i * 3) * w, y = h * 0.1 + rnd(i * 5) * h * 0.6, r = 0.6 + rnd(i) * 1.6; c.fillStyle = `rgba(235,245,255,${0.2 + rnd(i + 2) * 0.3})`; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); c.fillStyle = "rgba(255,255,255,0.9)"; c.fillRect(x - r * 0.4, y - r * 0.5, 1, 1); }
  c.fillStyle = "rgba(255,255,255,0.65)"; c.fillRect(0, 0, w, 4);   // the rim catching the light
};
export const WaterGlass = ({ position, level = 0.085, ice = 4 }) => {
  const g = useMemo(() => ({
    shell: new THREE.LatheGeometry([[0, 0], [0.031, 0], [0.033, 0.004], [0.034, 0.012], [0.04, 0.132], [0.0375, 0.132], [0.0318, 0.014], [0, 0.014]].map(([r, y]) => new THREE.Vector2(r, y)), 40),
    skin: new THREE.CylinderGeometry(0.0402, 0.0342, 0.12, 40, 1, true),
    water: new THREE.LatheGeometry([[0, 0.014], [0.0316, 0.014], [0.0316 + (0.0374 - 0.0316) * ((level - 0.014) / 0.118), level], [0, level]].map(([r, y]) => new THREE.Vector2(r, y)), 32),
    cube: new THREE.BoxGeometry(0.022, 0.02, 0.022, 2, 2, 2),
  }), [level]);
  const M = useMemo(() => ({
    shell: new THREE.MeshPhysicalMaterial({ color: "#E4F0FC", transparent: true, opacity: 0.13, roughness: 0.03, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.6 }),
    skin: new THREE.MeshBasicMaterial({ map: canvasTex("c_df_glassskin2", 512, 256, glassSkinDraw), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.4, toneMapped: false }),
    water: new THREE.MeshPhysicalMaterial({ color: "#A8CDEE", transparent: true, opacity: 0.2, roughness: 0.02, depthWrite: false, envMapIntensity: 1.2 }),
    ice: new THREE.MeshPhysicalMaterial({ color: "#EAF4FF", transparent: true, opacity: 0.38, roughness: 0.25, clearcoat: 1, depthWrite: false, emissive: "#9CC4EE", emissiveIntensity: 0.06 }),
    top: new THREE.MeshPhysicalMaterial({ color: "#D6E8F8", transparent: true, opacity: 0.4, roughness: 0.02, clearcoat: 1, depthWrite: false }),
  }), []);
  const cubes = useMemo(() => Array.from({ length: ice }, (_, i) => ({ p: [(rnd(i * 3 + 1) - 0.5) * 0.026, level - 0.006 + (i % 2) * 0.004 - (i > 1 ? 0.016 : 0), (rnd(i * 5 + 2) - 0.5) * 0.026], r: [rnd(i) * 0.8, rnd(i + 1) * 3, rnd(i + 2) * 0.8] })), [ice, level]);
  return (
    <group position={position}>
      {cubes.map((c, i) => <mesh key={i} geometry={g.cube} material={M.ice} position={c.p} rotation={c.r} renderOrder={1} />)}
      <mesh geometry={g.water} material={M.water} renderOrder={2} />
      <mesh position={[0, level, 0]} rotation-x={-Math.PI / 2} material={M.top} renderOrder={2}><circleGeometry args={[0.0316 + (0.0374 - 0.0316) * ((level - 0.014) / 0.118), 32]} /></mesh>
      <mesh geometry={g.shell} material={M.shell} renderOrder={3} castShadow />
      <mesh geometry={g.skin} material={M.skin} position={[0, 0.072, 0]} renderOrder={4} />
    </group>
  );
};

// ── the condiment caddy ──────────────────────────────────────────────────────────────────────────────────────────────
const labelDraw = (kind) => (c, w, h) => {
  // the label wraps the bottle: its readable panel spans only the front ~100° (u 0.36 … 0.64), the brand-free type set to fit it
  const ket = kind === "k";
  c.fillStyle = ket ? "#B3201A" : "#E9B91E"; c.fillRect(0, 0, w, h);
  const x0 = w * 0.33, x1 = w * 0.67, pw = x1 - x0;
  c.fillStyle = "#F6F1E4"; c.fillRect(x0, h * 0.14, pw, h * 0.72);
  c.strokeStyle = ket ? "#8A1712" : "#B08510"; c.lineWidth = 4; c.strokeRect(x0 + 6, h * 0.14 + 6, pw - 12, h * 0.72 - 12);
  c.fillStyle = ket ? "#8A1712" : "#6A4A08"; c.textAlign = "center";
  const fit = (t, wt, px0) => { let px = px0; c.font = `${wt} ${px}px ${SANSF}`; while (c.measureText(t).width > pw * 0.8 && px > 8) { px -= 2; c.font = `${wt} ${px}px ${SANSF}`; } return px; };
  fit(ket ? "TOMATO" : "YELLOW", 800, h * 0.16); c.fillText(ket ? "TOMATO" : "YELLOW", w / 2, h * 0.38);
  fit(ket ? "KETCHUP" : "MUSTARD", 800, h * 0.2); c.fillText(ket ? "KETCHUP" : "MUSTARD", w / 2, h * 0.6);
  fit("SQUEEZE BOTTLE", 600, h * 0.07); c.fillText("SQUEEZE BOTTLE", w / 2, h * 0.76);
};
const BOTTLE = [[0, 0], [0.026, 0], [0.028, 0.004], [0.028, 0.15], [0.026, 0.162], [0.02, 0.17], [0.0145, 0.172], [0, 0.172]];
const Bottle = ({ kind, chrome, position, ry }) => {
  const g = useMemo(() => ({ body: new THREE.LatheGeometry(BOTTLE.map(([r, y]) => new THREE.Vector2(r, y)), 36), label: new THREE.CylinderGeometry(0.0284, 0.0284, 0.1, 36, 1, true) }), []);
  const M = useMemo(() => ({
    body: new THREE.MeshPhysicalMaterial({ color: kind === "k" ? "#B3201A" : "#E2B21C", roughness: 0.32, clearcoat: 0.6 }),
    label: new THREE.MeshStandardMaterial({ map: canvasTex("c_df_label2_" + kind, 1024, 256, labelDraw(kind)), roughness: 0.5 }),
    cap: new THREE.MeshStandardMaterial({ color: kind === "k" ? "#E9E4DA" : "#E9E4DA", roughness: 0.4 }),
  }), [kind]);
  return (
    <group position={position} rotation-y={ry}>
      <mesh geometry={g.body} material={M.body} castShadow />
      <mesh geometry={g.label} material={M.label} position={[0, 0.075, 0]} rotation-y={Math.PI} />
      <mesh position={[0, 0.18, 0]} material={M.cap} castShadow><cylinderGeometry args={[0.016, 0.017, 0.018, 24]} /></mesh>
      <mesh position={[0, 0.199, 0]} material={M.cap}><coneGeometry args={[0.009, 0.022, 20]} /></mesh>
      <mesh position={[0, 0.213, 0]} material={M.body}><cylinderGeometry args={[0.0028, 0.003, 0.006, 10]} /></mesh>
    </group>
  );
};
const packetDraw = (c, w, h) => {
  c.fillStyle = "#F6F4EE"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#2E5C9E"; c.fillRect(0, h * 0.62, w, h * 0.12);
  c.fillStyle = "#1E3A66"; c.textAlign = "center"; c.font = `800 ${h * 0.26}px ${SANSF}`; c.fillText("SUGAR", w / 2, h * 0.46);
  c.font = `600 ${h * 0.09}px ${SANSF}`; c.fillText("PURE CANE", w / 2, h * 0.88);
};
export const Caddy = ({ chrome, position, ry = 0 }) => {
  const pk = useMemo(() => new THREE.MeshStandardMaterial({ map: canvasTex("c_df_packet", 256, 160, packetDraw), roughness: 0.8 }), []);
  const pkEdge = useMemo(() => new THREE.MeshStandardMaterial({ color: "#EDEAE2", roughness: 0.85 }), []);
  const W = 0.17, D = 0.075, wr = 0.0022;
  const rail = (p, L, r = [0, 0, 0], k) => <mesh key={k} position={p} rotation={r} material={chrome} castShadow><cylinderGeometry args={[wr, wr, L, 8]} /></mesh>;
  return (
    <group position={position} rotation-y={ry}>
      {/* the wire frame: a base plate, two hoops, the carrying handle */}
      <mesh position={[0, 0.003, 0]} material={chrome} receiveShadow castShadow><boxGeometry args={[W, 0.004, D]} /></mesh>
      {[0.045, 0.09].map((y, i) => (
        <group key={i}>
          {rail([0, y, D / 2], W, [0, 0, Math.PI / 2], "f" + i)}{rail([0, y, -D / 2], W, [0, 0, Math.PI / 2], "b" + i)}
          {rail([W / 2, y, 0], D, [Math.PI / 2, 0, 0], "r" + i)}{rail([-W / 2, y, 0], D, [Math.PI / 2, 0, 0], "l" + i)}
        </group>
      ))}
      {[[W / 2, D / 2], [-W / 2, D / 2], [W / 2, -D / 2], [-W / 2, -D / 2]].map(([x, z], i) => rail([x, 0.047, z], 0.09, [0, 0, 0], "p" + i))}
      {rail([0.034, 0.13, 0.022], 0.08, [0, 0, 0], "h1")}{rail([0.034, 0.13, -0.022], 0.08, [0, 0, 0], "h2")}
      <mesh position={[0.034, 0.17, 0]} rotation-y={Math.PI / 2} material={chrome}><torusGeometry args={[0.022, wr * 1.3, 6, 20, Math.PI]} /></mesh>
      {/* the bottles and the sugar packets in their bay */}
      <Bottle kind="k" chrome={chrome} position={[-0.054, 0.005, 0]} ry={0.12} />
      <Bottle kind="m" chrome={chrome} position={[0.0, 0.005, 0]} ry={-0.15} />
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0.06, 0.03, -0.024 + i * 0.006]} rotation-x={-0.12 + (rnd(i) - 0.5) * 0.08} castShadow>
          <boxGeometry args={[0.04, 0.052, 0.0018]} />
          {[0, 1, 2, 3].map((k) => <primitive key={k} object={pkEdge} attach={`material-${k}`} />)}
          <primitive object={pk} attach="material-4" /><primitive object={pkEdge} attach="material-5" />
        </mesh>
      ))}
    </group>
  );
};
