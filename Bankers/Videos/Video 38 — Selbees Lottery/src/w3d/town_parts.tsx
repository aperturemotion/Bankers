// @ts-nocheck
// ★ V38 rev 2 (builder A) — THE TOWN KIT: one detailed small-Michigan-town building kit (Evart, MI main street) shared by every
//   scene where the town appears: the hook street, the flight to the corner store, the end street and the family home.
//   Timur, 2026-11-26: "make the houses of the town a lot more detailed in all of the scenes … do them also the same exact".
//
//   HOW IT IS BUILT (SwiftShader budget): everything repeated is MERGED — a `Mesher` collects boxes / quads / cylinders into one
//   BufferGeometry per material (vertex colours tint the shared textures), so a whole street is ~14 draw calls whatever its
//   detail. Print and glazing are canvas ATLASES (windows + doors, shop interiors, signs, awnings, goods) drawn once with the
//   house fonts; brick, siding, shingles and concrete carry a bump map. Small lamp glows are one THREE.Points cloud.
//
//   addBuilding(m, spec)  a 2–3-storey commercial front: brick or clapboard, storefront (bulkhead, display glass onto a painted
//                         interior, transom, recessed door, sign band with a real shop name, gooseneck lamps, awning), upper
//                         windows (frames, sills, lintels/hoods, meeting rails, lit rooms with curtains/blinds or dark glass),
//                         pilasters, belt course, bracketed/corbelled cornice with dentils, parapet, roof (chimney, AC, vents),
//                         downpipe, window AC units, flower boxes. Its frame: facade on z = 0 facing +z, x across, y up.
//   addProps(m, list)     street furniture: bench, planter, hydrant, trash can, news box, parking meter, mailbox, street sign,
//                         barber pole.
//   addGoods(m, list)     convenience-store goods: cereal/cracker boxes, chip bags, cans, bottles, candy bars, scratch tickets,
//                         each with printed labels from the GOODS atlas.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { BODY, FIGURE } from "./fonts3d";

export const SERIF = 'Georgia, "Times New Roman", "DejaVu Serif", serif';
const F = (wt, px, fam = BODY) => `${wt} ${px}px ${fam}`;
const pick = (arr, r) => arr[Math.floor(r * arr.length) % arr.length];

// ── geometry primitives (shared, unit-sized; the Mesher scales them) ─────────────────────────────────────────────────────────
const G = {};
const gBox = () => G.box ??= new THREE.BoxGeometry(1, 1, 1);
const gQuad = () => G.quad ??= new THREE.PlaneGeometry(1, 1);
const gCyl = (rt = 1, rb = 1, seg = 12, open = false) => G[`c${rt}_${rb}_${seg}_${open}`] ??= new THREE.CylinderGeometry(rt, rb, 1, seg, 1, open);
const gSph = (seg = 10) => G["s" + seg] ??= new THREE.SphereGeometry(1, seg, Math.max(6, Math.round(seg * 0.7)));
const gIco = () => G.ico ??= new THREE.IcosahedronGeometry(1, 1);
const _P = new THREE.Vector3(), _S = new THREE.Vector3(), _Q = new THREE.Quaternion(), _E = new THREE.Euler(), _C = new THREE.Color();
export const Lm = (p, s = [1, 1, 1], r = [0, 0, 0]) => new THREE.Matrix4().compose(_P.set(p[0], p[1], p[2]), _Q.setFromEuler(_E.set(r[0], r[1], r[2])), _S.set(s[0], s[1], s[2]));

// ── the Mesher: collects transformed primitives into one geometry per material ──────────────────────────────────────────
export class Mesher {
  constructor() { this.b = {}; this.M = new THREE.Matrix4(); this.st = []; this.pts = []; }
  pushR(p, r = [0, 0, 0]) { this.st.push(this.M); this.M = this.M.clone().multiply(Lm(p, [1, 1, 1], r)); return this; }
  push(p, ry = 0) { this.st.push(this.M); this.M = this.M.clone().multiply(Lm(p, [1, 1, 1], [0, ry, 0])); return this; }
  pop() { this.M = this.st.pop(); return this; }
  /** a warm lamp glow (one point of the additive cloud), at a local point */
  glow(p, color = "#FFC98A", size = 1) { const v = new THREE.Vector3(p[0], p[1], p[2]).applyMatrix4(this.M); this.pts.push({ p: [v.x, v.y, v.z], c: color, s: size }); }
  /** o.metric: UVs in metres along the face (tiling textures); o.rect: [u0,v0,u1,v1] atlas cell; o.rectFn(vertexIndex) per vertex */
  add(mat, g, L, color = "#FFFFFF", o = {}) {
    const k = this.b[mat] ??= { p: [], n: [], u: [], c: [], i: [] };
    const base = k.p.length / 3;
    const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv;
    const W = this.M.clone().multiply(L);
    const nW = new THREE.Matrix3().getNormalMatrix(W), nL = new THREE.Matrix3().getNormalMatrix(L);
    _C.set(color); const cr = _C.r, cg = _C.g, cb = _C.b;
    const v = new THREE.Vector3(), lv = new THREE.Vector3(), n = new THREE.Vector3(), ln = new THREE.Vector3();
    const uo = o.uo ?? [0, 0];
    for (let j = 0; j < P.count; j++) {
      v.fromBufferAttribute(P, j); lv.copy(v).applyMatrix4(L); v.applyMatrix4(W);
      n.fromBufferAttribute(N, j); ln.copy(n).applyMatrix3(nL).normalize(); n.applyMatrix3(nW).normalize();
      k.p.push(v.x, v.y, v.z); k.n.push(n.x, n.y, n.z); k.c.push(cr, cg, cb);
      let uu = U ? U.getX(j) : 0, vv = U ? U.getY(j) : 0;
      if (o.metric) {
        const ax = Math.abs(ln.x), ay = Math.abs(ln.y), az = Math.abs(ln.z);
        if (ay > ax && ay > az) { uu = lv.x; vv = lv.z; } else if (ax > az) { uu = -lv.z * Math.sign(ln.x); vv = lv.y; } else { uu = lv.x * (ln.z < 0 ? -1 : 1); vv = lv.y; }
        uu += uo[0]; vv += uo[1];
      } else {
        const r = o.rectFn ? o.rectFn(j) : o.rect;
        if (r) { uu = r[0] + uu * (r[2] - r[0]); vv = r[1] + vv * (r[3] - r[1]); }
      }
      k.u.push(uu, vv);
    }
    if (g.index) for (let j = 0; j < g.index.count; j++) k.i.push(base + g.index.getX(j));
    else for (let j = 0; j < P.count; j++) k.i.push(base + j);
    return this;
  }
  box(mat, p, s, color, o = {}) { return this.add(mat, gBox(), Lm(p, s, o.r ?? [0, o.ry ?? 0, 0]), color, o); }
  quad(mat, p, w, h, color, rect, o = {}) { return this.add(mat, gQuad(), Lm(p, [w, h, 1], o.r ?? [0, o.ry ?? 0, 0]), color, { ...o, rect }); }
  cyl(mat, p, r, h, color, o = {}) { return this.add(mat, gCyl(o.rt ?? 1, o.rb ?? 1, o.seg ?? 12, o.open ?? false), Lm(p, [r, h, r], o.r ?? [0, 0, 0]), color, o); }
  sph(mat, p, s, color, o = {}) { return this.add(mat, gSph(o.seg ?? 10), Lm(p, Array.isArray(s) ? s : [s, s, s], o.r ?? [0, 0, 0]), color, o); }
  ico(mat, p, s, color, o = {}) { return this.add(mat, gIco(), Lm(p, Array.isArray(s) ? s : [s, s, s], o.r ?? [0, 0, 0]), color, o); }
  /** one triangle (local points), e.g. an awning's side cheek */
  tri(mat, a, b, c, color, rect = [0, 0, 1, 1]) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([...a, ...b, ...c], 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute([rect[0], rect[3], rect[2], rect[3], rect[0], rect[1]], 2));
    g.computeVertexNormals();
    this.add(mat, g, new THREE.Matrix4(), color, {});
    const g2 = new THREE.BufferGeometry();   // the back face
    g2.setAttribute("position", new THREE.Float32BufferAttribute([...a, ...c, ...b], 3));
    g2.setAttribute("uv", new THREE.Float32BufferAttribute([rect[0], rect[3], rect[0], rect[1], rect[2], rect[3]], 2));
    g2.computeVertexNormals();
    return this.add(mat, g2, new THREE.Matrix4(), color, {});
  }
  build(mats) {
    const grp = new THREE.Group();
    for (const [name, k] of Object.entries(this.b)) {
      const mat = mats[name]; if (!mat) throw new Error("town: no material " + name);
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(k.p, 3));
      g.setAttribute("normal", new THREE.Float32BufferAttribute(k.n, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(k.u, 2));
      g.setAttribute("color", new THREE.Float32BufferAttribute(k.c, 3));
      g.setIndex(k.i);
      g.computeBoundingSphere();
      const mesh = new THREE.Mesh(g, mat);
      mesh.castShadow = mat.userData.cast !== false; mesh.receiveShadow = mat.userData.recv !== false;
      if (mat.userData.order) mesh.renderOrder = mat.userData.order;
      mesh.frustumCulled = true;
      grp.add(mesh);
    }
    // lamp glows: one Points cloud per size class (camera-facing, additive)
    const bySize = {};
    for (const q of this.pts) (bySize[q.s.toFixed(2)] ??= []).push(q);
    for (const [s, list] of Object.entries(bySize)) {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(list.flatMap((q) => q.p), 3));
      g.setAttribute("color", new THREE.Float32BufferAttribute(list.flatMap((q) => { _C.set(q.c); return [_C.r, _C.g, _C.b]; }), 3));
      const pm = new THREE.PointsMaterial({ size: parseFloat(s), map: glowTex(), vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true, fog: false });
      const pts = new THREE.Points(g, pm); pts.renderOrder = 5; grp.add(pts);
    }
    return grp;
  }
}
/** <Town build={(m) => …} />: builds once, renders the merged group */
export const Town = ({ build, deps = [] }) => {
  const grp = useMemo(() => { const m = new Mesher(); build(m); return m.build(townMats()); }, deps);
  return <primitive object={grp} />;
};

