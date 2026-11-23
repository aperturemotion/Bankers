// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { PrizesPlace, RUN_SPAN, RUN_W, runCamWindows, runCheck, runSfx, runTimes } from "./prizes_seq";

export const lotteriesTimes = (w, end) => {
  runCheck("lotteries", w);
  return { ...runTimes(RUN_W, RUN_SPAN), place: { at: RUN_W.lotteries.s0, end } };
};
export const lotteriesCamWindows = (t) => runCamWindows(t).filter((k) => k.b > t.place.at && k.a < t.place.end).map((k) => ({ a: Math.max(k.a, t.place.at), b: Math.min(k.b, t.place.end) }));
export const lotteriesSfx = (t) => runSfx(t, t.place.at, t.place.end);
export const LtLotteries = ({ at, end, w }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(PrizesPlace, { t: lotteriesTimes(w, end), place: "lotteries", at, end });
