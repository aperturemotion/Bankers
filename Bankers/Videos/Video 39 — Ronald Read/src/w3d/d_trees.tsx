// @ts-nocheck
// ★ V39 builder D — WINTER TREES for the Brattleboro set (DETAIL39: "no cones/triangles"):
//   · addMaple(m, base, h, seed)   a bare sugar maple: a flared trunk forking at ~1/3 of its height into 3–4 scaffold limbs, each
//                                  branching recursively (apical leader + laterals, a slight bend in every limb) down to fine twigs;
//                                  snow lies along the upper side of every near-horizontal limb, a snow ring round the foot.
//   · addSpruce(m, base, h, seed)  a snowy spruce / balsam fir: a tapering trunk, 12–20 tiers of drooping branches whose tips turn up,
//                                  every branch built from needle fronds (alpha-cut needle-cluster texture: crossed planes for volume,
//                                  side fronds), with snow lying on the upper surface of each frond.
//   All merged through the town kit's Mesher (one geometry per material: bark, needles, snow, snow on fronds); every tree varies
//   by its seed (rnd). <Trees list> builds a whole set of them once.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { Mesher } from "./town_parts";

const G = {};
const gLimb = () => G.limb ??= new THREE.CylinderGeometry(0.74, 1, 1, 5, 1, true);
const gTwig = () => G.twig ??= new THREE.CylinderGeometry(0.6, 1, 1, 3, 1, true);
const gPlane = () => G.plane ??= new THREE.PlaneGeometry(1, 1);
const _Y = new THREE.Vector3(0, 1, 0), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
/** a tapered limb from a to b (bottom radius r) */
const limb = (m, mat, a, b, r, color, twig = false) => {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), len = d.length();
  if (len < 1e-4) return;
  _q.setFromUnitVectors(_Y, d.clone().normalize());
  const L = new THREE.Matrix4().compose(_p.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), _q, _s.set(r, len, r));
  m.add(mat, twig ? gTwig() : gLimb(), L, color);
};

// ── textures ────────────────────────────────────────────────────────────────────────────────────────────────────────────
const barkTex = () => { const t = canvasTex("d_bark", 256, 512, (c, w, h) => {
  c.fillStyle = "#4A4640"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) { const x = rnd(i) * w, wd = 2 + rnd(i + 1) * 6; c.fillStyle = `rgba(20,18,16,${0.35 + rnd(i + 2) * 0.4})`; let y = 0; c.beginPath(); c.moveTo(x, 0); while (y < h) { y += 20 + rnd(i * 9 + y) * 40; c.lineTo(x + (rnd(i * 3 + y) - 0.5) * 8, y); } c.lineWidth = wd; c.strokeStyle = c.fillStyle; c.stroke(); }
  for (let i = 0; i < 3000; i++) { const g = 60 + rnd(i * 7) * 70; c.fillStyle = `rgba(${g},${g - 4},${g - 10},0.25)`; c.fillRect(rnd(i + 3) * w, rnd(i + 5) * h, 2, 3 + rnd(i) * 6); }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
// a fir/spruce frond seen from above: a central twig, side branchlets, dense short needles; two variants (top / bottom half)
const frondTex = () => canvasTex("d_frond", 512, 512, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  const greens = ["#1C332E", "#233D35", "#2B4A3F", "#18302A", "#30503F"];
  for (let v = 0; v < 2; v++) {
    const cy = v * 256 + 128;
    const needle = (x, y, a, l) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); };
    // the outline tapers toward the tip (x = w): branchlets along the stem
    c.lineCap = "round";
    for (let k = 0; k < 15; k++) {
      const x0 = 18 + k * 32 + rnd(v * 50 + k) * 10, span = 110 * (1 - x0 / w) + 22;
      for (const sd of [-1, 1]) {
        const ang = sd * (0.75 + rnd(v * 50 + k + sd) * 0.3), len = span * (0.7 + rnd(k * 3 + sd + v) * 0.3);
        const x1 = x0 + Math.cos(ang) * len * 0.8, y1 = cy + Math.sin(ang) * len;
        c.strokeStyle = "#2A231C"; c.lineWidth = 2; needle(x0, cy, Math.atan2(y1 - cy, x1 - x0), Math.hypot(x1 - x0, y1 - cy));
        for (let n = 0; n < 34; n++) {
          const u = n / 34, px = x0 + (x1 - x0) * u, py = cy + (y1 - cy) * u;
          c.strokeStyle = greens[Math.floor(rnd(v * 999 + k * 37 + n + sd) * greens.length)]; c.lineWidth = 2.2;
          const nl = 9 + rnd(n + k) * 8;
          needle(px, py, Math.atan2(y1 - cy, x1 - x0) + (n % 2 ? 0.9 : -0.9), nl);
        }
      }
    }
    c.strokeStyle = "#3A2E22"; c.lineWidth = 4; needle(0, cy, 0, w - 10);
    for (let n = 0; n < 160; n++) { const x = rnd(n + v * 300) * (w - 20), sd = n % 2 ? 1 : -1; c.strokeStyle = greens[n % greens.length]; c.lineWidth = 2.4; needle(x, cy, sd * (0.7 + rnd(n) * 0.5), 12 + rnd(n + 1) * 10); }
  }
});
// snow lying on a frond: soft patchy white along the stem, thinning toward the edges
const frondSnowTex = () => canvasTex("d_frond_snow", 512, 512, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  for (let v = 0; v < 2; v++) {
    const cy = v * 256 + 128;
    for (let i = 0; i < 70; i++) {
      const x = 10 + rnd(i * 3 + v * 77) * (w - 60), half = 80 * (1 - x / w) + 12;
      const y = cy + (rnd(i * 3 + 1 + v) - 0.5) * half * 1.4, rx = 14 + rnd(i * 3 + 2) * 26, ry = 6 + rnd(i * 5 + v) * 12;
      c.fillStyle = `rgba(248,251,255,${0.85 + rnd(i) * 0.15})`; c.beginPath(); c.ellipse(x, y, rx, ry, (rnd(i + 9) - 0.5) * 0.6, 0, 7); c.fill();
    }
  }
});

