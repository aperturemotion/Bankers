// @ts-nocheck
// ★ V36 "Bre-X Gold" — place `collapse` (builder C). "Two days later, the shares sank to six cents. About forty thousand shareholders
//   were nearly wiped out."
//   Beat 1: the hook's gold bar (plain cast ingot) stands on the floor; beside it a heavy steel price tag hangs on its ring from a
//   machined T-stand, engraved C$6 BILLION (collapseFrom). The bar's studio sheen slides off its face; on "sank" it CRUMBLES from
//   the top into grey rock chunks and dust that fall into a pile at its foot (bx_bar crumble, true gravity); on "six cents" the
//   tag twists round on its ring to its back: 6¢ filled red (collapseTo) over MAY 6, 1997 (collapseDate), read ON "cents".
//   Beat 2: on "About forty thousand" the camera TRUCKS right (the rig's eye moves with it: the bar and tag parallax away) to a
//   standing wall of share certificates struck as steel plates (5 × 6, BRE-X gold-filled in each, label partnerBrex); its header
//   plate's engraving fills ~40,000 SHAREHOLDERS (collapseHolders) ON "shareholders", and the plates GO DARK row by row from the
//   top (the light out of each face, the gold drained from its stamp), the last row done on "wiped".
//   Objects: the bar, the tag (on its stand), the certificate wall — the film's one grid. Nothing overlaps anything else's print.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mix, rInOut, rLin } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { aim, travelling } from "./common";
import { L } from "./data";
import { Turn } from "./kit";
import { worldScr, xfApply, xfMul, xfScale, xfTrans } from "./tk_rig";
import { TkFloor } from "./tk_floor";
import { BX_FLOOR_Y, bxRig } from "./bx_core";
import { BAR, BxBar, barDims } from "./bx_bar";
import { CW, CollapseTag, CollapseWall, tagCorners, tagXfOf, standCorners, wallCorners } from "./collapse_set";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const FY = BX_FLOOR_Y;
// the set, left to right: the bar, the tag on its stand (beat 1, one framing) — and a frame-width to the right, the certificate
//   wall (beat 2). The camera TRUCKS across on "About forty thousand": the rig's eye moves with it, so the near bar and tag
//   parallax away as the wall comes in square to the lens.
const K = 0.62;
const BX = 330, BZ = 40;
const BAR_XF = xfMul(xfTrans([BX, FY - K * BAR.H / 2, BZ]), xfScale(K));
const STAND = xfTrans([712, FY, -110]);
const WX = 1460, WZ = -80;
const WALL = xfTrans([WX, FY, WZ]);
// the camera's targets (world points) and zooms: the bar and tag; in a touch on "the shares"; the wall's plates
const T1 = [521, FY - 320, 0], T1N = [521, FY - 300, 20], T2 = [WX, FY - 400, WZ];
const Z1 = 1.16, Z1N = 1.21, Z2 = 1.19;
// the crumble runs linearly over CRUMBLE frames (so bx_bar's chunks fall with true gravity)
const CRUMBLE = 56;
const KEYS = ["s0", "days", "shares", "sank", "k6", "cents", "s1", "about", "k40000", "shareholders", "nearly", "wiped"];
export const collapseTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`collapse: the take has no word frame "${k}"`);
  const crumble = { a: w.sank - 6, b: w.sank - 6 + CRUMBLE };
  // the plates go dark row by row from "shareholders", the last row done by "wiped" (+ its own 14 f)
  const d0 = w.shareholders - 2, step = Math.max(5, Math.min(10, (w.wiped + 3 - 14 - d0) / (CW.rows - 1)));
  const t = {
    w,
    end,
    // the studio sheen slides across the bar's face and off it just as the top breaks
    sheen: { a: w.s0 - 26, b: crumble.a },
    crumble,
    // the tag twists round to its back: 6¢ read ON "cents"
    flip: { a: w.cents - 20, b: w.cents - 2 },
    // in a touch on "the shares", holding the bar and the tag
    near: { a: w.shares - 12, dur: 30 },
    // the truck across to the wall of certificates on "About forty thousand"
    pan: { a: w.s1 - 8, dur: 38 },
    // ~40,000 SHAREHOLDERS: the header's paint fills, read ON "shareholders"
    head: { a: w.shareholders - 14, b: w.shareholders },
    dark: Array.from({ length: CW.rows }, (_, i) => ({ a: d0 + i * step, b: d0 + i * step + 14 }))
  };
  if (t.flip.a < t.crumble.a) throw new Error("collapse: the tag turns after the bar has begun to crumble");
  if (t.dark[CW.rows - 1].b > end - 4) throw new Error(`collapse: the last row must be dark before the place leaves (${t.dark[CW.rows - 1].b} vs ${end})`);
  if (t.pan.a < t.flip.b + 8) throw new Error("collapse: 6¢ must read before the camera trucks away");
  if (t.head.a < t.pan.a + t.pan.dur * 0.6) throw new Error("collapse: the header fills once the wall is in frame");
  return t;
};
const camE = (t, g) => ({ e1: rInOut(g, t.near.a, t.near.a + t.near.dur), e2: rInOut(g, t.pan.a, t.pan.a + t.pan.dur) });
const lerp3 = (a, b, e) => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * e);
const targetAt = (t, g) => {
  const { e1, e2 } = camE(t, g);
  return lerp3(lerp3(T1, T1N, e1), T2, e2);
};
// the rig's eye rides with the target (a truck, not a swing): the wall arrives square to the lens
const rigAt = (t, g) => bxRig({ cx: targetAt(t, g)[0], cy: FY - 600, yaw: -8, pitch: -10, lens: 3200 });
const camOf = (t) => (g) => {
  const { e1, e2 } = camE(t, g);
  const p = worldScr(rigAt(t, g), targetAt(t, g));
  const lz = mix(mix(Math.log(Z1), Math.log(Z1N), e1), Math.log(Z2), e2);
  return { ...aim(p[0], p[1]), z: Math.exp(lz) * (1 + 0.02 * rInOut(g, t.w.s0 - 20, t.end)) };
};
export const collapseCamWindows = (t) => [{ a: t.near.a, b: t.near.a + t.near.dur }, { a: t.pan.a, b: t.pan.a + t.pan.dur }];
export const collapseSfx = (t) => [
  // the top breaks off and the bar comes down into grey rock
  { job: "obj", a: t.crumble.a, b: t.crumble.a + 26, k: "in", vol: 0.6 },
  { job: "thud", a: t.crumble.a + 12, vol: 0.55 },
  { job: "thud", a: t.crumble.a + 30, vol: 0.4 },
  { job: "land", a: t.crumble.b - 8, b: t.crumble.b + 4, vol: 0.7 },
  // the tag twists round on its ring and settles: 6¢
  { job: "obj", a: t.flip.a, b: t.flip.b, k: "io", vol: 0.42 },
  { job: "verdict", a: t.flip.b - 8, b: t.flip.b + 2, vol: 0.65 },
  // ~40,000 SHAREHOLDERS fills on the header plate
  { job: "label", a: t.head.a, b: t.head.b + 6, vol: 0.4 },
  // each row of certificates goes dark (a relay's click as its light goes out)
  ...t.dark.map((d) => ({ job: "click", a: Math.round(d.a + 5), vol: 0.32 }))
];
// the bar while it crumbles: its remaining body for the floor's shadow (from the broken top to the foot)
const barShadowCorners = (c) => {
  const d = barDims(1), w = d.qb + d.c, h = d.qh + d.c, top = -d.len / 2 + Math.min(0.985, clamp01(c)) * d.len, out = [];
  for (const x of [-w, w]) for (const y of [top, d.len / 2]) for (const z of [-h, h]) out.push(xfApply(BAR_XF, [x, y, z]));
  return out;
};
const ROW_WAVE = 1.4;
export const BxCollapse = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = collapseTimes(w, end);
  const rig = rigAt(t, f);
  const crumble = rLin(f, t.crumble.a, t.crumble.b);
  const sheen = -1.25 + 3.6 * rInOut(f, t.sheen.a, t.sheen.b);
  // the tag: a slow idle twist and sway from the first frame, the turn to its back, a damped settle on its ring
  const pf = rInOut(f, t.flip.a, t.flip.b), dt = f - t.flip.b;
  const settle = dt > 0 ? 7 * Math.exp(-dt / 7) * Math.sin(dt / 2.6) : 0;
  const turn = 9 * Math.sin((f - at) / 46) + 180 * pf + settle;
  const sway = 1.1 * Math.sin((f - at) / 61) + 2.4 * Math.sin(Math.PI * pf);
  const lit = (i, j) => 1 - rInOut(f, t.dark[i].a + j * ROW_WAVE, t.dark[i].b + j * ROW_WAVE);
  const front = (() => {
    const s = String(L("collapseFrom")), k = s.indexOf(" ");
    return k > 0 ? [{ text: s.slice(0, k), size: 104 }, { text: s.slice(k + 1), size: 42 }] : [{ text: s, size: 96 }];
  })();
  const back = [{ text: L("collapseTo"), size: 150 }, { text: L("collapseDate"), size: 28, gap: 2 }];
  const txf = tagXfOf(STAND, turn, sway);
  const casters = [
    ...(crumble < 0.985 ? [{ corners: barShadowCorners(crumble), k: 1 - crumble * 0.6 }] : []),
    { corners: standCorners(STAND), k: 0.35 },
    { corners: tagCorners(txf), k: 0.6 },
    { corners: wallCorners(WALL), k: 0.8 }
  ];
  const svg = (el) => jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: el });
  return jsx(PlaceRoot, { children: jsx(CamFn, { at: camOf(t), children: jsx("div", { "data-probe-leaving": travelling(f, collapseCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { at, end, from: -5, to: 4, amp: 0.8, children: [
    svg(jsx(TkFloor, { id: "clF", rig, at: { x: 900, z: -60 }, reach: 1900, casters, stage })),
    jsx("div", { "data-probe-object": "the certificate wall: a machined frame of steel share certificates struck BRE-X, its engraved header plate", style: { position: "absolute", inset: 0 }, children: jsx(CollapseWall, { id: "clW", rig, pose: WALL, lit, stamp: L("partnerBrex"), head: L("collapseHolders"), headOn: rInOut(f, t.head.a, t.head.b), sheen: -1 + 2 * rLin(f, at - 30, end) }) }),
    jsx("div", { "data-probe-object": "the price tag hanging on its machined stand", style: { position: "absolute", inset: 0 }, children: jsx(CollapseTag, { id: "clT", rig, pose: STAND, turn, sway, front, back }) }),
    jsx(BxBar, { id: "clB", rig, xf: BAR_XF, m: 1, gold: 1, seed: 5, crumble, crumbleFrames: CRUMBLE, sheen, probe: "the gold bar crumbling from the top into grey rock, dust and a pile" })
  ] }) }) }) });
};
