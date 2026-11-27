// @ts-nocheck
// ★ V38 station ROLLDOWN (origin [300,0,0]): "When the jackpot hit $5 million and nobody won, the money rolled down to the smaller
//   prizes. On those days, enough tickets put the math on your side."
//   A sculptural JACKPOT MACHINE in a navy studio void on a glossy floor (the machine mirrored in it): a glass column on a stepped
//   plinth, filling with silver-blue and gold coins; a glowing $5M ring; at the top a MATCH 6 tray behind a shut gate; and a
//   staircase of three lit prize bins (MATCH 5 / 4 / 3) stepping down to the right — the brochure's diagram made real. (rev 2: the bins,
//   the chutes and the MATCH 6 bin rebuilt as detailed machinery — see Bin; the column and the coins' choreography unchanged.)
//   480 the cut lands close on the column (matching the push into the leaflet's diagram), coins pouring in; the camera pulls back
//   as the coins reach the $5M ring ($5 MILLION lands on its word); on "nobody won" it cranes to the shut MATCH 6 gate (its lamp
//   blinks, NOBODY MATCHED 6); on "rolled down" the spout opens and the coins cascade tray to tray while the camera follows down
//   the staircase; on "On those days" it travels to a balance in front: tickets stack on one pan, prize coins on the other, and on
//   "math" the beam tips to the prizes (MATH ON YOUR SIDE).
//   ★ rev 5 (builder Q, Timur 2026-11-27): the camera is five long overlapping glides (see shots); the balance has no lit pointer ("that
//   weird blue line in the middle of the scale") and no lit lines anywhere on the machine (chute lips and the plinth bead are steel);
//   the left pan carries JERRY'S TICKET STACK (ticket_stack.ts) and the station ends with a push onto it that MATCH-CUTS to the same
//   stack on his kitchen table (st_test) — no dissolve; a shadow catcher and contact shadows put the key's shadows on the floor; the
//   floor runs into the fog and the sky is the fog's own colour at the horizon (FogSky), so no horizon line shows.
import React, { useMemo, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { canvasTex, std, ease, easeOut, rnd, clamp01, lerp, Glow, FOG } from "./kit";
import { Tag, Counter } from "./overlays";
import { wf, wEnd } from "./take";
import { cueAt } from "../bnx/SfxLayer";
import { BODY, FIGURE } from "./fonts3d";
import { drawTicket } from "./ticket_art";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { TK_N, tkLocal, PILE_K, MATCH_CUT, cue } from "./ticket_stack";
import { TicketBundle, ContactShadow, AOFlat, AOSkirt, AOSleeve, AOGroove, AORing } from "./ticket_bundle";
import { HOOK_SHIFT } from "./shift";

const O = [300, 0, 0];
const W = (p) => [p[0] + O[0], p[1] + O[1], p[2] + O[2]];
export const T = () => ({
  cut: wf("When", 1) - 1, jackpot: wf("jackpot", 1), five: wf("$5"), fiveEnd: wEnd("$5"), nobody: wf("nobody"), won: wf("won"),
  money: wf("money", 1), rolled: wf("rolled"), down: wf("down", 1), smaller: wf("smaller"), prizes: wf("prizes"), prizesEnd: wEnd("prizes"),
  on: wf("On", 1), days: wf("days"), enough: wf("enough"), tickets: wf("tickets", 1), math: wf("math"), put: wf("put"), side: wf("side"), sideEnd: wEnd("side"), jerry: wf("Jerry", 2)
});
// ── the machine's dimensions ─────────────────────────────────────────────────────────────────────────────────────────────
const R = 0.95, BASE = 0.6, TOP = 5.6, LINE = 4.6, SPOUT = 4.25, COIN_R = 0.105, COIN_T = 0.022;
const TRAYS = [
  { k: 5, x: 2.45, y: 3.45, w: 1.5, d: 1.15 },
  { k: 4, x: 3.45, y: 2.25, w: 1.5, d: 1.15 },
  { k: 3, x: 4.45, y: 1.05, w: 1.5, d: 1.15 }
];
const T6 = { x: 2.15, y: 5.55, w: 1.2, d: 1.0 };
const BAL = { x: 6.9, z: 2.7, h: 2.35, arm: 0.92, yaw: 0.55 };   // rev 5: the pivot 0.3 m higher (the pans hang longer, clear of the stack)
const balPt = (p) => { const c = Math.cos(BAL.yaw), s = Math.sin(BAL.yaw); return [BAL.x + p[0] * c + p[2] * s, p[1], BAL.z - p[0] * s + p[2] * c]; };
// the coin level in the column: rising to the $5M ring, holding, then draining as the money rolls down
const level = (t, f) => {
  const up = lerp(1.85, LINE, ease(f, t.cut - 6, t.five + 14));
  return lerp(up, 1.15, ease(f, t.rolled - 8, t.prizesEnd - 4));
};
const fillK = (t, f, i) => ease(f, t.rolled - 2 + i * 12, t.prizesEnd + 2 + i * 4);   // each tray's heap
const spoutOpen = (t, f) => ease(f, t.rolled - 12, t.rolled - 2) * (1 - ease(f, t.prizesEnd + 10, t.prizesEnd + 22));
// ── textures ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const stackTex = () => canvasTex("rd_stack", 256, 512, (c, w, h) => {
  const rows = 32, rh = h / rows;
  for (let r = 0; r < rows; r++) {
    const gold = rnd(r * 3 + 1) < 0.18;
    const g = c.createLinearGradient(0, r * rh, 0, (r + 1) * rh);
    if (gold) { g.addColorStop(0, "#EEE0B8"); g.addColorStop(0.5, "#BFA872"); g.addColorStop(1, "#5E5236"); }
    else { g.addColorStop(0, "#E4EEF9"); g.addColorStop(0.5, "#9FB8D8"); g.addColorStop(1, "#4B6286"); }
    c.fillStyle = g; c.fillRect(0, r * rh, w, rh);
    c.fillStyle = "rgba(0,0,0,0.28)"; for (let x = (rnd(r) * 6) | 0; x < w; x += 6) c.fillRect(x, r * rh + 2, 1.5, rh - 4);   // reeding
    c.fillStyle = "rgba(3,12,28,0.85)"; c.fillRect(0, (r + 1) * rh - 1.5, w, 1.5);
    // stacks don't line up: a dark notch where a coin sits proud
    c.fillStyle = "rgba(3,12,28,0.18)"; c.fillRect(rnd(r + 40) * w, r * rh, 18 + rnd(r + 9) * 30, rh);
  }
});
// ★ rev 2 (builder C) — THE PRIZE BINS (Timur: "a bit too boxy … not detailed enough … a lot more detail into the boxes, so they look a lot
//   more eye-catching, aesthetic"). Each tier is a glass-fronted prize bin: a bevelled brushed-steel base on a cantilever bracket from a
//   column behind it, a glass hopper with brushed corner posts and top/bottom rails, rivets, a navy-enamel floor, light-blue lit edges,
//   a polished pour lip on its right side (5 → 4 → 3) and an engraved tier plate (MATCH 5 / MATCH 4 / MATCH 3, "5 OF 6 NUMBERS", a row of
//   six real enamel balls — the matched ones white with their numbers, the rest navy). The coins and their choreography are unchanged.
const BIN_H = 0.32, BASE_H = 0.15, POST_Z = -0.82, POST_X = -0.35;
const BALL_NUMS = [4, 11, 19, 27, 33, 42];
const plateTex = (k) => canvasTex("rd_plate2_" + k, 2048, 704, (c, w, h) => {
  // a navy enamel panel inside a cut border
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#123F78"); g.addColorStop(0.55, "#0A2C5A"); g.addColorStop(1, "#061D40");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 2200; i++) { c.fillStyle = `rgba(255,255,255,${rnd(i + k * 13) * 0.035})`; c.fillRect(rnd(i * 3 + 1) * w, rnd(i * 7 + 2) * h, 2, 2); }
  c.strokeStyle = "rgba(179,206,239,0.95)"; c.lineWidth = 10; c.strokeRect(26, 26, w - 52, h - 52);
  c.strokeStyle = "rgba(127,180,242,0.55)"; c.lineWidth = 3; c.strokeRect(52, 52, w - 104, h - 104);
  // the engraved title, with a 1-px light chamfer under each stroke
  c.textBaseline = "alphabetic"; c.textAlign = "left";
  c.font = `800 210px ${BODY}`; c.letterSpacing = "22px";
  c.fillStyle = "rgba(0,8,24,0.75)"; c.fillText("MATCH " + k, 118, 300);
  c.fillStyle = "#F4F8FD"; c.fillText("MATCH " + k, 110, 292);
  c.letterSpacing = "0px";
  c.textAlign = "right"; c.font = `700 64px ${BODY}`; c.fillStyle = "#B3CEEF"; c.letterSpacing = "8px";
  c.fillText(k + " OF 6 NUMBERS", w - 112, 190);
  c.font = `600 46px ${BODY}`; c.fillStyle = "rgba(179,206,239,0.75)"; c.fillText(k === 6 ? "JACKPOT TIER" : "PRIZE TIER", w - 112, 270);
  c.letterSpacing = "0px";
  // the rule between title and the ball row, and the six ball sockets (the 3-D enamel balls sit in them)
  c.fillStyle = "rgba(179,206,239,0.6)"; c.fillRect(110, 352, w - 220, 4);
  for (let i = 0; i < 6; i++) {
    const x = w / 2 + (i - 2.5) * 262, y = 530;
    const sg = c.createRadialGradient(x, y + 10, 40, x, y, 104); sg.addColorStop(0, "rgba(0,6,18,0.85)"); sg.addColorStop(0.8, "rgba(0,6,18,0.5)"); sg.addColorStop(1, "rgba(0,6,18,0)");
    c.fillStyle = sg; c.beginPath(); c.arc(x, y, 104, 0, 7); c.fill();
    c.strokeStyle = i < k ? "rgba(179,206,239,0.9)" : "rgba(90,120,170,0.6)"; c.lineWidth = 6; c.beginPath(); c.arc(x, y, 92, 0, 7); c.stroke();
  }
});
// an enamel lottery ball: white, a light-blue belt, its number in a white disc on the front (u 0.25 faces +z on a SphereGeometry)
const ballTex = (n) => canvasTex("rd_ball_" + n, 512, 256, (c, w, h) => {
  c.fillStyle = "#F7FAFE"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#4D8ED9"; c.fillRect(0, h * 0.36, w, h * 0.28);
  c.fillStyle = "#FFFFFF"; c.beginPath(); c.ellipse(w * 0.25, h / 2, 62, 58, 0, 0, 7); c.fill();
  c.fillStyle = "#0B2A57"; c.font = `400 86px ${FIGURE}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(String(n), w * 0.25, h / 2 + 4);
  c.fillStyle = "#FFFFFF"; c.beginPath(); c.ellipse(w * 0.75, h / 2, 62, 58, 0, 0, 7); c.fill();
  c.fillStyle = "#0B2A57"; c.fillText(String(n), w * 0.75, h / 2 + 4);
});
// brushed steel: fine horizontal grain (map and roughness)
const brushedTex = () => canvasTex("rd_brushed", 512, 512, (c, w, h) => {
  c.fillStyle = "#C3CFDD"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 4200; i++) {
    const y = rnd(i * 2 + 1) * h, x = rnd(i * 5 + 3) * w, len = 30 + rnd(i + 7) * 260, v = rnd(i + 11);
    c.fillStyle = v < 0.5 ? `rgba(255,255,255,${0.05 + v * 0.12})` : `rgba(40,55,80,${0.03 + (v - 0.5) * 0.1})`;
    c.fillRect(x, y, len, 1);
  }
});
let BIN_MATS = null;
const binMats = () => {
  if (BIN_MATS) return BIN_MATS;
  const br = brushedTex();
  BIN_MATS = {
    steel: new THREE.MeshStandardMaterial({ color: "#AFC2DA", map: br, roughnessMap: br, roughness: 0.42, metalness: 0.92, envMapIntensity: 1.25 }),
    dark: new THREE.MeshStandardMaterial({ color: "#2A3D58", map: br, roughness: 0.4, metalness: 0.85, envMapIntensity: 1.0 }),
    enamel: new THREE.MeshPhysicalMaterial({ color: "#0E2B55", roughness: 0.3, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.9 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#CFE2F8", roughness: 0.02, metalness: 0, transparent: true, opacity: 0.16, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide, clearcoat: 1 }),
    glassEdge: new THREE.MeshBasicMaterial({ color: "#DCEBFC", transparent: true, opacity: 0.55, toneMapped: false, depthWrite: false }),
    chrome: new THREE.MeshStandardMaterial({ color: "#DCE6F2", roughness: 0.14, metalness: 1, envMapIntensity: 1.6 }),
    polished: new THREE.MeshStandardMaterial({ color: "#B9CBE0", map: br, roughness: 0.26, metalness: 0.9, envMapIntensity: 1.4, side: THREE.DoubleSide }),
    ballOff: new THREE.MeshPhysicalMaterial({ color: "#1A3563", roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.1 })
  };
  return BIN_MATS;
};
const rbox = (w, h, d, r, x, y, z) => { const g = new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4)); g.translate(x, y, z); return g; };
const cyl = (r0, r1, h, x, y, z, seg = 20, rx = 0, rz = 0) => { const g = new THREE.CylinderGeometry(r0, r1, h, seg); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); g.translate(x, y, z); return g; };
// a polished half-pipe chute of length L along +x (open on top), its rim at y 0, with rolled lips; ry0 = inner radius
const halfPipe = (L, r = 0.2, t = 0.018) => {
  const sh = new THREE.Shape();
  sh.absarc(0, 0, r + t, Math.PI, 2 * Math.PI, false); sh.absarc(0, 0, r, 2 * Math.PI, Math.PI, true);
  const g = new THREE.ExtrudeGeometry(sh, { depth: L, bevelEnabled: false, curveSegments: 18 });
  g.rotateY(Math.PI / 2);   // extrude along +x
  const lipA = cyl(0.018, 0.018, L, L / 2, 0, r + t / 2, 10, 0, Math.PI / 2), lipB = cyl(0.018, 0.018, L, L / 2, 0, -(r + t / 2), 10, 0, Math.PI / 2);
  return mergeGeometries([g.toNonIndexed(), lipA.toNonIndexed(), lipB.toNonIndexed()]);
};
/** Bin: a prize bin with its floor (the coins' heap plane) at the group origin. open: the right side is a pour lip (feeds the next bin);
 *  gate: the left side is left to MATCH 6's gate; h: the height of the floor above the studio floor (for the support column). */
const Bin = ({ w, d, k, lit, h, open = false, gate = false, lite = false, postX = POST_X }) => {
  const M = binMats();
  const plate = useMemo(() => plateTex(k), [k]);
  const geo = useMemo(() => {
    const steel = [], dark = [], glass = [], edges = [], strips = [];
    const hw = w / 2, hd = d / 2, pr = 0.026;
    // the base: a bevelled brushed slab, a darker plinth band under it
    steel.push(rbox(w + 0.1, BASE_H, d + 0.1, 0.03, 0, -BASE_H / 2, 0));
    dark.push(rbox(w - 0.06, 0.06, d - 0.06, 0.02, 0, -BASE_H - 0.03, 0));
    // the corner posts (square tube) and the rails
    const corners = [[-hw, -hd], [-hw, hd], [hw, -hd], [hw, hd]].filter(([x]) => !(gate && x < 0));
    corners.forEach(([x, z]) => steel.push(rbox(0.05, BIN_H + 0.02, 0.05, 0.012, x, BIN_H / 2, z)));
    steel.push(rbox(w + 0.05, 0.036, 0.046, 0.012, 0, BIN_H, hd), rbox(w + 0.05, 0.036, 0.046, 0.012, 0, BIN_H, -hd));                // top rails
    steel.push(rbox(w + 0.03, 0.03, 0.04, 0.01, 0, 0.02, hd), rbox(w + 0.03, 0.03, 0.04, 0.01, 0, 0.02, -hd));                        // bottom rails
    if (!gate) steel.push(rbox(0.046, 0.036, d + 0.05, 0.012, -hw, BIN_H, 0), rbox(0.04, 0.03, d + 0.03, 0.01, -hw, 0.02, 0));
    if (!open) steel.push(rbox(0.046, 0.036, d + 0.05, 0.012, hw, BIN_H, 0), rbox(0.04, 0.03, d + 0.03, 0.01, hw, 0.02, 0));
    else steel.push(rbox(0.046, 0.036, d + 0.05, 0.012, hw, BIN_H, 0));                                                              // open side: a header only
    // the glass: front, back, left (and right when closed); a bright edge line along each pane's top
    const pane = (pw, ph, x, z, along) => { glass.push(along === "x" ? rbox(pw, ph, 0.012, 0.004, x, ph / 2 + 0.03, z) : rbox(0.012, ph, pw, 0.004, x, ph / 2 + 0.03, z)); };
    pane(w - 0.05, BIN_H - 0.04, 0, hd, "x"); pane(w - 0.05, BIN_H - 0.04, 0, -hd, "x");
    if (!gate) pane(d - 0.05, BIN_H - 0.04, -hw, 0, "z");
    if (!open) pane(d - 0.05, BIN_H - 0.04, hw, 0, "z");
    edges.push(rbox(w - 0.06, 0.006, 0.014, 0.002, 0, BIN_H - 0.012, hd + 0.001));
    // the pour lip: a polished half-pipe stepping down out of the open side toward the next bin
    let lip = null;
    if (open) { lip = halfPipe(0.36, 0.24); lip.rotateZ(-0.42); lip.translate(hw - 0.02, 0.05, 0); }
    // the support: a round column behind the bin with collars and a foot, a cantilever arm and a gusset under the base
    const ph = Math.max(0.2, h - BASE_H - 0.06);
    steel.push(cyl(0.06, 0.06, ph, postX, -BASE_H - 0.06 - ph / 2, POST_Z, 28));
    steel.push(cyl(0.085, 0.085, 0.05, postX, -BASE_H - 0.09, POST_Z, 28), cyl(0.085, 0.085, 0.04, postX, -BASE_H - 0.06 - ph * 0.5, POST_Z, 28));
    dark.push(cyl(0.19, 0.21, 0.05, postX, -h + 0.025, POST_Z, 32), cyl(0.1, 0.13, 0.06, postX, -h + 0.08, POST_Z, 28));
    steel.push(rbox(0.12, 0.07, Math.abs(POST_Z) + 0.35, 0.02, postX, -BASE_H - 0.07, (POST_Z + 0.35) / 2));
    dark.push(rbox(0.04, 0.22, 0.4, 0.01, postX, -BASE_H - 0.18, POST_Z + 0.22));
    // the tier plate's frame on the base's front
    steel.push(rbox(1.16, 0.46, 0.05, 0.02, 0.0, -BASE_H - 0.26, hd + 0.075));
    // light strips: the base's front top edge and its foot, the plate frame's lower lip
    strips.push(rbox(w + 0.04, 0.008, 0.01, 0.003, 0, -0.008, hd + 0.053), rbox(w - 0.1, 0.008, 0.01, 0.003, 0, -BASE_H - 0.004, hd + 0.053));
    strips.push(rbox(1.08, 0.008, 0.01, 0.003, 0, -BASE_H - 0.48, hd + 0.1));
    const mg = (a) => mergeGeometries(a.map((g) => (g.index ? g.toNonIndexed() : g)));
    return { steel: mg(steel), dark: mg(dark), glass: mg(glass), edges: mg(edges), strips: mg(strips), lip };
  }, [w, d, open, gate, h, postX]);
  // rivets along the base's front and the plate frame's corners; the floor's enamel
  const rivRef = useRef();
  useLayoutEffect(() => {
    const m = rivRef.current; if (!m) return;
    const o = new THREE.Object3D(); let i = 0;
    const put = (x, y, z) => { o.position.set(x, y, z); o.rotation.set(Math.PI / 2, 0, 0); o.updateMatrix(); m.setMatrixAt(i++, o.matrix); };
    const n = 11; for (let j = 0; j < n; j++) put(-w / 2 + 0.02 + (j * (w - 0.04)) / (n - 1), -BASE_H / 2, d / 2 + 0.05);
    [[-0.54, -BASE_H - 0.07], [0.54, -BASE_H - 0.07], [-0.54, -BASE_H - 0.45], [0.54, -BASE_H - 0.45]].forEach(([x, y]) => put(x, y, d / 2 + 0.1));
    m.count = i; m.instanceMatrix.needsUpdate = true;
  }, [w, d]);
  const rivetGeo = useMemo(() => new THREE.SphereGeometry(0.014, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), []);
  const balls = useMemo(() => BALL_NUMS.map((n, i) => (i < k ? new THREE.MeshPhysicalMaterial({ map: ballTex(n), roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.1, emissive: new THREE.Color("#7FB4F2"), emissiveIntensity: 0 }) : M.ballOff)), [k]);
  balls.forEach((m, i) => { if (i < k) m.emissiveIntensity = 0.12 + 0.3 * lit; });
  const ballGeo = useMemo(() => new THREE.SphereGeometry(0.048, 24, 16), []);
  const stripMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#7FB4F2", toneMapped: false, transparent: true }), []);
  stripMat.opacity = 0.35 + 0.65 * lit;
  const sh = !lite;
  return (
    <group>
      <mesh geometry={geo.steel} material={M.steel} castShadow={sh} receiveShadow />
      <mesh geometry={geo.dark} material={M.dark} castShadow={sh} receiveShadow />
      {geo.lip && <mesh geometry={geo.lip} material={M.polished} castShadow={sh} receiveShadow />}
      <mesh geometry={geo.glass} material={M.glass} renderOrder={2} />
      <mesh geometry={geo.edges} material={M.glassEdge} />
      <mesh geometry={geo.strips} material={stripMat} />
      {/* the floor: navy enamel inside the glass */}
      <mesh position={[0, 0.004, 0]} rotation-x={-Math.PI / 2} material={M.enamel} receiveShadow><planeGeometry args={[w - 0.04, d - 0.04]} /></mesh>
      {/* rev 6 — baked AO: the floor darkens into its corners where the glass meets it, under the coin heap as it fills, round the post's
          foot on the studio floor, and on the post just under the bin's base */}
      {!lite && <AOFlat position={[0, 0.008, 0]} size={[w - 0.04, d - 0.04]} kind="frame" opacity={0.6} />}
      {!lite && lit > 0.01 && <AOFlat position={[0, 0.009, 0]} size={[w * 0.9, d * 0.9]} kind="rect" opacity={0.35 * lit} />}
      {!lite && <AOFlat position={[postX + 0.06, -h + 0.007, POST_Z + 0.04]} size={[0.8, 0.8]} opacity={0.6} />}
      {!lite && <AOSleeve position={[postX, -BASE_H - 0.36, POST_Z]} r={0.064} h={0.28} opacity={0.5} flip />}
      {/* the tier plate: the engraved enamel panel and its six enamel balls */}
      <mesh position={[0, -BASE_H - 0.26, d / 2 + 0.101]}><planeGeometry args={[1.08, 0.37]} /><meshStandardMaterial map={plate} emissiveMap={plate} emissive="#ffffff" emissiveIntensity={0.32 + 0.5 * lit} roughness={0.3} metalness={0.1} /></mesh>
      {!lite && BALL_NUMS.map((n, i) => <mesh key={n} geometry={ballGeo} material={balls[i]} position={[((i - 2.5) * 262 / 2048) * 1.08, -BASE_H - 0.26 - ((530 - 352) / 704) * 0.37, d / 2 + 0.115]} castShadow={false} />)}
      {!lite && <instancedMesh ref={rivRef} args={[rivetGeo, M.chrome, 16]} frustumCulled={false} />}
      {lit > 0.01 && !lite && <Glow position={[0, 0.15, d / 2 + 0.2]} size={1.9} color="#7FB4F2" opacity={0.3 * lit} />}
    </group>
  );
};
// a polished chute: a half-pipe with rolled lips, a flange where it leaves the column, a saddle under it
const Chute = ({ L, r = 0.2, sh = true }) => {
  const M = binMats();
  const g = useMemo(() => {
    const hp = halfPipe(L, r);
    const fl = rbox(0.04, r + 0.12, 2 * r + 0.16, 0.012, 0.02, -r / 2 + 0.02, 0);
    const strap = rbox(0.06, 0.07, 0.14, 0.012, L * 0.62, -r - 0.05, 0);
    return mergeGeometries([hp, fl.toNonIndexed(), strap.toNonIndexed()]);
  }, [L, r]);
  // a light-blue line along each rolled lip (the house's lit edge; it shows the chute's curve and its run)
  const lips = useMemo(() => mergeGeometries([cyl(0.006, 0.006, L - 0.04, L / 2, 0.016, r + 0.01, 6, 0, Math.PI / 2).toNonIndexed(), cyl(0.006, 0.006, L - 0.04, L / 2, 0.016, -(r + 0.01), 6, 0, Math.PI / 2).toNonIndexed()]), [L, r]);
  // rev 6: the half-pipe's inside bottom darkens along its run (baked AO: it reads as a trough, not a flat strip)
  return (<><mesh geometry={g} material={M.polished} castShadow={sh} receiveShadow /><mesh geometry={lips} material={M.chrome} />
    {sh && <AOGroove position={[L / 2, -r + 0.012, 0]} L={L - 0.06} wd={r * 1.5} opacity={0.5} />}</>);   // rev 5: chrome lip beads, no lit lines
};
const Tray = ({ tr, lit, lite }) => (
  <group position={[tr.x, tr.y, 0]}><Bin w={tr.w} d={tr.d} k={tr.k} lit={lit} h={tr.y} open={tr.k > 3} lite={lite} /></group>
);
const floorTex = () => canvasTex("rd_floor", 512, 512, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(120,170,235,0.55)"); g.addColorStop(0.35, "rgba(60,110,190,0.22)"); g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
const gridTex = () => canvasTex("rd_grid", 512, 512, (c, w, h) => {
  c.fillStyle = "#000"; c.fillRect(0, 0, w, h);
  c.strokeStyle = "rgba(127,180,242,0.55)"; c.lineWidth = 2;
  for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); }
});
// the small tickets on the pan: the compact (landscape) house WINFALL ticket — real printed numbers, no bars (ticket_art.ts)
const ticketFace = () => canvasTex("rd_ticket_v4", 256, 128, (c, w, h) => drawTicket(c, w, h, { seed: 5, compact: true }));
// ── materials ────────────────────────────────────────────────────────────────────────────────────────────────────────────
const MAT = {
  steel: std("#9DB4D2", 0.28, 0.85), dark: std("#1A2A40", 0.35, 0.7), plinth: std("#14243A", 0.3, 0.6), rim: new THREE.MeshBasicMaterial({ color: "#7FB4F2", toneMapped: false }),
  glass: new THREE.MeshPhysicalMaterial({ color: "#BFD8F5", roughness: 0.03, metalness: 0, transparent: true, opacity: 0.18, envMapIntensity: 1.3, depthWrite: false, side: THREE.DoubleSide, clearcoat: 1 }),
  coin: null,
  red: new THREE.MeshBasicMaterial({ color: "#FF5A5A", toneMapped: false })
};
const COIN_COLS = ["#C9D9EE", "#B4C9E4", "#DCE7F4", "#E3C988", "#A9C0DE", "#D6B86E"];
const coinGeo = new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 28);
// the coin's faces: a raised rim, a ring of dots and a "$" in relief (greyscale — the instance colour tints it silver-blue or gold)
const coinFace = () => canvasTex("rd_coinface", 256, 256, (c, w, h) => {
  const g = c.createRadialGradient(w * 0.38, h * 0.36, 10, w / 2, h / 2, w / 2);
  g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.7, "#C9CED6"); g.addColorStop(1, "#8D939C");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.lineWidth = 14; c.strokeStyle = "#F4F6FA"; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 12, 0, 7); c.stroke();
  c.lineWidth = 4; c.strokeStyle = "#6E747E"; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 22, 0, 7); c.stroke();
  for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2; c.fillStyle = "#7C838E"; c.beginPath(); c.arc(w / 2 + Math.cos(a) * 92, h / 2 + Math.sin(a) * 92, 3, 0, 7); c.fill(); }
  c.font = `140px ${FIGURE}`; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillStyle = "#6A707A"; c.fillText("$", w / 2 + 4, h / 2 + 10); c.fillStyle = "#FBFCFE"; c.fillText("$", w / 2, h / 2 + 6);
});
const coinEdge = () => canvasTex("rd_coinedge", 256, 16, (c, w, h) => {
  c.fillStyle = "#B9BFC8"; c.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 4) { c.fillStyle = "#6F7680"; c.fillRect(x, 0, 1.5, h); }
});
let coinMats = null;
const getCoinMats = () => {
  if (coinMats) return coinMats;
  const face = new THREE.MeshStandardMaterial({ map: coinFace(), roughness: 0.3, metalness: 0.88, envMapIntensity: 1.4 });
  const edge = new THREE.MeshStandardMaterial({ map: coinEdge(), roughness: 0.32, metalness: 0.9, envMapIntensity: 1.4 });
  coinMats = [edge, face, face];
  return coinMats;
};
// one instanced mesh of coins, its poses recomputed each frame: list(f) → [{p, r:[x,y,z], s, c}]
const Coins = ({ f, list, n, shadows = true }) => {
  const ref = useRef();
  useLayoutEffect(() => {
    const m = ref.current; if (!m) return;
    const o = new THREE.Object3D(), col = new THREE.Color();
    const L = list(f);
    for (let i = 0; i < n; i++) {
      const q = L[i];
      if (!q || q.s <= 0.001) { o.position.set(0, -50, 0); o.scale.setScalar(0.0001); }
      else { o.position.set(q.p[0], q.p[1], q.p[2]); o.rotation.set(q.r[0], q.r[1], q.r[2]); o.scale.setScalar(q.s); }
      o.updateMatrix(); m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, col.set(COIN_COLS[(q?.ci ?? i) % COIN_COLS.length]));
    }
    m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[coinGeo, getCoinMats(), n]} castShadow={shadows} receiveShadow frustumCulled={false} />;
};
// ── the coin choreography ────────────────────────────────────────────────────────────────────────────────────────────────
// a stream: coin i is born at t0 + i·dt (until t1) and travels A → B over `dur` frames on an arc that bows `arc` up
const stream = (f, { t0, t1, dt, dur, A, B, arc = 0.3, jit = 0.2, seed = 0, n }) => {
  const out = [];
  for (let i = 0; i < n; i++) {
    const b = t0 + i * dt;
    if (b > t1) { out.push(null); continue; }
    const u = (f - b) / dur;
    if (u < 0 || u > 1) { out.push(null); continue; }
    const jx = (rnd(seed + i) - 0.5) * jit, jz = (rnd(seed + i + 50) - 0.5) * jit;
    const uu = u;   // gravity: the fall speeds up
    const p = [lerp(A[0], B[0] + jx, uu), lerp(A[1], B[1], uu * uu) + arc * Math.sin(Math.PI * uu) * (1 - uu), lerp(A[2] + jz * 0.5, B[2] + jz, uu)];
    const spin = (f - b) * (0.25 + rnd(seed + i + 9) * 0.2);
    out.push({ p, r: [spin, rnd(seed + i + 3) * 6, spin * 0.6], s: clamp01(u * 8) * clamp01((1 - u) * 10 + 0.4), ci: (seed + i) % 6 });
  }
  return out;
};
// a heap lying in a tray (or on the column's surface): coin j lands at time land(j) and settles flat with a small drop
const heap = (f, { n, cx, cy, cz, w, d, layers, k, seed, t0, t1 }) => {
  const out = [];
  const per = Math.ceil(n / layers);
  for (let j = 0; j < n; j++) {
    const at = lerp(t0, t1, j / n) + rnd(seed + j) * 3;
    const a = ease(f, at, at + 5);
    if (a <= 0 || j / n > k) { out.push(null); continue; }
    const layer = Math.floor(j / per), m = j % per;
    const cols = Math.ceil(Math.sqrt(per * w / d));
    const gx = (m % cols + 0.5) / cols - 0.5, gz = (Math.floor(m / cols) + 0.5) / Math.ceil(per / cols) - 0.5;
    const x = cx + gx * w * 0.9 + (rnd(seed + j * 3) - 0.5) * 0.08, z = cz + gz * d * 0.9 + (rnd(seed + j * 5) - 0.5) * 0.08;
    const mound = (1 - (gx * gx + gz * gz) * 2) * layer * 0.6;
    const y = cy + COIN_T * (0.5 + layer * 1.6 + mound) + (1 - a) * 0.35;
    out.push({ p: [x, y, z], r: [(rnd(seed + j + 1) - 0.5) * 0.3, rnd(seed + j + 2) * 6, (rnd(seed + j + 4) - 0.5) * 0.3], s: 0.4 + 0.6 * a, ci: (seed + j) % 6 });
  }
  return out;
};
// rev 6: a cylinder's turn into shade, around u (three's CylinderGeometry: x = r·sin(2πu), z = r·cos(2πu)); lit toward the station key
//   (horizontal direction (−9, 8) from the light target), darkest on the opposite side
const wallShadeTex = () => canvasTex("rd_wallshade_v6", 256, 4, (c, w, h) => {
  const lit = Math.atan2(-9, 8);   // θ with sinθ ∝ x = −9, cosθ ∝ z = 8
  for (let i = 0; i < w; i++) {
    const th = ((i + 0.5) / w) * Math.PI * 2, k = Math.max(0, -Math.cos(th - lit) + 0.25) / 1.25;
    c.fillStyle = `rgba(0,6,18,${(0.62 * Math.pow(k, 0.9)).toFixed(3)})`; c.fillRect(i, 0, 1, h);
  }
});
// ── parts ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const Ring = ({ y, r = R + 0.06, tube = 0.05, m = MAT.steel }) => (
  <mesh position={[0, y, 0]} rotation-x={Math.PI / 2} material={m} castShadow><torusGeometry args={[r, tube, 12, 64]} /></mesh>
);
// ★ rev 7 — THE JACKPOT METER (Timur: "instead of on-screen text like $5 million … add them somewhere within the scene that actually matches
//   the visual itself"). A progressive-jackpot LED meter mounted on the coin column's front (as on a real lottery terminal / casino
//   column): a blue-steel housing on two brackets, a smoked face lettered JACKPOT, and seven-segment digits that climb with the coins
//   from $4,1xx,xxx and land on $5,000,000 on "$5 million" (five + 2). It comes into frame from the top as the camera pulls back off the
//   coin wall, and is read across "$5 million" (real 567–590).
const MET = { y: 2.5, z: R + 0.105, az: 0.36, w: 0.6, h: 0.23, d: 0.06 };   // az: turned 21° round the column toward the camera's side
const MET_ROW = { y: -0.008, h: 0.1, cw: 0.058, comma: 0.024, dollar: 0.056, gap: 0.004 };   // the digit row (y: its centre above the face centre)
const meterLayout = () => {   // x of each glyph's centre, left to right: $, d6, ",", d5 d4 d3, ",", d2 d1 d0
  const order = ["$", 6, ",", 5, 4, 3, ",", 2, 1, 0];
  const wOf = (g) => (g === "$" ? MET_ROW.dollar : g === "," ? MET_ROW.comma : MET_ROW.cw);
  const total = order.reduce((a, g) => a + wOf(g) + MET_ROW.gap, -MET_ROW.gap);
  let x = -total / 2; const out = [];
  for (const g of order) { out.push({ g, x: x + wOf(g) / 2 }); x += wOf(g) + MET_ROW.gap; }
  return out;
};
// seven-segment digits 0–9, top to bottom (lit segments light blue-white, the unlit ones faintly visible, as on a real LED meter)
const SEG = { 0: "abcdef", 1: "bc", 2: "abdeg", 3: "abcdg", 4: "bcfg", 5: "acdfg", 6: "acdefg", 7: "abc", 8: "abcdefg", 9: "abcdfg" };
const segStripTex = () => canvasTex("rd_meterdigits_v7", 96, 1600, (c, w, h) => {
  c.fillStyle = "#03101F"; c.fillRect(0, 0, w, h);
  const ch = 160, sw = 12, L = 56, x0 = 20, yT = 14;
  const seg = (k, y0, on) => {
    c.fillStyle = on ? "#D6EBFF" : "rgba(110,150,210,0.09)";
    const hz = (x, y) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x + sw / 2, y - sw / 2); c.lineTo(x + L - sw / 2, y - sw / 2); c.lineTo(x + L, y); c.lineTo(x + L - sw / 2, y + sw / 2); c.lineTo(x + sw / 2, y + sw / 2); c.closePath(); c.fill(); };
    const vt = (x, y) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x + sw / 2, y + sw / 2); c.lineTo(x + sw / 2, y + L - sw / 2); c.lineTo(x, y + L); c.lineTo(x - sw / 2, y + L - sw / 2); c.lineTo(x - sw / 2, y + sw / 2); c.closePath(); c.fill(); };
    const yA = y0 + yT, yG = yA + L + 4, yD = yG + L + 4;
    ({ a: () => hz(x0, yA), g: () => hz(x0, yG), d: () => hz(x0, yD), f: () => vt(x0 - 2, yA + 2), b: () => vt(x0 + L + 2, yA + 2), e: () => vt(x0 - 2, yG + 2), c: () => vt(x0 + L + 2, yG + 2) })[k]();
  };
  for (let d = 0; d < 10; d++) {
    const y0 = d * ch;
    c.save(); c.shadowColor = "rgba(150,200,255,0.9)"; c.shadowBlur = 8;
    for (const k of "abcdefg") seg(k, y0, SEG[d].includes(k));
    c.restore();
  }
});
const meterFaceTex = () => canvasTex("rd_meterface_v7", 1200, 460, (c, w, h) => {
  const px = w / (MET.w - 0.02);
  c.fillStyle = "#03101F"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 1600; i++) { c.fillStyle = `rgba(120,170,240,${rnd(i + 5) * 0.03})`; c.fillRect(rnd(i * 3) * w, rnd(i * 7 + 1) * h, 2, 2); }   // the smoked glass
  c.textAlign = "center"; c.textBaseline = "middle";
  c.fillStyle = "#7FB4F2"; c.font = `800 ${Math.round(0.034 * px)}px ${BODY}`; c.letterSpacing = `${Math.round(0.012 * px)}px`;
  c.fillText("WINFALL JACKPOT", w / 2, h * 0.17);
  c.letterSpacing = "0px";
  // the "$" and the commas, in the LED's light (the digits sit on their own planes)
  c.save(); c.shadowColor = "rgba(150,200,255,0.9)"; c.shadowBlur = 10; c.fillStyle = "#D6EBFF";
  const cy = h / 2 - MET_ROW.y * px;
  for (const gl of meterLayout()) {
    if (gl.g === "$") { c.font = `700 ${Math.round(0.11 * px)}px ${BODY}`; c.fillText("$", w / 2 + gl.x * px, cy + 2); }
    if (gl.g === ",") { c.beginPath(); c.arc(w / 2 + gl.x * px, cy + MET_ROW.h * 0.42 * px, 0.006 * px, 0, 7); c.fill(); c.fillRect(w / 2 + gl.x * px - 2, cy + MET_ROW.h * 0.42 * px, 4, 0.012 * px); }
  }
  c.restore();
  c.fillStyle = "rgba(127,180,242,0.6)"; c.font = `600 ${Math.round(0.017 * px)}px ${BODY}`; c.letterSpacing = "4px";
  c.fillText("ROLLS DOWN AT $5 MILLION IF NO ONE MATCHES 6", w / 2, h * 0.86);
  c.letterSpacing = "0px";
});
const meterValue = (t, f) => {
  const k = easeOut(f, t.cut - 6, t.five + 2);
  return Math.min(5000000, Math.floor(4137560 + (5000000 - 4137560) * k));
};
const JackpotMeter = ({ f, t }) => {
  const face = useMemo(meterFaceTex, []);
  const L = useMemo(meterLayout, []);
  const digits = useMemo(() => [6, 5, 4, 3, 2, 1, 0].map((k) => {
    const tx = segStripTex().clone(); tx.repeat.set(1, 0.1); tx.needsUpdate = true;
    return { k, tx, m: new THREE.MeshBasicMaterial({ map: tx, toneMapped: false }) };
  }), []);
  const v = meterValue(t, f), landed = f >= t.five + 2;
  digits.forEach(({ k, tx }) => { const d = Math.floor(v / Math.pow(10, k)) % 10; tx.offset.y = 1 - (d + 1) / 10; });
  return (
    <group position={[Math.sin(MET.az) * MET.z, MET.y, Math.cos(MET.az) * MET.z]} rotation-y={MET.az}>
      {/* the housing (blue steel), its bezel, two brackets back to the glass */}
      <mesh material={MAT.dark} castShadow receiveShadow><boxGeometry args={[MET.w + 0.04, MET.h + 0.04, MET.d]} /></mesh>
      <mesh position={[0, 0, MET.d / 2 + 0.002]} material={MAT.steel}><boxGeometry args={[MET.w + 0.05, MET.h + 0.05, 0.006]} /></mesh>
      {[-0.22, 0.22].map((x) => <mesh key={x} position={[x, 0, -MET.d / 2 - 0.03]} material={MAT.steel} castShadow><boxGeometry args={[0.04, 0.08, 0.06]} /></mesh>)}
      {/* the smoked face and the digits */}
      <mesh position={[0, 0, MET.d / 2 + 0.0065]}><planeGeometry args={[MET.w - 0.02, MET.h - 0.01]} /><meshBasicMaterial map={face} toneMapped={false} /></mesh>
      {L.filter((gl) => typeof gl.g === "number").map((gl) => (
        <mesh key={gl.g} position={[gl.x, MET_ROW.y, MET.d / 2 + 0.008]} material={digits[6 - gl.g].m}><planeGeometry args={[MET_ROW.cw, MET_ROW.h]} /></mesh>
      ))}
      {/* a glass cover, and the LED's own light on its bezel when it lands */}
      <mesh position={[0, 0, MET.d / 2 + 0.012]}><planeGeometry args={[MET.w - 0.02, MET.h - 0.01]} /><meshPhysicalMaterial color="#CFE2F8" transparent opacity={0.06} roughness={0.04} clearcoat={1} depthWrite={false} envMapIntensity={0.9} /></mesh>
      <Glow position={[0, MET_ROW.y, MET.d / 2 + 0.05]} size={0.75} color="#7FB4F2" opacity={landed ? 0.22 : 0.12} />
    </group>
  );
};
// the machine (drawn twice: once for real, once mirrored in the glossy floor)
const Machine = ({ f, t, mirror = false }) => {
  const wallShade = useMemo(wallShadeTex, []);
  const stack = useMemo(() => { const x = stackTex().clone(); x.wrapS = x.wrapT = THREE.RepeatWrapping; x.needsUpdate = true; return x; }, []);
  const L = level(t, f);
  const hgt = Math.max(0.01, L - BASE);
  stack.repeat.set(3, hgt / 0.6);
  const sp = spoutOpen(t, f);
  const atLine = ease(f, t.five + 4, t.five + 16) * (1 - ease(f, t.rolled, t.rolled + 20));
  const blink = f > t.nobody - 4 && f < t.prizes ? (0.5 + 0.5 * Math.cos((f - t.nobody) / 3.2)) * ease(f, t.nobody - 4, t.nobody + 4) * (1 - ease(f, t.prizes - 10, t.prizes)) : 0;
  const lit = (i) => fillK(t, f, i);
  const sh = !mirror;
  return (
    <group>
      {/* the plinth: two steps with a light ring */}
      <mesh position={[0, 0.17, 0]} material={MAT.plinth} castShadow={sh} receiveShadow><cylinderGeometry args={[1.55, 1.65, 0.34, 64]} /></mesh>
      <mesh position={[0, 0.45, 0]} material={MAT.dark} castShadow={sh} receiveShadow><cylinderGeometry args={[1.22, 1.3, 0.22, 64]} /></mesh>
      <mesh position={[0, 0.345, 0]} rotation-x={Math.PI / 2} material={MAT.steel}><torusGeometry args={[1.565, 0.014, 8, 96]} /></mesh>   {/* rev 5: a polished steel bead, not a lit line */}
      {/* the coin column: the stack's wall, the loose coins on top, the glass, collars, the cage */}
      <mesh position={[0, BASE + hgt / 2, 0]} castShadow={sh}><cylinderGeometry args={[R - 0.07, R - 0.07, hgt, 48, 1, true]} /><meshStandardMaterial map={stack} roughness={0.3} metalness={0.85} envMapIntensity={1.3} /></mesh>
      <mesh position={[0, L - 0.005, 0]}><cylinderGeometry args={[R - 0.08, R - 0.08, 0.01, 48]} /><meshStandardMaterial color="#8FA7C8" roughness={0.35} metalness={0.85} /></mesh>
      {/* rev 6 — baked AO where the coin wall stands in its base collar and where the column meets the plinth's top */}
      {!mirror && <AOSleeve position={[0, BASE + 0.02, 0]} r={R - 0.064} h={0.55} opacity={0.5} />}
      {/* rev 6: the coin wall turns away from the key — its far side falls into shade (it read as a flat lit drum) */}
      {!mirror && <mesh position={[0, BASE + hgt / 2, 0]} renderOrder={1}><cylinderGeometry args={[R - 0.066, R - 0.066, hgt, 64, 1, true]} /><meshBasicMaterial map={wallShade} color="#000000" transparent depthWrite={false} toneMapped={false} /></mesh>}
      {!mirror && <AORing position={[0, 0.563, 0]} r0={R + 0.06} r1={1.22} opacity={0.6} />}
      {!mirror && <AORing position={[0, 0.343, 0]} r0={1.3} r1={1.56} opacity={0.5} />}
      <Coins f={f} n={60} shadows={false} list={(ff) => {
        const LL = level(t, ff);
        return Array.from({ length: 60 }, (_, j) => {
          const a = rnd(j + 7) * Math.PI * 2, rr = Math.sqrt(rnd(j + 3)) * (R - 0.2);
          return { p: [Math.cos(a) * rr, LL + COIN_T * (0.6 + rnd(j) * 1.6), Math.sin(a) * rr], r: [(rnd(j + 1) - 0.5) * 0.5, rnd(j + 2) * 6, (rnd(j + 5) - 0.5) * 0.5], s: 1, ci: j };
        });
      }} />
      <Coins f={f} n={40} shadows={false} list={(ff) => stream(ff, { t0: t.cut - 40, t1: t.five + 10, dt: 2, dur: 18, A: [0, TOP + 1.6, 0], B: [0, level(t, ff) + 0.05, 0], arc: 0, jit: 1.0, seed: 11, n: 40 })} />
      <mesh position={[0, (BASE + TOP) / 2, 0]} material={MAT.glass}><cylinderGeometry args={[R, R, TOP - BASE, 64, 1, true]} /></mesh>
      <Ring y={BASE + 0.05} tube={0.07} /><Ring y={TOP} tube={0.07} />
      {/* the glass's two long highlights (the key's and the top light's reflections) */}
      {[[-0.62, 0.22], [0.5, 0.12]].map(([a, o], i) => <mesh key={i} position={[Math.sin(a) * (R + 0.004), (BASE + TOP) / 2, Math.cos(a) * (R + 0.004)]} rotation-y={a}><planeGeometry args={[0.07 - i * 0.03, TOP - BASE - 0.3]} /><meshBasicMaterial color="#EAF3FF" transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>)}
      {[0, 1, 2, 3, 4, 5].map((i) => { const a = (i * Math.PI) / 3; return <mesh key={i} position={[Math.cos(a) * (R + 0.04), (BASE + TOP) / 2, Math.sin(a) * (R + 0.04)]} material={MAT.steel} castShadow={sh}><cylinderGeometry args={[0.018, 0.018, TOP - BASE, 6]} /></mesh>; })}
      {!mirror && <JackpotMeter f={f} t={t} />}
      {/* the $5M ring: it brightens as the coins reach it */}
      <mesh position={[0, LINE, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[R + 0.035, 0.018, 8, 96]} /><meshBasicMaterial color="#B3CEEF" toneMapped={false} transparent opacity={0.45 + 0.55 * atLine} /></mesh>
      {atLine > 0.01 && <Glow position={[0, LINE, R]} size={3.2} color="#7FB4F2" opacity={0.5 * atLine} />}
      {/* the MATCH 6 chute and tray behind its shut gate (the lamp blinks on "nobody won") */}
      <group position={[0, 0, 0]}>
        <group position={[R + 0.01, TOP - 0.08, 0]} rotation-z={-0.1}><Chute L={T6.x - T6.w / 2 - R - 0.04} r={0.2} sh={sh} /></group>
        <group position={[T6.x, T6.y - 0.3, 0]}>
          <Bin w={T6.w} d={T6.d} k={6} lit={0.25} h={T6.y - 0.3} gate postX={0.45} lite={mirror} />
          {!mirror && <AOFlat position={[-T6.w / 2 + 0.1, 0.01, 0]} size={[0.32, 0.95]} kind="rect" opacity={0.5} />}
          {/* the gate: a frame of bars across the chute's mouth, with a lock and its lamp */}
          <group position={[-T6.w / 2 - 0.02, 0.32, 0]}>
            {/* the frame: posts, rails */}
            {[-0.36, 0.36].map((z) => <mesh key={z} position={[0, 0, z]} material={MAT.dark} castShadow={sh}><boxGeometry args={[0.1, 0.82, 0.08]} /></mesh>)}
            {[-0.37, 0.37].map((y) => <mesh key={y} position={[0, y, 0]} material={MAT.dark} castShadow={sh}><boxGeometry args={[0.1, 0.08, 0.8]} /></mesh>)}
            {[-0.24, -0.12, 0, 0.12, 0.24].map((z) => <mesh key={z} position={[-0.01, 0, z]} material={MAT.steel} castShadow={sh}><cylinderGeometry args={[0.026, 0.026, 0.68, 10]} /></mesh>)}
            {/* the padlock and its lamp */}
            <group position={[-0.1, -0.05, 0.06]}>
              <mesh material={MAT.steel} castShadow={sh}><boxGeometry args={[0.07, 0.17, 0.2]} /></mesh>
              <mesh position={[0, 0.13, 0]} rotation-y={Math.PI / 2} material={MAT.steel}><torusGeometry args={[0.065, 0.016, 8, 20, Math.PI]} /></mesh>
              <mesh position={[-0.036, -0.02, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.016, 0.016, 0.006, 12]} /><meshBasicMaterial color="#0A1426" /></mesh>
            </group>
            <mesh position={[-0.06, 0.28, -0.22]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.05, 0.05, 0.03, 20]} /><meshBasicMaterial color={blink > 0.02 ? "#FF6B6B" : "#6A3038"} toneMapped={false} /></mesh>
            {blink > 0.02 && <Glow position={[-0.12, 0.28, -0.22]} size={0.7} color="#FF6A6A" opacity={0.8 * blink} />}
          </group>
        </group>
      </group>
      {/* the spout: a short chute from the column into MATCH 5, its door slides up on "rolled down" */}
      <group position={[R + 0.02, SPOUT + 0.02, 0]} rotation-z={-0.55}><Chute L={0.8} r={0.21} sh={sh} /></group>
      <mesh position={[R + 0.02, SPOUT + 0.06 + sp * 0.3, 0]} material={MAT.dark} castShadow={sh}><boxGeometry args={[0.05, 0.26, 0.46]} /></mesh>
      {TRAYS.map((tr, i) => <Tray key={tr.k} tr={tr} lit={lit(i)} lite={mirror} />)}
      {/* the cascade: spout → MATCH 5 → MATCH 4 → MATCH 3, and the heaps they build */}
      <Coins f={f} n={34} shadows={false} list={(ff) => stream(ff, { t0: t.rolled - 6, t1: t.prizes + 6, dt: 1.6, dur: 14, A: [R + 0.1, SPOUT - 0.05, 0], B: [TRAYS[0].x - 0.3, TRAYS[0].y + 0.05, 0], arc: 0.05, jit: 0.6, seed: 100, n: 34 })} />
      <Coins f={f} n={26} shadows={false} list={(ff) => stream(ff, { t0: t.rolled + 8, t1: t.prizesEnd, dt: 2, dur: 14, A: [TRAYS[0].x + TRAYS[0].w / 2, TRAYS[0].y + 0.1, 0], B: [TRAYS[1].x + 0.1, TRAYS[1].y + 0.05, 0], arc: 0.25, jit: 0.6, seed: 200, n: 26 })} />
      <Coins f={f} n={24} shadows={false} list={(ff) => stream(ff, { t0: t.rolled + 20, t1: t.prizesEnd + 4, dt: 2, dur: 14, A: [TRAYS[1].x + TRAYS[1].w / 2, TRAYS[1].y + 0.1, 0], B: [TRAYS[2].x + 0.1, TRAYS[2].y + 0.05, 0], arc: 0.25, jit: 0.6, seed: 300, n: 24 })} />
      {TRAYS.map((tr, i) => (
        <Coins key={i} f={f} n={70} shadows={sh} list={(ff) => heap(ff, { n: 70, cx: tr.x, cy: tr.y, cz: 0, w: tr.w - 0.15, d: tr.d - 0.15, layers: 2, k: 1, seed: 500 + i * 100, t0: t.rolled + 2 + i * 12, t1: t.prizesEnd + i * 4 })} />
      ))}
    </group>
  );
};
// ── the balance (rev 5, builder Q) ────────────────────────────────────────────────────────────────────────────────────────
// Timur (2026-11-27, 749 f): "remove that weird blue line in the middle of the scale itself" — it was the beam's pointer, drawn as a glowing
//   light-blue bar. Now a real beam balance: a stepped base, a turned column with collars, a steel beam on a knife-edge bearing (no pointer:
//   nothing hangs in the middle of the scale), and two pans that hang on three rods each from stirrup hooks. No lit lines. The
//   left pan's tickets are JERRY'S TICKET STACK (ticket_stack.ts, the kitchen's 36 banded bundles at PILE_K), so the camera can push onto
//   them and land, on the cut, on the same stack on his kitchen table (st_test). Everything casts and takes the key's shadow.
const HANG = 1.25, PAN_TOP = 0.03, PILE_YAW = -BAL.yaw;   // the pans hang 1.25 m under the beam ends; the pile is square to the world
const beamAngle = (t, f) => {
  const wl = easeOut(f, t.enough - 2, t.tickets + 12);           // tickets go on: the left pan dips
  const wr = easeOut(f, t.put, t.math + 8);    // prizes pour on: it tips the other way
  const target = 0.12 * wl - 0.40 * wr * wl;
  const settle = f > t.math + 8 ? 0.03 * Math.exp(-(f - t.math - 8) / 10) * Math.sin((f - t.math - 8) / 3) : 0;
  return target + settle;
};
// the rods: from the pan's rim (radius 0.44) up to the hook at the beam end; at pile-local angles 30/150/270°, clear of the stack's corners
const ROD_R = 0.44, ROD_ANG = [Math.PI / 6, (5 * Math.PI) / 6, (3 * Math.PI) / 2];   // none in front of the stack (the match looks at it from +z)
const rodLen = Math.hypot(ROD_R, HANG);
const rodQ = (ang) => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-Math.cos(ang) * ROD_R, HANG, -Math.sin(ang) * ROD_R).normalize());
/** the pile's frame at frame f: its origin (world, the pan's top under the stack's centre) and its world yaw */
export const pileFrame = (f) => {
  const t = T(), a = beamAngle(t, f);
  const lx = -BAL.arm * Math.cos(a), ly = BAL.h - BAL.arm * Math.sin(a) - HANG + PAN_TOP;
  const c = Math.cos(BAL.yaw), s = Math.sin(BAL.yaw);
  return { o: [O[0] + BAL.x + lx * c, O[1] + ly, O[2] + BAL.z - lx * s], yaw: BAL.yaw + PILE_YAW };
};
const yawV = (v, y) => { const c = Math.cos(y), s = Math.sin(y); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; };
/** pile-local (kitchen units, relative to the stack's centre on the table/pan) → world, at frame f */
export const pileToWorld = (f, p) => { const F = pileFrame(f), r = yawV(p, F.yaw); return [F.o[0] + r[0] * PILE_K, F.o[1] + r[1] * PILE_K, F.o[2] + r[2] * PILE_K]; };
/** world → pile-local */
export const worldToPile = (f, w) => { const F = pileFrame(f); return yawV([(w[0] - F.o[0]) / PILE_K, (w[1] - F.o[1]) / PILE_K, (w[2] - F.o[2]) / PILE_K], -F.yaw); };
// ★ THE MATCH (rolldown → test): the camera's pose on the cut, in PILE-LOCAL units (= kitchen units around the kitchen stack's centre):
//   the stack left of centre, ~21 % of the frame's height, seen from the front a little above (the kitchen's own view of it)
export const MATCH_LOCAL = { pos: [1.3, 9.4, 12.6], target: [1.3, 0.0, 0.5], fov: 40 };   // ~19° down: the plaques in front never hide its foot
// makeCam's idle drift (kit.tsx), on REAL frames (story + HOOK_SHIFT): the match cancels it on both sides of the cut
export const camDrift = (fr) => [0.06 * Math.sin(fr / 97), 0.04 * Math.sin(fr / 131 + 1), 0.05 * Math.sin(fr / 113 + 2)];
/** the kitchen camera that continues the rolldown camera on the frame after the cut (world, drift-cancelled) */
export const matchPose = (toKitchen) => {
  const C = MATCH_CUT(), dr = camDrift(C + HOOK_SHIFT), dk = camDrift(C + 1 + HOOK_SHIFT);
  const F = pileFrame(C), dl = yawV(dr, -F.yaw).map((v) => v / PILE_K);   // the rolldown drift, seen in the pile's units
  const pos = toKitchen([MATCH_LOCAL.pos[0] + dl[0], MATCH_LOCAL.pos[1] + dl[1], MATCH_LOCAL.pos[2] + dl[2]]);
  return { pos: [pos[0] - dk[0], pos[1] - dk[1], pos[2] - dk[2]], target: toKitchen(MATCH_LOCAL.target), fov: MATCH_LOCAL.fov };
};
const Balance = ({ f, t }) => {
  const a = beamAngle(t, f);
  const H = BAL.h, A = BAL.arm;
  const pan = (side) => [side * A * Math.cos(a), H + side * A * Math.sin(a)];
  const panG = (side, children) => {
    const [px, py] = pan(side);
    return (
      <group position={[px, py, 0]}>
        {/* the stirrup hook under the beam end, the rods, the pan (a spun steel dish with a rolled rim) */}
        <mesh position={[0, -0.05, 0]} material={MAT.steel} castShadow><torusGeometry args={[0.045, 0.012, 8, 20]} /></mesh>
        <mesh position={[0, -0.11, 0]} material={MAT.steel} castShadow><sphereGeometry args={[0.03, 12, 8]} /></mesh>
        <group rotation-y={PILE_YAW}>
          {ROD_ANG.map((ang, i) => <mesh key={i} position={[Math.cos(ang) * ROD_R / 2, -0.11 - (HANG - 0.11) / 2, Math.sin(ang) * ROD_R / 2]} quaternion={rodQ(ang)} material={MAT.steel} castShadow><cylinderGeometry args={[0.0065, 0.0065, rodLen - 0.11, 6]} /></mesh>)}
        </group>
        <group position={[0, -HANG, 0]}>
          <mesh material={MAT.steel} castShadow receiveShadow><cylinderGeometry args={[0.47, 0.37, 0.05, 56]} /></mesh>
          <mesh position={[0, 0.026, 0]} rotation-x={Math.PI / 2} material={MAT.steel} castShadow><torusGeometry args={[0.465, 0.014, 8, 56]} /></mesh>
          <mesh position={[0, -0.03, 0]} material={MAT.dark} castShadow><cylinderGeometry args={[0.2, 0.25, 0.02, 40]} /></mesh>
          <group position={[0, PAN_TOP - 0.004, 0]}>{children}</group>
        </group>
      </group>
    );
  };
  const nT = TK_N;
  return (
    <group position={[BAL.x, 0, BAL.z]} rotation-y={BAL.yaw}>
      {/* the base: a stepped plinth with a contact shadow, the column with collars and a capital */}
      <mesh position={[0, 0.06, 0]} material={MAT.plinth} castShadow receiveShadow><cylinderGeometry args={[0.55, 0.62, 0.12, 56]} /></mesh>
      <mesh position={[0, 0.125, 0]} material={MAT.steel} castShadow receiveShadow><cylinderGeometry args={[0.47, 0.5, 0.012, 56]} /></mesh>
      <mesh position={[0, 0.18, 0]} material={MAT.dark} castShadow receiveShadow><cylinderGeometry args={[0.32, 0.4, 0.1, 48]} /></mesh>
      <mesh position={[0, H / 2 + 0.1, 0]} material={MAT.steel} castShadow receiveShadow><cylinderGeometry args={[0.05, 0.07, H - 0.1, 24]} /></mesh>
      {/* rev 6 — baked AO: the column's foot on the base, the base's step on its plinth */}
      <AORing position={[0, 0.232, 0]} r0={0.072} r1={0.3} opacity={0.6} />
      <AORing position={[0, 0.133, 0]} r0={0.4} r1={0.5} opacity={0.45} />
      {[0.27, H * 0.5, H - 0.32].map((y, i) => <mesh key={i} position={[0, y, 0]} material={MAT.dark} castShadow><cylinderGeometry args={[0.078 - i * 0.008, 0.078 - i * 0.008, 0.05, 24]} /></mesh>)}
      <mesh position={[0, H - 0.08, 0]} material={MAT.steel} castShadow><cylinderGeometry args={[0.1, 0.06, 0.12, 24]} /></mesh>
      {/* the knife-edge bearing: a block with a V, the beam rocking on it */}
      <mesh position={[0, H - 0.01, 0]} material={MAT.dark} castShadow><boxGeometry args={[0.16, 0.06, 0.16]} /></mesh>
      {/* the beam: a steel bar with a centre web, a boss at the pivot and pivot balls at its ends */}
      <group position={[0, H + 0.03, 0]} rotation-z={a}>
        <mesh material={MAT.steel} castShadow><boxGeometry args={[2 * A, 0.05, 0.05]} /></mesh>
        <mesh material={MAT.steel} castShadow><boxGeometry args={[0.9, 0.08, 0.06]} /></mesh>
        <mesh position={[0, 0, 0]} rotation-x={Math.PI / 2} material={MAT.dark} castShadow><cylinderGeometry args={[0.06, 0.06, 0.09, 24]} /></mesh>
        <mesh position={[0, 0, 0.048]} rotation-x={Math.PI / 2} material={MAT.steel}><cylinderGeometry args={[0.022, 0.022, 0.02, 16]} /></mesh>
        {[-1, 1].map((s) => <mesh key={s} position={[s * A, 0, 0]} material={MAT.steel} castShadow><sphereGeometry args={[0.042, 14, 10]} /></mesh>)}
      </group>
      {/* the left pan: JERRY'S TICKET STACK (the kitchen's 36 bundles, square to the world), each falling into place */}
      {panG(-1, (
        <group rotation-y={PILE_YAW} scale={PILE_K}>
          <ContactShadow position={[0, 0.01, 0]} size={[2.1, 2.3]} opacity={0.55 * ease(f, t.enough - 8, t.enough)} />
          {f > t.enough - 2 && <AOSkirt w={1.38} d={1.62} h={0.5} opacity={0.4 * ease(f, t.enough - 2, t.enough + 4)} />}
          {Array.from({ length: nT }, (_, i) => {
            const land = ease(f, t.enough - 10 + i * 1.15, t.enough + 2 + i * 1.15);
            if (land <= 0) return null;
            const p = tkLocal(i);
            return <TicketBundle key={i} p={[p[0], p[1] + (1 - land) * 10, p[2], p[3]]} s={1} />;
          })}
        </group>
      ))}
      {panG(1, <>
        <AOFlat position={[0, 0.004, 0]} size={[0.75, 0.75]} opacity={0.5 * ease(f, t.put, t.put + 8)} />
        <Coins f={f} n={60} list={(ff) => heap(ff, { n: 60, cx: 0, cy: 0.0, cz: 0, w: 0.5, d: 0.5, layers: 4, k: 1, seed: 900, t0: t.put, t1: t.math + 4 })} />
      </>)}
    </group>
  );
};
// ★ rev 5 — the studio's sky, MATCHED TO THE FOG. three.js applies fog AFTER tone mapping, so kit.Sky (tone-mapped) draws its "fog colour"
//   lower half darker than the fogged floor actually is (measured on 749 f: sky (0,29,89) over floor (10,44,94)) — a hard horizon line
//   across the frame. This sky is not tone-mapped, and it is the fog's own colour from 18° above the horizon down, rising into the navy.
const fogSkyTex = () => canvasTex("rd_fogsky_v5", 8, 512, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#020C1E"); g.addColorStop(0.22, "#061C40"); g.addColorStop(0.4, FOG.color); g.addColorStop(1, FOG.color);
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
const FogSky = () => {
  const tex = useMemo(fogSkyTex, []);
  return (<mesh scale={[-1, 1, 1]}><sphereGeometry args={[400, 48, 32]} /><meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} depthWrite={false} toneMapped={false} /></mesh>);
};
// ── the studio ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const Studio = () => {
  const pool = useMemo(floorTex, []);
  const grid = useMemo(() => { const g = gridTex().clone(); g.wrapS = g.wrapT = THREE.RepeatWrapping; g.repeat.set(30, 30); g.needsUpdate = true; return g; }, []);
  return (
    <group>
      {/* rev 5: the floor runs on into the fog (700 m: its far edge is pure fog colour, so no horizon line shows), a little less mirror-like
          so the key's shadows read on it */}
      <mesh rotation-x={-Math.PI / 2} position={[2, 0, 0]} receiveShadow>
        <planeGeometry args={[700, 700]} />
        <meshStandardMaterial color="#0E2A52" roughness={0.3} metalness={0.4} transparent opacity={0.84} envMapIntensity={0.5} depthWrite={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[2, 0.004, 0]}><planeGeometry args={[160, 160]} /><meshBasicMaterial map={grid} transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      {/* rev 5: a shadow catcher over the floor where the machine and the balance stand — the key's cast shadows read on the dark
          glossy floor (the floor's own diffuse is too dark to show them) */}
      <mesh rotation-x={-Math.PI / 2} position={[4, 0.008, 1]} receiveShadow><planeGeometry args={[22, 18]} /><shadowMaterial transparent opacity={0.55} color="#000814" depthWrite={false} /></mesh>
      <AOFlat position={[0.15, 0.009, -0.1]} size={[4.4, 4.4]} opacity={0.6} />
      <AOFlat position={[BAL.x + 0.06, 0.009, BAL.z - 0.05]} size={[1.75, 1.75]} opacity={0.7} />
      <mesh rotation-x={-Math.PI / 2} position={[2.5, 0.006, 0.5]}><planeGeometry args={[16, 16]} /><meshBasicMaterial map={pool} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.55} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[BAL.x, 0.007, BAL.z]}><planeGeometry args={[6, 6]} /><meshBasicMaterial map={pool} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.4} /></mesh>
      {/* a soft top light on the machine and one on the balance */}
      <pointLight position={[1.5, 8.5, 4]} intensity={9} distance={18} decay={1.4} color="#CFE0F8" />
      <pointLight position={[BAL.x - 1, 4.5, BAL.z + 3]} intensity={1.6} distance={9} decay={1.5} color="#CFE0F8" />
    </group>
  );
};
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  return (
    <group>
      <FogSky />
      <Studio />
      <group scale={[1, -1, 1]}><Machine f={f} t={t} mirror /></group>
      <Machine f={f} t={t} />
      <Balance f={f} t={t} />
    </group>
  );
};
// ── the camera ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// ★ rev 5 (Timur, 2026-11-27: "slower … cinematic … always focused on something or moving to something"): five long, overlapping glides,
//   each leaving one subject and landing on the next, instead of six quick moves. The cut lands close on the coin wall (matched to
//   the store's push into the leaflet); one slow pull-back and rise to the column's top, the $5M ring and the shut MATCH 6 gate
//   ("jackpot … $5 million … nobody won"); one slow descending glide right down the staircase as the coins cascade ("rolled down to
//   the smaller prizes"); one glide on to the balance, held whole while it weighs ("enough tickets … math on your side"); then the
//   push onto the left pan's ticket stack — the MATCH: on "it." the cut lands on the same stack on Jerry's kitchen table (st_test).
const RA = [0.6, 2.4, 5.0, 0.3, 2.2, 0, 50];   // rev 5: first straight back off the coin wall (x, y, z, target x, y, z, frames)
const R1 = [1.3, 4.3, 8.6, 1.15, 3.6, 0, 20, 86], R2 = [4.3, 4.1, 10.8, 3.2, 3.15, 0.4], R2T = [16, 16];   // then the rise to ring + gate; the staircase glide
const shots = () => {
  const t = T(), C = MATCH_CUT();
  return [
    // the cut: close on the column (the leaflet's diagram made real), coins pouring in past the lens
    { a: t.cut, b: t.cut, cut: true, pos: W([0.12, 1.4, 2.1]), target: W([0, 1.34, 0]), fov: 30 },
    // one slow pull-back and rise: the coins climb to the $5M ring; it lands framing the ring and the shut MATCH 6 gate ("nobody won")
    //   (in two overlapping parts: first straight back off the coin wall, then the rise — a tilt while still close whips the picture)
    { a: t.cut + 2, b: t.cut + 2 + RA[6], pos: W([RA[0], RA[1], RA[2]]), target: W([RA[3], RA[4], RA[5]]), fov: 32 },
    { a: t.cut + 2 + R1[6], b: t.cut + 2 + R1[7], pos: W([R1[0], R1[1], R1[2]]), target: W([R1[3], R1[4], R1[5]]), fov: 34 },
    // a slow descending glide right, down the staircase with the cascade
    { a: t.won + R2T[0], b: t.prizes + R2T[1], pos: W([R2[0], R2[1], R2[2]]), target: W([R2[3], R2[4], R2[5]]), fov: 38 },
    // on to the balance, framed whole (it lands as the tickets begin to fall)
    { a: t.smaller + 4, b: t.enough + 12, pos: W([BAL.x - 0.55, 2.95, BAL.z + 7.7]), target: W([BAL.x + 0.02, 1.42, BAL.z]), fov: 40 },
    // held whole while it weighs: a very slow creep in (both pans stay in frame), the way the push will go
    { a: t.enough + 6, b: t.side + 4, pos: W([BAL.x - 0.62, 2.9, BAL.z + 7.3]), target: W([BAL.x - 0.04, 1.42, BAL.z]), fov: 40 },
    // the push onto Jerry's ticket stack on the left pan, landing at rest on the cut (MATCH_LOCAL → st_test's first frame)
    { a: t.side, b: C, pos: pileToWorld(C, MATCH_LOCAL.pos), target: pileToWorld(C, MATCH_LOCAL.target), fov: MATCH_LOCAL.fov }
  ];
};
// the 3-D points the tags point at (world coords, for P) — exported for the tag probe
export const tagPts = (f) => {
  const t = T(), a = beamAngle(t, f);
  return {
    // the jackpot: on the coin column's face, riding up from the cut's close-up to the coins' top as the camera pulls back
    top: ((e) => ([lerp(0.02, 0.28, e), lerp(1.5, level(t, f) - 0.05, e), lerp(0.86, 0.82, e)]))(ease(f, t.cut + 2, t.five + 16)), gate: ([T6.x - T6.w / 2 - 0.12, T6.y - 0.03, 0.06]),
    tray: TRAYS.map((tr) => ([tr.x - 0.3, tr.y + 0.15, tr.d / 2])),
    panL: (balPt([-BAL.arm * Math.cos(a), BAL.h - BAL.arm * Math.sin(a) - 0.7, 0])), panR: (balPt([BAL.arm * Math.cos(a), BAL.h + BAL.arm * Math.sin(a) - 0.75, 0])),
    piv: (balPt([0, BAL.h + 0.1, 0]))
  };
};
// ★ rev 2 TAGS (Timur: "the small captions … come up late"): each is fully in (at + 12) by the moment its thing is named or happens,
//   reads ≥ ~36 f, and is gone before the camera leaves its object. The three tier tags come in together as the camera cranes down the
//   staircase (rolled down … smaller) and leave before the travel to the balance (now at t.on); the balance tags lead their beats
//   and still leave on t.sideEnd − 6, before the flight to the kitchen.
export const TAGS = () => {
  const t = T();
  return {
    jackpot: { at: t.cut, out: t.nobody - 8 },
    nobody: { at: t.nobody - 12, out: t.money + 7 },
    tiers: [{ at: t.rolled + 4, out: t.on - 6 }, { at: t.rolled + 6, out: t.on - 5 }, { at: t.rolled + 8, out: t.on - 4 }],
    tickets: { at: t.tickets - 16, out: t.sideEnd - 6 }, prizes: { at: t.put - 20, out: t.sideEnd - 6 }, math: { at: t.math - 24, out: t.sideEnd - 6 }
  };
};
const TIER_XY = [[320, 500], [600, 840], [850, 1080]];   // MATCH 5 / 4 / 3 chips (px), clear of each other and of the captions
const Overlay = ({ f, P }) => {
  const t = T(), g = TAGS(), q = tagPts(f);
  const ok = (w) => { const p = P(w); return p.behind ? null : p; };
  return (
    <>
      {/* the vignette is global (Main.tsx) */}
      <Tag text="Jackpot" at={g.jackpot.at} out={g.jackpot.out} x={110} y={560} to={ok(q.top)} />
      <Counter at={t.five - 12} out={t.nobody - 14} x={540} y={300} prefix="$" value={5} unit="MILLION" label="The jackpot hits" size={112} countDur={12} />
      <Tag text="Nobody matched 6" at={g.nobody.at} out={g.nobody.out} x={560} y={330} to={ok(q.gate)} />
      {["Match 5", "Match 4", "Match 3"].map((txt, i) => <Tag key={i} text={txt} at={g.tiers[i].at} out={g.tiers[i].out} x={TIER_XY[i][0]} y={TIER_XY[i][1]} to={ok(q.tray[i])} />)}
      <Tag text="Tickets" at={g.tickets.at} out={g.tickets.out} x={100} y={520} to={ok(q.panL)} />
      <Tag text="Prizes" at={g.prizes.at} out={g.prizes.out} x={760} y={520} to={ok(q.panR)} />
      <Tag text="Math on your side" at={g.math.at} out={g.math.out} x={300} y={330} to={ok(q.piv)} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("coin", t.cut + 4, 14, 0.35), cueAt("coin", t.cut + 16, 14, 0.3), cueAt("chainshort", t.cut + 2, 30, 0.22),
    cueAt("whooshsoft", (t.cut + 2 + t.money + 4) / 2 - 8, 30, 0.35),   // rev 5: on the slow pull-back's fastest frame
    cueAt("pingshort", t.five + 10, 12, 0.4),                     // the coins reach the $5M ring
    cueAt("data", t.five - 14, 16, 0.12),                         // rev 7: the jackpot meter's last digits racing up to $5,000,000 (lands five + 2)
    cueAt("ee_click_click_01", t.nobody, 6, 0.45), cueAt("ee_click_click_01", t.nobody + 20, 6, 0.35),   // the gate's lamp
    cueAt("ee_click_click_01", t.rolled - 10, 6, 0.4),            // the spout door
    cueAt("chain", t.rolled - 4, t.prizesEnd - t.rolled + 4, 0.3), // the cascade
    cueAt("coin", t.rolled + 8, 14, 0.35), cueAt("coin", t.rolled + 20, 14, 0.32), cueAt("coin", t.smaller, 14, 0.3),
    cueAt("airwoosh", (t.won + t.prizes + 10) / 2 - 21, 30, 0.35),
    cueAt("whooshsoft", (t.smaller + 4 + t.enough + 12) / 2 - 8, 30, 0.35),
    cueAt("whooshlong", (t.side + MATCH_CUT()) / 2 - 12, 34, 0.38),   // the push onto the ticket stack (the match)
    cueAt("ee_click_click_01", t.enough + 2, 6, 0.3), cueAt("ee_click_click_01", t.tickets + 6, 6, 0.3),
    cueAt("chainshort", t.tickets + 10, 24, 0.25),
    cueAt("thud", t.math + 8, 12, 0.4),
    // ★ rev 6 — context sounds on the visible actions
    cue("ov_clank", t.rolled - 12, 12, 0.2),                       // the spout's door slides up
    cue("ov_coins", t.rolled - 2, 30, 0.3),                         // the coins pour out of the spout into MATCH 5
    cue("ov_coins", t.rolled + 18, 26, 0.22),                       // … roll on down into MATCH 4
    cue("ov_coins", t.smaller + 2, 26, 0.2),                        // … and into MATCH 3
    cue("ov_paper_flutter", t.enough - 6, 24, 0.2),                 // the ticket bundles drop onto the left pan
    cueAt("thud", t.enough + 2, 8, 0.14), cueAt("thud", t.enough + 16, 8, 0.12), cueAt("thud", t.enough + 30, 8, 0.12),   // bundles landing (674 → 714)
    cue("ov_clank", t.tickets + 10, 12, 0.16),                      // the left pan settles low
    cue("ov_coins", t.put + 4, 26, 0.75),                           // the prize coins pour onto the right pan (rev 8: audible, still under the voice)
    // rev 8 (Timur, 25 s: "subtle sound effects … like coins dropping … synced, proper sound effects, but not loud"): a clink on the landing
    //   frame of eight of the pan's 60 coins — the SAME schedule the heap draws (heap(): coin j lands at lerp(put, math + 4, j/60) + rnd·3,
    //   flat by +5), so each clink is a coin touching down.
    ...[[2, 1.1], [9, 0.9], [17, 1.0], [24, 0.8], [32, 0.95], [40, 0.75], [48, 0.85], [56, 0.7]].map(([j, v]) =>
      cueAt("coin", lerp(t.put, t.math + 4, j / 60) + rnd(900 + j) * 3 + 4, 10, v)),
    cue("ov_clank", t.math + 8, 14, 0.3)                            // the beam tips over and the right pan bottoms out
  ];
};
export const ST = { id: "rolldown", origin: O, from: 477, to: MATCH_CUT() + 2, light: { target: [3, 0, 0.8], shadowBox: 9, keyI: 2.2, fillI: 0.45 }, shots, Scene, Overlay, sfx };
