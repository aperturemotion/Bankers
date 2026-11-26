// @ts-nocheck
// ★ V38 rev 4c (builder I) — THE RETIRED COUPLE on Evart's main street (Timur, 2026-11-26: "add a retired couple, basically walking on the
//   street … really detailed and really realistic … their animation of walking is also realistic — their hand movement and their walking").
//   Two generic people in their 70s (no likeness of anyone real), built procedurally and SKINNED: each is one skeleton (pelvis → thighs →
//   shins → feet; spine → chest → neck → head; chest → upper arms → forearms → hands) driving a handful of merged skinned meshes (one per
//   material), so trousers bend through the knee, sleeves through the elbow and her coat skirt follows the thighs without seams.
//   He: grey hair under a tweed flat cap, metal glasses, a quilted navy jacket with a corduroy collar, zip and flap pockets, slacks with a
//   pressed crease, brown leather lace-ups. She: short silver hair, pearl studs, a grey-blue wool coat to the knee (buttons, slanted pocket
//   flaps, turned cuffs), a cream knit scarf with blue stripes, navy slacks, black flats and a cognac handbag carried by its handles.
//   THE WALK (an older pace: 0.95 m/s; he 96 steps/min, she 103 — they never move in lockstep): an analytic gait in which every stance foot
//   is PLANTED in the world (heel strike about the heel, foot flat, then a rolling heel-rise over the shoe's curved forefoot, no slip), the
//   swing foot travels plant to plant with toe clearance, the legs are solved by two-bone IK from the pelvis (which bobs, sways toward the
//   stance leg, rotates and lists) and the pelvis lowers itself whenever a leg could not reach, so a foot never slides. Shoulders counter-
//   rotate, the head is held steady, the free arms swing opposite the legs with a relaxed elbow and a lagging hand; their inner hands hold
//   (solved by IK to a shared grip that sways), and her handbag hangs from her outer hand as a damped pendulum.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";

const PI = Math.PI, TAU = 2 * PI;
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sm = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;
const v3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const AX = { x: v3(1, 0, 0), y: v3(0, 1, 0), z: v3(0, 0, 1) };
const qa = (ax, a) => new THREE.Quaternion().setFromAxisAngle(AX[ax], a);
const qm = (...qs) => qs.reduce((acc, q) => acc.multiply(q), new THREE.Quaternion());
const col = (hex) => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };

// ── the two bodies (metres; Y up; each faces +Z in its own space; +X is the person's LEFT) ──────────────────────────────────────
const mk = (fem) => {
  const S = fem
    ? { fem, ankleH: 0.075, thigh: 0.40, shin: 0.39, hipX: 0.084, heel: 0.058, ball: 0.122, tip: 0.178, footW: 0.042,
        shX: 0.163, upper: 0.272, fore: 0.232, hand: 0.165, cad: 103, stepW: 0.13, chestY: 1.17, neckY: 1.375, headY: 1.448, shY: 1.322,
        hc: [0, 0.074, 0.016], R: { rx: 0.071, ry: 0.107, rz: 0.09 } }
    : { fem, ankleH: 0.085, thigh: 0.43, shin: 0.42, hipX: 0.088, heel: 0.066, ball: 0.14, tip: 0.205, footW: 0.05,
        shX: 0.182, upper: 0.295, fore: 0.255, hand: 0.185, cad: 96, stepW: 0.14, chestY: 1.25, neckY: 1.49, headY: 1.565, shY: 1.425,
        hc: [0, 0.08, 0.018], R: { rx: 0.077, ry: 0.115, rz: 0.097 } };
  S.hipY = S.ankleH + S.shin + S.thigh;
  S.spineY = S.hipY + 0.09;
  return S;
};
// bones: index, parent, bind position (world, rest rotations are identity)
const BONES = ["hips", "spine", "chest", "neck", "head", "upL", "foL", "haL", "upR", "foR", "haR", "thL", "shL", "ftL", "thR", "shR", "ftR"];
const PARENT = [-1, 0, 1, 2, 3, 2, 5, 6, 2, 8, 9, 0, 11, 12, 0, 14, 15];
const B = Object.fromEntries(BONES.map((n, i) => [n, i]));
const bindPos = (S) => {
  const p = [];
  p[B.hips] = [0, S.hipY, 0]; p[B.spine] = [0, S.spineY, -0.005]; p[B.chest] = [0, S.chestY, -0.01]; p[B.neck] = [0, S.neckY, 0];
  p[B.head] = [0, S.headY, 0.01];
  for (const [s, u, f, h] of [[1, "upL", "foL", "haL"], [-1, "upR", "foR", "haR"]]) {
    p[B[u]] = [s * S.shX, S.shY, -0.01]; p[B[f]] = [s * S.shX, S.shY - S.upper, -0.01]; p[B[h]] = [s * S.shX, S.shY - S.upper - S.fore, -0.01];
  }
  for (const [s, t, k, a] of [[1, "thL", "shL", "ftL"], [-1, "thR", "shR", "ftR"]]) {
    p[B[t]] = [s * S.hipX, S.hipY, 0]; p[B[k]] = [s * S.hipX, S.hipY - S.thigh, 0]; p[B[a]] = [s * S.hipX, S.ankleH, 0];
  }
  return p;
};
// each bone's segment (head → tail) for the distance-based skin weights
const segsOf = (S, P) => {
  const s = [];
  const add = (b, a, t) => { s[b] = [v3(...a), v3(...t)]; };
  add(B.hips, [-S.hipX, S.hipY, 0], [S.hipX, S.hipY, 0]);
  add(B.spine, P[B.spine], P[B.chest]); add(B.chest, P[B.chest], P[B.neck]); add(B.neck, P[B.neck], P[B.head]);
  add(B.head, P[B.head], [0, S.headY + 0.2, 0.02]);
  for (const sd of ["L", "R"]) {
    add(B["up" + sd], P[B["up" + sd]], P[B["fo" + sd]]); add(B["fo" + sd], P[B["fo" + sd]], P[B["ha" + sd]]);
    const h = P[B["ha" + sd]]; add(B["ha" + sd], h, [h[0], h[1] - S.hand, h[2]]);
    add(B["th" + sd], P[B["th" + sd]], P[B["sh" + sd]]); add(B["sh" + sd], P[B["sh" + sd]], P[B["ft" + sd]]);
    const a = P[B["ft" + sd]]; add(B["ft" + sd], a, [a[0], 0.02, S.ball]);
  }
  return s;
};
const segD = (p, [a, b]) => {
  const ab = b.clone().sub(a), t = cl(p.clone().sub(a).dot(ab) / Math.max(1e-9, ab.lengthSq()));
  return p.distanceTo(a.clone().addScaledVector(ab, t));
};

