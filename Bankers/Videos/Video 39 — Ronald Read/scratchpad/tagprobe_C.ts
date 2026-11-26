// @ts-nocheck
// builder C: where the rolldown / test tags' leader points fall on screen, frame by frame (through the film's real camera)
import { CAM } from "../src/w3d/Main";
import { projectWith } from "../src/w3d/kit";
import { tagPts, TAGS } from "../src/w3d/st_rolldown";
const fr = (a, b, s = 4) => { const o = []; for (let f = a; f <= b; f += s) o.push(f); return o; };
const P = (f, w) => { const p = projectWith(CAM(f), [w[0] + 300, w[1], w[2]]); return `${p.x.toFixed(0)},${p.y.toFixed(0)}${p.behind ? "B" : ""}`; };
console.log(JSON.stringify(TAGS()));
for (const f of fr(Number(process.argv[2] ?? 477), Number(process.argv[3] ?? 760), Number(process.argv[4] ?? 4))) {
  const q = tagPts(f);
  console.log(f, "top", P(f, q.top), "gate", P(f, q.gate), "t5", P(f, q.tray[0]), "t4", P(f, q.tray[1]), "t3", P(f, q.tray[2]), "L", P(f, q.panL), "R", P(f, q.panR), "piv", P(f, q.piv));
}
