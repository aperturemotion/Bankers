// @ts-nocheck
// ★ STUB — Video 36 "Bre-X Gold" skeleton (integrator, 2026-11-23). Place "partner" draws a labelled placeholder (bx_stub.tsx).
//   PLAN.md: THE TURN (LightBreak 1 on "That March"): two drill rigs side by side, Bre-X's and the partner's (FREEPORT-McMoRAN plate), the partner's bit spinning down; MARCH 1997. (object)
//   The BUILDER replaces this file wholesale and keeps its four exports, their names and signatures:
//     partnerTimes(w, end) → t   ·   partnerCamWindows(t) → [{a, b}]   ·   partnerSfx(t) → [{job, a, b, vol?, k?}]   ·   BxPartner({ at, end, w, stage })
//   w = W_.partner in Composition.tsx (word frames from the take); new helper files are prefixed "partner_". Contract: scratchpad/SKELETON.md.
import * as jsx_runtime from "react/jsx-runtime";
import { BxStub, bxStubCamWindows, bxStubTimes } from "./bx_stub";

// the word frames this place keys to (Composition.tsx W_.partner) — a missing one refuses, as a built place does
const KEYS = ["s0", "march", "partner", "drilled", "test", "holes", "beside", "brexs"];
export const partnerTimes = (w, end) => bxStubTimes("partner", w, end, KEYS);
export const partnerCamWindows = (t) => bxStubCamWindows(t);
// a stub has no motion of its own, so no sound (house rule: sound only for what visibly moves)
export const partnerSfx = (t) => [];
export const BxPartner = ({ at, end, w, stage }) => /* @__PURE__ */ (0,jsx_runtime.jsx)(BxStub, { id: "partner", at, end, t: partnerTimes(w, end), stage });
