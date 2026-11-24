// @ts-nocheck
// ★ STUB — Video 37 "Theranos" skeleton (integrator, 2026-11-24). Place "verdict" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: THE HOURGLASS: GUILTY · 4 COUNTS lands; an hourglass fills to 135 MONTHS, then a year of sand lifts out: 123. (object)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     verdictTimes(w, end) → t   ·   verdictCamWindows(t) → [{a, b}]   ·   verdictSfx(t) → [{job, a, b, vol?, k?}]   ·   BxVerdict({ at, end, w, stage })
//   w = W_.verdict in Composition.tsx (word frames from the take); new helper files are prefixed "verdict_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.verdict) — a missing one refuses, as a built place does
const KEYS = ['s0', 'january', 'k2022', 'holmes', 'guilty', 'defrauding', 'investors', 's1', 'sentence', 'k11', 'years', 'k3', 'months', 'cut', 'year'];
export const verdictTimes = (w, end) => bxStubTimes("verdict", w, end, KEYS);
export const verdictCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const verdictSfx = (t) => [];
export const BxVerdict = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "verdict", at, end, t: verdictTimes(w, end), stage });
