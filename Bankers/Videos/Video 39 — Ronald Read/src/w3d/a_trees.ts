// @ts-nocheck
// ★ V39 builder A — TREES for the store set (CLAUDE.md 3-D World: no cones). Two kinds, both instanced/merged so dozens stay cheap:
//   conifer(seed)  an eastern white pine / balsam fir: a visible tapering trunk, whorls of drooping BRANCHES (each a bent strip of
//                  needle-cluster texture with an alpha cut-out, its tip curving down), snow lying on the upper branches in clumps.
//   maple(m, …)    a bare winter sugar maple: a recursive branching skeleton tapering to twigs (merged into the caller's Mesher).
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";

// the needle-cluster atlas: 0 a branch of needles · 1 the same branch carrying snow on its upper side
export const needleTex = () => canvasTex("a_needles", 512, 512, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  for (let cell = 0; cell < 2; cell++) {
    const ox = cell * 256;
    const twig = (x0, y0, x1, y1, lw) => { c.strokeStyle = "#2A2118"; c.lineWidth = lw; c.beginPath(); c.moveTo(ox + x0, y0); c.lineTo(ox + x1, y1); c.stroke(); };
    // the main twig from the base (bottom) to the tip (top), side twigs alternating
    const pts = [];
    for (let k = 0; k < 9; k++) { const t = k / 8, y = h - 10 - t * (h - 30), x = 128 + Math.sin(t * 3 + cell) * 6; pts.push([x, y]); }
    for (let k = 0; k < 8; k++) twig(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], 7 - k * 0.6);
    const sides = [];
    for (let k = 1; k < 16; k++) { const t = k / 16, y = h - 10 - t * (h - 40), s = k % 2 ? 1 : -1, len = (1 - t * 0.7) * 105; const x1 = 128 + s * len, y1 = y - len * 0.45; twig(128, y, x1, y1, 3.2 - t * 1.5); sides.push([128, y, x1, y1]); }
    // needles: dense short strokes along every twig, dark blue-green with lighter tips
    const segs = [...sides, ...pts.slice(0, -1).map((p, k) => [p[0], p[1], pts[k + 1][0], pts[k + 1][1]])];
    let i = 0;
    for (const [x0, y0, x1, y1] of segs) {
      const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L;
      for (let s = 0; s < L; s += 2.2) for (const side of [-1, 1]) {
        i++;
        const px = x0 + ux * s, py = y0 + uy * s, a = Math.atan2(uy, ux) + side * (0.55 + rnd(i) * 0.5), nl = 16 + rnd(i + 1) * 16;
        const g = 40 + rnd(i + 2) * 40;
        c.strokeStyle = `rgb(${18 + rnd(i + 3) * 14},${g},${g * 0.78})`; c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(ox + px, py); c.lineTo(ox + px + Math.cos(a) * nl, py + Math.sin(a) * nl); c.stroke();
      }
    }
    if (cell === 1) {   // snow clumps caught on the twigs (the branch's upper side)
      for (let k = 0; k < 60; k++) {
        const sd = sides[Math.floor(rnd(k + 50) * sides.length)], t = 0.15 + rnd(k + 51) * 0.75, x = sd[0] + (sd[2] - sd[0]) * t, y = sd[1] + (sd[3] - sd[1]) * t - 3;
        const ang = Math.atan2(sd[3] - sd[1], sd[2] - sd[0]), r1 = 12 + rnd(k + 52) * 16, r2 = 4 + rnd(k + 53) * 4;
        c.save(); c.translate(ox + x, y); c.rotate(ang);
        const g = c.createLinearGradient(0, -r2, 0, r2); g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.6, "#DCE6F2"); g.addColorStop(1, "rgba(180,198,222,0.6)");
        c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, r1, r2, 0, 0, 7); c.fill(); c.restore();
      }
    }
  }
});
let NM = null;
export const needleMat = () => NM ??= (() => { const m = new THREE.MeshStandardMaterial({ map: needleTex(), alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.9, metalness: 0, vertexColors: true }); return m; })();
let BM = null;
export const barkMat = () => BM ??= new THREE.MeshStandardMaterial({ color: "#2A2420", roughness: 0.95, metalness: 0, vertexColors: true });

