// BANKERS VIDEO 3 — THE INTERSECTION + JOURNEY SWEEP (cloned from Video 2). Renders every Nth frame with inputProps { probe: true }; the
// Probe logs every visible text run / image / shape with its layer group ("A:fg", "C:mid", "hero", …) and
// whether the journey camera has that layer DEFOCUSED (b = 1, ≥ 4 px). This script reports:
//   · CROSS   — a SHARP item of one group overlapping a SHARP item of another (dial × bars, caption × chart,
//               FG × MID …) — the class Timur caught ("the stopwatch intersects the bars"). A defocused layer
//               passing behind or in front of a sharp one is depth, not a collision (Bankers/CLAUDE.md §2.5.1).
//   · TEXT    — two sharp text runs of the same group overlapping (both near full opacity)
//   · CLIP    — sharp PINNED text (caption, hero, logo) cut by the frame edge. Text in a world layer crossing the
//               edge is the camera carrying it out — §2.5.1's "leaves via an edge" — so it is not a defect.
//   · OVERLAP — ★ for every scene change, how long the outgoing and incoming places share the screen. §2.5.1:
//               "Outgoing and incoming scenes overlap for at least half a second." Under 15 f REFUSES.
// It proves itself: it refuses if any frame logged nothing, if frames are missing, if the collision canaries
// fail (an overlapping pair must be flagged; a touching-but-apart pair must not; a defocused pair must not),
// or if the overlap counter fails its canary.
//   node scratchpad/sweep.mjs [everyNth=1] [--keep]     (--keep saves every swept frame at half size to out/sweep_frames/)
//
// ★ THE FULL SWEEP (2026-09-26, Timur: "fully go through the video trying to find intersecting elements and fix them").
// Three blind spots closed, each with its own canary:
//   · EDGE  — a sharp text crossing the EDGE of a div/img of its OWN group (a label half over its bar or panel). CROSS only
//             compared different groups, and TEXT only text × text, so a label cut by its own chart's box was invisible.
//             A text wholly inside the shape (a label on its panel) or a shape wholly inside the text is not an edge.
//   · LINE  — an SVG path / line / rect STROKE through a sharp text, from Probe.tsx's sampled geometry (a path's box holds
//             every label on its chart, so boxes cannot see a line through "3.8×"). The probe's per-frame canary (a line
//             through a text must hit, one beside it must not) is checked on every frame.
//   · TEXT  — now from 30% opacity on both sides, not 90%: two texts half-faded over each other in a crossfade are a
//             ghosted overlap on screen, and the 90% bar let every one through.
//   · SOFTCAP — a DEFOCUSED world text (or a sizeable shape) still sharp enough to read (layer blur < 12 px) crossing the
//             pinned caption / question text. CROSS skips every defocused item as depth — right for a glow, wrong for
//             the race's "$1.22T" passing ~8 px soft behind "Micron almost quadrupled." for 12 frames (found by eye in
//             the visual pass, not by any check). Push-past layers now defocus harder (world.tsx blurGain).
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderFrames } from "@remotion/renderer";
import { createRequire } from "node:module";
// ★★★ SCENES (STYLE §9.8 — Timur, 2026-10-05: "No visuals from different scenes should overlap, even if its one fading out and the
// other fading in"): every cross-place pair of items sharing pixels, at ANY logged opacity, sharp or blurred — scratchpad/scenes.mjs,
// which proves itself on its own canaries when imported
import { scenesHits, report as scenesReport } from "./scenes.mjs";
// RPORT pins the renderer's local file server to one port (2026-10-13: a browser connection's source port held 0.0.0.0:3000, and Remotion's port test kept choosing it — "Tried 10 times to find a free port")
const RP = process.env.RPORT ? { port: Number(process.env.RPORT) } : {};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nth = Number(process.argv.slice(2).find((a) => /^\d+$/.test(a)) ?? 1);
const KEEP = process.argv.includes("--keep");
/** --concurrency=N (default 4): lower it when the machine is short of memory — a render tab that runs out crashes the page */
const CONC = Number((process.argv.find((a) => a.startsWith("--concurrency=")) ?? "--concurrency=4").slice(14)) || 4;
/** --range=a-b sweeps only those frames (a quick check of one place; the OVERLAP report is then partial) */
const RANGE = (process.argv.find((a) => a.startsWith("--range=")) ?? "").slice(8).split("-").map(Number).filter((n) => Number.isFinite(n));
const MIN_OVERLAP = 15;
// ★★★ THE FLOW GRAMMAR (Bankers/STYLE.md §8.0, 2026-10-30): the journey as the render runs it, bundled from Video.tsx (as stylecheck does), for
// two of its rules — a CRANE carries its places vertically through the caption band in transit (the Style 3 films do; their checks judge the
// caption band on settled frames only), so a caption crossed by an item of the crane's own two places INSIDE the crane's move is listed as
// transit, never a collision; and the side-by-side minimum is the flow grammar's: 8 f for a truck or a crane, 0 for a carried hand-over (the
// old place leaves before the subject is carried in — Timur's own description of it).
const JOURNEY = await (async () => {
  const req = createRequire(import.meta.url);
  const esbuild = req("esbuild");
  const stub = { name: "stub", setup(b) {
    b.onResolve({ filter: /^@remotion\/(google-fonts|fonts)/ }, (a) => ({ path: a.path, namespace: "stub" }));
    b.onResolve({ filter: /(^|\/)Probe$/ }, (a) => ({ path: a.path, namespace: "stub" }));
    b.onLoad({ filter: /.*/, namespace: "stub" }, (a) => ({ contents: /Probe$/.test(a.path) ? `export const Probe = () => null;` : `export const loadFont = () => ({ fontFamily: "stub", waitUntilDone: () => Promise.resolve() });`, loader: "js" }));
  } };
  const mod = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "tsla");
  const r = await esbuild.build({ stdin: { contents: `export { JOURNEY } from "./Video";`, resolveDir: mod, loader: "ts" }, bundle: true, platform: "node", format: "cjs",
    write: false, jsx: "automatic", logLevel: "silent", external: ["react", "react/*", "react-dom", "remotion", "remotion/*", "@remotion/*"],
    loader: { ".svg": "text", ".png": "dataurl", ".jpg": "dataurl", ".json": "json" }, plugins: [stub] });
  const tmpf = path.join(path.dirname(fileURLToPath(import.meta.url)), `.sweepj_${process.pid}.cjs`);
  fs.writeFileSync(tmpf, r.outputFiles[0].text);
  try { return createRequire(tmpf)(tmpf).JOURNEY; } finally { fs.rmSync(tmpf, { force: true }); }
})();
const FLOW = JOURNEY?.GRAMMAR === "flow";
/** [from, to, outgoing place, incoming place] of every crane's move */
const CRANES = FLOW ? JOURNEY.PLACES.map((p, i) => (String(p.kind).startsWith("crane") ? [p.t0, p.t0 + JOURNEY.DUR_OF(p), JOURNEY.PLACES[i - 1]?.id, p.id] : null)).filter(Boolean) : [];
if (FLOW && !CRANES.length) throw new Error("sweep: a flow journey with no crane read — refusing");
const inCrane = (f, a, b) => {
  const ga = a.split(":")[0], gb = b.split(":")[0], cap = a === "caption" || b === "caption", other = a === "caption" ? gb : ga;
  return cap && CRANES.some(([t0, t1, o, n]) => f >= t0 && f <= t1 && (other === o || other === n || other === "hookA"));
};
const minOverlap = (q) => (!FLOW ? MIN_OVERLAP : JOURNEY.PLACES.find((p) => p.id === q)?.kind === "carry" ? 0 : 8);
const transit = new Map();
/** the journey's scene changes, in order; a group's place is the letter before ":" ("hero" is D's MID) */
// ★ DERIVED from Video.tsx's PLACES, in order (Video 5: the clone carried Video 4's hand-typed list, so every hand-over of the
// new film read "0 f" against place names that no longer exist). Refuses if it finds none.
/** …and each place's KIND (STYLE §8.5 / §9.8: a SLIDE hands over in space, ≥ 15 f side by side; a PUSH in time, gap < 8 f) */
const KIND_OF = new Map();
const PLACE_IDS = (() => {
  const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "tsla", "Video.tsx"), "utf8");
  const block = src.slice(src.indexOf("export const PLACES: Place[] = ["), src.indexOf("\n];", src.indexOf("export const PLACES: Place[] = [")));
  const ms = [...block.matchAll(/\{ id: "(\w+)"(?:, kind: "(\w+)")?/g)];
  for (const m of ms) KIND_OF.set(m[1], m[2] ?? "hold");
  // (★ the flow grammar, 2026-10-30: trucks, cranes and a carried hand-over hand over IN SPACE, like slides — ≥ 15 f side by side; a place
  // with no move of its own ("hold": the hook's payoff, carried by the hook's own camera) is part of the place before it, not a hand-over)
  const ids = ms.map((m) => m[1]).filter((id, i) => i === 0 || KIND_OF.get(id) !== "hold");
  if (ids.length < 4 || ids[ids.length - 1] !== "question") throw new Error(`sweep: could not read the places from Video.tsx (${ids.join(",")}) — refusing`);
  if (!ids.slice(1).every((id) => ["push", "slideR", "slideL", "truckR", "truckL", "craneU", "craneD", "carry"].includes(KIND_OF.get(id)))) throw new Error(`sweep: a place after the first has no hand-over kind (${[...KIND_OF].join(" ")}) — refusing`);
  return [...ids, "outro"];
})();
KIND_OF.set("outro", "thru");
const TRANSITIONS = PLACE_IDS.slice(1).map((id, i) => [PLACE_IDS[i], id]);
const MAX_PUSH_GAP = 8;
const placeOf = (g) => (g === "hero" ? "question" : g.includes(":") ? g.split(":")[0] : null);

