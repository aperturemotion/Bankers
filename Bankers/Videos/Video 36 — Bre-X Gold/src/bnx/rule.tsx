// @ts-nocheck
// ★ V36 "Bre-X Gold" — place `rule` (builder C, rev 1: Timur "make the visuals actually connected to the voiceover"). "Since two
//   thousand one, Canadian miners need a qualified expert's sign-off, and often an independent one."
//   THE TWO-KEY RELEASE: the company's results — the film's gold bar — stand on a display block inside a locked steel vitrine,
//   dimmed behind its tinted glass door. The header's nameplate fills NI 43-101 / 2001 (ruleCode, ruleYear) on "two thousand one".
//   Two key locks on the plinth: on "qualified" the left plate's paint fills QUALIFIED PERSON (ruleSeal) and on "sign-off" its key
//   turns and its bezel lights; on "independent" the right plate fills INDEPENDENT (ruleIndependent) and its key turns. With both
//   turned the glass door swings open, the case's lamp comes on and the bar shines — and the composition's pushLight carries the
//   frame into flare 2 off the bar's lit crown (ruleFlarePoint).
//   Objects: the vitrine (+ plinth and locks), its two keys, the bar.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { mix, rIn, rInOut, rLin, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { aim, travelling } from "./common";
import { L } from "./data";
import { Turn } from "./kit";
import { worldScr, xfTrans } from "./tk_rig";
import { TkFloor } from "./tk_floor";
import { BX_FLOOR_Y, bxRig } from "./bx_core";
import { barPoint } from "./bx_bar";
import { RuleCase, barXfOf, caseCorners } from "./rule_case";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const FY = BX_FLOOR_Y;
const POSE = xfTrans([540, FY, 0]);
const RIG = bxRig({ cx: 540, cy: FY - 560, yaw: -12, pitch: -12, lens: 3200 });
// the camera: the whole vitrine; a touch in toward the locks on "qualified"; back up to the bar as the door opens
const T0 = [540, FY - 430, 0], TQ = [540, FY - 445, 60], TO = [540, FY - 460, 0];
const Z0 = 1.18, ZQ = 1.23, ZO = 1.19;
const KEYS = ["s0", "k2001", "canadian", "miners", "need", "qualified", "experts", "signoff", "often", "independent", "one"];
export const ruleTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`rule: the take has no word frame "${k}"`);
  const turn2 = { a: w.independent - 8, b: w.independent + 4 };
  const t = {
    w,
    end,
    // NI 43-101 / 2001 fills on "two thousand one" (the place is still rising under the hero card's end, so it lands as it settles)
    name: { a: w.k2001 + 2, b: w.k2001 + 20 },
    q: { a: w.qualified - 16, dur: 30 },
    plate1: { a: w.qualified - 12, b: w.qualified },
    turn1: { a: w.signoff - 12, b: w.signoff + 2 },
    plate2: { a: w.independent - 12, b: w.independent },
    turn2,
    // both keys turned: the door swings open and the lamp lights the bar
    open: { a: turn2.b + 1, b: turn2.b + 21 },
    lamp: { a: turn2.b - 1, b: turn2.b + 13 },
    back: { a: turn2.a - 4, dur: 28 }
  };
  if (t.turn1.b > t.plate2.a) throw new Error("rule: the first key must have turned before the second plate fills");
  if (t.q.a + t.q.dur > t.turn1.a + 4) throw new Error("rule: the camera must be in on the locks before the first key turns");
  if (t.open.b > end - 4) throw new Error(`rule: the door must be open before flare 2's peak (${t.open.b} vs ${end})`);
  return t;
};
const camE = (t, g) => ({ eq: rInOut(g, t.q.a, t.q.a + t.q.dur), eo: rInOut(g, t.back.a, t.back.a + t.back.dur) });
const lerp3 = (a, b, e) => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * e);
const camOf = (t) => (g) => {
  const { eq, eo } = camE(t, g);
  const p = worldScr(RIG, lerp3(lerp3(T0, TQ, eq), TO, eo));
  const lz = mix(mix(Math.log(Z0), Math.log(ZQ), eq), Math.log(ZO), eo);
  return { ...aim(p[0], p[1]), z: Math.exp(lz) * (1 + 0.02 * rInOut(g, t.w.s0 - 20, t.end)) };
};
export const ruleCamWindows = (t) => [{ a: t.q.a, b: t.q.a + t.q.dur }, { a: t.back.a, b: t.back.a + t.back.dur }];
export const ruleSfx = (t) => [
  // NI 43-101 / 2001 fills on the nameplate
  { job: "label", a: t.name.a, b: t.name.b + 6, vol: 0.42 },
  // QUALIFIED PERSON fills; its key turns in the lock and the bolt clicks over
  { job: "label", a: t.plate1.a, b: t.plate1.b + 6, vol: 0.4 },
  { job: "mech", a: t.turn1.a, b: t.turn1.b, vol: 0.55 },
  { job: "click", a: t.turn1.b, vol: 0.75 },
  // INDEPENDENT fills; the second key turns
  { job: "label", a: t.plate2.a, b: t.plate2.b + 6, vol: 0.4 },
  { job: "mech", a: t.turn2.a, b: t.turn2.b, vol: 0.55 },
  { job: "click", a: t.turn2.b, vol: 0.75 },
  // the glass door swings open, the case's lamp comes on
  { job: "obj", a: t.open.a, b: t.open.b, k: "io", vol: 0.5 },
  { job: "ping", a: t.lamp.a + 4, vol: 0.5 }
];
/** the flare-2 source: the gold bar's lit crown, in place coordinates and with the place's camera applied (the composition's
 *  pushLight scale, DROP and stage parallax are added by the caller — see the handback for the measured screen point) */
