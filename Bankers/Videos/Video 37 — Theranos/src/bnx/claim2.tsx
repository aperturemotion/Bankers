// @ts-nocheck
// ★ STUB — Video 37 "Theranos" skeleton (integrator, 2026-11-24). Place "claim2" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: THE EDISON: the sleek analyser box; a cartridge carrying the nanotainer slides in; its screen fills tile by tile with test results — 'a full set of blood tests'. ONE FINGER PRICK. (object)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     claim2Times(w, end) → t   ·   claim2CamWindows(t) → [{a, b}]   ·   claim2Sfx(t) → [{job, a, b, vol?, k?}]   ·   BxClaim2({ at, end, w, stage })
//   w = W_.claim2 in Composition.tsx (word frames from the take); new helper files are prefixed "claim2_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.claim2) — a missing one refuses, as a built place does
const KEYS = ['s0', 'pitch', 'full', 'blood', 'tests', 'finger', 'prick', 'edison', 'machine'];
export const claim2Times = (w, end) => bxStubTimes("claim2", w, end, KEYS);
export const claim2CamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const claim2Sfx = (t) => [];
export const BxClaim2 = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "claim2", at, end, t: claim2Times(w, end), stage });
