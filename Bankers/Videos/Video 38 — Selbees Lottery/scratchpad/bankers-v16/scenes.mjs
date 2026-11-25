// ★★★ SCENES — NO TWO SCENES EVER OVERLAP (Bankers/STYLE.md §9.8 — Timur, 2026-10-05: "enforce the no overlap rule throughout the
// entire video: No visuals from different scenes should overlap, even if its one fading out and the other fading in").
// Every pair of items from DIFFERENT places whose outlines share pixels is a finding, at ANY logged opacity (the probe logs
// from 8%), sharp or blurred, flyers and big shapes included. An item carried across (data-probe-also) belongs to both places.
// The caption, the watermark and anything not in a place are not scene visuals.
//   node scratchpad/scenes.mjs            (judges out/probe_frames.json, written by sweep.mjs)
// sweep.mjs imports `scenesHits` and runs the same judge on every sweep.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const placeOf = (g) => (g === "hero" ? "question" : g.includes(":") ? g.split(":")[0] : null);
const PAD = 0;
const box = (r) => [r[0], r[1], r[0] + r[2], r[1], r[0] + r[2], r[1] + r[3], r[0], r[1] + r[3]];
const quadOf = (it) => it.q ?? box(it.r);
const sep = (P, Q) => {
  for (const poly of [P, Q]) for (let i = 0; i < 4; i++) {
    const x1 = poly[i * 2], y1 = poly[i * 2 + 1], x2 = poly[((i + 1) % 4) * 2], y2 = poly[((i + 1) % 4) * 2 + 1];
    const len = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
    const proj = (A) => { let lo = Infinity, hi = -Infinity; for (let k = 0; k < 4; k++) { const d = A[k * 2] * nx + A[k * 2 + 1] * ny; lo = Math.min(lo, d); hi = Math.max(hi, d); } return [lo, hi]; };
    const [a0, a1] = proj(P), [b0, b1] = proj(Q);
    if (a1 + PAD <= b0 || b1 + PAD <= a0) return true;
  }
  return false;
};
const boxesMeet = (a, b) => Math.min(a.r[0] + a.r[2], b.r[0] + b.r[2]) > Math.max(a.r[0], b.r[0]) && Math.min(a.r[1] + a.r[3], b.r[1] + b.r[3]) > Math.max(a.r[1], b.r[1]);
const meet = (a, b) => boxesMeet(a, b) && (a.q || b.q ? !sep(quadOf(a), quadOf(b)) : true);
/** the places an item is on screen for */
export const placesOf = (it) => { const s = new Set(); const p = placeOf(it.g); if (p) s.add(p); for (const x of (it.a ?? "").split(" ").filter(Boolean)) s.add(x); return s; };
const onFrame = (r) => r[0] + r[2] > 0 && r[0] < 1080 && r[1] + r[3] > 0 && r[1] < 1920;

/** frames: Map(frame → items). Returns Map("A|B" → [{ f, a, b }]) of cross-place meetings. */
export const scenesHits = (frames) => {
  const out = new Map();
  for (const [f, items] of frames) {
    const its = items.map((it) => ({ it, P: placesOf(it) })).filter((x) => x.P.size && x.it.g !== "logo" && onFrame(x.it.r));
    for (let i = 0; i < its.length; i++) for (let j = i + 1; j < its.length; j++) {
      const A = its[i], B = its[j];
      if ([...A.P].some((p) => B.P.has(p))) continue;
      if (!meet(A.it, B.it)) continue;
      const pa = [...A.P].join("+"), pb = [...B.P].join("+");
      const [k, a, b] = pa < pb ? [`${pa}|${pb}`, A.it, B.it] : [`${pb}|${pa}`, B.it, A.it];
      if (!out.has(k)) out.set(k, []);
      out.get(k).push({ f, a, b });
    }
  }
  return out;
};

// canaries: two places' boxes overlapping at 10% must fire; side by side must not; a carried item must not; a tilted pair whose
// hulls overlap but outlines do not must not
{
  const it = (g, r, o = 1, extra = {}) => ({ g, t: "shape", s: "rect", r, o, b: 0, ...extra });
  const n = (items) => [...scenesHits(new Map([[0, items]])).values()].flat().length;
  if (n([it("a:mid", [0, 0, 100, 100]), it("b:mid", [50, 50, 100, 100], 0.1, { b: 1 })]) !== 1) throw new Error("scenes canary: a faint blurred overlap was not flagged");
  if (n([it("a:mid", [0, 0, 100, 100]), it("b:mid", [100, 0, 100, 100])]) !== 0) throw new Error("scenes canary: touching side by side was flagged");
  if (n([it("a:mid", [0, 0, 100, 100]), it("b:mid", [50, 50, 100, 100], 1, { a: "a" })]) !== 0) throw new Error("scenes canary: a carried item was flagged");
  if (n([it("a:mid", [0, 0, 100, 100]), it("a:fg", [50, 50, 100, 100])]) !== 0) throw new Error("scenes canary: one place's own layers were flagged");
  if (n([it("hero", [0, 0, 100, 100]), it("honestC:mid", [50, 50, 100, 100], 0.2, { b: 1 })]) !== 1) throw new Error("scenes canary: the question over a racked place was not flagged");
  const d = [100, 0, 200, 100, 100, 200, 0, 100];   // a diamond whose hull is [0,0,200,200]
  if (n([it("a:mid", [0, 0, 200, 200], 1, { q: d }), it("b:mid", [0, 0, 30, 30])]) !== 0) throw new Error("scenes canary: a hull-only overlap was flagged");
}

const spans = (fs_) => { const s = [...new Set(fs_)].sort((x, y) => x - y); const o = []; let a = s[0], p = s[0]; for (const f of s.slice(1)) { if (f - p > 1) { o.push(a === p ? `${a}` : `${a}–${p}`); a = f; } p = f; } o.push(a === p ? `${a}` : `${a}–${p}`); return o.join(", "); };
export const report = (hits) => {
  const lines = [];
  for (const [k, v] of [...hits].sort((x, y) => x[1][0].f - y[1][0].f)) {
    const worst = v.reduce((m, h) => (Math.min(h.a.o, h.b.o) > Math.min(m.a.o, m.b.o) ? h : m), v[0]);
    lines.push(`SCENES ${k.replace("|", " × ")}  @ ${spans(v.map((h) => h.f))}   (${v.length} pairs; e.g. f${worst.f} ${worst.a.g}:"${worst.a.s}" o${worst.a.o}${worst.a.b ? " soft" : ""} × ${worst.b.g}:"${worst.b.s}" o${worst.b.o}${worst.b.b ? " soft" : ""})`);
  }
  return lines;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const frames = new Map(JSON.parse(fs.readFileSync(path.join(root, "out", "probe_frames.json"), "utf8")));
  const hits = scenesHits(frames);
  console.log(`judged ${frames.size} frames; canaries ok`);
  if (!hits.size) console.log("SCENES CLEAN — no two places share pixels on any frame");
  for (const l of report(hits)) console.log(l);
  if (hits.size) process.exit(1);
}
