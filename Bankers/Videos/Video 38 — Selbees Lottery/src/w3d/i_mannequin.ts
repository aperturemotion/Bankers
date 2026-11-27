// @ts-nocheck
// ★ V38 rev 6 STYLE FRAMES (Timur, 2026-11-27: "plain models … without faces, just like blue people … no nose, ears, just like a blue
//   head, like blue hands … keep it very smooth") — the couple as smooth, featureless MANNEQUINS.
//   Each body is ONE implicit surface (a signed-distance field of round cones and ellipsoids, smooth-unioned so every joint flows into the
//   next with no seam), meshed ONCE at build time with surface nets, every vertex projected back onto the surface and given the field's
//   gradient as its normal (so the shading is smooth at any distance, no faceting). It is skinned to the couple's own skeleton: each vertex
//   takes its bone weights from the primitives that make it (a soft-max over their distances), so a knee bends through a soft blend and
//   one leg never drags the other. The arms are meshed in a slight A-pose (so the arm never webs to the flank) and the skeleton is bound in
//   that pose; the walk's poses are unchanged.
import * as THREE from "three";

export const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
const smax = (a, b, k) => -smin(-a, -b, k);
// an ellipsoid (iq's bound)
const bnd = (f, b) => { f.b = b; return f; };   // a bounding sphere [cx, cy, cz, R]: far from it the primitive is skipped
const ell = (cx, cy, cz, rx, ry, rz) => bnd((x, y, z) => {
  const px = (x - cx) / rx, py = (y - cy) / ry, pz = (z - cz) / rz, k0 = Math.sqrt(px * px + py * py + pz * pz);
  const qx = px / rx, qy = py / ry, qz = pz / rz, k1 = Math.sqrt(qx * qx + qy * qy + qz * qz);
  return k1 < 1e-9 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1;
}, [cx, cy, cz, Math.max(rx, ry, rz)]);
// a round cone a(r1) → b(r2) (iq, exact)
const cone = (a, b, r1, r2) => {
  const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2], l2 = bax * bax + bay * bay + baz * baz, rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
  return bnd((x, y, z) => {
    const pax = x - a[0], pay = y - a[1], paz = z - a[2], yy = pax * bax + pay * bay + paz * baz, zz = yy - l2;
    const wx = pax * l2 - bax * yy, wy = pay * l2 - bay * yy, wz = paz * l2 - baz * yy, x2 = wx * wx + wy * wy + wz * wz;
    const y2 = yy * yy * l2, z2 = zz * zz * l2, k = Math.sign(rr) * rr * rr * x2;
    if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
    if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
    return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - r1;
  }, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, Math.sqrt(l2) / 2 + Math.max(r1, r2)]);
};
// a rounded box (axis-aligned)
const rbox = (c, hb, r) => bnd((x, y, z) => {
  const qx = Math.abs(x - c[0]) - hb[0], qy = Math.abs(y - c[1]) - hb[1], qz = Math.abs(z - c[2]) - hb[2];
  const ox = Math.max(qx, 0), oy = Math.max(qy, 0), oz = Math.max(qz, 0);
  return Math.sqrt(ox * ox + oy * oy + oz * oz) + Math.min(Math.max(qx, Math.max(qy, qz)), 0) - r;
}, [c[0], c[1], c[2], Math.hypot(...hb) + r]);

