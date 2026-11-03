import React from "react";
import { useCurrentFrame } from "remotion";
import { rInOut, alpha } from "../anim";
import { Faces, P, box, metal, steelBox, metalBox, matBox, contactShadow, onFace, swing, type Face } from "../p3";
import { type Rig } from "../rig";
import { Pool3D } from "../s3";
import { MARKS } from "../marks";
import { SPXW_D, SPXW_VIEW } from "../spxwordmark";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// teachE — "Musk has said both companies set up committees to look at a possible merger." A BOARDROOM TABLE IN REAL DEPTH (the folders
// slide ACROSS its top toward each other, which a face-on solid cannot show — STYLE §6.1a), seen from above, in the house metal:
//   · the table: a polished navy top with its thickness and a lit bevel, the apron under it, two slab PANEL LEGS and the modesty panel
//     set back between them;
//   · two closed leather BOARD-MEETING PORTFOLIOS lying on it, one at each end — Tesla's (the T, foil-debossed in its cover) on the left and
//     SpaceX's (its wordmark) on the right (STYLE §16 2026-10-22: no made-up objects, a logo never in a box): each a cover board, the
//     page block showing on its open edges, the rounded spine on its outer edge, the stitching round the cover.
//   · On "committees" the two slide toward each other along the table and STOP WITH A VISIBLE GAP between them by "merger" (talks, no
//     deal). Calm: one eased move each, their shadows going with them.
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
const TX0 = 96, TX1 = 984, TY = 1000, TT = 30, TZ0 = -250, TZ1 = 150;
const FLOOR = 1340;
/** a portfolio: W across (x), D deep (z), its boards and page block */
const W = 250, D = 316, FZ0 = -206, FZ1 = FZ0 + D, BOARD = 3.5, PAGES = 7;
/** each portfolio's centre: at rest at the table's ends, stopped with a visible GAP between them */
const GAP = 76, LX0 = TX0 + 22 + W / 2, RX0 = TX1 - 22 - W / 2, LX1 = CX - GAP / 2 - W / 2, RX1 = CX + GAP / 2 + W / 2;
/** the camera's aims: the table's centre, and the gap between the portfolios (where they stop) */
export const COMMITTEE = { x: CX, y: 1080, a: { x: CX, y: 990 } } as const;

const LEATHER = "#103A6E";
/** one portfolio centred at x `cx`, its spine on the side `spine` (−1 left, +1 right), its cover's mark drawn by `mark(W, D)` */
const folder = (r: Rig, k: string, cx: number, spine: -1 | 1, mark: React.ReactNode): Face[] => {
  const x0 = cx - W / 2, x1 = cx + W / 2;
  const yT = TY - 2 * BOARD - PAGES;   // the cover's top
  const out: Face[] = [];
  // the shadow on the table: its own footprint, leaning right and back (away from the key)
  out.push(...contactShadow(r, `${k}sh`, x0 + 4, x1 - 4, FZ0 + 4, FZ1 - 4, TY, 0.9, 16).map((q) => ({ ...q, z: q.z + 1e6 - 6000 })));
  // the back board, the page block (inset on the three open edges), the cover
  const ins = (s: number) => (spine < 0 ? [x0 + 2, x1 - s] : [x0 + s, x1 - 2]) as [number, number];
  const [px0, px1] = ins(6);
  out.push(...matBox(r, `${k}bb`, x0, x1, TY - BOARD, TY, FZ0, FZ1, LEATHER, { chrome: 0.3 }, 0.62));
  out.push(...matBox(r, `${k}pg`, px0, px1, TY - BOARD - PAGES, TY - BOARD, FZ0 + 6, FZ1 - 6, "#C9DCF2", { chrome: 0, fall: 0.3 }, 0.95));
  const cover = matBox(r, `${k}cv`, x0, x1, yT, TY - BOARD - PAGES, FZ0, FZ1, LEATHER, { chrome: 0.45, gloss: 0.2 }, 0.6);
  // the spine: a rounded leather roll along the outer edge, a touch proud of both boards
  const sx0 = spine < 0 ? x0 - 5 : x1 - 9, sx1 = spine < 0 ? x0 + 9 : x1 + 5;
  const sp = matBox(r, `${k}sp`, sx0, sx1, yT - 1.5, TY, FZ0 - 1, FZ1 + 1, "#1E528F", { chrome: 0.6 }, 0.72);
  const top = cover.find((q) => q.k === `${k}cvt`);
  if (top) top.after = (
    <g data-probe-skip transform={onFace(r, [x0, yT - 0.2, FZ0], [x1, yT - 0.2, FZ0], [x0, yT - 0.2, FZ1], W, D)}>
      {/* the stitching round the cover, and a soft grain sheen */}
      <rect x={13} y={13} width={W - 26} height={D - 26} rx={8} fill="none" stroke={alpha("#8DB6E6", 0.42)} strokeWidth={1.5} strokeDasharray="7 5" />
      <rect x={14.2} y={14.2} width={W - 26} height={D - 26} rx={8} fill="none" stroke={alpha("#000814", 0.25)} strokeWidth={1.2} strokeDasharray="7 5" />
      {mark}
    </g>
  );
  out.push(...cover, ...sp);
  return out;
};

