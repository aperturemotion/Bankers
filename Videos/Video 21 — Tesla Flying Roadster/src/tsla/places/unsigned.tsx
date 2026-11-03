import React from "react";
import { useCurrentFrame } from "remotion";
import { rOut, rInOut, alpha, mixHex, clamp01 } from "../anim";
import { Faces, P, matBox, contactShadow, onFace, swing, shade, lightOf, mix, type Face, type V } from "../p3";
import { type Rig } from "../rig";
import { Pool3D } from "../s3";
import { MARKS } from "../marks";
import { SPX_D } from "../spxlogo";
import { cat, tr, rx, ry, rz, lathe, prism, mbox, satin, units, pface, MI, type Mx } from "./future";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// honestC — "And no merger terms have been agreed." ★ THE MERGER AGREEMENT, UNSIGNED: a printed agreement lying on a leather desk blotter,
// in REAL DEPTH, seen from above. ★ Rebuilt 2026-10-29 (Timur: "Improve the document and the pen … Make it more detailed"; STYLE §16: more
// detail, more 3-D):
//   · THE PAPER: a stack of sheets with real thickness, each fanned a degree or so out of line, the top sheet's lower right corner CURLING
//     up off the stack (the sheet under it shows), a staple through the top-left corner (its crown and its legs' dimples).
//   · ITS PRINT (on it from its first frame): MERGER AGREEMENT at the head over a sub-title line and a rule; four numbered clauses, each a
//     heading and lines of body type set as words; IN WITNESS WHEREOF; TWO SIGNATURE BLOCKS — an empty signature line, the party's real
//     mark (Tesla's T, SpaceX's X: never typed, never boxed), "Name" and "Title" lines — and the EMPTY initials boxes at the foot.
//   · A REAL FOUNTAIN PEN, uncapped, lying beside it: the lacquered barrel with its end cap and trim ring, the grip section, the black feed and
//     the steel NIB with its slit and breather hole; its CAP lying next to it with the clip and the cap band — every part lit round its body.
// Nothing gets signed: on "terms" a light runs along the left line, on "agreed" along the right — both stay empty. Calm.
// ★ THE WHITE STAGE (2026-10-30, Timur: "more contrast … more light-themed scenes"): `light` (0 navy … 1 white, default 0 = unchanged) blends
// every ink continuously (STYLE §4.3, never a threshold). On white the blotter's leather lifts from near-navy to a lit mid blue (a navy slab
// filling the frame would make the white scene read dark), its stitching goes paler, every shadow turns to the navy at the white stage's
// strength, the spotlight's falloff over the leather eases off, and the floor's pool gives way to a soft navy tint. The paper, its print and
// the pen keep their inks: they sit on the leather, not on the white. KIND object.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const KIND = "object";

type C = { arrive: number; terms: number; agreed: number; end: number; light?: number };
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
const CX = 540, DESK = 1050, DX = 486, PW = 500, PH = 680, SHEETS = 7, T = 2.6;
const PITCH = -54, PERSP = 2400;
const rigOf = (yaw: number): Rig => ({ cx: CX, cy: DESK, persp: PERSP, yaw, pitch: PITCH });
/** the blotter: x BX0..BX1, z ±BZ, BH thick */
const BX0 = 146, BX1 = 934, BZ = 440, BH = 7;
const TOP = DESK - BH - SHEETS * T;
/** the signature blocks on the page (page units: x across, y from the head down) */
const SIG_Y = 534, SIG = [[40, 226], [274, 460]] as const;
/** the top sheet's curling corner: the fold runs CU in from the lower right corner along both edges */
const CU = 92;
/** a page point (px, py) → the world, on the top page */
const pageW = (px: number, py: number): V => [DX - PW / 2 + px, TOP - 0.3, -PH / 2 + py];

