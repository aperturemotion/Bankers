// @ts-nocheck
// ★ V39 builder B — the CABIN of the 2007 Yaris Liftback (XP90, US, left-hand drive), seen through the glass from outside:
//   the two-tier dashboard with the signature CENTRE-MOUNTED instrument pod on top, the narrow centre stack (two vents, the radio, the
//   three HVAC dials), round outboard vents, the upper and lower gloveboxes, the 3-spoke steering wheel on its column with the two
//   stalks, the 5-speed shifter and the handbrake on the console, two front buckets in grey patterned cloth (headrests on posts, the
//   recline lever and the 3-door's walk-in lever on the shoulder), the split rear bench with its two headrests, the parcel shelf, belts
//   hanging from the B-pillars and the rear quarters, buckles, door cards (armrest, pull cup, map pocket, window crank, inner handle,
//   speaker, the lock knob), floor and mats, sun visors, the rear-view mirror, the dome lamp, and an ice scraper on the passenger seat.
//   Everything is MERGED per material (one Mesher), built once. Front = +x, right = +z (the driver sits at −z).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Mesher, Lm } from "./town_parts";
import { sideZ, beltY, topY, roofAt, hatchX, shieldX } from "./b_yaris_shape";
import { clothTex, gaugeTex, stackTex, ventTex, grilleTex } from "./b_yaris_tex";

const GC = {};
const rbox = (w, h, d, r = 0.03, seg = 3) => GC[`rb${w}_${h}_${d}_${r}_${seg}`] ??= new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3));
const box = () => GC.box ??= new THREE.BoxGeometry(1, 1, 1);
const quad = () => GC.quad ??= new THREE.PlaneGeometry(1, 1);
const cyl = (seg = 16) => GC["c" + seg] ??= new THREE.CylinderGeometry(1, 1, 1, seg);
const cone = (seg = 16) => GC["k" + seg] ??= new THREE.CylinderGeometry(0.45, 1, 1, seg);
const sph = (seg = 14) => GC["s" + seg] ??= new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7));
const torus = () => GC.torus ??= new THREE.TorusGeometry(0.183, 0.0165, 10, 48);
const disc = (seg = 24) => GC["d" + seg] ??= new THREE.CircleGeometry(1, seg);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
/** a matrix from an origin and three axes (x, y, z are scaled by s) */
const Mb = (p, xa, ya, za, s = [1, 1, 1]) => {
  const X = xa.clone().normalize(), Y = ya.clone().normalize(), Z = za.clone().normalize();
  if (X.clone().cross(Y).dot(Z) < 0) Z.negate();   // keep it right-handed (no mirrored winding)
  return new THREE.Matrix4().makeBasis(X.multiplyScalar(s[0]), Y.multiplyScalar(s[1]), Z.multiplyScalar(s[2])).setPosition(p[0], p[1], p[2]);
};
const L = (p, r = [0, 0, 0], s = [1, 1, 1]) => Lm(p, s, r);
/** a flat strip (a seat belt) from a to b, `w` wide, facing roughly `face` */
const strip = (m, mat, a, b, w, t, color, face = V(0, 0, 1)) => {
  const A = V(...a), B = V(...b), ya = B.clone().sub(A), len = ya.length(); ya.normalize();
  const za = face.clone().sub(ya.clone().multiplyScalar(face.dot(ya))).normalize(), xa = ya.clone().cross(za).normalize();
  const c = A.clone().add(B).multiplyScalar(0.5);
  m.add(mat, box(), Mb([c.x, c.y, c.z], xa, ya, za, [w, len, t]), color);
};
const zin = (x, y) => sideZ(x, y) - 0.012;

