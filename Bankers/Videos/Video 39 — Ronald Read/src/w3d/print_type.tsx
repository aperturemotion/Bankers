// @ts-nocheck
// ★ V38 rev 2 (builder B) — shared TYPESETTING for printed surfaces drawn with canvasTex (the newspaper, the Inspector General's
//   report): set lines, wrapped and justified paragraphs that flow through columns, rules, a halftone screen for press photos.
//   Timur 2026-11-26: "use actual text when filling up" — these draw real words, never bars standing in for them.
export const SERIF = `"Liberation Serif", "Times New Roman", "DejaVu Serif", serif`;
export const SANS = `"Liberation Sans", "Arial", "DejaVu Sans", sans-serif`;

export const setFont = (c, w, px, fam = SERIF, style = "") => { c.font = `${style ? style + " " : ""}${w} ${px}px ${fam}`; };
/** one line of type; returns its width */
export const line = (c, s, x, y, { w = 400, px = 20, fam = SERIF, color = "#111", align = "left", style = "", track = 0, maxW } = {}) => {
  setFont(c, w, px, fam, style); c.fillStyle = color; c.textAlign = align; c.textBaseline = "alphabetic";
  if ("letterSpacing" in c) c.letterSpacing = `${track}px`;
  if (maxW) c.fillText(s, x, y, maxW); else c.fillText(s, x, y);
  const m = c.measureText(s).width;
  if ("letterSpacing" in c) c.letterSpacing = "0px";
  return m;
};
/** break words into lines of at most maxW at the current font */
const breakLines = (c, words, maxW) => {
  const out = []; let cur = [];
  for (const wd of words) {
    const tr = [...cur, wd].join(" ");
    if (c.measureText(tr).width > maxW && cur.length) { out.push(cur); cur = [wd]; } else cur.push(wd);
  }
  if (cur.length) out.push(cur);
  return out;
};
/**
 * a paragraph set into a column; justify spreads the spaces of every line but the last (newspaper body).
 * indent: first-line indent in px. Returns the y of the next baseline.
 */
export const para = (c, s, x, y, maxW, { w = 400, px = 20, lh = 1.25, fam = SERIF, color = "#111", justify = false, indent = 0, style = "" } = {}) => {
  setFont(c, w, px, fam, style); c.fillStyle = color; c.textAlign = "left"; c.textBaseline = "alphabetic";
  const words = s.split(/\s+/).filter(Boolean);
  // the indent is set by measuring the first line against a narrower measure
  const lines = []; let rest = words, first = true;
  while (rest.length) {
    const mw = first ? maxW - indent : maxW;
    const ls = breakLines(c, rest, mw);
    lines.push({ words: ls[0], ind: first ? indent : 0 });
    rest = rest.slice(ls[0].length); first = false;
  }
  lines.forEach((L, i) => {
    const last = i === lines.length - 1;
    const xx = x + L.ind, mw = maxW - L.ind;
    if (justify && !last && L.words.length > 1) {
      const wsum = L.words.reduce((a, wd) => a + c.measureText(wd).width, 0);
      const gap = (mw - wsum) / (L.words.length - 1);
      let px0 = xx;
      if (gap < px * 0.9) { L.words.forEach((wd) => { c.fillText(wd, px0, y); px0 += c.measureText(wd).width + gap; }); }
      else c.fillText(L.words.join(" "), xx, y);
    } else c.fillText(L.words.join(" "), xx, y);
    y += px * lh;
  });
  return y;
};
/**
 * flow several paragraphs through columns: cols = [{x, y0, y1, w}]. Paragraphs continue into the next column when one fills.
 * Returns { col, y } where the text stopped.
 */
export const flow = (c, paras, cols, opt = {}) => {
  const { px = 20, lh = 1.25, gap = 0.35 } = opt;
  let ci = 0, y = cols[0].y0 + px;
  for (const p of paras) {
    setFont(c, opt.w ?? 400, px, opt.fam ?? SERIF);
    const words = p.split(/\s+/).filter(Boolean);
    let rest = words, first = true;
    while (rest.length) {
      if (ci >= cols.length) return { col: ci, y };
      const col = cols[ci];
      const ind = first ? (opt.indent ?? 0) : 0;
      setFont(c, opt.w ?? 400, px, opt.fam ?? SERIF);
      const ls = breakLines(c, rest, col.w - ind);
      const take = ls[0];
      const last = take.length === rest.length;
      // draw this one line (justified unless it ends the paragraph)
      c.fillStyle = opt.color ?? "#111"; c.textAlign = "left"; c.textBaseline = "alphabetic";
      if (!last && take.length > 1 && opt.justify !== false) {
        const wsum = take.reduce((a, wd) => a + c.measureText(wd).width, 0);
        const g = (col.w - ind - wsum) / (take.length - 1);
        let x0 = col.x + ind;
        if (g < px * 0.9) take.forEach((wd) => { c.fillText(wd, x0, y); x0 += c.measureText(wd).width + g; });
        else c.fillText(take.join(" "), col.x + ind, y);
      } else c.fillText(take.join(" "), col.x + ind, y);
      rest = rest.slice(take.length); first = false;
      y += px * lh;
      if (y > col.y1) { ci++; if (ci < cols.length) y = cols[ci].y0 + px; }
    }
    y += px * gap;
    if (ci < cols.length && y > cols[ci].y1) { ci++; if (ci < cols.length) y = cols[ci].y0 + px; }
  }
  return { col: ci, y };
};
export const rule = (c, x0, y, x1, t = 1, color = "#111") => { c.fillStyle = color; c.fillRect(x0, y - t / 2, x1 - x0, t); };
/**
 * a press halftone: draw(g, w, h) paints a greyscale picture on a scratch canvas; it is laid on the page at (x, y) as round dots on a
 * 45° screen of the given pitch, sized by darkness (the way a newspaper prints a photograph).
 */
export const halftone = (c, x, y, w, h, pitch, draw, ink = "#151A22", paper = null) => {
  const o = document.createElement("canvas"); o.width = Math.ceil(w); o.height = Math.ceil(h);
  const g = o.getContext("2d"); draw(g, o.width, o.height);
  const d = g.getImageData(0, 0, o.width, o.height).data;
  if (paper) { c.fillStyle = paper; c.fillRect(x, y, w, h); }
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = ink;
  const a = Math.PI / 4, ca = Math.cos(a), sa = Math.sin(a);
  const R = Math.hypot(w, h);
  for (let u = -R; u < R; u += pitch) for (let v = -R; v < R; v += pitch) {
    const px = w / 2 + u * ca - v * sa, py = h / 2 + u * sa + v * ca;
    if (px < -pitch || py < -pitch || px > w + pitch || py > h + pitch) continue;
    const sx = Math.min(o.width - 1, Math.max(0, Math.round(px))), sy = Math.min(o.height - 1, Math.max(0, Math.round(py)));
    const i = (sy * o.width + sx) * 4;
    const lum = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255;
    const r = pitch * 0.62 * Math.sqrt(Math.max(0, 1 - lum));
    if (r < 0.25) continue;
    c.beginPath(); c.arc(x + px, y + py, r, 0, Math.PI * 2); c.fill();
  }
  c.restore();
};
/** deterministic paper grain */
export const grain = (c, w, h, n, rnd, rgb = "60,70,90", a0 = 0.02, a1 = 0.035, s = 1.4) => {
  for (let i = 0; i < n; i++) { c.fillStyle = `rgba(${rgb},${a0 + rnd(i) * a1})`; c.fillRect(rnd(i + 3) * w, rnd(i + 5) * h, s, s); }
};
