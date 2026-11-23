// @ts-nocheck
// ★ V36 "Bre-X Gold" — place PENSION (builder F). "The Ontario Teachers' Pension Plan alone lost a hundred million dollars."
//   A bank vault's steel cabinet (pension_vault.tsx) rises from below. On "Ontario Teachers'" its top drawer — the plan's, its
//   engraved nameplate ONTARIO TEACHERS' on it from the first frame — rides out on its slides, full of banded C$ cash bundles
//   (sales_cash.tsx, Video 35's bundle), and the camera pushes in on it. On "lost" the drawer's bottom falls out: its floor plate
//   runs back into the cabinet and the cash drops through row by row, six stacks tumbling down (gravity with air drag, so every
//   edge stays trackable frame to frame) out through the bottom of the frame — they land at the cabinet's foot, out of shot — as
//   C$100M LOST lands on "a hundred million dollars". Then the place pushes out into light (the composition's hand-over) into the
//   "To be fair…" card.
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, rIn, rInOut, rOut } from "./anim";
import { PlaceRoot } from "./shot";
import { CamFn } from "./s3";
import { seeded, travelling } from "./common";
import { L } from "./data";
import { Turn, figure } from "./kit";
import { actionCam, actionCamWindows, still } from "./actioncam";
import { worldScr, worldView, xfApply, xfMul, xfPose, xfRotX, xfRotY, xfRotZ } from "./tk_rig";
import { TK_FLOOR_Y } from "./tk_slab";
import { TkFloor } from "./tk_floor";
import { CB, CashBody, CashContact, CashTopPlanes, cashFace, cashXf } from "./sales_cash";
import { PENSION_LOSS_M } from "./pension_data";
import { DR, DrawerFar, DrawerNear, DrawerPlate, FLOOR_TOP, HATCH, PLATE_TRAVEL, V_CROWN, VT, VaultCabinet, ZF, drawerClip, drawerCorners, drawerShadow, panelZ, vaultCorners } from "./pension_vault";

