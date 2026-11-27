// @ts-nocheck
// ★ V38 rev 7 (builder R) — THE FIGURES IN THE WORLD (Timur, 2026-11-27: "Instead of on-screen text like $5 million … just add them
//   somewhere within the scene that actually matches the visual itself and the scene itself"). The road's three spoken figures, each on
//   a thing a driver on that road would really see, lit and rolling on its word (story frames; real = + 54):
//   · "6 years,"  (1169)  a portable LED message trailer on the left shoulder: its amber dots roll 1 → 6 YEARS
//   · "900 miles" (1213)  the MASSACHUSETTS gantry's LED distance band (st_road signTex leaves the window): 0 → 900 MILES
//   · "$600,000." (1296)  the Selbees' own tally sheet on a clipboard propped against the rear window, the figure written in marker on
//                         the word (seen through the x-rayed shell as the camera comes down onto the trunk)
//   Figures from FACTCHECK (CBS family): six years, 900 miles one way, over $600,000 a round (Jerry's average; "often" in the line).
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, clamp01, easeOut, Glow, std } from "./kit";
import { BODY, FIGURE } from "./fonts3d";

// ── LED dot-matrix text (a 5×7-ish raster of the house face, thresholded) ───────────────────────────────────────────────────────
/** an LED panel texture showing `text` (cached per text); dots lit in `col`, unlit dots faint */
export const ledTex = (text, cols, rows, col = "#FFB03A", w = 1024) => canvasTex(`r7_led_${cols}x${rows}_${col}_${text}`, w, Math.round((w * rows) / cols), (c, W, H) => {
  const R = document.createElement("canvas"); R.width = cols; R.height = rows; const q = R.getContext("2d");
  q.fillStyle = "#000"; q.fillRect(0, 0, cols, rows);
  q.fillStyle = "#fff"; q.textAlign = "center"; q.textBaseline = "middle"; q.font = `700 ${Math.round(rows * 0.95)}px ${BODY}`;
  const m = q.measureText(text).width; q.save(); q.translate(cols / 2, rows / 2 + 0.5); if (m > cols - 2) q.scale((cols - 2) / m, 1); q.fillText(text, 0, 0); q.restore();
  const px = q.getImageData(0, 0, cols, rows).data;
  c.fillStyle = "#05070A"; c.fillRect(0, 0, W, H);
  const cw = W / cols, ch = H / rows;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const on = px[(y * cols + x) * 4] > 110;
    c.fillStyle = on ? col : "rgba(120,110,90,0.16)";
    c.beginPath(); c.arc((x + 0.5) * cw, (y + 0.5) * ch, cw * 0.36, 0, Math.PI * 2); c.fill();
    if (on) { c.fillStyle = "rgba(255,240,210,0.55)"; c.beginPath(); c.arc((x + 0.42) * cw, (y + 0.42) * ch, cw * 0.13, 0, Math.PI * 2); c.fill(); }
  }
});
/** an LED face plane (unlit by the scene, bright, fogged): w × h, facing +z of its parent */
const LedFace = ({ tex, w, h, k = 1 }) => (
  <mesh renderOrder={1}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial map={tex} toneMapped={false} color={new THREE.Color(0.35 + 0.95 * k, 0.35 + 0.95 * k, 0.35 + 0.95 * k)} />
  </mesh>
);