export const cabinMats = () => {
  const vc = { vertexColors: true };
  const mk = (o) => { const mt = new THREE.MeshStandardMaterial({ ...vc, ...o }); return mt; };
  return {
    plastic: mk({ color: "#FFFFFF", roughness: 0.68, metalness: 0.0 }),
    soft: mk({ color: "#FFFFFF", roughness: 0.95 }),
    cloth: mk({ map: clothTex(), roughness: 0.97 }),
    carpet: mk({ color: "#FFFFFF", roughness: 1.0 }),
    chrome: mk({ color: "#FFFFFF", roughness: 0.18, metalness: 0.9 }),
    gauge: mk({ map: gaugeTex(), roughness: 0.25, emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 0.06, emissiveMap: gaugeTex() }),
    stack: mk({ map: stackTex(), roughness: 0.45 }),
    vent: mk({ map: ventTex(), roughness: 0.6 }),
    spk: mk({ map: grilleTex(), roughness: 0.8 })
  };
};

const C = { dash: "#2F3236", dashTop: "#26282C", trim: "#3E4146", lightTrim: "#7E7D79", cloth: "#B8BBC0", bolster: "#8E9297", headrest: "#A9ACB1", carpet: "#242528", mat: "#18191B", belt: "#3A3C40", head: "#B9B6AE", black: "#141518", chrome: "#D6DBE2", red: "#B0242A" };

// ── the front bucket seat (3-door: tilt-and-slide), centred at z = zc; out = the outboard sign ─────────────────────────────────────
const frontSeat = (m, zc, out) => {
  const cx = -0.17, cy = 0.5, rec = 0.3;
  // cushion and its bolsters, the plastic base shield, the seat runners
  m.add("cloth", rbox(0.5, 0.12, 0.44, 0.045), L([cx, cy, zc], [0, 0, 0.07]), C.cloth);
  for (const s of [-1, 1]) m.add("cloth", rbox(0.48, 0.1, 0.075, 0.035), L([cx - 0.01, cy + 0.035, zc + s * 0.215], [s * 0.12, 0, 0.07]), C.bolster);
  m.add("plastic", box(), L([cx - 0.02, cy - 0.1, zc], [0, 0, 0], [0.46, 0.1, 0.44]), C.black);
  m.add("plastic", rbox(0.4, 0.09, 0.02, 0.008), L([cx - 0.03, cy - 0.05, zc + out * 0.235]), C.trim);
  for (const s of [-1, 1]) m.add("chrome", box(), L([cx + 0.02, 0.325, zc + s * 0.17], [0, 0, 0], [0.78, 0.025, 0.035]), "#5A5F66");
  // the backrest (reclined), its side bolsters
  const px = -0.41, py = 0.53, ax = -Math.sin(rec), ay = Math.cos(rec);
  const at = (d, f = 0) => [px + ax * d + Math.cos(rec) * f, py + ay * d + Math.sin(rec) * f];
  const bc = at(0.32);
  m.add("cloth", rbox(0.11, 0.62, 0.46, 0.045), L([bc[0], bc[1], zc], [0, 0, rec]), C.cloth);
  for (const s of [-1, 1]) { const b2 = at(0.28, 0.04); m.add("cloth", rbox(0.1, 0.5, 0.075, 0.035), L([b2[0], b2[1], zc + s * 0.215], [0, s * 0.1, rec]), C.bolster); }
  const bb = at(0.33, -0.06); m.add("plastic", rbox(0.02, 0.58, 0.44, 0.01), L([bb[0], bb[1], zc], [0, 0, rec]), C.trim);   // the moulded back panel
  // the sewn seams: across the cushion's centre panel and twice across the backrest's
  for (const dx of [-0.08, 0.1]) m.add("plastic", box(), L([cx + dx, cy + 0.06 + dx * 0.07, zc], [0, 0, 0.07], [0.006, 0.006, 0.34]), "#55585E");
  for (const d of [0.2, 0.42]) { const q = at(d, 0.057); m.add("plastic", box(), L([q[0], q[1], zc], [0, 0, rec], [0.006, 0.006, 0.34]), "#55585E"); }
  // headrest on two chrome posts
  const tp = at(0.62), hr = at(0.76);
  for (const s of [-1, 1]) m.add("chrome", cyl(8), L([(tp[0] + hr[0]) / 2, (tp[1] + hr[1]) / 2, zc + s * 0.075], [0, 0, rec], [0.006, 0.16, 0.006]), "#B9BEC6");
  m.add("cloth", rbox(0.095, 0.18, 0.26, 0.045), L([hr[0], hr[1], zc], [0, 0, rec]), C.headrest);
  // the recline lever (outboard, at the hinge) and the walk-in slide lever on the outboard shoulder
  m.add("plastic", rbox(0.13, 0.025, 0.03, 0.01), L([px + 0.05, py - 0.02, zc + out * 0.255], [0, 0, -0.25]), C.black);
  const sh = at(0.57, 0.0); m.add("plastic", rbox(0.06, 0.02, 0.05, 0.008), L([sh[0] - 0.02, sh[1] + 0.01, zc + out * 0.19], [0, 0, rec]), C.black);
  // the buckle on its stalk (inboard)
  m.add("plastic", box(), L([-0.36, 0.5, zc - out * 0.26], [0, 0, 0.35], [0.03, 0.12, 0.025]), C.black);
  m.add("plastic", box(), L([-0.34, 0.565, zc - out * 0.26], [0, 0, 0.35], [0.04, 0.05, 0.03]), "#202226");
  m.add("plastic", box(), L([-0.326, 0.582, zc - out * 0.26], [0, 0, 0.35], [0.012, 0.012, 0.016]), C.red);
};