const PAD = 2; // px of clearance counted as touching
const inter = (a, b) => {
  const [ax, ay, aw, ah] = a, [bx, by, bw, bh] = b;
  const w = Math.min(ax + aw, bx + bw) - Math.max(ax, bx) + PAD;
  const h = Math.min(ay + ah, by + bh) - Math.max(ay, by) + PAD;
  return w > 0 && h > 0 ? w * h : 0;
};
// ★ QUADS (2026-09-26): an SVG text carries its ink quad `q` (Probe.tsx) — at a tilt its axis-aligned hull overlaps
// things the letters never touch (the quote board's "MU" row "crossed" its "JPM" row 98 px away). When either side has a
// quad, the pair is judged by the separating-axis test on the real outlines (the other side's box as a quad).
const quadOf = (it) => it.q ?? [it.r[0], it.r[1], it.r[0] + it.r[2], it.r[1], it.r[0] + it.r[2], it.r[1] + it.r[3], it.r[0], it.r[1] + it.r[3]];
const quadsTouch = (P, Q) => {
  for (const poly of [P, Q]) for (let i = 0; i < 4; i++) {
    const x1 = poly[i * 2], y1 = poly[i * 2 + 1], x2 = poly[((i + 1) % 4) * 2], y2 = poly[((i + 1) % 4) * 2 + 1];
    const len = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
    const proj = (A) => { let lo = Infinity, hi = -Infinity; for (let k = 0; k < 4; k++) { const d = A[k * 2] * nx + A[k * 2 + 1] * ny; lo = Math.min(lo, d); hi = Math.max(hi, d); } return [lo, hi]; };
    const [a0, a1] = proj(P), [b0, b1] = proj(Q);
    if (a1 + PAD < b0 || b1 + PAD < a0) return false;   // a separating axis: apart by more than the touch clearance
  }
  return true;
};
const overlaps = (a, b) => (a.q || b.q ? quadsTouch(quadOf(a), quadOf(b)) : inter(a.r, b.r) > 0);
const collide = (a, b) => !a.b && !b.b && !a.L && !b.L && overlaps(a, b);
/** a sharp text crossing the edge of a div/img of its own group: overlapping ≥ 2 px both ways, neither inside the other */
const inside = (a, b, tol = 1) => a[0] >= b[0] - tol && a[1] >= b[1] - tol && a[0] + a[2] <= b[0] + b[2] + tol && a[1] + a[3] <= b[1] + b[3] + tol;
const edge = (t, s) => {
  if (t.t !== "text" || s.t !== "shape" || t.b || s.b || s.L || t.o < 0.3 || s.o < 0.3 || t.g !== s.g) return false;
  if (s.s !== "div" && s.s !== "img") return false;   // SVG geometry is judged by its real outline (LINE), not its box
  const w = Math.min(t.r[0] + t.r[2], s.r[0] + s.r[2]) - Math.max(t.r[0], s.r[0]);
  const h = Math.min(t.r[1] + t.r[3], s.r[1] + s.r[3]) - Math.max(t.r[1], s.r[1]);
  return w >= 2 && h >= 2 && !inside(t.r, s.r) && !inside(s.r, t.r);
};
/** a pinned caption/question text (sharp, ≥ 50%) crossed by a defocused world item that still reads, at ≥ 25% opacity:
 *  a TEXT whose blur is under a quarter of its own height (legibility scales with letter size — Anton at 130 px still
 *  read at 16 px of blur, which the first cut-off of a flat 12 px passed as a glow), or a shape ≥ 4000 px² under 12 px */
