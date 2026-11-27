// @ts-nocheck
// ★ V38 rev 2 (builder E) — THE STORE: a Michigan convenience store at night, mid-2000s, beside the interstate (Timur, 2026-11-26:
//   "replace the x-rayed glass box with a real in-store lottery terminal … as detailed as possible").
//   Built in METRES in the road's design frame (x = the car's heading, z = to its right, y up), standing on the GROUND: the road
//   station scrolls its world past a car that holds at its origin, so a thing that stands still on the ground sits at road-local
//   x = gx − S(f). Everything here is placed by gx and drawn at gx − S(f), the camera too while it is inside, so the store, the lot,
//   the pines and the road's lines all stand still relative to each other and the sedan really drives past the window.
//   The counter terminal: a sloped graphite base with a keypad, a thermal ticket printer printing a WinFall slip, a tilted 12-inch
//   touch monitor ("WINFALL ROLL-DOWN DRAW", the drawn numbers, touch keys), a play-slip reader with a slip in its throat, a
//   customer display on a pole, cables to a grommet; an instant-ticket case, a play-slip holder; a backlit LOTTERY sign above.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { canvasTex, rnd, ease, clamp01, Glow } from "./kit";
import { BODY, FIGURE } from "./fonts3d";
import { drawTicket } from "./ticket_art";
import { S, V } from "./road_drive";
import { billFaceMat } from "./money";
import { AO, Cast } from "./company_ao";

// ── the road's frame (must equal st_road.tsx: ROAD_O, and its ground scroll S(f), road_drive.ts) ──────────────────────────────
// rev 5 (builder R): the scroll is the car's DRIVE now (road_drive.ts): 0 while it stands parked in this store's lot, then an eased
//   pull-away to cruising speed — the store stands still in the picture while the camera is in it
export const ROAD_WORLD = [1200, 0, 0];
export const ROAD_V = V;
export const roadS = (f) => S(f);
/** road design coords → world (st_road's ROT + ROAD_O) */
export const roadToWorld = (p) => [p[2] + ROAD_WORLD[0], p[1] + ROAD_WORLD[1], -p[0] + ROAD_WORLD[2]];
/** ground coords (gx, y, z) at frame f → world */
export const groundToWorld = (g, f) => roadToWorld([g[0] - roadS(f), g[1], g[2]]);
// the store's origin on the ground: the foot of its front window, interior toward +z (away from the road)
export const STORE = [78, 0.1, 11.5];   // a small store right off the shoulder, in a gap of road's pine belt (pines repeat every 48 m: x ≡ 30)
export const storeToGround = (p) => [STORE[0] + p[0], STORE[1] + p[1], STORE[2] + p[2]];

// ── the terminal's layout (store-local metres) ────────────────────────────────────────────────────────────────────────────
const CTR_Y = 0.95;                       // counter top
// rev 5 (Timur, 37 s: "the cash register … not that detailed and it has no shadow"): the terminal now stands on its CASH DRAWER (a real
//   counter register: steel till under the terminal), so the whole unit rises by the drawer's height; every solve reads TERM/SCREEN
export const DRAWER_H = 0.1;
export const TERM = { pos: [0, CTR_Y + DRAWER_H, 1.56], ry: -0.22 };
const MON = { pos: [-0.05, 0.31, -0.1], tilt: -0.34, w: 0.34, h: 0.272, sw: 0.288, sh: 0.216 };
const termMat = () => { const o = new THREE.Object3D(); o.position.set(...TERM.pos); o.rotation.y = TERM.ry; o.updateMatrixWorld(true); return o; };
/** the screen's centre / its unit axes (store-local) */
export const SCREEN = (() => {
  const o = termMat();
  const m = new THREE.Object3D(); m.position.set(...MON.pos); m.rotation.x = MON.tilt; o.add(m); o.updateMatrixWorld(true);
  const c = new THREE.Vector3(0, 0, 0.0235).applyMatrix4(m.matrixWorld);
  const n = new THREE.Vector3(0, 0, 1).transformDirection(m.matrixWorld);
  const ax = new THREE.Vector3(1, 0, 0).transformDirection(m.matrixWorld);
  const ay = new THREE.Vector3(0, 1, 0).transformDirection(m.matrixWorld);
  return { c: [c.x, c.y, c.z], n: [n.x, n.y, n.z], ax: [ax.x, ax.y, ax.z], ay: [ay.x, ay.y, ay.z] };
})();
// the screen canvas (1024 × 768) and the place of its title word (the matched cut lands on it)
export const SCR_W = 1024, SCR_H = 768;
export const SCR_WORD = { x: 512, y: 150, w: 520 };   // "WINFALL": centre of its cap height, width in canvas px
/** store-local point of a screen canvas px */
export const screenPt = (px, py) => {
  const u = (px / SCR_W - 0.5) * MON.sw, v = (0.5 - py / SCR_H) * MON.sh;
  return [SCREEN.c[0] + SCREEN.ax[0] * u + SCREEN.ay[0] * v, SCREEN.c[1] + SCREEN.ax[1] * u + SCREEN.ay[1] * v, SCREEN.c[2] + SCREEN.ax[2] * u + SCREEN.ay[2] * v];
};
export const WORD_K = 0.25;   // a fitted word's font size = WORD_K × its width (the chalk heading uses the same, so the glyphs match)
/** draw `text` (italic 800 BODY) fitted exactly to width w, centred on (x, y = middle of its cap height) */
export const fitWord = (c, text, x, y, w) => {
  const size = w * WORD_K;
  c.font = `italic 800 ${size}px ${BODY}`; c.textAlign = "center"; c.textBaseline = "alphabetic";
  const m = c.measureText(text).width;
  c.save(); c.translate(x, y + size * 0.35); c.scale(w / m, 1); c.fillText(text, 0, 0); c.restore();
};

