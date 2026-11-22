import { useEffect } from "react";
import { continueRender, delayRender, useCurrentFrame } from "remotion";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// THE INTERSECTION PROBE — mounted only with inputProps { probe: true } (scratchpad/sweep.mjs).
// After the frame has painted (delayRender + two animation frames — never synchronously), it measures
// every VISIBLE ink element inside each `data-probe-group` — text runs, images, SVG shapes, and solid
// or linear-gradient boxes — with getBoundingClientRect (transform-aware), and logs one JSON line per
// frame. Skipped: anything under `data-probe-skip` (parallax dust/pools), glows (a CSS or SVG blur
// filter, radial-gradient-only boxes), elements whose cumulative opacity is under 0.08.
// ══════════════════════════════════════════════════════════════════════════════════════════════

// ★ THE JOURNEY (2026-09-26): a group element may carry `data-blur` — the SCREEN blur the journey camera's depth
// of field puts on that whole layer (world.tsx), or the question's defocus as it passes the lens. Items under a
// group blurred ≥ DEFOCUS px are still logged (so the sweep can measure how long two places share the screen)
// but flagged `b`, and never counted as a collision: a defocused layer behind or in front of a sharp one is
// depth, not an intersection (Bankers/CLAUDE.md §2.5.1).
const DEFOCUS = 4;
// `x`: the group is deliberately LEAVING through a frame edge (data-exiting) — its edge crossing is the exit, not a clip
// `bl`: the group's screen blur in px (0 when sharp) — so the sweep can tell a defocused figure that still READS (≈ 4–12 px)
// from one that has become a glow (SOFTCAP, 2026-09-26)
// `a`: the element is under `data-probe-also="<place>"` — an object CARRIED across a morph (the index's logos, drawn on by
// the takeaway): it is on screen for that place too, and the sweep's OVERLAP count says so (2026-09-26, §2.5.1b)
type Item = { g: string; t: "text" | "shape"; s: string; r: [number, number, number, number]; o: number; b: 0 | 1; x: 0 | 1; L?: 1; bl?: number; a?: string; q?: number[] };
// `q`: an SVG text ink QUAD [x0,y0,…,x3,y3] (its own rotated rectangle on screen) — the sweep compares two quads rather
// than two axis-aligned hulls, which at a tilt overlap where the letters do not (the quote board, 2026-09-26)

const cumulativeOpacity = (el: Element) => {
  let o = 1;
  for (let e: Element | null = el; e && e !== document.body; e = e.parentElement) {
    o *= parseFloat(getComputedStyle(e).opacity || "1");
    if (o < 0.02) return o;
  }
  return o;
};
const blurred = (el: Element) => {
  for (let e: Element | null = el; e && !e.hasAttribute("data-probe-group"); e = e.parentElement) {
    const f = getComputedStyle(e).filter;
    if (f && f.includes("blur")) return true;
    if (e.getAttribute && e.getAttribute("filter")) return true;
  }
  return false;
};
const ownText = (el: Element) =>
  Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent ?? "").join("").trim();

const probeCtx = document.createElement("canvas").getContext("2d")!;

type Local = { inv: DOMMatrix; r: [number, number, number, number] };
/** item index → an SVG text's ink rect in its own units + the screen→local matrix (for LINE) */
const svgLocal = new Map<number, Local>();
const svgInk = (el: SVGTextElement, txt: string) => {
  const m = el.getScreenCTM();
  if (!m) return null;
  const bb = el.getBBox();
  const cs = getComputedStyle(el);
  probeCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const mt = probeCtx.measureText(txt);
  const fa = mt.fontBoundingBoxAscent, fd = mt.fontBoundingBoxDescent;
  if (!(bb.height > 0) || !(fa + fd > 0)) return null;
  const sy = bb.height / (fa + fd), base = bb.y + fa * sy;
  const r: Local["r"] = [bb.x, base - mt.actualBoundingBoxAscent * sy, bb.x + bb.width, base + mt.actualBoundingBoxDescent * sy];
  const pts = [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]].map(([x, y]) => new DOMPoint(x, y).matrixTransform(m));
  const L = Math.min(...pts.map((p) => p.x)), T = Math.min(...pts.map((p) => p.y)), R = Math.max(...pts.map((p) => p.x)), B = Math.max(...pts.map((p) => p.y));
  return { hull: { left: L, top: T, width: R - L, height: B - T, right: R, bottom: B }, local: { inv: m.inverse(), r }, quad: pts.flatMap((p) => [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]) };
};

