// PROVE THE RENDER GUARD IS LOAD-BEARING (CLAUDE.md, OffCamCelebs 013/015/016/018):
//   node scratchpad/guardtest.mjs
// Bankers Video 1's guard is ARMED BEFORE THE TAKE (ported from Style 3 Video 26), so the directions are:
//   1. the WIRED captions: synthetic (the corrected script) must PASS; once a real take is wired
//      (fw_words.json present) the result is REPORTED — refused if it was read from the brief
//   2. the brief's SPOKEN lines (the take's spelling: digits), as one take, must be REFUSED — all
//   3. the same lines in WHISPER'S FORM ("$240" → "240 dollars", 018) must be REFUSED — all
//   4. the CORRECTED lines must PASS with zero hits, and so must the whole VO_SCRIPT.txt script
//      (the patterns are not simply matching everything)
//   5. SABOTAGE: one pattern deliberately broken must make the guard refuse ITSELF
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { runGuard, loadTranscript, DIV_FILE } from "./guard.mjs";
import { SCRIPT_TEXT, CHANGES } from "./script.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const live = JSON.parse(fs.readFileSync(DIV_FILE, "utf8"));
let ok = true;
// ★ (Video 15 and any film whose script corrects NO line of the brief, so the live list is empty and every direction below would pass vacuously —
// a check whose failure mode is "pass" must be made to fire.) With an empty list the directions run on a PLANTED entry instead, written
// to a temp file: it must be found in a take that says it, missed by the script, and its sabotage must make the guard refuse itself.
const PLANT = live.divergences.length ? null : { id: "planted-canary", severity: "high", accepted: false, pattern: /\bspacex is a rocket company that sells phones\b/.source,
  spoken: "SpaceX is a rocket company that sells phones.", brief: "(planted)", corrected: "SpaceX is a rocket company.", verified: "(planted)" };
const doc = PLANT ? { ...live, divergences: [PLANT] } : live;
const plantFile = PLANT ? path.join(os.tmpdir(), `bankers_v15_div_planted_${process.pid}.json`) : null;
if (plantFile) fs.writeFileSync(plantFile, JSON.stringify(doc, null, 1));
const guard = (text, file) => runGuard(text, file ?? plantFile ?? undefined);
if (PLANT) console.log("• the live list is EMPTY (no correction to arm): the directions run on a planted entry");
const check = (name, pass, detail) => { console.log(`${pass ? "✓" : "✗"} ${name}${detail ? " — " + detail : ""}`); ok = ok && pass; };

// 0 · the JSON \b trap: a backspace inside a pattern matches nothing, silently
check("no control characters in any pattern", doc.divergences.every((d) => !/[\u0000-\u001f]/.test(d.pattern)));
// one entry per script correction (Video 1 hard-coded "≥ 5", its own count — a clone carryover that failed Video 2's two)
check("the list is armed — one entry per script correction", live.divergences.length === CHANGES.length, `${live.divergences.length} entries for ${CHANGES.length} corrections`);

const real = fs.existsSync(path.join(here, "fw_words.json"));
const g1 = runGuard(loadTranscript());
if (!real) check("1 · the wired (SYNTHETIC, corrected) captions PASS", !g1.broken.length && g1.active.length === 0,
  g1.active.map((d) => d.id).join(", ") || "zero hits");
else console.log(`• 1 · the wired REAL take: ${g1.active.length}/${g1.total} active, ${g1.blocking.length} blocking${g1.broken.length ? " — BROKEN" : ""}`);
if (real && g1.broken.length) check("1 · the guard is not broken on the real take", false, g1.broken[0]);

const g2 = guard(doc.divergences.map((d) => d.spoken).join(" "));
check("2 · the brief's spoken lines are REFUSED, every one", g2.active.length === g2.total && !g2.broken.length, `${g2.active.length}/${g2.total} active`);

// whisper writes "3 billion dollars", never "$3 billion" (018) — and "$240" as "240 dollars"
// ★ and "JPMorgan" as "J .P. Morgan" — three tokens (Video 1's real take, 2026-09-26)
const whisper = (s) => s.replace(/\$([\d,.]+)(\s+(?:million|billion|trillion|thousand))?/gi, (_, n, u) => `${n}${u ?? ""} dollars`)
  .replace(/JPMorgan/g, "J .P. Morgan");
const g3 = guard(doc.divergences.map((d) => whisper(d.spoken)).join(" "));
check("3 · the same lines in whisper's form are REFUSED, every one", g3.active.length === g3.total,
  `${g3.active.length}/${g3.total} active` + (g3.active.length < g3.total ? ` — missed: ${doc.divergences.filter((d) => !g3.active.includes(d)).map((d) => d.id).join(", ")}` : ""));

const g4 = guard(doc.divergences.map((d) => d.corrected).join(" "));
check("4a · the corrected lines PASS", g4.active.length === 0, g4.active.map((d) => d.id).join(", ") || "zero hits");
// the corrected script itself (script.mjs is the one source VO_SCRIPT.txt is written from)
const script = SCRIPT_TEXT;
const g4b = guard(script);
check("4b · the corrected SCRIPT (script.mjs → VO_SCRIPT.txt) PASSES", g4b.active.length === 0 && script.split(/\s+/).length > 100,
  g4b.active.map((d) => d.id).join(", ") || `zero hits over ${script.split(/\s+/).length} words`);

// 6 · (Video 26 checked its screen switches here. Video 1 has none: every figure on screen is the VERIFIED value, and
// a take read from the brief is BLOCKED by the guard rather than mirrored on screen.)

const sab = JSON.parse(JSON.stringify(doc));
// break the WHOLE pattern (root CLAUDE.md, Aperture V3): appending to an alternation leaves its other branches working
sab.divergences[0].pattern = `(?:${sab.divergences[0].pattern})zzz`;
const tmp = path.join(os.tmpdir(), `bankers_v2_div_sabotage_${process.pid}.json`);
fs.writeFileSync(tmp, JSON.stringify(sab, null, 1));
const g5 = runGuard(loadTranscript(), tmp);
fs.unlinkSync(tmp);
if (plantFile) fs.unlinkSync(plantFile);
check("5 · SABOTAGE — the guard refuses itself", g5.broken.length > 0, g5.broken[0]);

console.log(ok ? "\nGUARD PROVEN — every direction holds" : "\nGUARD NOT PROVEN");
process.exit(ok ? 0 : 1);
