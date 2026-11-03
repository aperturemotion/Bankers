import React from "react";
import { useCurrentFrame } from "remotion";
import { rInOut, rOut, clamp01, alpha, mixHex } from "../anim";
import { Turn, label } from "../kit";
import { Pool3D } from "../s3";
import { FlatDefs, FBox, FSolid, rrect } from "../flat";
import { fromDepth } from "../world";
import { MARKS } from "../marks";
import { MARKET, MARKET_T } from "../data";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// teachC — "Yet Tesla is worth about $1.6 trillion." A MECHANICAL DRUM COUNTER (the brief: "a COUNTER rolling up to $1.6T, labelled
// MARKET VALUE, with the stamp as of Oct 27, 2026"), in the house 2-D solid (STYLE §6.1a: a counter is read face-on), Video 13's counter
// recipe made richer: a deep machined housing on two feet, a recessed bezel plate with four screws, Tesla's T engraved on the bezel above
// the read-out, five windows — a fixed "$" wheel, two number DRUMS with a fixed decimal point between them, a fixed "T" wheel — an inlaid
// NAMEPLATE under them (AS OF OCT 27, 2026: the counter's own print, there from its first frame), and a knurled reset knob on its side.
//   · The base (the whole counter, reading $0.0T) arrives with the camera.
//   · On "worth" the drums COUNT up as a real odometer does (STYLE §9.6: counters count, never swap): the tenths drum runs 0 → 9 → 0 → 6
//     (sixteen steps), and the units drum carries 0 → 1 only while the tenths drum passes 9 → 0. They land as the voice says "$1.6"
//     ("t16"); MARKET VALUE, the place's one label, comes out of depth under the counter on "worth".
//   · On "trillion" the read-out's ring light comes up round the windows (a blend) and a glint crosses the glass.
// KIND counter.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const KIND = "counter";

type C = { arrive: number; yet: number; worth: number; t16: number; trillion: number; end: number };
/** the figure the drums land on, in tenths of a trillion (16 → $1.6T) — from data.ts, never typed */
const TENTHS = Math.round(MARKET_T * 10);
if (TENTHS !== 16) throw new Error("worth: the counter is built for $1.6T (data.ts MARKET_T)");

export const worthTimes = (c: C) => ({
  /** the drums count from $0.0T to $1.6T (the data texture under the count; a click as they land) */
  count: [c.worth - 9, c.t16 + 8] as [number, number],
  /** the units drum's carry 0 → 1 (inside the count: while the tenths drum passes 9 → 0) */
  carry: [c.worth + 10, c.worth + 22] as [number, number],
  /** MARKET VALUE comes out of depth (a flick) */
  label: [c.worth - 4, c.worth + 16] as [number, number],
  /** the ring light comes up and a glint crosses the glass, on "trillion" (a soft ping-free sheen: a whooshsoft / flick) */
  light: [c.trillion - 4, c.trillion + 14] as [number, number],
  /** the frame the place's LAST action ends (the next place waits for it) */
  done: c.trillion + 14,
});

// ── the counter's layout (its own 1080×1920 frame) ──
const SW = 96, DW = 148, PT = 60, GAP = 34, DH = 236;
const WIN_W = SW + GAP + DW + PT + DW + GAP + SW;    // the windows' run, "$" to "T"
const WX0 = 540 - WIN_W / 2, WY0 = 852, WY1 = WY0 + DH;
const HX0 = WX0 - 74, HX1 = WX0 + WIN_W + 74, HY0 = 690, HY1 = 1236, HD = 46;
const FLOOR = HY1 + 24;
/** the windows' x: "$", units drum, tenths drum, "T" */
const XS = WX0, XU = XS + SW + GAP, XT = XU + DW + PT, XUNIT = XT + DW + GAP;
/** the camera's aims: the construction's centre, and the drums */
export const WORTH = { x: 540 + HD / 2, y: (HY0 + FLOOR) / 2, a: { x: (XU + XT + DW) / 2, y: (WY0 + WY1) / 2 } } as const;

