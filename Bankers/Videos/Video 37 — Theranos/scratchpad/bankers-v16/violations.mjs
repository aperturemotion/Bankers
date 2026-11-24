// ★ THE VIOLATION SWEEP — clearance, not only crossing (root CLAUDE.md, V30: "Do an intersection sweep and violations not only
// intersections"; Timur, 2026-10-01, Video 4: "do a full intersection and violation sweep"). The intersection sweep
// (sweep.mjs) refuses things that CROSS; a label touching a line, or text crowding the edge of the plate it is printed on,
// crosses nothing and passes it. This reads the probe's own per-frame measurements (out/probe_frames.json, written by every
// `sweep.mjs` run) and measures the GAPS:
//   V1  text ↔ a shape it is not printed on ............ ≥ 14 px
//   V2  text ↔ text (8 px inside one construction) ..... ≥ 10 px
//   V3  anything ↔ the caption chip's ink while it shows  ≥ 12 px
//   V4  text ↔ the edges of the surface it is printed on  ≥ 14 px   (Style 3 V30 check 6)
// Sharp, visible items only (the probe's own criteria: opacity ≥ 0.3, not defocused, not a frame-filling shape, not exiting).
// Near-misses fold into spans by their SMALLEST gap. ⚠ A touch is gap 0 and IS a violation (V30: a check that required a point
// strictly inside the ink let a touch fall through both tests).
// Spans that sit wholly inside a camera move are listed apart as IN TRANSIT (two constructions passing during a slide).
// It proves itself first: canaries that must fire and canaries that must not.
//   node scratchpad/violations.mjs            (exit 1 on a settled violation)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const video = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIM = { V1: 14, V2: 10, V2same: 8, V3: 12, V4: 14 };
const PINNED = new Set(["caption", "hero", "logo"]);