// one branch: a strip from the trunk outward, drooping (a parabola), its width tapering; uv u across, v along (base → tip)
const branchInto = (P, U, C, I, origin, yaw, len, wid, droop, cell, tint) => {
  const n = 5, base = P.length / 3, ca = Math.cos(yaw), sa = Math.sin(yaw);
  for (let k = 0; k <= n; k++) {
    const t = k / n, r = len * t, y = origin[1] + 0.12 * len * t - droop * len * t * t, half = wid * (1 - 0.55 * t) * 0.5;
    for (const s of [-1, 1]) {
      const lx = r, lz = s * half, lyTilt = s * half * 0.25;   // a little roll so the branch is not a flat board
      P.push(origin[0] + lx * ca - lz * sa, y + lyTilt, origin[2] + lx * sa + lz * ca);
      U.push(cell * 0.5 + (s < 0 ? 0.02 : 0.48), 0.02 + t * 0.96);
      C.push(tint[0], tint[1], tint[2]);
    }
    if (k) { const a = base + (k - 1) * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
};
const GEO = {};
/** a conifer of height ~1 (scale it per instance): trunk + whorls of drooping needle branches; snowy = share of snowy branches */
export const coniferGeo = (seed = 1, snowy = 0.55, kind = "pine") => GEO[`${kind}${seed}_${snowy}`] ??= (() => {
  const P = [], U = [], C = [], I = [];
  const whorls = kind === "fir" ? 16 : 12, H = 1, bottom = kind === "fir" ? 0.1 : 0.22;
  for (let w = 0; w < whorls; w++) {
    const f = w / (whorls - 1), y = bottom + f * (H - bottom - 0.04);
    const reach = (kind === "fir" ? 0.2 : 0.27) * Math.pow(1 - f, kind === "fir" ? 1.0 : 0.85) * (0.85 + rnd(seed * 29 + w) * 0.3) + 0.03;
    const nb = Math.max(4, Math.round((kind === "fir" ? 9 : 7) - f * 3));
    for (let b = 0; b < nb; b++) {
      const yaw = (b / nb) * Math.PI * 2 + rnd(seed * 13 + w * 7 + b) * 0.7 + w * 0.9;
      const sn = rnd(seed * 31 + w * 5 + b) < snowy * (0.6 + f * 0.6) ? 1 : 0;
      const tone = 0.7 + rnd(seed + w * 3 + b) * 0.5;
      for (let layer = 0; layer < 2; layer++) {   // two strips per branch, crossed a little, so it has body from every side
        branchInto(P, U, C, I, [0, y - layer * 0.012, 0], yaw + layer * 0.22, reach * (1 - layer * 0.18), reach * (kind === "fir" ? 0.75 : 0.62), (kind === "pine" ? 0.55 : 0.4) + rnd(seed + b + w) * 0.25, layer ? 0 : sn, [tone, tone, tone]);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2)); g.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));
  g.setIndex(I); g.computeVertexNormals();
  // bend the normals upward a little so the canopy shades as a volume (light from above reads on the top)
  const N = g.attributes.normal; for (let i = 0; i < N.count; i++) { const ny = Math.abs(N.getY(i)); N.setXYZ(i, N.getX(i) * 0.5, 0.5 + ny, N.getZ(i) * 0.5); }
  g.computeBoundingSphere();
  return g;
})();
export const trunkGeo = () => GEO.trunk ??= (() => { const g = new THREE.CylinderGeometry(0.008, 0.022, 1, 7); g.translate(0, 0.5, 0); const c = []; for (let i = 0; i < g.attributes.position.count; i++) c.push(1, 1, 1); g.setAttribute("color", new THREE.Float32BufferAttribute(c, 3)); return g; })();
/** instanced conifers: items [{p, h, ry?, kind?}] → an array of THREE objects (3 shapes per kind, trunk instanced too) */
export const conifers = (items, cast = false) => {
  const out = [];
  const kinds = ["pine", "fir"];
  for (const kind of kinds) for (let v = 0; v < 3; v++) {
    const its = items.filter((it, i) => (it.kind ?? (i % 3 === 0 ? "fir" : "pine")) === kind && (i % 3) === v);
    if (!its.length) continue;
    const crown = new THREE.InstancedMesh(coniferGeo(v + 1 + (kind === "fir" ? 10 : 0), 0.55, kind), needleMat(), its.length);
    const trunk = new THREE.InstancedMesh(trunkGeo(), barkMat(), its.length);
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0);
    its.forEach((it, i) => {
      Q.setFromAxisAngle(Y, it.ry ?? rnd(i * 7 + v) * 6.28);
      const h = it.h, w = h * (it.w ?? 1);
      M.compose(new THREE.Vector3(...it.p), Q, new THREE.Vector3(w, h, w)); crown.setMatrixAt(i, M);
      M.compose(new THREE.Vector3(...it.p), Q, new THREE.Vector3(h * 1.4, h * 0.97, h * 1.4)); trunk.setMatrixAt(i, M);
    });
    for (const im of [crown, trunk]) { im.castShadow = cast; im.receiveShadow = false; im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); out.push(im); }
  }
  return out;
};

/** a bare sugar maple merged into Mesher m (material `bark`): recursive limbs tapering to twigs; snow on the crotches */
export const maple = (m, base, height = 8, seed = 1) => {
  // a cylinder of radius 1 scaled by r: Mesher.cyl takes (r, h) → scale [r,h,r]; rt/rb are the relative top/bottom radii → emulate with rb=1
  const grow = (p, dir, len, r, depth, k) => {
    const end = [p[0] + dir.x * len, p[1] + dir.y * len, p[2] + dir.z * len];
    m.cyl("bark", [(p[0] + end[0]) / 2, (p[1] + end[1]) / 2, (p[2] + end[2]) / 2], r, len, "#FFFFFF", { rt: 0.72, rb: 1, seg: depth > 3 ? 7 : 4, r: (() => { const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); const e = new THREE.Euler().setFromQuaternion(q); return [e.x, e.y, e.z]; })() });
    if (depth === 0 || r < 0.008) return;
    const nb = depth > 4 ? 2 : 2 + (rnd(k) < 0.55 ? 1 : 0);
    for (let b = 0; b < nb; b++) {
      const yaw = (b / nb) * Math.PI * 2 + rnd(k + b * 3) * 2.2, tilt = 0.4 + rnd(k + b * 5) * 0.5;
      const nd = dir.clone().multiplyScalar(1.15).add(new THREE.Vector3(Math.cos(yaw) * Math.sin(tilt), Math.cos(tilt) * 0.25, Math.sin(yaw) * Math.sin(tilt))).normalize();
      nd.y = Math.max(nd.y, 0.2); nd.normalize();
      grow(end, nd, len * (0.68 + rnd(k + b) * 0.16), r * 0.66, depth - 1, k * 3 + b + 1);
    }
  };
  grow(base, new THREE.Vector3((rnd(seed) - 0.5) * 0.12, 1, (rnd(seed + 1) - 0.5) * 0.12).normalize(), height * 0.32, height * 0.026, 6, seed * 11 + 3);
};
