// @ts-nocheck
// ★ V38 rev 2 (builder B) — THE WINFALL LEAFLET: one printed tri-fold game brochure, used by BOTH the store station (it unfolds,
//   the roll-down rule is highlighted, the camera pushes into the diagram) and the rules station (the close: the same leaflet open
//   under the lamp). st_store_brochure.tsx and st_rules_brochure.tsx re-export from here, so there is exactly one print.
//   Timur 2026-11-26: "a lot more detailed, without the white lines, having actual text and being more realistic" → every surface
//   carries real set type (no placeholder bars): a glossy cover, HOW TO PLAY steps, the PRIZES & ODDS table, THE ROLL-DOWN rule
//   (wording unchanged) with its diagram, a sample play slip, small print and a barcode; paper thickness, rounded folds, a slight gloss.
//   Text facts: the roll-down rule (FACTCHECK Line 3: $5 million, no one matches all 6, money rolls down to the lower prizes);
//   $1 a play (FACTCHECK Line 6: Massachusetts tickets cost $2 "instead of $1"); "Quic Pic" (HL's word for the computer pick);
//   the issuer named generically "Michigan Lottery". The odds are COMPUTED from the number field below (pick 6 of N), never typed.
//   Prize amounts are not printed (no readable primary source): the lower tiers say "set by the game rules" (no pari-mutuel claim).
//
//   Geometry (unchanged from rev 1 so every station's framing still holds): a DESIGN plane, x across the three panels (metres),
//   y up the page, z the paper's normal. The inside spread is laid out in LOGICAL px 1800 × 1280 (600 per panel) — pxToDesign()
//   maps those px to metres — and printed at S× that resolution. <Brochure> lies flat with the page's top along +x of the parent and
//   the panels along +z (left panel at −z). Props: open (0 folded → 1 open flat), hi (0 → 1 the highlight sweep along the rule's
//   lines), glow (the light at the sweep's head), yaw.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd, clamp01, Glow } from "./kit";
import { BODY, FIGURE } from "./fonts3d";

export const BRO = { PW: 0.15, PH: 0.32, T: 0.0012, PX: 600, PY: 1280 };
const S = 2;                                   // print resolution: 1200 × 2560 px per panel
const N = 49;                                  // the number field: pick 6 of 1–N (the odds below are computed from it)
const NAVY = "#0B2547", BLUE = "#005DC8", LIGHT = "#4D8ED9", PALE = "#B3CEEF", PAPER = "#F5F8FC", INK = "#14294A", MUTE = "#4A5F7E";
// the rule's lines (logical spread px, right panel) — measured when the spread is drawn; the highlight sweeps them in order
export const RULE = { lines: [], x0: 1236 };
const RULE_TEXT = ["When the jackpot", "reaches $5 million", "and no one matches", "all 6 numbers, the", "money rolls down to", "the lower prizes."];
// spread px → design metres (centre of the spread at 0,0)
export const pxToDesign = (px, py) => [(px / (3 * BRO.PX)) * 3 * BRO.PW - 1.5 * BRO.PW, BRO.PH / 2 - (py / BRO.PY) * BRO.PH];
// design → the parent's local frame (the brochure's group position p, flat): design x → +z, design y → +x, design z → +y
export const broPt = (p, dx, dy, dz = 0.002) => [p[0] + dy, p[1] + dz, p[2] + dx];

// ── odds (exact, from the field) ───────────────────────────────────────────────────────────────────────────────────────────────
const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
const ALL = C(N, 6);
const ways = (m) => C(6, m) * C(N - 6, 6 - m);
const oddsOf = (m) => Math.round(ALL / ways(m));
const ODDS_ANY = Math.round(ALL / (ways(3) + ways(4) + ways(5) + ways(6)));
const fmt = (v) => v.toLocaleString("en-US");