const RIG = { cx: 540, cy: TK_FLOOR_Y - 1500, persp: 3600, yaw: 16, pitch: -9 };
const X = 540;
const BACK = -420;                                   // the cabinet stands back, so the open drawer comes out to the lens's depth
const POSE = xfPose(X, TK_FLOOR_Y, BACK);
if (PENSION_LOSS_M !== 100) throw new Error("pension: the label's figure is C$100M (pension_data.ts)");
// ── the cash in the drawer: 2 columns × 3 rows of stacks, LAYERS bundles high ──────────────────────────────────────────────
const LAYERS = 5;
const H = CB.H;
const ROW_GAP = 5;
const ROW_Z = [0, 1, 2].map((r) => HATCH.back + HATCH.t + 8 + CB.D / 2 + r * (CB.D + ROW_GAP));
if (ROW_Z[2] + CB.D / 2 > HATCH.front - 4) throw new Error("pension: the front row must sit over the trap");
const COL_U = [-1, 1].map((s) => s * (CB.W / 2 + 5));
if (CB.W + 5 > HATCH.u) throw new Error("pension: the columns must sit over the hatch");
// ★ the fall: gravity with air drag — it starts from rest at G0 and tends to a terminal speed V_TERM (world px a frame), so a bundle's
//   edge never jumps more than ~45 px a frame on screen (popscan tracks it; a straight 3.2 px/f² fall reached ~110 and read as a
//   VANISH), yet it still reads as falling: it accelerates from rest and leaves through the bottom edge (pensionTimes checks when)
const G0 = 4.0, V_TERM = 37;
const fallY = (u) => V_TERM * V_TERM / G0 * Math.log(Math.cosh(G0 * u / V_TERM));
const fallT = (h) => V_TERM / G0 * Math.acosh(Math.exp(h * G0 / (V_TERM * V_TERM)));
const rnd = seeded(1997);
const STACKS = [];
for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
  const out = c === 0 ? -1 : 1;
  STACKS.push({
    c, r,
    u: COL_U[c], z: ROW_Z[r],
    // the floor plate slides back from the front: a row drops once the plate's edge has passed its back edge (front row first);
    //   the left column a half frame after the right
    backEdge: ROW_Z[r] - CB.D / 2,
    lag: c === 0 ? 0.5 : 0,
    vx: out * (0.7 + 0.3 * rnd()),
    dyaw: out * (1.5 + 1.5 * rnd()),
    roll: -out * (5 + 4 * rnd()),
    pitch: (rnd() - 0.5) * 4,
    yaw0: (rnd() - 0.5) * 1.4,
    bundles: Array.from({ length: LAYERS }, (_, k) => ({ du: (rnd() - 0.5) * 3, dz: (rnd() - 0.5) * 2.5, yaw: (rnd() - 0.5) * 0.9, dim: 0.04 + 0.1 * rnd() + 0.12 * (1 - k / (LAYERS - 1)), sheen: 0.15 + 0.35 * rnd(), seed: 4100 + 10 * (r * 2 + c) + k }))
  });
}
const Y_REST = TK_FLOOR_Y + FLOOR_TOP - LAYERS * H / 2;     // a stack's centre in the drawer
const Y_LAND = TK_FLOOR_Y - LAYERS * H / 2;                 // on the floor
const T_FALL = fallT(Y_LAND - Y_REST);
const bounce = (u) => u <= 0 ? 0 : 2 * Math.exp(-u / 2.4) * Math.abs(Math.sin(Math.PI * u / 3.2));
const rot = (yaw, tx, tz) => xfMul(xfRotY(yaw), xfMul(xfRotX(tx), xfRotZ(tz)));
/** every bundle's pose at frame g: { x (cash transform), top (a top bundle), st, k, fall (0 rest … 1 landed), c (stack centre) } */
const cashAt = (t, g, s) => {
  const out = [];
  for (const st of STACKS) {
    const T = t.drop[st.r] + st.lag, dt = g - T;
    let cx = X + st.u, cy = Y_REST, cz = BACK + panelZ(s) + st.z, yaw = st.yaw0, tx = 0, tz = 0, sep = 0, phase = 0;
    if (dt > 0) {
      const tt = Math.min(dt, T_FALL), e = tt / T_FALL, k = Math.sin(Math.PI * e) ** 2;
      cx += st.vx * tt;
      cy += fallY(tt);
      yaw += st.dyaw * (e * e * (3 - 2 * e));
      tx = st.pitch * k;
      tz = st.roll * k;
      sep = 5 * Math.sin(Math.PI * e);
      phase = dt >= T_FALL ? 2 : 1;
      if (phase === 2) cy = Y_LAND - 1.5 * bounce(dt - T_FALL);
    }
    const R = rot(yaw, tx, tz);
    st.bundles.forEach((b, k) => {
      const off = ((LAYERS - 1) / 2 - k) * (H + sep);
      const o = xfApply(R, [b.du, off, b.dz]);
      out.push({ st, k, b, phase, c: [cx, cy, cz], x: cashXf([cx + o[0], cy + o[1], cz + o[2]], yaw + b.yaw, 1, tx, tz) });
    });
  }
  return out;
};
// ── times ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const pensionTimes = (w, end) => {
  for (const k of ["s0", "ontario", "teachers", "plan", "alone", "lost", "k100", "million"]) if (!Number.isFinite(w[k])) throw new Error(`pension: the take has no word frame "${k}"`);
  const t = {
    w,
    end,
    slide: { a: w.ontario - 4, b: w.ontario + 30 },        // the drawer rides out on "Ontario Teachers'"
    plate: { a: w.ontario - 8, b: w.teachers + 14 },        // a light runs across its nameplate
    push: { a: w.ontario - 6, dur: 38 },                    // the camera pushes in on the open drawer
    hatch: w.lost - 8,                                     // the latch lets go: the floor plate starts back (eased in, under the cash);
                                                           //   the front row drops on "lost"
    dip: { a: w.lost - 1, dur: 26 },                        // the camera dips a little after the fall
    loss: { a: w.k100 - 7, b: w.k100 + 13 },                // C$100M LOST lands on "a hundred million"
    crane: end + 2 - 22                                    // the composition's push-light out (HO.pension)
  };
  if (t.slide.b > t.hatch - 8) throw new Error("pension: the drawer must be out and still before the bottom falls out");
  // each row drops as the plate's edge clears its back edge (the plate's ease, inverted)
  //   (the last 12 px of a stack's foot are over the plate's edge as it starts down: it clears them in a third of a frame)
  t.drop = [0, 1, 2].map((r) => t.hatch + plateTime(HATCH.front - (ROW_Z[r] - CB.D / 2) - 12));
  t.plateEnd = t.hatch + plateTime(PLATE_TRAVEL);
  if (Math.abs(t.drop[2] - t.w.lost) > 3) throw new Error("pension: the front row must drop on \"lost\"");
  if (t.loss.b > t.crane) throw new Error("pension: C$100M LOST must be landed before the push-light out");
  // every stack must be wholly out through the frame's bottom edge before the push-light out: the frame's bottom in place
  //   coordinates at the dip framing (less a margin for the parallax zoom), against each stack's highest projected edge
  const aimY = W2S([0, FLOOR_TOP - 40, panelZ(DR.ext) - 120]).y - DRW_UP + DIP;
  //   (the composition's parallax zoom only ever shrinks the visible frame, so the nominal bottom is the worst case; + 8 for its drift)
  const yBottom = aimY + (1920 - 110 - 883.2) / Z_DIP + 8;
  for (const st of STACKS) {
    let u = 0;
    const topAt = (uu) => worldScr(RIG, [X + st.u + st.vx * uu, Y_REST + fallY(uu) - LAYERS * H / 2 - 12, BACK + panelZ(DR.ext) + st.z - CB.D / 2])[1];
    while (u < T_FALL && topAt(u) < yBottom) u += 0.5;
    if (u >= T_FALL) throw new Error(`pension: a stack lands before it leaves the frame (top ${topAt(T_FALL).toFixed(0)} vs frame bottom ${yBottom.toFixed(0)}, aim ${aimY.toFixed(0)})`);
    t.exitAt = Math.max(t.exitAt ?? 0, t.drop[st.r] + st.lag + u);
  }
  if (t.exitAt > t.crane - 2) throw new Error(`pension: the cash must be out of frame before the push-light out (${t.exitAt.toFixed(1)} > ${t.crane - 2}; drops ${t.drop.map((x) => x.toFixed(1))}; aim ${aimY.toFixed(0)} bottom ${yBottom.toFixed(0)} start ${worldScr(RIG, [X, Y_REST - LAYERS * H / 2 - 12, BACK + panelZ(DR.ext) + ROW_Z[0] - CB.D / 2])[1].toFixed(0)})`);
  return t;
};
const slideOf = (t, g) => {
  const e = rInOut(g, t.slide.a, t.slide.b);
  // the end stop: a small rebound as the slides bottom out
  const u = g - t.slide.b, stop = u > 0 ? 4 * Math.exp(-u / 3) * Math.sin(Math.PI * u / 5) : 0;
  return DR.ext * e - stop;
};
// the floor plate's travel: it eases in over PLATE.ease frames to PLATE.cap px a frame and runs on into its slot (its edge, the only
//   part of it seen moving, never passes ~40 px a frame on screen)
const PLATE = { ease: 6, cap: 34 };
const plateDist = (u) => u <= 0 ? 0 : u < PLATE.ease ? PLATE.cap * u * u / (2 * PLATE.ease) : PLATE.cap * (u - PLATE.ease / 2);
const plateTime = (d) => d <= PLATE.cap * PLATE.ease / 2 ? Math.sqrt(2 * PLATE.ease * d / PLATE.cap) : d / PLATE.cap + PLATE.ease / 2;
const plateE = (t, g) => clamp01(plateDist(g - t.hatch) / PLATE_TRAVEL);
// ── the camera ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const lay = (p) => ({ x: p[0], y: p[1] });
const W2S = (q) => lay(worldScr(RIG, xfApply(POSE, q)));
// the drawer framing sits DRW_UP above the drawer (so the drawer is lower in the frame: less for the cash to fall through), and the
//   dip follows the fall DIP px down (the loss's top stays ≥ 450 on screen: geom_sweep)
const DRW_UP = 236, DIP = 14, Z_PUSH = 1.25, Z_DIP = 1.24;
const shots = (t) => {
  const whole = W2S([0, (V_CROWN - 0) / 2 + 30, 0]);
  const drw = W2S([0, FLOOR_TOP - 40, panelZ(DR.ext) - 120]);
  drw.y -= DRW_UP;
  return [
    // the whole cabinet as it rises
    { a: -9999, z: 0.84, push: 0.02, at: still(whole.x, whole.y) },
    // in on the open drawer and its nameplate (room above it for the loss)
    { a: t.push.a, dur: t.push.dur, z: Z_PUSH, push: 0.02, at: still(drw.x, drw.y) },
    // a small dip with the fall (★ integrator: 18, not 30 — with the push-light exit the dip's framing now holds ~10 f before the
    //   push, and at 30 C$100M LOST settled at top y 445, inside the caption headroom: geom_sweep 1485–1488)
    //   (builder F, popscan fix: the framing now sits DRW_UP higher, so the dip can follow the fall DIP px and the loss still clears it)
    { a: t.dip.a, dur: t.dip.dur, z: Z_DIP, push: 0, at: still(drw.x, drw.y + DIP) }
  ];
};
export const pensionCamWindows = (t) => actionCamWindows(shots(t));
export const pensionSfx = (t) => [
  { job: "click", a: t.slide.a, b: t.slide.a + 1, vol: 0.5 },
  // the lock lets go
  { job: "obj", a: t.slide.a, b: t.slide.b, vol: 0.75 },
  // the heavy drawer rides out on its slides
  { job: "click", a: t.slide.b + 1, b: t.slide.b + 2, vol: 0.4 },
  // the slides bottom out
  { job: "click", a: t.hatch, b: t.hatch + 1, vol: 0.6 },
  // the plate's latch lets go
  { job: "mech", a: t.hatch, b: Math.round(t.plateEnd), vol: 0.45 },
  // the floor plate runs back into the cabinet
  { job: "obj", a: Math.round(t.drop[2]), b: Math.round(t.exitAt), vol: 0.65 },
  // the cash drops through and away
  { job: "label", a: t.loss.a, b: t.loss.b, vol: 0.5 }
  // C$100M LOST
];
// ── the place ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const Bundle = ({ id, p, under, top }) => /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
  under && /* @__PURE__ */ (0,jsx_runtime.jsx)(CashContact, { id: `${id}k`, rig: RIG, upper: p.x, lower: under }),
  /* @__PURE__ */ (0,jsx_runtime.jsx)(CashBody, { id, rig: RIG, x: p.x, seed: p.b.seed, dim: p.b.dim }),
  top && /* @__PURE__ */ (0,jsx_runtime.jsx)(CashTopPlanes, { rig: RIG, x: p.x, kh: 1, sheen: p.b.sheen, shade: 0.04, plain: true })
] });
const LossLabel = ({ x, y, on, text }) => {
  if (on <= 3e-3) return null;
  const Wd = 720;
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-label": "the pension's loss", style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: Wd,
    textAlign: "center",
    transformOrigin: "50% 100%",
    transform: `translate(${(x - Wd / 2).toFixed(2)}px, ${(y - 84 + 16 * (1 - on)).toFixed(2)}px) scale(${(0.94 + 0.06 * on).toFixed(4)})`,
    opacity: clamp01(on * 1.4),
    ...figure(84)
  }, children: text });
};
export const BxPension = ({ at, end, w, stage }) => {
  const f = (0,esm.useCurrentFrame)();
  const t = pensionTimes(w, end);
  const s = slideOf(t, f);
  const cash = cashAt(t, f, s);
  const falling = f > t.hatch;
  const plate = plateE(t, f);
  // painter's order: stacks far → near (their centre's view depth), each bottom → top
  const depth = (c) => worldView(RIG, c)[2];
  const byStack = STACKS.map((st) => cash.filter((p) => p.st === st)).sort((A, B) => depth(A[0].c) - depth(B[0].c));
  const clip = drawerClip(RIG, POSE, s);
  const sheen = 520 * rInOut(f, at - 40, at + 24);
  const plateLit = rInOut(f, t.plate.a, t.plate.a + 10) * (1 - rInOut(f, t.plate.b - 10, t.plate.b));
  const landed = cash.filter((p) => p.phase === 2 && p.k === 0);
  const casters = [{ corners: vaultCorners(POSE) }, ...(s > 4 ? [{ corners: drawerCorners(POSE, s), k: 0.7 }] : []), ...landed.map((p) => ({ corners: [...cashFace(p.x, false), ...cashFace(p.x, true)], k: 0.6 }))];
  const crownTop = Math.min(...[-1, 1].flatMap((su) => [-1, 1].map((sw) => worldScr(RIG, xfApply(POSE, [su * (VT.W / 2 + VT.over), V_CROWN, sw * (ZF + VT.over)]))[1])));
  const lossOn = rOut(f, t.loss.a, t.loss.b);
  const stackEls = (key) => byStack.map((ps) => ps.map((p, i) => {
    const under = i > 0 && p.phase !== 1 ? ps[i - 1].x : void 0;
    return /* @__PURE__ */ (0,jsx_runtime.jsx)(Bundle, { id: `pn${key}${p.st.r}${p.st.c}${p.k}`, p, under, top: p.phase === 1 || i === ps.length - 1 }, `${p.st.r}${p.st.c}${p.k}`);
  }));
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(PlaceRoot, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(CamFn, { at: actionCam(shots(t)), children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { "data-probe-leaving": travelling(f, pensionCamWindows(t)), style: { position: "absolute", inset: 0 }, children: /* @__PURE__ */ (0,jsx_runtime.jsxs)(Turn, { at, end, from: -5, to: 3, amp: 0.8, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(TkFloor, { id: "pnF", rig: RIG, at: { x: X + 30, z: BACK + 300 }, reach: 1300, casters, stage, on: 1 - stage }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { "data-probe-object": "the vault cabinet: crown, body, plinth, fifteen safe-deposit doors, the drawer with its nameplate, pull, keyholes, slides and trap flaps, and its cash", style: { position: "absolute", inset: 0 }, children: [
      /* @__PURE__ */ (0,jsx_runtime.jsx)(VaultCabinet, { id: "pnV", rig: RIG, pose: POSE, sheen, shadow: drawerShadow(RIG, POSE, s) }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, clipPath: `path("${clip}")` }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(DrawerFar, { rig: RIG, pose: POSE, s }) }),
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { position: "absolute", inset: 0, clipPath: falling ? void 0 : `path("${clip}")` }, children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)(DrawerPlate, { rig: RIG, pose: POSE, s, e: plate }),
        stackEls("c")
      ] }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", inset: 0, clipPath: `path("${clip}")` }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(DrawerNear, { id: "pnD", rig: RIG, pose: POSE, s, text: L("pensionDrawer"), sheen: 40 * rInOut(f, t.plate.a, t.plate.b) + 300 * rInOut(f, t.slide.a, t.slide.b), plateLit }) })
    ] }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(LossLabel, { x: W2S([0, FLOOR_TOP, panelZ(DR.ext) + DR.t]).x, y: crownTop - 40, on: lossOn, text: L("pensionLoss") })
  ] }) }) }) });
};
