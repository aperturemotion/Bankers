// @ts-nocheck
// ★ V39 builder D — the PRINT and GLAZING of the Brattleboro set (d_bratt.tsx): real lettering for every sign (the hospital's name,
//   Brooks Memorial Library's name, the RONALD READ PAVILION letters, the monument signs, the book return, the blue H), and the
//   interiors seen through glass (the hospital lobby, the library's two floors of stacks, the pavilion's operating rooms and offices).
//   All drawn once on canvas with the house faces (Figtree), cached by key.
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { BODY } from "./fonts3d";

const pick = (a, r) => a[Math.floor(r * a.length) % a.length];
/** a single line of lettering on a transparent canvas: { tex, aspect } (aspect = width / height of the plane that shows it) */
export const letters = (key, text, { px = 150, weight = 600, color = "#FFFFFF", track = 0.08, fam = BODY, pad = 0.12 } = {}) => {
  const mc = document.createElement("canvas").getContext("2d");
  mc.font = `${weight} ${px}px ${fam}`; if ("letterSpacing" in mc) mc.letterSpacing = `${px * track}px`;
  const tw = Math.ceil(mc.measureText(text).width + px * track), H = Math.ceil(px * (1 + 2 * pad)), Wd = Math.min(2048, Math.ceil(tw + px * 2 * pad));
  const tex = canvasTex("d_lt_" + key, Wd, H, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.font = `${weight} ${px}px ${fam}`; if ("letterSpacing" in c) c.letterSpacing = `${px * track}px`;
    c.fillStyle = color; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(text, w / 2 + px * track / 2, h / 2 + px * 0.04, w - px * pad);
  });
  return { tex, aspect: Wd / H, capFrac: 0.72 / (1 + 2 * pad) };   // capFrac: the cap height as a fraction of the plane's height
};
/** the measured advance of each character of a line (for per-letter signs), in units of the font size */
export const advances = (text, { weight = 600, fam = BODY, track = 0.08 } = {}) => {
  const mc = document.createElement("canvas").getContext("2d");
  mc.font = `${weight} 100px ${fam}`;
  return [...text].map((ch) => mc.measureText(ch).width / 100 + track);
};
// ── the hospital lobby behind its entrance glass: a bright, cool-white hall, the information desk, chairs, a corridor ─────────
export const lobbyTex = () => canvasTex("d_lobby", 1024, 512, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#F4F7FB"); g.addColorStop(0.55, "#D9E1EA"); g.addColorStop(1, "#8D98A6");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let k = 0; k < 5; k++) { c.fillStyle = "rgba(255,255,255,0.95)"; c.fillRect(80 + k * 200, 18, 120, 12); }      // ceiling panels
  c.fillStyle = "#B7C2CF"; c.fillRect(0, 300, w, 8);
  c.fillStyle = "#6F7F94"; c.fillRect(410, 120, 200, 190);                                                     // the corridor beyond
  const cg = c.createLinearGradient(0, 120, 0, 310); cg.addColorStop(0, "#EEF3F9"); cg.addColorStop(1, "#AEB9C6"); c.fillStyle = cg; c.fillRect(425, 130, 170, 180);
  c.fillStyle = "#1F4E8C"; c.fillRect(380, 70, 260, 40); c.fillStyle = "#FFFFFF"; c.font = `700 26px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("INFORMATION", 510, 91);
  c.fillStyle = "#C9B08A"; c.fillRect(330, 330, 360, 90); c.fillStyle = "#E9E2D3"; c.fillRect(320, 320, 380, 16);  // the desk
  for (let k = 0; k < 6; k++) { const x = 60 + k * 50 + (k > 2 ? 620 : 0); c.fillStyle = "#2E5C8E"; c.fillRect(x, 380, 40, 40); c.fillRect(x, 350, 40, 30); c.fillStyle = "#1B2433"; c.fillRect(x + 4, 420, 4, 30); c.fillRect(x + 32, 420, 4, 30); }
  c.fillStyle = "#5C7A5E"; c.beginPath(); c.ellipse(900, 330, 40, 70, 0, 0, 7); c.fill(); c.fillStyle = "#3E4652"; c.fillRect(880, 380, 40, 50);   // a plant
  c.fillStyle = "rgba(255,255,255,0.25)"; c.fillRect(0, 440, w, 3);
});
// ── the library behind its glass: two floors — stacks with coloured spines, range ends, reading tables with lamps, a desk ──────
export const libInteriorTex = () => canvasTex("d_libint", 2048, 1024, (c, w, h) => {
  const floor = (y0, fh, seed, desk) => {
    const g = c.createLinearGradient(0, y0, 0, y0 + fh); g.addColorStop(0, "#F3E6CF"); g.addColorStop(0.6, "#D9C4A0"); g.addColorStop(1, "#7A6650");
    c.fillStyle = g; c.fillRect(0, y0, w, fh);
    for (let k = 0; k < 8; k++) { c.fillStyle = "rgba(255,252,240,0.95)"; c.fillRect(60 + k * 256, y0 + 10, 150, 9); const lg = c.createRadialGradient(135 + k * 256, y0 + 14, 4, 135 + k * 256, y0 + 30, 160); lg.addColorStop(0, "rgba(255,246,222,0.55)"); lg.addColorStop(1, "rgba(255,246,222,0)"); c.fillStyle = lg; c.fillRect(k * 256 - 40, y0, 360, 200); }
    // the back wall of shelves (spines)
    const sy = y0 + fh * 0.16, sh = fh * 0.5;
    c.fillStyle = "#5A4130"; c.fillRect(0, sy, w, sh);
    for (let r = 0; r < 5; r++) {
      const ry = sy + 6 + r * (sh - 8) / 5, rh = (sh - 8) / 5 - 6; let x = 4;
      while (x < w - 4) { const bw = 7 + rnd(seed + x * 0.37 + r * 91) * 9; c.fillStyle = pick(["#8A3E34", "#2E4F7A", "#C9B48A", "#4E6E5E", "#E2D6BE", "#6A4A7A", "#B07A3A", "#1F3554", "#A9563A", "#D8CDB4"], rnd(seed + x * 1.3 + r * 7)); c.fillRect(x, ry + rh * (0.08 + rnd(x + r) * 0.12), bw - 1.5, rh * (0.9 - rnd(x * 3 + r) * 0.12)); x += bw; }
      c.fillStyle = "#3E2C20"; c.fillRect(0, ry + rh, w, 6);
    }
    // range ends of the free-standing stacks (end panels with a small label), in perspective rows
    for (let k = 0; k < 7; k++) {
      const x = 120 + k * 290 + (seed % 2) * 60, top = y0 + fh * 0.2, bot = y0 + fh * 0.86;
      c.fillStyle = "#6E5038"; c.fillRect(x, top, 70, bot - top); c.fillStyle = "#8A6A4C"; c.fillRect(x + 6, top + 6, 58, bot - top - 12);
      c.fillStyle = "#F2EBDC"; c.fillRect(x + 12, top + 26, 46, 30); c.fillStyle = "#2A2A2A"; c.font = `700 12px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle";
      const lab = [["000", "199"], ["200", "399"], ["400", "599"], ["600", "699"], ["700", "799"], ["800", "899"], ["900", "999"]][k];
      c.fillText(lab[0], x + 35, top + 35); c.fillText(lab[1], x + 35, top + 49);
      c.fillStyle = "rgba(40,28,18,0.35)"; c.fillRect(x + 70, top + 10, 30, bot - top - 10);   // the stack running back (its shadowed side)
    }
    // reading tables with lamps
    for (let k = 0; k < 4; k++) {
      const x = 260 + k * 460, ty = y0 + fh * 0.78;
      c.fillStyle = "#7A5A3C"; c.fillRect(x, ty, 190, 14); c.fillStyle = "#4A3426"; c.fillRect(x + 12, ty + 14, 8, fh * 0.12); c.fillRect(x + 170, ty + 14, 8, fh * 0.12);
      for (const lx of [x + 50, x + 140]) { const lg = c.createRadialGradient(lx, ty - 12, 2, lx, ty, 70); lg.addColorStop(0, "rgba(255,240,200,0.9)"); lg.addColorStop(1, "rgba(255,230,180,0)"); c.fillStyle = lg; c.fillRect(lx - 70, ty - 80, 140, 100); c.fillStyle = "#2C4A3E"; c.beginPath(); c.moveTo(lx - 20, ty - 18); c.lineTo(lx + 20, ty - 18); c.lineTo(lx + 12, ty - 32); c.lineTo(lx - 12, ty - 32); c.fill(); c.fillStyle = "#3E2C20"; c.fillRect(lx - 2, ty - 18, 4, 18); }
      for (const cx of [x - 30, x + 200]) { c.fillStyle = "#3E4C62"; c.fillRect(cx, ty - 10, 26, 34); c.fillRect(cx, ty + 24, 26, 10); }
    }
    if (desk) {   // the circulation desk and its sign
      c.fillStyle = "#E9E2D3"; c.fillRect(1500, y0 + fh * 0.66, 420, 20); c.fillStyle = "#8A6A4C"; c.fillRect(1510, y0 + fh * 0.66 + 20, 400, fh * 0.2);
      c.fillStyle = "#1F3554"; c.fillRect(1560, y0 + fh * 0.26, 300, 46); c.fillStyle = "#FFFFFF"; c.font = `700 28px ${BODY}`; c.textAlign = "center"; c.fillText("CIRCULATION", 1710, y0 + fh * 0.26 + 24);
    }
    c.fillStyle = "rgba(60,44,30,0.35)"; c.fillRect(0, y0 + fh - 30, w, 30);
  };
  floor(0, h / 2, 11, false); floor(h / 2, h / 2, 37, true);
  c.fillStyle = "#3A3E46"; c.fillRect(0, h / 2 - 6, w, 12);
});
// ── the pavilion's operating-room floors behind their glass: cool white rooms, round surgical lights on arms, booms, cabinets ────
export const orTex = () => canvasTex("d_or", 1024, 256, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#F2FAFB"); g.addColorStop(0.6, "#CFE3E8"); g.addColorStop(1, "#7E9BA6");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let room = 0; room < 2; room++) {
    const x0 = room * 512;
    c.fillStyle = "#9FB8C0"; c.fillRect(x0 + 505, 0, 7, h);                                         // the wall between rooms
    c.fillStyle = "rgba(255,255,255,0.95)"; for (let k = 0; k < 3; k++) c.fillRect(x0 + 60 + k * 150, 8, 100, 8);   // ceiling panels
    for (const [lx, ly, r] of [[x0 + 210, 92, 34], [x0 + 300, 80, 26]]) {                          // the surgical lights on their arms
      c.strokeStyle = "#6E7F8A"; c.lineWidth = 6; c.beginPath(); c.moveTo(x0 + 255, 18); c.lineTo(lx, ly - r * 0.5); c.stroke();
      c.fillStyle = "#D8E2E8"; c.beginPath(); c.ellipse(lx, ly, r, r * 0.42, 0, 0, 7); c.fill();
      const lg = c.createRadialGradient(lx, ly + 6, 2, lx, ly + 30, 90); lg.addColorStop(0, "rgba(255,255,255,0.95)"); lg.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = lg; c.fillRect(lx - 90, ly, 180, 120);
    }
    c.fillStyle = "#5E7480"; c.fillRect(x0 + 200, 190, 130, 14); c.fillStyle = "#8FA3AE"; c.fillRect(x0 + 255, 204, 20, 40);   // the table
    c.fillStyle = "#3E5260"; c.fillRect(x0 + 40, 70, 70, 150); c.fillStyle = "#2B6E8E"; c.fillRect(x0 + 50, 82, 50, 34);         // a boom with a monitor
    c.fillStyle = "#B9C9D0"; c.fillRect(x0 + 380, 110, 110, 130); for (let k = 0; k < 3; k++) { c.fillStyle = "#93A9B3"; c.fillRect(x0 + 388, 120 + k * 40, 94, 30); }   // cabinets
  }
});
// ── the pavilion's office floor: warm-white rooms, blinds half down ──────────────────────────────────────────────────────────
export const officeTex = () => canvasTex("d_office", 1024, 256, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#F8F1E4"); g.addColorStop(1, "#B9A98E"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let k = 0; k < 8; k++) { c.fillStyle = "rgba(255,255,250,0.9)"; c.fillRect(30 + k * 128, 8, 70, 7); }
  for (let k = 0; k < 6; k++) { const x = 40 + k * 170; c.fillStyle = "#6A5A48"; c.fillRect(x, 180, 120, 10); c.fillStyle = "#2B3A4E"; c.fillRect(x + 30, 140, 50, 34); c.fillStyle = "#3E4C62"; c.fillRect(x + 40, 196, 30, 40); }
  for (let y = 0; y < h * 0.4; y += 9) { c.fillStyle = y % 18 ? "rgba(220,212,196,0.9)" : "rgba(190,180,160,0.9)"; c.fillRect(0, y, w, 7); }
});
// ── monument signs (stone panel on a brick base) ────────────────────────────────────────────────────────────────────────────
export const monumentTex = (key, lines, { bg = "#E8E4DA", ink = "#1E3554" } = {}) => canvasTex("d_mon_" + key, 1024, 384, (c, w, h) => {
  c.fillStyle = bg; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 6000; i++) { c.fillStyle = `rgba(80,80,90,${rnd(i) * 0.06})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  c.strokeStyle = "rgba(30,53,84,0.5)"; c.lineWidth = 4; c.strokeRect(20, 20, w - 40, h - 40);
  c.fillStyle = ink; c.textAlign = "center"; c.textBaseline = "alphabetic";
  lines.forEach((L) => { c.font = `${L.w ?? 700} ${L.px}px ${BODY}`; if ("letterSpacing" in c) c.letterSpacing = `${(L.track ?? 0.04) * L.px}px`; c.fillText(L.t, w / 2, L.y, w - 80); });
  if ("letterSpacing" in c) c.letterSpacing = "0px";
  if (lines.rule) { c.fillStyle = "#4D8ED9"; c.fillRect(w / 2 - 150, lines.rule, 300, 5); }
});
export const hospitalSignTex = () => { const l = [{ t: "BRATTLEBORO", px: 92, y: 140 }, { t: "MEMORIAL HOSPITAL", px: 76, y: 240 }, { t: "MAIN ENTRANCE", px: 38, w: 600, y: 320, track: 0.18 }]; l.rule = 270; return monumentTex("bmh", l); };
export const librarySignTex = () => { const l = [{ t: "BROOKS MEMORIAL", px: 84, y: 140 }, { t: "LIBRARY", px: 96, y: 245 }, { t: "BRATTLEBORO, VERMONT", px: 36, w: 600, y: 330, track: 0.18 }]; l.rule = 275; return monumentTex("brooks", l, { bg: "#DCD6C8", ink: "#2A2620" }); };
export const bookReturnTex = () => canvasTex("d_bookret", 512, 256, (c, w, h) => {
  c.fillStyle = "#24476E"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#16314F"; c.fillRect(60, 40, w - 120, 50); c.fillStyle = "#0A1626"; c.fillRect(80, 58, w - 160, 14);   // the slot
  c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `800 56px ${BODY}`; c.fillText("BOOK RETURN", w / 2, 150);
  c.font = `600 24px ${BODY}`; c.fillText("BOOKS · AUDIO · DVDs", w / 2, 205);
});
export const hSignTex = () => canvasTex("d_hsign", 256, 256, (c, w, h) => {
  c.fillStyle = "#1F5FB4"; c.fillRect(0, 0, w, h); c.strokeStyle = "#FFFFFF"; c.lineWidth = 8; c.strokeRect(12, 12, w - 24, h - 24);
  c.fillStyle = "#FFFFFF"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `800 190px ${BODY}`; c.fillText("H", w / 2, h / 2 + 10);
});
// concrete (fascia, slabs) and paving
export const concreteTex = () => { const t = canvasTex("d_concrete", 512, 512, (c, w, h) => { c.fillStyle = "#B9B6AE"; c.fillRect(0, 0, w, h); for (let i = 0; i < 14000; i++) { const g = 140 + rnd(i) * 70; c.fillStyle = `rgba(${g},${g},${g - 6},0.25)`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); } c.fillStyle = "rgba(60,60,60,0.25)"; c.fillRect(0, h / 2, w, 2); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
export const paverTex = () => { const t = canvasTex("d_paver", 512, 512, (c, w, h) => { c.fillStyle = "#7C8696"; c.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let k = 0; k < 4; k++) { const v = rnd(r * 9 + k) * 0.14 - 0.07; c.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; c.fillRect(k * 128 + (r % 2) * 64, r * 64, 128, 64); } c.fillStyle = "rgba(20,26,36,0.6)"; for (let r = 0; r <= 8; r++) c.fillRect(0, r * 64 - 1, w, 2); for (let r = 0; r < 8; r++) for (let k = 0; k <= 4; k++) c.fillRect(k * 128 + (r % 2) * 64 - 1, r * 64, 2, 64); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
export const asphaltTex = () => { const t = canvasTex("d_asphalt", 512, 512, (c, w, h) => { c.fillStyle = "#1a2433"; c.fillRect(0, 0, w, h); for (let i = 0; i < 12000; i++) { const g = 30 + rnd(i) * 40; c.fillStyle = `rgba(${g},${g + 8},${g + 20},${0.25 + rnd(i + 7) * 0.3})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
export const lawnTex = () => { const t = canvasTex("d_lawn", 512, 512, (c, w, h) => { c.fillStyle = "#142638"; c.fillRect(0, 0, w, h); for (let i = 0; i < 26000; i++) { const g = rnd(i) * 40; c.fillStyle = `rgba(${30 + g},${50 + g},${60 + g},0.25)`; c.fillRect(rnd(i + 3) * w, rnd(i + 4) * h, 1.5, 3); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
// a glass sheen: the sky's reflection darkening the pane toward the top, two faint diagonal streaks (normal blend over the interior)
export const sheenTex = () => canvasTex("d_sheen", 256, 512, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(10,30,62,0.62)"); g.addColorStop(0.45, "rgba(18,44,84,0.32)"); g.addColorStop(1, "rgba(30,60,104,0.12)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(190,214,245,0.10)"; c.beginPath(); c.moveTo(w * 0.2, 0); c.lineTo(w * 0.5, 0); c.lineTo(w * 0.1, h); c.lineTo(-w * 0.2, h); c.fill();
  c.fillStyle = "rgba(190,214,245,0.06)"; c.beginPath(); c.moveTo(w * 0.65, 0); c.lineTo(w * 0.75, 0); c.lineTo(w * 0.45, h); c.lineTo(w * 0.35, h); c.fill();
});
// ── DETAIL pass (2026-11-27): masonry, snow, books, a real road ─────────────────────────────────────────────────────────────
const wrapT = (t, sx = 1, sy = 1) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(sx, sy); return t; };
/** a SOLDIER COURSE: bricks stood on end in a row (the brick lintel over a window / the band under a cornice); 1 m wide × 0.2 m */
export const soldierTex = () => wrapT(canvasTex("d_soldier", 1024, 256, (c, w, h) => {
  c.fillStyle = "#9C968E"; c.fillRect(0, 0, w, h);
  const n = 11, bw = w / n;
  for (let k = 0; k < n; k++) {
    const hh = 8 + rnd(k * 3) * 9, ll = 30 + rnd(k * 3 + 1) * 10;
    c.fillStyle = `hsl(${hh},${44 + rnd(k) * 10}%,${ll}%)`; c.fillRect(k * bw + 4, 6, bw - 8, h - 12);
    const g = c.createLinearGradient(k * bw, 0, k * bw + bw, 0); g.addColorStop(0, "rgba(255,255,255,0.10)"); g.addColorStop(0.5, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(0,0,0,0.16)");
    c.fillStyle = g; c.fillRect(k * bw + 4, 6, bw - 8, h - 12);
    for (let q = 0; q < 40; q++) { c.fillStyle = `rgba(${rnd(k * 40 + q) < 0.5 ? "0,0,0" : "255,255,255"},${0.05 + rnd(k * 40 + q + 7) * 0.07})`; c.fillRect(k * bw + 6 + rnd(k + q * 3) * (bw - 14), 8 + rnd(k * 7 + q) * (h - 20), 3, 3); }
  }
}), 1, 5);
/** dressed stone (sills, lintels, the base course, coping): a fine limestone speckle, faint bedding lines */
export const stoneTex = () => wrapT(canvasTex("d_stone", 512, 512, (c, w, h) => {
  c.fillStyle = "#D2CCC0"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 16000; i++) { const g = rnd(i) * 60 - 30; c.fillStyle = `rgba(${g > 0 ? "255,255,250" : "60,56,50"},${Math.abs(g) / 240})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  for (let k = 0; k < 6; k++) { c.fillStyle = "rgba(90,84,74,0.08)"; c.fillRect(0, rnd(k) * h, w, 1 + rnd(k + 3) * 2); }
}), 1, 1);
/** packed snow (ledges, banks, the lawn): soft blue-white, wind ripples and sparkle */
export const snowTex = () => wrapT(canvasTex("d_snow", 1024, 1024, (c, w, h) => {
  c.fillStyle = "#EEF3FA"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {
    const y0 = rnd(i * 3 + 1) * h, amp = 6 + rnd(i) * 10, len = 200 + rnd(i + 5) * 500, x0 = rnd(i + 9) * w;
    c.strokeStyle = `rgba(150,170,205,${0.03 + rnd(i + 2) * 0.04})`; c.lineWidth = 6 + rnd(i + 4) * 10; c.beginPath();
    for (let x = 0; x <= len; x += 16) { const yy = y0 + Math.sin((x0 + x) / 90 + i) * amp; if (x === 0) c.moveTo(x0 + x, yy); else c.lineTo(x0 + x, yy); }
    c.stroke();
  }
  for (let i = 0; i < 30000; i++) { const g = rnd(i * 2 + 7); c.fillStyle = `rgba(${g < 0.55 ? "120,140,175" : "255,255,255"},${0.03 + rnd(i) * 0.06})`; c.fillRect(rnd(i + 1) * w, rnd(i + 3) * h, 2, 2); }
  for (let i = 0; i < 260; i++) { c.fillStyle = "rgba(255,255,255,0.95)"; c.fillRect(rnd(i * 5 + 2) * w, rnd(i * 7 + 3) * h, 1.5, 1.5); }
}), 1, 1);
/** plowed snow along a curb: grey-white, dirtier toward the road, slush and grit */
export const bankTex = () => wrapT(canvasTex("d_bank", 512, 256, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#E6ECF4"); g.addColorStop(0.6, "#C9D0DA"); g.addColorStop(1, "#8E96A2");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { const y = rnd(i + 2) * h, d = y / h; c.fillStyle = `rgba(${40 + rnd(i) * 40},${44 + rnd(i) * 40},${52 + rnd(i) * 40},${0.04 + d * 0.16 * rnd(i + 5)})`; c.fillRect(rnd(i + 1) * w, y, 2, 2); }
}), 1, 1);
/** book stacks (a double-faced range seen from its side): 1 m of shelving × 2.2 m, six shelves of spines, wood uprights */
export const spinesTex = () => wrapT(canvasTex("d_spines", 1024, 2048, (c, w, h) => {
  c.fillStyle = "#5E4330"; c.fillRect(0, 0, w, h);
  const pal = ["#8A3E34", "#2E4F7A", "#C9B48A", "#4E6E5E", "#E2D6BE", "#6A4A7A", "#B07A3A", "#1F3554", "#A9563A", "#D8CDB4", "#3E5C48", "#7A2E2A", "#C2A15E", "#2A3E5E"];
  const shelfH = (h - 120) / 6;
  for (let r = 0; r < 6; r++) {
    const y0 = 60 + r * shelfH; let x = 40;
    c.fillStyle = "#3A281C"; c.fillRect(0, y0, w, shelfH);
    while (x < w - 44) {
      const bw = 18 + rnd(r * 977 + x * 0.31) * 30, bh = shelfH * (0.62 + rnd(r * 31 + x * 0.7) * 0.3);
      if (rnd(x * 0.13 + r) < 0.03) { x += 40; continue; }   // a gap on the shelf
      const col = pal[Math.floor(rnd(r * 13 + x * 1.7) * pal.length)];
      c.fillStyle = col; c.fillRect(x, y0 + shelfH - 26 - bh, bw - 2, bh);
      c.fillStyle = "rgba(255,255,255,0.12)"; c.fillRect(x + 2, y0 + shelfH - 26 - bh, 3, bh);
      c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(x + bw - 5, y0 + shelfH - 26 - bh, 3, bh);
      if (bw > 26) { c.fillStyle = "rgba(240,230,200,0.75)"; c.fillRect(x + 5, y0 + shelfH - 26 - bh + bh * 0.15, bw - 12, 5); c.fillRect(x + 5, y0 + shelfH - 26 - bh * 0.25, bw - 12, 14); }
      x += bw;
    }
    c.fillStyle = "#8A6A4C"; c.fillRect(0, y0 + shelfH - 26, w, 26); c.fillStyle = "rgba(255,240,210,0.25)"; c.fillRect(0, y0 + shelfH - 26, w, 3);
  }
  c.fillStyle = "#6E5038"; c.fillRect(0, 0, 40, h); c.fillRect(w - 40, 0, 40, h); c.fillRect(0, 0, w, 60); c.fillRect(0, h - 60, w, 60);
}), 1, 1 / 2.2);
/** a range end panel with its call-number card (generic Dewey ranges) */
export const rangeEndTex = () => canvasTex("d_rangeend", 512, 1024, (c, w, h) => {
  c.fillStyle = "#7A5A40"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(40,26,16,${0.05 + rnd(i) * 0.08})`; c.fillRect(0, rnd(i + 1) * h, w, 2 + rnd(i + 2) * 6); }
  c.strokeStyle = "rgba(40,26,16,0.5)"; c.lineWidth = 6; c.strokeRect(20, 20, w - 40, h - 40);
  c.fillStyle = "#F2EBDC"; c.fillRect(120, 160, w - 240, 150); c.fillStyle = "#2A2A2A"; c.font = `700 52px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText("300 – 399", w / 2, 235);
});
/** the road: asphalt aggregate, tyre-polished wheel paths, sealed cracks, a patch, slush darkening the gutters (10 m × 10 m) */
export const roadTex = () => wrapT(canvasTex("d_road", 1024, 1024, (c, w, h) => {
  c.fillStyle = "#1C2534"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 60000; i++) { const g = 26 + rnd(i) * 46; c.fillStyle = `rgba(${g},${g + 6},${g + 16},${0.25 + rnd(i + 7) * 0.35})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  for (const v of [0.24, 0.38, 0.62, 0.76]) { const g = c.createLinearGradient(0, (v - 0.05) * h, 0, (v + 0.05) * h); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.5, "rgba(8,12,20,0.35)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, (v - 0.05) * h, w, 0.1 * h); }
  c.fillStyle = "rgba(40,48,60,0.35)"; c.fillRect(w * 0.3, h * 0.55, w * 0.22, h * 0.16); c.strokeStyle = "rgba(10,14,20,0.6)"; c.lineWidth = 3; c.strokeRect(w * 0.3, h * 0.55, w * 0.22, h * 0.16);   // a patch
  c.lineCap = "round";
  for (let k = 0; k < 10; k++) {   // sealed cracks: wandering black lines
    let x = rnd(k * 9) * w, y = rnd(k * 9 + 1) * h; c.strokeStyle = `rgba(6,8,12,${0.5 + rnd(k) * 0.3})`; c.lineWidth = 3 + rnd(k + 2) * 4; c.beginPath(); c.moveTo(x, y);
    const a = rnd(k * 9 + 2) * Math.PI * 2; for (let s = 0; s < 14; s++) { x += Math.cos(a + (rnd(k * 50 + s) - 0.5) * 1.6) * 22; y += Math.sin(a + (rnd(k * 50 + s + 1) - 0.5) * 1.6) * 22; c.lineTo(x, y); } c.stroke();
  }
  for (const [v0, v1] of [[0, 0.1], [0.9, 1]]) { const g = c.createLinearGradient(0, v0 * h, 0, v1 * h); g.addColorStop(v0 ? 0 : 1, "rgba(0,0,0,0)"); g.addColorStop(v0 ? 1 : 0, "rgba(60,72,90,0.45)"); c.fillStyle = g; c.fillRect(0, v0 * h, w, (v1 - v0) * h); }
}), 22, 1);
