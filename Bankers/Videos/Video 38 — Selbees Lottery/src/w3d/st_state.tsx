// @ts-nocheck
// ★ V38 station STATE (builder D): "The state investigated. The betting was legal, and no one's odds were hurt.
//   The state itself made $120 million from it."
//   Night on the plaza below a domed capitol in the Massachusetts State House family (pale-gold ribbed dome, loggia of paired
//   columns, lit windows), lamp posts and an iron fence, the city's towers in the haze behind.
//   · arrival: a high flight out of the previous station's haze, craning down the plaza toward the dome (tag MASSACHUSETTS STATE HOUSE)
//   · "investigated": the Inspector General's report (a giant bound report, cover print OFFICE OF THE INSPECTOR GENERAL · JULY 2012)
//     drops onto the plaza, the camera tilting down with it, landing with a thud
//   · "The betting was legal": the cover swings open on its spine; the FINDINGS page; a light-blue check draws in → tag LEGAL
//   · "no one's odds were hurt": the second check → tag NO ONE'S ODDS HURT
//   · "The state itself made $120 million": the camera pulls back and rises; the centre door's hall lights up and a stream of
//     strapped $100 bundles arcs over the report into the State House; the dome brightens; counter $120 MILLION / TO THE STATE
//   · leaves by a flight (the next station's arrival shot) toward the total station.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, std, ease, easeOut, rnd, clamp01, lerp, Sky, Glow } from "./kit";
import { Tag, Counter } from "./overlays";
import { WORDS } from "./take";
import { cueAt } from "../bnx/SfxLayer";
import { BODY, FIGURE } from "./fonts3d";
import { StateHouse } from "./st_state_house";
import { Cash } from "./st_total_cash";
import { LightPool, LightWash, Tree, Shade, floorBand, floorBlob, footRect, footRing } from "./st_state_fx";
import { LEAVE_A } from "./st_globe";
import { SERIF as PSERIF, line as pline, para as ppara, rule as prule, grain as pgrain } from "./print_type";

