// @ts-nocheck
// ★ STUB — Video 37 "Theranos" skeleton (integrator, 2026-11-24). Place "cleared" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: THE SCALES: a justice balance, PATIENTS · NOT GUILTY rises against INVESTORS · GUILTY. (object)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     clearedTimes(w, end) → t   ·   clearedCamWindows(t) → [{a, b}]   ·   clearedSfx(t) → [{job, a, b, vol?, k?}]   ·   BxCleared({ at, end, w, stage })
//   w = W_.cleared in Composition.tsx (word frames from the take); new helper files are prefixed "cleared_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.cleared) — a missing one refuses, as a built place does
const KEYS = ['s0', 'cleared', 'defrauding', 'patients'];
export const clearedTimes = (w, end) => bxStubTimes("cleared", w, end, KEYS);
export const clearedCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const clearedSfx = (t) => [];
export const BxCleared = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "cleared", at, end, t: clearedTimes(w, end), stage });