// ── the dashboard: an extruded side section (two tiers), the centre pod, the stack, vents, gloveboxes ──────────────────────────────
const DASH = [[1.07, 0.975], [1.0, 1.006], [0.82, 1.01], [0.69, 1.0], [0.62, 0.968], [0.596, 0.925], [0.6, 0.86], [0.607, 0.8], [0.632, 0.778], [0.648, 0.765], [0.64, 0.72], [0.645, 0.64], [0.68, 0.56], [0.76, 0.51], [0.9, 0.475], [1.07, 0.47]];
const HALF = 0.735;
const faceX = (y) => {   // the dash face's x at height y (the rear-facing part of the section)
  const f = DASH.slice(3, 13);
  for (let i = 0; i < f.length - 1; i++) { const [x0, y0] = f[i], [x1, y1] = f[i + 1]; if ((y <= y0 && y >= y1)) return x0 + (x1 - x0) * (y - y0) / (y1 - y0); }
  return 0.62;
};
const dash = (m) => {
  const s = new THREE.Shape(); s.moveTo(DASH[0][0], DASH[0][1]);
  for (let i = 1; i < DASH.length; i++) s.lineTo(DASH[i][0], DASH[i][1]);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: HALF * 2, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 4 });
  m.add("plastic", g, L([0, 0, -HALF]), C.dash);
  // a darker top pad and the defroster grille along the windshield base; the passenger airbag seam
  m.add("plastic", rbox(0.3, 0.012, HALF * 2 - 0.06, 0.005), L([0.84, 1.016, 0]), C.dashTop);
  for (let k = 0; k < 22; k++) m.add("plastic", box(), L([0.985, 1.014, -0.6 + k * 0.057], [0, 0, 0], [0.04, 0.006, 0.03]), "#0C0D0F");
  m.add("plastic", box(), L([0.74, 1.008, 0.43], [0, 0, -0.15], [0.16, 0.006, 0.36]), "#2A2C30");
  // the dash-top lidded box on the passenger side (the Liftback's upper glovebox) with its latch
  m.add("plastic", rbox(0.14, 0.012, 0.3, 0.004), L([0.69, 1.004, 0.42], [0, 0, -0.18]), "#34373C");
  m.add("chrome", box(), L([0.625, 0.975, 0.42], [0, 0, -0.9], [0.03, 0.006, 0.07]), "#6A7078");
  // the lower glovebox lid on the lower tier, with its handle
  const gy = 0.69, gx = faceX(gy);
  m.add("plastic", rbox(0.016, 0.11, 0.34, 0.006), L([gx - 0.008, gy, 0.42], [0, 0, 0.05]), "#383B40");
  m.add("plastic", box(), L([gx - 0.018, gy + 0.035, 0.42], [0, 0, 0], [0.012, 0.016, 0.09]), "#16171A");
  // the knee bolster under the column, the fuse panel
  m.add("plastic", rbox(0.03, 0.14, 0.34, 0.01), L([faceX(0.68) - 0.01, 0.66, -0.38], [0, 0, 0.12]), "#35383D");
  // the CENTRE POD: a hooded binnacle on top of the dash centre, turned a little toward the driver
  m.pushR([0.665, 1.0, 0.0], [0, -0.12, 0]);
  m.add("plastic", rbox(0.13, 0.085, 0.38, 0.03), L([0.025, 0.04, 0]), C.dashTop);                       // the pod's body
  m.add("plastic", GC.hood ??= new THREE.CylinderGeometry(0.085, 0.085, 0.4, 20, 1, true, Math.PI / 2, Math.PI), L([0.0, 0.055, 0], [Math.PI / 2, 0, 0], [1, 1, 0.75]), "#2C2F33");   // the rounded hood over the faces
  m.add("plastic", GC.hcap ??= new THREE.CircleGeometry(0.085, 20, 0, Math.PI), L([0.0, 0.055, 0.2], [0, 0, 0], [1, 0.75, 1]), "#1E2024");
  m.add("plastic", GC.hcap, L([0.0, 0.055, -0.2], [0, Math.PI, 0], [1, 0.75, 1]), "#1E2024");
  m.add("gauge", quad(), Mb([-0.045, 0.05, 0], V(0, 0, 1), V(0.3, 1, 0), V(-1, 0.3, 0), [0.36, 0.135, 1]), "#FFFFFF");
  m.pop();
  // the centre stack (a narrow tower, the face tilted back)
  const sy0 = 0.5, sy1 = 0.96;
  const top = V(0.6, sy1, 0), bot = V(0.665, sy0, 0), up = top.clone().sub(bot).normalize(), nrm = V(0, 0, 1).cross(up).normalize();
  const sc = top.clone().add(bot).multiplyScalar(0.5);
  m.add("plastic", box(), Mb([sc.x + 0.03, sc.y, 0], V(0, 0, 1), up, nrm, [0.27, 0.49, 0.06]), C.trim);
  m.add("stack", quad(), Mb([sc.x - 0.0015, sc.y, 0], V(0, 0, 1), up, nrm, [0.245, 0.47, 1]), "#FFFFFF");
  // the three HVAC knobs and the two radio knobs stand proud of the face
  const onFace = (u, v, d) => sc.clone().add(V(0, 0, 1).multiplyScalar(u)).add(up.clone().multiplyScalar(v)).add(nrm.clone().multiplyScalar(d));
  for (const [u, v, r] of [[-0.0725, -0.0815, 0.024], [0, -0.0815, 0.024], [0.0725, -0.0815, 0.024], [-0.084, 0.0615, 0.017], [0.084, 0.0615, 0.017]]) {
    const p = onFace(u, v, 0.012); m.add("plastic", cyl(20), Mb([p.x, p.y, p.z], V(0, 0, 1), nrm, up, [r, 0.024, r]), "#4A4E55");
    const q = onFace(u, v, 0.025); m.add("chrome", box(), Mb([q.x, q.y, q.z], V(0, 0, 1), up, nrm, [0.004, r * 1.4, 0.004]), "#E6EAF0");
  }
  // the round outboard vents at the dash ends
  for (const z of [-0.64, 0.64]) {
    const x = faceX(0.9) - 0.006;
    m.add("plastic", cyl(24), L([x + 0.01, 0.9, z], [0, 0, Math.PI / 2], [0.058, 0.03, 0.058]), "#2A2D31");
    m.add("vent", disc(24), Mb([x - 0.006, 0.9, z], V(0, 0, 1), V(0, 1, 0), V(-1, 0, 0), [0.052, 0.052, 1]), "#FFFFFF");
  }
  // the bulkhead and the kick panels (hide the front wheel housings)
  m.add("carpet", box(), L([0.86, 0.46, 0], [0, 0, 0], [0.1, 0.3, 1.24]), C.carpet);
  for (const s of [-1, 1]) m.add("plastic", box(), L([0.72, 0.47, s * 0.69], [0, 0, 0], [0.2, 0.34, 0.12]), C.trim);
};

