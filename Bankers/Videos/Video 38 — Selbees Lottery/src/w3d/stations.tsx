// @ts-nocheck
// The stations of V38, in story order. Each builder adds its own import + entry; the integrator owns this file.
import { ST as hookRaw } from "./st_hook";
const hook = { ...hookRaw, to: Math.max(hookRaw.to, 335) };   // the store's exterior shots stand in the hook's street
import { ST as store } from "./st_store";
import { ST as rolldown } from "./st_rolldown";
import { ST as test } from "./st_test";
import { ST as company } from "./st_company";
import { ST as road } from "./st_road";
import { ST as globe } from "./st_globe";
export const STATIONS = [hook, store, rolldown, test, company, road, globe];
