// @ts-nocheck
// ★ V39 builder C — HIS KITCHEN TABLE AT NIGHT (station `shares`): "What nobody knew: for decades, he'd quietly bought shares in
//   companies he understood, and held on to them." Metres; floor y 0; the oak table top at y KT; the back wall at z KWALL.
//   A warm domestic scene (vs the vault's cold bank): an oak plank table under a small ceramic lamp (the only warm light), a folded
//   business page (real type: section head, headlines, body text — no figures), reading glasses, a pencil, a stoneware mug, the steel
//   document box the certificates are kept in (c_docbox.tsx); café curtains at a window onto the blue night (a neighbour's clapboard house with lit windows, a bare maple).
//   The share certificates (c_cert.ts) settle one by one onto a growing stack beside the newspaper (CertRain).
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { canvasTex, rnd, Glow, clamp01, ease } from "./kit";
import { SANSF, usePropFonts, woodTex, noiseTex, tileTex } from "./c_tex";
import { line, para, flow, rule, SERIF } from "./print_type";
import { CW, CH, certMats, certIndex, certGeo } from "./c_cert";
import { KitchenRoom } from "./c_kitchen";
import { DocBox, DBOX } from "./c_docbox";

export const KT = 0.76, KWALL = -0.95;
// ── the certificate rain ───────────────────────────────────────────────────────────────────────────────────────────────
export const STACK = { x: 0.17, z: 0.03, ry: -0.1 };
export const SHEET_T = 0.0011;
export const ORDER = ["pge", "ge", "jnj", "dow", "smucker", "jpm", "cvs", "pg", "lehman", "ge", "jnj", "dow", "smucker", "jpm", "cvs", "pg"].map(certIndex);
export const N_CERT = ORDER.length;
/** the frame sheet i lands (first → last: the gaps shorten as the habit takes hold) */
export const landAt = (t0, span, i) => t0 + span * Math.pow(i / (N_CERT - 1), 0.85);
// ★ (rev 2026-11-27, Timur: "the certificates must come out of an actual spot") each certificate is LIFTED OUT OF THE STEEL DOCUMENT
//   BOX (c_docbox.tsx) behind the stack: the box's lid opens as the scene arrives; the sheets lie in it face up, PG&E on top, a few
//   more under them; one by one each rises clear of the box's rim, carries forward over its front wall and settles onto the stack
//   (landing frames unchanged: landAt). Every sheet on the table came from the box; none appears from nothing.
export const ENV = DBOX;   // (kept for callers: the box's footprint centre and yaw)
const FLY = 18, EXTRA = 5;
const sm = (x) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
const rest = (i) => [STACK.x + (rnd(i * 7 + 1) - 0.5) * 0.022, KT + (i + 0.5) * SHEET_T, STACK.z + (rnd(i * 7 + 3) - 0.5) * 0.018, STACK.ry + (rnd(i * 7 + 5) - 0.5) * 0.14];
/** sheet j's place in the box's pile (j counts from the top: the next to leave is j 0) */
const pileAt = (j, seed) => {
  const lx = (rnd(seed * 7 + 11) - 0.5) * 0.004, lz = (rnd(seed * 7 + 13) - 0.5) * 0.004, a = DBOX.ry;
  return [DBOX.x + lx * Math.cos(a) + lz * Math.sin(a), KT + DBOX.floor + (N_CERT + EXTRA - 1 - j + 0.5) * SHEET_T, DBOX.z - lx * Math.sin(a) + lz * Math.cos(a), a + (rnd(seed * 7 + 17) - 0.5) * 0.012];
};
/** the lid's opening (0 shut … 1 open), keyed to the first sheet's lift */
export const lidOpen = (f, t0) => sm((f - (t0 - FLY - 12)) / 14);
/** the pose of sheet i at frame f: [x, y, z, yaw, tiltX, tiltZ, opacity] — in the box, in flight, or on the stack */
export const sheetPose = (i, f, t0, span) => {
  const L = landAt(t0, span, i), r = rest(i), p = pileAt(i, i);
  if (f >= L) return [r[0], r[1], r[2], r[3], 0, 0, 1];
  if (f < L - FLY) return [p[0], p[1], p[2], p[3], 0, 0, 1];
  const k = clamp01((f - (L - FLY)) / FLY);
  const u = sm(k / 0.4), v = sm((k - 0.22) / 0.78), dn = sm((k - 0.55) / 0.45);
  const yTop = KT + DBOX.h + 0.11;
  const y = (p[1] + (yTop - p[1]) * u) * (1 - dn) + r[1] * dn;
  return [p[0] + (r[0] - p[0]) * v, y, p[2] + (r[2] - p[2]) * v, p[3] + (r[3] - p[3]) * v, -0.05 * Math.sin(Math.PI * v), 0, 1];
};
export const stackTop = (f, t0, span) => { let n = 0; for (let i = 0; i < N_CERT; i++) if (f >= landAt(t0, span, i)) n = i + 1; return KT + n * SHEET_T; };
const EXTRA_ORDER = ["jnj", "pg", "ge", "dow", "jpm"].map(certIndex);
export const CertRain = ({ f, t0, span }) => {
  const geo = useMemo(() => certGeo(SHEET_T * 0.9), []);
  const mats = useMemo(() => ORDER.map((ci, i) => certMats(ci, { tag: "rain" + i }).map((m) => m.clone())), []);
  const extraMats = useMemo(() => EXTRA_ORDER.map((ci) => certMats(ci)), []);
  return (
    <group>
      {EXTRA_ORDER.map((ci, k) => { const p = pileAt(N_CERT + k, 40 + k); return <mesh key={"x" + k} geometry={geo} material={extraMats[k]} position={[p[0], p[1], p[2]]} rotation-y={p[3]} receiveShadow />; })}
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
// the lamp: a turned ceramic base, a brass stem, a linen drum shade lit from inside
const VASE = [[0, 0], [0.075, 0], [0.08, 0.012], [0.07, 0.03], [0.085, 0.09], [0.09, 0.14], [0.075, 0.2], [0.04, 0.24], [0.026, 0.26], [0.03, 0.27], [0, 0.275]];
export const KLAMP = [-0.3, KT, -0.36];
const Lamp = () => {
  const vase = useMemo(() => new THREE.LatheGeometry(new THREE.SplineCurve(VASE.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(60), 48), []);
  const shade = useMemo(() => canvasTex("c_sh_shade", 64, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#C99A62"); g.addColorStop(0.55, "#F2CF98"); g.addColorStop(1, "#FFE6BC"); c.fillStyle = g; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 3) { c.fillStyle = `rgba(90,60,30,${0.04 + rnd(x) * 0.05})`; c.fillRect(x, 0, 1, h); } }), []);
  const brass = useMemo(() => new THREE.MeshStandardMaterial({ color: "#C9A86A", metalness: 0.9, roughness: 0.28 }), []);
  const cord = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0, 0.012, -0.07], [0.006, -0.01, -0.085], [0.01, -0.12, -0.12], [0.02, -0.36, -0.26], [0.04, -0.58, -0.5], [0.06, -0.66, -0.57]].map(([x, y, z]) => new THREE.Vector3(x, y, z))), 40, 0.0028, 6, false), []);
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
      {/* the harp over the bulb, the finial on top, the turn switch under the socket, the cord down the back to the wall */}
      {[-1, 1].map((s) => <mesh key={s} position={[s * 0.045, 0.45, 0]} rotation-z={-s * 0.32} material={brass}><cylinderGeometry args={[0.0025, 0.0025, 0.16, 6]} /></mesh>)}
      <mesh position={[0, 0.525, 0]} material={brass}><sphereGeometry args={[0.012, 12, 8]} /></mesh>
      <mesh position={[0.022, 0.36, 0]} rotation-z={Math.PI / 2} material={brass}><cylinderGeometry args={[0.005, 0.005, 0.02, 8]} /></mesh>
      <mesh position={[0, 0.355, 0]} material={brass}><cylinderGeometry args={[0.017, 0.015, 0.03, 14]} /></mesh>
      <mesh geometry={cord} castShadow><meshStandardMaterial color="#1A1612" roughness={0.6} /></mesh>
      <pointLight position={[0, 0.36, 0]} intensity={1.1} distance={4} decay={2} color="#FFBE80" />
      <pointLight position={[0, 0.55, 0]} intensity={0.12} distance={2} decay={2} color="#FFD8A8" />
      <Glow position={[0, 0.4, 0]} size={0.7} color="#FFC07A" opacity={0.35} />
      <Glow position={[0, 0.36, 0]} size={0.28} color="#FFE0B0" opacity={0.5} />
    </group>
  );
};
export const SharesSet = ({ f, t0, span }) => {
  const ready = usePropFonts();
  return (
    <group>
      <KitchenRoom />
      <Lamp />
      <Newspaper ready={ready} position={[-0.17, KT, 0.1]} ry={0.14} />
      <Glasses position={[-0.22, KT + 0.006, 0.17]} ry={0.5} />
      <Pencil position={[-0.08, KT + 0.0098, 0.25]} ry={-0.35} />
      <StoneMug position={[0.44, KT, -0.12]} ry={-0.6} />
      <group position={[0, KT, 0]}><DocBox open={lidOpen(f, t0)} /></group>
      <CertRain f={f} t0={t0} span={span} />
    </group>
  );
};