// rev 5: 60 m east of MIT's plaza (it was 300 m): the camera TRUCKS here from the RIGGED stack over the plaza's trees in one slow eased
//   move (the 300-m flight in 24 f was the film's fastest zip, 2,066 px/f); the total street stays 40 m further east
export const O_STATE = [1560, 0, 0];
const nrm = (s) => s.toLowerCase().replace(/[^a-z0-9$']/g, "");
// the first word starting with `t` at or after frame `after` (so repeated words resolve to THIS station's line)
export const wAt = (t, after = 0) => { const q = nrm(t); const w = WORDS.find((w) => w.at >= after && nrm(w.t).startsWith(q)); if (!w) throw new Error("st_state: no word " + t); return w.at; };
export const wEndAt = (t, after = 0) => { const q = nrm(t); const w = WORDS.find((w) => w.at >= after && nrm(w.t).startsWith(q)); if (!w) throw new Error("st_state: no word " + t); return w.end; };
const T = () => {
  const s0 = wAt("the", 1612);
  return {
    s0, state: wAt("state", s0), inv: wAt("investigated", s0), betting: wAt("betting", s0), legal: wAt("legal", s0), no: wAt("no", wAt("legal", s0)),
    odds: wAt("odds", s0), hurt: wAt("hurt", s0), itself: wAt("itself", s0), made: wAt("made", s0), m120: wAt("$120", s0), m120e: wEndAt("$120", s0),
    it: wEndAt("it", wAt("from", wAt("$120", s0))), next: wAt("in", wAt("$120", s0))
  };
};
// ── where things stand (station-local) ─────────────────────────────────────────────────────────────────────────────────────
const HOUSE_Z = -22, HS = 0.55;                                    // the capitol's design-units group: front of the main block at z −22
const DOOR = [0, 1.75, HOUSE_Z + 4 * HS];                          // the open centre door's threshold
const DOME = [0, 0.55 * 21.5, HOUSE_Z - 5 * HS];                    // the dome's middle
const BIND = [0, 0, -9.2];                                         // the report lies on the plaza in front of the steps
const BW = 3.2, BD = 4.2;                                          // report: width (x) and depth (z)

// ── print ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const pavingTex = () => canvasTex("st_paving", 1024, 1024, (c, w, h) => {
  c.fillStyle = "#3A475A"; c.fillRect(0, 0, w, h);
  const n = 8, sw = w / n;
  for (let r = 0; r < n * 2; r++) for (let k = 0; k < n; k++) {
    const v = rnd(r * 17 + k * 3) * 0.12 - 0.06;
    c.fillStyle = v > 0 ? `rgba(220,232,250,${v})` : `rgba(0,0,0,${-v})`; c.fillRect(k * sw + (r % 2) * sw / 2, r * sw / 2, sw, sw / 2);
  }
  for (let i = 0; i < 16000; i++) { const g = 60 + rnd(i) * 70; c.fillStyle = `rgba(${g},${g + 8},${g + 22},${0.18 + rnd(i + 5) * 0.2})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  c.fillStyle = "rgba(8,16,30,0.75)";
  for (let r = 0; r <= n * 2; r++) c.fillRect(0, r * sw / 2 - 1.5, w, 3);
  for (let r = 0; r < n * 2; r++) for (let k = 0; k <= n; k++) c.fillRect(k * sw + (r % 2) * sw / 2 - 1.5, r * sw / 2, 3, sw / 2);
});
const lawnTex = () => canvasTex("st_lawn", 512, 512, (c, w, h) => {
  c.fillStyle = "#142638"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 26000; i++) { const g = rnd(i) * 40; c.fillStyle = `rgba(${30 + g},${50 + g},${70 + g},${0.25})`; c.fillRect(rnd(i + 3) * w, rnd(i + 4) * h, 1.5, 3); }
});
// ── the Inspector General's report (rev 2, builder B; Timur 2026-11-26: "gray lines appear. Please don't do that … add some actual
//   detail inside"): the cover, the inside of the cover (contents) and the FINDINGS page are set in real type (print_type.tsx).
//   Every statement is from FACTCHECK.md (TREAS / CBS / HL): requested by the Treasurer and the Lottery; no illicit activity or
//   collusion; no player disadvantaged, the same odds for everyone; the design not flawed, worked as intended; some agents bent
//   or broke the rules with some officials' assent; about $120 million to the state; the $2 million roll-down, $2 tickets.
//   The check boxes stay where rev 1 had them (CHECK1/CHECK2: u 0.159, v 0.395 / 0.598 of the page).
const RP = { w: 1280, h: 1680 };
const coverTex = () => canvasTex("st_cover2", RP.w, RP.h, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#123A6E"); g.addColorStop(1, "#0A2448");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 30000; i++) { c.fillStyle = `rgba(255,255,255,${rnd(i) * 0.045})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }   // the leatherette grain
  c.strokeStyle = "rgba(214,228,248,0.75)"; c.lineWidth = 6; c.strokeRect(68, 68, w - 136, h - 136);
  c.lineWidth = 2.4; c.strokeRect(92, 92, w - 184, h - 184);
  const ink = "#E8F0FB";
  pline(c, "COMMONWEALTH OF MASSACHUSETTS", w / 2, 300, { w: 600, px: 52, fam: BODY, color: ink, align: "center", track: 4 });
  c.fillStyle = "rgba(214,228,248,0.8)"; c.fillRect(w / 2 - 240, 360, 480, 4);
  pline(c, "OFFICE OF THE", w / 2, 600, { w: 700, px: 88, fam: BODY, color: "#FFFFFF", align: "center" });
  pline(c, "INSPECTOR", w / 2, 768, { w: 800, px: 132, fam: BODY, color: "#FFFFFF", align: "center" });
  pline(c, "GENERAL", w / 2, 916, { w: 800, px: 132, fam: BODY, color: "#FFFFFF", align: "center" });
  c.fillStyle = "#7FB4F2"; c.fillRect(w / 2 - 320, 1020, 640, 10);
  pline(c, "CASH WINFALL REVIEW", w / 2, 1180, { w: 700, px: 76, fam: BODY, color: ink, align: "center" });
  pline(c, "A review of the Massachusetts State Lottery's", w / 2, 1262, { w: 500, px: 38, fam: PSERIF, color: "rgba(214,228,248,0.9)", align: "center", style: "italic" });
  pline(c, "Cash WinFall game", w / 2, 1310, { w: 500, px: 38, fam: PSERIF, color: "rgba(214,228,248,0.9)", align: "center", style: "italic" });
  pline(c, "JULY 2012", w / 2, 1400, { w: 600, px: 68, fam: BODY, color: "rgba(214,228,248,0.95)", align: "center", track: 3 });
  c.fillStyle = "rgba(214,228,248,0.5)"; c.fillRect(w / 2 - 300, 1470, 600, 2);
  pline(c, "Gregory W. Sullivan, Inspector General", w / 2, 1530, { w: 500, px: 34, fam: PSERIF, color: ink, align: "center" });
});
// the inside of the front cover: the contents page (it lies face-up to the left of the findings once the cover has swung over)
const innerTex = () => canvasTex("st_inner2", RP.w, RP.h, (c, w, h) => {
  c.translate(w, h); c.scale(-1, -1);   // the cover's underside maps its texture turned 180°: print it turned so it reads
  c.fillStyle = "#F2F5F9"; c.fillRect(0, 0, w, h);
  pgrain(c, w, h, 9000, rnd, "30,50,80", 0.015, 0.03, 2);
  pline(c, "CASH WINFALL REVIEW", 120, 120, { w: 700, px: 26, fam: BODY, color: "#4A5F7E", track: 3 });
  prule(c, 120, 140, w - 120, 2, "#0B2547");
  pline(c, "CONTENTS", 120, 280, { w: 800, px: 84, fam: BODY, color: "#0B2547" });
  c.fillStyle = "#4D8ED9"; c.fillRect(120, 312, 220, 9);
  [["Executive Summary", "1"], ["Findings", "1"], ["Background: the Cash WinFall game", "3"], ["How a roll-down works", "4"], ["High-volume betting", "6"],
   ["The Lottery's oversight", "9"], ["Recommendations", "12"], ["Appendix: the Treasurer's request", "15"]].forEach(([a, b], i) => {
    const y = 440 + i * 112;
    pline(c, a, 120, y, { w: 500, px: 40, fam: PSERIF, color: "#14294A" });
    pline(c, b, w - 120, y, { w: 700, px: 40, fam: BODY, color: "#14294A", align: "right" });
    c.font = `500 40px ${PSERIF}`; const aw = c.measureText(a).width;
    c.fillStyle = "rgba(20,41,74,0.45)"; for (let d = 120 + aw + 24; d < w - 190; d += 16) c.fillRect(d, y - 6, 4, 4);
  });
  ppara(c, "This review was conducted at the request of the State Treasurer and the Massachusetts State Lottery.", 120, 1420, w - 240, { w: 400, px: 32, lh: 1.35, fam: PSERIF, color: "#4A5F7E", style: "italic" });
});
const pageTex = () => canvasTex("st_page2", RP.w, RP.h, (c, w, h) => {
  c.fillStyle = "#F4F7FB"; c.fillRect(0, 0, w, h);
  pgrain(c, w, h, 9000, rnd, "30,50,80", 0.015, 0.03, 2);
  const L = 140, R = w - 120, NAVY = "#0B2547", INK = "#14294A", MUTE = "#4A5F7E";
  // running head
  pline(c, "OFFICE OF THE INSPECTOR GENERAL", L, 92, { w: 700, px: 24, fam: BODY, color: MUTE, track: 2 });
  pline(c, "CASH WINFALL REVIEW · JULY 2012", R, 92, { w: 700, px: 24, fam: BODY, color: MUTE, align: "right", track: 2 });
  prule(c, L, 112, R, 2, NAVY);
  pline(c, "FINDINGS", L, 226, { w: 800, px: 92, fam: BODY, color: NAVY });
  c.fillStyle = "#4D8ED9"; c.fillRect(L, 254, 280, 10);
  ppara(c, "At the request of the State Treasurer and the Lottery, this office reviewed the Cash WinFall game: its design, its roll-down drawings and the high-volume betting by organized groups.",
    L, 330, R - L, { w: 400, px: 33, lh: 1.32, fam: PSERIF, color: INK, justify: true });
  // the two findings with their check boxes (the ticks are 3-D, drawn in by the station)
  [[600, "The betting was legal.", "No evidence was found of any illicit activities or collusion among bettors, Lottery officials or Lottery agents."],
   [940, "No player was disadvantaged.", "Everyone received the same odds and was eligible for the same payouts. High-volume betting did not hurt anyone's odds of winning."]]
    .forEach(([y, hd, body], i) => {
      c.fillStyle = "rgba(77,142,217,0.10)"; c.fillRect(L + 170, y - 14, R - L - 170, 300);
      c.strokeStyle = NAVY; c.lineWidth = 10; c.strokeRect(L, y, 128, 128);
      pline(c, `${i + 1}.  ${hd}`, L + 196, y + 50, { w: 800, px: 44, fam: BODY, color: NAVY });
      ppara(c, body, L + 196, y + 110, R - L - 220, { w: 400, px: 32, lh: 1.3, fam: PSERIF, color: INK });
    });
  // table 1
  const ty = 1290;
  pline(c, "Table 1.  Cash WinFall at a glance", L, ty, { w: 700, px: 28, fam: BODY, color: NAVY });
  const rows = [["Roll-down level", "$2 million jackpot"], ["Ticket price", "$2"], ["Game design", "Not flawed; worked as intended"],
    ["Lottery agents", "Some bent or broke the rules"], ["Profit to the state", "About $120 million"]];
  prule(c, L, ty + 20, R, 3, NAVY);
  rows.forEach(([a, b], i) => {
    const y = ty + 66 + i * 52;
    if (i % 2 === 0) { c.fillStyle = "rgba(11,37,71,0.05)"; c.fillRect(L, y - 36, R - L, 52); }
    pline(c, a, L + 14, y, { w: 600, px: 29, fam: BODY, color: INK });
    pline(c, b, L + 470, y, { w: 400, px: 29, fam: PSERIF, color: INK });
  });
  prule(c, L, ty + 66 + rows.length * 52 - 28, R, 2, NAVY);
  // folio
  pline(c, "1", w / 2, h - 40, { w: 600, px: 28, fam: BODY, color: MUTE, align: "center" });
});
const pageEdgeTex = () => canvasTex("st_pedge", 256, 64, (c, w, h) => {
  c.fillStyle = "#E6ECF4"; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 2) { c.fillStyle = `rgba(60,80,110,${0.10 + rnd(y) * 0.18})`; c.fillRect(0, y, w, 1); }
});

