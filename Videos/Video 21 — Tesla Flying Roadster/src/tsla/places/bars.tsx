import React from "react";
import { useCurrentFrame } from "remotion";
import { rInOut, rOut, clamp01, alpha } from "../anim";
import { figure, label, Turn } from "../kit";
import { fromDepth } from "../world";
import { Pool3D } from "../s3";
import { DELIVERIES, DELIVERIES_PCT, PROFIT, PROFIT_PCT } from "../data";
import { figLand } from "./land";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// teachB / teachB2 — "And Tesla's car business is shrinking. From July to September, deliveries fell 2% and profit fell 43%."
// TWO PAIRS OF BARS, Q3 2025 AGAINST Q3 2026, EACH PAIR ON ITS OWN ZERO-BASED SCALE (the brief: "deliveries (497,099 → 486,532) and net
// income ($1.37B → $787M), each pair on its own honest scale, the falls lit red"). Deliveries in cars, profit in dollars: two different
// units, so each pair stands on its OWN axis (the two axes do not join), the older bar of each at the same height (its own 100%).
// ★ 2-D (STYLE §6.1a): the house construction — Video 11's `Pillar` / Video 12's `Column` (a flat front face, its cap and side as painted
// facets up and to the right), on a Turn with its pool of light. A fall is Video 12's SHORTFALL: the newer bar carried on up to the older
// bar's level as a SEE-THROUGH RED EXTENSION of its own solid (face, side and cap in translucent red, a dashed outline — STYLE §6.3),
// with the pair's verdict in red over it. One figure per bar, printed white inside its face under its top (STYLE §6.6), one label under
// each bar (Q3 2025 / Q3 2026) and one under each pair (DELIVERIES / PROFIT).
// Beats: the axes and labels arrive with the camera; on "business … shrinking" the deliveries bars climb (the bike chain); on
// "deliveries" the 2% shortfall lights red and −2% lands on "2%"; the camera travels to the profit pair (teachB2, 1200); on "profit" its
// bars climb; on "43%" the red shortfall draws up and −43% lands.
// Data: Tesla's deliveries releases and its Q3 2026 10-Q (data.ts DELIVERIES, PROFIT) — one dataset per pair.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const KIND = "bars";

const AXIS = 1340;
/** each pair's own scale: its older (Q3 2025) bar is MAXH tall; the newer one in proportion, from zero */
const MAXH = 600;
/** bar width, the gap inside a pair, the extrusion (STYLE §6.2: 22–34 for bars) */
const BWID = 160, GAP = 36, D = 28;
/** the pairs' centres (the group's own centre, its extrusion included), ~520 apart: the travel at teachB2 goes from one to the other */
const PAIRS = [
  { cx: 540, name: "DELIVERIES", old: DELIVERIES.q325, now: DELIVERIES.q326, pct: DELIVERIES_PCT, fmt: (v: number) => `${Math.round(v / 1000)}K` },
  { cx: 1580, name: "PROFIT", old: PROFIT.q325, now: PROFIT.q326, pct: PROFIT_PCT, fmt: (m: number) => (m >= 1000 ? `$${(m / 1000).toFixed(2)}B` : `$${m}M`) },
] as const;
const GROUP = 2 * BWID + GAP + D;
const barX = (cx: number, k: 0 | 1) => cx - GROUP / 2 + k * (BWID + GAP);
/** the verdict: a whole percent with a true minus (STYLE §5.6) */
const verdict = (pct: number) => `−${Math.abs(Math.round(pct))}%`;

export const BARS = {
  x: 540, y: 1020,
  first: { x: PAIRS[0].cx, y: 1020 },
  second: { x: PAIRS[1].cx, y: 1020 },
  // the travel: a whole framing, from the deliveries pair to the profit pair (each centred in its own framing)
  // (the profit pair rests 40 right of centre: the slide on to the counter shares ≥ 15 f with it)
  travel: 1000,
} as const;