const PINNED = new Set(["caption", "hero"]);
const reads = (x) => (x.t === "text" ? (x.bl ?? 1e9) < 0.25 * x.r[3] : (x.bl ?? 99) < 12 && x.r[2] * x.r[3] >= 4000);
const softcap = (c, x) => PINNED.has(c.g) && c.t === "text" && !c.b && c.o >= 0.5 && !PINNED.has(x.g) && x.g !== "logo" &&
  x.b === 1 && x.o >= 0.25 && reads(x) && (c.q || x.q ? quadsTouch(quadOf(c), quadOf(x)) : inter(c.r, x.r) > 0);
/** ★ MARGIN (Bankers/STYLE.md §6.1, 2026-09-28) — a sharp MID text AT REST outside the construction zone. The hook's "6,000"
 *  sat 20 px from the frame's right edge through its whole scene and no check saw it: CLIP only judges pinned text, and a
 *  world text crossing the edge is usually the camera carrying it out. "At rest" = its centre moved < 3 px/frame since
 *  the previous sample, so a slide or push carrying it out never counts; ≥ 10 frames of it is a finding. */
const ZONE = { x0: 60, x1: 1020, y0: 370, y1: 1700 };
const outOfZone = (it) => it.r[0] < ZONE.x0 || it.r[0] + it.r[2] > ZONE.x1 || it.r[1] < ZONE.y0 || it.r[1] + it.r[3] > ZONE.y1;
const marginHits = (frames, step) => {
  const got = new Map(), sorted = [...frames].sort((a, b) => a[0] - b[0]);
  for (let k = 1; k < sorted.length; k++) {
    const [f, items] = sorted[k], [pf, prev] = sorted[k - 1];
    if (f - pf !== step) continue;
    for (const it of items) {
      if (it.t !== "text" || it.b || it.o < 0.5 || !/:mid$/.test(it.g) || !outOfZone(it)) continue;
      const p = prev.find((x) => x.t === "text" && x.g === it.g && x.s === it.s);
      if (!p) continue;
      const v = Math.hypot(it.r[0] + it.r[2] / 2 - p.r[0] - p.r[2] / 2, it.r[1] + it.r[3] / 2 - p.r[1] - p.r[3] / 2) / step;
      if (v >= 3) continue;
      const key = `${it.g}:"${it.s}"`;
      if (!got.has(key)) got.set(key, { fs: [], box: it.r });
      got.get(key).fs.push(f);
    }
  }
  return [...got].filter(([, v]) => v.fs.length * step >= 10);
};
/** ★★ VANISH / POP (Bankers/STYLE.md §9.6, 2026-09-29 — Timur: "right when the arrow scene begins part of the previous scene
 *  just disappears since it didn't go off screen. Never let things like this happen"). A world layer (group "place:mid" /
 *  "place:fg") that had something ON SCREEN at ≥ 25% opacity in one frame and is gone entirely in the next was unmounted
 *  while visible: a VANISH. A layer absent in one frame and present in the next with something sharp, ≥ 60% opaque and
 *  wholly inside the frame appeared in one frame: a POP. (A slide's layer is logged off-screen before it enters, so an
 *  entrance from the edge is never a pop; a push's layer and a gliding FG start near 0% opacity.) */
