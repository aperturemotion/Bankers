// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { PlaceRoot } from "./shot";
import { CamFn, Pool3D } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { EV_FLOOR, EV_SET_C, EV_TRAY_C, EvGrid, waveX } from "./ev_grid";

const WORDS = ["split", "name", "expected", "value"];
export const evTimes = (w, end) => {
  for (const k of WORDS) if (!Number.isFinite(w[k])) throw new Error(`ev: the take has no word frame "${k}"`);
  const wave = { a: w.split + 1, b: w.name + 2 };
  return { w, end, wave, word: w.expected };
};
const shots = (t) => [
  { a: -9999, z: 0.93, push: 0.03, at: still(EV_SET_C.x + 14, EV_SET_C.y) },
  // RIDE the wave's front across the tray, pushed in
  { a: t.wave.a - 6, dur: 30, z: 1.2, push: 0, ride: { a: t.wave.a, b: t.wave.b }, at: (g) => ({ x: 540 + 0.42 * (waveX(t.wave, g) - 540), y: EV_TRAY_C.y - 8 }) },
  // back off to the whole set as the nameplate prints
  { a: t.word - 12, dur: 40, z: 0.95, push: 0.03, at: still(EV_SET_C.x + 14, EV_SET_C.y + 14) }
];
export const evCamWindows = (t) => actionCamWindows(shots(t));
export const evSfx = (t) => [
  // the light running across the tiles: the data tick, held for the sweep
  { job: "data", a: t.wave.a, b: t.wave.b, vol: 0.8 },
  // the nameplate's words lighting on "expected"
  { job: "label", a: t.word - 10, b: t.word + 8, vol: 0.6 }
];
export const LtEv = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = evTimes(w, end);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceRoot, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CamFn, { at: actionCam(shots(t)), children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-leaving": travelling(f, evCamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)(Turn, { at, end, from: -6, to: 4, amp: 0.9, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Pool3D, { x: 540, y: EV_FLOOR + 6, w: 1e3, on: 0.42 * (1 - stage) }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(EvGrid, { g: f, wave: t.wave, word: t.word, name: L("expectedValue"), stage })
  ] }) }) }) });
};
