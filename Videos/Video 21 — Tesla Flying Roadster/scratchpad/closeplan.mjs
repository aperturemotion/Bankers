// THE CLOSE-UP PLAN, DERIVED (Video 9, 2026-10-12). closeups.py carried Video 7's hand-typed object list through two clones: a
// close-up pass would have cropped frames of a film that no longer exists. This reads the sweep's own measurements
// (out/probe_frames.json, from `sweep.mjs 1 --keep`) and, for every place's MID, picks a frame where it is ALONE on screen and
// fully settled (the last stretch before the next place arrives), with a crop box around its items. Writes out/closeplan.json,
// which closeups.py reads. Refuses if any place yields no solo frame.
//   node scratchpad/closeplan.mjs
import fs from "node:fs";

const fr = new Map(JSON.parse(fs.readFileSync("out/probe_frames.json", "utf8")));
const placeOf = (g) => (g === "hero" ? "question" : g.includes(":") ? g.split(":")[0] : null);
const frames = [...fr.keys()].sort((a, b) => a - b);
const solo = new Map();   // place → [frames where it alone is on screen]
for (const f of frames) {
  const on = new Set(fr.get(f).filter((it) => it.o >= 0.05).map((it) => placeOf(it.g)).filter(Boolean));
  if (on.size === 1) { const p = [...on][0]; if (!solo.has(p)) solo.set(p, []); solo.get(p).push(f); }
}
const plan = {};
for (const [p, fs_] of solo) {
  // the LAST contiguous run (the place at rest before it hands over), 8 f before its end
  let end = fs_.length - 1, start = end;
  while (start > 0 && fs_[start - 1] === fs_[start] - 1) start--;
  const at = fs_[Math.max(start, end - 8)];
  const its = fr.get(at).filter((it) => placeOf(it.g) === p && it.o >= 0.05 && it.r[2] < 1060 && it.r[3] < 1900);
  if (!its.length) continue;
  const x0 = Math.max(0, Math.min(...its.map((i) => i.r[0])) - 40), y0 = Math.max(0, Math.min(...its.map((i) => i.r[1])) - 40);
  const x1 = Math.min(1080, Math.max(...its.map((i) => i.r[0] + i.r[2])) + 40), y1 = Math.min(1920, Math.max(...its.map((i) => i.r[1] + i.r[3])) + 40);
  plan[p] = { frame: at, run: [fs_[start], fs_[end]], box: [x0, y0, x1, y1].map(Math.round) };
}
const missing = [...new Set(frames.flatMap((f) => fr.get(f).map((it) => placeOf(it.g)).filter(Boolean)))].filter((p) => !plan[p]);
if (missing.length) console.warn(`no solo frame for: ${missing.join(", ")} (shown only alongside another place)`);
fs.writeFileSync("out/closeplan.json", JSON.stringify(plan, null, 1));
for (const [p, v] of Object.entries(plan)) console.log(p.padEnd(9), "f" + v.frame, "run", v.run.join("–"), "box", v.box.join(" "));