export const ruleFlarePoint = (w, end, g) => {
  const t = ruleTimes(w, end), q = worldScr(RIG, barPoint(barXfOf(POSE), "crown")), c = camOf(t)(g);
  return { place: { x: q[0], y: q[1] }, cam: { x: 540 + c.z * (q[0] + c.x - 540), y: 883.2 + c.z * (q[1] + c.y - 883.2) } };
};
export const BxRule = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = ruleTimes(w, end);
  // a key turns a quarter turn (its bow from facing the lens to edge-on) with a firm detent: eased, a 3° settle as it seats
  const keyPhi = (k) => {
    const e = rInOut(f, k.a, k.b), dt = f - k.b;
    return 90 * e + (dt > 0 ? 3 * Math.exp(-dt / 4) * Math.sin(dt / 1.6) : 0);
  };
  const keys = [
    { phi: keyPhi(t.turn1), lit: rOut(f, t.turn1.b - 4, t.turn1.b + 10) },
    { phi: keyPhi(t.turn2), lit: rOut(f, t.turn2.b - 4, t.turn2.b + 10) }
  ];
  const plates = [{ text: L("ruleSeal"), on: rInOut(f, t.plate1.a, t.plate1.b) }, { text: L("ruleIndependent"), on: rInOut(f, t.plate2.a, t.plate2.b) }];
  const door = rInOut(f, t.open.a, t.open.b) + 0.012 * Math.sin(Math.PI * rLin(f, t.open.b, t.open.b + 10)) * (f > t.open.b ? 1 : 0);
  const lamp = rOut(f, t.lamp.a, t.lamp.b);
  const sheen = -0.8 + 1.5 * rInOut(f, at - 20, end);
  const casters = [{ corners: caseCorners(POSE) }];
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: camOf(t), children: jsx("div", { "data-probe-leaving": travelling(f, ruleCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -5, to: 3, amp: 0.7, children: [
    jsx("svg", { width: 1080, height: 1920, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(TkFloor, { id: "ruF", rig: RIG, at: { x: 540, z: 40 }, reach: 1300, casters, stage }) }),
    // ONE object for the probe: the bar stands inside the case behind its glass, the keys stand out of their locks over the plinth
    jsx("div", { "data-probe-object": "the two-key vitrine: the gold bar on its display block behind a locked glass door, two key locks with engraved plates, the nameplate", style: { position: "absolute", inset: 0 }, children: jsx(RuleCase, { id: "ruC", rig: RIG, pose: POSE, keys, plates, name: { lines: [{ text: L("ruleCode"), size: 34 }, { text: L("ruleYear"), size: 34 }], on: rInOut(f, t.name.a, t.name.b) }, door, lamp, sheen }) })
  ] }) }) }) });
};
