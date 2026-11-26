// @ts-nocheck
// ★ V38 rev 2 ROAD — the sedan's body, built as real surfaces (builder D). A generic mid-2000s American four-door family sedan
//   (no make, no badges): the lower body is LOFTED from ~130 cross-sections along its length (plan taper at nose and tail, a
//   shoulder crease, tumblehome above it, the sill tucked under, the wheel arches cut out of the side), the greenhouse is lofted on
//   the beltline (raked windshield, A/B/C pillars, roof with its drip mouldings, rear window), and the lamps are DECALS cut from the
//   body's own faces (so they hug the corners exactly). Front of the car = +x, right side = +z, ground y = 0. Units: metres.
import * as THREE from "three";

export const XR = -2.45, XF = 2.47, LEN = XF - XR;
export const AXLE = 1.45, WHEEL_R = 0.34, ARCH = 0.405, TRACK = 0.77;
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const sstep = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };

// ── the lower body ───────────────────────────────────────────────────────────────────────────────────────────────────────
/** plan half-width at x (the widest, at the shoulder) */
export const planW = (x) => {
  let w = 0.9 * (1 - 0.03 * (x / 2.45) ** 2);
  if (x > 1.92) { const t = cl((x - 1.92) / (XF - 1.92)); w *= Math.pow(1 - Math.pow(t, 3.0), 1 / 3.0); }
  if (x < -1.98) { const t = cl((-1.98 - x) / (-1.98 - XR)); w *= Math.pow(1 - Math.pow(t, 3.4), 1 / 3.4); }
  return w;
};
/** the shoulder crease, rising toward the tail (a wedge) */
export const shoulderY = (x) => 0.835 - 0.022 * x;
/** the top of the lower body: nose, hood, cowl, beltline (under the glasshouse), deck lid, tail */
export const topY = (x) => {
  if (x >= 1.0) {
    if (x <= 2.28) return 0.965 - 0.13 * Math.pow((x - 1.0) / 1.28, 1.5);
    const t = (x - 2.28) / (XF - 2.28); return 0.835 - 0.152 * (x - 2.28) - 0.09 * t * t;
  }
  if (x >= -1.45) return 0.965 + 0.02 * (1.0 - x) / 2.45;
  if (x >= -2.2) return 0.985 + 0.008 * (-1.45 - x) / 0.75;
  const t = (-2.2 - x) / (-2.2 - XR); return 0.993 - 0.035 * t - 0.07 * t * t;
};
/** the crown across the hood and the deck lid (0 along the beltline, where the glasshouse sits) */
export const crown = (x) => 0.032 * sstep(1.0, 1.2, x) * (1 - 0.6 * sstep(2.2, XF, x)) + 0.024 * sstep(-1.45, -1.62, x) * (1 - 0.6 * sstep(-2.2, XR, x));
const archY = (x) => { let y = -1; for (const c of [AXLE, -AXLE]) { const d = x - c; if (Math.abs(d) < ARCH) y = Math.max(y, 0.34 + Math.sqrt(ARCH * ARCH - d * d)); } return y; };
const baseY = (x) => (x > 0 ? 0.25 + 0.03 * sstep(1.9, 2.1, x) + 0.08 * sstep(2.2, XF, x) : 0.25 + 0.05 * sstep(-1.9, -2.1, x) + 0.09 * sstep(-2.25, XR, x));
/** the bottom edge of the side: sill / bumper, or the wheel arch */
export const botY = (x) => Math.max(baseY(x), archY(x));
/** the side's half-width at (x, y): vertical-ish below the crease, tumbling in above it, tucked under at the sill */
export const sideZ = (x, y) => {
  const d = y - shoulderY(x);
  let g;
  if (d >= 0) g = 1 - 0.22 * d - 0.9 * d * d;
  else { const e = -d; g = 1 - 0.015 * e - 1.1 * Math.max(0, e - 0.32) ** 2; }
  return planW(x) * g;
};
const RC = 0.055, RB = 0.035;
/** the half cross-section (z ≥ 0) at x: bottom centre → sill corner → side (crease exact) → top corner → top centre */
export const NB = 4, NBC = 3, NS1 = 12, NS2 = 6, NC = 5, NT = 8;
export const HALF = NB + NBC + NS1 + NS2 + 1 + NC + NT;   // points in a half ring
export const IDX = { sideStart: NB + NBC, crease: NB + NBC + NS1, sideEnd: NB + NBC + NS1 + NS2, topStart: NB + NBC + NS1 + NS2 + NC };
export const halfRing = (x) => {
  const yb = botY(x), yt = topY(x), cr = crown(x);
  const pts = [];
  const zb0 = sideZ(x, yb + RB), rb = Math.min(RB, zb0 * 0.5);
  for (let i = 0; i < NB; i++) pts.push([x, yb, (zb0 - rb) * i / NB, "b"]);
  for (let i = 0; i < NBC; i++) { const a = -Math.PI / 2 + (Math.PI / 2) * i / NBC; pts.push([x, yb + rb + rb * Math.sin(a), zb0 - rb + rb * Math.cos(a), "b"]); }
  const ylo = yb + rb, yhi0 = yt - RC;
  const yhi = Math.max(yhi0, ylo + 0.02);
  const ysc = Math.max(ylo + 0.008, Math.min(shoulderY(x), yhi - 0.012));
  for (let i = 0; i < NS1; i++) { const y = ylo + (ysc - ylo) * i / NS1; pts.push([x, y, sideZ(x, y), "s"]); }
  for (let i = 0; i <= NS2; i++) { const y = ysc + (yhi - ysc) * i / NS2; pts.push([x, y, sideZ(x, y), "s"]); }
  const zs = sideZ(x, yhi), rc = Math.min(RC, zs * 0.5, Math.max(0.005, yt - yhi)), zt = Math.max(0, zs - rc);
  for (let i = 1; i <= NC; i++) { const a = (Math.PI / 2) * i / NC; pts.push([x, yhi + (yt - yhi) * Math.sin(a), zt + rc * Math.cos(a), "s"]); }
  for (let i = 1; i <= NT; i++) { const z = zt * (1 - i / NT); pts.push([x, yt + cr * (1 - (zt > 0 ? (z / zt) ** 2 : 0)), z, "t"]); }
  return pts;
};
/** the stations along x: dense at the nose and tail, exact at the arch ends and the panel breaks */
/** stations: an even base (cosine-dense at the ends) with the panel breaks SNAPPED in (base stations next to a break are dropped,
 *  so the spacing never jumps — mixed spacing rippled the highlights along the roof rail) */
