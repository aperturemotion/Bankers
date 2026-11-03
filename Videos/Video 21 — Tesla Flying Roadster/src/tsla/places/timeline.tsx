import React from "react";
import { useCurrentFrame } from "remotion";
import { rOut, rInOut, clamp01, alpha, mixHex } from "../anim";
import { label, Turn } from "../kit";
import { FSolid, rrect } from "../flat";
import { Pool3D } from "../s3";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// honestB — "Production isn't planned until 2028." ★ A MACHINED TIMELINE TRACK (house 2-D, STYLE §6.1a: every solid a flat front with its
// depth swept up and to the right): a polished steel guide rail on a dark-blue track bed standing on two pedestal feet, three stations
// along it — OCT 2026 (now), 2027, 2028 — each an engraved plate inlaid in the bed's front and an index post with a lamp behind the rail.
// The stations sit on a TIME scale (each year's plate at the middle of its year, OCT 2026 at the reveal's month), so the steps are honest.
// A CARRIAGE rides the rail: it waits at OCT 2026 (lit — now), and on "Production" it glides along, lighting 2027 as it passes, and comes
// to rest at 2028 on "2028", where PRODUCTION lands over it (the one label). Past 2028 the track is NOT built: the bed and the rail run on
// only as a dashed outline fading into the dark — the far end left open (the brief).
// ★ THE WHITE STAGE (2026-10-30, Timur: "more contrast … more light-themed scenes"): `light` (0 navy … 1 white, default 0 = unchanged) blends
// every ink continuously (STYLE §4.3, never a threshold). On white the solids turn PALE-LIT with BLUE extrusions (the house faces' gradients
// carried to the `pale` family, their swept sides to the logo blue's mids), the bed lifts to a lit mid blue so its plates still stand out,
// the plates go paler, the lamps light in the logo blue instead of glowing white, the open run's dashes are the white stage's line blue,
// every shadow is the navy at the white stage's strength, the floor's pool gives way to a navy floor tint, and PRODUCTION is printed in the
// white stage's label blue. KIND steps.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const KIND = "steps";

type C = { arrive: number; production: number; y2028: number; end: number; light?: number };
export const timelineTimes = (c: C) => ({
  /** the track arrives with the camera (the slide) */
  base: [c.arrive - 6, c.arrive + 26] as [number, number],
  /** the carriage glides OCT 2026 → 2028 along the rail ("Production" → "2028"), lighting 2027 as it passes */
  glide: [c.production + 2, c.y2028 - 2] as [number, number],
  /** its seat at 2028 (a click as it stops) */
  seat: c.y2028 - 2,
  /** PRODUCTION lands over the carriage at 2028 */
  label: [c.y2028 - 4, c.y2028 + 12] as [number, number],
  /** the frame the place's LAST action ends (the next place waits for it) */
  done: c.y2028 + 12,
});

// ── the world: x along the track, h up, z back, by the house oblique S() (FSolid's own sweep: +d, −0.7·d) ──
const RY = 1218;
const S = (x: number, h: number, z: number): [number, number] => [x + z, RY - 0.7 * z - h];
const pt = (q: [number, number][]) => q.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
const poly = (...c: [number, number, number][]) => pt(c.map(([x, h, z]) => S(x, h, z)));
/** the stations on a time scale: OCT 2026 (2026.82) at 170, each year at its middle (2027.5, 2028.5) */
const T_NOW = 2026.82, X_NOW = 170, PX_YR = 330;
const xOf = (t: number) => X_NOW + (t - T_NOW) * PX_YR;
const ST = [{ t: "OCT 2026", x: xOf(T_NOW) }, { t: "2027", x: xOf(2027.5) }, { t: "2028", x: xOf(2028.5) }] as const;
/** the built track: bed x X0..X1, its front BH0..BH1 high, BD deep; the rail on its top, RD0..RD1 deep, RH tall; the open run to XO */
const X0 = 58, X1 = 852, XO = 1016, BH0 = 96, BH1 = 236, BD = 70, RZ0 = 22, RZ1 = 48, RH = 22;
/** the carriage: CW wide, CH tall, its depth CZ0..CZ1 (it straddles the rail) */
const CW = 150, CH = 80, CZ0 = 8, CZ1 = 48;
/** the index posts stand behind the carriage's path (z PZ), their lamps clear above its roof */
const PZ = 56, LAMP = BH1 + RH + CH + 30;