// ── textures ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
const BALLS = [4, 11, 19, 23, 36, 42];
const scrOn = () => canvasTex("c2_scr_on", SCR_W, SCR_H, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#0B2A55"); g.addColorStop(1, "#04142E"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  // the top status bar
  c.fillStyle = "#04193A"; c.fillRect(0, 0, w, 44);
  c.fillStyle = "#B3CEEF"; c.font = `600 22px ${BODY}`; c.textAlign = "left"; c.fillText("LOTTERY TERMINAL", 18, 30);
  c.textAlign = "right"; c.fillText("ONLINE", w - 46, 30); c.fillStyle = "#7FB4F2"; c.beginPath(); c.arc(w - 26, 23, 8, 0, Math.PI * 2); c.fill();
  // the title (the matched word)
  c.fillStyle = "#FFFFFF"; fitWord(c, "WINFALL", SCR_WORD.x, SCR_WORD.y, SCR_WORD.w);
  c.fillStyle = "#B3CEEF"; c.font = `700 34px ${BODY}`; c.textAlign = "center"; c.textBaseline = "alphabetic";
  const t = "ROLL-DOWN DRAW"; let x = w / 2 - (c.measureText(t).width + 13 * 6) / 2; c.textAlign = "left"; [...t].forEach((ch) => { c.fillText(ch, x, 268); x += c.measureText(ch).width + 6; });
  // the drawn numbers
  c.textAlign = "center"; c.fillStyle = "#DCE8FA"; c.font = `600 22px ${BODY}`; c.fillText("DRAWN NUMBERS", w / 2, 318);
  BALLS.forEach((n, k) => {
    const bx = w / 2 - 275 + k * 110, by = 392;
    const bg = c.createRadialGradient(bx - 14, by - 16, 4, bx, by, 46); bg.addColorStop(0, "#FFFFFF"); bg.addColorStop(0.7, "#D7E6F8"); bg.addColorStop(1, "#8FB1D9");
    c.fillStyle = bg; c.beginPath(); c.arc(bx, by, 44, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#4D8ED9"; c.lineWidth = 4; c.beginPath(); c.arc(bx, by, 30, 0, Math.PI * 2); c.stroke();
    c.fillStyle = "#0B2547"; c.font = `400 40px ${FIGURE}`; c.fillText(String(n).padStart(2, "0"), bx, by + 14);
  });
  // a note and the touch keys
  c.fillStyle = "#DCE8FA"; c.font = `500 24px ${BODY}`; c.fillText("NO JACKPOT WINNER  —  PRIZES ROLL DOWN", w / 2, 488);
  const keys = ["QUICK PICK", "PLAY SLIP", "CHECK TICKET", "REPRINT", "MENU"];
  keys.forEach((k, i) => {
    const kx = 22 + i * 198, ky = 560, kw = 184, kh = 96;
    const kg = c.createLinearGradient(0, ky, 0, ky + kh); kg.addColorStop(0, "#2A6BB8"); kg.addColorStop(1, "#164C8E");
    c.fillStyle = kg; c.beginPath(); c.roundRect(kx, ky, kw, kh, 12); c.fill();
    c.strokeStyle = "rgba(179,206,239,0.7)"; c.lineWidth = 2; c.stroke();
    c.fillStyle = "#FFFFFF"; c.font = `700 23px ${BODY}`; c.fillText(k, kx + kw / 2, ky + 58);
  });
  c.fillStyle = "#04193A"; c.fillRect(0, h - 54, w, 54);
  c.fillStyle = "#9FBEE6"; c.font = `500 21px ${BODY}`; c.textAlign = "left"; c.fillText("TOUCH A GAME TO BEGIN", 18, h - 20);
  c.textAlign = "right"; c.fillText("DRAW RESULTS", w - 18, h - 20);
});
const scrEnded = () => canvasTex("c2_scr_end", SCR_W, SCR_H, (c, w, h) => {
  c.fillStyle = "#050B16"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#0B1A30"; c.fillRect(0, 0, w, 44);
  c.fillStyle = "#5E7FA8"; c.font = `600 22px ${BODY}`; c.textAlign = "left"; c.fillText("LOTTERY TERMINAL", 18, 30);
  c.fillStyle = "#4C6A92"; fitWord(c, "WINFALL", SCR_WORD.x, SCR_WORD.y, SCR_WORD.w);
  c.strokeStyle = "#D93A3A"; c.lineWidth = 6; c.beginPath(); c.roundRect(w / 2 - 330, 300, 660, 150, 14); c.stroke();
  c.fillStyle = "#F2F7FD"; c.font = `800 92px ${BODY}`; c.textAlign = "center"; c.fillText("GAME ENDED", w / 2, 408);
  c.fillStyle = "#9FB3CC"; c.font = `500 28px ${BODY}`; c.fillText("THIS GAME IS NO LONGER ON SALE", w / 2, 520);
});
const signTex = () => canvasTex("c2_lotsign", 1024, 300, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#1C63C0"); g.addColorStop(1, "#0D4592"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = "rgba(255,255,255,0.85)"; c.lineWidth = 8; c.beginPath(); c.roundRect(14, 14, w - 28, h - 28, 22); c.stroke();
  c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.font = `800 150px ${BODY}`;
  let x = w / 2 - (c.measureText("LOTTERY").width + 6 * 14) / 2; c.textAlign = "left"; [..."LOTTERY"].forEach((ch) => { c.fillText(ch, x, 178); x += c.measureText(ch).width + 14; });
  c.textAlign = "center"; c.fillStyle = "#CFE2FA"; c.font = `700 44px ${BODY}`; c.fillText("PLAY HERE", w / 2, 252);
});
// the slip the terminal prints: the house WINFALL draw ticket (ticket_art.ts)
const ticketTex = () => canvasTex("c2_slipticket_v4", 384, 900, (c, w, h) => drawTicket(c, w, h, { seed: 2 }));
// rev 5: a real register keyboard — 5 × 5 keycaps with printed legends (numbers, the lottery keys, the register's tender keys)
const KEYS = [["CLR", "7", "8", "9", "VOID"], ["QTY", "4", "5", "6", "QP"], ["PLU", "1", "2", "3", "CHECK"], ["PAID OUT", "0", "00", ".", "SUB TOTAL"], ["NO SALE", "CANCEL", "REPRINT", "CREDIT", "CASH"]];
const KC = 200, KO = 12;   // atlas cell, margin
const keyAtlas = () => canvasTex("c5_keyatlas", 1024, 1024, (c, w, h) => {
  c.fillStyle = "#3B4656"; c.fillRect(0, 0, w, h);
  KEYS.forEach((row, r) => row.forEach((t, k) => {
    const x = KO + k * KC, y = KO + r * KC;
    const blue = t === "CASH" || t === "QP", fn = !/^[0-9.]+$/.test(t) && !blue, red = t === "VOID" || t === "CLR";
    const g = c.createLinearGradient(0, y, 0, y + KC);
    g.addColorStop(0, blue ? "#4A8EE0" : red ? "#C9D2DE" : fn ? "#9AA8BB" : "#E6ECF3"); g.addColorStop(1, blue ? "#2563B0" : red ? "#A9B5C5" : fn ? "#7C8BA0" : "#C2CDDB");
    c.fillStyle = g; c.beginPath(); c.roundRect(x + 6, y + 6, KC - 12, KC - 12, 22); c.fill();
    c.strokeStyle = "rgba(255,255,255,0.45)"; c.lineWidth = 3; c.beginPath(); c.roundRect(x + 10, y + 10, KC - 20, KC - 20, 18); c.stroke();
    c.fillStyle = blue ? "#FFFFFF" : red ? "#B0262B" : "#16243A"; c.textAlign = "center"; c.textBaseline = "middle";
    const words = t.split(" ");
    if (words.length > 1) { c.font = `800 40px ${BODY}`; words.forEach((wd, i) => c.fillText(wd, x + KC / 2, y + KC / 2 + (i - (words.length - 1) / 2) * 46)); }
    else { c.font = `800 ${t.length > 3 ? 44 : t.length > 2 ? 56 : t.length > 1 ? 84 : 104}px ${t.length > 2 ? BODY : FIGURE}`; c.fillText(t, x + KC / 2, y + KC / 2 + 4); }
  }));
});
// the customer pole display (a 2 × 20 vacuum-fluorescent display) shows the sale: one WinFall play, $1 (FACTCHECK: Michigan $1 a play)
const vfdLines = (c, w, h, l1, l2) => {
  c.fillStyle = "#04100F"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#7FF0E0"; c.font = `700 58px "Liberation Mono", "DejaVu Sans Mono", monospace`; c.textAlign = "left"; c.textBaseline = "alphabetic";
  c.shadowColor = "rgba(127,240,224,0.8)"; c.shadowBlur = 10;
  c.fillText(l1, 26, 92); c.fillText(l2, 26, 184);
  c.shadowBlur = 0; c.fillStyle = "rgba(0,0,0,0.4)"; for (let x = 0; x < w; x += 5) c.fillRect(x, 0, 1, h); for (let y = 0; y < h; y += 5) c.fillRect(0, y, w, 1);
};
const vfdTex = () => canvasTex("c5_vfd", 768, 216, (c, w, h) => vfdLines(c, w, h, "WINFALL  1 @  $1.00", "TOTAL         $1.00"));
const vfdEndTex = () => canvasTex("c5_vfd_end", 768, 216, (c, w, h) => vfdLines(c, w, h, "WINFALL     CLOSED", "NO SALE       $0.00"));
// brand-free rating / model plates (engraved aluminium) and a contact-shadow blob
const plateTex = (key, l1, l2) => canvasTex(key, 512, 128, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#C9D3DF"); g.addColorStop(1, "#97A6BA"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 2) { c.fillStyle = `rgba(255,255,255,${0.04 + rnd(x) * 0.06})`; c.fillRect(x, 0, 1, h); }   // brushed
  c.strokeStyle = "#1B2A40"; c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12);
  c.fillStyle = "#1B2A40"; c.textAlign = "center"; c.font = `800 38px ${BODY}`; c.fillText(l1, w / 2, 56); c.font = `600 26px ${BODY}`; c.fillText(l2, w / 2, 98);
  c.fillStyle = "#5E6E84"; [[16, 16], [w - 16, 16], [16, h - 16], [w - 16, h - 16]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.fill(); });
});
const blobTex = () => canvasTex("c5_blob", 128, 128, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, w * 0.18, w / 2, h / 2, w * 0.5); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.55, "rgba(255,255,255,0.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
/** a soft contact shadow lying on a surface (an AO blob under a thing that stands on it) */
export const Contact = ({ position, size, opacity = 0.6, ry = 0 }) => {
  const t = useMemo(blobTex, []);
  return <mesh position={position} rotation-x={-Math.PI / 2} rotation-z={ry}><planeGeometry args={size} /><meshBasicMaterial color="#000610" alphaMap={t} transparent opacity={opacity} depthWrite={false} /></mesh>;
};
const instantTex = () => canvasTex("c2_instant", 1024, 512, (c, w, h) => {
  c.fillStyle = "#0B1626"; c.fillRect(0, 0, w, h);
  const games = [["LUCKY 7s", "$1", "#2F78D0"], ["BINGO", "$2", "#3BA0C8"], ["GOLD RUSH", "$5", "#C9A24A"], ["CROSSWORD", "$3", "#5C7FB8"], ["TRIPLE CASH", "$2", "#2E5E9E"], ["HOT DICE", "$1", "#8A5CB8"], ["WILD CHERRY", "$1", "#C04A60"], ["MONEY BAG", "$10", "#3F8A6A"]];
  games.forEach(([n, p, col], i) => {
    const x = (i % 4) * 256 + 8, y = Math.floor(i / 4) * 256 + 8, tw = 240, th = 240;
    c.fillStyle = col; c.fillRect(x, y, tw, th);
    c.fillStyle = "rgba(255,255,255,0.18)"; for (let k = 0; k < 9; k++) c.fillRect(x, y + 20 + k * 26, tw, 6);
    c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.font = `800 34px ${BODY}`; c.fillText(n, x + tw / 2, y + 70, tw - 20);
    c.font = `400 86px ${FIGURE}`; c.fillText(p, x + tw / 2, y + 170);
    c.fillStyle = "#C0C8D4"; c.fillRect(x + 24, y + 186, tw - 48, 36);
    c.fillStyle = "#4B5566"; c.font = `700 20px ${BODY}`; c.fillText("SCRATCH HERE", x + tw / 2, y + 211);
  });
});
const slipTex = () => canvasTex("c2_playslip", 400, 640, (c, w, h) => {
  c.fillStyle = "#F4F6FA"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#1C63C0"; c.fillRect(0, 0, w, 70);
  c.fillStyle = "#FFFFFF"; c.font = `800 40px ${BODY}`; c.textAlign = "center"; c.fillText("WINFALL", w / 2, 50);
  c.fillStyle = "#1C63C0"; c.font = `700 18px ${BODY}`; c.fillText("PLAY SLIP  —  MARK 6 NUMBERS", w / 2, 98);
  c.strokeStyle = "rgba(28,99,192,0.75)"; c.lineWidth = 1.5; c.font = `600 15px ${BODY}`;
  for (let i = 0; i < 40; i++) { const x = 34 + (i % 8) * 47, y = 132 + Math.floor(i / 8) * 54; c.strokeRect(x - 16, y - 18, 32, 30); c.fillStyle = "rgba(28,99,192,0.85)"; c.fillText(String(i + 1), x, y + 3); }
  c.fillStyle = "#0E1724"; [3, 12, 21, 30].forEach((i) => { const x = 34 + (i % 8) * 47, y = 132 + Math.floor(i / 8) * 54; c.fillRect(x - 12, y - 14, 24, 22); });
  c.fillStyle = "#1C63C0"; c.font = `700 17px ${BODY}`; c.fillText("QUICK PICK  □     5 PLAYS  □", w / 2, 450);
  c.fillStyle = "#0E1724"; for (let k = 0; k < 22; k++) c.fillRect(8, 160 + k * 21, 10, 7);
});
const lamTex = () => { const t = canvasTex("c2_laminate", 512, 256, (c, w, h) => {
  c.fillStyle = "#7E8DA3"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 7000; i++) { const k = rnd(i + 9); c.fillStyle = k < 0.4 ? "rgba(255,255,255,0.3)" : k < 0.7 ? "rgba(40,55,80,0.22)" : "rgba(120,140,170,0.3)"; c.fillRect(rnd(i * 3 + 1) * w, rnd(i * 5 + 2) * h, 2, 2); }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 1); return t; };
