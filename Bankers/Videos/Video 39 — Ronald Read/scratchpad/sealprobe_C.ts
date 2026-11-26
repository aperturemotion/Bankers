// @ts-nocheck
// builder C: measures the $1 seal on screen through test's departure (and solves PUSH.b3 / PUSH.D1 with --solve)
import { STATIONS } from "../src/w3d/stations";
import { makeCam, projectWith } from "../src/w3d/kit";
import { sealWorld, PUSH, TEST_ORIGIN, T } from "../src/w3d/st_test";
import { SEAL_SCREEN, PUSH_RATE } from "../src/w3d/xfer_seal";
const O = TEST_ORIGIN;
const build = () => makeCam(STATIONS.flatMap((s) => s.shots()).sort((p, q) => p.a - q.a));
const meas = (cam, f) => {
  const k = cam(f), s = sealWorld();
  const c = projectWith(k, [s.p[0] + O[0], s.p[1] + O[1], s.p[2] + O[2]]);
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2; const q = projectWith(k, [s.p[0] + O[0] + Math.cos(a) * s.r, s.p[1] + O[1], s.p[2] + O[2] + Math.sin(a) * s.r]); x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); }
  return { f, x: (x0 + x1) / 2, y: (y0 + y1) / 2, rx: (x1 - x0) / 2, ry: (y1 - y0) / 2, cx: c.x, cy: c.y };   // x, y: the visible (outline) centre; cx, cy: the projected centre point
};
const last = T().out - 1;
if (process.env.PUSHO) Object.assign(PUSH, JSON.parse(process.env.PUSHO));
if (process.argv.includes("--solve")) {
  const K = ["b3", "D1", "ox", "oz"];
  const res = () => { const cam = build(); const a = meas(cam, last - 1), b = meas(cam, last); return [b.rx / a.rx - 1 - PUSH_RATE, b.rx / SEAL_SCREEN.r - 1, (b.x - SEAL_SCREEN.x) / 100, (b.y - SEAL_SCREEN.y) / 100]; };
  const H = { b3: 0.05, D1: 0.001, ox: 0.0005, oz: 0.0005 };
  for (let it = 0; it < 12; it++) {
    const r0 = res();
    if (Math.max(...r0.map(Math.abs)) < 1e-6) break;
    const J = K.map((k) => { const v = PUSH[k]; PUSH[k] = v + H[k]; const r1 = res(); PUSH[k] = v; return r1.map((x, i) => (x - r0[i]) / H[k]); });   // J[k][i]
    // solve sum_k J[k][i] dx_k = -r0[i]  (4×4 Gauss)
    const A = [0, 1, 2, 3].map((i) => [...K.map((_, k) => J[k][i]), -r0[i]]);
    for (let c = 0; c < 4; c++) { let p = c; for (let r = c + 1; r < 4; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; [A[c], A[p]] = [A[p], A[c]]; for (let r = 0; r < 4; r++) if (r !== c) { const m = A[r][c] / A[c][c]; for (let q = c; q < 5; q++) A[r][q] -= m * A[c][q]; } }
    K.forEach((k, i) => { PUSH[k] += A[i][4] / A[i][i]; });
  }
  console.log("solved", JSON.stringify(PUSH), res());
}
const cam = build();
let prev = null;
for (let f = Number(process.argv[2] ?? 840); f <= last; f++) {
  const m = meas(cam, f);
  console.log(`${f} c=(${m.x.toFixed(1)},${m.y.toFixed(1)}) rx=${m.rx.toFixed(1)} ry=${m.ry.toFixed(1)}${prev ? ` grow=${((m.rx / prev.rx - 1) * 100).toFixed(2)}%` : ""}`);
  prev = m;
}
