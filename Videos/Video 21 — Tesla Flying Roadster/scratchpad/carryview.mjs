// THE CARRIED HAND-OVER, PROJECTED (2026-10-31, Timur on the rev-3 render: "around 12 seconds, a visual from the next scene appears in the
// previous scene … it just abruptly appears in the corner on the right side of the screen"). The ramp (the curl) peeked in at the right
// edge while the board was still leaving, slid back out, then arrived for real on the zoom-out. The sweep's probe saw only a few of the
// curl's polygons, so this projects the curl's own deck line and the car through the REAL camera (JOURNEY.CAM, bundled from Video.tsx)
// for every frame of the carry, and REFUSES if any of the curl is on screen before the zoom-out begins (CARRY.foot), or if the car
// is on screen while the board still is.
//   node scratchpad/carryview.mjs [--table]
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const req = createRequire(import.meta.url);
const esbuild = req("esbuild");
const here = path.dirname(fileURLToPath(import.meta.url));
const stub = { name: "stub", setup(b) {
  b.onResolve({ filter: /^@remotion\/(google-fonts|fonts)/ }, (a) => ({ path: a.path, namespace: "stub" }));
  b.onResolve({ filter: /(^|\/)Probe$/ }, (a) => ({ path: a.path, namespace: "stub" }));
  b.onLoad({ filter: /.*/, namespace: "stub" }, (a) => ({ contents: /Probe$/.test(a.path) ? `export const Probe = () => null;` : `export const loadFont = () => ({ fontFamily: "stub", waitUntilDone: () => Promise.resolve() });`, loader: "js" }));
} };
const r = await esbuild.build({
  stdin: { contents: `export { JOURNEY } from "./Video"; export { PROFILE_RIDE, profileCar } from "./places/profile"; export { lineAt } from "./places/hook"; export { PF_CUES } from "./places/registry"; export { MID } from "./world";`,
    resolveDir: path.join(here, "..", "src", "tsla"), loader: "ts" },
  bundle: true, platform: "node", format: "cjs", write: false, jsx: "automatic", logLevel: "silent",
  external: ["react", "react/*", "react-dom", "remotion", "remotion/*", "@remotion/*"],
  loader: { ".svg": "text", ".png": "dataurl", ".jpg": "dataurl", ".json": "json" }, plugins: [stub] });
const tmpf = path.join(here, `.carryview_${process.pid}.cjs`);
fs.writeFileSync(tmpf, r.outputFiles[0].text);
let M; try { M = createRequire(tmpf)(tmpf); } finally { fs.rmSync(tmpf, { force: true }); }
const { JOURNEY, PROFILE_RIDE, profileCar, lineAt, PF_CUES, MID } = M;
const { CARRY, ST } = JOURNEY;
if (!CARRY || !ST?.whatB) throw new Error("carryview: no CARRY / ST in the journey — refusing");

const st = ST.whatB, PFC = { ...PF_CUES, end: 0 };
const proj = (p, cam) => { const D = MID - (cam.z - st.z); return { x: 540 + ((p.x - 540) - (cam.x - st.x)) / D, y: 960 + ((p.y - 960) - (cam.y - st.y)) / D, D }; };
// the curl: its deck line from the foot to its end (a point every 20 px of arc), with a margin for the rails and the trestle (40 px)
const curl = []; for (let s = PROFILE_RIDE.S_FOOT + 20; s <= PROFILE_RIDE.S_END; s += 20) curl.push(lineAt(PROFILE_RIDE.LINE, s));
const PAD = 40, CAR_HALF = 130;
const rows = [], bad = [], seen = [];
for (let f = CARRY.start - 20; f <= CARRY.end; f++) {
  const cam = JOURNEY.CAM(f);
  const pts = curl.map((p) => proj(p, cam));
  const minX = Math.min(...pts.map((p) => p.x));
  const onScreen = pts.some((p) => p.x > -PAD && p.x < 1080 + PAD && p.y > -PAD && p.y < 1920 + PAD);
  const car = proj(profileCar(PFC, f), cam);
  const carOn = car.x + CAR_HALF > 0 && car.x - CAR_HALF < 1080;
  // (the board's ~880-px body is past the left edge once ~85% of its 1150-px drift is done: 10 f before the drift ends)
  const boardGone = f >= CARRY.start + CARRY.boardDur - 10;
  rows.push(`${f}  D ${car.D.toFixed(2)}  curl minX ${minX.toFixed(0).padStart(6)}  ${onScreen ? "CURL ON" : "       "}  car x ${car.x.toFixed(0).padStart(6)} ${carOn ? "car on" : ""}`);
  seen.push({ f, onScreen, carOn });
  if (carOn && !boardGone && f >= CARRY.start) bad.push(`${f}: the car is on screen while the board is still leaving`);
}
// the ramp is "not yet visible" while the car runs in: it may come into view only once the car is on screen, and once it has come
// into view it never slides back out before the scene settles (an in-out-in is exactly the corner peek Timur saw)
{
  const firstCar = seen.find((s) => s.carOn)?.f ?? Infinity;
  let shown = false;
  for (const s of seen) {
    if (s.onScreen && s.f < firstCar) bad.push(`${s.f}: the curl is on screen before the car is (car enters ${firstCar})`);
    if (shown && !s.onScreen) bad.push(`${s.f}: the curl slid back OUT after showing`);
    if (s.onScreen && s.f >= firstCar) shown = true;
  }
}
// canary: a camera held at the place's own station with no zoom must show the curl (or the check could never fire)
{ const pts = curl.map((p) => proj(p, st)); if (!pts.some((p) => p.x > 0 && p.x < 1080 && p.y > 0 && p.y < 1920)) throw new Error("carryview: canary — the curl is not on screen even at its own station; the projection is wrong. Refusing"); }
if (process.argv.includes("--table")) console.log(rows.join("\n"));
if (bad.length) { console.log(`✗ ${bad.length} frame(s):\n  ` + bad.slice(0, 12).join("\n  ") + (bad.length > 12 ? "\n  …" : "")); process.exit(1); }
console.log(`✓ carried hand-over ${CARRY.start}–${CARRY.end}: the ramp shows only once the car is in and never slides back out, and the car waits for the board`);