const lotTex = () => { const t = canvasTex("c2_lot", 1024, 512, (c, w, h) => {
  c.fillStyle = "#1A2434"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 20000; i++) { const g = 24 + rnd(i) * 40; c.fillStyle = `rgba(${g},${g + 8},${g + 20},0.35)`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  c.fillStyle = "rgba(232,238,246,0.42)"; for (let k = 0; k < 9; k++) c.fillRect(40 + k * 118, 150, 7, 362);   // stall lines
  c.fillStyle = "rgba(10,16,26,0.35)"; for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(100 + k * 170, 400 + 30 * rnd(k), 50, 20, 0, 0, Math.PI * 2); c.fill(); }   // oil stains
}); return t; };

// ── the terminal ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const KP = { px: 0.029, pz: 0.027, w: 0.025, d: 0.023, h: 0.0095 };
const keypadGeo = () => {
  const parts = [];
  for (let i = 0; i < 25; i++) {
    const col = i % 5, row = Math.floor(i / 5);
    const g = new THREE.BoxGeometry(KP.w, KP.h, KP.d);
    const uv = g.attributes.uv;
    const u0 = (KO + col * KC + 8) / 1024, u1 = (KO + col * KC + KC - 8) / 1024, v1 = 1 - (KO + row * KC + 8) / 1024, v0 = 1 - (KO + row * KC + KC - 8) / 1024;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, 0.002, 0.002);    // the sides: the dark plastic corner of the atlas
    [[8, u0, v1], [9, u1, v1], [10, u0, v0], [11, u1, v0]].forEach(([k, u, v]) => uv.setXY(k, u, v));   // +y face
    // a slight dish: the top's four corners a hair lower than its middle would need more verts; a 0.5 mm taper reads as a keycap
    const p = g.attributes.position; for (let k = 0; k < p.count; k++) if (p.getY(k) > 0) { p.setX(k, p.getX(k) * 0.9); p.setZ(k, p.getZ(k) * 0.9); }
    g.translate(col * KP.px, 0, row * KP.pz);
    parts.push(g);
  }
  const m = mergeGeometries(parts); m.translate(-2 * KP.px, 0, -2 * KP.pz); m.computeVertexNormals(); return m;
};
const bentStrip = (w, len, seg, bend) => {
  // a slip leaving the printer: rises out of the slot, then curls over toward the clerk
  const g = new THREE.PlaneGeometry(w, len, 1, seg);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = (p.getY(i) + len / 2) / len;      // 0 at the slot, 1 at the free end
    const a = bend * t * t;
    const s = t * len;
    p.setXYZ(i, p.getX(i), Math.sin(Math.PI / 2 - a) * s * 0.95 + 0, -(1 - Math.cos(Math.PI / 2 - a)) * 0 + Math.sin(a) * s * 0.55);
  }
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
  g.computeVertexNormals(); return g;
};
// rev 5 — THE TILL: the steel cash drawer the terminal stands on, open a hand's width toward the clerk: the bill compartments with
//   real $1 notes (money.tsx: the public-domain scan) under their chrome clips, the coin cups, the lock and the drawer's own plate
const TILL_OPEN = 0.17;
const BILL_W = 0.066, BILL_L = 0.156;
// rev 6: the drawer pops open on NO SALE after the game ends (the pole display reads NO SALE), with the bell (st_company sfx ov_drawer)
export const DRAWER_AT = 1076;
const tillOpen = (f) => { const k = clamp01((f - DRAWER_AT) / 6); return TILL_OPEN * (1 - Math.pow(1 - k, 3)) + 0.006 * Math.sin(Math.PI * clamp01((f - DRAWER_AT - 6) / 6)); };
const Till = ({ R, M, f, t }) => (
  <group position={[0, -DRAWER_H, 0]}>
    <mesh geometry={R.drawer} material={M.steel} position={[0, DRAWER_H / 2 - 0.002, 0]} castShadow receiveShadow />
    {[[-0.2, -0.17], [0.2, -0.17], [-0.2, 0.17], [0.2, 0.17]].map(([x, z], i) => <mesh key={"ft" + i} position={[x, 0.003, z]} material={M.tray}><cylinderGeometry args={[0.012, 0.012, 0.006, 12]} /></mesh>)}
    {/* the housing's side screws and the drawer's dark mouth */}
    {[-1, 1].flatMap((sd) => [-0.12, 0.12].map((z) => <mesh key={sd + "hs" + z} position={[sd * 0.2302, 0.05, z]} rotation-z={Math.PI / 2} material={M.screw}><cylinderGeometry args={[0.0042, 0.0042, 0.0015, 12]} /></mesh>))}
    <mesh position={[0, 0.048, 0.2085]} material={M.seam}><boxGeometry args={[0.448, 0.086, 0.002]} /></mesh>
    <group position={[0, 0, tillOpen(f)]}>
      {/* the drawer front: its panel, the seam round it, the lock, the finger pull, the plate */}
      <mesh geometry={R.dfront} material={M.steelHi} position={[0, 0.048, 0.212]} castShadow receiveShadow />
      <mesh position={[0, 0.0095, 0.214]} material={M.seam}><boxGeometry args={[0.3, 0.006, 0.012]} /></mesh>
      <group position={[0.17, 0.056, 0.2195]} rotation-x={Math.PI / 2}>
        <mesh material={M.chrome}><cylinderGeometry args={[0.0095, 0.0095, 0.004, 24]} /></mesh>
        <mesh position={[0, -0.0022, 0]} material={M.seam}><boxGeometry args={[0.0022, 0.001, 0.009]} /></mesh>
      </group>
      <mesh position={[-0.13, 0.058, 0.2195]} material={M.dplate}><planeGeometry args={[0.09, 0.0225]} /></mesh>
      {/* the tray: floor, walls, four bill compartments with clips, the coin cups in front */}
      <mesh position={[0, 0.012, 0]} material={M.tray} receiveShadow><boxGeometry args={[0.44, 0.004, 0.41]} /></mesh>
      {[-1, 1].map((sd) => <mesh key={"tw" + sd} position={[sd * 0.218, 0.045, 0]} material={M.tray} castShadow receiveShadow><boxGeometry args={[0.004, 0.07, 0.41]} /></mesh>)}
      {[-0.11, 0, 0.11].map((x) => <mesh key={"dv" + x} position={[x, 0.04, -0.03]} material={M.tray} castShadow receiveShadow><boxGeometry args={[0.003, 0.06, 0.34]} /></mesh>)}
      <mesh position={[0, 0.035, 0.145]} material={M.tray} castShadow receiveShadow><boxGeometry args={[0.436, 0.05, 0.003]} /></mesh>
      {[-0.165, -0.055, 0.055, 0.165].map((x, i) => (
        <group key={"bc" + i} position={[x, 0.014, 0.065]}>
          {/* a short stack of notes (face up), its top note the scan */}
          <mesh position={[0, 0.004 + i * 0.0006, -0.004]} material={M.roll} castShadow receiveShadow><boxGeometry args={[BILL_W, 0.006 + i * 0.0012, BILL_L]} /></mesh>
          <mesh position={[0.002 * (i - 1.5), 0.0072 + i * 0.0012, -0.002]} rotation-x={-Math.PI / 2} rotation-z={Math.PI / 2 + 0.03 * (i - 1.5)} material={M.bill}><planeGeometry args={[BILL_L, BILL_W]} /></mesh>
          {/* the spring clip: a chrome bar on two arms */}
          <mesh position={[0, 0.012 + i * 0.0012, 0.045]} rotation-z={Math.PI / 2} material={M.chrome} castShadow><cylinderGeometry args={[0.003, 0.003, 0.08, 10]} /></mesh>
          {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.04, 0.03, 0.09]} rotation-x={0.85} material={M.chrome}><boxGeometry args={[0.003, 0.003, 0.06]} /></mesh>)}
        </group>
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
        const x = -0.19 + k * 0.054;
        return (
          <group key={"cc" + k} position={[x, 0.014, 0.178]}>
            <mesh material={M.tray} castShadow receiveShadow><cylinderGeometry args={[0.024, 0.02, 0.003, 20]} /></mesh>
            {Array.from({ length: 2 + (k * 5) % 4 }, (_, j) => <mesh key={j} position={[0.004 * Math.sin(j * 2.1 + k), 0.003 + j * 0.0018, 0.004 * Math.cos(j * 1.7 + k)]} rotation-x={0.05 * Math.sin(j + k)} material={k < 2 ? M.copper : M.silver} castShadow><cylinderGeometry args={[k < 2 ? 0.0095 : k < 4 ? 0.0105 : k < 6 ? 0.0122 : 0.0153, k < 2 ? 0.0095 : k < 4 ? 0.0105 : k < 6 ? 0.0122 : 0.0153, 0.0016, 20]} /></mesh>)}
          </group>
        );
      })}
    </group>
  </group>
);
export const Terminal = ({ f, t }) => {
  const R = useMemo(() => ({
    base: new RoundedBoxGeometry(0.48, 0.1, 0.4, 3, 0.02),
    deck: new RoundedBoxGeometry(0.44, 0.03, 0.15, 2, 0.008),
    printer: new RoundedBoxGeometry(0.17, 0.08, 0.22, 3, 0.015),
    bezel: new RoundedBoxGeometry(MON.w, MON.h, 0.045, 3, 0.012),
    back: new RoundedBoxGeometry(0.22, 0.17, 0.05, 3, 0.02),
    vfd: new RoundedBoxGeometry(0.2, 0.075, 0.04, 2, 0.008),
    reader: new RoundedBoxGeometry(0.16, 0.06, 0.1, 2, 0.01),
    keys: keypadGeo(),
    drawer: new RoundedBoxGeometry(0.46, DRAWER_H - 0.004, 0.42, 2, 0.006),
    dfront: new RoundedBoxGeometry(0.452, DRAWER_H - 0.016, 0.014, 2, 0.004),
    cover: new THREE.CylinderGeometry(0.042, 0.042, 0.13, 24, 1, false, 0, Math.PI),
    slip: bentStrip(0.075, 0.15, 12, 1.5),
    cables: [
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-0.18, 0.05, -0.2], [-0.24, 0.03, -0.3], [-0.34, 0.012, -0.28], [-0.4, -0.07, -0.12], [-0.42, -0.12, -0.06]].map((p) => new THREE.Vector3(...p))), 24, 0.006, 6, false),
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-0.12, 0.04, -0.2], [-0.16, 0.012, -0.32], [-0.3, 0.01, -0.34], [-0.41, -0.07, -0.16], [-0.43, -0.12, -0.08]].map((p) => new THREE.Vector3(...p))), 24, 0.0045, 6, false),
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-0.24, 0.29, -0.17], [-0.25, 0.2, -0.2], [-0.24, 0.06, -0.21], [-0.23, -0.05, -0.25], [-0.22, -0.12, -0.27]].map((p) => new THREE.Vector3(...p))), 16, 0.004, 6, false)
    ]
  }), []);
  const T = useMemo(() => ({ on: scrOn(), end: scrEnded(), keys: keyAtlas(), ticket: ticketTex(), vfd: vfdTex(), vfdEnd: vfdEndTex(), slip: slipTex(),
    plate: plateTex("c5_plate_term", "RETAIL LOTTERY TERMINAL", "MODEL T-2  ·  120 V ~ 60 Hz  1.5 A  ·  S/N 04-118327"), dplate: plateTex("c5_plate_drawer", "CASH DRAWER", "5 BILL  ·  8 COIN  ·  24 V SOLENOID") }), []);
  const M = useMemo(() => ({
    shell: new THREE.MeshStandardMaterial({ color: "#2B3442", roughness: 0.42, metalness: 0.15 }),
    shellHi: new THREE.MeshStandardMaterial({ color: "#3A4658", roughness: 0.36, metalness: 0.2 }),
    black: new THREE.MeshStandardMaterial({ color: "#0B0F16", roughness: 0.5 }),
    rubber: new THREE.MeshStandardMaterial({ color: "#151A22", roughness: 0.8 }),
    trim: new THREE.MeshStandardMaterial({ color: "#8FA9C8", roughness: 0.3, metalness: 0.8 }),
    keys: new THREE.MeshStandardMaterial({ map: T.keys, roughness: 0.45 }),
    paper: new THREE.MeshStandardMaterial({ map: T.ticket, roughness: 0.55, side: THREE.DoubleSide, emissive: "#ffffff", emissiveMap: T.ticket, emissiveIntensity: 0.08 }),
    slip: new THREE.MeshStandardMaterial({ map: T.slip, roughness: 0.7, side: THREE.DoubleSide }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#0A1220", roughness: 0.08, metalness: 0, clearcoat: 1, transparent: true, opacity: 0.25, depthWrite: false }),
    // rev 5: the till and the small parts
    steel: new THREE.MeshStandardMaterial({ color: "#1E2733", roughness: 0.38, metalness: 0.55 }),
    steelHi: new THREE.MeshStandardMaterial({ color: "#2C394B", roughness: 0.3, metalness: 0.6 }),
    tray: new THREE.MeshStandardMaterial({ color: "#10161F", roughness: 0.7 }),
    screw: new THREE.MeshStandardMaterial({ color: "#7D8DA3", roughness: 0.25, metalness: 0.95 }),
    seam: new THREE.MeshBasicMaterial({ color: "#020407" }),
    chrome: new THREE.MeshStandardMaterial({ color: "#DCE6F2", roughness: 0.12, metalness: 1 }),
    silver: new THREE.MeshStandardMaterial({ color: "#C3CDD9", roughness: 0.3, metalness: 0.9 }),
    copper: new THREE.MeshStandardMaterial({ color: "#B07A55", roughness: 0.35, metalness: 0.85 }),
    roll: new THREE.MeshStandardMaterial({ color: "#EEF2F7", roughness: 0.6 }),
    smoke: new THREE.MeshPhysicalMaterial({ color: "#1A2A40", roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }),
    plate: new THREE.MeshStandardMaterial({ map: T.plate, roughness: 0.35, metalness: 0.6 }),
    dplate: new THREE.MeshStandardMaterial({ map: T.dplate, roughness: 0.35, metalness: 0.6 }),
    bill: billFaceMat()
  }), []);
  const vfdOn = f < t.ended + 4;
  // the screen: the draw runs; on "ended" it flickers to GAME ENDED; then its backlight dies as the camera leaves
  const alive = 1 - ease(f, t.ended, t.ended + 5);
  const flick = f >= t.ended - 2 && f < t.ended + 6 ? ([1, 0.35, 0.9, 0.2, 0.7, 0.25, 0.5, 0.2][Math.max(0, Math.min(7, Math.floor(f - (t.ended - 2))))]) : 1;
  const endShow = ease(f, t.ended + 2, t.ended + 10) * (1 - 0.88 * ease(f, t.gameEnd + 2, t.gameEnd + 22));
  const scr = alive * flick;
  // the slip prints out of the printer from the cut, done before "Michigan"
  const feed = easeFeed(f, t.cut2 + 2, t.cut2 + 26);
  return (
    <group position={TERM.pos} rotation-y={TERM.ry}>
      {/* base, the sloped keypad deck on the clerk side, a chrome trim line, feet */}
      <mesh geometry={R.base} material={M.shell} position={[0, 0.05, 0]} castShadow receiveShadow />
      <mesh position={[0, 0.002, 0]}><boxGeometry args={[0.44, 0.006, 0.36]} /><meshStandardMaterial color="#05080D" roughness={0.9} /></mesh>
      <Till R={R} M={M} f={f} t={t} />
      {/* the base's parting seam (top shell on the bottom tray), side vents, the brand-free rating plate */}
      {[[0, 0.036, 0.2005, 0.47, 0.0025, 0.002], [0, 0.036, -0.2005, 0.47, 0.0025, 0.002], [0.2405, 0.036, 0, 0.002, 0.0025, 0.39], [-0.2405, 0.036, 0, 0.002, 0.0025, 0.39]].map(([x, y, z, a, b, c], i) =>
        <mesh key={"sm" + i} position={[x, y, z]} material={M.seam}><boxGeometry args={[a, b, c]} /></mesh>)}
      {[-1, 1].map((sd) => [0, 1, 2, 3, 4, 5].map((k) => <mesh key={sd + "v" + k} position={[sd * 0.2408, 0.066, -0.1 + k * 0.03]} material={M.seam}><boxGeometry args={[0.002, 0.012, 0.018]} /></mesh>))}
      <mesh position={[0.1, 0.075, 0.2012]} material={M.plate}><planeGeometry args={[0.1, 0.025]} /></mesh>
      <mesh geometry={R.deck} material={M.shellHi} position={[0, 0.105, 0.115]} rotation-x={0.16} castShadow receiveShadow />
      {/* the deck's four screws and its key-well */}
      <group position={[0, 0.105, 0.115]} rotation-x={0.16}>
        {[[-0.205, -0.06], [0.205, -0.06], [-0.205, 0.06], [0.205, 0.06]].map(([x, z], i) => <mesh key={"sc" + i} position={[x, 0.0152, z]} material={M.screw}><cylinderGeometry args={[0.0045, 0.0045, 0.0015, 14]} /></mesh>)}
        {[[-0.205, -0.06], [0.205, -0.06], [-0.205, 0.06], [0.205, 0.06]].map(([x, z], i) => <mesh key={"sl" + i} position={[x, 0.0161, z]} rotation-y={0.6 + i} material={M.seam}><boxGeometry args={[0.007, 0.0006, 0.0012]} /></mesh>)}
        <mesh position={[-0.11, 0.0152, -0.015]} material={M.seam}><boxGeometry args={[0.152, 0.0008, 0.142]} /></mesh>
      </group>
      <mesh geometry={R.keys} material={M.keys} position={[-0.11, 0.124, 0.1]} rotation-x={0.16} castShadow receiveShadow />
      <mesh position={[0, 0.06, 0.201]}><boxGeometry args={[0.46, 0.006, 0.002]} /><meshStandardMaterial color="#4D8ED9" emissive="#4D8ED9" emissiveIntensity={0.9 * (0.3 + 0.7 * scr)} /></mesh>
      <mesh position={[0.2, 0.03, 0.201]}><boxGeometry args={[0.008, 0.008, 0.002]} /><meshStandardMaterial color="#9CD0FF" emissive="#9CD0FF" emissiveIntensity={2} /></mesh>
      {/* the thermal printer on the right with its tear bar and the slip curling out */}
      <group position={[0.145, 0.135, -0.02]}>
        <mesh geometry={R.printer} material={M.shellHi} castShadow receiveShadow />
        <mesh position={[0, 0.041, 0.05]}><boxGeometry args={[0.1, 0.004, 0.012]} /><meshStandardMaterial color="#05080D" /></mesh>
        <mesh position={[0, 0.043, 0.058]} material={M.chrome}><boxGeometry args={[0.11, 0.003, 0.004]} /></mesh>
        {/* the serrated tear bar's teeth */}
        {Array.from({ length: 18 }, (_, k) => <mesh key={"tb" + k} position={[-0.051 + k * 0.006, 0.0445, 0.0605]} rotation-z={Math.PI / 4} material={M.chrome}><boxGeometry args={[0.0022, 0.0022, 0.002]} /></mesh>)}
        {/* the clamshell cover's seam, the paper roll under a smoked window, the feed button and its LED */}
        <mesh position={[0, 0.0405, 0.012]} material={M.seam}><boxGeometry args={[0.15, 0.0012, 0.0015]} /></mesh>
        {[-1, 1].map((sd) => <mesh key={"cs" + sd} position={[sd * 0.0755, 0.0405, -0.045]} material={M.seam}><boxGeometry args={[0.0015, 0.0012, 0.115]} /></mesh>)}
        <mesh position={[0, 0.032, -0.045]} rotation-z={Math.PI / 2} material={M.roll} castShadow><cylinderGeometry args={[0.034, 0.034, 0.082, 28]} /></mesh>
        <mesh position={[0, 0.032, -0.045]} rotation-z={Math.PI / 2} material={M.black}><cylinderGeometry args={[0.009, 0.009, 0.084, 14]} /></mesh>
        <mesh geometry={R.cover} position={[0, 0.035, -0.045]} rotation-z={Math.PI / 2} rotation-y={Math.PI / 2} material={M.smoke} renderOrder={2} />
        <mesh position={[0.062, 0.0412, 0.03]} castShadow><boxGeometry args={[0.018, 0.005, 0.012]} /><meshStandardMaterial color="#C9D3DF" roughness={0.5} /></mesh>
        <mesh position={[0.062, 0.0425, 0.044]}><boxGeometry args={[0.004, 0.002, 0.004]} /><meshStandardMaterial color="#7FB4F2" emissive="#7FB4F2" emissiveIntensity={2.2} /></mesh>
        {feed > 0.01 && <mesh geometry={R.slip} material={M.paper} position={[0, 0.042, 0.05]} scale={[1, feed, feed]} castShadow />}
      </group>
      {/* the play-slip reader on the customer side, a slip in its throat */}
      <group position={[-0.1, 0.12, -0.2]} rotation-x={0.5}>
        <mesh geometry={R.reader} material={M.shell} castShadow />
        <mesh position={[0, 0.031, -0.01]}><boxGeometry args={[0.13, 0.003, 0.05]} /><meshStandardMaterial color="#05080D" /></mesh>
        <mesh position={[0, 0.035, -0.075]} rotation-x={-Math.PI / 2 + 0.25} material={M.slip}><planeGeometry args={[0.1, 0.16]} /></mesh>
      </group>
      {/* the monitor on its hinge arm, leaning back */}
      <mesh position={[MON.pos[0], 0.14, -0.15]} castShadow material={M.shell}><boxGeometry args={[0.12, 0.08, 0.06]} /></mesh>
      <mesh position={[MON.pos[0], 0.2, -0.165]} rotation-x={MON.tilt} castShadow material={M.shellHi}><boxGeometry args={[0.07, 0.16, 0.025]} /></mesh>
      <group position={MON.pos} rotation-x={MON.tilt}>
        <mesh geometry={R.bezel} material={M.shell} castShadow receiveShadow />
        <mesh geometry={R.back} material={M.shellHi} position={[0, -0.01, -0.035]} castShadow />
        {/* the back cover's vents and its four VESA screws */}
        {[0, 1, 2, 3, 4, 5, 6].map((k) => <mesh key={"mv" + k} position={[-0.06 + k * 0.02, 0.04, -0.0605]} material={M.seam}><boxGeometry args={[0.008, 0.05, 0.002]} /></mesh>)}
        {[[-0.05, -0.05], [0.05, -0.05], [-0.05, -0.0], [0.05, -0.0]].map(([x, y], i) => <mesh key={"ms" + i} position={[x, y - 0.02, -0.0605]} rotation-x={Math.PI / 2} material={M.screw}><cylinderGeometry args={[0.005, 0.005, 0.002, 12]} /></mesh>)}
        <mesh position={[0, -MON.h / 2 + 0.014, 0.0232]}><planeGeometry args={[0.07, 0.008]} /><meshStandardMaterial color="#8FA9C8" metalness={0.8} roughness={0.3} /></mesh>
        <mesh position={[0, 0, 0.0228]}><planeGeometry args={[MON.sw + 0.006, MON.sh + 0.006]} /><meshStandardMaterial color="#03060B" roughness={0.3} /></mesh>
        {scr > 0.005 && <mesh position={[0, 0, 0.0233]}><planeGeometry args={[MON.sw, MON.sh]} /><meshBasicMaterial map={T.on} transparent opacity={scr} toneMapped={false} /></mesh>}
        {endShow > 0.005 && <mesh position={[0, 0, 0.0234]}><planeGeometry args={[MON.sw, MON.sh]} /><meshBasicMaterial map={T.end} transparent opacity={endShow * (1 - scr)} toneMapped={false} /></mesh>}
        <mesh position={[0, 0, 0.0238]} material={M.glass}><planeGeometry args={[MON.sw, MON.sh]} /></mesh>
        {scr > 0.01 && <Glow position={[0, 0, 0.06]} size={0.7} color="#4D8ED9" opacity={0.28 * scr} />}
      </group>
      {/* the customer display on its pole, turned toward the shop floor */}
      <group position={[-0.26, 0, -0.17]}>
        <mesh position={[0, 0.17 - DRAWER_H / 2, 0]} material={M.trim} castShadow><cylinderGeometry args={[0.009, 0.009, 0.3 + DRAWER_H, 10]} /></mesh>
        <mesh position={[0, -DRAWER_H + 0.008, 0]} material={M.steel} castShadow receiveShadow><cylinderGeometry args={[0.045, 0.05, 0.016, 24]} /></mesh>
        <group position={[0, 0.34, 0]} rotation-y={Math.PI - 0.6}>
          <mesh geometry={R.vfd} material={M.black} castShadow />
          <mesh position={[0, 0, 0.0205]}><planeGeometry args={[0.18, 0.056]} /><meshBasicMaterial map={vfdOn ? T.vfd : T.vfdEnd} toneMapped={false} /></mesh>
          {/* rev 5: a two-sided pole display — the clerk reads the same sale on its back */}
          <mesh position={[0, 0, -0.0205]} rotation-y={Math.PI}><planeGeometry args={[0.18, 0.056]} /><meshBasicMaterial map={vfdOn ? T.vfd : T.vfdEnd} toneMapped={false} /></mesh>
        </group>
      </group>
      {/* cables: power, network, the display's lead, to a grommet in the counter */}
      {R.cables.map((g, i) => <mesh key={i} geometry={g} material={i === 1 ? M.shellHi : M.rubber} castShadow />)}
      <mesh position={[-0.42, -DRAWER_H + 0.002, -0.07]} rotation-x={-Math.PI / 2}><ringGeometry args={[0.012, 0.028, 20]} /><meshStandardMaterial color="#0B0F16" /></mesh>
    </group>
  );
};
const easeFeed = (f, a, b) => ease(f, a, b);