// ── the steering wheel, column and stalks (driver at z = −0.37) ──────────────────────────────────────────────────────────────
const wheel = (m) => {
  const zc = -0.37, beta = 0.5, c = V(0.33, 0.9, zc);
  const n = V(-Math.cos(beta), Math.sin(beta), 0), up = V(Math.sin(beta), Math.cos(beta), 0), side = V(0, 0, 1);
  m.add("plastic", torus(), Mb([c.x, c.y, c.z], side, up, n), "#1E1F22");
  // the 3 spokes (left, right, lower), the hub pad with a plain chrome ellipse ring
  const P = (u, v, w = 0) => c.clone().add(side.clone().multiplyScalar(u)).add(up.clone().multiplyScalar(v)).add(n.clone().multiplyScalar(w));
  for (const [u, v, len, ang] of [[-0.11, -0.01, 0.14, 0], [0.11, -0.01, 0.14, 0], [0, -0.11, 0.12, Math.PI / 2]]) {
    const p = P(u, v, -0.012); const a = side.clone().multiplyScalar(Math.cos(ang)).add(up.clone().multiplyScalar(Math.sin(ang)));
    const b = n.clone().cross(a);
    m.add("plastic", box(), Mb([p.x, p.y, p.z], a, b, n, [len, 0.045, 0.02]), "#25272B");
  }
  const h = P(0, -0.005, 0.004); m.add("plastic", rbox(0.14, 0.11, 0.06, 0.025), Mb([h.x, h.y, h.z], side, up, n), "#202226");
  const e = P(0, 0.0, 0.036); m.add("chrome", GC.el ??= new THREE.TorusGeometry(0.018, 0.0025, 6, 24), Mb([e.x, e.y, e.z], side, up, n, [1, 0.68, 1]), C.chrome);
  // the column shroud and the two stalks
  const s0 = P(0, 0, -0.1); m.add("plastic", rbox(0.12, 0.09, 0.16, 0.025), Mb([s0.x, s0.y, s0.z], side, up, n), "#2A2C30");
  const col = P(0, -0.02, -0.25); m.add("plastic", cyl(12), Mb([col.x, col.y, col.z], side, n, up, [0.035, 0.22, 0.035]), "#232528");
  for (const s of [-1, 1]) { const p = P(s * 0.1, 0.0, -0.07); m.add("plastic", cyl(8), Mb([p.x, p.y, p.z], up, side, n, [0.007, 0.14, 0.007]), "#1C1D20"); }
};

