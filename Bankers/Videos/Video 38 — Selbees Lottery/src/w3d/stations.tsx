// @ts-nocheck
// The stations of V38, in story order. Each builder adds its own import + entry; the integrator owns this file.
import { ST as hook } from "./st_hook";
import { ST as road } from "./st_road";
import { ST as globe } from "./st_globe";
export const STATIONS = [hook, road, globe];
