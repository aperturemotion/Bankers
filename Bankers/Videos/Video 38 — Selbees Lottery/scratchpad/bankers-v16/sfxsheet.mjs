// THE SCORE AS THE RENDER PLAYS IT — every SFX cue on one sheet, against the words and the places, with the checks that
// decide whether a sound is TIMED (Timur, 2026-10-01: "ensure that the sfx are timed right, especially in the hook scene").
//   node scratchpad/sfxsheet.mjs            the sheet + the checks (exit 1 on a failure)
//   node scratchpad/sfxsheet.mjs --from=0 --to=300     one stretch only
// It bundles the composition's own Video.tsx (SFX_SHEET, JOURNEY) the way stylecheck.mjs does, so it can never read a stale
// copy of the cue list. Each file's audible shape is MEASURED (scratchpad sfxshape.py, 2026-10-01: frames from the file's
// start at 30 fps) — a sound is heard where its PEAK is, not where its file begins.
//
// Checks (each proves itself on a canary before it reports — a check that cannot fire would report CLEAN forever):
//   PILE    two hits (non-move sounds) peaking within 3 f of each other, or a hit within 4 f of a camera move's whoosh peak:
//           the second is masked, and a landing read as a smear
//   OFFSTAGE a cue heard before its place's construction is on screen (from t0 − 10) or after it has left
//   SILENT  a place with no context sound at all (only its move's whoosh)
//   KIND    a family the account has never used (Bankers V1–V2 and the Style 3 films only — Timur, 2026-10-01), or one the
//           style bans (riser, glide: STYLE §11.2)
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const video = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mod = path.join(video, "src", "pe");
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? Number(a.split("=")[1]) : d; };
const FROM = arg("from", -Infinity), TO = arg("to", Infinity);

// measured: frames from the file's first sample to its peak. ★ 2026-10-23: re-measured for Timur's Epidemic Sound cuts
// (Resources/sfx-epidemic/mkpack.sh) — airwoosh, whooshlong, whooshsoft, swoosh, lowwoosh, sub, flick, coin, click, tick, data*, ping*, and the
// new clock, type, flash
const PEAK = { airwoosh: 22, bloom: 3, chain: 0, chainshort: 4, click: 1, coin: 2, data: 1, datamid: 1, datashort: 1, ding: 0, flick: 9,
  glide: 12, lowwoosh: 22, ping: 1, pingshort: 1, pop: 0, riser: 17, sub: 7, swoosh: 20, thud: 0, tick: 2, whoosh: 1, whooshlong: 18, whooshsoft: 9,
  escalator: 0, clock: 2, type: 1, flash: 4 };
const MOVE = new Set(["swoosh", "whooshlong", "airwoosh", "lowwoosh", "whooshsoft"]);
const PROC = new Set(["data", "datamid", "datashort", "chain", "chainshort", "escalator", "clock", "type"]);
// the families the account may use: those cued in Bankers Videos 1–2 or in a the Style 3 films film (grep of their CUES)
const USED = new Set(["swoosh", "whooshlong", "airwoosh", "lowwoosh", "whooshsoft", "data", "datamid", "datashort", "chain", "chainshort",
  "sub", "ping", "pingshort", "coin", "click", "flick", "tick", "thud", "ding", "bloom",
  // ★ Timur's Epidemic Sound set (Bankers STYLE §16, 2026-10-23: "from now on, use these sound effects in the videos"): its three new families
  "clock", "type", "flash",
  // ★ Timur asked for it by name (Video 12, 2026-10-18: "straight up an escalator sound, some sort of machine whirring"): the one sound
  // made for its job (scratchpad/mkescalator.py), allowed only because he asked
  "escalator"]);
const BANNED = new Set(["riser", "glide"]);

