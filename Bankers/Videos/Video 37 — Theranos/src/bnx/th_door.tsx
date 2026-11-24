// @ts-nocheck
// ★ V37 "Theranos" — th_door.tsx: THE LAB DOOR (builder B, 2026-11-24). Shared by `claim` (2003: the company's first glass door,
//   THERANOS written on it in gold leaf, the founder's brass plate beside it) and `collapse` (2016–18: the same door, the results
//   behind it VOIDED, the Walgreens partner plaque falling away, the steel roller shutter rolling down over it).
//
//   ★ REV 1 (Timur: "make it an actual three-dimensional building, not just a wall … make the walls a lot more detailed … the door
//   more realistic"): THE LAB BUILDING, a real 3-D block on V35's rig (tk_rig worldScr / XPlane, solid_engine's one key light from
//   the upper left): a front and a right side wall 1,400 deep (the side shows in perspective and through every slide), clad in
//   rain-screen panels (two close tones, open joints, lit lips, a rivet at each corner), a granite base course, a parapet band and a
//   metal coping; strip windows front and side (graphite frames, mullions, the lit lab inside, reflections, sills); a graphite door
//   surround standing proud round the entrance and a steel entrance canopy on two tie rods with downlights in its soffit (their pool
//   on the doorstep). In the opening an anodised-aluminium frame (jambs, head, threshold) and a glass leaf (stiles, top rail, a deep
//   kick rail with its brushed kick plate and screws, glazing beads, pivot hinges, an overhead door closer and its arm, a lock
//   cylinder, a long round pull handle on two standoffs). Behind the glass a lit lab corridor seen through the tinted pane and its
//   reflections. Over the opening the roller shutter's hood and its two guide rails (the curtain rolled up until `shutter` > 0).
//
// ── LOCAL FRAME ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//   World units ≈ px at the rig's pivot depth; origin on the floor at the opening's centre on the facade's front plane; x right,
//   y DOWN (the floor is y = 0, up is negative), z toward the lens. Place it with a pose (tk_rig xfPose(x, TK_FLOOR_Y, z)).
//
// ── <LabDoor id rig pose f glow name plate plaque shutter quiet probe /> ─────────────────────────────────────────────────────────
//   glow     0…1+  the corridor's light (the flare recedes into it in claim; > 1 = still blooming)
//   name     { text, write 0…1 (letter by letter, left to right), glint 0…1 (a burnish sweep across the leaf after it is written) }
//   plate    { lines: [{ text, size, on 0…1 }] } the founder's brass plate on the right panel (engraved; `on` fills the engraving)
//            — null: no plate (collapse: four empty screw holes remain where it hung)
//   plaque   { text, k (frames since it began to unhook, or < 0 while it hangs) } the partner plaque on the left panel, or null
//   shutter  0…1  the roller shutter's curtain, rolled down from the hood to the floor
//   quiet    true: the right panel's cells round the plate are one big panel (collapse reads SEPT 2018 on it)
//   notice   { text, on 0…1 } white vinyl lettering centred on that quiet panel (collapse: SEPT 2018)
//   The element is a fragment of absolutely-placed full-frame SVG layers and CSS-3-D print planes; wrap it in ONE
//   data-probe-object div (its print and shapes then count as one object).
//
//   doorAt(rig, pose, q) → screen [x, y] of local point q · doorCorners(pose) → TkFloor casters · DOOR (the dimensions)
//   PLAQUE (its fall's frames: unhook → land → tip flat) · plaqueCorners(pose, k) for the floor's shadow
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex, rIn, rInOut } from "./anim";
import { lightOf, rampAt } from "./solid_engine";
import { XPlane, mapScr, normalM, worldScr, xfApply, xfMul, xfRotX, xfRotZ, xfTrans } from "./tk_rig";
import { PaintParts, PlanePrint, boxAB, cylAB, f2, faces, path3, ring3 } from "./claim_kit";
import { SHOUT } from "./fonts";
import { theme } from "./theme";
import { TH_ROOF, TH_BASE, TH_ALU, TH_BRASS, TH_BRASS_INK, TH_CLAD, TH_CLAD_SEAM, TH_GOLD, TH_GRAPH, TH_LAB_LIGHT, TH_LAB_WALL, TH_PLATE, TH_RUBBER, TH_SLAT, TH_STEEL } from "./claim_mat";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs, Fragment = jsx_runtime.Fragment;
// ── the dimensions ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const DOOR = {
  // the building: its front (x W0…W1), its depth back to −SIDE (the right side wall shows in perspective), the cladding up to the
  //   parapet band (P0 … P1), the coping on top (H); a granite base course (BASE high, standing proud by BZ); the clad skin T thick
  W0: -660, W1: 660, H: 958, T: 46, SIDE: 1400, BASE: 62, BZ: 12, P0: -884, P1: -942,
  // the opening and its aluminium frame; the projecting door surround round it (SUR wide, SURZ proud)
  ow: 420, oh: 680, fr: 26, frZ: [-30, 4], SUR: 46, SURZ: 18,
  // the leaf (stile, top rail, kick rail), its glass plane, the name's line
  leaf: { x: 184, top: -652, bot: -8, st: 40, tr: 38, kr: 92, z: [-14, 2] },
  glassZ: -6,
  nameY: -506, nameSize: 48,
  // the pull handle on the latch stile
  handle: { x: 164, y0: -545, y1: -215, r: 11, z: 46 },
  // the roller shutter: hood, rails (on the surround's face), curtain plane
  hood: { w: 520, y0: -780, y1: -690, z: 104 },
  rail: { x0: 214, x1: 236, z: 86 },
  curtain: { w: 448, z: [68, 76], slat: 23 },
  // the entrance canopy: a steel blade over the door on two tie rods, downlights in its soffit
  canopy: { w: 560, y: -828, t: 26, d: 290, fascia: 50, rodY: -918 },
  // the strip windows: front left / right of the entrance, and along the side wall
  win: { y0: -806, y1: -700, xs: [[-630, -300], [300, 630]], side: [[-1240, -760], [-660, -180]] },
  // the founder's plate (right panel) and the partner plaque (left panel)
  plate: { cx: 456, cy: -446, w: 360, h: 250, t: 8 },
  plaque: { cx: -452, top: -520, w: 300, h: 124, t: 10, pin: 100, off: 12 },
  // the lab corridor behind the glass
  lab: { x: 270, ceil: -800, far: -1050 }
};
const D = DOOR;
const at = (rig, pose, q) => worldScr(rig, xfApply(pose, q));
export const doorAt = (rig, pose, q) => at(rig, pose, q);
export const doorCorners = (pose) => {
  const out = [];
  for (const x of [D.W0, D.W1]) for (const y of [-D.H - 150, 0]) for (const z of [-D.SIDE, 0]) out.push(xfApply(pose, [x, y, z]));
  return out;
};
// ── the plaque's fall: the left pin slips, it swings on the right pin, slips off, drops (righting itself), lands on its edge
//    and tips forward flat onto its face ─────────────────────────────────────────────────────────────────────────────────────────
const G = 2.4;
const SWING = 11, SW_DEG = 17;
const PQ0 = (() => {
  const P = D.plaque, R = [P.cx + P.pin, P.top + 14], C = [P.cx, P.top + P.h / 2];
  // the centre once the swing about the right pin is done (rotZ(−a) about R: the left end drops)
  const a = SW_DEG * Math.PI / 180, dx = C[0] - R[0], dy = C[1] - R[1];
  const Cs = [R[0] + dx * Math.cos(a) + dy * Math.sin(a), R[1] - dx * Math.sin(a) + dy * Math.cos(a)];
  const landY = -P.h / 2;
  return { R, C, Cs, landY, fall: Math.sqrt(2 * (landY - Cs[1]) / G) };
})();
// (the tip onto its face takes 22 f, settling softly: a 14-f gravity tip turned its back face to the lens in one frame — popscan)
export const PLAQUE = { swing: SWING, land: Math.round(SWING + PQ0.fall), tip: Math.round(SWING + PQ0.fall) + 22 };
const rotAbout = (deg, c) => xfMul(xfTrans([c[0], c[1], 0]), xfMul(xfRotZ(deg), xfTrans([-c[0], -c[1], 0])));
// the plaque's pose k frames after it began to unhook (applied to its rest geometry in the door's local frame)
const plaqueXf = (k) => {
  const P = D.plaque, { R, C, Cs, landY, fall } = PQ0;
  const off = xfTrans([0, 0, P.off]);
  if (k <= 0) return off;
  if (k <= SWING) return xfMul(off, rotAbout(-SW_DEG * rIn(k, 0, SWING), R));
  const t = Math.min(k - SWING, fall), e = t / fall;
  // it falls under gravity and rights itself (its turn braking evenly to level by the landing)
  const a = SW_DEG * (1 - e) * (1 - e);
  const cx = Cs[0] + (C[0] - Cs[0]) * e, cy = Cs[1] + 0.5 * G * t * t;
  const flying = xfMul(xfTrans([cx - C[0], cy - C[1], P.off]), rotAbout(-a, C));
  if (k - SWING <= fall) return flying;
  // on its bottom edge: it tips forward about the front-bottom edge, face down onto the floor
  const th = 90 * rInOut(k, SWING + fall, PLAQUE.tip);
  const landed = xfTrans([0, landY - C[1], P.off]);
  const edge = [0, 0, P.off + P.t];
  return xfMul(xfMul(xfTrans(edge), xfMul(xfRotX(-th), xfTrans([-edge[0], -edge[1], -edge[2]]))), landed);
};
export const plaqueCorners = (pose, k) => {
  const P = D.plaque, x = xfMul(pose, plaqueXf(k)), out = [];
  for (const u of [P.cx - P.w / 2, P.cx + P.w / 2]) for (const v of [P.top, P.top + P.h]) for (const z of [0, P.t]) out.push(xfApply(x, [u, v, z]));
  return out;
};
// ── engraving on a plane (two runs: a dark groove with its lit lip, then the fill) ───────────────────────────────────────────────
const Engrave = ({ rig, pose, o, text, size, on, ink, lip, bare = 0.22, probe, k, width }) => {
  const prBare = { o, u: [1, 0, 0], v: [0, 1, 0], text, size, fill: ink, op: bare, family: SHOUT, ls: 1.5, probe, width };
  const prLip = { o: [o[0] + 0.9, o[1] + 1.2, o[2]], u: [1, 0, 0], v: [0, 1, 0], text, size, fill: lip, op: bare * 0.9, family: SHOUT, ls: 1.5, probe, width };
  const prFill = { o: [o[0], o[1], o[2] + 0.2], u: [1, 0, 0], v: [0, 1, 0], text, size, fill: ink, op: clamp01(on), family: SHOUT, ls: 1.5, probe, width };
  return jsxs(Fragment, { children: [
    jsx(PlanePrint, { rig, pose, pr: prLip, k: `${k}l` }),
    jsx(PlanePrint, { rig, pose, pr: prBare, k: `${k}b` }),
    jsx(PlanePrint, { rig, pose, pr: prFill, k: `${k}f` })
  ] });
};
// ── the gold-leaf name on the glass, written letter by letter ─────────────────────────────────────────────────────────────────────
const GoldName = ({ rig, pose, text, write, glint }) => {
  if (!text || write <= 1e-3) return null;
  const size = D.nameSize, ls = 3, N = text.length;
  const W = Math.ceil(N * size * 0.62 + 40), H = Math.ceil(size * 1.3);
  const x = xfMul(pose, xfTrans([0, D.nameY, D.glassZ + 0.6]));
  const g = TH_GOLD;
  // each letter: a left-to-right wipe over 1.7 slots; the next starts one slot later
  const p = (i) => clamp01((write * (N + 0.7) - i) / 1.7);
  const sweep = -30 + 160 * clamp01(glint);
  const letter = (ch, i, shade) => {
    const q = p(i);
    return jsx("span", { style: {
      display: "inline-block",
      clipPath: `inset(-10% ${(100 * (1 - q)).toFixed(2)}% -10% -10%)`,
      ...shade ? { color: g.deep } : {
        backgroundImage: `linear-gradient(104deg, transparent ${(sweep - 9).toFixed(1)}%, rgba(255,250,232,0.95) ${sweep.toFixed(1)}%, transparent ${(sweep + 9).toFixed(1)}%), linear-gradient(180deg, ${g.hi} 0%, ${g.edge} 22%, ${g.face} 46%, ${g.body} 70%, ${g.mid} 86%, ${g.dark} 100%)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent"
      }
    }, children: ch }, i);
  };
  const run = (shade, dx, dy) => jsx("div", { style: { position: "absolute", left: dx, top: dy, width: W, height: H, lineHeight: `${H}px`, textAlign: "center", fontFamily: SHOUT, fontSize: size, letterSpacing: ls, whiteSpace: "pre", opacity: shade ? 0.85 : 1 }, children: Array.from(text).map((ch, i) => letter(ch, i, shade)) });
  return jsx(XPlane, { rig, x, u: -W / 2, v: -H / 2, w: 0, width: W, height: H, probe: "the gold-leaf name on the door's glass", children: jsxs("div", { style: { position: "relative", width: W, height: H }, children: [run(true, 1.6, 1.8), run(false, 0, 0)] }) });
};
// ── the parts ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const B = boxAB;
const facadeParts = () => {
  const { W0, W1, T, ow, oh, SIDE, BASE, BZ, P0, P1, H, SUR, SURZ } = D, x0 = -ow / 2, x1 = ow / 2, so = x1 + SUR;
  const ps = [];
  const P = (k, faces, ramp, oo = {}) => ps.push({ faces, ramp, spec: 0.35, key: k, ...oo, c: oo.c ?? [0, 0, 0] });
  // the right side wall (its skin, base course, parapet and coping wrapping round the corner): behind everything on the front
  // the roof (seen from the camera's height): a membrane deck inside the parapets, the back and left parapets and their coping,
  //   two rooftop air-handling units with their fan housings and louvres, a vent stack
  P("rd", B([W0 + T, P0 + 10, -SIDE + T], [W1 - T, P0, -T], 0), TH_ROOF, { layer: -4, c: [0, P0, -SIDE / 2], spec: 0.15, after: (map, rig) => {
    // the membrane's welded seams (a lit lip on each), a roof drain, an access hatch
    const out = [];
    for (let x = W0 + 220; x < W1 - 60; x += 210) {
      out.push(jsx("path", { d: path3(map, rig, [[x, P0 - 0.4, -SIDE + T + 4], [x, P0 - 0.4, -T - 4]], false), stroke: "#05080C", strokeWidth: 2, opacity: 0.6, fill: "none" }, `s${x}`));
      out.push(jsx("path", { d: path3(map, rig, [[x + 3, P0 - 0.4, -SIDE + T + 4], [x + 3, P0 - 0.4, -T - 4]], false), stroke: "#8E9AA8", strokeWidth: 0.8, opacity: 0.25, fill: "none" }, `h${x}`));
    }
    out.push(jsx("path", { d: path3(map, rig, ring3([-40, P0 - 0.5, -300], [1, 0, 0], [0, 0, 1], 18, 18)), fill: "#05080C", opacity: 0.8 }, "dr"));
    return jsx("g", { children: out });
  } });
  P("hat", B([-60, P0, -620], [60, P0 - 34, -520], 4), TH_GRAPH, { layer: -2, c: [0, P0 - 17, -570], lift: 0.05 });
  P("rpb", B([W0, P0, -SIDE], [W1 + 8, P1, -SIDE + T], 2), TH_CLAD, { layer: -3, c: [0, P0, -SIDE], lift: 0.05 });
  P("rcb", B([W0 - 6, P1, -SIDE - 6], [W1 + 14, -H, -SIDE + T + 6], 2), TH_GRAPH, { layer: -3, c: [0, -H, -SIDE] });
  P("rpl", B([W0 - 8, -BASE, -SIDE], [W0 + T, P1, -T], 2), TH_CLAD, { layer: -3, c: [W0, P0, -SIDE / 2], lift: 0.05 });
  P("rcl", B([W0 - 14, P1, -SIDE - 6], [W0 + T + 6, -H, -T - 6], 2), TH_GRAPH, { layer: -3, c: [W0, -H, -SIDE / 2] });
  for (const [k, x0, x1, z0, z1, h] of [["ahu1", -470, -170, -1060, -800, 150], ["ahu2", 120, 380, -1180, -960, 120]]) {
    P(k, B([x0, P0, z0], [x1, P0 - h, z1], 6), TH_SLAT, { layer: -2, c: [(x0 + x1) / 2, P0 - h / 2, (z0 + z1) / 2], lift: 0.06, after: (map, rig) => {
      const out = [];
      // louvres down its front face, the fan's round housing and blades on its top
      for (let v = P0 - 18; v > P0 - h + 14; v -= 14) out.push(jsx("path", { d: path3(map, rig, [[x0 + 14, v, z1 + 0.4], [x1 - 14, v, z1 + 0.4]], false), stroke: "#0B1118", strokeWidth: 2.2, opacity: 0.6, fill: "none" }, `l${v}`));
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, r = Math.min(x1 - x0, z1 - z0) * 0.34;
      out.push(jsx("path", { d: path3(map, rig, ring3([cx, P0 - h - 0.5, cz], [1, 0, 0], [0, 0, 1], r, 28)), fill: "#141B23" }, "fh"));
      for (let b2 = 0; b2 < 6; b2++) {
        const a = b2 / 6 * Math.PI * 2;
        out.push(jsx("path", { d: path3(map, rig, [[cx, P0 - h - 0.8, cz], [cx + r * 0.9 * Math.cos(a), P0 - h - 0.8, cz + r * 0.9 * Math.sin(a)]], false), stroke: "#5D6B7A", strokeWidth: 2, opacity: 0.7, fill: "none" }, `b${b2}`));
      }
      return jsx("g", { children: out });
    } });
  }
  P("vs", cylAB([420, P0, -560], [420, P0 - 110, -560], 16, 16), TH_STEEL, { layer: -2, c: [420, P0 - 55, -560], spec: 0.8 });
  P("vc", cylAB([420, P0 - 110, -560], [420, P0 - 124, -560], 26, 16), TH_STEEL, { layer: -2, c: [420, P0 - 117, -560], spec: 0.8 });
  P("sw", B([W1 - T, -BASE, -SIDE], [W1, P0, -T], 3), TH_CLAD, { layer: -1, c: [W1, -450, -SIDE / 2] });
  P("sb", B([W1 - T, 0, -SIDE], [W1 + BZ, -BASE, -T], 2), TH_BASE, { layer: -1, c: [W1, -30, -SIDE / 2], spec: 0.25 });
  P("sp", B([W1 - T, P0, -SIDE], [W1 + 8, P1, -T], 2), TH_CLAD, { layer: -1, c: [W1, P0, -SIDE / 2], lift: 0.05 });
  P("sc", B([W1 - T - 6, P1, -SIDE], [W1 + 14, -H, -T - 6], 2), TH_GRAPH, { layer: -1, c: [W1, -H, -SIDE / 2] });
  // the front skin round the opening (to the parapet band)
  P("wl", B([W0, -BASE, -T], [x0, P0, 0], 3), TH_CLAD, { layer: 0, c: [(W0 + x0) / 2, -450, -T / 2] });
  P("wr", B([x1, -BASE, -T], [W1, P0, 0], 3), TH_CLAD, { layer: 0, c: [(W1 + x1) / 2, -450, -T / 2] });
  P("wh", B([x0 - 1, -oh, -T], [x1 + 1, P0, 0], 2), TH_CLAD, { layer: 0, c: [0, (P0 - oh) / 2, -T / 2] });
  // the granite base course either side of the entrance (standing proud), the parapet band and the metal coping
  P("bl", B([W0, 0, -T], [-so, -BASE, BZ], 2), TH_BASE, { layer: 1, c: [(W0 - so) / 2, -30, 0], spec: 0.25 });
  P("br", B([so, 0, -T], [W1 + BZ, -BASE, BZ], 2), TH_BASE, { layer: 1, c: [(W1 + so) / 2, -30, 0], spec: 0.25 });
  P("pb", B([W0, P0, -T], [W1 + 8, P1, 8], 2), TH_CLAD, { layer: 1, c: [0, (P0 + P1) / 2, 0], lift: 0.05 });
  P("cp", B([W0 - 6, P1, -T - 6], [W1 + 14, -H, 16], 2), TH_GRAPH, { layer: 1, c: [0, -H, 0], spec: 0.6 });
  return ps;
};
// the door surround (a graphite portal standing proud round the opening), and the entrance canopy on its
//   tie rods (its fascia, soffit and downlights) — painted with the frame (surround) and over the shutter (canopy)
const surroundParts = () => {
  const { ow, oh, SUR, SURZ } = D, x1 = ow / 2, ps = [];
  const P = (k, faces, ramp, oo = {}) => ps.push({ faces, ramp, spec: 0.5, key: k, ...oo, c: oo.c ?? [0, 0, 0] });
  P("su1", B([-x1 - SUR, 0, 0], [-x1, -oh - SUR, SURZ], 3), TH_GRAPH, { layer: 2, c: [-x1 - SUR / 2, -oh / 2, SURZ / 2], lift: 0.06 });
  P("su2", B([x1, 0, 0], [x1 + SUR, -oh - SUR, SURZ], 3), TH_GRAPH, { layer: 2, c: [x1 + SUR / 2, -oh / 2, SURZ / 2], lift: 0.06 });
  P("su3", B([-x1, -oh, 0], [x1, -oh - SUR, SURZ], 3), TH_GRAPH, { layer: 2, c: [0, -oh - SUR / 2, SURZ / 2], lift: 0.06 });
  return ps;
};
const canopyParts = () => {
  const C = D.canopy, ps = [], hw = C.w / 2;
  const P = (k, faces, ramp, oo = {}) => ps.push({ faces, ramp, spec: 0.55, key: k, ...oo, c: oo.c ?? [0, 0, 0] });
  // tie rods from the blade's front corners up to brackets on the parapet band
  for (const sx of [-1, 1]) {
    P(`rod${sx}`, cylAB([sx * (hw - 50), C.y - C.t, C.d - 26], [sx * (hw - 50), C.rodY, 10], 4.5, 12), TH_STEEL, { layer: 20, c: [sx * (hw - 50), -860, 120], spec: 0.9 });
    P(`brk${sx}`, B([sx * (hw - 50) - 14, C.rodY + 16, 0], [sx * (hw - 50) + 14, C.rodY - 16, 12], 2), TH_STEEL, { layer: 19, c: [sx * (hw - 50), C.rodY, 6], spec: 0.8 });
  }
  P("cb", B([-hw, C.y, 0], [hw, C.y - C.t, C.d], 3), TH_GRAPH, { layer: 21, c: [0, C.y - C.t / 2, C.d / 2], lift: 0.05, after: (map, rig) => {
    // the soffit's downlights: lit discs in a row under the blade, each with its halo — only while the soffit faces the lens
    const out = [];
    if (!faces(map, rig, [0, 1, 0], [0, C.y, C.d / 2])) return null;
    for (const x of [-180, -60, 60, 180]) for (const z of [C.d * 0.55]) {
      const ring = Array.from({ length: 20 }, (_, i) => [x + 13 * Math.cos(i / 20 * 2 * Math.PI), C.y + 0.6, z + 13 * Math.sin(i / 20 * 2 * Math.PI)]);
      out.push(jsx("path", { d: path3(map, rig, ring.map((q) => [x + (q[0] - x) * 2.2, q[1], z + (q[2] - z) * 2.2])), fill: TH_LAB_LIGHT, opacity: 0.16, style: { filter: "blur(4px)" } }, `h${x}`));
      out.push(jsx("path", { d: path3(map, rig, ring), fill: TH_LAB_LIGHT, opacity: 0.95 }, `d${x}`));
    }
    return jsx("g", { children: out });
  } });
  // the fascia: a deep brushed-steel band along the blade's front edge, a lit reveal line along its foot
  P("cf", B([-hw - 6, C.y + 14, C.d - 10], [hw + 6, C.y + 14 - C.fascia, C.d + 6], 2), TH_STEEL, { layer: 22, c: [0, C.y - 14, C.d], spec: 0.8, lift: 0.04, after: (map, rig) => jsxs("g", { children: [
    jsx("path", { d: path3(map, rig, [[-hw, C.y + 6, C.d + 6.4], [hw, C.y + 6, C.d + 6.4]], false), stroke: TH_LAB_LIGHT, strokeWidth: 2.4, opacity: 0.8, fill: "none" }),
    jsx("path", { d: path3(map, rig, [[-hw, C.y - 18, C.d + 6.4], [hw, C.y - 18, C.d + 6.4]], false), stroke: "#0A0F15", strokeWidth: 1.6, opacity: 0.5, fill: "none" })
  ] }) });
  return ps;
};
const frameParts = () => {
  const { ow, oh, fr, frZ } = D, x0 = -ow / 2, x1 = ow / 2, L = D.leaf;
  const ps = [];
  const P = (k, faces, ramp, oo = {}) => ps.push({ faces, ramp, spec: 0.6, key: k, ...oo, c: oo.c ?? [0, 0, 0] });
  P("jl", B([x0, 0, frZ[0]], [x0 + fr, -oh, frZ[1]], 2), TH_ALU, { layer: 2, c: [x0, -oh / 2, 0] });
  P("jr", B([x1 - fr, 0, frZ[0]], [x1, -oh, frZ[1]], 2), TH_ALU, { layer: 2, c: [x1, -oh / 2, 0] });
  P("hd", B([x0, -oh + fr, frZ[0]], [x1, -oh, frZ[1]], 2), TH_ALU, { layer: 2, c: [0, -oh, 0] });
  P("th", B([x0 - 10, 0, -34], [x1 + 10, -7, 16], 2), TH_STEEL, { layer: 2, c: [0, -3, 0], spec: 0.8 });
  // the leaf: stiles, top rail, kick rail
  const z0 = L.z[0], z1 = L.z[1];
  P("sl", B([-L.x, L.bot, z0], [-L.x + L.st, L.top, z1], 2), TH_ALU, { layer: 3, c: [-L.x, -300, 0] });
  P("sr", B([L.x - L.st, L.bot, z0], [L.x, L.top, z1], 2), TH_ALU, { layer: 3, c: [L.x, -300, 0] });
  P("tr", B([-L.x + L.st, L.top + L.tr, z0], [L.x - L.st, L.top, z1], 2), TH_ALU, { layer: 3, c: [0, L.top, 0] });
  P("kr", B([-L.x + L.st, L.bot, z0], [L.x - L.st, L.bot - L.kr, z1], 2), TH_ALU, { layer: 3, c: [0, L.bot - L.kr / 2, 0] });
  // glazing beads round the glass (thin, proud of the glass)
  const gx = L.x - L.st, gt = L.top + L.tr, gb = L.bot - L.kr;
  P("bl", B([-gx, gb, -9], [-gx + 6, gt, -1], 1), TH_ALU, { layer: 4, c: [-gx, -300, 0], lift: 0.06 });
  P("br", B([gx - 6, gb, -9], [gx, gt, -1], 1), TH_ALU, { layer: 4, c: [gx, -300, 0], lift: 0.06 });
  P("bt", B([-gx, gt + 6, -9], [gx, gt, -1], 1), TH_ALU, { layer: 4, c: [0, gt, 0], lift: 0.06 });
  P("bb", B([-gx, gb, -9], [gx, gb - 6, -1], 1), TH_ALU, { layer: 4, c: [0, gb, 0], lift: 0.06 });
  // a brushed-steel kick plate on the kick rail (four screws), the overhead door closer (body on the top rail, arm to the head)
  P("kp", B([-L.x + L.st + 6, L.bot - 8, z1], [L.x - L.st - 6, L.bot - L.kr + 12, z1 + 1.6], 1), TH_STEEL, { layer: 5, c: [0, L.bot - 50, z1 + 1], spec: 0.75, lift: 0.08, after: (map, rig) => jsx("g", { children: [-1, 1].flatMap((sx) => [-1, 1].map((sy) => {
    const c = mapScr(map, rig, [sx * (L.x - L.st - 16), L.bot - 50 + sy * 26, z1 + 1.8]);
    return jsx("circle", { cx: f2(c[0]), cy: f2(c[1]), r: 2, fill: "#3A4552" }, `${sx}${sy}`);
  })) }) });
  P("dc", B([-L.x + L.st + 10, L.top + 8, z1], [-L.x + L.st + 130, L.top + 32, z1 + 16], 3), TH_ALU, { layer: 6, c: [-L.x + 100, L.top + 20, z1 + 8], spec: 0.7, lift: 0.08 });
  P("da", B([-L.x + L.st + 110, L.top + 2, z1 + 14], [-L.x + L.st + 196, L.top - 6, z1 + 22], 1), TH_STEEL, { layer: 6, c: [-L.x + 190, L.top, z1 + 18], spec: 0.9 });
  P("db", B([-L.x + L.st + 186, D.leaf.top - 10, -4], [-L.x + L.st + 214, -D.oh + D.fr, 8], 2), TH_ALU, { layer: 6, c: [-L.x + 230, L.top - 14, 2], spec: 0.7 });
  // pivot hinges (top and bottom, hinge side) and the lock cylinder (latch side)
  P("hp1", B([-L.x - 4, L.top - 2, -10], [-L.x + 22, L.top + 10, 8], 1), TH_STEEL, { layer: 5, c: [-L.x, L.top, 0], spec: 0.9 });
  P("hp2", B([-L.x - 4, L.bot + 2, -10], [-L.x + 22, L.bot - 10, 8], 1), TH_STEEL, { layer: 5, c: [-L.x, L.bot, 0], spec: 0.9 });
  P("lk", cylAB([L.x - L.st / 2, -300, z1], [L.x - L.st / 2, -300, z1 + 6], 9, 18), TH_STEEL, { layer: 5, c: [L.x, -300, 4], spec: 0.95 });
  // the pull handle: a long round bar on two standoffs
  const H = D.handle;
  P("hs1", cylAB([H.x, H.y0 + 30, z1], [H.x, H.y0 + 30, H.z], 6, 14), TH_STEEL, { layer: 5, c: [H.x, H.y0, 20], spec: 0.95 });
  P("hs2", cylAB([H.x, H.y1 - 30, z1], [H.x, H.y1 - 30, H.z], 6, 14), TH_STEEL, { layer: 5, c: [H.x, H.y1, 20], spec: 0.95 });
  P("hb", cylAB([H.x, H.y0, H.z], [H.x, H.y1, H.z], H.r, 20), TH_STEEL, { layer: 6, c: [H.x, (H.y0 + H.y1) / 2, H.z], spec: 1.1, lift: 0.18 });
  return ps;
};
const shutterParts = (s) => {
  const { hood, rail, curtain, oh } = D, ps = [];
  const P = (k, faces, ramp, oo = {}) => ps.push({ faces, ramp, spec: 0.5, key: k, ...oo, c: oo.c ?? [0, 0, 0] });
  for (const sx of [-1, 1]) {
    // a guide channel: back plate and two lips
    const a = sx * rail.x0, b = sx * rail.x1;
    P(`rb${sx}`, B([a, 0, D.SURZ], [b, hood.y1, D.SURZ + 6], 1), TH_SLAT, { layer: 7, c: [(a + b) / 2, -300, D.SURZ + 3] });
    P(`ro${sx}`, B([b - sx * 5, 0, D.SURZ + 6], [b, hood.y1, rail.z], 1), TH_SLAT, { layer: 8, c: [b, -300, 50] });
    P(`ri${sx}`, B([a, 0, D.SURZ + 6], [a + sx * 4, hood.y1, rail.z], 1), TH_SLAT, { layer: 8, c: [a, -300, 50], dim: 0.15 });
  }
  // the hood: a long box with rounded front, end caps
  P("hood", B([-hood.w / 2, hood.y1, D.SURZ], [hood.w / 2, hood.y0, hood.z], 5), TH_SLAT, { layer: 11, c: [0, (hood.y0 + hood.y1) / 2, hood.z / 2], lift: 0.04, after: (map, rig) => {
    const z = hood.z + 0.3, x = hood.w / 2 - 10;
    return jsx("g", { children: [hood.y0 + 26, hood.y0 + 52].flatMap((y) => [
      jsx("path", { d: path3(map, rig, [[-x, y, z], [x, y, z]], false), stroke: "#0A0F15", strokeOpacity: 0.55, strokeWidth: 2, fill: "none" }, `r${y}`),
      jsx("path", { d: path3(map, rig, [[-x, y + 2.5, z], [x, y + 2.5, z]], false), stroke: "#E6ECF2", strokeOpacity: 0.25, strokeWidth: 1, fill: "none" }, `h${y}`)
    ]) });
  } });
  for (const sx of [-1, 1]) P(`hc${sx}`, B([sx * hood.w / 2, hood.y1 + 2, D.SURZ - 2], [sx * (hood.w / 2 + 8), hood.y0 - 4, hood.z + 4], 2), TH_GRAPH, { layer: 12, c: [sx * hood.w / 2, -690, 40] });
  // the curtain (rolled down by s) and its bottom bar
  if (s > 1e-3) {
    const yb = hood.y1 + s * (0 - hood.y1);
    const cw2 = curtain.w / 2;
    P("cur", B([-cw2, yb - 26, curtain.z[0]], [cw2, hood.y1, curtain.z[1]], 0), TH_SLAT, { layer: 9, c: [0, yb / 2, 62], after: slatLines(s) });
    P("bar", B([-cw2, yb, curtain.z[0] - 3], [cw2, yb - 26, curtain.z[1] + 4], 2), TH_GRAPH, { layer: 10, c: [0, yb, 64], lift: 0.05 });
    P("hdl", B([-40, yb - 9, curtain.z[1] + 4], [40, yb - 16, curtain.z[1] + 12], 2), TH_STEEL, { layer: 10, c: [0, yb, 70], spec: 0.9 });
  }
  return ps;
};
// the curtain's slats: a groove and a lit lip every slat, riding down with the curtain (never past the hood's mouth)
const slatLines = (s) => (map, rig) => {
  const { hood, curtain } = D, yb = hood.y1 + s * (0 - hood.y1), cw2 = curtain.w / 2 - 2, z = curtain.z[1] + 0.3;
  const out = [];
  for (let y = yb - 26 - curtain.slat; y > hood.y1 + 2; y -= curtain.slat) {
    out.push(jsx("path", { d: path3(map, rig, [[-cw2, y, z], [cw2, y, z]], false), stroke: "#05090E", strokeOpacity: 0.75, strokeWidth: 2.2, fill: "none" }, `g${y.toFixed(1)}`));
    out.push(jsx("path", { d: path3(map, rig, [[-cw2, y + 3, z], [cw2, y + 3, z]], false), stroke: "#E6ECF2", strokeOpacity: 0.22, strokeWidth: 1.1, fill: "none" }, `l${y.toFixed(1)}`));
  }
  return jsx("g", { children: out });
};
const plateParts = () => {
  const P0 = D.plate, x0 = P0.cx - P0.w / 2, x1 = P0.cx + P0.w / 2, y0 = P0.cy - P0.h / 2, y1 = P0.cy + P0.h / 2;
  return [{ faces: B([x0, y1, 0], [x1, y0, P0.t], 2.5), ramp: TH_BRASS, spec: 0.7, key: "pl", layer: 13, c: [P0.cx, P0.cy, 4] }];
};
// ── the corridor behind the glass ───────────────────────────────────────────────────────────────────────────────────────────────
const Corridor = ({ id, rig, map, glow }) => {
  const { x, ceil, far } = D.lab, z0 = -D.T;
  const P = (pts) => path3(map, rig, pts);
  const S = (q) => mapScr(map, rig, q);
  const lit = clamp01(glow);
  const ink = (k) => rampAt(TH_LAB_WALL, k);
  const floor = P([[-x, 0, z0], [x, 0, z0], [x, 0, far], [-x, 0, far]]);
  const wl = P([[-x, 0, z0], [-x, ceil, z0], [-x, ceil, far], [-x, 0, far]]);
  const wr = P([[x, 0, z0], [x, ceil, z0], [x, ceil, far], [x, 0, far]]);
  const cl = P([[-x, ceil, z0], [x, ceil, z0], [x, ceil, far], [-x, ceil, far]]);
  const fw = P([[-x, ceil, far], [x, ceil, far], [x, 0, far], [-x, 0, far]]);
  const n0 = S([0, 0, z0]), n1 = S([0, 0, far]), c0 = S([0, -200, far]);
  const panels = [-260, -520, -800].map((z) => P([[-80, ceil + 0.5, z - 60], [80, ceil + 0.5, z - 60], [80, ceil + 0.5, z + 60], [-80, ceil + 0.5, z + 60]]));
  const pools = [-260, -520, -800].map((z) => P(ring3([0, -0.5, z], [1, 0, 0], [0, 0, 1], 120, 24)));
  // a lab doorway on each side wall and the far wall's window
  const dl = P([[-x + 0.5, 0, -380], [-x + 0.5, -420, -380], [-x + 0.5, -420, -500], [-x + 0.5, 0, -500]]);
  const dr = P([[x - 0.5, 0, -620], [x - 0.5, -420, -620], [x - 0.5, -420, -740], [x - 0.5, 0, -740]]);
  // vertical light strips on both side walls, and their sheen on the polished floor down the corridor's middle
  const strips = [-420, -760].map((z) => P([[x - 0.5, -600, z - 26], [x - 0.5, -600, z + 26], [x - 0.5, -150, z + 26], [x - 0.5, -150, z - 26]]));
  const sheen = P([[-34, -0.5, z0], [34, -0.5, z0], [60, -0.5, far], [-60, -0.5, far]]);
  const cr = Math.max(30, Math.abs(S([x, -200, far])[0] - c0[0]) * 1.1);
  return jsxs("g", { children: [
    jsxs("defs", { "data-probe-skip": true, children: [
      jsxs("linearGradient", { id: `${id}Fl`, gradientUnits: "userSpaceOnUse", x1: f2(n0[0]), y1: f2(n0[1]), x2: f2(n1[0]), y2: f2(n1[1]), children: [
        jsx("stop", { offset: "0", stopColor: ink(0.08 + 0.06 * lit) }),
        jsx("stop", { offset: "1", stopColor: ink(0.34 + 0.16 * lit) })
      ] }),
      jsxs("radialGradient", { id: `${id}Fw`, gradientUnits: "userSpaceOnUse", cx: f2(c0[0]), cy: f2(c0[1]), r: f2(cr), children: [
        jsx("stop", { offset: "0", stopColor: TH_LAB_LIGHT, stopOpacity: 1 }),
        jsx("stop", { offset: "0.35", stopColor: ink(0.66 + 0.2 * lit) }),
        jsx("stop", { offset: "1", stopColor: ink(0.34 + 0.12 * lit) })
      ] }),
      jsxs("linearGradient", { id: `${id}Wa`, gradientUnits: "userSpaceOnUse", x1: f2(n0[0]), y1: f2(n0[1]), x2: f2(n1[0]), y2: f2(n1[1]), children: [
        jsx("stop", { offset: "0", stopColor: ink(0.12 + 0.06 * lit) }),
        jsx("stop", { offset: "1", stopColor: ink(0.44 + 0.18 * lit) })
      ] })
    ] }),
    jsx("path", { d: fw, fill: `url(#${id}Fw)` }),
    jsx("path", { d: wl, fill: `url(#${id}Wa)` }),
    jsx("path", { d: wr, fill: `url(#${id}Wa)`, opacity: 0.92 }),
    jsx("path", { d: dl, fill: ink(0.18), opacity: 0.7 }),
    jsx("path", { d: dr, fill: ink(0.2), opacity: 0.6 }),
    jsx("path", { d: cl, fill: ink(0.2 + 0.1 * lit) }),
    jsx("path", { d: floor, fill: `url(#${id}Fl)` }),
    jsx("path", { d: sheen, fill: TH_LAB_LIGHT, opacity: f2(0.1 + 0.06 * lit), style: { filter: "blur(10px)" } }),
    strips.map((d, k) => jsx("path", { d, fill: TH_LAB_LIGHT, opacity: f2(0.45 + 0.2 * lit), style: { filter: "blur(2px)" } }, `st${k}`)),
    pools.map((d, k) => jsx("path", { d, fill: TH_LAB_LIGHT, opacity: f2((0.1 + 0.08 * lit) * (1 - k * 0.2)), style: { filter: "blur(6px)" } }, `p${k}`)),
    panels.map((d, k) => jsx("path", { d, fill: TH_LAB_LIGHT, opacity: f2(0.75 + 0.25 * lit) }, `l${k}`))
  ] });
};
// ── the glass pane: tint, the key light's reflection and two streaks, a lit top edge ─────────────────────────────────────────────
const Glass = ({ id, rig, map, shut, bloom = 0 }) => {
  const L = D.leaf, gx = L.x - L.st, gt = L.top + L.tr, gb = L.bot - L.kr, z = D.glassZ;
  const P = (pts) => path3(map, rig, pts);
  const pane = P([[-gx, gt, z], [gx, gt, z], [gx, gb, z], [-gx, gb, z]]);
  const st = (a, w) => P([[-gx + 2 * gx * a, gt, z + 0.3], [-gx + 2 * gx * (a + w), gt, z + 0.3], [-gx + 2 * gx * (a + w) - 140, gb, z + 0.3], [-gx + 2 * gx * a - 140, gb, z + 0.3]]);
  const g0 = mapScr(map, rig, [-gx, gt, z]), g1 = mapScr(map, rig, [gx, gb, z]);
  return jsxs("g", { children: [
    jsx("defs", { "data-probe-skip": true, children: jsxs("linearGradient", { id: `${id}Gl`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
      jsx("stop", { offset: "0", stopColor: "#DCEAFA", stopOpacity: 0.3 }),
      jsx("stop", { offset: "0.35", stopColor: "#5E86B5", stopOpacity: 0.12 }),
      jsx("stop", { offset: "1", stopColor: "#0B1C30", stopOpacity: 0.32 })
    ] }) }),
    jsx("defs", { "data-probe-skip": true, children: jsx("clipPath", { id: `${id}Pc`, children: jsx("path", { d: pane }) }) }),
    jsx("path", { d: pane, fill: `url(#${id}Gl)` }),
    // the corridor's light still blooming in the glass as flare 1 recedes into it (claim's first second)
    bloom > 0.01 && jsx("path", { d: pane, fill: TH_LAB_LIGHT, opacity: f2(0.55 * bloom) }),
    // the reflections: soft diagonal streaks, cut by the pane's own edge
    jsxs("g", { clipPath: `url(#${id}Pc)`, children: [
      jsx("path", { d: st(0.12, 0.2), fill: "#FFFFFF", opacity: f2(0.1 * shut) }),
      jsx("path", { d: st(0.4, 0.06), fill: "#FFFFFF", opacity: f2(0.08 * shut) }),
      jsx("path", { d: st(0.78, 0.1), fill: "#FFFFFF", opacity: f2(0.05 * shut) })
    ] }),
    jsx("path", { d: P([[-gx + 4, gt + 2, z + 0.4], [gx - 4, gt + 2, z + 0.4]]), stroke: "#F3F7FC", strokeOpacity: 0.4, strokeWidth: 1.2, fill: "none" })
  ] });
};
// ── the cladding's skin: rain-screen panels (two close tones, each with its lit top/left lip and shaded bottom/right edge), the open
//   joints between them, a rivet at each panel corner; the strip windows (graphite frames, mullions, the lit lab inside, a
//   reflection); the key light's falloff across the front. On the front (normal +z) and the right side wall (normal +x).
//   quiet: the right panel's cells round the plate merge into one big panel (collapse: SEPT 2018 is read on it, no joint through it)
const PANEL_ROWS = [-D.BASE, -270, -490, -700, D.P0];
const FRONT_COLS = [[-660, -460, -256], [256, 460, 660]];
const SIDE_COLS = [-46, -316, -586, -856, -1126, -1400];
const Cladding = ({ id, rig, map, holes, quiet }) => {
  const { W0, W1, P0, win, oh, SUR, ow } = D;
  const so = ow / 2 + SUR;
  const lFront = lightOf(normalM(map, rig, [0, 0, 1], [0, -400, 0]), 0.2), lSide = lightOf(normalM(map, rig, [1, 0, 0], [W1, -400, -600]), 0.2);
  const toneF = (k) => rampAt(TH_CLAD, (0.8 * lFront + 0.04) * (1 + k)), toneS = (k) => rampAt(TH_CLAD, (0.8 * lSide + 0.04) * (1 + k));
  // a cell: four corners on its plane (local), a tone jitter
  const cells = [];
  const front = (x0, x1, y0, y1, k) => cells.push({ q: [[x0, y1, 0.3], [x1, y1, 0.3], [x1, y0, 0.3], [x0, y0, 0.3]], k, t: toneF, side: false });
  const side = (z0, z1, y0, y1, k) => cells.push({ q: [[W1 + 0.3, y1, z0], [W1 + 0.3, y1, z1], [W1 + 0.3, y0, z1], [W1 + 0.3, y0, z0]], k, t: toneS, side: true });
  const jit = (i, j) => [0.02, -0.035, 0.045, -0.015, 0.03, -0.04][(i * 3 + j * 5) % 6];
  const inWin = (xa, xb, ya, yb, list) => list.some(([a, b]) => xa < b && xb > a) && ya < win.y1 && yb > win.y0;
  const qz = quiet ? { x0: 256, x1: 660, y0: -700, y1: -270 } : null;
  FRONT_COLS.forEach((cols) => {
    for (let c = 0; c < cols.length - 1; c++) for (let r = 0; r < PANEL_ROWS.length - 1; r++) {
      const xa = cols[c], xb = cols[c + 1], yb = PANEL_ROWS[r], ya = PANEL_ROWS[r + 1];
      if (qz && xa >= qz.x0 && xb <= qz.x1 && ya >= qz.y0 && yb <= qz.y1) continue;
      if (ya <= win.y1 && yb >= win.y0 && r === PANEL_ROWS.length - 2) {
        // the window row: a strip of panel above the window, the window itself, slivers either side of it
        front(xa, xb, P0, win.y0, jit(c, r));
        const ws = win.xs.filter(([a, b]) => xa < b && xb > a);
        if (!ws.length) front(xa, xb, win.y0, yb, jit(c, r + 1));
        else {
          const [a, b] = ws[0];
          if (xa < a) front(xa, a, win.y0, win.y1, jit(c, r + 2));
          if (xb > b) front(b, xb, win.y0, win.y1, jit(c, r + 2));
          front(xa, xb, win.y1, yb, jit(c, r + 3));
        }
        continue;
      }
      front(xa, xb, ya, yb, jit(c, r));
    }
  });
  if (qz) front(qz.x0, qz.x1, qz.y0, qz.y1, 0.01);
  // over the entrance: the header panels between the surround and the parapet
  front(-so, 0, P0, -oh - SUR, jit(4, 1));
  front(0, so, P0, -oh - SUR, jit(5, 2));
  for (let c = 0; c < SIDE_COLS.length - 1; c++) for (let r = 0; r < PANEL_ROWS.length - 1; r++) {
    const za = SIDE_COLS[c], zb = SIDE_COLS[c + 1], yb = PANEL_ROWS[r], ya = PANEL_ROWS[r + 1];
    if (r === PANEL_ROWS.length - 2) {
      side(za, zb, P0, win.y0, jit(c + 2, r));
      const ws = win.side.filter(([a, b]) => zb < b && za > a);
      if (!ws.length) side(za, zb, win.y0, yb, jit(c + 1, r));
      else {
        const [a, b] = ws[0];
        if (za > b) side(za, b, win.y0, win.y1, jit(c, r + 1));
        if (zb < a) side(a, zb, win.y0, win.y1, jit(c, r + 1));
        side(za, zb, win.y1, yb, jit(c, r + 2));
      }
      continue;
    }
    side(za, zb, ya, yb, jit(c + 3, r));
  }
  const P = (pts, close = true) => path3(map, rig, pts, close);
  const inset = (q, d, side) => side
    ? [[q[0][0], q[0][1] - d, q[0][2] - d], [q[1][0], q[1][1] - d, q[1][2] + d], [q[2][0], q[2][1] + d, q[2][2] + d], [q[3][0], q[3][1] + d, q[3][2] - d]]
    : [[q[0][0] + d, q[0][1] - d, q[0][2]], [q[1][0] - d, q[1][1] - d, q[1][2]], [q[2][0] - d, q[2][1] + d, q[2][2]], [q[3][0] + d, q[3][1] + d, q[3][2]]];
  const out = [];
  cells.forEach((c, i) => {
    const q = inset(c.q, 3.2, c.side);
    // the joint (the dark gap round the panel), the panel's face, its lit top/left lip and its shaded bottom/right edge
    out.push(jsx("path", { d: P(c.q), fill: "#06101C", opacity: 0.85 }, `j${i}`));
    out.push(jsx("path", { d: P(q), fill: c.t(c.k) }, `p${i}`));
    out.push(jsx("path", { d: P([q[0], q[3], q[2]], false), stroke: "#C9DAEE", strokeOpacity: c.side ? 0.12 : 0.26, strokeWidth: 1.2, fill: "none" }, `l${i}`));
    out.push(jsx("path", { d: P([q[2], q[1], q[0]], false), stroke: "#030810", strokeOpacity: 0.45, strokeWidth: 1.4, fill: "none" }, `s${i}`));
    for (const k of [0, 1, 2, 3]) {
      const a = q[k], b = q[(k + 2) % 4], r = [a[0] + (b[0] - a[0]) * 0.035, a[1] + (b[1] - a[1]) * 0.035, a[2] + (b[2] - a[2]) * 0.035];
      const s2 = mapScr(map, rig, r);
      out.push(jsx("circle", { cx: f2(s2[0]), cy: f2(s2[1]), r: 2.4, fill: "#0A1626", opacity: 0.8 }, `r${i}${k}`));
      out.push(jsx("circle", { cx: f2(s2[0] - 0.6), cy: f2(s2[1] - 0.7), r: 1, fill: "#D6E3F2", opacity: 0.55 }, `rh${i}${k}`));
    }
  });
  // the strip windows: a graphite frame, mullions, the lit lab seen through tinted glass, one reflection streak, a steel sill
  const winEl = (corners, n, k, sideW) => {
    const [a, b, c2, d] = corners;
    const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
    const g0 = mapScr(map, rig, lerp(a, b, 0.5)), g1 = mapScr(map, rig, lerp(d, c2, 0.5));
    const parts = [
      jsx("defs", { "data-probe-skip": true, children: jsxs("linearGradient", { id: `${id}W${k}`, gradientUnits: "userSpaceOnUse", x1: f2(g0[0]), y1: f2(g0[1]), x2: f2(g1[0]), y2: f2(g1[1]), children: [
        jsx("stop", { offset: "0", stopColor: rampAt(TH_LAB_WALL, sideW ? 0.42 : 0.55) }),
        jsx("stop", { offset: "0.55", stopColor: rampAt(TH_LAB_WALL, sideW ? 0.3 : 0.4) }),
        jsx("stop", { offset: "1", stopColor: rampAt(TH_LAB_WALL, 0.18) })
      ] }) }, "d"),
      jsx("path", { d: P(corners), fill: rampAt(TH_GRAPH, 0.22) }, "f"),
      jsx("path", { d: P([lerp(a, c2, 0.025), lerp(b, d, 0.025), lerp(c2, a, 0.025), lerp(d, b, 0.025)]), fill: `url(#${id}W${k})` }, "g")
    ];
    for (let m = 1; m < n; m++) parts.push(jsx("path", { d: P([lerp(a, b, m / n), lerp(d, c2, m / n)], false), stroke: rampAt(TH_GRAPH, 0.3), strokeWidth: 5, fill: "none" }, `m${m}`));
    // the lab's ceiling lights seen through it: a soft bright band along the top of each pane
    for (let m = 0; m < n; m++) parts.push(jsx("path", { d: P([lerp(lerp(a, b, (m + 0.18) / n), lerp(d, c2, (m + 0.18) / n), 0.12), lerp(lerp(a, b, (m + 0.82) / n), lerp(d, c2, (m + 0.82) / n), 0.12)], false), stroke: TH_LAB_LIGHT, strokeWidth: 3, strokeLinecap: "round", opacity: sideW ? 0.55 : 0.75 }, `lt${m}`));
    parts.push(jsx("path", { d: P([lerp(a, b, 0.1), lerp(a, b, 0.22), lerp(d, c2, 0.12), lerp(d, c2, 0.0)]), fill: "#FFFFFF", opacity: 0.07 }, "rf"));
    parts.push(jsx("path", { d: P([lerp(d, c2, -0.004), lerp(d, c2, 1.004)], false), stroke: "#D7E2EE", strokeOpacity: 0.55, strokeWidth: 3, fill: "none" }, "sl"));
    return jsx("g", { children: parts }, `w${k}`);
  };
  const wins = [
    ...win.xs.map(([a, b], i) => winEl([[a, win.y0, 0.6], [b, win.y0, 0.6], [b, win.y1, 0.6], [a, win.y1, 0.6]], 4, `f${i}`, false)),
    ...win.side.map(([a, b], i) => winEl([[W1 + 0.6, win.y0, b], [W1 + 0.6, win.y0, a], [W1 + 0.6, win.y1, a], [W1 + 0.6, win.y1, b]], 4, `s${i}`, true))
  ];
  // the key light's falloff across the front: brighter at the upper left, deeper at the lower right
  const f0 = mapScr(map, rig, [W0, P0, 0]), f1 = mapScr(map, rig, [W1, -D.BASE, 0]);
  const hl = holes ? (() => {
    const p = D.plate, o = [];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) o.push([p.cx + sx * (p.w / 2 - 22), p.cy + sy * (p.h / 2 - 22), 0.5]);
    return o;
  })() : [];
  return jsxs("g", { children: [
    jsx("defs", { "data-probe-skip": true, children: jsxs("linearGradient", { id: `${id}Fo`, gradientUnits: "userSpaceOnUse", x1: f2(f0[0]), y1: f2(f0[1]), x2: f2(f1[0]), y2: f2(f1[1]), children: [
      jsx("stop", { offset: "0", stopColor: "#DCEAFA", stopOpacity: 0.1 }),
      jsx("stop", { offset: "0.5", stopColor: "#DCEAFA", stopOpacity: 0 }),
      jsx("stop", { offset: "1", stopColor: "#020812", stopOpacity: 0.22 })
    ] }) }),
    out,
    wins,
    jsx("path", { d: P([[W0, P0, 0.7], [W1, P0, 0.7], [W1, -D.BASE, 0.7], [W0, -D.BASE, 0.7]]), fill: `url(#${id}Fo)` }),
    // the base course's joints (front and side)
    [-560, -400, 400, 560].map((x, k) => jsx("path", { d: P([[x, -2, D.BZ + 0.3], [x, -D.BASE + 2, D.BZ + 0.3]], false), stroke: "#070B10", strokeWidth: 2, strokeOpacity: 0.7, fill: "none" }, `bj${k}`)),
    [-300, -620, -940, -1260].map((z, k) => jsx("path", { d: P([[W1 + D.BZ + 0.3, -2, z], [W1 + D.BZ + 0.3, -D.BASE + 2, z]], false), stroke: "#070B10", strokeWidth: 2, strokeOpacity: 0.6, fill: "none" }, `bs${k}`)),
    hl.map((q, k) => {
      const c = mapScr(map, rig, q);
      return jsx("circle", { cx: f2(c[0]), cy: f2(c[1]), r: 3.2, fill: "#050B13", opacity: 0.9 }, `o${k}`);
    })
  ] });
};
// screw caps on the plate's corners
const PlateScrews = ({ rig, map }) => {
  const p = D.plate;
  return jsx("g", { children: [-1, 1].flatMap((sx) => [-1, 1].map((sy) => {
    const c = mapScr(map, rig, [p.cx + sx * (p.w / 2 - 22), p.cy + sy * (p.h / 2 - 22), p.t + 0.5]);
    return jsxs("g", { children: [
      jsx("circle", { cx: f2(c[0]), cy: f2(c[1]), r: 6.5, fill: rampAt(TH_BRASS, 0.25) }),
      jsx("circle", { cx: f2(c[0] - 1.2), cy: f2(c[1] - 1.4), r: 3.6, fill: rampAt(TH_BRASS, 0.85) })
    ] }, `${sx}${sy}`);
  })) });
};
// the canopy's downlights falling on the doorstep: a soft pool on the floor before the door (drawn on the floor plane)
const CanopyLight = ({ rig, map }) => {
  const C = D.canopy;
  const pool = path3(map, rig, ring3([0, -0.5, C.d * 0.62], [1, 0, 0], [0, 0, 1], 1, 40).map(([x, y, z]) => [x * 280, y, C.d * 0.62 + (z - C.d * 0.62) * 150]));
  return jsx("path", { d: pool, fill: TH_LAB_LIGHT, opacity: 0.07, style: { filter: "blur(18px)" } });
};
// the partner plaque: a graphite plate with a steel border, hung on two pins (the pins stay on the wall)
const plaqueParts = (k) => {
  const P0 = D.plaque, x0 = P0.cx - P0.w / 2, x1 = P0.cx + P0.w / 2, y0 = P0.top, y1 = P0.top + P0.h;
  return [
    { faces: B([x0, y1, 0], [x1, y0, P0.t], 3), ramp: TH_PLATE, spec: 0.55, key: "pq", layer: 0, c: [P0.cx, (y0 + y1) / 2, 5] },
    { faces: B([x0 + 10, y1 - 10, P0.t], [x1 - 10, y0 + 10, P0.t + 2], 1), ramp: TH_STEEL, spec: 0.8, key: "pqi", layer: 1, c: [P0.cx, (y0 + y1) / 2, P0.t + 1] },
    { faces: B([x0 + 14, y1 - 14, P0.t + 2], [x1 - 14, y0 + 14, P0.t + 3], 0), ramp: TH_PLATE, spec: 0.45, key: "pqf", layer: 2, c: [P0.cx, (y0 + y1) / 2, P0.t + 2.5], lift: 0.04 }
  ];
};
const pinParts = () => {
  const P0 = D.plaque;
  return [-1, 1].map((sx) => ({ faces: cylAB([P0.cx + sx * P0.pin, P0.top + 14, 0], [P0.cx + sx * P0.pin, P0.top + 14, P0.off + P0.t + 4], 4.5, 12), ramp: TH_STEEL, spec: 0.9, key: `pin${sx}`, layer: 14, c: [P0.cx + sx * P0.pin, P0.top, 10] }));
};
export const LabDoor = ({ id, rig, pose, f, glow = 1, name, plate, plaque, shutter = 0, quiet = false, notice, probe }) => {
  const map = (q) => xfApply(pose, q);
  const L = D.leaf, gx = L.x - L.st, gt = L.top + L.tr, gb = L.bot - L.kr;
  const paneD = path3(map, rig, [[-gx, gt, D.glassZ], [gx, gt, D.glassZ], [gx, gb, D.glassZ], [-gx, gb, D.glassZ]]);
  const svg = (children, k) => jsx("svg", { width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children }, k);
  const shut = 1 - 0.85 * clamp01(shutter * 1.6);
  const parts = [...facadeParts(), ...frameParts(), ...surroundParts()];
  const sh = shutterParts(shutter);
  const plaqueMap = plaque ? ((x) => (q) => xfApply(x, q))(xfMul(pose, plaqueXf(plaque.k))) : null;
  const PQ = D.plaque;
  // the plate's lines, stacked and centred on it
  const lines = plate ? (() => {
    const gapL = 16, tot = plate.lines.reduce((a, l) => a + l.size, 0) + gapL * (plate.lines.length - 1);
    let y = D.plate.cy - tot / 2;
    return plate.lines.map((l) => {
      const o = [D.plate.cx, y + l.size / 2, D.plate.t + 0.6];
      y += l.size + gapL;
      return { ...l, o };
    });
  })() : [];
  return jsxs(Fragment, { children: [
    // 1 · the corridor, seen only through the glass
    svg([
      jsx("defs", { "data-probe-skip": true, children: jsx("clipPath", { id: `${id}Cp`, children: jsx("path", { d: paneD }) }) }, "d"),
      jsxs("g", { clipPath: `url(#${id}Cp)`, children: [
        jsx(Corridor, { id: `${id}C`, rig, map, glow })
      ] }, "c")
    ], "s1"),
    // 2 · the facade, the frame and the leaf, the glass over the corridor, the cladding's seams, the plate
    svg([
      jsx(PaintParts, { parts: parts.filter((p) => p.layer <= 1), map, rig, id: `${id}w` }, "w"),
      jsx(Cladding, { id: `${id}K`, rig, map, holes: !plate && !!plaque, quiet }, "cl"),
      jsx(Glass, { id: `${id}G`, rig, map, shut, bloom: clamp01(glow - 1) }, "g"),
      jsx(PaintParts, { parts: parts.filter((p) => p.layer > 1), map, rig, id: `${id}f` }, "f"),
      plate && jsx(PaintParts, { parts: plateParts(), map, rig, id: `${id}p` }, "p"),
      plate && jsx(PlateScrews, { rig, map }, "ps")
    ], "s2"),
    name && jsx(GoldName, { rig, pose, text: name.text, write: name.write, glint: name.glint ?? 0 }),
    // (collapse) a notice in white vinyl letters on the quiet panel: it rises 10 units into place as it lands
    notice && jsx(PlanePrint, { rig, pose, pr: { o: [458, -485 + 10 * (1 - clamp01(notice.on)), 0.9], u: [1, 0, 0], v: [0, 1, 0], text: notice.text, size: 76, fill: "#F2F7FC", op: clamp01(notice.on), family: SHOUT, ls: 2, probe: "the closing notice on the building" }, k: `${id}nt` }),
    ...lines.map((l, i) => jsx(Engrave, { rig, pose, o: l.o, text: l.text, size: l.size, on: l.on, ink: TH_BRASS_INK, lip: "#FFF3CF", probe: "the founder's brass plate", k: `${id}e${i}` }, `${id}e${i}`)),
    // 3 · the shutter (rails, curtain, hood) over the door
    svg([
      jsx(PaintParts, { parts: sh, map, rig, id: `${id}s` }, "sh"),
      jsx(PaintParts, { parts: canopyParts(), map, rig, id: `${id}cn` }, "cn"),
      jsx(CanopyLight, { rig, map }, "cl")
    ], "s3"),
    // 4 · the partner plaque and its pins
    plaque && svg([
      jsx(PaintParts, { parts: pinParts().filter(() => true), map, rig, id: `${id}pn` }, "pn"),
      jsx(PaintParts, { parts: plaqueParts(plaque.k), map: plaqueMap, rig, id: `${id}pq` }, "pq")
    ], "s4"),
    // (its name turns away with its face as it tips face down: gone once it lies flat)
    plaque && plaque.k < PLAQUE.tip && jsx(PlanePrint, { rig, pose: xfMul(pose, plaqueXf(plaque.k)), pr: { o: [PQ.cx, PQ.top + PQ.h / 2, PQ.t + 3.4], u: [1, 0, 0], v: [0, 1, 0], text: plaque.text, size: 52, fill: "#EFF5FB", op: clamp01(Math.cos(Math.PI / 2 * rInOut(plaque.k, PLAQUE.land, PLAQUE.tip)) * 1.15), family: SHOUT, ls: 3, probe: "the partner plaque's name" }, k: `${id}pqt` })
  ] });
};
