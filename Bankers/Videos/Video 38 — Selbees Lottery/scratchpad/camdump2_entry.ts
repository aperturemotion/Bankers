// @ts-nocheck
import { STATIONS } from "../src/w3d/stations";
import { CAM, CAM_RAW } from "../src/w3d/Main";
const shots = STATIONS.flatMap((s) => s.shots()).sort((p, q) => p.a - q.a);
const out = { shots, cam: [], raw: [] };
for (let f = 0; f < 2319; f++) { out.cam.push(CAM(f)); out.raw.push(CAM_RAW(f)); }
console.log(JSON.stringify(out));
