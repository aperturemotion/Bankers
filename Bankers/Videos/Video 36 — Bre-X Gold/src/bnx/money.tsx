// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { aud } from "./aud";
import { clamp01 } from "./anim";
import { SHOUT } from "./fonts";
import { LOSS } from "./common";

const NOTE_AR = 2.353;
const TEX_AR = (/* unused pure expression or super */ null && (900 / 379));
const NoteFace = ({ x, y, w, shade = 0, loss = 0, sheen = 0, one, part }) => {
  const art = part !== "light", light = part !== "art";
  const h = w / NOTE_AR;
  const tw = h * (one ? 1216 / 519 : TEX_AR);
  return /* @__PURE__ */ jsxs("div", { style: {
    position: "absolute",
    left: x,
    top: y,
    width: w,
    height: h,
    overflow: "hidden",
    borderRadius: Math.max(1, w * 6e-3),
    boxShadow: art ? "inset 0 0 0 1px rgba(255,255,255,0.22)" : void 0
  }, children: [
    art && /* @__PURE__ */ jsx(Img, { src: aud(one ? "bill1_graded.jpg" : "bill100.png"), style: { position: "absolute", left: (w - tw) / 2, top: 0, width: tw, height: h } }),
    light && /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, background: `linear-gradient(118deg, rgba(255,255,255,${(0.16 + 0.3 * sheen).toFixed(3)}) 0%, rgba(255,255,255,0) 38%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.18) 100%)` } }),
    light && shade > 1e-3 && /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, background: "#0D1C2E", opacity: clamp01(shade) } }),
    art && loss > 1e-3 && /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: 0, background: LOSS, opacity: 0.55 * clamp01(loss), mixBlendMode: "multiply" } })
  ] });
};
const noteEdge = (k, b, z0, z1, n = 2) => Array.from({ length: n }, (_, i) => {
  const z = z0 + (z1 - z0) * i / Math.max(1, n);
  return { z, k: `${k}e${i}`, box: b, el: /* @__PURE__ */ jsx("rect", { x: b.x, y: b.y, width: b.w, height: b.h, rx: 1.5, fill: mixHex("#8f9690", "#d9ddd8", i / Math.max(1, n)) }) };
});
const BRICK = { w: 150, h: 24, d: 64 };
const PAPER = { hi: "#e3e6e2", mid: "#c9cec9", lo: "#9aa19c" };
const BrickEdgeSvg = ({ b, seed, u = 1, loss = 0, front = true }) => {
  const r = seeded(seed * 7919 + 13);
  const lines = 13;
  const tint = (c) => {
    const base = mixHex(c, "#193C62", 1 - u);
    if (loss <= 1e-3) return base;
    const lum = parseInt(c.slice(1, 3), 16) / 255;
    return mixHex(base, mixHex(mixHex(LOSS, "#000000", 0.62), LOSS, lum * u), loss);
  };
  const sw = b.w * 0.24, sx = b.x + b.w * 0.38;
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("rect", { x: b.x, y: b.y, width: b.w, height: b.h, rx: 1.5, fill: tint(PAPER.mid) }),
    /* @__PURE__ */ jsx("rect", { x: b.x, y: b.y, width: b.w, height: b.h * 0.18, fill: tint(PAPER.hi), opacity: 0.9 }),
    /* @__PURE__ */ jsx("rect", { x: b.x, y: b.y + b.h * 0.8, width: b.w, height: b.h * 0.2, fill: tint(PAPER.lo), opacity: 0.6 }),
    Array.from({ length: lines }, (_, i) => {
      const y = b.y + (i + 0.6) / lines * b.h;
      const a = b.x + (front ? r() * 3 : 0), e = b.x + b.w - (front ? r() * 3 : 0);
      return /* @__PURE__ */ jsx("line", { x1: n2(a), x2: n2(e), y1: n2(y), y2: n2(y), stroke: tint("#7d847f"), strokeOpacity: 0.55, strokeWidth: 0.8 }, i);
    }),
    /* @__PURE__ */ jsx("rect", { x: n2(sx), y: b.y - 0.6, width: n2(sw), height: b.h + 1.2, rx: 1, fill: tint("#eceeee") }),
    /* @__PURE__ */ jsx("line", { x1: n2(sx), x2: n2(sx), y1: b.y, y2: b.y + b.h, stroke: tint("#8a918c"), strokeWidth: 1 }),
    /* @__PURE__ */ jsx("line", { x1: n2(sx + sw), x2: n2(sx + sw), y1: b.y, y2: b.y + b.h, stroke: tint("#8a918c"), strokeWidth: 1 }),
    front && /* @__PURE__ */ jsx("rect", { x: n2(sx + sw * 0.18), y: n2(b.y + b.h * 0.38), width: n2(sw * 0.64), height: n2(b.h * 0.24), rx: 1, fill: tint("#6b726d"), opacity: 0.55 })
  ] });
};
const brickLayers = (k, b, z1, seed, opts = {}) => {
  var _a, _b;
  const step = opts.step ?? 9, D = opts.d ?? BRICK.d;
  const n = Math.max(2, Math.round(D / step));
  const L = [];
  for (let i = 0; i < n; i++) {
    const z = z1 - D + D * i / n;
    L.push({
      z,
      k: `${k}s${i}`,
      box: { x: b.x - 2, y: b.y - 2, w: b.w + 4, h: b.h + 4 },
      t: (_a = opts.t) == null ? void 0 : _a.call(opts, z),
      el: /* @__PURE__ */ jsx(BrickEdgeSvg, { b, seed, u: 0.35 + 0.6 * (i / n), loss: opts.loss, front: false })
    });
  }
  L.push({
    z: z1,
    k: `${k}f`,
    box: { x: b.x - 2, y: b.y - 2, w: b.w + 4, h: b.h + 4 },
    t: (_b = opts.t) == null ? void 0 : _b.call(opts, z1),
    el: /* @__PURE__ */ jsx(BrickEdgeSvg, { b, seed, loss: opts.loss })
  });
  return L;
};
const head = (r) => `perspective(${r.persp}px) rotateX(${n2(r.pitch)}deg) rotateY(${n2(r.yaw)}deg)`;
const partT = (r, c, m, z) => `${head(r)} translate3d(${n2(c.x - r.cx + m.dx)}px, ${n2(c.y - r.cy + m.dy)}px, ${n2(c.z + m.dz)}px) rotateZ(${n2(m.rz ?? 0)}deg) rotateX(${n2(m.rx ?? 0)}deg) rotateY(${n2(m.ry ?? 0)}deg) translate3d(${n2(r.cx - c.x)}px, ${n2(r.cy - c.y)}px, ${n2(z - c.z)}px)`;
const steel = (u) => side(u, "#0B2034", "#2D6CB4");
const faceT = (R, P, g, c, rot) => `${head(R)} translate3d(${n2(P.x - R.cx + (g.dx ?? 0))}px, ${n2(P.y - R.cy + (g.dy ?? 0))}px, ${n2(P.z + (g.dz ?? 0))}px) rotateZ(${n2(g.rz ?? 0)}deg) rotateX(${n2(g.rx ?? 0)}deg) rotateY(${n2(g.ry ?? 0)}deg) translate3d(${n2(c.x - P.x)}px, ${n2(c.y - P.y)}px, ${n2(c.z - P.z)}px) ${rot} translate3d(${n2(R.cx - c.x)}px, ${n2(R.cy - c.y)}px, 0px)`;
const boxFaces = (k, R, b, z1, D, faces, opts = {}) => {
  const P = opts.pivot ?? { x: b.x + b.w / 2, y: b.y + b.h / 2, z: z1 - D / 2 };
  const g = opts.mv ?? {};
  const o = opts.order ?? z1;
  const L = [];
  if (faces.left) {
    const c = { x: b.x, y: b.y + b.h / 2, z: z1 - D / 2 };
    L.push({
      z: z1 - D / 2,
      order: o - D / 2,
      k: `${k}L`,
      box: { x: b.x - D / 2, y: b.y, w: D, h: b.h },
      html: faces.left.html,
      op: opts.op,
      t: faceT(R, P, g, c, "rotateY(-90deg)"),
      el: faces.left.el
    });
  }
  if (faces.top) {
    const c = { x: b.x + b.w / 2, y: b.y, z: z1 - D / 2 };
    L.push({
      z: z1 - D / 2,
      order: o - D / 2 + 0.01,
      k: `${k}T`,
      box: { x: b.x, y: b.y - D / 2, w: b.w, h: D },
      html: faces.top.html,
      op: opts.op,
      t: faceT(R, P, g, c, "rotateX(90deg)"),
      el: faces.top.el
    });
    if (faces.top.light) L.push({
      z: z1 - D / 2,
      order: o - D / 2 + 0.0105,
      k: `${k}Tl`,
      box: { x: b.x, y: b.y - D / 2, w: b.w, h: D },
      html: true,
      op: opts.op,
      t: faceT(R, P, g, c, "rotateX(90deg)"),
      el: faces.top.light
    });
  }
  {
    const c = { x: b.x + b.w / 2, y: b.y + b.h / 2, z: z1 };
    L.push({ z: z1, order: o, k: `${k}F`, box: b, html: faces.front.html, op: opts.op, t: faceT(R, P, g, c, ""), el: faces.front.el });
  }
  return L;
};
const paperTint = (c, loss, shade) => {
  let out = c;
  if (loss > 1e-3) {
    const lum = parseInt(c.slice(1, 3), 16) / 255;
    out = mixHex(out, mixHex(mixHex(LOSS, "#000000", 0.62), LOSS, lum), loss);
  }
  return shade > 1e-3 ? mixHex(out, "#0D1C2E", clamp01(shade)) : out;
};
const CashEdge = ({ b, seed, loss = 0, shade = 0, strap = true }) => {
  const r = seeded(seed * 7919 + 101);
  const T = (c) => paperTint(c, loss, shade);
  const n = Math.max(6, Math.min(44, Math.round(b.h / 1.4)));
  const sw = b.w * 0.22, sx = b.x + b.w * 0.39;
  const id = `ce${seed}`;
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsxs("defs", { children: [
      /* @__PURE__ */ jsxs("linearGradient", { id, x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: T("#eef0ea") }),
        /* @__PURE__ */ jsx("stop", { offset: "35%", stopColor: T("#dadfd6") }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: T("#aeb4ab") })
      ] }),
      /* @__PURE__ */ jsxs("linearGradient", { id: `${id}h`, x1: "0", y1: "0", x2: "1", y2: "0", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#000000", stopOpacity: 0.16 }),
        /* @__PURE__ */ jsx("stop", { offset: "12%", stopColor: "#000000", stopOpacity: 0 }),
        /* @__PURE__ */ jsx("stop", { offset: "34%", stopColor: "#000000", stopOpacity: 0.1 }),
        /* @__PURE__ */ jsx("stop", { offset: "39%", stopColor: "#000000", stopOpacity: 0.2 }),
        /* @__PURE__ */ jsx("stop", { offset: "61%", stopColor: "#000000", stopOpacity: 0.2 }),
        /* @__PURE__ */ jsx("stop", { offset: "66%", stopColor: "#000000", stopOpacity: 0.1 }),
        /* @__PURE__ */ jsx("stop", { offset: "88%", stopColor: "#000000", stopOpacity: 0 }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#000000", stopOpacity: 0.12 })
      ] })
    ] }),
    /* @__PURE__ */ jsx("rect", { x: b.x, y: b.y, width: b.w, height: b.h, rx: 2, fill: `url(#${id})` }),
    Array.from({ length: n }, (_, i) => {
      const y = b.y + (i + 0.5) / n * b.h;
      const a = b.x + r() * 2.2, e = b.x + b.w - r() * 2.2;
      const dark = r() < 0.5;
      return /* @__PURE__ */ jsx("line", { x1: n2(a), x2: n2(e), y1: n2(y), y2: n2(y), stroke: T(dark ? "#7f867e" : "#f6f7f3"), strokeOpacity: dark ? 0.32 + 0.2 * r() : 0.35, strokeWidth: 0.7 }, i);
    }),
    Array.from({ length: 4 }, (_, i) => {
      const y = b.y + (0.15 + 0.7 * r()) * b.h, left = i % 2 === 0, l = 1.5 + 2.5 * r();
      return /* @__PURE__ */ jsx("line", { x1: n2(left ? b.x - l : b.x + b.w - 3), x2: n2(left ? b.x + 3 : b.x + b.w + l), y1: n2(y), y2: n2(y), stroke: T("#f2f4ef"), strokeWidth: 1.1 }, `p${i}`);
    }),
    /* @__PURE__ */ jsx("rect", { x: b.x, y: b.y, width: b.w, height: b.h, rx: 2, fill: `url(#${id}h)` }),
    /* @__PURE__ */ jsx("line", { x1: b.x + 2, x2: b.x + b.w - 2, y1: b.y + 0.6, y2: b.y + 0.6, stroke: "#ffffff", strokeOpacity: 0.55 * (1 - shade), strokeWidth: 1.2 }),
    /* @__PURE__ */ jsx("line", { x1: b.x + 1, x2: b.x + b.w - 1, y1: b.y + b.h - 0.6, y2: b.y + b.h - 0.6, stroke: "#000000", strokeOpacity: 0.3, strokeWidth: 1.2 }),
    strap && /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx("rect", { x: n2(sx), y: b.y - 0.8, width: n2(sw), height: b.h + 1.6, rx: 1, fill: T("#e9e9e2") }),
      /* @__PURE__ */ jsx("rect", { x: n2(sx), y: b.y - 0.8, width: n2(sw), height: n2(Math.max(1.5, b.h * 0.12)), fill: "#ffffff", opacity: 0.35 * (1 - shade) }),
      /* @__PURE__ */ jsx("line", { x1: n2(sx + 0.6), x2: n2(sx + 0.6), y1: b.y, y2: b.y + b.h, stroke: T("#8c928a"), strokeWidth: 1 }),
      /* @__PURE__ */ jsx("line", { x1: n2(sx + sw - 0.6), x2: n2(sx + sw - 0.6), y1: b.y, y2: b.y + b.h, stroke: T("#8c928a"), strokeWidth: 1 }),
      b.h >= 16 && /* @__PURE__ */ jsx(
        "text",
        {
          "data-probe": "bg",
          x: n2(sx + sw / 2),
          y: n2(b.y + b.h / 2),
          textAnchor: "middle",
          dominantBaseline: "central",
          fill: T("#005CC6"),
          style: { fontFamily: SHOUT, fontSize: Math.min(15, b.h * 0.46), letterSpacing: 0.5 },
          children: "$10,000"
        }
      )
    ] })
  ] });
};
const CashEnd = ({ b, seed, loss = 0, shade = 0 }) => {
  const r = seeded(seed * 104729 + 7);
  const T = (c) => paperTint(c, loss, shade);
  const n = Math.max(6, Math.min(44, Math.round(b.h / 1.4)));
  const id = `cn${seed}`;
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id, x1: "0", y1: "0", x2: "1", y2: "0", children: [
      /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: T("#8f968c") }),
      /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: T("#cdd2c9") })
    ] }) }),
    /* @__PURE__ */ jsx("rect", { x: b.x, y: b.y, width: b.w, height: b.h, rx: 1.5, fill: `url(#${id})` }),
    Array.from({ length: n }, (_, i) => {
      const y = b.y + (i + 0.5) / n * b.h;
      return /* @__PURE__ */ jsx("line", { x1: n2(b.x + r() * 2), x2: n2(b.x + b.w - r() * 2), y1: n2(y), y2: n2(y), stroke: T("#5f665f"), strokeOpacity: 0.22 + 0.2 * r(), strokeWidth: 0.7 }, i);
    }),
    /* @__PURE__ */ jsx("line", { x1: b.x, x2: b.x + b.w, y1: b.y + 0.6, y2: b.y + 0.6, stroke: "#ffffff", strokeOpacity: 0.3 * (1 - shade), strokeWidth: 1 })
  ] });
};
const strapOf = (w) => ({ sw: w * 0.22, sx: w * 0.39 });
export const CashTop = ({ w, d, loss = 0 }) => {
  const { sw, sx } = strapOf(w);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "absolute", left: 0, top: 0, width: w, height: d, overflow: "hidden", borderRadius: 2 }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(esm.Img, { src: aud("bill100.png"), style: { position: "absolute", left: 0, top: 0, width: w, height: d, objectFit: "cover" } }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: {
      position: "absolute",
      left: sx,
      top: -1,
      width: sw,
      height: d + 2,
      background: "linear-gradient(90deg, #cfd1c9 0%, #eeeee8 30%, #f4f4ef 55%, #d4d6ce 100%)",
      boxShadow: "inset 1px 0 0 rgba(0,0,0,0.25), inset -1px 0 0 rgba(0,0,0,0.25)"
    }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe": "bg", style: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%,-50%)",
        whiteSpace: "nowrap",
        fontFamily: SHOUT,
        fontSize: Math.min(16, sw * 0.2),
        letterSpacing: 0.5,
        color: "#005CC6"
      }, children: "$10,000" }),
      " "
    ] }),
    loss > 1e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, background: LOSS, opacity: 0.62 * clamp01(loss), mixBlendMode: "multiply" } })
  ] });
};
export const CashTopLight = ({ w, d, shade = 0, sheen = 0 }) => {
  const { sw, sx } = strapOf(w);
  const paper = (x0, x1) => /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "absolute", left: x0, top: 0, width: x1 - x0, height: d, overflow: "hidden" }, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
      position: "absolute",
      left: -x0,
      top: 0,
      width: w,
      height: d,
      background: `linear-gradient(160deg, rgba(255,255,255,${(0.14 + 0.3 * sheen).toFixed(3)}) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.12) 100%)`
    } }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: -x0, top: 0, width: w, height: d, boxShadow: "inset 0 0 6px rgba(0,0,0,0.35)" } })
  ] }, x0);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "absolute", left: 0, top: 0, width: w, height: d, overflow: "hidden", borderRadius: 2 }, children: [
    paper(0, sx),
    paper(sx + sw, w),
    shade > 1e-3 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, background: "#0D1C2E", opacity: clamp01(shade) } })
  ] });
};
const cashBrick = (k, R, b, z1, D, seed, opts = {}) => boxFaces(k, R, b, z1, D, {
  front: { el: /* @__PURE__ */ jsx(CashEdge, { b, seed, loss: opts.loss, shade: opts.shade }) },
  left: opts.left === false ? void 0 : { el: /* @__PURE__ */ jsx(CashEnd, { b: { x: b.x - D / 2, y: b.y, w: D, h: b.h }, seed, loss: opts.loss, shade: (opts.shade ?? 0) + 0.08 }) },
  top: opts.top ? { html: true, el: /* @__PURE__ */ jsx(CashTop, { w: b.w, d: D, loss: opts.loss }), light: /* @__PURE__ */ jsx(CashTopLight, { w: b.w, d: D, shade: opts.shade, sheen: opts.sheen }) } : void 0
}, opts);
const floorShadow = (k, R, c, w, d, opts = { order: 0 }) => {
  const dark = opts.dark ?? 0.55, cast = opts.cast ?? 1;
  const op = opts.op ?? 1;
  if (op <= 3e-3) return [];
  const mk = (kk, cx, cz, ww, dd, a, inner, ord) => {
    const box = { x: cx - ww / 2, y: c.y - dd / 2, w: ww, h: dd };
    const id = `fs${kk.replace(/[^a-zA-Z0-9]/g, "")}`;
    return {
      z: cz,
      order: ord,
      k: kk,
      box,
      op,
      t: faceT(R, opts.pivot ?? { x: cx, y: c.y, z: cz }, opts.mv ?? {}, { x: cx, y: c.y, z: cz }, "rotateX(90deg)"),
      el: /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("radialGradient", { id, cx: "50%", cy: "50%", r: "50%", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#000000", stopOpacity: a }),
          /* @__PURE__ */ jsx("stop", { offset: `${Math.round(inner * 100)}%`, stopColor: "#000000", stopOpacity: a * 0.8 }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#000000", stopOpacity: 0 })
        ] }) }),
        /* @__PURE__ */ jsx("rect", { x: box.x, y: box.y, width: box.w, height: box.h, fill: `url(#${id})` })
      ] })
    };
  };
  return [
    // the cast: wider, softer, thrown down-right (toward +x and toward the viewer, away from a key at the upper left back)
    mk(`${k}c`, c.x + 0.12 * w * cast, c.z + 0.14 * d * cast, w * (1 + 0.5 * cast), d * (1 + 0.6 * cast), dark * 0.55, 0.35, opts.order),
    // the contact: tight and dark, right under the footprint
    mk(`${k}t`, c.x + 0.02 * w, c.z + 0.03 * d, w * 1.06, d * 1.1, dark, 0.7, opts.order + 1e-3)
  ];
};
