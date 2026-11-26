import * as __fs46 from "node:fs";
// THE INTERSECTION + CLEARANCE SWEEP — measured, not eyeballed.   (ported from Video 28, 2026-09-25)
// ★ 2026-09-28 (user: "violations not only intersections"): it also reports NEAR-MISSES — text within
//   14 px of a shape it is not printed on, two separate texts within 10 px, anything within 12 px of the
//   caption band (Probe.tsx checks 4–5) — with the smallest gap as the span's worst.
//   node scratchpad/geom_sweep.mjs [every=3] [from=0] [to=end]
// Renders the film with inputProps { probe: true } (src/bnx/Probe.tsx measures every visible text
// run and shape outline after all transforms and logs the collisions), collects the per-frame logs
// and folds them into SPANS: one line per (kind, text, other) with its frame range, scene and worst
// alpha. Writes out/geom/report.txt and out/geom/raw.json.
//
// ★ A CHECK WHOSE FAILURE MODE IS "PASS" MUST PROVE IT CAN FIRE: the run REFUSES (exit 2) if the
//   probe's outline math disagrees with the browser's own boxes (cal > 1.5px), if any frame did not
//   report, if the probe measured no text, if the root is not found exactly once, or if either
//   canary misbehaves on any frame (A must fire; B, occluded, must not; C, 7 px from a rule, must be
//   reported as a near-miss; D, 34 px from one, must not).
import { bundle } from "@remotion/bundler";
import { selectComposition, renderFrames } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import os from "os";

const [ev, a, b] = process.argv.slice(2);
const every = Number(ev ?? 3);
const PORT = Number(process.env.PORT ?? 3861);   // PORT=… and GEOM_OUT=… let a second sweep run in parallel
const GOUT = process.env.GEOM_OUT ?? "out/geom";   // ⚠ pinned: V28's Studio is 3028, stills/frames 3236, mixprobe 3237
const cap = fs.readFileSync("src/bnx/captions.ts", "utf8");
const SCN = JSON.parse(cap.match(/export const SCENES(?::[^=]*)? = (\[[\s\S]*?\]);/)[1]);
const beats = JSON.parse(fs.readFileSync("scratchpad/beats.json", "utf8")).beats;
const beatOf = (f) => (beats.filter((x) => f >= x.enter && f < x.gone + 2).map((x) => x.id)[0]) ?? (SCN.find((s) => f >= s.startFrame && f < s.endFrame) || SCN[SCN.length - 1]).id;

// ★ GEOM_RAW=1 re-judges the last run's out/geom/raw.json without rendering again (V41: a judge-side fix, such as a DATA_SOLIDS
//   carried from the previous film, should not cost a 40-minute probe render). The probe's logs are the same; only the judge changes.
const RAW = process.env.GEOM_RAW === "1";
const TOTAL_F = Number(cap.match(/TOTAL_FRAMES = (\d+)/)[1]);
const from = Number(a ?? 0), to = Math.min(Number(b ?? TOTAL_F - 1), TOTAL_F - 1);
const logs = new Map();
let bad = 0;
if (RAW) {
  for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync(GOUT + "/raw.json", "utf8")))) logs.set(Number(k), v);
  console.log(`(GEOM_RAW: re-judging ${logs.size} probed frames from ${GOUT}/raw.json, no render)`);
} else {
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
// ★ V46: delete this run's webpack bundle on exit (every run left ~69 MB in /tmp and filled the disk)
process.on("exit", () => { try { __fs46.rmSync(serveUrl, { recursive: true, force: true }); } catch {} });
const inputProps = { probe: true };
const composition = await selectComposition({ serveUrl, id: "TheranosBloodTest", port: PORT, inputProps });
if (composition.durationInFrames !== TOTAL_F) throw new Error("geom_sweep: composition length disagrees with captions.ts");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "geom-"));
await renderFrames({
  serveUrl, composition, port: PORT, outputDir: tmp, inputProps,
  imageFormat: "jpeg", jpegQuality: 40, scale: Number(process.env.SCALE ?? 0.1), frameRange: [from, to], everyNthFrame: every,
  concurrency: Number(process.env.CONC ?? 1),
  onStart: () => {}, onFrameUpdate: () => {},
  onBrowserLog: (l) => {
    const m = l.text.match(/^PROBE (\d+) (.*)$/s);
    if (!m) return;
    try { logs.set(Number(m[1]), JSON.parse(m[2])); } catch { bad++; }
  },
});
fs.rmSync(tmp, { recursive: true, force: true });
}

