// prints every place's first frame and every construction's animation windows (registry.tsx T0 + TIMES), for planning camera keys
import { T0, TIMES } from "../src/tsla/places/registry";
const round = (v: unknown): unknown => (typeof v === "number" ? Math.round(v * 10) / 10 : Array.isArray(v) ? v.map(round) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, round(x)])) : v);
console.log(JSON.stringify({ T0, TIMES: round(TIMES) }));