// ── textures ────────────────────────────────────────────────────────────────────────────────────────────────────────────
const glowTex = () => canvasTex("tp_glow", 128, 128, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.15, "rgba(255,255,255,0.6)"); g.addColorStop(0.45, "rgba(255,255,255,0.14)"); g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
const poolTex = () => canvasTex("tp_pool", 256, 256, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.3, "rgba(255,255,255,0.5)"); g.addColorStop(0.65, "rgba(255,255,255,0.12)"); g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
// BRICK: US modular courses (10 bricks across, 30 courses over a 2 m tile), mortar joints, per-brick tone, a bump map
const BRICK_HUES = [
  { h: [8, 18], s: [42, 56], l: [30, 40], mortar: "#9C968E" },     // red
  { h: [16, 28], s: [26, 36], l: [22, 30], mortar: "#8E8880" },    // dark brown
  { h: [34, 42], s: [30, 40], l: [56, 66], mortar: "#C9C2B4" },    // buff / cream
  { h: [210, 216], s: [14, 18], l: [52, 60], mortar: "#7E8896" }   // painted (blue-grey)
];
const brickDraw = (v, bump) => (c, w, h) => {
  const H = BRICK_HUES[v], rows = 30, cols = 10, bh = h / rows, bw = w / cols, j = 4;
  c.fillStyle = bump ? "#000" : H.mortar; c.fillRect(0, 0, w, h);
  if (!bump) for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(0,0,0,${rnd(i + v * 7) * 0.08})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  for (let r = 0; r < rows; r++) for (let k = -1; k <= cols; k++) {
    const x = k * bw + (r % 2) * bw / 2, y = r * bh, i = r * 53 + k * 7 + v * 1000;
    if (bump) { const g = 175 + rnd(i) * 50; c.fillStyle = `rgb(${g},${g},${g})`; c.fillRect(x + j / 2, y + j / 2, bw - j, bh - j); continue; }
    const hh = H.h[0] + rnd(i) * (H.h[1] - H.h[0]), ss = H.s[0] + rnd(i + 1) * (H.s[1] - H.s[0]);
    let ll = H.l[0] + rnd(i + 2) * (H.l[1] - H.l[0]); if (rnd(i + 3) < 0.06) ll -= 7;
    c.fillStyle = `hsl(${hh},${ss}%,${ll}%)`; c.fillRect(x + j / 2, y + j / 2, bw - j, bh - j);
    const g = c.createLinearGradient(0, y, 0, y + bh); g.addColorStop(0, "rgba(255,255,255,0.10)"); g.addColorStop(0.5, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(0,0,0,0.14)");
    c.fillStyle = g; c.fillRect(x + j / 2, y + j / 2, bw - j, bh - j);
    for (let q = 0; q < 14; q++) { c.fillStyle = `rgba(${rnd(i + q) < 0.5 ? "0,0,0" : "255,255,255"},${0.05 + rnd(i + q + 9) * 0.07})`; c.fillRect(x + j / 2 + rnd(i + q * 3) * (bw - j - 3), y + j / 2 + rnd(i + q * 5) * (bh - j - 3), 3, 2); }
  }
};
// LAP SIDING: 0.1 m exposure boards (20 over a 2 m tile), each a shadowed lip, faint grain
const sidingDraw = (bump) => (c, w, h) => {
  const n = 20, bh = h / n;
  for (let r = 0; r < n; r++) {
    const y = r * bh, g = c.createLinearGradient(0, y, 0, y + bh);
    if (bump) { g.addColorStop(0, "#303030"); g.addColorStop(0.9, "#E8E8E8"); g.addColorStop(1, "#FFFFFF"); }
    else { g.addColorStop(0, "#D9D9D9"); g.addColorStop(0.15, "#F2F2F2"); g.addColorStop(0.92, "#FBFBFB"); g.addColorStop(1, "#FFFFFF"); }
    c.fillStyle = g; c.fillRect(0, y, w, bh);
    c.fillStyle = bump ? "#000" : "rgba(30,36,46,0.55)"; c.fillRect(0, y + bh - 3, w, 3);
    if (!bump) for (let q = 0; q < 26; q++) { c.fillStyle = `rgba(0,0,0,${0.025 + rnd(r * 40 + q) * 0.03})`; c.fillRect(rnd(r * 40 + q + 1) * w, y + 4 + rnd(r * 40 + q + 2) * (bh - 10), 30 + rnd(q + r) * 90, 1.5); }
    if (!bump && r % 3 === 0) { c.fillStyle = "rgba(0,0,0,0.12)"; c.fillRect(Math.floor(rnd(r + 5) * w), y, 2, bh - 3); }   // a butt joint
  }
};
const shingleDraw = (bump) => (c, w, h) => {
  // 3-tab asphalt shingles: courses of 0.14 m over a 2 m tile, tabs with key slots, granule speckle
  const rows = 14, rh = h / rows, tab = w / 6;
  c.fillStyle = bump ? "#000" : "#20262F"; c.fillRect(0, 0, w, h);
  for (let r = 0; r < rows; r++) for (let k = -1; k <= 6; k++) {
    const x = k * tab + (r % 2) * tab / 2, y = r * rh, i = r * 31 + k;
    if (bump) { c.fillStyle = "#FFF"; c.fillRect(x + 1, y, tab - 2, rh - 4); const g = c.createLinearGradient(0, y, 0, y + rh); g.addColorStop(0, "rgba(0,0,0,0.5)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(x + 2, y, tab - 4, rh - 5); continue; }
    const l = 23 + rnd(i) * 4; c.fillStyle = `hsl(214, 11%, ${l}%)`; c.fillRect(x + 1, y, tab - 2, rh - 4);
    const sg = c.createLinearGradient(0, y + rh - 14, 0, y + rh); sg.addColorStop(0, "rgba(0,0,0,0)"); sg.addColorStop(1, "rgba(0,0,0,0.32)"); c.fillStyle = sg; c.fillRect(x, y + rh - 14, tab, 14);
    for (let q = 0; q < 160; q++) { c.fillStyle = `rgba(${rnd(i + q) < 0.5 ? "0,0,0" : "200,215,235"},${0.08 + rnd(i + q * 2) * 0.14})`; c.fillRect(x + 1 + rnd(i * 3 + q) * (tab - 3), y + rnd(i * 5 + q) * (rh - 5), 2, 2); }
  }
};
const concreteDraw = (bump) => (c, w, h) => {
  // sidewalk: 1.5 m slabs (2 × 2 over a 3 m tile), tooled joints, a broom finish, faint mottling
  c.fillStyle = bump ? "#C8C8C8" : "#8A929E"; c.fillRect(0, 0, w, h);
  if (!bump) for (let i = 0; i < 18000; i++) { const g = rnd(i) * 40 - 20; c.fillStyle = `rgba(${g > 0 ? "255,255,255" : "0,0,0"},${Math.abs(g) / 220})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 3, 2); }
  for (let y = 0; y < h; y += 3) { c.fillStyle = `rgba(0,0,0,${bump ? 0.08 : 0.025})`; c.fillRect(0, y, w, 1); }
  c.fillStyle = bump ? "#000" : "rgba(10,16,26,0.55)";
  for (const p of [0, w / 2]) { c.fillRect(p, 0, 4, h); c.fillRect(0, p, w, 4); }
};
const trimDraw = (c, w, h) => { c.fillStyle = "#F2F2F2"; c.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { c.fillStyle = `rgba(0,0,0,${rnd(i) * 0.05})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); } };
const roofDraw = (c, w, h) => { c.fillStyle = "#2C333D"; c.fillRect(0, 0, w, h); for (let i = 0; i < 16000; i++) { const g = 30 + rnd(i) * 60; c.fillStyle = `rgba(${g},${g + 4},${g + 12},0.5)`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); } };

// ── the WINDOW + DOOR atlas: 8 × 4 cells of 256 × 512 (rows 0–1 lit rooms, row 2 dark glass, row 3 doors) ────────────────────
export const WA = { W: 2048, H: 2048, cw: 256, ch: 512 };
const cellRect = (A, x, y, w, h, ins = 3) => [(x + ins) / A.W, 1 - (y + h - ins) / A.H, (x + w - ins) / A.W, 1 - (y + ins) / A.H];
export const winRect = (col, row) => cellRect(WA, col * WA.cw, row * WA.ch, WA.cw, WA.ch);
const roomBack = (c, x, y, w, h, s) => {
  const pals = [["#FFDCA0", "#E39A4E", "#6E3E1E"], ["#FFE4B4", "#E8A862", "#7A4C2A"], ["#FFD596", "#D88A44", "#683818"], ["#FBDDB0", "#D49A5E", "#6A4428"]];
  const [a, b, d] = pals[s % 4];
  const lx = x + w * (0.25 + rnd(s) * 0.5), ly = y + h * 0.16;
  const g = c.createRadialGradient(lx, ly, 4, lx, ly + h * 0.25, h * 0.85);
  g.addColorStop(0, "#FFF8EC"); g.addColorStop(0.22, a); g.addColorStop(0.68, b); g.addColorStop(1, d);
  c.fillStyle = g; c.fillRect(x, y, w, h);
  c.fillStyle = "rgba(255,250,240,0.9)"; c.beginPath(); c.ellipse(lx, y + h * 0.05, w * 0.12, h * 0.018, 0, 0, 7); c.fill();   // the ceiling fixture
  if (rnd(s + 1) < 0.5) {   // a framed picture
    const fx = x + w * (0.2 + rnd(s + 2) * 0.35), fy = y + h * 0.3, fw = w * 0.32, fh = h * 0.16;
    c.fillStyle = "rgba(60,38,24,0.75)"; c.fillRect(fx, fy, fw, fh); c.fillStyle = "rgba(240,226,200,0.9)"; c.fillRect(fx + 5, fy + 5, fw - 10, fh - 10);
    c.fillStyle = "rgba(90,120,150,0.55)"; c.beginPath(); c.moveTo(fx + 5, fy + fh - 5); c.lineTo(fx + fw * 0.45, fy + fh * 0.4); c.lineTo(fx + fw - 5, fy + fh - 5); c.fill();
  } else {                  // a bookshelf
    const bx = x + w * 0.12, by = y + h * 0.36, bw = w * 0.5, bh = h * 0.34;
    c.fillStyle = "rgba(70,44,28,0.85)"; c.fillRect(bx, by, bw, bh);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 14; k++) { const sw = bw / 15; c.fillStyle = pick(["#8A3E34", "#2E4F7A", "#C9B48A", "#4E6E5E", "#E2D6BE", "#6A4A7A", "#B07A3A"], rnd(s * 50 + r * 14 + k)); c.fillRect(bx + 4 + k * sw, by + 6 + r * bh / 3, sw - 2, bh / 3 - 12 - rnd(k + r) * 8); }
  }
  // a table lamp with its shade and pool
  const tx = x + w * (0.6 + rnd(s + 4) * 0.25), ty = y + h * 0.62;
  const lg = c.createRadialGradient(tx, ty, 2, tx, ty, w * 0.5); lg.addColorStop(0, "rgba(255,246,220,0.9)"); lg.addColorStop(1, "rgba(255,230,180,0)");
  c.fillStyle = lg; c.fillRect(x, y, w, h);
  c.fillStyle = "#FFF3D6"; c.beginPath(); c.moveTo(tx - 22, ty); c.lineTo(tx + 22, ty); c.lineTo(tx + 14, ty - 30); c.lineTo(tx - 14, ty - 30); c.fill();
  c.fillStyle = "rgba(60,40,26,0.85)"; c.fillRect(tx - 3, ty, 6, h * 0.12);
  c.fillStyle = "rgba(64,40,26,0.7)"; c.fillRect(x, y + h * 0.8, w, h * 0.2);   // the sofa back / sideboard
  c.fillStyle = "rgba(255,240,215,0.25)"; c.fillRect(x, y + h * 0.8, w, 4);
};
const curtains = (c, x, y, w, h, col, e, open = 0.28) => {
  for (const side of [0, 1]) {
    const cw = w * open, x0 = side ? x + w - cw : x;
    for (let k = 0; k < 7; k++) {
      const fx = x0 + k * cw / 7, g = c.createLinearGradient(fx, 0, fx + cw / 7, 0);
      g.addColorStop(0, col[0]); g.addColorStop(0.5, col[1]); g.addColorStop(1, col[0]);
      c.fillStyle = g;
      c.beginPath(); c.moveTo(fx, y); c.lineTo(fx + cw / 7 + 1, y);
      const pinch = side ? -1 : 1;   // gathered at a tie-back two-thirds down
      c.lineTo(fx + cw / 7 + 1 - pinch * (cw * 0.35) * (k / 7), y + h * 0.62); c.lineTo(fx + cw / 7 + 1, y + h); c.lineTo(fx, y + h);
      c.lineTo(fx - pinch * (cw * 0.35) * (k / 7), y + h * 0.62); c.closePath(); c.fill();
    }
  }
  c.fillStyle = col[0]; c.fillRect(x, y, w, h * 0.07);                       // the valance
  c.fillStyle = "rgba(0,0,0,0.18)"; c.fillRect(x, y + h * 0.07, w, 3);
  if (e) { c.fillStyle = "rgba(0,0,0,0.35)"; c.fillRect(x, y, w * open, h); c.fillRect(x + w * (1 - open), y, w * open, h); }
};
const blinds = (c, x, y, w, h, col, down, e, lit) => {
  const yb = y + h * down;
  for (let yy = y; yy < yb; yy += 11) {
    const g = c.createLinearGradient(0, yy, 0, yy + 11);
    g.addColorStop(0, col[0]); g.addColorStop(0.7, col[1]); g.addColorStop(1, lit ? "rgba(255,226,170,0.9)" : "rgba(0,0,0,0.45)");
    c.fillStyle = g; c.fillRect(x, yy, w, Math.min(11, yb - yy));
  }
  c.fillStyle = col[1]; c.fillRect(x, yb - 6, w, 6);
  if (e) { c.fillStyle = "rgba(0,0,0,0.4)"; c.fillRect(x, y, w, yb - y); }
};
const shade = (c, x, y, w, h, col, down, e) => {
  const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, col[1]); g.addColorStop(0.5, col[0]); g.addColorStop(1, col[1]);
  c.fillStyle = g; c.fillRect(x, y, w, h * down);
  c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(x, y + h * down - 7, w, 7);
  c.strokeStyle = "rgba(60,50,40,0.8)"; c.lineWidth = 2; c.beginPath(); c.arc(x + w / 2, y + h * down + 9, 6, 0, 7); c.stroke();
  if (e) { c.fillStyle = "rgba(0,0,0,0.35)"; c.fillRect(x, y, w, h * down); }
};
const darkGlass = (c, x, y, w, h, s) => {
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "#5578A6"); g.addColorStop(0.35, "#22385A"); g.addColorStop(1, "#0D1828");
  c.fillStyle = g; c.fillRect(x, y, w, h);
  c.fillStyle = "rgba(190,214,245,0.14)"; c.beginPath(); c.moveTo(x + w * 0.15, y); c.lineTo(x + w * 0.45, y); c.lineTo(x + w * 0.05, y + h); c.lineTo(x - w * 0.25, y + h); c.fill();
  c.fillStyle = "rgba(190,214,245,0.07)"; c.beginPath(); c.moveTo(x + w * 0.6, y); c.lineTo(x + w * 0.7, y); c.lineTo(x + w * 0.35, y + h); c.lineTo(x + w * 0.25, y + h); c.fill();
  if (s % 3 === 1) { c.fillStyle = "rgba(255,196,130,0.18)"; c.beginPath(); c.ellipse(x + w * 0.7, y + h * 0.88, w * 0.3, h * 0.06, 0, 0, 7); c.fill(); }   // a street lamp in the glass
};
const sash = (c, x, y, w, h, frameC, muntins, e) => {
  c.fillStyle = e ? "#000" : frameC;
  const b = 14, rail = 12;
  c.fillRect(x, y, w, b); c.fillRect(x, y + h - b, w, b); c.fillRect(x, y, b, h); c.fillRect(x + w - b, y, b, h);
  c.fillRect(x, y + h / 2 - rail / 2, w, rail);
  if (muntins === 2) { c.fillRect(x + w / 2 - 3, y, 6, h); }
  if (muntins === 6) { for (const fx of [1 / 3, 2 / 3]) c.fillRect(x + w * fx - 2.5, y, 5, h); for (const fy of [0.25, 0.75]) c.fillRect(x, y + h * fy - 2.5, w, 5); }
  if (!e) { c.fillStyle = "rgba(0,0,0,0.35)"; c.fillRect(x + b, y + b, w - 2 * b, 4); c.fillRect(x + b, y + h / 2 + rail / 2, w - 2 * b, 4); c.fillRect(x + b, y + b, 4, h - 2 * b); }
};
const CURT = [["#E9E2D3", "#F8F3EA"], ["#7F96B4", "#A9BBD2"], ["#C9BEA8", "#E2D9C6"], ["#5E7598", "#8197B6"], ["#D8CFC2", "#EEE8DE"], ["#9AA6B8", "#C3CCD8"]];
const FRAMES = ["#ECE8E0", "#2A2F38", "#3B2E26", "#DCE2EA", "#1F3048"];
const drawWinCell = (c, col, row, e) => {
  const x = col * WA.cw, y = row * WA.ch, w = WA.cw, h = WA.ch, s = row * 8 + col;
  if (row === 3) return drawDoorCell(c, x, y, w, h, col, e);
  const fc = FRAMES[s % FRAMES.length], mun = [1, 2, 1, 6, 2, 1, 1, 2][col];
  const lit = row < 2;
  const gx = x + 14, gy = y + 14, gw = w - 28, gh = h - 28;
  if (lit) {
    roomBack(c, gx, gy, gw, gh, s);
    const kind = col, cu = CURT[(s + row) % CURT.length];
    if (kind === 0 || kind === 6) curtains(c, gx, gy, gw, gh, cu, e, 0.26);
    else if (kind === 1) curtains(c, gx, gy, gw, gh, CURT[1], e, 0.34);
    else if (kind === 2) shade(c, gx, gy, gw, gh, ["#F1E4C8", "#D9C7A2"], 0.42 + row * 0.12, e);
    else if (kind === 3) blinds(c, gx, gy, gw, gh, ["#EADBC0", "#C9B48E"], 0.55 + row * 0.3, e, true);
    else if (kind === 4) { c.fillStyle = e ? "rgba(255,240,215,0.35)" : "rgba(255,250,240,0.42)"; for (let k = 0; k < 10; k++) c.fillRect(gx + k * gw / 10, gy, gw / 20, gh); for (let k = 0; k < 4; k++) { c.fillStyle = e ? "#000" : "#2C4448"; c.beginPath(); c.ellipse(gx + gw * (0.2 + k * 0.2), gy + gh - 18, 16, 26, k * 0.4, 0, 7); c.fill(); } }
    else if (kind === 5) { /* an open room */ }
    else if (kind === 7) { c.fillStyle = "rgba(120,170,235,0.35)"; c.fillRect(gx, gy, gw, gh); blinds(c, gx, gy, gw, gh, ["#C8D3E2", "#9FB0C6"], 0.4, e, true); }
    // the glass itself: a faint cool sheen
    if (!e) { c.fillStyle = "rgba(170,200,240,0.08)"; c.beginPath(); c.moveTo(gx + gw * 0.55, gy); c.lineTo(gx + gw * 0.85, gy); c.lineTo(gx + gw * 0.25, gy + gh); c.lineTo(gx - gw * 0.05, gy + gh); c.fill(); }
  } else {
    if (e) { c.fillStyle = "#000"; c.fillRect(x, y, w, h); }
    else {
      darkGlass(c, gx, gy, gw, gh, s);
      if (col === 2) blinds(c, gx, gy, gw, gh, ["#3E4C60", "#58667A"], 0.96, false, false);
      if (col === 3) shade(c, gx, gy, gw, gh, ["#6F7A88", "#56606E"], 0.7, false);
      if (col === 5) curtains(c, gx, gy, gw, gh, ["#2E3A4C", "#3E4C62"], false, 0.5);
      if (col === 6) for (let k = 0; k < 3; k++) { c.fillStyle = "#0B1420"; c.beginPath(); c.ellipse(gx + gw * (0.25 + k * 0.25), gy + gh - 18, 15, 24, k, 0, 7); c.fill(); }
      if (col === 1) curtains(c, gx, gy, gw, gh, ["#3A4658", "#4A5870"], false, 0.22);
    }
  }
  sash(c, x, y, w, h, fc, mun, e);
};
const drawDoorCell = (c, x, y, w, h, col, e) => {
  const shop = col < 4;
  const fc = shop ? ["#1C2530", "#2B3A4E", "#3A2A22", "#1F3554"][col] : ["#1F3554", "#5A2228", "#1A1E24", "#3E5064"][col - 4];
  c.fillStyle = e ? "#000" : fc; c.fillRect(x, y, w, h);
  if (shop) {
    const gx = x + 22, gy = y + 26, gw = w - 44, gh = h * 0.64;
    // the shop seen through the door: shelves, ceiling light, a floor
    const g = c.createLinearGradient(0, gy, 0, gy + gh); g.addColorStop(0, "#FFF1D6"); g.addColorStop(0.5, "#EBC48E"); g.addColorStop(1, "#9C7450");
    c.fillStyle = g; c.fillRect(gx, gy, gw, gh);
    for (let r = 0; r < 4; r++) { c.fillStyle = "rgba(80,56,36,0.55)"; c.fillRect(gx, gy + gh * (0.3 + r * 0.16), gw, 4); for (let k = 0; k < 9; k++) { c.fillStyle = pick(["#2F5F9E", "#E9EEF4", "#B83A3A", "#D8B25A", "#7C93B0", "#26406A"], rnd(col * 90 + r * 9 + k)); c.fillRect(gx + 4 + k * gw / 9, gy + gh * (0.3 + r * 0.16) - 16 - rnd(k + r) * 8, gw / 9 - 4, 16 + rnd(k + r) * 8); } }
    c.fillStyle = "rgba(255,255,245,0.9)"; c.fillRect(gx + gw * 0.2, gy + 6, gw * 0.6, 6);
    if (!e) { c.fillStyle = "rgba(170,200,240,0.10)"; c.beginPath(); c.moveTo(gx + gw * 0.5, gy); c.lineTo(gx + gw * 0.8, gy); c.lineTo(gx + gw * 0.2, gy + gh); c.lineTo(gx - gw * 0.1, gy + gh); c.fill(); }
    // the OPEN card on its cord, the lettering on the glass
    const cx = x + w / 2, cy = gy + gh * 0.36;
    c.strokeStyle = e ? "#000" : "#2A2A2A"; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - 34, cy - 30); c.lineTo(cx, cy - 52); c.lineTo(cx + 34, cy - 30); c.stroke();
    c.fillStyle = e ? "rgba(40,30,20,1)" : "#F7F4EC"; c.beginPath(); c.roundRect(cx - 62, cy - 30, 124, 50, 6); c.fill();
    c.fillStyle = e ? "#000" : "#123E73"; c.font = F(800, 34); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("OPEN", cx, cy - 4);
    c.fillStyle = e ? "#000" : "rgba(250,250,250,0.92)"; c.font = F(700, 17); c.fillText("PLEASE COME IN", cx, gy + gh - 22);
    // push bar, kick plate
    c.fillStyle = e ? "#000" : "#B9C3CF"; c.fillRect(x + 24, gy + gh + 30, w - 48, 12);
    const kg = c.createLinearGradient(0, y + h - 90, 0, y + h); kg.addColorStop(0, "#C9D1DB"); kg.addColorStop(1, "#7D8896");
    c.fillStyle = e ? "#000" : kg; c.fillRect(x + 18, y + h - 88, w - 36, 72);
  } else {
    // a panelled entry door with a small lit lite (the stairs up to the apartments)
    const lx = x + 40, ly = y + 40, lw = w - 80, lh = 120;
    const g = c.createLinearGradient(0, ly, 0, ly + lh); g.addColorStop(0, "#FFF0D2"); g.addColorStop(1, "#D8A86C");
    c.fillStyle = g; c.fillRect(lx, ly, lw, lh);
    c.fillStyle = e ? "#000" : fc; c.fillRect(lx + lw / 3 - 3, ly, 6, lh); c.fillRect(lx + 2 * lw / 3 - 3, ly, 6, lh);
    if (!e) for (const [px, py, pw, ph] of [[40, 200, 76, 130], [w - 116, 200, 76, 130], [40, 352, 76, 120], [w - 116, 352, 76, 120]]) {
      const pg = c.createLinearGradient(x + px, y + py, x + px + pw, y + py + ph); pg.addColorStop(0, "rgba(255,255,255,0.16)"); pg.addColorStop(1, "rgba(0,0,0,0.3)");
      c.fillStyle = pg; c.fillRect(x + px, y + py, pw, ph); c.fillStyle = fc; c.fillRect(x + px + 8, y + py + 8, pw - 16, ph - 16);
    }
    if (!e) { c.fillStyle = "#D8B060"; c.beginPath(); c.arc(x + w - 36, y + 300, 9, 0, 7); c.fill(); c.fillStyle = "#C9A456"; c.fillRect(x + w / 2 - 40, y + 176, 80, 12); }
  }
};
// ── the SHOP-INTERIOR atlas: 2 × 4 cells of 1024 × 768 (what the display windows show) ─────────────────────────────────────
export const SA = { W: 2048, H: 3072, cw: 1024, ch: 768 };
export const SHOPS = ["HARDWARE", "DINER", "PHARMACY", "BARBER", "BAKERY", "BOOKS", "FLOWERS", "OFFICE"];
export const shopRect = (i) => cellRect(SA, (i % 2) * SA.cw, Math.floor(i / 2) * SA.ch, SA.cw, SA.ch, 4);
const shopBase = (c, x, y, w, h, wall, floor) => {
  const g = c.createLinearGradient(0, y, 0, y + h * 0.75); g.addColorStop(0, wall[0]); g.addColorStop(1, wall[1]);
  c.fillStyle = g; c.fillRect(x, y, w, h);
  const fy = y + h * 0.78; c.fillStyle = floor; c.fillRect(x, fy, w, h - (fy - y));
  c.fillStyle = "rgba(0,0,0,0.12)"; for (let k = -10; k < 20; k++) { c.beginPath(); c.moveTo(x + w / 2 + k * 40, fy); c.lineTo(x + w / 2 + k * 120, y + h); c.lineTo(x + w / 2 + k * 120 + 3, y + h); c.lineTo(x + w / 2 + k * 40 + 2, fy); c.fill(); }
  for (let k = 0; k < 5; k++) { c.fillStyle = "rgba(0,0,0,0.08)"; c.fillRect(x, fy + k * k * 7, w, 2); }
};
const fluo = (c, x, y, w, n) => { for (let k = 0; k < n; k++) { const fx = x + (k + 0.5) * w / n; c.fillStyle = "rgba(255,255,250,0.95)"; c.fillRect(fx - 70, y + 14, 140, 10); const g = c.createRadialGradient(fx, y + 18, 4, fx, y + 18, 160); g.addColorStop(0, "rgba(255,250,235,0.5)"); g.addColorStop(1, "rgba(255,250,235,0)"); c.fillStyle = g; c.fillRect(fx - 160, y, 320, 200); } };
const pendants = (c, x, y, w, n) => { for (let k = 0; k < n; k++) { const fx = x + (k + 0.5) * w / n; c.strokeStyle = "rgba(40,30,20,0.8)"; c.lineWidth = 2; c.beginPath(); c.moveTo(fx, y); c.lineTo(fx, y + 90); c.stroke(); c.fillStyle = "#2B3A4E"; c.beginPath(); c.moveTo(fx - 34, y + 128); c.lineTo(fx + 34, y + 128); c.lineTo(fx + 12, y + 90); c.lineTo(fx - 12, y + 90); c.fill(); const g = c.createRadialGradient(fx, y + 140, 2, fx, y + 160, 220); g.addColorStop(0, "rgba(255,236,200,0.85)"); g.addColorStop(1, "rgba(255,220,170,0)"); c.fillStyle = g; c.fillRect(fx - 220, y + 100, 440, 320); } };
const shelfWall = (c, x, y, w, h, rows, cols, seed, pal) => {
  c.fillStyle = "rgba(60,48,40,0.55)"; c.fillRect(x, y, w, h);
  for (let r = 0; r < rows; r++) {
    const ry = y + (r + 1) * h / rows;
    c.fillStyle = "rgba(230,226,218,0.9)"; c.fillRect(x, ry - 8, w, 8);
    for (let k = 0; k < cols; k++) { const pw = w / cols, ph = h / rows * (0.45 + rnd(seed + r * 97 + k) * 0.4); c.fillStyle = pick(pal, rnd(seed + r * 31 + k * 7)); c.fillRect(x + k * pw + 3, ry - 8 - ph, pw - 6, ph); c.fillStyle = "rgba(255,255,255,0.25)"; c.fillRect(x + k * pw + 3, ry - 8 - ph, pw - 6, 4); }
  }
};
const glassLetter = (c, x, y, w, text, sub, e) => {
  c.textAlign = "center"; c.textBaseline = "alphabetic";
  c.font = F(800, 74, SERIF); c.lineWidth = 6; c.strokeStyle = e ? "#000" : "rgba(40,24,10,0.8)"; c.strokeText(text, x + w / 2, y);
  c.fillStyle = e ? "#000" : "#E2BE6A"; c.fillText(text, x + w / 2, y);
  if (sub) { c.font = F(700, 30); c.fillStyle = e ? "#000" : "rgba(250,246,236,0.92)"; c.fillText(sub, x + w / 2, y + 44); }
};
const drawShopCell = (c, i, e) => {
  const x = (i % 2) * SA.cw, y = Math.floor(i / 2) * SA.ch, w = SA.cw, h = SA.ch;
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  const T = SHOPS[i];
  if (T === "HARDWARE") {
    shopBase(c, x, y, w, h, ["#F4E3C4", "#D3B184"], "#6E5C4A"); fluo(c, x, y, w, 3);
    c.fillStyle = "#C9A982"; c.fillRect(x + 60, y + 120, w - 120, 300);                   // pegboard
    c.fillStyle = "rgba(70,50,30,0.35)"; for (let r = 0; r < 14; r++) for (let k = 0; k < 44; k++) c.fillRect(x + 72 + k * 20, y + 130 + r * 20, 4, 4);
    for (let k = 0; k < 16; k++) { const tx = x + 90 + k * 54, ty = y + 150 + (k % 3) * 70; c.fillStyle = k % 2 ? "#5C6B7E" : "#8A3E34"; c.fillRect(tx, ty, 10, 70); c.fillStyle = "#9AA6B4"; c.fillRect(tx - 14, ty, 38, 14); }
    for (let k = 0; k < 9; k++) for (let r = 0; r < 3; r++) { const cx = x + 80 + k * 98, cy = y + 520 + r * -60; c.fillStyle = pick(["#D8DDE4", "#2F5F9E", "#C9A35C", "#E9EEF4"], rnd(k * 3 + r)); c.fillRect(cx, cy, 80, 60); c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(cx, cy, 80, 8); c.fillStyle = "#123E73"; c.font = F(800, 16); c.textAlign = "center"; c.fillText("PAINT", cx + 40, cy + 40); }
    c.fillStyle = "#123E73"; c.fillRect(x + 300, y + 60, 420, 50); c.fillStyle = "#FFF"; c.font = F(800, 34); c.textAlign = "center"; c.fillText("TOOLS · PAINT · KEYS", x + w / 2, y + 98);
    glassLetter(c, x, y + h - 120, w, "HARDWARE", "TOOLS · PAINT · KEYS", e);
  } else if (T === "DINER") {
    shopBase(c, x, y, w, h, ["#F6E6CC", "#D9B88C"], "#3E4A5C");
    c.fillStyle = "#1F3554"; c.fillRect(x + 200, y + 70, 620, 250);                    // the menu board
    c.fillStyle = "#F4ECDA"; c.textAlign = "center"; c.font = F(800, 44); c.fillText("MENU", x + w / 2, y + 125);
    c.font = F(600, 30); ["BREAKFAST ALL DAY", "SOUP · SANDWICHES", "HOMEMADE PIE", "COFFEE · MALTS"].forEach((t, k) => c.fillText(t, x + w / 2, y + 175 + k * 38));
    pendants(c, x, y, w, 4);
    c.fillStyle = "#E9E2D0"; c.fillRect(x, y + 470, w, 40); c.fillStyle = "#8A2F2F"; c.fillRect(x, y + 510, w, 110);   // the counter
    c.fillStyle = "rgba(255,255,255,0.18)"; c.fillRect(x, y + 470, w, 6);
    for (let k = 0; k < 7; k++) { const sx = x + 80 + k * 140; c.fillStyle = "#B9C3CF"; c.fillRect(sx - 4, y + 600, 8, 110); c.fillStyle = "#8A2F2F"; c.beginPath(); c.ellipse(sx, y + 596, 42, 14, 0, 0, 7); c.fill(); }
    c.fillStyle = "rgba(255,255,255,0.7)"; c.fillRect(x + 640, y + 400, 180, 70); for (let k = 0; k < 3; k++) { c.fillStyle = "#D9A35C"; c.beginPath(); c.arc(x + 680 + k * 50, y + 450, 20, Math.PI, 0); c.fill(); }
    glassLetter(c, x, y + h - 150, w, "DINER", "BREAKFAST · LUNCH", e);
  } else if (T === "PHARMACY") {
    shopBase(c, x, y, w, h, ["#F4F2EC", "#D9D6CE"], "#9AA3AE"); fluo(c, x, y, w, 4);
    shelfWall(c, x + 30, y + 200, 420, 360, 5, 12, 300, ["#E9EEF4", "#2F5F9E", "#B83A3A", "#7C93B0", "#F2E2B8", "#4E7FC2", "#FFFFFF"]);
    c.fillStyle = "#F7F7F4"; c.fillRect(x + 520, y + 330, 470, 230); c.fillStyle = "#1F5FB4"; c.fillRect(x + 520, y + 330, 470, 16);
    c.fillStyle = "#123E73"; c.fillRect(x + 560, y + 150, 390, 90); c.fillStyle = "#FFF"; c.font = F(800, 48); c.textAlign = "center"; c.fillText("PRESCRIPTIONS", x + 755, y + 213);
    glassLetter(c, x, y + h - 120, w, "PHARMACY", "PRESCRIPTIONS · GIFTS", e);
  } else if (T === "BARBER") {
    shopBase(c, x, y, w, h, ["#EDE6DA", "#C8BBA6"], "#2C3542"); fluo(c, x, y, w, 2);
    c.fillStyle = "#A9C3E6"; c.fillRect(x + 80, y + 110, 860, 250); c.fillStyle = "rgba(255,255,255,0.35)"; c.fillRect(x + 80, y + 110, 860, 30);   // the mirror
    c.fillStyle = "#3B2E26"; c.fillRect(x + 80, y + 360, 860, 40);
    for (let k = 0; k < 10; k++) { c.fillStyle = pick(["#2F5F9E", "#E9EEF4", "#C9A35C", "#7C93B0"], rnd(k + 70)); c.fillRect(x + 120 + k * 78, y + 320, 26, 40); }
    for (let k = 0; k < 2; k++) { const bx = x + 260 + k * 420; c.fillStyle = "#1A1E24"; c.fillRect(bx - 70, y + 380, 140, 130); c.fillRect(bx - 90, y + 470, 180, 40); c.fillStyle = "#C9D1DB"; c.fillRect(bx - 12, y + 510, 24, 110); c.fillRect(bx - 70, y + 610, 140, 16); c.fillStyle = "rgba(255,255,255,0.2)"; c.fillRect(bx - 70, y + 380, 140, 8); }
    glassLetter(c, x, y + h - 140, w, "BARBER", "HAIRCUTS · SHAVES", e);
  } else if (T === "BAKERY") {
    shopBase(c, x, y, w, h, ["#FBEBD0", "#E2BF8E"], "#7A6450"); pendants(c, x, y, w, 3);
    for (let r = 0; r < 3; r++) { c.fillStyle = "#6E4E34"; c.fillRect(x + 60, y + 170 + r * 90, 900, 10); for (let k = 0; k < 11; k++) { c.fillStyle = pick(["#C98A4A", "#B0703A", "#E2B070", "#9A5E30"], rnd(r * 11 + k)); c.beginPath(); c.ellipse(x + 100 + k * 80, y + 150 + r * 90, 34, 20, 0, 0, 7); c.fill(); } }
    c.fillStyle = "rgba(230,240,250,0.55)"; c.fillRect(x + 80, y + 470, 860, 150); c.fillStyle = "#3B2E26"; c.fillRect(x + 80, y + 620, 860, 60);
    for (let k = 0; k < 8; k++) { c.fillStyle = pick(["#F3E3D3", "#E6B89A", "#FFFFFF", "#D59C5C"], rnd(k + 33)); c.beginPath(); c.ellipse(x + 140 + k * 105, y + 580, 40, 22, 0, 0, 7); c.fill(); c.fillStyle = "rgba(255,255,255,0.4)"; c.fillRect(x + 110 + k * 105, y + 560, 60, 5); }
    glassLetter(c, x, y + h - 150, w, "BAKERY", "FRESH BREAD DAILY", e);
  } else if (T === "BOOKS") {
    shopBase(c, x, y, w, h, ["#F1DFC0", "#C9A57A"], "#5A4636"); pendants(c, x, y, w, 3);
    for (let s = 0; s < 3; s++) { const sx = x + 30 + s * 330; c.fillStyle = "#4A3426"; c.fillRect(sx, y + 90, 300, 520); for (let r = 0; r < 6; r++) { let bx = sx + 10; while (bx < sx + 290) { const bw = 10 + rnd(bx + r * 7) * 14; c.fillStyle = pick(["#8A3E34", "#2E4F7A", "#C9B48A", "#4E6E5E", "#E2D6BE", "#6A4A7A", "#B07A3A", "#1F3554"], rnd(bx * 3 + r)); c.fillRect(bx, y + 100 + r * 85 + rnd(bx) * 14, bw - 2, 70 - rnd(bx) * 14); bx += bw; } } }
    c.fillStyle = "#6E4E34"; c.fillRect(x + 300, y + 560, 420, 30);
    glassLetter(c, x, y + h - 140, w, "BOOKS", "NEW & USED", e);
  } else if (T === "FLOWERS") {
    shopBase(c, x, y, w, h, ["#F3ECE0", "#D4C6B0"], "#6A7280"); fluo(c, x, y, w, 2);
    for (let r = 0; r < 2; r++) { c.fillStyle = "#E9E2D6"; c.fillRect(x + 60, y + 240 + r * 160, 900, 10); for (let k = 0; k < 9; k++) { const vx = x + 100 + k * 100; c.fillStyle = pick(["#A9C3E6", "#E9EEF4", "#7C93B0"], rnd(k + r * 9)); c.fillRect(vx - 18, y + 190 + r * 160, 36, 50); } }
    for (let k = 0; k < 7; k++) { const bx = x + 110 + k * 130; c.fillStyle = "#8A97A8"; c.fillRect(bx - 40, y + 560, 80, 80); for (let q = 0; q < 26; q++) { c.fillStyle = pick(["#E8A0A8", "#F6EEE4", "#F2D27A", "#C46A78", "#B9C9EA"], rnd(k * 26 + q)); c.beginPath(); c.arc(bx - 40 + rnd(q + k) * 80, y + 500 + rnd(q * 3 + k) * 60, 12, 0, 7); c.fill(); } c.fillStyle = "#3E5A4A"; for (let q = 0; q < 6; q++) c.fillRect(bx - 30 + q * 12, y + 540, 3, 30); }
    glassLetter(c, x, y + h - 120, w, "FLOWERS", "GIFTS · CARDS", e);
  } else {
    shopBase(c, x, y, w, h, ["#ECE6DA", "#C9C0B0"], "#4A5466"); fluo(c, x, y, w, 3);
    for (let k = 0; k < 3; k++) { const dx = x + 120 + k * 300; c.fillStyle = "#5A4636"; c.fillRect(dx, y + 450, 220, 20); c.fillRect(dx + 10, y + 470, 16, 120); c.fillRect(dx + 194, y + 470, 16, 120); c.fillStyle = "#1F3554"; c.fillRect(dx + 150, y + 400, 12, 50); c.fillStyle = "#FFF1D6"; c.beginPath(); c.moveTo(dx + 130, y + 400); c.lineTo(dx + 182, y + 400); c.lineTo(dx + 170, y + 372); c.lineTo(dx + 142, y + 372); c.fill(); }
    c.fillStyle = "#7C8796"; c.fillRect(x + 860, y + 260, 120, 340);
    // listing cards in the window
    ["RANCH HOME", "RIVER LOT", "FARMLAND", "STOREFRONT"].forEach((t, k) => { const cx = x + 110 + k * 210, cy = y + 150; c.fillStyle = "#F7F4EC"; c.fillRect(cx, cy, 180, 130); c.fillStyle = "#2E4F7A"; c.fillRect(cx + 12, cy + 12, 156, 64); c.fillStyle = "#A9C3E6"; c.beginPath(); c.moveTo(cx + 40, cy + 76); c.lineTo(cx + 90, cy + 34); c.lineTo(cx + 140, cy + 76); c.fill(); c.fillStyle = "#123E73"; c.font = F(800, 20); c.textAlign = "center"; c.fillText(t, cx + 90, cy + 108); });
    glassLetter(c, x, y + h - 140, w, "INSURANCE", "REAL ESTATE · AUTO · HOME", e);
  }
  if (e) { /* the interior is its own light; glass reflection only in the map */ }
  else { c.fillStyle = "rgba(180,206,240,0.10)"; c.beginPath(); c.moveTo(x + w * 0.5, y); c.lineTo(x + w * 0.72, y); c.lineTo(x + w * 0.3, y + h); c.lineTo(x + w * 0.08, y + h); c.fill(); }
  c.restore();
};
// ── the SIGN atlas: 2 × 12 cells of 1024 × 160 (shop names, transom glass, street sign, the stone panel, the barber pole) ─────
export const NA = { W: 2048, H: 2048, cw: 1024, ch: 160 };
// which painted interior each sign's display windows show
export const SIGN_SHOP = [0, 1, 2, 3, 4, 5, 6, 7, 2, 0, 7, 5, 7, 1, 2, 6];
export const SIGNS = [
  { t: "EVART HARDWARE", s: "TOOLS · PAINT · KEYS", bg: "#0E2C52", fg: "#F2EBDA", f: "fig" },
  { t: "MAIN ST. DINER", s: "BREAKFAST · LUNCH", bg: "#6B2226", fg: "#F6E7C8", f: "serif" },
  { t: "PHARMACY", s: "PRESCRIPTIONS", bg: "#F1ECE0", fg: "#123E73", f: "fig" },
  { t: "BARBER SHOP", bg: "#1E2630", fg: "#D9B25C", f: "serif" },
  { t: "HOMETOWN BAKERY", s: "FRESH DAILY", bg: "#EADBC0", fg: "#3B2A20", f: "serif" },
  { t: "RIVERSIDE BOOKS", s: "NEW & USED", bg: "#1B3A5C", fg: "#E9D49A", f: "serif" },
  { t: "FLOWERS & GIFTS", bg: "#F3EEE6", fg: "#4A2A3A", f: "serif" },
  { t: "INSURANCE · REAL ESTATE", bg: "#0B2547", fg: "#FFFFFF", f: "fig" },
  { t: "VARIETY STORE", bg: "#12407A", fg: "#FFFFFF", f: "anton" },
  { t: "SHOE REPAIR", bg: "#262A30", fg: "#E9E2D0", f: "fig" },
  { t: "TV & RADIO", s: "SALES · SERVICE", bg: "#0E3B73", fg: "#FFFFFF", f: "anton" },
  { t: "ANTIQUES", bg: "#3A2A24", fg: "#D9B25C", f: "serif" },
  { t: "LAUNDROMAT", bg: "#F4F6F8", fg: "#0E3B73", f: "fig" },
  { t: "COFFEE SHOP", s: "BAKED GOODS", bg: "#2B1F1A", fg: "#F1E4CC", f: "serif" },
  { t: "FIVE & DIME", bg: "#7A2A2A", fg: "#FFFFFF", f: "anton" },
  { t: "SEWING & CRAFTS", bg: "#DCE4EE", fg: "#1F3554", f: "fig" }
];
export const NI = { transomLit: 16, transomDark: 17, street: 18, panel: 19, pole: 20, news: 21, open: 22 };
export const signRect = (i) => cellRect(NA, (i % 2) * NA.cw, Math.floor(i / 2) * NA.ch, NA.cw, NA.ch, 3);
const drawSignCell = (c, i, e) => {
  const x = (i % 2) * NA.cw, y = Math.floor(i / 2) * NA.ch, w = NA.cw, h = NA.ch;
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  if (i < SIGNS.length) {
    const S = SIGNS[i];
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, S.bg); g.addColorStop(1, S.bg); c.fillStyle = g; c.fillRect(x, y, w, h);
    c.fillStyle = "rgba(255,255,255,0.06)"; c.fillRect(x, y, w, h * 0.45);
    c.strokeStyle = S.fg; c.globalAlpha = 0.7; c.lineWidth = 4; c.strokeRect(x + 12, y + 12, w - 24, h - 24); c.lineWidth = 1.5; c.strokeRect(x + 22, y + 22, w - 44, h - 44); c.globalAlpha = 1;
    c.fillStyle = S.fg; c.textAlign = "center"; c.textBaseline = "alphabetic";
    const fam = S.f === "serif" ? SERIF : S.f === "anton" ? FIGURE : BODY, wt = S.f === "anton" ? 400 : 800;
    let size = S.s ? 68 : 84; c.font = F(wt, size, fam);
    while (c.measureText(S.t).width > w - 120 && size > 30) { size -= 2; c.font = F(wt, size, fam); }
    c.fillText(S.t, x + w / 2, y + (S.s ? 92 : 108));
    if (S.s) { c.font = F(700, 26); c.fillText(S.s, x + w / 2, y + 132); }
    if (S.f === "serif") { c.fillRect(x + 60, y + h / 2 - 2, 40, 4); c.fillRect(x + w - 100, y + h / 2 - 2, 40, 4); }
  } else if (i === NI.transomLit || i === NI.transomDark) {
    const lit = i === NI.transomLit;
    c.fillStyle = lit ? "#F3D6A4" : "#1A2840"; c.fillRect(x, y, w, h);
    for (let k = 0; k < 64; k++) for (let r = 0; r < 10; r++) { c.fillStyle = lit ? `rgba(255,248,230,${0.2 + rnd(k * 10 + r) * 0.3})` : `rgba(120,150,190,${0.05 + rnd(k * 10 + r) * 0.1})`; c.fillRect(x + k * 16 + 1, y + r * 16 + 1, 14, 14); }
    c.fillStyle = "rgba(30,24,20,0.7)"; for (let k = 0; k <= 8; k++) c.fillRect(x + k * w / 8 - 3, y, 6, h);
  } else if (i === NI.street) {
    c.fillStyle = "#0B3F7A"; c.fillRect(x, y, w, h); c.strokeStyle = "#FFF"; c.lineWidth = 6; c.strokeRect(x + 10, y + 10, w - 20, h - 20);
    c.fillStyle = "#FFF"; c.textAlign = "center"; c.font = F(800, 96); c.fillText("MAIN ST", x + w / 2, y + 116);
  } else if (i === NI.panel) {
    c.fillStyle = "#B9B2A6"; c.fillRect(x, y, w, h);
    c.strokeStyle = "rgba(40,30,20,0.4)"; c.lineWidth = 6; c.strokeRect(x + 16, y + 16, w - 32, h - 32);
    for (const cx of [x + 80, x + w - 80]) { c.fillStyle = "rgba(255,255,255,0.3)"; c.beginPath(); c.arc(cx, y + h / 2, 34, 0, 7); c.fill(); c.strokeStyle = "rgba(40,30,20,0.45)"; c.lineWidth = 4; for (let k = 0; k < 8; k++) { c.beginPath(); c.moveTo(cx, y + h / 2); c.lineTo(cx + 30 * Math.cos(k * 0.785), y + h / 2 + 30 * Math.sin(k * 0.785)); c.stroke(); } }
    c.fillStyle = "rgba(255,255,255,0.18)"; c.fillRect(x + 140, y + 40, w - 280, h - 80); c.strokeStyle = "rgba(40,30,20,0.3)"; c.lineWidth = 3; c.strokeRect(x + 140, y + 40, w - 280, h - 80);
  } else if (i === NI.pole) {
    for (let k = -10; k < 40; k++) { c.fillStyle = ["#F4F4F4", "#B83A3A", "#F4F4F4", "#1F4E8C"][((k % 4) + 4) % 4]; c.beginPath(); c.moveTo(x + k * 40, y); c.lineTo(x + k * 40 + 40, y); c.lineTo(x + k * 40 + 40 + 160, y + h); c.lineTo(x + k * 40 + 160, y + h); c.fill(); }
  } else if (i === NI.news) {
    c.fillStyle = "#1F5FB4"; c.fillRect(x, y, w, h); c.fillStyle = "#FFF"; c.textAlign = "center"; c.font = F(400, 100, FIGURE); c.fillText("DAILY NEWS", x + w / 2, y + 118);
  } else if (i === NI.open) {
    c.fillStyle = "#000"; c.fillRect(x, y, w, h); c.strokeStyle = "#FFB36B"; c.lineWidth = 8; c.beginPath(); c.roundRect(x + 300, y + 16, 424, 128, 60); c.stroke();
    c.fillStyle = "#FFD6A0"; c.textAlign = "center"; c.font = F(800, 92); c.fillText("OPEN", x + w / 2, y + 112);
  } else { c.fillStyle = "#1A2230"; c.fillRect(x, y, w, h); }
  c.restore();
};
// ── awnings: 8 bands of 128 px (stripes run down the slope) ─────────────────────────────────────────────────────────────
export const AWN = [["#0B2F5E", "#E8EEF5"], ["#1F4E8C", "#B9CCE4"], ["#0B2547", "#0B2547"], ["#6E2328", "#6E2328"], ["#4D627E", "#E3E8EE"], ["#1F4E8C", "#1F4E8C"], ["#E3DCCB", "#123E73"], ["#183A5E", "#183A5E"]];
export const awnRect = (i) => [0.002, 1 - (i + 1) * 128 / 1024 + 0.003, 0.998, 1 - i * 128 / 1024 - 0.003];
const awningDraw = (c, w, h) => {
  AWN.forEach(([a, b], i) => {
    const y = i * 128;
    for (let k = 0; k < 16; k++) { c.fillStyle = k % 2 ? b : a; c.fillRect(k * w / 16, y, w / 16 + 1, 128); }
    for (let q = 0; q < 1600; q++) { c.fillStyle = `rgba(${rnd(q + i * 1600) < 0.5 ? "0,0,0" : "255,255,255"},0.05)`; c.fillRect(rnd(q * 3 + i) * w, y + rnd(q * 7 + i) * 128, 2, 1); }
    const g = c.createLinearGradient(0, y, 0, y + 128); g.addColorStop(0, "rgba(255,255,255,0.10)"); g.addColorStop(1, "rgba(0,0,0,0.18)"); c.fillStyle = g; c.fillRect(0, y, w, 128);
  });
};

