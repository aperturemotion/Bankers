// BANKERS CLONE of Style 3 Video 26's serve.mjs — the file, port, title and colours changed.
// A tiny video host for the rendered cut, so it can be watched or downloaded through a tunnel.
//   node scratchpad/serve.mjs [port]
//
// ★ It implements HTTP RANGE requests. Without them Safari and iOS will not play a remote <video>
// at all — the player asks for a byte range up front and gives up if the server answers with the
// whole file and a 200. A plain "read the file and pipe it" server appears to work in Chrome and
// silently fails on a Mac, which is exactly where this is going.
import http from "http";
import fs from "fs";
import path from "path";

const PORT = Number(process.argv[2] ?? 4416);   // Bankers serve band: 4400 + N (the demo is 4400; Video 16 → 4416)
// Video 10's render (written by scratchpad/render.mjs; verified there before serving). `node scratchpad/serve.mjs 4410
// out/<file>.mp4` serves another cut — the REVIEW copy while the guard blocks the master.
const FILE = path.resolve(process.argv[3] ?? "out/private_equity_backlog.mp4");
const NAME = path.basename(FILE);

const page = (size) => `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bankers — Video 16, 33,575 Companies Private Equity Hasn't Sold</title>
<style>
  html,body{margin:0;height:100%;background:#001C3C;color:#e8e8ea;
    font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px}
  video{max-height:82vh;max-width:94vw;border-radius:14px;background:#000;box-shadow:0 8px 40px rgba(0,0,0,.6)}
  a{color:#B3CEEF;text-decoration:none;border:1px solid #4D8ED955;padding:8px 16px;border-radius:999px}
  a:hover{background:#4D8ED918}
  .m{opacity:.55;font-size:13px}
</style>
<video src="/video" controls playsinline preload="metadata"></video>
<a href="/video?dl=1" download="${NAME}">Download ${NAME}</a>
<div class="m">1080×1920 · 30fps · ${(size / 1048576).toFixed(1)} MB</div>`;

http.createServer((req, res) => {
  let stat;
  try { stat = fs.statSync(FILE); } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    return res.end("render not found — run scratchpad/render.mjs first");
  }
  const url = new URL(req.url, "http://x");
  if (url.pathname !== "/video") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    return res.end(page(stat.size));
  }

  const head = {
    "content-type": "video/mp4",
    "accept-ranges": "bytes",
    "cache-control": "no-store",
  };
  if (url.searchParams.get("dl")) head["content-disposition"] = `attachment; filename="${NAME}"`;

  const range = req.headers.range;
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    const start = m && m[1] ? Number(m[1]) : 0;
    const end = m && m[2] ? Number(m[2]) : stat.size - 1;
    if (start >= stat.size || end >= stat.size || start > end) {
      res.writeHead(416, { "content-range": `bytes */${stat.size}` });
      return res.end();
    }
    res.writeHead(206, {
      ...head,
      "content-range": `bytes ${start}-${end}/${stat.size}`,
      "content-length": end - start + 1,
    });
    return fs.createReadStream(FILE, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...head, "content-length": stat.size });
  fs.createReadStream(FILE).pipe(res);
}).listen(PORT, () => console.log(`serving ${NAME} on http://localhost:${PORT}`));
