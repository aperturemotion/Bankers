// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { SALES_SPAN, SALES_W, SalesPlace, salesCheck, salesRunCamWindows, salesRunSfx, salesRunTimes } from "./sales_seq";

export const sales2Times = (w, end) => {
  salesCheck("sales2", w);
  return { ...salesRunTimes(SALES_W, SALES_SPAN), place: { at: SALES_W.sales2.s0, end } };
};
export const sales2CamWindows = (t) => salesRunCamWindows(t).filter((k) => k.b > t.place.at && k.a < t.place.end).map((k) => ({ a: Math.max(k.a, t.place.at), b: Math.min(k.b, t.place.end) }));
export const sales2Sfx = (t) => salesRunSfx(t, t.place.at, t.place.end);
export const LtSales2 = ({ at, end, w }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(SalesPlace, { t: sales2Times(w, end), place: "sales2", at, end });