// ── geometry: grids, lofts, and the per-material skinned accumulator ───────────────────────────────────────────────────────────
// a grid surface: pt(i, j) for i ∈ 0..nu (around), j ∈ 0..nv (along); wrap = the i seam is closed (normals averaged)
const mkGeo = (P, UV, nu, nv, wrap) => {
  const I = [];
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1;
    I.push(a, c, b, b, c, d);
  }
  // outward winding: the signed volume about the centroid must be positive
  let cx = 0, cy = 0, cz = 0; const n = P.length / 3;
  for (let k = 0; k < n; k++) { cx += P[3 * k]; cy += P[3 * k + 1]; cz += P[3 * k + 2]; }
  cx /= n; cy /= n; cz /= n;
  let vol = 0;
  for (let t = 0; t < I.length; t += 3) {
    const A = [P[3 * I[t]] - cx, P[3 * I[t] + 1] - cy, P[3 * I[t] + 2] - cz], Bv = [P[3 * I[t + 1]] - cx, P[3 * I[t + 1] + 1] - cy, P[3 * I[t + 1] + 2] - cz], C = [P[3 * I[t + 2]] - cx, P[3 * I[t + 2] + 1] - cy, P[3 * I[t + 2] + 2] - cz];
    vol += A[0] * (Bv[1] * C[2] - Bv[2] * C[1]) - A[1] * (Bv[0] * C[2] - Bv[2] * C[0]) + A[2] * (Bv[0] * C[1] - Bv[1] * C[0]);
  }
  if (vol < 0) for (let t = 0; t < I.length; t += 3) { const x = I[t + 1]; I[t + 1] = I[t + 2]; I[t + 2] = x; }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(UV, 2));
  g.setIndex(I);
  g.computeVertexNormals();
  if (wrap) {
    const N = g.attributes.normal;
    for (let j = 0; j <= nv; j++) {
      const a = j * (nu + 1), b = a + nu;
      const x = N.getX(a) + N.getX(b), y = N.getY(a) + N.getY(b), z = N.getZ(a) + N.getZ(b), l = Math.hypot(x, y, z) || 1;
      N.setXYZ(a, x / l, y / l, z / l); N.setXYZ(b, x / l, y / l, z / l);
    }
  }
  return g;
};
const grid = (nu, nv, pt, uvf, wrap = true) => {
  const P = [], UV = [];
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
    const p = pt(i / nu, j / nv); P.push(p[0], p[1], p[2]);
    const uv = uvf ? uvf(i / nu, j / nv, p) : [i / nu, j / nv]; UV.push(uv[0], uv[1]);
  }
  return mkGeo(P, UV, nu, nv, wrap);
};
// a loft: rings [{ c:[x,y,z], sec:(θ)→[a,b], t?:tangent, f?:front reference }]; θ = 0 is the front (+b); UVs in METRES (u around, v along)
const loft = (rings, nu, opts = {}) => {
  const P = [], UV = [];
  let vacc = 0;
  const n = rings.length;
  for (let r = 0; r < n; r++) {
    const R = rings[r], c = v3(...R.c);
    let T;
    if (R.t) T = v3(...R.t).normalize();
    else {
      let a = r, b = r;
      do { a = Math.max(0, a - 1); b = Math.min(n - 1, b + 1); T = v3(...rings[b].c).sub(v3(...rings[a].c)); } while (T.lengthSq() < 1e-10 && (a > 0 || b < n - 1));
      if (T.lengthSq() < 1e-10) T = v3(0, 1, 0); T.normalize();
    }
    const F = v3(...(R.f ?? opts.f ?? [0, 0, 1]));
    const Zv = F.clone().sub(T.clone().multiplyScalar(F.dot(T))).normalize();
    const Xv = T.clone().cross(Zv);
    if (r > 0) vacc += c.distanceTo(v3(...rings[r - 1].c)) + 0.0001;
    let ua = 0, last = null;
    for (let i = 0; i <= nu; i++) {
      const th = (opts.th0 ?? 0) + (i / nu) * (opts.span ?? TAU);
      const [a, b] = R.sec(th);
      const p = c.clone().addScaledVector(Xv, a).addScaledVector(Zv, b);
      if (last) ua += p.distanceTo(last); last = p;
      P.push(p.x, p.y, p.z); UV.push(opts.uv ? opts.uv[0] : opts.uTheta ? (i / nu) * opts.uTheta : ua, opts.uv ? opts.uv[1] : vacc);
    }
  }
  return mkGeo(P, UV, nu, n - 1, opts.span == null);
};
// cross-sections
const se = (w, f, b, n = 2.4, zo = 0, xo = 0) => (th) => {
  const s = Math.sin(th), c = Math.cos(th), e = 2 / n;
  return [xo + w * Math.sign(s) * Math.abs(s) ** e, zo + (c >= 0 ? f : b) * Math.sign(c) * Math.abs(c) ** e];
};
const circ = (r, rz = r, zo = 0, xo = 0) => (th) => [xo + r * Math.sin(th), zo + rz * Math.cos(th)];
const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));
// the accumulator: per material, positions/normals/uv/colour + 4 skin influences per vertex
class Acc {
  constructor(segs) { this.segs = segs; this.m = {}; }
  add(mat, g, M, bones, color = "#ffffff", uvConst = null) {
    const k = (this.m[mat] ??= { p: [], n: [], uv: [], c: [], si: [], sw: [], i: [] });
    const base = k.p.length / 3, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv;
    const nm = new THREE.Matrix3().getNormalMatrix(M), flip = M.determinant() < 0;
    const [cr, cg, cb] = col(color);
    for (let i = 0; i < P.count; i++) {
      const p = v3(P.getX(i), P.getY(i), P.getZ(i)).applyMatrix4(M), n = v3(N.getX(i), N.getY(i), N.getZ(i)).applyMatrix3(nm).normalize();
      k.p.push(p.x, p.y, p.z); k.n.push(n.x, n.y, n.z); k.c.push(cr, cg, cb);
      if (uvConst) k.uv.push(uvConst[0], uvConst[1]); else k.uv.push(U.getX(i), U.getY(i));
      let w;
      if (typeof bones === "number") w = [[bones, 1]];
      else if (typeof bones === "function") w = bones(p);
      else {
        w = bones.map(([b, bias]) => [b, bias / Math.max(1e-6, segD(p, this.segs[b])) ** 4]);
        w.sort((a, b) => b[1] - a[1]); w = w.slice(0, 4);
      }
      const s = w.reduce((a, q) => a + q[1], 0) || 1;
      for (let j = 0; j < 4; j++) { k.si.push(w[j] ? w[j][0] : 0); k.sw.push(w[j] ? w[j][1] / s : 0); }
    }
    const I = g.index.array;
    for (let t = 0; t < I.length; t += 3) flip ? k.i.push(base + I[t], base + I[t + 2], base + I[t + 1]) : k.i.push(base + I[t], base + I[t + 1], base + I[t + 2]);
  }
  meshes(mats, skeleton) {
    const out = [];
    for (const [name, k] of Object.entries(this.m)) {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(k.p, 3));
      g.setAttribute("normal", new THREE.Float32BufferAttribute(k.n, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(k.uv, 2));
      g.setAttribute("color", new THREE.Float32BufferAttribute(k.c, 3));
      g.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(k.si, 4));
      g.setAttribute("skinWeight", new THREE.Float32BufferAttribute(k.sw, 4));
      g.setIndex(k.i);
      const m = new THREE.SkinnedMesh(g, mats[name]);
      m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
      m.bind(skeleton, new THREE.Matrix4());
      out.push(m);
    }
    return out;
  }
  tris() { return Object.values(this.m).reduce((a, k) => a + k.i.length / 3, 0); }
}
const T4 = (p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) => new THREE.Matrix4().compose(v3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r, "YXZ")), v3(...s));