const onScreen = (r, m = 4) => r[0] + r[2] > m && r[0] < 1080 - m && r[1] + r[3] > m && r[1] < 1920 - m;
const wholeIn = (r, m = 20) => r[0] >= m && r[1] >= m && r[0] + r[2] <= 1080 - m && r[1] + r[3] <= 1920 - m;
// ★ A THING LEAVING FAST IS NOT A VANISH (first full run, 2026-09-29: 13 of 15 hits were a slide or a push carrying an FG
// piece or a construction out through an edge, logged on its last on-screen frame as a sliver). The item is matched to
// itself one sample earlier (same group, tag and size ±30%) and its box extrapolated one sample on: only if it would STILL
// be on screen is its disappearance a vanish. A defocused item passing the lens is depth, as in CROSS. Unmatched, it
// must have ≥ 50% of its box inside the frame.
const onScreenArea = (r) => Math.max(0, Math.min(1080, r[0] + r[2]) - Math.max(0, r[0])) * Math.max(0, Math.min(1920, r[1] + r[3]) - Math.max(0, r[1]));
const vanished = (v, before) => {
  // (only an UNAMBIGUOUS match gives a velocity: the bubble's stacked copies matched each other and faked a standstill)
  const ms = before?.filter((x) => x.g === v.g && x.t === v.t && x.s === v.s && Math.abs(x.r[2] - v.r[2]) <= 0.3 * v.r[2] + 2 && Math.abs(x.r[3] - v.r[3]) <= 0.3 * v.r[3] + 2) ?? [];
  const m = ms.length === 1 ? ms[0] : undefined;
  if (!m) return onScreenArea(v.r) >= 0.5 * v.r[2] * v.r[3];
  const next = v.r.map((n, i) => n + (n - m.r[i]));
  return onScreen(next);
};
const vanishPop = (frames, step) => {
  const out = [], sorted = [...frames].sort((a, b) => a[0] - b[0]);
  const groups = (items) => { const m = new Map(); for (const it of items) if (it.g.includes(":")) { if (!m.has(it.g)) m.set(it.g, []); m.get(it.g).push(it); } return m; };
  for (let k = 1; k < sorted.length; k++) {
    const [f, items] = sorted[k], [pf, prev] = sorted[k - 1];
    if (f - pf !== step) continue;
    const before = k >= 2 && pf - sorted[k - 2][0] === step ? sorted[k - 2][1] : undefined;
    const A = groups(prev), B = groups(items);
    for (const [g, its] of A) if (!B.has(g)) { const v = its.find((x) => x.o >= 0.25 && !x.b && onScreen(x.r) && vanished(x, before)); if (v) out.push({ kind: "VANISH", g, f, s: v.s, r: v.r }); }
    for (const [g, its] of B) if (!A.has(g)) { const v = its.find((x) => !x.b && x.o >= 0.6 && wholeIn(x.r)); if (v) out.push({ kind: "POP", g, f, s: v.s, r: v.r }); }
  }
  return out;
};
const hasPlace = (items, x) => items.some((it) => (placeOf(it.g) === x || (it.a ?? "").split(" ").includes(x)) && it.o >= 0.08);
/** a PUSH hands over in time: the last frame the outgoing place shows anything, the first the incoming does, and the field-only
 *  gap between them (negative: they shared frames — SCENES then says whether they shared pixels) */
