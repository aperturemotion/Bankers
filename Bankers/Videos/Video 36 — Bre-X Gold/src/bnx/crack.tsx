// @ts-nocheck
// ★ STUB — Video 36 "Bre-X Gold" skeleton (integrator, 2026-11-23). Place "crack" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: the partner's own core split lengthwise: grey rock through and through; INSIGNIFICANT GOLD · MARCH 26, 1997. (object)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     crackTimes(w, end) → t   ·   crackCamWindows(t) → [{a, b}]   ·   crackSfx(t) → [{job, a, b, vol?, k?}]   ·   BxCrack({ at, end, w, stage })
//   w = W_.crack in Composition.tsx (word frames from the take); new helper files are prefixed "crack_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.crack) — a missing one refuses, as a built place does
const KEYS = ["s0", "week", "later", "partner", "reported", "insignificant", "gold"];
export const crackTimes = (w, end) => bxStubTimes("crack", w, end, KEYS);
export const crackCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const crackSfx = (t) => [];
export const BxCrack = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "crack", at, end, t: crackTimes(w, end), stage });
