// @ts-nocheck
// ★ V38 station TEST (builder B): "Jerry tried it." (738–761) "$3,600 in." (770–830) "$6,300 back." (833–880)
//   A kitchen table at night (1 unit = 10 cm, the table top is y 0): a Formica top under a warm table lamp, the blue-hour street in
//   the window behind. Jerry's Winfall tickets stand on the left as 36 rubber-banded bundles of 100 (two per layer, 18 layers);
//   on "$3,600" the count rolls and a light line is drawn from the stack's top across the table — the level to beat. On "$6,300"
//   63 strapped bundles of $1 bills ($100 a strap, the ABA blue) pour down out of the top of the frame onto the right and stack to
//   31½ layers: 1.75 × the tickets, the real ratio. The 27 bundles above the line light up in the house blue: +$2,700 (the pill).
//   ARRIVAL: a cut (rolldown pushes into its ticket stack) onto a macro of the top ticket, pulling back to reveal the table.
//   DEPARTURE: a push down onto the top $1 bill (it fills the frame) → company cuts in on a matching macro of an engraved certificate.
import React, { useMemo } from "react";
import * as THREE from "three";
import { ease, easeOut, rnd, clamp01, Sky, Glow, canvasTex } from "./kit";
import { Tag, Counter, Pill } from "./overlays";
import { wf, wEnd } from "./take";
import { cueAt } from "../bnx/SfxLayer";
import { Room, Outside, TableLamp, Mug, Notepad, formicaTex, ticketFaceTex, edgeTex, billFaceTex, strapTex } from "./st_test_props";

