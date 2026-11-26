// @ts-nocheck
// ★ V37 "Theranos" — place RULE (builder F). "At its peak, Theranos had published no peer-reviewed data for outside scientists to
//   check."  (FACTCHECK #18: Ioannidis, "Stealth Research", JAMA 2015;313(7):663–664, Feb 17, 2015 — none in the peer-reviewed
//   literature; a paper came only in Jan 2018, so the line says "at its peak", and the screen dates it FEB 2015.)
//   THE JOURNAL SHELF (rule_shelf.tsx): a steel library bookcase with a row of bound JAMA volumes (ruleJournal) held by a bookend,
//   and ONE EMPTY SLOT in the row, its card holder on the shelf rail reading THERANOS (ruleGap). The place rises from under the
//   lesson card onto the whole case; FEB 2015 (ruleDate) paints into the plinth's plate on "peak"; the THERANOS card catches the
//   light on "Theranos"; on "published no" the camera FINDS THE GAP and centres it; NO PEER-REVIEWED DATA (ruleLabel) lands under
//   the case on "peer-reviewed"; the slot's back lights from within as the line runs out ("…to check"), and the composition's
//   pushLight carries the frame into flare 2 off that lit slot (ruleFlarePoint).
//   Objects: the bookcase with its volumes, the bookend (≤ 3).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rIn, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { travelling } from "./common";
import { L } from "./data";
import { Turn, figure } from "./kit";
import { actionCam, actionCamWindows } from "./actioncam";
import { worldScr, xfApply, xfPose } from "./tk_rig";
import { TK_FLOOR_Y } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import "./verdict_data";
import { GAP_BACK, GAP_C, JournalShelf, shelfCorners } from "./rule_shelf";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const FY = TK_FLOOR_Y;
const RIG = { cx: 540, cy: FY - 780, persp: 3600, yaw: 6, pitch: -3 };
const POSE = xfPose(540, FY, 0);
const KEYS = ["s0", "peak", "theranos", "published", "peer", "data", "outside", "scientists", "check"];
export const ruleTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`rule: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    date: { a: w.peak - 12, b: w.peak + 6 },             // FEB 2015 on "peak"
    card: { a: w.theranos - 8, b: w.theranos + 8 },      // the THERANOS card catches the light
    find: { a: w.published - 12, dur: 32 },              // the camera finds the gap on "published no"
    label: { a: w.peer - 13, b: w.peer + 3 },            // NO PEER-REVIEWED DATA on "peer-reviewed"
    dim: { a: w.published - 4, b: w.peer + 8 },          // a first light in the empty slot as it is found
    lit: { a: w.scientists - 6, b: end - 2 },            // the slot's light grows into flare 2
    out: end + 2 - 22                                    // the composition's pushLight (HO.rule)
  };
  if (t.date.b > t.find.a) throw new Error("rule: FEB 2015 must be read before the camera moves to the gap");
  if (t.find.a + t.find.dur > t.label.b + 2) throw new Error("rule: the camera must have found the gap as the label lands");
  if (t.label.b > t.out - 20) throw new Error(`rule: NO PEER-REVIEWED DATA must be read before the push into the flare (${t.label.b} vs ${t.out})`);
  return t;
};
const scr = (p) => {
  const q = worldScr(RIG, xfApply(POSE, p));
  return { x: q[0], y: q[1] };
};
const WHOLE = [0, -300, 0];
const shots = (t) => [
  { a: -9999, z: 0.98, push: 0.03, at: () => scr(WHOLE) },
  // ★ the gap, centred (its lit back is the flare's source, so it sits on the pivot as the push-light begins)
  { a: t.find.a, dur: t.find.dur, z: 1.34, push: 0.02, at: () => scr(GAP_BACK) }
];
export const ruleCamWindows = (t) => actionCamWindows(shots(t));
export const ruleSfx = (t) => [
  // FEB 2015 paints into the plinth's plate
  { job: "label", a: t.date.a, b: t.date.b, vol: 0.4 },
  // NO PEER-REVIEWED DATA
  { job: "label", a: t.label.a, b: t.label.b, vol: 0.5 },
  // the empty slot lights
  { job: "ping", a: t.dim.a + 6, vol: 0.45 }
];
const glowAt = (t, g) => 0.45 * rInOut(g, t.dim.a, t.dim.b) + 0.55 * rInOut(g, t.lit.a, t.lit.b);
/** flare 2's source: the lit slot's back (place coordinates, and with the place's own camera applied; the composition's
 *  pushLight scale about (540, 883) and its Turn are added by the caller — the slot sits on that pivot, so they barely move it) */
export const ruleFlarePoint = (w, end, g = end - 1) => {
  const t = ruleTimes(w, end), q = scr(GAP_BACK), c = actionCam(shots(t))(g);
  return { place: { x: q.x, y: q.y }, cam: { x: 540 + c.z * (q.x + c.x - 540), y: 883.2 + c.z * (q.y + c.y - 883.2) } };
};
const Label = ({ x, y, on, text }) => {
  if (on <= 3e-3) return null;
  const Wd = 900;
  return jsx("div", { "data-probe-label": "the shelf's label", style: { position: "absolute", left: 0, top: 0, width: Wd, textAlign: "center", transformOrigin: "50% 0%",
    transform: `translate(${(x - Wd / 2).toFixed(2)}px, ${(y + 12 * (1 - on)).toFixed(2)}px) scale(${(0.94 + 0.06 * on).toFixed(4)})`, opacity: clamp01(on * 1.4), ...figure(56) }, children: text });
};
export const BxRule = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = ruleTimes(w, end);
  const under = worldScr(RIG, xfApply(POSE, [GAP_C[0], 0, 120]));
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: actionCam(shots(t)), children: jsx("div", { "data-probe-leaving": travelling(f, ruleCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at: at - 17, end, from: -4, to: 2, amp: 0.6, children: [
    jsx(TkFloor, { id: "ruF", rig: RIG, at: { x: 540, z: -40 }, reach: 1400, casters: [{ corners: shelfCorners(POSE) }], stage, on: 1 - stage }),
    jsx(JournalShelf, { id: "ruS", rig: RIG, pose: POSE, glow: glowAt(t, f), holder: rInOut(f, t.card.a, t.card.b),
      date: { text: L("ruleDate"), on: rInOut(f, t.date.a, t.date.b) }, gapText: L("ruleGap"), journal: L("ruleJournal") }),
    jsx(Label, { x: under[0], y: under[1] + 30, on: rOut(f, t.label.a, t.label.b), text: L("ruleLabel") })
  ] }) }) }) });
};