type C = { arrive: number; business: number; shrinking: number; july: number; deliveries: number; p2: number; profit: number; p43: number; end: number };
/** its animation windows (the SFX score reads them); `done`: the frame its LAST action ends (the next place waits for it — registry.tsx) */
export const barsTimes = (c: C) => {
  // the deliveries pair climbs on "business … shrinking" (in-out, 32 f each, the newer 10 f behind); the profit pair on "profit"
  const growD: [number, number][] = [[c.business - 5, c.business + 27], [c.business + 5, c.business + 37]];
  const growP: [number, number][] = [[c.profit - 10, c.profit + 20], [c.profit - 4, c.profit + 26]];
  return {
    /** the axes and the labels: with the camera */
    base: [c.arrive - 20, c.arrive + 16] as [number, number],
    /** the bars climbing (the bike chain under each), deliveries then profit */
    grow: [...growD, ...growP],
    /** each bar's figure lands as its bar tops out (a ping on the pair's second) */
    fig: [figLand(growD[0][1] + 2), figLand(growD[1][1] + 2), figLand(growP[0][1] + 2), figLand(growP[1][1] + 2)] as [number, number][],
    /** the red shortfalls draw up from the newer bar's top: deliveries on "deliveries", profit on "43%" */
    gap: [[c.deliveries - 4, c.deliveries + 18], [c.p43, c.p43 + 18]] as [number, number][],
    /** the verdicts land: −2% on "2%", −43% just after "43%" (a lowwoosh verdict / a ping) */
    verdict: [figLand(c.p2), figLand(c.p43 + 6)] as [number, number][],
    done: c.p43 + 22,
  };
};

/** one extruded column on its axis (Video 11's Pillar, Video 12's Column): its depth grows with its height, and it fades up over its first
 *  12% (no pop) */