/** one window's recess: a dark rim, an inner shade at its top and foot (the drum turns away from the glass there) */
const Recess: React.FC<{ x: number; w: number; ring: number }> = ({ x, w, ring }) => (
  <g data-probe-skip>
    <rect x={x - 12} y={WY0 - 12} width={w + 24} height={DH + 24} rx={14} fill="#011A38" />
    {/* the bevel round the recess: shade on its top-left lip (the cut faces down), a catchlight on its bottom-right */}
    <path d={`M${x - 12} ${WY1 + 4} V${WY0 - 2} Q${x - 12} ${WY0 - 12} ${x - 2} ${WY0 - 12} H${x + w + 4}`} fill="none" stroke={alpha("#000814", 0.7)} strokeWidth={2.4} />
    <path d={`M${x + w + 12} ${WY0 - 4} V${WY1 + 2} Q${x + w + 12} ${WY1 + 12} ${x + w + 2} ${WY1 + 12} H${x - 4}`} fill="none" stroke={alpha("#B3CEEF", 0.5)} strokeWidth={1.8} />
    {/* the ring light (dark at rest; it comes up on "trillion") */}
    <rect x={x - 6} y={WY0 - 6} width={w + 12} height={DH + 12} rx={10} fill="none" stroke={mixHex("#0B2F5E", "#B3CEEF", ring)} strokeWidth={2.2} />
    <rect x={x - 9} y={WY0 - 9} width={w + 18} height={DH + 18} rx={12} fill="none" stroke={alpha("#4D8ED9", 0.35 * ring)} strokeWidth={6} />
  </g>
);

/** a drum seen through its window: an HTML strip of digits, rolled to `pos` (continuous, digits), shaded as a cylinder */
const Drum: React.FC<{ x: number; w: number; pos?: number; glyph?: string; glint: number }> = ({ x, w, pos = 0, glyph, glint }) => {
  const base = Math.floor(pos), fr = pos - base;
  const rows = glyph ? [0] : [-1, 0, 1];
  return (
    <div style={{ position: "absolute", left: x, top: WY0, width: w, height: DH, overflow: "hidden", borderRadius: 8,
      background: "linear-gradient(180deg, #5F8FCB 0%, #C9DCF2 18%, #F5F9FD 38%, #F5F9FD 62%, #C9DCF2 82%, #5F8FCB 100%)" }}>
      {rows.map((k) => (
        <div key={k} data-print {...(k !== 0 || fr > 0.02 ? { "data-probe-skip": true } : {})} style={{ position: "absolute", left: 0, width: w, fontFamily: "Anton", fontSize: glyph ? 150 : 172,
          top: (k - (glyph ? 0 : fr)) * DH * 0.9 + 20, height: DH - 40, textAlign: "center",
          lineHeight: `${DH - 40}px`, color: "#0A2A55" }}>
          {glyph ?? String((((base + k) % 10) + 10) % 10)}
        </div>
      ))}
      {/* the drum's curve: the digits darken as they turn away over its top and under its foot */}
      <div data-probe-skip style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(1,26,56,0.62) 0%, rgba(1,26,56,0) 24%, rgba(1,26,56,0) 76%, rgba(1,26,56,0.66) 100%)" }} />
      {/* the window's glass: one fixed sheen, and the glint that crosses it on "trillion" */}
      <div data-probe-skip style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 30%)" }} />
      {glint > 0.001 && glint < 0.999 && (
        <div data-probe-skip style={{ position: "absolute", top: -20, bottom: -20, width: 60, left: -80 + (w + 160) * glint,
          background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)", transform: "skewX(-16deg)" }} />
      )}
    </div>
  );
};

