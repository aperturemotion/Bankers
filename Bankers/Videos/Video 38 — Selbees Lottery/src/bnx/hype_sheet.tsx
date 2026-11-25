// @ts-nocheck
// ★ V37 "Theranos" — hype_sheet.tsx (builder H): THE $9B ON PAPER — one tall, thin sheet of paper, Z-folded in three panels,
//   standing on edge (a creased sheet is how paper stands at all). Built as a real mesh in the hook camera's 3-D world: each panel
//   a grid of quads, lit by the one key light on whichever side faces the eye (paper both sides), the print mapped onto each quad
//   (so it bends and foreshortens with the paper), the crease lines, the sheet's thin lit edge, its shadow on the steel it stands on.
//   Light and flimsy: a displacement field bends the whole sheet (it leans and sways at the top, its free corners curl), continuous
//   across the creases so the panels stay joined.
//   Folded: the left panel lies over the front of the middle one (its back — the outside of the folded sheet — carries the year,
//   L("hypeYear")); the right panel lies behind. Unfolding: the left panel swings open toward the eye, the right one round from
//   behind, revealing the front print: L("hypeFigure") across the three panels, border rules, fine-print rows.
//   <HypeSheet id cam x z y0 open0 open1 bend t yearOn print /> — y0: the world height it stands on; open0/open1 0…1 the left and
//   right panels' unfolding; bend { lean, curl, flut } the flimsiness; t the frame (flutter phase)
//   sheetPoints(…) → world points of its outline (for shadows)
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mix } from "./anim";
import { rampAt } from "./solid_engine";
import { SHOUT, VOICE } from "./fonts";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const D2R = Math.PI / 180;
export const SHEET = { w: 170, H: 800 };
const PAPER = ["#334457", "#6F8199", "#AEBDD0", "#DFE7F1", "#FBFDFF"];
const INK = "#0E2747";
const NR = 10, NC = 4;
// the panels: 0 left (hinged on the middle's left edge), 1 middle (fixed), 2 right (hinged on its right edge)
const panelGeo = (x, z, b0, b2) => {
  const { w } = SHEET;
  const L = [x - w / 2, z], R = [x + w / 2, z];
  return [
    { o: L, d: [Math.cos(b0 * D2R), Math.sin(b0 * D2R)], n: [Math.sin(b0 * D2R), -Math.cos(b0 * D2R)], U: (u) => w - u, outer: true, left: true },
    { o: L, d: [1, 0], n: [0, 1], U: (u) => w + u, outer: false },
    { o: R, d: [Math.cos(b2 * D2R), Math.sin(b2 * D2R)], n: [-Math.sin(b2 * D2R), Math.cos(b2 * D2R)], U: (u) => 2 * w + u, outer: true }
  ];
};
// the bend field: continuous in world position, so the creases stay joined; the outer panels' free corners curl
const bendAt = (bend, t, xw, h, pn, u, n) => {
  const hN = h / SHEET.H, uN = u / SHEET.w;
  let dz = -bend.lean * hN * hN * 46 + bend.flut * hN * hN * 12 * Math.sin(t * 0.21 + xw * 0.012) + 3 * hN * hN * Math.sin(t * 0.09);
  let dx = bend.flut * hN * hN * 4 * Math.sin(t * 0.17 + 1.3);
  if (pn.outer) {
    const sg = pn.left && n[1] < 0 ? -1 : 1;
    const c = sg * bend.curl * uN * uN * (0.35 + 0.65 * hN) * 22;
    dx += n[0] * c;
    dz += n[1] * c;
  }
  return [dx, dz];
};
export const sheetMesh = ({ x, z, y0, open0, open1, bend, t }) => {
  const b0 = mix(4, 156, open0), b2 = mix(184, 384, open1);
  const P = panelGeo(x, z, b0, b2);
  return P.map((pn, pi) => {
    const V = [];
    for (let r = 0; r <= NR; r++) {
      const h = SHEET.H * r / NR, row = [];
      for (let c = 0; c <= NC; c++) {
        const u = SHEET.w * c / NC;
        const bx = pn.o[0] + pn.d[0] * u, bz = pn.o[1] + pn.d[1] * u;
        const [dx, dz] = bendAt(bend, t, bx, h, pn, u, pn.n);
        row.push({ w: [bx + dx, y0 - h, bz + dz], U: pn.U(u), Ub: u, V: SHEET.H - h });
      }
      V.push(row);
    }
    return { pn, pi, V };
  });
};
export const sheetPoints = (o) => sheetMesh(o).flatMap((m) => [m.V[0][0], m.V[0][NC], m.V[NR][0], m.V[NR][NC], m.V[NR][NC >> 1]].map((q) => q.w));
const bars = (seed, n, x0, x1, y0, dy, h) => {
  let s = seed;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const out = [];
  for (let i = 0; i < n; i++) {
    let xx = x0;
    while (xx < x1 - 12) {
      const L = Math.min(x1 - xx, 14 + r() * 46);
      out.push([xx, y0 + i * dy, L, h]);
      xx += L + 6 + r() * 5;
    }
  }
  return out;
};
const FRONT_BARS = bars(11, 7, 46, 464, 572, 24, 6);
const HEAD_BARS = bars(5, 2, 40, 300, 44, 16, 5);
const BACK_BARS = bars(23, 5, 24, 146, 168, 20, 5);
// the print, in sheet units (U across the opened sheet 0…3w, V down from its top 0…H); items carry their own box for culling
const frontPrint = (fig) => {
  const W = 3 * SHEET.w, H = SHEET.H, chars = [...String(fig ?? "")];
  return [
    { box: [0, 0, W, H], el: (k) => jsxs("g", { children: [
      jsx("rect", { x: 12, y: 12, width: W - 24, height: H - 24, fill: "none", stroke: "#4A6283", strokeWidth: 2.2 }),
      jsx("rect", { x: 20, y: 20, width: W - 40, height: H - 40, fill: "none", stroke: "#7A8EA9", strokeWidth: 0.9 })
    ] }, k) },
    { box: [36, 36, 310, 80], el: (k) => jsx("path", { d: HEAD_BARS.map(([a, b, l, h]) => `M${a},${b}h${f2(l)}v${h}h${f2(-l)}Z`).join(""), fill: "#7F92AC" }, k) },
    ...chars.map((ch, i) => {
      const U = W * (i + 0.5) / chars.length;
      return { box: [U - 100, 160, U + 100, 470], el: (k) => jsxs("g", { children: [
        jsx("text", { x: U, y: 315, textAnchor: "middle", dominantBaseline: "central", style: { fontFamily: SHOUT, fontSize: 300 }, fill: INK, children: ch })
      ] }, k) };
    }),
    { box: [36, 520, W - 36, 530], el: (k) => jsx("path", { d: `M40,524L${W - 40},524`, stroke: "#3E5779", strokeWidth: 2.4 }, k) },
    { box: [40, 566, 470, 740], el: (k) => jsx("path", { d: FRONT_BARS.map(([a, b, l, h]) => `M${a},${b}h${f2(l)}v${h}h${f2(-l)}Z`).join(""), fill: "#A3B2C6" }, k) }
  ];
};
const backPrint = (year, yearOn) => [
  { box: [0, 0, SHEET.w, SHEET.H], el: (k) => jsx("path", { d: `M10,10H${SHEET.w - 10}M10,${SHEET.H - 10}H${SHEET.w - 10}`, stroke: "#8A9CB4", strokeWidth: 1.4 }, k) },
  { box: [10, 60, SHEET.w - 10, 160], el: (k) => jsx("g", { opacity: yearOn, transform: `translate(${SHEET.w / 2} 112) scale(${(1 + 0.08 * (1 - yearOn)).toFixed(4)}) translate(${-SHEET.w / 2} -112)`, children: jsx("text", { x: SHEET.w / 2, y: 112, textAnchor: "middle", dominantBaseline: "central", style: { fontFamily: SHOUT, fontSize: 76, letterSpacing: 1 }, fill: INK, children: year }) }, k) },
  { box: [20, 160, 150, 270], el: (k) => jsx("path", { d: BACK_BARS.map(([a, b, l, h]) => `M${a},${b}h${f2(l)}v${h}h${f2(-l)}Z`).join(""), fill: "#9DADC2" }, k) }
];
const over = (b, u0, u1, v0, v1) => b[0] < Math.max(u0, u1) && b[2] > Math.min(u0, u1) && b[1] < Math.max(v0, v1) && b[3] > Math.min(v0, v1);
const lerpP = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const HypeSheet = ({ id = "hySh", cam, x, z, y0, open0, open1, bend, t, fig, year, yearOn = 1, printOn = 1 }) => {
  const mesh = sheetMesh({ x, z, y0, open0, open1, bend, t });
  const FP = frontPrint(fig), BP = backPrint(year, yearOn);
  const k = cam.K([x, y0 - SHEET.H / 2, z]);
  // each panel: which side faces the eye (from its middle), its light per row (top → foot) and across (hinge → free end)
  const panels = mesh.map((m) => {
    const S = m.V.map((row) => row.map((q) => cam.P(q.w)));
    const nAt = (r, c) => {
      const a = m.V[r][c].w, b = m.V[r][c + 1].w, d = m.V[r + 1][c].w;
      const e1 = [0, 1, 2].map((i) => b[i] - a[i]), e2 = [0, 1, 2].map((i) => d[i] - a[i]);
      let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
      if (n[0] * m.pn.n[0] + n[2] * m.pn.n[1] < 0) n = n.map((v) => -v);
      return n;
    };
    const mid = m.V[NR >> 1][NC >> 1].w;
    const nm = nAt(NR >> 1, NC >> 1), fc = cam.facing(mid, nm);
    const front = fc > 0;
    // how squarely the panel faces the eye (0 edge-on … 1 square): its print thins out as it turns edge-on (no swap in a frame)
    const vm = cam.V(mid), nl = Math.hypot(...nm);
    const sq = Math.abs(fc) / (nl * Math.hypot(vm[0], vm[1], cam.D - vm[2]));
    const lit = (r, c) => {
      const n = nAt(r, c), v = front ? n : n.map((q) => -q);
      return 0.6 * cam.light(v, 0.12, 12) + 0.37;
    };
    const depth = m.V.flat().reduce((acc, q) => acc + cam.V(q.w)[2], 0) / ((NR + 1) * (NC + 1));
    return { m, S, front, lit, depth, sq };
  });
  panels.sort((p, q) => p.depth - q.depth);
  return jsxs("g", { children: panels.map((P, pi) => {
    const { m, S, front, lit, sq } = P;
    const outline = [...S[0], ...S.map((row) => row[NC]), ...[...S[NR]].reverse(), ...S.map((row) => row[0]).reverse()];
    const dOut = `M${outline.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`;
    // the paper's shade: a gradient down the panel (foot → top) and one across it (hinge → free end), from the mesh's own normals
    const gid = `${id}p${m.pi}`;
    const top = S[NR][NC >> 1], bot = S[0][NC >> 1], hng = S[NR >> 1][0], fre = S[NR >> 1][NC];
    const rowsL = Array.from({ length: NR }, (_, r) => lit(r, NC >> 1));
    const colsL = Array.from({ length: NC }, (_, c) => lit(NR >> 1, c));
    const cm = colsL.reduce((a, b) => a + b, 0) / NC;
    // the print, row strip by row strip (each strip its own affine: the print bends with the paper)
    const items = front ? FP : m.pi === 0 ? BP : [];
    const strips = [];
    if (items.length) for (let r = 0; r < NR; r++) {
      const a = m.V[r + 1][0], b = m.V[r + 1][NC], d = m.V[r][0];
      const pa = S[r + 1][0], pb = S[r + 1][NC], pd = S[r][0];
      const U0 = front ? a.U : a.Ub, U1 = front ? b.U : b.Ub, V0 = a.V, V1 = d.V;
      const vis = items.filter((it) => it.box[1] < V1 && it.box[3] > V0);
      if (!vis.length) continue;
      const ax = (pb[0] - pa[0]) / (U1 - U0), ay = (pb[1] - pa[1]) / (U1 - U0), bx = (pd[0] - pa[0]) / (V1 - V0), by = (pd[1] - pa[1]) / (V1 - V0);
      const ex = pa[0] - ax * U0 - bx * V0, ey = pa[1] - ay * U0 - by * V0;
      // the strip, grown 0.6 px up and down so neighbouring strips overlap (opaque inks: no seam)
      const g = 1.1 / Math.max(0.2, Math.hypot(bx, by));
      const top2 = S[r + 1].map((p, i) => [p[0] - bx * g, p[1] - by * g]), bot2 = [...S[r]].reverse().map((p) => [p[0] + bx * g, p[1] + by * g]);
      const dS = `M${[...top2, ...bot2].map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`;
      strips.push(jsxs("g", { clipPath: `url(#${gid}s${r})`, opacity: clamp01((sq - 0.06) / 0.3) * (front ? clamp01(printOn) : 1), children: [
        jsx("defs", { children: jsx("clipPath", { id: `${gid}s${r}`, clipPathUnits: "userSpaceOnUse", children: jsx("path", { d: dS }) }) }),
        jsx("g", { transform: `matrix(${ax.toFixed(5)} ${ay.toFixed(5)} ${bx.toFixed(5)} ${by.toFixed(5)} ${f2(ex)} ${f2(ey)})`, children: vis.map((it, j) => it.el(j)) })
      ] }, r));
    }
    // the shade over the print: a multiply-like dim where the paper turns from the light (keeps the inks in the paper's light)
    const dim = Math.max(0, 0.86 - cm);
    const edgeTop = `M${S[NR].map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}`;
    const edgeFree = m.pn.outer ? `M${S.map((row) => row[NC]).map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}` : "";
    const crease = m.pi !== 1 ? `M${S.map((row) => row[0]).map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}` : "";
    return jsxs("g", { children: [
      jsxs("defs", { children: [
        jsxs("linearGradient", { id: `${gid}v`, gradientUnits: "userSpaceOnUse", x1: f2(bot[0]), y1: f2(bot[1]), x2: f2(top[0]), y2: f2(top[1]), children: rowsL.map((l, r) => jsx("stop", { offset: ((r + 0.5) / NR).toFixed(3), stopColor: rampAt(PAPER, l - 0.05 * (1 - r / NR)) }, r)) }),
        jsxs("linearGradient", { id: `${gid}h`, gradientUnits: "userSpaceOnUse", x1: f2(hng[0]), y1: f2(hng[1]), x2: f2(fre[0]), y2: f2(fre[1]), children: colsL.map((l, c) => jsx("stop", { offset: ((c + 0.5) / NC).toFixed(3), stopColor: "#000000", stopOpacity: clamp01((cm - l) * 1.6 + 0.0).toFixed(3) }, c)) })
      ] }),
      jsx("path", { d: dOut, fill: `url(#${gid}v)` }),
      strips,
      jsx("path", { d: dOut, fill: "#0A1B33", opacity: clamp01(dim * 0.5) }),
      jsx("path", { d: dOut, fill: `url(#${gid}h)` }),
      jsx("path", { d: edgeTop, stroke: "#FFFFFF", strokeWidth: Math.max(0.8, 2.2 * k), opacity: 0.85, fill: "none", strokeLinecap: "round" }),
      jsx("path", { d: edgeTop, stroke: "#7D90AA", strokeWidth: Math.max(0.5, 0.9 * k), opacity: 0.6, fill: "none", transform: `translate(${f2(0.9 * k)} ${f2(1.6 * k)})` }),
      edgeFree && jsx("path", { d: edgeFree, stroke: "#F4F8FD", strokeWidth: Math.max(0.7, 1.8 * k), opacity: 0.75, fill: "none", strokeLinecap: "round" }),
      crease && jsx("path", { d: crease, stroke: "#5D7392", strokeWidth: Math.max(0.6, 1.4 * k), opacity: 0.6, fill: "none" })
    ] }, pi);
  }) });
};
