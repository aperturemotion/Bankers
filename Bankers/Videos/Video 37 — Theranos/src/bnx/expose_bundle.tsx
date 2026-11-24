// @ts-nocheck
// ★ V37 "Theranos" — expose helper (builder C): A BUNDLE OF NEWSPAPERS, tied with twine. Real construction on V35/V36's tk_rig:
//   18 folded broadsheets stacked (each copy its own thin solid, each a hair off square so the edges stagger like a real bundle),
//   the folded edges toward the lens (each copy's fold a rounded lit bulge between two dark creases), the loose page edges on the
//   left side (each copy several sheets: fine lines), the TOP COPY separate (its own solid + its printed page on a CSS plane:
//   newsprint ground with grain, the masthead band, the dateline strip, a headline block, column rules and blocks of type as
//   abstract bars — no readable fake text, no photo), and a cross-tie of twisted twine with a knot on top.
//   One key light (solid_engine lightOf, upper left); the paper in the house's pale steel-blue newsprint ramp; the print navy.
//   LOCAL FRAME (the bundle's): origin at the bundle's foot centre, y DOWN (the top copy's face at y = −BUNDLE.H), x right,
//   z toward the lens; the masthead along the far (−z) edge.
//   <BundleStack id rig G sq /> the stack under the top copy (an SVG <g>), sq = the landing's squash (0…1)
//   <TopCopyEdge id rig X /> the top copy's thickness · <TopCopyPrint rig X mast date glint mastText dateText /> its page (HTML)
//   <Twine rig G s layer /> the cross-tie: layer "sides" (down the stack's faces) or "tops" (over the top copy and its edges);
//     s = { snap: frames since the twine snapped (< 0 before), lie: 0…1 the cut ends settled }
//   topXf(G, slide) the top copy's pose; bundleCorners(G) for shadows.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { seeded } from "./common";
import { box3, lightOf, rampAt } from "./solid_engine";
import { XPlane, paintXf, worldScr, wound, xfApply, xfMul, xfRotX, xfRotY, xfTrans } from "./tk_rig";
import { SHOUT } from "./fonts";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
// a folded broadsheet (the WSJ: 12 × 22¾ in, folded once → 12 × 11.4 in) at ≈ 0.58 mm a unit; ~5 mm a copy
export const BUNDLE = { W: 520, D: 460, N: 18, T: 8.5, TT: 7 };
BUNDLE.H = BUNDLE.N * BUNDLE.T + BUNDLE.TT;
// newsprint in the house's blue family (pale steel-blue, matte), its shadowed edges, the print's navy
export const PAPER = ["#4F6079", "#8A9BB2", "#BCC8D6", "#DCE3EC", "#F4F7FA"];
export const PRINT_INK = "#0E2442";
const TWINE = { base: "#56769C", dark: "#203A5C", hi: "#B7CAE2", twist: "#2A4568" };
const OFFS = (() => {
  const r = seeded(3711);
  return Array.from({ length: BUNDLE.N }, () => [(r() - 0.5) * 7, (r() - 0.5) * 6]);
})();
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const P = (rig, X, q) => worldScr(rig, xfApply(X, q));
const pd = (pts, close = true) => `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}${close ? "Z" : ""}`;
const paperOf = (l) => rampAt(PAPER, Math.max(0.12, Math.min(0.96, 0.1 + 0.98 * l)));
// the top copy's pose: on the stack, slid forward (`slide` = [dx, dz, yaw°])
export const topXf = (G, sl = [0, 0, 0], sq = 0) => {
  const top = -BUNDLE.N * BUNDLE.T * (1 - 0.04 * sq) - BUNDLE.TT;
  return xfMul(G, xfMul(xfTrans([sl[0], top, sl[1]]), xfRotY(sl[2])));
};
// the print plane on the top copy's face: the page's top-left corner at (−W/2, −D/2), the page's down = +z
export const printXf = (X) => xfMul(X, xfRotX(90));
export const bundleCorners = (G) => {
  const out = [];
  for (const x of [-1, 1]) for (const z of [-1, 1]) for (const y of [0, -BUNDLE.H]) out.push(xfApply(G, [x * BUNDLE.W / 2, y, z * BUNDLE.D / 2]));
  return out;
};
// one copy as a solid: its faces lit, its fold (front) and page edges (left) detailed
const Copy = ({ rig, X, y0, t, off, k }) => {
  const W = BUNDLE.W, D = BUNDLE.D;
  const faces = wound(box3([off[0], y0 - t / 2, off[1]], [W, t, D], 0, 1));
  const map = (q) => xfApply(X, q);
  const drawn = paintXf(faces, map, rig, 0.25);
  const x0 = off[0] - W / 2, x1 = off[0] + W / 2, zf = off[1] + D / 2 + 0.3, zb = off[1] - D / 2, xl = x0 - 0.3;
  const fold = (fy) => pd([P(rig, X, [x0 + 3, fy, zf]), P(rig, X, [x1 - 3, fy, zf])], false);
  const edge = (fy) => pd([P(rig, X, [xl, fy, zf - 4]), P(rig, X, [xl, fy, zb + 3])], false);
  const showFront = drawn.some((d) => d.face.n[2] > 0.5), showLeft = drawn.some((d) => d.face.n[0] < -0.5);
  return jsxs("g", { children: [
    drawn.map((dw, i) => {
      const n = dw.face.n, top = n[1] < -0.5;
      const c = paperOf(top ? 0.92 * dw.light + 0.06 : n[2] > 0.5 ? 0.82 * dw.light + 0.06 : 0.78 * dw.light);
      return jsx("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.5, strokeLinejoin: "round" }, i);
    }),
    showFront && jsxs("g", { children: [
      // the fold: dark creases at the copy's top and foot, the rounded bulge catching the light between them
      jsx("path", { d: fold(y0 - t + 0.6), stroke: "#2B3D57", strokeWidth: 1.3, opacity: 0.55 }),
      jsx("path", { d: fold(y0 - t * 0.55), stroke: "#FFFFFF", strokeWidth: 2.2, opacity: 0.55 }),
      jsx("path", { d: fold(y0 - 0.5), stroke: "#2B3D57", strokeWidth: 1, opacity: 0.4 })
    ] }),
    showLeft && jsxs("g", { children: [
      // the loose page edges of the copy's sections
      [0.2, 0.42, 0.63, 0.84].map((u, i) => jsx("path", { d: edge(y0 - t * u), stroke: i % 2 ? "#3A4E6B" : "#FFFFFF", strokeWidth: i % 2 ? 0.8 : 0.7, opacity: i % 2 ? 0.35 : 0.3 }, i)),
      jsx("path", { d: edge(y0 - t + 0.4), stroke: "#2B3D57", strokeWidth: 1.2, opacity: 0.5 })
    ] })
  ] }, k);
};
export const BundleStack = ({ rig, G, sq = 0 }) => {
  const t = BUNDLE.T * (1 - 0.04 * sq);
  return jsx("g", { children: OFFS.map((off, i) => jsx(Copy, { rig, X: G, y0: -i * t, t, off, k: i }, i)) });
};
// the top copy's thickness (its fold to the lens) — drawn before its printed page
export const TopCopyEdge = ({ rig, X }) => jsx(Copy, { rig, X, y0: BUNDLE.TT, t: BUNDLE.TT, off: [0, 0], k: "top" });
// the page's abstract layout: one SVG path of bars (type), the column rules, the headline block — seeded, fixed
const PAGE = (() => {
  const W = BUNDLE.W, D = BUNDLE.D, M = 16;
  const r = seeded(9020);
  const type = [], heads = [], rules = [], soft = [];
  const bars = (x0, x1, y0, y1, arr, gap = 6.2, h = 2.6) => {
    for (let y = y0; y < y1 - h; y += gap) {
      const end = r() < 0.12 ? x0 + (x1 - x0) * (0.35 + 0.5 * r()) : x1;
      arr.push([x0, y, end - x0, h]);
    }
  };
  // the left "news digest" column
  const cx0 = M, cx1 = 132;
  for (let k = 0, y = 146; k < 5; k++) {
    heads.push([cx0, y, (cx1 - cx0) * (0.6 + 0.3 * r()), 5]);
    bars(cx0, cx1, y + 10, y + 52, type);
    y += 62;
  }
  rules.push([cx1 + 7, 140, 1, D - 140 - 6]);
  // the lead story: a two-line headline across three columns, a deck, then three columns of type
  const lx0 = cx1 + 15, lx1 = W - M;
  heads.push([lx0, 146, lx1 - lx0, 13], [lx0, 164, (lx1 - lx0) * 0.72, 13]);
  soft.push([lx0, 186, (lx1 - lx0) * 0.86, 6], [lx0, 196, (lx1 - lx0) * 0.6, 6]);
  const cw = (lx1 - lx0 - 16) / 3;
  for (let c = 0; c < 3; c++) {
    const x0 = lx0 + c * (cw + 8);
    bars(x0, x0 + cw, 214, D - 8, type);
    if (c > 0) rules.push([x0 - 4.5, 212, 0.8, D - 212 - 6]);
  }
  return { type, heads, rules, soft };
})();
const rectsD = (arr) => arr.map(([x, y, w, h]) => `M${f2(x)},${f2(y)}h${f2(w)}v${f2(h)}h${f2(-w)}Z`).join("");
// the printed page on the top copy (HTML on the copy's own plane, so it rides every move of the copy and never swims)
export const TopCopyPrint = ({ rig, X, mast = 0, date = 0, glint = -1, mastText, dateText, light = 0.8 }) => {
  const W = BUNDLE.W, D = BUNDLE.D;
  const g0 = clamp01(light);
  const lit0 = paperOf(0.92 * g0 + 0.14), lit1 = paperOf(0.92 * g0 + 0.02), lit2 = paperOf(0.92 * g0 - 0.1);
  const ease = (v) => ({ opacity: clamp01(v), transform: `scale(${(1.06 - 0.06 * clamp01(v)).toFixed(4)})` });
  return jsx(XPlane, { rig, x: printXf(X), u: -W / 2, v: -D / 2, w: 0.6, width: W, height: D, probe: "the top copy's printed page", children: jsxs("div", { style: { position: "relative", width: W, height: D, overflow: "hidden", background: `linear-gradient(128deg, ${lit0} 0%, ${lit1} 46%, ${lit2} 100%)` }, children: [
    // newsprint grain
    jsxs("svg", { width: W, height: D, style: { position: "absolute", left: 0, top: 0 }, children: [
      jsx("defs", { "data-probe-skip": true, children: jsxs("filter", { id: "exGrain", x: "0", y: "0", width: "100%", height: "100%", children: [
        jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.9", numOctaves: 2, seed: 7 }),
        jsx("feColorMatrix", { values: "0 0 0 0 0.1  0 0 0 0 0.16  0 0 0 0 0.26  0 0 0 0.55 0" })
      ] }) }),
      jsx("rect", { "data-probe-skip": true, x: 0, y: 0, width: W, height: D, filter: "url(#exGrain)", opacity: 0.32 }),
      // the masthead band's rules, the dateline strip, the page's type as abstract bars
      jsx("path", { d: rectsD([[16, 86, W - 32, 2.6], [16, 91, W - 32, 1], [16, 136, W - 32, 1.2]]), fill: PRINT_INK, opacity: 0.85 }),
      jsx("path", { d: rectsD([[W - 16 - 150, 109, 40, 8], [W - 16 - 100, 109, 84, 8]]), fill: PRINT_INK, opacity: 0.32 }),
      jsx("path", { d: rectsD(PAGE.heads), fill: PRINT_INK, opacity: 0.62 }),
      jsx("path", { d: rectsD(PAGE.soft), fill: PRINT_INK, opacity: 0.38 }),
      jsx("path", { d: rectsD(PAGE.type), fill: PRINT_INK, opacity: 0.27 }),
      jsx("path", { d: rectsD(PAGE.rules), fill: PRINT_INK, opacity: 0.55 }),
      // the fold's soft shading at the page's foot (the lens side) and the light's sheen
      jsx("rect", { x: 0, y: D - 26, width: W, height: 26, fill: "#2B3D57", opacity: 0.1 }),
      glint > -1 && jsxs("g", { "data-probe-skip": true, children: [
        jsx("defs", { children: jsxs("linearGradient", { id: "exSheen", x1: "0", y1: "0", x2: "1", y2: "0", children: [
          jsx("stop", { offset: "0", stopColor: "#FFFFFF", stopOpacity: 0 }),
          jsx("stop", { offset: "0.5", stopColor: "#FFFFFF", stopOpacity: 1 }),
          jsx("stop", { offset: "1", stopColor: "#FFFFFF", stopOpacity: 0 })
        ] }) }),
        jsx("rect", { x: -260 + (W + 520) * glint - 130, y: -60, width: 260, height: D + 120, fill: "url(#exSheen)", opacity: 0.42 * Math.sin(Math.PI * clamp01(glint)), transform: "skewX(-24)" })
      ] })
    ] }),
    // the masthead (Anton) and the dateline: printed in as their words are said
    mast > 3e-3 && jsx("div", { style: { position: "absolute", left: 0, top: 22, width: W, textAlign: "center", transformOrigin: "50% 50%", ...ease(mast) }, children: jsx("span", { style: { fontFamily: SHOUT, fontWeight: 400, fontSize: 45, letterSpacing: 1, color: PRINT_INK, whiteSpace: "nowrap", lineHeight: 1 }, children: mastText }) }),
    date > 3e-3 && jsx("div", { style: { position: "absolute", left: 18, top: 99, transformOrigin: "0% 50%", ...ease(date) }, children: jsx("span", { style: { fontFamily: SHOUT, fontWeight: 400, fontSize: 30, letterSpacing: 1.2, color: PRINT_INK, whiteSpace: "nowrap", lineHeight: 1 }, children: dateText }) })
  ] }) });
};
// ── the twine ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// four arms from the knot on top: A runs along x (left arm "AL" down the lit left side), B along z (front arm "BF" down the folds);
//   "AR" and "BB" go over the far edges (their sides face away). Each arm is a path in bundle space: the run on top (length LT),
//   then (AL / BF) down the side. Snapped, each cut end whips back toward its edge and the visible arms slump down their sides,
//   their ends coiling on the floor.
const ARMS = (() => {
  const W = BUNDLE.W, D = BUNDLE.D, yT = -BUNDLE.H - 2.4;
  return [
    { k: "AL", dir: [-1, 0, 0], lat: [0, 0, 1], LT: W / 2 + 2.5, side: true },
    { k: "BF", dir: [0, 0, 1], lat: [1, 0, 0], LT: D / 2 + 2.5, side: true },
    { k: "AR", dir: [1, 0, 0], lat: [0, 0, 1], LT: W / 2 + 2.5, side: false },
    { k: "BB", dir: [0, 0, -1], lat: [1, 0, 0], LT: D / 2 + 2.5, side: false }
  ].map((a) => ({ ...a, yT }));
})();
// a point s along an arm (s = 0 the knot), with its lateral slack
const armAt = (a, s, H) => {
  const r = 5;
  if (s <= a.LT) return [a.dir[0] * s, a.yT, a.dir[2] * s];
  const d = s - a.LT;
  if (d < r * Math.PI / 2) {
    const th = d / r;
    return [a.dir[0] * (a.LT + r * Math.sin(th)), a.yT + r * (1 - Math.cos(th)), a.dir[2] * (a.LT + r * Math.sin(th))];
  }
  const dy = d - r * Math.PI / 2;
  return [a.dir[0] * (a.LT + r), Math.min(-0.5, a.yT + r + dy), a.dir[2] * (a.LT + r)];
};
const strand = (rig, G, pts, key, op = 1) => {
  if (pts.length < 2) return null;
  const d = pd(pts.map((q) => P(rig, G, q)), false);
  return jsxs("g", { opacity: op, children: [
    jsx("path", { d, stroke: "#0A1628", strokeWidth: 8, strokeOpacity: 0.22, fill: "none", strokeLinecap: "round", strokeLinejoin: "round", transform: "translate(1.6 2.2)" }),
    jsx("path", { d, stroke: TWINE.dark, strokeWidth: 6.6, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }),
    jsx("path", { d, stroke: TWINE.base, strokeWidth: 4.8, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }),
    jsx("path", { d, stroke: TWINE.twist, strokeWidth: 4.8, strokeDasharray: "2.2 3.4", fill: "none", opacity: 0.55, strokeLinejoin: "round" }),
    jsx("path", { d, stroke: TWINE.hi, strokeWidth: 1.2, fill: "none", opacity: 0.6, strokeLinecap: "round", strokeLinejoin: "round", transform: "translate(-0.8 -1.1)" })
  ] }, key);
};
export const Twine = ({ rig, G, s, layer }) => {
  const H = BUNDLE.H, snap = s.snap ?? -1;
  const out = [];
  for (const a of ARMS) {
    const sideLen = H - 2.4 - 5 + 5 * Math.PI / 2;
    const total = a.LT + (a.side ? sideLen : 5 * Math.PI / 2);
    // the cut end's travel after the snap: a fast whip back to the edge, then (visible arms) down the side
    const pull = snap < 0 ? 0 : clamp01(1 - Math.exp(-snap / 3.2));
    const fall = snap < 0 ? 0 : clamp01((snap - 5) / 16);
    const sEnd = a.side ? Math.min(total - 7, pull * (a.LT + 8) + fall * fall * (sideLen - 7)) : pull * (a.LT + 5 * Math.PI / 2 + 2);
    // the whip: a lateral wave near the cut end, damped
    const amp = snap < 0 ? 0 : 22 * Math.exp(-snap / 5) * Math.sin(snap * 1.25 + 0.8);
    // slack: the side run bows away from its face once cut
    const slack = snap < 0 ? 0 : clamp01(snap / 14);
    const pts = [];
    const N = 46;
    for (let i = 0; i <= N; i++) {
      const sx = sEnd + (total - sEnd) * i / N;
      const q = armAt(a, sx, H);
      const near = Math.max(0, 1 - (sx - sEnd) / 70);
      const onSide = sx > a.LT + 5 * Math.PI / 2;
      const bow = onSide ? slack * 10 * Math.sin(Math.PI * clamp01((sx - a.LT) / sideLen)) : 0;
      const w = amp * near;
      pts.push([q[0] + a.lat[0] * w + a.dir[0] * bow, q[1] - (onSide ? 0 : Math.abs(w) * 0.25), q[2] + a.lat[2] * w + a.dir[2] * bow]);
    }
    // which layer each point belongs to: "tops" = on top and over the edge; "sides" = down the face
    const isTop = (q) => q[1] < -H + 4;
    if (layer === "tops") {
      const tp = pts.filter((q, i) => isTop(q) || (i > 0 && isTop(pts[i - 1])));
      if (sEnd < total - 1) out.push(strand(rig, G, tp, a.k));
    } else if (a.side) {
      // down the side; once cut, the end slumps onto the floor as a short coil
      const sp = pts.filter((q, i) => !isTop(q) || (i < pts.length - 1 && !isTop(pts[i + 1])));
      const lie = clamp01(s.lie ?? 0);
      if (lie > 0) {
        const foot = sp[sp.length - 1];
        const L = 80 * lie;
        for (let i = 1; i <= 14; i++) {
          const u = i / 14;
          const bend = 9 * Math.sin(Math.PI * u) * lie;
          sp.push([foot[0] + a.dir[0] * (L * u) + a.lat[0] * bend, -0.8, foot[2] + a.dir[2] * (L * u) + a.lat[2] * bend]);
        }
      }
      out.push(strand(rig, G, sp, a.k));
    }
  }
  // the knot on top (rides the AL arm's cut end once snapped, then is gone over the edge with it)
  if (layer === "tops" && snap < 0) {
    const c = P(rig, G, [0, -H - 3, 0]), e = P(rig, G, [9, -H - 3, 0]), e2 = P(rig, G, [0, -H - 3, 9]);
    const rx = Math.abs(e[0] - c[0]) + 3, ry = Math.abs(e2[1] - c[1]) + 3;
    out.push(jsxs("g", { children: [
      jsx("ellipse", { cx: f2(c[0] + 1.5), cy: f2(c[1] + 2), rx: f2(rx + 2), ry: f2(ry + 2), fill: "#0A1628", opacity: 0.22 }),
      jsx("ellipse", { cx: f2(c[0]), cy: f2(c[1]), rx: f2(rx), ry: f2(ry), fill: TWINE.dark }),
      jsx("ellipse", { cx: f2(c[0] - 1), cy: f2(c[1] - 1), rx: f2(rx * 0.72), ry: f2(ry * 0.7), fill: TWINE.base }),
      jsx("path", { d: `M${f2(c[0] - rx * 0.6)},${f2(c[1] + ry * 0.1)}Q${f2(c[0])},${f2(c[1] - ry * 0.9)} ${f2(c[0] + rx * 0.6)},${f2(c[1] + ry * 0.2)}`, stroke: TWINE.twist, strokeWidth: 1.6, fill: "none", opacity: 0.7 }),
      jsx("ellipse", { cx: f2(c[0] - rx * 0.3), cy: f2(c[1] - ry * 0.35), rx: f2(rx * 0.25), ry: f2(ry * 0.18), fill: TWINE.hi, opacity: 0.6 })
    ] }, "knot"));
  }
  return jsx("g", { children: out });
};
void sub;
void lightOf;