// ── type helpers ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const font = (c, w, px, fam = BODY) => { c.font = `${w} ${px}px ${fam}`; };
const text = (c, s, x, y, { w = 600, px = 20, color = INK, align = "left", fam = BODY, track = 0 } = {}) => {
  font(c, w, px, fam); c.fillStyle = color; c.textAlign = align; c.textBaseline = "alphabetic";
  if ("letterSpacing" in c) c.letterSpacing = `${track}px`;
  c.fillText(s, x, y);
  if ("letterSpacing" in c) c.letterSpacing = "0px";
};
/** wrapped paragraph; returns the y below the last line */
const para = (c, s, x, y, maxW, { w = 500, px = 19, lh = 1.32, color = INK, fam = BODY } = {}) => {
  font(c, w, px, fam); c.fillStyle = color; c.textAlign = "left"; c.textBaseline = "alphabetic";
  const words = s.split(" "); let line = "";
  for (const wd of words) {
    const tr = line ? line + " " + wd : wd;
    if (c.measureText(tr).width > maxW && line) { c.fillText(line, x, y); y += px * lh; line = wd; } else line = tr;
  }
  if (line) { c.fillText(line, x, y); y += px * lh; }
  return y;
};
const ball = (c, x, y, r, n, tone = BLUE, ink = "#FFFFFF") => {
  c.save();
  c.fillStyle = "rgba(6,20,44,0.22)"; c.beginPath(); c.ellipse(x + r * 0.12, y + r * 0.9, r * 0.85, r * 0.22, 0, 0, Math.PI * 2); c.fill();
  const g = c.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.08, x, y, r * 1.02);
  if (tone === "white") { g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.7, "#E4ECF6"); g.addColorStop(1, "#AFC2DA"); }
  else { g.addColorStop(0, "#9CC7F7"); g.addColorStop(0.45, tone); g.addColorStop(1, "#022B5E"); }
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  // the number on a white disc, the way real draw balls are printed
  c.fillStyle = tone === "white" ? "rgba(255,255,255,0)" : "rgba(255,255,255,0.94)";
  if (tone !== "white") { c.beginPath(); c.arc(x, y, r * 0.56, 0, Math.PI * 2); c.fill(); }
  if (n !== undefined) { font(c, 800, Math.round(r * 0.72)); c.fillStyle = tone === "white" ? BLUE : NAVY; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(String(n), x, y + r * 0.04); }
  c.fillStyle = "rgba(255,255,255,0.55)"; c.beginPath(); c.ellipse(x - r * 0.36, y - r * 0.5, r * 0.3, r * 0.16, -0.5, 0, Math.PI * 2); c.fill();
  c.restore();
};
const slot = (c, x, y, r, hit) => {   // a tier's ball slot: filled (a matched number) or an empty ring
  if (hit) { ball(c, x, y, r, undefined, BLUE); return; }
  c.strokeStyle = "rgba(11,37,71,0.35)"; c.lineWidth = 2.2; c.setLineDash([4, 3.5]); c.beginPath(); c.arc(x, y, r - 1, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
};
const header = (c, x, w, t1, t2) => {
  const g = c.createLinearGradient(0, 0, 0, 150); g.addColorStop(0, "#0E3266"); g.addColorStop(1, NAVY);
  c.fillStyle = g; c.fillRect(x, 0, w, 150);
  c.fillStyle = LIGHT; c.fillRect(x, 150, w, 12);
  c.fillStyle = "rgba(255,255,255,0.08)"; for (let i = 0; i < 8; i++) c.fillRect(x + w - 150 + i * 18, 0, 6, 150);
  text(c, t1, x + w / 2, 96, { w: 800, px: 58, color: "#FFFFFF", align: "center", track: 1 });
  if (t2) text(c, t2, x + w / 2, 134, { w: 700, px: 19, color: PALE, align: "center", track: 3 });
};
const crease = (c, x, h) => {   // the fold's soft shading either side of a crease
  const g = c.createLinearGradient(x - 22, 0, x + 22, 0);
  g.addColorStop(0, "rgba(11,37,71,0)"); g.addColorStop(0.5, "rgba(11,37,71,0.13)"); g.addColorStop(1, "rgba(11,37,71,0)");
  c.fillStyle = g; c.fillRect(x - 22, 0, 44, h);
};
const grain = (c, w, h, seed, n = 7000, a0 = 0.02) => {
  for (let i = 0; i < n; i++) { const a = a0 + rnd(seed + i) * 0.025; c.fillStyle = `rgba(11,37,71,${a})`; c.fillRect(rnd(seed + i * 3) * w, rnd(seed + i * 7) * h, 0.8, 0.8); }
};
const barcode = (c, x, y, w, h, digits, seed) => {
  c.fillStyle = "#FFFFFF"; c.fillRect(x - 10, y - 8, w + 20, h + 34);
  let px = x; let i = 0;
  c.fillStyle = "#0A1220";
  while (px < x + w - 3) { const bw = 1 + Math.floor(rnd(seed + i) * 3.2); if (i % 2 === 0) c.fillRect(px, y, bw, h - (i < 3 || px > x + w - 10 ? 0 : 8)); px += bw + (i % 2 ? 0 : 0.6); i++; }
  text(c, digits, x + w / 2, y + h + 14, { w: 600, px: 14, color: "#0A1220", align: "center", track: 3 });
};
const logoWordmark = (c, x, y, size, center = true) => {   // WINFALL as a lockup: Anton, a light outline, a drop shadow
  c.save();
  font(c, "", size, FIGURE); c.textAlign = center ? "center" : "left"; c.textBaseline = "alphabetic";
  c.fillStyle = "rgba(0,10,30,0.45)"; c.fillText("WINFALL", x + size * 0.03, y + size * 0.04);
  c.lineWidth = size * 0.07; c.strokeStyle = "#FFFFFF"; c.lineJoin = "round"; c.strokeText("WINFALL", x, y);
  const g = c.createLinearGradient(0, y - size * 0.8, 0, y); g.addColorStop(0, "#2F86E6"); g.addColorStop(1, "#003E8F");
  c.fillStyle = g; c.fillText("WINFALL", x, y);
  c.restore();
};

// ── the inside spread (logical 1800 × 1280) ──────────────────────────────────────────────────────────────────────────────────
const drawSpread = (c, w, h) => {
  c.fillStyle = PAPER; c.fillRect(0, 0, w, h);
  grain(c, w, h, 11, 14000);

  // ── LEFT: HOW TO PLAY ──
  header(c, 0, 600, "HOW TO PLAY", "IT'S EASY · FOUR STEPS");
  const steps = [
    ["PICK 6 NUMBERS", `Choose any six different numbers from 1 to ${N} in one panel of a play slip. Or mark QP and let the terminal choose a Quic Pic for you.`],
    ["PLAY $1 A PLAY", "Each play costs $1. Mark up to five plays (A to E) on one slip, hand it to the retailer and keep your ticket. Your ticket is your receipt."],
    ["WATCH THE DRAW", "Six numbers are drawn. Results are posted at every Michigan Lottery retailer and printed in the newspaper."],
    ["MATCH TO WIN", "Match 3, 4, 5 or all 6 numbers drawn on a single play to win a prize. See PRIZES & ODDS."]
  ];
  steps.forEach(([hd, body], i) => {
    const y = 222 + i * 232;
    ball(c, 66, y, 34, i + 1, NAVY);
    text(c, hd, 116, y + 12, { w: 800, px: 38, color: NAVY });
    let yy = para(c, body, 116, y + 52, 450, { px: 21, w: 500 });
    if (i === 0) [4, 11, 19, 26, 33, 42].forEach((n, k) => ball(c, 136 + k * 70, yy + 22, 26, n, k % 2 ? "white" : BLUE));
  });
  // a tip box at the foot of the panel
  c.fillStyle = "rgba(0,93,200,0.08)"; c.beginPath(); c.roundRect(34, 1152, 532, 98, 12); c.fill();
  c.fillStyle = BLUE; c.fillRect(34, 1152, 6, 98);
  text(c, "SIGN YOUR TICKET", 58, 1186, { w: 800, px: 19, color: BLUE, track: 2 });
  para(c, "Sign the back of your ticket as soon as you buy it. Tickets cannot be cancelled.", 58, 1214, 490, { px: 18, w: 500, color: MUTE });

  // ── MIDDLE: PRIZES & ODDS ──
  header(c, 600, 600, "PRIZES & ODDS", "PER $1 PLAY");
  para(c, "Every play has four ways to win. Match the numbers drawn on one play:", 632, 206, 540, { px: 21, w: 600 });
  // the table
  const tx = 626, tw = 548;
  c.fillStyle = NAVY; c.fillRect(tx, 248, tw, 40);
  text(c, "MATCH", tx + 14, 275, { w: 800, px: 17, color: "#FFFFFF", track: 2 });
  text(c, "PRIZE", tx + 236, 275, { w: 800, px: 17, color: "#FFFFFF", track: 2 });
  text(c, "ODDS 1 IN", tx + tw - 14, 275, { w: 800, px: 17, color: "#FFFFFF", track: 2, align: "right" });
  const tiers = [
    [6, "JACKPOT", "Grows each draw until won"],
    [5, "2nd prize", "Set by the game rules"],
    [4, "3rd prize", "Set by the game rules"],
    [3, "4th prize", "Set by the game rules"]
  ];
  tiers.forEach(([m, p1, p2], i) => {
    const y = 288 + i * 150;
    c.fillStyle = i === 0 ? "rgba(0,93,200,0.11)" : i % 2 ? "rgba(11,37,71,0.035)" : "rgba(11,37,71,0.0)"; c.fillRect(tx, y, tw, 150);
    c.fillStyle = "rgba(11,37,71,0.22)"; c.fillRect(tx, y + 149, tw, 1.5);
    text(c, `MATCH ${m}`, tx + 14, y + 48, { w: 800, px: 34, color: NAVY });
    for (let k = 0; k < 6; k++) slot(c, tx + 30 + k * 36, y + 98, 14, k < m);
    text(c, `${m} of 6`, tx + 222, y + 132, { w: 600, px: 15, color: MUTE, align: "right" });
    text(c, p1, tx + 236, y + 50, { w: 800, px: i === 0 ? 27 : 24, color: i === 0 ? BLUE : NAVY });
    para(c, p2, tx + 236, y + 80, 150, { px: 16, w: 500, color: MUTE });
    text(c, fmt(oddsOf(m)), tx + tw - 14, y + 50, { w: 700, px: 23, color: NAVY, align: "right" });
  });
  c.strokeStyle = NAVY; c.lineWidth = 2; c.strokeRect(tx, 248, tw, 40 + 4 * 150);
  // overall odds and the notes
  c.fillStyle = NAVY; c.beginPath(); c.roundRect(tx, 908, tw, 62, 10); c.fill();
  text(c, "OVERALL ODDS OF WINNING", tx + 18, 948, { w: 800, px: 19, color: PALE, track: 2 });
  text(c, `1 in ${ODDS_ANY}`, tx + tw - 18, 950, { w: 800, px: 28, color: "#FFFFFF", align: "right" });
  let ny = para(c, "Prize amounts for Match 3, 4 and 5 are set by the official game rules and paid on every winning play.", 632, 1012, 536, { px: 18, w: 500, color: MUTE });
  ny = para(c, "When the jackpot rolls down, the lower-tier prize pools grow. See THE ROLL-DOWN.", 632, ny + 8, 536, { px: 18, w: 700, color: NAVY });
  para(c, `Odds are for one $1 play, picking 6 of ${N} numbers.`, 632, ny + 8, 536, { px: 15, w: 500, color: MUTE });

  // ── RIGHT: THE ROLL-DOWN (the rule's lines, then the machine as a diagram) ──
  header(c, 1200, 600, "THE ROLL-DOWN", "ONLY IN WINFALL");
  RULE.lines = [];
  font(c, 700, 46);
  RULE_TEXT.forEach((s, i) => {
    const y = 232 + i * 60;
    text(c, s, RULE.x0, y, { w: 700, px: 46, color: NAVY });
    font(c, 700, 46);
    RULE.lines.push({ y0: y - 40, y1: y + 12, x1: RULE.x0 + c.measureText(s).width + 8 });
  });
  text(c, "Roll-down draws pay the jackpot to Match 5, 4 and 3.", RULE.x0, 584, { w: 600, px: 17, color: MUTE });
  // the diagram: the jackpot column (coins stacked edge-on up to the $5M line), the shut MATCH 6 gate on top, three tiers stepping down
  const cx = 1330, top = 690, bot = 1210, cw = 150;
  c.strokeStyle = NAVY; c.lineWidth = 6;
  c.fillStyle = "rgba(0,93,200,0.08)"; c.beginPath(); c.roundRect(cx - cw / 2, top, cw, bot - top, 22); c.fill(); c.stroke();
  const lvl = 800;
  const cg = c.createLinearGradient(0, lvl, 0, bot); cg.addColorStop(0, "#7FB4F2"); cg.addColorStop(1, BLUE);
  c.fillStyle = cg; c.beginPath(); c.roundRect(cx - cw / 2 + 10, lvl, cw - 20, bot - lvl - 10, 14); c.fill();
  // the coins, edge-on: a lit rim and a shadowed underside for each, with the reeding ticks of a coin's edge
  for (let y = lvl + 6, k = 0; y < bot - 20; y += 22, k++) {
    const x0 = cx - cw / 2 + 14 + (rnd(k) - 0.5) * 4, x1 = cx + cw / 2 - 14 + (rnd(k + 9) - 0.5) * 4;
    c.fillStyle = "rgba(255,255,255,0.55)"; c.beginPath(); c.roundRect(x0, y + 2, x1 - x0, 4, 2); c.fill();
    c.fillStyle = "rgba(0,30,80,0.30)"; c.fillRect(x0, y + 17, x1 - x0, 3);
    c.fillStyle = "rgba(255,255,255,0.16)"; for (let xx = x0 + 4; xx < x1 - 2; xx += 6) c.fillRect(xx, y + 7, 1.6, 9);
  }
  c.setLineDash([14, 10]); c.strokeStyle = BLUE; c.lineWidth = 5; c.beginPath(); c.moveTo(cx - cw / 2 - 8, lvl); c.lineTo(cx + cw / 2 + 74, lvl); c.stroke(); c.setLineDash([]);
  // the level's label sits right of the column, above the arrows (left of it is the panel's crease)
  text(c, "$5M", cx + cw / 2 + 12, lvl - 12, { w: 800, px: 34, color: BLUE });
  // the MATCH 6 gate (shut)
  c.fillStyle = NAVY; c.beginPath(); c.roundRect(cx - cw / 2 - 12, top - 58, cw + 24, 48, 10); c.fill();
  text(c, "MATCH 6", cx, top - 24, { w: 800, px: 28, color: "#FFFFFF", align: "center" });
  text(c, "JACKPOT", cx - cw / 2 - 12, top - 74, { w: 700, px: 30, color: NAVY });
  text(c, "NO WINNER", cx + cw / 2 + 22, top - 26, { w: 800, px: 18, color: BLUE, track: 2 });
  // the tiers and the arrows that roll down into them
  [["MATCH 5", 800], ["MATCH 4", 950], ["MATCH 3", 1100]].forEach(([t, y], i) => {
    const x = 1490 + i * 34;
    c.fillStyle = "rgba(0,93,200,0.12)"; c.strokeStyle = BLUE; c.lineWidth = 5; c.beginPath(); c.roundRect(x, y, 1770 - x, 88, 14); c.fill(); c.stroke();
    text(c, t, x + (1770 - x) / 2, y + 46, { w: 800, px: 36, color: NAVY, align: "center" });
    text(c, "PRIZES GROW", x + (1770 - x) / 2, y + 74, { w: 700, px: 15, color: BLUE, align: "center", track: 2 });
    c.strokeStyle = BLUE; c.lineWidth = 6; c.beginPath(); c.moveTo(cx + cw / 2 + 4, lvl + 20 + i * 40); c.quadraticCurveTo(x - 30, lvl + 20 + i * 40, x - 6, y + 44); c.stroke();
    c.fillStyle = BLUE; c.beginPath(); c.moveTo(x - 2, y + 44); c.lineTo(x - 26, y + 28); c.lineTo(x - 22, y + 60); c.closePath(); c.fill();
  });
  text(c, "Illustration only. Not to scale.", 1770, 1262, { w: 500, px: 14, color: MUTE, align: "right" });
  crease(c, 600, h); crease(c, 1200, h);
};

// ── the cover (logical 600 × 1280) ─────────────────────────────────────────────────────────────────────────────────────────
const burst = (c, x, y, r0, r1, n, fill) => {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? r0 : r1; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  c.closePath(); c.fillStyle = fill; c.fill();
};
const drawCover = (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w * 0.5, h); g.addColorStop(0, "#062A57"); g.addColorStop(0.5, "#0757B8"); g.addColorStop(1, "#06306A");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  // light rays fanning from behind the logo, a soft halo, fine halftone dots
  c.save(); c.translate(w / 2, 470);
  for (let i = 0; i < 24; i++) { c.rotate(Math.PI / 12); c.fillStyle = i % 2 ? "rgba(255,255,255,0.05)" : "rgba(160,205,255,0.07)"; c.beginPath(); c.moveTo(0, 0); c.lineTo(1000, -90); c.lineTo(1000, 90); c.fill(); }
  c.restore();
  const halo = c.createRadialGradient(w / 2, 470, 10, w / 2, 470, 330); halo.addColorStop(0, "rgba(200,225,255,0.45)"); halo.addColorStop(1, "rgba(200,225,255,0)");
  c.fillStyle = halo; c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(255,255,255,0.07)"; for (let yy = 0; yy < h; yy += 9) for (let xx = (yy / 9) % 2 ? 4.5 : 0; xx < w; xx += 9) { const r = 1.6 * (yy / h); c.beginPath(); c.arc(xx, yy, r, 0, Math.PI * 2); c.fill(); }
  // the issuer band
  c.fillStyle = "rgba(2,16,40,0.55)"; c.fillRect(0, 0, w, 92);
  c.fillStyle = PALE; c.fillRect(0, 92, w, 4);
  text(c, "MICHIGAN LOTTERY", 36, 58, { w: 800, px: 30, color: "#FFFFFF", track: 4 });
  text(c, "LOTTO GAMES", w - 36, 56, { w: 600, px: 17, color: PALE, align: "right", track: 3 });
  // NEW! flash
  burst(c, 488, 190, 58, 78, 16, "#FFFFFF");
  text(c, "NEW!", 488, 202, { w: 900, px: 36, color: BLUE, align: "center" });
  text(c, "GAME", 488, 226, { w: 800, px: 15, color: NAVY, align: "center", track: 2 });
  // the logo
  text(c, "INTRODUCING", 40, 196, { w: 700, px: 22, color: PALE, track: 7 });
  logoWordmark(c, w / 2, 430, 200);
  c.fillStyle = "#FFFFFF"; c.beginPath(); c.roundRect(110, 466, 380, 54, 27); c.fill();
  text(c, "A NEW LOTTO GAME", w / 2, 503, { w: 800, px: 30, color: NAVY, align: "center", track: 2 });
  // the balls, tumbling in an arc
  [[96, 640, 7, BLUE], [200, 600, 13, "white"], [300, 588, 22, BLUE], [400, 600, 31, "white"], [504, 640, 38, BLUE], [250, 700, 45, NAVY], [352, 704, 19, BLUE]]
    .forEach(([x, y, n, tone]) => ball(c, x, y, 50, n, tone));
  // the jackpot burst
  burst(c, w / 2, 900, 118, 150, 22, "#E9F2FD");
  burst(c, w / 2, 900, 104, 124, 22, BLUE);
  text(c, "JACKPOT", w / 2, 860, { w: 800, px: 24, color: PALE, align: "center", track: 4 });
  text(c, "ROLLS DOWN", w / 2, 900, { w: 900, px: 36, color: "#FFFFFF", align: "center" });
  text(c, "AT $5 MILLION", w / 2, 938, { w: 800, px: 28, color: "#FFFFFF", align: "center" });
  text(c, "MORE WAYS TO WIN", w / 2, 1088, { w: 800, px: 34, color: "#FFFFFF", align: "center", track: 2 });
  text(c, `PICK 6 OF ${N}  ·  $1 A PLAY  ·  MATCH 3, 4, 5 OR 6`, w / 2, 1124, { w: 700, px: 18, color: PALE, align: "center", track: 1 });
  // the footer: small print and the commission line
  c.fillStyle = "rgba(2,16,40,0.6)"; c.fillRect(0, 1160, w, 120);
  para(c, `Overall odds of winning: 1 in ${ODDS_ANY}. Must be 18 or older to play. Game rules govern all prize amounts; see inside.`, 30, 1190, 540, { px: 14, w: 500, color: "rgba(230,240,252,0.85)" });
  text(c, "HOW TO PLAY INSIDE ▸", w - 30, 1262, { w: 800, px: 18, color: "#FFFFFF", align: "right", track: 2 });
  text(c, "Please play responsibly.", 30, 1262, { w: 600, px: 15, color: PALE });
};

