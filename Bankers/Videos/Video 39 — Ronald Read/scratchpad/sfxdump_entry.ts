// @ts-nocheck
import { SFX } from "../src/w3d/Main";
import { STATIONS } from "../src/w3d/stations";
import { HOOK_SHIFT } from "../src/w3d/shift";
import { CHIPS } from "../src/w3d/take_rt";
const st = STATIONS.map((s) => ({ id: s.id, from: s.id === "hook" ? s.from : s.from + HOOK_SHIFT, to: s.id === "hook" ? s.to : s.to + HOOK_SHIFT }));
console.log(JSON.stringify({ SFX, st, chips: CHIPS.map((c) => ({ a: c.a ?? c.from ?? c.start, t: c.text ?? c.words?.map?.((w) => w.w ?? w.text).join(" ") })) }));