// ── the console: tunnel, cupholders, the shifter (5-speed manual), the handbrake ────────────────────────────────────────────────
const consoleParts = (m) => {
  m.add("carpet", rbox(1.0, 0.12, 0.22, 0.04), L([0.14, 0.34, 0]), C.carpet);
  m.add("plastic", rbox(0.42, 0.18, 0.22, 0.03), L([0.43, 0.43, 0]), C.trim);
  for (const x of [0.55, 0.47]) m.add("plastic", cyl(16), L([x, 0.515, 0], [0, 0, 0], [0.036, 0.012, 0.036]), "#0B0C0E");
  // the shifter: boot, lever, round knob
  m.add("plastic", cone(16), L([0.34, 0.55, 0], [0, 0, 0], [0.06, 0.07, 0.06]), "#141517");
  m.add("chrome", cyl(8), L([0.33, 0.62, 0], [0, 0, 0.12], [0.008, 0.1, 0.008]), "#5A5F66");
  m.add("plastic", sph(14), L([0.322, 0.675, 0], [0, 0, 0], [0.034, 0.03, 0.034]), "#1A1B1E");
  // the handbrake lever (its grip, release button) in its boot, the rear console end
  m.add("plastic", rbox(0.24, 0.16, 0.16, 0.03), L([0.03, 0.41, 0]), C.trim);
  m.add("plastic", rbox(0.3, 0.04, 0.05, 0.015), L([0.06, 0.505, 0], [0, 0, -0.32]), "#1C1D20");
  m.add("chrome", cyl(10), L([-0.085, 0.555, 0], [0, 0, Math.PI / 2 - 0.32], [0.008, 0.02, 0.008]), "#8A9099");
};

