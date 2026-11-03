import React from "react";
import { useCurrentFrame } from "remotion";
import { rInOut, rOut, clamp01, alpha, mixHex } from "../anim";
import { FlatDefs, FSolid, rrect } from "../flat";
import { Turn } from "../kit";
import { Pool3D } from "../s3";
import { MARKS } from "../marks";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// whatA — "On October 15, outside Waco, Texas, Tesla showed off its new Roadster."
// THE EVENT'S LED BOARD ON THE TEST PAD (the brief: "the reveal's date as a real object acting … a lit event marker on the test pad"):
// a free-standing LED display cabinet on its stand, read face-on, so the house 2-D construction (STYLE §6.1a): the cabinet (its bezel,
// the LED panel of eight modules with every unlit lamp showing, the glass), Tesla's T ENGRAVED on the cabinet's header from the first
// frame (STYLE §16 2026-10-22: print that belongs to an object is on it from its first frame; never set in a box — it sits on the housing
// alone), two square-tube legs with their brackets, the cross brace, the feet with levelling pads, the power/processor box clamped to the
// right leg with its status lamp, and its cable running down the leg and off across the pad. The pad's painted lane recedes behind it and
// fades into the dark (STYLE §16 2026-10-21: a floor never shows its edges).
//   - "October 15" — OCT 15, 2026 lights on the panel, lamp column by lamp column (OCT on "October", the rest on "15");
//   - "Waco, Texas" — WACO, TEXAS lights under it (WACO, on "Waco", TEXAS on "Texas");
//   - "Tesla showed off" — the engraved T on the header LIGHTS (its lamp behind it comes up);
//   - "showed off" — a sweep of light runs across the panel's lamps, left to right (the board's reveal); on "its new Roadster" the car itself arrives.
// The type is the panel's own read-out (object print, STYLE §5.3): flat Anton, its light shown by the lamps and the glass, never a glow.
// KIND object.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const KIND = "object";

type C = { arrive: number; october: number; d15: number; waco: number; texas: number; showed: number; roadster: number; end: number };
/** every animation window (the SFX score reads these); `done`: the frame the place's LAST action ends */
export const markerTimes = (c: C) => ({
  /** OCT lights (column by column), then 15, 2026 */
  dateA: [c.october - 5, c.october + 9] as [number, number],
  dateB: [c.d15 - 4, c.d15 + 18] as [number, number],
  /** WACO, then TEXAS */
  placeA: [c.waco - 4, c.waco + 9] as [number, number],
  placeB: [c.texas - 4, c.texas + 9] as [number, number],
  /** the engraved T lights on "Tesla showed" */
  logo: [c.showed - 16, c.showed - 2] as [number, number],   // (★ 2026-10-30: lit on "Tesla", so the board is complete before it drifts away)
  /** the light sweep across the panel, on "showed off" (★ 2026-10-30: the board finishes BEFORE "its new Roadster" — the hand-over is carried:
   *  the board drifts away as the car itself arrives on "Roadster", Bankers/STYLE.md §16) */
  sweep: [c.showed - 13, c.showed + 5] as [number, number],
  done: c.showed + 5,
});

// ── the board, in the place's own 1080×1920 frame ──
const CAB = { x0: 140, y0: 530, x1: 940, y1: 1010, d: 30 } as const;
const PAN = { x0: 178, y0: 652, x1: 902, y1: 976 } as const;
const FLOOR = 1436;
const LEGS = [{ x0: 232, x1: 264 }, { x0: 816, x1: 848 }] as const;
/** the read-out's lines (baselines) and the T on the header */
const DATE_Y = 796, PLACE_Y = 894, LOGO = { cx: 540, cy: 584, h: 62 } as const;
/** the construction's centre (the camera aims here); `a`: the date (the camera pushes IN first); `b`: the place, under it */
export const MARKER = { x: 540, y: 1000, a: { x: 540, y: 756 }, b: { x: 540, y: 876 } } as const;

const DATE = "OCT 15, 2026", PLACE = "WACO, TEXAS";

