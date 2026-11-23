// @ts-nocheck
// ★ STUB — Video 36 "Bre-X Gold" skeleton (integrator, 2026-11-23). Place "rule" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: the hero core tray under an embossed steel seal pressing down: QUALIFIED PERSON · NI 43-101 · 2001. (object) Enters: rises from below under the lesson hero's end; exit: pushLight into flare 2 (→ the house close).
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     ruleTimes(w, end) → t   ·   ruleCamWindows(t) → [{a, b}]   ·   ruleSfx(t) → [{job, a, b, vol?, k?}]   ·   BxRule({ at, end, w, stage })
//   w = W_.rule in Composition.tsx (word frames from the take); new helper files are prefixed "rule_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.rule) — a missing one refuses, as a built place does
const KEYS = ["s0", "k2001", "canadian", "miners", "need", "qualified", "experts", "signoff", "often", "independent", "one"];
export const ruleTimes = (w, end) => bxStubTimes("rule", w, end, KEYS);
export const ruleCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const ruleSfx = (t) => [];
export const BxRule = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "rule", at, end, t: ruleTimes(w, end), stage });
