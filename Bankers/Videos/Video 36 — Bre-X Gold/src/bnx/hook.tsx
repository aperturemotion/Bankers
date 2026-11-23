// @ts-nocheck
// ★ STUB — Video 36 "Bre-X Gold" skeleton (integrator, 2026-11-23). Place "hook" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: the hero DRILL CORE: frame 0 a fast push-in onto a plain grey core in its tray, gold dust ALREADY falling onto it; the dust settles and the rock glitters as the camera rides along it; on "six billion dollar company" the core rises out of the tray and swells into a towering gold bar stamped C$6 BILLION (the biggest motion, reading ≥ 1 s before flare 1). ≤ 6 elements. Exit: pushLight into flare 1 (own entrance).
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     hookTimes(w, end) → t   ·   hookCamWindows(t) → [{a, b}]   ·   hookSfx(t) → [{job, a, b, vol?, k?}]   ·   BxHook({ at, end, w, stage })
//   w = W_.hook in Composition.tsx (word frames from the take); new helper files are prefixed "hook_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.hook) — a missing one refuses, as a built place does
const KEYS = ["s0", "gold", "dust", "sprinkled", "rock", "samples", "s1", "took", "build", "k6", "billion", "company"];
export const hookTimes = (w, end) => bxStubTimes("hook", w, end, KEYS);
export const hookCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const hookSfx = (t) => [];
export const BxHook = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "hook", at, end, t: hookTimes(w, end), stage });
