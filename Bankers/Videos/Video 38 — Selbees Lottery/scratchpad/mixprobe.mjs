import * as __fs46 from "node:fs";
// Render audio-only probes of the film, one STEM at a time, and measure them where the viewer
// hears them — in the render (CLAUDE.md: the pan law hits only the mono stems, so separation is
// set from RENDERED stems, never from source levels).
//   node scratchpad/mixprobe.mjs vo music sfx full      (any subset; bundles once)
// Writes out/mix_<stem>.mp3 and prints mean/peak overall and in 10 s windows.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { spawnSync } from "child_process";
import path from "path";

const FF = (process.env.FFMPEG_BIN ?? "C:/Users/Timur/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin");
const stems = process.argv.slice(2).length ? process.argv.slice(2) : ["full"];
const PORT = Number(process.env.PORT ?? 3862);   // ⚠ pinned: the renderer's auto-picked port collides with a running Studio (PORT=… beside a sweep)

/** ffmpeg volumedetect on a file, optionally a window [ss, ss + t) */
const level = (file, ss, t) => {
  const args = ["-hide_banner", "-nostats"];
  if (ss !== undefined) args.push("-ss", String(ss), "-t", String(t));
  args.push("-i", file, "-af", "volumedetect", "-f", "null", "-");
  const err = spawnSync(FF + "/ffmpeg.exe", args, { encoding: "utf8" }).stderr;
  const m = (k) => Number((err.match(new RegExp(`${k}: (-?[\\d.]+) dB`)) ?? [])[1]);
  return { mean: m("mean_volume"), max: m("max_volume") };
};

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });

// ★ V46: delete this run's webpack bundle on exit (every run left ~69 MB in /tmp and filled the disk)

process.on("exit", () => { try { __fs46.rmSync(serveUrl, { recursive: true, force: true }); } catch {} });
for (const stem of stems) {
  const inputProps = stem === "full" ? {} : { solo: stem };
  const comp = await selectComposition({ serveUrl, id: "TheranosBloodTest", port: PORT, inputProps });
  const out = `out/mix_${stem}.mp3`;
  // ★ V46: concurrency from CONC (default 4). (The 'Page crashed!' at 2+ tabs was the FULL DISK — Chrome's compositor traps when it cannot write; free space first.)
  await renderMedia({ serveUrl, composition: comp, codec: "mp3", outputLocation: out, port: PORT, inputProps, concurrency: Number(process.env.CONC ?? 4) });
  const dur = comp.durationInFrames / comp.fps;
  const all = level(out);
  const wins = [];
  for (let s = 0; s < dur; s += 10) wins.push(`${String(s).padStart(3)}s ${level(out, s, Math.min(10, dur - s)).mean.toFixed(1)}`);
  console.log(`${stem.padEnd(5)} ${out}: mean ${all.mean.toFixed(1)} dB · peak ${all.max.toFixed(1)} dB`);
  console.log(`      windows: ${wins.join(" | ")}`);
}
