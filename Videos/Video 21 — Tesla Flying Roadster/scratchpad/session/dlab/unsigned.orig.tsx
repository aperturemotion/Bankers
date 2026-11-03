import React from "react";
import { useCurrentFrame } from "remotion";
import { rOut, rInOut, clamp01, alpha } from "../anim";
import { Faces, P, matBox, contactShadow, onFace, swing, seen, depthOf, lightOf, mix, type Face, type V } from "../p3";
import { type Rig } from "../rig";
import { Pool3D } from "../s3";
import { MARKS } from "../marks";
import { SPX_D } from "../spxlogo";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// honestC — "And no merger terms have been agreed." ★ THE MERGER AGREEMENT, UNSIGNED: a printed agreement lying on a leather desk blotter,
// in REAL DEPTH (p3.tsx), seen from above. It reads as paper (STYLE §16 2026-10-28): a stack of sheets with visible thickness, each a hair
// out of line, a staple through the top-left corner, faint fibre in the top page. Its print is on it from its first frame: MERGER AGREEMENT
// at its head, its body copy as lines of type, and at its foot TWO EMPTY SIGNATURE LINES — Tesla's T under the left, SpaceX's mark under
// the right (the parties, as real marks: never typed, never boxed). A fountain pen lies beside it on the blotter, CAPPED. Nothing gets
// signed: on "terms" a light runs along the left line, on "agreed" along the right — both stay empty. Calm. KIND object. (The committee
// scene's folders and blocks are not reused.)
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const KIND = "object";

type C = { arrive: number; terms: number; agreed: number; end: number };
export const unsignedTimes = (c: C) => ({
  /** the desk, the agreement and the pen arrive with the camera (the slide) */
  base: [c.arrive - 6, c.arrive + 26] as [number, number],
  /** a light runs along the left (Tesla) signature line on "terms"… */
  lineL: [c.terms - 6, c.terms + 18] as [number, number],
  /** …and along the right (SpaceX) one on "agreed" — both stay empty */
  lineR: [c.agreed - 6, c.agreed + 14] as [number, number],
  /** the frame the place's LAST action ends (the next place waits for it) */
  done: c.agreed + 14,
});

// ── the world: the desk top at y DESK; the agreement's sheets PW × PH centred (DX, 0), its head at the far edge (z −PH/2) ──
const CX = 540, DESK = 1050, DX = 492, PW = 500, PH = 660, SHEETS = 6, T = 3;
const PITCH = -54, PERSP = 2400;
const rigOf = (yaw: number): Rig => ({ cx: CX, cy: DESK, persp: PERSP, yaw, pitch: PITCH });
/** the blotter: x BX0..BX1, z ±BZ, BH thick */
const BX0 = 156, BX1 = 924, BZ = 430, BH = 7;
const TOP = DESK - BH - SHEETS * T;
/** the pen's turn on the desk (degrees from the x axis: it lies nearly front to back, its cap toward the viewer) */
const PEN_ANG = 80;
/** the signature lines on the page (page units: x across, y from the head down) */
const SIG_Y = 540, SIG = [[44, 224], [276, 456]] as const;
/** a page point (px, py) → the world, on the top page */
const pageW = (px: number, py: number): V => [DX - PW / 2 + px, TOP - 0.3, -PH / 2 + py];

/** where the camera aims: the whole desk, and the two empty signature lines (IN on their middle, along from left to right) */
export const UNSIGNED = (() => {
  const r = rigOf(0);
  const mid = P(r, pageW(PW / 2, SIG_Y)), l = P(r, pageW((SIG[0][0] + SIG[0][1]) / 2, SIG_Y)), rr = P(r, pageW((SIG[1][0] + SIG[1][1]) / 2, SIG_Y));
  const c = P(r, [CX, DESK, 0]);
  return { x: CX, y: Math.round(c.y), a: { x: Math.round(mid.x), y: Math.round(mid.y) }, sigL: { x: Math.round(l.x), y: Math.round(l.y) }, sigR: { x: Math.round(rr.x), y: Math.round(rr.y) } } as const;
})();

/** ★ THE FOUNTAIN PEN, lying on the blotter: a loft of round sections along its own axis (turned `ang` in the desk's plane), each facet lit by
 *  its own normal (smooth, never striped: the facets are outlined in their own colour). Its barrel in deep-blue lacquer, the CAP over its
 *  nib end with a steel band and a steel clip along its top, rounded ends. */