// ── the white stage: every ink is a blend on `Lw` (0 navy … 1 white) ──
const lumOf = (c: string) => { const n = parseInt(c.slice(1, 7), 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
/** a dark ink lifted toward a lit mid blue on white, its darks most (a navy part reads as a hole on the white stage) */
const liftW = (c: string, Lw: number, k = 0.42) => (Lw <= 0.001 ? c : mixHex(c, "#8DB6E6", k * Lw * (1 - lumOf(c))));
const toneW = (t: [string, string], Lw: number): [string, string] => [liftW(t[0], Lw), liftW(t[1], Lw, 0.5)];
/** a linear gradient whose stops blend from the navy stage's colours to the white stage's (the SVG is a new DOM every frame: key={f}) */
const Lin: React.FC<{ id: string; x1?: string; y1?: string; x2?: string; y2?: string; stops: [number, string, string][]; Lw: number }> = ({ id, x1 = "0", y1 = "0", x2 = "0", y2 = "1", stops, Lw }) => (
  <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
    {stops.map(([o, a, b]) => <stop key={o} offset={o} stopColor={mixHex(a, b, Lw)} />)}
  </linearGradient>
);
/** the house 2-D solid's faces (flat.tsx FlatDefs, under this SVG's own ids), carried to the pale family on white: a pale-lit face, a pale
 *  cap, and a BLUE swept side */
const TlDefs: React.FC<{ id: string; Lw: number }> = ({ id, Lw }) => (
  <defs data-probe-skip>
    <Lin id={`${id}Face`} x1="0.62" x2="0.38" Lw={Lw} stops={[[0, "#92B8E2", "#E3EDF9"], [0.42, "#265B98", "#8DB6E6"], [1, "#002A5A", "#3C83D5"]]} />
    <Lin id={`${id}Lit`} x1="0.62" x2="0.38" Lw={Lw} stops={[[0, "#F1F6FC", "#FFFFFF"], [0.4, "#6599D5", "#B3CEEF"], [1, "#234F84", "#4D8ED9"]]} />
    <Lin id={`${id}Cap`} y1="0.25" x2="1" y2="0.75" Lw={Lw} stops={[[0, "#E3ECF7", "#FFFFFF"], [1, "#357BCA", "#8DB6E6"]]} />
    <Lin id={`${id}Side`} Lw={Lw} stops={[[0, "#033671", "#1F62B3"], [1, "#001731", "#0B3F82"]]} />
  </defs>
);

/** where the camera aims: the whole track, and the carriage at rest at 2028 (IN) */
export const TIMELINE = (() => {
  const [ax, ay] = S(ST[2].x, BH1 + RH + CH / 2, (CZ0 + CZ1) / 2);
  return { x: 540, y: 1010, a: { x: Math.round(ax), y: Math.round(ay) } } as const;
})();

export const Timeline: React.FC<C> = (c) => {
  const f = useCurrentFrame();
  const T = timelineTimes(c);
  const bq = rOut(f, ...T.base);
  const gl = rInOut(f, ...T.glide);
  const cx = ST[0].x + (ST[2].x - ST[0].x) * gl;
  // each station lights as the carriage reaches it (a blend over the 70 px either side), and a passed station stays half lit
  const reach = ST.map((s) => clamp01((cx - s.x + 46) / 92));
  const at = ST.map((s) => clamp01(1 - Math.abs(cx - s.x) / 70));
  const lit = ST.map((_, i) => Math.max(at[i], 0.45 * reach[i]));
  const lb = rOut(f, ...T.label);
  const front = (x0: number, x1: number, h0: number, h1: number, z: number, r = 3) => { const [a, b] = S(x0, h1, z), [cc, d] = S(x1, h0, z); return rrect(a, b, cc, d, r); };
  const RTOP = BH1 + RH;
  // the white stage's strength (0 navy … 1 white): every ink below blends on it
  const Lw = clamp01(c.light ?? 0);
  const shadowInk = mixHex("#000814", "#001C3C", Lw);

  return (
    <Turn at={c.arrive} end={c.arrive + 150} from={-3} to={2} amp={0.6}>
      <div style={{ position: "absolute", inset: 0, opacity: bq < 1 ? bq : undefined }}>
        <Pool3D x={520} y={RY + 8} w={1100} on={0.7 * (1 - Lw)} />
        {/* (on white the floor's light gives way to a soft navy floor tint: no glow on white) */}
        {Lw > 0.001 && <div data-probe-skip style={{ position: "absolute", left: 520 - 560, top: RY + 8 - 110, width: 1120, height: 220, borderRadius: "50%", opacity: Lw,
          background: `radial-gradient(ellipse, ${alpha("#1F62B3", 0.1)} 0%, ${alpha("#1F62B3", 0.03)} 50%, transparent 72%)` }} />}
        <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <TlDefs id="tlM" Lw={Lw} />
          <defs data-probe-skip>
            <linearGradient id="tlRailF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F1F6FC" /><stop offset="0.45" stopColor="#8DB6E6" /><stop offset="1" stopColor="#2D6AB1" /></linearGradient>
            <linearGradient id="tlRailT" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stopColor="#E3ECF7" /><stop offset="1" stopColor="#5D8FCB" /></linearGradient>
            {/* the bed: navy steel on the dark stage, a lit mid blue on white (its plates must still stand out against it) */}
            <Lin id="tlBedF" x2="0.15" Lw={Lw} stops={[[0, "#3F75BB", "#8DB6E6"], [0.2, "#174C8E", "#4D8ED9"], [1, "#03214A", "#1A5DB0"]]} />
            <Lin id="tlBedT" x2="1" y2="0.2" Lw={Lw} stops={[[0, "#2D6AB1", "#B3CEEF"], [0.5, "#174C8E", "#6FA3DF"], [1, "#0B2F66", "#3C83D5"]]} />
            <linearGradient id="tlSteel" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#E3ECF7" /><stop offset="0.5" stopColor="#8DB6E6" /><stop offset="1" stopColor="#3C83D5" /></linearGradient>
            <linearGradient id="tlGlass" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#0E3A70" /><stop offset="1" stopColor="#031A40" /></linearGradient>
            <radialGradient id="tlLamp"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.5" stopColor="#B3CEEF" /><stop offset="1" stopColor="#4D8ED9" stopOpacity="0" /></radialGradient>
          </defs>

          {/* ═══ the floor contact under the two pedestals (their footprints, darkest at the front base, leaning right and back) ═══ */}
          <g data-probe-skip>
            {[220, 700].map((px) => [0, 1, 2, 3].map((i) => {
              const g = i * 8, l = i * 7;
              return <polygon key={`${px}${i}`} points={poly([px - 62 - g * 0.4 + l * 0.3, 0, -g * 0.5], [px + 62 + g + l, 0, -g * 0.5], [px + 62 + g + l, 0, 66 + g + l], [px - 62 - g * 0.4 + l * 0.3, 0, 66 + g + l])} fill={shadowInk} opacity={(0.22 - i * 0.045) * (1 - 0.2 * Lw)} />;
            }))}
          </g>

          {/* ═══ the two pedestal feet: a base plate and a column up to the bed, bolted ═══ */}
          {[220, 700].map((px) => (
            <g key={px}>
              <FSolid id="tlM" outline={front(px - 62, px + 62, 0, 12, 0, 3)} d={66} tone={toneW(["#6FA3DF", "#021A3A"], Lw)} rim={0.4} face={liftW("#0B2F66", Lw, 0.5)} />
              <FSolid id="tlM" outline={front(px - 30, px + 30, 12, BH0, 14, 4)} d={36} tone={toneW(["#8DB6E6", "#022B5C"], Lw)} />
              <g data-probe-skip>
                {[-46, 46].map((bx) => { const [hx, hy] = S(px + bx, 6, 0); return <g key={bx}><circle cx={hx} cy={hy} r={4.5} fill="#0B2F66" stroke={alpha("#8DB6E6", 0.6)} strokeWidth={1.2} /><circle cx={hx - 1.2} cy={hy - 1.2} r={1.4} fill={alpha("#FFFFFF", 0.5)} /></g>; })}
                {/* the column's lit left edge and a machined collar at its top */}
                <line x1={S(px - 30, 0, 14)[0] + 0.8} x2={S(px - 30, 0, 14)[0] + 0.8} y1={S(0, BH0, 14)[1]} y2={S(0, 12, 14)[1]} stroke={alpha("#FFFFFF", 0.4)} strokeWidth={1.4} />
                <rect x={S(px - 34, 0, 14)[0]} y={S(0, BH0, 14)[1] - 0.5} width={68} height={9} rx={2} fill="url(#tlSteel)" />
              </g>
            </g>
          ))}

          {/* ═══ the index posts behind the rail, one per station (a lamp on each, lit as the carriage reaches it) ═══ */}
          {ST.map((s, i) => (
            <g key={s.t}>
              <FSolid id="tlM" outline={front(s.x - 7, s.x + 7, BH1, LAMP - 6, PZ, 3)} d={9} tone={toneW(["#8DB6E6", "#022B5C"], Lw)} rim={0.4} />
              {(() => { const [lx, ly] = S(s.x + 4, LAMP, PZ + 4); return (
                <g data-probe-skip>
                  <circle cx={lx} cy={ly} r={9} fill={mixHex(mixHex("#0B3F82", "#1F5596", Lw), mixHex("#DCE9F7", "#4FA0FF", Lw), lit[i])} stroke={alpha("#011A38", 0.6)} strokeWidth={1.5} />
                  <circle cx={lx} cy={ly} r={26} fill="url(#tlLamp)" opacity={0.55 * lit[i] * (1 - 0.75 * Lw)} />
                  <circle cx={lx - 2.5} cy={ly - 2.5} r={2.5} fill={alpha("#FFFFFF", 0.6)} />
                </g>
              ); })()}
            </g>
          ))}

          {/* ═══ THE TRACK BED: its end cut square at X1 (built to 2028, no further), its top, its front ═══ */}
          <polygon points={poly([X1, BH0, 0], [X1, BH0, BD], [X1, BH1, BD], [X1, BH1, 0])} fill="url(#tlMSide)" />
          <polygon points={poly([X0, BH1, 0], [X1, BH1, 0], [X1, BH1, BD], [X0, BH1, BD])} fill="url(#tlBedT)" />
          <polygon points={poly([X0, BH0, 0], [X1, BH0, 0], [X1, BH1, 0], [X0, BH1, 0])} fill="url(#tlBedF)" />
          <g data-probe-skip>
            {/* its lit top arris, its shaded foot, the machined slot along its front, the cut end's edge catching the light */}
            <polyline points={poly([X0, BH1 - 0.6, 0], [X1, BH1 - 0.6, 0])} fill="none" stroke={alpha("#FFFFFF", 0.6)} strokeWidth={1.6} />
            <polyline points={poly([X0, BH0 + 1, 0], [X1, BH0 + 1, 0])} fill="none" stroke={shadowInk} strokeOpacity={0.55 - 0.15 * Lw} strokeWidth={2} />
            <polyline points={poly([X0 + 8, BH1 - 10, 0], [X1 - 8, BH1 - 10, 0])} fill="none" stroke={shadowInk} strokeOpacity={0.45 - 0.1 * Lw} strokeWidth={2.2} />
            <polyline points={poly([X0 + 8, BH1 - 12, 0], [X1 - 8, BH1 - 12, 0])} fill="none" stroke={alpha("#8DB6E6", 0.25)} strokeWidth={1} />
            <polyline points={poly([X1, BH1, 0], [X1, BH1, BD])} fill="none" stroke={alpha("#FFFFFF", 0.35)} strokeWidth={1.3} />
            {/* the bolts along its front, in the open stretch between 2027 and 2028 and at its cut end */}
            {[(ST[1].x + ST[2].x) / 2 - 26, (ST[1].x + ST[2].x) / 2 + 26, X1 - 14].map((bx, i) => {
              const [hx, hy] = S(bx, (BH0 + BH1) / 2 - 4, 0);
              return <g key={i}><circle cx={hx} cy={hy} r={4.5} fill="#0B2F66" stroke={alpha("#8DB6E6", 0.6)} strokeWidth={1.2} /><circle cx={hx - 1.2} cy={hy - 1.2} r={1.4} fill={alpha("#FFFFFF", 0.5)} /></g>;
            })}
          </g>

          {/* ═══ the open run past 2028: the bed and the rail continue only as a dashed outline, fading into the dark ═══ */}
          <g data-probe-skip>
            {(() => {
              const out: React.ReactNode[] = [];
              const runs: [number, number, number][] = [[BH0, 0, 0], [BH1, 0, 0], [BH1, BD, 0], [RTOP, RZ0, 1], [RTOP, RZ1, 1]];
              runs.forEach(([h, z], j) => {
                for (let x = X1 + 10; x < XO; x += 26) {
                  const x2 = Math.min(XO, x + 14), o = 0.55 * Math.pow(1 - (x - X1) / (XO - X1), 1.4);
                  out.push(<polyline key={`${j}_${x}`} points={poly([x, h, z], [x2, h, z])} fill="none" stroke={mixHex("#8DB6E6", "#1F62B3", Lw)} strokeOpacity={o} strokeWidth={2} strokeLinecap="round" />);
                }
              });
              return out;
            })()}
          </g>

          {/* ═══ THE STATION PLATES, inlaid in the bed's front (engraved, from the track's first frame; each lights as it is reached) ═══ */}
          {ST.map((s, i) => {
            const pw = 200, ph = 84, fs = 34;
            const [px, py] = S(s.x - pw / 2, (BH0 + BH1) / 2 + ph / 2 - 4, 0);
            return (
              <g key={s.t}>
                <rect data-probe-skip x={px - 4} y={py - 4} width={pw + 8} height={ph + 8} rx={6} fill={alpha("#011A38", 0.7)} />
                <rect x={px} y={py} width={pw} height={ph} rx={4} fill={mixHex(mixHex("#6E98CC", "#B7D1F0", Lw), mixHex("#E8F0FA", "#FFFFFF", Lw), lit[i])} stroke={alpha("#011A38", 0.5)} strokeWidth={1.5} />
                <g data-probe-skip>
                  <line x1={px + 3} x2={px + pw - 3} y1={py + 1.4} y2={py + 1.4} stroke={alpha("#FFFFFF", 0.7)} strokeWidth={1.2} />
                  {[[7, 7], [pw - 7, 7], [7, ph - 7], [pw - 7, ph - 7]].map(([x, y], k) => <circle key={k} cx={px + x} cy={py + y} r={2} fill="#3C83D5" />)}
                </g>
                <text data-print x={px + pw / 2} y={py + (ph - 1.5 * fs) / 2 + 1.1765 * fs} textAnchor="middle" fontFamily="Anton" fontSize={fs} letterSpacing={2} fill={mixHex("#0B2F66", "#021631", lit[i])}>{s.t}</text>
              </g>
            );
          })}

          {/* ═══ THE GUIDE RAIL on the bed's top (polished steel), built to the bed's end ═══ */}
          <polygon points={poly([X1, BH1, RZ0], [X1, BH1, RZ1], [X1, RTOP, RZ1], [X1, RTOP, RZ0])} fill="#2D6AB1" />
          <polygon points={poly([X0, RTOP, RZ0], [X1, RTOP, RZ0], [X1, RTOP, RZ1], [X0, RTOP, RZ1])} fill="url(#tlRailT)" />
          <polygon points={poly([X0, BH1, RZ0], [X1, BH1, RZ0], [X1, RTOP, RZ0], [X0, RTOP, RZ0])} fill="url(#tlRailF)" />
          <g data-probe-skip>
            <polyline points={poly([X0, RTOP - 0.5, RZ0], [X1, RTOP - 0.5, RZ0])} fill="none" stroke={alpha("#FFFFFF", 0.85)} strokeWidth={1.4} />
            {/* the rail's own shadow on the bed's top, just behind it (the key is upper left) */}
            <polygon points={poly([X0 + 6, BH1 + 0.3, RZ1], [X1, BH1 + 0.3, RZ1], [X1, BH1 + 0.3, RZ1 + 9], [X0 + 10, BH1 + 0.3, RZ1 + 9])} fill={shadowInk} fillOpacity={0.35 - 0.1 * Lw} />
          </g>

          {/* ═══ THE CARRIAGE, riding the rail: its shadow on the bed, its body, its front window (lit), the index pointer down its front ═══ */}
          {(() => {
            const x0 = cx - CW / 2, x1 = cx + CW / 2;
            const [wx, wy] = S(x0 + 22, RTOP + CH - 18, CZ0);
            const [p0x, p0y] = S(cx, RTOP + 2, CZ0 - 2);
            return (
              <g>
                <polygon data-probe-skip points={poly([x0 + 6, BH1 + 0.4, CZ1], [x1 + 18, BH1 + 0.4, CZ1], [x1 + 18, BH1 + 0.4, BD - 2], [x0 + 12, BH1 + 0.4, BD - 2])} fill={shadowInk} fillOpacity={0.4 - 0.12 * Lw} />
                <FSolid id="tlM" outline={front(x0, x1, RTOP - 6, RTOP + CH, CZ0, 8)} d={CZ1 - CZ0} tone={toneW(["#DCE9F7", "#123C74"], Lw)} face="url(#tlMLit)" rim={0.7} />
                <g data-probe-skip>
                  {/* its two rollers at the foot of its front, on the rail */}
                  {[x0 + 22, x1 - 22].map((rx, k) => { const [qx, qy] = S(rx, RTOP - 1, CZ0); return <g key={k}><circle cx={qx} cy={qy} r={8} fill="#0B2F66" stroke={alpha("#8DB6E6", 0.7)} strokeWidth={1.4} /><circle cx={qx} cy={qy} r={2.6} fill="#B3CEEF" /></g>; })}
                  {/* the front window: dark glass with the lamp behind it */}
                  <rect x={wx} y={wy} width={CW - 44} height={26} rx={4} fill="url(#tlGlass)" stroke={alpha("#011A38", 0.5)} strokeWidth={1.2} />
                  <rect x={wx + 4} y={wy + 4} width={(CW - 52) * 0.6} height={18} rx={3} fill="#B3CEEF" opacity={0.85} />
                  <line x1={wx + 3} x2={wx + CW - 47} y1={wy + 1.2} y2={wy + 1.2} stroke={alpha("#FFFFFF", 0.55)} strokeWidth={1} />
                  {/* the index pointer: a steel tongue hanging over the rail's front, pointing down at the station's plate */}
                  <polygon points={pt([[p0x - 9, p0y], [p0x + 9, p0y], [p0x, p0y + 26]])} fill="url(#tlSteel)" stroke={alpha("#011A38", 0.55)} strokeWidth={1} />
                </g>
              </g>
            );
          })()}
        </svg>

        {/* ═══ PRODUCTION, the one label, landing over the carriage at 2028 ═══ */}
        {lb > 0.001 && (() => {
          // (centred over the 2028 post's lamp, its ink ≥ 14 px clear of the lamp's ring)
          const [ax, ay] = S(ST[2].x + 4, LAMP, PZ + 4);
          return (
            <div style={{ position: "absolute", left: ax - 200, width: 400, top: ay - 9 - 18 - 36 + 12 * (1 - lb), textAlign: "center", opacity: lb, ...label(36, mixHex("#E3EDF9", "#0C64CA", Lw)) }}>PRODUCTION</div>
          );
        })()}
      </div>
    </Turn>
  );
};
