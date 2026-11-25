import { bundleScreen, startScreen, escalatorTimes } from "../src/pe/places/escalator";
import { HOOK_CUES } from "../src/pe/places/registry";
const T = escalatorTimes(HOOK_CUES);
console.log(JSON.stringify({ stop: T.stop, land: T.land, cross: T.cross }));
for (const f of [0, 30, 60, 99, 120, 150, 175, 190, 200, 207, 215]) { const b = bundleScreen(HOOK_CUES, f), s = startScreen(f); console.log(f, b.x.toFixed(0), b.y.toFixed(0), "start", s.x.toFixed(0), s.y.toFixed(0)); }
