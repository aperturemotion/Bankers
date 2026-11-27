// @ts-nocheck
// ★ V39 builder C — THE BANK VAULT (station `vault`): "When he died, he owned at least 95 stocks. The certificates in his safe deposit
//   box stood about 5 inches high." (WSJ 19 Mar 2015). Metres; floor y 0; the wall of boxes' door faces at z WALLZ (facing +z).
//   · the wall: 176 brushed-brass doors in four sections (3-, 5- and 10-inch doors), each with an engraved number plate, two
//     keyholes (guard key + renter key) in round escutcheons, a hinge, inset in a steel grid; a steel plinth and a cornice with
//     SAFE DEPOSIT in raised letters; a polished terrazzo floor. All merged (town_parts' Mesher): a handful of draw calls.
//   · the viewing table: a brushed-steel top on a steel base, pushed against the wall, its top flush with the target slot's floor
//   · THE BOX (10 × 10 in front, 24 in deep): its door swings open, the steel box slides out of the slot along the table; on
//     "certificates" its shell turns to clear glass (white rim light) and shows the stack of certificates inside (sheet edges; the
//     same engraved certificate drawing as `shares` on top); a steel rule standing on its foot slides in beside it, its 0 at the
//     box floor; the stack's top is level with 5.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd, Glow, clamp01, ease } from "./kit";
import { Mesher } from "./town_parts";
import { SANSF, usePropFonts, brushedTex, tileTex, speckTex, sheetEdgeTex } from "./c_tex";
import { CW, CH, certMats, certIndex, CSERIF } from "./c_cert";
export { CW };

export const WALLZ = -1.0;
const CELL = 0.264, Y0 = 0.132, NCOL = 12, X0 = -NCOL * CELL / 2;
const TOPY = Y0 + 8 * CELL;                       // 2.244
export const TT = Y0 + 3 * CELL + 0.003;          // the table top = the target slot's floor (0.927)
export const TCOL = 6;                            // the target column (10-inch section), row 3 (its floor at TT)
export const BOX = { x: X0 + TCOL * CELL + CELL / 2, w: 0.24, h: 0.236, d: 0.56, out: 0.6 };
export const INCH = 0.0254, STACK_H = 5 * INCH, FLOOR_T = 0.004;
// the column sections: door pitch per column (3-inch, 5-inch, 10-inch)
const PITCH = [0.132, 0.132, 0.132, 0.088, 0.088, 0.264, 0.264, 0.264, 0.264, 0.132, 0.132, 0.132];

