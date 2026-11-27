// @ts-nocheck
// ★ V38 GLOBE — the newspaper: a broadsheet front page. Rev 2 (builder B, Timur 2026-11-26: "make the text a lot more detailed and
//   the photo itself … everything on the bottom of it is just basically really weird because it looks like it's just blurred out …
//   actually add the text there"). Now a real page set in type (print_type.tsx), nothing blurred:
//   · masthead "The Boston Globe" set in a neutral serif (masthead TEXT only, no copy of the paper's logo art), the section skybox,
//     ears, the dateline SUNDAY, JULY 31, 2011 (FACTCHECK: HL dates the first story to that day);
//   · the lead: the story's real headline "A game with a windfall for a knowing few" (FACTCHECK: confirmed by HL), a deck, a generic
//     byline (Globe Staff), body copy justified in columns — every sentence a FACTCHECK fact (the $2 million Massachusetts roll-down,
//     $2 tickets, "worth more than $2" on a roll-down week, statisticians' "win more than they lose", the Michigan couple, the group
//     started by MIT students, G.S. Investment Strategies, Random Strategies LLC, Michigan ending its game in 2005);
//   · a halftone PRESS PHOTO of Cash WinFall tickets on a counter (no person) with its caption, a "how a roll-down works" sidebar,
//     a glossary of the game's terms, an index box, the jump line and the folio.
//   Lies with its top toward +x. MAST_Y / DATE_Y keep rev 1's positions (the station's JULY 2011 tag points at the dateline).
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { SERIF, SANS, line, para, flow, rule, halftone, grain } from "./print_type";

export const PAPER_W = 0.84, PAPER_H = 1.28;     // a broadsheet front page, at 2.2× life (z across, x along)
export const MAST_Y = 0.14;   // the masthead's centre, from the page top, as a fraction of the page height
export const DATE_Y = 0.205;  // the dateline rule
const INK = "#14181F", GREY = "#4B5361";

// the photo: Cash WinFall tickets fanned on a store counter, the terminal's printer slot behind (greyscale, then screened)
const drawPhoto = (g, w, h) => {
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, "#3A3F46"); bg.addColorStop(0.45, "#5C626B"); bg.addColorStop(1, "#2A2E34");
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  // the terminal behind, out of focus: a dark housing with its lit screen and the ticket printer's slot
  g.save(); g.filter = "blur(6px)";
  g.fillStyle = "#1E2228"; g.beginPath(); g.roundRect(w * 0.58, -20, w * 0.46, h * 0.42, 24); g.fill();
  g.fillStyle = "#C9CED6"; g.fillRect(w * 0.64, h * 0.05, w * 0.3, h * 0.2);
  g.fillStyle = "#0F1216"; g.fillRect(w * 0.6, h * 0.34, w * 0.4, 16);
  g.restore();
  // a soft key light from the left on the counter
  const kl = g.createRadialGradient(w * 0.3, h * 0.6, 20, w * 0.3, h * 0.6, w * 0.7); kl.addColorStop(0, "rgba(255,255,255,0.35)"); kl.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = kl; g.fillRect(0, 0, w, h);
  // the tickets: a loose pile, each with its game band, five plays of numbers and a barcode
  const T = (x, y, a, s, seed) => {
    g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(-176, -66, 360, 150);
    g.fillStyle = "#F2F2EE"; g.fillRect(-180, -72, 360, 150);
    g.fillStyle = "#6A6F78"; g.fillRect(-180, -72, 360, 34);
    g.fillStyle = "#FFFFFF"; g.font = `700 24px ${SANS}`; g.textAlign = "left"; g.fillText("CASH WINFALL", -170, -46);
    g.font = `700 13px ${SANS}`; g.fillText("$2 PER PLAY", 80, -48);
    g.fillStyle = "#202226"; g.font = `600 15px ${SANS}`;
    for (let r = 0; r < 5; r++) {
      const nums = Array.from({ length: 6 }, (_, k) => String(1 + Math.floor(rnd(seed * 31 + r * 7 + k) * 46)).padStart(2, "0"));
      g.fillText(`${"ABCDE"[r]}.  ${nums.join("  ")}`, -168, -16 + r * 19);
    }
    for (let k = 0; k < 44; k++) { const bw = 1 + Math.floor(rnd(seed + k) * 3); if (k % 2 === 0) g.fillRect(70 + k * 2.4, 0, bw, 50); }
    g.restore();
  };
  for (let i = 0; i < 26; i++) {
    const x = w * (0.08 + 0.78 * rnd(i * 3 + 1)), y = h * (0.42 + 0.5 * rnd(i * 5 + 2));
    T(x, y, (rnd(i * 7 + 3) - 0.5) * 1.3, 1.05 + rnd(i) * 0.3, i + 4);
  }
  // the hero ticket, nearest and sharpest, slightly lifted
  T(w * 0.36, h * 0.62, -0.12, 1.65, 99);
  // a vignette, as a lens gives
  const vg = g.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.45)");
  g.fillStyle = vg; g.fillRect(0, 0, w, h);
};

