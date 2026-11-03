import React from "react";
import { useCurrentFrame } from "remotion";
import { rInOut, alpha } from "../anim";
import { Faces, P, box, metal, steelBox, metalBox, matBox, contactShadow, onFace, swing, shade, type Face, type V } from "../p3";
import { type Rig } from "../rig";
import { Pool3D } from "../s3";
import { MARKS } from "../marks";
import { SPXW_D, SPXW_VIEW } from "../spxwordmark";
import { cat, tr, rx, lathe, prism, satin, units, type Mx } from "./future";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// teachE — "Musk has said both companies set up committees to look at a possible merger." A BOARDROOM TABLE IN REAL DEPTH (the folders
// slide ACROSS its top toward each other, which a face-on solid cannot show — STYLE §6.1a), seen from above, in the house metal:
//   · the table: a polished navy top with its thickness and a lit bevel, the apron under it, two slab PANEL LEGS and the modesty panel
//     set back between them;
//   · ★ two closed leather BOARD PORTFOLIOS (rebuilt 2026-10-29, Timur: "Improve the SpaceX book … get closer with the camera to the both
//     books so that the audience actually knows what's going on"): each a pebble-grained navy leather cover with a tooled border and a
//     saddle-stitched edge, the company's mark FOIL-DEBOSSED into it (SpaceX's real wordmark, Tesla's T) over "COMMITTEE" in foil, a
//     rounded leather SPINE roll on the outer edge, steel CORNER GUARDS folded over the two open corners, the back board, and the page
//     block between the boards with its paper edges showing. Tesla's on the left, SpaceX's on the right.
//   · On "committees" the two slide toward each other along the table and STOP WITH A VISIBLE GAP between them by "merger" (talks, no
//     deal). Calm: one eased move each, their shadows going with them.
// COMMITTEE.close is the point to push in on so the two folders fill the frame (the lead wires the key).
// KIND object.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const KIND = "object";

type C = { arrive: number; committees: number; merger: number; end: number };
export const committeeTimes = (c: C) => ({
  /** the two portfolios slide toward each other (a soft whoosh / paper-on-wood slide each) and stop with a gap (a soft click as they stop) */
  slide: [c.committees - 6, c.merger - 8] as [number, number],
  /** the right one starts a beat later, so they never move as a mirrored pair */
  slideR: [c.committees, c.merger - 6] as [number, number],
  /** the frame the place's LAST action ends (the next place waits for it) */
  done: c.merger - 6,
});

// ── the table, in object space (x right, y DOWN, z toward the viewer) ──
const CX = 540, CY = 1060;
const TX0 = 48, TX1 = 1032, TY = 1000, TT = 30, TZ0 = -280, TZ1 = 170;
const FLOOR = 1340;
const PITCH = -44;
/** a portfolio: W across (x), D deep (z), its boards and page block */
const W = 284, D = 348, FZ0 = -228, FZ1 = FZ0 + D, BOARD = 5, PAGES = 11;
/** each portfolio's centre: at rest at the table's ends, stopped with a visible GAP between them */
const GAP = 64, LX0 = TX0 + 20 + W / 2, RX0 = TX1 - 20 - W / 2, LX1 = CX - GAP / 2 - W / 2, RX1 = CX + GAP / 2 + W / 2;
/** the cover's top, and the rig at the place's resting turn (for the camera's aims) */
const YT = TY - 2 * BOARD - PAGES;
const rigAt = (yaw: number): Rig => ({ cx: CX, cy: CY, persp: 2600, yaw, pitch: PITCH });
const aimOf = (yaw: number) => {
  const r = rigAt(yaw), mid = P(r, [CX, YT, (FZ0 + FZ1) / 2]), gap = P(r, [CX, YT, FZ0 + D * 0.42]);
  const l = P(r, [LX1 - W / 2, YT, FZ1]), rr = P(r, [RX1 + W / 2, YT, FZ1]);
  return { mid, gap, width: rr.x - l.x };
};
const AIM = aimOf(-3);
/** ★ the camera's aims: the table's centre, the gap between the portfolios (where they stop), and `close` — the push-in that fills the
 *  frame with the two folders so they READ (STYLE §16 2026-10-29). `close.dz` is the depth that brings their pair (~`close.width` px
 *  across at rest) to ~1,000 px: dz ≈ 1 − width / 1000, over the key's 0.9 (KEY_GENTLE); `c` 1 centres it. */
export const COMMITTEE = {
  x: CX, y: 1080, a: { x: CX, y: Math.round(AIM.gap.y) },
  close: { x: Math.round(AIM.mid.x), y: Math.round(AIM.mid.y), width: Math.round(AIM.width), dz: +((1 - AIM.width / 1000) / 0.9).toFixed(2), c: 1 },
} as const;

/** the place is drawn this much larger about the folders' middle (see the render below) */
const ZOOM = 1.12;

