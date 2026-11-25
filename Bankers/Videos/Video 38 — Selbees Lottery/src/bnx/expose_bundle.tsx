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
import { PagePrint } from "./expose_page";

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
// the printed pages (expose_page): the top copy's, and the copy under it (another copy of the same edition), so the stack never
//   shows a blank sheet when the top copy slides off it
export const TopCopyPrint = (p) => jsx(PagePrint, { ...p, X: printXf(p.X), id: "ppT" });
// the stack's top face (the copy under the top copy): its pose for the print, with the landing's squash
export const stackTopXf = (G, sq = 0) => {
  const off = OFFS[BUNDLE.N - 1];
  return xfMul(G, xfTrans([off[0], -BUNDLE.N * BUNDLE.T * (1 - 0.04 * sq), off[1]]));
};
export const UnderPrint = ({ rig, G, sq, ...p }) => jsx(PagePrint, { rig, ...p, X: printXf(stackTopXf(G, sq)), probe: "the copy under the top copy: the same printed page", id: "ppU" });
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
