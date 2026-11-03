
// ══════════════════════════════════════════════════════════════════════════════════════════════
// ★ A SMALL MESH KIT (Builder D, 2026-10-29): real-depth parts under ANY turn — a part is local corners carried through a matrix chain
// (translate · rotate …), each polygon lit by its own normal (p3 `lightOf`), culled exactly (p3 `seen`), outlined in its own colour, with
// NO per-facet sheen (chrome 0, fall 0: the sheen is never a grid). Exported: committee.tsx and unsigned.tsx build with it too.
// Object space as p3's: x right, y DOWN, z toward the viewer.
// ══════════════════════════════════════════════════════════════════════════════════════════════
export type Mx = { m: number[]; t: V };
const I3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
const mm = (A: number[], B: number[]) => [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]));
const mv = (A: number[], [x, y, z]: V): V => [A[0] * x + A[1] * y + A[2] * z, A[3] * x + A[4] * y + A[5] * z, A[6] * x + A[7] * y + A[8] * z];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const nrm = (v: V): V => { const l = Math.hypot(...v); return l > 1e-12 ? [v[0] / l, v[1] / l, v[2] / l] : [0, 0, 0]; };
const rad = (d: number) => (d * Math.PI) / 180;
export const MI: Mx = { m: I3, t: [0, 0, 0] };
export const tr = (x: number, y: number, z: number): Mx => ({ m: I3, t: [x, y, z] });
/** turns (degrees): rx tips +y toward +z, ry turns +z toward +x… (CSS-free, right-handed in p3's y-down space) */
export const rx = (d: number): Mx => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return { m: [1, 0, 0, 0, c, -s, 0, s, c], t: [0, 0, 0] }; };
export const ry = (d: number): Mx => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return { m: [c, 0, s, 0, 1, 0, -s, 0, c], t: [0, 0, 0] }; };
export const rz = (d: number): Mx => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return { m: [c, -s, 0, s, c, 0, 0, 0, 1], t: [0, 0, 0] }; };
/** A ∘ B ∘ … : the last is applied first (a chain reads parent → child) */
export const cat = (...ms: Mx[]): Mx => ms.reduce((A, B) => ({ m: mm(A.m, B.m), t: add(mv(A.m, B.t), A.t) }));
export const xp = (M: Mx, v: V): V => add(mv(M.m, v), M.t);
const newell = (c: V[]): V => {
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < c.length; i++) {
    const a = c[i], b = c[(i + 1) % c.length];
    x += (a[1] - b[1]) * (a[2] + b[2]); y += (a[2] - b[2]) * (a[0] + b[0]); z += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return nrm([x, y, z]);
};
const dedupe = (c: V[]) => c.filter((p, i) => { const q = c[(i + c.length - 1) % c.length]; return Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]) > 1e-6; });
export type Mat = (n: V) => string;
/** ONE polygon of a part: local corners in order; its normal from its winding, or turned outward from `inside` (a local point within) */
export const pface = (r: Rig, k: string, M: Mx, loc: V[], mat: Mat, o: Partial<Face> = {}, inside?: V): Face | null => {
  let w = dedupe(loc.map((p) => xp(M, p)));
  if (w.length < 3) return null;
  let n = newell(w);
  if (n[0] === 0 && n[1] === 0 && n[2] === 0) return null;
  if (inside) {
    const ci = xp(M, inside), fc = w.reduce((a, q) => add(a, [q[0] / w.length, q[1] / w.length, q[2] / w.length]), [0, 0, 0] as V);
    if (dot(n, sub(fc, ci)) < 0) { w = w.slice().reverse(); n = [-n[0], -n[1], -n[2]]; }
  }
  const v = seen(r, w, n);
  if (!v.ok) return null;
  const col = mat(n);
  return { k, p: v.p, z: w.reduce((s, q) => s + depthOf(r, q), 0) / w.length, fill: col, stroke: col, sw: 0.7, chrome: 0, fall: 0, skip: true, ...o };
};
/** an outline (x, y; any winding) extruded from z0 to z1: its front (z1), back and every side, each lit by its own normal */
export const prism = (r: Rig, k: string, M: Mx, ol: [number, number][], z0: number, z1: number, mat: Mat, o: Partial<Face> = {}, front?: Mat): Face[] => {
  const cx = ol.reduce((s, p) => s + p[0], 0) / ol.length, cy = ol.reduce((s, p) => s + p[1], 0) / ol.length, ins: V = [cx, cy, (z0 + z1) / 2];
  const out: (Face | null)[] = [
    pface(r, `${k}F`, M, ol.map(([x, y]) => [x, y, z1] as V), front ?? mat, o, ins),
    pface(r, `${k}B`, M, ol.map(([x, y]) => [x, y, z0] as V), mat, o, ins),
  ];
  for (let i = 0; i < ol.length; i++) {
    const a = ol[i], b = ol[(i + 1) % ol.length];
    out.push(pface(r, `${k}S${i}`, M, [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]], mat, o, ins));
  }
  return out.filter(Boolean) as Face[];
};
/** a box [x0,x1]×[y0,y1]×[z0,z1] in a part's own frame */
export const mbox = (r: Rig, k: string, M: Mx, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, mat: Mat, o: Partial<Face> = {}) =>
  prism(r, k, M, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], z0, z1, mat, o);
/** a SOLID OF REVOLUTION about the part's own y axis: the profile listed top → bottom (y increasing), going round outward, down and back
 *  in (start and end at R 0 to close it). `mat(n, a, j)` may restyle a facet by its angle a (0 = +x, π/2 = +z) and profile step j. */
