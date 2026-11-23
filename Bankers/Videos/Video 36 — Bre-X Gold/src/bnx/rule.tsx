// @ts-nocheck
// ★ V36 "Bre-X Gold" — place `rule` (builder C). "Since two thousand one, Canadian miners need a qualified expert's sign-off, and
//   often an independent one."
//   The hero drill core lies grey in its galvanised tray, the tray running away from the lens; its near end carries a steel end
//   plate (riveted to the end block, cantilevered on two gussets). Two cast-iron gooseneck embossing presses stand at that end,
//   one on each side, their heads reaching over the plate: the big one carries an engraved nameplate NI 43-101 / 2001 (ruleCode,
//   ruleYear) whose paint fills on "two thousand one". On "Canadian miners" the core's rim catches a cool light. On "qualified
//   expert's" the camera leans in to the big press; on "sign-off" its lever comes down and the die strikes the plate; it lifts,
//   and the plate carries a raised seal QUALIFIED PERSON (ruleSeal). On "often" the camera settles over the plate; on
//   "independent" the smaller press strikes beside it: INDEPENDENT (ruleIndependent). The composition's pushLight then carries
//   the frame into flare 2 at the first seal's lit rim (ruleFlarePoint).
//   Objects: the tray with its core, the big press, the small press (+ the plate they strike).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mix, rIn, rInOut, rLin, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { aim, travelling } from "./common";
import { L } from "./data";
import { Turn } from "./kit";
import { worldScr, xfApply, xfMul, xfRotY, xfScale, xfTrans } from "./tk_rig";
import { TkFloor } from "./tk_floor";
import { BX_FLOOR_Y, BxCore, BxTray, bxRig, coreXf, trayCoreY, trayCorners, trayRowZ } from "./bx_core";
import { EP, RulePlate, RulePress, plateCorners, pressCorners, sealRim } from "./rule_press";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const FY = BX_FLOOR_Y;
// the tray runs along z (its near end toward the lens): local x → world z
const ROWS = 3, HERO = 1, TLEN = 520, TZ = -160;
const TRAY_XF = xfMul(xfTrans([540, FY, TZ]), xfRotY(-90));
// the end plate: its inner edge 22 on the end block's top (outer face at TZ + TLEN/2 + 30), cantilevered toward the lens
const END_TOP = 2 * 32 * 0.78 + 10;   // bx_core TRAY.endH (the end block's top above the floor)
const PZ = TZ + TLEN / 2 + 30 - EP.onBlock + EP.d / 2;
const PT = -(END_TOP + EP.t);
const PLATE = xfTrans([540, FY + PT, PZ]);
// the seals on the plate (u along it): the big one (QUALIFIED PERSON), the smaller one beside it (INDEPENDENT)
const SEAL = { big: { u: -107, r: 78 }, small: { u: 127, r: 64 } };
// the presses: the big one left (reaching right), the small one right (reaching left, at 0.8)
const KS = 0.75;
const BIG = xfTrans([540 + SEAL.big.u - 190, FY, PZ]);
const SMALL = xfMul(xfTrans([540 + SEAL.small.u + 190 * KS, FY, PZ]), xfScale(KS));
// the camera: targets (world) and zooms — the whole set; in to the big press and its plate; over both seals
const T0 = [515, FY - 270, 40], TQ = [480, FY - 250, PZ], TB = [530, FY - 230, PZ];
const Z0 = 1.26, ZQ = 1.36, ZB = 1.4;
const ROW_CORES = [
  { seed: 13, pieces: [[0, 0.28, "saw", "break"], [0.282, 0.61, "break", "block"], [0.635, 1, "saw", "saw"]] },
  null,
  { seed: 29, pieces: [[0, 0.44, "saw", "break"], [0.443, 0.8, "break", "break"], [0.803, 1, "break", "saw"]] }
];
const KEYS = ["s0", "k2001", "canadian", "miners", "need", "qualified", "experts", "signoff", "often", "independent", "one"];
export const ruleTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`rule: the take has no word frame "${k}"`);
  const strike = (c) => ({ pull: { a: c - 15, b: c }, release: { a: c + 4, b: c + 20 }, contact: c });
  const t = {
    w,
    end,
    // NI 43-101 / 2001: the nameplate's paint fills on "two thousand one" (the place is still rising under the hero card's end)
    name: { a: w.k2001 - 4, b: w.k2001 + 14 },
    // the hero core's cool rim on "Canadian miners"
    core: { a: w.canadian - 8, b: w.miners + 4 },
    // in to the big press on "qualified expert's"
    q: { a: w.qualified - 18, dur: 32 },
    // the big press strikes ON "sign-off"; the small one just before the end of "independent" lands
    big: strike(w.signoff),
    small: strike(w.independent - 3),
    // over both seals on "often"
    both: { a: w.often - 6, dur: 34 }
  };
  if (t.q.a + t.q.dur > t.big.contact - 6) throw new Error("rule: the camera must be in on the press before its die strikes");
  if (t.small.release.b > end - 12) throw new Error(`rule: the small press must lift before the push into flare 2 (${t.small.release.b} vs ${end})`);
  if (t.both.a < t.big.release.a + 10) throw new Error("rule: the first seal is uncovered before the camera moves on (it stays in frame)");
  return t;
};
const strokeAt = (st, g) => g < st.release.a ? rIn(g, st.pull.a, st.pull.b) : 1 - rOut(g, st.release.a, st.release.b);
const camE = (t, g) => ({ eq: rInOut(g, t.q.a, t.q.a + t.q.dur), eb: rInOut(g, t.both.a, t.both.a + t.both.dur) });
const lerp3 = (a, b, e) => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * e);
// the rig: looking down the tray, steepening onto the plate as the camera leans in
const rigAt = (t, g) => {
  const { eq, eb } = camE(t, g);
  return bxRig({ cx: 540, cy: FY - 420, yaw: mix(mix(-7, -5, eq), -3, eb), pitch: mix(mix(-29, -31, eq), -33, eb), lens: 3200 });
};
const camOf = (t) => (g) => {
  const { eq, eb } = camE(t, g);
  const p = worldScr(rigAt(t, g), lerp3(lerp3(T0, TQ, eq), TB, eb));
  const lz = mix(mix(Math.log(Z0), Math.log(ZQ), eq), Math.log(ZB), eb);
  return { ...aim(p[0], p[1]), z: Math.exp(lz) * (1 + 0.025 * rInOut(g, t.w.s0 - 20, t.end)) };
};
export const ruleCamWindows = (t) => [{ a: t.q.a, b: t.q.a + t.q.dur }, { a: t.both.a, b: t.both.a + t.both.dur }];
export const ruleSfx = (t) => [
  // NI 43-101 / 2001 fill on the nameplate
  { job: "label", a: t.name.a, b: t.name.b + 6, vol: 0.42 },
  // the big press: the lever's run down (its mechanism), the die striking the plate, the lever springing back up
  { job: "mech", a: t.big.pull.a, b: t.big.pull.b, vol: 0.6 },
  { job: "thud", a: t.big.contact, vol: 0.85 },
  { job: "land", a: t.big.contact - 5, b: t.big.contact + 1, vol: 0.6 },
  { job: "click", a: Math.round(t.big.release.b - 2), vol: 0.5 },
  // the small press, lighter
  { job: "mech", a: t.small.pull.a, b: t.small.pull.b, vol: 0.45 },
  { job: "thud", a: t.small.contact, vol: 0.6 },
  { job: "click", a: Math.round(t.small.release.b - 2), vol: 0.4 }
];
/** the flare-2 source: the QUALIFIED PERSON seal's lit rim (its left, lens-ward arc catches the key light) — in place coordinates
 *  (rig) and with the place's camera applied; the composition's pushLight scale, DROP and stage parallax are added by the caller */
