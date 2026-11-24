// @ts-nocheck
// ★ STUB — Video 37 "Theranos" skeleton (integrator, 2026-11-24). Place "backers" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: TWO sentences, ONE place with an action-camera TRAVEL between two framings (STYLE: a place over ~4 s may travel across its
//   construction). Framing 1 — THE BOARDROOM: a long polished table, two chairs lit with brass nameplates SHULTZ and KISSINGER,
//   FORMER SECRETARIES OF STATE (no people). On "Walgreens" the camera travels to framing 2 — THE STORES: ~40 Walgreens storefront
//   tiles lighting one after another; ~40 STORES · ARIZONA. (grid — the film's one grid)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     backersTimes(w, end) → t   ·   backersCamWindows(t) → [{a, b}]   ·   backersSfx(t) → [{job, a, b, vol?, k?}]   ·   BxBackers({ at, end, w, stage })
//   w = W_.backers in Composition.tsx (word frames from the take); new helper files are prefixed "backers_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.backers) — a missing one refuses, as a built place does
const KEYS = ["s0", "two", "former", "secretaries", "state", "board", "s1", "walgreens", "offered", "tests", "k40", "stores"];
export const backersTimes = (w, end) => bxStubTimes("backers", w, end, KEYS);
export const backersCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const backersSfx = (t) => [];
export const BxBackers = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "backers", at, end, t: backersTimes(w, end), stage });
