// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { JackpotPlace, RUN_SPAN, RUN_W, runCamWindows, runCheck, runSfx, runTimes } from "./jackpot_seq";

export const powerball2Times = (w, end) => {
  runCheck("powerball2", w);
  return { ...runTimes(RUN_W, RUN_SPAN), place: { at: RUN_W.powerball2.s0, end } };
};
export const powerball2CamWindows = (t) => runCamWindows(t).filter((k) => k.b > t.place.at && k.a < t.place.end).map((k) => ({ a: Math.max(k.a, t.place.at), b: Math.min(k.b, t.place.end) }));
export const powerball2Sfx = (t) => runSfx(t, t.place.at, t.place.end);
export const LtPowerball2 = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(JackpotPlace, { t: powerball2Times(w, end), place: "powerball2", at, end, stage });
