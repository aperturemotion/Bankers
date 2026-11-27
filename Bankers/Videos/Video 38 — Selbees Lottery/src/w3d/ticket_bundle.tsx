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
// ── rev 6 (Timur, 2026-11-27: "at least add those fake shadows … a dark subtle shape under it, the correct one … you can see the corners
//   better … we don't want unlit objects"): cheap baked-AO quads, black with an alpha gradient, laid where things meet things. All are
//   MeshBasic + transparent, so kit.ShadowAll leaves them out; depthWrite off and a polygon offset so they never z-fight.
// a round soft footprint (a radial falloff): under round feet, posts, mugs, lamp bases, coin heaps
export const discTex = () => canvasTex("q_aodisc", 128, 128, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(0,6,18,1)"); g.addColorStop(0.45, "rgba(0,6,18,0.75)"); g.addColorStop(0.75, "rgba(0,6,18,0.25)"); g.addColorStop(1, "rgba(0,6,18,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
// a ring: dark at its inner edge (where a column meets a plate), fading outward; inner radius = 0.42 of the quad's half-size
export const ringTex = () => canvasTex("q_aoring", 256, 256, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(0,6,18,0)"); g.addColorStop(0.02, "rgba(0,6,18,0.95)"); g.addColorStop(0.3, "rgba(0,6,18,0.35)"); g.addColorStop(1, "rgba(0,6,18,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
// a vertical falloff: dark at the bottom edge (v = 0), clear by the top — the AO that climbs a wall or a stack from the surface it stands on
export const rampTex = () => canvasTex("q_aoramp", 8, 128, (c, w, h) => {
  const g = c.createLinearGradient(0, h, 0, 0);
  g.addColorStop(0, "rgba(0,6,18,1)"); g.addColorStop(0.25, "rgba(0,6,18,0.45)"); g.addColorStop(0.6, "rgba(0,6,18,0.1)"); g.addColorStop(1, "rgba(0,6,18,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
// a floor vignette: dark along all four edges (the corners of a box where its walls meet its floor), clear in the middle
export const frameTex = () => canvasTex("q_aoframe", 128, 128, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  const e = (x0, y0, x1, y1) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, "rgba(0,6,18,0.9)"); g.addColorStop(1, "rgba(0,6,18,0)"); return g; };
  const m = 30;
  c.fillStyle = e(0, 0, m, 0); c.fillRect(0, 0, m, h); c.fillStyle = e(w, 0, w - m, 0); c.fillRect(w - m, 0, m, h);
  c.fillStyle = e(0, 0, 0, m); c.fillRect(0, 0, w, m); c.fillStyle = e(0, h, 0, h - m); c.fillRect(0, h - m, w, m);
});
// a groove: dark along the middle of its width (u), clear at both edges — the inside bottom of a chute
export const grooveTex = () => canvasTex("q_aogroove2", 8, 64, (c, w, h) => {   // dark along the middle of its height (v): across the chute
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(0,6,18,0)"); g.addColorStop(0.5, "rgba(0,6,18,1)"); g.addColorStop(1, "rgba(0,6,18,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
const aoMat = (map, opacity) => new THREE.MeshBasicMaterial({ map, color: "#000000", transparent: true, opacity, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
/** a flat AO quad on a horizontal surface. kind: "disc" | "ring" | "frame" | "rect" (the blurred rounded rect) */
export const AOFlat = ({ position, size, kind = "disc", opacity = 0.5, ry = 0 }) => {
  const m = useMemo(() => aoMat(kind === "ring" ? ringTex() : kind === "frame" ? frameTex() : kind === "rect" ? contactTex() : discTex(), opacity), [kind]);
  m.opacity = opacity;
  return <mesh position={position} rotation={[-Math.PI / 2, 0, ry]} material={m} renderOrder={1}><planeGeometry args={size} /></mesh>;
};
/** an AO skirt around a box footprint (w × d) standing on a surface: four upright quads, dark at the foot, clear by height h */
export const AOSkirt = ({ position = [0, 0, 0], w, d, h, opacity = 0.45, ry = 0, out = 0.004 }) => {
  const m = useMemo(() => aoMat(rampTex(), opacity), []);
  m.opacity = opacity;
  const sides = [[0, d / 2 + out, 0, w], [0, -d / 2 - out, Math.PI, w], [w / 2 + out, 0, Math.PI / 2, d], [-w / 2 - out, 0, -Math.PI / 2, d]];
  return (
    <group position={position} rotation-y={ry}>
      {sides.map(([x, z, r, L], i) => <mesh key={i} position={[x, h / 2, z]} rotation-y={r} material={m} renderOrder={1}><planeGeometry args={[L, h]} /></mesh>)}
    </group>
  );
};
/** an AO sleeve around a cylinder (radius r) standing on a surface: dark at its foot, clear by height h (open-ended cylinder, outside) */
export const AOSleeve = ({ position = [0, 0, 0], r, h, opacity = 0.45, flip = false }) => {
  const m = useMemo(() => { const x = aoMat(rampTex(), opacity); x.side = THREE.DoubleSide; return x; }, []);
  m.opacity = opacity;
  return <mesh position={[position[0], position[1] + h / 2, position[2]]} rotation-x={flip ? Math.PI : 0} material={m} renderOrder={1}><cylinderGeometry args={[r, r, h, 48, 1, true]} /></mesh>;
};
/** an upright AO quad (a soft shadow on a wall behind something): kind "disc" */
export const AOWall = ({ position, size, opacity = 0.4, ry = 0 }) => {
  const m = useMemo(() => aoMat(discTex(), opacity), []);
  m.opacity = opacity;
  return <mesh position={position} rotation-y={ry} material={m} renderOrder={1}><planeGeometry args={size} /></mesh>;
};
/** a groove quad along x (length L, width wd), lying flat — the inside bottom of a chute */
export const AOGroove = ({ position, L, wd, opacity = 0.5 }) => {
  const m = useMemo(() => aoMat(grooveTex(), opacity), []);
  m.opacity = opacity;
  return <mesh position={position} rotation-x={-Math.PI / 2} material={m} renderOrder={1}><planeGeometry args={[L, wd]} /></mesh>;
};
/** an upright ramp quad: dark at its bottom edge (flip: at its top edge), clear at the other — AO under a ledge, at the foot of a wall */
export const AORamp = ({ position, size, opacity = 0.4, ry = 0, flip = false }) => {
  const m = useMemo(() => aoMat(rampTex(), opacity), []);
  m.opacity = opacity;
  return <mesh position={position} rotation={[0, ry, flip ? Math.PI : 0]} material={m} renderOrder={1}><planeGeometry args={size} /></mesh>;
};
/** a flat AO annulus (inner radius r0, fading out by r1) on a horizontal surface: where a column or post meets a plate */
const annulusTex = (k) => canvasTex("q_aoannulus_" + k.toFixed(3), 256, 256, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, (w / 2) * k, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(0,6,18,1)"); g.addColorStop(0.3, "rgba(0,6,18,0.4)"); g.addColorStop(1, "rgba(0,6,18,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
export const AORing = ({ position, r0, r1, opacity = 0.5 }) => {
  const m = useMemo(() => aoMat(annulusTex(r0 / r1), opacity), [r0, r1]);
  m.opacity = opacity;
  return <mesh position={position} rotation-x={-Math.PI / 2} material={m} renderOrder={1}><ringGeometry args={[r0, r1, 64]} /></mesh>;
};
