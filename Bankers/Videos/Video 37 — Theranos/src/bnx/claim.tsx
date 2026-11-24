// @ts-nocheck
// ★ STUB — Video 37 "Theranos" skeleton (integrator, 2026-11-24). Place "claim" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: THE FIRST LAB DOOR: a glass lab door whose gold lettering writes THERANOS letter by letter; plates: 2003 · ELIZABETH HOLMES, 19 · STANFORD DROPOUT. (object)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     claimTimes(w, end) → t   ·   claimCamWindows(t) → [{a, b}]   ·   claimSfx(t) → [{job, a, b, vol?, k?}]   ·   BxClaim({ at, end, w, stage })
//   w = W_.claim in Composition.tsx (word frames from the take); new helper files are prefixed "claim_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.claim) — a missing one refuses, as a built place does
const KEYS = ['s0', 'k2003', 'elizabeth', 'holmes', 'founded', 'theranos', 'k19', 'dropped', 'stanford'];
export const claimTimes = (w, end) => bxStubTimes("claim", w, end, KEYS);
export const claimCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const claimSfx = (t) => [];
export const BxClaim = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "claim", at, end, t: claimTimes(w, end), stage });