export const Worth: React.FC<C> = (c) => {
  const f = useCurrentFrame();
  const T = worthTimes(c);
  const id = "wt";
  // ── the odometer: v tenths, eased over the count; the tenths drum shows v, the units drum carries while the tenths pass 9 → 0 ──
  const v = TENTHS * rInOut(f, ...T.count);
  const units = Math.floor(v / 10) + clamp01((v % 10) - 9);
  const lq = rOut(f, ...T.label);
  const ring = rInOut(f, T.light[0], T.light[0] + 12);
  const glint = rInOut(f, T.light[0] + 2, T.light[1]);
  const tS = 64 / 24;   // Tesla's T: 64 px tall
  return (
    <Turn at={c.arrive} end={c.end} from={-5} to={4} amp={0.8}>
      <Pool3D x={540} y={FLOOR} w={1000} on={0.55} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <FlatDefs id={id} />
        <defs data-probe-skip>
          <linearGradient id="wtHouse" x1="0.62" y1="0" x2="0.38" y2="1"><stop offset="0" stopColor="#3C7CC6" /><stop offset="0.42" stopColor="#0B3F82" /><stop offset="1" stopColor="#02234A" /></linearGradient>
          <linearGradient id="wtBezel" x1="0.6" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#1F5596" /><stop offset="0.55" stopColor="#0A3368" /><stop offset="1" stopColor="#021A3A" /></linearGradient>
          <linearGradient id="wtPlate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#021A3A" /><stop offset="1" stopColor="#0B3F82" /></linearGradient>
          <linearGradient id="wtKnob" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B3CEEF" /><stop offset="0.35" stopColor="#4D8ED9" /><stop offset="1" stopColor="#02234A" /></linearGradient>
          <radialGradient id="wtShadow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#000814" stopOpacity="0.62" /><stop offset="0.55" stopColor="#000814" stopOpacity="0.22" /><stop offset="1" stopColor="#000814" stopOpacity="0" /></radialGradient>
        </defs>

        {/* the contact shadow: the counter's footprint, darkest in a thin line at its feet, leaning right (away from the key) */}
        <ellipse data-probe-skip cx={540 + 40} cy={FLOOR + 2} rx={(HX1 - HX0) / 2 + 80} ry={26} fill="url(#wtShadow)" />
        <rect data-probe-skip x={HX0 + 40} y={FLOOR - 2} width={HX1 - HX0 - 40} height={5} rx={2.5} fill={alpha("#000814", 0.55)} />

        {/* the feet */}
        <FBox id={id} x0={HX0 + 50} y0={HY1 - 4} x1={HX0 + 150} y1={FLOOR} d={30} skipBack />
        <FBox id={id} x0={HX1 - 150} y0={HY1 - 4} x1={HX1 - 50} y1={FLOOR} d={30} skipBack />

        {/* the housing: a deep rounded body, its depth up and to the right */}
        <FSolid id={id} outline={rrect(HX0, HY0, HX1, HY1, 34)} d={HD} face="url(#wtHouse)" skip />
        {/* the reset knob, standing out of the housing's side: a knurled thumbwheel on its boss */}
        <g data-probe-skip>
          <ellipse cx={HX1 + HD * 0.55} cy={(HY0 + HY1) / 2 - HD * 0.35} rx={14} ry={46} fill="#021A3A" />
          <rect x={HX1 + HD * 0.55} y={(HY0 + HY1) / 2 - HD * 0.35 - 40} width={26} height={80} fill="url(#wtKnob)" />
          {[-28, -14, 0, 14, 28].map((dy) => (
            <line key={dy} x1={HX1 + HD * 0.55 + 2} x2={HX1 + HD * 0.55 + 24} y1={(HY0 + HY1) / 2 - HD * 0.35 + dy} y2={(HY0 + HY1) / 2 - HD * 0.35 + dy} stroke={alpha("#011A38", 0.55)} strokeWidth={2.4} />
          ))}
          <ellipse cx={HX1 + HD * 0.55 + 26} cy={(HY0 + HY1) / 2 - HD * 0.35} rx={12} ry={40} fill="#2D6AB1" stroke={alpha("#011A38", 0.5)} strokeWidth={1.5} />
          <ellipse cx={HX1 + HD * 0.55 + 26} cy={(HY0 + HY1) / 2 - HD * 0.35} rx={5} ry={16} fill="#0B3F82" />
        </g>

        {/* the bezel plate, recessed into the housing's face: shade on its top-left lip, a catchlight on its bottom-right */}
        <g data-probe-skip>
          <rect x={HX0 + 30} y={HY0 + 30} width={HX1 - HX0 - 60} height={HY1 - HY0 - 60} rx={20} fill="url(#wtBezel)" />
          <path d={`M${HX0 + 30} ${HY1 - 40} V${HY0 + 50} Q${HX0 + 30} ${HY0 + 30} ${HX0 + 50} ${HY0 + 30} H${HX1 - 40}`} fill="none" stroke={alpha("#000814", 0.6)} strokeWidth={3} />
          <path d={`M${HX1 - 30} ${HY0 + 40} V${HY1 - 50} Q${HX1 - 30} ${HY1 - 30} ${HX1 - 50} ${HY1 - 30} H${HX0 + 40}`} fill="none" stroke={alpha("#B3CEEF", 0.4)} strokeWidth={2} />
          {/* four screws at the bezel's corners */}
          {[[HX0 + 56, HY0 + 56], [HX1 - 56, HY0 + 56], [HX0 + 56, HY1 - 56], [HX1 - 56, HY1 - 56]].map(([sx, sy], i) => (
            <g key={i}>
              <circle cx={sx} cy={sy} r={11} fill="#0B3F82" stroke={alpha("#011A38", 0.7)} strokeWidth={1.6} />
              <circle cx={sx - 2} cy={sy - 2} r={7} fill={alpha("#B3CEEF", 0.35)} />
              <line x1={sx - 6} y1={sy - 6} x2={sx + 6} y2={sy + 6} stroke="#011A38" strokeWidth={2.4} />
            </g>
          ))}
        </g>

        {/* Tesla's T, engraved in the bezel above the read-out (a dark cut with a lit lower lip; no box round it) */}
        <g data-probe-skip transform={`translate(${540 - 12 * tS} ${HY0 + 62}) scale(${tS})`}>
          <path d={MARKS.tesla} transform="translate(0.35 0.4)" fill={alpha("#B3CEEF", 0.4)} />
          <path d={MARKS.tesla} fill="#DCE8F6" />
        </g>

        {/* the five window recesses */}
        <Recess x={XS} w={SW} ring={ring} />
        <Recess x={XU} w={DW} ring={ring} />
        <Recess x={XT} w={DW} ring={ring} />
        <Recess x={XUNIT} w={SW} ring={ring} />
        {/* the fixed decimal point between the drums, printed on the bezel */}
        <circle data-probe-skip cx={XU + DW + PT / 2} cy={WY1 - 26} r={11} fill="#DCE8F6" />

        {/* the inlaid nameplate: a pressed recess with a raised border, its date printed in it */}
        <g data-probe-skip>
          <rect x={540 - 230} y={WY1 + 40} width={460} height={64} rx={8} fill="url(#wtPlate)" />
          <path d={`M${540 - 230} ${WY1 + 98} V${WY1 + 48} Q${540 - 230} ${WY1 + 40} ${540 - 222} ${WY1 + 40} H${540 + 226}`} fill="none" stroke={alpha("#000814", 0.65)} strokeWidth={2.2} />
          <path d={`M${540 + 230} ${WY1 + 46} V${WY1 + 96} Q${540 + 230} ${WY1 + 104} ${540 + 222} ${WY1 + 104} H${540 - 226}`} fill="none" stroke={alpha("#B3CEEF", 0.45)} strokeWidth={1.6} />
        </g>
        <text data-print x={540} y={WY1 + 84} textAnchor="middle" fontFamily="Anton" fontSize={30} letterSpacing={5} fill="#DCE8F6">{`AS OF ${MARKET.asOf}`}</text>
      </svg>

      {/* the wheels behind the windows: "$", the units drum, the tenths drum, "T" */}
      <Drum x={XS} w={SW} glyph="$" glint={glint} />
      <Drum x={XU} w={DW} pos={units} glint={glint} />
      <Drum x={XT} w={DW} pos={v} glint={glint} />
      <Drum x={XUNIT} w={SW} glyph="T" glint={glint} />

      {/* the place's one label, under the counter */}
      {lq > 0.001 && (
        <div style={{ position: "absolute", left: 0, width: 1080, top: FLOOR + 46, display: "flex", justifyContent: "center" }}>
          <div style={{ ...label(42, "#B3CEEF"), letterSpacing: 6, ...fromDepth(lq, "50% 50%") }}>MARKET VALUE</div>
        </div>
      )}
    </Turn>
  );
};
