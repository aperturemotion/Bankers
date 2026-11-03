import { CUE, SENTENCES } from "../src/tsla/captions";
import { PROFILE_RIDE, PROFILE } from "../src/tsla/places/profile";
import { PF_CUES, MK_CUES } from "../src/tsla/places/registry";
const c = { ...PF_CUES, end: 0 } as any;
const m = PROFILE_RIDE.motion(c);
console.log("cues", { climbed: CUE.climbed, upside: CUE.upside, ramp: CUE.ramp, landed: CUE.landed, wheels: CUE.wheels, roadster: CUE.roadster, showed: CUE.showed });
console.log("sent", SENTENCES.slice(1, 6).map((s) => [s.at, s.end, s.text]));
console.log("motion", m, "X0", PROFILE_RIDE.X0, "S_FOOT", PROFILE_RIDE.S_FOOT, "VE", PROFILE_RIDE.VE, "PROFILE", PROFILE);
for (let t = 340; t <= 480; t += 8) { const q = PROFILE_RIDE.carAt(c, t); console.log(t, q.x.toFixed(0), q.y.toFixed(0), q.sf?.toFixed(0), q.phase); }