// ── textures: grey-scale tiles (the garment's hue is its vertex colour), each with a matching bump map; UVs are metres ─────────────
const bumpCache = new Map();
const tile = (key, px, metres, draw) => {
  const map = canvasTex("cpl_" + key, px, px, draw);
  map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(1 / metres, 1 / metres);
  if (!bumpCache.has(key)) {
    const b = new THREE.CanvasTexture(map.image); b.colorSpace = THREE.NoColorSpace; b.wrapS = b.wrapT = THREE.RepeatWrapping;
    b.repeat.set(1 / metres, 1 / metres); b.needsUpdate = true; bumpCache.set(key, b);
  }
  return { map, bump: bumpCache.get(key) };
};
const pix = (c, w, h, fn) => {
  const im = c.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = fn(x, y), o = 4 * (y * w + x); const g = Math.round(cl(v) * 255); im.data[o] = im.data[o + 1] = im.data[o + 2] = g; im.data[o + 3] = 255; }
  c.putImageData(im, 0, 0);
};
const hn = (x, y) => rnd(x * 7.13 + y * 311.7);   // hashed noise
const TEX = {
  // diamond quilting: puffed cells, sunken stitch lines (5 cm diamonds)
  quilt: () => tile("quilt", 512, 0.2, (c, w, h) => pix(c, w, h, (x, y) => {
    const p = w / 4, a = ((x + y) % p + p) % p, b = ((x - y) % p + p) % p;
    const d = Math.min(a, p - a, b, p - b) / (p / 2);
    const stitch = Math.min(a, p - a) < 1.4 || Math.min(b, p - b) < 1.4 ? ((x + y) % 6 < 3 ? 0.42 : 0.6) : 1;
    return (0.66 + 0.34 * Math.sqrt(cl(d * 2.2))) * stitch * (0.95 + 0.05 * hn(x, y));
  })),
  // a wool twill: fine diagonal wales + fibre noise
  wool: () => tile("wool", 256, 0.05, (c, w, h) => pix(c, w, h, (x, y) => 0.82 + 0.08 * Math.sin((x + y) * TAU / 6) + 0.1 * hn(x, y))),
  twill: () => tile("twill", 256, 0.035, (c, w, h) => pix(c, w, h, (x, y) => 0.85 + 0.07 * Math.sin((x - 2 * y) * TAU / 8) + 0.08 * hn(x, y))),
  // herringbone tweed with flecks
  tweed: () => tile("tweed", 256, 0.05, (c, w, h) => pix(c, w, h, (x, y) => {
    const band = Math.floor(x / 32) % 2 ? 1 : -1;
    return 0.72 + 0.12 * Math.sin((y + band * x) * TAU / 10) + (hn(x, y) > 0.97 ? 0.25 : 0.08 * hn(x + 3, y));
  })),
  // corduroy: vertical wales
  cord: () => tile("cord", 128, 0.03, (c, w, h) => pix(c, w, h, (x, y) => 0.7 + 0.3 * Math.abs(Math.sin(x * TAU / 16)) + 0.04 * hn(x, y))),
  // a rib knit with two thin stripes per repeat (the colour stripes come from the map: dark rows)
  knit: () => tile("knit", 256, 0.14, (c, w, h) => pix(c, w, h, (x, y) => {
    const rib = 0.82 + 0.16 * Math.abs(Math.sin(x * TAU / 12)) * (0.8 + 0.2 * Math.sin(y * TAU / 8));
    const stripe = (y > 150 && y < 162) || (y > 172 && y < 178) ? 0.42 : 1;
    return rib * stripe;
  })),
  hair: () => tile("hair", 256, 0.04, (c, w, h) => pix(c, w, h, (x, y) => 0.72 + 0.28 * hn(Math.floor(x / 2), Math.floor(y / 40 + x * 0.13)) * (0.8 + 0.2 * Math.sin(y / 9 + x)))),
  leather: () => tile("leather", 256, 0.06, (c, w, h) => pix(c, w, h, (x, y) => 0.88 + 0.1 * hn(Math.floor(x / 3), Math.floor(y / 3)) - 0.06 * hn(x, y))),
};
// the face, painted in the head's (longitude, latitude) space: u = 0.5 + lon/2π, v = 0.5 + lat/π
const faceTex = (fem) => canvasTex(fem ? "cpl_face_f" : "cpl_face_m", 1024, 512, (c, w, h) => {
  const X = (lon) => (0.5 + lon / TAU) * w, Y = (lat) => (0.5 - lat / PI) * h;
  const skin = fem ? [222, 178, 156] : [206, 158, 132];
  c.fillStyle = `rgb(${skin})`; c.fillRect(0, 0, w, h);
  // fine skin mottling and a few age spots
  for (let i = 0; i < 2600; i++) { const a = rnd(i * 3 + (fem ? 9 : 1)); c.fillStyle = `rgba(${a > 0.5 ? "150,90,70" : "255,235,220"},${0.03 + 0.04 * rnd(i + 5)})`; c.beginPath(); c.arc(rnd(i + 1) * w, rnd(i + 2) * h, 1 + 3 * rnd(i + 3), 0, TAU); c.fill(); }
  for (let i = 0; i < (fem ? 6 : 12); i++) { c.fillStyle = "rgba(140,90,60,0.18)"; c.beginPath(); c.arc(X((rnd(i + 40) - 0.5) * 1.6), Y(0.3 + 0.7 * rnd(i + 41)), 2 + 3 * rnd(i + 42), 0, TAU); c.fill(); }
  const blob = (lon, lat, rx, ry, rgba) => { const g = c.createRadialGradient(X(lon), Y(lat), 0, X(lon), Y(lat), rx); g.addColorStop(0, rgba); g.addColorStop(1, "rgba(0,0,0,0)"); c.save(); c.translate(X(lon), Y(lat)); c.scale(1, ry / rx); c.translate(-X(lon), -Y(lat)); c.fillStyle = g; c.fillRect(X(lon) - rx, Y(lat) - rx, 2 * rx, 2 * rx); c.restore(); };
  for (const s of [-1, 1]) {
    blob(s * 0.56, -0.28, 60, 40, fem ? "rgba(214,120,120,0.32)" : "rgba(200,110,100,0.28)");   // cheeks
    blob(s * 0.4, -0.06, 30, 14, "rgba(120,70,70,0.22)");                                          // under the eyes
    blob(s * 0.4, 0.04, 34, 16, "rgba(110,70,60,0.25)");                                           // the socket's shade
    // the eye: white, iris, pupil, lids and lashes
    const ex = X(s * 0.4), ey = Y(0.035), ew = 25, eh = 6.2;   // rev 4c review: a relaxed, slightly hooded eye (it stared)
    c.save(); c.beginPath(); c.ellipse(ex, ey, ew, eh, 0, 0, TAU); c.clip();
    c.fillStyle = "rgb(206,196,188)"; c.fillRect(ex - ew, ey - eh, 2 * ew, 2 * eh);
    c.fillStyle = fem ? "rgb(86,112,132)" : "rgb(92,78,62)"; c.beginPath(); c.arc(ex - s * 2, ey + 1, 8.5, 0, TAU); c.fill();
    c.fillStyle = "rgb(20,16,14)"; c.beginPath(); c.arc(ex - s * 2, ey + 1, 3.6, 0, TAU); c.fill();
    c.fillStyle = "rgba(255,255,255,0.85)"; c.beginPath(); c.arc(ex - s * 2 - 3, ey - 2, 1.6, 0, TAU); c.fill();
    c.fillStyle = "rgba(90,50,40,0.5)"; c.fillRect(ex - ew, ey - eh, 2 * ew, 5.5);    // the upper lid's shadow (heavier: the lid covers the iris top)
    c.restore();
    c.strokeStyle = fem ? "rgba(50,34,30,0.85)" : "rgba(70,46,36,0.7)"; c.lineWidth = fem ? 3 : 2.2;
    c.beginPath(); c.ellipse(ex, ey, ew, eh, 0, PI * 1.05, PI * 1.95); c.stroke();
    c.strokeStyle = "rgba(120,70,60,0.35)"; c.lineWidth = 1.5; c.beginPath(); c.ellipse(ex, ey + 2, ew * 0.9, eh * 1.6, 0, PI * 0.15, PI * 0.85); c.stroke();
    c.beginPath(); c.ellipse(ex, ey - 5, ew * 1.05, eh * 1.4, 0, PI * 1.1, PI * 1.9); c.stroke();   // the lid crease
    // crow's feet
    for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(X(s * 0.55), Y(0.03 + (k - 1) * 0.04)); c.lineTo(X(s * 0.64), Y(0.03 + (k - 1) * 0.06)); c.stroke(); }
    // brows: grey for him (bushier), soft silver-brown for her
    c.strokeStyle = fem ? "rgba(120,100,92,0.8)" : "rgba(170,168,166,0.95)"; c.lineWidth = fem ? 6 : 11; c.lineCap = "round";
    c.beginPath(); c.moveTo(X(s * 0.2), Y(0.12)); c.quadraticCurveTo(X(s * 0.42), Y(fem ? 0.19 : 0.17), X(s * 0.6), Y(0.11)); c.stroke();
    // the nasolabial fold
    c.strokeStyle = "rgba(120,70,60,0.35)"; c.lineWidth = 3; c.beginPath(); c.moveTo(X(s * 0.15), Y(-0.36)); c.quadraticCurveTo(X(s * 0.26), Y(-0.5), X(s * 0.24), Y(-0.66)); c.stroke();
  }
  // forehead lines
  c.strokeStyle = "rgba(120,72,60,0.28)"; c.lineWidth = 2;
  for (let k = 0; k < (fem ? 2 : 4); k++) { c.beginPath(); c.moveTo(X(-0.32), Y(0.34 + k * 0.06)); c.quadraticCurveTo(X(0), Y(0.36 + k * 0.06), X(0.32), Y(0.34 + k * 0.06)); c.stroke(); }
  // the nose's shading and nostrils
  blob(0, -0.38, 22, 10, "rgba(90,50,40,0.45)");
  for (const s of [-1, 1]) { blob(s * 1.0, 0.1, 110, 160, "rgba(110,60,50,0.22)"); blob(s * 0.55, -0.85, 90, 50, "rgba(100,60,50,0.2)"); }
  // the mouth: muted lips, a darker parting line
  c.fillStyle = fem ? "rgba(178,106,110,0.8)" : "rgba(160,100,92,0.6)";   // rev 4c review: closed, thinner lips
  c.beginPath(); c.ellipse(X(0), Y(-0.6), 40, fem ? 6.5 : 5.5, 0, 0, TAU); c.fill();
  c.strokeStyle = "rgba(80,36,36,0.8)"; c.lineWidth = 2.4; c.beginPath(); c.moveTo(X(-0.17), Y(-0.6)); c.quadraticCurveTo(X(0), Y(-0.585), X(0.17), Y(-0.6)); c.stroke();
  blob(0, -0.78, 40, 18, "rgba(110,70,60,0.18)");   // under the lower lip
  if (!fem) { c.fillStyle = "rgba(90,80,80,0.10)"; c.fillRect(X(-0.5), Y(-0.55), X(0.5) - X(-0.5), Y(-1.3) - Y(-0.55)); }   // a shaved jaw's shadow
});

// ── the head's shape: an ellipsoid with a jaw, chin, brow, sockets, cheekbones and lips; (lon, lat) → head-centre space ─────────────
const headPt = (S, lon, lat) => {
  const { rx, ry, rz } = S.R;
  const cx = Math.cos(lat) * Math.sin(lon), cy = Math.sin(lat), cz = Math.cos(lat) * Math.cos(lon);
  let x = cx * rx, y = cy * ry, z = cz * rz;
  if (cy < -0.05) { const k = (-cy - 0.05) / 0.95; x *= 1 - (S.fem ? 0.34 : 0.24) * k * k; if (cz < 0.2) z *= 1 - 0.42 * k * cl((0.2 - cz) / 0.6); }
  if (cz > 0) z *= 1 - 0.14 * cx * cx;
  if (cz < 0 && cy > -0.3) z *= 1.04;
  const g = (a, b, la, lb) => Math.exp(-(((wrapA(lon - a)) / la) ** 2) - ((lat - b) / lb) ** 2);
  z += 0.0045 * (g(0.32, 0.15, 0.22, 0.05) + g(-0.32, 0.15, 0.22, 0.05));
  z -= 0.0065 * (g(0.4, 0.035, 0.12, 0.06) + g(-0.4, 0.035, 0.12, 0.06));
  const cb = 0.004 * (g(0.66, -0.16, 0.22, 0.12) + g(-0.66, -0.16, 0.22, 0.12));
  x += Math.sign(x) * cb; z += cb * 0.6;
  z += 0.0042 * g(0, -0.6, 0.2, 0.05) + 0.0065 * g(0, -1.0, 0.24, 0.16);
  return [x, y, z];
};
const faceUV = (lon, lat) => [0.5 + lon / TAU, 0.5 + lat / PI];
const SKIN_UV = [0.5, 0.97];   // a plain patch of the skin map (the crown): for the neck, hands, ears, nose

