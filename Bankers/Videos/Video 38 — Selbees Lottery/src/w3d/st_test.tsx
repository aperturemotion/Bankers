// @ts-nocheck
// ★ V38 station TEST (builder B): "Jerry tried it." (738–761) "$3,600 in." (770–830) "$6,300 back." (833–880)
//   A kitchen table at night (1 unit = 10 cm, the table top is y 0): a Formica top under a warm table lamp, the blue-hour street in
//   the window behind. Jerry's Winfall tickets stand on the left as 36 rubber-banded bundles of 100 (two per layer, 18 layers);
//   ★ rev 5 (builder Q, Timur 2026-11-27): ARRIVAL is a MATCH CUT — rolldown's camera pushes onto the same 36 bundles on the balance's left
//   pan and the cut lands on this stack at the same screen place and size (ticket_stack.ts, rolldown.matchPose); no dissolve. The figures
//   are 3-D TABLE PLAQUES (st_test_plaque.tsx: IN rolls to $3,600 on "$3,600", BACK to $6,300 on "$6,300"); the 2-D counters, the Net
//   pill, the level line and the blue glow on the cash are gone. Both stacks are lit by a real key (shadows on the cloth, contact
//   shadows), paper and notes take the light (low environment light), the bundles fall solid from above the frame. On "$6,300" 63
//   strapped bundles of REAL $1 notes (money.tsx: the series-2009 $1 scan; $100 a strap, the ABA blue) stack to 31½ layers: 1.75 × the
//   tickets, the real ratio.
//   DEPARTURE (rev 2; rev 5 re-timed and re-solved in REAL frames): one continuous dive onto the top $1 note's green Treasury seal,
//   landing it on SEAL_SCREEN at PUSH_RATE on the last frame (xfer_seal.ts) → company cuts in on the certificate's gold seal.
import React, { useMemo } from "react";
import * as THREE from "three";
import { ease, easeOut, rnd, clamp01, Sky, Glow, canvasTex } from "./kit";
import { Tag } from "./overlays";
import { wf, wEnd } from "./take";
import { cueAt } from "../bnx/SfxLayer";
import { Room, Outside, TableLamp, Mug, Notepad, formicaTex } from "./st_test_props";
import { billFaceMat, strapTex, bundleGeo, sealLocal, BILL } from "./money";
import { SEAL_SCREEN, PUSH_RATE } from "./xfer_seal";
import { BODY, FIGURE } from "./fonts3d";
import { TH, TK_N, TKX, tkLocal, TK_TOP, MATCH_CUT, TEST_ORIGIN as ORIGIN } from "./ticket_stack";
import { TicketBundle, ContactShadow } from "./ticket_bundle";
import { Plaque, PL } from "./st_test_plaque";
import { matchPose } from "./st_rolldown";

