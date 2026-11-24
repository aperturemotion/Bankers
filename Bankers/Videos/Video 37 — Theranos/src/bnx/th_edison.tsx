// @ts-nocheck
// ★ V37 "Theranos" — th_edison.tsx: THE EDISON (builder B, 2026-11-24), the desktop blood analyser. Used by `claim2` (the pitch: a
//   cartridge carrying the nanotainer slides into it and its touchscreen fills with test results); builder C may import it for the
//   crack. Drawn on V35's 3-D rig (tk_rig worldScr / XPlane, solid_engine's one key light from the upper left).
//
//   A real desktop analyser: a white moulded shell (soft rounded silhouette, bevelled edges, a parting line, four rubber feet), a
//   graphite front fascia carrying a black-glass touchscreen, the EDISON badge (engraved; it fills and its backlight glows on its
//   word) and a status light strip; under the fascia the cartridge slot (a deep recess, its lit rim), a power button; a field of
//   vent slots on the top and louvres down the right side.
//
// ── LOCAL FRAME ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//   World units ≈ px at the pivot depth; origin on the floor at the footprint's centre; x right, y DOWN (up is negative), z toward
//   the lens. The front face is at z = ED.Zf. Place it with a pose (tk_rig xfPose(x, TK_FLOOR_Y, z, k, yaw)).
//
// ── <Edison id rig pose tiles fill badge led slot cart tube probe /> ───────────────────────────────────────────────────────────
//   tiles   (i) → 0…1  each result tile appearing on the screen (ED.tiles of them, row by row)
//   fill    (i) → 0…1  each tile's result bar filling (abstract bars, no readable text)
//   badge   { text, on 0…1, glow 0…1 } the EDISON badge (engraving filled by `on`, its backlight by `glow`)
//   led     0…1  the status strip and the slot's rim light
//   cart    null | { z } the cartridge's FRONT face z (local): > ED.Zf it stands out of the slot; ED.cartIn = all the way in.
//           It is drawn inside the shell where it has entered: clipped by the slot's mouth, never through the carcass.
//   tube    (map, rig) → element: the sample tube standing in the cartridge's well (drawn with the cartridge, in its clip);
//           its foot sits at ED.wellAt(cartZ) (local), ED.tubeH tall
//   The element is a fragment of full-frame SVG layers and CSS-3-D print planes: wrap it in ONE data-probe-object div.
//   edAt(rig, pose, q) → screen point · edCorners(pose) → TkFloor casters · ED (dimensions)
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { rampAt } from "./solid_engine";
import { mapScr, rrectPts, worldScr, xfApply } from "./tk_rig";
import { PaintParts, PlanePrint, boxAB, cylAB, extrudeZ, f2, path3, planeMatrix } from "./claim_kit";
import { SHOUT } from "./fonts";
import { ED_FRONT, ED_GLASS, ED_LED, ED_SCREEN_BG, ED_SHELL, ED_TILE, ED_TILE_HI, PL_RUBBER, PL_STEEL } from "./claim_mat";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs, Fragment = jsx_runtime.Fragment;
const W = 520, H = 600, DP = 440, FEET = 14;
export const ED = {
  W, H, DP, FEET, Zf: DP / 2, top: -(H + FEET),
  fascia: { x: W / 2 - 34, y0: -(H + FEET) + 36, y1: -FEET - 178, t: 6 },
  screen: { x: 198, y0: -(H + FEET) + 58, y1: -FEET - 318 },
  badge: { w: 200, h: 50, cy: -FEET - 262 },
  led: { y: -FEET - 196, x: 150 },
  slot: { x: 124, y0: -FEET - 152, y1: -FEET - 36, depth: 300 },
  cart: { x: 96, h: 40, len: 150 },
  tiles: 12, cols: 4
};
ED.lipT = 10; ED.trayT = 8; ED.trayL = 230;
ED.cartIn = ED.Zf;                                        // the drawer's front (its lip) once it is all the way in: flush with the face
ED.cartY = ED.slot.y1 - ED.trayT;                         // the cartridge rides on the drawer's tray
ED.wellAt = (cz) => [0, ED.cartY - ED.cart.h, cz - ED.lipT - 24 - ED.cart.len * 0.62];
// the tube standing in the well: its height (local units) — it clears the slot's ceiling by ≥ 4 as the drawer closes
ED.tubeH = 56;
if (ED.cartY - ED.cart.h - ED.tubeH < ED.slot.y0 + 4) throw new Error("th_edison: the tube would strike the slot's ceiling");
export const edAt = (rig, pose, q) => worldScr(rig, xfApply(pose, q));
export const edCorners = (pose) => {
  const out = [];
  for (const x of [-W / 2, W / 2]) for (const y of [ED.top, 0]) for (const z of [-DP / 2, DP / 2]) out.push(xfApply(pose, [x, y, z]));
  return out;
};
const B = boxAB;
const rr = (w, h, r, cx = 0, cy = 0) => rrectPts(w, h, r, 6, cx, cy);
const bodyParts = () => {
  const ps = [];
  const P = (k, faces, ramp, oo = {}) => ps.push({ faces, ramp, spec: 0.5, key: k, ...oo, c: oo.c ?? [0, 0, 0] });
  // the shell: a rounded silhouette extruded front to back, its edges bevelled
  P("sh", extrudeZ(rr(W, H, 44, 0, -FEET - H / 2), -DP / 2, DP / 2, 16), ED_SHELL, { layer: 0, c: [0, -FEET - H / 2, 0], spec: 0.6 });
  // four rubber feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P(`ft${sx}${sz}`, cylAB([sx * (W / 2 - 60), 0, sz * (DP / 2 - 60)], [sx * (W / 2 - 60), -FEET - 1, sz * (DP / 2 - 60)], 22, 16), PL_RUBBER, { layer: -1, c: [sx * 200, -6, sz * 150], spec: 0.2 });
  // the graphite fascia and the touchscreen's black glass in it
  const F = ED.fascia, zf = ED.Zf;
  P("fa", extrudeZ(rr(2 * F.x, F.y1 - F.y0, 26, 0, (F.y0 + F.y1) / 2), zf - 4, zf + F.t, 2.5), ED_FRONT, { layer: 1, c: [0, (F.y0 + F.y1) / 2, zf + 2] });
  const Sc = ED.screen;
  P("gl", extrudeZ(rr(2 * Sc.x + 12, Sc.y1 - Sc.y0 + 12, 16, 0, (Sc.y0 + Sc.y1) / 2), zf + F.t - 1, zf + F.t + 1.5, 1), [ED_GLASS, "#0B121B", "#18222E", "#4A5868", "#B8C4D2"], { layer: 2, c: [0, (Sc.y0 + Sc.y1) / 2, zf + F.t + 1], spec: 1.0 });
  // the EDISON badge (brushed steel, proud of the fascia)
  const Bd = ED.badge;
  P("bd", extrudeZ(rr(Bd.w, Bd.h, 8, 0, Bd.cy), zf + F.t - 1, zf + F.t + 4, 1.5), PL_STEEL, { layer: 2, c: [0, Bd.cy, zf + F.t + 2], spec: 0.8 });
  // the power button (a steel ring and its cap), right of the slot
  P("pw", cylAB([W / 2 - 78, -FEET - 88, zf - 2], [W / 2 - 78, -FEET - 88, zf + 5], 15, 22), PL_STEEL, { layer: 2, c: [W / 2 - 78, -100, zf + 3], spec: 0.9 });
  return ps;
};
// the slot's recess: back wall, floor, ceiling and cheeks (drawn darkening into the shell), and its mouth
const slotPts = (z) => {
  const S = ED.slot;
  return [[-S.x, S.y0, z], [S.x, S.y0, z], [S.x, S.y1, z], [-S.x, S.y1, z]];
};
const Recess = ({ id, rig, map }) => {
  const S = ED.slot, z0 = ED.Zf + 0.2, z1 = ED.Zf - S.depth;
  const P = (pts) => path3(map, rig, pts);
  const a = mapScr(map, rig, [0, S.y0, z0]), b = mapScr(map, rig, [0, S.y0, z1]);
  return jsxs("g", { children: [
    jsx("defs", { "data-probe-skip": true, children: jsxs("linearGradient", { id: `${id}Rc`, gradientUnits: "userSpaceOnUse", x1: f2(a[0]), y1: f2(a[1]), x2: f2(b[0]), y2: f2(b[1]), children: [
      jsx("stop", { offset: "0", stopColor: "#1A2633" }),
      jsx("stop", { offset: "1", stopColor: "#05080C" })
    ] }) }),
    jsx("path", { d: P(slotPts(z0)), fill: "#04070A" }),
    jsx("path", { d: P([[-S.x, S.y1, z0], [S.x, S.y1, z0], [S.x, S.y1, z1], [-S.x, S.y1, z1]]), fill: `url(#${id}Rc)` }),
    jsx("path", { d: P([[-S.x, S.y0, z0], [-S.x, S.y1, z0], [-S.x, S.y1, z1], [-S.x, S.y0, z1]]), fill: "#0B1118" }),
    jsx("path", { d: P([[S.x, S.y0, z0], [S.x, S.y1, z0], [S.x, S.y1, z1], [S.x, S.y0, z1]]), fill: "#121B25" }),
    // the guide rails on the slot's floor
    [-60, 60].map((x, k) => jsx("path", { d: P([[x - 3, S.y1 - 0.5, z0], [x + 3, S.y1 - 0.5, z0], [x + 3, S.y1 - 0.5, z1], [x - 3, S.y1 - 0.5, z1]]), fill: "#2B3846", opacity: 0.8 }, k))
  ] });
};
// the slot's lip and its lit rim (in front of the cartridge's inside part)
const Rim = ({ rig, map, led }) => {
  const S = ED.slot, z = ED.Zf + 0.6;
  const P = (pts, close = true) => path3(map, rig, pts, close);
  return jsxs("g", { children: [
    jsx("path", { d: P(slotPts(z)), fill: "none", stroke: rampAt(ED_SHELL, 0.25), strokeWidth: 5, strokeLinejoin: "round" }),
    jsx("path", { d: P([[-S.x + 8, S.y0 - 7, z], [S.x - 8, S.y0 - 7, z]], false), stroke: ED_LED, strokeWidth: 3, strokeLinecap: "round", opacity: f2(0.25 + 0.75 * led) }),
    led > 0.02 && jsx("path", { d: P([[-S.x + 8, S.y0 - 7, z], [S.x - 8, S.y0 - 7, z]], false), stroke: ED_LED, strokeWidth: 10, opacity: f2(0.35 * led), style: { filter: "blur(4px)" } })
  ] });
};
// the shell's seams, vents and louvres
const ShellDetail = ({ rig, map }) => {
  const zf = ED.Zf + 0.3, P = (pts, close = false) => path3(map, rig, pts, close);
  const yP = -FEET - 64, top = ED.top - 0.3, sx = W / 2 + 0.3;
  const out = [];
  // the parting line round the front and the right side
  out.push(jsx("path", { d: P([[-W / 2 + 18, yP, zf], [W / 2 - 18, yP, zf]]), stroke: "#7D8FA5", strokeWidth: 1.4, opacity: 0.7, fill: "none" }, "pl"));
  out.push(jsx("path", { d: P([[sx, yP, DP / 2 - 18], [sx, yP, -DP / 2 + 18]]), stroke: "#7D8FA5", strokeWidth: 1.4, opacity: 0.6, fill: "none" }, "ps"));
  // the top's vent field: rounded slots in rows toward the back
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) {
    const x = -176 + c * 44, z = -150 + r * 34;
    out.push(jsx("path", { d: P([[x - 15, top, z - 5], [x + 15, top, z - 5], [x + 15, top, z + 5], [x - 15, top, z + 5]], true), fill: "#3B4A5C", opacity: 0.85 }, `v${r}${c}`));
  }
  // louvres down the right side
  for (let k = 0; k < 9; k++) {
    const y = ED.top + 120 + k * 26;
    out.push(jsx("path", { d: P([[sx, y, -120], [sx, y, 90]]), stroke: "#33424F", strokeWidth: 5, strokeLinecap: "round", opacity: 0.8, fill: "none" }, `l${k}`));
    out.push(jsx("path", { d: P([[sx, y + 4, -120], [sx, y + 4, 90]]), stroke: "#F4F8FC", strokeWidth: 1.2, opacity: 0.35, fill: "none" }, `h${k}`));
  }
  return jsx("g", { children: out });
};
// the touchscreen's content: a header strip and the grid of result tiles (abstract bars, no text), its glass reflection
const Screen = ({ id, rig, map, tiles, fill }) => {
  const Sc = ED.screen, F = ED.fascia, z = ED.Zf + F.t + 1.6;
  const sw = 2 * Sc.x, sh = Sc.y1 - Sc.y0;
  const M = planeMatrix(map, rig, [-Sc.x, Sc.y0, z], [1, 0, 0], [0, 1, 0]);
  const pad = 14, head = 26, gap = 9, cols = ED.cols, rows = Math.ceil(ED.tiles / cols);
  const tw = (sw - 2 * pad - (cols - 1) * gap) / cols, th = (sh - head - 2 * pad - (rows - 1) * gap) / rows;
  const out = [];
  out.push(jsx("rect", { x: 0, y: 0, width: sw, height: sh, rx: 10, fill: ED_SCREEN_BG }, "bg"));
  // the header: a status dot and three short bars
  out.push(jsx("circle", { cx: pad + 6, cy: pad + 6, r: 5, fill: ED_TILE_HI, opacity: 0.9 }, "hd"));
  [60, 34, 46].forEach((wd, k) => out.push(jsx("rect", { x: pad + 22 + k * 74, y: pad + 3, width: wd, height: 6, rx: 3, fill: ED_TILE, opacity: 0.55 }, `hb${k}`)));
  out.push(jsx("rect", { x: sw - pad - 70, y: pad + 1, width: 70, height: 10, rx: 5, fill: ED_TILE, opacity: 0.3 }, "hr"));
  for (let i = 0; i < ED.tiles; i++) {
    const a = clamp01(tiles(i)), b = clamp01(fill(i));
    if (a <= 2e-3) continue;
    const r = Math.floor(i / cols), c = i % cols;
    const x = pad + c * (tw + gap), y = pad + head + r * (th + gap);
    const s = 0.86 + 0.14 * a, cx = x + tw / 2, cy = y + th / 2;
    const len = 0.3 + 0.62 * (((i * 7 + 3) % 11) / 11);
    out.push(jsxs("g", { opacity: f2(a), transform: `translate(${f2(cx)} ${f2(cy)}) scale(${f2(s)}) translate(${f2(-cx)} ${f2(-cy)})`, children: [
      jsx("rect", { x, y, width: tw, height: th, rx: 7, fill: mixHex("#12304F", "#173E66", b), stroke: ED_TILE, strokeOpacity: 0.55, strokeWidth: 1.2 }),
      // the tile's two short header bars, the result bar's track and the bar itself, a done dot
      jsx("rect", { x: x + 8, y: y + 8, width: tw * 0.42, height: 5, rx: 2.5, fill: ED_TILE_HI, opacity: 0.55 }),
      jsx("rect", { x: x + 8, y: y + th - 18, width: tw - 16, height: 8, rx: 4, fill: "#0A1B2E" }),
      b > 2e-3 && jsx("rect", { x: x + 8, y: y + th - 18, width: f2((tw - 16) * len * b), height: 8, rx: 4, fill: mixHex(ED_TILE, ED_TILE_HI, b * 0.5) }),
      jsx("circle", { cx: x + tw - 12, cy: y + 11, r: 4, fill: ED_TILE_HI, opacity: f2(0.15 + 0.8 * b) })
    ] }, `t${i}`));
  }
  // the glass's reflection: one soft diagonal band from the key light (upper left)
  out.push(jsx("path", { d: `M${f2(sw * 0.05)},0 L${f2(sw * 0.3)},0 L${f2(sw * 0.12)},${f2(sh)} L${f2(-sw * 0.13)},${f2(sh)} Z`, fill: "#FFFFFF", opacity: 0.07 }, "rf"));
  return jsxs("g", { children: [
    jsx("defs", { "data-probe-skip": true, children: jsx("clipPath", { id: `${id}Sc`, children: jsx("rect", { x: 0, y: 0, width: sw, height: sh, rx: 10 }) }) }),
    jsx("g", { transform: M, clipPath: `url(#${id}Sc)`, children: out })
  ] });
};
// the loading drawer and its cartridge: the drawer's front lip (shell white, it closes the slot flush), its steel tray, and on the
//   tray the moulded graphite cartridge (a grip ridge at its front, a well for the tube). Each box is clamped to [z0, z1]: the
//   part inside the shell and the part outside are drawn in their own layers.
const clampBox = (a, b, z0, z1, bev) => {
  const lo = Math.max(z0, Math.min(a[2], b[2])), hi = Math.min(z1, Math.max(a[2], b[2]));
  return hi - lo < 0.5 ? null : B([a[0], a[1], lo], [b[0], b[1], hi], Math.min(bev, (hi - lo) / 3));
};
const cartParts = (cz, z0, z1) => {
  const S = ED.slot, C = ED.cart, ps = [];
  const add = (k, faces, ramp, oo) => faces && ps.push({ faces, ramp, spec: 0.5, key: k, ...oo });
  const ty = S.y1 - ED.trayT, cy0 = ty - C.h, cf = cz - ED.lipT - 24;
  add("tr", clampBox([-S.x + 8, S.y1, cz - ED.lipT - ED.trayL], [S.x - 8, ty, cz - ED.lipT], z0, z1, 2), ED_SHELL, { layer: 0, c: [0, S.y1 - 4, cz - 120], dim: 0.2 });
  add("ca", clampBox([-C.x, ty, cf - C.len], [C.x, cy0, cf], z0, z1, 3), ED_FRONT, { layer: 1, c: [0, (ty + cy0) / 2, cf - C.len / 2], spec: 0.55 });
  add("cg", clampBox([-C.x + 10, cy0, cf - 26], [C.x - 10, cy0 - 7, cf - 5], z0, z1, 2), ED_SHELL, { layer: 2, c: [0, cy0 - 3, cf - 15] });
  add("lp", clampBox([-S.x + 3, S.y1, cz - ED.lipT], [S.x - 3, S.y0 + 3, cz], z0, z1, 2), ED_SHELL, { layer: 3, c: [0, (S.y0 + S.y1) / 2, cz - 5], spec: 0.6 });
  return ps;
};
const CartTop = ({ rig, map, cz, tube }) => {
  const C = ED.cart, y0 = ED.cartY - C.h - 0.3, w = ED.wellAt(cz), cf = cz - ED.lipT - 24;
  const well = path3(map, rig, Array.from({ length: 20 }, (_, i) => [w[0] + 15 * Math.cos(i / 20 * 2 * Math.PI), y0, w[2] + 15 * Math.sin(i / 20 * 2 * Math.PI)]));
  return jsxs("g", { children: [
    jsx("path", { d: path3(map, rig, [[-C.x + 14, y0, cf - 34], [C.x - 14, y0, cf - 34]], false), stroke: "#C9D4E0", strokeOpacity: 0.3, strokeWidth: 1, fill: "none" }),
    jsx("path", { d: well, fill: "#05080C" }),
    tube && tube(map, rig)
  ] });
};
// the drawer's lip: a finger notch, drawn on its front face when that face is out of the shell
const LipNotch = ({ rig, map, cz }) => {
  const S = ED.slot, yc = (S.y0 + S.y1) / 2;
  return jsx("path", { d: path3(map, rig, rr(90, 14, 7, 0, yc + 18).map(([x, y]) => [x, y, cz + 0.3])), fill: "#5E6F82", opacity: 0.55 });
};
export const Edison = ({ id, rig, pose, tiles = () => 0, fill = () => 0, badge, led = 0, cart, tube, probe }) => {
  const map = (q) => xfApply(pose, q);
  const svg = (children, k) => jsx("svg", { width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children }, k);
  const zf = ED.Zf;
  const mouth = path3(map, rig, slotPts(zf + 0.2));
  const cz = cart ? cart.z : null;
  const Bd = ED.badge;
  return jsxs(Fragment, { children: [
    svg([
      jsx(PaintParts, { parts: bodyParts(), map, rig, id: `${id}b` }, "b"),
      jsx(ShellDetail, { rig, map }, "sd"),
      // the slot's recess and the part of the drawer (and its tube) that has entered: seen only through the slot's mouth
      jsx("defs", { "data-probe-skip": true, children: jsx("clipPath", { id: `${id}Mo`, children: jsx("path", { d: mouth }) }) }, "md"),
      jsx("g", { clipPath: `url(#${id}Mo)`, children: jsx(Recess, { id: `${id}R`, rig, map }) }, "r"),
      cart && cz - ED.lipT - ED.trayL < zf && jsxs("g", { clipPath: `url(#${id}Mo)`, children: [
        jsx(PaintParts, { parts: cartParts(cz, -1e4, zf), map, rig, id: `${id}ci` }),
        ED.wellAt(cz)[2] < zf && jsx(CartTop, { rig, map, cz, tube })
      ] }, "ci"),
      jsx(Rim, { rig, map, led }, "rm"),
      jsx(Screen, { id: `${id}S`, rig, map, tiles, fill }, "sc"),
      // the status strip under the screen
      jsx("path", { d: path3(map, rig, [[-ED.led.x, ED.led.y, zf + ED.fascia.t + 0.3], [ED.led.x, ED.led.y, zf + ED.fascia.t + 0.3]], false), stroke: ED_LED, strokeWidth: 3.5, strokeLinecap: "round", opacity: f2(0.3 + 0.7 * led) }, "ld"),
      badge && badge.glow > 0.02 && jsx("path", { d: path3(map, rig, rr(Bd.w + 14, Bd.h + 14, 12, 0, Bd.cy).map(([x, y]) => [x, y, zf + ED.fascia.t + 0.2])), fill: ED_LED, opacity: f2(0.35 * badge.glow), style: { filter: "blur(7px)" } }, "bg")
    ], "s1"),
    badge && jsx(PlanePrint, { rig, pose, pr: { o: [0, Bd.cy, zf + ED.fascia.t + 4.4], u: [1, 0, 0], v: [0, 1, 0], text: badge.text, size: 34, fill: "#0B1A30", op: 0.3 + 0.7 * clamp01(badge.on), family: SHOUT, ls: 5, probe: "the EDISON badge" }, k: `${id}bdg` }),
    // the part of the cartridge still out of the slot, in front of everything
    cart && cz > zf && svg([
      jsx(PaintParts, { parts: cartParts(cz, zf, 1e4), map, rig, id: `${id}co` }, "co"),
      ED.wellAt(cz)[2] >= zf && jsx(CartTop, { rig, map, cz, tube }, "ct")
    ], "s2")
  ] });
};