// ── building one person ───────────────────────────────────────────────────────────────────────────────────────────────────────
const buildPerson = (S) => {
  const P = bindPos(S), segs = segsOf(S, P), A = new Acc(segs);
  const fem = S.fem;
  const W = (...a) => a;   // readability
  // ── torso garment (jacket / coat) ──
  const rows = fem
    ? [[0.515, 0.222, 0.148, 0.158], [0.5, 0.236, 0.162, 0.172], [0.62, 0.226, 0.152, 0.162], [0.75, 0.214, 0.142, 0.152], [0.86, 0.204, 0.134, 0.146],
       [0.95, 0.188, 0.124, 0.132], [1.01, 0.168, 0.114, 0.118], [1.09, 0.166, 0.122, 0.112], [1.17, 0.168, 0.136, 0.11], [1.24, 0.17, 0.122, 0.112],
       [1.29, 0.178, 0.104, 0.106, 3.0], [1.32, 0.19, 0.094, 0.1, 3.4], [1.352, 0.168, 0.078, 0.084, 3.0], [1.375, 0.1, 0.062, 0.066], [1.39, 0.068, 0.054, 0.056]]
    : [[0.815, 0.176, 0.126, 0.116], [0.795, 0.192, 0.142, 0.132], [0.84, 0.191, 0.143, 0.131], [0.92, 0.186, 0.145, 0.126], [1.0, 0.178, 0.148, 0.12],
       [1.08, 0.172, 0.147, 0.115], [1.16, 0.17, 0.14, 0.115], [1.24, 0.172, 0.13, 0.118], [1.31, 0.178, 0.12, 0.12], [1.37, 0.19, 0.11, 0.118, 3.0],
       [1.415, 0.205, 0.098, 0.106, 3.4], [1.45, 0.19, 0.084, 0.092, 3.2], [1.482, 0.14, 0.072, 0.077, 2.6], [1.505, 0.085, 0.065, 0.065], [1.515, 0.07, 0.058, 0.058]];
  const torsoW = [[B.hips, 1], [B.spine, 1], [B.chest, 1], [B.thL, fem ? 0.9 : 0.25], [B.thR, fem ? 0.9 : 0.25]];
  // rev 4c review (Timur: "the bottom part of the [jacket] partly disappears when the leg appears"): HIS jacket below the hip joint is
  //   carried by the thighs — blended by depth below the hip, more at the front than the back, split between the two thighs across the
  //   zip — so the hem rides forward over the trouser like cloth instead of being pierced by it; above the hip the torso weights stand
  const torsoDist = (p) => { const w = [[B.hips, 1], [B.spine, 1], [B.chest, 1]].map(([b, bias]) => [b, bias / Math.max(1e-6, segD(p, segs[b])) ** 4]); const t = w.reduce((a, q) => a + q[1], 0) || 1; return w.map(([b, v]) => [b, v / t]); };
  const jacketW = (p) => {
    const below = cl((S.hipY + 0.02 - p.y) / 0.12), front = cl(0.35 + p.z / 0.2);
    const wT = below * below * (3 - 2 * below) * (0.2 + 0.6 * front);
    if (wT <= 0) return torsoDist(p);
    const wl = wT * cl(0.5 + p.x / 0.1), wr = wT * cl(0.5 - p.x / 0.1);
    return [[B.hips, 1 - wT], [B.thL, wl], [B.thR, wr]].filter((q) => q[1] > 1e-4);
  };
  A.add("coat", loft(rows.map(([y, w, f, b, n]) => ({ c: [0, y, 0], sec: se(w, f, b, n ?? 2.4) })), 40, { uTheta: 1.0 }), new THREE.Matrix4(), fem ? torsoW : jacketW, fem ? "#8796AA" : "#34445F");
  // the front surface z at (x, y) — for placing pockets, buttons, the zip
  const rowAt = (y) => { let i = 1; while (i < rows.length - 1 && rows[i][0] < y) i++; const a = rows[i - 1][0] < rows[i][0] ? rows[i - 1] : rows[i], b = rows[i]; const t = cl((y - a[0]) / Math.max(1e-6, b[0] - a[0])); return [lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[4] ?? 2.4, b[4] ?? 2.4, t)]; };
  const frontZ = (x, y) => { const [w, f, n] = rowAt(y); const s = cl(Math.abs(x) / w, 0, 0.999); const th = Math.asin(s ** (n / 2)); return f * Math.cos(th) ** (2 / n); };
  const onFront = (x, y, d = 0.002) => [x, y, frontZ(x, y) + d];
  const slope = (x, y) => Math.atan2(frontZ(x + 0.01, y) - frontZ(x - 0.01, y), 0.02);
  if (!fem) {
    // hem binding, the zip, the corduroy collar, a blue shirt collar inside it, two flap pockets
    A.add("coat", loft([[0.79, 0.195, 0.145, 0.135], [0.8, 0.196, 0.146, 0.136], [0.82, 0.193, 0.144, 0.133]].map(([y, w, f, b]) => ({ c: [0, y, 0], sec: se(w, f, b) })), 40), new THREE.Matrix4(), jacketW, "#26324A");
    const zipRows = []; for (let y = 0.8; y <= 1.5; y += 0.035) zipRows.push({ c: onFront(0, y, 0.001), sec: (th) => [0.0045 * Math.sin(th), 0.0025 * Math.cos(th)] });
    A.add("metal", loft(zipRows, 6, { f: [0, 0, 1] }), new THREE.Matrix4(), jacketW, "#2A2F36");
    A.add("metal", new THREE.BoxGeometry(0.012, 0.03, 0.005), T4([0, 1.455, frontZ(0, 1.455) + 0.006]), B.chest, "#9AA3AE");
    A.add("cord", loft([[1.49, 0.08, 0.074], [1.5, 0.082, 0.076], [1.525, 0.079, 0.073], [1.548, 0.077, 0.07], [1.55, 0.07, 0.063], [1.535, 0.069, 0.062]].map(([y, rx, rz]) => ({ c: [0, y, 0.006], sec: circ(rx, rz) })), 28), new THREE.Matrix4(), [[B.chest, 1], [B.neck, 1.2]], "#46352B");
    A.add("twill", loft([[1.53, 0.066, 0.062], [1.562, 0.064, 0.06], [1.563, 0.058, 0.055]].map(([y, rx, rz]) => ({ c: [0, y, 0.008], sec: circ(rx, rz) })), 24), new THREE.Matrix4(), [[B.neck, 1]], "#A9C3DE");
    for (const s of [-1, 1]) {
      const x = s * 0.105, y = 0.93;
      A.add("coat", new THREE.BoxGeometry(0.135, 0.13, 0.008), T4(onFront(x, y - 0.065, 0.003), [0, slope(x, y - 0.065), 0]), jacketW, "#2F3E57");
      A.add("coat", new THREE.BoxGeometry(0.145, 0.045, 0.014), T4(onFront(x, y + 0.01, 0.009), [0, slope(x, y), 0]), jacketW, "#33445F");
      A.add("metal", new THREE.CylinderGeometry(0.006, 0.006, 0.004, 10), T4(onFront(x, y + 0.008, 0.017), [PI / 2, 0, 0]), jacketW, "#8A939E");
    }
    // a chest seam (yoke) across the front
    A.add("coat", loft([...Array(15)].map((_, i) => { const x = -0.16 + i * 0.32 / 14; return { c: onFront(x, 1.31, 0.001), sec: (th) => [0.003 * Math.sin(th), 0.0018 * Math.cos(th)], t: [1, 0, 0] }; }), 4), new THREE.Matrix4(), torsoW, "#26324A");
  } else {
    // the front overlap edge, three horn buttons, slanted pocket flaps, a back belt is out of sight; princess seams
    const edge = []; for (let y = 0.505; y <= 1.36; y += 0.04) edge.push({ c: onFront(-0.025, y, 0.002), sec: (th) => [0.0045 * Math.sin(th), 0.003 * Math.cos(th)] });
    A.add("coat", loft(edge, 6), new THREE.Matrix4(), torsoW, "#7A889B");
    for (const y of [1.2, 1.06, 0.92]) A.add("metal", new THREE.CylinderGeometry(0.0125, 0.0125, 0.007, 14), T4(onFront(0.045, y, 0.004), [PI / 2, 0, 0]), torsoW, "#2E2622");
    for (const s of [-1, 1]) {
      const x = s * 0.12, y = 0.8;
      A.add("coat", new THREE.BoxGeometry(0.14, 0.038, 0.012), T4(onFront(x, y, 0.006), [0, slope(x, y), -s * 0.16]), torsoW, "#7D8CA0");
      const seam = []; for (let yy = 0.52; yy <= 1.25; yy += 0.05) seam.push({ c: onFront(s * 0.085, yy, 0.0006), sec: (th) => [0.0022 * Math.sin(th), 0.0014 * Math.cos(th)] });
      A.add("coat", loft(seam, 4), new THREE.Matrix4(), torsoW, "#73829A");
    }
  }
  // ── sleeves, cuffs and hands ──
  for (const s of [1, -1]) {
    const up = s > 0 ? B.upL : B.upR, fo = s > 0 ? B.foL : B.foR, ha = s > 0 ? B.haL : B.haR;
    const sh = P[up], M = T4(sh);
    const L = S.upper + S.fore;
    const sr = fem
      ? [[-0.002, 0.032, 0.034], [-0.012, 0.05, 0.052], [-0.03, 0.058, 0.058], [-0.07, 0.058, 0.058], [-0.16, 0.054, 0.053], [-0.272, 0.05, 0.05, -0.004], [-0.36, 0.048, 0.047], [-L + 0.06, 0.047, 0.045]]
      : [[0.0, 0.036, 0.038], [-0.012, 0.058, 0.06], [-0.03, 0.066, 0.066], [-0.06, 0.067, 0.066], [-0.15, 0.062, 0.06], [-0.25, 0.057, 0.056], [-0.295, 0.055, 0.055, -0.004], [-0.36, 0.053, 0.052], [-0.45, 0.05, 0.049], [-L + 0.015, 0.048, 0.046]];
    A.add("coat", loft(sr.map(([y, rx, rz, zo]) => ({ c: [0, y, zo ?? 0], sec: circ(rx, rz) })), 18), M, [[B.chest, 0.5], [up, 1], [fo, 1]], fem ? "#8796AA" : "#34445F");
    // cuff: a rib band (him) / a turned-back cuff (her), with an inner lip
    const cf = fem ? [[-L + 0.065, 0.05, 0.048], [-L + 0.06, 0.053, 0.051], [-L + 0.012, 0.052, 0.05], [-L + 0.008, 0.048, 0.046], [-L + 0.02, 0.04, 0.038]]
                   : [[-L + 0.02, 0.047, 0.045], [-L + 0.015, 0.047, 0.045], [-L - 0.006, 0.045, 0.043], [-L - 0.008, 0.04, 0.038], [-L + 0.01, 0.034, 0.032]];
    A.add(fem ? "coat" : "cord", loft(cf.map(([y, rx, rz]) => ({ c: [0, y, 0], sec: circ(rx, rz) })), 18), M, [[fo, 1], [ha, 0.25]], fem ? "#7F8EA3" : "#26324A");
    // the hand: palm, four slightly curled fingers, a thumb (built for the left; mirrored for the right)
    const HM = T4(P[ha], [0, 0, 0], [s, 1, 1]), k = fem ? 0.9 : 1;
    const palm = [[0.012, 0.024, 0.017], [-0.02, 0.031, 0.02], [-0.05, 0.04, 0.019], [-0.08, 0.043, 0.016], [-0.095, 0.042, 0.013], [-0.102, 0.034, 0.008], [-0.105, 0.0, 0.0]];
    A.add("skin", loft(palm.map(([y, wz, wx]) => ({ c: [-0.002, y * k, 0], sec: (th) => { const q = se(wx * k, wz * k, wz * k, 2.8)(th); return [q[0], q[1]]; } })), 14), HM, [[fo, 0.15], [ha, 1]], "#ffffff", SKIN_UV);
    const fl = [0.072, 0.081, 0.077, 0.061];
    [0.03, 0.01, -0.01, -0.029].forEach((fz, i) => {
      const rings = []; let p = v3(-0.003, -0.09 * k, fz * k), ang = 0.22 + 0.06 * i;
      const N = 6, len = fl[i] * k, r0 = (i === 3 ? 0.0082 : 0.0094) * k;
      for (let j = 0; j <= N; j++) {
        const t = v3(-Math.sin(ang), -Math.cos(ang), 0);
        const r = j === N ? r0 * 0.25 : lerp(r0, r0 * 0.8, j / N);
        rings.push({ c: [p.x, p.y, p.z], t: [t.x, t.y, t.z], sec: circ(r, r * 0.95) });
        if (j < N) { p = p.clone().addScaledVector(t, len / N); ang += 0.9 / N; }
      }
      A.add("skin", loft(rings, 8), HM, ha, "#ffffff", SKIN_UV);
    });
    const th = []; let tp = v3(-0.012, -0.022 * k, 0.036 * k), td = v3(-0.3, -0.72, 0.62).normalize();
    for (let j = 0; j <= 5; j++) {
      const r = j === 5 ? 0.003 : lerp(0.0125, 0.0095, j / 5) * k;
      th.push({ c: [tp.x, tp.y, tp.z], t: [td.x, td.y, td.z], f: [1, 0, 0], sec: circ(r) });
      tp = tp.clone().addScaledVector(td, 0.062 * k / 5); td = td.clone().lerp(v3(-0.55, -0.8, -0.15), 0.22).normalize();
    }
    A.add("skin", loft(th, 8), HM, ha, "#ffffff", SKIN_UV);
  }
  // ── trouser legs (a pressed crease), socks, shoes ──
  for (const s of [1, -1]) {
    const th = s > 0 ? B.thL : B.thR, sh = s > 0 ? B.shL : B.shR, ft = s > 0 ? B.ftL : B.ftR;
    const M = T4(P[th]), L = S.thigh + S.shin, k = fem ? 0.93 : 1;
    const tr = [[0.09, 0.098, 0.105, -0.005, -0.012], [0.0, 0.097, 0.1, 0, -0.01], [-0.08, 0.09, 0.093, 0.004, -0.006], [-0.18, 0.082, 0.084, 0.006, -0.003], [-0.3, 0.073, 0.075, 0.006, 0],
      [-0.4, 0.066, 0.068, 0.008, 0], [-S.thigh, 0.064, 0.066, 0.01, 0], [-S.thigh - 0.07, 0.062, 0.063, 0.006, 0], [-S.thigh - 0.19, 0.059, 0.059, 0.002, 0], [-L + 0.11, 0.057, 0.057, 0, 0],
      [-L + 0.04, 0.057, 0.058, 0.004, 0], [-L + (fem ? -0.005 : 0.0), 0.058, 0.06, 0.008, 0], [-L + 0.012, 0.05, 0.052, 0.006, 0]];
    const crease = (rx, rz, zo, xo, y) => (t) => { const amp = cl((-y - 0.12) / 0.1); const cr = 1 + amp * (0.06 * Math.exp(-((wrapA(t) / 0.16) ** 2)) + 0.04 * Math.exp(-((wrapA(t - PI) / 0.16) ** 2))); return [xo * s + rx * k * Math.sin(t) * cr, zo + rz * k * Math.cos(t) * cr]; };
    A.add("twill", loft(tr.map(([y, rx, rz, zo, xo]) => ({ c: [0, y, 0], sec: crease(rx, rz, zo, xo, y) })), 22), M, [[B.hips, 0.6], [th, 1], [sh, 1], [ft, 0.15]], fem ? "#232B3A" : "#5D636B");
    // the sock / tights at the ankle
    A.add("twill", loft([[-L + 0.07, 0.034], [-L + 0.02, 0.033], [-L - 0.035, 0.034]].map(([y, r]) => ({ c: [0, y, 0.004], sec: circ(r * k, r * k * 1.1) })), 12), M, [[sh, 1], [ft, 0.6]], "#1B1F28");
    // the shoe: a loft heel → toe in the foot's frame; the forefoot sole curves up (toe spring, radius 0.10 from the ball)
    const FM = T4(P[ft], [0, 0, 0], [s, 1, 1]);
    const spring = (z) => (z > S.ball ? 0.1 - Math.sqrt(Math.max(0, 0.01 - (z - S.ball) ** 2)) : 0);
    const bot = (z) => -S.ankleH + spring(z);
    const shoeRows = fem
      ? [[-0.07, 0.016, -0.04], [-0.064, 0.03, -0.03], [-0.05, 0.036, -0.026], [-0.02, 0.039, -0.028], [0.03, 0.042, -0.04], [0.08, 0.043, -0.046], [0.12, 0.043, -0.052], [0.15, 0.038, -0.057], [0.17, 0.028, -0.062], [0.18, 0.01, -0.066]]
      : [[-0.08, 0.018, -0.03], [-0.074, 0.034, -0.012], [-0.055, 0.041, 0.0], [-0.02, 0.044, 0.004], [0.03, 0.047, -0.008], [0.08, 0.05, -0.03], [0.13, 0.052, -0.045], [0.165, 0.049, -0.052], [0.19, 0.04, -0.058], [0.205, 0.026, -0.064], [0.213, 0.008, -0.07]];
    const upper = shoeRows.map(([z, w, top]) => { const b0 = bot(z) + 0.008, hh = (top - b0) / 2; return { c: [0, b0 + hh, z], t: [0, 0, 1], f: [0, 1, 0], sec: (t) => { const q = se(w, hh, hh, 4)(t); return [q[0], q[1]]; } }; });
    A.add("leather", loft(upper, 18), FM, ft, fem ? "#15171C" : "#4A2E1E");
    const sole = shoeRows.map(([z, w]) => { const th2 = fem ? 0.011 : z < 0.0 ? 0.024 : 0.014, b0 = bot(z); return { c: [0, b0 + th2 / 2, z], t: [0, 0, 1], f: [0, 1, 0], sec: (t) => { const q = se(w + 0.003, th2 / 2, th2 / 2, 5)(t); return [q[0], q[1]]; } }; });
    A.add("leather", loft(sole, 18), FM, ft, fem ? "#0C0D10" : "#1E1510");
    if (!fem) for (let j = 0; j < 4; j++) { const z = 0.0 + j * 0.026; A.add("leather", new THREE.BoxGeometry(0.03, 0.004, 0.005), FM.clone().multiply(T4([0, -0.012 - j * 0.008 + 0.004, z], [-0.35, 0, 0])), ft, "#1A120C"); }
    else A.add("metal", new THREE.BoxGeometry(0.03, 0.005, 0.006), FM.clone().multiply(T4([0, -0.038, 0.085], [-0.25, 0, 0])), ft, "#B8BEC6");
  }
  // ── neck, head, ears, nose ──
  const NM = T4(P[B.neck]);
  A.add("skin", loft([[-0.05, 0.056, 0.058, -0.012], [0.0, 0.055, 0.058, -0.004], [0.04, 0.053, 0.056, 0.004], [0.085, 0.05, 0.054, 0.012]].map(([y, rx, rz, zo]) => ({ c: [0, y, zo], sec: circ(rx * (fem ? 0.9 : 1), rz * (fem ? 0.9 : 1)) })), 16), NM, [[B.chest, 0.4], [B.neck, 1], [B.head, 0.7]], "#ffffff", SKIN_UV);
  const HMx = T4([P[B.head][0] + S.hc[0], P[B.head][1] + S.hc[1], P[B.head][2] + S.hc[2]]);
  A.add("skin", grid(44, 30, (u, v) => headPt(S, -PI + u * TAU, -PI / 2 + v * PI), (u, v) => [u, v]), HMx, B.head, "#ffffff");
  const surfZ = (y) => headPt(S, 0, Math.asin(cl(y / S.R.ry, -1, 1)))[2];
  const nk = fem ? 0.82 : 1;
  const nose = [[0.012, 0.0065, 0.0], [-0.004, 0.0075, 0.0045], [-0.02, 0.009, 0.0095], [-0.034, 0.0118, 0.0145], [-0.044, 0.0168, 0.0165], [-0.051, 0.0148, 0.0118], [-0.055, 0.0095, 0.005], [-0.057, 0.0, 0.0]];
  A.add("skin", loft(nose.map(([y, hw, d]) => ({ c: [0, y * nk, surfZ(y * nk) - 0.004], sec: (t) => [hw * nk * Math.sin(t), Math.cos(t) > 0 ? (d * nk + 0.004) * Math.cos(t) ** 0.8 : -0.006 * Math.abs(Math.cos(t))] })), 12), HMx, B.head, "#ffffff", SKIN_UV);
  for (const s of [-1, 1]) {
    const e = headPt(S, s * PI * 0.47, -0.12), ek = fem ? 0.88 : 1;
    const ear = grid(12, 10, (u, v) => { const lo = -PI + u * TAU, la = -PI / 2 + v * PI; const cup = Math.cos(la) * Math.cos(lo) > 0 ? 0.6 : 1; return [0.011 * Math.cos(la) * Math.cos(lo) * cup, 0.032 * ek * Math.sin(la), 0.019 * ek * Math.cos(la) * Math.sin(lo)]; });
    A.add("skin", ear, HMx.clone().multiply(T4([e[0] + s * 0.004, e[1], e[2] - 0.006], [0, -s * 0.35, s * 0.12])), B.head, "#ffffff", SKIN_UV);
    if (fem) A.add("metal", new THREE.SphereGeometry(0.0045, 8, 6), HMx.clone().multiply(T4([e[0] + s * 0.008, e[1] - 0.028, e[2] + 0.002])), B.head, "#F2EEE6");
  }
  // ── hair (and his cap, his glasses) ──
  if (!fem) {
    const latMin = (lon) => -0.55 + 0.63 * Math.max(0, Math.cos(lon) + 1) ** 1.0;
    const hair = grid(26, 10, (u, v) => {
      const lon = 0.95 + u * (TAU - 1.9), lat = lerp(latMin(lon), 0.75, v);
      const p = headPt(S, lon, lat), edge = sm(Math.min(v / 0.25, (1 - Math.abs(2 * u - 1)) / 0.12));
      const r = Math.hypot(...p), d = 0.0015 + 0.0075 * edge;
      return p.map((q) => q * (1 + d / r));
    }, (u, v, p) => [u * 0.3, v * 0.1], false);
    A.add("hair", hair, HMx, B.head, "#B9BCC1");
    // the flat cap: a crown that slopes down to the front, a stitched band, a short stiff brim
    const capEdge = (lon) => lerp(0.42, 0.22, (1 - Math.cos(lon)) / 2);
    const cap = grid(36, 9, (u, v) => {
      const lon = -PI + u * TAU, lat = lerp(capEdge(lon), PI / 2, v);
      const p = headPt(S, lon, lat), r = Math.hypot(...p);
      let [x, y, z] = p.map((q) => q * (1 + 0.012 / r));
      const front = cl(z / S.R.rz);
      z += 0.03 * v * front + 0.004 * v;
      x *= 1 + 0.06 * v;
      const top = S.R.ry + 0.024 - 0.05 * cl((z + 0.02) / 0.14) - 0.004 * cl(-z / 0.1);
      y = Math.min(y, top + 0.004 * Math.sin(v * PI));
      return [x, y, z];
    }, (u, v) => [u * 0.6, v * 0.12]);
    A.add("tweed", cap, HMx, B.head, "#77716A");
    const brim = grid(16, 3, (u, v) => {
      const lon = -1.05 + u * 2.1, p = headPt(S, lon, capEdge(lon)), r = Math.hypot(...p);
      const e = p.map((q) => q * (1 + 0.013 / r)), d = 0.06 * Math.cos(lon * PI / 2 / 1.05) ** 0.6 * v;
      const h = Math.hypot(e[0], e[2]) || 1;
      return [e[0] + d * e[0] / h, e[1] - d * 0.22 - 0.003 * v, e[2] + d * e[2] / h + 0.012 * v];
    }, (u, v) => [u * 0.15, v * 0.05], false);
    A.add("tweed", brim, HMx, B.head, "#6E6862");
    // glasses: two rounded rims, a bridge, temples to the ears, faint lenses
    for (const s of [-1, 1]) {
      const e = headPt(S, s * 0.4, 0.035);
      const rim = new THREE.TorusGeometry(0.0195, 0.0014, 5, 24);
      A.add("metal", rim, HMx.clone().multiply(T4([e[0], e[1], e[2] + 0.013], [0, s * 0.12, 0], [1.28, 0.86, 1])), B.head, "#AEB4BC");
      A.add("lens", new THREE.CircleGeometry(0.0192, 20), HMx.clone().multiply(T4([e[0], e[1], e[2] + 0.0125], [0, s * 0.12, 0], [1.28, 0.86, 1])), B.head, "#ffffff");
      const t0 = v3(e[0] + s * 0.024, e[1] + 0.006, e[2] + 0.008), ear = headPt(S, s * PI * 0.47, -0.02), t1 = v3(ear[0] + s * 0.004, ear[1] + 0.01, ear[2] + 0.004);
      const mid = t0.clone().add(t1).multiplyScalar(0.5), len = t0.distanceTo(t1);
      const q = new THREE.Quaternion().setFromUnitVectors(v3(0, 0, 1), t1.clone().sub(t0).normalize());
      A.add("metal", new THREE.BoxGeometry(0.0018, 0.003, len), HMx.clone().multiply(new THREE.Matrix4().compose(mid, q, v3(1, 1, 1))), B.head, "#AEB4BC");
    }
    const eL = headPt(S, 0.4, 0.035);
    A.add("metal", new THREE.CylinderGeometry(0.0012, 0.0012, 0.02, 5), HMx.clone().multiply(T4([0, eL[1] + 0.006, eL[2] + 0.016], [0, 0, PI / 2])), B.head, "#AEB4BC");
  } else {
    // short silver hair with volume and soft waves: a shell over the crown, sides to the ear tops, the nape
    const latMin = (lon) => { const c = Math.cos(lon); return c > 0.3 ? lerp(0.0, 0.5, (c - 0.3) / 0.7) : lerp(-0.5, 0.0, (c + 1) / 1.3); };
    const hair = grid(48, 14, (u, v) => {
      const lon = -PI + u * TAU, lat = lerp(latMin(lon), PI / 2, v);
      const p = headPt(S, lon, lat), r = Math.hypot(...p);
      const edge = sm(v / 0.3), crown = Math.sin(v * PI / 2);
      const d = 0.002 + edge * (0.012 + 0.012 * crown + 0.0035 * Math.sin(lon * 9 + lat * 7) + 0.002 * Math.sin(lon * 17));
      const q = p.map((w) => w * (1 + d / r));
      if (Math.cos(lon) > 0.4) q[2] += 0.006 * edge * (1 - v);   // a soft fringe lifts off the forehead
      return q;
    }, (u, v) => [u * 0.5, v * 0.15]);
    A.add("hair", hair, HMx, B.head, "#D9DCE1");
    // the scarf: two chunky wraps around the neck and a tail falling over the coat front
    const wrap = (y0, Rx, Rz, a, b, tilt) => loft([...Array(29)].map((_, i) => { const ph = (i / 28) * TAU; return { c: [Rx * Math.sin(ph), y0 - tilt * Math.cos(ph), Rz * Math.cos(ph) + 0.006], t: [Math.cos(ph) * Rx, tilt * Math.sin(ph), -Math.sin(ph) * Rz], f: [0, 1, 0], sec: circ(a, b) }; }), 12);
    A.add("knit", wrap(1.378, 0.086, 0.082, 0.03, 0.024, 0.014), new THREE.Matrix4(), [[B.chest, 1], [B.neck, 0.7]], "#E9E3D7");
    A.add("knit", wrap(1.412, 0.074, 0.072, 0.025, 0.02, 0.01), new THREE.Matrix4(), [[B.chest, 0.6], [B.neck, 1]], "#E9E3D7");
    for (const [x0, len, dx, tw] of [[0.045, 0.24, 0.01, 0.036], [-0.01, 0.17, -0.012, 0.032]]) {
      const tail = [...Array(9)].map((_, i) => { const y = 1.37 - (i / 8) * len, x = x0 + dx * i / 8; return { c: onFront(x, y, 0.024 + (x0 > 0 ? 0.006 : 0) - 0.008 * i / 8), t: [0, -1, 0], sec: (t) => [tw * Math.sin(t), 0.007 * Math.cos(t)] }; });
      A.add("knit", loft(tail, 10), new THREE.Matrix4(), [[B.chest, 1], [B.spine, 0.35]], "#E9E3D7");
    }
  }
  // ── the skeleton ──
  const bones = BONES.map((n) => { const b = new THREE.Bone(); b.name = n; return b; });
  bones.forEach((b, i) => {
    const p = PARENT[i] >= 0 ? P[PARENT[i]] : [0, 0, 0];
    b.position.set(P[i][0] - p[0], P[i][1] - p[1], P[i][2] - p[2]);
    if (PARENT[i] >= 0) bones[PARENT[i]].add(b);
  });
  const group = new THREE.Group();
  group.add(bones[0]);
  group.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);
  return { S, P, A, bones, skeleton, group };
};

