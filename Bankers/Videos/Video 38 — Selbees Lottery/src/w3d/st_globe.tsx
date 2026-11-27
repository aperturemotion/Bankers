// @ts-nocheck
// ★ V38 station GLOBE (builder C): "They weren't alone. A group started by MIT students played it too. In 2011, the Boston Globe broke
//   the story, and many suspected a rigged game."
//   ARRIVAL (cut: true, a = 1356): the road station pushed into one $2 slip in the Selbees' trunk until it filled the frame; we land on
//   the IDENTICAL slip, framed identically, on top of a second stack of ticket tubs — and pull back: the stack stands on a stone plaza
//   at night in front of a domed neoclassical building in the spirit of MIT's Great Dome (generic, unlabelled). "They weren't alone."
//   1412  "MIT": tag MIT GROUP on the stack; the camera drifts across it; on "played it too" two more totes are lowered into the
//         top layer's two empty slots (rev 2: none hangs over an empty slot any more; one eased path each, then they stay).
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
import { LABEL_STYLE } from "./label_style";
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
const PAPER_AT = [-1.3, 0, -0.2];   // rev 4b: 15 cm further from the pallet, so the table under the paper clears it
const TABLE_H = 0.74, TABLE_TOP = [1.5, 1.0];   // a folding table in front of the stack: the paper lands on its top
// rev 4 (Timur: "add some texture to the ground … right now it's just a gray plain floor"): Killian Court's granite paving — slabs of
//   1 m × 0.5 m in running bond, each its own tone of blue-grey granite with mica speckle, crisp dark joints with a lit upper arris;
//   one tile = 4 m × 4 m (repeat 50 over the 200-m ground), the same canvas drives a bump map
const pavingTex = () => canvasTex("g_paving2", 1024, 1024, (c, w, h) => {
  c.fillStyle = "#1C2636"; c.fillRect(0, 0, w, h);
  const RH = 128, SW = 256;
  for (let r = 0; r < 8; r++) for (let k = -1; k < 4; k++) {
    const x0 = k * SW + (r % 2) * (SW / 2), y0 = r * RH, id = r * 7 + k + 9;
    const g = 92 + Math.floor(rnd(id) * 34), b = 14 + Math.floor(rnd(id + 3) * 10);
    c.fillStyle = `rgb(${g - 6},${g + 2},${g + b})`; c.fillRect(x0 + 3, y0 + 3, SW - 6, RH - 6);
    // a soft tonal drift across the slab (the stone's own cloud)
    const gr = c.createLinearGradient(x0, y0, x0 + SW, y0 + RH); gr.addColorStop(0, `rgba(255,255,255,${0.03 + rnd(id + 5) * 0.05})`); gr.addColorStop(1, `rgba(0,0,0,${0.04 + rnd(id + 6) * 0.06})`);
    c.fillStyle = gr; c.fillRect(x0 + 3, y0 + 3, SW - 6, RH - 6);
    c.fillStyle = "rgba(220,232,250,0.22)"; c.fillRect(x0 + 3, y0 + 3, SW - 6, 2);           // the lit upper arris
    c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(x0 + 3, y0 + RH - 5, SW - 6, 2);
  }
  for (let i = 0; i < 60000; i++) {                                                         // granite speckle: dark grains and mica glints
    const x = rnd(i * 3 + 1) * w, y = rnd(i * 3 + 2) * h, q = rnd(i * 3 + 3);
    c.fillStyle = q < 0.55 ? "rgba(20,28,42,0.35)" : q < 0.93 ? "rgba(170,182,200,0.25)" : "rgba(235,242,255,0.55)";
    c.fillRect(x, y, q < 0.55 ? 2 : 1.5, q < 0.55 ? 2 : 1.5);
  }
});
const FoldingTable = ({ p }) => {
  const [W, D] = TABLE_TOP, H = TABLE_H, T = 0.035;
  const steel = <meshStandardMaterial color="#2A3446" metalness={0.75} roughness={0.35} />;
  return (
    <group position={p}>
      <mesh position={[0, H - T / 2, 0]} castShadow receiveShadow><boxGeometry args={[W, T, D]} /><meshStandardMaterial color="#6E5038" roughness={0.45} envMapIntensity={0.6} /></mesh>
      <mesh position={[0, H - T - 0.002, 0]}><boxGeometry args={[W + 0.012, 0.006, D + 0.012]} /><meshStandardMaterial color="#3A2A1E" roughness={0.6} /></mesh>
      {[-1, 1].map((s) => <mesh key={"ax" + s} position={[0, H - T - 0.05, s * (D / 2 - 0.05)]} castShadow><boxGeometry args={[W - 0.12, 0.08, 0.02]} /><meshStandardMaterial color="#5A3F2C" roughness={0.6} /></mesh>)}
      {[-1, 1].map((s) => <mesh key={"az" + s} position={[s * (W / 2 - 0.06), H - T - 0.05, 0]} castShadow><boxGeometry args={[0.02, 0.08, D - 0.12]} /><meshStandardMaterial color="#5A3F2C" roughness={0.6} /></mesh>)}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b], i) => (
        <mesh key={"lg" + i} position={[a * (W / 2 - 0.12), (H - T) / 2, b * (D / 2 - 0.1)]} rotation-x={b * 0.05} castShadow><cylinderGeometry args={[0.016, 0.016, H - T, 10]} />{steel}</mesh>
      ))}
      {[-1, 1].map((a) => <mesh key={"br" + a} position={[a * (W / 2 - 0.12), 0.22, 0]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.01, 0.01, D - 0.2, 8]} />{steel}</mesh>)}
      {[-1, 1].map((a) => <mesh key={"hg" + a} position={[a * (W / 2 - 0.12), H - T - 0.1, 0]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.012, 0.012, D - 0.22, 8]} />{steel}</mesh>)}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b], i) => <mesh key={"ft" + i} position={[a * (W / 2 - 0.12), 0.012, b * (D / 2 - 0.1)]}><cylinderGeometry args={[0.024, 0.024, 0.024, 10]} /><meshStandardMaterial color="#111821" roughness={0.8} /></mesh>)}
    </group>
  );
};
const WOOD = ["#B49A76", "#A88E6A", "#BFA582", "#9E8562", "#B39773", "#AA9070", "#B8A07C"];
const Pallet = () => {
  const H = PALLET_Y, top = 0.022, blk = H - 2 * top - 0.018;
  return (
    <group>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={"d" + i} position={[-0.45 + i * 0.15, H - top / 2, 0]} castShadow receiveShadow><boxGeometry args={[0.12, top, 1.1]} /><meshStandardMaterial color={WOOD[i]} roughness={0.85} /></mesh>
      ))}
      {[-0.47, 0, 0.47].map((z, j) => (
        <group key={"s" + j}>
          <mesh position={[0, H - top - 0.009, z]} castShadow receiveShadow><boxGeometry args={[1.0, 0.018, 0.1]} /><meshStandardMaterial color="#9A8160" roughness={0.85} /></mesh>
          {[-0.44, 0, 0.44].map((x) => <mesh key={x} position={[x, top + blk / 2, z]} castShadow receiveShadow><boxGeometry args={[0.12, blk, 0.1]} /><meshStandardMaterial color="#8E7656" roughness={0.9} /></mesh>)}
        </group>
      ))}
      {[-0.44, 0, 0.44].map((x, i) => <mesh key={"b" + i} position={[x, top / 2, 0]} castShadow receiveShadow><boxGeometry args={[0.12, top, 1.1]} /><meshStandardMaterial color={WOOD[i + 2]} roughness={0.85} /></mesh>)}
    </group>
  );
};
const Lamp = ({ p }) => (
  <group position={p}>
    <mesh position={[0, 2.1, 0]} castShadow><cylinderGeometry args={[0.06, 0.1, 4.2, 10]} /><meshStandardMaterial color="#1B2636" metalness={0.6} roughness={0.4} /></mesh>
    <mesh position={[0, 4.35, 0]}><sphereGeometry args={[0.24, 16, 12]} /><meshStandardMaterial color="#FFE6BA" emissive="#FFC97A" emissiveIntensity={2.6} /></mesh>
    <Glow position={[0, 4.35, 0]} size={1.8} color="#FFC97A" opacity={0.6} />
  </group>
);
// the arriving totes on "played it too" (rev 2, Timur: "a box disappears … the fourth box is just flying"): the draft dropped the
// second one onto LAYER 3 over an EMPTY slot (it hung in the air) and both fell 3.2 m in 12 f. Now both fill the two empty slots of
// the top layer, each lowered from above the frame on one eased path (accelerating, then a soft landing exactly on `at`), and stay.
const DROP_H = 3.6, DROP_F = 22;
const dropY = (f, at) => DROP_H * (1 - ease(f, at - DROP_F, at));
const paperPose = (f, t) => {
  const a = t.y2011 + 4, b = t.boston - 2;
  const k = ease(f, a, b);
  const tilt = (1 - k) * 0.5 * Math.sin((f - a) / 4);
  return { y: TABLE_H + 0.003 + (1 - k) * (1 - k) * 3.2 + (PAPER_H / 2) * Math.abs(Math.sin(tilt)), yaw: (1 - k) * 1.4, tilt, slide: (1 - easeOut(f, b, b + 10)) * 0.0 + (1 - k) * 0.8, vis: f >= a - 1 };
};
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  const paving = useMemo(pavingTex, []);
  paving.wrapS = paving.wrapT = THREE.RepeatWrapping; paving.repeat.set(50, 50); paving.anisotropy = 8;
  const band = useMemo(() => { const b = paving.clone(); b.needsUpdate = true; b.wrapS = b.wrapT = THREE.RepeatWrapping; b.repeat.set(30 / 4, 7 / 4); b.anisotropy = 8; return b; }, [paving]);
  const kerb = useMemo(() => { const b = paving.clone(); b.needsUpdate = true; b.wrapS = b.wrapT = THREE.RepeatWrapping; b.repeat.set(30 / 4, 0.3 / 4); return b; }, [paving]);
  const floods = useMemo(() => [0].map(() => { const o = new THREE.Object3D(); o.position.set(25, 6, 0); return o; }), []);
  const pp = paperPose(f, t);
  const red = ease(f, t.rigged - 2, t.rigged + 6) * (1 - 0.75 * ease(f, t.gameEnd - 4, t.gameEnd + 10));
  const d1 = dropY(f, t.played + 2), d2 = dropY(f, t.too + 0);
  return (
    <group rotation-y={Math.PI / 2}>
      <Sky zenith="#020A1A" mid="#06193A" horizon="#24508A" glowAt={0.5} />
      <Stars />
      <mesh rotation-x={-Math.PI / 2} position={[10, 0, 0]} receiveShadow><planeGeometry args={[200, 200]} /><meshStandardMaterial map={paving} bumpMap={paving} bumpScale={0.6} roughness={0.62} metalness={0.05} envMapIntensity={0.35} color="#C4CFDE" /></mesh>
      {/* a long reflecting band of darker stone leading to the steps */}
      {/* rev 4b: the band to the steps is polished DARK granite in the same slabs (it was a flat grey plane), between light kerbs */}
      <mesh rotation-x={-Math.PI / 2} position={[14, 0.004, 0]} receiveShadow><planeGeometry args={[30, 7]} /><meshStandardMaterial map={band} bumpMap={band} bumpScale={0.5} color="#7D8CA6" roughness={0.3} metalness={0.15} envMapIntensity={0.5} /></mesh>
      {[-3.65, 3.65].map((z) => <mesh key={"kb" + z} position={[14, 0.02, z]} receiveShadow castShadow><boxGeometry args={[30, 0.04, 0.3]} /><meshStandardMaterial map={kerb} color="#D6DEEA" roughness={0.55} /></mesh>)}
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
      {/* rev 4 (Timur: the stand under the stack "is fully the same as the floor … change the color"): a real WOODEN pallet — seven
          pale pine deck boards, three stringers on nine blocks, bottom boards — warm and light against the blue granite */}
      <Pallet />
      {[0, 1].map((L) => [-1, 1].map((i) => [-1, 1].map((j) => <Tub key={L + "_" + i + "_" + j} position={slot(i, j, L)} rotY={(rnd(L * 9 + i * 3 + j) - 0.5) * 0.06} glow={0} seed={L * 4 + (i + 1) + (j + 1) * 2} num={31 + L * 4 + (i + 1) + (j + 1) / 2} />)))}
      <Tub position={G_TUB} open hero glow={0} seed={3} num={42} />
      <Tub position={slot(1, 1, 2)} rotY={0.04} seed={2} num={41} />
      <group position={[0, d1, 0]} visible={f > t.played + 2 - DROP_F - 1}><Tub position={slot(1, -1, 2)} rotY={-0.05} seed={1} num={43} /></group>
      <group position={[0, d2, 0]} visible={f > t.too - DROP_F - 1}><Tub position={slot(-1, 1, 2)} rotY={0.03} seed={6} num={44} /></group>
      {/* the faint red light of the suspicion, then it dims */}
      <Glow position={[G_TUB[0] - 0.1, G_TUB[1] + 0.35, G_TUB[2]]} size={1.3} color="#FF3B3B" opacity={0.45 * red} />
      {/* rev 4b: the folding table the paper lands on — a walnut top with an edge band and an apron, folding steel legs with braces */}
      <FoldingTable p={[PAPER_AT[0], 0, PAPER_AT[2]]} />
      {/* the newspaper */}
      {pp.vis && (
        <group position={[PAPER_AT[0] - pp.slide, pp.y, PAPER_AT[2]]} rotation-y={pp.yaw} rotation-z={pp.tilt}>
          <Newspaper />
        </group>
      )}
    </group>
  );
};
const P_ = (dx, dy, dz) => [PAPER_AT[0] + dx, dy + TABLE_H, PAPER_AT[2] + dz];   // rev 4b: the paper is on the table
const shots = () => {
  const t = T();
  const close = heroCam(G_TUB, 0.19);
  return [
    { a: ROAD_CUT, b: ROAD_CUT, cut: true, pos: undrift(A(close.pos), FROM), target: A(close.target), fov: 34 },            // the matching close-up
    { a: FROM + 1, b: t.alone + 30, pos: A([-3.6, 0.55, -0.55]), target: A([10, 4.4, 0.35]), fov: 40, raw: true },   // rev 4f: raw — smoothCam's window reached back over the cut and pulled the pull-out's end back in (3.3 → 2.8 m, 48.2–48.7 s: "zooms in on 'a group started'")                     // pull back, low: stack and dome (rev 2: 41 f, a 50× zoom-out in 29 f lurched)
    { a: t.alone + 20, b: t.too + 8, pos: A([-3.9, 0.7, 0.9]), target: A([10, 4.6, -0.6]), fov: 40 },                          // drift across the stack
    { a: t.y2011 - 2, b: t.boston + 4, pos: A(P_(-2.3, 3.1, 0.25)), target: A(P_(0.75, 0, 0)), fov: 36 },                  // up over the paper
    { a: t.story - 10, b: t.many + 6, pos: A(P_(-1.5, 2.3, 0.1)), target: A(P_(0.4, 0, 0)), fov: 36 },                     // ease toward the masthead
    { a: t.many + 6, b: t.rigged + 17, pos: A([-3.6, 1.7, -2.2]), target: A([-0.2, 0.85, -0.2]), fov: 38 }                  // back to the stack: RIGGED?
  ];
};
const RedTag = ({ text, at, dimAt, out, x, y, to }) => {
  if (LABEL_STYLE !== "chip") return null;   // rev 5: the 2-D leader labels are off (label_style.ts)
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
      {/* rev 2 tag audit (REV2.md): fully in (at + 12; RedTag at + 8) by its word, ≥ 36 f readable, gone before the camera leaves */}
      <Tag text="MIT group" at={t.mit - 12} out={t.y2011 - 12} x={110} y={420} to={stack.behind ? null : stack} />
      <Tag text="July 2011" at={t.boston + 2} out={t.many - 6} x={600} y={330} to={date.behind ? null : date} />
      <RedTag text="RIGGED?" at={t.many - 6} dimAt={t.rigged + 12} out={t.gameEnd - 10} x={150} y={360} to={stack.behind ? null : stack} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("whooshlong", FROM + 14, 30, 0.45),                     // the pull back off the slip
    cueAt("ee_click_click_01", t.mit - 10, 10, 0.4),              // MIT GROUP
    cueAt("whooshsoft", t.played + 2 - 9, 20, 0.3),              // a tote comes down …
    cueAt("thud", t.played + 2, 12, 0.45),                        // … and lands
    cueAt("thud", t.too, 12, 0.4),                                // another
    cueAt("whooshsoft", t.y2011 + 12, 24, 0.45),                  // up over the plaza as the paper falls
    cueAt("ee_paper_paper_tear_01", t.boston - 2, 16, 0.35),      // the paper lands
    cueAt("pingshort", t.boston + 4, 18, 0.35),                  // JULY 2011
    cueAt("whooshsoft", t.many + 22, 24, 0.4),                    // up and back
    cueAt("sub", t.rigged, 26, 0.5)                               // RIGGED?
  ];
};
export const ST = { id: "globe", origin: GLOBE_O, from: FROM, to: 1630, light: { keyI: 1.3, rimI: 1.2, shadowBox: 9, fillI: 0.34 }, shots, Scene, Overlay, sfx };
