import * as __fs46 from "node:fs";
// Renders "It Took Intel 26 Years to Beat Its Record" (STYLE 3 · Video 46) → out/lottery_tear.mp4.
//   node scratchpad/render.mjs [concurrency]
//
// ⚠⚠ CONCURRENCY IS CAPPED, AND THE OUTPUT IS VERIFIED HERE.
// The 2026-08-28 first attempt died at 86% and STILL EXITED 0, leaving an 8.5 MB file with no
// moov atom — an unplayable stub that looks like a successful render to anything that only checks
// the exit code. Cause: Remotion defaults concurrency to the core count and spawns a headless
// Chrome per worker; with the Studio also up, the box had 2.6 GB free and the workers were killed
// mid-write. Two guards, so this can never be mistaken for success again:
//   1. concurrency is capped (default 2) — slower, but it fits in memory;
//   2. the finished file is probed for a real duration before this script reports success, and a
//      short or unreadable file throws.
//   3. ★ THE DIVERGENCE GUARD runs FIRST (scratchpad/guard.mjs): while the wired take says a line
//      the verified record contradicts and nobody has accepted it, NOTHING is bundled.
//      `node scratchpad/render.mjs --check` runs the guard alone and exits — the way to make it
//      fire without producing an MP4.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { runGuard, loadTranscript, report } from "./guard.mjs";

// ★ ARGUMENTS FAIL CLOSED (CLAUDE.md, Bankers V10): only --check and one whole-number concurrency 1–8 are understood
{
  const args = process.argv.slice(2);
  const bad = args.filter((a) => a !== "--check" && !/^[1-8]$/.test(a));
  if (bad.length || args.filter((a) => /^\d+$/.test(a)).length > 1) {
    console.error(`✗ REFUSED: unknown argument(s) ${JSON.stringify(bad)} — usage: node scratchpad/render.mjs [--check] [1-8]`);
    process.exit(2);
  }
}

{
  const g = runGuard(loadTranscript());
  console.log(report(g));
  if (g.broken.length || g.blocking.length) {
    console.error("✗ REFUSED: the master is blocked by src/bnx/divergences.json — re-record the lines, or mark each accepted: true with an acceptedNote, on the user's word.");
    process.exit(1);
  }
  if (process.argv.includes("--check")) { console.log("✓ --check: the guard passes"); process.exit(0); }
}

const CONCURRENCY = Number(process.argv.find((a) => /^\d+$/.test(a)) ?? 2);
const FFPROBE = (process.env.FFPROBE ?? "C:/Users/Timur/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffprobe.exe");
const outputLocation = "out/lottery_tear.mp4";

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });

// ★ V46: delete this run's webpack bundle on exit (every run left ~69 MB in /tmp and filled the disk)

process.on("exit", () => { try { __fs46.rmSync(serveUrl, { recursive: true, force: true }); } catch {} });
const PORT = Number(process.env.PORT ?? 3866);   // V35 recovery: PORT=… overrides (cloud runs use 5791+)   // ⚠ pinned: an auto-picked port can land on a running Studio (Vision Media holds 3000–3009)
const composition = await selectComposition({ serveUrl, id: "LotteryTear", port: PORT });
const expected = composition.durationInFrames / composition.fps;
console.log(`rendering ${composition.durationInFrames}f (${expected.toFixed(1)}s) at concurrency ${CONCURRENCY}`);

let last = -1;
await renderMedia({
  serveUrl, composition, codec: "h264", outputLocation, concurrency: CONCURRENCY, port: PORT,
  onProgress: ({ progress }) => {
    const p = Math.round(progress * 100);
    if (p !== last) { last = p; process.stdout.write(`\r${p}%   `); }
  },
});

// ── verify the artefact, not the exit code ──
if (!fs.existsSync(outputLocation)) throw new Error("render reported success but wrote no file");
const dur = Number(execFileSync(FFPROBE, [
  "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", outputLocation,
]).toString().trim());
if (!Number.isFinite(dur)) throw new Error("output has no readable duration — truncated (no moov atom?)");
if (Math.abs(dur - expected) > 0.5) {
  throw new Error(`output is ${dur.toFixed(1)}s but the composition is ${expected.toFixed(1)}s — truncated`);
}
const mb = fs.statSync(outputLocation).size / 1048576;
console.log(`\n✓ ${outputLocation} — ${dur.toFixed(1)}s, ${mb.toFixed(1)} MB, verified against the composition`);