// ── materials ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const mats = (fem) => {
  const t = (k) => TEX[k]();
  const m = (k, extra) => { const x = k ? t(k) : null; return new THREE.MeshStandardMaterial({ vertexColors: true, ...(x ? { map: x.map, bumpMap: x.bump, bumpScale: 1.2 } : {}), ...extra }); };
  const face = faceTex(fem);
  return {
    skin: new THREE.MeshStandardMaterial({ map: face, vertexColors: true, roughness: 0.62, metalness: 0 }),
    coat: m(fem ? "wool" : "quilt", { roughness: fem ? 0.88 : 0.62, metalness: 0 }),
    cord: m("cord", { roughness: 0.9 }),
    twill: m("twill", { roughness: 0.8 }),
    tweed: m("tweed", { roughness: 0.92, side: THREE.DoubleSide }),
    knit: m("knit", { roughness: 0.95, bumpScale: 2 }),
    hair: m("hair", { roughness: 0.55, bumpScale: 1.5, side: THREE.DoubleSide }),
    leather: m("leather", { roughness: 0.34, metalness: 0.05, bumpScale: 0.6 }),
    metal: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, metalness: 0.75 }),
    lens: new THREE.MeshStandardMaterial({ color: "#cfe3ff", roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.16, depthWrite: false }),
  };
};
// the handbag: a structured cognac leather bag with two handles and a clasp (rigid; hung from her hand each frame)
const buildBag = () => {
  const g = new THREE.Group(), pend = new THREE.Group();
  const leather = new THREE.MeshStandardMaterial({ color: "#8A5232", roughness: 0.4, metalness: 0.05, ...(() => { const x = TEX.leather(); return { map: x.map, bumpMap: x.bump, bumpScale: 0.6 }; })() });
  const metal = new THREE.MeshStandardMaterial({ color: "#C9B47A", roughness: 0.3, metalness: 0.9 });
  const body = loft([[0, 0.12, 0.04], [0.004, 0.13, 0.046], [0.02, 0.134, 0.05], [0.16, 0.124, 0.042], [0.172, 0.118, 0.034], [0.174, 0.0, 0.0]].map(([y, w, d]) => ({ c: [0, y, 0], sec: (t) => { const q = se(d, w, w, 4)(t); return [q[0], q[1]]; } })), 24);
  const add = (geo, mat, M) => { const me = new THREE.Mesh(geo, mat); me.applyMatrix4(M); me.castShadow = true; me.receiveShadow = true; pend.add(me); };
  // the bag hangs below the grip: handles peak at the grip (0,0,0), the body's top 0.085 below
  add(body, leather, T4([0, -0.26, 0]));
  for (const z of [-0.05, 0.05]) add(new THREE.TorusGeometry(0.05, 0.0055, 6, 14, PI), leather, T4([0.0, -0.086, z * 0.0], [0, PI / 2, 0], [1, 1.6, 1]).multiply(T4([z, 0, 0])));
  add(new THREE.BoxGeometry(0.008, 0.022, 0.03), metal, T4([0.05, -0.105, 0]));
  add(new THREE.BoxGeometry(0.004, 0.006, 0.26), metal, T4([0.046, -0.12, 0]));
  g.add(pend);
  return { g, pend };
};