const pushGap = (frames, p, q) => {
  const fs_ = [...frames.keys()].sort((a, b) => a - b);
  const firstIn = fs_.find((f) => hasPlace(frames.get(f), q));
  const lastOut = [...fs_].reverse().find((f) => hasPlace(frames.get(f), p));
  return firstIn === undefined || lastOut === undefined ? null : { lastOut, firstIn, gap: firstIn - lastOut - 1 };
};
/** frames (in real frames, i.e. samples × nth) on which both places have something visible */
const coVisible = (frames, p, q) => {
  let n = 0;
  for (const items of frames.values()) {
    // an item CARRIED across a morph (`a`, Probe.tsx data-probe-also) is on screen for that place too
    const has = (x) => items.some((it) => (placeOf(it.g) === x || (it.a ?? "").split(" ").includes(x)) && it.o >= 0.1);
    if (has(p) && has(q)) n++;
  }
  return n * nth;
};

// ── canaries: run before anything is rendered ──
const S = (r, b = 0) => ({ r, b });
if (!collide(S([0, 0, 10, 10]), S([5, 5, 10, 10]))) throw new Error("canary: overlapping sharp pair not flagged");
if (collide(S([0, 0, 10, 10]), S([20, 0, 10, 10]))) throw new Error("canary: separate pair flagged");
if (collide(S([0, 0, 10, 10]), S([5, 5, 10, 10], 1))) throw new Error("canary: a defocused pair was flagged as a collision");
{
  // two 300×30 rows, 20 px apart, tilted −10°: their hulls overlap, their quads do not — and a third row laid over the first does
  const rot = (x, y) => { const c = Math.cos(-10 * Math.PI / 180), s = Math.sin(-10 * Math.PI / 180); return [x * c - y * s, x * s + y * c]; };
  const row = (y0) => [[0, y0], [300, y0], [300, y0 + 30], [0, y0 + 30]].flatMap(([x, y]) => rot(x, y));
  const Qi = (q) => { const xs = q.filter((_, i) => i % 2 === 0), ys = q.filter((_, i) => i % 2 === 1); return { r: [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)], q, b: 0 }; };
  const r1 = Qi(row(0)), r2 = Qi(row(50)), r3 = Qi(row(10));
  if (inter(r1.r, r2.r) <= 0) throw new Error("canary setup: the tilted rows' hulls should overlap");
  if (collide(r1, r2)) throw new Error("canary: two tilted rows 20 px apart were flagged (quads not used)");
  if (!collide(r1, r3)) throw new Error("canary: two overlapping tilted rows were NOT flagged (quad test)");
}
{
  const T = (r) => ({ g: "x:mid", t: "text", s: "LABEL", r, o: 1, b: 0 }), D = (r) => ({ g: "x:mid", t: "shape", s: "div", r, o: 1, b: 0 });
  if (!edge(T([0, 0, 40, 20]), D([30, 0, 100, 100]))) throw new Error("canary: a label straddling its panel's edge was not flagged (EDGE)");
  if (edge(T([10, 10, 40, 20]), D([0, 0, 100, 100]))) throw new Error("canary: a label inside its panel was flagged (EDGE)");
  if (edge(T([0, 0, 40, 20]), { ...D([30, 0, 100, 100]), s: "path" })) throw new Error("canary: EDGE judged an SVG box (LINE does that)");
  const C = { g: "caption", t: "text", s: "Micron almost", r: [0, 0, 200, 40], o: 1, b: 0 };
  const F = (bl) => ({ g: "race:mid", t: "text", s: "$1.22T", r: [100, 10, 200, 80], o: 0.9, b: 1, bl });
  if (!softcap(C, F(8))) throw new Error("canary: an 8 px-soft figure behind the caption was not flagged (SOFTCAP)");
  if (softcap(C, F(24))) throw new Error("canary: a glow (24 px on an 80 px figure) behind the caption was flagged (SOFTCAP)");
  if (!softcap(C, { ...F(16), r: [100, 10, 290, 120] })) throw new Error("canary: a 120 px figure at 16 px blur (the race's $1.22T) was not flagged (SOFTCAP)");
  const strip = (dx) => {
    const a = (24 * Math.PI) / 180, pts = [[-200, 0], [200, 0], [200, 1400], [-200, 1400]].map(([x, y]) => [1391 + dx + x * Math.cos(a) - y * Math.sin(a), -132 + x * Math.sin(a) + y * Math.cos(a)]);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    return { g: "hook:paper", t: "shape", s: "rect", r: [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)], q: pts.flat(), o: 1, b: 1, bl: 8 };
  };
  const CAP = { g: "caption", t: "text", s: "with falling stocks.", r: [333, 272, 413, 46], o: 1, b: 0 };
  if (inter(CAP.r, strip(0).r) <= 0) throw new Error("canary setup: the tilted strip's hull should cover the caption");
  if (softcap(CAP, strip(0))) throw new Error("canary: a tilted strip clear of the caption was flagged by its hull (SOFTCAP quad)");
  if (!softcap(CAP, strip(-700))) throw new Error("canary: a tilted strip across the caption was NOT flagged (SOFTCAP quad)");
  if (collide(CAP, { ...strip(0), b: 0 })) throw new Error("canary: a sharp tilted strip clear of the caption collided by its hull (CROSS quad)");
}
{
  // MARGIN: a label resting 20 px from the right edge must fire; the same label moving 20 px/frame, or one inside the zone,
  // or a resting FG text (a piece cropped by the frame on purpose), must not
  const run = (x0, dx, g = "hookB:mid") => new Map([...Array(14)].map((_, k) => [k * nth, [{ g, t: "text", s: "6,000", r: [x0 + dx * k * nth, 900, 60, 26], o: 1, b: 0 }]]));
  if (marginHits(run(1000, 0), nth).length !== 1) throw new Error("canary: a label resting at the frame's edge was not flagged (MARGIN)");
  if (marginHits(run(1000, -20), nth).length) throw new Error("canary: a label carried by the camera was flagged (MARGIN)");
  if (marginHits(run(500, 0), nth).length) throw new Error("canary: a label inside the zone was flagged (MARGIN)");
  if (marginHits(run(1000, 0, "hookB:fg"), nth).length) throw new Error("canary: an FG piece's print was flagged (MARGIN)");
}
{
  // VANISH / POP: a layer unmounted with its edge still on screen must fire; one that faded out first, or left the frame
  // first, must not; a layer appearing whole at full opacity must fire; one fading up, or entering from the edge, must not
  const mk = (g, r, o = 1, b = 0) => ({ g, t: "shape", s: "div", r, o, b });
  const seq = (a, b) => new Map([[0, a], [nth, b]]);
  const v = (a, b) => vanishPop(seq(a, b), nth).map((x) => x.kind).join();
  const v3 = (a, b, c) => vanishPop(new Map([[0, a], [nth, b], [2 * nth, c]]), nth).map((x) => x.kind).join();
  // the reported case: the gap came to rest with its edge 90 px on screen and was unmounted there
  if (v3([mk("gap:mid", [990, 900, 400, 200])], [mk("gap:mid", [990, 900, 400, 200])], []) !== "VANISH") throw new Error("canary: a layer unmounted at rest with its edge on screen was not flagged (VANISH)");
  if (v3([mk("gap:mid", [900, 900, 400, 200])], [mk("gap:mid", [990, 900, 400, 200])], []) !== "") throw new Error("canary: a layer carried out through the edge at speed was flagged (VANISH)");
  if (v3([mk("gap:mid", [990, 900, 400, 200], 1, 1)], [mk("gap:mid", [990, 900, 400, 200], 1, 1)], []) !== "") throw new Error("canary: a defocused layer passing the lens was flagged (VANISH)");
  if (v([mk("gap:mid", [300, 900, 400, 200])], []) !== "VANISH") throw new Error("canary: a layer unmounted mid-frame was not flagged (VANISH)");
  if (v([mk("gap:mid", [990, 900, 400, 200], 0.1)], []) !== "") throw new Error("canary: a layer that had faded out was flagged (VANISH)");
  if (v([mk("gap:mid", [1100, 900, 400, 200])], []) !== "") throw new Error("canary: a layer already off screen was flagged (VANISH)");
  if (v([], [mk("whyA:mid", [200, 700, 400, 400])]) !== "POP") throw new Error("canary: a layer appearing whole at full opacity was not flagged (POP)");
  if (v([], [mk("whyA:mid", [200, 700, 400, 400], 0.2)]) !== "") throw new Error("canary: a layer fading up was flagged (POP)");
  if (v([], [mk("whyA:mid", [900, 700, 400, 400])]) !== "") throw new Error("canary: a layer entering from the edge was flagged (POP)");
  if (v([mk("caption", [300, 270, 400, 40])], []) !== "") throw new Error("canary: a caption chip swap was flagged (VANISH is for world layers)");
}
{
  const fake = new Map([
    [0, [{ g: "hook:mid", o: 1 }, { g: "chip:fg", o: 1 }]],
    [2, [{ g: "hook:mid", o: 1 }, { g: "hero", o: 1 }]],
    [4, [{ g: "chip:mid", o: 0.5 }, { g: "hook:fg", o: 0.05 }]],
  ]);
  if (coVisible(fake, "hook", "chip") !== 1 * nth) throw new Error("canary: overlap counter miscounted hook/chip");
  if (coVisible(fake, "hook", "question") !== 1 * nth) throw new Error("canary: overlap counter did not map hero → question");
  // a carried logo (drawn by take, marked a: "index") counts for BOTH; an unmarked take item alone does not
  const carried = new Map([[0, [{ g: "take:mid", o: 1, a: "index" }]], [2, [{ g: "take:mid", o: 1 }]]]);
  if (coVisible(carried, "index", "take") !== 1 * nth) throw new Error("canary: overlap counter mishandled a carried item (a:)");
  // a push in time: out last on 4, in first on 8 → a 3-f gap; out still on 9 → they shared frames (gap < 0)
  const push = (lastOut) => pushGap(new Map([...Array(12)].map((_, f) => [f, [...(f <= lastOut ? [{ g: "a:mid", o: 1 }] : []), ...(f >= 8 ? [{ g: "b:mid", o: 1 }] : [])]])), "a", "b");
  if (push(4)?.gap !== 3) throw new Error("canary: the push gap miscounted a clean hand-over in time");
  if (!(push(9)?.gap < 0)) throw new Error("canary: the push gap missed two places sharing frames");
}

