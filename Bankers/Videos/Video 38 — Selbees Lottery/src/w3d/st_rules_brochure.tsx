// @ts-nocheck
// ★ V38 — the WINFALL BROCHURE for the RULES station (builder D): a COPY of builder A's st_store_brochure.tsx (as of 2026-11-25,
//   so the closing brochure is the same object the store station shows); canvas keys prefixed "rb_" so the two never share a cache.
//   If the store's brochure changes, re-copy it here (or import it from ./st_store_brochure: same exports).
//   Built in a DESIGN plane: x across the three panels (metres), y up the page, z the paper's normal. <Brochure> lies it flat on a
//   surface with the page's top pointing along +x of the parent and the panels running along +z (left panel at −z).
//   Spread (inside): HOW TO PLAY | PRIZES (the tiers, as balls matched) | THE ROLL-DOWN (the rule in words + the machine diagram).
//   The folded leaflet shows the cover (WINFALL). Props: open (0 = folded → 1 = flat open), hi (0 → 1 the highlight sweep along the
//   rule's lines), hiGlow (the light that runs at the sweep's head).
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd, clamp01, Glow } from "./kit";
import { BODY, FIGURE } from "./fonts3d";

export const BRO = { PW: 0.15, PH: 0.32, T: 0.0012, PX: 600, PY: 1280 };
const NAVY = "#0B2547", BLUE = "#005DC8", LIGHT = "#4D8ED9", PAPER = "#F3F6FA";
// the rule's lines (spread px, right panel) — measured when the spread is drawn; the highlight sweeps them in order
export const RULE = { lines: [], x0: 1236 };
const RULE_TEXT = ["When the jackpot", "reaches $5 million", "and no one matches", "all 6 numbers, the", "money rolls down to", "the lower prizes."];
// spread px → design metres (centre of the spread at 0,0)
export const pxToDesign = (px, py) => [(px / (3 * BRO.PX)) * 3 * BRO.PW - 1.5 * BRO.PW, BRO.PH / 2 - (py / BRO.PY) * BRO.PH];
// design → the parent's local frame (the brochure's group position p, flat): design x → +z, design y → +x, design z → +y
export const broPt = (p, dx, dy, dz = 0.002) => [p[0] + dy, p[1] + dz, p[2] + dx];

