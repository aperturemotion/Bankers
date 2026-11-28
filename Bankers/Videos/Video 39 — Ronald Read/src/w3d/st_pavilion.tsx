// @ts-nocheck
// ★ V39 station PAVILION (builder D): "In 2023, the hospital opened a new wing, partly paid for by his gift: the Ronald Read Pavilion."
//   The same Brattleboro street as `will` (d_bratt.tsx), era "pav" (2023): where the old annex stood, the hospital's new 4-storey wing —
//   red brick and a glass curtain wall over two lit operating-room floors and an office floor, a glass lobby under a blade canopy.
//   REV STYLE (Timur 2026-11-27 rules 1–18):
//   · ARRIVAL (match cut, sign → sign): the will pushes onto the library's stone monument sign until its panel fills the frame; the
//     pavilion opens in the same framing on the wing's cast-bronze dedication plaque (on the brick beside the lit lobby glass) —
//     BRATTLEBORO MEMORIAL HOSPITAL / OPENED / 2023 (FACTCHECK line 9: the hospital says it opened in 2023), held through "2023".
//   · one long, slow crane UP the wing (pulling back as it rises: brick, the lit floors behind the glass, the spandrels) to the parapet
//     band, arriving on the sign; "the Ronald Read Pavilion": RONALD READ / PAVILION lights letter by letter, a word on each spoken word.
//   · No 2-D tags ("Opened 2023" is the plaque; "partly his gift" is the voice over the crane to his name).
import React, { useMemo } from "react";
import * as THREE from "three";
import { ease, Glow, canvasTex, rnd } from "./kit";
import { WIN, wAt, wEndAt } from "./windows";
import { cueAt } from "../bnx/SfxLayer";
import { BrattSet, PavilionSign, SIGN, WING, PL } from "./d_bratt";
import { O_BRATT, BRATT_LIGHT } from "./st_will";
import { BODY, FIGURE } from "./fonts3d";

