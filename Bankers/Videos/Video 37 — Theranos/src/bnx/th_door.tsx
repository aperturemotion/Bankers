// @ts-nocheck
// ★ V37 "Theranos" — th_door.tsx: THE LAB DOOR (builder B, 2026-11-24). Shared by `claim` (2003: the company's first glass door,
//   THERANOS written on it in gold leaf, the founder's brass plate beside it) and `collapse` (2016–18: the same door, the results
//   behind it VOIDED, the Walgreens partner plaque falling away, the steel roller shutter rolling down over it).
//
//   A real commercial storefront bay on V35's 3-D rig (tk_rig worldScr / XPlane, solid_engine's one key light from the upper left):
//   a clad facade module (blue-steel panels, seams and rivets, a coping, a graphite skirting) with a door opening; in it an
//   anodised-aluminium frame (jambs, head, threshold) and a glass door leaf (stiles, top rail, a deep kick rail, glazing beads, pivot
//   hinges, a lock cylinder, a long round pull handle on two standoffs). Behind the glass, a lit lab corridor (floor, walls, a
//   ceiling with three light panels, a glowing far wall) seen through the tinted pane and its reflections. Above the opening the
//   roller shutter's hood and its two guide rails (the curtain rolled up inside until `shutter` > 0).
//
// ── LOCAL FRAME ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//   World units ≈ px at the rig's pivot depth; origin on the floor at the opening's centre on the facade's front plane; x right,
//   y DOWN (the floor is y = 0, up is negative), z toward the lens. Place it with a pose (tk_rig xfPose(x, TK_FLOOR_Y, z)).
//
// ── <LabDoor id rig pose f glow name plate plaque shutter board probe /> ─────────────────────────────────────────────────────────
//   glow     0…1+  the corridor's light (the flare recedes into it in claim; > 1 = still blooming)
//   name     { text, write 0…1 (letter by letter, left to right), glint 0…1 (a burnish sweep across the leaf after it is written) }
//   plate    { lines: [{ text, size, on 0…1 }] } the founder's brass plate on the right panel (engraved; `on` fills the engraving)
//            — null: no plate (collapse: four empty screw holes remain where it hung)
//   plaque   { text, k (frames since it began to unhook, or < 0 while it hangs) } the partner plaque on the left panel, or null
//   shutter  0…1  the roller shutter's curtain, rolled down from the hood to the floor
//   board    { rows: [0…1 lit], red: [0…1], void: { text, on }, years: { text, on } } a results board standing in the corridor
//            just behind the glass (collapse), or null
//   The element is a fragment of absolutely-placed full-frame SVG layers and CSS-3-D print planes; wrap it in ONE
//   data-probe-object div (its print and shapes then count as one object).
//
//   doorAt(rig, pose, q) → screen [x, y] of local point q · doorCorners(pose) → TkFloor casters · DOOR (the dimensions)
//   PLAQUE (its fall's frames: unhook → land → tip flat) · plaqueCorners(pose, k) for the floor's shadow
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex, rIn, rInOut } from "./anim";
import { rampAt } from "./solid_engine";
import { XPlane, mapScr, worldScr, xfApply, xfMul, xfRotX, xfRotZ, xfTrans } from "./tk_rig";
import { PaintParts, PlanePrint, boxAB, cylAB, f2, path3, ring3 } from "./claim_kit";
import { SHOUT } from "./fonts";
import { theme } from "./theme";
import { TH_ALU, TH_BRASS, TH_BRASS_INK, TH_CLAD, TH_CLAD_SEAM, TH_GOLD, TH_GRAPH, TH_LAB_LIGHT, TH_LAB_WALL, TH_PLATE, TH_RUBBER, TH_SLAT, TH_STEEL } from "./claim_mat";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs, Fragment = jsx_runtime.Fragment;
// ── the dimensions ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const DOOR = {
  W0: -640, W1: 640, H: 800, T: 46,
  // the opening and its aluminium frame
  ow: 420, oh: 680, fr: 26, frZ: [-30, 4],
  // the leaf (stile, top rail, kick rail), its glass plane, the name's line
  leaf: { x: 184, top: -652, bot: -8, st: 40, tr: 38, kr: 92, z: [-14, 2] },
  glassZ: -6,
  nameY: -506, nameSize: 48,
  // the pull handle on the latch stile
  handle: { x: 164, y0: -545, y1: -215, r: 11, z: 46 },
  // the roller shutter: hood, rails, curtain plane
  hood: { w: 520, y0: -778, y1: -688, z: 92 },
  rail: { x0: 216, x1: 236, z: 74 },
  curtain: { w: 444, z: [58, 66], slat: 23 },
  // the founder's plate (right panel) and the partner plaque (left panel)
  plate: { cx: 426, cy: -446, w: 340, h: 236, t: 8 },
  plaque: { cx: -426, top: -520, w: 300, h: 124, t: 10, pin: 100, off: 12 },
  // the lab corridor behind the glass
  lab: { x: 270, ceil: -800, far: -1050 },
  // the results board in the corridor (collapse)
  board: { w: 330, y0: -625, y1: -170, z: -150 }
};
const D = DOOR;
const at = (rig, pose, q) => worldScr(rig, xfApply(pose, q));
export const doorAt = (rig, pose, q) => at(rig, pose, q);
export const doorCorners = (pose) => {
  const out = [];
  for (const x of [D.W0, D.W1]) for (const y of [-D.H, 0]) for (const z of [-D.T, D.hood.z]) out.push(xfApply(pose, [x, y, z]));
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
export const PLAQUE = { swing: SWING, land: Math.round(SWING + PQ0.fall), tip: Math.round(SWING + PQ0.fall) + 14 };
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
  const th = 90 * rIn(k, SWING + fall, PLAQUE.tip);
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
const facadeParts = (o) => {
  const { W0, W1, H, T, ow, oh } = D, x0 = -ow / 2, x1 = ow / 2;
  const ps = [];
  const P = (k, faces, ramp, oo = {}) => ps.push({ faces, ramp, spec: 0.35, key: k, ...oo, c: oo.c ?? [0, 0, 0] });
  P("wl", B([W0, 0, -T], [x0, -H, 0], 3), TH_CLAD, { layer: 0, c: [(W0 + x0) / 2, -H / 2, -T / 2] });
  P("wr", B([x1, 0, -T], [W1, -H, 0], 3), TH_CLAD, { layer: 0, c: [(W1 + x1) / 2, -H / 2, -T / 2] });
  P("wh", B([x0 - 1, -oh, -T], [x1 + 1, -H, 0], 2), TH_CLAD, { layer: 0, c: [0, (-H - oh) / 2, -T / 2] });
  // the coping and the skirting (graphite)
  P("cop", B([W0 - 8, -H, -T - 8], [W1 + 8, -H - 16, 10], 3), TH_GRAPH, { layer: 1, c: [0, -H - 8, 0] });
  P("skL", B([W0 - 4, 0, -4], [x0 - 12, -32, 7], 2), TH_GRAPH, { layer: 1, c: [(W0 + x0) / 2, -16, 2] });
  P("skR", B([x1 + 12, 0, -4], [W1 + 4, -32, 7], 2), TH_GRAPH, { layer: 1, c: [(W1 + x1) / 2, -16, 2] });
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
    P(`rb${sx}`, B([a, 0, 0], [b, hood.y1, 6], 1), TH_SLAT, { layer: 7, c: [(a + b) / 2, -300, 3] });
    P(`ro${sx}`, B([b - sx * 5, 0, 6], [b, hood.y1, rail.z], 1), TH_SLAT, { layer: 8, c: [b, -300, 40] });
    P(`ri${sx}`, B([a, 0, 6], [a + sx * 4, hood.y1, rail.z], 1), TH_SLAT, { layer: 8, c: [a, -300, 40], dim: 0.15 });
  }
  // the hood: a long box with rounded front, end caps
  P("hood", B([-hood.w / 2, hood.y1, 0], [hood.w / 2, hood.y0, hood.z], 5), TH_SLAT, { layer: 11, c: [0, (hood.y0 + hood.y1) / 2, hood.z / 2], lift: 0.04, after: (map, rig) => {
    const z = hood.z + 0.3, x = hood.w / 2 - 10;
    return jsx("g", { children: [hood.y0 + 26, hood.y0 + 52].flatMap((y) => [
      jsx("path", { d: path3(map, rig, [[-x, y, z], [x, y, z]], false), stroke: "#0A0F15", strokeOpacity: 0.55, strokeWidth: 2, fill: "none" }, `r${y}`),
      jsx("path", { d: path3(map, rig, [[-x, y + 2.5, z], [x, y + 2.5, z]], false), stroke: "#E6ECF2", strokeOpacity: 0.25, strokeWidth: 1, fill: "none" }, `h${y}`)
    ]) });
  } });
  for (const sx of [-1, 1]) P(`hc${sx}`, B([sx * hood.w / 2, hood.y1 + 2, -2], [sx * (hood.w / 2 + 8), hood.y0 - 4, hood.z + 4], 2), TH_GRAPH, { layer: 12, c: [sx * hood.w / 2, -690, 40] });
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
// ── the results board standing in the corridor (collapse) ───────────────────────────────────────────────────────────────────────
const BOARD_ROWS = 4, BOARD_COLS = 3;
const Board = ({ id, rig, map, board }) => {
  const Bd = D.board, x0 = -Bd.w / 2, x1 = Bd.w / 2, z = Bd.z;
  const P = (pts) => path3(map, rig, pts);
  const parts = [
    { faces: B([x0 - 14, Bd.y1 + 14, z - 26], [x1 + 14, Bd.y0 - 14, z], 4), ramp: TH_GRAPH, spec: 0.4, key: "bdF", layer: 0, c: [0, -360, z - 13] },
    { faces: B([-16, 0, z - 40], [16, Bd.y1 + 14, z - 20], 2), ramp: TH_GRAPH, spec: 0.4, key: "bdS", layer: -1, c: [0, -60, z - 30] },
    { faces: B([-110, 0, z - 90], [110, -14, z + 30], 3), ramp: TH_GRAPH, spec: 0.4, key: "bdB", layer: -2, c: [0, -7, z - 30] }
  ];
  const zf = z + 0.4;
  const scr = P([[x0, Bd.y0, zf], [x1, Bd.y0, zf], [x1, Bd.y1, zf], [x0, Bd.y1, zf]]);
  // the result tiles: rows of three across the top half, each an abstract bar (no readable text)
  const tw = (Bd.w - 40) / BOARD_COLS, th = 24, gap = 8, top = -462;
  const tiles = [];
  for (let r = 0; r < BOARD_ROWS; r++) for (let c = 0; c < BOARD_COLS; c++) {
    const lit = clamp01(board.rows?.[r] ?? 1), red = clamp01(board.red?.[r] ?? 0);
    const tx = x0 + 20 + c * tw + 4, ty = top + r * (th + gap);
    const col = mixHex("#4D8ED9", theme.red, red);
    const len = 0.35 + 0.55 * (((r * 7 + c * 13) % 10) / 10);
    tiles.push(jsx("path", { d: P([[tx, ty, zf + 0.2], [tx + tw - 8, ty, zf + 0.2], [tx + tw - 8, ty + th, zf + 0.2], [tx, ty + th, zf + 0.2]]), fill: mixHex("#12365E", "#5A1520", red), opacity: f2(0.35 + 0.65 * lit) }, `t${r}${c}`));
    tiles.push(jsx("path", { d: P([[tx + 6, ty + 9, zf + 0.4], [tx + 6 + (tw - 20) * len * lit, ty + 9, zf + 0.4], [tx + 6 + (tw - 20) * len * lit, ty + th - 9, zf + 0.4], [tx + 6, ty + th - 9, zf + 0.4]]), fill: col, opacity: f2(lit) }, `b${r}${c}`));
  }
  const hy = Bd.y0 + 24;
  tiles.push(jsx("path", { d: P([[x0 + 16, hy, zf + 0.2], [x1 - 16, hy, zf + 0.2], [x1 - 16, hy + 14, zf + 0.2], [x0 + 16, hy + 14, zf + 0.2]]), fill: "#12365E", opacity: 0.8 }, "hd"));
  const lc = mapScr(map, rig, [x1 - 30, hy + 7, zf + 0.4]);
  tiles.push(jsx("circle", { cx: f2(lc[0]), cy: f2(lc[1]), r: 4, fill: mixHex("#9CC7F4", theme.red, Math.max(0, ...(board.red ?? [0]))) }, "lc"));
  const s0 = mapScr(map, rig, [0, Bd.y0, zf]), s1 = mapScr(map, rig, [0, Bd.y1, zf]);
  const anyRed = Math.max(0, ...(board.red ?? [0]));
  return jsxs("g", { children: [
    jsx("defs", { "data-probe-skip": true, children: jsxs("linearGradient", { id: `${id}Sc`, gradientUnits: "userSpaceOnUse", x1: f2(s0[0]), y1: f2(s0[1]), x2: f2(s1[0]), y2: f2(s1[1]), children: [
      jsx("stop", { offset: "0", stopColor: mixHex("#0F2844", "#3A0E16", anyRed) }),
      jsx("stop", { offset: "1", stopColor: mixHex("#081627", "#1E070C", anyRed) })
    ] }) }),
    jsx(PaintParts, { parts, map, rig, id: `${id}bd` }),
    jsx("path", { d: scr, fill: `url(#${id}Sc)` }),
    tiles
  ] });
};
// ── the glass pane: tint, the key light's reflection and two streaks, a lit top edge ─────────────────────────────────────────────
const Glass = ({ id, rig, map, shut }) => {
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
    // the reflections: soft diagonal streaks, cut by the pane's own edge
    jsxs("g", { clipPath: `url(#${id}Pc)`, children: [
      jsx("path", { d: st(0.12, 0.2), fill: "#FFFFFF", opacity: f2(0.1 * shut) }),
      jsx("path", { d: st(0.4, 0.06), fill: "#FFFFFF", opacity: f2(0.08 * shut) }),
      jsx("path", { d: st(0.78, 0.1), fill: "#FFFFFF", opacity: f2(0.05 * shut) })
    ] }),
    jsx("path", { d: P([[-gx + 4, gt + 2, z + 0.4], [gx - 4, gt + 2, z + 0.4]]), stroke: "#F3F7FC", strokeOpacity: 0.4, strokeWidth: 1.2, fill: "none" })
  ] });
};
// seams and rivets on the cladding; four screw holes where a removed plate hung
const Cladding = ({ rig, map, holes }) => {
  const { W0, W1, H, ow } = D, z = 0.4;
  const P = (pts) => path3(map, rig, pts, false);
  const seams = [];
  for (const y of [-268, -590]) {
    seams.push([[W0 + 6, y, z], [-ow / 2 - 4, y, z]]);
    seams.push([[ow / 2 + 4, y, z], [W1 - 6, y, z]]);
  }
  for (const x of [-426, 426]) seams.push([[x, -38, z], [x, -H + 6, z]]);
  const rivets = [];
  for (const x of [W0 + 24, -426, -ow / 2 - 26, ow / 2 + 26, 426, W1 - 24]) for (const y of [-60, -268, -590, -H + 24]) rivets.push([x, y, z]);
  const hl = holes ? (() => {
    const p = D.plate, o = [];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) o.push([p.cx + sx * (p.w / 2 - 22), p.cy + sy * (p.h / 2 - 22), z]);
    return o;
  })() : [];
  return jsxs("g", { children: [
    seams.map((s, k) => jsx("path", { d: P(s), stroke: TH_CLAD_SEAM, strokeWidth: 2.4, strokeOpacity: 0.8, fill: "none" }, `s${k}`)),
    seams.map((s, k) => jsx("path", { d: P(s.map((q) => [q[0] + 1.2, q[1] + 1.6, q[2]])), stroke: "#9DB6D3", strokeWidth: 0.8, strokeOpacity: 0.18, fill: "none" }, `h${k}`)),
    rivets.map((q, k) => {
      const c = mapScr(map, rig, q);
      return jsxs("g", { children: [jsx("circle", { cx: f2(c[0]), cy: f2(c[1]), r: 3.4, fill: "#0A1626", opacity: 0.85 }), jsx("circle", { cx: f2(c[0] - 0.8), cy: f2(c[1] - 0.9), r: 1.4, fill: "#C9D8EA", opacity: 0.5 })] }, `r${k}`);
    }),
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
export const LabDoor = ({ id, rig, pose, f, glow = 1, name, plate, plaque, shutter = 0, board, probe }) => {
  const map = (q) => xfApply(pose, q);
  const L = D.leaf, gx = L.x - L.st, gt = L.top + L.tr, gb = L.bot - L.kr;
  const paneD = path3(map, rig, [[-gx, gt, D.glassZ], [gx, gt, D.glassZ], [gx, gb, D.glassZ], [-gx, gb, D.glassZ]]);
  const svg = (children, k) => jsx("svg", { width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children }, k);
  const shut = 1 - 0.85 * clamp01(shutter * 1.6);
  const parts = [...facadeParts(), ...frameParts()];
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
    // 1 · the corridor and (collapse) the results board, seen only through the glass
    svg([
      jsx("defs", { "data-probe-skip": true, children: jsx("clipPath", { id: `${id}Cp`, children: jsx("path", { d: paneD }) }) }, "d"),
      jsxs("g", { clipPath: `url(#${id}Cp)`, children: [
        jsx(Corridor, { id: `${id}C`, rig, map, glow }),
        board && jsx(Board, { id: `${id}B`, rig, map, board })
      ] }, "c")
    ], "s1"),
    board && board.void && jsx(PlanePrint, { rig, pose, pr: { o: [0, -262, D.board.z + 0.8], u: [1, 0, 0], v: [0, 1, 0], text: board.void.text, size: 70, fill: theme.red, op: clamp01(board.void.on), family: SHOUT, ls: 3, probe: "VOIDED on the results board" }, k: `${id}bv` }),
    board && board.years && jsx(PlanePrint, { rig, pose, pr: { o: [0, -197, D.board.z + 0.8], u: [1, 0, 0], v: [0, 1, 0], text: board.years.text, size: 36, fill: "#F2C5CA", op: clamp01(board.years.on), family: SHOUT, ls: 2, probe: "the voided years on the results board" }, k: `${id}by` }),
    // 2 · the facade, the frame and the leaf, the glass over the corridor, the cladding's seams, the plate
    svg([
      jsx(PaintParts, { parts: parts.filter((p) => p.layer <= 1), map, rig, id: `${id}w` }, "w"),
      jsx(Cladding, { rig, map, holes: !plate && !!plaque }, "cl"),
      jsx(Glass, { id: `${id}G`, rig, map, shut }, "g"),
      jsx(PaintParts, { parts: parts.filter((p) => p.layer > 1), map, rig, id: `${id}f` }, "f"),
      plate && jsx(PaintParts, { parts: plateParts(), map, rig, id: `${id}p` }, "p"),
      plate && jsx(PlateScrews, { rig, map }, "ps")
    ], "s2"),
    name && jsx(GoldName, { rig, pose, text: name.text, write: name.write, glint: name.glint ?? 0 }),
    ...lines.map((l, i) => jsx(Engrave, { rig, pose, o: l.o, text: l.text, size: l.size, on: l.on, ink: TH_BRASS_INK, lip: "#FFF3CF", probe: "the founder's brass plate", k: `${id}e${i}` }, `${id}e${i}`)),
    // 3 · the shutter (rails, curtain, hood) over the door
    svg(jsx(PaintParts, { parts: sh, map, rig, id: `${id}s` }), "s3"),
    // 4 · the partner plaque and its pins
    plaque && svg([
      jsx(PaintParts, { parts: pinParts().filter(() => true), map, rig, id: `${id}pn` }, "pn"),
      jsx(PaintParts, { parts: plaqueParts(plaque.k), map: plaqueMap, rig, id: `${id}pq` }, "pq")
    ], "s4"),
    plaque && jsx(PlanePrint, { rig, pose: xfMul(pose, plaqueXf(plaque.k)), pr: { o: [PQ.cx, PQ.top + PQ.h / 2, PQ.t + 3.4], u: [1, 0, 0], v: [0, 1, 0], text: plaque.text, size: 52, fill: "#EFF5FB", op: 1, family: SHOUT, ls: 3, probe: "the partner plaque's name" }, k: `${id}pqt` })
  ] });
};
