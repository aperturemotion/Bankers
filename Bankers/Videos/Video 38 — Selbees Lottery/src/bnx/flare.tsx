// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rInOut } from "./anim";

const FLARE_INK = {
  amber: "#e2b25c",
  amberCore: "#DFEBF8",
  blue: "#6E86E6",
  blueCore: "#c3cfff",
  green: "#5492DA",
  orange: "#d98f4a",
  ring: "#b98552"
};
const W = 1080, H = 1920, C = { x: W / 2, y: H / 2 };
const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${clamp01(a).toFixed(3)})`;
};
const smooth = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const GHOSTS = [
  { k: 0.35, r: 5, kind: "dot", c: "#ffffff", op: 0.55 },
  { k: 1.1, r: 12, kind: "dot", c: FLARE_INK.amber, core: FLARE_INK.amberCore, op: 0.95 },
  { k: 1.3, r: 11, kind: "dot", c: FLARE_INK.blue, core: FLARE_INK.blueCore, op: 0.9, sy: 1.5 },
  { k: 1.25, r: 235, kind: "ring", c: FLARE_INK.ring, op: 0.1 },
  { k: 1.9, r: 58, kind: "disk", c: FLARE_INK.green, op: 0.24 },
  { k: 2.4, r: 8, kind: "dot", c: FLARE_INK.orange, op: 0.65 }
];
const bloomBg = (at, R, a) => {
  const stops = [];
  for (let i = 0; i <= 12; i++) {
    const s = i / 12;
    const I = Math.pow(1 - s * s, 2.4);
    const cool = smooth(0.15, 0.95, s);
    const c = [255 - 59 * cool, 255 - 51 * cool, 255 - 15 * cool].map((v) => v.toFixed(0)).join(",");
    stops.push(`rgba(${c},${clamp01(a * I).toFixed(3)}) ${(s * 100).toFixed(1)}%`);
  }
  return `radial-gradient(circle ${R.toFixed(0)}px at ${at}, ${stops.join(", ")})`;
};
const ghostBg = (g) => g.kind === "dot" ? `radial-gradient(circle, ${g.core ?? g.c} 0%, ${g.core ?? g.c} 22%, ${g.c} 42%, ${rgba(g.c, 0.45)} 62%, transparent 78%)` : g.kind === "disk" ? `radial-gradient(circle, ${rgba(g.c, 0.5)} 0%, ${rgba(g.c, 0.55)} 66%, ${rgba(g.c, 0.95)} 84%, transparent 94%)` : `radial-gradient(circle, transparent 52%, ${rgba(g.c, 0.7)} 70%, ${rgba(g.c, 0.35)} 82%, transparent 96%)`;
export const LensFlare = ({
  peak,
  from,
  to,
  grow = FLARE_T.grow,
  hold = FLARE_T.hold,
  recede = FLARE_T.recede,
  stage = 0,
  ghost = 1
}) => {
  const f = (0,esm.useCurrentFrame)();
  if (f < peak - grow - 1 || f > peak + hold + recede + 1) return null;
  const g = rInOut(f, peak - grow, peak);
  const q = rInOut(f, peak + hold, peak + hold + recede);
  const L = flareLevel(f, peak, grow, hold, recede);
  const on = Math.min(g, 1 - q);
  if (on <= 2e-3) return null;
  const u = clamp01((f - (peak - grow)) / grow);
  const onset = Math.min(smooth(0, 0.3, u), 1 - q);
  const swap = rInOut(f, peak - 1, peak + hold + 1);
  const S = lerp(lerp(from, C, 0.12 * g), lerp(to, C, 0.15 * (1 - q)), swap);
  const R = 20 + 2400 * Math.sqrt(L);
  const a = smooth(0, 0.05, L);
  const white = smooth(0.6, 1, L);
  const ghostEnv = onset * (1 - smooth(0.62 + 0.12 * clamp01(ghost - 1), 0.92, L)) * (1 - 0.85 * clamp01(stage));
  const haze = 0.5 * (1 - 0.7 * clamp01(stage)) * (0.3 * smooth(0, 1, on) + 0.7 * L);
  const scatter = 5 * smooth(0.05, 0.8, L) * (1 - clamp01(stage));
  const at = `${S.x.toFixed(1)}px ${S.y.toFixed(1)}px`;
  const pr = 16 + 46 * Math.sqrt(L);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe": "bg", style: { position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }, children: [
    scatter > 0.05 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, backdropFilter: `blur(${scatter.toFixed(2)}px)` } }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
      position: "absolute",
      inset: 0,
      mixBlendMode: "screen",
      background: `radial-gradient(circle ${(R * 1.6 + 60).toFixed(0)}px at ${at}, rgba(202,221,243,${(0.5 * haze).toFixed(3)}) 0%, rgba(132,140,178,${(0.3 * haze).toFixed(3)}) 45%, rgba(0,67,144,${(0.2 * haze).toFixed(3)}) 100%)`
    } }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, mixBlendMode: "screen", background: bloomBg(at, R, a) } }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: S.x, top: S.y, width: 0, height: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
      position: "absolute",
      left: -pr,
      top: -pr,
      width: 2 * pr,
      height: 2 * pr,
      borderRadius: "50%",
      opacity: onset,
      mixBlendMode: "screen",
      background: "radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0.95) 22%, rgba(230,239,250,0.5) 50%, rgba(200,210,250,0.15) 72%, transparent 100%)"
    } }) }),
    ghostEnv > 4e-3 && GHOSTS.map((gh, i) => {
      const P = { x: C.x + gh.k * (C.x - S.x), y: C.y + gh.k * (C.y - S.y) };
      const sy = gh.sy ?? 1;
      return /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
        position: "absolute",
        left: P.x - gh.r,
        top: P.y - gh.r * sy,
        width: 2 * gh.r,
        height: 2 * gh.r * sy,
        borderRadius: "50%",
        opacity: Math.min(1, gh.op * ghost) * ghostEnv,
        mixBlendMode: "screen",
        background: ghostBg(gh),
        filter: gh.kind === "dot" ? `drop-shadow(0 0 ${(gh.r * 0.9).toFixed(1)}px ${rgba(gh.c, 0.7)})` : gh.kind === "ring" ? "blur(6px)" : "blur(1.5px)"
      } }, i);
    }),
    white > 2e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
      position: "absolute",
      inset: 0,
      opacity: white,
      background: `radial-gradient(circle 1500px at ${at}, #ffffff 0%, #ffffff 68%, #E2EDF9 100%)`
    } })
  ] });
};
export const FLARE_T = { grow: 41, hold: 4, recede: 32 };
export const flareLevel = (f, peak, grow = FLARE_T.grow, hold = FLARE_T.hold, recede = FLARE_T.recede) => {
  const u = clamp01((f - (peak - grow)) / grow);
  const v = clamp01((f - (peak + hold)) / recede);
  return Math.max(0, Math.min(Math.pow(smooth(0, 1, u), 1.4), Math.pow(1 - smooth(0, 1, v), 1.2)));
};
