// @ts-nocheck
// ★ V38 station COMPANY (builder B): "He and his wife Marge formed a company with family and friends, and played 12 roll-downs,
//   until Michigan ended the game." (883–1079)
//   A home office at night (1 unit = 10 cm; the desk top is y 0), the same blue-hour street in the window:
//   · ARRIVAL (cut, from test's push onto the $1 bill's engraved seal): a macro on the gold seal of a share certificate of
//     G.S. INVESTMENT STRATEGIES (the real company, CBS); the camera pulls back as seven certificates fan out across the blotter
//     ("formed a company"); "$500 A SHARE" (CBS) tags the top one; on "family and friends" the CBS photo of shareholders (credited)
//     and "25 MEMBERS" (CBS: the club stood at 25 by spring 2005).
//   · "played 12 roll-downs": the camera cranes up to the chalkboard over the desk; twelve chalk strokes are drawn one by one
//     (IIII̸ IIII̸ II), each glowing in the house light blue as it is drawn, the counter landing on 12 on "roll-downs".
//   · "until Michigan ended the game": the camera comes down to the lottery terminal at the desk's end; its shell turns to glass
//     (the reference x-ray) and the game board glows inside; on "ended" the glow dies, the screen flickers and goes black,
//     GAME ENDED 2005 (HL: May 2005); the shell turns solid again and the camera pushes INTO the black screen (DEPARTURE).
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ease, easeOut, rnd, clamp01, Sky, Glow, canvasTex } from "./kit";
import { Tag, Counter, Inset } from "./overlays";
import { wf, wEnd } from "./take";
import { cueAt } from "../bnx/SfxLayer";
import { staticFile } from "remotion";
import { BODY, FIGURE, SERIF } from "./fonts3d";
import { Room, Outside, TableLamp, noiseTex } from "./st_test_props";
import { T as TT } from "./st_test";

