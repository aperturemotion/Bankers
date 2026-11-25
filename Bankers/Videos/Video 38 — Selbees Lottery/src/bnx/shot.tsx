// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import * as react from "react";
import { clamp01, rIn, rInOut, rOut } from "./anim";

const ShotCtx = react.createContext({ ownExit: true, ownEnter: true });
export const useOwn = () => react.useContext(ShotCtx);
export const shotWindow = (at, end, exit, enter) => ({
  from: enter.k === "own" ? at - 2 : Math.min(at - 2, enter.at),
  to: exit.k === "own" ? end + 2 : Math.max(end + 2, exit.at + exit.dur + 1)
});
const PIVOT = { x: 540, y: 883 };
const CRANE = 2e3;
const PAN = 1500;
const YAW = 7, PITCH = 5, ARC = 0;
export const shotPose = (f, exit, enter) => {
  let tx = 0, ty = 0, sc = 1, op = 1, ox = PIVOT.x, oy = PIVOT.y, yaw = 0, pitch = 0, arc = 1;
  if (enter.k === "panFromR" || enter.k === "panFromL") {
    const q = rInOut(f, enter.at, enter.at + enter.dur), s = enter.k === "panFromR" ? 1 : -1;
    tx += s * PAN * (1 - q);
    if (q > 0 && q < 1) {
      yaw += -s * YAW * Math.sin(Math.PI * q);
      arc *= 1 - ARC * Math.sin(Math.PI * q);
    }
  }
  if (enter.k === "fromAbove" || enter.k === "fromBelow") {
    const q = rInOut(f, enter.at, enter.at + enter.dur), s = enter.k === "fromBelow" ? 1 : -1;
    ty += s * CRANE * (1 - q);
    if (q > 0 && q < 1) {
      pitch += s * PITCH * Math.sin(Math.PI * q);
      arc *= 1 - ARC * Math.sin(Math.PI * q);
    }
  }
  if (enter.k === "large") {
    const q = rOut(f, enter.at, enter.at + enter.dur);
    if (q < 1) {
      sc *= enter.z + (1 - enter.z) * q;
      ox = enter.fx;
      oy = enter.fy;
    }
    op *= rOut(f, enter.at, enter.at + 8);
  }
  if (enter.k === "approach") {
    const q = rOut(f, enter.at, enter.at + enter.dur);
    sc *= 0.6 + 0.4 * q;
    op *= rOut(f, enter.at, enter.at + 10);
  }
  if (exit.k === "panL" || exit.k === "panR") {
    const p = rInOut(f, exit.at, exit.at + exit.dur), s = exit.k === "panL" ? -1 : 1;
    tx += s * PAN * p;
    if (p > 0 && p < 1) {
      yaw += s * YAW * Math.sin(Math.PI * p);
      arc *= 1 - ARC * Math.sin(Math.PI * p);
    }
  }
  if (exit.k === "craneUp" || exit.k === "craneDown") {
    const p = rInOut(f, exit.at, exit.at + exit.dur), s = exit.k === "craneUp" ? 1 : -1;
    ty += s * CRANE * p;
    if (p > 0 && p < 1) {
      pitch += -s * PITCH * Math.sin(Math.PI * p);
      arc *= 1 - ARC * Math.sin(Math.PI * p);
    }
  }
  if (exit.k === "zoom") {
    const p = rIn(f, exit.at, exit.at + exit.dur);
    if (p > 0) {
      sc *= 1 + (exit.z - 1) * p;
      ox = exit.fx;
      oy = exit.fy;
    }
    op *= 1 - rInOut(f, exit.at + exit.dur * 0.45, exit.at + exit.dur);
  }
  if (exit.k === "pushLight") {
    const p = rIn(f, exit.at, exit.at + exit.dur);
    sc *= 1 + 0.9 * p;
    op *= 1 - rInOut(f, exit.at + exit.dur * 0.5, exit.at + exit.dur);
  }
  if (exit.k === "pull") {
    const p = rInOut(f, exit.at, exit.at + exit.dur);
    sc *= 1 - 0.58 * p;
    op *= 1 - rInOut(f, exit.at + exit.dur * 0.45, exit.at + exit.dur);
  }
  return { tx, ty, sc, ox, oy, op, yaw, pitch, arc };
};
export const Shot = ({ exit, enter, children }) => {
  const f = (0,esm.useCurrentFrame)();
  const { tx, ty, sc, ox, oy, op, yaw, pitch, arc } = shotPose(f, exit, enter);
  if (op <= 1e-3) return null;
  const handing = exit.k !== "own" && f >= exit.at && f <= exit.at + exit.dur || enter.k !== "own" && f >= enter.at && f <= enter.at + enter.dur;
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(ShotCtx.Provider, { value: { ownExit: exit.k === "own", ownEnter: enter.k === "own" }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(
    "div",
    {
      "data-probe-leaving": handing ? `hand-over (${exit.k !== "own" && f >= exit.at ? exit.k : enter.k})` : void 0,
      style: {
        position: "absolute",
        inset: 0,
        opacity: clamp01(op),
        transformOrigin: `${PIVOT.x}px ${PIVOT.y}px`,
        transform: `perspective(1400px) rotateY(${yaw.toFixed(3)}deg) rotateX(${(pitch + 0.15).toFixed(3)}deg) scale(${arc.toFixed(5)})`
      },
      children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: {
        position: "absolute",
        inset: 0,
        transformOrigin: `${ox}px ${oy}px`,
        transform: `perspective(1200px) translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0px) scale(${sc.toFixed(5)}) rotateX(0.15deg)`
      }, children })
    }
  ) });
};
export const LIGHT_DEPTH = 0.4;
export const lightXf = (p) => {
  const k = LIGHT_DEPTH;
  const s = (1 + k * (p.sc - 1)) * (1 + k * (p.arc - 1));
  return { tx: k * p.tx, ty: k * p.ty, s, ox: p.ox, oy: p.oy + 110 };
};
// ★ V36 (Timur, 2026-11-23: "the top of the scene basically cut off … just a small piece of blue screen"): a place's clip reached
//   only 40 px above the frame, and the close framings (claim's stack, crack's cupel) showed its edge as a 55–70 px band of the
//   bare field. 240 px clears it. The crane guard no longer binds: V36's places hand over by SLIDES (PAN), and the only rises
//   (felderhof, rule) come up under hero cards, not under another place.
const EXTEND_X = 140, EXTEND_Y = 240;
if (2 * EXTEND_X >= PAN - 1080) throw new Error("shot.tsx: a place's reach would meet its neighbour's on a slide");
export const PlaceRoot = ({ children, up = 0 }) => /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: -EXTEND_X, top: -EXTEND_Y - up, width: 1080 + 2 * EXTEND_X, height: 1920 + 2 * EXTEND_Y + up, overflow: "hidden" }, children: /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { position: "absolute", left: EXTEND_X, top: EXTEND_Y + up, width: 1080, height: 1920 }, children }) });