// ── the counter, the case, the sign, the room and the lot ──────────────────────────────────────────────────────────────────
const Counter = () => {
  const lam = useMemo(lamTex, []);
  const it = useMemo(instantTex, []), sl = useMemo(slipTex, []);
  return (
    <group>
      {/* the counter: laminate top with a rounded nosing, front panel, the clerk-side shelf */}
      <mesh position={[-0.3, CTR_Y - 0.02, 1.57]} castShadow receiveShadow><boxGeometry args={[2.8, 0.04, 0.72]} /><meshStandardMaterial map={lam} roughness={0.35} envMapIntensity={0.5} /></mesh>
      <mesh position={[-0.3, CTR_Y - 0.02, 1.93]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.02, 0.02, 2.8, 12]} /><meshStandardMaterial color="#8FA9C8" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[-0.3, (CTR_Y - 0.04) / 2, 1.24]} receiveShadow><boxGeometry args={[2.8, CTR_Y - 0.04, 0.05]} /><meshStandardMaterial color="#2F4A6E" roughness={0.6} /></mesh>
      <mesh position={[-0.3, 0.45, 1.6]} receiveShadow><boxGeometry args={[2.7, 0.03, 0.6]} /><meshStandardMaterial color="#1B2A40" roughness={0.7} /></mesh>
      {/* the instant-ticket case (acrylic, the tickets behind it) */}
      <group position={[-0.62, CTR_Y, 1.45]} rotation-y={0.25}>
        <mesh position={[0, 0.16, 0]} castShadow><boxGeometry args={[0.56, 0.32, 0.2]} /><meshPhysicalMaterial color="#DCE8FA" transparent opacity={0.18} roughness={0.05} clearcoat={1} depthWrite={false} /></mesh>
        <mesh position={[0, 0.16, -0.06]}><planeGeometry args={[0.54, 0.28]} /><meshStandardMaterial map={it} roughness={0.5} emissive="#ffffff" emissiveMap={it} emissiveIntensity={0.12} /></mesh>
        <mesh position={[0, 0.005, 0]}><boxGeometry args={[0.58, 0.01, 0.22]} /><meshStandardMaterial color="#1B2A40" /></mesh>
      </group>
      {/* the play-slip holder */}
      <group position={[0.62, CTR_Y, 1.42]} rotation-y={-0.3}>
        <mesh position={[0, 0.07, 0]} castShadow><boxGeometry args={[0.12, 0.14, 0.05]} /><meshStandardMaterial color="#1C63C0" roughness={0.4} /></mesh>
        <mesh position={[0, 0.16, 0.01]} rotation-x={-0.15}><planeGeometry args={[0.1, 0.16]} /><meshStandardMaterial map={sl} roughness={0.7} side={THREE.DoubleSide} /></mesh>
      </group>
    </group>
  );
};
const LotterySign = ({ glow }) => {
  const tx = useMemo(signTex, []);
  return (
    <group position={[0.2, 1.66, 1.27]} rotation-y={-0.12}>
      {/* a topper on a pole from the counter (the terminal's lit sign) */}
      <mesh position={[0, -0.39, -0.01]}><cylinderGeometry args={[0.01, 0.01, 0.64, 10]} /><meshStandardMaterial color="#8FA9C8" metalness={0.8} roughness={0.3} /></mesh>
      <mesh position={[0, -0.695, -0.01]}><cylinderGeometry args={[0.05, 0.06, 0.03, 20]} /><meshStandardMaterial color="#2B3442" roughness={0.4} /></mesh>
      <mesh castShadow><boxGeometry args={[0.44, 0.135, 0.06]} /><meshStandardMaterial color="#C9D3DF" metalness={0.6} roughness={0.3} /></mesh>
      <mesh position={[0, 0, 0.031]}><planeGeometry args={[0.42, 0.123]} /><meshBasicMaterial map={tx} toneMapped={false} color={new THREE.Color(0.55 + 0.45 * glow, 0.55 + 0.45 * glow, 0.55 + 0.45 * glow)} /></mesh>
      <mesh position={[0, 0, -0.031]} rotation-y={Math.PI}><planeGeometry args={[0.42, 0.123]} /><meshBasicMaterial map={tx} toneMapped={false} /></mesh>
      <Glow position={[0, 0, 0.12]} size={0.8} color="#4D8ED9" opacity={0.3 * glow} />
    </group>
  );
};
const Room = () => {
  const wall = "#33465F", frame = "#9AAABF";
  const lot = useMemo(lotTex, []);
  const mullX = [-3.0, -0.55, 0.75, 3.0];   // two frame the terminal; the camera leaves through the pane at x ≈ −1.4
  const RW = 3.5, RD = 6;   // half-width, depth (a small store: only its front room is ever seen)
  return (
    <group>
      {/* floor, ceiling with troffers, side and back walls */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, RD / 2]} receiveShadow><planeGeometry args={[2 * RW, RD]} /><meshStandardMaterial color="#5C6B80" roughness={0.45} /></mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, 3.2, RD / 2]}><planeGeometry args={[2 * RW, RD]} /><meshStandardMaterial color="#C9D3DF" roughness={0.9} /></mesh>
      {[[-1.6, 2.0], [1.6, 2.0], [-1.6, 4.4], [1.6, 4.4]].map(([x, z], i) => <mesh key={i} rotation-x={Math.PI / 2} position={[x, 3.19, z]}><planeGeometry args={[1.2, 0.6]} /><meshBasicMaterial color="#EAF2FF" toneMapped={false} /></mesh>)}
      {[-RW, RW].map((x) => <mesh key={x} position={[x, 1.6, RD / 2]}><boxGeometry args={[0.2, 3.2, RD]} /><meshStandardMaterial color={wall} roughness={0.85} /></mesh>)}
      <mesh position={[0, 1.6, RD]}><boxGeometry args={[2 * RW, 3.2, 0.2]} /><meshStandardMaterial color={wall} roughness={0.85} /></mesh>
      {/* the front: bulkhead, storefront glass in aluminium frames (mid-rail), the header; the roof slab with a fascia */}
      <mesh position={[0, 0.22, -0.1]} receiveShadow><boxGeometry args={[2 * RW, 0.44, 0.2]} /><meshStandardMaterial color="#3D4F68" roughness={0.8} /></mesh>
      <mesh position={[0, 3.0, -0.1]}><boxGeometry args={[2 * RW, 0.5, 0.2]} /><meshStandardMaterial color={wall} roughness={0.85} /></mesh>
      {[-3.25, 3.25].map((x) => <mesh key={x} position={[x, 1.6, -0.1]}><boxGeometry args={[0.5, 3.2, 0.2]} /><meshStandardMaterial color={wall} roughness={0.85} /></mesh>)}
      {mullX.map((x) => <mesh key={x} position={[x, 1.6, -0.08]}><boxGeometry args={[0.07, 2.32, 0.12]} /><meshStandardMaterial color={frame} metalness={0.7} roughness={0.35} /></mesh>)}
      {[0.47, 1.18, 2.73].map((y) => <mesh key={y} position={[0, y, -0.08]}><boxGeometry args={[6.06, 0.07, 0.12]} /><meshStandardMaterial color={frame} metalness={0.7} roughness={0.35} /></mesh>)}
      <mesh position={[0, 1.6, -0.12]}><planeGeometry args={[6.0, 2.26]} /><meshPhysicalMaterial color="#9CC0EC" transparent opacity={0.12} envMapIntensity={1.2} roughness={0.04} clearcoat={1} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 3.4, RD / 2 - 0.3]}><boxGeometry args={[2 * RW + 0.4, 0.4, RD + 0.8]} /><meshStandardMaterial color="#1C2636" roughness={0.9} /></mesh>
      <mesh position={[0, 3.45, -0.72]}><boxGeometry args={[2 * RW + 0.4, 0.5, 0.06]} /><meshStandardMaterial color="#2A3E5C" roughness={0.6} /></mesh>
      {/* the lot outside, down to the road's shoulder: asphalt with stalls, the curb, a lamp post */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.097, -3.1]} receiveShadow><planeGeometry args={[16, 6.2]} /><meshStandardMaterial map={lot} roughness={0.6} metalness={0.1} /></mesh>
      <mesh position={[0, -0.02, -6.15]}><boxGeometry args={[16, 0.15, 0.2]} /><meshStandardMaterial color="#6D7B8E" roughness={0.85} /></mesh>
      <group position={[-5.2, -0.1, -5.6]} rotation-y={Math.PI}>   {/* rev 5: moved to the lot's far corner, out of the camera's way */}
        <mesh position={[0, 3.5, 0]}><cylinderGeometry args={[0.07, 0.1, 7, 8]} /><meshStandardMaterial color="#2A3648" metalness={0.5} roughness={0.5} /></mesh>
        <mesh position={[-0.6, 7.0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.05, 0.05, 1.2, 8]} /><meshStandardMaterial color="#2A3648" /></mesh>
        <mesh position={[-1.15, 6.92, 0]}><boxGeometry args={[0.5, 0.12, 0.25]} /><meshStandardMaterial color="#FFE9C4" emissive="#FFD49A" emissiveIntensity={2.5} /></mesh>
        <Glow position={[-1.15, 6.8, 0]} size={3.2} color="#FFC98A" opacity={0.45} />
      </group>
    </group>
  );
};
/** the whole store, in ground coordinates relative to STORE (the caller places it at gx − S(f)) */
// rev 5: the register's KEY — a cool spot from the ceiling troffer above-left of the clerk (behind the camera's shoulder), shadow-casting,
//   so the register throws its shadow across the counter to the right and toward the glass; soft contact shadows where things stand
const KEY_AT = [-1.7, 2.65, 2.25];
export const Store = ({ f, t }) => {
  const glow = 1 - 0.55 * ease(f, t.ended, t.ended + 8);
  const tgt = useMemo(() => { const o = new THREE.Object3D(); o.position.set(TERM.pos[0] + 0.05, CTR_Y, TERM.pos[2] - 0.05); return o; }, []);
  return (
    <group position={[STORE[0], STORE[1], STORE[2]]}>
      <Room />
      <Counter />
      <Terminal f={f} t={t} />
      <LotterySign glow={glow} />
      {/* contact shadows on the counter: under the register, the pole display's foot, the ticket case, the slip holder */}
      <Contact position={[0.01, CTR_Y + 0.0015, 1.58]} size={[0.6, 0.56]} opacity={0.75} ry={-TERM.ry} />
      <Contact position={[-0.62, CTR_Y + 0.0015, 1.45]} size={[0.66, 0.3]} opacity={0.5} ry={-0.25} />
      <Contact position={[0.62, CTR_Y + 0.0015, 1.42]} size={[0.18, 0.1]} opacity={0.55} ry={0.3} />
      <Contact position={[0.2, CTR_Y + 0.0015, 1.28]} size={[0.16, 0.16]} opacity={0.55} />
      {/* rev 6 fake shadows (Timur: "a dark subtle shape under it, the correct one"): the register's soft cast across the counter away from
          the store key, the counter's foot on the floor both sides, the shelf under the counter top, the room's floor corners, and
          outside: the storefront's foot, the curb and the lamp post on the lot */}
      <Cast p={[0.02, CTR_Y + 0.0012, 1.56]} w={0.5} d={0.44} h={0.55} toward={[KEY_AT[0] - 0.02, KEY_AT[1] - CTR_Y, KEY_AT[2] - 1.56]} o={0.3} />
      <AO p={[-0.3, 0.004, 1.03]} w={3.0} d={0.55} o={0.5} soft={0.6} />
      <AO p={[-0.3, 0.004, 2.04]} w={3.0} d={0.5} o={0.42} soft={0.6} />
      <AO p={[-0.3, 0.468, 1.6]} w={2.7} d={0.62} o={0.5} soft={0.5} />
      <AO p={[-3.3, 0.004, 3.0]} w={0.7} d={6.0} o={0.45} soft={0.7} />
      <AO p={[3.3, 0.004, 3.0]} w={0.7} d={6.0} o={0.45} soft={0.7} />
      <AO p={[0, 0.004, 5.75]} w={7.0} d={0.7} o={0.45} soft={0.7} />
      <AO p={[0, 0.004, 0.22]} w={6.6} d={0.5} o={0.4} soft={0.7} />
      <AO p={[0, -0.093, -0.42]} w={7.3} d={0.75} o={0.5} soft={0.6} />
      <AO p={[0, -0.093, -5.92]} w={16} d={0.45} o={0.45} soft={0.7} />
      <AO p={[-5.2, -0.093, -5.6]} w={0.75} d={0.75} o={0.6} soft={0.6} />
      <primitive object={tgt} />
      <spotLight position={KEY_AT} target={tgt} angle={0.42} penumbra={0.65} intensity={30} distance={8} decay={1.6} color="#D6E5FA" castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0002} shadow-normalBias={0.004} shadow-camera-near={0.8} shadow-camera-far={6} shadow-radius={3} />
      {/* the shop's fill: a cool overhead over the counter, a blue bounce from the glass */}
      <pointLight position={[0.6, 2.85, 2.4]} intensity={4.5} distance={9} decay={2} color="#CFE0FA" />
      <pointLight position={[-0.6, 1.6, 0.6]} intensity={1.6} distance={4} decay={2} color="#7FA9E6" />
    </group>
  );
};
