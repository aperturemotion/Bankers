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
import { Tree, Shade, floorBlob } from "./st_state_fx";

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
const PAPER_AT = [-1.0, 0, -1.9];   // rev 5: the table stands to the LEFT of the stack (it stood right in front of it: from the low pull-back it hid the whole stack)
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
const GLOBE_BLOBS = [
  floorBlob(0.04, 0, -0.04, 0.82, 0.9, 0.62), floorBlob(0.0, 0, 0.0, 0.62, 0.68, 0.5),
  floorBlob(PAPER_AT[0] + 0.05, 0, PAPER_AT[2] - 0.05, 0.95, 0.68, 0.32),
  ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => floorBlob(PAPER_AT[0] + a * (TABLE_TOP[0] / 2 - 0.12), 0, PAPER_AT[2] + b * (TABLE_TOP[1] / 2 - 0.1), 0.09, 0.09, 0.6)),
  ...[[6, 6.5], [6, -6.5], [16, 6.5], [16, -6.5], [-3, 6.5]].map(([x, z]) => floorBlob(x, 0, z, 0.45, 0.45, 0.55))
];
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  const paving = useMemo(pavingTex, []);
  paving.wrapS = paving.wrapT = THREE.RepeatWrapping; paving.repeat.set(50, 33.5); paving.anisotropy = 8;
  const band = useMemo(() => { const b = paving.clone(); b.needsUpdate = true; b.wrapS = b.wrapT = THREE.RepeatWrapping; b.repeat.set(30 / 4, 7 / 4); b.anisotropy = 8; return b; }, [paving]);
  const kerb = useMemo(() => { const b = paving.clone(); b.needsUpdate = true; b.wrapS = b.wrapT = THREE.RepeatWrapping; b.repeat.set(30 / 4, 0.3 / 4); return b; }, [paving]);
  const floods = useMemo(() => [0].map(() => { const o = new THREE.Object3D(); o.position.set(25, 6, 0); return o; }), []);
  const pp = paperPose(f, t);
  const red = ease(f, t.rigged - 2, t.rigged + 6) * (1 - 0.75 * ease(f, t.gameEnd - 4, t.gameEnd + 10));
  const d1 = dropY(f, t.played + 2), d2 = dropY(f, t.too + 0);
  return (
    <group rotation-y={Math.PI / 2}>
      {/* rev 5: the house sky (the same as the State House's, which is mounted with it during the truck: two different skies would swap) */}
      <Sky />
      <Stars opacity={0.7 * (1 - ease(f, LEAVE_A, LEAVE_A + 40))} />
      <mesh rotation-x={-Math.PI / 2} position={[10, 0, -33]} receiveShadow><planeGeometry args={[200, 134]} /><meshStandardMaterial map={paving} bumpMap={paving} bumpScale={0.6} roughness={0.62} metalness={0.05} envMapIntensity={0.35} color="#C4CFDE" /></mesh>
      {/* a long reflecting band of darker stone leading to the steps */}
      {/* rev 4b: the band to the steps is polished DARK granite in the same slabs (it was a flat grey plane), between light kerbs */}
      <mesh rotation-x={-Math.PI / 2} position={[14, 0.004, 0]} receiveShadow><planeGeometry args={[30, 7]} /><meshStandardMaterial map={band} bumpMap={band} bumpScale={0.5} color="#7D8CA6" roughness={0.3} metalness={0.15} envMapIntensity={0.5} /></mesh>
      {[-3.65, 3.65].map((z) => <mesh key={"kb" + z} position={[14, 0.02, z]} receiveShadow castShadow><boxGeometry args={[30, 0.04, 0.3]} /><meshStandardMaterial map={kerb} color="#D6DEEA" roughness={0.55} /></mesh>)}
      <group position={[26, 0, 0]} scale={0.6}><DomeBuilding /></group>
      {/* rev 5: the plaza's east edge (world x ≈ 1534, where the State House lawn begins): a granite kerb and a clipped hedge, so the
          truck east crosses a real boundary, never the end of a floor */}
      <mesh position={[0, 0.06, 33.85]} receiveShadow castShadow><boxGeometry args={[110, 0.12, 0.32]} /><meshStandardMaterial map={kerb} color="#B8C4D6" roughness={0.6} /></mesh>
      <mesh position={[0, 0.5, 34.6]} receiveShadow castShadow><boxGeometry args={[110, 1.0, 1.1]} /><meshStandardMaterial color="#163049" roughness={0.95} /></mesh>
      {Array.from({ length: 22 }, (_, i) => <mesh key={"hg" + i} position={[-52 + i * 5, 1.0, 34.6 + (rnd(i + 70) - 0.5) * 0.2]} scale={[2.6, 0.5, 0.62]} castShadow><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color={i % 2 ? "#1A3651" : "#1D3B58"} roughness={0.95} flatShading /></mesh>)}

      {floods.map((o, i) => <primitive key={"ft" + i} object={o} />)}
      {/* rev 5: the floodlight on the colonnade now CASTS — the columns throw their uplit shadows up the wall and the attic (it washed the key's shadows flat) */}
      <spotLight position={[17, 0.4, 0]} target={floods[0]} angle={0.75} penumbra={0.7} intensity={24} distance={34} decay={1.3} color="#DCE9FF" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0006} shadow-normalBias={0.03} shadow-camera-near={1} shadow-camera-far={40} />
      {[[6, 6.5], [6, -6.5], [16, 6.5], [16, -6.5], [-3, 6.5]].map(([x, z], i) => <Lamp key={i} p={[x, 0, z]} />)}
      <pointLight position={[2.5, 4.2, 4.0]} intensity={18} distance={14} decay={1.6} color="#FFCF96" />
      {/* dark trees framing the court */}
      {/* rev 5: only the west row — the east row stood in the truck to the State House (a flat-shaded canopy filled the frame) */}
      {[[8, -13], [14, -14], [20, -13], [26, -15]].map(([x, z], i) => <Tree key={"tr" + i} x={x} z={z} s={1.45 + rnd(i) * 0.3} i={i + 2} />)}
      {/* rev 6: contact shade — the pallet on the paving, the folding table and its feet, the lamp posts */}
      <Shade kind="blob" items={GLOBE_BLOBS} />
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
// ★ rev 5 (Timur, 2026-11-27: "a little slower … more cinematic"; "the camera should always be focused on something or be moving to
//   something"): fewer, longer moves, each from a subject to a subject — the pull back off the slip to the stack and the Great Dome
//   (68 f, was 42), one slow drift across the stack while the totes land, one crane up over the Globe on its table (63 f, was 36),
//   the ease to the masthead, the settle back on the stack for RIGGED. The departure is the STATE station's first shot: one long
//   truck right over the plaza's trees to the State House (it was a 300-m flight in 24 f).
export const LEAVE_A = 1578;   // the truck to the State House starts (story frame; the state station keys its arrival on it)
const shots = () => {
  const t = T();
  const close = heroCam(G_TUB, 0.19);
  return [
    { a: ROAD_CUT, b: ROAD_CUT, cut: true, pos: undrift(A(close.pos), FROM), target: A(close.target), fov: 34 },            // the matching close-up
    { a: FROM + 1, b: t.mit + 13, pos: A([-3.6, 0.55, -0.55]), target: A([10, 4.4, 0.35]), fov: 40, raw: true },   // rev 4f raw (smoothCam reached back over the cut); rev 5: 68 f
    { a: t.mit + 4, b: t.too + 14, pos: A([-3.9, 0.75, -1.5]), target: A([10, 4.6, -1.1]), fov: 40 },                        // drift across the stack (rev 5: leftward, the way the turn to the table continues)
    // rev 5: turn down onto the table beside the stack BEFORE the paper falls, so it lands in a framed shot (it fell out of frame)…
    { a: t.too - 10, b: t.y2011 + 8, pos: A([-6.2, 2.7, -3.4]), target: A([-1.0, 1.5, -1.8]), fov: 36 },
    // …then one slow ease down to the masthead, the whole page in frame
    { a: t.boston - 6, b: t.story + 6, pos: A(P_(-1.9, 2.9, 0.0)), target: A(P_(0.15, 0, 0)), fov: 36 },
    { a: t.many - 8, b: t.rigged, pos: A([-3.4, 3.4, -5.9]), target: A([-0.4, 0.75, -0.8]), fov: 38 }                  // up and back off the paper onto paper AND stack, one behind the other (portrait: nothing cut at the edges) — RIGGED?
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
    cueAt("ov_paper_flutter", t.y2011 + 8, 20, 0.16),             // rev 6: the Globe flutters down …
    cueAt("ov_newspaper", t.boston - 2, 16, 0.3),                 // rev 6: … and slaps onto the table
    cueAt("pingshort", t.boston + 4, 18, 0.35),                  // JULY 2011
    cueAt("whooshsoft", t.many + 28, 24, 0.35),                   // rev 5: the crane up off the stack onto MIT (fastest ≈ many + 36)
    cueAt("sub", t.rigged, 26, 0.5)                               // RIGGED?
  ];
};
export const ST = { id: "globe", origin: GLOBE_O, from: FROM, to: 1660, light: { target: [0, 0, -12], keyI: 1.9, rimI: 1.3, shadowBox: 21, fillI: 0.28 }, shots, Scene, Overlay, sfx };
