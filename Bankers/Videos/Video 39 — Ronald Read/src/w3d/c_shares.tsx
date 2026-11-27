// @ts-nocheck
// ★ V39 builder C — HIS KITCHEN TABLE AT NIGHT (station `shares`): "What nobody knew: for decades, he'd quietly bought shares in
//   companies he understood, and held on to them." Metres; floor y 0; the oak table top at y KT; the back wall at z KWALL.
//   A warm domestic scene (vs the vault's cold bank): an oak plank table under a small ceramic lamp (the only warm light), a folded
//   business page (real type: section head, headlines, body text — no figures), reading glasses, a pencil, a stoneware mug, a manila
//   envelope; café curtains at a window onto the blue night (a neighbour's clapboard house with lit windows, a bare maple).
//   The share certificates (c_cert.ts) settle one by one onto a growing stack beside the newspaper (CertRain).
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { canvasTex, rnd, Glow, clamp01, ease } from "./kit";
import { SANSF, usePropFonts, woodTex, noiseTex, tileTex } from "./c_tex";
import { line, para, flow, rule, SERIF } from "./print_type";
import { CW, CH, certMats, certIndex } from "./c_cert";

export const KT = 0.76, KWALL = -0.95;
// ── the certificate rain ───────────────────────────────────────────────────────────────────────────────────────────────
export const STACK = { x: 0.17, z: 0.03, ry: -0.1 };
export const SHEET_T = 0.0011;
export const ORDER = ["pge", "ge", "jnj", "dow", "smucker", "jpm", "cvs", "pg", "pge", "ge", "jnj", "dow", "smucker", "jpm", "cvs", "pg"].map(certIndex);
export const N_CERT = ORDER.length;
/** the frame sheet i lands (first → last: the gaps shorten as the habit takes hold) */
export const landAt = (t0, span, i) => t0 + span * Math.pow(i / (N_CERT - 1), 0.85);
// ★ each certificate comes OUT OF THE MANILA ENVELOPE (certificates were mailed to their buyers) and slides along the table onto the
//   stack: it is always on a surface (inside the envelope, on the table, on the sheets below) — never in the air.
export const ENV = { x: 0.13, z: -0.27, ry: 0.1, w: 0.32, d: 0.23, t: 0.007 };
const SLIDE = 16;
const rest = (i) => [STACK.x + (rnd(i * 7 + 1) - 0.5) * 0.022, KT + (i + 0.5) * SHEET_T, STACK.z + (rnd(i * 7 + 3) - 0.5) * 0.018, STACK.ry + (rnd(i * 7 + 5) - 0.5) * 0.14];
/** the pose of sheet i at frame f: null while it is still in the envelope; [x, y, z, yaw, tiltX, tiltZ, opacity] */
export const sheetPose = (i, f, t0, span) => {
  const L = landAt(t0, span, i), r = rest(i);
  if (f < L - SLIDE) return null;
  if (f >= L) return [r[0], r[1], r[2], r[3], 0, 0, 1];
  const k = clamp01((f - (L - SLIDE)) / SLIDE);
  const e = 1 - Math.pow(1 - k, 3);                                  // out of the envelope fast, easing onto the stack
  const y0 = KT + ENV.t * 0.45, up = 1 - Math.pow(1 - clamp01(k * 1.8), 2);
  const y = y0 + (r[1] - y0) * up + 0.004 * Math.sin(Math.PI * k);   // it rides up over the sheets already there
  return [ENV.x + (r[0] - ENV.x) * e, y, ENV.z + (r[2] - ENV.z) * e, ENV.ry + (r[3] - ENV.ry) * e, -0.012 * Math.sin(Math.PI * k), 0, 1];
};
export const stackTop = (f, t0, span) => { let n = 0; for (let i = 0; i < N_CERT; i++) if (f >= landAt(t0, span, i)) n = i + 1; return KT + n * SHEET_T; };
export const CertRain = ({ f, t0, span }) => {
  const geo = useMemo(() => new THREE.BoxGeometry(CW, SHEET_T * 0.9, CH), []);
  const mats = useMemo(() => ORDER.map((ci, i) => certMats(ci, { tag: "rain" + i }).map((m) => m.clone())), []);
  return (
    <group>
      {ORDER.map((ci, i) => {
        const p = sheetPose(i, f, t0, span);
        if (!p) return null;
        const op = p[6];
        mats[i].forEach((m) => { m.transparent = op < 0.999; m.opacity = op; m.depthWrite = op > 0.5; });
        return (
          <group key={i} position={[p[0], p[1], p[2]]} rotation-y={p[3]}>
            <mesh geometry={geo} material={mats[i]} rotation-x={p[4]} rotation-z={p[5]} castShadow receiveShadow />
          </group>
        );
      })}
    </group>
  );
};
// ── the business page ──────────────────────────────────────────────────────────────────────────────────────────────────
const NP = { w: 0.29, d: 0.39 };   // a broadsheet folded in quarters
const pageDraw = (c, w, h) => {
  c.fillStyle = "#E9E5DA"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 16000; i++) { c.fillStyle = `rgba(90,85,70,${0.02 + rnd(i) * 0.04})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  const ink = "#1A1C20", m = 56;
  // section flag
  line(c, "BUSINESS", m, 150, { w: 900, px: 132, fam: SERIF, color: ink, track: 6 });
  line(c, "MARKETS  ·  COMPANIES  ·  YOUR MONEY", w - m, 150, { w: 700, px: 30, fam: SANSF, color: ink, align: "right", track: 2 });
  rule(c, m, 182, w - m, 6, ink); rule(c, m, 194, w - m, 1.5, ink);
  // lead story
  line(c, "Utilities and household names", m, 280, { w: 700, px: 74, fam: SERIF, color: ink });
  line(c, "draw patient investors", m, 362, { w: 700, px: 74, fam: SERIF, color: ink });
  line(c, "Shares in familiar companies, held for the long run, remain a mainstay of small portfolios", m, 418, { w: 400, px: 30, fam: SERIF, style: "italic", color: "#2A2C30", maxW: w - 2 * m });
  rule(c, m, 444, w - m, 1.5, ink);
  const body = [
    "A share of common stock is a unit of ownership in a corporation. Its holder may receive dividends when the board of directors declares them, and may vote on the matters put to shareholders at the annual meeting.",
    "Many individual investors keep to companies whose products they use every day: the electric company that lights the house, the maker of the soap by the sink, the drugstore on the corner, the bank down the street.",
    "Some hold their shares as paper certificates, engraved and signed, kept in a desk drawer or a safe deposit box at the bank. Others leave them with a broker in what the trade calls street name.",
    "Dividends can be paid out in cash or reinvested in more shares. Over long periods, reinvested dividends have made up a large part of what stockholders earned, according to studies of market history.",
    "Brokers note that trading often adds costs. An investor who buys and holds pays fewer commissions and, in a taxable account, defers taxes on gains until shares are sold.",
    "Spreading money across many companies and industries lowers the damage any one failure can do. A single stock can fall to nothing; a basket of them rarely does.",
    "Utilities, food makers and drug companies are often called defensive because people keep buying electricity, groceries and medicine in good times and bad.",
    "The annual report mailed to each shareholder sets out the company's results, its plans and the pay of its officers. Analysts advise reading it, and the footnotes, before buying.",
  ];
  const colW = (w - 2 * m - 2 * 30) / 3;
  const cols = [0, 1, 2].map((k) => ({ x: m + k * (colW + 30), y0: 462, y1: 1180, w: colW }));
  flow(c, body, cols, { px: 27, lh: 1.28, fam: SERIF, color: ink, indent: 20 });
  [1, 2].forEach((k) => rule(c, m + k * (colW + 30) - 15, 470, m + k * (colW + 30) - 14, 1, "#555"));
  // second story with a halftone-free illustration box: a column chart's frame is avoided (no figures); a plain engraving of a bank
  rule(c, m, 1206, w - m, 3, ink);
  line(c, "How a stock certificate works", m, 1280, { w: 700, px: 58, fam: SERIF, color: ink });
  line(c, "The paper names the company, its state of incorporation and the owner", m, 1324, { w: 400, px: 27, fam: SERIF, style: "italic", color: "#2A2C30", maxW: w - 2 * m });
  const body2 = [
    "Each certificate is printed on bank-note paper with an engraved border, a vignette and the corporate seal, and is signed by two officers of the company.",
    "It is registered on the company's books by a transfer agent. To sell, the owner signs the back and delivers it to a broker or to the agent.",
    "A lost certificate can be replaced, but the owner must usually buy a bond to protect the company against the old one turning up. Many owners keep them in a safe deposit box for that reason.",
    "Dividend checks and annual reports go to the address on the company's books, so owners are told to keep it current.",
  ];
  const cols2 = [0, 1, 2].map((k) => ({ x: m + k * (colW + 30), y0: 1346, y1: h - 120, w: colW }));
  flow(c, body2, cols2, { px: 27, lh: 1.28, fam: SERIF, color: ink, indent: 20 });
  rule(c, m, h - 90, w - m, 1.5, ink);
  line(c, "BUSINESS  2", m, h - 50, { w: 700, px: 26, fam: SANSF, color: ink });
  line(c, "Continued on Page 4", w - m, h - 50, { w: 400, px: 26, fam: SERIF, style: "italic", color: ink, align: "right" });
};
const Newspaper = ({ ready, position, ry }) => {
  const tex = useMemo(() => (ready ? canvasTex("c_sh_page", 1536, 2048, pageDraw) : null), [ready]);
  const mats = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: "#D9D4C6", roughness: 0.9 });
    const top = new THREE.MeshStandardMaterial({ map: tex, color: tex ? "#FFFFFF" : "#E2DED2", roughness: 0.88 });
    return [edge, edge, top, edge, edge, edge];
  }, [tex]);
  return (
    <group position={position} rotation-y={ry}>
      <mesh position={[0, 0.003, 0]} material={mats} castShadow receiveShadow><boxGeometry args={[NP.w, 0.006, NP.d]} /></mesh>
      {/* the folded spine along the left edge, a half-round of paper */}
      <mesh position={[-NP.w / 2, 0.003, 0]} rotation-x={Math.PI / 2} material={mats[0]}><cylinderGeometry args={[0.003, 0.003, NP.d, 10, 1, false, 0, Math.PI]} /></mesh>
      {/* the next layer peeking from under the top fold */}
      <mesh position={[0.006, 0.0015, 0.008]} material={mats[0]} receiveShadow><boxGeometry args={[NP.w, 0.003, NP.d]} /></mesh>
    </group>
  );
};
// ── small props ────────────────────────────────────────────────────────────────────────────────────────────────────────
const Glasses = ({ position, ry }) => {
  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3A2E26", roughness: 0.35, metalness: 0.2 }), []);
  return (
    <group position={position} rotation-y={ry}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.031, 0.016, 0]} rotation-x={-1.25}>
          <mesh material={frame} castShadow><torusGeometry args={[0.024, 0.0022, 8, 32]} /></mesh>
          <mesh renderOrder={3}><circleGeometry args={[0.023, 28]} /><meshPhysicalMaterial color="#DCE8F6" transparent opacity={0.18} roughness={0.02} clearcoat={1} depthWrite={false} side={THREE.DoubleSide} /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.026, -0.004]} rotation-z={Math.PI / 2} material={frame}><torusGeometry args={[0.007, 0.0018, 6, 12, Math.PI]} /></mesh>
      {/* the temples, folded behind the lenses */}
      {[-1, 1].map((s) => <mesh key={s} position={[s * 0.012, 0.006, -0.012]} rotation-y={s * 0.08} material={frame}><boxGeometry args={[0.1, 0.002, 0.003]} /></mesh>)}
    </group>
  );
};
const Pencil = ({ position, ry }) => (
  <group position={position} rotation-y={ry}>
    <mesh rotation-z={Math.PI / 2} castShadow><cylinderGeometry args={[0.0038, 0.0038, 0.17, 6]} /><meshStandardMaterial color="#D9A53A" roughness={0.5} /></mesh>
    <mesh position={[0.093, 0, 0]} rotation-z={-Math.PI / 2}><coneGeometry args={[0.0038, 0.016, 6]} /><meshStandardMaterial color="#E8CFA6" roughness={0.8} /></mesh>
    <mesh position={[-0.091, 0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.004, 0.004, 0.012, 10]} /><meshStandardMaterial color="#B8C0C8" metalness={0.8} roughness={0.3} /></mesh>
    <mesh position={[-0.1, 0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.0038, 0.0038, 0.008, 10]} /><meshStandardMaterial color="#C98A8A" roughness={0.8} /></mesh>
  </group>
);
const KMUG = [[0, 0], [0.038, 0], [0.041, 0.006], [0.042, 0.1], [0.036, 0.1], [0.035, 0.012], [0, 0.012]];
const StoneMug = ({ position, ry }) => {
  const g = useMemo(() => new THREE.LatheGeometry(KMUG.map(([r, y]) => new THREE.Vector2(r, y)), 40), []);
  const m = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#2D4E78", roughness: 0.35, clearcoat: 0.7 }), []);
  return (
    <group position={position} rotation-y={ry}>
      <mesh geometry={g} material={m} castShadow receiveShadow />
      <mesh position={[0, 0.07, 0]} rotation-x={-Math.PI / 2}><circleGeometry args={[0.0352, 32]} /><meshPhysicalMaterial color="#2A160A" roughness={0.1} clearcoat={1} /></mesh>
      <mesh position={[0.047, 0.055, 0]} material={m} castShadow><torusGeometry args={[0.022, 0.007, 10, 24, Math.PI * 1.2]} /></mesh>
    </group>
  );
};
const envDraw = (c, w, h) => {
  c.fillStyle = "#C9A46A"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "90,60,20" : "255,240,200"},${0.03 + rnd(i + 2) * 0.05})`; c.fillRect(rnd(i + 3) * w, rnd(i + 5) * h, 2, 2); }
  c.fillStyle = "rgba(70,45,15,0.28)"; c.fillRect(0, h - 26, w, 26); c.fillStyle = "rgba(255,240,210,0.35)"; c.fillRect(0, h - 30, w, 4);   // the open mouth (front edge)
  c.strokeStyle = "rgba(90,60,20,0.3)"; c.lineWidth = 2; c.beginPath(); c.moveTo(w * 0.5, 0); c.lineTo(w * 0.5, h * 0.08); c.stroke(); c.fillStyle = "#B8935A"; c.beginPath(); c.arc(w * 0.5, h * 0.1, 14, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#3A2A14"; c.font = `700 40px ${SANSF}`; c.textAlign = "left"; c.fillText("STOCK CERTIFICATES", 70, h * 0.62);
  c.font = `500 30px ${SANSF}`; c.fillText("Keep in a safe place", 70, h * 0.62 + 46);
  c.fillRect(70, h * 0.62 + 70, 380, 2);
};
const Envelope = ({ ready, position, ry }) => {
  const t = useMemo(() => (ready ? canvasTex("c_sh_env", 1024, 640, envDraw) : null), [ready]);
  const mats = useMemo(() => { const e = new THREE.MeshStandardMaterial({ color: "#C29C62", roughness: 0.85 }); return [e, e, new THREE.MeshStandardMaterial({ map: t, color: t ? "#FFFFFF" : "#C9A46A", roughness: 0.85 }), e, e, e]; }, [t]);
  return <mesh position={[position[0], position[1] + ENV.t / 2, position[2]]} rotation-y={ry} material={mats} castShadow receiveShadow><boxGeometry args={[ENV.w, ENV.t, ENV.d]} /></mesh>;
};
// the lamp: a turned ceramic base, a brass stem, a linen drum shade lit from inside
const VASE = [[0, 0], [0.075, 0], [0.08, 0.012], [0.07, 0.03], [0.085, 0.09], [0.09, 0.14], [0.075, 0.2], [0.04, 0.24], [0.026, 0.26], [0.03, 0.27], [0, 0.275]];
export const KLAMP = [-0.3, KT, -0.36];
const Lamp = () => {
  const vase = useMemo(() => new THREE.LatheGeometry(new THREE.SplineCurve(VASE.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(60), 48), []);
  const shade = useMemo(() => canvasTex("c_sh_shade", 64, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#C99A62"); g.addColorStop(0.55, "#F2CF98"); g.addColorStop(1, "#FFE6BC"); c.fillStyle = g; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 3) { c.fillStyle = `rgba(90,60,30,${0.04 + rnd(x) * 0.05})`; c.fillRect(x, 0, 1, h); } }), []);
  const brass = useMemo(() => new THREE.MeshStandardMaterial({ color: "#C9A86A", metalness: 0.9, roughness: 0.28 }), []);
  return (
    <group position={KLAMP}>
      <mesh geometry={vase} castShadow receiveShadow><meshPhysicalMaterial color="#35577F" roughness={0.2} clearcoat={1} clearcoatRoughness={0.08} /></mesh>
      <mesh position={[0, 0.34, 0]} material={brass} castShadow><cylinderGeometry args={[0.006, 0.006, 0.14, 10]} /></mesh>
      <mesh position={[0, 0.39, 0]}><sphereGeometry args={[0.028, 16, 12]} /><meshStandardMaterial color="#FFF1D6" emissive="#FFD9A0" emissiveIntensity={4} /></mesh>
      <mesh position={[0, 0.41, 0]}>
        <cylinderGeometry args={[0.11, 0.165, 0.2, 40, 1, true]} />
        <meshStandardMaterial color="#2E261D" emissiveMap={shade} emissive="#FFD6A0" emissiveIntensity={1.25} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.51, 0]} rotation-x={Math.PI / 2} material={brass}><torusGeometry args={[0.11, 0.003, 6, 40]} /></mesh>
      <mesh position={[0, 0.31, 0]} rotation-x={Math.PI / 2} material={brass}><torusGeometry args={[0.165, 0.003, 6, 40]} /></mesh>
      <pointLight position={[0, 0.36, 0]} intensity={1.1} distance={4} decay={2} color="#FFBE80" />
      <pointLight position={[0, 0.55, 0]} intensity={0.12} distance={2} decay={2} color="#FFD8A8" />
      <Glow position={[0, 0.4, 0]} size={0.7} color="#FFC07A" opacity={0.35} />
      <Glow position={[0, 0.36, 0]} size={0.28} color="#FFE0B0" opacity={0.5} />
    </group>
  );
};
// ── the kitchen ────────────────────────────────────────────────────────────────────────────────────────────────────────
const yardDraw = (c, w, h) => {   // through the kitchen window: a neighbour's clapboard house, a bare maple, the blue night
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#061732"); g.addColorStop(0.5, "#0E3468"); g.addColorStop(0.75, "#2A5C9C"); g.addColorStop(1, "#14305A");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(220,232,250,${0.2 + rnd(i) * 0.5})`; c.fillRect(rnd(i + 3) * w, rnd(i + 7) * h * 0.35, 2, 2); }
  // the house: gable, clapboard, two lit windows and a dark one, a porch light
  const hx = w * 0.18, hw = w * 0.62, hy = h * 0.42, hb = h * 0.92;
  c.fillStyle = "#1A3358"; c.fillRect(hx, hy, hw, hb - hy);
  c.beginPath(); c.moveTo(hx - 20, hy); c.lineTo(hx + hw / 2, hy - h * 0.2); c.lineTo(hx + hw + 20, hy); c.fill();
  c.fillStyle = "#0D1E38"; c.beginPath(); c.moveTo(hx - 30, hy + 6); c.lineTo(hx + hw / 2, hy - h * 0.2 - 8); c.lineTo(hx + hw + 30, hy + 6); c.lineTo(hx + hw + 30, hy - 4); c.lineTo(hx + hw / 2, hy - h * 0.2 - 18); c.lineTo(hx - 30, hy - 4); c.fill();
  for (let y = hy + 6; y < hb; y += 12) { c.fillStyle = "rgba(0,0,0,0.18)"; c.fillRect(hx, y, hw, 2); }
  [[0.16, 0.3, true], [0.6, 0.3, true], [0.38, 0.62, false], [0.16, 0.62, true]].forEach(([qx, qy, on]) => {
    const x = hx + hw * qx, y = hy + (hb - hy) * qy, ww = hw * 0.16, wh = (hb - hy) * 0.22;
    c.fillStyle = "#E7EEF6"; c.fillRect(x - 6, y - 6, ww + 12, wh + 12);
    const gg = c.createLinearGradient(0, y, 0, y + wh); if (on) { gg.addColorStop(0, "#FFD9A0"); gg.addColorStop(1, "#E09A55"); } else { gg.addColorStop(0, "#1A2C48"); gg.addColorStop(1, "#13223A"); }
    c.fillStyle = gg; c.fillRect(x, y, ww, wh); c.fillStyle = "rgba(20,30,50,0.6)"; c.fillRect(x + ww / 2 - 2, y, 4, wh); c.fillRect(x, y + wh / 2 - 2, ww, 4);
  });
  const pl = c.createRadialGradient(hx + hw * 0.48, hy + (hb - hy) * 0.55, 0, hx + hw * 0.48, hy + (hb - hy) * 0.55, 60); pl.addColorStop(0, "rgba(255,210,150,0.9)"); pl.addColorStop(1, "rgba(255,210,150,0)"); c.fillStyle = pl; c.fillRect(hx + hw * 0.48 - 60, hy + (hb - hy) * 0.55 - 60, 120, 120);
  // the ground and a fence
  c.fillStyle = "#0A1A33"; c.fillRect(0, hb, w, h - hb);
  c.fillStyle = "#1F3A62"; for (let x = 0; x < w; x += 26) c.fillRect(x, hb - 40, 14, 60); c.fillRect(0, hb - 30, w, 6);
  // the bare maple in front, its branches forking
  c.strokeStyle = "#050F22"; c.lineCap = "round";
  const branch = (x, y, a, L, wd, d) => { if (d > 7 || L < 6) return; const x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L; c.lineWidth = wd; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke(); branch(x2, y2, a - 0.35 - rnd(d * 13 + x) * 0.3, L * 0.74, wd * 0.68, d + 1); branch(x2, y2, a + 0.3 + rnd(d * 7 + y) * 0.3, L * 0.7, wd * 0.66, d + 1); };
  branch(w * 0.86, h, -Math.PI / 2 - 0.08, h * 0.26, 26, 0);
};
const Kitchen = ({ ready }) => {
  const yard = useMemo(() => canvasTex("c_sh_yard", 1024, 1024, yardDraw), []);
  const oak = useMemo(() => woodTex("kitoak", "#9C6E42", "#4A2C12", [1, 1], 11), []);
  const planks = useMemo(() => tileTex("kitplanks", 1024, 1024, (c, w, h) => { c.drawImage(oak.image, 0, 0, w, h / 2); c.drawImage(oak.image, -300, h / 2, w, h / 2); c.drawImage(oak.image, w - 300, h / 2, w, h / 2); c.fillStyle = "rgba(20,10,4,0.65)"; for (let y = 0; y < h; y += h / 4) c.fillRect(0, y, w, 3); }, true, [1, 1]), [oak]);
  const wall = useMemo(() => noiseTex("kitwall", "#4E6482", 10, [4, 3]), []);
  const curtain = useMemo(() => tileTex("kitcurtain", 256, 256, (c, w, h) => { c.fillStyle = "#E9E4D6"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { c.fillStyle = `rgba(80,70,50,${0.08 + 0.08 * Math.sin(x / 9)})`; c.fillRect(x, 0, 8, h); } c.fillStyle = "rgba(70,110,170,0.35)"; for (let y = 6; y < h; y += 32) c.fillRect(0, y, w, 4); }, true, [3, 1]), []);
  const trim = "#AEB9C6", WX0 = -0.55, WX1 = 0.45, WY0 = 1.05, WY1 = 1.95;
  const wm = useMemo(() => new THREE.MeshStandardMaterial({ map: wall, roughness: 0.9, color: "#FFFFFF" }), [wall]);
  const box = (x0, x1, y0, y1, k) => <mesh key={k} position={[(x0 + x1) / 2, (y0 + y1) / 2, KWALL - 0.06]} material={wm} receiveShadow><boxGeometry args={[x1 - x0, y1 - y0, 0.12]} /></mesh>;
  return (
    <group>
      {/* the table: oak planks on an apron and turned legs */}
      <mesh position={[0, KT - 0.018, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.036, 0.82]} />
        {[0, 1, 3, 4, 5].map((k) => <meshStandardMaterial key={k} attach={`material-${k}`} color="#6E4A2A" roughness={0.55} />)}
        <meshPhysicalMaterial attach="material-2" map={planks} roughness={0.42} clearcoat={0.4} clearcoatRoughness={0.3} />
      </mesh>
      <mesh position={[0, KT - 0.08, 0]} castShadow><boxGeometry args={[1.08, 0.09, 0.7]} /><meshStandardMaterial color="#5E3E22" roughness={0.6} /></mesh>
      {[[-0.52, -0.33], [0.52, -0.33], [-0.52, 0.33], [0.52, 0.33]].map(([x, z], i) => <mesh key={i} position={[x, (KT - 0.12) / 2, z]} castShadow><cylinderGeometry args={[0.03, 0.022, KT - 0.12, 12]} /><meshStandardMaterial color="#5E3E22" roughness={0.6} /></mesh>)}
      {/* the floor: linoleum */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0.5]} receiveShadow><planeGeometry args={[6, 4]} /><meshStandardMaterial color="#3A4A60" roughness={0.6} /></mesh>
      {/* the back wall with the window */}
      {box(-3, WX0, 0, 3, "l")}{box(WX1, 3, 0, 3, "r")}{box(WX0, WX1, 0, WY0, "b")}{box(WX0, WX1, WY1, 3, "t")}
      {[[WX0 - 0.03, (WY0 + WY1) / 2, 0.06, WY1 - WY0 + 0.06], [WX1 + 0.03, (WY0 + WY1) / 2, 0.06, WY1 - WY0 + 0.06], [(WX0 + WX1) / 2, WY1 + 0.03, WX1 - WX0 + 0.12, 0.06]].map(([x, y, w, h], i) =>
        <mesh key={i} position={[x, y, KWALL + 0.015]}><boxGeometry args={[w, h, 0.03]} /><meshStandardMaterial color={trim} roughness={0.5} /></mesh>)}
      <mesh position={[(WX0 + WX1) / 2, WY0 - 0.012, KWALL + 0.05]} castShadow receiveShadow><boxGeometry args={[WX1 - WX0 + 0.16, 0.025, 0.12]} /><meshStandardMaterial color={trim} roughness={0.45} /></mesh>
      <mesh position={[(WX0 + WX1) / 2, (WY0 + WY1) / 2, KWALL - 0.04]}><boxGeometry args={[WX1 - WX0, 0.03, 0.03]} /><meshStandardMaterial color={trim} /></mesh>
      <mesh position={[(WX0 + WX1) / 2, (WY0 + WY1) / 2, KWALL - 0.04]}><boxGeometry args={[0.03, WY1 - WY0, 0.03]} /><meshStandardMaterial color={trim} /></mesh>
      <mesh position={[(WX0 + WX1) / 2, (WY0 + WY1) / 2, KWALL - 0.05]}><planeGeometry args={[WX1 - WX0, WY1 - WY0]} /><meshPhysicalMaterial color="#9CC0EC" transparent opacity={0.08} roughness={0.03} clearcoat={1} depthWrite={false} /></mesh>
      <mesh position={[(WX0 + WX1) / 2, 1.3, KWALL - 3.2]}><planeGeometry args={[6.5, 6.5]} /><meshBasicMaterial map={yard} fog={false} /></mesh>
      {/* café curtains on a brass rod across the lower sash, and a valance at the top */}
      <mesh position={[(WX0 + WX1) / 2, 1.5, KWALL + 0.05]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.006, 0.006, WX1 - WX0 + 0.16, 8]} /><meshStandardMaterial color="#C9A86A" metalness={0.9} roughness={0.3} /></mesh>
      {[-1, 1].map((s) => {
        const g = new THREE.PlaneGeometry(0.4, 0.44, 24, 1); const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) p.setZ(i, 0.012 * Math.sin(p.getX(i) * 70));
        g.computeVertexNormals();
        return <mesh key={s} geometry={g} position={[(WX0 + WX1) / 2 + s * 0.27, 1.28, KWALL + 0.06]} castShadow><meshStandardMaterial map={curtain} roughness={0.95} side={THREE.DoubleSide} /></mesh>;
      })}
      {(() => { const g = new THREE.PlaneGeometry(WX1 - WX0 + 0.16, 0.18, 40, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.012 * Math.sin(p.getX(i) * 60)); g.computeVertexNormals(); return <mesh geometry={g} position={[(WX0 + WX1) / 2, WY1 - 0.08, KWALL + 0.07]}><meshStandardMaterial map={curtain} roughness={0.95} side={THREE.DoubleSide} /></mesh>; })()}
      {/* a wall clock and a radiator */}
      <group position={[0.85, 1.75, KWALL + 0.03]}>
        <mesh rotation-x={Math.PI / 2}><cylinderGeometry args={[0.13, 0.13, 0.04, 40]} /><meshStandardMaterial color="#C8D4E2" metalness={0.85} roughness={0.25} /></mesh>
        <mesh position={[0, 0, 0.021]}><circleGeometry args={[0.115, 40]} /><meshStandardMaterial map={useMemo(() => canvasTex("c_sh_clock", 256, 256, (c, w, h) => { c.fillStyle = "#EEF2F6"; c.fillRect(0, 0, w, h); c.fillStyle = "#1C2F4A"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `600 26px ${SANSF}`; for (let k = 1; k <= 12; k++) { const a = (k / 12) * Math.PI * 2 - Math.PI / 2; c.fillText(String(k), w / 2 + Math.cos(a) * 100, h / 2 + Math.sin(a) * 100); } for (let k = 0; k < 60; k++) { const a = (k / 60) * Math.PI * 2; c.fillRect(w / 2 + Math.cos(a) * 118 - 1, h / 2 + Math.sin(a) * 118 - 1, 3, 3); } }), [])} roughness={0.5} /></mesh>
        <mesh position={[0.02, 0.035, 0.026]} rotation-z={-0.5}><boxGeometry args={[0.008, 0.08, 0.003]} /><meshStandardMaterial color="#1C2F4A" /></mesh>
        <mesh position={[-0.035, -0.01, 0.027]} rotation-z={1.3}><boxGeometry args={[0.006, 0.1, 0.003]} /><meshStandardMaterial color="#1C2F4A" /></mesh>
      </group>
    </group>
  );
};
export const SharesSet = ({ f, t0, span }) => {
  const ready = usePropFonts();
  return (
    <group>
      <Kitchen ready={ready} />
      <Lamp />
      <Newspaper ready={ready} position={[-0.17, KT, 0.1]} ry={0.14} />
      <Glasses position={[-0.22, KT + 0.006, 0.17]} ry={0.5} />
      <Pencil position={[-0.08, KT + 0.0098, 0.25]} ry={-0.35} />
      <StoneMug position={[0.38, KT, -0.22]} ry={-0.6} />
      <Envelope ready={ready} position={[ENV.x, KT, ENV.z]} ry={ENV.ry} />
      <CertRain f={f} t0={t0} span={span} />
    </group>
  );
};