// ── geometry on the probe's boxes [x, y, w, h] ──
const gap = (a, b) => {
  const dx = Math.max(0, Math.max(a[0], b[0]) - Math.min(a[0] + a[2], b[0] + b[2]));
  const dy = Math.max(0, Math.max(a[1], b[1]) - Math.min(a[1] + a[3], b[1] + b[3]));
  return Math.hypot(dx, dy);
};
// ★ a TILTED text is measured by its ink QUAD (the probe's `q`), not its axis-aligned box (2026-10-13, Video 10): MORTGAGE RATES,
// printed on a block tilted 19° on its rail, has a 129-px-tall box whose corner reached the tie plates under the rail (V1 at 0.7 px)
// while the letters stood 40 px clear. Convex polygons: 0 when they overlap (separating axes), else the least edge-to-edge distance.
const corners = (r) => [[r[0], r[1]], [r[0] + r[2], r[1]], [r[0] + r[2], r[1] + r[3]], [r[0], r[1] + r[3]]];
const quadPts = (q) => [[q[0], q[1]], [q[2], q[3]], [q[4], q[5]], [q[6], q[7]]];
const overlapSAT = (A, B) => {
  for (const P of [A, B]) for (let i = 0; i < P.length; i++) {
    const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length], nx = y2 - y1, ny = x1 - x2;
    const pa = A.map(([x, y]) => x * nx + y * ny), pb = B.map(([x, y]) => x * nx + y * ny);
    if (Math.max(...pa) < Math.min(...pb) || Math.max(...pb) < Math.min(...pa)) return false;
  }
  return true;
};
const segPt = ([px, py], [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy, t = L ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};
const polyGap = (A, B) => {
  if (overlapSAT(A, B)) return 0;
  let g = Infinity;
  for (const [P, Q] of [[A, B], [B, A]]) for (const p of P) for (let i = 0; i < Q.length; i++) g = Math.min(g, segPt(p, Q[i], Q[(i + 1) % Q.length]));
  return g;
};
const textGap = (t, r) => (t.q && t.q.length === 8 ? polyGap(quadPts(t.q), corners(r)) : gap(t.r, r));
const inside = (a, b, tol = 1) => a[0] >= b[0] - tol && a[1] >= b[1] - tol && a[0] + a[2] <= b[0] + b[2] + tol && a[1] + a[3] <= b[1] + b[3] + tol;
const inner = (a, b) => Math.min(a[0] - b[0], a[1] - b[1], b[0] + b[2] - (a[0] + a[2]), b[1] + b[3] - (a[1] + a[3]));
const sharp = (i) => i.o >= 0.3 && !i.b && !i.L && !i.x && i.r[2] > 0.5 && i.r[3] > 0.5;
const place = (g) => g.split(":")[0];

/** text ↔ fat-path pairs the box test cannot measure (reported, never passed) */
const unmeasured = { n: 0 };
/** one frame's violations, as [check, key, gap] */
function judge(items) {
  const out = [];
  const vis = items.filter(sharp);
  const texts = vis.filter((i) => i.t === "text"), shapes = vis.filter((i) => i.t === "shape");
  const world = (i) => !PINNED.has(i.g);
  for (const t of texts.filter(world)) {
    // the surface it is printed on: the smallest shape whose box contains it
    const hosts = shapes.filter((s) => inside(t.r, s.r)).sort((a, b) => a.r[2] * a.r[3] - b.r[2] * b.r[3]);
    const host = hosts[0];
    if (host) { const m = inner(t.r, host.r); if (m < LIM.V4) out.push(["V4", `"${t.s}" (${t.g}) in its ${host.s} (${host.g})`, m]); }
    for (const s of shapes) {
      if (hosts.includes(s) || !world(s)) continue;
      // ⚠ an SVG path / polygon is measured by its BOX, which is its shape only when it is line-thin (a rule, a tick, a stroke);
      // a fat path's box (a coin's slice, a lamp field) holds empty space its outline never reaches. Those pairs are COUNTED as
      // unmeasured, never passed (the sweep's LINE check samples their real outlines for crossings).
      if (/^(path|polygon|polyline)$/.test(s.s) && Math.min(s.r[2], s.r[3]) > 12) { unmeasured.n++; continue; }
      // a shape it is printed on (any containing one) is its surface; every other shape keeps 14 px
      const g = textGap(t, s.r);
      if (g < LIM.V1) out.push(["V1", `"${t.s}" (${t.g}) ↔ ${s.s} (${s.g})`, g]);
    }
  }
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    const a = texts[i], b = texts[j];
    if (!world(a) || !world(b)) continue;
    const lim = place(a.g) === place(b.g) ? LIM.V2same : LIM.V2;
    // ★ (2026-10-18, Video 12 revision 3) two texts that both carry their ink QUAD (SVG print on a sheared surface — the hook's strap) are
    // judged quad to quad, as V1 and the sweep already judge a tilted text: their axis-aligned boxes are diagonal hulls that overlapped
    // while the letters stood clear (V2 at 0–4 px for a figure and its label 42 units apart on the strap)
    const g = a.q?.length === 8 && b.q?.length === 8 ? polyGap(quadPts(a.q), quadPts(b.q)) : gap(a.r, b.r);
    if (g < lim) out.push(["V2", `"${a.s}" (${a.g}) ↔ "${b.s}" (${b.g})`, g]);
  }
  const caps = texts.filter((t) => t.g === "caption");
  for (const c of caps) for (const w of vis.filter(world)) {
    const g = gap(c.r, w.r);
    if (g < LIM.V3) out.push(["V3", `caption "${c.s}" ↔ ${w.t === "text" ? `"${w.s}"` : w.s} (${w.g})`, g]);
  }
  return out;
}