// ── a door card's fittings on side s (+1 right / −1 left) ───────────────────────────────────────────────────────────────────
const doorCard = (m, s) => {
  const zf = (x, y, d) => s * (zin(x, y) - d);
  const bel = (x) => beltY(x);
  // the upper trim along the belt (lighter grey), the armrest + pull cup, the map pocket, the speaker
  for (let x = 0.72; x > -0.42; x -= 0.12) m.add("plastic", box(), L([x - 0.06, bel(x) - 0.03, zf(x, bel(x) - 0.03, 0.02)], [0, 0, 0], [0.125, 0.05, 0.04]), C.lightTrim);
  m.add("plastic", rbox(0.52, 0.045, 0.09, 0.015), L([0.08, 0.7, zf(0.08, 0.7, 0.045)]), C.trim);
  m.add("plastic", rbox(0.13, 0.05, 0.06, 0.015), L([-0.06, 0.745, zf(-0.06, 0.745, 0.04)]), "#26282C");
  m.add("plastic", rbox(0.7, 0.11, 0.05, 0.015), L([0.12, 0.44, zf(0.12, 0.44, 0.025)]), "#2C2E32");
  m.add("spk", disc(24), Mb([0.6, 0.47, zf(0.6, 0.47, 0.052)], V(-s, 0, 0), V(0, 1, 0), V(0, 0, -s), [0.065, 0.065, 1]), "#FFFFFF");
  // the inner handle (chrome) and its bezel, the lock knob on the belt
  m.add("plastic", rbox(0.12, 0.05, 0.02, 0.01), L([0.5, 0.86, zf(0.5, 0.86, 0.012)]), "#2A2C30");
  m.add("chrome", rbox(0.09, 0.016, 0.014, 0.005), L([0.5, 0.86, zf(0.5, 0.86, 0.022)]), C.chrome);
  m.add("plastic", cyl(10), L([-0.32, bel(-0.32) + 0.01, zf(-0.32, bel(-0.32), 0.03)], [0, 0, 0], [0.007, 0.05, 0.007]), "#2A2C30");
  // the window crank (base model): hub, arm, knob
  const cz = zf(0.25, 0.6, 0.03);
  m.add("plastic", cyl(14), L([0.25, 0.6, cz], [Math.PI / 2, 0, 0], [0.022, 0.02, 0.022]), "#2A2C30");
  m.add("plastic", box(), L([0.21, 0.575, cz - s * 0.015], [0, 0, 0.6], [0.11, 0.016, 0.01]), "#2A2C30");
  m.add("plastic", cyl(10), L([0.17, 0.548, cz - s * 0.035], [Math.PI / 2, 0, 0], [0.012, 0.04, 0.012]), "#1C1D20");
};

