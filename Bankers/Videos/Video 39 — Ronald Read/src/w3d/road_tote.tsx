// @ts-nocheck
// ★ V38 rev 2 — the plastic ticket TOTE (builder D; Timur 2026-11-26: "make the boxes more detailed"). A real storage tote, the kind
//   the Selbees and the MIT group kept their tickets in: tapered walls (narrower at the foot, so they nest), vertical stiffening RIBS,
//   a stacking ledge, moulded HANDHOLDS in both ends, a rolled RIM LIP with its skirt, a SNAP LID (skirt, raised panel, four latch clips
//   in a lighter plastic), a frosted wall through which the ticket bundles inside show as pale shapes, and a written LABEL CARD taped
//   on the end ("CASH WINFALL / ROLL-DOWN WEEK / $2 QUICK PICKS / BOX nn"). Geometry is built once and shared by every tote.
//   Base centre at the origin; length along x (0.42), depth along z (0.44), rim at y ≈ 0.276, lid top at y 0.30 (= the stacking pitch).
import React, { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { canvasTex, rnd } from "./kit";
import { BODY, FIGURE } from "./fonts3d";

const H = 0.262;                                          // wall top (under the rim)
const hxAt = (y) => 0.19 + 0.02 * Math.min(1, Math.max(0, y / H));
const hzAt = (y) => 0.2 + 0.02 * Math.min(1, Math.max(0, y / H));
const R = 0.04;
/** the plan outline: a rounded rectangle sampled with `ns` points per straight side and `nc` per corner (same count every ring) */
const NS = 22, NC = 5;
const outline = (hx, hz, r) => {
  const pts = [];   // [x, z, side(0..3 or -1 corner), t along side 0..1]
  const corners = [[hx - r, hz - r, 0], [-(hx - r), hz - r, Math.PI / 2], [-(hx - r), -(hz - r), Math.PI], [hx - r, -(hz - r), 1.5 * Math.PI]];
  // start on the +x side at its bottom (−z) end, go CCW seen from above (+x → +z → −x → −z)
  const sides = [[[hx, -(hz - r)], [hx, hz - r]], [[hx - r, hz], [-(hx - r), hz]], [[-hx, hz - r], [-hx, -(hz - r)]], [[-(hx - r), -hz], [hx - r, -hz]]];
  for (let s = 0; s < 4; s++) {
    const [a, b] = sides[s];
    for (let i = 0; i < NS; i++) { const t = i / NS; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, s, t]); }
    const [cx, cz, a0] = corners[s];
    for (let i = 0; i < NC; i++) { const a = a0 + (Math.PI / 2) * (i / NC); pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a), -1, 0]); }
  }
  return pts;
};
const N_RING = 4 * (NS + NC);
/** loft rings [{y, d (outward offset), rib (0/1: carries the ribs), hand (0/1: the handhold pocket)}] into a strip; uv u = perimeter, v = y */
const loftTote = (prof) => {
  const pos = [], uv = [], idx = [];
  prof.forEach((p, j) => {
    const base = outline(hxAt(p.y) + p.d, hzAt(p.y) + p.d, R + Math.max(0, p.d));
    base.forEach(([x, z, side, t], i) => {
      let off = 0;
      if (p.rib && side >= 0) {                        // vertical ribs every ~6 cm along each straight side
        const L = side % 2 ? 2 * (hxAt(p.y) - R) : 2 * (hzAt(p.y) - R);
        const s = (t * L) % 0.06; off += 0.0035 * Math.max(0, 1 - Math.abs(s - 0.03) / 0.008);
      }
      if (p.hand && (side === 0 || side === 2) && Math.abs(t - 0.5) < 0.2) off -= 0.014 * Math.min(1, (0.2 - Math.abs(t - 0.5)) / 0.04);
      const nx = side === 0 ? 1 : side === 2 ? -1 : 0, nz = side === 1 ? 1 : side === 3 ? -1 : 0;
      pos.push(x + nx * off, p.y, z + nz * off); uv.push(i / N_RING, p.y / 0.3);
    });
  });
  for (let j = 0; j < prof.length - 1; j++) for (let i = 0; i < N_RING; i++) {
    const a = j * N_RING + i, b = j * N_RING + ((i + 1) % N_RING), c = (j + 1) * N_RING + i, d = (j + 1) * N_RING + ((i + 1) % N_RING);
    idx.push(a, d, b, a, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};
const cap = (y, d, up) => {
  const pts = outline(hxAt(y) + d, hzAt(y) + d, R + Math.max(0, d));
  const s = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ShapeGeometry(s); g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
  if (!up) { g.rotateX(Math.PI); g.translate(0, 2 * y, 0); }
  return g;
};
let _g = null;
export const toteGeometry = () => {
  if (_g) return _g;
  const wallProf = [
    { y: 0.0, d: -0.012 }, { y: 0.012, d: 0 },
    ...[0.03, 0.06, 0.09, 0.12, 0.15, 0.172].map((y) => ({ y, d: 0, rib: 1 })),
    { y: 0.18, d: 0 }, { y: 0.186, d: 0.005 }, { y: 0.196, d: 0.005 }, { y: 0.2, d: 0 },                  // the stacking ledge
    { y: 0.206, d: 0, hand: 1 }, { y: 0.214, d: 0, hand: 1 }, { y: 0.232, d: 0, hand: 1 }, { y: 0.238, d: 0 },   // the handholds
    { y: 0.242, d: 0 }, { y: 0.242, d: 0.022 }, { y: 0.268, d: 0.025 }, { y: 0.276, d: 0.014 },           // rim: underside, skirt, roll
    { y: 0.274, d: -0.006 }, { y: 0.262, d: -0.013 }, { y: 0.03, d: -0.024 }                                // over the top, down the inside
  ];
  const wall = loftTote(wallProf);
  const lidProf = [{ y: 0.25, d: 0.031 }, { y: 0.284, d: 0.033 }, { y: 0.29, d: 0.027 }, { y: 0.291, d: -0.01 }, { y: 0.292, d: -0.03 }, { y: 0.3, d: -0.04 }];
  const lid = loftTote(lidProf);
  const lidTop = cap(0.3, -0.04, true), floor = cap(0.03, -0.024, true), foot = cap(0.0, -0.012, false);
  const merge = (gs) => { return mergeGeometries(gs.map((g) => { const o = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(o.attributes)) if (!["position", "normal", "uv"].includes(k)) o.deleteAttribute(k); if (!o.attributes.uv) o.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(o.attributes.position.count * 2), 2)); return o; })); };
  // four latch clips on the long sides (z), in a lighter plastic
  const clips = [];
  [-1, 1].forEach((s) => [-0.11, 0.11].forEach((x) => { const b = new THREE.BoxGeometry(0.07, 0.042, 0.012); b.translate(x, 0.272, s * (hzAt(0.3) + 0.036)); clips.push(b); const t = new THREE.BoxGeometry(0.07, 0.01, 0.03); t.translate(x, 0.294, s * (hzAt(0.3) + 0.024)); clips.push(t); }));
  _g = { wall: merge([wall, floor, foot]), lid: merge([lid, lidTop]), clips: merge(clips) };
  return _g;
};
export const TOTE_RIM = 0.276, TOTE_LID = 0.3;

