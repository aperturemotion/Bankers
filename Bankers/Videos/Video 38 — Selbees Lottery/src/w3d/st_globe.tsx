// @ts-nocheck
// ★ V38 station GLOBE (builder C): "They weren't alone. A group started by MIT students played it too. In 2011, the Boston Globe broke
//   the story, and many suspected a rigged game."
//   ARRIVAL (cut: true, a = 1356): the road station pushed into one $2 slip in the Selbees' trunk until it filled the frame; we land on
//   the IDENTICAL slip, framed identically, on top of a second stack of ticket tubs — and pull back: the stack stands on a stone plaza
//   at night in front of a domed neoclassical building in the spirit of MIT's Great Dome (generic, unlabelled). "They weren't alone."
//   1412  "MIT": tag MIT GROUP on the stack; the camera drifts across it; on "played it too" two more tubs drop onto it.
//   1474  "In 2011": a newspaper falls onto the plaza in front of the stack as the camera cranes up over it; the masthead
//         "The Boston Globe" (text only, a neutral serif) reads on "Boston Globe"; the page below is blurred past reading.
//   1540  "the story": tag JULY 2011 on the dateline; the camera eases down toward the masthead.
//   1558  "and many suspected": the camera rises and pulls back over paper, stack and dome; on "rigged" a red RIGGED? tag lands on the
//         stack with a faint red light, then dims. DEPARTURE: the camera ends high and wide, facing the way the flight to the state
//         house goes (the state station's first shot takes it from ~1597).
import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { canvasTex, ease, easeOut, rnd, clamp01, Sky, Glow } from "./kit";
import { Tag } from "./overlays";
import { cueAt } from "../bnx/SfxLayer";
import { BODY } from "./fonts3d";
import { wa, wAt, undrift, Tub, TUB, heroCam, Stars } from "./st_road_parts";
import { ROAD_CUT } from "./st_road";
import { DomeBuilding } from "./st_globe_build";
import { Newspaper, PAPER_H, PAPER_W, DATE_Y } from "./st_globe_paper";

