// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { JackpotPlace, RUN_SPAN, RUN_W, runCamWindows, runCheck, runSfx, runTimes } from "./jackpot_seq";

export const jackpotTimes = (w, end) => {
  runCheck("jackpot", w);
  return { ...runTimes(RUN_W, RUN_SPAN), place: { at: RUN_W.jackpot.s0, end } };
};
export const jackpotCamWindows = (t) => runCamWindows(t).filter((k) => k.b > t.place.at && k.a < t.place.end).map((k) => ({ a: Math.max(k.a, t.place.at), b: Math.min(k.b, t.place.end) }));
export const jackpotSfx = (t) => runSfx(t, t.place.at, t.place.end);
export const LtJackpot = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(JackpotPlace, { t: jackpotTimes(w, end), place: "jackpot", at, end, stage });