const frontTex = () => canvasTex("g_globeFront2", 1680, 2560, (c, w, h) => {
  c.fillStyle = "#EDEFF1"; c.fillRect(0, 0, w, h);
  grain(c, w, h, 26000, rnd, "80,88,104", 0.02, 0.04, 1.6);
  const L = 44, R = w - 44;
  // ── the skybox: three section teasers above the flag
  ["SPORTS", "BUSINESS", "LIVING | ARTS"].forEach((s, i) => {
    const x = L + i * ((R - L) / 3);
    const bw = (R - L) / 3 - 18;
    rule(c, x, 60, x + bw, 3, INK);
    line(c, s, x, 106, { w: 700, px: 34, fam: SANS, color: INK, track: 2 });
    line(c, ["Section C", "Section G", "Section N"][i], x, 146, { w: 400, px: 26, fam: SERIF, color: GREY, style: "italic" });
    rule(c, x, 172, x + bw, 1.5, GREY);
  });
  // ── the flag: the masthead with its ears
  const my = h * MAST_Y;
  // rev 7 (Timur: figures "within the scene … that actually matches the visual itself"): the YEAR is the paper's own — the left ear is
  //   the issue's date block (SUNDAY / JULY 31 / 2011, the 2011 set big and bold, legible from the camera's masthead framing), the
  //   dateline below it is set larger; the right ear keeps the paper's web line
  const EW = 330;
  line(c, "The Boston Globe", w / 2, my + 56, { w: 700, px: 162, fam: SERIF, color: INK, align: "center", maxW: w - 2 * EW - 300 });
  c.strokeStyle = INK; c.lineWidth = 3;
  c.strokeRect(L, my - 96, EW, 196); c.strokeRect(R - EW, my - 96, EW, 196);
  c.fillStyle = INK; c.fillRect(L, my - 96, EW, 44);
  line(c, "SUNDAY", L + EW / 2, my - 62, { w: 700, px: 30, fam: SANS, color: "#FFFFFF", align: "center", track: 5 });
  line(c, "JULY 31", L + EW / 2, my - 8, { w: 700, px: 44, fam: SANS, color: INK, align: "center", track: 3 });
  line(c, "2011", L + EW / 2, my + 88, { w: 800, px: 104, fam: SANS, color: INK, align: "center", track: 2 });
  line(c, "boston.com", R - EW / 2, my - 18, { w: 700, px: 36, fam: SANS, color: INK, align: "center" });
  line(c, "Breaking news,", R - EW / 2, my + 26, { w: 400, px: 28, fam: SERIF, color: GREY, align: "center", style: "italic" });
  line(c, "all day", R - EW / 2, my + 60, { w: 400, px: 28, fam: SERIF, color: GREY, align: "center", style: "italic" });
  // the dateline band
  const dy = h * DATE_Y;
  rule(c, L, dy - 40, R, 5, INK); rule(c, L, dy + 18, R, 2, INK);
  line(c, "SUNDAY, JULY 31, 2011", L + 4, dy + 4, { w: 800, px: 40, fam: SANS, color: INK, track: 1 });
  line(c, "Boston's newspaper", w / 2, dy + 2, { w: 400, px: 28, fam: SERIF, color: INK, align: "center", style: "italic" });
  line(c, "SUNDAY GLOBE", R - 4, dy + 2, { w: 700, px: 28, fam: SANS, color: INK, align: "right", track: 1 });

  // ── the lead story: headline, deck, byline
  line(c, "A game with a windfall", L, 680, { w: 700, px: 118, fam: SERIF, color: INK, maxW: R - L });
  line(c, "for a knowing few", L, 800, { w: 700, px: 118, fam: SERIF, color: INK, maxW: R - L });
  para(c, "Lottery rule lets bettors who buy tickets in bulk come out ahead when the Cash WinFall jackpot rolls down", L, 872, R - L, { w: 400, px: 46, lh: 1.15, fam: SERIF, color: INK, style: "italic" });
  rule(c, L, 952, L + 260, 2, INK);
  line(c, "By Globe Staff", L, 992, { w: 700, px: 26, fam: SANS, color: INK, track: 2 });

  // ── the press photo, its caption
  const px = L, py = 1020, pw = 1060, ph = 640;
  halftone(c, px, py, pw, ph, 5.2, drawPhoto, "#161A21", "#E9EBEE");
  c.strokeStyle = "rgba(20,24,31,0.6)"; c.lineWidth = 1.5; c.strokeRect(px, py, pw, ph);
  para(c, "CASH WINFALL TICKETS — When the jackpot reaches $2 million and no one matches all six numbers, the prize money rolls down to players who match five, four or three.", px, py + ph + 34, pw, { w: 400, px: 25, lh: 1.22, fam: SANS, color: INK });

  // ── the sidebar: how a roll-down works
  const sx = 1136, sw = R - sx;
  c.fillStyle = "rgba(20,24,31,0.06)"; c.fillRect(sx, py, sw, 560);
  rule(c, sx, py, R, 6, INK);
  line(c, "HOW A ROLL-DOWN", sx + 22, py + 56, { w: 700, px: 34, fam: SANS, color: INK });
  line(c, "WORKS", sx + 22, py + 96, { w: 700, px: 34, fam: SANS, color: INK });
  const steps = [
    "Players pick six numbers. A Cash WinFall ticket costs $2.",
    "If no one matches all six, the jackpot normally grows for the next drawing.",
    "Once the jackpot reaches $2 million and no one matches all six, the money rolls down instead.",
    "It goes to the players who match five, four or three numbers, so those prizes grow."
  ];
  let yy = py + 150;
  steps.forEach((s, i) => {
    c.fillStyle = INK; c.beginPath(); c.arc(sx + 40, yy - 10, 20, 0, Math.PI * 2); c.fill();
    line(c, String(i + 1), sx + 40, yy, { w: 700, px: 26, fam: SANS, color: "#EDEFF1", align: "center" });
    yy = para(c, s, sx + 74, yy, sw - 96, { w: 400, px: 25, lh: 1.25, fam: SERIF, color: INK }) + 18;
  });
  // the index box
  const iy = py + 586;
  rule(c, sx, iy, R, 4, INK);
  line(c, "INSIDE", sx, iy + 40, { w: 700, px: 30, fam: SANS, color: INK, track: 3 });
  [["Business", "G1"], ["Editorials", "K8"], ["Lottery", "B13"], ["Sports", "C1"]]
    .forEach(([a, b], i) => {
      const ly = iy + 76 + i * 33;
      line(c, a, sx, ly, { w: 400, px: 25, fam: SERIF, color: INK });
      line(c, b, R, ly, { w: 700, px: 25, fam: SANS, color: INK, align: "right" });
      c.fillStyle = "rgba(20,24,31,0.35)"; for (let d = sx + c.measureText(a).width + 160; d < R - 60; d += 9) c.fillRect(d, ly - 4, 2, 2);
    });

  // ── the body: the lead story in two justified columns, a glossary in the third, column rules between
  const by0 = 1800, by1 = 2440;
  rule(c, L, by0 - 22, R, 2, INK);
  const cw = (R - L - 2 * 40) / 3;
  const cols = [0, 1, 2].map((k) => ({ x: L + k * (cw + 40), y0: by0, y1: by1, w: cw }));
  c.fillStyle = "rgba(20,24,31,0.45)"; [1, 2].forEach((k) => c.fillRect(cols[k].x - 21, by0, 1.5, by1 - by0 + 20));
  const story = [
    "BOSTON — A little-known rule in the Massachusetts State Lottery's Cash WinFall game lets a small number of bettors win large sums by buying very large numbers of tickets on the weeks when the jackpot is due to roll down.",
    "Under the game's rules, when the jackpot reaches $2 million and no one matches all six numbers, the money rolls down to the players who match five, four or three. The odds of winning those lower-tier prizes are relatively good — so good, statisticians say, that groups betting enough money will win more than they lose.",
    "A Cash WinFall ticket costs $2. On a roll-down week, a $2 ticket is worth more than $2.",
    "Among the most active players is a retired couple from Michigan who drive to Massachusetts for the roll-down drawings. Their company, G.S. Investment Strategies, sold shares to family and friends. The couple first played a similar game, WinFall, in Michigan, until that state ended it in 2005.",
    "Another group was started by students at the Massachusetts Institute of Technology. Its members formed a company of their own, Random Strategies LLC.",
    "Ordinary players buy the same tickets at the same price, and every ticket has the same chance of matching the numbers drawn."
  ];
  const end = flow(c, story, cols.slice(0, 2), { px: 25, lh: 1.3, fam: SERIF, color: INK, indent: 26, gap: 0.2 });
  line(c, "LOTTERY, Page A10", cols[1].x + cw, Math.min(by1 + 18, end.y + 10), { w: 700, px: 22, fam: SANS, color: INK, align: "right", track: 1 });
  // the glossary
  const gx = cols[2].x;
  line(c, "THE TERMS", gx, by0 + 30, { w: 700, px: 30, fam: SANS, color: INK, track: 2 });
  rule(c, gx, by0 + 46, gx + cw, 2, INK);
  let gy = by0 + 90;
  [["Jackpot", "The top prize, for matching all six numbers drawn."],
   ["Roll-down", "When the jackpot reaches $2 million and no one wins it, the money is paid to the lower tiers."],
   ["Lower tiers", "The prizes for matching five, four or three numbers."],
   ["Quick pick", "Numbers chosen at random by the lottery terminal."]].forEach(([t, d]) => {
    line(c, t, gx, gy, { w: 700, px: 25, fam: SERIF, color: INK });
    gy = para(c, d, gx, gy + 32, cw, { w: 400, px: 24, lh: 1.25, fam: SERIF, color: INK }) + 16;
  });
  // ── the foot: the folio
  rule(c, L, 2478, R, 3, INK);
  line(c, "A1", L, 2520, { w: 700, px: 26, fam: SANS, color: INK });
  line(c, "Metro B1  ·  Business G1  ·  Sports C1  ·  Ideas K1  ·  Travel M1", w / 2, 2520, { w: 400, px: 25, fam: SERIF, color: INK, align: "center" });
  line(c, "THE BOSTON GLOBE", R, 2520, { w: 700, px: 22, fam: SANS, color: INK, align: "right", track: 2 });
  // a faint fold across the middle (it was folded in half on the doorstep)
  const fg = c.createLinearGradient(0, h * 0.5 - 30, 0, h * 0.5 + 30);
  fg.addColorStop(0, "rgba(40,50,70,0)"); fg.addColorStop(0.5, "rgba(40,50,70,0.10)"); fg.addColorStop(1, "rgba(40,50,70,0)");
  c.fillStyle = fg; c.fillRect(0, h * 0.5 - 30, w, 60);
});
/** the paper lying on the ground, its top edge toward +x; curl lifts the long edges a touch, a soft ridge at the fold */
export const Newspaper = ({ glowSweep = -1 }) => {
  const tex = useMemo(frontTex, []);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(PAPER_W, PAPER_H, 16, 32);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      p.setZ(i, 0.014 * Math.pow(Math.abs(x) / (PAPER_W / 2), 2) + 0.006 * Math.sin((y / PAPER_H) * Math.PI * 3) + 0.008 * Math.exp(-Math.pow(y / 0.03, 2)));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group>
      {/* the page: plane in XY rotated flat; its u runs along +x (page top at +x after the turn) */}
      <group rotation-y={-Math.PI / 2}>
        <mesh geometry={geo} rotation-x={-Math.PI / 2} position={[0, 0.011, 0]} receiveShadow castShadow>
          <meshStandardMaterial map={tex} roughness={0.88} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.18} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* the sheets under it (the paper's thickness) */}
      <mesh position={[0, 0.002, 0]} receiveShadow><boxGeometry args={[PAPER_H - 0.01, 0.004, PAPER_W - 0.01]} /><meshStandardMaterial color="#D9DEE5" roughness={0.9} /></mesh>
    </group>
  );
};
