// @ts-nocheck
// ★ V36 "Bre-X Gold" — bx_core.tsx: THE DRILL CORE (the film's hero object) and its CORE TRAY. Owned by builder H; every place that
//   shows the core imports it. Drawn on Video 35's 3-D rig (tk_rig: worldScr / XPlane / xf*), lit by the house's one key light
//   (solid_engine lightOf: upper left), standing on V35's floor (tk_floor TkFloor, floor y = BX_FLOOR_Y = TK_FLOOR_Y).
//
// ── WORLD UNITS ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//   ≈ px at the rig's pivot depth. y is DOWN (the floor is y = BX_FLOOR_Y), z is TOWARD the lens. HQ core: 63.5 mm across,
//   1.5 m runs → CORE_R 32, CORE_LEN 1500 (the real 23.6 : 1). A rig: bxRig({ cx, cy, yaw, pitch, lens }) — pitch < 0 looks DOWN
//   onto the tray (−30 … −35 shows the channels); yaw < 0 turns the tray's right end toward the lens.
//
// ── THE CORE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//   <BxCore id rig xf len r seed glitter dust salted split sparkle lit pieces cull probe />   (an SVG <g>: put it inside an <svg>)
//     xf       its pose (tk_rig xf*). LOCAL frame: the core's axis is local Y (its ends at y = ±len/2), local X / Z its section.
//              Lying in a tray: coreXf(x, y, z) = xfMul(xfTrans([x, y, z]), xfRotZ(−90)) (axis → world x, local X → up).
//     glitter  0…1  the gold-dust skin: flecks on the upper half twinkle in (each fleck has its own threshold), a faint gold bloom
//     dust     [a, b] (fractions of the length, 0 = the −y end) where the dust has landed (default [0, 1]); glitter fades in past b
//     sparkle  any number (pass the frame): drives the flecks' twinkle, deterministic
//     salted   0…1  rounded placer-gold grains sitting ONLY on the outer skin (the truth place); never inside a split face
//     split    0…1  the core sawn lengthwise: the two halves part and roll until both sawn faces lie face-up (grey through and
//              through — no gold inside, whatever `glitter`/`salted` show on the skin)
//     pieces   [[a, b, endA, endB], …]  fractions of the length the run is broken into (ends "saw" | "break" | "block" — a
//              block end is sawn, and in a tray a wooden run block stands after it); default one unbroken piece
//     lit      0…1  a cool rim light along the top (a reveal). There is no stage prop: on the white stage the core keeps its stone
//     cull     optional [x0, y0, x1, y1] screen rect: skin detail outside it is skipped (a close-up of a long run)
//     probe    the data-probe-object description (pass null when an outer wrapper carries it: print and shapes of one object
//              must share ONE data-probe-object ancestor for the probe to treat them as one object)
//   coreTop(xf, len, u) → world point on the core's top line at fraction u (for a stream to land on, a loupe to aim at)
//   coreCorners(xf, len, r) → 8 world points (TkFloor casters)
//
// ── THE TRAY ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//   <BxTray id rig xf rows len cores hero heroEl cull probe />   (an SVG <g>) a galvanised-steel core tray: base plate, slotted rows (channels with
//     dividers), thick end blocks with hand slots and their screws, depth graduations stamped along the front rim, run blocks between
//     broken pieces. It draws its own cores (painter-ordered with the walls) from `cores` (one entry per row: { seed, pieces,
//     glitter, dust, sparkle, lift }: lift softens that row's contact shadow as its core rises); row `hero` is drawn by the caller instead: pass `heroEl(map)` → element to draw it IN ORDER (so the
//     walls in front still cover it), or null when the caller draws it after the tray (once it has risen clear of the walls).
//     LOCAL frame: x along the rows (−len/2 … len/2 inner), z across (row 0 at the back), y = 0 the tray's FOOT (floor).
//   TRAY = { rows, pitch, wall, base, end }, trayRowZ(i, rows) → the row's centre z, trayCoreY = the core axis height (local y),
//   trayCorners(xf, rows, len) → 8 world points.
//
// ── THE LOFT ENGINE (also drives bx_bar's gold bar and the hype coin) ────────────────────────────────────────────────────────────
//   profBar({ qb, qf, qh, c, n })  a rounded trapezoid section = trapezoid (back half-width qb, front qf, half-thickness qh) ⊕ disc c.
//                                  qb = qf = qh = 0 gives a CIRCLE of radius c — so a core morphs into a bar by lerping the four.
//   profHalf(r, side)              a half disc (side +1 the front half), its sawn face the flat closing edge
//   loftGeo({ prof, len, taper, bev, jag }) → rings;  loftPaint(id, rig, map, geo, mat) → { strips, caps } in screen space: every
//   strip carries its own gradient from the vertex normals (a turned body is smooth, a flat face takes a gradient along its run from
//   the studio reflection); draw with <StripDefs strips/> + <StripPaths strips/>, caps ({ d, n, l, which }) yourself.
//   mat = { light(nv, vp) → l (any value), ramp(l, part "side"|"bev") → colour }. ROCK_MAT(tone) is the stone's.
//   <RockSkin …/> the stone's grains, veins, mottling, glitter flecks and salted nuggets on a round skin; <GrainDefs/> + <GrainTex/>
//   the fine granular grain (one SVG turbulence mapped onto a run's own surface by an affine from its projected axis — it rides with
//   the core under any rig or pose and never swims).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { seeded } from "./common";
import { rampAt } from "./solid_engine";
import { TK_FLOOR_Y } from "./tk_slab";
import { normalM, unit3, worldScr, worldView, xfApply, xfMul, xfRotZ, xfTrans, wound } from "./tk_rig";
import { box3 } from "./solid_engine";
import { paintXf } from "./tk_rig";
import { BX_FLECK, BX_GRAIN, BX_ROCK, BX_ROCK_MIN, BX_ROCK_VEIN, BX_STEEL, BX_STEEL_IN, rockLight } from "./bx_gold";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
export const BX_FLOOR_Y = TK_FLOOR_Y;
export const CORE_R = 32;
export const CORE_LEN = 1500;
export const bxRig = (o = {}) => ({ cx: o.cx ?? 540, cy: o.cy ?? BX_FLOOR_Y - 700, persp: o.lens ?? 3200, yaw: o.yaw ?? -16, pitch: o.pitch ?? -30 });
export const coreXf = (x, y, z) => xfMul(xfTrans([x, y, z]), xfRotZ(-90));

