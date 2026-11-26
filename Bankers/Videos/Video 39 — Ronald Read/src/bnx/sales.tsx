// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as jsx_runtime from "react/jsx-runtime";
import { SALES_SPAN, SALES_W, SalesPlace, salesCheck, salesRunCamWindows, salesRunSfx, salesRunTimes } from "./sales_seq";

export const salesTimes = (w, end) => {
  salesCheck("sales", w);
  return { ...salesRunTimes(SALES_W, SALES_SPAN), place: { at: SALES_W.sales.s0, end } };
};
export const salesCamWindows = (t) => salesRunCamWindows(t).filter((k) => k.b > t.place.at && k.a < t.place.end).map((k) => ({ a: Math.max(k.a, t.place.at), b: Math.min(k.b, t.place.end) }));
export const salesSfx = (t) => salesRunSfx(t, t.place.at, t.place.end);
export const LtSales = ({ at, end, w }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(SalesPlace, { t: salesTimes(w, end), place: "sales", at, end });