// ── the inner flap's outside (seen as the cover swings open): a SAMPLE PLAY SLIP ──────────────────────────────────────────────
const drawSlipPanel = (c, w, h) => {
  c.fillStyle = PAPER; c.fillRect(0, 0, w, h); grain(c, w, h, 77);
  header(c, 0, w, "PLAY SLIP", "HOW TO MARK IT");
  let y = para(c, "Use a blue or black pen. Fill in six numbers in each panel you play, like this:", 36, 210, 528, { px: 20, w: 500 });
  // the mark examples
  [["RIGHT", true], ["WRONG", false]].forEach(([lab, ok], i) => {
    const x = 60 + i * 260;
    c.strokeStyle = MUTE; c.lineWidth = 2; c.strokeRect(x, y + 4, 34, 22);
    if (ok) { c.fillStyle = "#0B1A33"; c.fillRect(x + 4, y + 8, 26, 14); } else { c.strokeStyle = "#0B1A33"; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 4, y + 8); c.lineTo(x + 30, y + 22); c.moveTo(x + 30, y + 8); c.lineTo(x + 4, y + 22); c.stroke(); }
    text(c, lab, x + 46, y + 22, { w: 800, px: 18, color: ok ? BLUE : MUTE, track: 2 });
  });
  // the slip itself: pale blue card, timing marks, five panels A–E of 1–N, QP boxes, the draw options
  const sx = 34, sy = y + 50, sw = 532, sh = 1210 - (y + 50);
  c.save();
  c.shadowColor = "rgba(6,20,44,0.25)"; c.shadowBlur = 10; c.shadowOffsetY = 4;
  c.fillStyle = "#EAF2FC"; c.fillRect(sx, sy, sw, sh);
  c.restore();
  c.strokeStyle = LIGHT; c.lineWidth = 2; c.strokeRect(sx, sy, sw, sh);
  c.fillStyle = "#0B1A33"; for (let k = 0; k < 40; k++) { const ty = sy + 12 + k * ((sh - 24) / 40); c.fillRect(sx + 6, ty, 12, 6); }   // timing marks (the reader's track)
  c.fillStyle = BLUE; c.fillRect(sx + 26, sy, sw - 26, 46);
  text(c, "WINFALL", sx + 40, sy + 33, { w: 400, px: 28, color: "#FFFFFF", fam: FIGURE });
  text(c, "$1 PER PLAY · MARK 6 NUMBERS PER PANEL", sx + sw - 12, sy + 30, { w: 700, px: 13, color: "#FFFFFF", align: "right", track: 1 });
  const marks = [[4, 11, 19, 26, 33, 42], [2, 9, 17, 28, 36, 47], [6, 14, 22, 30, 39, 45], null, null];
  const cols = 5, rows = Math.ceil(N / cols);
  const pw = (sw - 40) / 5, cell = Math.min((pw - 8) / cols, 18.5);
  ["A", "B", "C", "D", "E"].forEach((L, p) => {
    const px0 = sx + 30 + p * pw, py0 = sy + 60;
    c.fillStyle = BLUE; c.fillRect(px0 + 2, py0, pw - 6, 24);
    text(c, `PANEL ${L}`, px0 + (pw - 4) / 2, py0 + 17, { w: 800, px: 12, color: "#FFFFFF", align: "center", track: 1 });
    for (let n = 1; n <= N; n++) {
      const r = Math.floor((n - 1) / cols), k = (n - 1) % cols;
      const cxp = px0 + 4 + k * cell + cell / 2, cyp = py0 + 36 + r * (cell + 4) + cell / 2;
      const on = marks[p] && marks[p].includes(n);
      c.strokeStyle = "rgba(0,93,200,0.55)"; c.lineWidth = 1; c.strokeRect(cxp - cell / 2 + 1, cyp - cell / 2 + 1, cell - 2, cell - 2);
      if (on) { c.fillStyle = "#0B1A33"; c.fillRect(cxp - cell / 2 + 2.5, cyp - cell / 2 + 3, cell - 5, cell - 6); }
      else text(c, String(n), cxp, cyp + 4, { w: 700, px: 10.5, color: "rgba(0,70,160,0.9)", align: "center" });
    }
    const qy = py0 + 36 + rows * (cell + 4) + 8;
    c.strokeStyle = "rgba(0,93,200,0.6)"; c.strokeRect(px0 + 8, qy, 22, 16);
    if (p === 3) { c.fillStyle = "#0B1A33"; c.fillRect(px0 + 10, qy + 2, 18, 12); }
    text(c, "QP", px0 + 36, qy + 13, { w: 800, px: 12, color: BLUE });
    text(c, "VOID", px0 + 36, qy + 33, { w: 700, px: 10, color: MUTE });
    c.strokeRect(px0 + 8, qy + 22, 22, 14);
  });
  // the draw options along the slip's foot
  const by = sy + 60 + 36 + rows * (cell + 4) + 70;
  c.fillStyle = "rgba(0,93,200,0.1)"; c.fillRect(sx + 26, by, sw - 40, 128);
  text(c, "NUMBER OF CONSECUTIVE DRAWS", sx + 40, by + 26, { w: 800, px: 13, color: NAVY, track: 1 });
  ["1", "2", "3", "4", "5", "10"].forEach((d, i) => { const x = sx + 40 + i * 76; c.strokeStyle = "rgba(0,93,200,0.6)"; c.lineWidth = 1.2; c.strokeRect(x, by + 38, 24, 16); if (i === 0) { c.fillStyle = "#0B1A33"; c.fillRect(x + 2, by + 40, 20, 12); } text(c, d, x + 32, by + 51, { w: 700, px: 13, color: BLUE }); });
  para(c, "Panels A, B and C marked by hand; Panel D is a Quic Pic. The terminal prints your ticket with the numbers played and the draw date. Check your ticket before you leave the counter.", sx + 40, by + 78, sw - 70, { px: 12.5, w: 500, color: MUTE });
  text(c, "SAMPLE — NOT A VALID PLAY SLIP", sx + sw / 2, sy + sh - 14, { w: 800, px: 13, color: "rgba(11,37,71,0.55)", align: "center", track: 3 });
  // under the slip
  text(c, "Ask your retailer for play slips.", 36, 1248, { w: 600, px: 16, color: MUTE });
};
// ── the back cover (the middle panel's outside): good to know, the small print, the barcode, the commission line ──────────────
const drawBackCover = (c, w, h) => {
  c.fillStyle = PAPER; c.fillRect(0, 0, w, h); grain(c, w, h, 91);
  header(c, 0, w, "GOOD TO KNOW", "");
  const blocks = [
    ["CLAIMING A PRIZE", "Smaller prizes can be paid by any Michigan Lottery retailer. Larger prizes are claimed at a Lottery office. Bring your signed ticket and a photo ID."],
    ["CHECKING YOUR TICKET", "Retailers can scan your ticket on the terminal. Winning numbers are posted in stores after each drawing."],
    ["ROLL-DOWN DRAWINGS", "When the jackpot reaches $5 million and no one matches all 6 numbers, the money rolls down to the lower prizes."],
    ["PLAY RESPONSIBLY", "Set a budget and stick to it. The Lottery is a game of chance. Must be 18 or older to play."]
  ];
  let y = 214;
  blocks.forEach(([hd, body]) => {
    c.fillStyle = BLUE; c.fillRect(36, y - 22, 6, 28);
    text(c, hd, 54, y, { w: 800, px: 24, color: NAVY, track: 1 });
    y = para(c, body, 36, y + 36, 528, { px: 19, w: 500, color: INK }) + 28;
  });
  // the legal small print
  c.fillStyle = "rgba(11,37,71,0.18)"; c.fillRect(36, y, 528, 1.5);
  para(c, "All tickets, transactions, prize payments and winners are subject to the game rules and regulations of the Michigan Lottery. In the event of a conflict between this brochure and the official game rules, the rules prevail. Odds shown are for a single $1 play and are rounded. Lower-tier prize amounts are pari-mutuel and vary with sales and the number of winners. A jackpot that is not won rolls over to the next drawing unless a roll-down applies. Tickets are void if stolen, unissued, altered, illegible or mutilated. The Lottery is not responsible for lost or stolen tickets. Prizes must be claimed within the period set by the game rules.",
    36, y + 30, 528, { px: 14, w: 500, lh: 1.36, color: MUTE });
  // the barcode and the commission line
  barcode(c, 60, 1060, 230, 70, "0 41500 20030 7", 5);
  text(c, "FORM WF-2003", 330, 1086, { w: 700, px: 15, color: MUTE, track: 1 });
  text(c, "Printed in U.S.A.", 330, 1110, { w: 500, px: 15, color: MUTE });
  c.fillStyle = NAVY; c.fillRect(0, 1170, w, 110);
  text(c, "MICHIGAN LOTTERY", w / 2, 1222, { w: 800, px: 32, color: "#FFFFFF", align: "center", track: 5 });
  text(c, "PROCEEDS SUPPORT PUBLIC EDUCATION", w / 2, 1252, { w: 700, px: 15, color: PALE, align: "center", track: 3 });
};

