// @ts-nocheck
// ★ STUB — Video 37 "Theranos" skeleton (integrator, 2026-11-24). Place "collapse" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: THE LAB SHUTS: the claim's lab door returns: the results behind it go VOID (2014–2015), the Walgreens plaque beside it falls away, a steel shutter rolls down: SEPT 2018. (object)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     collapseTimes(w, end) → t   ·   collapseCamWindows(t) → [{a, b}]   ·   collapseSfx(t) → [{job, a, b, vol?, k?}]   ·   BxCollapse({ at, end, w, stage })
//   w = W_.collapse in Composition.tsx (word frames from the take); new helper files are prefixed "collapse_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.collapse) — a missing one refuses, as a built place does
const KEYS = ['s0', 'voided', 'two', 'years', 'edison', 'results', 's1', 'walgreens', 'walked', 's2', 'k2018', 'shut'];
export const collapseTimes = (w, end) => bxStubTimes("collapse", w, end, KEYS);
export const collapseCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const collapseSfx = (t) => [];
export const BxCollapse = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "collapse", at, end, t: collapseTimes(w, end), stage });
