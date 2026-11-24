// @ts-nocheck
// ★ V37 "Theranos" — hook_lancet.tsx (builder H): THE LANCET PEN — a real lancing device held point-down above the nanotainer
//   (no hand, no finger), built as one turned solid through the hook's camera. ★ REV1 (Timur: "add more detail to the pen … make it
//   a lot more detailed and a lot more eye-catching"). From the point up:
//     · the bevelled steel needle, standing out of the disposable lancet's blue moulded hub, seen THROUGH
//     · the clear tip cap (frosted cone, Fresnel edges, its opening ring and two specular streaks),
//     · the blue anodised depth-adjustment ring: knurled top and bottom bands, the depths 1–5 printed round it (set on the
//       cylinder, foreshortened), a chrome indicator notch on the ring above pointing at the setting,
//     · chrome joint rings,
//     · the graphite rubber grip with a diamond knurl (two families of helices),
//     · the pearl-white barrel: a slotted window with the steel drive spring visible inside, the chrome-ringed blue release
//       button, brand-free printed marks (scale ticks, fine-print rows, a drop icon),
//     · a chrome band, the upper barrel, and the ribbed cocking plunger with its chrome collar and end cap.
//   One key light from the upper left: every band sampled round its circumference; a specular glint TRAVELS down the pen (g).
//   <HookLancet cam tip={[x, y, z]} g id />   tip = the needle's point (world); the device runs straight up from it
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { rampAt } from "./solid_engine";
import { SHOUT } from "./fonts";
import { thLathe } from "./th_tube";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const { frameOf, turned, Grad, frontArc, streak, keyAngle, poly } = thLathe;
const STEEL = ["#1C2733", "#3A4C60", "#7C92AA", "#D6E1EC", "#FFFFFF"];
const CHROME = ["#0C1420", "#2B3D55", "#8FA6C2", "#E6EFF9", "#FFFFFF"];
const HUB = ["#06204A", "#0F4796", "#2A6FC8", "#7FB0EA", "#DDEBFA"];
const RING = ["#071731", "#103262", "#245CA3", "#79A7DF", "#DCE9F8"];
const GRIP = ["#05070A", "#0D1117", "#1A222C", "#3E4B5B", "#9CA9B8"];
const PEARL = ["#4E5D72", "#8B9BB1", "#C4D0DF", "#EAF0F7", "#FFFFFF"];
const INK = "#0E2747";
// the profile, s up from the needle's point: [s0, s1, r0, r1, ramp, part]
const PROFILE = [
  [0, 2.6, 0.08, 0.62, STEEL, "needle"],
  [2.6, 12, 0.62, 0.62, STEEL, "needle"],
  [9, 23, 2.5, 2.5, HUB, "hub"],
  [9, 12, 3.3, 4.2, null, "cap"],
  [12, 24.5, 4.2, 10.4, null, "cap"],
  [24.5, 27, 10.4, 11.2, null, "cap"],
  [27, 38, 12.4, 12.4, RING, "ring"],
  [38, 40.5, 12.9, 12.9, CHROME, "chrome"],
  [40.5, 80, 12.7, 12.7, GRIP, "grip"],
  [80, 82.5, 13.1, 13.1, CHROME, "chrome"],
  [82.5, 150, 13, 13, PEARL, "barrel"],
  [150, 153.5, 13.35, 13.35, CHROME, "chrome"],
  [153.5, 196, 13, 13, PEARL, "barrel"],
  [196, 199.5, 11.4, 11.4, CHROME, "chrome"],
  [199.5, 214, 9.8, 9.8, GRIP, "plunger"],
  [214, 216.5, 9.8, 8.6, CHROME, "chrome"]
];
export const HookLancet = ({ cam, tip, g = 0, printOn = 1, id = "hkL" }) => {
  const pr = {
    P: (q) => cam.P([q[0] + tip[0], q[1] + tip[1], q[2] + tip[2]]),
    facing: (q, n) => cam.facing([q[0] + tip[0], q[1] + tip[1], q[2] + tip[2]], n),
    light: cam.light,
    scale: cam.K(tip)
  };
  const fr = frameOf([0, 0, 0], [0, -1, 0], [0, 0, 1]);
  const sw = Math.max(0.35, 0.5 * pr.scale);
  const P = (s, r, th) => pr.P(fr.at(s, r, th));
  const fac = (s, r, th) => pr.facing(fr.at(s, r, th), fr.nrm(th));
  const kth = keyAngle(pr, fr);
  // ── the turned bands ──
  const clearShade = (l, e) => ({ c: mixHex("#A9C3E2", "#F4F8FD", clamp01((l - 0.3) / 0.8)), a: 0.1 + 0.55 * Math.pow(e, 4) + 0.18 * clamp01(l - 0.8) });
  const bands = PROFILE.map(([s0, s1, r0, r1, ramp, part], i) => {
    const shade = part === "cap" ? clearShade : (l) => ({ c: rampAt(ramp, part === "chrome" ? Math.min(1, 1.15 * l * l + 0.02) : part === "grip" || part === "plunger" ? 0.7 * l + 0.02 : 0.86 * l + 0.04) });
    return { g: turned(pr, fr, s0, s1, r0, r1, shade), i, part, s0, s1, r0, r1 };
  });
  const B = (i) => jsx("path", { d: bands[i].g.d, fill: `url(#${id}b${i})` }, `b${i}`);
  const arcAt = (s, r, nT = 0) => poly(frontArc(pr, fr, s, r, 72, nT), false);
  // ── the depth ring: knurl bands, printed depths, the indicator ──
  const knurl = [];
  for (const [a, b] of [[27.4, 30], [35, 37.6]]) for (let k = 0; k < 60; k++) {
    const th = k / 60 * 2 * Math.PI;
    if (fac(31, 12.5, th) <= 0.05) continue;
    const p = P(a, 12.5, th), q = P(b, 12.5, th);
    knurl.push(`M${f2(p[0])},${f2(p[1])}L${f2(q[0])},${f2(q[1])}`);
  }
  const depthGlyphs = ["1", "2", "3", "4", "5"].map((ch, i) => {
    const th = (2 - i) * 0.62, sm = 32.5, r = 12.48;
    const c = P(sm, r, th), dt = 0.01, pa = P(sm, r, th + dt), pb = P(sm, r, th - dt);
    const ux = (pb[0] - pa[0]) / (2 * dt * r), uy = (pb[1] - pa[1]) / (2 * dt * r);
    const pv = P(sm - 0.5, r, th), pw = P(sm + 0.5, r, th);
    return { ch, m: `matrix(${ux.toFixed(5)} ${uy.toFixed(5)} ${(pv[0] - pw[0]).toFixed(5)} ${(pv[1] - pw[1]).toFixed(5)} ${f2(c[0])} ${f2(c[1])})`, vis: fac(sm, r, th) > 0 ? clamp01((Math.cos(th - 0.05) - 0.1) / 0.3) : 0, sel: i === 2 };
  });
  const notch = (() => {
    const a = P(39.8, 13.0, 0.08), b = P(39.8, 13.0, -0.08), c = P(36.6, 12.5, 0);
    return poly([a, b, c]);
  })();
  // ── the grip's diamond knurl: two families of helices over the front half ──
  const helix = (th0, dir) => {
    const pts = [];
    for (let k = 0; k <= 24; k++) {
      const u = k / 24, s = 41.5 + 37.5 * u, th = th0 + dir * 1.9 * u;
      if (fac(s, 12.75, th) > 0.02) pts.push(P(s, 12.75, th));
      else if (pts.length) break;
    }
    return pts.length > 1 ? poly(pts, false) : "";
  };
  const knurlGrip = [];
  for (let k = 0; k < 30; k++) {
    const th0 = -Math.PI + k / 30 * 2 * Math.PI;
    knurlGrip.push(helix(th0, 1), helix(th0, -1));
  }
  // ── the spring window (a slot in the barrel's front) and the drive spring inside it ──
  const WIN = { s0: 87, s1: 107, th: 0.4 };
  const winPts = (r) => {
    // a stadium-shaped slot: straight edges along the barrel, rounded ends round it
    const hs = (WIN.s1 - WIN.s0) / 2, sc = (WIN.s0 + WIN.s1) / 2, pts = [];
    for (let k = 0; k <= 16; k++) {
      const a = -Math.PI / 2 + Math.PI * k / 16;
      pts.push(P(sc + hs * Math.sin(a), r, -WIN.th - 0.1 * Math.cos(a)));
    }
    for (let k = 0; k <= 16; k++) {
      const a = -Math.PI / 2 + Math.PI * k / 16;
      pts.push(P(sc - hs * Math.sin(a), r, WIN.th + 0.1 * Math.cos(a)));
    }
    return pts;
  };
  const winOk = fac((WIN.s0 + WIN.s1) / 2, 13, 0) > 0;
  // the drive spring through the slot: its coils cross the window as slanted bars (a helix seen through a narrow slot)
  const spring = (() => {
    const segs = [];
    for (let s0 = WIN.s0 + 1.2; s0 < WIN.s1 - 1; s0 += 2.3) {
      const pts = [];
      for (let k = 0; k <= 8; k++) {
        const th = -WIN.th - 0.05 + (2 * WIN.th + 0.1) * k / 8;
        pts.push(P(s0 + 1.1 * (th / WIN.th), 9.2, th));
      }
      segs.push(poly(pts, false));
    }
    return segs.join("");
  })();
  // ── the release button: a chrome bezel and a blue domed cap on the barrel's lit side ──
  const BTN = { s: 124, th: 0.3, hs: 8, ht: 0.34 };
  const btnRing = (rr, sc) => {
    const pts = [];
    for (let k = 0; k < 32; k++) {
      const a = k / 32 * 2 * Math.PI;
      pts.push(P(BTN.s + BTN.hs * sc * Math.sin(a), rr, BTN.th + BTN.ht * sc * Math.cos(a)));
    }
    return poly(pts);
  };
  const btnOk = fac(BTN.s, 13, BTN.th) > 0;
  // ── brand-free printed marks: depth scale ticks, fine-print rows, a drop icon ──
  const printRows = [];
  for (let k = 0; k < 6; k++) {
    const s = 140 - k * 3.6, th0 = -0.32, th1 = -0.32 - (0.28 + 0.22 * ((k * 37) % 5) / 4);
    if (fac(s, 13.02, (th0 + th1) / 2) > 0) {
      const pts = [];
      for (let q = 0; q <= 8; q++) pts.push(P(s, 13.02, th0 + (th1 - th0) * q / 8));
      printRows.push(poly(pts, false));
    }
  }
  const ticks = [];
  for (let k = 0; k <= 10; k++) {
    const th = -0.25 - k * 0.07, s0 = 146, s1 = k % 5 === 0 ? 142.6 : 144.4;
    if (fac(s0, 13.02, th) > 0) {
      const a = P(s0, 13.02, th), b = P(s1, 13.02, th);
      ticks.push(`M${f2(a[0])},${f2(a[1])}L${f2(b[0])},${f2(b[1])}`);
    }
  }
  const dropIcon = (() => {
    const c = P(115, 13.02, -0.55), k = pr.scale;
    if (fac(115, 13.02, -0.55) <= 0) return "";
    const r = 2.1 * k, x = c[0], y = c[1];
    return `M${f2(x)},${f2(y - 2.4 * r)}C${f2(x + 0.5 * r)},${f2(y - 1.4 * r)} ${f2(x + r)},${f2(y - 0.6 * r)} ${f2(x + r)},${f2(y)}A${f2(r)},${f2(r)} 0 0 1 ${f2(x - r)},${f2(y)}C${f2(x - r)},${f2(y - 0.6 * r)} ${f2(x - 0.5 * r)},${f2(y - 1.4 * r)} ${f2(x)},${f2(y - 2.4 * r)}Z`;
  })();
  // ── the plunger's ribs ──
  const ribs = Array.from({ length: 6 }, (_, k) => 201.5 + k * 2.1);
  // the travelling glint: a bright segment running down the lit side from the plunger to the tip, every 70 frames
  const cyc = ((g % 70) + 70) % 70 / 70, gs = 230 - 250 * cyc;
  const glint = (s0, s1, r) => {
    const a = Math.max(s0, gs - 14), b = Math.min(s1, gs + 14);
    return b > a ? streak(pr, fr, kth + 0.18, a, b, r, 8) : "";
  };
  return jsxs("g", { "data-probe-skip": true, children: [
    jsx("defs", { children: bands.map((b) => jsx(Grad, { id: `${id}b${b.i}`, g: b.g }, b.i)) }),
    // painted tip first: looking down on it, each part above sits over the one below; the hub inside the clear cap first
    B(0), B(1), B(2),
    jsx("path", { d: streak(pr, fr, kth + 0.1, 9.5, 22.5, 2.55, 8), stroke: "#CFE3FB", strokeWidth: sw * 0.9, opacity: 0.8, fill: "none", strokeLinecap: "round" }),
    B(3), B(4), B(5),
    // the clear cap: its opening ring, the hub's shoulder seen through it, the specular streaks down the cone
    jsx("path", { d: arcAt(9.1, 3.3), stroke: "#EAF3FD", strokeWidth: sw * 0.8, opacity: 0.8, fill: "none" }),
    jsx("path", { d: arcAt(23, 2.5), stroke: "#9FC5F2", strokeWidth: sw * 0.6, opacity: 0.6, fill: "none" }),
    jsx("path", { d: streak(pr, fr, kth + 0.25, 13, 26, 10.5, 10).length ? (() => {
      const pts = [];
      for (let k = 0; k <= 10; k++) {
        const s = 12.5 + 12 * k / 10, r = 4.2 + (10.4 - 4.2) * (s - 12) / 12.5;
        pts.push(P(s, r + 0.05, kth + 0.25));
      }
      return poly(pts, false);
    })() : "", stroke: "#FFFFFF", strokeWidth: sw * 1.4, opacity: 0.75, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d: arcAt(26.9, 11.2), stroke: "#F4F8FD", strokeWidth: sw * 0.9, opacity: 0.7, fill: "none" }),
    // the depth ring
    B(6),
    jsx("path", { d: knurl.join(""), stroke: "#04122A", strokeWidth: sw * 0.55, opacity: 0.65, fill: "none" }),
    [27.2, 30.3, 34.7, 37.8].map((s) => jsx("path", { d: arcAt(s, 12.45), stroke: "#A9C8EE", strokeWidth: sw * 0.5, opacity: 0.55, fill: "none" }, `e${s}`)),
    depthGlyphs.map((d, i) => d.vis > 0.01 && jsx("text", { transform: d.m, x: 0, y: 0, textAnchor: "middle", dominantBaseline: "central", style: { fontFamily: SHOUT, fontSize: 4.1 }, fill: d.sel ? "#FFFFFF" : "#BFD6F2", opacity: d.vis * (d.sel ? 1 : 0.85) * printOn, children: d.ch }, `n${i}`)),
    // chrome joint, the grip and its knurl
    B(7),
    jsx("path", { d: notch, fill: "#FFFFFF", opacity: 0.9 }),
    B(8),
    jsx("path", { d: knurlGrip.join(""), stroke: "#000000", strokeWidth: sw * 0.55, opacity: 0.6, fill: "none" }),
    jsx("path", { d: streak(pr, fr, kth + 0.3, 41, 79.5, 12.8, 14), stroke: "#8D9DB0", strokeWidth: sw * 2.2, opacity: 0.35, fill: "none", strokeLinecap: "round" }),
    B(9),
    // the barrel: the spring window, the button, the printed marks
    B(10),
    winOk && jsx("path", { d: poly(winPts(13.02)), fill: "#0A1420" }),
    winOk && jsx("path", { d: poly(winPts(12.2)), fill: "#152233", opacity: 0.85 }),
    winOk && jsx("path", { d: spring, stroke: "#050B14", strokeWidth: sw * 1.9, fill: "none", transform: `translate(${f2(0.5 * sw)} ${f2(0.9 * sw)})` }),
    winOk && jsx("path", { d: spring, stroke: "#B9C9DC", strokeWidth: sw * 1.3, fill: "none", strokeLinecap: "round" }),
    winOk && jsx("path", { d: spring, stroke: "#FFFFFF", strokeWidth: sw * 0.45, opacity: 0.8, fill: "none", transform: `translate(${f2(-0.3 * sw)} ${f2(-0.4 * sw)})` }),
    winOk && jsx("path", { d: poly(winPts(13.04)), fill: "none", stroke: "#56677D", strokeWidth: sw * 0.7 }),
    btnOk && jsx("path", { d: btnRing(13.4, 1.2), fill: rampAt(CHROME, 0.75), stroke: "#26374D", strokeWidth: sw * 0.5 }),
    btnOk && jsx("path", { d: btnRing(14.2, 0.92), fill: rampAt(HUB, 0.62) }),
    btnOk && jsx("path", { d: btnRing(14.5, 0.5), fill: rampAt(HUB, 0.85), opacity: 0.8 }),
    jsx("path", { d: printRows.join(""), stroke: "#7D8DA3", strokeWidth: sw * 0.8, opacity: 0.8, fill: "none" }),
    jsx("path", { d: ticks.join(""), stroke: INK, strokeWidth: sw * 0.45, opacity: 0.6, fill: "none" }),
    dropIcon && jsx("path", { d: dropIcon, fill: "#C21A2F", opacity: 0.85 }),
    B(11), B(12), B(13), B(14),
    ribs.map((s, k) => jsx("path", { d: arcAt(s, 9.85), stroke: "#000000", strokeWidth: sw * 0.7, opacity: 0.6, fill: "none" }, `r${k}`)),
    B(15),
    // the chrome rings' crisp lit lips, the barrel's long specular, and the travelling glint
    [38.1, 80.1, 150.1, 196.1].map((s) => jsx("path", { d: arcAt(s, 13.2), stroke: "#FFFFFF", strokeWidth: sw * 0.9, opacity: 0.75, fill: "none" }, `c${s}`)),
    jsx("path", { d: streak(pr, fr, kth + 0.32, 84, 195, 13.05, 24), stroke: "#FFFFFF", strokeWidth: sw * 2.2, opacity: 0.55, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d: streak(pr, fr, kth + Math.PI - 0.5, 84, 195, 13.05, 24), stroke: "#DCE7F4", strokeWidth: sw * 1.0, opacity: 0.25, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d: [glint(82, 196, 13.1), glint(40, 80, 12.8), glint(27, 38, 12.5)].join(""), stroke: "#FFFFFF", strokeWidth: sw * 3.2, opacity: 0.85, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d: streak(pr, fr, kth + 0.2, 1.5, 11.6, 0.66, 8), stroke: "#FFFFFF", strokeWidth: sw * 0.5, opacity: 0.95, fill: "none", strokeLinecap: "round" })
  ] });
};