/** one read-out line whose characters light left to right: each character's lamps come up over 8 frames, `gap` frames after the last */
const Lit: React.FC<{ s: string; x: number; y: number; size: number; f: number; parts: { n: number; at: number }[]; gap: number; fill: string; tracking: number }> =
  ({ s, x, y, size, f, parts, gap, fill, tracking }) => {
    // part p covers the next n characters, starting at its own frame
    const ops: number[] = [];
    let i = 0;
    for (const p of parts) for (let k = 0; k < p.n && i < s.length; k++, i++) ops.push(rOut(f, p.at + k * gap, p.at + k * gap + 8));
    while (ops.length < s.length) ops.push(0);
    if (ops.every((o) => o <= 0.001)) return null;
    // ★ the probe reads a <tspan> by its whole FONT CELL, so neighbouring lamp-letters "overlapped" each other (TEXT) and the date's cells
    // reached the place line below: the lit spans are skipped, and the line is measured as ONE text by its ink (an unpainted twin in the
    // same place, there while any of it is lit)
    const on = Math.max(...ops);
    return (
      <g>
        <text data-probe-skip data-print x={x} y={y} textAnchor="middle" fontFamily="Anton" fontSize={size} letterSpacing={tracking} fill={fill}>
          {s.split("").map((ch, j) => <tspan key={j} fillOpacity={ops[j].toFixed(3)}>{ch}</tspan>)}
        </text>
        <text data-print x={x} y={y} textAnchor="middle" fontFamily="Anton" fontSize={size} letterSpacing={tracking} fill="none" opacity={on.toFixed(3)}>{s}</text>
      </g>
    );
  };

