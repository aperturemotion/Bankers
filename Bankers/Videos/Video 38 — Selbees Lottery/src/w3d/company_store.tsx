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

// ── the road's frame (must equal st_road.tsx: ROAD_O, V and S(f) = V·(f − 1000)) ─────────────────────────────────────────────
export const ROAD_WORLD = [1200, 0, 0];
export const ROAD_V = 0.85;
export const roadS = (f) => ROAD_V * (f - 1000);
/** road design coords → world (st_road's ROT + ROAD_O) */
export const roadToWorld = (p) => [p[2] + ROAD_WORLD[0], p[1] + ROAD_WORLD[1], -p[0] + ROAD_WORLD[2]];
/** ground coords (gx, y, z) at frame f → world */
export const groundToWorld = (g, f) => roadToWorld([g[0] - roadS(f), g[1], g[2]]);
// the store's origin on the ground: the foot of its front window, interior toward +z (away from the road)
export const STORE = [78, 0.1, 11.5];   // a small store right off the shoulder, in a gap of road's pine belt (pines repeat every 48 m: x ≡ 30)
export const storeToGround = (p) => [STORE[0] + p[0], STORE[1] + p[1], STORE[2] + p[2]];

// ── the terminal's layout (store-local metres) ────────────────────────────────────────────────────────────────────────────
const CTR_Y = 0.95;                       // counter top
export const TERM = { pos: [0, CTR_Y, 1.56], ry: -0.22 };
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
const ticketTex = () => canvasTex("c2_slipticket", 384, 900, (c, w, h) => {
  c.fillStyle = "#F6F8FB"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#0E1724"; c.textAlign = "center";
  c.font = `800 46px ${BODY}`; c.fillText("LOTTERY", w / 2, 64);
  c.fillRect(24, 82, w - 48, 3);
  c.font = `800 58px ${BODY}`; c.fillText("WINFALL", w / 2, 150);
  c.font = `600 24px ${BODY}`; c.fillText("QUICK PICK", w / 2, 188);
  c.font = `500 28px "Liberation Mono", monospace`;
  ["A", "B", "C", "D", "E"].forEach((r, i) => {
    const y = 250 + i * 50; c.textAlign = "left"; c.fillText(r + ".", 26, y);
    const nums = Array.from({ length: 6 }, (_, k) => 1 + Math.floor(rnd(i * 6 + k + 501) * 46)).sort((a, b) => a - b);
    c.fillText(nums.map((n) => String(n).padStart(2, "0")).join(" "), 74, y);
  });
  c.textAlign = "center"; c.font = `600 24px ${BODY}`; c.fillText("5 PLAYS  •  1 DRAW", w / 2, 530);
  c.fillRect(24, 552, w - 48, 2);
  for (let k = 0; k < 60; k++) { const bw = 1 + Math.floor(rnd(k + 77) * 4); c.fillRect(30 + k * 5.4, 580, bw, 120); }
  c.font = `500 20px "Liberation Mono", monospace`; c.fillText("0417-28531-09 004126", w / 2, 730);
  c.font = `500 20px ${BODY}`; c.fillText("KEEP YOUR TICKET", w / 2, 780);
});
const keyAtlas = () => canvasTex("c2_keyatlas", 512, 512, (c, w, h) => {
  const labs = ["7", "8", "9", "CLR", "4", "5", "6", "CNCL", "1", "2", "3", "CHK", "0", "00", "QP", "ENTER"];
  c.fillStyle = "#3B4656"; c.fillRect(0, 0, w, h);
  labs.forEach((t, i) => {
    const x = (i % 4) * 128, y = Math.floor(i / 4) * 128;
    const g = c.createLinearGradient(0, y, 0, y + 128);
    const blue = t === "ENTER" || t === "QP";
    g.addColorStop(0, blue ? "#3D82D6" : "#DDE4EE"); g.addColorStop(1, blue ? "#2563B0" : "#B9C5D6");
    c.fillStyle = g; c.fillRect(x + 4, y + 4, 120, 120);
    c.fillStyle = blue ? "#FFFFFF" : "#16243A"; c.textAlign = "center"; c.font = `700 ${t.length > 2 ? 30 : 58}px ${BODY}`; c.fillText(t, x + 64, y + (t.length > 2 ? 76 : 86));
  });
});
const vfdTex = () => canvasTex("c2_vfd", 512, 160, (c, w, h) => {
  c.fillStyle = "#06121C"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#7FE0F2"; c.font = `600 46px "Liberation Mono", monospace`; c.textAlign = "center";
  c.fillText("PLAY WINFALL", w / 2, 70); c.fillText("THANK YOU", w / 2, 130);
  c.fillStyle = "rgba(0,0,0,0.35)"; for (let x = 0; x < w; x += 4) c.fillRect(x, 0, 1, h);
});
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
const keypadGeo = () => {
  const parts = [];
  for (let i = 0; i < 16; i++) {
    const col = i % 4, row = Math.floor(i / 4);
    const wide = col === 3;
    const g = new THREE.BoxGeometry(wide ? 0.034 : 0.026, 0.009, 0.022);
    const uv = g.attributes.uv;
    const u0 = (col * 128 + 6) / 512, u1 = (col * 128 + 122) / 512, v1 = 1 - (row * 128 + 6) / 512, v0 = 1 - (row * 128 + 122) / 512;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, 0.002, 0.002);    // the sides: the dark plastic corner of the atlas
    [[8, u0, v1], [9, u1, v1], [10, u0, v0], [11, u1, v0]].forEach(([k, u, v]) => uv.setXY(k, u, v));   // +y face
    g.translate(col * 0.032 + (wide ? 0.004 : 0), 0, row * 0.027);
    parts.push(g);
  }
  const m = mergeGeometries(parts); m.translate(-0.05, 0, -0.04); return m;
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
    slip: bentStrip(0.075, 0.15, 12, 1.5),
    cables: [
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-0.18, 0.05, -0.2], [-0.24, 0.03, -0.3], [-0.34, 0.012, -0.28], [-0.4, 0.012, -0.12], [-0.42, -0.02, -0.06]].map((p) => new THREE.Vector3(...p))), 24, 0.006, 6, false),
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-0.12, 0.04, -0.2], [-0.16, 0.012, -0.32], [-0.3, 0.01, -0.34], [-0.41, 0.012, -0.16], [-0.43, -0.02, -0.08]].map((p) => new THREE.Vector3(...p))), 24, 0.0045, 6, false),
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-0.24, 0.29, -0.17], [-0.25, 0.2, -0.2], [-0.24, 0.06, -0.21], [-0.22, 0.03, -0.24]].map((p) => new THREE.Vector3(...p))), 16, 0.004, 6, false)
    ]
  }), []);
  const T = useMemo(() => ({ on: scrOn(), end: scrEnded(), keys: keyAtlas(), ticket: ticketTex(), vfd: vfdTex(), slip: slipTex() }), []);
  const M = useMemo(() => ({
    shell: new THREE.MeshStandardMaterial({ color: "#2B3442", roughness: 0.42, metalness: 0.15 }),
    shellHi: new THREE.MeshStandardMaterial({ color: "#3A4658", roughness: 0.36, metalness: 0.2 }),
    black: new THREE.MeshStandardMaterial({ color: "#0B0F16", roughness: 0.5 }),
    rubber: new THREE.MeshStandardMaterial({ color: "#151A22", roughness: 0.8 }),
    trim: new THREE.MeshStandardMaterial({ color: "#8FA9C8", roughness: 0.3, metalness: 0.8 }),
    keys: new THREE.MeshStandardMaterial({ map: T.keys, roughness: 0.45 }),
    paper: new THREE.MeshStandardMaterial({ map: T.ticket, roughness: 0.55, side: THREE.DoubleSide, emissive: "#ffffff", emissiveMap: T.ticket, emissiveIntensity: 0.08 }),
    slip: new THREE.MeshStandardMaterial({ map: T.slip, roughness: 0.7, side: THREE.DoubleSide }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#0A1220", roughness: 0.08, metalness: 0, clearcoat: 1, transparent: true, opacity: 0.25, depthWrite: false })
  }), []);
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
      <mesh geometry={R.deck} material={M.shellHi} position={[0, 0.105, 0.115]} rotation-x={0.16} castShadow />
      <mesh geometry={R.keys} material={M.keys} position={[-0.11, 0.124, 0.1]} rotation-x={0.16} castShadow />
      <mesh position={[0, 0.06, 0.201]}><boxGeometry args={[0.46, 0.006, 0.002]} /><meshStandardMaterial color="#4D8ED9" emissive="#4D8ED9" emissiveIntensity={0.9 * (0.3 + 0.7 * scr)} /></mesh>
      <mesh position={[0.2, 0.03, 0.201]}><boxGeometry args={[0.008, 0.008, 0.002]} /><meshStandardMaterial color="#9CD0FF" emissive="#9CD0FF" emissiveIntensity={2} /></mesh>
      {/* the thermal printer on the right with its tear bar and the slip curling out */}
      <group position={[0.145, 0.135, -0.02]}>
        <mesh geometry={R.printer} material={M.shellHi} castShadow />
        <mesh position={[0, 0.041, 0.05]}><boxGeometry args={[0.1, 0.004, 0.012]} /><meshStandardMaterial color="#05080D" /></mesh>
        <mesh position={[0, 0.043, 0.058]}><boxGeometry args={[0.11, 0.003, 0.004]} /><primitive object={M.trim} attach="material" /></mesh>
        <mesh position={[0, 0.0415, -0.04]}><planeGeometry args={[0.12, 0.08]} /><meshStandardMaterial color="#3A4658" roughness={0.3} /></mesh>
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
        <mesh geometry={R.bezel} material={M.shell} castShadow />
        <mesh geometry={R.back} material={M.shellHi} position={[0, -0.01, -0.035]} castShadow />
        <mesh position={[0, -MON.h / 2 + 0.014, 0.0232]}><planeGeometry args={[0.07, 0.008]} /><meshStandardMaterial color="#8FA9C8" metalness={0.8} roughness={0.3} /></mesh>
        <mesh position={[0, 0, 0.0228]}><planeGeometry args={[MON.sw + 0.006, MON.sh + 0.006]} /><meshStandardMaterial color="#03060B" roughness={0.3} /></mesh>
        {scr > 0.005 && <mesh position={[0, 0, 0.0233]}><planeGeometry args={[MON.sw, MON.sh]} /><meshBasicMaterial map={T.on} transparent opacity={scr} toneMapped={false} /></mesh>}
        {endShow > 0.005 && <mesh position={[0, 0, 0.0234]}><planeGeometry args={[MON.sw, MON.sh]} /><meshBasicMaterial map={T.end} transparent opacity={endShow * (1 - scr)} toneMapped={false} /></mesh>}
        <mesh position={[0, 0, 0.0238]} material={M.glass}><planeGeometry args={[MON.sw, MON.sh]} /></mesh>
        {scr > 0.01 && <Glow position={[0, 0, 0.06]} size={0.7} color="#4D8ED9" opacity={0.28 * scr} />}
      </group>
      {/* the customer display on its pole, turned toward the shop floor */}
      <group position={[-0.26, 0, -0.17]}>
        <mesh position={[0, 0.17, 0]} material={M.trim} castShadow><cylinderGeometry args={[0.009, 0.009, 0.3, 10]} /></mesh>
        <group position={[0, 0.34, 0]} rotation-y={Math.PI - 0.6}>
          <mesh geometry={R.vfd} material={M.black} castShadow />
          <mesh position={[0, 0, 0.0205]}><planeGeometry args={[0.18, 0.056]} /><meshBasicMaterial map={T.vfd} toneMapped={false} /></mesh>
        </group>
      </group>
      {/* cables: power, network, the display's lead, to a grommet in the counter */}
      {R.cables.map((g, i) => <mesh key={i} geometry={g} material={i === 1 ? M.shellHi : M.rubber} />)}
      <mesh position={[-0.42, 0.002, -0.07]} rotation-x={-Math.PI / 2}><ringGeometry args={[0.012, 0.028, 20]} /><meshStandardMaterial color="#0B0F16" /></mesh>
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
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.08, -3.1]} receiveShadow><planeGeometry args={[16, 6.2]} /><meshStandardMaterial map={lot} roughness={0.6} metalness={0.1} /></mesh>
      <mesh position={[0, -0.02, -6.15]}><boxGeometry args={[16, 0.15, 0.2]} /><meshStandardMaterial color="#6D7B8E" roughness={0.85} /></mesh>
      <group position={[4.6, -0.1, -4.6]}>
        <mesh position={[0, 3.5, 0]}><cylinderGeometry args={[0.07, 0.1, 7, 8]} /><meshStandardMaterial color="#2A3648" metalness={0.5} roughness={0.5} /></mesh>
        <mesh position={[-0.6, 7.0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.05, 0.05, 1.2, 8]} /><meshStandardMaterial color="#2A3648" /></mesh>
        <mesh position={[-1.15, 6.92, 0]}><boxGeometry args={[0.5, 0.12, 0.25]} /><meshStandardMaterial color="#FFE9C4" emissive="#FFD49A" emissiveIntensity={2.5} /></mesh>
        <Glow position={[-1.15, 6.8, 0]} size={3.2} color="#FFC98A" opacity={0.45} />
      </group>
    </group>
  );
};
/** the whole store, in ground coordinates relative to STORE (the caller places it at gx − S(f)) */
export const Store = ({ f, t }) => {
  const glow = 1 - 0.55 * ease(f, t.ended, t.ended + 8);
  const inside = 1 - ease(f, 1078, 1092);
  return (
    <group position={[STORE[0], STORE[1], STORE[2]]}>
      <Room />
      <Counter />
      <Terminal f={f} t={t} />
      <LotterySign glow={glow} />
      {/* the shop's own light: a cool overhead over the counter (only while the camera is in here) */}
      {/* (they fade out once the camera is through the window, and never reach the road: distance 9 m / 4 m, the car passes ≥ 13 m away) */}
      <pointLight position={[0.6, 2.85, 2.4]} intensity={6 * inside} distance={9} decay={2} color="#E4EEFF" />
      <pointLight position={[-0.6, 1.6, 0.6]} intensity={1.5 * inside} distance={4} decay={2} color="#9CC0EC" />
    </group>
  );
};