// ⚠ everyNthFrame renders the frames where f % every === 0 — NOT from, from+every, …
const expected = [];
for (let f = from; f <= to; f++) if (f % every === 0) expected.push(f);
const missing = expected.filter((f) => !logs.has(f));
const vals = [...logs.values()];
const cal = Math.max(...vals.map((v) => v.cal ?? 0));
const calN = vals.reduce((s, v) => s + (v.calN ?? 0), 0);
const texts = vals.reduce((s, v) => s + (v.nT ?? 0), 0);
const roots = Math.min(...vals.map((v) => v.roots ?? 0)), rootsMax = Math.max(...vals.map((v) => v.roots ?? 0));
const canaryA = vals.filter((v) => !v.canary?.a).length;
const canaryB = vals.filter((v) => v.canary?.b).length;
const canaryC = vals.filter((v) => !v.canary?.c).length;
const canaryD = vals.filter((v) => v.canary?.d).length;
// ★ the inner-margin canaries (check 6, 2026-09-28): E crowds its plate and must be reported; F must not
const canaryE = vals.filter((v) => !v.canary?.e).length;
const canaryF = vals.filter((v) => v.canary?.f).length;
// ★ the headroom canaries (G1, 2026-09-29): A (top of frame) must be reported; G (y ~1800) must not
const canaryG = vals.filter((v) => !v.canary?.g).length;
const canaryH = vals.filter((v) => v.canary?.h).length;
// ★ canary R (V31, rectangular occluders): must NOT be reported — and must be PRESENT, so an older probe without it
//   cannot pass by omission
const canaryR = vals.filter((v) => v.canary?.r !== false).length;
// ★ the overflow canaries (V33): K (hidden by its window) must NOT be reported and must be present; L (its twin) MUST be
const canaryK = vals.filter((v) => v.canary?.k !== false).length;
const canaryL = vals.filter((v) => !v.canary?.l).length;
// ★ the text-behind-a-plate canaries (V33): M (behind its plate) must NOT be reported and must be present; N MUST be
const canaryM = vals.filter((v) => v.canary?.m !== false).length;
const canaryN = vals.filter((v) => !v.canary?.n).length;
// ★ the clip-top canaries (E7): T (above its declared mask line) must NOT be reported and must be present; U MUST be
const canaryT = vals.filter((v) => v.canary?.t !== false).length;
const canaryU = vals.filter((v) => !v.canary?.u).length;
const canaryBT = vals.filter((v) => v.canary?.bt !== false).length;   // V37: the clip-bottom pair
const canaryBU = vals.filter((v) => !v.canary?.bu).length;
for (const v of vals) v.hits = (v.hits ?? []).filter((h) => !/canary/i.test(h.a ?? "") && !/canary/i.test(h.b ?? ""));
// ⚠ EDGE and CLIP hits inside a beat's own ENTRANCE (at .. at+22) or EXIT (end−12 .. end+2) are the
// designed slide on/off the frame, not a layout fault — dropped for those two kinds ONLY. Overlaps
// are never filtered: two things crossing mid-slide are still two things crossing.
// ★ E7 (2026-10-07): and inside every hand-over MOVE of the live plan (out/moves.json, cuedump.mjs) — a crane runs 40 f
//   and starts 20 f before its beat, so the old fixed windows (entrance 22 f, exit 12 f) no longer cover the moves
const MOVES_RAW = fs.existsSync("out/moves.json") ? JSON.parse(fs.readFileSync("out/moves.json", "utf8")) : null;
const MOVES = !MOVES_RAW ? [] : Array.isArray(MOVES_RAW) ? MOVES_RAW : (MOVES_RAW.places ?? []);   // { places, lights } since E7's light windows
if (!MOVES.length) { console.error("REFUSED: out/moves.json missing — run scratchpad/cuedump.mjs first"); process.exit(2); }
const moveWin = MOVES.flatMap((p) => [p.enter, p.exit]).filter((m) => m.k !== "own").map((m) => [m.at - 2, m.at + m.dur + 2]);
// ★ V35: and inside the caption-free HOOK's own camera moves (its lean, its pull-back and its crane carry the jaws through
//   the top of the frame under CAPTION_FADE, E7.11) — declared by the composition (`cams` in out/moves.json), LISTED below
const CAMS = (MOVES_RAW && !Array.isArray(MOVES_RAW) && MOVES_RAW.cams) || [];
for (const c of CAMS) moveWin.push([c.a - 2, c.b + 2]);
if (CAMS.length) console.log(`declared construction camera moves (in motion, not settled): ${CAMS.map((c) => `${c.id} ${c.a}-${c.b}`).join(", ")}`);
const inMotion = (f) => beats.some((x) => (f >= x.enter - 2 && f <= x.enter + 22) || (f >= x.gone - 12 && f <= x.gone + 2))
  || moveWin.some(([a, b]) => f >= a && f <= b);
