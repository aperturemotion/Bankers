// @ts-nocheck
// ★ V37 "Theranos" — place `crack` (builder C, REV 1: fully replaced — no pie). "But most tests ran on other companies'
//   machines, not the Edison." LightBreak 1 flashes on "But" (the composition's).
//   THE LAB LINE (crack_lab): a sample conveyor runs along the floor past the small Edison (builder B's th_edison) and into the
//   side of a big commercial lab analyser (unbranded). The belt is already running as the place arrives; nanotainers (builder H's
//   th_tube) ride it in blue carrier pucks, roll straight past the Edison — its slot stays dark — and go all the way in through the
//   analyser's brush-curtained port; every arrival steps the analyser's reagent carousel, pulses its beacon and adds a row to its
//   screen's test queue. 200+ TESTS OFFERED (crackTotal) lands under the stream on "tests"; the camera moves toward the analyser
//   and OTHER MACHINES (crackOthers) lands under it on "other companies'"; on "not the Edison" the camera travels back to the
//   Edison, centred: its screen lights its twelve result tiles (the SEC complaint's ~12 tests, crack_data) as EDISON: ~12 TESTS
//   (crackEdison) lands over it on "Edison".
//   Objects: the Edison, the conveyor with its tubes, the analyser (+ three labels).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { s3d, travelling } from "./common";
import { L } from "./data";
import { Turn, label } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { worldScr, xfPose } from "./tk_rig";
import { TkFloor } from "./tk_floor";
import { TK_FLOOR_Y } from "./tk_slab";
import { theme } from "./theme";
import { CT_PAINT } from "./counter_ink";
import { ED, Edison, edCorners } from "./th_edison";
import { ThTube } from "./th_tube";
import { AN, Analyser, BELT, Conveyor, ConveyorFront, PUCK, Puck, TUBE_H, tubeAt } from "./crack_lab";
import { EDISON_TESTS } from "./crack_data";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const FY = TK_FLOOR_Y;
const RIG = { cx: 540, cy: FY - 520, persp: 3200, yaw: 16, pitch: -22 };
// the Edison stands behind the belt, at 0.72 of claim2's size (the analyser beside it is the big machine)
const ED_K = 0.72;
const ED_X = 200, ED_Z = -150;
const ED_POSE = xfPose(ED_X, FY, ED_Z, ED_K);
if (ED.tiles !== EDISON_TESTS) throw new Error("crack: the Edison's screen must light exactly the SEC's ~12 tests");
// the belt: tubes every GAP units; its speed eases up from the place's first frame to SPEED units a frame
const GAP = 168, SPEED = 6.2;
const KEYS = ["s0", "most", "tests", "other", "companies", "machines", "edison"];
export const crackTimes = (w, end) => {
  for (const k of KEYS) if (!Number.isFinite(w[k])) throw new Error(`crack: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    // the belt runs from before the place arrives
    run: { a: w.s0 - 26, ramp: 24 },
    // 200+ TESTS OFFERED — fully read on "tests"
    total: { a: w.tests - 16, b: w.tests },
    // the camera moves toward the analyser on "other companies'"; OTHER MACHINES fully read on "companies'"
    toAn: { a: w.other - 8, dur: 30 },
    others: { a: w.companies - 16, b: w.companies },
    // back to the Edison on "not the …"; its twelve tiles light; EDISON: ~12 TESTS fully read on "Edison"
    toEd: { a: w.edison - 22, dur: 28 },
    tiles: { a: w.edison - 14, every: 1.6, d: 9 },
    edison: { a: w.edison - 16, b: w.edison }
  };
  if (t.toAn.a < t.total.b - 2) throw new Error("crack: 200+ TESTS OFFERED must read before the camera moves");
  if (t.toEd.a < t.others.b + 8) throw new Error("crack: OTHER MACHINES must read before the camera moves back");
  if (t.edison.b > end - 26) throw new Error("crack: EDISON: ~12 TESTS must read before the hand-over");
  return t;
};
// how far the belt has run by frame g (an eased start, then a constant speed)
const runAt = (t, g) => {
  const d = g - t.run.a;
  if (d <= 0) return 0;
  const r = t.run.ramp;
  return d < r ? SPEED * d * d / (2 * r) : SPEED * (d - r / 2);
};
const X_FIRST = -1150;
const tubesAt = (t, g) => {
  const D = runAt(t, g), out = [];
  for (let i = 0; i < 40; i++) {
    const x = X_FIRST + i * GAP + D;
    if (x > BELT.x1 + PUCK.r + 4) continue;
    if (x < BELT.x0 + 10) continue;
    out.push({ i, x });
  }
  return out;
};
// the frame each tube passes through the analyser's curtain (its centre at the face): the arrivals
const arrivals = (t) => {
  const out = [];
  for (let i = 0; i < 40; i++) {
    const need = BELT.x1 - (X_FIRST + i * GAP);
    if (need <= 0) continue;
    let g = t.run.a;
    while (runAt(t, g) < need && g < t.end + 40) g++;
    if (g > t.w.s0 - 20 && g < t.end - 4) out.push(g);
  }
  return out;
};
const scr = (q) => {
  const p = worldScr(RIG, q);
  return { x: p[0], y: p[1] };
};
// the screen boxes of the three objects at rest (place coordinates): every framing below is derived from them
const boxOf = (pts) => {
  const q = pts.map((p) => worldScr(RIG, p)), xs = q.map((p) => p[0]), ys = q.map((p) => p[1]);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
};
const corners = (cx, cz, w, d, y0, y1) => [-1, 1].flatMap((sx) => [-1, 1].flatMap((sz) => [y0, y1].map((y) => [cx + sx * w / 2, y, cz + sz * d / 2])));
const AN_BOX = boxOf(corners(AN.x, AN.z, AN.W, AN.D, FY, FY - AN.H - 30));
const ED_BOX = boxOf(edCorners(ED_POSE));
const ED_TOP = scr([ED_X, FY + ED.top * ED_K, ED_Z - ED.Zf * ED_K]);
const AN_FOOT = scr([AN.x + 60, FY, AN.z + AN.D / 2]);
const STREAM = scr([ED_X + 120, FY, BELT.z + BELT.w / 2 + 20]);
// the whole line centred (Edison to analyser); the analyser centred, its beacon clear of the caption band; the Edison centred
const REST = { x: (ED_BOX.x0 + AN_BOX.x1) / 2, y: (AN_BOX.y0 + Math.max(AN_BOX.y1, ED_BOX.y1)) / 2 + 100 };
// (a gentle lean toward the analyser: the Edison stays whole at the frame's left, the analyser's far side runs off the right)
const AN_AIM = { x: ED_BOX.x0 + (540 - 40) / 0.87, y: AN_BOX.y0 + (883 - 420) / 0.87 };
// (the analyser's top back-left corner — the highest point of it in the Edison framing — stays under the caption band)
const AN_CAP = scr([AN.x - AN.W / 2 - 6, FY - AN.H * 0.98 - 22, AN.z - AN.D / 2 - 6]);
const ED_AIM = { x: (ED_BOX.x0 + ED_BOX.x1) / 2, y: Math.min((ED_BOX.y0 + ED_BOX.y1) / 2 - 30, AN_CAP.y + (883 - 395) / 1.16) };
const LAB_TOTAL = { x: STREAM.x, y: STREAM.y + 40 };
const LAB_OTHERS = { x: AN_FOOT.x, y: AN_FOOT.y + 30 };
// the three labels stay whole in every framing that shows them (the eased-back line, the analyser, the Edison)
const LAB_EDISON = { x: (ED_BOX.x0 + ED_BOX.x1) / 2, y: ED_TOP.y - 96 };
const shots = (t) => [
  // the whole line: the stream, the Edison behind it, the analyser swallowing the tubes
  { a: -9999, z: 0.8, push: 0.03, at: still(REST.x, REST.y) },
  // toward the analyser as the voice names the other companies' machines
  { a: t.toAn.a, dur: t.toAn.dur, z: 0.87, push: 0.02, at: still(AN_AIM.x, AN_AIM.y) },
  // back to the Edison, centred, its tiles lighting
  { a: t.toEd.a, dur: t.toEd.dur, z: 1.16, push: 0.02, at: still(ED_AIM.x, ED_AIM.y) }
];
export const crackCamWindows = (t) => actionCamWindows(shots(t));
export const crackSfx = (t) => {
  const arr = arrivals(t);
  const tileEnd = Math.round(t.tiles.a + (EDISON_TESTS - 1) * t.tiles.every + t.tiles.d);
  return [
    // the belt carrying the tubes (a soft run under the stream while it is on screen)
    { job: "obj", a: t.w.s0 - 18, b: t.w.s0 + 18, k: "in", vol: 0.45 },
    // 200+ TESTS OFFERED
    { job: "label", a: t.total.a, b: t.total.b + 6, vol: 0.45 },
    // each tube pushing through the analyser's brush curtain (its first and later arrivals in the place)
    ...arr.slice(0, 4).map((g) => ({ job: "click", a: g, vol: 0.55 })),
    // OTHER MACHINES
    { job: "label", a: t.others.a, b: t.others.b + 6, vol: 0.45 },
    // the Edison's twelve tiles lighting
    { job: "data", a: Math.round(t.tiles.a), b: tileEnd, vol: 0.5 },
    // EDISON: ~12 TESTS
    { job: "label", a: t.edison.a, b: t.edison.b + 6, vol: 0.5 }
  ];
};
const Label = ({ x, y, w = 760, size, ink, on, text, probe }) => {
  if (on <= 3e-3) return null;
  return jsx("div", { "data-probe-object": probe, style: { position: "absolute", left: x - w / 2, top: y, width: w, textAlign: "center", opacity: on, transform: s3d(0, (1 - on) * 24) }, children: jsx("span", { style: label(size, ink), children: text }) });
};
// the floor alone, under a mask in the place root's own frame: it fades out over the root's off-screen margins, so as the place
//   pans in or out the floor's edge comes in soft — the root's clip would otherwise cut it as a hard vertical line
const MASK = "linear-gradient(to right, transparent 0px, #000 150px, #000 1210px, transparent 1360px)";
const FloorLayer = ({ cam, turn, children }) => jsx("div", { style: { position: "absolute", left: -140, top: -240, width: 1360, height: 2400, WebkitMaskImage: MASK, maskImage: MASK }, children: jsx("div", { style: { position: "absolute", left: 140, top: 240, width: 1080, height: 1920 }, children: jsx(CamFn, { at: cam, children: jsx(Turn, { ...turn, children }) }) }) });
const svg = (children, key) => jsx("svg", { width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children }, key);
export const BxCrack = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = crackTimes(w, end);
  const st = clamp01(stage);
  const D = runAt(t, f);
  const tubes = tubesAt(t, f).sort((a, b) => b.x - a.x);
  // the analyser answers each arrival: the carousel steps, the beacon pulses, a queue row lands
  const arr = arrivals(t);
  const past = arr.filter((g) => g <= f);
  const stepOf = (g) => rInOut(f, g + 2, g + 14);
  const rot = arr.reduce((s, g) => s + 360 / 22 * 2 * stepOf(g), 0);
  const beacon = arr.reduce((s, g) => Math.max(s, f >= g ? Math.exp(-(f - g) / 7) : 0), 0);
  const rows = 3 + arr.reduce((s, g) => s + rOut(f, g + 2, g + 12), 0);
  const tileAt = (i) => rInOut(f, t.tiles.a + i * t.tiles.every, t.tiles.a + i * t.tiles.every + t.tiles.d);
  const cam = actionCam(shots(t)), turn = { at, end, from: -4, to: 3, amp: 0.7 };
  const casters = [{ corners: edCorners(ED_POSE), k: 0.8 }];
  void past;
  return jsx(PlaceRoot, { children: [
    jsx(FloorLayer, { cam, turn, children: jsx(TkFloor, { id: "ckFl", rig: RIG, at: { x: 540, z: 40 }, reach: 1500, casters, stage: st, on: 1 - st }) }, "fl"),
    jsx(CamFn, { at: cam, children: jsx("div", { "data-probe-leaving": travelling(f, crackCamWindows(t)), style: { position: "absolute", inset: 0 }, children: jsxs(Turn, { ...turn, children: [
      jsxs("div", { "data-probe-object": "the lab line: the Edison behind the belt (its slot dark, its twelve tiles lighting on its word), the sample conveyor with its tubes, the analyser swallowing them", style: { position: "absolute", inset: 0 }, children: [jsx(Edison, {
        id: "ckEd",
        rig: RIG,
        pose: ED_POSE,
        tiles: tileAt,
        fill: tileAt,
        badge: { text: L("claim2Device"), on: 0.6 + 0.4 * rInOut(f, t.edison.a, t.edison.b), glow: 0.6 * rInOut(f, t.edison.a, t.edison.b) },
        led: 0
      }, "ed"),
        svg(jsx(Conveyor, { rig: RIG, belt: D }), "cv"),
        // far tubes first (the belt runs away from the lens toward the analyser)
        ...tubes.map((tb) => svg([
          jsx(Puck, { rig: RIG, x: tb.x, id: `ckP${tb.i}` }, "p"),
          jsx(ThTube, { id: `ckT${tb.i}`, ...tubeAt(RIG, tb.x), fill: 0.32, open: 0, lit: 0, stage: st }, "t")
        ], `t${tb.i}`)),
        svg(jsx(ConveyorFront, { rig: RIG }), "cf"),
        svg(jsx(Analyser, { id: "ckAn", rig: RIG, rot, beacon, rows }), "an")
      ] }),
      jsx(Label, { x: LAB_TOTAL.x, y: LAB_TOTAL.y, size: 44, ink: CT_PAINT, on: rOut(f, t.total.a, t.total.b), text: L("crackTotal"), probe: "200+ TESTS OFFERED" }),
      // (OTHER MACHINES is wholly off the frame's right once the camera is on the Edison; it is let go there, so the exit pan never
      //   carries it back across the frame into the incoming place)
      jsx(Label, { x: LAB_OTHERS.x, y: LAB_OTHERS.y, size: 46, ink: CT_PAINT, on: rOut(f, t.others.a, t.others.b) * (f > t.toEd.a + t.toEd.dur + 1 ? 0 : 1), text: L("crackOthers"), probe: "OTHER MACHINES" }),
      jsx(Label, { x: LAB_EDISON.x, y: LAB_EDISON.y, size: 50, ink: theme.accentBright, on: rOut(f, t.edison.a, t.edison.b), text: L("crackEdison"), probe: "EDISON: ~12 TESTS" })
    ] }) }) }, "obj")
  ] });
};
void TUBE_H;
