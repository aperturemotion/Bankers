// @ts-nocheck
// ★ V39 builder D — THE HOLDINGS BOARD (station lehman): a big freestanding stock board, the kind that hung over a trading floor —
//   a dark steel housing (frame, a header with a thin light-blue lamp line, a ribbed grid of sockets, a bolted back, two I-beam legs on
//   base plates, a cable conduit to the floor) holding 95 LED lamp tiles in 10 columns (nine full rows and a tenth of five; the rest
//   of the last row is a louvred blanking plate). Each tile is a 51 × 40 lamp dot-matrix (d_led.ts): the ten named holdings show their
//   real tickers (WSJ 2015: Procter & Gamble, JPMorgan, GE, Dow, J.M. Smucker, CVS, Johnson & Johnson, PG&E, Wells Fargo,
//   Colgate-Palmolive); the others carry a plain neutral mark (no invented tickers or prices). LEH (Lehman Brothers) is its own mesh
//   so the station can light it, turn it red, crack it and tip it back into its socket (it never leaves the board).
//   Local metres: the tile faces on z = 0 facing +z, the board centred on x = 0, the floor at y = 0.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { Mesher } from "./town_parts";
import { ledFace } from "./d_led";

export const BD = { cols: 10, rows: 10, px: 0.62, py: 0.5, tw: 0.56, th: 0.44, y0: 1.55 };   // y0: the grid's bottom edge
export const N_TILES = 95;
export const tilePos = (r, c) => [(c - (BD.cols - 1) / 2) * BD.px, BD.y0 + (BD.rows - 1 - r) * BD.py + BD.py / 2, 0];
export const GRID_W = BD.cols * BD.px, GRID_H = BD.rows * BD.py, GRID_CY = BD.y0 + GRID_H / 2;
// the named holdings and where they sit (row, col); LEH is the station's tile
export const NAMED = { "1,2": "PG", "2,7": "JPM", "0,5": "GE", "4,1": "DOW", "5,8": "SJM", "6,3": "CVS", "3,3": "JNJ" };   // only the holdings the WSJ named (FACTCHECK)
export const LEH_RC = [3, 6];
export const LEH_POS = tilePos(LEH_RC[0], LEH_RC[1]);
const isTile = (r, c) => r < 9 || c < 5;

