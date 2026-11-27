// @ts-nocheck
// ★ V39 builder D — BRATTLEBORO MEMORIAL HOSPITAL'S INTERIORS (Timur 2026-11-27: "add more detail to the interior of the hospital
//   when it's seen"). Real 3-D rooms with depth behind every window (parallax as the camera moves), merged through the Mesher:
//   · hRoom(m, o)   one room behind a window (frame: the wall face z = 0, the room from z −0.25 back to −d, x from −xl to +xr, floor
//                   y = 0): floor, ceiling with a light panel, walls with a base, and its furnishing by kind —
//                   "patient": a hospital bed (frame, raised head section, mattress, blanket, pillow, side rails, head/foot boards,
//                   casters), the headwall (outlets, medical-gas outlets, a reading light), a privacy curtain on its ceiling track,
//                   an overbed table, an IV pole with a bag, a wall TV and whiteboard, a visitor chair;
//                   "station": a nurse station (counter, transaction top, monitors, wall cabinets, a chart rack, a handrail);
//                   "office": desk, monitor, task chair, bookcase, filing cabinet. Lit warm, lit cool, or dark (lights off).
//   · hLobby(m)     the main lobby behind the entrance's sliding doors: terrazzo floor, a coffered ceiling with downlights, the
//                   reception desk with its monitors, hanging wayfinding (INFORMATION, REGISTRATION, EMERGENCY →, ELEVATORS — generic),
//                   two rows of waiting chairs, planters, an elevator bank (doors, frames, call buttons, floor indicators), wall art.
//   · blind(m, …)   a half-lowered window blind in the opening.
//   Lit rooms use materials whose emissive is their own vertex colour (onBeforeCompile), so a lit room reads lit through the glass
//   without any real light; no people; textures: one 1024 × 512 wayfinding sheet.
import * as THREE from "three";
import { rnd } from "./kit";
import { hospWayTex, wayRect } from "./d_bratt_tex";