/** ★ A TILTED SVG SHAPE BY ITS OUTLINE QUAD (Video 2, 2026-09-28). Its box is the axis-aligned HULL of the rotated shape:
 *  the hook's receipt hangs at 24°, and its hull "crossed" the caption chip that the strip itself clears by 150 px (CROSS at
 *  frame 9, SOFTCAP at 264). So a rotated rect / path / polygon / circle gets the quad of its own bbox mapped by
 *  getScreenCTM — and the sweep compares quads by the separating-axis test, as it already does for tilted text. Under a
 *  CSS 3-D transform getScreenCTM is 2-D and drifts (V27), so the quad is used ONLY when its hull agrees with the
 *  browser's own box to 3 px; otherwise the box stands. Proven on every frame by shapeCanary(). */
const shapeQuad = (el: Element, bcr: { left: number; top: number; right: number; bottom: number }): number[] | undefined => {
  if (!(el instanceof SVGGraphicsElement) || el instanceof SVGSVGElement || el instanceof SVGTextElement) return undefined;
  const m = el.getScreenCTM();
  if (!m || (Math.abs(m.b) < 1e-3 && Math.abs(m.c) < 1e-3)) return undefined;   // not rotated: the box IS the outline
  const bb = el.getBBox();
  if (!(bb.width > 1 && bb.height > 1)) return undefined;
  const pts = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x + bb.width, bb.y + bb.height], [bb.x, bb.y + bb.height]].map(([x, y]) => new DOMPoint(x, y).matrixTransform(m));
  const L = Math.min(...pts.map((p) => p.x)), T = Math.min(...pts.map((p) => p.y)), R = Math.max(...pts.map((p) => p.x)), B = Math.max(...pts.map((p) => p.y));
  if (Math.abs(L - bcr.left) > 3 || Math.abs(T - bcr.top) > 3 || Math.abs(R - bcr.right) > 3 || Math.abs(B - bcr.bottom) > 3) return undefined;
  return pts.flatMap((p) => [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]);
};
/** a 300×40 rect rotated 30° about its own centre: its quad must exist, and its corners must be where the geometry says */
const shapeCanary = (): boolean => {
  const h = document.createElement("div");
  h.style.cssText = "position:fixed;left:0;top:700px;width:400px;height:400px;opacity:1;";
  h.innerHTML = `<svg width="400" height="400"><rect x="50" y="180" width="300" height="40" transform="rotate(30 200 200)" fill="#fff"/></svg>`;
  document.body.appendChild(h);
  const r = h.querySelector("rect")!;
  const q = shapeQuad(r, r.getBoundingClientRect());
  h.remove();
  if (!q) return false;
  const c = Math.cos(Math.PI / 6), s = Math.sin(Math.PI / 6);
  const want = [[50, 180], [350, 180], [350, 220], [50, 220]].flatMap(([x, y]) => [200 + (x - 200) * c - (y - 200) * s, 700 + 200 + (x - 200) * s + (y - 200) * c]);
  return want.every((v, i) => Math.abs(v - q[i]) < 1.5);
};