// ── "6 YEARS": a portable variable-message trailer on the left shoulder, facing the traffic (−x) ────────────────────────────────
export const VMS_WORD = 1169;   // "6 years,"
const vmsText = (f) => { if (f < VMS_WORD - 3) return "";  const n = Math.min(6, 1 + Math.floor((f - (VMS_WORD - 3)) / 1.6)); return `${n} YEAR${n > 1 ? "S" : ""}`; };
export const VMSTrailer = ({ f, x, z }) => {
  const text = vmsText(f);
  const tex = useMemo(() => ({}), []);
  const t = tex[text] ?? (tex[text] = ledTex(text || " ", 44, 11, "#FFB03A"));
  const k = text ? clamp01((f - (VMS_WORD - 3)) / 3) : 0;
  const M = useMemo(() => ({ body: std("#C9D3DF", 0.5, 0.3), dark: std("#1B2430", 0.6, 0.2), steel: std("#8FA0B6", 0.35, 0.7), tyre: std("#0B0F16", 0.85, 0), solar: new THREE.MeshStandardMaterial({ color: "#0E2A55", roughness: 0.2, metalness: 0.4 }) }), []);
  return (
    <group position={[x, 0, z]} rotation-y={-Math.PI / 2}>
      {/* the trailer: tongue, box, axle and wheels, outrigger jacks; the mast and the sign cabinet; the solar panel on top */}
      <mesh position={[0, 0.75, 0]} material={M.body}><boxGeometry args={[1.9, 0.6, 2.4]} /></mesh>
      <mesh position={[0, 0.48, 1.7]} material={M.steel}><boxGeometry args={[0.12, 0.1, 1.2]} /></mesh>
      {[-1, 1].map((s) => <mesh key={"w" + s} position={[s * 1.02, 0.36, 0]} rotation-z={Math.PI / 2} material={M.tyre}><cylinderGeometry args={[0.36, 0.36, 0.22, 20]} /></mesh>)}
      {[[-0.9, -1.1], [0.9, -1.1], [-0.9, 1.1], [0.9, 1.1]].map(([a, b], i) => <mesh key={"j" + i} position={[a, 0.25, b]} material={M.steel}><cylinderGeometry args={[0.04, 0.06, 0.5, 8]} /></mesh>)}
      <mesh position={[0, 1.7, 0]} material={M.steel}><boxGeometry args={[0.18, 1.4, 0.18]} /></mesh>
      <group position={[0, 3.25, 0]}>
        <mesh material={M.dark}><boxGeometry args={[3.2, 1.75, 0.3]} /></mesh>
        <mesh position={[0, 0, 0.152]}><planeGeometry args={[3.24, 1.79]} /><meshStandardMaterial color="#2B3442" roughness={0.5} /></mesh>
        <group position={[0, 0, 0.156]}><LedFace tex={t} w={3.0} h={0.75} k={k} /></group>
        <mesh position={[0, 0.98, -0.1]} rotation-x={-0.6} material={M.solar}><boxGeometry args={[2.4, 0.04, 1.0]} /></mesh>
        {k > 0.02 && <Glow position={[0, 0, 0.6]} size={4.2} color="#FFB03A" opacity={0.18 * k} />}
      </group>
    </group>
  );
};

// ── "900 MILES": the gantry sign's LED distance band ───────────────────────────────────────────────────────────────────────────
export const MILES_WORD = 1213;   // "900 miles"
export const milesText = (f) => { if (f < MILES_WORD - 4) return ""; const v = Math.round((900 * easeOut(f, MILES_WORD - 4, MILES_WORD + 10)) / 50) * 50; return `${v} MILES`; };
export const GantryLed = ({ f, w, h }) => {
  const text = milesText(f);
  const tex = useMemo(() => ({}), []);
  const t = tex[text] ?? (tex[text] = ledTex(text || " ", 58, 11, "#F2F7FF", 1280));
  const k = text ? clamp01((f - (MILES_WORD - 4)) / 4) : 0;
  return <LedFace tex={t} w={w} h={h} k={k} />;
};

