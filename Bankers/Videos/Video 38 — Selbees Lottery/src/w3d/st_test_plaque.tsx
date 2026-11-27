// @ts-nocheck
// ★ V38 rev 5 (builder Q) — THE TABLE PLAQUES (Timur, 2026-11-27, ~30 s: "$3,600 IN" / "$6,300 BACK" — "instead of making them 2D on the
//   screen, make them 3D … maybe right in front of them as a thing that lies flat on the table itself").
//   A low desk plaque lying on the table in front of each stack (1 unit = 10 cm: 23 × 10 cm, its face sloping ~26° up toward the
//   camera so it reads): a navy-enamel face on a brushed blue-steel wedge, the label engraved (IN / BACK) and the figure on a real
//   mechanical counter — four number drums in recessed windows behind a printed "$" and ",". On its spoken word the drums ROLL up to
//   the value (an odometer: each drum turns over as the one to its right passes 9) and come up lit; before, they rest dim on 0,000.
//   Lit by the station's key, casting and receiving shadows, with a contact shadow on the cloth.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, easeOut, ease, clamp01, rnd } from "./kit";
import { BODY, FIGURE } from "./fonts3d";
import { ContactShadow } from "./ticket_bundle";

export const PL = { w: 2.1, d: 1.0, hFront: 0.08, hBack: 0.56, bevel: 0.02 };
const SLOPE = Math.atan2(PL.hBack - PL.hFront, PL.d);            // the face's angle above the table
const FACE_L = Math.hypot(PL.hBack - PL.hFront, PL.d);           // its length up the slope
const FW = PL.w - 0.14, FH = FACE_L - 0.1;                        // the enamel inlay
const PX = 700;                                                   // canvas px per unit
// the figure row, in face units (x from the inlay's left, y from its top)
const ROW = { y0: 0.36, h: 0.5 }, DRUM_W = 0.29, DRUM_GAP = 0.035, DOLLAR_W = 0.3, COMMA_W = 0.12;
const rowLayout = () => {
  const total = DOLLAR_W + 4 * DRUM_W + 3 * DRUM_GAP + COMMA_W;
  let x = (FW - total) / 2;
  const L = { dollar: x }; x += DOLLAR_W;
  L.drums = [];
  for (let i = 0; i < 4; i++) { L.drums.push(x); x += DRUM_W; if (i === 0) { L.comma = x; x += COMMA_W; } else if (i < 3) x += DRUM_GAP; }
  return L;
};
const faceTex = (label) => canvasTex("q_plaque_" + label, Math.round(FW * PX), Math.round(FH * PX), (c, w, h) => {
  const L = rowLayout();
  // navy enamel, a little lighter at the top (the key's sheen), fine speckle
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#143A70"); g.addColorStop(0.5, "#0C2C5B"); g.addColorStop(1, "#08224A");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(255,255,255,${rnd(i + label.length * 7) * 0.035})`; c.fillRect(rnd(i * 3 + 1) * w, rnd(i * 7 + 2) * h, 2, 2); }
  // the engraved border (a cut groove: dark line with a light chamfer under it)
  c.strokeStyle = "rgba(0,8,22,0.7)"; c.lineWidth = 7; c.strokeRect(22, 22, w - 44, h - 44);
  c.strokeStyle = "rgba(157,195,236,0.55)"; c.lineWidth = 2.5; c.strokeRect(26, 27, w - 50, h - 50);
  // the label, engraved: a dark cut and a light chamfer
  c.textBaseline = "alphabetic"; c.textAlign = "left"; c.font = `800 ${Math.round(0.15 * PX)}px ${BODY}`;
  c.letterSpacing = `${Math.round(0.03 * PX)}px`;
  const lx = L.dollar * PX, ly = 0.26 * PX;
  c.fillStyle = "rgba(0,8,22,0.8)"; c.fillText(label, lx + 4, ly + 4);
  c.fillStyle = "#A9CBF2"; c.fillText(label, lx, ly);
  c.letterSpacing = "0px";
  // the counter windows: recessed, dark, with an inner shadow
  const wy = ROW.y0 * PX, wh = ROW.h * PX;
  for (const x0 of L.drums) {
    const x = x0 * PX - 6, ww = DRUM_W * PX + 12;
    c.fillStyle = "#020A16"; c.fillRect(x, wy - 6, ww, wh + 12);
    c.strokeStyle = "rgba(157,195,236,0.35)"; c.lineWidth = 3; c.strokeRect(x - 2, wy - 8, ww + 4, wh + 16);
  }
  // "$" and "," printed in white enamel
  c.fillStyle = "#F2F6FC"; c.textAlign = "center"; c.textBaseline = "middle";
  c.font = `400 ${Math.round(ROW.h * 0.92 * PX)}px ${FIGURE}`;
  c.fillText("$", (L.dollar + DOLLAR_W / 2) * PX, wy + wh / 2 + 4);
  c.font = `400 ${Math.round(ROW.h * 0.7 * PX)}px ${FIGURE}`;
  c.fillText(",", (L.comma + COMMA_W / 2) * PX, wy + wh * 0.78);
});
// one drum strip: 0 … 9 top to bottom (wraps: 9 rolls on into 0)
const CELL = { w: 128, h: 200 };
const stripTex = () => canvasTex("q_drumstrip", CELL.w, CELL.h * 10, (c, w, h) => {
  for (let d = 0; d < 10; d++) {
    const y = d * CELL.h;
    c.fillStyle = "#0B1C33"; c.fillRect(0, y, w, CELL.h);
    c.fillStyle = "#F4F7FC"; c.textAlign = "center"; c.textBaseline = "middle";
    c.font = `400 ${Math.round(CELL.h * 0.84)}px ${FIGURE}`; c.fillText(String(d), w / 2, y + CELL.h / 2 + 6);
  }
});
// the static drum shading over the windows (the drum's curvature: dark at the top and bottom of each window)
const shadeTex = () => canvasTex("q_drumshade", 8, 128, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(0,4,12,0.92)"); g.addColorStop(0.22, "rgba(0,4,12,0.25)"); g.addColorStop(0.5, "rgba(0,4,12,0)"); g.addColorStop(0.78, "rgba(0,4,12,0.25)"); g.addColorStop(1, "rgba(0,4,12,0.92)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
/** the odometer reading of v (float) for drum k (0 = units): the drum's continuous position 0 … 10 */
const drumPos = (v, k) => {
  if (k === 0) return v - 10 * Math.floor(v / 10);
  const p = Math.pow(10, k), base = Math.floor(v / p) % 10, within = v - p * Math.floor(v / p);
  return base + clamp01(within - (p - 1));
};
const wedgeGeo = () => {
  const s = new THREE.Shape();   // the side profile in (z, y): front at +d/2
  s.moveTo(PL.d / 2, 0); s.lineTo(PL.d / 2, PL.hFront); s.lineTo(-PL.d / 2, PL.hBack); s.lineTo(-PL.d / 2, 0); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: PL.w, bevelEnabled: true, bevelThickness: PL.bevel, bevelSize: PL.bevel, bevelSegments: 2, curveSegments: 4 });
  g.rotateY(-Math.PI / 2); g.translate(PL.w / 2, 0, 0);   // extruded along x, centred
  g.computeVertexNormals();
  return g;
};
const WHITE = new THREE.Color("#FFFFFF");
let BODY_MAT = null;
const bodyMat = () => BODY_MAT ?? (BODY_MAT = new THREE.MeshStandardMaterial({ color: "#2A4670", metalness: 0.65, roughness: 0.36, envMapIntensity: 0.35 }));
/** <Plaque f position label value at dur ry /> — value rolls from 0 at `at` to `value` at `at + dur` (ease-out) */
export const Plaque = ({ f, position, label, value, at, dur = 24, ry = 0 }) => {
  const geo = useMemo(wedgeGeo, []);
  const face = useMemo(() => faceTex(label), [label]);
  const shade = useMemo(shadeTex, []);
  const L = useMemo(rowLayout, []);
  // one strip texture per drum (clones share the image: one upload)
  const drums = useMemo(() => [0, 1, 2, 3].map(() => {
    const t = stripTex().clone(); t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 0.1); t.needsUpdate = true;
    const m = new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 0, roughness: 0.45, metalness: 0.1, envMapIntensity: 0.25, color: "#8A9AB2" });
    return { t, m };
  }), []);
  const v = value * easeOut(f, at, at + dur);
  const lit = ease(f, at - 4, at + 8);
  drums.forEach((d, i) => {   // i = 0 is the thousands drum (leftmost)
    const pos = drumPos(v, 3 - i);
    d.t.offset.y = 1 - (pos + 1) / 10;
    d.m.color.set("#8A9AB2").lerp(WHITE, lit);
    d.m.emissiveIntensity = 0.32 * lit;
  });
  // the inlay's frame on the slope: its centre, rotated so its normal leans back toward the viewer and its top runs up the slope
  const n = [0, Math.cos(SLOPE), Math.sin(SLOPE)], off = PL.bevel + 0.006;
  const cy = (PL.hFront + PL.hBack) / 2 + n[1] * off, cz = n[2] * off;
  const fx = (x) => -FW / 2 + x, fy = (y) => FH / 2 - y;   // face units → inlay-local (x right, y up the slope)
  return (
    <group position={position} rotation-y={ry}>
      <ContactShadow position={[0, 0.008, 0.02]} size={[PL.w + 0.55, PL.d + 0.5]} opacity={0.55} />
      <group position={[0, PL.bevel, 0]}>
        <mesh geometry={geo} material={bodyMat()} castShadow receiveShadow />
        <group position={[0, cy, cz]} rotation-x={-(Math.PI / 2 - SLOPE)}>
          <mesh receiveShadow><planeGeometry args={[FW, FH]} /><meshStandardMaterial map={face} roughness={0.32} metalness={0.25} envMapIntensity={0.3} /></mesh>
          {drums.map((d, i) => (
            <mesh key={i} position={[fx(L.drums[i] + DRUM_W / 2), fy(ROW.y0 + ROW.h / 2), 0.004]} material={d.m} receiveShadow>
              <planeGeometry args={[DRUM_W, ROW.h]} />
            </mesh>
          ))}
          {drums.map((_, i) => (
            <mesh key={"s" + i} position={[fx(L.drums[i] + DRUM_W / 2), fy(ROW.y0 + ROW.h / 2), 0.007]}>
              <planeGeometry args={[DRUM_W, ROW.h]} /><meshBasicMaterial map={shade} transparent depthWrite={false} toneMapped={false} />
            </mesh>
          ))}
          {/* a glass cover over the counter windows (a faint sheen across them) */}
          <mesh position={[fx(L.drums[0] + (L.drums[3] + DRUM_W - L.drums[0]) / 2), fy(ROW.y0 + ROW.h / 2), 0.011]}>
            <planeGeometry args={[L.drums[3] + DRUM_W - L.drums[0] + 0.04, ROW.h + 0.04]} />
            <meshPhysicalMaterial color="#CFE2F8" transparent opacity={0.08} roughness={0.05} metalness={0} clearcoat={1} depthWrite={false} envMapIntensity={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
