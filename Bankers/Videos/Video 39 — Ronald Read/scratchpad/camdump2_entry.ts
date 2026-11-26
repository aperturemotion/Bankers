// @ts-nocheck
import { STATIONS } from "../src/w3d/stations";
import { CAM, CAM_RAW } from "../src/w3d/Main";
import { TOTAL } from "../src/w3d/take_rt";
import { HOOK_SHIFT } from "../src/w3d/shift";
const shots = STATIONS.flatMap((s) => s.shots().map((sh) => (s.id === "hook" ? sh : { ...sh, a: sh.a + HOOK_SHIFT, b: sh.b + HOOK_SHIFT }))).sort((p, q) => p.a - q.a);
const out = { shots, cam: [], raw: [] };
for (let f = 0; f < TOTAL; f++) { out.cam.push(CAM(f)); out.raw.push(CAM_RAW(f)); }
console.log(JSON.stringify(out));