// ── THE WALK ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const SPEED = 0.95;
const basisQ = (down, fwd) => {
  const y = down.clone().multiplyScalar(-1).normalize();
  const z = fwd.clone().sub(y.clone().multiplyScalar(fwd.dot(y))).normalize();
  const x = y.clone().cross(z);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
};
const ik2 = (H, A, a, b, pole) => {
  const d0 = A.clone().sub(H), d = Math.min(d0.length(), (a + b) * 0.9995), u = d0.clone().normalize();
  const ca = cl((a * a + d * d - b * b) / (2 * a * d), -1, 1), sa = Math.sqrt(1 - ca * ca);
  const w = pole.clone().sub(u.clone().multiplyScalar(pole.dot(u))).normalize();
  return H.clone().addScaledVector(u, a * ca).addScaledVector(w, a * sa);
};
// the stance foot in the person's (moving) space: zf = the foot-flat ankle z; returns { y, z, p } (p = pitch, toes up +)
const TH_H = 0.26, TH_T = 0.46, R_TOE = 0.1;
const stanceFoot = (S, zf, phi) => {
  if (phi < 0.1) {   // heel strike → foot flat: rotate about the heel
    const p = TH_H * (1 - sm(phi / 0.1));
    return { y: S.heel * Math.sin(p) + S.ankleH * Math.cos(p), z: zf - S.heel + S.heel * Math.cos(p) - S.ankleH * Math.sin(p), p };
  }
  if (phi < 0.42) return { y: S.ankleH, z: zf, p: 0 };
  // heel rise: the curved forefoot ROLLS (contact advances R·|p|, never slips)
  const p = -TH_T * Math.pow(cl((phi - 0.42) / 0.2), 1.6);
  const a = -p, cz = zf + S.ball + R_TOE * a, cy = R_TOE;
  const vz = -S.ball, vy = S.ankleH - R_TOE;                 // ankle − arc centre, in the foot frame
  return { y: cy + vz * Math.sin(p) + vy * Math.cos(p), z: cz + vz * Math.cos(p) - vy * Math.sin(p), p };
};
const legState = (S, phi, stride) => {
  if (phi < 0.62) { const st = stanceFoot(S, stride * (0.3 - phi), phi); return { ...st, lat: 0, stance: true }; }
  const s = (phi - 0.62) / 0.38;
  const a = stanceFoot(S, stride * (0.3 - phi), 0.62), b = stanceFoot(S, stride * (1.3 - phi), 0);
  const e = s - Math.sin(TAU * s) / TAU;
  return { y: lerp(a.y, b.y, s) + 0.04 * Math.sin(PI * Math.pow(s, 0.8)), z: lerp(a.z, b.z, e), p: lerp(-TH_T, TH_H, sm(s)), lat: 0.012 * Math.sin(PI * s), stance: false };
};
// the most the pelvis must sit lower (than hipY − offset + bob) at any phase of the stride for both legs to reach — computed once per person
const DROP_CACHE = new Map();
const reachDrop = (S, stride, ph0) => {
  const key = S.cad + "_" + stride.toFixed(4); if (DROP_CACHE.has(key)) return DROP_CACHE.get(key);
  let worst = 0; const Lmax = (S.thigh + S.shin) * 0.97;
  for (let i = 0; i < 240; i++) {
    const phi = i / 240, s2 = Math.sin(TAU * phi), c2 = Math.cos(TAU * phi);
    const Qp = qm(qa("y", -0.075 * c2), qa("z", 0.045 * s2), qa("x", S.fem ? 0.05 : 0.07));
    const sway = (S.fem ? 0.026 : 0.022) * s2, hy = S.hipY - (S.fem ? 0.032 : 0.038) + 0.011 * Math.cos(4 * PI * (phi - 0.3));
    for (const [s, ph] of [[1, phi], [-1, (phi + 0.5) % 1]]) {
      const L = legState(S, ph, stride), H = v3(sway, hy, 0).add(v3(s * S.hipX, 0, 0).applyQuaternion(Qp));
      const A = v3(s * (S.stepW / 2 + L.lat), L.y, L.z), hd = Math.hypot(A.x - H.x, A.z - H.z);
      if (hd < Lmax) worst = Math.max(worst, H.y - (A.y + Math.sqrt(Lmax * Lmax - hd * hd)));
    }
  }
  DROP_CACHE.set(key, worst); return worst;
};
// the full pose: world-space (person space, no rotation) joints for one person at time t
const solvePose = (S, t, opt) => {
  const cyc = S.cad / 120, stride = SPEED / cyc, u = t * cyc + opt.ph;
  const phi = ((u % 1) + 1) % 1;
  const legs = [[1, phi], [-1, (phi + 0.5) % 1]].map(([s, ph]) => ({ s, ph, ...legState(S, ph, stride) }));
  const c2 = Math.cos(TAU * phi), s2 = Math.sin(TAU * phi);
  const yaw = -0.075 * c2, roll = 0.045 * s2, sway = (S.fem ? 0.026 : 0.022) * s2;
  const pitch = S.fem ? 0.05 : 0.07;
  const Qp = qm(qa("y", yaw), qa("z", roll), qa("x", pitch));
  // rev 4c review (Timur: "they bump up and down … should be a lot more realistic and smooth"): the pelvis height is a CONSTANT
  //   (lowered once by the most any phase of the stride needs, so a leg always reaches) plus a gentle bob — highest over the standing
  //   leg at mid-stance, lowest in double support, ±1.1 cm (an older walker's ~2 cm) — instead of a per-frame drop that switched on
  //   and off through the stride
  const bob = 0.011 * Math.cos(4 * PI * (phi - 0.3));
  let hy = S.hipY - (S.fem ? 0.032 : 0.038) - reachDrop(S, stride, opt.ph) + bob;
  const hipJ = (s, h) => v3(sway, h, 0).add(v3(s * S.hipX, 0, 0).applyQuaternion(Qp));
  const ank = (L) => { const yawF = L.s * 0.11; return v3(L.s * (S.stepW / 2 + L.lat) + Math.sin(yawF) * 0, L.y, L.z); };
  const Lmax = (S.thigh + S.shin) * 0.985;
  for (let it = 0; it < 2; it++) {
    let drop = 0;
    for (const L of legs) { const H = hipJ(L.s, hy), A = ank(L), hd = Math.hypot(A.x - H.x, A.z - H.z); if (hd < Lmax) drop = Math.max(drop, H.y - (A.y + Math.sqrt(Lmax * Lmax - hd * hd))); }
    hy -= Math.max(0, drop);
  }
  const hips = v3(sway, hy, 0);
  const out = { hipsP: hips, Q: [] };
  out.Q[B.hips] = Qp;
  const fwd = v3(0, 0, 1).applyQuaternion(qa("y", yaw));
  for (const L of legs) {
    const H = hipJ(L.s, hy), A = ank(L), pole = fwd.clone().add(v3(L.s * 0.12, 0, 0));
    const K = ik2(H, A, S.thigh, S.shin, pole);
    const th = L.s > 0 ? B.thL : B.thR, sh = th + 1, ft = th + 2;
    out.Q[th] = basisQ(K.clone().sub(H), pole);
    out.Q[sh] = basisQ(A.clone().sub(K), pole);
    out.Q[ft] = qm(qa("y", L.s * 0.11), qa("x", -L.p));
    out[L.s > 0 ? "ankL" : "ankR"] = A;
  }
  // the spine counter-rotates the shoulders; the chest levels the pelvic list; an older posture leans a little forward
  const cyaw = 0.06 * c2, rel = cyaw - yaw;
  const lean = S.fem ? 0.04 : 0.07;
  const Qs = qm(Qp, qa("y", rel * 0.5), qa("x", lean - pitch * 0.6));
  const Qc = qm(Qs, qa("y", rel * 0.5), qa("z", -roll * 0.8), qa("x", lean * 0.8));
  out.Q[B.spine] = Qs; out.Q[B.chest] = Qc;
  const Qn = qm(Qc, qa("x", S.fem ? 0.1 : 0.16));
  out.Q[B.neck] = Qn;
  out.Q[B.head] = qm(qa("y", opt.look ?? 0), qa("x", 0.06), qa("z", 0.012 * s2));   // the head is held steady in the world
  // FK to the shoulders (world, person space)
  const P = bindPos(S);
  const at = (b, q, p) => p.clone().add(v3(P[b][0] - P[PARENT[b]][0], P[b][1] - P[PARENT[b]][1], P[b][2] - P[PARENT[b]][2]).applyQuaternion(q));
  const spineP = at(B.spine, Qp, hips), chestP = at(B.chest, Qs, spineP);
  out.shL = at(B.upL, Qc, chestP); out.shR = at(B.upR, Qc, chestP); out.chestQ = Qc;
  out.phi = phi;
  return out;
};
// free arm: shoulder flexion opposite the same-side leg, relaxed elbow, the hand lagging
const freeArm = (out, S, side, phi, amp, abd, carry = 0) => {
  const up = side > 0 ? B.upL : B.upR;
  const ph = phi - 0.05;
  const sw = side * -1 * amp * Math.cos(TAU * ph) * -1 * -1;   // left arm forward when the right leg is forward (phi ≈ 0.5)
  const swing = (side > 0 ? -1 : 1) * amp * Math.cos(TAU * ph) + 0.05;
  const flex = (carry ? 0.1 : 0.24) + (carry ? 0.03 : 0.16) * Math.max(0, Math.sin(TAU * (ph - 0.1) + (side > 0 ? PI : 0)) * 0.5 + (swing / Math.max(amp, 1e-3)) * 0.5);
  const lag = (side > 0 ? -1 : 1) * Math.cos(TAU * (ph - 0.09));
  const Qu = qm(out.chestQ, qa("z", side * abd), qa("x", -swing));
  const Qf = qm(Qu, qa("x", -flex), qa("y", -side * 0.35));
  const Qh = qm(Qf, qa("x", (carry ? 0.05 : 0.06) - 0.05 * lag * amp / 0.2), qa("z", side * 0.1));   // rev 4c review: wrist neutral, the hand hanging slightly in toward the thigh
  out.Q[up] = Qu; out.Q[up + 1] = Qf; out.Q[up + 2] = Qh;
  void sw;
};
const heldArm = (out, S, side, shoulder, wristT, poleW) => {
  const up = side > 0 ? B.upL : B.upR;
  const E = ik2(shoulder, wristT, S.upper, S.fore, poleW);
  const dU = E.clone().sub(shoulder), dF = wristT.clone().sub(E);
  const fwdU = dF.clone().sub(dU.clone().normalize().multiplyScalar(dF.dot(dU.clone().normalize())));
  const Qu = basisQ(dU, fwdU.lengthSq() > 1e-8 ? fwdU : v3(0, 0, 1));
  const zU = v3(0, 0, 1).applyQuaternion(Qu);
  const Qf = basisQ(dF, zU);
  out.Q[up] = Qu; out.Q[up + 1] = Qf; out.Q[up + 2] = qm(Qf, qa("y", -PI / 2), qa("x", -0.25));
};
// world quaternions → bone locals
const applyPose = (rig, out) => {
  const { bones } = rig;
  for (let i = 0; i < bones.length; i++) {
    const q = out.Q[i]; if (!q) continue;
    const pq = PARENT[i] >= 0 ? out.Q[PARENT[i]] : new THREE.Quaternion();
    bones[i].quaternion.copy(pq.clone().invert().multiply(q));
  }
  bones[B.hips].position.copy(out.hipsP);
};