const LEATHER = "#0C2E5C";
/** the leather's pebble grain and its fine creases: seeded, fixed (the cover's print, never a pattern fill) */
const GRAIN = (() => {
  let s = 11; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const lit: string[] = [], dk: string[] = [];
  for (let i = 0; i < 900; i++) {
    const x = 6 + rnd() * (W - 12), y = 6 + rnd() * (D - 12), rr = 0.55 + rnd() * 1.0;
    (i % 2 ? lit : dk).push(`M${(x - rr).toFixed(1)} ${y.toFixed(1)}a${rr.toFixed(2)} ${rr.toFixed(2)} 0 1 0 ${(2 * rr).toFixed(2)} 0a${rr.toFixed(2)} ${rr.toFixed(2)} 0 1 0 ${(-2 * rr).toFixed(2)} 0`);
  }
  const cr: string[] = [];
  for (let i = 0; i < 40; i++) { const x = 10 + rnd() * (W - 20), y = 10 + rnd() * (D - 20), a = rnd() * Math.PI, l = 6 + rnd() * 14; cr.push(`M${x.toFixed(1)} ${y.toFixed(1)}l${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l).toFixed(1)}`); }
  return { lit: lit.join(""), dk: dk.join(""), cr: cr.join("") };
})();

/** a mark FOIL-DEBOSSED into the cover: the pressed-in wall in shade along its top-left, a lit lip along its bottom-right, the foil on top */
const Deboss: React.FC<{ d: string[]; x: number; y: number; s: number }> = ({ d, x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {d.map((p, i) => <path key={`l${i}`} d={p} transform={`translate(${1.4 / s} ${1.7 / s})`} fill={alpha("#8DB6E6", 0.5)} />)}
    {d.map((p, i) => <path key={`d${i}`} d={p} transform={`translate(${-1.2 / s} ${-1.4 / s})`} fill={alpha("#000814", 0.6)} />)}
    {d.map((p, i) => <path key={`f${i}`} d={p} fill="#D6E4F5" />)}
    {d.map((p, i) => <path key={`h${i}`} d={p} transform={`translate(${-0.5 / s} ${-0.5 / s})`} fill="none" stroke={alpha("#FFFFFF", 0.55)} strokeWidth={0.6 / s} />)}
  </g>
);

/** ★ ONE BOARD PORTFOLIO centred at x `cx`, its spine on the side `spine` (−1 left, +1 right) */
const folder = (r: Rig, k: string, cx: number, spine: -1 | 1, mark: React.ReactNode): Face[] => {
  const x0 = cx - W / 2, x1 = cx + W / 2, yB = TY - BOARD, yP = yB - PAGES;
  const leather = (g: number) => (n: V) => shade(r, n, LEATHER, g);
  const shadow = contactShadow(r, `${k}sh`, x0 + 4, x1 - 4, FZ0 + 4, FZ1 - 4, TY, 1, 16);
  // the back board, the page block (inset on the three open edges), the cover
  const px0 = spine < 0 ? x0 + 3 : x0 + 6, px1 = spine < 0 ? x1 - 6 : x1 - 3;
  const back = matBox(r, `${k}bb`, x0, x1, yB, TY, FZ0, FZ1, LEATHER, { chrome: 0.2 }, 0.62);
  const pages = matBox(r, `${k}pg`, px0, px1, yP, yB, FZ0 + 5, FZ1 - 5, "#D5E2F1", { chrome: 0, fall: 0 }, 0.95);
  const pf = pages.find((q) => q.k === `${k}pgf`);
  if (pf) pf.after = (
    <g data-probe-skip transform={onFace(r, [px0, yP, FZ1 - 5], [px1, yP, FZ1 - 5], [px0, yB, FZ1 - 5], px1 - px0, PAGES)}>
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={0} y={0.8 + i * 1.18} width={px1 - px0} height={0.42} fill={i % 2 ? alpha("#FFFFFF", 0.7) : alpha("#5B7FA8", 0.45)} />)}
    </g>
  );
  const cover = matBox(r, `${k}cv`, x0, x1, YT, yP, FZ0, FZ1, LEATHER, { chrome: 0.35, gloss: 0.14 }, 0.62);
  // the spine: a rounded leather ROLL along the outer edge, a touch proud of both boards (a cylinder along z)
  const sx = spine < 0 ? x0 + 2 : x1 - 2, sr = (TY - YT) / 2 + 2.5;
  const spineM: Mx = cat(tr(sx, (TY + YT) / 2, (FZ0 + FZ1) / 2), rx(90));
  const roll = lathe(r, `${k}sp`, spineM, [{ y: -D / 2 - 2, R: 0 }, { y: -D / 2 - 2, R: sr - 1.5 }, { y: -D / 2, R: sr }, { y: D / 2, R: sr }, { y: D / 2 + 2, R: sr - 1.5 }, { y: D / 2 + 2, R: 0 }],
    (n) => shade(r, n, "#1A4C88", 0.72), 22);
  // the steel corner guards folded over the two OPEN corners (on the cover, and down its edge)
  const ox = spine < 0 ? x1 : x0, dir = spine < 0 ? -1 : 1;
  const guard = (zc: number, zs: 1 | -1, kk: string): Face[] => {
    const L = 34;
    const plate = prism(r, `${kk}p`, cat(tr(0, YT, 0), rx(90)), [[ox + 0.6 * -dir, zc], [ox + dir * L, zc], [ox + 0.6 * -dir, zc + zs * -L]].map(([x, z]) => [x, z] as [number, number]), 0, 1.6, (n) => satin(r, n, -0.32));
    const lip = steelBox(r, `${kk}l`, Math.min(ox, ox - dir * 1.6), Math.max(ox, ox - dir * 1.6), YT - 1.6, yP + 1, zs > 0 ? zc - L : zc, zs > 0 ? zc : zc + L, -0.25, 0.4).map((q) => ({ ...q, skip: true }));
    const lip2 = steelBox(r, `${kk}m`, dir > 0 ? ox : ox - L, dir > 0 ? ox + L : ox, YT - 1.6, yP + 1, zs > 0 ? zc : zc - 1.6, zs > 0 ? zc + 1.6 : zc, -0.25, 0.4).map((q) => ({ ...q, skip: true }));
    return [...lip, ...lip2, ...plate];
  };
  // the cover's print: grain, the tooled border, the saddle stitch, the mark (passed in), the foil "COMMITTEE"
  const top = cover.find((q) => q.k === `${k}cvt`);
  if (top) top.after = (
    <g transform={onFace(r, [x0, YT - 0.2, FZ0], [x1, YT - 0.2, FZ0], [x0, YT - 0.2, FZ1], W, D)}>
      <g data-probe-skip>
        <path d={GRAIN.dk} fill={alpha("#000814", 0.13)} />
        <path d={GRAIN.lit} fill={alpha("#B3CEEF", 0.08)} />
        <path d={GRAIN.cr} fill="none" stroke={alpha("#000814", 0.14)} strokeWidth={0.8} />
        {/* a soft lit band across the whole cover (one panel-wide sheen) */}
        <path d={`M0 ${D * 0.1} L${W} ${D * 0.32} L${W} ${D * 0.5} L0 ${D * 0.28} Z`} fill={alpha("#FFFFFF", 0.06)} />
        {/* the tooled border: a pressed line (shade above, light below) */}
        <rect x={24} y={24} width={W - 48} height={D - 48} rx={6} fill="none" stroke={alpha("#000814", 0.42)} strokeWidth={1.6} />
        <rect x={25.2} y={25.4} width={W - 48} height={D - 48} rx={6} fill="none" stroke={alpha("#8DB6E6", 0.28)} strokeWidth={1} />
        {/* the saddle stitch round the edge: the stitches, their holes' shade */}
        <rect x={11} y={11} width={W - 22} height={D - 22} rx={7} fill="none" stroke={alpha("#000814", 0.3)} strokeWidth={2.4} strokeDasharray="6 4" strokeDashoffset={-0.6} />
        <rect x={10.4} y={10.4} width={W - 22} height={D - 22} rx={7} fill="none" stroke={alpha("#C9DCF2", 0.75)} strokeWidth={1.5} strokeDasharray="6 4" />
      </g>
      {mark}
    </g>
  );
  return units(shadow, back, pages, cover, roll, guard(FZ1, 1, `${k}g1`), guard(FZ0, -1, `${k}g0`));
};