export const TEST_ORIGIN = ORIGIN;
// ARRIVAL (rev 5, Timur: "seamless transitions … preferably no fade outs"): "match" — rolldown's camera pushes onto Jerry's ticket stack on
//   the balance's left pan and the cut lands on the SAME stack (ticket_stack.ts) on his kitchen table, at the same screen place and size
//   (rolldown.matchPose), so the stack never moves while the world around it changes; then the camera slowly cranes back to show the table.
//   (rev 3–4: "dissolve" — a 14-f cross-dissolve, Main.tsx DISSOLVES; that entry is to be removed.)
export const TEST_ARRIVE = "match";
export const TEST_CUT = () => T().cut;   // the match cut (story); Main.tsx no longer dissolves here
export const T = () => {
  const jerry = wf("jerry", 2), in36 = wf("$3,600"), inEnd = wEnd("in.", 3), in63 = wf("$6,300"), back = wf("back."), backEnd = wEnd("back.");
  // (rev 5: inEnd was wEnd("in.") = the "In" of "In 2003" (215) — the level line had been drawn from the first frame)
  return { jerry, cut: MATCH_CUT(), in36, inEnd, in63, back, backEnd, out: backEnd + 3 };   // out: the frame company's cut lands on
};
// ── the stacks ────────────────────────────────────────────────────────────────────────────────────────────────────────────
const CSX = 1.3;                                 // the cash stack's centre (x); z 0 (the tickets: TKX, ticket_stack.ts)
const CS_N = 63;
const PLZ = 2.0;                                 // the plaques lie in front of the stacks (clear of the stacks' feet from the camera)
const csRest = (i) => { const L = Math.floor(i / 2), s = i % 2; return [CSX + (rnd(i + 21) - 0.5) * 0.05, L * TH + TH / 2, (s ? -0.34 : 0.34) + (rnd(i + 27) - 0.5) * 0.04, (rnd(i + 33) - 0.5) * 0.06]; };
const POUR = 0.38;   // frames between landings (rev 2: 0.48 → 0.38, so the top bundle has landed, ≈ 858, before the push comes close)
const csLand = (t, i) => t.in63 + 2 + i * POUR;   // the frame bundle i lands (the last, #62, lands ≈ 25 f after "$6,300")
// rev 5: the bundles fall from above the frame's top (60 cm, ≈ 0.37 s, accelerating), solid all the way — no fade-in ghosts. The top four
//   layers (i ≥ TOPN), which land while the camera is already rising over the stack for the seal dive, drop only 26 cm (they would
//   otherwise fall past the lens) and come in over the first frames of that short drop, as in rev 4.
const TOPN = 54;
const FALLi = (i) => (i >= TOPN ? 9 : 11), DROPi = (i) => (i >= TOPN ? 2.6 : 6.5);
const csPose = (t, f, i) => {
  const r = csRest(i), L = csLand(t, i), FALL = FALLi(i), DROP = DROPi(i);
  if (f < L - FALL) return null;
  const k = clamp01((f - (L - FALL)) / FALL);
  const y = r[1] + DROP * (i >= TOPN ? (1 - k) * (1 - k) : 1 - k * k);   // the long drops fall and land; the short ones settle in (rev 4)
  const settle = f > L && i < CS_N - 1 ? 0.012 * Math.exp(-(f - L) / 2.5) * Math.sin((f - L) * 1.9) : 0;   // the top bundle (the push's target) lands dead
  return [r[0], y + settle, r[2], r[3] + (1 - k) * 0.5 * (rnd(i + 5) - 0.5), k];
};
// ★ rev 5 — THE CASH, LIT (Timur, 897 f: "too bright and unlit"): real $1 notes (money.tsx's scan) on paper that takes the key — low
//   environment light, no glow; the cut sides show the 100 notes (green-grey paper, the print's edge tint, hairline gaps, a few notes
//   proud); the ABA blue $100 strap carries its print on the sides too. Every bundle casts and receives the key's shadow.
const cashEdgeTex = () => canvasTex("q_cashedge_v5", 1024, 256, (c, w, h) => {
  c.fillStyle = "#D5DCCB"; c.fillRect(0, 0, w, h);
  const n = 100, rh = h / n;
  for (let i = 0; i < n; i++) {
    const y = i * rh, k = rnd(i * 7.3 + 3);
    c.fillStyle = k < 0.18 ? "rgba(96,128,100,0.3)" : k < 0.32 ? "rgba(255,255,240,0.32)" : k < 0.45 ? "rgba(70,96,120,0.18)" : "rgba(180,190,170,0.12)";
    c.fillRect(0, y, w, rh);
    c.fillStyle = `rgba(36,52,44,${0.24 + rnd(i * 3.1) * 0.26})`; c.fillRect(0, y + rh * 0.74, w, Math.max(0.7, rh * 0.26));
    if (rnd(i + 91) < 0.25) { const L = 24 + rnd(i + 8) * 120, atEnd = rnd(i + 5) < 0.5; c.fillStyle = "rgba(20,32,26,0.3)"; c.fillRect(atEnd ? w - L : 0, y, L, rh); }
  }
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(10,20,15,0.3)"); g.addColorStop(0.06, "rgba(0,0,0,0)"); g.addColorStop(0.94, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(10,20,15,0.36)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
const strapSideTex = () => canvasTex("q_strapside_v5", 512, 176, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#2D63B4"); g.addColorStop(0.5, "#3570C2"); g.addColorStop(1, "#2858A6");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(255,255,255,${rnd(i) * 0.06})`; c.fillRect(rnd(i + 3) * w, rnd(i + 9) * h, 1, 2 + rnd(i + 4) * 4); }
  c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `400 112px ${FIGURE}`; c.fillText("$100", w / 2, h / 2 + 6);
  c.fillStyle = "rgba(0,20,60,0.35)"; c.fillRect(0, 0, w, 6); c.fillRect(0, h - 6, w, 6);
});
const cashMats = () => {
  const edge = new THREE.MeshStandardMaterial({ map: cashEdgeTex(), color: "#E2E8DC", roughness: 0.9, envMapIntensity: 0.12 });
  const face = billFaceMat({}); face.envMapIntensity = 0.14; face.color.set("#E9ECE2");
  const strapFace = new THREE.MeshStandardMaterial({ map: strapTex(), color: "#FFFFFF", roughness: 0.66, envMapIntensity: 0.15 });
  const strapSide = new THREE.MeshStandardMaterial({ map: strapSideTex(), color: "#FFFFFF", roughness: 0.66, envMapIntensity: 0.15 });
  const all = [edge, face, strapFace, strapSide];
  return { box: [edge, edge, face, face, edge, edge], strap: [strapSide, strapSide, strapFace, strapFace, strapSide, strapSide], all };
};
const Stacks = ({ f, t }) => {
  const geo = useMemo(() => bundleGeo(TH), []);
  const csEach = useMemo(() => Array.from({ length: CS_N - TOPN + 1 }, cashMats), []);   // [0]: shared by the solid ones; one set per top bundle (its fade)
  const cashDown = ease(f, csLand(t, 0) - 3, csLand(t, 0) + 1);
  return (
    <group>
      {/* Jerry's tickets: 36 banded bundles (ticket_stack.ts — the same stack the balance carried), with its contact shadow */}
      <group position={[TKX, 0, 0]}>
        <ContactShadow position={[0, 0.008, 0]} size={[2.05, 2.3]} opacity={0.62} />
        {Array.from({ length: TK_N }, (_, i) => <TicketBundle key={"t" + i} p={tkLocal(i)} />)}
      </group>
      {cashDown > 0 && <ContactShadow position={[CSX, 0.008, 0]} size={[2.3, 2.05]} opacity={0.62 * cashDown} />}
      {Array.from({ length: CS_N }, (_, i) => {
        const p = csPose(t, f, i);
        if (!p) return null;
        const m = i >= TOPN ? csEach[i - TOPN + 1] : csEach[0];
        const op = i >= TOPN ? clamp01(p[4] / 0.4) : 1;
        if (i >= TOPN) m.all.forEach((q) => { q.transparent = op < 0.999; q.opacity = op; q.depthWrite = op > 0.5; });
        return (
          <group key={"c" + i} position={[p[0], p[1], p[2]]} rotation-y={p[3]}>
            <mesh geometry={geo.box} material={m.box} castShadow={op > 0.5} receiveShadow />
            <mesh geometry={geo.strap} material={m.strap} castShadow={false} receiveShadow />
          </group>
        );
      })}
    </group>
  );
};
// ── the kitchen ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const ginghamTex = () => {
  const t = canvasTex("stt_gingham", 128, 128, (c, w, h) => {
    c.fillStyle = "#8494AC"; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(38,84,150,0.55)"; c.fillRect(0, 0, w / 2, h); c.fillRect(0, 0, w, h / 2);
    c.fillStyle = "rgba(20,52,104,0.55)"; c.fillRect(0, 0, w / 2, h / 2);
    for (let i = 0; i < 1400; i++) { c.fillStyle = `rgba(255,255,255,${rnd(i) * 0.08})`; c.fillRect(rnd(i + 2) * w, rnd(i + 5) * h, 1, 3); }   // the weave
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
};
const clockTex = () => canvasTex("stt_clock", 256, 256, (c, w, h) => {
  c.fillStyle = "#E6EDF5"; c.beginPath(); c.arc(w / 2, h / 2, 124, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "#1C2F4A";
  for (let k = 0; k < 60; k++) { const a = (k / 60) * Math.PI * 2, r0 = k % 5 ? 112 : 98; c.lineWidth = k % 5 ? 2 : 6; c.beginPath(); c.moveTo(w / 2 + Math.cos(a) * r0, h / 2 + Math.sin(a) * r0); c.lineTo(w / 2 + Math.cos(a) * 118, h / 2 + Math.sin(a) * 118); c.stroke(); }
});
const WallClock = ({ position }) => {
  const tx = useMemo(clockTex, []);
  return (
    <group position={position}>
      <mesh rotation-x={Math.PI / 2} castShadow><cylinderGeometry args={[1.25, 1.25, 0.3, 48]} /><meshStandardMaterial color="#C8D4E2" metalness={0.9} roughness={0.2} /></mesh>
      <mesh position={[0, 0, 0.16]}><circleGeometry args={[1.08, 48]} /><meshStandardMaterial map={tx} roughness={0.5} /></mesh>
      <mesh position={[0.18, 0.32, 0.2]} rotation-z={-0.52}><boxGeometry args={[0.07, 0.75, 0.02]} /><meshStandardMaterial color="#1C2F4A" /></mesh>
      <mesh position={[-0.35, -0.12, 0.21]} rotation-z={1.24}><boxGeometry args={[0.08, 0.55, 0.02]} /><meshStandardMaterial color="#1C2F4A" /></mesh>
      <mesh position={[0, 0, 0.22]}><cylinderGeometry args={[0.06, 0.06, 0.04, 12]} /><meshStandardMaterial color="#1C2F4A" /></mesh>
    </group>
  );
};
const Kitchen = () => {
  const fm = useMemo(formicaTex, []);
  const gm = useMemo(() => { const t = ginghamTex(); const c = t.clone(); c.needsUpdate = true; c.repeat.set(42, 27); return c; }, []);
  const gmSide = useMemo(() => { const t = ginghamTex(); const c = t.clone(); c.needsUpdate = true; c.repeat.set(42, 6.4); return c; }, []);
  const chrome = useMemo(() => new THREE.MeshStandardMaterial({ color: "#C8D4E2", metalness: 0.95, roughness: 0.18 }), []);
  const cab = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3C5677", roughness: 0.55 }), []);
  const cabIn = useMemo(() => new THREE.MeshStandardMaterial({ color: "#46617F", roughness: 0.5 }), []);
  return (
    <group>
      {/* the table: Formica top, chrome edge band, chrome legs */}
      <mesh position={[0, -0.001, -1]} rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[16, 10]} /><meshStandardMaterial map={fm} color="#6A7E99" roughness={0.42} metalness={0.02} envMapIntensity={0.5} /></mesh>
      <mesh position={[0, -0.2, -1]} material={chrome} receiveShadow castShadow><boxGeometry args={[16.12, 0.38, 10.12]} /></mesh>
      <mesh position={[0, -0.45, -1]} receiveShadow><boxGeometry args={[15.6, 0.2, 9.6]} /><meshStandardMaterial color="#1C2B40" roughness={0.8} /></mesh>
      {[[-7.2, 3.2], [7.2, 3.2], [-7.2, -5.2], [7.2, -5.2]].map(([x, z], i) => <mesh key={i} position={[x, -3.9, z]} material={chrome} castShadow><cylinderGeometry args={[0.2, 0.16, 7, 16]} /></mesh>)}
      {/* a blue gingham tablecloth over it (the Evart diners' cloth), its hem hanging over the edges */}
      <mesh position={[0, 0.004, -1]} rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[16.6, 10.6]} /><meshStandardMaterial map={gm} roughness={0.92} envMapIntensity={0.14} /></mesh>
      {[[0, 4.3, 16.6, 0], [0, -6.3, 16.6, 0], [8.3, -1, 10.6, 1], [-8.3, -1, 10.6, 1]].map(([x, z, len, side], i) =>
        <mesh key={i} position={[x, -1.25, z]} rotation-y={side ? Math.PI / 2 : 0} receiveShadow castShadow><boxGeometry args={[len, 2.5, 0.04]} /><meshStandardMaterial map={gmSide} roughness={0.92} envMapIntensity={0.35} /></mesh>)}
      {/* rev 5: a shadow catcher on the cloth (the gingham's busy checks swallow the stacks' cast shadows) */}
      <mesh position={[0, 0.006, -1]} rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[16.6, 10.6]} /><shadowMaterial transparent opacity={0.4} color="#000814" depthWrite={false} /></mesh>
      {/* a wall clock on the right of the window (a real kitchen's: chrome bezel, white dial, twelve ticks, hands) */}
      <WallClock position={[4.2, 7.4, -11.6]} />
    </group>
  );
};
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  return (
    <group>
      {f > t.cut && <Sky zenith="#020F24" mid="#0A2E60" horizon="#3E78C2" glowAt={0.5} radius={300} />}
      <Room wallZ={-12} floorY={-7.4} wx0={-8} wx1={-1.4} wy0={1.6} wy1={10} />
      <Outside floorY={-7.4} wallZ={-12} />
      <Kitchen />
      <TableLamp position={[-3.4, 0, -6.6]} scale={0.75} power={0.55} />
      <Notepad position={[-4.3, 0, 1.9]} ry={0.35} />
      <Mug position={[4.6, 0, 1.7]} ry={-0.6} />
      <Stacks f={f} t={t} />
      {/* ★ rev 5: the figures lie ON THE TABLE in front of each stack (Timur: "make them 3D … a thing that lies flat on the table itself") */}
      <Plaque f={f} position={[TKX, 0, PLZ]} label="IN" value={3600} at={t.in36} dur={24} ry={0.04} />
      <Plaque f={f} position={[CSX, 0, PLZ]} label="BACK" value={6300} at={t.in63} dur={10} ry={-0.04} />
    </group>
  );
};
// ── the camera (WORLD coords) ─────────────────────────────────────────────────────────────────────────────────────────────
const W = (p) => [p[0] + TEST_ORIGIN[0], p[1] + TEST_ORIGIN[1], p[2] + TEST_ORIGIN[2]];
// ★ rev 2 — THE MATCHED CUT (xfer_seal.ts): the departure is one continuous dive onto the top $1 note's GREEN TREASURY SEAL. Three
//   shots: the rise with the cash (both stacks), the turn onto the PUSH AXIS (a line through the seal, tilted PUSH_TILT off the
//   vertical, so the seal sits at SEAL_SCREEN on screen), and the push along that axis. Along the axis the camera's direction never
//   changes, so the seal holds its screen point while it grows, and makeCam's geometric zoom makes the distance D(f) = D2·(D1/D2)^e:
//   the seal's radius grows by exp(e'·ln(D2/D1)) per frame. The push's b lies past the cut (PUSH.b > out), so on test's last frame
//   the camera is still moving: there the seal is SEAL_SCREEN.r px and grows PUSH_RATE per frame (measured: scratchpad/sealprobe).
export const PUSH_TILT = 0.30;                         // rad off the vertical (the camera leans back toward the viewer's side, +z)
// rev 5: align 838→870 onto the axis at D2 = 3.0; push 850→b3 toward D1 (a longer, gentler dive: peak image speed 78 → 61 px/f).
//   b3, D1, ox, oz are SOLVED by scratchpad/q_seal.ts --solve in REAL frames (Main's construction: shots + HOOK_SHIFT, drift on real
//   frames) so that on test's last frame (real 936) the seal's outline is centred on (540, 820), 300 px in radius, growing 1.200 % per
//   frame. (The rev 2 values were solved in story frames; since the hook shift the seal had landed at x 512, 28 px left.)
export const PUSH = { a2: 838, b2: 870, D2: 3, a3: 850, b3: 885.37097, D1: 0.6671139, ox: -0.0030825, oz: 0.0034803 };
/** the seal on the top note of the cash stack (bundle 62 at rest), in station coords; r = its outer radius (sawtooth) */
export const sealWorld = () => {
  const i = CS_N - 1, r = csRest(i), sl = sealLocal(), c = Math.cos(r[3]), sn = Math.sin(r[3]);
  return { p: [r[0] + sl.x * c + sl.z * sn, r[1] + TH / 2, r[2] - sl.x * sn + sl.z * c], r: sl.r };
};
// the axis pose at distance D from the seal (PUSH.ox/oz shift the axis by the idle drift's pull at the cut, measured): the seal lies (SEAL_SCREEN.y − 960) px above the screen centre at fov 40
export const axisPose = (D) => {
  const S0 = sealWorld().p, S = [S0[0] + PUSH.ox, S0[1], S0[2] + PUSH.oz], b = PUSH_TILT;   // (ox, oz: cancel the camera's idle drift at the cut)
  const w = [0, -Math.cos(b), -Math.sin(b)], up = [0, Math.sin(b), -Math.cos(b)];     // view direction, screen-up
  const al = Math.atan(((960 - SEAL_SCREEN.y) / 960) * Math.tan((40 / 2) * Math.PI / 180));   // the seal's angle above the axis
  const u = [0, 1, 2].map((k) => Math.cos(al) * w[k] + Math.sin(al) * up[k]);           // the camera → seal direction
  const pos = [0, 1, 2].map((k) => S[k] - u[k] * D);
  return { pos: W(pos), target: W([0, 1, 2].map((k) => pos[k] + w[k] * D)), fov: 40 };
};
// ★ rev 5 — THE CAMERA (Timur: "slower … cinematic … always focused on something or moving to something"): the match lands on the ticket
//   stack (matchPose: the stack where the balance's was, 21 % of the frame, left of centre); ONE slow crane back and up as "$3,600 in." is
//   said, landing on the stack with its IN plaque in front and the empty place for the cash on the right; ONE slow rise right with the cash
//   as it pours on "$6,300", framing both stacks and both plaques; then the seal dive (unchanged: the matched cut into company).
//   PUSH.a2/b2 start 4 f later than rev 4 (852 → 874): the BACK plaque has landed (848) and stays in view a few frames longer. The pose on
//   the cut (882) is unchanged: from b2 on, the a2 shot sits exactly on axisPose(D2), so a3's geometric push is the solved one.
export const M1 = [-0.1, 10.2, 11.2, 0.05, 0.1, 0.5, 74];
export const M2 = [0.3, 9.8, 11.2, 0.3, 0.4, 0.2, -16, 6];
const toKitchen = (p) => W([p[0] + TKX, p[1], p[2]]);
const shots = () => {
  const t = T();
  return [
    { a: t.cut, b: t.cut, cut: true, ...matchPose(toKitchen) },                                                  // the match (frame cut + 1)
    { a: t.cut + 3, b: t.cut + 3 + M1[6], pos: W([M1[0], M1[1], M1[2]]), target: W([M1[3], M1[4], M1[5]]), fov: 40 },   // crane up and over: IN
    { a: t.in63 + M2[6], b: PUSH.a2 + M2[7], pos: W([M2[0], M2[1], M2[2]]), target: W([M2[3], M2[4], M2[5]]), fov: 40 },       // rise right with the cash: BACK
    { a: PUSH.a2, b: PUSH.b2, ...axisPose(PUSH.D2) },                                                            // turn onto the seal's axis
    { a: PUSH.a3, b: PUSH.b3, ...axisPose(PUSH.D1) }                                                             // the push (still moving at the cut)
  ];
};
// ── the annotations ───────────────────────────────────────────────────────────────────────────────────────────────────────
const Vignette = () => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
    background: "radial-gradient(120% 75% at 50% 42%, rgba(0,12,30,0) 55%, rgba(0,12,30,0.6) 100%), linear-gradient(180deg, rgba(0,12,30,0) 62%, rgba(0,12,30,0.6) 100%)" }} />
);
// ★ rev 2 TAGS (Timur: "they come up late … PROFIT … is not seen at all"): WINFALL TICKETS is in as the flight lands on the stack and
//   holds through "$3,600"; PROFIT comes in on "$6,300" as the $1 bundles start to pour (fully in at 845; they pass the tickets' level at ≈ 852,
//   20 f before "back."), its leader riding up the cash to the top bundle, and fades out over the push's last 10 f (gone at the cut).
export const TAGS = () => {
  const t = T();
  return { tickets: { at: TEST_ARRIVE === "cut" ? t.jerry + 8 : t.jerry + 26, out: t.in36 + 42 }, profit: { at: t.in63, out: t.out - 11 } };
};
const Overlay = ({ f, P }) => {
  const t = T(), tg = TAGS();
  const tkSide = P([TKX - 0.66, TK_TOP * 0.62, 0.8]);
  const sw = sealWorld().p;
  const layers = Math.floor(Math.min(CS_N, Math.max(0, (f - t.in63 - 2) / POUR + 1)) / 2);
  const profitP = P([sw[0] + 0.12, Math.max(TK_TOP + 0.25, Math.min(sw[1], layers * TH + 0.02)), sw[2] - 0.02]);
  // ★ rev 5: the 2-D "$3,600 IN" / "$6,300 BACK" counters and the Net pill are gone — the figures are the table plaques (Scene)
  return (
    <>
      <Tag text="Winfall tickets" at={tg.tickets.at} out={tg.tickets.out} x={60} y={700} to={tkSide.behind ? null : tkSide} size={28} />
      <Tag text="Profit" at={tg.profit.at} out={tg.profit.out} x={700} y={1070} to={profitP.behind ? null : profitP} size={30} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("ee_click_click_01", t.in36 + 24, 6, 0.3),                 // the IN plaque's drums come to rest
    cueAt("ee_click_click_01", t.in63 + 10, 6, 0.3),                 // the BACK plaque's drums come to rest
    cueAt("whooshsoft", (t.in63 + M2[6] + PUSH.a2 + M2[7]) / 2 - 8, 30, 0.25),   // the camera rises with the pour
    ...Array.from({ length: 8 }, (_, k) => cueAt("thud", Math.round(csLand(t, k * 8)), 8, 0.22)),   // bundles landing
    cueAt("ee_whoosh_fast_small_whoosh_01", t.out - 27, 12, 0.45)    // the push onto the bill (rev 5: its fastest frame is ≈ 854)
  ];
};
// rev 5: the key leads (2.6, cool, from the upper left and a little behind: the stacks' shadows fall right onto the cloth, in view), less fill
export const ST = { id: "test", origin: TEST_ORIGIN, from: T().cut - 8, to: T().out - 1, light: { shadowBox: 6.5, keyI: 2.6, key: [-10, 13, -2.5], fillI: 0.24, rimI: 0.75 }, shots, Scene, Overlay, sfx };
