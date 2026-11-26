// @ts-nocheck
// The stations of V38, in story order. Each builder adds its own import + entry; the integrator owns this file.
import { ST as hookRaw } from "./st_hook";
const hook = { ...hookRaw, to: Math.max(hookRaw.to, 335 + 43) };   // rev 4c: the hook runs in REAL time (shift.ts): story 335 + 43   // the store's exterior shots stand in the hook's street
import { ST as storeRaw } from "./st_store";
const store = { ...storeRaw, from: 0 };   // the store stands at the end of the hook's street from frame 0 (mounting it at 200 popped it into the distance)
import { ST as rolldown } from "./st_rolldown";
import { ST as test } from "./st_test";
import { ST as company } from "./st_company";
import { ST as road } from "./st_road";
import { ST as globe } from "./st_globe";
import { ST as state } from "./st_state";
import { ST as total } from "./st_total";
import { ST as rules } from "./st_rules";
export const STATIONS = [hook, store, rolldown, test, company, road, globe, state, total, rules];