const inputProps = { probe: true };
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
const composition = await selectComposition({ ...RP,  serveUrl, id: "TeslaFlyingRoadster", inputProps });
const frames = new Map(), lineHits = new Map(), canaries = new Map();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bk-sweep-"));
await renderFrames({ ...RP, 
  composition, serveUrl, inputProps, outputDir: tmp, imageFormat: "jpeg", everyNthFrame: nth, concurrency: CONC, scale: KEEP ? 0.5 : 0.25,
  ...(RANGE.length === 2 ? { frameRange: [RANGE[0], RANGE[1]] } : {}),
  onStart: () => {}, onFrameUpdate: () => {},
  onBrowserLog: (log) => {
    const t = log.text ?? "";
    if (!t.startsWith("PROBE ")) return;
    const d = JSON.parse(t.slice(6));
    frames.set(d.frame, d.items);
    lineHits.set(d.frame, d.lines ?? null);
    canaries.set(d.frame, d.canary ?? null);
  },
});
if (KEEP) {
  const dst = path.join(root, "out", "sweep_frames");
  fs.rmSync(dst, { recursive: true, force: true });
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(tmp)) fs.renameSync(path.join(tmp, f), path.join(dst, f));
}
fs.rmSync(tmp, { recursive: true, force: true });
fs.writeFileSync(path.join(root, "out", "probe_frames.json"), JSON.stringify([...frames]));   // for per-frame debugging

