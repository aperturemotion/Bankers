// @ts-nocheck
// ★ V37 "Theranos" — builder M (REV1). A crystal water TUMBLER on its leather coaster, set at each lit place of the boardroom table
//   (part of the table's setting): a tapered glass with a thick base, the far rim seen through the glass, the near rim lit, a
//   bright specular streak on its lit (left) side and a thin one on the right, the coaster with a stitched rim, a contact shadow.
//   Empty (no liquids). Positions are table-local (x, z) on the top at y; the glass is drawn in true perspective (rings projected).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { rampAt } from "./solid_engine";
import { worldScr, xfApply } from "./tk_rig";
import { BR_BLOT } from "./backers_kit";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const N = 40;
const hull = (pts) => {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  for (const q of [...p].reverse()) {
    while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop();
    hi.push(q);
  }
  return [...lo.slice(0, -1), ...hi.slice(0, -1)];
};
const path = (pts, close = true) => `M${pts.map((q) => `${f2(q[0])},${f2(q[1])}`).join("L")}${close ? "Z" : ""}`;
export const GL = { rb: 21, rt: 25, h: 74, base: 9, coaster: 38 };
/** the tumbler at table-local (x, z) on the top surface y; pose = the table's world xf; lit 0…1 */
export const Tumbler = ({ id, rig, pose, x, y, z, lit = 1 }) => {
  const S = (q) => worldScr(rig, xfApply(pose, q));
  const ring = (r, yy) => Array.from({ length: N }, (_, i) => {
    const a = i / N * 2 * Math.PI;
    return { p: S([x + r * Math.cos(a), yy, z + r * Math.sin(a)]), near: Math.sin(a) > 0, a };
  });
  const coastTop = ring(GL.coaster, y - 3), coastBot = ring(GL.coaster, y);
  const bot = ring(GL.rb, y - 3), base = ring(GL.rb - 2, y - 3 - GL.base), top = ring(GL.rt, y - 3 - GL.h);
  const body = hull([...bot, ...top].map((q) => q.p));
  const coaster = hull([...coastTop, ...coastBot].map((q) => q.p));
  const arcOf = (rg, near) => {
    // the contiguous half of the ring (near: toward the lens) as an open path
    const idx = rg.map((q, i) => i).filter((i) => rg[i].near === near);
    const start = idx.find((i) => !rg[(i - 1 + N) % N] || rg[(i - 1 + N) % N].near !== near) ?? idx[0];
    const out = [];
    for (let k = 0; k < N; k++) {
      const i = (start + k) % N;
      if (rg[i].near !== near) break;
      out.push(rg[i].p);
    }
    return out;
  };
  // the specular streaks: thin quads up the glass's left (lit) and right sides
  const streak = (a0, a1, op) => {
    const pt = (r, yy, a) => S([x + r * Math.cos(a), yy, z + r * Math.sin(a)]);
    return { d: path([pt(GL.rb, y - 6, a0), pt(GL.rb, y - 6, a1), pt(GL.rt, y - GL.h, a1), pt(GL.rt, y - GL.h, a0)]), op };
  };
  const on = 0.55 + 0.45 * clamp01(lit);
  const sL = streak(Math.PI * 0.62, Math.PI * 0.7, 0.55 * on), sR = streak(Math.PI * 0.16, Math.PI * 0.19, 0.3 * on);
  const sh = S([x + 26, y, z - 30]), c0 = S([x, y, z]);
  return jsxs("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    // the coaster (a leather disc with a stitched rim) and the glass's soft contact shadow on it
    jsx("path", { d: path(coaster), fill: rampAt(BR_BLOT, 0.2) }),
    jsx("path", { d: path(coastTop.map((q) => q.p)), fill: rampAt(BR_BLOT, 0.42) }),
    jsx("path", { d: path(ring(GL.coaster - 5, y - 3.2).map((q) => q.p)), fill: "none", stroke: "#8FA9C8", strokeOpacity: 0.35, strokeWidth: 0.8, strokeDasharray: "3 2.5" }),
    jsx("ellipse", { cx: f2((c0[0] + sh[0]) / 2), cy: f2((c0[1] + sh[1]) / 2), rx: f2(GL.rb * 1.3), ry: f2(GL.rb * 0.45), fill: "#000000", opacity: 0.35, style: { filter: "blur(3px)" } }),
    // the glass: the far rim through it, its body, its thick base, the near rim, the streaks
    jsx("path", { d: path(body), fill: "#C8DCF4", fillOpacity: 0.1 + 0.05 * on, stroke: "#DCE9F8", strokeOpacity: 0.22, strokeWidth: 0.8 }),
    jsx("path", { d: path(arcOf(top, false), false), fill: "none", stroke: "#E6F0FB", strokeOpacity: 0.3, strokeWidth: 1.1 }),
    jsx("path", { d: path(base.map((q) => q.p)), fill: "#DCE9F8", fillOpacity: 0.16 + 0.1 * on }),
    jsx("path", { d: path(arcOf(base, true), false), fill: "none", stroke: "#FFFFFF", strokeOpacity: 0.4 * on, strokeWidth: 1.2 }),
    jsx("path", { d: sL.d, fill: "#FFFFFF", opacity: sL.op }),
    jsx("path", { d: sR.d, fill: "#FFFFFF", opacity: sR.op }),
    jsx("path", { d: path(arcOf(top, true), false), fill: "none", stroke: "#FFFFFF", strokeOpacity: 0.7 * on, strokeWidth: 1.6, strokeLinecap: "round" })
  ] });
};
