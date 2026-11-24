// @ts-nocheck
// ★ V37 "Theranos" — hook_lancet.tsx (builder H): THE LANCET — a pen-type lancing device held point-down above the nanotainer
//   (no hand, no finger), built as one turned solid through the hook's camera: a bevelled steel needle, a clear-white conical nose
//   cap, a knurled blue-steel depth ring with its tick marks, a graphite body with a ribbed grip, a blue-steel release button and
//   an end cap. The glossy drops hang from its tip.
//   <HookLancet cam tip={[x, y, z]} id />   tip = the needle's point (world); the device runs straight up from it
//   lancetTip(tip) → the tip (for the drop)
import * as jsx_runtime from "react/jsx-runtime";
import { rampAt } from "./solid_engine";
import { thLathe } from "./th_tube";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const { frameOf, turned, Grad, frontArc, streak, keyAngle, poly } = thLathe;
const STEEL = ["#1C2733", "#3A4C60", "#7C92AA", "#D6E1EC", "#FFFFFF"];
const NOSE = ["#4B5A6E", "#8394AA", "#BCC9D8", "#E9EFF6", "#FFFFFF"];
const RING = ["#0A1A30", "#15345C", "#2A5E9E", "#86AEDD", "#E4EEF9"];
const BODY = ["#07090D", "#11161D", "#1F2832", "#4E5D6E", "#B7C3D0"];
// the profile, s up from the needle's point: [s0, s1, r0, r1, ramp, part]
const PROFILE = [
  [0, 2.6, 0.08, 0.62, STEEL, "needle"],
  [2.6, 11, 0.62, 0.62, STEEL, "needle"],
  [11, 13, 2.2, 3.6, NOSE, "nose"],
  [13, 25, 3.6, 10.6, NOSE, "nose"],
  [25, 27, 11.6, 12.6, RING, "ring"],
  [27, 36, 12.6, 12.6, RING, "ring"],
  [36, 38, 12.6, 11.8, RING, "ring"],
  [38, 52, 11.8, 12.4, BODY, "body"],
  [52, 178, 13.2, 13.2, BODY, "body"],
  [178, 182, 13.2, 12.4, RING, "cap"],
  [182, 200, 12.4, 12.4, RING, "cap"]
];
export const HookLancet = ({ cam, tip, id = "hkL" }) => {
  const pr = {
    P: (q) => cam.P([q[0] + tip[0], q[1] + tip[1], q[2] + tip[2]]),
    facing: (q, n) => cam.facing([q[0] + tip[0], q[1] + tip[1], q[2] + tip[2]], n),
    light: cam.light,
    scale: cam.K(tip)
  };
  const fr = frameOf([0, 0, 0], [0, -1, 0], [0, 0, 1]);
  const sw = Math.max(0.4, 0.5 * pr.scale);
  const bands = PROFILE.map(([s0, s1, r0, r1, ramp, part], i) => {
    const g = turned(pr, fr, s0, s1, r0, r1, (l) => ({ c: rampAt(ramp, (part === "body" ? 0.72 : 0.86) * l + (part === "nose" ? 0.12 : 0.02)) }));
    return { g, i, s0, s1, r0, r1, part };
  });
  const kth = keyAngle(pr, fr);
  // the ribbed grip: rings round the body; the depth ring's knurl; the button
  const ribs = Array.from({ length: 11 }, (_, k) => 62 + k * 4.2);
  const knurl = [];
  for (let k = 0; k < 48; k++) {
    const th = k / 48 * 2 * Math.PI;
    if (pr.facing(fr.at(31, 12.7, th), fr.nrm(th)) <= 0.02) continue;
    const a = pr.P(fr.at(27.6, 12.7, th)), b = pr.P(fr.at(35.4, 12.7, th));
    knurl.push(`M${f2(a[0])},${f2(a[1])}L${f2(b[0])},${f2(b[1])}`);
  }
  const btn = (() => {
    const th = 0.3, pts = [];
    for (let k = 0; k < 28; k++) {
      const a = k / 28 * 2 * Math.PI, s = 124 + 13 * Math.sin(a), t = th + 0.32 * Math.cos(a);
      pts.push(pr.P(fr.at(s, 13.9, t)));
    }
    return poly(pts);
  })();
  const btnHi = streak(pr, fr, 0.12, 115, 133, 14.1, 10);
  return jsxs("g", { "data-probe-skip": true, children: [
    jsx("defs", { children: bands.map((b) => jsx(Grad, { id: `${id}b${b.i}`, g: b.g }, b.i)) }),
    // painted tip first: looking down on it, each part above sits over the one below
    bands.map((b) => jsx("path", { d: b.g.d, fill: `url(#${id}b${b.i})` }, b.i)),
    ribs.map((s, k) => jsx("path", { d: poly(frontArc(pr, fr, s, 13.25), false), stroke: "#000000", strokeWidth: sw * 0.9, opacity: 0.55, fill: "none" }, `r${k}`)),
    ribs.map((s, k) => jsx("path", { d: poly(frontArc(pr, fr, s + 0.9, 13.25), false), stroke: "#7D8FA3", strokeWidth: sw * 0.5, opacity: 0.35, fill: "none" }, `q${k}`)),
    jsx("path", { d: knurl.join(""), stroke: "#061428", strokeWidth: sw * 0.6, opacity: 0.6, fill: "none" }),
    [27, 36].map((s) => jsx("path", { d: poly(frontArc(pr, fr, s, 12.65), false), stroke: "#B9D2EE", strokeWidth: sw * 0.7, opacity: 0.6, fill: "none" }, `e${s}`)),
    jsx("path", { d: poly(frontArc(pr, fr, 25.2, 11.7), false), stroke: "#FFFFFF", strokeWidth: sw * 0.6, opacity: 0.5, fill: "none" }),
    jsx("path", { d: btn, fill: rampAt(RING, 0.6), stroke: "#061428", strokeWidth: sw * 0.6 }),
    jsx("path", { d: btnHi, stroke: "#E4EEF9", strokeWidth: sw * 1.4, opacity: 0.7, fill: "none", strokeLinecap: "round" }),
    // the key light's glints down the nose cone, the body and the needle
    jsx("path", { d: streak(pr, fr, kth + 0.3, 40, 176, 13.3, 20), stroke: "#C9D6E4", strokeWidth: sw * 1.8, opacity: 0.32, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d: streak(pr, fr, kth + 0.2, 1.5, 10.6, 0.66, 8), stroke: "#FFFFFF", strokeWidth: sw * 0.5, opacity: 0.9, fill: "none", strokeLinecap: "round" })
  ] });
};
