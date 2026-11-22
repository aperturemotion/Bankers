// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { theme } from "./theme";
import { rampAt } from "./solid_engine";
import { scrPath, worldScr } from "./tk_rig";
import { TK_FLOOR, TK_FLOOR_BOLT, TK_FLOOR_SEAM } from "./tk_mat";
import { TK_FLOOR_Y } from "./tk_slab";

const T = 130;
const f2 = (v) => v.toFixed(2);
const KEYDIR = { x: 0.5, z: -0.62 };
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
export const TkFloor = ({ id, rig, at, reach = 1500, casters = [], stage = 0, on = 1 }) => {
  const P = (x, z, y = TK_FLOOR_Y) => worldScr(rig, [x, y, z]);
  const ink = (k) => mixHex(rampAt(TK_FLOOR, k), theme.bgLight, 0.78 * stage);
  const X0 = at.x - 2.2 * reach, X1 = at.x + 2.2 * reach, Z0 = at.z - 2.4 * reach, Z1 = at.z + 0.9 * reach;
  const outer = scrPath([P(X0, Z0), P(X1, Z0), P(X1, Z1), P(X0, Z1)]);
  const c0 = P(at.x, at.z), cS = P(at.x + reach, at.z), cF = P(at.x, at.z - reach * 1.4), cN = P(at.x, at.z + reach * 0.7);
  const rx = Math.abs(cS[0] - c0[0]), ry = Math.max(60, Math.abs(cF[1] - c0[1]), Math.abs(cN[1] - c0[1]));
  const reachOf = (x, z) => Math.hypot((x - at.x) / reach, (z - at.z) / (z < at.z ? reach * 1.4 : reach * 0.7));
  const alphaAt = (x, z) => clamp01(1.1 - reachOf(x, z));
  const seams = [], studs = [];
  const gx0 = Math.floor(X0 / T) * T, gz0 = Math.floor(Z0 / T) * T;
  for (let x = gx0; x <= X1; x += T) for (let z = gz0; z < Z1; z += T) {
    const a1 = alphaAt(x, z + T / 2);
    if (a1 > 0.03) seams.push({ d: scrPath([P(x, z), P(x, z + T)], false), a: a1 });
    const a2 = alphaAt(x + T / 2, z);
    if (a2 > 0.03 && x + T <= X1) seams.push({ d: scrPath([P(x, z), P(x + T, z)], false), a: a2 });
    for (const [dx, dz] of [[14, 14], [T - 14, 14], [14, T - 14], [T - 14, T - 14]]) {
      const a = alphaAt(x + dx, z + dz) * 0.75;
      if (a > 0.06) studs.push({ p: P(x + dx, z + dz), a });
    }
  }
  const shades = casters.map((c) => {
    const pts = c.corners.map(([x, y, z]) => {
      const d2 = Math.max(0, TK_FLOOR_Y - y);
      return P(x + KEYDIR.x * d2, z + KEYDIR.z * d2);
    });
    const foot = c.corners.reduce((a, q) => q[1] > a[1] ? q : a, c.corners[0]);
    const top = c.corners.reduce((a, q) => q[1] < a[1] ? q : a, c.corners[0]);
    const lift = Math.max(0, TK_FLOOR_Y - foot[1]), d = TK_FLOOR_Y - top[1];
    const mx = c.corners.reduce((a, q) => a + q[0] / c.corners.length, 0), mz = c.corners.reduce((a, q) => a + q[2] / c.corners.length, 0);
    return { d: scrPath(hull(pts)), a: P(mx, mz), b: P(mx + KEYDIR.x * d, mz + KEYDIR.z * d), op: (c.k ?? 1) * 0.62 / (1 + lift / 400) * (1 - 0.7 * stage), soft: 8 + lift / 30 };
  });
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { "data-probe": "bg", width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible", opacity: on }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("defs", { children: [
      /* @__PURE__ */ (0,jsx_runtime.jsxs)(
        "radialGradient",
        {
          id: `${id}Fl`,
          gradientUnits: "userSpaceOnUse",
          cx: f2(c0[0]),
          cy: f2(c0[1]),
          r: f2(rx),
          gradientTransform: `translate(${f2(c0[0])} ${f2(c0[1])}) scale(1 ${(ry / rx).toFixed(4)}) translate(${f2(-c0[0])} ${f2(-c0[1])})`,
          children: [
            /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: ink(0.62) }),
            /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.3", stopColor: ink(0.48) }),
            /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.62", stopColor: ink(0.32), stopOpacity: 0.85 }),
            /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: ink(0.2), stopOpacity: 0 })
          ]
        }
      ),
      shades.map((s, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Sh${k}`, gradientUnits: "userSpaceOnUse", x1: f2(s.a[0]), y1: f2(s.a[1]), x2: f2(s.b[0]), y2: f2(s.b[1]), children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: "#000000", stopOpacity: 1 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.6", stopColor: "#000000", stopOpacity: 0.45 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: "#000000", stopOpacity: 0.1 })
      ] }, k))
    ] }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: outer, fill: `url(#${id}Fl)` }),
    seams.map((s, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: s.d, stroke: TK_FLOOR_SEAM, strokeWidth: 2.4, opacity: 0.9 * s.a, fill: "none" }, k)),
    seams.map((s, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: s.d, stroke: ink(0.75), strokeWidth: 0.8, opacity: 0.18 * s.a, fill: "none", transform: "translate(0.8 1.2)" }, `l${k}`)),
    studs.map((b, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("ellipse", { cx: f2(b.p[0]), cy: f2(b.p[1]), rx: 4, ry: 2.4, fill: TK_FLOOR_BOLT, opacity: b.a }, `b${k}`)),
    shades.map((s, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: s.d, fill: `url(#${id}Sh${k})`, opacity: s.op, stroke: "#000000", strokeOpacity: 0.3, strokeWidth: s.soft, strokeLinejoin: "round" }, `s${k}`))
  ] });
};