const snapStations = (base, breaks, gap) => {
  const xs = [...breaks, ...base.filter((x) => breaks.every((b) => Math.abs(b - x) > gap))];
  xs.sort((a, b) => a - b);
  return xs.filter((x, i) => i === 0 || x - xs[i - 1] > 1e-4);
};
const bodyStations = () => {
  const base = [], N = 150;
  for (let i = 0; i <= N; i++) base.push(XR + LEN * (0.5 - 0.5 * Math.cos(Math.PI * i / N)));
  const br = [XR, XF, 1.0, -1.45];
  for (const c of [AXLE, -AXLE]) for (const e of [-ARCH - 0.002, -ARCH + 0.002, ARCH - 0.002, ARCH + 0.002]) br.push(c + e);
  return snapStations(base, br, 0.022);
};
/** a full ring from a half ring: right side (z+) bottom→top, then the left side top→bottom (mirrored) */
const fullRing = (half) => [...half, ...half.slice(1, -1).reverse().map((p) => [p[0], p[1], -p[2], p[3], 1])];
/** an open ring (the glasshouse: belt → roof → belt, not closed underneath) */
const openRing = (half) => [...half, ...half.slice(0, -1).reverse().map((p) => [p[0], p[1], -p[2], p[3], p[4]])];

/** builds the loft (rings of equal length, open at both ends) → { pos, idx, ring, nS } with consistent outward winding */
const loft = (rings, closed = true) => {
  const nS = rings.length, nR = rings[0].length;
  const pos = new Float32Array(nS * nR * 3);
  rings.forEach((r, i) => r.forEach((p, j) => { const k = (i * nR + j) * 3; pos[k] = p[0]; pos[k + 1] = p[1]; pos[k + 2] = p[2]; }));
  const quads = [];
  for (let i = 0; i < nS - 1; i++) for (let j = 0; j < (closed ? nR : nR - 1); j++) {
    const j2 = (j + 1) % nR;
    quads.push([i * nR + j, (i + 1) * nR + j, (i + 1) * nR + j2, i * nR + j2, i, j]);
  }
  return { pos, quads, nS, nR };
};
const faceNormalOut = (pos, q) => {
  const v = (n) => new THREE.Vector3(pos[n * 3], pos[n * 3 + 1], pos[n * 3 + 2]);
  const a = v(q[0]), b = v(q[1]), c = v(q[2]);
  return new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
};
/** turns a loft + per-quad group into split geometries sharing smooth normals; uvFn(group, x, y, z) */
const buildGroups = ({ pos, quads }, groupOf, uvFn, nGroups, flip) => {
  const tri = (q) => (flip ? [[q[0], q[2], q[1]], [q[0], q[3], q[2]]] : [[q[0], q[1], q[2]], [q[0], q[2], q[3]]]);
  const all = new THREE.BufferGeometry();
  all.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const idxAll = []; quads.forEach((q) => tri(q).forEach((t) => idxAll.push(...t)));
  all.setIndex(idxAll); all.computeVertexNormals();
  const nrm = all.attributes.normal.array;
  const out = [];
  for (let g = 0; g < nGroups; g++) {
    const map = new Map(), P = [], N = [], U = [], I = [];
    quads.forEach((q, qi) => {
      if (groupOf(q, qi) !== g) return;
      tri(q).forEach((t) => t.forEach((v) => {
        if (!map.has(v)) {
          map.set(v, P.length / 3);
          const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2];
          P.push(x, y, z); N.push(nrm[v * 3], nrm[v * 3 + 1], nrm[v * 3 + 2]);
          const uv = uvFn ? uvFn(g, x, y, z) : [0, 0]; U.push(uv[0], uv[1]);
        }
        I.push(map.get(v));
      }));
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2));
    geo.setIndex(I); geo.computeBoundingSphere();
    out.push(geo);
  }
  return { geos: out, all };
};