const greek = (c, x, y, w, rows, gap = 26, h = 9, col = "rgba(11,37,71,0.28)", seed = 1) => {
  c.fillStyle = col;
  for (let i = 0; i < rows; i++) { const ww = w * (i === rows - 1 ? 0.55 : 0.82 + 0.18 * rnd(seed + i)); c.beginPath(); c.roundRect(x, y + i * gap, ww, h, h / 2); c.fill(); }
};
const ball = (c, x, y, r, n, filled = true, tone = BLUE) => {
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  if (filled) { g.addColorStop(0, "#7FB4F2"); g.addColorStop(1, tone); } else { g.addColorStop(0, "#FFFFFF"); g.addColorStop(1, "#DCE6F2"); }
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.lineWidth = 3; c.strokeStyle = filled ? "#003C88" : "#9DB3CF"; c.stroke();
  if (n !== undefined) { c.fillStyle = filled ? "#FFFFFF" : "#8AA0BE"; c.font = `800 ${Math.round(r * 1.0)}px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(String(n), x, y + 1); }
};
const header = (c, x, w, text) => {
  c.fillStyle = NAVY; c.fillRect(x, 0, w, 150);
  c.fillStyle = LIGHT; c.fillRect(x, 150, w, 12);
  c.fillStyle = "#FFFFFF"; c.font = `800 60px ${BODY}`; c.textAlign = "center"; c.textBaseline = "alphabetic"; c.fillText(text, x + w / 2, 100);
};
const crease = (c, x, h) => {   // the fold's soft shading either side of a crease
  const g = c.createLinearGradient(x - 26, 0, x + 26, 0);
  g.addColorStop(0, "rgba(11,37,71,0)"); g.addColorStop(0.5, "rgba(11,37,71,0.16)"); g.addColorStop(1, "rgba(11,37,71,0)");
  c.fillStyle = g; c.fillRect(x - 26, 0, 52, h);
};
const paperGrain = (c, w, h, seed) => {
  for (let i = 0; i < 2600; i++) { const a = 0.025 + rnd(seed + i) * 0.03; c.fillStyle = `rgba(11,37,71,${a})`; c.fillRect(rnd(seed + i * 3) * w, rnd(seed + i * 7) * h, 1.5, 1.5); }
};
// ── the inside spread (1800 × 1280) ─────────────────────────────────────────────────────────────────────────────────────────
const drawSpread = (c, w, h) => {
  c.fillStyle = PAPER; c.fillRect(0, 0, w, h);
  paperGrain(c, w, h, 11);
  // LEFT: how to play
  header(c, 0, 600, "HOW TO PLAY");
  const steps = ["PICK 6 NUMBERS", "CHECK THE DRAW", "MATCH TO WIN"];
  steps.forEach((s, i) => {
    const y = 250 + i * 330;
    ball(c, 90, y, 44, i + 1, true, NAVY);
    c.fillStyle = NAVY; c.font = `800 44px ${BODY}`; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText(s, 152, y);
    greek(c, 60, y + 70, 480, 3, 28, 10, "rgba(11,37,71,0.22)", 30 + i * 9);
    if (i === 0) for (let k = 0; k < 6; k++) ball(c, 92 + k * 82, y + 200, 30, [7, 13, 22, 31, 38, 45][k], k % 2 === 0);
  });
  // MIDDLE: prizes — each tier shown as balls matched (no amounts)
  header(c, 600, 600, "PRIZES");
  [6, 5, 4, 3].forEach((m, i) => {
    const y = 250 + i * 250;
    c.fillStyle = i === 0 ? "rgba(0,93,200,0.10)" : "rgba(11,37,71,0.04)"; c.beginPath(); c.roundRect(630, y - 70, 540, 210, 18); c.fill();
    c.fillStyle = NAVY; c.font = `800 52px ${BODY}`; c.textAlign = "left"; c.textBaseline = "alphabetic"; c.fillText(`MATCH ${m}`, 662, y);
    c.fillStyle = i === 0 ? BLUE : "rgba(11,37,71,0.55)"; c.font = `700 34px ${BODY}`; c.textAlign = "right"; c.fillText(i === 0 ? "JACKPOT" : "PRIZE", 1140, y);
    for (let k = 0; k < 6; k++) ball(c, 690 + k * 78, y + 78, 28, undefined, k < m);
  });
  greek(c, 640, 1240, 400, 1, 24, 10);
  // RIGHT: the roll-down — the rule in words, then the machine as a diagram
  header(c, 1200, 600, "THE ROLL-DOWN");
  c.textAlign = "left"; c.textBaseline = "alphabetic"; c.font = `700 46px ${BODY}`;
  RULE.lines = [];
  RULE_TEXT.forEach((s, i) => {
    const y = 232 + i * 60;
    c.fillStyle = NAVY; c.fillText(s, RULE.x0, y);
    RULE.lines.push({ y0: y - 40, y1: y + 12, x1: RULE.x0 + c.measureText(s).width + 8 });
  });
  // the diagram: the jackpot column (coins up to the $5M line), the shut MATCH 6 gate on top, three tiers stepping down
  const cx = 1330, top = 690, bot = 1210, cw = 150;
  c.strokeStyle = NAVY; c.lineWidth = 6;
  c.fillStyle = "rgba(0,93,200,0.08)"; c.beginPath(); c.roundRect(cx - cw / 2, top, cw, bot - top, 22); c.fill(); c.stroke();
  const lvl = 800;
  const cg = c.createLinearGradient(0, lvl, 0, bot); cg.addColorStop(0, "#7FB4F2"); cg.addColorStop(1, BLUE);
  c.fillStyle = cg; c.beginPath(); c.roundRect(cx - cw / 2 + 10, lvl, cw - 20, bot - lvl - 10, 14); c.fill();
  c.strokeStyle = "rgba(255,255,255,0.55)"; c.lineWidth = 3;
  for (let y = lvl + 22; y < bot - 14; y += 22) { c.beginPath(); c.moveTo(cx - cw / 2 + 16, y); c.lineTo(cx + cw / 2 - 16, y); c.stroke(); }
  c.setLineDash([14, 10]); c.strokeStyle = BLUE; c.lineWidth = 5; c.beginPath(); c.moveTo(cx - cw / 2 - 30, lvl); c.lineTo(cx + cw / 2 + 8, lvl); c.stroke(); c.setLineDash([]);
  c.fillStyle = BLUE; c.font = `800 38px ${BODY}`; c.textAlign = "right"; c.fillText("$5M", cx - cw / 2 - 34, lvl + 13);
  // the MATCH 6 gate (shut)
  c.fillStyle = NAVY; c.beginPath(); c.roundRect(cx - cw / 2 - 12, top - 58, cw + 24, 48, 10); c.fill();
  c.fillStyle = "#FFFFFF"; c.font = `800 28px ${BODY}`; c.textAlign = "center"; c.fillText("MATCH 6", cx, top - 24);
  c.font = `700 30px ${BODY}`; c.fillStyle = NAVY; c.textAlign = "left"; c.fillText("JACKPOT", cx - cw / 2 - 12, top - 74);
  // the tiers and the arrows that roll down into them
  [["MATCH 5", 800], ["MATCH 4", 950], ["MATCH 3", 1100]].forEach(([t, y], i) => {
    const x = 1490 + i * 34;
    c.fillStyle = "rgba(0,93,200,0.12)"; c.strokeStyle = BLUE; c.lineWidth = 5; c.beginPath(); c.roundRect(x, y, 1770 - x, 88, 14); c.fill(); c.stroke();
    c.fillStyle = NAVY; c.font = `800 38px ${BODY}`; c.textAlign = "center"; c.fillText(t, x + (1770 - x) / 2, y + 58);
    c.strokeStyle = BLUE; c.lineWidth = 6; c.beginPath(); c.moveTo(cx + cw / 2 + 4, lvl + 20 + i * 40); c.quadraticCurveTo(x - 30, lvl + 20 + i * 40, x - 6, y + 44); c.stroke();
    c.fillStyle = BLUE; c.beginPath(); c.moveTo(x - 2, y + 44); c.lineTo(x - 26, y + 28); c.lineTo(x - 22, y + 60); c.closePath(); c.fill();
  });
  crease(c, 600, h); crease(c, 1200, h);
};
// ── the cover (600 × 1280): WINFALL, the balls, a NEW! flash ─────────────────────────────────────────────────────────────────
const drawCover = (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w * 0.4, h); g.addColorStop(0, "#08305E"); g.addColorStop(0.55, BLUE); g.addColorStop(1, "#0A3F80");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  // a fan of light rays behind the title
  c.save(); c.translate(w / 2, 560); for (let i = 0; i < 18; i++) { c.rotate(Math.PI / 9); c.fillStyle = "rgba(255,255,255,0.05)"; c.beginPath(); c.moveTo(0, 0); c.lineTo(900, -70); c.lineTo(900, 70); c.fill(); } c.restore();
  c.fillStyle = "#FFFFFF"; c.beginPath(); c.roundRect(40, 46, 170, 70, 35); c.fill();
  c.fillStyle = BLUE; c.font = `800 44px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("NEW!", 125, 83);
  c.textBaseline = "alphabetic";
  c.fillStyle = "#FFFFFF"; c.font = `260px ${FIGURE}`; c.textAlign = "center"; c.fillText("WIN", w / 2, 450);
  c.fillStyle = "#B3CEEF"; c.fillText("FALL", w / 2, 700);
  [[150, 860, 7], [300, 830, 22], [450, 870, 38], [220, 990, 13], [380, 990, 45]].forEach(([x, y, n], i) => ball(c, x, y, 62, n, i % 2 === 0, i % 2 ? NAVY : BLUE));
  c.fillStyle = "#FFFFFF"; c.font = `800 46px ${BODY}`; c.fillText("A NEW LOTTO GAME", w / 2, 1150);
  c.fillStyle = "rgba(255,255,255,0.75)"; c.font = `600 32px ${BODY}`; c.fillText("HOW TO PLAY INSIDE", w / 2, 1210);
};
// the back panel (outer face of the right flap): odds and the small print, unreadable
const drawBack = (c, w, h) => {
  c.fillStyle = PAPER; c.fillRect(0, 0, w, h); paperGrain(c, w, h, 77);
  c.fillStyle = NAVY; c.fillRect(0, 0, w, 120);
  c.fillStyle = "#FFFFFF"; c.font = `800 48px ${BODY}`; c.textAlign = "center"; c.fillText("GOOD TO KNOW", w / 2, 80);
  for (let b = 0; b < 4; b++) { c.fillStyle = NAVY; c.fillRect(50, 190 + b * 260, 200, 18); greek(c, 50, 236 + b * 260, 500, 5, 30, 10, "rgba(11,37,71,0.25)", 90 + b * 13); }
};
const plain = (c, w, h) => { c.fillStyle = PAPER; c.fillRect(0, 0, w, h); paperGrain(c, w, h, 5); };

const useBroTex = () => useMemo(() => {
  const spread = canvasTex("rb_spread", 1800, 1280, drawSpread);
  const slice = (k, i) => canvasTex(k, 600, 1280, (c) => c.drawImage(spread.image, i * 600, 0, 600, 1280, 0, 0, 600, 1280));
  return { L: slice("rb_L", 0), C: slice("rb_C", 1), R: slice("rb_R", 2), cover: canvasTex("rb_cover", 600, 1280, drawCover), back: canvasTex("rb_back", 600, 1280, drawBack), plain: canvasTex("rb_plain", 300, 640, plain) };
}, []);
const mats = (inner, outer) => {
  const edge = new THREE.MeshStandardMaterial({ color: "#DDE5EF", roughness: 0.8 });
  const face = (t) => new THREE.MeshStandardMaterial({ map: t, roughness: 0.62, metalness: 0, emissiveMap: t, emissive: "#ffffff", emissiveIntensity: 0.04, envMapIntensity: 0.5 });
  return [edge, edge, edge, edge, face(inner), face(outer)];
};
const Sheet = ({ m, x }) => (
  <mesh position={[x, 0, -BRO.T / 2]} material={m} castShadow receiveShadow><boxGeometry args={[BRO.PW, BRO.PH, BRO.T]} /></mesh>
);
// the highlight: one translucent light-blue stroke per line, laid in order; a small light runs at its head
const Highlight = ({ hi, glow }) => {
  if (hi <= 0 || !RULE.lines.length) return null;
  const n = RULE.lines.length;
  return (
    <group>
      {RULE.lines.map((ln, i) => {
        const k = clamp01(hi * n - i);
        if (k <= 0) return null;
        const xa = RULE.x0 - 8, xb = xa + (ln.x1 - xa) * k;
        const [ax, ay] = pxToDesign(xa, ln.y0), [bx, by] = pxToDesign(xb, ln.y1);
        const head = k < 1 || i === n - 1;
        return (
          <group key={i}>
            <mesh position={[(ax + bx) / 2 - BRO.PW, (ay + by) / 2, 0.0004]}>
              <planeGeometry args={[Math.max(1e-4, bx - ax), ay - by]} />
              <meshBasicMaterial color="#6FAAF0" transparent opacity={0.5} depthWrite={false} toneMapped={false} />
            </mesh>
            {head && k < 1 && glow > 0 && <Glow position={[bx - BRO.PW, (ay + by) / 2, 0.004]} size={0.05} color="#B3CEEF" opacity={0.9 * glow} />}
          </group>
        );
      })}
    </group>
  );
};
/** the brochure lying flat; position p in the parent's frame, yaw (radians) about the vertical */
export const Brochure = ({ p, open = 1, hi = 0, glow = 1, yaw = 0 }) => {
  const t = useBroTex();
  const m = useMemo(() => ({ C: mats(t.C, t.plain), R: mats(t.R, t.back), L: mats(t.L, t.cover) }), [t]);
  // the left flap (on top, carrying the cover) opens first, then the right; a slight residual lift (paper never lies quite flat)
  const oL = clamp01(open * 2), oR = clamp01(open * 2 - 1);
  const aL = (Math.PI - 0.05) * (1 - oL) + 0.05 * oL;          // folded: lies just proud of the stack; open: a slight lift
  const aR = -(Math.PI - 0.035) * (1 - oR) - 0.035 * oR;
  const { PW, T } = BRO;
  return (
    <group position={p} rotation-y={yaw - Math.PI / 2}>
      <group rotation-x={-Math.PI / 2}>
        <Sheet m={m.C} x={0} />
        <group position={[PW / 2, 0, T * 0.5]} rotation-y={aR}>
          <Sheet m={m.R} x={PW / 2} />
          <group position={[PW / 2, 0, 0]}><Highlight hi={hi} glow={glow} /></group>
        </group>
        <group position={[-PW / 2, 0, T * 1.6]} rotation-y={aL}>
          <Sheet m={m.L} x={-PW / 2} />
        </group>
      </group>
    </group>
  );
};
/** a stack of folded brochures (cover up) for a counter stand */
export const BrochureStack = ({ p, n = 6, yaw = 0 }) => {
  const t = useBroTex();
  const m = useMemo(() => mats(t.cover, t.plain), [t]);
  return (
    <group position={p} rotation-y={yaw - Math.PI / 2}>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} material={m} position={[(rnd(i + 3) - 0.5) * 0.006, (i + 0.5) * BRO.T * 3, (rnd(i + 9) - 0.5) * 0.006]} rotation-x={-Math.PI / 2} rotation-z={(rnd(i) - 0.5) * 0.05} castShadow receiveShadow>
          <boxGeometry args={[BRO.PW, BRO.PH, BRO.T * 3]} />
        </mesh>
      ))}
    </group>
  );
};
