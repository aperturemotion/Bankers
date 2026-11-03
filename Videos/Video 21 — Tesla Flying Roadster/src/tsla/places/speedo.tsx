import React from "react";
import { useCurrentFrame } from "remotion";
import { rInOut, clamp01, alpha, mixHex } from "../anim";
import { type Rig } from "../rig";
import { Faces, P, seen, lightOf, onFace, depthOf, mix, metal, swing, type Face, type V } from "../p3";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// whatD — "Tesla says it goes from 0 to 60 in under 1 second." A SPEEDOMETER IN REAL DEPTH (p3.tsx; STYLE §16 2026-10-21: a gauge is a
// detailed 3-D instrument — bezel, glass, dial face with its scale, a real needle on a hub; 2026-10-20: its round rim ONE smooth metallic
// surface, no facets). A car's own instrument, not Video 16's fundraising gauge:
//   · a turned dark-blue steel CASE with a rear lip (smooth 160-slice drums), a thick polished chrome BEZEL turned in two steps down to
//     the dial (no screws: a car's speedometer has none);
//   · the DIAL: a deep navy face, an MPH scale 0–120 over 240° with 60 at twelve o'clock — ticks every 5 (majors every 20, mids every 10),
//     figures 0 … 120 OUTSIDE the ticks (the needle is shorter than their radius: clear of its sweep), and a fine ring at the ticks' feet
//     that FILLS behind the needle; every tick the needle passes LIGHTS (a blend, never a switch);
//   · a built-in DIGITAL READ-OUT in the dial's lower gap (a recessed glass window, its figure and MPH), counting with the needle;
//   · under it an INLAID NAMEPLATE (a brushed plate set into the face), its engraving dim until it lights: UNDER 1 SECOND;
//   · the NEEDLE a lit pale blade with a ridge and a counterweight, standing off the dial over its painted shadow, under a domed chrome
//     hub cap; the glass's highlights in front of everything.
// Beats: the cluster's backlight comes up on "says" (the ticks and the read-out brighten); on "zero" the needle sweeps 0 → 60 in 28 frames
// (under one second of screen time — one in-out, no overshoot) and the read-out COUNTS 0 → 60 with it; on "under" the nameplate lights.
// KIND dial.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const KIND = "dial";

type C = { arrive: number; says: number; zero: number; sixty: number; under: number; second: number; end: number };
/** its animation windows; `done`: the frame its LAST action ends (the next place waits for it — registry.tsx) */
export const speedoTimes = (c: C) => {
  const sweep: [number, number] = [c.zero, c.zero + 28];
  return {
    /** the instrument arrives with the camera (no action of its own) */
    base: [c.arrive - 6, c.arrive + 26] as [number, number],
    /** the backlight comes up on "says": ticks and read-out brighten (a soft click) */
    power: [c.says - 4, c.says + 14] as [number, number],
    /** ★ the needle sweeps 0 → 60 MPH in 28 f (under one second), one in-out; the read-out counts with it over the same frames */
    sweep,
    count: sweep,
    /** the nameplate's engraving lights: UNDER 1 SECOND (on "under") */
    plate: [c.under - 4, c.under + 12] as [number, number],
    done: c.under + 16,
  };
};

const CX = 590, CY = 990, R = 352, RO = 358, RB = 326, RS = 318, RD = 310, DEPTH = 84, ZB = 16, ZS = 8, ZD = 2;   // (CX 50 right of centre: the slide in from the left shares ≥ 15 f with the car it replaces)
const VMAX = 120, TARGET = 60;
/** a value in MPH → its angle (degrees from 12 o'clock, clockwise): 0 at −120°, 60 at 0°, 120 at +120° */
const angOf = (v: number) => -120 + (v / VMAX) * 240;
/** a point of the dial's own square (2·RD wide, centre RD, RD) at value v, radius rr */
const dpt = (v: number, rr: number) => { const a = (angOf(v) * Math.PI) / 180; return { x: RD + rr * Math.sin(a), y: RD - rr * Math.cos(a) }; };

