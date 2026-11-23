// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { rInOut } from "./anim";
import { SHOUT } from "./fonts";

export const figure = (size, color = "#EFF5FB") => ({
  fontFamily: SHOUT,
  fontWeight: 400,
  fontSize: size,
  letterSpacing: size >= 90 ? -2 : -1,
  color,
  whiteSpace: "nowrap",
  lineHeight: 1
});
const mono = (size, color = "#DEEAF8") => ({
  fontFamily: SHOUT,
  fontWeight: 400,
  fontSize: size,
  letterSpacing: 0.5,
  color,
  whiteSpace: "nowrap",
  lineHeight: 1
});
export const label = (size, color = "#84B0E4") => ({
  fontFamily: SHOUT,
  fontWeight: 400,
  fontSize: size,
  letterSpacing: 1.5,
  color,
  whiteSpace: "nowrap",
  lineHeight: 1,
  textTransform: "uppercase"
});
export const Turn = ({
  at,
  end,
  from = -15,
  to = 6,
  tilt = 0,
  tiltTo,
  amp = 2.6,
  period = 250,
  persp = 1800,
  flat = true,
  strength = 1,
  children
}) => {
  const f = (0,esm.useCurrentFrame)();
  const p = rInOut(f, at, end);
  const yaw0 = strength * (from + (to - from) * p + amp * Math.sin((f - at) / period * Math.PI * 2));
  const yaw = Math.abs(yaw0) < 0.06 ? yaw0 < 0 ? -0.06 : 0.06 : yaw0;
  const pitch = tilt + ((tiltTo ?? tilt) - tilt) * p;
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, perspective: persp, transformStyle: flat ? "flat" : "preserve-3d" }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
    position: "absolute",
    inset: 0,
    transformStyle: flat ? "flat" : "preserve-3d",
    transform: `rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg)`
  }, children }) });
};
const BullionBar = ({ x, y, w = 92, h = 34, lit = 0.5, on = 1, showTop = true }) => {
  if (on <= 2e-3) return null;
  const SX = w * 0.155;
  const SY = h * 0.42;
  const bw = w - SX;
  const T = bw * 0.055;
  const H = SY + h;
  const id = `bg${Math.round(x)}_${Math.round(y)}_${Math.round(w)}`;
  const nearL = `${T},${SY}`, nearR = `${bw - T},${SY}`;
  const front = `${nearL} ${nearR} ${bw},${H} 0,${H}`;
  const top = `${T + SX},0 ${bw - T + SX},0 ${nearR} ${nearL}`;
  const side = `${nearR} ${bw - T + SX},0 ${bw + SX},${H - SY} ${bw},${H}`;
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width: w,
      height: H,
      viewBox: `0 0 ${w} ${H}`,
      style: { position: "absolute", left: x - bw / 2, top: y - H, opacity: on, overflow: "visible" },
      children: [
        /* @__PURE__ */ jsxs("defs", { children: [
          /* @__PURE__ */ jsxs("linearGradient", { id: id + "f", x1: "0", y1: "0", x2: "0.25", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: mixHex(BULLION.face, "#ffffff", 0.26 * lit) }),
            /* @__PURE__ */ jsx("stop", { offset: "46%", stopColor: BULLION.body }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: BULLION.dark })
          ] }),
          /* @__PURE__ */ jsxs("linearGradient", { id: id + "t", x1: "0", y1: "0", x2: "0.6", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: mixHex(BULLION.edge, "#ffffff", 0.42 * lit) }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: mixHex(BULLION.face, BULLION.body, 0.55) })
          ] }),
          /* @__PURE__ */ jsxs("linearGradient", { id: id + "s", x1: "0", y1: "0", x2: "0.4", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: mixHex(BULLION.body, "#000000", 0.18) }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: mixHex(BULLION.dark, "#000000", 0.34) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("polygon", { points: side, fill: `url(#${id}s)` }),
        showTop && /* @__PURE__ */ jsx("polygon", { points: top, fill: `url(#${id}t)` }),
        /* @__PURE__ */ jsx("polygon", { points: front, fill: `url(#${id}f)` }),
        /* @__PURE__ */ jsx(
          "line",
          {
            x1: T,
            y1: SY,
            x2: bw - T,
            y2: SY,
            stroke: alpha(BULLION.edge, 0.5 + 0.35 * lit),
            strokeWidth: Math.max(1, h * 0.035)
          }
        )
      ]
    }
  );
};
const BarStack = ({ x, baseY, rows, perRow = 3, w = 76, h = 26, lit = 0.5, on = 1, grow = 1 }) => {
  const shown = Math.max(0, Math.min(rows, Math.round(rows * grow)));
  const SX = w * 0.155;
  const bw = w - SX;
  const GAP = Math.max(1, w * 0.012);
  const rowW = perRow * bw + (perRow - 1) * GAP;
  const out = [];
  for (let r = 0; r < shown; r++) {
    for (let i = 0; i < perRow; i++) {
      const cx = x - rowW / 2 + bw / 2 + i * (bw + GAP);
      out.push(
        // ★ EVERY BAR IS COMPLETE — all three faces, always (user: "make them complete gold
        // bars"). Safe now that the side face exists: a covered bar's top is hidden entirely by
        // the bar above (front + side), so the old overhang sliver cannot reappear.
        /* @__PURE__ */ jsx(
          BullionBar,
          {
            x: cx,
            y: baseY - r * h,
            w,
            h,
            lit: lit * (0.72 + 0.28 * (r / Math.max(1, rows - 1))),
            on
          },
          r + "-" + i
        )
      );
    }
  }
  return /* @__PURE__ */ jsx(Fragment, { children: out });
};
const FLAG_INK = {
  slate: "#3663CA",
  // vibrant flag blue, a step dark
  brick: "#b02437",
  // vibrant flag red — darker and cooler than the reserved alarm red
  moss: "#1e7c40",
  // greens
  sand: "#d9a91c",
  // golds/yellows
  bone: "#DCE5F0",
  // whites — bright, but held under paper so the dark theme survives
  coal: "#0F243D",
  // blacks
  navy: "#2D3981",
  // the deep flag blues (Thailand's band, India's chakra)
  sky: "#8AAECE",
  // the light flag blues (Argentina, Luxembourg), ~85% brightness
  orange: "#d97a2b",
  // Ireland / India saffron, a step dark
  maroon: "#8a2a32"
  // Latvia's carmine
};
const F = FLAG_INK;
const FLAG_DEFS = {
  de: { dir: "h", c: [F.coal, F.brick, F.sand] },
  nl: { dir: "h", c: [F.brick, F.bone, F.slate] },
  pl: { dir: "h", c: [F.bone, F.brick] },
  at: { dir: "h", c: [F.brick, F.bone, F.brick] },
  hu: { dir: "h", c: [F.brick, F.bone, F.moss] },
  bg: { dir: "h", c: [F.bone, F.moss, F.brick] },
  ee: { dir: "h", c: [F.slate, F.coal, F.bone] },
  lt: { dir: "h", c: [F.sand, F.moss, F.brick] },
  lu: { dir: "h", c: [F.brick, F.bone, F.sky] },
  ua: { dir: "h", c: [F.slate, F.sand] },
  id: { dir: "h", c: [F.brick, F.bone] },
  eg: { dir: "h", c: [F.brick, F.bone, F.coal] },
  es: { dir: "h", c: [F.brick, F.sand, F.brick], wts: [1, 2, 1] },
  lv: { dir: "h", c: [F.maroon, F.bone, F.maroon], wts: [2, 1, 2] },
  co: { dir: "h", c: [F.sand, F.slate, F.brick], wts: [2, 1, 1] },
  th: { dir: "h", c: [F.brick, F.bone, F.navy, F.bone, F.brick], wts: [1, 1, 2, 1, 1] },
  fr: { dir: "v", c: [F.slate, F.bone, F.brick] },
  it: { dir: "v", c: [F.moss, F.bone, F.brick] },
  be: { dir: "v", c: [F.coal, F.sand, F.brick] },
  ie: { dir: "v", c: [F.moss, F.bone, F.orange] },
  ro: { dir: "v", c: [F.slate, F.sand, F.brick] },
  ng: { dir: "v", c: [F.moss, F.bone, F.moss] },
  pt: { dir: "v", c: [F.moss, F.brick], wts: [2, 3] },
  // ⚠ ch is a CENTRED cross (the "plus"), not a Nordic one — the earlier nordic Swiss chip was
  // simply the wrong flag
  ch: { dir: "plus", c: [F.brick, F.bone] },
  se: { dir: "cross", c: [F.slate, F.sand] },
  fi: { dir: "cross", c: [F.bone, F.slate] },
  dk: { dir: "cross", c: [F.brick, F.bone] },
  no: { dir: "cross", c: [F.brick, F.bone, F.slate] },
  // c[2] = the inner cross
  is: { dir: "cross", c: [F.slate, F.bone, F.brick] },
  jp: { dir: "disc", c: [F.bone, F.brick] },
  in: { dir: "hdisc", c: [F.orange, F.bone, F.moss, F.navy] },
  // last = the chakra disc
  ar: { dir: "hdisc", c: [F.sky, F.bone, F.sky, F.sand] },
  // last = the sun disc
  us: { dir: "us", c: [F.brick, F.bone, F.slate] },
  gr: { dir: "gr", c: [F.slate, F.bone] },
  tr: { dir: "tr", c: [F.brick, F.bone] },
  cz: { dir: "cz", c: [F.bone, F.brick, F.slate] },
  cl: { dir: "cl", c: [F.bone, F.brick, F.slate] }
};
const FLAG_SET = (/* unused pure expression or super */ null && ([
  "de",
  "fr",
  "it",
  "nl",
  "pl",
  "ch",
  "se",
  "jp",
  "be",
  "fi",
  "at",
  "us",
  "dk",
  "ie",
  "es",
  "no",
  "gr",
  "pt",
  "tr",
  "cz",
  "hu",
  "is",
  "ro",
  "bg",
  "ee",
  "lv",
  "lt",
  "lu",
  "ua",
  "th",
  "in",
  "ar",
  "cl",
  "eg",
  "id",
  "co"
]));
const FlagChip = ({ kind, x, y, w = 108, on = 1, lit = 0.4 }) => {
  if (on <= 2e-3) return null;
  const h = w * 0.68;
  const d = FLAG_DEFS[kind];
  const stripes = (cs, dir) => {
    const wts = d.wts ?? cs.map(() => 1);
    const tot = wts.reduce((a, b) => a + b, 0);
    let acc = 0;
    return cs.map((c, i) => {
      const a = acc / tot;
      acc += wts[i];
      const b = acc / tot;
      const s = dir === "h" ? { left: 0, top: h * a, width: w, height: h * (b - a) + 0.5 } : { left: w * a, top: 0, width: w * (b - a) + 0.5, height: h };
      return /* @__PURE__ */ jsx("div", { style: { position: "absolute", ...s, background: c } }, i);
    });
  };
  const STAR = "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
  return /* @__PURE__ */ jsxs("div", { style: {
    position: "absolute",
    left: x - w / 2,
    top: y - h / 2,
    width: w,
    height: h,
    borderRadius: 8,
    overflow: "hidden",
    opacity: on,
    boxShadow: `0 ${(10 * on).toFixed(0)}px ${(24 * on).toFixed(0)}px rgba(0,0,0,0.6)`
  }, children: [
    (d.dir === "h" || d.dir === "hdisc") && stripes(d.dir === "hdisc" ? d.c.slice(0, -1) : d.c, "h"),
    d.dir === "v" && stripes(d.c, "v"),
    d.dir === "hdisc" && // the centred emblem disc (India's chakra, Argentina's sun) — small, on the middle band
    /* @__PURE__ */ jsx("div", { style: {
      position: "absolute",
      left: w / 2 - h * 0.14,
      top: h / 2 - h * 0.14,
      width: h * 0.28,
      height: h * 0.28,
      borderRadius: "50%",
      background: d.c[d.c.length - 1]
    } }),
    d.dir === "cross" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, background: d.c[0] } }),
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: w * 0.3, top: 0, width: w * 0.16, height: h, background: d.c[1] } }),
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: 0, top: h * 0.42, width: w, height: h * 0.18, background: d.c[1] } }),
      d.c[2] && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: w * 0.345, top: 0, width: w * 0.07, height: h, background: d.c[2] } }),
        /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: 0, top: h * 0.47, width: w, height: h * 0.08, background: d.c[2] } })
      ] })
    ] }),
    d.dir === "plus" && // the CENTRED cross — Switzerland (a Nordic cross here would be the wrong flag)
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, background: d.c[0] } }),
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: w / 2 - h * 0.33, top: h / 2 - h * 0.105, width: h * 0.66, height: h * 0.21, background: d.c[1] } }),
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: w / 2 - h * 0.105, top: h / 2 - h * 0.33, width: h * 0.21, height: h * 0.66, background: d.c[1] } })
    ] }),
    d.dir === "disc" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, background: d.c[0] } }),
      /* @__PURE__ */ jsx("div", { style: {
        position: "absolute",
        left: w / 2 - h * 0.26,
        top: h * 0.24,
        width: h * 0.52,
        height: h * 0.52,
        borderRadius: "50%",
        background: d.c[1]
      } })
    ] }),
    d.dir === "us" && /* @__PURE__ */ jsxs(Fragment, { children: [
      [...Array(5)].map((_, i) => /* @__PURE__ */ jsx("div", { style: {
        position: "absolute",
        left: 0,
        top: h / 5 * i,
        width: w,
        height: h / 5 + 0.5,
        background: i % 2 === 0 ? d.c[0] : d.c[1]
      } }, i)),
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: 0, top: 0, width: w * 0.44, height: h * 0.55, background: d.c[2] } })
    ] }),
    d.dir === "gr" && // Greece — nine stripes, blue canton, white cross
    /* @__PURE__ */ jsxs(Fragment, { children: [
      [...Array(9)].map((_, i) => /* @__PURE__ */ jsx("div", { style: {
        position: "absolute",
        left: 0,
        top: h / 9 * i,
        width: w,
        height: h / 9 + 0.5,
        background: i % 2 === 0 ? d.c[0] : d.c[1]
      } }, i)),
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: 0, top: 0, width: w * 0.37, height: h / 9 * 5, background: d.c[0] } }),
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: w * 0.145, top: 0, width: w * 0.08, height: h / 9 * 5, background: d.c[1] } }),
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: 0, top: h / 9 * 2.15, width: w * 0.37, height: h / 9 * 0.7, background: d.c[1] } })
    ] }),
    d.dir === "tr" && // Türkiye — the crescent (a disc cut by an offset field-colour disc) and the star
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, background: d.c[0] } }),
      /* @__PURE__ */ jsx("div", { style: {
        position: "absolute",
        left: w * 0.3 - h * 0.28,
        top: h / 2 - h * 0.28,
        width: h * 0.56,
        height: h * 0.56,
        borderRadius: "50%",
        background: d.c[1]
      } }),
      /* @__PURE__ */ jsx("div", { style: {
        position: "absolute",
        left: w * 0.3 - h * 0.28 + h * 0.13,
        top: h / 2 - h * 0.23,
        width: h * 0.46,
        height: h * 0.46,
        borderRadius: "50%",
        background: d.c[0]
      } }),
      /* @__PURE__ */ jsx("div", { style: {
        position: "absolute",
        left: w * 0.52,
        top: h / 2 - h * 0.11,
        width: h * 0.22,
        height: h * 0.22,
        background: d.c[1],
        clipPath: STAR
      } })
    ] }),
    d.dir === "cz" && // Czechia — white over red, blue hoist triangle
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: 0, top: 0, width: w, height: h / 2 + 0.5, background: d.c[0] } }),
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: 0, top: h / 2, width: w, height: h / 2, background: d.c[1] } }),
      /* @__PURE__ */ jsx("div", { style: {
        position: "absolute",
        inset: 0,
        background: d.c[2],
        clipPath: "polygon(0% 0%, 50% 50%, 0% 100%)"
      } })
    ] }),
    d.dir === "cl" && // Chile — white over red, blue canton with a white star
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: 0, top: 0, width: w, height: h / 2 + 0.5, background: d.c[0] } }),
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: 0, top: h / 2, width: w, height: h / 2, background: d.c[1] } }),
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: 0, top: 0, width: w * 0.34, height: h / 2 + 0.5, background: d.c[2] } }),
      /* @__PURE__ */ jsx("div", { style: {
        position: "absolute",
        left: w * 0.17 - h * 0.1,
        top: h * 0.25 - h * 0.1,
        width: h * 0.2,
        height: h * 0.2,
        background: d.c[0],
        clipPath: STAR
      } })
    ] }),
    /* @__PURE__ */ jsx("div", { style: {
      position: "absolute",
      inset: 0,
      background: `linear-gradient(118deg, transparent 38%, ${alpha("#ffffff", 0.05 + 0.04 * lit)} 50%, transparent 62%),
          linear-gradient(180deg, transparent 55%, ${alpha("#000000", 0.3)} 100%)`
    } })
  ] });
};
const chipSvg = (x, y, w, lit, on, key) => {
  if (on <= 0.01) return null;
  const h = w * 0.62, d = Math.max(1, w * 0.26);
  const face = mixHex("#215187", "#F3F6F9", lit);
  const cap = mixHex("#4D80BA", "#ffffff", lit * 0.9);
  const side = mixHex("#112C49", "#6E94BF", lit * 0.7);
  return /* @__PURE__ */ jsxs("g", { opacity: on, children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        d: `M ${x + w / 2},${y - h / 2} L ${x + w / 2 + d},${y - h / 2 - d * 0.7}
                L ${x + w / 2 + d},${y + h / 2 - d * 0.7} L ${x + w / 2},${y + h / 2} Z`,
        fill: side
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: `M ${x - w / 2},${y - h / 2} L ${x - w / 2 + d},${y - h / 2 - d * 0.7}
                L ${x + w / 2 + d},${y - h / 2 - d * 0.7} L ${x + w / 2},${y - h / 2} Z`,
        fill: cap
      }
    ),
    /* @__PURE__ */ jsx(
      "rect",
      {
        x: x - w / 2,
        y: y - h / 2,
        width: w,
        height: h,
        rx: Math.min(2.5, w * 0.16),
        fill: face
      }
    )
  ] }, key);
};