// ── bundle the composition (as stylecheck.mjs does) ──
const req = createRequire(path.join(video, "package.json"));
const esbuild = req("esbuild");
const stub = { name: "stub", setup(b) {
  b.onResolve({ filter: /^@remotion\/(google-fonts|fonts)/ }, (a) => ({ path: a.path, namespace: "stub" }));
  b.onResolve({ filter: /(^|\/)Probe$/ }, (a) => ({ path: a.path, namespace: "stub" }));
  b.onLoad({ filter: /.*/, namespace: "stub" }, (a) => ({ contents: /Probe$/.test(a.path) ? `export const Probe = () => null;` : `export const loadFont = () => ({ fontFamily: "stub", waitUntilDone: () => Promise.resolve() });`, loader: "js" }));
} };
const r = await esbuild.build({
  stdin: { contents: `export { SFX_SHEET, JOURNEY } from "./Video"; export { CHIPS } from "./captions";`, resolveDir: mod, loader: "ts" },
  bundle: true, platform: "node", format: "cjs", write: false, jsx: "automatic", logLevel: "silent",
  external: ["react", "react/*", "react-dom", "remotion", "remotion/*", "@remotion/*"],
  loader: { ".svg": "text", ".png": "dataurl", ".jpg": "dataurl", ".json": "json" }, plugins: [stub],
});
const tmp = path.join(video, "scratchpad", `.sfxsheet_${process.pid}.cjs`);
fs.writeFileSync(tmp, r.outputFiles[0].text);
let M; try { M = createRequire(tmp)(tmp); } finally { fs.rmSync(tmp, { force: true }); }
const { SFX_SHEET, JOURNEY, CHIPS } = M;
if (!SFX_SHEET?.CUES?.length || !JOURNEY?.PLACES?.length) { console.log("✗ REFUSED — no SFX_SHEET / JOURNEY in Video.tsx"); process.exit(1); }
const { PLACES, DUR_OF } = JOURNEY;

const words = CHIPS.flatMap((c) => (c.parts ?? [{ word: c.word, at: c.at }]));
const wordAt = (f) => { let w = null; for (const x of words) if (x.at <= f) w = x; return w && f - w.at < 30 ? `"${w.word}"${f - w.at ? ` +${f - w.at}` : ""}` : "—"; };
const placeAt = (f) => { let p = PLACES[0]; for (const q of PLACES) if (q.t0 <= f) p = q; return p.id; };
const fmt = (f) => `${String(Math.round(f)).padStart(4)} ${(f / 30).toFixed(2).padStart(5)}s`;

const CAM = new Set(SFX_SHEET.CAM ?? []);
// the camera moves under a lens bloom (Video.tsx FLARE): whooshsync judges their whoosh against the light, not the white picture
const LIGHT = new Set(SFX_SHEET.LIGHT ?? []);
if (!CAM.size) { console.log("✗ REFUSED — SFX_SHEET.CAM (the camera's whooshes) is missing"); process.exit(1); }
const cues = SFX_SHEET.CUES.map((c) => ({ ...c, cam: CAM.has(c), light: LIGHT.has(c), peak: c.at + Math.min(PEAK[c.s] ?? 0, (c.dur ?? 99) - 1), end: c.at + (c.dur ?? 0),
  kind: MOVE.has(c.s) ? "move" : PROC.has(c.s) ? "proc" : "hit" })).sort((a, b) => a.peak - b.peak);

// ── the checks, as functions, so each can be proven on a canary first ──
// a whoosh masks a TONAL or bright landing (a ping, a click, a chime); it does not mask the sub (52 Hz, all body — the house
// gesture is a whoosh with a sub under it) or a 1-frame paper/tick/coin transient, which cuts through air
const MASKED = new Set(["pingshort", "ping", "ding", "bloom", "thud", "click"]);
const pile = (list) => {
  const out = [];
  const hits = list.filter((c) => c.kind === "hit"), moves = list.filter((c) => c.kind === "move");
  // two DIFFERENT hits on one moment smear; the same family in a run (a riffle, ticks along a wave) is one gesture
  for (let i = 0; i < hits.length; i++) for (let j = i + 1; j < hits.length; j++)
    if (hits[i].s !== hits[j].s && Math.abs(hits[i].peak - hits[j].peak) <= 3) out.push(`${hits[i].s}@${hits[i].peak} and ${hits[j].s}@${hits[j].peak} peak ${Math.abs(hits[i].peak - hits[j].peak)} f apart`);
  for (const h of hits) for (const m of moves)
    if (MASKED.has(h.s) && Math.abs(h.peak - m.peak) <= 4) out.push(`${h.s}@${h.peak} lands ${Math.abs(h.peak - m.peak)} f from the ${m.s} peak @${m.peak} (masked)`);
  return out;
};
const PLACE_WIN = PLACES.map((p, i) => {
  const next = PLACES[i + 1 + (p.keepMid ?? 0)];
  return { id: p.id, from: i === 0 ? 0 : p.t0 - 10, to: next ? (next.kind ? next.t0 + DUR_OF(next) + 4 : Infinity) : Infinity };
});
const offstage = (list) => list.filter((c) => c.kind !== "move").flatMap((c) => {
  const id = placeAt(c.peak), w = PLACE_WIN.find((x) => x.id === id);
  // a place with no MID of its own (a travel) is the construction it travels across: judge it on the owner's window
  const owner = [...PLACE_WIN].reverse().find((x) => x.from <= c.peak && c.peak < x.to);
  return owner ? [] : [`${c.s}@${c.peak} — nothing of ${id} on screen (${w?.from}–${w?.to})`];
});
const silent = (list) => PLACES.filter((p, i) => {
  const a = p.t0, b = PLACES[i + 1]?.t0 ?? Infinity;
  return !list.some((c) => c.kind !== "move" && c.peak >= a && c.peak < b);
}).map((p) => p.id);
const kinds = (list) => list.flatMap((c) => (BANNED.has(c.s) ? [`${c.s}@${c.at} is banned (STYLE §11.2)`] : !USED.has(c.s) ? [`${c.s}@${c.at} has never been used by Bankers or the Style 3 films`] : []));