// ── the primitives of one body, in the skeleton's bind space (arms hanging straight; +X = the person's left; faces +Z) ─────────────
// groups: 0 torso (pelvis → head), 1/2 left/right leg, 3/4 left/right arm. k = the blend radius into its group so far.
// parts: "body" (all), "headneck", "hands" (forearm stub + mitt; for the dressed variant, whose clothes cover the rest)
export const mannequinField = (S, P, B, { parts = "body", ap = 0 } = {}) => {
  const fem = S.fem, prims = [];
  const add = (g, bone, k, f) => prims.push({ g, bone, k, f, b: f.b ?? null });
  const body = parts === "body", head = body || parts === "headneck", hands = body || parts === "hands";
  // ── torso ──
  if (body) {
    add(0, B.hips, 0, fem ? ell(0, S.hipY + 0.035, -0.012, 0.158, 0.112, 0.108) : ell(0, S.hipY + 0.035, -0.008, 0.145, 0.105, 0.104));
    add(0, B.spine, 0.09, fem ? ell(0, S.spineY + 0.07, 0.004, 0.132, 0.12, 0.096) : ell(0, S.spineY + 0.075, 0.014, 0.14, 0.125, 0.116));   // his soft belly; her waist barely drawn in
    add(0, B.chest, 0.12, fem ? ell(0, S.chestY + 0.06, -0.012, 0.136, 0.14, 0.094) : ell(0, S.chestY + 0.07, -0.012, 0.152, 0.152, 0.104));
    add(0, B.chest, 0.08, ell(0, S.chestY + 0.115, -0.045, fem ? 0.11 : 0.125, 0.1, 0.08));   // an older, rounded upper back
    if (fem) for (const s of [-1, 1]) add(0, B.chest, 0.045, ell(s * 0.054, S.chestY + 0.03, 0.046, 0.05, 0.044, 0.034));   // only a hint
    // the shoulder line: two round cones from the base of the neck out to the shoulder joints, sloping (an older, softer shoulder)
    for (const s of [-1, 1]) add(0, B.chest, 0.06, cone([0, S.shY - 0.002, -0.022], [s * (S.shX - 0.03), S.shY - 0.05, -0.014], fem ? 0.046 : 0.052, fem ? 0.04 : 0.044));
  }
  if (head) {
    const nr = fem ? 0.041 : 0.048;
    add(0, B.chest, body ? 0.04 : 0, cone([0, S.neckY - 0.085, -0.02], [0, S.neckY - 0.01, -0.01], nr * 1.12, nr));   // the neck's base rides the chest
    add(0, B.neck, 0.03, cone([0, S.neckY - 0.03, -0.012], [0, S.headY + 0.035, 0.004], nr, nr * 0.98));
    // the head: a smooth egg — a cranium and a narrower jaw mass blended into one ovoid; no features at all
    const { rx, ry, rz } = S.R, hx = P[B.head][0] + S.hc[0], hy = P[B.head][1] + S.hc[1], hz = P[B.head][2] + S.hc[2];
    add(0, B.head, 0.03, ell(hx, hy + 0.012, hz - 0.004, rx * 1.0, ry * 0.9, rz * 1.0));
    add(0, B.head, 0.05, ell(hx, hy - 0.04, hz + 0.012, rx * 0.8, ry * 0.62, rz * 0.82));
  }
  // ── legs ──
  if (body) for (const [g, s, th, sh, ft] of [[1, 1, B.thL, B.shL, B.ftL], [2, -1, B.thR, B.shR, B.ftR]]) {
    const x = s * S.hipX, kneeY = S.hipY - S.thigh, k = fem ? 0.94 : 1;
    add(g, th, 0, cone([x, S.hipY + 0.01, 0.0], [x, kneeY, 0.006], 0.074 * k, 0.047 * k));
    add(g, th, 0.05, ell(x + s * 0.004, S.hipY - 0.14, 0.012, 0.07 * k, 0.16, 0.072 * k));
    add(g, sh, 0.035, cone([x, kneeY, 0.006], [x, S.ankleH + 0.012, -0.006], 0.046 * k, 0.03 * k));
    add(g, sh, 0.05, ell(x, kneeY - 0.125, -0.014, 0.046 * k, 0.105, 0.048 * k));
    // the foot: a smooth shoe-like mitt — a long ellipsoid cut flat underneath, its forefoot sole curving up (the gait's toe roll)
    const zc = (S.tip - S.heel) / 2, hl = (S.tip + S.heel) / 2 + 0.004, wF = S.footW;
    const E = ell(x, 0.036, zc, wF, 0.072 * (fem ? 0.92 : 1), hl);
    const spring = (z) => (z > S.ball ? 0.1 - Math.sqrt(Math.max(0, 0.01 - (z - S.ball) ** 2)) : 0);
    add(g, ft, 0.03, bnd((X, Y, Z) => smax(E(X, Y, Z), spring(Z) - Y + 0.0015, 0.014), E.b));
  }
  // ── arms (bind straight; meshed rotated by ±ap about the shoulder joint) ──
  if (hands) for (const [g, s, up, fo, ha] of [[3, 1, B.upL, B.foL, B.haL], [4, -1, B.upR, B.foR, B.haR]]) {
    const x = s * S.shX, z0 = -0.01, elY = S.shY - S.upper, wrY = elY - S.fore, k = fem ? 0.9 : 1;
    if (body) {
      add(g, up, 0, ell(x - s * 0.006, S.shY - 0.062, z0, 0.044 * k, 0.068, 0.049 * k));
      add(g, up, 0.04, cone([x, S.shY - 0.03, z0], [x, elY, z0], 0.044 * k, 0.034 * k));
      add(g, fo, 0.03, cone([x, elY, z0], [x, wrY, z0], 0.034 * k, 0.024 * k));
      add(g, fo, 0.04, ell(x, elY - 0.065, z0 + 0.002, 0.036 * k, 0.085, 0.038 * k));
    } else add(g, fo, 0, cone([x, wrY + 0.075, z0], [x, wrY, z0], 0.028 * k, 0.024 * k));
    // the hand: a soft mitt (fingers merged) — a palm and a narrower, thinner finger mass — with a barely-suggested thumb
    add(g, ha, 0.022, ell(x, wrY - 0.052 * k, z0 + 0.004, 0.0185 * k, 0.056 * k, 0.04 * k));
    add(g, ha, 0.03, ell(x - s * 0.002, wrY - 0.104 * k, z0 + 0.003, 0.0145 * k, 0.054 * k, 0.035 * k));
    add(g, ha, 0.016, cone([x - s * 0.004, wrY - 0.022 * k, z0 + 0.028 * k], [x - s * 0.013, wrY - 0.068 * k, z0 + 0.04 * k], 0.0125 * k, 0.0095 * k));
  }
  // ── the field ──
  const n = prims.length, D = new Float64Array(n), G = [[], [], [], [], []];
  prims.forEach((p, i) => G[p.g].push(i));
  const ca = Math.cos(ap), sa = Math.sin(ap);
  const shoulder = [P[B.upL], P[B.upR]];
  const FAR = 0.16;   // beyond this a primitive cannot touch any blend (every k < FAR): its bound stands in for it
  const evalD = (x, y, z) => {
    for (let i = 0; i < n; i++) {
      const p = prims[i];
      let X = x, Y = y;
      if (p.g >= 3 && ap) {   // undo the A-pose: rotate about the shoulder by ∓ap (about Z)
        const sp = shoulder[p.g - 3], sg = p.g === 3 ? 1 : -1, dx = x - sp[0], dy = y - sp[1];
        X = sp[0] + ca * dx + sg * sa * dy; Y = sp[1] - sg * sa * dx + ca * dy;
      }
      const b = p.b;
      if (b) { const qx = X - b[0], qy = Y - b[1], qz = z - b[2], lb = Math.sqrt(qx * qx + qy * qy + qz * qz) - b[3]; if (lb > FAR) { D[i] = lb; continue; } }
      D[i] = p.f(X, Y, z);
    }
  };
  const GV = new Float64Array(5);
  const groups = () => {
    for (let g = 0; g < 5; g++) {
      const ix = G[g]; if (!ix.length) { GV[g] = 1e9; continue; }
      let a = D[ix[0]]; for (let j = 1; j < ix.length; j++) a = smin(a, D[ix[j]], prims[ix[j]].k);
      GV[g] = a;
    }
  };
  const KG = [0, 0.06, 0.06, 0.05, 0.05];
  const comb = () => {
    groups();
    if (!G[0].length) return Math.min(GV[1], GV[2], GV[3], GV[4]);
    let d = GV[0];
    for (let g = 1; g < 5; g++) if (G[g].length) d = Math.min(d, smin(GV[0], GV[g], KG[g]));
    return d;
  };
  const f = (x, y, z) => { evalD(x, y, z); return comb(); };
  // skin weights: the limb this point belongs to (with the torso), then a soft-max over those primitives' distances, summed per bone
  const TAU = 0.011;
  const weights = (p) => {
    evalD(p.x, p.y, p.z); groups();
    let best = 0, bv = 1e9;
    for (let g = 1; g < 5; g++) if (G[g].length) { const v = G[0].length ? smin(GV[0], GV[g], KG[g]) : GV[g]; if (v < bv) { bv = v; best = g; } }
    const allow = [...G[0], ...(best ? G[best] : [])];
    let dm = 1e9; for (const i of allow) dm = Math.min(dm, D[i]);
    const acc = new Map();
    for (const i of allow) { const w = Math.exp(-(D[i] - dm) / TAU); if (w < 1e-4) continue; acc.set(prims[i].bone, (acc.get(prims[i].bone) ?? 0) + w); }
    return [...acc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  };
  return { f, weights };
};

// ── surface nets: mesh a field once over a box, with a coarse pre-pass (only cells near the surface are evaluated finely) ─────────
export const meshField = (f, lo, hi, h) => {
  const nx = Math.ceil((hi[0] - lo[0]) / h) + 1, ny = Math.ceil((hi[1] - lo[1]) / h) + 1, nz = Math.ceil((hi[2] - lo[2]) / h) + 1;
  const C = 4, cnx = Math.ceil((nx - 1) / C) + 1, cny = Math.ceil((ny - 1) / C) + 1, cnz = Math.ceil((nz - 1) / C) + 1;
  const cv = new Float32Array(cnx * cny * cnz);
  for (let k = 0; k < cnz; k++) for (let j = 0; j < cny; j++) for (let i = 0; i < cnx; i++) cv[i + cnx * (j + cny * k)] = f(lo[0] + i * C * h, lo[1] + j * C * h, lo[2] + k * C * h);
  const V = new Float32Array(nx * ny * nz), thr = 1.6 * C * h;
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const c = cv[Math.round(i / C) + cnx * (Math.round(j / C) + cny * Math.round(k / C))];
    V[i + nx * (j + ny * k)] = Math.abs(c) > thr ? c : f(lo[0] + i * h, lo[1] + j * h, lo[2] + k * h);
  }
  const at = (i, j, k) => V[i + nx * (j + ny * k)];
  const CO = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const ED = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const vid = new Map(), pos = [], cvals = new Float64Array(8);
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    let neg = 0;
    for (let c = 0; c < 8; c++) { const v = at(i + CO[c][0], j + CO[c][1], k + CO[c][2]); cvals[c] = v; if (v < 0) neg++; }
    if (neg === 0 || neg === 8) continue;
    let sx = 0, sy = 0, sz = 0, m = 0;
    for (const [a, b] of ED) {
      const va = cvals[a], vb = cvals[b]; if ((va < 0) === (vb < 0)) continue;
      const t = va / (va - vb);
      sx += CO[a][0] + t * (CO[b][0] - CO[a][0]); sy += CO[a][1] + t * (CO[b][1] - CO[a][1]); sz += CO[a][2] + t * (CO[b][2] - CO[a][2]); m++;
    }
    vid.set(i + (nx - 1) * (j + (ny - 1) * k), pos.length / 3);
    pos.push(lo[0] + (i + sx / m) * h, lo[1] + (j + sy / m) * h, lo[2] + (k + sz / m) * h);
  }
  const cell = (i, j, k) => vid.get(i + (nx - 1) * (j + (ny - 1) * k));
  const quads = [];
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const v0 = at(i, j, k) < 0;
    if (i < nx - 1 && v0 !== (at(i + 1, j, k) < 0) && j > 0 && k > 0 && j < ny - 1 && k < nz - 1) quads.push([cell(i, j - 1, k - 1), cell(i, j, k - 1), cell(i, j, k), cell(i, j - 1, k)]);
    if (j < ny - 1 && v0 !== (at(i, j + 1, k) < 0) && i > 0 && k > 0 && i < nx - 1 && k < nz - 1) quads.push([cell(i - 1, j, k - 1), cell(i, j, k - 1), cell(i, j, k), cell(i - 1, j, k)]);
    if (k < nz - 1 && v0 !== (at(i, j, k + 1) < 0) && i > 0 && j > 0 && i < nx - 1 && j < ny - 1) quads.push([cell(i - 1, j - 1, k), cell(i, j - 1, k), cell(i, j, k), cell(i - 1, j, k)]);
  }
  // project every vertex onto the surface; the field's gradient is its normal
  const e = h * 0.2, nv = pos.length / 3, nrm = new Float32Array(nv * 3);
  const grad = (x, y, z, d) => [f(x + e, y, z) - d, f(x, y + e, z) - d, f(x, y, z + e) - d];
  for (let v = 0; v < nv; v++) {
    let x = pos[3 * v], y = pos[3 * v + 1], z = pos[3 * v + 2], g = null;
    for (let it = 0; it < 2; it++) {
      const d = f(x, y, z); g = grad(x, y, z, d); const gl = Math.sqrt(g[0] * g[0] + g[1] * g[1] + g[2] * g[2]) || 1;
      let st = d / gl; st = Math.max(-0.6 * h, Math.min(0.6 * h, st));
      x -= (st * g[0]) / gl; y -= (st * g[1]) / gl; z -= (st * g[2]) / gl;
    }
    g = [f(x + e, y, z) - f(x - e, y, z), f(x, y + e, z) - f(x, y - e, z), f(x, y, z + e) - f(x, y, z - e)];
    const gl = Math.sqrt(g[0] * g[0] + g[1] * g[1] + g[2] * g[2]) || 1;
    pos[3 * v] = x; pos[3 * v + 1] = y; pos[3 * v + 2] = z; nrm[3 * v] = g[0] / gl; nrm[3 * v + 1] = g[1] / gl; nrm[3 * v + 2] = g[2] / gl;
  }
  // triangles (the shorter diagonal), wound to face along the field's gradient
  const I = [];
  const P3 = (a) => [pos[3 * a], pos[3 * a + 1], pos[3 * a + 2]];
  const tri = (a, b, c) => {
    const A = P3(a), Bv = P3(b), Cv = P3(c);
    const ux = Bv[0] - A[0], uy = Bv[1] - A[1], uz = Bv[2] - A[2], wx = Cv[0] - A[0], wy = Cv[1] - A[1], wz = Cv[2] - A[2];
    const fx = uy * wz - uz * wy, fy = uz * wx - ux * wz, fz = ux * wy - uy * wx;
    const sn = (nrm[3 * a] + nrm[3 * b] + nrm[3 * c]) * fx + (nrm[3 * a + 1] + nrm[3 * b + 1] + nrm[3 * c + 1]) * fy + (nrm[3 * a + 2] + nrm[3 * b + 2] + nrm[3 * c + 2]) * fz;
    if (sn >= 0) I.push(a, b, c); else I.push(a, c, b);
  };
  const d2 = (a, b) => { const A = P3(a), Bv = P3(b); return (A[0] - Bv[0]) ** 2 + (A[1] - Bv[1]) ** 2 + (A[2] - Bv[2]) ** 2; };
  for (const [a, b, c, d] of quads) {
    if (a == null || b == null || c == null || d == null) continue;
    if (d2(a, c) <= d2(b, d)) { tri(a, b, c); tri(a, c, d); } else { tri(a, b, d); tri(b, c, d); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(nv * 2), 2));
  g.setIndex(I);
  return g;
};

// the bounds of a body (arms rotated out by ap), and of the head / each hand alone
export const fieldBox = (S, P, B, parts, ap = 0, side = 1) => {
  if (parts === "headneck") return [[-0.13, S.neckY - 0.11, -0.14], [0.13, S.headY + S.hc[1] + S.R.ry + 0.04, 0.16]];
  if (parts === "hand") { const x = side * S.shX, wy = S.shY - S.upper - S.fore; return [[x - 0.07, wy - 0.2, -0.08], [x + 0.07, wy + 0.1, 0.09]]; }
  const reach = S.upper + S.fore + S.hand + 0.06, w = S.shX + Math.sin(ap) * reach + 0.07;
  return [[-w, -0.02, -0.17], [w, S.headY + S.hc[1] + S.R.ry + 0.04, S.tip + 0.04]];
};
