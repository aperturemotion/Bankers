// Renders Bankers Video 21 (composition TeslaFlyingRoadster) to out/tesla_flying_roadster.mp4 — ONLY on Timur's word.
//   node scratchpad/render.mjs [concurrency]
// Rendered ONLY on Timur's word ("render it", 2026-09-26) — root CLAUDE.md's hard rule.
//
// ⚠ Concurrency is capped (default 2) — a Style 3 render once died at 86% and still exited 0 with an
// unplayable stub — and the ARTEFACT is verified here, not the exit code: it must exist, have a
// readable duration matching the composition, and carry one h264 video and one AAC audio stream.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// RPORT pins the renderer's local file server to one port (2026-10-13: a browser connection's source port held 0.0.0.0:3000, and Remotion's port test kept choosing it — "Tried 10 times to find a free port")
const RP = process.env.RPORT ? { port: Number(process.env.RPORT) } : {};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// ★★ ARGUMENTS FAIL CLOSED (2026-10-13, Video 10): `render.mjs --check` — a flag OffCamCelebs' render scripts have and this one did
// not — was read as the concurrency (NaN), passed the guard on a clear take, and STARTED a master render nobody asked for; it died at
// 0% only because NaN broke the render pool. Now: --check runs every guard and exits before bundling; any argument this script does
// not know, or a concurrency that is not a whole number 1–8, refuses before anything is bundled.
const KNOWN = new Set(["--check", "--review", "--preview"]);
const unknown = process.argv.slice(2).filter((a) => a.startsWith("-") && !KNOWN.has(a));
if (unknown.length) { console.error(`✗ unknown argument(s) ${unknown.join(" ")} — refusing (known: ${[...KNOWN].join(" ")})`); process.exit(1); }
const CHECK = process.argv.includes("--check");
const concArg = process.argv.slice(2).find((a) => !a.startsWith("-"));
const CONCURRENCY = concArg === undefined ? 2 : Number(concArg);
if (!Number.isInteger(CONCURRENCY) || CONCURRENCY < 1 || CONCURRENCY > 8) { console.error(`✗ concurrency "${concArg}" is not a whole number 1–8 — refusing`); process.exit(1); }
const FFPROBE = "C:/Users/Timur/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffprobe.exe";
const MASTER = path.join(root, "out", "tesla_flying_roadster.mp4");
// ★ --review (2026-09-26): Timur asked to "render" while the take still says five lines the verified record contradicts.
// A review copy is rendered UNDER ANOTHER NAME, and the master path stays blocked — the guard's error keeps living
// somewhere that stops the deliverable (root CLAUDE.md), while he gets the film to watch.
const REVIEW = process.argv.includes("--review");
let outputLocation = MASTER;

// ★ THE RENDER GUARD, before anything is bundled (root CLAUDE.md: the take and the verified record must agree)
{
  const { runGuard, loadTranscript, report } = await import("./guard.mjs");
  const g = runGuard(loadTranscript());
  console.log(report(g));
  if (g.broken.length) { console.error("✗ the guard is BROKEN — refusing to render anything"); process.exit(1); }
  if (g.blocking.length && !REVIEW) { console.error("✗ the master is BLOCKED by the guard — refusing to render (--review renders a copy that is NOT the master)"); process.exit(1); }
  if (g.blocking.length) {
    outputLocation = path.join(root, "out", "tesla_flying_roadster_REVIEW_not-for-posting.mp4");
    console.log(`⚠ REVIEW COPY — ${g.blocking.length} blocking line(s) in the take; the master stays blocked → ${path.basename(outputLocation)}`);
  }
  const cap = fs.readFileSync(path.join(root, "src", "tsla", "captions.ts"), "utf8");
  if (/export const SYNTHETIC = true/.test(cap) && !process.argv.includes("--preview")) {
    console.error("✗ the film is still timed on the SYNTHETIC take (no VO wired) — refusing a master; pass --preview for a silent preview render");
    process.exit(1);
  }
  if (CHECK) { console.log("✓ --check: every guard ran; nothing bundled, nothing rendered"); process.exit(0); }
}
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });
const composition = await selectComposition({ ...RP,  serveUrl, id: "TeslaFlyingRoadster" });
const expected = composition.durationInFrames / composition.fps;
console.log(`rendering ${composition.durationInFrames}f (${expected.toFixed(1)}s) at concurrency ${CONCURRENCY}`);

let last = -1;
await renderMedia({ ...RP, 
  serveUrl, composition, codec: "h264", outputLocation, concurrency: CONCURRENCY,
  onProgress: ({ progress }) => {
    const p = Math.round(progress * 100);
    if (p !== last && p % 10 === 0) { last = p; console.log(`${p}%`); }
  },
});

// ── verify the artefact, not the exit code ──
if (!fs.existsSync(outputLocation)) throw new Error("render reported success but wrote no file");
const probe = (args) => execFileSync(FFPROBE, ["-v", "error", ...args, outputLocation]).toString().trim();
const dur = Number(probe(["-show_entries", "format=duration", "-of", "csv=p=0"]));
if (!Number.isFinite(dur)) throw new Error("output has no readable duration — truncated (no moov atom?)");
if (Math.abs(dur - expected) > 0.5) throw new Error(`output is ${dur.toFixed(2)}s but the composition is ${expected.toFixed(2)}s`);
const streams = probe(["-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate", "-of", "csv=p=0"]);
if (!/video,.*h264|h264,.*video/.test(streams.replace(/\n/g, " ")) && !streams.includes("h264")) throw new Error(`no h264 video stream: ${streams}`);
if (!streams.includes("aac")) throw new Error(`no AAC audio stream: ${streams}`);
console.log(`✓ ${outputLocation}\n  ${dur.toFixed(2)} s · ${(fs.statSync(outputLocation).size / 1048576).toFixed(1)} MB\n  ${streams.split("\n").join(" | ")}`);