// rev 6 (Timur: "we don't really want unlit objects … a dark subtle shape under it, but the correct one"): contact shade on the plaza —
//   every lamp post's foot, both iron fences' kerbs (both faces) and their granite posts, the foot of the State House's flight (the
//   plaza in front of the bottom step, the cheek walls' feet); the report gets its own, which appears as it lands
const STATE_BANDS = [
  ...[[-22, -5.6], [5.6, 22]].flatMap(([x0, x1]) => [floorBand((x0 + x1) / 2, 0, -15.2 + 0.25, x1 - x0, 0.5, 0.42, "-z"), floorBand((x0 + x1) / 2, 0, -15.2 - 0.25, x1 - x0, 0.45, 0.35, "+z")]),
  floorBand(0, 0, -22 + 12 * 0.55, 16 * 0.55, 0.7, 0.5, "-z"),
  ...[-1, 1].flatMap((sd) => footRect(sd * 8.45 * 0.55, 0, -22 + 10.1 * 0.55, 0.5 * 0.55, 2.4 * 0.55, 0.45, 0.42))
];
const STATE_BLOBS = [
  ...[-12.5, -3.5, 5.5, 14.5].flatMap((z) => [-5.6, 5.6].map((x) => floorBlob(x, 0.0, z, 0.55, 0.55, 0.6))),
  ...[[-22, -5.6], [5.6, 22]].flatMap(([x0, x1]) => { const n = Math.floor((x1 - x0) / 3.2) + 1; return Array.from({ length: n }, (_, k) => floorBlob(x0 + k * (x1 - x0) / (n - 1), 0, -15.2, 0.42, 0.42, 0.5)); })
];
const REPORT_BLOB = [floorBlob(0.05, 0, -9.15, 2.05, 2.55, 0.6)], REPORT_BANDS = footRect(0, 0, -9.2, 1.6, 2.1, 0.22, 0.45);
// ── pieces ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const LampPost = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.25, 0]} castShadow><cylinderGeometry args={[0.22, 0.3, 0.5, 12]} /><meshStandardMaterial color="#141C28" metalness={0.7} roughness={0.35} /></mesh>
    <mesh position={[0, 2.0, 0]} castShadow><cylinderGeometry args={[0.07, 0.11, 3.2, 10]} /><meshStandardMaterial color="#141C28" metalness={0.7} roughness={0.35} /></mesh>
    <mesh position={[0, 3.62, 0]}><cylinderGeometry args={[0.18, 0.12, 0.12, 8]} /><meshStandardMaterial color="#141C28" metalness={0.7} roughness={0.35} /></mesh>
    <mesh position={[0, 3.95, 0]}><cylinderGeometry args={[0.2, 0.14, 0.55, 6]} /><meshStandardMaterial color="#FFE6BE" emissive="#FFC27A" emissiveIntensity={2.6} transparent opacity={0.95} /></mesh>
    <mesh position={[0, 4.3, 0]}><coneGeometry args={[0.3, 0.22, 6]} /><meshStandardMaterial color="#141C28" metalness={0.7} roughness={0.35} /></mesh>
    <Glow position={[0, 3.95, 0]} size={2.4} color="#FFC27A" opacity={0.75} />
    <Glow position={[0, 3.95, 0]} size={0.7} color="#FFE8C4" opacity={0.9} />
  </group>
);
// (rev 5: the trees are st_state_fx's detailed Tree)
// the iron fence: granite posts and a run of pickets (instanced)
const Fence = ({ x0, x1, z }) => {
  const n = Math.floor((x1 - x0) / 0.22);
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.025, 0.025, 1.25, 5), std("#0E1520", 0.4, 0.7), n); m.castShadow = true;
    const M = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { M.makeTranslation(x0 + (i + 0.5) * (x1 - x0) / n, 0.72, z); m.setMatrixAt(i, M); }
    return m;
  }, [x0, x1, z, n]);
  const posts = Math.floor((x1 - x0) / 3.2) + 1;
  return (
    <group>
      <primitive object={mesh} />
      {[0.3, 1.22].map((y) => <mesh key={y} position={[(x0 + x1) / 2, y, z]}><boxGeometry args={[x1 - x0, 0.05, 0.05]} /><meshStandardMaterial color="#0E1520" metalness={0.7} roughness={0.4} /></mesh>)}
      {Array.from({ length: posts }, (_, k) => <mesh key={k} position={[x0 + k * (x1 - x0) / (posts - 1), 0.75, z]} castShadow><boxGeometry args={[0.36, 1.5, 0.36]} /><meshStandardMaterial color="#7E8CA2" roughness={0.75} /></mesh>)}
      <mesh position={[(x0 + x1) / 2, 0.08, z]} receiveShadow><boxGeometry args={[x1 - x0, 0.16, 0.5]} /><meshStandardMaterial color="#6C7A90" roughness={0.8} /></mesh>
    </group>
  );
};
// a 3-D tick drawn in like a pen stroke: down to the heel, then the long stroke up to the right (k 0..1); lies on the page
const Stroke = ({ a, b, k, mat }) => {
  if (k <= 0.001) return null;
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) * k;
  const ux = dx / Math.hypot(dx, dz), uz = dz / Math.hypot(dx, dz);
  return <mesh position={[a[0] + ux * L / 2, 0.025, a[1] + uz * L / 2]} rotation-y={-Math.atan2(dz, dx)} scale={[L + 0.08, 1, 1]} castShadow><boxGeometry args={[1, 0.03, 0.075]} />{mat}</mesh>;
};
const Tick = ({ pos, k }) => {
  if (k <= 0.001) return null;
  const mat = <meshStandardMaterial color="#2F7BD6" emissive="#4D8ED9" emissiveIntensity={0.7} roughness={0.35} />;
  const P0 = [-0.15, -0.02], P1 = [-0.04, 0.1], P2 = [0.24, -0.24];
  return (
    <group position={pos} scale={1.5}>
      <Stroke a={P0} b={P1} k={clamp01(k / 0.3)} mat={mat} />
      <Stroke a={P1} b={P2} k={clamp01((k - 0.3) / 0.7)} mat={mat} />
      <Glow position={[0.02, 0.12, -0.04]} size={0.7 * k} color="#7FB4F2" opacity={0.3} />
    </group>
  );
};
// page coordinates (on the report's first page, x across, z down the page) → station-local
const PAGE_Y = 0.345;
const pagePt = (u, v) => [BIND[0] + 0.06 - (BW - 0.16) / 2 + u * (BW - 0.16), PAGE_Y + 0.01, BIND[2] - (BD - 0.14) / 2 + v * (BD - 0.14)];
const CHECK1 = pagePt(0.159, 0.395), CHECK2 = pagePt(0.159, 0.598);

