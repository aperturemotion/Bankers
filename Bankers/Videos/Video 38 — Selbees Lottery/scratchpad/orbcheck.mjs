import * as __fs46 from "node:fs";
// THE HALF-LINE CHECK (V38 revision, 2026-10-14): in every frame where the character is drawn, nothing of him below his body's
// half line (cy + 2.56 R) may be inside the frame (the user: "the lower half of his body shouldn't be seen often"; the Style 3
// rule: the frame's bottom edge cuts him at or above mid-body).
//   node scratchpad/orbcheck.mjs [every=1] [from=0] [to=end]
// Renders with inputProps { orbcheck: true } (src/bnx/OrbCheck.tsx logs, per frame, each figure's half line in screen space) and
// folds the frames where a half line is inside the frame into spans, per figure. Also lists every place that draws him.
// ★ It proves itself: canary IN must be flagged and canary OUT must not, on EVERY frame; a frame that did not report, or a run
//   that saw no figure at all, is a refusal (exit 2). Violations exit 1.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderFrames } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import os from "os";

const [ev, a, b] = process.argv.slice(2);
const every = Number(ev ?? 1);
const PORT = Number(process.env.PORT ?? 3867);
const beats = JSON.parse(fs.readFileSync("scratchpad/beats.json", "utf8")).beats;
const beatOf = (f) => beats.filter((x) => f >= x.enter && f < x.gone + 2).map((x) => x.id)[0] ?? "?";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
// ★ V46: delete this run's webpack bundle on exit (every run left ~69 MB in /tmp and filled the disk)
process.on("exit", () => { try { __fs46.rmSync(serveUrl, { recursive: true, force: true }); } catch {} });
const inputProps = { orbcheck: true };
const composition = await selectComposition({ serveUrl, id: "TheranosBloodTest", port: PORT, inputProps });
const from = Number(a ?? 0), to = Math.min(Number(b ?? composition.durationInFrames - 1), composition.durationInFrames - 1);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "orb-"));
const logs = new Map();
let unparsable = 0;
await renderFrames({
  serveUrl, composition, port: PORT, outputDir: tmp, inputProps, imageFormat: "jpeg", jpegQuality: 30, scale: 0.1,
  frameRange: [from, to], everyNthFrame: every, concurrency: Number(process.env.CONC ?? 4),
  onStart: () => {}, onFrameUpdate: () => {},
  onBrowserLog: (l) => {
    const m = l.text.match(/^ORB (\d+) (.*)$/s);
    if (!m) return;
    try { logs.set(Number(m[1]), JSON.parse(m[2])); } catch { unparsable++; }
  },
});
fs.rmSync(tmp, { recursive: true, force: true });
const expected = [];
for (let f = from; f <= to; f++) if (f % every === 0) expected.push(f);
const missing = expected.filter((f) => !logs.has(f));
let canIn = 0, canOut = 0, seen = 0;
const spans = new Map();   // id → [[a, b, minY]]
const where = new Map();   // id → set of beats it is drawn in
for (const f of expected) {
  const v = logs.get(f);
  if (!v || v.err) continue;
  const o = Object.fromEntries((v.orbs ?? []).map((x) => [x.id, x]));
  if (!o["CANARY-IN"]?.bad) canIn++;
  if (!o["CANARY-OUT"] || o["CANARY-OUT"].bad) canOut++;
  for (const x of v.orbs ?? []) {
    if (/^CANARY/.test(x.id)) continue;
    seen++;
    if (!where.has(x.id)) where.set(x.id, new Set());
    where.get(x.id).add(beatOf(f));
    if (!x.bad) continue;
    const list = spans.get(x.id) ?? [];
    const last = list[list.length - 1];
    if (last && f - last[1] <= every) { last[1] = f; last[2] = Math.min(last[2], x.y); } else list.push([f, f, x.y]);
    spans.set(x.id, list);
  }
}
console.log(`HALF-LINE CHECK — frames ${from}-${to} every ${every}: ${logs.size}/${expected.length} reported, ${unparsable} unparsable`);
console.log(`canary IN missed on ${canIn} frame(s), canary OUT leaked on ${canOut}; ${seen} figure-frames measured`);
console.log("\nWHERE HE IS DRAWN:");
for (const [id, s] of where) console.log(`  ${id.padEnd(8)} in ${[...s].join(", ")}`);
// ★ DECLARED EXCEPTIONS (listed, never silent): a figure whose place the user asked to show MORE of him. Each names the figure,
//   the beats it covers and the user's words; a span outside those beats still fails.
const ALLOW = {
  hkme: { beats: ["field"], why: 'the hook (user, 2026-10-15: "for the guy in the corner in the hook scene, more of his body should show"): the frame cuts him at ~3/4 of his body' },
};
let n = 0, nOk = 0;
const okLines = [];
console.log("\nHALF LINE INSIDE THE FRAME (his lower half on screen):");
for (const [id, list] of spans) for (const [s, e, y] of list) {
  const line = `  ${id.padEnd(8)} ${String(s).padStart(5)}-${String(e).padEnd(5)} ${beatOf(s).padEnd(8)} half line as high as y ${y.toFixed(0)}`;
  if (ALLOW[id] && ALLOW[id].beats.includes(beatOf(s)) && ALLOW[id].beats.includes(beatOf(e))) { nOk++; okLines.push(line); continue; }
  n++;
  console.log(line);
}
if (!n) console.log("  none");
if (nOk) {
  console.log("\nDECLARED EXCEPTIONS (listed, not faults):");
  for (const [id, a] of Object.entries(ALLOW)) console.log(`  ${id}: ${a.why}`);
  for (const l of okLines) console.log(l);
}
if (missing.length || unparsable || canIn || canOut || !seen) {
  console.log(`\n✗ REFUSED — ${missing.length} frame(s) missing, canaries ${canIn}/${canOut}, ${seen} figure-frames`);
  process.exit(2);
}
console.log(n ? `\n✗ ${n} span(s): his lower half is on screen` : "\n✓ his lower half is never on screen");
process.exit(n ? 1 : 0);
