// THE RENDER GUARD for Bankers Video 4 (cloned from Video 3, ported from Style 3 Video 26) — refuses the MP4 while the wired take says something the verified
// record contradicts and nobody has accepted it (CLAUDE.md: "when the take and the verified record
// disagree, the screen follows the voice — and the render blocks").
//   node scratchpad/guard.mjs          → prints the state, exit 1 if blocked or broken
// Used by render.mjs (before bundling) and by guardtest.mjs (four directions + sabotage).
//
// ★ FAILS CLOSED, and PROVES ITSELF ON EVERY RUN:
//   · the list is read with JSON.parse, never a regex over source (012's quoting trap);
//   · every pattern must match its own `spoken` example — the TAKE's spelling, not the brief's
//     (015/016: a pattern that only matches the written form can never fire on a recording);
//   · every pattern must NOT match its own `corrected` line (or it would block the fix too);
//   · a file that declares patterns but parses to none is a refusal, not a pass.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
export const DIV_FILE = path.join(root, "src/pe/divergences.json");

/** lowercase, straight quotes, single spaces — the form every pattern is written against */
export const norm = (s) => String(s).toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();

/** the wired take, as the viewer hears it: every caption sentence, in order */
export const loadTranscript = () => {
  const cap = fs.readFileSync(path.join(root, "src/pe/captions.ts"), "utf8");
  const m = cap.match(/export const SENTENCES[^=]*= (\[.*\]);/);
  if (!m) throw new Error("guard: SENTENCES not found in captions.ts — refusing");
  const sen = JSON.parse(m[1]);
  if (!sen.length) throw new Error("guard: the transcript parsed to zero sentences — refusing");
  return sen.map((s) => s.text).join(" ");
};

export const runGuard = (transcript, file = DIV_FILE) => {
  const raw = fs.readFileSync(file, "utf8");
  const doc = JSON.parse(raw);
  const list = Array.isArray(doc.divergences) ? doc.divergences : [];
  const broken = [];
  const declared = (raw.match(/"pattern"\s*:/g) ?? []).length;
  if (declared !== list.length) broken.push(`${declared} patterns declared, ${list.length} parsed`);
  const t = norm(transcript);
  const active = [], cleared = [];
  for (const d of list) {
    let re;
    try { re = new RegExp(d.pattern, "i"); } catch (e) { broken.push(`${d.id}: pattern does not compile (${e.message})`); continue; }
    if (!d.spoken) broken.push(`${d.id}: no spoken example — a pattern must prove it fires on the TAKE's spelling`);
    else if (!re.test(norm(d.spoken))) broken.push(`${d.id}: pattern /${d.pattern}/ does not match its own spoken example`);
    if (!d.corrected) broken.push(`${d.id}: no corrected line — cannot prove the pattern spares the fix`);
    else if (re.test(norm(d.corrected))) broken.push(`${d.id}: pattern /${d.pattern}/ ALSO matches its corrected line`);
    (re.test(t) ? active : cleared).push(d);
  }
  const blocking = active.filter((d) => d.accepted !== true);
  return { broken, active, cleared, blocking, total: list.length };
};

export const report = (g) => {
  const lines = [];
  if (g.broken.length) lines.push(`✗ THE GUARD IS BROKEN — refusing (${g.broken.length}):`, ...g.broken.map((b) => "   · " + b));
  lines.push(`${g.total} divergences: ${g.active.length} active in this take, ${g.cleared.length} cleared by it, ${g.blocking.length} blocking`);
  for (const d of g.blocking) lines.push(`   ✗ [${d.severity}] ${d.id} — "${d.spoken}"`);
  for (const d of g.active.filter((x) => x.accepted === true)) lines.push(`   ✓ accepted: ${d.id}`);
  return lines.join("\n");
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const g = runGuard(loadTranscript());
  console.log(report(g));
  const ok = !g.broken.length && !g.blocking.length;
  console.log(ok ? "✓ guard: the master may render" : "✗ guard: the master is BLOCKED");
  process.exit(ok ? 0 : 1);
}