// the report's fall and opening
const reportPose = (t, f) => {
  const k = ease(f, t.inv - 6, t.inv + 20);
  const y = 22 * (1 - k) * (1 - k);
  const settle = Math.max(0, 1 - Math.abs(f - (t.inv + 21)) / 6) * 0.04;
  return { y: y + settle, ry: 0.35 * (1 - k) - 0.06, rz: 0.25 * (1 - k), rx: -0.2 * (1 - k), vis: f > t.inv - 8 };
};
const Report = ({ t, f }) => {
  const cover = useMemo(coverTex, []), page = useMemo(pageTex, []), edge = useMemo(pageEdgeTex, []), inner = useMemo(innerTex, []);
  const pose = reportPose(t, f);
  if (!pose.vis) return null;
  const open = ease(f, t.inv + 22, t.betting + 4);             // the cover swings over on its spine (rev 2: earlier, so the LEGAL tag is in on its word)
  const th = Math.PI * 0.985 * open;
  const lift = Math.sin(Math.PI * open) * 0.05;
  return (
    <group position={[BIND[0], pose.y, BIND[2]]} rotation={[pose.rx, pose.ry, pose.rz]}>
      {/* back board, the page block with its paper edges, the first page */}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow><boxGeometry args={[BW, 0.06, BD]} /><meshStandardMaterial color="#0C2A52" roughness={0.55} /></mesh>
      <mesh position={[0.06, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[BW - 0.16, 0.28, BD - 0.14]} />
        {[0, 1, 2, 3, 4, 5].map((i) => <meshStandardMaterial key={i} attach={`material-${i}`} color={i === 2 ? "#DCE5F0" : "#CAD4E2"} map={i === 2 ? page : edge} roughness={0.75} />)}
      </mesh>
      {/* the spine: a rounded binding along the left edge */}
      <mesh position={[-BW / 2 + 0.02, 0.2, 0]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.2, 0.2, BD, 16, 1, false, Math.PI, Math.PI]} /><meshStandardMaterial color="#0C2A52" roughness={0.5} side={THREE.DoubleSide} /></mesh>
      {/* the front cover, hinged at the spine */}
      <group position={[-BW / 2 + 0.02, 0.38 + lift, 0]} rotation-z={th}>
        <mesh position={[BW / 2, 0.03, 0]} castShadow receiveShadow>
          <boxGeometry args={[BW, 0.06, BD]} />
          {[0, 1, 2, 3, 4, 5].map((i) => <meshStandardMaterial key={i} attach={`material-${i}`} color={i === 2 || i === 3 ? "#FFFFFF" : "#0C2A52"} map={i === 2 ? cover : i === 3 ? inner : null} roughness={i === 2 ? 0.45 : i === 3 ? 0.7 : 0.6} metalness={0.05} />)}
        </mesh>
      </group>
      {/* the checks */}
      <Tick pos={[CHECK1[0] - BIND[0], PAGE_Y, CHECK1[2] - BIND[2]]} k={ease(f, t.legal - 12, t.legal + 2)} />
      <Tick pos={[CHECK2[0] - BIND[0], PAGE_Y, CHECK2[2] - BIND[2]]} k={ease(f, t.no - 17, t.no - 3)} />
    </group>
  );
};
// the money stream: N strapped bundles launched from behind the camera, arcing over the report into the lit door
const N_CASH = 56;
const cashItems = (t, f) => {
  const t0 = t.made - 4;
  return Array.from({ length: N_CASH }, (_, i) => {
    const a = t0 + i * 1.25 + rnd(i * 5) * 1.0, dur = 34;
    const u = (f - a) / dur;
    if (u <= 0 || u >= 1) return { p: [0, -50, 0], s: 0 };
    const e = u * u * (3 - 2 * u);
    const side = i % 2 ? 1 : -1, sx = side * (2.2 + rnd(i + 11) * 4.5), sy = 2.5 + rnd(i + 12) * 5, sz = 3 + rnd(i + 13) * 5;
    const ex = DOOR[0] + (rnd(i + 14) - 0.5) * 0.5, ey = DOOR[1] + (rnd(i + 15) - 0.5) * 0.4, ez = DOOR[2] - 1.4;
    const x = lerp(sx, ex, e), z = lerp(sz, ez, e);
    const y = lerp(sy, ey, e) + Math.sin(Math.PI * e) * (3.2 + rnd(i + 16) * 1.6);
    const spin = (1 - e) * (2.5 + rnd(i + 17) * 3);
    const s = 0.62 * (1 - ease(u, 0.88, 1.0) * 0.95) * clamp01(u / 0.16);
    return { p: [x, y, z], r: [spin * 0.6 * (rnd(i + 18) - 0.5), spin + Math.PI / 2, spin * 0.4 * (rnd(i + 19) - 0.5)], s };
  });
};

