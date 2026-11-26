// @ts-nocheck
import { STATIONS } from "../src/w3d/stations";
import { makeCam, smoothCam } from "../src/w3d/kit";
import { TOTAL, VO_END } from "../src/w3d/take";
const O = [2400, 0, 0];
const variants = JSON.parse(process.env.VARIANTS);
const res = {};
for (const [name, v] of Object.entries(variants)) {
  let shots = STATIONS.flatMap((s) => s.shots()).sort((p, q) => p.a - q.a);
  const li = shots.length - 1;
  shots[li] = { ...shots[li], pos: v.pos.map((x, i) => x + O[i]), target: v.target.map((x, i) => x + O[i]), a: v.a ?? shots[li].a, b: v.b ?? shots[li].b };
  const CLOSE_AT = VO_END + 12, last = shots[li];
  const OUTRO = { a: CLOSE_AT + 32, b: CLOSE_AT + 82, pos: [last.pos[0], last.pos[1] + 22, last.pos[2] + 10], target: [last.target[0], last.target[1] + 26, last.target[2] - 6], fov: 40 };
  const raw = makeCam([...shots, OUTRO]);
  const cam = smoothCam(raw, TOTAL, shots.filter((s) => s.cut).map((s) => s.a), 14);
  res[name] = { shots: shots.filter((s) => s.a > 2000), cam: Array.from({ length: TOTAL }, (_, f) => cam(f)) };
}
console.log(JSON.stringify(res));