const T = () => {
  const w = WIN().pavilion, s0 = w.start;
  return { s0, end: w.end, y23: wAt("2023", s0), hosp: wAt("hospital", s0), wing: wAt("wing", s0), partly: wAt("partly", s0), gift: wAt("gift", s0),
    ronald: wAt("ronald", s0), read: wAt("read", s0), pav: wAt("pavilion", s0), pavE: wEndAt("pavilion", s0) };
};
// the letters' lighting: RONALD on "Ronald", READ on "Read", PAVILION on "Pavilion", letter by letter across each word
const WORDS3 = ["RONALD", "READ", "PAVILION"];
const letterLit = (t, i, f) => {
  const starts = [t.ronald, t.read, t.pav], ends = [t.read - 1, t.pav - 1, Math.min(t.pavE, t.end - 14)];
  let n = i;
  for (let w = 0; w < 3; w++) {
    const L = WORDS3[w].length;
    if (n < L) { const a = starts[w] - 2 + (n / L) * (ends[w] - starts[w]); return ease(f, a, a + 4); }
    n -= L;
  }
  return 0;
};
// ── the dedication plaque: cast bronze, raised letters, a raised border, on the brick between the last slot window and the lobby glass ──
const PLQ = { x: WING.x - 4.38, y: PL + 1.55, z: WING.z + 0.02, w: 0.6, h: 0.78 };
const plaqueTex = () => canvasTex("d_pav_plaque2", 768, 1000, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#5B4A2E"); g.addColorStop(0.5, "#4A3B24"); g.addColorStop(1, "#3A2E1C");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(${rnd(i) < 0.5 ? "20,14,6" : "140,110,60"},${0.08 + rnd(i + 1) * 0.08})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2, 2); }   // the cast texture
  const raised = (draw) => { c.fillStyle = "#1E170C"; c.save(); c.translate(3, 4); draw(); c.restore(); c.fillStyle = "#C9A867"; draw(); };
  raised(() => { c.fillRect(26, 26, w - 52, 12); c.fillRect(26, h - 38, w - 52, 12); c.fillRect(26, 26, 12, h - 52); c.fillRect(w - 38, 26, 12, h - 52); });
  c.textAlign = "center"; c.textBaseline = "alphabetic";
  const t = (s, font, y, track = 0) => raised(() => { c.font = font; if ("letterSpacing" in c) c.letterSpacing = track + "px"; c.fillText(s, w / 2 + track / 2, y); });
  t("BRATTLEBORO", `800 62px ${BODY}`, 168, 8);
  t("MEMORIAL HOSPITAL", `800 50px ${BODY}`, 238, 5);
  raised(() => { c.fillRect(w / 2 - 120, 290, 240, 6); });
  t("OPENED", `700 44px ${BODY}`, 400, 14);
  t("2023", `400 300px ${FIGURE}`, 700, 8);
  raised(() => { c.fillRect(w / 2 - 120, 770, 240, 6); });
  t("BRATTLEBORO, VERMONT", `700 34px ${BODY}`, 880, 6);
  if ("letterSpacing" in c) c.letterSpacing = "0px";
});
const Plaque = () => {
  const m = useMemo(() => { const tx = plaqueTex(); return { face: new THREE.MeshStandardMaterial({ map: tx, roughness: 0.42, metalness: 0.75, envMapIntensity: 0.9, bumpMap: tx, bumpScale: 0.6 }), edge: new THREE.MeshStandardMaterial({ color: "#4A3B24", roughness: 0.4, metalness: 0.8 }), bolt: new THREE.MeshStandardMaterial({ color: "#B79A5E", roughness: 0.3, metalness: 0.9 }) }; }, []);
  return (
    <group position={[PLQ.x, PLQ.y, PLQ.z]}>
      <mesh position={[0, 0, 0.012]} material={m.edge}><boxGeometry args={[PLQ.w, PLQ.h, 0.024]} /></mesh>
      <mesh position={[0, 0, 0.0245]} material={m.face}><planeGeometry args={[PLQ.w - 0.004, PLQ.h - 0.004]} /></mesh>
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([a, b]) => <mesh key={a + "" + b} position={[a * (PLQ.w / 2 - 0.03), b * (PLQ.h / 2 - 0.03), 0.028]} rotation-x={Math.PI / 2} material={m.bolt}><cylinderGeometry args={[0.009, 0.009, 0.008, 10]} /></mesh>)}
      {/* its own small up-light in the paving washes it warm (the only warm practical on the facade) */}
      <Glow position={[0, -0.55, 0.12]} size={0.7} color="#FFD8A0" opacity={0.18} />
    </group>
  );
};
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  const lit = (i) => letterLit(t, i, f);
  const all = ease(f, t.pav, t.pavE);
  return (
    <group>
      <BrattSet era="pav" />
      <Plaque />
      <group position={[0, PL, 0]}><PavilionSign lit={lit} /></group>
      {/* the lit sign washes its band and the glass under it */}
      <Glow position={[SIGN.cx, PL + (SIGN.y[0] + SIGN.y[1]) / 2, SIGN.z + 0.4]} size={7} color="#BFD6FF" opacity={0.16 * all} />
    </group>
  );
};
const W = (p) => [p[0] + O_BRATT[0], p[1] + O_BRATT[1], p[2] + O_BRATT[2]];
// the final framing (square-on, level): distance and fov so RONALD READ spans ≈ 45 % of the width
const SIGN_FOV = 46, SIGN_D = 22.7;
const shots = () => {
  const t = T(), yRR = PL + SIGN.y[0], yF = yRR - 0.084 * SIGN_D * Math.tan((SIGN_FOV / 2) * Math.PI / 180);
  return [
    // the cut: the plaque filling the frame's width, as the library's stone sign did (the lit lobby glass at its right edge)
    { a: t.s0, b: t.s0, cut: true, pos: W([PLQ.x, PLQ.y + 0.03, PLQ.z + 1.75]), target: W([PLQ.x, PLQ.y, PLQ.z]), fov: 40 },
    // a hair of drift while "2023" is read on the plaque
    { a: t.s0 + 1, b: t.s0 + 12, pos: W([PLQ.x + 0.06, PLQ.y + 0.05, PLQ.z + 1.95]), target: W([PLQ.x + 0.05, PLQ.y, PLQ.z]), fov: 40 },
    // "the hospital opened a new wing": one long pull straight back off the plaque, the lobby and the lit floors coming into frame
    { a: t.s0 + 4, b: t.wing + 26, pos: W([PLQ.x + 0.3, PL + 3.0, WING.z + 8.6]), target: W([PLQ.x + 1.1, PL + 3.6, WING.z]), fov: 44 },
    // "partly paid for by his gift": one slow crane up the wing, arriving SQUARE-ON and LEVEL to the sign by 1982 — RONALD READ ≈ 45 %
    // of the frame's width, centred ≈ 47 % down (the match into line's band, whose RONALD READ is the same Figtree 700 caps)
    { a: t.wing - 16, b: t.end - 2, pos: W([SIGN.cx, yF, WING.z + SIGN_D]), target: W([SIGN.cx, yF, WING.z]), fov: SIGN_FOV }
  ];
};
const Overlay = () => null;
// rev style sound: the sign's letters switching on, a soft click per word, each on its word (they span its letters' 4-f ramps)
const sfx = () => {
  const t = T();
  return [
    cueAt("ee_click_click_01", t.ronald - 2, 6, 0.24),
    cueAt("ee_click_click_01", t.read - 2, 6, 0.24),
    cueAt("ee_click_click_01", t.pav - 2, 6, 0.24)
  ];
};
const w0 = WIN().pavilion;
// mounted from the frame after the cut (a cut shot at `start` lands on start + 1) — the will's set is unmounted at `start`
export const ST = { id: "pavilion", origin: O_BRATT, from: w0.start + 1, to: w0.end + 8, light: BRATT_LIGHT, shots, Scene, Overlay, sfx };