// ── the pair ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// x: his path line (curb side); she walks GAP to his left (+x); z0: where they are at frame 0; they walk toward +z
export const COUPLE_SPEED = SPEED;
export const coupleZ = (f, z0) => z0 + SPEED * f / 30;
const GAP = 0.58;
const build = () => {
  const man = buildPerson(mk(false)), wom = buildPerson(mk(true));
  const root = new THREE.Group();
  let tris = 0;
  for (const p of [man, wom]) {
    const ms = mats(p.S.fem);
    for (const me of p.A.meshes(ms, p.skeleton)) p.group.add(me);
    tris += p.A.tris();
    root.add(p.group);
  }
  const bag = buildBag();
  root.add(bag.g);
  return { man, wom, root, bag, tris, sim: null };
};
const lookCurve = (f, a, b, amt) => amt * sm((f - a) / 10) * (1 - sm((f - b) / 12));
const poseAt = (R, f, prm) => {
  const t = f / 30, z = coupleZ(f, prm.z0);
  const mOpt = { ph: 0.0, look: lookCurve(f, prm.look[0] + 10, prm.look[1] + 6, 0.22) };
  const wOpt = { ph: 0.37, look: lookCurve(f, prm.look[0], prm.look[1], -0.38) };
  const om = solvePose(R.man.S, t, mOpt), ow = solvePose(R.wom.S, t, wOpt);
  const gm = v3(prm.x, prm.y, z), gw = v3(prm.x + GAP, prm.y, z - 0.04);
  // the free arms: his right swings freely; her left carries the bag (a smaller swing, abducted to clear the coat)
  freeArm(om, R.man.S, -1, om.phi, 0.26, 0.08);   // rev 4c review: ±15° (it was ±11.5°)
  freeArm(ow, R.wom.S, 1, ow.phi, 0.1, 0.27, 1);
  // the held hands: a shared grip between them that sways gently with both gaits
  const sM = om.shL.clone().add(gm), sW = ow.shR.clone().add(gw);
  const sway = 0.03 * Math.sin(TAU * (om.phi + 0.25)) + 0.02 * Math.sin(TAU * (ow.phi + 0.25));
  const G = v3((sM.x + sW.x) / 2, (sM.y + sW.y) / 2 - 0.57, (sM.z + sW.z) / 2 + 0.15 + sway);
  heldArm(om, R.man.S, 1, om.shL, G.clone().add(v3(-0.012, 0.075, 0.016)).sub(gm), v3(0.1, -0.15, -1).normalize());
  heldArm(ow, R.wom.S, -1, ow.shR, G.clone().add(v3(0.012, 0.068, -0.016)).sub(gw), v3(-0.1, -0.15, -1).normalize());
  return { om, ow, gm, gw };
};
export const Couple = ({ f, x = 5.62, y = 0, z0 = -10.7, look = [100, 130] }) => {
  const R = useMemo(build, []);
  const prm = { x, y, z0, look };
  const { om, ow, gm, gw } = poseAt(R, f, prm);
  applyPose(R.man, om); applyPose(R.wom, ow);
  R.man.group.position.copy(gm); R.wom.group.position.copy(gw);
  // her handbag: a damped pendulum hung from her left hand's grip (simulated from frame 0, so every frame renders the same)
  const grip = (fr) => {
    const { ow: o, gw: g } = poseAt(R, fr, prm);
    applyPose(R.wom, o); R.wom.group.position.copy(g); R.wom.group.updateMatrixWorld(true);
    return v3(0, -R.wom.S.hand * 0.55, 0.01).applyMatrix4(R.wom.bones[B.haL].matrixWorld);
  };
  const key = `${x}|${y}|${z0}`;
  if (!R.sim || R.sim.key !== key) R.sim = { key, st: [] };
  const st = R.sim.st;
  if (!st.length) { const g0 = grip(0); st.push({ a: 0, va: 0, b: 0, vb: 0, g: g0, gv: v3(0, 0, SPEED / 30) }); }
  for (let fr = st.length; fr <= Math.ceil(f); fr++) {
    const prev = st[fr - 1], g = grip(fr), gv = g.clone().sub(prev.g), acc = gv.clone().sub(prev.gv).multiplyScalar(900);   // m/s²
    let { a, va, b, vb } = prev; const L = 0.17, n = 4, dt = 1 / 30 / n;
    for (let k = 0; k < n; k++) {
      va += (-(9.81 * Math.sin(a) + acc.z * Math.cos(a)) / L - 4 * va) * dt; a += va * dt;
      vb += (-(9.81 * Math.sin(b) + acc.x * Math.cos(b)) / L - 5 * vb) * dt; b += vb * dt;
    }
    st.push({ a, va, b, vb, g, gv });
  }
  // restore this frame's pose (the sim above re-posed her)
  applyPose(R.wom, ow); R.wom.group.position.copy(gw); R.wom.group.updateMatrixWorld(true);
  const s = st[Math.max(0, Math.round(f))];
  const g = v3(0, -R.wom.S.hand * 0.55, 0.01).applyMatrix4(R.wom.bones[B.haL].matrixWorld);
  R.bag.g.position.copy(g);
  R.bag.pend.rotation.set(s.a, 0, -s.b);
  return <primitive object={R.root} />;
};
export const coupleTris = () => build().tris;
// exported for checks: the pose solver (feet, pelvis) without React
export const __walk = { mk, solvePose, legState, stanceFoot, poseAt, buildPerson, GAP };
