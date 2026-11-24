// @ts-nocheck
// ★ V37 "Theranos" SKELETON helper (integrator, 2026-11-24; from V36): the labelled placeholder every STUB place draws until its builder
//   replaces the place file. It honours the place contract (PlaceRoot › CamFn › Turn, the stage prop, data-probe-leaving) so the
//   film plays end to end with its real hand-overs, light windows, flares, breaks, captions and heroes. It shows the place id, its
//   frames, its line(s) from the take, its PLAN labels (episode.json) and its key words, each lighting on its (provisional) frame.
//   DELETE this file once no place imports it.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { alpha, clamp01, mixHex, rInOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn, Pool3D } from "./s3";
import { travelling } from "./common";
import { Turn } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { theme } from "./theme";
import { SENTENCES } from "./captions";
import { SHOUT, VOICE } from "./fonts";
import episode from "./episode.json";

/** a stub's Times: refuses a missing word frame, exactly as a built place does */
export const bxStubTimes = (id, w, end, keys) => {
  for (const k of keys) if (!Number.isFinite(w[k])) throw new Error(`${id}: the take has no word frame "${k}"`);
  return { id, w, end, keys };
};
// one still focus on the stage pivot (a built place adds its action-camera shots here)
const shots = (t) => [{ a: -9999, z: 1, push: 0.03, at: still(540, 883) }];
export const bxStubCamWindows = (t) => actionCamWindows(shots(t));
const CARD = { x: 100, y: 470, w: 880, h: 820 };
export const BxStub = ({ id, at, end, t, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const lines = SENTENCES.filter((s) => s.scene === id && !s.hero);
  const labels = Object.values(episode.labels).filter((v) => v.place === id).map((v) => v.text);
  const s = clamp01(stage);
  const ink = mixHex("#EFF5FB", "#001C3C", s);
  const dim = mixHex("#84B0E4", "#0D70E2", s);
  const face = s < 0.5
    ? "linear-gradient(150deg, #153558 0%, #122A45 48%, #0E2135 100%)"
    : "linear-gradient(150deg, #FFFFFF 0%, #F5F9FD 55%, #E3EDF9 100%)";
  const prog = clamp01((f - at) / Math.max(1, end - at));
  const keys = t.keys.filter((k) => k !== "s0" && k !== "s1");
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceRoot, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CamFn, { at: actionCam(shots(t)), children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-leaving": travelling(f, bxStubCamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)(Turn, { at, end, from: -6, to: 4, amp: 0.9, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Pool3D, { x: 540, y: CARD.y + CARD.h + 40, w: 1e3, on: 0.42 * (1 - s) }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: {
      position: "absolute",
      left: CARD.x,
      top: CARD.y,
      width: CARD.w,
      height: CARD.h,
      boxSizing: "border-box",
      padding: "44px 56px",
      borderRadius: 22,
      background: face,
      border: `2px solid ${alpha(theme.accent, 0.55)}`,
      boxShadow: `0 40px 80px rgba(0,10,30,${(0.45 * (1 - s)).toFixed(2)}), inset 0 1px 0 rgba(255,255,255,0.35)`,
      color: ink,
      overflow: "hidden"
    }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { fontFamily: VOICE, fontWeight: 700, fontSize: 24, letterSpacing: 6, color: dim }, children: "PLACEHOLDER · V37 SKELETON" }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { fontFamily: SHOUT, fontSize: 132, lineHeight: 1.05, marginTop: 6 }, children: id.toUpperCase() }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { fontFamily: VOICE, fontSize: 28, color: dim, marginTop: 2 }, children: `frames ${at}–${end} · ${((end - at) / 30).toFixed(2)} s` }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { fontFamily: VOICE, fontSize: 36, lineHeight: 1.3, marginTop: 26 }, children: lines.map((l) => l.text).join(" ") }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { fontFamily: SHOUT, fontSize: 44, lineHeight: 1.15, marginTop: 24, color: dim }, children: labels.join("  /  ") }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }, children: keys.map((k) => {
        const lit = rInOut(f, t.w[k] - 4, t.w[k] + 4);
        return /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
          fontFamily: VOICE,
          fontSize: 24,
          padding: "6px 12px",
          borderRadius: 10,
          background: alpha(theme.accent, 0.12 + 0.6 * lit),
          color: lit > 0.5 ? s < 0.5 ? "#001C3C" : "#FFFFFF" : ink
        }, children: `${k} ${t.w[k]}` }, k);
      }) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: 56, right: 56, bottom: 40, height: 10, borderRadius: 5, background: alpha(theme.accent, 0.2) }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { width: `${(100 * prog).toFixed(2)}%`, height: "100%", borderRadius: 5, background: theme.accent } }) })
    ] })
  ] }) }) }) });
};