// ── the rear bench (60/40, sliding), the quarter trims, the parcel shelf ───────────────────────────────────────────────────────
const rear = (m) => {
  const cx = -0.97, cy = 0.55, rec = 0.36;
  m.add("cloth", rbox(0.46, 0.13, 1.1, 0.05), L([cx, cy, 0], [0, 0, 0.07]), C.cloth);
  m.add("plastic", box(), L([cx + 0.02, 0.42, 0], [0, 0, 0], [0.44, 0.14, 1.08]), C.black);
  m.add("plastic", box(), L([cx + 0.005, cy + 0.066, 0.11], [0, 0, 0.07], [0.44, 0.006, 0.006]), "#3A3D42");   // the 60/40 split
  const px = -1.18, py = 0.58, ax = -Math.sin(rec), ay = Math.cos(rec);
  const at = (d) => [px + ax * d, py + ay * d];
  const bc = at(0.27); m.add("cloth", rbox(0.1, 0.54, 1.1, 0.045), L([bc[0], bc[1], 0], [0, 0, rec]), C.cloth);
  const bp = at(0.27); m.add("plastic", rbox(0.012, 0.52, 1.08, 0.006), L([bp[0] - Math.cos(rec) * 0.055, bp[1] - Math.sin(rec) * 0.055, 0], [0, 0, rec]), "#2A2C30");   // the seatback's hard rear panel
  const sp = at(0.3); m.add("plastic", box(), L([sp[0] + 0.052, sp[1], 0.11], [0, 0, rec], [0.004, 0.5, 0.006]), "#3A3D42");
  const tp = at(0.54), hr = at(0.66);
  for (const z of [-0.34, 0.34]) {
    for (const s of [-1, 1]) m.add("chrome", cyl(8), L([(tp[0] + hr[0]) / 2, (tp[1] + hr[1]) / 2, z + s * 0.07], [0, 0, rec], [0.006, 0.13, 0.006]), "#B9BEC6");
    m.add("cloth", rbox(0.085, 0.15, 0.24, 0.04), L([hr[0], hr[1], z], [0, 0, rec]), C.headrest);
  }
  // the quarter trims (over the rear wheel housings) with their armrest/cupholder, the belts' upper anchors
  for (const s of [-1, 1]) {
    m.add("plastic", box(), L([-1.33, 0.47, s * 0.615], [0, 0, 0], [0.7, 0.36, 0.02]), C.trim);           // the wheelhouse's inner wall
    m.add("plastic", rbox(0.72, 0.05, 0.17, 0.015), L([-1.33, 0.66, s * 0.69]), C.trim);
    m.add("plastic", rbox(0.75, 0.22, 0.08, 0.025), L([-1.33, 0.78, s * 0.72]), C.trim);
    m.add("plastic", rbox(0.3, 0.04, 0.1, 0.015), L([-0.85, 0.74, s * 0.69]), C.trim);
    m.add("plastic", cyl(14), L([-0.85, 0.765, s * 0.69], [0, 0, 0], [0.03, 0.012, 0.03]), "#0B0C0E");
  }
  // the parcel shelf (carpeted board) from the seatback to the hatch, its lifting strings
  const x0 = hr[0] - 0.02, x1 = hatchX(1.06) + 0.03;
  m.add("carpet", rbox(x0 - x1, 0.016, 1.18, 0.006), L([(x0 + x1) / 2, 1.05, 0]), "#2A2B2E");
  for (const s of [-1, 1]) strip(m, "plastic", [x1 + 0.03, 1.06, s * 0.5], [hatchX(1.18) + 0.02, 1.18, s * 0.45], 0.006, 0.004, "#101113", V(0, 0, 1));
  // the rear floor, the floor mats
  for (const s of [-1, 1]) m.add("carpet", box(), L([-0.66, 0.318, s * 0.38], [0, 0, 0], [0.32, 0.012, 0.42]), C.mat);
};