let _body = null;
/** { side, top, under, all, rings } — side/top carry their own UVs (side: projected from the side; top: from above) */
export const bodyGeometry = () => {
  if (_body) return _body;
  const xs = bodyStations();
  const halves = xs.map(halfRing);
  const rings = halves.map(fullRing);
  const L = loft(rings);
  // winding: a side quad on the right (z+) must face +z
  const probe = L.quads.find((q) => q[5] === IDX.crease && q[4] === Math.floor(L.nS / 2));
  const flip = faceNormalOut(L.pos, probe).z < 0;
  const typeOf = (q) => {
    const r = rings[q[4]], a = r[q[5]][3], b = r[(q[5] + 1) % r.length][3];
    if (a === "b" && b === "b") return 2;
    if (a === "t" || b === "t") return 1;
    return 0;
  };
  const uv = (g, x, y, z) => (g === 1 ? [(x - XR) / LEN, 0.5 + z / 2] : [(x - XR) / LEN, y / 1.6]);
  const { geos, all } = buildGroups(L, typeOf, uv, 3, flip);
  _body = { side: geos[0], top: geos[1], under: geos[2], all, rings, halves, xs };
  return _body;
};

// ── the glasshouse ──────────────────────────────────────────────────────────────────────────────────────────────────────
export const XG0 = -1.45, XG1 = 1.0;
const pchip = (X, Y) => {
  const n = X.length, d = [], m = [];
  for (let i = 0; i < n - 1; i++) d.push((Y[i + 1] - Y[i]) / (X[i + 1] - X[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (3 * (X[i + 1] - X[i - 1])) / ((2 * X[i + 1] - X[i] - X[i - 1]) / d[i - 1] + (X[i + 1] + X[i] - 2 * X[i - 1]) / d[i]);
  return (x) => {
    if (x <= X[0]) return Y[0]; if (x >= X[n - 1]) return Y[n - 1];
    let i = 0; while (x > X[i + 1]) i++;
    const h = X[i + 1] - X[i], t = (x - X[i]) / h;
    const h00 = 2 * t ** 3 - 3 * t ** 2 + 1, h10 = t ** 3 - 2 * t ** 2 + t, h01 = -2 * t ** 3 + 3 * t ** 2, h11 = t ** 3 - t ** 2;
    return h00 * Y[i] + h10 * h * m[i] + h01 * Y[i + 1] + h11 * h * m[i + 1];
  };
};
/** the roofline (side view) */
export const roofY = pchip(
  [-1.45, -1.3, -1.05, -0.8, -0.55, -0.2, 0.1, 0.32, 0.55, 0.8, 1.0],
  [topY(-1.45), 1.1, 1.27, 1.375, 1.425, 1.445, 1.44, 1.41, 1.3, 1.135, topY(1.0)]
);
/** the glasshouse's half-width at the belt: inboard of the body's top corner by a small shelf (the belt moulding sits on it) */
export const beltW = (x) => Math.max(0.05, sideZ(x, topY(x) - RC) - RC - 0.03);
export const NSG = 8, NCG = 4, NTG = 8;
export const HALFG = NSG + 1 + NCG + NTG;
export const greenRing = (x) => {
  const yB = topY(x), yr = Math.max(roofY(x), yB + 0.0005), H = yr - yB;
  const wb = beltW(x), rr = Math.min(0.085, 0.45 * H), crn = 0.03 * Math.min(1, H / 0.2);
  const yS = yr - rr, wr = wb - 0.34 * (yS - yB);
  const pts = [];
  for (let k = 0; k <= NSG; k++) { const t = k / NSG; pts.push([x, yB + (yS - yB) * t, wb + (wr - wb) * t, "side", k]); }
  const zt = Math.max(0, wr - rr);
  for (let k = 1; k <= NCG; k++) { const a = (Math.PI / 2) * k / NCG; pts.push([x, yS + rr * Math.sin(a), zt + rr * Math.cos(a), "corner", k]); }
  for (let k = 1; k <= NTG; k++) { const z = zt * (1 - k / NTG); pts.push([x, yr + crn * (1 - (zt > 0 ? (z / zt) ** 2 : 0)), z, "top", k]); }
  return pts;
};
// the window layout along x
export const WIN = { aPillar: 0.975, bPillar: [-0.175, -0.075], cGlass: -1.0, wsTop: 0.31, wsBase: 0.985, rwTop: -0.67, rwBase: -1.42, frit: 0.03 };
const greenStations = () => {
  const base = [], N = 70;
  for (let i = 0; i <= N; i++) base.push(XG0 + (XG1 - XG0) * (0.5 - 0.5 * Math.cos(Math.PI * i / N)));
  const W = WIN;
  return snapStations(base, [XG0, XG1, W.aPillar, ...W.bPillar, W.cGlass, W.wsTop, W.wsTop + W.frit, W.wsBase, W.wsBase - W.frit, W.rwTop, W.rwTop - W.frit, W.rwBase, W.rwBase + W.frit], 0.018);
};
let _green = null;
/** { geo (groups: 0 paint, 1 black trim, 2 glass), rings, xs } */
export const greenGeometry = () => {
  if (_green) return _green;
  const xs = greenStations();
  const halves = xs.map(greenRing);
  const rings = halves.map(openRing);
  const L = loft(rings, false);
  const probe = L.quads.find((q) => q[5] === 3 && q[4] === Math.floor(L.nS / 2));
  const flip = faceNormalOut(L.pos, probe).z < 0;
  const W = WIN;
  const groupOf = (q) => {
    const j = q[5], xc = (rings[q[4]][0][0] + rings[q[4] + 1][0][0]) / 2;
    // the band's number on its own half: 0..NSG-1 side, NSG..NSG+NCG-1 corner, then top
    const b = j < HALFG - 1 ? j : 2 * HALFG - 3 - j;
    if (b < NSG) {
      if (b === 0) return 1;
      if (b === NSG - 1) return xc < W.cGlass ? 0 : 1;
      if (xc < W.cGlass || xc > W.aPillar) return 0;
      if (xc > W.bPillar[0] && xc < W.bPillar[1]) return 1;
      return 2;
    }
    if (b < NSG + NCG) return 0;
    if (b === NSG + NCG) return 1;
    const ws = xc > W.wsTop && xc < W.wsBase, rw = xc > W.rwBase && xc < W.rwTop;
    if (ws) return xc < W.wsTop + W.frit || xc > W.wsBase - W.frit || b === NSG + NCG + 1 ? 1 : 2;
    if (rw) return xc > W.rwTop - W.frit || xc < W.rwBase + W.frit || b === NSG + NCG + 1 ? 1 : 2;
    return 0;
  };
  const { geos, all } = buildGroups(L, groupOf, null, 3, flip);
  _green = { paint: geos[0], trim: geos[1], glass: geos[2], all, rings, halves, xs };
  return _green;
};

// ── decals cut from the body's faces (lamps, grille): conform exactly, offset a few mm along the normal ─────────────────────
/** dir: the view direction the decal faces (outward); c: projection centre; w,h: its size; the texture's alpha cuts the outline */
export const decal = ({ c, dir, w, h, off = 0.004, minDot = 0.15, src, flipU = false }) => {
  const g = src ?? bodyGeometry().all;
  const P = g.attributes.position.array, N = g.attributes.normal.array, I = g.index.array;
  const d = new THREE.Vector3(...dir).normalize();
  const up0 = new THREE.Vector3(0, 1, 0);
  const e1 = new THREE.Vector3().crossVectors(up0, d).normalize();    // u: to the decal's right as seen from outside
  if (e1.lengthSq() < 1e-6) e1.set(1, 0, 0);
  const e2 = new THREE.Vector3().crossVectors(d, e1).normalize();
  const C = new THREE.Vector3(...c);
  const uvOf = (i) => { const p = new THREE.Vector3(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]).sub(C); const u = p.dot(e1) / w + 0.5; return [flipU ? 1 - u : u, p.dot(e2) / h + 0.5]; };
  const pos = [], nrm = [], uv = [];
  for (let t = 0; t < I.length; t += 3) {
    const vs = [I[t], I[t + 1], I[t + 2]], uvs = vs.map(uvOf);
    if (!uvs.some(([u, v]) => u > -0.02 && u < 1.02 && v > -0.02 && v < 1.02)) continue;
    const n = new THREE.Vector3(N[vs[0] * 3] + N[vs[1] * 3] + N[vs[2] * 3], N[vs[0] * 3 + 1] + N[vs[1] * 3 + 1] + N[vs[2] * 3 + 1], N[vs[0] * 3 + 2] + N[vs[1] * 3 + 2] + N[vs[2] * 3 + 2]).normalize();
    if (n.dot(d) < minDot) continue;
    vs.forEach((v, k) => {
      pos.push(P[v * 3] + N[v * 3] * off, P[v * 3 + 1] + N[v * 3 + 1] * off, P[v * 3 + 2] + N[v * 3 + 2] * off);
      nrm.push(N[v * 3], N[v * 3 + 1], N[v * 3 + 2]); uv.push(uvs[k][0], uvs[k][1]);
    });
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.computeBoundingSphere();
  return geo;
};

// ── the x-ray's white rim: the panel and window lines as line segments (sampled from the lofts) ───────────────────────────
export const featureLines = () => {
  const B = bodyGeometry(), G = greenGeometry();
  const seg = [];
  const poly = (pts) => { for (let i = 0; i < pts.length - 1; i++) seg.push(...pts[i], ...pts[i + 1]); };
  const both = (fn) => [1, -1].forEach((s) => poly(fn().map((p) => [p[0], p[1], p[2] * s])));
  const along = (halves, j, x0 = -9, x1 = 9) => halves.filter((h) => h[0][0] >= x0 && h[0][0] <= x1).map((h) => h[j]);
  // body: sill + arches, the crease, the top corner; the outline across nose and tail
  both(() => along(B.halves, IDX.sideStart));
  both(() => along(B.halves, IDX.crease, XR + 0.08, XF - 0.06));
  both(() => along(B.halves, IDX.sideEnd + 2));
  [XR + 0.004, XF - 0.004, 1.0, -1.45].forEach((x) => { const i = B.xs.findIndex((v) => v >= x); poly(B.rings[Math.max(0, i)].map((p) => p.slice(0, 3))); });
  // door cuts: vertical lines on the side, sill to belt
  [0.99, -0.12, -0.99].forEach((x) => { const h = halfRing(x); both(() => h.slice(IDX.sideStart, IDX.sideEnd + 1)); });
  // glasshouse: belt, side window top, the roof edges, pillars, the screens' outlines
  both(() => along(G.halves, 0));
  both(() => along(G.halves, NSG - 1, WIN.cGlass, WIN.aPillar));
  both(() => along(G.halves, NSG + NCG));
  [WIN.aPillar, WIN.bPillar[0], WIN.bPillar[1], WIN.cGlass].forEach((x) => both(() => greenRing(x).slice(1, NSG)));
  [WIN.wsTop, WIN.rwTop].forEach((x) => { const r = greenRing(x); both(() => r.slice(NSG + NCG)); });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
  return geo;
};
