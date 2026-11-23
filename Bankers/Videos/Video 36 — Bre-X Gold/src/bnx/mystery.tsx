// @ts-nocheck
// ★ STUB — Video 36 "Bre-X Gold" skeleton (integrator, 2026-11-23). Place "mystery" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: plain and respectful: a helicopter on its pad at dusk lifting away out of frame; MARCH 19, 1997 · MICHAEL DE GUZMAN / CHIEF GEOLOGIST. No fall shown, no person. (object)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     mysteryTimes(w, end) → t   ·   mysteryCamWindows(t) → [{a, b}]   ·   mysterySfx(t) → [{job, a, b, vol?, k?}]   ·   BxMystery({ at, end, w, stage })
//   w = W_.mystery in Composition.tsx (word frames from the take); new helper files are prefixed "mystery_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.mystery) — a missing one refuses, as a built place does
const KEYS = ["s0", "march", "k19", "chief", "geologist", "michael", "guzman", "fell", "helicopter"];
export const mysteryTimes = (w, end) => bxStubTimes("mystery", w, end, KEYS);
export const mysteryCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const mysterySfx = (t) => [];
export const BxMystery = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "mystery", at, end, t: mysteryTimes(w, end), stage });
