// @ts-nocheck
// ★ V38 station COMPANY (builder B; rev 2 builder E): "He and his wife Marge formed a company with family and friends, and played 12
//   roll-downs, until Michigan ended the game." (883–1079)
//   · ARRIVAL — THE MATCHED CUT (Timur: "make sure that when they transition, they locate at the same point"): test pushes onto the
//     $1 bill's green Treasury seal; on the cut (883) the gold foil seal of a G.S. INVESTMENT STRATEGIES share certificate sits on
//     the SAME screen point at the SAME radius (xfer_seal.ts SEAL_SCREEN) and the push carries on at the same rate (PUSH_RATE),
//     easing to rest over 12 f before the pull-back (both sides are SOLVED, company_cam.ts). The engraved certificate (company_cert)
//     is the hero: the camera pulls back as seven certificates fan out on the blotter; $500 PER SHARE (CBS) tags its cartouche;
//     on "family and friends" the CBS photo of shareholders (credited) and 25 MEMBERS (CBS: 25 by spring 2005).
//   · "played 12 roll-downs": the camera cranes up to the chalkboard; twelve chalk strokes, the counter landing on 12 on "12".
//   · THE SECOND MATCHED CUT: the camera pushes into the chalk heading "WINFALL" and cuts (1024) onto the same word, same place,
//     same size, on the screen of a real counter lottery terminal in a convenience store (company_store) — "until Michigan …".
//   · "ended the game": the draw screen flickers to GAME ENDED and its backlight dies (GAME ENDED 2005, HL: May 2005).
//   · DEPARTURE: the camera rises off the dark terminal, out through the store window, across the lot, and swings in high behind
//     the sedan on the interstate as it drives past the store (xfer_company_road.ts; the store stands on the road's scrolling ground).
import React, { useMemo } from "react";
import * as THREE from "three";
import { ease, rnd, Sky, Glow, canvasTex } from "./kit";
import { Tag, Counter, Inset } from "./overlays";
import { wf, wEnd } from "./take";
import { cueAt } from "../bnx/SfxLayer";
import { aud } from "../bnx/aud";
import { BODY } from "./fonts3d";
import { Room, Outside, TableLamp, noiseTex } from "./st_test_props";
import { AO, Cast, KEY_OFFICE } from "./company_ao";
import { Wipe } from "./road_signs";
import { T as TT } from "./st_test";
import { SEAL_SCREEN, PUSH_RATE } from "./xfer_seal";
import { Certificates, SEAL_C, SEAL_R, onTop, PRICE_PX } from "./company_cert";
import { Store, storeToGround, groundToWorld, roadS, SCREEN, fitWord, DRAWER_AT } from "./company_store";
import { solveView, discPx, segPx, keysFrom, smoother, drift } from "./company_cam";
import { CUT2, storeShots, HEAD_SY, TALLY_HP, CUT_HP, PUSH_N } from "./xfer_company_road";