// ── profiles ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const ARC_N = [16, 16, 16, 16];
export const profBar = ({ qb = 0, qf = 0, qh = 0, c, n = 64, aR }) => {
  // the slant of the sides: from the TARGET shape (aR, radians), so a morph from a circle keeps one sampling
  const a = aR ?? (qh > 1e-6 ? Math.atan2(qb - qf, 2 * qh) : 0);
  const V = [[qf, qh], [-qf, qh], [-qb, -qh], [qb, -qh]];
  const spans = [[a, Math.PI / 2], [Math.PI / 2, Math.PI - a], [Math.PI - a, 1.5 * Math.PI], [1.5 * Math.PI, 2 * Math.PI + a]];
  const k = n / 64;
  const pts = [], nrm = [];
  spans.forEach(([s0, s1], i) => {
    const K = Math.max(2, Math.round(ARC_N[i] * k));
    for (let j = 0; j < K; j++) {
      const t = s0 + (s1 - s0) * j / (K - 1);
      pts.push([V[i][0] + c * Math.cos(t), V[i][1] + c * Math.sin(t)]);
      nrm.push([Math.cos(t), Math.sin(t)]);
    }
  });
  return { pts, nrm };
};
export const profHalf = (r, side = 1, n = 40) => {
  const pts = [], nrm = [];
  for (let j = 0; j <= n; j++) {
    const t = Math.PI * j / n;
    pts.push([r * Math.cos(t), side * r * Math.sin(t)]);
    nrm.push([Math.cos(t), side * Math.sin(t)]);
  }
  // the sawn face: duplicated end points carry the flat face's own normal
  pts.push([...pts[n]]);
  nrm.push([0, -side]);
  pts.push([...pts[0]]);
  nrm.push([0, -side]);
  return { pts, nrm, half: true };
};
// ── geometry: rings along the axis (local y), per-vertex ends (a tapered ingot end), optional end bevel ──────────────────────────────
export const loftGeo = ({ prof, len, taper = 0, bev = 0, jag }) => {
  const { pts, nrm } = prof, M = pts.length;
  let z0 = Infinity, z1 = -Infinity;
  for (const p of pts) {
    z0 = Math.min(z0, p[1]);
    z1 = Math.max(z1, p[1]);
  }
  const dz = Math.max(1e-6, z1 - z0);
  const tOf = (p) => (p[1] - z0) / dz;
  const yTop = pts.map((p, j) => -len / 2 + taper * tOf(p) + (jag ? jag(0, j) : 0));
  const yBot = pts.map((p, j) => len / 2 - taper * tOf(p) + (jag ? jag(1, j) : 0));
  const ins = (p, nn, b) => [p[0] - nn[0] * b, p[1] - nn[1] * b];
  const ring = (ys, inset) => pts.map((p, j) => {
    const q = inset ? ins(p, nrm[j], inset) : p;
    return [q[0], ys[j], q[1]];
  });
  const sideN = nrm.map((nn) => [nn[0], 0, nn[1]]);
  const rings = [];
  if (bev > 0) {
    rings.push({ p: ring(yTop, bev), n: nrm.map((nn) => unit3([nn[0], -1.1, nn[1]])), cap: true });
    rings.push({ p: ring(yTop.map((y) => y + bev), 0), n: sideN });
    rings.push({ p: ring(yBot.map((y) => y - bev), 0), n: sideN });
    rings.push({ p: ring(yBot, bev), n: nrm.map((nn) => unit3([nn[0], 1.1, nn[1]])), cap: true });
  } else {
    rings.push({ p: ring(yTop, 0), n: sideN, cap: true });
    rings.push({ p: ring(yBot, 0), n: sideN, cap: true });
  }
  return { rings, M, len, z0, z1 };
};
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const newellV = (p) => {
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i], b = p[(i + 1) % p.length];
    x += (a[1] - b[1]) * (a[2] + b[2]);
    y += (a[2] - b[2]) * (a[0] + b[0]);
    z += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return unit3([x, y, z]);
};
const viewScr = (rig, v) => {
  const k = rig.persp / Math.max(1, rig.persp - v[2]);
  return [rig.cx + v[0] * k, rig.cy + v[1] * k];
};
// ── the painter ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// returns { strips: [{ d, grad|fill }], caps: [{ d, fill|grad, n, which }], outline } in screen space; the caller draws them
export const loftPaint = (id, rig, map, geo, mat) => {
  const { rings, M } = geo;
  const W = rings.map((r) => r.p.map((q) => worldView(rig, map(q))));
  const S = W.map((r) => r.map((v) => viewScr(rig, v)));
  const eyeOK = (vp, n) => dot3(n, [-vp[0], -vp[1], rig.persp - vp[2]]) > 1e-6;
  const strips = [], caps = [];
  // world-space vertex normals → view
  const nv = rings.map((r, ri) => r.n.map((nn, j) => normalM(map, rig, nn, r.p[j])));
  for (let ri = 0; ri + 1 < rings.length; ri++) {
    for (let j = 0; j < M; j++) {
      const j2 = (j + 1) % M;
      const A = rings[ri].p[j], B = rings[ri].p[j2];
      if (Math.hypot(A[0] - B[0], A[2] - B[2]) < 1e-4 && Math.hypot(rings[ri + 1].p[j][0] - rings[ri + 1].p[j2][0], rings[ri + 1].p[j][2] - rings[ri + 1].p[j2][2]) < 1e-4) continue;
      const vq = [W[ri][j], W[ri][j2], W[ri + 1][j2], W[ri + 1][j]];
      const nA = nv[ri][j], nB = nv[ri][j2], nC = nv[ri + 1][j2], nD = nv[ri + 1][j];
      const avg = unit3([nA[0] + nB[0] + nC[0] + nD[0], nA[1] + nB[1] + nC[1] + nD[1], nA[2] + nB[2] + nC[2] + nD[2]]);
      const fn = newellV(vq);
      const n = dot3(fn, avg) < 0 ? [-fn[0], -fn[1], -fn[2]] : fn;
      const c = vq.reduce((a, v) => [a[0] + v[0] / 4, a[1] + v[1] / 4, a[2] + v[2] / 4], [0, 0, 0]);
      if (!eyeOK(c, n)) continue;
      const sq = [S[ri][j], S[ri][j2], S[ri + 1][j2], S[ri + 1][j]];
      const d = `M${sq.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`;
      const part = rings[ri].cap || rings[ri + 1].cap ? "bev" : "side";
      const flat = dot3(nA, nB) > 0.9995;
      const gid = `${id}s${ri}_${j}`;
      if (!flat) {
        // across the strip: from edge j to edge j+1 (perpendicular to the strip's run on screen)
        const m0 = [(sq[0][0] + sq[3][0]) / 2, (sq[0][1] + sq[3][1]) / 2], m1 = [(sq[1][0] + sq[2][0]) / 2, (sq[1][1] + sq[2][1]) / 2];
        const run = [sq[3][0] - sq[0][0] + sq[2][0] - sq[1][0], sq[3][1] - sq[0][1] + sq[2][1] - sq[1][1]];
        const rl = Math.hypot(run[0], run[1]) || 1, ru = [run[0] / rl, run[1] / rl];
        const v = [m1[0] - m0[0], m1[1] - m0[1]], along = v[0] * ru[0] + v[1] * ru[1];
        const vp = [v[0] - along * ru[0], v[1] - along * ru[1]];
        const mid = (k) => [(vq[0][k] + vq[3][k]) / 2, (vq[1][k] + vq[2][k]) / 2];
        const vpA = [(W[ri][j][0] + W[ri + 1][j][0]) / 2, (W[ri][j][1] + W[ri + 1][j][1]) / 2, (W[ri][j][2] + W[ri + 1][j][2]) / 2];
        const vpB = [(W[ri][j2][0] + W[ri + 1][j2][0]) / 2, (W[ri][j2][1] + W[ri + 1][j2][1]) / 2, (W[ri][j2][2] + W[ri + 1][j2][2]) / 2];
        const lA = mat.light(unit3([nA[0] + nD[0], nA[1] + nD[1], nA[2] + nD[2]]), vpA), lB = mat.light(unit3([nB[0] + nC[0], nB[1] + nC[1], nB[2] + nC[2]]), vpB);
        strips.push({ d, gid, part, j, ri, g: { x1: m0[0], y1: m0[1], x2: m0[0] + vp[0], y2: m0[1] + vp[1], stops: [{ t: 0, c: mat.ramp(lA, part) }, { t: 1, c: mat.ramp(lB, part) }] } });
      } else {
        // a flat face: the studio's reflection changes along its run
        const K = 6, stops = [];
        for (let k = 0; k < K; k++) {
          const t = k / (K - 1);
          const q = [0, 1, 2].map((i) => (vq[0][i] + vq[1][i]) / 2 * (1 - t) + (vq[3][i] + vq[2][i]) / 2 * t);
          stops.push({ t, c: mat.ramp(mat.light(n, q), part) });
        }
        const a = [(sq[0][0] + sq[1][0]) / 2, (sq[0][1] + sq[1][1]) / 2], b = [(sq[3][0] + sq[2][0]) / 2, (sq[3][1] + sq[2][1]) / 2];
        strips.push({ d, gid, part, j, ri, flat: true, g: { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stops } });
      }
    }
  }
  for (const ri of [0, rings.length - 1]) {
    const r = W[ri];
    const out = ri === 0 ? -1 : 1;
    // outward: the axis direction at that end
    const a0 = worldView(rig, map([0, 0, 0])), a1 = worldView(rig, map([0, out, 0]));
    const ax = unit3(sub(a1, a0));
    const fn = newellV(r);
    const n = dot3(fn, ax) < 0 ? [-fn[0], -fn[1], -fn[2]] : fn;
    const c = r.reduce((a, v) => [a[0] + v[0] / r.length, a[1] + v[1] / r.length, a[2] + v[2] / r.length], [0, 0, 0]);
    if (!eyeOK(c, n)) continue;
    const sp = S[ri];
    caps.push({ d: `M${sp.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`, n, which: ri === 0 ? "top" : "bot", l: mat.light(n, c), c, sp });
  }
  return { strips, caps };
};
export const StripDefs = ({ strips }) => jsx("defs", { children: strips.map((s) => jsx("linearGradient", { id: s.gid, gradientUnits: "userSpaceOnUse", x1: f2(s.g.x1), y1: f2(s.g.y1), x2: f2(s.g.x2), y2: f2(s.g.y2), children: s.g.stops.map((q, k) => jsx("stop", { offset: q.t.toFixed(3), stopColor: q.c }, k)) }, s.gid)) });
export const StripPaths = ({ strips, op }) => jsx(jsx_runtime.Fragment, { children: strips.map((s) => jsx("path", { d: s.d, fill: `url(#${s.gid})`, stroke: `url(#${s.gid})`, strokeWidth: 0.7, strokeLinejoin: "round", opacity: op }, s.gid)) });