const Column: React.FC<{ x0: number; h: number; g: number }> = ({ x0, h, g }) => {
  if (h <= 0.5) return null;
  const W = BWID, dd = Math.min(D, h * 0.5, W * 0.5);
  return (
    <div style={{ position: "absolute", left: x0, top: AXIS - h - dd * 0.7, width: W + dd, height: h + dd * 0.7, opacity: clamp01(g / 0.12) }}>
      <div data-probe-skip style={{ position: "absolute", left: -W * 0.1, top: h + dd * 0.7 - 10, width: W * 1.4, height: 30, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,8,20,0.55) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", inset: 0, clipPath: `polygon(${W - 1}px ${dd * 0.7}px, ${W + dd}px 0px, ${W + dd}px ${h}px, ${W - 1}px ${h + dd * 0.7}px)`, background: "linear-gradient(180deg, #033671 0%, #001731 100%)" }} />
      <div style={{ position: "absolute", inset: 0, clipPath: `polygon(0px ${dd * 0.7 + 1}px, ${dd}px 0px, ${W + dd}px 0px, ${W}px ${dd * 0.7 + 1}px)`, background: "linear-gradient(120deg, #E3ECF7 0%, #357BCA 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: dd * 0.7 - 1, width: W + 1, height: h + 1,
        background: "linear-gradient(168deg, #92B8E2 0%, #265B98 42%, #002A5A 100%)", boxShadow: `inset 0 1px 0 ${alpha("#ffffff", 0.5)}` }} />
    </div>
  );
};

/** ★ the shortfall (Video 12): the newer bar carried on up to the older bar's level as a see-through red extension — face, side and cap in
 *  translucent red, with a dashed outline (STYLE §6.3); its own cap shows through it */
const Shortfall: React.FC<{ x0: number; base: number; gh: number }> = ({ x0, base, gh }) => {
  if (gh <= 0.5) return null;
  const W = BWID, dd = D, cy = dd * 0.7;
  const red = (a: number) => alpha("#ef2b3d", a);
  const pts = (q: [number, number][]) => q.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <div style={{ position: "absolute", left: x0, top: base - gh - cy, width: W + dd, height: gh + cy }}>
      <div style={{ position: "absolute", inset: 0, clipPath: `polygon(${W}px ${cy}px, ${W + dd}px 0px, ${W + dd}px ${gh}px, ${W}px ${gh + cy}px)`, background: red(0.3) }} />
      <div style={{ position: "absolute", inset: 0, clipPath: `polygon(0px ${cy}px, ${dd}px 0px, ${W + dd}px 0px, ${W}px ${cy}px)`, background: red(0.36) }} />
      <div style={{ position: "absolute", left: 0, top: cy, width: W, height: gh, background: red(0.24) }} />
      <svg data-probe-skip width={W + dd + 4} height={gh + cy + 4} style={{ position: "absolute", left: -2, top: -2, overflow: "visible" }}>
        <g transform="translate(2 2)" fill="none" stroke="#FF8A80" strokeWidth={3} strokeDasharray="10 8">
          <polygon points={pts([[0, cy], [W, cy], [W, gh + cy], [0, gh + cy]])} />
          <polyline points={pts([[0, cy], [dd, 0], [W + dd, 0], [W, cy]])} />
          <polyline points={pts([[W + dd, 0], [W + dd, gh], [W, gh + cy]])} />
        </g>
      </svg>
    </div>
  );
};

export const Bars: React.FC<C> = (c) => {
  const f = useCurrentFrame();
  const T = barsTimes(c);
  const g = T.grow.map((w) => rInOut(f, ...w));
  const fq = T.fig.map((w) => rOut(f, ...w));
  const gp = T.gap.map((w) => rInOut(f, ...w));
  const vq = T.verdict.map((w) => rOut(f, ...w));
  // the axes and every label are the place's base: they come with the camera
  const base = rInOut(f, ...T.base);
  // ★ each pair is its own framing (the camera travels a frame between them, so the deliveries pair is wholly gone when the profit pair
  // rests — MARGIN): each stands in its own container offset by its centre, with its own Turn swinging about IT (a Turn yaws about its
  // container's centre: one Turn 1,000 px off-centre would swing the far pair through depth) and its own pool
  return (
    <>
      {PAIRS.map((pr0, p) => {
        const pr = { ...pr0, cx: 540 };
        const hOld = MAXH, hNow = (MAXH * pr.now) / pr.old;
        const xs = [barX(pr.cx, 0), barX(pr.cx, 1)] as const;
        const h = [hOld * g[2 * p], hNow * g[2 * p + 1]];
        const left = xs[0] - 40, right = xs[1] + BWID + D + 40;
        const figs = [pr.fmt(pr.old), pr.fmt(pr.now)];
        return (
          <div key={pr.name} style={{ position: "absolute", left: pr0.cx - 540, top: 0, width: 1080, height: 1920 }}>
          <Turn at={c.arrive} end={c.end} from={-5} to={3.5} amp={0.9}>
            {/* this pair's own axis (the two pairs' scales are different: the axes do not join) */}
            <div style={{ position: "absolute", left, width: (right - left) * base, top: AXIS, height: 3, background: alpha("#CCDDF1", 0.4) }} />
            {[0, 1].map((k) => <Column key={k} x0={xs[k]} h={h[k]} g={g[2 * p + k]} />)}
            <Shortfall x0={xs[1]} base={AXIS - hNow} gh={(hOld - hNow) * gp[p]} />
            {/* the figures, each INSIDE its column's front face under its top (STYLE §6.6: white inside a bar) */}
            {[0, 1].map((k) => fq[2 * p + k] > 0.001 && (
              <div key={`f${k}`} style={{ position: "absolute", left: xs[k] + BWID / 2, top: AXIS - (k ? hNow : hOld) + 34, ...figure(56, "#FFFFFF"), ...fromDepth(fq[2 * p + k], "50% 0%", "translateX(-50%)") }}>{figs[k]}</div>
            ))}
            {/* the quarter under each bar, the pair's name under both */}
            {["Q3 2025", "Q3 2026"].map((q, k) => (
              <div key={q} style={{ position: "absolute", left: xs[k] + BWID / 2, top: AXIS + 36, ...label(30, k ? "#E3EDF9" : "#8DB6E6"), letterSpacing: 2, opacity: base, transform: "translateX(-50%)" }}>{q}</div>
            ))}
            <div style={{ position: "absolute", left: pr.cx, top: AXIS + 92, ...label(38, "#E3EDF9"), letterSpacing: 4, opacity: base, transform: "translateX(-50%)" }}>{pr.name}</div>
            {/* ★ the verdict, in the loss red, over the newer bar's red shortfall */}
            {vq[p] > 0.001 && (
              <div style={{ position: "absolute", left: xs[1] + (BWID + D) / 2, top: AXIS - hOld - D * 0.7 - 112, ...figure(84, "#FF8A80"), ...fromDepth(vq[p], "50% 100%", "translateX(-50%)") }}>{verdict(pr.pct)}</div>
            )}
            <Pool3D x={540} y={AXIS + 20} w={760} on={0.55} />
          </Turn>
          </div>
        );
      })}
    </>
  );
};