/** where the camera aims: the whole desk, and the two empty signature lines (IN on their middle, along from left to right) */
export const UNSIGNED = (() => {
  const r = rigOf(0);
  const mid = P(r, pageW(PW / 2, SIG_Y)), l = P(r, pageW((SIG[0][0] + SIG[0][1]) / 2, SIG_Y)), rr = P(r, pageW((SIG[1][0] + SIG[1][1]) / 2, SIG_Y));
  const c = P(r, [CX, DESK, 0]);
  return { x: CX, y: Math.round(c.y), a: { x: Math.round(mid.x), y: Math.round(mid.y) }, sigL: { x: Math.round(l.x), y: Math.round(l.y) }, sigR: { x: Math.round(rr.x), y: Math.round(rr.y) } } as const;
})();

const PAPER = "#DCE6F2";
/** a shadow on white: the navy at the white stage's strength (STYLE §4.3: rgba(0,28,60,0.28–0.35)), never a near-black smudge */
const shadowW = (fs: Face[], Lw: number, k = 0.5): Face[] => (Lw <= 0.001 ? fs : fs.map((q) => ({ ...q, fill: mixHex("#000814", "#001C3C", Lw), op: (q.op ?? 1) * (1 - k * Lw) })));
/** the spotlight's falloff (p3's darkening radial) eased off on white, where it would read as a grey vignette over the leather */
const fallW = (fs: Face[], Lw: number): Face[] => (Lw <= 0.001 ? fs : fs.map((q) => ({ ...q, fall: (q.fall ?? 1) * (1 - 0.6 * Lw) })));
/** the body type: a line of WORDS (rounded bars of seeded lengths with word gaps), never one solid bar */
const typeLine = (x0: number, x1: number, y: number, seed: number, h = 6.5) => {
  let s = seed * 9301 + 49297; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  let x = x0, d = "";
  while (x < x1 - 8) { const w = Math.min(x1 - x, 10 + rnd() * 34); d += `M${x.toFixed(1)} ${y}h${w.toFixed(1)}v${h}h${(-w).toFixed(1)}Z`; x += w + 5 + rnd() * 2; }
  return d;
};
/** the page's print (page units), drawn on the top sheet; the curling corner is clipped away (it is drawn on the curl itself) */
const PagePrint: React.FC<{ lL: number; lR: number }> = ({ lL, lR }) => {
  const clauses = [{ y: 168, n: 3 }, { y: 246, n: 2 }, { y: 308, n: 3 }, { y: 386, n: 2 }];
  return (
    <>
      <text data-print x={PW / 2} y={86} textAnchor="middle" fontFamily="Anton" fontSize={42} letterSpacing={3} fill="#021631">MERGER AGREEMENT</text>
      <g data-probe-skip>
        {/* the sub-title (as type) and the rule under the head */}
        <path d={typeLine(130, 370, 104, 3, 5.5)} fill={alpha("#2D5E9A", 0.55)} />
        <rect x={40} y={124} width={PW - 80} height={2.6} fill={alpha("#0B3F82", 0.8)} />
        <rect x={40} y={129} width={PW - 80} height={0.9} fill={alpha("#0B3F82", 0.5)} />
        {/* four numbered clauses: the number, a bold heading, the body in words */}
        {clauses.map((cl, i) => (
          <g key={i}>
            <text data-print data-probe-skip x={40} y={cl.y + 7} fontFamily="Anton" fontSize={13} fill="#0B2F66">{`${i + 1}.`}</text>
            <rect x={60} y={cl.y - 2} width={70 + ((i * 37) % 50)} height={8} rx={2} fill={alpha("#0B2F66", 0.75)} />
            {Array.from({ length: cl.n }, (_, j) => <path key={j} d={typeLine(60, j === cl.n - 1 ? 300 + ((i * 53) % 120) : PW - 40, cl.y + 16 + j * 15, i * 7 + j + 1)} fill={alpha("#2D5E9A", 0.5)} />)}
          </g>
        ))}
        {/* IN WITNESS WHEREOF… over the signature blocks */}
        <path d={typeLine(40, 330, 452, 41)} fill={alpha("#2D5E9A", 0.5)} />
        <path d={typeLine(40, 220, 467, 43)} fill={alpha("#2D5E9A", 0.5)} />
        {/* the two signature blocks: the empty line (a light runs along it on its word), "By", "Name", "Title" */}
        {SIG.map(([x0, x1], i) => {
          const p = i === 0 ? lL : lR, gx = x0 + (x1 - x0 + 80) * p - 40;
          return (
            <g key={i}>
              <rect x={x0} y={SIG_Y} width={x1 - x0} height={2.5} fill="#0B2F66" />
              <rect x={x0} y={SIG_Y - 30} width={14} height={6} rx={1.5} fill={alpha("#2D5E9A", 0.55)} />
              {p > 0.001 && p < 0.999 && <rect x={Math.max(x0, gx - 34)} y={SIG_Y - 2} width={Math.max(0, Math.min(x1, gx + 34) - Math.max(x0, gx - 34))} height={6.5} rx={3} fill="#7FB0EA" opacity={0.85 * Math.sin(Math.PI * p)} />}
              {/* Name / Title: a short label and its rule */}
              {[0, 1].map((j) => (
                <g key={j}>
                  <rect x={x0 + 66} y={SIG_Y + 22 + j * 24} width={j ? 26 : 32} height={6} rx={1.5} fill={alpha("#2D5E9A", 0.55)} />
                  <rect x={x0 + 104} y={SIG_Y + 28 + j * 24} width={x1 - x0 - 104} height={1.2} fill={alpha("#0B2F66", 0.55)} />
                </g>
              ))}
            </g>
          );
        })}
        {/* the initials boxes at the foot — empty */}
        <path d={typeLine(282, 360, 624, 61, 5.5)} fill={alpha("#2D5E9A", 0.5)} />
        {[0, 1].map((i) => <rect key={i} x={372 + i * 34} y={612} width={26} height={22} rx={1.5} fill="none" stroke={alpha("#0B2F66", 0.7)} strokeWidth={1.4} />)}
        <path d={typeLine(40, 120, 624, 67, 5.5)} fill={alpha("#2D5E9A", 0.4)} />
      </g>
      {/* the parties, beside their Name lines: Tesla's T and SpaceX's X (real marks, in the page's ink, no box) */}
      <g data-probe-skip transform={`translate(${SIG[0][0] + 4} ${SIG_Y + 14}) scale(2.1)`}><path d={MARKS.tesla} fill="#021631" /></g>
      <g data-probe-skip transform={`translate(${SIG[1][0] - 2} ${SIG_Y + 6}) scale(2.6)`}>{SPX_D.map((dd, i) => <path key={i} d={dd} fill="#021631" />)}</g>
      {/* the staple through the top-left corner: its crown, a lit edge, and its two legs' dimples at the crown's ends */}
      <g data-probe-skip transform="translate(28 30) rotate(-42)">
        <circle cx={-15} cy={0} r={2.6} fill={alpha("#2D5E9A", 0.35)} />
        <circle cx={15} cy={0} r={2.6} fill={alpha("#2D5E9A", 0.35)} />
        <rect x={-16} y={-2.4} width={32} height={4.8} rx={2.2} fill="#9DB6D3" stroke="#4C6E98" strokeWidth={0.8} />
        <rect x={-15} y={-2.1} width={30} height={1.3} fill={alpha("#FFFFFF", 0.85)} />
      </g>
    </>
  );
};

