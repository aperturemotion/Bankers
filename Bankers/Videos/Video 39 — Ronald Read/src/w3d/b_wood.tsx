// @ts-nocheck
// ★ V39 builder B — FIREWOOD for the yard (FACTCHECK row 4: he chopped his own firewood into his nineties): a big neat woodpile of
//   16-inch splits (quarters, halves, wedges and small rounds, end grain with growth rings, checks and a bark rim) stacked between
//   criss-crossed end cribs; a chopping block (a big round with axe scars on its top) with a felling axe sunk in it; splits and rounds
//   lying by it; wood chips and bark scattered on the trodden snow.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";

const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
// ── textures ────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** end grain: growth rings round the pith at the centre, radial checks, a bark rim at the outer radius (0.5 of the texture) */
export const endGrainTex = (seed = 1, hue = 32) => canvasTex("b_endgrain" + seed, 512, 512, (c, w, h) => {
  const cx = w / 2 + (rnd(seed) - 0.5) * 20, cy = h / 2 + (rnd(seed + 1) - 0.5) * 20;
  c.fillStyle = `hsl(${hue},38%,62%)`; c.fillRect(0, 0, w, h);
  for (let r = 4; r < w * 0.48; r += 3 + rnd(r + seed) * 5) {
    c.strokeStyle = `hsla(${hue - 4},${40 + rnd(r) * 10}%,${36 + rnd(r + 3) * 14}%,${0.35 + rnd(r + 5) * 0.3})`; c.lineWidth = 1 + rnd(r + 7) * 2;
    c.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.08) { const rr = r * (1 + 0.04 * Math.sin(a * 3 + seed) + 0.02 * Math.sin(a * 7 + r)); c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    c.stroke();
  }
  // the heartwood a shade darker, weathered grey toward the face's edges
  const g = c.createRadialGradient(cx, cy, 0, cx, cy, w * 0.5); g.addColorStop(0, "rgba(120,70,30,0.18)"); g.addColorStop(0.5, "rgba(120,70,30,0.05)"); g.addColorStop(0.85, "rgba(80,80,80,0.12)"); g.addColorStop(1, "rgba(60,60,60,0.25)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  // radial drying checks
  for (let k = 0; k < 7; k++) { const a = rnd(seed * 7 + k) * Math.PI * 2, r0 = 10 + rnd(k) * 40, r1 = r0 + 60 + rnd(k + 2) * 140; c.strokeStyle = "rgba(40,24,10,0.7)"; c.lineWidth = 2 + rnd(k + 4) * 2; c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a + 0.03) * r1, cy + Math.sin(a + 0.03) * r1); c.stroke(); }
  // saw marks: faint parallel arcs across the face
  for (let k = 0; k < 30; k++) { c.strokeStyle = "rgba(255,240,210,0.06)"; c.lineWidth = 3; c.beginPath(); c.arc(cx - w * 1.4, cy, w * 1.2 + k * 9, -0.4, 0.4); c.stroke(); }
  // the bark rim
  c.strokeStyle = "#3E3026"; c.lineWidth = 26; c.beginPath(); c.arc(cx, cy, w * 0.49, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = "#7A6248"; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, w * 0.465, 0, Math.PI * 2); c.stroke();
  for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "60,36,16" : "255,240,210"},${rnd(i + 1) * 0.08})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2, 2); }
});
const splitSideTex = () => { const t = canvasTex("b_splitside", 512, 512, (c, w, h) => {
  c.fillStyle = "#A88A64"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "70,48,26" : "230,210,170"},${0.06 + rnd(i + 1) * 0.12})`; c.fillRect(rnd(i + 2) * w, 0, 1 + rnd(i + 3) * 3, h); }
  for (let i = 0; i < 40; i++) { c.fillStyle = "rgba(50,30,14,0.4)"; c.fillRect(rnd(i * 3) * w, rnd(i * 5) * h, 2, 30 + rnd(i) * 120); }
  // patches of bark
  for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(62,48,38,${0.5 + rnd(i) * 0.4})`; c.fillRect(rnd(i * 9) * w, 0, 40 + rnd(i * 11) * 90, h); for (let q = 0; q < 50; q++) { c.fillStyle = "rgba(20,14,10,0.5)"; c.fillRect(rnd(i * 9) * w + rnd(q) * 100, rnd(q * 3) * h, 2, 10 + rnd(q * 5) * 40); } }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const barkTex = (light = false) => { const t = canvasTex(light ? "e_bark_split" : "b_bark", 512, 512, (c, w, h) => {
  c.fillStyle = light ? "#6E6052" : "#4A3C30"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) { const x = rnd(i) * w, y = rnd(i + 1) * h, ww = 10 + rnd(i + 2) * 30, hh = 40 + rnd(i + 3) * 120; c.fillStyle = `rgba(${rnd(i + 4) < 0.5 ? "30,22,16" : "120,104,88"},${0.3 + rnd(i + 5) * 0.4})`; c.fillRect(x, y, ww, hh); }
  for (let i = 0; i < 120; i++) { c.fillStyle = "rgba(15,10,6,0.6)"; c.fillRect(rnd(i * 7) * w, 0, 3 + rnd(i) * 4, h); }
  for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(130,140,110,${0.15 + rnd(i) * 0.2})`; c.beginPath(); c.arc(rnd(i * 3) * w, rnd(i * 5) * h, 4 + rnd(i) * 12, 0, 7); c.fill(); }   // lichen
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
/** the block's top: end grain worn by years of splitting — axe cuts across it */
const blockTopTex = () => canvasTex("b_blocktop", 512, 512, (c, w, h) => {
  const img = endGrainTex(77, 30).image; c.drawImage(img, 0, 0, w, h);
  c.fillStyle = "rgba(60,50,40,0.25)"; c.beginPath(); c.arc(w / 2, h / 2, w * 0.44, 0, 7); c.fill();
  for (let k = 0; k < 70; k++) { const a = rnd(k) * Math.PI, x = w / 2 + (rnd(k + 1) - 0.5) * w * 0.6, y = h / 2 + (rnd(k + 2) - 0.5) * h * 0.6, L = 30 + rnd(k + 3) * 90; c.strokeStyle = `rgba(${rnd(k + 4) < 0.5 ? "40,28,16" : "230,210,170"},${0.35 + rnd(k + 5) * 0.4})`; c.lineWidth = 2 + rnd(k + 6) * 2; c.beginPath(); c.moveTo(x - Math.cos(a) * L / 2, y - Math.sin(a) * L / 2); c.lineTo(x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2); c.stroke(); }
});
// ── the splits: cross-sections extruded 0.4 m (along z); caps carry the end grain, the shape is in "log" coordinates (pith at 0) ──
//   (E) built by hand so each face gets its own material: the END GRAIN on the caps, BARK only on the round outer faces (the log's
//   surface), raw SPLIT WOOD on the flat faces where the maul split it — those faces are torn: fibrous ridges along the grain.
const SPLIT_L = 0.4;
const shapes = () => {
  const R = 0.11;
  const quarter = new THREE.Shape(); quarter.moveTo(0, 0); quarter.lineTo(R, 0); quarter.absarc(0, 0, R, 0, Math.PI / 2, false); quarter.lineTo(0, 0);
  const half = new THREE.Shape(); half.moveTo(-R * 0.85, 0); half.lineTo(R * 0.85, 0); half.absarc(0, 0, R * 0.85, 0, Math.PI, false);
  const wedge = new THREE.Shape(); wedge.moveTo(0, 0); wedge.absarc(0, 0, R * 1.2, Math.PI * 0.35, Math.PI * 0.62, false); wedge.lineTo(0, 0);
  const round = new THREE.Shape(); round.absarc(0, 0, R * 0.55, 0, Math.PI * 2, false);
  return [{ s: quarter, R }, { s: half, R: R * 0.85 }, { s: wedge, R: R * 1.2 }, { s: round, R: R * 0.55 }];
};
// the outlines as edge lists: [x0, y0, x1, y1, arc?]
const outline = (k) => {
  const R = [0.11, 0.11 * 0.85, 0.11 * 1.2, 0.11 * 0.55][k], E = [];
  const arc = (a0, a1, n) => { for (let i = 0; i < n; i++) { const t0 = a0 + (a1 - a0) * (i / n), t1 = a0 + (a1 - a0) * ((i + 1) / n); E.push([Math.cos(t0) * R, Math.sin(t0) * R, Math.cos(t1) * R, Math.sin(t1) * R, true]); } };
  if (k === 0) { E.push([0, 0, R, 0, false]); arc(0, Math.PI / 2, 10); E.push([0, R, 0, 0, false]); }
  if (k === 1) { E.push([-R, 0, R, 0, false]); arc(0, Math.PI, 16); }
  if (k === 2) { const a0 = Math.PI * 0.35, a1 = Math.PI * 0.62; E.push([0, 0, Math.cos(a0) * R, Math.sin(a0) * R, false]); arc(a0, a1, 6); E.push([Math.cos(a1) * R, Math.sin(a1) * R, 0, 0, false]); }
  if (k === 3) arc(0, Math.PI * 2, 18);
  return { E, R };
};
let SG = null;
const splitGeos = () => SG ??= [0, 1, 2, 3].map((k, gi) => {
  const { E, R } = outline(k), nz = 6, P = [], N = [], U = [], idx = [], groups = [], keep = [];
  const push = (x, y, z, nx, ny, nzz, u, v, fixed = true) => { P.push(x, y, z); N.push(nx, ny, nzz); U.push(u, v); const i = P.length / 3 - 1; if (fixed) keep.push(i); return i; };
  // the caps (end grain): triangulated outline at ±L/2, UVs centred on the pith with the bark rim at the log's radius
  const pts2 = E.map((e) => new THREE.Vector2(e[0], e[1]));
  const tris = THREE.ShapeUtils.triangulateShape(pts2, []);
  const capStart = idx.length;
  for (const sd of [-1, 1]) {
    const base = P.length / 3;
    pts2.forEach((p) => push(p.x, p.y, sd * SPLIT_L / 2, 0, 0, sd, 0.5 + p.x / (2.04 * R), 0.5 + p.y / (2.04 * R)));
    for (const t of tris) if (sd > 0) idx.push(base + t[0], base + t[1], base + t[2]); else idx.push(base + t[0], base + t[2], base + t[1]);
  }
  groups.push([capStart, idx.length - capStart, 0]);
  // the sides: arc faces (bark) then flat faces (split wood, torn)
  for (const wantArc of [true, false]) {
    const g0 = idx.length;
    E.forEach((e, ei) => {
      if (e[4] !== wantArc) return;
      const [x0, y0, x1, y1] = e, ex = x1 - x0, ey = y1 - y0, el = Math.hypot(ex, ey) || 1, nx = ey / el, ny = -ex / el;   // outward normal (CCW outline)
      const nw = wantArc ? 1 : Math.max(3, Math.round(el / 0.012));
      const rows = [];
      for (let iz = 0; iz <= nz; iz++) {
        const z = -SPLIT_L / 2 + (iz / nz) * SPLIT_L, row = [];
        for (let iw = 0; iw <= nw; iw++) {
          const t = iw / nw;
          let x = x0 + ex * t, y = y0 + ey * t, dnx = nx, dny = ny;
          if (wantArc) { const r = Math.hypot(x, y) || 1; dnx = x / r; dny = y / r; }
          else if (iw > 0 && iw < nw) {
            // torn fibres: ridges running along the grain (constant along z, varying across), a little wander along z
            const d = 0.004 * Math.sin(t * 23 + ei * 3 + gi) + 0.003 * Math.sin(t * 57 + ei) + 0.0015 * Math.sin(z * 40 + t * 9);
            x += nx * d; y += ny * d;
          }
          const u = wantArc ? (Math.atan2(y, x) * R * 3) : t * el * 6, v = z * 2.5;
          row.push(push(x, y, z, dnx, dny, 0, u, v, wantArc));
        }
        rows.push(row);
      }
      for (let iz = 0; iz < nz; iz++) for (let iw = 0; iw < nw; iw++) { const a = rows[iz][iw], b = rows[iz][iw + 1], c2 = rows[iz + 1][iw], d = rows[iz + 1][iw + 1]; idx.push(a, b, c2, b, d, c2); }
    });
    groups.push([g0, idx.length - g0, wantArc ? 1 : 2]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2));
  g.setIndex(idx);
  for (const [st, cnt, mi] of groups) if (cnt > 0) g.addGroup(st, cnt, mi);
  g.computeVertexNormals();
  // the torn split faces take their computed normals (the ridges catch the light); caps and bark keep their exact normals
  const NA = g.attributes.normal; for (const i of keep) NA.setXYZ(i, N[i * 3], N[i * 3 + 1], N[i * 3 + 2]);
  g.computeBoundingSphere();
  return g;
});
/** freshly split wood: pale, long fibres, darker streaks, a few checks */
const splitFaceTex = () => { const t = canvasTex("e_splitface", 512, 512, (c, w, h) => {
  c.fillStyle = "#B89A72"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 700; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "96,70,44" : "236,216,180"},${0.05 + rnd(i + 1) * 0.14})`; c.fillRect(rnd(i + 2) * w, 0, 1 + rnd(i + 3) * 3, h); }
  for (let i = 0; i < 60; i++) { c.fillStyle = "rgba(60,40,22,0.35)"; c.fillRect(rnd(i * 3) * w, rnd(i * 5) * h, 2, 30 + rnd(i) * 160); }
  for (let i = 0; i < 12; i++) { const g = c.createLinearGradient(0, 0, w, 0); const x = rnd(i * 7) * w; c.fillStyle = `rgba(140,100,60,${0.08 + rnd(i) * 0.08})`; c.fillRect(x, 0, 20 + rnd(i * 3) * 40, h); }
  for (let i = 0; i < 400; i++) { c.fillStyle = "rgba(255,240,210,0.2)"; c.fillRect(rnd(i * 11) * w, rnd(i * 13) * h, 1, 6 + rnd(i) * 20); }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
/** pieces: [{ p:[x,y,z], k: shape 0–3, rz, s:[sx,sy,sz], ry }] → instanced meshes (one per shape) */
export const Splits = ({ pieces, seedTex = 1 }) => {
  const meshes = useMemo(() => {
    const geos = splitGeos();
    const bt = barkTex(true); bt.repeat.set(1, 1);
    const bark = new THREE.MeshStandardMaterial({ map: bt, roughness: 0.95 });
    const side = new THREE.MeshStandardMaterial({ map: splitFaceTex(), roughness: 0.86 });
    return geos.map((g, k) => {
      const ends = new THREE.MeshStandardMaterial({ map: endGrainTex(seedTex + k, 30 + k * 3), roughness: 0.8 });
      const its = pieces.filter((q) => q.k === k);
      const im = new THREE.InstancedMesh(g, [ends, bark, side], Math.max(1, its.length));
      const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), C = new THREE.Color();
      its.forEach((q, i) => {
        Q.setFromEuler(E.set(q.rx ?? 0, q.ry ?? 0, q.rz ?? 0, "YXZ"));
        M.compose(new THREE.Vector3(...q.p), Q, new THREE.Vector3(...(q.s ?? [1, 1, 1])));
        im.setMatrixAt(i, M);
        const t = 0.78 + rnd(i * 13 + k) * 0.32; C.setRGB(t, t * (0.97 + rnd(i + 3) * 0.05), t * (0.92 + rnd(i + 5) * 0.1)); im.setColorAt(i, C);
      });
      im.count = its.length; im.castShadow = true; im.receiveShadow = true; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.computeBoundingSphere();
      return im;
    });
  }, []);
  return <>{meshes.map((m, i) => <primitive key={i} object={m} />)}</>;
};
/** the rotated, scaled cross-section's bounding box (for packing) */
const SHP = [];
const bbox = (k, rz, sx, sy) => {
  if (!SHP.length) shapes().forEach(({ s }) => SHP.push(s.getPoints(16)));
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  const c = Math.cos(rz), sn = Math.sin(rz);
  for (const p of SHP[k]) { const x = (p.x * c - p.y * sn) * sx, y = (p.x * sn + p.y * c) * sy; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return { x0, x1, y0, y1 };
};
/** a neat pile: courses of splits packed edge to edge (ends toward +z) between criss-crossed end cribs; L long (x), H high,
 *  rows deep; origin at its front-bottom-left. Each piece sits on the course below; wedges alternate point-up / point-down. */
export const pilePieces = (L = 4.4, H = 1.45, rows = 2, seed = 1) => {
  const out = [];
  let k = seed * 991;
  const crib = 0.36;
  for (let r = 0; r < rows; r++) {
    const z = -SPLIT_L / 2 - r * (SPLIT_L + 0.015);
    let y = 0.0, course = 0;
    while (y < H - 0.08) {
      let x = crib + 0.02, top = 0, flip = course % 2;
      while (x < L - crib - 0.1) {
        const kind = rnd(k + 1) < 0.46 ? 0 : rnd(k + 2) < 0.45 ? 1 : rnd(k + 3) < 0.65 ? 2 : 3;
        const sc = 1.0 + rnd(k + 4) * 0.35, sy = sc * (0.92 + rnd(k + 11) * 0.16);
        const up = (rnd(k + 5) < 0.5) !== !!flip;
        const rz = (kind === 0 ? (up ? Math.PI * 0.75 : -Math.PI / 4) : kind === 1 ? (up ? 0 : Math.PI) : kind === 2 ? (up ? -Math.PI * 0.485 + Math.PI : -Math.PI * 0.485) : rnd(k + 6) * 6.28) + (rnd(k + 7) - 0.5) * 0.22;
        const bb = bbox(kind, rz, sc, sy);
        const w = bb.x1 - bb.x0;
        if (x + w > L - crib + 0.02) break;
        out.push({ p: [x - bb.x0, y - bb.y0 + (rnd(k + 8) - 0.5) * 0.01, z + (rnd(k + 9) - 0.5) * 0.05], k: kind, rz, ry: (rnd(k + 10) - 0.5) * 0.06, rx: 0, s: [sc, sy, 0.92 + rnd(k + 12) * 0.16] });
        top = Math.max(top, bb.y1 - bb.y0);
        x += w - 0.016;
        k += 13;
      }
      y += top * 0.78; course++;
    }
  }
  // the end cribs: two pieces a layer, alternately ends-out and lying across, up the full height
  const D = rows * SPLIT_L + (rows - 1) * 0.015;
  for (const cx of [crib / 2, L - crib / 2]) {
    let y = 0.0, layer = 0;
    while (y < H - 0.06) {
      for (let q = 0; q < 2; q++) {
        const along = layer % 2 === 0, off = (q - 0.5) * 0.18;
        out.push({ p: along ? [cx + off, y + 0.075, -D / 2] : [cx, y + 0.075, -D / 2 + off * 2.2], k: 1, rz: (rnd(k) - 0.5) * 0.12, ry: along ? 0 : Math.PI / 2, rx: 0, s: along ? [1.0, 0.9, D / SPLIT_L] : [1.0, 0.9, 0.95] });
        k += 7;
      }
      y += 0.14; layer++;
    }
  }
  return out;
};
// ── the chopping block, the axe in it, splits and chips round it ───────────────────────────────────────────────────────────
let AXEG = null;
const axeGeos = () => AXEG ??= (() => {
  // a single-bit felling axe head (side profile in x–y: poll at x 0, the bit at x 0.19), eye hole, tapering to the edge
  const s = new THREE.Shape();
  s.moveTo(0, -0.03); s.lineTo(0.055, -0.03); s.quadraticCurveTo(0.11, -0.03, 0.15, -0.065); s.lineTo(0.19, -0.075);
  s.quadraticCurveTo(0.205, 0.0, 0.19, 0.072); s.lineTo(0.15, 0.06); s.quadraticCurveTo(0.11, 0.03, 0.055, 0.03); s.lineTo(0, 0.03); s.lineTo(0, -0.03);
  const head = new THREE.ExtrudeGeometry(s, { depth: 0.034, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 2, curveSegments: 12 });
  head.translate(-0.03, 0, -0.017);
  const P = head.attributes.position;
  for (let i = 0; i < P.count; i++) { const x = P.getX(i), t = cl((x - 0.03) / 0.135); P.setZ(i, P.getZ(i) * (1 - 0.9 * t)); }
  head.computeVertexNormals();
  // the hickory handle: a gentle S along local +y, swelling to a knob at the end
  const curve = new THREE.CatmullRomCurve3([[0, -0.036, 0], [0, 0.2, 0], [-0.018, 0.45, 0], [-0.005, 0.66, 0], [0.02, 0.78, 0]].map((p) => new THREE.Vector3(...p)));
  const handle = new THREE.TubeGeometry(curve, 40, 0.016, 10, false);
  const H = handle.attributes.position;
  for (let sgi = 0; sgi <= 40; sgi++) { const t = sgi / 40, c = curve.getPointAt(t), sc = (t < 0.08 ? 1.15 : 1) * (1 + 0.35 * Math.max(0, (t - 0.9) / 0.1)) * (0.9 + 0.1 * Math.sin(t * 3)); for (let r = 0; r <= 10; r++) { const k = sgi * 11 + r; H.setXYZ(k, c.x + (H.getX(k) - c.x) * sc * 0.85, c.y + (H.getY(k) - c.y), c.z + (H.getZ(k) - c.z) * sc * 1.2); } }
  handle.computeVertexNormals();
  return { head, handle };
})();
const handleTex = () => { const t = canvasTex("b_hickory", 64, 512, (c, w, h) => { c.fillStyle = "#C9A878"; c.fillRect(0, 0, w, h); for (let i = 0; i < 120; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "120,86,50" : "235,215,180"},${0.1 + rnd(i + 1) * 0.15})`; c.fillRect(rnd(i + 2) * w, 0, 1 + rnd(i + 3) * 2, h); } const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(60,40,20,0.35)"); g.addColorStop(0.4, "rgba(60,40,20,0)"); g.addColorStop(1, "rgba(60,40,20,0.25)"); c.fillStyle = g; c.fillRect(0, 0, w, h); }); return t; };
const AXE_PHI = 0.62;
export const ChoppingBlock = ({ position, ry = 0 }) => {
  const g = axeGeos();
  const mats = useMemo(() => {
    const bark = barkTex(); bark.repeat.set(3, 1);
    return {
      bark: new THREE.MeshStandardMaterial({ map: bark, roughness: 0.95 }),
      top: new THREE.MeshStandardMaterial({ map: blockTopTex(), roughness: 0.85 }),
      steel: new THREE.MeshStandardMaterial({ color: "#3A3E44", roughness: 0.42, metalness: 0.85 }),
      bit: new THREE.MeshStandardMaterial({ color: "#B9C0C8", roughness: 0.22, metalness: 1 }),
      handle: new THREE.MeshStandardMaterial({ map: handleTex(), roughness: 0.55 })
    };
  }, []);
  const H = 0.46, R = 0.25;
  return (
    <group position={position} rotation-y={ry}>
      <mesh position={[0, H / 2, 0]} material={[mats.bark, mats.top, mats.bark]} castShadow receiveShadow><cylinderGeometry args={[R, R * 1.06, H, 28]} /></mesh>
      {/* the axe: its bit sunk ~4 cm into the top (the edge runs parallel to the handle, so the toe bites deeper), the handle up at 35° */}
      <group position={[-0.17 * Math.sin(AXE_PHI), H - 0.04 + 0.17 * Math.cos(AXE_PHI), 0]} rotation-z={AXE_PHI - Math.PI / 2}>
        <mesh geometry={g.head} material={mats.steel} castShadow />
        <mesh geometry={g.handle} material={mats.handle} castShadow />
      </group>
    </group>
  );
};
/** wood chips and bark bits strewn on the snow round a point (an instanced cloud of small slivers) */
export const Chips = ({ center, n = 220, radius = 1.4, seed = 3 }) => {
  const im = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    const m = new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.85 });
    const mesh = new THREE.InstancedMesh(g, m, n);
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), C = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const a = rnd(i * 3 + seed) * Math.PI * 2, r = Math.pow(rnd(i * 5 + seed), 0.8) * radius, bark = rnd(i * 7 + seed) < 0.12;
      const L = 0.03 + rnd(i * 11) * 0.07, W = 0.015 + rnd(i * 13) * 0.03, T = 0.004 + rnd(i * 17) * 0.005;
      Q.setFromEuler(E.set((rnd(i * 19) - 0.5) * 0.3, rnd(i * 23) * 6.28, (rnd(i * 29) - 0.5) * 0.3));
      M.compose(new THREE.Vector3(center[0] + Math.cos(a) * r, center[1] + T / 2 + 0.003, center[2] + Math.sin(a) * r), Q, new THREE.Vector3(L, T, W));
      mesh.setMatrixAt(i, M);
      if (bark) C.set("#5A4A3C"); else C.setHSL(0.09 + rnd(i) * 0.025, 0.42, 0.62 + rnd(i * 31) * 0.14);
      mesh.setColorAt(i, C);
    }
    mesh.castShadow = false; mesh.receiveShadow = true; mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true;
    return mesh;
  }, []);
  return <primitive object={im} />;
};
