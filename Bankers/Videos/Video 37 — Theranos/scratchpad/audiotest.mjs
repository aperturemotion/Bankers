// V45 — does the published Studio SOUND? (user, 2026-10-31: "I cannot hear anything. No sound effects, no voiceover whatsoever")
// Serves out/studio under a STRICT media policy like the artifact frame's (media-src data: blob: only), loads it inside a sandboxed
// iframe (no allow-same-origin: a null origin, as claude.ai hosts it), starts playback, and reports every <audio> element: its source
// kind, whether it plays, and whether its time advances. A CANARY page with a plain file src must FAIL under the same policy, or the
// test cannot tell the two apart.
//   node scratchpad/audiotest.mjs [port=4699]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const PORT = Number(process.argv[2] ?? 4699);
const ROOT = path.resolve("out/studio");
const CSP = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: http://127.0.0.1:" + PORT + "; media-src data: blob:; img-src data: blob:; style-src * 'unsafe-inline'; font-src * data:; connect-src *";
const types = { ".html": "text/html", ".js": "text/javascript", ".wasm": "application/wasm", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".wav": "audio/wav", ".mp3": "audio/mpeg" };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split("?")[0]);
  if (u === "/host") { res.writeHead(200, { "content-type": "text/html" }); res.end(`<iframe id=f sandbox="allow-scripts allow-same-origin allow-popups" src="http://127.0.0.1:${PORT}/index.html" style="width:1400px;height:900px"></iframe>`); return; }
  if (u === "/canary") { res.writeHead(200, { "content-type": "text/html", "content-security-policy": CSP }); res.end(`<audio id=a src="/canary.wav"></audio><script>const a=document.getElementById('a');a.play().catch(()=>{});</script>`); return; }
  if (u === "/canary.wav") { res.writeHead(200, { "content-type": "audio/wav" }); res.end(fs.readFileSync("public/sfx/swoosh.wav")); return; }
  const p = path.join(ROOT, u === "/" ? "index.html" : u);
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": types[path.extname(p)] ?? "application/octet-stream", "content-security-policy": CSP });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const logs = [];
page.on("console", (m) => logs.push(m.text()));
page.on("pageerror", (e) => logs.push("PAGEERROR " + e.message));

// the canary: a plain file src under the policy must be blocked
await page.goto(`http://127.0.0.1:${PORT}/canary`);
await page.waitForTimeout(1500);
const can = await page.evaluate(() => { const a = document.getElementById("a"); return { err: a.error?.code ?? null, t: a.currentTime, ready: a.readyState }; });
const canaryBlocked = can.err !== null || can.ready === 0;
console.log(`canary (plain file src under the policy): ${canaryBlocked ? "BLOCKED ✓" : "PLAYED ✗ (the policy is not being applied — the test proves nothing)"}`, JSON.stringify(can));

// the Studio in the sandboxed frame
await page.goto(`http://127.0.0.1:${PORT}/host`);
await page.waitForTimeout(25000);
const fr = page.frames().find((f) => f.url().includes("/index.html"));
if (!fr) { console.log("✗ no studio frame"); process.exit(1); }
await fr.evaluate(() => document.body.focus());
await page.mouse.click(700, 450);
await page.keyboard.press("Space");
await page.waitForTimeout(6000);
await page.screenshot({ path: "out/audiotest.png" });
const rep = await fr.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({
  kind: a.src.startsWith("data:") ? "data" : a.src ? a.src.slice(0, 60) : "(none)", paused: a.paused, t: +a.currentTime.toFixed(2), err: a.error?.code ?? null, ready: a.readyState })));
const used = rep.filter((r) => r.kind !== "(none)");
// the photos (bills, moon): every <img> in the composition must have loaded under the same policy
const imgs = await fr.evaluate(() => [...document.querySelectorAll("img")].filter((i) => i.src).map((i) => ({ kind: i.src.startsWith("data:") ? "data" : i.src.slice(0, 50), ok: i.complete && i.naturalWidth > 0 })));
console.log(`images: ${imgs.length}, loaded ${imgs.filter((i) => i.ok).length}; non-data sources: ${imgs.filter((i) => i.kind !== "data").length}`);
const playing = used.filter((r) => !r.paused && r.t > 0.2 && r.err === null);
console.log(`audio elements: ${rep.length} (with a source ${used.length}); playing with time advancing: ${playing.length}`);
for (const r of used.slice(0, 12)) console.log("  ", JSON.stringify(r));
const errs = logs.filter((l) => /media|audio|Content Security|refused|error|fail|PAGEERROR/i.test(l)).slice(0, 10);
if (errs.length) console.log("console:", errs.join("\n  "));
await browser.close(); server.close();
if (!canaryBlocked) process.exit(2);
console.log(playing.length > 0 ? "✓ the Studio plays audio under the artifact frame's media policy" : "✗ NO AUDIO PLAYS");
process.exit(playing.length > 0 ? 0 : 1);