const Scene = ({ f }) => {
  const t = useMemo(T, []);
  const paving = useMemo(() => { const p = pavingTex(); p.wrapS = p.wrapT = THREE.RepeatWrapping; p.repeat.set(1.2, 6); return p; }, []);
  const lawn = useMemo(() => { const p = lawnTex(); p.wrapS = p.wrapT = THREE.RepeatWrapping; p.repeat.set(4, 8); return p; }, []);
  const domeK = ease(f, t.m120 - 6, t.it);
  const doorK = ease(f, t.made - 18, t.made + 4);
  const moonK = ease(f, LEAVE_A + 16, LEAVE_A + 50) * (1 - ease(f, t.it - 18, t.it - 4));
  return (
    <group>
      <Sky />
      {/* a pale moon high left, its halo */}
      {/* a pale moon high left (it fades as the camera leaves, so the next station's moon never doubles it) */}
      {moonK > 0.002 && <Glow position={[-60, 70, -150]} size={16} color="#CFE0FA" opacity={0.35 * moonK} />}
      {moonK > 0.002 && <mesh position={[-60, 70, -150]}><sphereGeometry args={[2.2, 24, 16]} /><meshBasicMaterial color="#E8F0FB" fog={false} transparent opacity={moonK} /></mesh>}
      {/* ground: the far ground, the lawns, the paved path and plaza */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.03, -40]} receiveShadow><planeGeometry args={[400, 400]} /><meshStandardMaterial color="#0C1F33" roughness={0.95} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.015, 4]} receiveShadow><planeGeometry args={[46, 44]} /><meshStandardMaterial map={lawn} color="#8FA2BC" roughness={0.95} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.0, 4]} receiveShadow><planeGeometry args={[9.6, 44]} /><meshStandardMaterial map={paving} color="#9DAAC0" roughness={0.38} metalness={0.15} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 4.9, 0.06, 4]} receiveShadow><boxGeometry args={[0.3, 0.12, 44]} /><meshStandardMaterial color="#8090A6" roughness={0.7} /></mesh>)}
      {/* the capitol */}
      <group position={[0, 0, HOUSE_Z]} scale={HS}><StateHouse dome={domeK} door={doorK} /></group>
      {/* uplights at the steps (cool), the dome's halo (warms a little as the money arrives) */}
      <pointLight position={[0, 1.2, -12.5]} intensity={16} distance={16} decay={1.4} color="#BFD6FF" />
      <pointLight position={[0, 15, -12]} intensity={10 + 40 * domeK} distance={16} decay={1.4} color="#FFE0A8" />
      <Glow position={[DOME[0], DOME[1] + 0.3, DOME[2]]} size={9 + 7 * domeK} color="#FFD796" opacity={0.14 + 0.45 * domeK} />
      <Glow position={[DOME[0], DOME[1] + 2.9, DOME[2]]} size={2.6 + 2 * domeK} color="#FFE2B0" opacity={0.6 + 0.3 * domeK} />
      <Glow position={[DOOR[0], DOOR[1], DOOR[2] + 0.2]} size={2 + 1.2 * doorK} color="#FFC27A" opacity={0.1 + 0.14 * doorK} />
      {/* the fence, lamps and trees */}
      <Fence x0={-22} x1={-5.6} z={-15.2} />
      <Fence x0={5.6} x1={22} z={-15.2} />
      {[-12.5, -3.5, 5.5, 14.5].map((z) => [-5.6, 5.6].map((x) => <LampPost key={x + "_" + z} x={x} z={z} />))}
      {/* rev 5: the west lawn keeps one tree by the fence — the truck from MIT sweeps this lawn and nearer trees wiped the whole frame; the
          east lawn likewise (the truck east to the total street passed right through its two nearer trees) */}
      {[[-10, -10, 1.05], [10.5, -9, 1.2], [18.5, 19.5, 1.3]].map(([x, z, s], i) => <Tree key={i} x={x} z={z} s={s} i={i} />)}
      {/* rev 5: a row of tall trees along the lawn's west edge (beside MIT's plaza; none north of z −9: the truck east passes in front of them): the end of MIT's
          wing is never seen against empty fog */}
      {[-40, -33, -26, -19.5, -9].map((z, i) => <Tree key={"w" + i} x={-22.6 + (i % 2) * 0.8} z={z} s={1.45 + rnd(i + 40) * 0.35} i={i + 9} />)}
      {[-12.5, -3.5, 5.5, 14.5].map((z) => [-5.6, 5.6].map((x) => <LightPool key={x + "p" + z} position={[x, 0.02, z]} r={3.2} color="#FFB867" opacity={0.32} />))}
      <LightPool position={[DOOR[0], 0.72, DOOR[2] + 2.6]} r={2.6} sz={1.4} color="#FFB867" opacity={0.15 + 0.35 * doorK} />
      <LightWash position={[0, 4.2, HOUSE_Z + 4.4 * HS]} w={12} h={7} color="#BFD6FF" opacity={0.14} />
      {[-1, 1].map((sd) => <LightWash key={sd} position={[sd * 10, 3.2, HOUSE_Z + 0.06]} w={9} h={7} color="#BFD6FF" opacity={0.16} />)}
      <LightWash position={[0, 9.6, HOUSE_Z - 5 * HS + 3.05]} w={7} h={4} color="#FFE2B0" opacity={0.08 + 0.2 * domeK} />
      <Shade items={STATE_BANDS} />
      <Shade items={STATE_BLOBS} kind="blob" />
      <Shade items={REPORT_BLOB} kind="blob" k={ease(f, t.inv + 14, t.inv + 22)} />
      <Shade items={REPORT_BANDS} k={ease(f, t.inv + 14, t.inv + 22)} />
      {/* the report, then the money */}
      <Report t={t} f={f} />
      {f > t.made - 6 && f < t.next + 40 && <Cash items={cashItems(t, f)} shadows={false} self={0.45} />}
    </group>
  );
};