/** ★ THE FOUNTAIN PEN, uncapped, lying on the blotter along `ang` (degrees in the desk's plane), and its CAP beside it. Built along each part's
 *  own axis (the lathe's y), lit round its body facet by facet. */
const LAC: [string, string] = ["#76A6E0", "#011330"];
const lac = (r: Rig, n: V, g = 1) => mix(LAC[1], LAC[0], Math.min(1, lightOf(r, n) * g));
const penFaces = (r: Rig, k: string, M: Mx): Face[] => {
  const steel = (l: number) => (n: V) => satin(r, n, l);
  // the barrel: its rounded end cap, the barrel, a steel trim ring, the grip section tapering to the feed (y along the pen, + toward the nib)
  const barrel = lathe(r, `${k}br`, M, [
    { y: -150, R: 0 }, { y: -149, R: 4 }, { y: -146, R: 7.6 }, { y: -141, R: 9.6 }, { y: -134, R: 10.2 },
    { y: -132, R: 10.2 }, { y: -132, R: 10.6 }, { y: -128, R: 10.6 }, { y: -128, R: 10.2 },
    { y: 20, R: 10.6 }, { y: 24, R: 10.6 }, { y: 24, R: 10.9 }, { y: 30, R: 10.9 }, { y: 30, R: 9.2 },
    { y: 34, R: 8.6 }, { y: 70, R: 7.4 }, { y: 74, R: 7.8 }, { y: 76, R: 6.2 }, { y: 76, R: 0 },
  ], (n, _a, j) => (j >= 5 && j <= 7 ? satin(r, n, 0.05) : j >= 10 && j <= 12 ? satin(r, n, 0.15) : j >= 14 ? lac(r, n, 0.75) : lac(r, n)), 28);
  // the feed (black) under the nib
  const feed = lathe(r, `${k}fd`, M, [{ y: 76, R: 0 }, { y: 76, R: 5.6 }, { y: 100, R: 4.4 }, { y: 108, R: 2.4 }, { y: 110, R: 0 }], (n) => mix("#010812", "#2A3E5C", lightOf(r, n) * 0.7), 20);
  // the nib: a tapered steel plate lying over the feed (its slit and breather hole printed on it), bowed across: two leaves
  // (rz(−90) in the pen's chain turns local +x UP: the nib, its slit and its breather hole lie on the feed's top, x 6.2 … 7.8)
  const nibM = cat(M, ry(90));
  const nibOl = (s: 1 | -1): [number, number][] => [[0, 74], [s * 7.6, 76], [s * 7.2, 86], [s * 4.6, 102], [s * 0.9, 116], [0, 118]];
  const nib = ([1, -1] as const).flatMap((s) => prism(r, `${k}nb${s}`, nibM, nibOl(s), 5.8, 7.2, steel(0.25)));
  const slit: Face[] = prism(r, `${k}sl`, nibM, [[-0.5, 98], [0.5, 98], [0.4, 117], [-0.4, 117]], 7.2, 7.45, () => "#04101F");
  const hole = lathe(r, `${k}bh`, cat(M, tr(7.35, 96, 0), rz(-90)), [{ y: -0.2, R: 0 }, { y: -0.2, R: 1.7 }, { y: 0.2, R: 1.7 }, { y: 0.2, R: 0 }], () => "#04101F", 12);
  return units(barrel, feed, nib, slit, hole);
};
const capFaces = (r: Rig, k: string, M: Mx): Face[] => {
  const cap = lathe(r, `${k}cp`, M, [
    { y: -62, R: 0 }, { y: -61, R: 5 }, { y: -58, R: 9 }, { y: -53, R: 11 }, { y: -48, R: 11.6 },
    { y: 30, R: 11.8 }, { y: 30, R: 12.2 }, { y: 38, R: 12.2 }, { y: 38, R: 11.8 }, { y: 44, R: 11.8 }, { y: 44, R: 0 },
  ], (n, _a, j) => (j >= 5 && j <= 7 ? satin(r, n, 0.15) : lac(r, n)), 28);
  // the clip: a steel strip along the cap's top from its finial, standing a little proud, ending in a ball
  const clip = prism(r, `${k}cl`, cat(M, ry(90)), [[-2.6, -50], [2.6, -50], [2.4, 18], [-2.4, 18]], 13.2, 15.4, (n) => satin(r, n, 0.2));
  const root = mbox(r, `${k}cr`, M, 11, 14.6, -52, -40, -2.8, 2.8, (n) => satin(r, n, 0.1));
  const ball = lathe(r, `${k}cb`, cat(M, tr(13.4, 18, 0), rz(-90)), [{ y: -3.4, R: 0 }, { y: -2.6, R: 2.4 }, { y: 0, R: 3.4 }, { y: 2.2, R: 2.4 }, { y: 2.8, R: 0 }], (n) => satin(r, n, 0.25), 14);
  return units(cap, root, clip, ball);
};