// ── the materials (built once) ──────────────────────────────────────────────────────────────────────────────────────────
const rep = (t, sx, sy = sx) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / sx, 1 / sy); t.needsUpdate = true; return t; };
const lin = (t) => { t.colorSpace = THREE.NoColorSpace; return t; };
let MATS = null;
export const townMats = () => {
  if (MATS) return MATS;
  const std = (o) => new THREE.MeshStandardMaterial({ vertexColors: true, ...o });
  const brick = (v) => std({ map: rep(canvasTex("tp_brick" + v, 1024, 1024, brickDraw(v, false)), 2), bumpMap: lin(rep(canvasTex("tp_brickB" + v, 1024, 1024, brickDraw(v, true)), 2)), bumpScale: 2.2, roughness: 0.9, metalness: 0 });
  const winMap = canvasTex("tp_win", WA.W, WA.H, (c) => { for (let r = 0; r < 4; r++) for (let k = 0; k < 8; k++) drawWinCell(c, k, r, false); });
  const winE = canvasTex("tp_winE", WA.W, WA.H, (c) => { c.fillStyle = "#000"; c.fillRect(0, 0, WA.W, WA.H); for (let r = 0; r < 4; r++) for (let k = 0; k < 8; k++) drawWinCell(c, k, r, true); });
  const shopMap = canvasTex("tp_shop", SA.W, SA.H, (c) => { for (let i = 0; i < 8; i++) drawShopCell(c, i, false); });
  const shopE = canvasTex("tp_shopE", SA.W, SA.H, (c) => { for (let i = 0; i < 8; i++) drawShopCell(c, i, true); });
  const signMap = canvasTex("tp_sign", NA.W, NA.H, (c) => { for (let i = 0; i < 24; i++) drawSignCell(c, i, false); });
  MATS = {
    brick0: brick(0), brick1: brick(1), brick2: brick(2), brick3: brick(3),
    siding: std({ map: rep(canvasTex("tp_siding", 512, 1024, sidingDraw(false)), 1, 2), bumpMap: lin(rep(canvasTex("tp_sidingB", 512, 1024, sidingDraw(true)), 1, 2)), bumpScale: 2.5, roughness: 0.72 }),
    shingle: std({ map: rep(canvasTex("tp_shingle", 1024, 1024, shingleDraw(false)), 2), bumpMap: lin(rep(canvasTex("tp_shingleB", 1024, 1024, shingleDraw(true)), 2)), bumpScale: 3, roughness: 0.92 }),
    concrete: std({ map: rep(canvasTex("tp_conc", 1024, 1024, concreteDraw(false)), 3), bumpMap: lin(rep(canvasTex("tp_concB", 1024, 1024, concreteDraw(true)), 3)), bumpScale: 1.5, roughness: 0.82 }),
    trim: std({ map: rep(canvasTex("tp_trim", 256, 256, trimDraw), 1), roughness: 0.6, metalness: 0.02 }),
    metal: std({ roughness: 0.38, metalness: 0.6 }),
    roof: std({ map: rep(canvasTex("tp_roof", 512, 512, roofDraw), 4), roughness: 0.95 }),
    win: std({ map: winMap, emissiveMap: winE, emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 0.72, roughness: 0.16, metalness: 0.25, envMapIntensity: 0.9 }),
    shop: std({ map: shopMap, emissiveMap: shopE, emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 0.95, roughness: 0.15, metalness: 0.2, envMapIntensity: 0.8 }),
    sign: std({ map: signMap, emissiveMap: signMap, emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 0.32, roughness: 0.45 }),
    neon: new THREE.MeshBasicMaterial({ map: signMap, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    awning: std({ map: canvasTex("tp_awn", 1024, 1024, awningDraw), roughness: 0.85, side: THREE.DoubleSide }),
    bulb: new THREE.MeshBasicMaterial({ color: "#FFE6BE", vertexColors: true, toneMapped: false }),
    plant: std({ roughness: 0.9, flatShading: true }),
    pool: new THREE.MeshBasicMaterial({ map: poolTex(), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -2 }),
    goods: std({ map: goodsTex(), roughness: 0.42, metalness: 0.05, envMapIntensity: 0.55 })
  };
  MATS.win.userData.cast = false; MATS.shop.userData.cast = false; MATS.neon.userData = { cast: false, recv: false, order: 4 };
  MATS.pool.userData = { cast: false, recv: false, order: 2 }; MATS.bulb.userData.cast = false; MATS.sign.userData.cast = false;
  return MATS;
};

// ── the BUILDING ────────────────────────────────────────────────────────────────────────────────────────────────────────
const STORE_PAINT = ["#1E2B3C", "#24364F", "#3A2A26", "#1F3554", "#E6E2D8", "#2B3A4E", "#4A1F22"];
const CLAP = ["#B9C7D6", "#8DA0B6", "#C8C3B6", "#6E7F93", "#A9B7C8", "#D2D6DA"];
const TRIMS = ["#D6D2C8", "#C9C4BA", "#DCD9D2", "#BDB7AB"];
/** a window: glazing from the atlas, its frame, meeting rail, sill and lintel/hood (+ an AC unit or a flower box) */
const addWindow = (m, x, cy, ww, wh, cell, brick, trimC, stoneC, r, styleHood) => {
  m.quad("win", [x, cy, 0.012], ww, wh, "#FFFFFF", winRect(cell[0], cell[1]));
  if (brick) {
    m.box("trim", [x - ww / 2 - 0.03, cy, 0.035], [0.07, wh + 0.07, 0.07], trimC); m.box("trim", [x + ww / 2 + 0.03, cy, 0.035], [0.07, wh + 0.07, 0.07], trimC);
    m.box("trim", [x, cy + wh / 2 + 0.03, 0.035], [ww + 0.13, 0.07, 0.07], trimC);
    m.box("trim", [x, cy - wh / 2 - 0.07, 0.08], [ww + 0.26, 0.09, 0.16], stoneC);   // the stone sill (sloped look: a lip)
    m.box("trim", [x, cy - wh / 2 - 0.12, 0.05], [ww + 0.18, 0.03, 0.1], stoneC);
    if (styleHood) {   // an Italianate hood: frieze, cap, two small brackets
      m.box("trim", [x, cy + wh / 2 + 0.17, 0.05], [ww + 0.26, 0.2, 0.1], trimC);
      m.box("trim", [x, cy + wh / 2 + 0.31, 0.1], [ww + 0.42, 0.09, 0.2], trimC);
      for (const sd of [-1, 1]) m.box("trim", [x + sd * (ww / 2 + 0.15), cy + wh / 2 + 0.13, 0.08], [0.07, 0.24, 0.13], trimC);
    } else {
      m.box("trim", [x, cy + wh / 2 + 0.16, 0.035], [ww + 0.32, 0.22, 0.07], stoneC);                       // a flat stone lintel
      m.box("trim", [x, cy + wh / 2 + 0.16, 0.074], [0.16, 0.24, 0.02], stoneC);                            // its keystone
    }
  } else {
    for (const sd of [-1, 1]) m.box("trim", [x + sd * (ww / 2 + 0.06), cy, 0.03], [0.12, wh + 0.12, 0.06], trimC);
    m.box("trim", [x, cy + wh / 2 + 0.1, 0.03], [ww + 0.24, 0.14, 0.06], trimC); m.box("trim", [x, cy + wh / 2 + 0.2, 0.07], [ww + 0.36, 0.06, 0.14], trimC);
    m.box("trim", [x, cy - wh / 2 - 0.06, 0.06], [ww + 0.3, 0.06, 0.13], trimC);
  }
  m.box("trim", [x, cy, 0.03], [ww, 0.045, 0.04], trimC);   // the meeting rail (in relief)
  if (r < 0.1 && cell[1] !== 2) {   // a window AC unit
    m.box("metal", [x, cy - wh / 2 + 0.2, 0.22], [Math.min(0.66, ww - 0.1), 0.4, 0.48], "#C3CAD4");
    for (let k = 0; k < 4; k++) m.box("metal", [x, cy - wh / 2 + 0.07 + k * 0.08, 0.465], [Math.min(0.6, ww - 0.16), 0.03, 0.01], "#5E6876");
    m.box("metal", [x, cy - wh / 2 - 0.02, 0.32], [Math.min(0.6, ww - 0.16), 0.03, 0.3], "#2A3240");
  } else if (r > 0.9 && brick) {   // a flower box
    m.box("trim", [x, cy - wh / 2 - 0.25, 0.16], [ww + 0.1, 0.2, 0.22], "#3A4658");
    for (let k = 0; k < 4; k++) m.ico("plant", [x - ww / 2 + 0.12 + k * (ww - 0.04) / 4, cy - wh / 2 - 0.12, 0.17], [0.15, 0.12, 0.12], pick(["#2C4A48", "#3B5A50", "#284040"], rnd(k + x)));
  }
};
const gooseneck = (m, x, y, out = 0.55) => {
  m.box("metal", [x, y + 0.02, 0.04], [0.06, 0.08, 0.08], "#1B2433");
  m.cyl("metal", [x, y + 0.25, out * 0.45], 0.016, out * 1.05, "#1B2433", { r: [0.95, 0, 0], seg: 6 });
  m.cyl("metal", [x, y + 0.44, out], 0.15, 0.13, "#1B2433", { rt: 0.25, rb: 1, seg: 14, open: true, r: [0.25, 0, 0] });
  m.sph("bulb", [x, y + 0.4, out + 0.01], 0.055, "#FFE6BE", { seg: 8 });
  m.glow([x, y + 0.38, out + 0.05], "#FFD49A", 0.9);
};
/** spec: { w, h, d, kind:"brick"|"clap", brick:0–3, wall, trim, paint, sign, shop, awn, door:"c"|"s", lit, seed, cornice:0|1|2, roof, cols } */
export const addBuilding = (m, s) => {
  const R = (k) => rnd(s.seed * 37 + k * 11 + 5);
  const brick = s.kind !== "clap";
  const wallMat = brick ? "brick" + (s.brick ?? 0) : "siding";
  const wallC = s.wall ?? (brick ? "#FFFFFF" : pick(CLAP, R(1)));
  const trimC = s.trim ?? pick(TRIMS, R(2)), stoneC = brick ? "#B7B0A3" : trimC;
  const paint = s.paint ?? pick(STORE_PAINT, R(3));
  const w = s.w, h = Math.max(7.4, s.h), d = s.d ?? 6;
  const uo = [R(4) * 3, R(5) * 3];
  const MT = { metric: true, uo };
  const SB0 = 3.3, SB1 = 4.15, ROOF = h - 0.75, SET = 0.32, P = 0.42;
  // ── the body: the upper block full depth, the ground floor set back behind the storefront, parapets, the roof ──
  m.box(wallMat, [0, (SB1 + ROOF) / 2, -d / 2], [w, ROOF - SB1, d], wallC, MT);
  m.box(wallMat, [0, SB1 / 2, -d / 2 - SET / 2], [w, SB1, d - SET], wallC, MT);
  m.box(wallMat, [0, (ROOF + h) / 2, -0.15], [w, h - ROOF, 0.3], wallC, MT);
  for (const sd of [-1, 1]) m.box(wallMat, [sd * (w / 2 - 0.12), (ROOF + h) / 2, -d / 2 - 0.15], [0.24, h - ROOF, d - 0.3], wallC, MT);
  m.box(wallMat, [0, (ROOF + h) / 2, -d + 0.12], [w - 0.48, h - ROOF, 0.24], wallC, MT);
  for (const sd of [-1, 1]) m.box("trim", [sd * (w / 2 - 0.12), h + 0.04, -d / 2], [0.32, 0.08, d], stoneC);
  m.box("trim", [0, h + 0.04, -d + 0.12], [w, 0.08, 0.32], stoneC);
  m.box("roof", [0, ROOF + 0.03, -d / 2], [w - 0.48, 0.06, d - 0.5], "#FFFFFF", { metric: true });
  // ── the storefront ──
  const pierMat = brick ? wallMat : "trim", pierC = brick ? wallC : trimC;
  for (const sd of [-1, 1]) {
    m.box(pierMat, [sd * (w / 2 - P / 2), SB1 / 2, (-SET + 0.06) / 2], [P, SB1, SET + 0.06], pierC, MT);
    m.box("trim", [sd * (w / 2 - P / 2), 0.18, 0.04], [P + 0.04, 0.36, 0.08], stoneC);                     // a stone plinth
    m.box("trim", [sd * (w / 2 - P / 2), SB0 - 0.08, 0.05], [P + 0.06, 0.14, 0.1], stoneC);                 // the pier's capital
  }
  const R0 = -w / 2 + P, R1 = w / 2 - P, RW = R1 - R0;
  const DW = 1.2, door = s.door ?? (R(6) < 0.6 ? "c" : "s");
  const segs = [];   // [kind, a, b]
  if (door === "c") { segs.push(["disp", R0, -DW / 2], ["door", -DW / 2, DW / 2], ["disp", DW / 2, R1]); }
  else { segs.push(["up", R0, R0 + 1.05], ["disp", R0 + 1.05, R1 - DW], ["door", R1 - DW, R1]); }
  const signI = s.sign ?? Math.floor(R(10) * SIGNS.length);
  const shopI = s.shop ?? SIGN_SHOP[signI] ?? Math.floor(R(7) * 8);
  for (const [kind, a, b] of segs) {
    const cx = (a + b) / 2, sw = b - a;
    if (kind === "disp") {
      // bulkhead with raised panels
      m.box("trim", [cx, 0.31, -0.06], [sw, 0.62, 0.16], paint);
      const n = Math.max(1, Math.round(sw / 0.9));
      for (let k = 0; k < n; k++) m.box("trim", [a + (k + 0.5) * sw / n, 0.32, 0.03], [sw / n - 0.16, 0.36, 0.03], paint);
      m.box("trim", [cx, 0.04, 0.0], [sw, 0.08, 0.06], "#2A303A");
      // the display glass (the interior painted behind it) and its frame, mullion
      m.quad("shop", [cx, 1.69, -0.09], sw, 2.14, "#FFFFFF", shopRect(shopI));
      m.box("trim", [cx, 0.64, -0.03], [sw, 0.06, 0.2], paint); m.box("trim", [cx, 2.76, -0.05], [sw, 0.08, 0.14], paint);
      for (const e of [a + 0.035, b - 0.035]) m.box("trim", [e, 1.7, -0.05], [0.07, 2.12, 0.12], paint);
      if (sw > 2.2) m.box("trim", [cx, 1.7, -0.05], [0.06, 2.12, 0.1], paint);
      // a lit shop throws its light on the sidewalk
      m.quad("pool", [cx, 0.02, 1.0], sw * 1.3, 2.2, "#7A5530", null, { r: [-Math.PI / 2, 0, 0] });
    } else if (kind === "door") {
      m.quad("win", [cx, 1.2, -SET + 0.01], sw - 0.16, 2.36, "#FFFFFF", winRect(s.doorCell ?? Math.floor(R(8) * 4), 3));
      for (const e of [a + 0.05, b - 0.05]) m.box("trim", [e, 1.4, -SET / 2], [0.1, 2.8, SET], paint);
      m.box("trim", [cx, 2.48, -SET / 2], [sw, 0.1, SET], paint);
      m.quad("win", [cx, 2.62, -SET + 0.01], sw - 0.2, 0.24, "#FFFFFF", signRect(NI.transomLit));
      m.box("trim", [cx, 0.01, -SET / 2], [sw - 0.1, 0.02, SET], "#7E8794");                      // the vestibule floor
      m.box("trim", [cx, 0.03, 0.12], [sw + 0.1, 0.06, 0.26], stoneC);                             // the threshold step
      m.quad("pool", [cx, 0.02, 0.9], sw * 1.6, 2.0, "#6E4C2C", null, { r: [-Math.PI / 2, 0, 0] });
    } else {
      // the door to the apartments upstairs, with its transom and a brass mail slot
      m.quad("win", [cx, 1.18, -0.04], sw - 0.2, 2.3, "#FFFFFF", winRect(4 + Math.floor(R(9) * 4), 3));
      for (const e of [a + 0.06, b - 0.06]) m.box("trim", [e, 1.4, -0.02], [0.12, 2.8, 0.1], trimC);
      m.box("trim", [cx, 2.42, -0.02], [sw, 0.1, 0.12], trimC);
      m.quad("win", [cx, 2.62, -0.05], sw - 0.22, 0.26, "#FFFFFF", signRect(NI.transomDark));
      m.box("trim", [cx, 0.05, 0.1], [sw, 0.1, 0.24], stoneC);
      m.box("metal", [cx, 2.3, 0.2], [0.18, 0.2, 0.14], "#1B2433"); m.sph("bulb", [cx, 2.18, 0.24], 0.06, "#FFE6BE", { seg: 8 }); m.glow([cx, 2.18, 0.3], "#FFC98A", 0.7);
    }
  }
  // the transom band across the storefront, its bars
  m.quad("win", [(R0 + R1) / 2, 3.02, -0.09], RW, 0.42, "#FFFFFF", signRect(NI.transomLit));
  m.box("trim", [(R0 + R1) / 2, 2.8, -0.04], [RW, 0.06, 0.12], paint); m.box("trim", [(R0 + R1) / 2, 3.25, -0.04], [RW, 0.08, 0.12], paint);
  // the sign band: a frieze board with the shop's name, moldings top and bottom
  m.box("trim", [(R0 + R1) / 2, (SB0 + SB1) / 2, 0.04], [RW, SB1 - SB0, 0.12], paint);
  m.box("trim", [0, SB1 + 0.05, 0.12], [w + 0.12, 0.1, 0.3], trimC); m.box("trim", [0, SB1 + 0.12, 0.16], [w + 0.18, 0.05, 0.36], trimC);
  m.box("trim", [(R0 + R1) / 2, SB0 + 0.03, 0.08], [RW, 0.06, 0.2], trimC);
  m.quad("sign", [(R0 + R1) / 2, (SB0 + SB1) / 2 + 0.01, 0.105], Math.min(RW - 0.3, 5.6), 0.62, "#FFFFFF", signRect(signI));
  // an awning (some) or gooseneck lamps over the sign (others)
  const awn = s.awn ?? (R(11) < 0.55 ? Math.floor(R(12) * AWN.length) : -1);
  if (awn >= 0) {
    const ar = awnRect(awn), aw = RW - 0.1, ox = (R0 + R1) / 2, y0 = SB0 - 0.12, y1 = 2.55, out = 1.35;
    const ang = Math.atan2(y0 - y1, out), len = Math.hypot(y0 - y1, out);
    m.box("awning", [ox, (y0 + y1) / 2, out / 2], [aw, 0.025, len], "#FFFFFF", { r: [ang, 0, 0], rect: ar });
    m.box("awning", [ox, y1 - 0.14, out], [aw, 0.28, 0.02], "#FFFFFF", { rect: ar });
    for (const sd of [-1, 1]) {
      m.tri("awning", [ox + sd * aw / 2, y0, 0], [ox + sd * aw / 2, y1, out], [ox + sd * aw / 2, y1, 0.02], "#FFFFFF", ar);
      m.cyl("metal", [ox + sd * (aw / 2 - 0.05), (y1 + 2.3) / 2, out / 2], 0.015, Math.hypot(out, y1 - 2.3), "#1B2433", { r: [Math.atan2(out, y1 - 2.3), 0, 0], seg: 5 });
    }
    m.box("metal", [ox, y0 + 0.02, 0.03], [aw, 0.06, 0.06], "#1B2433");
  }
  const nL = RW > 4.5 ? 3 : 2;
  for (let k = 0; k < nL; k++) gooseneck(m, R0 + (k + 0.5) * RW / nL, SB1 + 0.18, 0.55);
  // ── the upper floors ──
  m.box("trim", [0, SB1 + 0.25, 0.05], [w + 0.06, 0.14, 0.1], stoneC);   // the belt course
  if (brick) for (const sd of [-1, 1]) m.box(wallMat, [sd * (w / 2 - 0.2), (SB1 + 0.32 + ROOF - 0.35) / 2, 0.04], [0.4, ROOF - 0.35 - SB1 - 0.32, 0.08], wallC, MT);
  else for (const sd of [-1, 1]) m.box("trim", [sd * (w / 2 - 0.08), (SB1 + 0.3 + h) / 2, 0.03], [0.16, h - SB1 - 0.3, 0.06], trimC);
  const U0 = SB1 + 0.32, U1 = h - 1.0;
  const nF = Math.max(1, Math.round((U1 - U0) / 3.0)), fh = (U1 - U0) / nF;
  const cols = s.cols ?? (w > 6.6 ? 4 : 3);
  const ww = brick ? 0.92 : 0.86, wh = Math.min(1.75, fh * 0.6);
  const xa = -w / 2 + 0.95, xb = w / 2 - 0.95, hood = R(13) < 0.5;
  const lit = s.lit ?? 0.55;
  for (let f = 0; f < nF; f++) for (let k = 0; k < cols; k++) {
    const x = cols === 1 ? 0 : xa + (xb - xa) * k / (cols - 1);
    const cy = U0 + f * fh + fh * 0.25 + wh / 2;
    const rr = R(100 + f * 10 + k), on = rr < lit;
    const cell = on ? [Math.floor(R(200 + f * 10 + k) * 8), R(300 + f * 10 + k) < 0.5 ? 0 : 1] : [Math.floor(R(400 + f * 10 + k) * 8), 2];
    addWindow(m, x, cy, ww, wh, cell, brick, trimC, stoneC, R(500 + f * 10 + k), hood);
  }
  // ── the cornice ──
  const cs = s.cornice ?? (brick ? (R(14) < 0.55 ? 0 : 1) : 2);
  if (cs === 0 || cs === 2) {
    const fc = cs === 2 ? trimC : (s.corniceC ?? pick(["#D9D4CA", "#2A3442", "#E9E5DC", "#3B4656"], R(15)));
    m.box("trim", [0, h - 0.72, 0.04], [w, 0.5, 0.08], fc);
    const nb = Math.max(2, Math.round(w / 1.3) + 1);
    for (let k = 0; k < nb; k++) { const bx = -w / 2 + 0.12 + k * (w - 0.24) / (nb - 1); m.box("trim", [bx, h - 0.56, 0.2], [0.14, 0.56, 0.4], fc); m.box("trim", [bx, h - 0.9, 0.1], [0.12, 0.16, 0.2], fc); }
    if (cs === 0) for (let x = -w / 2 + 0.1; x < w / 2 - 0.05; x += 0.16) m.box("trim", [x, h - 0.37, 0.12], [0.07, 0.09, 0.08], fc);
    m.box("trim", [0, h - 0.26, 0.24], [w + 0.3, 0.12, 0.56], fc); m.box("trim", [0, h - 0.17, 0.27], [w + 0.4, 0.06, 0.62], fc);
    m.box("metal", [0, h - 0.12, 0.26], [w + 0.42, 0.03, 0.62], "#3C4656");
  } else {
    m.box(wallMat, [0, h - 0.78, 0.03], [w, 0.2, 0.06], wallC, MT); m.box(wallMat, [0, h - 0.58, 0.06], [w, 0.2, 0.12], wallC, MT);
    for (let x = -w / 2 + 0.25; x < w / 2 - 0.1; x += 0.45) m.box(wallMat, [x, h - 0.38, 0.1], [0.22, 0.2, 0.2], wallC, MT);
    m.box("trim", [0, h + 0.06, 0.06], [w + 0.2, 0.12, 0.44], stoneC);
    if (U1 - (U0 + (nF - 1) * fh + fh * 0.25 + wh) > 0.9) m.quad("sign", [0, h - 1.25, 0.012], Math.min(2.4, w * 0.4), 0.42, "#FFFFFF", signRect(NI.panel));
  }
  // ── the downpipe (hopper, the pipe, an offset to clear the sign band, the shoe) ──
  const px = (R(16) < 0.5 ? -1 : 1) * (w / 2 - 0.12);
  m.box("metal", [px, h - 0.3, 0.33], [0.2, 0.18, 0.16], "#3C4656");
  m.box("metal", [px, (h - 0.35 + SB1 + 0.45) / 2, 0.33], [0.08, h - 0.8 - SB1, 0.08], "#3C4656");
  m.box("metal", [px, SB1 + 0.42, 0.42], [0.08, 0.08, 0.2], "#3C4656");
  m.box("metal", [px, (SB1 + 0.45) / 2, 0.52], [0.08, SB1 + 0.4, 0.08], "#3C4656");
  m.box("metal", [px, 0.08, 0.62], [0.08, 0.08, 0.22], "#3C4656");
  // ── the roof: a chimney, a condenser, vent stacks, a hatch ──
  if (s.roof !== false) {
    const chx = (R(17) - 0.5) * (w - 2), chz = -d * (0.35 + R(18) * 0.4);
    m.box(wallMat, [chx, ROOF + 0.85, chz], [0.62, 1.7, 0.5], wallC, MT); m.box("trim", [chx, ROOF + 1.74, chz], [0.74, 0.1, 0.62], stoneC);
    m.cyl("metal", [chx + 0.12, ROOF + 1.9, chz], 0.07, 0.25, "#4A5262", { seg: 8 });
    const ax = (R(19) - 0.5) * (w - 2.4), az = -d * (0.55 + R(20) * 0.3);
    m.box("metal", [ax, ROOF + 0.45, az], [1.1, 0.8, 0.8], "#A9B3C0"); m.cyl("metal", [ax, ROOF + 0.86, az], 0.32, 0.04, "#2A3240", { seg: 16 });
    for (let k = 0; k < 2; k++) m.cyl("metal", [(R(21 + k) - 0.5) * (w - 1), ROOF + 0.3, -d * (0.2 + R(23 + k) * 0.6)], 0.06, 0.6, "#5E6876", { seg: 8 });
    m.box("metal", [(R(25) - 0.5) * (w - 2), ROOF + 0.2, -d * 0.5], [0.9, 0.3, 0.9], "#5E6876");
  }
};
/** street furniture: list of { type, p:[x,y,z], ry } in the Mesher's frame (y = the sidewalk top) */
export const addProps = (m, list) => {
  for (const q of list) {
    m.push(q.p, q.ry ?? 0);
    const t = q.type;
    if (t === "bench") {
      for (let k = 0; k < 3; k++) m.box("trim", [0, 0.44, -0.12 + k * 0.13], [1.6, 0.04, 0.1], "#6B4A36");
      for (let k = 0; k < 2; k++) m.box("trim", [0, 0.62 + k * 0.14, -0.24], [1.6, 0.1, 0.03], "#6B4A36", { r: [-0.15, 0, 0] });
      for (const sd of [-1, 1]) { m.box("metal", [sd * 0.7, 0.22, -0.02], [0.05, 0.44, 0.42], "#1E2630"); m.box("metal", [sd * 0.7, 0.62, -0.25], [0.05, 0.4, 0.04], "#1E2630"); m.box("metal", [sd * 0.7, 0.58, 0.02], [0.05, 0.04, 0.4], "#1E2630"); }
    } else if (t === "planter") {
      m.box("trim", [0, 0.27, 0], [0.9, 0.54, 0.9], "#8C929C"); m.box("trim", [0, 0.56, 0], [0.98, 0.06, 0.98], "#A3A9B2");
      m.box("roof", [0, 0.58, 0], [0.82, 0.02, 0.82], "#FFFFFF");
      for (let k = 0; k < 5; k++) m.ico("plant", [(rnd(k + q.p[0]) - 0.5) * 0.5, 0.75 + rnd(k + 3) * 0.2, (rnd(k + q.p[2]) - 0.5) * 0.5], [0.26, 0.24, 0.26], pick(["#2C4A48", "#3B5A50", "#284040", "#34524A"], rnd(k)));
    } else if (t === "hydrant") {
      const hc = "#A8873A";
      m.cyl("metal", [0, 0.04, 0], 0.15, 0.08, hc, { seg: 12 }); m.cyl("metal", [0, 0.34, 0], 0.11, 0.56, hc, { seg: 14 });
      m.cyl("metal", [0, 0.66, 0], 0.13, 0.06, hc, { seg: 14 }); m.sph("metal", [0, 0.7, 0], [0.11, 0.09, 0.11], hc, { seg: 12 });
      m.cyl("metal", [0, 0.8, 0], 0.03, 0.06, "#8A6A20", { seg: 6 });
      for (const sd of [-1, 1]) m.cyl("metal", [sd * 0.13, 0.46, 0], 0.045, 0.1, hc, { r: [0, 0, Math.PI / 2], seg: 10 });
      m.cyl("metal", [0, 0.42, 0.13], 0.06, 0.1, hc, { r: [Math.PI / 2, 0, 0], seg: 10 });
    } else if (t === "trash") {
      m.cyl("metal", [0, 0.45, 0], 0.27, 0.9, "#2A3B4E", { seg: 16 }); m.sph("metal", [0, 0.9, 0], [0.29, 0.12, 0.29], "#22303F", { seg: 14 });
      m.box("metal", [0, 0.82, 0.24], [0.26, 0.12, 0.08], "#0E1622");
    } else if (t === "news") {
      m.box("metal", [0, 0.55, 0], [0.5, 0.7, 0.42], "#1F5FB4"); m.box("metal", [0, 0.1, 0], [0.42, 0.2, 0.36], "#1B2433");
      m.quad("sign", [0, 0.82, 0.212], 0.46, 0.08, "#FFFFFF", signRect(NI.news)); m.box("trim", [0, 0.6, 0.212], [0.36, 0.26, 0.01], "#E6EBF2");
    } else if (t === "meter") {
      m.cyl("metal", [0, 0.6, 0], 0.03, 1.2, "#3C4656", { seg: 8 }); m.box("metal", [0, 1.3, 0], [0.18, 0.26, 0.14], "#5E6876"); m.sph("metal", [0, 1.44, 0], [0.09, 0.06, 0.07], "#5E6876", { seg: 10 });
      m.box("trim", [0, 1.34, 0.071], [0.12, 0.08, 0.005], "#DCE6F2");
    } else if (t === "mailbox") {
      m.box("metal", [0, 0.62, 0], [0.5, 0.8, 0.56], "#1F4E8C"); m.cyl("metal", [0, 1.02, 0], 0.25, 0.56, "#1F4E8C", { r: [Math.PI / 2, 0, 0], seg: 16 });
      for (const sd of [-1, 1]) for (const zz of [-1, 1]) m.box("metal", [sd * 0.2, 0.1, zz * 0.22], [0.06, 0.2, 0.06], "#1B2433");
      m.box("metal", [0, 0.94, 0.285], [0.3, 0.05, 0.02], "#C9D3DE");
    } else if (t === "sign") {
      m.cyl("metal", [0, 1.35, 0], 0.035, 2.7, "#8A96A6", { seg: 8 });
      m.box("sign", [0, 2.62, 0], [0.9, 0.18, 0.02], "#FFFFFF", { rect: signRect(NI.street) });
      m.box("sign", [0, 2.42, 0], [0.9, 0.18, 0.02], "#FFFFFF", { rect: signRect(NI.street), ry: Math.PI / 2 });
    } else if (t === "pole") {
      m.cyl("sign", [0, 0, 0], 0.07, 0.7, "#FFFFFF", { seg: 14, rect: signRect(NI.pole), r: [0, 0, 0] });
      m.cyl("metal", [0, 0.4, 0], 0.08, 0.06, "#C9D3DE", { seg: 12 }); m.sph("metal", [0, 0.46, 0], 0.08, "#C9D3DE", { seg: 10 }); m.cyl("metal", [0, -0.38, 0], 0.08, 0.06, "#C9D3DE", { seg: 12 });
      m.box("metal", [0, 0, -0.12], [0.04, 0.04, 0.16], "#C9D3DE");
    }
    m.pop();
  }
};
/** a run of buildings along the frame's x axis (facades on z = 0 facing +z), left to right from x0 */
export const addRow = (m, list) => { for (const b of list) { m.push([b.x, b.y ?? 0, b.z ?? 0], b.ry ?? 0); addBuilding(m, b); m.pop(); } };

// ── GOODS: the convenience-store packaging atlas and the product shapes ──────────────────────────────────────────────────
// rows (y px): boxes 0–384 (8 × 256 × 384) · bags 384–768 · cans 768–896 (256 × 128) · bottles 896–1152 (256 × 256) ·
//   candy 1152–1248 (256 × 96) · scratch tickets 1248–1504 (16 × 128 × 256) · shelf strips 1504–1568 (4 × 512 × 64) · metal 1568–1632
export const GA = { W: 2048, H: 2048 };
const gRect = (x, y, w, h, ins = 2) => cellRect(GA, x, y, w, h, ins);
export const GR = {
  box: (i) => gRect(i * 256, 0, 256, 384), boxSide: (i) => gRect(i * 256 + 4, 4, 18, 376, 0),
  bag: (i) => gRect(i * 256, 384, 256, 384), bagSide: (i) => gRect(i * 256 + 4, 388, 18, 376, 0),
  can: (i) => gRect(i * 256, 768, 256, 128), bottle: (i) => gRect(i * 256, 896, 256, 256), candy: (i) => gRect(i * 256, 1152, 256, 96),
  ticket: (i) => gRect(i * 128, 1248, 128, 256), strip: (i) => gRect(i * 512, 1504, 512, 64, 1), metal: () => gRect(8, 1576, 240, 48)
};
const BOXES = [
  { t: "HONEY", t2: "OATS", bg: "#E9EEF4", fg: "#123E73", acc: "#D8B25A" }, { t: "CORN", t2: "FLAKES", bg: "#1F5FB4", fg: "#FFFFFF", acc: "#F2C14E" },
  { t: "BRAN", t2: "CRUNCH", bg: "#7A4E2E", fg: "#F6E7C8", acc: "#C9A35C" }, { t: "RICE", t2: "PUFFS", bg: "#2F5F9E", fg: "#FFFFFF", acc: "#E9EEF4" },
  { t: "OAT", t2: "RINGS", bg: "#F2E4C0", fg: "#8A2F2F", acc: "#2F5F9E" }, { t: "SALTINE", t2: "CRACKERS", bg: "#B83A3A", fg: "#FFFFFF", acc: "#F4E9D2" },
  { t: "GROUND", t2: "COFFEE", bg: "#26406A", fg: "#F1E4CC", acc: "#C98A4A" }, { t: "LAUNDRY", t2: "SOAP", bg: "#E9EEF4", fg: "#1F5FB4", acc: "#7FB4F2" }
];
const BAGS = [
  { t: "POTATO", t2: "CHIPS", bg: "#F2C14E", fg: "#8A2F2F" }, { t: "PRETZELS", t2: "", bg: "#1F4E8C", fg: "#F4E9D2" }, { t: "CORN", t2: "CHIPS", bg: "#B83A3A", fg: "#FFFFFF" },
  { t: "CHEESE", t2: "PUFFS", bg: "#E58A2E", fg: "#FFFFFF" }, { t: "KETTLE", t2: "CHIPS", bg: "#2B2F36", fg: "#E9D49A" }, { t: "POPCORN", t2: "", bg: "#E9EEF4", fg: "#B83A3A" },
  { t: "TORTILLA", t2: "CHIPS", bg: "#2F5F9E", fg: "#FFFFFF" }, { t: "BBQ", t2: "CHIPS", bg: "#6E2328", fg: "#F2C14E" }
];
const CANS = [["COLA", "#B83A3A", "#FFFFFF"], ["ROOT BEER", "#5A3424", "#F4E9D2"], ["LEMON-LIME", "#E9EEF4", "#2F7A4A"], ["GINGER ALE", "#2E6A4A", "#F2E4C0"], ["TOMATO SOUP", "#B83A3A", "#F4E9D2"], ["GREEN BEANS", "#E9EEF4", "#2F5F9E"], ["SWEET CORN", "#F2C14E", "#1F4E8C"], ["ORANGE", "#E58A2E", "#FFFFFF"]];
const BOTTLES = [["SPRING WATER", "#C9DDF2", "#1F5FB4", "#1F5FB4"], ["COLA", "#2A1812", "#B83A3A", "#B83A3A"], ["ORANGE", "#E58A2E", "#FFFFFF", "#E9EEF4"], ["ICED TEA", "#9A5E30", "#F2E4C0", "#2F5F9E"], ["LEMONADE", "#F2E4A0", "#2F5F9E", "#F2C14E"], ["SPORTS DRINK", "#4D8ED9", "#FFFFFF", "#123E73"], ["SELTZER", "#DCE8F4", "#123E73", "#8FA9C8"], ["MILK", "#F7F7F4", "#1F5FB4", "#1F5FB4"]];
const CANDY = [["CHOCO BAR", "#5A3424", "#F2C14E"], ["PEANUT CHEW", "#E58A2E", "#3B2A20"], ["CARAMEL", "#C98A4A", "#FFFFFF"], ["MINT GUM", "#7FB4F2", "#FFFFFF"], ["TAFFY", "#E8A0A8", "#5A2A3A"], ["TOFFEE", "#8A2F2F", "#F4E9D2"], ["NOUGAT", "#2F5F9E", "#FFFFFF"], ["LICORICE", "#1A1E24", "#E9D49A"]];
const TICKETS = ["LUCKY 7s", "CASH BLAST", "BINGO", "DIAMOND", "GOLD RUSH", "WILD CHERRY", "TRIPLE WIN", "HOT 10", "MONEY BAG", "CROSSWORD", "STAR CASH", "FROSTY", "BLUE BONUS", "JACKPOT", "PAYDAY", "SPIN IT"];
const TCOL = ["#1F5FB4", "#B83A3A", "#2E6A4A", "#6A4A7A", "#C98A4A", "#E58A2E", "#123E73", "#8A2F2F", "#2F5F9E", "#4D8ED9", "#D8B25A", "#5A3424", "#0E3B73", "#26406A", "#7A2A2A", "#3B2A20"];
export const STRIPS = ["SNACKS", "GROCERY", "BEVERAGES", "CANDY · GUM"];
const goodsTex = () => canvasTex("tp_goods", GA.W, GA.H, (c, W, H) => {
  c.fillStyle = "#DDE3EA"; c.fillRect(0, 0, W, H);
  c.textAlign = "center"; c.textBaseline = "alphabetic";
  BOXES.forEach((b, i) => {
    const x = i * 256, y = 0, w = 256, h = 384;
    c.fillStyle = b.bg; c.fillRect(x, y, w, h);
    c.fillStyle = b.acc; c.fillRect(x, y + h - 70, w, 70); c.fillStyle = "rgba(255,255,255,0.18)"; c.fillRect(x, y, w, 10);
    c.fillStyle = b.fg; c.font = F(400, 66, FIGURE); c.fillText(b.t, x + w / 2, y + 96); c.font = F(800, 40); c.fillText(b.t2, x + w / 2, y + 146);
    // the bowl / product picture
    c.fillStyle = "rgba(255,255,255,0.92)"; c.beginPath(); c.ellipse(x + w / 2, y + 236, 86, 52, 0, 0, Math.PI); c.fill();
    for (let q = 0; q < 18; q++) { c.fillStyle = pick(["#E2B070", "#C98A4A", "#F2D59A", "#B0703A"], rnd(i * 18 + q)); c.beginPath(); c.arc(x + w / 2 - 70 + rnd(q * 3 + i) * 140, y + 226 + rnd(q * 5 + i) * 14, 9, 0, 7); c.fill(); }
    c.fillStyle = b.fg; c.font = F(700, 22); c.fillText(i < 5 ? "WHOLE GRAIN" : i === 5 ? "ORIGINAL" : i === 6 ? "MEDIUM ROAST" : "FRESH SCENT", x + w / 2, y + h - 42);
    c.font = F(600, 17); c.fillText(i < 5 ? "FAMILY SIZE" : "NET WT", x + w / 2, y + h - 18);
  });
  BAGS.forEach((b, i) => {
    const x = i * 256, y = 384, w = 256, h = 384;
    const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, b.bg); g.addColorStop(0.5, "#FFFFFF"); g.addColorStop(0.52, b.bg); g.addColorStop(1, b.bg);
    c.fillStyle = b.bg; c.fillRect(x, y, w, h); c.globalAlpha = 0.25; c.fillStyle = g; c.fillRect(x, y, w, h); c.globalAlpha = 1;
    c.fillStyle = "rgba(0,0,0,0.25)"; for (let k = 0; k < 16; k++) { c.fillRect(x + k * 16, y, 8, 22); c.fillRect(x + k * 16 + 8, y + h - 22, 8, 22); }   // the crimps
    c.fillStyle = b.fg; c.font = F(400, 62, FIGURE); c.fillText(b.t, x + w / 2, y + 112); if (b.t2) { c.font = F(800, 42); c.fillText(b.t2, x + w / 2, y + 160); }
    c.fillStyle = "rgba(255,255,255,0.9)"; c.beginPath(); c.ellipse(x + w / 2, y + 250, 84, 60, 0, 0, 7); c.fill();
    for (let q = 0; q < 10; q++) { c.fillStyle = pick(["#E2B070", "#F2D59A", "#C98A4A"], rnd(i * 10 + q + 400)); c.beginPath(); c.ellipse(x + w / 2 - 50 + rnd(q + i * 2) * 100, y + 240 + rnd(q * 7 + i) * 26, 22, 14, rnd(q) * 3, 0, 7); c.fill(); }
    c.fillStyle = b.fg; c.font = F(700, 22); c.fillText("ORIGINAL", x + w / 2, y + 340);
  });
  CANS.forEach(([t, bg, fg], i) => {
    const x = i * 256, y = 768, w = 256, h = 128;
    c.fillStyle = bg; c.fillRect(x, y, w, h); c.fillStyle = "rgba(255,255,255,0.22)"; c.fillRect(x, y + 10, w, 6); c.fillRect(x, y + h - 16, w, 6);
    c.fillStyle = fg; c.font = F(800, t.length > 9 ? 28 : 36); c.fillText(t, x + w / 2, y + 76); c.font = F(600, 16); c.fillText(i < 4 || i === 7 ? "SODA · 12 FL OZ" : "CANNED", x + w / 2, y + 100);
  });
  BOTTLES.forEach(([t, liquid, fg, cap], i) => {
    const x = i * 256, y = 896, w = 256, h = 256;
    const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, liquid); g.addColorStop(0.3, "#FFFFFF"); g.addColorStop(0.36, liquid); g.addColorStop(1, liquid);
    c.fillStyle = liquid; c.fillRect(x, y, w, h); c.globalAlpha = 0.3; c.fillStyle = g; c.fillRect(x, y, w, h); c.globalAlpha = 1;
    c.fillStyle = cap; c.fillRect(x, y, w, 34);                                   // the cap (top of the lathe)
    c.fillStyle = "#F7F7F4"; c.fillRect(x, y + 120, w, 80); c.fillStyle = fg; c.fillRect(x, y + 120, w, 8);
    c.font = F(800, t.length > 9 ? 22 : 28); c.fillText(t, x + w / 2, y + 168); c.font = F(600, 14); c.fillText("20 FL OZ", x + w / 2, y + 190);
  });
  CANDY.forEach(([t, bg, fg], i) => {
    const x = i * 256, y = 1152, w = 256, h = 96;
    c.fillStyle = bg; c.fillRect(x, y, w, h); c.fillStyle = "rgba(255,255,255,0.2)"; c.fillRect(x, y + 6, w, 5);
    c.fillStyle = fg; c.font = F(400, 40, FIGURE); c.fillText(t, x + w / 2, y + 62);
  });
  TICKETS.forEach((t, i) => {
    const x = i * 128, y = 1248, w = 128, h = 256;
    c.fillStyle = TCOL[i]; c.fillRect(x, y, w, h);
    c.fillStyle = "rgba(255,255,255,0.9)"; c.font = F(800, 13); c.fillText("INSTANT", x + w / 2, y + 22);
    c.fillStyle = "#FFFFFF"; c.font = F(400, t.length > 8 ? 20 : 26, FIGURE); c.fillText(t, x + w / 2, y + 60);
    c.fillStyle = "#C9D1DB"; c.fillRect(x + 12, y + 80, w - 24, 110);              // the silver scratch panel
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) { c.fillStyle = "#AEB8C4"; c.beginPath(); c.arc(x + 34 + k * 30, y + 108 + r * 32, 11, 0, 7); c.fill(); }
    c.fillStyle = "rgba(255,255,255,0.9)"; c.font = F(700, 11); c.fillText("MATCH 3 TO WIN", x + w / 2, y + 212); c.fillText("SCRATCH HERE", x + w / 2, y + 230);
    c.fillStyle = "rgba(0,0,0,0.35)"; c.fillRect(x, y + h - 3, w, 3);              // the perforation to the next ticket
  });
  STRIPS.forEach((t, i) => {
    const x = i * 512, y = 1504, w = 512, h = 64;
    c.fillStyle = "#F4F6F8"; c.fillRect(x, y, w, h); c.fillStyle = "#1F5FB4"; c.fillRect(x, y, w, 10);
    c.fillStyle = "#123E73"; c.font = F(800, 28); for (let k = 0; k < 2; k++) c.fillText(t, x + 128 + k * 256, y + 48);
  });
  const mg = c.createLinearGradient(0, 1568, 0, 1632); mg.addColorStop(0, "#E6EBF0"); mg.addColorStop(0.5, "#9AA6B4"); mg.addColorStop(1, "#D3DAE2"); c.fillStyle = mg; c.fillRect(0, 1568, 256, 64);
});
// a bottle's lathe profile (unit height 1, radius 1 at the body)
const bottleGeo = () => G.bottle ??= new THREE.LatheGeometry([[0, 0], [0.92, 0], [1, 0.05], [1, 0.58], [0.85, 0.7], [0.42, 0.82], [0.36, 0.9], [0.38, 0.92], [0.38, 1], [0, 1]].map(([x, y]) => new THREE.Vector2(x, y)), 12);
// a chip bag: a pillow (a box with its faces bulged and its top and bottom crimped flat)
const bagGeo = () => {
  if (G.bag) return G.bag;
  const g = new THREE.BoxGeometry(1, 1, 1, 4, 6, 1); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const f = Math.max(0.08, (1 - Math.pow(2 * x, 2) * 0.55) * (1 - Math.pow(2 * y, 4))); p.setZ(i, z * f); }
  g.computeVertexNormals(); return (G.bag = g);
};
/** goods: list of { type:"box"|"bag"|"can"|"bottle"|"candy"|"ticket", p:[x,y,z] (bottom centre), s:[w,h,d], ry, v } */
export const addGoods = (m, list) => {
  for (const q of list) {
    const [w, h, d] = q.s, p = [q.p[0], q.p[1] + h / 2, q.p[2]], v = q.v ?? 0, r = [0, q.ry ?? 0, 0];
    if (q.type === "box" || q.type === "candy") {
      const front = q.type === "box" ? GR.box(v) : GR.candy(v), side = q.type === "box" ? GR.boxSide(v) : GR.candy(v);
      m.add("goods", gBox(), Lm(p, [w, h, d], r), "#FFFFFF", { rectFn: (j) => (j >= 16 ? front : side) });
    } else if (q.type === "bag") {
      const front = GR.bag(v), side = GR.bagSide(v);
      m.add("goods", bagGeo(), Lm(p, [w, h, d], r), "#FFFFFF", { rectFn: (j) => (j >= 48 ? front : side) });   // faces px 14, nx 14, py 10, ny 10, then pz / nz
    } else if (q.type === "can") {
      const label = GR.can(v), metal = GR.metal(), torso = 13 * 2;
      m.add("goods", gCyl(1, 1, 12), Lm(p, [w / 2, h, w / 2], r), "#FFFFFF", { rectFn: (j) => (j < torso ? label : metal) });
    } else if (q.type === "bottle") {
      m.add("goods", bottleGeo(), Lm([q.p[0], q.p[1], q.p[2]], [w / 2, h, w / 2], r), "#FFFFFF", { rect: GR.bottle(v) });
    } else if (q.type === "ticket") {
      m.add("goods", gBox(), Lm(p, [w, h, d], q.r ?? r), "#FFFFFF", { rect: GR.ticket(v) });
    }
  }
};