// ── the stone ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const ROCK_MAT = (tone = 0) => ({
  light: (nv) => rockLight(nv),
  ramp: (l, part) => {
    const c = rampAt(BX_ROCK, Math.max(0, Math.min(0.8, -0.12 + 1.06 * l + 0.05 * tone)));
    return tone > 0.35 ? mixHex(c, "#5A5244", 0.1 * tone) : tone < -0.35 ? mixHex(c, "#3E4A52", -0.12 * tone) : c;
  }
});
const toneOf = (seed) => {
  const r = seeded(97 * seed + 1);
  r();
  return r() * 2 - 1;
};
// ── the fine granular grain: one SVG turbulence, mapped onto each run's OWN surface by an affine from its projected axis (so it
//    rides with the core under any rig or pose, never swims), clipped to the run's silhouette ──────────────────────────────────────
export const GrainDefs = ({ id = "bxGrain" }) => jsx("defs", { "data-probe-skip": true, children: jsxs("filter", { id, x: "0", y: "0", width: "1", height: "1", filterUnits: "objectBoundingBox", colorInterpolationFilters: "sRGB", children: [
  jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.42 0.36", numOctaves: 2, seed: 11, result: "n" }),
  jsx("feColorMatrix", { in: "n", type: "matrix", values: "2.3 0.4 0 0 -0.85  2.3 0.4 0 0 -0.85  2.3 0.4 0 0 -0.85  0 0 0 0 1" }),
  jsxs("feComponentTransfer", { children: [
    jsx("feFuncR", { type: "discrete", tableValues: "0.08 0.32 0.5 0.5 0.5 0.5 0.5 0.66 0.9" }),
    jsx("feFuncG", { type: "discrete", tableValues: "0.08 0.32 0.5 0.5 0.5 0.5 0.5 0.66 0.9" }),
    jsx("feFuncB", { type: "discrete", tableValues: "0.08 0.32 0.5 0.5 0.5 0.5 0.5 0.66 0.9" })
  ] })
] }) });
export const GrainTex = ({ clipId, strips, rig, map, len, r, op = 0.5, fid = "bxGrain" }) => {
  if (op <= 0.01 || !strips.length) return null;
  const A0 = worldScr(rig, map([0, -len / 2, 0])), A1 = worldScr(rig, map([0, len / 2, 0])), C = worldView(rig, map([0, 0, 0]));
  const k = rig.persp / Math.max(1, rig.persp - C[2]);
  const ax = [A1[0] - A0[0], A1[1] - A0[1]], al = Math.hypot(ax[0], ax[1]) || 1;
  const np = [-ax[1] / al, ax[0] / al];
  const m = [ax[0] / len, ax[1] / len, np[0] * k, np[1] * k, A0[0], A0[1]].map((v) => v.toFixed(4)).join(" ");
  return jsxs("g", { "data-probe-skip": true, children: [
    jsx("defs", { children: jsx("clipPath", { id: clipId, clipPathUnits: "userSpaceOnUse", children: strips.map((q) => jsx("path", { d: q.d }, q.gid)) }) }),
    jsx("g", { clipPath: `url(#${clipId})`, children: jsx("g", { transform: `matrix(${m})`, children: jsx("rect", { x: 0, y: -r * 1.15, width: len, height: r * 2.3, filter: `url(#${fid})`, opacity: op, style: { mixBlendMode: "overlay" } }) }) })
  ] });
};
// seeded grain fields on a round core's skin: (θ, u) with u ∈ [0, 1] along the length
const grainMemo = new Map();
const grainsOf = (seed, len, r) => {
  const key = `${seed}|${len}|${r}`;
  const hit = grainMemo.get(key);
  if (hit) return hit;
  const rnd = seeded(9157 * seed + 31);
  const area = 2 * Math.PI * r * len;
  const N = Math.round(area / 85);
  const g = [];
  for (let i = 0; i < N; i++) {
    const x = rnd();
    const tone = x < 0.42 ? 0 : x < 0.7 ? 1 : x < 0.95 ? 2 : 3;
    g.push({ th: rnd() * 2 * Math.PI, u: rnd(), s: (tone === 0 ? 1.1 + 1.9 * rnd() : 0.8 + 1.6 * rnd()) * (rnd() < 0.07 ? 2.1 : 1), rot: rnd() * Math.PI, el: 0.55 + 0.5 * rnd(), tone, j: [rnd(), rnd(), rnd(), rnd(), rnd()] });
  }
  // mottling: big soft patches
  const mot = Array.from({ length: Math.round(len / 90) }, () => ({ th: rnd() * 2 * Math.PI, u: rnd(), s: 18 + 30 * rnd(), dark: rnd() < 0.55 }));
  // quartz veinlets: planes through the axis tilted by a (helix-free ellipses on the skin)
  const veins = Array.from({ length: Math.max(1, Math.round(len / 520)) }, () => ({ u: 0.08 + 0.84 * rnd(), tilt: (rnd() - 0.5) * 2.2, th0: rnd() * 2 * Math.PI, w: 1.2 + 2.2 * rnd() }));
  // the dust flecks (glitter): on the upper half (θ near 0 = local +X = up when lying in a tray)
  const fl = Array.from({ length: Math.round(len * 1.6) }, () => ({ th: (rnd() - 0.5) * 2.3 * Math.pow(rnd(), 0.7), u: rnd(), s: 1.1 + 1.9 * rnd(), thr: rnd(), ph: rnd() * 6.283, w: 0.05 + 0.11 * rnd(), rot: rnd() * Math.PI, big: rnd() < 0.04 }));
  // salted grains: rounded placer nuggets on the skin
  const sa = Array.from({ length: Math.round(len / 34) }, () => ({ th: rnd() * 2 * Math.PI, u: 0.02 + 0.96 * rnd(), s: 2.6 + 4.2 * rnd(), thr: rnd(), el: 0.7 + 0.3 * rnd(), rot: rnd() * Math.PI }));
  const out = { g, mot, veins, fl, sa };
  if (grainMemo.size > 64) grainMemo.clear();
  grainMemo.set(key, out);
  return out;
};
const MIN_INK = BX_ROCK_MIN;
// a point and its frame on a round skin (local: axis y, section x/z), θ from +X toward +Z
const skin = (r, th, y) => [r * Math.cos(th), y, r * Math.sin(th)];
const skinN = (th) => [Math.cos(th), 0, Math.sin(th)];
export const RockSkin = ({ rig, map, len, r, seed, u0 = 0, u1 = 1, glitter = 0, dust = [0, 1], sparkle = 0, salted = 0, op = 1, half = 0, cull }) => {
  const G = grainsOf(seed, len, r);
  const eye = (q, n) => {
    const v = worldView(rig, map(q)), vn = normalM(map, rig, n, q);
    return { f: dot3(vn, unit3([-v[0], -v[1], rig.persp - v[2]])), v, vn };
  };
  // half: +1 / −1 keeps only the z ≥ 0 / ≤ 0 half of the skin (a split core); 0 the whole
  const keep = (th) => half === 0 || half * Math.sin(th) >= 0.02;
  const yOf = (u) => -len / 2 + u * len;
  const inU = (u) => u >= u0 && u <= u1;
  const P = (q) => {
    const s = worldScr(rig, map(q));
    return `${f2(s[0])},${f2(s[1])}`;
  };
  const inCull = (q) => {
    if (!cull) return true;
    const s = worldScr(rig, map(q));
    return s[0] > cull[0] && s[0] < cull[2] && s[1] > cull[1] && s[1] < cull[3];
  };
  const buckets = [[], [], [], []];
  for (const g of G.g) {
    if (!inU(g.u) || !keep(g.th)) continue;
    const c = skin(r, g.th, yOf(g.u));
    const e = eye(c, skinN(g.th));
    if (e.f < 0.12 || !inCull(c)) continue;
    const pts = [];
    for (let k = 0; k < 5; k++) {
      const a = g.rot + k / 5 * 2 * Math.PI, rr = g.s * (0.65 + 0.5 * g.j[k]);
      const du = rr * Math.cos(a), dt = rr * g.el * Math.sin(a) / r;
      pts.push(P(skin(r + 0.2, g.th + dt, yOf(g.u) + du)));
    }
    buckets[g.tone].push(`M${pts.join("L")}Z`);
  }
  const mot = [[], []];
  for (const m of G.mot) {
    if (!inU(m.u) || !keep(m.th)) continue;
    const c = skin(r, m.th, yOf(m.u));
    if (eye(c, skinN(m.th)).f < 0.1) continue;
    const pts = [];
    for (let k = 0; k < 9; k++) {
      const a = k / 9 * 2 * Math.PI;
      pts.push(P(skin(r + 0.1, m.th + m.s * 0.55 * Math.sin(a) / r, yOf(m.u) + m.s * Math.cos(a))));
    }
    mot[m.dark ? 0 : 1].push(`M${pts.join("L")}Z`);
  }
  const veins = [];
  for (const v of G.veins) {
    let run = [];
    const flush = () => {
      if (run.length > 1) veins.push({ d: `M${run.join("L")}`, w: v.w });
      run = [];
    };
    for (let k = 0; k <= 72; k++) {
      const th = k / 72 * 2 * Math.PI;
      const u = v.u + v.tilt * r * Math.cos(th - v.th0) / len;
      const q = skin(r + 0.25, th, yOf(u));
      if (!inU(u) || !keep(th) || eye(q, skinN(th)).f < 0.04) {
        flush();
        continue;
      }
      run.push(P(q));
    }
    flush();
  }
  // glitter: flecks on the dusted upper skin, each with its own threshold and twinkle
  const fl = [], glow = [], stars = [];
  if (glitter > 1e-3) {
    for (const g of G.fl) {
      if (!inU(g.u) || !keep(g.th)) continue;
      const dk = clamp01((dust[1] - g.u) / 0.06 + 1) * clamp01((g.u - dust[0]) / 0.04 + 1);
      const a = clamp01((glitter * dk - g.thr * 0.85) / 0.15);
      if (a <= 0.02) continue;
      const c = skin(r + 0.35, g.th, yOf(g.u));
      const e = eye(c, skinN(g.th));
      if (e.f < 0.15 || !inCull(c)) continue;
      const tw = Math.pow(0.5 + 0.5 * Math.sin(g.ph + sparkle * (0.16 + g.w)), 6);
      const s = g.s * (0.8 + 0.5 * tw);
      const pts = [0, 1, 2, 3].map((k) => {
        const an = g.rot + k * Math.PI / 2, rr = k % 2 ? s * 0.5 : s;
        return P(skin(r + 0.35, g.th + rr * Math.sin(an) / r, yOf(g.u) + rr * Math.cos(an)));
      });
      fl.push({ d: `M${pts.join("L")}Z`, a, tw });
      if (g.big || tw > 0.82) {
        const sc = worldScr(rig, map(c));
        glow.push({ x: sc[0], y: sc[1], a: a * (0.35 + 0.65 * tw), big: g.big });
        if (g.big && tw > 0.8) stars.push({ x: sc[0], y: sc[1], a: a * (tw - 0.8) / 0.2, s: 4.5 * (0.6 + tw) });
      }
    }
  }
  // salted: rounded grains on the outer skin only
  const nug = [];
  if (salted > 1e-3) {
    for (const g of G.sa) {
      if (!inU(g.u) || !keep(g.th)) continue;
      const a = clamp01((salted - g.thr * 0.8) / 0.2);
      if (a <= 0.02) continue;
      const c = skin(r + g.s * 0.35, g.th, yOf(g.u));
      const e = eye(c, skinN(g.th));
      if (e.f < 0.2) continue;
      const pts = [];
      for (let k = 0; k < 12; k++) {
        const an = g.rot + k / 12 * 2 * Math.PI;
        pts.push(skin(r + g.s * 0.35, g.th + g.s * g.el * Math.sin(an) / r, yOf(g.u) + g.s * Math.cos(an)));
      }
      const sp = pts.map((q) => worldScr(rig, map(q)));
      const sc = worldScr(rig, map(c));
      nug.push({ d: `M${sp.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`, a, x: sc[0], y: sc[1], rr: Math.max(...sp.map((p) => Math.hypot(p[0] - sc[0], p[1] - sc[1]))), l: e.vn });
    }
  }
  return jsxs("g", { opacity: op, "data-probe-skip": true, children: [
    mot[0].length > 0 && jsx("path", { d: mot[0].join(""), fill: "#000000", opacity: 0.1 }),
    mot[1].length > 0 && jsx("path", { d: mot[1].join(""), fill: "#ffffff", opacity: 0.05 }),
    buckets[0].length > 0 && jsx("path", { d: buckets[0].join(""), fill: MIN_INK[0], opacity: 0.62 }),
    buckets[1].length > 0 && jsx("path", { d: buckets[1].join(""), fill: MIN_INK[1], opacity: 0.45 }),
    buckets[2].length > 0 && jsx("path", { d: buckets[2].join(""), fill: MIN_INK[2], opacity: 0.4 }),
    buckets[3].length > 0 && jsx("path", { d: buckets[3].join(""), fill: MIN_INK[3], opacity: 0.5 }),
    veins.map((v, k) => jsx("path", { d: v.d, fill: "none", stroke: BX_ROCK_VEIN, strokeWidth: v.w, opacity: 0.42, strokeLinecap: "round", strokeLinejoin: "round" }, `v${k}`)),
    fl.length > 0 && jsx("path", { d: fl.filter((q) => q.tw < 0.5).map((q) => q.d).join(""), fill: BX_FLECK.base, opacity: 0.9 * Math.min(1, glitter * 1.4) }),
    fl.length > 0 && jsx("path", { d: fl.filter((q) => q.tw >= 0.5).map((q) => q.d).join(""), fill: BX_FLECK.lit, opacity: Math.min(1, glitter * 1.4) }),
    stars.map((q, k) => jsx("path", { d: `M${f2(q.x - q.s)},${f2(q.y)}L${f2(q.x + q.s)},${f2(q.y)}M${f2(q.x)},${f2(q.y - q.s)}L${f2(q.x)},${f2(q.y + q.s)}`, stroke: BX_FLECK.glint, strokeWidth: 1.1, opacity: 0.85 * q.a, strokeLinecap: "round" }, `st${k}`)),
    nug.map((q, k) => jsxs("g", { opacity: q.a, children: [
      jsx("path", { d: q.d, fill: "#000000", opacity: 0.35, transform: "translate(1.4 1.8)" }),
      jsx("path", { d: q.d, fill: rampAt(BX_GRAIN, 0.55) }),
      jsx("circle", { cx: f2(q.x - q.rr * 0.28), cy: f2(q.y - q.rr * 0.3), r: f2(q.rr * 0.42), fill: rampAt(BX_GRAIN, 0.85), opacity: 0.8 }),
      jsx("circle", { cx: f2(q.x - q.rr * 0.36), cy: f2(q.y - q.rr * 0.38), r: f2(Math.max(0.8, q.rr * 0.16)), fill: "#FFF6DA", opacity: 0.9 })
    ] }, `n${k}`))
  ] });
};
// a sawn or broken end face: texture on the disc
const capMemo = new Map();
const capGrains = (seed, r) => {
  const key = `${seed}|${r}`;
  if (capMemo.has(key)) return capMemo.get(key);
  const rnd = seeded(733 * seed + 5);
  const g = Array.from({ length: Math.round(r * r * 0.11) }, () => {
    const rr = r * Math.sqrt(rnd()) * 0.94, a = rnd() * 2 * Math.PI, x = rnd();
    return { x: rr * Math.cos(a), z: rr * Math.sin(a), s: 1 + 2.2 * rnd(), tone: x < 0.45 ? 0 : x < 0.75 ? 1 : 2, rot: rnd() * 3 };
  });
  capMemo.set(key, g);
  return g;
};
const CoreCap = ({ rig, map, cap, y, r, seed, kind, sideOf }) => {
  const g = capGrains(seed + (y > 0 ? 17 : 0), r);
  const P = (q) => {
    const s = worldScr(rig, map(q));
    return `${f2(s[0])},${f2(s[1])}`;
  };
  const b = [[], [], []];
  for (const q of g) {
    if (sideOf && sideOf(q.z) === false) continue;
    const pts = [0, 1, 2, 3].map((k) => {
      const a = q.rot + k * Math.PI / 2;
      return P([q.x + q.s * Math.cos(a), y, q.z + q.s * 0.7 * Math.sin(a)]);
    });
    b[q.tone].push(`M${pts.join("L")}Z`);
  }
  const saw = kind === "saw" ? Array.from({ length: 9 }, (_, i) => {
    const R = r * (1.6 + 0.22 * i), cx = -r * 2.2;
    const pts = [];
    for (let k = 0; k <= 24; k++) {
      const a = -0.9 + 1.8 * k / 24, x = cx + R * Math.cos(a), z = R * Math.sin(a);
      if (Math.hypot(x, z) < r * 0.96 && (!sideOf || sideOf(z) !== false)) pts.push(P([x, y, z]));
    }
    return pts.length > 1 ? `M${pts.join("L")}` : "";
  }).join("") : "";
  return jsxs("g", { "data-probe-skip": true, children: [
    jsx("path", { d: cap.d, fill: rampAt(BX_ROCK, (kind === "saw" ? 0.18 : 0.06) + 0.86 * cap.l), stroke: rampAt(BX_ROCK, 0.9 * cap.l), strokeWidth: 0.6 }),
    jsx("path", { d: b[0].join(""), fill: MIN_INK[0], opacity: 0.5 }),
    jsx("path", { d: b[1].join(""), fill: MIN_INK[1], opacity: 0.45 }),
    jsx("path", { d: b[2].join(""), fill: MIN_INK[2], opacity: 0.3 }),
    saw && jsx("path", { d: saw, fill: "none", stroke: "#ffffff", strokeWidth: 0.7, opacity: 0.12 }),
    jsx("path", { d: cap.d, fill: "none", stroke: kind === "saw" ? "#ffffff" : "#000000", strokeWidth: 1, opacity: kind === "saw" ? 0.18 : 0.3 })
  ] });
};
// jagged break: a per-vertex end offset along the axis
const jagOf = (seed, M, ends) => {
  const rnd = seeded(4271 * seed + 9);
  const a = Array.from({ length: M }, () => rnd()), b = Array.from({ length: M }, () => rnd());
  const sm = (arr, j) => (arr[(j - 1 + M) % M] + 2 * arr[j] + arr[(j + 1) % M]) / 4 - 0.5;
  return (end, j) => ends[end] === "break" ? (end === 0 ? 1 : -1) * 0 + 9 * sm(end ? b : a, j) + (end ? -1 : 1) * 3 : 0;
};
// the sawn face of a split half (the flat strip): stone through and through
const SawnFace = ({ rig, map, len, r, seed, side }) => {
  const rnd = seeded(661 * seed + 3);
  const P = (q) => {
    const s = worldScr(rig, map(q));
    return `${f2(s[0])},${f2(s[1])}`;
  };
  const b = [[], [], [], []];
  const N = Math.round(len * r * 2 / 130);
  for (let i = 0; i < N; i++) {
    const x = (rnd() * 2 - 1) * r * 0.97, y = -len / 2 + rnd() * len, s = 0.8 + 1.7 * rnd(), t = rnd(), rot = rnd() * 3;
    const tone = t < 0.42 ? 0 : t < 0.72 ? 1 : t < 0.96 ? 2 : 3;
    const pts = [0, 1, 2, 3, 4].map((k) => {
      const a = rot + k / 5 * 2 * Math.PI;
      return P([x + s * 0.8 * Math.sin(a), y + s * Math.cos(a), 0]);
    });
    b[tone].push(`M${pts.join("L")}Z`);
  }
  const marks = Array.from({ length: Math.round(len / 9) }, (_, i) => P([-r, -len / 2 + i * 9 + 3, 0]) + "L" + P([r, -len / 2 + i * 9 + 1, 0])).map((s) => `M${s}`).join("");
  return jsxs("g", { "data-probe-skip": true, children: [
    jsx("path", { d: b[0].join(""), fill: MIN_INK[0], opacity: 0.5 }),
    jsx("path", { d: b[1].join(""), fill: MIN_INK[1], opacity: 0.45 }),
    jsx("path", { d: b[2].join(""), fill: MIN_INK[2], opacity: 0.32 }),
    jsx("path", { d: b[3].join(""), fill: MIN_INK[3], opacity: 0.45 }),
    jsx("path", { d: marks, stroke: "#ffffff", strokeWidth: 0.6, opacity: 0.05, fill: "none" })
  ] });
};
/** the drill core — see the API at the top of this file */
export const BxCore = ({ id, rig, xf, len = CORE_LEN, r = CORE_R, seed = 1, pieces, glitter = 0, dust = [0, 1], sparkle = 0, salted = 0, split = 0, lit = 0, cull, probe = "the drill core: a grey stone cylinder, sawn ends" }) => {
  const runs = pieces ?? [[0, 1, "saw", "saw"]];
  const s = clamp01(split);
  const body = runs.map(([a, b, ea, eb], k) => {
    const y0 = -len / 2 + a * len, y1 = -len / 2 + b * len, L = y1 - y0, cy = (y0 + y1) / 2;
    const pxf = xfMul(xf, xfTrans([0, cy, 0]));
    const skinU = [a, b];
    // the skin's fields are laid out over the WHOLE run (so a piece keeps its own grains when broken)
    const skinMap = (q) => xfApply(xf, q);
    if (s < 1e-3) {
      const map = (q) => xfApply(pxf, q);
      return jsxs("g", { children: [
        jsx(CorePieceBody, { id: `${id}p${k}`, rig, map, len: L, r, seed: seed * 7 + k, ends: [ea, eb] }),
        jsx(RockSkin, { rig, map: skinMap, len, r, seed, glitter, dust, sparkle, salted, cull, u0: a, u1: b }),
        lit > 3e-3 && jsx(TopRim, { rig, map, len: L, r, lit })
      ] }, k);
    }
    // split: two halves rolling until both sawn faces lie face-up, parting sideways (local z)
    const e = s, ang = 90 * e, gap = 1.08 * r * e;
    const halfXf = (side) => xfMul(pxf, xfMul(xfTrans([0, 0, side * gap]), rotAxisY(-side * ang)));
    const halves = [-1, 1].map((side) => {
      const hx = halfXf(side), map = (q) => xfApply(hx, q);
      const pr = profHalf(r, side, 40);
      const geo = loftGeo({ prof: pr, len: L });
      const pt = loftPaint(`${id}p${k}h${side}`, rig, map, geo, ROCK_MAT(toneOf(seed * 7 + k)));
      const sawn = pt.strips.filter((q) => q.flat && q.j >= pr.pts.length - 2);
      const zc = worldView(rig, map([0, 0, 0]))[2];
      const hmap = (q) => xfApply(xfMul(xf, xfMul(xfTrans([0, 0, side * gap]), rotAxisY(-side * ang))), q);
      return { zc, el: jsxs("g", { children: [
        jsx(StripDefs, { strips: pt.strips }),
        jsx(StripPaths, { strips: pt.strips }),
        jsx(RockSkin, { rig, map: (q) => xfApply(xfMul(xfMul(xf, xfTrans([0, 0, side * gap])), rotAxisY(-side * ang)), q), len, r, seed, glitter, dust, sparkle, salted, half: side, u0: a, u1: b, cull }),
        sawn.length > 0 && jsx(SawnFace, { rig, map, len: L, r, seed: seed * 13 + k, side }),
        sawn.length > 0 && jsx(GrainTex, { clipId: `${id}p${k}h${side}sc`, strips: sawn, rig, map, len: L, r, op: 0.5 }),
        jsx(GrainTex, { clipId: `${id}p${k}h${side}gc`, strips: pt.strips.filter((q) => !sawn.includes(q)), rig, map, len: L, r, op: 0.5 }),
        pt.caps.map((c) => jsx(CoreCap, { rig, map, cap: c, y: c.which === "top" ? -L / 2 : L / 2, r, seed: seed * 7 + k, kind: [ea, eb][c.which === "top" ? 0 : 1], sideOf: (z) => side * z >= 0 }, c.which))
      ] }) };
    });
    halves.sort((p, q) => p.zc - q.zc);
    return jsx("g", { children: halves.map((h, i) => jsx("g", { children: h.el }, i)) }, k);
  });
  return jsxs("g", { "data-probe-object": probe || void 0, children: [jsx(GrainDefs, {}), body] });
};
// rotation about the core's own axis (local y)
const rotAxisY = (deg) => {
  const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return { m: [c, 0, s, 0, 1, 0, -s, 0, c], t: [0, 0, 0] };
};
const CorePieceBody = ({ id, rig, map, len, r, seed, ends }) => {
  const P = profBar({ c: r, n: 48 });
  const geo = loftGeo({ prof: P, len, jag: jagOf(seed, P.pts.length, ends) });
  const pt = loftPaint(id, rig, map, geo, ROCK_MAT(toneOf(seed)));
  return jsxs("g", { children: [
    jsx(StripDefs, { strips: pt.strips }),
    jsx(StripPaths, { strips: pt.strips }),
    jsx(GrainTex, { clipId: `${id}gc`, strips: pt.strips, rig, map, len, r, op: 0.5 }),
    pt.caps.map((c) => jsx(CoreCap, { rig, map, cap: c, y: c.which === "top" ? -len / 2 : len / 2, r, seed, kind: ends[c.which === "top" ? 0 : 1] }, c.which))
  ] });
};
// a cool rim of light along the top (a reveal)
const TopRim = ({ rig, map, len, r, lit }) => {
  const pts = [];
  for (let k = 0; k <= 20; k++) pts.push(worldScr(rig, map([r * 0.98, -len / 2 + len * k / 20, -r * 0.18])));
  const d = `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}`;
  return jsxs("g", { "data-probe-skip": true, children: [
    jsx("path", { d, stroke: "#B3CEEF", strokeWidth: 7, opacity: 0.12 * lit, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d, stroke: "#ffffff", strokeWidth: 1.6, opacity: 0.55 * lit, fill: "none", strokeLinecap: "round" })
  ] });
};
export const coreTop = (xf, len, u, r = CORE_R) => xfApply(xf, [r, -len / 2 + u * len, 0]);
export const coreCorners = (xf, len = CORE_LEN, r = CORE_R) => {
  const out = [];
  for (const x of [-r, r]) for (const y of [-len / 2, len / 2]) for (const z of [-r, r]) out.push(xfApply(xf, [x, y, z]));
  return out;
};

