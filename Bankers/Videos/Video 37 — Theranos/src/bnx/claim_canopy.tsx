// @ts-nocheck
// Video 36 "Bre-X Gold" — the jungle, IMPLIED BY THE LIGHT ONLY (builder B, 2026-11-23): the key light falls through a canopy that
//   is never shown. On the pad's floor: soft dapples of light, the shadows of palm fronds and of a few hanging vines, all swaying
//   slowly (moving from the first frame). Everything is projected onto the floor plane by the place's rig and lives in the field
//   layer (data-probe="bg"): it is light, not an object, and never rises into the caption band.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { theme } from "./theme";
import { worldScr } from "./tk_rig";
import { TK_FLOOR_Y } from "./tk_slab";
import { f2 } from "./claim_kit";

const jsx = jsx_runtime.jsx, jsxs = jsx_runtime.jsxs;
const P = (rig, x, z) => worldScr(rig, [x, TK_FLOOR_Y - 0.5, z]);
const pathOf = (pts) => `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}Z`;
/** a palm frond's shadow on the floor: a curved rachis with leaflets either side (world x, z), swaying about its base */
const frond = (rig, base, ang, len, sway, k) => {
  const pts = [], L = [], R = [];
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const s = i / n, a = ang + sway * s * s + 0.35 * s * Math.sign(k - 0.5);
    pts.push([base[0] + Math.cos(a) * len * s, base[1] + Math.sin(a) * len * s, a]);
  }
  const leaf = [];
  for (let i = 2; i < n; i++) {
    const [x, z, a] = pts[i], s = i / n, w = len * (0.2 + 0.16 * Math.sin(Math.PI * s)), b = 0.42 + 0.25 * s;
    for (const side of [-1, 1]) {
      const la = a + side * (Math.PI / 2 - b);
      const tip = [x + Math.cos(la) * w + Math.cos(a) * w * 0.35, z + Math.sin(la) * w + Math.sin(a) * w * 0.35];
      const nx = pts[i + 1] ?? pts[i];
      leaf.push(pathOf([P(rig, x, z), P(rig, tip[0], tip[1]), P(rig, (x + nx[0]) / 2 + Math.cos(la) * 6, (z + nx[1]) / 2 + Math.sin(la) * 6)]));
    }
  }
  const spine = pts.map(([x, z]) => P(rig, x, z));
  return { leaf, spine: `M${spine.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}` };
};
/** the canopy's light on the floor around `at` (world x, z); gust 0…1 sways the fronds harder; on fades the whole */
export const CanopyFloor = ({ id, rig, f, at, reach = 1400, gust = 0, on = 1, stage = 0 }) => {
  if (on <= 3e-3) return null;
  const sw = (p, a) => a * Math.sin(f / p * 2 * Math.PI);
  const g = 1 + 1.6 * gust;
  // sun-flecks: small irregular spots of light where the canopy opens (a seeded field, each drifting on its own)
  let sd = 77;
  const rr = () => (sd = sd * 16807 % 2147483647) / 2147483647;
  const spots = Array.from({ length: 30 }, (_, k) => {
    const x = (rr() - 0.5) * 2.2, z = (rr() - 0.5) * 1.4, r = 0.012 + 0.03 * rr() ** 2, e = 0.6 + 0.5 * rr(), ph = rr() * 6;
    const cx = at.x + x * reach + sw(170 + 13 * (k % 7), 10 * g) + 6 * Math.sin(f / 60 + ph), cz = at.z + z * reach + sw(131 + 11 * (k % 5), 7 * g);
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = i / 10 * 2 * Math.PI, q = r * reach * (1 + 0.25 * Math.sin(3 * a + ph));
      return P(rig, cx + q * Math.cos(a), cz + q * Math.sin(a) * e);
    });
    return { d: pathOf(pts), op: 0.07 + 0.12 * rr() };
  });
  const fronds = [
    [-0.75, -0.55, 0.35, 0.55, 0.1], [0.55, -0.6, 2.4, 0.5, 0.8], [-0.1, 0.5, -0.6, 0.42, 0.3], [0.95, 0.35, 3.6, 0.45, 0.6]
  ].map(([x, z, a, l, k], i) => frond(rig, [at.x + x * reach, at.z + z * reach], a + sw(190 + 29 * i, 0.05 * g), l * reach, sw(150 + 21 * i, 0.12 * g), k));
  const vines = [[-0.35, -0.7], [0.25, -0.75], [0.62, -0.5]].map(([x, z], i) => {
    const pts = Array.from({ length: 22 }, (_, j) => {
      const s = j / 21;
      return P(rig, at.x + x * reach + 0.5 * reach * s + sw(160 + 17 * i, 18 * g) * s + 22 * Math.sin(s * 7 + i), at.z + z * reach + 0.9 * reach * s);
    });
    return `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}`;
  });
  const shade = mixHex("#000000", theme.bgLight, 0.7 * stage), lit = mixHex("#A9C6EA", "#FFFFFF", 0.3);
  return /* @__PURE__ */ jsxs("svg", { "data-probe": "bg", width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible", opacity: clamp01(on) }, children: [
    /* @__PURE__ */ jsxs("defs", { children: [
      /* @__PURE__ */ jsx("filter", { id: `${id}b1`, x: "-50%", y: "-50%", width: "200%", height: "200%", children: /* @__PURE__ */ jsx("feGaussianBlur", { stdDeviation: 5 }) }),
      /* @__PURE__ */ jsx("filter", { id: `${id}b2`, x: "-20%", y: "-20%", width: "140%", height: "140%", children: /* @__PURE__ */ jsx("feGaussianBlur", { stdDeviation: 2.6 }) })
    ] }),
    /* @__PURE__ */ jsx("g", { filter: `url(#${id}b1)`, children: spots.map((sp, k) => /* @__PURE__ */ jsx("path", { d: sp.d, fill: lit, opacity: sp.op }, k)) }),
    /* @__PURE__ */ jsxs("g", { filter: `url(#${id}b2)`, opacity: 0.5, children: [
      fronds.map((fr, k) => /* @__PURE__ */ jsxs("g", { children: [
        fr.leaf.map((d, i) => /* @__PURE__ */ jsx("path", { d, fill: shade }, i)),
        /* @__PURE__ */ jsx("path", { d: fr.spine, stroke: shade, strokeWidth: 5, fill: "none" })
      ] }, k)),
      vines.map((d, k) => /* @__PURE__ */ jsx("path", { d, stroke: shade, strokeWidth: 4, fill: "none", strokeLinecap: "round" }, `v${k}`))
    ] })
  ] });
};