// ── canaries: every check must FIRE on its planted fault and stay quiet on its clean twin ──
const T = (g, s, r) => ({ g, t: "text", s, r, o: 1, b: 0, x: 0 });
const S = (g, s, r) => ({ g, t: "shape", s, r, o: 1, b: 0, x: 0 });
const fires = (items, check) => judge(items).some(([c]) => c === check);
const proofs = [
  ["V1 measures a thin SVG rule", fires([T("a:mid", "SEPT", [100, 500, 80, 30]), S("a:mid", "path", [186, 400, 3, 300])], "V1"), true],
  ["V1 leaves a fat path to LINE", fires([T("a:mid", "$1", [100, 500, 80, 30]), S("a:mid", "path", [60, 420, 300, 300])], "V1"), false],
  ["V1 fires (7 px from a rule)", fires([T("a:mid", "SEPT", [100, 500, 80, 30]), S("a:mid", "div", [187, 400, 4, 300])], "V1"), true],
  ["V1 fires on a touch (gap 0)", fires([T("a:mid", "SEPT", [100, 500, 80, 30]), S("a:mid", "div", [180, 400, 4, 300])], "V1"), true],
  ["V1 quiet (34 px)", fires([T("a:mid", "SEPT", [100, 500, 80, 30]), S("a:mid", "div", [214, 400, 4, 300])], "V1"), false],
  ["V2 fires (6 px apart)", fires([T("a:mid", "ONE", [100, 500, 80, 30]), T("b:mid", "TWO", [186, 500, 80, 30])], "V2"), true],
  ["V2 quiet (30 px)", fires([T("a:mid", "ONE", [100, 500, 80, 30]), T("b:mid", "TWO", [210, 500, 80, 30])], "V2"), false],
  ["V3 fires (5 px under a chip)", fires([T("caption", "chip", [300, 270, 400, 40]), S("a:mid", "div", [500, 315, 60, 60])], "V3"), true],
  ["V3 quiet (60 px)", fires([T("caption", "chip", [300, 270, 400, 40]), S("a:mid", "div", [500, 370, 60, 60])], "V3"), false],
  ["V4 fires (3 px from its plate's edge)", fires([T("a:mid", "NEAR A HIGH", [103, 500, 200, 30]), S("a:mid", "div", [100, 480, 400, 100])], "V4"), true],
  ["V4 quiet (centred)", fires([T("a:mid", "NEAR A HIGH", [200, 515, 200, 30]), S("a:mid", "div", [100, 480, 400, 100])], "V4"), false],
  // a text tilted ~19° (its quad) whose BOX reaches a small rect below it, while its letters stand ~40 px clear: quiet; the same tilt
  // with the rect moved up to 5 px under the letters: fires
  ["V1 judges a tilted text by its quad (quiet)", fires([{ ...T("a:mid", "MORTGAGE RATES", [117, 1062, 270, 118]), q: [117, 1152, 375, 1062, 386, 1092, 128, 1182] }, S("a:mid", "rect", [393, 1193, 18, 12])], "V1"), false],
  ["V1 judges a tilted text by its quad (fires)", fires([{ ...T("a:mid", "MORTGAGE RATES", [117, 1062, 270, 118]), q: [117, 1152, 375, 1062, 386, 1092, 128, 1182] }, S("a:mid", "rect", [250, 1150, 18, 12])], "V1"), true],
  // two SHEARED texts (quads on a slope) whose boxes overlap: their ink 19.8 px apart is quiet; the same pair with its ink 3.8 px apart fires
  ["V2 judges two sheared texts by their quads (quiet)", fires([{ ...T("a:mid", "+3.0%", [100, 520, 170, 120]), q: [100, 600, 260, 520, 270, 560, 110, 640] }, { ...T("a:mid", "PAY", [100, 587, 170, 120]), q: [100, 667.1, 260, 587.1, 270, 627.1, 110, 707.1] }], "V2"), false],
  ["V2 judges two sheared texts by their quads (fires)", fires([{ ...T("a:mid", "+3.0%", [100, 520, 170, 120]), q: [100, 600, 260, 520, 270, 560, 110, 640] }, { ...T("a:mid", "PAY", [100, 569, 170, 120]), q: [100, 649.2, 260, 569.2, 270, 609.2, 110, 689.2] }], "V2"), true],
  ["a defocused item is never judged", fires([{ ...T("a:mid", "SEPT", [100, 500, 80, 30]), b: 1 }, S("a:mid", "div", [180, 400, 4, 300])], "V1"), false],
];
const broken = proofs.filter(([, got, want]) => got !== want);
if (broken.length) { console.log(`✗ REFUSED — the checker failed its canaries: ${broken.map(([n]) => n).join("; ")}`); process.exit(1); }