export const GLOBE_O = [1500, 0, 0];
const ROT = (p) => [p[2], p[1], -p[0]];        // the same quarter turn as the road (camera looks down world −z)
const A = (p) => { const r = ROT(p); return [r[0] + GLOBE_O[0], r[1] + GLOBE_O[1], r[2] + GLOBE_O[2]]; };
const FROM = ROAD_CUT + 1;
const T = () => ({
  alone: wa("alone.", 1340), mit: wa("mit", 1340), played: wa("played", 1340), too: wa("too.", 1340), y2011: wa("2011,", 1460),
  boston: wa("boston", 1460), globe: wa("globe", 1460), broke: wa("broke", 1460), story: wa("story,", 1460), many: wa("many", 1460),
  rigged: wa("rigged", 1460), game: wa("game.", 1590), gameEnd: wAt("game.", 1590).end
});
// the stack: a plastic pallet, two layers of closed tubs, a third layer with the open tub on the front-left (the hero slip)
const PALLET_Y = 0.14, LAYER = TUB.y + 0.02;
const slot = (i, j, layer) => [i * 0.24, PALLET_Y + layer * LAYER, j * 0.25];
export const G_TUB = slot(-1, -1, 2);
const PAPER_AT = [-1.15, 0, -0.2];
const pavingTex = () => canvasTex("g_paving", 512, 512, (c, w, h) => {
  c.fillStyle = "#3A4A60"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { const g = 50 + rnd(i) * 40; c.fillStyle = `rgba(${g},${g + 10},${g + 26},0.35)`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  c.strokeStyle = "rgba(10,18,30,0.75)"; c.lineWidth = 3;
  for (let k = 0; k <= 4; k++) { c.beginPath(); c.moveTo(0, k * 128); c.lineTo(w, k * 128); c.stroke(); }
  for (let r = 0; r < 4; r++) for (let k = 0; k <= 2; k++) { const x = k * 256 + (r % 2) * 128; c.beginPath(); c.moveTo(x, r * 128); c.lineTo(x, r * 128 + 128); c.stroke(); }
});
const Lamp = ({ p }) => (
  <group position={p}>
    <mesh position={[0, 2.1, 0]} castShadow><cylinderGeometry args={[0.06, 0.1, 4.2, 10]} /><meshStandardMaterial color="#1B2636" metalness={0.6} roughness={0.4} /></mesh>
    <mesh position={[0, 4.35, 0]}><sphereGeometry args={[0.24, 16, 12]} /><meshStandardMaterial color="#FFE6BA" emissive="#FFC97A" emissiveIntensity={2.6} /></mesh>
    <Glow position={[0, 4.35, 0]} size={1.8} color="#FFC97A" opacity={0.6} />
  </group>
);
// the arriving tubs on "played it too": each drops from above and settles with a small bounce
const dropY = (f, at) => { const k = clamp01((f - (at - 12)) / 12); const b = f > at ? 0.03 * Math.abs(Math.sin((f - at) / 2.2)) * Math.exp(-(f - at) / 5) : 0; return 3.2 * (1 - k * k) + b; };   // falls (gravity), lands on `at`, a small bounce
const paperPose = (f, t) => {
  const a = t.y2011 + 4, b = t.boston - 2;
  const k = ease(f, a, b);
  return { y: (1 - k) * (1 - k) * 3.2, yaw: (1 - k) * 1.4, tilt: (1 - k) * 0.5 * Math.sin((f - a) / 4), slide: (1 - easeOut(f, b, b + 10)) * 0.0 + (1 - k) * 0.8, vis: f >= a - 1 };
};
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  const paving = useMemo(pavingTex, []);
  paving.wrapS = paving.wrapT = THREE.RepeatWrapping; paving.repeat.set(40, 40);
  const floods = useMemo(() => [0].map(() => { const o = new THREE.Object3D(); o.position.set(25, 6, 0); return o; }), []);
  const pp = paperPose(f, t);
  const red = ease(f, t.rigged - 2, t.rigged + 6) * (1 - 0.75 * ease(f, t.gameEnd - 4, t.gameEnd + 10));
  const d1 = dropY(f, t.played + 2), d2 = dropY(f, t.too + 0);
  return (
    <group rotation-y={Math.PI / 2}>
      <Sky zenith="#020A1A" mid="#06193A" horizon="#24508A" glowAt={0.5} />
      <Stars />
      <mesh rotation-x={-Math.PI / 2} position={[10, 0, 0]} receiveShadow><planeGeometry args={[200, 200]} /><meshStandardMaterial map={paving} roughness={0.55} metalness={0.1} envMapIntensity={0.3} color="#8C9BB2" /></mesh>
      {/* a long reflecting band of darker stone leading to the steps */}
      <mesh rotation-x={-Math.PI / 2} position={[14, 0.004, 0]} receiveShadow><planeGeometry args={[30, 7]} /><meshStandardMaterial color="#1D2A3E" roughness={0.3} metalness={0.2} /></mesh>
      <group position={[26, 0, 0]} scale={0.6}><DomeBuilding /></group>
      {floods.map((o, i) => <primitive key={"ft" + i} object={o} />)}
      <spotLight position={[17, 0.4, 0]} target={floods[0]} angle={0.75} penumbra={0.8} intensity={28} distance={30} decay={1.3} color="#DCE9FF" />
      {[[6, 6.5], [6, -6.5], [16, 6.5], [16, -6.5], [-3, 6.5]].map(([x, z], i) => <Lamp key={i} p={[x, 0, z]} />)}
      <pointLight position={[2.5, 4.2, 4.0]} intensity={18} distance={14} decay={1.6} color="#FFCF96" />
      {/* dark trees framing the court */}
      {[[8, 13], [14, 14], [20, 13], [8, -13], [14, -14], [20, -13], [26, 15], [26, -15]].map(([x, z], i) => (
        <group key={"tr" + i} position={[x, 0, z]}>
          <mesh position={[0, 1.6, 0]}><cylinderGeometry args={[0.2, 0.28, 3.2, 8]} /><meshStandardMaterial color="#0A1828" roughness={0.9} /></mesh>
          <mesh position={[0, 5.2 + rnd(i) * 1.2, 0]} scale={[1, 1.15, 1]} castShadow><icosahedronGeometry args={[3 + rnd(i + 4), 1]} /><meshStandardMaterial color="#0C2036" roughness={0.95} flatShading /></mesh>
        </group>
      ))}
      {/* the MIT group's stack */}
      <mesh position={[0, PALLET_Y / 2, 0]} castShadow receiveShadow><boxGeometry args={[1.0, PALLET_Y, 1.1]} /><meshStandardMaterial color="#1F3556" roughness={0.6} /></mesh>
      {[-0.42, 0, 0.42].map((z) => <mesh key={z} position={[0, 0.03, z]}><boxGeometry args={[1.02, 0.06, 0.12]} /><meshStandardMaterial color="#162843" roughness={0.6} /></mesh>)}
      {[0, 1].map((L) => [-1, 1].map((i) => [-1, 1].map((j) => <Tub key={L + "_" + i + "_" + j} position={slot(i, j, L)} rotY={(rnd(L * 9 + i * 3 + j) - 0.5) * 0.06} glow={0} seed={L * 4 + (i + 1) + (j + 1) * 2} />)))}
      <Tub position={G_TUB} open hero glow={0} seed={3} />
      <Tub position={slot(1, 1, 2)} rotY={0.04} seed={2} />
      <group position={[0, d1, 0]} visible={f > t.played - 10}><Tub position={slot(1, -1, 2)} rotY={-0.05} seed={1} /></group>
      <group position={[0, d2, 0]} visible={f > t.too - 12}><Tub position={slot(-1, 1, 3)} rotY={0.08} seed={3} /></group>
      {/* the faint red light of the suspicion, then it dims */}
      <Glow position={[G_TUB[0] - 0.1, G_TUB[1] + 0.35, G_TUB[2]]} size={1.3} color="#FF3B3B" opacity={0.45 * red} />
      {/* the newspaper */}
      {pp.vis && (
        <group position={[PAPER_AT[0] - pp.slide, pp.y, PAPER_AT[2]]} rotation-y={pp.yaw} rotation-z={pp.tilt}>
          <Newspaper />
        </group>
      )}
    </group>
  );
};
const P_ = (dx, dy, dz) => [PAPER_AT[0] + dx, dy, PAPER_AT[2] + dz];
const shots = () => {
  const t = T();
  const close = heroCam(G_TUB, 0.19);
  return [
    { a: ROAD_CUT, b: ROAD_CUT, cut: true, pos: undrift(A(close.pos), FROM), target: A(close.target), fov: 34 },            // the matching close-up
    { a: FROM + 1, b: t.alone + 18, pos: A([-3.6, 0.55, -0.55]), target: A([10, 4.4, 0.35]), fov: 40 },                     // pull back, low: stack and dome
    { a: t.mit - 6, b: t.too + 8, pos: A([-3.9, 0.7, 0.9]), target: A([10, 4.6, -0.6]), fov: 40 },                          // drift across the stack
    { a: t.y2011 - 2, b: t.boston + 4, pos: A(P_(-2.3, 3.1, 0.25)), target: A(P_(0.75, 0, 0)), fov: 36 },                  // up over the paper
    { a: t.story - 10, b: t.many + 6, pos: A(P_(-1.5, 2.3, 0.1)), target: A(P_(0.4, 0, 0)), fov: 36 },                     // ease toward the masthead
    { a: t.many + 6, b: t.rigged + 8, pos: A([-3.6, 1.7, -2.2]), target: A([-0.2, 0.85, -0.2]), fov: 38 }                  // back to the stack: RIGGED?
  ];
};
const RedTag = ({ text, at, dimAt, out, x, y, to }) => {
  const f = useCurrentFrame();
  const kIn = ease(f, at, at + 8), kOut = ease(f, out, out + 10), dim = ease(f, dimAt, dimAt + 10);
  const vis = kIn * (1 - kOut);
  if (vis <= 0.001) return null;
  const line = to ? ease(f, at - 4, at + 6) : 0;
  const sx = x + 12, sy = y + 30 * 0.9;
  const op = vis * (1 - 0.6 * dim);
  return (
    <>
      {to && line > 0.001 && (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none", opacity: op }}>
          <line x1={sx} y1={sy} x2={sx + (to.x - sx) * line} y2={sy + (to.y - sy) * line} stroke="#FFD9D9" strokeWidth={2} strokeOpacity={0.9} />
          <circle cx={to.x} cy={to.y} r={7 * clamp01((line - 0.85) / 0.15)} fill="#FFFFFF" stroke="#D93A3A" strokeWidth={3} />
        </svg>
      )}
      <div style={{ position: "absolute", left: x, top: y, opacity: op, transform: `translateY(${(1 - kIn) * 14}px) scale(${1 + 0.08 * (1 - kIn)})`, transformOrigin: "left center",
        display: "flex", alignItems: "stretch", background: "rgba(40,6,10,0.9)", borderRadius: 6, boxShadow: "0 6px 24px rgba(0,8,20,0.45)", overflow: "hidden", filter: `saturate(${1 - 0.7 * dim})` }}>
        <div style={{ width: 5, background: "#D93A3A" }} />
        <div style={{ padding: "7px 13px", fontFamily: BODY, fontWeight: 800, fontSize: 34, letterSpacing: 4, color: "#FFE1E1", lineHeight: 1, whiteSpace: "nowrap" }}>{text}</div>
      </div>
    </>
  );
};
const Overlay = ({ f, P: P0 }) => {
  const t = T();
  const P = (p) => P0(ROT(p));
  const stack = P([G_TUB[0] - 0.05, G_TUB[1] + 0.36, G_TUB[2] + 0.05]);
  const pp = paperPose(f, t);
  const date = P([PAPER_AT[0] - pp.slide + PAPER_H * (0.5 - 0.205), pp.y + 0.01, PAPER_AT[2] - PAPER_W * 0.32]);
  return (
    <>
      <Tag text="MIT group" at={t.mit} out={t.y2011 - 6} x={110} y={420} to={stack.behind ? null : stack} />
      <Tag text="July 2011" at={t.story} out={t.many + 14} x={600} y={330} to={date.behind ? null : date} />
      <RedTag text="RIGGED?" at={t.rigged - 2} dimAt={t.rigged + 12} out={t.rigged + 24} x={150} y={360} to={stack.behind ? null : stack} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("whooshlong", FROM + 14, 30, 0.45),                     // the pull back off the slip
    cueAt("ee_click_click_01", t.mit + 2, 10, 0.4),               // MIT GROUP
    cueAt("thud", t.played + 2, 12, 0.45),                        // a tub lands
    cueAt("thud", t.too, 12, 0.4),                                // another
    cueAt("whooshsoft", t.y2011 + 12, 24, 0.45),                  // up over the plaza as the paper falls
    cueAt("ee_paper_paper_tear_01", t.boston - 2, 16, 0.35),      // the paper lands
    cueAt("pingshort", t.story + 2, 18, 0.35),                    // JULY 2011
    cueAt("whooshsoft", t.many + 22, 24, 0.4),                    // up and back
    cueAt("sub", t.rigged, 26, 0.5)                               // RIGGED?
  ];
};
export const ST = { id: "globe", origin: GLOBE_O, from: FROM, to: 1630, light: { keyI: 1.3, rimI: 1.2, shadowBox: 9, fillI: 0.34 }, shots, Scene, Overlay, sfx };