// ── textures (cached; ONE spread printed, its panels taken by UV offset so the three panels share one upload) ────────────────
const tex = (key, w, h, draw) => canvasTex(key, w * S, h * S, (c) => { c.scale(S, S); draw(c, w, h); });
let TEX = null;
const useLeafletTex = () => useMemo(() => {
  if (TEX) return TEX;
  const spread = tex("leaf_spread", 1800, 1280, drawSpread);
  const slice = (i) => { const t = spread.clone(); t.repeat.set(1 / 3, 1); t.offset.set(i / 3, 0); t.needsUpdate = true; return t; };
  TEX = { L: slice(0), C: slice(1), R: slice(2), cover: tex("leaf_cover", 600, 1280, drawCover), slip: tex("leaf_slip", 600, 1280, drawSlipPanel), back: tex("leaf_back", 600, 1280, drawBackCover) };
  return TEX;
}, []);
// a coated stock: a slight gloss (lower roughness, the environment's sheen), the faintest self-light so the print never goes muddy
const EDGE = new THREE.MeshStandardMaterial({ color: "#E3E9F1", roughness: 0.75 });
const face = (t) => new THREE.MeshStandardMaterial({ map: t, roughness: 0.4, metalness: 0, emissiveMap: t, emissive: "#ffffff", emissiveIntensity: 0.04, envMapIntensity: 0.65 });
const mats = (inner, outer) => [EDGE, EDGE, EDGE, EDGE, face(inner), face(outer)];
const Sheet = ({ m, x }) => (
  <mesh position={[x, 0, -BRO.T / 2]} material={m} castShadow receiveShadow><boxGeometry args={[BRO.PW, BRO.PH, BRO.T]} /></mesh>
);
// the rounded paper at a fold (a thin cylinder along the hinge; it fills the corner a sharp box hinge would leave)
const Fold = ({ x, z }) => (
  <mesh position={[x, 0, z]} material={EDGE}><cylinderGeometry args={[BRO.T * 0.9, BRO.T * 0.9, BRO.PH, 8, 1]} /></mesh>
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
/** the leaflet lying flat; position p in the parent's frame, yaw (radians) about the vertical */
export const Brochure = ({ p, open = 1, hi = 0, glow = 1, yaw = 0 }) => {
  const t = useLeafletTex();
  const m = useMemo(() => ({ C: mats(t.C, t.back), R: mats(t.R, t.slip), L: mats(t.L, t.cover) }), [t]);
  // the left flap (on top, carrying the cover) opens first, then the right; a slight residual lift (paper never lies quite flat)
  const oL = clamp01(open * 2), oR = clamp01(open * 2 - 1);
  const aL = Math.PI * (1 - oL) + 0.05 * Math.sin(Math.PI * 0.5 * oL);   // folded: flat on the stack (no flap can cut another);
  const aR = -Math.PI * (1 - oR) - 0.035 * Math.sin(Math.PI * 0.5 * oR); //   open: a slight lift (paper never lies quite flat)
  const { PW, T } = BRO;
  return (
    <group position={p} rotation-y={yaw - Math.PI / 2}>
      <group rotation-x={-Math.PI / 2}>
        <Sheet m={m.C} x={0} />
        <Fold x={PW / 2} z={-T * 0.1} />
        <Fold x={-PW / 2} z={-T * 0.1} />
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
/** a stack of folded leaflets (cover up) for a counter stand */
export const BrochureStack = ({ p, n = 6, yaw = 0 }) => {
  const t = useLeafletTex();
  const m = useMemo(() => mats(t.cover, t.back), [t]);
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