/** a mark FOIL-DEBOSSED into the cover: the pressed-in wall in shade along its top-left, a lit lip along its bottom-right, the foil on top */
const Deboss: React.FC<{ d: string[]; x: number; y: number; s: number }> = ({ d, x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {d.map((p, i) => <path key={`l${i}`} d={p} transform={`translate(${1.3 / s} ${1.6 / s})`} fill={alpha("#8DB6E6", 0.45)} />)}
    {d.map((p, i) => <path key={`d${i}`} d={p} transform={`translate(${-1.1 / s} ${-1.3 / s})`} fill={alpha("#000814", 0.55)} />)}
    {d.map((p, i) => <path key={`f${i}`} d={p} fill="#C9DCF2" />)}
  </g>
);

export const Committee: React.FC<C> = (c) => {
  const f = useCurrentFrame();
  const T = committeeTimes(c);
  const r: Rig = { cx: CX, cy: CY, persp: 2600, yaw: swing(f, c.arrive, c.end, -6, -2, 0.5), pitch: -38 };
  const L = (fs: (Face | null)[], dz: number) => (fs.filter(Boolean) as Face[]).map((q) => ({ ...q, z: q.z + dz }));
  const lx = LX0 + (LX1 - LX0) * rInOut(f, ...T.slide);
  const rx = RX0 + (RX1 - RX0) * rInOut(f, ...T.slideR);
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
    const a = P(r, [TX0 + 3, TY - 0.3, TZ1 - 2]), b = P(r, [TX1 - 3, TY - 0.3, TZ1 - 2]), c = P(r, [TX0 + 3, TY - 0.3, TZ0 + 3]);
    tt.after = (
      <g data-probe-skip>
        {/* the bevel's catchlight along the top's front and left edges (toward the key) */}
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={alpha("#DCE9F7", 0.55)} strokeWidth={1.6} />
        <line x1={a.x} y1={a.y} x2={c.x} y2={c.y} stroke={alpha("#DCE9F7", 0.35)} strokeWidth={1.3} />
      </g>
    );
  }
  layers.push(...L(top, -7000));

  // ── the two portfolios ──
  const tS = 132 / 24;
  const swS = (W * 0.86) / SPXW_VIEW.w;
  layers.push(...L(folder(r, "cmL", lx, -1, <Deboss d={[MARKS.tesla]} x={W / 2 - 12 * tS} y={D / 2 - 12 * tS} s={tS} />), 0));
  layers.push(...L(folder(r, "cmR", rx, 1, <Deboss d={SPXW_D} x={W / 2 - (SPXW_VIEW.w * swS) / 2} y={D / 2 - 30 * swS} s={swS} />), 0));

  const foot = P(r, [CX, FLOOR, 0]);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Pool3D x={CX} y={foot.y} w={1040} on={0.55} />
      <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Faces list={layers} />
      </svg>
    </div>
  );
};
