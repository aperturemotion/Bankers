// Launch the Remotion Studio for VIDEO 37 on port 3058 (V28: 3028 · Vision Media: 3000-3009).
// Anchored to this file's own location so it works from any cwd (the launch.json runs it from
// the project root). ⚠ Node 24 refuses .cmd shims — the CLI JS is invoked via process.execPath.
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
// ⚠ dist/index.js is the LIBRARY (bare exports — running it does nothing, silently, exit 0);
// the executable entry is remotion-cli.js. This cost a debugging loop on 2026-09-07.
const cli = path.join(root, "node_modules", "@remotion", "cli", "remotion-cli.js");
const child = spawn(process.execPath, [cli, "studio", "src/index.ts", "--port", "3058"], {
  cwd: root,
  stdio: ["ignore", "inherit", "inherit"],
});
child.on("exit", (c) => process.exit(c ?? 0));