// ── the camera (WORLD coordinates) ─────────────────────────────────────────────────────────────────────────────────────────
const W = (p) => [p[0] + O_STATE[0], p[1] + O_STATE[1], p[2] + O_STATE[2]];
// ★ rev 5 (Timur: slower, cinematic, always on a subject): five long moves, each overlapping the last so the camera never settles
//   and restarts — the truck in from MIT (66 f; the report falls into the frame as it lands), the descent onto the opening report,
//   one slow drift across the findings while both checks draw, the pull back and rise to the door and the dome as the money streams
//   in, the slow push on the dome (the total station's truck east starts from it)
const shots = () => {
  const t = T();
  return [
    // the truck from MIT's stack: east over the plaza's trees, rising, to the State House plaza (lands as the report hits the stone)
    //   in two overlapping parts so the camera always has a subject and never pans fast: first it cranes up and back off the RIGGED
    //   stack onto MIT's colonnade and dome (the stack and the paper's table sinking out of the bottom of the frame), then it trucks
    //   east along the building line — MIT's east wing, the row of trees, then the State House sliding in, the report falling onto its
    //   plaza
    { a: LEAVE_A, b: t.s0 + 12, pos: [1496.5, 7.0, 11.0], target: [1501, 5.0, -22], fov: 36 },
    { a: t.s0 - 14, b: t.inv + 40, pos: W([1.5, 8.2, 21.5]), target: W([0, 5.2, -15]), fov: 36 },
    // down and in over the report as its cover swings open; the lit arcade and door at the top of the frame
    { a: t.inv + 28, b: t.legal + 10, pos: W([2.0, 6.7, 3.6]), target: W([-0.2, -0.4, -9.2]), fov: 34 },
    // one slow drift across the findings while the two checks draw
    { a: t.legal - 2, b: t.hurt + 8, pos: W([-0.7, 6.3, 2.0]), target: W([-0.3, -0.5, -9.0]), fov: 34 },
    // the money: pull back and rise; the stream, the door, the dome
    { a: t.hurt + 2, b: t.m120 + 14, pos: W([-3.2, 4.0, 11.5]), target: W([0, 8.6, -18]), fov: 40 },
    // the slow push on the dome (the total station's truck east leaves from it)
    { a: t.m120 + 8, b: t.it - 6, pos: W([-1.6, 3.7, 8.6]), target: W([0, 9.4, -18]), fov: 40 }
  ];
};
const Overlay = ({ f, P }) => {
  const t = T();
  const dome = P([DOME[0] + 1.2, DOME[1] + 1.0, DOME[2] + 2.5]);
  const c1 = P(CHECK1), c2 = P(CHECK2);
  return (
    <>
      {/* rev 2 tag audit (REV2: fully in by the word, ≥ 36 f read, gone before the camera leaves its object) */}
      <Tag text="Massachusetts State House" at={t.s0 + 12} out={t.inv + 34} x={70} y={330} to={dome.behind ? null : dome} size={28} />
      <Tag text="Legal" at={t.legal - 12} out={t.hurt + 9} x={620} y={300} to={c1.behind ? null : c1} size={34} />
      <Tag text="No one's odds hurt" at={t.no - 17} out={t.hurt + 9} x={470} y={400} to={c2.behind ? null : c2} size={34} />
      <Counter at={t.m120 - 2} out={t.it - 6} x={540} y={330} value={120} prefix="$" unit="MILLION" label="To the state" size={112} countDur={28} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("whooshlong", t.s0 + 5, 30, 0.45),                      // rev 5: the truck from MIT (its fastest frame ≈ s0 + 17)
    cueAt("ee_whoosh_fast_small_whoosh_01", t.inv + 10, 14, 0.35), // the report falling
    cueAt("thud", t.inv + 20, 14, 0.55),                          // …and landing
    cueAt("ov_paper_unfold", t.inv + 24, 16, 0.25),               // rev 6: the cover swinging open
    cueAt("ee_click_click_01", t.legal - 6, 6, 0.4),              // check 1
    cueAt("ee_click_click_01", t.no - 11, 6, 0.4),                // check 2
    cueAt("ov_stamp", t.legal + 2, 10, 0.2),                      // rev 6: check 1 pressed home as its stroke ends
    cueAt("ov_stamp", t.no - 3, 10, 0.18),                        // rev 6: check 2
    cueAt("whooshsoft", t.hurt + 22, 24, 0.45),                   // the pull-back
    cueAt("ov_paper_flutter", t.made, 24, 0.15),                  // rev 6: the strapped bundles in flight …
    cueAt("ov_money_drop", t.made + 28, 16, 0.2), cueAt("ov_money_drop", t.m120 + 22, 16, 0.17),   // … landing inside the door
    cueAt("coin", t.made + 6, 16, 0.35), cueAt("coin", t.m120 + 6, 16, 0.35), cueAt("coin", t.m120 + 20, 16, 0.3),
    cueAt("pingshort", t.m120 + 28, 12, 0.4)                       // the counter lands
  ];
};
export const ST = { id: "state", origin: O_STATE, from: LEAVE_A - 14, to: wAt("in", wAt("$120", 1700)) + 24, light: { target: [0, 0, -12], shadowBox: 24, keyI: 1.6, fillI: 0.32, rimI: 1.9 }, shots, Scene, Overlay, sfx };
