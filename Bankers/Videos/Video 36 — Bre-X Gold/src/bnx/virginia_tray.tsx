// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { theme } from "./theme";
import { prism, rampAt } from "./solid_engine";
import { mapPath, paintXf, rrectPts, worldScr, wound } from "./tk_rig";
import { PL_BODY, PL_GROOVE, PL_LIP, PL_PLATE, PL_RUBBER } from "./counter_mat";
import { Faces, Screw, tone, vCyl } from "./counter_plinth";
import { MAP_B, MX, NATION_PROJ, S, TRAY, UC, VC, VM_FLOOR, VM_RIG, VM_TOP, ringPath } from "./virginia_map";

const X0 = MX + (MAP_B.x0 - UC) * S - TRAY.mx, X1 = MX + (MAP_B.x1 - UC) * S + TRAY.mx;
const Z0 = (MAP_B.y0 - VC) * S - TRAY.myN, Z1 = (MAP_B.y1 - VC) * S + TRAY.myS;
const TRAY_BOX = { x0: X0, x1: X1, z0: Z0, z1: Z1 };
const TW = X1 - X0, TD = Z1 - Z0, TXC = (X0 + X1) / 2, TZC = (Z0 + Z1) / 2;
const TMAP = (q) => [TXC + q[0], VM_TOP + TRAY.H / 2 - q[2], TZC + q[1]];
const FMAP = (q) => [TXC + q[0], VM_FLOOR + q[1], TZC + q[2]];
const ID = (q) => q;
const P = (pts, close = true) => mapPath(ID, VM_RIG, pts, close);
const ts = (pts, y = VM_TOP - 0.2) => P(pts.map(([x, z]) => [x, y, z]), false);
export const trayCorners = () => {
  const out = [];
  for (const x of [X0, X1]) for (const y of [VM_TOP, VM_FLOOR]) for (const z of [Z0, Z1]) out.push([x, y, z]);
  return out;
};
export const trayFront = (x, dz = 0) => worldScr(VM_RIG, [x, VM_FLOOR, Z1 + dz]);
const BODY = wound(prism(rrectPts(TW, TD, 22, 4), TRAY.H, 4.5, 0, 0));
const FEET = wound([-1, 1].flatMap((su) => [-1, 1].flatMap((sw) => vCyl(su * (TW / 2 - 70), sw * (TD / 2 - 46), -TRAY.feet, 0, 16, 0, 0))));
const built = (() => {
  const painted = paintXf(BODY, TMAP, VM_RIG, 0.55);
  const top = painted.find((d) => d.face.cap && d.face.n[2] > 0.5);
  const walls = painted.filter((d) => d !== top);
  const ty = VM_TOP - 0.2;
  const g0 = worldScr(VM_RIG, [X0, ty, Z0]), g1 = worldScr(VM_RIG, [X1, ty, Z1]);
  const groove = P(rrectPts(TW - 30, TD - 30, 14, 4).map(([u, v]) => [TXC + u, ty, TZC + v]));
  const lip = P(rrectPts(TW - 27, TD - 27, 15, 4).map(([u, v]) => [TXC + u, ty, TZC + v]));
  const m = (u, v) => [MX + (u - UC) * S, (v - VC) * S];
  const zEdge = Z1 - 15;
  const ak = ts([[X0 + 15, m(0, 448)[1]], m(209, 448), [m(209, 0)[0], zEdge]]);
  const hi = ts([m(209, 514), m(343, 514), [m(343, 0)[0], zEdge]]);
  const brush = [];
  for (let y = VM_TOP + 4; y < VM_TOP + TRAY.H - 4; y += 3.2) brush.push(P([[X0 + 26, y, Z1 + 0.3], [X1 - 26, y, Z1 + 0.3]], false));
  const tb = [];
  for (let z = Z0 + 24; z < Z1 - 20; z += 9) tb.push(ts([[X0 + 26, z], [X1 - 26, z]]));
  const screws = [[X0 + 22, ty, Z0 + 22], [X1 - 22, ty, Z0 + 22], [X0 + 22, ty, Z1 - 22], [X1 - 22, ty, Z1 - 22]];
  const coast = NATION_PROJ.map((r) => ringPath(r, -0.1)).join("");
  return { top, walls, g0, g1, groove, lip, ak, hi, brush, tb, screws, coast };
})();
export const VmTray = ({ id }) => {
  const b = built;
  const fl = b.top ? b.top.light : 0.5;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(
    "svg",
    {
      "data-probe-object": "the map tray: rubber feet, a chamfered graphite body, its top's groove, screws, Alaska and Hawaii inset frames and coastal contours",
      width: 1,
      height: 1,
      style: { position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" },
      children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0,jsx_runtime.jsxs)("linearGradient", { id: `${id}Top`, gradientUnits: "userSpaceOnUse", x1: b.g0[0].toFixed(1), y1: b.g0[1].toFixed(1), x2: b.g1[0].toFixed(1), y2: b.g1[1].toFixed(1), children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0", stopColor: rampAt(PL_PLATE, 0.62 * fl + 0.2) }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "0.45", stopColor: rampAt(PL_PLATE, 0.62 * fl + 0.08) }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("stop", { offset: "1", stopColor: rampAt(PL_PLATE, 0.62 * fl - 0.02) })
        ] }) }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)(Faces, { faces: FEET, map: FMAP, rig: VM_RIG, ramp: () => PL_RUBBER, spec: 0.2 }),
        b.walls.map((dw, k) => {
          const c = tone(PL_BODY, dw);
          return /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, `w${k}`);
        }),
        b.brush.map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: k % 2 ? "#000000" : "#ffffff", strokeOpacity: 0.04, strokeWidth: 1, fill: "none" }, `b${k}`)),
        b.top && /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: b.top.d, fill: `url(#${id}Top)` }),
        b.tb.map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, stroke: k % 3 ? "#000000" : "#ffffff", strokeOpacity: 0.035, strokeWidth: 1, fill: "none" }, `t${k}`)),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: b.lip, fill: "none", stroke: PL_LIP, strokeWidth: 1, opacity: 0.22 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: b.groove, fill: "none", stroke: PL_GROOVE, strokeWidth: 2, opacity: 0.85 }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: b.coast, fill: "none", stroke: "#ffffff", strokeOpacity: 0.035, strokeWidth: 34, strokeLinejoin: "round" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: b.coast, fill: "none", stroke: "#ffffff", strokeOpacity: 0.045, strokeWidth: 18, strokeLinejoin: "round" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: b.coast, fill: "none", stroke: "#000000", strokeOpacity: 0.5, strokeWidth: 5, strokeLinejoin: "round" }),
        [b.ak, b.hi].map((d, k) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("g", { children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, fill: "none", stroke: PL_LIP, strokeWidth: 1, opacity: 0.2, transform: "translate(0.8,1)" }),
          /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d, fill: "none", stroke: PL_GROOVE, strokeWidth: 1.8, opacity: 0.85 })
        ] }, `i${k}`)),
        b.screws.map((c, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)(Screw, { id: `${id}s${k}`, map: ID, rig: VM_RIG, c, r: 5.5, plane: "top", slot: [25, -35, 60, 5][k] }, `s${k}`))
      ]
    }
  );
};
const KEYDIR = { x: 0.5, z: -0.62 };
const SHADE = (() => {
  const hgt = TRAY.H + TRAY.feet;
  const at = (g, dx, dz) => P(rrectPts(TW + 2 * g, TD + 2 * g, 22 + g, 4).map(([u, v]) => [TXC + dx + u, VM_FLOOR, TZC + dz + v]));
  const drop = [4, 10, 18, 28, 40].map((g, k) => ({ d: at(g, KEYDIR.x * hgt, KEYDIR.z * hgt), op: [0.07, 0.05, 0.035, 0.022, 0.012][k] }));
  const contact = [1, 4, 9].map((g, k) => ({ d: at(g, 0, 0), op: [0.16, 0.07, 0.035][k] }));
  return [...drop, ...contact];
})();
export const VmShade = () => /* @__PURE__ */ (0,jsx_runtime.jsx)("svg", { "data-probe": "bg", width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }, children: SHADE.map((s, k) => /* @__PURE__ */ (0,jsx_runtime.jsx)("path", { d: s.d, fill: theme.textOnLight, opacity: s.op }, k)) });