const pen = (r: Rig, k: string, cx: number, cz: number, ang: number): Face[] => {
  const a = (ang * Math.PI) / 180, d: V = [Math.cos(a), 0, Math.sin(a)], up: V = [0, -1, 0], sd: V = [-Math.sin(a), 0, Math.cos(a)];
  const R0 = 11;
  const yC = DESK - BH - R0;
  // sections: u along the pen (− = the barrel's end, + = the cap's end), radius, and its finish
  type Sx = { u: number; R: number; ink: [string, string] };
  const lac: [string, string] = ["#6F9ED8", "#021631"], steel: [string, string] = ["#F2F7FC", "#3C6FA8"], capC: [string, string] = ["#5D8FCB", "#011A38"];
  const secs: Sx[] = [
    { u: -150, R: 2, ink: lac }, { u: -148, R: 7, ink: lac }, { u: -144, R: 9.6, ink: lac }, { u: -138, R: 10.5, ink: lac },
    { u: 20, R: 10.5, ink: lac }, { u: 24, R: 10.6, ink: steel }, { u: 30, R: 11.4, ink: steel }, { u: 34, R: 11.4, ink: capC },
    { u: 132, R: 11.2, ink: capC }, { u: 140, R: 10.4, ink: capC }, { u: 146, R: 8, ink: capC }, { u: 150, R: 2.5, ink: capC },
  ];
  const at = (u: number, R: number, t: number): V => [cx + d[0] * u + up[0] * R * Math.cos(t) + sd[0] * R * Math.sin(t), yC + up[1] * R * Math.cos(t), cz + d[2] * u + sd[2] * R * Math.sin(t)];
  const out: Face[] = [];
  const N = 28;
  for (let j = 0; j < secs.length - 1; j++) {
    const A = secs[j], B = secs[j + 1], slope = (A.R - B.R) / Math.max(0.5, B.u - A.u);
    for (let i = 0; i < N; i++) {
      const t0 = (i / N) * Math.PI * 2, t1 = ((i + 1) / N) * Math.PI * 2, tm = (t0 + t1) / 2;
      let n: V = [d[0] * slope + up[0] * Math.cos(tm) + sd[0] * Math.sin(tm), up[1] * Math.cos(tm), d[2] * slope + sd[2] * Math.sin(tm)];
      const l = Math.hypot(...n); n = [n[0] / l, n[1] / l, n[2] / l];
      const c4: V[] = [at(A.u, A.R, t0), at(B.u, B.R, t0), at(B.u, B.R, t1), at(A.u, A.R, t1)];
      const v = seen(r, c4, n);
      if (!v.ok) continue;
      const L = lightOf(r, n), col = mix(B.ink[1], B.ink[0], L);
      out.push({ k: `${k}${j}_${i}`, p: v.p, z: c4.reduce((s, q) => s + depthOf(r, q), 0) / 4 + 2000, fill: col, stroke: col, sw: 0.8, chrome: 0, fall: 0, skip: true });
    }
  }
  // the clip: a steel strip along the cap's top, standing a little proud of it, its foot a small ball
  const ct = Math.PI * 0.08;
  const clip: V[] = [at(44, 13.2, ct - 0.18), at(126, 13.2, ct - 0.18), at(126, 13.2, ct + 0.18), at(44, 13.2, ct + 0.18)];
  const cn: V = [up[0] * Math.cos(ct) + sd[0] * Math.sin(ct), up[1] * Math.cos(ct), sd[2] * Math.sin(ct)];
  const cv = seen(r, clip, cn);
  if (cv.ok) out.push({ k: `${k}clip`, p: cv.p, z: 1e5, fill: mix("#4C77AA", "#F2F7FC", lightOf(r, cn)), stroke: "#2D5E9A", sw: 0.8, chrome: 0, fall: 0, skip: true });
  return out;
};