// ── the tile atlas: 10 × 10 cells of 204 × 160 px (the tile's 0.56 : 0.44) ─────────────────────────────────────────────────
const CW = 204, CH = 160;
const cellUV = (r, c) => [(c * CW + 2) / 2040, 1 - ((r + 1) * CH - 2) / 1600, ((c + 1) * CW - 2) / 2040, 1 - (r * CH + 2) / 1600];
const drawAtlas = (emissive) => (c) => {
  c.fillStyle = "#000"; c.fillRect(0, 0, 2040, 1600);
  for (let r = 0; r < BD.rows; r++) for (let k = 0; k < BD.cols; k++) {
    if (!isTile(r, k)) continue;
    const t = NAMED[`${r},${k}`], leh = r === LEH_RC[0] && k === LEH_RC[1];
    ledFace(c, k * CW, r * CH, CW, CH, {
      lines: leh ? [] : t ? [{ t, s: 2 }] : [], mark: leh || t ? null : "bar",
      lit: emissive ? "#FFFFFF" : "#6FA4EC", off: emissive ? "#000000" : "rgba(30,50,82,0.6)", bg: emissive ? "#000000" : "#03060B"
    });
  }
};
// LEH's own faces (the same lamp pitch): the unlit lamp grid, the LEH line, the LEHMAN / BROTHERS lines (lit = white)
const lehBase = () => canvasTex("d_leh_base", 408, 320, (c, w, h) => ledFace(c, 0, 0, w, h, { lit: "rgba(30,50,82,0.6)", off: "rgba(30,50,82,0.6)", bg: "#03060B" }));
const lehTop = () => canvasTex("d_leh_top", 408, 320, (c, w, h) => ledFace(c, 0, 0, w, h, { lines: [{ t: "LEH", s: 2, row: 4 }], off: "#000000", bg: "#000000" }));
const lehSub = () => canvasTex("d_leh_sub", 408, 320, (c, w, h) => ledFace(c, 0, 0, w, h, { lines: [{ t: "LEHMAN", s: 1, row: 22 }, { t: "BROTHERS", s: 1, row: 31 }], off: "#000000", bg: "#000000" }));
// cracks across the tile's lamp glass: a few branching fracture lines from an impact point (white; the station tints and fades them)
const crackTex = () => canvasTex("d_leh_crack", 512, 400, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  const ox = w * 0.58, oy = h * 0.36;
  c.lineCap = "round"; c.lineJoin = "round";
  const branch = (x, y, a, len, wd, depth, seed) => {
    let px = x, py = y;
    c.beginPath(); c.moveTo(px, py);
    const n = 6;
    for (let i = 1; i <= n; i++) { const aa = a + (rnd(seed + i * 3.1) - 0.5) * 0.7; px += Math.cos(aa) * len / n; py += Math.sin(aa) * len / n; c.lineTo(px, py); }
    c.strokeStyle = `rgba(255,255,255,${0.55 + 0.3 * (depth === 0)})`; c.lineWidth = wd; c.stroke();
    if (depth < 2) for (let k = 0; k < 2; k++) branch(x + (px - x) * (0.35 + 0.3 * k), y + (py - y) * (0.35 + 0.3 * k), a + (k ? 0.7 : -0.8) * (0.6 + rnd(seed + k) * 0.6), len * 0.45, wd * 0.6, depth + 1, seed * 1.7 + k * 13);
  };
  for (let k = 0; k < 7; k++) branch(ox, oy, (k / 7) * Math.PI * 2 + rnd(k) * 0.5, 160 + rnd(k + 4) * 180, 2.6, 0, k * 17 + 3);
  // the impact star and a ring fracture
  c.strokeStyle = "rgba(255,255,255,0.7)"; c.lineWidth = 1.6;
  c.beginPath(); for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2, rr = 26 + rnd(i) * 10; i ? c.lineTo(ox + Math.cos(a) * rr, oy + Math.sin(a) * rr) : c.moveTo(ox + Math.cos(a) * rr, oy + Math.sin(a) * rr); } c.stroke();
  c.fillStyle = "rgba(255,255,255,0.45)"; c.beginPath(); c.arc(ox, oy, 7, 0, Math.PI * 2); c.fill();
});
const louvreTex = () => canvasTex("d_louvre", 512, 128, (c, w, h) => {
  c.fillStyle = "#1B2331"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) { const x = 30 + i * 52; c.fillStyle = "#06090F"; c.fillRect(x, 18, 34, 92); c.fillStyle = "rgba(160,190,230,0.18)"; c.fillRect(x, 18, 34, 3); }
});
const steelTex = () => canvasTex("d_steel", 512, 512, (c, w, h) => {
  c.fillStyle = "#808890"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { const g = 110 + rnd(i) * 60; c.fillStyle = `rgba(${g},${g + 4},${g + 10},0.25)`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 1 + rnd(i + 3) * 18, 1); }
});
const floorTex = () => canvasTex("d_floor", 1024, 1024, (c, w, h) => {
  c.fillStyle = "#2E3846"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 20000; i++) { const g = 40 + rnd(i) * 50; c.fillStyle = `rgba(${g},${g + 6},${g + 16},0.22)`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  c.fillStyle = "rgba(6,10,18,0.7)"; for (let k = 0; k <= 4; k++) { c.fillRect(k * w / 4 - 2, 0, 4, h); c.fillRect(0, k * h / 4 - 2, w, 4); }
});