const TOTE_COLS = ["#5D84B9", "#4C72A6", "#6A8EC2", "#557BB0"];
/** the frosted wall: the ticket bundles inside show through as pale shapes; the lower band stays clear (no tickets that low) */
const wallTex = () => canvasTex("tote_wall", 1024, 256, (c, w, h) => {
  c.fillStyle = "#C4CCD6"; c.fillRect(0, 0, w, h);
  const V = (y) => (1 - y / 0.3) * h;
  for (let k = 0; k < 64; k++) {
    const x = (k / 64) * w + (rnd(k) - 0.5) * 6, top = V(0.235 + rnd(k + 9) * 0.02), bw = w / 64 - 4;
    const g = c.createLinearGradient(0, top, 0, V(0.04)); g.addColorStop(0, "rgba(255,255,255,0.95)"); g.addColorStop(1, "rgba(235,242,250,0.55)");
    c.fillStyle = g; c.fillRect(x + 2, top, bw, V(0.04) - top);
    c.fillStyle = "rgba(60,90,140,0.35)"; c.fillRect(x + 2, top + 6, bw, 5);           // a blue header band on each slip
  }
  // frosting: a soft vertical sheen and fine grain
  for (let i = 0; i < 5000; i++) { c.fillStyle = `rgba(255,255,255,${rnd(i) * 0.08})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(200,214,232,0.5)"); g.addColorStop(0.3, "rgba(200,214,232,0)"); g.addColorStop(1, "rgba(40,60,90,0.25)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
/** the label card taped to the end: real hand-lettered-style print */
const cardTex = (n) => canvasTex("tote_card_" + n, 768, 432, (c, w, h) => {
  c.fillStyle = "#F3F5F8"; c.fillRect(0, 0, w, h);
  c.strokeStyle = "rgba(77,142,217,0.35)"; c.lineWidth = 2; for (let y = 120; y < h; y += 58) { c.beginPath(); c.moveTo(24, y); c.lineTo(w - 24, y); c.stroke(); }
  c.fillStyle = "rgba(217,58,58,0.45)"; c.fillRect(70, 0, 3, h);
  c.fillStyle = "#0B2547"; c.textAlign = "left";
  c.font = `800 76px ${BODY}`; c.fillText("CASH WINFALL", 92, 92, w - 120);
  c.font = `700 46px ${BODY}`; c.fillText("ROLL-DOWN WEEK", 92, 168);
  c.fillText("$2 QUICK PICKS", 92, 226);
  c.font = `600 34px ${BODY}`; c.fillStyle = "#2A4A73"; c.fillText("CHECKED  ·  SORTED", 92, 282);
  c.font = `400 120px ${FIGURE}`; c.fillStyle = "#0B2547"; c.textAlign = "right"; c.fillText("BOX " + String(n).padStart(2, "0"), w - 36, 400);
  // two strips of clear tape over the corners
  c.fillStyle = "rgba(230,238,248,0.55)"; c.save(); c.translate(20, 20); c.rotate(-0.6); c.fillRect(-60, -20, 150, 40); c.restore();
  c.save(); c.translate(w - 20, h - 20); c.rotate(-0.6); c.fillRect(-90, -20, 150, 40); c.restore();
});
/** materials for one tote (cached by seed + glow-ness; glow and fade are set per frame) */
export const toteMats = (seed, num) => {
  const col = TOTE_COLS[seed % TOTE_COLS.length];
  return {
    wall: new THREE.MeshStandardMaterial({ color: col, map: wallTex(), roughness: 0.36, metalness: 0.03, emissive: "#7FB4F2", emissiveIntensity: 0 }),
    lid: new THREE.MeshStandardMaterial({ color: new THREE.Color(col).lerp(new THREE.Color("#9DBCE4"), 0.35), roughness: 0.32, metalness: 0.03, emissive: "#7FB4F2", emissiveIntensity: 0 }),
    clips: new THREE.MeshStandardMaterial({ color: "#DCE6F2", roughness: 0.45 }),
    card: new THREE.MeshStandardMaterial({ map: cardTex(num ?? 1 + (seed * 7) % 23), roughness: 0.75 })
  };
};