export const buildCabin = () => {
  const m = new Mesher();
  // the floor (carpet), front mats
  m.add("carpet", box(), L([-0.08, 0.3, 0], [0, 0, 0], [1.76, 0.02, 1.46]), C.carpet);
  for (const s of [-1, 1]) m.add("carpet", box(), L([0.42, 0.318, s * 0.38], [0, 0, 0], [0.46, 0.012, 0.44]), C.mat);
  // the sills' inner kick plates
  for (const s of [-1, 1]) m.add("plastic", box(), L([0.16, 0.36, s * (zin(0.16, 0.36) - 0.04)], [0, 0, 0], [1.2, 0.09, 0.08]), C.trim);
  frontSeat(m, -0.37, -1);
  frontSeat(m, 0.37, 1);
  dash(m);
  wheel(m);
  consoleParts(m);
  doorCard(m, 1); doorCard(m, -1);
  rear(m);
  // the B-pillar trims, the seat belts hanging from them (webbing, the tongue, the height-adjust D-ring)
  for (const s of [-1, 1]) {
    for (let y = beltY(-0.47); y < 1.39; y += 0.1) strip(m, "soft", [-0.445 + 0.12 * (y - 1), y, s * (zin(-0.445, y) - 0.012)], [-0.445 + 0.12 * (y + 0.1 - 1), y + 0.1, s * (zin(-0.445, y + 0.1) - 0.012)], 0.08, 0.02, "#8E8C86", V(0, 0, -s));
    const a = [-0.5, 1.31, s * (zin(-0.5, 1.31) - 0.035)], b = [-0.53, 0.42, s * (zin(-0.53, 0.42) - 0.05)];
    strip(m, "soft", a, b, 0.048, 0.004, C.belt, V(0, 0, -s));
    m.add("plastic", rbox(0.06, 0.035, 0.02, 0.008), L([a[0], a[1] + 0.01, a[2]]), "#202226");
    m.add("chrome", box(), L([-0.52, 0.78, s * (zin(-0.52, 0.78) - 0.06)], [0, 0, 0], [0.03, 0.06, 0.008]), "#9AA0A8");
    // the rear outboard belts from the quarter trims
    strip(m, "soft", [-1.48, 1.1, s * (zin(-1.48, 1.1) - 0.05)], [-1.2, 0.62, s * 0.6], 0.046, 0.004, C.belt, V(0, 0, -s));
  }
  // the headliner fittings: sun visors folded up, the rear-view mirror on its stem, the dome lamp
  for (const z of [-0.29, 0.29]) { const x = 0.03, y = Math.min(roofAt(x - 0.08, z + Math.sign(z) * 0.17), roofAt(x + 0.08, z + Math.sign(z) * 0.17)) - 0.03; m.add("soft", rbox(0.16, 0.022, 0.34, 0.01), L([x, y, z], [0, 0, -0.2]), "#A8A59D"); }
  const mx = shieldX(1.4) - 0.05;
  strip(m, "plastic", [shieldX(1.4) - 0.01, 1.4, 0], [mx, 1.36, 0], 0.025, 0.012, "#1C1D20", V(-1, 0, 0));
  m.add("plastic", rbox(0.035, 0.065, 0.23, 0.015), L([mx, 1.35, 0], [0, 0.04, 0.2]), "#1C1D20");
  m.add("chrome", quad(), Mb([mx - 0.019, 1.35, 0], V(0, 0, 1), V(0.2, 1, 0), V(-1, 0.2, 0), [0.21, 0.052, 1]), "#8E99A6");
  m.add("plastic", rbox(0.14, 0.014, 0.08, 0.006), L([-0.45, roofAt(-0.45, 0) - 0.012, 0]), "#C9C7C0");
  // an ice scraper / snow brush lying on the passenger seat (Vermont winter; generic)
  m.pushR([-0.13, 0.585, 0.36], [0, 0.55, 0.05]);
  m.add("plastic", cyl(10), L([0, 0, 0], [0, 0, Math.PI / 2], [0.015, 0.42, 0.015]), "#22262C");
  m.add("plastic", rbox(0.05, 0.035, 0.16, 0.012), L([0.22, 0.005, 0]), "#2F3B4E");
  for (let k = 0; k < 10; k++) m.add("plastic", box(), L([0.255, 0.004, -0.07 + k * 0.0155], [0, 0, 0], [0.035, 0.03, 0.01]), "#1A1C20");
  m.add("plastic", rbox(0.06, 0.012, 0.11, 0.004), L([-0.235, 0, 0]), "#3C5E86");
  m.pop();
  return m.build(cabinMats());
};
