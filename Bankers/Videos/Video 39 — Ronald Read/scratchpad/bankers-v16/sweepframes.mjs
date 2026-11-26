// Picks the frames for the visual sweep (sweepsheets.py) from the sweep's OWN measurements (out/probe_frames.json),
// never from a copy of the place table: every 4th frame wherever two places share the screen (the handovers, where
// shape-on-shape seams live), every 20th elsewhere, plus any frame listed on the command line.
//   node scratchpad/sweepframes.mjs [extra frames…] > out/sheet_frames.txt
import fs from "node:fs";

const fr = new Map(JSON.parse(fs.readFileSync("out/probe_frames.json", "utf8")));
const placeOf = (g) => (g === "hero" ? "question" : g.includes(":") ? g.split(":")[0] : null);
const pick = new Set(process.argv.slice(2).map(Number).filter(Number.isFinite));
let lastIn = -99, lastOut = -99;
for (const f of [...fr.keys()].sort((a, b) => a - b)) {
  const places = new Set(fr.get(f).filter((it) => it.o >= 0.1).map((it) => placeOf(it.g)).filter(Boolean));
  if (places.size >= 2) { if (f - lastIn >= 4) { pick.add(f); lastIn = f; } }
  else if (f - lastOut >= 20) { pick.add(f); lastOut = f; }
}
if (pick.size < 50) throw new Error(`only ${pick.size} frames picked — is probe_frames.json from a full sweep?`);
console.log([...pick].sort((a, b) => a - b).join("\n"));
