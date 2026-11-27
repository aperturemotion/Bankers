// @ts-nocheck
// ★ V38 station STORE (origin [0,0,−58]): "In 2003, retired store owner Jerry Selbee read a brochure for a new Michigan game, Winfall.
//   He found the loophole in 3 minutes."
//   The camera flies on down the hook's main street (over the standing ticket) to the gap on the right at world z ≈ −55.6, where
//   the CORNER STORE stands: a modest one-storey brick front, a lit display window with the counter right behind it, a glass door,
//   a blue awning, gooseneck lamps over the sign, an ICE chest. "2003" lands; HIS OLD STORE tags the sign; the CBS photo of Jerry
//   and Marge comes up on "Jerry Selbee". On "read a brochure" the camera pushes through the window to the counter, where a WINFALL
//   leaflet lies by the lottery terminal; it unfolds on "new Michigan game" (cover → HOW TO PLAY | PRIZES | THE ROLL-DOWN). On
//   "loophole" a light-blue highlight runs along the roll-down rule; a 3:00 timer rolls in on "3 minutes"; the camera then pushes
//   INTO the rule's diagram (the jackpot column) — the rolldown station cuts to the matching close-up of the real machine.
//   Local frame: the street face of the shop is the plane x = FX (it faces −x, the road); the shop spans z Z0 … Z1.
import { COUNTERS } from "./label_style";
import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { canvasTex, std, PAL, ease, easeOut, rnd, clamp01, Glow, Sky } from "./kit";
import { Tag, Inset } from "./overlays";
import { wf, wEnd } from "./take";
import { cueAt } from "../bnx/SfxLayer";
import { BODY, FIGURE } from "./fonts3d";
import { Brochure, BrochureStack, broPt, pxToDesign, RULE } from "./st_store_brochure";
import { aud } from "../bnx/aud";
import { Town, addProps, addGoods } from "./town_parts";
import { HOOK_SHIFT } from "./shift";
import { ShadeLayer, keyDir } from "./fakeshade";