let TM = null;
export const treeMats = () => {
  if (TM) return TM;
  const bark = barkTex(); bark.repeat.set(1, 1);
  TM = {
    bark: new THREE.MeshStandardMaterial({ map: bark, color: "#FFFFFF", roughness: 0.95, metalness: 0, vertexColors: true }),
    needle: new THREE.MeshStandardMaterial({ map: frondTex(), alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.88, vertexColors: true, envMapIntensity: 0.4 }),
    fsnow: new THREE.MeshStandardMaterial({ map: frondSnowTex(), alphaTest: 0.45, side: THREE.DoubleSide, color: "#FFFFFF", roughness: 0.8, vertexColors: true, envMapIntensity: 0.6 }),
    tsnow: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.82, vertexColors: true, envMapIntensity: 0.6 })
  };
  return TM;
};

// ── the bare maple ─────────────────────────────────────────────────────────────────────────────────────────────────────────
/** base: [x, y, z] on the ground; h: height (m); seed varies everything. o.bark tints the bark, o.snow = false drops the snow */
export const addMaple = (m, base, h = 10, seed = 1, o = {}) => {
  const barkC = o.bark ?? "#8E8A84", snowC = "#EEF3FA";
  let n = 0;
  const R = (k) => rnd(seed * 97.13 + k * 7.31 + (n++) * 0.917);
  const grow = (p, dir, len, r, depth) => {
    // two sub-segments with a bend
    const bend = new THREE.Vector3(R(1) - 0.5, (R(2) - 0.3) * 0.5, R(3) - 0.5).multiplyScalar(0.35);
    const d1 = dir.clone(), d2 = dir.clone().add(bend).normalize();
    const mid = [p[0] + d1.x * len * 0.5, p[1] + d1.y * len * 0.5, p[2] + d1.z * len * 0.5];
    const end = [mid[0] + d2.x * len * 0.5, mid[1] + d2.y * len * 0.5, mid[2] + d2.z * len * 0.5];
    const twig = r < 0.034;
    limb(m, "bark", p, mid, r, barkC, twig); limb(m, "bark", mid, end, r * 0.86, barkC, twig);
    // snow along the top of the thicker, flatter limbs
    if (o.snow !== false && r > 0.02) for (const [a, b, dd, rr] of [[p, mid, d1, r], [mid, end, d2, r * 0.86]]) {
      const flat = 1 - Math.abs(dd.y);
      if (flat > 0.25) { const lift = rr * 0.78; limb(m, "tsnow", [a[0], a[1] + lift, a[2]], [b[0], b[1] + lift, b[2]], rr * (0.35 + 0.35 * flat), snowC, true); }
    }
    if (depth <= 0 || r < 0.006) {   // a fan of fine twigs at the tip
      for (let k = 0; k < 2; k++) {
        const td = d2.clone().add(new THREE.Vector3(R(4) - 0.5, R(5) * 0.6, R(6) - 0.5)).normalize(), tl = len * (0.35 + R(7) * 0.3);
        limb(m, "bark", end, [end[0] + td.x * tl, end[1] + td.y * tl, end[2] + td.z * tl], Math.min(r, 0.006), barkC, true);
      }
      return;
    }
    // side twigs along the limb (fills the crown with fine growth)
    if (depth <= 1) for (let k = 0; k < 2; k++) {
      const u = 0.3 + R(8) * 0.5, sp = [p[0] + (end[0] - p[0]) * u, p[1] + (end[1] - p[1]) * u, p[2] + (end[2] - p[2]) * u];
      const td = dir.clone().add(new THREE.Vector3(R(9) - 0.5, R(10) * 0.7, R(11) - 0.5).multiplyScalar(1.6)).normalize(), tl = len * (0.3 + R(12) * 0.25);
      limb(m, "bark", sp, [sp[0] + td.x * tl, sp[1] + td.y * tl, sp[2] + td.z * tl], Math.max(0.004, r * 0.3), barkC, true);
    }
    // the leader continues; one or two laterals split off
    const up = new THREE.Vector3(0, 1, 0);
    const lead = d2.clone().add(up.clone().multiplyScalar(0.3)).add(new THREE.Vector3(R(13) - 0.5, 0, R(14) - 0.5).multiplyScalar(0.3)).normalize();
    grow(end, lead, len * (0.74 + R(15) * 0.12), r * 0.72, depth - 1);
    const nl = depth > 3 ? 2 : 1 + (R(16) < 0.42 ? 1 : 0);
    for (let k = 0; k < nl; k++) {
      const yaw = R(17) * Math.PI * 2, tilt = 0.45 + R(18) * 0.4;
      const side = new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));
      const ld = d2.clone().multiplyScalar(Math.cos(tilt)).add(side.multiplyScalar(Math.sin(tilt))).normalize();
      if (ld.y < -0.15) ld.y = -0.15, ld.normalize();
      grow(end, ld, len * (0.52 + R(19) * 0.14), r * 0.58, depth - 1);
    }
  };
  const [bx, by, bz] = base, rt = h * 0.024, trunkH = h * (0.3 + rnd(seed + 3) * 0.08);
  limb(m, "bark", [bx, by - 0.05, bz], [bx, by + 0.45, bz], rt * 1.35, barkC);                        // the root flare
  const lean = new THREE.Vector3((rnd(seed + 5) - 0.5) * 0.08, 1, (rnd(seed + 6) - 0.5) * 0.08).normalize();
  const top = [bx + lean.x * trunkH, by + trunkH, bz + lean.z * trunkH];
  limb(m, "bark", [bx, by + 0.3, bz], top, rt, barkC);
  const nS = 3 + (rnd(seed + 7) < 0.5 ? 1 : 0);
  for (let k = 0; k < nS; k++) {
    const yaw = (k / nS) * Math.PI * 2 + rnd(seed + k) * 0.9, tilt = 0.3 + rnd(seed + k + 11) * 0.26;
    const d = new THREE.Vector3(Math.cos(yaw) * Math.sin(tilt), Math.cos(tilt), Math.sin(yaw) * Math.sin(tilt));
    grow(top, d, h * (0.2 + rnd(seed + k + 13) * 0.05), rt * 0.62, o.depth ?? 5);
  }
  if (o.snow !== false) m.add("tsnow", G.mound ??= new THREE.SphereGeometry(1, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.Matrix4().compose(_p.set(bx, by - 0.02, bz), _q.identity(), _s.set(0.9, 0.12, 0.9)), snowC);
};