export const Unsigned: React.FC<C> = (c) => {
  const f = useCurrentFrame();
  const Tm = unsignedTimes(c);
  const bq = rOut(f, ...Tm.base);
  const r = rigOf(swing(f, c.arrive, c.arrive + 110, -5, 4, 0.5));
  const lL = rInOut(f, ...Tm.lineL), lR = rInOut(f, ...Tm.lineR);

  const faces: Face[] = [];
  // ── the blotter: dark leather on the desk, its two side rails a step proud, stitched round; its shadow on the desk ──
  faces.push(...contactShadow(r, "unbs", BX0, BX1, -BZ, BZ, DESK, 0.8, 30).map((q) => ({ ...q, z: q.z - 4e6 })));
  const blot = matBox(r, "unb", BX0 + 62, BX1 - 62, DESK - BH, DESK, -BZ, BZ, "#0C2C58", { chrome: 0.25, skip: true }, 0.62).map((q) => ({ ...q, z: q.z - 3e6 }));
  faces.push(...blot);
  for (const [x0, x1, s] of [[BX0, BX0 + 64, "L"], [BX1 - 64, BX1, "R"]] as const) {
    faces.push(...matBox(r, `unr${s}`, x0, x1, DESK - BH - 4, DESK, -BZ - 4, BZ + 4, "#0A2850", { chrome: 0.35, skip: true }, 0.72).map((q) => ({ ...q, z: q.z - 2.9e6 })));
    const top = faces.find((q) => q.k === `unr${s}t`);
    if (top) top.after = (
      <g data-probe-skip transform={onFace(r, [x0, DESK - BH - 4.2, -BZ - 4], [x1, DESK - BH - 4.2, -BZ - 4], [x0, DESK - BH - 4.2, BZ + 4], x1 - x0, 2 * BZ + 8)}>
        <rect x={9} y={12} width={x1 - x0 - 18} height={2 * BZ - 16} rx={3} fill="none" stroke={alpha("#8DB6E6", 0.4)} strokeWidth={1.4} strokeDasharray="6 5" />
        <rect x={1} y={1} width={3} height={2 * BZ + 6} fill={alpha("#FFFFFF", s === "L" ? 0.25 : 0.12)} />
      </g>
    );
  }
  // ── the agreement: its shadow, the sheets under the top one (each a hair out of line — a real stack is never square), the top page ──
  faces.push(...contactShadow(r, "unds", DX - PW / 2, DX + PW / 2, -PH / 2, PH / 2, DESK - BH, 0.9, 24).map((q) => ({ ...q, z: q.z - 2e6 })));
  const off = [[0, 0], [5, -4], [-4, 5], [7, 2], [-6, -3]];
  for (let i = 0; i < SHEETS - 1; i++) {
    const [dx, dz] = off[i % off.length], y1 = DESK - BH - i * T, y0 = y1 - T;
    faces.push(...matBox(r, `uns${i}`, DX - PW / 2 + dx, DX + PW / 2 + dx, y0, y1, -PH / 2 + dz, PH / 2 + dz, "#D9E4F1", { chrome: 0, skip: true }, 1.05).map((q) => ({ ...q, z: q.z - 1e6 + i * 10 })));
  }
  const page = matBox(r, "unp", DX - PW / 2, DX + PW / 2, TOP, TOP + T, -PH / 2, PH / 2, "#EEF4FB", { chrome: 0.15 }, 1.1).map((q) => ({ ...q, z: q.z - 0.9e6 }));
  faces.push(...page);
  // ── the top page's print (on it from the first frame), its fibre, the staple ──
  const top = page.find((q) => q.k === "unpt");
  const fib = React.useMemo(() => {
    // (faint fibre: short strokes at fixed, seeded places — the paper's grain, never a pattern fill)
    let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    return Array.from({ length: 170 }, () => { const x = 8 + rnd() * (PW - 16), y = 8 + rnd() * (PH - 16), a = rnd() * Math.PI, l = 5 + rnd() * 9; return `M${x.toFixed(1)} ${y.toFixed(1)}l${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l).toFixed(1)}`; }).join(" ");
  }, []);
  if (top) top.after = (
    <g transform={onFace(r, pageW(0, 0), pageW(PW, 0), pageW(0, PH), PW, PH)}>
      <path data-probe-skip d={fib} stroke="#5B7FA8" strokeOpacity={0.09} strokeWidth={1} fill="none" />
      {/* the head: the title, a rule under it */}
      <text data-print x={PW / 2} y={92} textAnchor="middle" fontFamily="Anton" fontSize={42} letterSpacing={3} fill="#021631">MERGER AGREEMENT</text>
      <g data-probe-skip>
        <rect x={44} y={128} width={PW - 88} height={2.5} fill={alpha("#0B3F82", 0.75)} />
        {/* the body copy: its clauses as lines of type, a numbered paragraph each */}
        {Array.from({ length: 10 }, (_, i) => {
          const para = Math.floor(i / 4), y = 168 + i * 24 + para * 14, last = i % 4 === 3 || i === 9;
          return (
            <React.Fragment key={i}>
              {i % 4 === 0 && <rect x={44} y={y} width={16} height={9} rx={2} fill={alpha("#0B3F82", 0.55)} />}
              <rect x={i % 4 === 0 ? 72 : 44} y={y} width={(last ? 0.55 : 1) * (PW - 88) - (i % 4 === 0 ? 28 : 0)} height={9} rx={3} fill={alpha("#2D5E9A", 0.5)} />
            </React.Fragment>
          );
        })}
        {/* IN WITNESS WHEREOF… (a short closing line over the signature blocks) */}
        <rect x={44} y={438} width={PW * 0.5} height={9} rx={3} fill={alpha("#2D5E9A", 0.5)} />
        {/* the two signature lines — empty; a light runs along each on its word */}
        {SIG.map(([x0, x1], i) => {
          const p = i === 0 ? lL : lR, gx = x0 + (x1 - x0 + 80) * p - 40;
          return (
            <g key={i}>
              <rect x={x0} y={SIG_Y} width={x1 - x0} height={2.5} fill="#0B2F66" />
              {p > 0.001 && p < 0.999 && <rect x={Math.max(x0, gx - 34)} y={SIG_Y - 2} width={Math.max(0, Math.min(x1, gx + 34) - Math.max(x0, gx - 34))} height={6.5} rx={3} fill="#7FB0EA" opacity={0.85 * Math.sin(Math.PI * p)} />}
            </g>
          );
        })}
      </g>
      {/* the parties, under their lines: Tesla's T and SpaceX's mark (real marks, in the page's ink, no box) */}
      <g data-probe-skip transform={`translate(${(SIG[0][0] + SIG[0][1]) / 2 - 24} ${SIG_Y + 26}) scale(2)`}><path d={MARKS.tesla} fill="#021631" /></g>
      <g data-probe-skip transform={`translate(${(SIG[1][0] + SIG[1][1]) / 2 - 60} ${SIG_Y + 4}) scale(5)`}>{SPX_D.map((dd, i) => <path key={i} d={dd} fill="#021631" />)}</g>
      {/* the staple through the top-left corner (its crown on the page, a lit edge) */}
      <g data-probe-skip transform="translate(26 30) rotate(-42)">
        <rect x={-15} y={-2.2} width={30} height={4.4} rx={2} fill="#9DB6D3" stroke="#4C6E98" strokeWidth={0.8} />
        <rect x={-14} y={-2} width={28} height={1.2} fill={alpha("#FFFFFF", 0.8)} />
      </g>
    </g>
  );
  // ── the pen, capped, lying on the blotter to the right of the agreement ──
  {
    // its soft shadow along it on the leather (a few feathered strips leaning away from the key)
    const a = (PEN_ANG * Math.PI) / 180, pcx = DX + PW / 2 + 70, pcz = 40;
    for (let i = 0; i < 6; i++) {
      const g = i / 5, w = 6 + g * 16, L = 150 + g * 10, ox = 4 + g * 8, oz = -2 - g * 6;
      const q: V[] = [[-L, w], [L, w], [L, -w], [-L, -w]].map(([u, v]) => [pcx + ox + Math.cos(a) * u - Math.sin(a) * v, DESK - BH - 0.4, pcz + oz + Math.sin(a) * u + Math.cos(a) * v] as V);
      faces.push({ k: `unpsh${i}`, p: q.map((v) => P(r, v)), z: -0.5e6 - i, fill: "#000814", op: 0.11 * (1 - 0.6 * g), chrome: 0, fall: 0, skip: true, sw: 0 });
    }
    faces.push(...pen(r, "unpen", pcx, pcz, PEN_ANG));
  }

  const pool = P(r, [CX, DESK, 0]);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: bq < 1 ? bq : undefined }}>
      <Pool3D x={CX} y={pool.y + 40} w={1100} on={0.7} />
      <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Faces list={faces} />
      </svg>
    </div>
  );
};