export const COMPANY_ORIGIN = [900, 0, 0];
const W = (p) => [p[0] + COMPANY_ORIGIN[0], p[1] + COMPANY_ORIGIN[1], p[2] + COMPANY_ORIGIN[2]];
export const T = () => {
  const cut = TT().out - 1;   // test's last frame; company shows from cut + 1
  return {
    cut, he: wf("he", 2), marge: wf("marge"), company: wf("company"), family: wf("family"), friends: wf("friends"), friendsEnd: wEnd("friends"),
    played: wf("played"), twelve: wf("12"), rolls: wf("roll-downs"), rollsEnd: wEnd("roll-downs"), until: wf("until"), michigan: wf("michigan", 2),
    ended: wf("ended"), game: wf("game", 2), gameEnd: wEnd("game", 2), cut2: CUT2
  };
};
// ── the chalkboard (wall) with its twelve strokes ─────────────────────────────────────────────────────────────────────────
const BX = 1.2, BY = 5.0, BZ = -9.7, BW = 6.8, BH = 4.4;   // rev 5: hung lower (7.8 → 5.0), just above the desk — the crane up to it turns the view 15° less
const SL_W = 2048, SL_H = 1325;
const HEAD = { x: 1024, y: 178, w: 640 };   // the chalk "WINFALL" (cap-height middle, width) on the slate canvas
const HEAD_C = [BX + (HEAD.x / SL_W - 0.5) * BW, BY + (0.5 - HEAD.y / SL_H) * BH, BZ + 0.061];
const HEAD_HALF = ((HEAD.w / SL_W) * BW) / 2;
const slateTex = () => canvasTex("c2_slate", SL_W, SL_H, (c, w, h) => {
  c.fillStyle = "#1A2631"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) { const x = rnd(i) * w, y = rnd(i + 9) * h, r = 80 + rnd(i + 3) * 240; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, "rgba(220,232,250,0.05)"); g.addColorStop(1, "rgba(220,232,250,0)"); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  c.strokeStyle = "rgba(220,232,250,0.045)"; c.lineWidth = 70; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(320 + k * 280, 820 + 120 * Math.sin(k), 240, 0.3, 2.4); c.stroke(); }   // old eraser swirls
  // the heading in chalk: WINFALL (fitted exactly like the terminal's title, so the matched cut lines up) and ROLL-DOWNS under it,
  // drawn on its own layer, its grain knocked out there, then laid on the slate
  const L = document.createElement("canvas"); L.width = w; L.height = h; const q = L.getContext("2d");
  q.fillStyle = "rgba(238,244,251,0.94)"; fitWord(q, "WINFALL", HEAD.x, HEAD.y, HEAD.w);
  q.font = `italic 700 64px ${BODY}`; q.textAlign = "center"; q.fillText("ROLL-DOWNS", HEAD.x, HEAD.y + 150);
  q.fillRect(HEAD.x - 330, HEAD.y + 176, 660, 7);
  q.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 26000; i++) { q.fillStyle = `rgba(0,0,0,${0.25 + rnd(i + 3) * 0.5})`; const x = HEAD.x - 360 + rnd(i * 3 + 1) * 720, y = HEAD.y - 110 + rnd(i * 5 + 2) * 300; q.fillRect(x, y, 2 + rnd(i) * 3, 2); }
  c.drawImage(L, 0, 0);
});
const chalkTex = () => canvasTex("stc_chalk", 32, 256, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  for (let i = 0; i < 1600; i++) { c.fillStyle = `rgba(240,246,252,${0.35 + rnd(i) * 0.65})`; c.fillRect(4 + rnd(i + 1) * (w - 8), rnd(i + 2) * h, 2, 2); }
});
const STROKES = (() => {
  const s = [];
  for (let g = 0; g < 3; g++) {
    const gx = -2.5 + g * 2.15, n = g < 2 ? 4 : 2;
    for (let j = 0; j < n; j++) { const x = gx + j * 0.36, w = 0.06 * (rnd(g * 7 + j) - 0.5); s.push([x, -1.35, x + w, 0.45]); }
    if (g < 2) s.push([gx - 0.28, -1.05, gx + 1.38, 0.2]);
  }
  return s;
})();
const drawAt = (t, k) => t.played - 8 + k * 1.8;      // the 12th lands on "12" (≈ 994)
// rev 7 (Timur: figures IN the scene, not on the screen): under the tally the chalk states it — "= 12", written on the word "12"
const twelveTex = () => canvasTex("r7_chalk12", 1024, 384, (c, w, h) => {
  const L = document.createElement("canvas"); L.width = w; L.height = h; const q = L.getContext("2d");
  q.fillStyle = "rgba(240,246,252,0.95)"; q.textAlign = "center"; q.textBaseline = "middle";
  q.font = `italic 800 300px ${BODY}`; q.fillText("= 12", w / 2, h / 2 + 10);
  q.fillRect(150, h - 46, w - 300, 14);                                                     // underlined twice
  q.fillRect(190, h - 20, w - 380, 10);
  q.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 20000; i++) { q.fillStyle = `rgba(0,0,0,${0.25 + rnd(i + 5) * 0.5})`; q.fillRect(rnd(i * 3 + 7) * w, rnd(i * 5 + 3) * h, 2 + rnd(i) * 3, 2); }   // chalk grain
  c.clearRect(0, 0, w, h); c.drawImage(L, 0, 0);
});
const TWELVE_AT = (t) => t.twelve - 1;
const Chalkboard = ({ f, t }) => {
  const st = useMemo(slateTex, []), ck = useMemo(chalkTex, []);
  const frame = "#5A6676";
  return (
    <group position={[BX, BY, BZ]}>
      <mesh receiveShadow><boxGeometry args={[BW, BH, 0.12]} /><meshStandardMaterial map={st} roughness={0.95} envMapIntensity={0.3} /></mesh>
      {[[0, BH / 2 + 0.2, BW + 0.8, 0.4], [0, -BH / 2 - 0.2, BW + 0.8, 0.4], [-BW / 2 - 0.2, 0, 0.4, BH], [BW / 2 + 0.2, 0, 0.4, BH]].map(([x, y, w, h], i) =>
        <mesh key={i} position={[x, y, 0.1]} castShadow><boxGeometry args={[w, h, 0.35]} /><meshStandardMaterial color={frame} roughness={0.6} /></mesh>)}
      <mesh position={[0, -BH / 2 - 0.45, 0.4]} castShadow receiveShadow><boxGeometry args={[BW * 0.9, 0.12, 0.7]} /><meshStandardMaterial color={frame} roughness={0.6} /></mesh>
      <mesh position={[1.8, -BH / 2 - 0.33, 0.45]} rotation-z={Math.PI / 2} rotation-y={0.3} castShadow><cylinderGeometry args={[0.06, 0.06, 0.8, 10]} /><meshStandardMaterial color="#EEF3FA" roughness={0.95} /></mesh>
      <group position={[-2.4, -BH / 2 - 0.22, 0.45]} rotation-y={-0.12}>
        <mesh castShadow><boxGeometry args={[1.3, 0.28, 0.5]} /><meshStandardMaterial color="#C9D3DF" roughness={0.8} /></mesh>
        <mesh position={[0, -0.12, 0]}><boxGeometry args={[1.3, 0.08, 0.5]} /><meshStandardMaterial color="#2E3B4C" roughness={0.95} /></mesh>
      </group>
      {/* rev 6 fake shadows: the board's drop shadow on the wall (down-right, away from the key), the tray's under it, the eraser and
          chalk on the tray, and the frame's inner corners darkened on the slate */}
      <AO p={[0.35, -0.35, -0.295]} w={BW + 1.5} d={BH + 1.5} n="z" o={0.5} soft={0.3} />
      <AO p={[0.25, -BH / 2 - 0.85, -0.29]} w={BW * 0.95} d={0.95} n="z" o={0.55} soft={0.6} />
      <AO p={[-2.3, -BH / 2 - 0.387, 0.5]} w={1.65} d={0.78} o={0.6} soft={0.55} />
      <AO p={[1.85, -BH / 2 - 0.387, 0.52]} w={1.05} d={0.28} o={0.5} soft={0.6} spin={0.3} />
      {[[0, BH / 2 - 0.14, BW, 0.34], [0, -BH / 2 + 0.14, BW, 0.34], [-BW / 2 + 0.14, 0, 0.34, BH], [BW / 2 - 0.14, 0, 0.34, BH]].map(([x, y, w, d], i) =>
        <AO key={"fi" + i} p={[x, y, 0.0625]} w={w} d={d} n="z" o={0.42} soft={0.8} />)}
      <Wipe tex={useMemo(twelveTex, [])} w={2.1} h={0.79} k={ease(f, TWELVE_AT(t), TWELVE_AT(t) + 11)} position={[0.15, -1.78, 0.074]} />
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
      {[-6, 0, 6].map((x) => <group key={x}>
        <mesh position={[x, -1.8, 2.92]}><boxGeometry args={[5.4, 1.9, 0.12]} /><meshStandardMaterial map={wd} roughness={0.4} /></mesh>
        <mesh position={[x, -1.8, 3.02]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.08, 0.08, 1.1, 10]} /><meshStandardMaterial color={brass} metalness={0.9} roughness={0.25} /></mesh>
      </group>)}
      <mesh position={[-1.4, 0.012, -0.6]} rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[9.4, 5.8]} /><meshStandardMaterial map={leather} roughness={0.7} envMapIntensity={0.4} /></mesh>
      {[[-6.1, -0.6], [3.3, -0.6]].map(([x, z], i) => <mesh key={i} position={[x, 0.04, z]} castShadow receiveShadow><boxGeometry args={[0.5, 0.06, 5.9]} /><meshStandardMaterial color="#0C1C35" roughness={0.5} /></mesh>)}
      {/* rev 6 fake shadows: the desk on the floor (contact + its long shadow away from the key), the pen, the lamp's foot */}
      <AO p={[0, -7.39, -1.6]} w={19.8} d={10.4} o={0.6} soft={0.22} />
      <Cast p={[0, -7.39, -1.6]} w={18.4} d={9.0} h={7.4} toward={KEY_OFFICE} o={0.28} />
      <AO p={[0, -7.39, -9.35]} w={60} d={1.4} o={0.45} soft={0.9} />
      <AO p={[1.42, 0.004, 0.98]} w={2.15} d={0.42} o={0.55} soft={0.6} spin={0.5} />
      <AO p={[-7.35, 0.004, -8.0]} w={2.0} d={2.0} o={0.62} soft={0.6} />
      <Cast p={[-7.4, 0.004, -8.0]} w={1.6} d={1.6} h={2.6} toward={KEY_OFFICE} o={0.25} />
      <AO p={[-2.25, 0.013, 0.35]} w={3.9} d={2.9} o={0.3} soft={0.45} />
      <group position={[1.4, 0.13, 1.0]} rotation-y={0.5}>
        <mesh rotation-z={Math.PI / 2} castShadow><cylinderGeometry args={[0.1, 0.09, 1.9, 16]} /><meshPhysicalMaterial color="#0C1F3D" roughness={0.15} clearcoat={1} /></mesh>
        <mesh position={[0.55, 0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.104, 0.104, 0.1, 16]} /><meshStandardMaterial color={brass} metalness={0.9} roughness={0.2} /></mesh>
        <mesh position={[-1.08, 0, 0]} rotation-z={Math.PI / 2}><coneGeometry args={[0.08, 0.3, 12]} /><meshStandardMaterial color={brass} metalness={0.9} roughness={0.2} /></mesh>
      </group>
    </group>
  );
};
// the store sits on the road's scrolling ground: drawn at gx − S(f) in the road's frame (company-local = world − origin)
const ROADGRP = [1200 - COMPANY_ORIGIN[0], 0 - COMPANY_ORIGIN[1], 0 - COMPANY_ORIGIN[2]];
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  const office = f < t.cut2;
  return (
    <group>
      {office && f > t.cut && <Sky zenith="#020F24" mid="#0A2E60" horizon="#3E78C2" glowAt={0.5} radius={300} />}
      {office && (
        <group>
          <Room wallZ={-10} floorY={-7.4} wx0={-11.5} wx1={-5.5} wy0={2.4} wy1={10.5} />
          <Outside floorY={-7.4} wallZ={-10} />
          <Desk />
          <TableLamp position={[-7.4, 0, -8.0]} scale={0.72} />
          <Certificates f={f} cut={t.cut} />
          <Chalkboard f={f} t={t} />
        </group>
      )}
      {!office && (
        <group position={ROADGRP} rotation-y={Math.PI / 2}>
          <group position={[-roadS(f), 0, 0]}><Store f={f} t={t} /></group>
        </group>
      )}
    </group>
  );
};
// ── the camera ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// the seal macro, solved: the seal's centre on SEAL_SCREEN, its tooth-tip radius growing by PUSH_RATE through the cut, then
// easing to rest over 12 f (log-rate × (1 − smootherstep)), seen along test's push direction
const SEAL_W = [0, -0.956, -0.292];   // 17° off vertical, like test's push axis (its seal ry ≈ 0.95 rx)
const DEC = 7;
// log-size after the cut: the rate starts at PUSH_RATE (test's rate on 882) and eases to 0 over DEC frames as (1 − x)²
const logSize = (base, rate, f0, f) => { let L = Math.log(base); for (let g = f0; g <= f; g++) { const x = Math.min(1, (g - f0) / DEC); L += Math.log(1 + rate) * (1 - x) * (1 - x); } return L; };
export const sealPose = (f) => {
  const t = T();
  const r = Math.exp(logSize(SEAL_SCREEN.r, PUSH_RATE, t.cut + 1, f));
  const C = W(SEAL_C);
  // centred like test measures it: the OUTLINE's centre (bbox of the projected sawtooth circle) on SEAL_SCREEN, rx = the radius
  let sx = SEAL_SCREEN.x, sy = SEAL_SCREEN.y, k = null;
  for (let it = 0; it < 4; it++) {
    k = solveView({ C, w: SEAL_W, sx, sy, size: r, fov: 40, measure: (q) => discPx(q, C, SEAL_R).rx });
    const d = discPx(k, C, SEAL_R);
    sx += SEAL_SCREEN.x - (d.bx ?? d.ex); sy += SEAL_SCREEN.y - (d.by ?? d.ey);
  }
  return k;
};
// the chalk push: the heading at (540, HEAD_SY), from TALLY_HP px half-width (the tally framing) to CUT_HP on the cut, its log-size
// on q(t) = 2t² − t³ (starts at rest, ends at the constant log-rate G that the screen side carries on and eases out)
const PUSH0 = CUT2 - PUSH_N;   // rev 5: 30 f from a closer start (was 22 f): half the rate through the cut
const HEAD_W = [0, -0.325, -1];   // rev 5: a little more from above (18°; it was 7°) — the crane from the desk tilts up less
const chalkPose = (f) => {
  const x = Math.min(1, Math.max(0, (f - PUSH0) / (CUT2 - PUSH0)));
  const L = Math.log(TALLY_HP) + Math.log(CUT_HP / TALLY_HP) * (2 * x * x - x * x * x);
  const C = W(HEAD_C);
  return solveView({ C, w: HEAD_W, sx: 540, sy: HEAD_SY, size: Math.exp(L), fov: 40, measure: (k) => segPx(k, C, [1, 0, 0], HEAD_HALF) });
};
export const TALLY = chalkPose(PUSH0);
const shots = () => {
  const t = T();
  const P1 = t.cut + DEC + 1;               // the seal push is at rest here; the pull-back starts
  const seal = keysFrom(t.cut + 1, P1, sealPose);
  // rev 5 (Timur, 2026-11-27: "slower … cinematic", "no point in moving the camera to something that isn't there"): ONE slow pull-back
  //   and rise off the seal to a frame holding BOTH subjects — the fanned certificates below, the chalk board above (890 → 962) —
  //   overlapped by ONE gentle push up onto the tally (946 → 987), which lands at rest as the push into the chalk word begins (30 f;
  //   it was 22). The old crane aimed through the empty air between the desk and the board.
  return [
    ...seal,
    { a: P1, b: 962, pos: W([-0.6, 8.6, 12.6]), target: W([-0.5, 2.2, -4.0]), fov: 40 },                         // pull back and up: the fanned certificates and the board above them
    { a: 946, b: PUSH0 - 1, pos: TALLY.pos.map((v, i) => v - drift(PUSH0)[i]), target: TALLY.target, fov: 40, zoom: false },   // … then a gentle push up onto the tally
    ...keysFrom(PUSH0 + 1, CUT2 - 1, chalkPose),                                                                       // push into the chalk WINFALL
    ...storeShots()                                                                                                    // the terminal, the register, out of the window (xfer_company_road.ts)
  ];
};
// ── the annotations ───────────────────────────────────────────────────────────────────────────────────────────────────────
const local = (wp) => [wp[0] - COMPANY_ORIGIN[0], wp[1] - COMPANY_ORIGIN[1], wp[2] - COMPANY_ORIGIN[2]];
const Overlay = ({ f, P }) => {
  const t = T();
  const price = P(onTop(PRICE_PX.x + 262, PRICE_PX.y));
  const board = P([BX, BY + BH / 2 + 0.4, BZ]);
  const scr = P(local(groundToWorld(storeToGround(SCREEN.c), f)));
  const drawn = STROKES.reduce((n, _, k) => n + (f >= drawAt(t, k) + 2 ? 1 : 0), 0);
  const onScr = (p) => (p.behind ? null : { x: Math.max(-40, Math.min(1120, p.x)), y: Math.max(-40, Math.min(1960, p.y)) });   // a point that leaves the frame pulls the leader out with it
  return (
    <>
      <Tag text="$500 per share" at={t.cut + 6} out={t.company + 8} x={1010} y={232} side="right" to={f < t.cut2 ? onScr(price) : null} size={30} />
      <Inset src={aud("photos/selbees_shareholders.jpg")} credit="Photo: CBS News / 60 Minutes" at={t.family - 16} out={t.friendsEnd - 6} x={110} y={300} w={860} h={484} pos="50% 40%" />
      <Tag text="25 members" at={t.family - 16} out={t.friendsEnd + 2} x={110} y={812} to={null} size={30} />
      <Counter at={t.played + 2} out={CUT2 - 12} x={540} y={300} from={drawn} value={drawn} unit="ROLL-DOWNS" size={110} countDur={1} />
      <Tag text="Game ended 2005" at={CUT2 + 1} out={CUT2 + 49} x={1010} y={470} side="right" to={f >= CUT2 ? onScr(scr) : null} size={30} />
    </>
  );
};
// rev 6 (Timur: sound "for the car scene and for the chalk on the board"): each cue on a visible action, quiet
const sfx = () => {
  const t = T();
  return [
    cueAt("ee_paper_paper_tear_01", t.cut + 10, 20, 0.18),                         // the certificates fan out (paper)
    cueAt("pingshort", t.cut + 8, 10, 0.25),                                       // $500 PER SHARE
    cueAt("whooshsoft", t.cut + 24, 24, 0.3),                                      // the slow pull-back off the seal
    cueAt("whooshsoft", 950, 24, 0.25),                                            // the push up onto the board
    cueAt("ov_chalk", Math.round(drawAt(t, 0)), Math.round(TWELVE_AT(t) + 11 - drawAt(t, 0)) + 4, 0.35),   // the twelve chalk strokes, then "= 12" chalked on the word
    cueAt("ee_whoosh_fast_small_whoosh_01", CUT2 - 6, 12, 0.3),                   // the push into the chalk word → the screen
    cueAt("ov_printer", CUT2 + 2, 26, 0.3),                                        // the terminal prints the WinFall slip
    cueAt("sub", t.ended, 20, 0.4),                                                // the game ends, the screen dies
    cueAt("whooshsoft", 1058, 30, 0.22),                                           // the slow pull-back to the register
    cueAt("ov_drawer", DRAWER_AT, 20, 0.35)                                        // NO SALE: the cash drawer slides open, the bell
  ];
};
export const ST = { id: "company", origin: COMPANY_ORIGIN, from: T().cut + 1, to: 1220, light: { shadowBox: 11, keyI: 0.85, fillI: 0.3, rimI: 0.9 }, shots, Scene, Overlay, sfx };