// ── the snowy spruce / fir ─────────────────────────────────────────────────────────────────────────────────────────────────
const frond = (m, at, d, len, wid, v, tint, snow) => {
  const X = d.clone().normalize(), Y = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), X).normalize(), Z = new THREE.Vector3().crossVectors(X, Y).normalize();
  const c = new THREE.Vector3(at[0] + X.x * len / 2, at[1] + X.y * len / 2, at[2] + X.z * len / 2);
  const rect = v ? [0, 0.5, 1, 1] : [0, 0, 1, 0.5];
  const B = new THREE.Matrix4().makeBasis(X, Y, Z);
  const put = (mat, basis, w, off = 0) => { const L = basis.clone().scale(new THREE.Vector3(len, w, 1)); L.setPosition(c.x + Z.x * off, c.y + Z.y * off, c.z + Z.z * off); m.add(mat, gPlane(), L, mat === "fsnow" ? "#F2F6FC" : tint, { rect }); };
  put("needle", B, wid);
  put("needle", new THREE.Matrix4().makeBasis(X, Z, Y.clone().negate()), wid * 0.45);          // the crossed plane: volume from the side
  if (snow) put("fsnow", B, wid * 0.92, 0.035);
};
export const addSpruce = (m, base, h = 8, seed = 1, o = {}) => {
  const [bx, by, bz] = base, R0 = h * (0.21 + rnd(seed + 1) * 0.05), y0 = 0.5 + rnd(seed + 2) * 0.3;
  const tints = ["#C9D6D0", "#B9C9C4", "#D4DED8"], tint = tints[Math.floor(rnd(seed + 3) * 3)];
  limb(m, "bark", [bx, by - 0.05, bz], [bx, by + h * 0.97, bz], h * 0.017, "#6E625A");
  const tiers = Math.round((h - y0) / 0.36);
  for (let i = 0; i < tiers; i++) {
    const u = i / tiers, y = by + y0 + u * (h - y0 - 0.25) + (rnd(seed * 7 + i) - 0.5) * 0.08;
    const reach = R0 * Math.pow(1 - u, 0.92) + 0.18;
    const nb = Math.max(4, Math.round(9 - u * 4 + rnd(seed + i * 3) * 2));
    for (let j = 0; j < nb; j++) {
      const yaw = (j / nb) * Math.PI * 2 + i * 0.77 + (rnd(seed + i * 31 + j) - 0.5) * 0.5;
      const L = reach * (0.8 + rnd(seed + i * 17 + j) * 0.3);
      const droop = -(0.18 + (1 - u) * 0.38) + (rnd(seed + i + j * 5) - 0.5) * 0.12;
      const hor = new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));
      const d1 = hor.clone().multiplyScalar(Math.cos(droop)).add(new THREE.Vector3(0, Math.sin(droop), 0)).normalize();
      const up = (1 - u) * 0.18 + 0.04, d2 = hor.clone().multiplyScalar(Math.cos(droop + 0.3 + up)).add(new THREE.Vector3(0, Math.sin(droop * 0.4 + up), 0)).normalize();
      const at = [bx + hor.x * 0.04, y, bz + hor.z * 0.04], L1 = L * 0.56, L2 = L * 0.5;
      const mid = [at[0] + d1.x * L1, at[1] + d1.y * L1, at[2] + d1.z * L1];
      const wid = Math.min(0.9, 0.36 + L * 0.32), v = rnd(seed + i * 13 + j) < 0.5;
      const snow = o.snow !== false && rnd(seed * 3 + i * 7 + j) < 0.82;
      frond(m, at, d1, L1 + 0.05, wid, v, tint, snow);
      frond(m, mid, d2, L2, wid * 0.86, !v, tint, snow);
      for (const sd of [-1, 1]) {   // side fronds from the branch's middle, splayed in its plane
        const sdv = new THREE.Vector3(-hor.z, 0, hor.x).multiplyScalar(sd * 0.75);
        const ds = d1.clone().add(sdv).normalize();
        frond(m, mid, ds, L * 0.42, wid * 0.7, v, tint, snow && rnd(seed + i + j + sd) < 0.7);
      }
    }
  }
  // the leader at the top, a snow cap
  frond(m, [bx, by + h * 0.9, bz], new THREE.Vector3(0.02, 1, 0.01), h * 0.12, 0.3, false, tint, false);
  if (o.snow !== false) m.add("tsnow", G.mound ??= new THREE.SphereGeometry(1, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.Matrix4().compose(_p.set(bx, by - 0.02, bz), _q.identity(), _s.set(R0 * 0.9, 0.16, R0 * 0.9)), "#EEF3FA");
};
/** a set of trees, built once: list of { k: "maple" | "spruce", p: [x, y, z], h, seed } */
export const Trees = ({ list }) => {
  const grp = useMemo(() => {
    const m = new Mesher();
    list.forEach((t, i) => (t.k === "spruce" ? addSpruce : addMaple)(m, t.p, t.h, t.seed ?? i + 1, t));
    return m.build(treeMats());
  }, []);
  return <primitive object={grp} />;
};
