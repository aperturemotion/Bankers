// @ts-nocheck
// ★ STUB — Video 37 "Theranos" skeleton (integrator, 2026-11-24). Place "hype" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: ON PAPER: the valuation literally printed on paper — a tall, thin paper sheet unfurls / folds up into a standing $9B, light and flimsy against the solid world. 2014. (object)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     hypeTimes(w, end) → t   ·   hypeCamWindows(t) → [{a, b}]   ·   hypeSfx(t) → [{job, a, b, vol?, k?}]   ·   BxHype({ at, end, w, stage })
//   w = W_.hype in Composition.tsx (word frames from the take); new helper files are prefixed "hype_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.hype) — a missing one refuses, as a built place does
const KEYS = ['s0', 'k2014', 'worth', 'k9', 'billion', 'paper'];
export const hypeTimes = (w, end) => bxStubTimes("hype", w, end, KEYS);
export const hypeCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const hypeSfx = (t) => [];
export const BxHype = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "hype", at, end, t: hypeTimes(w, end), stage });