// Remotion takes every nth frame by ABSOLUTE frame number (f % nth === 0), also inside a --range
const [r0, r1] = RANGE.length === 2 ? RANGE : [0, composition.durationInFrames - 1];
const expected = Math.floor(r1 / nth) - Math.ceil(r0 / nth) + 1;
if (frames.size < expected) throw new Error(`probe logged ${frames.size} frames of ${expected} — refusing (a silent probe reports clean)`);
const empty = [...frames].filter(([, it]) => it.length === 0).map(([f]) => f);
if (empty.length) throw new Error(`frames with nothing measured: ${empty.join(",")} — refusing`);
if (![...frames.values()].some((it) => it.some((x) => x.b))) throw new Error("no defocused item was ever logged — the probe is not reading data-blur; refusing");
const badCanary = [...canaries].filter(([, c]) => !c || c[0] !== true || c[1] !== false || c[2] !== true).map(([f]) => f);
if (badCanary.length) throw new Error(`the probe's canaries failed on ${badCanary.length} frames (first ${badCanary[0]}) — LINE or the tilted-shape quad cannot be trusted; refusing`);

const hits = new Map(), firstAt = new Map();
const note = (kind, key, f, box) => { const k = `${kind} ${key}`; if (!hits.has(k)) hits.set(k, []); hits.get(k).push(f); if (box && !firstAt.has(k)) firstAt.set(k, [f, box]); };
// SOFTCAP — a defocused figure that still reads, crossing the pinned caption/question
for (const [f, items] of frames) for (const c of items) for (const x of items) if (softcap(c, x)) note("SOFTCAP", `${x.g}:${x.t}"${x.s}" behind ${c.g}:"${c.s}"`, f, [c.r, x.r, x.bl]);
// EDGE — an own-group label × a div/img edge (the same-group pairs the loop below never compares as shapes)
for (const [f, items] of frames) for (const a of items) for (const b of items) if (edge(a, b)) note("EDGE", `${a.g}:"${a.s}" × its ${b.s}`, f, [a.r, b.r]);
// LINE — strokes through text, from the probe's sampled geometry
for (const [f, lh] of lineHits) for (const [ti, pg, desc] of lh ?? []) {
  const t = frames.get(f)[ti];
  if (!t) throw new Error(`LINE hit at frame ${f} names text #${ti}, which that frame does not have — refusing`);
  if (inCrane(f, pg, t.g)) { const k = `${pg} under the caption in a crane`; transit.set(k, [...(transit.get(k) ?? []), f]); continue; }
  note("LINE", `${pg}:${desc.replace(/\[.*\]/, "")} through ${t.g}:"${t.s}"`, f, [t.r, desc]);
}
for (const [f, items] of [...frames].sort((a, b) => a[0] - b[0])) {
  for (let i = 0; i < items.length; i++) {
    const a = items[i];
    if (!a.b && !a.x && a.t === "text" && !a.g.includes(":") && (a.r[0] < -1 || a.r[1] < -1 || a.r[0] + a.r[2] > 1081 || a.r[1] + a.r[3] > 1921)) note("CLIP", `${a.g}:"${a.s}"`, f);
    for (let j = i + 1; j < items.length; j++) {
      const b = items[j];
      if (!collide(a, b)) continue;
      // the bottom WATERMARK is a faint overlay (30%) that everything passes beneath, like a broadcast bug — a place
      // leaving through the bottom edge crossing under it is not a collision (Bankers/CLAUDE.md §2.5.4)
      if (a.g === "logo" || b.g === "logo") continue;
      if (a.g !== b.g && inCrane(f, a.g, b.g)) { const k = `${a.g === "caption" ? b.g : a.g} under the caption in a crane`; transit.set(k, [...(transit.get(k) ?? []), f]); continue; }
      if (a.g !== b.g) note("CROSS", `${a.g}:${a.t}"${a.s}" × ${b.g}:${b.t}"${b.s}"`, f);
      else if (a.t === "text" && b.t === "text" && a.o >= 0.3 && b.o >= 0.3 && a.s !== b.s) note("TEXT", `${a.g}:"${a.s}" × "${b.s}"`, f);
    }
  }
}
const scenes = scenesHits(frames);
for (const x of vanishPop(frames, nth)) note(x.kind,`${x.g} (${x.s}) ${x.kind === "VANISH" ? "unmounted while on screen" : "appeared in one frame"}`, x.f, x.r);
for (const [k, v] of marginHits(frames, nth)) for (const f of v.fs) note("MARGIN", `${k} rests outside x ${ZONE.x0}–${ZONE.x1}, y ${ZONE.y0}–${ZONE.y1}`, f, v.box);
const spans = (fs_) => { const out = []; let s = fs_[0], p = fs_[0]; for (const f of fs_.slice(1)) { if (f - p > nth) { out.push(s === p ? `${s}` : `${s}–${p}`); s = f; } p = f; } out.push(s === p ? `${s}` : `${s}–${p}`); return out.join(", "); };
const maxItems = Math.max(...[...frames.values()].map((i) => i.length));
console.log(`swept ${frames.size} frames (every ${nth}th); up to ${maxItems} items per frame; canaries ok`);
if (!hits.size) console.log("CLEAN — no sharp cross-group overlaps, no text-on-text, no clipped text");
for (const [k, fs_] of [...hits].sort((x, y) => Math.min(...x[1]) - Math.min(...y[1]))) {
  fs_.sort((x, y) => x - y);
  console.log(`${k}  @ ${spans([...new Set(fs_)])}` + (firstAt.has(k) ? `   first ${JSON.stringify(firstAt.get(k))}` : ""));
}
for (const [k, fs_] of transit) console.log(`TRANSIT ${k} @ ${spans([...new Set(fs_)].sort((x, y) => x - y))} (listed, not a collision: STYLE §8.0)`);
if (!scenes.size) console.log("SCENES CLEAN — no two places share pixels on any frame, at any opacity (STYLE §9.8)");
for (const l of scenesReport(scenes)) console.log(l);

