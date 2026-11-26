// Re-sweep one RANGE of the film and merge it into the full every-frame set (out/sweep_frames + out/probe_frames.json), so the
// whole-film checks (violations, flash, whooshsync, scenes) read the current picture without a 25-minute full sweep.
// ★ renderFrames pads file names to the RANGE's width (root CLAUDE.md, V33): a range under frame 1000 writes element-230.jpeg, a
// full run element-0230.jpeg — copied as-is, the new frames sat BESIDE the stale ones and flash.py refused a non-consecutive set.
// Names are normalised to 4 digits here, and the merge refuses unless the full set is still every frame exactly once.
//   node scratchpad/remerge.mjs 230-640
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [a, b] = (process.argv[2] ?? "").split("-").map(Number);
if (!(a >= 0 && b > a)) throw new Error("usage: node scratchpad/remerge.mjs <from>-<to>");
const out = path.join(root, "out"), full = path.join(out, "sweep_frames"), keep = path.join(out, "sweep_frames_full");
const probe = path.join(out, "probe_frames.json"), probeKeep = path.join(out, "probe_frames_keep.json");
if (fs.existsSync(keep) || fs.existsSync(probeKeep)) throw new Error("a previous remerge did not finish (out/sweep_frames_full or probe_frames_keep.json exists) — restore it first; refusing");
fs.renameSync(full, keep);
fs.copyFileSync(probe, probeKeep);
try {
  const log = execFileSync(process.execPath, [path.join(root, "scratchpad", "sweep.mjs"), "1", `--range=${a}-${b}`, "--keep", "--concurrency=2"], { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 });
  console.log(log.split("\n").filter((l) => l && !/^OVERLAP|^HANDOVER/.test(l)).join("\n"));
  let n = 0;
  for (const f of fs.readdirSync(full)) {
    const m = f.match(/^element-(\d+)\.jpeg$/);
    if (!m) continue;
    fs.copyFileSync(path.join(full, f), path.join(keep, `element-${String(Number(m[1])).padStart(4, "0")}.jpeg`));
    n++;
  }
  if (n !== b - a + 1) throw new Error(`the range wrote ${n} frames, not ${b - a + 1}`);
  const all = new Map(JSON.parse(fs.readFileSync(probeKeep, "utf8")));
  for (const [k, v] of JSON.parse(fs.readFileSync(probe, "utf8"))) all.set(k, v);
  fs.writeFileSync(probe, JSON.stringify([...all]));
  fs.rmSync(full, { recursive: true, force: true });
  fs.renameSync(keep, full);
  fs.rmSync(probeKeep);
  const names = fs.readdirSync(full).filter((f) => /^element-\d{4}\.jpeg$/.test(f));
  const extra = fs.readdirSync(full).filter((f) => !/^element-\d{4}\.jpeg$/.test(f));
  console.log(`merged frames ${a}–${b}: ${names.length} frames in the set, ${all.size} probe frames${extra.length ? `; ⚠ odd names: ${extra.slice(0, 5)}` : ""}`);
} catch (e) {
  // put the full set back as it was
  if (fs.existsSync(keep)) { fs.rmSync(full, { recursive: true, force: true }); fs.renameSync(keep, full); }
  if (fs.existsSync(probeKeep)) { fs.copyFileSync(probeKeep, probe); fs.rmSync(probeKeep); }
  throw e;
}