// (near-misses too: a slide passes things close by for a few frames — a crossing is still never filtered)
for (const [f, v] of logs) v.hits = v.hits.filter((h) => !(/^(text-(edge|clipped)|near-(shape|text|caption)|caption-headroom)$/.test(h.k) && inMotion(f)));
fs.mkdirSync(GOUT, { recursive: true });
fs.writeFileSync(GOUT + "/raw.json", JSON.stringify(Object.fromEntries(logs)));

console.log(`frames probed ${logs.size}/${expected.length} (every ${every}, ${from}-${to}); unparsable ${bad}; calibration max ${cal}px over ${calN} rects; ${texts} text runs measured; canary A missed on ${canaryA} frame(s), canary B leaked on ${canaryB}, clearance canary C missed on ${canaryC}, D leaked on ${canaryD}, inner-margin canary E missed on ${canaryE}, F leaked on ${canaryF}, overflow canary K leaked on ${canaryK}, L missed on ${canaryL}, plate canary M leaked on ${canaryM}, N missed on ${canaryN}, clip-top canary T leaked on ${canaryT}, U missed on ${canaryU}, clip-bottom canary BT leaked on ${canaryBT}, BU missed on ${canaryBU}`);
if (missing.length || bad || cal > 1.5 || calN === 0 || texts === 0 || roots !== 1 || rootsMax !== 1 || canaryA || canaryB || canaryC || canaryD || canaryE || canaryF || canaryG || canaryH || canaryR || canaryK || canaryL || canaryM || canaryN || canaryT || canaryU || canaryBT || canaryBU) {
  console.log(`✗ REFUSED — the probe is not trustworthy: missing ${missing.length}${missing.length ? " e.g. " + missing.slice(0, 5).join(",") : ""}, cal ${cal}px, calN ${calN}, texts ${texts}, roots ${roots}-${rootsMax}, canaryA-missed ${canaryA}, canaryB-leaked ${canaryB}, canaryC-missed ${canaryC}, canaryD-leaked ${canaryD}, canaryE-missed ${canaryE}, canaryF-leaked ${canaryF}, canaryG-missed ${canaryG}, canaryH-leaked ${canaryH}, canaryR-leaked-or-absent ${canaryR}, canaryK-leaked-or-absent ${canaryK}, canaryL-missed ${canaryL}, canaryM-leaked-or-absent ${canaryM}, canaryN-missed ${canaryN}`);
  process.exit(2);
}