const measure = (frame: number) => {
  const items: Item[] = [];
  svgLocal.clear();
  document.querySelectorAll("[data-probe-group]").forEach((groupEl) => {
    const g = groupEl.getAttribute("data-probe-group")!;
    const layerBlur = parseFloat(groupEl.getAttribute("data-blur") ?? "0") || 0;
    const b: 0 | 1 = layerBlur >= DEFOCUS ? 1 : 0;
    const x: 0 | 1 = groupEl.getAttribute("data-exiting") === "1" ? 1 : 0;
    groupEl.querySelectorAll("*").forEach((el) => {
      if (el.closest("[data-probe-skip]")) return;
      const tag = el.tagName.toLowerCase();
      const txt = ownText(el);
      let t: Item["t"] | null = null;
      if (txt) t = "text";
      else if (tag === "img" || ["rect", "path", "line", "circle", "polygon"].includes(tag)) t = "shape";
      else if (tag === "div") {
        const cs = getComputedStyle(el);
        const bg = cs.backgroundImage;
        const solid = cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent";
        const linear = bg && bg !== "none" && bg.includes("linear-gradient") && !bg.includes("radial-gradient");
        const conic = bg && bg.includes("conic-gradient");
        if (solid || linear || conic) t = "shape";
      }
      if (!t) return;
      // ★ a shape under a blur filter is logged as DEFOCUSED (never a collision) rather than dropped: it may be a glow,
      // or an object mid-way through its eased entrance from depth — either way it is ON SCREEN, and dropping it made the
      // overlap count miss every place still arriving (Video 1, 2026-09-26: hook → chip measured 0 f)
      const soft = t === "shape" && blurred(el);
      let quad: number[] | undefined;
      const also = el.closest("[data-probe-also]")?.getAttribute("data-probe-also") ?? null;
      const o = cumulativeOpacity(el);
      if (o < 0.08) return;
      // ★ HTML TEXT IS MEASURED BY ITS OWN GLYPHS (a Range over its text nodes), not by its element box: the caption
      // chip is a FULL-WIDTH div, and once the caption camera scaled it, its box poked past both frame edges and
      // "crossed" every corner piece — false CLIPs and CROSSes (2026-09-26). SVG text keeps the element box (Range
      // rects for SVG text go stale after a tab's first frame — root CLAUDE.md, V28). A Range that measures nothing
      // falls back to the box, so a text can never vanish from the sweep.
      let bx: { left: number; top: number; width: number; height: number; right: number; bottom: number } = el.getBoundingClientRect();
      if (t === "text" && !(el instanceof SVGElement)) {
        const rg = document.createRange();
        let L = Infinity, T = Infinity, R = -Infinity, B = -Infinity;
        el.childNodes.forEach((n) => {
          if (n.nodeType !== 3 || !(n.textContent ?? "").trim()) return;
          rg.selectNodeContents(n);
          const q = rg.getBoundingClientRect();
          if (q.width < 0.5) return;
          L = Math.min(L, q.left); T = Math.min(T, q.top); R = Math.max(R, q.right); B = Math.max(B, q.bottom);
        });
        // ★ vertically, the INK: a Range's height is the font's whole ascent-to-descent content area (Anton at 120 px
        // reaches ~60 px past its line box; a 240 px lowercase serif has ~90 px of air above its letters). The font's
        // own metrics (canvas measureText, the element's computed font) give where the letters really start and
        // end inside that area; the Range gives its on-screen scale, so this holds under the camera's transforms.
        // (Replaces the line-box clip of 2026-09-26, which flagged tightly set lines whose letters never touch.)
        if (R > L && B > T) {
          const cs = getComputedStyle(el);
          probeCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
          const m = probeCtx.measureText(txt);
          const fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
          const sy = (B - T) / Math.max(1, fa + fd);
          const top = T + (fa - m.actualBoundingBoxAscent) * sy, bottom = T + (fa + m.actualBoundingBoxDescent) * sy;
          if (bottom > top) bx = { left: L, top, width: R - L, height: bottom - top, right: R, bottom };
        }
      }
      // ★ SVG TEXT BY ITS INK, IN ITS OWN SPACE (full sweep, 2026-09-26). Its element box is the whole FONT CELL, and on
      // a rotated label (the takeaway's tilted $100 bill) that box's axis-aligned hull is far bigger than the letters —
      // it "crossed" rings and borders the numeral never touched. getBBox() gives the cell in the text's own units; the
      // font's metrics trim it to the ink; getScreenCTM maps it to the screen (a 2-D label on a 2-D layer — under a CSS
      // 3-D transform getScreenCTM drifts, V27). The quad's hull becomes the item's box, and the local ink rect + the
      // inverse matrix are kept so LINE tests stroke points against the TILTED ink, not its hull.
      if (t === "text" && el instanceof SVGTextElement) {
        const ink = svgInk(el, txt);
        if (ink) { bx = ink.hull; svgLocal.set(items.length, ink.local); quad = ink.quad; }
      }
      if (t === "shape" && !quad) quad = shapeQuad(el, bx);
      if (bx.width < 1.5 || bx.height < 1.5) return;
      if (bx.right < 0 || bx.bottom < 0 || bx.left > 1080 || bx.top > 1920) return;
      // a shape bigger than 60% of the frame (a bar rushing past the lens) is kept for the OVERLAP count but flagged
      // L, and never counted as a collision — it used to be dropped, which undercounted every push-past handover
      const L = t === "shape" && bx.width * bx.height > 1080 * 1920 * 0.6;
      items.push({ g, t, s: txt.slice(0, 24) || tag, r: [bx.left, bx.top, bx.width, bx.height].map((v) => Math.round(v * 10) / 10) as Item["r"], o: Math.round(o * 100) / 100, b: (soft ? 1 : b) as 0 | 1, x, ...(L ? { L: 1 as const } : {}), ...(layerBlur > 0.25 ? { bl: Math.round(layerBlur * 10) / 10 } : {}), ...(also ? { a: also } : {}), ...(quad ? { q: quad } : {}) });
    });
  });
  const lines = strokesThroughText(items);
  const canary = [...lineCanary(), shapeCanary()];
  // eslint-disable-next-line no-console
  console.log("PROBE " + JSON.stringify({ frame, items, lines, canary }));
};

