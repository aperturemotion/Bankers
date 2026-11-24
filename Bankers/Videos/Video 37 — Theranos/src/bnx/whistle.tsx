// @ts-nocheck
// ★ STUB — Video 37 "Theranos" skeleton (integrator, 2026-11-24). Place "whistle" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: THE BADGE: an employee badge on a lanyard, TYLER SHULTZ, hung beside the boardroom's SHULTZ nameplate; GRANDSON links them. (object)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     whistleTimes(w, end) → t   ·   whistleCamWindows(t) → [{a, b}]   ·   whistleSfx(t) → [{job, a, b, vol?, k?}]   ·   BxWhistle({ at, end, w, stage })
//   w = W_.whistle in Composition.tsx (word frames from the take); new helper files are prefixed "whistle_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.whistle) — a missing one refuses, as a built place does
const KEYS = ['s0', 'whistleblower', 'tyler', 'shultz', 'board', 'grandson'];
export const whistleTimes = (w, end) => bxStubTimes("whistle", w, end, KEYS);
export const whistleCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const whistleSfx = (t) => [];
export const BxWhistle = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "whistle", at, end, t: whistleTimes(w, end), stage });
