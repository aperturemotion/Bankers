// @ts-nocheck
// ★ STUB — Video 36 "Bre-X Gold" skeleton (integrator, 2026-11-23). Place "collapse" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: the hook's gold bar crumbles from the top down to grey rock dust; a price tag flips C$6 BILLION → 6¢ (MAY 6, 1997); a GRID of share certificates goes dark row by row: ~40,000 SHAREHOLDERS. (grid — the film's one grid)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     collapseTimes(w, end) → t   ·   collapseCamWindows(t) → [{a, b}]   ·   collapseSfx(t) → [{job, a, b, vol?, k?}]   ·   BxCollapse({ at, end, w, stage })
//   w = W_.collapse in Composition.tsx (word frames from the take); new helper files are prefixed "collapse_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.collapse) — a missing one refuses, as a built place does
const KEYS = ["s0", "days", "shares", "sank", "k6", "cents", "s1", "about", "k40000", "shareholders", "nearly", "wiped"];
export const collapseTimes = (w, end) => bxStubTimes("collapse", w, end, KEYS);
export const collapseCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const collapseSfx = (t) => [];
export const BxCollapse = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "collapse", at, end, t: collapseTimes(w, end), stage });