// ── textures ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// number plates: an atlas of engraved brass tags (black numbers), 16 × 32 cells
const NA = { W: 2048, H: 2048, cw: 128, ch: 64 };
const numRect = (k) => { const col = k % 16, row = Math.floor(k / 16); return [col * NA.cw / NA.W, 1 - (row + 1) * NA.ch / NA.H, (col + 1) * NA.cw / NA.W, 1 - row * NA.ch / NA.H]; };
const numDraw = (nums) => (c, w, h) => {
  nums.forEach((n, k) => {
    const x = (k % 16) * NA.cw, y = Math.floor(k / 16) * NA.ch;
    const g = c.createLinearGradient(x, y, x, y + NA.ch); g.addColorStop(0, "#E9D7A2"); g.addColorStop(0.5, "#C9AA62"); g.addColorStop(1, "#A9873F");
    c.fillStyle = g; c.fillRect(x, y, NA.cw, NA.ch);
    c.strokeStyle = "#6B5220"; c.lineWidth = 3; c.strokeRect(x + 3, y + 3, NA.cw - 6, NA.ch - 6);
    c.fillStyle = "#1A140A"; c.font = `700 40px ${CSERIF}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(String(n), x + NA.cw / 2, y + NA.ch / 2 + 2);
  });
};
const signDraw = (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#5D6A7A"); g.addColorStop(1, "#3A4553"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(255,255,255,${0.02 + rnd(i) * 0.04})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 40 + rnd(i) * 120, 1); }
  c.textAlign = "center"; c.textBaseline = "middle"; c.font = `700 ${h * 0.5}px ${CSERIF}`;
  if ("letterSpacing" in c) c.letterSpacing = `${h * 0.18}px`;
  c.fillStyle = "rgba(0,0,0,0.5)"; c.fillText("SAFE DEPOSIT", w / 2 + 3, h / 2 + 4);
  const lg = c.createLinearGradient(0, h * 0.25, 0, h * 0.75); lg.addColorStop(0, "#F4E2AE"); lg.addColorStop(0.5, "#C9A65C"); lg.addColorStop(1, "#8E6E2C");
  c.fillStyle = lg; c.fillText("SAFE DEPOSIT", w / 2, h / 2);
  if ("letterSpacing" in c) c.letterSpacing = "0px";
  c.fillStyle = "#9AA6B4"; c.fillRect(0, 6, w, 4); c.fillRect(0, h - 10, w, 4);
};
// the steel rule: inches with 1/16 graduations, numbered 1–6; 0 sits FLOOR_T above the foot's underside
export const RULER = { w: 0.026, h: 0.17, t: 0.0018 };
const RPX = 2048 / RULER.h;
const rulerDraw = (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "#C9D2DC"); g.addColorStop(0.5, "#EEF2F6"); g.addColorStop(1, "#B7C1CC"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(0,0,0,${0.02 + rnd(i) * 0.04})`; c.fillRect(0, rnd(i + 3) * h, w, 1); }
  c.fillStyle = "#111418";
  for (let k = 0; k <= 6 * 16; k++) {
    const y = h - (FLOOR_T + (k / 16) * INCH) * RPX;
    const L = k % 16 === 0 ? 0.62 : k % 8 === 0 ? 0.45 : k % 4 === 0 ? 0.33 : k % 2 === 0 ? 0.24 : 0.16;
    c.fillRect(0, y - (k % 16 === 0 ? 2.5 : 1.4), w * L, k % 16 === 0 ? 5 : 2.8);
    if (k % 16 === 0 && k > 0) { c.save(); c.font = `700 ${w * 0.42}px ${SANSF}`; c.textAlign = "right"; c.textBaseline = "middle"; c.fillText(String(k / 16), w - 18, y - 2); c.restore(); }
  }
  c.save(); c.translate(w * 0.78, h - 40); c.rotate(-Math.PI / 2); c.font = `600 ${w * 0.11}px ${SANSF}`; c.textAlign = "left"; c.fillText("INCHES  ·  STAINLESS", 0, 0); c.restore();
};
// ── materials ────────────────────────────────────────────────────────────────────────────────────────────────────────
const useVaultMats = () => useMemo(() => {
  const nums = []; for (let c = 0; c < NCOL; c++) { const n = Math.round((TOPY - Y0) / PITCH[c]); for (let r = 0; r < n; r++) nums.push(1000 + c * 100 + (n - r)); }
  const brass = new THREE.MeshStandardMaterial({ map: brushedTex("vbrass", "#B4935A", [1, 1]), color: "#FFFFFF", metalness: 0.85, roughness: 0.34, vertexColors: true });
  const steel = new THREE.MeshStandardMaterial({ map: brushedTex("vsteel", "#8C98A6", [2, 2], true), color: "#FFFFFF", metalness: 0.8, roughness: 0.32, vertexColors: true });
  const plate = new THREE.MeshStandardMaterial({ map: canvasTex("c_v_nums", NA.W, NA.H, numDraw(nums)), metalness: 0.6, roughness: 0.4, color: "#FFFFFF" }); plate.userData.cast = false;
  const dark = new THREE.MeshStandardMaterial({ color: "#0B0D12", roughness: 0.6, vertexColors: true }); dark.userData.cast = false;
  const terr = speckTex("vterrazzo", "#5E6B7C", ["rgba(230,236,244,0.5)", "rgba(20,26,36,0.5)", "rgba(150,170,195,0.5)", "rgba(200,180,150,0.35)"], 16000, [10, 10], 3);
  return {
    brass, steel, plate, dark, nums,
    floor: new THREE.MeshPhysicalMaterial({ map: terr, roughness: 0.22, clearcoat: 0.8, clearcoatRoughness: 0.1, color: "#FFFFFF" }),
    tableTop: new THREE.MeshStandardMaterial({ map: brushedTex("vtable", "#A9B4C0", [1.5, 1]), color: "#FFFFFF", metalness: 0.85, roughness: 0.22 }),
    tableBase: new THREE.MeshStandardMaterial({ color: "#2E3744", metalness: 0.6, roughness: 0.45 }),
    wallPaint: new THREE.MeshStandardMaterial({ color: "#2A3A52", roughness: 0.8 }),
  };
}, []);
// ── the wall of boxes (merged) ───────────────────────────────────────────────────────────────────────────────────────
const buildWall = (M) => {
  const m = new Mesher();
  const zF = WALLZ;   // door face plane
  let k = 0;
  for (let c = 0; c < NCOL; c++) {
    const x0 = X0 + c * CELL, p = PITCH[c], n = Math.round((TOPY - Y0) / p);
    for (let r = 0; r < n; r++) {
      const y0 = Y0 + r * p, cx = x0 + CELL / 2, cy = y0 + p / 2;
      const isTarget = c === TCOL && r === 3;
      const num = M.nums[k], rect = numRect(k); k++;
      if (isTarget) continue;   // its door and box are separate (they move)
      const dw = CELL - 0.012, dh = p - 0.012;
      const tint = ["#FFFFFF", "#F4EEE2", "#FBF6EC", "#EDE6D6"][Math.floor(rnd(c * 31 + r) * 4)];
      m.box("brass", [cx, cy, zF - 0.005], [dw, dh, 0.01], tint);
      // a bevelled frame line inside the door edge
      m.box("brass", [cx, cy + dh / 2 - 0.006, zF + 0.0012], [dw - 0.012, 0.003, 0.002], "#D9C08A");
      m.box("brass", [cx, cy - dh / 2 + 0.006, zF + 0.0012], [dw - 0.012, 0.003, 0.002], "#8F7440");
      // number plate (upper middle), two keyholes (lower middle), hinge knuckles at the left edge, a small pull at the right
      const ph = Math.min(0.026, dh * 0.24), py = cy + dh / 2 - ph / 2 - Math.min(0.016, dh * 0.12);
      m.quad("plate", [cx, py, zF + 0.0016], ph * 2, ph, "#FFFFFF", rect);
      const ky = p > 0.1 ? cy - dh * 0.12 : cy - dh * 0.18, kr = Math.min(0.012, dh * 0.16);
      [-1, 1].forEach((s) => {
        m.cyl("brass", [cx + s * 0.035, ky, zF + 0.003], kr, 0.006, "#E2C98E", { r: [Math.PI / 2, 0, 0], seg: 16 });
        m.box("dark", [cx + s * 0.035, ky - kr * 0.15, zF + 0.0062], [kr * 0.32, kr * 0.9, 0.001], "#FFFFFF");
        m.cyl("dark", [cx + s * 0.035, ky + kr * 0.3, zF + 0.0062], kr * 0.28, 0.001, "#FFFFFF", { r: [Math.PI / 2, 0, 0], seg: 10 });
      });
      m.cyl("steel", [x0 + 0.008, cy + dh * 0.3, zF + 0.002], 0.004, Math.min(0.03, dh * 0.25), "#C9B58A", { seg: 8 });
      m.cyl("steel", [x0 + 0.008, cy - dh * 0.3, zF + 0.002], 0.004, Math.min(0.03, dh * 0.25), "#C9B58A", { seg: 8 });
      m.box("brass", [x0 + CELL - 0.022, cy, zF + 0.004], [0.006, Math.min(0.04, dh * 0.4), 0.008], "#D6BE86");
    }
    // the steel grid: a vertical stile at each column edge, a rail at each row boundary (they stand 4 mm proud of the doors)
    m.box("steel", [x0, (Y0 + TOPY) / 2, zF - 0.28], [0.008, TOPY - Y0, 0.57], "#FFFFFF");
    for (let r = 0; r <= n; r++) m.box("steel", [x0 + CELL / 2, Y0 + r * p, zF - 0.28], [CELL, 0.006, 0.57], "#FFFFFF");
  }
  m.box("steel", [X0 + NCOL * CELL, (Y0 + TOPY) / 2, zF - 0.28], [0.008, TOPY - Y0, 0.57], "#FFFFFF");
  // plinth and cornice, pilasters at the ends, the back of the cabinet (dark) and the wall around it
  m.box("steel", [0, Y0 / 2, zF - 0.02], [NCOL * CELL + 0.12, Y0, 0.06], "#AEB8C4");
  m.box("steel", [0, TOPY + 0.015, zF - 0.02], [NCOL * CELL + 0.16, 0.03, 0.08], "#D0D8E2");
  m.box("steel", [0, TOPY + 0.3, zF - 0.02], [NCOL * CELL + 0.2, 0.04, 0.09], "#D0D8E2");
  [-1, 1].forEach((s) => m.box("steel", [s * (NCOL * CELL / 2 + 0.05), (Y0 + TOPY) / 2 + 0.08, zF - 0.02], [0.1, TOPY + 0.16, 0.07], "#AEB8C4"));
  m.box("dark", [0, (Y0 + TOPY) / 2, zF - 0.6], [NCOL * CELL, TOPY - Y0, 0.02], "#FFFFFF");
  return m;
};
const Wall = ({ M }) => {
  const grp = useMemo(() => buildWall(M).build({ brass: M.brass, steel: M.steel, plate: M.plate, dark: M.dark }), [M]);
  const sign = useMemo(() => canvasTex("c_v_sign", 2048, 256, signDraw), []);
  return (
    <group>
      <primitive object={grp} />
      <mesh position={[0, TOPY + 0.165, WALLZ + 0.026]}><planeGeometry args={[NCOL * CELL * 0.62, 0.24]} /><meshStandardMaterial map={sign} metalness={0.6} roughness={0.35} /></mesh>
      {/* the room: walls either side of the bank of boxes, the ceiling's soffit, the floor */}
      <mesh position={[0, 1.6, WALLZ - 0.62]}><planeGeometry args={[12, 3.2]} /><meshStandardMaterial color="#1F2C40" roughness={0.85} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 3.4, 1.6, WALLZ - 0.05]}><boxGeometry args={[3.4, 3.2, 0.1]} /><meshStandardMaterial color="#26354C" roughness={0.85} /></mesh>)}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 1.5]} receiveShadow material={M.floor}><planeGeometry args={[9, 5.2]} /></mesh>
    </group>
  );
};
// ── the viewing table ────────────────────────────────────────────────────────────────────────────────────────────────
export const TABLE = { x0: -0.62, x1: 0.82, z0: WALLZ + 0.005, z1: WALLZ + 0.72 };
const Table = ({ M }) => {
  const w = TABLE.x1 - TABLE.x0, d = TABLE.z1 - TABLE.z0, cx = (TABLE.x0 + TABLE.x1) / 2, cz = (TABLE.z0 + TABLE.z1) / 2;
  return (
    <group>
      <mesh position={[cx, TT - 0.015, cz]} material={M.tableTop} castShadow receiveShadow><boxGeometry args={[w, 0.03, d]} /></mesh>
      <mesh position={[cx, TT - 0.034, cz]} material={M.tableBase}><boxGeometry args={[w - 0.04, 0.012, d - 0.04]} /></mesh>
      {/* an apron, four square steel legs with levelling feet, a low stretcher shelf */}
      <mesh position={[cx, TT - 0.075, cz]} material={M.tableBase} castShadow><boxGeometry args={[w - 0.06, 0.08, d - 0.06]} /></mesh>
      {[[TABLE.x0 + 0.05, TABLE.z0 + 0.05], [TABLE.x1 - 0.05, TABLE.z0 + 0.05], [TABLE.x0 + 0.05, TABLE.z1 - 0.05], [TABLE.x1 - 0.05, TABLE.z1 - 0.05]].map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x, (TT - 0.1) / 2 + 0.01, z]} material={M.tableTop} castShadow><boxGeometry args={[0.045, TT - 0.1, 0.045]} /></mesh>
          <mesh position={[x, 0.006, z]}><cylinderGeometry args={[0.022, 0.026, 0.012, 16]} /><meshStandardMaterial color="#20262E" roughness={0.6} /></mesh>
        </group>
      ))}
      <mesh position={[cx, 0.16, cz]} material={M.tableTop} castShadow receiveShadow><boxGeometry args={[w - 0.12, 0.018, d - 0.12]} /></mesh>
    </group>
  );
};
// ── the box: door, steel shell (→ glass), the certificates, the handle ───────────────────────────────────────────────
const Door = ({ M, open }) => {
  const p = PITCH[TCOL], dw = CELL - 0.012, dh = p - 0.012, cy = Y0 + 3 * p + p / 2, x0 = X0 + TCOL * CELL;
  const kIdx = useMemo(() => { let k = 0; for (let c = 0; c < TCOL; c++) k += Math.round((TOPY - Y0) / PITCH[c]); return k + 3; }, []);
  const rect = numRect(kIdx);
  const plateGeo = useMemo(() => { const g = new THREE.PlaneGeometry(0.052, 0.026); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, rect[0] + uv.getX(i) * (rect[2] - rect[0]), rect[1] + uv.getY(i) * (rect[3] - rect[1])); return g; }, []);
  const brass = useMemo(() => { const b = M.brass.clone(); b.vertexColors = false; return b; }, [M]);
  return (
    <group position={[x0 + 0.006, cy, WALLZ]} rotation-y={-1.85 * open}>
      <group position={[dw / 2, 0, 0]}>
        <mesh position={[0, 0, -0.005]} material={brass} castShadow><boxGeometry args={[dw, dh, 0.01]} /></mesh>
        <mesh geometry={plateGeo} material={M.plate} position={[0, dh / 2 - 0.013 - 0.016, 0.0016]} />
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.035, -dh * 0.12, 0.003]}>
            <mesh rotation-x={Math.PI / 2} material={brass}><cylinderGeometry args={[0.012, 0.012, 0.006, 20]} /></mesh>
            <mesh position={[0, -0.002, 0.0032]}><boxGeometry args={[0.004, 0.011, 0.001]} /><meshStandardMaterial color="#0B0D12" /></mesh>
            <mesh position={[0, 0.0036, 0.0032]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.0034, 0.0034, 0.001, 10]} /><meshStandardMaterial color="#0B0D12" /></mesh>
          </group>
        ))}
        <mesh position={[dw / 2 - 0.016, 0, 0.004]} material={brass}><boxGeometry args={[0.006, 0.04, 0.008]} /></mesh>
      </group>
      <mesh position={[0.002, dh * 0.3, 0.002]} material={M.steel}><cylinderGeometry args={[0.004, 0.004, 0.03, 8]} /></mesh>
      <mesh position={[0.002, -dh * 0.3, 0.002]} material={M.steel}><cylinderGeometry args={[0.004, 0.004, 0.03, 8]} /></mesh>
    </group>
  );
};
// the stack: 26 bundles of certificates (sheet edges on the sides, slightly out of true), the top certificate face up
const Stack = () => {
  const n = 26, th = STACK_H / n;
  const parts = useMemo(() => {
    const edge = sheetEdgeTex("vstack", 96, [1, 1]);
    const side = new THREE.MeshStandardMaterial({ map: edge, roughness: 0.9, color: "#C9C2B2" });
    const top = new THREE.MeshStandardMaterial({ color: "#CFC9BB", roughness: 0.9 });
    const faces = [side, side, top, top, side, side];
    const pg = certMats(certIndex("pg"));
    return { geo: new THREE.BoxGeometry(CH, th * 0.985, CW), faces, pg };
  }, []);
  return (
    <group>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} geometry={parts.geo} material={parts.faces} position={[(rnd(i * 3) - 0.5) * 0.006, FLOOR_T + th * (i + 0.5), (rnd(i * 5) - 0.5) * 0.006]} rotation-y={(rnd(i * 7) - 0.5) * 0.03} castShadow receiveShadow />
      ))}
      {/* the top certificate, its face up (turned to read from the box's front) */}
      <mesh position={[0.001, FLOOR_T + STACK_H + 0.0004, 0]} rotation-y={Math.PI / 2 + 0.012} material={parts.pg} castShadow><boxGeometry args={[CW, 0.0006, CH]} /></mesh>
    </group>
  );
};
export const STACK_Z = BOX.d / 2 - 0.035 - CW / 2;   // the stack's centre along the box (box-local), toward its front
/** the box's pose: slide k ∈ [0,1] → its centre (station-local) */
export const boxCentre = (k) => [BOX.x, TT, WALLZ - 0.024 - BOX.d / 2 + BOX.out * k];
const Box = ({ slide, glass, flash }) => {
  const shell = useMemo(() => new THREE.MeshPhysicalMaterial({ map: brushedTex("vbox", "#7F8B98", [1, 1]), color: "#FFFFFF", metalness: 0.8, roughness: 0.3, clearcoat: 0, transparent: false }), []);
  const front = useMemo(() => new THREE.MeshPhysicalMaterial({ map: brushedTex("vboxf", "#8C97A4", [1, 1], true), color: "#FFFFFF", metalness: 0.8, roughness: 0.28 }), []);
  const edges = useMemo(() => {
    const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(BOX.w, BOX.h, BOX.d));
    const lid = new THREE.EdgesGeometry(new THREE.BoxGeometry(BOX.w, 0.006, BOX.d - 0.01));
    return { g, lid, m: new THREE.LineBasicMaterial({ color: "#FFFFFF", transparent: true, opacity: 0, toneMapped: false, depthWrite: false }) };
  }, []);
  // the glass reveal: the steel's opacity falls as a pale-blue glass rises; edges flash white then hold a pale rim
  [shell, front].forEach((m) => {
    m.transparent = glass > 0.001; m.depthWrite = glass < 0.5;
    m.opacity = 1 - 0.9 * glass; m.metalness = 0.8 * (1 - glass); m.roughness = 0.3 - 0.25 * glass;
    m.color.set("#FFFFFF").lerp(new THREE.Color("#CFE4FA"), glass); m.clearcoat = glass;
    m.emissive = m.emissive || new THREE.Color(); m.emissive.set("#B3CEEF"); m.emissiveIntensity = 0.12 * glass + 0.5 * flash;
  });
  edges.m.opacity = clamp01(0.55 * glass + 0.9 * flash);
  const T = 0.003, w = BOX.w, h = BOX.h, d = BOX.d;
  const c = boxCentre(slide);
  return (
    <group position={c}>
      {/* the shell: floor, two sides, back, the front (with the handle), the hinged lid */}
      <mesh position={[0, FLOOR_T / 2, 0]} material={shell} castShadow={glass < 0.5} receiveShadow><boxGeometry args={[w, FLOOR_T, d]} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * (w / 2 - T / 2), h / 2, 0]} material={shell} castShadow={glass < 0.5} receiveShadow><boxGeometry args={[T, h - 0.006, d]} /></mesh>)}
      <mesh position={[0, h / 2, -d / 2 + T / 2]} material={shell} castShadow={glass < 0.5}><boxGeometry args={[w, h - 0.006, T]} /></mesh>
      <mesh position={[0, h / 2, d / 2 - T]} material={front} castShadow={glass < 0.5} renderOrder={4}><boxGeometry args={[w, h - 0.006, 2 * T]} /></mesh>
      <mesh position={[0, h - 0.003, 0]} material={shell} castShadow={glass < 0.5} renderOrder={4}><boxGeometry args={[w + 0.002, 0.004, d - 0.01]} /></mesh>
      {/* the folding handle on the front and its two pivots, and the label holder */}
      <group position={[0, h * 0.62, d / 2 + 0.002]}>
        <mesh rotation-z={Math.PI / 2} position={[0, 0, 0.012]}><cylinderGeometry args={[0.004, 0.004, 0.09, 10]} /><meshStandardMaterial color="#C8D0DA" metalness={0.9} roughness={0.25} transparent opacity={1 - 0.7 * glass} /></mesh>
        {[-1, 1].map((s) => <mesh key={s} position={[s * 0.045, 0, 0.006]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.005, 0.005, 0.014, 10]} /><meshStandardMaterial color="#C8D0DA" metalness={0.9} roughness={0.25} transparent opacity={1 - 0.7 * glass} /></mesh>)}
      </group>
      <lineSegments geometry={edges.g} material={edges.m} position={[0, h / 2, 0]} renderOrder={6} />
      <Stack />
      {flash > 0.01 && <Glow position={[0, h * 0.6, d / 2]} size={0.45} color="#FFFFFF" opacity={0.45 * flash} />}
    </group>
  );
};
// ── the steel rule on its foot ───────────────────────────────────────────────────────────────────────────────────────
// the rule stands just outside the glass, in line with the stack's FRONT face (so the level line runs straight along x)
export const rulerPos = (k) => [BOX.x + BOX.w / 2 + 0.022 + 0.5 * (1 - k), TT, boxCentre(1)[2] + STACK_Z + CW / 2];
const Ruler = ({ k, ready }) => {
  const tex = useMemo(() => (ready ? canvasTex("c_v_ruler", 256, 2048, rulerDraw) : null), [ready]);
  const mats = useMemo(() => { const s = new THREE.MeshStandardMaterial({ color: "#B9C3CE", metalness: 0.85, roughness: 0.25 }); return [s, s, s, s, new THREE.MeshStandardMaterial({ map: tex, color: tex ? "#FFFFFF" : "#C9D2DC", metalness: 0.5, roughness: 0.32 }), s]; }, [tex]);
  const p = rulerPos(k);
  return (
    <group position={p} rotation-y={-0.25}>
      <mesh position={[0, RULER.h / 2, 0]} material={mats} castShadow><boxGeometry args={[RULER.w, RULER.h, RULER.t]} /></mesh>
      {/* the foot: a machined block the rule is clamped in; its height is the box floor's thickness */}
      <mesh position={[0, FLOOR_T / 2, 0]} castShadow receiveShadow><boxGeometry args={[0.05, FLOOR_T, 0.032]} /><meshStandardMaterial color="#5A6676" metalness={0.8} roughness={0.3} /></mesh>
      <mesh position={[0, FLOOR_T + 0.006, -0.004]} castShadow><boxGeometry args={[0.036, 0.012, 0.006]} /><meshStandardMaterial color="#5A6676" metalness={0.8} roughness={0.3} /></mesh>
      <mesh position={[0.012, FLOOR_T + 0.006, -0.009]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.004, 0.004, 0.006, 12]} /><meshStandardMaterial color="#9AA6B4" metalness={0.9} roughness={0.2} /></mesh>
    </group>
  );
};
/** the 5-inch level: a pale-blue line from the stack's top edge to the rule's 5 */
const Level = ({ k }) => {
  if (k <= 0.001) return null;
  const y = TT + FLOOR_T + STACK_H, b = boxCentre(1), r = rulerPos(1);
  const x0 = b[0] - CH / 2 - 0.004, x1 = r[0] - RULER.w * 0.3, z = r[2] + 0.002;
  const L = (x1 - x0) * k;
  return (
    <group>
      <mesh position={[x0 + L / 2, y, z]} renderOrder={7}><boxGeometry args={[L, 0.0026, 0.0026]} /><meshBasicMaterial color="#DCEBFC" toneMapped={false} /></mesh>
      <mesh position={[x0 + L / 2, y, z]} renderOrder={7}><boxGeometry args={[L, 0.008, 0.002]} /><meshBasicMaterial color="#7FB4F2" transparent opacity={0.35} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      <Glow position={[x0 + L, y, z]} size={0.06} color="#B3CEEF" opacity={0.9 * (1 - ease(k, 0.95, 1))} />
    </group>
  );
};
export const VaultSet = ({ open, slide, glass, flash, ruler, level }) => {
  const M = useVaultMats();
  const ready = usePropFonts();
  return (
    <group>
      <Wall M={M} />
      <Table M={M} />
      <Door M={M} open={open} />
      <Box slide={slide} glass={glass} flash={flash} />
      <Ruler k={ruler} ready={ready} />
      <Level k={level} />
      {/* the vault's ceiling lights: cool panels overhead (their light on the table and the doors) */}
      <pointLight position={[0.1, 2.6, -0.4]} intensity={2.2} distance={6} decay={2} color="#E4EEFA" />
      <pointLight position={[-1.2, 2.6, -0.2]} intensity={1.0} distance={5} decay={2} color="#D6E4F6" />
    </group>
  );
};