// canaries: each check must FIRE on a planted fault and stay quiet on its clean twin
const can = (s, peak, kind) => ({ s, peak, at: peak, kind, end: peak + 10 });
const proofs = [
  ["PILE fires", pile([can("sub", 100, "hit"), can("pingshort", 102, "hit")]).length === 1],
  ["PILE fires on a move", pile([can("pingshort", 100, "hit"), can("swoosh", 103, "move")]).length === 1],
  ["PILE quiet", pile([can("sub", 100, "hit"), can("pingshort", 106, "hit"), can("swoosh", 112, "move"), can("sub", 113, "hit"), can("flick", 120, "hit"), can("flick", 122, "hit")]).length === 0],
  ["KIND fires", kinds([can("glide", 10, "hit"), can("pop", 20, "hit")]).length === 2],
  ["KIND quiet", kinds([can("sub", 10, "hit")]).length === 0],
  ["SILENT fires", silent([]).length === PLACES.length],
];
const broken = proofs.filter(([, ok]) => !ok);
if (broken.length) { console.log(`✗ REFUSED — a check failed its canary: ${broken.map(([n]) => n).join(", ")}`); process.exit(1); }

// ── the sheet ──
console.log(`SFX SHEET — ${cues.length} cues (${cues.filter((c) => c.kind === "move").length} moves, ${cues.filter((c) => c.kind === "hit").length} hits, ${cues.filter((c) => c.kind === "proc").length} process)`);
console.log(`  heard-peak   file        kind  span (heard)        vol   place     word`);
let lastPlace = "";
for (const c of cues) {
  if (c.peak < FROM || c.peak > TO) continue;
  const pl = placeAt(c.peak);
  if (pl !== lastPlace) { console.log(`  ── ${pl} (t0 ${PLACES.find((p) => p.id === pl).t0})`); lastPlace = pl; }
  console.log(`  ${fmt(c.peak)}  ${c.s.padEnd(11)} ${c.kind.padEnd(5)} ${String(c.at).padStart(4)}–${String(c.end).padEnd(5)} (${String(c.end - c.at).padStart(3)} f)  ${(c.vol ?? 1).toFixed(2)}  ${pl.padEnd(9)} ${wordAt(c.peak)}`);
}
// --json: the cues as heard, for sfxmotion.py (the sound drawn against the picture's own motion)
const jsonOut = process.argv.find((x) => x.startsWith("--json"));
if (jsonOut) fs.writeFileSync(path.join(video, "out", "sfx_cues.json"), JSON.stringify(cues.map(({ s, at, end, peak, kind, vol, cam, light }) => ({ s, at, end, peak, kind, vol: vol ?? 1, cam, light })), null, 1));
const P = pile(cues), O = offstage(cues), S = silent(cues), K = kinds(cues);
console.log("");
const rep = (name, list) => console.log(list.length ? `✗ ${name} (${list.length})\n${list.map((x) => `    ${x}`).join("\n")}` : `✓ ${name} clean`);
rep("PILE", P); rep("OFFSTAGE", O); rep("KIND", K);
console.log(S.length ? `• SILENT places (no context sound): ${S.join(", ")}` : "✓ every place has a context sound");
// the gaps: the longest stretches with no context sound (only the moves' whooshes)
const ctx = cues.filter((c) => c.kind !== "move").map((c) => c.peak).sort((a, b) => a - b);
const gaps = ctx.slice(1).map((x, i) => [ctx[i], x, x - ctx[i]]).sort((a, b) => b[2] - a[2]).slice(0, 5);
console.log(`• longest stretches without a context sound: ${gaps.map(([a, b, g]) => `${a}–${b} (${(g / 30).toFixed(1)} s)`).join(", ")}`);
process.exit(P.length || O.length || K.length ? 1 : 0);