export type Ring = { y: number; R: number };
export const lathe = (r: Rig, k: string, M: Mx, prof: Ring[], mat: (n: V, a: number, j: number) => string, N = 32, o: Partial<Face> = {}): Face[] => {
  const out: Face[] = [];
  for (let j = 0; j < prof.length - 1; j++) {
    const A = prof[j], B = prof[j + 1];
    if (A.R < 1e-6 && B.R < 1e-6) continue;
    for (let i = 0; i < N; i++) {
      const t0 = (i / N) * Math.PI * 2, t1 = ((i + 1) / N) * Math.PI * 2, tm = (t0 + t1) / 2;
      const at = (S: Ring, t: number): V => [S.R * Math.cos(t), S.y, S.R * Math.sin(t)];
      const q = pface(r, `${k}${j}_${i}`, M, [at(A, t0), at(B, t0), at(B, t1), at(A, t1)], (n) => mat(n, tm, j), o);
      if (q) out.push(q);
    }
  }
  return out;
};
/** ★ THE BANKERS METALLIC (the satin brushed steel of the house solids, REVISION_BRIEF): a pale lit face (#FFFFFF → #B3CEEF → #6FA3DF)
 *  going deep blue (#174C8E → #02234A) as it turns from the key */
const SAT: [number, string][] = [[0, "#02234A"], [0.3, "#174C8E"], [0.56, "#6FA3DF"], [0.8, "#B3CEEF"], [1, "#FFFFFF"]];
export const satin = (r: Rig, n: V, lift = 0) => {
  const L0 = lightOf(r, n), L = Math.max(0, Math.min(1, L0 + lift * (0.4 + 0.6 * L0)));
  for (let i = 1; i < SAT.length; i++) if (L <= SAT[i][0]) return mix(SAT[i - 1][1], SAT[i][1], (L - SAT[i - 1][0]) / (SAT[i][0] - SAT[i - 1][0]));
  return SAT[SAT.length - 1][1];
};
/** a soft contact shadow on a plane (local y) of a part, its footprint [x0,x1]×[z0,z1] in the part's own frame, so it turns with the part */
export const softShadow = (r: Rig, k: string, M: Mx, x0: number, x1: number, z0: number, z1: number, y: number, strength = 1, lean = 18): Face[] => {
  const out: Face[] = [];
  const RINGS = 12, N = 28;
  for (let i = 0; i < RINGS; i++) {
    const g = i / (RINGS - 1), spread = 2 + g * 30, rr0 = 8 + g * 26;
    const ax0 = x0 - spread + lean * g * 0.5, ax1 = x1 + spread + lean * g, az0 = z0 - spread - lean * g, az1 = z1 + spread * 0.5;
    const cx = (ax0 + ax1) / 2, cz = (az0 + az1) / 2, hx = (ax1 - ax0) / 2, hz = (az1 - az0) / 2, rr = Math.min(rr0, hx, hz);
    const ring: V[] = [];
    for (let j = 0; j < N; j++) {
      const a = (j / N) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      ring.push(xp(M, [cx + Math.sign(c) * (hx - rr) + rr * c, y, cz + Math.sign(s) * (hz - rr) + rr * s]));
    }
    out.push({ k: `${k}sh${i}`, p: ring.map((q) => P(r, q)), z: -1e6 + i, fill: "#000814", op: 0.07 * strength * (1 - 0.4 * g), chrome: 0, fall: 0, skip: true, sw: 0 });
  }
  return out.reverse();
};
/** a part's faces in the order they are listed, each list sorted far → near within itself (parts sort as UNITS — p3 lessons) */
export const units = (...lists: (Face | null | undefined)[][]): Face[] => {
  const out: Face[] = [];
  for (const l of lists) out.push(...(l.filter(Boolean) as Face[]).sort((a, b) => a.z - b.z));
  return out.map((f, i) => ({ ...f, z: i }));
};
/** print laid ON a plane of a part: the local square (o, o + ex, o + ey) ↦ the screen, for an SVG group of w × h units */
export const onPart = (r: Rig, M: Mx, o: V, ex: V, ey: V, w: number, h: number) => affine(P(r, xp(M, o)), P(r, xp(M, ex)), P(r, xp(M, ey)), w, h);
/** an "after" slot drawn in a unit's order (print, a light bar, a door cut) */
const slot = (k: string, el: React.ReactNode): Face => ({ k, p: [], z: 0, fill: "none", skip: true, sw: 0, chrome: 0, fall: 0, after: el });

// ── the right half's objects ──
/** ★ A SHOWROOM TURNTABLE set in the floor: the dark recess round it, the drum (its satin side, an LED band near its foot that lights on
 *  "next", a bevelled lip) and its brushed top, whose etched rings and spokes turn with it (`ang`, degrees) */