// ── THE TRAY ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const TRAY = { pitch: 2 * CORE_R + 22, wall: 5, div: 4, base: 9, h: 2 * CORE_R * 0.78, end: 30, endH: 2 * CORE_R * 0.78 + 10 };
export const trayWidth = (rows) => rows * TRAY.pitch + TRAY.wall * 2;
export const trayRowZ = (i, rows) => -((rows - 1) / 2) * TRAY.pitch + i * TRAY.pitch;
export const trayCoreY = -(TRAY.base + CORE_R);
const trayMemo = new Map();
const trayParts = (rows, len) => {
  const key = `${rows}|${len}`;
  if (trayMemo.has(key)) return trayMemo.get(key);
  const W = trayWidth(rows), L = len + 2 * TRAY.end;
  const base = wound(box3([0, -TRAY.base / 2, 0], [L, TRAY.base, W], 0, 0));
  const zw = (i) => -W / 2 + TRAY.wall / 2 + i * TRAY.pitch + (i === 0 ? 0 : 0);
  // walls: index 0 = back outer wall, rows = front outer wall, the rest dividers
  const walls = Array.from({ length: rows + 1 }, (_, i) => {
    const z = -rows * TRAY.pitch / 2 + i * TRAY.pitch;
    const t = i === 0 || i === rows ? TRAY.wall : TRAY.div;
    const zz = i === 0 ? z - TRAY.wall / 2 + 0 : i === rows ? z + TRAY.wall / 2 - 0 : z;
    return { z: zz, t, faces: wound(box3([0, -TRAY.base - TRAY.h / 2, zz], [len, TRAY.h, t], 0, 1)) };
  });
  const ends = [-1, 1].map((s) => ({ s, faces: wound(box3([s * (len / 2 + TRAY.end / 2), -TRAY.endH / 2, 0], [TRAY.end, TRAY.endH, W], 0, 2)) }));
  const out = { base, walls, ends, W, L };
  trayMemo.set(key, out);
  return out;
};
const steelTone = (dw, ramp = BX_STEEL) => rampAt(ramp, dw.face.bev ? Math.min(1, 0.95 * dw.light + 0.16) : 0.86 * dw.light + 0.05);
const Faces = ({ faces, map, rig, ramp, spec = 0.55, mul = 1 }) => jsx(jsx_runtime.Fragment, { children: paintXf(faces, map, rig, spec).map((dw, k) => {
  const c = steelTone({ ...dw, light: dw.light * mul }, ramp);
  return jsx("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
}) });
export const trayCorners = (xf, rows, len = CORE_LEN) => {
  const W = trayWidth(rows), L = len + 2 * TRAY.end, out = [];
  for (const x of [-L / 2, L / 2]) for (const y of [0, -TRAY.endH]) for (const z of [-W / 2, W / 2]) out.push(xfApply(xf, [x, y, z]));
  return out;
};
/** the core tray with its cores — see the API at the top of this file */
export const BxTray = ({ id, rig, xf, rows = 4, len = CORE_LEN, cores = [], hero = -1, heroEl, cull, probe = "the core tray: galvanised steel, slotted rows, end blocks with hand slots, depth graduations" }) => {
  const map = (q) => xfApply(xf, q);
  const P = (pts, close = true) => `M${pts.map((q) => {
    const s = worldScr(rig, map(q));
    return `${f2(s[0])},${f2(s[1])}`;
  }).join("L")}${close ? "Z" : ""}`;
  const { base, walls, ends } = trayParts(rows, len);
  const W = trayWidth(rows);
  // which end block is nearer the lens
  const zEnd = (s) => worldView(rig, map([s * (len / 2 + TRAY.end / 2), -TRAY.endH / 2, 0]))[2];
  const near = zEnd(1) > zEnd(-1) ? 1 : -1;
  const yTop = -TRAY.base - TRAY.h;
  // depth graduations along the front rim (every 100, long every 500) and on each divider's top
  const ticks = [];
  for (let x = -len / 2 + 50; x <= len / 2 - 50 + 1e-6; x += 50) {
    const long = Math.abs((x + len / 2) % 500) < 1e-6, mid = Math.abs((x + len / 2) % 100) < 1e-6;
    if (!mid && !long) continue;
    const zf = rows * TRAY.pitch / 2 + TRAY.wall;
    ticks.push(P([[x, yTop + 2, zf + 0.3], [x, yTop + (long ? 22 : 12), zf + 0.3]], false));
  }
  const coreEls = (i) => {
    const c = cores[i];
    if (!c) return null;
    const z = trayRowZ(i, rows);
    const cxf = xfMul(xf, coreXf(0, trayCoreY, z));
    return jsx(BxCore, { id: `${id}c${i}`, rig, xf: cxf, len, seed: c.seed ?? i + 3, pieces: c.pieces, glitter: c.glitter ?? 0, dust: c.dust, sparkle: c.sparkle ?? 0, cull, probe: null });
  };
  // contact shadow under each row's core on the channel floor, and the run blocks between broken pieces
  const contact = (i) => {
    const z = trayRowZ(i, rows), y = -TRAY.base - 0.3;
    return P([[-len / 2 + 6, y, z - CORE_R * 0.75], [len / 2 - 6, y, z - CORE_R * 0.75], [len / 2 - 6, y, z + CORE_R * 0.55], [-len / 2 + 6, y, z + CORE_R * 0.55]]);
  };
  const blocks = (i) => {
    const c = cores[i];
    if (!c || !c.pieces) return [];
    return c.pieces.slice(0, -1).filter((p) => p[3] === "block").map((p) => {
      const x = -len / 2 + p[1] * len, z = trayRowZ(i, rows);
      return wound(box3([x + 8, -TRAY.base - 20, z], [14, 40, 2 * CORE_R + 10], 0, 1));
    });
  };
  const slot = (s) => {
    const x = s * (len / 2 + TRAY.end), y0 = -TRAY.endH * 0.62, y1 = -TRAY.endH * 0.3, z0 = -W * 0.28, z1 = W * 0.28;
    const pts = [];
    const rr = (y1 - y0) / 2;
    for (let k = 0; k <= 8; k++) {
      const a = -Math.PI / 2 - k / 8 * Math.PI;
      pts.push([x + s * 0.4, (y0 + y1) / 2 + rr * Math.sin(a), z0 + rr + rr * Math.cos(a)]);
    }
    for (let k = 0; k <= 8; k++) {
      const a = Math.PI / 2 - k / 8 * Math.PI;
      pts.push([x + s * 0.4, (y0 + y1) / 2 + rr * Math.sin(a), z1 - rr + rr * Math.cos(a)]);
    }
    return P(pts);
  };
  const endEl = (e) => jsxs("g", { children: [
    jsx(Faces, { faces: e.faces, map, rig, ramp: BX_STEEL, spec: 0.6 }),
    jsx("path", { d: slot(e.s), fill: "#04101C", opacity: 0.85 }),
    [-0.4, 0.4].map((k) => {
      const q = worldScr(rig, map([e.s * (len / 2 + TRAY.end + 0.6), -TRAY.endH * 0.16, k * W]));
      return jsxs("g", { children: [
        jsx("circle", { cx: f2(q[0]), cy: f2(q[1]), r: 3.4, fill: "#000000", opacity: 0.45 }),
        jsx("circle", { cx: f2(q[0] - 0.4), cy: f2(q[1] - 0.5), r: 2.6, fill: rampAt(BX_STEEL, 0.8) })
      ] }, k);
    })
  ] });
  const seq = [];
  seq.push(jsx(Faces, { faces: base, map, rig, ramp: BX_STEEL, spec: 0.5 }, "base"));
  // channel floors (the base's top seen inside each channel) in the darker inner steel
  for (let i = 0; i < rows; i++) {
    const z = trayRowZ(i, rows), y = -TRAY.base - 0.2, h = TRAY.pitch / 2 - 2;
    seq.push(jsx("path", { d: P([[-len / 2, y, z - h], [len / 2, y, z - h], [len / 2, y, z + h], [-len / 2, y, z + h]]), fill: rampAt(BX_STEEL_IN, 0.42) }, `fl${i}`));
    const lift = cores[i]?.lift ?? 0;
    seq.push(jsx("path", { d: contact(i), fill: "#000000", opacity: 0.4 / (1 + lift / 60), style: { filter: `blur(${(3 + lift / 10).toFixed(1)}px)` }, "data-probe-skip": true }, `ct${i}`));
  }
  seq.push(jsx("g", { children: endEl(ends.find((e) => e.s === -near)) }, "endFar"));
  walls.forEach((w, i) => {
    seq.push(jsx(Faces, { faces: w.faces, map, rig, ramp: BX_STEEL, spec: 0.6 }, `w${i}`));
    // a lit lip on each wall's top edge
    seq.push(jsx("path", { d: P([[-len / 2, yTop + 0.2, w.z - w.t / 2], [len / 2, yTop + 0.2, w.z - w.t / 2]], false), stroke: "#ffffff", strokeWidth: 0.9, opacity: 0.22, fill: "none" }, `lp${i}`));
    if (i < rows) {
      if (i === hero) {
        if (heroEl) seq.push(jsx("g", { children: heroEl(map) }, `core${i}`));
      } else seq.push(jsx("g", { children: coreEls(i) }, `core${i}`));
      for (const [k, b] of blocks(i).entries()) seq.push(jsx(Faces, { faces: b, map, rig, ramp: ["#2A2418", "#4C4331", "#7A6E55", "#B7AB90", "#E8E0CC"], spec: 0.2 }, `bl${i}_${k}`));
    }
  });
  seq.push(jsx("path", { d: ticks.join(""), stroke: "#0A1A2B", strokeWidth: 1.6, opacity: 0.7, fill: "none" }, "ticks"));
  seq.push(jsx("g", { children: endEl(ends.find((e) => e.s === near)) }, "endNear"));
  return jsx("g", { "data-probe-object": probe || void 0, children: [jsx(GrainDefs, {}, "gd"), ...seq] });
};
