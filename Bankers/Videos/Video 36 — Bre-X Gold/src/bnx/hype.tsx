// @ts-nocheck
// ★ STUB — Video 36 "Bre-X Gold" skeleton (integrator, 2026-11-23). Place "hype" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: a one-cent coin on a plinth grows into the hook's gold bar (PENNIES → C$6B); three engraved pension plaques slide in beneath it: ONTARIO TEACHERS', OMERS, CAISSE (names only). (object)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     hypeTimes(w, end) → t   ·   hypeCamWindows(t) → [{a, b}]   ·   hypeSfx(t) → [{job, a, b, vol?, k?}]   ·   BxHype({ at, end, w, stage })
//   w = W_.hype in Composition.tsx (word frames from the take); new helper files are prefixed "hype_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.hype) — a missing one refuses, as a built place does
const KEYS = ["s0", "stock", "pennies", "k6", "billion", "company", "s1", "pension", "funds", "piled"];
export const hypeTimes = (w, end) => bxStubTimes("hype", w, end, KEYS);
export const hypeCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const hypeSfx = (t) => [];
export const BxHype = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "hype", at, end, t: hypeTimes(w, end), stage });