/** radii on the dial: the ticks' outer ends, the fill ring at their feet, the figures (outside the ticks), the needle (shorter than all) */
const TICK = 228, FR0 = 184, FR1 = 190, FIG = 272, NEEDLE = 210;
/** the read-out window and the nameplate, in the dial's square (centred on x RD) */
// (the window's top-left corner kept ≥ 16 px under the needle resting on 0, which lies 30° below the horizontal)
const WIN = { x0: RD - 100, x1: RD + 100, y0: RD + 84, y1: RD + 180 }, PLATE = { x0: RD - 124, x1: RD + 124, y0: RD + 198, y1: RD + 248 };

const rigAt = (c: C, f: number): Rig => ({ cx: CX, cy: CY, persp: 2200, yaw: swing(f, c.arrive, c.arrive + 220, -17, -9, 0.5), pitch: -6 });

/** ★ where the camera keys aim. `a`: the needle's pivot and the read-out under it (the close-in), projected through the rig as it stands
 *  mid-place (yaw ≈ −13°) */
const A_PT = (() => {
  const r: Rig = { cx: CX, cy: CY, persp: 2200, yaw: -13, pitch: -6 };
  const p = P(r, [CX, CY + 70, ZD]);
  return { x: Math.round(p.x), y: Math.round(p.y) };
})();
export const SPEEDO = { x: CX, y: CY, a: A_PT } as const;

const ring = (rad: number, z: number, n: number): V[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [CX + rad * Math.cos(a), CY + rad * Math.sin(a), z] as V; });
const pathOf = (q: { x: number; y: number }[]) => `M${q.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")} Z`;
const ptsOf = (q: { x: number; y: number }[]) => q.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
/** a turned band round the axis between depths z0 and z1 (160 slices, each shaded by its own normal, outlined in its own colour: ONE
 *  smooth surface, never facets — STYLE §16 2026-10-20) */