const turntable = (r: Rig, k: string, cx: number, R: number, rim: number, ang: number, L: number): Face[] => {
  const M = tr(cx, G, 0);
  const ledLit = "#4FA0FF", top = (n: V) => mix("#4D7FBE", "#EDF3FB", lightOf(r, n));
  const recess = lathe(r, `${k}rc`, M, [{ y: 0.3, R: R - 2 }, { y: 0.3, R: R + 11 }], () => mixHex("#011A38", "#7E9FC9", L), 64);
  const drum = lathe(r, `${k}d`, M, [
    { y: -TT_H, R: 0 }, { y: -TT_H, R: R - 6 }, { y: -TT_H + 1.2, R: R - 1.5 }, { y: -TT_H + 3.5, R: R },
    { y: -5, R: R }, { y: -5, R: R + 0.6 }, { y: -2, R: R + 0.6 }, { y: -2, R: R }, { y: 0, R: R }, { y: 0, R: 0 },
  ], (n, _a, j) => (j === 0 ? top(n) : j === 1 ? satin(r, n, 0.25) : j === 5 ? mix(metal(r, n), ledLit, 0.25 + 0.75 * rim) : metal(r, n, 0.15)), 64);
  // the top's print: brushed rings, two etched rings and twelve spokes that turn with it; the LED's glow on the floor round it
  const T = -TT_H - 0.3, print = (
    <g data-probe-skip transform={onPart(r, M, [-R, T, -R], [R, T, -R], [-R, T, R], 2 * R, 2 * R)}>
      <g transform={`translate(${R} ${R}) rotate(${ang.toFixed(3)})`}>
        {Array.from({ length: 9 }, (_, i) => <circle key={i} r={R * (0.14 + i * 0.095)} fill="none" stroke={alpha("#FFFFFF", 0.22)} strokeWidth={R * 0.012} />)}
        <circle r={R * 0.4} fill="none" stroke={alpha("#0B3F82", 0.28)} strokeWidth={R * 0.014} />
        <circle r={R * 0.86} fill="none" stroke={alpha("#0B3F82", 0.3)} strokeWidth={R * 0.016} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} transform={`rotate(${i * 30})`} x1={R * 0.46} x2={R * 0.82} y1={0} y2={0} stroke={alpha("#0B3F82", 0.18)} strokeWidth={R * 0.012} />)}
        <circle r={R * 0.07} fill={alpha("#0B3F82", 0.22)} />
      </g>
    </g>
  );
  const glow = rim > 0.001 ? (
    <g data-probe-skip transform={onPart(r, M, [-R - 30, 0, -R - 30], [R + 30, 0, -R - 30], [-R - 30, 0, R + 30], 2 * R + 60, 2 * R + 60)} opacity={rim}>
      <circle cx={R + 30} cy={R + 30} r={R + 12} fill="none" stroke={alpha(ledLit, 0.28)} strokeWidth={14} />
      <circle cx={R + 30} cy={R + 30} r={R + 6} fill="none" stroke={alpha(ledLit, 0.35)} strokeWidth={5} />
    </g>
  ) : null;
  const drumTop = drum.filter((q) => q.k.startsWith(`${k}d0_`)), drumRest = drum.filter((q) => !q.k.startsWith(`${k}d0_`));
  // (the top is measured by the sweep: the turntable's one probe shape)
  const topOne: Face | null = drumTop.length ? { ...drumTop[0], skip: false } : null;
  return units(recess, [slot(`${k}glow`, glow)], drumRest, drumTop.slice(1), [topOne], [slot(`${k}print`, print)]);
};

/** ★ THE CYBERCAB (Tesla's two-seat robotaxi), a lofted body of flat planes ("more rectangles", Timur 2026-10-29): stations along its length
 *  (nose +x) carry the sill, the shoulder, the belt, the glass and the roof as straight facets; the wrap-round glasshouse, a glass roof, the
 *  windscreen and rear glass; two butterfly doors' cut lines; full-width light bars at both ends; a camera pod; aero covers on real tyres.
 *  Local frame: x along (−200 tail … +200 nose), y DOWN (its tyres stand on y 0), z across (+z its left side). */