const roomMat = (k, tint, rough = 0.7) => {
  const mt = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: rough, metalness: 0.02, envMapIntensity: 0.3 });
  const v = tint.map((x) => x.toFixed(3)).join(",");
  mt.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n\ttotalEmissiveRadiance += diffuseColor.rgb * vec3(${v});`); };
  mt.customProgramCacheKey = () => "d_room_" + k;
  mt.userData.cast = false;
  return mt;
};
let HM = null;
export const hospMats = () => {
  if (HM) return HM;
  const way = hospWayTex();
  HM = {
    rmW: roomMat("w", [0.5, 0.44, 0.34]), rmC: roomMat("c", [0.38, 0.44, 0.5]), rmD: roomMat("d", [0.05, 0.06, 0.09], 0.8),
    way: new THREE.MeshStandardMaterial({ map: way, emissiveMap: way, emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 0.85, roughness: 0.4 })
  };
  HM.way.userData.cast = false;
  return HM;
};
const pick = (a, r) => a[Math.floor(r * a.length) % a.length];
/** the room kind and light for window i (seeded): mostly patient rooms, some stations and offices, some dark */
export const roomKind = (i) => {
  const r = rnd(i * 5.3 + 1.7), L = r < 0.22 ? "rmD" : r < 0.6 ? "rmW" : "rmC";
  const k = rnd(i * 3.1 + 9.2);
  return { L, kind: k < 0.62 ? "patient" : k < 0.82 ? "station" : "office", seed: i };
};
// ── one room ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const hRoom = (m, { xl, xr, d, ch, L, kind, seed, openL = false, openR = false }) => {
  const w = xl + xr, cx = (xr - xl) / 2, z0 = -0.25, dz = d + z0, zc = (z0 - d) / 2;
  const R = (k) => rnd(seed * 13.7 + k * 3.3);
  const cool = L === "rmC";
  const wallC = pick(cool ? ["#E2E8EC", "#DCE6E4", "#E6E9EE"] : ["#EDE6D8", "#E9E1CF", "#EFE9DE"], R(1)), sideC = cool ? "#D4DDE2" : "#E2D9C8";
  m.box(L, [cx, -0.03, zc], [w, 0.06, dz], pick(["#B9B2A4", "#A9B7BC", "#C2B8A6"], R(2)));                // floor (sheet vinyl)
  m.box(L, [cx, ch + 0.03, zc], [w, 0.06, dz], "#F2F0EA");                                               // ceiling
  m.box(L, [cx, ch / 2, -d - 0.05], [w, ch, 0.1], wallC);                                                 // back wall
  if (!openL) m.box(L, [-xl + 0.05, ch / 2, zc], [0.1, ch, dz], sideC);
  if (!openR) m.box(L, [xr - 0.05, ch / 2, zc], [0.1, ch, dz], sideC);
  m.box(L, [cx, 0.06, -d + 0.01], [w, 0.12, 0.02], "#7E786C");                                           // the base
  // the ceiling light panel (lit rooms) or its dark lens
  if (L !== "rmD") m.box("lamp", [cx, ch - 0.006, zc - 0.25], [1.2, 0.012, 0.6], cool ? "#EEF6FF" : "#FFF2DC");
  else m.box(L, [cx, ch - 0.006, zc - 0.25], [1.2, 0.012, 0.6], "#C9CDD2");
  for (const sz of [-1, 1]) m.box(L, [cx, ch - 0.008, zc - 0.25 + sz * 0.31], [1.24, 0.016, 0.02], "#B9BEC4");
  if (kind === "patient") {
    const head = R(3) < 0.5 ? -1 : 1, hx = head < 0 ? -xl : xr;                 // the headwall side
    const bz = zc - 0.15, bx = hx - head * (0.12 + 1.05);
    // the headwall: panel, outlets (power white / emergency red-orange), medical gases (green O2, white air, yellow vac), a light
    m.box(L, [hx - head * 0.13, 1.35, bz], [0.06, 0.7, 1.7], "#D6D0C4");
    for (let k = 0; k < 6; k++) m.box(L, [hx - head * 0.165, 1.2 + (k % 2) * 0.18, bz - 0.65 + Math.floor(k / 2) * 0.12], [0.012, 0.07, 0.05], k % 2 ? "#F4F4F0" : "#C8642E");
    for (let k = 0; k < 3; k++) m.cyl(L, [hx - head * 0.17, 1.4, bz + 0.45 + k * 0.13], 0.03, 0.025, ["#2E8A5A", "#F4F4F0", "#D8B83A"][k], { r: [0, 0, Math.PI / 2], seg: 8 });
    m.box(L !== "rmD" ? "lamp" : L, [hx - head * 0.16, 1.72, bz], [0.02, 0.04, 1.3], "#FFF2DC");
    // the bed
    m.box(L, [bx, 0.33, bz], [2.05, 0.14, 0.95], "#8E98A4");
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { m.cyl(L, [bx + sx * 0.88, 0.08, bz + sz * 0.38], 0.06, 0.04, "#2A3038", { r: [Math.PI / 2, 0, 0], seg: 8 }); m.box(L, [bx + sx * 0.88, 0.18, bz + sz * 0.38], [0.04, 0.18, 0.04], "#8E98A4"); }
    m.box(L, [bx + head * 0.3, 0.48, bz], [1.4, 0.16, 0.9], "#F1F2F2");                                     // mattress (foot)
    m.box(L, [bx - head * 0.62, 0.62, bz], [0.78, 0.14, 0.9], "#F1F2F2", { r: [0, 0, head * 0.45] });       // the raised head section
    m.box(L, [bx + head * 0.3, 0.57, bz], [1.38, 0.05, 0.94], pick(["#9FB7CF", "#B8C8B0", "#D9D2E6", "#A9BCD0"], R(4)));   // blanket
    m.box(L, [bx - head * 0.82, 0.82, bz], [0.24, 0.12, 0.6], "#FFFFFF", { r: [0, 0, head * 0.45] });       // pillow
    m.box(L, [bx - head * 1.0, 0.72, bz], [0.05, 0.62, 0.95], "#C9CDD2"); m.box(L, [bx + head * 1.02, 0.6, bz], [0.05, 0.36, 0.95], "#C9CDD2");
    for (const sz of [-1, 1]) { m.box(L, [bx - head * 0.45, 0.72, bz + sz * 0.5], [0.8, 0.2, 0.03], "#C9CDD2"); m.box(L, [bx - head * 0.45, 0.72, bz + sz * 0.51], [0.7, 0.12, 0.01], "#9AA3AE"); }
    // the privacy curtain on its ceiling track, partly drawn (pleats)
    const tz = z0 - 0.75;
    m.box(L, [cx, ch - 0.07, tz], [w - 0.3, 0.04, 0.05], "#B9BEC4");
    const cw = 0.9 + R(5) * 0.7, c0 = head < 0 ? xr - 0.2 - cw : -xl + 0.2, curtC = pick(["#9DB8C4", "#B8C9A8", "#C9BBD6", "#A8BFD8"], R(6));
    for (let k = 0; k < Math.round(cw / 0.1); k++) m.box(L, [c0 + k * 0.1 + 0.05, ch - 0.09 - 1.05, tz + (k % 2 ? 0.035 : -0.035)], [0.11, 2.1, 0.02], k % 2 ? curtC : "#FFFFFF");
    m.box(L, [c0 + cw / 2, ch - 0.09 - 0.12, tz + 0.04], [cw, 0.24, 0.03], "#E8EEF2");                     // the mesh top band
    // the overbed table, the IV pole with its bag
    m.box(L, [bx + head * 0.25, 0.98, bz + 0.12], [0.75, 0.03, 0.4], "#C9B08A"); m.box(L, [bx + head * 0.25 + 0.32, 0.52, bz + 0.62], [0.04, 0.92, 0.04], "#9AA3AE");
    m.box(L, [bx + head * 0.25, 0.04, bz + 0.62], [0.7, 0.04, 0.08], "#8E98A4");
    const ix = hx - head * 0.5, iz = bz - 0.72;
    m.cyl(L, [ix, 1.0, iz], 0.012, 1.95, "#C9CDD2", { seg: 6 });
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; m.box(L, [ix + Math.cos(a) * 0.15, 0.05, iz + Math.sin(a) * 0.15], [0.3, 0.03, 0.03], "#8E98A4", { ry: -a }); }
    m.box(L, [ix, 1.95, iz], [0.3, 0.015, 0.015], "#C9CDD2"); m.box(L, [ix - 0.1, 1.78, iz], [0.12, 0.2, 0.04], "#DDEFF2");
    m.box(L, [ix + 0.05, 1.15, iz], [0.18, 0.14, 0.1], "#E4E8EC"); m.box(L !== "rmD" ? "lamp" : L, [ix + 0.05, 1.16, iz + 0.051], [0.12, 0.06, 0.004], "#7FD4A8");   // the infusion pump
    // the back wall: TV on its arm, a whiteboard, the visitor chair by the window
    m.box(L, [cx + head * 0.4, 2.25, -d + 0.06], [0.85, 0.5, 0.05], "#16191E"); m.box(L, [cx + head * 0.4, 2.25, -d + 0.02], [0.1, 0.1, 0.06], "#5A626E");
    m.box(L, [cx - head * 0.7, 1.55, -d + 0.015], [0.9, 0.6, 0.02], "#F6F6F2"); m.box(L, [cx - head * 0.7, 1.24, -d + 0.03], [0.9, 0.03, 0.04], "#B9BEC4");
    const vx = -hx + head * 0.0 + (head < 0 ? -0.45 : 0.45);
    m.box(L, [vx, 0.28, z0 - 0.55], [0.62, 0.3, 0.6], pick(["#5E7A8C", "#7A6A58", "#4E6E6A"], R(7))); m.box(L, [vx, 0.68, z0 - 0.82], [0.62, 0.55, 0.12], pick(["#5E7A8C", "#7A6A58", "#4E6E6A"], R(7)));
    for (const sx of [-1, 1]) m.box(L, [vx + sx * 0.33, 0.48, z0 - 0.58], [0.06, 0.18, 0.6], "#3A3A3A");
  } else if (kind === "station") {
    const sz = zc + 0.2;
    m.box(L, [cx, 0.55, sz], [w - 0.7, 1.1, 0.55], "#B89A74"); m.box(L, [cx, 1.13, sz + 0.05], [w - 0.6, 0.05, 0.7], "#EDEBE6");
    m.box(L, [cx, 0.76, sz - 0.4], [w - 0.7, 0.04, 0.55], "#D8D2C6");                                        // the work surface behind
    for (let k = 0; k < 3; k++) { const x = cx - (w - 1.2) / 2 + k * (w - 1.2) / 2; m.box(L, [x, 1.0, sz - 0.5], [0.5, 0.32, 0.04], "#16191E"); m.box(L !== "rmD" ? "lamp" : L, [x, 1.0, sz - 0.478], [0.46, 0.27, 0.004], pick(["#8FB8E0", "#A8D0C0", "#C8D8F0"], R(10 + k))); m.box(L, [x, 0.82, sz - 0.5], [0.04, 0.1, 0.04], "#3A3A3A"); }
    m.box(L, [cx, 2.25, -d + 0.2], [w - 0.6, 0.7, 0.36], "#D8D2C6");
    for (let k = 0; k < 4; k++) m.box(L, [cx - (w - 0.6) / 2 + (k + 0.5) * (w - 0.6) / 4, 2.25, -d + 0.385], [(w - 0.6) / 4 - 0.03, 0.66, 0.01], "#E8E2D6");
    for (let k = 0; k < 10; k++) m.box(L, [cx - 0.9 + k * 0.18, 1.45, -d + 0.08], [0.14, 0.26, 0.12], pick(["#2E5C8E", "#B83A3A", "#D8B25A", "#3E7A5A", "#6A4A7A"], R(20 + k)));   // the chart rack
    m.box(L, [cx, 0.9, -d + 0.06], [w - 0.3, 0.05, 0.05], "#B89A74");                                        // the handrail
    for (let k = 0; k < 2; k++) { const x = cx - 0.6 + k * 1.2; m.cyl(L, [x, 0.45, sz - 0.9], 0.24, 0.07, "#2E4F7A", { seg: 10 }); m.cyl(L, [x, 0.22, sz - 0.9], 0.03, 0.4, "#3A3A3A", { seg: 6 }); m.box(L, [x, 0.75, sz - 1.1], [0.42, 0.45, 0.06], "#2E4F7A"); }
  } else {
    m.box(L, [cx, 0.74, zc - 0.3], [1.5, 0.04, 0.7], "#8A6A4C");
    for (const sx of [-1, 1]) m.box(L, [cx + sx * 0.7, 0.37, zc - 0.3], [0.04, 0.72, 0.65], "#6A5038");
    m.box(L, [cx + 0.2, 1.0, zc - 0.5], [0.55, 0.34, 0.04], "#16191E"); m.box(L !== "rmD" ? "lamp" : L, [cx + 0.2, 1.0, zc - 0.478], [0.5, 0.29, 0.004], "#9FC4E8");
    m.cyl(L, [cx, 0.48, zc + 0.25], 0.25, 0.07, "#2A2E36", { seg: 10 }); m.box(L, [cx, 0.8, zc + 0.47], [0.44, 0.5, 0.06], "#2A2E36"); m.cyl(L, [cx, 0.24, zc + 0.25], 0.03, 0.42, "#3A3A3A", { seg: 6 });
    m.box(L, [xr - 0.3, 1.0, -d + 0.4], [0.4, 2.0, 0.7], "#8A6A4C");
    for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) m.box(L, [xr - 0.12, 0.35 + r * 0.45, -d + 0.15 + k * 0.1], [0.04, 0.3, 0.08], pick(["#2E4F7A", "#C9B48A", "#8A3E34", "#E2D6BE", "#4E6E5E"], R(30 + r * 6 + k)));
    m.box(L, [-xl + 0.35, 0.65, -d + 0.35], [0.5, 1.3, 0.6], "#9AA3AE"); for (let k = 0; k < 3; k++) m.box(L, [-xl + 0.35, 0.3 + k * 0.42, -d + 0.66], [0.3, 0.03, 0.02], "#C9CDD2");
  }
};
/** a blind lowered `drop` (0..1) of the opening (frame: the wall face; the opening centred at x, cy, ww × wh) */
export const blind = (m, L, x, cy, ww, wh, drop) => {
  const h = wh * drop, top = cy + wh / 2 - 0.07;
  m.box(L, [x, top - h / 2, -0.21], [ww - 0.16, h, 0.012], "#D9D4C8");
  for (let y = top - 0.08; y > top - h; y -= 0.09) m.box(L, [x, y, -0.2], [ww - 0.16, 0.01, 0.01], "#B9B2A4");
  m.box(L, [x, top - h - 0.01, -0.2], [ww - 0.14, 0.03, 0.03], "#C9C2B4");
  m.box(L, [x, top + 0.02, -0.2], [ww - 0.12, 0.06, 0.05], "#E8E4DA");
};
// ── the lobby (frame: the facade face z = 0; the lobby from the storefront z −0.72 back to −LD, x ±LW, floor y = 0) ─────────────
export const LD = 8.5, LW = 4.55, LH = 3.9;
const wayQuad = (m, i, p, w, ry = 0) => m.quad("way", p, w, w / 8, "#FFFFFF", wayRect(i), { ry });
export const hLobby = (m) => {
  const L = "rmW", z0 = -0.72, zc = (z0 - LD) / 2, dz = LD + z0;
  m.box(L, [0, -0.02, zc], [2 * LW, 0.04, dz], "#D6D0C2");                                                  // terrazzo floor
  for (let k = -4; k <= 4; k++) m.box(L, [k, 0.001, zc], [0.015, 0.002, dz], "#C6BFB1");                    // its divider strips
  m.box(L, [0, 0.003, zc + 1.0], [3.0, 0.004, 1.6], "#5E6E82");                                             // an inset medallion
  m.box(L, [0, LH + 0.03, zc], [2 * LW, 0.06, dz], "#F2F0EA");
  for (let i = -1; i <= 1; i++) for (let k = 0; k < 4; k++) { const x = i * 2.6, z = -1.6 - k * 1.8; m.box(L, [x, LH - 0.06, z], [2.2, 0.12, 1.5], "#E6E2DA"); m.cyl("lamp", [x, LH - 0.13, z], 0.09, 0.01, "#FFF2DC", { seg: 10 }); }   // coffers and downlights
  for (const sd of [-1, 1]) {
    m.box(L, [sd * (LW + 0.05), LH / 2, zc], [0.1, LH, dz], "#E3DDD0");
    m.box(L, [sd * (LW - 0.01), 0.5, zc], [0.02, 1.0, dz - 0.2], "#B89A74");                                   // wood wainscot
    for (let k = 0; k < 2; k++) m.box(L, [sd * (LW - 0.02), 1.9, -2.6 - k * 3.0], [0.03, 0.8, 1.1], pick(["#4E6E8C", "#8C7A5E", "#6E8C7A"], rnd(k + sd * 3)));   // framed art
  }
  // the elevator bank on the back wall
  m.box(L, [0, LH / 2, -LD - 0.05], [2 * LW, LH, 0.1], "#D9D2C4");
  for (const x of [-1.3, 1.3]) {
    m.box(L, [x, 1.15, -LD + 0.02], [1.3, 2.3, 0.04], "#8E98A4");                                            // the frame
    for (const sd of [-1, 1]) m.box(L, [x + sd * 0.27, 1.08, -LD + 0.045], [0.52, 2.12, 0.01], "#C2CAD4");   // the two door leaves
    m.box(L, [x, 2.45, -LD + 0.03], [0.5, 0.14, 0.02], "#16191E"); m.box("lamp", [x, 2.45, -LD + 0.042], [0.2, 0.06, 0.004], "#FF9A4A");   // the floor indicator
    m.box(L, [x + 0.85, 1.1, -LD + 0.02], [0.1, 0.24, 0.02], "#B9BEC4"); for (const y of [1.05, 1.16]) m.cyl("lamp", [x + 0.85, y, -LD + 0.033], 0.022, 0.006, "#F4F4E8", { r: [Math.PI / 2, 0, 0], seg: 8 });
  }
  wayQuad(m, 3, [0, 3.0, -LD + 0.012], 1.6);
  // the reception desk with its monitors and the INFORMATION sign hanging over it
  const dzD = -4.4;
  m.box(L, [0, 0.52, dzD], [3.4, 1.04, 0.7], "#8A6A4C"); m.box(L, [0, 1.08, dzD + 0.12], [3.5, 0.05, 0.5], "#EDEBE6");
  for (let k = 0; k < 6; k++) m.box(L, [-1.5 + k * 0.6, 0.55, dzD + 0.352], [0.02, 0.9, 0.01], "#6A5038");     // the panel reveals
  m.box(L, [0, 0.75, dzD - 0.55], [3.2, 0.04, 0.6], "#D8D2C6");
  for (const x of [-1.0, 0.0, 1.0]) { m.box(L, [x, 1.0, dzD - 0.45], [0.52, 0.33, 0.04], "#16191E"); m.box(L, [x, 0.82, dzD - 0.45], [0.05, 0.1, 0.05], "#3A3A3A"); }
  m.box("lamp", [1.65, 1.25, dzD + 0.1], [0.3, 0.2, 0.004], "#9FC4E8", { r: [0, -0.6, 0] }); m.box(L, [1.65, 1.25, dzD + 0.08], [0.33, 0.23, 0.03], "#16191E", { r: [0, -0.6, 0] });   // a customer-facing screen
  wayQuad(m, 0, [0, 3.05, dzD + 0.2], 1.7); for (const sx of [-0.7, 0.7]) m.box(L, [sx, 3.5, dzD + 0.19], [0.01, 0.7, 0.01], "#8E98A4");
  // REGISTRATION and EMERGENCY → hanging toward the doors
  wayQuad(m, 1, [-2.6, 3.1, -2.0], 1.5); wayQuad(m, 2, [2.6, 3.1, -2.0], 1.5);
  for (const x of [-3.2, -2.0, 2.0, 3.2]) m.box(L, [x, 3.55, -2.01], [0.01, 0.62, 0.01], "#8E98A4");
  // waiting chairs: two rows each side, beam seating
  for (const sd of [-1, 1]) for (let r = 0; r < 2; r++) {
    const z = -5.2 - r * 1.2, x0 = sd * 3.0;
    m.box(L, [x0, 0.32, z], [1.9, 0.05, 0.06], "#8E98A4"); for (const lx of [-0.8, 0.8]) m.box(L, [x0 + lx, 0.16, z], [0.05, 0.32, 0.4], "#8E98A4");
    for (let k = 0; k < 3; k++) { const x = x0 - 0.62 + k * 0.62; m.box(L, [x, 0.44, z], [0.55, 0.08, 0.5], "#3A5C82"); m.box(L, [x, 0.75, z - 0.25], [0.55, 0.55, 0.07], "#3A5C82"); }
  }
  // planters with leafy plants
  for (const [x, z] of [[-3.9, -1.3], [3.9, -1.3], [-3.9, -7.9], [3.9, -7.9]]) {
    m.cyl(L, [x, 0.3, z], 0.3, 0.6, "#5A626E", { seg: 14 });
    for (let k = 0; k < 7; k++) m.ico(L, [x + (rnd(k + x) - 0.5) * 0.5, 0.85 + rnd(k * 3 + z) * 0.7, z + (rnd(k * 5 + x) - 0.5) * 0.5], [0.28, 0.24, 0.28], pick(["#3E6A4E", "#4E7A56", "#36604A"], rnd(k)));
  }
};
