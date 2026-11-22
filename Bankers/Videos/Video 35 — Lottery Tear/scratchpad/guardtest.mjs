// PROVE THE RENDER GUARD IS LOAD-BEARING (CLAUDE.md, OffCamCelebs 013/015/016/018):
//   node scratchpad/guardtest.mjs
// Video 30's guard is ARMED BEFORE THE TAKE, so the directions are:
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

const here = path.dirname(fileURLToPath(import.meta.url));
const doc = JSON.parse(fs.readFileSync(DIV_FILE, "utf8"));
let ok = true;
const check = (name, pass, detail) => { console.log(`${pass ? "✓" : "✗"} ${name}${detail ? " — " + detail : ""}`); ok = ok && pass; };

// 0 · the JSON \b trap: a backspace inside a pattern matches nothing, silently
check("no control characters in any pattern", doc.divergences.every((d) => !/[\u0000-\u001f]/.test(d.pattern)));
// V31's fact check failed ONE line of the brief (V30's failed ten) — an empty list is the failure this catches
check("the list is armed", doc.divergences.length >= 1, `${doc.divergences.length} entries`);

const real = fs.existsSync(path.join(here, "fw_words.json"));
const g1 = runGuard(loadTranscript());
if (!real) check("1 · the wired (SYNTHETIC, corrected) captions PASS", !g1.broken.length && g1.active.length === 0,
  g1.active.map((d) => d.id).join(", ") || "zero hits");
else console.log(`• 1 · the wired REAL take: ${g1.active.length}/${g1.total} active, ${g1.blocking.length} blocking${g1.broken.length ? " — BROKEN" : ""}`);
if (real && g1.broken.length) check("1 · the guard is not broken on the real take", false, g1.broken[0]);

const g2 = runGuard(doc.divergences.map((d) => d.spoken).join(" "));
check("2 · the brief's spoken lines are REFUSED, every one", g2.active.length === g2.total && !g2.broken.length, `${g2.active.length}/${g2.total} active`);

// whisper writes "3 billion dollars", never "$3 billion" (018) — and "$240" as "240 dollars"
// ★ V27: whisper also SPLITS compounds — the real take wrote "data set", and a pattern written as
// "dataset" matched its own example while missing the recording. Known splits are applied here.
const SPLITS = [[/\bdataset\b/gi, "data set"], [/\bdatabase\b/gi, "data base"]];
const whisper = (s) => SPLITS.reduce((t, [re, to]) => t.replace(re, to),
  s.replace(/\$([\d,.]+)(\s+(?:million|billion|trillion|thousand))?/gi, (_, n, u) => `${n}${u ?? ""} dollars`));
const g3 = runGuard(doc.divergences.map((d) => whisper(d.spoken)).join(" "));
check("3 · the same lines in whisper's form are REFUSED, every one", g3.active.length === g3.total,
  `${g3.active.length}/${g3.total} active` + (g3.active.length < g3.total ? ` — missed: ${doc.divergences.filter((d) => !g3.active.includes(d)).map((d) => d.id).join(", ")}` : ""));

const g4 = runGuard(doc.divergences.map((d) => d.corrected).join(" "));
check("4a · the corrected lines PASS", g4.active.length === 0, g4.active.map((d) => d.id).join(", ") || "zero hits");
const vo = fs.readFileSync(path.join(here, "..", "VO_SCRIPT.txt"), "utf8");
// the script: V29's file put it straight after the header (up to the first rule); V30's sets it BETWEEN
// the first two rules, after a short header. A header of under 120 words means the script is section 1.
// ★ V36: the notes may also start under a ═══ rule ("═══ WHAT CHANGED FROM THE BRIEF, AND WHY ═══")
const secs = vo.split(/^(?:─{10,}|═{3,})/m);
const script = secs.length > 2 && secs[0].trim().split(/\s+/).length < 120
  ? secs[1].trim().split(/\s+/).join(" ")
  : secs[0].split(/\r?\n\r?\n/).slice(1).join(" ");
const g4b = runGuard(script);
check("4b · the corrected SCRIPT (VO_SCRIPT.txt) PASSES", g4b.active.length === 0 && script.split(/\s+/).length > 200,
  g4b.active.map((d) => d.id).join(", ") || `zero hits over ${script.split(/\s+/).length} words`);

// 6 · ONE COPY: every screen switch in data.ts (saysBrief("id")) must name an entry of THIS list —
// a switch naming a missing id throws at render time, and a renamed id would silently orphan it
const dataSrc = fs.readFileSync(path.join(here, "..", "src/bnx/data.ts"), "utf8");
// ★ V34: data.ts names its switch takeSays("id") (the $110B on the gavel follows the voice if the take says 111)
const ids = [...dataSrc.matchAll(/(?:saysBrief|takeSays)\("([\w-]+)"\)/g)].map((m) => m[1]);
if (/takeSays\("deal-111"\)/.test(dataSrc) && !ids.includes("deal-111")) throw new Error("guardtest: the switch parser missed data.ts's takeSays(\"deal-111\")");
const known = new Set(doc.divergences.map((d) => d.id));
// ⚠ V30 has TWO screen switches — "ninety-three" (the ownership bar's % labels stay off) and "forty-nine"
// (the pump sign reads ≈ 4.50). The other 8 entries change a WORD the screen never prints.
// V31: ONE armed line, a word no object prints — so zero switches is right; any switch that exists must be known
check("6 · the screen switches read the guard's own patterns", ids.every((i) => known.has(i)),
  `${ids.length} switches: ${ids.map((i) => (known.has(i) ? i : i + " (MISSING)")).join(", ")}`);

const sab = JSON.parse(JSON.stringify(doc));
// ★ break the WHOLE pattern (CLAUDE.md, Aperture V3): "a|b" + "zzz" only breaks branch b, and V30's first
// entry is an alternation — the old sabotage left it matching, and the guard did NOT refuse itself
sab.divergences[0].pattern = `(?:${sab.divergences[0].pattern})zzz`;
const tmp = path.join(os.tmpdir(), `v30_div_sabotage_${process.pid}.json`);
fs.writeFileSync(tmp, JSON.stringify(sab, null, 1));
const g5 = runGuard(loadTranscript(), tmp);
fs.unlinkSync(tmp);
check("5 · SABOTAGE — the guard refuses itself", g5.broken.length > 0, g5.broken[0]);

console.log(ok ? "\nGUARD PROVEN — every direction holds" : "\nGUARD NOT PROVEN");
process.exit(ok ? 0 : 1);
