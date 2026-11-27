// @ts-nocheck
// ★ V38 rev 5 (builder Q) — the ticket bundle and the table-top shading shared by ROLLDOWN (the balance's left pan) and TEST (the kitchen).
//   Timur (2026-11-27, 897 f): "there are no shadows whatsoever on these objects … they both look too bright and unlit". So:
//   · a bundle of 100 thermal Winfall slips: the printed top slip (ticket_art.ts), the cut sides showing every slip (each a hair
//     out of square, a few showing the pre-printed security tint at the cut), two real blue rubber bands; paper materials that take
//     the key (low environment light, rough), cast and receive shadows
//   · contactTex(): a soft dark footprint laid under a stack where it meets the table (the contact shadow the shadow map can't draw)
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { drawTicket } from "./ticket_art";
import { TH, TK_W, TK_D } from "./ticket_stack";

// the top slip, at a size that holds a close-up (the match lands on it)
export const ticketTopTex = () => canvasTex("q_ticketface_v5", 480, 1140, (c, w, h) => drawTicket(c, w, h, { seed: 4 }));
// the cut sides: 100 slips (rows along v = the bundle's height); u along the side's length
export const ticketEdgeTex = () => canvasTex("q_ticketedge_v5", 1024, 256, (c, w, h) => {
  c.fillStyle = "#E6EBF1"; c.fillRect(0, 0, w, h);
  const n = 100, rh = h / n;
  for (let i = 0; i < n; i++) {
    const y = i * rh, k = rnd(i * 5.1 + 2);
    // the slip's own paper (thermal paper is slightly blue-white; some slips show the pre-printed security tint at the cut)
    c.fillStyle = k < 0.12 ? "rgba(120,160,215,0.32)" : k < 0.2 ? "rgba(214,160,180,0.22)" : k < 0.55 ? "rgba(255,255,255,0.35)" : "rgba(170,182,198,0.18)";
    c.fillRect(0, y, w, rh);
    // the hairline between slips
    c.fillStyle = `rgba(40,55,78,${0.22 + rnd(i * 3.7) * 0.25})`; c.fillRect(0, y + rh * 0.78, w, Math.max(0.7, rh * 0.22));
    // a slip a hair proud or short of the others (hand-squared, not machined): a darker run near one end
    if (rnd(i + 41) < 0.3) { const L = 20 + rnd(i + 3) * 90, atEnd = rnd(i + 7) < 0.5; c.fillStyle = "rgba(25,38,58,0.3)"; c.fillRect(atEnd ? w - L : 0, y, L, rh); }
  }
  // the ends of the stack are rounded off by handling: a soft darkening at top and bottom
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(10,22,40,0.28)"); g.addColorStop(0.05, "rgba(0,0,0,0)"); g.addColorStop(0.95, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(10,22,40,0.35)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
let MATS = null;
export const ticketMats = () => {
  if (MATS) return MATS;
  const edge = ticketEdgeTex(), top = ticketTopTex();
  const side = new THREE.MeshStandardMaterial({ map: edge, color: "#D3DCE7", roughness: 0.9, metalness: 0, envMapIntensity: 0.12 });
  const face = new THREE.MeshStandardMaterial({ map: top, color: "#E2E8F0", roughness: 0.62, metalness: 0, envMapIntensity: 0.14 });
  const under = new THREE.MeshStandardMaterial({ color: "#C3CDDA", roughness: 0.9, envMapIntensity: 0.1 });
  const band = new THREE.MeshStandardMaterial({ color: "#2A4F8E", roughness: 0.5, metalness: 0, envMapIntensity: 0.25 });
  MATS = { box: [side, side, face, under, side, side], band };
  return MATS;
};
let GEO = null;
export const ticketGeo = () => {
  if (GEO) return GEO;
  GEO = { box: new THREE.BoxGeometry(TK_W, TH, TK_D), band: new THREE.BoxGeometry(TK_W + 0.014, TH + 0.012, 0.034) };
  return GEO;
};
/** one bundle at its local pose; s = scale (0 → hidden) */
export const TicketBundle = ({ p, s = 1, shadows = true }) => {
  const m = ticketMats(), g = ticketGeo();
  if (s <= 0.001) return null;
  return (
    <group position={[p[0], p[1], p[2]]} rotation-y={p[3]} scale={s}>
      <mesh geometry={g.box} material={m.box} castShadow={shadows} receiveShadow />
      <mesh geometry={g.band} material={m.band} position={[0, 0, -0.45]} castShadow={false} receiveShadow />
      <mesh geometry={g.band} material={m.band} position={[0, 0, 0.45]} castShadow={false} receiveShadow />
    </group>
  );
};
// ── a soft contact shadow (a dark rounded footprint, blurred): lay it a hair above the surface under a stack ──────────────────────
export const contactTex = () => canvasTex("q_contact", 256, 256, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  c.filter = "blur(18px)";
  c.fillStyle = "rgba(0,6,18,1)";
  const m = 46; c.beginPath(); c.roundRect ? c.roundRect(m, m, w - 2 * m, h - 2 * m, 26) : c.rect(m, m, w - 2 * m, h - 2 * m); c.fill();
  c.filter = "none";
});
export const ContactShadow = ({ position, size, opacity = 0.6, ry = 0 }) => {
  const t = useMemo(contactTex, []);
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, ry]} renderOrder={1}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={t} transparent opacity={opacity} depthWrite={false} toneMapped={false} color="#000000" polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
};