const O = [0, 0, -58];
const W = (p) => [p[0] + O[0], p[1] + O[1], p[2] + O[2]];
export const T = () => ({
  in2003: wf("In", 1), y2003: wf("2003"), store: wf("store"), jerry: wf("Jerry", 1), read: wf("read"), brochure: wf("brochure"),
  newG: wf("new"), michigan: wf("Michigan", 1), winfall: wf("Winfall"), he: wf("He", 1), loophole: wf("loophole"), loopEnd: wEnd("loophole"),
  three: wf("3 minutes"), threeEnd: wEnd("3 minutes"), when: wf("When", 1)
});
// ── the shop's frame ─────────────────────────────────────────────────────────────────────────────────────────────────────
const FX = 6.7, Z0 = -1.45, Z1 = 6.25, WALL = 0.3, SIDE = 0.16, TOPH = 5.0, CEIL = 3.3, BACK = 12.0;
const WIN = { z0: 0.75, z1: 5.75, y0: 0.72, y1: 2.88 }, DOOR = { z0: -0.95, z1: 0.25, y1: 2.78 };
const COUNTER = { x0: 8.4, x1: 9.1, z0: 0.55, z1: 3.95, top: 1.0 };
const BP = [8.78, COUNTER.top + 0.03 + 0.0016, 2.2];   // the open brochure on the counter (page top toward the back of the shop)
// ── textures ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const brickImg = () => canvasTex("st_brick", 512, 512, (c, w, h) => {
  c.fillStyle = "#2b2a2f"; c.fillRect(0, 0, w, h);
  const bh = 16, bw = 48;
  for (let r = 0; r < h / bh; r++) for (let k = -1; k < w / bw + 1; k++) {
    const x = k * bw + (r % 2) * bw / 2, y = r * bh, i = r * 40 + k;
    const v = rnd(i), l = 30 + v * 12;
    c.fillStyle = `hsl(${12 + rnd(i + 5) * 10}, ${22 + rnd(i + 2) * 14}%, ${l}%)`;
    c.fillRect(x + 1.5, y + 1.5, bw - 3, bh - 3);
    c.fillStyle = `rgba(255,255,255,${0.04 + rnd(i + 9) * 0.05})`; c.fillRect(x + 1.5, y + 1.5, bw - 3, 2);
    c.fillStyle = "rgba(0,0,0,0.12)"; c.fillRect(x + 1.5, y + bh - 4, bw - 3, 2.5);
  }
  for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(0,0,0,${rnd(i + 17) * 0.12})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
});
const useBrick = (w, h) => useMemo(() => {
  const t = brickImg().clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 1.6, h / 1.6); t.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ map: t, color: "#B4B8C8", roughness: 0.88, metalness: 0 });
}, [w, h]);
const signTex = () => canvasTex("st_sign", 1400, 200, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#0E3B73"); g.addColorStop(1, "#082A55"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = "rgba(179,206,239,0.75)"; c.lineWidth = 6; c.strokeRect(14, 14, w - 28, h - 28);
  c.fillStyle = "#F4F8FD"; c.font = `800 118px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle"; c.letterSpacing = "10px";
  c.fillText("CORNER STORE", w / 2, h / 2 + 6);
});
const posterTex = () => canvasTex("st_poster", 300, 400, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#08305E"); g.addColorStop(1, "#005DC8"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = "#FFFFFF"; c.beginPath(); c.roundRect(20, 20, 110, 46, 23); c.fill();
  c.fillStyle = "#005DC8"; c.font = `800 30px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("NEW!", 75, 44);
  c.fillStyle = "#FFFFFF"; c.font = `130px ${FIGURE}`; c.textBaseline = "alphabetic"; c.fillText("WIN", w / 2, 205); c.fillStyle = "#B3CEEF"; c.fillText("FALL", w / 2, 330);
  c.fillStyle = "#FFFFFF"; c.font = `700 24px ${BODY}`; c.fillText("PLAY IT HERE", w / 2, 378);
});
const lottoSignTex = () => canvasTex("st_lotto", 512, 128, (c, w, h) => {
  c.fillStyle = "#0A2A52"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#EAF3FF"; c.font = `800 84px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("LOTTERY", w / 2, h / 2 + 4);
});
const openTex = () => canvasTex("st_open", 256, 96, (c, w, h) => {
  c.fillStyle = "#000"; c.fillRect(0, 0, w, h);
  c.strokeStyle = "#FFB36B"; c.lineWidth = 5; c.beginPath(); c.roundRect(8, 8, w - 16, h - 16, 30); c.stroke();
  c.fillStyle = "#FFD6A0"; c.font = `800 60px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("OPEN", w / 2, h / 2 + 3);
});
const iceTex = () => canvasTex("st_ice", 256, 160, (c, w, h) => {
  c.fillStyle = "#EEF3F9"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#005DC8"; c.font = `110px ${FIGURE}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("ICE", w / 2, h / 2 + 6);
});
const tileTex = () => canvasTex("st_tile", 256, 256, (c, w, h) => {
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? "#8E9AAD" : "#4C5A70"; c.fillRect(i * 32, j * 32, 32, 32); }
  for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(0,0,0,${rnd(i) * 0.06})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
});
const termTex = () => canvasTex("st_term", 400, 260, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#0E4A92"); g.addColorStop(1, "#06264F"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = "#FFFFFF"; c.font = `92px ${FIGURE}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("WINFALL", w / 2, 100);
  for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? "#7FB4F2" : "#EAF3FF"; c.beginPath(); c.arc(70 + k * 52, 190, 20, 0, 7); c.fill(); }
});
const awningTex = () => canvasTex("st_awning", 512, 64, (c, w, h) => {
  for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? "#3D6EA8" : "#0B2F5E"; c.fillRect(i * 32, 0, 32, h); }
  c.fillStyle = "rgba(0,0,0,0.25)"; for (let i = 0; i < 16; i++) c.fillRect(i * 32, 0, 2, h);
});
// rev 8e (Timur, 280 f: the blue sign "glitching"): seen at a steep angle down the street, its lettering sparkled frame to frame
//   (SwiftShader's anisotropic sampling of a small non-power-of-two canvas). Now 512² with plain trilinear filtering.
const bladeTex = () => { const t = canvasTex("st_blade2", 512, 512, (c, w, h) => {
  const k = w / 400; c.scale(k, k); w = 400; h = 400;
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#0E3B73"); g.addColorStop(1, "#082A55"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = "rgba(179,206,239,0.8)"; c.lineWidth = 8; c.strokeRect(16, 16, w - 32, h - 32);
  c.fillStyle = "#F4F8FD"; c.textAlign = "center"; c.textBaseline = "middle";
  c.font = `110px ${FIGURE}`; c.fillText("CORNER", w / 2, 140); c.fillText("STORE", w / 2, 262);
  c.fillStyle = "#7FB4F2"; c.fillRect(70, 330, w - 140, 6);
}); t.anisotropy = 1; t.needsUpdate = true; return t; };
// rev 2: the corner store's own signage, shared with the rules station's view of the same store (st_rules_street.tsx)
export { signTex as storeSignTex, awningTex as storeAwningTex, bladeTex as storeBladeTex, openTex as storeOpenTex };
// ── small builders ───────────────────────────────────────────────────────────────────────────────────────────────────────
const Box = ({ p, s, m, cast = true, recv = true, ...r }) => (
  <mesh position={p} castShadow={cast} receiveShadow={recv} material={m} {...r}><boxGeometry args={s} /></mesh>
);
// rev 5: the laminate repeats at its real size along the counter (u across the 0.84 m top, v along its 3.5 m)
const lamRep = (t0) => { const t = t0.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 4.2); t.needsUpdate = true; return t; };
const M = {
  frame: std("#2A3240", 0.35, 0.75), steel: std("#8FA9C8", 0.3, 0.8), dark: std("#151C27", 0.6, 0.2), lintel: std("#1E2733", 0.5, 0.6),
  stone: std("#8D97A6", 0.75, 0.05), wallIn: std("#3E4E66", 0.85, 0, { envMapIntensity: 0.25 }), ceil: std("#2E3A4D", 0.9, 0, { envMapIntensity: 0.2 }),
  lam: std("#34465F", 0.45, 0.1, { envMapIntensity: 0.4 }), top: new THREE.MeshStandardMaterial({ map: lamRep(canvasTex("st_lamtop", 512, 512, (c, w, h) => { c.fillStyle = "#46546A"; c.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const g = rnd(i) > 0.5 ? 255 : 0; c.fillStyle = `rgba(${g},${g},${g},${0.03 + rnd(i + 1) * 0.05})`; c.fillRect(rnd(i + 2) * w, rnd(i + 3) * h, 2, 2); } })), color: "#C4D2E6", roughness: 0.36, metalness: 0.05, envMapIntensity: 0.45 }), shelf: std("#6F7E93", 0.5, 0.3, { envMapIntensity: 0.4 }),
  plastic: std("#1F2733", 0.45, 0.1), keys: std("#7A8798", 0.5, 0.2)
};
const glassMat = new THREE.MeshPhysicalMaterial({ color: "#A9C8EE", roughness: 0.04, metalness: 0, transparent: true, opacity: 0.14, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide });
// ── rev 2: the store's own print (register screens, the receipt, the ticket case header, the cooler header) ─────────────
const regScreenTex = () => canvasTex("st_regscreen", 512, 224, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#0E3E5E"); g.addColorStop(1, "#0A2C46"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = "#9FE6F2"; c.textAlign = "left"; c.textBaseline = "alphabetic";
  c.font = `700 34px ${BODY}`; c.fillText("CORNER STORE", 22, 46);
  c.font = `600 26px ${BODY}`; c.fillText("REGISTER 1", 22, 86); c.fillText("LOTTERY · GROCERY", 22, 122);
  c.fillStyle = "rgba(159,230,242,0.35)"; c.fillRect(22, 140, w - 44, 3);
  c.fillStyle = "#9FE6F2"; c.font = `800 40px ${BODY}`; c.fillText("THANK YOU", 22, 196);
});
const poleTex = () => canvasTex("st_pole", 512, 128, (c, w, h) => {
  c.fillStyle = "#04140F"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#5CF2B0"; c.textAlign = "center"; c.font = `600 44px "Courier New", monospace`; c.fillText("WELCOME TO", w / 2, 52); c.fillText("CORNER STORE", w / 2, 106);
});
const receiptTex = () => canvasTex("st_receipt", 256, 640, (c, w, h) => {
  c.fillStyle = "#F7F6F1"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#2A2E36"; c.textAlign = "center"; c.font = `700 22px "Courier New", monospace`;
  ["CORNER STORE", "EVART, MICHIGAN"].forEach((t, k) => c.fillText(t, w / 2, 40 + k * 28));
  c.font = `500 18px "Courier New", monospace`; c.fillText("2003", w / 2, 122);
  c.textAlign = "left"; ["COFFEE", "NEWSPAPER", "BREAD", "MILK", "WINFALL PLAY SLIP"].forEach((t, k) => c.fillText(t, 20, 170 + k * 28));
  c.textAlign = "center"; c.fillText("- - - - - - - - - - -", w / 2, 320); c.font = `700 20px "Courier New", monospace`; c.fillText("THANK YOU", w / 2, 356); c.font = `500 16px "Courier New", monospace`; c.fillText("COME AGAIN", w / 2, 384);
});
const caseHeadTex = () => canvasTex("st_casehead", 1024, 96, (c, w, h) => {
  c.fillStyle = "#0B3F7A"; c.fillRect(0, 0, w, h); c.fillStyle = "#4D8ED9"; c.fillRect(0, h - 10, w, 10);
  c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `800 50px ${BODY}`; c.fillText("INSTANT TICKETS", w * 0.36, h / 2 - 2);
  c.font = `600 26px ${BODY}`; c.fillText("PLAY RESPONSIBLY", w * 0.8, h / 2 - 2);
});
const coolerHeadTex = () => canvasTex("st_coolhead", 1024, 128, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#1F5FB4"); g.addColorStop(1, "#0E3B73"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `400 84px ${FIGURE}`; c.fillText("COLD DRINKS", w / 2, h / 2 + 4);
});
const bayTex = (key, text) => canvasTex("st_bay_" + key, 512, 96, (c, w, h) => {
  c.fillStyle = "#F4F6F8"; c.fillRect(0, 0, w, h); c.fillStyle = "#1F5FB4"; c.fillRect(0, 0, w, 12);
  c.fillStyle = "#123E73"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `800 46px ${BODY}`; c.fillText(text, w / 2, h / 2 + 6);
});
const Lamp = ({ z, on = 1 }) => (
  <group position={[FX - 0.08, 4.6, z]}>
    <mesh position={[-0.22, 0.12, 0]} rotation-z={0.9} material={M.frame}><cylinderGeometry args={[0.018, 0.018, 0.5, 8]} /></mesh>
    <mesh position={[-0.42, 0.24, 0]} rotation-z={-0.5} material={M.frame}><coneGeometry args={[0.09, 0.14, 16, 1, true]} /></mesh>
    <mesh position={[-0.40, 0.19, 0]}><sphereGeometry args={[0.04, 10, 8]} /><meshBasicMaterial color="#FFE6BE" toneMapped={false} /></mesh>
    <Glow position={[-0.36, 0.1, 0]} size={0.9} color="#FFD49A" opacity={0.2 + 0.45 * on} />
  </group>
);
// ★ rev 7 (Timur: "instead of on-screen text … add them somewhere within the scene"): "2003" is the store's own vinyl banner for the new
//   game, strung across the brick band over the sign — WINFALL · NEW FOR 2003 · PLAY HERE (FACTCHECK: Winfall was a brand-new
//   Michigan game in 2003) — lit by the goosenecks, which come up as the voice says "In 2003" and the glide brings the store out of the fog
const BANNER = { z0: Z0 + 0.55, z1: Z1 - 0.55, y0: 4.12, y1: 4.54 };
const bannerTex = () => canvasTex("st_banner2003b", 2048, 132, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#F4F7FC"); g.addColorStop(1, "#DCE6F3"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = "#0B3F7A"; c.fillRect(0, 0, w, 9); c.fillRect(0, h - 9, w, 9);
  c.textBaseline = "middle"; c.textAlign = "center";
  // the year sits mid-banner, clear of the blade sign that hangs in front of its near end (screen right)
  c.fillStyle = "#005DC8"; c.font = `400 100px ${FIGURE}`; c.fillText("WINFALL", 380, h / 2 + 4);
  c.fillStyle = "#0B3F7A"; c.font = `800 52px ${BODY}`; c.fillText("NEW FOR", 860, h / 2 + 2);
  c.fillStyle = "#005DC8"; c.font = `400 118px ${FIGURE}`; c.fillText("2003", 1170, h / 2 + 6);
  c.fillStyle = "#0B3F7A"; c.font = `800 44px ${BODY}`; c.fillText("PLAY HERE", 1640, h / 2 + 2);
  c.fillStyle = "#4D8ED9"; for (const x of [640, 1400]) { c.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 11 : 26, a = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(x + r * Math.cos(a), h / 2 + r * Math.sin(a)); } c.fill(); }
  c.fillStyle = "#8D97A6"; for (const x of [22, w - 22]) for (const y of [22, h - 22]) { c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); c.fillStyle = "#3A4656"; c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); c.fillStyle = "#8D97A6"; }   // the grommets
});
const Banner = ({ on }) => {
  const tex = useMemo(bannerTex, []);
  const L = BANNER.z1 - BANNER.z0, H = BANNER.y1 - BANNER.y0, zc = (BANNER.z0 + BANNER.z1) / 2, yc = (BANNER.y0 + BANNER.y1) / 2;
  return (
    <group position={[FX - 0.105, yc, zc]} rotation-y={-Math.PI / 2}>
      <mesh><planeGeometry args={[L, H, 24, 1]} /><meshStandardMaterial map={tex} roughness={0.6} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.1 + 0.42 * on} side={THREE.DoubleSide} /></mesh>
      {[-1, 1].map((sd) => <mesh key={sd} position={[sd * (L / 2 + 0.03), 0, -0.02]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.006, 0.006, H * 0.9, 5]} /><meshStandardMaterial color="#C9D3DE" roughness={0.5} /></mesh>)}
    </group>
  );
};
// ★ rev 7: "3 MINUTES" is a digital kitchen timer standing on the counter just past the leaflet's top edge, its display tilted up to the
//   lens in the lean-in shot (now framed a little wider, so the timer, the rule and the diagram share it); it runs from "He found …", its
//   seconds roll up to 3:00 on "3 minutes", it blinks 3:00, and the push into the diagram starts on the word (same end pose)
const timerTex = (sec, dim) => canvasTex(`st_timer_${sec}_${dim ? 1 : 0}`, 256, 128, (c, w, h) => {
  c.fillStyle = "#BFD6EE"; c.fillRect(0, 0, w, h);
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(255,255,255,0.25)"); g.addColorStop(1, "rgba(0,40,90,0.12)"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.textBaseline = "middle"; c.textAlign = "center";
  c.fillStyle = "rgba(11,37,71,0.08)"; c.font = `400 104px ${FIGURE}`; c.fillText("8:88", w / 2, h / 2 + 6);   // the unlit LCD segments
  if (!dim) { c.fillStyle = "#0B2547"; c.fillText(`${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`, w / 2, h / 2 + 6); }
  c.font = `700 15px ${BODY}`; c.fillStyle = "#0B2547"; c.textAlign = "left"; c.fillText("MIN", 14, 18); c.textAlign = "right"; c.fillText("SEC", w - 14, 18);
});
const TIMER_P = [8.985, COUNTER.top + 0.03, 2.33];
const KitchenTimer = ({ f, t }) => {
  const run = clamp01((f - (t.he - 2)) / (t.three - (t.he - 2)));
  const sec = f < t.he - 2 ? 0 : Math.min(180, Math.round(180 * run));   // one second a frame-ish: 0:00 at "He", 3:00 on "3 minutes"
  const blink = f > t.three + 2 && Math.floor((f - t.three) / 8) % 2 === 1;
  const tex = timerTex(sec, blink);
  return (
    <group position={TIMER_P} rotation-y={-Math.PI / 2}>
      {/* a white body leaning far back on its fold-out stand, so its display looks up at the camera over the counter */}
      <group rotation-x={-1.1} position={[0, 0.028, 0]}>
        <mesh><boxGeometry args={[0.078, 0.078, 0.022]} /><meshStandardMaterial color="#EEF2F7" roughness={0.35} /></mesh>
        <mesh position={[0, 0.012, 0.0115]}><planeGeometry args={[0.062, 0.031]} /><meshStandardMaterial map={tex} roughness={0.25} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.25} /></mesh>
        {[-0.022, 0, 0.022].map((x, i) => <mesh key={i} position={[x, -0.021, 0.0125]}><boxGeometry args={[0.016, 0.01, 0.004]} /><meshStandardMaterial color={i === 2 ? "#1F5FB4" : "#9AA6B4"} roughness={0.4} /></mesh>)}
      </group>
      <mesh position={[0, 0.014, -0.028]} rotation-x={0.9}><boxGeometry args={[0.05, 0.003, 0.03]} /><meshStandardMaterial color="#C9D3DE" roughness={0.4} metalness={0.3} /></mesh>
    </group>
  );
};
// ── the merged construction of the shop (town kit): facade brick/stone/steel, the interior fittings, the goods ───────────
const SHELF = { x0: BACK - 0.38, z0: -1.0, z1: 3.75, ys: [0.52, 1.16, 1.58, 2.0, 2.42] };
const COOL = { x0: BACK - 0.55, z0: 3.95, z1: 6.08 };
const GON = { x0: 9.55, x1: 10.95, z: 5.05 };
const buildShop = (m) => {
  const W_ = Z1 - Z0, zc = (Z0 + Z1) / 2, fx = FX + WALL / 2;
  const BR = "#C9C6CE", MT = { metric: true, uo: [0.37, 0.21] };
  // ── the street face: brick piers, the knee wall under the display window, the sign band and the top band ──
  m.box("brick0", [fx, SIDE + (TOPH - SIDE) / 2, Z1 - 0.25], [WALL, TOPH - SIDE, 0.5], BR, MT);
  m.box("brick0", [fx, SIDE + (TOPH - SIDE) / 2, (DOOR.z1 + WIN.z0) / 2], [WALL, TOPH - SIDE, WIN.z0 - DOOR.z1], BR, MT);
  m.box("brick0", [fx, SIDE + (TOPH - SIDE) / 2, (Z0 + DOOR.z0) / 2], [WALL, TOPH - SIDE, DOOR.z0 - Z0], BR, MT);
  m.box("brick0", [fx, (SIDE + WIN.y0) / 2, (WIN.z0 + WIN.z1) / 2], [WALL, WIN.y0 - SIDE, WIN.z1 - WIN.z0], BR, MT);
  m.box("brick0", [fx, 3.55, zc], [WALL, 1.3, W_], BR, MT);
  m.box("brick0", [fx, 4.55, zc], [WALL, 0.9, W_], BR, MT);
  // pilasters proud of the piers, their stone bases and capitals
  for (const z of [Z0 + 0.12, (DOOR.z1 + WIN.z0) / 2, Z1 - 0.12]) {
    m.box("brick0", [FX - 0.04, SIDE + 2.4, z], [0.08, 4.5, 0.34], BR, MT);
    m.box("trim", [FX - 0.06, SIDE + 0.2, z], [0.14, 0.4, 0.4], "#8D97A6");
    m.box("trim", [FX - 0.07, 2.92, z], [0.16, 0.12, 0.42], "#8D97A6");
  }
  // steel lintel with its rivets, stone sill, the cornice: soldier course, dentils, a cap, the coping
  m.box("metal", [FX - 0.02, 2.98, zc], [0.12, 0.2, W_ - 0.2], "#1E2733");
  for (let k = 0; k < 24; k++) m.cyl("metal", [FX - 0.085, 2.98, Z0 + 0.25 + k * (W_ - 0.5) / 23], 0.012, 0.012, "#3A4656", { r: [0, 0, Math.PI / 2], seg: 6 });
  m.box("trim", [FX - 0.06, WIN.y0 - 0.03, (WIN.z0 + WIN.z1) / 2], [0.2, 0.07, WIN.z1 - WIN.z0 + 0.2], "#8D97A6");
  m.box("trim", [FX - 0.06, 4.98, zc], [0.14, 0.12, W_], "#8D97A6");
  m.box("metal", [FX - 0.12, 5.1, zc], [0.36, 0.14, W_ + 0.1], "#1E2733");
  m.box("trim", [FX - 0.03, 4.7, zc], [0.06, 0.08, W_], "#8D97A6");
  for (let i = 0; i < 30; i++) m.box("trim", [FX - 0.05, 4.86, Z0 + 0.15 + i * (W_ - 0.3) / 29], [0.08, 0.08, 0.1], "#8D97A6");
  // the roof: membrane, a condenser, a vent stack, the parapet coping
  m.box("roof", [(FX + BACK) / 2 + 0.1, TOPH + 0.13, zc], [BACK - FX - 0.4, 0.04, W_ - 0.4], "#FFFFFF", { metric: true });
  m.box("metal", [10.6, TOPH + 0.55, 1.2], [1.1, 0.8, 0.8], "#A9B3C0"); m.cyl("metal", [10.6, TOPH + 0.96, 1.2], 0.32, 0.04, "#2A3240", { seg: 16 });
  m.cyl("metal", [9.4, TOPH + 0.45, 4.8], 0.07, 0.65, "#5E6876", { seg: 8 });
  // a downpipe off the cornice
  m.box("metal", [FX - 0.3, 5.0, Z0 + 0.32], [0.2, 0.18, 0.16], "#3C4656"); m.box("metal", [FX - 0.3, 2.6, Z0 + 0.32], [0.08, 4.8, 0.08], "#3C4656"); m.box("metal", [FX - 0.4, 0.22, Z0 + 0.32], [0.24, 0.08, 0.08], "#3C4656");
  // the sign's steel frame, the window and door frames, the push bar
  m.box("metal", [FX - 0.06, 3.62, zc + 0.15], [0.08, 0.9, 6.4], "#2A3240");
  m.box("metal", [FX + 0.06, (WIN.y0 + WIN.y1) / 2, WIN.z0 + 0.04], [0.1, WIN.y1 - WIN.y0, 0.08], "#2A3240");
  m.box("metal", [FX + 0.06, (WIN.y0 + WIN.y1) / 2, WIN.z1 - 0.04], [0.1, WIN.y1 - WIN.y0, 0.08], "#2A3240");
  m.box("metal", [FX + 0.06, WIN.y1 - 0.04, (WIN.z0 + WIN.z1) / 2], [0.1, 0.08, WIN.z1 - WIN.z0], "#2A3240");
  m.box("metal", [FX + 0.06, WIN.y0 + 0.04, (WIN.z0 + WIN.z1) / 2], [0.1, 0.08, WIN.z1 - WIN.z0], "#2A3240");
  m.box("metal", [FX + 0.06, 2.42, (WIN.z0 + WIN.z1) / 2], [0.08, 0.06, WIN.z1 - WIN.z0], "#2A3240");
  m.box("metal", [FX + 0.06, SIDE + (DOOR.y1 - SIDE) / 2, DOOR.z0 + 0.05], [0.12, DOOR.y1 - SIDE, 0.1], "#2A3240");
  m.box("metal", [FX + 0.06, SIDE + (DOOR.y1 - SIDE) / 2, DOOR.z1 - 0.05], [0.12, DOOR.y1 - SIDE, 0.1], "#2A3240");
  m.box("metal", [FX + 0.06, DOOR.y1 - 0.05, (DOOR.z0 + DOOR.z1) / 2], [0.12, 0.1, DOOR.z1 - DOOR.z0], "#2A3240");
  m.box("metal", [FX + 0.06, SIDE + 0.12, (DOOR.z0 + DOOR.z1) / 2], [0.12, 0.24, DOOR.z1 - DOOR.z0], "#2A3240");
  m.box("metal", [FX - 0.04, 1.08, (DOOR.z0 + DOOR.z1) / 2], [0.05, 0.05, 0.9], "#8FA9C8");
  for (const z of [-0.85, -0.05]) m.box("metal", [FX - 0.02, 1.08, z], [0.08, 0.04, 0.04], "#8FA9C8");
  m.box("metal", [FX - 0.01, 0.4, (DOOR.z0 + DOOR.z1) / 2], [0.03, 0.4, DOOR.z1 - DOOR.z0 - 0.2], "#8FA9C8");   // the kick plate
  m.box("trim", [FX - 0.22, SIDE + 0.03, (DOOR.z0 + DOOR.z1) / 2], [0.44, 0.06, DOOR.z1 - DOOR.z0 + 0.2], "#8D97A6");  // the step
  // the ICE chest by the door: body, lid, hinges, a hasp, the vent grille
  m.box("trim", [FX - 0.55, SIDE + 0.55, Z0 - 0.32], [0.78, 1.1, 0.9], "#E8EEF5");
  m.box("metal", [FX - 0.55, SIDE + 1.12, Z0 - 0.32], [0.82, 0.06, 0.94], "#8FA9C8");
  for (const z of [-0.6, -0.05]) m.box("metal", [FX - 0.2, SIDE + 1.1, Z0 + z], [0.04, 0.05, 0.1], "#5E6876");
  m.box("metal", [FX - 0.955, SIDE + 1.0, Z0 - 0.32], [0.03, 0.12, 0.08], "#5E6876");
  for (let k = 0; k < 5; k++) m.box("metal", [FX - 0.948, SIDE + 0.14 + k * 0.035, Z0 - 0.32], [0.01, 0.015, 0.5], "#5E6876");
  // a pay phone on the end pier (2003), and the sidewalk's news box and trash can
  m.push([FX - 0.02, 0, Z1 - 0.24], -Math.PI / 2);
  m.box("metal", [0, 1.55, 0.08], [0.34, 0.62, 0.16], "#8FA0B4"); m.box("metal", [0, 1.9, 0.12], [0.4, 0.08, 0.26], "#5E6876");
  m.box("trim", [-0.08, 1.58, 0.17], [0.07, 0.26, 0.05], "#1A1E24"); m.box("metal", [-0.08, 1.58, 0.205], [0.02, 0.18, 0.02], "#3A4656");
  for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) m.box("trim", [0.05 + k * 0.035, 1.66 - r * 0.04, 0.165], [0.025, 0.025, 0.01], "#D9DEE5");
  m.box("metal", [0.09, 1.74, 0.165], [0.08, 0.02, 0.01], "#1A1E24");
  m.pop();
  addProps(m, [{ type: "news", p: [5.95, SIDE, 5.55], ry: -Math.PI / 2 }, { type: "trash", p: [5.1, SIDE, -0.95], ry: -Math.PI / 2 }]);
  // ── the inside ──
  // back-wall shelving: a pegboard back, uprights, five shelves with price-strip edges and bay headers, then the goods
  m.box("trim", [BACK - 0.02, 1.55, (SHELF.z0 + SHELF.z1) / 2], [0.04, 2.7, SHELF.z1 - SHELF.z0], "#AEB8C6");
  for (let z = SHELF.z0; z <= SHELF.z1 + 0.01; z += (SHELF.z1 - SHELF.z0) / 4) m.box("metal", [BACK - 0.2, 1.5, z], [0.36, 2.6, 0.04], "#7A8798");
  SHELF.ys.forEach((y) => { m.box("metal", [BACK - 0.2, y, (SHELF.z0 + SHELF.z1) / 2], [0.38, 0.03, SHELF.z1 - SHELF.z0], "#9AA6B4"); });
  m.box("metal", [BACK - 0.2, 0.3, (SHELF.z0 + SHELF.z1) / 2], [0.38, 0.28, SHELF.z1 - SHELF.z0], "#3A4656");   // the base
  // the cooler: body, a lit back, glass doors with frames and handles, shelves of bottles
  const czc = (COOL.z0 + COOL.z1) / 2, czl = COOL.z1 - COOL.z0;
  m.box("trim", [BACK - 0.27, 2.66, czc], [0.54, 0.22, czl + 0.1], "#D9DEE5"); m.box("trim", [BACK - 0.27, 0.24, czc], [0.54, 0.16, czl + 0.1], "#D9DEE5");
  for (const z of [COOL.z0 - 0.03, COOL.z1 + 0.03]) m.box("trim", [BACK - 0.27, 1.45, z], [0.54, 2.6, 0.06], "#D9DEE5");
  m.box("bulb", [BACK - 0.08, 1.4, (COOL.z0 + COOL.z1) / 2], [0.02, 2.1, COOL.z1 - COOL.z0 - 0.1], "#9DB4D2");
  const dw = (COOL.z1 - COOL.z0) / 3;
  for (let k = 0; k <= 3; k++) m.box("metal", [COOL.x0 - 0.01, 1.42, COOL.z0 + k * dw], [0.06, 2.2, 0.06], "#2A3240");
  for (const y of [0.32, 2.52]) m.box("metal", [COOL.x0 - 0.01, y, (COOL.z0 + COOL.z1) / 2], [0.06, 0.06, COOL.z1 - COOL.z0], "#2A3240");
  for (let k = 0; k < 3; k++) m.box("metal", [COOL.x0 - 0.06, 1.35, COOL.z0 + (k + 0.82) * dw], [0.03, 0.7, 0.03], "#C9D3DE");
  for (let r = 0; r < 5; r++) m.box("metal", [BACK - 0.3, 0.42 + r * 0.43, (COOL.z0 + COOL.z1) / 2], [0.42, 0.02, COOL.z1 - COOL.z0 - 0.1], "#C9D3DE");
  // the gondola (shortened to leave an aisle at the cooler): a pegboard spine, three shelves both faces, an end cap
  m.box("trim", [(GON.x0 + GON.x1) / 2, 0.85, GON.z], [GON.x1 - GON.x0, 1.4, 0.06], "#AEB8C6");
  m.box("metal", [(GON.x0 + GON.x1) / 2, 0.24, GON.z], [GON.x1 - GON.x0, 0.16, 0.72], "#3A4656");
  for (let r = 0; r < 3; r++) m.box("metal", [(GON.x0 + GON.x1) / 2, 0.4 + r * 0.46, GON.z], [GON.x1 - GON.x0, 0.03, 0.72], "#9AA6B4");
  m.box("metal", [GON.x0 - 0.02, 0.85, GON.z], [0.04, 1.45, 0.74], "#7A8798");
  // ── the counter: a panelled cabinet (kick plate, rails and stiles, raised panels), a steel nosing, the lottery ticket
  //    case built into its customer face, a wire candy rack ──
  const C = COUNTER, cz = (C.z0 + C.z1) / 2, cl = C.z1 - C.z0;
  m.box("trim", [(C.x0 + C.x1) / 2 + 0.04, SIDE + 0.06, cz], [C.x1 - C.x0 - 0.08, 0.12, cl - 0.06], "#11161F");
  m.box("trim", [(C.x0 + C.x1) / 2 + 0.01, (SIDE + 0.12 + C.top) / 2, cz], [C.x1 - C.x0 - 0.02, C.top - SIDE - 0.12, cl], "#34465F");
  const face = C.x0 - 0.005, py0 = SIDE + 0.12, py1 = C.top - 0.02;
  m.box("trim", [face, py0 + 0.04, cz], [0.03, 0.08, cl], "#2A3A52"); m.box("trim", [face, py1 - 0.05, cz], [0.03, 0.1, cl], "#2A3A52");
  const panels = [[C.z0, 0.85], [1.6, 1.75], [3.45, C.z1]];   // stiles leave room for the candy rack (0.85–1.6) and the ticket case (1.75–3.45)
  for (const [a, b] of panels) {
    for (const z of [a + 0.04, b - 0.04]) m.box("trim", [face, (py0 + py1) / 2, z], [0.03, py1 - py0, 0.08], "#2A3A52");
    if (b - a > 0.3) { m.box("trim", [face - 0.012, (py0 + py1) / 2, (a + b) / 2], [0.02, py1 - py0 - 0.3, b - a - 0.22], "#3E5270"); m.box("trim", [face - 0.022, (py0 + py1) / 2, (a + b) / 2], [0.01, py1 - py0 - 0.42, b - a - 0.34], "#465C7C"); }
  }
  m.box("metal", [C.x0 - 0.065, C.top + 0.015, cz], [0.03, 0.035, cl + 0.1], "#B9C6D8");
  // the instant-ticket case: a steel frame, a lit back, 9 bins of fanned tickets
  const T0 = 1.75, T1 = 3.45, ty0 = 0.36, ty1 = 0.82;
  m.box("metal", [C.x0 - 0.035, ty1 + 0.02, (T0 + T1) / 2], [0.08, 0.04, T1 - T0 + 0.04], "#1B2433");
  m.box("metal", [C.x0 - 0.035, ty0 - 0.02, (T0 + T1) / 2], [0.08, 0.04, T1 - T0 + 0.04], "#1B2433");
  for (const z of [T0, T1]) m.box("metal", [C.x0 - 0.035, (ty0 + ty1) / 2, z], [0.08, ty1 - ty0 + 0.08, 0.04], "#1B2433");
  m.box("bulb", [C.x0 - 0.002, (ty0 + ty1) / 2, (T0 + T1) / 2], [0.004, ty1 - ty0, T1 - T0], "#7E98BC");
  const nb = 9, bw = (T1 - T0 - 0.06) / nb, tk = [];
  for (let k = 0; k < nb; k++) for (let q = 0; q < 2; q++) {
    const z = T0 + 0.03 + (k + 0.5) * bw;
    tk.push({ type: "ticket", p: [C.x0 - 0.02 - q * 0.006, ty0 + 0.04 + (1 - q) * 0.17, z], s: [bw - 0.03, 0.22, 0.003], ry: -Math.PI / 2, v: (k * 3 + q * 5) % 16 });
  }
  for (let k = 1; k < nb; k++) m.box("metal", [C.x0 - 0.03, (ty0 + ty1) / 2, T0 + 0.03 + k * bw], [0.05, ty1 - ty0, 0.008], "#3A4656");
  // the candy rack: a steel back, three wire tiers
  m.box("metal", [C.x0 - 0.05, 0.82, 1.22], [0.03, 0.52, 0.7], "#8FA9C8");
  for (let r = 0; r < 3; r++) { m.box("metal", [C.x0 - 0.12, 0.6 + r * 0.17, 1.22], [0.14, 0.012, 0.7], "#6E7A8A"); m.box("metal", [C.x0 - 0.19, 0.63 + r * 0.17, 1.22], [0.01, 0.05, 0.7], "#8A96A6"); }
  const candy = [];
  for (let r = 0; r < 3; r++) for (let k = 0; k < 7; k++) for (let q = 0; q < 3; q++) candy.push({ type: "candy", p: [C.x0 - 0.17 + q * 0.04, 0.607 + r * 0.17 + q * 0.022, 0.9 + k * 0.093], s: [0.088, 0.034 + (k % 3) * 0.006, 0.028], ry: -Math.PI / 2 + (q - 1) * 0.06, v: (r * 3 + k) % 8 });
  // ── the register (a POS cash register, keypad toward the window): cash drawer, body, sloped keyboard, the operator display,
  //    the customer pole display, a receipt printer with its paper; a card reader beside it ──
  m.push([8.88, C.top + 0.03, 0.95], -Math.PI / 2);
  m.box("trim", [0, 0.06, 0], [0.46, 0.12, 0.44], "#232A34");
  m.box("trim", [0, 0.06, 0.222], [0.44, 0.004, 0.004], "#0B0F15"); m.box("trim", [0, 0.025, 0.224], [0.18, 0.02, 0.006], "#0B0F15");
  m.cyl("metal", [0.17, 0.08, 0.226], 0.012, 0.01, "#C9D3DE", { r: [Math.PI / 2, 0, 0], seg: 10 });
  m.box("trim", [0, 0.15, -0.02], [0.44, 0.07, 0.4], "#2B3440");
  m.pushR([0, 0.2, 0.06], [-0.32, 0, 0]);
  m.box("trim", [0, 0, 0], [0.4, 0.03, 0.26], "#3A4452");
  for (let r = 0; r < 5; r++) for (let k = 0; k < 8; k++) {
    if (k === 7 && r > 2) continue;
    const fn = k >= 6, col = fn ? (r < 2 ? "#4D8ED9" : "#8FA9C8") : "#DDE2E8";
    m.box("trim", [-0.165 + k * 0.045, 0.022, -0.1 + r * 0.045], [0.036, 0.016, 0.036], col);
  }
  m.box("trim", [0.15, 0.022, 0.08], [0.081, 0.018, 0.08], "#1F5FB4");   // the TOTAL key
  m.pop();
  m.box("trim", [0, 0.24, -0.16], [0.05, 0.12, 0.05], "#2B3440");
  m.pushR([0, 0.36, -0.15], [-0.25, 0, 0]); m.box("trim", [0, 0, 0], [0.3, 0.15, 0.035], "#1F2733"); m.pop();
  m.cyl("trim", [-0.17, 0.32, -0.17], 0.012, 0.24, "#2B3440", { seg: 8 }); m.box("trim", [-0.17, 0.47, -0.17], [0.22, 0.07, 0.05], "#1F2733");
  m.box("trim", [0.31, 0.07, -0.04], [0.15, 0.14, 0.22], "#2B3440"); m.box("trim", [0.31, 0.141, -0.06], [0.11, 0.004, 0.02], "#0B0F15");
  m.pop();
  m.push([8.72, C.top + 0.03, 1.36], -Math.PI / 2 + 0.3);
  m.pushR([0, 0.03, 0], [-0.25, 0, 0]); m.box("trim", [0, 0, 0], [0.09, 0.035, 0.16], "#1F2733");
  for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) m.box("trim", [-0.025 + k * 0.025, 0.02, 0.0 + r * 0.02], [0.018, 0.008, 0.014], "#C9D3DE");
  m.box("bulb", [0, 0.019, -0.05], [0.06, 0.002, 0.035], "#5C9F8A");
  m.pop(); m.pop();
  // ── the goods ──
  const goods = [...tk, ...candy];
  const shelfType = ["box", "can", "box", "box", "bag"];
  SHELF.ys.forEach((y, r) => {
    let z = SHELF.z0 + 0.04, i = 0;
    while (z < SHELF.z1 - 0.06) {
      const face = Math.floor(rnd(r * 77 + i) * 3) + 2, ty = shelfType[r], v = Math.floor(rnd(r * 131 + i * 7) * 8);
      for (let q = 0; q < face && z < SHELF.z1 - 0.06; q++) {
        if (ty === "can") { const d = 0.068; goods.push({ type: "can", p: [SHELF.x0 + 0.06, y + 0.015, z + d / 2], s: [d, 0.122, d], ry: Math.PI / 2, v }); if (rnd(i + q) < 0.7) goods.push({ type: "can", p: [SHELF.x0 + 0.06, y + 0.137, z + d / 2], s: [d, 0.122, d], ry: Math.PI / 2, v }); z += d + 0.004; }
        else if (ty === "bag") { const w = 0.17; goods.push({ type: "bag", p: [SHELF.x0 + 0.07, y + 0.015, z + w / 2], s: [w, 0.25, 0.07], ry: -Math.PI / 2, v }); z += w + 0.01; }
        else { const big = r === 2, w = big ? 0.19 : 0.15, h = big ? 0.28 : r === 0 ? 0.3 : 0.2; const vv = big ? v % 5 : r === 0 ? 5 + (v % 3) : [5, 6, 7][v % 3]; goods.push({ type: "box", p: [SHELF.x0 + 0.045, y + 0.015, z + w / 2], s: [w, h, 0.07], ry: -Math.PI / 2, v: vv }); z += w + 0.008; }
      }
      z += 0.02; i++;
    }
  });
  for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) for (let q = 0; q < 6; q++) goods.push({ type: "bottle", p: [COOL.x0 + 0.08 + (q % 2) * 0.12, 0.44 + r * 0.43, COOL.z0 + 0.1 + k * dw + Math.floor(q / 2) * 0.2], s: [0.072, 0.24, 0.072], v: (r * 2 + k) % 8 });
  for (let f = 0; f < 2; f++) for (let r = 0; r < 3; r++) {
    let x = GON.x0 + 0.04; let i = 0;
    while (x < GON.x1 - 0.12) {
      const zf = GON.z + (f ? 0.22 : -0.22), ry = f ? 0 : Math.PI, v = Math.floor(rnd(f * 99 + r * 31 + i) * 8);
      if (r === 2) { goods.push({ type: "bag", p: [x + 0.08, 0.415 + r * 0.46, zf], s: [0.16, 0.26, 0.07], ry, v }); x += 0.17; }
      else if (r === 1) { goods.push({ type: "box", p: [x + 0.07, 0.415 + r * 0.46, zf], s: [0.14, 0.2, 0.06], ry, v: 5 + (v % 3) }); x += 0.15; }
      else { goods.push({ type: "can", p: [x + 0.035, 0.415, zf], s: [0.068, 0.122, 0.068], ry: f ? Math.PI : 0, v }); x += 0.072; }
      i++;
    }
  }
  addGoods(m, goods);
};
const CounterSpot = () => {
  const tgt = useMemo(() => { const o = new THREE.Object3D(); o.position.set(BP[0] + 0.02, BP[1], BP[2] + 0.05); return o; }, []);
  return (
    <>
      <primitive object={tgt} />
      <spotLight position={[8.35, CEIL - 0.08, 1.75]} target={tgt} angle={0.62} penumbra={0.75} intensity={9} distance={4.5} decay={1.6} color="#E4EEFC" castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.00025} shadow-normalBias={0.004} shadow-camera-near={0.4} shadow-camera-far={4.2} />
    </>
  );
};
// ★ rev 6 (Timur: "if you're not going to add shadows to things … at least add those fake shadows … a dark subtle shape under it, the
//   correct one … you can see the corners better … we don't want unlit objects"): the store's contact shadows and darkened corners
//   (fakeshade.tsx, three merged meshes) — the foot of the facade and the ICE chest / news box / bin on the sidewalk; inside, every
//   wall–floor and wall–ceiling junction and the back corners, the shelving's and the cooler's feet, the shadow each shelf board throws
//   on the pegboard under it and the dark where each shelf meets the back, the gondola's shelves, the counter's foot, and the register,
//   card reader, terminal and brochure stand on the counter top. Outside they lean with the key (up-left-front); inside they sit square
//   under the ceiling panels.
const SKD = keyDir([-9, 14, 8]);
const buildStoreShade = (s) => {
  const zc = (Z0 + Z1) / 2, FL = SIDE + 0.004, IN0 = FX + WALL, ZA = Z0 + 0.16, ZB = Z1 - 0.16;
  // outside: the facade's foot on the sidewalk, the ICE chest, the news box and the bin
  s.edge([FX - 0.02, FL, zc], [0, 0, 1], [-1, 0, 0], Z1 - Z0 + 0.2, 0.7, 0.5);
  s.floor("rect", [FX - 0.55 + SKD[0] * 0.14, FL, Z0 - 0.32 + SKD[1] * 0.14], 1.05, 1.15, 0, 0.62);
  s.floor("rect", [5.95 + SKD[0] * 0.1, FL, 5.55 + SKD[1] * 0.1], 0.66, 0.74, -Math.PI / 2, 0.6);
  s.floor("blob", [5.1 + SKD[0] * 0.12, FL, -0.95 + SKD[1] * 0.12], 0.82, 0.82, 0, 0.62);
  // inside: wall–floor junctions (front, back, both sides), wall–ceiling junctions, the two back corners
  s.edge([IN0, FL, zc], [0, 0, 1], [1, 0, 0], ZB - ZA, 0.45, 0.4);
  s.edge([BACK, FL, zc], [0, 0, 1], [-1, 0, 0], ZB - ZA, 0.5, 0.42);
  for (const [z, o] of [[ZA, 1], [ZB, -1]]) {
    s.edge([(IN0 + BACK) / 2, FL, z], [1, 0, 0], [0, 0, o], BACK - IN0, 0.5, 0.42);
    s.edge([(IN0 + BACK) / 2, CEIL - 0.004, z + o * 0.002], [1, 0, 0], [0, -1, 0], BACK - IN0, 0.55, 0.32);   // under the ceiling, on the side wall
    s.edge([BACK - 0.002, (FL + CEIL) / 2, z], [0, 1, 0], [0, 0, o], CEIL - FL, 0.45, 0.3);                   // the back corner, on the back wall
    s.edge([BACK - 0.45 * 0 - 0.002, (FL + CEIL) / 2, z + o * 0.002], [0, 1, 0], [-1, 0, 0], CEIL - FL, 0.45, 0.3);   // … and on the side wall
  }
  s.edge([BACK - 0.003, CEIL - 0.004, zc], [0, 0, 1], [0, -1, 0], ZB - ZA, 0.55, 0.32);
  s.edge([IN0 + 0.003, CEIL - 0.004, zc], [0, 0, 1], [0, -1, 0], ZB - ZA, 0.4, 0.28);
  // the shelving: its foot on the tiles, each board's shadow on the pegboard below it, the dark where each board meets the back
  s.edge([BACK - 0.39, FL, (SHELF.z0 + SHELF.z1) / 2], [0, 0, 1], [-1, 0, 0], SHELF.z1 - SHELF.z0 + 0.1, 0.42, 0.55);
  SHELF.ys.forEach((y) => {
    s.edge([BACK - 0.045, y - 0.016, (SHELF.z0 + SHELF.z1) / 2], [0, 0, 1], [0, -1, 0], SHELF.z1 - SHELF.z0 - 0.04, 0.24, 0.5);
    s.edge([BACK - 0.045, y + 0.0165, (SHELF.z0 + SHELF.z1) / 2], [0, 0, 1], [-1, 0, 0], SHELF.z1 - SHELF.z0 - 0.04, 0.3, 0.42);
    s.floor("rect", [BACK - 0.21, y + 0.0165, (SHELF.z0 + SHELF.z1) / 2], 0.42, SHELF.z1 - SHELF.z0 + 0.06, 0, 0.3);   // under the goods
  });
  // the cooler's foot, the gondola (its foot, and each shelf's shadow on the spine, both faces)
  s.edge([BACK - 0.55, FL, (COOL.z0 + COOL.z1) / 2], [0, 0, 1], [-1, 0, 0], COOL.z1 - COOL.z0 + 0.1, 0.4, 0.5);
  s.floor("rect", [(GON.x0 + GON.x1) / 2, FL, GON.z], GON.x1 - GON.x0 + 0.45, 1.15, 0, 0.6);
  for (let r = 0; r < 3; r++) for (const sd of [-1, 1]) {
    s.edge([(GON.x0 + GON.x1) / 2, 0.4 + r * 0.46 - 0.016, GON.z + sd * 0.032], [1, 0, 0], [0, -1, 0], GON.x1 - GON.x0 - 0.04, 0.2, 0.45);
    s.edge([(GON.x0 + GON.x1) / 2, 0.4 + r * 0.46 + 0.0165, GON.z + sd * 0.032], [1, 0, 0], [0, 0, sd], GON.x1 - GON.x0 - 0.04, 0.22, 0.38);
  }
  // the counter: its foot on the tiles (both faces), the dark under the steel nosing on the customer face
  s.floor("rect", [(COUNTER.x0 + COUNTER.x1) / 2 + 0.02, FL, (COUNTER.z0 + COUNTER.z1) / 2], COUNTER.x1 - COUNTER.x0 + 0.5, COUNTER.z1 - COUNTER.z0 + 0.45, 0, 0.58);
  s.edge([COUNTER.x0 - 0.082, COUNTER.top - 0.002, (COUNTER.z0 + COUNTER.z1) / 2], [0, 0, 1], [0, -1, 0], COUNTER.z1 - COUNTER.z0, 0.16, 0.4);
  // on the counter top: the register (+ printer), the card reader, the lottery terminal, the brochure stand
  const CT = COUNTER.top + 0.0312;
  s.floor("rect", [8.9, CT, 0.95], 0.6, 0.62, 0, 0.6);
  s.floor("rect", [8.93, CT, 1.27], 0.3, 0.26, 0, 0.5);   // the receipt printer (the register's local +x is world +z)
  s.floor("rect", [8.72, CT, 1.36], 0.16, 0.24, 0.3, 0.5);
  s.floor("rect", [8.9, CT, 3.45], 0.56, 0.64, 0, 0.62);
  s.floor("rect", [8.97, CT, 2.85], 0.46, 0.3, 0, 0.55);
};
// ── the shop ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const Shop = ({ f, t }) => {
  const W_ = Z1 - Z0;
  const sign = useMemo(signTex, []), poster = useMemo(posterTex, []), lotto = useMemo(lottoSignTex, []), open = useMemo(openTex, []);
  const blade = useMemo(bladeTex, []), ice = useMemo(iceTex, []), term = useMemo(termTex, []), awn = useMemo(awningTex, []);
  const scr = useMemo(regScreenTex, []), pole = useMemo(poleTex, []), rcpt = useMemo(receiptTex, []), chead = useMemo(caseHeadTex, []), cool = useMemo(coolerHeadTex, []);
  const bays = useMemo(() => ["GROCERY", "SNACKS", "BREAKFAST"].map((b) => bayTex(b, b)), []);
  const tile = useMemo(() => { const t = tileTex().clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5.3 / 1.3, 7.1 / 1.3); t.needsUpdate = true; return t; }, []);
  const zc = (Z0 + Z1) / 2;
  // the OPEN sign breathes very slightly (a neon tube), the terminal screen idles
  const neon = 0.85 + 0.15 * Math.sin(f / 9);
  return (
    <group>
      <Town build={buildShop} />
      <ShadeLayer build={buildStoreShade} />
      {/* the sign panel and its gooseneck lamps */}
      <mesh position={[FX - 0.06 - 0.041, 3.62, zc + 0.15]} rotation-y={-Math.PI / 2}><planeGeometry args={[6.3, 0.88]} /><meshStandardMaterial map={sign} roughness={0.4} emissiveMap={sign} emissive="#ffffff" emissiveIntensity={0.55} /></mesh>
      {[-0.4, 1.6, 3.6].map((z, i) => <Lamp key={i} z={z + 0.15} on={ease(f, t.in2003 - 6, t.y2003 + 8)} />)}
      <Banner on={ease(f, t.in2003 - 6, t.y2003 + 8)} />
      {/* the awning over the display window */}
      <group position={[FX - 0.36, 2.98, (WIN.z0 + WIN.z1) / 2]} rotation-z={-0.38}>
        <mesh castShadow receiveShadow><boxGeometry args={[0.8, 0.025, WIN.z1 - WIN.z0 + 0.3]} /><meshStandardMaterial map={awn} roughness={0.85} /></mesh>
        <mesh position={[-0.4, -0.08, 0]} rotation-z={0.38}><boxGeometry args={[0.015, 0.16, WIN.z1 - WIN.z0 + 0.3]} /><meshStandardMaterial map={awn} roughness={0.85} /></mesh>
        {[-1, 1].map((sd) => <mesh key={sd} position={[0, -0.02, sd * ((WIN.z1 - WIN.z0) / 2 + 0.14)]}><boxGeometry args={[0.78, 0.04, 0.02]} /><meshStandardMaterial color="#1B2433" metalness={0.6} roughness={0.4} /></mesh>)}
      </group>
      {/* the blade sign over the sidewalk, read from down the street */}
      <group position={[FX - 0.05, 3.55, Z1 - 0.45]}>
        <Box p={[-0.45, 0.62, 0]} s={[0.9, 0.04, 0.04]} m={M.frame} />
        <mesh position={[-0.12, 0.42, 0]} rotation-z={0.8} material={M.frame}><cylinderGeometry args={[0.012, 0.012, 0.55, 6]} /></mesh>
        {[-0.2, -0.7].map((x) => <mesh key={x} position={[x, 0.5, 0]} material={M.frame}><cylinderGeometry args={[0.006, 0.006, 0.2, 4]} /></mesh>)}
        <Box p={[-0.45, 0.0, 0]} s={[0.78, 0.8, 0.06]} m={M.frame} />
        {/* rev 8e (Timur, 280 f: the blue sign "glitching"): the faces sat 1 mm off the cabinet's faces (z-fight at street distance) — now 6 mm,
            with a polygon offset toward the lens */}
        {[1, -1].map((sd) => <mesh key={sd} position={[-0.45, 0, sd * 0.036]} rotation-y={sd > 0 ? 0 : Math.PI}><planeGeometry args={[0.72, 0.74]} /><meshStandardMaterial map={blade} roughness={0.4} emissiveMap={blade} emissive="#ffffff" emissiveIntensity={0.6} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} /></mesh>)}
        <Glow position={[-0.45, 0, 0.2]} size={1.6} color="#7FB4F2" opacity={0.22} />
      </group>
      {/* the display glass, the hanging LOTTERY light box, the WINFALL poster, the neon OPEN */}
      <mesh position={[FX + 0.1, (WIN.y0 + WIN.y1) / 2, (WIN.z0 + WIN.z1) / 2]} rotation-y={-Math.PI / 2} material={glassMat}><planeGeometry args={[WIN.z1 - WIN.z0, WIN.y1 - WIN.y0]} /></mesh>
      <group position={[FX + 0.35, 2.12, 4.6]}>
        {[-0.5, 0.5].map((z) => <mesh key={z} position={[0, 0.22, z]} material={M.frame}><cylinderGeometry args={[0.006, 0.006, 0.3, 4]} /></mesh>)}
        <Box p={[0, 0, 0]} s={[0.06, 0.26, 1.04]} m={M.dark} />
        <mesh position={[-0.031, 0, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[1.0, 0.24]} /><meshBasicMaterial map={lotto} toneMapped={false} /></mesh>
        <Glow position={[-0.1, 0, 0]} size={1.4} color="#7FB4F2" opacity={0.35} />
      </group>
      <mesh position={[FX + 0.115, 1.3, 1.25]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.45, 0.6]} /><meshStandardMaterial map={poster} roughness={0.5} emissiveMap={poster} emissive="#ffffff" emissiveIntensity={0.25} /></mesh>
      <mesh position={[FX + 0.07, 1.5, (DOOR.z0 + DOOR.z1) / 2]} rotation-y={-Math.PI / 2} material={glassMat}><planeGeometry args={[DOOR.z1 - DOOR.z0 - 0.2, 2.3]} /></mesh>
      <mesh position={[FX + 0.16, 2.05, (DOOR.z0 + DOOR.z1) / 2]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.7, 0.26]} /><meshBasicMaterial map={open} transparent blending={THREE.AdditiveBlending} opacity={neon} toneMapped={false} depthWrite={false} /></mesh>
      <Glow position={[FX + 0.05, 2.05, (DOOR.z0 + DOOR.z1) / 2]} size={1.1} color="#FF9F5E" opacity={0.32 * neon} />
      <mesh position={[FX - 0.951, SIDE + 0.66, Z0 - 0.32]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.7, 0.44]} /><meshStandardMaterial map={ice} roughness={0.5} /></mesh>
      {/* ── the inside ── */}
      <mesh rotation-x={-Math.PI / 2} position={[(FX + WALL + BACK) / 2, SIDE + 0.002, zc]} receiveShadow><planeGeometry args={[BACK - FX - WALL, W_ - 0.2]} /><meshStandardMaterial map={tile} color="#6E7C90" roughness={0.35} metalness={0.05} envMapIntensity={0.35} /></mesh>
      <Box p={[BACK + 0.15, TOPH / 2, zc]} s={[0.3, TOPH, W_]} m={M.wallIn} />
      <Box p={[(FX + BACK) / 2 + 0.15, TOPH / 2, Z0 + 0.08]} s={[BACK - FX, TOPH, 0.16]} m={M.wallIn} />
      <Box p={[(FX + BACK) / 2 + 0.15, TOPH / 2, Z1 - 0.08]} s={[BACK - FX, TOPH, 0.16]} m={M.wallIn} />
      <Box p={[(FX + WALL + BACK) / 2, CEIL + 0.05, zc]} s={[BACK - FX - WALL, 0.1, W_]} m={M.ceil} />
      <Box p={[(FX + BACK) / 2 + 0.1, TOPH + 0.02, zc]} s={[BACK - FX + 0.2, 0.2, W_]} m={M.lintel} />
      {[[8.7, 2.3], [10.7, 2.3], [10.7, -0.2], [8.7, 5.0]].map(([x, z], i) => (
        <group key={i} position={[x, CEIL - 0.02, z]}>
          <Box p={[0, 0, 0]} s={[0.62, 0.04, 1.24]} m={M.shelf} cast={false} />
          <mesh position={[0, -0.022, 0]} rotation-x={Math.PI / 2}><planeGeometry args={[0.52, 1.12]} /><meshBasicMaterial color="#C9DBF2" /></mesh>
        </group>
      ))}
      <pointLight position={[8.7, 2.95, 2.3]} intensity={1.7} distance={6} decay={1.6} color="#CFE0F8" />
      <pointLight position={[10.8, 2.95, 0.6]} intensity={1.4} distance={6} decay={1.6} color="#D6E4F7" />
      {/* rev 5 (Timur: "if an object is a main visual … there needs to be shadows on it"): the leaflet's light is a shadow-casting spot from
          the ceiling panel over the counter (cool white, from the window side, so the flaps throw their shadows across the counter as they
          open and the stack, the pen and the terminal sit in their own shadows); a faint warm fill from the terminal side keeps the paper from going grey */}
      <CounterSpot />
      <pointLight position={[8.95, 1.6, 3.2]} intensity={0.35} distance={1.6} decay={2} color="#FFE9CC" />
      {/* bay headers over the back shelving, the cooler's header */}
      {bays.map((b, i) => <mesh key={i} position={[BACK - 0.05, 2.86, SHELF.z0 + (i + 0.5) * (SHELF.z1 - SHELF.z0) / 3]} rotation-y={-Math.PI / 2}><planeGeometry args={[1.2, 0.225]} /><meshStandardMaterial map={b} roughness={0.5} emissiveMap={b} emissive="#ffffff" emissiveIntensity={0.35} /></mesh>)}
      <mesh position={[COOL.x0 - 0.045, 2.68, (COOL.z0 + COOL.z1) / 2]} rotation-y={-Math.PI / 2}><planeGeometry args={[COOL.z1 - COOL.z0, 0.26]} /><meshBasicMaterial map={cool} toneMapped={false} /></mesh>
      {/* the counter top (laminate) */}
      <Box p={[(COUNTER.x0 + COUNTER.x1) / 2, COUNTER.top + 0.015, (COUNTER.z0 + COUNTER.z1) / 2]} s={[COUNTER.x1 - COUNTER.x0 + 0.14, 0.03, COUNTER.z1 - COUNTER.z0 + 0.1]} m={M.top} />
      {/* the ticket case: its header and glass */}
      <mesh position={[COUNTER.x0 - 0.078, 0.9, 2.6]} rotation-y={-Math.PI / 2}><planeGeometry args={[1.74, 0.13]} /><meshBasicMaterial map={chead} toneMapped={false} /></mesh>
      <mesh position={[COUNTER.x0 - 0.072, 0.59, 2.6]} rotation-y={-Math.PI / 2} material={glassMat}><planeGeometry args={[1.66, 0.44]} /></mesh>
      {/* the register's screens and the receipt */}
      <group position={[8.88, COUNTER.top + 0.03, 0.95]} rotation-y={-Math.PI / 2}>
        <mesh position={[0, 0.3647, -0.1305]} rotation-x={-0.25}><planeGeometry args={[0.27, 0.12]} /><meshBasicMaterial map={scr} toneMapped={false} /></mesh>
        <mesh position={[-0.17, 0.47, -0.144]}><planeGeometry args={[0.2, 0.05]} /><meshBasicMaterial map={pole} toneMapped={false} /></mesh>
        <mesh position={[0.31, 0.19, -0.065]} rotation-x={0.15}><planeGeometry args={[0.085, 0.1]} /><meshStandardMaterial map={rcpt} roughness={0.8} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0.31, 0.261, -0.002]} rotation-x={1.2}><planeGeometry args={[0.085, 0.12]} /><meshStandardMaterial map={rcpt} roughness={0.8} side={THREE.DoubleSide} /></mesh>
        <Glow position={[0, 0.38, -0.05]} size={0.5} color="#7FD8F0" opacity={0.25} />
      </group>
      {/* the lottery terminal: body, slanted screen, ticket slot, a roll of stock */}
      <group position={[8.86, COUNTER.top + 0.03, 3.45]}>
        <Box p={[0.04, 0.09, 0]} s={[0.4, 0.18, 0.48]} m={M.plastic} />
        <Box p={[-0.17, 0.19, 0]} s={[0.03, 0.025, 0.34]} m={M.dark} />
        <group position={[0.12, 0.34, 0]} rotation-z={0.42}>
          <Box p={[0, 0, 0]} s={[0.04, 0.32, 0.46]} m={M.plastic} />
          <mesh position={[-0.021, 0, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.4, 0.26]} /><meshBasicMaterial map={term} toneMapped={false} /></mesh>
        </group>
        <Glow position={[0.0, 0.36, 0]} size={0.7} color="#5C9BE8" opacity={0.35} />
      </group>
      {/* the brochure stand (a short stack, an acrylic holder) and the open leaflet */}
      <group position={[8.95, COUNTER.top + 0.03, 2.85]}>
        <Box p={[0, 0.1, 0]} s={[0.36, 0.2, 0.2]} m={glassMat} cast={false} />
      </group>
      <BrochureStack p={[9.0, COUNTER.top + 0.03, 2.86]} n={5} yaw={0.08} />
      {/* a pen beside the leaflet and a few play slips */}
      <group position={[8.7, COUNTER.top + 0.04, 2.47]} rotation-y={0.5}>
        <mesh rotation-z={Math.PI / 2} material={M.plastic} castShadow><cylinderGeometry args={[0.0055, 0.0055, 0.14, 12]} /></mesh>
        <mesh position={[0.045, 0, 0]} rotation-z={Math.PI / 2} castShadow><cylinderGeometry args={[0.0062, 0.0062, 0.05, 12]} /><meshStandardMaterial color="#1F5FB4" roughness={0.3} metalness={0.2} /></mesh>
        <mesh position={[-0.075, 0, 0]} rotation-z={-Math.PI / 2} material={M.steel}><coneGeometry args={[0.0055, 0.014, 12]} /></mesh>
      </group>
      {[0, 1, 2].map((i) => <mesh key={i} position={[8.62 + i * 0.01, COUNTER.top + 0.032 + i * 0.0006, 1.86 - i * 0.03]} rotation-x={-Math.PI / 2} rotation-z={0.3 + i * 0.12} receiveShadow><planeGeometry args={[0.09, 0.19]} /><meshStandardMaterial color={i === 2 ? "#E9EFF7" : "#D7E2F0"} roughness={0.7} /></mesh>)}
    </group>
  );
};
// ── the brochure's beats ─────────────────────────────────────────────────────────────────────────────────────────────────
const broOpen = (t, f) => ease(f, t.newG - 2, t.winfall + 6);
const hiK = (t, f) => ease(f, t.loophole - 4, t.loopEnd + 16);
// the diagram's jackpot column (spread px → the counter's frame) and the rule's mid-point for the tags
const DIAG = pxToDesign(1330, 960);
const diagPt = (dz = 0.002) => broPt(BP, DIAG[0], DIAG[1], dz);
const rulePt = () => { const d = pxToDesign(1420, 340); return broPt(BP, d[0], d[1]); };
const coverPt = () => broPt(BP, 0, 0.02);   // rev 2: the folded cover lies on the spread's middle panel (−0.15 pointed past its left edge)
// rev 5 (Timur: the main visual "needs shadows … and needs to be detailed"): the leaflet's contact shadow on the laminate — a soft
//   dark footprint under the paper that widens with it as it unfolds (the spot's cast shadow alone is a hairline: paper is 1 mm thick)
const softRectTex = () => canvasTex("st_softrect2", 256, 256, (c, w, h) => {
  // only the blurred SHADOW of a rect drawn off-canvas (the rect itself would leave a hard edge): densest under the paper, feathered out
  c.shadowColor = "rgba(0,0,0,1)"; c.shadowBlur = 30; c.shadowOffsetX = 2000; c.fillStyle = "#000";
  c.fillRect(70 - 2000, 70, w - 140, h - 140);
});
const LeafletShadow = ({ open }) => {
  const tex = useMemo(softRectTex, []);
  const wz = 0.15 + 0.3 * clamp01(open * 1.02) + 0.02, lx = 0.32 + 0.02;
  return (
    <mesh rotation-x={-Math.PI / 2} position={[BP[0] + 0.012, COUNTER.top + 0.0305, BP[2] + 0.008]} renderOrder={1}>
      <planeGeometry args={[lx * 2, wz * 2]} />
      <meshBasicMaterial map={tex} color="#000000" transparent opacity={0.5} depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
    </mesh>
  );
};
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  return (
    <group>
      <Sky />
      <Shop f={f} t={t} />
      <LeafletShadow open={broOpen(t, f)} />
      <Brochure p={BP} open={broOpen(t, f)} hi={hiK(t, f)} glow={1 - ease(f, t.loopEnd + 14, t.loopEnd + 24)} />
      <KitchenTimer f={f} t={t} />
    </group>
  );
};
// the push INTO the diagram ends 7.5 cm over the paper (the near plane is 5 cm), closer than the camera's idle drift (kit.makeCam: ±6 cm) — so it is keyed one
// shot per frame with that drift subtracted (the kit's own formula), landing exactly on the paper without ever dipping under it
// rev 4f: the kit's drift runs on REAL frames (makeCam sees shots already shifted by HOOK_SHIFT); this station is in STORY time, so
//   its undrift adds HOOK_SHIFT — without it the 17 s push into the brochure overshot the chart's centre and the picture spun ~100°
const drift = (fs) => { const f = fs + HOOK_SHIFT; return [0.06 * Math.sin(f / 97), 0.04 * Math.sin(f / 131 + 1), 0.05 * Math.sin(f / 113 + 2)]; };
// ★ rev 5 (Timur, 2026-11-27: "slower … cinematic … every move on a subject"): the inside is ONE continuous glide keyed per frame in the
//   camera's own space (aim point, view direction, LOG distance, fov) — down onto the open leaflet, a slow lean in to the roll-down panel as
//   the rule lights on "loophole", then the push INTO the diagram's jackpot column, which lands on exactly the old end pose (the rolldown's
//   matched cut). The two stages overlap (it never settles and restarts), the push eases its ZOOM RATE (log distance), and the kit's idle
//   drift is cancelled progressively from the leaflet on, so the near-vertical end can never spin (rev 4f).
const IN = (t) => ({ a0: t.newG + 23, a1: t.he + 36, c0: t.three - 3, c1: t.when - 1, w0: t.newG + 23, w1: t.newG + 71 });   // rev 7: the push waits for "3 minutes" (the timer is in the lean-in frame)
const unit = (v) => { const n = Math.hypot(v[0], v[1], v[2]); return v.map((x) => x / n); };
const lerpV = (p, q, e) => p.map((x, k) => x + (q[k] - x) * e);
const insidePath = (t, d) => {
  const k = IN(t), out = [];
  const T3 = [8.82, 1.02, 2.27], V3 = unit([8.33 - 8.82, 1.86 - 1.02, 2.29 - 2.27]), D3 = Math.hypot(8.33 - 8.82, 1.86 - 1.02, 0.02);
  // the lean-in frames the rule AND the diagram from nearly overhead, so the final push barely turns (the turn happens far from the paper)
  const T5 = [8.77, 1.03, 2.325], V5 = unit([-0.16, 0.99, 0]), D5 = 1.1;   // rev 7: wide enough for the kitchen timer at the top of the frame
  const P6 = [d[0] - 0.008, d[1] + 0.075, d[2]], V6 = unit([P6[0] - d[0], P6[1] - d[1], 0]), D6 = Math.hypot(0.008, 0.075);
  for (let f = k.a0 + 1; f <= k.c1; f++) {
    const eA = ease(f, k.a0, k.a1), eC = ease(f, k.c0, k.c1), w = ease(f, k.w0, k.w1), dr = drift(f);
    const eT = ease(f, k.c0 - 2, k.c0 + 16);   // the aim settles on the jackpot column while the camera is still far from the paper
    const T_ = lerpV(lerpV(T3, T5, eA), d, eT);
    const V_ = unit(lerpV(lerpV(V3, V5, eA), V6, eC));
    const D_ = Math.exp(Math.log(D3) + (Math.log(D5) - Math.log(D3)) * eA + (Math.log(D6) - (Math.log(D3) + (Math.log(D5) - Math.log(D3)) * eA)) * eC);
    const P_ = f === k.c1 ? P6 : [T_[0] + V_[0] * D_, T_[1] + V_[1] * D_, T_[2] + V_[2] * D_];
    out.push({ a: f - 1, b: f, pos: W([P_[0] - dr[0] * w, P_[1] - dr[1] * w, P_[2] - dr[2] * w]), target: W(f === k.c1 ? d : T_), fov: 32 - 2 * eC });
  }
  return out;
};
// ── the camera ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// rev 5: four moves where there were seven — (1) the slow glide on from the hook, rising over the flat ticket and down main street, to a
//   three-quarter view of the whole shop front (sign, awning, lit window) as "2003" lands; (2) a slow dolly toward the window, aimed
//   through the glass at the leaflet lying on the counter ("retired store owner Jerry Selbee"); (3) on "read a brochure" one unbroken move through the glass
//   down onto the leaflet as it unfolds; (4) the inside glide above.
const shots = () => {
  const t = T();
  const d = diagPt(0);
  return [
    { a: t.in2003 - 46, b: t.in2003 + 42, pos: W([2.5, 3.5, 30.5]), target: W([6.4, 2.5, 8.5]), fov: 38, arc: 0.8 },   // over the ticket, eyes on the lit shopfronts that lead to the store
    { a: t.in2003 + 18, b: t.store + 16, pos: W([2.0, 2.65, 16.8]), target: W([6.8, 2.6, 2.6]), fov: 38 },
    { a: t.store - 2, b: t.read + 8, pos: W([3.7, 1.85, 5.6]), target: W([8.75, 1.1, 2.2]), fov: 34 },
    { a: t.read - 4, b: t.newG + 23, pos: W([8.33, 1.86, 2.29]), target: W([8.82, 1.02, 2.27]), fov: 32 },
    ...insidePath(t, d)
  ];
};
// a timer figure in the house counter dress, rolling m:ss up to 3:00 on "3 minutes"
const CHIP_BG = "rgba(4, 18, 38, 0.86)";
const Timer = ({ at, land, out, x, y }) => {
  const f = useCurrentFrame();
  if (!COUNTERS) return null;   // rev 6 (builder P): a panel like the Year — off with the others (Main's BIG "3 MINUTES" carries the figure)
  const kIn = easeOut(f, at, at + 12), kOut = ease(f, out, out + 8);
  const vis = kIn * (1 - kOut);
  if (vis <= 0.001) return null;
  const s = Math.round(180 * easeOut(f, at + 1, land));
  const txt = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, ${(1 - kIn) * 22 - kOut * 14}px) scale(${0.94 + 0.06 * kIn})`, opacity: vis,
      background: CHIP_BG, borderRadius: 14, padding: "14px 30px 16px", boxShadow: "0 10px 40px rgba(0,8,20,0.5)", textAlign: "center", borderLeft: "5px solid #4D8ED9" }}>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: "#B3CEEF", textTransform: "uppercase", marginBottom: 4 }}>Time to spot it</div>
      <div style={{ fontFamily: FIGURE, fontSize: 112, lineHeight: 1, color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>{txt}<span style={{ fontSize: 46, color: "#4D8ED9", marginLeft: 10 }}>MIN</span></div>
    </div>
  );
};
const Year = ({ at, out, x, y }) => {
  if (!COUNTERS) return null;   // rev 6: panels off (label_style.ts)
  const f = useCurrentFrame();
  const kIn = easeOut(f, at, at + 14), kOut = ease(f, out, out + 10);
  const vis = kIn * (1 - kOut);
  if (vis <= 0.001) return null;
  const yr = Math.round(1990 + 13 * easeOut(f, at + 1, at + 16));
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, ${(1 - kIn) * 22 - kOut * 14}px) scale(${0.94 + 0.06 * kIn})`, opacity: vis,
      background: CHIP_BG, borderRadius: 14, padding: "14px 30px 16px", boxShadow: "0 10px 40px rgba(0,8,20,0.5)", textAlign: "center", borderLeft: "5px solid #4D8ED9" }}>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: "#B3CEEF", textTransform: "uppercase", marginBottom: 4 }}>Evart, Michigan</div>
      <div style={{ fontFamily: FIGURE, fontSize: 112, lineHeight: 1, color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>{yr}</div>
    </div>
  );
};
const BRO_TAG = { x: 715, y: 880 }, LOOP_Y = 540;
const Overlay = ({ f, P }) => {
  const t = T();
  const sign = P([FX - 0.05, 2.1, 3.3]);
  const bro = P(coverPt());
  const rule = P(rulePt());
  return (
    <>
      {/* the vignette is global (Main.tsx) */}
      {/* rev 2 tag audit: each fully in by its word (Tag at + 12, chips at + 14), read ≥ 36 f, pinned tags gone before the camera leaves
          their object (the flight through the window starts at read − 4) */}
      <Year at={t.y2003 - 14} out={t.store - 14} x={300} y={300} />{/* rev 5: upper LEFT — the hook's 9 YEARS now sits upper right and is still leaving */}
      <Tag text="His old store" at={t.store - 14} out={t.read - 12} x={110} y={960} to={sign.behind ? null : sign} />
      <Inset src={aud("photos/selbees_2shot.jpg")} credit="Photo: CBS News / 60 Minutes" at={t.jerry - 18} out={t.read + 6} x={80} y={300} w={920} h={518} pos="50% 35%" />
      <Tag text="Jerry & Marge Selbee" at={t.jerry - 14} out={t.read + 4} x={80} y={836} />
      <Tag text="The brochure" at={t.brochure - 12} out={t.newG + 10} x={BRO_TAG.x} y={BRO_TAG.y} to={bro.behind ? null : bro} />
      <Tag text="New Michigan game" at={t.newG - 12} out={t.he - 4} x={110} y={360} />
      <Tag text="The loophole" at={t.loophole - 12} out={t.three + 8} x={60} y={LOOP_Y} to={rule.behind ? null : rule} />
      <Timer at={t.loophole - 1} land={t.three + 2} out={t.threeEnd - 7} x={540} y={330} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("whooshlong", t.in2003 + 4, 50, 0.45),   // rev 5: the slow glide down main street (fastest at its middle)
    cueAt("whooshsoft", Math.round((t.read - 4 + t.newG + 23) / 2) - 6, 30, 0.42), // rev 5: through the window, down onto the leaflet
    // rev 6: the leaflet's paper — the left flap opens over (newG − 2 … the midpoint of broOpen), the right one after it
    cueAt("ov_paper_unfold", t.newG + 1, 22, 0.32),
    cueAt("ov_paper_unfold", Math.round((t.newG - 2 + t.winfall + 6) / 2) + 1, 22, 0.28),
    cueAt("ee_click_click_01", t.loophole - 3, 6, 0.4),          // the highlighter's cap
    cueAt("ee_clock_clock_ticking_01", t.three - 10, 26, 0.38),   // rev 7: the kitchen timer's seconds rolling to 3:00
    cueAt("airwoosh", Math.round((IN(t).c0 + IN(t).c1) / 2) - 4, 24, 0.45)   // rev 5: the push into the diagram (fastest zoom at its middle)
  ];
};
export const ST = { id: "store", origin: O, from: 200, to: T().when + 2, light: { target: [7.5, 0, 2.4], shadowBox: 11, keyI: 1.9, fillI: 0.42 }, shots, Scene, Overlay, sfx };