export const TEST_ORIGIN = [600, 0, 0];
// ARRIVAL: "cut" (rolldown's last ~16 f push INTO its ticket stack; this station lands on a matching macro of a ticket) or "fly"
export const TEST_ARRIVE = "cut";
export const T = () => {
  const jerry = wf("jerry", 2), in36 = wf("$3,600"), inEnd = wEnd("in."), in63 = wf("$6,300"), back = wf("back."), backEnd = wEnd("back.");
  return { jerry, cut: jerry - 2, in36, inEnd, in63, back, backEnd, out: backEnd + 3 };   // out: the frame company's cut lands on
};
// ── the stacks ────────────────────────────────────────────────────────────────────────────────────────────────────────────
const TH = 0.11;                                  // one bundle of 100 (thermal tickets or $1 bills): 1.1 cm
const TKX = -1.3, CSX = 1.3;                     // stack centres (x); both on z 0
const TK_N = 36, CS_N = 63, LINE_Y = (TK_N / 2) * TH;   // 18 layers of tickets: the level line
const tkPose = (i) => { const L = Math.floor(i / 2), s = i % 2; return [TKX + (s ? 0.34 : -0.34) + (rnd(i + 3) - 0.5) * 0.04, L * TH + TH / 2, (rnd(i + 8) - 0.5) * 0.05, (rnd(i + 1) - 0.5) * 0.05]; };
const csRest = (i) => { const L = Math.floor(i / 2), s = i % 2; return [CSX + (rnd(i + 21) - 0.5) * 0.05, L * TH + TH / 2, (s ? -0.34 : 0.34) + (rnd(i + 27) - 0.5) * 0.04, (rnd(i + 33) - 0.5) * 0.06]; };
const csLand = (t, i) => t.in63 + 2 + i * 0.48;   // the frame bundle i lands (the last, #62, lands ≈ 31 f after "$6,300")
const FALL = 9, DROP = 2.6;
const csPose = (t, f, i) => {
  const r = csRest(i), L = csLand(t, i);
  if (f < L - FALL) return null;
  const k = clamp01((f - (L - FALL)) / FALL);
  const y = r[1] + DROP * (1 - k) * (1 - k);
  const settle = f > L ? 0.012 * Math.exp(-(f - L) / 2.5) * Math.sin((f - L) * 1.9) : 0;
  return [r[0], y + settle, r[2], r[3] + (1 - k) * 0.5 * (rnd(i + 5) - 0.5), k];
};
const Stacks = ({ f, t }) => {
  const geo = useMemo(() => ({ tk: new THREE.BoxGeometry(0.66, TH, 1.56), cs: new THREE.BoxGeometry(1.56, TH, 0.66), band: new THREE.BoxGeometry(0.69, TH * 1.08, 0.05), strap: new THREE.BoxGeometry(0.34, TH * 1.08, 0.675) }), []);
  const mats = useMemo(() => {
    const tf = ticketFaceTex(), te = edgeTex("tk", "#E7ECF2", "rgba(120,135,155,0.35)");
    const bf = billFaceTex(), be = edgeTex("cs", "#B9C6BB", "rgba(50,70,64,0.45)"), st = strapTex();
    const side = (map) => new THREE.MeshStandardMaterial({ map, roughness: 0.8, color: "#D0D9E5", envMapIntensity: 0.45 });
    const tk = [side(te), side(te), new THREE.MeshStandardMaterial({ map: tf, roughness: 0.55, color: "#E0E7F0", envMapIntensity: 0.5 }), side(te), side(te), side(te)];
    const csMat = (glow) => {
      const e = glow ? { emissive: new THREE.Color("#7FB4F2"), emissiveIntensity: 0 } : {};
      const s = new THREE.MeshStandardMaterial({ map: be, roughness: 0.85, ...e });
      return [s, s, new THREE.MeshStandardMaterial({ map: bf, roughness: 0.7, ...e }), s, s, s];
    };
    const cs = csMat(false);
    // one material set per cash bundle: each fades in over its fall (≥ 8 f), and those above the tickets' level carry the light
    const csEach = Array.from({ length: CS_N }, (_, i) => csMat(Math.floor(i / 2) >= 18));
    const strapSide = new THREE.MeshStandardMaterial({ color: "#2D62B0", roughness: 0.6 });
    const band = new THREE.MeshStandardMaterial({ color: "#8FB1D9", roughness: 0.35 });
    return { tk, csEach, strapSide, st, band };
  }, []);
  // the light climbs the bundles above the tickets' level, layer by layer, once they have landed
  mats.csEach.forEach((m, i) => {
    const L = Math.floor(i / 2);
    if (L < 18) return;
    const land = csLand(t, Math.min(CS_N - 1, L * 2 + 1));
    const k = ease(f, land + 2, land + 12) * (0.7 + 0.3 * ease(f, t.back + 6, t.backEnd));
    m[0].emissiveIntensity = 1.0 * k; m[2].emissiveIntensity = 1.1 * k;
  });
  return (
    <group>
      {Array.from({ length: TK_N }, (_, i) => {
        const [x, y, z, ry] = tkPose(i);
        return (
          <group key={"t" + i} position={[x, y, z]} rotation-y={ry}>
            <mesh geometry={geo.tk} material={mats.tk} castShadow receiveShadow />
            <mesh geometry={geo.band} material={mats.band} position={[0, 0, -0.45]} />
            <mesh geometry={geo.band} material={mats.band} position={[0, 0, 0.45]} />
          </group>
        );
      })}
      {Array.from({ length: CS_N }, (_, i) => {
        const p = csPose(t, f, i);
        if (!p) return null;
        const m = mats.csEach[i], op = clamp01(p[4] * 1.15);
        m.forEach((q) => { q.transparent = op < 0.999; q.opacity = op; });
        return (
          <group key={"c" + i} position={[p[0], p[1], p[2]]} rotation-y={p[3]}>
            <mesh geometry={geo.cs} material={m} castShadow={op > 0.6} receiveShadow />
            <mesh geometry={geo.strap} position={[0, 0, 0]} scale={[1, 1, 1]}>
              <meshStandardMaterial attach="material-0" color="#2D62B0" roughness={0.6} transparent={op < 0.999} opacity={op} />
              <meshStandardMaterial attach="material-1" color="#2D62B0" roughness={0.6} transparent={op < 0.999} opacity={op} />
              <meshStandardMaterial attach="material-2" map={mats.st} roughness={0.55} transparent={op < 0.999} opacity={op} />
              <meshStandardMaterial attach="material-3" color="#2D62B0" roughness={0.6} transparent={op < 0.999} opacity={op} />
              <meshStandardMaterial attach="material-4" color="#2D62B0" roughness={0.6} transparent={op < 0.999} opacity={op} />
              <meshStandardMaterial attach="material-5" color="#2D62B0" roughness={0.6} transparent={op < 0.999} opacity={op} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
// the level line: drawn from the tickets' top across to the cash on "in." — a row of light-blue dashes at LINE_Y
const LevelLine = ({ f, t }) => {
  const k = ease(f, t.inEnd - 14, t.inEnd + 2);
  if (k <= 0.001) return null;
  const x0 = TKX - 0.75, x1 = CSX + 1.05, n = 22, len = (x1 - x0) / n;
  return (
    <group position={[0, LINE_Y + 0.012, 0.86]}>
      {Array.from({ length: n }, (_, i) => {
        const a = clamp01(k * n - i);
        if (a <= 0) return null;
        return <mesh key={i} position={[x0 + (i + 0.5) * len, 0, 0]} scale={[a, 1, 1]}><boxGeometry args={[len * 0.62, 0.045, 0.045]} /><meshBasicMaterial color="#CFE2FA" toneMapped={false} transparent opacity={1} /></mesh>;
      })}
      <Glow position={[x0 + (x1 - x0) * k, 0, 0.02]} size={0.5} color="#B3CEEF" opacity={0.8 * (1 - ease(f, t.inEnd + 2, t.inEnd + 12))} />
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
      <mesh position={[0, 0.004, -1]} rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[16.6, 10.6]} /><meshStandardMaterial map={gm} roughness={0.92} envMapIntensity={0.35} /></mesh>
      {[[0, 4.3, 16.6, 0], [0, -6.3, 16.6, 0], [8.3, -1, 10.6, 1], [-8.3, -1, 10.6, 1]].map(([x, z, len, side], i) =>
        <mesh key={i} position={[x, -1.25, z]} rotation-y={side ? Math.PI / 2 : 0} receiveShadow castShadow><boxGeometry args={[len, 2.5, 0.04]} /><meshStandardMaterial map={gmSide} roughness={0.92} envMapIntensity={0.35} /></mesh>)}
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
      <TableLamp position={[-3.4, 0, -6.6]} scale={0.75} />
      <Notepad position={[-4.3, 0, 1.9]} ry={0.35} />
      <Mug position={[4.6, 0, 1.7]} ry={-0.6} />
      <Stacks f={f} t={t} />
      <LevelLine f={f} t={t} />
      {/* the glint that runs up the ticket stack as "$3,600" is read */}
      {f > t.in36 - 2 && f < t.in36 + 26 && <Glow position={[TKX + 0.55, LINE_Y * ease(f, t.in36, t.in36 + 22), 0.85]} size={0.9} color="#DCE8FA" opacity={0.7 * Math.sin(Math.PI * clamp01((f - t.in36 + 2) / 28))} />}
    </group>
  );
};
// ── the camera (WORLD coords) ─────────────────────────────────────────────────────────────────────────────────────────────
const W = (p) => [p[0] + TEST_ORIGIN[0], p[1] + TEST_ORIGIN[1], p[2] + TEST_ORIGIN[2]];
const shots = () => {
  const t = T();
  // the push onto the top bill: bundle 62 lies at the front (z +0.34) of layer 31
  const topY = 32 * TH;
  const wide = { pos: W([-1.5, 5.0, 9.4]), target: W([-0.7, 0.6, -1]), fov: 40 };   // the ticket stack, the lamp, the window
  const arrive = TEST_ARRIVE === "cut"
    ? [{ a: t.cut, b: t.cut + 1, cut: true, pos: W([TKX + 0.05, LINE_Y + 1.25, 0.75]), target: W([TKX, LINE_Y, 0.0]), fov: 40 },   // macro on the top ticket
       { a: t.cut + 2, b: t.in36 + 4, ...wide }]                                                                                      // pull back
    : [{ a: t.jerry - 20, b: t.jerry + 12, ...wide }];                                                                                // or: the flight lands on the wide
  return [
    ...arrive,
    { a: t.in36 + 4, b: t.in63 - 2, pos: W([-0.5, 5.4, 10.6]), target: W([-0.1, 0.7, -1]), fov: 40 },     // drift right as the line is drawn
    { a: t.in63 - 2, b: t.back + 4, pos: W([0.8, 6.6, 11.2]), target: W([0.3, 1.3, -1]), fov: 40 },       // rise with the cash
    { a: t.backEnd - 16, b: t.out, pos: W([CSX - 0.42, topY + 0.95, 0.66]), target: W([CSX - 0.43, topY, 0.34]), fov: 40 }   // push onto the top bill
  ];
};
// ── the annotations ───────────────────────────────────────────────────────────────────────────────────────────────────────
const Vignette = () => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
    background: "radial-gradient(120% 75% at 50% 42%, rgba(0,12,30,0) 55%, rgba(0,12,30,0.6) 100%), linear-gradient(180deg, rgba(0,12,30,0) 62%, rgba(0,12,30,0.6) 100%)" }} />
);
const Overlay = ({ f, P }) => {
  const t = T();
  const tk = P([TKX, LINE_Y + 0.3, 0]);
  const cs = P([CSX, Math.max(LINE_Y, (Math.floor(Math.min(CS_N, Math.max(0, (f - t.in63 - 2) / 0.48 + 1)) / 2)) * TH) + 0.3, 0]);
  const tkSide = P([TKX - 0.66, LINE_Y * 0.62, 0.8]);
  const profitL = P([CSX - 0.78, LINE_Y + 0.75, 0.34]);
  const landed = Math.max(0, Math.min(27, Math.floor((f - csLand(t, 36)) / 0.48) + 1));
  const clampY = (y) => Math.max(390, Math.min(600, y));
  return (
    <>
      {/* the vignette is global (Main.tsx) */}
      <Tag text="Winfall tickets" at={t.jerry + 8} out={t.in36 - 6} x={70} y={clampY(tkSide.y - 280)} to={tkSide.behind ? null : tkSide} size={28} />
      <Counter at={t.in36 - 2} x={Math.max(250, Math.min(420, tk.x))} y={clampY(tk.y - 250)} value={3600} prefix="$" label="In" size={104} countDur={24} out={t.backEnd - 16} />
      <Counter at={t.in63 - 2} x={Math.max(660, Math.min(830, cs.x))} y={clampY(cs.y - 250)} value={6300} prefix="$" label="Back" size={104} countDur={30} out={t.backEnd - 14} />
      <Tag text="Profit" at={t.back - 2} out={t.backEnd - 14} x={Math.max(300, profitL.x - 300)} y={Math.max(clampY(tk.y - 250) + 190, Math.min(900, profitL.y - 40))} to={profitL.behind ? null : profitL} size={28} />
      <Pill at={csLand(t, 36) + 1} out={t.out + 2} x={1040} y={292} label="Net" value={"+$" + (landed * 100).toLocaleString("en-US")} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    TEST_ARRIVE === "cut" ? cueAt("whooshsoft", t.cut + 14, 24, 0.45) : cueAt("whooshlong", t.jerry - 6, 34, 0.5),   // the pull-back off the ticket / the flight in
    cueAt("pingshort", t.in36, 12, 0.4),                             // the count lands
    cueAt("ee_click_click_01", t.inEnd - 10, 6, 0.35),               // the line is drawn
    cueAt("whooshlong", t.in63 + 4, 34, 0.45),                       // the camera rises with the pour
    ...Array.from({ length: 8 }, (_, k) => cueAt("thud", Math.round(csLand(t, k * 8)), 8, 0.22)),   // bundles landing
    cueAt("coin", t.back + 2, 16, 0.4),                              // the profit lights
    cueAt("ee_whoosh_fast_small_whoosh_01", t.out - 8, 12, 0.5)      // the push onto the bill
  ];
};
export const ST = { id: "test", origin: TEST_ORIGIN, from: TEST_ARRIVE === "cut" ? T().cut + 1 : T().jerry - 22, to: T().out - 1, light: { shadowBox: 9, keyI: 0.85, fillI: 0.3, rimI: 0.9 }, shots, Scene, Overlay, sfx };
