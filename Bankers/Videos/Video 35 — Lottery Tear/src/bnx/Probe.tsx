// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import * as react from "react";

const VIS = 0.15;
const W = 1080, H = 1920;
const effOp = (el) => {
  let o = 1;
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    const cs = getComputedStyle(n);
    if (cs.display === "none" || cs.visibility === "hidden") return 0;
    o *= parseFloat(cs.opacity || "1");
    if (o < 0.01) return 0;
  }
  return o;
};
const alphaOf = (c) => {
  if (!c || c === "none" || c === "transparent") return 0;
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) return 1;
  const p = m[1].split(",").map((s) => parseFloat(s));
  return p.length >= 4 ? p[3] : 1;
};
const desc = (el) => {
  const tag = el.tagName.toLowerCase();
  if (el.closest("[data-probe-canary], [data-probe-canary-surface]")) return `canary ${tag}`;
  const cs = getComputedStyle(el);
  const a = (k) => el.getAttribute(k);
  const r = el.getBoundingClientRect();
  const at = `@${Math.round(r.left)},${Math.round(r.top)}`;
  if (tag === "rect") return `rect ${a("width")}x${a("height")} ${at}`;
  if (tag === "circle") return `circle r${a("r")} ${at}`;
  if (tag === "line") return `line${a("stroke-dasharray") ? " dashed" : ""} ${at}`;
  if (tag === "polyline") return `polyline ${at}`;
  if (tag === "path") return `path ${at}`;
  if (tag === "div") return `div ${Math.round(r.width)}x${Math.round(r.height)}${parseFloat(cs.borderTopWidth) || parseFloat(cs.borderLeftWidth) ? " bordered" : ""}${cs.backgroundImage !== "none" ? " gradient" : ""} ${at}`;
  return tag;
};
const outline = (el) => {
  const P = (x, y) => [x, y];
  const tag = el.tagName.toLowerCase();
  const num = (k) => parseFloat(el.getAttribute(k) || "0");
  const out = [];
  const seg = (x0, y0, x1, y1, n) => {
    for (let i = 0; i <= n; i++) out.push(P(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n));
  };
  if (tag === "line") seg(num("x1"), num("y1"), num("x2"), num("y2"), 24);
  else if (tag === "rect") {
    const x = num("x"), y = num("y"), w = num("width"), h = num("height");
    if (w <= 0 || h <= 0) return [];
    seg(x, y, x + w, y, 16);
    seg(x + w, y, x + w, y + h, 16);
    seg(x + w, y + h, x, y + h, 16);
    seg(x, y + h, x, y, 16);
  } else if (tag === "circle" || tag === "ellipse") {
    const cx = num("cx"), cy = num("cy");
    const rx = tag === "circle" ? num("r") : num("rx"), ry = tag === "circle" ? num("r") : num("ry");
    for (let i = 0; i < 40; i++) {
      const a = i / 40 * Math.PI * 2;
      out.push(P(cx + rx * Math.cos(a), cy + ry * Math.sin(a)));
    }
  } else if (tag === "polyline" || tag === "polygon") {
    const pts = (el.getAttribute("points") || "").trim().split(/[\s]+/).map((s) => s.split(",").map(parseFloat)).filter((p) => p.length === 2 && !isNaN(p[0]));
    for (let i = 0; i + 1 < pts.length; i++) seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 3);
  } else if (tag === "path") {
    const p = el;
    let L = 0;
    if (!(p.getAttribute("d") || "").trim()) return [];
    try {
      L = p.getTotalLength();
    } catch {
      return [];
    }
    if (!(L > 0)) return [];
    const n = Math.min(120, Math.max(12, Math.round(L / 8)));
    for (let i = 0; i <= n; i++) {
      const q = p.getPointAtLength(L * i / n);
      out.push(P(q.x, q.y));
    }
  }
  return out;
};
const SVGNS = "http://www.w3.org/2000/svg";
const projectAll = (jobs) => {
  var _a;
  const groups = [];
  const marks = [];
  for (const j of jobs) {
    const g = document.createElementNS(SVGNS, "g");
    const tf = j.el.getAttribute("transform");
    if (tf) g.setAttribute("transform", tf);
    g.setAttribute("data-probe-marker", "1");
    const ms = [];
    for (const [x, y] of j.pts) {
      const c = document.createElementNS(SVGNS, "circle");
      c.setAttribute("cx", String(x));
      c.setAttribute("cy", String(y));
      c.setAttribute("r", "0.5");
      c.setAttribute("fill", "none");
      g.appendChild(c);
      ms.push(c);
    }
    (_a = j.el.parentNode) == null ? void 0 : _a.insertBefore(g, j.el.nextSibling);
    groups.push(g);
    marks.push(ms);
  }
  const out = marks.map((ms) => ms.map((c) => {
    const r = c.getBoundingClientRect();
    return [(r.left + r.right) / 2, (r.top + r.bottom) / 2];
  }));
  for (const g of groups) g.remove();
  return out;
};
let ctx = null;
const inkCache = /* @__PURE__ */ new Map();
const inkFrac = (font, text) => {
  const key = font + "|" + text;
  const hit = inkCache.get(key);
  if (hit) return hit;
  if (!ctx) ctx = document.createElement("canvas").getContext("2d");
  let v = { top: 0.22, bot: 0.89 };
  if (ctx) {
    ctx.font = font;
    const m = ctx.measureText(text);
    const fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
    if (fa > 0 && fa + fd > 0) v = { top: (fa - m.actualBoundingBoxAscent) / (fa + fd), bot: (fa + m.actualBoundingBoxDescent) / (fa + fd) };
  }
  inkCache.set(key, v);
  return v;
};
const inkBox = (box, frac) => {
  const h = box.b - box.t;
  return { l: box.l, t: box.t + frac.top * h, r: box.r, b: box.t + frac.bot * h };
};
const overlap = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
const CLEAR_SHAPE = 14;
const CLEAR_TEXT = 10;
const CLEAR_CAPTION = 12;
const INSET_SURFACE = 14;
const HEADROOM = 450;
const boxGap = (a, b) => Math.hypot(Math.max(0, a.l - b.r, b.l - a.r), Math.max(0, a.t - b.b, b.t - a.b));
const ptBox = (x, y, b) => Math.hypot(Math.max(b.l - x, 0, x - b.r), Math.max(b.t - y, 0, y - b.b));
const ptSeg = (x, y, p, q) => {
  const dx = q[0] - p[0], dy = q[1] - p[1], L2 = dx * dx + dy * dy;
  const t = L2 > 0 ? Math.max(0, Math.min(1, ((x - p[0]) * dx + (y - p[1]) * dy) / L2)) : 0;
  return Math.hypot(x - (p[0] + t * dx), y - (p[1] + t * dy));
};
const segHits = (p, q, b) => {
  let t0 = 0, t1 = 1;
  const dx = q[0] - p[0], dy = q[1] - p[1];
  for (const [pp, qq] of [[-dx, p[0] - b.l], [dx, b.r - p[0]], [-dy, p[1] - b.t], [dy, b.b - p[1]]]) {
    if (pp === 0) {
      if (qq < 0) return false;
      continue;
    }
    const r = qq / pp;
    if (pp < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
  }
  return true;
};
const outlineGap = (pts, b, brk) => {
  let g = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (brk == null ? void 0 : brk.has(i)) {
      g = Math.min(g, ptBox(p[0], p[1], b));
      continue;
    }
    const q = pts[Math.min(i + 1, pts.length - 1)];
    if (segHits(p, q, b)) return 0;
    g = Math.min(
      g,
      ptBox(p[0], p[1], b),
      ptBox(q[0], q[1], b),
      ptSeg(b.l, b.t, p, q),
      ptSeg(b.r, b.t, p, q),
      ptSeg(b.l, b.b, p, q),
      ptSeg(b.r, b.b, p, q)
    );
  }
  return g;
};
const blockOf = (el) => {
  for (let n = el.parentElement; n; n = n.parentElement) {
    if (n instanceof SVGSVGElement) return n;
    const p = getComputedStyle(n).position;
    if (p === "absolute" || p === "fixed" || p === "relative") return n;
  }
  return null;
};
const inside = (p, b, pad = 0) => p[0] > b.l - pad && p[0] < b.r + pad && p[1] > b.t - pad && p[1] < b.b + pad;
export const Probe = () => {
  const frame = (0,esm.useCurrentFrame)();
  (0,react.useLayoutEffect)(() => {
    const handle = (0,esm.delayRender)(`probe ${frame}`);
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        measure(frame);
        (0,esm.continueRender)(handle);
      });
    });
    return () => {
      cancelAnimationFrame(raf);
      (0,esm.continueRender)(handle);
    };
  }, [frame]);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-canary-surface": true, style: { position: "absolute", left: 440, top: 20, width: 120, height: 60, background: "#ffffff" }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { style: { position: "absolute", left: 4, top: 16, font: "800 22px sans-serif", color: "#000000", whiteSpace: "nowrap" }, children: "CANARY-E" }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-canary-surface": true, style: { position: "absolute", left: 620, top: 10, width: 240, height: 80, background: "#ffffff" }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { style: { position: "absolute", left: 60, top: 26, font: "800 22px sans-serif", color: "#000000", whiteSpace: "nowrap" }, children: "CANARY-F" }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { "data-probe-canary": true, width: 420, height: 120, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("text", { x: 20, y: 50, style: { font: "800 26px sans-serif", fill: "#ffffff" }, children: "CANARY-A" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("line", { x1: 10, y1: 40, x2: 200, y2: 40, stroke: "#ffffff", strokeWidth: 3 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("line", { x1: 290, y1: 60, x2: 370, y2: 60, stroke: "#ffffff", strokeWidth: 3 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("circle", { "data-probe-occluder": "canary disc", cx: 330, cy: 60, r: 80, fill: "#000000" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("rect", { x: 20, y: 80, width: 120, height: 24, fill: "none", stroke: "#ffffff", strokeWidth: 2 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("text", { x: 330, y: 70, textAnchor: "middle", style: { font: "800 22px sans-serif", fill: "#ffffff" }, children: "CANARY-B" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("line", { x1: 13, y1: 140, x2: 13, y2: 200, stroke: "#ffffff", strokeWidth: 2 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("text", { x: 20, y: 180, style: { font: "800 22px sans-serif", fill: "#ffffff" }, children: "CANARY-C" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("line", { x1: 226, y1: 140, x2: 226, y2: 200, stroke: "#ffffff", strokeWidth: 2 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("text", { x: 260, y: 180, style: { font: "800 22px sans-serif", fill: "#ffffff" }, children: "CANARY-D" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("line", { x1: 560, y1: 160, x2: 840, y2: 160, stroke: "#ffffff", strokeWidth: 3 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("rect", { "data-probe-occluder-rect": "canary plate", x: 600, y: 115, width: 200, height: 90, fill: "#000000" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("text", { x: 700, y: 168, textAnchor: "middle", style: { font: "800 22px sans-serif", fill: "#ffffff" }, children: "CANARY-R" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("text", { x: 60, y: 1800, style: { font: "800 22px sans-serif", fill: "#ffffff" }, children: "CANARY-G" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("line", { x1: 440, y1: 283, x2: 660, y2: 283, stroke: "#ffffff", strokeWidth: 3 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("line", { x1: 680, y1: 283, x2: 900, y2: 283, stroke: "#ffffff", strokeWidth: 3 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("line", { x1: 440, y1: 31, x2: 660, y2: 31, stroke: "#ffffff", strokeWidth: 3 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("line", { x1: 680, y1: 31, x2: 900, y2: 31, stroke: "#ffffff", strokeWidth: 3 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("line", { x1: 440, y1: 1801, x2: 660, y2: 1801, stroke: "#ffffff", strokeWidth: 3 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("line", { x1: 680, y1: 1801, x2: 900, y2: 1801, stroke: "#ffffff", strokeWidth: 3 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("text", { id: "probe-canary-m", x: 120, y: 1885, style: { font: "800 22px sans-serif", fill: "#ffffff" }, children: "CANARY-M" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("rect", { "data-probe-occluder-rect": "canary plate M", x: 100, y: 1856, width: 200, height: 48, fill: "#000000" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("line", { x1: 90, y1: 1878, x2: 310, y2: 1878, stroke: "#ffffff", strokeWidth: 3 }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("rect", { "data-probe-occluder-rect": "canary plate N", x: 500, y: 1856, width: 200, height: 48, fill: "#000000" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("text", { x: 520, y: 1885, style: { font: "800 22px sans-serif", fill: "#ffffff" }, children: "CANARY-N" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("line", { x1: 490, y1: 1878, x2: 710, y2: 1878, stroke: "#ffffff", strokeWidth: 3 })
    ] }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-canary": true, style: { position: "absolute", left: 440, top: 230, width: 220, height: 30, overflow: "hidden" }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { id: "probe-canary-k", style: { position: "absolute", left: 20, top: 40, font: "800 22px sans-serif", color: "#ffffff", whiteSpace: "nowrap" }, children: "CANARY-K" }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-canary": true, style: { position: "absolute", left: 680, top: 230, width: 220, height: 30, overflow: "visible" }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { style: { position: "absolute", left: 20, top: 40, font: "800 22px sans-serif", color: "#ffffff", whiteSpace: "nowrap" }, children: "CANARY-L" }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-canary": true, "data-probe-clip-top": "50", style: { position: "absolute", left: 440, top: 0, width: 220, height: 60 }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { id: "probe-canary-t", style: { position: "absolute", left: 20, top: 18, font: "800 22px sans-serif", color: "#ffffff", whiteSpace: "nowrap" }, children: "CANARY-T" }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-canary": true, style: { position: "absolute", left: 680, top: 0, width: 220, height: 60 }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { style: { position: "absolute", left: 20, top: 18, font: "800 22px sans-serif", color: "#ffffff", whiteSpace: "nowrap" }, children: "CANARY-U" }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-canary": true, "data-probe-clip-bottom": "1775", style: { position: "absolute", left: 440, top: 1770, width: 220, height: 60 }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { id: "probe-canary-bt", style: { position: "absolute", left: 20, top: 18, font: "800 22px sans-serif", color: "#ffffff", whiteSpace: "nowrap" }, children: "CANARY-BT" }) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-canary": true, style: { position: "absolute", left: 680, top: 1770, width: 220, height: 60 }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { style: { position: "absolute", left: 20, top: 18, font: "800 22px sans-serif", color: "#ffffff", whiteSpace: "nowrap" }, children: "CANARY-BU" }) })
  ] });
};
function measure(frame) {
  const root = document.getElementById("bnx-root");
  if (!root) {
    console.log(`PROBE ${frame} {"err":"no root"}`);
    return;
  }
  const skip = (el) => !!el.closest('[data-probe="bg"]');
  const isCB = (cs) => cs.position !== "static" || cs.transform !== "none" || cs.perspective !== "none" || cs.filter !== "none";
  const clipMemo = /* @__PURE__ */ new Map();
  const clipOf = (el) => {
    var _a, _b;
    if (clipMemo.has(el)) return clipMemo.get(el);
    let c = null, escaping = false;
    for (let n = el; n !== root; ) {
      const p = n.parentElement;
      if (!p) break;
      const ncs = getComputedStyle(n);
      if (ncs.position === "absolute" || ncs.position === "fixed") escaping = true;
      const pcs = getComputedStyle(p);
      const cb = isCB(pcs);
      const clips = (p instanceof HTMLElement || p instanceof SVGSVGElement) && (pcs.overflowX !== "visible" || pcs.overflowY !== "visible");
      if (clips && (!escaping || cb)) {
        const r = p.getBoundingClientRect();
        if (!(r.left <= 0.5 && r.top <= 0.5 && r.right >= W - 0.5 && r.bottom >= H - 0.5)) {
          const b = { l: r.left, t: r.top, r: r.right, b: r.bottom };
          c = c ? { l: Math.max(c.l, b.l), t: Math.max(c.t, b.t), r: Math.min(c.r, b.r), b: Math.min(c.b, b.b) } : b;
        }
      }
      if (cb) escaping = false;
      const ct = (_a = p.getAttribute) == null ? void 0 : _a.call(p, "data-probe-clip-top");
      if (ct) {
        const b = { l: -1e6, t: Number(ct), r: 1e6, b: 1e6 };
        c = c ? { l: c.l, t: Math.max(c.t, b.t), r: c.r, b: c.b } : b;
      }
      const cbo = (_b = p.getAttribute) == null ? void 0 : _b.call(p, "data-probe-clip-bottom");
      if (cbo) {
        const b = { l: -1e6, t: -1e6, r: 1e6, b: Number(cbo) };
        c = c ? { l: c.l, t: c.t, r: c.r, b: Math.min(c.b, b.b) } : b;
      }
      n = p;
    }
    clipMemo.set(el, c);
    return c;
  };
  const texts = [];
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const t = (n.textContent || "").trim();
    if (!t) continue;
    const el = n.parentElement;
    if (!el || skip(el)) continue;
    const cs = getComputedStyle(el);
    const op = effOp(el) * Math.max(alphaOf(cs.color), el instanceof SVGElement ? alphaOf(cs.fill) * parseFloat(cs.fillOpacity || "1") : 0);
    if (op < VIS) continue;
    const shown = cs.textTransform === "uppercase" ? t.toUpperCase() : t;
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const frac = inkFrac(font, shown);
    const rects = el instanceof SVGElement ? [el.getBoundingClientRect()] : (() => {
      const rg = document.createRange();
      rg.selectNodeContents(n);
      const rs = Array.from(rg.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
      return rs.length ? rs : [el.getBoundingClientRect()];
    })();
    const clip = clipOf(el);
    for (const r of rects) {
      let box = { l: r.left, t: r.top, r: r.right, b: r.bottom };
      if (box.r - box.l <= 0) continue;
      let ink = inkBox(box, frac);
      if (clip) {
        ink = { l: Math.max(ink.l, clip.l), t: Math.max(ink.t, clip.t), r: Math.min(ink.r, clip.r), b: Math.min(ink.b, clip.b) };
        if (ink.r - ink.l < 1 || ink.b - ink.t < 1) continue;
        box = { l: Math.max(box.l, clip.l), t: Math.max(box.t, clip.t), r: Math.min(box.r, clip.r), b: Math.min(box.b, clip.b) };
      }
      texts.push({ t: t.slice(0, 40), box, ink, op, cap: !!el.closest('[data-probe="caption"]'), fs: parseFloat(cs.fontSize), el });
    }
  }
  const shapes = [];
  const occ = Array.from(root.querySelectorAll("[data-probe-occluder]")).map((o) => {
    const r = o.getBoundingClientRect();
    return { o, cx: (r.left + r.right) / 2, cy: (r.top + r.bottom) / 2, r: Math.min(r.width, r.height) / 2 - 2 };
  }).filter((q) => q.r > 2);
  const occR = Array.from(root.querySelectorAll("[data-probe-occluder-rect]")).map((o) => {
    const r = o.getBoundingClientRect();
    return { o, l: r.left + 6, t: r.top + 6, r: r.right - 6, b: r.bottom - 6, arr: o.getAttribute("data-probe-arriving") };
  }).filter((q) => q.r > q.l && q.b > q.t);
  const arrN = /* @__PURE__ */ new Set();
  const opaque = (q, el) => {
    if (relOp(q.o, el) >= 0.9) return true;
    if (!q.arr) return false;
    arrN.add(q.arr);
    return true;
  };
  const relOp = (o, el) => {
    let v = 1;
    for (let n = o; n && !n.contains(el); n = n.parentElement) v *= parseFloat(getComputedStyle(n).opacity || "1");
    return v;
  };
  const CUT_EDGE = CLEAR_SHAPE;
  const cutBy = /* @__PURE__ */ new Map();
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    for (const q of occR) {
      if (q.o.contains(t.el) || !(q.o.compareDocumentPosition(t.el) & Node.DOCUMENT_POSITION_PRECEDING)) continue;
      if (!opaque(q, t.el)) continue;
      const R = { l: q.l - 6, t: q.t - 6, r: q.r + 6, b: q.b + 6 };
      const k = t.ink;
      if (R.r + CLEAR_SHAPE <= k.l || R.l - CLEAR_SHAPE >= k.r || R.b + CLEAR_SHAPE <= k.t || R.t - CLEAR_SHAPE >= k.b) continue;
      const cut = (b) => {
        if (R.r <= b.l || R.l >= b.r || R.b <= b.t || R.t >= b.b) return b;
        const wide = R.l <= b.l && R.r >= b.r, tall = R.t <= b.t && R.b >= b.b;
        if (wide && tall) return null;
        if (wide && R.t <= b.t) return { ...b, t: R.b };
        if (wide && R.b >= b.b) return { ...b, b: R.t };
        if (tall && R.l <= b.l) return { ...b, l: R.r };
        if (tall && R.r >= b.r) return { ...b, r: R.l };
        return b;
      };
      const ink = cut(k);
      if (!ink || ink.r - ink.l < 1 || ink.b - ink.t < 1) {
        texts.splice(i, 1);
        cutBy.delete(t);
        break;
      }
      const overlapping = !(R.r <= k.l || R.l >= k.r || R.b <= k.t || R.t >= k.b);
      if (overlapping && ink === k) continue;
      t.ink = ink;
      t.box = cut(t.box) ?? t.box;
      cutBy.set(t, [...cutBy.get(t) ?? [], R]);
    }
  }
  const occlude = (el, pts) => {
    const keep = pts.map(() => true);
    const clip = clipOf(el);
    if (clip) pts.forEach((p, i) => {
      if (p[0] < clip.l - 0.5 || p[0] > clip.r + 0.5 || p[1] < clip.t - 0.5 || p[1] > clip.b + 0.5) keep[i] = false;
    });
    for (const q of occ) {
      if (q.o === el || q.o.contains(el) || !(q.o.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING)) continue;
      if (relOp(q.o, el) < 0.9) continue;
      pts.forEach((p, i) => {
        if (Math.hypot(p[0] - q.cx, p[1] - q.cy) <= q.r) keep[i] = false;
      });
    }
    for (const q of occR) {
      if (q.o === el || q.o.contains(el) || !(q.o.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING)) continue;
      if (!opaque(q, el)) continue;
      pts.forEach((p, i) => {
        if (p[0] > q.l && p[0] < q.r && p[1] > q.t && p[1] < q.b) keep[i] = false;
      });
    }
    const out = [], brk = /* @__PURE__ */ new Set();
    let hidden = false;
    pts.forEach((p, i) => {
      if (!keep[i]) {
        hidden = true;
        return;
      }
      if (hidden && out.length) brk.add(out.length - 1);
      hidden = false;
      out.push(p);
    });
    return { pts: out, brk };
  };
  const depthN = /* @__PURE__ */ new Map();
  const intended = (el) => !!el.closest("[data-probe-intended]");
  const jobs = [];
  let nCal = 0;
  root.querySelectorAll("rect, circle, ellipse, line, polyline, polygon, path").forEach((el) => {
    if (el.closest("defs, clipPath, mask, marker, pattern, symbol")) return;
    const calib = el.tagName.toLowerCase() === "rect" && nCal < 6 && !skip(el) && el.getBoundingClientRect().width >= 4 && el.getBoundingClientRect().height >= 4;
    if (calib) nCal++;
    let op = 0;
    if (!skip(el) && !intended(el)) {
      const cs = getComputedStyle(el);
      const paint = Math.max(
        alphaOf(cs.stroke) * parseFloat(cs.strokeOpacity || "1") * (parseFloat(cs.strokeWidth) > 0 ? 1 : 0),
        alphaOf(cs.fill) * parseFloat(cs.fillOpacity || "1")
      );
      op = effOp(el) * paint;
    }
    if (op < VIS && !calib) return;
    const pts = outline(el);
    if (pts.length) jobs.push({ el, pts, d: desc(el), op, cap: !!el.closest('[data-probe="caption"]'), calib });
  });
  const projected = projectAll(jobs);
  let cal = 0, calN = 0;
  jobs.forEach((j, i) => {
    const sp = projected[i];
    if (j.calib && sp.length) {
      const r = j.el.getBoundingClientRect();
      const xs = sp.map((p) => p[0]), ys = sp.map((p) => p[1]);
      cal = Math.max(cal, Math.abs(Math.min(...xs) - r.left), Math.abs(Math.max(...xs) - r.right), Math.abs(Math.min(...ys) - r.top), Math.abs(Math.max(...ys) - r.bottom));
      calN++;
    }
    if (j.op < VIS) return;
    const oc = occlude(j.el, sp);
    if (oc.pts.length) shapes.push({ d: j.d, pts: oc.pts, brk: oc.brk, op: j.op, cap: j.cap, el: j.el });
  });
  const divJobs = [];
  root.querySelectorAll("div").forEach((el) => {
    if (skip(el) || intended(el) || el.closest("[data-probe-canary]")) return;
    if (el.closest("[data-probe-depth]")) {
      depthN.set(el.closest("[data-probe-depth]").getAttribute("data-probe-depth") ?? "?", (depthN.get(el.closest("[data-probe-depth]").getAttribute("data-probe-depth") ?? "?") ?? 0) + 1);
      return;
    }
    const cs = getComputedStyle(el);
    if (cs.clipPath && cs.clipPath !== "none") return;
    const bw = Math.max(parseFloat(cs.borderTopWidth) || 0, parseFloat(cs.borderLeftWidth) || 0, parseFloat(cs.borderRightWidth) || 0, parseFloat(cs.borderBottomWidth) || 0);
    const bc = [cs.borderTopColor, cs.borderLeftColor, cs.borderRightColor, cs.borderBottomColor].map(alphaOf);
    const linear = /linear-gradient/.test(cs.backgroundImage);
    const paint = Math.max(bw > 0 ? Math.max(...bc) : 0, alphaOf(cs.backgroundColor), linear ? 1 : 0);
    if (paint < 0.08) return;
    const op = effOp(el) * paint;
    if (op < VIS) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 && r.height < 2) return;
    if (r.width >= W - 1 && r.height >= H - 1) return;
    divJobs.push({ el, d: desc(el), op, cap: !!el.closest('[data-probe="caption"]'), positioned: cs.position !== "static" });
  });
  {
    const marks = divJobs.map((j) => {
      if (!j.positioned) return [];
      const cs2 = getComputedStyle(j.el);
      const bl2 = parseFloat(cs2.borderLeftWidth) || 0, bt2 = parseFloat(cs2.borderTopWidth) || 0;
      const w = j.el.offsetWidth, h = j.el.offsetHeight;
      return [[-bl2, -bt2], [w - bl2, -bt2], [w - bl2, h - bt2], [-bl2, h - bt2]].map(([x, y]) => {
        const m = document.createElement("div");
        m.setAttribute("data-probe-marker", "1");
        m.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:0;height:0;margin:0;padding:0;border:0`;
        j.el.appendChild(m);
        return m;
      });
    });
    divJobs.forEach((j, i) => {
      let corners;
      if (marks[i].length) {
        corners = marks[i].map((m) => {
          const q2 = m.getBoundingClientRect();
          return [q2.left, q2.top];
        });
        const q = j.el.getBoundingClientRect(), xs = corners.map((c) => c[0]), ys = corners.map((c) => c[1]);
        cal = Math.max(cal, Math.abs(Math.min(...xs) - q.left), Math.abs(Math.max(...xs) - q.right), Math.abs(Math.min(...ys) - q.top), Math.abs(Math.max(...ys) - q.bottom));
        calN++;
      } else {
        const q = j.el.getBoundingClientRect();
        corners = [[q.left, q.top], [q.right, q.top], [q.right, q.bottom], [q.left, q.bottom]];
      }
      const pts = [];
      for (let c = 0; c < 4; c++) {
        const [x0, y0] = corners[c], [x1, y1] = corners[(c + 1) % 4];
        const ns = Math.min(1200, Math.max(16, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 8)));
        for (let s = 0; s <= ns; s++) pts.push([x0 + (x1 - x0) * s / ns, y0 + (y1 - y0) * s / ns]);
      }
      const oc = occlude(j.el, pts);
      shapes.push({ d: j.d, pts: oc.pts, brk: oc.brk, op: j.op, cap: j.cap, el: j.el });
    });
    for (const ms of marks) for (const m of ms) m.remove();
  }
  const hits = [];
  const trimFor = (s, t) => {
    const Rs = cutBy.get(t);
    if (!Rs) return s;
    const onEdge = (p) => Rs.some((R) => p[0] > R.l - CUT_EDGE && p[0] < R.r + CUT_EDGE && p[1] > R.t - CUT_EDGE && p[1] < R.b + CUT_EDGE && !(p[0] > R.l + CUT_EDGE && p[0] < R.r - CUT_EDGE && p[1] > R.t + CUT_EDGE && p[1] < R.b - CUT_EDGE));
    const out = [], brk = /* @__PURE__ */ new Set();
    let gone = false;
    s.pts.forEach((p, i) => {
      if (onEdge(p)) {
        gone = true;
        return;
      }
      if (gone && out.length) brk.add(out.length - 1);
      gone = false;
      out.push(p);
      if (s.brk.has(i)) brk.add(out.length - 1);
    });
    return { pts: out, brk };
  };
  const turnN = /* @__PURE__ */ new Map();
  const turning = (t, el) => {
    for (const [attr, kind] of [["data-probe-turning", "turning"], ["data-probe-object", "object"]]) {
      const a = t.el.closest(`[${attr}]`);
      if (!a || a !== el.closest(`[${attr}]`)) continue;
      const w = `${kind}|${a.getAttribute(attr) ?? "?"}`;
      turnN.set(w, (turnN.get(w) ?? 0) + 1);
      return true;
    }
    return false;
  };
  for (const [what, n] of depthN) hits.push({ k: "depth-ok", a: `${what} (${n} layers)` });
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    const a = texts[i], b = texts[j];
    if (a.cap && b.cap) continue;
    if (a.el === b.el) continue;
    if (turning(a, b.el)) continue;
    const ov = overlap(a.ink, b.ink);
    if (ov > 1) hits.push({ k: a.cap || b.cap ? "caption\xD7text" : "text\xD7text", a: a.t, b: b.t, ov: Math.round(ov), op: [+a.op.toFixed(2), +b.op.toFixed(2)] });
  }
  for (const s of shapes) for (const t of texts) {
    if (s.cap && t.cap) continue;
    if (s.el.contains(t.el)) continue;
    if (turning(t, s.el)) continue;
    let n = 0;
    for (const p of trimFor(s, t).pts) if (inside(p, t.ink)) n++;
    const okc = t.cap ? s.el.closest("[data-probe-headroom-ok]") : null;
    if (n > 0) hits.push(okc ? { k: "headroom-ok", a: okc.getAttribute("data-probe-headroom-ok") ?? "", top: 0 } : { k: t.cap ? "caption\xD7shape" : s.cap ? "captionicon\xD7text" : "shape\xD7text", a: t.t, b: s.d, n, op: [+t.op.toFixed(2), +s.op.toFixed(2)] });
  }
  const wholly = (b) => b.r <= 0 || b.l >= W || b.b <= 0 || b.t >= H;
  for (const t of texts) {
    const off = t.box.l < 0 || t.box.r > W || t.box.t < 0 || t.box.b > H, edge = t.box.l < 40 || t.box.r > W - 40;
    if (!off && !edge) continue;
    if (wholly(t.box)) {
      hits.push({ k: "offframe-ok", a: t.t });
      continue;
    }
    const lv = t.el.closest("[data-probe-leaving]");
    if (lv) {
      hits.push({ k: "leaving-ok", a: lv.getAttribute("data-probe-leaving") ?? "?" });
      continue;
    }
    hits.push({ k: off ? "text-clipped" : "text-edge", a: t.t, box: [t.box.l, t.box.t, t.box.r, t.box.b].map(Math.round) });
  }
  for (const s of shapes) {
    if (!s.pts.length) continue;
    const sb = { l: Infinity, t: Infinity, r: -Infinity, b: -Infinity };
    for (const [x, y] of s.pts) {
      sb.l = Math.min(sb.l, x);
      sb.r = Math.max(sb.r, x);
      sb.t = Math.min(sb.t, y);
      sb.b = Math.max(sb.b, y);
    }
    for (const t of texts) {
      if (s.cap && t.cap) continue;
      if (s.el.contains(t.el)) continue;
      const lim = t.cap || s.cap ? CLEAR_CAPTION : CLEAR_SHAPE;
      if (boxGap(sb, t.ink) >= lim) continue;
      if (turning(t, s.el)) continue;
      const sp = trimFor(s, t);
      const g = outlineGap(sp.pts, t.ink, sp.brk);
      const crossed = sp.pts.some((p) => inside(p, t.ink));
      const okn = t.cap ? s.el.closest("[data-probe-headroom-ok]") : null;
      if (g < lim && !crossed) hits.push(okn ? { k: "headroom-ok", a: okn.getAttribute("data-probe-headroom-ok") ?? "", top: 0 } : { k: t.cap || s.cap ? "near-caption" : "near-shape", a: t.t, b: s.d, gap: +g.toFixed(1), op: [+t.op.toFixed(2), +s.op.toFixed(2)] });
    }
  }
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    const a = texts[i], b = texts[j];
    if (a.cap && b.cap) continue;
    if (a.el === b.el) continue;
    if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
    if (turning(a, b.el)) continue;
    const ba = blockOf(a.el), bb = blockOf(b.el);
    if (ba && ba === bb) continue;
    if (overlap(a.ink, b.ink) > 1) continue;
    const lim = a.cap || b.cap ? CLEAR_CAPTION : CLEAR_TEXT;
    const g = boxGap(a.ink, b.ink);
    if (g < lim) hits.push({ k: a.cap || b.cap ? "near-caption" : "near-text", a: a.t, b: b.t, gap: +g.toFixed(1), op: [+a.op.toFixed(2), +b.op.toFixed(2)] });
  }
  for (const s of shapes) {
    if (!s.pts.length) continue;
    for (const t of texts) {
      if (s.cap && t.cap) continue;
      if (!s.el.contains(t.el) || s.el === t.el) continue;
      if (turning(t, s.el)) continue;
      const sp = trimFor(s, t);
      const g = outlineGap(sp.pts, t.ink, sp.brk);
      if (g < INSET_SURFACE) hits.push({ k: "text-crowds-surface", a: t.t, b: s.d, gap: +g.toFixed(1), op: [+t.op.toFixed(2), +s.op.toFixed(2)] });
    }
  }
  for (const [w] of turnN) {
    const [kind, what] = w.split("|");
    hits.push({ k: `${kind}-ok`, a: what });
  }
  for (const what of arrN) hits.push({ k: "arriving-ok", a: what });
  for (const t of texts) if (!t.cap && t.op >= 0.3 && t.ink.t < HEADROOM && !wholly(t.ink)) hits.push({ k: "caption-headroom", a: t.t, top: Math.round(t.ink.t) });
  for (const s of shapes) {
    if (s.cap || s.op < 0.3 || !s.pts.length) continue;
    const seen = s.pts.filter((p) => p[0] > 0 && p[0] < W);
    if (!seen.length) continue;
    const top = Math.min(...seen.map((p) => p[1]));
    if (top >= HEADROOM) continue;
    const ok = s.el.closest("[data-probe-headroom-ok]");
    hits.push(ok ? { k: "headroom-ok", a: ok.getAttribute("data-probe-headroom-ok") ?? "", top: Math.round(top) } : { k: "caption-headroom", a: s.d, top: Math.round(top) });
  }
  const real = (el) => !el.closest("[data-probe-canary], [data-probe-canary-surface]");
  const bs = shapes.filter((s) => !s.cap && s.op >= 0.3 && s.pts.length && real(s.el));
  const bt = texts.filter((t) => !t.cap && t.op >= 0.3 && real(t.el) && !/^CANARY/.test(t.t) && !t.el.closest("[data-probe-compliance]"));
  let bl = Infinity, br = -Infinity;
  for (const s of bs) for (const [x] of s.pts) {
    bl = Math.min(bl, x);
    br = Math.max(br, x);
  }
  for (const t of bt) {
    bl = Math.min(bl, t.ink.l);
    br = Math.max(br, t.ink.r);
  }
  const items = new Set(bt.filter((t) => t.op >= 0.5 && t.fs >= 19 && /[A-Za-z]{2,}/.test(t.t) && !t.el.closest("[data-probe-print]")).map((t) => t.el.tagName === "SPAN" && t.el.parentElement ? t.el.parentElement : t.el));
  let nD = 0;
  root.querySelectorAll("*").forEach((el) => {
    if (skip(el) || !real(el) || el.closest('[data-probe="caption"]') || el.closest("defs, clipPath, pattern, mask")) return;
    if (effOp(el) < 0.3) return;
    const tag = el.tagName.toLowerCase();
    if (el instanceof SVGGraphicsElement) {
      if (el instanceof SVGSVGElement || tag === "g" || tag === "text" || tag === "tspan") return;
      if (tag === "path" || tag === "polygon" || tag === "polyline") {
        const v = ((el.getAttribute("d") ?? el.getAttribute("points") ?? "").match(/,/g) ?? []).length;
        nD += Math.max(1, Math.floor(v / 8));
      } else nD += 1;
      return;
    }
    if (!(el instanceof HTMLElement)) return;
    const cs = getComputedStyle(el);
    const lin = /linear-gradient/.test(cs.backgroundImage);
    if (alphaOf(cs.backgroundColor) > 0.05 || lin || parseFloat(cs.borderTopWidth) > 0) nD += 1;
  });
  const metrics = {
    nB: bs.length,
    nD,
    bW: Number.isFinite(bl) ? Math.round(Math.max(0, Math.min(W, br) - Math.max(0, bl))) : 0,
    nTB: items.size,
    tB: [...items].map((el) => (el.textContent || "").trim().slice(0, 24))
  };
  const roots = document.querySelectorAll("#bnx-root").length;
  const hk = (k, a) => hits.some((h) => h.k === k && h.a === a);
  const canary = {
    a: hk("shape\xD7text", "CANARY-A"),
    b: hk("shape\xD7text", "CANARY-B"),
    // ★ the clearance canaries: C sits 7 px right of a rule and MUST be reported; D sits 34 px from one
    //   and must NOT — a clearance check that cannot fire, or fires on everything, refuses the run
    // ★ C (must fire) is judged by the SAME own-rule filter as D below, so a filter that could never match makes C miss
    //   and the run refuses: D's silence is only trusted while its twin fires through the identical test
    c: hits.some((h) => {
      const x = h;
      return x.k === "near-shape" && x.a === "CANARY-C" && /^canary/.test(x.b ?? "");
    }),
    // ⚠ V34: judged against the canary's OWN rule only (as R, K, L and N are): the ledger's 2.2× dive passes its top edge
    //   near D's spot at f876, and a real shape crossing the canary word is not the clearance check failing
    d: hits.some((h) => {
      const x = h;
      return (x.k === "near-shape" || x.k === "shape\xD7text") && x.a === "CANARY-D" && /^canary/.test(x.b ?? "");
    }),
    // ★ the inner-margin canaries: E is printed ~3 px from its plate's right edge and MUST be reported;
    //   F sits centred with wide margins and must NOT
    e: hk("text-crowds-surface", "CANARY-E"),
    f: hk("text-crowds-surface", "CANARY-F"),
    // ★ the headroom canaries (G1, 2026-09-29): A sits at the top and MUST be reported; G sits at y ~1800 and must NOT
    g: hk("caption-headroom", "CANARY-A"),
    h: hk("caption-headroom", "CANARY-G"),
    // ★ the rect-occluder canary (V31): a line through CANARY-R, behind an opaque rectangle, must NOT be reported
    //   ⚠ judged against the canary's OWN line only: the hook's stock stack runs up through this spot at the top of the
    //   frame, and a real shape crossing the canary word is not the occluder failing
    r: hits.some((h) => {
      const x = h;
      return (x.k === "shape\xD7text" || x.k === "near-shape") && x.a === "CANARY-R" && /^canary line/.test(x.b ?? "");
    }),
    // ★ the overflow canaries (V33): K, wholly outside its window, must NOT be reported and must be PRESENT in the DOM;
    //   L, the same layout with a visible overflow, MUST be reported against its own line
    k: !document.getElementById("probe-canary-k") || hits.some((h) => {
      const x = h;
      return (x.k === "shape\xD7text" || x.k === "near-shape") && x.a === "CANARY-K" && /^canary line/.test(x.b ?? "");
    }),
    l: hits.some((h) => {
      const x = h;
      return x.k === "shape\xD7text" && x.a === "CANARY-L" && /^canary line/.test(x.b ?? "");
    }),
    // ★ the clip-top canaries (E7): T, wholly above its declared mask line, must NOT be reported and must be PRESENT; U MUST be
    t: !document.getElementById("probe-canary-t") || hits.some((h) => {
      const x = h;
      return (x.k === "shape\xD7text" || x.k === "near-shape") && x.a === "CANARY-T" && /^canary line/.test(x.b ?? "");
    }),
    u: hits.some((h) => {
      const x = h;
      return x.k === "shape\xD7text" && x.a === "CANARY-U" && /^canary line/.test(x.b ?? "");
    }),
    // ★ the clip-bottom canaries (V37): BT, wholly below its declared mask line, must NOT be reported and must be PRESENT;
    //   BU MUST be
    bt: !document.getElementById("probe-canary-bt") || hits.some((h) => {
      const x = h;
      return (x.k === "shape\xD7text" || x.k === "near-shape") && x.a === "CANARY-BT" && /^canary line/.test(x.b ?? "");
    }),
    bu: hits.some((h) => {
      const x = h;
      return x.k === "shape\xD7text" && x.a === "CANARY-BU" && /^canary line/.test(x.b ?? "");
    }),
    // ★ the text-behind-a-plate canaries (V33): M (behind its plate) must NOT be reported and must be PRESENT; N MUST be
    m: !document.getElementById("probe-canary-m") || hits.some((h) => h.a === "CANARY-M"),
    n: hits.some((h) => {
      const x = h;
      return x.k === "shape\xD7text" && x.a === "CANARY-N" && /^canary line/.test(x.b ?? "");
    })
  };
  console.log(`PROBE ${frame} ${JSON.stringify({ hits, nT: texts.length, nS: shapes.length, cal: +cal.toFixed(2), calN, roots, canary, metrics })}`);
}
