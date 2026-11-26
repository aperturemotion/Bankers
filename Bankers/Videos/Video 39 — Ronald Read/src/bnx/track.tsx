// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, drift2, mixHex, rIn, rOut } from "./anim";
import { theme } from "./theme";
import { ACCENT, VOICE } from "./fonts";

const PERSPECTIVE = 1500;
const ACCENT_GRAD = (/* unused pure expression or super */ null && (`linear-gradient(175deg, #ffffff 6%, ${theme.accentBright} 30%, ${theme.accent} 62%, #1D70CE 96%)`));
const ACCENT_STOPS_DARK = ["#ffffff", theme.accentBright, theme.accent, "#1D70CE"];
const ACCENT_STOPS_LIGHT = (/* unused pure expression or super */ null && (["#002F64", "#005DC8", "#1D70CE", "#4D8ED9"]));
const accentInk = (ink) => mixHex("#9DC1EC", "#0B63C9", clamp01(ink));
const accentGrad = (ink) => ink <= 0 ? ACCENT_GRAD : `linear-gradient(175deg, ${ACCENT_STOPS_DARK.map((c, i) => `${mixHex(c, ACCENT_STOPS_LIGHT[i], ink)} ${[6, 30, 62, 96][i]}%`).join(", ")})`;
const GAP = 0.5;
const DESC_CLEAR = 0.42;
let ctx2d = null;
const metrics = (ln, text) => {
  ctx2d = ctx2d ?? document.createElement("canvas").getContext("2d");
  const c = ctx2d;
  c.font = `${ln.accent ? "italic " : ""}${ln.weight} ${ln.size}px ${ln.accent ? ACCENT : VOICE}`;
  const m = c.measureText(text);
  return { inkA: m.actualBoundingBoxAscent, inkD: m.actualBoundingBoxDescent, fa: m.fontBoundingBoxAscent, fd: m.fontBoundingBoxDescent };
};
const layout = (words, lines) => {
  const ms = lines.map((ln) => metrics(ln, ln.idx.map((i) => words[i].word).join(" ")));
  const base = [];
  lines.forEach((ln, i) => {
    base.push(i === 0 ? 0 : base[i - 1] + Math.max(GAP * lines[i - 1].size, ms[i - 1].inkD + DESC_CLEAR * lines[i - 1].size) + ms[i].inkA);
  });
  const inkTop = base[0] - ms[0].inkA, inkBottom = base[base.length - 1] + ms[ms.length - 1].inkD;
  const c = (inkTop + inkBottom) / 2;
  return lines.map((ln, i) => {
    const m = ms[i];
    const baseline = base[i] - c;
    const top = baseline - ((ln.size - (m.fa + m.fd)) / 2 + m.fa);
    return { ln, top, baseline, inkBottom: baseline + m.inkD };
  });
};
const trackBottom = (words, lines, y, dolly, lift) => {
  const rows = layout(words, lines);
  const last = rows[rows.length - 1];
  const s = PERSPECTIVE / Math.max(1, PERSPECTIVE - (dolly + last.ln.z));
  return y + last.inkBottom * s * 1.06 - lift;
};
export const TrackText = ({ words, lines, y, dolly, hold, end, lift = 0, ink = 0 }) => {
  var _a;
  const f = (0,esm.useCurrentFrame)();
  const first = ((_a = words[0]) == null ? void 0 : _a.at) ?? 0;
  if (f < first - 4) return null;
  const out = 1 - rIn(f, end - 9, end);
  if (out <= 1e-3) return null;
  const yaw = -17 + 14 * hold + drift2(f, 173, 67, 1.2);
  const pitch = 10 - 7 * hold + drift2(f + 40, 151, 59, 0.8);
  const track = -0.01 + 0.065 * hold;
  const rows = layout(words, lines);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, opacity: out, transform: lift ? "translateY(" + (-lift).toFixed(1) + "px)" : void 0, perspective: PERSPECTIVE, perspectiveOrigin: `540px ${y}px` }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
    position: "absolute",
    left: 0,
    top: y,
    width: 1080,
    height: 0,
    transformStyle: "preserve-3d",
    transform: `translateZ(${dolly.toFixed(1)}px) rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg)`
  }, children: rows.map(({ ln, top: t }, li) => /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
    position: "absolute",
    left: 0,
    width: 1080,
    top: t,
    height: ln.size,
    textAlign: "center",
    transformStyle: "preserve-3d",
    transform: `translateZ(${ln.z}px)`,
    fontSize: ln.size,
    lineHeight: `${ln.size}px`,
    whiteSpace: "nowrap",
    color: ink <= 0 ? "#ffffff" : mixHex("#ffffff", "#001C3C", ink),
    fontFamily: ln.accent ? ACCENT : VOICE,
    fontWeight: ln.weight,
    fontStyle: ln.accent ? "italic" : void 0,
    letterSpacing: `${track.toFixed(4)}em`
  }, children: ln.idx.map((i, k) => {
    const w = words[i];
    const p = rOut(f, w.at - 3, w.at + 15);
    const vis = clamp01(p * 1.6);
    if (vis <= 1e-3) {
      return /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { style: { display: "inline-block", opacity: 0, marginRight: k < ln.idx.length - 1 ? ln.size * 0.28 : 0, ...ln.accent ? { padding: "0 0.08em" } : {} }, children: w.word }, i);
    }
    return /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { style: {
      display: "inline-block",
      opacity: vis,
      transform: `translateZ(${(-(ln.fly ?? 900) * (1 - p)).toFixed(1)}px)`,
      filter: p < 0.99 ? `blur(${((1 - p) * 9).toFixed(2)}px)` : void 0,
      marginRight: k < ln.idx.length - 1 ? ln.size * 0.28 : 0
    }, children: ln.accent ? /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { style: { display: "inline-block", color: accentInk(ink), padding: "0.15em 0.08em 0.35em", margin: "-0.15em 0 -0.35em" }, children: w.word }) : w.word }, i);
  }) }, li)) }) });
};