/** the foil word under a mark: pressed in, foil on top */
const FoilWord: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <text data-print data-probe-skip x={x - 0.9} y={y - 1} textAnchor="middle" fontFamily="Anton" fontSize={19} letterSpacing={5} fill={alpha("#000814", 0.55)}>COMMITTEE</text>
    <text data-print x={x} y={y} textAnchor="middle" fontFamily="Anton" fontSize={19} letterSpacing={5} fill="#D6E4F5">COMMITTEE</text>
  </g>
);

export const Committee: React.FC<C> = (c) => {
  const f = useCurrentFrame();
  const T = committeeTimes(c);
  const r: Rig = rigAt(swing(f, c.arrive, c.end, -5, -2, 0.5));
  const L = (fs: (Face | null)[], dz: number) => (fs.filter(Boolean) as Face[]).map((q) => ({ ...q, z: q.z + dz }));
  const lx = LX0 + (LX1 - LX0) * rInOut(f, ...T.slide);
  const rx_ = RX0 + (RX1 - RX0) * rInOut(f, ...T.slideR);
  const layers: Face[] = [];

  // ── the floor shadows under the two panel legs ──
  const LEGS: [number, number][] = [[TX0 + 44, TX0 + 72], [TX1 - 72, TX1 - 44]];
  for (const [x0, x1] of LEGS) layers.push(...L(contactShadow(r, `cmfs${x0}`, x0, x1, TZ0 + 40, TZ1 - 50, FLOOR, 1.1, 22), -2e6));
  // ── the two PANEL LEGS (a boardroom table's slab ends), and the modesty panel set back between them ──
  layers.push(...L(metalBox(r, "cmmp", TX0 + 72, TX1 - 72, TY + TT, TY + TT + 190, -46, -38, -0.12), -9500));
  for (const [x0, x1] of LEGS) layers.push(...L(steelBox(r, `cmlg${x0}`, x0, x1, TY + TT, FLOOR, TZ0 + 40, TZ1 - 50, 0, 0.4), -9000));
  // ── the apron under the top ──
  layers.push(...L(metalBox(r, "cmap", TX0 + 30, TX1 - 30, TY + TT, TY + TT + 16, TZ0 + 30, TZ1 - 30, -0.1), -8000));
  // ── the top: a polished navy slab (its top lit by the key and carrying the polish's streak), its edges in the house metal ──
  const top = box(r, "cmtp", TX0, TX1, TY, TY + TT, TZ0, TZ1, {
    top: "#2A62A6", bottom: metal(r, [0, 1, 0]), front: metal(r, [0, 0, 1], 0.1), back: metal(r, [0, 0, -1]), left: metal(r, [-1, 0, 0], 0.1), right: metal(r, [1, 0, 0]),
  }, { chrome: 0.9 }).map((q) => (q.k === "cmtpt" ? { ...q, gloss: 0.45 } : q));
  const tt = top.find((q) => q.k === "cmtpt");
  if (tt) {
    const a = P(r, [TX0 + 3, TY - 0.3, TZ1 - 2]), b = P(r, [TX1 - 3, TY - 0.3, TZ1 - 2]), cc = P(r, [TX0 + 3, TY - 0.3, TZ0 + 3]);
    tt.after = (
      <g data-probe-skip>
        {/* the bevel's catchlight along the top's front and left edges (toward the key) */}
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={alpha("#DCE9F7", 0.55)} strokeWidth={1.6} />
        <line x1={a.x} y1={a.y} x2={cc.x} y2={cc.y} stroke={alpha("#DCE9F7", 0.35)} strokeWidth={1.3} />
      </g>
    );
  }
  layers.push(...L(top, -7000));

  // ── the two portfolios (each a unit: its parts in their own order) ──
  const tS = 120 / 24;
  const swS = (W * 0.78) / SPXW_VIEW.w;
  const markL = (
    <g>
      <Deboss d={[MARKS.tesla]} x={W / 2 - 12 * tS} y={D * 0.44 - 12 * tS - 6} s={tS} />
      <FoilWord x={W / 2} y={D * 0.44 + 92} />
    </g>
  );
  const markR = (
    <g>
      <Deboss d={SPXW_D} x={W / 2 - (SPXW_VIEW.w * swS) / 2} y={D * 0.44 - 33 * swS} s={swS} />
      <FoilWord x={W / 2} y={D * 0.44 + 92} />
    </g>
  );
  // (the table is not measured: its back edge runs BEHIND the folders, and the probe cannot see that they cover it — it read the edge as a
  // line through their COMMITTEE labels; the covers below are the place's measured shapes)
  for (const q of layers) q.skip = true;
  const fL = folder(r, "cmL", lx, -1, markL), fR = folder(r, "cmR", rx_, 1, markR);
  // (the folders' covers are the measured shapes; the folders paint over the table, the nearer-to-the-key one first)
  const cvL = fL.find((q) => q.k === "cmLcvt"), cvR = fR.find((q) => q.k === "cmRcvt");
  if (cvL) cvL.skip = false;
  if (cvR) cvR.skip = false;

  const foot = P(r, [CX, FLOOR, 0]);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Pool3D x={CX} y={foot.y} w={1040} on={0.55} />
      <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* ★ drawn ZOOM× about the folders' middle, so with the camera's push (dz 0.18, the key limit) they fill the frame and READ (STYLE
            §16 2026-10-29). An SVG transform, never a CSS one round the place: the probe maps SVG text by getScreenCTM, which a CSS scale
            on an HTML ancestor does not enter — the labels then read shifted off their covers (a false LINE) */}
        <g transform={`translate(${COMMITTEE.close.x} ${COMMITTEE.close.y}) scale(${ZOOM}) translate(${-COMMITTEE.close.x} ${-COMMITTEE.close.y})`}>
          <Faces list={layers} />
          <Faces list={fL} />
          <Faces list={fR} />
        </g>
      </svg>
    </div>
  );
};
