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
const bunTopDraw = (c, w, h) => {   // the crown's crust: glossy brown deepening to the top, pale near the base, sesame seeds
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#8A4A18"); g.addColorStop(0.55, "#B66E2C"); g.addColorStop(0.85, "#D59A55"); g.addColorStop(1, "#EBC892");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "60,25,5" : "255,220,160"},${0.04 + rnd(i + 1) * 0.06})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 3, 2); }
  for (let i = 0; i < 70; i++) { const x = rnd(i * 3) * w, y = rnd(i * 5 + 1) * h * 0.7; c.fillStyle = "#F6E7C2"; c.beginPath(); c.ellipse(x, y, 4.2, 2.2, rnd(i + 7) * 3, 0, Math.PI * 2); c.fill(); c.fillStyle = "rgba(150,100,40,0.5)"; c.beginPath(); c.ellipse(x + 1, y + 1, 3, 1.2, rnd(i + 7) * 3, 0, Math.PI * 2); c.fill(); }
};
const crumbDraw = (c, w, h) => {   // the bun's crumb (the cut face of bread): pale with irregular holes
  c.fillStyle = "#EEDDB4"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(170,130,70,${0.1 + rnd(i) * 0.2})`; c.beginPath(); c.ellipse(rnd(i + 1) * w, rnd(i + 2) * h, 1 + rnd(i + 3) * 4, 1 + rnd(i + 4) * 2.5, rnd(i) * 3, 0, Math.PI * 2); c.fill(); }
};
const pattyDraw = (c, w, h) => {   // seared beef: dark brown with a char crust and grill-flecks
  c.fillStyle = "#4A2614"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 6000; i++) { const v = rnd(i); c.fillStyle = v < 0.4 ? `rgba(20,8,2,${0.2 + rnd(i + 1) * 0.4})` : v < 0.8 ? `rgba(120,60,30,${0.15 + rnd(i + 1) * 0.3})` : `rgba(160,90,50,0.35)`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 1 + rnd(i + 4) * 4, 1 + rnd(i + 5) * 3); }
};
// the cut face of the half burger, bottom → top in canvas y: bottom bun, patty, cheese, tomato, lettuce, top bun
const LAYERS = [["crumb", 0.018], ["patty", 0.014], ["cheese", 0.003], ["tomato", 0.006], ["lettuce", 0.004], ["crumb", 0.03]];
const BH = LAYERS.reduce((a, l) => a + l[1], 0);
const sectionDraw = (c, w, h) => {
  let y = h;
  LAYERS.forEach(([k, t], i) => {
    const hh = (t / BH) * h; y -= hh;
    if (k === "crumb") { c.drawImage(canvasTex("c_df_crumb", 256, 128, crumbDraw).image, 0, y, w, hh); if (i === LAYERS.length - 1) { const g = c.createLinearGradient(0, y, 0, y + hh * 0.35); g.addColorStop(0, "#9A5A22"); g.addColorStop(1, "rgba(154,90,34,0)"); c.fillStyle = g; c.fillRect(0, y, w, hh * 0.35); } else { c.fillStyle = "rgba(170,110,50,0.8)"; c.fillRect(0, y + hh - 6, w, 6); } }
    if (k === "patty") { c.drawImage(canvasTex("c_df_patty", 256, 256, pattyDraw).image, 0, y, w, hh); c.fillStyle = "rgba(140,70,50,0.35)"; c.fillRect(0, y + hh * 0.3, w, hh * 0.4); }
    if (k === "cheese") { c.fillStyle = "#F2A62A"; c.fillRect(0, y, w, hh + 3); }
    if (k === "tomato") { c.fillStyle = "#C8321E"; c.fillRect(0, y, w, hh); for (let x = 20; x < w; x += 70) { c.fillStyle = "#E9A23C"; c.beginPath(); c.ellipse(x, y + hh / 2, 8, hh * 0.25, 0, 0, Math.PI * 2); c.fill(); } }
    if (k === "lettuce") { c.fillStyle = "#7FB441"; c.beginPath(); c.moveTo(0, y + hh); for (let x = 0; x <= w; x += 10) c.lineTo(x, y + hh * (0.2 + 0.6 * rnd(x))); c.lineTo(w, y + hh); c.fill(); }
  });
};
const fryDraw = (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "#B9741F"); g.addColorStop(0.12, "#E7B055"); g.addColorStop(0.88, "#EDBB62"); g.addColorStop(1, "#A9681A");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(${rnd(i) < 0.6 ? "150,85,20" : "255,230,170"},${0.15 + rnd(i + 1) * 0.25})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2, 1 + rnd(i) * 3); }
};

// ── the plate's food (local to the plate centre, on the plate's well at y W) ──────────────────────────────────────────────
export const PlateFood = ({ W = 0.0105, chrome, ry = 0 }) => {
  const g = useMemo(() => {
    const half = (r, t, thetaStart = 0) => new THREE.CylinderGeometry(r, r, t, 40, 1, false, thetaStart, Math.PI);
    const crown = new THREE.SphereGeometry(0.05, 40, 16, 0, Math.PI, 0, Math.PI / 2);
    // the lettuce frill: a ring of wavy leaf edge round the half
    const lettuce = new THREE.CylinderGeometry(0.053, 0.056, 0.006, 48, 2, true, 0, Math.PI); const lp = lettuce.attributes.position;
    for (let i = 0; i < lp.count; i++) { const a = Math.atan2(lp.getZ(i), lp.getX(i)); lp.setY(i, lp.getY(i) + 0.0025 * Math.sin(a * 22) + 0.0015 * Math.sin(a * 9)); const k = 1 + 0.04 * Math.sin(a * 15); lp.setX(i, lp.getX(i) * k); lp.setZ(i, lp.getZ(i) * k); }
    lettuce.computeVertexNormals();
    // the cheese: a square slice laid over the patty, its corners drooping down the sides
    const cheese = new THREE.PlaneGeometry(0.098, 0.098, 16, 16).rotateX(-Math.PI / 2); const cp = cheese.attributes.position;
    for (let i = 0; i < cp.count; i++) { const x = cp.getX(i), z = cp.getZ(i), r = Math.hypot(x, z); if (r > 0.046) cp.setY(i, -(r - 0.046) * 0.9); if (x < 0) cp.setX(i, 0.0005); }
    cheese.computeVertexNormals();
    const fry = new THREE.BoxGeometry(1, 1, 1);
    const pickle = new THREE.CapsuleGeometry(0.011, 0.07, 6, 14).rotateZ(Math.PI / 2).scale(1, 0.55, 1); const pp = pickle.attributes.position;
    for (let i = 0; i < pp.count; i++) { const k = 1 + 0.06 * Math.sin(pp.getX(i) * 300) * Math.sin(Math.atan2(pp.getZ(i), pp.getY(i)) * 7); pp.setY(i, pp.getY(i) * k); pp.setZ(i, pp.getZ(i) * k); }
    pickle.computeVertexNormals();
    const cup = new THREE.LatheGeometry([[0, 0], [0.019, 0], [0.024, 0.026], [0.0255, 0.0265], [0.0235, 0.0265], [0.0175, 0.002], [0, 0.002]].map(([r, y]) => new THREE.Vector2(r, y)), 32);
    const crumbs = new THREE.IcosahedronGeometry(1, 0);
    return { half, crown, lettuce, cheese, fry, pickle, cup, crumbs, knife: knifeGeo(), fork: forkGeo() };
  }, []);
  const M = useMemo(() => {
    const bun = new THREE.MeshStandardMaterial({ map: canvasTex("c_df_buntop", 512, 256, bunTopDraw), roughness: 0.42 });
    const bunSide = new THREE.MeshStandardMaterial({ color: "#D9A866", roughness: 0.6 });
    const crumb = new THREE.MeshStandardMaterial({ map: canvasTex("c_df_crumb", 256, 128, crumbDraw), roughness: 0.95 });
    const patty = new THREE.MeshStandardMaterial({ map: canvasTex("c_df_patty", 256, 256, pattyDraw), roughness: 0.7 });
    const section = new THREE.MeshStandardMaterial({ map: canvasTex("c_df_section", 256, 512, sectionDraw), roughness: 0.8, side: THREE.DoubleSide });
    return {
      bun, bunSide, crumb, patty, section,
      cheese: new THREE.MeshPhysicalMaterial({ color: "#F0A426", roughness: 0.35, clearcoat: 0.6, side: THREE.DoubleSide }),
      lettuce: new THREE.MeshStandardMaterial({ color: "#86B848", roughness: 0.55, side: THREE.DoubleSide, emissive: "#1F3A08", emissiveIntensity: 0.15 }),
      tomato: new THREE.MeshPhysicalMaterial({ color: "#C53520", roughness: 0.25, clearcoat: 0.8 }),
      fry: new THREE.MeshStandardMaterial({ map: canvasTex("c_df_fry", 128, 32, fryDraw), roughness: 0.55, emissive: "#3A2208", emissiveIntensity: 0.15 }),
      pickle: new THREE.MeshPhysicalMaterial({ color: "#6E8A2E", roughness: 0.3, clearcoat: 0.9, emissive: "#18220A", emissiveIntensity: 0.2 }),
      ketchup: new THREE.MeshPhysicalMaterial({ color: "#8E1A10", roughness: 0.15, clearcoat: 1 }),
      paper: new THREE.MeshStandardMaterial({ color: "#F4F2EC", roughness: 0.9, side: THREE.DoubleSide }),
      crumbM: new THREE.MeshStandardMaterial({ color: "#D9B47A", roughness: 0.9 }),
    };
  }, []);
  // the layers' heights (bottom → top)
  const y0 = W, hb = 0.018, hp = 0.014, ht = 0.006;
  const fries = useMemo(() => Array.from({ length: 13 }, (_, i) => {
    const heap = i < 10;
    const a = rnd(i * 5 + 1) * Math.PI * 2, r = heap ? rnd(i * 3) * 0.028 : 0.05 + rnd(i) * 0.03;
    return { x: 0.058 + Math.cos(a) * r * (heap ? 1 : 0.6), z: -0.05 + Math.sin(a) * r * (heap ? 1 : 0.6), y: heap ? 0.0045 + Math.floor(i / 4) * 0.0085 : 0.0045, ry: rnd(i * 7) * Math.PI, rz: heap && i > 3 ? (rnd(i) - 0.5) * 0.4 : 0, L: 0.05 + rnd(i * 11) * 0.03 };
  }), []);
  return (
    <group rotation-y={ry}>
      {/* the half cheeseburger (its flat cut face toward −z, i.e. toward the window) */}
      <group position={[-0.05, y0, -0.025]} rotation-y={0.35}>
        <mesh geometry={g.half(0.05, hb)} position={[0, hb / 2, 0]} castShadow receiveShadow>
          <meshStandardMaterial attach="material-0" color="#D9A866" roughness={0.6} />
          <meshStandardMaterial attach="material-1" map={M.crumb.map} roughness={0.95} />
          <meshStandardMaterial attach="material-2" color="#C9894A" roughness={0.6} />
        </mesh>
        <mesh geometry={g.half(0.051, hp)} position={[0, hb + hp / 2, 0]} material={M.patty} castShadow />
        <mesh geometry={g.cheese} position={[0, hb + hp + 0.0008, 0]} material={M.cheese} castShadow />
        <mesh geometry={g.half(0.045, ht)} position={[0, hb + hp + 0.004, 0]} material={M.tomato} />
        <mesh geometry={g.lettuce} position={[0, hb + hp + ht + 0.004, 0]} material={M.lettuce} castShadow />
        <mesh geometry={g.crown} position={[0, hb + hp + ht + 0.006, 0]} rotation-y={Math.PI / 2} scale={[1, 0.62, 1]} material={M.bun} castShadow />
        {/* the cut face, painted with the layers' cross-section */}
        <mesh position={[-0.0004, (hb + hp + ht + 0.006 + 0.031) / 2, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.1, hb + hp + ht + 0.006 + 0.031]} /><primitive object={M.section} attach="material" /></mesh>
      </group>
      {/* steak fries: a heap and a few strays */}
      {fries.map((o, i) => <mesh key={i} geometry={g.fry} material={M.fry} position={[o.x, y0 + o.y, o.z]} rotation={[0, o.ry, o.rz]} scale={[o.L, 0.0085, 0.0095]} castShadow />)}
      {/* the pickle spear */}
      <mesh geometry={g.pickle} material={M.pickle} position={[-0.085, y0 + 0.006, 0.035]} rotation-y={-1.1} castShadow />
      {/* a paper cup of ketchup and a smear on the rim */}
      <group position={[-0.02, y0, 0.08]}>
        <mesh geometry={g.cup} material={M.paper} castShadow />
        <mesh position={[0, 0.02, 0]} scale={[1, 0.25, 1]} material={M.ketchup}><sphereGeometry args={[0.022, 24, 12]} /></mesh>
      </group>
      <mesh position={[-0.065, y0 + 0.0006, 0.075]} rotation-x={-Math.PI / 2} scale={[1.8, 0.7, 1]} material={M.ketchup}><circleGeometry args={[0.012, 20]} /></mesh>
      {/* crumbs and sesame on the plate */}
      {Array.from({ length: 16 }, (_, i) => <mesh key={i} geometry={g.crumbs} material={i % 4 ? M.crumbM : M.bun} position={[(rnd(i * 3) - 0.5) * 0.16, y0 + 0.0012, (rnd(i * 5) - 0.5) * 0.16]} scale={0.0012 + rnd(i) * 0.002} />)}
      {/* knife and fork in the finished position: tips in the well, handles on the rim at four o'clock */}
      <group position={[0.02, y0, 0.03]} rotation-y={-0.62}>
        <group position={[0, 0.0075, 0]} rotation-z={0.065}><mesh geometry={g.knife} material={chrome} position={[0.115, 0, 0]} rotation-y={Math.PI} castShadow /></group>
      </group>
      <group position={[0.0, y0, 0.058]} rotation-y={-0.76}>
        <group position={[0, 0.0075, 0]} rotation-z={0.066}><mesh geometry={g.fork} material={chrome} position={[0.12, 0, 0]} rotation-y={Math.PI} castShadow /></group>
      </group>
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