// ── "$600,000": the tally sheet on a clipboard ─────────────────────────────────────────────────────────────────────────────────
export const MONEY_WORD = 1296;   // "$600,000."
const padTex = () => canvasTex("r7_pad", 768, 1024, (c, w, h) => {
  c.fillStyle = "#F7F0C8"; c.fillRect(0, 0, w, h);                                       // a yellow legal pad
  c.fillStyle = "#C9473F"; c.fillRect(96, 0, 3, h); c.fillRect(102, 0, 2, h);            // the red margin
  c.fillStyle = "rgba(40,90,170,0.35)"; for (let y = 150; y < h; y += 44) c.fillRect(0, y, w, 2);
  c.fillStyle = "#14306B"; c.textAlign = "left";
  c.font = `italic 700 50px ${BODY}`; c.fillText("MASS. CASH WINFALL", 124, 124);
  c.font = `italic 600 40px ${BODY}`; c.fillText("Roll-down draw", 124, 228); c.fillText("Tickets in the tubs", 124, 316);
  c.font = `italic 700 44px ${BODY}`; c.fillText("A round:", 124, 492);
  c.strokeStyle = "#14306B"; c.lineWidth = 4; c.beginPath(); c.moveTo(124, 860); c.lineTo(640, 856); c.stroke();
});
const figTex = () => canvasTex("r7_pad_fig", 1024, 256, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  c.fillStyle = "#0E2A66"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `400 210px ${FIGURE}`;
  c.save(); c.translate(w / 2, h / 2 + 8); c.rotate(-0.035); c.fillText("$600,000", 0, 0); c.restore();
  c.strokeStyle = "#0E2A66"; c.lineWidth = 9; c.beginPath(); c.moveTo(70, 232); c.bezierCurveTo(380, 212, 700, 246, 960, 222); c.stroke();   // underlined
});
/** a plane whose texture is revealed left → right (k 0 … 1): its left edge stays put */
export const Wipe = ({ tex, w, h, k, position, opacity = 1 }) => {
  const t = useMemo(() => { const c = tex.clone(); c.needsUpdate = true; return c; }, [tex]);
  t.repeat.set(Math.max(1e-3, k), 1); t.offset.set(0, 0);
  if (k <= 0.002) return null;
  return (
    <mesh position={[position[0] - w / 2 + (w * k) / 2, position[1], position[2]]} renderOrder={2}>
      <planeGeometry args={[w * k, h]} />
      <meshBasicMaterial map={t} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};
const CLIP_BASIS = (() => { const r = new THREE.Vector3(0, 0, 1), u = new THREE.Vector3(Math.SQRT1_2, Math.SQRT1_2, 0), n = new THREE.Vector3(-Math.SQRT1_2, Math.SQRT1_2, 0); return new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().makeBasis(r, u, n)); })();
/** the clipboard, propped on the parcel shelf against the rear window, facing the camera's last axis (st_road_parts HERO_N) */
export const TallySheet = ({ f, fade = 1, glow = 0 }) => {
  const pad = useMemo(padTex, []), fig = useMemo(figTex, []);
  const k = clamp01((f - (MONEY_WORD - 2)) / 14);
  if (fade <= 0.01) return null;
  return (
    <group position={[-1.21, 1.13, 0.3]} rotation={CLIP_BASIS}>
      <mesh position={[0, 0, -0.006]}><boxGeometry args={[0.25, 0.34, 0.008]} /><meshStandardMaterial color="#1C4F96" roughness={0.35} transparent={fade < 1} opacity={fade} /></mesh>
      <mesh><planeGeometry args={[0.216, 0.29]} /><meshStandardMaterial map={pad} roughness={0.8} emissive="#ffffff" emissiveMap={pad} emissiveIntensity={0.35 + 0.4 * glow} transparent={fade < 1} opacity={fade} /></mesh>
      <mesh position={[0, 0.158, 0.008]}><boxGeometry args={[0.11, 0.035, 0.016]} /><meshStandardMaterial color="#DCE6F2" metalness={1} roughness={0.15} transparent={fade < 1} opacity={fade} /></mesh>
      <Wipe tex={fig} w={0.2} h={0.05} k={k} position={[0.0, -0.06, 0.002]} opacity={fade} />
    </group>
  );
};