// ── the film ──
const file = path.join(video, "out", "probe_frames.json");
if (!fs.existsSync(file)) { console.log("✗ REFUSED — no out/probe_frames.json: run `node scratchpad/sweep.mjs 1` first"); process.exit(1); }
const frames = JSON.parse(fs.readFileSync(file, "utf8")).sort((a, b) => a[0] - b[0]);
if (frames.length < 100) { console.log(`✗ REFUSED — only ${frames.length} frames measured: run the full sweep`); process.exit(1); }

// the camera moves, from the composition itself (as stylecheck does), to tell settled frames from transit
const req = createRequire(path.join(video, "package.json"));
const esbuild = req("esbuild");
const stub = { name: "stub", setup(b) {
  b.onResolve({ filter: /^@remotion\/(google-fonts|fonts)/ }, (a) => ({ path: a.path, namespace: "stub" }));
  b.onResolve({ filter: /(^|\/)Probe$/ }, (a) => ({ path: a.path, namespace: "stub" }));
  b.onLoad({ filter: /.*/, namespace: "stub" }, (a) => ({ contents: /Probe$/.test(a.path) ? `export const Probe = () => null;` : `export const loadFont = () => ({ fontFamily: "stub", waitUntilDone: () => Promise.resolve() });`, loader: "js" }));
} };
const r = await esbuild.build({ stdin: { contents: `export { JOURNEY } from "./Video";`, resolveDir: path.join(video, "src", "pe"), loader: "ts" },
  bundle: true, platform: "node", format: "cjs", write: false, jsx: "automatic", logLevel: "silent",
  external: ["react", "react/*", "react-dom", "remotion", "remotion/*", "@remotion/*"], loader: { ".svg": "text", ".json": "json" }, plugins: [stub] });
const tmp = path.join(video, "scratchpad", `.viol_${process.pid}.cjs`);
fs.writeFileSync(tmp, r.outputFiles[0].text);
let J; try { J = createRequire(tmp)(tmp).JOURNEY; } finally { fs.rmSync(tmp, { force: true }); }
const moving = (f) => J.MOVES.some((m) => f >= m.t0 && f <= m.t1 && (Math.abs(m.d.x ?? 0) > 50 || Math.abs(m.d.y ?? 0) > 50 || Math.abs(m.d.z ?? 0) > 0.2));

const spans = new Map();
for (const [f, items] of frames) for (const [check, key, g] of judge(items)) {
  const k = `${check} ${key}`;
  const s = spans.get(k);
  if (s && f <= s.b + 2) { s.b = f; s.min = Math.min(s.min, g); s.n++; s.allMoving &&= moving(f); }
  else if (!s) spans.set(k, { check, key, a: f, b: f, min: g, n: 1, allMoving: moving(f), more: [] });
  else { s.more.push([s.a, s.b]); s.a = f; s.b = f; s.min = Math.min(s.min, g); s.n++; s.allMoving &&= moving(f); }
}
const all = [...spans.values()].sort((x, y) => x.a - y.a);
const settled = all.filter((s) => !s.allMoving), transit = all.filter((s) => s.allMoving);
const fmt = (s) => `  ${s.check}  ${s.key}  @ ${[...s.more, [s.a, s.b]].map(([a, b]) => (a === b ? `${a}` : `${a}–${b}`)).join(", ")}  (smallest gap ${s.min.toFixed(1)} px, limit ${LIM[s.check]})`;
console.log(`violation sweep — ${frames.length} frames; canaries ok (${proofs.length}); ${unmeasured.n} text ↔ fat-path pairs not measurable by box (their crossings are the sweep's LINE check)`);
if (settled.length) { console.log(`✗ ${settled.length} violation(s) on settled frames:`); for (const s of settled) console.log(fmt(s)); }
if (transit.length) { console.log(`• ${transit.length} only while the camera moves (constructions passing in a move):`); for (const s of transit) console.log(fmt(s)); }
console.log(settled.length ? "REFUSED" : "CLEAN — no violations on settled frames");
process.exit(settled.length ? 1 : 0);