let short = [];
for (const [p, q] of TRANSITIONS) {
  // in TIME: a push, and the closing question (its text is pinned at the frame's centre and flies in from depth, so it can never
  // stand beside the place before it — that place slides out first, STYLE §8.10 / §9.8)
  if (KIND_OF.get(q) === "push" || q === "question") {
    const g = pushGap(frames, p, q);
    console.log(`HANDOVER ${p} → ${q} (${KIND_OF.get(q)}, in time): ${g ? `${p} last on ${g.lastOut}, ${q} first on ${g.firstIn}, gap ${g.gap} f` : "not both seen"}`);
    if (!g || g.gap < 0 || g.gap * 1 >= MAX_PUSH_GAP) short.push(`${p}→${q} push gap ${g?.gap ?? "?"} f (0–${MAX_PUSH_GAP - 1})`);
    continue;
  }
  const n = coVisible(frames, p, q);
  console.log(`OVERLAP ${p} → ${q}: ${n} f on screen together (${(n / 30).toFixed(2)} s)`);
  if (n < minOverlap(q)) short.push(`${p}→${q} ${n} f (min ${minOverlap(q)})`);
}
if (scenes.size && RANGE.length !== 2) { console.error(`REFUSED — two scenes share pixels (SCENES, STYLE §9.8): ${[...scenes.keys()].join(", ")}`); process.exit(1); }
if (short.length && RANGE.length !== 2) { console.error(`REFUSED — hand-overs off the rule (slides ≥ ${MIN_OVERLAP} f side by side, pushes in time): ${short.join(", ")}`); process.exit(1); }
