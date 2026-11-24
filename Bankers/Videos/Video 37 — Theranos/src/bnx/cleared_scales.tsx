// @ts-nocheck
// ★ V37 "Theranos" — builder F, place `cleared`: THE SCALES OF JUSTICE, built as a real equal-arm balance (no figure, no person):
//   • a stepped, machined steel BASE (a deep plinth with a chamfered top and a toe, a second step, screws) and a turned foot;
//   • a turned COLUMN (base mouldings, a long shaft with fine flutes, a necking ring, a capital) carrying the PIVOT HEAD (a turned
//     drum the beam passes through, a boss on its front face);
//   • the BEAM: one tapered steel bar, thickest at the pivot, with a turned knob and a hanging eye at each end, and a POINTER that
//     hangs from the pivot over an engraved arc plate fixed to the column (the pointer reads the tilt, as on a real balance);
//   • two PANS (turned shallow dishes: a rolled rim, a recessed inside) each hung from its beam eye by THREE CHAINS of real links
//     (alternate links face-on and edge-on) meeting at a ring over the pan.
//   The pans hang plumb from the beam's eyes whatever its tilt. Scales-local frame: x right, y DOWN (floor 0), z toward the lens.
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01 } from "./anim";
import { prism, rampAt } from "./solid_engine";
import { mapPath, paintXf, rrectPts, worldScr, worldView, wound, xfApply, xfMul, xfRotZ, xfTrans } from "./tk_rig";
import { PL_BODY, PL_PLATE, PL_STEEL } from "./counter_mat";
import { Turned } from "./verdict_turned";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const D = (pts, close = true) => `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}${close ? "Z" : ""}`;
export const SC = { arm: 316, pivotY: -800, chainL: 330, panR: 132, base: { w: 440, h: 46, d: 300 }, step: { w: 320, h: 30, d: 220 } };
const Y_STEP = -SC.base.h - SC.step.h;          // the second step's top
let memo = null;
const pz = (poly, d, bev, w0) => wound(prism(poly, d, bev, 0, 1, () => false, [0, 0, w0]));
const parts = () => {
  if (memo) return memo;
  const B = SC.base, S = SC.step;
  const toe = pz(rrectPts(B.w + 18, 10, 3, 2, 0, -5), B.d + 18, 3, 0);
  const plinth = pz(rrectPts(B.w, B.h - 10, 6, 3, 0, -10 - (B.h - 10) / 2), B.d, 9, 0);
  const step = pz(rrectPts(S.w, S.h, 5, 3, 0, -B.h - S.h / 2), S.d, 7, 0);
  // the beam: a tapered bar (thick at the pivot), in its own plane (x along the arm, y down), 26 deep
  const L = SC.arm, taper = [[-L, -7], [-L * 0.55, -10], [-60, -15], [0, -17], [60, -15], [L * 0.55, -10], [L, -7], [L, 7], [L * 0.55, 10], [60, 15], [0, 19], [-60, 15], [-L * 0.55, 10], [-L, 7]];
  const beam = pz(taper, 26, 4, 0);
  // the arc plate behind the pointer (fixed to the column's front)
  const arc = [];
  for (let k = 0; k <= 16; k++) {
    const a = (-38 + 76 * k / 16) * Math.PI / 180;
    arc.push([168 * Math.sin(a), 168 * Math.cos(a)]);
  }
  for (let k = 16; k >= 0; k--) {
    const a = (-38 + 76 * k / 16) * Math.PI / 180;
    arc.push([112 * Math.sin(a), 112 * Math.cos(a)]);
  }
  const plate = pz(arc.reverse(), 6, 2, 0);
  memo = { toe, plinth, step, beam, plate };
  return memo;
};
const fillOf = (r, light, f) => rampAt(r, f.cap ? 0.62 * light + 0.06 : f.bev ? Math.min(1, 0.95 * light + 0.16) : 0.8 * light + 0.04);
const Paint = ({ faces, map, rig, ramp, spec = 0.5, dim = 0 }) => jsx(jsx_runtime.Fragment, { children: paintXf(faces, map, rig, spec).map((dw, k) => {
  const c = fillOf(ramp, dw.light * (1 - dim), dw.face);
  return jsx("path", { d: dw.d, fill: c, stroke: c, strokeWidth: 0.6, strokeLinejoin: "round" }, k);
}) });
// ── turned profiles (y ascending = downward) ─────────────────────────────────────────────────────────────────────────
const FOOT = [{ y: Y_STEP - 40, r: 0 }, { y: Y_STEP - 40, r: 44 }, { y: Y_STEP - 34, r: 52 }, { y: Y_STEP - 26, r: 52 }, { y: Y_STEP - 20, r: 62 }, { y: Y_STEP - 8, r: 78 }, { y: Y_STEP - 3, r: 84 }, { y: Y_STEP, r: 84 }, { y: Y_STEP, r: 0 }];
const COL_TOP = SC.pivotY + 46, COL_BOT = Y_STEP - 40;
const COLUMN = [{ y: COL_TOP, r: 0 }, { y: COL_TOP, r: 34 }, { y: COL_TOP + 6, r: 38 }, { y: COL_TOP + 14, r: 30 }, { y: COL_TOP + 22, r: 30 }, { y: COL_TOP + 26, r: 34 }, { y: COL_TOP + 32, r: 26 }, { y: COL_BOT - 60, r: 24 }, { y: COL_BOT - 44, r: 30 }, { y: COL_BOT - 36, r: 30 }, { y: COL_BOT - 30, r: 38 }, { y: COL_BOT - 12, r: 40 }, { y: COL_BOT, r: 44 }, { y: COL_BOT, r: 0 }];
const HEAD_Y = SC.pivotY;
// the pivot head: a horizontal drum on the column (built along y, then turned to face the lens)
const DRUM = [{ y: -26, r: 0 }, { y: -26, r: 30 }, { y: -22, r: 36 }, { y: 22, r: 36 }, { y: 26, r: 30 }, { y: 26, r: 0 }];
const BOSS = [{ y: 26, r: 0 }, { y: 26, r: 16 }, { y: 32, r: 18 }, { y: 38, r: 12 }, { y: 40, r: 0 }];
const FINIAL = [{ y: HEAD_Y - 92, r: 0 }, { y: HEAD_Y - 92, r: 6 }, { y: HEAD_Y - 84, r: 14 }, { y: HEAD_Y - 72, r: 16 }, { y: HEAD_Y - 62, r: 10 }, { y: HEAD_Y - 54, r: 9 }, { y: HEAD_Y - 46, r: 18 }, { y: HEAD_Y - 36, r: 22 }, { y: HEAD_Y - 36, r: 0 }];
const KNOB = [{ y: -14, r: 0 }, { y: -14, r: 8 }, { y: -8, r: 14 }, { y: 0, r: 15 }, { y: 8, r: 13 }, { y: 14, r: 0 }];
const PAN = [{ y: -3, r: 0 }, { y: -3, r: SC.panR }, { y: 2, r: SC.panR + 3 }, { y: 7, r: SC.panR }, { y: 16, r: SC.panR - 22 }, { y: 24, r: SC.panR - 52 }, { y: 28, r: SC.panR - 80 }, { y: 28, r: 0 }];
const RING_Y = -96;                      // the chains' ring, this far over the pan's rim
/** the beam's world transform (pivot at the scales' local (0, pivotY, 0), tilted θ°: + sinks the right end) */
const beamXf = (pose, th) => xfMul(pose, xfMul(xfTrans([0, SC.pivotY, 0]), xfRotZ(th)));
/** a beam end's eye (world): side −1 left, +1 right */
export const eyeOf = (pose, th, side) => xfApply(beamXf(pose, th), [side * (SC.arm - 6), 22, 0]);
/** a pan's rim centre (world) under its eye */
export const panOf = (pose, th, side) => {
  const e = eyeOf(pose, th, side);
  return [e[0], e[1] + SC.chainL, e[2]];
};
const Chain = ({ rig, a, b }) => {
  // links every 13 units, alternating face-on (an open oval) and edge-on (a short bar)
  const A = worldScr(rig, a), B = worldScr(rig, b);
  const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), n = Math.max(2, Math.round(len / 13));
  const dx = B[0] - A[0], dy = B[1] - A[1], sl = Math.hypot(dx, dy) || 1, ux = dx / sl, uy = dy / sl;
  const k = sl / Math.max(1, len);
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, cx = A[0] + dx * t, cy = A[1] + dy * t;
    const L2 = 9 * k, W2 = (i % 2 ? 1.6 : 4.4) * k;
    const ang = Math.atan2(uy, ux) * 180 / Math.PI;
    out.push(i % 2
      ? jsx("ellipse", { cx: f2(cx), cy: f2(cy), rx: f2(L2), ry: f2(W2), transform: `rotate(${ang.toFixed(2)} ${f2(cx)} ${f2(cy)})`, fill: rampAt(PL_STEEL, 0.55) }, i)
      : jsx("ellipse", { cx: f2(cx), cy: f2(cy), rx: f2(L2), ry: f2(W2), transform: `rotate(${ang.toFixed(2)} ${f2(cx)} ${f2(cy)})`, fill: "none", stroke: rampAt(PL_STEEL, 0.82), strokeWidth: f2(2.2 * k) }, i));
  }
  return jsx("g", { children: out });
};
/** the scales at `pose`, the beam tilted θ° */
export const Scales = ({ id, rig, pose, th, sheen = 0 }) => {
  const map = (q) => xfApply(pose, q);
  const P = (pts, close = true) => mapPath(map, rig, pts, close);
  const m = parts();
  const bx = beamXf(pose, th);
  const bmap = (q) => xfApply(bx, q);
  // the pivot drum faces the lens: its axis along z
  const drumXf = xfMul(pose, xfMul(xfTrans([0, HEAD_Y, 0]), { m: [1, 0, 0, 0, 0, -1, 0, 1, 0], t: [0, 0, 0] }));
  const plateMap = (q) => xfApply(pose, [q[0], HEAD_Y + q[1], q[2] + 30]);
  const ticks = Array.from({ length: 9 }, (_, k) => {
    const a = (-32 + 64 * k / 8) * Math.PI / 180, r0 = k === 4 ? 122 : 140, r1 = 160;
    return D([[r0 * Math.sin(a), r0 * Math.cos(a)], [r1 * Math.sin(a), r1 * Math.cos(a)]].map(([x, y]) => worldScr(rig, plateMap([x, y, 3.6]))), false);
  });
  // the pointer: from the pivot down, turning with the beam
  const pa = th * Math.PI / 180;
  const ptr = [0, 1].map((s) => s ? [-150 * Math.sin(pa), 150 * Math.cos(pa)] : [0, 0]).map(([x, y]) => worldScr(rig, map([x, HEAD_Y + y, 44])));
  const ptrBack = [[-6, 0], [6, 0], [1.2, 140]].map(([x, y]) => [x * Math.cos(pa) - y * Math.sin(pa), x * Math.sin(pa) + y * Math.cos(pa)]).map(([x, y]) => worldScr(rig, map([x, HEAD_Y + y, 44])));
  const sides = [-1, 1].map((side) => {
    const eye = eyeOf(pose, th, side), pan = panOf(pose, th, side), ring = [pan[0], pan[1] + RING_Y, pan[2]];
    const rim = [90, 210, 330].map((deg) => {
      const a = deg * Math.PI / 180;
      return { p: [pan[0] + (SC.panR - 6) * Math.cos(a), pan[1] - 1, pan[2] + (SC.panR - 6) * Math.sin(a)], front: Math.sin(a) > 0 };
    });
    return { side, eye, pan, ring, rim, knob: xfMul(bx, xfMul(xfTrans([side * (SC.arm + 4), 0, 0]), xfRotZ(90))) };
  });
  const Eye = (s) => {
    const c = worldScr(rig, s.eye), r = worldScr(rig, [s.eye[0] + 9, s.eye[1], s.eye[2]]);
    const rr = Math.abs(r[0] - c[0]);
    return jsx("ellipse", { cx: f2(c[0]), cy: f2(c[1] + rr * 0.6), rx: f2(rr * 0.6), ry: f2(rr * 1.2), fill: "none", stroke: rampAt(PL_STEEL, 0.8), strokeWidth: f2(rr * 0.42) });
  };
  const Ring = (s) => {
    const c = worldScr(rig, s.ring), r = worldScr(rig, [s.ring[0] + 11, s.ring[1], s.ring[2]]);
    const rr = Math.abs(r[0] - c[0]);
    return jsx("ellipse", { cx: f2(c[0]), cy: f2(c[1]), rx: f2(rr), ry: f2(rr * 0.42), fill: "none", stroke: rampAt(PL_STEEL, 0.85), strokeWidth: f2(rr * 0.35) });
  };
  const Pan = (s) => {
    const xf = xfTrans(s.pan);
    const inner = Array.from({ length: 48 }, (_, i) => worldScr(rig, [s.pan[0] + (SC.panR - 16) * Math.cos(i / 48 * 2 * Math.PI), s.pan[1] - 3.3, s.pan[2] + (SC.panR - 16) * Math.sin(i / 48 * 2 * Math.PI)]));
    const inner2 = Array.from({ length: 48 }, (_, i) => worldScr(rig, [s.pan[0] - 10 + (SC.panR - 54) * Math.cos(i / 48 * 2 * Math.PI), s.pan[1] - 3.3, s.pan[2] - 6 + (SC.panR - 54) * Math.sin(i / 48 * 2 * Math.PI)]));
    return jsxs("g", { children: [
      jsx(Turned, { id: `${id}pn${s.side}`, rig, xf, profile: PAN, ramp: PL_STEEL, spec: 0.9, n: 56 }),
      jsx("path", { d: D(inner), fill: rampAt(PL_STEEL, 0.36) }),
      jsx("path", { d: D(inner2), fill: rampAt(PL_STEEL, 0.5), opacity: 0.6 })
    ] });
  };
  const shadowOf = (cx, cz, r, op) => jsx("path", { d: P(Array.from({ length: 32 }, (_, i) => [cx + 14 + r * Math.cos(i / 32 * 2 * Math.PI), -0.5, cz - 18 + r * 0.8 * Math.sin(i / 32 * 2 * Math.PI)])), fill: "#000000", opacity: op, stroke: "#000000", strokeOpacity: 0.12, strokeWidth: 16, strokeLinejoin: "round" });
  const panShadow = (s) => {
    const lift = -(s.pan[1] - pose.t[1] + 28);
    const x = s.pan[0] - pose.t[0] + 0.5 * lift, z = s.pan[2] - pose.t[2] - 0.62 * lift;
    return shadowOf(x, z, SC.panR * 0.9, 0.14 / (1 + lift / 600));
  };
  const screws = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => [sx * (SC.base.w / 2 - 28), sz * (SC.base.d / 2 - 28)]));
  const sweep = -SC.base.w / 2 - 120 + (SC.base.w + 240) * clamp01(sheen);
  return jsxs("svg", { "data-probe-object": "the scales of justice: base, column, beam with its pointer, two pans on their chains", width: 1, height: 1, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: [
    // shadows on the floor: the base, and each pan's soft one (fainter the higher it hangs)
    shadowOf(10, -10, 250, 0.3),
    sides.map((s) => jsx("g", { children: panShadow(s) }, `sh${s.side}`)),
    jsx(Paint, { faces: m.toe, map, rig, ramp: PL_BODY, spec: 0.3, dim: 0.15 }),
    jsx(Paint, { faces: m.plinth, map, rig, ramp: PL_PLATE, spec: 0.6 }),
    jsx("path", { d: P([[sweep, -SC.base.h + 4, SC.base.d / 2 + 0.3], [sweep + 60, -SC.base.h + 4, SC.base.d / 2 + 0.3], [sweep + 50, -12, SC.base.d / 2 + 0.3], [sweep - 10, -12, SC.base.d / 2 + 0.3]]), fill: "#FFFFFF", opacity: sweep > -SC.base.w / 2 && sweep < SC.base.w / 2 - 60 ? 0.06 : 0 }),
    screws.map(([x, z], k) => jsx("path", { d: P(Array.from({ length: 14 }, (_, i) => [x + 6 * Math.cos(i / 14 * 2 * Math.PI), -SC.base.h - 0.4, z + 6 * Math.sin(i / 14 * 2 * Math.PI)])), fill: rampAt(PL_STEEL, 0.7), stroke: "#000000", strokeOpacity: 0.5, strokeWidth: 1.2 }, `sc${k}`)),
    jsx(Paint, { faces: m.step, map, rig, ramp: PL_STEEL, spec: 0.7, dim: 0.1 }),
    jsx(Turned, { id: `${id}ft`, rig, xf: pose, profile: FOOT, ramp: PL_STEEL, spec: 0.9, n: 56 }),
    // the back chains and the far halves first, then the column, the beam, the pointer, the near chains and the pans
    sides.flatMap((s) => s.rim.filter((r) => !r.front).map((r, k) => jsx(Chain, { rig, a: s.ring, b: r.p }, `cb${s.side}${k}`))),
    jsx(Turned, { id: `${id}co`, rig, xf: pose, profile: COLUMN, ramp: PL_STEEL, spec: 0.9, n: 48 }),
    // the column's flutes (fine vertical grooves on its front)
    [-0.5, -0.25, 0, 0.25, 0.5].map((a, k) => jsx("path", { d: P([[24 * Math.sin(a), COL_TOP + 40, 24 * Math.cos(a)], [24 * Math.sin(a), COL_BOT - 70, 24 * Math.cos(a)]], false), stroke: "#000000", strokeOpacity: 0.22, strokeWidth: 1.4, fill: "none" }, `fl${k}`)),
    jsx(Turned, { id: `${id}fi`, rig, xf: pose, profile: FINIAL, ramp: PL_STEEL, spec: 0.9, n: 32 }),
    jsx(Paint, { faces: m.plate, map: plateMap, rig, ramp: PL_PLATE, spec: 0.6 }),
    ticks.map((d, k) => jsx("path", { d, stroke: "#E9EEF3", strokeOpacity: k === 4 ? 0.9 : 0.55, strokeWidth: k === 4 ? 2.4 : 1.4, fill: "none" }, `tk${k}`)),
    jsx(Paint, { faces: m.beam, map: bmap, rig, ramp: PL_STEEL, spec: 0.85 }),
    // the beam's top arris catching the key
    jsx("path", { d: D([[-SC.arm + 8, -7.5], [-60, -15.5], [0, -17.5], [60, -15.5], [SC.arm - 8, -7.5]].map(([x, y]) => worldScr(rig, bmap([x, y, 13.2]))), false), stroke: "#FFFFFF", strokeOpacity: 0.4, strokeWidth: 1.4, fill: "none" }),
    sides.map((s) => jsx(Turned, { id: `${id}kn${s.side}`, rig, xf: s.knob, profile: KNOB, ramp: PL_STEEL, spec: 0.9, n: 24 }, `kn${s.side}`)),
    sides.map((s) => jsx("g", { children: Eye(s) }, `ey${s.side}`)),
    jsx(Turned, { id: `${id}dr`, rig, xf: drumXf, profile: DRUM, ramp: PL_BODY, spec: 0.9, n: 40 }),
    jsx(Turned, { id: `${id}bo`, rig, xf: drumXf, profile: BOSS, ramp: PL_STEEL, spec: 0.95, n: 28 }),
    jsx("path", { d: D(ptrBack), fill: rampAt(PL_STEEL, 0.9), stroke: "#000000", strokeOpacity: 0.35, strokeWidth: 0.8 }),
    sides.map((s) => jsx(Chain, { rig, a: s.eye, b: s.ring }, `ch${s.side}`)),
    sides.map((s) => jsx("g", { children: Ring(s) }, `rg${s.side}`)),
    sides.map((s) => jsx("g", { children: Pan(s) }, `pn${s.side}`)),
    sides.flatMap((s) => s.rim.filter((r) => r.front).map((r, k) => jsx(Chain, { rig, a: s.ring, b: r.p }, `cf${s.side}${k}`)))
  ] });
};
export const scalesCorners = (pose) => {
  const out = [];
  for (const x of [-SC.base.w / 2, SC.base.w / 2]) for (const z of [-SC.base.d / 2, SC.base.d / 2]) for (const y of [-SC.base.h, 0]) out.push(xfApply(pose, [x, y, z]));
  return out;
};
/** the pan's underside centre (world), for the label under it */
export const panFoot = (pose, th, side) => {
  const p = panOf(pose, th, side);
  return [p[0], p[1] + 28, p[2]];
};
export const PIVOT_V = SC.pivotY;