export const Unsigned: React.FC<C> = (c) => {
  const f = useCurrentFrame();
  const Tm = unsignedTimes(c);
  const bq = rOut(f, ...Tm.base);
  const r = rigOf(swing(f, c.arrive, c.arrive + 110, -5, 4, 0.5));
  const lL = rInOut(f, ...Tm.lineL), lR = rInOut(f, ...Tm.lineR);
  // the white stage's strength (0 navy … 1 white): every ink below blends on it
  const Lw = clamp01(c.light ?? 0);

  const faces: Face[] = [];
  // ── the blotter: dark leather on the desk, its two side rails a step proud, stitched round; its shadow on the desk ──
  faces.push(...shadowW(contactShadow(r, "unbs", BX0, BX1, -BZ, BZ, DESK, 0.8, 30), Lw, 0.5).map((q) => ({ ...q, z: q.z - 4e6 })));
  const blot = fallW(matBox(r, "unb", BX0 + 62, BX1 - 62, DESK - BH, DESK, -BZ, BZ, mixHex("#0C2C58", "#336CAE", Lw), { chrome: 0.25, skip: true }, 0.62), Lw).map((q) => ({ ...q, z: q.z - 3e6 }));
  faces.push(...blot);
  for (const [x0, x1, s] of [[BX0, BX0 + 64, "L"], [BX1 - 64, BX1, "R"]] as const) {
    faces.push(...fallW(matBox(r, `unr${s}`, x0, x1, DESK - BH - 4, DESK, -BZ - 4, BZ + 4, mixHex("#0A2850", "#2D68AE", Lw), { chrome: 0.35, skip: true }, 0.72), Lw).map((q) => ({ ...q, z: q.z - 2.9e6 })));
    const top = faces.find((q) => q.k === `unr${s}t`);
    if (top) top.after = (
      <g data-probe-skip transform={onFace(r, [x0, DESK - BH - 4.2, -BZ - 4], [x1, DESK - BH - 4.2, -BZ - 4], [x0, DESK - BH - 4.2, BZ + 4], x1 - x0, 2 * BZ + 8)}>
        <rect x={9} y={12} width={x1 - x0 - 18} height={2 * BZ - 16} rx={3} fill="none" stroke={mixHex("#8DB6E6", "#DCE8F6", Lw)} strokeOpacity={0.4 + 0.1 * Lw} strokeWidth={1.4} strokeDasharray="6 5" />
        <rect x={1} y={1} width={3} height={2 * BZ + 6} fill={alpha("#FFFFFF", s === "L" ? 0.25 : 0.12)} />
      </g>
    );
  }
  // ── the agreement: its shadow, the sheets under the top one (each FANNED a degree or so about the stack's centre), the top sheet ──
  faces.push(...shadowW(contactShadow(r, "unds", DX - PW / 2, DX + PW / 2, -PH / 2, PH / 2, DESK - BH, 0.95, 24), Lw, 0.25).map((q) => ({ ...q, z: q.z - 2e6 })));
  const paper = (g: number) => (n: V) => shade(r, n, PAPER, g);
  const fan = [[0, 0, 0], [6, -3, 1.4], [-4, 5, -1.1], [8, 2, 0.8], [-6, -4, -1.6], [3, 4, 0.5]];
  const sheets: Face[][] = [];
  for (let i = 0; i < SHEETS - 1; i++) {
    const [dx, dz, a] = fan[i % fan.length], y1 = DESK - BH - i * T;
    sheets.push(mbox(r, `uns${i}`, cat(tr(DX + dx, y1, dz), ry(a)), -PW / 2, PW / 2, -T, 0, -PH / 2, PH / 2, paper(1.02 - i * 0.01)));
  }
  // the top sheet, its lower-right corner cut on the fold (the corner is the curl, below)
  const outline: [number, number][] = [[0, 0], [PW, 0], [PW, PH - CU], [PW - CU, PH], [0, PH]];
  const topM = cat(tr(DX - PW / 2, TOP + T, -PH / 2), rx(90));
  const topSheet = prism(r, "unp", topM, outline, 0, T, paper(0.96), {}, paper(1.1));
  const tf = topSheet.find((q) => q.k === "unpF");
  if (tf) {
    tf.skip = false;
    tf.after = (
      <g transform={onFace(r, pageW(0, 0), pageW(PW, 0), pageW(0, PH), PW, PH)}>
        <defs data-probe-skip><clipPath id="unPageClip"><polygon points={outline.map(([x, y]) => `${x},${y}`).join(" ")} /></clipPath></defs>
        <g clipPath="url(#unPageClip)">
          {/* faint fibre over the sheet */}
          <path data-probe-skip d={FIB} stroke="#5B7FA8" strokeOpacity={0.08} strokeWidth={1} fill="none" />
          <PagePrint lL={lL} lR={lR} />
        </g>
      </g>
    );
  }
  // ── THE CURL: the cut corner lifts off the stack along a bending arc (strips from the fold out to the corner, both sides drawn) ──
  const curl: Face[] = [];
  {
    const A: [number, number] = [PW, PH - CU], B: [number, number] = [PW - CU, PH], Cn: [number, number] = [PW, PH];
    const Mx_ = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], ux = (A[0] - B[0]) / Math.hypot(A[0] - B[0], A[1] - B[1]), uy = (A[1] - B[1]) / Math.hypot(A[0] - B[0], A[1] - B[1]);
    const dmax = Math.hypot(Cn[0] - Mx_[0], Cn[1] - Mx_[1]), nx = (Cn[0] - Mx_[0]) / dmax, ny = (Cn[1] - Mx_[1]) / dmax, half = Math.hypot(A[0] - B[0], A[1] - B[1]) / 2;
    const TH = 1.75, NS = 12;
    // the arc: the sheet bends up more and more toward the corner (its slope φ grows as (s/dmax)^1.3)
    const arc = Array.from({ length: NS + 1 }, (_, i) => i / NS).reduce<{ X: number; Y: number }[]>((acc, t, i) => {
      if (i === 0) return [{ X: 0, Y: 0 }];
      const ds = dmax / NS, ph = TH * Math.pow((t - 0.5 / NS), 1.3), p = acc[acc.length - 1];
      return [...acc, { X: p.X + Math.cos(ph) * ds, Y: p.Y + Math.sin(ph) * ds }];
    }, []);
    const at = (i: number, a: number): V => {
      const px = Mx_[0] + ux * a + nx * arc[i].X, py = Mx_[1] + uy * a + ny * arc[i].X;
      return [DX - PW / 2 + px, TOP - 0.2 - arc[i].Y, -PH / 2 + py];
    };
    for (let i = 0; i < NS; i++) {
      const h0 = half * (1 - i / NS), h1 = half * (1 - (i + 1) / NS);
      const q: V[] = [at(i, -h0), at(i, h0), at(i + 1, h1), at(i + 1, -h1)];
      // both faces of the strip, by winding: whichever turns to the camera is drawn (the sheet's top lit as paper, its back a touch greyer)
      for (const [side, pts] of [["a", q], ["b", q.slice().reverse()]] as const) {
        const fc = pface(r, `uncu${i}${side}`, MI, pts, (n) => (n[1] < 0 ? shade(r, n, PAPER, 1.1) : shade(r, [-n[0], -n[1], -n[2]], "#C2D0E2", 0.85)), { sw: 0.6, z: i });
        if (fc) curl.push({ ...fc, z: i });
      }
    }
    // the curl's shade on the sheet under it (a soft wedge just inside the fold)
    const sh: V[] = [at(0, -half), at(0, half), [DX - PW / 2 + PW - 6, TOP - 0.1, -PH / 2 + PH - 6]];
    curl.unshift({ k: "uncush", p: sh.map((v) => P(r, v)), z: -1, fill: "#0A2A55", op: 0.16, chrome: 0, fall: 0, skip: true, sw: 0 });
  }
  // ── the pen, uncapped, and its cap, lying on the blotter to the right of the agreement ──
  const PEN_ANG = 80, pcx = DX + PW / 2 + 62, pcz = 30, a = (PEN_ANG * Math.PI) / 180;
  const penShadow: Face[] = [];
  for (const [cx0, cz0, len, rr0] of [[pcx + 2, pcz + 10, 158, 13], [pcx + 36, pcz - 160, 64, 14]] as const) {
    for (let i = 0; i < 6; i++) {
      const g = i / 5, w = rr0 * 0.5 + g * 15, L = len + g * 10, ox = 4 + g * 8, oz = -2 - g * 6;
      const q: V[] = [[-L, w], [L, w], [L, -w], [-L, -w]].map(([u, v]) => [cx0 + ox + Math.cos(a) * u - Math.sin(a) * v, DESK - BH - 0.4, cz0 + oz + Math.sin(a) * u + Math.cos(a) * v] as V);
      penShadow.push({ k: `unpsh${cx0}${i}`, p: q.map((v) => P(r, v)), z: -i, fill: mixHex("#000814", "#001C3C", Lw), op: 0.1 * (1 - 0.6 * g) * (1 - 0.2 * Lw), chrome: 0, fall: 0, skip: true, sw: 0 });
    }
  }
  // (the lathe's y runs along the pen: rz(−90) lays it along +x, ry turns it in the desk's plane; the nib points toward the viewer)
  const SC: Mx = { m: [1.2, 0, 0, 0, 1.2, 0, 0, 0, 1.2], t: [0, 0, 0] };
  const penM = cat(tr(pcx, DESK - BH - 10.6 * 1.2, pcz + 30), ry(-PEN_ANG), rz(-90), SC);
  const capM = cat(tr(pcx + 34, DESK - BH - 12.2 * 1.2, pcz - 150), ry(-PEN_ANG - 4), rz(-90), SC);
  const pen = penFaces(r, "unpen", penM), cap = capFaces(r, "uncap", capM);
  const pb = pen.find((q) => q.k.startsWith("unpenbr9_")); if (pb) pb.skip = false;

  const pool = P(r, [CX, DESK, 0]);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: bq < 1 ? bq : undefined }}>
      <Pool3D x={CX} y={pool.y + 40} w={1100} on={0.7 * (1 - Lw)} />
      {/* (on white the floor's light gives way to a soft navy floor tint: no glow on white) */}
      {Lw > 0.001 && <div data-probe-skip style={{ position: "absolute", left: CX - 600, top: pool.y + 40 - 140, width: 1200, height: 280, borderRadius: "50%", opacity: Lw,
        background: `radial-gradient(ellipse, ${alpha("#1F62B3", 0.08)} 0%, ${alpha("#1F62B3", 0.025)} 50%, transparent 72%)` }} />}
      <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Faces list={faces} />
        {sheets.map((s, i) => <Faces key={i} list={units(s)} />)}
        <Faces list={units(topSheet)} />
        <Faces list={curl} />
        <Faces list={penShadow} />
        <Faces list={cap} />
        <Faces list={pen} />
      </svg>
    </div>
  );
};

/** the paper's fibre: short strokes at fixed, seeded places (the grain, never a pattern fill) */
const FIB = (() => {
  let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  return Array.from({ length: 190 }, () => { const x = 8 + rnd() * (PW - 16), y = 8 + rnd() * (PH - 16), a = rnd() * Math.PI, l = 5 + rnd() * 9; return `M${x.toFixed(1)} ${y.toFixed(1)}l${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l).toFixed(1)}`; }).join(" ");
})();