export const Marker: React.FC<C> = (c) => {
  const f = useCurrentFrame();
  const T = markerTimes(c);
  const logoOn = rInOut(f, ...T.logo);
  const sw = rInOut(f, ...T.sweep);
  const dateOn = rOut(f, T.dateA[0], T.dateB[1]);
  const PW = PAN.x1 - PAN.x0, PH = PAN.y1 - PAN.y0;
  const swX = PAN.x0 - 220 + (PW + 220) * sw, swOp = clamp01(sw * 12) * clamp01((1 - sw) * 12);
  const T24 = LOGO.h / 24;

  // the legs: square tubes (the house solid, a slimmer extrusion), from under the cabinet to the feet
  const legs = LEGS.map((l, i) => (
    <g key={i}>
      <FSolid id="mk" outline={rrect(l.x0, CAB.y1 - 4, l.x1, FLOOR - 22, 3)} d={14} tone={["#7FA6D6", "#02234A"]} rim={0.45} />
      {/* the bracket that clamps the leg to the cabinet's underside, its two bolts */}
      <FSolid id="mk" outline={rrect(l.x0 - 12, CAB.y1 - 2, l.x1 + 12, CAB.y1 + 40, 3)} d={16} tone={["#9CBCE3", "#0B3F82"]} rim={0.5} />
      {[CAB.y1 + 12, CAB.y1 + 28].map((by) => <circle key={by} data-probe-skip cx={(l.x0 + l.x1) / 2} cy={by} r={3.6} fill="#B3CEEF" stroke={alpha("#011A38", 0.6)} strokeWidth={1.2} />)}
      {/* the telescoping leg's collar (the inner tube rises out of the sleeve) and its T-knob clamp */}
      <FSolid id="mk" outline={rrect(l.x0 - 6, 1150, l.x1 + 6, 1196, 4)} d={16} tone={["#A9C8EC", "#0B3F82"]} rim={0.55} />
      <g data-probe-skip>
        <line x1={l.x0 - 4} x2={l.x1 + 4} y1={1158} y2={1158} stroke={alpha("#011A38", 0.4)} strokeWidth={1.4} />
        <line x1={l.x0 - 4} x2={l.x1 + 4} y1={1188} y2={1188} stroke={alpha("#011A38", 0.4)} strokeWidth={1.4} />
        <rect x={l.x0 - 26} y={1169} width={20} height={8} rx={3} fill="#2D6AB1" />
        <rect x={l.x0 - 32} y={1161} width={10} height={24} rx={4} fill="#4D8ED9" stroke={alpha("#011A38", 0.5)} strokeWidth={1} />
      </g>
      {/* the foot: a flat bar across the leg's base, two levelling pads under its ends */}
      <FSolid id="mk" outline={rrect(l.x0 - 54, FLOOR - 24, l.x1 + 54, FLOOR - 8, 4)} d={18} tone={["#8FB2DE", "#022B5C"]} rim={0.5} />
      {[l.x0 - 44, l.x1 + 30].map((px) => (
        <g key={px}>
          <rect data-probe-skip x={px + 4} y={FLOOR - 9} width={6} height={4} fill="#4D7FBF" />
          <rect x={px} y={FLOOR - 5} width={14} height={5} rx={2} fill="#06162C" />
        </g>
      ))}
      {/* the gusset where the leg meets its foot */}
      <polygon data-probe-skip points={`${l.x0 - 18},${FLOOR - 24} ${l.x0},${FLOOR - 24} ${l.x0},${FLOOR - 62}`} fill="#1F5597" />
      <polygon data-probe-skip points={`${l.x1},${FLOOR - 24} ${l.x1 + 18},${FLOOR - 24} ${l.x1},${FLOOR - 62}`} fill="#0F3B70" />
    </g>
  ));

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Pool3D x={540} y={FLOOR} w={1100} on={0.6} />
      <Turn at={c.arrive} end={c.arrive + 170} from={-6} to={5} amp={1.1} persp={2000}>
        <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <FlatDefs id="mk" />
          <defs data-probe-skip>
            {/* the pad's markings fade out into the dark round the board (a static mask: STYLE §16 2026-10-21) */}
            <radialGradient id="mkPadFade" gradientUnits="userSpaceOnUse" cx={540} cy={FLOOR + 30} r={560} gradientTransform={`translate(540 ${FLOOR + 30}) scale(1 0.42) translate(-540 ${-(FLOOR + 30)})`}>
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" /><stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0.55" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
            <mask id="mkPadMask" maskUnits="userSpaceOnUse" x={-200} y={1000} width={1480} height={920}>
              <rect x={-200} y={1000} width={1480} height={920} fill="url(#mkPadFade)" />
            </mask>
            {/* the LED panel: every lamp (unlit), and the black mesh between the lamps that the lit read-out shows through */}
            <pattern id="mkLamps" patternUnits="userSpaceOnUse" x={PAN.x0} y={PAN.y0} width={8} height={8}>
              <circle cx={4} cy={4} r={2.2} fill="#0C2B54" />
              <circle cx={3.4} cy={3.4} r={0.8} fill="#1C4475" />
            </pattern>
            <pattern id="mkMesh" patternUnits="userSpaceOnUse" x={PAN.x0} y={PAN.y0} width={8} height={8}>
              <path d="M0 0H8V8H0Z M1.4 1.4V6.6H6.6V1.4Z" fillRule="evenodd" fill="#020B19" fillOpacity={0.62} />
            </pattern>
            <linearGradient id="mkSweep" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#B3CEEF" stopOpacity="0" /><stop offset="0.5" stopColor="#E8F2FF" stopOpacity="0.34" /><stop offset="1" stopColor="#B3CEEF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="mkGlass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.07" /><stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="0.62" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="0.7" stopColor="#FFFFFF" stopOpacity="0.04" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="mkShade" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#000814" stopOpacity="0.55" /><stop offset="0.5" stopColor="#000814" stopOpacity="0.22" /><stop offset="1" stopColor="#000814" stopOpacity="0" />
            </radialGradient>
            <clipPath id="mkPanClip"><rect x={PAN.x0} y={PAN.y0} width={PW} height={PH} /></clipPath>
          </defs>

          {/* ── the test pad: a painted lane receding behind the board (to a vanishing point behind the cabinet), its transverse dashes
              closing up with distance, all of it fading into the ground ── */}
          <g data-probe-skip mask="url(#mkPadMask)" opacity={0.85}>
            {[-1, 1].map((sd) => {
              const vx = 540, vy = 1150, bx = 540 + sd * 780, by = 1920;
              return <line key={sd} x1={vx + (bx - vx) * 0.12} y1={vy + (by - vy) * 0.12} x2={bx} y2={by} stroke={alpha("#4D8ED9", 0.2)} strokeWidth={5} />;
            })}
            {[0.18, 0.27, 0.4, 0.58, 0.82].map((t, i) => {
              const vy = 1150, y = vy + (1920 - vy) * t, hw = 780 * t;
              return <line key={i} x1={540 - hw * 0.9} y1={y} x2={540 + hw * 0.9} y2={y} stroke={alpha("#4D8ED9", 0.12)} strokeWidth={2 + 4 * t} strokeDasharray={`${30 * t + 8} ${24 * t + 8}`} />;
            })}
            <line x1={-200} y1={FLOOR + 2} x2={1280} y2={FLOOR + 2} stroke={alpha("#4D8ED9", 0.1)} strokeWidth={2} />
          </g>

          {/* ── the stand's contact shadows: each foot's footprint, darkest in a thin line at its base, leaning right (away from the key) ── */}
          <g data-probe-skip>
            {LEGS.map((l, i) => (
              <g key={i}>
                <ellipse cx={(l.x0 + l.x1) / 2 + 16} cy={FLOOR - 1} rx={118} ry={16} fill="url(#mkShade)" />
                <ellipse cx={(l.x0 + l.x1) / 2 + 4} cy={FLOOR - 1} rx={84} ry={4.5} fill={alpha("#000814", 0.45)} />
              </g>
            ))}
          </g>

          {/* ── the cable: from the box's gland down along the leg, then across the pad and away to the right ── */}
          {/* (the cable is measured; it runs back across the pad INTO DEPTH and ends at x ~1000, inside the board's slide distance: running off to
              the right it was still on screen at the left after the slide, and vanished at the unmount — Timur: "at 15 secs and 19 frames a little
              thing on the left just disappears") */}
          <path d={`M902 1238 C 906 1320, 896 1392, 930 ${FLOOR - 4} S 968 ${FLOOR + 8}, 1004 ${FLOOR - 6}`} fill="none" stroke="#020D1C" strokeWidth={9} strokeLinecap="round" />
          <g data-probe-skip>
            <path d={`M900 1240 C 904 1320, 894 1392, 928 ${FLOOR - 6} S 968 ${FLOOR + 6}, 1002 ${FLOOR - 8}`} fill="none" stroke={alpha("#5E8FCB", 0.45)} strokeWidth={2} strokeLinecap="round" />
            {/* the short lead from the box up into the cabinet */}
            <path d={`M904 1122 C 906 1080, 900 1050, 896 ${CAB.y1 + 2}`} fill="none" stroke="#020D1C" strokeWidth={7} strokeLinecap="round" />
            <path d={`M902 1122 C 904 1080, 898 1050, 894 ${CAB.y1 + 2}`} fill="none" stroke={alpha("#5E8FCB", 0.4)} strokeWidth={1.6} strokeLinecap="round" />
          </g>

          {/* ── the stand ── */}
          {legs}
          {/* the cross brace between the legs, and its two bolted end plates */}
          <FSolid id="mk" outline={rrect(LEGS[0].x1, 1232, LEGS[1].x0, 1252, 3)} d={10} tone={["#7FA6D6", "#02234A"]} rim={0.4} />
          {[LEGS[0].x1 + 14, LEGS[1].x0 - 14].map((bx) => <circle key={bx} data-probe-skip cx={bx} cy={1242} r={3.2} fill="#B3CEEF" stroke={alpha("#011A38", 0.6)} strokeWidth={1} />)}

          {/* ── the processor/power box clamped to the right leg: its door seam, the vent slots, the status lamp (steady), two clamp straps ── */}
          <FSolid id="mk" outline={rrect(858, 1120, 948, 1236, 6)} d={18} tone={["#9CBCE3", "#022B5C"]} rim={0.55} />
          <g data-probe-skip>
            <rect x={866} y={1128} width={74} height={100} rx={4} fill="none" stroke={alpha("#011A38", 0.4)} strokeWidth={1.6} />
            {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={876} y={1150 + i * 12} width={36} height={4} rx={2} fill={alpha("#011A38", 0.55)} />)}
            <circle cx={926} cy={1146} r={5} fill={mixHex("#2D6AB1", "#CFE2F8", 0.35 + 0.65 * dateOn)} />
            <circle cx={924.6} cy={1144.6} r={1.6} fill={alpha("#FFFFFF", 0.6)} />
            {[1150, 1206].map((y) => <rect key={y} x={846} y={y} width={16} height={9} rx={2} fill="#0B3F82" stroke={alpha("#011A38", 0.5)} strokeWidth={1} />)}
            <rect x={896} y={1234} width={12} height={8} rx={2} fill="#06162C" />
          </g>

          {/* ── the cabinet: the housing (its depth swept up-right), the bezel, the LED panel ── */}
          <FSolid id="mk" outline={rrect(CAB.x0, CAB.y0, CAB.x1, CAB.y1, 18)} d={CAB.d} tone={["#A9C8EC", "#022B5C"]} rim={0.6} />
          <g data-probe-skip>
            {/* the header's pressed seam and the bezel's four corner screws */}
            <line x1={CAB.x0 + 22} x2={CAB.x1 - 22} y1={PAN.y0 - 14} y2={PAN.y0 - 14} stroke={alpha("#011A38", 0.35)} strokeWidth={1.6} />
            <line x1={CAB.x0 + 22} x2={CAB.x1 - 22} y1={PAN.y0 - 12.4} y2={PAN.y0 - 12.4} stroke={alpha("#DCE9F7", 0.22)} strokeWidth={1} />
            {[[CAB.x0 + 20, CAB.y0 + 20], [CAB.x1 - 20, CAB.y0 + 20], [CAB.x0 + 20, CAB.y1 - 18], [CAB.x1 - 20, CAB.y1 - 18]].map(([x, y], i) => (
              <g key={i}><circle cx={x} cy={y} r={4.2} fill="#0B3F82" /><circle cx={x - 0.8} cy={y - 0.8} r={2.6} fill="#B3CEEF" /></g>
            ))}
          </g>
          {/* ★ Tesla's T, ENGRAVED into the header (on from the first frame, the housing's own surface — no plate round it); on "Tesla
              showed" the lamp behind it comes up and the mark lights */}
          <g data-probe-skip transform={`translate(${LOGO.cx - 12 * T24} ${LOGO.cy - 12 * T24}) scale(${T24})`}>
            {/* the engraving's lower lip catching the key, under the cut */}
            <path d={MARKS.tesla} fill={alpha("#DCE9F7", 0.35)} transform="translate(0.12 0.14)" />
            <path d={MARKS.tesla} fill={mixHex("#0A2F5E", "#EEF5FB", logoOn)} />
          </g>

          {/* the panel's recess: its dark field, every lamp, the eight modules' seams */}
          <rect x={PAN.x0 - 6} y={PAN.y0 - 6} width={PW + 12} height={PH + 12} rx={6} fill="#021024" />
          <rect x={PAN.x0} y={PAN.y0} width={PW} height={PH} fill="#030E20" />
          <rect data-probe-skip x={PAN.x0} y={PAN.y0} width={PW} height={PH} fill="url(#mkLamps)" />
          {/* (the panel's own lift as it lights: the glass carries the light, never the letters) */}
          <rect data-probe-skip x={PAN.x0} y={PAN.y0} width={PW} height={PH} fill="#0E3566" opacity={0.28 * dateOn} />
          <g data-probe-skip clipPath="url(#mkPanClip)">
            {/* the light sweep across the lamps on "Roadster" */}
            {swOp > 0.001 && <rect x={swX} y={PAN.y0} width={220} height={PH} fill="url(#mkSweep)" opacity={swOp} />}
          </g>

          {/* ── the read-out: OCT 15, 2026 over WACO, TEXAS ── */}
          <Lit s={DATE} x={540} y={DATE_Y} size={104} f={f} gap={1} tracking={3} fill="#EEF5FB"
            parts={[{ n: 3, at: T.dateA[0] }, { n: 9, at: T.dateB[0] }]} />
          <Lit s={PLACE} x={540} y={PLACE_Y} size={52} f={f} gap={1} tracking={6} fill="#B3CEEF"
            parts={[{ n: 6, at: T.placeA[0] }, { n: 5, at: T.placeB[0] }]} />

          {/* the mesh between the lamps over everything lit (the read-out reads as LEDs), the module seams, and the glass */}
          <g data-probe-skip>
            <rect x={PAN.x0} y={PAN.y0} width={PW} height={PH} fill="url(#mkMesh)" />
            {[1, 2, 3].map((i) => <line key={i} x1={PAN.x0 + (PW * i) / 4} x2={PAN.x0 + (PW * i) / 4} y1={PAN.y0} y2={PAN.y1} stroke={alpha("#000814", 0.5)} strokeWidth={1.4} />)}
            <line x1={PAN.x0} x2={PAN.x1} y1={(PAN.y0 + PAN.y1) / 2} y2={(PAN.y0 + PAN.y1) / 2} stroke={alpha("#000814", 0.5)} strokeWidth={1.4} />
            <rect x={PAN.x0} y={PAN.y0} width={PW} height={PH} fill="url(#mkGlass)" />
            {/* the recess's lit lower lip and shaded top edge */}
            <line x1={PAN.x0 - 6} x2={PAN.x1 + 6} y1={PAN.y1 + 6} y2={PAN.y1 + 6} stroke={alpha("#DCE9F7", 0.35)} strokeWidth={1.4} />
            <line x1={PAN.x0 - 6} x2={PAN.x1 + 6} y1={PAN.y0 - 6} y2={PAN.y0 - 6} stroke={alpha("#000814", 0.6)} strokeWidth={2} />
          </g>
        </svg>
      </Turn>
    </div>
  );
};