export const ruleFlarePoint = (w, end, g) => {
  const t = ruleTimes(w, end), q = worldScr(rigAt(t, g), sealRim(PLATE, SEAL.big.u, SEAL.big.r, 0.75 * Math.PI)), c = camOf(t)(g);
  return { place: { x: q[0], y: q[1] }, cam: { x: 540 + c.z * (q[0] + c.x - 540), y: 883.2 + c.z * (q[1] + c.y - 883.2) } };
};
export const BxRule = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = ruleTimes(w, end);
  const rig = rigAt(t, f);
  const sBig = strokeAt(t.big, f), sSmall = strokeAt(t.small, f);
  // a seal is pressed into the plate at the die's contact (it comes up under the die, then shows as the die lifts)
  const onBig = rLin(f, t.big.contact, t.big.contact + 3), onSmall = rLin(f, t.small.contact, t.small.contact + 3);
  const seal = String(L("ruleSeal")), sp = seal.indexOf(" ");
  const bigLines = sp > 0 ? [{ text: seal.slice(0, sp), size: 26 }, { text: seal.slice(sp + 1), size: 29 }] : [{ text: seal, size: 26 }];
  const ind = L("ruleIndependent");
  const cores = ROW_CORES.map((c) => c && { ...c });
  const heroXf = xfMul(TRAY_XF, coreXf(0, trayCoreY, trayRowZ(HERO, ROWS)));
  const lit = rInOut(f, t.core.a, t.core.b);
  const casters = [
    { corners: trayCorners(TRAY_XF, ROWS, TLEN) },
    { corners: plateCorners(PLATE), k: 0.5 },
    { corners: pressCorners(BIG, 1), k: 0.8 },
    { corners: pressCorners(SMALL, -1), k: 0.8 }
  ];
  const sheen = 30 * Math.sin((f - at) / 50);
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: camOf(t), children: jsx("div", { "data-probe-leaving": travelling(f, ruleCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -5, to: 3, amp: 0.7, children: [
    jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(TkFloor, { id: "ruF", rig, at: { x: 540, z: 60 }, reach: 1400, casters, stage }) }),
    // ONE object for the probe: the presses' heads and dies stand over the plate (and the plate on the tray's end) in depth,
    //   as they do — print and shapes of one assembled construction share one data-probe-object
    jsxs("div", { "data-probe-object": "the core tray with its hero core, its steel end plate, and the two embossing seal presses striking it", style: { position: "absolute", inset: 0 }, children: [
      jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: jsx(BxTray, { id: "ruT", rig, xf: TRAY_XF, rows: ROWS, len: TLEN, cores, hero: HERO, probe: null, heroEl: () => jsx(BxCore, { id: "ruH", rig, xf: heroXf, len: TLEN, seed: 5, lit, probe: null }) }) }),
      jsx(RulePlate, { id: "ruP", rig, pose: PLATE, seals: [
        { ...SEAL.big, lines: bigLines, on: onBig, inner: false },
        { ...SEAL.small, lines: ind ? [{ text: ind, size: 18 }] : [], on: onSmall, inner: false }
      ] }),
      jsx(RulePress, { id: "ruB", rig, pose: BIG, side: 1, s: sBig, pt: PT, dieR: SEAL.big.r + 3, sheen, name: { lines: [{ text: L("ruleCode"), size: 30 }, { text: L("ruleYear"), size: 28 }], on: rInOut(f, t.name.a, t.name.b) } }),
      jsx(RulePress, { id: "ruS", rig, pose: SMALL, side: -1, s: sSmall, pt: PT / KS, dieR: (SEAL.small.r + 3) / KS, sheen: -sheen })
    ] })
  ] }) }) }) });
};
