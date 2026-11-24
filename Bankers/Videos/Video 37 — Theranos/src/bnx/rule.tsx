// @ts-nocheck
// ★ STUB — Video 37 "Theranos" skeleton (integrator, 2026-11-24). Place "rule" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: THE JOURNAL SHELF: bound volumes of peer-reviewed journals (JAMA) with one empty slot labelled THERANOS; NO PEER-REVIEWED DATA · JAMA, FEB 2015. Flare 2 comes off it. (object)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     ruleTimes(w, end) → t   ·   ruleCamWindows(t) → [{a, b}]   ·   ruleSfx(t) → [{job, a, b, vol?, k?}]   ·   BxRule({ at, end, w, stage })
//   w = W_.rule in Composition.tsx (word frames from the take); new helper files are prefixed "rule_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.rule) — a missing one refuses, as a built place does
const KEYS = ['s0', 'peak', 'theranos', 'published', 'peer', 'data', 'outside', 'scientists', 'check'];
export const ruleTimes = (w, end) => bxStubTimes("rule", w, end, KEYS);
export const ruleCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const ruleSfx = (t) => [];
export const BxRule = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "rule", at, end, t: ruleTimes(w, end), stage });
