// @ts-nocheck
// (V39 builder B: copied unchanged from V38 fakeshade.tsx, texture keys renamed bfs_* so they never collide with another builder's copy)
// ★ V38 rev 6 (builder P) — FAKE CONTACT SHADOWS for the hook and the store. Timur, 2026-11-27: "if you're not going to add shadows to
//   things … at least add those fake shadows … a dark subtle shape under it, the correct one … you can see the corners better … we don't
//   want unlit objects." Soft dark quads where things meet the ground, a wall or a shelf (the contact / ambient-occlusion dark a real
//   key and sky would leave), placed on the real surfaces and leaning with the key. Cheap: every quad of a kind is merged into ONE mesh
//   (one draw call per texture), alpha per quad in a 4-component vertex colour, depthWrite off, polygon offset, no shadow casting.
//
//   s.floor(kind, [x, y, z], w, d, ry?, k?)    a quad lying on a horizontal surface at height y (w along the yaw's x, d along its z)
//   s.edge([x, y, z], a, o, len, depth, k?)     a gradient strip: dark along the line through p in direction a (length len), fading
//                                                over `depth` in direction o (a wall's foot: o points away from the wall, along the floor)
//   kinds: "blob" (radial, round things), "rect" (soft-edged box footprint), "edge" (linear falloff, used by s.edge)
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex } from "./kit";

const blobTex = () => canvasTex("bfs_blob", 128, 128, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(0.35, "rgba(0,0,0,0.78)"); g.addColorStop(0.7, "rgba(0,0,0,0.25)"); g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
const rectTex = () => canvasTex("bfs_rect", 128, 128, (c, w, h) => {
  // only the blurred shadow of a rect drawn off-canvas: no hard edge anywhere
  c.shadowColor = "rgba(0,0,0,1)"; c.shadowBlur = 16; c.shadowOffsetX = 1000; c.fillStyle = "#000";
  c.fillRect(30 - 1000, 30, w - 60, h - 60);
});
const edgeTex = () => canvasTex("bfs_edge", 8, 128, (c, w, h) => {
  // canvas top = v 1 = the dark edge (textures are flipped on upload)
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(0.18, "rgba(0,0,0,0.62)"); g.addColorStop(0.5, "rgba(0,0,0,0.2)"); g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
const TEX = { blob: blobTex, rect: rectTex, edge: edgeTex };

export class Shade {
  constructor() { this.q = { blob: [], rect: [], edge: [] }; }
  /** a quad from its 4 corners (v = 0 at c0–c1, v = 1 at c3–c2) */
  quad(kind, c0, c1, c2, c3, k) { this.q[kind].push([c0, c1, c2, c3, k]); return this; }
  floor(kind, p, w, d, ry = 0, k = 0.55) {
    const ca = Math.cos(ry), sa = Math.sin(ry);
    const A = [ca * w / 2, 0, -sa * w / 2], B = [sa * d / 2, 0, ca * d / 2];
    const P = (i, j) => [p[0] + i * A[0] + j * B[0], p[1], p[2] + i * A[2] + j * B[2]];
    return this.quad(kind, P(-1, -1), P(1, -1), P(1, 1), P(-1, 1), k);
  }
  edge(p, a, o, len, depth, k = 0.4) {
    const n = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return v.map((x) => x / l); };
    const A = n(a).map((x) => x * len / 2), O = n(o).map((x) => x * depth);
    const P = (i, j) => [p[0] + i * A[0] + j * O[0], p[1] + i * A[1] + j * O[1], p[2] + i * A[2] + j * O[2]];
    return this.quad("edge", P(-1, 1), P(1, 1), P(1, 0), P(-1, 0), k);   // v 1 on the line itself (the dark edge)
  }
  meshes(opacity = 1) {
    const out = [];
    for (const kind of Object.keys(this.q)) {
      const L = this.q[kind]; if (!L.length) continue;
      const pos = [], uv = [], col = [], idx = [];
      L.forEach(([c0, c1, c2, c3, k], i) => {
        pos.push(...c0, ...c1, ...c2, ...c3); uv.push(0, 0, 1, 0, 1, 1, 0, 1);
        for (let j = 0; j < 4; j++) col.push(0, 0, 0, k);
        const b = i * 4; idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      g.setAttribute("color", new THREE.Float32BufferAttribute(col, 4));
      g.setIndex(idx); g.computeBoundingSphere();
      const m = new THREE.MeshBasicMaterial({ map: TEX[kind](), vertexColors: true, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      const mesh = new THREE.Mesh(g, m);
      mesh.renderOrder = 2; mesh.castShadow = false; mesh.receiveShadow = false; mesh.userData.noShadow = true;
      out.push(mesh);
    }
    return out;
  }
}
/** <ShadeLayer build={(s) => …} />: builds once, one merged mesh per kind */
export const ShadeLayer = ({ build, deps = [] }) => {
  const ms = useMemo(() => { const s = new Shade(); build(s); return s.meshes(); }, deps);
  return <>{ms.map((m, i) => <primitive key={i} object={m} />)}</>;
};
/** a single moving contact blob (people, a falling thing): position/size per frame */
export const MovingBlob = ({ p, w, d, ry = 0, k = 0.5, kind = "blob" }) => {
  const tex = useMemo(TEX[kind], [kind]);
  if (k <= 0.002) return null;
  return (
    <mesh position={p} rotation={[-Math.PI / 2, 0, ry]} renderOrder={2} userData={{ noShadow: true }}>
      <planeGeometry args={[w, d]} />
      <meshBasicMaterial map={tex} color="#000000" transparent opacity={k} depthWrite={false} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
    </mesh>
  );
};
// the key's ground direction for a station whose key sits at keyPos (shadows fall away from it): unit [x, z]
export const keyDir = (keyPos = [-9, 14, 8]) => { const l = Math.hypot(keyPos[0], keyPos[2]); return [-keyPos[0] / l, -keyPos[2] / l]; };