let MATS = null;
const boardMats = () => {
  if (MATS) return MATS;
  const st = steelTex(); st.wrapS = st.wrapT = THREE.RepeatWrapping;
  const faceMap = canvasTex("d_board_atlas", 2040, 1600, drawAtlas(false)), faceE = canvasTex("d_board_atlasE", 2040, 1600, drawAtlas(true));
  MATS = {
    steel: new THREE.MeshStandardMaterial({ map: st, color: "#3A4352", roughness: 0.42, metalness: 0.75, envMapIntensity: 0.8, vertexColors: true }),
    dark: new THREE.MeshStandardMaterial({ color: "#0B0F17", roughness: 0.6, metalness: 0.4, vertexColors: true }),
    bezel: new THREE.MeshStandardMaterial({ color: "#151B26", roughness: 0.35, metalness: 0.3, vertexColors: true }),
    face: new THREE.MeshStandardMaterial({ map: faceMap, emissiveMap: faceE, emissive: new THREE.Color("#2F7BE0"), emissiveIntensity: 1.9, roughness: 0.3, metalness: 0.1, envMapIntensity: 0.3 }),
    louvre: new THREE.MeshStandardMaterial({ map: louvreTex(), roughness: 0.45, metalness: 0.6 }),
    strip: new THREE.MeshBasicMaterial({ color: "#7FB4F2", toneMapped: false, vertexColors: true }),
    bolt: new THREE.MeshStandardMaterial({ color: "#9AA6B6", roughness: 0.3, metalness: 0.9, vertexColors: true })
  };
  MATS.face.userData.cast = false; MATS.strip.userData.cast = false;
  return MATS;
};
const buildBoard = (m) => {
  const W = GRID_W, H = GRID_H, X0 = -W / 2, Y0 = BD.y0, FR = 0.24, DEP = 0.56;
  const xL = X0 - FR / 2, xR = X0 + W + FR / 2, yB = Y0 - FR / 2, yT = Y0 + H + FR / 2;
  // the housing: back box, the four frame members (proud of the grid), the header band with its lamp line
  m.box("dark", [0, Y0 + H / 2, -0.33], [W + 0.04, H + 0.04, 0.04], "#FFFFFF");
  m.box("steel", [0, Y0 + H / 2 + 0.31, -0.36], [W + 2 * FR, H + 2 * FR + 0.62, 0.06], "#FFFFFF");
  for (const x of [xL, xR]) m.box("steel", [x, Y0 + H / 2 + 0.31, -DEP / 2 + 0.1], [FR, H + 2 * FR + 0.62, DEP], "#FFFFFF");
  m.box("steel", [0, yB, -DEP / 2 + 0.1], [W + 2 * FR, FR, DEP], "#FFFFFF");
  m.box("steel", [0, yT + 0.31, -DEP / 2 + 0.1], [W + 2 * FR, FR + 0.62, DEP], "#FFFFFF");
  m.box("dark", [0, yT + 0.31, 0.105], [W - 0.1, 0.42, 0.012], "#FFFFFF");                         // the header's recessed panel
  m.box("strip", [0, yT + 0.31, 0.115], [W - 0.4, 0.035, 0.01], "#FFFFFF");                        // its thin lamp line
  m.box("steel", [0, yT + 0.65, -0.12], [W + 2 * FR + 0.08, 0.06, DEP + 0.16], "#FFFFFF");         // the cap
  // the frame's edge chamfers and a lip round the grid
  for (const x of [xL + FR / 2 - 0.01, xR - FR / 2 + 0.01]) m.box("bezel", [x, Y0 + H / 2, 0.06], [0.02, H + 0.02, 0.04], "#FFFFFF");
  for (const y of [yB + FR / 2 - 0.01, yT - FR / 2 + 0.01]) m.box("bezel", [0, y, 0.06], [W + 0.02, 0.02, 0.04], "#FFFFFF");
  // bolts round the frame face
  for (let i = 0; i <= 12; i++) for (const y of [yB, yT]) m.cyl("bolt", [X0 + i * W / 12, y, 0.38 * 0 + 0.105], 0.022, 0.02, "#FFFFFF", { r: [Math.PI / 2, 0, 0], seg: 6 });
  for (let i = 0; i <= 10; i++) for (const x of [xL, xR]) m.cyl("bolt", [x, Y0 + i * H / 10, 0.105], 0.022, 0.02, "#FFFFFF", { r: [Math.PI / 2, 0, 0], seg: 6 });
  // the socket grid: vertical and horizontal ribs between the tiles
  for (let k = 0; k <= BD.cols; k++) { const full = k <= 5 || k === BD.cols, yb = full ? Y0 : Y0 + BD.py; m.box("bezel", [X0 + k * BD.px, (yb + Y0 + H) / 2, 0.0], [0.045, Y0 + H - yb, 0.1], "#FFFFFF"); }
  for (let r = 0; r <= BD.rows; r++) m.box("bezel", [0, Y0 + r * BD.py, 0.0], [W, 0.045, 0.1], "#FFFFFF");
  // the tiles (all but LEH, which the station draws): a body in its socket, a lamp face from the atlas, two tiny fixing screws
  for (let r = 0; r < BD.rows; r++) for (let k = 0; k < BD.cols; k++) {
    if (!isTile(r, k) || (r === LEH_RC[0] && k === LEH_RC[1])) continue;
    const [x, y] = tilePos(r, k);
    m.box("bezel", [x, y, -0.05], [BD.tw + 0.02, BD.th + 0.02, 0.1], "#FFFFFF");
    m.quad("face", [x, y, 0.0015], BD.tw, BD.th, "#FFFFFF", cellUV(r, k));
    for (const sx of [-1, 1]) m.cyl("bolt", [x + sx * (BD.tw / 2 + 0.002), y - BD.th / 2 + 0.01, 0.006], 0.008, 0.01, "#FFFFFF", { r: [Math.PI / 2, 0, 0], seg: 6 });
  }
  // LEH's empty socket (seen when the tile tips back): a dark well
  { const [x, y] = LEH_POS; m.box("dark", [x, y, -0.22], [BD.tw + 0.03, BD.th + 0.03, 0.02], "#FFFFFF"); }
  // the blanking plate over the last row's five empty cells
  { const x0 = X0 + 5 * BD.px, y = Y0 + BD.py / 2; m.box("steel", [x0 + 2.5 * BD.px, y, 0.0], [5 * BD.px - 0.02, BD.py - 0.02, 0.1], "#FFFFFF"); }
  // legs: I-beams (web + flanges) from the floor to the frame, base plates with bolts, a rear brace
  for (const lx of [-2.3, 2.3]) {
    const h = yB - FR / 2;
    m.box("steel", [lx, h / 2, -0.12], [0.03, h, 0.28], "#FFFFFF");
    for (const s of [-1, 1]) m.box("steel", [lx + s * 0.11, h / 2, -0.12], [0.02, h, 0.3], "#FFFFFF"), m.box("steel", [lx, h / 2, -0.12 + s * 0.14], [0.24, h, 0.02], "#FFFFFF");
    m.box("steel", [lx, 0.025, -0.12], [0.62, 0.05, 0.7], "#FFFFFF");
    for (const a of [-1, 1]) for (const b of [-1, 1]) m.cyl("bolt", [lx + a * 0.24, 0.06, -0.12 + b * 0.28], 0.025, 0.03, "#FFFFFF", { seg: 6 });
    m.box("steel", [lx, h * 0.5, -0.6], [0.08, 0.08, Math.hypot(h, 0.9)], "#FFFFFF", { r: [-Math.atan2(h, 0.9), 0, 0] });
  }
  // the cable conduit down the left leg and along the floor
  m.cyl("dark", [-2.02, (yB - FR / 2) / 2, -0.3], 0.045, yB - FR / 2, "#FFFFFF", { seg: 10 });
  m.box("dark", [-2.02, 0.03, -2.6], [0.1, 0.06, 4.6], "#FFFFFF");
};
/** the board (static): housing, grid, 94 tiles */
export const Board = () => {
  const grp = useMemo(() => { const m = new Mesher(); buildBoard(m); return m.build(boardMats()); }, []);
  const lv = useMemo(boardMats, []);
  const x0 = -GRID_W / 2 + 5 * BD.px, y = BD.y0 + BD.py / 2;
  return (
    <group>
      <primitive object={grp} />
      {/* the blanking plate's louvres */}
      <mesh position={[x0 + 2.5 * BD.px, y, 0.052]}><planeGeometry args={[5 * BD.px - 0.3, BD.py - 0.16]} /><primitive object={lv.louvre} attach="material" /></mesh>
    </group>
  );
};
// LEH: the tile as a separate rig. s: { flare 0..1, red 0..1, dark 0..1 (lamps off), crack 0..1, tip 0..1 (falls back), flick }
export const LehTile = ({ s }) => {
  const tex = useMemo(() => ({ base: lehBase(), top: lehTop(), sub: lehSub(), crack: crackTex() }), []);
  const blue = new THREE.Color("#4A90EE"), white = new THREE.Color("#E6F1FF"), red = new THREE.Color("#FF3A30");
  const col = blue.clone().lerp(white, s.flare * (1 - s.red)).lerp(red, s.red);
  const I = (1 + 0.9 * s.flare * (1 - s.red)) * (1 - s.dark) * s.flick;
  const [x, y] = LEH_POS;
  // the tip: it turns about its bottom edge, top back into the socket; it sits a little proud while flared
  const zOff = 0.05 * s.flare * (1 - s.tip) - 0.13 * s.tip, th = -0.24 * s.tip, drop = -0.025 * s.tip;
  return (
    <group position={[x, y - BD.th / 2 + drop, zOff]} rotation-x={th}>
      <group position={[0, BD.th / 2, 0]}>
        <mesh position={[0, 0, -0.05]}><boxGeometry args={[BD.tw + 0.02, BD.th + 0.02, 0.1]} /><meshStandardMaterial color="#151B26" roughness={0.5} metalness={0.3} envMapIntensity={0.25} /></mesh>
        <mesh position={[0, 0, 0.0015]}><planeGeometry args={[BD.tw, BD.th]} /><meshBasicMaterial map={tex.base} color="#8C96A6" /></mesh>
        {I > 0.004 && <mesh position={[0, 0, 0.003]}><planeGeometry args={[BD.tw, BD.th]} /><meshBasicMaterial map={tex.top} color={col.clone().multiplyScalar(I)} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>}
        {I * s.flare > 0.004 && <mesh position={[0, 0, 0.004]}><planeGeometry args={[BD.tw, BD.th]} /><meshBasicMaterial map={tex.sub} color={col.clone().multiplyScalar(I * s.flare)} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>}
        {s.crack > 0.004 && <mesh position={[0, 0, 0.006]}><planeGeometry args={[BD.tw, BD.th]} /><meshBasicMaterial map={tex.crack} color="#A9BEDA" transparent opacity={(0.75 - 0.4 * s.tip) * s.crack} depthWrite={false} /></mesh>}
      </group>
    </group>
  );
};
/** the floor: polished dark concrete in big slabs */
export const BoardFloor = () => {
  const t = useMemo(() => { const x = floorTex(); x.wrapS = x.wrapT = THREE.RepeatWrapping; x.repeat.set(12, 12); return x; }, []);
  return <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow><planeGeometry args={[96, 96]} /><meshStandardMaterial map={t} color="#7E8CA3" roughness={0.28} metalness={0.35} envMapIntensity={0.6} /></mesh>;
};