export const COMPANY_ORIGIN = [900, 0, 0];
// DEPARTURE: "fly" (road's flight takes the camera from ≈ 1062: this station's last framing is the terminal going dark) or "push"
//   (the camera pushes INTO the black screen over game → game end; road then cuts in, cut: true, on something dark at ≈ 1085)
export const COMPANY_DEPART = "fly";
export const T = () => {
  const cut = TT().out - 1;   // the frame BEFORE test's push lands: the cut shows from TT().out
  return {
    cut, he: wf("he", 2), marge: wf("marge"), company: wf("company"), family: wf("family"), friends: wf("friends"), friendsEnd: wEnd("friends"),
    played: wf("played"), twelve: wf("12"), rolls: wf("roll-downs"), rollsEnd: wEnd("roll-downs"), until: wf("until"), michigan: wf("michigan", 2),
    ended: wf("ended"), game: wf("game", 2), gameEnd: wEnd("game", 2)
  };
};
// ── the share certificate ─────────────────────────────────────────────────────────────────────────────────────────────────
const CW = 2.8, CH = 2.15;   // a letter-size certificate, landscape (28 × 21.5 cm)
const certTex = (n) => canvasTex("stc_cert" + n, 1024, 786, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#F1F4F8"); g.addColorStop(1, "#E3E9F1"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  const ink = "#1D4D8F";
  // the engraved border: an outer rule, a guilloche band of interlaced waves, an inner rule
  c.strokeStyle = ink; c.lineWidth = 6; c.strokeRect(18, 18, w - 36, h - 36);
  c.lineWidth = 2; c.strokeRect(70, 70, w - 140, h - 140);
  c.lineWidth = 1.1; c.strokeStyle = "rgba(29,77,143,0.8)";
  const band = (x0, y0, x1, y1, ph) => {
    const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len;
    for (let k = 0; k < 3; k++) { c.beginPath(); for (let s = 0; s <= len; s += 2) { const o = 15 * Math.sin(s / 9 + k * 2.1 + ph); const x = x0 + ux * s - uy * o, y = y0 + uy * s + ux * o; s ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
  };
  band(44, 44, w - 44, 44, 0); band(44, h - 44, w - 44, h - 44, 1); band(44, 44, 44, h - 44, 2); band(w - 44, 44, w - 44, h - 44, 3);
  // corner rosettes
  [[44, 44], [w - 44, 44], [44, h - 44], [w - 44, h - 44]].forEach(([x, y]) => {
    c.fillStyle = "#F1F4F8"; c.beginPath(); c.arc(x, y, 30, 0, Math.PI * 2); c.fill();
    c.strokeStyle = ink; c.lineWidth = 1; for (let k = 0; k < 18; k++) { c.beginPath(); c.ellipse(x, y, 26, 9, (k * Math.PI) / 18, 0, Math.PI * 2); c.stroke(); }
  });
  // the title block
  c.fillStyle = ink; c.textAlign = "center";
  c.font = `800 50px ${BODY}`; c.letterSpacing = "6px"; c.fillText("G.S. INVESTMENT STRATEGIES", w / 2, 160); c.letterSpacing = "0px";
  c.font = `400 84px ${SERIF}`; c.fillText("Share Certificate", w / 2, 258);
  // the centre vignette: a sunburst behind the monogram
  c.save(); c.translate(w / 2, 420);
  for (let k = 0; k < 72; k++) { const a = (k / 72) * Math.PI * 2; c.strokeStyle = `rgba(29,77,143,${k % 2 ? 0.25 : 0.5})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(Math.cos(a) * 34, Math.sin(a) * 34); c.lineTo(Math.cos(a) * 92, Math.sin(a) * 92); c.stroke(); }
  c.fillStyle = "#F1F4F8"; c.beginPath(); c.arc(0, 0, 44, 0, Math.PI * 2); c.fill();
  c.strokeStyle = ink; c.lineWidth = 3; c.stroke();
  c.fillStyle = ink; c.font = `400 50px ${FIGURE}`; c.textBaseline = "middle"; c.fillText("GS", 0, 3); c.textBaseline = "alphabetic";
  c.restore();
  c.font = `600 26px ${BODY}`; c.fillStyle = "#2B4A72";
  c.fillText("THIS CERTIFIES THAT", w / 2, 560);
  c.fillStyle = "rgba(29,77,143,0.6)"; c.fillRect(250, 600, w - 500, 2);
  c.fillStyle = "#2B4A72"; c.fillText("IS A SHAREHOLDER", w / 2, 640);
  // the number, top left
  c.textAlign = "left"; c.font = `700 28px ${BODY}`; c.fillStyle = "#2B4A72"; c.fillText("No. " + String(n + 1).padStart(3, "0"), 104, 124);
  // the gold foil seal, bottom left (a serrated disc)
  c.save(); c.translate(190, h - 170);
  const sg = c.createRadialGradient(-14, -14, 4, 0, 0, 74); sg.addColorStop(0, "#F4DC97"); sg.addColorStop(0.6, "#C9A24A"); sg.addColorStop(1, "#8F6E2A");
  c.fillStyle = sg; c.beginPath(); for (let k = 0; k <= 64; k++) { const a = (k / 64) * Math.PI * 2, r = k % 2 ? 66 : 74; k ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(r, 0); } c.fill();
  c.strokeStyle = "rgba(110,80,25,0.7)"; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 50, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.arc(0, 0, 40, 0, Math.PI * 2); c.stroke();
  for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a) * 41, Math.sin(a) * 41); c.lineTo(Math.cos(a) * 49, Math.sin(a) * 49); c.stroke(); }
  c.fillStyle = "rgba(110,80,25,0.85)"; c.font = `400 30px ${FIGURE}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("GS", 0, 2);
  c.restore();
  // two signature lines with illegible pen strokes (no readable names)
  [[w - 330, h - 150], [w / 2 + 10, h - 150]].forEach(([x, y], j) => {
    c.fillStyle = "rgba(29,77,143,0.7)"; c.fillRect(x - 120, y, 240, 2);
    c.strokeStyle = "rgba(15,30,60,0.85)"; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x - 100, y - 14);
    for (let k = 0; k < 18; k++) c.lineTo(x - 100 + k * 11, y - 14 - 18 * Math.sin(k * 1.3 + j) * rnd(k + j * 30));
    c.stroke();
  });
});
const CERT_N = 7;
// the fan: certificate i turns about its lower-left corner by ang(i) as it opens; the top one (i = N−1) stays square
const fanAng = (i) => (CERT_N - 1 - i) * 0.16;
const fanOpen = (t, f, i) => ease(f, t.cut + 4 + (CERT_N - 1 - i) * 3, t.cut + 30 + (CERT_N - 1 - i) * 3);
const FAN_PIVOT = [-3.6, 0, 1.2];
const Certificates = ({ f, t }) => {
  const geo = useMemo(() => new THREE.BoxGeometry(CW, 0.012, CH), []);
  const mats = useMemo(() => Array.from({ length: CERT_N }, (_, i) => {
    const edge = new THREE.MeshStandardMaterial({ color: "#E6ECF3", roughness: 0.8 });
    return [edge, edge, new THREE.MeshStandardMaterial({ map: certTex(i), color: "#B6C1D0", roughness: 0.62, envMapIntensity: 0.3 }), edge, edge, edge];
  }), []);
  return (
    <group position={FAN_PIVOT}>
      {Array.from({ length: CERT_N }, (_, i) => {
        const a = fanAng(i) * fanOpen(t, f, i);
        // each sheet is positioned by its lower-left corner (the pivot); a slight lift so the edges don't fight
        return (
          <group key={i} rotation-y={a} position={[0, 0.008 + i * 0.014, 0]}>
            <mesh geometry={geo} material={mats[i]} position={[CW / 2, 0, -CH / 2]} castShadow receiveShadow />
          </group>
        );
      })}
    </group>
  );
};
// the top certificate's seal in local coords (for the macro and the tag): seal at (190, h−170) of 1024×786
const SEAL = [FAN_PIVOT[0] + (190 / 1024) * CW, 0.11, FAN_PIVOT[2] - CH + ((786 - 170) / 786) * CH];
const TITLE = [FAN_PIVOT[0] + CW / 2, 0.11, FAN_PIVOT[2] - CH + (200 / 786) * CH];
// ── the chalkboard (wall) with its twelve strokes ─────────────────────────────────────────────────────────────────────────
const BX = 1.2, BY = 7.8, BZ = -9.7, BW = 6.8, BH = 4.4;
const slateTex = () => canvasTex("stc_slate", 512, 320, (c, w, h) => {
  c.fillStyle = "#1A2631"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { const x = rnd(i) * w, y = rnd(i + 9) * h, r = 20 + rnd(i + 3) * 60; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, "rgba(220,232,250,0.06)"); g.addColorStop(1, "rgba(220,232,250,0)"); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  // old eraser swirls
  c.strokeStyle = "rgba(220,232,250,0.05)"; c.lineWidth = 18; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(80 + k * 70, 200 + 30 * Math.sin(k), 60, 0.3, 2.4); c.stroke(); }
  // the heading, in chalk
  c.fillStyle = "rgba(236,243,250,0.9)"; c.font = `italic 700 40px ${BODY}`; c.textAlign = "left"; c.fillText("WINFALL ROLL-DOWNS", 30, 56);
  c.fillRect(30, 66, 300, 3);
});
const chalkTex = () => canvasTex("stc_chalk", 32, 256, (c, w, h) => {
  c.fillStyle = "rgba(0,0,0,0)"; c.clearRect(0, 0, w, h);
  for (let i = 0; i < 1600; i++) { c.fillStyle = `rgba(240,246,252,${0.35 + rnd(i) * 0.65})`; c.fillRect(4 + rnd(i + 1) * (w - 8), rnd(i + 2) * h, 2, 2); }
});
// stroke k: [x0, y0, x1, y1] on the board (board-centred units); four uprights and a gate per group of five, then two
const STROKES = (() => {
  const s = [];
  for (let g = 0; g < 3; g++) {
    const gx = -2.5 + g * 2.15, n = g < 2 ? 4 : 2;
    for (let j = 0; j < n; j++) { const x = gx + j * 0.36, w = 0.06 * (rnd(g * 7 + j) - 0.5); s.push([x, -1.25, x + w, 0.55]); }
    if (g < 2) s.push([gx - 0.28, -0.95, gx + 1.38, 0.3]);   // the gate, lower-left to upper-right across the four
  }
  return s;   // 12
})();
const drawAt = (t, k) => t.played + 2 + k * 2.2;      // the last (#11) at played + 26 ≈ "roll-downs"
const Chalkboard = ({ f, t }) => {
  const st = useMemo(slateTex, []), ck = useMemo(chalkTex, []);
  const frame = "#5A6676";
  return (
    <group position={[BX, BY, BZ]}>
      <mesh receiveShadow><boxGeometry args={[BW, BH, 0.12]} /><meshStandardMaterial map={st} roughness={0.95} envMapIntensity={0.3} /></mesh>
      {[[0, BH / 2 + 0.2, BW + 0.8, 0.4], [0, -BH / 2 - 0.2, BW + 0.8, 0.4], [-BW / 2 - 0.2, 0, 0.4, BH], [BW / 2 + 0.2, 0, 0.4, BH]].map(([x, y, w, h], i) =>
        <mesh key={i} position={[x, y, 0.1]} castShadow><boxGeometry args={[w, h, 0.35]} /><meshStandardMaterial color={frame} roughness={0.6} /></mesh>)}
      {/* the chalk tray, a stick of chalk and the eraser */}
      <mesh position={[0, -BH / 2 - 0.45, 0.4]} castShadow receiveShadow><boxGeometry args={[BW * 0.9, 0.12, 0.7]} /><meshStandardMaterial color={frame} roughness={0.6} /></mesh>
      <mesh position={[1.8, -BH / 2 - 0.33, 0.45]} rotation-z={Math.PI / 2} rotation-y={0.3} castShadow><cylinderGeometry args={[0.06, 0.06, 0.8, 10]} /><meshStandardMaterial color="#EEF3FA" roughness={0.95} /></mesh>
      <group position={[-2.4, -BH / 2 - 0.22, 0.45]} rotation-y={-0.12}>
        <mesh castShadow><boxGeometry args={[1.3, 0.28, 0.5]} /><meshStandardMaterial color="#C9D3DF" roughness={0.8} /></mesh>
        <mesh position={[0, -0.12, 0]}><boxGeometry args={[1.3, 0.08, 0.5]} /><meshStandardMaterial color="#2E3B4C" roughness={0.95} /></mesh>
      </group>
      {/* the twelve strokes: each draws from its foot up over 5 f, flaring in the house light blue, then settling to chalk */}
      {STROKES.map(([x0, y0, x1, y1], k) => {
        const a = drawAt(t, k), d = ease(f, a, a + 5);
        if (d <= 0.001) return null;
        const flare = ease(f, a, a + 3) * (1 - ease(f, a + 6, a + 26));
        const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
        return (
          <group key={k} position={[x0 + (dx * d) / 2, y0 + (dy * d) / 2, 0.075]} rotation-z={Math.atan2(-dx, dy)}>
            <mesh scale={[1, d, 1]}><planeGeometry args={[0.12, len]} /><meshStandardMaterial map={ck} transparent color="#F0F5FB" emissive="#7FB4F2" emissiveIntensity={0.3 + 1.8 * flare} roughness={1} depthWrite={false} /></mesh>
            {flare > 0.02 && <Glow position={[0, (len * d) / 2 - 0.05, 0.05]} size={0.8} color="#7FB4F2" opacity={0.85 * flare} />}
          </group>
        );
      })}
    </group>
  );
};
// ── the lottery terminal (generic; no real maker's marks) ──────────────────────────────────────────────────────────────────
const TX = 5.4, TZ = -2.6;
const SCR_TILT = -0.16;              // the screen leans back a little
const SCR_C = [0, 2.75, -0.45];       // screen centre (terminal local)
const screenTex = (key, dark) => canvasTex("stc_screen_" + key, 512, 340, (c, w, h) => {
  if (dark) {
    c.fillStyle = "#03060B"; c.fillRect(0, 0, w, h);
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "rgba(120,160,220,0.10)"); g.addColorStop(0.35, "rgba(120,160,220,0.03)"); g.addColorStop(0.36, "rgba(120,160,220,0)"); g.addColorStop(1, "rgba(120,160,220,0.02)");
    c.fillStyle = g; c.fillRect(0, 0, w, h); return;
  }
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#0E4C93"); g.addColorStop(1, "#06274F"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.font = `400 104px ${FIGURE}`; c.fillText("WINFALL", w / 2, 150);
  c.fillStyle = "#B3CEEF"; c.font = `700 28px ${BODY}`; c.letterSpacing = "4px"; c.fillText("ROLL-DOWN DRAW", w / 2, 200); c.letterSpacing = "0px";
  for (let k = 0; k < 6; k++) { c.fillStyle = "rgba(179,206,239,0.85)"; c.beginPath(); c.arc(w / 2 - 150 + k * 60, 262, 22, 0, Math.PI * 2); c.fill(); c.fillStyle = "#06274F"; c.font = `700 22px ${BODY}`; c.fillText(String(3 + k * 7), w / 2 - 150 + k * 60, 270); }
  c.fillStyle = "rgba(255,255,255,0.05)"; for (let y = 0; y < h; y += 4) c.fillRect(0, y, w, 1);   // scan lines
});
const signTex = () => canvasTex("stc_sign", 512, 108, (c, w, h) => {
  c.fillStyle = "#0E4C93"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `800 64px ${BODY}`; c.letterSpacing = "10px"; c.fillText("LOTTERY", w / 2 + 5, h / 2 + 3); c.letterSpacing = "0px";
});
const pcbTex = () => canvasTex("stc_pcb", 256, 256, (c, w, h) => {
  c.fillStyle = "#0B2C55"; c.fillRect(0, 0, w, h);
  c.strokeStyle = "rgba(127,180,242,0.55)"; c.lineWidth = 2;
  for (let k = 0; k < 26; k++) { c.beginPath(); let x = rnd(k) * w, y = rnd(k + 9) * h; c.moveTo(x, y); for (let j = 0; j < 4; j++) { if (j % 2) x += (rnd(k * 4 + j) - 0.5) * 140; else y += (rnd(k * 4 + j + 1) - 0.5) * 140; c.lineTo(x, y); } c.stroke(); }
  c.fillStyle = "rgba(201,168,106,0.8)"; for (let k = 0; k < 40; k++) c.fillRect(rnd(k + 50) * w, rnd(k + 70) * h, 4, 4);
});
const Terminal = ({ f, t }) => {
  const g = useMemo(() => ({ base: new RoundedBoxGeometry(3.2, 1.3, 2.7, 4, 0.18), head: new RoundedBoxGeometry(2.9, 2.1, 0.34, 4, 0.12) }), []);
  const tex = useMemo(() => ({ on: screenTex("on", false), off: screenTex("off", true), sign: signTex(), pcb: pcbTex() }), []);
  // the x-ray: the shell turns to glass on "until", the inside glows (the game running); the glow dies on "ended"; solid again before the push
  const glass = ease(f, t.until - 2, t.until + 7) * (1 - ease(f, t.ended + 6, t.ended + 16));
  const alive = 1 - ease(f, t.ended, t.ended + 6);
  const flick = f >= t.ended && f < t.ended + 6 ? (Math.floor(f - t.ended) % 3 === 1 ? 0.3 : 1) : 1;
  const scr = alive * flick;
  const shellOp = 1 - 0.8 * glass;
  const shell = { color: "#2C3B52", roughness: 0.38, metalness: 0.25, transparent: glass > 0.001, opacity: shellOp, depthWrite: glass < 0.5 };
  return (
    <group position={[TX, 0, TZ]} rotation-y={-0.28}>
      {/* the base: a sloped-front cabinet, the slip reader slot, the keypad */}
      <mesh geometry={g.base} position={[0, 0.65, 0]} castShadow receiveShadow><meshStandardMaterial {...shell} /></mesh>
      <mesh position={[0, 1.02, 1.36]} rotation-x={-0.5}><boxGeometry args={[2.4, 0.08, 0.5]} /><meshStandardMaterial color="#0D2240" roughness={0.4} transparent opacity={shellOp} /></mesh>
      <mesh position={[0, 0.48, 1.36]}><boxGeometry args={[2.3, 0.1, 0.04]} /><meshStandardMaterial color="#05101F" /></mesh>
      {Array.from({ length: 12 }, (_, k) => <mesh key={k} position={[0.55 + (k % 3) * 0.26, 0.98 + Math.floor(k / 3) * 0.035, 1.12 + Math.floor(k / 3) * -0.1]} rotation-x={-0.5}><boxGeometry args={[0.2, 0.07, 0.07]} /><meshStandardMaterial color="#C9D6E6" roughness={0.5} transparent opacity={shellOp} /></mesh>)}
      <mesh position={[0, 1.07, 1.12]}><boxGeometry args={[3.0, 0.06, 0.05]} /><meshStandardMaterial color="#4D8ED9" emissive="#4D8ED9" emissiveIntensity={0.6} transparent opacity={shellOp} /></mesh>
      {/* the head: the screen housing on its neck, leaning back */}
      <mesh position={[0, 1.6, -0.55]} castShadow><boxGeometry args={[0.6, 0.7, 0.45]} /><meshStandardMaterial {...shell} /></mesh>
      <group position={SCR_C} rotation-x={SCR_TILT}>
        <mesh geometry={g.head} castShadow><meshStandardMaterial {...shell} /></mesh>
        <mesh position={[0, 0, 0.175]}><planeGeometry args={[2.5, 1.66]} /><meshBasicMaterial map={tex.off} /></mesh>
        {scr > 0.01 && <mesh position={[0, 0, 0.178]}><planeGeometry args={[2.5, 1.66]} /><meshBasicMaterial map={tex.on} transparent opacity={scr} toneMapped={false} /></mesh>}
        {scr > 0.01 && <Glow position={[0, 0, 0.5]} size={4.2} color="#4D8ED9" opacity={0.35 * scr} />}
      </group>
      {/* the lit sign on top of the head */}
      <group position={[SCR_C[0], SCR_C[1] + 1.3, SCR_C[2] - 0.2]} rotation-x={SCR_TILT}>
        <mesh castShadow><boxGeometry args={[2.0, 0.5, 0.3]} /><meshStandardMaterial {...shell} /></mesh>
        <mesh position={[0, 0, 0.152]}><planeGeometry args={[1.8, 0.38]} /><meshBasicMaterial map={tex.sign} toneMapped={false} transparent opacity={0.35 + 0.65 * scr} /></mesh>
      </group>
      {/* the printer: a ticket slip curling out of the top slot */}
      <mesh position={[0.9, 1.32, 0.35]} rotation-x={-0.25}><boxGeometry args={[0.7, 0.04, 0.12]} /><meshStandardMaterial color="#05101F" /></mesh>
      <mesh position={[0.9, 1.6, 0.32]} rotation-x={-0.35}><planeGeometry args={[0.55, 0.6]} /><meshStandardMaterial color="#EEF3FA" roughness={0.6} side={THREE.DoubleSide} /></mesh>
      {/* the inside (seen through the glass): the paper roll and the game board with its chip */}
      {glass > 0.01 && (
        <group>
          <mesh position={[0.9, 0.85, 0.0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.38, 0.38, 0.62, 24]} /><meshStandardMaterial color="#EEF3FA" roughness={0.7} transparent opacity={glass} /></mesh>
          <mesh position={[-0.5, 0.5, -0.2]}><boxGeometry args={[1.8, 0.05, 1.8]} /><meshStandardMaterial map={tex.pcb} roughness={0.5} transparent opacity={glass} emissive="#7FB4F2" emissiveIntensity={0.25 * alive} /></mesh>
          {Array.from({ length: 6 }, (_, k) => <mesh key={k} position={[-1.05 + (k % 3) * 0.5, 0.56, -0.6 + Math.floor(k / 3) * 0.7]}><boxGeometry args={[0.28, 0.06, 0.28]} /><meshStandardMaterial color="#1C2F4A" transparent opacity={glass} /></mesh>)}
          <mesh position={[-0.5, 0.58, -0.25]}><boxGeometry args={[0.5, 0.08, 0.5]} /><meshStandardMaterial color="#B3CEEF" emissive="#7FB4F2" emissiveIntensity={2.2 * alive} transparent opacity={glass} /></mesh>
          {alive > 0.02 && <Glow position={[-0.5, 0.75, -0.25]} size={1.8} color="#7FB4F2" opacity={0.9 * alive * glass} />}
          {/* the rim light on the glass edges */}
          <lineSegments position={[0, 0.65, 0]}><edgesGeometry args={[new THREE.BoxGeometry(3.2, 1.3, 2.7)]} /><lineBasicMaterial color="#FFFFFF" transparent opacity={0.7 * glass} /></lineSegments>
          <lineSegments position={SCR_C} rotation-x={SCR_TILT}><edgesGeometry args={[new THREE.BoxGeometry(2.9, 2.1, 0.34)]} /><lineBasicMaterial color="#FFFFFF" transparent opacity={0.7 * glass} /></lineSegments>
        </group>
      )}
    </group>
  );
};
// the screen's centre and normal in station-local coords (for the push and the tag)
const scrWorld = (() => {
  const o = new THREE.Object3D(); o.position.set(TX, 0, TZ); o.rotation.y = -0.28;
  const s = new THREE.Object3D(); s.position.set(...SCR_C); s.rotation.x = SCR_TILT; o.add(s); o.updateMatrixWorld(true);
  const c = new THREE.Vector3(0, 0, 0.18).applyMatrix4(s.matrixWorld);
  const n = new THREE.Vector3(0, 0, 1).transformDirection(s.matrixWorld);
  return { c: [c.x, c.y, c.z], n: [n.x, n.y, n.z] };
})();
// ── the desk ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
const woodTex = () => {
  const t = canvasTex("stc_wood", 512, 128, (c, w, h) => {
    c.fillStyle = "#2E3846"; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) { c.fillStyle = `rgba(${rnd(y) < 0.5 ? "10,16,26" : "120,135,155"},${0.03 + rnd(y + 3) * 0.04})`; c.fillRect(0, y, w, 4); }
    for (let k = 0; k < 14; k++) { c.strokeStyle = "rgba(10,16,26,0.18)"; c.lineWidth = 1; c.beginPath(); const y0 = rnd(k) * h; c.moveTo(0, y0); for (let x = 0; x < w; x += 8) c.lineTo(x, y0 + 4 * Math.sin(x / 40 + k)); c.stroke(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t;
};
const Desk = () => {
  const wd = useMemo(woodTex, []);
  const leather = useMemo(() => noiseTex("leather", "#14284A", 14, 9000), []);
  const brass = "#C9A86A";
  return (
    <group>
      <mesh position={[0, -0.3, -1.5]} castShadow receiveShadow><boxGeometry args={[19, 0.6, 9.5]} /><meshStandardMaterial map={wd} roughness={0.38} envMapIntensity={0.6} /></mesh>
      <mesh position={[0, -4.0, -1.6]} receiveShadow><boxGeometry args={[18.4, 6.8, 9.0]} /><meshStandardMaterial map={wd} color="#8C96A4" roughness={0.5} /></mesh>
      {/* drawer fronts with brass pulls along the front */}
      {[-6, 0, 6].map((x) => <group key={x}>
        <mesh position={[x, -1.8, 2.92]}><boxGeometry args={[5.4, 1.9, 0.12]} /><meshStandardMaterial map={wd} roughness={0.4} /></mesh>
        <mesh position={[x, -1.8, 3.02]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.08, 0.08, 1.1, 10]} /><meshStandardMaterial color={brass} metalness={0.9} roughness={0.25} /></mesh>
      </group>)}
      {/* the leather blotter with its corner pockets */}
      <mesh position={[-1.4, 0.012, -0.6]} rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[9.4, 5.8]} /><meshStandardMaterial map={leather} roughness={0.7} envMapIntensity={0.4} /></mesh>
      {[[-6.1, -0.6], [3.3, -0.6]].map(([x, z], i) => <mesh key={i} position={[x, 0.04, z]} castShadow receiveShadow><boxGeometry args={[0.5, 0.06, 5.9]} /><meshStandardMaterial color="#0C1C35" roughness={0.5} /></mesh>)}
      {/* a fountain pen beside the certificates */}
      <group position={[1.4, 0.13, 1.0]} rotation-y={0.5}>
        <mesh rotation-z={Math.PI / 2} castShadow><cylinderGeometry args={[0.1, 0.09, 1.9, 16]} /><meshPhysicalMaterial color="#0C1F3D" roughness={0.15} clearcoat={1} /></mesh>
        <mesh position={[0.55, 0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.104, 0.104, 0.1, 16]} /><meshStandardMaterial color={brass} metalness={0.9} roughness={0.2} /></mesh>
        <mesh position={[-1.08, 0, 0]} rotation-z={Math.PI / 2}><coneGeometry args={[0.08, 0.3, 12]} /><meshStandardMaterial color={brass} metalness={0.9} roughness={0.2} /></mesh>
      </group>
    </group>
  );
};
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  return (
    <group>
      {f > t.cut && <Sky zenith="#020F24" mid="#0A2E60" horizon="#3E78C2" glowAt={0.5} radius={300} />}
      <Room wallZ={-10} floorY={-7.4} wx0={-11.5} wx1={-5.5} wy0={2.4} wy1={10.5} />
      <Outside floorY={-7.4} wallZ={-10} />
      <Desk />
      <TableLamp position={[-7.4, 0, -8.0]} scale={0.72} />
      <Certificates f={f} t={t} />
      <Chalkboard f={f} t={t} />
      <Terminal f={f} t={t} />
    </group>
  );
};
// ── the camera (WORLD coords) ─────────────────────────────────────────────────────────────────────────────────────────────
const W = (p) => [p[0] + COMPANY_ORIGIN[0], p[1] + COMPANY_ORIGIN[1], p[2] + COMPANY_ORIGIN[2]];
const shots = () => {
  const t = T();
  const sc = scrWorld.c, sn = scrWorld.n;
  return [
    { a: t.cut, b: t.cut + 1, cut: true, pos: W([SEAL[0] + 0.05, 1.05, SEAL[2] + 0.42]), target: W(SEAL), fov: 40 },           // the macro on the seal
    { a: t.cut + 2, b: t.company + 8, pos: W([-2.2, 5.4, 6.9]), target: W([-3.0, 0.3, -1.1]), fov: 40 },                         // pull back as the fan opens
    { a: t.company + 8, b: t.played - 4, pos: W([-1.2, 6.0, 8.0]), target: W([-2.6, 0.6, -1.6]), fov: 40 },                      // drift right under the photo
    { a: t.played - 6, b: t.twelve + 8, pos: W([1.2, 7.4, 11.2]), target: W([BX, BY - 1.5, BZ]), fov: 40 },                        // crane up to the chalkboard
    { a: t.twelve + 8, b: t.until - 2, pos: W([1.6, 7.5, 7.9]), target: W([BX + 0.2, BY - 1.2, BZ]), fov: 40 },                   // a slow push on the tally
    { a: t.until - 4, b: t.ended - 2, pos: W([sc[0] + 1.6 + sn[0] * 10, sc[1] + 2.2 + sn[1] * 10, sc[2] + sn[2] * 10]), target: W([TX - 0.1, 1.2, TZ]), fov: 40 },   // down to the terminal
    { a: t.ended - 2, b: t.game, pos: W([sc[0] + 0.7 + sn[0] * 7.5, sc[1] + 1.0 + sn[1] * 7.5, sc[2] + sn[2] * 7.5]), target: W([sc[0], sc[1] - 0.5, sc[2]]), fov: 40 },
    ...(COMPANY_DEPART === "push"
      ? [{ a: t.game, b: t.gameEnd + 6, pos: W([sc[0] + sn[0] * 0.55, sc[1] + sn[1] * 0.55, sc[2] + sn[2] * 0.55]), target: W(sc), fov: 40 }]   // into the black screen
      : [])
  ];
};
// ── the annotations ───────────────────────────────────────────────────────────────────────────────────────────────────────
const Vignette = () => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
    background: "radial-gradient(120% 75% at 50% 42%, rgba(0,12,30,0) 55%, rgba(0,12,30,0.6) 100%), linear-gradient(180deg, rgba(0,12,30,0) 62%, rgba(0,12,30,0.6) 100%)" }} />
);
const Overlay = ({ f, P }) => {
  const t = T();
  const title = P(TITLE);
  const fan = P([FAN_PIVOT[0] + 1.2, 0.1, FAN_PIVOT[2] - 1.0]);
  const board = P([BX, BY + BH / 2 + 0.4, BZ]);
  const scr = P(scrWorld.c);
  const drawn = STROKES.reduce((n, _, k) => n + (f >= drawAt(t, k) + 2 ? 1 : 0), 0);
  return (
    <>
      {/* the vignette is global (Main.tsx) */}
      <Tag text="$500 a share" at={t.company} out={t.family - 4} x={1010} y={420} side="right" to={title.behind ? null : title} size={28} />
      <Inset src={staticFile("photos/selbees_shareholders.jpg")} credit="Photo: CBS News / 60 Minutes" at={t.family - 2} out={t.played - 6} x={110} y={300} w={860} h={484} pos="50% 40%" />
      <Tag text="25 members" at={t.friends} out={t.played - 6} x={110} y={820} to={fan.behind ? null : fan} size={28} />
      <Counter at={t.played} out={t.until - 2} x={540} y={Math.max(300, Math.min(520, board.y - 250))} from={drawn} value={drawn} unit="ROLL-DOWNS" size={110} countDur={1} />
      <Tag text="Game ended 2005" at={t.ended + 4} out={COMPANY_DEPART === "push" ? t.game + 6 : t.ended + 16} x={1010} y={Math.max(420, Math.min(620, scr.y - 330))} side="right" to={scr.behind ? null : scr} size={28} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("whooshsoft", t.cut + 16, 24, 0.45),                                     // the pull-back off the seal
    cueAt("ee_paper_paper_tear_01", t.cut + 8, 20, 0.18),                          // the certificates fan (paper)
    cueAt("pingshort", t.company, 10, 0.35),                                       // $500 a share
    cueAt("ee_whoosh_medium_whoosh_01", t.family, 14, 0.3),                                           // the photo
    cueAt("whooshlong", t.played - 2, 30, 0.45),                                   // the crane up to the board
    ...STROKES.map((_, k) => cueAt("ee_click_click_01", Math.round(drawAt(t, k)), 4, 0.22)),   // each chalk stroke
    cueAt("whooshsoft", t.until + 4, 24, 0.45),                                    // down to the terminal
    cueAt("data", t.until + 4, 18, 0.18),                                          // the board running inside the glass
    cueAt("sub", t.ended, 20, 0.5),                                                // the power dies
    ...(COMPANY_DEPART === "push" ? [cueAt("ee_whoosh_fast_small_whoosh_01", t.game + 8, 12, 0.5)] : [])   // the push into the black screen (a flight's whoosh is road's)
  ];
};
export const ST = { id: "company", origin: COMPANY_ORIGIN, from: T().cut + 1, to: T().gameEnd + 40, light: { shadowBox: 11, keyI: 0.85, fillI: 0.3, rimI: 0.9 }, shots, Scene, Overlay, sfx };
