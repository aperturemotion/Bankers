// @ts-nocheck
// ★ STUB — Video 36 "Bre-X Gold" skeleton (integrator, 2026-11-23). Place "truth" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: THE ONE LIGHT WINDOW (white stage): the hero core under a jeweller's loupe — gold grains only on the OUTSIDE of the rock (rounded, river-worn); SALTED · MAY 4, 1997. (object)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     truthTimes(w, end) → t   ·   truthCamWindows(t) → [{a, b}]   ·   truthSfx(t) → [{job, a, b, vol?, k?}]   ·   BxTruth({ at, end, w, stage })
//   w = W_.truth in Composition.tsx (word frames from the take); new helper files are prefixed "truth_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.truth) — a missing one refuses, as a built place does
const KEYS = ["s0", "may", "k4", "independent", "auditors", "confirmed", "core", "samples", "salted", "outside", "gold"];
export const truthTimes = (w, end) => bxStubTimes("truth", w, end, KEYS);
export const truthCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const truthSfx = (t) => [];
export const BxTruth = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "truth", at, end, t: truthTimes(w, end), stage });