const drum = (r: Rig, k: string, rad: number, z0: number, z1: number, col: (n: V) => string, n = 160): Face[] => {
  const out: Face[] = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2, am = (a0 + a1) / 2;
    const c: V[] = [[CX + rad * Math.cos(a0), CY + rad * Math.sin(a0), z1], [CX + rad * Math.cos(a1), CY + rad * Math.sin(a1), z1], [CX + rad * Math.cos(a1), CY + rad * Math.sin(a1), z0], [CX + rad * Math.cos(a0), CY + rad * Math.sin(a0), z0]];
    const nrm: V = [Math.cos(am), Math.sin(am), 0];
    const v = seen(r, c, nrm);
    if (!v.ok) continue;
    const fill = col(nrm);
    out.push({ k: `${k}${i}`, p: v.p, z: c.reduce((s, q) => s + depthOf(r, q), 0) / 4, fill, stroke: fill, sw: 1.2, chrome: 0, fall: 0, skip: true });
  }
  return out;
};
/** an arc band of the scale between values v0 and v1, radii r0..r1, in the dial's square */
const band = (v0: number, v1: number, r0: number, r1: number) => {
  if (v1 - v0 < 0.05) return "";
  const a = dpt(v0, r1), b = dpt(v1, r1), c = dpt(v1, r0), d = dpt(v0, r0), big = angOf(v1) - angOf(v0) > 180 ? 1 : 0;
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${r1} ${r1} 0 ${big} 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)} L${c.x.toFixed(1)} ${c.y.toFixed(1)} A ${r0} ${r0} 0 ${big} 0 ${d.x.toFixed(1)} ${d.y.toFixed(1)} Z`;
};
/** the needle at value v: a tapered blade from its counterweight tail to its tip, in the dial's square */
const blade = (v: number, len: number, w: number, tail: number) => {
  const a = (angOf(v) * Math.PI) / 180, ux = Math.sin(a), uy = -Math.cos(a), px = -uy, py = ux;
  const Q = (s: number, t: number) => `${(RD + ux * s + px * t).toFixed(1)},${(RD + uy * s + py * t).toFixed(1)}`;
  return [Q(-tail, w * 0.34), Q(-tail * 0.4, w * 0.38), Q(len * 0.1, w / 2), Q(len * 0.9, w * 0.16), Q(len, 0), Q(len * 0.9, -w * 0.16), Q(len * 0.1, -w / 2), Q(-tail * 0.4, -w * 0.38), Q(-tail, -w * 0.34)].join(" ");
};
const along = (v: number, s: number) => { const a = (angOf(v) * Math.PI) / 180; return { x: RD + Math.sin(a) * s, y: RD - Math.cos(a) * s }; };

const Defs: React.FC = () => (
  <defs data-probe-skip>
    {/* the instrument face: a deep navy that lifts a little under the key (upper left) */}
    <radialGradient id="spDial" cx="0.38" cy="0.3" r="0.85"><stop offset="0" stopColor="#103663" /><stop offset="0.5" stopColor="#051E3A" /><stop offset="1" stopColor="#020D1E" /></radialGradient>
    <linearGradient id="spChrome" x1="0.12" y1="0" x2="0.88" y2="1">
      <stop offset="0" stopColor="#F5F9FD" /><stop offset="0.24" stopColor="#B3CEEF" /><stop offset="0.4" stopColor="#2D6AB1" />
      <stop offset="0.52" stopColor="#C9DDF3" /><stop offset="0.74" stopColor="#4D8ED9" /><stop offset="1" stopColor="#0B3F82" />
    </linearGradient>
    {/* the bezel's inner step: a turned chamfer, dark at the top (in its own shadow), light at the bottom where it faces the key's bounce */}
    <linearGradient id="spStep" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#011A38" /><stop offset="0.55" stopColor="#0B3F82" /><stop offset="1" stopColor="#8DB6E6" /></linearGradient>
    <linearGradient id="spBlade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.45" stopColor="#E3EEFA" /><stop offset="1" stopColor="#8DB6E6" /></linearGradient>
    <linearGradient id="spFill" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#2D6AB1" /><stop offset="1" stopColor="#B3CEEF" /></linearGradient>
    <linearGradient id="spGlass" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.14" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></linearGradient>
    {/* the read-out's glass: near-black navy, a faint lift at its top */}
    <linearGradient id="spLcd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0A2342" /><stop offset="0.35" stopColor="#031024" /><stop offset="1" stopColor="#020B19" /></linearGradient>
    {/* the nameplate: brushed light steel, its sheen diagonal */}
    <linearGradient id="spPlate" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#C6DAF1" /><stop offset="0.35" stopColor="#7FA7D6" /><stop offset="0.55" stopColor="#A9C6E8" /><stop offset="1" stopColor="#3F74B6" />
    </linearGradient>
    <radialGradient id="spHalo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#8DB6E6" stopOpacity="0.5" /><stop offset="1" stopColor="#8DB6E6" stopOpacity="0" /></radialGradient>
  </defs>
);

export const Speedo: React.FC<C> = (c) => {
  const f = useCurrentFrame();
  const T = speedoTimes(c);
  const r = rigAt(c, f);
  const pw = rInOut(f, ...T.power);
  const sq = rInOut(f, ...T.sweep);
  const v = TARGET * sq;
  const shown = Math.round(v);
  // the plate's engraving lights over TIME (16 f, in-out): dim engraving → lit
  const pq = rInOut(f, ...T.plate);
  const out: Face[] = [];
  // ── the case: a rear lip, the turned drum, the bezel's rim (smooth drums, one polished surface each) ──
  out.push(...drum(r, "lp", R - 12, -DEPTH - 12, -DEPTH, (n) => metal(r, n, 0)));
  out.push(...drum(r, "cs", R, -DEPTH, -6, (n) => metal(r, n, 0.16)));
  out.push(...drum(r, "bz", RO, -6, ZB, (n) => mix("#0B3F82", "#F1F6FC", lightOf(r, n))));
  // the case's specular stripe, where its turned side meets the key
  const sa = Math.PI * 1.18, sp0 = P(r, [CX + R * Math.cos(sa), CY + R * Math.sin(sa), -DEPTH + 10]), sp1 = P(r, [CX + R * Math.cos(sa), CY + R * Math.sin(sa), -10]);
  // ── the front: the bezel's face, its two turned steps down to the dial, the dial ──
  const outer = ring(RO, ZB, 160).map((q) => P(r, q)), inner = ring(RB, ZB, 160).map((q) => P(r, q));
  const step1 = ring(RS, ZS, 160).map((q) => P(r, q)), step2 = ring(RD, ZD, 160).map((q) => P(r, q));
  const faceZ = depthOf(r, [CX, CY, ZB]);
  const dialT = (dz: number) => onFace(r, [CX - RD, CY - RD, ZD + dz], [CX + RD, CY - RD, ZD + dz], [CX - RD, CY + RD, ZD + dz], 2 * RD, 2 * RD);
  const tip = along(v, NEEDLE);
  // the ticks: dim before the backlight, brighter after; every tick BEHIND the needle lit (blended over 3 MPH as the needle reaches it)
  const tickCol = (vv: number) => {
    const past = clamp01((v - vv) / 3 + 1) * pw;
    return { col: mixHex(mixHex("#5D7FA8", "#9CB8DA", pw), "#F4F9FE", past), lit: past };
  };
  const fig60 = clamp01((v - 54) / 6);
  const front = (
    <g>
      {/* the bezel: polished chrome, its gloss streak, then the two turned steps down to the dial */}
      <path data-probe-skip d={`${pathOf(outer)} ${pathOf(inner)}`} fill="url(#spChrome)" fillRule="evenodd" />
      <path data-probe-skip d={`${pathOf(outer)} ${pathOf(inner)}`} fill="url(#p3Gloss)" fillRule="evenodd" opacity={0.8} />
      <path data-probe-skip d={`${pathOf(inner)} ${pathOf(step1)}`} fill="url(#spStep)" fillRule="evenodd" />
      <path data-probe-skip d={`${pathOf(step1)} ${pathOf(step2)}`} fill="url(#spChrome)" fillRule="evenodd" opacity={0.85} />
      <polygon points={ptsOf(outer)} fill="none" stroke={alpha("#FFFFFF", 0.5)} strokeWidth={1.5} />
      <polygon data-probe-skip points={ptsOf(inner)} fill="none" stroke={alpha("#FFFFFF", 0.32)} strokeWidth={1} />
      <polygon data-probe-skip points={ptsOf(step1)} fill="none" stroke={alpha("#011A38", 0.6)} strokeWidth={1.2} />
      <polygon data-probe-skip points={ptsOf(step2)} fill="url(#spDial)" />
      <g transform={dialT(0)}>
        {/* the backlight's soft spill across the face, coming up with the power */}
        <circle data-probe-skip cx={RD} cy={RD} r={TICK + 14} fill="url(#spHalo)" opacity={0.1 + 0.14 * pw} />
        {/* the fill ring at the ticks' feet: unlit to 120, FILLED behind the needle */}
        <path data-probe-skip d={band(0, VMAX, FR0, FR1)} fill={alpha("#1C477E", 0.9)} />
        <path data-probe-skip d={band(0, v, FR0, FR1)} fill="url(#spFill)" />
        {/* the scale: ticks every 5 MPH — majors every 20, mids every 10 */}
        {Array.from({ length: 25 }, (_, i) => {
          const vv = i * 5, major = vv % 20 === 0, mid = !major && vv % 10 === 0;
          const a = dpt(vv, TICK), b = dpt(vv, TICK - (major ? 30 : mid ? 19 : 11));
          const t = tickCol(vv);
          return <line key={i} data-probe-skip x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={t.col} strokeOpacity={major ? 1 : mid ? 0.9 : 0.7} strokeWidth={major ? 5.5 : mid ? 3.6 : 2.2} strokeLinecap="round" />;
        })}
        {/* the figures, OUTSIDE the ticks (the needle never reaches them); 60 brightens as the needle arrives */}
        {[0, 20, 40, 60, 80, 100, 120].map((vv) => {
          const p = dpt(vv, FIG);
          const col = vv === 60 ? mixHex(mixHex("#9CB8DA", "#DCE8F6", pw), "#FFFFFF", fig60) : mixHex("#8DA9CC", "#DCE8F6", pw);
          return <text key={vv} data-print x={p.x} y={p.y + 11} textAnchor="middle" fontFamily="Anton" fontSize={30} letterSpacing={0.5} fill={col}>{vv}</text>;
        })}
        {/* the stop pin under 0 */}
        {(() => { const p = dpt(-6, NEEDLE - 24); return <g data-probe-skip><circle cx={p.x + 2} cy={p.y + 3} r={6.5} fill={alpha("#000814", 0.5)} /><circle cx={p.x} cy={p.y} r={5.5} fill="url(#spChrome)" /></g>; })()}
        {/* ★ the DIGITAL READ-OUT, recessed into the face: a chrome lip, its glass, the figure counting with the needle, MPH */}
        <rect data-probe-skip x={WIN.x0 - 5} y={WIN.y0 - 5} width={WIN.x1 - WIN.x0 + 10} height={WIN.y1 - WIN.y0 + 10} rx={16} fill="url(#spChrome)" opacity={0.9} />
        <rect x={WIN.x0} y={WIN.y0} width={WIN.x1 - WIN.x0} height={WIN.y1 - WIN.y0} rx={12} fill="url(#spLcd)" />
        <rect data-probe-skip x={WIN.x0 + 1} y={WIN.y0 + 1} width={WIN.x1 - WIN.x0 - 2} height={8} rx={6} fill={alpha("#000814", 0.5)} />
        <text data-print x={RD + 32} y={WIN.y0 + 73} textAnchor="end" fontFamily="Anton" fontSize={64} letterSpacing={0} fill={mixHex("#6E8FB8", "#E3EEFA", pw)}>{shown}</text>
        <text data-print x={RD + 42} y={WIN.y0 + 73} fontFamily="Anton" fontSize={22} letterSpacing={2} fill={mixHex("#4F6F99", "#8DB6E6", pw)}>MPH</text>
        {/* the read-out glass's one reflection, along its top */}
        <path data-probe-skip d={`M${WIN.x0 + 10} ${WIN.y0 + 14} L${WIN.x1 - 40} ${WIN.y0 + 14} L${WIN.x1 - 70} ${WIN.y0 + 30} L${WIN.x0 + 10} ${WIN.y0 + 30} Z`} fill={alpha("#FFFFFF", 0.05)} />
        {/* ★ the INLAID NAMEPLATE: a brushed plate set into the face (a dark seat round it), its engraving dim, then lit */}
        <rect data-probe-skip x={PLATE.x0 - 3} y={PLATE.y0 - 3} width={PLATE.x1 - PLATE.x0 + 6} height={PLATE.y1 - PLATE.y0 + 6} rx={9} fill={alpha("#000814", 0.7)} />
        <rect x={PLATE.x0} y={PLATE.y0} width={PLATE.x1 - PLATE.x0} height={PLATE.y1 - PLATE.y0} rx={7} fill="url(#spPlate)" />
        <rect data-probe-skip x={PLATE.x0 + 1} y={PLATE.y0 + 1} width={PLATE.x1 - PLATE.x0 - 2} height={PLATE.y1 - PLATE.y0 - 2} rx={6} fill="none" stroke={alpha("#FFFFFF", 0.45)} strokeWidth={1} />
        <text data-print x={RD} y={PLATE.y0 + 34} textAnchor="middle" fontFamily="Anton" fontSize={24} letterSpacing={3}
          fill={mixHex("#4F79AE", "#001C3C", pq)} opacity={0.3 + 0.7 * pq}>UNDER 1 SECOND</text>
      </g>
      {/* the needle's soft shadow on the dial (down and right, away from the key), the needle standing off it, its ridge, the hub cap */}
      <g transform={dialT(0)} opacity={0.42}><polygon data-probe-skip points={blade(v, NEEDLE, 16, 46)} fill="#000814" transform="translate(7 11)" /></g>
      <g transform={dialT(16)}>
        <polygon data-probe-skip points={blade(v, NEEDLE, 16, 46)} fill="url(#spBlade)" stroke="#0B3F82" strokeWidth={1} />
        <polygon data-probe-skip points={blade(v, NEEDLE - 10, 4, 28)} fill={alpha("#FFFFFF", 0.85)} />
        <circle data-probe-skip cx={tip.x} cy={tip.y} r={2.4} fill="#B3CEEF" />
        {(() => { const t = along(v, -36); return <circle data-probe-skip cx={t.x} cy={t.y} r={10} fill="url(#spChrome)" stroke="#0B3F82" strokeWidth={1.5} />; })()}
      </g>
      <g transform={dialT(24)}>
        <circle data-probe-skip cx={RD + 4} cy={RD + 6} r={30} fill={alpha("#000814", 0.35)} />
        <circle data-probe-skip cx={RD} cy={RD} r={28} fill="url(#spChrome)" stroke="#0A2A55" strokeWidth={2} />
        <circle data-probe-skip cx={RD} cy={RD} r={18} fill="url(#spStep)" />
        <circle data-probe-skip cx={RD} cy={RD} r={12} fill="url(#spChrome)" />
        <circle data-probe-skip cx={RD - 6} cy={RD - 7} r={4.5} fill={alpha("#FFFFFF", 0.85)} />
      </g>
    </g>
  );
  out.push({ k: "front", p: [], z: faceZ + 1e4, fill: "none", chrome: 0, fall: 0, sw: 0, skip: true, after: front });
  out.push({ k: "spec", p: [], z: faceZ - 1, fill: "none", chrome: 0, fall: 0, sw: 0, skip: true, after: <line data-probe-skip x1={sp0.x} y1={sp0.y} x2={sp1.x} y2={sp1.y} stroke="#FFFFFF" strokeOpacity={0.42} strokeWidth={5} strokeLinecap="round" /> });
  // ── the glass: its highlights, in front of everything ──
  out.push({ k: "glass", p: [], z: faceZ + 3e4, fill: "none", chrome: 0, fall: 0, sw: 0, skip: true, after: (
    <g transform={dialT(34)}>
      <path data-probe-skip d={`M ${RD - 286} ${RD + 24} A 286 286 0 0 1 ${RD + 36} ${RD - 284} L ${RD + 28} ${RD - 248} A 250 250 0 0 0 ${RD - 250} ${RD + 14} Z`} fill="url(#spGlass)" />
    </g>
  ) });
  // the soft pool of the key's light under the instrument (painted, never a filter)
  const g = P(r, [CX, CY + R + 40, -DEPTH / 2]);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div data-probe-skip style={{ position: "absolute", left: g.x - 460, top: g.y - 100, width: 920, height: 200, borderRadius: "50%",
        background: `radial-gradient(ellipse, ${alpha("#2D6AB1", 0.22)} 0%, ${alpha("#2D6AB1", 0.05)} 50%, transparent 72%)` }} />
      <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Defs />
        <Faces list={out} />
      </svg>
    </div>
  );
};
