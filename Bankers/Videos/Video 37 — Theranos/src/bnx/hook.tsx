// @ts-nocheck
// ★ STUB — Video 37 "Theranos" skeleton (integrator, 2026-11-24). Place "hook" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: THE NANOTAINER: frame 0 a fast push-in onto Theranos's thumb-sized sample tube on the key light; red drops already falling into it from a lancet's tip; on 'nine billion dollar company' the camera pulls back fast and reveals the tube standing on top of a towering plinth stamped $9 BILLION (tiny drop, huge valuation). (object)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     hookTimes(w, end) → t   ·   hookCamWindows(t) → [{a, b}]   ·   hookSfx(t) → [{job, a, b, vol?, k?}]   ·   BxHook({ at, end, w, stage })
//   w = W_.hook in Composition.tsx (word frames from the take); new helper files are prefixed "hook_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.hook) — a missing one refuses, as a built place does
const KEYS = ['s0', 'few', 'drops', 'blood', 's1', 'promise', 'k9', 'billion', 'company'];
export const hookTimes = (w, end) => bxStubTimes("hook", w, end, KEYS);
export const hookCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const hookSfx = (t) => [];
export const BxHook = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "hook", at, end, t: hookTimes(w, end), stage });