// fold per-frame hits into spans (same kind + text + other, frames within 2 steps)
const open = new Map(), done = [];
for (const f of expected) {
  const seen = new Set();
  for (const h of logs.get(f).hits) {
    // the "@x,y" position in a shape's description moves with the camera — key on the rest
    const key = `${h.k}|${h.a ?? ""}|${(h.b ?? "").replace(/ @-?\d+,-?\d+$/, "")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const op = Math.min(...(h.op ?? [1]));
    const s = open.get(key);
    // a near-miss's worst is its SMALLEST gap; a crossing's is its largest overlap
    const near = h.gap !== undefined;
    // a headroom hit's worst is its HIGHEST point (the smallest top)
    const head = h.top !== undefined;
    if (s && f - s.last <= every * 2) { s.last = f; s.n++; s.op = Math.max(s.op, op); s.worst = near ? Math.min(s.worst, h.gap) : head ? Math.min(s.worst, h.top) : Math.max(s.worst, h.ov ?? h.n ?? 0); }
    else {
      if (s) done.push(s);
      open.set(key, { k: h.k, a: h.a, b: h.b, first: f, last: f, n: 1, op, worst: near ? h.gap : head ? h.top : h.ov ?? h.n ?? 0, near, beat: beatOf(f), box: h.box });
    }
  }
}
done.push(...open.values());
done.sort((x, y) => x.first - y.first);
// ★★ G4 / G2 — PER CONSTRUCTION, ON SETTLED FRAMES (user, 2026-09-29: "too basic … Add a rule to ensure this type of
// thing doesn't happen again"; "way too much explainer text"). A construction whose settled frames never show
// BASIC_SHAPES painted shapes, or whose built content never spans BASIC_WIDTH px, is "basic"; a settled frame with
// more than MAX_TEXTS built text items (≥ 19 px) is "text-count". The judge proves itself on two fixtures first.
// ★ judged on DETAIL UNITS (Probe.tsx nD: every painted element, a path one unit per 8 vertices). The first version
//   judged the probe's outline list, which skips clip-path solids and counts a 57-point line as one shape — it
//   called the praised parties pair and the hook chart "basic". Calibration: the three flagged designs were 1–5
//   units (a plaque; a sign on a post; one extruded plate).
const BASIC_UNITS = 16, BASIC_WIDTH = 432, MAX_TEXTS = 6;
const judge = (ms) => {
  const nB = Math.max(0, ...ms.map((m) => m.nD ?? 0)), bW = Math.max(0, ...ms.map((m) => m.bW));
  return { nB, bW, basic: nB < BASIC_UNITS || bW < BASIC_WIDTH };
};
if (!judge([{ nD: 2, bW: 560 }, { nD: 5, bW: 340 }]).basic || judge([{ nD: 12, bW: 500 }, { nD: 60, bW: 820 }]).basic) {
  console.log("✗ REFUSED — the basic-construction judge fails its own fixtures");
  process.exit(2);
}
const settled = (f, b) => f >= b.enter + 24 && f <= b.gone - 14;
// the close (the ask slabs, the brand) is the spec'd CTA device (D2 answer slabs), not an info construction
// ★ DATA SOLIDS — declared, never inferred: a construction whose object is a machined bar, rail, column or strip
//   whose LENGTH is the number (V28's vocabulary, the look the user asked to prioritise on 2026-09-28) is not the
//   "figure on a plaque" class. It is exempt from the unit floor only; the width floor still applies.
// V38's data solids (bars and tiles whose LENGTH or COUNT is the number — V28's vocabulary; exempt from the unit floor, never the width)
// V39 (2026-10-19): the two bar pairs, and the honest label (the brief sets that beat's object exactly: "one plain label
//   FORECASTS CAN BE WRONG"; it is type alone by the brief's word, and the width floor still applies)
// V41 (2026-10-23): the five COLA bars (their HEIGHT is the raise), the hundred tiles (their COUNT is the 78%), and the honest label
//   (the brief's own object for that beat: "PROJECTIONS CAN CHANGE", type alone; the width floor still applies)
// V43 (2026-10-26): the one bar chart (GOLD $10,000 vs S&P 500 $129,000 — their HEIGHT is the answer) and the honest label
//   (the brief's own object: "one plain label NOT A FORECAST"; here printed by a label printer)
// V45 (2026-10-31): the paradox timeline (two bars on one time axis: their WIDTH is the time) and the cash waterfall (its column
//   heights are the quarter's cash)
// V35 recovery: V35's own DATA_SOLIDS list did not survive (the published bundle carries src/ only); V46's named beats that V35
//   does not have (eight, worst, nobody-as-a-ladder), so it starts empty — every construction is judged by the unit floor.
const DATA_SOLIDS = {};
const DATA_SOLIDS_V46 = {
  eight: "two extruded bars: $18 APR 2025 and $141 JUN 2026 (their height is the price)",
  worst: "three extruded rows hanging from one zero line: Intel's worst days (their length is the fall)",
  nobody: "a vertical ladder from 100 to 18 and back (its height is the price)",
};
const perBeat = beats.filter((b) => b.id !== "brand" && b.id !== "ask" && b.enter <= to && b.gone >= from).map((b) => {
  const ms = expected.filter((f) => settled(f, b)).map((f) => logs.get(f).metrics).filter(Boolean);
  const j = judge(ms);
  const solid = DATA_SOLIDS[b.id];
  return { id: b.id, n: ms.length, ...j, basic: solid ? j.bW < BASIC_WIDTH : j.basic, solid };
});
for (const id of Object.keys(DATA_SOLIDS)) if (!beats.some((b) => b.id === id)) { console.log(`✗ REFUSED — DATA_SOLIDS names "${id}", which is not a beat`); process.exit(2); }
if (vals.every((v) => !v.metrics)) { console.log("✗ REFUSED — the probe reported no metrics"); process.exit(2); }
for (const b of perBeat) if (b.n && b.basic) done.push({ k: "basic-construction", a: b.id, b: `${b.nB} detail units, ${b.bW}px wide (floor ${BASIC_UNITS} / ${BASIC_WIDTH}px)`, first: beats.find((x) => x.id === b.id).enter, last: beats.find((x) => x.id === b.id).gone, n: b.n, op: 1, worst: b.nB, near: false, beat: b.id });
// text-count: fold settled over-limit frames into spans per beat
for (const b of beats) {
  let span = null;
  for (const f of expected) {
    const m = logs.get(f).metrics;
    const over = settled(f, b) && m && m.nTB > MAX_TEXTS;
    if (over) { if (span && f - span.last <= every * 2) { span.last = f; span.n++; span.worst = Math.max(span.worst, m.nTB); } else { if (span) done.push(span); span = { k: "text-count", a: `${m.nTB} texts`, b: m.tB.join(" | "), first: f, last: f, n: 1, op: 1, worst: m.nTB, near: false, beat: b.id }; } }
  }
  if (span) done.push(span);
}
done.sort((x, y) => x.first - y.first);
const metricLines = perBeat.map((b) => `  ${b.id.padEnd(10)} ${String(b.nB).padStart(4)} units   ${String(b.bW).padStart(4)}px wide  ${b.basic ? "✗ BASIC" : b.solid ? "ok (data solid)" : "ok"}  (${b.n} settled frames)`);
// ★ V31: the probe's declared headroom exemptions ("headroom-ok" — a shape the brief says must leave the frame) are
//   LISTED with their reason and frames, never silent — and never counted as a fault
const excused = done.filter((s) => s.k === "headroom-ok");
for (const s of excused) done.splice(done.indexOf(s), 1);
// ★ V32: declared depth layers of CSS solids (data-probe-depth) — not measured, LISTED with their frames
const depth = done.filter((s) => s.k === "depth-ok");
for (const s of depth) done.splice(done.indexOf(s), 1);
const depthLines = depth.map((s) => `  ${s.first}-${s.last} ${s.beat}: ${s.a}`);
// ★ V33: declared sub-shot exits (data-probe-leaving) — their edge hits LISTED with their frames
const leaving = done.filter((s) => s.k === "leaving-ok");
for (const s of leaving) done.splice(done.indexOf(s), 1);
const leavingLines = leaving.map((s) => `  ${s.first}-${s.last} ${s.beat}: ${s.a}`);
// ★ V33: declared turning surfaces (data-probe-turning) — pairs printed on one turning surface, LISTED with their frames
const turningS = done.filter((s) => s.k === "turning-ok" || s.k === "object-ok" || s.k === "arriving-ok");
for (const s of turningS) done.splice(done.indexOf(s), 1);
const turningLines = turningS.map((s) => `  ${s.first}-${s.last} ${s.beat}: ${s.k === "object-ok" ? "object" : s.k === "arriving-ok" ? "arriving" : "turning"} — ${s.a}`);
const excusedLines = excused.map((s) => `  ${s.first}-${s.last} ${s.beat}: ${s.a} (highest point y ${s.worst})`);
// ★★★★ (2026-10-20, the action camera) text WHOLLY outside the frame (the far pan's name while the camera is tight on the near one) —
//   nothing of it shows, so it is LISTED with its frames, never a clip
const offf = done.filter((s) => s.k === "offframe-ok");
for (const s of offf) done.splice(done.indexOf(s), 1);
const offLines = offf.map((s) => `  ${s.first}-${s.last} ${s.beat}: "${s.a}"`);
const lines = done.map((s) => `${String(s.first).padStart(4)}-${String(s.last).padEnd(4)} ${String(s.beat).padEnd(9)} ${s.k.padEnd(14)} "${s.a ?? ""}"  ×  ${s.b ?? ""}   (n${s.n}, ${s.near ? "gap " + s.worst + "px" : s.k === "caption-headroom" ? "top y " + s.worst : "worst " + s.worst}, α ${s.op.toFixed(2)})${s.box ? " box " + s.box.join(",") : ""}`);
const nNear = done.filter((s) => s.near).length;
const out = [`INTERSECTION + CLEARANCE SWEEP — ${new Date().toISOString()} — every ${every} frames, ${from}-${to}`, `${done.length} span(s) (${done.length - nNear} crossing/edge/headroom/basic/text-count, ${nNear} near-miss)`, ...lines,
  "", "PER CONSTRUCTION (G4: settled frames, max detail units and built width):", ...metricLines,
  "", `DECLARED HEADROOM EXEMPTIONS (${excused.length} span(s) — listed, not faults):`, ...excusedLines,
  "", `DECLARED DEPTH LAYERS (${depth.length} span(s) — hidden layers of CSS solids, not measured):`, ...depthLines,
  "", `TEXT WHOLLY OFF THE FRAME (${offf.length} span(s) — nothing shows; listed, not faults):`, ...offLines,
  "", `DECLARED SHOT EXITS (${leaving.length} span(s) — a shot sliding off inside its beat, edge hits only):`, ...leavingLines,
  "", `DECLARED TURNING SURFACES AND PRINTED OBJECTS (${turningS.length} span(s) — pairs on one surface while it turns, inside one object built to overlap, or a plate fading in):`, ...turningLines].join("\n");
fs.writeFileSync(GOUT + "/report.txt", out);
console.log(out);
