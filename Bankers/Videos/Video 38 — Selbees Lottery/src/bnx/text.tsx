// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import * as react from "react";
import { clamp01, mixHex, rInOut, rOut } from "./anim";
import { LAYOUT, TYPE, theme } from "./theme";
import { ACCENT, DISPLAY_TEXT, VOICE } from "./fonts";

export const WordCaption = ({ words, y = LAYOUT.captionY, size = TYPE.captionSize, onLight = 0, fade = 0, accentAt }) => {
  const f = (0,esm.useCurrentFrame)();
  const cur = words.find((w, i) => {
    var _a;
    const end = w.until ?? ((_a = words[i + 1]) == null ? void 0 : _a.at) ?? Infinity;
    return f >= w.at && f < end;
  });
  if (!cur) return null;
  const a = fade > 0 ? rOut(f, cur.at, cur.at + fade) : 1;
  const col = mixHex("#ffffff", theme.textOnLight, clamp01(onLight));
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(
    "div",
    {
      "data-probe": "caption",
      style: {
        position: "absolute",
        left: 0,
        width: "100%",
        top: y,
        transform: "translateY(-50%)",
        textAlign: "center",
        fontFamily: VOICE,
        fontWeight: 400,
        fontSize: size,
        letterSpacing: TYPE.trackingCaption,
        color: col,
        opacity: a
        // ★ deliberately NO textShadow — measured flat
      },
      children: cur.parts && accentAt && cur.parts.some((p) => accentAt.has(p.at)) ? cur.parts.map((p, i) => /* @__PURE__ */ (0,jsx_runtime.jsxs)(react.Fragment, { children: [
        i > 0 ? " " : null,
        accentAt.has(p.at) ? /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { style: { fontFamily: ACCENT, fontStyle: "italic", fontWeight: 400, fontSize: `${ACCENT_SIZE_CAPTION}em`, lineHeight: 0, letterSpacing: 0 }, children: p.word }) : p.word
      ] }, i)) : cur.word
    }
  );
};
const LADDER_LO = 0.84;
const LADDER_HI = 1.2;
const EMPH_SIZE = 1.15;
const ACCENT_SIZE = 1.32;
const ACCENT_SIZE_CAPTION = 1.28;
const ACCENT_ADV = 1.18;
const ACCENT_GRADS = {
  red: "linear-gradient(175deg, #ff6a5e 8%, #ef2b3d 52%, #99101f 96%)",
  // ★ V9's accent gradient is a POLISHED-METAL ramp, not a hue: bright specular at the top,
  // the platinum token through the middle, a cold graphite foot. On a neutral palette the
  // gradient has to do its work with value alone, so the spread is much wider than the green
  // one's was — a narrow neutral ramp just reads as flat grey type.
  accent: `linear-gradient(175deg, #ffffff 6%, ${theme.accentBright} 30%, ${theme.accent} 62%, #247BE0 96%)`,
  white: null
};
const ADV = {
  " ": 0.28,
  i: 0.26,
  l: 0.26,
  j: 0.26,
  I: 0.28,
  t: 0.36,
  f: 0.34,
  r: 0.38,
  ".": 0.28,
  ",": 0.28,
  "'": 0.2,
  "\u2019": 0.2,
  "!": 0.28,
  ":": 0.28,
  ";": 0.28,
  "?": 0.5,
  m: 0.87,
  w: 0.76,
  M: 0.86,
  W: 0.88,
  "%": 0.85,
  "$": 0.58,
  "-": 0.36
};
const advance = (c) => {
  const a = ADV[c];
  if (a !== void 0) return a;
  if (c >= "0" && c <= "9") return 0.58;
  if (c >= "A" && c <= "Z") return 0.66;
  return 0.55;
};
const textW = (s, size) => [...s].reduce((a, c) => a + advance(c), 0) * size;
const rung = (i, n) => n <= 1 ? 1 : LADDER_LO + (LADDER_HI - LADDER_LO) * (i / (n - 1));
const wrapAt = (words, size, n, mul, colW) => {
  const lines = [];
  let cur = [];
  let curW = 0;
  const sizeOf = (li) => size * rung(Math.min(li, Math.max(n - 1, 0)), n);
  for (let i = 0; i < words.length; i++) {
    const ls = sizeOf(lines.length);
    const ws = textW(words[i].word, ls * mul(i));
    const gap = cur.length ? ls * 0.3 : 0;
    if (cur.length && curW + gap + ws > colW) {
      lines.push({ idx: cur, size: ls });
      cur = [i];
      curW = textW(words[i].word, sizeOf(lines.length) * mul(i));
    } else {
      cur.push(i);
      curW += gap + ws;
    }
  }
  if (cur.length) lines.push({ idx: cur, size: sizeOf(lines.length) });
  return lines;
};
const layoutHero = (words, size, mul, colW, standsAlone = () => false) => {
  let n = wrapAt(words, size, 1, mul, colW).length;
  let lines = wrapAt(words, size, n, mul, colW);
  for (let k = 0; k < 4 && lines.length !== n; k++) {
    n = lines.length;
    lines = wrapAt(words, size, n, mul, colW);
  }
  if (lines.length >= 2) {
    const a = lines[lines.length - 2], b = lines[lines.length - 1];
    if (b.idx.length === 1 && a.idx.length >= 3 && !standsAlone(b.idx[0])) {
      b.idx = [a.idx[a.idx.length - 1], ...b.idx];
      a.idx = a.idx.slice(0, -1);
    }
  }
  return lines.map((ln, i) => {
    let s = size * rung(i, lines.length);
    const w = ln.idx.reduce(
      (a, j, k) => a + (k ? s * 0.3 : 0) + textW(words[j].word, s * mul(j)),
      0
    );
    if (w > colW) s *= colW / w;
    return { idx: ln.idx, size: s };
  });
};
export const HeroSentence = ({ words, y = LAYOUT.heroY, size = TYPE.heroSize, end, onLight = 0, paint, emph = [], accent, display = false }) => {
  var _a, _b;
  const f = (0,esm.useCurrentFrame)();
  const first = ((_a = words[0]) == null ? void 0 : _a.at) ?? 0;
  const last = ((_b = words[words.length - 1]) == null ? void 0 : _b.at) ?? first;
  if (f < (paint ?? first - 4)) return null;
  const out = end !== void 0 ? 1 - rInOut(f, end - 12, end) : 1;
  if (out <= 1e-3) return null;
  const col = mixHex("#ffffff", theme.textOnLight, clamp01(onLight));
  const DISPLAY_ADV = 1.24;
  const mul = (j) => ((accent == null ? void 0 : accent.i) === j ? ACCENT_ADV : emph.includes(j) ? EMPH_SIZE : 1) * (display ? DISPLAY_ADV : 1);
  const lines = layoutHero(words, size, mul, LAYOUT.colW, (j) => emph.includes(j));
  const lineW = (ln) => ln.idx.reduce((a, j, k) => a + (k ? ln.size * 0.3 : 0) + textW(words[j].word, ln.size * mul(j)), 0);
  const maxW = Math.max(1, ...lines.map(lineW));
  const maxScale = Math.min(1.42, (LAYOUT.W - 90) / maxW);
  const push = rOut(f, last + 12, last + 44);
  const scale = 1 + (maxScale - 1) * push;
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(
    "div",
    {
      "data-probe": "caption",
      style: {
        position: "absolute",
        left: (LAYOUT.W - LAYOUT.colW) / 2,
        width: LAYOUT.colW,
        top: y,
        // ★ V33: on a 3-D layer — a 2-D scale snaps to whole pixels, and the slow tail of the push ticked 1 px at a time
        transform: `perspective(1200px) translate3d(0px, -50%, 0px) rotateX(0.15deg) scale(${scale.toFixed(4)})`,
        transformOrigin: "50% 50%",
        textAlign: "center",
        fontFamily: display ? DISPLAY_TEXT : VOICE,
        fontWeight: display ? 700 : void 0,
        letterSpacing: display ? -2 : void 0,
        color: col,
        opacity: out
      },
      children: lines.map((ln, li) => /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
        fontSize: ln.size,
        lineHeight: TYPE.lineHeight,
        whiteSpace: "nowrap",
        minHeight: ln.size * TYPE.lineHeight
      }, children: ln.idx.map((i, k) => {
        const w = words[i];
        const p = rOut(f, w.at, w.at + 13);
        const isE = emph.includes(i);
        const isA = (accent == null ? void 0 : accent.i) === i;
        const grad = isA ? accent.tone === "accent" && onLight >= 0.5 ? "linear-gradient(175deg, #247BE0 6%, #004AA0 40%, #002148 96%)" : ACCENT_GRADS[accent.tone] : null;
        const s = 1.6 - 0.6 * p;
        const blur = (1 - p) * 13;
        return /* @__PURE__ */ (0,jsx_runtime.jsx)(
          "span",
          {
            style: {
              display: "inline-block",
              fontFamily: isA ? ACCENT : void 0,
              fontStyle: isA ? "italic" : void 0,
              fontWeight: isA ? 400 : isE ? 800 : 500,
              fontSize: isA ? `${ACCENT_SIZE}em` : isE ? "1.15em" : void 0,
              // the 18% floor itself fades up over 3 frames, so the word does not pop from
              // nothing to 18% in a single frame on arrival
              opacity: (0.18 + 0.82 * p) * clamp01((f - w.at + 3) / 3),
              transform: `scale(${s.toFixed(3)})`,
              // a gradient word carries its blur on its SOLID copy only (see below): no filter may sit above gradient text
              filter: !grad && blur > 0.15 && f >= w.at - 3 ? `blur(${blur.toFixed(2)}px)` : void 0,
              position: grad ? "relative" : void 0,
              // ★ the word gap must be a real margin — a whitespace text node between
              // inline-blocks collapses away and the sentence runs together
              marginRight: k < ln.idx.length - 1 ? ln.size * 0.3 : 0
            },
            children: grad ? (() => {
              const g = clamp01((p - 0.55) / 0.4);
              const solid = accent.tone === "red" ? "#ef2b3d" : onLight >= 0.5 ? "#004AA0" : theme.accent;
              return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { style: { color: solid, opacity: 1 - g, filter: blur > 0.15 && f >= w.at - 3 ? `blur(${blur.toFixed(2)}px)` : void 0 }, children: w.word }),
                g > 1e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { style: { position: "absolute", left: 0, top: 0, opacity: g, background: grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }, children: w.word })
              ] });
            })() : w.word
          },
          i
        );
      }) }, li))
    }
  );
};
const Shout = ({ text, at = 0, y = 620, size = TYPE.shoutSize, end, onLight = 0, wipe = true }) => {
  const f = useCurrentFrame();
  const p = rOut(f, at, at + 14);
  if (p <= 1e-3) return null;
  const out = end !== void 0 ? 1 - rIn(f, end - 12, end) : 1;
  if (out <= 1e-3) return null;
  const grow = 1 + 0.05 * rInOut(f, at, at + 150);
  const col = mixHex("#ffffff", theme.textOnLight, clamp01(onLight));
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        position: "absolute",
        left: 0,
        width: "100%",
        top: y,
        transform: `translateY(-50%) scale(${grow.toFixed(4)})`,
        textAlign: "center",
        opacity: out,
        overflow: "hidden"
      },
      children: /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            display: "inline-block",
            fontFamily: SHOUT,
            fontWeight: 400,
            fontSize: size,
            lineHeight: 0.92,
            color: col,
            textTransform: "uppercase",
            transform: `scaleX(${SHOUT_SQUEEZE})`,
            clipPath: wipe ? `inset(0 ${((1 - p) * 100).toFixed(1)}% 0 0)` : void 0,
            whiteSpace: "pre-line"
          },
          children: text
        }
      )
    }
  );
};
const Kicker = ({ parts, at = 0, y = 560, size = TYPE.kickerSize, end, onLight = 0 }) => {
  const f = useCurrentFrame();
  const p = rOut(f, at, at + 18);
  if (p <= 1e-3) return null;
  const out = end !== void 0 ? 1 - rIn(f, end - 12, end) : 1;
  if (out <= 1e-3) return null;
  const col = mixHex("#ffffff", theme.textOnLight, clamp01(onLight));
  return /* @__PURE__ */ jsx("div", { style: {
    position: "absolute",
    left: (LAYOUT.W - LAYOUT.colW) / 2,
    width: LAYOUT.colW,
    top: y,
    transform: "translateY(-50%)",
    textAlign: "center",
    fontFamily: VOICE,
    fontSize: size,
    lineHeight: 1.22,
    color: col,
    opacity: p * out
  }, children: parts.map((s, i) => /* @__PURE__ */ jsx("span", { style: { fontWeight: s.bold ? 800 : 300 }, children: s.t }, i)) });
};
const Label = ({ x, y, text, at = 0, size = TYPE.labelSize, onLight = 0, dim = 0.8 }) => {
  const f = useCurrentFrame();
  const p = rOut(f, at, at + 16);
  if (p <= 1e-3) return null;
  const col = mixHex("#ffffff", theme.textOnLight, clamp01(onLight));
  return /* @__PURE__ */ jsx("div", { style: {
    position: "absolute",
    left: x,
    top: y,
    transform: "translate(-50%,-50%)",
    fontFamily: VOICE,
    fontWeight: 500,
    fontSize: size,
    color: col,
    opacity: p * dim,
    whiteSpace: "nowrap"
  }, children: text });
};
const Wordmark = ({
  at = 0,
  y = 1690,
  onLight = 0
}) => {
  const f = useCurrentFrame();
  const p = rOut(f, at, at + 22);
  if (p <= 1e-3) return null;
  const col = mixHex("#ffffff", theme.textOnLight, clamp01(onLight));
  return /* @__PURE__ */ jsxs("div", { style: {
    position: "absolute",
    left: 0,
    width: "100%",
    top: y,
    textAlign: "center",
    fontFamily: VOICE,
    fontWeight: 800,
    fontSize: 38,
    letterSpacing: 2,
    opacity: p * 0.9,
    color: col
  }, children: [
    "100",
    /* @__PURE__ */ jsx("span", { style: { color: theme.accent }, children: "bps" })
  ] });
};