type St = { u: number; ys: number; yb: number; yr: number; wB: number; wR: number };
const CAB_L = 400, CAB_WR = 35, CAB_WX = [-130, 132] as const;
const CAB_ST: St[] = [
  { u: 0.0, ys: 40, yb: 66, yr: 72, wB: 70, wR: 60 }, { u: 0.02, ys: 30, yb: 74, yr: 82, wB: 82, wR: 66 }, { u: 0.06, ys: 25, yb: 78, yr: 94, wB: 86, wR: 66 },
  { u: 0.14, ys: 23, yb: 80, yr: 110, wB: 88, wR: 62 }, { u: 0.27, ys: 23, yb: 80, yr: 124, wB: 88, wR: 58 }, { u: 0.4, ys: 23, yb: 79, yr: 130, wB: 88, wR: 56 },
  { u: 0.53, ys: 23, yb: 77, yr: 126, wB: 88, wR: 56 }, { u: 0.64, ys: 23, yb: 75, yr: 112, wB: 88, wR: 58 }, { u: 0.75, ys: 23, yb: 71, yr: 86, wB: 87, wR: 64 },
  { u: 0.85, ys: 23, yb: 65, yr: 70, wB: 85, wR: 70 }, { u: 0.93, ys: 25, yb: 57, yr: 61, wB: 80, wR: 66 }, { u: 0.98, ys: 30, yb: 47, yr: 51, wB: 68, wR: 56 },
  { u: 1.0, ys: 36, yb: 41, yr: 43, wB: 56, wR: 46 },
];
/** one station's ring: 14 points from the +z sill, up over the roof, down the −z side (y, z) */
const cabRing = (s: St): [number, number][] => {
  const p4 = -Math.max(s.yb + 2, s.yb + (s.yr - s.yb) * 0.08), p5 = -Math.max(s.yb + 3, s.yr - 7);
  const h: [number, number][] = [[-s.ys, s.wB * 0.86], [-(s.ys + 12), s.wB], [-(s.yb - 10), s.wB], [-s.yb, s.wB - 3], [p4, s.wB - 9], [p5, s.wR], [-s.yr, s.wR * 0.5]];
  return [...h, ...h.slice().reverse().map(([y, z]) => [y, -z] as [number, number])];
};
const cabX = (u: number) => -CAB_L / 2 + u * CAB_L;
/** a facet of the loft is GLASS (side glass, glass roof, windscreen, rear glass) by its ring index and its station */
const cabGlass = (i: number, u: number) => {
  const top = i >= 4 && i <= 8, side = i === 4 || i === 8;
  if (u > 0.035 && u < 0.79 && top && !side) return u < 0.68 && u > 0.13 ? true : true;
  if (side) return u > 0.1 && u < 0.74;
  return false;
};
const cybercab = (r: Rig, k: string, M: Mx, spin: number, blur: number, dive: number): Face[] => {
  const Mb = cat(M, tr(0, -45, 0), rz(-dive), tr(0, 45, 0));
  const glass = (n: V) => mix("#020D1C", "#2F5F9C", Math.pow(lightOf(r, n), 1.4) * 0.85);
  const paint = (n: V) => metal(r, n, 0.16);
  // ── the body loft ──
  const rings = CAB_ST.map((s) => ({ x: cabX(s.u), u: s.u, p: cabRing(s) }));
  const body: Face[] = [];
  for (let j = 0; j < rings.length - 1; j++) {
    const A = rings[j], B = rings[j + 1], um = (A.u + B.u) / 2;
    for (let i = 0; i < 14; i++) {
      const i2 = (i + 1) % 14;
      const c: V[] = [[A.x, A.p[i][0], A.p[i][1]], [A.x, A.p[i2][0], A.p[i2][1]], [B.x, B.p[i2][0], B.p[i2][1]], [B.x, B.p[i][0], B.p[i][1]]];
      const ins: V = [(A.x + B.x) / 2, -55, 0];
      const q = pface(r, `${k}b${j}_${i}`, Mb, c, cabGlass(i, um) ? glass : paint, {}, ins);
      if (q) body.push(q);
    }
  }
  // the tail and the nose: closed with their own facets (a lit flat plane each)
  const endCap = (R: (typeof rings)[number], kk: string) => pface(r, kk, Mb, R.p.map(([y, z]) => [R.x, y, z] as V), paint, {}, [0, -55, 0]);
  body.push(...([endCap(rings[0], `${k}tail`), endCap(rings[rings.length - 1], `${k}nose`)].filter(Boolean) as Face[]));
  // (the body's broad side panel is the sweep's measured shape)
  const side = body.find((q) => q.k === `${k}b5_1`) ?? body.find((q) => q.k === `${k}b5_12`);
  if (side) side.skip = false;
  // which side faces the camera
  const near = depthOf(r, xp(M, [0, -50, 100])) > depthOf(r, xp(M, [0, -50, -100])) ? 1 : -1;
  // ── the wheels: a tyre (tread, shoulders, sidewall) and an aero cover with five slots and a hub, turning about its axle ──
  const wheel = (wx: number, s: 1 | -1, kk: string): Face[] => {
    const Mw = cat(M, tr(wx, -CAB_WR, s * 73), rx(90 * s), ry((spin * 180) / Math.PI * s));
    const rub = (n: V) => mix("#030A15", "#2E4A6E", lightOf(r, n) * 0.75), wall = (n: V) => mix("#06101F", "#3A5A84", lightOf(r, n) * 0.7);
    const fs = lathe(r, kk, Mw, [
      { y: -13, R: 28 }, { y: -13, R: 33 }, { y: -10.5, R: CAB_WR }, { y: 10.5, R: CAB_WR }, { y: 13, R: 33 }, { y: 13.4, R: 27 },
      { y: 13.4, R: 25 }, { y: 14.6, R: 23.5 }, { y: 14.6, R: 6 }, { y: 15.6, R: 5 }, { y: 15.6, R: 0 },
    ], (n, _a, j) => (j <= 3 ? rub(n) : j <= 5 ? wall(n) : j === 6 ? satin(r, n, -0.1) : j === 7 ? satin(r, n, 0.2) : satin(r, n, 0.35)), 30);
    // the cover's five aero slots (they turn; above ~0.4 rad a frame they melt into a motion-blurred band and never strobe)
    const slots: Face[] = [];
    if (blur < 0.999) for (let i = 0; i < 5; i++) {
      const t0 = (i / 5) * Math.PI * 2, t1 = t0 + 0.42, Y = 14.8;
      const q = pface(r, `${kk}sl${i}`, Mw, [[9 * Math.cos(t0), Y, 9 * Math.sin(t0)], [21 * Math.cos(t0 + 0.12), Y, 21 * Math.sin(t0 + 0.12)], [21 * Math.cos(t1 + 0.12), Y, 21 * Math.sin(t1 + 0.12)], [9 * Math.cos(t1), Y, 9 * Math.sin(t1)]],
        () => "#0A2346", { op: 1 - blur }, [0, 0, 0]);
      if (q) slots.push(q);
    }
    const band = blur > 0.001 ? lathe(r, `${kk}bl`, Mw, [{ y: 14.85, R: 8.5 }, { y: 14.85, R: 21.5 }], () => "#3D6699", 30, { op: 0.75 * blur }) : [];
    return units(fs, slots, band);
  };
  // ── the near side's arch liners (dark, the tyre stands in them), door cuts, camera pod, the light bars ──
  const zs = near * 88.6;
  const arch = (wx: number, kk: string) => {
    const pts: V[] = [];
    for (let i = 0; i <= 20; i++) { const a = Math.PI + (i / 20) * Math.PI, y = -CAB_WR + 41 * Math.sin(a); pts.push([wx + 41 * Math.cos(a), Math.min(y, -23), zs]); }
    return pface(r, kk, Mb, pts, () => "#020B18", {}, [wx, -40, 0]);
  };
  const cut = (pts: V[]) => {
    const p = pts.map((q) => P(r, xp(Mb, q)));
    return p.map((q, i) => `${i ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" ");
  };
  const s5 = CAB_ST[5], s7 = CAB_ST[7], z1 = near * 88.8;
  const details = (
    <g data-probe-skip>
      {/* the butterfly door: its rear cut, its front cut behind the front arch, and its foot along the sill */}
      <path d={cut([[cabX(0.31), -(s5.yb + 3), z1], [cabX(0.32), -36, z1], [cabX(0.69), -36, z1], [cabX(0.705), -(s7.yb + 2), z1]])} fill="none" stroke={alpha("#011226", 0.85)} strokeWidth={1.8} strokeLinejoin="round" />
      <path d={cut([[cabX(0.315), -(s5.yb + 2), z1], [cabX(0.325), -37.5, z1]])} fill="none" stroke={alpha("#B3CEEF", 0.45)} strokeWidth={1} />
      {/* the shoulder's catchlight: one line along the whole flank (never per facet) */}
      <path d={cut(CAB_ST.slice(1, -1).map((s) => [cabX(s.u), -(s.yb - 1), near * (s.wB - 1.2)] as V))} fill="none" stroke={alpha("#E6F0FB", 0.75)} strokeWidth={1.6} strokeLinecap="round" />
      <path d={cut(CAB_ST.slice(1, -1).map((s) => [cabX(s.u), -(s.ys + 12.5), near * (s.wB + 0.2)] as V))} fill="none" stroke={alpha("#011226", 0.5)} strokeWidth={1.4} strokeLinecap="round" />
      {/* the camera pod on the front fender */}
      <path d={cut([[cabX(0.79), -59, z1 + 1], [cabX(0.83), -58, z1 + 1], [cabX(0.83), -53, z1 + 1], [cabX(0.79), -54, z1 + 1]])} fill="#06152B" stroke={alpha("#9DC0EA", 0.5)} strokeWidth={0.8} />
      {/* the full-width light bars: the front one round the nose, the tail one round the tail (the near halves) */}
      <path d={cut([[cabX(0.9), -(CAB_ST[10].yb - 3), near * (CAB_ST[10].wB - 1)], [cabX(0.98), -(CAB_ST[11].yb - 3), near * (CAB_ST[11].wB - 2)], [cabX(1) + 0.5, -(CAB_ST[12].yb - 3), near * 40], [cabX(1) + 0.5, -(CAB_ST[12].yb - 3), 0]])} fill="none" stroke="#F5FAFF" strokeWidth={3.2} strokeLinecap="round" />
      <path d={cut([[cabX(0.08), -(CAB_ST[2].yb - 5), near * (CAB_ST[2].wB - 0.5)], [cabX(0.02), -(CAB_ST[1].yb - 5), near * (CAB_ST[1].wB - 1)], [cabX(0) - 0.5, -(CAB_ST[0].yb - 5), near * 50], [cabX(0) - 0.5, -(CAB_ST[0].yb - 5), 0]])} fill="none" stroke="#7FB0EA" strokeWidth={3.4} strokeLinecap="round" />
    </g>
  );
  // the glasshouse's ONE reflection: a soft band laid across the whole side glass (a panel-wide sheen, never per facet)
  const gl = CAB_ST.filter((s) => s.u > 0.12 && s.u < 0.72);
  const zg = (s: St) => near * ((s.wB - 9) * 0.55 + s.wR * 0.45 + 0.6);
  const refl = (
    <g data-probe-skip>
      <path d={cut([...gl.map((s) => [cabX(s.u), -(s.yb + (s.yr - s.yb) * 0.42), zg(s)] as V), ...gl.slice().reverse().map((s) => [cabX(s.u) - 14, -(s.yb + (s.yr - s.yb) * 0.6), zg(s)] as V)])} fill={alpha("#B3CEEF", 0.26)} />
    </g>
  );
  const nearW = CAB_WX.map((wx, i) => wheel(wx, near as 1 | -1, `${k}wn${i}`)), farW = CAB_WX.map((wx, i) => wheel(wx, -near as 1 | -1, `${k}wf${i}`));
  return units(...farW, body, [arch(CAB_WX[0], `${k}a0`), arch(CAB_WX[1], `${k}a1`)], [slot(`${k}refl`, refl), slot(`${k}det`, details)], ...nearW);
};

/** ★ THE ROBOT HAND on its display post: a round foot, a polished post, a ribbed wrist actuator, the wrist's axle, a palm with real thickness
 *  and a pressed pad, four fingers of three phalanges each on axle knuckles, curling a little toward the palm, and a two-joint thumb.
 *  Local origin: the foot's centre on the turntable's top; y up is negative; the palm faces +z. */
const FINGERS: { x: number; w: number; segs: number[]; sp: number }[] = [
  { x: -44, w: 22, segs: [50, 36, 28], sp: -7 }, { x: -15, w: 24, segs: [58, 42, 32], sp: -2 },
  { x: 15, w: 23, segs: [55, 40, 30], sp: 3 }, { x: 43, w: 20, segs: [43, 32, 25], sp: 9 },
];
const robotHand = (r: Rig, k: string, M: Mx): Face[] => {
  const steel = (l: number) => (n: V) => metal(r, n, l), sat = (l: number) => (n: V) => satin(r, n, l);
  const foot = lathe(r, `${k}ft`, M, [{ y: -12, R: 0 }, { y: -12, R: 41 }, { y: -10, R: 45.5 }, { y: -4, R: 48 }, { y: 0, R: 48 }, { y: 0, R: 0 }], (n, _a, j) => (j === 0 ? metal(r, n, 0.2) : metal(r, n, 0.05)), 40);
  const post = lathe(r, `${k}po`, M, [{ y: -150, R: 0 }, { y: -150, R: 11 }, { y: -12, R: 11 }, { y: -12, R: 0 }], (n) => satin(r, n, -0.05), 24);
  const collar = lathe(r, `${k}co`, M, [{ y: -162, R: 0 }, { y: -162, R: 19 }, { y: -148, R: 19 }, { y: -146, R: 15 }, { y: -146, R: 0 }], (n) => metal(r, n, 0.1), 28);
  const act = prism(r, `${k}ac`, M, rrect(-36, -248, 36, -160, 12), -26, 26, steel(0.1));
  const ribs = [-226, -208, -190].flatMap((y, i) => prism(r, `${k}rb${i}`, M, rrect(-37.6, y, 37.6, y + 5, 2.2), -27.6, 27.6, steel(-0.25)));
  const bolts = [[-24, -236], [24, -236], [-24, -172], [24, -172]].flatMap(([x, y], i) => lathe(r, `${k}bt${i}`, cat(M, tr(x, y, 26), rx(-90)), [{ y: -3, R: 0 }, { y: -3, R: 3.6 }, { y: 0, R: 4.2 }, { y: 0, R: 0 }], (n) => satin(r, n, 0.2), 12));
  const wrist = lathe(r, `${k}wr`, cat(M, tr(0, -258, 0), rz(90)), [{ y: -34, R: 0 }, { y: -34, R: 15 }, { y: -31, R: 17 }, { y: 31, R: 17 }, { y: 34, R: 15 }, { y: 34, R: 0 }], (n) => satin(r, n, 0.05), 28);
  const palm = prism(r, `${k}pm`, M, rrect(-60, -390, 60, -266, 20), -17, 17, steel(0.12));
  const pad = prism(r, `${k}pd`, M, rrect(-45, -362, 45, -286, 15), 16, 19.5, steel(-0.2));
  const heel = prism(r, `${k}hl`, M, rrect(-30, -282, 30, -270, 5), 16, 18.5, steel(-0.1));
  // (the palm's front face is the hand's measured shape)
  const pf = palm.find((q) => q.k === `${k}pmF`); if (pf) pf.skip = false;
  const fingers: Face[][] = [];
  FINGERS.forEach((fg, i) => {
    let Mf = cat(M, tr(fg.x, -392, 0), rz(fg.sp), rx(-6));
    const curl = [-6, -12, -13];
    const parts: Face[] = [];
    parts.push(...lathe(r, `${k}k${i}`, cat(Mf, rz(90)), [{ y: -fg.w / 2 - 2.5, R: 0 }, { y: -fg.w / 2 - 2.5, R: fg.w * 0.4 }, { y: fg.w / 2 + 2.5, R: fg.w * 0.4 }, { y: fg.w / 2 + 2.5, R: 0 }], (n) => satin(r, n, 0.1), 18));
    fg.segs.forEach((len, j) => {
      const w = fg.w - j * 2, th = w * 0.44;
      parts.push(...prism(r, `${k}f${i}${j}`, Mf, rrect(-w / 2, -len, w / 2, -3, j === 2 ? w / 2 - 1 : w * 0.3), -th, th, steel(j === 2 ? 0.15 : 0.08)));
      // a joint axle at the next knuckle
      Mf = cat(Mf, tr(0, -len, 0), rx(curl[j]));
      if (j < 2) parts.push(...lathe(r, `${k}j${i}${j}`, cat(Mf, rz(90)), [{ y: -w / 2 - 2, R: 0 }, { y: -w / 2 - 2, R: w * 0.36 }, { y: w / 2 + 2, R: w * 0.36 }, { y: w / 2 + 2, R: 0 }], (n) => satin(r, n, 0.1), 16));
    });
    fingers.push(parts);
  });
  // the thumb: from the palm's lower left, out and forward, two phalanges on their joints
  let Mt = cat(M, tr(-58, -300, 6), rz(-52), rx(-22));
  const thumb: Face[] = [];
  thumb.push(...lathe(r, `${k}tk`, cat(Mt, rz(90)), [{ y: -15, R: 0 }, { y: -15, R: 11 }, { y: 15, R: 11 }, { y: 15, R: 0 }], (n) => satin(r, n, 0.1), 16));
  [46, 34].forEach((len, j) => {
    const w = 25 - j * 3, th = w * 0.45;
    thumb.push(...prism(r, `${k}t${j}`, Mt, rrect(-w / 2, -len, w / 2, -3, j === 1 ? w / 2 - 1 : w * 0.3), -th, th, steel(0.1)));
    Mt = cat(Mt, tr(0, -len, 0), rx(-14), rz(10));
    if (j === 0) thumb.push(...lathe(r, `${k}tj`, cat(Mt, rz(90)), [{ y: -14, R: 0 }, { y: -14, R: 9 }, { y: 14, R: 9 }, { y: 14, R: 0 }], (n) => satin(r, n, 0.1), 16));
  });
  return units(foot, post, collar, act, ribs, bolts, wrist, palm, pad, heel, ...fingers, thumb);
};

/** ★ THE STARSHIP MODEL on its stand: a stainless cylinder lit round its curve (36 facets, one smooth gradient), raised WELD RINGS every
 *  ~34 px, the black HEAT TILES over its shaded (+x) side with a stepped edge, the aft and forward FLAPS standing out in depth, the ogive
 *  nose, the aft skirt, SpaceX's wordmark down its side. Local origin: the stand's foot on the turntable's top; y up is negative. */
const SR = 46, SB = -52, ST = -452, SN = 124;
const starship = (r: Rig, k: string, M: Mx): Face[] => {
  const stand = lathe(r, `${k}sf`, M, [{ y: -10, R: 0 }, { y: -10, R: 56 }, { y: -8, R: 60 }, { y: -3, R: 62 }, { y: 0, R: 62 }, { y: 0, R: 0 }], (n, _a, j) => metal(r, n, j === 0 ? 0.2 : 0.05), 40);
  const post = lathe(r, `${k}sp`, M, [{ y: -46, R: 0 }, { y: -46, R: 16 }, { y: -10, R: 16 }, { y: -10, R: 0 }], (n) => satin(r, n, -0.05), 24);
  const cradle = lathe(r, `${k}sc`, M, [{ y: SB + 2, R: 0 }, { y: SB + 2, R: 38 }, { y: -46, R: 40 }, { y: -45, R: 38 }, { y: -45, R: 0 }], (n) => metal(r, n, 0.12), 32);
  // the body's profile, top → bottom: the nose (an ogive), the barrel with its weld rings, the aft skirt
  const prof: Ring[] = [{ y: ST - SN, R: 0 }];
  for (let i = 1; i <= 12; i++) { const t = 1 - i / 12; prof.push({ y: ST - SN * t, R: SR * Math.pow(1 - Math.pow(t, 1.8), 0.62) }); }
  const welds: number[] = [];
  for (let y = ST + 30; y < SB - 24; y += 34) welds.push(y);
  for (const y of welds) prof.push({ y: y - 1.8, R: SR }, { y: y - 1.8, R: SR + 0.9 }, { y: y + 1.2, R: SR + 0.9 }, { y: y + 1.2, R: SR });
  prof.push({ y: SB - 14, R: SR }, { y: SB - 8, R: SR - 2 }, { y: SB, R: SR - 6 }, { y: SB, R: 0 });
  const tiled = (a: number, j: number) => { const e = 1.22 + (j % 2 ? 0.07 : -0.05); const d = Math.atan2(Math.sin(a), Math.cos(a)); return Math.abs(d) < e; };
  const body = lathe(r, `${k}b`, M, prof, (n, a, j) => {
    const L = lightOf(r, n);
    if (tiled(a, j) && j > 6) return mix("#040B16", "#2A3E5C", L * 0.75 + ((Math.round(a * 7.6) + j) % 2 ? 0.05 : 0));
    // a weld ring's own lip: a little darker band
    return satin(r, n, -0.04);
  }, 40);
  const bf = body.find((q) => q.k.startsWith(`${k}b${prof.length - 6}_9`)); if (bf) bf.skip = false;
  // the four flaps, as plates standing out at the limbs (their windward faces tiled black, their edges steel)
  const flapM = (n: V) => mix("#071223", "#3A5378", lightOf(r, n) * 0.8);
  const flaps = [1, -1].flatMap((s) => [
    prism(r, `${k}fa${s}`, M, ([[SR - 2, SB - 18], [SR + 52, SB - 40], [SR + 52, SB - 140], [SR - 2, SB - 172]] as [number, number][]).map(([x, y]) => [x * s, y] as [number, number]), -4, 4, flapM),
    prism(r, `${k}ff${s}`, M, ([[SR - 3, ST + 14], [SR + 30, ST + 2], [SR + 26, ST - 48], [SR - 10, ST - 66]] as [number, number][]).map(([x, y]) => [x * s, y] as [number, number]), -3.5, 3.5, flapM),
  ]);
  // SpaceX's wordmark down the side, reading upward, on the steel just in front of the barrel's face
  const h = 300 * (SPXW_VIEW.h / SPXW_VIEW.w), z = SR - 1.2;
  const mark = (
    <g data-probe-skip transform={onPart(r, M, [-h / 2 - 6, SB - 46, z], [-h / 2 - 6, SB - 346, z], [h / 2 - 6, SB - 46, z], SPXW_VIEW.w, SPXW_VIEW.h)}>
      {SPXW_D.map((d, i) => <path key={i} d={d} fill="#0A2A55" opacity={0.88} />)}
    </g>
  );
  const flapBack = flaps.filter((q) => q.k.includes("fa") || q.k.includes("ff"));
  return units(stand, post, cradle, flapBack.filter((q) => q.z < depthOf(r, xp(M, [0, -250, 0]))), body, [slot(`${k}mk`, mark)], flapBack.filter((q) => q.z >= depthOf(r, xp(M, [0, -250, 0]))));
};

/** a turntable's turn, degrees: still until `t0`, easing up to `rate` °/f over `ramp` frames, then steady */
const turnAfter = (f: number, t0: number, rate: number, ramp = 30) => (f < t0 ? 0 : f < t0 + ramp ? (rate * (f - t0) ** 2) / (2 * ramp) : rate * (f - t0 - ramp / 2));

export const Future: React.FC<C> = (c) => {
  const f = useCurrentFrame();
  const T = futureTimes(c);
  // the white stage's strength: the lead's, or a fallback that floods through the travel and drains with the next place's slide
  const L = clamp01(c.light ?? rInOut(f, D2 + 4, D2 + 34) * (1 - rInOut(f, NEXT_PLACE, NEXT_PLACE + 30)));
  const lamp = rInOut(f, ...T.lamps) * (1 - 0.6 * rInOut(f, ...T.dim));
  const dim = rInOut(f, ...T.dim);
  const rims = T.rims.map((w) => rInOut(f, ...w));
  const shadowA = 1 - 0.45 * L;
  const defs = (
    <defs data-probe-skip>
      <linearGradient id="fuBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9DC0EA" /><stop offset="0.16" stopColor="#4D8ED9" /><stop offset="0.38" stopColor="#1F5596" />
        <stop offset="0.47" stopColor="#3C7CC6" /><stop offset="0.56" stopColor="#174C8E" /><stop offset="0.84" stopColor="#0B3466" /><stop offset="1" stopColor="#021A3A" />
      </linearGradient>
      <linearGradient id="fuSheen" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="0.3" stopColor="#FFFFFF" stopOpacity="0.12" /><stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="0.75" stopColor="#000814" stopOpacity="0.1" /><stop offset="1" stopColor="#000814" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="fuGlass" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#0B2F5E" /><stop offset="1" stopColor="#020E1E" /></linearGradient>
      <linearGradient id="fuGlassSheen" x1="0" y1="0" x2="1" y2="0.6">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="0.42" stopColor="#B3CEEF" stopOpacity="0.3" />
        <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="fuRim" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#E3EDF9" /><stop offset="0.45" stopColor="#6FA3DF" /><stop offset="1" stopColor="#0B3F82" /></radialGradient>
      <radialGradient id="fuShadow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#001C3C" stopOpacity="0.6" /><stop offset="0.6" stopColor="#001C3C" stopOpacity="0.2" /><stop offset="1" stopColor="#001C3C" stopOpacity="0" /></radialGradient>
      <radialGradient id="fuFloor" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#4D8ED9" stopOpacity="0.16" /><stop offset="1" stopColor="#4D8ED9" stopOpacity="0" /></radialGradient>
      <radialGradient id="fuFloorW" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#1F62B3" stopOpacity="0.08" /><stop offset="1" stopColor="#1F62B3" stopOpacity="0" /></radialGradient>
    </defs>
  );

  // ═══ the right half, in real depth: one rig (a slow turn of its own, looking a little down onto the floor) ═══
  const r: Rig = { cx: 540, cy: G, persp: 2600, yaw: swing(f, c.arrive, c.end, 3, -2, 0.4), pitch: -11 };
  const top = G - TT_H;
  // the Cybercab: a drive whose speed falls smoothly to rest (v ∝ 1 − smoothstep): it enters at speed from beyond the frame's left edge,
  // brakes (the body dives a little under the braking, and comes back level as it stops), and stands centred on its turntable
  const cabT = (g: number) => { const t = clamp01((g - T.cab[0]) / (T.cab[1] - T.cab[0])); return 2 * (t - t ** 3 + t ** 4 / 2); };
  const dist = (g: number) => CAB_RUN * cabT(g);
  const tc = clamp01((f - T.cab[0]) / (T.cab[1] - T.cab[0]));
  const cabOn = f >= T.cab[0] - 1;
  const cabOp = clamp01((f - T.cab[0] + 1) / 6);
  const cabTurn = turnAfter(f, T.cab[1] + 4, 0.26);
  const omega = Math.abs(dist(f) - dist(f - 1)) / CAB_WR;
  const blur = clamp01((omega - 0.28) / 0.3);
  const dive = 1.7 * (6 * tc - 6 * tc * tc) / 1.5;
  const Mcab = cat(tr(TT_X[0] - CAB_RUN + dist(f), top, 0), ry(-cabTurn));
  // the hand and the ship: LOWERED onto the centre of their turntables, on the axis the whole way (fading in over their first 10 frames)
  const he = rInOut(f, ...T.hand), hOp = clamp01((f - T.hand[0]) / 10), handTurn = turnAfter(f, T.hand[1] + 2, 0.22);
  const se = rInOut(f, ...T.ship), sOp = clamp01((f - T.ship[0]) / 10);
  const Mhand = cat(tr(TT_X[1], top - 150 * (1 - he), 0), ry(10 - handTurn));
  const Mship = cat(tr(TT_X[2], top - 170 * (1 - se), 0), ry(-6));
  const tables = TT_X.map((x, i) => turntable(r, `tt${i}`, x, TT_R[i], rims[i], i === 0 ? cabTurn : i === 1 ? handTurn : 0, L));
  // each object's contact shadow on its turntable's top, deepening as it lands
  const shCab = softShadow(r, "cabsh", cat(tr(TT_X[0] - CAB_RUN + dist(f), top, 0), ry(-cabTurn)), -196, 196, -84, 84, -0.4, 1.4 * shadowA);
  const shHand = softShadow(r, "hdsh", cat(tr(TT_X[1], top, 0), ry(10 - handTurn)), -44, 44, -44, 44, -0.4, 1.2 * shadowA * he * he);
  const shShip = softShadow(r, "spsh", cat(tr(TT_X[2], top, 0)), -58, 58, -58, 58, -0.4, 1.2 * shadowA * se * se);
  const objs: { d: number; el: React.ReactNode }[] = [];
  if (cabOn) objs.push({ d: depthOf(r, xp(Mcab, [0, -50, 0])), el: <g key="cab" opacity={cabOp < 1 ? cabOp : undefined}><Faces list={shCab} /><Faces list={cybercab(r, "cab", Mcab, dist(f) / CAB_WR, blur, dive)} /></g> });
  if (hOp > 0.001) objs.push({ d: depthOf(r, xp(Mhand, [0, -200, 0])), el: <g key="hand" opacity={hOp < 1 ? hOp : undefined}><Faces list={shHand} /><Faces list={robotHand(r, "hd", Mhand)} /></g> });
  if (sOp > 0.001) objs.push({ d: depthOf(r, xp(Mship, [0, -250, 0])), el: <g key="ship" opacity={sOp < 1 ? sOp : undefined}><Faces list={shShip} /><Faces list={starship(r, "sp", Mship)} /></g> });
  objs.sort((a, b) => a.d - b.d);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* ═══ LEFT: the cars Tesla sells today ═══ */}
      <Turn at={c.arrive} end={c.end} from={-4} to={3} amp={0.6}>
        <Pool3D x={540} y={G} w={1080} on={(0.6 - 0.42 * dim) * (1 - L)} />
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <FlatDefs id="fuH" />
          {defs}
          {/* the showroom floor's sheen under the light (it never shows an edge: a soft ellipse fading into the ground) */}
          <ellipse data-probe-skip cx={540} cy={G + 8} rx={620} ry={90} fill="url(#fuFloor)" opacity={(1 - 0.6 * dim) * (1 - L)} />
          <ellipse data-probe-skip cx={540} cy={G + 8} rx={620} ry={90} fill="url(#fuFloorW)" opacity={L} />
          {/* the Model Y a row back, then the Model 3 in front; ★ as the light over them dims, each car's own silhouette is veiled (no box
              round it), right after the car, so the front car's veil never darkens the one behind twice */}
          {([[MY, P_MY, 0.3], [M3, P_M3, 1.1]] as [CarSpec, Profile, number][]).map(([s, pr, sp], i) => (
            <g key={i}>
              <Shadow x0={s.x0} x1={s.x0 + s.L} a={shadowA} g={s.g} />
              <Car s={s} pr={pr} lamp={lamp} spin={sp} />
              {dim > 0.001 && (
                <g data-probe-skip opacity={0.55 * dim}>
                  <path d={bodyPath(s, pr)} fill="#001C3C" />
                  <circle cx={s.x0 + s.uf * s.L} cy={s.g - s.wr} r={s.wr} fill="#001C3C" />
                  <circle cx={s.x0 + s.ur * s.L} cy={s.g - s.wr} r={s.wr} fill="#001C3C" />
                </g>
              )}
            </g>
          ))}
        </svg>
      </Turn>

      {/* ═══ RIGHT: what comes next (the white stage), in real depth ═══ */}
      <div style={{ position: "absolute", left: TRAVEL, top: 0, width: 1080, height: 1920 }}>
        <Pool3D x={540} y={G} w={1080} on={0.5 * (1 - L)} />
        <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <ellipse data-probe-skip cx={540} cy={G + 8} rx={640} ry={110} fill="url(#fuFloor)" opacity={1 - L} />
          <ellipse data-probe-skip cx={540} cy={G + 8} rx={640} ry={110} fill="url(#fuFloorW)" opacity={L} />
          {tables.map((t, i) => <Faces key={i} list={t} />)}
          {objs.map((o) => o.el)}
        </svg>
      </div>
    </div>
  );
};
