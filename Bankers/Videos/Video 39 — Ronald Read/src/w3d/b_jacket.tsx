// @ts-nocheck
// ★ V39 builder B — the worn khaki WORK JACKET hanging on a peg on the porch, its front held closed by ONE large safety pin where a
//   button is missing (FACTCHECK row 4: "held his coat together with a safety pin"). A cotton-duck chore coat: a brown corduroy collar,
//   a placket with brass-shank buttons (the third one gone, loose threads), two patch pockets with flaps and a chest pocket, raglan
//   sleeves hanging at its sides, frayed cuffs and hem, faded seams and grime. The pin is a real safety pin: a coiled spring, the
//   pointed leg passing UNDER the cloth between two puckers, the upper leg over it, locked in a stamped clasp head.
//   Frame: hanging point (the loop on the peg) at the origin, the wall at z = 0, the jacket in front (+z), x across, y up.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { canvasTex, rnd } from "./kit";

const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ss = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const HEM = -0.8;
/** half-width, half-depth of the body at height y (the sleeves are separate) */
const bodyW = (y) => {
  if (y > -0.05) return 0.045 + (0.05 - 0.045) * 0;
  if (y > -0.2) return 0.05 + 0.17 * ss(-0.05, -0.2, y);
  return 0.22 + 0.055 * ss(-0.2, -0.36, y) + 0.015 * ss(-0.5, HEM, y);
};
const bodyD = (y) => 0.035 + 0.045 * ss(-0.03, -0.3, y) - 0.008 * ss(-0.5, HEM, y);
export const PIN_Y = -0.4;
/** the fold / pin relief added to the front of the body at (x, y) */
const relief = (x, y) => {
  const k = ss(-0.12, -0.5, y);
  const dp = Math.hypot(x / 0.12, (y - PIN_Y) / 0.09);
  let z = (0.009 * Math.sin(x * 38 + 1.3) + 0.006 * Math.sin(x * 71 + 0.4)) * k * (0.6 + 0.4 * ss(-0.4, HEM, y)) * (1 - Math.exp(-dp * dp * 0.8));
  z += 0.012 * Math.exp(-dp * dp) - 0.006 * Math.exp(-Math.pow(Math.hypot(x / 0.05, (y - PIN_Y + 0.05) / 0.05), 2));
  return z;
};
/** the front surface's z at (x, y) (for buttons, the pin, the puckers) */
export const frontZ = (x, y) => { const w = bodyW(y) * 1.0, a = Math.asin(cl(x / w, -1, 1)), front = Math.max(0, Math.cos(a)); return Math.cos(a) * bodyD(y) + 0.35 * bodyD(y) + 0.006 + front * relief(x, y); };
/** the body surface: rings round the jacket, lofted top to hem; folds hang from the shoulders and pull toward the pin */
const bodyGeo = () => {
  const NY = 110, NU = 120, pos = [], uv = [], idx = [];
  for (let j = 0; j <= NY; j++) {
    const v = j / NY, y = 0.0 + (HEM - 0.0) * v;
    const w = bodyW(y), d = bodyD(y), cz = 0.35 * d + 0.006;
    for (let i = 0; i <= NU; i++) {
      const u = i / NU, a = (u - 0.5) * Math.PI * 2;   // a = 0 → the front centre
      const front = Math.max(0, Math.cos(a));
      let x = Math.sin(a) * w, z = Math.cos(a) * d;
      if (Math.cos(a) < 0) { z *= 0.35; x *= 1 + 0.12 * (1 - Math.abs(Math.cos(a))); }     // a flat back against the wall
      z += front * relief(x, y);
      x *= 1 + 0.03 * ss(-0.6, HEM, y) * Math.sin(u * 20) * (1 - front);                   // the hem waves a little at the sides
      pos.push(x, y, z + cz); uv.push(u, 1 - v);
    }
  }
  for (let j = 0; j < NY; j++) for (let i = 0; i < NU; i++) {
    const a = j * (NU + 1) + i, b = a + NU + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};
/** a sleeve: a flattened tube from the shoulder down to the cuff, hanging a little in front, bent at the elbow */
const sleeveGeo = (sd) => {
  const pts = [[0.18, -0.15, 0.06], [0.235, -0.25, 0.075], [0.255, -0.42, 0.085], [0.25, -0.56, 0.1], [0.245, -0.7, 0.095]].map(([x, y, z]) => new THREE.Vector3(sd * x, y, z));
  const curve = new THREE.CatmullRomCurve3(pts);
  const g = new THREE.TubeGeometry(curve, 48, 0.056, 20, false);
  // taper toward the cuff, flatten front-to-back, a few creases at the elbow
  const P = g.attributes.position, N = 48, R = 20;
  for (let s = 0; s <= N; s++) {
    const t = s / N, c = curve.getPointAt(t), taper = 1 - 0.22 * t, crease = 1 + 0.06 * Math.sin(t * 40) * ss(0.4, 0.6, t) * (1 - ss(0.6, 0.8, t));
    for (let r = 0; r <= R; r++) {
      const k = s * (R + 1) + r;
      const dx = P.getX(k) - c.x, dy = P.getY(k) - c.y, dz = P.getZ(k) - c.z;
      P.setXYZ(k, c.x + dx * taper * crease * 1.05, c.y + dy * taper * crease, c.z + dz * taper * 0.78);
    }
  }
  g.computeVertexNormals();
  return { g, end: pts[pts.length - 1], dir: curve.getTangentAt(1) };
};
// ── the cloth: cotton duck, khaki, worn ───────────────────────────────────────────────────────────────────────────────────
const duckDraw = (c, w, h) => {
  c.fillStyle = "#937F5A"; c.fillRect(0, 0, w, h);
  // twill: fine diagonal ribs
  for (let i = -h; i < w; i += 3) { c.strokeStyle = `rgba(${rnd(i) < 0.5 ? "70,58,38" : "210,196,160"},${0.03 + rnd(i + 1) * 0.03})`; c.lineWidth = 1.1; c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.stroke(); }
  for (let i = 0; i < 60000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "60,48,30" : "220,208,176"},${rnd(i + 1) * 0.07})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2, 2); }
  // fading / soiling: lighter worn patches, darker grime
  for (let i = 0; i < 40; i++) { const x = rnd(i * 7) * w, y = rnd(i * 11) * h, r = 30 + rnd(i * 3) * 120; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rnd(i) < 0.6 ? "rgba(225,212,176,0.16)" : "rgba(60,46,28,0.16)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
};
const stitch = (c, x0, y0, x1, y1, col = "rgba(214,190,120,0.9)") => { c.strokeStyle = col; c.lineWidth = 2.2; c.setLineDash([7, 5]); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.setLineDash([]); };
const jacketTex = () => canvasTex("b_jacket_v2", 2048, 2048, (c, w, h) => {
  duckDraw(c, w, h);
  const U = (u) => u * w, V = (v) => (1 - v) * h;     // v = 1 at the collar, 0 at the hem
  // side seams, the yoke across the back/shoulders
  for (const u of [0.24, 0.76]) { c.fillStyle = "rgba(60,46,28,0.35)"; c.fillRect(U(u) - 2, 0, 4, h); stitch(c, U(u) + 8, 0, U(u) + 8, h); }
  c.fillStyle = "rgba(60,46,28,0.3)"; c.fillRect(0, V(0.78), w, 4); stitch(c, 0, V(0.78) + 9, w, V(0.78) + 9);
  // the front placket (a little right of centre): the overlap edge, two rows of topstitching
  const px = U(0.5) + 6;
  c.fillStyle = "rgba(40,30,18,0.55)"; c.fillRect(px - 3, V(0.97), 5, h);
  c.fillStyle = "rgba(230,218,184,0.18)"; c.fillRect(px + 3, V(0.97), 10, h);
  stitch(c, px + 22, V(0.95), px + 22, h); stitch(c, px - 26, V(0.95), px - 26, h);
  // where the pin pulls the fronts together they gape just below it: a sliver of the dark blanket lining
  const pv = V(1 + PIN_Y / 0.8);
  c.fillStyle = "#2A2420"; c.beginPath(); c.moveTo(px - 2, pv + 18); c.quadraticCurveTo(px + 9, pv + 70, px - 1, pv + 130); c.quadraticCurveTo(px - 8, pv + 70, px - 2, pv + 18); c.fill();
  c.fillStyle = "#3E2A22"; c.beginPath(); c.moveTo(px - 1, pv - 14); c.quadraticCurveTo(px + 6, pv - 50, px, pv - 86); c.quadraticCurveTo(px - 5, pv - 50, px - 1, pv - 14); c.fill();
  // the missing button's place: a worn spot, loose threads
  c.strokeStyle = "rgba(50,40,26,0.8)"; c.lineWidth = 2;
  for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(px - 24, pv + (k - 3) * 2); c.bezierCurveTo(px - 30 + k * 3, pv + 10 + k * 4, px - 40 - k * 2, pv + 16, px - 36 - k * 5, pv + 28 + k * 3); c.stroke(); }
  // patch pockets with flaps (lower front, both sides) and a chest pocket
  const pocket = (u0, u1, v0, v1, flap) => {
    const x0 = U(u0), x1 = U(u1), y0 = V(v1), y1 = V(v0);
    c.fillStyle = "rgba(60,46,28,0.22)"; c.fillRect(x0 - 3, y0 - 3, x1 - x0 + 6, y1 - y0 + 6);
    c.fillStyle = "rgba(180,162,120,0.35)"; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    stitch(c, x0 + 8, y0, x0 + 8, y1 - 8); stitch(c, x1 - 8, y0, x1 - 8, y1 - 8); stitch(c, x0 + 8, y1 - 8, x1 - 8, y1 - 8);
    if (flap) { c.fillStyle = "rgba(150,132,96,0.55)"; c.fillRect(x0 - 6, y0 - 6, x1 - x0 + 12, 52); c.fillStyle = "rgba(40,30,18,0.5)"; c.fillRect(x0 - 6, y0 + 44, x1 - x0 + 12, 4); stitch(c, x0, y0 + 36, x1, y0 + 36); }
    // worn corners
    for (const [x, y] of [[x0, y1], [x1, y1]]) { c.fillStyle = "rgba(230,218,184,0.35)"; c.beginPath(); c.arc(x, y, 14, 0, 7); c.fill(); }
  };
  pocket(0.34, 0.45, 0.13, 0.34, true); pocket(0.55, 0.66, 0.13, 0.34, true); pocket(0.37, 0.45, 0.58, 0.69, true);
  // the hem: a band, frayed threads; grime at the hem and round the pockets
  c.fillStyle = "rgba(60,46,28,0.3)"; c.fillRect(0, h - 46, w, 4); stitch(c, 0, h - 30, w, h - 30);
  for (let i = 0; i < 900; i++) { c.strokeStyle = `rgba(${rnd(i) < 0.5 ? "230,218,186" : "90,74,48"},0.6)`; c.lineWidth = 1.5; const x = rnd(i + 1) * w; c.beginPath(); c.moveTo(x, h - 12); c.lineTo(x + (rnd(i + 2) - 0.5) * 8, h - rnd(i + 3) * 16); c.stroke(); }
  const gr = c.createLinearGradient(0, h - 260, 0, h); gr.addColorStop(0, "rgba(50,40,26,0)"); gr.addColorStop(1, "rgba(50,40,26,0.3)"); c.fillStyle = gr; c.fillRect(0, h - 260, w, 260);
  // an old oil stain, a mended tear with darker thread
  c.fillStyle = "rgba(50,38,22,0.22)"; c.beginPath(); c.ellipse(U(0.6), V(0.5), 40, 28, 0.4, 0, 7); c.fill();
  c.strokeStyle = "rgba(70,54,34,0.45)"; c.lineWidth = 1.5; for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(U(0.42) + k * 5 + rnd(k) * 3, V(0.45) - 6 - rnd(k + 1) * 3); c.lineTo(U(0.42) + k * 5 + 2, V(0.45) + 6); c.stroke(); }
});
const sleeveTex = () => canvasTex("b_sleeve", 512, 1024, (c, w, h) => {
  duckDraw(c, w, h);
  c.fillStyle = "rgba(60,46,28,0.35)"; c.fillRect(0, 0, 3, h); stitch(c, 10, 0, 10, h);
  // elbow wear, the cuff band, fraying at the cuff
  c.fillStyle = "rgba(225,212,176,0.22)"; c.beginPath(); c.ellipse(w * 0.25, h * 0.55, 90, 140, 0, 0, 7); c.fill();
  c.fillStyle = "rgba(60,46,28,0.35)"; c.fillRect(0, h - 90, w, 5); stitch(c, 0, h - 70, w, h - 70); stitch(c, 0, h - 20, w, h - 20);
  c.fillStyle = "rgba(40,30,18,0.3)"; c.fillRect(0, h - 90, w, 90);
  for (let i = 0; i < 400; i++) { c.strokeStyle = "rgba(230,218,186,0.6)"; c.lineWidth = 1.5; const x = rnd(i + 1) * w; c.beginPath(); c.moveTo(x, h - 3); c.lineTo(x + (rnd(i + 2) - 0.5) * 8, h - rnd(i + 3) * 14); c.stroke(); }
});
const corduroyTex = () => { const t = canvasTex("b_cord", 256, 64, (c, w, h) => { c.fillStyle = "#4A3424"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 6) { c.fillStyle = "rgba(120,92,64,0.6)"; c.fillRect(x, 0, 3, h); c.fillStyle = "rgba(20,14,8,0.5)"; c.fillRect(x + 4, 0, 1.5, h); } for (let i = 0; i < 2000; i++) { c.fillStyle = `rgba(200,170,130,${rnd(i) * 0.12})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 1); return t; };
// ── the safety pin ──────────────────────────────────────────────────────────────────────────────────────────────────────
let PING = null;
const pinGeo = () => PING ??= (() => {
  const L = 0.112, r = 0.0021, R = 0.0072;
  // the spring coil: 1¾ turns about the pin's z axis at x = 0
  const coil = new THREE.CatmullRomCurve3(Array.from({ length: 40 }, (_, i) => { const t = i / 39, a = -Math.PI / 2 + t * Math.PI * 3.5; return new THREE.Vector3(Math.cos(a) * R * 0.95 - R * 0.1, Math.sin(a) * R, (t - 0.5) * 0.0055); }));
  // the upper leg: from the coil's top over to the clasp, a slight bow
  const upper = new THREE.CatmullRomCurve3([[-0.0007, R, 0.0027], [0.03, R * 0.8, 0.0035], [0.07, R * 0.55, 0.0032], [L - 0.008, R * 0.4, 0.0022], [L - 0.002, R * 0.15, 0.0008]].map((p) => new THREE.Vector3(...p)));
  // the pointed leg: from the coil's bottom straight to the clasp (its middle goes under the cloth: drawn in two visible pieces)
  const lowerA = new THREE.CatmullRomCurve3([[-0.0007, -R, -0.0027], [0.012, -R * 0.85, -0.0016], [0.026, -R * 0.75, -0.0045]].map((p) => new THREE.Vector3(...p)));
  const lowerB = new THREE.CatmullRomCurve3([[0.074, -R * 0.5, -0.0045], [0.09, -R * 0.42, -0.0012], [L - 0.004, -R * 0.3, 0.0]].map((p) => new THREE.Vector3(...p)));
  const tube = (c, n, rad = r) => new THREE.TubeGeometry(c, n, rad, 10, false);
  const head = new RoundedBoxGeometry(0.019, 0.0215, 0.0082, 3, 0.0032); head.translate(L + 0.003, 0, 0.0008);
  const headLip = new RoundedBoxGeometry(0.004, 0.017, 0.0045, 2, 0.0015); headLip.translate(L - 0.006, 0, -0.0018);
  const capS = new THREE.SphereGeometry(r, 10, 8);
  return { coil: tube(coil, 80, r * 0.95), upper: tube(upper, 40), lowerA: tube(lowerA, 12), lowerB: tube(lowerB, 16), head, headLip, capS, R, L };
})();
export const SafetyPin = ({ position, rotation = [0, 0, 0], scale = 1 }) => {
  const g = pinGeo();
  const m = useMemo(() => new THREE.MeshStandardMaterial({ color: "#E8ECF2", metalness: 1, roughness: 0.12, envMapIntensity: 2.2 }), []);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={g.coil} material={m} castShadow />
      <mesh geometry={g.upper} material={m} castShadow />
      <mesh geometry={g.lowerA} material={m} castShadow />
      <mesh geometry={g.lowerB} material={m} castShadow />
      <mesh geometry={g.head} material={m} castShadow />
      <mesh geometry={g.headLip} material={m} />
    </group>
  );
};
// ── the jacket ──────────────────────────────────────────────────────────────────────────────────────────────────────────
export const Jacket = () => {
  const geo = useMemo(() => ({ body: bodyGeo(), L: sleeveGeo(-1), R: sleeveGeo(1) }), []);
  const mats = useMemo(() => ({
    body: new THREE.MeshStandardMaterial({ map: jacketTex(), roughness: 0.92, side: THREE.DoubleSide }),
    sleeve: new THREE.MeshStandardMaterial({ map: sleeveTex(), roughness: 0.92 }),
    cord: new THREE.MeshStandardMaterial({ map: corduroyTex(), roughness: 0.95, side: THREE.DoubleSide }),
    lining: new THREE.MeshStandardMaterial({ color: "#2E2622", roughness: 0.95, side: THREE.DoubleSide }),
    button: new THREE.MeshStandardMaterial({ color: "#7A6038", roughness: 0.35, metalness: 0.7 }),
    loop: new THREE.MeshStandardMaterial({ color: "#3A2A1C", roughness: 0.9 })
  }), []);
  // the collar: a folded corduroy band lying on the shoulders, rising to the hanging loop, its two points framing the placket's top
  const collar = useMemo(() => {
    const N = 24, pos = [], uv = [], idx = [];
    for (const sd of [-1, 1]) {
      const base = pos.length / 3;
      for (let i = 0; i <= N; i++) {
        const t = i / N;   // 0 at the back of the neck (the loop), 1 at the collar point
        const ix = sd * (0.012 + 0.03 * Math.sin(t * Math.PI / 2)), iy = -0.012 - 0.11 * t;               // inner edge (the neckline)
        const ox = sd * (0.06 + 0.06 * Math.sin(t * Math.PI * 0.6) - 0.02 * t * t), oy = -0.03 - 0.12 * t - 0.03 * t * t;   // outer edge (the fold)
        for (const [x, y, u] of [[ix, iy, 0], [ox, oy, 1]]) { pos.push(x, y, frontZ(x, y) + 0.007 + 0.005 * (1 - u)); uv.push(u, t * 3); }
      }
      for (let i = 0; i < N; i++) { const a0 = base + i * 2; if (sd > 0) idx.push(a0, a0 + 1, a0 + 2, a0 + 1, a0 + 3, a0 + 2); else idx.push(a0, a0 + 2, a0 + 1, a0 + 1, a0 + 2, a0 + 3); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    return g;
  }, []);
  const px = 0.0075;   // the placket line (a little right of centre)
  const surfZ = frontZ;
  return (
    <group>
      <mesh geometry={geo.body} material={mats.body} castShadow receiveShadow />
      <mesh geometry={geo.L.g} material={mats.sleeve} castShadow receiveShadow />
      <mesh geometry={geo.R.g} material={mats.sleeve} castShadow receiveShadow />
      {[geo.L, geo.R].map((s, i) => <mesh key={i} position={s.end} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), s.dir)} material={mats.lining}><cylinderGeometry args={[0.04, 0.04, 0.004, 16]} /></mesh>)}
      <mesh geometry={collar} material={mats.cord} castShadow />
      {/* the collar's rolled edge */}
      {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.085, -0.095, frontZ(sd * 0.085, -0.095) + 0.006]} rotation-z={sd * 0.35} scale={[0.55, 1, 0.4]} material={mats.cord}><cylinderGeometry args={[0.012, 0.012, 0.16, 10]} /></mesh>)}
      {/* the hanging loop over the peg */}
      <mesh position={[0, 0.006, 0.018]} rotation-x={Math.PI / 2 - 0.3} material={mats.loop}><torusGeometry args={[0.014, 0.003, 6, 16]} /></mesh>
      {/* buttons down the placket; the third is gone (the pin) */}
      {[-0.13, -0.265, -0.535, -0.67].map((y) => (
        <group key={y} position={[px + 0.016, y, surfZ(px + 0.016, y) + 0.003]}>
          <mesh rotation-x={Math.PI / 2} material={mats.button}><cylinderGeometry args={[0.0105, 0.0105, 0.004, 18]} /></mesh>
          <mesh position={[0, 0, 0.0025]} rotation-x={Math.PI / 2} material={mats.button}><cylinderGeometry args={[0.006, 0.0075, 0.002, 16]} /></mesh>
        </group>
      ))}
      {/* the safety pin across the closure where the button was: coil on the left front, clasp on the right */}
      <SafetyPin position={[-0.062, PIN_Y + 0.004, surfZ(0, PIN_Y) + 0.0052]} rotation={[0, 0, 0.07]} scale={1.2} />
      {/* the cloth puckers where the pin's point goes in and comes out */}
      {[[-0.03, PIN_Y - 0.0045], [0.026, PIN_Y - 0.0005]].map(([x, y], i) => <mesh key={i} position={[x, y, surfZ(x, y) - 0.001]} scale={[1.5, 0.8, 0.55]} material={mats.body}><sphereGeometry args={[0.008, 12, 8]} /></mesh>)}
    </group>
  );
};
/** the peg rail on the wall (a board with three Shaker pegs), the jacket on the first peg, a wool cap on the third */
export const PegRail = ({ withJacket = true }) => {
  const mats = useMemo(() => ({ wood: new THREE.MeshStandardMaterial({ color: "#7A5A3C", roughness: 0.55 }), cap: new THREE.MeshStandardMaterial({ color: "#5A2A26", roughness: 0.95 }), capBand: new THREE.MeshStandardMaterial({ color: "#2A2A30", roughness: 0.9 }) }), []);
  const peg = useMemo(() => new THREE.LatheGeometry([[0.001, 0.0], [0.012, 0.0], [0.011, 0.04], [0.009, 0.07], [0.016, 0.085], [0.017, 0.095], [0.012, 0.105], [0.001, 0.108]].map(([r, y]) => new THREE.Vector2(r, y)), 16), []);
  return (
    <group>
      <mesh position={[0.25, 0, 0.011]} material={mats.wood} castShadow receiveShadow><boxGeometry args={[0.95, 0.09, 0.022]} /></mesh>
      {[0, 0.27, 0.54].map((x) => <mesh key={x} geometry={peg} position={[x, 0, 0.02]} rotation-x={Math.PI / 2 - 0.12} material={mats.wood} castShadow />)}
      {withJacket && <group position={[0, -0.01, 0.026]}><Jacket /></group>}
      {/* a knitted wool cap on the third peg */}
      <group position={[0.54, -0.07, 0.07]} rotation-z={0.1}>
        <mesh material={mats.cap} scale={[1, 1.05, 0.7]} castShadow><sphereGeometry args={[0.095, 20, 14, 0, Math.PI * 2, 0, Math.PI / 1.7]} /></mesh>
        <mesh position={[0, -0.03, 0]} material={mats.capBand} scale={[1, 1, 0.72]}><cylinderGeometry args={[0.098, 0.1, 0.05, 20, 1, true]} /></mesh>
      </group>
    </group>
  );
};
