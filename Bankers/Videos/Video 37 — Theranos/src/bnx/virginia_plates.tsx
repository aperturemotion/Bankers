// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { theme } from "./theme";
import { rampAt } from "./solid_engine";
import { paintXf, scrPath, worldScr, wound } from "./tk_rig";
import { MAP_B, PLATE, VA_INDEX, VA_REST_PROJ, VA_SOLID, VM_ORDER, VM_PROJ, VM_RIG, VM_STATES, mapW, ringPath } from "./virginia_map";
import { VM_LIP, VM_PLATE, VM_SEAM, VM_VA } from "./virginia_mat";

export const VA_COL = 80;
const NB = 4;
const G0 = worldScr(VM_RIG, mapW(MAP_B.x0, MAP_B.y0, PLATE)), G1 = worldScr(VM_RIG, mapW(MAP_B.x1, MAP_B.y1, PLATE));
const step = (c, dim, stage) => dim <= 1e-3 ? c : mixHex(mixHex(c, "#000000", 0.35 * dim * (1 - stage)), theme.bgLight, 0.3 * dim * stage);
const Plate = ({ id, i, h, lit, dim, stage, wallOnly }) => {
  const st = VM_STATES[i], pr = VM_PROJ[i];
  const hh = Math.max(0, h);
  const walls = [];
  if (hh > 0.4) {
    for (let j = 0; j < NB; j++) {
      const y = hh * j / NB, c = step(rampAt(VM_PLATE, 0.1 + 0.26 * j / NB), dim, stage);
      const d = pr.wall.map((r) => ringPath(r, y)).join("");
      walls.push(/* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, fill: c, stroke: c, strokeWidth: hh / NB * 0.95 + 0.9, strokeLinejoin: "round" }, `w${j}`));
    }
    const lip = step(VM_LIP, dim, stage);
    if (!wallOnly) walls.push(/* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: pr.face.map((r) => ringPath(r, hh - Math.min(2, hh * 0.3))).join(""), fill: lip }, "lip"));
  }
  if (wallOnly) return /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: walls });
  const l = 0.62 + 0.06 * (st.seed - 0.5) + lit;
  const face = pr.face.map((r) => ringPath(r, hh)).join("");
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}F${i}`, gradientUnits: "userSpaceOnUse", x1: G0[0].toFixed(1), y1: G0[1].toFixed(1), x2: G1[0].toFixed(1), y2: G1[1].toFixed(1), children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: step(rampAt(VM_PLATE, l), dim, stage) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.55", stopColor: step(rampAt(VM_PLATE, l - 0.13), dim, stage) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: step(rampAt(VM_PLATE, l - 0.2), dim, stage) })
    ] }) }),
    walls,
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: face, fill: `url(#${id}F${i})`, stroke: VM_SEAM, strokeWidth: 1.1, strokeOpacity: 0.85, strokeLinejoin: "round" })
  ] });
};
const VMAP = (q) => mapW(q[0], q[1], q[2]);
const colWalls = (w0, w1) => {
  const p = VA_SOLID, n = p.length, F = [];
  for (let k = 0; k < n; k++) {
    const a = p[k], b = p[(k + 1) % n], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const out = [(b[1] - a[1]) / l, -(b[0] - a[0]) / l, 0];
    F.push({ pts: [[a[0], a[1], w1], [b[0], b[1], w1], [b[0], b[1], w0], [a[0], a[1], w0]], n: out, pass: 0, mat: k });
  }
  return wound(F);
};
const scr = (u, v, w) => worldScr(VM_RIG, mapW(u, v, w));
const VA_C = VM_STATES[VA_INDEX].c;
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
const KEYDIR = { x: 0.5, z: -0.62 };
export const vaLevelAt = (w) => {
  const p = scr(VA_C[0], VA_C[1] + 14, w);
  return { x: p[0], y: p[1] };
};
export const vaTopAt = (h) => {
  const p = scr(VA_C[0], VA_C[1], h);
  return { x: p[0], y: p[1] };
};
const VaColumn = ({ id, va }) => {
  const H = va.h, w0 = PLATE;
  const dws = paintXf(colWalls(w0, H), VMAP, VM_RIG, 0.6);
  const fw = Math.max(w0, Math.min(H, va.fill * VA_COL)), ringW = va.ringAt * VA_COL;
  const fb = scr(VA_C[0], VA_C[1], w0), ft = scr(VA_C[0], VA_C[1], fw);
  const d = H - w0;
  const sh = hull(VA_SOLID.flatMap(([u, v]) => {
    const a = mapW(u, v, w0);
    return [worldScr(VM_RIG, a), worldScr(VM_RIG, [a[0] + KEYDIR.x * d, a[1], a[2] + KEYDIR.z * d])];
  }));
  const s0 = scr(VA_C[0], VA_C[1], w0), s1 = worldScr(VM_RIG, ((a) => [a[0] + KEYDIR.x * d, a[1], a[2] + KEYDIR.z * d])(mapW(VA_C[0], VA_C[1], w0)));
  const crown = VA_SOLID.map(([u, v]) => scr(u, v, H));
  const lipP = VA_SOLID.map(([u, v]) => scr(u, v, H - 2.2));
  const c0 = scr(VA_C[0] - 70, VA_C[1] - 40, H), c1 = scr(VA_C[0] + 70, VA_C[1] + 40, H);
  const g = va.glint;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("defs", { children: [
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Sh`, gradientUnits: "userSpaceOnUse", x1: s0[0].toFixed(1), y1: s0[1].toFixed(1), x2: s1[0].toFixed(1), y2: s1[1].toFixed(1), children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: "#000000", stopOpacity: 0.42 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.6", stopColor: "#000000", stopOpacity: 0.2 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: "#000000", stopOpacity: 0 })
      ] }),
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Fill`, gradientUnits: "userSpaceOnUse", x1: fb[0].toFixed(1), y1: fb[1].toFixed(1), x2: ft[0].toFixed(1), y2: Math.min(fb[1] - 1, ft[1]).toFixed(1), children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: mixHex(theme.accentDeep, theme.accent, 0.55) }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.5", stopColor: theme.accent }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.92", stopColor: mixHex(theme.accent, theme.accentBright, 0.7) }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: theme.accentBright })
      ] }),
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Cap`, gradientUnits: "userSpaceOnUse", x1: c0[0].toFixed(1), y1: c0[1].toFixed(1), x2: c1[0].toFixed(1), y2: c1[1].toFixed(1), children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: rampAt(VM_VA, 0.6) }),
        g > 2e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: Math.max(0, g * 1.3 - 0.25).toFixed(3), stopColor: rampAt(VM_VA, 0.52) }),
        g > 2e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: clamp01(g * 1.3 - 0.15).toFixed(3), stopColor: mixHex(rampAt(VM_VA, 0.52), rampAt(VM_VA, 0.95), Math.sin(Math.PI * g)) }),
        g > 2e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: clamp01(g * 1.3 - 0.05).toFixed(3), stopColor: rampAt(VM_VA, 0.48) }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: rampAt(VM_VA, 0.4) })
      ] })
    ] }),
    d > 1 && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: scrPath(sh), fill: `url(#${id}Sh)` }),
    dws.map((dw, k) => {
      const c = rampAt(VM_VA, 0.62 * dw.light + 0.02);
      const a = dw.face.pts[0], b = dw.face.pts[1];
      const q = (w) => [scr(a[0], a[1], w), scr(b[0], b[1], w)];
      const top = q(fw), bot = q(w0);
      return /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }),
        fw > w0 + 0.3 && /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: scrPath([top[0], top[1], bot[1], bot[0]]), fill: `url(#${id}Fill)`, stroke: `url(#${id}Fill)`, strokeWidth: 0.6 }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: scrPath([top[0], top[1], bot[1], bot[0]]), fill: "#000000", opacity: 0.3 * (1 - clamp01(dw.light * 1.4)) }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: scrPath(top, false), stroke: theme.accentBright, strokeWidth: 2.6, strokeLinecap: "round", fill: "none" })
        ] }),
        va.ring > 3e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: scrPath(q(ringW), false), stroke: fw > ringW ? theme.accentBright : rampAt(VM_VA, 0.9), strokeWidth: 2, strokeDasharray: "7 5", fill: "none", opacity: va.ring })
      ] }, k);
    }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: scrPath(lipP), fill: mixHex(VM_LIP, rampAt(VM_VA, 1), va.crown), stroke: mixHex(VM_LIP, rampAt(VM_VA, 1), va.crown), strokeWidth: 1.4, strokeLinejoin: "round" }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: scrPath(crown), fill: `url(#${id}Cap)`, stroke: VM_LIP, strokeWidth: 1.2, strokeOpacity: 0.75, strokeLinejoin: "round" })
  ] });
};
export const VmPlates = ({ id, h, lit, dim, stage, va }) => {
  const column = va.h > PLATE + 0.5;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(
    "svg",
    {
      "data-probe-object": "the state plates (walls, lit chamfer, polished face, border seams) and Virginia's column (walls, fill, U.S. ring, crown)",
      width: 1,
      height: 1,
      style: { position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" },
      children: [
        VM_ORDER.map((i) => {
          if (i !== VA_INDEX) return /* @__PURE__ */ (0,jsx_runtime.jsx)(Plate, { id, i, h: h[i], lit: lit[i], dim, stage }, i);
          if (!column) return /* @__PURE__ */ (0,jsx_runtime.jsx)(Plate, { id, i, h: h[i], lit: lit[i], dim: 0, stage }, i);
          return /* @__PURE__ */ (0,jsx_runtime.jsx)(Plate, { id, i, h: PLATE, lit: 0, dim: 0, stage, wallOnly: true }, i);
        }),
        column && VA_REST_PROJ.map((r, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: ringPath(r, PLATE), fill: rampAt(VM_VA, 0.55), stroke: VM_SEAM, strokeWidth: 1 }, `vr${k}`)),
        column && /* @__PURE__ */ (0,jsx_runtime.jsx)(VaColumn, { id: `${id}va`, va })
      ]
    }
  );
};