// ★ STROKES THROUGH LABELS (2026-09-26, the full intersection sweep). A path's BOX says nothing about where its
// stroke runs: a chart line's box holds every label on the chart, so a line through "3.8×" was invisible to every
// box test. So the geometry itself is sampled — getPointAtLength along every visible, sharp SVG path / line / rect /
// circle, mapped to the screen by getScreenCTM — and each point is tested against the INK box of every sharp text
// (shrunk 1 px, so a rule the letters merely sit on is not a crossing). A text wholly inside a filled shape (a label
// on its panel) is never touched by that shape's OUTLINE, so it does not fire; a text straddling the edge does.
// ⚠ getScreenCTM is 2-D: under a CSS 3-D transform the points can drift (root CLAUDE.md, V27). The stills pass
// covers those places (pkg); this is a detector, and the sweep lists every hit for a look, not a silent pass.
type LineHit = [number, string, string];   // [text index in items, path group, path description]
const GEOM = "path, line, polyline, polygon, rect, circle, ellipse";
const visibleStroke = (el: Element) => {
  const cs = getComputedStyle(el);
  const stroked = cs.stroke && cs.stroke !== "none" && parseFloat(cs.strokeWidth) > 0 && parseFloat(cs.strokeOpacity || "1") > 0.1;
  const filled = cs.fill && cs.fill !== "none" && parseFloat(cs.fillOpacity || "1") > 0.1;
  return stroked || filled;
};
const sampleHits = (el: SVGGeometryElement, boxes: { i: number; r: Item["r"]; local?: Local }[]): number[] => {
  const m = el.getScreenCTM();
  let len = 0;
  try { len = el.getTotalLength(); } catch { return []; }
  if (!m || !(len > 0)) return [];
  const bb = el.getBoundingClientRect();
  const cand = boxes.filter(({ r }) => !(r[0] > bb.right || r[0] + r[2] < bb.left || r[1] > bb.bottom || r[1] + r[3] < bb.top));
  if (!cand.length) return [];
  // ★ points outside the element's own CLIPPING viewport are not drawn (full sweep, 2026-09-26): the SK hynix file hides
  // artwork 2,869 px wide behind a clipPath, and sampling it "crossed" the makers' big "3". A nested/inline <svg> whose
  // overflow is not visible (every Logo) clips to its box — only the full-frame overflow:visible wrappers do not.
  const own = el.ownerSVGElement;
  const vp = own && getComputedStyle(own).overflow !== "visible" ? own.getBoundingClientRect() : null;
  const n = Math.min(600, Math.max(8, Math.ceil((len * Math.hypot(m.a, m.b)) / 3)));
  const hit = new Set<number>();
  for (let k = 0; k <= n; k++) {
    const p = el.getPointAtLength((len * k) / n);
    const q = new DOMPoint(p.x, p.y).matrixTransform(m);
    if (vp && (q.x < vp.left || q.x > vp.right || q.y < vp.top || q.y > vp.bottom)) continue;
    for (const { i, r, local } of cand) {
      if (local) {   // an SVG text: test in its own (possibly rotated) space against its ink rect
        const u = new DOMPoint(q.x, q.y).matrixTransform(local.inv), lr = local.r;
        if (u.x > lr[0] + 1 && u.x < lr[2] - 1 && u.y > lr[1] + 1 && u.y < lr[3] - 1) hit.add(i);
      } else if (q.x > r[0] + 1 && q.x < r[0] + r[2] - 1 && q.y > r[1] + 1 && q.y < r[1] + r[3] - 1) hit.add(i);
    }
  }
  return [...hit];
};
const strokesThroughText = (items: Item[]): LineHit[] => {
  const boxes = items.map((it, i) => ({ it, i })).filter(({ it }) => it.t === "text" && !it.b && it.o >= 0.3).map(({ it, i }) => ({ i, r: it.r, local: svgLocal.get(i) }));
  if (!boxes.length) return [];
  const out: LineHit[] = [];
  document.querySelectorAll("[data-probe-group]").forEach((groupEl) => {
    const g = groupEl.getAttribute("data-probe-group")!;
    if (g === "logo") return;   // the 30% watermark: everything passes beneath it (sweep.mjs)
    if ((parseFloat(groupEl.getAttribute("data-blur") ?? "0") || 0) >= DEFOCUS) return;
    groupEl.querySelectorAll(GEOM).forEach((el) => {
      if (el.closest("[data-probe-skip]") || blurred(el) || !visibleStroke(el)) return;
      if (cumulativeOpacity(el) < 0.3) return;
      const bb = el.getBoundingClientRect();
      const desc = `${el.tagName.toLowerCase()}[${[bb.left, bb.top, bb.width, bb.height].map((v) => Math.round(v))}]`;
      for (const i of sampleHits(el as SVGGeometryElement, boxes)) out.push([i, g, desc]);
    });
  });
  return out;
};
// the canary, on EVERY frame: a line drawn through a text must hit it, and a line beside it must not. It is built in
// the page, measured by the same code, and removed before the frame is released.
const lineCanary = (): [boolean, boolean] => {
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:0;top:0;width:400px;height:200px;opacity:1;";
  host.innerHTML = `<div style="position:absolute;left:40px;top:40px;font:700 40px sans-serif;color:#fff;white-space:nowrap">CANARY</div>` +
    `<svg width="400" height="200" style="position:absolute;left:0;top:0"><line x1="20" y1="62" x2="380" y2="62" stroke="#fff" stroke-width="3"/>` +
    `<line x1="20" y1="170" x2="380" y2="170" stroke="#fff" stroke-width="3"/></svg>`;
  document.body.appendChild(host);
  const t = host.querySelector("div")!.getBoundingClientRect();
  const r: Item["r"] = [t.left, t.top + t.height * 0.2, t.width, t.height * 0.6];
  const [through, beside] = Array.from(host.querySelectorAll("line")).map((l) => sampleHits(l as SVGGeometryElement, [{ i: 0, r }]).length > 0);
  host.remove();
  // ★ and a TILTED svg label (the $100 bill's case): a line through its letters must hit; a line under its baseline —
  // inside the rotated hull, outside the ink — must not
  const h2 = document.createElement("div");
  h2.style.cssText = "position:fixed;left:0;top:300px;width:400px;height:300px;opacity:1;";
  h2.innerHTML = `<svg width="400" height="300"><g transform="rotate(-12 150 150)">` +
    `<text x="150" y="150" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="60" fill="#fff">100</text>` +
    `<line x1="60" y1="128" x2="240" y2="128" stroke="#fff" stroke-width="3"/><line x1="60" y1="166" x2="240" y2="166" stroke="#fff" stroke-width="3"/></g></svg>`;
  document.body.appendChild(h2);
  const tEl = h2.querySelector("text") as SVGTextElement, ink = svgInk(tEl, "100");
  let tilt: [boolean, boolean] = [false, true];
  if (ink) {
    const box = { i: 0, r: [ink.hull.left, ink.hull.top, ink.hull.width, ink.hull.height] as Item["r"], local: ink.local };
    const [a, b] = Array.from(h2.querySelectorAll("line")).map((l) => sampleHits(l as SVGGeometryElement, [box]).length > 0);
    tilt = [a, b];
  }
  h2.remove();
  return [through && tilt[0], beside || tilt[1]];
};

export const Probe: React.FC = () => {
  const frame = useCurrentFrame();
  // ★ ONE HOLD PER FRAME. A render tab seeks through many frames on one mount; a single hold made in
  // useState was continued once per frame, and the second continue crashed the sweep (frame 9).
  useEffect(() => {
    const handle = delayRender(`probe ${frame}`);
    let done = false;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      measure(frame);
      if (!done) { done = true; continueRender(handle); }
    }));
    return () => { if (!done) { done = true; continueRender(handle); } };
  }, [frame]);
  return null;
};
