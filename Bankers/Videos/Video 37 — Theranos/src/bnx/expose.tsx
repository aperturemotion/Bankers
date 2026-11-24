// @ts-nocheck
// ★ STUB — Video 37 "Theranos" skeleton (integrator, 2026-11-24). Place "expose" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: THE NEWSPAPER (the ONE white stage): a bundle of newspapers drops onto the floor, twine snapping; masthead THE WALL STREET JOURNAL, OCT 15, 2015. (object)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     exposeTimes(w, end) → t   ·   exposeCamWindows(t) → [{a, b}]   ·   exposeSfx(t) → [{job, a, b, vol?, k?}]   ·   BxExpose({ at, end, w, stage })
//   w = W_.expose in Composition.tsx (word frames from the take); new helper files are prefixed "expose_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.expose) — a missing one refuses, as a built place does
const KEYS = ['s0', 'october', 'k2015', 'wall', 'street', 'journal', 'exposed'];
export const exposeTimes = (w, end) => bxStubTimes("expose", w, end, KEYS);
export const exposeCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const exposeSfx = (t) => [];
export const BxExpose = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "expose", at, end, t: exposeTimes(w, end), stage });
