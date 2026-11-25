// @ts-nocheck
// ★ V38 GLOBE — the newspaper: a broadsheet front page with the masthead "The Boston Globe" set in a neutral serif (masthead TEXT only,
//   no copy of the paper's logo art), the dateline of the first story (Sunday, July 31, 2011 — FACTCHECK: HL) and a page whose
//   headline, photo and columns are deliberately blurred past reading (no invented headline). Lies with its top toward +x.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { BODY } from "./fonts3d";

export const PAPER_W = 0.84, PAPER_H = 1.28;     // a broadsheet front page, at 2.2× life (z across, x along)
const SERIF = `"Liberation Serif", "DejaVu Serif", "FreeSerif", serif`;
export const MAST_Y = 0.14;   // the masthead's centre, from the page top, as a fraction of the page height
export const DATE_Y = 0.205;  // the dateline rule
const frontTex = () => canvasTex("g_globeFront", 1024, 1560, (c, w, h) => {
  c.fillStyle = "#EEF1F4"; c.fillRect(0, 0, w, h);
  // paper grain
  for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(90,100,120,${0.03 + rnd(i) * 0.04})`; c.fillRect(rnd(i + 3) * w, rnd(i + 5) * h, 1.5, 1.5); }
  // the masthead (text only) and the dateline between two rules
  c.fillStyle = "#0E1622"; c.textAlign = "center";
  c.font = `700 118px ${SERIF}`; c.fillText("The Boston Globe", w / 2, h * MAST_Y + 40, w - 70);
  c.fillRect(40, h * DATE_Y - 34, w - 80, 4); c.fillRect(40, h * DATE_Y + 14, w - 80, 2);
  c.font = `700 26px ${BODY}`; c.textAlign = "left"; c.fillText("SUNDAY, JULY 31, 2011", 46, h * DATE_Y + 2);
  // everything below is blurred past reading: two headline bars, a deck, a photo, and the columns — drawn sharp on a scratch
  // canvas, then laid on the page through ONE blur (a filter per shape is very slow)
  const blurred = (px, draw) => { const o = document.createElement("canvas"); o.width = w; o.height = h; const q = o.getContext("2d"); draw(q); c.filter = `blur(${px}px)`; c.drawImage(o, 0, 0); c.filter = "none"; };
  blurred(7, (q) => { q.fillStyle = "rgba(14,22,34,0.85)"; q.fillRect(50, h * 0.245, w * 0.86, 62); q.fillRect(50, h * 0.245 + 82, w * 0.62, 62); });
  blurred(4, (q) => {
    q.fillStyle = "rgba(14,22,34,0.55)";
    for (let k = 0; k < 2; k++) q.fillRect(50, h * 0.36 + k * 34, w * (0.8 - k * 0.25), 16);
    const g = q.createLinearGradient(0, h * 0.42, 0, h * 0.66); g.addColorStop(0, "#56708F"); g.addColorStop(0.6, "#2E4562"); g.addColorStop(1, "#1D2C42");
    q.fillStyle = g; q.fillRect(50, h * 0.42, w * 0.6, h * 0.24);
    // the photo's content, unreadable: a lit building front and figures of light, no people
    q.fillStyle = "rgba(160,182,210,0.55)"; q.fillRect(50 + w * 0.08, h * 0.5, w * 0.44, h * 0.12);
    q.fillStyle = "rgba(255,214,150,0.55)"; for (let k = 0; k < 6; k++) q.fillRect(50 + w * 0.1 + k * w * 0.07, h * 0.52, w * 0.035, h * 0.04);
  });
  blurred(2.6, (q) => {
    q.fillStyle = "rgba(20,28,40,0.55)";
    [[50, 0.685, 0.29], [50 + w * 0.31, 0.685, 0.29], [50 + w * 0.64, 0.42, 0.3]].forEach(([x, y0, cw]) => {
      for (let y = h * y0; y < h * 0.95; y += 22) if (rnd(x + y) > 0.06) q.fillRect(x, y, w * cw * (0.82 + rnd(y + x * 3) * 0.18), 9);
    });
  });
  c.fillStyle = "rgba(14,22,34,0.6)"; c.fillRect(w * 0.62, h * 0.42, 2, h * 0.53); c.fillRect(w * 0.31 + 40, h * 0.685, 2, h * 0.265);
});
/** the paper lying on the ground, its top edge toward +x; curl lifts the long edges a touch */
export const Newspaper = ({ glowSweep = -1 }) => {
  const tex = useMemo(frontTex, []);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(PAPER_W, PAPER_H, 12, 24);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, 0.014 * Math.pow(Math.abs(x) / (PAPER_W / 2), 2) + 0.006 * Math.sin((y / PAPER_H) * Math.PI * 3)); }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group>
      {/* the page: plane in XY rotated flat; its u runs along +x (page top at +x after the turn) */}
      <group rotation-y={-Math.PI / 2}>
        <mesh geometry={geo} rotation-x={-Math.PI / 2} position={[0, 0.011, 0]} receiveShadow castShadow>
          <meshStandardMaterial map={tex} roughness={0.85} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.22} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* the sheets under it (the paper's thickness) */}
      <mesh position={[0, 0.002, 0]} receiveShadow><boxGeometry args={[PAPER_H - 0.01, 0.004, PAPER_W - 0.01]} /><meshStandardMaterial color="#D9DEE5" roughness={0.9} /></mesh>
    </group>
  );
};
