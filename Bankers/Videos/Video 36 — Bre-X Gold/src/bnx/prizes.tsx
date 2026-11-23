// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { PrizesPlace, RUN_SPAN, RUN_W, runCamWindows, runCheck, runSfx, runTimes } from "./prizes_seq";

export const prizesTimes = (w, end) => {
  runCheck("prizes", w);
  return { ...runTimes(RUN_W, RUN_SPAN), place: { at: RUN_W.prizes.s0, end } };
};
export const prizesCamWindows = (t) => runCamWindows(t).filter((k) => k.b > t.place.at && k.a < t.place.end).map((k) => ({ a: Math.max(k.a, t.place.at), b: Math.min(k.b, t.place.end) }));
export const prizesSfx = (t) => runSfx(t, t.place.at, t.place.end);
export const LtPrizes = ({ at, end, w }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(PrizesPlace, { t: prizesTimes(w, end), place: "prizes", at, end });
